// Lilith Valhalla (莉莉丝·瓦尔哈拉) - shadow assassin of the fallen Valhalla house.
// Canon: 设定集/03 section 6. Drawn as an adult (age 19), lithe and modest.
// Signature silhouette: long golden hair tied HIGH, the tail bound with gold rings and flaring
// out to the viewer's right; twin dagger hilts ("Day-Blind" / "Night-Wake") jutting above both
// shoulders from crossed sheaths on her back; hood down behind the neck; short one-sided cape.
// Sharp golden eyes, a confident smirk and a small bandage across the bridge of the nose.
const C = {
  suit: '#18151f', suitLit: '#272231', suitShade: '#100d15', suitDeep: '#09070d', suitLine: '#050408',
  leather: '#3b2b3f', leatherLit: '#66506e', leatherShade: '#231a28', leatherLine: '#09060c',
  gold: '#d9a441', goldLit: '#ffe39a', goldShade: '#9c6c22', goldLine: '#4a300c',
  violet: '#c084fc', violetDeep: '#5b2f8c', violetDark: '#3c2160',
  hood: '#251c33', hoodShade: '#160f20', hoodLit: '#3a2d4c',
  wrap: '#1a1420',
  bandage: '#f4e8d8', bandageShade: '#d9c4ae',
};

export default {
  id: 'lilith',
  name: '莉莉丝·瓦尔哈拉',
  palette: {
    accent: '#c084fc', accent2: '#d9a441',
    hair: '#f6cf58', hairShadow: '#d89c34', hairDeep: '#9c6420', hairHighlight: '#fff6c4', hairLine: '#6a3c10',
    eyeTop: '#7a4708', eyeBottom: '#ffd84e', eyeLine: '#2a1806', lash: '#2a1a10',
    skin: '#f8e2d4', skinShadow: '#e0a9a2', skinDeep: '#c2868a', skinLine: '#985458',
    blush: '#ff8f96', brow: '#8a5a1c',
    bgTop: '#0b0818', bgMid: '#1b1333', bgBottom: '#07050f',
  },
  expression: {
    eyeShape: 'sharp', tilt: 6, lidDrop: 0.28, lowerLid: 0.16, gaze: [-0.3, 0], browAngle: 0.55, browRaise: 0.05, browWeight: 1.05,
    mouth: 'smirk', mouthWidth: 1, browAsym: -0.7, blush: 0.2, lashWeight: 1.15, lashFlick: true, browsOverHair: 0.45,
  },
  face: { jaw: -0.65, width: -2, chin: 4 }, // sharper / angular
  costumeLayers: ['bodyBack', 'neckAccessory', 'foreground'],
  layers: {
    bgMotif,
    hairBack,
    bodyBack: gear,
    outfit: armor,
    faceMarks,
    hairFront,
    headFront: earCuff,
    foreground: wisps,
  },
};

// ------------------------------------------------------------------ background: moonlit rooftops, a bell tower, violet shadow wisps
function bgMotif(p) {
  const { n, smoothQ, taper } = p.helpers;
  const mx = 176, my = 200, mr = 94;
  const moon = p.rad('moon', [[0, '#fbf6ff'], [0.6, '#e8ddff'], [1, '#bba8e6']], { cx: mx - 20, cy: my - 22, r: mr });
  const halo = p.rad('halo', [[0, '#e8ddff', 0.35], [0.4, '#c084fc', 0.12], [1, '#c084fc', 0]], { cx: mx, cy: my, r: 300 });
  // far skyline: gables, chimneys and a bell tower
  const far = 'M-10,900V792L20,792L20,560L38,540L38,470L56,412L74,470L74,540L92,560L92,792L126,742L172,792L196,792L196,724L250,676L304,724L304,800L360,800L392,770L424,800L470,800L470,752L520,710L570,752L570,790L610,790L650,746L690,790L720,790L720,700L742,700L742,790L760,748L800,790L842,790V900Z';
  const near = 'M-10,1000V900L60,900L120,846L180,900L200,900L200,872L222,872L222,900L300,900L300,930L540,930L540,890L620,830L700,890L740,890L740,860L762,860L762,890L842,890V1000Z';
  const windows = [[230, 740], [270, 740], [250, 770], [500, 768], [536, 768], [30, 620], [62, 620], [150, 790], [330, 822], [770, 812], [46, 690], [640, 772]]
    .map(([x, y]) => `M${x},${y}h10v14h-10z`).join('');
  // shadow wisps drifting across the skyline
  const wisp = (pts, w) => taper(pts, { w, start: 0, end: 0, peak: 0.45 });
  const wbg = [wisp([[-20, 640], [120, 600], [240, 640], [330, 610]], 26), wisp([[520, 600], [640, 640], [760, 590], [860, 620]], 22), wisp([[40, 980], [200, 940], [320, 980]], 30), wisp([[560, 960], [700, 920], [860, 950]], 34)].join('');
  const wg = p.lin('wispBg', [[0, '#c084fc', 0], [0.5, '#c084fc', 0.5], [1, '#c084fc', 0]], [0, 0, 832, 0]);
  const haze = p.lin('haze', [[0, '#7a5aa8', 0], [0.55, '#6a4c98', 0.42], [1, '#3a2860', 0.2]], [0, 420, 0, 900]);
  return `<rect width="832" height="1216" fill="${halo}"/>`
    + `<rect y="420" width="832" height="480" fill="${haze}"/>`
    + `<circle cx="${mx}" cy="${my}" r="${mr}" fill="${moon}"/>`
    + `<path d="M${mx - 40},${my - 30}a16,14 0 1 0 1,0zM${mx + 22},${my + 18}a24,20 0 1 0 1,0zM${mx - 10},${my + 40}a10,9 0 1 0 1,0z" fill="#b9a6e0" opacity=".4"/>`
    + `<path d="${far}" fill="#3a2d5e"/>`
    + `<path d="M126,742L172,792M250,676L304,724M392,770L424,800M520,710L570,752M760,748L800,790M56,412L74,470M650,746L690,790" stroke="#7b6aa8" stroke-width="3" opacity=".7"/>`
    + `<path d="${windows}" fill="#ffb38a" opacity=".7"/>`
    + `<circle cx="56" cy="506" r="13" fill="#2a2148" stroke="#7b6aa8" stroke-width="3"/>`
    + `<path d="${wbg}" fill="${wg}"/>`
    + `<path d="${near}" fill="#1a1330"/>`
    + `<path d="M60,900L120,846L180,900M540,890L620,830L700,890" fill="none" stroke="#c084fc" stroke-width="2" opacity=".45"/>`;
}

// ------------------------------------------------------------------ hair (back): high ponytail, bound by a gold ring, flipping over to the viewer's right
function hairBack(p) {
  const { lock, smooth, taper, ribbon, sampleSpline, n } = p.helpers;
  const pal = p.palette;
  const L = (pts, w, o = {}) => lock(pts[0], pts[pts.length - 1], { points: pts, w, ...o });
  // upper tail: springs up out of the tie and arcs over to the gold binding - three bundled locks (not one tube)
  const up = [[474, 198], [494, 160], [536, 142], [588, 150], [630, 186], [660, 248], [678, 330], [688, 424]];
  const wUp = (t) => 66 + 18 * Math.sin(Math.min(1, t * 1.6) * Math.PI * 0.5) - 14 * t;
  const upper = ribbon(up, (t) => [wUp(t) / 2, -wUp(t) / 2], { samples: 16 });
  const offs = (o) => sampleSpline(up, 12).map((q, i, a) => {
    const A = a[Math.max(0, i - 1)], B = a[Math.min(11, i + 1)], dx = B[0] - A[0], dy = B[1] - A[1], m = Math.hypot(dx, dy) || 1;
    const t = i / 11, k = wUp(t) / 84;
    return [q[0] + (dy / m) * o * k, q[1] - (dx / m) * o * k];
  });
  const bundle = [L(offs(-22), 46, { swell: 0.5, start: 0.8 }), L(offs(22), 46, { swell: 0.5, start: 0.8 }), L(offs(0), 44, { swell: 0.45, start: 0.8 })];
  const flyTop = [taper([[548, 120], [580, 104], [612, 108]], { w: 4, start: 0.5, end: 0, peak: 0.2 }), taper([[600, 132], [636, 128], [662, 146]], { w: 3.6, start: 0.5, end: 0, peak: 0.2 }), taper([[682, 300], [700, 330], [706, 362]], { w: 3.6, start: 0.5, end: 0, peak: 0.2 })].join('');
  // below the binding the tail splits into three locks that sweep out to the right (windswept, agile)
  const A = L([[692, 420], [712, 530], [736, 640], [766, 750], [800, 860], [828, 960], [846, 1050]], 50, { swell: 0.25, start: 0.95 });
  const B = L([[686, 422], [698, 540], [714, 660], [736, 780], [760, 890], [780, 990], [792, 1100]], 54, { swell: 0.25, start: 0.95 });
  const Cl = L([[680, 424], [682, 540], [688, 660], [698, 780], [708, 880], [712, 970]], 40, { swell: 0.2, start: 0.95 });
  const fly = [taper([[724, 620], [760, 700], [792, 760], [820, 790]], { w: 5, start: 0.4, end: 0, peak: 0.3 }), taper([[700, 760], [716, 860], [736, 940]], { w: 4, start: 0.4, end: 0, peak: 0.3 })].join('');
  const strands = [[[536, 148], [606, 168], [654, 236], [676, 330]], [[700, 480], [716, 580], [736, 680]], [[694, 560], [704, 680], [722, 800]]]
    .map((q) => taper(q, { w: 2.4, start: 0, end: 0, peak: 0.45 })).join('');
  const hi = taper([[488, 160], [536, 146], [586, 154], [626, 184]], { w: 13, start: 0.1, end: 0, peak: 0.5 })
    + taper([[660, 262], [672, 320], [680, 380]], { w: 8, start: 0.1, end: 0, peak: 0.5 });
  // gold binding over the split: three thin rings
  const c = sampleSpline(up, 30), q = c[28], a = c[27], b = c[29];
  const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1, nx = dy / m, ny = -dx / m, ux = dx / m, uy = dy / m, h = 38;
  const rings = [-8, 0, 8].map((o) => `M${n(q[0] - nx * h + ux * o)},${n(q[1] - ny * h + uy * o)}Q${n(q[0] + ux * (o + 7))},${n(q[1] + uy * (o + 7))} ${n(q[0] + nx * h + ux * o)},${n(q[1] + ny * h + uy * o)}`).join('');
  const backMass = smooth([[470, 190], [380, 180], [316, 206], [272, 256], [254, 330], [258, 420], [300, 410], [330, 300], [400, 240], [470, 222]], { closed: true });
  const S = (k, fill, sw = 2.4, sh = pal.hairShadow) => `<path d="${k.d}" fill="${fill}" stroke="${pal.hairLine}" stroke-width="${sw}"/><path d="${k.shade}" fill="${sh}" opacity=".9"/><path d="${k.line}" fill="${pal.hairLine}" opacity=".4"/>`;
  return `<g stroke-linejoin="round">`
    + `<path d="${backMass}" fill="${pal.hairDeep}"/>`
    + S(Cl, pal.hairShadow, 2.2, pal.hairDeep)
    + S(A, pal.hair, 2.6)
    + S(B, p.lin('tailB', [[0, pal.hair], [1, '#e9b54a']], [0, 420, 0, 1100]), 2.6)
    + `<path d="${A.hi}${B.hi}" fill="${pal.hairHighlight}" opacity=".8"/>`
    + `<path d="${fly}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="1.4"/>`
    + `<path d="${upper}" fill="${pal.hairShadow}" stroke="${pal.hairLine}" stroke-width="3.2"/>`
    + bundle.map((k, i) => S(k, i === 1 ? pal.hairShadow : pal.hair, 2, i === 1 ? pal.hairDeep : pal.hairShadow)).join('')
    + `<path d="${bundle[0].hi}${bundle[2].hi}" fill="${pal.hairHighlight}" opacity=".85"/>`
    + `<path d="${flyTop}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="1.2"/>`
    + `<path d="${strands}" fill="${pal.hairLine}" opacity=".4"/>`
    + `<path d="${hi}" fill="${pal.hairHighlight}" opacity=".85"/>`
    + `<path d="${rings}" fill="none" stroke="${C.goldLine}" stroke-width="6.5" stroke-linecap="round"/>`
    + `<path d="${rings}" fill="none" stroke="${C.gold}" stroke-width="3.6" stroke-linecap="round"/>`
    // the tie at the top of the head: black cloth wrap under a gold ring
    + `<path d="${smooth([[454, 204], [462, 176], [488, 166], [506, 180], [502, 206], [476, 216]], { closed: true })}" fill="${C.wrap}" stroke="${C.goldLine}" stroke-width="2.2"/>`
    + `<path d="M460,198Q478,174 504,186" fill="none" stroke="${C.goldLine}" stroke-width="7" stroke-linecap="round"/><path d="M460,198Q478,174 504,186" fill="none" stroke="${C.gold}" stroke-width="4" stroke-linecap="round"/><path d="M464,192Q478,176 498,182" fill="none" stroke="${C.goldLit}" stroke-width="1.4"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ hair (front): hair pulled up to the tie, choppy side-swept bangs, two long sidelocks
function hairFront(p) {
  const { smooth, taper, lock } = p.helpers;
  const pal = p.palette;
  const domeG = p.lin('dome', [[0, '#ffd970'], [0.5, pal.hair], [1, pal.hairShadow]], [300, 180, 540, 400]);
  const dome = smooth([[258, 420], [252, 352], [260, 292], [282, 242], [320, 206], [372, 186], [432, 180], [490, 190], [536, 214], [566, 254], [580, 306], [582, 366], [574, 420],
    [556, 360], [512, 304], [430, 282], [346, 298], [282, 360]], { closed: true });
  const domeShade = smooth([[580, 306], [582, 366], [574, 420], [556, 360], [522, 314], [546, 290], [566, 280]], { closed: true });
  // combed-back strands converging on the tie (upper right)
  const comb = [[[270, 330], [300, 260], [370, 206], [448, 184]], [[300, 300], [350, 236], [416, 200], [456, 188]], [[560, 300], [540, 240], [500, 204], [466, 190]], [[530, 290], [500, 236], [470, 200]]]
    .map((s) => taper(s, { w: 2.6, start: 0.1, end: 0, peak: 0.5 })).join('');
  const ring = smooth([[264, 320, 1], [286, 268], [326, 228], [384, 204], [430, 198], [462, 202, 1], [452, 214, 1], [436, 210, 1], [418, 228, 1], [398, 220, 1], [374, 244, 1], [356, 238, 1], [334, 262, 1], [316, 258, 1], [296, 290, 1], [284, 286, 1]], { closed: true });
  const P = (pts, w, o = {}) => ({ root: pts[0], tip: pts[pts.length - 1], points: pts, w, swell: 0.4, start: 0.25, ...o });
  // long sidelocks framing the face, in front of the ears
  const sideL = P([[284, 300], [260, 400], [250, 500], [254, 600], [272, 684]], 44, { swell: 0.3, curl: -8 });
  const sideL2 = P([[296, 330], [282, 430], [280, 520], [290, 590]], 22);
  const sideR = P([[550, 300], [570, 400], [578, 490], [574, 570], [562, 620]], 38, { swell: 0.3, curl: 6 });
  // choppy bangs swept to the viewer's left, tips at brow height, a few strands crossing between the eyes
  const bangsBack = [
    P([[372, 222], [326, 266], [298, 326], [288, 396]], 46, { swell: 0.45, start: 0.05 }),
    P([[440, 218], [500, 252], [538, 306], [552, 372], [552, 430]], 50, { swell: 0.45, start: 0.05 }),
  ];
  const bangs = [
    P([[388, 220], [346, 262], [318, 318], [302, 386]], 50, { swell: 0.42, curl: -10 }),
    P([[404, 222], [380, 276], [360, 332], [348, 396]], 40, { swell: 0.42, curl: -8 }),
    P([[418, 222], [408, 286], [398, 350], [390, 428]], 34, { swell: 0.42, curl: -4 }),
    P([[430, 222], [444, 282], [448, 340], [444, 402]], 40, { swell: 0.42 }),
    P([[446, 222], [480, 264], [500, 320], [506, 386]], 42, { swell: 0.42, curl: 4 }),
    P([[462, 220], [510, 254], [538, 306], [550, 372]], 40, { swell: 0.42, curl: 6 }),
  ];
  const H = p.helpers.locks;
  const style = { fill: pal.hair, shade: pal.hairShadow, line: pal.hairLine, stroke: pal.hairLine, highlight: pal.hairHighlight, strokeWidth: 2, lineOpacity: 0.35, shadeOpacity: 0.85 };
  const bangDs = bangs.map((b) => lock(b.root, b.tip, b).d);
  const bangClip = p.clip('bangClip', bangDs);
  const rootShade = p.lin('bangRoot', [[0, pal.hairDeep, 0.6], [1, pal.hairDeep, 0]], [0, 216, 0, 280]);
  const wisps = [
    taper([[300, 360], [290, 440], [296, 510], [310, 560]], { w: 4, start: 0.1, end: 0, peak: 0.25 }),
    taper([[426, 240], [412, 330], [404, 420], [408, 466]], { w: 6, start: 0.4, end: 0, peak: 0.3 }),
    taper([[540, 360], [552, 430], [548, 490]], { w: 4, start: 0.1, end: 0, peak: 0.25 }),
  ].join('');
  return `<g stroke-linejoin="round">`
    + H([sideL, sideR].map((b) => ({ ...b, hi: [0.2, 0.36] })), { ...style, hi: true })
    + `<path d="${dome}" fill="${domeG}" stroke="${pal.hairLine}" stroke-width="3.4"/>`
    + `<path d="${domeShade}" fill="${pal.hairShadow}" opacity=".8"/>`
    + `<path d="${comb}" fill="${pal.hairLine}" opacity=".45"/>`
    + `<path d="${ring}" fill="${pal.hairHighlight}" opacity=".85"/>`
    + H([sideL2], { ...style, fill: pal.hairShadow, shade: pal.hairDeep })
    + H(bangsBack.map((b) => ({ ...b, noLine: true })), { ...style, fill: pal.hairShadow, shade: pal.hairDeep })
    + H(bangs.map((b) => ({ ...b, hi: [0.3, 0.52] })), { ...style, hi: true, hiOpacity: 0.85 })
    + `<g clip-path="${bangClip}"><rect x="250" y="200" width="340" height="80" fill="${rootShade}"/>`
    // angel ring: one sheen band following the curve of the head, teeth on its lower edge
    + `<path d="${smooth([[262, 356, 1], [286, 298], [330, 258], [392, 236], [462, 232], [522, 242], [570, 272, 1], [560, 286, 1], [546, 272, 1], [530, 282, 1], [514, 262, 1], [496, 272, 1], [478, 254, 1], [458, 266, 1], [438, 252, 1], [418, 266, 1], [398, 256, 1], [376, 276, 1], [358, 270, 1], [338, 294, 1], [322, 290, 1], [302, 322, 1], [290, 318, 1], [276, 356, 1]], { closed: true })}" fill="#fff6c4" opacity=".7"/></g>`
    + `<path d="${wisps}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="1.2"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ face mark: a small bandage across the bridge of the nose
function faceMarks(p) {
  const pal = p.palette;
  const t = 'rotate(-7 418 474)';
  return `<g transform="${t}">`
    + `<rect x="392" y="467" width="54" height="16" rx="6" fill="${C.bandage}" stroke="${pal.skinLine}" stroke-width="1.8"/>`
    + `<rect x="408" y="469" width="22" height="12" rx="2" fill="${C.bandageShade}" opacity=".7"/>`
    + `<path d="M396,479Q418,484 442,479" fill="none" stroke="${C.bandageShade}" stroke-width="2"/>`
    + `<path d="M397,471H405M432,471H440" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ gold ear cuff on the left ear (viewer's right)
function earCuff(p) {
  return `<path d="M580,428Q590,436 588,452" fill="none" stroke="${C.goldLine}" stroke-width="6" stroke-linecap="round"/>`
    + `<path d="M580,428Q590,436 588,452" fill="none" stroke="${C.gold}" stroke-width="3.4" stroke-linecap="round"/>`
    + `<circle cx="584" cy="476" r="4" fill="${C.violet}" stroke="${C.goldLine}" stroke-width="1.4"/>`;
}

// ------------------------------------------------------------------ gear behind the body: one-sided cape, crossed dagger sheaths, the hood down behind the neck
function hilt(p, side) {
  const { n } = p.helpers;
  const R = side === 'R';
  // axis from the crossguard upward to the pommel, angled outward
  const gx = R ? 606 : 226, gy = 746, ang = ((R ? 24 : -24) * Math.PI) / 180, k = 1.18;
  const ux = Math.sin(ang), uy = -Math.cos(ang), vx = -uy, vy = ux;
  const P = (t, s) => `${n(gx + (ux * t + vx * s) * k)},${n(gy + (uy * t + vy * s) * k)}`;
  const gem = R ? C.violet : C.goldLit;
  const wraps = Array.from({ length: 6 }, (_, k) => `M${P(20 + k * 15, -10)}L${P(31 + k * 15, 10)}`).join('');
  const pm = P(124, 0).split(',');
  return `<g stroke-linejoin="round">`
    // sheath throat below the guard
    + `<path d="M${P(-60, -18)}L${P(-4, -17)}L${P(-4, 17)}L${P(-60, 18)}Z" fill="${C.leather}" stroke="${C.leatherLine}" stroke-width="2.6"/>`
    + `<path d="M${P(-26, -17)}L${P(-26, 17)}" stroke="${C.gold}" stroke-width="4"/>`
    // grip
    + `<path d="M${P(8, -10)}L${P(110, -9)}L${P(110, 9)}L${P(8, 10)}Z" fill="#2a1e2c" stroke="${C.leatherLine}" stroke-width="2.6"/>`
    + `<path d="${wraps}" stroke="${C.goldShade}" stroke-width="3.4"/>`
    + `<path d="M${P(12, -6)}L${P(106, -5)}" stroke="#6a5470" stroke-width="2" opacity=".8"/>`
    // crossguard: a swept bar with curled tips
    + `<path d="M${P(8, -44)}Q${P(-8, -26)} ${P(0, 0)}Q${P(-8, 26)} ${P(8, 44)}L${P(18, 38)}Q${P(8, 18)} ${P(12, 0)}Q${P(8, -18)} ${P(18, -38)}Z" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="2.4"/>`
    + `<path d="M${P(8, -38)}Q${P(-2, -22)} ${P(4, -4)}" fill="none" stroke="${C.goldLit}" stroke-width="2"/>`
    // pommel with the gem (sun-gold on Day-Blind, violet on Night-Wake)
    + `<path d="M${P(106, -15)}L${P(122, -18)}L${P(140, 0)}L${P(122, 18)}L${P(106, 15)}Z" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="2.4"/>`
    + `<circle cx="${pm[0]}" cy="${pm[1]}" r="9" fill="${gem}" stroke="${C.goldLine}" stroke-width="1.6"/><circle cx="${n(Number(pm[0]) - 2.5)}" cy="${n(Number(pm[1]) - 2.5)}" r="2.2" fill="#fff" opacity=".85"/>`
    + `</g>`;
}
function gear(p) {
  const { smooth, taper } = p.helpers;
  // cape on the viewer's left shoulder only, falling behind the arm to a cut, pointed hem
  const capeG = p.lin('cape', [[0, '#2c2238'], [1, '#120d1a']], [0, 760, 0, 1216]);
  const cape = smooth([[226, 752], [170, 776], [124, 840], [94, 940], [74, 1060], [60, 1216, 1], [96, 1216, 1], [104, 1150, 1], [122, 1196, 1], [128, 1216, 1], [150, 1216, 1]], { closed: true });
  const lining = smooth([[124, 880], [98, 980], [80, 1100], [70, 1216, 1], [94, 1216, 1], [102, 1150, 1], [96, 1060], [110, 960]], { closed: true });
  // hood down: soft folded cowl visible above the shoulders behind the neck
  const hood = smooth([[284, 770], [288, 696], [310, 644], [352, 612], [416, 600], [480, 612], [522, 644], [544, 696], [548, 770]], { closed: true });
  const hoodRim = 'M298,708Q322,640 416,624Q510,640 534,708';
  return `<g stroke-linejoin="round">`
    + `<path d="${cape}" fill="${capeG}" stroke="${C.suitLine}" stroke-width="3"/>`
    + `<path d="${lining}" fill="${C.violetDark}"/>`
    + `<path d="M60,1216L96,1216L104,1150L122,1196L128,1216" fill="none" stroke="${C.gold}" stroke-width="2.4"/>`
    + `<path d="${taper([[160, 800], [124, 880], [104, 980]], { w: 8, start: 0.2, end: 0, peak: 0.4 })}" fill="${C.hoodLit}" opacity=".9"/>`
    + hilt(p, 'L') + hilt(p, 'R')
    + `<path d="${hood}" fill="${p.lin('hood', [[0, C.hoodLit], [0.5, C.hood], [1, C.hoodShade]], [290, 0, 546, 0])}" stroke="${C.suitLine}" stroke-width="3"/>`
    + `<path d="${hoodRim}" fill="none" stroke="${C.violetDark}" stroke-width="10"/><path d="${hoodRim}" fill="none" stroke="${C.gold}" stroke-width="2"/>`
    + `<path d="M316,690Q330,716 324,748M346,660Q350,690 344,720M516,690Q502,716 508,748M486,660Q482,690 488,720" fill="none" stroke="${C.hoodShade}" stroke-width="3"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ armour: black bodysuit, leather cuirass with gold piping, baldric, one pauldron
function armor(p) {
  const { smooth, taper, mirrorPath, n } = p.helpers;
  const suit = p.lin('suit', [[0, C.suitLit], [0.4, C.suit], [1, C.suitShade]], [0, 640, 0, 1100]);
  let s = `<g clip-path="${p.refs.bodyClip}"><rect y="680" width="832" height="540" fill="${suit}"/>`
    + `<path d="M560,780L700,800L702,1216H560Z" fill="${C.suitShade}" opacity=".7"/>`
    + `<path d="${p.shapes.armSeamL}${p.shapes.armSeamR}" fill="none" stroke="${C.suitLine}" stroke-width="3"/>`
    + `<path d="${taper([[150, 880], [140, 980], [136, 1100]], { w: 10, start: 0.2, end: 0, peak: 0.3 })}" fill="${C.suitLit}"/>`
    + `<path d="M150,1010Q190,1024 234,1012M598,1012Q642,1024 684,1010" fill="none" stroke="${C.gold}" stroke-width="5"/>`
    + `<path d="M150,1024Q190,1038 234,1026M598,1026Q642,1038 684,1024" fill="none" stroke="${C.goldShade}" stroke-width="2"/>`
    + `</g>`;
  // high collar with gold top trim and a front seam
  const collar = smooth([[360, 626, 1], [388, 638], [416, 642], [444, 638], [472, 626, 1], [480, 712, 1], [416, 726], [352, 712, 1]], { closed: true });
  s += `<path d="${collar}" fill="${p.lin('collar', [[0, '#3a3046'], [0.5, C.suit], [1, C.suitDeep]], [360, 0, 480, 0])}" stroke="${C.suitLine}" stroke-width="3"/>`
    + `<path d="M440,639L472,626L480,712L452,720Z" fill="${C.suitDeep}" opacity=".6"/>`
    + `<path d="M362,632Q416,654 470,632" fill="none" stroke="${C.gold}" stroke-width="3.2"/>`
    + `<path d="M416,644V724" stroke="${C.suitLine}" stroke-width="2.4"/><path d="M413,650V716" stroke="${C.goldShade}" stroke-width="1.4" stroke-dasharray="3 4"/>`;
  // leather cuirass: two halves, gold piping, lower lames
  const half = smooth([[416, 744, 1], [372, 746], [328, 758], [300, 786], [290, 850], [294, 930], [306, 1010], [318, 1100], [322, 1216, 1], [416, 1216, 1]], { closed: true });
  const lg = p.lin('leatherL', [[0, C.leatherLit], [0.4, C.leather], [1, C.leatherShade]], [300, 740, 420, 1150]);
  const rg = p.lin('leatherR', [[0, C.leather], [0.5, C.leatherShade], [1, '#0e0b12']], [420, 760, 540, 1100]);
  s += `<path d="${half}" fill="${lg}" stroke="${C.leatherLine}" stroke-width="3"/><path d="${mirrorPath(half)}" fill="${rg}" stroke="${C.leatherLine}" stroke-width="3"/>`;
  const piping = smooth([[408, 754], [372, 756], [334, 768], [310, 794], [302, 850], [306, 930], [318, 1010], [330, 1100], [334, 1216]]);
  s += `<path d="${piping}${mirrorPath(piping)}" fill="none" stroke="${C.gold}" stroke-width="2.6"/>`
    + `<path d="M416,750V1216" stroke="${C.leatherLine}" stroke-width="3"/><path d="M412,752V1216" stroke="${C.gold}" stroke-width="1.6" opacity=".8"/>`
    + `<path d="M316,1050Q416,1084 516,1050M322,1120Q416,1154 510,1120" fill="none" stroke="${C.leatherLine}" stroke-width="3"/>`
    + `<path d="M318,1058Q416,1092 514,1058" fill="none" stroke="${C.goldShade}" stroke-width="1.6"/>`
    + `<path d="${taper([[350, 776], [328, 860], [326, 960], [334, 1040]], { w: 18, start: 0.1, end: 0, peak: 0.35 })}" fill="#fff" opacity=".16"/>`
    + `<path d="${taper([[308, 800], [300, 880], [306, 980]], { w: 5, start: 0.2, end: 0, peak: 0.3 })}" fill="${C.leatherLit}"/>`
    // house sigil on the sternum: a gold crescent cradling a dagger, violet gem
    + `<path d="M431.4,787.6A24,24 0 1 0 436.8,818A18.5,18.5 0 1 1 431.4,787.6Z" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="2"/>`
    + `<path d="M416,778L421,800L418,836L416,846L414,836L411,800Z" fill="#e8e6f2" stroke="${C.goldLine}" stroke-width="1.6"/><path d="M404,800H428" stroke="${C.goldLine}" stroke-width="5" stroke-linecap="round"/><path d="M404,800H428" stroke="${C.gold}" stroke-width="2.6" stroke-linecap="round"/>`
    + `<circle cx="416" cy="776" r="4.6" fill="${C.violet}" stroke="${C.goldLine}" stroke-width="1.4"/>`;
  // baldric: diagonal strap from the viewer's-left shoulder to the opposite hip, gold studs and a buckle
  const strap = 'M262,750L300,744L570,1216L524,1216Z';
  s += `<path d="${strap}" fill="#2f2328" stroke="${C.leatherLine}" stroke-width="2.6"/>`
    + `<path d="M266,756L530,1216M296,750L564,1216" stroke="${C.goldShade}" stroke-width="1.8"/>`
    + [[318, 840], [366, 922], [462, 1088]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="1.2"/>`).join('')
    + `<g transform="rotate(30 412 1004)"><rect x="390" y="984" width="44" height="40" rx="5" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="2.4"/><rect x="399" y="993" width="26" height="22" rx="3" fill="#2f2328" stroke="${C.goldLine}" stroke-width="1.6"/><path d="M393,988H428" stroke="${C.goldLit}" stroke-width="2"/></g>`;
  // pauldron on the viewer's-left shoulder: three black leather lames edged in gold
  const lame = (dy, w) => smooth([[300, 764 + dy], [250, 748 + dy], [196, 752 + dy], [154, 780 + dy], [130, 828 + dy, 1], [180, 820 + dy], [232, 812 + dy], [286, 800 + dy, 1]], { closed: true });
  for (const [dy, f] of [[48, C.leatherShade], [24, C.leather], [0, null]]) {
    s += `<path d="${lame(dy)}" fill="${f || p.lin('pauld', [[0, C.leatherLit], [1, C.leather]], [150, 750, 300, 820])}" stroke="${C.leatherLine}" stroke-width="2.8"/>`
      + `<path d="M${n(132)},${n(824 + dy)}Q182,814 284,${n(798 + dy)}" fill="none" stroke="${C.gold}" stroke-width="2.6"/>`;
  }
  s += `<path d="M164,772Q206,754 262,756" fill="none" stroke="#8a7494" stroke-width="3.4" stroke-linecap="round"/>`
    + `<path d="M150,800Q170,780 196,770" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".5"/>`
    + `<circle cx="214" cy="782" r="7" fill="${C.violet}" stroke="${C.goldLine}" stroke-width="2"/><circle cx="212" cy="780" r="2.2" fill="#fff" opacity=".8"/>`;
  return s;
}

// ------------------------------------------------------------------ foreground: violet shadow wisps curling up around her
function wisps(p) {
  const { taper } = p.helpers;
  const g = p.lin('wispFg', [[0, '#b468f6', 0], [0.35, '#b468f6', 0.75], [1, '#e9d5ff', 0.15]], [0, 1216, 0, 860]);
  const w = (pts, wd) => taper(pts, { w: wd, start: 0, end: 0, peak: 0.4 });
  const d = [
    w([[30, 1230], [86, 1150], [56, 1070], [104, 1000], [170, 980], [196, 1010]], 34),
    w([[150, 1230], [176, 1160], [140, 1100], [176, 1050]], 18),
    w([[810, 1230], [754, 1140], [792, 1060], [742, 990], [676, 976], [654, 1004]], 36),
    w([[690, 1230], [662, 1160], [696, 1100], [664, 1060]], 16),
  ].join('');
  const core = [w([[60, 1180], [76, 1120], [64, 1070], [100, 1020], [150, 1000]], 6), w([[780, 1180], [762, 1120], [780, 1070], [740, 1012], [690, 996]], 6)].join('');
  const sparks = [[110, 940], [196, 980], [720, 930], [646, 980], [640, 1090], [170, 1100]].map(([x, y]) => `M${x},${y}h0`).join('');
  return `<path d="${d}" fill="${g}"/><path d="${core}" fill="#e9d5ff" opacity=".55"/>`
    + `<path d="${sparks}" stroke="#f1e4ff" stroke-width="5" stroke-linecap="round" opacity=".85"/>`;
}
