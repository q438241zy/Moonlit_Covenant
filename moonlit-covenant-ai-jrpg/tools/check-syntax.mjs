#!/usr/bin/env node
/**
 * 全量语法检查（`npm run check`）。
 *
 * 遍历项目里的 *.js / *.mjs / *.cjs，逐个执行 `node --check`；同时确认 *.json 都能被 JSON.parse。
 * 覆盖：根目录脚本（server.mjs 等）以及 public、game、cards、scenario、tools、test 目录。
 * 跳过 node_modules 和以「.」开头的目录（.git、出图缓存等）。
 *
 * 用法：node tools/check-syntax.mjs [项目根]   （默认是本文件所在目录的上一级）
 * 不依赖 shell，Windows / macOS / Linux 都能直接跑；有任何文件失败时退出码为 1。
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const SCAN_DIRS = ['public', 'game', 'cards', 'scenario', 'tools', 'test'];
const SCRIPT_EXT = new Set(['.js', '.mjs', '.cjs']);
const JSON_EXT = new Set(['.json']);
// tools/art/raster/out/ 是出图的原始大图缓存（已在 .gitignore 里），不属于源码
const SKIP_RELATIVE = new Set(['tools/art/raster/out']);

const toPosix = (p) => p.split(path.sep).join('/');

/** 列出 root 下需要检查的文件，返回 { scripts, jsons }（均为绝对路径，按字母序）。 */
export function collectFiles(root) {
  const scripts = [];
  const jsons = [];
  const visit = (dir) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        if (SKIP_RELATIVE.has(toPosix(path.relative(root, full)))) continue;
        visit(full);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SCRIPT_EXT.has(ext)) scripts.push(full);
        else if (JSON_EXT.has(ext)) jsons.push(full);
      }
    }
  };
  // 根目录只看文件本身（server.mjs、package.json 等），不递归
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (SCRIPT_EXT.has(ext)) scripts.push(path.join(root, entry.name));
    else if (JSON_EXT.has(ext)) jsons.push(path.join(root, entry.name));
  }
  for (const dir of SCAN_DIRS) visit(path.join(root, dir));
  scripts.sort();
  jsons.sort();
  return { scripts, jsons };
}

function nodeCheck(file, cwd) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['--check', file], { cwd, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', (error) => resolve({ file, ok: false, message: String(error?.message || error) }));
    child.on('close', (code) => resolve({ file, ok: code === 0, message: stderr.trim() }));
  });
}

async function runPool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  const lanes = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(lanes);
  return results;
}

/** 检查 root 下全部文件；返回 { checked, failures: [{ file, message }] }。 */
export async function checkSyntax(root) {
  const { scripts, jsons } = collectFiles(root);
  const failures = [];
  const concurrency = Math.max(2, Math.min(8, (os.availableParallelism?.() ?? os.cpus().length) || 2));
  const results = await runPool(scripts, concurrency, (file) => nodeCheck(file, root));
  for (const result of results) if (!result.ok) failures.push({ file: result.file, message: result.message });
  for (const file of jsons) {
    try {
      JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
    } catch (error) {
      failures.push({ file, message: `JSON 解析失败：${error.message}` });
    }
  }
  return { checked: { scripts: scripts.length, jsons: jsons.length }, failures };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const root = path.resolve(process.argv[2] || defaultRoot);
  const { checked, failures } = await checkSyntax(root);
  if (failures.length) {
    for (const { file, message } of failures) {
      console.error(`\n✗ ${toPosix(path.relative(root, file))}\n${message}`);
    }
    console.error(`\n语法检查失败：${failures.length} 个文件有错误（共检查脚本 ${checked.scripts} 个、JSON ${checked.jsons} 个）。`);
    process.exitCode = 1;
  } else {
    console.log(`语法检查通过：脚本 ${checked.scripts} 个、JSON ${checked.jsons} 个。`);
  }
}
