#!/usr/bin/env node
// 把 generate.mjs 的原始输出压缩成游戏用 JPEG，写入 public/assets/paint/，并生成 manifest.json。
//   node tools/art/raster/finalize.mjs      （需要 ImageMagick 的 convert 命令）
// 游戏通过 /assets/paint/manifest.json 判断哪些厚涂图已就绪，缺的继续用矢量 SVG。

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JOBS } from './manifest.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const paintDir = path.join(root, 'public/assets/paint');

// 与矢量资产同尺寸，CSS 无需改动比例
const SIZE = { portraits: '832x1216', costumes: '832x1216', cg: '1600x900', scenes: '1600x900', cards: '512x512', boss: '1000x1000' };
const QUALITY = { cards: '80', cg: '82', scenes: '80' };

try { execFileSync('convert', ['-version'], { stdio: 'ignore' }); } catch {
  console.error('需要 ImageMagick（convert 命令）。');
  process.exit(2);
}

const manifest = {};
let done = 0;
for (const job of JOBS) {
  const src = path.join(root, job.out);
  if (!fs.existsSync(src)) continue;
  const name = path.basename(job.out, path.extname(job.out));
  const dest = path.join(paintDir, job.group, `${name}.jpg`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fs.existsSync(dest) || fs.statSync(dest).mtimeMs < fs.statSync(src).mtimeMs) {
    execFileSync('convert', [src, '-resize', `${SIZE[job.group]}^`, '-gravity', job.group === 'portraits' || job.group === 'costumes' ? 'north' : 'center',
      '-extent', SIZE[job.group], '-strip', '-interlace', 'Plane', '-quality', QUALITY[job.group] || '84',
      '-set', 'comment', 'AI-generated image (月蚀契约 tools/art/raster)', dest]);
    done += 1;
  }
  (manifest[job.group] ||= []).push(name);
}
fs.mkdirSync(paintDir, { recursive: true });
fs.writeFileSync(path.join(paintDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
const total = Object.values(manifest).reduce((n, list) => n + list.length, 0);
console.log(`已就绪 ${total} 张（本次压缩 ${done} 张）→ public/assets/paint/manifest.json`);
