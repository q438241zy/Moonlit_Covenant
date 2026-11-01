// Art assets: AIGC metadata on every raster image the game ships, the story busts, and the raster job list.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { jpegAigc, readAigc, insertApp1, aigcExif } from '../tools/art/raster/aigc.mjs';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (rel) => path.join(projectDir, 'public', rel.replace(/^\//, ''));
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(projectDir, rel), 'utf8'));
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])) : []);
// the four legacy AIGC PNGs are reference-only: integration step I1 moved them from public/assets/ to tools/art/raster/ref/
const legacyPng = (name) => path.join(projectDir, 'tools/art/raster/ref', `${name}.png`);
const hasMagick = (() => { try { execFileSync('convert', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; } })();

test('every paint-over JPEG under public/assets/paint carries AIGC metadata', () => {
  const jpgs = walk(pub('assets/paint')).filter((f) => /\.jpe?g$/i.test(f));
  for (const f of jpgs) assert.ok(jpegAigc(fs.readFileSync(f)), `${path.relative(projectDir, f)} has no AIGC metadata (run npm run art:paint:finalize)`);
  // the manifest only lists files that exist
  const manifest = readJson('public/assets/paint/manifest.json');
  for (const [group, names] of Object.entries(manifest)) {
    for (const name of names) assert.ok(fs.existsSync(pub(`assets/paint/${group}/${name}.jpg`)), `manifest lists missing ${group}/${name}.jpg`);
  }
});

test('the compressed legacy JPEGs keep the AIGC label and stay within 0.8MB', () => {
  let total = 0;
  for (const name of ['lia', 'mia', 'serena', 'key-visual']) {
    const file = pub(`assets/${name}.jpg`);
    assert.ok(fs.existsSync(file), `public/assets/${name}.jpg missing (node tools/art/raster/compress-legacy.mjs)`);
    const buf = fs.readFileSync(file);
    total += buf.length;
    const aigc = jpegAigc(buf);
    assert.ok(aigc, `${name}.jpg has no AIGC metadata`);
    assert.match(aigc, /^\{"AIGC":\{/);
    // same provider record as the source PNG
    const src = readAigc(fs.readFileSync(legacyPng(name)));
    assert.ok(src.exif && buf.includes(src.exif), `${name}.jpg does not carry the PNG's EXIF block verbatim`);
  }
  assert.ok(total <= 0.8 * 1024 * 1024, `legacy JPEGs total ${(total / 1048576).toFixed(2)}MB > 0.8MB`);
});

test('I1: the site ships the JPEGs only; the big PNGs are reference-only and nothing points at them', () => {
  const names = ['lia', 'mia', 'serena', 'key-visual', 'dream-eater'];
  for (const name of names) {
    assert.ok(!fs.existsSync(pub(`assets/${name}.png`)), `public/assets/${name}.png is back in public/ (keep it in tools/art/raster/ref/)`);
    assert.ok(fs.existsSync(legacyPng(name)), `tools/art/raster/ref/${name}.png missing`);
  }
  const sources = [
    ...walk(path.join(projectDir, 'public')).filter((f) => /\.(js|mjs|css|html|json)$/.test(f)),
    ...walk(path.join(projectDir, 'game')).filter((f) => /\.mjs$/.test(f)),
    path.join(projectDir, 'server.mjs'),
  ];
  const ref = new RegExp(`/assets/(${names.join('|')})\\.png`);
  for (const f of sources) {
    const m = fs.readFileSync(f, 'utf8').match(ref);
    assert.equal(m, null, `${path.relative(projectDir, f)} still references ${m && m[0]}`);
  }
});

test('aigc helpers: EXIF round-trips through a JPEG APP1 segment', () => {
  // splice a synthetic label into a real JPEG and read it back
  const jpeg = fs.readFileSync(pub('assets/lia.jpg'));
  const exif = aigcExif('{"AIGC":{"Label":"1","ProduceID":"test"}}');
  const out = insertApp1(jpeg, { exif });
  assert.equal(jpegAigc(out), '{"AIGC":{"Label":"1","ProduceID":"test"}}');
  assert.deepEqual(readAigc(out).exif, exif);
  assert.equal(out.readUInt16BE(0), 0xffd8);
});

test('finalize keeps the source AIGC metadata, or adds a label when the source has none', { skip: !hasMagick && 'ImageMagick (convert) not installed' }, async () => {
  const { finalizeOne } = await import('../tools/art/raster/finalize.mjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-finalize-'));
  try {
    const withMeta = path.join(dir, 'serena.png');
    fs.copyFileSync(legacyPng('serena'), withMeta);
    finalizeOne(withMeta, path.join(dir, 'serena.jpg'), { group: 'portraits', id: 'portrait-serena' });
    assert.match(jpegAigc(fs.readFileSync(path.join(dir, 'serena.jpg'))), /"ServiceProvider"/);
    const plain = path.join(dir, 'plain.png');
    execFileSync('convert', ['-size', '64x64', 'xc:#336', plain]);
    finalizeOne(plain, path.join(dir, 'plain.jpg'), { group: 'story-npc', id: 'story-npc-test' });
    assert.match(jpegAigc(fs.readFileSync(path.join(dir, 'plain.jpg'))), /"Label":"1".*"ProduceID":"story-npc-test"/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('story speakers and locations point at existing art; Lia uses the transparent bust', () => {
  const speakers = readJson('public/story/speakers.json');
  for (const [id, sp] of Object.entries(speakers)) if (sp.art) assert.ok(fs.existsSync(pub(sp.art)), `speaker ${id}: ${sp.art} missing`);
  for (const [id, loc] of Object.entries(readJson('public/story/locations.json'))) assert.ok(fs.existsSync(pub(loc.svg)), `location ${id}: ${loc.svg} missing`);
  assert.equal(speakers.lia.art, '/assets/story/npc/lia.svg');
  assert.equal(speakers.lia_unknown.art, '/assets/story/npc/lia.svg');
  const svg = fs.readFileSync(pub('assets/story/npc/lia.svg'), 'utf8');
  assert.match(svg, /viewBox="0 0 600 800"/);
  // no night backdrop: no full-canvas rects from the portrait background / lighting, no blood moon
  assert.doesNotMatch(svg, /<rect width="832" height="1216"/);
  assert.doesNotMatch(svg, /-moon"|-glassClip|-bgglow/);
  assert.match(svg, /-shieldFace/, 'the tower shield layer is drawn');
  // the gacha / side-story portrait keeps its own background
  assert.match(fs.readFileSync(pub('assets/portraits/lia.svg'), 'utf8'), /<rect width="832" height="1216"/);
});

test('raster job list covers every story background and bust', async () => {
  const { JOBS, SIZE } = await import('../tools/art/raster/manifest.mjs');
  const count = (g) => JOBS.filter((j) => j.group === g).length;
  const locations = readJson('public/story/locations.json');
  const busts = new Set(Object.values(readJson('public/story/speakers.json')).map((s) => s.art).filter((a) => a && a.startsWith('/assets/story/npc/')));
  assert.equal(count('story-bg'), Object.keys(locations).length);
  assert.equal(count('story-npc'), busts.size);
  assert.ok(JOBS.some((j) => j.id === 'story-npc-lia'));
  assert.equal(SIZE['story-bg'], '1600x900');
  assert.equal(SIZE['story-npc'], '600x800');
  assert.equal(new Set(JOBS.map((j) => j.id)).size, JOBS.length, 'job ids are unique');
  // the paint README lists every slot (generated by tools/art/raster/readme.mjs)
  const readme = fs.readFileSync(pub('assets/paint/README.md'), 'utf8');
  for (const j of JOBS) assert.ok(readme.includes(`\`${path.basename(j.out, '.png')}.jpg\``), `paint README misses ${j.id}`);
});

// ---------------------------------------------------------------- audit B7 / B10 / B11 / B18
const portraitDir = path.join(projectDir, 'tools/art/portrait');
const loadModules = async (dir) => {
  const files = fs.readdirSync(path.join(portraitDir, dir)).filter((f) => f.endsWith('.mjs')).sort();
  return Promise.all(files.map(async (f) => (await import(pathToFileURL(path.join(portraitDir, dir, f)).href)).default));
};

test('B10/B11: portraits and costumes are built with Lia\'s shield and every heroine\'s own accents', async () => {
  const { compose } = await import('../tools/art/portrait/base.mjs');
  const { ACCENTS } = await import('../tools/art/portrait/accents.mjs');
  const heroines = await loadModules('heroines');
  const outfits = await loadModules('outfits');
  assert.equal(heroines.length, 8);
  assert.equal(outfits.length, 6);
  const emblems = new Set();
  for (const h of heroines) {
    const kit = ACCENTS[h.id];
    assert.ok(kit, `${h.id} has no costume-accent kit in tools/art/portrait/accents.mjs`);
    emblems.add(kit.emblem(0, 0, 1));
    const extras = h.portraitExtras || [];
    const portrait = fs.readFileSync(pub(`assets/portraits/${h.id}.svg`), 'utf8');
    assert.equal(portrait, compose(h, { extras }), `portraits/${h.id}.svg is stale (npm run art)`);
    for (const o of outfits) {
      const file = fs.readFileSync(pub(`assets/costumes/${h.id}_${o.type}.svg`), 'utf8');
      assert.equal(file, compose(h, { outfit: o, extras, accent: kit }), `costumes/${h.id}_${o.type}.svg is stale (npm run art)`);
      assert.notEqual(file, compose(h, { outfit: o, extras }), `${o.type} gives ${h.id}'s accents no spot`);
      assert.ok(Buffer.byteLength(file) <= 80 * 1024, `costumes/${h.id}_${o.type}.svg over the 80KB budget`);
      // the tower shield is Lia's alone, and she wears it in every costume
      assert.equal(/-shieldFace"/.test(file), h.id === 'lia', `${h.id}_${o.type}: shield layer ${h.id === 'lia' ? 'missing' : 'unexpected'}`);
    }
    assert.ok(Buffer.byteLength(portrait) <= 70 * 1024, `portraits/${h.id}.svg over the 70KB budget`);
    assert.equal(/-shieldFace"/.test(portrait), h.id === 'lia');
  }
  assert.equal(emblems.size, 8, 'every heroine has her own emblem');
});

test('B7: the title background is an original vector composition (R-5)', () => {
  const file = pub('assets/title-bg.svg');
  assert.ok(fs.existsSync(file), 'public/assets/title-bg.svg missing (npm run art)');
  const svg = fs.readFileSync(file, 'utf8');
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 1600 900" role="img" aria-label="[^"]+">/);
  assert.doesNotMatch(svg, /<text[\s>]|<image[\s>]|<script|<foreignObject|\son[a-z]+\s*=|href\s*=\s*"(?!#)/i);
  assert.ok((svg.match(/<filter\s/g) || []).length <= 4, 'at most 4 filters');
  assert.ok(Buffer.byteLength(svg) <= 90 * 1024, 'title background over the 90KB budget');
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length && ids.every((id) => id.startsWith('tbg-')), 'ids carry the tbg- prefix');
  assert.equal(new Set(ids).size, ids.length, 'ids are unique');
  for (const [, ref] of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.includes(ref), `dangling url(#${ref})`);
});

test('B18: the art direction defines an original slime', () => {
  const doc = fs.readFileSync(path.join(projectDir, 'docs/ART-DIRECTION.md'), 'utf8');
  const sec = doc.slice(doc.indexOf('### 3.1 史莱姆'));
  assert.ok(doc.includes('### 3.1 史莱姆'), 'ART-DIRECTION.md has a slime section');
  for (const rule of ['没有水滴尖', '半透明', '没消化的叶子', '不笑']) assert.ok(sec.includes(rule), `slime rule "${rule}" missing`);
});
