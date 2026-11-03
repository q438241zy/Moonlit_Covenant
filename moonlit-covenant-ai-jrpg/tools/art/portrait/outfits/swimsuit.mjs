// 泳装 (type 'swimsuit', ★5; 服装稿 §2.1 / §3.1) - real swimwear for the two seaside 番外 (ex002, ex009). Made in the
// 铸金 workshops from "防水魔纱", so every heroine has her own cut (自信的穿比基尼, 严肃、害羞、大姐姐型穿得遮一些):
//   bikini   serena (halter, silver moon-phase ring) · lilith (high-neck sport top + open sun jacket) ·
//            ophelia (bandeau + halter strings, her dragon-claw clasp) · aila (sport top on a gold ring clasp)
//   one-/two-piece  lia (high-neck racer, zip fixed at the collarbone) · mia (tank two-piece, circuit seams) ·
//            freya (off-shoulder flounce over the whole chest line) · evelyn (skirted, little capelet ruffle)
// Rules (服装稿 §1.3, ART-DIRECTION §3): the top edge never below y≈800 at the centre, the chest area (bustY 900 ±75)
// one flat colour with one fabric highlight, the belly flat with one ambient shadow (no navel, no muscle lines),
// no see-through, every zip fixed at the top, the face is the focus. On the bikinis a prop, a jacket or her long
// hair covers at least a third of the frame below y 1000. Wet look: hair ends and shoulders carry a few drops,
// the fabric one gloss band; never water on the chest. The weapon is replaced by a prop (Lia keeps her shield and
// dresses it up); background: a moonlit shore with glowing surf and a far lighthouse.
// variants: ['soft'] - the 12+ version adds each heroine's own cover-up (p.variant === 'soft', costumes/soft/).
import { mix, smooth, taper, mirrorPts, mirrorPath } from '../base.mjs';
import { MIR, ip, f1, cloth, sym, half, fold, drop, circ, star, placer, zipper } from '../garment.mjs';

// ---------------------------------------------------------------- the eight cuts
// main / second: the two fabric colours; trim: piping, rings, stitching
const SUIT = {
  lia: { cut: 'racer', main: '#cf3044', second: '#fff0d6', trim: '#ffc864' },
  mia: { cut: 'tank', main: '#21a3d2', second: '#ff8a2a', trim: '#8ff4ff' },
  serena: { cut: 'halter', main: '#2b2040', second: '#3f2d66', trim: '#d6dbf0' },
  freya: { cut: 'flounce', main: '#78c2ea', second: '#f2fbff', trim: '#ffffff' },
  lilith: { cut: 'sport', main: '#1e1c24', second: '#2c5a3c', trim: '#d9a441' },
  evelyn: { cut: 'capelet', main: '#fbf4e4', second: '#6f9ee8', trim: '#e8c46a' },
  ophelia: { cut: 'bandeau', main: '#1f3a7a', second: '#2f5cae', trim: '#c8643c' },
  aila: { cut: 'ring', main: '#f3c443', second: '#6fb3ff', trim: '#ffffff' },
};
const DEF = SUIT.lia;

// left halves, top centre -> bottom centre (mirrored by sym()); [x, y, 1] = sharp corner
const SHAPE = {
  racer: [[416, 690], [386, 690], [373, 703], [350, 724], [322, 760], [296, 806], [272, 852], [252, 892], [238, 916, 1], [250, 990], [262, 1060], [286, 1216, 1], [416, 1216]],
  tank: [[416, 738], [394, 735], [376, 726], [363, 712, 1], [330, 716, 1], [306, 748], [282, 802], [260, 858], [244, 900], [238, 918, 1], [246, 980], [254, 1046, 1], [330, 1052], [416, 1054]],
  halter: [[416, 834], [403, 823], [392, 808], [383, 797, 1], [352, 801], [316, 815], [282, 839], [256, 872], [242, 906], [239, 926, 1], [247, 966], [257, 994, 1], [330, 1000], [416, 1002]],
  sport: [[416, 716], [396, 713], [378, 706], [364, 700, 1], [344, 713, 1], [320, 740], [296, 786], [270, 840], [250, 884], [240, 914, 1], [246, 960], [256, 998, 1], [330, 1004], [416, 1006]],
  bandeau: [[416, 814], [392, 808], [350, 807], [306, 816], [272, 836], [250, 870], [240, 912, 1], [246, 958], [256, 990, 1], [330, 996], [416, 998]],
  ring: [[416, 834], [404, 824], [396, 808], [385, 782], [367, 744], [353, 712, 1], [322, 721, 1], [302, 758], [278, 810], [256, 864], [242, 904], [238, 920, 1], [246, 966], [256, 996, 1], [330, 1002], [416, 1004]],
  flounce: [[416, 830], [320, 830], [250, 846], [238, 916, 1], [262, 1060], [286, 1216, 1], [416, 1216]],
  capelet: [[416, 790], [330, 792], [252, 836], [238, 916, 1], [262, 1060], [286, 1216, 1], [416, 1216]],
};
// side panels in the second colour: left-side regions (not mirrored), drawn inside the suit
const PANEL = {
  racer: [[373, 703], [350, 724], [322, 760], [296, 806], [272, 852], [252, 892], [238, 916, 1], [250, 990], [262, 1060], [286, 1216, 1], [322, 1216, 1], [302, 1060], [292, 990], [286, 920], [298, 862], [320, 810], [346, 766], [374, 732], [390, 706]],
  sport: [[344, 713], [320, 740], [296, 786], [270, 840], [250, 884], [240, 914, 1], [246, 960], [256, 998, 1], [292, 1002, 1], [284, 960], [282, 904], [296, 846], [318, 790], [342, 748], [364, 722]],
  ring: [[322, 721], [302, 758], [278, 810], [256, 864], [242, 904], [238, 920, 1], [246, 966], [256, 996, 1], [292, 1000, 1], [284, 960], [284, 906], [298, 858], [318, 806], [338, 760], [353, 730]],
  bandeau: [[240, 912], [246, 958], [256, 990, 1], [296, 994, 1], [288, 950], [286, 900], [294, 850], [306, 816], [272, 836], [250, 870]],
};

const isBikini = (cut) => ['halter', 'sport', 'bandeau', 'ring'].includes(cut);

// ---------------------------------------------------------------- the swimsuit
function render(p) {
  const S = SUIT[p.heroine.id] || DEF;
  const M = cloth(S.main), M2 = cloth(S.second);
  const A = p.accent;
  const pal = p.palette;
  let s = '';

  // belly and sides: one flat ambient shadow under the top (no navel, no muscle lines)
  if (isBikini(S.cut) || S.cut === 'tank') {
    const top = S.cut === 'tank' ? 1050 : 1000;
    s += `<g clip-path="${p.refs.torsoClip}"><path d="M236,${top - 6}Q416,${top + 30} 600,${top - 6}V${top + 34}Q416,${top + 66} 236,${top + 34}Z" fill="${pal.skinShadow}" opacity=".55"/>`
      + `<path d="M500,${top}Q560,${top + 40} 580,1216H520Q520,${top + 100} 500,${top}Z" fill="${pal.skinShadow}" opacity=".45"/></g>`;
  }

  // ---- the suit: one shape, lit left half, the right half in cel shadow
  const shape = SHAPE[S.cut];
  const suitD = sym(shape);
  const grad = p.lin('suit', [[0, M.lit], [0.32, M.base], [1, M.shade]], [0, 700, 0, 1180]);
  s += `<g clip-path="${p.refs.bodyClip}">`
    + `<path d="${suitD}" fill="${grad}" stroke="${M.line}" stroke-width="3" stroke-linejoin="round"/>`;
  if (S.cut === 'bandeau') {
    // scale shimmer woven into the fabric (her dragon scales)
    p.def(`<pattern id="${p.id('scales')}" width="22" height="16" patternUnits="userSpaceOnUse"><path d="M0,16A11,11 0 0 1 22,16M-11,8A11,11 0 0 1 11,8M11,8A11,11 0 0 1 33,8" fill="none" stroke="${M.lit}" stroke-width="1.6"/></pattern>`);
    s += `<path d="${suitD}" fill="url(#${p.id('scales')})" opacity=".35"/>`;
  }
  if (PANEL[S.cut]) {
    const pan = smooth(PANEL[S.cut], { closed: true });
    s += `<path d="${pan}" fill="${M2.base}" stroke="${M2.line}" stroke-width="2"/><path d="${pan}" transform="${MIR}" fill="${M2.shade}" stroke="${M2.line}" stroke-width="2"/>`;
  }
  // cel shadow on the right half + the gloss band of wet fabric on the lit side (one band only)
  s += `<path d="${half(shape)}" transform="${MIR}" fill="${M.deep}" opacity=".32"/>`;
  const gloss = {
    racer: [[398, 744], [380, 800], [366, 880], [360, 960], [362, 1040]],
    tank: [[396, 760], [380, 820], [370, 900], [370, 980]],
    halter: [[300, 836], [276, 870], [262, 910]],
    sport: [[392, 736], [374, 790], [362, 860], [358, 940]],
    bandeau: [[350, 822], [306, 830], [276, 850]],
    ring: [[380, 800], [362, 760]],
    flounce: [[380, 940], [366, 1020], [362, 1110]],
    capelet: [[386, 880], [372, 960], [366, 1060]],
  }[S.cut];
  s += `<path d="${taper(gloss, { w: 9, start: 0.2, end: 0.1, peak: 0.45 })}" fill="#ffffff" opacity=".5"/>`
    + `</g>`;

  // ---- per-cut details
  s += CUT[S.cut](p, S, M, M2);

  // ---- 12+ cover-up over everything (服装稿 §3.1 last column)
  if (p.variant === 'soft') s += (COVER[p.heroine.id] || COVER.lia)(p, S);
  return s;
}

const CUT = {
  // Lia: high-neck racer, zip fixed at the collarbone, gold flame piping down the side seams
  racer(p, S, M, M2) {
    const A = p.accent;
    const seam = [[390, 706], [374, 732], [346, 766], [320, 810], [298, 862], [286, 920], [292, 990], [302, 1060], [322, 1216]];
    const seamD = smooth(seam);
    const collar = sym([[416, 660], [394, 660], [380, 665], [375, 688], [378, 708], [396, 713], [416, 714]]);
    let s = `<path d="${seamD}${mirrorPath(seamD)}" fill="none" stroke="${S.trim}" stroke-width="5" stroke-linecap="round"/>`
      + `<path d="${seamD}${mirrorPath(seamD)}" fill="none" stroke="${mix(S.trim, '#5a3510', 0.6)}" stroke-width="1.4" stroke-dasharray="4 5"/>`;
    // the motif rides the piping: small gold flames on the lit side
    if (A) s += `<path d="${[[300, 846, -18], [289, 940, -4], [298, 1040, 6], [310, 1140, 10]].map(([x, y, r]) => A.glyph(x, y, 10, r)).join('')}" fill="${S.trim}" stroke="${mix(S.trim, '#5a3510', 0.7)}" stroke-width="1"/>`;
    s += `<path d="${collar}" fill="${p.lin('collar', [[0, M.lit], [0.5, M.base], [1, M.shade]], [376, 0, 456, 0])}" stroke="${M.line}" stroke-width="2.6"/>`
      + `<path d="M436,662Q450,664 452,668L456,690Q452,708 436,712Z" fill="${M.deep}" opacity=".4"/>`
      + `<path d="M380,668Q416,676 452,668" fill="none" stroke="${M2.base}" stroke-width="3" stroke-linecap="round"/>`
      + zipper('M416,664V744', '#e8e2cf', '#3a2a20')
      + `<path d="M410,662h12v20l-6,6l-6,-6z" fill="#e8e2cf" stroke="#3a2a20" stroke-width="2" stroke-linejoin="round"/>`;
    return s;
  },
  // Mia: tank two-piece, cyan with a neon-orange hem band, glowing circuit traces on the seams
  tank(p, S, M, M2) {
    const A = p.accent;
    const hem = 'M254,1040Q330,1048 416,1050Q502,1048 578,1040L578,1058Q502,1066 416,1068Q330,1066 254,1058Z';
    const trace = 'M262,1030V990L272,980V930L284,918V880M300,1030V1000L310,990V958';
    let s = `<g clip-path="${p.refs.torsoClip}"><path d="${hem}" fill="${M2.base}" stroke="${M2.line}" stroke-width="2.2"/><path d="M470,1050Q530,1048 578,1040L578,1058Q530,1064 470,1068Z" fill="${M2.shade}"/></g>`
      + `<path d="M363,712Q378,728 394,735Q416,740 438,735Q454,728 469,712" fill="none" stroke="${M2.base}" stroke-width="4.4" stroke-linecap="round"/>`
      + `<path d="${trace}${mirrorPath(trace)}" fill="none" stroke="${S.trim}" stroke-width="2.4" stroke-linejoin="round" opacity=".9"/>`
      + `<path d="M262,1030h0M272,930h0M284,880h0M300,1030h0M310,958h0${mirrorPath('M262,1030h0M272,930h0M284,880h0M300,1030h0M310,958h0')}" stroke="#e8fdff" stroke-width="5.5" stroke-linecap="round"/>`;
    // her gear on the hem band
    if (A) s += A.emblem(416, 1042, 0.5);
    return s;
  },
  // Serena: halter, the two halves gathered into a silver moon-phase ring at the neckline, star-orbit silver edges
  halter(p, S, M, M2) {
    const strap = taper([[386, 800], [381, 760], [378, 712], [382, 670], [392, 648]], { w: 13, start: 1, end: 0.8, peak: 0.5 });
    const top = smooth([[383, 797], [352, 801], [316, 815], [282, 839], [256, 872], [242, 906]]);
    const bot = smooth([[257, 994], [330, 1000], [416, 1002]]);
    const edge = top + mirrorPath(top) + bot + mirrorPath(bot);
    let s = `<path d="${strap}" fill="${M.base}" stroke="${M.line}" stroke-width="2.2"/><path d="${mirrorPath(strap)}" fill="${M.shade}" stroke="${M.line}" stroke-width="2.2"/>`
      + `<path d="${edge}" fill="none" stroke="${S.trim}" stroke-width="2.4" transform="translate(0 4)" opacity=".9"/>`
      + `<path d="${edge}" fill="none" stroke="${S.trim}" stroke-width="3" stroke-dasharray="0 16" stroke-linecap="round" transform="translate(0 10)" opacity=".7"/>`;
    // gathers running into the ring
    s += `<path d="M396,822Q384,850 380,880M400,830Q394,860 396,900${mirrorPath('M396,822Q384,850 380,880M400,830Q394,860 396,900')}" fill="none" stroke="${M.deep}" stroke-width="2" opacity=".8"/>`;
    s += moonRing(p, 416, 818, 14, S.trim);
    // her crescent motif in silver on both side seams
    if (p.accent) s += `<path d="${p.accent.glyph(262, 948, 10, -20)}${p.accent.glyph(570, 948, 10, 20)}" fill="${S.trim}" opacity=".9"/>`;
    return s;
  },
  // Lilith: high-neck sport top, dark-green side panels, gold rings on the straps, a row of leaves along the hem,
  // and an open cropped sun jacket over it (zipped up in the 12+ version), its hood down behind the neck
  sport(p, S, M, M2) {
    const A = p.accent;
    const neck = 'M364,700Q390,716 416,717Q442,716 468,700';
    let s = `<path d="${neck}" fill="none" stroke="${S.trim}" stroke-width="2.6" stroke-linecap="round"/>`
      + `<path d="M256,998Q330,1004 416,1006Q502,1004 576,998" fill="none" stroke="${S.trim}" stroke-width="2.6"/>`;
    for (const [x, y] of [[340, 744], [492, 744]]) s += `<circle cx="${x}" cy="${y}" r="9" fill="none" stroke="#4a3210" stroke-width="6.5"/><circle cx="${x}" cy="${y}" r="9" fill="none" stroke="${S.trim}" stroke-width="3.6"/><path d="M${x - 6},${y - 5}A8,8 0 0 1 ${x + 2},${y - 9}" fill="none" stroke="#fff3c8" stroke-width="1.6"/>`;
    if (A) s += `<path d="${[[372, 1014], [416, 1018], [460, 1014]].map(([x, y]) => A.glyph(x, y, 9, 90)).join('')}" fill="${S.trim}" fill-rule="evenodd" opacity=".9"/>`;
    if (p.variant !== 'soft') s += jacket(p, { C: cloth('#34303e'), open: 96, hem: 1100, zip: true, sleeve: 'long', metal: '#d9a441', lining: '#5a3d80' });
    return s;
  },
  // Ophelia: deep-blue scale-shimmer bandeau, halter strings, copper embroidery, her silver dragon-claw clasp
  bandeau(p, S, M, M2) {
    const A = p.accent;
    const strap = taper([[400, 810], [390, 760], [382, 704], [386, 664], [396, 644]], { w: 6, start: 1, end: 1, peak: 0.5 });
    const top = smooth([[416, 814], [392, 808], [350, 807], [306, 816], [272, 836], [250, 870]]);
    const bot = smooth([[257, 990], [330, 996], [416, 998]]);
    const edge = top + mirrorPath(top) + bot + mirrorPath(bot);
    let s = `<path d="${strap}${mirrorPath(strap)}" fill="${M.base}" stroke="${M.line}" stroke-width="2"/>`
      + `<path d="${edge}" fill="none" stroke="${S.trim}" stroke-width="5" transform="translate(0 5)"/>`
      + `<path d="${edge}" fill="none" stroke="#f0a070" stroke-width="1.6" stroke-dasharray="3 4" transform="translate(0 5)"/>`;
    s += A ? A.emblem(416, 830, 0.78) : `<circle cx="416" cy="830" r="12" fill="#f472b6" stroke="#6a1a44" stroke-width="2"/>`;
    return s;
  },
  // Aila: gold sport top on a gold ring clasp (no zip), sky-blue side panels, white piping
  ring(p, S, M, M2) {
    const A = p.accent;
    const outer = smooth([[353, 712], [322, 721], [302, 758], [278, 810], [256, 864], [242, 904]]);
    const inner = smooth([[404, 824], [396, 808], [385, 782], [367, 744], [353, 712]]);
    const bot = smooth([[256, 996], [330, 1002], [416, 1004]]);
    const edges = outer + mirrorPath(outer) + inner + mirrorPath(inner) + bot + mirrorPath(bot);
    let s = `<path d="${edges}" fill="none" stroke="${S.trim}" stroke-width="3.2" stroke-linecap="round"/>`;
    s += `<circle cx="416" cy="820" r="15" fill="none" stroke="#6a4a10" stroke-width="8"/><circle cx="416" cy="820" r="15" fill="none" stroke="#ffd96a" stroke-width="5"/><path d="M405,811A14,14 0 0 1 418,806" fill="none" stroke="#fff6d8" stroke-width="2" stroke-linecap="round"/>`;
    // her sun on the side panel
    if (A) s += `<path d="${A.glyph(268, 930, 13)}${A.glyph(564, 930, 13)}" fill="#ffffff" fill-rule="evenodd" opacity=".85"/>`;
    return s;
  },
  // Freya: off-shoulder one-piece; a double flounce covers the whole chest line and both upper arms
  flounce(p, S, M, M2) {
    const A = p.accent;
    const hem = p.lin('frost', [[0, M.base, 0], [1, M2.base, 0.95]], [0, 1060, 0, 1216]);
    const line = [[132, 884], [172, 842], [236, 816], [320, 804], [416, 802], [512, 804], [596, 816], [660, 842], [700, 884]];
    const rc = p.clip('rightHalf', 'M416,0H832V1216H416Z');
    const lower = ruffleBand(line, 30, (t) => 104 - 18 * Math.sin(t * Math.PI), M2, S, rc);
    const upper = ruffleBand(line.map(([x, y]) => [x, y - 2]), 30, (t) => 60 - 8 * Math.sin(t * Math.PI), M, S, rc);
    let s = `<g clip-path="${p.refs.bodyClip}"><rect x="230" y="1040" width="380" height="180" fill="${hem}"/></g>`
      + `<g clip-path="${p.refs.bodyClip}">${lower}${upper}</g>`;
    // her snowflake brooch where the flounce dips at the centre
    s += A ? A.emblem(416, 832, 0.6) : '';
    return s;
  },
  // Evelyn: skirted one-piece under a little capelet ruffle round the shoulders, star-blue ribbon, her star pendant
  capelet(p, S, M, M2) {
    const A = p.accent;
    const line = [[150, 830], [196, 784], [252, 752], [320, 730], [416, 722], [512, 730], [580, 752], [636, 784], [682, 830]];
    const cape = ruffleBand(line, 28, (t) => 92 + 8 * Math.sin(t * Math.PI), cloth(S.main), S, p.clip('rightHalf', 'M416,0H832V1216H416Z'), true);
    let s = `<g clip-path="${p.refs.bodyClip}"><path d="M240,1000Q416,1018 592,1000V1030Q416,1048 240,1030Z" fill="${S.second}" stroke="${mix(S.second, '#101830', 0.6)}" stroke-width="2"/></g>`
      + `<g clip-path="${p.refs.bodyClip}">${cape}</g>`
      + `<path d="M380,724Q416,732 452,724" fill="none" stroke="${S.second}" stroke-width="5" stroke-linecap="round"/>`
      + `<path d="M416,730l-18,-10l-3,17zM416,730l18,-10l3,17z" fill="${S.second}" stroke="${mix(S.second, '#101830', 0.6)}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="416" cy="731" r="4" fill="${mix(S.second, '#ffffff', 0.4)}"/>`;
    // the canon star pendant stays: her emblem on a fine gold chain over the capelet
    s += `<path d="M386,732Q398,790 416,804Q434,790 446,732" fill="none" stroke="#a87a28" stroke-width="2"/>`
      + (A ? A.emblem(416, 818, 0.6) : `<path d="${star(416, 818, 14)}" fill="#ffd98c" stroke="#7a5a1e" stroke-width="2"/>`);
    return s;
  },
};

/** a gathered flounce band hanging from `line` (left to right); drawn in two tones, lit left, shaded right */
function ruffleBand(line, count, width, C, S, rightClip, scallop = false) {
  // inner edge = line, outer edge = line pushed down by width(t), scalloped
  const inner = sampleLine(line, count);
  const outer = inner.map(([x, y], i) => [x, y + width(i / (count - 1))]);
  let d = `M${ip(inner[0])}`;
  for (let i = 1; i < count; i++) d += `L${ip(inner[i])}`;
  d += `L${ip(outer[count - 1])}`;
  for (let i = count - 2; i >= 0; i--) {
    const a = outer[i + 1], b = outer[i];
    const r = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.6);
    d += `A${r} ${r} 0 0 1 ${ip(b)}`;
  }
  d += 'Z';
  let gathers = '';
  for (let i = 1; i < count - 1; i += 1) {
    const a = inner[i], b = outer[i];
    gathers += `M${ip([a[0], a[1] + (b[1] - a[1]) * 0.25])}L${ip([b[0] + (i % 2 ? 2 : -2), b[1] - 6])}`;
  }
  // right half in cel shadow (rightClip = the canvas right of the centre line)
  return `<path d="${d}" fill="${C.base}" stroke="${C.line}" stroke-width="2.4" stroke-linejoin="round"/>`
    + `<path d="${gathers}" fill="none" stroke="${C.shade}" stroke-width="2.2" stroke-linecap="round"/>`
    + `<path d="${d}" fill="${C.deep}" opacity=".25" clip-path="${rightClip}"/>`
    + (scallop ? `<path d="${d}" fill="none" stroke="${S.second}" stroke-width="3" stroke-dasharray="0 12" stroke-linecap="round" transform="translate(0 -6)" opacity=".8"/>` : '');
}
function sampleLine(pts, count) {
  // even spacing along the polyline
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = L[L.length - 1];
  const out = [];
  let j = 0;
  for (let k = 0; k < count; k++) {
    const t = (total * k) / (count - 1);
    while (j < L.length - 2 && L[j + 1] < t) j++;
    const u = (t - L[j]) / (L[j + 1] - L[j] || 1);
    out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * u, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * u]);
  }
  return out;
}

/** Serena's silver moon-phase ring (her hair disc in small): ring with a crescent set inside */
function moonRing(p, x, y, r, silver) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#2c2766" stroke-width="7"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${silver}" stroke-width="4.2"/>`
    + `<path d="M${x + 3},${y - 8}A8.5,8.5 0 1 0 ${x + 3},${y + 8}A6.5,6.5 0 1 1 ${x + 3},${y - 8}Z" fill="#efe9ff" stroke="#2c2766" stroke-width="1.2"/>`
    + `<path d="M${x - r + 3},${y - 5}A${r},${r} 0 0 1 ${x - 4},${y - r + 2}" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`;
}

// ---------------------------------------------------------------- 12+ cover-ups (soft variant)
/**
 * Zip / button jacket over arms and torso. J: { C (cloth), close: y where the front closes (null = open),
 * open: half-width of the front gap at the bottom when open, collar: 'stand' | 'hood' | 'camp', sleeve: 'long' | 'short',
 * zip: true for a zip (else buttons), trim colour }
 */
function jacket(p, J) {
  const { C } = J;
  const gap = J.close == null ? J.open : 0;
  const top = J.close ?? 1216;
  const hem = J.hem || 1216; // a cropped jacket ends above the frame edge; its sleeves still run down the arms
  // left half: shoulder line along the body outline, down the arm, the front edge back up to the collar
  const front = J.close == null
    ? [[416 - gap, hem, 1], [416 - gap * 0.8, Math.min(1040, hem - 40)], [390, 860], [380, 760], [376, 700]]
    : [[416, hem, 1], [416, top, 1], [398, top - 30], [384, 720], [376, 700]];
  const crop = hem < 1216 ? [[236, 1216, 1], [238, hem, 1]] : [];
  const left = smooth([[376, 690, 1], [330, 706], [270, 728], [200, 756], [120, 800], [80, 900], [70, 1216, 1], ...crop, ...front], { closed: true });
  const fill = p.lin('jk', [[0, C.lit], [0.35, C.base], [1, C.shade]], [0, 700, 0, 1180]);
  let s = `<g clip-path="${p.refs.bodyClip}">`
    + `<path d="${left}" fill="${fill}"/><path d="${left}" transform="${MIR}" fill="${C.shade}"/>`
    + `<path d="${p.shapes.armSeamL}${p.shapes.armSeamR}" fill="none" stroke="${C.line}" stroke-width="2.6" opacity=".8"/>`
    + `<path d="${fold([[176, 940], [186, 1030], [180, 1120]], 6)}${fold([[214, 980], [220, 1060]], 5)}" fill="${C.shade}"/>`
    + `<path d="${fold([[656, 960], [648, 1050], [654, 1130]], 6)}" fill="${C.deep}"/>`;
  if (J.sleeve === 'short') {
    const cuff = 'M128,1004Q182,1018 236,1008L236,1028Q182,1038 126,1024Z';
    s += `<path d="M60,1020H240V1216H60Z" fill="${p.palette.skin}"/><path d="M128,1020Q180,1040 238,1030V1216H128Z" fill="${p.palette.skinShadow}" opacity=".35"/>`
      + `<path d="M592,1020H780V1216H592Z" fill="${p.palette.skin}"/><path d="M600,1024Q650,1050 704,1040V1216H600Z" fill="${p.palette.skinShadow}" opacity=".55"/>`
      + `<path d="${cuff}" fill="${C.base}" stroke="${C.line}" stroke-width="2"/><path d="${mirrorPath(cuff)}" fill="${C.shade}" stroke="${C.line}" stroke-width="2"/>`;
  }
  s += `</g>`;
  // front edges / placket (an open jacket shows its lining along the edges, a cropped one its hem band)
  const edgeL = J.close == null
    ? smooth([[376, 700], [380, 760], [390, 860], [416 - gap * 0.8, Math.min(1040, hem - 40)], [416 - gap, hem]])
    : `M416,${top}V${hem}`;
  if (J.close == null && J.lining) s += `<path d="${edgeL}${mirrorPath(edgeL)}" fill="none" stroke="${J.lining}" stroke-width="9" transform="translate(0 2)"/>`;
  if (hem < 1216) {
    const band = `M238,${hem - 12}Q330,${hem - 6} ${416 - gap},${hem - 10}L${416 - gap},${hem + 6}Q330,${hem + 10} 238,${hem + 4}Z`;
    s += `<path d="${band}" fill="${C.base}" stroke="${C.line}" stroke-width="2.4"/><path d="${mirrorPath(band)}" fill="${C.shade}" stroke="${C.line}" stroke-width="2.4"/>`;
  }
  s += `<path d="${edgeL}${J.close == null ? mirrorPath(edgeL) : ''}" fill="none" stroke="${C.line}" stroke-width="3"/>`;
  if (J.close == null && J.zip) s += zipper(edgeL, J.metal, C.line) + zipper(mirrorPath(edgeL), J.metal, C.line);
  if (J.close != null) {
    s += J.zip ? zipper(`M416,${top}V${hem}`, J.metal || '#e6e0d0', C.line) + `<path d="M410,${top - 4}h12v20l-6,6l-6,-6z" fill="${J.metal || '#e6e0d0'}" stroke="${C.line}" stroke-width="2"/>`
      : [0, 1, 2, 3, 4].map((k) => `<circle cx="416" cy="${top + 30 + k * 90}" r="7" fill="${J.trim}" stroke="${C.line}" stroke-width="1.8"/>`).join('');
    // the V above the closing point, open to the collar
    s += `<path d="M376,700L398,${top - 30}L416,${top}L434,${top - 30}L456,700" fill="none" stroke="${C.line}" stroke-width="3" stroke-linejoin="round"/>`;
  }
  if (J.collar === 'stand') {
    // a soft stand collar ringing the neck base
    const col = sym([[416, 696], [394, 694], [374, 684], [366, 704], [372, 722], [396, 730], [416, 732]]);
    s += `<path d="${col}" fill="${C.base}" stroke="${C.line}" stroke-width="2.6"/><path d="M436,696Q452,694 458,684L466,704Q460,722 436,730Z" fill="${C.shade}"/>`;
  }
  if (J.collar === 'camp') {
    const lap = smooth([[376, 694], [350, 716], [334, 748], [372, 760], [398, top - 26, 1]], { closed: true });
    s += `<path d="${lap}" fill="${C.lit}" stroke="${C.line}" stroke-width="2.4"/><path d="${mirrorPath(lap)}" fill="${C.base}" stroke="${C.line}" stroke-width="2.4"/>`;
  }
  return s;
}
/** hood bunched behind the neck (bodyBack) */
function hoodBack(C) {
  const hood = smooth([[290, 772], [292, 700], [314, 648], [356, 618], [416, 606], [476, 618], [518, 648], [540, 700], [542, 772]], { closed: true });
  return `<path d="${hood}" fill="${C.shade}" stroke="${C.line}" stroke-width="3" stroke-linejoin="round"/>`
    + `<path d="M304,706Q326,646 416,630Q506,646 528,706" fill="none" stroke="${C.deep}" stroke-width="6"/>`;
}

const COVER = {
  // red lifeguard hoodie zipped to the collarbone (the racer collar shows above it)
  lia: (p) => jacket(p, { C: cloth('#c42a3c'), close: 760, zip: true, collar: 'stand', sleeve: 'long', metal: '#f2ead4' })
    + `<path d="M120,900Q150,940 140,1000M712,900Q682,940 692,1000" fill="none" stroke="#fff0d6" stroke-width="5" opacity=".9"/>`,
  // dark-grey hoodie with circuit-stitched seams, zipped to the sternum
  mia: (p) => jacket(p, { C: cloth('#3a3f4c'), close: 778, zip: true, collar: 'stand', sleeve: 'long', metal: '#c9d2dc' })
    + `<path d="M150,860V960L162,972V1100M682,860V960L670,972V1100M392,800V1216M440,800V1216" fill="none" stroke="#5ed7ff" stroke-width="2" stroke-dasharray="6 5" opacity=".85"/>`,
  // moon-white long-sleeved wrap robe, the halter ring above the cross-over, a sash tied at the waist
  serena: (p, S) => {
    const C = cloth('#ece6fa', { ink: '#2c2766' });
    const left = smooth([[386, 708, 1], [330, 710], [260, 732], [190, 760], [120, 806], [76, 900], [66, 1216, 1], [452, 1216, 1], [446, 1060], [430, 950], [408, 872], [394, 790]], { closed: true });
    const right = mirrorPath(left);
    let s = `<g clip-path="${p.refs.bodyClip}"><path d="${right}" fill="${C.shade}" stroke="${C.line}" stroke-width="2.6"/>`
      + `<path d="${left}" fill="${p.lin('robe', [[0, '#ffffff'], [0.4, C.base], [1, C.shade]], [0, 700, 0, 1200])}" stroke="${C.line}" stroke-width="2.6"/>`
      + `<path d="${p.shapes.armSeamL}${p.shapes.armSeamR}" fill="none" stroke="${C.line}" stroke-width="2.4" opacity=".7"/>`
      + `<path d="${fold([[180, 950], [190, 1040], [184, 1130]], 6)}${fold([[440, 960], [452, 1060], [450, 1150]], 6)}" fill="${C.shade}"/>`
      + `<path d="M240,1060Q416,1084 592,1060V1096Q416,1120 240,1096Z" fill="${mix(S.second, '#ffffff', 0.1)}" stroke="#1a1430" stroke-width="2.2"/></g>`
      + `<path d="M468,1074l34,-20l6,34zM468,1080l18,58l12,-8l10,6l-8,-54z" fill="${S.second}" stroke="#1a1430" stroke-width="2" stroke-linejoin="round"/>`
      + `<path d="M394,790L408,872L430,950" fill="none" stroke="${C.lit}" stroke-width="3" opacity=".8"/>`;
    return s;
  },
  // knee-length knit cardigan buttoned to the sternum (it replaces the towel)
  freya: (p) => jacket(p, { C: cloth('#e4f2fb', { ink: '#1d4a6e' }), close: 780, zip: false, collar: 'none', sleeve: 'long', trim: '#8fd4f5' }),
  // the sun jacket zipped all the way up
  lilith: (p) => jacket(p, { C: cloth('#34303e'), close: 712, zip: true, collar: 'stand', sleeve: 'long', metal: '#d9a441' }),
  // white star-print hooded towel cape, toggled at the collar
  evelyn: (p) => {
    const C = cloth('#fbf8f0', { ink: '#5a5070' });
    const cape = smooth([[416, 708, 1], [340, 712], [250, 742], [170, 790], [110, 870], [80, 1000], [66, 1216, 1], [392, 1216, 1], [404, 1000], [412, 820]], { closed: true });
    p.def(`<pattern id="${p.id('starPrint')}" width="64" height="64" patternUnits="userSpaceOnUse"><path d="${star(16, 18, 7)}${star(48, 50, 5)}" fill="#8fb8f0" opacity=".8"/></pattern>`);
    return `<g clip-path="${p.refs.bodyClip}">`
      + `<path d="${cape}" fill="${C.base}" stroke="${C.line}" stroke-width="2.6"/><path d="${cape}" fill="url(#${p.id('starPrint')})"/>`
      + `<path d="${mirrorPath(cape)}" fill="${C.shade}" stroke="${C.line}" stroke-width="2.6"/><path d="${mirrorPath(cape)}" fill="url(#${p.id('starPrint')})" opacity=".7"/>`
      + `<path d="${fold([[170, 900], [160, 1020], [170, 1140]], 7)}${fold([[300, 820], [310, 960]], 6)}" fill="${C.shade}"/></g>`
      + `<rect x="404" y="716" width="24" height="10" rx="4" fill="#e8c46a" stroke="#7a5a1e" stroke-width="1.6"/>`;
  },
  // deep-blue linen beach shirt, camp collar, buttoned up, short sleeves
  ophelia: (p) => jacket(p, { C: cloth('#24427e'), close: 770, zip: false, collar: 'camp', sleeve: 'short', trim: '#e9e1d0' }),
  // sky-blue sun jacket zipped to the collar, her sun badge on the chest
  aila: (p) => jacket(p, { C: cloth('#64a9f0'), close: 708, zip: true, collar: 'stand', sleeve: 'long', metal: '#f5d270' })
    + (p.accent ? p.accent.emblem(480, 850, 0.62) : ''),
};

// ---------------------------------------------------------------- props (the weapon's place)
const P = {
  // Lia: an orange rescue tube slanting across her from the lower left, clips and a coiled leash
  lia(p) {
    const at = placer(56, 1196, -27);
    const L = 520, w = 30;
    const body = smooth([at([0, -w, 1]), at([L, -w, 1]), at([L + 22, 0]), at([L, w, 1]), at([0, w, 1]), at([-22, 0])], { closed: true });
    const grooves = [100, 190, 280, 370, 450].map((u) => `M${ip(at([u, -w + 3]))}Q${ip(at([u + 8, 0]))} ${ip(at([u, w - 3]))}`).join('');
    return `<g stroke-linejoin="round">`
      + `<path d="${body}" fill="${p.lin('tube', [[0, '#ffb15a'], [0.4, '#ff7a26'], [1, '#c4480e']], [0, 1020, 60, 1180])}" stroke="#5a1e04" stroke-width="3"/>`
      + `<path d="${grooves}" fill="none" stroke="#a83a08" stroke-width="2.6"/>`
      + `<path d="M${ip(at([30, -w + 8]))}L${ip(at([L - 20, -w + 8]))}" stroke="#ffe0b0" stroke-width="5" stroke-linecap="round" opacity=".8"/>`
      + [40, L - 40].map((u) => `<path d="M${ip(at([u - 8, -w - 4]))}L${ip(at([u + 8, -w - 4]))}L${ip(at([u + 8, w + 4]))}L${ip(at([u - 8, w + 4]))}Z" fill="#f4f2ea" stroke="#3a3a44" stroke-width="2"/>`).join('')
      + `<path d="M${ip(at([L + 18, 6]))}C${ip(at([L + 70, 40]))} ${ip(at([L + 60, 110]))} ${ip(at([L - 10, 90]))}" fill="none" stroke="#f4f2ea" stroke-width="5" stroke-linecap="round"/>`
      + `</g>`;
  },
  // Mia: her home-made water blaster from the lower right (no name on it), a clear tank sloshing cyan
  mia(p) {
    const at = placer(846, 1172, -152, 1.35);
    const body = smooth([at([0, -30, 1]), at([170, -26, 1]), at([180, -12]), at([250, -10, 1]), at([250, 10, 1]), at([180, 12]), at([150, 34, 1]), at([20, 40, 1])], { closed: true });
    const tank = smooth([at([40, -32, 1]), at([140, -30, 1]), at([140, -86, 1]), at([40, -88, 1])], { closed: true });
    const water = smooth([at([44, -36, 1]), at([136, -34, 1]), at([136, -62, 1]), at([90, -56]), at([44, -64, 1])], { closed: true });
    return `<g stroke-linejoin="round">`
      + `<path d="${tank}" fill="#cdeff8" opacity=".55" stroke="#2a3346" stroke-width="2.6"/><path d="${water}" fill="#2fc8f0" opacity=".85"/>`
      + `<path d="M${ip(at([56, -80]))}L${ip(at([60, -44]))}" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`
      + `<path d="${body}" fill="${p.lin('blaster', [[0, '#ffb070'], [0.5, '#ff8a2a'], [1, '#c45a10']], [640, 1000, 760, 1200])}" stroke="#5a2a06" stroke-width="3"/>`
      + `<path d="M${ip(at([30, 0]))}L${ip(at([160, 0]))}" stroke="#5ed7ff" stroke-width="3" stroke-dasharray="10 6" opacity=".9"/>`
      + `<circle cx="${ip(at([250, 0])).split(',')[0]}" cy="${ip(at([250, 0])).split(',')[1]}" r="7" fill="#2a3346"/>`
      + `<path d="M${ip(at([260, -2]))}l-14,-26M${ip(at([262, 6]))}l-26,-12" stroke="#8ff4ff" stroke-width="3" stroke-linecap="round" opacity=".75"/>`
      + `</g>`;
  },
  // Freya: a steaming flask and a cup of tea from the lower right
  freya(p) {
    const flask = 'M624,1216V1060Q624,1040 644,1036H700Q720,1040 720,1060V1216Z';
    return `<g stroke-linejoin="round" transform="matrix(1.22 0 0 1.22 -150 -268)">`
      + `<path d="${flask}" fill="${p.lin('flask', [[0, '#e8f4fb'], [0.45, '#b8d6ea'], [1, '#6f9cbc']], [624, 0, 720, 0])}" stroke="#1d4a6e" stroke-width="3"/>`
      + `<path d="M630,1036H714V1010Q714,1000 700,1000H644Q630,1000 630,1010Z" fill="#3f8fc4" stroke="#1d4a6e" stroke-width="2.6"/>`
      + `<path d="M640,1080V1200" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/>`
      + `<path d="M536,1110H604L596,1176Q594,1190 580,1190H560Q546,1190 544,1176Z" fill="#f6fbff" stroke="#1d4a6e" stroke-width="2.6"/>`
      + `<path d="M540,1112Q570,1124 600,1112" fill="none" stroke="#c98a4a" stroke-width="6"/>`
      + `<path d="M604,1126Q622,1130 618,1148Q614,1162 598,1160" fill="none" stroke="#1d4a6e" stroke-width="3.4"/>`
      + `<path d="M556,1094Q546,1070 560,1050Q572,1030 562,1010M580,1094Q590,1070 578,1046Q568,1026 580,1004" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".55"/>`
      + `</g>`;
  },
  // Evelyn: a star-shaped float hugged in front of her, hiding the lower half of the frame
  evelyn(p) {
    const outer = star(416, 1160, 210, 0.56, 5, -90);
    const inner = star(416, 1160, 72, 0.56, 5, -90);
    return `<g stroke-linejoin="round">`
      + `<path d="${outer}${inner}" fill="${p.lin('floatStar', [[0, '#fff7d8'], [0.5, '#ffd98c'], [1, '#d8a948']], [300, 1000, 540, 1300])}" fill-rule="evenodd" stroke="#7a5a1e" stroke-width="3.4"/>`
      + `<path d="${star(416, 1160, 160, 0.56, 5, -90)}" fill="none" stroke="#7fb2ff" stroke-width="7" opacity=".8"/>`
      + `<path d="M330,1044Q370,1004 416,964" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".75"/>`
      + `</g>`;
  },
  // Ophelia: an armful of her "collection" - a conch, gold coins, two glass floats in netting
  ophelia(p) {
    const coin = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="15" ry="9" fill="#f1c24c" stroke="#7a5212" stroke-width="2"/><ellipse cx="${x - 3}" cy="${y - 2}" rx="7" ry="3.4" fill="#fff0b0" opacity=".8"/>`;
    const float = (x, y, r, tint) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${tint}" opacity=".75" stroke="#1f3a7a" stroke-width="2.6"/>`
      + `<path d="M${x - r},${y}Q${x},${y + r * 0.4} ${x + r},${y}M${x},${y - r}Q${x - r * 0.4},${y} ${x},${y + r}M${x - r * 0.7},${y - r * 0.7}L${x + r * 0.7},${y + r * 0.7}" fill="none" stroke="#c8a878" stroke-width="2.2"/>`
      + `<ellipse cx="${x - r * 0.35}" cy="${y - r * 0.4}" rx="${r * 0.25}" ry="${r * 0.14}" fill="#fff" opacity=".85" transform="rotate(-30 ${x - r * 0.35} ${y - r * 0.4})"/>`;
    const conch = 'M300,1150C300,1090 350,1050 400,1060C440,1068 470,1100 462,1140C456,1170 420,1190 380,1186L320,1216H300Z';
    return `<g stroke-linejoin="round" transform="matrix(1.25 0 0 1.25 -104 -330)">`
      + float(510, 1120, 52, '#7fd8c8') + float(560, 1196, 44, '#9fc4ff')
      + `<path d="${conch}" fill="${p.lin('conch', [[0, '#fff2e4'], [0.5, '#f7c9b0'], [1, '#d48c78']], [300, 1060, 460, 1200])}" stroke="#6a2a2a" stroke-width="3"/>`
      + `<path d="M330,1120Q380,1090 440,1110M320,1150Q380,1124 448,1146M346,1176Q392,1160 430,1170" fill="none" stroke="#c07a6a" stroke-width="2.4"/>`
      + `<path d="M352,1076Q376,1066 402,1070" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`
      + coin(430, 1196) + coin(462, 1180) + coin(396, 1206) + coin(476, 1206)
      + `</g>`;
  },
  // Aila: a beach ball in front ("三局两胜")
  aila(p) {
    const x = 356, y = 1104, r = 128;
    const seg = (a0, a1, fill) => {
      const P0 = [x + Math.cos(a0) * r, y + Math.sin(a0) * r], P1 = [x + Math.cos(a1) * r, y + Math.sin(a1) * r];
      return `<path d="M${x - 24},${y - 30}L${ip(P0)}A${r},${r} 0 0 1 ${ip(P1)}Z" fill="${fill}"/>`;
    };
    const cols = ['#f5c84c', '#ffffff', '#4f7dff', '#ffffff', '#f5c84c', '#6fd0ff'];
    let segs = '';
    for (let i = 0; i < 6; i++) segs += seg((i / 6) * Math.PI * 2 - 1.2, ((i + 1) / 6) * Math.PI * 2 - 1.2, cols[i]);
    return `<g stroke-linejoin="round">`
      + `<g clip-path="url(#${p.id('ballClip')})">${segs}<circle cx="${x}" cy="${y}" r="${r}" fill="${p.rad('ballShade', [[0, '#ffffff', 0], [0.7, '#0e1a3a', 0.1], [1, '#0e1a3a', 0.45]], { cx: x - 30, cy: y - 40, r: r * 1.3 })}"/></g>`
      + `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#1c2f78" stroke-width="3.4"/>`
      + `<circle cx="${x - 24}" cy="${y - 30}" r="12" fill="#ffffff" stroke="#1c2f78" stroke-width="2"/>`
      + `<path d="M${x - 70},${y - 50}Q${x - 50},${y - 84} ${x - 10},${y - 96}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/>`
      + `</g>`;
  },
};
// Aila's ball needs a clip registered once
function ballClip(p) {
  p.def(`<clipPath id="${p.id('ballClip')}"><circle cx="356" cy="1104" r="128"/></clipPath>`);
  return '';
}

// behind the body (bodyBack): Serena's parasol, Lilith's crossed fins, Aila's surf board, the hoods of the cover-ups
const BACK = {
  serena(p) {
    const cx = 690, cy = 560;
    const at = placer(cx, cy, 12, 1.25);
    const rim = [];
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI + (i / 8) * Math.PI;
      rim.push(at([Math.cos(a) * 300, Math.sin(a) * 140 + 40]));
    }
    let scal = `M${ip(rim[0])}`;
    for (let i = 1; i < rim.length; i++) scal += `Q${ip([(rim[i - 1][0] + rim[i][0]) / 2, (rim[i - 1][1] + rim[i][1]) / 2 + 26])} ${ip(rim[i])}`;
    // the canopy: dome arc over the top, then the scalloped rim back to the start
    let back = '';
    for (let i = rim.length - 2; i >= 0; i--) back += `Q${ip([(rim[i + 1][0] + rim[i][0]) / 2, (rim[i + 1][1] + rim[i][1]) / 2 + 26])} ${ip(rim[i])}`;
    const shape = `M${ip(rim[0])}Q${ip(at([-170, -270]))} ${ip(at([0, -250]))}Q${ip(at([170, -270]))} ${ip(rim[8])}${back}Z`;
    const ribs = [1, 2, 3, 4, 5, 6, 7].map((i) => `M${ip(at([0, -250]))}Q${ip(at([(i - 4) * 50, -120]))} ${ip(rim[i])}`).join('');
    const tip = at([0, -250]);
    return `<g stroke-linejoin="round">`
      + `<path d="M${ip(tip)}L800,1216" stroke="#1a1426" stroke-width="9" stroke-linecap="round"/><path d="M${ip(tip)}L800,1216" stroke="#8a84a8" stroke-width="3" stroke-linecap="round"/>`
      + `<path d="${shape}" fill="${p.lin('parasol', [[0, '#3a2c58'], [0.6, '#1c1530'], [1, '#0e0a18']], [500, 120, 900, 520])}" stroke="#0a0712" stroke-width="3.4"/>`
      + `<path d="${ribs}" fill="none" stroke="#5a4a80" stroke-width="2.2" opacity=".8"/>`
      + `<path d="${scal}" fill="none" stroke="#d6dbf0" stroke-width="2.4" stroke-dasharray="1 9" stroke-linecap="round" transform="translate(0 -6)"/>`
      + `<path d="M${ip(at([-120, -150]))}Q${ip(at([-40, -200]))} ${ip(at([60, -190]))}M${ip(at([-60, -80]))}Q${ip(at([20, -110]))} ${ip(at([110, -96]))}" fill="none" stroke="#d6dbf0" stroke-width="1.6" opacity=".55"/>`
      + `<circle cx="${f1(tip[0])}" cy="${f1(tip[1])}" r="7" fill="#d6dbf0" stroke="#0a0712" stroke-width="2"/>`
      + `<path d="M800,1216Q796,1180 780,1176Q764,1176 766,1196" fill="none" stroke="#1a1426" stroke-width="10" stroke-linecap="round"/>`
      + `</g>`;
  },
  lilith(p) {
    const fin = (side) => {
      const R = side === 'R';
      const at = placer(R ? 596 : 236, 760, R ? 26 : -26);
      const blade = smooth([at([-18, 0, 1]), at([-30, -120]), at([-44, -230]), at([-30, -262]), at([0, -270]), at([30, -262]), at([44, -230]), at([30, -120]), at([18, 0, 1])], { closed: true });
      const vein = `M${ip(at([0, -20]))}L${ip(at([0, -250]))}M${ip(at([-16, -40]))}L${ip(at([-30, -232]))}M${ip(at([16, -40]))}L${ip(at([30, -232]))}`;
      return `<path d="${blade}" fill="${R ? '#24402e' : '#2f5a3c'}" stroke="#0e1a12" stroke-width="3"/>`
        + `<path d="${vein}" fill="none" stroke="#5f9a54" stroke-width="2" opacity=".8"/>`
        + `<path d="M${ip(at([-36, -238]))}Q${ip(at([0, -262]))} ${ip(at([36, -238]))}" fill="none" stroke="#d9a441" stroke-width="3"/>`;
    };
    return `<g stroke-linejoin="round">${fin('L')}${fin('R')}</g>` + hoodBack(cloth(p.variant === 'soft' ? '#34303e' : '#34303e'));
  },
  aila(p) {
    const at = placer(206, 1000, -16);
    const board = smooth([at([-62, 300, 1]), at([-66, -200]), at([-40, -420]), at([0, -470]), at([40, -420]), at([66, -200]), at([62, 300, 1])], { closed: true });
    const sun = p.accent ? p.accent.glyph(...at([0, -330]), 30, 0) : star(...at([0, -330]), 30, 0.5, 8);
    return `<g stroke-linejoin="round">`
      + `<path d="${board}" fill="${p.lin('board', [[0, '#ffffff'], [0.5, '#e8f2ff'], [1, '#9ec6f4']], [140, 500, 280, 500])}" stroke="#1c2f78" stroke-width="3.4"/>`
      + `<path d="M${ip(at([0, -462]))}L${ip(at([0, 300]))}" stroke="#4f7dff" stroke-width="10"/>`
      + `<path d="M${ip(at([-40, -380]))}L${ip(at([-50, 300]))}M${ip(at([40, -380]))}L${ip(at([50, 300]))}" stroke="#f5c84c" stroke-width="5"/>`
      + `<path d="${sun}" fill="#f5c84c" fill-rule="evenodd" stroke="#6a4a10" stroke-width="2"/>`
      + `</g>`;
  },
};

// head pieces: Lia's strawberry scrunchie, Mia's waterproof ear covers, Freya's snowflake swim flower,
// Evelyn's star-and-shell clips (her winged circlet is put away), Ophelia's shell strings on the horns
const HEAD = {
  lia(p) {
    const x = 455, y = 190;
    let berries = '';
    for (const [dx, dy] of [[-16, -2], [2, -8], [18, 0], [-6, 8], [12, 9]]) berries += `<path d="M${x + dx},${y + dy + 4}c-4,-2 -4,-7 0,-8c4,1 4,6 0,8z" fill="#ff5a6a"/><path d="M${x + dx - 2},${y + dy - 3}l2,-2l2,2z" fill="#5aa868"/>`;
    return `<g stroke-linejoin="round"><ellipse cx="${x}" cy="${y}" rx="28" ry="17" fill="#fff4f0" stroke="#8e1730" stroke-width="2.6"/>`
      + `<path d="M${x - 24},${y - 4}Q${x - 14},${y + 10} ${x},${y + 12}M${x + 6},${y - 15}Q${x + 14},${y} ${x + 24},${y + 4}" fill="none" stroke="#e8c8c4" stroke-width="2"/>${berries}</g>`;
  },
  mia(p) {
    const cover = 'M-52,-62C-54,-96 -40,-128 -14,-150C10,-142 30,-112 42,-66Q-6,-52 -52,-62Z';
    const band = 'M-54,-62Q-6,-50 44,-66';
    const one = (tf, lit) => `<g transform="${tf}"><path d="${cover}" fill="${lit ? '#ff9a3c' : '#e0761c'}" stroke="#6a2e06" stroke-width="3"/>`
      + `<path d="${band}" fill="none" stroke="#5ed7ff" stroke-width="5" stroke-linecap="round"/>`
      + `<path d="M-40,-80Q-36,-112 -16,-136" fill="none" stroke="#ffd2a8" stroke-width="3" stroke-linecap="round" opacity="${lit ? '.9' : '.4'}"/></g>`;
    return one('translate(314 232) rotate(-23) scale(1.06)', true) + one('translate(518 232) rotate(23) scale(-1.06 1.06)', false);
  },
  freya(p) {
    const x = 354, y = 226;
    let petals = '';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      petals += `<ellipse cx="${f1(x + Math.cos(a) * 14)}" cy="${f1(y + Math.sin(a) * 14)}" rx="12" ry="8" transform="rotate(${f1((a * 180) / Math.PI)} ${f1(x + Math.cos(a) * 14)} ${f1(y + Math.sin(a) * 14)})"/>`;
    }
    return `<g stroke-linejoin="round"><g fill="#f2fbff" stroke="#3f8fc4" stroke-width="2">${petals}</g>`
      + (p.accent ? p.accent.emblem(x, y, 0.42) : '') + `</g>`;
  },
  evelyn(p) {
    // the prayer bell at the end of her braid (heroines/evelyn.mjs: braid end 314,952, bell 30,34 below-right of it)
    // becomes a little scallop-shell bell for the beach (服装稿 §3.1)
    const bx = 344, by = 986;
    const ridges = [-12, -6, 0, 6, 12].map((dx) => `M${bx},${by + 12}L${bx + dx},${by - 12}`).join('');
    return `<g stroke-linejoin="round"><path d="${star(300, 300, 22)}" fill="#ffd98c" stroke="#7a5a1e" stroke-width="2.2"/><circle cx="300" cy="301" r="5" fill="#7fb2ff"/>`
      + `<path d="M268,338Q262,322 276,316Q290,312 296,326Q300,342 286,350Q272,352 268,338Z" fill="#fde4dc" stroke="#a0646c" stroke-width="2"/>`
      + `<path d="M276,320L282,346M284,318L288,344M270,328L280,348" stroke="#d8a09a" stroke-width="1.4"/>`
      + `<path d="M${bx - 17},${by + 4}Q${bx - 16},${by - 16} ${bx},${by - 17}Q${bx + 16},${by - 16} ${bx + 17},${by + 4}Q${bx + 8},${by + 13} ${bx},${by + 14}Q${bx - 8},${by + 13} ${bx - 17},${by + 4}Z" fill="#fde4dc" stroke="#a0646c" stroke-width="2"/>`
      + `<path d="${ridges}" stroke="#d8a09a" stroke-width="1.4"/><circle cx="${bx}" cy="${by + 17}" r="3.6" fill="#fff8f0" stroke="#a0646c" stroke-width="1.2"/></g>`;
  },
  ophelia(p) {
    const shells = (pts) => pts.map(([x, y], i) => i % 2
      ? `<circle cx="${x}" cy="${y}" r="5" fill="#fff4ea" stroke="#6a2a2a" stroke-width="1.4"/>`
      : `<path d="M${x - 7},${y + 4}Q${x},${y - 10} ${x + 7},${y + 4}Z" fill="#f9c8b8" stroke="#6a2a2a" stroke-width="1.4"/>`).join('');
    const L = [[214, 312], [222, 300], [232, 290], [244, 282], [256, 276], [268, 274]];
    return `<g stroke-linejoin="round"><path d="M210,316Q240,286 272,274" fill="none" stroke="#c8a878" stroke-width="2"/>${shells(L)}`
      + `<path d="${mirrorPath('M210,316Q240,286 272,274')}" fill="none" stroke="#c8a878" stroke-width="2"/>${shells(mirrorPts(L))}</g>`;
  },
};

// ---------------------------------------------------------------- Lia's shield, dressed up (never taken off, B10)
function extrasOverlay(p, name) {
  if (name !== 'shield') return '';
  const A = p.accent;
  // strawberry-print towel slung over the top rim near the outer corner + a ring buoy hung lower down
  const towel = 'M44,-14Q100,-24 158,-8L164,120Q150,132 136,122Q122,134 108,124Q94,136 80,126Q64,136 52,124Z';
  const print = A && A.print ? `<path d="${A.print.a(76, 40, 9)}${A.print.a(126, 76, 9)}${A.print.a(88, 100, 8)}" fill="${A.print.ca}"/><path d="${A.print.b(76, 40, 9)}${A.print.b(126, 76, 9)}${A.print.b(88, 100, 8)}" fill="${A.print.cb}"/>` : '';
  let buoy = '';
  for (let i = 0; i < 4; i++) {
    const a0 = (i / 4) * Math.PI * 2 + 0.4, a1 = a0 + Math.PI / 4;
    buoy += `<path d="M${f1(150 + Math.cos(a0) * 58)},${f1(186 + Math.sin(a0) * 58)}A58,58 0 0 1 ${f1(150 + Math.cos(a1) * 58)},${f1(186 + Math.sin(a1) * 58)}L${f1(150 + Math.cos(a1) * 32)},${f1(186 + Math.sin(a1) * 32)}A32,32 0 0 0 ${f1(150 + Math.cos(a0) * 32)},${f1(186 + Math.sin(a0) * 32)}Z" fill="#f4f2ea"/>`;
  }
  return `<g transform="translate(590 560) rotate(18)" stroke-linejoin="round">`
    + `<path d="${circ(150, 186, 58)}${circ(150, 186, 32)}" fill="#e83a3a" fill-rule="evenodd" stroke="#5a1010" stroke-width="3"/>${buoy}`
    + `<path d="${circ(150, 186, 45)}" fill="none" stroke="#f4f2ea" stroke-width="2" stroke-dasharray="6 8"/>`
    + `<path d="${towel}" fill="#fff6f0" stroke="#8e5a5a" stroke-width="2.4"/>${print}`
    + `<path d="M50,112Q100,104 158,110" fill="none" stroke="#ff8a96" stroke-width="5"/>`
    + `</g>`;
}

// ---------------------------------------------------------------- body back / neck / foreground slots
function bodyBack(p) {
  const id = p.heroine.id;
  let s = BACK[id] ? BACK[id](p) : '';
  if (p.variant === 'soft' && ['lia', 'mia', 'evelyn'].includes(id)) {
    s += hoodBack(cloth({ lia: '#c42a3c', mia: '#3a3f4c', evelyn: '#fbf8f0' }[id]));
  }
  return s;
}
function neckAccessory(p) {
  const id = p.heroine.id;
  if (id === 'lia') {
    // lifeguard whistle on a lanyard
    return `<path d="M384,700Q392,760 424,792M448,700Q446,752 428,790" fill="none" stroke="#f4f2ea" stroke-width="3.4" stroke-linecap="round"/>`
      + `<path d="M418,790h22a10,10 0 0 1 0,20h-10l-6,10h-6z" fill="#d6d9e4" stroke="#2a2a38" stroke-width="2.2" stroke-linejoin="round"/><circle cx="440" cy="800" r="4" fill="#2a2a38"/>`;
  }
  return '';
}
function foreground(p) {
  const id = p.heroine.id;
  let s = id === 'aila' ? ballClip(p) : '';
  // Freya: her big towel over the left shoulder (the cardigan replaces it in the 12+ version)
  if (id === 'freya' && p.variant !== 'soft') {
    const towel = smooth([[568, 760, 1], [640, 748], [700, 776], [716, 860], [712, 1216, 1], [588, 1216, 1], [600, 1040], [596, 900]], { closed: true });
    s += `<g stroke-linejoin="round"><path d="${towel}" fill="${p.lin('towel', [[0, '#ffffff'], [0.5, '#eef7fc'], [1, '#c6dcea']], [568, 0, 716, 0])}" stroke="#3f6e8e" stroke-width="3"/>`
      + `<path d="M592,1150Q650,1160 712,1150M594,1176Q650,1186 712,1176" fill="none" stroke="#8fd4f5" stroke-width="7"/>`
      + `<path d="${fold([[620, 800], [640, 900], [636, 1040]], 8)}${fold([[680, 840], [690, 980]], 7)}" fill="#b4cfe0"/></g>`;
  }
  // Mia: a striped mini swim ring round the drone's middle
  if (id === 'mia') {
    let st = '';
    for (let i = 0; i < 6; i++) {
      const a0 = (i / 6) * Math.PI, a1 = ((i + 1) / 6) * Math.PI;
      st += `<path d="M${f1(688 + Math.cos(a0) * 64)},${f1(700 + Math.sin(a0) * 22)}A64,22 0 0 1 ${f1(688 + Math.cos(a1) * 64)},${f1(700 + Math.sin(a1) * 22)}" fill="none" stroke="${i % 2 ? '#ffffff' : '#ff8a2a'}" stroke-width="16"/>`;
    }
    s += `<path d="M624,700A64,22 0 0 0 752,700" fill="none" stroke="#5a2a06" stroke-width="20"/>${st}`;
  }
  s += P[id] ? P[id](p) : '';
  // drops: hair ends and shoulders, never the chest
  const D = DROPS[id] || DROPS.default;
  s += `<g fill="#e9f8ff" stroke="#3f6e8e" stroke-width="1.4" opacity=".9">${D.map(([x, y, k]) => `<path d="${drop(x, y, k)}"/>`).join('')}</g>`
    + `<path d="${D.map(([x, y, k]) => `M${f1(x - 1.6 * k)},${f1(y - 2 * k)}h0`).join('')}" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>`;
  return s;
}
const DROPS = {
  default: [[262, 612, 1], [574, 640, 1.1], [206, 794, 1.2], [232, 770, 0.9], [630, 790, 1]],
  lia: [[196, 640, 1], [128, 900, 1.1], [574, 610, 1], [232, 772, 0.9], [640, 792, 1]],
  mia: [[284, 590, 1], [556, 600, 1.1], [206, 794, 1.2], [232, 770, 0.9]],
  serena: [[262, 760, 1], [574, 780, 1.1], [222, 812, 1], [612, 820, 1]],
  freya: [[244, 760, 1], [252, 700, 0.9], [206, 794, 1.1]],
  ophelia: [[236, 700, 1], [600, 720, 1.1], [190, 812, 1.1]],
};

// ---------------------------------------------------------------- background: a moonlit shore
function bgMotif(p) {
  const { n, rng } = p.helpers;
  const rand = rng(`${p.heroine.id}-shore`);
  const moon = p.rad('shoreMoon', [[0, '#ffffff'], [0.7, '#e8ddff'], [1, '#b8a8e8']], { cx: 140, cy: 150, r: 46 });
  const halo = p.rad('shoreHalo', [[0, '#e8ddff', 0.35], [1, '#e8ddff', 0]], { cx: 140, cy: 150, r: 220 });
  const sea = p.lin('shoreSea', [[0, '#16305a'], [0.4, '#0c1d3c'], [1, '#070614']], [0, 600, 0, 1100]);
  let glints = '';
  for (let i = 0; i < 16; i++) {
    const y = 618 + i * 14 + rand() * 6, w = 70 - i * 3 + rand() * 20;
    glints += `M${n(140 - w / 2 + rand() * 20)},${n(y)}h${n(w)}`;
  }
  let surf = '';
  for (let k = 0; k < 4; k++) {
    const y = 700 + k * 70;
    let d = `M0,${y}`;
    for (let x = 0; x <= 832; x += 104) d += `q26,${n(-10 - rand() * 6)} 52,0t52,0`;
    surf += d;
  }
  return `<rect width="832" height="1216" fill="${halo}"/><circle cx="140" cy="150" r="46" fill="${moon}"/>`
    + `<path d="M0,600H832V1216H0Z" fill="${sea}"/>`
    + `<path d="M0,600H832" stroke="#8fd4f5" stroke-width="2" opacity=".4"/>`
    + `<path d="${glints}" stroke="#e8ddff" stroke-width="3" stroke-linecap="round" opacity=".45"/>`
    + `<path d="${surf}" fill="none" stroke="#7ff0ff" stroke-width="6" opacity=".14"/><path d="${surf}" fill="none" stroke="#c8fbff" stroke-width="2" opacity=".45"/>`
    // the lighthouse on a far headland, its beam sweeping left
    + `<path d="M690,600Q740,560 832,566V600Z" fill="#0a1226"/>`
    + `<path d="M752,566L756,500H770L774,566Z" fill="#d8d4e8" stroke="#0a1226" stroke-width="2"/><path d="M754,520H772M753,540H773" stroke="#c13b4c" stroke-width="6"/>`
    + `<path d="M763,496L520,440L524,470Z" fill="#fff4c8" opacity=".18"/><circle cx="763" cy="496" r="7" fill="#fff4c8"/>`
    // dunes in the near corners
    + `<path d="M0,960Q120,900 260,940Q200,1100 0,1120Z" fill="#1a1630"/><path d="M832,980Q700,920 580,960Q640,1100 832,1110Z" fill="#14112a"/>`
    + `<path d="M0,960Q120,900 260,940M832,980Q700,920 580,960" fill="none" stroke="#e8ddff" stroke-width="2" opacity=".35"/>`;
}

// ---------------------------------------------------------------- the face for each cut (服装稿 §3.1 姿态)
const expression = {
  lia: { browAngle: 1, mouth: 'pressed', blush: 0.5, gaze: [0, 0] },
  mia: { gaze: [0.75, -0.35] },
  serena: { mouth: 'smile', browAsym: 0.3, gaze: [0, 0], mouthWidth: 0.8 },
  freya: { mouth: 'smile' },
  lilith: { gaze: [0.6, 0.15], blush: 0.4, mouth: 'pressed' },
  evelyn: { gaze: [-0.1, 0.6], browAngle: -0.9, blush: 0.65, mouth: 'open', mouthWidth: 0.6 },
  ophelia: { mouth: 'grin', gaze: [0, 0] },
  aila: { mouth: 'grin', browAsym: 0.6, gaze: [0, 0] },
};

function hairOrnament(p) {
  return HEAD[p.heroine.id] && p.heroine.id !== 'mia' && p.heroine.id !== 'ophelia' ? HEAD[p.heroine.id](p) : '';
}
function headBack(p) {
  return ['mia', 'ophelia'].includes(p.heroine.id) ? HEAD[p.heroine.id](p) : '';
}

export default {
  type: 'swimsuit',
  label: '泳装',
  variants: ['soft'],
  render,
  bgMotif,
  bodyBack,
  neckAccessory,
  headBack,
  hairOrnament,
  foreground,
  extrasOverlay,
  expression,
  hideFor: { evelyn: ['headFront'] },
};
