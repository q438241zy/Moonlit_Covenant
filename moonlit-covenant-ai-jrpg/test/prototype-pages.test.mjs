// 原型页（public/gacha-system.*、public/character-manager.*）的回归检查：审计轨道 P 修过的问题不再回来。
//
// 两个页面脚本都是浏览器模块，这里把源码放进 node:vm，配一个极简的假 DOM 跑起来，
// 再从脚本作用域里取出数据和函数做断言（不改页面代码本身）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { CHARACTERS as SIDE_STORY_CHARACTERS } from '../game/content.mjs';
import { COSTUME_POOL } from '../game/gacha.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
// vm 里创建的数组 / 对象原型属于另一个 realm，比较前先转成本 realm 的普通 JSON 值
const plain = (v) => JSON.parse(JSON.stringify(v));
const PAGE_FILES = ['public/gacha-system.html', 'public/gacha-system.js', 'public/character-manager.html', 'public/character-manager.js'];

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
const gacha = (opts) => runPage('public/gacha-system.js', '({ CHARACTERS, WEAPONS, COSTUMES, switchTab, DEV, get isAnimating() { return isAnimating; } })', opts);

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
  assert.ok(page.PROFILE_VERSION >= 3, 'PROFILE_VERSION 要升到 3，旧存档才会换上新人设');
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
  const html = read('public/gacha-system.html');
  assert.match(html, /class="proto-banner"[^>]*>[\s\S]*?原型[\s\S]*?不互通/);
  const adminEntries = html.match(/<[^>]*data-tab="admin"[^>]*>/g) || [];
  assert.equal(adminEntries.length, 2, '齿轮按钮 + 后台标签');
  for (const tag of adminEntries) assert.match(tag, /\bhidden\b/, `默认应隐藏：${tag}`);
  assert.match(html, /id="tab-admin"[^>]*\bhidden\b/);
  assert.equal(gacha().page.DEV, false);
  assert.equal(gacha({ search: '?dev=1' }).page.DEV, true);
});

test('独立抽卡页：结果层可滚动、确认区吸附底部、两页都尊重减少动态效果', () => {
  const html = read('public/gacha-system.html');
  const overlayRule = html.match(/\.anim-overlay \{[^}]*\}/)[0];
  assert.match(overlayRule, /overflow-y:auto/);
  assert.match(overlayRule, /justify-content:safe center/);
  assert.match(html, /\.has-result \.anim-result-v2 \{[^}]*position:sticky; bottom:0/);
  assert.match(html, /\.mini-flip-card \{ width:96px; height:140px; \}/);
  assert.match(html, /id="animClose"[^>]*data-action="end-anim"/);
  for (const rel of ['public/gacha-system.html', 'public/character-manager.html']) {
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
