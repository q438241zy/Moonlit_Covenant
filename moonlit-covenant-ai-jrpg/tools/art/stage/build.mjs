// Build the stage-scene / UI art. (Boss art lives in tools/art/boss/.)
//   node tools/art/stage/build.mjs            -> everything
//   node tools/art/stage/build.mjs scenes ui  -> only those groups (scenes | ui)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { battleBg, endingBg, campBg } from './scenes.mjs';
import { dawnSeed, eclipseCrest, cardBack, cardPack } from './ui.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const groups = {
  scenes: () => ({
    'public/assets/scenes/battle-bg.svg': battleBg(),
    'public/assets/scenes/ending-bg.svg': endingBg(),
    'public/assets/scenes/camp-bg.svg': campBg(),
  }),
  ui: () => ({
    'public/assets/ui/dawn-seed.svg': dawnSeed(),
    'public/assets/ui/eclipse-crest.svg': eclipseCrest(),
    'public/assets/ui/card-back.svg': cardBack(),
    'public/assets/ui/card-pack.svg': cardPack(),
  }),
};
const want = process.argv.slice(2);
for (const [name, make] of Object.entries(groups)) {
  if (want.length && !want.includes(name)) continue;
  for (const [rel, svg] of Object.entries(make())) {
    const out = path.join(root, rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, svg);
    console.log(`${rel}  ${(Buffer.byteLength(svg) / 1024).toFixed(1)}KB`);
  }
}
