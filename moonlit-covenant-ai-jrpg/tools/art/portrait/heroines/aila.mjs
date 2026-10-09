// Aila Valhalla - knight of light (光律), Lilith's younger sister. Canon: 设定集/03 §9.
// Drawn as a clearly adult woman (age-appearance 20), cheerful and bold - never flirtatious.
// Signature silhouette: a golden shoulder-length bob with flicked-out ends, side-swept bangs, the
// viewer's-right side tucked behind the ear under a gold eight-ray star clip with blue ribbon tails, and a radiant
// longsword hilt rising over her right shoulder. Blue-and-gold light plate over a white arming coat;
// a short ivory cape on her left shoulder turns back to show its black lining with the gold
// Valhalla crest (a winged shield and sword). Background: golden holy light rays and drifting feathers.
const C = {
  blue: '#3359c2', blueLit: '#6388ec', blueShade: '#233f96', blueDeep: '#152766', blueLine: '#0c1438',
  coat: '#1e2858', coatLit: '#2e3c7c', coatShade: '#121940', coatLine: '#090d26',
  gold: '#f5c84c', goldLit: '#fff0b0', goldMid: '#d9a034', goldDeep: '#9a6418', goldLine: '#4e300c',
  white: '#eef0f8', whiteShade: '#b9bfd8', whiteDeep: '#8a90b0', whiteLine: '#3a3f60',
  cape: '#f2efe6', capeShade: '#c9c2b8', capeDeep: '#9c9290', capeLine: '#4a4048',
  black: '#17131f', blackLit: '#2c2536',
  steel: '#dfe6f6', steelShade: '#9aa6c6', steelLine: '#1c2140',
  sky: '#4f7dff',
};

export default {
  id: 'aila',
  name: '艾拉·瓦尔哈拉',
  palette: {
    accent: '#f5c84c', accent2: '#4f7dff',
    hair: '#f6c854', hairShadow: '#d4952f', hairDeep: '#93561a', hairHighlight: '#fff7c8', hairLine: '#5c330c',
    eyeTop: '#163a8e', eyeBottom: '#7cc4ff', eyeLine: '#15183a',
    skin: '#f9e3d4', skinShadow: '#e5aca3', skinDeep: '#c78a8b', skinLine: '#9a5a58',
    brow: '#8e5a1c', lip: '#d97e7e',
    bgTop: '#0d0c22', bgMid: '#1c1838', bgBottom: '#080614',
  },
  expression: {
    eyeShape: 'almond', open: 1.04, tilt: 3, iris: 1.02, gaze: [0.15, 0],
    browAngle: 0.3, browRaise: 0.15, browWeight: 1.05, mouth: 'grin', mouthWidth: 1.12, blush: 0.34, lowerLid: 0.2,
  },
  costumeLayers: ['bodyBack', 'neckAccessory'],
  layers: {
    bgMotif,
    hairBack,
    bodyBack,
    outfit: armor,
    hairFront,
    headFront: starClip,
  },
};

// ------------------------------------------------------------------ light-weight lock
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
function drawLocks(p, list, { fill, shade, stroke, sw = 2.2, hiFill, shadeOp = 0.85, hiOp = 0.8 }) {
  let s = '';
  for (const [c, w, o = {}] of list) {
    const k = lk(p, c, w, o);
    s += `<path d="${k.d}" fill="${o.fill || fill}" stroke="${stroke}" stroke-width="${sw}"/><path d="${k.shade}" fill="${o.shadeFill || shade}" opacity="${shadeOp}"/>`;
    if (k.hi) s += `<path d="${k.hi}" fill="${hiFill}" opacity="${hiOp}"/>`;
  }
  return s;
}

// ------------------------------------------------------------------ background: holy light rays, halo sigil, drifting feathers
function bgMotif(p) {
  const { n, rng } = p.helpers;
  const cx = 416, cy = 300;
  const glow = p.rad('holy', [[0, '#fff0c0', 0.5], [0.3, '#f5c84c', 0.18], [1, '#f5c84c', 0]], { cx, cy: 360, r: 560 });
  const rayFill = p.rad('rays', [[0, '#ffe7a0', 0.24], [0.45, '#f5c84c', 0.08], [1, '#f5c84c', 0]], { cx, cy, r: 820 });
  const widths = [0.05, 0.11, 0.04, 0.08, 0.13, 0.05, 0.09, 0.04, 0.12, 0.06, 0.1, 0.05, 0.08, 0.12];
  let rays = '', a = -0.2;
  for (const w of widths) {
    rays += `M${cx},${cy}L${n(cx + Math.cos(a) * 1000)},${n(cy + Math.sin(a) * 1000)}L${n(cx + Math.cos(a + w) * 1000)},${n(cy + Math.sin(a + w) * 1000)}Z`;
    a += (Math.PI * 2) / widths.length;
  }
  let ticks = '';
  for (let i = 0; i < 48; i++) {
    const t = (i / 48) * Math.PI * 2, r0 = 318, r1 = i % 4 === 0 ? 338 : 327;
    ticks += `M${n(cx + Math.cos(t) * r0)},${n(360 + Math.sin(t) * r0)}L${n(cx + Math.cos(t) * r1)},${n(360 + Math.sin(t) * r1)}`;
  }
  const feather = (x, y, rot, k) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${k})"><path d="M0,-30C10,-18 9,12 0,30C-9,12 -9,-18 0,-30Z"/><path d="M0,-26V34" stroke="#c8a860" stroke-width="1.4" fill="none"/></g>`;
  const rand = rng('aila-motes');
  let motes = '', big = '';
  for (let i = 0; i < 40; i++) {
    const x = 20 + rand() * 792, y = 30 + rand() * 1000;
    if (i % 5 === 0) big += `M${n(x)},${n(y - 7)}L${n(x + 1.6)},${n(y - 1.6)}L${n(x + 7)},${n(y)}L${n(x + 1.6)},${n(y + 1.6)}L${n(x)},${n(y + 7)}L${n(x - 1.6)},${n(y + 1.6)}L${n(x - 7)},${n(y)}L${n(x - 1.6)},${n(y - 1.6)}Z`;
    else motes += `M${n(x)},${n(y)}h0`;
  }
  return `<rect width="832" height="1216" fill="${glow}"/>`
    + `<path d="${rays}" fill="${rayFill}"/>`
    + `<circle cx="${cx}" cy="360" r="300" fill="none" stroke="#f5c84c" stroke-width="2" opacity=".2"/>`
    + `<circle cx="${cx}" cy="360" r="352" fill="none" stroke="#f5c84c" stroke-width="1.2" opacity=".14"/>`
    + `<path d="${ticks}" stroke="#f5c84c" stroke-width="2" opacity=".22"/>`
    + `<g fill="#fff3d0" opacity=".3">${feather(96, 230, -30, 1.1)}${feather(742, 150, 24, 0.9)}${feather(64, 640, 50, 0.8)}${feather(778, 560, -60, 1)}${feather(120, 960, 20, 0.7)}</g>`
    + `<path d="${motes}" stroke="#ffe7a0" stroke-width="3" stroke-linecap="round" opacity=".5"/>`
    + `<path d="${big}" fill="#fff4cc" opacity=".55"/>`;
}

// ------------------------------------------------------------------ hair (back): bob behind the head, ends flicked out at the shoulders
function hairBack(p) {
  const { smoothQ, taper } = p.helpers;
  const pal = p.palette;
  const mass = smoothQ([[416, 200, 1], [330, 206], [270, 240], [240, 300], [228, 360], [214, 404, 1], [226, 420], [220, 480], [218, 540], [206, 586, 1], [222, 596], [222, 640], [206, 690], [178, 730, 1], [230, 724], [300, 716], [416, 716], [532, 716],
    [600, 722], [652, 730, 1], [622, 690], [610, 640], [612, 600], [626, 560, 1], [612, 540], [612, 470], [606, 420], [620, 380, 1], [602, 360], [590, 300], [562, 240], [502, 206]], { closed: true });
  const ends = [
    [[[250, 420], [240, 520], [232, 610], [216, 680], [178, 730]], 54, { hi: [0.2, 0.4], fill: p.helpers.mix(pal.hair, pal.hairShadow, 0.6) }],
    [[[584, 420], [594, 520], [602, 610], [618, 680], [654, 730]], 54, { hi: [0.2, 0.4] }],
    [[[264, 520], [258, 610], [248, 684], [222, 752]], 42, { fill: pal.hairShadow }],
    [[[568, 520], [576, 610], [586, 684], [612, 752]], 42, { fill: pal.hairShadow }],
    [[[284, 580], [282, 650], [276, 704], [258, 756]], 32, { fill: pal.hairShadow }],
    [[[550, 580], [554, 650], [560, 704], [578, 756]], 32, { fill: pal.hairShadow }],
    [[[566, 430], [570, 520], [570, 600], [560, 680], [540, 720]], 30, { fill: pal.hairShadow }],
  ];
  const strands = [[[256, 300], [238, 400], [232, 500], [226, 600]], [[576, 300], [594, 400], [600, 500], [604, 600]], [[244, 480], [232, 580], [220, 660], [198, 716]], [[260, 560], [252, 640], [240, 700]]]
    .map((c) => taper(c, { w: 2.2, start: 0, end: 0, peak: 0.5 })).join('');
  // a few locks breaking the upper outline so the bob doesn't read as a helmet
  const tufts = [
    [[[300, 220], [262, 248], [238, 290], [224, 336]], 30, { swell: 0.4, start: 0.4 }],
    [[[540, 222], [578, 252], [600, 296], [612, 340]], 30, { swell: 0.4, start: 0.4 }],
  ];
  return `<g stroke-linejoin="round">`
    + drawLocks(p, tufts, { fill: pal.hairShadow, shade: pal.hairDeep, stroke: pal.hairLine, sw: 2.2, shadeOp: 0.7 })
    + `<path d="${mass}" fill="${p.lin('backG', [[0, pal.hairShadow], [0.6, pal.hairDeep]], [0, 200, 0, 740])}" stroke="${pal.hairLine}" stroke-width="3.4"/>`
    + drawLocks(p, ends, { fill: p.helpers.mix(pal.hair, pal.hairShadow, 0.35), shade: pal.hairDeep, stroke: pal.hairLine, sw: 2.2, hiFill: pal.hairHighlight, shadeOp: 0.7, hiOp: 0.6 })
    + `<path d="${strands}" fill="${pal.hairLine}" opacity=".4"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ hair (front): dome, side-swept bangs, face-framing lock, tucked right side
function hairFront(p) {
  const { smooth, taper } = p.helpers;
  const pal = p.palette;
  const domeFill = p.lin('dome', [[0, '#ffd56a'], [0.55, pal.hair], [1, pal.hairShadow]], [300, 180, 540, 420]);
  // the dome stops above the viewer's-right ear (that side is tucked back)
  const dome = smooth([[258, 440], [248, 370], [252, 300], [272, 246], [310, 204], [360, 182], [416, 176], [472, 182], [522, 204], [558, 244], [578, 296], [582, 352], [574, 410],
    [556, 360], [520, 306], [470, 280], [416, 276], [362, 282], [312, 310], [274, 370]], { closed: true });
  const domeShade = smooth([[578, 296], [582, 352], [574, 410], [556, 360], [526, 312], [546, 282], [564, 262]], { closed: true });
  const ringTop = [[262, 316], [282, 266], [322, 228], [380, 206], [440, 202], [500, 210], [546, 234], [572, 276]];
  const ringBot = [[560, 282, 1], [550, 294, 1], [538, 270, 1], [520, 284, 1], [506, 258, 1], [486, 270, 1], [468, 248, 1], [448, 260, 1], [428, 244, 1], [408, 256, 1], [388, 246, 1], [368, 266, 1], [350, 254, 1], [332, 278, 1], [316, 268, 1], [298, 294, 1], [286, 288, 1], [274, 320, 1]];
  const ring = smooth(ringTop.concat(ringBot), { closed: true });
  const style = { fill: pal.hair, shade: pal.hairShadow, stroke: pal.hairLine, sw: 2, hiFill: pal.hairHighlight, shadeOp: 0.8, hiOp: 0.9 };
  const dark = { ...style, fill: pal.hairShadow, shade: pal.hairDeep };
  // face-framing lock on the viewer's left, flicking out at the shoulder
  const sideL = [[[288, 296], [270, 400], [264, 500], [268, 590], [258, 660], [226, 718]], 56, { swell: 0.3, hi: [0.16, 0.3] }];
  const sideL2 = [[[300, 336], [288, 440], [290, 540], [282, 616]], 24];
  const sideL3 = [[[296, 320], [282, 420], [280, 510], [274, 590], [252, 648]], 30, { swell: 0.35, hi: [0.2, 0.34] }];
  // tucked side: a short lock sweeping back over the top of the ear
  const tuck = [[[540, 300], [562, 350], [576, 396], [590, 420]], 30, { swell: 0.4 }];
  const back = [
    [[[440, 214], [372, 240], [318, 290], [292, 362], [286, 444]], 54, { swell: 0.42, start: 0.1 }],
    [[[488, 220], [522, 262], [548, 322], [560, 384]], 44, { swell: 0.42, start: 0.1 }],
  ];
  const bangs = [
    [[[476, 216], [468, 278], [458, 340], [456, 398]], 40],
    [[[466, 214], [430, 268], [404, 330], [394, 404]], 54],
    [[[472, 212], [416, 246], [366, 296], [330, 360], [314, 428]], 70, { swell: 0.36 }],
    [[[480, 216], [436, 236], [390, 260], [350, 300]], 30, { swell: 0.4 }],
  ].map(([c, w, o = {}]) => [c, w, { swell: 0.42, hi: [0.28, 0.5], ...o }]);
  const bangClip = p.clip('bangClip', bangs.map(([c, w, o]) => lk(p, c, w, o).d));
  const rootShade = p.lin('bangRoot', [[0, pal.hairDeep, 0.6], [1, pal.hairDeep, 0]], [0, 214, 0, 272]);
  const wisp = taper([[296, 350], [282, 432], [288, 512], [300, 572]], { w: 4, start: 0.1, end: 0, peak: 0.25 });
  const ahoge = taper([[404, 184], [392, 150], [368, 130], [340, 128], [326, 138]], { w: 13, start: 0.6, end: 0, peak: 0.25 });
  return `<g stroke-linejoin="round">`
    + drawLocks(p, [sideL, sideL3], style)
    + `<path d="${ahoge}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="2.4"/>`
    + `<path d="${dome}" fill="${domeFill}" stroke="${pal.hairLine}" stroke-width="3.4"/>`
    + `<path d="${domeShade}" fill="${pal.hairShadow}" opacity=".75"/>`
    + `<path d="${ring}" fill="${pal.hairHighlight}" opacity=".85"/>`
    + drawLocks(p, [sideL2, tuck], dark)
    + drawLocks(p, back, dark)
    + drawLocks(p, bangs, style)
    + `<g clip-path="${bangClip}"><rect x="250" y="200" width="340" height="80" fill="${rootShade}"/></g>`
    + `<path d="${wisp}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="1.2"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ head: golden eight-ray star clip with blue ribbon tails, above the tucked ear
function starClip(p) {
  const { n, taper, ribbon } = p.helpers;
  const gx = 566, gy = 326;
  let star = '';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2 + 0.2, r = i % 2 ? 9 : (i % 4 === 0 ? 36 : 21);
    star += `${i ? 'L' : 'M'}${n(gx + Math.cos(a) * r)},${n(gy + Math.sin(a) * r)}`;
  }
  // soft ribbon tails fluttering back behind the ear (cloth: wavy, widening to a V-cut end)
  const band = (pts, w0, w1) => ribbon(pts, (t) => { const w = w0 + (w1 - w0) * t; return [w / 2, -w / 2]; }, { samples: 8 });
  const t1 = [[576, 340], [596, 370], [598, 404], [612, 440], [628, 470]];
  const t2 = [[584, 336], [614, 356], [630, 386], [652, 410], [676, 428]];
  const vcut = ([x, y], [px, py], w) => {
    const dx = x - px, dy = y - py, m = Math.hypot(dx, dy), ux = dx / m, uy = dy / m, nx = -uy, ny = ux;
    return `M${n(x + nx * w / 2)},${n(y + ny * w / 2)}L${n(x + ux * 12 + nx * w / 2)},${n(y + uy * 12 + ny * w / 2)}L${n(x + ux * 4)},${n(y + uy * 4)}L${n(x + ux * 12 - nx * w / 2)},${n(y + uy * 12 - ny * w / 2)}L${n(x - nx * w / 2)},${n(y - ny * w / 2)}Z`;
  };
  return `<g stroke-linejoin="round">`
    + `<path d="${band(t2, 10, 18)}${vcut(t2[4], t2[3], 18)}" fill="#2f55c8" stroke="${C.blueLine}" stroke-width="2"/>`
    + `<path d="${band(t1, 11, 19)}${vcut(t1[4], t1[3], 19)}" fill="${C.sky}" stroke="${C.blueLine}" stroke-width="2"/>`
    + `<path d="${taper([[580, 350], [592, 376], [596, 408], [606, 434]], { w: 4, start: 0.4, end: 0, peak: 0.4 })}" fill="#b4caff" opacity=".9"/>`
    + `<path d="M598,396Q606,404 610,416" fill="none" stroke="${C.blueLine}" stroke-width="1.6" opacity=".6"/>`
    + `<circle cx="${gx}" cy="${gy}" r="40" fill="${p.rad('clipGlow', [[0, '#fff3c0', 0.6], [1, '#f5c84c', 0]], { cx: gx, cy: gy, r: 40 })}"/>`
    + `<path d="${star}Z" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="2.4"/>`
    + `<path d="M${n(gx + Math.cos(-Math.PI / 2 + 0.2) * 36)},${n(gy + Math.sin(-Math.PI / 2 + 0.2) * 36)}L${gx - 3},${gy - 4}L${n(gx + Math.cos(Math.PI + 0.2) * 36)},${n(gy + Math.sin(Math.PI + 0.2) * 36)}" fill="none" stroke="${C.goldLit}" stroke-width="2"/>`
    + `<circle cx="${gx}" cy="${gy}" r="8" fill="${C.sky}" stroke="${C.goldLine}" stroke-width="2"/><circle cx="${gx - 2.4}" cy="${gy - 2.6}" r="2.4" fill="#fff"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ behind the body: short cape + radiant longsword on the back
function bodyBack(p) {
  const { n } = p.helpers;
  // sword: guard just above the viewer's-left shoulder, grip and pommel rising up and out
  const gx = 198, gy = 704, ang = (-118 * Math.PI) / 180;
  const ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux;
  const P = (a, b) => `${n(gx + ux * a + vx * b)},${n(gy + uy * a + vy * b)}`;
  const blade = `M${P(-6, -13)}L${P(-80, -12)}L${P(-80, 12)}L${P(-6, 13)}Z`;
  const grip = `M${P(12, -12)}L${P(128, -11)}L${P(128, 11)}L${P(12, 12)}Z`;
  const wraps = Array.from({ length: 6 }, (_, k) => `M${P(20 + k * 18, -10)}L${P(30 + k * 18, 10)}`).join('');
  const guard = `M${P(0, -72)}Q${P(-14, -60)} ${P(-6, -46)}Q${P(8, -28)} ${P(10, -14)}L${P(10, 14)}Q${P(8, 28)} ${P(-6, 46)}Q${P(-14, 60)} ${P(0, 72)}L${P(-16, 74)}Q${P(-28, 56)} ${P(-18, 40)}Q${P(-10, 22)} ${P(-12, 0)}Q${P(-10, -22)} ${P(-18, -40)}Q${P(-28, -56)} ${P(-16, -74)}Z`;
  const pommel = `M${P(128, -14)}L${P(144, -17)}L${P(166, 0)}L${P(144, 17)}L${P(128, 14)}Z`;
  const px = gx + ux * 146, py = gy + uy * 146;
  const halo = p.rad('swordHalo', [[0, '#fffbe8', 0.9], [0.18, '#ffe7a0', 0.55], [1, '#f5c84c', 0]], { cx: px, cy: py, r: 90 });
  const halo2 = p.rad('swordHalo2', [[0, '#ffe7a0', 0.35], [1, '#f5c84c', 0]], { cx: gx + ux * 50, cy: gy + uy * 50, r: 120 });
  const spark = (x, y, r) => `M${n(x)},${n(y - r)}L${n(x + r * 0.16)},${n(y - r * 0.16)}L${n(x + r)},${n(y)}L${n(x + r * 0.16)},${n(y + r * 0.16)}L${n(x)},${n(y + r)}L${n(x - r * 0.16)},${n(y + r * 0.16)}L${n(x - r)},${n(y)}L${n(x - r * 0.16)},${n(y - r * 0.16)}Z`;
  return `<rect width="832" height="1000" fill="${halo2}"/>`
    + `<g stroke-linejoin="round">`
    + `<path d="${blade}" fill="${C.steel}" stroke="${C.steelLine}" stroke-width="2.4"/><path d="M${P(-6, 0)}L${P(-80, 0)}" stroke="${C.steelShade}" stroke-width="2.4"/>`
    + `<path d="${grip}" fill="${C.blueDeep}" stroke="${C.blueLine}" stroke-width="2.4"/>`
    + `<path d="${wraps}" stroke="${C.goldMid}" stroke-width="3"/>`
    + `<path d="${guard}" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="2.6"/>`
    + `<path d="M${P(-4, -54)}Q${P(-10, -46)} ${P(-4, -38)}Q${P(4, -26)} ${P(4, -12)}" fill="none" stroke="${C.goldLit}" stroke-width="2.4" stroke-linecap="round"/>`
    + `<circle cx="${n(gx)}" cy="${n(gy)}" r="15" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="2.4"/><circle cx="${n(gx)}" cy="${n(gy)}" r="9" fill="${C.sky}" stroke="${C.goldLine}" stroke-width="1.8"/><circle cx="${n(gx - 2.6)}" cy="${n(gy - 2.6)}" r="2.8" fill="#fff" opacity=".9"/>`
    + `<path d="${pommel}" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="2.4"/>`
    + `<path d="M${P(132, -10)}L${P(146, -12)}L${P(160, 0)}" fill="none" stroke="${C.goldLit}" stroke-width="2"/>`
    + `<circle cx="${n(px)}" cy="${n(py)}" r="90" fill="${halo}"/>`
    + `<path d="${spark(px, py, 30)}${spark(px + 40, py - 30, 9)}" fill="#fffbe8"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ armour
function armor(p) {
  const { smooth, taper, mirrorPath } = p.helpers;
  const coat = p.lin('coat', [[0, C.coatLit], [0.5, C.coat], [1, C.coatShade]], [0, 700, 0, 1216]);
  let s = `<g clip-path="${p.refs.bodyClip}"><rect y="660" width="832" height="560" fill="${coat}"/>`
    + `<path d="M150,980Q170,1020 160,1070M206,960Q218,1000 210,1060" fill="none" stroke="${C.coatLit}" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>`
    + `<path d="M140,1110Q190,1124 236,1110" fill="none" stroke="${C.gold}" stroke-width="3" opacity=".8"/>`
    + `</g>`;
  // high white collar with gold trim
  const collar = smooth([[360, 626, 1], [388, 638], [416, 642], [444, 638], [472, 626, 1], [482, 712, 1], [416, 728], [350, 712, 1]], { closed: true });
  s += `<path d="${collar}" fill="${p.lin('collar', [[0, C.white], [0.5, C.white], [1, C.whiteShade]], [360, 0, 480, 0])}" stroke="${C.whiteLine}" stroke-width="3"/>`
    + `<path d="M442,639L472,626L482,712L454,720Z" fill="${C.whiteShade}" opacity=".8"/>`
    + `<path d="M362,634Q416,654 470,634" fill="none" stroke="${C.goldMid}" stroke-width="4"/>`
    + `<path d="M362,631Q416,650 470,631" fill="none" stroke="${C.goldLit}" stroke-width="1.6"/>`;
  // breastplate: lit left half, shaded right half, central ridge, gold edging + filigree
  const plateL = smooth([[416, 744, 1], [370, 748], [326, 760], [292, 786], [282, 850], [290, 930], [306, 1010], [320, 1100], [326, 1216, 1], [416, 1216, 1]], { closed: true });
  const metalL = p.lin('plateL', [[0, C.blueLit], [0.35, C.blue], [0.8, C.blueShade], [1, C.blueDeep]], [300, 740, 420, 1150]);
  const metalR = p.lin('plateR', [[0, C.blue], [0.45, C.blueShade], [1, C.blueDeep]], [420, 760, 540, 1100]);
  const plateClip = p.clip('plateClip', [plateL, mirrorPath(plateL)]);
  const fil = smooth([[400, 776], [352, 782], [318, 804], [308, 850], [318, 900]]);
  s += `<path d="${plateL}" fill="${metalL}" stroke="${C.blueLine}" stroke-width="3.2"/>`
    + `<path d="${mirrorPath(plateL)}" fill="${metalR}" stroke="${C.blueLine}" stroke-width="3.2"/>`
    + `<g clip-path="${plateClip}">`
    + `<path d="M270,904Q350,928 416,922V962Q350,966 270,944Z" fill="${C.blueShade}" opacity=".7"/>`
    + `<path d="M562,904Q482,928 416,922V962Q482,966 562,944Z" fill="${C.blueDeep}" opacity=".75"/>`
    + `<path d="M270,898Q350,920 416,914" fill="none" stroke="#fff" stroke-width="2.4" opacity=".45"/>`
    + `<path d="M270,1000Q350,1030 416,1026V1216H270Z" fill="${C.blueDeep}" opacity=".35"/>`
    + `</g>`
    + `<path d="${taper([[310, 780], [292, 830], [292, 910], [304, 990]], { w: 6, start: 0.2, end: 0, peak: 0.3 })}" fill="${C.blueLit}"/>`
    + `<path d="${taper([[350, 960], [340, 1010], [346, 1060]], { w: 14, start: 0.1, end: 0, peak: 0.4 })}" fill="#fff" opacity=".18"/>`
    + `<path d="M416,748V1216" stroke="${C.blueLit}" stroke-width="2.2" opacity=".7"/><path d="M419,750V1216" stroke="${C.blueLine}" stroke-width="2" opacity=".5"/>`
    + `<path d="${fil}${mirrorPath(fil)}" fill="none" stroke="${C.gold}" stroke-width="2.2" opacity=".85"/>`
    + `<path d="M318,900q-8,16 4,26q10,-10 -4,-26M514,900q8,16 -4,26q-10,-10 4,-26" fill="${C.gold}" opacity=".85"/>`;
  const edge = smooth([[416, 744], [370, 748], [326, 760], [292, 786], [282, 850], [290, 930], [306, 1010], [320, 1100], [326, 1216]]);
  s += `<path d="${edge}${mirrorPath(edge)}" fill="none" stroke="${C.goldLine}" stroke-width="8"/>`
    + `<path d="${edge}" fill="none" stroke="${C.gold}" stroke-width="4"/><path d="${mirrorPath(edge)}" fill="none" stroke="${C.goldMid}" stroke-width="4"/>`
    // plackart (lower plate) overlapping the breastplate
    + `<path d="M306,1012Q416,1050 526,1012L532,1060Q416,1098 300,1060Z" fill="${C.blueShade}" stroke="${C.blueLine}" stroke-width="2.6"/>`
    + `<path d="M306,1012Q416,1050 526,1012" fill="none" stroke="${C.gold}" stroke-width="3.4"/>`;
  s += `<circle cx="416" cy="866" r="44" fill="${p.rad('emGlow', [[0, '#fff3c0', 0.55], [1, '#f5c84c', 0]], { cx: 416, cy: 866, r: 44 })}"/>` + sunEmblem(p, 416, 866);
  // gorget lame
  const g1 = smooth([[352, 700, 1], [416, 716], [480, 700, 1], [514, 722], [540, 752, 1], [470, 762], [416, 768], [362, 762], [292, 752, 1], [318, 722]], { closed: true });
  s += `<path d="${g1}" fill="${metalL}" stroke="${C.blueLine}" stroke-width="3"/>`
    + `<path d="${smooth([[480, 700, 1], [514, 722], [540, 752, 1], [470, 762], [446, 764], [470, 740], [484, 716]], { closed: true })}" fill="${C.blueDeep}" opacity=".7"/>`
    + `<path d="M300,750Q360,764 416,766Q472,764 532,750" fill="none" stroke="${C.gold}" stroke-width="3.6"/>`
    + `<path d="M306,744Q340,722 380,720" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>`;
  s += pauldron(p);
  s += capeDrape(p);
  return s;
}

function sunEmblem(p, cx, cy) {
  // original holy-light emblem: an eight-ray star inside a ring (no third-party marks)
  const { n } = p.helpers;
  let star = '';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2, r = i % 2 === 0 ? (i % 4 === 0 ? 36 : 25) : 9;
    star += `${i ? 'L' : 'M'}${n(cx + Math.cos(a) * r)},${n(cy + Math.sin(a) * r)}`;
  }
  return `<circle cx="${cx}" cy="${cy}" r="23" fill="none" stroke="${C.goldLine}" stroke-width="7"/><circle cx="${cx}" cy="${cy}" r="23" fill="none" stroke="${C.goldMid}" stroke-width="3.4"/>`
    + `<path d="${star}Z" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="2.2" stroke-linejoin="round"/>`
    + `<path d="M${cx},${cy - 36}L${cx - 4},${cy - 8}L${cx - 25},${cy - 18}" fill="none" stroke="${C.goldLit}" stroke-width="1.6" opacity=".9"/>`
    + `<circle cx="${cx}" cy="${cy}" r="6.5" fill="${C.sky}" stroke="${C.goldLine}" stroke-width="1.6"/>`;
}

function pauldron(p) {
  // light rounded pauldron on the viewer's left (the right one sits under the cape)
  const { smooth, taper } = p.helpers;
  const f = p.lin('pauld', [[0, C.blueLit], [0.5, C.blue], [1, C.blueShade]], [150, 740, 260, 880]);
  const lame2 = smooth([[116, 914, 1], [162, 908], [218, 898], [262, 878], [266, 902], [220, 928], [162, 940], [120, 944]], { closed: true });
  const lame = smooth([[112, 880, 1], [160, 874], [214, 866], [258, 846], [266, 876], [218, 900], [160, 910], [116, 914]], { closed: true });
  const plate = smooth([[300, 770], [258, 750], [206, 744], [160, 758], [128, 790], [112, 834], [108, 878, 1], [156, 872], [210, 862], [256, 844], [294, 822]], { closed: true });
  const rim = 'M110,870Q156,864 210,856Q250,844 290,820';
  return `<path d="${lame2}" fill="${C.blueDeep}" stroke="${C.blueLine}" stroke-width="2.6"/>`
    + `<path d="${lame}" fill="${C.blueShade}" stroke="${C.blueLine}" stroke-width="2.8"/>`
    + `<path d="M118,938Q162,932 218,922Q246,910 262,898M116,906Q160,902 214,892Q244,880 262,866" fill="none" stroke="${C.gold}" stroke-width="2.6"/>`
    + `<path d="${plate}" fill="${f}" stroke="${C.blueLine}" stroke-width="3.4"/>`
    + `<path d="${smooth([[128, 790], [112, 834], [108, 878, 1], [156, 872], [184, 864], [170, 832], [152, 804]], { closed: true })}" fill="${C.blueDeep}" opacity=".45"/>`
    + `<path d="${rim}" fill="none" stroke="${C.goldLine}" stroke-width="8" stroke-linecap="round"/>`
    + `<path d="${rim}" fill="none" stroke="${C.gold}" stroke-width="4" stroke-linecap="round"/>`
    + `<path d="M130,796Q166,766 214,756Q264,754 298,776" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`
    + `<path d="${taper([[220, 772], [250, 786], [276, 808]], { w: 10, start: 0.1, end: 0, peak: 0.4 })}" fill="#fff" opacity=".3"/>`
    // gold four-ray star stud + engraved inner line
    + `<path d="M142,836Q176,800 236,790" fill="none" stroke="${C.goldMid}" stroke-width="2" opacity=".75"/>`
    + `<path d="M186,800L190,812L202,816L190,820L186,832L182,820L170,816L182,812Z" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="1.6" stroke-linejoin="round"/>`;
}

function crest(p, cx, cy, s) {
  // Valhalla family crest, black-gold: a heater shield with a sword, flanked by two wings
  const { n } = p.helpers;
  const T = (d) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${n(cx + x * s)},${n(cy + y * s)}`);
  const wing = 'M-14,-14C-30,-28 -50,-30 -64,-24C-56,-20 -50,-14 -48,-8C-56,-8 -60,-2 -62,4C-52,2 -44,4 -38,10C-44,12 -46,18 -46,22C-34,16 -22,14 -16,16Z';
  const shield = 'M-16,-18L16,-18L16,6C16,20 6,30 0,34C-6,30 -16,20 -16,6Z';
  const sword = 'M0,-34L0,30M-9,-14L9,-14';
  const wingR = wing.replace(/(-?\d+(?:\.\d+)?),/g, (_, x) => `${-x},`);
  return `<path d="${T(wing)}${T(wingR)}" fill="${C.goldDeep}" stroke="${C.gold}" stroke-width="${n(2.4 * s)}" stroke-linejoin="round"/>`
    + `<path d="${T(shield)}" fill="${C.blackLit}" stroke="${C.gold}" stroke-width="${n(2.8 * s)}" stroke-linejoin="round"/>`
    + `<path d="${T(sword)}" stroke="${C.gold}" stroke-width="${n(3.4 * s)}" stroke-linecap="round"/>`;
}

function capeDrape(p) {
  // short ivory cape over the viewer's-right shoulder; its front edge is turned back so the black
  // lining with the gold Valhalla crest faces the viewer
  const { smooth, taper } = p.helpers;
  const drape = smooth([[530, 748, 1], [590, 740], [646, 756], [690, 792], [714, 846], [724, 910], [730, 992, 1], [680, 1004], [606, 1016, 1], [586, 940], [562, 860], [544, 792]], { closed: true });
  const lining = smooth([[532, 752, 1], [584, 772], [638, 816], [680, 878], [702, 946], [710, 998, 1], [606, 1016, 1], [586, 940], [562, 860], [544, 792]], { closed: true });
  const capeG = p.lin('capeF', [[0, C.cape], [0.5, C.capeShade], [1, C.capeDeep]], [560, 750, 740, 1000]);
  const linG = p.lin('lining', [[0, C.blackLit], [1, C.black]], [560, 760, 700, 1000]);
  return `<path d="${drape}" fill="${capeG}" stroke="${C.capeLine}" stroke-width="3.2"/>`
    + `<path d="M596,746Q652,762 690,800" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`
    + `<path d="M534,744Q600,734 652,752Q696,778 718,836" fill="none" stroke="${C.goldMid}" stroke-width="3.4"/>`
    + `<path d="${lining}" fill="${linG}" stroke="${C.capeLine}" stroke-width="2.6"/>`
    + `<path d="M536,756Q586,776 638,820Q680,880 700,946Q708,976 708,996" fill="none" stroke="${C.gold}" stroke-width="3.4"/>`
    + `<path d="M608,1012L710,996" fill="none" stroke="${C.gold}" stroke-width="3"/>`
    + `<path d="M570,840Q590,900 600,960" fill="none" stroke="${C.blackLit}" stroke-width="3" opacity=".9"/>`
    + crest(p, 640, 920, 0.78)
    // gold clasp with a blue stone
    + `<circle cx="530" cy="750" r="17" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="2.6"/><circle cx="530" cy="750" r="8.5" fill="${C.sky}" stroke="${C.goldLine}" stroke-width="1.6"/><circle cx="527" cy="747" r="2.6" fill="#fff"/>`
    + `<path d="${taper([[517, 738], [526, 733], [537, 734]], { w: 3, start: 0.3, end: 0, peak: 0.5 })}" fill="${C.goldLit}"/>`;
}
