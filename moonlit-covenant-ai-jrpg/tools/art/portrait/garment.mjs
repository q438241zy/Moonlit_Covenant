// Shared drawing helpers for the outfit modules of the 服装稿 wave (剧本/README_轉蛋服裝設計.md §4.3):
// swimsuit, wedding, maid, sportwear, office. Pure geometry and colour - ids and <defs> stay with the outfit
// (p.id / p.def), so every helper can be called any number of times. Not an outfit itself: build.mjs only
// loads outfits/*.mjs.
import { sampleSpline, mix, smooth, mirrorPts, mirrorPath, taper } from './base.mjs';

/** mirror a whole group across the centre line x = 416 */
export const MIR = 'matrix(-1 0 0 1 832 0)';
/** integer point formatting (ruffles, pleats and props are small details: whole pixels are plenty) */
export const ip = (q) => `${Math.round(q[0])},${Math.round(q[1])}`;
/** one-decimal number */
export const f1 = (v) => String(Math.round(v * 10) / 10);

/** evenly sampled points along pts plus their left normals */
export function frame(pts, count) {
  const c = sampleSpline(pts, count);
  return c.map((q, i) => {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(count - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
    return { q, nx: dy / m, ny: -dx / m };
  });
}

/**
 * Ruffle band growing from an inner edge (open polyline `pts`) to a scalloped outer edge.
 * side = +1 grows along the left normal of travel, -1 along the right; width is px or t => px.
 * Returns { d (closed outline), gathers (fold strokes), dots (polyline for lace holes) }.
 */
export function ruffle(pts, count, width, side = 1, holes = 0.62) {
  const wf = typeof width === 'function' ? width : () => width;
  const F = frame(pts, count);
  const inner = F.map(({ q }) => q);
  const outer = F.map(({ q, nx, ny }, i) => {
    const w = wf(i / (count - 1)) * side;
    return [q[0] + nx * w, q[1] + ny * w];
  });
  let d = `M${ip(inner[0])}`;
  for (let i = 1; i < count; i++) d += `L${ip(inner[i])}`;
  d += `L${ip(outer[count - 1])}`;
  for (let i = count - 2; i >= 0; i--) {
    const a = outer[i + 1], b = outer[i];
    const r = Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.56;
    const tx = b[0] - a[0], ty = b[1] - a[1];
    const ox = outer[i][0] - inner[i][0], oy = outer[i][1] - inner[i][1];
    d += `A${Math.round(r)} ${Math.round(r)} 0 0 ${ty * ox - tx * oy > 0 ? 1 : 0} ${ip(b)}`;
  }
  let gathers = '';
  for (let i = 1; i < count - 1; i++) {
    const a = inner[i], b = outer[i];
    gathers += `M${ip([a[0] + (b[0] - a[0]) * 0.18, a[1] + (b[1] - a[1]) * 0.18])}L${ip([a[0] + (b[0] - a[0]) * 0.86, a[1] + (b[1] - a[1]) * 0.86])}`;
  }
  const dots = F.map(({ q, nx, ny }, i) => {
    const w = wf(i / (count - 1)) * side * holes;
    return [q[0] + nx * w, q[1] + ny * w];
  });
  return { d: `${d}Z`, gathers, dots: `M${dots.map(ip).join('L')}` };
}

/** one material from its base colour: base, lit, shade, deep, line (same-hue line art, never black) */
export function cloth(base, { ink = '#140c1e', paper = '#ffffff', lit = 0.34, shade = 0.3, deep = 0.52, line = 0.74 } = {}) {
  return { base, lit: mix(base, paper, lit), shade: mix(base, ink, shade), deep: mix(base, ink, deep), line: mix(base, ink, line) };
}

/** closed symmetric outline from its left half: [top centre, ..., bottom centre] (sharp flags kept) */
export const sym = (left) => smooth(left.concat(mirrorPts(left.slice(1, -1)).reverse()), { closed: true });
/** the left half alone, closed along the centre line (to shade the mirrored half) */
export const half = (left) => smooth(left, { closed: true });

/** a soft fold: tapered stroke through pts */
export const fold = (pts, w = 5) => taper(pts, { w, start: 0.2, end: 0, peak: 0.4 });

/** water drop centred at x, y (s = 1 is about 13 px tall) */
export const drop = (x, y, s = 1) => `M${f1(x)},${f1(y - 7 * s)}C${f1(x + 4 * s)},${f1(y - s)} ${f1(x + 5 * s)},${f1(y + 3 * s)} ${f1(x)},${f1(y + 6 * s)}C${f1(x - 5 * s)},${f1(y + 3 * s)} ${f1(x - 4 * s)},${f1(y - s)} ${f1(x)},${f1(y - 7 * s)}Z`;

/** circle as two arcs (one path, fill-rule friendly) */
export const circ = (x, y, r) => `M${f1(x - r)},${f1(y)}a${f1(r)},${f1(r)} 0 1 0 ${f1(2 * r)},0a${f1(r)},${f1(r)} 0 1 0 ${f1(-2 * r)},0`;

/** k-point star polygon around x, y */
export function star(x, y, r, inner = 0.45, k = 5, rot = -90) {
  let d = '';
  for (let i = 0; i < k * 2; i++) {
    const a = ((rot + (i * 180) / k) * Math.PI) / 180, rr = i % 2 ? r * inner : r;
    d += `${i ? 'L' : 'M'}${f1(x + Math.cos(a) * rr)},${f1(y + Math.sin(a) * rr)}`;
  }
  return `${d}Z`;
}

/** map local points through translate(x, y) rotate(deg) - for props drawn in their own frame */
export function placer(x, y, deg = 0, s = 1) {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), sn = Math.sin(a);
  return ([u, v]) => [x + (u * c - v * sn) * s, y + (u * sn + v * c) * s];
}

/** small round button with a highlight */
export const button = (x, y, r, fill, line) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${fill}" stroke="${line}" stroke-width="1.6"/><circle cx="${f1(x - r * 0.3)}" cy="${f1(y - r * 0.3)}" r="${f1(r * 0.32)}" fill="#fff" opacity=".7"/>`;

/**
 * The base layer of a dress / shirt / tee over the template body, below a neckline. G:
 *   C          cloth of the body (base, lit, shade, deep, line)
 *   neck       the neckline's left half, from its outer end to the centre, e.g. a crew neck
 *              [[350, 690], [374, 704], [394, 716], [416, 720]]; the garment covers everything below it
 *   sleeve     'long' | 'short' | 'none' (sleeveless: the torso only, bare arms)
 *   SC         cloth of the sleeves (default C)
 *   hem        y of a short sleeve's hem on the outer arm (default 1000)
 *   name       id stem when one file holds two garments (default 'g')
 * Returns the fills, the cel shadow on the viewer's right, sleeve seams and a few folds. Collars, trims,
 * aprons and buttons are the caller's.
 */
export function garment(p, G) {
  const { C } = G;
  const SC = G.SC || C;
  const nm = G.name || 'g';
  const neck = G.neck;
  const y0 = neck[0][1];
  const region = smooth([[-20, y0, 1], ...neck, ...mirrorPts(neck.slice(0, -1)).reverse(), [852, y0, 1], [852, 1240, 1], [-20, 1240, 1]], { closed: true });
  const cut = p.clip(`${nm}Neck`, region);
  const fill = p.lin(`${nm}Fill`, [[0, C.lit], [0.32, C.base], [1, C.shade]], [0, 680, 0, 1180]);
  const sfill = SC === C ? fill : p.lin(`${nm}SFill`, [[0, SC.lit], [0.35, SC.base], [1, SC.shade]], [0, 760, 0, 1180]);
  const shadeR = 'M486,760C540,744 600,772 640,820C680,868 690,900 702,1216H520C514,1100 510,1000 506,940C504,880 500,840 486,760Z';
  const shadeArmL = 'M150,960C176,940 222,946 240,1000L236,1216H130C132,1100 136,1040 150,960Z';
  let s = `<g clip-path="${cut}"><g clip-path="${G.sleeve === 'none' ? p.refs.torsoClip : p.refs.bodyClip}">`
    + `<rect x="0" y="600" width="832" height="640" fill="${sfill}"/>`
    + (SC !== C ? `<g clip-path="${p.refs.torsoClip}"><rect x="0" y="600" width="832" height="640" fill="${fill}"/></g>` : '')
    + `<path d="${shadeR}" fill="${C.shade}" opacity=".85"/><path d="${shadeArmL}" fill="${SC.shade}" opacity=".5"/>`
    + `<path d="${fold([[262, 830], [296, 866], [312, 936]], 4)}${fold([[566, 820], [534, 866], [520, 940]], 4)}" fill="${C.deep}" opacity=".6"/>`;
  if (G.sleeve !== 'none') {
    s += `<path d="${SHAPES_ARMSEAMS}" fill="none" stroke="${SC.line}" stroke-width="2.8" opacity=".85"/>`
      + `<path d="${fold([[170, 980], [178, 1040], [172, 1110]], 5)}" fill="${SC.lit}" opacity=".6"/><path d="${fold([[648, 990], [640, 1050], [646, 1120]], 5)}" fill="${SC.deep}"/>`;
  }
  s += `</g></g>`;
  if (G.sleeve === 'short') {
    // bare forearm skin below the sleeve hem, the hem band itself
    const h = G.hem || 1000;
    const pal = p.palette;
    const armL = `M40,${h - 4}Q140,${h + 14} 240,${h + 6}V1230H40Z`;
    const cuff = `M128,${h - 8}Q182,${h + 8} 238,${h}L238,${h + 20}Q182,${h + 30} 126,${h + 14}Z`;
    s += `<g clip-path="${p.refs.bodyClip}"><path d="${armL}" fill="${pal.skin}"/><path d="${mirrorPath(armL)}" fill="${pal.skin}"/>`
      + `<path d="M128,${h + 20}Q180,${h + 40} 238,${h + 30}V1216H128Z" fill="${pal.skinShadow}" opacity=".3"/><path d="M600,${h + 24}Q650,${h + 50} 704,${h + 40}V1216H600Z" fill="${pal.skinShadow}" opacity=".6"/>`
      + `<path d="M234,${h + 10}V1216M598,${h + 10}V1216" stroke="${pal.skinLine}" stroke-width="2" opacity=".35"/>`
      + `<path d="${cuff}" fill="${SC.base}" stroke="${SC.line}" stroke-width="2.2"/><path d="${mirrorPath(cuff)}" fill="${SC.shade}" stroke="${SC.line}" stroke-width="2.2"/></g>`;
  }
  return s;
}
// the inner-arm seams of the template (SHAPES.armSeamL + armSeamR), drawn on sleeves
const SEAM = smooth([[162, 830], [198, 870], [238, 912], [236, 1050], [234, 1216]]);
const SHAPES_ARMSEAMS = SEAM + mirrorPath(SEAM);

/** zipper teeth along a polyline (dashed double stroke) */
export const zipper = (d, metal = '#d9d4c4', line = '#3a3428') => `<path d="${d}" fill="none" stroke="${line}" stroke-width="7" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${metal}" stroke-width="5" stroke-dasharray="2 2.4"/>`;
