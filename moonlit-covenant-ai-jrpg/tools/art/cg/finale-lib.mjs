// Shared drawing helpers for the five late-game CGs painted by tools/art/cg/finale-set.mjs
// (battle-phase3 / aftermath-snow / ending-seal / ending-share / ending-destroy).
// Zero dependencies. Every helper returns SVG markup; ids are always prefixed by the caller's
// asset prefix (p) so the CGs can be inlined side by side without collisions.
// Drawing language deliberately matches the prologue set (tools/art/cg/eclipse-cg-*.mjs):
// ink silhouettes with a character-colour rim on the right and moonlight on the upper left,
// the eclipse as a black disc with a thin silver-violet corona, memory shards with warm edges.

export const PAL = {
  void: '#070614', void2: '#0c0b1b', panel: '#17132e', panel2: '#221c45',
  moon: '#e8ddff', oath: '#ffd091', memory: '#ffb38a', abyss: '#0e1a3a',
  lia: '#ff6b7c', liaDeep: '#c13b4c', mia: '#5ed7ff', miaOrange: '#ff9a3c',
  serena: '#b58cff', serenaWhite: '#efe9ff', silver: '#dfe6f5',
  wall: '#1c2c31', wallHi: '#2d4349', wallSh: '#111b20', wallLine: '#0a1215',
  brass: '#b88a4a', brassHi: '#ffd091', brassSh: '#5e4223', amber: '#ffb45e', emergency: '#ff3d55',
  frost: '#e9e1ff', frost2: '#bfaef0', frost3: '#8a78cf',
};

// deterministic PRNG (mulberry32)
export function rng(seed) {
  let a = seed >>> 0;
  const r = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.range = (lo, hi) => lo + (hi - lo) * r();
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  return r;
}

export function f(v, d = 1) {
  const s = (+v).toFixed(d);
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '').replace(/^-0$/, '0') : s.replace(/^-0$/, '0');
}
export const pts = (arr, d = 0) => arr.map(([x, y]) => `${f(x, d)},${f(y, d)}`).join(' ');

// Path DSL: [x, y] = smooth point (Catmull-Rom), [x, y, 1] = corner.
export function shape(points, closed = true, dp = 0) {
  const n = points.length;
  const F = (v) => f(v, dp);
  const P = (i) => points[(i + n) % n];
  const tan = (i) => {
    const c = P(i);
    if (c[2]) return [0, 0];
    if (!closed && (i === 0 || i === n - 1)) return [0, 0];
    const a = P(i - 1), b = P(i + 1);
    return [(b[0] - a[0]) / 6, (b[1] - a[1]) / 6];
  };
  let d = `M${F(points[0][0])},${F(points[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = P(i), b = P(i + 1), ta = tan(i), tb = tan(i + 1);
    if (!ta[0] && !ta[1] && !tb[0] && !tb[1]) d += `L${F(b[0])},${F(b[1])}`;
    else d += `C${F(a[0] + ta[0])},${F(a[1] + ta[1])} ${F(b[0] - tb[0])},${F(b[1] - tb[1])} ${F(b[0])},${F(b[1])}`;
  }
  return closed ? d + 'Z' : d;
}
export const mirrorX = (P, cx = 0) => P.map(([x, y, c]) => (c ? [2 * cx - x, y, 1] : [2 * cx - x, y]));
export const xf = (P, dx, dy, s = 1) => P.map(([x, y, c]) => (c ? [dx + x * s, dy + y * s, 1] : [dx + x * s, dy + y * s]));

const stopList = (stops) => stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`).join('');
export const radial = (id, stops, attrs = '') => `<radialGradient id="${id}" ${attrs}>${stopList(stops)}</radialGradient>`;
export const linear = (id, stops, attrs = 'x1="0" y1="0" x2="0" y2="1"') => `<linearGradient id="${id}" ${attrs}>${stopList(stops)}</linearGradient>`;

export function svgDoc(title, defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-label="${title}">\n<defs>${defs}</defs>\n${body}\n</svg>\n`;
}

// three blur filters (b1 small, b2 medium, b3 large); scenes may add one more (budget 4)
export function filters(p) {
  return `<filter id="${p}-b1" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>`
    + `<filter id="${p}-b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>`
    + `<filter id="${p}-b3" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="36"/></filter>`;
}

export function stars(R, n, x0, y0, x1, y1, color = PAL.moon, avoid = null) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = R.range(x0, x1), y = R.range(y0, y1);
    if (avoid && avoid(x, y)) continue;
    const r = R() < 0.88 ? R.range(0.6, 1.4) : R.range(1.6, 2.4);
    out += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(r)}" opacity="${f(R.range(0.25, 0.9), 2)}"/>`;
  }
  return `<g fill="${color}">${out}</g>`;
}

// Eclipse moon: black disc + thin silver-violet corona + diamond-ring bead (same recipe as prologue)
export function eclipse(p, cx, cy, r, opts = {}) {
  const { bead = -40, halo = 3.2, beadOp = 1, coronaOp = 0.9, id = 'corona', beadR = Math.min(r * 0.22, 26) } = opts;
  const defs = radial(`${p}-${id}`, [[0, '#000', 0], [0.30, '#b58cff', 0], [0.33, '#e8ddff', 0.95], [0.40, '#b58cff', 0.55], [0.6, '#6d4fc4', 0.18], [1, '#3a2a7a', 0]], 'r="0.5"');
  const a = bead * Math.PI / 180;
  const bx = cx + Math.cos(a) * r, by = cy + Math.sin(a) * r;
  const body = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * halo)}" fill="url(#${p}-${id})" opacity="${coronaOp}"/>`
    + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 1.04)}" fill="none" stroke="${PAL.serenaWhite}" stroke-width="${f(Math.max(1.5, r * 0.035))}" opacity=".9"/>`
    + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="#05040c"/>`
    + (beadOp ? `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(beadR)}" fill="#ffffff" opacity="${f(0.5 * beadOp, 2)}" filter="url(#${p}-b1)"/>`
      + `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(beadR * 0.27)}" fill="#ffffff" opacity="${beadOp}"/>` : '');
  return { defs, body };
}

// ---------------------------------------------------------------------------------------------
// Memory vignettes: tiny warm life-fragments (20x20 box) used inside shards, frost and snow.
// ---------------------------------------------------------------------------------------------
export function vignetteDefs(p, c = PAL.memory, c2 = PAL.oath) {
  return `<g id="${p}-v0"><circle cx="6" cy="6" r="2.4" fill="${c}"/><circle cx="13" cy="8" r="1.9" fill="${c}"/><path d="M3,18L6,9L9,18ZM10.5,18L13,10.5L15.5,18Z" fill="${c}"/><path d="M8,12L11,12" stroke="${c}" stroke-width="1"/></g>`
    + `<g id="${p}-v1"><path d="M3,18V10L10,4L17,10V18Z" fill="${c}"/><rect x="8" y="11" width="4" height="4" fill="${c2}"/></g>`
    + `<g id="${p}-v2"><path d="M10,18V9" stroke="${c}" stroke-width="1.6"/><circle cx="10" cy="7" r="5.5" fill="${c}"/><path d="M14,11L16,17M12.5,17L16.5,17" stroke="${c2}" stroke-width="1"/></g>`
    + `<g id="${p}-v3"><circle cx="7" cy="5" r="2.6" fill="${c}"/><path d="M3.5,18L7,8L10.5,18Z" fill="${c}"/><circle cx="14" cy="10" r="1.7" fill="${c2}"/><path d="M12,18L14,12L16,18Z" fill="${c2}"/></g>`
    + `<g id="${p}-v4"><circle cx="10" cy="5" r="2.5" fill="${c}"/><path d="M10,7L4,18L16,18Z" fill="${c}"/><path d="M10,3C3,5,2,14,4,18" fill="none" stroke="${c2}" stroke-width="1"/></g>`
    + `<g id="${p}-v5"><path d="M2,16C6,10,14,10,18,16" fill="none" stroke="${c}" stroke-width="1.6"/><circle cx="10" cy="6" r="3" fill="${c2}"/><path d="M4,18L16,18" stroke="${c}" stroke-width="1.4"/></g>`;
}
export function vignette(p, R, x, y, size, rot = 0, op = 0.9, k6 = null) {
  const k = size / 20;
  const idx = k6 == null ? Math.floor(R() * 6) : k6;
  return `<use href="#${p}-v${idx}" transform="translate(${f(x - 10 * k, 0)} ${f(y - 10 * k, 0)}) rotate(${f(rot, 0)} ${f(10 * k, 0)} ${f(10 * k, 0)}) scale(${f(k, 2)})"${op < 0.99 ? ` opacity="${f(op, 2)}"` : ''}/>`;
}

// translucent memory-shard scales: 5 reusable symbols (length 100 along +x, centred)
export function shardDefs(p, seed = 31) {
  const R = rng(seed);
  let d = linear(`${p}-shard`, [[0, '#f6f2ff', 0.62], [0.45, '#a9bdff', 0.18], [1, '#ffb38a', 0.42]], 'x1="0" y1="0" x2="1" y2="1"');
  for (let k = 0; k < 5; k++) {
    const w = 100 * R.range(0.32, 0.55);
    const P = [[-50, R.range(-6, 6)], [R.range(-25, 5), -w / 2], [50, R.range(-8, 8)], [R.range(0, 25), w / 2]];
    if (k > 2) P.splice(2, 0, [R.range(25, 40), -w * 0.35]);
    const dd = P.map(([x, y]) => `${f(x, 0)},${f(y, 0)}`).join('L');
    d += `<g id="${p}-sh${k}"><path d="M${dd}Z" fill="url(#${p}-shard)" stroke="${PAL.memory}" stroke-width="3" stroke-opacity=".75"/><path d="M${P.slice(0, 3).map(([x, y]) => `${f(x, 0)},${f(y, 0)}`).join('L')}" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity=".75"/></g>`;
  }
  return d;
}
export function shard(p, R, x, y, len, a, opts = {}) {
  const { vig = 0.3, op = 1, glow = false } = opts;
  let s = '';
  if (glow) s += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(len * 0.8, 0)}" fill="url(#${p}-warm)" opacity=".35"/>`;
  s += `<use href="#${p}-sh${Math.floor(R() * 5)}" transform="translate(${f(x, 0)} ${f(y, 0)}) rotate(${f(a, 0)}) scale(${f(len / 100, 2)})"${op < 1 ? ` opacity="${f(op, 2)}"` : ''}/>`;
  if (R() < vig && len > 14) s += vignette(p, R, x, y, len * 0.32, R.range(-15, 15), 0.9 * op);
  return s;
}
export const warmDef = (p) => radial(`${p}-warm`, [[0, '#fff1e2'], [0.2, '#ffd091', 0.85], [0.5, '#ffb38a', 0.35], [1, '#ff8a6a', 0]]);

// pseudo-glyph word fragments (no <text>): little stroke clusters
export function glyph(R, x, y, s) {
  let d = '';
  const n = 2 + Math.floor(R() * 3);
  for (let i = 0; i < n; i++) {
    const k = R();
    const ox = x + R.range(-0.5, 0.5) * s, oy = y + R.range(-0.5, 0.5) * s;
    if (k < 0.35) d += `M${f(ox, 0)},${f(oy, 0)}h${f(R.range(0.4, 0.9) * s, 0)}`;
    else if (k < 0.6) d += `M${f(ox, 0)},${f(oy, 0)}v${f(R.range(0.4, 0.9) * s, 0)}`;
    else if (k < 0.8) d += `M${f(ox, 0)},${f(oy, 0)}l${f(R.range(-0.5, 0.5) * s, 0)},${f(R.range(0.3, 0.7) * s, 0)}`;
    else d += `M${f(ox, 0)},${f(oy, 0)}q${f(s * 0.4, 0)},${f(-s * 0.3, 0)} ${f(s * 0.6, 0)},${f(s * 0.2, 0)}`;
  }
  return d;
}

// moth antenna: soft dusty bipectinate plume along a cubic curve
export function antenna(p, P0, C1, C2, P1, maxBarb, n, color, opts = {}) {
  const { width = 1.1, op = 0.55, shaft = 3, taper = 1 } = opts;
  const B = (t, i) => (1 - t) ** 3 * P0[i] + 3 * (1 - t) ** 2 * t * C1[i] + 3 * (1 - t) * t * t * C2[i] + t ** 3 * P1[i];
  const D = (t, i) => 3 * (1 - t) ** 2 * (C1[i] - P0[i]) + 6 * (1 - t) * t * (C2[i] - C1[i]) + 3 * t * t * (P1[i] - C2[i]);
  let barbs = '';
  const left = [], right = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const x = B(t, 0), y = B(t, 1), dx = D(t, 0), dy = D(t, 1);
    const L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, tx = dx / L, ty = dy / L;
    const env = taper ? Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.02)), 0.6) : 1;
    const b = maxBarb * env * (0.82 + 0.18 * Math.sin(i * 2.3));
    const lx = x + nx * b + tx * b * 0.8, ly = y + ny * b + ty * b * 0.8;
    const rx = x - nx * b + tx * b * 0.8, ry = y - ny * b + ty * b * 0.8;
    barbs += `M${f(lx, 0)},${f(ly, 0)}Q${f(x + nx * b * 0.2, 0)},${f(y + ny * b * 0.2, 0)} ${f(x, 0)},${f(y, 0)}Q${f(x - nx * b * 0.2, 0)},${f(y - ny * b * 0.2, 0)} ${f(rx, 0)},${f(ry, 0)}`;
    left.push([lx, ly]); right.push([rx, ry]);
  }
  const plume = `M${f(P0[0], 0)},${f(P0[1], 0)}L${left.map(([a, b]) => `${f(a, 0)},${f(b, 0)}`).join('L')}L${f(P1[0], 0)},${f(P1[1], 0)}L${right.reverse().map(([a, b]) => `${f(a, 0)},${f(b, 0)}`).join('L')}Z`;
  return `<path d="${plume}" fill="${color}" opacity="${f(op * 0.35, 2)}" filter="url(#${p}-b1)"/>`
    + `<path d="${barbs}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${op}"/>`
    + `<path d="M${f(P0[0])},${f(P0[1])}C${f(C1[0])},${f(C1[1])} ${f(C2[0])},${f(C2[1])} ${f(P1[0])},${f(P1[1])}" fill="none" stroke="${color}" stroke-width="${shaft}" stroke-linecap="round" opacity="${f(Math.min(1, op + 0.25), 2)}"/>`;
}
export function bezierAt(P0, C1, C2, P1, t) {
  const u = 1 - t;
  return [u ** 3 * P0[0] + 3 * u * u * t * C1[0] + 3 * u * t * t * C2[0] + t ** 3 * P1[0], u ** 3 * P0[1] + 3 * u * u * t * C1[1] + 3 * u * t * t * C2[1] + t ** 3 * P1[1]];
}

// ---------------------------------------------------------------------------------------------
// Silhouette figure with dual rim: character colour offset to the right, moonlight to the upper
// left, soft glow behind. `paths` = array of path d strings in local units; transform places it.
// ---------------------------------------------------------------------------------------------
export function silhouette(p, id, paths, x, y, s, opts = {}) {
  const { rim, rimW = 4, moonW = 2.5, glow = 0.45, ink = `url(#${p}-ink)`, moon = PAL.moon, moonOp = 0.7, flip = false, detail = '', topRim = null, topRimOp = 0.6, under = '' } = opts;
  const k = 1 / s;
  const defs = `<g id="${p}-${id}">${paths.map((d) => `<path d="${d}"/>`).join('')}</g>`;
  const body = `<g transform="translate(${f(x)} ${f(y)}) scale(${f(flip ? -s : s, 3)} ${f(s, 3)})">`
    + (glow ? `<use href="#${p}-${id}" fill="${rim}" opacity="${glow}" filter="url(#${p}-b2)"/>` : '')
    + under
    + `<use href="#${p}-${id}" fill="${rim}" transform="translate(${f(rimW * k)} ${f(-rimW * k * 0.4)})"/>`
    + (moonW ? `<use href="#${p}-${id}" fill="${moon}" opacity="${moonOp}" transform="translate(${f(-moonW * k)} ${f(-moonW * k * 0.6)})"/>` : '')
    + (topRim ? `<use href="#${p}-${id}" fill="${topRim}" opacity="${topRimOp}" transform="translate(0 ${f(-3 * k)})"/>` : '')
    + `<use href="#${p}-${id}" fill="${ink}"/>`
    + detail
    + `</g>`;
  return { defs, body };
}
export const inkDef = (p, top = '#1d1838', mid = '#0e0b1e', bot = '#08060f', y0 = -1000, y1 = 0) =>
  linear(`${p}-ink`, [[0, top], [0.55, mid], [1, bot]], `gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}"`);

// ---------------------------------------------------------------------------------------------
// Back-view party figures (local units: feet at y=0, ~1000 tall). Poses for the endings.
// ---------------------------------------------------------------------------------------------
const S = (P) => shape(P, true, 0);
export const BODY = {
  // Lia, from behind: high ponytail, pauldrons, cape, sword lowered in her right hand
  lia: () => [
    S([[-20, -868], [-62, -846], [-108, -824], [-104, -760], [-94, -700], [-68, -622], [-92, -540], [-102, -500], [-112, -420], [-124, -336], [-130, -278], [-146, -198], [-154, -110], [-158, -58], [-166, -22], [-178, 0, 1], [-120, 0, 1], [-122, -30], [-122, -64], [-104, -160], [-92, -232], [-82, -288], [-58, -362], [-28, -440], [-4, -486, 1],
      [4, -486, 1], [28, -430], [52, -350], [66, -284], [72, -220], [86, -140], [98, -64], [98, -24], [94, 0, 1], [150, 0, 1], [142, -26], [136, -60], [134, -122], [128, -202], [120, -282], [118, -342], [110, -432], [100, -512], [68, -622], [96, -700], [106, -760], [110, -824], [62, -846], [20, -868]]),
    S([[-22, -866], [-44, -880], [-54, -920], [-50, -964], [-28, -994], [0, -1003], [28, -994], [50, -964], [54, -920], [44, -880], [22, -866]]),
    S([[-10, -988], [8, -1030], [50, -1054], [92, -1040], [114, -994], [120, -920], [116, -842], [104, -772], [86, -712], [64, -650, 1], [72, -716], [70, -770, 1], [62, -716], [46, -676, 1], [56, -740], [62, -820], [58, -894], [44, -948], [22, -978]]),
    S([[86, -838, 1], [124, -848], [162, -826], [178, -790], [172, -760], [154, -746, 1], [100, -764, 1]]),
    S([[-86, -838, 1], [-124, -848], [-162, -826], [-178, -790], [-174, -764, 1], [-160, -770, 1], [-150, -748, 1], [-100, -764, 1]]),
    S([[-90, -826], [-40, -846], [40, -846], [90, -826], [86, -770], [74, -650], [58, -540], [44, -470, 1], [14, -490, 1], [-16, -452, 1], [-50, -476, 1], [-84, -440, 1], [-116, -468, 1], [-150, -432, 1], [-140, -520], [-130, -640], [-120, -740], [-110, -808]]),
    S([[-136, -312, 1], [-80, -306, 1], [-86, -270], [-96, -230, 1], [-148, -230, 1], [-144, -270]]),
    S([[72, -306, 1], [124, -312, 1], [126, -272], [130, -232, 1], [76, -232, 1], [70, -270]]),
  ],
  mia: () => [
    S([[-34, -784, 1], [-46, -798, 1], [-54, -776, 1], [-60, -806], [-66, -846], [-58, -884], [-32, -906], [0, -912], [32, -906], [58, -884], [66, -846], [60, -806], [54, -776, 1], [46, -798, 1], [34, -784, 1], [22, -770, 1], [12, -790, 1], [0, -772, 1], [-12, -790, 1], [-22, -770, 1]]),
    S([[-58, -860, 1], [-80, -960, 1], [-66, -968, 1], [-18, -904, 1]]),
    S([[58, -860, 1], [80, -960, 1], [66, -968, 1], [18, -904, 1]]),
    S([[-16, -790, 1], [16, -790, 1], [18, -756, 1], [-18, -756, 1]]),
    S([[-24, -778, 1], [-72, -768], [-120, -746], [-144, -716], [-156, -650], [-162, -560], [-166, -480], [-168, -440, 1], [-124, -434, 1], [-124, -470], [-112, -452], [-104, -420, 1], [104, -420, 1], [114, -470], [124, -560], [128, -640], [126, -700], [118, -746], [72, -768], [24, -778, 1]]),
    S([[-92, -430, 1], [92, -430, 1], [94, -386, 1], [8, -382, 1], [0, -396, 1], [-8, -382, 1], [-94, -386, 1]]),
    S([[-84, -392, 1], [-82, -330], [-72, -272], [-70, -244], [-78, -196], [-72, -150], [-88, -132, 1], [-98, -64], [-108, -12, 1], [-104, 4, 1], [-36, 4, 1], [-38, -24], [-42, -80], [-44, -132, 1], [-40, -170], [-36, -232], [-38, -262], [-26, -330], [-12, -392, 1]]),
    S([[84, -392, 1], [84, -330], [76, -272], [72, -244], [80, -196], [76, -150], [92, -132, 1], [100, -64], [110, -12, 1], [106, 4, 1], [38, 4, 1], [40, -24], [44, -80], [46, -132, 1], [42, -170], [38, -232], [40, -262], [28, -330], [12, -392, 1]]),
  ],
  serena: () => [
    S([[-40, -850], [-80, -836], [-104, -812], [-104, -760], [-96, -680], [-76, -620], [-92, -500], [-112, -360], [-134, -220], [-160, -90], [-196, -10, 1], [-228, 0, 1], [190, 0, 1], [168, -40], [150, -140], [130, -260], [110, -380], [92, -500], [76, -620], [96, -680], [104, -760], [104, -812], [80, -836], [40, -850]]),
    S([[-100, -800], [-126, -740], [-146, -640], [-164, -540], [-176, -476, 1], [-120, -470, 1], [-108, -560], [-100, -660]]),
    S([[100, -800], [126, -740], [146, -640], [164, -540], [176, -476, 1], [120, -470, 1], [108, -560], [100, -660]]),
    S([[-52, -930], [-48, -966], [-26, -990], [0, -996], [26, -990], [48, -966], [52, -930], [58, -880], [68, -838], [90, -800], [98, -730], [100, -640], [98, -540], [94, -470], [88, -436, 1], [74, -448], [56, -418, 1], [38, -440], [16, -410, 1], [-4, -436], [-26, -414, 1], [-46, -440], [-66, -420, 1], [-80, -444], [-90, -436, 1], [-96, -470], [-98, -540], [-100, -640], [-98, -730], [-90, -800], [-68, -838], [-58, -880]]),
  ],
  player: () => [
    S([[-120, -800], [-150, -760], [-164, -660], [-176, -520], [-192, -360], [-210, -200], [-226, -90, 1], [-200, -104, 1], [-184, -76, 1], [-150, -98, 1], [-112, -66, 1], [-70, -92, 1], [-30, -62, 1], [10, -90, 1], [52, -64, 1], [96, -96, 1], [136, -70, 1], [176, -100, 1], [204, -80, 1], [230, -110, 1], [214, -220], [196, -380], [180, -540], [168, -680], [156, -770], [124, -806]]),
    S([[-56, -880], [-104, -856], [-148, -820], [-166, -770], [-160, -724], [-120, -730], [-80, -712], [-40, -722], [0, -708], [40, -722], [80, -712], [120, -730], [162, -724], [168, -770], [150, -820], [106, -856], [56, -880]]),
    S([[-60, -870], [-64, -930], [-52, -984], [-20, -1010], [16, -1016, 1], [46, -994], [62, -946], [64, -890], [56, -860]]),
    S([[-84, -96, 1], [-38, -96, 1], [-34, 0, 1], [-100, 4, 1]]), S([[40, -96, 1], [86, -96, 1], [100, 4, 1], [34, 0, 1]]),
  ],
};
// raised arm (reaching up and inward) — appended to a body; side = -1 left / 1 right
export function raisedArm(side, sx, sy, hx, hy, w = 34) {
  const dx = hx - sx, dy = hy - sy, L = Math.hypot(dx, dy), nx = -dy / L * w, ny = dx / L * w;
  const ex = sx + dx * 0.5 + side * 22, ey = sy + dy * 0.5;
  return S([[sx + nx, sy + ny], [ex + nx * 0.8, ey + ny * 0.8], [hx + nx * 0.6, hy + ny * 0.6], [hx + dx / L * 26, hy + dy / L * 26], [hx - nx * 0.6, hy - ny * 0.6], [ex - nx * 0.8, ey - ny * 0.8], [sx - nx, sy - ny]]);
}

// sample a Catmull-Rom spline through pts (open) -> n+1 points with tangents
export function spline(P, n = 60) {
  const out = [];
  const m = P.length - 1;
  for (let i = 0; i <= n; i++) {
    const u = i / n * m, k = Math.min(m - 1, Math.floor(u)), t = u - k;
    const p0 = P[Math.max(0, k - 1)], p1 = P[k], p2 = P[k + 1], p3 = P[Math.min(m, k + 2)];
    const c = (a, b, c2, d) => 0.5 * ((2 * b) + (-a + c2) * t + (2 * a - 5 * b + 4 * c2 - d) * t * t + (-a + 3 * b - 3 * c2 + d) * t * t * t);
    const dc = (a, b, c2, d) => 0.5 * ((-a + c2) + 2 * (2 * a - 5 * b + 4 * c2 - d) * t + 3 * (-a + 3 * b - 3 * c2 + d) * t * t);
    const x = c(p0[0], p1[0], p2[0], p3[0]), y = c(p0[1], p1[1], p2[1], p3[1]);
    const dx = dc(p0[0], p1[0], p2[0], p3[0]), dy = dc(p0[1], p1[1], p2[1], p3[1]), l = Math.hypot(dx, dy) || 1;
    out.push({ x, y, tx: dx / l, ty: dy / l, nx: -dy / l, ny: dx / l, t: i / n });
  }
  return out;
}
// ribbon polygon along a sampled spline with width w(t); returns { d, left, right }
export function ribbon(S, w) {
  const left = S.map((q) => [q.x + q.nx * w(q.t) / 2, q.y + q.ny * w(q.t) / 2]);
  const right = S.map((q) => [q.x - q.nx * w(q.t) / 2, q.y - q.ny * w(q.t) / 2]);
  const d = `M${left.map(([x, y]) => `${f(x, 0)},${f(y, 0)}`).join('L')}L${right.reverse().map(([x, y]) => `${f(x, 0)},${f(y, 0)}`).join('L')}Z`;
  right.reverse();
  return { d, left, right };
}
export const polyline = (P, d = 0) => `M${P.map(([x, y]) => `${f(x, d)},${f(y, d)}`).join('L')}`;
