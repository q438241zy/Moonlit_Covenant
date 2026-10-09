// 夏日度假服 (type kept as 'swimsuit' for save/data compatibility) - a modest summer RESORT
// outfit, not swimwear: white eyelet-cotton sundress with a ruffled round neckline, smocked
// bodice and a ribbon drawstring, under a light open knit cardigan in a pastel of the heroine's
// colour; a fine gold chain with a small shell pendant. Ornament: hibiscus & plumeria flower clip.
import { sampleSpline, mix } from '../base.mjs';

const K = {
  sky: '#7fb9ee',
  cotton: '#fbfaf6', cottonShade: '#dcdbe4', cottonDeep: '#b5b3c6', cottonLine: '#62607a',
  gold: '#ffd796', goldMid: '#e6aa52', goldLine: '#5a3510',
  leaf: '#4f9a5e', leafShade: '#33703f', leafLine: '#173a1f',
  plumeria: '#fffdf6', plumCore: '#ffd24a',
};
const ip = (q) => `${Math.round(q[0])},${Math.round(q[1])}`;

function frame(pts, count) {
  const c = sampleSpline(pts, count);
  return c.map((q, i) => {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(count - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
    return { q, nx: dy / m, ny: -dx / m };
  });
}
/** soft ruffle: band from the inner edge outward with scalloped outer edge */
function ruffle(pts, count, w, side = 1) {
  const F = frame(pts, count);
  const inner = F.map(({ q }) => q);
  const outer = F.map(({ q, nx, ny }) => [q[0] + nx * w * side, q[1] + ny * w * side]);
  let d = `M${ip(inner[0])}`;
  for (let i = 1; i < count; i++) d += `L${ip(inner[i])}`;
  d += `L${ip(outer[count - 1])}`;
  for (let i = count - 2; i >= 0; i--) {
    const a = outer[i + 1], b = outer[i];
    const r = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.6);
    const tx = b[0] - a[0], ty = b[1] - a[1], ox = outer[i][0] - inner[i][0], oy = outer[i][1] - inner[i][1];
    d += `A${r} ${r} 0 0 ${ty * ox - tx * oy > 0 ? 1 : 0} ${ip(b)}`;
  }
  let g = '';
  for (let i = 1; i < count - 1; i++) g += `M${ip(inner[i])}L${ip([inner[i][0] + (outer[i][0] - inner[i][0]) * 0.8, inner[i][1] + (outer[i][1] - inner[i][1]) * 0.8])}`;
  return { d: `${d}Z`, gathers: g };
}

function render(p) {
  const { smooth: sm, taper } = p.helpers;
  const pal = p.palette;
  const MIR = 'matrix(-1 0 0 1 832 0)';
  // cardigan: soft pastel of the heroine colour
  // gold-standard heroines (Aila, Evelyn) wear their secondary blue so the knit doesn't turn beige
  const knit = mix({ aila: '#5f86ff', evelyn: '#7fb2ff' }[p.heroine.id] || pal.accent, '#ffffff', 0.58);
  const C = { base: knit, shade: mix(knit, '#4a3a6a', 0.24), deep: mix(knit, '#2a2040', 0.42), lit: mix(knit, '#ffffff', 0.5), line: mix(pal.accent, '#1a1028', 0.6) };
  const ribbon = mix(pal.accent, '#2a1838', 0.08);
  let s = '';

  // ---- cotton sundress with a ditsy sky-blue floral print, round neckline at the collarbones
  const fl = (x, y, r) => {
    let d = '';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      d += `M${(x + Math.cos(a) * r * 1.1 + r * 0.62).toFixed(1)},${(y + Math.sin(a) * r * 1.1).toFixed(1)}a${(r * 0.62).toFixed(1)},${(r * 0.62).toFixed(1)} 0 1 0 ${(-r * 1.24).toFixed(1)},0a${(r * 0.62).toFixed(1)},${(r * 0.62).toFixed(1)} 0 1 0 ${(r * 1.24).toFixed(1)},0`;
    }
    return d;
  };
  p.def(`<pattern id="${p.id('print')}" width="52" height="52" patternUnits="userSpaceOnUse" patternTransform="rotate(-10)">`
    + `<path d="M22,17q6,-8 12,-6q-4,7 -12,6zM42,44q-7,-5 -6,-12q7,3 6,12z" fill="#8cc79a"/>`
    + `<path d="${fl(14, 14, 4.2)}${fl(36, 36, 3.4)}" fill="${K.sky}"/>`
    + `<path d="M14,14h0M36,36h0" stroke="${K.plumCore}" stroke-width="3.4" stroke-linecap="round"/></pattern>`);
  const dress = sm([[200, 760, 1], [300, 704, 1], [352, 710], [384, 724], [416, 728], [448, 724], [480, 710], [532, 704, 1], [632, 760, 1], [632, 1216, 1], [200, 1216, 1]], { closed: true });
  const cotton = p.lin('cotton', [[0, '#ffffff'], [0.45, K.cotton], [1, K.cottonShade]], [0, 700, 0, 1150]);
  s += `<g clip-path="${p.refs.torsoClip}"><path d="${dress}" fill="${cotton}"/><path d="${dress}" fill="url(#${p.id('print')})" opacity=".9"/>`
    // smocking rows under the neckline + soft vertical drape + right-side shade
    + `<path d="${[772, 790].map((y) => `M352,${y}q8,-5 16,0t16,0t16,0t16,0t16,0t16,0t16,0t16,0`).join('')}" fill="none" stroke="${K.cottonDeep}" stroke-width="1.8"/>`
    + `<path d="${taper([[384, 830], [378, 930], [384, 1030]], { w: 12, start: 0.1, end: 0.1, peak: 0.45 })}" fill="#fff" opacity=".7"/>`
    + `<path d="M470,800Q520,790 600,820V1216H500Q500,1000 470,800Z" fill="${K.cottonDeep}" opacity=".35"/>`
    + `</g>`;
  // waist ribbon tied in a bow on the viewer's right (turns it from a shift into a sundress)
  const sash = sm([[236, 990, 1], [330, 1000], [416, 1004], [502, 1000], [596, 990, 1], [596, 1016, 1], [502, 1026], [416, 1030], [330, 1026], [236, 1016, 1]], { closed: true });
  const rS = mix(ribbon, '#1a1028', 0.3);
  s += `<g clip-path="${p.refs.torsoClip}"><path d="${sash}" fill="${ribbon}" stroke="${mix(ribbon, '#000000', 0.55)}" stroke-width="2.4"/>`
    + `<path d="M470,1002Q540,999 596,990L596,1016Q540,1024 470,1028Z" fill="${rS}"/>`
    + `<path d="M250,998Q330,1008 400,1010" fill="none" stroke="${mix(ribbon, '#ffffff', 0.45)}" stroke-width="2.4" stroke-linecap="round"/></g>`
    + `<path d="M500,1012C484,990 456,990 460,1010C462,1028 488,1024 500,1014ZM500,1012C520,990 548,994 542,1014C538,1030 512,1024 500,1014Z" fill="${ribbon}" stroke="${mix(ribbon, '#000000', 0.55)}" stroke-width="2.2" stroke-linejoin="round"/>`
    + `<path d="M496,1016L482,1070L492,1064L498,1074L504,1018ZM504,1016L526,1066L516,1062L512,1072L498,1018Z" fill="${rS}" stroke="${mix(ribbon, '#000000', 0.55)}" stroke-width="2" stroke-linejoin="round"/>`
    + `<rect x="492" y="1004" width="16" height="18" rx="5" fill="${ribbon}" stroke="${mix(ribbon, '#000000', 0.55)}" stroke-width="2"/>`;

  // ruffled neckline + ribbon drawstring with a small bow
  const neck = [[350, 712], [384, 726], [416, 730], [448, 726], [482, 712]];
  const rf = ruffle(neck, 13, 14, -1);
  s += `<path d="${rf.d}" fill="${K.cotton}" stroke="${K.cottonLine}" stroke-width="2" stroke-linejoin="round"/>`
    + `<path d="${rf.gathers}" fill="none" stroke="${K.cottonDeep}" stroke-width="1.4"/>`
    + `<path d="M440,726Q462,722 482,712L488,724Q466,738 444,740Z" fill="${K.cottonShade}" opacity=".8"/>`
    + `<path d="M356,718Q416,744 476,718" fill="none" stroke="${ribbon}" stroke-width="3.4"/>`
    + `<path d="M416,738l-16,-9l-2,15zM416,738l16,-9l2,15z" fill="${ribbon}" stroke="${mix(ribbon, '#000000', 0.55)}" stroke-width="1.6" stroke-linejoin="round"/>`
    + `<path d="M413,741l-6,22M419,741l7,21" stroke="${ribbon}" stroke-width="3" stroke-linecap="round"/>`
    + `<circle cx="416" cy="738" r="3.6" fill="${mix(ribbon, '#000000', 0.25)}"/>`;

  // ---- cropped open knit cardigan with elbow sleeves: left half drawn, right half mirrored into shade
  const panel = sm([[364, 690], [352, 716], [342, 770], [337, 840], [335, 884, 1], [300, 898], [262, 904], [240, 904, 1], [238, 1000], [238, 1096, 1], [40, 1096, 1], [40, 690, 1]], { closed: true });
  p.def(`<pattern id="${p.id('rib')}" width="9" height="40" patternUnits="userSpaceOnUse"><path d="M4.5,0V40" stroke="${C.deep}" stroke-width="1.6" opacity=".2"/></pattern>`);
  p.def(`<clipPath id="${p.id('panelClip')}"><path d="${panel}"/></clipPath>`);
  const frontPts = [[362, 694], [351, 720], [342, 770], [338, 830], [336, 884]];
  const hemPts = [[340, 880], [300, 892], [262, 896], [236, 896]];
  const ribBand = (pts, w, n) => {
    const d = taper(pts, { w, start: 1, end: 1, peak: 0.5 });
    const r = frame(pts, n).slice(1, -1).map(({ q, nx, ny }) => `M${ip([q[0] - nx * w * 0.4, q[1] - ny * w * 0.4])}L${ip([q[0] + nx * w * 0.4, q[1] + ny * w * 0.4])}`).join('');
    return `<path d="${d}" fill="${C.base}" stroke="${C.line}" stroke-width="2.2" stroke-linejoin="round"/><path d="${r}" stroke="${C.shade}" stroke-width="1.6"/>`;
  };
  const folds = taper([[176, 900], [186, 990], [180, 1070]], { w: 6, start: 0.2, end: 0, peak: 0.4 }) + taper([[214, 960], [222, 1040]], { w: 5, start: 0.2, end: 0, peak: 0.4 })
    + taper([[270, 800], [290, 850], [296, 884]], { w: 5, start: 0.1, end: 0, peak: 0.5 });
  p.def(`<g id="${p.id('cardi')}"><g clip-path="${p.refs.bodyClip}"><g clip-path="url(#${p.id('panelClip')})">`
    + `<rect x="40" y="680" width="330" height="420" fill="${C.base}"/><rect x="40" y="680" width="330" height="420" fill="url(#${p.id('rib')})"/>`
    + `<path d="${p.shapes.armSeamL}" fill="none" stroke="${C.line}" stroke-width="2.6" opacity=".7"/>`
    + `<path d="${folds}" fill="${C.shade}"/>`
    + `<path d="${taper([[346, 708], [300, 724], [250, 746], [204, 772], [168, 806], [150, 850]], { w: 12, start: 0.2, end: 0, peak: 0.5 })}" fill="${C.lit}" opacity=".9"/>`
    + `</g></g>`
    + `<g clip-path="${p.refs.bodyClip}">${ribBand([[132, 1082], [186, 1090], [240, 1082]], 22, 12)}</g>`
    + ribBand(hemPts, 20, 8) + ribBand(frontPts, 20, 14)
    + `</g>`);
  s += `<path d="M236,904L340,890L344,920L236,930Z" fill="${K.cottonDeep}" opacity=".35"/>`
    + `<use href="#${p.id('cardi')}"/>`
    + [748, 800, 852].map((y, i) => `<circle cx="${347 - i * 3.4}" cy="${y}" r="5" fill="#fffaf2" stroke="${C.line}" stroke-width="1.6"/><circle cx="${345.6 - i * 3.4}" cy="${y - 1.5}" r="1.6" fill="#fff"/>`).join('')
    + `<use href="#${p.id('cardi')}" transform="${MIR}"/>`
    + `<g transform="${MIR}" clip-path="${p.refs.bodyClip}"><path d="${panel}" fill="${C.deep}" opacity=".3"/></g>`
    // shadow the cardigan front edges cast on the dress
    + `<path d="${taper(frontPts.slice(1), { w: 9, start: 0.6, end: 0.3, peak: 0.5 })}" transform="translate(14 4)" fill="${K.cottonDeep}" opacity=".4"/>`;

  // ---- fine gold chain with a small scallop-shell pendant
  const chain = 'M372,690Q384,742 416,756Q448,742 460,690';
  s += `<path d="${chain}" fill="none" stroke="${K.goldLine}" stroke-width="2.6" opacity=".7"/><path d="${chain}" fill="none" stroke="${K.gold}" stroke-width="1.4" stroke-dasharray="2.6 1.6"/>`
    + `<path d="M416,754C404,756 400,770 406,776Q416,782 426,776C432,770 428,756 416,754Z" fill="#fff4ea" stroke="${K.goldLine}" stroke-width="1.6"/>`
    + `<path d="M416,758V778M410,760L407,774M422,760L425,774" stroke="${K.goldMid}" stroke-width="1.2"/>`
    + `<circle cx="416" cy="753" r="2.6" fill="${K.goldMid}" stroke="${K.goldLine}" stroke-width="1"/>`;
  return s;
}

// ---------------------------------------------------------------- background: summer night by the sea
function bgMotif(p) {
  const { n, rng, sampleSpline } = p.helpers;
  const rand = rng(`${p.heroine.id}-summer`);
  // palm fronds from the top corners: spine + leaflets as round-capped strokes
  const frond = (pts) => {
    const c = sampleSpline(pts, 14);
    let d = `M${c.map(([x, y]) => `${n(x)},${n(y)}`).join('L')}`;
    for (let i = 1; i < c.length - 1; i++) {
      const [x, y] = c[i], [x2, y2] = c[i + 1];
      const dx = x2 - x, dy = y2 - y, m = Math.hypot(dx, dy) || 1, ux = dx / m, uy = dy / m;
      const len = 70 * (1 - i / c.length) + 16;
      for (const sgn of [1, -1]) d += `M${n(x)},${n(y)}l${n((ux * 0.5 - uy * sgn) * len)},${n((uy * 0.5 + ux * sgn) * len + len * 0.35)}`;
    }
    return d;
  };
  const fronds = frond([[-20, 40], [80, 60], [170, 110], [230, 190]]) + frond([[-10, 10], [90, -10], [190, 20], [270, 70]]) + frond([[0, 120], [50, 190], [80, 280], [84, 360]])
    + frond([[852, 60], [750, 70], [660, 120], [610, 200]]) + frond([[842, 20], [740, 0], [640, 30], [570, 80]]) + frond([[832, 150], [790, 220], [770, 310], [772, 380]]);
  let glints = '', flies = '';
  for (let i = 0; i < 18; i++) {
    const x = rand() < 0.5 ? rand() * 230 : 600 + rand() * 232, y = 630 + rand() * 140, w = 10 + rand() * 40;
    glints += `M${n(x)},${n(y)}h${n(w)}`;
  }
  for (let i = 0; i < 14; i++) flies += `M${n(rand() < 0.5 ? 30 + rand() * 200 : 610 + rand() * 200)},${n(220 + rand() * 360)}h0`;
  return `<path d="M0,612H832V1216H0Z" fill="${p.lin('sea', [[0, '#1c3a5e', 0.85], [0.3, '#0e2240', 0.8], [1, '#070614', 0.6]], [0, 612, 0, 1000])}"/>`
    + `<path d="M0,612H832" stroke="#8fd4f5" stroke-width="2" opacity=".35"/>`
    + `<path d="${glints}" stroke="#e8ddff" stroke-width="2.6" stroke-linecap="round" opacity=".3"/>`
    + `<path d="${fronds}" transform="translate(-2 -2)" fill="none" stroke="#8fd4f5" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".16"/>`
    + `<path d="${fronds}" fill="none" stroke="#050b14" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="${flies}" stroke="#ffe08a" stroke-width="5" stroke-linecap="round" opacity=".55"/>`;
}

// ---------------------------------------------------------------- flower clip: hibiscus + plumeria
const SPOT = {
  default: [552, 292, 0], lia: [550, 288, 0], freya: [554, 296, 0], serena: [552, 296, 0],
  aila: [280, 292, 1], lilith: [282, 290, 1], mia: [560, 324, 0], ophelia: [560, 354, 0], evelyn: [568, 404, 0],
};
function hairOrnament(p) {
  const [x, y, m] = SPOT[p.heroine.id] || SPOT.default;
  // mirror for left-side spots, and scale up a touch around the spot so it reads on 240px cards
  const tf = `${m ? `translate(${2 * x} 0) scale(-1 1) ` : ''}translate(${x} ${y}) scale(1.15) translate(${-x} ${-y})`;
  const acc = p.palette.accent;
  const H = { base: mix(acc, '#ff8f9e', 0.25), lit: mix(acc, '#ffffff', 0.5), shade: mix(acc, '#5a1030', 0.35), line: mix(acc, '#200818', 0.7) };
  // hibiscus: five broad overlapping petals with frilled tips
  let petals = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2 + 0.3;
    const ca = Math.cos(a), sa = Math.sin(a), ox = x + ca * 2, oy = y + sa * 2;
    const tip = [x + ca * 26, y + sa * 26], l = [x + Math.cos(a - 0.62) * 22, y + Math.sin(a - 0.62) * 22], r = [x + Math.cos(a + 0.62) * 22, y + Math.sin(a + 0.62) * 22];
    petals += `M${ip([ox, oy])}C${ip(l)} ${ip([l[0] + ca * 8, l[1] + sa * 8])} ${ip(tip)}C${ip([r[0] + ca * 8, r[1] + sa * 8])} ${ip(r)} ${ip([ox, oy])}Z`;
  }
  const px = x - 22, py = y + 22;
  let plum = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const tip = [px + Math.cos(a) * 15, py + Math.sin(a) * 15], side = [px + Math.cos(a + 0.9) * 12, py + Math.sin(a + 0.9) * 12];
    plum += `M${px},${py}Q${ip(side)} ${ip(tip)}Q${ip([px + Math.cos(a + 0.35) * 8, py + Math.sin(a + 0.35) * 8])} ${px},${py}Z`;
  }
  const leafD = (lx, ly, ang) => `<path d="M0,0C8,-8 20,-10 32,-4C22,4 10,6 0,0Z" transform="translate(${lx} ${ly}) rotate(${ang})" fill="${K.leaf}" stroke="${K.leafLine}" stroke-width="1.8"/><path d="M2,0L28,-4" transform="translate(${lx} ${ly}) rotate(${ang})" stroke="${K.leafShade}" stroke-width="1.4"/>`;
  return `<g transform="${tf}" stroke-linejoin="round">`
    + leafD(x + 14, y + 6, 20) + leafD(x - 8, y - 12, -140)
    + `<path d="${petals}" fill="${H.base}" stroke="${H.line}" stroke-width="2"/>`
    + `<path d="M${x - 6},${y - 6}q-6,-8 -2,-16M${x + 4},${y - 6}q6,-8 14,-8M${x - 7},${y + 3}q-10,0 -14,8" fill="none" stroke="${H.lit}" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>`
    + `<circle cx="${x}" cy="${y}" r="6" fill="${H.shade}"/>`
    + `<path d="M${x},${y}l14,12" stroke="${K.plumCore}" stroke-width="2.6" stroke-linecap="round"/><circle cx="${x + 15}" cy="${y + 13}" r="3" fill="${K.plumCore}" stroke="${K.goldLine}" stroke-width="1"/>`
    + `<path d="${plum}" fill="${K.plumeria}" stroke="#8a7a5a" stroke-width="1.6"/>`
    + `<circle cx="${px}" cy="${py}" r="4.6" fill="${K.plumCore}"/>`
    + `</g>`;
}

export default {
  type: 'swimsuit',
  label: '夏日度假服',
  render,
  bgMotif,
  hairOrnament,
};
