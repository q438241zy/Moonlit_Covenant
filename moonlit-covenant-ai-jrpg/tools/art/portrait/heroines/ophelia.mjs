// Ophelia Shinord - dragon-clan saint (土律). Canon: 设定集/03 §8. Adult (age-appearance 23), drawn modest.
// Signature silhouette: a wild, flaring copper-red mane, two small swept dragon horns at the
// temples (deep scale-blue fading to silver-violet), heterochromia (gold / violet, slit pupils) and a
// playful grin with one small fang. Ancient priestess vestment: ivory stand collar and tabard, a
// deep-blue dragon-scale gorget and pauldrons gripped by silver dragon claws, a claw brooch holding a
// pink dragon-heart gem. Background: volcanic dragon ruins with drifting embers.
const C = {
  scale: '#1f3a7a', scaleLit: '#3e66ba', scaleShade: '#152a5c', scaleDeep: '#0c1a3e', scaleLine: '#070d26', scaleHi: '#9cbcf6',
  silver: '#c6cbe0', silverLit: '#f3f4fb', silverShade: '#868ca8', silverDeep: '#535978', silverLine: '#1b1a2e',
  robe: '#1c2350', robeLit: '#2c3670', robeShade: '#11163a', robeLine: '#080b22',
  ivory: '#ece2d6', ivoryShade: '#c2b0b0', ivoryLine: '#4a3446',
  copper: '#c8643c', copperLit: '#f0a070',
  pink: '#f472b6', pinkLit: '#ffd0e8', pinkDeep: '#9c2c6e', pinkLine: '#4a0f32',
  hornBase: '#1f2c64', hornMid: '#6874bc', hornTip: '#f1edff', hornLine: '#110e28',
  stone: '#211936', stoneLit: '#3b2f58', stoneLine: '#0e0a1c',
};

export default {
  id: 'ophelia',
  name: '奥菲利亚·使诺德',
  palette: {
    accent: '#f472b6', accent2: '#c8643c',
    hair: '#c9562e', hairShadow: '#86291d', hairDeep: '#4c1413', hairHighlight: '#ffaa70', hairLine: '#360d09',
    eyeTop: '#7a3c06', eyeBottom: '#ffcf4a', eyeLine: '#2a110c',
    eyeTopR: '#3b1b70', eyeBottomR: '#cda6ff',
    skin: '#f8e1d3', skinShadow: '#e3a9a2', skinDeep: '#c4868a', skinLine: '#985456',
    brow: '#6a2414', lip: '#d87a80',
    bgTop: '#0d0a1c', bgMid: '#1d1230', bgBottom: '#080614',
  },
  expression: {
    eyeShape: 'almond', tilt: 5, lowerLid: 0.5, open: 0.97, gaze: [-0.4, 0.05], pupil: 'slit',
    browAngle: -0.2, browRaise: 0.3, browAsym: 0.6, mouth: 'grin', mouthWidth: 0.95, blush: 0.42, lashFlick: true,
  },
  face: { jaw: -0.7, width: -2, chin: 2 }, // sharper, playful (tilted eyes + one raised brow)
  costumeLayers: ['bodyBack', 'neckAccessory'],
  layers: {
    bgMotif,
    hairBack,
    outfit: vestment,
    neckAccessory: brooch,
    faceMarks: fang,
    headBack: horns,
    hairFront,
  },
};

// ------------------------------------------------------------------ light-weight lock (fewer samples than base lock())
function lk(p, c, w, { swell = 0.38, start = 0.3, shadeW = 0.5, hi = null, samples } = {}) {
  const { ribbon, profile, pathLength, clamp, sampleSpline } = p.helpers;
  const sm = samples || clamp(Math.round(pathLength(c) / 26), 5, 10);
  const wf = profile({ w, start, end: 0, peak: swell });
  const d = ribbon(c, (t) => [wf(t) / 2, -wf(t) / 2], { samples: sm });
  const mid = sampleSpline(c, 5);
  const ddx = mid[3][0] - mid[1][0], ddy = mid[3][1] - mid[1][1];
  let s = ddy >= 0 ? 1 : -1;
  if (Math.abs(ddy) < Math.abs(ddx) * 0.35) s = ddx >= 0 ? -1 : 1;
  const shade = ribbon(c, (t) => {
    const hw = wf(t) / 2;
    return s > 0 ? [hw, hw * (1 - shadeW * 2)] : [-hw * (1 - shadeW * 2), -hw];
  }, { samples: sm });
  let hiD = '';
  if (hi) {
    const sub = sampleSpline(c, 20).filter((_, i, a) => i / (a.length - 1) >= hi[0] && i / (a.length - 1) <= hi[1]);
    const span = hi[1] - hi[0];
    hiD = ribbon(sub, (t) => {
      const hw = wf(hi[0] + t * span) / 2, k = Math.sin(t * Math.PI) ** 1.3;
      return s > 0 ? [-hw * 0.12, -hw * (0.12 + 0.42 * k)] : [hw * (0.12 + 0.42 * k), hw * 0.12];
    }, { samples: 5 });
  }
  return { d, shade, hi: hiD };
}
// draw a list of [points, width, opts] locks back to front
function drawLocks(p, list, { fill, shade, stroke, sw = 2.2, hiFill, shadeOp = 0.85, hiOp = 0.8 }) {
  let s = '';
  for (const [c, w, o = {}] of list) {
    const k = lk(p, c, w, o);
    s += `<path d="${k.d}" fill="${o.fill || fill}" stroke="${stroke}" stroke-width="${sw}"/><path d="${k.shade}" fill="${o.shadeFill || shade}" opacity="${shadeOp}"/>`;
    if (k.hi) s += `<path d="${k.hi}" fill="${hiFill}" opacity="${hiOp}"/>`;
  }
  return s;
}

// ------------------------------------------------------------------ background: volcanic dragon ruins + embers
function bgMotif(p) {
  const { n, rng, smooth, smoothQ } = p.helpers;
  const sky = p.rad('lavaSky', [[0, '#c8643c', 0.4], [0.4, '#a03a5a', 0.15], [1, '#a03a5a', 0]], { cx: 750, cy: 330, r: 400 });
  const crater = p.rad('crater', [[0, '#ffe0b0'], [0.4, '#ff8a4a'], [1, '#c8643c', 0]], { cx: 758, cy: 322, r: 50 });
  const volcano = 'M560,760L640,520Q690,400 718,336Q730,322 744,326L768,320Q784,324 796,342Q814,380 832,420V760Z';
  const volcFill = p.lin('volc', [[0, '#2e1834'], [1, '#150c22']], [0, 320, 0, 760]);
  const lava = 'M748,332Q738,390 720,438Q708,472 690,510M770,332Q780,376 796,416Q806,444 820,486';
  // one billowing plume drifting up and to the left
  const plume = smoothQ([[756, 318, 1], [726, 300], [706, 268], [666, 250], [658, 212], [626, 186], [632, 146], [594, 118], [606, 78], [566, 48], [586, 6], [540, -10, 1],
    [720, -10, 1], [712, 30], [690, 60], [712, 96], [688, 130], [716, 160], [696, 200], [734, 226], [722, 264], [770, 286], [782, 318, 1]], { closed: true });
  const plumeLit = smoothQ([[756, 318, 1], [730, 302], [712, 274], [684, 262], [706, 250], [736, 266], [766, 284], [782, 318, 1]], { closed: true });
  // ruined colonnade: a broken arch springing from the left pillar, a stump on the right, far ruins on the horizon
  const pillarL = 'M22,1216V300L36,286L48,296L60,270L76,282L96,276V1216Z';
  const arch = 'M40,288Q90,170 200,112L216,138Q114,196 74,296Z';
  const archBreak = 'M200,112L214,104L222,118L232,112L216,138Z';
  const pillarR = 'M748,1216V560L762,548L776,562L790,540L812,552V1216Z';
  const far = 'M96,700V560L110,552V700M140,700V600L156,590L166,606V700M190,700V632H214V700M96,640H170';
  const joints = 'M22,420H96M22,560H96M22,700H96M22,840H96M748,700H812M748,840H812';
  const rand = rng('ophelia-embers');
  let embers = '', cores = '';
  for (let i = 0; i < 32; i++) {
    const x = 18 + rand() * 796, y = 180 + rand() * 980;
    const len = 4 + rand() * 12, r = 1.3 + rand() * (y > 760 ? 3.2 : 2.2);
    embers += `M${n(x)},${n(y)}q${n(len * 0.5)},${n(-len * 0.4)} ${n(len * 0.2)},${n(-len)}`;
    if (rand() > 0.5) cores += `M${n(x)},${n(y)}h0`;
    if (i === 15) embers += '"/><path stroke-width="3.4" d="';
  }
  return `<rect width="832" height="1216" fill="${sky}"/>`
    + `<path d="${plume}" fill="#1b1026" opacity=".7"/><path d="${plumeLit}" fill="#c8643c" opacity=".22"/>`
    + `<path d="${far}" fill="none" stroke="#2a2044" stroke-width="10" opacity=".7"/>`
    + `<path d="${volcano}" fill="${volcFill}"/>`
    + `<path d="M718,336Q730,322 744,326L768,320Q784,324 796,342L780,352Q758,342 734,352Z" fill="${crater}"/>`
    + `<path d="${lava}" fill="none" stroke="#ff8a4a" stroke-width="3" stroke-linecap="round" opacity=".5"/>`
    + `<path d="${lava}" fill="none" stroke="#ffd2a0" stroke-width="1.2" stroke-linecap="round" opacity=".45"/>`
    + `<g fill="${C.stone}" stroke="${C.stoneLine}" stroke-width="3" stroke-linejoin="round"><path d="${arch}"/><path d="${archBreak}"/><path d="${pillarL}"/><path d="M10,330H108V352H10Z"/><path d="${pillarR}"/><path d="M738,600H822V618H738Z"/></g>`
    + `<path d="M44,292Q92,180 198,118M24,300V1216M750,566V1216M12,332H106" fill="none" stroke="${C.stoneLit}" stroke-width="2.2" opacity=".7"/>`
    + `<path d="${joints}" stroke="${C.stoneLine}" stroke-width="2" opacity=".7"/>`
    + `<path d="M94,290V1216M810,556V1216M214,136Q118,196 76,294" fill="none" stroke="#c8643c" stroke-width="2.4" opacity=".4"/>`
    + `<g stroke="#ff9a5a" stroke-linecap="round" fill="none" opacity=".8" filter="${p.refs.glow}"><path stroke-width="2" d="${embers}"/></g>`
    + `<path d="${cores}" stroke="#ffe0c0" stroke-width="2" stroke-linecap="round"/>`;
}

// ------------------------------------------------------------------ hair (back): one jagged mane silhouette + layer locks ending in its flicks
function hairBack(p) {
  const { smoothQ, taper } = p.helpers;
  const pal = p.palette;
  const L = [[350, 158], [292, 172], [244, 204], [214, 250], [202, 300], [150, 352, 1], [196, 348], [188, 400], [116, 474, 1], [172, 462], [166, 520], [128, 560],
    [70, 592, 1], [140, 600], [140, 660], [50, 762, 1], [110, 730], [104, 810], [30, 904, 1], [86, 880], [80, 960], [44, 1066, 1], [80, 1030], [72, 1130], [66, 1216, 1]];
  const R = [[482, 158], [540, 172], [590, 206], [620, 252], [634, 300], [690, 336, 1], [640, 354], [650, 410], [700, 448], [734, 506, 1], [666, 482], [670, 546],
    [774, 636, 1], [700, 610], [702, 680], [782, 800, 1], [726, 770], [730, 850], [806, 956, 1], [748, 924], [756, 1000], [786, 1112, 1], [756, 1080], [762, 1160], [768, 1216, 1]];
  const mane = smoothQ([[416, 160, 1], ...L, ...R.reverse()], { closed: true });
  const grad = p.lin('maneGrad', [[0, pal.hairShadow], [0.55, pal.hairDeep], [1, '#3a110e']], [0, 300, 0, 1216]);
  const back = [
    [[[240, 800], [200, 900], [150, 990], [96, 1046], [46, 1064]], 60],
    [[[252, 640], [214, 740], [160, 830], [96, 890], [32, 904]], 66],
    [[[586, 800], [628, 900], [690, 990], [744, 1080], [786, 1110]], 60],
    [[[580, 640], [620, 740], [680, 860], [740, 930], [804, 956]], 66],
  ];
  const front = [
    [[[262, 470], [228, 580], [178, 680], [116, 740], [52, 762]], 64, { hi: [0.15, 0.32] }],
    [[[572, 470], [606, 580], [650, 690], [710, 770], [780, 800]], 64, { hi: [0.15, 0.32] }],
    [[[270, 360], [236, 450], [204, 520], [148, 570], [72, 592]], 60, { hi: [0.15, 0.35] }],
    [[[566, 360], [600, 450], [624, 520], [690, 600], [772, 636]], 62, { hi: [0.15, 0.35] }],
    [[[290, 260], [246, 330], [222, 390], [178, 440], [118, 474]], 56, { hi: [0.2, 0.42] }],
    [[[542, 260], [590, 330], [620, 400], [668, 460], [732, 506]], 58, { hi: [0.2, 0.42] }],
    [[[296, 210], [244, 262], [214, 312], [152, 352]], 40, { swell: 0.3 }],
    [[[540, 214], [596, 256], [632, 298], [688, 336]], 40, { swell: 0.3 }],
  ];
  const backFill = p.helpers.mix(pal.hair, pal.hairShadow, 0.5);
  const strands = [
    [[300, 250], [244, 360], [214, 470], [176, 580], [128, 650]],
    [[532, 250], [588, 360], [618, 470], [656, 580], [704, 650]],
    [[236, 700], [190, 820], [120, 900]],
    [[596, 700], [642, 820], [712, 900]],
  ].map((s) => taper(s, { w: 2.2, start: 0, end: 0, peak: 0.45 })).join('');
  // flyaway strands escaping the silhouette (wild hair)
  const fly = [
    [[204, 620], [160, 650], [120, 690]],
    [[640, 600], [690, 616], [734, 650]],
  ].map((c) => taper(c, { w: 5, start: 0.6, end: 0, peak: 0.2 })).join('');
  return `<g stroke-linejoin="round">`
    + `<path d="${fly}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="1.6"/>`
    + `<path d="${mane}" fill="${grad}" stroke="${pal.hairLine}" stroke-width="3.4"/>`
    + drawLocks(p, back, { fill: backFill, shade: pal.hairDeep, stroke: pal.hairLine, sw: 2.4, shadeOp: 0.8 })
    + drawLocks(p, front, { fill: pal.hair, shade: pal.hairShadow, stroke: pal.hairLine, sw: 2.4, hiFill: pal.hairHighlight, shadeOp: 0.9, hiOp: 0.8 })
    + `<path d="${strands}" fill="${pal.hairLine}" opacity=".4"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ hair (front): dome, tousled bangs, wavy side locks, ahoge
function hairFront(p) {
  const { smooth, taper } = p.helpers;
  const pal = p.palette;
  const domeFill = p.lin('dome', [[0, '#da6640'], [0.55, pal.hair], [1, pal.hairShadow]], [300, 180, 540, 420]);
  const dome = smooth([[256, 440], [248, 370], [252, 300], [272, 246], [310, 204], [360, 182], [416, 176], [472, 182], [522, 204], [560, 246], [580, 300], [584, 370], [576, 440],
    [560, 370], [520, 310], [470, 282], [416, 276], [362, 282], [312, 310], [272, 370]], { closed: true });
  const domeShade = smooth([[580, 300], [584, 370], [576, 440], [560, 370], [526, 316], [546, 286], [566, 266]], { closed: true });
  const ringTop = [[262, 316], [282, 266], [322, 228], [380, 206], [440, 202], [500, 210], [546, 234], [574, 278]];
  const ringBot = [[562, 284, 1], [552, 296, 1], [540, 272, 1], [522, 286, 1], [508, 260, 1], [488, 272, 1], [470, 250, 1], [450, 262, 1], [430, 246, 1], [410, 258, 1], [390, 248, 1], [370, 268, 1], [352, 256, 1], [334, 280, 1], [318, 270, 1], [300, 296, 1], [288, 290, 1], [274, 320, 1]];
  const ring = smooth(ringTop.concat(ringBot), { closed: true });
  const ahoge = taper([[424, 186], [430, 152], [452, 128], [480, 124], [494, 136]], { w: 12, start: 0.6, end: 0, peak: 0.25 })
    + taper([[404, 186], [396, 160], [378, 146], [360, 146]], { w: 9, start: 0.6, end: 0, peak: 0.25 });
  const style = { fill: pal.hair, shade: pal.hairShadow, stroke: pal.hairLine, sw: 2, hiFill: pal.hairHighlight, shadeOp: 0.85, hiOp: 0.85 };
  const dark = { ...style, fill: pal.hairShadow, shade: pal.hairDeep };
  // wild flicks off the cheeks and wavy side locks in front of the shoulders
  const flicks = [
    [[[270, 390], [246, 466], [222, 526], [186, 566]], 30],
    [[[562, 390], [588, 462], [612, 520], [650, 556]], 30],
  ];
  const sides = [
    [[[284, 296], [262, 400], [254, 500], [268, 590], [254, 680], [268, 770], [240, 866]], 46, { swell: 0.28, hi: [0.18, 0.32] }],
    [[[548, 296], [572, 400], [580, 500], [566, 590], [580, 680], [566, 770], [596, 870]], 46, { swell: 0.28, hi: [0.18, 0.32] }],
  ];
  const inner = [
    [[[296, 336], [284, 440], [290, 540], [280, 626]], 22],
    [[[536, 336], [550, 440], [544, 540], [554, 626]], 22],
    [[[350, 230], [300, 290], [276, 360], [268, 440]], 46, { swell: 0.45, start: 0.1 }],
    [[[490, 226], [538, 290], [560, 360], [566, 444]], 46, { swell: 0.45, start: 0.1 }],
  ];
  const bangs = [
    [[[376, 222], [332, 282], [306, 352], [296, 426]], 52],
    [[[462, 216], [508, 280], [532, 350], [538, 426]], 54],
    [[[402, 214], [378, 288], [360, 352], [346, 418]], 46],
    [[[446, 212], [468, 286], [480, 350], [472, 416]], 44],
    [[[426, 210], [416, 286], [406, 348], [396, 404]], 40],
    [[[440, 212], [402, 262], [374, 318], [354, 378]], 28, { swell: 0.4 }],
  ].map(([c, w, o = {}]) => [c, w, { swell: 0.42, hi: [0.3, 0.52], ...o }]);
  const bangClip = p.clip('bangClip', bangs.map(([c, w, o]) => lk(p, c, w, o).d));
  const rootShade = p.lin('bangRoot', [[0, pal.hairDeep, 0.7], [1, pal.hairDeep, 0]], [0, 216, 0, 276]);
  const wisps = taper([[296, 350], [282, 432], [288, 512], [300, 572]], { w: 4, start: 0.1, end: 0, peak: 0.25 })
    + taper([[536, 350], [550, 432], [544, 504], [532, 560]], { w: 4, start: 0.1, end: 0, peak: 0.25 });
  return `<g stroke-linejoin="round">`
    + drawLocks(p, flicks, dark)
    + drawLocks(p, sides, style)
    + `<path d="${ahoge}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="2.4"/>`
    + `<path d="${dome}" fill="${domeFill}" stroke="${pal.hairLine}" stroke-width="3.4"/>`
    + `<path d="${domeShade}" fill="${pal.hairShadow}" opacity=".8"/>`
    + `<path d="${ring}" fill="${pal.hairHighlight}" opacity=".8"/>`
    + drawLocks(p, inner, dark)
    + drawLocks(p, bangs, style)
    + `<g clip-path="${bangClip}"><rect x="250" y="200" width="340" height="80" fill="${rootShade}"/></g>`
    + `<path d="${wisps}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="1.2"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ horns: drawn under the hair so they sprout from it
function hornPath(p, c, side) {
  const { sampleSpline, smoothQ, n, taper } = p.helpers;
  const N = 14;
  const s = sampleSpline(c, N);
  const wf = (t) => 40 * Math.pow(1 - t, 0.75) + 0.6;
  const L = [], R = [], dir = [];
  for (let i = 0; i < N; i++) {
    const a = s[Math.max(0, i - 1)], b = s[Math.min(N - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1;
    dx /= m; dy /= m;
    dir.push([dx, dy]);
    const w = wf(i / (N - 1)) / 2;
    L.push([s[i][0] + dy * w, s[i][1] - dx * w]);
    R.push([s[i][0] - dy * w, s[i][1] + dx * w]);
  }
  const body = smoothQ([[...L[0], 1], ...L.slice(1, -1), [...s[N - 1], 1], ...R.slice(1, -1).reverse(), [...R[0], 1]], { closed: true });
  // the screen-right half is in shadow (moonlight from the upper-left)
  const rightIsR = R[4][0] > L[4][0];
  const sh = rightIsR ? R : L, lit = rightIsR ? L : R;
  const shade = smoothQ([[...s[0], 1], ...s.slice(1, -1).map((q, i) => [q[0] + (sh[i + 1][0] - q[0]) * 0.15, q[1] + (sh[i + 1][1] - q[1]) * 0.15]), [...s[N - 1], 1], ...sh.slice(1, -1).reverse(), [...sh[0], 1]], { closed: true });
  let rings = '';
  for (const i of [3, 5, 7, 9]) {
    const [dx, dy] = dir[i];
    const bul = wf(i / (N - 1)) * 0.28;
    rings += `M${n(L[i][0])},${n(L[i][1])}Q${n(s[i][0] + dx * bul)},${n(s[i][1] + dy * bul)} ${n(R[i][0])},${n(R[i][1])}`;
  }
  const g = p.lin(`horn${side}`, [[0, C.hornBase], [0.5, C.hornMid], [1, C.hornTip]], [c[0][0], c[0][1], c[c.length - 1][0], c[c.length - 1][1]]);
  const hi = taper(s.slice(3, 12).map((q, k) => [q[0] + (lit[k + 3][0] - q[0]) * 0.55, q[1] + (lit[k + 3][1] - q[1]) * 0.55]), { w: 5, start: 0.2, end: 0, peak: 0.4 });
  // a small secondary tine on the outer side (reads draconic rather than demonic)
  const i0 = 7;
  const outer = Math.abs(L[i0][0] - 416) > Math.abs(R[i0][0] - 416) ? L : R;
  const o = outer[i0], q = s[i0];
  const ox = o[0] - q[0], oy = o[1] - q[1], om = Math.hypot(ox, oy) || 1;
  const [dx7, dy7] = dir[i0];
  const tine = taper([[q[0] + ox * 0.3 - dx7 * 6, q[1] + oy * 0.3 - dy7 * 6], [o[0] + (ox / om) * 8 + dx7 * 6, o[1] + (oy / om) * 8 + dy7 * 6], [o[0] + (ox / om) * 16 + dx7 * 24, o[1] + (oy / om) * 16 + dy7 * 24]], { w: 15, start: 1, end: 0, peak: 0.05 });
  return `<path d="${tine}" fill="${C.hornMid}" stroke="${C.hornLine}" stroke-width="2.6" stroke-linejoin="round"/>`
    + `<path d="${body}" fill="${g}" stroke="${C.hornLine}" stroke-width="3.2" stroke-linejoin="round"/>`
    + `<path d="${shade}" fill="${C.hornBase}" opacity=".5"/>`
    + `<path d="${rings}" fill="none" stroke="${C.hornLine}" stroke-width="2.2" opacity=".7"/>`
    + `<path d="${hi}" fill="#fff" opacity=".6"/>`;
}

function horns(p) {
  const { mirrorPts } = p.helpers;
  const cL = [[300, 330], [262, 314], [226, 290], [200, 256], [188, 220], [192, 188]];
  return hornPath(p, cL, 'L') + hornPath(p, mirrorPts(cL), 'R');
}

// ------------------------------------------------------------------ face marks: one small fang in the grin
function fang(p) {
  const y = p.anchors.mouth[1];
  return `<path d="M421.5,${y + 1.6}L429,${y + 1}L425.6,${y + 8.6}Z" fill="#fff" stroke="${p.palette.mouthLine}" stroke-width="1.2" stroke-linejoin="round"/>`;
}

// ------------------------------------------------------------------ vestment
// one row of scales hanging from polyline `top`, tips on `bot` (compact relative quadratic arcs)
function scaleRow(p, top, bot, count) {
  const { n } = p.helpers;
  let d = '', hi = '';
  for (let k = 0; k < count; k++) {
    const a0 = samp(top, k / count), a1 = samp(top, (k + 1) / count);
    const b = samp(bot, (k + 0.5) / count);
    const ax = a1[0] - a0[0], ay = a1[1] - a0[1];
    const bx = b[0] - a0[0], by = b[1] - a0[1];
    d += `M${n(a0[0])},${n(a0[1])}q${n(bx * 0.15 - ax * 0.05)},${n(by * 1.05)} ${n(bx)},${n(by)}q${n(ax - bx * 0.85 + ax * 0.05)},${n(ay - by * 0.05)} ${n(ax - bx)},${n(ay - by)}z`;
    hi += `M${n(a0[0] + ax * 0.2 + bx * 0.1)},${n(a0[1] + ay * 0.2 + by * 0.25)}q${n(bx * 0.05)},${n(by * 0.45)} ${n(bx * 0.4 + ax * 0.1)},${n(by * 0.6)}`;
  }
  return { d, hi };
}
function samp(pts, t) {
  const seg = [];
  let L = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
  let target = L * Math.min(1, Math.max(0, t));
  for (let i = 0; i < seg.length; i++) {
    if (target <= seg[i] || i === seg.length - 1) {
      const u = seg[i] ? Math.min(1, target / seg[i]) : 0;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u];
    }
    target -= seg[i];
  }
  return pts[pts.length - 1];
}
const shiftPts = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);

function scales(p, rows, fill, lit) {
  // rows: [[top, bot, count], ...] drawn last-first so upper rows overlap lower ones
  let s = '';
  for (let r = rows.length - 1; r >= 0; r--) {
    const { d, hi } = scaleRow(p, ...rows[r]);
    s += `<path d="${d}" fill="${fill}" stroke="${C.scaleLine}" stroke-width="2.2" stroke-linejoin="round"/><path d="${hi}" fill="none" stroke="${C.scaleHi}" stroke-width="1.8" stroke-linecap="round" opacity="${lit}"/>`;
  }
  return s;
}

function pauldron(p, side) {
  const { smooth, taper, mirrorPath, mirrorPts } = p.helpers;
  const Lft = side === 'L';
  const M = Lft ? (d) => d : mirrorPath;
  const MP = Lft ? (x) => x : mirrorPts;
  const fill = p.lin(`pauld${side}`, Lft ? [[0, C.scaleLit], [0.55, C.scale], [1, C.scaleShade]] : [[0, C.scale], [0.5, C.scaleShade], [1, C.scaleDeep]],
    Lft ? [150, 750, 270, 900] : [682, 750, 562, 900]);
  // scalloped lames under the dome
  const t1 = [[106, 870], [150, 868], [204, 860], [258, 842], [292, 820]];
  const rows = [[MP(t1), MP(shiftPts(t1, 2, 40)), 6], [MP(shiftPts(t1, 2, 32)), MP(shiftPts(t1, 6, 70)), 6]];
  let s = scales(p, rows, fill, Lft ? 0.7 : 0.35);
  // the dome plate over the shoulder
  const dome = smooth([[306, 770], [262, 748], [206, 742], [160, 756], [126, 788], [108, 832], [104, 878, 1], [150, 872], [206, 864], [258, 846], [298, 822]], { closed: true });
  s += `<path d="${M(dome)}" fill="${fill}" stroke="${C.scaleLine}" stroke-width="3.2"/>`
    + `<path d="${M(smooth([[126, 788], [108, 832], [104, 878, 1], [150, 872], [180, 866], [166, 832], [150, 804]], { closed: true }))}" fill="${C.scaleDeep}" opacity="${Lft ? 0.5 : 0.4}"/>`
    // engraved scale band + silver rim
    + `<path d="${M('M128,826q14,16 28,0q14,16 28,0q14,16 28,0q14,16 28,0q14,16 28,0q14,14 26,-4')}" fill="none" stroke="${C.scaleLine}" stroke-width="2" opacity=".75"/>`
    + `<path d="${M('M106,872Q152,866 206,860Q252,846 296,820')}" fill="none" stroke="${C.silverLine}" stroke-width="7" stroke-linecap="round"/>`
    + `<path d="${M('M106,872Q152,866 206,860Q252,846 296,820')}" fill="none" stroke="${Lft ? C.silver : C.silverShade}" stroke-width="3.6" stroke-linecap="round"/>`
    + `<path d="${M('M130,796Q166,766 214,756Q264,754 300,776')}" fill="none" stroke="${C.scaleHi}" stroke-width="2.4" stroke-linecap="round" opacity="${Lft ? 0.8 : 0.35}"/>`
    + `<path d="${M(taper([[222, 770], [252, 782], [280, 802]], { w: 10, start: 0.1, end: 0, peak: 0.4 }))}" fill="#fff" opacity="${Lft ? 0.3 : 0.12}"/>`;
  // silver dragon talons jutting from the outer edge of the pauldron + a claw-and-orb stud on the dome
  const spikes = [
    [[128, 790], [104, 800], [86, 818], [80, 842]],
    [[114, 824], [90, 838], [76, 860], [76, 888]],
    [[108, 860], [88, 876], [80, 900], [86, 926]],
  ].map((c) => taper(c, { w: 20, start: 1, end: 0, peak: 0.05 })).join('');
  const sil = Lft ? C.silver : C.silverShade;
  s += `<path d="${M(spikes)}" fill="${sil}" stroke="${C.silverLine}" stroke-width="2.4" stroke-linejoin="round"/>`
    + `<path d="${M('M114,792Q96,804 88,826M102,828Q86,842 82,864M98,864Q86,880 84,902')}" fill="none" stroke="${C.silverLit}" stroke-width="2" stroke-linecap="round" opacity="${Lft ? 0.85 : 0.35}"/>`
    + clawOrb(p, Lft ? 208 : 624, 796, 11, Lft);
  return s;
}

function vestment(p) {
  const { smooth, mirrorPath } = p.helpers;
  const robe = p.lin('robe', [[0, C.robeLit], [0.45, C.robe], [1, C.robeShade]], [0, 700, 0, 1216]);
  let s = `<g clip-path="${p.refs.bodyClip}"><rect y="660" width="832" height="560" fill="${robe}"/>`
    + `<path d="M596,780L540,800L520,1216H702V1000Z" fill="${C.robeShade}" opacity=".7"/>`
    + `<path d="M150,980Q170,1020 160,1070M206,960Q218,1000 210,1060" fill="none" stroke="${C.robeLit}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`
    + `<path d="M682,980Q662,1020 672,1070M626,960Q614,1000 622,1060" fill="none" stroke="${C.robeLine}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`
    + `</g>`;
  // scale-pattern plastron over the torso
  p.def(`<pattern id="${p.id('scalePat')}" width="34" height="44" patternUnits="userSpaceOnUse">`
    + `<path d="M0,0Q17,30 34,0M-17,22Q0,52 17,22M17,22Q34,52 51,22" fill="none" stroke="${C.scaleLine}" stroke-width="2"/>`
    + `<path d="M5,4Q9,16 16,20M-12,26Q-8,38 -1,42M22,26Q26,38 33,42" fill="none" stroke="${C.scaleHi}" stroke-width="1.4" opacity=".4"/></pattern>`);
  const plast = smooth([[236, 900, 1], [300, 862], [416, 872, 1], [532, 862], [596, 900, 1], [570, 1060], [546, 1216, 1], [286, 1216, 1], [262, 1060]], { closed: true });
  const plastG = p.lin('plast', [[0, C.scaleLit], [0.45, C.scale], [1, C.scaleDeep]], [236, 880, 596, 1100]);
  s += `<g clip-path="${p.refs.torsoClip}"><path d="${plast}" fill="${plastG}" stroke="${C.scaleLine}" stroke-width="3"/>`
    + `<path d="${plast}" fill="url(#${p.id('scalePat')})"/>`
    + `<path d="M240,904Q300,868 416,876Q532,868 592,904" fill="none" stroke="${C.silver}" stroke-width="4"/></g>`;
  // ivory tabard down the centre with copper embroidery
  const tab = smooth([[394, 800, 1], [438, 800, 1], [448, 960], [458, 1216, 1], [374, 1216, 1], [384, 960]], { closed: true });
  const tabG = p.lin('tab', [[0, '#e0d4ca'], [0.3, C.ivoryShade], [1, '#5c4c66']], [0, 820, 0, 1080]);
  const emb = 'M416,870L426,888L416,906L406,888ZM416,918V1216M404,958Q416,948 428,958M404,1012Q416,1002 428,1012M404,1066Q416,1056 428,1066';
  s += `<path d="${tab}" fill="${tabG}" stroke="${C.ivoryLine}" stroke-width="2.6"/>`
    + `<path d="M430,800L438,800L448,960L458,1216H438L436,960Z" fill="#5c4c66" opacity=".45"/>`
    + `<path d="M389,840L380,960L370,1216M443,840L452,960L462,1216" fill="none" stroke="${C.copper}" stroke-width="3"/>`
    + `<path d="${emb}" fill="none" stroke="${C.copper}" stroke-width="2.6" stroke-linejoin="round"/>`;
  // high ivory stand collar with a silver band
  const collar = smooth([[360, 626, 1], [388, 638], [416, 642], [444, 638], [472, 626, 1], [482, 716, 1], [416, 732], [350, 716, 1]], { closed: true });
  const collarG = p.lin('collar', [[0, C.ivory], [0.5, C.ivory], [1, C.ivoryShade]], [360, 0, 480, 0]);
  s += `<path d="${collar}" fill="${collarG}" stroke="${C.ivoryLine}" stroke-width="3"/>`
    + `<path d="M442,639L472,626L482,716L454,724Z" fill="${C.ivoryShade}" opacity=".8"/>`
    + `<path d="M362,636Q416,656 470,636" fill="none" stroke="${C.silverShade}" stroke-width="4"/>`
    + `<path d="M362,633Q416,652 470,633" fill="none" stroke="${C.silverLit}" stroke-width="1.6"/>`
    + `<path d="M380,676l8,-8l8,8l-8,8zM436,676l8,-8l8,8l-8,8z" fill="${C.copper}"/>`;
  // dragon-scale gorget around the collar base (two rows), silver edge
  const gTop = [[296, 738], [340, 724], [384, 714], [416, 712]];
  const gMid = [[300, 760], [346, 756], [388, 764], [416, 772]];
  const gBot = [[304, 786], [350, 790], [392, 806], [416, 816]];
  const gFill = p.lin('gorget', [[0, C.scaleLit], [0.5, C.scale], [1, C.scaleShade]], [300, 700, 532, 820]);
  const mp = p.helpers.mirrorPts;
  s += scales(p, [[mp(gTop).reverse(), mp(gMid).reverse(), 4], [mp(gMid).reverse(), mp(gBot).reverse(), 4]], gFill, 0.35)
    + scales(p, [[gTop, gMid, 4], [gMid, gBot, 4]], gFill, 0.75);
  const edge = smooth([[296, 738], [340, 724], [384, 714], [416, 712]]);
  s += `<path d="${edge}${mirrorPath(edge)}" fill="none" stroke="${C.silverLine}" stroke-width="7" stroke-linecap="round"/>`
    + `<path d="${edge}" fill="none" stroke="${C.silver}" stroke-width="3.6" stroke-linecap="round"/>`
    + `<path d="${mirrorPath(edge)}" fill="none" stroke="${C.silverShade}" stroke-width="3.6" stroke-linecap="round"/>`;
  s += pauldron(p, 'R') + pauldron(p, 'L');
  return s;
}

// ------------------------------------------------------------------ brooch: silver claw setting holding a pink dragon-heart gem
function clawOrb(p, cx, cy, r, lit, big) {
  // a silver dragon claw clutching a pink orb: wrist cuff below, two hooked talons wrapping up the sides
  const { taper, n } = p.helpers;
  const X = (k) => cx + k * r, Y = (k) => cy + k * r;
  const talonL = taper([[X(-0.45), Y(1.05)], [X(-1.26), Y(0.4)], [X(-1.22), Y(-0.55)], [X(-0.78), Y(-1.06)], [X(-0.3), Y(-0.84)]], { w: r * 0.6, start: 1, end: 0, peak: 0.05 });
  const talonR = taper([[X(0.45), Y(1.05)], [X(1.26), Y(0.4)], [X(1.22), Y(-0.55)], [X(0.78), Y(-1.06)], [X(0.3), Y(-0.84)]], { w: r * 0.6, start: 1, end: 0, peak: 0.05 });
  const cuff = `M${n(X(-0.8))},${n(Y(0.8))}Q${n(cx)},${n(Y(1.25))} ${n(X(0.8))},${n(Y(0.8))}L${n(X(0.55))},${n(Y(1.75))}Q${n(cx)},${n(Y(2))} ${n(X(-0.55))},${n(Y(1.75))}Z`;
  const gem = p.rad(big ? 'gem' : 'gemS', [[0, C.pinkLit], [0.35, '#ff9ccf'], [0.75, C.pink], [1, C.pinkDeep]], { cx: 0.38, cy: 0.35, r: 0.7 }, 'objectBoundingBox');
  const sil = lit ? C.silver : C.silverShade;
  return (big ? `<circle cx="${cx}" cy="${cy}" r="${n(r * 1.4)}" fill="${C.pink}" opacity=".45" filter="${p.refs.glow}"/>` : '')
    + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${gem}" stroke="${C.pinkLine}" stroke-width="${big ? 2.4 : 1.8}"/>`
    + `<path d="M${n(X(-0.55))},${n(Y(-0.2))}Q${n(X(-0.45))},${n(Y(-0.6))} ${n(X(-0.05))},${n(Y(-0.7))}" fill="none" stroke="#fff" stroke-width="${big ? 2.6 : 1.8}" stroke-linecap="round" opacity=".9"/>`
    + `<path d="${cuff}" fill="${sil}" stroke="${C.silverLine}" stroke-width="2"/>`
    + `<path d="${talonL}${talonR}" fill="${sil}" stroke="${C.silverLine}" stroke-width="${big ? 2 : 1.6}" stroke-linejoin="round"/>`
    + `<path d="M${n(X(-0.95))},${n(Y(0.5))}Q${n(X(-1.1))},${n(Y(-0.1))} ${n(X(-0.85))},${n(Y(-0.6))}" fill="none" stroke="${C.silverLit}" stroke-width="${big ? 2 : 1.4}" stroke-linecap="round" opacity="${lit ? 0.9 : 0.5}"/>`
    + `<path d="M${n(X(-1.18))},${n(Y(0.05))}l${n(r * 0.3)},${n(r * 0.08)}M${n(X(1.18))},${n(Y(0.05))}l${n(-r * 0.3)},${n(r * 0.08)}" stroke="${C.silverLine}" stroke-width="1.6"/>`;
}

// ------------------------------------------------------------------ brooch: silver claw clutching a pink dragon-heart gem
function brooch(p) {
  return clawOrb(p, 416, 818, 19, true, true);
}
