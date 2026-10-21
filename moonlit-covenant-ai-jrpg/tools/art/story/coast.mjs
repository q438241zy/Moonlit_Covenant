// Shared painters for the tidal coast of chapters 06–09 (盐沼、林边水道、量潮老站、雾港):
// tarred piles with a weed line, wet-mud sheen, salt crust, low fog banks, tide lamps, pinned notices.
// House rules for these scenes (scripts 06–09 美術需求): water is drawn as flat colour with current
// streaks — never a reflection of anything above it — and there are no mirrors and no human figures.
import { f, pz, pl } from './lib.mjs';

const r0 = (v) => f(v, 0);
export const circ = (cx, cy, r) => `M${r0(cx - r)},${r0(cy)}a${f(r)},${f(r)} 0 1 0 ${f(r * 2)},0a${f(r)},${f(r)} 0 1 0 ${f(-r * 2)},0`;

// A wooden pile from top (x, y0) down to its foot y1, w wide at the top (slightly wider at the foot):
// lit left strip, shaded right half, a dark wet band with weed from the waterline `wet` (y) down.
// Returns { body, lit, shade, wet } path data so a scene can batch many piles into four <path>s.
export function pileParts(x, y0, y1, w, wet = null, lean = 0) {
  const w1 = w * 1.08, xb = x + lean;
  const body = pz([[x - w / 2, y0], [x + w / 2, y0], [xb + w1 / 2, y1], [xb - w1 / 2, y1]]);
  const lit = pz([[x - w / 2, y0], [x - w * 0.18, y0], [xb - w1 * 0.18, y1], [xb - w1 / 2, y1]]);
  const shade = pz([[x + w * 0.12, y0], [x + w / 2, y0], [xb + w1 / 2, y1], [xb + w1 * 0.12, y1]]);
  let wetD = '';
  if (wet != null && wet < y1) {
    const t = (wet - y0) / (y1 - y0), xw = x + lean * t, ww = w + (w1 - w) * t;
    wetD = pz([[xw - ww / 2, wet], [xw + ww / 2, wet], [xb + w1 / 2, y1], [xb - w1 / 2, y1]]);
  }
  return { body, lit, shade, wet: wetD };
}

// batch of piles -> markup. list: [x, y0, y1, w, wet?, lean?]
export function piles(list, pal) {
  let b = '', l = '', s = '', wt = '', cap = '';
  for (const [x, y0, y1, w, wet = null, lean = 0] of list) {
    const p = pileParts(x, y0, y1, w, wet, lean);
    b += p.body; l += p.lit; s += p.shade; wt += p.wet;
    cap += `M${r0(x - w / 2)},${r0(y0)}h${f(w)}`;
  }
  return `<path d="${b}" fill="${pal.mid}"/><path d="${l}" fill="${pal.lit}"/><path d="${s}" fill="${pal.shade}"/>`
    + (wt ? `<path d="${wt}" fill="${pal.wet}"/>` : '')
    + (pal.cap ? `<path d="${cap}" stroke="${pal.cap}" stroke-width="2" opacity=".7"/>` : '');
}

// Short horizontal glints on wet mud between y0 and y1 (denser and longer toward the viewer).
export function mudSheen(R, x0, x1, y0, y1, n, col, op = 0.5) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const t = R() ** 0.8, y = y0 + (y1 - y0) * t, x = R.range(x0, x1), L = (8 + 46 * t) * R.range(0.5, 1.3);
    d += `M${r0(x)},${r0(y)}h${r0(L)}`;
  }
  return `<path d="${d}" stroke="${col}" stroke-width="1.6" stroke-linecap="round" opacity="${op}"/>`;
}

// Flowing streaks on flat water (current lines, not reflections): gentle S-curves along the flow.
export function currents(R, x0, x1, y0, y1, n, col, op = 0.45, dir = 1) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const t = R() ** 0.9, y = y0 + (y1 - y0) * t, x = R.range(x0, x1), L = (14 + 70 * t) * R.range(0.6, 1.2), a = 1 + 2 * t;
    d += `M${r0(x)},${r0(y)}q${r0(dir * L * 0.5)},${f(-a)} ${r0(dir * L)},0`;
  }
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="1.5" stroke-linecap="round" opacity="${op}"/>`;
}

// Irregular flat patch (salt crust, puddle, moss) centred at cx, cy: a squashed noisy ellipse.
export function patch(R, cx, cy, rx, ry, n = 9) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, k = R.range(0.72, 1.12);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return pz(pts);
}

// Paper notice pinned to a post or wall: sheet, a darker torn corner, abstract scribble lines (never text).
export function notice(x, y, w, h, rot, pal) {
  let lines = '';
  for (let k = 0; k < 4; k++) { const yy = y + h * (0.24 + k * 0.18), ww = w * (k === 0 ? 0.5 : 0.72 - (k % 2) * 0.16); lines += `M${f(x + w * 0.14)},${f(yy)}h${f(ww)}`; }
  return `<g transform="rotate(${rot} ${f(x + w / 2)} ${f(y)})"><path d="M${f(x)},${f(y)}h${f(w)}v${f(h)}h${f(-w * 0.7)}l${f(-w * 0.12)},${f(-h * 0.08)}l${f(-w * 0.18)},${f(h * 0.05)}z" fill="${pal.paper}"/>`
    + `<path d="${lines}" stroke="${pal.ink}" stroke-width="${f(Math.max(0.8, h * 0.05))}" opacity=".55"/><circle cx="${f(x + w / 2)}" cy="${f(y + h * 0.07)}" r="${f(Math.max(1, w * 0.06))}" fill="${pal.pin}"/></g>`;
}

// Tide lamp: an iron-framed glass lantern hanging from a hook (lit = glowing, otherwise dark glass).
export function tideLamp(x, y, s, pal, lit = false) {
  const w = 14 * s, h = 20 * s;
  let out = `<path d="M${f(x)},${f(y - 8 * s)}v${f(6 * s)}" stroke="${pal.iron}" stroke-width="${f(1.6 * s)}"/>`;
  out += `<path d="M${f(x - w * 0.6)},${f(y)}h${f(w * 1.2)}l${f(-w * 0.2)},${f(-4 * s)}h${f(-w * 0.8)}z" fill="${pal.iron}"/>`;
  out += `<path d="M${f(x - w / 2)},${f(y)}h${f(w)}v${f(h)}h${f(-w)}z" fill="${lit ? pal.glow : pal.glass}"/>`;
  if (lit) out += `<path d="M${f(x - w * 0.22)},${f(y + h * 0.25)}h${f(w * 0.44)}v${f(h * 0.5)}h${f(-w * 0.44)}z" fill="${pal.core}"/>`;
  else out += `<path d="M${f(x - w * 0.38)},${f(y + h * 0.12)}v${f(h * 0.5)}" stroke="${pal.glint}" stroke-width="${f(1.4 * s)}" opacity=".7"/>`;
  out += `<path d="M${f(x - w / 2)},${f(y)}v${f(h)}M${f(x + w / 2)},${f(y)}v${f(h)}M${f(x)},${f(y)}v${f(h)}" stroke="${pal.iron}" stroke-width="${f(1.3 * s)}"/>`;
  out += `<path d="M${f(x - w * 0.6)},${f(y + h)}h${f(w * 1.2)}v${f(3 * s)}h${f(-w * 1.2)}z" fill="${pal.iron}"/>`;
  return out;
}

// polyline helper with a bulge: quadratic sag between two points (ropes, chains, sagging rails)
export const sag = (a, b, s) => `M${r0(a[0])},${r0(a[1])}Q${r0((a[0] + b[0]) / 2)},${r0((a[1] + b[1]) / 2 + s)} ${r0(b[0])},${r0(b[1])}`;
export { pl, pz };

// Forest edge silhouette from x0 to x1 standing on `base`: a ragged mix of round crowns and spires,
// heights between hMin and hMax (noise-driven). Returns path data (closed down to `bottom`).
export function treeLine(R, x0, x1, base, hMin, hMax, bottom, { step = 22, spireP = 0.35 } = {}) {
  let d = `M${r0(x0)},${r0(bottom)}L${r0(x0)},${r0(base - hMin)}`;
  for (let x = x0; x < x1; x += step * R.range(0.7, 1.3)) {
    const h = R.range(hMin, hMax), w = step * R.range(0.9, 1.8);
    if (R() < spireP) {
      // a spire: jagged tiers up to a point
      const tip = base - h;
      d += `L${r0(x + w * 0.1)},${r0(tip + h * 0.5)}L${r0(x + w * 0.22)},${r0(tip + h * 0.42)}L${r0(x + w * 0.32)},${r0(tip + h * 0.22)}L${r0(x + w * 0.4)},${r0(tip + h * 0.26)}L${r0(x + w * 0.5)},${r0(tip)}L${r0(x + w * 0.6)},${r0(tip + h * 0.26)}L${r0(x + w * 0.68)},${r0(tip + h * 0.22)}L${r0(x + w * 0.78)},${r0(tip + h * 0.42)}L${r0(x + w * 0.9)},${r0(tip + h * 0.5)}`;
    } else {
      // a round crown: two or three bumps
      const top = base - h, n = R.int(2, 3);
      for (let k = 0; k < n; k++) { const xa = x + w * (k + 1) / n, rr = w / n * 0.62; d += `A${r0(rr)},${r0(rr * R.range(0.8, 1.1))} 0 0 1 ${r0(xa)},${r0(top + R.range(-h * 0.08, h * 0.12))}`; }
    }
  }
  return d + `L${r0(x1)},${r0(base - hMin)}L${r0(x1)},${r0(bottom)}Z`;
}

// A tapered limb along a quadratic curve p0 -> p1 (control c), width w0 at p0 to w1 at p1, as a filled path.
// Used for roots, branches and root stumps.
export function taper(p0, c, p1, w0, w1, n = 10) {
  const L = [], Rt = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, d = t * t;
    const x = a * p0[0] + b * c[0] + d * p1[0], y = a * p0[1] + b * c[1] + d * p1[1];
    const tx = 2 * (1 - t) * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0]), ty = 2 * (1 - t) * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1]);
    const l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l, w = (w0 + (w1 - w0) * t) / 2;
    L.push([x + nx * w, y + ny * w]); Rt.unshift([x - nx * w, y - ny * w]);
  }
  return pz([...L, ...Rt]);
}
