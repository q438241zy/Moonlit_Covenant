#!/usr/bin/env node
// Build the story-mode art (主线剧情背景 + NPC 剪影胸像).
//   node tools/art/story/build.mjs               -> everything
//   node tools/art/story/build.mjs bg            -> all 21 backgrounds
//   node tools/art/story/build.mjs npc           -> all 12 NPC busts
//   node tools/art/story/build.mjs hemai-day aku -> just those ids
// Output: public/assets/story/bg/<id>.svg (1600×900) and public/assets/story/npc/<id>.svg (600×800, transparent).
// Every file is validated against docs/ART-DIRECTION.md §4 (self-contained, no text/script/external refs,
// prefixed ids, ≤ 4 filters, size budget). Deterministic: same input -> byte-identical output.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { villageBgs } from './bg-village.mjs';
import { nightBgs } from './bg-night.mjs';
import { dawnBgs } from './bg-dawn.mjs';
import { townBgs } from './bg-town.mjs';
import { millBgs } from './bg-mill.mjs';
import { npcBusts } from './npc.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const locations = JSON.parse(fs.readFileSync(path.join(root, 'public/story/locations.json'), 'utf8'));
const speakers = JSON.parse(fs.readFileSync(path.join(root, 'public/story/speakers.json'), 'utf8'));

const bgs = { ...villageBgs, ...nightBgs, ...dawnBgs, ...townBgs, ...millBgs };
const BG_BUDGET = 90 * 1024, NPC_BUDGET = 70 * 1024;

function validate(rel, svg, { w, h, budget }) {
  const errs = [];
  const bytes = Buffer.byteLength(svg);
  if (bytes > budget) errs.push(`size ${(bytes / 1024).toFixed(1)}KB > ${(budget / 1024).toFixed(0)}KB`);
  if (!svg.includes(`viewBox="0 0 ${w} ${h}"`)) errs.push(`viewBox must be 0 0 ${w} ${h}`);
  if (/<svg[^>]*\s(width|height)=/.test(svg)) errs.push('root <svg> must not hard-code width/height');
  for (const [re, what] of [[/<text\b/, '<text>'], [/<script\b/i, '<script>'], [/\son[a-z]+\s*=/i, 'event attribute'], [/<image\b/, '<image>'], [/<foreignObject/i, '<foreignObject>'], [/(xlink:)?href\s*=\s*"(?!#)/, 'external href'], [/url\((?!#)/, 'external url()'], [/@import|<style/i, 'stylesheet']]) {
    if (re.test(svg)) errs.push(`forbidden ${what}`);
  }
  const filters = (svg.match(/<filter\b/g) || []).length;
  if (filters > 4) errs.push(`${filters} filters > 4`);
  const prefix = (svg.match(/\sid="([^"-]+)-/) || [])[1];
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const bad = ids.filter((id) => !prefix || !id.startsWith(`${prefix}-`));
  if (bad.length) errs.push(`ids without the file prefix: ${bad.slice(0, 5).join(', ')}`);
  if (new Set(ids).size !== ids.length) errs.push('duplicate ids');
  for (const m of svg.matchAll(/url\(#([^)]+)\)|href="#([^"]+)"/g)) {
    const ref = m[1] || m[2];
    if (!ids.includes(ref)) { errs.push(`dangling reference #${ref}`); break; }
  }
  if (/NaN|undefined|Infinity/.test(svg)) errs.push('NaN/undefined in markup');
  return { errs, bytes, filters };
}

const want = process.argv.slice(2);
const pick = (group, id) => !want.length || want.includes(group) || want.includes(id);
const jobs = [];
for (const id of Object.keys(locations)) {
  if (!bgs[id]) { console.error(`missing background generator for location "${id}"`); process.exitCode = 1; continue; }
  if (pick('bg', id)) jobs.push({ id, rel: `public/assets/story/bg/${id}.svg`, make: bgs[id], w: 1600, h: 900, budget: BG_BUDGET });
}
for (const id of Object.keys(bgs)) if (!locations[id]) console.warn(`note: generator "${id}" has no entry in locations.json`);
for (const [id, make] of Object.entries(npcBusts)) {
  if (!speakers[id]) console.warn(`note: bust "${id}" has no entry in speakers.json`);
  if (pick('npc', id)) jobs.push({ id, rel: `public/assets/story/npc/${id}.svg`, make: () => make(speakers[id]?.color), w: 600, h: 800, budget: NPC_BUDGET });
}
for (const [id, sp] of Object.entries(speakers)) {
  if (sp.art && sp.art.startsWith('/assets/story/npc/') && !npcBusts[id]) { console.error(`missing bust generator for speaker "${id}"`); process.exitCode = 1; }
}

let total = 0;
for (const job of jobs) {
  const svg = job.make();
  const { errs, bytes, filters } = validate(job.rel, svg, job);
  total += bytes;
  const out = path.join(root, job.rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, svg);
  console.log(`${errs.length ? 'FAIL' : 'ok  '} ${job.rel.padEnd(46)} ${(bytes / 1024).toFixed(1).padStart(5)}KB  filters:${filters}${errs.length ? '  ' + errs.join('; ') : ''}`);
  if (errs.length) process.exitCode = 1;
}
console.log(`${jobs.length} file(s), ${(total / 1024).toFixed(0)}KB total`);
