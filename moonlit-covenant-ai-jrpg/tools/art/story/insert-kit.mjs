// Shared painters for the story inserts (道具特写叠图, tools/art/story/inserts.mjs): an 800×600 card shown over the scene
// while a line describes the prop (docs/STORY-ENGINE.md §3 `insert`). Same rules as the backgrounds: no text, prefixed ids,
// ≤ 4 filters. Handwriting and print are drawn as scribble strokes, never letters — the words stay in the line's text.
import { Scene, f, rng, mix, star7 } from './lib.mjs';

export const IW = 800, IH = 600;
export { f, rng, mix, star7 };
export const f1 = (v) => f(v, 1);
export const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;
export const rect = (x, y, w, h) => `M${f1(x)},${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}z`;
export const pts = (list) => 'M' + list.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L');
export const ptz = (list) => pts(list) + 'Z';

export function card(p, label, seed) { return new Scene(p, label, seed, IW, IH); }

// backdrop: a dark surface with a soft pool of light where the prop lies
const GROUNDS = {
  wood: ['#3a2a1e', '#1a120c'], stone: ['#3a3a42', '#141418'], night: ['#1c1a2e', '#07060e'], ice: ['#2a4a5e', '#0c1822'],
  ember: ['#4a2014', '#140806'], cloth: ['#2e2238', '#0e0a14'], sea: ['#1a3040', '#06101a'], mist: ['#4a4a58', '#1a1a24'], gold: ['#4a3a1a', '#140e06'],
};
export function ground(S, kind = 'wood', { light = [0.5, 0.45], grain = true } = {}) {
  const [a, b] = GROUNDS[kind] || GROUNDS.wood;
  S.add(`<rect width="${IW}" height="${IH}" fill="${b}"/>`);
  S.add(`<rect width="${IW}" height="${IH}" fill="${S.rad([[0, a], [1, b]], `cx="${light[0]}" cy="${light[1]}" r="0.7"`)}"/>`);
  if (grain && kind === 'wood') {
    const R = S.R;
    let d = '';
    for (let y = 18; y < IH; y += R.range(18, 34)) { let x = 0, yy = y; d += `M0,${f1(yy)}`; while (x < IW) { x += R.range(40, 90); yy += R.range(-3, 3); d += `L${f1(x)},${f1(yy)}`; } }
    S.add(`<path d="${d}" fill="none" stroke="#000" stroke-width="2" opacity=".18"/>`);
  }
}
export function vignette(S, a = 0.6) {
  S.add(`<rect width="${IW}" height="${IH}" fill="${S.rad([[0, '#000', 0], [0.62, '#000', a * 0.25], [1, '#000', a]], 'cx="0.5" cy="0.5" r="0.72"')}"/>`);
}
// a sheet of paper as a polygon (corner list) with a warm gradient, a darker edge and an optional burnt / wet look
export function paper(S, corners, { tint = '#efe4c8', edge = '#b8a27a', burnt = false, wet = false, shadow = true } = {}) {
  const d = ptz(corners);
  if (shadow) S.add(`<path d="${d}" fill="#000" opacity=".45" transform="translate(10 14)" filter="${S.blur(2)}"/>`);
  S.add(`<path d="${d}" fill="${S.lin([[0, mix(tint, '#ffffff', 0.25)], [1, mix(tint, edge, 0.35)]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<path d="${d}" fill="none" stroke="${edge}" stroke-width="3" opacity=".7"/>`);
  if (burnt) S.add(`<path d="${d}" fill="none" stroke="#2a160a" stroke-width="16" opacity=".55" filter="${S.blur(1)}"/>`);
  if (wet) {
    const R = S.R;
    for (let k = 0; k < 4; k++) {
      const [x0, y0] = corners[0], [x2, y2] = corners[2];
      const x = R.range(Math.min(x0, x2), Math.max(x0, x2)), y = R.range(Math.min(y0, y2), Math.max(y0, y2));
      S.add(`<path d="${ell(x, y, R.range(30, 70), R.range(20, 46))}" fill="${edge}" opacity=".18"/>`);
    }
  }
}
// rows of handwriting as wavy scribbles (no letters). (x, y) = first row start, w = row width
export function writing(R, x, y, w, rows, lh = 26, { col = '#3a2a1e', sw = 2.4, op = 0.85, last = 1, slope = 0 } = {}) {
  let d = '';
  for (let r = 0; r < rows; r++) {
    const ww = r === rows - 1 ? w * last : w * R.range(0.82, 1);
    let cx = x, cy = y + r * lh + r * slope;
    d += `M${f1(cx)},${f1(cy)}`;
    while (cx < x + ww) {
      const step = R.range(6, 12), up = R.range(-7, 3);
      d += `q${f1(step / 2)},${f1(up)} ${f1(step)},${f1(R.range(-1.5, 1.5))}`;
      cx += step;
      if (R() < 0.14) { cx += R.range(8, 14); d += `M${f1(cx)},${f1(cy + R.range(-1, 1))}`; }
    }
  }
  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/>`;
}
// ruled columns (a ledger header with three columns) drawn as lines only
export function ledgerRules(x, y, w, h, cols = 3, col = '#7a5a3a') {
  let d = `M${f1(x)},${f1(y + 34)}h${f1(w)}`;
  for (let k = 1; k < cols; k++) d += `M${f1(x + (w * k) / cols)},${f1(y)}v${f1(h)}`;
  return `<path d="${d}" stroke="${col}" stroke-width="2" opacity=".7"/>`;
}

// the arch pressing on a wave (拱浪) — the mark of the Arch-Tide Gate (04 ledger, 10 chalk, 13 pass, 14 tags)
export const archWave = (cx, cy, r) => `M${f1(cx - r)},${f1(cy + r * 0.2)}V${f1(cy - r * 0.15)}A${f1(r)},${f1(r)} 0 0 1 ${f1(cx + r)},${f1(cy - r * 0.15)}V${f1(cy + r * 0.2)}`
  + `M${f1(cx - r)},${f1(cy + r * 0.55)}q${f1(r * 0.25)},${f1(-r * 0.3)} ${f1(r * 0.5)},0t${f1(r * 0.5)},0t${f1(r * 0.5)},0t${f1(r * 0.5)},0`;
// a crown of five points; crack = the crown-shaped crack beside the black dragon's left eye (a jagged line along the rim)
export const crown = (cx, cy, w, h) => `M${f1(cx - w / 2)},${f1(cy + h / 2)}L${f1(cx - w / 2)},${f1(cy - h * 0.1)}L${f1(cx - w * 0.3)},${f1(cy + h * 0.12)}L${f1(cx - w * 0.15)},${f1(cy - h / 2)}L${f1(cx)},${f1(cy + h * 0.05)}L${f1(cx + w * 0.15)},${f1(cy - h / 2)}L${f1(cx + w * 0.3)},${f1(cy + h * 0.12)}L${f1(cx + w / 2)},${f1(cy - h * 0.1)}L${f1(cx + w / 2)},${f1(cy + h / 2)}Z`;
export const crownCrack = (cx, cy, w) => pts([[cx - w * 0.5, cy], [cx - w * 0.32, cy - w * 0.18], [cx - w * 0.2, cy + w * 0.02], [cx - w * 0.04, cy - w * 0.26], [cx + w * 0.1, cy], [cx + w * 0.26, cy - w * 0.2], [cx + w * 0.36, cy + w * 0.04], [cx + w * 0.5, cy - w * 0.06]]);
// seven concentric rings (the seven-ring star map: 15 copper plate, 17 rubbing, 19 alphabet)
export function sevenRings(cx, cy, r, { col = '#6a4a2a', sw = 2.6, ticks = true } = {}) {
  let s = '';
  for (let k = 1; k <= 7; k++) s += `<path d="${ell(cx, cy, (r * k) / 7, (r * k) / 7)}" fill="none" stroke="${col}" stroke-width="${sw}" opacity="${f(0.55 + k * 0.05, 2)}"/>`;
  if (ticks) { let d = ''; for (let k = 0; k < 7; k++) { const a = (-90 + k * 360 / 7) * Math.PI / 180, rr = (r * (k + 1)) / 7; d += `M${f1(cx + Math.cos(a) * (rr - 8))},${f1(cy + Math.sin(a) * (rr - 8))}L${f1(cx + Math.cos(a) * (rr + 8))},${f1(cy + Math.sin(a) * (rr + 8))}`; } s += `<path d="${d}" stroke="${col}" stroke-width="${sw * 1.4}" stroke-linecap="round"/>`; }
  return s;
}
// a wax seal: blob + raised rim + an emblem pressed in. emblem: 'star' | 'crown' | 'crack' | 'arch' | 'none'; broken = split down the middle
export function seal(S, cx, cy, r, col, { emblem = 'star', broken = false } = {}) {
  const R = S.R;
  const blob = [];
  for (let k = 0; k < 18; k++) { const a = (k / 18) * Math.PI * 2, rr = r * (1 + R.range(-0.06, 0.12)); blob.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  const dark = mix(col, '#000000', 0.45), lite = mix(col, '#ffffff', 0.35);
  let s = `<path d="${ptz(blob)}" fill="${S.rad([[0, lite], [0.7, col], [1, dark]], 'cx="0.38" cy="0.35" r="0.8"')}"/>`;
  s += `<path d="${ell(cx, cy, r * 0.72, r * 0.72)}" fill="none" stroke="${dark}" stroke-width="${f1(r * 0.08)}" opacity=".8"/>`;
  const em = { star: `<path d="${star7(cx, cy, r * 0.5)}" fill="${dark}" opacity=".85"/>`,
    crown: `<path d="${crown(cx, cy, r * 0.9, r * 0.6)}" fill="${dark}" opacity=".85"/>`,
    crack: `<path d="${crown(cx, cy, r * 0.9, r * 0.6)}" fill="${dark}" opacity=".85"/><path d="${crownCrack(cx, cy - r * 0.32, r * 0.95)}" fill="none" stroke="${lite}" stroke-width="${f1(r * 0.06)}"/>`,
    arch: `<path d="${archWave(cx, cy, r * 0.42)}" fill="none" stroke="${dark}" stroke-width="${f1(r * 0.09)}" stroke-linecap="round"/>`, none: '' }[emblem];
  s += em;
  s += `<path d="${ell(cx - r * 0.3, cy - r * 0.34, r * 0.22, r * 0.12)}" fill="#fff" opacity=".22"/>`;
  if (broken) s += `<path d="${pts([[cx - r * 0.1, cy - r * 1.2], [cx + r * 0.08, cy - r * 0.5], [cx - r * 0.12, cy - r * 0.1], [cx + r * 0.1, cy + r * 0.4], [cx - r * 0.04, cy + r * 1.2]])}" fill="none" stroke="#120806" stroke-width="${f1(r * 0.1)}"/>`;
  S.add(s);
}
export function glow(S, cx, cy, r, col, op = 0.8) { S.add(`<path d="${ell(cx, cy, r, r)}" fill="${S.rad([[0, col, op], [0.4, col, op * 0.45], [1, col, 0]])}"/>`); }
// falling rain streaks over the whole card
export function rain(R, n = 90, col = '#a8b4d0', op = 0.35) {
  let d = '';
  for (let k = 0; k < n; k++) { const x = R.range(-40, IW), y = R.range(-40, IH), l = R.range(30, 70); d += `M${f1(x)},${f1(y)}l${f1(l * 0.22)},${f1(l)}`; }
  return `<path d="${d}" stroke="${col}" stroke-width="1.6" opacity="${op}"/>`;
}
// a chain of oval links along a polyline of points
export function chain(list, { rx = 16, ry = 10, col = '#8a8490', sw = 6 } = {}) {
  let s = '';
  for (let k = 0; k < list.length - 1; k++) {
    const [x0, y0] = list[k], [x1, y1] = list[k + 1];
    const a = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / (rx * 1.5)));
    for (let i = 0; i < n; i++) {
      const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      const flat = (k * 7 + i) % 2;
      s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(flat ? ry * 0.35 : ry)}" transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})" fill="none" stroke="${col}" stroke-width="${sw}"/>`;
    }
  }
  return s;
}
// the black-gold house crest (13 half clasp, 17 inside Aila's cape): a black disc, a gold double ring, two gold wings
// and an upright sword between them. half = only the left half, broken along a jagged line
export function crest(S, cx, cy, r, { half = false } = {}) {
  const g = '#d8b050', gd = '#8a6a2a';
  const wing = (s) => `M${f1(cx + s * r * 0.08)},${f1(cy - r * 0.05)}C${f1(cx + s * r * 0.3)},${f1(cy - r * 0.5)} ${f1(cx + s * r * 0.62)},${f1(cy - r * 0.52)} ${f1(cx + s * r * 0.7)},${f1(cy - r * 0.34)}C${f1(cx + s * r * 0.56)},${f1(cy - r * 0.28)} ${f1(cx + s * r * 0.6)},${f1(cy - r * 0.12)} ${f1(cx + s * r * 0.5)},${f1(cy - r * 0.04)}C${f1(cx + s * r * 0.54)},${f1(cy + r * 0.08)} ${f1(cx + s * r * 0.4)},${f1(cy + r * 0.2)} ${f1(cx + s * r * 0.28)},${f1(cy + r * 0.2)}C${f1(cx + s * r * 0.2)},${f1(cy + r * 0.3)} ${f1(cx + s * r * 0.1)},${f1(cy + r * 0.3)} ${f1(cx + s * r * 0.08)},${f1(cy + r * 0.2)}Z`;
  const body = `<path d="${ell(cx, cy, r, r)}" fill="#141218"/><path d="${ell(cx, cy, r * 0.92, r * 0.92)}" fill="none" stroke="${g}" stroke-width="${f1(r * 0.05)}"/>`
    + `<path d="${ell(cx, cy, r * 0.82, r * 0.82)}" fill="none" stroke="${gd}" stroke-width="${f1(r * 0.025)}"/>`
    + `<path d="${wing(-1)}${wing(1)}" fill="${g}"/><path d="${pts([[cx, cy - r * 0.68], [cx + r * 0.05, cy - r * 0.56], [cx + r * 0.05, cy + r * 0.5], [cx, cy + r * 0.64], [cx - r * 0.05, cy + r * 0.5], [cx - r * 0.05, cy - r * 0.56]])}Z" fill="${g}"/>`
    + `<path d="M${f1(cx - r * 0.2)},${f1(cy + r * 0.34)}h${f1(r * 0.4)}" stroke="${g}" stroke-width="${f1(r * 0.06)}" stroke-linecap="round"/>`;
  if (!half) { S.add(body); return; }
  const cut = [[cx + r * 0.02, cy - r * 1.1], [cx + r * 0.1, cy - r * 0.6], [cx - r * 0.04, cy - r * 0.2], [cx + r * 0.12, cy + r * 0.25], [cx - r * 0.02, cy + r * 0.7], [cx + r * 0.06, cy + r * 1.1]];
  const id = S.uid('c');
  S.def(`<clipPath id="${id}"><path d="${ptz([[cx - r * 1.2, cy - r * 1.2], ...cut, [cx - r * 1.2, cy + r * 1.2]])}"/></clipPath>`);
  S.add(`<g clip-path="url(#${id})">${body}</g><path d="${pts(cut)}" fill="none" stroke="#5a4a2a" stroke-width="3"/>`);
}
