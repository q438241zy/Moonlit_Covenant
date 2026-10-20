/**
 * 存档持久化（轨道 V5）
 *
 * 服务器的全部玩家状态（外传会话、账户、卡牌对局、AI 设置）原本只放在内存里，进程一重启就静默消失。
 * 这里把它们写进一个 JSON 文件：
 *   - 默认路径 <项目根>/data/saves.json，按本文件位置定位，不依赖启动时的工作目录；
 *   - SAVE_FILE=<路径> 可改位置（相对路径以项目根为基准）；
 *   - PERSIST=0 关闭持久化；PERSIST=1 强制打开；
 *     未设置时默认打开，但在 node --test 的子进程里（NODE_TEST_CONTEXT）或 NODE_ENV=test 时默认关闭，免得测试写脏 data/。
 * 写入方式：状态变更后最多等 debounceMs（默认 1 秒）合并成一次写；先写同目录临时文件并 fsync，再 rename 覆盖正式文件
 * （Windows 上 rename 也能覆盖已有文件，偶发的 EPERM/EBUSY 会重试几次）。
 * 读到损坏的存档时，把它改名为 <文件名>.corrupt-<时间戳> 留作排查，然后以空状态启动。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_SAVE_FILE = path.join(PROJECT_ROOT, 'data', 'saves.json');
export const SAVE_VERSION = 1;

const OFF = new Set(['0', 'false', 'off', 'no']);
const ON = new Set(['1', 'true', 'on', 'yes']);

/** 根据环境变量决定是否持久化、写到哪里。 */
export function resolvePersistConfig(env = process.env) {
  const flag = String(env.PERSIST ?? '').trim().toLowerCase();
  let enabled;
  let reason;
  if (OFF.has(flag)) {
    enabled = false;
    reason = 'PERSIST=0';
  } else if (ON.has(flag)) {
    enabled = true;
    reason = 'PERSIST=1';
  } else if (env.NODE_TEST_CONTEXT || env.NODE_ENV === 'test') {
    enabled = false;
    reason = '测试环境默认关闭';
  } else {
    enabled = true;
    reason = '默认开启';
  }
  const custom = String(env.SAVE_FILE ?? '').trim();
  const file = custom ? path.resolve(PROJECT_ROOT, custom) : DEFAULT_SAVE_FILE;
  return { enabled, file, reason };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/** 存档文件的最低结构要求；不满足就当作损坏处理。 */
export function isValidSave(data) {
  if (!isPlainObject(data) || data.version !== SAVE_VERSION) return false;
  for (const key of ['sessions', 'playerAccounts', 'battles', 'playerSettings']) {
    if (data[key] !== undefined && !isPlainObject(data[key])) return false;
  }
  return true;
}

function timestampTag(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

const sleepSync = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const RETRY_CODES = new Set(['EPERM', 'EBUSY', 'EACCES']);

function renameWithRetrySync(from, to) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      fs.renameSync(from, to);
      return;
    } catch (error) {
      if (attempt >= 4 || !RETRY_CODES.has(error.code)) throw error;
      sleepSync(40 * (attempt + 1));
    }
  }
}

// 后台写盘的最后一步：每次尝试前先问 stillWanted()，再用同步 rename（一次系统调用，微秒级）。
// 不能用 fs.promises.rename：它排进 libuv 线程池后，主线程可能先处理退出信号、flushSync 写好更新的存档，
// 线程池里这次旧快照的 rename 随后才执行，就会把更新的存档盖掉。检查和 rename 都在主线程上同步完成，中间不会插进 flushSync。
// 只在 Windows 偶发的 EPERM / EBUSY 时异步等待重试，等待期间不阻塞请求。返回 false 表示已不需要这份快照。
async function renameWithRetry(from, to, stillWanted = () => true) {
  for (let attempt = 0; ; attempt += 1) {
    if (!stillWanted()) return false;
    try {
      fs.renameSync(from, to);
      return true;
    } catch (error) {
      if (attempt >= 4 || !RETRY_CODES.has(error.code)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 40 * (attempt + 1)));
    }
  }
}

/**
 * 创建存档仓库。
 * @param {object} options
 * @param {boolean} options.enabled 是否真的读写磁盘
 * @param {string} options.file 存档文件绝对路径
 * @param {() => object} options.snapshot 返回要写入的完整状态（会被 JSON.stringify）
 * @param {number} [options.debounceMs=1000] 第一次变更后最多等待多久写盘
 * @param {Console} [options.logger=console]
 */
export function createSaveStore({ enabled, file, snapshot, debounceMs = 1000, logger = console }) {
  const dir = path.dirname(file);
  const base = path.basename(file);
  let active = Boolean(enabled);
  let timer = null;
  let writing = null;
  let dirty = false;
  let closed = false;
  let seq = 0;
  let lastErrorKey = '';
  let lastErrorAt = 0;

  const tmpName = () => path.join(dir, `.${base}.${process.pid}.${seq += 1}.tmp`);

  function reportWriteError(error) {
    const key = error?.code || error?.message || 'unknown';
    const now = Date.now();
    // 同一种错误一分钟只打印一次，避免磁盘只读时每秒刷屏
    if (key === lastErrorKey && now - lastErrorAt < 60_000) return;
    lastErrorKey = key;
    lastErrorAt = now;
    logger.error(`[存档] 写入 ${file} 失败：${error?.message || error}`);
  }

  function serialize() {
    return JSON.stringify(snapshot());
  }

  function removeStaleTemps() {
    try {
      for (const name of fs.readdirSync(dir)) {
        if (name.startsWith(`.${base}.`) && name.endsWith('.tmp')) {
          try { fs.unlinkSync(path.join(dir, name)); } catch { /* 留给下次 */ }
        }
      }
    } catch { /* 目录不存在 */ }
  }

  /** 读取存档；不存在返回 null；损坏则改名留档并返回 null。 */
  function load() {
    if (!active) return null;
    removeStaleTemps();
    let raw;
    try {
      raw = fs.readFileSync(file, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      // 读不了（权限、是目录等）就不要再写，以免覆盖掉玩家真正的存档
      active = false;
      logger.error(`[存档] 无法读取 ${file}（${error.code || error.message}），本次运行不再写入存档。`);
      return null;
    }
    let data = null;
    try {
      data = JSON.parse(raw.replace(/^﻿/, ''));
    } catch {
      data = null;
    }
    if (isValidSave(data)) return data;
    const corrupt = `${file}.corrupt-${timestampTag()}`;
    try {
      fs.renameSync(file, corrupt);
      logger.warn(`[存档] ${file} 已损坏，已改名为 ${path.basename(corrupt)}，以空存档启动。`);
    } catch (error) {
      active = false;
      logger.error(`[存档] ${file} 已损坏且无法改名（${error.code || error.message}），本次运行不再写入存档。`);
    }
    return null;
  }

  async function writeAsync() {
    dirty = false;
    let json;
    try {
      json = serialize();
    } catch (error) {
      reportWriteError(error);
      return;
    }
    const tmp = tmpName();
    let handle;
    try {
      await fs.promises.mkdir(dir, { recursive: true });
      handle = await fs.promises.open(tmp, 'w');
      await handle.writeFile(json, 'utf8');
      await handle.sync();
      await handle.close();
      handle = null;
      if (!(await renameWithRetry(tmp, file, () => !closed))) {
        // flushSync 已经写过更新的版本，这份旧快照作废
        await fs.promises.unlink(tmp).catch(() => {});
        return;
      }
      lastErrorKey = '';
    } catch (error) {
      if (handle) await handle.close().catch(() => {});
      await fs.promises.unlink(tmp).catch(() => {});
      reportWriteError(error);
    }
  }

  function runWrite() {
    timer = null;
    if (!active || closed) return Promise.resolve();
    if (writing) {
      // 上一次还没写完：写完后再排一次
      dirty = true;
      return writing;
    }
    writing = writeAsync().finally(() => {
      writing = null;
      if (dirty && !closed) schedule();
    });
    return writing;
  }

  /** 标记状态已变更；第一次标记后最多 debounceMs 写一次盘（持续有请求也不会无限推迟）。 */
  function schedule() {
    if (!active || closed) return;
    dirty = true;
    if (timer || writing) return;
    timer = setTimeout(runWrite, debounceMs);
    timer.unref?.();
  }

  /** 立即异步写盘（测试与集成用）。 */
  async function flush() {
    if (!active || closed) return;
    if (writing) await writing;
    if (timer) { clearTimeout(timer); timer = null; }
    await runWrite();
  }

  /** 同步写盘并停止后续写入：用于进程退出前（SIGINT / SIGTERM / SIGHUP）。 */
  function flushSync() {
    if (!active || closed) return false;
    closed = true;
    if (timer) { clearTimeout(timer); timer = null; }
    const tmp = tmpName();
    try {
      const json = serialize();
      fs.mkdirSync(dir, { recursive: true });
      const fd = fs.openSync(tmp, 'w');
      try {
        fs.writeFileSync(fd, json, 'utf8');
        fs.fsyncSync(fd);
      } finally {
        fs.closeSync(fd);
      }
      renameWithRetrySync(tmp, file);
      return true;
    } catch (error) {
      try { fs.unlinkSync(tmp); } catch { /* 无临时文件 */ }
      reportWriteError(error);
      return false;
    }
  }

  return {
    get enabled() { return active; },
    file,
    load,
    schedule,
    flush,
    flushSync
  };
}

const BATTLE_UID = /^u\d+$/;

/**
 * 卡牌对局里的实例 uid（u1、u2…）来自 cards/battle.mjs 的进程内计数器，重启后会从 u1 重新数，
 * 恢复出来的对局一抽牌就会和场上、手牌里的旧 uid 撞号。恢复时把旧 uid 统一加上本次启动的前缀，
 * 新生成的 uid 永远是 u<数字>，两者不可能相同。
 */
export function rekeyBattleUids(state, prefix) {
  const walk = (value) => {
    if (typeof value === 'string') return BATTLE_UID.test(value) ? `${prefix}${value}` : value;
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i += 1) value[i] = walk(value[i]);
      return value;
    }
    if (value && typeof value === 'object') {
      for (const key of Object.keys(value)) value[key] = walk(value[key]);
    }
    return value;
  };
  return walk(state);
}
