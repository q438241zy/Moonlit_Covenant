#!/usr/bin/env node
// Build every heroine portrait and every heroine x outfit costume portrait.
//   node tools/art/portrait/build.mjs [--only lia,mia] [--outfits maid,newyear] [--no-costumes] [--no-busts] [--variants soft|none]
//                                     [--soft-only] [--lenient] [--verbose]
//   --lenient    draw portraits even if a layer throws (the layer is left out); default is to skip the file
//   --no-busts   skip the transparent 600x800 costume busts
//   --variants   which outfit variants to build (default: every variant an outfit declares; `none` = none)
//   --soft-only  a 12+-only build (服装稿 §1.3 发行备注): an outfit's soft variant is written as its main image and
//                no separate soft files are written. Never commit the result - the repo keeps both versions.
// Output:
//   public/assets/portraits/<heroineId>.svg
//   public/assets/costumes/<heroineId>_<outfitType>.svg              costume portrait (832x1216, with background)
//   public/assets/costumes/soft/<heroineId>_<outfitType>.svg         12+ version, for outfits with variants: ['soft'] (the swimsuits)
//   public/assets/costumes/bust/<heroineId>_<outfitType>.svg         transparent 600x800 bust (skill battles; the 番外 later)
//   public/assets/costumes/bust/soft/<heroineId>_<outfitType>.svg    its 12+ version
// Broken or missing modules are logged and skipped; the build never aborts because of one module.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { compose } from './base.mjs';
import { ACCENTS } from './accents.mjs';
import { portraitBust } from '../story/portrait-bust.mjs';

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
const onlyVariants = argVal('--variants');
const noCostumes = args.includes('--no-costumes');
const noBusts = args.includes('--no-busts');
const softOnly = args.includes('--soft-only');
const verbose = args.includes('--verbose');
const lenient = args.includes('--lenient');
const errText = (err) => (verbose ? err.stack || err.message : err.message);

const BUDGET = { portrait: 70 * 1024, costume: 80 * 1024, bust: 70 * 1024 };
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
      // costumeTypeOfId() in app.js takes the type after the last underscore
      if (kind === 'outfit' && m.type.includes('_')) throw new Error(`outfit type "${m.type}" must not contain an underscore`);
      mods.push({ file: f, mod: m });
    } catch (err) {
      console.warn(`[skip] ${dir}/${f}: ${err.message}`);
    }
  }
  return mods;
}

function check(svg, label, budget, viewBox = '0 0 832 1216') {
  const issues = [];
  for (const re of FORBIDDEN) if (re.test(svg)) issues.push(`forbidden markup ${re}`);
  if (!svg.includes(`viewBox="${viewBox}"`)) issues.push('missing viewBox');
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
const variantsOf = (o) => (Array.isArray(o.variants) ? o.variants : []).filter((v) => !onlyVariants || onlyVariants.includes(v));

fs.mkdirSync(outPortraits, { recursive: true });
if (outfits.length) {
  fs.mkdirSync(outCostumes, { recursive: true });
  if (!noBusts) fs.mkdirSync(path.join(outCostumes, 'bust'), { recursive: true });
  if (!softOnly && outfits.some(({ mod }) => variantsOf(mod).length)) {
    fs.mkdirSync(path.join(outCostumes, 'soft'), { recursive: true });
    if (!noBusts) fs.mkdirSync(path.join(outCostumes, 'bust/soft'), { recursive: true });
  }
}

let written = 0, failed = 0;
const write = (rel, svg, budget, prefix, viewBox) => {
  const { bytes } = check(svg, rel, budget, viewBox);
  prefixCheck(svg, prefix, rel);
  fs.writeFileSync(path.join(root, 'public/assets', rel), svg);
  console.log(`wrote ${rel} (${(bytes / 1024).toFixed(1)}KB)`);
  written++;
};
for (const { file, mod: h } of heroines) {
  const extras = Array.isArray(h.portraitExtras) ? h.portraitExtras : []; // e.g. Lia's tower shield (B10)
  try {
    write(`portraits/${h.id}.svg`, compose(h, { lenient, extras }), BUDGET.portrait, h.id);
  } catch (err) {
    failed++;
    console.warn(`[fail] heroine ${file}: ${errText(err)}`);
  }
  for (const { file: of, mod: o } of outfits) {
    // every costume carries the heroine's own emblem and motif (accents.mjs, audit B11)
    const accent = ACCENTS[h.id] || null;
    const variants = variantsOf(o);
    const jobs = softOnly && variants.includes('soft') ? [['soft', '']] : [[null, ''], ...variants.map((v) => [v, `${v}/`])];
    for (const [variant, dir] of jobs) {
      const name = `${h.id}_${o.type}.svg`;
      try {
        write(`costumes/${dir}${name}`, compose(h, { outfit: o, lenient, extras, accent, variant }), BUDGET.costume, h.id);
        if (!noBusts) {
          const label = `${h.name || h.id} - ${o.label || o.type}`.replace(/"/g, '');
          const bust = portraitBust(h, { prefix: `${h.id}-${o.type}`, label, extras, outfit: o, accent, variant, lenient });
          write(`costumes/bust/${dir}${name}`, bust, BUDGET.bust, h.id, '0 0 600 800');
        }
      } catch (err) {
        failed++;
        console.warn(`[fail] ${h.id} x ${of}${variant ? ` (${variant})` : ''}: ${errText(err)}`);
      }
    }
  }
}
console.log(`done: ${written} written, ${failed} failed, ${heroines.length} heroine(s), ${outfits.length} outfit(s)`);
