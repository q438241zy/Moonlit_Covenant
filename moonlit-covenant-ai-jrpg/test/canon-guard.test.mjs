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
//     (summon pool, character manager, card texts, the main-line player and its chapters, the store copy).
// test/ is skipped on purpose: the tests themselves list the banned strings.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHARACTERS } from '../game/content.mjs';

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
