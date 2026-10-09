// Serena Nox - the eclipse observer. Canon: docs/CHARACTER-DESIGN.md section 3.
// Adult (age-appearance 26), drawn modest. Signature silhouette: very long silky straight
// purple-black hair whose lengths fade to moon-white, a thin braid on her left (viewer's right)
// threaded with a silver moon-phase disc (waning gibbous), calm half-lidded scrutiny.
// Matte velvet robe with silver orbit-equation seals; closed-eyelid pendant.
const C = {
  robe: '#241b38', robeLit: '#3a2d58', robeShade: '#160f24', robeDeep: '#0d0918', robeLine: '#08060f',
  silver: '#c9cde0', silverLit: '#f4f4fb', silverShade: '#8a8fa8', silverDeep: '#575b76', silverLine: '#1c1a2c',
  moonW: '#efe9ff', violet: '#b58cff', warm: '#ffe6c4',
};

export default {
  id: 'serena',
  name: '塞蕾娜·诺克斯',
  palette: {
    accent: '#b58cff', accent2: '#efe9ff',
    hair: '#2d2342', hairShadow: '#1d1630', hairDeep: '#110c1e', hairHighlight: '#7d6aae', hairLine: '#0a0714',
    eyeTop: '#3a2a6a', eyeBottom: '#d4c4ff', eyeLine: '#1a1230', lash: '#33284f',
    skin: '#f7e7e3', skinShadow: '#dcb2bd', skinDeep: '#bb8b9f', skinLine: '#8c5c74', skinHighlight: '#fff8f8',
    blush: '#e892ae', lip: '#b48aa8', mouthLine: '#673b60', brow: '#2b2040',
    bgTop: '#0b091c', bgMid: '#181233', bgBottom: '#070614',
  },
  expression: {
    eyeShape: 'narrow', lidDrop: 0.5, gaze: [-0.45, 0.05], browAngle: 0.25, browRaise: -0.08, browWeight: 0.85,
    mouth: 'neutral', mouthWidth: 0.88, blush: 0.14, blushLines: false, lashWeight: 1.15, lashFlick: true, browsOverHair: 0.35,
  },
  costumeLayers: ['bodyBack', 'neckAccessory', 'foreground'],
  layers: {
    bgMotif,
    hairBack,
    outfit: robe,
    neckAccessory: pendant,
    hairFront,
    foreground: gloveHand,
    irisDetail,
  },
};

// ------------------------------------------------------------------ background: eclipse + star-chart rings
function bgMotif(p) {
  const { n, rng } = p.helpers;
  const ex = 604, ey = 214;
  const corona = p.rad('corona', [[0, C.moonW, 0], [0.62, C.moonW, 0], [0.7, C.moonW, 0.55], [0.76, C.violet, 0.25], [1, C.violet, 0]], { cx: ex, cy: ey, r: 150 });
  const ticks = Array.from({ length: 72 }, (_, k) => {
    const a = (k / 72) * Math.PI * 2, r0 = 300, r1 = k % 6 ? 308 : 322;
    return `M${n(ex + Math.cos(a) * r0)},${n(ey + Math.sin(a) * r0)}L${n(ex + Math.cos(a) * r1)},${n(ey + Math.sin(a) * r1)}`;
  }).join('');
  // constellation in the empty space she is looking into
  const stars = [[92, 300], [150, 236], [212, 268], [186, 352], [118, 420], [74, 520], [150, 560]];
  const cons = `M${stars.slice(0, 5).map((s) => s.join(',')).join('L')}M${stars[4].join(',')}L${stars[5].join(',')}L${stars[6].join(',')}`;
  const rand = rng('serena-dust');
  let dust = '';
  for (let i = 0; i < 26; i++) dust += `M${n(rand() * 832)},${n(rand() * 760)}h0`;
  return `<g fill="none" stroke="${C.silver}">`
    + `<circle cx="${ex}" cy="${ey}" r="300" stroke-width="1.6" opacity=".22"/><path d="${ticks}" stroke-width="1.6" opacity=".22"/>`
    + `<circle cx="${ex}" cy="${ey}" r="214" stroke-width="1.2" stroke-dasharray="3 9" opacity=".3"/>`
    + `<circle cx="${ex}" cy="${ey}" r="420" stroke-width="1.2" opacity=".14"/>`
    + `<ellipse cx="${ex}" cy="${ey}" rx="380" ry="120" transform="rotate(-18 ${ex} ${ey})" stroke-width="1.4" opacity=".2"/>`
    + `<ellipse cx="${ex}" cy="${ey}" rx="520" ry="210" transform="rotate(14 ${ex} ${ey})" stroke-width="1.2" stroke-dasharray="14 8" opacity=".14"/>`
    + `<path d="M${ex},${ey - 470}V${ey + 470}M${ex - 470},${ey}H${ex + 300}" stroke-width="1" stroke-dasharray="2 8" opacity=".2"/>`
    + `<path d="${cons}" stroke-width="1.4" opacity=".3"/>`
    + `</g>`
    + `<path d="${stars.filter((_, i) => i % 3 === 0).map((s) => `M${s.join(',')}h0`).join('')}" stroke="${C.moonW}" stroke-width="8" stroke-linecap="round" opacity=".85"/>`
    + `<path d="${stars.filter((_, i) => i % 3 !== 0).map((s) => `M${s.join(',')}h0`).join('')}" stroke="${C.moonW}" stroke-width="5" stroke-linecap="round" opacity=".6"/>`
    + `<path d="M92,288v24M80,300h24" stroke="${C.moonW}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`
    + `<path d="${dust}" stroke="${C.violet}" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>`
    // planets riding the orbits
    + `<circle cx="${n(ex - 214 * 0.94)}" cy="${n(ey + 214 * 0.34)}" r="7" fill="${C.violet}" opacity=".7"/><circle cx="${n(ex + 300 * 0.5)}" cy="${n(ey + 300 * 0.87)}" r="5" fill="${C.moonW}" opacity=".6"/>`
    // the eclipse: dark disc, thin corona, diamond-ring bead
    + `<circle cx="${ex}" cy="${ey}" r="150" fill="${corona}"/>`
    + `<circle cx="${ex}" cy="${ey}" r="98" fill="#0a0818"/><circle cx="${ex}" cy="${ey}" r="98" fill="none" stroke="${C.moonW}" stroke-width="2.4" opacity=".85"/>`
    + `<circle cx="${n(ex - 70)}" cy="${n(ey - 69)}" r="6.5" fill="#fff" filter="${p.refs.glow}"/>`;
}

// ------------------------------------------------------------------ hair (back): the long curtain behind head and shoulders
function hairBack(p) {
  const { smooth, taper } = p.helpers;
  const pal = p.palette;
  const g = p.lin('backLen', [[0, pal.hairShadow], [0.5, pal.hairDeep], [0.8, '#3b3060'], [1, '#8f80c0']], [0, 300, 0, 1216]);
  const mass = smooth([[416, 186], [338, 196], [282, 236], [248, 304], [232, 404], [226, 524], [218, 664], [200, 804], [182, 960], [168, 1100], [162, 1216, 1], [670, 1216, 1], [664, 1100], [650, 960], [632, 804], [614, 664], [606, 524], [600, 404], [584, 304], [550, 236], [494, 196]], { closed: true });
  const strands = [[[300, 420], [290, 600], [270, 800], [246, 1000]], [[532, 420], [542, 600], [562, 800], [586, 1000]]]
    .map((s) => taper(s, { w: 3, start: 0.1, end: 0, peak: 0.5 })).join('');
  return `<path d="${mass}" fill="${g}" stroke="${pal.hairLine}" stroke-width="3" stroke-linejoin="round"/>`
    + `<path d="${strands}" fill="${pal.hairHighlight}" opacity=".25"/>`;
}

// ------------------------------------------------------------------ hair (front): sleek centre-parted curtain bangs + long front lengths
function hairFront(p) {
  const { smooth, taper, lock } = p.helpers;
  const pal = p.palette;
  // long lengths fade from purple-black to moon-white (ink dispersing in water, in reverse)
  const longFill = p.lin('longFill', [[0, pal.hair], [0.3, pal.hair], [0.52, '#4e4078'], [0.76, '#a092d4'], [1, C.moonW]], [0, 540, 0, 1110]);
  const longShade = p.lin('longShade', [[0, pal.hairShadow], [0.3, pal.hairShadow], [0.55, '#3a2f62'], [0.8, '#7a6cb0'], [1, '#c4b8ee']], [0, 540, 0, 1110]);
  const longLine = p.lin('longLine', [[0, pal.hairLine], [0.45, pal.hairLine], [1, '#4a3d78']], [0, 540, 0, 1110]);
  const domeG = p.lin('dome', [[0, '#3c2f58'], [0.5, pal.hair], [1, pal.hairShadow]], [300, 180, 540, 420]);
  const dome = smooth([[262, 440], [254, 356], [262, 292], [290, 238], [340, 200], [416, 182], [492, 200], [542, 238], [570, 292], [578, 356], [570, 440],
    [550, 366], [510, 306], [452, 280], [416, 276], [380, 280], [322, 306], [282, 366]], { closed: true });
  const domeShade = smooth([[570, 292], [578, 356], [570, 440], [550, 366], [524, 318], [544, 296], [560, 284]], { closed: true });
  // silky angel ring: one continuous band broken by the part
  const ringL = smooth([[270, 330], [292, 278], [334, 240], [392, 220], [410, 222, 1], [404, 238, 1], [384, 244], [362, 262, 1], [350, 256, 1], [330, 276, 1], [314, 272, 1], [298, 300, 1], [286, 298, 1], [276, 334, 1]], { closed: true });
  const ringR = smooth([[422, 222, 1], [440, 220], [498, 240], [540, 278], [562, 330, 1], [552, 328, 1], [540, 300, 1], [526, 304, 1], [506, 276, 1], [492, 282, 1], [474, 258, 1], [450, 244], [428, 238, 1]], { closed: true });
  const part = taper([[416, 184], [415, 210], [413, 236]], { w: 7, start: 0.2, end: 0, peak: 0.25 });
  const sweep = [[[404, 196], [360, 210], [316, 244], [288, 290]], [[428, 196], [472, 210], [516, 244], [544, 290]], [[396, 214], [350, 236], [312, 280]], [[436, 214], [482, 236], [520, 280]]]
    .map((s) => taper(s, { w: 2.4, start: 0.1, end: 0, peak: 0.5 })).join('');
  const P = (pts, w, o = {}) => ({ root: pts[0], tip: pts[pts.length - 1], points: pts, w, swell: 0.35, start: 0.3, ...o });
  const LONG = { fill: longFill, shadeFill: longShade, stroke: longLine };
  // long front lengths draped over the shoulders (outer, darker layer first)
  const longBack = [
    P([[276, 290], [246, 450], [234, 620], [222, 760], [202, 900], [184, 1050], [172, 1216]], 54, { swell: 0.5, start: 0.3, ...LONG, shadeFill: pal.hairDeep }),
    P([[556, 290], [586, 450], [598, 620], [610, 760], [630, 900], [648, 1050], [660, 1216]], 54, { swell: 0.5, start: 0.3, ...LONG, shadeFill: pal.hairDeep }),
  ];
  const longFront = [
    P([[290, 270], [264, 420], [256, 560], [262, 690], [266, 820], [258, 960], [246, 1100], [238, 1216]], 74, { swell: 0.45, start: 0.3, ...LONG }),
    P([[542, 270], [568, 420], [576, 560], [570, 690], [566, 820], [574, 960], [586, 1100], [594, 1216]], 74, { swell: 0.45, start: 0.3, ...LONG }),
    P([[296, 330], [284, 460], [284, 590], [294, 720], [302, 860], [298, 980]], 34, { swell: 0.45, ...LONG }),
    P([[536, 330], [548, 460], [548, 590], [540, 720], [532, 860], [536, 980]], 34, { swell: 0.45, ...LONG }),
  ];
  // centre-parted curtain bangs sweeping off the forehead to the cheekbones
  const curtains = [
    P([[408, 224], [366, 258], [326, 312], [298, 380], [286, 446], [282, 506]], 66, { swell: 0.42, start: 0.2 }),
    P([[424, 224], [466, 258], [506, 312], [534, 380], [546, 446], [550, 506]], 66, { swell: 0.42, start: 0.2 }),
    P([[406, 226], [380, 272], [354, 326], [336, 388], [330, 436]], 38, { swell: 0.4, start: 0.2 }),
    P([[426, 226], [452, 272], [478, 326], [496, 388], [502, 436]], 38, { swell: 0.4, start: 0.2 }),
  ];
  const wisps = [
    taper([[410, 230], [400, 300], [394, 362], [396, 412]], { w: 7, start: 0.4, end: 0, peak: 0.3 }),
    taper([[422, 232], [432, 296], [438, 350]], { w: 6, start: 0.4, end: 0, peak: 0.3 }),
    taper([[418, 234], [430, 300], [440, 362], [446, 404]], { w: 5, start: 0.4, end: 0, peak: 0.3 }),
  ].join('');
  // silky sheen streaks running down the long lengths
  const silk = [[[250, 470], [244, 600], [250, 720]], [[276, 640], [282, 760], [278, 860]], [[560, 470], [566, 600], [562, 700]], [[586, 660], [580, 780], [586, 880]], [[214, 760], [204, 880], [194, 980]], [[620, 780], [630, 880], [640, 980]]]
    .map((q) => taper(q, { w: 5, start: 0.1, end: 0, peak: 0.5 })).join('');
  const H = p.helpers.locks;
  const style = { fill: pal.hair, shade: pal.hairShadow, line: pal.hairLine, stroke: pal.hairLine, highlight: pal.hairHighlight, strokeWidth: 2.2, lineOpacity: 0.5, shadeOpacity: 0.85 };
  const curtDs = curtains.map((b) => lock(b.root, b.tip, b).d);
  const curtClip = p.clip('curtClip', curtDs);
  const rootShade = p.lin('curtRoot', [[0, pal.hairDeep, 0.75], [1, pal.hairDeep, 0]], [0, 222, 0, 300]);
  return `<g stroke-linejoin="round">`
    + H(longBack, { ...style, hiOpacity: 0.5 })
    + H(longFront, style)
    + `<path d="${silk}" fill="#cfc4f4" opacity=".35"/>`
    + `<path d="${dome}" fill="${domeG}" stroke="${pal.hairLine}" stroke-width="3.4"/>`
    + `<path d="${domeShade}" fill="${pal.hairShadow}" opacity=".85"/>`
    + `<path d="${sweep}" fill="${pal.hairLine}" opacity=".5"/>`
    + `<path d="${ringL}${ringR}" fill="${pal.hairHighlight}" opacity=".8"/>`
    + `<path d="${part}" fill="${pal.hairDeep}"/>`
    + braid(p)
    + H(curtains.map((b, i) => ({ ...b, hi: i > 1 ? [0.3, 0.5] : [0.22, 0.42] })), { ...style, hi: true, hiOpacity: 0.8 })
    + `<g clip-path="${curtClip}"><rect x="250" y="210" width="340" height="90" fill="${rootShade}"/></g>`
    + `<path d="${wisps}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="1.2"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ thin braid on her left (viewer's right) with the moon-phase disc
function braid(p) {
  const { sampleSpline, n, taper } = p.helpers;
  const pal = p.palette;
  const centre = [[548, 400], [558, 470], [566, 540], [572, 610], [578, 680], [584, 748]];
  const count = 12;
  const c = sampleSpline(centre, count + 1);
  const w = 30;
  const bg = p.lin('braid', [[0, pal.hair], [0.45, '#43366c'], [1, '#c3b7ee']], [0, 400, 0, 760]);
  let segs = '', his = '';
  for (let i = 0; i < count; i++) {
    const a = c[i], b = c[i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
    const nx = dy / m, ny = -dx / m, s = i % 2 ? 1 : -1;
    const k = 1 - (i / count) * 0.3;
    const cx = (a[0] + b[0]) / 2 + nx * s * w * 0.15 * k, cy = (a[1] + b[1]) / 2 + ny * s * w * 0.15 * k;
    const rx = m * 1.02, ry = w * 0.36 * k;
    const ang = Math.atan2(dy, dx) * 57.3 + s * 30;
    segs += `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" transform="rotate(${n(ang)} ${n(cx)} ${n(cy)})"/>`;
    const ux = Math.cos(ang / 57.3), uy = Math.sin(ang / 57.3);
    const vx = uy, vy = -ux; // minor-axis normal (one side)
    const sg = vx + vy < 0 ? 1 : -1; // pick the upper-left facing side
    his += `M${n(cx - ux * rx * 0.45 + vx * sg * ry * 0.45)},${n(cy - uy * rx * 0.45 + vy * sg * ry * 0.45)}L${n(cx + ux * rx * 0.2 + vx * sg * ry * 0.55)},${n(cy + uy * rx * 0.2 + vy * sg * ry * 0.55)}`;
  }
  const end = c[count];
  // moon-phase disc (waning gibbous: lit on the left, a dark sliver on the right) threaded on the braid
  const q = c[5], mx = n(q[0]), my = n(q[1]), r = 20;
  const disc = `<circle cx="${mx}" cy="${my}" r="${r + 6}" fill="${C.silverShade}" stroke="${C.silverLine}" stroke-width="2.4"/>`
    + `<circle cx="${mx}" cy="${my}" r="${r + 3}" fill="none" stroke="${C.silverLit}" stroke-width="2.2" stroke-dasharray="1.6 3.4" opacity=".85"/>`
    + `<circle cx="${mx}" cy="${my}" r="${r}" fill="#17122b" stroke="${C.silverDeep}" stroke-width="1.6"/>`
    + `<path d="M${n(q[0] + 2)},${n(q[1] - r + 2.5)}A${r - 2.5},${r - 2.5} 0 1 0 ${n(q[0] + 2)},${n(q[1] + r - 2.5)}A${n((r - 2.5) * 0.42)},${r - 2.5} 0 0 0 ${n(q[0] + 2)},${n(q[1] - r + 2.5)}Z" fill="${C.moonW}" transform="translate(-4 0)"/>`
    + `<path d="M${n(q[0] - r - 6)},${my}A${r + 6},${r + 6} 0 0 1 ${n(q[0] - 7)},${n(q[1] - r - 5)}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/>`;
  return `<g stroke-linejoin="round">`
    + `<path d="${taper(centre, { w: 30, start: 0.9, end: 0.55, peak: 0.15 })}" fill="${pal.hairDeep}" stroke="${pal.hairLine}" stroke-width="2.4"/>`
    + `<g fill="${bg}" stroke="${pal.hairLine}" stroke-width="2">${segs}</g>`
    + `<path d="${his}" stroke="#9d8fd0" stroke-width="2" stroke-linecap="round" opacity=".75"/>`
    // silver cuff + small brush tip
    + `<path d="M${n(end[0] - 3)},${n(end[1] + 8)}q2,20 9,30q4,-12 5,-28z" fill="#d6cff4" stroke="#5a4d88" stroke-width="1.6"/>`
    + `<rect x="${n(end[0] - 9)}" y="${n(end[1] - 4)}" width="18" height="13" rx="3" fill="${C.silver}" stroke="${C.silverLine}" stroke-width="2" transform="rotate(-6 ${n(end[0])} ${n(end[1])})"/>`
    + `<path d="M${n(end[0] - 6)},${n(end[1])}h10" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`
    + disc
    + `</g>`;
}

// ------------------------------------------------------------------ iris: star-track graduation rings
function irisDetail(p) {
  const { n } = p.helpers;
  const e = p.eye;
  return `<ellipse cx="${n(e.cx)}" cy="${n(e.cy + 1)}" rx="${n(e.rx * 0.56)}" ry="${n(e.ry * 0.56)}" fill="none" stroke="#efe6ff" stroke-width=".9" stroke-dasharray="1.2 2.2" opacity=".75"/>`
    + `<ellipse cx="${n(e.cx)}" cy="${n(e.cy + 1)}" rx="${n(e.rx * 0.84)}" ry="${n(e.ry * 0.84)}" fill="none" stroke="#efe6ff" stroke-width=".7" opacity=".4"/>`;
}

// ------------------------------------------------------------------ robe: matte velvet, silver orbit-equation seals
function seal(p, cx, cy, r, rot, dim) {
  const { n } = p.helpers;
  const op = dim ? 0.6 : 0.95;
  const dot = (a, rr) => `M${n(cx + Math.cos(a) * rr)},${n(cy + Math.sin(a) * rr)}h0`;
  return `<g fill="none" stroke="${C.silver}" opacity="${op}">`
    + `<circle cx="${cx}" cy="${cy}" r="${r}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${n(r * 0.8)}" stroke-width="1.4" stroke-dasharray="2 3"/>`
    + `<ellipse cx="${cx}" cy="${cy}" rx="${n(r * 0.95)}" ry="${n(r * 0.34)}" transform="rotate(${rot + 32} ${cx} ${cy})" stroke-width="1.4"/>`
    + `<ellipse cx="${cx}" cy="${cy}" rx="${n(r * 0.95)}" ry="${n(r * 0.34)}" transform="rotate(${rot - 32} ${cx} ${cy})" stroke-width="1.4"/>`
    + `<path d="M${n(cx)},${n(cy - r * 0.8)}L${n(cx + r * 0.69)},${n(cy + r * 0.4)}L${n(cx - r * 0.69)},${n(cy + r * 0.4)}Z" stroke-width="1.2"/>`
    + `<path d="${dot(rot / 57.3 + 0.5, r * 0.8)}${dot(rot / 57.3 + 2.6, r * 0.8)}${dot(rot / 57.3 + 4.4, r)}" stroke="${C.silverLit}" stroke-width="5" stroke-linecap="round"/>`
    + `<circle cx="${cx}" cy="${cy}" r="3.4" fill="${C.silverLit}" stroke="none"/>`
    + `</g>`;
}

function robe(p) {
  const { smooth, taper, mirrorPath, n } = p.helpers;
  const vel = p.lin('velvet', [[0, C.robeLit], [0.3, C.robe], [1, C.robeShade]], [180, 700, 520, 1150]);
  const velR = p.lin('velvetR', [[0, C.robe], [0.5, C.robeShade], [1, C.robeDeep]], [420, 720, 720, 1100]);
  // base robe: body silhouette, slightly broadened at the shoulders (straight, ruler-like shoulder line)
  const halfL = smooth([[416, 700, 1], [362, 700], [300, 722], [230, 744], [176, 768], [140, 806], [124, 870], [116, 980], [110, 1216, 1], [416, 1216, 1]], { closed: true });
  let s = `<path d="${halfL}" fill="${vel}" stroke="${C.robeLine}" stroke-width="3.4"/><path d="${mirrorPath(halfL)}" fill="${velR}" stroke="${C.robeLine}" stroke-width="3.4"/>`;
  // velvet sheen: light gathers on the turning edges, not the middle
  s += `<path d="${taper([[150, 830], [134, 940], [128, 1080]], { w: 16, start: 0.2, end: 0, peak: 0.3 })}" fill="${C.robeLit}" opacity=".7"/>`
    + `<path d="${taper([[690, 830], [702, 940], [708, 1080]], { w: 12, start: 0.2, end: 0, peak: 0.3 })}" fill="${C.violet}" opacity=".18"/>`;
  // soft velvet folds falling from the mantle
  const folds = [[[300, 950], [306, 1060], [300, 1190]], [[352, 960], [356, 1080], [352, 1200]], [[486, 960], [482, 1080], [488, 1200]], [[540, 950], [536, 1070], [544, 1190]]]
    .map((f) => taper(f, { w: 7, start: 0.1, end: 0, peak: 0.4 })).join('');
  const foldHi = [[[292, 950], [298, 1050]], [[344, 962], [348, 1070]]].map((f) => taper(f, { w: 4, start: 0.1, end: 0, peak: 0.4 })).join('');
  s += `<path d="${folds}" fill="${C.robeDeep}" opacity=".9"/><path d="${foldHi}" fill="${C.robeLit}" opacity=".8"/>`;
  // front opening: overlapping panels with a silver-embroidered border
  const frontEdge = smooth([[416, 720], [420, 860], [426, 1000], [432, 1216]]);
  s += `<path d="${smooth([[416, 720], [420, 860], [426, 1000], [432, 1216], [470, 1216, 1], [462, 1000], [452, 860], [440, 720, 1]], { closed: true })}" fill="${C.robeShade}" opacity=".7"/>`
    + `<path d="${frontEdge}" fill="none" stroke="${C.robeLine}" stroke-width="3"/>`
    + `<path d="${smooth([[402, 724], [406, 860], [412, 1000], [418, 1216]])}" fill="none" stroke="${C.silver}" stroke-width="1.6" opacity=".7"/>`
    + `<path d="${smooth([[392, 724], [396, 860], [402, 1000], [408, 1216]])}" fill="none" stroke="${C.silver}" stroke-width="1.2" stroke-dasharray="2 5" opacity=".6"/>`
    + [880, 960, 1040, 1120].map((y, i) => `<circle cx="${n(398 + (y - 724) * 0.045)}" cy="${y}" r="${i % 2 ? 3 : 5}" fill="none" stroke="${C.silver}" stroke-width="1.4" opacity=".7"/>`).join('');
  // mantle over the shoulders with a pointed, star-chart hem
  const mantleL = smooth([[416, 704, 1], [360, 706], [296, 724], [226, 746], [172, 772], [134, 812], [118, 870, 1], [158, 884, 1], [188, 920, 1], [228, 896, 1], [270, 930, 1], [312, 898, 1], [356, 912, 1], [392, 880, 1], [416, 892, 1]], { closed: true });
  const mantleG = p.lin('mantle', [[0, '#40325f'], [0.4, '#2a2042'], [1, C.robeShade]], [160, 720, 400, 920]);
  const mantleGR = p.lin('mantleR', [[0, '#2a2042'], [0.5, C.robeShade], [1, C.robeDeep]], [420, 720, 700, 920]);
  const hemL = 'M118,870L158,884L188,920L228,896L270,930L312,898L356,912L392,880L416,892';
  const hemPts = [[158, 884], [188, 920], [228, 896], [270, 930], [312, 898], [356, 912], [392, 880]];
  const hemDots = hemPts.map(([x, y]) => `M${x},${y - 14}h0M${832 - x},${y - 14}h0`).join('');
  s += `<path d="${mantleL}" fill="${mantleG}" stroke="${C.robeLine}" stroke-width="3.2"/><path d="${mirrorPath(mantleL)}" fill="${mantleGR}" stroke="${C.robeLine}" stroke-width="3.2"/>`
    + `<path d="${hemL}${mirrorPath(hemL)}" fill="none" stroke="${C.silver}" stroke-width="2.2" transform="translate(0 -8)" opacity=".9"/>`
    + `<path d="${hemL}${mirrorPath(hemL)}" fill="none" stroke="${C.silver}" stroke-width="1.2" transform="translate(0 -20)" opacity=".7"/>`
    + `<path d="${hemDots}" stroke="${C.silverLit}" stroke-width="4.5" stroke-linecap="round" opacity=".85"/>`
    + `<path d="${taper([[300, 728], [230, 750], [176, 778], [140, 820]], { w: 8, start: 0.2, end: 0, peak: 0.4 })}" fill="#5a4a86" opacity=".7"/>`;
  // shoulder seals
  s += seal(p, 160, 842, 34, 0, false) + seal(p, 672, 842, 34, 0, true);
  // high standing collar with silver trim and clasp
  const collar = smooth([[356, 604, 1], [386, 618], [416, 622], [446, 618], [476, 604, 1], [484, 704, 1], [416, 716], [348, 704, 1]], { closed: true });
  const collarG = p.lin('collar', [[0, '#3c2f5a'], [0.5, C.robe], [1, C.robeDeep]], [356, 0, 484, 0]);
  s += `<path d="${collar}" fill="${collarG}" stroke="${C.robeLine}" stroke-width="3"/>`
    + `<path d="M440,620L476,606L484,704L452,712Z" fill="${C.robeDeep}" opacity=".55"/>`
    + `<path d="M360,612Q416,636 472,612" fill="none" stroke="${C.silver}" stroke-width="2.4"/>`
    + `<path d="M352,696Q416,714 480,696" fill="none" stroke="${C.silver}" stroke-width="2"/>`
    + `<path d="M416,622V712" stroke="${C.robeLine}" stroke-width="2.4"/>`
    + `<path d="M416,650L426,662L416,674L406,662Z" fill="${C.silver}" stroke="${C.silverLine}" stroke-width="1.6"/>`;
  return s;
}

// ------------------------------------------------------------------ pendant: a closed silver eyelid with silver-thread lashes
function pendant(p) {
  const { n } = p.helpers;
  const cx = 416, cy = 780;
  const lid = p.lin('lid', [[0, C.silverLit], [0.5, C.silver], [1, C.silverShade]], [cx - 24, cy - 22, cx + 24, cy + 8]);
  const lashes = Array.from({ length: 11 }, (_, k) => {
    const t = (k + 0.5) / 11, x = cx - 36 + 72 * t, y = cy + Math.sin(t * Math.PI) * 9.5;
    const a = Math.PI / 2 - (t - 0.5) * 1.6, L = 8 + Math.sin(t * Math.PI) * 9;
    return `M${n(x)},${n(y)}q${n(Math.cos(a) * L * 0.3)},${n(Math.sin(a) * L * 0.6)} ${n(Math.cos(a) * L - (t - 0.5) * 4)},${n(Math.sin(a) * L)}`;
  }).join('');
  const chain = `M380,706Q392,730 ${cx - 3},${cy - 40}M452,706Q440,730 ${cx + 3},${cy - 40}`;
  return `<path d="${chain}" fill="none" stroke="${C.silverDeep}" stroke-width="2.6"/>`
    + `<path d="${chain}" fill="none" stroke="${C.silverLit}" stroke-width="1.3" stroke-dasharray="2.2 2.2"/>`
    + `<circle cx="${cx}" cy="${cy - 35}" r="5.5" fill="none" stroke="${C.silverLine}" stroke-width="4.4"/><circle cx="${cx}" cy="${cy - 35}" r="5.5" fill="none" stroke="${C.silver}" stroke-width="2.2"/>`
    + `<path d="${lashes}" fill="none" stroke="${C.silverLine}" stroke-width="3" stroke-linecap="round"/>`
    + `<path d="${lashes}" fill="none" stroke="${C.silverLit}" stroke-width="1.4" stroke-linecap="round"/>`
    // the lid: convex upper lid closed down onto a smile-curved lash line, crease floating above
    + `<path d="M${cx - 38},${cy}Q${cx},${cy - 32} ${cx + 38},${cy}Q${cx},${cy + 19} ${cx - 38},${cy}Z" fill="${lid}" stroke="${C.silverLine}" stroke-width="2.4" stroke-linejoin="round"/>`
    + `<path d="M${cx - 38},${cy}Q${cx},${cy + 19} ${cx + 38},${cy}" fill="none" stroke="${C.silverLine}" stroke-width="3.4" stroke-linecap="round"/>`
    + `<path d="M${cx - 26},${cy - 16}Q${cx},${cy - 33} ${cx + 26},${cy - 16}" fill="none" stroke="${C.silverLine}" stroke-width="4.4" stroke-linecap="round"/><path d="M${cx - 26},${cy - 16}Q${cx},${cy - 33} ${cx + 26},${cy - 16}" fill="none" stroke="${C.silver}" stroke-width="2" stroke-linecap="round"/>`
    + `<path d="M${cx - 24},${cy - 4}Q${cx - 6},${cy - 15} ${cx + 10},${cy - 13}" fill="none" stroke="${C.warm}" stroke-width="2.6" stroke-linecap="round"/>`;
}

// ------------------------------------------------------------------ her right hand (viewer's left) in the white half-glove, fingertips at the pendant
function gloveHand(p) {
  const { smooth, taper, n } = p.helpers;
  const pal = p.palette;
  const ang = 32, k = 1.42;
  const tipLocal = [-5 * k, -71 * k];
  const rad = (ang * Math.PI) / 180, cs = Math.cos(rad), sn = Math.sin(rad);
  const rot = ([x, y]) => [x * cs - y * sn, x * sn + y * cs];
  const tipR = rot(tipLocal);
  const tx = 426 - tipR[0], ty = 806 - tipR[1];
  const W = rot([0, 44 * k]).map((v, i) => v + (i ? ty : tx));
  const ax = [-sn, cs]; // from the wrist down the forearm
  const nn = [cs, sn];
  const B = [W[0] + ax[0] * ((1216 - W[1]) / ax[1]), 1216];
  const P = (q, d) => [q[0] + nn[0] * d, q[1] + nn[1] * d];
  const sleeve = smooth([[...P(B, -66), 1], P([(W[0] + B[0]) / 2, (W[1] + B[1]) / 2], -54), [...P(W, -44), 1], [...P(W, 42), 1], P([(W[0] + B[0]) / 2, (W[1] + B[1]) / 2], 56), [...P(B, 70), 1]], { closed: true });
  const sg = p.lin('sleeve', [[0, C.robeLit], [0.45, C.robe], [1, C.robeShade]], [n(P(W, -60)[0]), n(P(W, -60)[1]), n(P(W, 60)[0]), n(P(W, 60)[1])]);
  const cuffIn = `M${P(W, -42).map(n).join(',')}Q${n(W[0] + ax[0] * -12)},${n(W[1] + ax[1] * -12)} ${P(W, 40).map(n).join(',')}Q${n(W[0] + ax[0] * 14)},${n(W[1] + ax[1] * 14)} ${P(W, -42).map(n).join(',')}Z`;
  const band = (d) => `M${P([W[0] + ax[0] * d, W[1] + ax[1] * d], -44).map(n).join(',')}L${P([W[0] + ax[0] * d, W[1] + ax[1] * d], 43).map(n).join(',')}`;
  const fold = taper([P([W[0] + ax[0] * 60, W[1] + ax[1] * 60], -10), P([W[0] + ax[0] * 140, W[1] + ax[1] * 140], -24), P([W[0] + ax[0] * 220, W[1] + ax[1] * 220], -20)], { w: 5, start: 0.2, end: 0, peak: 0.4 });
  // hand in local coordinates: fingers toward -y, back of the hand facing the viewer, thumb on -x.
  // Fingers are drawn as ONE relaxed, closed mass (no gaps) with notch-to-knuckle separation lines.
  const fingers = smooth([[-24, -12, 1], [-25.5, -38], [-24, -56], [-21, -64], [-16, -66], [-12.5, -59, 1], [-10.5, -66], [-6, -71.5], [-1, -70], [1, -60, 1], [3, -64], [8, -66.5], [12, -62.5], [13.5, -53, 1], [16, -56], [20.5, -56], [23.5, -50], [25, -36], [25, -10, 1]], { closed: true });
  const fingerShade = smooth([[25, -10, 1], [25, -36], [23.5, -50], [20.5, -56], [16, -56], [13.5, -53, 1], [12, -62.5], [10, -64], [10.5, -44], [12, -14, 1]], { closed: true });
  const seps = [[[-12.5, -59], [-12, -40], [-11, -18]], [[1, -60], [1.6, -40], [2, -19]], [[13.5, -53], [13.6, -34], [13, -14]]].map((q) => taper(q, { w: 1.9, start: 1, end: 0, peak: 0.05 })).join('');
  const joints = [[[-22, -44], [-15, -44.5]], [[-9, -50], [-2, -50.5]], [[4, -46], [11, -46]], [[16, -40], [22, -39]]].map((q) => taper(q, { w: 1.4, start: 0.3, end: 0.3, peak: 0.5 })).join('');
  const thumb = smooth([[-25, 22, 1], [-32, 6], [-35.5, -14], [-35, -31], [-30.5, -37], [-26.5, -32], [-26, -14], [-23, 2, 1]], { closed: true });
  const glove = smooth([[-25, 46, 1], [23, 46, 1], [27, 20], [26.5, 2], [25, -8, 1], [14, -13], [2, -17.5], [-12, -17], [-25, -12, 1], [-29, -4, 1], [-36, -2], [-38, 6, 1], [-33, 24]], { closed: true });
  const handT = `translate(${n(tx)} ${n(ty)}) rotate(${ang}) scale(${k})`;
  return `<g stroke-linejoin="round">`
    + `<path d="${sleeve}" fill="${sg}" stroke="${C.robeLine}" stroke-width="3.2"/>`
    + `<path d="${fold}" fill="${C.robeDeep}" opacity=".8"/>`
    + `<path d="${cuffIn}" fill="${C.robeDeep}" stroke="${C.robeLine}" stroke-width="2.4"/>`
    + `<g transform="${handT}">`
    + `<path d="${fingers}" fill="${pal.skin}" stroke="${pal.skinLine}" stroke-width="${n(1.6 / k)}"/>`
    + `<path d="${fingerShade}" fill="${pal.skinShadow}" opacity=".85"/>`
    + `<path d="M-21,-60Q-17,-63 -14,-61M-8,-66Q-4,-69 -1,-66" fill="none" stroke="${pal.skinHighlight}" stroke-width="1.6" stroke-linecap="round"/>`
    + `<path d="${seps}" fill="${pal.skinLine}" opacity=".85"/><path d="${joints}" fill="${pal.skinLine}" opacity=".4"/>`
    + `<path d="${thumb}" fill="${pal.skin}" stroke="${pal.skinLine}" stroke-width="${n(1.5 / k)}"/>`
    + `<path d="${glove}" fill="#f3f0fb" stroke="#5f5680" stroke-width="${n(1.6 / k)}"/>`
    + `<path d="M24,-6Q27,16 22,44L8,44Q16,20 10,-14Z" fill="#cfc8e6" opacity=".9"/>`
    + `<path d="M-20,-12Q-24,10 -18,34" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>`
    + `<path d="M-24,34Q0,38 24,34L24,46L-25,46Z" fill="#e2ddf2" stroke="#5f5680" stroke-width="${n(1.4 / k)}"/>`
    + `<circle cx="0" cy="40" r="3.4" fill="${C.silver}" stroke="${C.silverLine}" stroke-width=".9"/><circle cx="0" cy="40" r="5.6" fill="none" stroke="${C.violet}" stroke-width=".8" stroke-dasharray="1 1.4" opacity=".7"/>`
    + `</g>`
    + `<path d="${band(12)}" stroke="${C.silver}" stroke-width="2.4" opacity=".9"/><path d="${band(22)}" stroke="${C.silver}" stroke-width="1.2" stroke-dasharray="3 4" opacity=".75"/>`
    + `</g>`;
}
