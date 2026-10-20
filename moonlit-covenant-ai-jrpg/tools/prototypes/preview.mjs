#!/usr/bin/env node
/**
 * 原型存档的本机预览服务器（B13）。
 *
 * 独立抽卡页 gacha-system.* 已移出 public/，游戏服务器不再提供它。这里只为开发者本机查看：
 *   node tools/prototypes/preview.mjs [端口]      （默认 4890，只监听 127.0.0.1）
 * 然后打开 http://127.0.0.1:4890/ （加 ?dev=1 显示后台标签）。
 *
 * 只提供白名单内的文件：两份原型文件，加上它引用的 /icons.js 与 /assets/**（从 public/ 读，防越界）。
 * 响应头沿用游戏服务器的 CSP（script-src 'self'、img-src 'self' data:），页面行为与原来在站内时一致。
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(HERE, '..', '..', 'public');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');

const PROTOTYPE_FILES = {
  '/': path.join(HERE, 'gacha-system.html'),
  '/gacha-system.html': path.join(HERE, 'gacha-system.html'),
  '/gacha-system.js': path.join(HERE, 'gacha-system.js'),
  '/icons.js': path.join(PUBLIC_DIR, 'icons.js'),
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
};

export const PREVIEW_CSP = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'";

/** URL 路径 → 允许读取的绝对路径；不在白名单、解码失败或越出 public/assets 时返回 null。 */
export function resolvePreviewPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  if (Object.hasOwn(PROTOTYPE_FILES, decoded)) return PROTOTYPE_FILES[decoded];
  if (!decoded.startsWith('/assets/')) return null;
  const full = path.resolve(ASSETS_DIR, `.${path.sep}${path.normalize(decoded.slice('/assets/'.length))}`);
  return full.startsWith(ASSETS_DIR + path.sep) ? full : null;
}

export function createPreviewServer() {
  return http.createServer((req, res) => {
    let pathname = '/';
    try {
      pathname = new URL(req.url || '/', 'http://127.0.0.1').pathname;
    } catch { /* 坏 URL 按 404 处理 */ pathname = ''; }
    const file = req.method === 'GET' || req.method === 'HEAD' ? resolvePreviewPath(pathname) : null;
    const headers = { 'x-content-type-options': 'nosniff', 'cache-control': 'no-store', 'content-security-policy': PREVIEW_CSP };
    if (!file) {
      res.writeHead(404, { ...headers, 'content-type': 'text/plain; charset=utf-8' });
      res.end('原型预览只提供 gacha-system 页面及其引用的 /icons.js、/assets/**');
      return;
    }
    fs.readFile(file, (error, body) => {
      if (error) {
        res.writeHead(404, { ...headers, 'content-type': 'text/plain; charset=utf-8' });
        res.end('未找到');
        return;
      }
      res.writeHead(200, { ...headers, 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(req.method === 'HEAD' ? undefined : body);
    });
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const port = Number(process.argv[2] || process.env.PROTO_PORT || 4890);
  createPreviewServer().listen(port, '127.0.0.1', () => {
    console.log(`原型预览：http://127.0.0.1:${port}/ （只在本机；?dev=1 显示后台标签）`);
  });
}
