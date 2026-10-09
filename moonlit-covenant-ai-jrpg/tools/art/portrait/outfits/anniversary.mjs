// 周年庆服 - white & gold gala gown: modest high neckline with a jewelled gold collar band, gold
// filigree yoke with a scalloped edge, layered petal cap sleeves, satin bodice with gold princess
// seams, a diagonal star sash (heroine colour) with a radiant star medal. Ornament: small tiara.
// Identity colours (white satin / gold) stay; the sash, gems and tiara stones follow the heroine.
import { sampleSpline, mix } from '../base.mjs';

const K = {
  white: '#f8f5fb', whiteShade: '#d7cfe7', whiteDeep: '#ada2c8', whiteLit: '#ffffff', whiteLine: '#5c5378',
  gold: '#ffd796', goldMid: '#e6aa52', goldDeep: '#a26a2a', goldLine: '#5a3510',
};
// heroines whose standard colour is itself gold get their secondary colour on the sash
const SASH = { aila: '#4f7dff', evelyn: '#7fb2ff' };
const ip = (q) => `${Math.round(q[0])},${Math.round(q[1])}`;

const star = (x, y, R, r, k = 5, rot = -Math.PI / 2) => {
  let d = '';
  for (let i = 0; i < k * 2; i++) {
    const a = rot + (i * Math.PI) / k, rr = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`;
  }
  return `${d}Z`;
};

function render(p) {
  const { smooth: sm, taper } = p.helpers;
  const pal = p.palette;
  const sashC = SASH[p.heroine.id] || pal.accent;
  const S = { base: sashC, shade: mix(sashC, '#1a1030', 0.4), deep: mix(sashC, '#100a20', 0.62), lit: mix(sashC, '#ffffff', 0.4), line: mix(sashC, '#0c0614', 0.72) };
  const MIR = 'matrix(-1 0 0 1 832 0)';
  let s = '';

  // ---- satin gown base with a high neckline rising a little up the neck
  const gown = sm([[60, 700, 1], [356, 664, 1], [380, 676], [416, 684], [452, 676], [476, 664, 1], [772, 700, 1], [772, 1216, 1], [60, 1216, 1]], { closed: true });
  const satin = p.lin('satin', [[0, K.whiteLit], [0.35, K.white], [1, K.whiteShade]], [0, 680, 0, 1150]);
  const shadeR = sm([[476, 780], [536, 762], [600, 786], [650, 830], [700, 920], [702, 1216, 1], [524, 1216, 1], [512, 1060], [500, 930], [488, 840]], { closed: true });
  p.def(`<pattern id="${p.id('brocade')}" width="56" height="56" patternUnits="userSpaceOnUse"><path d="${star(14, 14, 6, 2.4, 4)}${star(42, 42, 6, 2.4, 4)}M42,12h2v2h-2zM12,42h2v2h-2z" fill="${K.whiteDeep}" opacity=".32"/></pattern>`);
  s += `<g clip-path="${p.refs.bodyClip}"><path d="${gown}" fill="${satin}"/><path d="${gown}" fill="url(#${p.id('brocade')})"/>`
    + `<path d="${shadeR}" fill="${K.whiteShade}"/>`
    + `<path d="M600,880Q650,900 690,960L702,1216H640Q630,1040 600,880Z" fill="${K.whiteDeep}" opacity=".6"/>`
    + `<path d="${p.shapes.armSeamL}${p.shapes.armSeamR}" fill="none" stroke="${K.whiteLine}" stroke-width="2.6" opacity=".8"/>`
    // princess seams piped in gold + satin sheen
    + `<path d="M352,812Q344,940 352,1216M480,812Q488,940 480,1216" fill="none" stroke="${K.goldLine}" stroke-width="4.6"/>`
    + `<path d="M352,812Q344,940 352,1216M480,812Q488,940 480,1216" fill="none" stroke="${K.goldMid}" stroke-width="2.4"/>`
    + `<path d="${taper([[378, 840], [372, 940], [376, 1040]], { w: 12, start: 0.1, end: 0.1, peak: 0.45 })}" fill="#fff"/>`
    + `<path d="M349,850q-12,6 -12,18M347,900q12,6 12,18M347,950q-12,6 -12,18M483,850q12,6 12,18M485,900q-12,6 -12,18M485,950q12,6 12,18" fill="none" stroke="${K.goldMid}" stroke-width="2.2" stroke-linecap="round"/>`
    + `<path d="${taper([[176, 960], [184, 1040], [178, 1120]], { w: 5, start: 0.2, end: 0, peak: 0.4 })}" fill="${K.whiteShade}"/>`
    + `<path d="${taper([[650, 980], [642, 1050], [648, 1130]], { w: 5, start: 0.2, end: 0, peak: 0.4 })}" fill="${K.whiteDeep}"/>`
    + `</g>`;

  // ---- yoke: gold filigree over the upper chest, scalloped gold edge (left half drawn, mirrored)
  const scal = [[416, 818], [384, 812], [354, 800], [326, 784], [300, 766], [278, 750]];
  let edge = `M${ip(scal[0])}`;
  for (let i = 1; i < scal.length; i++) edge += `A17 17 0 0 0 ${ip(scal[i])}`;
  const fil = 'M408,700C394,716 376,722 364,714C354,707 358,694 368,698'
    + 'M404,716C392,740 366,754 340,748C326,744 326,730 338,730'
    + 'M398,740C392,764 376,782 352,786C340,788 336,776 346,772'
    + 'M370,760C352,756 336,764 330,776M338,730C330,718 336,708 346,708M310,756C318,744 330,742 340,748';
  p.def(`<g id="${p.id('yoke')}"><path d="${edge}" fill="none" stroke="${K.goldLine}" stroke-width="6" stroke-linecap="round"/>`
    + `<path d="${edge}" fill="none" stroke="${K.goldMid}" stroke-width="3.2" stroke-linecap="round"/>`
    + `<path d="${fil}" fill="none" stroke="${K.goldDeep}" stroke-width="4.4" stroke-linecap="round"/>`
    + `<path d="${fil}" fill="none" stroke="${K.gold}" stroke-width="2.2" stroke-linecap="round"/>`
    + scal.slice(1).map(([x, y]) => `<circle cx="${x}" cy="${y + 7}" r="3" fill="${K.gold}" stroke="${K.goldLine}" stroke-width="1.2"/>`).join('')
    + `</g>`);
  s += `<use href="#${p.id('yoke')}"/><use href="#${p.id('yoke')}" transform="${MIR}" opacity=".8"/>`
    + `<path d="${star(416, 760, 15, 6, 4)}" fill="${K.goldMid}" stroke="${K.goldLine}" stroke-width="2"/><circle cx="416" cy="760" r="4.6" fill="${S.base}" stroke="${K.goldLine}" stroke-width="1.4"/>`;

  // ---- jewelled collar band at the high neckline
  const band = taper([[360, 668], [388, 682], [416, 688], [444, 682], [472, 668]], { w: 13, start: 1, end: 1, peak: 0.5 });
  s += `<path d="${band}" fill="${K.goldMid}" stroke="${K.goldLine}" stroke-width="2.4"/>`
    + `<path d="M364,666Q416,690 468,666" fill="none" stroke="${K.gold}" stroke-width="2" opacity=".9"/>`
    + `<path d="M438,684Q456,678 470,668L474,676Q456,688 438,692Z" fill="${K.goldDeep}" opacity=".6"/>`
    + `<path d="M416,694l7,10l-7,12l-7,-12z" fill="${S.base}" stroke="${K.goldLine}" stroke-width="2"/><circle cx="414" cy="702" r="1.8" fill="#fff"/>`
    + `<ellipse cx="416" cy="689" rx="6.4" ry="6" fill="${K.gold}" stroke="${K.goldLine}" stroke-width="1.8"/>`;

  // ---- soft gathered satin puff sleeves, gold-embroidered band at the hem of the puff
  const puff = sm([[256, 752], [222, 742], [184, 748], [154, 770], [134, 806], [128, 850], [136, 886], [148, 906, 1], [196, 916], [244, 904, 1], [250, 860], [254, 800]], { closed: true });
  const pleat = (pts, w) => taper(pts, { w, start: 0.9, end: 0, peak: 0.12 });
  const folds = pleat([[248, 762], [222, 790], [208, 836], [206, 876]], 5) + pleat([[242, 756], [204, 766], [172, 800], [160, 850]], 5)
    + pleat([[160, 902], [154, 878], [156, 856]], 5) + pleat([[204, 912], [204, 886], [208, 864]], 5);
  const cuff = sm([[146, 900, 1], [196, 910], [246, 898, 1], [248, 922, 1], [196, 934], [148, 924, 1]], { closed: true });
  p.def(`<g id="${p.id('cap')}" stroke-linejoin="round">`
    + `<path d="${puff}" fill="${K.white}" stroke="${K.whiteLine}" stroke-width="3"/>`
    + `<path d="${sm([[131, 866], [150, 884], [196, 894], [248, 884], [244, 904, 1], [196, 916], [148, 906, 1], [136, 886]], { closed: true })}" fill="${K.whiteShade}"/>`
    + `<path d="${folds}" fill="${K.whiteDeep}" opacity=".8"/>`
    + `<path d="${taper([[244, 750], [206, 746], [170, 762], [146, 794], [134, 836]], { w: 12, start: 0.2, end: 0, peak: 0.45 })}" fill="#fff"/>`
    + `<path d="${cuff}" fill="${K.goldMid}" stroke="${K.goldLine}" stroke-width="2.4"/>`
    + `<path d="M152,912Q196,922 242,910" fill="none" stroke="${K.goldDeep}" stroke-width="2" stroke-dasharray="3 4"/>`
    + `<path d="M150,904Q196,914 244,902" fill="none" stroke="${K.gold}" stroke-width="1.6"/>`
    + `<path d="${star(214, 778, 9, 3.6, 4)}" fill="${K.goldMid}" stroke="${K.goldLine}" stroke-width="1.4"/>`
    + `</g>`);
  s += `<use href="#${p.id('cap')}"/><use href="#${p.id('cap')}" transform="${MIR}"/>`
    + `<g transform="${MIR}"><path d="${puff}" fill="${K.whiteDeep}" opacity=".4"/><path d="${cuff}" fill="${K.goldDeep}" opacity=".35"/></g>`;

  // ---- star sash: viewer's left shoulder to the right hip, gold-edged, small gold stars
  const sashPts = [[206, 704], [252, 754], [304, 812], [362, 876], [424, 944], [488, 1012], [556, 1082], [620, 1150]];
  const sashD = taper(sashPts, { w: 50, start: 1, end: 1, peak: 0.5 });
  const C = sampleSpline(sashPts, 10);
  s += `<g clip-path="${p.refs.bodyClip}"><path d="${sashD}" transform="translate(-4 9)" fill="${K.whiteDeep}" opacity=".7"/>`
    + `<path d="${sashD}" fill="${p.lin('sash', [[0, S.lit], [0.25, S.base], [1, S.shade]], [260, 740, 560, 1100])}" stroke="${S.line}" stroke-width="2.6" stroke-linejoin="round"/>`
    + `<path d="${taper(sashPts, { w: 40, start: 1, end: 1, peak: 0.5 })}" fill="none" stroke="${K.goldMid}" stroke-width="2.2"/>`
    + `<path d="${taper(sashPts.slice(0, 4), { w: 8, start: 0.3, end: 0.2, peak: 0.4 })}" transform="translate(-11 6)" fill="${S.lit}" opacity=".8"/>`
    + `<path d="${C.slice(2, -1).map(([x, y]) => star(x, y, 7, 3)).join('')}" fill="${K.gold}" stroke="${K.goldLine}" stroke-width="1.2"/></g>`;
  // radiant star medal pinned low on the sash
  const mx = 500, my = 1012;
  s += `<path d="${star(mx, my, 34, 14, 8, -Math.PI / 2)}" fill="${K.goldMid}" stroke="${K.goldLine}" stroke-width="2.4" stroke-linejoin="round"/>`
    + `<path d="${star(mx, my, 24, 10, 8, -Math.PI / 2 + Math.PI / 8)}" fill="${K.gold}" stroke="${K.goldDeep}" stroke-width="1.4"/>`
    + `<circle cx="${mx}" cy="${my}" r="10" fill="${S.base}" stroke="${K.goldLine}" stroke-width="2"/><circle cx="${mx - 3}" cy="${my - 3.4}" r="3.2" fill="#fff" opacity=".9"/>`;
  return s;
}

// ---------------------------------------------------------------- background: gala light, star confetti, streamers
function bgMotif(p) {
  const { n, rng } = p.helpers;
  const rand = rng(`${p.heroine.id}-gala`);
  const sashC = SASH[p.heroine.id] || p.palette.accent;
  // soft radiant rays behind the figure
  let rays = '';
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI / 2 + (i - 6.5) * 0.2, w = 0.035;
    rays += `M416,430L${n(416 + Math.cos(a - w) * 900)},${n(430 + Math.sin(a - w) * 900)}L${n(416 + Math.cos(a + w) * 900)},${n(430 + Math.sin(a + w) * 900)}Z`;
  }
  // confetti: little four-point stars and dots, mostly at the sides
  let stars = '', dots = '';
  for (let i = 0; i < 26; i++) {
    const x = rand() < 0.5 ? 20 + rand() * 220 : 592 + rand() * 220, y = 30 + rand() * 820, r = 4 + rand() * 9;
    if (i % 3) stars += star(x, y, r, r * 0.32, 4, rand());
    else dots += `M${n(x)},${n(y)}h0`;
  }
  // bokeh: soft out-of-focus gala lights, rings + discs
  let bok = '', ring = '';
  const brand = rng(`${p.heroine.id}-bokeh`);
  for (let i = 0; i < 16; i++) {
    const x = brand() < 0.5 ? brand() * 230 : 602 + brand() * 230, y = 40 + brand() * 720, r = 12 + brand() * 30;
    const c = `M${n(x - r)},${n(y)}a${n(r)},${n(r)} 0 1 0 ${n(2 * r)},0a${n(r)},${n(r)} 0 1 0 ${n(-2 * r)},0`;
    if (i % 2) bok += c; else ring += c;
  }
  return `<path d="${rays}" fill="#ffd796" opacity=".05"/>`
    + `<path d="${bok}" fill="#ffd796" opacity=".07"/><path d="${ring}" fill="${sashC}" fill-opacity=".06" stroke="${sashC}" stroke-width="2" stroke-opacity=".22"/>`
    + `<path d="${stars}" fill="#ffd796" opacity=".5"/>`
    + `<path d="${dots}" stroke="${sashC}" stroke-width="7" stroke-linecap="round" opacity=".45"/>`;
}

// ---------------------------------------------------------------- small tiara
// [cx, band y at the centre, half width]; Evelyn already wears a circlet, she gets a star clip
const TIARA = { default: [416, 232, 74], lia: [416, 226, 74], mia: [416, 238, 66], ophelia: [416, 230, 70], lilith: [416, 222, 74], aila: [416, 228, 74], serena: [416, 228, 72], freya: [416, 230, 72] };
function hairOrnament(p) {
  const { taper } = p.helpers;
  const gem = SASH[p.heroine.id] || p.palette.accent;
  if (p.heroine.id === 'evelyn') {
    const x = 284, y = 402;
    return `<path d="${star(x, y, 20, 8)}" fill="${K.goldMid}" stroke="${K.goldLine}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="${x}" cy="${y}" r="6" fill="${gem}" stroke="${K.goldLine}" stroke-width="1.6"/><circle cx="${x - 2}" cy="${y - 2}" r="1.8" fill="#fff"/>`;
  }
  const [cx, by, hw] = TIARA[p.heroine.id] || TIARA.default;
  // band sags in the middle (we look slightly down on the crown); peaks fall off toward the sides
  const bandPts = [[cx - hw, by - 14], [cx - hw * 0.5, by - 2], [cx, by + 2], [cx + hw * 0.5, by - 2], [cx + hw, by - 14]];
  const yAt = (x) => by + 2 - 16 * ((x - cx) / hw) ** 2;
  const peaks = [-0.78, -0.52, -0.26, 0, 0.26, 0.52, 0.78].map((t) => {
    const x = cx + t * hw, y = yAt(x), h = 34 * (1 - Math.abs(t) * 0.85);
    return `M${(x - 9).toFixed(1)},${(y - 3).toFixed(1)}Q${(x - 3).toFixed(1)},${(y - h * 0.5).toFixed(1)} ${x.toFixed(1)},${(y - h).toFixed(1)}Q${(x + 3).toFixed(1)},${(y - h * 0.5).toFixed(1)} ${(x + 9).toFixed(1)},${(y - 3).toFixed(1)}Z`;
  }).join('');
  const pearls = [-0.52, -0.26, 0.26, 0.52].map((t) => {
    const x = cx + t * hw, h = 34 * (1 - Math.abs(t) * 0.85);
    return `<circle cx="${x.toFixed(1)}" cy="${(yAt(x) - h - 3).toFixed(1)}" r="3.4" fill="#fff" stroke="${K.goldLine}" stroke-width="1.2"/>`;
  }).join('');
  const bandD = taper(bandPts, { w: 9, start: 0.6, end: 0.6, peak: 0.5 });
  return `<g stroke-linejoin="round">`
    + `<path d="${bandD}" fill="${p.palette.hairDeep}" opacity=".45" transform="translate(3 7)"/>`
    + `<path d="${peaks}" fill="${p.lin('tiaraPeaks', [[0, K.gold], [0.5, K.goldMid], [1, K.goldDeep]], [cx - hw, 0, cx + hw, 0])}" stroke="${K.goldLine}" stroke-width="2"/>`
    + `<path d="${bandD}" fill="${p.lin('tiaraBand', [[0, '#fff1cf'], [0.4, K.gold], [1, K.goldMid]], [0, by - 18, 0, by + 8])}" stroke="${K.goldLine}" stroke-width="2.2"/>`
    + `<path d="M${cx - hw * 0.8},${by - 10}Q${cx - hw * 0.4},${by - 1} ${cx},${by}" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`
    + [-0.5, 0.5].map((t) => `<circle cx="${(cx + t * hw).toFixed(1)}" cy="${(yAt(cx + t * hw) - 1).toFixed(1)}" r="2.8" fill="${gem}" stroke="${K.goldLine}" stroke-width="1"/>`).join('')
    + pearls
    + `<path d="${star(cx, by - 30, 15, 6)}" fill="${K.gold}" stroke="${K.goldLine}" stroke-width="2"/>`
    + `<circle cx="${cx}" cy="${by - 30}" r="5.4" fill="${gem}" stroke="${K.goldLine}" stroke-width="1.6"/><circle cx="${cx - 1.8}" cy="${by - 32}" r="1.7" fill="#fff"/>`
    + `<ellipse cx="${cx}" cy="${by + 1}" rx="5" ry="4" fill="${gem}" stroke="${K.goldLine}" stroke-width="1.4"/>`
    + `</g>`;
}

export default {
  type: 'anniversary',
  label: '周年庆服',
  render,
  bgMotif,
  hairOrnament,
};
