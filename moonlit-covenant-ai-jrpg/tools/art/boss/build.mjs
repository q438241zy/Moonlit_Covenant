// Build the 食梦兽 boss art (three phases).
//   node tools/art/boss/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dreamEater } from './dream-eater.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
for (const phase of [1, 2, 3]) {
  const rel = `public/assets/boss/dream-eater-${phase}.svg`;
  const svg = dreamEater(phase);
  fs.writeFileSync(path.join(root, rel), svg);
  const filters = (svg.match(/<filter /g) || []).length;
  console.log(`${rel}  ${(Buffer.byteLength(svg) / 1024).toFixed(1)}KB  filters=${filters}`);
}
