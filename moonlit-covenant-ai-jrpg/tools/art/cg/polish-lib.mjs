// Small drawing kit for the polished character CGs (camp-fire repaint, aftermath-snow Lia pass).
// Zero dependencies, deterministic. Everything returns SVG markup strings; callers prefix every id.
//
// Point lists use the same convention as the other CG libs: [x, y] = smooth point (Catmull-Rom),
// [x, y, 1] = sharp corner.

const r = (v, d) => {
  const k = 10 ** d;
  const x = Math.round(v * k) / k;
  return x === 0 ? 0 : x;
};
/** compact number: d decimals, trailing zeros stripped */
export const f = (v, d = 0) => String(r(v, d));
export const pt = ([x, y], d = 0) => `${f(x, d)},${f(y, d)}`;
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// deterministic PRNG (mulberry32)
export function rng(seed) {
  let a = seed >>> 0;
  const R = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  R.range = (lo, hi) => lo + (hi - lo) * R();
  return R;
}

/** Catmull-Rom curve through every point; emits S shorthand where the tangent is continuous. */
export function smooth(pts, closed = true, d = 0) {
  const N = pts.length;
  const get = (i) => (closed ? pts[(i + N) % N] : pts[clamp(i, 0, N - 1)]);
  const sharp = (p) => p.length > 2 && p[2];
  let out = `M${pt(pts[0], d)}`;
  const segs = closed ? N : N - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const c1 = sharp(p1) || (!closed && i === 0) ? p1 : [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = sharp(p2) || (!closed && i === N - 2) ? p2 : [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    if (c1 === p1 && c2 === p2) out += `L${pt(p2, d)}`;
    else if (i > 0 && !sharp(p1) && c1 !== p1) out += `S${pt(c2, d)} ${pt(p2, d)}`;
    else out += `C${pt(c1, d)} ${pt(c2, d)} ${pt(p2, d)}`;
  }
  return closed ? out + 'Z' : out;
}

/** evenly sampled points along a Catmull-Rom spline through pts (open) */
export function sample(pts, count) {
  const N = pts.length;
  const get = (i) => pts[clamp(i, 0, N - 1)];
  const fine = [];
  for (let i = 0; i < N - 1; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    for (let s = 0; s < 10; s++) {
      const t = s / 10, t2 = t * t, t3 = t2 * t;
      const c = (a, b, cc, dd) => 0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - dd) * t2 + (-a + 3 * b - 3 * cc + dd) * t3);
      fine.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  fine.push(pts[N - 1].slice(0, 2));
  const L = [0];
  for (let i = 1; i < fine.length; i++) L.push(L[i - 1] + Math.hypot(fine[i][0] - fine[i - 1][0], fine[i][1] - fine[i - 1][1]));
  const total = L[L.length - 1] || 1;
  const out = [];
  let j = 0;
  for (let k = 0; k < count; k++) {
    const target = (total * k) / (count - 1);
    while (j < L.length - 2 && L[j + 1] < target) j++;
    const t = clamp((target - L[j]) / (L[j + 1] - L[j] || 1), 0, 1);
    out.push([lerp(fine[j][0], fine[j + 1][0], t), lerp(fine[j][1], fine[j + 1][1], t)]);
  }
  return out;
}

/**
 * Tapered brush stroke along pts. w = max width; s0/s1 = start/end width fraction; pk = t of max width.
 * Returns a closed path (pointed where the width collapses).
 */
export function taper(pts, w, s0 = 0.2, s1 = 0, pk = 0.35, d = 0, n = 0) {
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const count = n || clamp(Math.round(len / 16), 4, 12);
  const c = sample(pts, count);
  const wf = (t) => (t <= pk ? w * (s0 + (1 - s0) * Math.sin(((pk ? t / pk : 1) * Math.PI) / 2)) : w * (s1 + (1 - s1) * Math.cos((((t - pk) / (1 - pk || 1)) * Math.PI) / 2)));
  const A = [], B = [];
  for (let i = 0; i < count; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(count - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1;
    dx /= m; dy /= m;
    const hw = wf(i / (count - 1)) / 2;
    A.push([c[i][0] + dy * hw, c[i][1] - dx * hw]);
    B.push([c[i][0] - dy * hw, c[i][1] + dx * hw]);
  }
  const P = [];
  P.push(s0 < 0.05 ? [...c[0], 1] : [...A[0], 1]);
  for (let i = 1; i < count - 1; i++) P.push(A[i]);
  if (s1 < 0.05) P.push([...c[count - 1], 1]);
  else P.push([...A[count - 1], 1], [...B[count - 1], 1]);
  for (let i = count - 2; i >= 1; i--) P.push(B[i]);
  if (s0 >= 0.05) P.push([...B[0], 1]);
  return smooth(P, true, d);
}

/** transform a point list: scale k, rotate deg (about origin), then translate (x, y) */
export function xf(P, x = 0, y = 0, k = 1, deg = 0) {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return P.map((p) => {
    const q = [x + (p[0] * c - p[1] * s) * k, y + (p[0] * s + p[1] * c) * k];
    return p[2] ? [...q, 1] : q;
  });
}

export const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
export const line = (d, stroke, w, extra = '') => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
export const op = (o) => (o < 1 ? ` opacity="${f(o, 2)}"` : '');

const stops = (S) => S.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`).join('');
export const radial = (id, S, attrs = '') => `<radialGradient id="${id}" ${attrs}>${stops(S)}</radialGradient>`;
export const linear = (id, S, attrs = 'x1="0" y1="0" x2="0" y2="1"') => `<linearGradient id="${id}" ${attrs}>${stops(S)}</linearGradient>`;

/** blur filters (the art budget allows 4 per CG) */
export function blurs(p, list) {
  return list.map(([id, sd]) => `<filter id="${p}-${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`).join('');
}

// ---------------------------------------------------------------------------------------------
// Anime eye (portrait-set style: thick tapered lash band with a winged outer corner, gradient
// iris, dark pupil, two catch-lights). Local units; the caller positions it with a transform.
//   w, h      : opening width / height
//   flip      : outer corner on the right (true) or on the left (false)
//   lid       : 0 open .. 1 closed (closed = a lash curve only)
//   gaze      : [gx, gy] iris offset in -1..1
//   iris      : [top, bottom] colours;  ink: lash colour;  clip: unique clipPath id
// ---------------------------------------------------------------------------------------------
export function eye(o) {
  const { w = 40, h = 26, flip = false, lid = 0, gaze = [0, 0], iris = ['#7a3a10', '#e8a03a'], ink = '#2a1420', skinSh = '#d9a59e', clip, lash = 1, irisK = 1, smile = 0 } = o;
  const X = (x) => (flip ? -x : x);
  const hw = w / 2;
  let s = '';
  if (lid >= 0.95) {
    // closed: downward arc with a few lashes (smile > 0 bends it into a happy curve)
    const yy = h * 0.15;
    const c = [[X(hw), yy * 0.4], [X(hw * 0.35), yy + 4 + smile * -6], [X(-hw * 0.4), yy + 3 + smile * -6], [X(-hw - 4), yy - 3]];
    s += path(taper(c, 3.6 * lash, 0.3, 0.15, 0.6, 1), ink);
    s += path(taper([[X(-hw - 2), yy - 2], [X(-hw - 8), yy + 3]], 2.4, 1, 0, 0.1, 1), ink);
    s += path(taper([[X(-hw * 0.2), yy + 4.5 + smile * -6], [X(-hw * 0.28), yy + 9 + smile * -6]], 1.6, 1, 0, 0.1, 1), ink, ' opacity=".7"');
    s += line(`M${f(X(-hw * 0.7), 1)},${f(-h * 0.35, 1)}Q${f(X(0), 1)},${f(-h * 0.55, 1)} ${f(X(hw * 0.8), 1)},${f(-h * 0.25, 1)}`, skinSh, 1.4, ' opacity=".6"');
    return s;
  }
  const top = -h / 2 + lid * h * 0.55;
  const bot = h / 2;
  const I = [X(hw), 2], O = [X(-hw), -1];
  const upper = [I, [X(hw * 0.75), top + 4], [X(hw * 0.2), top], [X(-hw * 0.45), top + 1.5], [X(-hw * 0.85), (top + O[1]) / 2], O];
  const lower = [[X(-hw * 0.7), bot - 3], [X(0), bot], [X(hw * 0.65), bot - 2]];
  const open = smooth([...upper.map((p, i) => (i === 0 || i === upper.length - 1 ? [...p, 1] : p)), ...lower], true, 1);
  const ix = gaze[0] * hw * 0.38, iy = gaze[1] * h * 0.2 + 1;
  const rx = h * 0.42 * irisK, ry = h * 0.56 * irisK;
  s += `<clipPath id="${clip}"><path d="${open}"/></clipPath>`;
  s += path(open, '#f6f1fb');
  s += `<g clip-path="url(#${clip})">`;
  s += `<ellipse cx="${f(ix, 1)}" cy="${f(iy, 1)}" rx="${f(rx, 1)}" ry="${f(ry, 1)}" fill="${iris[0]}"/>`;
  s += `<ellipse cx="${f(ix, 1)}" cy="${f(iy + ry * 0.28, 1)}" rx="${f(rx * 0.8, 1)}" ry="${f(ry * 0.62, 1)}" fill="${iris[1]}"/>`;
  s += `<ellipse cx="${f(ix, 1)}" cy="${f(iy + 0.5, 1)}" rx="${f(rx * 0.42, 1)}" ry="${f(ry * 0.5, 1)}" fill="${ink}"/>`;
  s += path(smooth([...upper.map((p, i) => (i === 0 || i === upper.length - 1 ? [...p, 1] : p)), ...upper.slice(1, -1).reverse().map(([x, y]) => [x, y + h * 0.3])], true, 1), ink, ' opacity=".35"');
  s += `<ellipse cx="${f(ix + X(rx * 0.32), 1)}" cy="${f(iy - ry * 0.32, 1)}" rx="${f(rx * 0.32, 1)}" ry="${f(ry * 0.3, 1)}" fill="#fff"/>`;
  s += `<circle cx="${f(ix - X(rx * 0.35), 1)}" cy="${f(iy + ry * 0.45, 1)}" r="${f(rx * 0.14, 1)}" fill="#fff" opacity=".85"/>`;
  s += '</g>';
  // lash band: thickens toward the outer corner and ends in a wing
  const band = [[X(hw + 1), 3], ...upper.slice(1, -1), [X(-hw), -1], [X(-hw - 7), -5]];
  s += path(taper(band, 5.2 * lash, 0.25, 0.1, 0.78, 1, 12), ink);
  s += path(taper([[X(-hw + 1), 0], [X(-hw * 0.6), bot - 1.5], [X(-hw * 0.1), bot + 0.5]], 2.6 * lash, 0.9, 0, 0.1, 1), ink, ' opacity=".9"');
  s += path(taper([[X(-hw * 0.5), bot], [X(hw * 0.5), bot - 1]], 1.2, 0.2, 0.2, 0.5, 1), ink, ' opacity=".45"');
  s += line(`M${f(X(-hw * 0.55), 1)},${f(top - 5, 1)}Q${f(X(0), 1)},${f(top - 8, 1)} ${f(X(hw * 0.7), 1)},${f(top - 3, 1)}`, skinSh, 1.3, ' opacity=".7"');
  return s;
}

/**
 * Defs registry: shapes reused by several layers (fill, rim copies, clip masks) are stored once
 * as <path id> in <defs> and drawn with <use>.
 */
export function context(p) {
  const c = { p, defs: '' };
  c.id = (n) => `${p}-${n}`;
  c.add = (markup) => { c.defs += markup; };
  c.def = (n, d) => { c.defs += `<path id="${p}-${n}" d="${d}"/>`; return n; };
  c.U = (n, fill, extra = '') => `<use href="#${p}-${n}"${fill ? ` fill="${fill}"` : ''}${extra}/>`;
  /** silhouette group + matching clipPath from a list of [name, transform?] */
  c.sil = (n, parts) => {
    const uses = parts.map(([id, t]) => `<use href="#${p}-${id}"${t ? ` transform="${t}"` : ''}/>`).join('');
    c.defs += `<g id="${p}-${n}">${uses}</g><clipPath id="${p}-${n}C">${uses}</clipPath>`;
  };
  return c;
}
