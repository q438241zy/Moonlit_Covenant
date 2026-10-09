#!/usr/bin/env node
// Evolved card art — derives public/assets/cards/<id>_e.svg from the base art <id>.svg.
//   node tools/art/build-cards.mjs [--only lia_hero,n_wisp]
// Covers every card in cards/database.mjs whose `artEvolve` is set (followers only; spells keep '').
// Zero dependencies.
//
// The base art is produced by tools/art/cards/*.mjs with a fixed top-level layering:
//   <defs/> · background… · <g stroke-linejoin="round" …>SUBJECT</g> · overlays (particles, wash, vignette, fade)
// The evolved version keeps that art intact and wraps it in an "awakened" treatment:
//   background -> warm golden aura + sunburst + halo rings (behind the subject)
//   -> soft gold outline around the subject silhouette (alpha-mask dilation, no filter)
//   -> SUBJECT -> golden rim light on its upper-right edge (silhouette minus shifted silhouette)
//   -> original overlays -> warm grade + top light -> gold sparkles & glints.
// Rules kept (docs/ART-DIRECTION.md §4): self-contained (SVG-as-image), no <script>/<text>/<image>/
// external href, every id re-prefixed to "<cardId>_e-", no new <filter> (card budget stays ≤ 1).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARDS } from '../../cards/database.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const PUBLIC = path.join(root, 'public');
const BUDGET = 24 * 1024; // base ≤ 14KB + treatment (ids grow by 2 chars per reference)

// ------------------------------------------------------------------ helpers
const r1 = (v) => {
  const x = Math.round(v * 10) / 10;
  return Object.is(x, -0) ? 0 : x;
};
function rng(str) {
  let a = [...str].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619), 2166136261) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const stops = (list) => list.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null && a !== 1 ? ` stop-opacity="${a}"` : ''}/>`).join('');
/** concave four-point sparkle */
const sparkle = (cx, cy, rr, k = 0.2) => {
  const q = rr * k;
  return `M${r1(cx)} ${r1(cy - rr)}Q${r1(cx + q)} ${r1(cy - q)} ${r1(cx + rr)} ${r1(cy)}Q${r1(cx + q)} ${r1(cy + q)} ${r1(cx)} ${r1(cy + rr)}Q${r1(cx - q)} ${r1(cy + q)} ${r1(cx - rr)} ${r1(cy)}Q${r1(cx - q)} ${r1(cy - q)} ${r1(cx)} ${r1(cy - rr)}Z`;
};
const rhomb = (cx, cy, w, h) => `M${r1(cx)} ${r1(cy - h)}L${r1(cx + w)} ${r1(cy)}L${r1(cx)} ${r1(cy + h)}L${r1(cx - w)} ${r1(cy)}Z`;

/** Split the inner markup of the root <svg> into its top-level elements. */
function topLevel(inner) {
  const re = /<!--[\s\S]*?-->|<(\/?)([A-Za-z][\w:.-]*)((?:\s+[\w:.-]+\s*=\s*"[^"]*")*)\s*(\/?)>/g;
  const out = [];
  let depth = 0, start = -1, tag = '', m;
  while ((m = re.exec(inner))) {
    if (m[0].startsWith('<!--')) continue;
    const [all, close, name, attrs, self] = m;
    if (close) {
      depth--;
      if (depth < 0) throw new Error(`unbalanced </${name}>`);
      if (depth === 0) out.push({ tag, attrs: out.pending, text: inner.slice(start, m.index + all.length) });
    } else if (self) {
      if (depth === 0) out.push({ tag: name, attrs, text: all });
    } else {
      if (depth === 0) { start = m.index; tag = name; out.pending = attrs; }
      depth++;
    }
  }
  if (depth !== 0) throw new Error('unbalanced markup');
  delete out.pending;
  return out;
}

/** Re-prefix every id (and its url(#…) / href="#…" references) from "<id>-" to "<id>_e-". */
function reprefix(svg, from, to) {
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const map = new Map(ids.map((x) => [x, x.startsWith(from) ? to + x.slice(from.length) : `${to}x-${x}`]));
  const sub = (x) => map.get(x) ?? x;
  const unknown = new Set();
  const ref = (x) => { if (!map.has(x)) unknown.add(x); return sub(x); };
  const outSvg = svg
    .replace(/(\sid=")([^"]+)(")/g, (_, a, x, b) => a + sub(x) + b)
    .replace(/url\((['"]?)#([^)'"]+)\1\)/g, (_, q, x) => `url(${q}#${ref(x)}${q})`)
    .replace(/((?:xlink:)?href=")#([^"]+)(")/g, (_, a, x, b) => a + '#' + ref(x) + b);
  if (unknown.size) throw new Error(`dangling references: ${[...unknown].join(', ')}`);
  return outSvg;
}

/** focus point of the composition, read from the class background gradient (<id>-bg). */
function focusOf(svg, id) {
  const m = svg.match(new RegExp(`<radialGradient id="${id}-bg"([^>]*)>`));
  const attr = (k, d) => { const a = m && m[1].match(new RegExp(`\\s${k}="([^"]+)"`)); return a ? parseFloat(a[1]) : d; };
  return [r1(attr('cx', 0.5) * 300), r1(attr('cy', 0.5) * 300)];
}

// ------------------------------------------------------------------ the evolved treatment
function evolve(card, src) {
  const id = card.id;
  const P = `${id}_e`;
  const p = (n) => `${P}-${n}`;
  const rootM = src.match(/^\s*<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/);
  if (!rootM) throw new Error('not an <svg> document');
  const vb = (rootM[1].match(/viewBox="([^"]+)"/) || [])[1];
  if (vb !== '0 0 300 300') throw new Error(`unexpected viewBox ${vb}`);
  const [fx, fy] = focusOf(src, id);
  const inner = reprefix(rootM[2], `${id}-`, `${P}-`);
  const parts = topLevel(inner);
  const defsIdx = parts.findIndex((x) => x.tag === 'defs');
  // the subject group: last top-level <g> carrying the generator's stroke-linejoin="round"
  let bodyIdx = -1;
  parts.forEach((x, i) => { if (x.tag === 'g' && /stroke-linejoin="round"/.test(x.attrs || '')) bodyIdx = i; });
  if (bodyIdx < 0) throw new Error('subject group not found');
  const defsInner = defsIdx >= 0 ? parts[defsIdx].text.replace(/^<defs[^>]*>/, '').replace(/<\/defs>$/, '') : '';
  const bg = parts.slice(0, bodyIdx).filter((_, i) => i !== defsIdx).map((x) => x.text).join('');
  const body = parts[bodyIdx].text.replace(/^<g\b/, `<g id="${p('body')}"`);
  if (/^<g\b[^>]*\sid=/.test(parts[bodyIdx].text)) throw new Error('subject group already has an id');
  const ov = parts.slice(bodyIdx + 1).map((x) => x.text).join('');

  const rand = rng(P);
  const rank = { bronze: 0, silver: 1, gold: 2, legendary: 3 }[card.rarity] ?? 0;
  const defs = [];
  // ── aura behind the subject (screen-blended so the class background shows through warm)
  defs.push(`<radialGradient id="${p('aura')}" gradientUnits="userSpaceOnUse" cx="${fx}" cy="${fy}" r="168">${stops([[0, '#fff6de', 0.78], [0.14, '#ffe2a0', 0.55], [0.34, '#ffc062', 0.24], [0.6, '#ffa040', 0.06], [1, '#ffa040', 0]])}</radialGradient>`);
  defs.push(`<radialGradient id="${p('rayg')}" gradientUnits="userSpaceOnUse" cx="${fx}" cy="${fy}" r="215">${stops([[0, '#fff0c0', 0.6], [0.25, '#ffd57a', 0.32], [0.6, '#ffc35a', 0.08], [1, '#ffc35a', 0]])}</radialGradient>`);
  // ── silhouette masks (alpha): s0 = subject, s1 = subject nudged down-left (for the rim), o = dilated subject (outline)
  const mk = (name, uses) => `<mask id="${p(name)}" mask-type="alpha" maskUnits="userSpaceOnUse" x="-20" y="-20" width="340" height="340">${uses}</mask>`;
  const use = (dx, dy) => `<use href="#${p('body')}"${dx || dy ? ` transform="translate(${r1(dx)} ${r1(dy)})"` : ''}/>`;
  defs.push(mk('s0', use(0, 0)));
  defs.push(mk('s1', use(-3.4, 2.8)));
  let ring = '';
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; ring += use(Math.cos(a) * 2.6, Math.sin(a) * 2.6); }
  defs.push(mk('o', ring));
  // rim = subject minus nudged subject (luminance mask built from the two alpha masks)
  defs.push(`<mask id="${p('rim')}" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="300"><rect width="300" height="300" fill="#fff" mask="url(#${p('s0')})"/><rect width="300" height="300" fill="#000" mask="url(#${p('s1')})"/></mask>`);
  defs.push(`<linearGradient id="${p('rimg')}" x1="1" y1="0" x2="0.15" y2="1">${stops([[0, '#fffbe8'], [0.45, '#ffe08f'], [1, '#ffb44f', 0.55]])}</linearGradient>`);
  // outline: bright at the top, fading out toward the floor so grass / ground strokes stay quiet
  defs.push(`<linearGradient id="${p('og')}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="300">${stops([[0, '#fff3c6'], [0.55, '#ffd27a'], [0.76, '#f2a646', 0.55], [0.9, '#e08a2e', 0]])}</linearGradient>`);
  // ── grade + top light + glint
  defs.push(`<linearGradient id="${p('top')}" x1="0" y1="0" x2="0" y2="1">${stops([[0, '#ffe3a6', 0.2], [0.35, '#ffd38a', 0], [1, '#ffd38a', 0]])}</linearGradient>`);
  defs.push(`<radialGradient id="${p('glint')}">${stops([[0, '#fff8e4', 0.9], [0.35, '#ffd98a', 0.4], [1, '#ffc56a', 0]])}</radialGradient>`);
  defs.push(`<linearGradient id="${p('edge')}" x1="0" y1="0" x2="1" y2="1">${stops([[0, '#fff0c0'], [0.5, '#e9b65a'], [1, '#fff0c0']])}</linearGradient>`);

  // sunburst rays (alternating long / short), slowly fanned from the focus
  let rays = '';
  const nR = 20, rot0 = rand() * 18;
  for (let i = 0; i < nR; i++) {
    const deg = rot0 + (i * 360) / nR;
    // no rays toward the ground (they would streak across the floor / bottom fade)
    if (Math.abs(((deg % 360) + 360) % 360 - 90) < 58) continue;
    const a = (deg * Math.PI) / 180;
    const len = i % 2 ? 150 : 230, w = (i % 2 ? 2.6 : 4.2) * (Math.PI / 180);
    const P1 = [fx + Math.cos(a - w) * len, fy + Math.sin(a - w) * len];
    const P2 = [fx + Math.cos(a + w) * len, fy + Math.sin(a + w) * len];
    rays += `M${fx} ${fy}L${r1(P1[0])} ${r1(P1[1])}L${r1(P2[0])} ${r1(P2[1])}Z`;
  }
  // halo rings + diamonds
  const hr = 96 + rank * 4;
  let dia = '';
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    const big = i % 2 === 0;
    dia += rhomb(fx + Math.cos(a) * hr, fy + Math.sin(a) * hr, big ? 3.2 : 2, big ? 5.4 : 3.4);
  }
  const behind = [
    `<circle cx="${fx}" cy="${fy}" r="168" fill="url(#${p('aura')})" style="mix-blend-mode:screen"/>`,
    `<path d="${rays}" fill="url(#${p('rayg')})" style="mix-blend-mode:screen"/>`,
    `<circle cx="${fx}" cy="${fy}" r="${hr}" fill="none" stroke="#ffe2a0" stroke-width="1.6" opacity=".7"/>`,
    `<circle cx="${fx}" cy="${fy}" r="${hr + 8}" fill="none" stroke="#ffd091" stroke-width=".8" stroke-dasharray="1.5 4.5" opacity=".6"/>`,
    `<circle cx="${fx}" cy="${fy}" r="${hr - 7}" fill="none" stroke="#fff3d0" stroke-width=".6" opacity=".35"/>`,
    `<path d="${dia}" fill="#ffe7a8" opacity=".85"/>`,
    // gold outline hugging the subject (8-way dilated silhouette; a wider pass would ghost thin strokes)
    `<rect x="-10" y="-10" width="320" height="320" fill="url(#${p('og')})" mask="url(#${p('o')})" opacity=".95"/>`,
  ].join('');

  const rim = `<rect width="300" height="300" fill="url(#${p('rimg')})" mask="url(#${p('rim')})" opacity=".95"/>`;

  // sparkles: ring around the focus (keeps faces clear), a few large glints + gold dust
  let spk = '', dust = '', glints = '';
  const nS = 7 + rank * 2;
  for (let i = 0; i < nS; i++) {
    const a = ((i / nS) * 360 + rand() * 30) * (Math.PI / 180);
    const d = 78 + rand() * 62;
    const x = fx + Math.cos(a) * d, y = fy + Math.sin(a) * d * 0.92;
    if (x < 10 || x > 290 || y < 10 || y > 262) continue;
    const s = i % 3 === 0 ? 6 + rand() * 4 : 2.6 + rand() * 2.6;
    spk += sparkle(x, y, s);
    if (s > 6) glints += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(s * 1.6)}" fill="url(#${p('glint')})"/>`;
  }
  for (let i = 0; i < 26; i++) {
    const x = 12 + rand() * 276, y = 14 + rand() * 240;
    if (Math.hypot(x - fx, (y - fy) * 1.2) < 58) continue;
    const rr = r1(0.6 + rand() * 0.9);
    dust += `M${r1(x - rr)} ${r1(y)}a${rr} ${rr} 0 1 0 ${r1(2 * rr)} 0a${rr} ${rr} 0 1 0 ${r1(-2 * rr)} 0Z`;
  }
  const front = [
    `<rect width="300" height="300" fill="#ffb15e" opacity=".1" style="mix-blend-mode:soft-light"/>`,
    `<rect width="300" height="300" fill="url(#${p('top')})" style="mix-blend-mode:screen"/>`,
    glints,
    `<path d="${dust}" fill="#ffe3a0" opacity=".75"/>`,
    `<path d="${spk}" fill="#fff6dc"/>`,
    // thin gilded inner edge (sits inside the crop of the card frame's art window)
    `<rect x="2.5" y="2.5" width="295" height="295" rx="5" fill="none" stroke="url(#${p('edge')})" stroke-width="2" opacity=".55"/>`,
  ].join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs>${defsInner}${defs.join('')}</defs>${bg}${behind}${body}${rim}${ov}${front}</svg>\n`;
}

// ------------------------------------------------------------------ checks
const FORBIDDEN = [/<script/i, /<foreignObject/i, /<text[\s>]/i, /<image[\s>]/i, /\son[a-z]+\s*=/i, /href\s*=\s*"(?!#)/i, /@import|@font-face/i, /<svg[^>]*\s(width|height)=/i];
function check(svg, prefix) {
  const issues = [];
  for (const re of FORBIDDEN) if (re.test(svg)) issues.push(`forbidden ${re}`);
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const bad = ids.filter((x) => !x.startsWith(prefix + '-'));
  if (bad.length) issues.push(`unprefixed ids ${bad.slice(0, 3)}`);
  if (new Set(ids).size !== ids.length) issues.push('duplicate ids');
  const idset = new Set(ids);
  const refs = [...svg.matchAll(/url\(['"]?#([^)'"]+)['"]?\)|href="#([^"]+)"/g)].map((m) => m[1] || m[2]);
  const dangling = refs.filter((x) => !idset.has(x));
  if (dangling.length) issues.push(`dangling refs ${dangling.slice(0, 3)}`);
  const nf = (svg.match(/<filter\s/g) || []).length;
  if (nf > 1) issues.push(`${nf} filters`);
  try { topLevel(svg); } catch (e) { issues.push(`markup: ${e.message}`); }
  const bytes = Buffer.byteLength(svg);
  if (bytes > BUDGET) issues.push(`${(bytes / 1024).toFixed(1)}KB > ${BUDGET / 1024}KB`);
  return { bytes, issues };
}

// ------------------------------------------------------------------ main
const args = process.argv.slice(2);
const oi = args.indexOf('--only');
const only = oi >= 0 ? args[oi + 1].split(',') : null;
let n = 0, failed = 0;
for (const card of CARDS) {
  if (!card.artEvolve) continue;
  if (only && !only.includes(card.id)) continue;
  const srcFile = path.join(PUBLIC, card.art);
  const outFile = path.join(PUBLIC, card.artEvolve);
  if (!/\.svg$/.test(srcFile) || !/\.svg$/.test(outFile)) { console.warn(`! ${card.id}: art paths must be .svg (${card.art} -> ${card.artEvolve})`); failed++; continue; }
  if (!fs.existsSync(srcFile)) { console.warn(`! ${card.id}: missing base art ${card.art}`); failed++; continue; }
  let svg;
  try {
    svg = evolve(card, fs.readFileSync(srcFile, 'utf8'));
  } catch (e) {
    console.warn(`! ${card.id}: ${e.message}`); failed++; continue;
  }
  const { bytes, issues } = check(svg, `${card.id}_e`);
  fs.writeFileSync(outFile, svg);
  n++;
  if (issues.length) failed++;
  console.log(`${issues.length ? '!' : ' '} ${path.basename(outFile).padEnd(24)} ${(bytes / 1024).toFixed(1)}KB ${issues.join('; ')}`);
}
console.log(`wrote ${n} evolved card(s) -> ${path.relative(root, path.join(PUBLIC, 'assets/cards'))}${failed ? ` (${failed} with issues)` : ''}`);
if (failed) process.exitCode = 1;
