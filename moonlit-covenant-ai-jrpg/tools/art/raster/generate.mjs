#!/usr/bin/env node
// 厚涂位图批量出图（零依赖，Node 20+）。清单见 manifest.mjs。
//
//   ARK_API_KEY=… node tools/art/raster/generate.mjs                 # 默认：火山方舟 Seedream
//   SILICONFLOW_API_KEY=… node tools/art/raster/generate.mjs --provider siliconflow
//
// 参数：
//   --only a,b,group:cards   只跑指定任务 id 或分组        --force             已有输出也重出
//   --include-existing       连同已有 PNG 的莉亚/米娅/塞蕾娜立绘一起重出
//   --dry-run                只打印提示词，不调用 API     --concurrency N     并发数（默认 2）
//   --limit N                最多跑 N 张（试跑用）         --model ID          覆盖模型 id
// 环境变量：ARK_IMAGE_MODEL / SILICONFLOW_IMAGE_MODEL 覆盖默认模型；ARK_BASE_URL / SILICONFLOW_BASE_URL 覆盖接口地址。
// 输出写到 tools/art/raster/out/（不入库），再用 finalize.mjs 压缩进 public/assets/paint/。
// 任务可中断重跑：已存在的输出会跳过；每次调用记录在 out/log.jsonl。

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JOBS, NEGATIVE } from './manifest.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const outDir = path.join(root, 'tools/art/raster/out');
const cacheDir = path.join(root, 'tools/art/raster/.cache');

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const PROVIDERS = {
  // 火山方舟（豆包 Seedream）：OpenAI 风格 images/generations，支持多张参考图，b64 直接返回，免去下载第二个域名
  ark: {
    key: 'ARK_API_KEY',
    base: process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
    model: process.env.ARK_IMAGE_MODEL || 'doubao-seedream-4-0-250828',
    body: (job, model, refs) => ({
      model,
      prompt: job.prompt,
      ...(refs.length ? { image: refs.length === 1 ? refs[0] : refs } : {}),
      size: job.size,
      seed: job.seed,
      sequential_image_generation: 'disabled',
      response_format: 'b64_json',
      watermark: false,
    }),
  },
  // 硅基流动：返回图片 URL（需同时放行其图片 CDN 域名），参考图只取第一张
  siliconflow: {
    key: 'SILICONFLOW_API_KEY',
    base: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
    model: process.env.SILICONFLOW_IMAGE_MODEL || 'Kwai-Kolors/Kolors',
    body: (job, model, refs) => ({
      model,
      prompt: job.prompt,
      negative_prompt: NEGATIVE,
      image_size: job.size,
      seed: job.seed,
      batch_size: 1,
      ...(refs.length ? { image: refs[0] } : {}),
    }),
  },
};

const providerName = opt('provider', process.env.ARK_API_KEY ? 'ark' : process.env.SILICONFLOW_API_KEY ? 'siliconflow' : 'ark');
const provider = PROVIDERS[providerName];
if (!provider) throw new Error(`未知 provider：${providerName}`);
const model = opt('model', provider.model);
const apiKey = process.env[provider.key];
const dryRun = flag('dry-run');
if (!dryRun && !apiKey) {
  console.error(`缺少环境变量 ${provider.key}。请在云端环境设置里添加，不要写进代码或聊天。`);
  process.exit(2);
}

// ── 选任务 ──
const only = (opt('only', '') || '').split(',').filter(Boolean);
let jobs = JOBS.filter((j) => {
  if (only.length) return only.some((o) => (o.startsWith('group:') ? j.group === o.slice(6) : j.id === o));
  return flag('include-existing') || !j.existing;
});
if (!flag('force')) jobs = jobs.filter((j) => !fs.existsSync(path.join(root, j.out)));
const limit = Number(opt('limit', 0));
if (limit) jobs = jobs.slice(0, limit);

// ── 参考图：裁掉右下角「图片由AI生成」标识区域并缩到 1024 内，避免模型把水印画进新图 ──
const hasMagick = (() => { try { execFileSync('convert', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; } })();
function refDataUri(rel) {
  const src = path.join(root, rel);
  if (!fs.existsSync(src)) return null;
  let file = src;
  if (hasMagick) {
    fs.mkdirSync(cacheDir, { recursive: true });
    file = path.join(cacheDir, rel.replace(/[\\/]/g, '_').replace(/\.\w+$/, '.jpg'));
    if (!fs.existsSync(file) || fs.statSync(file).mtimeMs < fs.statSync(src).mtimeMs) {
      const watermarked = rel.startsWith('public/assets/');
      execFileSync('convert', [src, ...(watermarked ? ['-gravity', 'north', '-crop', '100%x91%+0+0', '+repage'] : []), '-resize', '1024x1024>', '-quality', '88', file]);
    }
  }
  const mime = file.endsWith('.png') ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

async function callApi(job) {
  const refs = job.refs.map(refDataUri);
  if (refs.some((r) => r === null)) {
    const missing = job.refs.filter((r, i) => refs[i] === null);
    throw new Error(`参考图不存在：${missing.join(', ')}（先跑它依赖的任务：${(job.after || []).join(', ')}）`);
  }
  const res = await fetch(`${provider.base}/images/generations`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(provider.body(job, model, refs)),
    signal: AbortSignal.timeout(180_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 500)}`);
  const json = JSON.parse(text);
  const item = json.data?.[0] || json.images?.[0];
  if (item?.b64_json) return Buffer.from(item.b64_json, 'base64');
  if (item?.url) {
    const img = await fetch(item.url, { signal: AbortSignal.timeout(120_000) });
    if (!img.ok) throw new Error(`下载图片失败 HTTP ${img.status}（${new URL(item.url).host} 可能需要放行）`);
    return Buffer.from(await img.arrayBuffer());
  }
  throw new Error(`响应里没有图片：${text.slice(0, 300)}`);
}

function log(entry) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.appendFileSync(path.join(outDir, 'log.jsonl'), JSON.stringify({ t: new Date().toISOString(), provider: providerName, model, ...entry }) + '\n');
}

async function runJob(job, index) {
  const tag = `[${index + 1}/${jobs.length}] ${job.id}`;
  if (dryRun) {
    console.log(`${tag}  ${job.size}  seed=${job.seed}  refs=${job.refs.join(' + ') || '—'}\n  ${job.prompt}\n`);
    return true;
  }
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const started = Date.now();
    try {
      const buf = await callApi(job);
      const out = path.join(root, job.out);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, buf);
      log({ id: job.id, ok: true, ms: Date.now() - started, bytes: buf.length, seed: job.seed });
      console.log(`${tag}  ✓ ${(buf.length / 1024).toFixed(0)}KB  ${((Date.now() - started) / 1000).toFixed(1)}s`);
      return true;
    } catch (err) {
      log({ id: job.id, ok: false, attempt, error: String(err.message || err).slice(0, 500) });
      console.warn(`${tag}  ✗ 第 ${attempt} 次失败：${err.message}`);
      if (/HTTP 4(00|01|03|04)/.test(err.message) || err.message.startsWith('参考图不存在')) break; // 参数/鉴权问题，重试无用
      await new Promise((r) => setTimeout(r, 4000 * attempt));
    }
  }
  return false;
}

// 依赖立绘的任务（服装、莉莉丝英雄卡）放到立绘之后
const first = jobs.filter((j) => !j.after);
const second = jobs.filter((j) => j.after);
const concurrency = Math.max(1, Number(opt('concurrency', 2)));
console.log(`${dryRun ? '[dry-run] ' : ''}provider=${providerName} model=${model} 任务 ${jobs.length} 个，并发 ${concurrency}`);

let failed = 0;
for (const batch of [first, second]) {
  let next = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (next < batch.length) {
      const i = next++;
      if (!(await runJob(batch[i], jobs.indexOf(batch[i])))) failed += 1;
    }
  }));
}
console.log(failed ? `完成，但有 ${failed} 个任务失败（见 tools/art/raster/out/log.jsonl），重跑即可续传。` : '全部完成。下一步：node tools/art/raster/finalize.mjs');
process.exitCode = failed ? 1 : 0;
