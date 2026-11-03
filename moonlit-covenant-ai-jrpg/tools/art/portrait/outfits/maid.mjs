// 女仆装 (type 'maid', ★3; 服装稿 §2.3 / §3.3) - the uniform of the 雾港 bridge-head inn (ex001) and the 拱廊街 café,
// stylised; a work uniform, never a servant's (no 主人 / 侍奉 / 侍从 in any text). Three cuts (服装稿 §2.3):
//   classic  serena, freya, ophelia  long sleeves with puffed shoulders, high lace collar, ruffled bib apron
//   café     mia, evelyn, aila       short puff sleeves, round collar, ruffled bib apron
//   work     lia, lilith             rolled sleeves (Lilith: short sleeves), plain wide straps, a thick apron with a pocket
// Necklines stay above the sternum and both content modes share one image. Her emblem is embroidered on the bib, her
// motif stitched along the waistband; each of them carries one thing of her own (the weapon's place), and the frilled
// headband sits on top of the hair (Ophelia's ties round her horns, Mia's sits between the receiver ears).
import { sampleSpline, n, mix } from '../base.mjs';
import { placer, f1, circ } from '../garment.mjs';

const WHITE = { white: '#f7f3fb', whiteShade: '#d2c9e2', whiteDeep: '#a99ec4', whiteLine: '#5a5072' };
const dressKit = (base, sheen) => ({
  black: base, blackShade: mix(base, '#000000', 0.38), blackDeep: mix(base, '#000000', 0.62), blackLit: mix(base, '#ffffff', 0.12),
  blackSheen: sheen || mix(base, '#ffffff', 0.32), blackLine: mix(base, '#000000', 0.78),
});
const apronKit = (base) => ({ white: base, whiteShade: mix(base, '#2a2a50', 0.18), whiteDeep: mix(base, '#2a2a50', 0.36), whiteLine: mix(base, '#141430', 0.6) });
// per heroine: cut, dress colour, optional sleeve colour, apron colour, trim
const MAID = {
  serena: { cut: 'classic', dress: '#231c33', sheen: '#5a4a80' },
  freya: { cut: 'classic', dress: '#1f3c5c' },
  ophelia: { cut: 'classic', dress: '#1c2f62', trim: '#c8643c' },
  mia: { cut: 'cafe', dress: '#25212f', sleeve: '#2aa6d6' },
  evelyn: { cut: 'cafe', dress: '#efe6d4', apron: '#7fa8ee', sheen: '#fffaf0' },
  aila: { cut: 'cafe', dress: '#1f2f5f', trim: '#f5c84c' },
  lia: { cut: 'work', dress: '#25212f', trim: '#a8243a' },
  lilith: { cut: 'work', dress: '#1e1c24', sleeve: '#2c5a3c', short: true, trim: '#d9a441' },
};
function kitOf(id) {
  const M = MAID[id] || MAID.serena;
  return { ...dressKit(M.dress, M.sheen), ...(M.apron ? apronKit(M.apron) : WHITE), M, S: M.sleeve ? dressKit(M.sleeve) : null };
}

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
  const K = kitOf(p.heroine.id);
  const { M } = K;
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
  const work = M.cut === 'work';
  const wings = work ? '' : `<path d="${rufL.d}" fill="${K.white}" stroke="${K.whiteLine}" stroke-width="2.4" stroke-linejoin="round"/>`
    + `<path d="${rufL.gathers}" fill="none" stroke="${K.whiteDeep}" stroke-width="1.6" opacity=".8"/>`
    + `<path d="${rufL.dots}" fill="none" stroke="${K.whiteDeep}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="0 8.5"/>`;
  // the work apron hangs from plain wide straps (no ruffled wings)
  const strapW = work ? taper(strapL, { w: 30, start: 1, end: 1, peak: 0.5 }) : strapD;
  s += `<g id="${p.id('strap')}">${wings}<path d="${strapW}" fill="${K.white}" stroke="${K.whiteLine}" stroke-width="2.4"/></g>`
    // right wing + strap: mirrored copy, in shadow
    + `<use href="#${p.id('strap')}" transform="${MIR}"/><g transform="${MIR}" fill="${K.whiteShade}">${work ? '' : `<path d="${rufL.d}" opacity=".75"/>`}<path d="${strapW}" opacity=".6"/></g>`;

  // bib with ruffle along the sides and the top
  const bib = sm([[344, 1004, 1], [340, 816, 1], [348, 806], [360, 804, 1], [472, 804, 1], [484, 806], [492, 816, 1], [488, 1004, 1]], { closed: true });
  const rufBib = ruffle([[346, 1000], [342, 900], [341, 812], [380, 804], [452, 804], [491, 812], [490, 900], [486, 1000]], 25, () => 13, 1);
  if (!work) s += `<path d="${rufBib.d}" fill="${K.white}" stroke="${K.whiteLine}" stroke-width="2.4" stroke-linejoin="round"/>`
    + `<path d="${rufBib.gathers}" fill="none" stroke="${K.whiteDeep}" stroke-width="1.5" opacity=".75"/>`
    + `<path d="${rufBib.dots}" fill="none" stroke="${K.whiteDeep}" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="0 7.5"/>`;
  s += `<path d="${bib}" fill="${whiteGrad}" stroke="${K.whiteLine}" stroke-width="2.6"/>`
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
  // heroine accents (B11): her emblem embroidered on the bib, her motif stitched along the waistband
  const A = p.accent;
  if (A) {
    const yBand = (x) => 1020 - 18 * ((x - 416) / 176) ** 2; // centre line of the waistband
    s += `<path d="${[300, 358, 474, 532].map((x) => A.glyph(x, yBand(x), 9)).join('')}" fill="${A.main}" fill-rule="evenodd" opacity=".9"/>`;
    if (work) {
      // a big stitched pocket on the bib with her emblem on it (and Lia's strawberries above it)
      s += `<path d="M362,900H470V982Q416,994 362,982Z" fill="${K.white}" stroke="${K.whiteLine}" stroke-width="2.4"/><path d="M368,906H464" stroke="${K.whiteDeep}" stroke-width="1.6" stroke-dasharray="4 4"/>`
        + A.emblem(416, 944, 0.9);
      if (A.print) s += `<path d="${A.print.a(384, 864, 9)}${A.print.a(450, 868, 8)}" fill="${A.print.ca}"/><path d="${A.print.b(384, 864, 9)}${A.print.b(450, 868, 8)}" fill="${A.print.cb}"/>`;
    } else s += A.emblem(416, 902, 1.4);
  }

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
  const SL = K.S || K; // sleeve colours (Mia's cyan puffs, Lilith's green sleeves)
  if (M.cut !== 'work') s += `<g id="${p.id('puff')}"><path d="${puff}" fill="${SL.black}" stroke="${SL.blackLine}" stroke-width="3.2" stroke-linejoin="round"/>`
    + `<path d="${puffShade}" fill="${SL.blackShade}"/><path d="${folds}" fill="${SL.blackDeep}"/>`
    + `<path d="${ridges}" fill="${SL.blackLit}"/><path d="${puffHi}" fill="${SL.blackSheen}" opacity=".9"/>`
    + `<path d="${cuff}" fill="${SL.blackShade}" stroke="${SL.blackLine}" stroke-width="2.6"/>`
    + `<path d="M142,924Q190,936 244,924" fill="none" stroke="${K.white}" stroke-width="3"/></g>`
    // right sleeve: mirrored copy pushed into shadow
    + `<use href="#${p.id('puff')}" transform="${MIR}"/><g transform="${MIR}"><path d="${puff}${cuff}" fill="${SL.blackDeep}" opacity=".45"/><path d="M142,924Q190,936 244,924" fill="none" stroke="${K.whiteDeep}" stroke-width="3"/></g>`;

  // café: short puffs - bare forearms below the cuff; work: sleeves rolled to the elbow (Lilith: short, one shoulder frill)
  if (M.cut === 'cafe' || M.cut === 'work') {
    const h = M.cut === 'cafe' ? 948 : M.short ? 960 : 1010;
    const arm = `M40,${h - 6}Q140,${h + 12} 242,${h + 4}V1230H40Z`;
    if (M.cut === 'work' && K.S) s += `<g clip-path="${p.refs.bodyClip}"><path d="M40,700H246V${h}H40Z" fill="${K.S.black}"/><path d="M586,700H792V${h}H586Z" fill="${K.S.blackShade}"/><path d="${p.shapes.armSeamL}${p.shapes.armSeamR}" fill="none" stroke="${K.S.blackLine}" stroke-width="3"/></g>`;
    s += `<g clip-path="${p.refs.bodyClip}"><path d="${arm}" fill="${pal.skin}"/><path d="${mirrorPath(arm)}" fill="${pal.skin}"/>`
      + `<path d="M128,${h + 16}Q180,${h + 36} 238,${h + 26}V1216H128Z" fill="${pal.skinShadow}" opacity=".3"/><path d="M600,${h + 20}Q650,${h + 46} 704,${h + 36}V1216H600Z" fill="${pal.skinShadow}" opacity=".6"/>`
      + `<path d="M234,${h + 8}V1216M598,${h + 8}V1216" stroke="${pal.skinLine}" stroke-width="2" opacity=".35"/></g>`;
    if (M.cut === 'work') {
      const SLw = K.S || K;
      const roll = `M122,${h - 26}Q182,${h - 8} 240,${h - 18}L240,${h + 6}Q182,${h + 16} 124,${h}Z`;
      s += `<g clip-path="${p.refs.bodyClip}"><path d="${roll}" fill="${SLw.blackLit}" stroke="${SLw.blackLine}" stroke-width="2.4"/><path d="${mirrorPath(roll)}" fill="${SLw.blackShade}" stroke="${SLw.blackLine}" stroke-width="2.4"/>`
        + `<path d="M126,${h - 12}Q182,${h + 4} 238,${h - 6}${mirrorPath(`M126,${h - 12}Q182,${h + 4} 238,${h - 6}`)}" fill="none" stroke="${SLw.blackDeep}" stroke-width="2"/></g>`;
      if (M.short) {
        // Lilith: a short frill on one shoulder (viewer's left), echoing her one-sided cape
        const fr = ruffle([[372, 704], [300, 716], [236, 742], [186, 778], [150, 826]], 11, (t) => 20 + 26 * Math.sin(t * Math.PI), -1, 0.5);
        s += `<path d="${fr.d}" fill="${K.black}" stroke="${K.blackLine}" stroke-width="2.4" stroke-linejoin="round"/><path d="${fr.gathers}" fill="none" stroke="${K.blackSheen}" stroke-width="1.6"/>`;
      }
    }
  }
  // gold / copper piping along the bib's top edge
  if (M.trim) s += `<path d="M350,820Q416,814 482,820" fill="none" stroke="${M.trim}" stroke-width="3"/>`;

  // ---- collar: classic = high white collar with a lace edge; café = small round collar; work = plain band collar
  if (M.cut === 'cafe') {
    const pp = sm([[372, 694, 1], [356, 712], [356, 740], [384, 752], [412, 738, 1]], { closed: true });
    s += `<path d="${pp}" fill="${K.white}" stroke="${K.whiteLine}" stroke-width="2.4"/><path d="${mirrorPath(pp)}" fill="${K.whiteShade}" stroke="${K.whiteLine}" stroke-width="2.4"/>`
      + `<path d="M366,712Q370,734 390,744" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`;
  } else if (M.cut === 'work') {
    const bandC = sm([[368, 672, 1], [416, 684], [464, 672, 1], [470, 704, 1], [416, 716], [362, 704, 1]], { closed: true });
    s += `<path d="${bandC}" fill="${K.blackLit}" stroke="${K.blackLine}" stroke-width="2.6"/>`
      + (M.trim ? `<path d="M368,700Q416,712 466,700" fill="none" stroke="${M.trim}" stroke-width="3"/>` : '');
  } else {
    const collar = sm([[365, 660, 1], [390, 672], [416, 676], [442, 672], [467, 660, 1], [484, 712, 1], [448, 726], [416, 731], [384, 726], [348, 712, 1]], { closed: true });
    const lace = ruffle([[365, 662], [390, 674], [416, 678], [442, 674], [467, 662]], 11, () => 8, 1, 0.5);
    s += `<path d="${lace.d}" fill="${K.white}" stroke="${K.whiteLine}" stroke-width="1.8" stroke-linejoin="round"/>`
      + `<path d="${lace.dots}" fill="none" stroke="${K.whiteDeep}" stroke-width="2" stroke-linecap="round" stroke-dasharray="0 6"/>`
      + `<path d="${collar}" fill="${whiteGrad}" stroke="${K.whiteLine}" stroke-width="3"/>`
      + `<path d="M440,673L467,660L484,712L450,724Q452,694 440,673Z" fill="${K.whiteShade}"/>`
      + `<path d="M370,676Q368,698 358,710" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`
      + `<path d="M392,678Q394,702 390,726M440,678Q438,702 442,726" fill="none" stroke="${K.whiteDeep}" stroke-width="1.6" opacity=".8"/>`
      + `<path d="M416,678V731" stroke="${K.whiteLine}" stroke-width="2"/>`;
  }

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
  const id = p.heroine.id;
  const K = kitOf(id);
  // Serena's headpiece is black lace; Evelyn's frill carries two small lace wings, Lia's a little flame
  const lace = id === 'serena' ? { white: '#2a2238', whiteShade: '#1a1426', whiteDeep: '#6a5a90', whiteLine: '#0a0812' } : WHITE;
  const [ay, hw, ey] = BAND[id] || BAND.default;
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
    + `<path d="${frill.d}" fill="${lace.white}" stroke="${lace.whiteLine}" stroke-width="2.2"/>`
    + `<path d="${pleats}" fill="${lace.whiteShade}" opacity=".8"/>`
    + `<path d="${frill.gathers}" fill="none" stroke="${lace.whiteDeep}" stroke-width="1.4"/>`
    + `<path d="${frill.dots}" fill="none" stroke="${lace.whiteDeep}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="0 7"/>`
    + `<path d="${bandD}" fill="${K.black}" stroke="${K.blackLine}" stroke-width="2"/>`
    + `<path d="${taper(arc.slice(0, 3), { w: 2.4, start: 0.2, end: 0.6, peak: 0.7 })}" fill="${K.blackSheen}" transform="translate(0 -2)"/>`
    + locks(tuck, { fill: pal.hair, shade: pal.hairShadow, line: pal.hairLine, stroke: pal.hairLine, strokeWidth: 2, lineOpacity: 0.4 })
    + `<path d="${bow}" fill="${R.base}" stroke="${R.line}" stroke-width="2"/>`
    + `<circle cx="${n(bx)}" cy="${n(by)}" r="4.6" fill="${R.shade}" stroke="${R.line}" stroke-width="1.8"/>`
    + (HEAD[id] ? HEAD[id](p, { ay, hw, ey }) : '')
    + `</g>`;
}

// small additions to the headband
const HEAD = {
  // a little flame on the band
  lia: (p, { ay }) => `<path d="M416,${ay - 40}C428,${ay - 26} 434,${ay - 14} 426,${ay - 4}Q416,${ay + 4} 406,${ay - 4}C398,${ay - 14} 406,${ay - 26} 416,${ay - 40}Z" fill="#ff8a4a" stroke="#8e1730" stroke-width="2"/><path d="M416,${ay - 24}C420,${ay - 16} 420,${ay - 10} 416,${ay - 6}C412,${ay - 10} 412,${ay - 16} 416,${ay - 24}Z" fill="#ffd27a"/>`,
  // two small lace wings on the band (her circlet's wings, in lace)
  evelyn: (p, { hw, ey }) => [-1, 1].map((k) => `<path d="M${416 + k * (hw - 10)},${ey - 24}q${k * 30},-30 ${k * 50},-18q${-k * 14},10 ${-k * 10},26q${-k * 18},-6 ${-k * 40},-8z" fill="#ffffff" stroke="#8a7a52" stroke-width="1.8"/>`).join(''),
  // the frill's ribbons tied in bows round the base of her horns
  ophelia: () => [[262, 302], [570, 302]].map(([x, y]) => `<path d="M${x},${y}l-18,-12l-2,22zM${x},${y}l18,-10l2,22z" fill="#f7f3fb" stroke="#5a5072" stroke-width="2"/><circle cx="${x}" cy="${y + 1}" r="5" fill="#c8643c" stroke="#5a5072" stroke-width="1.6"/>`).join(''),
};

// ---------------------------------------------------------------- the thing each of them carries (the weapon's place)
const PROP = {
  // a three-tier cake stand, strawberry cake on top ("点单。三秒内决定。")
  lia() {
    const plate = (y, w) => `<ellipse cx="200" cy="${y}" rx="${w}" ry="${w * 0.22}" fill="#f4f2ea" stroke="#5a5070" stroke-width="2.4"/>`;
    let treats = '';
    for (const [x, y, c] of [[156, 1132, '#c9a46a'], [196, 1130, '#f2c8d8'], [236, 1132, '#c9a46a'], [170, 1060, '#e8d4a8'], [222, 1060, '#f2c8d8']]) treats += `<circle cx="${x}" cy="${y - 10}" r="14" fill="${c}" stroke="#6a4a2a" stroke-width="1.8"/>`;
    return `<g stroke-linejoin="round"><path d="M200,1216V940" stroke="#a8a2bc" stroke-width="7"/>${plate(1140, 92)}${plate(1068, 70)}${treats}${plate(1000, 52)}`
      + `<path d="M170,996V962Q200,950 230,962V996Z" fill="#fff6f0" stroke="#8a5a5a" stroke-width="2.2"/><path d="M170,972Q200,982 230,972" fill="none" stroke="#ff8a96" stroke-width="5"/>`
      + `<path d="M200,962c-8,-4 -8,-14 0,-16c8,2 8,12 0,16z" fill="#e8344a" stroke="#6a0e1c" stroke-width="1.4"/><path d="M196,946l4,-4l4,4z" fill="#5aa868"/></g>`;
  },
  // Zero brings the tea on its head, in a tiny frill of its own
  mia() {
    return `<g stroke-linejoin="round"><path d="M652,636q36,-14 72,0l-4,8q-32,-12 -64,0z" fill="#f7f3fb" stroke="#5a5072" stroke-width="1.8"/>`
      + `<path d="M664,606H712L706,628H670Z" fill="#fbfaf6" stroke="#2a3346" stroke-width="2.2"/><path d="M712,610q14,2 10,12q-4,6 -12,4" fill="none" stroke="#2a3346" stroke-width="2.2"/>`
      + `<path d="M666,610H710" stroke="#b07a3a" stroke-width="4"/><path d="M678,598q-6,-10 2,-18M694,598q6,-10 -2,-18" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".6"/></g>`;
  },
  // a silver cloche whose dome shows only a crescent moon
  serena(p) {
    return `<g stroke-linejoin="round"><path d="M520,1140A96,86 0 0 1 712,1140Z" fill="${p.lin('cloche', [[0, '#ffffff'], [0.5, '#c9cde0'], [1, '#7a7e98']], [520, 0, 712, 0])}" stroke="#2c2766" stroke-width="3"/>`
      + `<path d="M500,1140H732V1156H500Z" fill="#a8acc4" stroke="#2c2766" stroke-width="2.4"/><circle cx="616" cy="1048" r="9" fill="#d6dbf0" stroke="#2c2766" stroke-width="2"/>`
      + `<path d="M600,1076A26,26 0 1 0 600,1122A20,20 0 1 1 600,1076Z" fill="#efe9ff" opacity=".9"/></g>`;
  },
  // a steaming teapot and its cup
  freya() {
    return `<g stroke-linejoin="round"><path d="M560,1120C560,1060 600,1040 640,1040C680,1040 720,1060 720,1120C720,1170 690,1196 640,1196C590,1196 560,1170 560,1120Z" fill="#f6fbff" stroke="#1d4a6e" stroke-width="3"/>`
      + `<path d="M560,1100Q520,1090 508,1060" fill="none" stroke="#1d4a6e" stroke-width="8" stroke-linecap="round"/><path d="M720,1090Q756,1100 744,1140Q736,1160 716,1156" fill="none" stroke="#1d4a6e" stroke-width="6"/>`
      + `<path d="M612,1040Q640,1020 668,1040" fill="#9fd0ea" stroke="#1d4a6e" stroke-width="2.4"/><path d="${'M570,1110Q640,1124 710,1110'}" fill="none" stroke="#8fd4f5" stroke-width="6"/>`
      + `<path d="M500,1040Q490,1010 504,990Q516,970 506,950" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/></g>`;
  },
  // a silver service bell and a little order pad with no writing on it
  evelyn() {
    return `<g stroke-linejoin="round"><path d="M560,1110A50,46 0 0 1 660,1110Z" fill="#d6dbf0" stroke="#4a4a6a" stroke-width="2.6"/><path d="M548,1110H672V1124H548Z" fill="#a8acc4" stroke="#4a4a6a" stroke-width="2.2"/><circle cx="610" cy="1060" r="7" fill="#d6dbf0" stroke="#4a4a6a" stroke-width="2"/>`
      + `<path d="M230,1080L320,1070L330,1196L240,1206Z" fill="#fbf8f0" stroke="#5a5070" stroke-width="2.4"/><path d="M246,1100L314,1092M248,1124L316,1116M250,1148L318,1140" stroke="#c8c4d8" stroke-width="2.4"/></g>`;
  },
  // a fistful of shiny silver cutlery she "collected" ("我先帮你保管")
  ophelia() {
    let s = '';
    [-26, -12, 2, 16, 30].forEach((a, i) => {
      const at = placer(560, 1200, a - 90);
      const tip = at([220, 0]);
      s += `<path d="M560,1200L${f1(tip[0])},${f1(tip[1])}" stroke="#5a5a78" stroke-width="10" stroke-linecap="round"/><path d="M560,1200L${f1(tip[0])},${f1(tip[1])}" stroke="#e6e8f2" stroke-width="6" stroke-linecap="round"/>`
        + (i % 2 ? `<ellipse cx="${f1(tip[0])}" cy="${f1(tip[1])}" rx="12" ry="18" transform="rotate(${a} ${f1(tip[0])} ${f1(tip[1])})" fill="#e6e8f2" stroke="#5a5a78" stroke-width="2.4"/>`
          : `<path d="M${f1(tip[0] - 10)},${f1(tip[1] + 8)}V${f1(tip[1] - 22)}M${f1(tip[0])},${f1(tip[1] + 8)}V${f1(tip[1] - 24)}M${f1(tip[0] + 10)},${f1(tip[1] + 8)}V${f1(tip[1] - 22)}" stroke="#e6e8f2" stroke-width="4" stroke-linecap="round" transform="rotate(${a} ${f1(tip[0])} ${f1(tip[1])})"/>`);
    });
    return `<g stroke-linejoin="round">${s}<path d="M548,1006l8,-10M600,1000l4,-12" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`;
  },
  // a silver tray held up like a round shield, one cup of tea standing perfectly still on it
  aila() {
    return `<g stroke-linejoin="round"><ellipse cx="270" cy="1110" rx="112" ry="104" transform="rotate(-18 270 1110)" fill="#d6dbf0" stroke="#4a4a6a" stroke-width="3.4"/>`
      + `<ellipse cx="270" cy="1110" rx="92" ry="84" transform="rotate(-18 270 1110)" fill="none" stroke="#a8acc4" stroke-width="3"/>`
      + `<path d="M236,1060H286L282,1090H240Z" fill="#fbfaf6" stroke="#2a3346" stroke-width="2.2"/><path d="M240,1064H282" stroke="#b07a3a" stroke-width="4"/>`
      + `<path d="M206,1060q20,-30 60,-34" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/></g>`;
  },
};
// Lilith: two feather dusters crossed behind her shoulders, where her dagger hilts would show
function bodyBack(p) {
  if (p.heroine.id !== 'lilith') return '';
  const duster = (side) => {
    const R = side === 'R';
    const at = placer(R ? 600 : 232, 760, R ? 24 : -24);
    let plumes = '';
    for (let i = -3; i <= 3; i++) {
      const tip = at([i * 16, -270 + Math.abs(i) * 14]);
      plumes += `<path d="M${ip2(at([0, -120]))}Q${ip2(at([i * 10, -190]))} ${ip2(tip)}" fill="none" stroke="${i % 2 ? '#2c5a3c' : '#1e1c24'}" stroke-width="16" stroke-linecap="round"/>`;
    }
    return `<path d="M${ip2(at([0, 40]))}L${ip2(at([0, -120]))}" stroke="#4a3210" stroke-width="10" stroke-linecap="round"/>${plumes}<circle cx="${f1(at([0, -120])[0])}" cy="${f1(at([0, -120])[1])}" r="8" fill="#d9a441" stroke="#4a3210" stroke-width="2"/>`;
  };
  return `<g stroke-linejoin="round">${duster('L')}${duster('R')}</g>`;
}
const ip2 = (q) => `${Math.round(q[0])},${Math.round(q[1])}`;
function foreground(p) {
  return PROP[p.heroine.id] ? PROP[p.heroine.id](p) : '';
}

const expression = {
  lia: { browAngle: 1.1, mouth: 'pressed' },
  mia: { gaze: [0.7, -0.4] },
  serena: { mouth: 'smirk', browAsym: 0.3 },
  freya: { mouth: 'smile' },
  lilith: { mouth: 'smirk', gaze: [0.4, 0.1] },
  evelyn: { mouth: 'open', blush: 0.6, browAngle: -0.5, mouthWidth: 0.7 },
  ophelia: { mouth: 'grin' },
  aila: { mouth: 'grin', browAsym: 0.5, gaze: [0, 0] },
};

export default {
  type: 'maid',
  label: '女仆装',
  render,
  bgMotif,
  bodyBack,
  hairOrnament,
  foreground,
  expression,
  hideFor: { evelyn: ['headFront'] },
};
