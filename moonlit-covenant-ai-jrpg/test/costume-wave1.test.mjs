// 服装稿第一套（剧本/README_轉蛋服裝設計.md；作者核#14「同意，按建议执行」，连同衣橱券）：
//   - 常驻 40 件的款名与台词、文案守则（§1.3 第10条、§2.2、§2.3）；
//   - 衣橱券（§1.2）：每抽 1 点、满 90 点一张，换一件已登场女主的常驻 5★；
//   - 前端：12+ 泳装换罩衫版、OL装的 IF 角标、外传队伍头像穿装备的服装；委托板的服装胸像、擦边服装在场时火花、显示开关（§4.1）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CHARACTER_POOL, COSTUME_CATALOG, COSTUME_PULL_TABLE, COSTUME_STYLES, COSTUME_TYPE_META, PITY_THRESHOLD, WARDROBE_TICKET,
  pullGacha, redeemWardrobeTicket, viewCostume, wardrobeStatus, wardrobeTicketChoices
} from '../game/gacha.mjs';
import { createPlayerAccount } from '../game/membership.mjs';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(projectDir, file), 'utf8');
const upTo = (n) => Array.from({ length: n + 1 }, (_, i) => `ch${String(i).padStart(3, '0')}`);

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

// ─── 款名与台词 ───

test('常驻 40 件都有款名与台词（服装稿 §三），写进目录的 description / line', () => {
  const current = Object.keys(COSTUME_TYPE_META).filter((type) => COSTUME_TYPE_META[type].status === 'current');
  assert.deepEqual(Object.keys(COSTUME_STYLES).sort(), [...current].sort());
  for (const type of current) {
    for (const heroine of CHARACTER_POOL) {
      const [style, line] = COSTUME_STYLES[type][heroine.id] || [];
      assert.ok(style && line, `${heroine.id}_${type} has a style name and a line`);
      const entry = COSTUME_CATALOG.find((c) => c.id === `${heroine.id}_${type}`);
      assert.equal(entry.description, style);
      assert.equal(entry.line, line);
    }
  }
  // 典藏与赠品没有逐件款名，也没有台词
  assert.ok(COSTUME_CATALOG.filter((c) => c.status !== 'current').every((c) => !c.line && c.description));
  assert.ok(COSTUME_CATALOG.filter((c) => c.type === 'office').every((c) => c.if === true), 'OL suits carry the IF flag');
});

test('服装文案守则：不带签名武器名、组织名，婚礼不用婚约类词，女仆装不用侍从类词，莉莉丝与艾拉不带姓与国名', () => {
  const all = JSON.stringify(COSTUME_STYLES);
  // 技能稿 5.4 的签名武器名
  for (const w of ['黎月', '赤誓', '断章', '叮当三号', '无眠镜', '春眠', '昼盲', '夜醒', '微光', '祖语', '晨罚']) assert.ok(!all.includes(w), `weapon name 「${w}」`);
  for (const w of ['蚀宴会', '莫尔坎', '索拉恩', '黯冠', '瓦尔哈拉', '翠影', '龙眠港']) assert.ok(!all.includes(w), `「${w}」`);
  const wedding = JSON.stringify(COSTUME_STYLES.wedding);
  for (const w of ['誓约', '婚约', '求婚', '新郎', '嫁', '娶', '夫人', '王后', '皇后', '妃', '后宫', '侍寝', '戒指']) assert.ok(!wedding.includes(w), `wedding text uses 「${w}」`);
  const maid = JSON.stringify(COSTUME_STYLES.maid);
  for (const w of ['主人', '侍奉', '侍从']) assert.ok(!maid.includes(w), `maid text uses 「${w}」`);
  for (const id of ['lilith', 'aila']) {
    const own = JSON.stringify(Object.values(COSTUME_STYLES).map((t) => t[id]));
    for (const w of ['莉莉丝', '瓦尔哈拉', '翠影', '圣辉']) assert.ok(!own.includes(w), `${id}: 「${w}」`);
  }
  // 莉莉丝在正式20以前：服装名叫「金发刺客·…」，款名与台词也不露名
  const before = viewCostume(COSTUME_CATALOG.find((c) => c.id === 'lilith_swimsuit'), upTo(15));
  assert.match(before.name, /^金发刺客·/);
  assert.ok(!JSON.stringify(before).includes('莉莉丝'));
  // 封存卡不带款名、台词与立绘
  const sealed = viewCostume(COSTUME_CATALOG.find((c) => c.id === 'ophelia_wedding'), upTo(5));
  assert.deepEqual([sealed.sealed, sealed.description, sealed.line, sealed.file], [true, undefined, undefined, undefined]);
});

// ─── 衣橱券 ───

test('衣橱券：服饰池每抽 1 点，满 90 点换一张，5★ 不清零；角色池不累积', (t) => {
  t.mock.method(Math, 'random', mulberry32(5));
  const account = createPlayerAccount('衣橱');
  account.diamonds = 10 ** 7;
  assert.deepEqual(wardrobeStatus(account), { points: 0, tickets: 0, pointsPerTicket: 90 });
  pullGacha(account, 'character', 10);
  assert.equal(account.wardrobe.points, 0, 'the character pool earns no points');
  let fives = 0;
  for (let i = 0; i < 9; i += 1) {
    const r = pullGacha(account, 'costume', 10);
    fives += r.results.filter((x) => x.rarity === 5).length;
    assert.deepEqual(r.wardrobe, wardrobeStatus(account));
  }
  assert.deepEqual(wardrobeStatus(account), { points: 0, tickets: 1, pointsPerTicket: WARDROBE_TICKET.pointsPerTicket });
  pullGacha(account, 'costume', 1);
  assert.deepEqual([account.wardrobe.points, account.wardrobe.tickets], [1, 1]);
  assert.ok(fives >= 1, 'the 90-pull 5★ guarantee still holds next to the tickets');
  assert.ok(PITY_THRESHOLD === 90);
});

test('衣橱券：只换常驻 5★、她已登场、还没拥有；一张券一件', () => {
  const account = createPlayerAccount('兑换');
  account.rewards = { chaptersCleared: upTo(11) }; // 莉亚、米娅、塞雷娜已登场
  account.ownedCostumes = ['lia_swimsuit'];
  account.wardrobe = { points: 12, tickets: 1 };
  const choices = wardrobeTicketChoices(account).map((c) => c.id).sort();
  assert.deepEqual(choices, ['lia_wedding', 'mia_swimsuit', 'mia_wedding', 'serena_swimsuit', 'serena_wedding']);
  assert.equal(redeemWardrobeTicket(account, 'lia_swimsuit').code, 'ALREADY_OWNED');
  assert.equal(redeemWardrobeTicket(account, 'lia_office').code, 'NOT_EXCHANGEABLE', '4★ cannot be picked');
  assert.equal(redeemWardrobeTicket(account, 'lia_anniversary').code, 'NOT_EXCHANGEABLE', 'archive cannot be picked');
  assert.equal(redeemWardrobeTicket(account, 'freya_wedding').code, 'SEALED', 'not before her debut');
  const ok = redeemWardrobeTicket(account, 'serena_wedding');
  assert.equal(ok.ok, true);
  assert.equal(ok.costume.id, 'serena_wedding');
  assert.deepEqual(ok.wardrobe, { points: 12, tickets: 0, pointsPerTicket: 90 });
  assert.ok(account.ownedCostumes.includes('serena_wedding'));
  assert.equal(redeemWardrobeTicket(account, 'mia_wedding').code, 'NO_WARDROBE_TICKET');
  // 坏数据按 0 处理
  const broken = createPlayerAccount('坏档');
  broken.wardrobe = { points: -5, tickets: 'x' };
  assert.deepEqual(wardrobeStatus(broken), { points: 0, tickets: 0, pointsPerTicket: 90 });
  assert.equal(COSTUME_PULL_TABLE.filter((c) => c.rarity === 5).length, 16);
});

// ─── 前端 ───

test('前端：12+ 泳装换罩衫版、OL装 IF 角标、赠品单列、衣橱券兑换、外传队伍头像穿装备的服装', () => {
  const app = read('public/app.js');
  assert.match(app, /costume: \(id, type\) => softCostume\(`\/assets\/costumes\/\$\{id\}_\$\{type\}\.svg`\)/);
  assert.match(app, /function softCostume\(src\)[\s\S]*?contentMode\(\) === '12\+' \? `\/assets\/costumes\/soft\//);
  assert.match(app, /swimsuit: \{ icon: 'swimsuit', frame: 'frame-swimsuit', soft: true \}/);
  assert.match(app, /const IF_COSTUME_TYPES = new Set\(\['office'\]\)/);
  assert.match(app, /aria-label="赠品"/);
  assert.match(app, /apiPost\('\/api\/gacha\/wardrobe-ticket', \{ playerId, costumeId \}\)/);
  assert.match(app, /faceThumb\(rosterArt\(character\.id\)/, 'the side-story roster wears her costume');
  const server = read('server.mjs');
  assert.match(server, /'\/api\/gacha\/wardrobe-ticket'/);
  assert.match(server, /typeMeta: COSTUME_TYPE_META/);
  const icons = read('public/icons.js');
  for (const name of ['swimsuit', 'wedding', 'office', 'sportwear', 'ticket']) assert.match(icons, new RegExp(`\\n  ${name}: '<`), `icon ${name}`);
  const css = read('public/styles.css');
  for (const cls of ['frame-wedding', 'frame-office', 'frame-sportwear', 'frame-resort', 'costume-if-tag', 'wardrobe-ticket']) assert.match(css, new RegExp(`\\.${cls} \\{`), cls);
});

test('委托板：我方单位卡是穿着服装的胸像，泳装或婚礼礼服在场时整场火花，可以关掉服装显示', () => {
  const board = read('public/skill-board.js');
  assert.match(board, /const TEASE_TYPES = new Set\(\['swimsuit', 'wedding'\]\)/);
  assert.match(board, /mode\(\) === '12\+' \|\| tease \? 'spark' : 'blood'/);
  assert.match(board, /`\/assets\/costumes\/\$\{bust \? 'bust\/' : ''\}\$\{soft\}\$\{costumeId\}\.svg`/);
  assert.match(board, /const SHOW_COSTUMES_KEY = 'moonlit:battleCostumes'/);
  assert.match(board, /data-show-costumes/);
  assert.match(board, /class="unit-bust"/);
  // 胸像永远不带伤：受击只用 CSS 晃动 / 泛红，没有叠加到胸像上的伤口图层
  const css = read('public/skill-board.css');
  assert.match(css, /\.cboard \.unit-bust \{/);
  assert.doesNotMatch(css, /\.unit-bust[^{]*\{[^}]*blood/);
  // 每个上场者都有默认胸像可用
  for (const id of ['aku', ...CHARACTER_POOL.map((c) => c.id)]) assert.ok(fs.existsSync(path.join(projectDir, `public/assets/story/npc/${id}.svg`)), `${id} default bust`);
  // 每件服装都有胸像，泳装还有 12+ 版本
  for (const c of COSTUME_CATALOG) {
    assert.ok(fs.existsSync(path.join(projectDir, `public/assets/costumes/bust/${c.id}.svg`)), `bust ${c.id}`);
    if (COSTUME_TYPE_META[c.type].soft) {
      for (const dir of ['soft', 'bust/soft']) assert.ok(fs.existsSync(path.join(projectDir, `public/assets/costumes/${dir}/${c.id}.svg`)), `${dir} ${c.id}`);
    }
  }
});
