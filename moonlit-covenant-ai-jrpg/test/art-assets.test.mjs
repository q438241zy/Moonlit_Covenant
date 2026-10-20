// Art assets: AIGC metadata on every raster image the game ships, the story busts, and the raster job list.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { jpegAigc, readAigc, insertApp1, aigcExif } from '../tools/art/raster/aigc.mjs';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (rel) => path.join(projectDir, 'public', rel.replace(/^\//, ''));
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(projectDir, rel), 'utf8'));
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])) : []);
// the four legacy AIGC PNGs live in public/assets/ until integration step I1 moves them to tools/art/raster/ref/
const legacyPng = (name) => [path.join(projectDir, 'tools/art/raster/ref', `${name}.png`), pub(`assets/${name}.png`)].find((f) => fs.existsSync(f));
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
