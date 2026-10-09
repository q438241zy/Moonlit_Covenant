#!/usr/bin/env node
// Build every heroine portrait and every heroine x outfit costume portrait.
//   node tools/art/portrait/build.mjs [--only lia,mia] [--outfits maid,newyear] [--no-costumes] [--lenient] [--verbose]
//   --lenient  draw portraits even if a layer throws (the layer is left out); default is to skip the file
// Output:
//   public/assets/portraits/<heroineId>.svg
//   public/assets/costumes/<heroineId>_<outfitType>.svg
// Broken or missing modules are logged and skipped; the build never aborts because of one module.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { compose } from './base.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const outPortraits = path.join(root, 'public/assets/portraits');
const outCostumes = path.join(root, 'public/assets/costumes');

const args = process.argv.slice(2);
const argVal = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1].split(',').map((s) => s.trim()).filter(Boolean) : null;
};
const only = argVal('--only');
const onlyOutfits = argVal('--outfits');
const noCostumes = args.includes('--no-costumes');
const verbose = args.includes('--verbose');
const lenient = args.includes('--lenient');
const errText = (err) => (verbose ? err.stack || err.message : err.message);

const BUDGET = { portrait: 70 * 1024, costume: 80 * 1024 };
const FORBIDDEN = [/<script/i, /<foreignObject/i, /<text[\s>]/i, /<image[\s>]/i, /\son[a-z]+\s*=/i, /href\s*=\s*"(?!#)/i, /@import|@font-face/i];

async function loadDir(dir, kind) {
  const abs = path.join(here, dir);
  if (!fs.existsSync(abs)) return [];
  const files = fs.readdirSync(abs).filter((f) => f.endsWith('.mjs')).sort();
  const mods = [];
  for (const f of files) {
    try {
      const mod = await import(pathToFileURL(path.join(abs, f)).href);
      const m = mod.default;
      if (!m || typeof m !== 'object') throw new Error('no default export object');
      if (kind === 'heroine' && !m.id) throw new Error('heroine module needs an id');
      if (kind === 'outfit' && (!m.type || typeof m.render !== 'function')) throw new Error('outfit module needs type + render(p)');
      mods.push({ file: f, mod: m });
    } catch (err) {
      console.warn(`[skip] ${dir}/${f}: ${err.message}`);
    }
  }
  return mods;
}

function check(svg, label, budget) {
  const issues = [];
  for (const re of FORBIDDEN) if (re.test(svg)) issues.push(`forbidden markup ${re}`);
  if (!/viewBox="0 0 832 1216"/.test(svg)) issues.push('missing viewBox');
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dup.length) issues.push(`duplicate ids: ${[...new Set(dup)].slice(0, 5).join(', ')}`);
  const filters = (svg.match(/<filter\s/g) || []).length;
  if (filters > 4) issues.push(`${filters} filters (max 4)`);
  const bytes = Buffer.byteLength(svg);
  if (bytes > budget) issues.push(`size ${(bytes / 1024).toFixed(1)}KB over budget ${(budget / 1024).toFixed(0)}KB`);
  for (const i of issues) console.warn(`  ! ${label}: ${i}`);
  return { bytes, ok: !issues.length };
}

function prefixCheck(svg, prefix, label) {
  const bad = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]).filter((id) => !id.startsWith(`${prefix}-`));
  if (bad.length) console.warn(`  ! ${label}: ids without "${prefix}-" prefix: ${bad.slice(0, 5).join(', ')}`);
}

const heroines = (await loadDir('heroines', 'heroine')).filter(({ mod }) => !only || only.includes(mod.id));
const outfits = noCostumes ? [] : (await loadDir('outfits', 'outfit')).filter(({ mod }) => !onlyOutfits || onlyOutfits.includes(mod.type));

fs.mkdirSync(outPortraits, { recursive: true });
if (outfits.length) fs.mkdirSync(outCostumes, { recursive: true });

let written = 0, failed = 0;
for (const { file, mod: h } of heroines) {
  try {
    const svg = compose(h, { lenient });
    const label = `portraits/${h.id}.svg`;
    const { bytes } = check(svg, label, BUDGET.portrait);
    prefixCheck(svg, h.id, label);
    fs.writeFileSync(path.join(outPortraits, `${h.id}.svg`), svg);
    console.log(`wrote ${label} (${(bytes / 1024).toFixed(1)}KB)`);
    written++;
  } catch (err) {
    failed++;
    console.warn(`[fail] heroine ${file}: ${errText(err)}`);
  }
  for (const { file: of, mod: o } of outfits) {
    try {
      const svg = compose(h, { outfit: o, lenient });
      const label = `costumes/${h.id}_${o.type}.svg`;
      const { bytes } = check(svg, label, BUDGET.costume);
      prefixCheck(svg, h.id, label);
      fs.writeFileSync(path.join(outCostumes, `${h.id}_${o.type}.svg`), svg);
      console.log(`wrote ${label} (${(bytes / 1024).toFixed(1)}KB)`);
      written++;
    } catch (err) {
      failed++;
      console.warn(`[fail] ${h.id} x ${of}: ${errText(err)}`);
    }
  }
}
console.log(`done: ${written} written, ${failed} failed, ${heroines.length} heroine(s), ${outfits.length} outfit(s)`);
