#!/usr/bin/env node
// World map generator for 《月蚀契约》 — the eclipse-night continent.
//   node tools/art/map/build-map.mjs            -> public/assets/map/world-map.svg
// Zero dependencies, deterministic (seeded PRNG). viewBox 0 0 1000 560, every id prefixed "wm-".
//
// Contract with public/app.js mapPage(): towns sit at (x*10, y*5.6) of MAP_TOWNS. The UI draws a
// r=22 node + label (baseline y+38, locked hint y+52) on top of this image, so each town gets a
// calm "socket" (r≈30) and a calm label strip below; landmarks stand just outside that radius.
// The silver rail passes exactly through every town point in route order.
// Lighting canon: moonlight from the upper-left (#e8ddff); no <text>, no filters, no bitmaps.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const OUT = path.join(root, 'public/assets/map/world-map.svg');
const W = 1000, H = 560;

// ------------------------------------------------------------------ data
const TOWNS = [
  { id: 'start', x: 12, y: 72 }, { id: 'station', x: 25, y: 58 }, { id: 'mooncity', x: 40, y: 42 },
  { id: 'frosttown', x: 55, y: 25 }, { id: 'valhalla', x: 70, y: 38 }, { id: 'startower', x: 62, y: 58 },
  { id: 'nodgate', x: 80, y: 50 }, { id: 'terminal', x: 90, y: 68 },
].map((t) => ({ ...t, px: t.x * W / 100, py: t.y * H / 100 }));
const T = Object.fromEntries(TOWNS.map((t) => [t.id, t]));

// ------------------------------------------------------------------ utils
function rngFrom(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rnd = rngFrom(20261009);
const R = (a, b) => a + (b - a) * rnd();
const f = (n) => { const v = Math.round(n * 10) / 10; return Object.is(v, -0) ? 0 : v; };
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const gi = (n) => Math.round(n);
const ipoly = (arr) => 'M' + arr.map(([x, y]) => `${gi(x)} ${gi(y)}`).join('L') + 'Z';
const pts = (arr) => arr.map(([x, y]) => `${f(x)} ${f(y)}`).join(' ');
const poly = (arr) => `M${pts(arr.slice(0, 1))}L${pts(arr.slice(1))}Z`;
const p = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra ? ' ' + extra : ''}/>`;
const OL = '#0b0a1f';                         // coloured line-art (never pure black)
const ol = (w = 1) => `stroke="${OL}" stroke-width="${w}"`;

// integer-relative path for long organic outlines (small + exact, no drift)
function relPath(arr, close = true) {
  const r = arr.map(([x, y]) => [Math.round(x), Math.round(y)]);
  let d = `M${r[0][0]} ${r[0][1]}`;
  let px = r[0][0], py = r[0][1];
  let seg = '';
  for (let i = 1; i < r.length; i++) {
    const dx = r[i][0] - px, dy = r[i][1] - py;
    if (!dx && !dy) continue;
    seg += `${dx}${dy < 0 ? dy : ' ' + dy} `.replace(/ (-)/g, '$1');
    px = r[i][0]; py = r[i][1];
  }
  return d + 'l' + seg.trim().replace(/ $/, '') + (close ? 'z' : '');
}

// smooth closed outline: quadratic curves through edge midpoints (control = original vertex)
function smoothPath(arr) {
  const n = arr.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const P = [];
  for (let i = 0; i < n; i++) P.push(arr[i], mid(arr[i], arr[(i + 1) % n]));
  const R = P.map(([x, y]) => [Math.round(x * 2) / 2, Math.round(y * 2) / 2]);
  const num = (v) => String(Math.round(v * 10) / 10).replace(/^(-?)0\./, '$1.');
  const toks = [];
  let px = R[1][0], py = R[1][1];
  for (let i = 1; i <= n; i++) {
    const c = R[(2 * i) % (2 * n)], e = R[(2 * i + 1) % (2 * n)];
    toks.push(num(c[0] - px), num(c[1] - py), num(e[0] - px), num(e[1] - py));
    px = e[0]; py = e[1];
  }
  let d = `M${num(R[1][0])} ${num(R[1][1])}q`;
  toks.forEach((t, i) => { d += (i && t[0] !== '-' ? ' ' : '') + t; });
  return d + 'z';
}
// Catmull-Rom through points (passes exactly through each) -> cubic path data
function crPath(P, k = 1) {
  let d = `M${f(P[0][0])} ${f(P[0][1])}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || P[i + 1];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6 * k, p1[1] + (p2[1] - p0[1]) / 6 * k];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6 * k, p2[1] - (p3[1] - p1[1]) / 6 * k];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}
function crSample(P, k = 1, n = 24) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || P[i + 1];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6 * k, p1[1] + (p2[1] - p0[1]) / 6 * k];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6 * k, p2[1] - (p3[1] - p1[1]) / 6 * k];
    for (let j = 0; j < n; j++) {
      const t = j / n, u = 1 - t;
      out.push({ seg: i, t, x: u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0], y: u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1] });
    }
  }
  const L = P[P.length - 1];
  out.push({ seg: P.length - 2, t: 1, x: L[0], y: L[1] });
  return out;
}

// fractal coastline: midpoint displacement of a closed polygon
const offCanvas = (q) => q[0] < -4 || q[0] > W + 4 || q[1] < -4 || q[1] > H + 4;
function roughen(base, iters, rough, seed) {
  const r = rngFrom(seed);
  let P = base.slice();
  for (let it = 0; it < iters; it++) {
    const N = [];
    const k = rough * [1, 0.75, 0.58, 0.5, 0.45][it];
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length];
      N.push(a);
      if (offCanvas(a) && offCanvas(b)) continue;
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
      const off = (r() * 2 - 1) * len * k;
      N.push([(a[0] + b[0]) / 2 - dy / len * off, (a[1] + b[1]) / 2 + dx / len * off]);
    }
    P = N;
  }
  return P;
}
function chaikin(P, n = 1) {
  for (let k = 0; k < n; k++) {
    const N = [];
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length];
      if (offCanvas(a) && offCanvas(b)) { N.push(a); continue; }
      N.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    P = N;
  }
  return P;
}
function simplify(P, tol = 0.6) {
  const keep = new Uint8Array(P.length); keep[0] = keep[P.length - 1] = 1;
  const st = [[0, P.length - 1]];
  while (st.length) {
    const [i, j] = st.pop();
    const [ax, ay] = P[i], [bx, by] = P[j], L = Math.hypot(bx - ax, by - ay) || 1;
    let m = -1, md = tol;
    for (let k = i + 1; k < j; k++) { const d = Math.abs((bx - ax) * (ay - P[k][1]) - (ax - P[k][0]) * (by - ay)) / L; if (d > md) { md = d; m = k; } }
    if (m > 0) { keep[m] = 1; st.push([i, m], [m, j]); }
  }
  return P.filter((_, k) => keep[k]);
}
function inPoly(x, y, P) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, yi] = P[i], [xj, yj] = P[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
const minDist = (x, y, P) => { let m = 1e9; for (const q of P) { const d = (q[0] - x) ** 2 + (q[1] - y) ** 2; if (d < m) m = d; } return Math.sqrt(m); };

// ------------------------------------------------------------------ geography
// Mainland: open to the north-west (beyond the frame); sea to the north-east (under the eclipse),
// the east and the south, with a southern gulf between the star tower moor and the terminal cape.
const LAND_BASE = [
  [-30, -30], [742, -30], [744, 22], [762, 60], [790, 88], [826, 112], [846, 150], [840, 196], [858, 232],
  [874, 268], [900, 296], [936, 318], [962, 346], [978, 382], [972, 418], [948, 446], [906, 458], [866, 452],
  [834, 462], [806, 452], [786, 430], [762, 418], [738, 428], [722, 452], [706, 478], [668, 496], [626, 492],
  [600, 504], [576, 518], [548, 512], [522, 500], [502, 488], [482, 494], [456, 512], [424, 526], [394, 530],
  [366, 518], [342, 502], [314, 496], [288, 502], [262, 516], [238, 526], [214, 516], [194, 500], [168, 490],
  [140, 494], [104, 504], [70, 498], [42, 482], [14, 468], [-30, 466],
];
const LAND = chaikin(roughen(LAND_BASE, 4, 0.21, 7), 1);
const ISLES = [
  chaikin(roughen([[944, 168], [962, 160], [978, 170], [974, 186], [956, 192], [942, 182]], 3, 0.22, 11)),
  chaikin(roughen([[968, 214], [980, 210], [986, 222], [976, 230], [966, 226]], 3, 0.22, 12)),
  chaikin(roughen([[824, 500], [846, 492], [868, 498], [872, 512], [852, 522], [830, 518]], 3, 0.22, 13)),
];
const onLand = (x, y) => inPoly(x, y, LAND);

const RAIL = TOWNS.map((t) => [t.px, t.py]);
const RAIL_S = crSample(RAIL, 1, 40);
const RIVER = [[452, 30], [460, 72], [450, 118], [458, 160], [478, 204], [502, 248], [516, 296], [508, 344], [520, 392], [544, 438], [560, 486], [566, 530]];
const RIVER_S = crSample(RIVER, 1, 16);
const BROOK = [[96, 214], [84, 262], [92, 300], [74, 342], [56, 392], [40, 440], [24, 486]];
const BROOK_S = crSample(BROOK, 1, 12);
const LAKE = { cx: 306, cy: 206, rx: 36, ry: 16 };
const PATHS = [
  [[154, 410], [204, 426], [270, 422], [338, 432], [404, 444], [444, 440]],
  [[518, 438], [540, 420], [556, 392], [566, 362], [574, 344]],
  [[786, 300], [770, 344], [742, 380], [722, 398]],
];
const PATHS_S = PATHS.flatMap((P) => crSample(P, 1, 10));
// the moon-eclipse train rides the station -> holy city leg
const TRAIN = (() => {
  const seg = RAIL_S.filter((q) => q.seg === 1);
  const i = Math.floor(seg.length * 0.46), a = seg[i], b = seg[i + 3];
  return { x: a.x, y: a.y, ang: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI };
})();

// keep-out zones: node socket + label strip per town, plus landmark boxes
const KEEP = [];
for (const t of TOWNS) KEEP.push({ c: [t.px, t.py, 34] }, { r: [t.px - 50, t.py + 18, t.px + 50, t.py + 60] });
const LM_BOX = {
  start: [62, 334, 186, 392], station: [206, 252, 280, 300], mooncity: [338, 148, 430, 212],
  frosttown: [496, 56, 606, 116], valhalla: [652, 124, 750, 190], startower: [560, 238, 600, 344],
  nodgate: [768, 200, 832, 256], terminal: [926, 340, 978, 398], lighthouse: [950, 398, 982, 452],
  ruins: [440, 404, 520, 446], circle: [676, 384, 732, 412],
  train: [TRAIN.x - 40, TRAIN.y - 36, TRAIN.x + 34, TRAIN.y + 6], camp: [306, 452, 352, 476],
};
for (const b of Object.values(LM_BOX)) KEEP.push({ r: b });
function free(x, y, pad = 0) {
  for (const k of KEEP) {
    if (k.c && dist(x, y, k.c[0], k.c[1]) < k.c[2] + pad) return false;
    if (k.r && x > k.r[0] - pad && x < k.r[2] + pad && y > k.r[1] - pad && y < k.r[3] + pad) return false;
  }
  return true;
}
const nearLine = (x, y, S, d) => S.some((s) => (s.x - x) ** 2 + (s.y - y) ** 2 < d * d);
const inLake = (x, y, pad = 0) => ((x - LAKE.cx) / (LAKE.rx + pad)) ** 2 + ((y - LAKE.cy) / (LAKE.ry + pad)) ** 2 < 1;

// ------------------------------------------------------------------ defs
const defs = [];
defs.push(`<path id="wm-land" d="${smoothPath(simplify(LAND, 0.8))}"/>`);
defs.push(`<clipPath id="wm-clip"><use href="#wm-land"/></clipPath>`);
const isleD = ISLES.map((I) => smoothPath(simplify(I, 0.6))).join('');
defs.push(`<path id="wm-isle" d="${isleD}"/>`);
// coast ripple rings (mask = outer ring minus inner)
defs.push(`<mask id="wm-rip" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><g fill="none">` +
  `<use href="#wm-land" stroke="#fff" stroke-width="38" stroke-dasharray="7 6" stroke-opacity=".7"/><use href="#wm-land" stroke="#000" stroke-width="36"/>` +
  `<use href="#wm-land" stroke="#fff" stroke-width="22"/><use href="#wm-land" stroke="#000" stroke-width="20.2"/>` +
  `<use href="#wm-isle" stroke="#fff" stroke-width="14"/><use href="#wm-isle" stroke="#000" stroke-width="12.2"/></g></mask>`);
const grad = (id, kind, attrs, stops) => defs.push(`<${kind}Gradient id="${id}" ${attrs}>${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a !== 1 ? ` stop-opacity="${a}"` : ''}/>`).join('')}</${kind}Gradient>`);
grad('wm-sea', 'radial', 'cx="890" cy="90" r="760" gradientUnits="userSpaceOnUse"', [[0, '#1f2a62'], [0.28, '#111a44'], [0.62, '#0a1230'], [1, '#060818']]);
grad('wm-ground', 'linear', 'x1="0" y1="0" x2=".35" y2="1"', [[0, '#2b2652'], [0.55, '#221d45'], [1, '#1a1636']]);
grad('wm-snow', 'radial', 'cx="530" cy="96" r="340" gradientTransform="matrix(1 0 0 .36 0 61.4)" gradientUnits="userSpaceOnUse"', [[0, '#d4dbf8', 0.6], [0.5, '#b3bce6', 0.42], [0.8, '#9aa6d8', 0.16], [1, '#9aa6d8', 0]]);
grad('wm-snowW', 'radial', 'cx="96" cy="110" r="150" gradientTransform="matrix(1 0 0 .5 0 55)" gradientUnits="userSpaceOnUse"', [[0, '#b3bce6', 0.32], [1, '#b3bce6', 0]]);
grad('wm-meadow', 'radial', 'cx="170" cy="370" r="250" gradientTransform="matrix(1 0 0 .62 0 140.6)" gradientUnits="userSpaceOnUse"', [[0, '#33645c', 0.62], [0.6, '#2c5552', 0.32], [1, '#2c5552', 0]]);
grad('wm-lite', 'radial', 'cx="470" cy="330" r="150" gradientTransform="matrix(1 0 0 .6 0 132)" gradientUnits="userSpaceOnUse"', [[0, '#4a4488', 0.32], [1, '#4a4488', 0]]);
grad('wm-dusk', 'radial', 'cx="250" cy="440" r="120" gradientTransform="matrix(1 0 0 .5 0 220)" gradientUnits="userSpaceOnUse"', [[0, '#120f2a', 0.35], [1, '#120f2a', 0]]);
grad('wm-heath', 'radial', 'cx="430" cy="430" r="170" gradientTransform="matrix(1 0 0 .5 0 215)" gradientUnits="userSpaceOnUse"', [[0, '#6b5470', 0.38], [1, '#6b5470', 0]]);
grad('wm-wood', 'radial', 'cx="700" cy="200" r="130" gradientUnits="userSpaceOnUse"', [[0, '#0e1d2a', 0.6], [1, '#0e1d2a', 0]]);
grad('wm-void', 'radial', 'cx="806" cy="262" r="100" gradientUnits="userSpaceOnUse"', [[0, '#f472b6', 0.26], [0.5, '#b58cff', 0.1], [1, '#b58cff', 0]]);
grad('wm-holy', 'radial', 'cx="386" cy="186" r="90" gradientUnits="userSpaceOnUse"', [[0, '#b996ff', 0.28], [1, '#b996ff', 0]]);
grad('wm-moor', 'radial', 'cx="600" cy="320" r="110" gradientUnits="userSpaceOnUse"', [[0, '#ffd98c', 0.1], [1, '#ffd98c', 0]]);
grad('wm-shore', 'radial', 'cx="930" cy="400" r="90" gradientUnits="userSpaceOnUse"', [[0, '#6f6a9a', 0.22], [1, '#6f6a9a', 0]]);
grad('wm-moonglow', 'radial', 'cx="892" cy="78" r="150" gradientUnits="userSpaceOnUse"', [[0, '#e8ddff', 0.5], [0.22, '#b58cff', 0.26], [0.6, '#6d4fc8', 0.08], [1, '#6d4fc8', 0]]);
grad('wm-refl', 'linear', 'x1="0" y1="0" x2="0" y2="1"', [[0, '#e8ddff', 0.55], [1, '#e8ddff', 0]]);
grad('wm-corona', 'radial', 'cx=".5" cy=".5" r=".5"', [[0.6, '#fff', 0], [0.63, '#fbf8ff', 1], [0.7, '#d9c8ff', 0.75], [0.82, '#a382f5', 0.32], [1, '#7a58e0', 0]]);
grad('wm-socket', 'radial', 'cx=".5" cy=".5" r=".5"', [[0, '#090818', 0.62], [0.7, '#090818', 0.42], [1, '#090818', 0]]);
grad('wm-vig', 'radial', 'cx="500" cy="270" r="620" gradientTransform="matrix(1 0 0 .66 0 92)" gradientUnits="userSpaceOnUse"', [[0.55, '#05040f', 0], [1, '#05040f', 0.78]]);
grad('wm-portal', 'radial', 'cx=".5" cy=".62" r=".6"', [[0, '#fff0fa'], [0.3, '#f472b6'], [0.75, '#7a3fc8'], [1, '#2a1250']]);
grad('wm-drift', 'radial', 'cx=".5" cy=".5" r=".5"', [[0, '#eef2ff', 0.5], [0.6, '#dfe5ff', 0.26], [1, '#dfe5ff', 0]]);
grad('wm-disc', 'radial', 'cx=".62" cy=".36" r=".7"', [[0, '#1e1742'], [0.7, '#0d0a22'], [1, '#07051a']]);
grad('wm-halo', 'radial', 'cx=".5" cy=".5" r=".5"', [[0, '#ffd091', 0.55], [1, '#ffd091', 0]]);
grad('wm-beam', 'linear', 'x1="0" y1="0" x2="1" y2="0"', [[0, '#ffe6b0', 0.5], [1, '#ffe6b0', 0]]);
grad('wm-beamL', 'linear', 'x1="1" y1="0" x2="0" y2="0"', [[0, '#ffe6b0', 0.6], [1, '#ffe6b0', 0]]);

// symbols: trees (lit from the upper-left: left half lighter)
defs.push(`<symbol id="wm-pine" overflow="visible"><path d="M0-15L5.2-3.5H2.8L6.5 3H-6.5L-2.8-3.5H-5.2Z" fill="#1d3b4c" ${ol(0.9)}/><path d="M0-15L-5.2-3.5H-2.8L-6.5 3H0Z" fill="#2f5a6a"/><path d="M0 3V6" stroke="${OL}" stroke-width="1.6"/></symbol>`);
defs.push(`<symbol id="wm-spine" overflow="visible"><path d="M0-15L5.2-3.5H2.8L6.5 3H-6.5L-2.8-3.5H-5.2Z" fill="#26475a" ${ol(0.9)}/><path d="M0-15L-3.4-7.6L-1.2-8.6L0-7L1.6-8.8L3.2-7.8ZM-5.2-3.5L-3-1.6L-1-2.8L1-1.4L3.4-2.6L2.8-3.5H-2.8Z" fill="#e6ebff"/><path d="M0 3V6" stroke="${OL}" stroke-width="1.6"/></symbol>`);
defs.push(`<symbol id="wm-oak" overflow="visible"><path d="M0 1V6" stroke="${OL}" stroke-width="1.8"/><path d="M-6.5 0C-8.5-4-5.5-9.5-1-9.6C3.6-10.2 7.6-6.4 6.8-1.8C6.2 2 2.4 3.2 0 2.6C-2.6 3.4-5.6 2.6-6.5 0Z" fill="#1c3a44" ${ol(0.9)}/><path d="M-5.8-1C-6.8-4.6-4-8.4-.6-8.4C-3-6.6-3.4-3.6-1.8-1.4C-3.2-.4-4.8-.2-5.8-1Z" fill="#33626a"/></symbol>`);
defs.push(`<symbol id="wm-vtree" overflow="visible"><path d="M0 2V6" stroke="${OL}" stroke-width="1.6"/><path d="M0-16C3.4-11 5.2-5 4.4-.6C3.8 2.4 1.8 3.2 0 3.2S-3.8 2.4-4.4-.6C-5.2-5-3.4-11 0-16Z" fill="#251c46" ${ol(0.9)}/><path d="M0-16C-3.4-11-5.2-5-4.4-.6C-3.8 2-1.6 2.6-.6 2.4C-2.4-1-2.2-9 0-16Z" fill="#45377a"/></symbol>`);
defs.push(`<symbol id="wm-vglow" overflow="visible"><use href="#wm-vtree"/><path d="M1.4-7.4l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5Z" fill="#f9a8d4"/></symbol>`);
// size variants share the base drawings (keeps <use> calls short: integer x/y only)
for (const b of ['pine', 'spine', 'oak', 'vtree', 'vglow']) {
  defs.push(`<symbol id="wm-${b}S" overflow="visible"><use href="#wm-${b}" transform="scale(.82)"/></symbol>`);
  defs.push(`<symbol id="wm-${b}L" overflow="visible"><use href="#wm-${b}" transform="scale(1.18)"/></symbol>`);
}
defs.push(`<symbol id="wm-wave" overflow="visible"><path d="M-6 0Q-3-3 0 0T6 0" fill="none" stroke="#8fa6e8" stroke-width="1" stroke-linecap="round"/></symbol>`);

// ------------------------------------------------------------------ layers
const L = [];
// sea
L.push(`<rect width="${W}" height="${H}" fill="url(#wm-sea)"/>`);
// graticule over the sea (cartographic flavour)
{
  let g = '';
  for (let i = 1; i < 6; i++) g += `M0 ${f(i * 93 + 6)}Q500 ${f(i * 93 - 18)} 1000 ${f(i * 93 + 6)}`;
  for (let i = 1; i < 9; i++) { const x = i * 111; g += `M${x} 0Q${f(x + (x - 500) * 0.06)} 280 ${x} 560`; }
  L.push(`<path d="${g}" fill="none" stroke="#8fa6e8" stroke-width=".6" opacity=".09"/>`);
}
// moon reflection on the north-east sea: broken glitter, wide near the moon, thinning to the coast
{
  let r = '', r3 = '';
  const r2 = rngFrom(31);
  for (let y = 134; y < 268; y += 3.2 + r2() * 3.4) {
    const k = 1 - (y - 134) / 134;
    const n = 1 + (r2() < 0.5 * k ? 1 : 0);
    for (let j = 0; j < n; j++) {
      const w = (3 + 20 * k * k) * (0.4 + r2() * 0.9), cx = 892 + (r2() - 0.5) * (10 + 26 * k);
      (r2() < 0.7 ? (r += `M${f(cx - w / 2)} ${f(y)}h${f(w)}`) : (r3 += `M${f(cx - w / 2)} ${f(y)}h${f(w)}`));
    }
  }
  L.push(`<ellipse cx="892" cy="176" rx="40" ry="96" fill="url(#wm-refl)" opacity=".22"/>`);
  L.push(`<path d="${r}" stroke="#efe6ff" stroke-width="1.4" stroke-linecap="round" opacity=".6"/><path d="${r3}" stroke="#b58cff" stroke-width="1.4" stroke-linecap="round" opacity=".6"/>`);
}
// waves
{
  let w = '';
  const r2 = rngFrom(41);
  let n = 0;
  for (let i = 0; i < 400 && n < 38; i++) {
    const x = r2() * 980 + 10, y = r2() * 540 + 10;
    if (onLand(x, y) || minDist(x, y, LAND) < 26 || ISLES.some((I) => minDist(x, y, I) < 16)) continue;
    if (dist(x, y, 930, 503) < 50 || dist(x, y, 892, 78) < 60 || Math.abs(x - 892) < 26 && y < 270) continue;
    w += `<use href="#wm-wave" x="${f(x)}" y="${f(y)}" opacity="${f(0.18 + r2() * 0.22)}"/>`; n++;
  }
  L.push(w);
}
// coast ripples, shallows, land, islands
L.push(`<rect width="${W}" height="${H}" fill="#9fb4f0" opacity=".32" mask="url(#wm-rip)"/>`);
L.push(`<use href="#wm-land" fill="none" stroke="#2c4486" stroke-width="18" opacity=".22"/><use href="#wm-land" fill="none" stroke="#3a58a8" stroke-width="7" opacity=".35"/>`);
L.push(`<use href="#wm-isle" fill="none" stroke="#2c4486" stroke-width="8" opacity=".5"/>`);
L.push(`<use href="#wm-land" fill="url(#wm-ground)"/>`);
L.push(`<use href="#wm-isle" fill="#29234f" stroke="#b4c2f4" stroke-width="1" stroke-opacity=".55"/>`);
L.push(`<use href="#wm-pineS" x="956" y="180"/><use href="#wm-pine" x="963" y="186"/><use href="#wm-pineS" x="950" y="187"/><use href="#wm-oakS" x="843" y="510"/><use href="#wm-oakS" x="855" y="514"/><path d="M972 224l3-5 3 2 2 3Z" fill="#5f63a2" stroke="#0b0a1f" stroke-width=".7"/>`);

// ---- terrain (clipped to land)
const terr = [];
for (const g of ['wm-lite', 'wm-dusk', 'wm-meadow', 'wm-heath', 'wm-snow', 'wm-snowW', 'wm-wood', 'wm-holy', 'wm-moor', 'wm-void', 'wm-shore']) terr.push(`<rect width="${W}" height="${H}" fill="url(#${g})"/>`);
// coastal cliff band (lit rim inside the coastline)
terr.push(`<use href="#wm-land" fill="none" stroke="#4a4686" stroke-width="6" opacity=".5"/>`);
terr.push(`<use href="#wm-land" fill="none" stroke="#7b78b8" stroke-width="2" opacity=".35"/>`);
// farm fields near the village
{
  let fl = '', fd = '';
  const fields = [[30, 392, 22, 14, -8], [56, 386, 20, 12, -8], [36, 410, 24, 14, -8], [64, 404, 18, 14, -8], [44, 430, 22, 12, -8], [170, 420, 20, 12, 6], [190, 432, 22, 12, 6], [160, 436, 18, 12, 6]];
  fields.forEach(([x, y, w, h, s], i) => {
    const q = [[x, y], [x + w, y + s * 0.3], [x + w + 3, y + h + s * 0.3], [x + 3, y + h]];
    (i % 2 ? fd += poly(q) : fl += poly(q));
  });
  terr.push(p(fl, '#3f5d4a', 'opacity=".5"'), p(fd, '#5a5a3e', 'opacity=".45"'));
  // furrows
  let fu = '';
  fields.forEach(([x, y, w, h, s]) => { for (let k = 3; k < h; k += 3) fu += `M${f(x + 1 + k * 0.2)} ${f(y + k)}l${f(w)} ${f(s * 0.3)}`; });
  terr.push(`<path d="${fu}" stroke="#0e1424" stroke-width=".7" opacity=".35"/>`);
}
// lake (crescent "moon mirror" lake by the holy city)
terr.push(`<ellipse cx="${LAKE.cx}" cy="${LAKE.cy}" rx="${LAKE.rx + 3}" ry="${LAKE.ry + 3}" fill="#3f3c78" opacity=".6"/>`);
terr.push(`<ellipse cx="${LAKE.cx}" cy="${LAKE.cy}" rx="${LAKE.rx}" ry="${LAKE.ry}" fill="#13204c" stroke="#8fa6e8" stroke-width="1" stroke-opacity=".6"/>`);
terr.push(`<path d="M${LAKE.cx - 20} ${LAKE.cy - 4}q20-8 40 0M${LAKE.cx - 12} ${LAKE.cy + 4}q12-5 26 0" fill="none" stroke="#c9d6ff" stroke-width=".9" opacity=".45" stroke-linecap="round"/>`);
terr.push(`<path d="M${LAKE.cx + 8} ${LAKE.cy - 7}a7 7 0 1 0 6 11a5.6 5.6 0 1 1-6-11Z" fill="#e8ddff" opacity=".55"/>`);
// rivers
{
  const d = crPath(RIVER), b = crPath(BROOK);
  terr.push(`<path d="${d}" fill="none" stroke="#0d1430" stroke-width="7" stroke-linecap="round"/>`);
  terr.push(`<path d="${d}" fill="none" stroke="#2b4790" stroke-width="4.4" stroke-linecap="round"/>`);
  terr.push(`<path d="${d}" fill="none" stroke="#9db8ff" stroke-width="1.1" stroke-dasharray="6 9" opacity=".7" stroke-linecap="round"/>`);
  terr.push(`<path d="${b}" fill="none" stroke="#0d1430" stroke-width="4.6" stroke-linecap="round"/>`);
  terr.push(`<path d="${b}" fill="none" stroke="#2b4790" stroke-width="2.6" stroke-linecap="round"/>`);
}
// footpaths (dotted, cartographic) — drawn under the trees
{
  let d = '';
  for (const P of PATHS) d += crPath(P);
  terr.push(`<path d="${d}" fill="none" stroke="#0b0a1f" stroke-width="2.6" opacity=".35" stroke-linecap="round"/>`);
  terr.push(`<path d="${d}" fill="none" stroke="#d8c6a4" stroke-width="1.2" stroke-dasharray="2.4 3.2" opacity=".55" stroke-linecap="round"/>`);
}
// grass stipple on the lowlands
{
  let g = '';
  const r2 = rngFrom(66);
  let n = 0;
  for (let i = 0; i < 4000 && n < 100; i++) {
    const x = 10 + r2() * 960, y = 150 + r2() * 360;
    if (!onLand(x, y) || minDist(x, y, LAND) < 12 || !free(x, y, 2) || nearLine(x, y, RAIL_S, 7) || nearLine(x, y, RIVER_S, 7) || inLake(x, y, 4)) continue;
    if (y < 200 && x > 440 && x < 800) continue;
    g += `M${gi(x)} ${gi(y)}l1-2.6M${gi(x) + 2} ${gi(y)}l.4-2`;
    n++;
  }
  terr.push(`<path d="${g}" stroke="#8a9ad8" stroke-width=".8" opacity=".22" stroke-linecap="round"/>`);
}
// hills (low mounds, lit crest on the moon side)
{
  let ho = '', hl = '';
  const r2 = rngFrom(77);
  let n = 0;
  for (let i = 0; i < 1400 && n < 26; i++) {
    const x = 20 + r2() * 860, y = 190 + r2() * 300;
    if (!onLand(x, y) || minDist(x, y, LAND) < 24 || !free(x, y, 16) || nearLine(x, y, RAIL_S, 20) || nearLine(x, y, RIVER_S, 16) || nearLine(x, y, BROOK_S, 14) || inLake(x, y, 16)) continue;
    if (y < 270 && x > 440) continue;
    if (PATHS_S.some((q) => dist(q.x, q.y, x, y) < 14)) continue;
    const w = 16 + r2() * 14, h = 5 + r2() * 4;
    ho += `M${gi(x - w)} ${gi(y)}Q${gi(x - w * 0.45)} ${gi(y - h * 1.7)} ${gi(x)} ${gi(y - h * 1.55)}Q${gi(x + w * 0.5)} ${gi(y - h * 1.4)} ${gi(x + w)} ${gi(y)}Z`;
    hl += `M${gi(x - w * 0.82)} ${gi(y - h * 0.45)}Q${gi(x - w * 0.45)} ${gi(y - h * 1.45)} ${gi(x)} ${gi(y - h * 1.5)}`;
    n++;
  }
  terr.push(`<path d="${ho}" fill="#2f2b60" stroke="#0e0c26" stroke-width=".8" stroke-opacity=".55"/>`);
  terr.push(`<path d="${hl}" fill="none" stroke="#8a86c8" stroke-width="1.5" opacity=".55" stroke-linecap="round"/>`);
}

// mountains ---------------------------------------------------------
function mountain(x, y, w, h, snow, seed) {
  const r2 = rngFrom(seed);
  const px = x + (r2() - 0.5) * w * 0.22, py = y - h;
  const lx = x - w / 2, rx = x + w / 2;
  const twin = r2() < 0.35;                       // a second, lower summit on one shoulder
  const sh1 = [lx + (px - lx) * 0.42, y - h * (0.4 + r2() * 0.14)];
  const sh2 = twin ? [px + (rx - px) * 0.5, y - h * (0.74 + r2() * 0.08)] : [px + (rx - px) * 0.55, y - h * (0.46 + r2() * 0.14)];
  const sil = [[lx, y], sh1, [px - w * 0.05, py + h * 0.08], [px, py], [px + w * 0.07, py + h * 0.14], ...(twin ? [[sh2[0] - w * 0.06, sh2[1] + h * 0.1], sh2] : [sh2]), [rx, y]];
  const rgx = px + w * (0.05 + r2() * 0.06);
  const ridge = [[px, py], [px + w * 0.03, py + h * 0.34], [rgx, y - h * 0.24], [rgx - w * 0.02, y]];
  const lit = [[lx, y], sh1, [px - w * 0.05, py + h * 0.08], [px, py], ...ridge.slice(1)];
  const C = snow ? ['#363568', '#5f63a2'] : ['#2a2656', '#4a4684'];
  // fill without outline, then outline only the skyline (open path) so bases melt into the ground
  let s = `<path d="${ipoly(sil)}" fill="${C[0]}"/>` + `<path d="${ipoly(lit)}" fill="${C[1]}"/>`;
  s += `<path d="M${sil.map(([a, b]) => `${gi(a)} ${gi(b)}`).join('L')}" fill="none" stroke="${OL}"/>`;
  if (twin) s += `<path d="M${gi(sh2[0])} ${gi(sh2[1])}l${gi(-w * 0.04)} ${gi(h * 0.3)}" stroke="${OL}" stroke-width=".7" opacity=".6"/>`;
  if (snow) {
    const sy = py + h * (0.34 + r2() * 0.1);
    const cap = [[px, py], [px + w * 0.07, py + h * 0.14], [px + (sh2[0] - px) * 0.55, sy - h * 0.06], [px + w * 0.12, sy + h * 0.02], [px + w * 0.05, sy - h * 0.08], [px - w * 0.02, sy + h * 0.06], [px - w * 0.1, sy - h * 0.05], [px - w * 0.17, sy + h * 0.03], [px - (px - sh1[0]) * 0.6, sy - h * 0.02], [px - w * 0.05, py + h * 0.08]];
    s += `<path d="${ipoly(cap)}" fill="#98a1d2" stroke="${OL}" stroke-width=".8"/>`;
    s += `<path d="${ipoly([[px, py], [px - w * 0.05, py + h * 0.08], [px - (px - sh1[0]) * 0.6, sy - h * 0.02], [px - w * 0.17, sy + h * 0.03], [px - w * 0.1, sy - h * 0.05], [px - w * 0.02, sy + h * 0.06], [px + w * 0.025, py + h * 0.3]])}" fill="#dde2fa"/>`;
  }
  return s;
}
{
  const ms = [];
  const r2 = rngFrom(99);
  // northern range: three loose rows, tallest around the frost valley's flanks
  for (const [y0, hMul, step] of [[50, 1.14, 37], [82, 1, 34], [110, 0.76, 33]]) {
    for (let x = 206 + r2() * 24; x < 792; x += step * (0.8 + r2() * 0.55)) {
      const y = y0 + (r2() - 0.5) * 16;
      if (!onLand(x, y) || minDist(x, y, LAND) < 16) continue;
      if (!free(x, y, 6) || nearLine(x, y, RAIL_S, 16) || nearLine(x, y, RIVER_S, 10)) continue;
      if (x > 500 && x < 602 && y > 66) continue;                       // frost town valley
      const c = 1 - Math.min(1, Math.abs(x - 540) / 330);
      const h = (24 + 28 * c + r2() * 14) * hMul, w = h * (1.3 + r2() * 0.4);
      ms.push({ x, y, w, h, snow: true });
    }
  }
  // fortress crags (bare rock)
  for (const [x, y, h] of [[640, 196, 26], [662, 236, 22], [752, 206, 30], [772, 170, 34], [742, 246, 20], [628, 160, 30], [788, 238, 22], [610, 232, 18]]) {
    if (free(x, y, 4) && !nearLine(x, y, RAIL_S, 14)) ms.push({ x, y, w: h * 1.3, h, snow: false });
  }
  // western highlands
  for (const [x, y, h] of [[44, 116, 34], [82, 92, 42], [120, 120, 30], [156, 94, 34], [26, 160, 24], [190, 124, 26]]) ms.push({ x, y, w: h * 1.4, h, snow: true });
  ms.sort((a, b) => a.y - b.y);
  ms.forEach((m, i) => terr.push(mountain(m.x, m.y, m.w, m.h, m.snow, 500 + i)));
}

// forests ------------------------------------------------------------
function scatter({ sym, n, area, minGap = 7.5, seed, test = () => true, scale = [0.85, 1.15] }) {
  const r2 = rngFrom(seed);
  const placed = [];
  for (let i = 0; i < n * 40 && placed.length < n; i++) {
    const [cx, cy, rx, ry] = area;
    const a = r2() * Math.PI * 2, rr = Math.sqrt(r2());
    const x = cx + Math.cos(a) * rx * rr, y = cy + Math.sin(a) * ry * rr;
    if (!onLand(x, y) || minDist(x, y, LAND) < 9 || !free(x, y, 3)) continue;
    if (nearLine(x, y, RAIL_S, 9) || nearLine(x, y, RIVER_S, 7) || nearLine(x, y, BROOK_S, 6) || nearLine(x, y, PATHS_S, 6) || inLake(x, y, 6) || !test(x, y)) continue;
    if (placed.some((q) => dist(q.x, q.y, x, y) < minGap)) continue;
    placed.push({ x, y, s: scale[0] + r2() * (scale[1] - scale[0]), sym });
  }
  return placed;
}
const trees = [
  ...scatter({ sym: 'wm-oak', n: 60, area: [130, 250, 120, 80], seed: 1, minGap: 8 }),
  ...scatter({ sym: 'wm-oak', n: 16, area: [200, 450, 50, 26], seed: 2 }),
  ...scatter({ sym: 'wm-oak', n: 22, area: [340, 330, 60, 34], seed: 3 }),
  ...scatter({ sym: 'wm-pine', n: 58, area: [700, 200, 110, 80], seed: 4, test: (x, y) => y > 128 }),
  ...scatter({ sym: 'wm-spine', n: 34, area: [550, 140, 110, 44], seed: 5, test: (x, y) => y > 104 }),
  ...scatter({ sym: 'wm-spine', n: 26, area: [330, 125, 110, 30], seed: 6, test: (x, y) => y > 118 }),
  ...scatter({ sym: 'wm-vtree', n: 30, area: [720, 370, 70, 50], seed: 7 }),
  ...scatter({ sym: 'wm-vglow', n: 10, area: [730, 360, 60, 44], seed: 17, minGap: 9 }),
  ...scatter({ sym: 'wm-pine', n: 16, area: [430, 300, 40, 50], seed: 8 }),
  ...scatter({ sym: 'wm-oak', n: 14, area: [600, 440, 50, 30], seed: 9 }),
].sort((a, b) => a.y - b.y);
terr.push(trees.map((t) => `<use href="#${t.sym}${t.s < 0.92 ? 'S' : t.s > 1.08 ? 'L' : ''}" x="${Math.round(t.x)}" y="${Math.round(t.y)}"/>`).join(''));

L.push(`<g clip-path="url(#wm-clip)">${terr.join('')}</g>`);
L.push(`<use href="#wm-land" fill="none" stroke="#b4c2f4" stroke-width="1.1" opacity=".6"/>`);

// ------------------------------------------------------------------ the silver rail
{
  const d = crPath(RAIL);
  L.push(`<path id="wm-rail" d="${d}" fill="none" stroke="#b58cff" stroke-width="12" stroke-opacity=".12" stroke-linecap="round" stroke-linejoin="round"/>`);
  L.push(`<path d="${d}" fill="none" stroke="#0a0918" stroke-width="6.4" stroke-linecap="round"/>`);
  L.push(`<path d="${d}" fill="none" stroke="#8a86bd" stroke-width="6" stroke-dasharray="1.6 3.4"/>`);
  L.push(`<path d="${d}" fill="none" stroke="#e4e6ff" stroke-width="3.4" stroke-linecap="round"/>`);
  L.push(`<path d="${d}" fill="none" stroke="#0a0918" stroke-width="1.5" stroke-linecap="round"/>`);
}
// bridge where the rail crosses the river
{
  let best = null;
  for (const a of RAIL_S) for (const b of RIVER_S) { const dd = dist(a.x, a.y, b.x, b.y); if (!best || dd < best.dd) best = { dd, a }; }
  const i = RAIL_S.indexOf(best.a), q = RAIL_S[i + 2], o = RAIL_S[i - 2];
  const ang = Math.atan2(q.y - o.y, q.x - o.x) * 180 / Math.PI;
  L.push(`<g transform="translate(${f(best.a.x)} ${f(best.a.y)}) rotate(${f(ang)})"><path d="M-11-4.6H11V4.6H-11Z" fill="#6c68a6" ${ol(1)}/><path d="M-11-4.6H11V-2.4H-11Z" fill="#c9c6ee"/><path d="M-9-4.6V4.6M9-4.6V4.6" stroke="${OL}" stroke-width="1.2"/><path d="M-11 0H11" stroke="#e4e6ff" stroke-width="1.4"/></g>`);
}

// ------------------------------------------------------------------ town sockets
L.push(TOWNS.map((t) => `<circle cx="${f(t.px)}" cy="${f(t.py)}" r="34" fill="url(#wm-socket)"/><circle cx="${f(t.px)}" cy="${f(t.py)}" r="27" fill="none" stroke="#e8ddff" stroke-width=".8" stroke-dasharray="2 4" opacity=".3"/>`).join(''));

// ------------------------------------------------------------------ landmarks
const LM = [];
const win = (x, y, w = 2.2, h = 2.6) => `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`;
function cottage(x, y, fw, sw, h, rh, roof = ['#8b4f5c', '#5a3046', '#b8707a'], wall = ['#d9cfee', '#8f86b8']) {
  const x0 = x, top = y - h, pk = [x0 + fw / 2, top - rh];
  let s = '';
  s += p(poly([[x0 + fw, y], [x0 + fw + sw, y], [x0 + fw + sw, top], [x0 + fw, top]]), wall[1], ol(0.9));
  s += p(poly([[x0, y], [x0 + fw, y], [x0 + fw, top], pk, [x0, top]]), wall[0], ol(0.9));
  s += p(poly([pk, [pk[0] + sw, pk[1]], [x0 + fw + sw + 1.6, top + 1.2], [x0 + fw + 1.6, top + 1.2]]), roof[0], ol(0.9));
  s += p(poly([pk, [pk[0] + sw, pk[1]], [pk[0] + sw + 1.6, pk[1] + 3], [pk[0] + 1.6, pk[1] + 3]]), roof[2]);
  s += `<path d="M${f(x0 - 1.4)} ${f(top + 1.4)}L${f(pk[0])} ${f(pk[1] - 0.6)}L${f(x0 + fw + 1.6)} ${f(top + 1.4)}" fill="none" stroke="${roof[1]}" stroke-width="2.2" stroke-linejoin="round"/>`;
  s += p(win(x0 + fw / 2 - 1.2, y - 4.6, 2.4, 4.6) + win(x0 + fw + sw / 2 - 1.1, top + h * 0.3, 2.2, 2.4), '#ffd091');
  return s;
}
// 起点村 — cottages, a windmill, a well, a fence; warm windows
{
  let s = '';
  s += `<ellipse cx="124" cy="372" rx="58" ry="12" fill="#3f5d4a" opacity=".35"/>`;
  s += `<use href="#wm-oakL" x="74" y="372"/><use href="#wm-oak" x="146" y="380"/>`;
  // windmill
  const mx = 164, my = 374;
  s += p(poly([[mx - 7, my], [mx + 7, my], [mx + 4.6, my - 26], [mx - 4.6, my - 26]]), '#8f86b8', ol(1));
  s += p(poly([[mx - 7, my], [mx - 0.5, my], [mx - 0.5, my - 26], [mx - 4.6, my - 26]]), '#d9cfee');
  s += p(`M${mx - 6.4} ${my - 25}Q${mx} ${my - 35} ${mx + 6.4} ${my - 25}Z`, '#7a4458', ol(1));
  s += p(`M${mx - 6.4} ${my - 25}Q${mx - 3} ${my - 32} ${mx} ${my - 32.4}V${my - 25}Z`, '#a8626f');
  s += p(win(mx - 1.4, my - 7, 2.8, 7) + win(mx - 1, my - 18, 2, 2.6), '#ffd091');
  s += `<g transform="translate(${mx} ${my - 26}) rotate(22)"><path d="M0 0V-18M0 0H18M0 0V18M0 0H-18" stroke="#4a3a5e" stroke-width="1.6"/><path d="M1-3.4H5.4V-17H1ZM3.4 1V5.4H17V1ZM-1 3.4H-5.4V17H-1ZM-3.4-1V-5.4H-17V-1Z" fill="#e8ddff" fill-opacity=".85" ${ol(0.7)}/><path d="M1-7H5.4M1-11H5.4M7 1V5.4M11 1V5.4M-1 7H-5.4M-1 11H-5.4M-7-1V-5.4M-11-1V-5.4" stroke="#6a5a8e" stroke-width=".5"/><circle r="1.8" fill="#ffd091" ${ol(0.6)}/></g>`;
  s += cottage(84, 376, 14, 12, 9, 8);
  s += cottage(112, 384, 12, 10, 8, 7, ['#5d6aa8', '#353d70', '#8792d0']);
  s += cottage(124, 368, 12, 10, 8, 7);
  // chimney + smoke
  s += p('M95 361h3v-6h-3Z', '#6a5a8e', ol(0.7));
  s += `<path d="M96.5 353q-3-4 0-7t0-7" fill="none" stroke="#e8ddff" stroke-width="1.6" opacity=".35" stroke-linecap="round"/>`;
  // well
  s += p('M141 386h7v-4h-7Z', '#8f86b8', ol(0.8)) + `<path d="M141.6 382v-6M147.4 382v-6M140 376h9" stroke="${OL}" stroke-width="1"/>` + p('M139.6 376.6L144.5 372.4L149.4 376.6Z', '#7a4458', ol(0.7));
  // fence
  s += `<path d="M70 388h40M72 385v5.4M80 385v5.4M88 385v5.4M96 385v5.4M104 385v5.4" stroke="#b6aad6" stroke-width="1" opacity=".85"/>`;
  LM.push(`<g>${s}</g>`);
}
// 银轨站 — a glass-vaulted station hall with a clock tower
{
  let s = '';
  const x0 = 214, y0 = 296;
  // side halls
  s += p(poly([[x0, y0], [x0 + 60, y0], [x0 + 60, y0 - 12], [x0, y0 - 12]]), '#8f86b8', ol(1));
  s += p(poly([[x0, y0], [x0 + 26, y0], [x0 + 26, y0 - 12], [x0, y0 - 12]]), '#cfc6ec');
  // glass barrel vault
  s += p(`M${x0 - 2} ${y0 - 12}Q${x0 + 30} ${y0 - 36} ${x0 + 62} ${y0 - 12}Z`, '#3e5a9a', ol(1));
  s += p(`M${x0 - 2} ${y0 - 12}Q${x0 + 14} ${y0 - 26} ${x0 + 30} ${y0 - 24}L${x0 + 30} ${y0 - 12}Z`, '#7ea4e6', 'opacity=".8"');
  s += `<path d="M${x0 + 10} ${y0 - 12}Q${x0 + 12} ${y0 - 24} ${x0 + 16} ${y0 - 26}M${x0 + 30} ${y0 - 12}V${y0 - 24}M${x0 + 50} ${y0 - 12}Q${x0 + 48} ${y0 - 24} ${x0 + 44} ${y0 - 26}M${x0 + 2} ${y0 - 16}Q${x0 + 30} ${y0 - 31} ${x0 + 58} ${y0 - 16}" fill="none" stroke="#dfe4ff" stroke-width=".8" opacity=".9"/>`;
  // arches
  for (let i = 0; i < 5; i++) s += p(`M${x0 + 4 + i * 11} ${y0}v-6a3.6 3.6 0 0 1 7.2 0v6Z`, '#ffd091', ol(0.7));
  // clock tower
  const cx = x0 + 30;
  s += p(poly([[cx - 5, y0 - 18], [cx + 5, y0 - 18], [cx + 5, y0 - 40], [cx - 5, y0 - 40]]), '#8f86b8', ol(1));
  s += p(poly([[cx - 5, y0 - 18], [cx, y0 - 18], [cx, y0 - 40], [cx - 5, y0 - 40]]), '#d9cfee');
  s += p(`M${cx - 6.6} ${y0 - 40}L${cx} ${y0 - 52}L${cx + 6.6} ${y0 - 40}Z`, '#4f5b9a', ol(1));
  s += p(`M${cx - 6.6} ${y0 - 40}L${cx} ${y0 - 52}L${cx} ${y0 - 40}Z`, '#8a9ad8');
  s += `<circle cx="${cx}" cy="${y0 - 32}" r="3.4" fill="#fff4dc" ${ol(0.8)}/><path d="M${cx} ${y0 - 34.4}V${y0 - 32}H${cx + 1.8}" fill="none" stroke="${OL}" stroke-width=".7"/>`;
  s += `<circle cx="${cx}" cy="${y0 - 54}" r="1.2" fill="#ffd091"/>`;
  LM.push(`<g>${s}</g>`);
}
// the moon-eclipse train (side view, rotated to the track)
{
  let s = '';
  // carriages behind (negative x), loco in front
  for (const cx of [-31, -17]) {
    s += p(`M${cx - 6} -2.6H${cx + 6}V-10H${cx - 6}Z`, '#3b3474', ol(0.9));
    s += p(`M${cx - 6.4} -10Q${cx} -12.4 ${cx + 6.4} -10Z`, '#8f86c8', ol(0.7));
    s += p(`M${cx - 4.4} -8.2h2.2v2.4h-2.2ZM${cx - 1.1} -8.2h2.2v2.4h-2.2ZM${cx + 2.2} -8.2h2.2v2.4h-2.2Z`, '#ffd091');
    s += `<path d="M${cx - 6} -4.4H${cx + 6}" stroke="#b58cff" stroke-width=".8"/>`;
  }
  s += p('M-10 -2.6H8Q11 -2.6 11.6 -6Q11 -9 8 -9H0V-13H-8V-9H-10Z', '#2a2456', ol(0.9));
  s += p('M-8 -13H0V-11.2H-8Z', '#c9c2f0');
  s += p('M2 -9V-14H6V-9Z', '#4a4282', ol(0.8));
  s += `<path d="M-10 -5H11" stroke="#b58cff" stroke-width=".9"/><circle cx="10.6" cy="-6" r="1.4" fill="#fff0c8"/>`;
  s += p('M11.6 -6L30 -12V2Z', 'url(#wm-beam)', 'opacity=".55"');
  s += `<circle cx="-6" cy="-1.6" r="1.8" fill="#14112e" stroke="#c9c2f0" stroke-width=".6"/><circle cx="0" cy="-1.6" r="1.8" fill="#14112e" stroke="#c9c2f0" stroke-width=".6"/><circle cx="5.6" cy="-1.6" r="1.8" fill="#14112e" stroke="#c9c2f0" stroke-width=".6"/>`;
  s += `<path d="M4-15q-4-5-11-4q-6 1-11-3q-6-4-14-1" fill="none" stroke="#e8ddff" stroke-width="2.4" stroke-linecap="round" opacity=".28"/><circle cx="-24" cy="-22" r="1" fill="#e8ddff" opacity=".7"/><circle cx="-34" cy="-19" r=".8" fill="#e8ddff" opacity=".5"/>`;
  LM.push(`<g transform="translate(${f(TRAIN.x)} ${f(TRAIN.y)}) rotate(${f(TRAIN.ang)})">${s}</g>`);
}
// 月蚀城 — moon-domed holy city behind a white wall
{
  let s = '';
  const cx = 386, gy = 206;
  s += `<circle cx="${cx}" cy="${gy - 32}" r="44" fill="url(#wm-halo)" opacity=".35"/>`;
  // back spires
  for (const [sx, sh] of [[cx - 24, 34], [cx + 24, 38]]) {
    s += p(poly([[sx - 4, gy - 8], [sx + 4, gy - 8], [sx + 4, gy - sh], [sx - 4, gy - sh]]), '#8a7cc4', ol(1));
    s += p(poly([[sx - 4, gy - 8], [sx, gy - 8], [sx, gy - sh], [sx - 4, gy - sh]]), '#d8ceff');
    s += p(`M${sx - 5.4} ${gy - sh}L${sx} ${gy - sh - 16}L${sx + 5.4} ${gy - sh}Z`, '#4a3c8e', ol(1));
    s += p(`M${sx - 5.4} ${gy - sh}L${sx} ${gy - sh - 16}L${sx} ${gy - sh}Z`, '#9a86e0');
    s += p(win(sx - 1, gy - sh + 6, 2, 4), '#ffd091');
  }
  // cathedral body + great dome
  s += p(poly([[cx - 16, gy - 6], [cx + 16, gy - 6], [cx + 16, gy - 24], [cx - 16, gy - 24]]), '#8a7cc4', ol(1));
  s += p(poly([[cx - 16, gy - 6], [cx - 2, gy - 6], [cx - 2, gy - 24], [cx - 16, gy - 24]]), '#d8ceff');
  s += p(`M${cx - 15} ${gy - 24}A15 15 0 0 1 ${cx + 15} ${gy - 24}Z`, '#7f6cc8', ol(1));
  s += p(`M${cx - 15} ${gy - 24}A15 15 0 0 1 ${cx + 2} ${gy - 38.8}Q${cx - 8} ${gy - 34} ${cx - 6} ${gy - 24}Z`, '#e4dbff');
  s += `<path d="M${cx - 11} ${gy - 27}Q${cx} ${gy - 30} ${cx + 11} ${gy - 27}M${cx} ${gy - 39}V${gy - 24}M${cx - 7} ${gy - 36}Q${cx - 9} ${gy - 30} ${cx - 9} ${gy - 24}M${cx + 7} ${gy - 36}Q${cx + 9} ${gy - 30} ${cx + 9} ${gy - 24}" fill="none" stroke="#4a3c8e" stroke-width=".8"/><path d="M${cx + 2} ${gy - 33}l5-1.6v4l-5 1.4Z" fill="#ffd091" opacity=".8"/>`;
  s += p(`M${cx - 1} ${gy - 39}v-5h2v5Z`, '#c9b8f4', ol(0.6));
  s += `<circle cx="${cx}" cy="${gy - 48.6}" r="4.6" fill="#1a1436" stroke="#ffd091" stroke-width="1.4"/><ellipse cx="${cx}" cy="${gy - 48.6}" rx="7.6" ry="2.4" fill="none" stroke="#ffd091" stroke-width=".9" transform="rotate(-20 ${cx} ${gy - 48.6})"/><circle cx="${cx - 2.6}" cy="${gy - 46.4}" r="1" fill="#fff6dc"/>`;
  // rose window + windows
  s += `<circle cx="${cx}" cy="${gy - 17}" r="3.4" fill="#ffd091" ${ol(0.7)}/><path d="M${cx - 3.4} ${gy - 17}h6.8M${cx} ${gy - 20.4}v6.8" stroke="#c58a3a" stroke-width=".6"/>`;
  s += p(win(cx - 12, gy - 16, 2.2, 5) + win(cx + 9.8, gy - 16, 2.2, 5), '#ffd091');
  // white wall with round end towers
  s += p(poly([[cx - 38, gy + 2], [cx + 38, gy + 2], [cx + 38, gy - 7], [cx - 38, gy - 7]]), '#a79ad8', ol(1));
  s += p(poly([[cx - 38, gy - 4.4], [cx + 38, gy - 4.4], [cx + 38, gy - 7], [cx - 38, gy - 7]]), '#ece6ff');
  let cr = '';
  for (let x = cx - 36; x < cx + 36; x += 5) cr += `M${x} ${gy - 7}v-2.4h2.6v2.4`;
  s += `<path d="${cr}" fill="#ece6ff" stroke="${OL}" stroke-width=".7"/>`;
  s += p(`M${cx - 4} ${gy + 2}v-5a4 4 0 0 1 8 0v5Z`, '#2a2052', ol(0.8));
  for (const tx of [cx - 40, cx + 40]) {
    s += p(`M${tx - 5} ${gy + 2}V${gy - 14}H${tx + 5}V${gy + 2}Z`, '#a79ad8', ol(1));
    s += p(`M${tx - 5} ${gy + 2}V${gy - 14}H${tx}V${gy + 2}Z`, '#ece6ff');
    s += p(`M${tx - 6} ${gy - 14}L${tx} ${gy - 22}L${tx + 6} ${gy - 14}Z`, '#5a4aa0', ol(0.9));
    s += p(win(tx - 1, gy - 10, 2, 3), '#ffd091');
  }
  LM.push(`<g>${s}</g>`);
}
// 霜华镇 — frosted A-frames around an ice chapel, lanterns, snow drifts
{
  let s = '';
  const gy = 112;
  s += `<ellipse cx="552" cy="${gy - 4}" rx="66" ry="18" fill="url(#wm-drift)"/>`;
  const frost = (x, y, w, h, rh) => {
    let t = '';
    t += p(poly([[x, y], [x + w, y], [x + w, y - h], [x, y - h]]), '#5d77b4', ol(0.9));
    t += p(poly([[x, y], [x + w * 0.45, y], [x + w * 0.45, y - h], [x, y - h]]), '#9fb8ea');
    t += p(poly([[x - 2.6, y - h + 1.2], [x + w / 2, y - h - rh], [x + w + 2.6, y - h + 1.2]]), '#aab6e6', ol(0.9));
    t += p(poly([[x - 2.6, y - h + 1.2], [x + w / 2, y - h - rh], [x + w / 2 + 0.6, y - h + 1.2]]), '#f4f6ff');
    t += `<path d="M${f(x - 1.4)} ${f(y - h + 1.4)}v2.8M${f(x + 2.4)} ${f(y - h + 1.4)}v1.8M${f(x + w + 1.2)} ${f(y - h + 1.4)}v2.4" stroke="#e8f0ff" stroke-width="1" stroke-linecap="round"/>`;
    t += p(win(x + w / 2 - 1.3, y - h * 0.66, 2.6, 3.2), '#ffd091');
    return t;
  };
  s += frost(506, gy - 6, 12, 9, 12);
  s += frost(578, gy - 8, 12, 9, 12);
  s += frost(522, gy, 13, 10, 13);
  s += frost(564, gy - 1, 12, 9, 12);
  // ice chapel
  const cx = 549;
  s += p(poly([[cx - 8, gy - 2], [cx + 8, gy - 2], [cx + 8, gy - 19], [cx - 8, gy - 19]]), '#5d77b4', ol(1));
  s += p(poly([[cx - 8, gy - 2], [cx - 1, gy - 2], [cx - 1, gy - 19], [cx - 8, gy - 19]]), '#a9c2f0');
  s += p(poly([[cx - 10.4, gy - 18], [cx, gy - 34], [cx + 10.4, gy - 18]]), '#aab6e6', ol(1));
  s += p(poly([[cx - 10.4, gy - 18], [cx, gy - 34], [cx + 0.6, gy - 18]]), '#f4f6ff');
  s += p(`M${cx - 3} ${gy - 2}v-6a3 3 0 0 1 6 0v6Z`, '#ffd091', ol(0.7));
  s += `<circle cx="${cx}" cy="${gy - 24}" r="2" fill="#ffd091" ${ol(0.6)}/>`;
  s += `<path d="M${cx} ${gy - 34}v-4" stroke="${OL}" stroke-width="1"/>`;
  s += p(`M${cx} ${gy - 50}l2.4 6 6 2.4-6 2.4-2.4 6-2.4-6-6-2.4 6-2.4Z`, '#e6f6ff', ol(0.7));
  s += `<circle cx="${cx}" cy="${gy - 41.6}" r="9" fill="url(#wm-halo)" opacity=".5"/>`;
  s += `<path d="M500 ${gy + 2}q24-5 50-1t50-2" fill="none" stroke="#eef2ff" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>`;
  for (const [x, y, r] of [[500, 84, 1.3], [600, 88, 1.5], [590, 66, 1.1], [520, 64, 1.1], [612, 106, 1]]) s += `<path d="M${x - r * 2} ${y}h${r * 4}M${x} ${y - r * 2}v${r * 4}M${f(x - r * 1.4)} ${f(y - r * 1.4)}l${f(r * 2.8)} ${f(r * 2.8)}M${f(x - r * 1.4)} ${f(y + r * 1.4)}l${f(r * 2.8)} ${f(-r * 2.8)}" stroke="#e8f4ff" stroke-width=".7" opacity=".75"/>`;
  LM.push(`<g>${s}</g>`);
}
// 瓦尔哈拉要塞 — steel fortress on a crag
{
  let s = '';
  const cx = 700, gy = 184;
  // crag: faceted cliff under the walls
  s += p(`M${cx - 42} ${gy - 8}H${cx + 40}L${cx + 46} ${gy + 2}L${cx + 36} ${gy + 10}L${cx + 22} ${gy + 6}L${cx + 10} ${gy + 13}L${cx - 6} ${gy + 7}L${cx - 20} ${gy + 12}L${cx - 34} ${gy + 6}L${cx - 46} ${gy + 2}Z`, '#2c2858', ol(1));
  s += p(`M${cx - 42} ${gy - 8}H${cx - 2}L${cx - 6} ${gy + 7}L${cx - 20} ${gy + 12}L${cx - 34} ${gy + 6}L${cx - 46} ${gy + 2}Z`, '#4c4888');
  s += `<path d="M${cx - 30} ${gy - 6}l-4 11M${cx - 14} ${gy - 6}l-3 14M${cx + 14} ${gy - 6}l2 11M${cx + 30} ${gy - 6}l3 12" stroke="${OL}" stroke-width=".8" opacity=".6"/>`;
  // curtain wall
  s += p(poly([[cx - 34, gy - 6], [cx + 34, gy - 6], [cx + 34, gy - 20], [cx - 34, gy - 20]]), '#5e5a8e', ol(1));
  s += p(poly([[cx - 34, gy - 6], [cx - 4, gy - 6], [cx - 4, gy - 20], [cx - 34, gy - 20]]), '#a9a4d4');
  let cr = '';
  for (let x = cx - 33; x < cx + 33; x += 5) cr += `M${x} ${gy - 20}v-2.6h2.8v2.6`;
  s += `<path d="${cr}" fill="#a9a4d4" stroke="${OL}" stroke-width=".7"/>`;
  s += p(`M${cx - 4} ${gy - 6}v-7a4 4 0 0 1 8 0v7Z`, '#14112e', ol(0.8));
  s += `<path d="M${cx - 2.6} ${gy - 6}v-7M${cx} ${gy - 6}v-9M${cx + 2.6} ${gy - 6}v-7" stroke="#8a86bd" stroke-width=".6"/>`;
  // keep
  s += p(poly([[cx - 10, gy - 20], [cx + 10, gy - 20], [cx + 10, gy - 42], [cx - 10, gy - 42]]), '#5e5a8e', ol(1));
  s += p(poly([[cx - 10, gy - 20], [cx - 1, gy - 20], [cx - 1, gy - 42], [cx - 10, gy - 42]]), '#bdb8e4');
  s += p(poly([[cx - 12, gy - 41], [cx, gy - 54], [cx + 12, gy - 41]]), '#3a3470', ol(1));
  s += p(poly([[cx - 12, gy - 41], [cx, gy - 54], [cx, gy - 41]]), '#7a72b8');
  s += `<path d="M${cx} ${gy - 54}v-12" stroke="${OL}" stroke-width="1.1"/>`;
  s += p(`M${cx} ${gy - 66}h10l-3 3 3 3H${cx}Z`, '#c084fc', ol(0.7));
  s += p(win(cx - 6, gy - 36, 2, 4) + win(cx + 3.4, gy - 36, 2, 4) + win(cx - 1, gy - 29, 2, 4), '#ffd091');
  // corner towers
  for (const tx of [cx - 32, cx + 32]) {
    s += p(poly([[tx - 6, gy - 6], [tx + 6, gy - 6], [tx + 6, gy - 30], [tx - 6, gy - 30]]), '#5e5a8e', ol(1));
    s += p(poly([[tx - 6, gy - 6], [tx, gy - 6], [tx, gy - 30], [tx - 6, gy - 30]]), '#bdb8e4');
    s += p(poly([[tx - 8, gy - 29], [tx, gy - 40], [tx + 8, gy - 29]]), '#3a3470', ol(1));
    s += p(poly([[tx - 8, gy - 29], [tx, gy - 40], [tx, gy - 29]]), '#7a72b8');
    s += p(win(tx - 1, gy - 22, 2, 4), '#ffd091');
    s += `<circle cx="${tx}" cy="${gy - 42.6}" r="1" fill="#e4e6ff"/>`;
  }
  // torches
  s += `<circle cx="${cx - 18}" cy="${gy - 12}" r="3" fill="url(#wm-halo)"/><circle cx="${cx + 18}" cy="${gy - 12}" r="3" fill="url(#wm-halo)"/>`;
  LM.push(`<g>${s}</g>`);
}
// 星咏塔 — the lone star-singer tower
{
  let s = '';
  const cx = 579, gy = 338;
  s += `<circle cx="${cx}" cy="${gy - 84}" r="22" fill="url(#wm-halo)" opacity=".7"/>`;
  s += p(`M${cx - 15} ${gy + 2}Q${cx} ${gy - 6} ${cx + 15} ${gy + 2}Z`, '#3a3668', ol(1));
  s += p(poly([[cx - 8, gy], [cx + 8, gy], [cx + 5.6, gy - 64], [cx - 5.6, gy - 64]]), '#6a64a0', ol(1));
  s += p(poly([[cx - 8, gy], [cx - 1, gy], [cx - 0.8, gy - 64], [cx - 5.6, gy - 64]]), '#cfc8ef');
  s += `<path d="M${cx - 7.6} ${gy - 16}H${cx + 7.6}M${cx - 6.9} ${gy - 36}H${cx + 6.9}" stroke="${OL}" stroke-width=".8"/>`;
  s += p(win(cx - 1, gy - 10, 2, 4) + win(cx - 1, gy - 30, 2, 4) + win(cx - 1, gy - 50, 2, 4), '#ffd091');
  // balcony + observatory dome
  s += p(`M${cx - 9} ${gy - 64}h18v3h-18Z`, '#8a84c0', ol(0.9));
  s += p(`M${cx - 6.4} ${gy - 66}A6.4 6.4 0 0 1 ${cx + 6.4} ${gy - 66}Z`, '#ffd98c', ol(0.9));
  s += p(`M${cx - 6.4} ${gy - 66}A6.4 6.4 0 0 1 ${cx} ${gy - 72.4}V${gy - 66}Z`, '#fff0c8');
  s += `<ellipse cx="${cx}" cy="${gy - 70}" rx="17" ry="4.6" fill="none" stroke="#ffd98c" stroke-width=".9" opacity=".75" transform="rotate(-14 ${cx} ${gy - 70})"/>`;
  s += p(`M${cx} ${gy - 96}l1.9 7.2 7.2 1.9-7.2 1.9-1.9 7.2-1.9-7.2-7.2-1.9 7.2-1.9Z`, '#fff6dc');
  s += `<circle cx="${cx + 13}" cy="${gy - 83}" r="1" fill="#ffd98c"/><circle cx="${cx - 12}" cy="${gy - 92}" r=".8" fill="#ffd98c"/>`;
  LM.push(`<g>${s}</g>`);
}
// 诺德之门 — a glowing arch into the moon realm, with floating shards
{
  let s = '';
  const cx = 800, gy = 252;
  s += `<ellipse cx="${cx}" cy="${gy - 18}" rx="40" ry="34" fill="url(#wm-halo)" opacity=".18"/>`;
  s += p(`M${cx - 26} ${gy + 2}Q${cx} ${gy - 4} ${cx + 26} ${gy + 2}Z`, '#3a2e66', ol(1));
  // portal
  s += p(`M${cx - 10} ${gy - 1}V${gy - 24}A10 10 0 0 1 ${cx + 10} ${gy - 24}V${gy - 1}Z`, 'url(#wm-portal)');
  s += `<path d="M${cx} ${gy - 14}m-1 0a1 1 0 0 1 2 0a3 3 0 0 1-5 2a5 5 0 0 1 8-6a7 7 0 0 1-9 9" fill="none" stroke="#fff0fa" stroke-width=".9" opacity=".8" stroke-linecap="round"/>`;
  // arch stones
  s += p(`M${cx - 17} ${gy}V${gy - 24}A17 17 0 0 1 ${cx + 17} ${gy - 24}V${gy}H${cx + 10}V${gy - 24}A10 10 0 0 0 ${cx - 10} ${gy - 24}V${gy}Z`, '#6a5aa0', ol(1));
  s += p(`M${cx - 17} ${gy}V${gy - 24}A17 17 0 0 1 ${cx - 2} ${gy - 40.9}L${cx - 1.4} ${gy - 34}A10 10 0 0 0 ${cx - 10} ${gy - 24}V${gy}Z`, '#c8bcf0');
  s += `<path d="M${cx - 17} ${gy - 12}h7M${cx + 10} ${gy - 12}h7M${cx - 15.4} ${gy - 33}l6 3.4M${cx + 15.4} ${gy - 33}l-6 3.4M${cx} ${gy - 41}v7" stroke="${OL}" stroke-width=".8"/>`;
  s += `<circle cx="${cx}" cy="${gy - 37.6}" r="1.8" fill="#f472b6" ${ol(0.6)}/>`;
  // floating shards
  for (const [x, y, k] of [[cx - 27, gy - 32, 1], [cx + 28, gy - 26, 0.8], [cx + 22, gy - 46, 0.7], [cx - 22, gy - 50, 0.6]]) {
    s += p(`M${x} ${y - 6 * k}L${x + 2.6 * k} ${y}L${x} ${y + 6 * k}L${x - 2.6 * k} ${y}Z`, '#f9a8d4', ol(0.7));
    s += p(`M${x} ${y - 6 * k}L${x - 2.6 * k} ${y}L${x} ${y + 6 * k}Z`, '#ffe0f0');
  }
  LM.push(`<g>${s}</g>`);
}
// 终点站 — a terminal shed at land's end, and a lighthouse on the cape
{
  let s = '';
  const x0 = 930, gy = 392;
  s += p(poly([[x0, gy], [x0 + 40, gy], [x0 + 40, gy - 12], [x0, gy - 12]]), '#8f86b8', ol(1));
  s += p(poly([[x0, gy], [x0 + 16, gy], [x0 + 16, gy - 12], [x0, gy - 12]]), '#d9cfee');
  s += p(`M${x0 - 2} ${gy - 12}A22 18 0 0 1 ${x0 + 42} ${gy - 12}Z`, '#3e5a9a', ol(1));
  s += p(`M${x0 - 2} ${gy - 12}A22 18 0 0 1 ${x0 + 18} ${gy - 29.7}Q${x0 + 8} ${gy - 22} ${x0 + 10} ${gy - 12}Z`, '#7ea4e6', 'opacity=".85"');
  s += `<path d="M${x0 + 20} ${gy - 12}V${gy - 30}M${x0 + 8} ${gy - 12}Q${x0 + 9} ${gy - 24} ${x0 + 13} ${gy - 27}M${x0 + 32} ${gy - 12}Q${x0 + 31} ${gy - 24} ${x0 + 27} ${gy - 27}" fill="none" stroke="#dfe4ff" stroke-width=".8"/>`;
  s += `<circle cx="${x0 + 20}" cy="${gy - 18}" r="4.4" fill="#ffd091" ${ol(0.8)}/><path d="M${x0 + 15.6} ${gy - 18}h8.8M${x0 + 20} ${gy - 22.4}v8.8M${x0 + 17} ${gy - 21}l6 6M${x0 + 23} ${gy - 21}l-6 6" stroke="#c58a3a" stroke-width=".5"/>`;
  for (let i = 0; i < 4; i++) s += p(`M${x0 + 3 + i * 9.6} ${gy}v-5a2.6 2.6 0 0 1 5.2 0v5Z`, '#ffd091', ol(0.6));
  // lighthouse
  const lx = 966, ly = 446;
  s += p(`M${lx - 9} ${ly + 2}Q${lx} ${ly - 4} ${lx + 9} ${ly + 2}Z`, '#3a3668', ol(1));
  s += p(poly([[lx - 4.4, ly], [lx + 4.4, ly], [lx + 3, ly - 30], [lx - 3, ly - 30]]), '#a49ad0', ol(1));
  s += p(poly([[lx - 4.4, ly], [lx, ly], [lx, ly - 30], [lx - 3, ly - 30]]), '#eee8ff');
  s += p(`M${lx - 4.1} ${ly - 8}h8.2l-.3-5h-7.6ZM${lx - 3.6} ${ly - 19}h7.2l-.3-5h-6.6Z`, '#c13b4c', 'opacity=".85"');
  s += p(`M${lx - 4} ${ly - 30}h8v-6h-8Z`, '#ffd091', ol(0.8));
  s += p(`M${lx - 4.6} ${ly - 36}L${lx} ${ly - 42}L${lx + 4.6} ${ly - 36}Z`, '#3a3470', ol(0.8));
  s += p(`M${lx - 4} ${ly - 33}L${lx - 50} ${ly - 40}L${lx - 48} ${ly - 14}Z`, 'url(#wm-beamL)', 'opacity=".6"');
  LM.push(`<g>${s}</g>`);
}
// ruins — a broken colonnade on the southern plain
{
  let s = '';
  const gy = 438;
  s += p(`M444 ${gy + 2}H518L512 ${gy - 2}H450Z`, '#3a3668', ol(0.9));
  for (const [x, h] of [[452, 24], [466, 30], [494, 14], [508, 20]]) {
    s += p(poly([[x - 3.4, gy], [x + 3.4, gy], [x + 3.4, gy - h + 2], [x + 1, gy - h], [x - 3.4, gy - h + 1.2]]), '#7c76ac', ol(0.9));
    s += p(poly([[x - 3.4, gy], [x - 0.6, gy], [x - 0.6, gy - h + 0.4], [x - 3.4, gy - h + 1.2]]), '#cfc8ef');
  }
  s += p(`M449 ${gy - 30}H${470} V${gy - 26}H449Z`, '#7c76ac', ol(0.9));
  s += p(`M478 ${gy}l12-4 2 3-12 4Z`, '#7c76ac', ol(0.8));
  s += p(`M474 ${gy}h6v-3h-6Z`, '#5e5890', ol(0.7));
  LM.push(`<g>${s}</g>`);
}
// travellers' camp on the southern plain: a tent and a campfire
{
  let s = '';
  const x = 318, y = 472;
  s += `<circle cx="${x + 18}" cy="${y - 3}" r="14" fill="url(#wm-halo)" opacity=".55"/>`;
  s += p(`M${x - 9} ${y}L${x} ${y - 14}L${x + 9} ${y}Z`, '#8a7a5e', ol(0.9));
  s += p(`M${x - 9} ${y}L${x} ${y - 14}L${x - 1} ${y}Z`, '#d8c6a4');
  s += p(`M${x - 2.6} ${y}L${x} ${y - 6}L${x + 2.6} ${y}Z`, '#2a2040');
  s += `<path d="M${x + 14} ${y + 1}l8-3M${x + 14} ${y - 2}l8 3" stroke="#5a4636" stroke-width="1.4" stroke-linecap="round"/>`;
  s += p(`M${x + 18} ${y - 1}c-2.6-1.8-2.4-4.6 0-7.6c.4 2 2.6 2.6 2.6 4.8 0 1.6-1.2 2.8-2.6 2.8z`, '#ffb38a', ol(0.6));
  s += p(`M${x + 18} ${y - 1.4}c-1-1-1-2.4 0-3.6c.8 1.2 1.2 1.8 1.2 2.4 0 .8-.6 1.2-1.2 1.2z`, '#fff0c8');
  LM.push(`<g>${s}</g>`);
}
// standing stones by the gulf
{
  let s = '';
  for (const [x, y, h] of [[684, 404, 9], [694, 398, 12], [706, 396, 13], [718, 399, 11], [726, 406, 8]]) {
    s += p(`M${x - 2.6} ${y}V${y - h + 1.6}Q${x} ${y - h - 1} ${x + 2.6} ${y - h + 1.6}V${y}Z`, '#6c66a0', ol(0.8));
    s += p(`M${x - 2.6} ${y}V${y - h + 1.6}Q${x - 1} ${y - h} ${x} ${y - h - 0.2}V${y}Z`, '#bdb6e6');
  }
  s += `<ellipse cx="705" cy="402" rx="9" ry="3" fill="#ffd98c" opacity=".18"/>`;
  LM.push(`<g>${s}</g>`);
}
// ship under the eclipse
{
  const x = 938, y = 268;
  let s = '';
  s += p(`M${x - 11} ${y}H${x + 12}L${x + 8} ${y + 5}H${x - 8}Z`, '#2a2456', ol(0.9));
  s += `<path d="M${x} ${y}V${y - 20}" stroke="${OL}" stroke-width="1.1"/>`;
  s += p(`M${x + 1} ${y - 19}Q${x + 10} ${y - 12} ${x + 9} ${y - 3}H${x + 1}Z`, '#e8ddff', ol(0.8));
  s += p(`M${x - 1} ${y - 15}Q${x - 8} ${y - 9} ${x - 8} ${y - 3}H${x - 1}Z`, '#a99ee0', ol(0.8));
  s += `<path d="M${x} ${y - 20}l5-2-5-1.6" fill="#ff6b7c"/><path d="M${x - 14} ${y + 6}q4-2 8 0t8 0t8 0t8 0" fill="none" stroke="#c9d6ff" stroke-width=".9" opacity=".6"/>`;
  LM.push(`<g>${s}</g>`);
}
L.push(...LM);

// ------------------------------------------------------------------ eclipse moon
{
  const mx = 892, my = 78;
  L.push(`<circle cx="${mx}" cy="${my}" r="150" fill="url(#wm-moonglow)"/>`);
  let rays = '';
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2, r1 = 46, r2 = i % 2 ? 66 : 84;
    rays += `M${f(mx + Math.cos(a) * r1)} ${f(my + Math.sin(a) * r1)}L${f(mx + Math.cos(a) * r2)} ${f(my + Math.sin(a) * r2)}`;
  }
  L.push(`<path d="${rays}" stroke="#e8ddff" stroke-width="1" opacity=".22" stroke-linecap="round"/>`);
  L.push(`<circle cx="${mx}" cy="${my}" r="66" fill="none" stroke="#e8ddff" stroke-width=".7" opacity=".28"/><circle cx="${mx}" cy="${my}" r="100" fill="none" stroke="#b58cff" stroke-width=".7" stroke-dasharray="1.5 5" opacity=".4"/>`);
  L.push(`<circle cx="${mx}" cy="${my}" r="60" fill="url(#wm-corona)"/>`);
  L.push(`<circle cx="${mx}" cy="${my}" r="37" fill="url(#wm-disc)" stroke="#f4eeff" stroke-width="1.6"/>`);
  L.push(`<path d="M${mx - 34} ${my + 16}A37 37 0 0 0 ${mx + 6} ${my + 36.6}A40 40 0 0 1 ${mx - 34} ${my + 16}Z" fill="#fff"/>`);
  L.push(`<circle cx="${mx - 24}" cy="${my + 28}" r="7" fill="url(#wm-halo)"/>`);
  L.push(p(`M${mx - 24} ${my + 18}l1.6 8.4 8.4 1.6-8.4 1.6-1.6 8.4-1.6-8.4-8.4-1.6 8.4-1.6Z`, '#fff'));
}
// stars over the sea
{
  let st = '';
  const r2 = rngFrom(55);
  let n = 0;
  for (let i = 0; i < 600 && n < 46; i++) {
    const x = r2() * 990 + 5, y = r2() * 550 + 5;
    if (onLand(x, y) || minDist(x, y, LAND) < 10) continue;
    st += `M${f(x)} ${f(y)}h.01`; n++;
  }
  L.push(`<path d="${st}" stroke="#e8ddff" stroke-width="1.6" stroke-linecap="round" opacity=".45"/>`);
}

// ------------------------------------------------------------------ compass rose
{
  const cx = 930, cy = 503, r = 34;
  let s = '';
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0b0a1f" fill-opacity=".55" stroke="#ffd091" stroke-width="1" stroke-opacity=".6"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r - 5}" fill="none" stroke="#e8ddff" stroke-width=".6" opacity=".4"/>`;
  let ticks = '';
  for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, r1 = r - (i % 4 ? 2.6 : 5); ticks += `M${f(cx + Math.cos(a) * r1)} ${f(cy + Math.sin(a) * r1)}L${f(cx + Math.cos(a) * r)} ${f(cy + Math.sin(a) * r)}`; }
  s += `<path d="${ticks}" stroke="#ffd091" stroke-width=".8" opacity=".6"/>`;
  const point = (ang, len, wdt, lit, dark) => {
    const a = ang * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    const tip = [cx + ca * len, cy + sa * len], l = [cx - sa * wdt, cy + ca * wdt], rr = [cx + sa * wdt, cy - ca * wdt];
    return p(poly([[cx, cy], tip, l]), lit, ol(0.6)) + p(poly([[cx, cy], tip, rr]), dark, ol(0.6));
  };
  for (const a of [45, 135, 225, 315]) s += point(a, r * 0.62, 4, '#cfc8ef', '#5a5490');
  for (const a of [0, 90, 180]) s += point(a, r * 0.92, 6, '#e8ddff', '#6a64a0');
  s += point(270, r * 1.02, 6.4, '#ffe2b0', '#c58a3a');
  s += `<circle cx="${cx}" cy="${cy}" r="3" fill="#ffd091" ${ol(0.8)}/>`;
  s += p(`M${cx} ${cy - r - 10}l2.2 4-2.2 4-2.2-4Z`, '#ffd091', ol(0.6));
  L.push(`<g>${s}</g>`);
}
// scale bar (bottom-left, no text)
{
  let s = '';
  const x = 34, y = 540;
  for (let i = 0; i < 4; i++) s += `<rect x="${x + i * 18}" y="${y}" width="18" height="3.4" fill="${i % 2 ? '#0b0a1f' : '#e8ddff'}" fill-opacity="${i % 2 ? 0.6 : 0.55}"/>`;
  s += `<rect x="${x}" y="${y}" width="72" height="3.4" fill="none" stroke="#ffd091" stroke-width=".7" stroke-opacity=".6"/><path d="M${x} ${y - 3}v9M${x + 72} ${y - 3}v9M${x + 36} ${y - 1.6}v6.6" stroke="#ffd091" stroke-width=".7" opacity=".6"/>`;
  L.push(s);
}

// ------------------------------------------------------------------ vignette + frame
L.push(`<rect width="${W}" height="${H}" fill="url(#wm-vig)"/>`);
{
  let s = '';
  s += `<rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="6" fill="none" stroke="#ffd091" stroke-width="1.2" opacity=".42"/>`;
  s += `<rect x="12.5" y="12.5" width="${W - 25}" height="${H - 25}" rx="3" fill="none" stroke="#e8ddff" stroke-width=".7" opacity=".22"/>`;
  const corner = `<path d="M4 46V14Q4 4 14 4H46M9 40V18Q9 9 18 9H40" fill="none" stroke="#ffd091" stroke-width="1.3" opacity=".7"/>` +
    `<path d="M18 18m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0M20.6 13.6a4.6 4.6 0 1 0 0 8.8a3.6 3.6 0 1 1 0-8.8Z" fill="none" stroke="#ffd091" stroke-width="1" opacity=".75"/>` +
    `<path d="M46 4l5 0M51 1.6l2.6 2.4-2.6 2.4-2.6-2.4ZM4 46v5M1.6 51l2.4 2.6 2.4-2.6-2.4-2.6Z" fill="#ffd091" stroke="#ffd091" stroke-width=".8" opacity=".8"/>` +
    `<path d="M26 9q8 6 16 0M9 26q6 8 0 16" fill="none" stroke="#e8ddff" stroke-width=".8" opacity=".45"/>`;
  defs.push(`<g id="wm-corner">${corner}</g>`);
  s += `<use href="#wm-corner" x="4" y="4"/><use href="#wm-corner" transform="matrix(-1 0 0 1 ${W - 4} 4)"/><use href="#wm-corner" transform="matrix(1 0 0 -1 4 ${H - 4})"/><use href="#wm-corner" transform="matrix(-1 0 0 -1 ${W - 4} ${H - 4})"/>`;
  // top centre cartouche flourish (empty, the UI owns all text)
  s += `<path d="M430 8.5H470L480 14L490 8.5H510L520 14L530 8.5H570" fill="none" stroke="#ffd091" stroke-width="1" opacity=".55"/><path d="M500 4l4 7-4 7-4-7Z" fill="#ffd091" opacity=".75"/>`;
  s += `<path d="M430 551.5H470L480 546L490 551.5H510L520 546L530 551.5H570" fill="none" stroke="#ffd091" stroke-width="1" opacity=".55"/><path d="M500 542l4 7-4 7-4-7Z" fill="#ffd091" opacity=".75"/>`;
  L.push(s);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" stroke-linejoin="round"><defs>${defs.join('')}</defs>${L.join('')}</svg>\n`;

// ------------------------------------------------------------------ checks
const FORBIDDEN = [/<script/i, /<foreignObject/i, /<text[\s>]/i, /<image[\s>]/i, /\son[a-z]+\s*=/i, /href\s*=\s*"(?!#)/i, /@import|@font-face/i, /<svg[^>]*\s(width|height)=/i, /<filter/i];
const bad = FORBIDDEN.filter((re) => re.test(svg));
const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const badIds = ids.filter((id) => !id.startsWith('wm-'));
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
// the rail must pass exactly through every town point, in route order
const railD = svg.match(/id="wm-rail" d="([^"]+)"/)[1];
const railPts = [railD.match(/^M([\d.]+) ([\d.]+)/).slice(1).map(Number), ...[...railD.matchAll(/C[\d. ]+? ([\d.]+) ([\d.]+)(?=C|$)/g)].map((m) => [Number(m[1]), Number(m[2])])];
const railOk = railPts.length === TOWNS.length && TOWNS.every((t, i) => Math.abs(railPts[i][0] - t.px) < 0.05 && Math.abs(railPts[i][1] - t.py) < 0.05);
if (!railOk) { console.error('rail does not pass through the towns', railPts); process.exit(1); }
if (bad.length || badIds.length || dup.length) { console.error('SVG hygiene failed', bad, badIds, dup); process.exit(1); }
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`world-map.svg  ${(Buffer.byteLength(svg) / 1024).toFixed(1)}KB  trees=${trees.length}`);
