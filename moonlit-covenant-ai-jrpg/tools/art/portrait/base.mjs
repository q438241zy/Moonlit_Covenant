// Moonlit Covenant - parametric bust-portrait template.
//
// compose(heroine, { outfit }) -> self-contained SVG string (viewBox 0 0 832 1216).
// Heroine / outfit modules only supply layer functions `(p) => markup`; this file owns
// the shared canvas, body, head, face, lighting and the drawing helpers.
// See README.md in this folder for the full module contract.

export const W = 832;
export const H = 1216;
export const CX = 416;

// ---------------------------------------------------------------- numbers & paths
const r1 = (v) => {
  const x = Math.round(v * 10) / 10;
  return x === 0 ? 0 : x;
};
/** format a number with <=1 decimal */
export const n = (v) => String(r1(v));
/** format a point [x,y] as "x,y" */
export const pt = (p) => `${n(p[0])},${n(p[1])}`;
export const lerp = (a, b, t) => a + (b - a) * t;
export const lerpPt = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const near = (a, b) => Math.abs(a[0] - b[0]) < 0.06 && Math.abs(a[1] - b[1]) < 0.06;
const isSharp = (p) => p.length > 2 && !!p[2];

/** mirror a point / point list across the vertical centre line x = 416 (sharp flags kept) */
export const mirrorPt = (p) => (p.length > 2 ? [2 * CX - p[0], p[1], p[2]] : [2 * CX - p[0], p[1]]);
export const mirrorPts = (pts) => pts.map(mirrorPt);

/**
 * Smooth curve that passes THROUGH every point (Catmull-Rom -> cubic Bezier).
 * A point written [x, y, 1] is a sharp corner.
 */
export function smooth(pts, { closed = false, tension = 1 } = {}) {
  const N = pts.length;
  if (N < 2) return '';
  const get = (i) => (closed ? pts[(i + N) % N] : pts[clamp(i, 0, N - 1)]);
  let d = `M${pt(pts[0])}`;
  const segs = closed ? N : N - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const k = tension / 6;
    const c1 = isSharp(p1) ? p1 : [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2 = isSharp(p2) ? p2 : [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    // Catmull-Rom tangents are continuous at smooth points, so c1 is the mirror of the
    // previous c2 and the S shorthand applies (saves a third of the bytes)
    d += i > 0 && !isSharp(p1) ? `S${pt(c2)} ${pt(p2)}` : `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return closed ? `${d}Z` : d;
}

/**
 * Compact quadratic "control polygon" curve (TrueType style). Interior points are
 * CONTROL points (the curve passes through the midpoints between them); the first/last
 * point of an open path and any [x,y,1] sharp point are passed through exactly.
 * Emits Q/T shorthand, so it is ~2x smaller than smooth(). Ideal for dense generated outlines.
 */
export function smoothQ(pts, { closed = false } = {}) {
  let P = pts.slice();
  if (P.length < 2) return '';
  if (closed) {
    const s = P.findIndex(isSharp);
    if (s < 0) {
      // all controls: start on the midpoint between last and first
      const m0 = lerpPt(P[P.length - 1], P[0], 0.5);
      return emitQuad(m0, P, m0, true);
    }
    P = P.slice(s).concat(P.slice(0, s));
    return emitQuad(P[0], P.slice(1), P[0], true);
  }
  return emitQuad(P[0], P.slice(1, -1), P[P.length - 1], false);
}
function emitQuad(start, mids, end, close) {
  // split runs of controls at sharp points; inside a run every segment after the first is a
  // T (smooth quadratic) whose implied control lands within ~0.1px of the wanted control.
  const R = (q) => [r1(q[0]), r1(q[1])];
  let d = `M${pt(start)}`;
  let run = [];
  const flush = (target) => {
    if (!run.length) d += `L${pt(target)}`;
    else {
      let prev = R(run[0]);
      for (let i = 0; i < run.length; i++) {
        const last = i === run.length - 1;
        const e = last ? R(target) : R([(prev[0] + run[i + 1][0]) / 2, (prev[1] + run[i + 1][1]) / 2]);
        d += i === 0 ? `Q${pt(prev)} ${pt(e)}` : `T${pt(e)}`;
        if (!last) prev = [2 * e[0] - prev[0], 2 * e[1] - prev[1]];
      }
    }
    run = [];
  };
  for (const p of mids) {
    if (isSharp(p)) flush([p[0], p[1]]);
    else run.push(p);
  }
  flush(end);
  return close ? `${d}Z` : d;
}

/** densely sample a Catmull-Rom spline through pts (open). returns [[x,y],...] */
export function sampleSpline(pts, count = 24) {
  if (pts.length === 2) {
    return Array.from({ length: count }, (_, i) => lerpPt(pts[0], pts[1], i / (count - 1)));
  }
  const N = pts.length;
  const get = (i) => pts[clamp(i, 0, N - 1)];
  const fine = [];
  const per = 12;
  for (let i = 0; i < N - 1; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    for (let s = 0; s < per; s++) {
      const t = s / per, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      fine.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  fine.push(pts[N - 1].slice(0, 2));
  // resample evenly by arc length
  const L = [0];
  for (let i = 1; i < fine.length; i++) L.push(L[i - 1] + Math.hypot(fine[i][0] - fine[i - 1][0], fine[i][1] - fine[i - 1][1]));
  const total = L[L.length - 1] || 1;
  const out = [];
  let j = 0;
  for (let k = 0; k < count; k++) {
    const target = (total * k) / (count - 1);
    while (j < L.length - 2 && L[j + 1] < target) j++;
    const seg = L[j + 1] - L[j] || 1;
    out.push(lerpPt(fine[j], fine[j + 1], clamp((target - L[j]) / seg, 0, 1)));
  }
  return out;
}
export const pathLength = (pts) => {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return s;
};

/**
 * Generic ribbon around a centre line. offsets(t, i) -> [a, b]: distances along the
 * left normal for the two edges (a = left edge, b = right edge, b may be negative).
 * Returns a closed path (sharp tips where the width collapses to 0).
 */
export function ribbon(pts, offsets, { samples } = {}) {
  const len = pathLength(pts);
  const count = samples || clamp(Math.round(len / 13), 4, 15);
  const c = sampleSpline(pts, count);
  const L = [], R = [];
  for (let i = 0; i < count; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(count - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1;
    dx /= m; dy /= m;
    const nx = dy, ny = -dx; // left normal (screen coords)
    const [oa, ob] = offsets(i / (count - 1), i);
    L.push([c[i][0] + nx * oa, c[i][1] + ny * oa]);
    R.push([c[i][0] + nx * ob, c[i][1] + ny * ob]);
  }
  const w0 = Math.hypot(L[0][0] - R[0][0], L[0][1] - R[0][1]);
  const w1 = Math.hypot(L[count - 1][0] - R[count - 1][0], L[count - 1][1] - R[count - 1][1]);
  const out = [];
  if (w0 < 0.35) out.push([...lerpPt(L[0], R[0], 0.5), 1]);
  else out.push([...L[0], 1]);
  for (let i = 1; i < count - 1; i++) out.push(L[i]);
  if (w1 < 0.35) out.push([...lerpPt(L[count - 1], R[count - 1], 0.5), 1]);
  else { out.push([...L[count - 1], 1]); out.push([...R[count - 1], 1]); }
  for (let i = count - 2; i >= 1; i--) out.push(R[i]);
  if (w0 >= 0.35) out.push([...R[0], 1]);
  return smoothQ(out, { closed: true });
}

/** width profile: start/end are fractions of w, peak is the t of max width */
export function profile({ w = 4, start = 0.25, end = 0, peak = 0.35 } = {}) {
  return (t) => {
    if (t <= peak) return w * (start + (1 - start) * Math.sin(((peak ? t / peak : 1) * Math.PI) / 2));
    return w * (end + (1 - end) * Math.cos((((t - peak) / (1 - peak || 1)) * Math.PI) / 2));
  };
}

/**
 * Tapered brush stroke through pts (filled path). opts: { w, start, end, peak, bias, samples }
 * bias -1..1 shifts the stroke to the right(-) / left(+) side of the centre line.
 */
export function taper(pts, opts = {}) {
  const wf = typeof opts.width === 'function' ? opts.width : profile(opts);
  const bias = opts.bias || 0;
  // thin strokes need fewer samples than broad shapes (keeps files small)
  const samples = opts.samples || (typeof opts.width !== 'function' && (opts.w ?? 4) <= 6 ? clamp(Math.round(pathLength(pts) / 22), 4, 12) : undefined);
  return ribbon(pts, (t) => {
    const w = wf(t);
    return [(w * (1 + bias)) / 2, (-w * (1 - bias)) / 2];
  }, { samples });
}

/** centre line of a lock: root -> tip, bent sideways by `bend` px (positive = to the left of travel), optional tip curl */
export function lockLine(root, tip, bend = 0, curl = 0) {
  const dx = tip[0] - root[0], dy = tip[1] - root[1];
  const m = Math.hypot(dx, dy) || 1;
  const nx = dy / m, ny = -dx / m;
  const pts = [root.slice(0, 2)];
  for (const t of [0.33, 0.66]) {
    const b = Math.sin(t * Math.PI) * bend * 1.15;
    pts.push([root[0] + dx * t + nx * b, root[1] + dy * t + ny * b]);
  }
  if (curl) {
    const t = 0.9;
    pts.push([root[0] + dx * t + nx * (Math.sin(t * Math.PI) * bend + curl * 0.5), root[1] + dy * t + ny * (Math.sin(t * Math.PI) * bend + curl * 0.5)]);
    pts.push([tip[0] + nx * curl, tip[1] + ny * curl]);
  } else pts.push(tip.slice(0, 2));
  return pts;
}

/**
 * A pointed hair lock. Returns { d, shade, line, hi, center }:
 *  d      - full lock outline
 *  shade  - cel shadow on the side facing away from the moonlight (screen right / below)
 *  line   - thin strand-separation stroke along the lock
 *  hi     - lit-side highlight sliver between t = hi[0]..hi[1] (default 0.22..0.42)
 *  center - the centre-line points used
 * opts: { w=24, bend=0, curl=0, points (explicit centre line, overrides bend/curl), swell=0.3 (t of max width),
 *         start=0.85 (root width fraction), shadeWidth=0.5, shadeSide ('left' flips the auto side), lineOffset=0.15, hi=[t0,t1] }
 */
export function lock(root, tip, opts = {}) {
  const { w = 24, bend = 0, curl = 0, swell = 0.3, start = 0.85, shadeWidth = 0.5, lineOffset = 0.15 } = opts;
  const c = opts.points || lockLine(root, tip, bend, curl);
  const wf = profile({ w, start, end: 0, peak: swell });
  const d = ribbon(c, (t) => [wf(t) / 2, -wf(t) / 2]);
  // which side faces screen-right? use the mid normal
  const mid = sampleSpline(c, 5);
  const ddx = mid[3][0] - mid[1][0], ddy = mid[3][1] - mid[1][1];
  // s = +1 when the ribbon's left normal points to screen-right (true for strokes travelling down)
  let s = ddy >= 0 ? 1 : -1;
  if (Math.abs(ddy) < Math.abs(ddx) * 0.35) s = ddx >= 0 ? -1 : 1; // mostly horizontal: shade the lower side
  if (opts.shadeSide === 'left') s = -s;
  const sw = shadeWidth;
  const shade = ribbon(c, (t) => {
    const hw = wf(t) / 2;
    return s > 0 ? [hw, hw * (1 - sw * 2)] : [-hw * (1 - sw * 2), -hw];
  });
  const lo = lineOffset;
  const line = ribbon(c, (t) => {
    const hw = wf(t) / 2;
    const off = -s * hw * lo;
    const lw = Math.min(1.6, 0.3 + hw * 0.12) * Math.sin(Math.min(1, t * 1.6) * Math.PI * 0.5) * (1 - t * 0.6);
    return [off + lw, off - lw];
  });
  // lit-side highlight sliver between t = hi[0]..hi[1] (pieces of the angel ring)
  const [h0, h1] = Array.isArray(opts.hi) ? opts.hi : [0.22, 0.42];
  const sub = sampleSpline(c, 24).filter((_, i, a) => i / (a.length - 1) >= h0 && i / (a.length - 1) <= h1);
  const span = Math.max(1e-6, h1 - h0);
  const hiPath = sub.length > 2 ? ribbon(sub, (t) => {
    const hw = wf(h0 + t * span) / 2;
    const k = Math.sin(t * Math.PI) ** 1.3;
    return s > 0 ? [-hw * 0.14, -hw * (0.14 + 0.4 * k)] : [hw * (0.14 + 0.4 * k), hw * 0.14];
  }, { samples: 6 }) : '';
  return { d, shade, line, hi: hiPath, center: c };
}

/** mirror a path string (absolute or relative commands) across x = 416 */
export function mirrorPath(d) {
  const tok = d.match(/[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) || [];
  let out = '';
  let i = 0;
  let cmd = '';
  let first = true;
  const num = () => Number(tok[i++]);
  while (i < tok.length) {
    if (/[A-Za-z]/.test(tok[i])) {
      cmd = tok[i++];
      out += cmd;
      if (cmd === 'Z' || cmd === 'z') continue;
    } else out += ' ';
    const rel = cmd === cmd.toLowerCase();
    // absolute x mirrors around the centre; relative dx just flips sign (except a leading m)
    const X = (x) => n(rel && !(first && cmd === 'm') ? -x : 2 * CX - x);
    switch (cmd.toUpperCase()) {
      case 'M': case 'L': case 'T': out += `${X(num())},${n(num())}`; break;
      case 'H': out += X(num()); break;
      case 'V': out += n(num()); break;
      case 'C': out += `${X(num())},${n(num())} ${X(num())},${n(num())} ${X(num())},${n(num())}`; break;
      case 'S': case 'Q': out += `${X(num())},${n(num())} ${X(num())},${n(num())}`; break;
      case 'A': {
        const rx = num(), ry = num(), rot = num(), large = num(), sweep = num(), x = num(), y = num();
        out += `${n(rx)} ${n(ry)} ${n(-rot)} ${large} ${sweep ? 0 : 1} ${X(x)},${n(y)}`;
        break;
      }
      default: throw new Error(`mirrorPath: bad command ${cmd}`);
    }
    first = false;
  }
  return out;
}

// ---------------------------------------------------------------- colour
const hex = (c) => {
  let h = c.replace('#', '');
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  return [0, 2, 4].map((k) => parseInt(h.slice(k, k + 2), 16));
};
const toHex = (rgb) => `#${rgb.map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('')}`;
/** mix two #rrggbb colours (t = 0 -> a, 1 -> b) */
export const mix = (a, b, t) => {
  const A = hex(a), B = hex(b);
  return toHex(A.map((v, k) => v + (B[k] - v) * t));
};
export const darken = (c, t) => mix(c, '#000000', t);
export const lighten = (c, t) => mix(c, '#ffffff', t);

/** deterministic PRNG (mulberry32); seed may be a string */
export function rng(seed) {
  let a = typeof seed === 'string' ? [...seed].reduce((h, ch) => (Math.imul(h ^ ch.charCodeAt(0), 2654435761) >>> 0), 1779033703) : seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** escape a value for an XML attribute */
export const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// ---------------------------------------------------------------- template geometry
/** Named template coordinates. Every module may rely on these (see README). */
export const ANCHORS = Object.freeze({
  cx: CX,
  headTop: [416, 172], // top of an average hair volume
  skullTop: [416, 212], // top of the skull (skin)
  crownL: [330, 234], crownR: [502, 234], // upper skull corners (where a dome of hair turns down)
  hairlineY: 300, // natural hairline height at the centre
  foreheadY: 350, // middle of the forehead
  templeL: [268, 390], templeR: [564, 390],
  browL: [349, 398], browR: [483, 398],
  eyeY: 440, eyeL: [350, 440], eyeR: [482, 440], eyeW: 70,
  earL: [256, 452], earR: [576, 452], // ear centres (ears span y 416..494)
  cheekL: [320, 503], cheekR: [512, 503], // cheek / blush centres
  noseTip: [416, 506],
  mouth: [416, 559],
  jawL: [333, 566], jawR: [499, 566], // on the jaw line, halfway between ear and chin
  chin: [416, 615],
  neckL: [374, 600], neckR: [458, 600], neckW: 84, // neck sides just under the jaw
  neckBase: [416, 700],
  sternum: [416, 720], // jugular notch between the collarbones
  clavicleL: [296, 734], clavicleR: [536, 734],
  shoulderL: [188, 776], shoulderR: [644, 776], // top of the shoulder caps
  deltoidL: [150, 850], deltoidR: [682, 850], // widest point of the shoulders
  armpitL: [236, 912], armpitR: [596, 912],
  chestCenter: [416, 860],
  bustY: 900, underBustY: 975,
  waistL: [286, 1216], waistR: [546, 1216],
  armOuterL: [130, 1216], armOuterR: [702, 1216],
  armInnerL: [232, 1216], armInnerR: [600, 1216],
  bottomY: 1216,
});

const A = ANCHORS;
const FACE_L = [[416, 211], [360, 216], [312, 238], [281, 279], [267, 330], [263, 385], [265, 434], [270, 472], [281, 505], [298, 532], [321, 555], [346, 576], [370, 595], [392, 609], [416, 615]];
const JAW_PTS = FACE_L.slice(6).concat(mirrorPts(FACE_L.slice(6, -1)).reverse());
const faceOutlinePts = () => FACE_L.concat(mirrorPts(FACE_L.slice(1, -1)).reverse());
const BODY_L = [[378, 560], [375, 616], [371, 662], [364, 694], [336, 713], [284, 734], [228, 754], [192, 773], [166, 802], [150, 846], [140, 918], [134, 1010], [130, 1216, 1]];

/** Shared template shapes (path strings) exposed to modules as p.shapes */
export const SHAPES = Object.freeze({
  face: smooth(faceOutlinePts(), { closed: true }),
  body: smooth(BODY_L.concat(mirrorPts(BODY_L).reverse()), { closed: true }),
  // neck column; its top is hidden under the head
  neck: smooth([[378, 540], [375, 616], [371, 662], [364, 700, 1], [468, 700, 1], [461, 662], [457, 616], [454, 540]], { closed: true }),
  earL: 'M270,418C258,406 242,416 242,440C242,462 252,488 276,494Z',
  earR: mirrorPath('M270,418C258,406 242,416 242,440C242,462 252,488 276,494Z'),
  // inner armpit / sleeve seams (open paths) for sleeveless outfits
  armSeamL: smooth([[162, 830], [198, 870], [238, 912], [236, 1050], [234, 1216]]),
  armSeamR: mirrorPath(smooth([[162, 830], [198, 870], [238, 912], [236, 1050], [234, 1216]])),
  // trunk between the arms (clip vests, bodices, breastplates to it)
  torso: smooth([[364, 694], [334, 714], [278, 736], [236, 760], [236, 912, 1], [262, 1060], [286, 1216, 1], [546, 1216, 1], [570, 1060], [596, 912, 1], [596, 760], [554, 736], [498, 714], [468, 694]], { closed: true }),
});

// ---------------------------------------------------------------- defaults
export const DEFAULT_PALETTE = Object.freeze({
  accent: '#ff6b7c', accent2: '#ffd091',
  hair: '#6d4a7a', hairShadow: '#4a3058', hairDeep: '#2e1d3a', hairHighlight: '#a982b8', hairLine: '#24142e',
  eyeTop: '#3a2a55', eyeBottom: '#9f8ad8', eyeLine: '#1d1426', eyeGlow: null,
  eyeTopR: null, eyeBottomR: null, // optional second eye colour (heterochromia; R = viewer's right)
  skin: '#f9e3d6', skinShadow: '#e4aea9', skinDeep: '#c98b90', skinLine: '#9c5a5c', skinHighlight: '#fff4ec',
  blush: '#ff8796', lip: '#d27b7c', mouthLine: '#7c3439', brow: null, lash: null,
  eyeWhite: '#f8f4fc', eyeWhiteShadow: '#c9bfe2',
  bgTop: '#0c0b1b', bgMid: '#17132e', bgBottom: '#070614', moon: '#e8ddff', gold: '#ffd091',
});

/** expression presets (merged under heroine.expression) */
export const EYE_SHAPES = Object.freeze({
  almond: { open: 1, tilt: 2, lidDrop: 0, lowerLid: 0, iris: 1 },
  sharp: { open: 0.96, tilt: 4.5, lidDrop: 0.2, lowerLid: 0.12, iris: 1 },
  round: { open: 1.12, tilt: 0, lidDrop: 0, lowerLid: 0, iris: 1.06 },
  gentle: { open: 0.96, tilt: -3.5, lidDrop: 0.32, lowerLid: 0, iris: 1.02 },
  narrow: { open: 0.86, tilt: 3, lidDrop: 0.45, lowerLid: 0.2, iris: 0.98 },
});
export const DEFAULT_EXPRESSION = Object.freeze({
  eyeShape: 'almond', open: undefined, tilt: undefined, lidDrop: undefined, lowerLid: undefined, iris: undefined,
  gaze: [0, 0], // pupil offset, -1..1 each axis (x positive = viewer's right)
  browAngle: 0, // + = inner ends lower (stern / determined), - = worried
  browRaise: 0, // + = higher
  browWeight: 1, // thickness multiplier
  browsOverHair: 0.4, // opacity of the brows re-drawn over the bangs (anime convention); 0 = off
  mouth: 'neutral', // neutral | pressed | smile | grin | open | smirk | soft | frown
  mouthWidth: 1,
  blush: 0.35, // 0..1
  blushLines: true,
  lashWeight: 1,
  lashFlick: false, // one extra lash flick above the wing
  pupil: 'round', // 'round' | 'slit' (draconic / feline)
});

// ---------------------------------------------------------------- face feature drawing
function eyeGeom(ex, ey, e) {
  const top = ey - 20 * e.open + e.lidDrop * 7;
  const bot = ey + 16 * e.open - e.lowerLid * 5;
  const I = [ex + 35, ey + 5];
  const O = [ex - 36, ey + 2 - e.tilt];
  const upper = [I, [ex + 31, top + 10], [ex + 21, top + 2], [ex + 4, top], [ex - 14, top + 1.5 + e.tilt * 0.25], [ex - 27, (top + O[1]) / 2 - 0.5], O];
  const lower = [O, [ex - 24, bot - 4.5], [ex - 4, bot], [ex + 20, bot - 2.5], I];
  const wing = [O[0] - 11, O[1] - 2.5 - e.tilt * 0.5];
  return { top, bot, I, O, upper, lower, wing };
}

function drawEye(p, side, e, irisDetail) {
  const { palette: pal } = p;
  const ex = A.eyeL[0], ey = A.eyeY;
  const g = eyeGeom(ex, ey, e);
  const M = side === 'R' ? mirrorPath : (d) => d;
  const mx = side === 'R' ? (x) => 2 * CX - x : (x) => x;
  const opening = M(smooth(g.upper) + smooth(g.lower).replace(/^M[^C]+/, '') + 'Z');
  const clipId = p.id(`t-eye${side}`);
  p.def(`<clipPath id="${clipId}"><path d="${opening}"/></clipPath>`);
  const eyeTop = (side === 'R' && pal.eyeTopR) || pal.eyeTop;
  const eyeBottom = (side === 'R' && pal.eyeBottomR) || pal.eyeBottom;
  const glow = pal.eyeGlow || lighten(eyeBottom, 0.5);
  const irisFill = p.lin(`t-iris${side}`, [[0, darken(eyeTop, 0.35)], [0.3, eyeTop], [0.68, mix(eyeTop, eyeBottom, 0.7)], [1, eyeBottom]], [0, 0, 0, 1], 'objectBoundingBox');
  const whiteFill = p.lin('t-white', [[0, pal.eyeWhiteShadow], [0.5, pal.eyeWhite], [1, pal.eyeWhite]], [0, 0, 0, 1], 'objectBoundingBox');
  const icx = mx(ex) + e.gaze[0] * 7 + (side === 'R' ? -1 : 1); // irises sit 1px toward the nose
  const icy = ey + 0.5 + e.gaze[1] * 4;
  const rx = 17.2 * e.iris, ry = 20.5 * e.iris;
  const lash = pal.lash || pal.eyeLine;
  const ring = darken(eyeTop, 0.45);
  // upper-lid shadow band on the eyeball
  const lidShadowPts = g.upper.map(([x, y], i) => [x, y + (i === 0 || i === g.upper.length - 1 ? 0 : 8)]);
  const lidShadow = M(smooth(g.upper) + smooth(lidShadowPts.slice().reverse()).replace(/^M/, 'L') + 'Z');
  // lash band above the upper lid, thickening outwards and ending in a sharp wing
  const lashPts = [g.I, ...g.upper.slice(1, -1), g.O, g.wing];
  const lw = 6.6 * e.lashWeight;
  const lashD = M(ribbon(lashPts, (t) => {
    const w = t < 0.8 ? lerp(1.5, lw, Math.sin((t / 0.8) * Math.PI / 2) ** 1.3) : lw * Math.cos(((t - 0.8) / 0.2) * Math.PI / 2) ** 0.8 + 0.1;
    return [-1.2, w - 1.2]; // left normal of an I->O (right-to-left) path points up
  }, { samples: 18 }));
  // dark outer-corner wedge closing the eye, then a thin lower lash
  const cornerPts = [[g.O[0] - 1, g.O[1] - 0.5], [g.lower[1][0] - 2, g.lower[1][1] - 1], [g.lower[1][0] + 8, g.lower[1][1] + 2.5]];
  const corner = M(ribbon(cornerPts, (t) => [6.5 * (1 - t) ** 1.3 + 0.3, -(1.4 * Math.sin(Math.min(1, t * 2) * Math.PI / 2) * (1 - t) + 0.3)]));
  const flicks = M(taper([[g.O[0] + 10, g.O[1] - 6.5], [g.O[0] + 2, g.O[1] - 10.5], [g.O[0] - 3, g.O[1] - 12]], { w: 2.2 * e.lashWeight, start: 1, end: 0, peak: 0.05 }));
  const lowerLashPts = [[g.lower[1][0] - 2, g.lower[1][1] + 0.4], [g.lower[1][0] + 10, g.lower[1][1] + 3.6], [g.lower[2][0], g.lower[2][1] + 0.9], [g.lower[2][0] + 10, g.lower[2][1] + 0.3]];
  const lowerLash = M(ribbon(lowerLashPts, (t) => [0.3, -(1.7 * Math.cos(t * Math.PI / 2) + 0.15)]));
  const crease = M(taper([[ex - 18, g.top - 5], [ex, g.top - 8.5], [ex + 18, g.top - 6.5], [ex + 28, g.top]], { w: 1.7, start: 0.1, end: 0.15, peak: 0.45 }));
  const innerCorner = M(taper([[g.I[0] - 4, g.I[1] - 1.5], [g.I[0] + 1, g.I[1] + 0.5], [g.I[0] + 4, g.I[1] + 3]], { w: 2.2, start: 1, end: 0, peak: 0.2 }));
  // eyeshadow: soft skin-shadow band between the lash line and the crease
  const shadowPts = g.upper.slice(1, -1);
  const lidUp = smooth([[g.I[0] - 2, g.I[1] - 3], ...shadowPts.map(([x, y]) => [x, y - 3]), [g.O[0] + 3, g.O[1] - 4]])
    + smooth([[g.O[0] + 6, g.O[1] - 8], ...shadowPts.slice().reverse().map(([x, y], i, a) => [x, y - 9 - Math.sin(((i + 1) / (a.length + 1)) * Math.PI) * 3]), [g.I[0] - 4, g.I[1] - 7]]).replace(/^M/, 'L') + 'Z';
  const eyeshadow = M(lidUp);
  const rays = Array.from({ length: 10 }, (_, k) => {
    const a = (k / 10) * Math.PI * 2 + 0.3;
    return `M${pt([icx + Math.cos(a) * rx * 0.42, icy + 1 + Math.sin(a) * ry * 0.42])}L${pt([icx + Math.cos(a) * rx * 0.86, icy + 1 + Math.sin(a) * ry * 0.86])}`;
  }).join('');
  const crescent = `M${pt([icx - rx * 0.8, icy + ry * 0.25])}Q${pt([icx, icy + ry * 1.1])} ${pt([icx + rx * 0.8, icy + ry * 0.25])}Q${pt([icx, icy + ry * 0.66])} ${pt([icx - rx * 0.8, icy + ry * 0.25])}Z`;
  return `<g>`
    + `<path d="${eyeshadow}" fill="${pal.skinShadow}" opacity=".3"/>`
    + `<path d="${opening}" fill="${whiteFill}"/>`
    + `<g clip-path="url(#${clipId})">`
    + `<ellipse cx="${n(icx)}" cy="${n(icy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${irisFill}" stroke="${ring}" stroke-width="1.8"/>`
    + `<path d="${rays}" stroke="${darken(eyeTop, 0.3)}" stroke-width=".9" opacity=".18"/>`
    + `<ellipse cx="${n(icx)}" cy="${n(icy + 1)}" rx="${n(rx * 0.7)}" ry="${n(ry * 0.7)}" fill="none" stroke="${glow}" stroke-width="1.1" opacity=".3"/>`
    + `<path d="${crescent}" fill="${glow}" opacity=".6"/>`
    + `<ellipse cx="${n(icx)}" cy="${n(icy + 1)}" rx="${n((e.pupil === 'slit' ? 2.6 : 6.6) * e.iris)}" ry="${n((e.pupil === 'slit' ? 13 : 9.6) * e.iris)}" fill="${darken(eyeTop, 0.6)}"/>`
    + (irisDetail ? irisDetail({ side, cx: icx, cy: icy, rx, ry, eyeTop, eyeBottom, clip: `url(#${clipId})` }) : '')
    + `<path d="${lidShadow}" fill="${darken(eyeTop, 0.55)}" opacity=".42"/>`
    + `<ellipse cx="${n(icx - 6.5)}" cy="${n(icy - 7.5)}" rx="5.6" ry="6.8" fill="#fff"/>`
    + `<circle cx="${n(icx + 7)}" cy="${n(icy + 8.5)}" r="2.4" fill="#fff" opacity=".92"/>`
    + `</g>`
    + `<path d="${crease}" fill="${pal.skinLine}" opacity=".45"/>`
    + `<path d="${lowerLash}" fill="${mix(lash, pal.skinLine, 0.35)}" opacity=".9"/><path d="${corner}" fill="${lash}"/>`
    + `<path d="${innerCorner}" fill="${lash}" opacity=".75"/>`
    + `<path d="${lashD}${e.lashFlick ? flicks : ''}" fill="${lash}"/>`
    + `</g>`;
}

function browPath(side, e) {
  const by = A.browL[1] + 10 - e.browRaise * 8;
  const ang = e.browAngle;
  const pts = [[385, by + 4 + ang * 5], [367, by - 2 + ang * 2], [347, by - 4.5 + ang * 0.5], [328, by - 3.5 - ang * 1], [311, by + 1.5 - ang * 1.5]];
  const d = taper(pts, { w: 4 * e.browWeight, start: 0.55, end: 0.1, peak: 0.28 });
  return side === 'R' ? mirrorPath(d) : d;
}

function drawMouth(p, e) {
  const pal = p.palette;
  const mw = e.mouthWidth;
  const x0 = 416 - 19 * mw, x1 = 416 + 19 * mw, y = A.mouth[1];
  const line = pal.mouthLine;
  const lip = pal.lip;
  switch (e.mouth) {
    case 'pressed':
      return `<path d="${taper([[x0, y + 2.2], [x0 + 8, y + 0.4], [416, y - 0.4], [x1 - 8, y + 0.4], [x1, y + 2.4]], { w: 2.8, start: 0.35, end: 0.35, peak: 0.5 })}" fill="${line}"/>`
        + `<path d="${taper([[x0 - 1, y + 1.2], [x0 + 3, y + 2.6]], { w: 1.6, start: 1, end: 0.1, peak: 0.1 })}" fill="${line}" opacity=".6"/>`
        + `<path d="M${pt([406, y + 6.5])}Q${pt([416, y + 10.5])} ${pt([426, y + 6.5])}Q${pt([416, y + 8.2])} ${pt([406, y + 6.5])}Z" fill="${pal.skinShadow}" opacity=".9"/>`;
    case 'smile':
      return `<path d="${taper([[x0 - 2, y - 3], [x0 + 8, y + 2], [416, y + 3.6], [x1 - 8, y + 2], [x1 + 2, y - 3]], { w: 2.8, start: 0.4, end: 0.4, peak: 0.5 })}" fill="${line}"/>`
        + `<path d="M${pt([408, y + 9])}Q${pt([416, y + 12])} ${pt([424, y + 9])}Q${pt([416, y + 10.4])} ${pt([408, y + 9])}Z" fill="${pal.skinShadow}"/>`;
    case 'grin': {
      const d = `M${pt([x0 - 3, y - 4])}Q${pt([416, y - 1])} ${pt([x1 + 3, y - 4])}Q${pt([x1 - 3, y + 13])} ${pt([416, y + 15])}Q${pt([x0 + 3, y + 13])} ${pt([x0 - 3, y - 4])}Z`;
      return `<path d="${d}" fill="${darken(lip, 0.45)}" stroke="${line}" stroke-width="2.2" stroke-linejoin="round"/>`
        + `<path d="M${pt([x0 + 2, y - 2])}Q${pt([416, y + 1])} ${pt([x1 - 2, y - 2])}L${pt([x1 - 5, y + 2])}Q${pt([416, y + 4])} ${pt([x0 + 5, y + 2])}Z" fill="#fff"/>`
        + `<path d="M${pt([404, y + 12])}Q${pt([416, y + 6])} ${pt([428, y + 12])}Q${pt([416, y + 15])} ${pt([404, y + 12])}Z" fill="${lighten(lip, 0.15)}"/>`;
    }
    case 'open':
      return `<ellipse cx="416" cy="${n(y + 3)}" rx="${n(8 * mw)}" ry="6.5" fill="${darken(lip, 0.4)}" stroke="${line}" stroke-width="2"/>`
        + `<path d="M${pt([410, y + 7])}Q${pt([416, y + 4])} ${pt([422, y + 7])}Q${pt([416, y + 9.5])} ${pt([410, y + 7])}Z" fill="${lighten(lip, 0.15)}"/>`;
    case 'smirk':
      return `<path d="${taper([[x0 + 2, y + 1.5], [x0 + 10, y + 1.2], [416, y + 0.6], [x1 - 8, y - 0.8], [x1 + 2, y - 4.5]], { w: 2.8, start: 0.35, end: 0.4, peak: 0.55 })}" fill="${line}"/>`
        + `<path d="M${pt([407, y + 7])}Q${pt([416, y + 10])} ${pt([425, y + 6.5])}Q${pt([416, y + 8.4])} ${pt([407, y + 7])}Z" fill="${pal.skinShadow}"/>`;
    case 'soft':
      return `<path d="${taper([[x0 + 1, y + 1.2], [x0 + 9, y + 0.2], [416, y + 0.8], [x1 - 9, y + 0.2], [x1 - 1, y + 1.2]], { w: 2.4, start: 0.3, end: 0.3, peak: 0.5 })}" fill="${line}"/>`
        + `<path d="M${pt([409, y + 2.2])}Q${pt([416, y + 5.2])} ${pt([423, y + 2.2])}Z" fill="${darken(lip, 0.25)}" opacity=".7"/>`
        + `<path d="M${pt([406, y + 7.5])}Q${pt([416, y + 11])} ${pt([426, y + 7.5])}Q${pt([416, y + 9.2])} ${pt([406, y + 7.5])}Z" fill="${pal.skinShadow}"/>`;
    case 'frown':
      return `<path d="${taper([[x0, y + 4], [x0 + 9, y + 0.5], [416, y - 0.5], [x1 - 9, y + 0.5], [x1, y + 4]], { w: 2.6, start: 0.35, end: 0.35, peak: 0.5 })}" fill="${line}"/>`
        + `<path d="M${pt([407, y + 7])}Q${pt([416, y + 10])} ${pt([425, y + 7])}Q${pt([416, y + 8.4])} ${pt([407, y + 7])}Z" fill="${pal.skinShadow}"/>`;
    default: // neutral
      return `<path d="${taper([[x0 + 1, y + 1], [x0 + 9, y + 0.4], [416, y + 1.2], [x1 - 9, y + 0.4], [x1 - 1, y + 1]], { w: 2.6, start: 0.3, end: 0.3, peak: 0.5 })}" fill="${line}"/>`
        + `<path d="M${pt([407, y + 7])}Q${pt([416, y + 10.5])} ${pt([425, y + 7])}Q${pt([416, y + 8.6])} ${pt([407, y + 7])}Z" fill="${pal.skinShadow}"/>`;
  }
}

function drawFace(p, e, irisDetail) {
  const pal = p.palette;
  const brow = pal.brow || mix(pal.hairLine, pal.hairShadow, 0.35);
  const blushFill = p.rad('t-blush', [[0, pal.blush, 0.55 * e.blush], [1, pal.blush, 0]], { cx: 0.5, cy: 0.5, r: 0.5 }, 'objectBoundingBox');
  let s = '';
  // blush
  if (e.blush > 0) {
    s += `<ellipse cx="320" cy="503" rx="36" ry="17" fill="${blushFill}"/><ellipse cx="512" cy="503" rx="36" ry="17" fill="${blushFill}"/>`;
    if (e.blushLines) {
      const hatch = (x) => [0, 1, 2].map((k) => taper([[x + k * 9, 496], [x + k * 9 - 5, 508]], { w: 1.5, start: 0.2, end: 0.2, peak: 0.5 })).join('');
      s += `<path d="${hatch(312)}${mirrorPath(hatch(312))}" fill="${mix(pal.blush, pal.skinLine, 0.4)}" opacity="${n(0.45 * e.blush + 0.1)}"/>`;
    }
  }
  // nose: soft side shadow + tiny tick
  s += `<path d="M419,488Q425,498 424,506Q420,508.5 416,508Q421,500 419,488Z" fill="${pal.skinShadow}" opacity=".6"/>`;
  s += `<path d="${taper([[421, 501], [423, 506], [416, 509.5]], { w: 2.3, start: 0.2, end: 0.15, peak: 0.55 })}" fill="${pal.skinLine}" opacity=".85"/>`;
  s += `<ellipse cx="413" cy="497" rx="2.2" ry="1.2" fill="${pal.skinHighlight}" opacity=".7"/>`;
  // mouth
  s += drawMouth(p, e);
  // brows
  s += `<path d="${browPath('L', e)}${browPath('R', e)}" fill="${brow}"/>`;
  // eyes
  s += drawEye(p, 'L', e, irisDetail) + drawEye(p, 'R', e, irisDetail);
  return s;
}

// ---------------------------------------------------------------- template body & head
function drawBody(p) {
  const pal = p.palette;
  const skinGrad = p.lin('t-skinBody', [[0, pal.skin], [0.55, mix(pal.skin, pal.skinShadow, 0.25)], [1, pal.skinShadow]], [0, 560, 0, 1000]);
  const neckShadow = smooth([[372, 540], [460, 540], [462, 622], [440, 646], [416, 652], [392, 646], [370, 622]], { closed: true });
  const neckSide = smooth([[446, 600], [458, 600], [462, 662], [470, 700, 1], [438, 706, 1], [448, 664]], { closed: true });
  const clav = taper([[400, 722], [372, 728], [340, 732], [300, 736]], { w: 2.4, start: 0.4, end: 0, peak: 0.3 });
  return `<use href="#${p.id('t-bodyShape')}" fill="${skinGrad}"/>`
    + `<path d="${neckShadow}" fill="${pal.skinShadow}"/>`
    + `<path d="${neckSide}" fill="${pal.skinShadow}" opacity=".8"/>`
    + `<path d="M416,700Q402,712 400,722Q416,716 432,722Q430,712 416,700Z" fill="${pal.skinShadow}" opacity=".6"/>`
    + `<path d="${clav}${mirrorPath(clav)}" fill="${pal.skinLine}" opacity=".35"/>`
    + `<path d="${SHAPES.armSeamL}${SHAPES.armSeamR}" fill="none" stroke="${pal.skinLine}" stroke-width="2" opacity=".35"/>`
    + `<path d="${smooth(BODY_L.slice(3, 12))}${mirrorPath(smooth(BODY_L.slice(3, 12)))}" fill="none" stroke="${pal.skinLine}" stroke-width="3" opacity=".7"/>`
    + `<path d="${smooth(BODY_L.slice(1, 4))}${mirrorPath(smooth(BODY_L.slice(1, 4)))}" fill="none" stroke="${pal.skinLine}" stroke-width="2.6" opacity=".75"/>`;
}

function drawHead(p, showEars) {
  const pal = p.palette;
  let s = '';
  if (showEars) {
    const inner = 'M266,430C258,426 252,434 254,448C256,462 262,474 270,478';
    s += `<path d="${SHAPES.earL}" fill="${pal.skin}" stroke="${pal.skinLine}" stroke-width="2.4" stroke-linejoin="round"/>`
      + `<path d="${inner}" fill="none" stroke="${pal.skinLine}" stroke-width="2" opacity=".7"/>`
      + `<path d="M262,438C256,446 258,462 266,470L270,460C264,454 264,446 268,440Z" fill="${pal.skinShadow}"/>`
      + `<path d="${SHAPES.earR}" fill="${mix(pal.skin, pal.skinShadow, 0.55)}" stroke="${pal.skinLine}" stroke-width="2.4" stroke-linejoin="round"/>`
      + `<path d="${mirrorPath(inner)}" fill="none" stroke="${pal.skinLine}" stroke-width="2" opacity=".7"/>`
      + `<path d="${mirrorPath('M262,438C256,446 258,462 266,470L270,460C264,454 264,446 268,440Z')}" fill="${pal.skinDeep}" opacity=".6"/>`;
  }
  const faceGrad = p.lin('t-skinFace', [[0, pal.skinHighlight], [0.35, pal.skin], [1, mix(pal.skin, pal.skinShadow, 0.35)]], [300, 330, 520, 610]);
  s += `<use href="#${p.id('t-faceShape')}" fill="${faceGrad}"/>`;
  // cel shadow down the right side of the face (moonlight comes from upper-left)
  const cheekShadow = smooth([[572, 360], [569, 400], [567, 438], [562, 474], [549, 510], [531, 532], [510, 552], [487, 572], [464, 592], [441, 608], [418, 616, 1], [440, 598], [466, 576], [492, 550], [514, 524], [532, 494], [543, 466], [548, 440], [551, 400], [556, 360]], { closed: true });
  s += `<g clip-path="url(#${p.id('t-faceClip')})"><path d="${cheekShadow}" fill="${pal.skinShadow}" opacity=".7"/></g>`;
  // jaw line: one continuous tapered stroke, heavier on the shadow (right) side
  const jaw = JAW_PTS;
  s += `<path d="${ribbon(jaw, (t) => {
    const w = (1.7 + 2 * t) * Math.sin(Math.min(1, t / 0.12) * Math.PI / 2) * Math.sin(Math.min(1, (1 - t) / 0.12) * Math.PI / 2);
    return [w / 2, -w / 2];
  }, { samples: 22 })}" fill="${pal.skinLine}"/>`;
  return s;
}

// ---------------------------------------------------------------- background & light
function drawBackground(p, motif) {
  const pal = p.palette;
  const bg = p.lin('t-bg', [[0, pal.bgTop], [0.55, pal.bgMid], [1, pal.bgBottom]], [0, 0, 0, 1216]);
  const glow = p.rad('t-bgglow', [[0, pal.accent, 0.22], [0.55, pal.accent, 0.07], [1, pal.accent, 0]], { cx: 430, cy: 420, r: 430 });
  const rand = rng(`${p.heroine.id}-stars`);
  const groups = [[], [], []];
  for (let i = 0; i < 60; i++) {
    const x = rand() * W, y = rand() * 900, k = Math.floor(rand() * 3);
    groups[k].push(`M${n(x)},${n(y)}h0`);
  }
  const stars = groups.map((g, k) => `<path d="${g.join('')}" stroke-width="${[1.6, 2.4, 3.2][k]}" opacity="${[0.45, 0.3, 0.18][k]}"/>`).join('');
  return `<rect width="${W}" height="${H}" fill="${bg}"/>`
    + `<rect width="${W}" height="${H}" fill="${glow}"/>`
    + `<g stroke="${pal.moon}" stroke-linecap="round" fill="none">${stars}</g>`
    + motif
    + `<rect y="${H * 0.62}" width="${W}" height="${H * 0.38}" fill="${p.lin('t-bgfade', [[0, pal.bgBottom, 0], [1, pal.bgBottom, 0.9]], [0, 0, 0, 1], 'objectBoundingBox')}"/>`;
}

function drawLighting(p) {
  const pal = p.palette;
  const moon = p.lin('t-moonwash', [[0, pal.moon, 0.16], [0.45, pal.moon, 0], [1, pal.moon, 0]], [0, 0, 760, 900]);
  const ambient = p.lin('t-ambient', [[0, '#0e1a3a', 0], [0.6, '#0e1a3a', 0], [1, '#0e1a3a', 0.35]], [120, 300, 832, 1100]);
  const fade = p.lin('t-fade', [[0, pal.bgBottom, 0], [0.55, pal.bgBottom, 0.55], [1, pal.bgBottom, 0.93]], [0, 0, 0, 1], 'objectBoundingBox');
  const vig = p.rad('t-vig', [[0, '#000', 0], [0.62, '#000', 0], [1, '#000', 0.55]], { cx: 0.5, cy: 0.42, r: 0.78 }, 'objectBoundingBox');
  return `<rect width="${W}" height="${H}" fill="${moon}"/>`
    + `<rect width="${W}" height="${H}" fill="${ambient}"/>`
    + `<rect y="${H * 0.8}" width="${W}" height="${H * 0.2 + 1}" fill="${fade}"/>`
    + `<rect width="${W}" height="${H}" fill="${vig}"/>`;
}

// ---------------------------------------------------------------- composer
function makeContext(prefix) {
  const defs = new Map();
  return { prefix, defs };
}

function makeP(ctx, heroine, palette, expression, ns, outfit) {
  const id = (name) => `${ctx.prefix}-${ns ? `${ns}-` : ''}${name}`;
  const def = (markup) => {
    const m = markup.match(/id="([^"]+)"/);
    const key = m ? m[1] : `anon${ctx.defs.size}`;
    const prev = ctx.defs.get(key);
    if (prev !== undefined && prev !== markup) console.warn(`[portrait] ${ctx.prefix}: <defs> id "${key}" registered twice with different content (last one wins)`);
    ctx.defs.set(key, markup);
    return '';
  };
  const stopsXml = (stops) => stops.map(([o, c, op]) => `<stop offset="${n(o)}" stop-color="${c}"${op !== undefined && op !== 1 ? ` stop-opacity="${n(op * 100) / 100}"` : ''}/>`).join('');
  const lin = (name, stops, [x1, y1, x2, y2] = [0, 0, 0, 1], units = 'userSpaceOnUse') => {
    const gid = id(name);
    def(`<linearGradient id="${gid}" x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}"${units === 'userSpaceOnUse' ? ' gradientUnits="userSpaceOnUse"' : ''}>${stopsXml(stops)}</linearGradient>`);
    return `url(#${gid})`;
  };
  const rad = (name, stops, { cx = 0.5, cy = 0.5, r = 0.5, fx, fy } = {}, units = 'userSpaceOnUse') => {
    const gid = id(name);
    const f = fx !== undefined ? ` fx="${n(fx)}" fy="${n(fy)}"` : '';
    def(`<radialGradient id="${gid}" cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}"${f}${units === 'userSpaceOnUse' ? ' gradientUnits="userSpaceOnUse"' : ''}>${stopsXml(stops)}</radialGradient>`);
    return `url(#${gid})`;
  };
  const clip = (name, d) => {
    const cid = id(name);
    const ds = Array.isArray(d) ? d : [d];
    def(`<clipPath id="${cid}">${ds.map((x) => `<path d="${x}"/>`).join('')}</clipPath>`);
    return `url(#${cid})`;
  };
  const T = (name) => `${ctx.prefix}-t-${name}`; // template-owned ids
  return {
    heroine: { id: heroine.id, name: heroine.name },
    costume: outfit ? outfit.type : null, // outfit type being rendered, or null for the default portrait
    palette,
    expression,
    anchors: ANCHORS,
    shapes: SHAPES,
    id,
    url: (name) => `url(#${id(name)})`,
    def,
    lin,
    rad,
    clip,
    rand: rng(`${ctx.prefix}-${ns || 'h'}`),
    refs: {
      faceShape: `#${T('faceShape')}`, // href of the face silhouette path (for <use>)
      bodyShape: `#${T('bodyShape')}`, // href of the body silhouette path (for <use>)
      faceClip: `url(#${T('faceClip')})`,
      bodyClip: `url(#${T('bodyClip')})`,
      torsoClip: `url(#${T('torsoClip')})`,
      soft: `url(#${T('soft')})`, // gaussian blur 6px (soft shadows, blush, haze)
      glow: `url(#${T('glow')})`, // bloom: source + blurred copy (crystals, embers, magic)
    },
    helpers: HELPERS,
  };
}

export const HELPERS = Object.freeze({
  n, pt, lerp, lerpPt, clamp, smooth, smoothQ, sampleSpline, ribbon, profile, taper, lock, lockLine,
  mirrorPath, mirrorPt, mirrorPts, mix, darken, lighten, rng, attr, pathLength,
  /** render a lock list with outline, cel shade and strand lines. See README. */
  locks(list, { fill, shade, line, stroke, highlight, strokeWidth = 2.2, lineOpacity = 0.55, shadeOpacity = 1, hiOpacity = 0.8, hi = false } = {}) {
    let out = '';
    for (const L of list) {
      const { root, tip, ...o } = L;
      const k = lock(root, tip, o);
      out += `<path d="${k.d}" fill="${L.fill || fill}" stroke="${L.stroke || stroke}" stroke-width="${n(L.strokeWidth || strokeWidth)}" stroke-linejoin="round"/>`;
      if (!L.noShade) out += `<path d="${k.shade}" fill="${L.shadeFill || shade}" opacity="${n(L.shadeOpacity ?? shadeOpacity)}"/>`;
      if (!L.noLine) out += `<path d="${k.line}" fill="${L.lineFill || line}" opacity="${n(L.lineOpacity ?? lineOpacity)}"/>`;
      if ((L.hi || hi) && highlight && !L.noHi) out += `<path d="${k.hi}" fill="${L.hiFill || highlight}" opacity="${n(L.hiOpacity ?? hiOpacity)}"/>`;
    }
    return out;
  },
});

const LAYER_KEYS = ['bgMotif', 'hairBack', 'bodyBack', 'outfit', 'neckAccessory', 'faceMarks', 'headBack', 'hairFront', 'headFront', 'foreground'];
const OUTFIT_SLOTS = ['bodyBack', 'neckAccessory', 'headBack', 'headFront', 'foreground'];

let layerErrors = null;
function safeLayer(fn, p, label) {
  if (typeof fn !== 'function') return '';
  try {
    const out = fn(p);
    if (typeof out !== 'string') throw new Error(`returned ${typeof out}, expected an SVG markup string`);
    return out;
  } catch (err) {
    if (layerErrors) layerErrors.push(`${label}: ${err.message}`);
    return '';
  }
}

/**
 * Compose a full portrait SVG.
 * @param heroine heroine module (see README)
 * @param opts.outfit optional outfit module { type, label, render(p), hairOrnament?(p), bodyBack?(p), neckAccessory?(p), headBack?(p), headFront?(p), foreground?(p), bgMotif?(p), hide?: string[] }
 * @param opts.prefix id prefix override (default heroine.id or `${heroine.id}-${outfit.type}`)
 * @param opts.lenient when true a throwing layer is skipped with a console warning; by default
 *        compose() throws so the build never writes a half-drawn portrait (e.g. a costume without clothes)
 */
export function compose(heroine, { outfit, prefix, lenient = false } = {}) {
  if (!heroine || !heroine.id) throw new Error('compose: heroine.id required');
  layerErrors = [];
  try {
    const svg = composeInner(heroine, outfit, prefix);
    if (layerErrors.length) {
      if (!lenient) throw new Error(`layer error(s): ${layerErrors.join('; ')}`);
      for (const e of layerErrors) console.warn(`[portrait] layer ${e}`);
    }
    return svg;
  } finally {
    layerErrors = null;
  }
}

function composeInner(heroine, outfit, prefix) {
  const pre = prefix || (outfit ? `${heroine.id}-${outfit.type}` : heroine.id);
  const ctx = makeContext(pre);
  const palette = { ...DEFAULT_PALETTE, ...(heroine.palette || {}) };
  if (!palette.brow) palette.brow = mix(palette.hairLine, palette.hairShadow, 0.35);
  if (!palette.lash) palette.lash = palette.eyeLine;
  const ex = { ...DEFAULT_EXPRESSION, ...(heroine.expression || {}) };
  const preset = EYE_SHAPES[ex.eyeShape] || EYE_SHAPES.almond;
  for (const k of Object.keys(preset)) if (ex[k] === undefined) ex[k] = preset[k];
  const layers = heroine.layers || {};
  const p = makeP(ctx, heroine, palette, ex, '', outfit);
  const po = outfit ? makeP(ctx, heroine, palette, ex, 'o', outfit) : null;
  const costumeLayers = new Set(heroine.costumeLayers || ['bodyBack', 'neckAccessory']);
  const hidden = new Set(outfit?.hide || []);
  // Layer resolution (see README "Outfits"):
  //  - no outfit: the heroine's layer
  //  - 'outfit': outfit.render(po) replaces heroine.layers.outfit
  //  - heroine.costumeLayers (default bodyBack + neckAccessory) belong to her default costume and are
  //    dropped when an outfit is worn; outfit.hide drops further heroine layers (e.g. 'foreground')
  //  - outfit.bgMotif replaces the heroine's background motif when given
  //  - outfit.bodyBack / neckAccessory / headBack / headFront / foreground are drawn after the
  //    heroine's own layer of the same slot (or instead of it, when that layer was dropped)
  const L = (key) => {
    if (key === 'outfit') return outfit ? safeLayer(outfit.render, po, `${outfit.type}.render`) : safeLayer(layers.outfit, p, `${heroine.id}.outfit`);
    if (outfit && key === 'bgMotif' && typeof outfit.bgMotif === 'function') return safeLayer(outfit.bgMotif, po, `${outfit.type}.bgMotif`);
    const dropped = outfit && (costumeLayers.has(key) || hidden.has(key));
    let s = dropped ? '' : safeLayer(layers[key], p, `${heroine.id}.${key}`);
    if (outfit && OUTFIT_SLOTS.includes(key)) s += safeLayer(outfit[key], po, `${outfit.type}.${key}`);
    return s;
  };

  const T = (name) => `${pre}-t-${name}`;
  // template-owned defs
  p.def(`<path id="${T('faceShape')}" d="${SHAPES.face}"/>`);
  p.def(`<path id="${T('bodyShape')}" d="${SHAPES.body}"/>`);
  p.def(`<clipPath id="${T('faceClip')}"><use href="#${T('faceShape')}"/></clipPath>`);
  p.def(`<clipPath id="${T('bodyClip')}"><use href="#${T('bodyShape')}"/></clipPath>`);
  p.def(`<clipPath id="${T('torsoClip')}"><path d="${SHAPES.torso}"/></clipPath>`);
  p.def(`<filter id="${T('soft')}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>`);
  p.def(`<filter id="${T('glow')}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`);
  p.def(`<filter id="${T('cast')}" x="-5%" y="-5%" width="110%" height="120%"><feOffset in="SourceAlpha" dx="4" dy="13" result="o"/><feFlood flood-color="${palette.skinShadow}"/><feComposite in2="o" operator="in"/></filter>`);
  p.def(`<filter id="${T('rim')}" x="-3%" y="-3%" width="106%" height="106%" color-interpolation-filters="sRGB">`
    + `<feOffset in="SourceAlpha" dx="-6" dy="2" result="o1"/><feComposite in="SourceAlpha" in2="o1" operator="out" result="e1"/><feGaussianBlur in="e1" stdDeviation=".9" result="b1"/><feFlood flood-color="${palette.accent}" flood-opacity=".95"/><feComposite in2="b1" operator="in" result="r1"/>`
    + `<feOffset in="SourceAlpha" dx="5" dy="6" result="o2"/><feComposite in="SourceAlpha" in2="o2" operator="out" result="e2"/><feGaussianBlur in="e2" stdDeviation="1.2" result="b2"/><feFlood flood-color="${palette.moon}" flood-opacity=".5"/><feComposite in2="b2" operator="in" result="r2"/>`
    + `<feMerge><feMergeNode in="r2"/><feMergeNode in="r1"/></feMerge><feComposite in2="SourceAlpha" operator="in"/></filter>`);

  const showEars = heroine.face?.ears !== false;
  const hairFront = L('hairFront');
  p.def(`<g id="${T('hairFront')}">${hairFront}</g>`);
  const browsGhost = ex.browsOverHair > 0
    ? `<path d="${browPath('L', ex)}${browPath('R', ex)}" fill="${palette.brow}" opacity="${n(ex.browsOverHair)}"/>` : '';

  const figure = L('hairBack')
    + L('bodyBack')
    + drawBody(p)
    + L('outfit')
    + L('neckAccessory')
    + drawHead(p, showEars)
    + `<g clip-path="url(#${T('faceClip')})" opacity="${n(heroine.face?.castShadow ?? 0.8)}"><use href="#${T('hairFront')}" filter="url(#${T('cast')})"/></g>`
    + drawFace(p, ex, typeof layers.irisDetail === 'function' ? (eye) => safeLayer(layers.irisDetail, { ...p, eye }, `${heroine.id}.irisDetail`) : null)
    + L('faceMarks')
    + L('headBack')
    + `<use href="#${T('hairFront')}"/>`
    + browsGhost
    + L('headFront')
    + (outfit ? safeLayer(outfit.hairOrnament, po, `${outfit.type}.hairOrnament`) : '')
    + L('foreground');

  const bgMarkup = drawBackground(p, L('bgMotif'));
  const lighting = drawLighting(p);
  const title = outfit ? `${heroine.name || heroine.id} - ${outfit.label || outfit.type}` : heroine.name || heroine.id;
  const defs = [...ctx.defs.values()].join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${attr(title)}">`
    + `<defs>${defs}</defs>`
    + bgMarkup
    + `<g id="${T('figure')}">${figure}</g>`
    + `<use href="#${T('figure')}" filter="url(#${T('rim')})"/>`
    + lighting
    + `</svg>`;
}

export const LAYERS = LAYER_KEYS;
