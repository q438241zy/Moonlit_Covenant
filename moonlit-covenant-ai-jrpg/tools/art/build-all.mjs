#!/usr/bin/env node
// 一键重建全部矢量美术资产（顺序有依赖：polish-set 覆盖旧 CG 生成器，build-cards 依赖基础卡面）。
//   node tools/art/build-all.mjs        （npm run art）
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const steps = [
  ['立绘与服装', 'tools/art/portrait/build.mjs'],
  ['CG 前半', 'tools/art/cg/eclipse-cg-set.mjs'],
  ['CG 后半', 'tools/art/cg/finale-set.mjs'],
  ['CG 精修', 'tools/art/cg/polish-set.mjs'],
  ['Boss', 'tools/art/boss/build.mjs'],
  ['场景与 UI', 'tools/art/stage/build.mjs'],
  ['世界地图', 'tools/art/map/build-map.mjs'],
  ['主线场景与 NPC', 'tools/art/story/build.mjs'],
  ['卡面 中立/莉亚', 'tools/art/cards/neutral-lia.mjs'],
  ['卡面 莉莉丝/塞蕾娜', 'tools/art/cards/lilith-serena.mjs'],
  ['进化卡面', 'tools/art/build-cards.mjs'],
];
for (const [label, script] of steps) {
  console.log(`\n== ${label} (${script})`);
  execFileSync(process.execPath, [script], { cwd: root, stdio: 'inherit' });
}
