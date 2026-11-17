#!/usr/bin/env node
// 把 generate.mjs 的原始输出压缩成游戏用 JPEG，写入 public/assets/paint/，并生成 manifest.json。
//   node tools/art/raster/finalize.mjs      （需要 ImageMagick 的 convert 命令）
// 游戏通过 /assets/paint/manifest.json 判断哪些厚涂图已就绪，缺的继续用矢量 SVG。
//
// AIGC 隐式标识：ImageMagick 的 -strip 会丢掉服务商写在原图里的 AI 生成标识，所以这里先 -strip（输出稳定），
// 再把原图的 AIGC 元数据（PNG eXIf / JPEG Exif / XMP，见 aigc.mjs）写回 JPEG 的 APP1 段；原图里找不到时，
// 写入一段最小的 EXIF（ImageDescription = {"AIGC":{"Label":"1",…}}），保证每张上线的厚涂图都带标识。
// test/art-assets.test.mjs 会检查 public/assets/paint/ 下每张 JPEG 都带 AIGC 信息。

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JOBS, SIZE, ALPHA_GROUPS } from './manifest.mjs';
import { readAigc, aigcExif, insertApp1, jpegAigc, insertPngExif, pngAigc } from './aigc.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const paintDir = path.join(root, 'public/assets/paint');
const QUALITY = { cards: '80', cg: '82', scenes: '80', 'story-bg': '82', 'story-insert': '82' };
const TOP = new Set(['portraits', 'costumes', 'costumes-soft', 'costumes-bust', 'costumes-bust-soft', 'story-npc']);

export const hasMagick = () => { try { execFileSync('convert', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; } };

/** compress one raw image into a game JPEG for `group`, keeping (or adding) its AIGC metadata */
export function finalizeOne(src, dest, { group, id, target }) {
  const size = target || SIZE[group];
  if (!size) throw new Error(`finalize: unknown group ${group}`);
  if (ALPHA_GROUPS.has(group)) return finalizeAlpha(src, dest, { group, id, size });
  const jpeg = execFileSync('convert', [src, '-resize', `${size}^`, '-gravity', TOP.has(group) ? 'north' : 'center',
    '-extent', size, '-strip', '-interlace', 'Plane', '-quality', QUALITY[group] || '84',
    '-set', 'comment', 'AI-generated image (月蚀契约 tools/art/raster)', 'jpg:-'], { maxBuffer: 64 * 1024 * 1024 });
  const meta = readAigc(fs.readFileSync(src));
  if (!meta.exif && !meta.xmp) {
    meta.exif = aigcExif(JSON.stringify({ AIGC: { Label: '1', ContentProducer: '', ProduceID: id, ContentPropagator: '月蚀契约 tools/art/raster', PropagateID: id } }));
  }
  const out = insertApp1(jpeg, meta);
  if (!jpegAigc(out)) throw new Error(`finalize: ${dest} lost its AIGC metadata`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, out);
  return out.length;
}

/** 透明底的组（胸像）：裁成游戏尺寸的 PNG，保留 alpha，再写回 AIGC 元数据（PNG eXIf 块） */
function finalizeAlpha(src, dest, { id, size }) {
  const png = execFileSync('convert', [src, '-resize', `${size}^`, '-gravity', 'north', '-background', 'none', '-extent', size, '-strip', 'png32:-'], { maxBuffer: 64 * 1024 * 1024 });
  const meta = readAigc(fs.readFileSync(src));
  const exif = meta.exif || aigcExif(JSON.stringify({ AIGC: { Label: '1', ContentProducer: '', ProduceID: id, ContentPropagator: '月蚀契约 tools/art/raster', PropagateID: id } }));
  const out = insertPngExif(png, exif);
  if (!pngAigc(out)) throw new Error(`finalize: ${dest} lost its AIGC metadata`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, out);
  return out.length;
}

function main() {
  if (!hasMagick()) {
    console.error('需要 ImageMagick（convert 命令）。');
    process.exit(2);
  }
  const manifest = {};
  let done = 0;
  for (const job of JOBS) {
    const src = path.join(root, job.out);
    if (!fs.existsSync(src)) continue;
    const name = path.basename(job.out, path.extname(job.out));
    const alpha = ALPHA_GROUPS.has(job.group);
    const dest = path.join(paintDir, job.group, `${name}.${alpha ? 'png' : 'jpg'}`);
    const stale = !fs.existsSync(dest) || fs.statSync(dest).mtimeMs < fs.statSync(src).mtimeMs || !(alpha ? pngAigc : jpegAigc)(fs.readFileSync(dest));
    if (stale) {
      finalizeOne(src, dest, job);
      done += 1;
    }
    (manifest[job.group] ||= []).push(name);
  }
  fs.mkdirSync(paintDir, { recursive: true });
  fs.writeFileSync(path.join(paintDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  const total = Object.values(manifest).reduce((n, list) => n + list.length, 0);
  console.log(`已就绪 ${total} 张（本次压缩 ${done} 张）→ public/assets/paint/manifest.json`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
