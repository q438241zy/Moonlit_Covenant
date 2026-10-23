// Story-mode bust of the golden-haired assassin of chapter 13 (speaker golden_assassin, nameplate 金发刺客; script 13
// 美術需求). She is the same person as the gacha portrait tools/art/portrait/heroines/lilith.mjs — the same face, the
// gold eyes, the small plaster across the bridge of the nose, the black-and-gold light armour, the one-sided short cape
// and the two dagger hilts above her shoulders — but she has no name yet, so she is drawn as an enemy in the rain:
//   - the hood is UP and soaked: a dark shell behind the head, a front edge that frames the face and hides the ears
//     and the crown, rain running off its rim in drops; only the bangs, one lock at the hood's edge and the end of the
//     high ponytail (coming out from under the back of the hood) show of the gold hair;
//   - the upper half of the face lies in the hood's shadow, with the gold eyes and the plaster still clear;
//   - a cold, watchful look (pressed mouth, level brows) instead of the portrait's smirk;
//   - at the throat a black-and-gold clasp holding the hood's edges, bearing the whole house crest (the winged shield and
//     sword that Aila's cape lining carries, tools/art/portrait/heroines/aila.mjs crest()) — chapter 13 later shows
//     half of it;
//   - no violet shadow wisps, no ear cuff, no text, no name, no blood, no wound, nothing suggestive.
// Composed by portraitBust() like the other heroine story busts (transparent 600×800, faded at the bottom). The heroine
// object is a derived copy whose id/name are neutral, so nothing in the file names her.
import lilith, { LILITH_COLORS as C, hairBack, hairFront, gear, faceMarks } from '../portrait/heroines/lilith.mjs';
import { portraitBust } from './portrait-bust.mjs';

// the hood's outer shell (behind the head), its right side pushed out by the ponytail underneath
const SHELL = [[186, 830], [196, 640], [214, 470], [244, 330], [292, 226], [356, 164], [416, 146], [480, 160], [548, 214], [600, 300], [640, 400], [700, 462], [748, 548], [736, 640], [690, 740], [650, 830]];
// the opening round the face (inside the front edge)
const OPEN = [[334, 676], [302, 590], [290, 492], [292, 400], [308, 322], [348, 266], [416, 246], [484, 264], [526, 318], [542, 398], [544, 492], [532, 590], [498, 676], [416, 712]];

function hoodBack(p) {
  const { smooth } = p.helpers;
  const shell = smooth(SHELL, { closed: true });
  // the inside of the hood behind the head: almost black, a little damp sheen low on the far side
  return `<path d="${shell}" fill="${p.lin('hoodIn', [[0, '#120d1a'], [1, '#07050b']], [0, 160, 0, 800])}" stroke="${C.suitLine}" stroke-width="3"/>`
    + `<path d="M560,300Q610,420 600,560" fill="none" stroke="#3a4a66" stroke-width="5" opacity=".35"/>`;
}

// the ponytail, only where it hangs out from under the back of the hood (below the shell's widest point)
function tailOut(p) {
  const { smooth } = p.helpers;
  p.def(`<clipPath id="${p.id('tailOut')}"><path d="M-10,-10H842V1226H-10Z${smooth(SHELL, { closed: true })}" clip-rule="evenodd"/></clipPath>`);
  p.def(`<clipPath id="${p.id('tailLow')}"><path d="M-10,540H842V1226H-10Z"/></clipPath>`);
  return `<g clip-path="${p.url('tailLow')}"><g clip-path="${p.url('tailOut')}">${hairBack(p)}</g></g>`;
}

// the front of the hood: the dark wet cloth round the face and over the shoulders, its trimmed rim, the shadow it
// throws down the face, water running off it, and the crest clasp at the throat
function hoodFront(p) {
  const { smooth, taper, n } = p.helpers;
  const outer = smooth([[176, 820], [194, 630], [222, 450], [258, 310], [314, 212], [376, 160], [416, 150], [460, 158], [530, 206], [584, 296], [616, 420], [632, 560], [646, 700], [656, 820],
    [600, 800], [556, 752], [520, 724], [470, 730], [416, 740], [362, 730], [312, 724], [276, 752], [232, 800]], { closed: true });
  const open = smooth(OPEN, { closed: true });
  const cloth = p.lin('hoodOut', [[0, C.hoodLit], [0.45, C.hood], [1, C.hoodShade]], [190, 0, 650, 0]);
  const rim = smooth(OPEN.slice(0, 13));
  // the shadow inside the opening: dark at the rim, thinning past the eyes, gone by the mouth
  const shade = p.lin('hoodShade', [[0, '#05030a', 0.9], [0.38, '#05030a', 0.7], [0.55, '#05030a', 0.42], [0.72, '#05030a', 0.15], [1, '#05030a', 0]], [0, 246, 0, 640]);
  // folds and the wet sheen on the cloth (cold light from above-left)
  const folds = 'M262,360Q248,470 252,600M300,250Q268,330 262,420M570,330Q590,440 590,580M532,236Q566,300 578,370M226,640Q232,720 240,790M610,640Q616,720 622,790';
  const sheen = [taper([[300, 214], [356, 176], [416, 164]], { w: 7, start: 0.1, end: 0, peak: 0.5 }), taper([[236, 420], [226, 520], [222, 640]], { w: 6, start: 0.1, end: 0, peak: 0.5 }), taper([[214, 680], [206, 740], [204, 800]], { w: 4, start: 0.1, end: 0, peak: 0.5 })].join('');
  // drops: hanging from the rim and the hood's lower edges, a few falling
  const drop = (x, y, s) => `M${n(x)},${n(y)}q${n(s * 0.9)},${n(s * 1.6)} 0,${n(s * 2.2)}q${n(-s * 0.9)},${n(-s * 0.6)} 0,${n(-s * 2.2)}Z`;
  const drops = [[306, 330, 5], [292, 470, 4.5], [304, 600, 5], [530, 330, 5], [544, 452, 4.5], [534, 590, 5], [252, 790, 5], [606, 792, 5], [280, 640, 4], [574, 650, 4]].map(([x, y, s]) => drop(x, y, s)).join('');
  const falling = [[300, 362, 3.5], [538, 380, 3.5], [250, 830, 4], [610, 840, 4], [302, 652, 3]].map(([x, y, s]) => drop(x, y, s)).join('');
  const runs = 'M246,470Q240,540 244,610M594,470Q600,540 598,610M330,196Q310,214 296,240';
  return `<g stroke-linejoin="round">`
    + `<path d="${open}" fill="${shade}"/>` + eyeGlints(p)
    + `<path d="${outer}${open}" fill="${cloth}" fill-rule="evenodd" stroke="${C.suitLine}" stroke-width="3"/>`
    + `<path d="${folds}" fill="none" stroke="${C.hoodShade}" stroke-width="4" opacity=".9"/>`
    + `<path d="${sheen}" fill="#9ab4dc" opacity=".35"/>`
    + `<path d="${runs}" fill="none" stroke="#c8d8f0" stroke-width="2" opacity=".35" stroke-linecap="round"/>`
    // the rim: a dark turned edge with a thin gold line, as on her lowered hood in the portrait
    + `<path d="${rim}" fill="none" stroke="${C.violetDark}" stroke-width="11" stroke-linecap="round"/><path d="${rim}" fill="none" stroke="${C.goldShade}" stroke-width="2.2" stroke-linecap="round"/>`
    + lockOut(p)
    + `<path d="${drops}" fill="#dce8f8" opacity=".75"/><path d="${falling}" fill="#dce8f8" opacity=".55"/>`
    + crestClasp(p, 416, 704)
    + `</g>`;
}

// one wet lock of gold hair escaping the hood's edge on her right (viewer's left), lying over the cloth
function lockOut(p) {
  const { taper } = p.helpers;
  const pal = p.palette;
  const body = taper([[300, 420], [290, 500], [296, 580], [312, 650], [306, 700]], { w: 22, start: 0.7, end: 0, peak: 0.25 });
  const hi = taper([[296, 450], [290, 520], [298, 590]], { w: 6, start: 0.2, end: 0, peak: 0.4 });
  const strand = taper([[304, 440], [298, 540], [310, 640]], { w: 2, start: 0, end: 0, peak: 0.5 });
  return `<path d="${body}" fill="${pal.hairShadow}" stroke="${pal.hairLine}" stroke-width="2"/><path d="${hi}" fill="${pal.hair}" opacity=".9"/><path d="${strand}" fill="${pal.hairLine}" opacity=".5"/>`;
}

// the clasp at the throat: a black disc ringed in gold carrying the house crest (winged shield and sword), two short
// gold cords to the hood's edges
function crestClasp(p, cx, cy) {
  const { n } = p.helpers;
  const s = 0.36;
  const T = (d) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${n(cx + x * s)},${n(cy + y * s)}`);
  const wing = 'M-14,-14C-30,-28 -50,-30 -64,-24C-56,-20 -50,-14 -48,-8C-56,-8 -60,-2 -62,4C-52,2 -44,4 -38,10C-44,12 -46,18 -46,22C-34,16 -22,14 -16,16Z';
  const wingR = wing.replace(/(-?\d+(?:\.\d+)?),/g, (_, x) => `${-x},`);
  const shield = 'M-16,-18L16,-18L16,6C16,20 6,30 0,34C-6,30 -16,20 -16,6Z';
  const sword = 'M0,-34L0,30M-9,-14L9,-14';
  return `<path d="M${cx - 96},${cy - 16}Q${cx - 50},${cy + 6} ${cx - 26},${cy}M${cx + 96},${cy - 16}Q${cx + 50},${cy + 6} ${cx + 26},${cy}" fill="none" stroke="${C.goldLine}" stroke-width="6" stroke-linecap="round"/>`
    + `<path d="M${cx - 96},${cy - 16}Q${cx - 50},${cy + 6} ${cx - 26},${cy}M${cx + 96},${cy - 16}Q${cx + 50},${cy + 6} ${cx + 26},${cy}" fill="none" stroke="${C.gold}" stroke-width="3" stroke-linecap="round"/>`
    + `<circle cx="${cx}" cy="${cy}" r="27" fill="${C.goldShade}" stroke="${C.goldLine}" stroke-width="2.6"/>`
    + `<circle cx="${cx}" cy="${cy}" r="22" fill="#0e0b12" stroke="${C.gold}" stroke-width="2"/>`
    + `<path d="${T(wing)}${T(wingR)}" fill="${C.goldShade}" stroke="${C.gold}" stroke-width="1.2" stroke-linejoin="round"/>`
    + `<path d="${T(shield)}" fill="#1a1620" stroke="${C.gold}" stroke-width="1.4" stroke-linejoin="round"/>`
    + `<path d="${T(sword)}" stroke="${C.goldLit}" stroke-width="1.6" stroke-linecap="round"/>`
    + `<path d="M${cx - 18},${cy - 12}A22,22 0 0 1 ${cx + 6},${cy - 21}" fill="none" stroke="#fff" stroke-width="1.6" opacity=".55"/>`;
}

// the gold eyes catch what light there is under the hood
function eyeGlints(p) {
  const { n } = p.helpers;
  const [lx, ly] = p.anchors.eyeL, [rx, ry] = p.anchors.eyeR;
  const g = p.rad('eyeGlow', [[0, '#ffd84e', 0.5], [1, '#ffd84e', 0]], { cx: 0.5, cy: 0.5, r: 0.5 }, 'objectBoundingBox');
  return `<ellipse cx="${n(lx - 6)}" cy="${n(ly + 4)}" rx="30" ry="18" fill="${g}"/><ellipse cx="${n(rx - 6)}" cy="${n(ry + 4)}" rx="30" ry="18" fill="${g}"/>`;
}

// the heroine definition for the bust: lilith's face and figure under neutral ids, a cold rain rim light
const assassin = {
  ...lilith,
  id: 'goldenAssassin',
  name: '金发刺客',
  palette: { ...lilith.palette, accent: '#9ab4dc', hairHighlight: '#fbe9a8' },
  expression: { ...lilith.expression, mouth: 'pressed', mouthWidth: 0.85, browAngle: 0.7, browAsym: 0, browRaise: 0, lidDrop: 0.24, lowerLid: 0.2, blush: 0, gaze: [-0.25, 0] },
  costumeLayers: [],
  layers: {
    hairBack: tailOut,
    bodyBack: (p) => gear(p, { hoodDown: false }),
    outfit: lilith.layers.outfit,
    faceMarks,
    hairFront,
    foreground: hoodFront,
  },
  extras: { hoodBack },
};

export function goldenAssassinBust() {
  return portraitBust(assassin, {
    prefix: 'sbNpcGoldAssassin',
    extras: ['hoodBack'],
    label: '金发刺客：湿透的深色兜帽戴着，帽檐往下滴水，脸的上半在兜帽的阴影里，只看得清一双金色的眼睛和鼻梁上的小膏药；金发只从兜帽边缘露出一绺，高马尾的发尾从兜帽后面垂出来；黑金轻甲、单侧短披风，领口一枚黑底金纹的家纹扣，双肩后露出两把短刀的刀柄；神情冷、警觉',
  });
}
