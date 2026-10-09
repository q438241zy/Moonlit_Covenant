// Shared helpers for the boss / stage-scene / UI art painted by tools/art/stage/build.mjs.
// Zero dependencies. Everything returns SVG markup strings; callers pass their asset id prefix.

export const PAL = {
  void: '#070614', void2: '#0c0b1b', panel: '#17132e', panel2: '#221c45',
  moon: '#e8ddff', oath: '#ffd091', memory: '#ffb38a', abyss: '#0e1a3a',
  lia: '#ff6b7c', mia: '#5ed7ff', serena: '#b58cff', silver: '#dcd6f0',
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
  r.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * r());
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  return r;
}

// compact number formatting
export function f(v, d = 1) {
  const s = (+v).toFixed(d);
  return s.indexOf('.') >= 0 ? s.replace(/0+$/, '').replace(/\.$/, '').replace(/^-0$/, '0') : s;
}
export const P = (x, y, d = 1) => `${f(x, d)},${f(y, d)}`;

// polygon path
export const poly = (pts, d = 1) => 'M' + pts.map(([x, y]) => P(x, y, d)).join('L') + 'Z';
export const line = (pts, d = 1) => 'M' + pts.map(([x, y]) => P(x, y, d)).join('L');

// Smooth path through points: [x,y] smooth, [x,y,1] corner. Catmull-Rom -> cubic Bezier.
export function shape(points, closed = true, d = 1, tension = 1) {
  const n = points.length;
  const Q = (i) => points[(i + n) % n];
  const tan = (i) => {
    const c = Q(i);
    if (c[2]) return [0, 0];
    if (!closed && (i === 0 || i === n - 1)) return [0, 0];
    const a = Q(i - 1), b = Q(i + 1);
    return [(b[0] - a[0]) / 6 * tension, (b[1] - a[1]) / 6 * tension];
  };
  let s = `M${P(points[0][0], points[0][1], d)}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = Q(i), b = Q(i + 1), ta = tan(i), tb = tan(i + 1);
    if (!ta[0] && !ta[1] && !tb[0] && !tb[1]) s += `L${P(b[0], b[1], d)}`;
    else s += `C${P(a[0] + ta[0], a[1] + ta[1], d)} ${P(b[0] - tb[0], b[1] - tb[1], d)} ${P(b[0], b[1], d)}`;
  }
  return closed ? s + 'Z' : s;
}

// Catmull-Rom point evaluation on an open polyline of control points (t in [0,1])
export function crEval(ctrl, t) {
  const n = ctrl.length - 1;
  const x = Math.min(n - 1e-9, Math.max(0, t * n));
  const i = Math.floor(x), u = x - i;
  const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(n, i + 2)];
  const out = [];
  for (let k = 0; k < p1.length; k++) {
    const a = p0[k], b = p1[k], c = p2[k], e = p3[k];
    out.push(0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - e) * u * u + (-a + 3 * b - 3 * c + e) * u * u * u));
  }
  return out;
}

// A "spine" sampler: ctrl = [[x,y,wUpper,wLower], ...]. Returns frame(t) -> {x,y,tx,ty,nx,ny,wu,wl}
// Normal n points to the "upper" side (tangent rotated -90deg: rightward tangent -> n up).
export function spine(ctrl) {
  const frame = (t) => {
    const [x, y, wu, wl] = crEval(ctrl, t);
    const a = crEval(ctrl, Math.max(0, t - 0.004)), b = crEval(ctrl, Math.min(1, t + 0.004));
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
    return { x, y, tx, ty, nx: ty, ny: -tx, wu, wl };
  };
  // point at normalized cross coordinate v (+1 upper outline, -1 lower outline)
  frame.at = (t, v) => {
    const F = frame(t);
    const w = v >= 0 ? F.wu * v : F.wl * v;
    return [F.x + F.nx * w, F.y + F.ny * w];
  };
  return frame;
}

export const stops = (list) => list.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`).join('');
export const radial = (id, list, attrs = '') => `<radialGradient id="${id}" ${attrs}>${stops(list)}</radialGradient>`;
export const linear = (id, list, attrs = 'x1="0" y1="0" x2="0" y2="1"') => `<linearGradient id="${id}" ${attrs}>${stops(list)}</linearGradient>`;
export const blur = (id, sd, pad = 50) => `<filter id="${id}" x="-${pad}%" y="-${pad}%" width="${100 + 2 * pad}%" height="${100 + 2 * pad}%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;

export function svgDoc(w, h, label, defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">\n<defs>${defs}</defs>\n${body}\n</svg>\n`;
}

// rotate point around a center
export function rot([x, y], deg, cx = 0, cy = 0) {
  const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
}

// mix two hex colours
export function mix(c1, c2, t) {
  const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const a = h(c1), b = h(c2);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

// Eclipse sigil used on card back / pack / crest (no text, no filters).
// Returns markup centred at (0,0) with radius ~r.
export function eclipseSigil(p, r, opt = {}) {
  const metal = opt.metal || `url(#${p}-silver)`;
  const gold = opt.gold || PAL.oath;
  const s = [];
  const k = r / 100;
  // outer thin ring + tick ring
  s.push(`<circle r="${f(100 * k)}" fill="none" stroke="${metal}" stroke-width="${f(2.2 * k)}"/>`);
  s.push(`<circle r="${f(92 * k)}" fill="none" stroke="${metal}" stroke-width="${f(1 * k)}" opacity=".7"/>`);
  let ticks = '';
  for (let i = 0; i < 48; i++) {
    const a = i / 48 * Math.PI * 2, r1 = (i % 4 === 0 ? 84 : 88) * k, r2 = 92 * k;
    ticks += `M${P(Math.cos(a) * r1, Math.sin(a) * r1)}L${P(Math.cos(a) * r2, Math.sin(a) * r2)}`;
  }
  s.push(`<path d="${ticks}" stroke="${metal}" stroke-width="${f(1.1 * k)}"/>`);
  // eight-point star behind the moon (long cardinal, short diagonal)
  const star = [];
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? (i % 4 === 0 ? 80 : 56) * k : 22 * k;
    star.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  s.push(`<path d="${poly(star)}" fill="${opt.starFill || 'none'}" stroke="${metal}" stroke-width="${f(1.4 * k)}" stroke-linejoin="round"/>`);
  // corona + eclipsed disc + diamond-ring flare
  s.push(`<circle r="${f(44 * k)}" fill="${opt.corona || `url(#${p}-corona)`}"/>`);
  s.push(`<circle r="${f(34 * k)}" fill="${opt.disc || '#090716'}" stroke="${gold}" stroke-width="${f(1.6 * k)}"/>`);
  s.push(`<path d="M${P(-34 * k, 0)}A${f(34 * k)},${f(34 * k)} 0 0 1 ${P(24 * k, -24 * k)}" fill="none" stroke="#fff6e4" stroke-width="${f(2.4 * k)}" stroke-linecap="round" opacity=".9"/>`);
  s.push(`<circle cx="${f(24 * k)}" cy="${f(-24 * k)}" r="${f(3.4 * k)}" fill="#fffaf0"/>`);
  // four small moon-phase studs on the diagonals
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2, x = Math.cos(a) * 66 * k, y = Math.sin(a) * 66 * k, rr = 5.5 * k;
    s.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="${gold}"/>`);
    s.push(`<circle cx="${f(x + (i - 1.5) * 2.2 * k)}" cy="${f(y)}" r="${f(rr)}" fill="${opt.disc || '#090716'}"/>`);
  }
  return s.join('');
}
