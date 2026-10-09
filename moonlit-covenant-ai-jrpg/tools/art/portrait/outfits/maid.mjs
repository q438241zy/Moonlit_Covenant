// 女仆服 - classic modest maid dress: black long-sleeved dress with puff shoulders, white high
// collar with lace edge, accent-coloured ribbon bow, white pinafore bib with ruffled shoulder
// straps and lace edging. Ornament: frilled headband (katyusha) sitting on top of the hair.
// Recolours per heroine through p.palette.accent (ribbon, headband bow, brooch gem).
import { sampleSpline, n, mix } from '../base.mjs';

const K = {
  black: '#25212f', blackShade: '#16131d', blackDeep: '#0d0b12', blackLit: '#3a3449', blackSheen: '#6a6288', blackLine: '#07060c',
  white: '#f7f3fb', whiteShade: '#d2c9e2', whiteDeep: '#a99ec4', whiteLine: '#5a5072',
};

// ---------------------------------------------------------------- local helpers
/** evenly sampled points along pts plus their left normals */
function frame(pts, count) {
  const c = sampleSpline(pts, count);
  return c.map((q, i) => {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(count - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
    return { q, nx: dy / m, ny: -dx / m };
  });
}
/** integer point formatting (ruffles and pleats are small details: whole pixels are plenty) */
const ip = (q) => `${Math.round(q[0])},${Math.round(q[1])}`;
/**
 * Ruffle band growing from an inner edge (open polyline `pts`) to a scalloped outer edge.
 * side = +1 grows along the left normal of travel, -1 along the right. width(t) gives the depth.
 * Returns { d (closed outline), gathers (fold strokes path), dots (polyline for lace holes) }.
 */
function ruffle(pts, count, width, side = 1, holes = 0.62) {
  const F = frame(pts, count);
  const inner = F.map(({ q }) => q);
  const outer = F.map(({ q, nx, ny }, i) => {
    const w = width(i / (count - 1)) * side;
    return [q[0] + nx * w, q[1] + ny * w];
  });
  let d = `M${ip(inner[0])}`;
  for (let i = 1; i < count; i++) d += `L${ip(inner[i])}`;
  d += `L${ip(outer[count - 1])}`;
  for (let i = count - 2; i >= 0; i--) {
    const a = outer[i + 1], b = outer[i];
    const r = Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.56;
    // bump away from the inner edge: compare travel-left normal with the outward direction
    const tx = b[0] - a[0], ty = b[1] - a[1];
    const ox = outer[i][0] - inner[i][0], oy = outer[i][1] - inner[i][1];
    const sweep = ty * ox - tx * oy > 0 ? 1 : 0;
    d += `A${Math.round(r)} ${Math.round(r)} 0 0 ${sweep} ${ip(b)}`;
  }
  d += 'Z';
  let gathers = '';
  for (let i = 1; i < count - 1; i++) {
    const a = inner[i], b = outer[i];
    gathers += `M${ip([a[0] + (b[0] - a[0]) * 0.18, a[1] + (b[1] - a[1]) * 0.18])}L${ip([a[0] + (b[0] - a[0]) * 0.86, a[1] + (b[1] - a[1]) * 0.86])}`;
  }
  const dots = F.map(({ q, nx, ny }, i) => {
    const w = width(i / (count - 1)) * side * holes;
    return [q[0] + nx * w, q[1] + ny * w];
  });
  return { d, gathers, dots: 'M' + dots.map(ip).join('L') };
}

function ribbonColours(accent) {
  return {
    base: mix(accent, '#3a1830', 0.12), shade: mix(accent, '#2a1030', 0.42), deep: mix(accent, '#1a0a20', 0.62),
    lit: mix(accent, '#ffffff', 0.42), line: mix(accent, '#14081a', 0.72),
  };
}

// ---------------------------------------------------------------- dress
function render(p) {
  const { smooth: sm, taper, mirrorPath } = p.helpers;
  const pal = p.palette;
  const R = ribbonColours(pal.accent);
  const dressGrad = p.lin('dress', [[0, K.blackLit], [0.35, K.black], [1, K.blackShade]], [0, 660, 0, 1150]);
  let s = '';

  // base dress + cel shadow on the right side and right arm, moonlit sheen on the left chest
  const shadeR = sm([[486, 760], [540, 744], [600, 772], [640, 820], [690, 900], [702, 1216, 1], [520, 1216, 1], [512, 1060], [506, 940], [500, 840]], { closed: true });
  const shadeL = sm([[150, 960], [176, 940], [222, 946], [240, 1000], [236, 1216, 1], [130, 1216, 1], [136, 1040]], { closed: true });
  const sheen = sm([[262, 790], [314, 776], [336, 820], [334, 940], [300, 984], [262, 950]], { closed: true });
  s += `<g clip-path="${p.refs.bodyClip}"><rect y="660" width="832" height="560" fill="${dressGrad}"/>`
    + `<path d="${sheen}" fill="${K.blackLit}" opacity=".55"/>`
    + `<path d="${shadeR}" fill="${K.blackShade}"/><path d="${shadeL}" fill="${K.blackShade}" opacity=".6"/>`
    + `<path d="${taper([[352, 712], [306, 728], [262, 746]], { w: 7, start: 0.2, end: 0, peak: 0.5 })}" fill="${K.blackSheen}" opacity=".7"/>`
    // inner-arm seams + sleeve folds
    + `<path d="${p.shapes.armSeamL}${p.shapes.armSeamR}" fill="none" stroke="${K.blackLine}" stroke-width="3"/>`
    + `<path d="${taper([[170, 980], [178, 1040], [172, 1110]], { w: 5, start: 0.2, end: 0, peak: 0.4 })}${taper([[206, 990], [214, 1060]], { w: 4, start: 0.2, end: 0, peak: 0.4 })}" fill="${K.blackSheen}" opacity=".55"/>`
    + `<path d="${taper([[648, 990], [640, 1050], [646, 1120]], { w: 5, start: 0.2, end: 0, peak: 0.4 })}" fill="${K.blackDeep}"/>`
    // bodice side folds running toward the bib
    + `<path d="${taper([[262, 830], [296, 866], [312, 936]], { w: 4, start: 0.1, end: 0, peak: 0.5 })}" fill="${K.blackDeep}" opacity=".8"/>`
    + `<path d="${taper([[566, 820], [534, 866], [520, 940]], { w: 4, start: 0.1, end: 0, peak: 0.5 })}" fill="${K.blackDeep}"/>`
    + `</g>`;

  // ---- apron: gathered skirt under the waistband, then straps, bib and band
  const whiteGrad = p.lin('white', [[0, K.white], [0.7, K.white], [1, K.whiteShade]], [340, 0, 500, 0]);
  const skirt = sm([[292, 1020, 1], [540, 1020, 1], [572, 1216, 1], [260, 1216, 1]], { closed: true });
  s += `<path d="${skirt}" fill="${whiteGrad}" stroke="${K.whiteLine}" stroke-width="3"/>`
    + `<path d="M476,1026L540,1020L572,1216H504Q498,1110 476,1026Z" fill="${K.whiteShade}"/>`
    + `<path d="${[[330, 1030, 316], [372, 1034, 364], [418, 1036, 420], [460, 1034, 474], [500, 1030, 522]].map(([x, y, x2]) => taper([[x, y], [(x + x2) / 2 - 4, y + 60], [x2, 1180]], { w: 4, start: 0.8, end: 0.2, peak: 0.1 })).join('')}" fill="${K.whiteDeep}" opacity=".75"/>`;

  // shoulder straps with ruffled "wings" (drawn before the bib so the bib overlaps their ends)
  const strapL = [[352, 812], [340, 778], [324, 748], [306, 726]];
  const rufL = ruffle([[346, 818], [334, 782], [318, 752], [300, 732], [282, 726]], 9, (t) => 7 + 25 * Math.sin(t * Math.PI) ** 0.7, -1);
  const strapD = taper(strapL, { w: 22, start: 1, end: 1, peak: 0.5 });
  const MIR = 'matrix(-1 0 0 1 832 0)';
  s += `<g id="${p.id('strap')}"><path d="${rufL.d}" fill="${K.white}" stroke="${K.whiteLine}" stroke-width="2.4" stroke-linejoin="round"/>`
    + `<path d="${rufL.gathers}" fill="none" stroke="${K.whiteDeep}" stroke-width="1.6" opacity=".8"/>`
    + `<path d="${rufL.dots}" fill="none" stroke="${K.whiteDeep}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="0 8.5"/>`
    + `<path d="${strapD}" fill="${K.white}" stroke="${K.whiteLine}" stroke-width="2.4"/></g>`
    // right wing + strap: mirrored copy, in shadow
    + `<use href="#${p.id('strap')}" transform="${MIR}"/><g transform="${MIR}" fill="${K.whiteShade}"><path d="${rufL.d}" opacity=".75"/><path d="${strapD}" opacity=".6"/></g>`;

  // bib with ruffle along the sides and the top
  const bib = sm([[344, 1004, 1], [340, 816, 1], [348, 806], [360, 804, 1], [472, 804, 1], [484, 806], [492, 816, 1], [488, 1004, 1]], { closed: true });
  const rufBib = ruffle([[346, 1000], [342, 900], [341, 812], [380, 804], [452, 804], [491, 812], [490, 900], [486, 1000]], 25, () => 13, 1);
  s += `<path d="${rufBib.d}" fill="${K.white}" stroke="${K.whiteLine}" stroke-width="2.4" stroke-linejoin="round"/>`
    + `<path d="${rufBib.gathers}" fill="none" stroke="${K.whiteDeep}" stroke-width="1.5" opacity=".75"/>`
    + `<path d="${rufBib.dots}" fill="none" stroke="${K.whiteDeep}" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="0 7.5"/>`
    + `<path d="${bib}" fill="${whiteGrad}" stroke="${K.whiteLine}" stroke-width="2.6"/>`
    // bib cel shadow (right) + cast shadow of the bow + soft pleat + top hem stitch
    + `<path d="${sm([[456, 806, 1], [488, 806, 1], [488, 1004, 1], [446, 1004, 1], [454, 900]], { closed: true })}" fill="${K.whiteShade}" opacity=".85"/>`
    + `<path d="M396,806L436,806L452,830Q430,846 418,836Q404,846 392,826Z" fill="${K.whiteShade}" opacity=".9"/>`
    + `<path d="${taper([[372, 840], [366, 920], [370, 990]], { w: 7, start: 0.1, end: 0.1, peak: 0.5 })}" fill="${K.whiteShade}" opacity=".6"/>`
    + `<path d="M350,820Q416,814 482,820" fill="none" stroke="${K.whiteDeep}" stroke-width="1.6" stroke-dasharray="5 4" opacity=".8"/>`
    + `<path d="${taper([[352, 830], [350, 900], [354, 960]], { w: 4, start: 0.3, end: 0, peak: 0.3 })}" fill="#fff"/>`;
  // waistband wrapping round the body (curves down in the middle, ends turn away into shadow)
  const band = sm([[240, 988, 1], [330, 1000], [416, 1006], [502, 1000], [592, 988, 1], [594, 1016, 1], [502, 1028], [416, 1034], [330, 1028], [238, 1016, 1]], { closed: true });
  s += `<path d="${band}" fill="${K.white}" stroke="${K.whiteLine}" stroke-width="2.6"/>`
    + `<path d="M478,1003Q540,999 593,988L594,1016Q540,1026 478,1031Z" fill="${K.whiteShade}"/>`
    + `<path d="M240,988Q262,993 280,995L278,1024Q258,1021 238,1016Z" fill="${K.whiteShade}" opacity=".8"/>`
    + `<path d="M250,1001Q416,1024 582,1001" fill="none" stroke="${K.whiteDeep}" stroke-width="1.4" stroke-dasharray="5 4"/>`
    + `<path d="M262,994Q340,1006 400,1008" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`;

  // ---- puff sleeves (gathered at the shoulder seam and into a band above the elbow)
  const puff = sm([[254, 754], [220, 742], [180, 746], [148, 768], [126, 804], [118, 850], [124, 892], [138, 924, 1], [190, 936], [244, 924, 1], [250, 880], [256, 820]], { closed: true });
  const puffShade = sm([[121, 872], [142, 898], [192, 910], [246, 900], [244, 924, 1], [190, 936], [138, 924, 1], [124, 892]], { closed: true });
  const pleat = (pts, w) => taper(pts, { w, start: 0.9, end: 0, peak: 0.12 });
  const folds = pleat([[246, 762], [222, 790], [208, 836], [206, 880]], 6) + pleat([[240, 756], [200, 768], [170, 806], [158, 856]], 6)
    + pleat([[250, 800], [238, 846], [236, 892]], 5)
    + pleat([[152, 922], [146, 896], [148, 872]], 6) + pleat([[196, 932], [196, 904], [200, 880]], 6) + pleat([[228, 928], [226, 904], [230, 884]], 5);
  const ridges = taper([[226, 764], [206, 786], [192, 830], [190, 870]], { w: 7, start: 0.2, end: 0, peak: 0.4 })
    + taper([[176, 788], [160, 820], [150, 862]], { w: 7, start: 0.2, end: 0, peak: 0.4 })
    + taper([[238, 800], [226, 846], [222, 880]], { w: 5, start: 0.2, end: 0, peak: 0.4 });
  const puffHi = taper([[240, 748], [200, 744], [164, 760], [138, 792], [124, 836]], { w: 12, start: 0.2, end: 0, peak: 0.45 });
  const cuff = sm([[136, 918, 1], [190, 930], [246, 918, 1], [248, 946, 1], [190, 958], [138, 944, 1]], { closed: true });
  s += `<g id="${p.id('puff')}"><path d="${puff}" fill="${K.black}" stroke="${K.blackLine}" stroke-width="3.2" stroke-linejoin="round"/>`
    + `<path d="${puffShade}" fill="${K.blackShade}"/><path d="${folds}" fill="${K.blackDeep}"/>`
    + `<path d="${ridges}" fill="${K.blackLit}"/><path d="${puffHi}" fill="${K.blackSheen}" opacity=".9"/>`
    + `<path d="${cuff}" fill="${K.blackShade}" stroke="${K.blackLine}" stroke-width="2.6"/>`
    + `<path d="M142,924Q190,936 244,924" fill="none" stroke="${K.white}" stroke-width="3"/></g>`
    // right sleeve: mirrored copy pushed into shadow
    + `<use href="#${p.id('puff')}" transform="${MIR}"/><g transform="${MIR}"><path d="${puff}${cuff}" fill="${K.blackDeep}" opacity=".45"/><path d="M142,924Q190,936 244,924" fill="none" stroke="${K.whiteDeep}" stroke-width="3"/></g>`;

  // ---- high white collar with a lace edge, then the bow
  const collar = sm([[365, 660, 1], [390, 672], [416, 676], [442, 672], [467, 660, 1], [484, 712, 1], [448, 726], [416, 731], [384, 726], [348, 712, 1]], { closed: true });
  const lace = ruffle([[365, 662], [390, 674], [416, 678], [442, 674], [467, 662]], 11, () => 8, 1, 0.5);
  s += `<path d="${lace.d}" fill="${K.white}" stroke="${K.whiteLine}" stroke-width="1.8" stroke-linejoin="round"/>`
    + `<path d="${lace.dots}" fill="none" stroke="${K.whiteDeep}" stroke-width="2" stroke-linecap="round" stroke-dasharray="0 6"/>`
    + `<path d="${collar}" fill="${whiteGrad}" stroke="${K.whiteLine}" stroke-width="3"/>`
    + `<path d="M440,673L467,660L484,712L450,724Q452,694 440,673Z" fill="${K.whiteShade}"/>`
    + `<path d="M370,676Q368,698 358,710" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`
    + `<path d="M392,678Q394,702 390,726M440,678Q438,702 442,726" fill="none" stroke="${K.whiteDeep}" stroke-width="1.6" opacity=".8"/>`
    + `<path d="M416,678V731" stroke="${K.whiteLine}" stroke-width="2"/>`;

  // ribbon bow at the throat
  const loop = sm([[412, 742], [392, 724], [366, 716], [352, 730], [356, 754], [378, 764], [410, 752]], { closed: true });
  const tail = sm([[406, 750, 1], [396, 784], [384, 816, 1], [396, 808, 1], [404, 820, 1], [412, 786], [420, 752, 1]], { closed: true });
  s += `<g stroke-linejoin="round">`
    + `<path d="${mirrorPath(tail)}" fill="${R.shade}" stroke="${R.line}" stroke-width="2.4"/><path d="${tail}" fill="${R.base}" stroke="${R.line}" stroke-width="2.4"/>`
    + `<path d="${taper([[404, 760], [398, 786], [390, 806]], { w: 3.4, start: 0.3, end: 0, peak: 0.3 })}" fill="${R.lit}" opacity=".8"/>`
    + `<path d="${loop}" fill="${R.base}" stroke="${R.line}" stroke-width="2.6"/>`
    + `<path d="M410,752Q384,752 360,746Q366,762 380,764Q400,764 410,752Z" fill="${R.shade}"/>`
    + `<path d="${taper([[402, 732], [380, 722], [362, 726]], { w: 4, start: 0.3, end: 0, peak: 0.4 })}" fill="${R.lit}" opacity=".9"/>`
    + `<path d="${mirrorPath(loop)}" fill="${R.shade}" stroke="${R.line}" stroke-width="2.6"/>`
    + `<path d="${mirrorPath('M410,752Q384,752 360,746Q366,762 380,764Q400,764 410,752Z')}" fill="${R.deep}"/>`
    + `<path d="M386,730Q396,738 404,742M446,730Q436,738 428,742" fill="none" stroke="${R.line}" stroke-width="1.8" opacity=".8"/>`
    + `<rect x="403" y="728" width="26" height="26" rx="9" fill="${R.base}" stroke="${R.line}" stroke-width="2.4"/>`
    // brooch on the knot: gold setting + accent gem
    + `<ellipse cx="416" cy="741" rx="9" ry="10.5" fill="#e3a95e" stroke="#5a3512" stroke-width="2"/>`
    + `<ellipse cx="416" cy="741" rx="5.6" ry="7" fill="${mix(pal.accent, '#ffffff', 0.15)}" stroke="${R.line}" stroke-width="1.2"/>`
    + `<circle cx="413.6" cy="737.6" r="2" fill="#fff"/>`
    + `</g>`;
  return s;
}

// ---------------------------------------------------------------- background: manor hall at night
// damask wallpaper, moulded wall panels and two candle sconces (warm, low contrast)
function bgMotif(p) {
  const fleur = 'M60,18C72,38 92,46 90,70C88,92 68,94 60,114C52,94 32,92 30,70C28,46 48,38 60,18ZM60,44C66,56 74,62 72,74C70,84 64,86 60,94C56,86 50,84 48,74C46,62 54,56 60,44Z'
    + 'M30,70C14,66 8,52 18,44C26,40 32,48 26,54M90,70C106,66 112,52 102,44C94,40 88,48 94,54M60,114V142M48,130Q60,124 72,130';
  p.def(`<pattern id="${p.id('damask')}" width="120" height="160" patternUnits="userSpaceOnUse" x="-44"><path d="${fleur}" fill="#2d2648" fill-rule="evenodd" opacity=".55"/><path d="M0,80h0M120,80h0" stroke="#2d2648" stroke-width="8" stroke-linecap="round"/></pattern>`);
  const warm = p.rad('sconce', [[0, '#ffc58a', 0.42], [0.35, '#ff9a5a', 0.14], [1, '#ff9a5a', 0]], { cx: 0.5, cy: 0.5, r: 0.5 }, 'objectBoundingBox');
  const sconce = (x) => `<rect x="${x - 120}" y="300" width="240" height="240" fill="${warm}"/>`
    + `<path d="M${x - 16},452h32l-6,14h-20z" fill="#7a5a2a" stroke="#2a1a08" stroke-width="2"/><path d="M${x},466v28" stroke="#5a4020" stroke-width="4"/>`
    + `<rect x="${x - 6}" y="416" width="12" height="36" rx="2" fill="#efe6d8" stroke="#6a5a48" stroke-width="1.6"/>`
    + `<path d="M${x},392C${x + 9},404 ${x + 6},414 ${x},416C${x - 6},414 ${x - 9},404 ${x},392Z" fill="#ffd27a" stroke="#ff9a4a" stroke-width="1.4"/>`;
  return `<rect width="832" height="1216" fill="url(#${p.id('damask')})"/>`
    + `<path d="M34,110H206V700H34ZM626,110H798V700H626Z" fill="#0b0918" opacity=".35"/>`
    + `<path d="M34,110H206V700H34ZM626,110H798V700H626ZM50,126H190V684H50ZM642,126H782V684H642Z" fill="none" stroke="#3a3260" stroke-width="2.4" opacity=".55"/>`
    + `<path d="M0,740H832M0,756H832" stroke="#3a3260" stroke-width="3" opacity=".5"/>`
    + sconce(120) + sconce(712);
}

// ---------------------------------------------------------------- frilled headband
// per-heroine crown geometry: apex height, half-width and end height of the band
const BAND = {
  default: [214, 128, 296],
  lia: [214, 126, 292],
  mia: [224, 110, 270], // sits between the mechanical ears
  evelyn: [202, 98, 238], // above the circlet
  ophelia: [214, 120, 286], // ends inside the horn roots
  lilith: [206, 124, 286],
  aila: [210, 128, 294],
  serena: [212, 126, 292],
  freya: [214, 126, 290],
};

function hairOrnament(p) {
  const { taper, locks } = p.helpers;
  const pal = p.palette;
  const [ay, hw, ey] = BAND[p.heroine.id] || BAND.default;
  const R = ribbonColours(pal.accent);
  const L = [416 - hw, ey], Rt = [416 + hw, ey];
  const arc = [L, [416 - hw * 0.72, ay + (ey - ay) * 0.34], [416, ay], [416 + hw * 0.72, ay + (ey - ay) * 0.34], Rt];
  const N = 15;
  const fw = (t) => 6 + 20 * Math.sin(t * Math.PI) ** 0.8;
  const frill = ruffle(arc, N, fw, 1, 0.55);
  // box pleats: every other pleat of the frill turns away from the light
  const F = frame(arc, N);
  const edge = F.map(({ q, nx, ny }, i) => [q[0] + nx * fw(i / (N - 1)) * 0.92, q[1] + ny * fw(i / (N - 1)) * 0.92]);
  let pleats = '';
  for (let i = 1; i < N - 1; i += 2) pleats += `M${ip(F[i].q)}L${ip(F[i + 1].q)}L${ip(edge[i + 1])}L${ip(edge[i])}Z`;
  const bandD = taper(arc, { w: 11, start: 0.45, end: 0.45, peak: 0.5 });
  // tiny accent bow where the band meets the hair on the viewer's left
  const bx = L[0] + hw * 0.16, by = ey - (ey - ay) * 0.36;
  const bow = `M${n(bx)},${n(by)}l-15,-9l-3,16zM${n(bx)},${n(by)}l15,-5l-1,17z`;
  // the band ends tuck under a lock of the heroine's own hair on each side
  const tuck = [
    { root: [L[0] + 14, ey - 30], tip: [L[0] - 6, ey + 44], w: 22, bend: 4 },
    { root: [Rt[0] - 14, ey - 30], tip: [Rt[0] + 6, ey + 44], w: 22, bend: -4 },
  ].map((k) => ({ ...k, start: 0.3, swell: 0.35 }));
  return `<g stroke-linejoin="round">`
    + `<path d="${bandD}" fill="${pal.hairDeep}" opacity=".45" transform="translate(3 7)"/>`
    + `<path d="${frill.d}" fill="${K.white}" stroke="${K.whiteLine}" stroke-width="2.2"/>`
    + `<path d="${pleats}" fill="${K.whiteShade}" opacity=".8"/>`
    + `<path d="${frill.gathers}" fill="none" stroke="${K.whiteDeep}" stroke-width="1.4"/>`
    + `<path d="${frill.dots}" fill="none" stroke="${K.whiteDeep}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="0 7"/>`
    + `<path d="${bandD}" fill="${K.black}" stroke="${K.blackLine}" stroke-width="2"/>`
    + `<path d="${taper(arc.slice(0, 3), { w: 2.4, start: 0.2, end: 0.6, peak: 0.7 })}" fill="${K.blackSheen}" transform="translate(0 -2)"/>`
    + locks(tuck, { fill: pal.hair, shade: pal.hairShadow, line: pal.hairLine, stroke: pal.hairLine, strokeWidth: 2, lineOpacity: 0.4 })
    + `<path d="${bow}" fill="${R.base}" stroke="${R.line}" stroke-width="2"/>`
    + `<circle cx="${n(bx)}" cy="${n(by)}" r="4.6" fill="${R.shade}" stroke="${R.line}" stroke-width="1.8"/>`
    + `</g>`;
}

export default {
  type: 'maid',
  label: '女仆服',
  render,
  bgMotif,
  hairOrnament,
};
