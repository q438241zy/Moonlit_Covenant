#!/usr/bin/env node
// 把四张旧的厚涂 PNG（标题页 / 外传立绘，每张约 1.5–1.7MB）压成渐进式 JPEG，并保留 AIGC 隐式标识。
//   node tools/art/raster/compress-legacy.mjs [--quality 86]      （需要 ImageMagick 的 convert 命令）
// 输入：tools/art/raster/ref/{lia,mia,serena,key-visual}.png（只作参考，不随站点发布；集成步骤 I1 从 public/assets/ 移过去）
// 输出：public/assets/{lia,mia,serena,key-visual}.jpg
//   - 不缩放、不裁切：画面右下角依法标注的「图片由AI生成」原样保留；
//   - -strip 去掉 ImageMagick 自带的元数据（输出逐字节稳定），再把 PNG 的 eXIf（腾讯云 AIGC 标识：
//     ImageDescription + 带签名的 UserComment）原样拼回 JPEG 的 APP1 Exif 段；
//   - 四张合计必须 ≤ 0.8MB，超出则报错退出。
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readAigc, insertApp1, jpegAigc } from './aigc.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const NAMES = ['lia', 'mia', 'serena', 'key-visual'];
const BUDGET = 0.8 * 1024 * 1024;
const args = process.argv.slice(2);
const qi = args.indexOf('--quality');
const quality = qi >= 0 ? String(Number(args[qi + 1]) || 86) : '86';

try { execFileSync('convert', ['-version'], { stdio: 'ignore' }); } catch {
  console.error('需要 ImageMagick（convert 命令）。');
  process.exit(2);
}

let total = 0;
for (const name of NAMES) {
  const src = path.join(root, 'tools/art/raster/ref', `${name}.png`);
  if (!fs.existsSync(src)) throw new Error(`${name}.png: tools/art/raster/ref/ 下找不到`);
  const dest = path.join(root, 'public/assets', `${name}.jpg`);
  const png = fs.readFileSync(src);
  const meta = readAigc(png);
  if (!meta.exif && !meta.xmp) throw new Error(`${name}.png: 找不到 AIGC 元数据，拒绝生成没有标识的 JPEG`);
  const jpeg = execFileSync('convert', [src, '-strip', '-interlace', 'Plane', '-sampling-factor', '4:2:0', '-quality', quality, 'jpg:-'], { maxBuffer: 64 * 1024 * 1024 });
  const out = insertApp1(jpeg, meta);
  if (!jpegAigc(out)) throw new Error(`${name}.jpg: AIGC 元数据写入失败`);
  fs.writeFileSync(dest, out);
  total += out.length;
  console.log(`${name}.jpg  ${(out.length / 1024).toFixed(0)}KB  （PNG ${(png.length / 1024).toFixed(0)}KB）`);
}
console.log(`合计 ${(total / 1024 / 1024).toFixed(2)}MB（预算 0.8MB），quality ${quality}`);
if (total > BUDGET) {
  console.error('超出 0.8MB 预算：请降低 --quality。');
  process.exitCode = 1;
}
