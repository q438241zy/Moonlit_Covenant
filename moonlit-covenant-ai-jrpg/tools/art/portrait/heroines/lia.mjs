// Lia Hest - the crimson-oath knight (reference heroine for the portrait template).
// Canon: docs/CHARACTER-DESIGN.md section 1. Adult (age 19), drawn modest.
const C = {
  silver: '#a3a7bb', silverLit: '#d9dcea', silverShade: '#6b6f88', silverDeep: '#43455e', metalLine: '#221e34',
  crimson: '#6c1a2b', crimsonLit: '#94283c', crimsonShade: '#45101d', crimsonLine: '#250910',
  suit: '#26111b', suitShade: '#170a11', suitLit: '#3b1a28',
  gold: '#ffd091', goldMid: '#e3a95e', goldDeep: '#93602a', goldLine: '#5a3512',
  ember: '#ff9a4a',
  streak: '#3d0d18', streakShade: '#24060d', streakHi: '#7a2232',
};

export default {
  id: 'lia',
  name: '莉亚·赫斯特',
  palette: {
    accent: '#ff6b7c', accent2: '#ffd091',
    hair: '#c62a3e', hairShadow: '#8e1730', hairDeep: '#5c0d22', hairHighlight: '#ff8a84', hairLine: '#470918',
    eyeTop: '#6e300c', eyeBottom: '#ffc04a', eyeLine: '#2a110c',
    skin: '#f8e0d2', skinShadow: '#e2a9a4', skinDeep: '#c4858c', skinLine: '#9a5458',
    brow: '#5a1020',
  },
  expression: { eyeShape: 'sharp', browAngle: 0.8, mouth: 'pressed', gaze: [0.35, 0], blush: 0.28 },
  face: { jaw: -0.6, width: -1, chin: 4 }, // a little sharper / angular
  costumeLayers: ['bodyBack', 'foreground'],
  layers: {
    bgMotif,
    hairBack,
    bodyBack: cape,
    outfit: armor,
    faceMarks,
    hairFront,
    foreground: swordHilt,
  },
};

// ------------------------------------------------------------------ background: gothic window + blood moon
function bgMotif(p) {
  const { n, rng, smooth } = p.helpers;
  const arch = 'M150,1216V400A380,380 0 0 1 416,38A380,380 0 0 1 682,400V1216Z';
  const inner = 'M178,1216V404A352,352 0 0 1 416,74A352,352 0 0 1 654,404V1216';
  const outer = 'M118,1216V396A412,412 0 0 1 416,2A412,412 0 0 1 714,396V1216Z';
  const glass = p.lin('glass', [[0, '#221232'], [0.45, '#2c1028'], [1, '#150b20']], [0, 40, 0, 900]);
  const stone = p.lin('stone', [[0, '#2c2546'], [1, '#18142c']], [0, 0, 0, 1216]);
  const mx = 552, my = 150, mr = 86;
  const moon = p.rad('moon', [[0, '#ffe0da'], [0.5, '#f29092'], [0.86, '#c63c4e'], [1, '#93203a']], { cx: mx, cy: my, r: mr, fx: mx - 22, fy: my - 24 });
  const halo = p.rad('halo', [[0, '#ff6b7c', 0.4], [0.45, '#ff6b7c', 0.12], [1, '#ff6b7c', 0]], { cx: mx, cy: my, r: 280 });
  const clip = p.clip('glassClip', arch);
  const maria = [
    [[560, 112], [590, 118], [598, 140], [578, 150], [556, 136]],
    [[522, 160], [546, 154], [556, 176], [534, 186], [516, 176]],
    [[584, 176], [604, 172], [610, 196], [592, 206]],
  ].map((pts) => smooth(pts, { closed: true })).join('');
  const rand = rng('lia-embers');
  let embers = '', cores = '';
  for (let i = 0; i < 38; i++) {
    const y = 240 + rand() * 940, x = 24 + rand() * 784, r = 1.2 + rand() * (y > 800 ? 3.6 : 2.4);
    const len = 3 + rand() * 12;
    embers += `<path d="M${n(x)},${n(y)}l${n(-len * 0.35)},${n(-len)}" stroke-width="${n(r)}"/>`;
    if (rand() > 0.6) cores += `M${n(x)},${n(y)}h0`;
  }
  return `<path d="${outer}" fill="${stone}"/>`
    + `<path d="${arch}" fill="${glass}"/>`
    + `<g clip-path="${clip}"><rect width="832" height="1216" fill="${halo}"/><circle cx="${mx}" cy="${my}" r="${mr}" fill="${moon}"/><path d="${maria}" fill="#9a2a3c" opacity=".3"/>`
    + `<path d="M150,600H682V640H150z" fill="#ff6b7c" opacity=".06"/></g>`
    // tracery in front of the glass: inner arch, mullions, transom
    + `<path d="${inner}M416,74V1216M290,140V1216M542,140V1216M150,400H682" fill="none" stroke="#110d20" stroke-width="7"/>`
    + `<path d="${inner}M150,396H682" fill="none" stroke="#3a3262" stroke-width="2" opacity=".55"/>`
    + `<path d="${arch}" fill="none" stroke="#0d0a1a" stroke-width="10"/><path d="${outer}" fill="none" stroke="#3b3360" stroke-width="3" opacity=".7"/>`
    + `<path d="M40,1216V470Q40,410 72,380H96V1216ZM792,1216V470Q792,410 760,380H736V1216Z" fill="#1b1630" opacity=".9"/>`
    + `<path d="M96,1216V380M736,1216V380" stroke="#3a3260" stroke-width="3" opacity=".5"/>`
    + `<g stroke="#ff9a4a" stroke-linecap="round" opacity=".85" filter="${p.refs.glow}">${embers}</g>`
    + `<path d="${cores}" stroke="#ffe2b0" stroke-width="2.2" stroke-linecap="round"/>`;
}

// ------------------------------------------------------------------ hair (back): high ponytail
function hairBack(p) {
  const { lock, smooth, taper } = p.helpers;
  const pal = p.palette;
  const L = (pts, w, o = {}) => lock(pts[0], pts[pts.length - 1], { points: pts, w, ...o });
  // the tail springs up from a tie behind the crown, arcs over to the viewer's left and falls behind the shoulder
  const main = L([[456, 204], [444, 152], [392, 132], [330, 158], [282, 222], [248, 322], [222, 452], [202, 604], [180, 764], [154, 914], [128, 1044], [108, 1150]], 132, { swell: 0.22, start: 0.42 });
  const outer = L([[338, 150], [272, 214], [230, 324], [204, 464], [182, 626], [156, 790], [126, 944], [94, 1064]], 40, { swell: 0.3, start: 0.1 });
  const split = L([[180, 850], [156, 954], [140, 1060], [146, 1156]], 38, { swell: 0.2, start: 0.9 });
  const ends = [
    L([[150, 940], [128, 1020], [110, 1090], [86, 1150]], 26, { swell: 0.25, start: 0.9 }),
    L([[172, 960], [168, 1040], [176, 1110], [190, 1170]], 22, { swell: 0.25, start: 0.9 }),
  ];
  const strands = [
    [[436, 146], [380, 146], [326, 188], [282, 270], [252, 390], [230, 530], [210, 690], [188, 850]],
    [[300, 214], [262, 310], [236, 450], [214, 610], [192, 770], [166, 910], [140, 1036]],
  ].map((s) => taper(s, { w: 2.2, start: 0, end: 0, peak: 0.45 })).join('');
  const hi = taper([[436, 140], [390, 136], [344, 156], [306, 196], [280, 248]], { w: 12, start: 0.1, end: 0, peak: 0.5 });
  const hi2 = taper([[244, 380], [230, 460], [220, 540]], { w: 8, start: 0.1, end: 0, peak: 0.5 });
  const fly = taper([[440, 150], [400, 124], [356, 116], [318, 126]], { w: 5.5, start: 0, end: 0, peak: 0.3 })
    + taper([[290, 236], [252, 258], [228, 286], [218, 314]], { w: 5, start: 0, end: 0, peak: 0.3 });
  const backMass = smooth([[452, 184], [380, 176], [314, 200], [270, 250], [250, 330], [252, 420], [300, 420], [330, 300], [400, 240], [460, 220]], { closed: true });
  return `<g stroke-linejoin="round">`
    + `<path d="${backMass}" fill="${pal.hairDeep}"/>`
    + `<path d="${split.d}" fill="${pal.hairShadow}" stroke="${pal.hairLine}" stroke-width="2.6"/>`
    + ends.map((e) => `<path d="${e.d}" fill="${pal.hairShadow}" stroke="${pal.hairLine}" stroke-width="2.2"/><path d="${e.shade}" fill="${pal.hairDeep}" opacity=".7"/>`).join('')
    + `<path d="${main.d}" fill="${p.lin('tailGrad', [[0, pal.hair], [0.45, pal.hair], [1, pal.hairShadow]], [0, 300, 0, 1000])}" stroke="${pal.hairLine}" stroke-width="3.4"/>`
    + `<path d="${main.shade}" fill="${pal.hairShadow}"/>`
    + `<path d="${outer.d}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="2"/><path d="${outer.shade}" fill="${pal.hairShadow}" opacity=".7"/>`
    + `<path d="${strands}" fill="${pal.hairLine}" opacity=".45"/>`
    + `<path d="${hi}${hi2}" fill="${pal.hairHighlight}" opacity=".75"/>`
    + `<path d="${fly}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="1.4"/>`
    // the tie: a dark band peeking above the crown where the tail springs out
    + `<path d="${smooth([[432, 190], [450, 178], [476, 184], [476, 204], [452, 206], [434, 208]], { closed: true })}" fill="#1c0a10" stroke="${pal.hairLine}" stroke-width="2"/>`
    + `<path d="M440,190Q456,182 470,188" fill="none" stroke="#6a3040" stroke-width="2" stroke-linecap="round"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ hair (front): dome, side-swept bangs, side locks, streak
function hairFront(p) {
  const { smooth, taper, lock } = p.helpers;
  const pal = p.palette;
  const hairGrad = p.lin('hairDome', [[0, '#dc3d50'], [0.55, pal.hair], [1, pal.hairShadow]], [300, 180, 540, 400]);
  const dome = smooth([[258, 420], [250, 360], [254, 300], [272, 248], [306, 208], [356, 186], [416, 180], [476, 186], [526, 208], [560, 246], [578, 300], [582, 360], [574, 420],
    [556, 360], [500, 300], [416, 280], [330, 300], [276, 360]], { closed: true });
  const domeShade = smooth([[578, 300], [582, 360], [574, 420], [556, 360], [520, 316], [540, 280], [560, 262]], { closed: true });
  const sweep = [
    [[300, 290], [318, 240], [366, 204], [430, 190]],
    [[520, 280], [514, 236], [478, 202], [450, 192]],
  ].map((s) => taper(s, { w: 2.2, start: 0.1, end: 0, peak: 0.5 })).join('');
  const ringTop = [[262, 314], [282, 266], [322, 228], [380, 206], [440, 202], [500, 210], [546, 234], [574, 276]];
  const ringBot = [[562, 280, 1], [554, 292, 1], [542, 270, 1], [526, 280, 1], [512, 256, 1], [492, 266, 1], [474, 246, 1], [452, 256, 1], [432, 240, 1], [410, 252, 1], [390, 242, 1], [370, 262, 1], [354, 252, 1], [336, 274, 1], [322, 266, 1], [302, 292, 1], [290, 286, 1], [276, 318, 1]];
  const ring = smooth(ringTop.concat(ringBot), { closed: true });
  const P = (pts, w, o = {}) => ({ root: pts[0], tip: pts[pts.length - 1], points: pts, w, swell: 0.35, start: 0.2, ...o });
  // long side locks framing the face (in front of the ears, down onto the pauldrons)
  const sideL = P([[284, 300], [264, 420], [254, 530], [256, 640], [270, 760], [262, 830]], 40, { swell: 0.25 });
  const sideL2 = P([[294, 330], [282, 440], [282, 540], [296, 640]], 20);
  const sideR = P([[548, 300], [570, 420], [580, 530], [578, 640], [566, 760], [574, 840]], 40, { swell: 0.25 });
  const sideR2 = P([[538, 330], [552, 440], [552, 540], [540, 630]], 20);
  const streak = P([[432, 196], [486, 222], [532, 270], [562, 350], [576, 450], [578, 560]], 30, { swell: 0.45, start: 0 });
  // side-swept bangs from a part on the viewer's left
  const bangsBack = [
    P([[352, 226], [306, 270], [282, 340], [272, 430]], 42, { swell: 0.45, start: 0.05 }),
    P([[396, 218], [482, 246], [540, 300], [566, 370], [570, 462]], 52, { swell: 0.45, start: 0.05 }),
  ];
  const bangs = [
    P([[362, 224], [334, 272], [316, 334], [310, 404]], 46, { swell: 0.45 }),
    P([[366, 226], [356, 290], [352, 350], [360, 406]], 34, { swell: 0.45 }),
    P([[370, 220], [424, 260], [474, 314], [508, 372], [526, 424]], 66, { swell: 0.4 }),
    P([[372, 222], [418, 280], [444, 342], [452, 404]], 52, { swell: 0.42 }),
    P([[370, 226], [392, 290], [400, 352], [394, 414]], 42, { swell: 0.45 }),
  ];
  const between = taper([[390, 290], [404, 346], [410, 396], [404, 430]], { w: 6, start: 0.2, end: 0, peak: 0.35 });
  const H = p.helpers.locks;
  const style = { fill: pal.hair, shade: pal.hairShadow, line: pal.hairLine, stroke: pal.hairLine, highlight: pal.hairHighlight, strokeWidth: 2, lineOpacity: 0.35, shadeOpacity: 0.85 };
  const wisps = [
    taper([[296, 350], [284, 430], [290, 510], [304, 570]], { w: 4, start: 0.1, end: 0, peak: 0.25 }),
    taper([[538, 350], [550, 430], [546, 500], [534, 556]], { w: 4, start: 0.1, end: 0, peak: 0.25 }),
  ].join('');
  const st = lock(streak.root, streak.tip, streak);
  // union clip of the bang locks: shared highlight band + root shadow read as ONE mass of hair
  const bangDs = bangs.map((b) => lock(b.root, b.tip, b).d);
  const bangClip = p.clip('bangClip', bangDs);
  const rootShade = p.lin('bangRoot', [[0, pal.hairDeep, 0.75], [1, pal.hairDeep, 0]], [0, 222, 0, 280]);
  return `<g stroke-linejoin="round">`
    + H([sideL, sideR], style)
    + `<path d="${dome}" fill="${hairGrad}" stroke="${pal.hairLine}" stroke-width="3.4"/>`
    + `<path d="${domeShade}" fill="${pal.hairShadow}" opacity=".8"/>`
    + `<path d="${ring}" fill="${pal.hairHighlight}" opacity=".8"/>`
    + `<path d="${sweep}" fill="${pal.hairLine}" opacity=".45"/>`
    + H([sideL2, sideR2], { ...style, fill: pal.hairShadow, shade: pal.hairDeep })
    + H(bangsBack, { ...style, fill: pal.hairShadow, shade: pal.hairDeep })
    + `<path d="${st.d}" fill="${C.streak}" stroke="${pal.hairLine}" stroke-width="2"/><path d="${st.shade}" fill="${C.streakShade}"/><path d="${st.line}" fill="${C.streakHi}" opacity=".9"/>`
    + H(bangs.map((b) => ({ ...b, hi: [0.3, 0.52] })), { ...style, hiOpacity: 0.85 })
    + `<g clip-path="${bangClip}"><rect x="250" y="200" width="340" height="90" fill="${rootShade}"/></g>`
    + `<path d="${between}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="1.4"/>`
    + `<path d="${wisps}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="1.2"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ face marks: scar under the right eye through the brow tail
function faceMarks(p) {
  const { taper } = p.helpers;
  const pal = p.palette;
  // her right eye = viewer's left
  const upper = taper([[322, 386], [316, 404], [312, 416]], { w: 2.6, start: 0.3, end: 0.2, peak: 0.5 });
  const lower = taper([[318, 462], [324, 478], [332, 494]], { w: 2.8, start: 0.3, end: 0.1, peak: 0.4 });
  const lowerHi = taper([[321, 463], [327, 478], [334, 492]], { w: 1.4, start: 0.3, end: 0.1, peak: 0.4 });
  return `<path d="${upper}${lower}" fill="${pal.skinDeep}"/><path d="${lowerHi}" fill="#fff4ee" opacity=".7"/>`;
}

// ------------------------------------------------------------------ cape (behind the body)
function cape(p) {
  const { smooth } = p.helpers;
  const outer = p.lin('capeOuter', [[0, C.crimsonLit], [1, C.crimsonShade]], [0, 760, 0, 1216]);
  const left = smooth([[200, 760], [150, 790], [112, 860], [84, 960], [62, 1080], [48, 1216, 1], [72, 1216, 1], [80, 1180, 1], [96, 1196, 1], [104, 1150, 1], [122, 1176, 1], [130, 1216, 1], [140, 1216, 1]], { closed: true });
  const right = smooth([[632, 760], [682, 790], [722, 860], [750, 960], [772, 1080], [790, 1216, 1], [700, 1216, 1]], { closed: true });
  const liningR = smooth([[724, 900], [752, 1000], [772, 1110], [786, 1216, 1], [744, 1216, 1], [756, 1186, 1], [738, 1196, 1], [742, 1140, 1], [724, 1150, 1], [730, 1060], [722, 960]], { closed: true });
  const scorch = p.lin('scorch', [[0, '#5a2414'], [0.7, '#2a120c'], [1, '#c25a2a']], [0, 900, 0, 1216]);
  return `<path d="${left}" fill="${outer}" stroke="${C.crimsonLine}" stroke-width="3"/>`
    + `<path d="${right}" fill="${outer}" stroke="${C.crimsonLine}" stroke-width="3"/>`
    + `<path d="${liningR}" fill="${scorch}" stroke="${C.crimsonLine}" stroke-width="2"/>`
    + `<path d="M744,1216L756,1186L738,1196L742,1140L724,1150" fill="none" stroke="${C.ember}" stroke-width="2" opacity=".7"/>`
    + `<path d="M48,1216L72,1216L80,1180L96,1196L104,1150L122,1176L130,1216" fill="none" stroke="${C.ember}" stroke-width="2" opacity=".55"/>`
    + `<g fill="none" stroke="${C.crimsonLine}" stroke-width="3" stroke-linecap="round" opacity=".8"><path d="M690,820Q718,900 730,1010M700,900Q716,980 716,1080M112,860Q96,940 86,1040"/></g>`
    + `<g fill="none" stroke="${C.crimsonLit}" stroke-width="2" stroke-linecap="round" opacity=".5"><path d="M684,800Q712,880 724,960M118,840Q104,900 96,980"/></g>`;
}

// ------------------------------------------------------------------ armour
function armor(p) {
  const { smooth, taper, mirrorPath } = p.helpers;
  const metalL = p.lin('metalL', [[0, C.silverLit], [0.3, C.silver], [0.75, C.silverShade], [1, C.silverDeep]], [300, 740, 420, 1150]);
  const metalR = p.lin('metalR', [[0, C.silver], [0.4, C.silverShade], [1, C.silverDeep]], [420, 760, 540, 1100]);
  const suit = p.lin('suit', [[0, C.suitLit], [1, C.suit]], [0, 620, 0, 1000]);
  const crim = p.lin('crim', [[0, C.crimsonLit], [1, C.crimsonShade]], [0, 780, 0, 1150]);
  let s = '';
  // undersuit (dark) everywhere below the collar
  s += `<g clip-path="${p.refs.bodyClip}"><rect x="0" y="680" width="832" height="540" fill="${suit}"/>`
    + `<path d="M236,780L304,770L330,1216H236Z" fill="${crim}"/><path d="M596,780L528,770L502,1216H596Z" fill="${C.crimsonShade}"/>`
    + `<path d="M300,776L326,1216M532,776L506,1216" stroke="${C.crimsonLine}" stroke-width="3"/>`
    + `<path d="${taper([[250, 800], [262, 960], [270, 1120]], { w: 5, start: 0.3, end: 0, peak: 0.3 })}" fill="${C.crimsonLit}" opacity=".8"/>`
    + `<path d="M282,800Q290,900 300,1000M560,820Q550,920 540,1010" fill="none" stroke="${C.crimsonLine}" stroke-width="2" stroke-dasharray="6 6" opacity=".7"/>`
    + `</g>`;
  // high collar
  const collar = smooth([[360, 624, 1], [388, 636], [416, 640], [444, 636], [472, 624, 1], [480, 708, 1], [416, 724], [352, 708, 1]], { closed: true });
  const collarFill = p.lin('collar', [[0, '#4e1c2b'], [0.55, '#33121d'], [1, '#1c0a11']], [360, 0, 480, 0]);
  s += `<path d="${collar}" fill="${collarFill}" stroke="${C.crimsonLine}" stroke-width="3"/>`
    + `<path d="M440,637L472,624L480,708L452,716Z" fill="${C.suitShade}"/>`
    + `<path d="M362,630Q416,652 470,630" fill="none" stroke="${C.crimsonLit}" stroke-width="3.2"/>`
    + `<path d="M368,646Q372,680 366,704" fill="none" stroke="${C.suitLit}" stroke-width="3" opacity=".8"/>`
    + `<path d="M392,644Q396,676 392,712M440,644Q436,676 440,712" fill="none" stroke="${C.crimsonShade}" stroke-width="2"/>`;
  // cuirass: lit left half, shaded right half, central ridge
  const cuirL = smooth([[416, 752, 1], [372, 754], [330, 764], [302, 792], [294, 850], [300, 930], [316, 1010], [332, 1100], [338, 1216, 1], [416, 1216, 1]], { closed: true });
  s += `<path d="${cuirL}" fill="${metalL}" stroke="${C.metalLine}" stroke-width="3.2"/>`
    + `<path d="${mirrorPath(cuirL)}" fill="${metalR}" stroke="${C.metalLine}" stroke-width="3.2"/>`;
  // environment reflection bands (reads as polished metal) clipped to the cuirass
  const cuirClip = p.clip('cuirClip', [cuirL, mirrorPath(cuirL)]);
  s += `<g clip-path="${cuirClip}">`
    + `<path d="M280,872Q350,896 416,890V936Q350,940 280,914Z" fill="${C.silverShade}" opacity=".75"/>`
    + `<path d="M552,872Q482,896 416,890V936Q482,940 552,914Z" fill="${C.silverDeep}" opacity=".8"/>`
    + `<path d="M280,866Q350,888 416,882" fill="none" stroke="#fff" stroke-width="2.4" opacity=".55"/>`
    + `<path d="M280,1000Q350,1020 416,1016V1216H280Z" fill="${C.silverDeep}" opacity=".35"/>`
    + `</g>`;
  // cel planes + worn edge highlights
  s += `<path d="${smooth([[300, 930], [316, 1010], [332, 1100], [338, 1216, 1], [416, 1216, 1], [416, 1040], [370, 1010], [330, 960]], { closed: true })}" fill="${C.silverShade}" opacity=".45"/>`
    + `<path d="${taper([[318, 780], [302, 820], [300, 900], [310, 980]], { w: 5, start: 0.2, end: 0, peak: 0.3 })}" fill="${C.silverLit}" opacity=".9"/>`
    + `<path d="${taper([[352, 830], [342, 900], [348, 980]], { w: 16, start: 0.1, end: 0, peak: 0.4 })}" fill="#fff" opacity=".2"/>`
    + `<path d="M416,756V1216" stroke="${C.silverLit}" stroke-width="2.2" opacity=".75"/><path d="M419,758V1216" stroke="${C.metalLine}" stroke-width="2" opacity=".55"/>`
    + `<path d="M318,1060Q416,1094 514,1060M326,1128Q416,1162 506,1128" fill="none" stroke="${C.metalLine}" stroke-width="2.6"/>`
    + `<path d="M320,1065Q416,1099 512,1065" fill="none" stroke="${C.silverLit}" stroke-width="1.6" opacity=".5"/>`;
  // dents, scratches and rivets (worn armour)
  s += `<g stroke="${C.silverDeep}" stroke-width="1.6" stroke-linecap="round" opacity=".75"><path d="M318,900l16,-9M324,912l9,-4M486,950l14,8M470,1000l10,6M360,990l12,-10"/></g>`;
  s += [[312, 820], [306, 900], [314, 980], [520, 820], [526, 900], [518, 980]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${C.silverDeep}"/><circle cx="${x - 1.2}" cy="${y - 1.2}" r="1.5" fill="${C.silverLit}"/>`).join('');
  // torn cape rag hanging under the damaged pauldron
  const edge = 'M118,1008L130,986L140,1026L154,996L166,1044L182,1000L198,1036L210,994L224,1020';
  const rag = smooth([[132, 900], [238, 910], [234, 960], [224, 1020, 1], [210, 994, 1], [198, 1036, 1], [182, 1000, 1], [166, 1044, 1], [154, 996, 1], [140, 1026, 1], [130, 986, 1], [118, 1008, 1]], { closed: true });
  s += `<path d="${rag}" fill="${crim}" stroke="${C.crimsonLine}" stroke-width="2.4"/>`
    + `<path d="${edge}" fill="none" stroke="#2c120a" stroke-width="6" stroke-linejoin="round"/>`
    + `<path d="${edge}" fill="none" stroke="${C.ember}" stroke-width="1.6" stroke-linejoin="round" opacity=".85"/>`;
  // gorget: two lames around the neck base, the lower one notched for the crystal
  const g2 = smooth([[296, 744, 1], [362, 758], [416, 764], [470, 758], [536, 744, 1], [552, 778, 1], [470, 790], [438, 800, 1], [416, 820, 1], [394, 800, 1], [362, 790], [280, 778, 1]], { closed: true });
  const g1 = smooth([[352, 700, 1], [416, 716], [480, 700, 1], [514, 722], [538, 752, 1], [470, 762], [416, 768], [362, 762], [294, 752, 1], [318, 722]], { closed: true });
  s += `<path d="${g2}" fill="${metalL}" stroke="${C.metalLine}" stroke-width="3"/>`
    + `<path d="${smooth([[536, 744, 1], [552, 778, 1], [470, 790], [438, 800, 1], [446, 776], [480, 766]], { closed: true })}" fill="${C.silverDeep}" opacity=".6"/>`
    + `<path d="${g1}" fill="${metalL}" stroke="${C.metalLine}" stroke-width="3"/>`
    + `<path d="${smooth([[480, 700, 1], [514, 722], [538, 752, 1], [470, 762], [446, 764], [470, 740], [484, 716]], { closed: true })}" fill="${C.silverShade}" opacity=".8"/>`
    + `<path d="M304,746Q340,722 380,722" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`
    + `<path d="M300,772Q340,784 380,786" fill="none" stroke="${C.silverLit}" stroke-width="2" stroke-linecap="round" opacity=".7"/>`
    + `<path d="M358,708Q416,726 474,708" fill="none" stroke="${C.crimsonLit}" stroke-width="3"/>`
    + `<circle cx="416" cy="724" r="10" fill="none" stroke="${C.metalLine}" stroke-width="7"/><circle cx="416" cy="724" r="10" fill="none" stroke="${C.silver}" stroke-width="3.6"/><path d="M408,718A10,10 0 0 1 422,715" fill="none" stroke="#fff" stroke-width="1.6" opacity=".8"/>`;
  s += `<g transform="matrix(.93 0 0 1 21 0)">${pauldron(p, 'L')}</g><g transform="matrix(.93 0 0 1 37.2 0)">${pauldron(p, 'R')}</g>`;
  s += crystal(p);
  // sleeves: fold lines on the dark undersuit
  s += `<g fill="none" stroke="${C.suitLit}" stroke-width="2.4" stroke-linecap="round" opacity=".9"><path d="M140,1000Q160,1030 150,1070M200,980Q214,1010 206,1060M692,1000Q672,1030 682,1070M632,980Q618,1010 626,1060"/></g>`;
  return s;
}

function pauldron(p, side) {
  const { smooth, mirrorPath, taper } = p.helpers;
  const M = side === 'R' ? mirrorPath : (d) => d;
  const L = side === 'L';
  const f = L ? p.lin('pauldL', [[0, C.silverLit], [0.5, C.silver], [1, C.silverShade]], [150, 740, 250, 880])
    : p.lin('pauldR', [[0, C.silver], [0.55, C.silverShade], [1, C.silverDeep]], [682, 740, 582, 880]);
  const lameF = L ? C.silverShade : C.silverDeep;
  const lame2 = [[112, 912], [158, 908], [216, 900], [262, 880], [264, 904], [218, 928], [160, 938], [116, 942]];
  const lame1 = [[106, 878, 1], [152, 874], [206, 868], [256, 852], [264, 884], [216, 904], [158, 912], [112, 914]];
  const plate = [[306, 768], [264, 748], [208, 742], [160, 756], [126, 788], [108, 834], [104, 880, 1], [152, 874], [206, 868], [256, 852], [298, 824]];
  const outerPlane = [[126, 788], [108, 834], [104, 880, 1], [152, 874], [184, 868], [172, 836], [154, 806]];
  let s = '';
  for (const l of [lame2, lame1]) {
    s += `<path d="${M(smooth(l, { closed: true }))}" fill="${lameF}" stroke="${C.metalLine}" stroke-width="2.8"/>`
      + `<path d="${M(`M${l[0][0] + 4},${l[0][1] + 3}Q${l[1][0]},${l[1][1] + 3} ${l[3][0] - 4},${l[3][1] + 4}`)}" fill="none" stroke="${C.silverLit}" stroke-width="1.8" opacity="${L ? '.6' : '.3'}"/>`;
  }
  s += `<path d="${M(smooth(plate, { closed: true }))}" fill="${f}" stroke="${C.metalLine}" stroke-width="3.4"/>`
    + `<path d="${M(smooth(outerPlane, { closed: true }))}" fill="${C.silverDeep}" opacity="${L ? '.55' : '.45'}"/>`
    // rolled rim along the top edge
    + `<path d="${M('M130,800Q166,768 214,758Q264,756 300,778')}" fill="none" stroke="${C.metalLine}" stroke-width="2.4" opacity=".8"/>`
    + `<path d="${M('M128,794Q164,762 212,752Q262,750 298,772')}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="${L ? '.75' : '.35'}"/>`
    // crimson trim + rivets along the lower edge
    + `<path d="${M('M108,872Q152,868 206,862Q246,852 292,826')}" fill="none" stroke="${C.crimsonLit}" stroke-width="5"/>`
    + [[136, 866], [196, 860], [252, 844]].map(([x, y]) => `<circle cx="${L ? x : 832 - x}" cy="${y - 10}" r="3.4" fill="${C.goldMid}" stroke="${C.goldLine}" stroke-width="1.2"/>`).join('')
    + `<path d="${M(taper([[220, 776], [250, 790], [276, 812]], { w: 10, start: 0.1, end: 0, peak: 0.4 }))}" fill="#fff" opacity="${L ? '.3' : '.12'}"/>`
    + `<path d="${M('M118,822Q170,800 236,796Q272,798 300,808L296,822Q266,814 234,814Q176,818 114,846Z')}" fill="${C.silverDeep}" opacity="${L ? '.45' : '.55'}"/>`
    + `<path d="${M('M176,764l10,-3')}" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="${L ? '.9' : '.4'}"/>`;
  if (L) {
    // battle notch: a torn bite in the outer edge, metal curled outward, scorched
    s += `<path d="M110,812L136,820L126,834L146,844L118,858L106,852Z" fill="${C.suit}" stroke="${C.metalLine}" stroke-width="2.4" stroke-linejoin="round"/>`
      + `<path d="M136,820L126,834L146,844" fill="none" stroke="${C.silverLit}" stroke-width="2.2" stroke-linejoin="round"/>`
      + `<path d="M136,820l7,-7M146,844l10,-1" stroke="${C.silverLit}" stroke-width="2" stroke-linecap="round"/>`
      + `<path d="M124,800Q150,802 160,824Q156,846 168,862Q140,864 120,858Z" fill="#2a120c" opacity=".28"/>`
      + `<path d="M176,796l14,6M200,820l10,-6" stroke="${C.silverDeep}" stroke-width="1.6" stroke-linecap="round"/>`;
  }
  return s;
}

function crystal(p) {
  const t = '416,772', r = '438,810', b = '416,858', l = '394,810', m = '416,810';
  return `<g>`
    + `<circle cx="416" cy="812" r="30" fill="#ffb347" opacity=".4" filter="${p.refs.glow}"/>`
    + `<path d="M416,760L448,810L416,868L384,810Z" fill="${C.goldDeep}" stroke="${C.goldLine}" stroke-width="2.4" stroke-linejoin="round"/>`
    + `<path d="M416,760L448,810L416,868L384,810Z" fill="none" stroke="${C.gold}" stroke-width="1.4" opacity=".6" transform="translate(0 1)"/>`
    + `<path d="M${t}L${l}L${m}Z" fill="#fff3cf"/><path d="M${t}L${r}L${m}Z" fill="${C.gold}"/>`
    + `<path d="M${l}L${b}L${m}Z" fill="#f2b462"/><path d="M${r}L${b}L${m}Z" fill="#b8722e"/>`
    + `<path d="M404,790L414,802L408,816L420,828L414,846" fill="none" stroke="${C.goldLine}" stroke-width="1.6" stroke-linejoin="round"/>`
    + `<path d="M414,802L425,798M408,816L400,822" fill="none" stroke="${C.goldLine}" stroke-width="1.2"/>`
    + `<path d="M401,804L410,786" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ sword "Duanzhang": riveted ring guard, blade raised across the body
function swordHilt(p) {
  const { n } = p.helpers;
  const gx = 316, gy = 1060;
  const ang = (-52 * Math.PI) / 180;
  const ux = Math.cos(ang), uy = Math.sin(ang);
  const vx = -uy, vy = ux;
  const P = (a, b) => `${n(gx + ux * a + vx * b)},${n(gy + uy * a + vy * b)}`;
  const blade = p.lin('blade', [[0, '#f2f3fa'], [0.48, '#c4c8d6'], [0.52, '#8d91a6'], [1, '#5d6078']], [gx + vx * -12, gy + vy * -12, gx + vx * 12, gy + vy * 12]);
  const bladeD = `M${P(24, -12)}L${P(470, -9)}L${P(512, 0)}L${P(470, 9)}L${P(24, 12)}Z`;
  const grip = `M${P(-26, -9)}L${P(-190, -10)}L${P(-190, 10)}L${P(-26, 9)}Z`;
  const wraps = Array.from({ length: 7 }, (_, k) => `M${P(-38 - k * 22, -9)}L${P(-50 - k * 22, 9)}`).join('');
  return `<g stroke-linejoin="round">`
    + `<path d="${bladeD}" fill="${blade}" stroke="${C.metalLine}" stroke-width="2.6"/>`
    + `<path d="M${P(40, 0)}L${P(440, 0)}" stroke="${C.silverDeep}" stroke-width="2.4" opacity=".55"/>`
    + `<path d="M${P(60, -7)}L${P(300, -6)}" stroke="#fff" stroke-width="2" opacity=".7"/>`
    + `<path d="M${P(150, 4)}l6,-3M${P(230, -3)}l5,4" stroke="${C.silverDeep}" stroke-width="1.2" opacity=".8"/>`
    + `<path d="${grip}" fill="#2a1418" stroke="${C.crimsonLine}" stroke-width="2.4"/>`
    + `<path d="${wraps}" stroke="#6a3038" stroke-width="3"/>`
    + `<path d="M${P(-20, -14)}L${P(20, -14)}L${P(20, 14)}L${P(-20, 14)}Z" fill="${C.silverShade}" stroke="${C.metalLine}" stroke-width="2.4"/>`
    // ring guard: two halves riveted back together
    + `<circle cx="${gx}" cy="${gy}" r="34" fill="none" stroke="${C.metalLine}" stroke-width="14"/>`
    + `<circle cx="${gx}" cy="${gy}" r="34" fill="none" stroke="${C.silver}" stroke-width="8.5"/>`
    + `<path d="M${n(gx - 30)},${n(gy - 16)}A34,34 0 0 1 ${n(gx + 14)},${n(gy - 31)}" fill="none" stroke="${C.silverLit}" stroke-width="3" stroke-linecap="round"/>`
    + `<path d="M${n(gx + 22)},${n(gy + 22)}A34,34 0 0 1 ${n(gx - 8)},${n(gy + 33)}" fill="none" stroke="${C.silverDeep}" stroke-width="3" stroke-linecap="round"/>`
    + [[-32, -10], [30, 14]].map(([dx, dy]) => `<rect x="${gx + dx - 7}" y="${gy + dy - 9}" width="14" height="18" rx="2" fill="${C.silverShade}" stroke="${C.metalLine}" stroke-width="2" transform="rotate(-20 ${gx + dx} ${gy + dy})"/><circle cx="${gx + dx}" cy="${gy + dy - 4}" r="2.6" fill="${C.goldMid}"/><circle cx="${gx + dx}" cy="${gy + dy + 4}" r="2.6" fill="${C.goldMid}"/>`).join('')
    + `</g>`;
}
