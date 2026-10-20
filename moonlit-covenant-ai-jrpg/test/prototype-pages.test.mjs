// 原型页（tools/prototypes/gacha-system.*、public/character-manager.*）的回归检查：审计轨道 P 修过的问题不再回来，
// 以及作者核#12 的两项决定：
//   - B13：独立抽卡页移出 public/（不随站点提供），游戏里不再有任何链接；只能用 tools/prototypes/preview.mjs 本机预览；
//   - B1/B15：角色管理器里的莉亚、米娅、塞雷娜用正典人设（设定集/03），不再是银轨号 IF 外传的版本，
//     且只写到正式章节（剧本 00–05）已揭示的程度。
//
// 两个页面脚本都是浏览器模块，这里把源码放进 node:vm，配一个极简的假 DOM 跑起来，
// 再从脚本作用域里取出数据和函数做断言（不改页面代码本身）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import vm from 'node:vm';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CHARACTERS as SIDE_STORY_CHARACTERS } from '../game/content.mjs';
import { COSTUME_POOL } from '../game/gacha.mjs';
import { createPreviewServer, resolvePreviewPath, PREVIEW_CSP } from '../tools/prototypes/preview.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
// vm 里创建的数组 / 对象原型属于另一个 realm，比较前先转成本 realm 的普通 JSON 值
const plain = (v) => JSON.parse(JSON.stringify(v));
const GACHA_HTML = 'tools/prototypes/gacha-system.html';
const GACHA_JS = 'tools/prototypes/gacha-system.js';
const PAGE_FILES = [GACHA_HTML, GACHA_JS, 'public/character-manager.html', 'public/character-manager.js'];

// 极简假 DOM：未知属性一律当作空操作函数；只补页面脚本初始化时会读到的几个值
function fakeElement() {
  const base = { value: '', innerHTML: '', textContent: '', hidden: false, clientWidth: 1200, files: [], dataset: {}, style: {},
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    querySelectorAll: () => [], querySelector: () => null };
  return new Proxy(base, {
    get: (t, k) => (k in t ? t[k] : typeof k === 'string' ? () => {} : undefined),
    set: (t, k, v) => { t[k] = v; return true; },
  });
}

function runPage(rel, exportsExpr, { storage = {}, search = '', confirmAnswer = true } = {}) {
  const elements = new Map();
  const store = new Map(Object.entries(storage));
  const document = {
    getElementById: (id) => { if (!elements.has(id)) elements.set(id, fakeElement()); return elements.get(id); },
    querySelectorAll: () => [], querySelector: () => null, addEventListener() {},
    body: fakeElement(), createElement: () => fakeElement(),
  };
  const context = vm.createContext({
    document, window: { addEventListener() {} }, location: { search },
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k), clear: () => store.clear() },
    matchMedia: () => ({ matches: false }), confirm: () => confirmAnswer, prompt: () => null,
    setTimeout: () => 0, clearTimeout() {}, console: { ...console, warn() {} },
    URLSearchParams, Element: class {}, Blob: class {}, FileReader: class {}, URL,
  });
  const source = read(rel).replace(/^import \{ icon \} from '\/icons\.js';$/m, "const icon = () => '<svg></svg>';");
  assert.ok(!/^\s*(import|export)\s/m.test(source), `${rel} 里还有别的 import/export，vm 跑不了`);
  vm.runInContext(`${source}\n;globalThis.__page = ${exportsExpr};`, context, { filename: rel });
  return { page: context.__page, store, context };
}

const cm = (opts) => runPage('public/character-manager.js', `({
  sanitizeData, loadData, refreshAll, renderRelationGraph, PROFILE_VERSION, DEFAULT_CHARACTERS, DEFAULT_MILESTONES, ART_TYPES,
  get characters() { return characters; }, get milestones() { return milestones; }, get artStatus() { return artStatus; },
})`, opts);
const gacha = (opts) => runPage(GACHA_JS, '({ CHARACTERS, WEAPONS, COSTUMES, switchTab, DEV, get isAnimating() { return isAnimating; } })', opts);

test('原型页不含结局前禁用词、组织名、章节号、旧写法和硬编码口令', () => {
  const banned = new Set(['蚀宴会', '第27章', '塞蕾娜', '米娅·铃', '123456', '三种结局', '火灾疤']);
  for (const c of Object.values(SIDE_STORY_CHARACTERS)) c.forbiddenTermsUntilEnding.forEach((w) => banned.add(w));
  for (const rel of PAGE_FILES) {
    const text = read(rel);
    for (const w of banned) assert.ok(!text.includes(w), `${rel} 不应包含「${w}」`);
  }
});

test('角色管理器：默认人设去剧透、正典事实、PROFILE_VERSION ≥ 3', () => {
  const { page } = cm();
  assert.ok(page.PROFILE_VERSION >= 4, 'PROFILE_VERSION 要升到 4，旧存档才会换上正典人设');
  const byId = Object.fromEntries(page.DEFAULT_CHARACTERS.map((c) => [c.id, c]));
  assert.equal(byId.mia.name, '米娅·玲');
  assert.equal(byId.serena.name, '塞雷娜·诺克斯');
  assert.ok(byId.lia.likes.some((x) => x.includes('草莓蛋糕')), '莉亚喜欢草莓蛋糕（设定集/03）');
  assert.ok(!byId.lia.dislikes.some((x) => x.includes('甜食')), '莉亚不该讨厌甜食');
  assert.ok(byId.lia.dislikes.includes('临战失约'));
  assert.ok(byId.evelyn.personality.includes('白塔圣都'), '伊芙琳在白塔圣都长大（设定集/02）');
  assert.ok(page.ART_TYPES.includes('服装立绘'));
  assert.ok(!page.DEFAULT_MILESTONES.some((m) => ['m3', 'm4', 'm5'].includes(m.id)), '过时的立绘里程碑应删除');
});

test('角色管理器：坏数据导入被逐项清洗，渲染不再抛错，刷新后仍可用', () => {
  const bad = { characters: [{ id: 'lia', name: '莉亚' }], artStatus: {}, milestones: [null] }; // 审计用的 bad-import.json
  const { page } = cm();
  const clean = page.sanitizeData(bad);
  assert.equal(clean.characters.length, 1);
  assert.equal(clean.milestones.length, 0);
  assert.equal(clean.dropped, 1);
  assert.equal(page.sanitizeData(null), null);
  assert.equal(page.sanitizeData({ characters: 'nope' }), null);

  // 模拟「导入后刷新」：坏数据已经写进 localStorage
  const reloaded = cm({ storage: { moonlit_char_manager: JSON.stringify({ profileVersion: 3, ...bad }) } }).page;
  assert.equal(reloaded.characters.length, 1);
  assert.deepEqual(plain(reloaded.milestones), []);
  assert.doesNotThrow(() => { reloaded.refreshAll(); reloaded.renderRelationGraph(); });
});

test('角色管理器：旧版存档升级时换上新人设、去掉过时里程碑、过滤会污染原型的 id', () => {
  const legacy = {
    profileVersion: 2,
    characters: [
      { id: 'mia', name: '米娅·铃', relations: [null, { target: 'serena', type: 'bond', desc: '旧描述' }] },
      null, 42, { id: '__proto__', name: 'x' }, { id: 'mia', name: '重复' },
      { id: 'custom1', name: '自建角色', quirks: [null, '会弹琴'], relations: 'oops' },
    ],
    artStatus: { mia: { 立绘: 'complete' }, custom1: null },
    milestones: [null, { id: 'm4', note: 'AI生成半身立绘已完成（含水印）' }, { id: 'm6', date: '2026-10-09', chars: ['mia', 7] }],
  };
  const { page, store, context } = cm({ storage: { moonlit_char_manager: JSON.stringify(legacy) } });
  assert.deepEqual(plain(page.characters.map((c) => c.name)), ['米娅·玲', '自建角色']);
  assert.deepEqual(plain(page.characters[1].quirks), ['会弹琴']);
  assert.deepEqual(plain(page.milestones.map((m) => m.id)), ['m6']);
  assert.deepEqual(plain(page.milestones[0].chars), ['mia', '7']);
  assert.equal(page.artStatus.mia['服装立绘'], 'complete', '缺的美术类型按默认值补齐');
  assert.equal(page.artStatus.custom1['立绘'], 'not-started');
  assert.equal(vm.runInContext('({}).立绘', context), undefined, '页面所在 realm 的 Object.prototype 不应被污染');
  assert.equal(JSON.parse(store.get('moonlit_char_manager')).profileVersion, page.PROFILE_VERSION, '升级后立即回写');
  assert.doesNotThrow(() => page.refreshAll());
});

test('独立抽卡页：服装名与立绘一致（沿用正式游戏 COSTUME_POOL 命名），专武用正典名', () => {
  const { page } = gacha();
  const pool = new Map(COSTUME_POOL.map((c) => [c.id, c.name]));
  const artOwner = (owner) => (owner === 'ayla' ? 'aila' : owner);
  assert.equal(page.COSTUMES.length, 16);
  for (const c of page.COSTUMES) {
    const formal = pool.get(`${artOwner(c.owner)}_${c.art}`);
    assert.ok(formal, `${c.id}: 正式游戏没有 ${c.owner}_${c.art}`);
    assert.equal(c.name, formal, `${c.id} 的名字应与立绘 ${c.owner}_${c.art}.svg 对应`);
  }
  const weapon = Object.fromEntries(page.WEAPONS.filter((w) => w.owner).map((w) => [w.owner, w.name]));
  const canon = { lia: ['赤誓'], mia: ['叮当三号'], serena: ['无眠镜'], freya: ['春眠'], lilith: ['昼盲', '夜醒'], evelyn: ['微光'], ophelia: ['祖语'], ayla: ['晨罚'] };
  for (const [owner, words] of Object.entries(canon)) for (const w of words) assert.ok(weapon[owner]?.includes(w), `${owner} 专武应含「${w}」，实际 ${weapon[owner]}`);
  const names = Object.fromEntries(page.CHARACTERS.map((c) => [c.id, c.name]));
  assert.equal(names.mia, '米娅·玲');
  assert.equal(names.serena, '塞雷娜·诺克斯');
});

test('独立抽卡页：后台入口只在 ?dev=1 时出现，页面顶部有原型声明', () => {
  const html = read(GACHA_HTML);
  assert.match(html, /class="proto-banner"[^>]*>[\s\S]*?原型[\s\S]*?不互通/);
  const adminEntries = html.match(/<[^>]*data-tab="admin"[^>]*>/g) || [];
  assert.equal(adminEntries.length, 2, '齿轮按钮 + 后台标签');
  for (const tag of adminEntries) assert.match(tag, /\bhidden\b/, `默认应隐藏：${tag}`);
  assert.match(html, /id="tab-admin"[^>]*\bhidden\b/);
  assert.equal(gacha().page.DEV, false);
  assert.equal(gacha({ search: '?dev=1' }).page.DEV, true);
});

test('独立抽卡页：结果层可滚动、确认区吸附底部、两页都尊重减少动态效果', () => {
  const html = read(GACHA_HTML);
  const overlayRule = html.match(/\.anim-overlay \{[^}]*\}/)[0];
  assert.match(overlayRule, /overflow-y:auto/);
  assert.match(overlayRule, /justify-content:safe center/);
  assert.match(html, /\.has-result \.anim-result-v2 \{[^}]*position:sticky; bottom:0/);
  assert.match(html, /\.mini-flip-card \{ width:96px; height:140px; \}/);
  assert.match(html, /id="animClose"[^>]*data-action="end-anim"/);
  for (const rel of [GACHA_HTML, 'public/character-manager.html']) {
    assert.match(read(rel), /@media \(prefers-reduced-motion: reduce\)/, `${rel} 缺少 prefers-reduced-motion 规则`);
  }
});

test('角色管理器：实心按钮 / 选中标签用 #7c4dff 底白字（≥ 4.5:1）', () => {
  const html = read('public/character-manager.html');
  assert.match(html, /--brand: #7c4dff/);
  assert.match(html, /\.tab-btn\.active \{ background: var\(--brand\); color: #fff;/);
  assert.match(html, /\.button\.primary \{ background: var\(--brand\); color: #fff;/);
  const lum = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  assert.ok((1.05 / (lum('#7c4dff') + 0.05)) >= 4.5);
});

// ─── 作者核#12 · B1/B15：角色管理器用正典人设 ───

// 银轨号 IF 外传独有的称号与道具（docs/CHARACTER-DESIGN.md §0），不该出现在正典人设里
const SIDE_STORY_ONLY = ['赤誓骑士', '猫耳机关师', '月蚀观测者', '银轨', '火车', '列车', '观测仪', '黎明种', '炉心', '前队长', '姐姐'];
// 正式章节（剧本 00–05）还没揭示的正典背景：莉亚的父亲线一律不解释，米娅、塞雷娜的身世秘密还没登场
const NOT_YET_REVEALED = ['父亲奥德', '奥德', '撤退命令', '莫尔坎', '七孔蚀痕', '控制实验', '洗礼巡游', '献祭抽取器', '被除名', '被关押', '噩梦'];
const profileText = (c) => JSON.stringify(c);

test('B1/B15：莉亚、米娅、塞雷娜是正典人设（职业、国家、正典武器名），不含外传设定，也不超出正式章节', () => {
  const { page } = cm();
  const byId = Object.fromEntries(page.DEFAULT_CHARACTERS.map((c) => [c.id, c]));
  const canon = {
    lia: { profession: '盾战士', nation: '赤焰王国', weapon: ['塔盾', '赤誓', '断章'], element: '火' },
    mia: { profession: '魔具发明师', nation: '铸金联邦', weapon: ['叮当三号'], element: '金' },
    serena: { profession: '暗系魔法师', nation: '夜鸦公国', weapon: ['黑曜法杖', '无眠镜'], element: '暗' },
  };
  for (const [id, want] of Object.entries(canon)) {
    const c = byId[id];
    assert.ok(c.profession.startsWith(want.profession), `${id} 的职业应为「${want.profession}」，实际 ${c.profession}`);
    assert.equal(c.nation, want.nation);
    for (const w of want.weapon) assert.ok(c.weapon.includes(w), `${id} 的武器应含「${w}」，实际 ${c.weapon}`);
    assert.ok(c.element.startsWith(want.element));
    for (const w of SIDE_STORY_ONLY) assert.ok(!profileText(c).includes(w), `${id} 的人设不应含外传设定「${w}」`);
  }
  assert.ok(byId.mia.personality.includes('林铎'), '米娅的父亲是林铎（设定集/03、04）');
  assert.ok(byId.serena.personality.includes('诺克斯家族'));
  assert.equal(byId.serena.height, '168cm', '与 docs/CHARACTER-DESIGN.md 的 168cm 一致');
  // 每位女主都有国家与武器两栏；全部默认人设都不超出正式章节已揭示的内容
  for (const c of page.DEFAULT_CHARACTERS) {
    assert.ok(c.nation && c.weapon, `${c.id} 缺国家或武器`);
    for (const w of NOT_YET_REVEALED) assert.ok(!profileText(c).includes(w), `${c.id} 的人设不应提前揭示「${w}」`);
  }
  const m1 = page.DEFAULT_MILESTONES.find((m) => m.id === 'm1');
  assert.ok(m1.note.includes('设定集/03') && !m1.note.includes('从CHARACTER-DESIGN.md确认'), 'CHARACTER-DESIGN.md 已改为外传专用，不再是三人组设定的来源');
  assert.match(read('public/character-manager.html'), /class="proto-banner"[^>]*>[\s\S]*?正典（设定集\/03）为准[\s\S]*?IF 外传/);
});

test('B1：v3 存档升级到 v4 时，三人组换成正典人设；没改过的旧 m1 里程碑跟着更新，改过的保留', () => {
  const v3 = {
    profileVersion: 3,
    characters: [
      { id: 'lia', name: '莉亚·赫斯特', profession: '赤誓骑士 / 前卫破甲', likes: ['月光下的火车车厢顶'] },
      { id: 'serena', name: '塞雷娜·诺克斯', profession: '月蚀观测者 / 术式封印', height: '169cm' },
      { id: 'custom1', name: '自建角色', nation: '自定国', weapon: '木棍' },
    ],
    artStatus: {},
    milestones: [
      { id: 'm1', phase: 'design', phaseLabel: '角色设定确认', date: '2026-07-20', chars: ['lia', 'mia', 'serena'], note: '月蚀契约三人组设定已从CHARACTER-DESIGN.md确认' },
      { id: 'm2', phase: 'design', phaseLabel: '角色设定确认', date: '2026-07-22', chars: ['freya'], note: '作者自己改过的备注' },
    ],
  };
  const { page, store } = cm({ storage: { moonlit_char_manager: JSON.stringify(v3) } });
  const byId = Object.fromEntries(page.characters.map((c) => [c.id, c]));
  assert.ok(byId.lia.profession.startsWith('盾战士'));
  assert.ok(!byId.lia.likes.includes('月光下的火车车厢顶'));
  assert.equal(byId.serena.height, '168cm');
  assert.equal(byId.custom1.weapon, '木棍', '自建角色原样保留（含国家 / 武器）');
  const notes = Object.fromEntries(page.milestones.map((m) => [m.id, m.note]));
  assert.ok(notes.m1.includes('设定集/03'));
  assert.equal(notes.m2, '作者自己改过的备注');
  assert.equal(JSON.parse(store.get('moonlit_char_manager')).profileVersion, 4);
  assert.doesNotThrow(() => page.refreshAll());
});

test('独立抽卡原型的角色称号也用正典职业（外传称号不再出现）', () => {
  const titles = Object.fromEntries(gacha().page.CHARACTERS.map((c) => [c.id, c.title]));
  assert.equal(titles.lia, '盾战士');
  assert.equal(titles.mia, '魔具发明师');
  assert.equal(titles.serena, '暗系魔法师');
  const src = read(GACHA_JS);
  for (const w of ['赤誓骑士', '猫耳机关师', '月蚀观测者']) assert.ok(!src.includes(w), `不应再有外传称号「${w}」`);
});

// ─── 作者核#12 · B13：独立抽卡页移到 tools/prototypes/，不随站点提供 ───

const walkFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  return e.isDirectory() ? walkFiles(full) : e.isFile() ? [full] : [];
});

test('B13：gacha-system.* 不在 public/ 里，public/ 下没有任何文件链接它', () => {
  for (const name of ['gacha-system.html', 'gacha-system.js']) {
    assert.ok(!fs.existsSync(path.join(root, 'public', name)), `public/${name} 应已移走`);
    assert.ok(fs.existsSync(path.join(root, 'tools/prototypes', name)), `tools/prototypes/${name} 应存在`);
  }
  const textFiles = walkFiles(path.join(root, 'public')).filter((f) => /\.(html|js|mjs|css|json|md)$/i.test(f));
  assert.ok(textFiles.length > 10);
  const linking = textFiles.filter((f) => fs.readFileSync(f, 'utf8').includes('gacha-system')).map((f) => path.relative(root, f));
  assert.deepEqual(linking, []);
});

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

test('B13：游戏服务器对 /gacha-system.* 返回 404，角色管理器仍正常提供', async () => {
  const port = await freePort();
  const env = { ...process.env, AI_MODE: 'demo', HOST: '127.0.0.1', PORT: String(port), NODE_ENV: 'test', PERSIST: '0' };
  delete env.SAVE_FILE;
  const child = spawn(process.execPath, ['server.mjs'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  child.stdout.on('data', (c) => { logs += c; });
  child.stderr.on('data', (c) => { logs += c; });
  const base = `http://127.0.0.1:${port}`;
  try {
    const deadline = Date.now() + 8000;
    for (;;) {
      if (child.exitCode !== null) throw new Error(`server exited early:\n${logs}`);
      try { if ((await fetch(`${base}/api/health`)).ok) break; } catch { /* 仍在启动 */ }
      if (Date.now() > deadline) throw new Error(`server did not start:\n${logs}`);
      await new Promise((r) => setTimeout(r, 60));
    }
    for (const p of ['/gacha-system.html', '/gacha-system.js', '/gacha-system']) {
      const res = await fetch(`${base}${p}`, { redirect: 'manual' });
      assert.equal(res.status, 404, `${p} 应为 404，实际 ${res.status}`);
      await res.arrayBuffer();
    }
    const cmPage = await fetch(`${base}/character-manager.html`);
    assert.equal(cmPage.status, 200);
    assert.ok((await cmPage.text()).includes('角色管理系统'));
  } finally {
    child.kill('SIGKILL');
  }
});

test('B13：本机预览服务器只提供原型页与它引用的 /icons.js、/assets/**，并沿用游戏的 CSP', async () => {
  assert.equal(resolvePreviewPath('/'), path.join(root, GACHA_HTML));
  assert.equal(resolvePreviewPath('/gacha-system.js'), path.join(root, GACHA_JS));
  assert.equal(resolvePreviewPath('/icons.js'), path.join(root, 'public/icons.js'));
  assert.equal(resolvePreviewPath('/assets/ui/card-back.svg'), path.join(root, 'public/assets/ui/card-back.svg'));
  for (const bad of ['/app.js', '/index.html', '/preview.mjs', '/README.md', '/assets/../app.js', '/assets/%2e%2e/%2e%2e/server.mjs', '/%E0%A4%A', '/assets/a%00b']) {
    assert.equal(resolvePreviewPath(bad), null, `${bad} 不应被提供`);
  }
  assert.match(PREVIEW_CSP, /script-src 'self'/);
  assert.match(PREVIEW_CSP, /img-src 'self' data:/);

  const server = createPreviewServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(`${base}/`);
    assert.equal(page.status, 200);
    assert.equal(page.headers.get('content-security-policy'), PREVIEW_CSP);
    const html = await page.text();
    assert.ok(html.includes('<script type="module" src="/gacha-system.js"></script>'));
    // 页面引用的每张图都能从预览服务器取到
    const refs = [...new Set([...html.matchAll(/src="(\/assets\/[^"]+)"/g)].map((m) => m[1]))];
    assert.ok(refs.length >= 2);
    for (const ref of [...refs, '/gacha-system.js', '/icons.js', '/assets/portraits/lia.svg', '/assets/costumes/mia_maid.svg']) {
      const res = await fetch(`${base}${ref}`);
      assert.equal(res.status, 200, ref);
      await res.arrayBuffer();
    }
    for (const ref of ['/app.js', '/assets/../../server.mjs', '/assets/nope.svg']) {
      const res = await fetch(`${base}${ref}`);
      assert.equal(res.status, 404, ref);
      await res.arrayBuffer();
    }
    const post = await fetch(`${base}/`, { method: 'POST' });
    assert.equal(post.status, 404);
    await post.arrayBuffer();
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
