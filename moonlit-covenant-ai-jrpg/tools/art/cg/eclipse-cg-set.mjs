#!/usr/bin/env node
// Generates five prologue CGs (1600x900 SVG) for 《月蚀契约》:
//   public/assets/cg/intro-eye.svg       「窗外的眼睛」
//   public/assets/cg/corridor-frost.svg  「记忆之霜」
//   public/assets/cg/battle-descend.svg  「食梦兽降临」
//   public/assets/cg/battle-phase2.svg   「记忆崩塌」
// camp-fire.svg 已由 polish-set.mjs 重绘接管。
// Usage: node tools/art/cg/eclipse-cg-set.mjs [outDir]
// Zero dependencies; deterministic output (seeded PRNG).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as L from './eclipse-cg-lib.mjs';
import { scenes } from './eclipse-cg-scenes.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = process.argv[2] || path.resolve(here, '../../../public/assets/cg');
fs.mkdirSync(outDir, { recursive: true });
const only = process.argv.slice(3);
for (const [name, fn] of Object.entries(scenes)) {
  if (only.length && !only.includes(name)) continue;
  const svg = fn(L);
  if (/<text|<script|<foreignObject|xlink:href|href="(?!#)/.test(svg)) throw new Error(`${name}: forbidden markup`);
  const nf = (svg.match(/<filter /g) || []).length;
  if (nf > 4) throw new Error(`${name}: ${nf} filters (max 4)`);
  const file = path.join(outDir, `${name}.svg`);
  fs.writeFileSync(file, svg);
  console.log(`${name}.svg  ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB  filters=${nf}`);
}
