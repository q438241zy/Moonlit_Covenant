// Integration step I2: regression guards that span every track.
//   - canon spellings (塞雷娜 / 米娅·玲, 设定集 wins): the old 塞蕾娜 / 米娅·铃 must not come back anywhere in the
//     shipped code, data, generators or docs (whole strings only; a lone 铃 / 蕾 is fine, e.g. 羊铃 / 芙蕾娅);
//   - the side-story spoilers 蚀宴会 / 第27章 must not reach any player-facing file;
//   - the admin key is never hard-coded on the client: the server owns it (ADMIN_KEY, default 123456,
//     header x-admin-key only), so the string 123456 must not appear anywhere under public/ (binary files included);
//   - no character's forbiddenTermsUntilEnding may leak into the pre-ending pool / profile texts;
//   - B8 (核#12): the side story's vice-captain 艾琳 (亚克's mother in canon), 艾琳娜 and 莉莉安 stay renamed
//     (希尔达 / 欧若拉 / 佩特拉); 艾琳 may only appear in the main line;
//   - B1/B15 (核#12): the side-story-only identities (赤誓骑士 / 猫耳机关师 / 月蚀观测者) never reach a canon surface
//     (summon pool, character manager, card texts, the main-line player and its chapters, the store copy);
//   - 核#14 (剧本/README_30章重構提案.md 第八节#43): main-line spoilers (MAIN_LINE_SPOILERS) never reach a text the
//     player sees before the chapter that reveals them — the start-visible canon surfaces, the summon pool's public
//     view at every point of main-line progress, and each main-line chapter.
// test/ is skipped on purpose: the tests themselves list the banned strings.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHARACTERS } from '../game/content.mjs';
import { publicPools } from '../game/gacha.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'data', 'test', 'out', '.cache']);
const TEXT = /\.(m?js|cjs|json|html|css|svg|md|txt|py|sh|cmd|yml|yaml|example)$/i;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return SKIP_DIRS.has(e.name) ? [] : walk(full);
    return e.isFile() ? [full] : [];
  });
}
const rel = (f) => path.relative(root, f).split(path.sep).join('/');
const textFiles = (...dirs) => dirs.flatMap((d) => {
  const full = path.join(root, d);
  return fs.existsSync(full) && fs.statSync(full).isFile() ? [full] : walk(full).filter((f) => TEXT.test(f) || /(^|\/)\.[\w.-]+$/.test(rel(f)));
});
function hits(files, needles) {
  const found = [];
  for (const f of files) {
    const s = fs.readFileSync(f, 'utf8');
    s.split('\n').forEach((line, i) => {
      for (const n of needles) if (line.includes(n)) found.push(`${rel(f)}:${i + 1}: ${n}`);
    });
  }
  return found;
}

test('canon spellings: no 塞蕾娜 / 米娅·铃 in code, data, art generators, tools or docs', () => {
  // the plan's scope (public, game, cards, scenario, tools/art) plus the rest of tools/, docs/, README and root files
  const files = [
    ...textFiles('public', 'game', 'cards', 'scenario', 'tools', 'docs'),
    ...fs.readdirSync(root).filter((n) => fs.statSync(path.join(root, n)).isFile()).map((n) => path.join(root, n)).filter((f) => TEXT.test(f) || /Dockerfile$|\.env\.example$/.test(f)),
  ];
  assert.ok(files.some((f) => rel(f) === 'public/app.js') && files.some((f) => rel(f).startsWith('tools/art/')), 'guard walked the wrong tree');
  assert.deepEqual(hits(files, ['塞蕾娜', '米娅·铃']), []);
});

test('the canon spellings are actually in use (the guard is not vacuous)', () => {
  const s = fs.readFileSync(path.join(root, 'game/content.mjs'), 'utf8');
  assert.ok(s.includes('塞雷娜'), 'game/content.mjs should use 塞雷娜');
  assert.ok(s.includes('米娅·玲'), 'game/content.mjs should use 米娅·玲');
});

// 主线第十章（总纲010，对照表§六硬锚点）第一次点名「蚀宴会」，从 ch010 起的主线章节可以出现；更早的章节和其他玩家可见文件仍然不行
const MAIN_LINE_FROM_CH010 = /^public\/story\/chapters\/ch(\d{3})\.json$/;
const namesEclipseFeastLegally = (f) => Number((rel(f).match(MAIN_LINE_FROM_CH010) || [])[1] ?? -1) >= 10;

test('side-story spoilers 蚀宴会 / 第27章 stay out of every player-facing file', () => {
  const files = textFiles('public', 'game', 'cards', 'scenario');
  assert.ok(files.some((f) => rel(f) === 'public/character-manager.js'));
  assert.deepEqual(hits(files.filter((f) => !namesEclipseFeastLegally(f)), ['蚀宴会', '第27章']), []);
  assert.deepEqual(hits(files.filter(namesEclipseFeastLegally), ['第27章']), []);
});

test('the main line names 蚀宴会 first in ch010 (hard anchor), never earlier', () => {
  const chapters = path.join(root, 'public/story/chapters');
  const ch010 = path.join(chapters, 'ch010.json');
  if (!fs.existsSync(ch010)) return;
  assert.ok(fs.readFileSync(ch010, 'utf8').includes('蚀宴会'), 'ch010 should name 蚀宴会');
  const earlier = fs.readdirSync(chapters).filter((n) => /^ch00\d\.json$/.test(n)).map((n) => path.join(chapters, n));
  assert.deepEqual(hits(earlier, ['蚀宴会']), []);
});

test('admin key: the string 123456 appears nowhere under public/ (text and binary files)', () => {
  const files = walk(path.join(root, 'public'));
  assert.ok(files.length > 50);
  const needle = Buffer.from('123456');
  const found = files.filter((f) => fs.readFileSync(f).includes(needle)).map(rel);
  assert.deepEqual(found, []);
  // the client only forwards what the player typed, in the x-admin-key header; ?key= is gone
  const app = fs.readFileSync(path.join(root, 'public/app.js'), 'utf8');
  assert.match(app, /x-admin-key/);
  assert.doesNotMatch(app, /admin\/dashboard\?key=/);
});

test("no character's forbiddenTermsUntilEnding appears in the pre-ending pool and profile texts", () => {
  const list = Array.isArray(CHARACTERS) ? CHARACTERS : Object.values(CHARACTERS);
  const terms = [...new Set(list.flatMap((c) => c.forbiddenTermsUntilEnding || []))];
  assert.ok(terms.length >= 6, 'expected forbidden terms from game/content.mjs');
  const files = ['public/character-manager.js', 'game/gacha.mjs', 'tools/prototypes/gacha-system.js', 'cards/database.mjs'].map((f) => path.join(root, f));
  assert.deepEqual(hits(files, terms), []);
});

test('B8: the renamed side-story characters stay renamed; 艾琳 only appears in the main line', () => {
  // the side story (scenario/, game/, the main game page, cards, prototypes) must not use 艾琳 / 莉莉安 at all
  const sideStory = [
    ...textFiles('scenario', 'game', 'cards', 'tools/prototypes'),
    ...['public/app.js', 'public/index.html', 'public/character-manager.js', 'public/cards.js'].map((f) => path.join(root, f)),
  ];
  assert.ok(sideStory.some((f) => rel(f) === 'scenario/chapter-01.json'));
  assert.deepEqual(hits(sideStory, ['艾琳', '莉莉安']), []);
  // 艾琳娜 / 莉莉安 are gone everywhere except the rename table of docs/CHARACTER-DESIGN.md
  const everywhere = textFiles('public', 'game', 'cards', 'scenario', 'tools', 'docs').filter((f) => rel(f) !== 'docs/CHARACTER-DESIGN.md');
  assert.deepEqual(hits(everywhere, ['艾琳娜', '莉莉安']), []);
  // the new names are really in use (the guard is not vacuous)
  const scenario = textFiles('scenario').map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  for (const name of ['希尔达', '佩特拉', '欧若拉']) assert.ok(scenario.includes(name), `scenario/ should use ${name}`);
  // and 艾琳 is still 亚克's mother in the main line
  assert.ok(fs.readFileSync(path.join(root, 'public/story/speakers.json'), 'utf8').includes('艾琳'));
});

test('B1/B15: side-story-only identities never reach a canon surface', () => {
  const files = [
    ...['game/gacha.mjs', 'public/character-manager.js', 'cards/database.mjs', 'public/story.html', 'docs/STORE-PAGE-COPY.md'].map((f) => path.join(root, f)),
    ...textFiles('public/story'),
  ];
  assert.ok(files.some((f) => rel(f) === 'public/story/chapters/ch005.json'));
  assert.deepEqual(hits(files, ['赤誓骑士', '猫耳机关师', '月蚀观测者']), []);
});

// ─── 核#14：主线剧透词表 ───
// 来源：剧本/README_30章重構提案.md（§3.2 晨星皇朝、§3.10 五种君主结局、§3.14.5 结局图鉴、§4.3 逐章表、§4.5 入队表）。
// from = 主线里第一次揭晓这个词的正式章（按 §4.3 逐章表取最早的一章）：通关 from 章之前玩家看得到的文本里都不能有它；
// 第 from 章自己的剧本可以写。剧本另有安排时（例如某个名字提前一章出现），改这张表并在提交说明里写明依据。
const MAIN_LINE_SPOILERS = [
  // 姓氏与身世：莉莉丝在正式20报上姓名（艾拉的姓、姐妹关系同时揭晓）
  { term: '瓦尔哈拉', from: 20 }, { term: 'Valhalla', from: 20 },
  { term: '妹妹艾拉', from: 20 }, { term: '姐姐莉莉丝', from: 20 }, { term: '姐姐背叛', from: 20 },
  // 握链的黑袍人具名（正式12）；皇朝的第一颗伏笔：晨星冕御印下的拱浪记号（正式13）
  { term: '莫尔坎', from: 12 },
  { term: '晨星冕', from: 13 }, { term: '晨星皇朝', from: 13 }, { term: '拱潮门', from: 13 },
  // 皇朝正面登场（正式16 册厅）：皇室、御前、白塔构造与制度
  { term: '奥瑞利安', from: 16 }, { term: '阿尔德里克', from: 16 }, { term: '洛温娜', from: 16 }, { term: '塞弗林', from: 16 },
  { term: '阿德拉', from: 16 }, { term: '总册', from: 16 }, { term: '龙井', from: 16 }, { term: '冠缚', from: 16 },
  { term: '护界院', from: 16 }, { term: '献纳', from: 16 },
  // 正式21 天命供奉令、续冠礼预演、叛逆令
  { term: '天命供奉令', from: 21 }, { term: '续冠礼', from: 21 }, { term: '叛逆令', from: 21 },
  // 索拉恩第一次开价（正式25）；黑龙真名（正式27）；册妃诏（正式28）；晨阶刑台与「神帝」（正式29）
  { term: '索拉恩', from: 25 }, { term: '黛薇恩', from: 27 }, { term: '册妃', from: 28 },
  { term: '晨阶刑台', from: 29 }, { term: '斩刑台', from: 29 }, { term: '神帝', from: 29 },
  // 好色结局名「绯冠」先作士兵的外号上屏：正式26起色轴领先且达到40时（提案§4.3第26列），所以从26起
  { term: '绯冠', from: 26 },
  // 帝国与结局名（只在正式30）
  { term: '艾瑟兰帝国', from: 30 }, { term: '月环新城', from: 30 },
  { term: '归名之帝', from: 30 }, { term: '数到三的皇帝', from: 30 }, { term: '数到一的皇帝', from: 30 },
  { term: '八颗心的冠', from: 30 },
  { term: '仁慈君主', from: 30 }, { term: '好色君主', from: 30 }, { term: '无情君主', from: 30 }
];
const spoilersAfter = (highestCleared) => MAIN_LINE_SPOILERS.filter((s) => s.from > highestCleared).map((s) => s.term);
const chapterIds = (upTo) => Array.from({ length: upTo + 1 }, (_, i) => `ch${String(i).padStart(3, '0')}`);

test('核#14: the main-line spoiler list is well-formed (unique terms, chapters 1–30)', () => {
  const terms = MAIN_LINE_SPOILERS.map((s) => s.term);
  assert.equal(new Set(terms).size, terms.length);
  for (const { term, from } of MAIN_LINE_SPOILERS) {
    assert.ok(term.length >= 2, term);
    assert.ok(Number.isInteger(from) && from >= 1 && from <= 30, `${term}: ${from}`);
  }
});

test('核#14: no main-line spoiler on a canon surface that is visible from the start', () => {
  // 角色管理器、卡牌对战（实验模式）的卡面与职业、主页面与主线播放页、商店文案：都不按进度遮挡，开局就能看到。
  // 银轨号 IF 外传（scenario/、外传地图）是另一条时间线，不在这里检查。
  const files = [
    'public/character-manager.js', 'public/character-manager.html', 'cards/database.mjs', 'public/cards.js', 'public/cards.html',
    'public/index.html', 'public/story.html', 'public/story/player.js', 'docs/STORE-PAGE-COPY.md'
  ].map((f) => path.join(root, f)).filter((f) => fs.existsSync(f));
  assert.ok(files.some((f) => rel(f) === 'cards/database.mjs') && files.some((f) => rel(f) === 'public/character-manager.js'));
  assert.deepEqual(hits(files, spoilersAfter(-1)), []);
});

test('核#14: the summon pool reveals each spoiler only after its chapter is cleared (public view at every progress point)', () => {
  for (let highest = -1; highest <= 30; highest += 1) {
    const view = JSON.stringify(publicPools(highest < 0 ? [] : chapterIds(highest)));
    const leaked = spoilersAfter(highest).filter((term) => view.includes(term));
    assert.deepEqual(leaked, [], `after clearing up to ch${String(highest).padStart(3, '0')}`);
  }
  // 不是空检查：正式20通关之后，卡池确实写出莉莉丝和艾拉的姓
  const late = JSON.stringify(publicPools(chapterIds(20)));
  assert.ok(late.includes('莉莉丝·瓦尔哈拉') && late.includes('艾拉·瓦尔哈拉'));
  assert.ok(!JSON.stringify(publicPools(chapterIds(19))).includes('瓦尔哈拉'));
});

// 莉莉丝在正式13以无名的「金发刺客」登场，正式20才报上姓名：卡池（角色卡与她的服装名）在那之前不写她的名和匕首名。
// 角色管理器、卡牌对战等开局可见的页面另有自己的口径，不在这张表里，所以单独检查卡池。
const SUMMON_POOL_NAME_VEILS = [{ term: '莉莉丝', from: 20 }, { term: '昼盲', from: 20 }, { term: '夜醒', from: 20 }];

test('核#14: the summon pool calls her 「金发刺客」 from ch013 and gives her name and weapon names only after ch020', () => {
  for (let highest = -1; highest <= 30; highest += 1) {
    const view = JSON.stringify(publicPools(highest < 0 ? [] : chapterIds(highest)));
    const leaked = SUMMON_POOL_NAME_VEILS.filter((s) => s.from > highest && view.includes(s.term)).map((s) => s.term);
    assert.deepEqual(leaked, [], `after clearing up to ch${String(highest).padStart(3, '0')}`);
    assert.equal(view.includes('金发刺客'), highest >= 13 && highest < 20, `「金发刺客」 after ch${String(highest).padStart(3, '0')}`);
  }
  const named = JSON.stringify(publicPools(chapterIds(20)));
  for (const { term } of SUMMON_POOL_NAME_VEILS) assert.ok(named.includes(term), term);
});

test('核#14: a main-line chapter only names what has been revealed by then', () => {
  const chapters = path.join(root, 'public/story/chapters');
  const files = fs.existsSync(chapters) ? fs.readdirSync(chapters).filter((n) => /^ch\d{3}\.json$/.test(n)) : [];
  assert.ok(files.includes('ch000.json'), 'expected main-line chapters');
  for (const name of files) {
    const n = Number(name.slice(2, 5));
    const found = hits([path.join(chapters, name)], MAIN_LINE_SPOILERS.filter((s) => s.from > n).map((s) => s.term));
    assert.deepEqual(found, [], name);
  }
});
