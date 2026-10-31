// 决定#31（剧本/README_轉蛋服裝設計.md §4、§5.1、§5.2；作者核#14「同意，按建议执行」）：
//   - 新年、圣诞、端午、周年庆四类改为「典藏」：id 不变，已拥有的照样能穿，退出常驻抽取表，显示名改成世界内的节庆；
//   - 泳装、女仆暂时原样留在常驻池（重画与新增三类随美术阶段一起做，这里还不能出现）；
//   - BRANCH_SCENES 拿掉银轨号列车 / 骑士联盟 / 月蚀神社这些外传用语，改成将来的番外入口，仍是 available:false；
//   - 换衣间给典藏单列一组；旧存档（data/saves.json 的 ownedCostumes / equippedCostumes）不用迁移。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  CHARACTER_POOL, COSTUME_CATALOG, COSTUME_POOL, COSTUME_PULL_TABLE, COSTUME_TYPE_META, GACHA_RATES,
  publicPools, pullGacha, viewCostume
} from '../game/gacha.mjs';
import { BRANCH_SCENES, COSTUME_LABELS, COSTUME_TYPES, equipCostume } from '../game/costume.mjs';
import { createPlayerAccount } from '../game/membership.mjs';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(projectDir, file), 'utf8');

const ARCHIVE = { christmas: '冬灯节服', newyear: '新历祭服', anniversary: '纪念日礼服', duanwu: '龙舟祭服' };
const STANDING = { swimsuit: '夏日度假服', maid: '女仆服' };
// 旧稀有度保留（服装稿 §5.1）
const RARITY = { swimsuit: 5, maid: 3, christmas: 4, newyear: 4, anniversary: 5, duanwu: 3 };

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── 数据 ───

test('四类改为典藏、用世界内节庆名；泳装与女仆原样留在常驻池；不提前加入新三类', () => {
  assert.deepEqual(Object.keys(COSTUME_TYPE_META), ['swimsuit', 'maid', 'christmas', 'newyear', 'anniversary', 'duanwu']);
  for (const [type, label] of Object.entries(ARCHIVE)) {
    assert.deepEqual(COSTUME_TYPE_META[type], { label, rarity: RARITY[type], status: 'archive' }, type);
  }
  for (const [type, label] of Object.entries(STANDING)) {
    assert.deepEqual(COSTUME_TYPE_META[type], { label, rarity: RARITY[type], status: 'current' }, type);
  }
  for (const later of ['wedding', 'sportwear', 'office', 'resort']) {
    assert.equal(COSTUME_TYPE_META[later], undefined, `${later} comes with the art phase`);
    assert.equal(BRANCH_SCENES[later], undefined, `${later} 番外 entry comes with the art phase`);
  }
  // costume.mjs 的类型与标签都来自同一张表
  assert.deepEqual(COSTUME_TYPES, Object.keys(COSTUME_TYPE_META));
  assert.deepEqual(COSTUME_LABELS, { ...STANDING, ...ARCHIVE });
});

test('服装目录保留全部旧 id（8 人 × 6 类）；抽取表只剩常驻的 16 件', () => {
  assert.equal(COSTUME_POOL, COSTUME_CATALOG, 'COSTUME_POOL stays the full catalog (server grant-all uses it)');
  assert.equal(COSTUME_CATALOG.length, CHARACTER_POOL.length * 6);
  for (const heroine of CHARACTER_POOL) {
    for (const type of Object.keys(RARITY)) {
      const entry = COSTUME_CATALOG.find((c) => c.id === `${heroine.id}_${type}`);
      assert.ok(entry, `${heroine.id}_${type} still exists`);
      assert.equal(entry.rarity, RARITY[type]);
      assert.equal(entry.file, `/assets/costumes/${heroine.id}_${type}.svg`, 'art paths unchanged');
      assert.equal(entry.name, `${heroine.name.split('·')[0]}·${COSTUME_TYPE_META[type].label}`);
    }
  }
  assert.equal(COSTUME_PULL_TABLE.length, CHARACTER_POOL.length * 2);
  assert.deepEqual([...new Set(COSTUME_PULL_TABLE.map((c) => c.type))].sort(), ['maid', 'swimsuit']);
  assert.ok(COSTUME_PULL_TABLE.every((c) => c.status === 'current'));
  // 旧名不再出现在任何服装文本里
  const text = JSON.stringify(COSTUME_CATALOG);
  for (const old of ['新年服', '圣诞', '端午', '周年庆']) assert.ok(!text.includes(old), `「${old}」 still in the catalog`);
});

test('召唤抽不到典藏；公示的服饰池就是抽取表，概率表只列表里存在的稀有度（契约 K-11）', (t) => {
  t.mock.method(Math, 'random', mulberry32(31));
  const account = createPlayerAccount('典藏');
  account.diamonds = 10 ** 9;
  const seen = new Set();
  for (let i = 0; i < 300; i += 1) {
    for (const item of pullGacha(account, 'costume', 10).results) {
      assert.equal(COSTUME_TYPE_META[item.type].status, 'current', `${item.id} drawn`);
      seen.add(item.id);
    }
  }
  assert.deepEqual([...seen].sort(), COSTUME_PULL_TABLE.map((c) => c.id).sort(), 'every standing costume can be drawn');
  assert.ok(account.ownedCostumes.every((id) => !Object.keys(ARCHIVE).includes(id.split('_').pop())));

  const published = publicPools([]).costumes;
  assert.deepEqual(published.map((c) => c.id), COSTUME_PULL_TABLE.map((c) => c.id));
  assert.deepEqual(GACHA_RATES.costume, { 5: 0.03, 3: 0.97 });
  const rarities = new Set(published.map((c) => c.rarity));
  assert.deepEqual([...rarities].sort(), Object.keys(GACHA_RATES.costume).map(Number).sort());
});

test('旧存档里的典藏照样能穿；没拥有、或不属于她的仍然拒绝', () => {
  const account = createPlayerAccount('旧档');
  // data/saves.json 里旧账户的样子：只有 <女主>_<类型> 的 id
  account.ownedCharacters = ['lia', 'mia'];
  account.ownedCostumes = ['lia_newyear', 'lia_christmas', 'mia_duanwu', 'lia_maid'];
  account.equippedCostumes = { lia: 'lia_christmas' };

  assert.equal(equipCostume(account, 'lia', 'lia_newyear').ok, true);
  assert.equal(account.equippedCostumes.lia, 'lia_newyear');
  assert.equal(equipCostume(account, 'mia', 'mia_duanwu').ok, true);
  assert.equal(equipCostume(account, 'lia', 'lia_anniversary').message, '尚未拥有该服装。');
  assert.equal(equipCostume(account, 'lia', 'mia_duanwu').message, '该服装不属于此角色。');
  assert.equal(equipCostume(account, 'lia', 'lia_maid').ok, true, 'standing costumes unchanged');
  assert.deepEqual(account.equippedCostumes, { lia: 'lia_maid', mia: 'mia_duanwu' });
});

test('典藏服装同样跟着登场闸门封存；封存名用新的节庆名', () => {
  const serenaWinter = COSTUME_CATALOG.find((c) => c.id === 'serena_christmas');
  const sealed = viewCostume(serenaWinter, []);
  assert.equal(sealed.sealed, true);
  assert.equal(sealed.name, '？？？·冬灯节服');
  assert.equal(sealed.file, undefined);
  assert.equal(sealed.status, 'archive');
  assert.deepEqual(viewCostume(serenaWinter, ['ch011']), { ...serenaWinter, sealed: false });
});

// ─── 番外入口（原「分支剧情」）───

test('BRANCH_SCENES 改成将来的番外入口：没有外传用语、没有女主名字或故国，全部「敬请期待」', () => {
  assert.deepEqual(Object.keys(BRANCH_SCENES).sort(), [...COSTUME_TYPES].sort());
  const expected = {
    swimsuit: { extras: ['ex002', 'ex009'], unlockAfter: 'ch015', title: '退潮的沙洲' },
    maid: { extras: ['ex001'], unlockAfter: 'ch010', title: '桥头旅店的帮工日' },
    christmas: { extras: ['ex005'], unlockAfter: 'ch020', title: '冬灯夜' },
    newyear: { extras: ['ex006'], unlockAfter: 'ch022', title: '新历祭' },
    anniversary: { extras: ['ex008'], unlockAfter: 'ch023', title: '一路走来的纪念日' },
    duanwu: { extras: ['ex009'], unlockAfter: 'ch025', title: '龙舟祭' }
  };
  for (const [type, scene] of Object.entries(BRANCH_SCENES)) {
    assert.equal(scene.available, false, type);
    assert.equal(scene.sceneId, `branch_${type}`, 'sceneId kept for the equip response');
    assert.deepEqual({ extras: scene.extras, unlockAfter: scene.unlockAfter, title: scene.title }, expected[type], type);
    assert.ok(scene.description && scene.description.length > 10, `${type} has an entry text`);
  }
  // /api/costume 把整张表发给所有玩家：不能有外传（银轨号）用语、现实节日名，也不能提前露出女主
  const text = JSON.stringify(BRANCH_SCENES);
  const banned = ['列车', '银轨', '餐车', '骑士联盟', '月蚀', '神社', '圣诞', '端午', '周年', '新年', '粽'];
  for (const word of banned) assert.ok(!text.includes(word), `「${word}」 in BRANCH_SCENES`);
  for (const heroine of CHARACTER_POOL) {
    const [given, surname] = heroine.name.split('·');
    for (const word of [given, surname, heroine.nation, heroine.title]) assert.ok(!text.includes(word), `「${word}」 (${heroine.id}) in BRANCH_SCENES`);
  }
});

// ─── 换衣间（前端）───

test('换衣间：典藏单列一组，只列已拥有的；番外入口写「番外 · 敬请期待」', () => {
  const app = read('public/app.js');
  assert.match(app, /function archiveCostumeTypes\(types, costumePool\)/);
  assert.match(app, /const archived = archiveCostumeTypes\(types, data\.costumePool\);/);
  assert.match(app, /class="costume-archive"[^>]*aria-label="典藏"/);
  assert.match(app, /archived\.has\(type\) && ownedCostumes\.includes\(`\$\{charId\}_\$\{type\}`\)/, 'only owned archive costumes get a slot');
  assert.match(app, /番外「\$\{escapeHtml\(branches\[equippedType\]\.title\)\}」· 敬请期待/);
  assert.ok(!app.includes('分支剧情「'), 'the old 「分支剧情」 wording is gone');
  assert.ok(!app.includes('6 套主题服饰'), 'the gacha page no longer promises six standing types');
  const css = read('public/styles.css');
  assert.match(css, /\.costume-archive \{/);
  assert.match(css, /\.costume-archive-tag \{/);
});

// ─── HTTP：旧存档重启后照样能穿典藏 ───

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

async function startServer(t, extraEnv) {
  const port = await freePort();
  const env = { ...process.env, AI_MODE: 'demo', HOST: '127.0.0.1', PORT: String(port), NODE_ENV: 'test', DEMO_TOOLS: '1', ...extraEnv };
  delete env.ADMIN_KEY;
  const child = spawn(process.execPath, ['server.mjs'], { cwd: projectDir, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  child.stdout.on('data', (chunk) => { logs += chunk; });
  child.stderr.on('data', (chunk) => { logs += chunk; });
  const exited = new Promise((resolve) => child.once('exit', resolve));
  const stop = async () => {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
    await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 4000))]);
  };
  t.after(stop);
  const base = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 8000;
  for (;;) {
    if (child.exitCode !== null) throw new Error(`server exited early:\n${logs}`);
    try { if ((await fetch(`${base}/api/health`)).ok) break; } catch { /* starting */ }
    if (Date.now() > deadline) throw new Error(`server did not start:\n${logs}`);
    await new Promise((resolve) => setTimeout(resolve, 60));
  }
  return { base, stop };
}

async function api(base, pathname, body) {
  const response = await fetch(`${base}${pathname}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  return { status: response.status, json: JSON.parse(text), text };
}

test('HTTP: an old save that owns and wears 典藏 costumes still works after a restart; the pool shows only the standing table', { timeout: 30000 }, async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'moonlit-archive-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const saveFile = path.join(dir, 'saves.json');
  const env = { PERSIST: '1', SAVE_FILE: saveFile };

  // 第一次启动：建账户，通关到第五章（莉亚登场并入队），然后正常关机写盘
  let srv = await startServer(t, env);
  const playerId = (await api(srv.base, '/api/account/create', { playerName: '旧档' })).json.account.id;
  for (const chapterId of ['ch004', 'ch005']) assert.equal((await api(srv.base, '/api/story/progress', { playerId, chapterId })).status, 200);
  await srv.stop();

  // 模拟决定#31 之前的存档：已经抽到并穿着旧的节庆服
  const save = JSON.parse(fs.readFileSync(saveFile, 'utf8'));
  const stored = save.playerAccounts[playerId];
  assert.ok(stored.ownedCharacters.includes('lia'));
  stored.ownedCostumes = ['lia_newyear', 'lia_christmas', 'lia_maid', 'mia_duanwu'];
  stored.equippedCostumes = { lia: 'lia_christmas' };
  fs.writeFileSync(saveFile, JSON.stringify(save));

  srv = await startServer(t, env);
  const wardrobe = (await api(srv.base, `/api/costume?playerId=${playerId}`)).json;
  assert.deepEqual(wardrobe.ownedCostumes, ['lia_newyear', 'lia_christmas', 'lia_maid', 'mia_duanwu']);
  assert.deepEqual(wardrobe.equipped, { lia: 'lia_christmas' });
  assert.deepEqual(wardrobe.types, { ...STANDING, ...ARCHIVE });
  // 常驻池里没有典藏：前端靠这一点把典藏单列一组
  assert.deepEqual([...new Set(wardrobe.costumePool.map((c) => c.type))].sort(), ['maid', 'swimsuit']);
  assert.equal(wardrobe.branches.christmas.title, '冬灯夜');
  assert.ok(!JSON.stringify(wardrobe).includes('米娅'), 'no pre-debut name leaks through the 番外 entries');

  const equip = (characterId, costumeId) => api(srv.base, '/api/costume/equip', { playerId, characterId, costumeId });
  let r = await equip('lia', 'lia_newyear');
  assert.equal(r.status, 200, r.text);
  assert.equal(r.json.equipped.costumeId, 'lia_newyear');
  assert.equal(r.json.branchScene.title, '新历祭');
  assert.equal(r.json.branchScene.available, false);
  r = await equip('lia', 'lia_anniversary');
  assert.equal(r.status, 400, 'not owned');

  const pools = (await api(srv.base, `/api/gacha/pools?playerId=${playerId}`)).json;
  assert.deepEqual(pools.costumes.map((c) => c.id), COSTUME_PULL_TABLE.map((c) => c.id));
  assert.deepEqual(pools.rates.costume, { 3: 0.97, 5: 0.03 });

  // 演示工具「一键解锁全部服装」仍然发放完整目录（含典藏）
  const granted = (await api(srv.base, '/api/costume/grant-all', { playerId })).json;
  assert.equal(granted.costumes, COSTUME_CATALOG.length);
});
