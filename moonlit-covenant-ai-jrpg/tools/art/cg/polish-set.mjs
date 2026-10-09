#!/usr/bin/env node
// Writes the polished character CGs (1600x900 SVG) for 《月蚀契约》:
//   public/assets/cg/camp-fire.svg       「战前餐车」 full repaint      (polish-camp-fire.mjs)
//   public/assets/cg/aftermath-snow.svg  「记忆之雪」 Lia refinement    (polish-aftermath-lia.mjs)
// These supersede the camp-fire / aftermath-snow output of eclipse-cg-set.mjs / finale-set.mjs:
// run this script after those two if they are ever re-run.
// Usage: node tools/art/cg/polish-set.mjs [outDir] [name ...]
// Zero dependencies; deterministic output (seeded PRNG).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { campFire } from './polish-camp-fire.mjs';
import { aftermathSnowPolished } from './polish-aftermath-lia.mjs';

const scenes = { 'camp-fire': campFire, 'aftermath-snow': aftermathSnowPolished };
const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = process.argv[2] || path.resolve(here, '../../../public/assets/cg');
fs.mkdirSync(outDir, { recursive: true });
const only = process.argv.slice(3);
for (const [name, fn] of Object.entries(scenes)) {
  if (only.length && !only.includes(name)) continue;
  const svg = fn();
  if (/<text|<script|<foreignObject|<image|xlink:href|href="(?!#)|@import|url\((?!#)| on\w+=/.test(svg)) throw new Error(`${name}: forbidden markup`);
  const nf = (svg.match(/<filter /g) || []).length;
  if (nf > 4) throw new Error(`${name}: ${nf} filters (max 4)`);
  const ids = [...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  const prefix = name.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  const bad = ids.filter((id) => !id.startsWith(prefix + '-'));
  if (bad.length) throw new Error(`${name}: unprefixed ids ${bad.slice(0, 5)}`);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) throw new Error(`${name}: duplicate ids ${dup.slice(0, 5)}`);
  const refs = [...svg.matchAll(/(?:href="#|url\(#)([^")]+)/g)].map((m) => m[1]).filter((r) => !ids.includes(r));
  if (refs.length) throw new Error(`${name}: dangling references ${[...new Set(refs)].slice(0, 5)}`);
  const kb = Buffer.byteLength(svg) / 1024;
  if (kb > 90) throw new Error(`${name}: ${kb.toFixed(1)} KB exceeds the 90 KB CG budget`);
  fs.writeFileSync(path.join(outDir, `${name}.svg`), svg);
  console.log(`${name}.svg  ${kb.toFixed(1)} KB  filters=${nf}`);
}
