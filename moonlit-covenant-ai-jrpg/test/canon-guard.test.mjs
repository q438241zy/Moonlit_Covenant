// Integration step I2: regression guards that span every track.
//   - canon spellings (塞雷娜 / 米娅·玲, 设定集 wins): the old 塞蕾娜 / 米娅·铃 must not come back anywhere in the
//     shipped code, data, generators or docs (whole strings only; a lone 铃 / 蕾 is fine, e.g. 羊铃 / 芙蕾娅);
//   - the side-story spoilers 蚀宴会 / 第27章 must not reach any player-facing file;
//   - the admin key is never hard-coded on the client: the server owns it (ADMIN_KEY, default 123456,
//     header x-admin-key only), so the string 123456 must not appear anywhere under public/ (binary files included);
//   - no character's forbiddenTermsUntilEnding may leak into the pre-ending pool / profile texts.
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

test('side-story spoilers 蚀宴会 / 第27章 stay out of every player-facing file', () => {
  const files = textFiles('public', 'game', 'cards', 'scenario');
  assert.ok(files.some((f) => rel(f) === 'public/character-manager.js'));
  assert.deepEqual(hits(files, ['蚀宴会', '第27章']), []);
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
  const files = ['public/character-manager.js', 'game/gacha.mjs', 'public/gacha-system.js', 'cards/database.mjs'].map((f) => path.join(root, f));
  assert.deepEqual(hits(files, terms), []);
});
