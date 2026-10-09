// Mia Ling - the cat-eared machinist. Canon: docs/CHARACTER-DESIGN.md section 2.
// Adult (age-appearance 21), petite, drawn modest. Signature silhouette: short choppy self-cut
// hair with fibre-optic neon tips + MECHANICAL cat-ear receivers (titanium shells, circuit
// panels, glowing cyan rim ring, antenna with a signal ball). Wrench clip on her right
// (viewer's left), oversized ripstop work jacket with glowing circuit seams, drone "Zero".
const C = {
  ti: '#97a1b4', tiLit: '#d3d9e4', tiShade: '#646d82', tiDeep: '#3d4458', tiLine: '#1b2030',
  panel: '#121b2c', panelLit: '#1d2c44',
  cyan: '#5ed7ff', cyanHot: '#c9f6ff', cyanDeep: '#2389b8',
  orange: '#ff9a3c', orangeDeep: '#c4621b', orangeLine: '#5a2a0a',
  jacket: '#3b404d', jacketLit: '#535a6b', jacketShade: '#2a2e39', jacketDeep: '#1d2029', jacketLine: '#11131a',
  tee: '#1a2131', teeShade: '#111622',
  steel: '#b9c0cc', steelLit: '#eef1f6', steelShade: '#7a8294', steelLine: '#262a36',
};

export default {
  id: 'mia',
  name: '米娅·铃',
  palette: {
    accent: '#5ed7ff', accent2: '#ff9a3c',
    hair: '#3a93cc', hairShadow: '#24639a', hairDeep: '#163f6c', hairHighlight: '#93e4ff', hairLine: '#0d2645',
    eyeTop: '#0a4a66', eyeBottom: '#62e8ff', eyeLine: '#0a1c2a',
    skin: '#fae3d4', skinShadow: '#e9aea5', skinDeep: '#cd8b8a', skinLine: '#a05a5a',
    blush: '#ff8a8a', brow: '#123459',
    bgTop: '#080d1d', bgMid: '#0f1a33', bgBottom: '#060914',
  },
  expression: { eyeShape: 'round', mouth: 'grin', browRaise: 0.45, browAngle: -0.15, blush: 0.45, gaze: [0.05, -0.1], mouthWidth: 1.05, browWeight: 1.05 },
  face: { ears: false, jaw: 0.6, width: 4, chin: -5, eyeSize: 1.05 }, // rounder, softer face
  costumeLayers: ['bodyBack', 'neckAccessory'],
  layers: {
    bgMotif,
    hairBack,
    bodyBack: collarBack,
    outfit: jacket,
    faceMarks,
    headBack: catEars,
    hairFront,
    headFront: wrenchClip,
    foreground: drone,
    irisDetail,
  },
};

// ------------------------------------------------------------------ background: blueprint grid + circuit traces
function bgMotif(p) {
  const { n, smooth } = p.helpers;
  const grid = p.id('grid');
  p.def(`<pattern id="${grid}" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32,0H0V32" fill="none" stroke="${C.cyan}" stroke-width="1" opacity=".075"/></pattern>`);
  const major = Array.from({ length: 7 }, (_, k) => `M${k * 128 + 32},0V1216`).join('') + Array.from({ length: 10 }, (_, k) => `M0,${k * 128 + 32}H832`).join('');
  // drafted geometry: a big gear-like dial behind the head and dimension lines
  const ticks = Array.from({ length: 48 }, (_, k) => {
    const a = (k / 48) * Math.PI * 2, r0 = 352, r1 = k % 4 ? 362 : 376;
    return `M${n(416 + Math.cos(a) * r0)},${n(400 + Math.sin(a) * r0)}L${n(416 + Math.cos(a) * r1)},${n(400 + Math.sin(a) * r1)}`;
  }).join('');
  const traces = [
    [[0, 540], [70, 540], [104, 506], [104, 380], [140, 344]],
    [[0, 620], [92, 620], [130, 658], [130, 760]],
    [[832, 470], [744, 470], [710, 436], [710, 300], [676, 266]],
    [[832, 560], [770, 560], [740, 590], [740, 700]],
    [[0, 230], [60, 230], [92, 198], [180, 198]],
    [[832, 180], [760, 180], [730, 150], [652, 150]],
  ];
  const tr = traces.map((t) => `M${t.map(([x, y]) => `${x},${y}`).join('L')}`).join('');
  const nodes = traces.map((t) => t[t.length - 1]).map(([x, y]) => `M${x},${y}h0`).join('');
  return `<rect width="832" height="1216" fill="url(#${grid})"/>`
    + `<path d="${major}" stroke="${C.cyan}" stroke-width="1.4" opacity=".08"/>`
    + `<g fill="none" stroke="${C.cyan}" opacity=".16"><circle cx="416" cy="400" r="340" stroke-width="2"/><circle cx="416" cy="400" r="252" stroke-width="1.2" stroke-dasharray="10 8"/>`
    + `<path d="${ticks}" stroke-width="2"/><path d="M40,400H220M612,400H792M416,30V120" stroke-width="1.2" stroke-dasharray="18 6 3 6"/></g>`
    + `<path d="${tr}" fill="none" stroke="${C.cyan}" stroke-width="3" stroke-linejoin="round" opacity=".28"/>`
    + `<path d="${nodes}" stroke="${C.cyanHot}" stroke-width="10" stroke-linecap="round" opacity=".55"/>`
    + `<path d="${nodes}" stroke="${C.cyan}" stroke-width="18" stroke-linecap="round" opacity=".14"/>`;
}

// ------------------------------------------------------------------ hair (back): short nape mass behind the head
function hairBack(p) {
  const { smooth } = p.helpers;
  const pal = p.palette;
  const mass = smooth([[266, 300], [240, 380], [232, 470], [236, 556], [248, 610, 1], [270, 594], [292, 640, 1], [318, 612], [346, 652, 1], [372, 630], [416, 646, 1], [460, 630], [486, 652, 1], [514, 612], [540, 640, 1], [562, 594], [584, 610, 1], [596, 556], [600, 470], [592, 380], [566, 300], [416, 196]], { closed: true });
  return `<path d="${mass}" fill="${pal.hairDeep}" stroke="${pal.hairLine}" stroke-width="3" stroke-linejoin="round"/>`;
}

// ------------------------------------------------------------------ compact lock (fewer samples than helpers.lock -> smaller file)
// cut: n -> the lock ends in a blunt, jagged scissor cut with n teeth (self-cut hair) instead of a point
function lk(p, pts, w, { swell = 0.4, start = 0.3, shadeW = 0.5, flip = false, hi = null, cut = 0 } = {}) {
  const { ribbon, profile, pathLength, clamp, sampleSpline, smoothQ } = p.helpers;
  const samples = clamp(Math.round(pathLength(pts) / 20), 5, 11);
  const base = profile({ w, start, end: 0, peak: swell });
  const wf = cut ? (t) => (t <= swell ? base(t) : w * (1 - 0.32 * ((t - swell) / (1 - swell)))) : base;
  let d;
  if (cut) {
    const c = sampleSpline(pts, samples);
    const L = [], R = [];
    let tx = 0, ty = 1;
    c.forEach((q, i) => {
      const a = c[Math.max(0, i - 1)], b = c[Math.min(samples - 1, i + 1)];
      tx = b[0] - a[0]; ty = b[1] - a[1];
      const m = Math.hypot(tx, ty) || 1;
      tx /= m; ty /= m;
      const hw = wf(i / (samples - 1)) / 2;
      L.push([q[0] + ty * hw, q[1] - tx * hw]);
      R.push([q[0] - ty * hw, q[1] + tx * hw]);
    });
    const le = L[samples - 1], re = R[samples - 1], depth = w * 0.42;
    const zig = [];
    for (let k = 1; k < cut * 2; k++) {
      const u = k / (cut * 2), bx = le[0] + (re[0] - le[0]) * u, by = le[1] + (re[1] - le[1]) * u;
      const f = k % 2 ? depth * (0.7 + 0.3 * Math.sin(k * 2.3)) : -depth * 0.12;
      zig.push([bx + tx * f, by + ty * f, 1]);
    }
    d = smoothQ([[...L[0], 1], ...L.slice(1, -1), [...le, 1], ...zig, [...re, 1], ...R.slice(1, -1).reverse(), [...R[0], 1]], { closed: true });
  } else d = ribbon(pts, (t) => [wf(t) / 2, -wf(t) / 2], { samples });
  const a = pts[0], b = pts[pts.length - 1];
  let s = b[1] - a[1] >= 0 ? 1 : -1;
  if (Math.abs(b[1] - a[1]) < Math.abs(b[0] - a[0]) * 0.35) s = b[0] - a[0] >= 0 ? -1 : 1;
  if (flip) s = -s;
  const shade = ribbon(pts, (t) => {
    const hw = wf(t) / 2 * (cut && t > 0.9 ? (1 - t) * 10 : 1);
    return s > 0 ? [hw, hw * (1 - shadeW * 2)] : [-hw * (1 - shadeW * 2), -hw];
  }, { samples });
  let hiD = '';
  if (hi) {
    const sub = sampleSpline(pts, 20).filter((_, i) => i / 19 >= hi[0] && i / 19 <= hi[1]);
    const span = hi[1] - hi[0];
    hiD = ribbon(sub, (t) => {
      const hw = wf(hi[0] + t * span) / 2, k = Math.sin(t * Math.PI) ** 1.3;
      return s > 0 ? [-hw * 0.12, -hw * (0.12 + 0.42 * k)] : [hw * (0.12 + 0.42 * k), hw * 0.12];
    }, { samples: 5 });
  }
  return { d, shade, hi: hiD };
}
function drawLocks(p, list, { fill, shade, stroke, sw = 2.2, hiFill, shadeOp = 0.85, hiOp = 0.85 }) {
  const { n } = p.helpers;
  return list.map((L) => {
    const k = lk(p, L.pts, L.w, L);
    return `<path d="${k.d}" fill="${L.fill || fill}" stroke="${L.stroke || stroke}" stroke-width="${n(L.sw || sw)}"/>`
      + `<path d="${k.shade}" fill="${L.shadeFill || shade}" opacity="${n(L.shadeOp ?? shadeOp)}"/>`
      + (k.hi ? `<path d="${k.hi}" fill="${hiFill}" opacity="${n(hiOp)}"/>` : '');
  }).join('');
}

// ------------------------------------------------------------------ hair (front): choppy self-cut layers, neon fibre-optic tips
function hairFront(p) {
  const { smooth, taper } = p.helpers;
  const pal = p.palette;
  const BB = 'objectBoundingBox';
  const tipFill = p.lin('tipFill', [[0, pal.hair], [0.6, pal.hair], [0.8, '#36c3f4'], [0.93, '#7ae9ff'], [1, '#d2fcff']], [0, 0, 0, 1], BB);
  const tipShade = p.lin('tipShade', [[0, pal.hairShadow], [0.62, pal.hairShadow], [0.85, '#2aa3d8'], [1, '#8ff0ff']], [0, 0, 0, 1], BB);
  const tipLine = p.lin('tipLine', [[0, pal.hairLine], [0.72, pal.hairLine], [1, '#3aa6d6']], [0, 0, 0, 1], BB);
  const backFill = p.lin('tipBack', [[0, pal.hairShadow], [0.62, pal.hairShadow], [0.86, '#2a9fd2'], [1, '#a6f2ff']], [0, 0, 0, 1], BB);
  const domeG = p.lin('dome', [[0, '#4cabe0'], [0.55, pal.hair], [1, pal.hairShadow]], [300, 170, 540, 400]);
  const dome = smooth([[252, 440], [244, 362], [252, 294], [280, 236], [318, 204], [366, 182], [416, 174], [466, 182], [514, 204], [552, 236], [580, 294], [588, 362], [580, 440],
    [560, 372], [520, 314], [462, 288], [416, 284], [370, 288], [312, 314], [272, 372]], { closed: true });
  const domeShade = smooth([[580, 294], [588, 362], [580, 440], [560, 372], [530, 326], [548, 296], [568, 280]], { closed: true });
  const ringTop = [[262, 322], [286, 270], [330, 232], [392, 212], [452, 212], [506, 226], [548, 256], [574, 296]];
  const ringBot = [[562, 300, 1], [550, 312, 1], [538, 286, 1], [518, 298, 1], [502, 270, 1], [482, 282, 1], [464, 258, 1], [442, 270, 1], [422, 254, 1], [400, 268, 1], [380, 258, 1], [362, 280, 1], [346, 270, 1], [330, 296, 1], [314, 288, 1], [296, 316, 1], [284, 308, 1], [272, 334, 1]];
  const ring = smooth(ringTop.concat(ringBot), { closed: true });
  const T = { fill: tipFill, shadeFill: tipShade, stroke: tipLine };
  const style = { fill: pal.hair, shade: pal.hairShadow, stroke: pal.hairLine, hiFill: pal.hairHighlight };
  // back layer: outer side pieces flicking outward (layered, choppy silhouette)
  const sideBack = [
    { pts: [[270, 300], [244, 392], [234, 470], [234, 530], [212, 568]], w: 58 },
    { pts: [[562, 300], [590, 392], [600, 466], [598, 518], [622, 550]], w: 58 },
    { pts: [[262, 400], [244, 452], [222, 488], [198, 504]], w: 36, swell: 0.3 },
    { pts: [[572, 396], [592, 444], [614, 476], [640, 488]], w: 34, swell: 0.3 },
  ].map((l) => ({ ...l, ...T, fill: backFill, shadeFill: pal.hairDeep }));
  const side = [
    { pts: [[282, 306], [262, 400], [254, 480], [256, 548], [246, 598]], w: 50, cut: 2 },
    { pts: [[550, 306], [572, 400], [580, 476], [576, 540], [590, 586]], w: 48 },
    { pts: [[296, 330], [284, 420], [284, 500], [296, 560], [316, 594]], w: 36 },
    { pts: [[536, 330], [548, 420], [550, 492], [542, 540], [530, 572]], w: 38, cut: 2 },
    { pts: [[304, 350], [300, 432], [308, 498], [324, 532]], w: 20, swell: 0.35 },
    { pts: [[528, 350], [532, 432], [524, 494], [510, 524]], w: 18, swell: 0.35 },
  ].map((l) => ({ ...l, ...T }));
  // bangs: uneven self-cut lengths, some blunt scissor-chopped; long pieces only beside / between the eyes
  const bangs = [
    { pts: [[340, 236], [304, 300], [284, 372], [276, 452]], w: 52 },
    { pts: [[490, 236], [528, 300], [548, 372], [556, 446]], w: 50 },
    { pts: [[360, 228], [342, 300], [334, 356], [332, 398]], w: 52, cut: 2 },
    { pts: [[470, 228], [492, 300], [502, 362], [508, 418]], w: 46 },
    { pts: [[446, 222], [462, 292], [468, 340], [470, 372]], w: 44, cut: 2 },
    { pts: [[384, 222], [372, 296], [364, 352], [358, 400]], w: 36 },
    { pts: [[426, 218], [438, 300], [438, 362], [432, 410]], w: 34 },
    { pts: [[402, 218], [404, 300], [402, 380], [394, 452]], w: 36 },
    { pts: [[420, 222], [392, 290], [362, 340], [344, 380]], w: 30, swell: 0.45 },
  ].map((b) => ({ ...b, ...T, hi: [0.3, 0.5] }));
  const bangDs = bangs.map((b) => lk(p, b.pts, b.w, b).d);
  const bangClip = p.clip('bangClip', bangDs);
  const rootShade = p.lin('bangRoot', [[0, pal.hairDeep, 0.7], [1, pal.hairDeep, 0]], [0, 222, 0, 290]);
  // crown tufts (choppy top) and flyaways
  const tufts = [
    { pts: [[414, 182], [424, 150], [446, 126], [470, 118]], w: 20, swell: 0.2, start: 0.6 },
    { pts: [[404, 184], [398, 156], [384, 136]], w: 14, swell: 0.2, start: 0.6 },
  ];
  const fly = [[[236, 548], [218, 572], [200, 582]], [[602, 520], [624, 538], [640, 544]], [[300, 590], [312, 610], [326, 618]]]
    .map((s) => taper(s, { w: 6, start: 0.9, end: 0, peak: 0.1 })).join('');
  const strands = [[[330, 232], [300, 262], [278, 300]], [[390, 196], [350, 210], [316, 238]], [[452, 196], [500, 212], [534, 244]]]
    .map((s) => taper(s, { w: 2.2, start: 0.1, end: 0, peak: 0.5 })).join('');
  const sparks = [[276, 452], [556, 446], [590, 586], [246, 598], [212, 568], [198, 504], [640, 488]].map(([x, y]) => `M${x},${y}h0`).join('');
  return `<g stroke-linejoin="round">`
    + drawLocks(p, sideBack, style)
    + drawLocks(p, tufts, { ...style, sw: 2 })
    + `<path d="${dome}" fill="${domeG}" stroke="${pal.hairLine}" stroke-width="3.4"/>`
    + `<path d="${domeShade}" fill="${pal.hairShadow}" opacity=".8"/>`
    + `<path d="${ring}" fill="${pal.hairHighlight}" opacity=".75"/>`
    + `<path d="${strands}" fill="${pal.hairLine}" opacity=".4"/>`
    + drawLocks(p, side, style)
    + drawLocks(p, bangs, style)
    + `<g clip-path="${bangClip}"><rect x="250" y="200" width="340" height="92" fill="${rootShade}"/></g>`
    + `<path d="${fly}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="1.4"/>`
    + `<path d="${sparks}" stroke="${C.cyan}" stroke-width="11" stroke-linecap="round" opacity=".3"/>`
    + `<path d="${sparks}" stroke="#effeff" stroke-width="3.6" stroke-linecap="round"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ mechanical cat-ear receivers (behind the bangs, base hidden in the hair)
// local frame: base centre at 0,0, pointing up (-y); local -x is the ear's OUTER side. The side-
// invariant parts (inner circuit panel, glowing rim ring, hinge, tip cap, antenna) live once in
// <defs> and are <use>d for both ears; only the shell lighting differs per side.
const EAR = {
  shell: 'M-62,30C-62,-6 -58,-52 -46,-82C-36,-106 -22,-126 -10,-142C4,-134 16,-114 28,-88C40,-62 50,-30 58,26Z',
  panel: 'M-44,30C-44,-8 -40,-46 -31,-72C-24,-92 -16,-106 -8,-118C2,-108 10,-94 18,-74C26,-54 34,-26 40,30Z',
  rim: 'M-38,26C-38,-8 -34,-44 -26,-68C-20,-86 -14,-98 -8,-108C0,-98 7,-86 13,-70C21,-50 28,-22 34,26',
  outer: 'M-62,30C-62,-6 -58,-52 -46,-82C-36,-106 -22,-126 -10,-142L-8,-118C-16,-106 -24,-92 -31,-72C-40,-46 -44,-8 -44,30Z',
  inner: 'M58,26C50,-30 40,-62 28,-88C16,-114 4,-134 -10,-142L-8,-118C2,-108 10,-94 18,-74C26,-54 34,-26 40,30Z',
  cap: 'M-30,-110C-22,-122 -16,-132 -10,-142C-2,-136 6,-126 12,-114C2,-112 -14,-110 -30,-110Z',
};
function earParts(p) {
  const panelG = p.lin('earPanel', [[0, C.panel], [0.65, C.panelLit], [1, '#1f5070']], [0, -110, 0, 30]);
  const traces = 'M-4,24V-14L-14,-30V-62M-4,-14L10,-28V-54M-22,22V-2L-30,-10M14,22V4L24,-6M-14,-62L-10,-82M10,-54L4,-74';
  const dots = [[-14, -62], [10, -54], [24, -6], [-10, -82], [-4, -14], [4, -74]].map(([x, y]) => `M${x},${y}h0`).join('');
  const id = p.id('earInv');
  p.def(`<g id="${id}">`
    + `<path d="${EAR.panel}" fill="${panelG}" stroke="${C.tiLine}" stroke-width="2.2"/>`
    + `<path d="${traces}" fill="none" stroke="${C.cyan}" stroke-width="1.6" opacity=".7"/>`
    + `<path d="${dots}" stroke="#d9f4ff" stroke-width="5" stroke-linecap="round"/><circle cx="-30" cy="-10" r="2.8" fill="${C.orange}"/>`
    + `<path d="${EAR.rim}" fill="none" stroke="${C.cyan}" stroke-width="3.6" stroke-linecap="round" filter="${p.refs.glow}"/>`
    + `<path d="${EAR.rim}" fill="none" stroke="${C.cyanHot}" stroke-width="1.3" stroke-linecap="round"/>`
    + `<path d="${EAR.cap}" fill="${C.tiDeep}" stroke="${C.tiLine}" stroke-width="2.2"/>`
    // hinge hub on the outer base
    + `<circle cx="-50" cy="-8" r="11" fill="${C.tiShade}" stroke="${C.tiLine}" stroke-width="2.4"/><circle cx="-50" cy="-8" r="5" fill="${C.tiDeep}"/><path d="M-53,-11l6,6" stroke="${C.tiLit}" stroke-width="1.6"/>`
    + `</g>`);
  const ant = p.id('earAnt');
  p.def(`<g id="${ant}"><path d="M-12,-136L-28,-182" stroke="${C.tiLine}" stroke-width="5.5" stroke-linecap="round"/><path d="M-12,-136L-28,-182" stroke="${C.tiLit}" stroke-width="2" stroke-linecap="round"/>`
    + `<circle cx="-30" cy="-188" r="8.5" fill="${C.orange}" stroke="${C.orangeLine}" stroke-width="2" filter="${p.refs.glow}"/><circle cx="-32.5" cy="-190.5" r="2.8" fill="#fff3e0"/></g>`);
  return { inv: `#${id}`, ant: `#${ant}` };
}
function ear(p, side, refs) {
  const lit = side === 'L';
  const shellG = p.lin(`shell${side}`, lit ? [[0, C.tiLit], [0.45, C.ti], [1, C.tiShade]] : [[0, C.ti], [0.5, C.tiShade], [1, C.tiDeep]], [-60, -140, 50, 20]);
  return `<use href="${refs.ant}"/>`
    + `<path d="${EAR.shell}" fill="${shellG}" stroke="${C.tiLine}" stroke-width="3.2" stroke-linejoin="round"/>`
    + `<path d="${lit ? EAR.inner : EAR.outer}" fill="${C.tiDeep}" opacity="${lit ? '.45' : '.55'}"/>`
    + `<path d="${lit ? 'M-54,-30Q-48,-70 -24,-116' : 'M46,-30Q36,-70 14,-112'}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity="${lit ? '.75' : '.3'}"/>`
    + `<path d="M-58,-40l10,4M-56,-52l10,4M-53,-64l10,4" stroke="${C.tiLine}" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>`
    + `<use href="${refs.inv}"/>`;
}
function catEars(p) {
  const refs = earParts(p);
  // both ears tilt slightly forward (she is happy / curious)
  return `<g transform="translate(314 232) rotate(-23) scale(1.06)">${ear(p, 'L', refs)}</g>`
    + `<g transform="translate(518 232) rotate(23) scale(-1.06 1.06)">${ear(p, 'R', refs)}</g>`;
}

// ------------------------------------------------------------------ face marks: the tiny mole on the nose tip
function faceMarks(p) {
  const pal = p.palette;
  const [x, y] = p.anchors.noseTip;
  return `<circle cx="${x - 4.5}" cy="${y - 2.5}" r="2.3" fill="${pal.skinLine}" opacity=".85"/>`;
}

// ------------------------------------------------------------------ iris: faint circuit glint
function irisDetail(p) {
  const { n } = p.helpers;
  const e = p.eye;
  const x = e.cx + (e.side === 'L' ? 4 : -4), y = e.cy + e.ry * 0.36;
  return `<path d="M${n(x - 8)},${n(y + 2)}H${n(x)}L${n(x + 5)},${n(y - 3)}H${n(x + 9)}" fill="none" stroke="#dffaff" stroke-width="1.1" opacity=".55"/><circle cx="${n(x + 9)}" cy="${n(y - 3)}" r="1.4" fill="#dffaff" opacity=".7"/>`;
}

// ------------------------------------------------------------------ hood bunched behind the neck + inside of the stand collar
function collarBack(p) {
  const { smooth } = p.helpers;
  const hood = smooth([[268, 744], [276, 690], [312, 660], [368, 646], [416, 642], [464, 646], [520, 660], [556, 690], [564, 744]], { closed: true });
  const lining = smooth([[338, 640], [372, 610], [416, 602], [460, 610], [494, 640], [502, 716, 1], [330, 716, 1]], { closed: true });
  return `<path d="${hood}" fill="${C.jacketShade}" stroke="${C.jacketLine}" stroke-width="3"/>`
    + `<path d="M296,690Q352,664 404,662M536,690Q480,664 428,662" fill="none" stroke="${C.jacketDeep}" stroke-width="3" stroke-linecap="round"/>`
    + `<path d="M292,700Q346,676 396,672" fill="none" stroke="${C.jacketLit}" stroke-width="2" stroke-linecap="round" opacity=".6"/>`
    + `<path d="${lining}" fill="#1f2531" stroke="${C.jacketLine}" stroke-width="3"/>`
    + `<path d="M344,638Q378,614 416,608Q454,614 488,638" fill="none" stroke="${C.cyan}" stroke-width="2" opacity=".55"/>`;
}

// ------------------------------------------------------------------ oversized ripstop work jacket
function jacket(p) {
  const { smooth, taper, mirrorPath, n } = p.helpers;
  const rip = p.id('rip');
  p.def(`<pattern id="${rip}" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M14,0H0V14" fill="none" stroke="#c9d3e6" stroke-width="1" opacity=".08"/></pattern>`);
  const jg = p.lin('jacket', [[0, C.jacketLit], [0.35, C.jacket], [1, C.jacketShade]], [150, 760, 480, 1180]);
  const jgR = p.lin('jacketR', [[0, C.jacket], [0.5, C.jacketShade], [1, C.jacketDeep]], [420, 760, 760, 1100]);
  // body: dropped shoulders bulge far past the template silhouette (oversized fit on a petite frame)
  const halfL = smooth([[416, 764, 1], [376, 716], [326, 720], [262, 732], [198, 752], [142, 786], [102, 846], [82, 930], [72, 1040], [66, 1216, 1], [416, 1216, 1]], { closed: true });
  const halfR = mirrorPath(halfL);
  let s = `<path d="${halfL}" fill="${jg}" stroke="${C.jacketLine}" stroke-width="3.4"/>`
    + `<path d="${halfR}" fill="${jgR}" stroke="${C.jacketLine}" stroke-width="3.4"/>`;
  const clip = p.clip('jacketClip', [halfL, halfR]);
  // yoke: lighter slate panel across the shoulders, edged with retro-reflective tape
  const seamL = [[60, 842], [140, 818], [216, 808], [300, 818], [416, 846]];
  const yokeL = smooth([...seamL.slice().reverse(), [416, 700, 1], [60, 700, 1]].map((q, i) => (i === 0 ? [q[0], q[1], 1] : q)), { closed: true });
  const tapeL = taper(seamL, { w: 11, start: 1, end: 1, peak: 0.5 });
  s += `<g clip-path="${clip}"><rect y="690" width="832" height="530" fill="url(#${rip})"/>`
    + `<path d="${yokeL}" fill="#4f5768"/><path d="${mirrorPath(yokeL)}" fill="#373d4b"/>`
    + `<path d="${smooth([[120, 700], [150, 780], [120, 830], [60, 846, 1], [60, 700, 1]], { closed: true })}" fill="#5f6879" opacity=".7"/>`
    // cel planes: shadow under the dropped shoulders and down the right side
    + `<path d="${smooth([[66, 960], [130, 930], [222, 950], [240, 1216, 1], [60, 1216, 1]], { closed: true })}" fill="${C.jacketShade}" opacity=".55"/>`
    + `<path d="${smooth([[766, 960], [702, 930], [610, 950], [592, 1216, 1], [772, 1216, 1]], { closed: true })}" fill="${C.jacketDeep}" opacity=".6"/>`
    + `<path d="${smooth([[416, 990], [470, 1010], [540, 1070], [560, 1216, 1], [416, 1216, 1]], { closed: true })}" fill="${C.jacketShade}" opacity=".45"/>`
    + `<path d="${tapeL}" fill="#9aa6ba"/><path d="${mirrorPath(tapeL)}" fill="#6c778b"/>`
    + `<path d="${smooth(seamL.map(([x, y]) => [x, y - 3]))}" fill="none" stroke="#e4ecf6" stroke-width="1.6" opacity=".75"/>`
    + `<path d="${smooth(seamL.map(([x, y]) => [x, y - 6]))}${mirrorPath(smooth(seamL.map(([x, y]) => [x, y - 6])))}${smooth(seamL.map(([x, y]) => [x, y + 6]))}${mirrorPath(smooth(seamL.map(([x, y]) => [x, y + 6])))}" fill="none" stroke="${C.jacketLine}" stroke-width="2"/>`
    // sleeve tape bands
    + `<path d="M70,1060Q150,1046 232,1062L232,1076Q150,1060 70,1074ZM762,1060Q682,1046 600,1062L600,1076Q682,1060 762,1074Z" fill="#7d889c" stroke="${C.jacketLine}" stroke-width="2"/>`
    + `</g>`;
  // dropped-shoulder seams and sleeve folds
  const armSeam = smooth([[206, 810], [212, 880], [222, 960], [232, 1060], [236, 1216]]);
  s += `<path d="${armSeam}${mirrorPath(armSeam)}" fill="none" stroke="${C.jacketLine}" stroke-width="2.6"/>`
    + `<path d="${smooth([[201, 814], [206, 880], [216, 960]])}" fill="none" stroke="${C.jacketLit}" stroke-width="1.6" opacity=".7"/>`;
  const folds = [
    [[96, 950], [126, 984], [130, 1036]], [[168, 900], [188, 950], [182, 1010]], [[90, 1110], [120, 1140], [124, 1190]], [[176, 1100], [200, 1140], [196, 1190]],
    [[736, 950], [706, 984], [702, 1036]], [[664, 900], [644, 950], [650, 1010]], [[742, 1110], [712, 1140], [708, 1190]], [[656, 1100], [632, 1140], [636, 1190]],
    [[296, 1010], [314, 1070], [310, 1130]], [[544, 1020], [524, 1080], [530, 1140]], [[250, 880], [276, 930], [282, 990]],
  ].map((f) => taper(f, { w: 4.6, start: 0.2, end: 0, peak: 0.35 })).join('');
  s += `<path d="${folds}" fill="${C.jacketDeep}" opacity=".85"/>`;
  const foldHi = [[[102, 946], [132, 978], [138, 1026]], [[174, 896], [194, 944]], [[302, 1006], [320, 1060]], [[96, 1106], [126, 1136]]]
    .map((f) => taper(f, { w: 3, start: 0.2, end: 0, peak: 0.35 })).join('');
  s += `<path d="${foldHi}" fill="${C.jacketLit}" opacity=".85"/>`;
  // inner tee showing in the open V
  const vee = smooth([[364, 690, 1], [468, 690, 1], [450, 760], [416, 812, 1], [382, 760]], { closed: true });
  s += `<path d="${vee}" fill="${C.tee}" stroke="${C.jacketLine}" stroke-width="2.4"/>`
    + `<path d="M372,704Q416,730 460,704" fill="none" stroke="${C.orange}" stroke-width="3" opacity=".9"/>`
    + `<path d="M440,700L462,694L446,760L420,806Z" fill="${C.teeShade}" opacity=".8"/>`;
  // tall stand collar, unzipped at the throat and folded out
  const flapL = smooth([[332, 606, 1], [366, 624], [382, 680], [400, 756], [416, 812, 1], [360, 774], [306, 746, 1], [314, 676]], { closed: true });
  const flapR = mirrorPath(flapL);
  const edge = smooth([[336, 614], [362, 630], [376, 684], [396, 756]]);
  s += `<path d="${flapL}" fill="#565e70" stroke="${C.jacketLine}" stroke-width="3"/>`
    + `<path d="${flapR}" fill="${C.jacketShade}" stroke="${C.jacketLine}" stroke-width="3"/>`
    + `<path d="${smooth([[310, 690], [340, 700], [372, 742], [390, 770]])}" fill="none" stroke="${C.jacketDeep}" stroke-width="2" opacity=".7"/>`
    + `<path d="${edge}" fill="none" stroke="${C.cyan}" stroke-width="2" opacity=".75"/><path d="${mirrorPath(edge)}" fill="none" stroke="${C.cyan}" stroke-width="2" opacity=".45"/>`
    + `<path d="${taper([[322, 640], [318, 690], [328, 734]], { w: 6, start: 0.2, end: 0, peak: 0.4 })}" fill="#9aa3b6" opacity=".6"/>`;
  // drawcords with orange cord-locks
  s += `<path d="M386,700Q380,750 382,792M446,700Q454,744 450,782" fill="none" stroke="${C.jacketLine}" stroke-width="5" stroke-linecap="round"/>`
    + `<path d="M386,700Q380,750 382,792M446,700Q454,744 450,782" fill="none" stroke="#c9d0dc" stroke-width="2.6" stroke-linecap="round"/>`
    + `<rect x="375" y="776" width="14" height="20" rx="5" fill="${C.orange}" stroke="${C.orangeLine}" stroke-width="2"/><rect x="443" y="766" width="14" height="20" rx="5" fill="${C.orangeDeep}" stroke="${C.orangeLine}" stroke-width="2"/>`;
  // zipper + glowing circuit seams
  const teeth = Array.from({ length: 20 }, (_, k) => `M${k % 2 ? 412 : 416},${n(820 + k * 20)}h4`).join('');
  s += `<path d="M416,812V1216" stroke="${C.jacketLine}" stroke-width="6"/><path d="${teeth}" stroke="${C.steelShade}" stroke-width="5"/>`
    + `<rect x="409" y="818" width="14" height="22" rx="3" fill="${C.steel}" stroke="${C.steelLine}" stroke-width="2"/>`
    + `<path d="M416,840V868" stroke="${C.orange}" stroke-width="7" stroke-linecap="round"/><path d="M416,840V868" stroke="${C.orangeLine}" stroke-width="1.4" opacity=".6"/>`;
  const seam = 'M398,812V1216M434,812V1216'
    + 'M398,880H380L366,894V930M398,1010H384L370,1024V1080M434,900H452L466,886V866M434,980H452L468,996V1050M434,1110H450L462,1098';
  const seamNodes = 'M366,930h0M370,1080h0M466,866h0M468,1050h0M462,1098h0';
  s += `<g filter="${p.refs.glow}"><path d="${seam}" fill="none" stroke="${C.cyan}" stroke-width="2.4" stroke-linejoin="round" opacity=".9"/>`
    + `<path d="${seamNodes}" stroke="${C.cyan}" stroke-width="8" stroke-linecap="round"/></g>`
    + `<path d="${seamNodes}" stroke="${C.cyanHot}" stroke-width="3.5" stroke-linecap="round"/>`;
  // chest pocket (her right = viewer's left) with tools
  s += `<path d="M282,914H354L358,998H286Z" fill="${C.jacketShade}" stroke="${C.jacketLine}" stroke-width="2.4"/>`
    + `<path d="M312,930L318,874L328,874L326,932Z" fill="${C.orange}" stroke="${C.orangeLine}" stroke-width="2"/><path d="M320,874L322,850" stroke="${C.steel}" stroke-width="3.4" stroke-linecap="round"/>`
    + `<path d="M334,928L342,890L350,892L346,930Z" fill="${C.cyanDeep}" stroke="${C.jacketLine}" stroke-width="2"/>`
    + `<path d="M278,906H358L360,938H280Z" fill="#4a5162" stroke="${C.jacketLine}" stroke-width="2.4"/>`
    + `<path d="M284,932H354" stroke="${C.jacketLine}" stroke-width="1.2" stroke-dasharray="4 3" opacity=".8"/>`
    + `<rect x="312" y="920" width="16" height="8" rx="2" fill="${C.orange}"/>`;
  // zipped hand-warmer pocket (viewer's left, low on the jacket)
  s += `<path d="M246,1074L318,1170" stroke="${C.jacketLine}" stroke-width="7" stroke-linecap="round"/><path d="M246,1074L318,1170" stroke="${C.steelShade}" stroke-width="2.4" stroke-dasharray="3 3"/>`
    + `<path d="M252,1084l-14,10" stroke="${C.orange}" stroke-width="6" stroke-linecap="round"/>`;
  // blank velcro name tape (viewer's right) and round shoulder badge
  s += `<rect x="462" y="866" width="74" height="26" rx="3" fill="${C.jacketDeep}" stroke="${C.jacketLine}" stroke-width="2"/>`
    + `<rect x="467" y="871" width="64" height="16" rx="2" fill="none" stroke="#5a6274" stroke-width="1.2" stroke-dasharray="3 2"/>`
    + `<circle cx="524" cy="879" r="3" fill="${C.cyan}"/>`
    + `<circle cx="690" cy="912" r="25" fill="${C.jacketDeep}" stroke="${C.jacketLine}" stroke-width="2.4"/>`
    + `<circle cx="690" cy="912" r="19" fill="none" stroke="${C.cyan}" stroke-width="2" opacity=".7"/>`
    + `<path d="M694,897L682,916H692L686,929L700,908H690Z" fill="${C.orange}"/>`;
  return s + sleeveHand(p);
}

// her left hand (viewer's right) raised in an over-long, slouchy sleeve: only the fingertips show, gripping a screwdriver
function sleeveHand(p) {
  const { smooth, n } = p.helpers;
  const pal = p.palette;
  const cx = 590, cy = 968;
  const u = [-0.47, -0.88], v = [0.88, -0.47]; // u: toward the hand, v: across the sleeve
  const at = (a, b, f) => (f ? [cx + u[0] * a + v[0] * b, cy + u[1] * a + v[1] * b, 1] : [cx + u[0] * a + v[0] * b, cy + u[1] * a + v[1] * b]);
  const q = (a, b) => at(a, b).map(n).join(',');
  const sleeve = smooth([at(-300, -74, 1), at(-200, -66), at(-120, -60), at(-62, -54), at(-22, -60), at(12, -52), at(30, -32), at(36, 0), at(32, 28), at(14, 52), at(-22, 60), at(-64, 56), at(-122, 64), at(-200, 72), at(-300, 82, 1)], { closed: true });
  const sg = p.lin('sleeve', [[0, C.jacketLit], [0.5, C.jacket], [1, C.jacketShade]], [...at(-60, -60), ...at(-60, 70)].map(n));
  const fingers = smooth([at(20, -26, 1), at(34, -27), at(40, -19), at(38, -12, 1), at(43, -9), at(45, 0), at(42, 4, 1), at(45, 8), at(44, 16), at(40, 18, 1), at(42, 22), at(38, 29), at(20, 30, 1)], { closed: true });
  const seps = `M${q(37, -12)}L${q(28, -11)}M${q(41, 4)}L${q(30, 4)}M${q(39, 18)}L${q(29, 17)}`;
  const handle = `M${q(18, -10)}L${q(58, -9)}Q${q(64, 0)} ${q(58, 9)}L${q(18, 10)}Z`;
  const cast = smooth([at(-300, 60, 1), at(-150, 70), at(-40, 66), at(0, 58), at(-20, 96), at(-160, 112), [...at(-300, 120), 1]], { closed: true });
  return `<g stroke-linejoin="round">`
    + `<path d="${cast}" fill="${C.jacketDeep}" opacity=".55"/>`
    + `<path d="${sleeve}" fill="${sg}" stroke="${C.jacketLine}" stroke-width="3.2"/>`
    + `<path d="M${q(-280, -66)}Q${q(-150, -60)} ${q(-64, -50)}" fill="none" stroke="#727b8e" stroke-width="3" stroke-linecap="round" opacity=".8"/>`
    // soft bunched folds (S-curves, not rings)
    + `<path d="M${q(-30, -56)}Q${q(-20, -18)} ${q(-44, 10)}T${q(-36, 56)}M${q(-92, -58)}Q${q(-80, -10)} ${q(-100, 24)}T${q(-94, 62)}M${q(-150, -62)}Q${q(-138, -24)} ${q(-158, 18)}M${q(-60, 20)}Q${q(-52, 40)} ${q(-62, 58)}" fill="none" stroke="${C.jacketDeep}" stroke-width="3.2" stroke-linecap="round"/>`
    + `<path d="M${q(-26, -54)}Q${q(-18, -30)} ${q(-30, -10)}M${q(-88, -56)}Q${q(-78, -30)} ${q(-88, -10)}" fill="none" stroke="${C.jacketLit}" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>`
    + `<path d="M${q(-196, -66)}Q${q(-184, 0)} ${q(-196, 72)}" fill="none" stroke="#7d889c" stroke-width="12"/>`
    // shadowed opening of the cuff, screwdriver, fingertips curled over the handle
    + `<path d="M${q(14, -44)}Q${q(40, 0)} ${q(14, 46)}Q${q(22, 0)} ${q(14, -44)}Z" fill="#14171e"/>`
    + `<path d="M${q(58, 0)}L${q(132, 0)}" stroke="${C.steelLine}" stroke-width="7.5" stroke-linecap="round"/><path d="M${q(58, 0)}L${q(132, 0)}" stroke="${C.steel}" stroke-width="4" stroke-linecap="round"/>`
    + `<path d="M${q(64, -1.6)}L${q(128, -1.6)}" stroke="#fff" stroke-width="1.4" opacity=".8"/>`
    + `<path d="${handle}" fill="${C.orange}" stroke="${C.orangeLine}" stroke-width="2.4"/>`
    + `<path d="M${q(22, -6)}L${q(54, -6)}" stroke="#ffd2a8" stroke-width="2.4" stroke-linecap="round"/>`
    + `<path d="${fingers}" fill="${pal.skin}" stroke="${pal.skinLine}" stroke-width="2"/>`
    + `<path d="M${q(24, 12)}L${q(40, 18)}L${q(38, 29)}L${q(22, 29)}Z" fill="${pal.skinShadow}" opacity=".8"/>`
    + `<path d="${seps}" stroke="${pal.skinLine}" stroke-width="1.6" stroke-linecap="round"/>`
    // the sleeve lip overhangs the knuckles
    + `<path d="M${q(4, -50)}Q${q(36, -10)} ${q(30, 6)}Q${q(30, 30)} ${q(6, 52)}" fill="none" stroke="${C.jacketLine}" stroke-width="9" stroke-linecap="round"/>`
    + `<path d="M${q(4, -50)}Q${q(36, -10)} ${q(30, 6)}Q${q(30, 30)} ${q(6, 52)}" fill="none" stroke="#596071" stroke-width="5" stroke-linecap="round"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ wrench hair clip (her right = viewer's left)
function wrenchClip(p) {
  // local frame: box (ring) end at 0,0, handle along +x, open-end jaw at x 86 facing +x
  const body = 'M10,-5L72,-5.5A15,15 0 0 1 99.5,-6.5L90,-6.5A6.5,6.5 0 0 0 90,6.5L99.5,6.5A15,15 0 0 1 72,5.5L10,5A11.2,11.2 0 1 1 10,-5Z'
    + 'M5.5,0L2.8,4.8L-2.8,4.8L-5.5,0L-2.8,-4.8L2.8,-4.8Z';
  const g = p.lin('wrench', [[0, C.steelLit], [0.5, C.steel], [1, C.steelShade]], [0, -12, 0, 12]);
  return `<g transform="translate(286 386) rotate(-68)">`
    // spring bar of the clip peeking out under the wrench
    + `<path d="M14,9L64,10" stroke="${C.steelLine}" stroke-width="4" stroke-linecap="round"/>`
    + `<path d="${body}" fill="${g}" fill-rule="evenodd" stroke="${C.steelLine}" stroke-width="2.6" stroke-linejoin="round"/>`
    + `<path d="M14,-2.5H66M-6,-6A8,8 0 0 1 4,-8.5M78,-11A12,12 0 0 1 92,-12" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>`
    + `<rect x="22" y="-6" width="24" height="12" rx="3" fill="${C.orange}" stroke="${C.orangeLine}" stroke-width="2"/>`
    + `<path d="M25,-3H43" stroke="#ffd2a8" stroke-width="1.6" stroke-linecap="round"/>`
    // worn engraving (the sister's name - abstract scratches, never text)
    + `<path d="M50,-1.5h5M57,-1.5h3M52,2h7M62,1.5h4" stroke="${C.steelShade}" stroke-width="1.2" stroke-linecap="round"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ drone "Zero": fist-sized sphere covered in blank label stickers
function drone(p) {
  const { smooth } = p.helpers;
  const cx = 688, cy = 676, r = 50;
  const shell = p.rad('droneShell', [[0, '#ffffff'], [0.35, '#dfe5ee'], [0.8, '#9aa5b8'], [1, '#5f6a80']], { cx: cx - 16, cy: cy - 18, r: r * 1.35 });
  const lens = p.rad('droneLens', [[0, C.cyanHot], [0.45, C.cyan], [1, '#0d4f70']], { cx: cx - 18, cy: cy - 2, r: 20 });
  const label = (x, y, w, h, a, fill) => `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="2" fill="${fill}" stroke="#5a5040" stroke-width="1.2" transform="rotate(${a} ${x} ${y})"/>`;
  return `<g stroke-linejoin="round">`
    + `<ellipse cx="${cx}" cy="${cy + 74}" rx="34" ry="8" fill="${C.cyan}" opacity=".18" filter="${p.refs.soft}"/>`
    // side rotor pods with blurred blades
    + `<ellipse cx="${cx - 58}" cy="${cy - 22}" rx="26" ry="5" fill="${C.cyanHot}" opacity=".25"/><ellipse cx="${cx + 58}" cy="${cy - 22}" rx="26" ry="5" fill="${C.cyanHot}" opacity=".18"/>`
    + `<path d="M${cx - 44},${cy - 8}L${cx - 58},${cy - 20}M${cx + 44},${cy - 8}L${cx + 58},${cy - 20}" stroke="${C.tiLine}" stroke-width="6" stroke-linecap="round"/>`
    + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${shell}" stroke="${C.tiLine}" stroke-width="3"/>`
    + `<path d="M${cx - r},${cy + 4}Q${cx},${cy + 20} ${cx + r},${cy + 4}" fill="none" stroke="${C.tiShade}" stroke-width="3"/>`
    + label(cx + 16, cy - 30, 22, 12, 18, '#f6efd9') + label(cx + 34, cy - 6, 14, 18, 8, '#f6efd9') + label(cx + 28, cy + 22, 18, 11, -24, C.orange) + label(cx - 6, cy + 34, 20, 10, 8, '#c4f4ff') + label(cx - 36, cy - 26, 15, 10, -30, '#ffe08a') + label(cx + 4, cy - 44, 12, 8, -6, '#ffb38a')
    + `<circle cx="${cx - 14}" cy="${cy - 2}" r="19" fill="${C.tiLine}"/><circle cx="${cx - 14}" cy="${cy - 2}" r="14" fill="${lens}" filter="${p.refs.glow}"/>`
    + `<circle cx="${cx - 12}" cy="${cy}" r="5" fill="#0a2a3c"/><circle cx="${cx - 19}" cy="${cy - 8}" r="4" fill="#fff"/>`
    + `<path d="M${cx + 6},${cy - r + 2}L${cx + 12},${cy - r - 18}" stroke="${C.tiLine}" stroke-width="3" stroke-linecap="round"/><circle cx="${cx + 13}" cy="${cy - r - 21}" r="4.5" fill="${C.orange}" stroke="${C.orangeLine}" stroke-width="1.5"/>`
    + `<path d="M${cx - 30},${cy - 30}A40,40 0 0 1 ${cx - 4},${cy - 42}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`
    + `</g>`;
}
