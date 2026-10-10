// Shared helpers for the story-mode art (tools/art/story/build.mjs).
// Zero dependencies, deterministic (seeded PRNG). Everything returns SVG markup strings.
// Light convention (docs/ART-DIRECTION.md): key light from the upper left, coloured rim on the far side.
import { rng, f, P, poly, line, shape, linear, radial, mix, stops } from '../stage/lib.mjs';

export { rng, f, P, poly, line, shape, linear, radial, mix, stops };

export const W = 1600, H = 900;

// smooth 1-D value noise in [-1, 1]
export function noise1(seed, period = 100) {
  const R = rng(seed);
  const vals = Array.from({ length: 256 }, () => R() * 2 - 1);
  return (x) => {
    const t = x / period, i = Math.floor(t), u = t - i;
    const a = vals[((i % 256) + 256) % 256], b = vals[(((i + 1) % 256) + 256) % 256];
    return a + (b - a) * u * u * (3 - 2 * u);
  };
}
// fractal sum of noise1 octaves, roughly in [-1, 1]
export function fbm(seed, period = 200, oct = 4, gain = 0.5) {
  const ns = Array.from({ length: oct }, (_, k) => noise1(seed + k * 101, period / 2 ** k));
  let norm = 0;
  for (let k = 0; k < oct; k++) norm += gain ** k;
  return (x) => ns.reduce((acc, n, k) => acc + n(x) * gain ** k, 0) / norm;
}

const r0 = (v) => f(v, 0);

// Scene accumulator: prefixed ids, auto-named gradients, a fixed filter budget (≤ 4).
export class Scene {
  constructor(p, label, seed, w = W, h = H) {
    this.p = p; this.label = label; this.R = rng(seed); this.w = w; this.h = h;
    this.defs = []; this.body = []; this.k = 0; this.filters = new Set();
  }
  id(name) { return `${this.p}-${name}`; }
  uid(base = 'g') { return this.id(`${base}${this.k++}`); }
  def(s) { this.defs.push(s); return this; }
  add(...s) { this.body.push(...s.filter(Boolean)); return this; }
  lin(list, attrs = 'x1="0" y1="0" x2="0" y2="1"') { const id = this.uid(); this.defs.push(linear(id, list, attrs)); return `url(#${id})`; }
  rad(list, attrs = '') { const id = this.uid(); this.defs.push(radial(id, list, attrs)); return `url(#${id})`; }
  // three shared blur strengths; only the ones actually used are emitted
  blur(level = 1) {
    const sd = { 1: 2.5, 2: 9, 3: 28, 4: 60 }[level];
    const id = this.id(`b${level}`);
    if (!this.filters.has(level)) {
      this.filters.add(level);
      const pad = level >= 3 ? 80 : 50;
      this.defs.push(`<filter id="${id}" x="-${pad}%" y="-${pad}%" width="${100 + 2 * pad}%" height="${100 + 2 * pad}%"><feGaussianBlur stdDeviation="${sd}"/></filter>`);
    }
    return `url(#${id})`;
  }
  clip(d) { const id = this.uid('c'); this.defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`); return `url(#${id})`; }
  out() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" role="img" aria-label="${this.label}">\n<defs>${this.defs.join('')}</defs>\n${this.body.join('\n')}\n</svg>\n`;
  }
}

// ---------------------------------------------------------------------------------------------
// Generic painters
// ---------------------------------------------------------------------------------------------

// Path from a list of [x,y] using rounded integers
export const pl = (pts) => 'M' + pts.map(([x, y]) => `${r0(x)},${r0(y)}`).join('L');
export const pz = (pts) => pl(pts) + 'Z';

// stars in a box, avoiding an optional ellipse
export function stars(R, n, box, { maxR = 1.6, fill = '#e8ddff', avoid = null, op = [0.25, 0.95] } = {}) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = R.range(box[0], box[2]), y = R.range(box[1], box[3]);
    if (avoid && Math.hypot((x - avoid[0]) / avoid[2], (y - avoid[1]) / avoid[3]) < 1) continue;
    const big = R() < 0.07;
    s += `<circle cx="${r0(x)}" cy="${r0(y)}" r="${f(big ? R.range(1.6, 2.4) : R.range(0.5, maxR))}" opacity="${f(R.range(op[0], op[1]), 2)}"/>`;
  }
  return `<g fill="${fill}">${s}</g>`;
}

// Cumulus-style cloud with cel shading: shadow body, lit cap with a scalloped lower edge, bright rim on the lit side.
// light = -1 (key light from the left) or 1
export function cloud(R, x, y, w, h, c, { bumps = 6, light = -1, rim = true, flat = 0.12, capY = 0.14 } = {}) {
  const top = [];
  for (let i = 0; i <= bumps; i++) {
    const t = i / bumps;
    const env = Math.pow(Math.sin(Math.PI * (0.06 + 0.88 * t)), 0.7);
    top.push([x + w * t + (i && i < bumps ? R.range(-w / bumps * 0.18, w / bumps * 0.18) : 0), y - h * env * R.range(0.78, 1)]);
  }
  top[0][1] = y - h * 0.05; top[bumps][1] = y - h * 0.05;
  const arcs = (pts, sweep = 1, k = 0.56) => {
    let d = '';
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      const rr = Math.hypot(bx - ax, by - ay) * k * R.range(0.95, 1.15);
      d += `A${r0(rr)},${r0(rr)} 0 0 ${sweep} ${r0(bx)},${r0(by)}`;
    }
    return d;
  };
  const yb = y + h * flat;
  const body = `M${r0(top[0][0])},${r0(top[0][1])}${arcs(top)}Q${r0(x + w * 1.02)},${r0(yb)} ${r0(x + w * 0.8)},${r0(yb)}L${r0(x + w * 0.2)},${r0(yb)}Q${r0(x - w * 0.02)},${r0(yb)} ${r0(top[0][0])},${r0(top[0][1])}Z`;
  // lit cap: same top, lower edge scalloped at ~55% of height
  const ym = y - h * capY;
  const low = [];
  const nb = Math.max(2, bumps - 2);
  for (let i = nb; i >= 0; i--) low.push([x + w * (0.04 + 0.92 * i / nb), ym + R.range(-h * 0.08, h * 0.12)]);
  const cap = `M${r0(top[0][0])},${r0(top[0][1])}${arcs(top)}L${r0(low[0][0])},${r0(low[0][1])}${arcs(low, 1, 0.6)}Z`;
  let s = `<path d="${body}" fill="${c.shade}"/>`;
  s += `<path d="${cap}" fill="${c.lit}"${light > 0 ? ` transform="translate(${r0(w * 0.03)} 0)"` : ''}/>`;
  if (rim && c.rim) {
    const half = light < 0 ? top.slice(0, Math.ceil(bumps / 2) + 1) : top.slice(Math.floor(bumps / 2));
    s += `<path d="M${r0(half[0][0])},${r0(half[0][1])}${arcs(half)}" fill="none" stroke="${c.rim}" stroke-width="${f(Math.max(1.5, h * 0.05))}" stroke-linecap="round" opacity=".9"/>`;
  }
  return s;
}

// Long flat stratus band (soft-edged, uses blur level 2 if provided)
export function band(x0, x1, y, th, R, amp = 10) {
  const n = 8, top = [], bot = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + (x1 - x0) * i / n;
    const taper = Math.sin(Math.PI * i / n);
    top.push([x, y - th * taper * R.range(0.6, 1) - R.range(0, amp)]);
    bot.unshift([x, y + th * 0.35 * taper]);
  }
  return shape([...top, ...bot], true, 0);
}

// Mountain / ridge layer with cel shading (shadow faces on the right flank of each peak) and a lit rim.
export function ridge(S, o) {
  const { x0 = -20, x1 = S.w + 20, base, amp, period = 260, seed = 1, step = 8, bottom = S.h, ridged = false, fill, shade = null, shadeOp = 0.45, rim = null, rimW = 2, rimOp = 0.6, peaks = null } = o;
  const n = fbm(seed, period, 5);
  const pts = [];
  for (let x = x0; x <= x1 + 0.1; x += step) {
    let v = n(x);
    if (ridged) v = 1 - Math.abs(v) * 2.2;
    let y = base - amp * v;
    if (peaks) for (const [px, ph, pw] of peaks) y -= ph * Math.max(0, 1 - Math.abs(x - px) / pw) ** 1.5;
    pts.push([x, y]);
  }
  let s = `<path d="${pz([...pts, [x1, bottom], [x0, bottom]])}" fill="${fill}"/>`;
  if (shade) {
    let sh = '';
    for (let i = 1; i < pts.length - 1; i++) {
      if (!(pts[i][1] < pts[i - 1][1] && pts[i][1] <= pts[i + 1][1])) continue;
      let j = i + 1;
      while (j < pts.length - 1 && pts[j + 1][1] >= pts[j][1]) j++;
      if (pts[j][1] - pts[i][1] < amp * 0.12) continue;
      const pk = pts[i], dep = Math.min(bottom, pk[1] + (pts[j][1] - pk[1]) * 2.6 + 30);
      const crease = [[pk[0] + (pts[j][0] - pk[0]) * 0.25, (pk[1] + dep) / 2], [pk[0] + (pts[j][0] - pk[0]) * 0.1, dep]];
      sh += pz([...pts.slice(i, j + 1), [pts[j][0] + (pts[j][0] - pk[0]) * 0.15, Math.min(dep, pts[j][1] + (dep - pts[j][1]) * 0.6)], crease[1], crease[0]]);
    }
    if (sh) s += `<path d="${sh}" fill="${shade}" opacity="${shadeOp}"/>`;
  }
  if (rim) {
    let rd = '';
    for (let i = 1; i < pts.length; i++) {
      const up = pts[i][1] < pts[i - 1][1] - 0.4;
      if (up) rd += `M${r0(pts[i - 1][0])},${r0(pts[i - 1][1])}L${r0(pts[i][0])},${r0(pts[i][1])}`;
    }
    s += `<path d="${rd}" fill="none" stroke="${rim}" stroke-width="${rimW}" stroke-linecap="round" opacity="${rimOp}"/>`;
  }
  return { svg: s, pts, yAt: (x) => { const i = Math.max(0, Math.min(pts.length - 1, Math.round((x - x0) / step))); return pts[i][1]; } };
}

// Light shafts (god rays) fanning from a point
export function rays(cx, cy, list, color, op = 0.18) {
  let d = '';
  for (const [a, spread, len] of list) {
    const a0 = (a - spread / 2) * Math.PI / 180, a1 = (a + spread / 2) * Math.PI / 180;
    d += `M${r0(cx)},${r0(cy)}L${r0(cx + Math.cos(a0) * len)},${r0(cy + Math.sin(a0) * len)}L${r0(cx + Math.cos(a1) * len)},${r0(cy + Math.sin(a1) * len)}Z`;
  }
  return `<path d="${d}" fill="${color}" opacity="${op}"/>`;
}

// Smoke column: soft wobbling ribbon rising and drifting
export function smoke(R, x, y, h, w, drift = 60, seed = 1) {
  const n = noise1(seed, h / 3);
  const L = [], Rr = [];
  const N = 10;
  for (let i = 0; i <= N; i++) {
    const t = i / N, yy = y - h * t;
    const cx = x + drift * t * t + n(i * 40) * w * 0.6;
    const ww = w * (0.25 + t * 1.3);
    L.push([cx - ww / 2, yy]); Rr.unshift([cx + ww / 2, yy]);
  }
  return shape([...L, ...Rr], true, 0);
}

// Seven-pointed star (圣教七角晨星). rot = 0 points up; 180 = inverted.
export function star7(cx, cy, r, inner = 0.46, rot = 0) {
  const pts = [];
  for (let i = 0; i < 14; i++) {
    const a = (rot - 90 + i * 180 / 7) * Math.PI / 180;
    const rr = i % 2 ? r * inner : r;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return 'M' + pts.map(([x, y]) => `${f(x)},${f(y)}`).join('L') + 'Z';
}

// ---------------------------------------------------------------------------------------------
// Architecture
// ---------------------------------------------------------------------------------------------

// Wooden cottage in an oblique 3/4 view. (x, y) = bottom-left of the gable-end wall.
// side 'r': side wall visible on the right (in shade); 'l': side wall on the left (lit).
// pal: { lit, mid, shade, roof, roofShade, trim, win, winLit? }
export function house(x, y, w, h, o = {}) {
  const { side = 'r', d = w * 0.9, roofH = w * 0.55, pal, planks = false, windows = 1, door = true, chimney = false, lit = false, stroke = null } = o;
  const k = side === 'r' ? 1 : -1;
  const dx = d * k, dy = -d * 0.32;
  const ov = w * 0.1;
  const s = [];
  const ftL = [x, y - h], ftR = [x + w, y - h], apex = [x + w / 2, y - h - roofH];
  const sideEdge = side === 'r' ? x + w : x;
  const eaveY = y - h + roofH * 0.18;
  const eave = side === 'r' ? [x + w + ov, eaveY] : [x - ov, eaveY];
  // side wall, roof plane over it, gable-end wall
  s.push(`<path d="${pz([[sideEdge, y], [sideEdge, y - h], [sideEdge + dx, y - h + dy], [sideEdge + dx, y + dy]])}" fill="${side === 'r' ? pal.shade : pal.lit}"/>`);
  s.push(`<path d="${pz([apex, [apex[0] + dx, apex[1] + dy], [eave[0] + dx, eave[1] + dy], eave])}" fill="${side === 'r' ? pal.roofShade : pal.roof}"/>`);
  s.push(`<path d="${pz([[x, y], ftL, apex, ftR, [x + w, y]])}" fill="${side === 'r' ? pal.lit : pal.mid}"/>`);
  if (w < 24) return { svg: s.join(''), apex, chimneyTop: null }; // distant: silhouette planes only
  // fine lines: roof tile rows + wall planks
  let fine = '';
  if (w > 54) for (let t = 1 / Math.max(3, Math.round(w / 24)); t < 0.98; t += 1 / Math.max(3, Math.round(w / 24))) {
    const a = [apex[0] + (eave[0] - apex[0]) * t, apex[1] + (eave[1] - apex[1]) * t];
    fine += `M${r0(a[0])},${r0(a[1])}l${r0(dx)},${r0(dy)}`;
  }
  if (planks && w > 30) for (let yy = y - h * 0.2; yy > y - h; yy -= Math.max(5, h * 0.14)) fine += `M${r0(x + 1)},${r0(yy)}H${r0(x + w - 1)}`;
  if (fine) s.push(`<path d="${fine}" stroke="#000" stroke-opacity=".16" stroke-width="${f(Math.max(0.8, w * 0.016))}"/>`);
  // trim: ridge + gable eave boards
  s.push(`<path d="${pl([[x - ov, eaveY], apex, [x + w + ov, eaveY]])}M${r0(apex[0])},${r0(apex[1])}l${r0(dx)},${r0(dy)}" fill="none" stroke="${pal.trim}" stroke-width="${f(Math.max(1.3, w * 0.05))}" stroke-linejoin="round" stroke-linecap="round"/>`);
  // openings (door + windows + side-wall windows) in one path
  let op = '';
  if (door) op += `M${r0(x + w * 0.38)},${r0(y)}v${r0(-h * 0.62)}h${r0(w * 0.24)}v${r0(h * 0.62)}z`;
  if (windows) {
    const ww = w * 0.16, wh = h * 0.28, wy = y - h * 0.68;
    for (const wx of door ? [x + w * 0.1, x + w * 0.74] : [x + w * 0.42]) op += `M${r0(wx)},${r0(wy)}h${r0(ww)}v${r0(wh)}h${r0(-ww)}z`;
    if (w > 34) for (let t = 0.3; t < 0.9; t += 0.4) {
      const a = [sideEdge + dx * t, y - h * 0.68 + dy * t];
      op += `M${r0(a[0])},${r0(a[1])}l${r0(dx * 0.16)},${r0(dy * 0.16)}v${r0(h * 0.28)}l${r0(-dx * 0.16)},${r0(-dy * 0.16)}z`;
    }
  }
  if (op) s.push(`<path d="${op}" fill="${lit ? pal.winLit : pal.win}"/>`);
  let chimneyTop = null;
  if (chimney) {
    const cx = apex[0] + dx * 0.62 + (side === 'r' ? w * 0.12 : -w * 0.12), cy = apex[1] + dy * 0.62 + roofH * 0.25;
    s.push(`<path d="M${r0(cx - w * 0.06)},${r0(cy)}v${r0(-roofH * 0.55)}h${r0(w * 0.12)}v${r0(roofH * 0.55)}z" fill="${pal.chimney || pal.mid}"/>`);
    chimneyTop = [cx, cy - roofH * 0.55];
  }
  if (o.rim) {
    // key light catches the left roof edge (and the lit side-wall corner)
    let rd = pl([[x - ov, eaveY], apex]);
    if (side === 'l' && !o.noCornerRim) rd += pl([[x + dx, y + dy], [x + dx, y - h + dy]]);
    s.push(`<path d="${rd}" stroke="${o.rim}" stroke-width="${f(Math.max(1, w * 0.032))}" stroke-linecap="round" opacity=".85"/>`);
  }
  if (stroke) s.push(`<path d="${pz([[x, y], ftL, apex, ftR, [x + w, y]])}" fill="none" stroke="${stroke}" stroke-width="1" opacity=".5"/>`);
  return { svg: s.join(''), apex, chimneyTop };
}

// Charred house skeleton (posts + broken rafters) for ruins/burning scenes
export function skeleton(R, x, y, w, h, col, sw = 4) {
  let d = '';
  const posts = [0, 0.33, 0.7, 1];
  for (const t of posts) {
    const hh = h * R.range(0.45, 1);
    d += `M${r0(x + w * t)},${r0(y)}L${r0(x + w * t + R.range(-4, 4))},${r0(y - hh)}`;
  }
  // a leaning rafter or two
  const ax = x + w * R.range(0.2, 0.5), ay = y - h * R.range(0.8, 1.15);
  d += `M${r0(x - w * 0.05)},${r0(y - h * 0.85)}L${r0(ax)},${r0(ay)}L${r0(ax + w * 0.25)},${r0(ay + h * 0.25)}`;
  if (R() < 0.6) d += `M${r0(x + w * 0.65)},${r0(y - h * 0.9)}L${r0(x + w * 1.08)},${r0(y - h * 0.55)}`;
  return `<path d="${d}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>`;
}

// Bell tower with open belfry; returns svg + belfry centre.
export function bellTower(x, y, w, h, pal, { broken = 0, side = 'r', star = true, bell = true } = {}) {
  const s = [];
  const d = w * 0.45, k = side === 'r' ? 1 : -1, dx = d * k, dy = -d * 0.3;
  const top = y - h;
  const sideX = side === 'r' ? x + w : x;
  // shaft
  s.push(`<path d="${pz([[sideX, y], [sideX, top], [sideX + dx, top + dy], [sideX + dx, y + dy]])}" fill="${pal.shade}"/>`);
  s.push(`<rect x="${r0(x)}" y="${r0(top)}" width="${r0(w)}" height="${r0(h)}" fill="${pal.lit}"/>`);
  // stone courses
  let c = '';
  for (let yy = y - h * 0.1; yy > top + h * 0.3; yy -= h * 0.09) c += `M${r0(x)},${r0(yy)}H${r0(x + w)}`;
  s.push(`<path d="${c}" stroke="#000" stroke-opacity=".12" stroke-width="${f(Math.max(1, w * 0.025))}"/>`);
  // narrow window slits
  s.push(`<rect x="${r0(x + w * 0.44)}" y="${r0(y - h * 0.55)}" width="${f(w * 0.12)}" height="${f(h * 0.12)}" rx="${f(w * 0.06)}" fill="${pal.win}"/>`);
  // belfry opening (arched), bell inside
  const bx = x + w * 0.2, bw = w * 0.6, by = top + h * 0.08, bh = h * 0.2;
  s.push(`<path d="M${r0(bx)},${r0(by + bh)}V${r0(by + bw / 2)}A${f(bw / 2)},${f(bw / 2)} 0 0 1 ${r0(bx + bw)},${r0(by + bw / 2)}V${r0(by + bh)}Z" fill="${pal.hole}"/>`);
  if (bell) s.push(`<path d="M${r0(x + w / 2 - bw * 0.26)},${r0(by + bh * 0.95)}Q${r0(x + w / 2 - bw * 0.24)},${r0(by + bh * 0.38)} ${r0(x + w / 2)},${r0(by + bh * 0.36)}Q${r0(x + w / 2 + bw * 0.24)},${r0(by + bh * 0.38)} ${r0(x + w / 2 + bw * 0.26)},${r0(by + bh * 0.95)}Z" fill="${pal.bell}"/>`);
  // cornice
  s.push(`<rect x="${r0(x - w * 0.08)}" y="${r0(top - w * 0.02)}" width="${f(w * 1.16)}" height="${f(w * 0.1)}" fill="${pal.trim}"/>`);
  let apex = [x + w / 2 + dx * 0.5, top - w * 1.25 + dy * 0.5];
  if (!broken) {
    // pyramid roof: two visible faces
    const L = [x - w * 0.08, top], Rr = [x + w * 1.08, top], B = [sideX + dx + k * w * 0.08, top + dy];
    s.push(`<path d="${pz([L, apex, Rr])}" fill="${pal.roof}"/>`);
    s.push(`<path d="${pz(side === 'r' ? [Rr, apex, B] : [L, apex, B])}" fill="${pal.roofShade}"/>`);
    if (star) {
      s.push(`<path d="M${r0(apex[0])},${r0(apex[1])}v${r0(-w * 0.35)}" stroke="${pal.trim}" stroke-width="${f(Math.max(1.2, w * 0.05))}"/>`);
      s.push(`<path d="${star7(apex[0], apex[1] - w * 0.5, w * 0.22)}" fill="${pal.star || pal.trim}"/>`);
    }
  }
  return { svg: s.join(''), belfry: [x + w / 2, by + bh * 0.6], apex };
}

// Windmill: tapered tower + cap + four lattice sails. a = sail rotation (deg)
export function windmill(x, y, s, a, pal) {
  const out = [];
  const tw = 46 * s, th = 150 * s, tt = 26 * s;
  out.push(`<path d="${pz([[x - tw / 2, y], [x - tt / 2, y - th], [x + tt / 2, y - th], [x + tw / 2, y]])}" fill="${pal.lit}"/>`);
  out.push(`<path d="${pz([[x + tw * 0.08, y], [x + tt * 0.1, y - th], [x + tt / 2, y - th], [x + tw / 2, y]])}" fill="${pal.shade}"/>`);
  out.push(`<rect x="${r0(x - 7 * s)}" y="${r0(y - 30 * s)}" width="${f(14 * s)}" height="${f(30 * s)}" fill="${pal.door}"/>`);
  out.push(`<path d="M${r0(x - tt * 0.75)},${r0(y - th)}Q${r0(x)},${r0(y - th - 34 * s)} ${r0(x + tt * 0.75)},${r0(y - th)}Z" fill="${pal.roof}"/>`);
  const hx = x - 4 * s, hy = y - th - 8 * s;
  let sails = '', lattice = '';
  for (let i = 0; i < 4; i++) {
    const ang = (a + i * 90) * Math.PI / 180;
    const ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux;
    const L = 118 * s, w0 = 4 * s, w1 = 20 * s;
    const p0 = [hx + ux * 16 * s, hy + uy * 16 * s], p1 = [hx + ux * L, hy + uy * L];
    sails += `M${r0(hx)},${r0(hy)}L${r0(p1[0])},${r0(p1[1])}`;
    const q = [[p0[0] + vx * w0, p0[1] + vy * w0], [p1[0] + vx * w0, p1[1] + vy * w0], [p1[0] + vx * w1, p1[1] + vy * w1], [p0[0] + vx * w1 * 0.7, p0[1] + vy * w1 * 0.7]];
    lattice += pz(q);
    for (let t = 0.25; t < 1; t += 0.18) {
      const a1 = [p0[0] + (p1[0] - p0[0]) * t + vx * w0, p0[1] + (p1[1] - p0[1]) * t + vy * w0];
      lattice += `M${r0(a1[0])},${r0(a1[1])}l${r0(vx * (w1 - w0))},${r0(vy * (w1 - w0))}`;
    }
  }
  out.push(`<path d="${lattice}" fill="${pal.sail}" fill-opacity=".85" stroke="${pal.frame}" stroke-width="${f(Math.max(1, 1.6 * s))}"/>`);
  out.push(`<path d="${sails}" stroke="${pal.frame}" stroke-width="${f(Math.max(1.4, 4 * s))}" stroke-linecap="round"/>`);
  out.push(`<circle cx="${r0(hx)}" cy="${r0(hy)}" r="${f(6 * s)}" fill="${pal.frame}"/>`);
  return out.join('');
}

// Water wheel seen slightly from the side (ellipse) with paddles
export function waterWheel(x, y, r, pal, a = 0) {
  const s = [];
  s.push(`<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${f(r * 0.42)}" ry="${f(r)}" fill="none" stroke="${pal.frame}" stroke-width="${f(r * 0.12)}"/>`);
  let sp = '';
  for (let i = 0; i < 8; i++) {
    const ang = (a + i * 45) * Math.PI / 180;
    sp += `M${r0(x)},${r0(y)}L${r0(x + Math.cos(ang) * r * 0.42)},${r0(y + Math.sin(ang) * r)}`;
    const px = x + Math.cos(ang) * r * 0.46, py = y + Math.sin(ang) * r * 1.06;
    sp += `M${r0(px - r * 0.12)},${r0(py)}h${r0(r * 0.24)}`;
  }
  s.push(`<path d="${sp}" stroke="${pal.frame}" stroke-width="${f(r * 0.07)}" stroke-linecap="round"/>`);
  s.push(`<circle cx="${r0(x)}" cy="${r0(y)}" r="${f(r * 0.1)}" fill="${pal.hub}"/>`);
  return s.join('');
}

// Sheep: scalloped wool body with a shaded belly, dark face with ears, thin legs. dir = 1 faces right
export function sheep(x, y, s, pal, dir = 1) {
  const out = [];
  const cx = x, cy = y - 14 * s, rx = 19 * s, ry = 11 * s;
  let legs = '';
  for (const lx of [-12, -5, 5, 12]) legs += `M${r0(cx + lx * s)},${r0(cy + ry * 0.5)}V${r0(y)}`;
  out.push(`<path d="${legs}" stroke="${pal.dark}" stroke-width="${f(Math.max(1, 2.6 * s))}" stroke-linecap="round"/>`);
  const ring = (k, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]; });
  const arcs = (pts, sw = 1) => pts.slice(1).map((p, i) => { const q = pts[i], rr = Math.hypot(p[0] - q[0], p[1] - q[1]) * 0.62; return `A${f(rr)},${f(rr)} 0 0 ${sw} ${r0(p[0])},${r0(p[1])}`; }).join('');
  const body = ring(1, 0, Math.PI * 2, 11);
  out.push(`<path d="M${r0(body[0][0])},${r0(body[0][1])}${arcs(body)}Z" fill="${pal.wool}"/>`);
  const belly = ring(1, 0.12 * Math.PI, 0.88 * Math.PI, 5);
  const inner = ring(0.45, 0.88 * Math.PI, 0.12 * Math.PI, 3).map(([px, py]) => [px, py + ry * 0.25]);
  out.push(`<path d="M${r0(belly[0][0])},${r0(belly[0][1])}${arcs(belly)}L${r0(inner[0][0])},${r0(inner[0][1])}${arcs(inner, 0)}Z" fill="${pal.woolShade}"/>`);
  const hx = cx + dir * rx * 0.98, hy = cy - ry * 0.32;
  out.push(`<path d="M${r0(hx - dir * 2 * s)},${r0(hy - 5 * s)}l${r0(-dir * 7 * s)},${r0(-1 * s)}l${r0(dir * 3 * s)},${r0(4 * s)}z" fill="${pal.dark}"/>`);
  out.push(`<ellipse cx="${r0(hx + dir * 3 * s)}" cy="${r0(hy + 2 * s)}" rx="${f(5.2 * s)}" ry="${f(7.4 * s)}" transform="rotate(${-dir * 28} ${r0(hx + dir * 3 * s)} ${r0(hy + 2 * s)})" fill="${pal.dark}"/>`);
  out.push(`<circle cx="${r0(hx - dir * 1 * s)}" cy="${r0(hy - 4 * s)}" r="${f(4 * s)}" fill="${pal.wool}"/>`);
  if (s > 1.4) out.push(`<path d="M${r0(cx - rx * 0.7)},${r0(cy - ry * 0.75)}A${f(rx)},${f(ry)} 0 0 1 ${r0(cx + rx * 0.2)},${r0(cy - ry * 1.02)}" fill="none" stroke="#fff" stroke-width="${f(1.4 * s)}" stroke-linecap="round" opacity=".7"/>`);
  return out.join('');
}

// Fence run along a polyline: posts + two rails
export function fence(pts, s, col, hi = null) {
  let posts = '', rails = '';
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i];
    posts += `M${r0(x)},${r0(y)}v${r0(-22 * s)}`;
  }
  for (const off of [7, 16]) rails += pl(pts.map(([x, y]) => [x, y - off * s]));
  return `<path d="${rails}" fill="none" stroke="${col}" stroke-width="${f(Math.max(1, 2.6 * s))}"/><path d="${posts}" stroke="${col}" stroke-width="${f(Math.max(1.2, 4 * s))}" stroke-linecap="round"/>`
    + (hi ? `<path d="${posts.replace(/M(\d+),/g, (m, a) => `M${+a - Math.max(1, s)},`)}" stroke="${hi}" stroke-width="${f(Math.max(0.8, 1.4 * s))}" opacity=".7"/>` : '');
}

// Round-canopy tree (cel shaded). pal: { lit, mid, shade, trunk }
export function tree(R, x, y, s, pal, { light = -1 } = {}) {
  const out = [];
  out.push(`<path d="M${r0(x - 3 * s)},${r0(y)}L${r0(x - 2 * s)},${r0(y - 26 * s)}L${r0(x + 2 * s)},${r0(y - 26 * s)}L${r0(x + 3 * s)},${r0(y)}Z" fill="${pal.trunk}"/>`);
  const blobs = [[0, -40, 22], [-14, -30, 15], [14, -30, 16], [-6, -54, 15], [9, -50, 14]];
  let base = '', lit = '';
  for (const [bx, by, br] of blobs) {
    const rr = br * s * R.range(0.9, 1.1);
    base += `M${r0(x + bx * s - rr)},${r0(y + by * s)}a${r0(rr)},${r0(rr)} 0 1 0 ${r0(rr * 2)},0a${r0(rr)},${r0(rr)} 0 1 0 ${r0(-rr * 2)},0`;
    const lx = x + bx * s + light * rr * 0.28, ly = y + by * s - rr * 0.28, lr = rr * 0.7;
    lit += `M${r0(lx - lr)},${r0(ly)}a${r0(lr)},${r0(lr)} 0 1 0 ${r0(lr * 2)},0a${r0(lr)},${r0(lr)} 0 1 0 ${r0(-lr * 2)},0`;
  }
  out.push(`<path d="${base}" fill="${pal.shade}"/>`);
  out.push(`<path d="${lit}" fill="${pal.lit}"/>`);
  return out.join('');
}

// Conifer silhouette (stack of jagged tiers)
export function pine(x, y, h, col, w = h * 0.36) {
  const tiers = 4, pts = [[x, y - h]];
  for (let i = 1; i <= tiers; i++) {
    const t = i / tiers, ww = w * (0.35 + 0.65 * t), yy = y - h + h * 0.92 * t;
    pts.push([x + ww / 2, yy], [x + ww * 0.18, yy - h * 0.04]);
  }
  const right = pts.slice(1);
  const left = right.map(([px, py]) => [2 * x - px, py]).reverse();
  return `<path d="${pz([pts[0], ...right, [x + w * 0.06, y], [x - w * 0.06, y], ...left])}" fill="${col}"/>`;
}

// Rock / boulder with lit facet (upper left) and shadow facet
export function rock(R, x, y, w, h, pal) {
  const n = 7, pts = [];
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + Math.PI * i / n;
    pts.push([x + Math.cos(a) * w / 2 * R.range(0.85, 1.05), y + Math.sin(a) * h * R.range(0.8, 1.05)]);
  }
  const top = pts[Math.floor(n / 2)];
  const s = [`<path d="${pz([...pts, [x + w / 2, y], [x - w / 2, y]])}" fill="${pal.mid}"/>`];
  s.push(`<path d="${pz([pts[0], ...pts.slice(1, Math.floor(n / 2) + 1), [top[0] + w * 0.05, y - h * 0.35], [x - w * 0.2, y]])}" fill="${pal.lit}"/>`);
  s.push(`<path d="${pz([[top[0] + w * 0.08, y - h * 0.45], ...pts.slice(Math.floor(n / 2) + 2), [x + w / 2, y], [x + w * 0.1, y]])}" fill="${pal.shade}"/>`);
  return s.join('');
}

// ---------------------------------------------------------------------------------------------
// Fire: the dragon's black flame — colour-draining, near-black tongues with a pale ashen corona and dark-red cores.
// ---------------------------------------------------------------------------------------------
export function blackFlame(R, x, y, w, h, { tongues = 5, seed = 1 } = {}) {
  let body = '', core = '', edge = '';
  for (let i = 0; i < tongues; i++) {
    const cx = x + (i + 0.5) / tongues * w + R.range(-w / tongues * 0.3, w / tongues * 0.3);
    const hh = h * R.range(0.55, 1) * (1 - Math.abs(i + 0.5 - tongues / 2) / tongues * 0.8);
    const ww = w / tongues * R.range(1.2, 1.8);
    const lean = R.range(-0.25, 0.25) * hh;
    const tip = [cx + lean, y - hh];
    const pts = [[cx - ww / 2, y], [cx - ww * 0.42, y - hh * 0.35], [cx - ww * 0.12 + lean * 0.5, y - hh * 0.7], tip, [cx + ww * 0.2 + lean * 0.4, y - hh * 0.62], [cx + ww * 0.44, y - hh * 0.3], [cx + ww / 2, y]];
    const d = shape(pts.map((p, j) => (j === 3 ? [...p, 1] : p)), true, 0);
    body += d;
    edge += shape([pts[0], pts[1], pts[2], [...tip, 1]], false, 0);
    const ch = hh * R.range(0.25, 0.45);
    core += shape([[cx - ww * 0.22, y], [cx - ww * 0.12, y - ch * 0.6], [cx + lean * 0.15, y - ch, 1], [cx + ww * 0.12, y - ch * 0.5], [cx + ww * 0.22, y]], true, 0);
  }
  return { body, core, edge };
}

// Cluster of 2–3 overlapping cumulus puffs (side puffs behind, lower)
export function cloudCluster(R, x, y, w, h, c, o = {}) {
  return cloud(R, x - w * 0.18, y + h * 0.06, w * 0.55, h * 0.55, c, { ...o, bumps: 4 })
    + cloud(R, x + w * 0.62, y + h * 0.05, w * 0.5, h * 0.5, c, { ...o, bumps: 4 })
    + cloud(R, x, y, w, h, c, o);
}

// Wheat ear on a curved stalk (for out-of-focus foreground framing)
export function wheatEar(x, y, h, lean) {
  const tx = x + lean, ty = y - h;
  let d = `M${f(x, 0)},${f(y, 0)}Q${f(x + lean * 0.3, 0)},${f(y - h * 0.55, 0)} ${f(tx, 0)},${f(ty, 0)}`;
  const len = h * 0.3, ang = Math.atan2(-h * 0.45, lean * 0.7);
  const ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux;
  for (let i = 0; i < 6; i++) {
    const t = i / 6, cx = tx + ux * len * t, cy = ty + uy * len * t, gw = len * 0.13 * (1 - t * 0.5), gl = len * 0.2;
    for (const sgn of [-1, 1]) {
      const ex = cx + vx * gw * sgn * 1.6 + ux * gl, ey = cy + vy * gw * sgn * 1.6 + uy * gl;
      d += `M${f(cx, 0)},${f(cy, 0)}Q${f(cx + vx * gw * sgn * 2.2 + ux * gl * 0.4, 0)},${f(cy + vy * gw * sgn * 2.2 + uy * gl * 0.4, 0)} ${f(ex, 0)},${f(ey, 0)}`;
    }
  }
  const ax = tx + ux * len, ay = ty + uy * len;
  d += `M${f(ax, 0)},${f(ay, 0)}l${f(ux * len * 0.5, 0)},${f(uy * len * 0.5, 0)}`;
  return d;
}

// Simple pinhole projection for street / interior scenes. Ground is Y = 0, camera at (0, eye, 0) looking +Z.
export function persp({ vp = [800, 470], F = 900, eye = 1.7 } = {}) {
  const pr = (X, Y, Z) => [vp[0] + X / Z * F, vp[1] - (Y - eye) / Z * F];
  pr.quad = (pts) => pz(pts.map(([X, Y, Z]) => pr(X, Y, Z)));
  pr.poly = (pts) => pts.map(([X, Y, Z]) => pr(X, Y, Z));
  return pr;
}

// Crow / bird silhouette (M-shape) centred at x,y
export function bird(x, y, s, flap = 0) {
  const u = 10 * s, v = (4 + flap * 4) * s;
  return `M${f(x - u, 0)},${f(y - v, 0)}Q${f(x - u * 0.45, 0)},${f(y - v * 0.7, 0)} ${f(x, 0)},${f(y + 2 * s, 0)}Q${f(x + u * 0.45, 0)},${f(y - v * 0.7, 0)} ${f(x + u, 0)},${f(y - v, 0)}Q${f(x + u * 0.5, 0)},${f(y - v * 0.1, 0)} ${f(x, 0)},${f(y + 4 * s, 0)}Q${f(x - u * 0.5, 0)},${f(y - v * 0.1, 0)} ${f(x - u, 0)},${f(y - v, 0)}Z`;
}

// A mass of flame tongues rising from a base line (x0,y0)->(x1,y1). wind > 0 leans the tips right.
// Returns path data: body (all tongues), core (inner lower glow), edge (lit left outlines), licks (detached fragments).
export function flameMass(R, x0, y0, x1, y1, h, { n = 0, wind = 0.25 } = {}) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const count = n || Math.max(4, Math.round(len / (h * 0.24)));
  let body = '', core = '', edge = '', licks = '';
  for (let i = 0; i < count; i++) {
    const t = (i + R.range(0.15, 0.85)) / count;
    const bx = x0 + (x1 - x0) * t, by = y0 + (y1 - y0) * t;
    const env = 0.4 + 0.6 * Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
    const hh = h * env * R.range(0.5, 1.1);
    const w = Math.max(h * 0.2, len / count * R.range(1.8, 2.8));
    const L = (wind + R.range(-0.2, 0.2)) * hh * 0.45;
    const amp = R.range(0.06, 0.14) * hh, ph = R.range(0, Math.PI * 2);
    // S-curved centre line, tapering width; tip is a sharp corner that curls downwind
    const cxAt = (u) => bx + L * Math.pow(u, 1.4) + amp * Math.sin(ph + u * Math.PI * 1.6) * u;
    const left = [], right = [];
    for (const u of [0, 0.22, 0.45, 0.66, 0.84]) {
      const ww = w / 2 * Math.pow(1 - u, 0.85) * (1 + 0.18 * Math.sin(ph * 2 + u * 7));
      left.push([cxAt(u) - ww, by - hh * u]); right.unshift([cxAt(u) + ww, by - hh * u]);
    }
    left[0][1] += h * 0.04; right[right.length - 1][1] += h * 0.04;
    const tip = [cxAt(1) + amp * 0.6, by - hh, 1];
    const pts = [...left, tip, ...right];
    body += shape(pts, true, 0);
    edge += shape([...left.slice(1), tip], false, 0);
    const ch = hh * R.range(0.07, 0.13);
    core += shape([[bx - w * 0.22, by + 2], [bx - w * 0.12, by - ch * 0.55], [bx + L * 0.1, by - ch, 1], [bx + w * 0.12, by - ch * 0.5], [bx + w * 0.2, by + 2]], true, 0);
    if (R() < 0.3) {
      const lx = tip[0] + R.range(0, 0.2) * hh, ly = tip[1] - R.range(0.08, 0.25) * hh, ls = hh * R.range(0.07, 0.13);
      licks += shape([[lx - ls * 0.4, ly + ls], [lx - ls * 0.25, ly + ls * 0.2], [lx + ls * 0.35, ly - ls, 1], [lx + ls * 0.3, ly + ls * 0.3], [lx + ls * 0.35, ly + ls]], true, 0);
    }
  }
  return { body, core, edge, licks };
}

// Column of cel-shaded billows (smoke) rising from (x, y) to height h, drifting by `drift`.
export function billows(R, x, y, h, w, drift, c) {
  let s = '';
  const n = Math.max(4, Math.round(h / (w * 0.5)));
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const cx = x + drift * t * t, cy = y - h * t;
    const ww = w * (0.6 + t * 1.6), hh = ww * 0.42;
    s += cloud(R, cx - ww / 2, cy, ww, hh, c, { bumps: 5, flat: 0.25, capY: 0.3 });
  }
  return s;
}

// ---------------------------------------------------------------------------------------------
// Town (晨钟镇) building blocks
// ---------------------------------------------------------------------------------------------
export const TOWN = {
  plaster: ['#f2e4ca', '#d8c6a6', '#9a8468'], timber: '#5a3a2a', stone: ['#c4b8a4', '#968a7a', '#6a6054'],
  tile: ['#c8603e', '#8e3e2e'], slate: ['#66708e', '#434a66'], shutters: ['#4a6a8e', '#6a8a4e', '#a84e3e', '#8a6a9a'],
  glass: '#3a4256', glassLit: '#ffd690', flowers: ['#e85a6a', '#f0c440', '#f08ab0', '#ffffff'],
};

// Half-timbered townhouse, front elevation. (x, y) bottom-left. side > 0 adds a shaded side wall on the right.
export function townhouse(R, x, y, w, h, o = {}) {
  const { floors = 3, roof = 'gable', side = 0, lit = 0, k = 1, tone = 0, shutter = null, roofKind = null, flowers = true } = o;
  const P = TOWN, out = [];
  const pl0 = mix(P.plaster[0], '#b8a890', tone), pl1 = mix(P.plaster[1], '#8a7a66', tone);
  const rk = roofKind || (R() < 0.7 ? 'tile' : 'slate');
  const [rl, rs] = P[rk];
  const fh = h / floors;
  const sh = shutter || P.shutters[Math.floor(R() * P.shutters.length)];
  // side wall
  if (side) out.push(`<path d="${pz([[x + w, y], [x + w, y - h], [x + w + side, y - h - side * 0.25], [x + w + side, y - side * 0.25]])}" fill="${P.plaster[2]}"/>`);
  // roof
  const rh = roof === 'gable' ? w * 0.62 : fh * 0.9;
  if (roof === 'gable') {
    out.push(`<path d="${pz([[x - w * 0.06, y - h + 2], [x + w / 2, y - h - rh], [x + w * 1.06, y - h + 2]])}" fill="${rl}"/>`);
    out.push(`<path d="${pz([[x + w / 2, y - h - rh], [x + w * 1.06, y - h + 2], [x + w * 0.8, y - h + 2]])}" fill="${rs}" opacity=".55"/>`);
    if (side) out.push(`<path d="${pz([[x + w / 2, y - h - rh], [x + w / 2 + side, y - h - rh - side * 0.25], [x + w * 1.06 + side, y - h + 2 - side * 0.25], [x + w * 1.06, y - h + 2]])}" fill="${rs}"/>`);
    out.push(`<path d="M${r0(x - w * 0.06)},${r0(y - h + 2)}L${r0(x + w / 2)},${r0(y - h - rh)}" stroke="#fff4dc" stroke-width="${f(2.2 * k)}" opacity=".8"/>`);
    // gable infill (plaster + timber) and attic window
    out.push(`<path d="${pz([[x + w * 0.04, y - h], [x + w / 2, y - h - rh * 0.86], [x + w * 0.96, y - h]])}" fill="${pl0}"/>`);
    out.push(`<path d="M${r0(x + w / 2)},${r0(y - h - rh * 0.86)}V${r0(y - h)}M${r0(x + w * 0.27)},${r0(y - h - rh * 0.43)}L${r0(x + w / 2)},${r0(y - h)}L${r0(x + w * 0.73)},${r0(y - h - rh * 0.43)}" stroke="${P.timber}" stroke-width="${f(4 * k)}" fill="none"/>`);
    out.push(`<path d="M${r0(x + w * 0.42)},${r0(y - h - rh * 0.28)}h${r0(w * 0.16)}v${r0(rh * 0.2)}h${r0(-w * 0.16)}z" fill="${lit ? P.glassLit : P.glass}"/>`);
  } else {
    out.push(`<path d="${pz([[x - w * 0.05, y - h + 2], [x + w * 0.08, y - h - rh], [x + w * 0.92, y - h - rh], [x + w * 1.05, y - h + 2]])}" fill="${rl}"/>`);
    out.push(`<path d="M${r0(x - w * 0.05)},${r0(y - h + 2)}L${r0(x + w * 0.08)},${r0(y - h - rh)}H${r0(x + w * 0.92)}" fill="none" stroke="#fff4dc" stroke-width="${f(2 * k)}" opacity=".7"/>`);
    // dormer
    const dx = x + w * 0.4;
    out.push(`<path d="M${r0(dx)},${r0(y - h - rh * 0.15)}v${r0(-rh * 0.5)}l${r0(w * 0.1)},${r0(-rh * 0.25)}l${r0(w * 0.1)},${r0(rh * 0.25)}v${r0(rh * 0.5)}z" fill="${pl0}"/><path d="M${r0(dx + w * 0.05)},${r0(y - h - rh * 0.2)}v${r0(-rh * 0.35)}h${r0(w * 0.1)}v${r0(rh * 0.35)}z" fill="${P.glass}"/>`);
  }
  let tiles = '';
  for (let t = 0.2; t < 1; t += 0.2) tiles += roof === 'gable' ? `M${r0(x + w / 2 - w * 0.56 * t)},${r0(y - h - rh + rh * t)}L${r0(x + w / 2 + w * 0.56 * t)},${r0(y - h - rh + rh * t)}` : `M${r0(x + w * 0.05 - w * 0.12 * (1 - t))},${r0(y - h - rh * (1 - t))}H${r0(x + w * 0.95 + w * 0.12 * (1 - t))}`;
  out.push(`<path d="${tiles}" stroke="#000" stroke-opacity=".14" stroke-width="${f(1.5 * k)}"/>`);
  // chimney
  if (R() < 0.6) { const cx = x + w * R.range(0.15, 0.75); out.push(`<path d="M${r0(cx)},${r0(y - h - rh * 0.4)}v${r0(-rh * 0.5)}h${r0(w * 0.09)}v${r0(rh * 0.5)}z" fill="${P.stone[1]}"/>`); }
  // walls: stone ground floor, plaster upper floors
  out.push(`<rect x="${r0(x)}" y="${r0(y - h)}" width="${r0(w)}" height="${r0(h - fh)}" fill="${pl0}"/>`);
  out.push(`<rect x="${r0(x)}" y="${r0(y - fh)}" width="${r0(w)}" height="${r0(fh)}" fill="${P.stone[0]}"/>`);
  out.push(`<rect x="${r0(x + w * 0.7)}" y="${r0(y - h)}" width="${r0(w * 0.3)}" height="${r0(h)}" fill="${pl1}" opacity=".45"/>`);
  // timber frame
  let tb = '';
  for (let i = 1; i < floors; i++) tb += `M${r0(x)},${r0(y - fh * i)}H${r0(x + w)}`;
  tb += `M${r0(x)},${r0(y - h)}H${r0(x + w)}M${r0(x + 2 * k)},${r0(y - h)}V${r0(y - fh)}M${r0(x + w - 2 * k)},${r0(y - h)}V${r0(y - fh)}`;
  const nw = Math.max(1, Math.round(w / (70 * k)));
  for (let i = 1; i < floors; i++) {
    const yb = y - fh * i, yt = yb - fh;
    for (let j = 0; j <= nw; j++) {
      const xx = x + w * j / nw;
      tb += `M${r0(xx)},${r0(yb)}V${r0(yt)}`;
      if (j < nw && (i + j) % 2 === 0) tb += `M${r0(xx)},${r0(yb)}L${r0(x + w * (j + 0.5) / nw)},${r0(yt + fh * 0.35)}`;
    }
  }
  out.push(`<path d="${tb}" stroke="${P.timber}" stroke-width="${f(3.5 * k)}" fill="none"/>`);
  // windows with shutters and flower boxes
  let gl = '', fr = '', shu = '', fb = '', fl = '';
  for (let i = 1; i < floors; i++) {
    const yb = y - fh * i;
    for (let j = 0; j < nw; j++) {
      const cx = x + w * (j + 0.5) / nw, ww = Math.min(w / nw * 0.42, 30 * k), wh = fh * 0.5, wy = yb - fh * 0.72;
      gl += `M${r0(cx - ww / 2)},${r0(wy)}h${r0(ww)}v${r0(wh)}h${r0(-ww)}z`;
      fr += `M${r0(cx)},${r0(wy)}v${r0(wh)}M${r0(cx - ww / 2)},${r0(wy + wh * 0.45)}h${r0(ww)}`;
      shu += `M${r0(cx - ww / 2 - ww * 0.42)},${r0(wy)}h${r0(ww * 0.38)}v${r0(wh)}h${r0(-ww * 0.38)}zM${r0(cx + ww / 2 + ww * 0.04)},${r0(wy)}h${r0(ww * 0.38)}v${r0(wh)}h${r0(-ww * 0.38)}z`;
      if (flowers && (i + j) % 2 === 1) {
        fb += `M${r0(cx - ww * 0.6)},${r0(wy + wh)}h${r0(ww * 1.2)}v${r0(fh * 0.08)}h${r0(-ww * 1.2)}z`;
        for (let q = 0; q < 4; q++) fl += `<circle cx="${r0(cx - ww * 0.45 + q * ww * 0.3)}" cy="${r0(wy + wh - 2 * k)}" r="${f(3.2 * k)}" fill="${P.flowers[(q + i + j) % P.flowers.length]}"/>`;
      }
    }
  }
  out.push(`<path d="${gl}" fill="${lit ? P.glassLit : P.glass}"/><path d="${fr}" stroke="${P.plaster[0]}" stroke-width="${f(1.6 * k)}"/><path d="${shu}" fill="${sh}"/><path d="${fb}" fill="${P.timber}"/>${fl}`);
  // ground floor: door + window (or shop front)
  const dw = Math.min(w * 0.22, 34 * k);
  out.push(`<path d="M${r0(x + w * 0.62)},${r0(y)}v${r0(-fh * 0.78)}a${f(dw / 2)},${f(dw / 2)} 0 0 1 ${r0(dw)},0v${r0(fh * 0.78)}z" fill="${P.timber}"/>`);
  out.push(`<path d="M${r0(x + w * 0.14)},${r0(y - fh * 0.75)}h${r0(w * 0.32)}v${r0(fh * 0.45)}h${r0(-w * 0.32)}z" fill="${lit ? P.glassLit : P.glass}"/><path d="M${r0(x + w * 0.1)},${r0(y - fh * 0.82)}h${r0(w * 0.4)}" stroke="${sh}" stroke-width="${f(5 * k)}"/>`);
  return out.join('');
}

// Market stall: striped scalloped awning on poles, a counter heaped with goods
export function stall(R, x, y, w, h, stripes, goods) {
  const out = [];
  const top = y - h, aw = h * 0.28;
  out.push(`<path d="M${r0(x + w * 0.04)},${r0(y)}V${r0(top)}M${r0(x + w * 0.96)},${r0(y)}V${r0(top)}" stroke="#5a3a2a" stroke-width="${f(Math.max(2, w * 0.02))}"/>`);
  // counter
  out.push(`<path d="M${r0(x)},${r0(y - h * 0.38)}h${r0(w)}v${r0(h * 0.38)}h${r0(-w)}z" fill="#8a5a3a"/><path d="M${r0(x)},${r0(y - h * 0.38)}h${r0(w)}" stroke="#c4885a" stroke-width="${f(Math.max(1.5, w * 0.015))}"/><path d="M${r0(x + w * 0.66)},${r0(y - h * 0.38)}h${r0(w * 0.34)}v${r0(h * 0.38)}h${r0(-w * 0.34)}z" fill="#000" opacity=".18"/>`);
  // goods: rows of round fruit / sacks / jars
  let g = '';
  const n = Math.max(4, Math.round(w / 16));
  for (let i = 0; i < n; i++) {
    const gx = x + w * (i + 0.5) / n, gy = y - h * 0.4, r = w / n * 0.42;
    g += `<circle cx="${r0(gx)}" cy="${r0(gy - r)}" r="${f(r)}" fill="${goods[i % goods.length]}"/>`;
    if (i % 2) g += `<circle cx="${r0(gx + r * 0.5)}" cy="${r0(gy - r * 2.4)}" r="${f(r * 0.9)}" fill="${goods[(i + 1) % goods.length]}"/>`;
  }
  out.push(g);
  // awning: stripes, scalloped hem
  const sN = Math.max(4, Math.round(w / 22));
  let st = '';
  for (let i = 0; i < sN; i++) {
    const x0 = x - w * 0.04 + (w * 1.08) * i / sN, x1 = x - w * 0.04 + (w * 1.08) * (i + 1) / sN;
    st += `<path d="M${r0(x0 + w * 0.02)},${r0(top - aw * 0.4)}L${r0(x1 + w * 0.02)},${r0(top - aw * 0.4)}L${r0(x1)},${r0(top + aw * 0.6)}Q${r0((x0 + x1) / 2)},${r0(top + aw)} ${r0(x0)},${r0(top + aw * 0.6)}Z" fill="${stripes[i % stripes.length]}"/>`;
  }
  out.push(st);
  out.push(`<path d="M${r0(x - w * 0.02)},${r0(top - aw * 0.4)}h${r0(w * 1.08)}" stroke="#fff6e0" stroke-width="${f(Math.max(1.2, w * 0.012))}" opacity=".8"/>`);
  out.push(`<path d="M${r0(x)},${r0(top + aw * 0.9)}h${r0(w)}v${r0(h * 0.1)}h${r0(-w)}z" fill="#000" opacity=".12"/>`);
  return out.join('');
}

// Tiny person silhouette (distant crowd). s ≈ 1 → 26px tall
export function person(x, y, s, col, R = null) {
  const lean = R ? R.range(-2, 2) : 0;
  return `M${f(x - 5 * s, 0)},${f(y, 0)}l${f(1.5 * s + lean, 1)},${f(-17 * s, 1)}h${f(7 * s, 1)}l${f(1.5 * s - lean, 1)},${f(17 * s, 1)}zM${f(x + lean - 3.6 * s, 1)},${f(y - 21 * s, 1)}a${f(3.6 * s, 1)},${f(3.6 * s, 1)} 0 1 0 ${f(7.2 * s, 1)},0a${f(3.6 * s, 1)},${f(3.6 * s, 1)} 0 1 0 ${f(-7.2 * s, 1)},0`;
}
