// 新年服 - red & gold qipao-inspired jacket: gold-piped mandarin collar, small white fur collar
// closed with a gold frog button, curved qipao front (大襟) with frog buttons, gold auspicious-cloud
// embroidery on a subtle brocade. Ornament: plum-blossom hairpin with a tassel.
// Identity colours (red / gold / white fur) stay; p.palette.accent tints the piping, the frog
// beads and the tassel bead so every heroine's set is distinct.
import { sampleSpline, mix } from '../base.mjs';

const K = {
  red: '#b81f33', redShade: '#86132a', redDeep: '#560a1c', redLit: '#dc4552', redLine: '#36050f',
  band: '#2c0a15', bandLit: '#4a1422',
  gold: '#ffd28a', goldMid: '#e6a94f', goldDeep: '#9a6224', goldLine: '#5a3410',
  fur: '#fbf7f5', furShade: '#ddd0dc', furDeep: '#b8a7bf', furLine: '#76657e',
  plum: '#ff8fae', plumLit: '#ffd6e0', plumShade: '#de5a80', plumLine: '#7e1a3c',
};
const ip = (q) => `${Math.round(q[0])},${Math.round(q[1])}`;

/** evenly sampled points along pts plus their left normals */
function frame(pts, count) {
  const c = sampleSpline(pts, count);
  return c.map((q, i) => {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(count - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
    return { q, nx: dy / m, ny: -dx / m };
  });
}
/**
 * Fluffy fur band along a centre line: soft tufts on both edges.
 * w(t) = half thickness; rand = deterministic PRNG. Returns the closed outline.
 */
function fluff(pts, count, w, rand) {
  const F = frame(pts, count);
  const side = (sgn) => F.map(({ q, nx, ny }, i) => {
    const t = i / (count - 1);
    const k = w(t) * (1 + (rand() - 0.5) * 0.25);
    return [q[0] + nx * k * sgn, q[1] + ny * k * sgn];
  });
  const A = side(1), B = side(-1).reverse();
  // tufts: quadratic bulges between edge points, bulging outward
  const tufts = (E, sgn, flip) => {
    let d = '';
    for (let i = 1; i < E.length; i++) {
      const a = E[i - 1], b = E[i];
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const bulge = 0.42 + rand() * 0.2;
      const c = [mx + dy * bulge * flip, my - dx * bulge * flip];
      d += `Q${ip(c)} ${ip(b)}`;
    }
    return d;
  };
  return `M${ip(A[0])}${tufts(A, 1, 1)}L${ip(B[0])}${tufts(B, -1, 1)}Z`;
}

/** frog button (盘扣): two cord loops either side of a knot, rotated by ang (deg) */
function frog(x, y, ang, s, bead) {
  const cord = 'M-4,0C-10,-9 -26,-10 -30,-2C-33,6 -20,9 -12,4M4,0C10,-9 26,-10 30,-2C33,6 20,9 12,4M-4,0H4';
  return `<g transform="translate(${x} ${y}) rotate(${ang}) scale(${s})" fill="none" stroke-linecap="round">`
    + `<path d="${cord}" stroke="${K.goldLine}" stroke-width="7.4"/>`
    + `<path d="${cord}" stroke="${K.goldMid}" stroke-width="4.2"/>`
    + `<path d="M-6,-3C-12,-8 -22,-8 -26,-3M8,-3C14,-8 22,-8 26,-3" stroke="${K.gold}" stroke-width="1.8"/>`
    + `<circle r="6.4" fill="${bead}" stroke="${K.goldLine}" stroke-width="2"/><circle cx="-2" cy="-2.2" r="2" fill="#fff" stroke="none" opacity=".85"/>`
    + `</g>`;
}

// auspicious cloud (祥云) in local units, ~130 x 70, drawn as couched gold-thread embroidery
const CLOUD_OUT = 'M-46,14C-60,14 -62,-4 -48,-8C-48,-24 -28,-28 -20,-16C-16,-36 16,-38 22,-18C30,-30 52,-24 50,-6C62,-2 60,16 46,16Z';
const CLOUD_IN = 'M4,-2C-6,-4 -7,-18 3,-21C14,-23 21,-11 13,-4M36,8C30,3 34,-8 42,-6M-32,6C-38,0 -34,-12 -25,-9'
  + 'M-46,14C-66,16 -80,26 -76,38C-72,47 -60,44 -63,35M46,16C60,20 70,30 66,38M-40,8C-46,2 -44,-2 -40,-4M-14,8Q4,4 30,8';

const CLOUD2_OUT = 'M-40,10C-52,8 -52,-8 -40,-10C-38,-24 -18,-26 -12,-14C-4,-26 16,-24 18,-10C30,-12 34,4 24,10Z';
const CLOUD2_IN = 'M-2,0C-10,-2 -10,-14 -2,-15C8,-16 12,-6 6,-1M-28,4C-32,-2 -28,-10 -22,-8M24,10C44,12 60,4 72,-6C80,-12 90,-8 86,0C83,6 76,4 77,-1M-40,10C-54,14 -60,22 -56,28';

function render(p) {
  const { smooth: sm, taper, mirrorPath } = p.helpers;
  const pal = p.palette;
  const pipe = mix(pal.accent, K.gold, 0.3);
  const rand = p.rand;
  let s = '';

  // tonal damask (团花 rosettes, a shade darker than the silk) + the embroidered cloud
  p.def(`<pattern id="${p.id('damask')}" width="72" height="72" patternUnits="userSpaceOnUse" patternTransform="rotate(8)"><g fill="none" stroke="${K.redDeep}" stroke-width="2.2" opacity=".34"><path d="M36,22q9,5 0,14q-9,-9 0,-14zM36,50q9,-5 0,-14q-9,9 0,14zM22,36q5,-9 14,0q-9,9 -14,0zM50,36q-5,-9 -14,0q9,9 14,0z"/><circle cx="36" cy="36" r="19"/><path d="M0,4L4,0L8,4L4,8ZM64,68L68,64L72,68L68,72Z"/></g></pattern>`);
  const cloudDef = (id, out, inn) => p.def(`<g id="${p.id(id)}" stroke-linecap="round" stroke-linejoin="round"><path d="${out}" fill="${K.goldDeep}" fill-opacity=".35" stroke="${K.goldLine}" stroke-width="6"/>`
    + `<path d="${inn}" fill="none" stroke="${K.goldLine}" stroke-width="5.4"/>`
    + `<path d="${out}${inn}" fill="none" stroke="${K.goldMid}" stroke-width="3"/>`
    + `<path d="${out}" fill="none" stroke="${K.gold}" stroke-width="1.4" transform="translate(-1 -1)"/></g>`);
  cloudDef('cloud', CLOUD_OUT, CLOUD_IN);
  cloudDef('cloud2', CLOUD2_OUT, CLOUD2_IN);
  const cloud = (x, y, sc, flip = 1, rot = 0, v = '') => `<use href="#${p.id('cloud' + v)}" transform="translate(${x} ${y}) rotate(${rot}) scale(${sc * flip} ${sc})"/>`;

  const silk = p.lin('silk', [[0, K.redLit], [0.28, K.red], [1, K.redShade]], [0, 680, 0, 1180]);
  const shadeR = sm([[472, 786], [530, 768], [600, 788], [650, 830], [700, 920], [702, 1216, 1], [524, 1216, 1], [512, 1060], [500, 930], [488, 840]], { closed: true });
  const coreR = sm([[600, 900], [640, 880], [690, 960], [702, 1216, 1], [640, 1216, 1], [626, 1040]], { closed: true });
  const shadeArm = sm([[236, 940], [232, 1216, 1], [190, 1216, 1], [204, 1040], [214, 960]], { closed: true });
  // qipao front (大襟): emerges from under the fur and sweeps to the viewer's left armpit
  const lapel = sm([[394, 776], [358, 798], [322, 824], [292, 862], [268, 916], [254, 980], [246, 1060], [242, 1216]]);
  s += `<g clip-path="${p.refs.bodyClip}"><rect y="660" width="832" height="560" fill="${silk}"/>`
    + `<rect y="660" width="832" height="560" fill="url(#${p.id('damask')})"/>`
    // embroidery (under the cel shadow so the shadow side dims it too): a cloud drift over the right chest
    + cloud(470, 846, 0.95, 1, -8) + cloud(536, 924, 0.9, -1, 4, '2') + cloud(196, 862, 0.78, -1, 10) + cloud(318, 1012, 0.9, 1, -6, '2') + cloud(660, 1000, 0.7)
    // the under-flap left of the front edge sits a little deeper
    + `<path d="${lapel}L130,1216L140,900L180,800L300,770Z" fill="${K.redDeep}" opacity=".16"/>`
    + `<path d="${shadeR}" fill="${K.redDeep}" opacity=".58"/><path d="${coreR}" fill="${K.redDeep}" opacity=".4"/><path d="${shadeArm}" fill="${K.redDeep}" opacity=".35"/>`
    // inner-arm folds (cut-in-one sleeves: no armhole seam, just the fold where the arm meets the body)
    + `<path d="${taper([[204, 880], [230, 930], [236, 1040], [232, 1180]], { w: 4.4, start: 0.1, end: 0.4, peak: 0.4 })}${taper([[628, 880], [602, 930], [596, 1040], [600, 1180]], { w: 5, start: 0.1, end: 0.4, peak: 0.4 })}" fill="${K.redLine}" opacity=".85"/>`
    + `<path d="${taper([[174, 960], [182, 1030], [176, 1110]], { w: 5, start: 0.2, end: 0, peak: 0.4 })}${taper([[320, 900], [332, 980], [328, 1060]], { w: 4, start: 0.1, end: 0, peak: 0.4 })}" fill="${K.redLit}" opacity=".7"/>`
    + `<path d="${taper([[650, 980], [642, 1050], [648, 1130]], { w: 5, start: 0.2, end: 0, peak: 0.4 })}${taper([[540, 900], [528, 980], [532, 1060]], { w: 4, start: 0.1, end: 0, peak: 0.4 })}" fill="${K.redDeep}" opacity=".8"/>`
    + `<path d="${taper([[350, 716], [300, 732], [250, 752], [200, 780], [166, 812]], { w: 9, start: 0.2, end: 0, peak: 0.5 })}" fill="${K.redLit}" opacity=".9"/>`
    + `<path d="${taper([[160, 830], [148, 880], [144, 940]], { w: 6, start: 0.2, end: 0, peak: 0.4 })}" fill="${K.redLit}" opacity=".6"/>`
    + `</g>`;
  // wide woven border along the front edge (dark band, gold edges, gold pattern, accent piping)
  s += `<path d="${lapel}" transform="translate(-6 6)" fill="none" stroke="${K.redDeep}" stroke-width="12" opacity=".5"/>`
    + `<path d="${lapel}" fill="none" stroke="${K.goldLine}" stroke-width="25"/>`
    + `<path d="${lapel}" fill="none" stroke="${K.goldMid}" stroke-width="21"/>`
    + `<path d="${lapel}" fill="none" stroke="${K.band}" stroke-width="15"/>`
    + `<path d="${lapel}" fill="none" stroke="${K.goldMid}" stroke-width="4" stroke-dasharray="7 5"/>`
    + `<path d="${lapel}" fill="none" stroke="${pipe}" stroke-width="1.6" transform="translate(-9 -6)"/>`
    + frog(332, 818, -34, 0.95, pal.accent) + frog(274, 898, -62, 0.9, pal.accent);

  // ---- mandarin collar: two halves with rounded front corners, dark band with gold piping
  const half = sm([[411, 732, 1], [413, 700], [408, 680], [396, 674], [380, 670], [364, 660, 1], [352, 716, 1], [380, 726]], { closed: true });
  s += `<g stroke-linejoin="round"><path d="${half}" fill="${K.bandLit}" stroke="${K.goldLine}" stroke-width="7"/><path d="${half}" fill="none" stroke="${K.goldMid}" stroke-width="3.4"/>`
    + `<path d="${mirrorPath(half)}" fill="${K.band}" stroke="${K.goldLine}" stroke-width="7"/><path d="${mirrorPath(half)}" fill="none" stroke="${K.goldDeep}" stroke-width="3.4"/>`
    + `<path d="M368,678Q364,700 360,712" fill="none" stroke="${K.redLit}" stroke-width="2.6" stroke-linecap="round" opacity=".8"/>`
    + `<path d="M404,692Q392,684 378,688Q370,694 376,702M428,692Q440,684 454,688Q462,694 456,702" fill="none" stroke="${K.gold}" stroke-width="2" stroke-linecap="round" opacity=".85"/>`
    + frog(416, 702, 0, 0.62, pal.accent) + `</g>`;

  // ---- small fur collar resting on the shoulders, closed with a frog at the front
  const furPts = [[280, 762], [318, 742], [366, 750], [416, 768], [466, 750], [514, 742], [552, 762]];
  const fur = fluff(furPts, 24, (t) => 19 + 8 * Math.sin(t * Math.PI), rand);
  p.def(`<path id="${p.id('furShape')}" d="${fur}"/>`);
  p.def(`<clipPath id="${p.id('furClip')}"><use href="#${p.id('furShape')}"/></clipPath>`);
  const furClip = p.url('furClip');
  const furUse = (attrs) => `<use href="#${p.id('furShape')}" ${attrs}/>`;
  const furFill = p.lin('furFill', [[0, '#ffffff'], [0.45, K.fur], [1, K.furShade]], [0, 728, 0, 800]);
  const tuftLines = Array.from({ length: 16 }, (_, i) => {
    const t = (i + 0.5) / 16, x = 286 + t * 260, y = 756 + Math.sin(t * Math.PI) * 18 + (rand() - 0.5) * 8;
    return `M${Math.round(x - 5)},${Math.round(y - 3)}q${Math.round(4 + rand() * 4)},-5 ${Math.round(9 + rand() * 4)},1`;
  }).join('');
  s += furUse(`fill="${K.redDeep}" opacity=".55" transform="translate(4 12)"`)
    + furUse(`fill="${furFill}"`)
    + `<g clip-path="${furClip}"><path d="M440,700Q480,720 492,744Q500,770 470,820H600V700Z" fill="${K.furShade}" opacity=".8"/>`
    + `<path d="M260,782Q416,820 572,782L572,820H260Z" fill="${K.furDeep}" opacity=".45"/></g>`
    + furUse(`fill="none" stroke="${K.furLine}" stroke-width="2.4" stroke-linejoin="round"`)
    + `<path d="${tuftLines}" fill="none" stroke="${K.furDeep}" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`
    + `<path d="M292,750Q330,732 374,742" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>`
    + frog(416, 776, 0, 0.8, pal.accent);
  // jade bi-disc pendant on a red cord, accent knot and red tassel, hanging from the fur frog
  s += `<path d="M416,784V828" stroke="${K.redLine}" stroke-width="4.4"/><path d="M416,784V828" stroke="${K.redLit}" stroke-width="2"/>`
    + `<path d="M416,812l-7,7l7,7l7,-7z" fill="${pal.accent}" stroke="${K.redLine}" stroke-width="1.8"/>`
    + `<circle cx="416" cy="846" r="15" fill="none" stroke="#1f5a44" stroke-width="13.6"/><circle cx="416" cy="846" r="15" fill="none" stroke="#7fcfa6" stroke-width="10"/>`
    + `<path d="M405,840A13,13 0 0 1 418,834" fill="none" stroke="#d8fbe8" stroke-width="3" stroke-linecap="round"/><path d="M426,852A13,13 0 0 1 414,860" fill="none" stroke="#3f9a76" stroke-width="3" stroke-linecap="round"/>`
    + `<path d="M410,866h12l1,6h-14z" fill="${K.goldMid}" stroke="${K.goldLine}" stroke-width="1.6"/>`
    + `<path d="${taper([[416, 872], [416, 890], [417, 910]], { w: 12, start: 0.6, end: 0.95, peak: 0.75 })}" fill="${K.red}" stroke="${K.redLine}" stroke-width="2"/>`
    + `<path d="M413,876l-1,32M419,876l1,32" stroke="${K.redLit}" stroke-width="1.3"/>`;
  return s;
}

// ---------------------------------------------------------------- background: lanterns & far fireworks
// replaces the heroine's motif with a restrained festival night (low contrast, bottom left to the template fade)
function bgMotif(p) {
  const { n } = p.helpers;
  const glow = p.rad('lanternGlow', [[0, '#ff9a5a', 0.32], [0.5, '#ff6a3a', 0.1], [1, '#ff6a3a', 0]], { cx: 0.5, cy: 0.5, r: 0.5 }, 'objectBoundingBox');
  p.def(`<g id="${p.id('lantern')}" stroke-linejoin="round">`
    + `<rect x="-90" y="-90" width="180" height="180" fill="${glow}"/>`
    + `<path d="M0,-44V-400" stroke="#3a1018" stroke-width="2.4"/>`
    + `<ellipse rx="36" ry="38" fill="#8e1c2a" stroke="#2a0810" stroke-width="3"/>`
    + `<path d="M-12,-36Q-24,0 -12,36M12,-36Q24,0 12,36M0,-38V38" fill="none" stroke="#5c0f1b" stroke-width="2.4"/>`
    + `<path d="M24,-24Q34,0 24,24Q30,0 24,-24Z" fill="#5c0f1b"/><path d="M-26,-20Q-32,-4 -28,12" fill="none" stroke="#e05a5e" stroke-width="4" stroke-linecap="round" opacity=".8"/>`
    + `<rect x="-17" y="-46" width="34" height="9" rx="3" fill="#c08a3e" stroke="#3a2008" stroke-width="2"/><rect x="-15" y="37" width="30" height="9" rx="3" fill="#c08a3e" stroke="#3a2008" stroke-width="2"/>`
    + `<path d="M-6,46h12l3,38h-18z" fill="#a8202e" stroke="#2a0810" stroke-width="2"/><path d="M-2,50v32M3,50v32" stroke="#e05a5e" stroke-width="1.2"/>`
    + `</g>`);
  const L = (x, y, sc, op) => `<use href="#${p.id('lantern')}" transform="translate(${x} ${y}) scale(${sc})" opacity="${op}"/>`;
  const burst = (x, y, r, c, op) => {
    let d = '';
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + 0.2, r0 = r * 0.22;
      d += `M${n(x + Math.cos(a) * r0)},${n(y + Math.sin(a) * r0)}L${n(x + Math.cos(a) * r)},${n(y + Math.sin(a) * r)}`;
    }
    return `<path d="${d}" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="6 5" opacity="${op}"/>`;
  };
  return `<g fill="none">${burst(196, 150, 70, '#ffd28a', 0.28)}${burst(650, 96, 54, '#ff8a9a', 0.24)}${burst(110, 470, 40, '#ffd28a', 0.16)}${burst(742, 520, 46, '#ffd28a', 0.18)}</g>`
    + L(176, 96, 0.55, 0.55) + L(668, 140, 0.6, 0.6) + L(92, 236, 0.95, 0.85) + L(744, 290, 1, 0.85)
    + `<path d="M0,40Q200,92 416,70Q630,92 832,36" fill="none" stroke="#3a1018" stroke-width="2" opacity=".7"/>`;
}

// ---------------------------------------------------------------- plum-blossom hairpin with tassel
// spot per heroine: [x, y, mirror] - away from each heroine's own head ornaments
const SPOT = {
  default: [552, 292, 0], lia: [550, 288, 0], freya: [554, 296, 0], serena: [552, 296, 0],
  aila: [280, 292, 1], lilith: [282, 290, 1], mia: [560, 324, 0], ophelia: [560, 354, 0], evelyn: [568, 404, 0],
};
function blossom(x, y, r, open = 1) {
  let d = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const px = x + Math.cos(a) * r * 0.56, py = y + Math.sin(a) * r * 0.56;
    d += `M${(px + r * 0.5).toFixed(1)},${py.toFixed(1)}a${(r * 0.5).toFixed(1)},${(r * 0.5).toFixed(1)} 0 1 0 ${(-r).toFixed(1)},0a${(r * 0.5).toFixed(1)},${(r * 0.5).toFixed(1)} 0 1 0 ${r.toFixed(1)},0`;
  }
  return `<path d="${d}" fill="${open ? K.plum : K.plumShade}" stroke="${K.plumLine}" stroke-width="1.8"/>`
    + `<circle cx="${x - r * 0.25}" cy="${y - r * 0.3}" r="${(r * 0.38).toFixed(1)}" fill="${K.plumLit}" opacity=".8"/>`
    + `<circle cx="${x}" cy="${y}" r="${(r * 0.26).toFixed(1)}" fill="${K.gold}" stroke="${K.goldLine}" stroke-width="1.2"/>`;
}
function hairOrnament(p) {
  const { taper } = p.helpers;
  const [x, y, m] = SPOT[p.heroine.id] || SPOT.default;
  // mirror for left-side spots, and scale up a touch around the spot so it reads on 240px cards
  const tf = `${m ? `translate(${2 * x} 0) scale(-1 1) ` : ''}translate(${x} ${y}) scale(1.15) translate(${-x} ${-y})`;
  // pin stick slides into the hair toward the back of the head
  const stick = `M${x + 4},${y + 6}L${x - 46},${y - 34}`;
  const tx = x + 16, ty = y + 14;
  const tassel = taper([[tx, ty + 30], [tx + 1, ty + 52], [tx + 4, ty + 74]], { w: 13, start: 0.55, end: 0.9, peak: 0.7 });
  return `<g transform="${tf}" stroke-linejoin="round">`
    + `<path d="${stick}" stroke="${K.goldLine}" stroke-width="7" stroke-linecap="round"/><path d="${stick}" stroke="${K.goldMid}" stroke-width="3.6" stroke-linecap="round"/>`
    + `<path d="M${tx - 4},${ty - 6}Q${tx + 2},${ty + 10} ${tx},${ty + 24}" fill="none" stroke="${K.redLine}" stroke-width="2.4"/>`
    + `<circle cx="${tx}" cy="${ty + 22}" r="4.6" fill="${p.palette.accent}" stroke="${K.goldLine}" stroke-width="1.6"/>`
    + `<path d="M${tx - 5},${ty + 27}h10l2,7h-14z" fill="${K.goldMid}" stroke="${K.goldLine}" stroke-width="1.6"/>`
    + `<path d="${tassel}" fill="${K.red}" stroke="${K.redLine}" stroke-width="2"/>`
    + `<path d="M${tx - 2},${ty + 38}l-1,32M${tx + 3},${ty + 38}l2,34" stroke="${K.redLit}" stroke-width="1.4"/>`
    + blossom(x + 14, y - 12, 13, 0) + blossom(x - 6, y + 2, 17) + blossom(x + 18, y + 10, 12)
    + `<path d="M${x - 24},${y - 8}l-6,-6M${x - 20},${y - 14}l-3,-8" stroke="${K.goldDeep}" stroke-width="2" stroke-linecap="round"/>`
    + `<circle cx="${x - 31}" cy="${y - 15}" r="2.6" fill="${K.gold}"/><circle cx="${x - 24}" cy="${y - 23}" r="2.6" fill="${K.gold}"/>`
    + `</g>`;
}

export default {
  type: 'newyear',
  label: '新年服',
  render,
  bgMotif,
  hairOrnament,
};
