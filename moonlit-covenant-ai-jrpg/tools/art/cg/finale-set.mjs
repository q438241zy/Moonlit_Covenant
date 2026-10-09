#!/usr/bin/env node
// Generates the five late-game CGs (1600x900 SVG) for 《月蚀契约》:
//   public/assets/cg/battle-phase3.svg   「它想起了什么」
//   public/assets/cg/aftermath-snow.svg  「记忆之雪」
//   public/assets/cg/ending-seal.svg     「静默契约」
//   public/assets/cg/ending-share.svg    「黎明公开」
//   public/assets/cg/ending-destroy.svg  「永夜终章」
// Usage: node tools/art/cg/finale-set.mjs [outDir] [name ...]
// Zero dependencies; deterministic output (seeded PRNG). Companion of eclipse-cg-set.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as L from './finale-lib.mjs';
import battlePhase3 from './finale-battle-phase3.mjs';
import aftermathSnow from './finale-aftermath-snow.mjs';
import endingSeal from './finale-ending-seal.mjs';
import endingShare from './finale-ending-share.mjs';
import endingDestroy from './finale-ending-destroy.mjs';

const scenes = {
  'battle-phase3': battlePhase3,
  'aftermath-snow': aftermathSnow,
  'ending-seal': endingSeal,
  'ending-share': endingShare,
  'ending-destroy': endingDestroy,
};
const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = process.argv[2] || path.resolve(here, '../../../public/assets/cg');
fs.mkdirSync(outDir, { recursive: true });
const only = process.argv.slice(3);
for (const [name, fn] of Object.entries(scenes)) {
  if (only.length && !only.includes(name)) continue;
  const svg = fn(L);
  if (/<text|<script|<foreignObject|<image|xlink:href|href="(?!#)|@import|url\((?!#)/.test(svg)) throw new Error(`${name}: forbidden markup`);
  const nf = (svg.match(/<filter /g) || []).length;
  if (nf > 4) throw new Error(`${name}: ${nf} filters (max 4)`);
  const ids = [...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  const prefix = name.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  const bad = ids.filter((id) => !id.startsWith(prefix + '-'));
  if (bad.length) throw new Error(`${name}: unprefixed ids ${bad.slice(0, 5)}`);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) throw new Error(`${name}: duplicate ids ${dup.slice(0, 5)}`);
  const kb = Buffer.byteLength(svg) / 1024;
  if (kb > 90) console.warn(`WARNING ${name}: ${kb.toFixed(1)} KB exceeds the 90 KB CG budget`);
  fs.writeFileSync(path.join(outDir, `${name}.svg`), svg);
  console.log(`${name}.svg  ${kb.toFixed(1)} KB  filters=${nf}`);
}
