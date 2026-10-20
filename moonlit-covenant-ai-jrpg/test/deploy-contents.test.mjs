// 轨道 O：部署内容与启动链的回归测试
// - O1：按 Dockerfile 的 COPY 行（并遵守 .dockerignore）拼出镜像里的 /app，真的启动一次 server.mjs；
//       漏掉 cards/ 或 scenario/ 时必须启动失败（证明这条测试能抓住漏 COPY）。
// - O2：npm 脚本不用 POSIX 专有的 `VAR=值` 前缀；start-demo.cmd 是 CRLF；start-demo.sh 能从别的目录启动。
// - O3：`npm run check` 走 tools/check-syntax.mjs，覆盖 public/story/player.js，注入语法错误时会失败。
// - O4：data/ 不进仓库、不进镜像。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import net from 'node:net';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { collectFiles } from '../tools/check-syntax.mjs';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'moonlit-o-'));
const children = new Set();
test.after(() => {
  for (const child of children) if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

const read = (name) => fs.readFileSync(path.join(projectDir, name), 'utf8');

// ─── Dockerfile / .dockerignore 解析 ───

/** 把 Dockerfile 拆成指令列表（处理续行、注释），返回 [{ op, args }]。 */
export function parseDockerfile(text) {
  const instructions = [];
  let buffer = '';
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/^\s+/, '');
    if (!buffer && (line === '' || line.startsWith('#'))) continue;
    if (/\\\s*$/.test(line)) {
      buffer += `${line.replace(/\\\s*$/, '')} `;
      continue;
    }
    const full = `${buffer}${line}`.trim();
    buffer = '';
    if (!full || full.startsWith('#')) continue;
    const match = full.match(/^(\S+)\s*(.*)$/);
    instructions.push({ op: match[1].toUpperCase(), args: match[2] });
  }
  return instructions;
}

const parseJsonArray = (args) => (args.trim().startsWith('[') ? JSON.parse(args) : null);

/** 从指令里取出镜像布局：WORKDIR、COPY（[{ sources, dest }]）、ENV、CMD。 */
export function describeImage(text) {
  let workdir = '/';
  const copies = [];
  const env = {};
  let cmd = null;
  for (const { op, args } of parseDockerfile(text)) {
    if (op === 'WORKDIR') {
      workdir = path.posix.resolve(workdir, args.trim());
    } else if (op === 'COPY' || op === 'ADD') {
      const flagMatch = args.match(/^(?:--\S+\s+)*/);
      const flags = flagMatch[0].split(/\s+/).filter(Boolean);
      if (flags.some((f) => f.startsWith('--from'))) continue; // 多阶段构建的产物，不来自构建上下文
      const rest = args.slice(flagMatch[0].length);
      const paths = parseJsonArray(rest) || rest.split(/\s+/).filter(Boolean);
      assert.ok(paths.length >= 2, `无法解析的 ${op}：${args}`);
      const dest = paths.at(-1);
      copies.push({ sources: paths.slice(0, -1), dest: path.posix.resolve(workdir, dest) + (dest.endsWith('/') ? '/' : '') });
    } else if (op === 'ENV') {
      const pairs = args.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
      if (pairs.length && !pairs[0].includes('=')) {
        env[pairs[0]] = pairs.slice(1).join(' ');
      } else {
        for (const pair of pairs) {
          const at = pair.indexOf('=');
          env[pair.slice(0, at)] = pair.slice(at + 1).replace(/^(["'])(.*)\1$/, '$2');
        }
      }
    } else if (op === 'CMD') {
      cmd = parseJsonArray(args) || ['sh', '-c', args];
    }
  }
  return { workdir, copies, env, cmd };
}

/** .dockerignore → 匹配函数（相对构建上下文的 posix 路径；规则按顺序生效，支持 ! 反选、* ? **）。 */
export function dockerignoreMatcher(text) {
  const rules = [];
  for (const raw of text.split(/\r?\n/)) {
    let line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const negate = line.startsWith('!');
    if (negate) line = line.slice(1).trim();
    line = path.posix.normalize(line).replace(/^\/+/, '').replace(/\/+$/, '');
    let source = '';
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '*' && line[i + 1] === '*') {
        source += '.*';
        i += 1;
        if (line[i + 1] === '/') i += 1;
      } else if (ch === '*') source += '[^/]*';
      else if (ch === '?') source += '[^/]';
      else source += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
    rules.push({ negate, re: new RegExp(`^${source}$`) });
  }
  return (rel) => {
    const segments = rel.split('/');
    const prefixes = segments.map((_, i) => segments.slice(0, i + 1).join('/'));
    let ignored = false;
    for (const { negate, re } of rules) {
      if (prefixes.some((p) => re.test(p))) ignored = !negate;
    }
    return ignored;
  };
}

/** 按 COPY 行把构建上下文里的文件复制到 imageRoot（模拟镜像文件系统），返回镜像里 WORKDIR 的本地路径。 */
export function assembleImage(dockerfileText, { context = projectDir, imageRoot }) {
  const image = describeImage(dockerfileText);
  const ignored = dockerignoreMatcher(fs.existsSync(path.join(context, '.dockerignore')) ? fs.readFileSync(path.join(context, '.dockerignore'), 'utf8') : '');
  const local = (posixAbs) => path.join(imageRoot, ...posixAbs.split('/').filter(Boolean));
  const copyTree = (srcAbs, rel, destAbs) => {
    if (ignored(rel)) return;
    const stat = fs.statSync(srcAbs);
    if (stat.isDirectory()) {
      fs.mkdirSync(destAbs, { recursive: true });
      for (const name of fs.readdirSync(srcAbs)) copyTree(path.join(srcAbs, name), `${rel}/${name}`, path.join(destAbs, name));
    } else {
      fs.mkdirSync(path.dirname(destAbs), { recursive: true });
      fs.copyFileSync(srcAbs, destAbs);
    }
  };
  for (const { sources, dest } of image.copies) {
    for (const source of sources) {
      assert.ok(!/[*?[]/.test(source), `测试暂不支持 COPY 通配符：${source}`);
      const rel = path.posix.normalize(source).replace(/^\.\/?/, '').replace(/\/+$/, '');
      const srcAbs = path.join(context, ...rel.split('/'));
      assert.ok(fs.existsSync(srcAbs), `COPY 的源路径不存在：${source}`);
      if (fs.statSync(srcAbs).isDirectory()) {
        // COPY <目录> <dest>：复制目录里的内容，而不是目录本身
        fs.mkdirSync(local(dest), { recursive: true });
        for (const name of fs.readdirSync(srcAbs)) copyTree(path.join(srcAbs, name), `${rel}/${name}`, path.join(local(dest), name));
      } else {
        const target = dest.endsWith('/') || sources.length > 1 ? path.join(local(dest), path.basename(rel)) : local(dest);
        copyTree(srcAbs, rel, target);
      }
    }
  }
  return { ...image, appDir: local(image.workdir) };
}

// ─── 启动 ───

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

/** 启动一个进程并等 /api/health 返回 200；进程提前退出或超时就抛错（错误信息里带日志）。 */
async function boot(command, args, { cwd, env, port }) {
  const child = spawn(command, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  children.add(child);
  let logs = '';
  child.stdout.on('data', (chunk) => { logs += chunk; });
  child.stderr.on('data', (chunk) => { logs += chunk; });
  const base = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 10000;
  for (;;) {
    if (child.exitCode !== null || child.signalCode !== null) {
      children.delete(child);
      throw new Error(`进程提前退出（${child.exitCode ?? child.signalCode}）：\n${logs}`);
    }
    try {
      if ((await fetch(`${base}/api/health`)).ok) break;
    } catch { /* 仍在启动 */ }
    if (Date.now() > deadline) {
      child.kill('SIGKILL');
      children.delete(child);
      throw new Error(`进程没有在 10 秒内就绪：\n${logs}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 60));
  }
  const exited = new Promise((resolve) => child.once('exit', resolve));
  return {
    base,
    logs: () => logs,
    async stop() {
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
      await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 4000))]);
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
      children.delete(child);
    }
  };
}

/** 容器里的环境：只有 PATH（以及 Windows 必需的 SystemRoot）+ Dockerfile 的 ENV，再改成本机端口、关掉存档。 */
function containerEnv(dockerEnv, port) {
  const env = { PATH: process.env.PATH || '' };
  if (process.env.SystemRoot) env.SystemRoot = process.env.SystemRoot;
  return { ...env, ...dockerEnv, HOST: '127.0.0.1', PORT: String(port), PERSIST: '0', AI_MODE: 'demo' };
}

async function bootImage(dockerfileText, label) {
  const imageRoot = fs.mkdtempSync(path.join(tmpRoot, `${label}-`));
  const image = assembleImage(dockerfileText, { imageRoot });
  assert.ok(image.cmd, 'Dockerfile 缺少 CMD');
  assert.equal(image.cmd[0], 'node', 'CMD 应直接用 node 启动');
  const port = await freePort();
  const server = await boot(process.execPath, image.cmd.slice(1), { cwd: image.appDir, env: containerEnv(image.env, port), port });
  return { ...image, server };
}

const dockerfile = read('Dockerfile');

test('O1 镜像内容：只用 Dockerfile 的 COPY 行拼出来的 /app 能启动，并且页面、章节、卡牌、外传剧本都在', async () => {
  const image = describeImage(dockerfile);
  assert.equal(image.workdir, '/app');
  const copied = image.copies.flatMap((c) => c.sources);
  for (const needed of ['package.json', 'server.mjs', 'game', 'cards', 'scenario', 'public']) {
    assert.ok(copied.includes(needed), `Dockerfile 漏了 COPY ${needed}`);
  }

  const { server, appDir } = await bootImage(dockerfile, 'image');
  try {
    // .dockerignore 生效：密钥与存档不进镜像
    assert.equal(fs.existsSync(path.join(appDir, '.env')), false);
    assert.equal(fs.existsSync(path.join(appDir, 'data')), false);

    const health = await (await fetch(`${server.base}/api/health`)).json();
    assert.equal(health.ok, true);

    const meta = await (await fetch(`${server.base}/api/meta`)).json();
    assert.equal(meta.ok, true);
    assert.equal(meta.meta.demoTools, false, '镜像里 NODE_ENV=production，演示工具应默认关闭');

    for (const page of ['/', '/story.html', '/cards.html']) {
      const response = await fetch(`${server.base}${page}`);
      assert.equal(response.status, 200, `${page} 应返回 200`);
      assert.match(response.headers.get('content-type') || '', /text\/html/);
    }

    const chapterIndex = await (await fetch(`${server.base}/story/chapters/index.json`)).json();
    assert.ok(Array.isArray(chapterIndex) && chapterIndex.length >= 6, '主线章节索引应随镜像发布');
    for (const chapter of chapterIndex) {
      const response = await fetch(`${server.base}${chapter.file}`);
      assert.equal(response.status, 200, `${chapter.file} 应随镜像发布`);
      await response.arrayBuffer();
    }

    const scenario = await (await fetch(`${server.base}/api/scenario/index`)).json();
    assert.equal(scenario.ok, true);
    assert.ok(scenario.total > 0, '外传剧本（scenario/*.json）应随镜像发布');

    const cards = await (await fetch(`${server.base}/api/cards/all`)).json();
    assert.equal(cards.ok, true);
  } finally {
    await server.stop();
  }
});

for (const dir of ['cards', 'scenario']) {
  test(`O1 守护：Dockerfile 去掉 COPY ${dir} 后镜像无法启动（测试能抓住漏 COPY）`, async () => {
    const broken = dockerfile.split(/\r?\n/).filter((line) => !new RegExp(`^\\s*COPY\\s+${dir}\\b`, 'i').test(line)).join('\n');
    assert.notEqual(broken, dockerfile, `Dockerfile 里应有 COPY ${dir}`);
    await assert.rejects(bootImage(broken, `no-${dir}`), /提前退出|ERR_MODULE_NOT_FOUND|没有在/);
  });
}

test('O1 解析器：续行、JSON 形式、--chown、ENV 两种写法', () => {
  const image = describeImage([
    'FROM node:22-alpine',
    'WORKDIR /srv',
    'WORKDIR app',
    '# comment',
    'COPY --chown=node:node ["a.mjs", "b.mjs", "./"]',
    'COPY lib \\',
    '  ./lib',
    'COPY --from=build /out ./out',
    'ENV A=1 B="two words"',
    'ENV LEGACY value here',
    'CMD ["node", "a.mjs"]'
  ].join('\n'));
  assert.equal(image.workdir, '/srv/app');
  assert.deepEqual(image.copies, [
    { sources: ['a.mjs', 'b.mjs'], dest: '/srv/app/' },
    { sources: ['lib'], dest: '/srv/app/lib' }
  ]);
  assert.deepEqual(image.env, { A: '1', B: 'two words', LEGACY: 'value here' });
  assert.deepEqual(image.cmd, ['node', 'a.mjs']);

  const ignored = dockerignoreMatcher('.git\n*.log\ndata\ntools/art/raster/out\n**/*.tmp\n!keep.log');
  assert.equal(ignored('data'), true);
  assert.equal(ignored('data/saves.json'), true);
  assert.equal(ignored('server.log'), true);
  assert.equal(ignored('keep.log'), false);
  assert.equal(ignored('public/a.log'), false, '没有 ** 的模式只匹配上下文根目录');
  assert.equal(ignored('public/x/y.tmp'), true);
  assert.equal(ignored('tools/art/raster/out/a.png'), true);
  assert.equal(ignored('public/index.html'), false);
});

// ─── O4 忽略规则 ───

test('O4 data/ 不进仓库也不进镜像', () => {
  const gitignore = read('.gitignore').split(/\r?\n/).map((l) => l.trim());
  assert.ok(gitignore.includes('data/') || gitignore.includes('data') || gitignore.includes('/data/'), '.gitignore 应忽略 data/');
  const ignored = dockerignoreMatcher(read('.dockerignore'));
  for (const rel of ['data/saves.json', '.env', '.git/config', 'node_modules/x/index.js']) assert.equal(ignored(rel), true, `.dockerignore 应排除 ${rel}`);
  for (const rel of ['server.mjs', 'public/index.html', 'cards/battle.mjs', 'scenario/index.mjs']) assert.equal(ignored(rel), false, `.dockerignore 不应排除 ${rel}`);
});

test('O4 .env.example 写明 ADMIN_KEY / DEMO_TOOLS / SAVE_FILE / PERSIST，且复制成 .env 后不会关掉后台', () => {
  const example = read('.env.example');
  for (const key of ['ADMIN_KEY', 'DEMO_TOOLS', 'SAVE_FILE', 'PERSIST']) assert.match(example, new RegExp(`^#?\\s*${key}=`, 'm'), `.env.example 缺少 ${key}`);
  // 「ADMIN_KEY=」空值表示关闭后台；示例里必须是注释，复制即用时后台保持默认开启
  assert.doesNotMatch(example, /^ADMIN_KEY=\s*$/m);
  assert.doesNotMatch(example, /^ADMIN_KEY=/m, '.env.example 不应启用 ADMIN_KEY，避免把示例口令带进真实部署');
});

// ─── O2 启动链 ───

test('O2 npm 脚本不依赖 POSIX 的「VAR=值 命令」前缀（cmd.exe 下会报错）', () => {
  const { scripts } = JSON.parse(read('package.json'));
  for (const [name, command] of Object.entries(scripts)) {
    assert.doesNotMatch(command, /(^|&&|\|\||;)\s*[A-Za-z_][A-Za-z0-9_]*=\S*\s/, `npm run ${name} 用了 VAR=值 前缀：${command}`);
  }
  assert.equal(scripts.dev, 'node --watch server.mjs');
  assert.equal(scripts.check, 'node tools/check-syntax.mjs');
});

test('O2 start-demo.cmd 为 CRLF，并切到脚本目录、检查 node、出错时暂停', () => {
  const raw = fs.readFileSync(path.join(projectDir, 'start-demo.cmd'), 'latin1');
  assert.equal(/(^|[^\r])\n/.test(raw), false, 'start-demo.cmd 里不能有单独的 LF');
  assert.ok(raw.endsWith('\r\n'));
  assert.match(raw, /^@echo off\r\n/i);
  assert.match(raw, /^cd \/d "%~dp0"\r$/im);
  assert.match(raw, /^where node\b/im);
  assert.match(raw, /^set "AI_MODE=demo"\r$/im);
  assert.match(raw, /^node server\.mjs\r$/im);
  assert.match(raw, /^if errorlevel 1 \(\r\n[\s\S]*pause/im);
  assert.equal(/[^\x00-\x7f]/.test(raw), false, 'cmd 文件只用 ASCII，避免不同代码页下乱码');
  const attributes = read('.gitattributes');
  assert.match(attributes, /^\*\.cmd\s+text\s+eol=crlf\s*$/m);
  assert.match(attributes, /^\*\.sh\s+text\s+eol=lf\s*$/m);
});

test('O2 start-demo.sh 为 LF，从其他目录执行也能启动', { skip: process.platform === 'win32' ? 'POSIX shell only' : false }, async () => {
  const script = path.join(projectDir, 'start-demo.sh');
  const text = fs.readFileSync(script, 'utf8');
  assert.equal(text.includes('\r'), false, 'start-demo.sh 里不能有 CR');
  assert.match(text, /^cd "\$\(dirname "\$0"\)"$/m);
  const port = await freePort();
  const env = { ...process.env, PATH: `${path.dirname(process.execPath)}${path.delimiter}${process.env.PATH || ''}`, PORT: String(port), PERSIST: '0', AI_MODE: 'openai' };
  delete env.HOST;
  const server = await boot('sh', [script], { cwd: os.tmpdir(), env, port });
  try {
    const health = await (await fetch(`${server.base}/api/health`)).json();
    assert.equal(health.ok, true);
    assert.equal(health.aiMode, 'demo', 'start-demo 应强制使用 demo 模式');
    assert.equal((await fetch(`${server.base}/`)).status, 200);
  } finally {
    await server.stop();
  }
});

// ─── O3 全量语法检查 ───

test('O3 语法检查覆盖全部前端与工具脚本（含 public/story/player.js）', () => {
  const { scripts, jsons } = collectFiles(projectDir);
  const rel = new Set(scripts.map((f) => path.relative(projectDir, f).split(path.sep).join('/')));
  for (const file of ['server.mjs', 'public/story/player.js', 'public/story/engine.js', 'public/app.js', 'public/cards.js', 'game/ai.mjs', 'cards/battle.mjs', 'scenario/index.mjs', 'tools/story/check.mjs', 'tools/check-syntax.mjs']) {
    assert.ok(rel.has(file), `语法检查漏了 ${file}`);
  }
  assert.ok(![...rel].some((f) => f.includes('node_modules/')));
  assert.ok(jsons.some((f) => f.endsWith(`chapters${path.sep}index.json`)));
});

test('O3 在临时副本里给 public/story/player.js 注入语法错误，检查脚本会失败', () => {
  const copy = fs.mkdtempSync(path.join(tmpRoot, 'syntax-'));
  fs.mkdirSync(path.join(copy, 'tools'), { recursive: true });
  fs.mkdirSync(path.join(copy, 'public', 'story'), { recursive: true });
  fs.copyFileSync(path.join(projectDir, 'tools', 'check-syntax.mjs'), path.join(copy, 'tools', 'check-syntax.mjs'));
  fs.copyFileSync(path.join(projectDir, 'package.json'), path.join(copy, 'package.json'));
  const player = path.join(copy, 'public', 'story', 'player.js');
  fs.copyFileSync(path.join(projectDir, 'public', 'story', 'player.js'), player);
  const run = () => spawnSync(process.execPath, [path.join(copy, 'tools', 'check-syntax.mjs')], { cwd: copy, encoding: 'utf8' });

  const clean = run();
  assert.equal(clean.status, 0, clean.stderr);

  fs.appendFileSync(player, '\nfunction broken( {\n');
  const dirty = run();
  assert.equal(dirty.status, 1);
  assert.match(dirty.stderr, /public\/story\/player\.js/);

  fs.copyFileSync(path.join(projectDir, 'public', 'story', 'player.js'), player);
  fs.writeFileSync(path.join(copy, 'public', 'story', 'bad.json'), '{ "a": 1, }');
  const badJson = run();
  assert.equal(badJson.status, 1);
  assert.match(badJson.stderr, /bad\.json/);
});
