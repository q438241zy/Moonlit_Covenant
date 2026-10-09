// Evelyn Starsong (伊芙琳·星歌) - saint of the Holy Church, keeper of the "Pure Bond".
// Canon: 设定集/03 section 7. Drawn as an ADULT woman (age-appearance 20), gentle, shy and modest
// (this overrides the younger age in the setting files).
// Signature silhouette: pale gold, almost white long hair with a loose side braid over her right
// shoulder (viewer's left) ending in a ribbon and a tiny prayer bell; a thin gold circlet with a
// star gem and small white feather wings at the temples; white-and-gold travel dress-armour with
// a priest's stole; eight-pointed star pendant. Shy look: inner brows raised, gaze down and away,
// a small tentative smile. Rose window + stained-glass light rays behind her.
const C = {
  white: '#f6f0e6', whiteShade: '#d2c9df', whiteDeep: '#a198ba', whiteLine: '#554c72',
  gold: '#e8c070', goldLit: '#fff1bc', goldShade: '#b38a40', goldLine: '#6a4a1a',
  blue: '#7fb2ff', blueLit: '#cfe2ff', blueDeep: '#3d6bc0', blueLine: '#1c3168',
  stone: '#1d1834', stoneLit: '#2c2550', lead: '#0d0a1c',
};

export default {
  id: 'evelyn',
  name: '伊芙琳·星歌',
  palette: {
    accent: '#ffd98c', accent2: '#fffaf0',
    hair: '#f4e2b2', hairShadow: '#dcbb7c', hairDeep: '#ad8648', hairHighlight: '#fffbea', hairLine: '#76542a',
    eyeTop: '#1d3a7a', eyeBottom: '#8cc2ff', eyeLine: '#161a33', lash: '#3a2c34',
    skin: '#fbe9df', skinShadow: '#e8b7b2', skinDeep: '#cc939a', skinLine: '#a0646c', skinHighlight: '#fffaf6',
    blush: '#ff98a8', lip: '#e08c94', mouthLine: '#86424e', brow: '#a3824e',
    bgTop: '#0d0b1f', bgMid: '#1c1738', bgBottom: '#080614',
  },
  expression: {
    eyeShape: 'almond', open: 1.02, tilt: 0.5, lidDrop: 0.12, lowerLid: 0.06, iris: 1.02, gaze: [-0.4, 0.4],
    browAngle: -0.75, browRaise: 0.22, browWeight: 0.85, mouth: 'smile', mouthWidth: 0.62,
    blush: 0.52, lashWeight: 1, lashFlick: true, browsOverHair: 0.45,
  },
  costumeLayers: ['bodyBack', 'neckAccessory', 'foreground'],
  layers: {
    bgMotif,
    hairBack,
    outfit: dress,
    neckAccessory: pendant,
    hairFront,
    headFront: circlet,
    foreground: motes,
    irisDetail,
  },
};

// ------------------------------------------------------------------ local helpers
/** eight-pointed star path (long and short rays alternating) */
function star(n, cx, cy, r1, r2, rot = 0, points = 8) {
  let d = '';
  for (let k = 0; k < points * 2; k++) {
    const a = rot + (k * Math.PI) / points - Math.PI / 2, r = k % 2 ? r2 : (k / 2) % 2 ? r1 * 0.72 : r1;
    d += `${k ? 'L' : 'M'}${n(cx + Math.cos(a) * r)},${n(cy + Math.sin(a) * r)}`;
  }
  return `${d}Z`;
}

// ------------------------------------------------------------------ background: cathedral rose window, stained-glass light rays
function bgMotif(p) {
  const { n, rng } = p.helpers;
  const cx = 416, cy = 360, R = 330;
  const panes = ['#3d6bc0', '#c79a3e', '#7a4fb0', '#2f8a9a', '#b8526e', '#4a7fd0'];
  // 16 outer petals, 8 inner petals, a central oculus; each pane a soft jewel tone
  let glass = '';
  for (let k = 0; k < 16; k++) {
    const a0 = (k / 16) * Math.PI * 2, a1 = ((k + 1) / 16) * Math.PI * 2, am = (a0 + a1) / 2;
    const P = (a, r) => `${n(cx + Math.cos(a) * r)},${n(cy + Math.sin(a) * r)}`;
    glass += `<path d="M${P(a0, 200)}L${P(a0, 300)}Q${P(am, 345)} ${P(a1, 300)}L${P(a1, 200)}Q${P(am, 214)} ${P(a0, 200)}Z" fill="${panes[k % 6]}"/>`;
  }
  for (let k = 0; k < 8; k++) {
    const a0 = (k / 8) * Math.PI * 2 + 0.2, a1 = ((k + 1) / 8) * Math.PI * 2 + 0.2, am = (a0 + a1) / 2;
    const P = (a, r) => `${n(cx + Math.cos(a) * r)},${n(cy + Math.sin(a) * r)}`;
    glass += `<path d="M${P(am, 92)}Q${P(a0, 150)} ${P(am, 196)}Q${P(a1, 150)} ${P(am, 92)}Z" fill="${panes[(k + 3) % 6]}"/>`;
  }
  const lead = Array.from({ length: 16 }, (_, k) => {
    const a = (k / 16) * Math.PI * 2;
    return `M${n(cx + Math.cos(a) * 92)},${n(cy + Math.sin(a) * 92)}L${n(cx + Math.cos(a) * R)},${n(cy + Math.sin(a) * R)}`;
  }).join('');
  const glow = p.rad('winGlow', [[0, '#fff3d0', 0.85], [0.3, '#ffd98c', 0.35], [0.7, '#ffd98c', 0.08], [1, '#ffd98c', 0]], { cx, cy, r: R + 40 });
  // god rays falling from the upper left through the glass
  const ray = (x0, w0, x1, w1, op) => `<path d="M${x0},-20L${x0 + w0},-20L${x1 + w1},1240L${x1},1240Z" opacity="${op}"/>`;
  const rays = ray(40, 70, 420, 160, 0.16) + ray(170, 40, 640, 90, 0.12) + ray(-120, 90, 160, 180, 0.1) + ray(300, 26, 860, 60, 0.09);
  const rayG = p.lin('ray', [[0, '#fff6dc', 1], [0.6, '#ffe7b0', 0.5], [1, '#ffd98c', 0]], [0, 0, 300, 1100]);
  // dust motes in the light
  const rand = rng('evelyn-motes');
  let dust = '';
  for (let i = 0; i < 34; i++) dust += `M${n(40 + rand() * 600)},${n(80 + rand() * 900)}h0`;
  return `<circle cx="${cx}" cy="${cy}" r="${R + 22}" fill="${C.stone}"/>`
    + `<g opacity=".62">${glass}</g>`
    + `<circle cx="${cx}" cy="${cy}" r="250" fill="none" stroke="${C.lead}" stroke-width="4"/>`
    + `<circle cx="${cx}" cy="${cy}" r="${R + 40}" fill="${glow}"/>`
    + `<circle cx="${cx}" cy="${cy}" r="90" fill="#ffe9b8" opacity=".55"/>`
    + `<g fill="none" stroke="${C.lead}"><path d="${lead}" stroke-width="7"/><circle cx="${cx}" cy="${cy}" r="${R}" stroke-width="12"/><circle cx="${cx}" cy="${cy}" r="200" stroke-width="6"/><circle cx="${cx}" cy="${cy}" r="92" stroke-width="8"/></g>`
    + `<g fill="none" stroke="#8f7fc0" opacity=".45"><circle cx="${cx}" cy="${cy}" r="${R + 14}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="${R - 8}" stroke-width="2"/></g>`
    // stone piers at the sides
    + `<path d="M-10,1216V120Q30,90 70,120V1216ZM842,1216V120Q802,90 762,120V1216Z" fill="${C.stone}"/>`
    + `<path d="M70,1216V120M762,1216V120" stroke="${C.stoneLit}" stroke-width="4"/>`
    + `<g fill="${rayG}">${rays}</g>`
    + `<path d="${dust}" stroke="#fff3cf" stroke-width="3.4" stroke-linecap="round" opacity=".7"/>`;
}

// ------------------------------------------------------------------ hair (back): long, soft, slightly wavy at the ends
function hairBack(p) {
  const { smooth, taper } = p.helpers;
  const pal = p.palette;
  const g = p.lin('back', [[0, pal.hairShadow], [0.5, pal.hairDeep], [1, '#c9ae78']], [0, 300, 0, 1216]);
  const mass = smooth([[416, 182], [336, 192], [280, 232], [248, 300], [234, 400], [230, 520], [222, 660], [204, 800], [186, 950], [172, 1100], [166, 1216, 1],
    [676, 1216, 1], [672, 1110], [664, 960], [648, 810], [630, 670], [614, 530], [604, 410], [588, 304], [552, 234], [496, 192]], { closed: true });
  const ends = smooth([[166, 1216, 1], [156, 1150], [176, 1180], [168, 1120], [190, 1150]]) + smooth([[676, 1216, 1], [690, 1150], [668, 1176], [680, 1110], [656, 1140]]);
  const strands = [[[296, 420], [286, 600], [266, 800], [244, 1000]], [[540, 420], [552, 600], [574, 800], [600, 1000]], [[580, 500], [600, 700], [626, 900]]]
    .map((s) => taper(s, { w: 3, start: 0.1, end: 0, peak: 0.5 })).join('');
  return `<path d="${mass}" fill="${g}" stroke="${pal.hairLine}" stroke-width="3" stroke-linejoin="round"/>`
    + `<path d="${ends}" fill="none" stroke="${pal.hairLine}" stroke-width="2" opacity=".6"/>`
    + `<path d="${strands}" fill="${pal.hairHighlight}" opacity=".3"/>`;
}

// ------------------------------------------------------------------ hair (front): soft wispy bangs, right side lock, the loose side braid
function hairFront(p) {
  const { smooth, taper, lock } = p.helpers;
  const pal = p.palette;
  const domeG = p.lin('dome', [[0, '#fffaf0'], [0.45, pal.hair], [1, pal.hairShadow]], [300, 180, 540, 420]);
  const dome = smooth([[258, 430], [250, 360], [256, 298], [278, 244], [318, 204], [370, 184], [420, 178], [474, 186], [524, 208], [560, 248], [578, 302], [582, 364], [574, 430],
    [556, 362], [516, 306], [440, 280], [362, 290], [300, 330], [272, 372]], { closed: true });
  const domeShade = smooth([[578, 302], [582, 364], [574, 430], [556, 362], [524, 316], [546, 292], [564, 282]], { closed: true });
  const ring = smooth([[264, 318, 1], [286, 266], [328, 226], [386, 204], [446, 202], [500, 212], [544, 236], [570, 272, 1], [556, 272, 1], [540, 254, 1], [524, 262, 1], [506, 240, 1], [488, 248, 1], [468, 228, 1], [448, 238, 1], [426, 222, 1], [404, 236, 1], [384, 226, 1], [362, 248, 1], [344, 242, 1], [324, 266, 1], [308, 262, 1], [290, 294, 1], [278, 290, 1]], { closed: true });
  const part = taper([[400, 184], [398, 206], [394, 226]], { w: 6, start: 0.2, end: 0, peak: 0.3 });
  const P = (pts, w, o = {}) => ({ root: pts[0], tip: pts[pts.length - 1], points: pts, w, swell: 0.4, start: 0.25, ...o });
  // right side lock (viewer's right) in front of the ear, falling softly onto the chest
  const sideR = P([[548, 300], [570, 410], [580, 520], [580, 630], [584, 740], [594, 830]], 46, { swell: 0.3, curl: -8 });
  const sideR2 = P([[540, 330], [554, 440], [556, 540], [548, 620]], 24);
  // the hair on her right side gathered back toward the braid (covers the viewer's-left ear)
  const gather = P([[290, 290], [262, 380], [252, 450], [258, 512], [270, 548]], 66, { swell: 0.42, start: 0.4 });
  // soft bangs: gentle curves, tips at brow / upper-eye height, a few wisps
  const bangsBack = [
    P([[372, 220], [326, 264], [298, 330], [288, 404]], 48, { swell: 0.45, start: 0.05 }),
    P([[430, 220], [494, 252], [534, 306], [550, 372], [552, 432]], 52, { swell: 0.45, start: 0.05 }),
  ];
  const bangs = [
    P([[388, 222], [348, 262], [322, 318], [310, 390]], 54, { swell: 0.42, curl: -10 }),
    P([[396, 224], [380, 282], [366, 340], [358, 402]], 46, { swell: 0.42, curl: -7 }),
    P([[404, 226], [414, 286], [414, 346], [404, 412]], 44, { swell: 0.42, curl: -8 }),
    P([[412, 224], [450, 268], [474, 326], [484, 396]], 48, { swell: 0.42, curl: 6 }),
    P([[420, 222], [478, 252], [518, 304], [536, 376]], 46, { swell: 0.42, curl: 8 }),
  ];
  const H = p.helpers.locks;
  const style = { fill: pal.hair, shade: pal.hairShadow, line: pal.hairLine, stroke: pal.hairLine, highlight: pal.hairHighlight, strokeWidth: 2, lineOpacity: 0.3, shadeOpacity: 0.62 };
  const bangDs = bangs.map((b) => lock(b.root, b.tip, b).d);
  const bangClip = p.clip('bangClip', bangDs);
  const rootShade = p.lin('bangRoot', [[0, pal.hairDeep, 0.6], [1, pal.hairDeep, 0]], [0, 214, 0, 280]);
  const wisps = [
    taper([[402, 240], [392, 320], [386, 390], [392, 440]], { w: 4.5, start: 0.4, end: 0, peak: 0.3 }),
    taper([[440, 240], [452, 316], [452, 380]], { w: 4, start: 0.4, end: 0, peak: 0.3 }),
    taper([[548, 360], [560, 440], [556, 500]], { w: 4, start: 0.1, end: 0, peak: 0.25 }),
  ].join('');
  return `<g stroke-linejoin="round">`
    + H([sideR].map((b) => ({ ...b, hi: [0.2, 0.36] })), { ...style, hi: true })
    + `<path d="${dome}" fill="${domeG}" stroke="${pal.hairLine}" stroke-width="3.2"/>`
    + `<path d="${domeShade}" fill="${pal.hairShadow}" opacity=".75"/>`
    + `<path d="${ring}" fill="${pal.hairHighlight}" opacity=".9"/>`
    + `<path d="${part}" fill="${pal.hairDeep}"/>`
    + H([sideR2], { ...style, fill: pal.hairShadow, shade: pal.hairDeep })
    + braid(p)
    + H([gather], { ...style, hi: true })
    + H(bangsBack.map((b) => ({ ...b, noLine: true })), { ...style, fill: pal.hairShadow, shade: pal.hairDeep })
    + H(bangs.map((b) => ({ ...b, hi: [0.28, 0.5] })), { ...style, hi: true, hiOpacity: 0.95 })
    + `<g clip-path="${bangClip}"><rect x="250" y="200" width="340" height="80" fill="${rootShade}"/>`
    // angel ring: one sheen band following the curve of the head, teeth on its lower edge
    + `<path d="${smooth([[262, 356, 1], [286, 298], [330, 258], [392, 236], [462, 232], [522, 242], [570, 272, 1], [560, 286, 1], [546, 272, 1], [530, 282, 1], [514, 262, 1], [496, 272, 1], [478, 254, 1], [458, 266, 1], [438, 252, 1], [418, 266, 1], [398, 256, 1], [376, 276, 1], [358, 270, 1], [338, 294, 1], [322, 290, 1], [302, 322, 1], [290, 318, 1], [276, 356, 1]], { closed: true })}" fill="#ffffff" opacity=".75"/></g>`
    + `<path d="${wisps}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="1.1"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ loose side braid over her right shoulder, ribbon + prayer bell
function braid(p) {
  const { sampleSpline, n, taper, smooth } = p.helpers;
  const pal = p.palette;
  const centre = [[270, 490], [264, 570], [270, 650], [286, 730], [300, 810], [310, 890], [314, 952]];
  const count = 13;
  const c = sampleSpline(centre, 40);
  const frame = (u) => {
    const k = Math.max(0, Math.min(39, u * 39)), i = Math.min(38, Math.floor(k)), f = k - i;
    const q = [c[i][0] + (c[i + 1][0] - c[i][0]) * f, c[i][1] + (c[i + 1][1] - c[i][1]) * f];
    const dx = c[i + 1][0] - c[i][0], dy = c[i + 1][1] - c[i][1], m = Math.hypot(dx, dy) || 1;
    return { q, ux: dx / m, uy: dy / m, vx: -dy / m, vy: dx / m };
  };
  const len = p.helpers.pathLength(c);
  const step = len / (count + 0.6);
  let segs = '', shades = '', his = '';
  for (let i = 0; i < count; i++) {
    const s = i % 2 ? 1 : -1;
    const u0 = i * step, W = 68 - (i / count) * 22;
    const G = (du, v) => {
      const F = frame((u0 + du) / len);
      return [F.q[0] + F.ux * (u0 + du - (u0 + du)) + F.vx * v, F.q[1] + F.vy * v];
    };
    // interlocking teardrop lobe: from the outer edge, sweeping down and over the centre line
    const A = G(-0.15 * step, s * 0.5 * W), B = G(0.95 * step, s * 0.46 * W), Cc = G(1.6 * step, -s * 0.06 * W), D = G(0.55 * step, -s * 0.16 * W);
    const lobe = smooth([A, B, [...Cc, 1], D], { closed: true });
    const sh = [B, Cc, D].map((pt, k) => (k === 1 ? [...pt, 1] : [pt[0] + (Cc[0] - pt[0]) * 0.45, pt[1] + (Cc[1] - pt[1]) * 0.45]));
    segs += `<path d="${lobe}"/>`;
    shades += smooth([sh[0], sh[1], sh[2], [(sh[0][0] + sh[2][0]) / 2 - (Cc[0] - (sh[0][0] + sh[2][0]) / 2) * 0.3, (sh[0][1] + sh[2][1]) / 2 - (Cc[1] - (sh[0][1] + sh[2][1]) / 2) * 0.3]], { closed: true });
    const h0 = G(0.05 * step, s * 0.3 * W), h1 = G(0.55 * step, s * 0.18 * W);
    his += `M${n(h0[0])},${n(h0[1])}L${n(h1[0])},${n(h1[1])}`;
  }
  const end = c[39];
  const loose = [taper([[244, 560], [232, 630], [238, 700]], { w: 4, start: 0.2, end: 0, peak: 0.4 }), taper([[338, 800], [350, 860], [350, 920]], { w: 3.4, start: 0.2, end: 0, peak: 0.4 })].join('');
  // tassel tail below the tie
  const tail = `M${n(end[0] - 16)},${n(end[1] + 6)}Q${n(end[0] - 22)},${n(end[1] + 50)} ${n(end[0] - 8)},${n(end[1] + 84)}Q${n(end[0] + 4)},${n(end[1] + 56)} ${n(end[0] + 6)},${n(end[1] + 80)}Q${n(end[0] + 20)},${n(end[1] + 44)} ${n(end[0] + 14)},${n(end[1] + 6)}Z`;
  const bx = end[0] + 30, by = end[1] + 34;
  return `<g stroke-linejoin="round">`
    + `<path d="${taper(centre, { w: 64, start: 0.9, end: 0.55, peak: 0.1 })}" fill="${pal.hairShadow}" stroke="${pal.hairLine}" stroke-width="2.4"/>`
    + `<g fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="2.2">${segs}</g>`
    + `<path d="${shades}" fill="${pal.hairShadow}" opacity=".9"/>`
    + `<path d="${his}" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".85"/>`
    + `<path d="${loose}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="1.1"/>`
    + `<path d="${tail}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="2"/><path d="M${n(end[0] - 4)},${n(end[1] + 14)}Q${n(end[0] - 6)},${n(end[1] + 50)} ${n(end[0] - 6)},${n(end[1] + 70)}" fill="none" stroke="${pal.hairShadow}" stroke-width="2.4"/>`
    // ribbon: star-blue bow with trailing ends
    + `<path d="M${n(end[0])},${n(end[1])}l-30,-16l-4,26zM${n(end[0])},${n(end[1])}l30,-12l2,26z" fill="${C.blue}" stroke="${C.blueLine}" stroke-width="2"/>`
    + `<path d="M${n(end[0] - 4)},${n(end[1] + 4)}l-14,44l12,-4l6,10zM${n(end[0] + 4)},${n(end[1] + 4)}l22,40l-12,0l-2,10z" fill="${C.blueDeep}" stroke="${C.blueLine}" stroke-width="1.8"/>`
    + `<circle cx="${n(end[0])}" cy="${n(end[1] + 2)}" r="7" fill="${C.blueLit}" stroke="${C.blueLine}" stroke-width="1.8"/>`
    // the tiny prayer bell on a gold thread
    + `<path d="M${n(end[0] + 6)},${n(end[1] + 6)}Q${n(bx - 4)},${n(by - 18)} ${n(bx)},${n(by - 10)}" fill="none" stroke="${C.goldShade}" stroke-width="2"/>`
    + `<path d="M${n(bx - 11)},${n(by + 10)}Q${n(bx - 10)},${n(by - 12)} ${n(bx)},${n(by - 12)}Q${n(bx + 10)},${n(by - 12)} ${n(bx + 11)},${n(by + 10)}Z" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="2"/>`
    + `<path d="M${n(bx - 5)},${n(by + 4)}Q${n(bx - 5)},${n(by - 6)} ${n(bx)},${n(by - 8)}" fill="none" stroke="${C.goldLit}" stroke-width="2"/>`
    + `<circle cx="${n(bx)}" cy="${n(by + 12)}" r="3.4" fill="${C.goldShade}" stroke="${C.goldLine}" stroke-width="1.2"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ star-blue iris with a tiny four-point star glint
function irisDetail(p) {
  const { n } = p.helpers;
  const e = p.eye;
  const x = e.cx + e.rx * 0.38, y = e.cy + e.ry * 0.12, r = 4.2;
  return `<path d="M${n(x)},${n(y - r)}Q${n(x + 0.8)},${n(y - 0.8)} ${n(x + r)},${n(y)}Q${n(x + 0.8)},${n(y + 0.8)} ${n(x)},${n(y + r)}Q${n(x - 0.8)},${n(y + 0.8)} ${n(x - r)},${n(y)}Q${n(x - 0.8)},${n(y - 0.8)} ${n(x)},${n(y - r)}Z" fill="#eaf3ff" opacity=".9"/>`;
}

// ------------------------------------------------------------------ circlet with the star gem + small feather wings at the temples
function wing(p, side) {
  const { mirrorPath, smooth } = p.helpers;
  const M = side === 'R' ? mirrorPath : (d) => d;
  // four feathers fanning up and back from a small gold mount on the temple
  const feather = (tip, w) => {
    const [tx, ty] = tip, bx = 270, by = 322;
    const dx = tx - bx, dy = ty - by, m = Math.hypot(dx, dy), nx = -dy / m, ny = dx / m;
    return smooth([[bx + nx * 4, by + ny * 4], [bx + dx * 0.5 + nx * w, by + dy * 0.5 + ny * w], [tx, ty, 1], [bx + dx * 0.55 - nx * w * 0.5, by + dy * 0.55 - ny * w * 0.5], [bx - nx * 4, by - ny * 4]], { closed: true });
  };
  const f = [feather([206, 206], 14), feather([186, 244], 13), feather([178, 284], 12), feather([190, 318], 10)];
  const vein = M('M270,322Q236,270 210,212M270,322Q226,286 190,248M270,322Q220,304 182,286M270,322Q226,322 194,318');
  return f.map((d, i) => `<path d="${M(d)}" fill="${i % 2 ? C.white : '#ffffff'}" stroke="${C.whiteLine}" stroke-width="2"/>`).join('')
    + `<path d="${vein}" fill="none" stroke="${C.whiteDeep}" stroke-width="1.4"/>`
    + `<path d="${M('M262,322Q270,304 284,310Q292,322 284,334Q270,340 262,322Z')}" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="2"/>`
    + `<circle cx="${side === 'R' ? 832 - 276 : 276}" cy="322" r="4" fill="${C.blue}" stroke="${C.blueLine}" stroke-width="1.2"/>`;
}
function circlet(p) {
  const { n } = p.helpers;
  const band = 'M270,320Q300,250 416,238Q532,250 562,320';
  return `<g stroke-linejoin="round">`
    + `<path d="${band}" fill="none" stroke="${p.palette.hairDeep}" stroke-width="10" opacity=".35" transform="translate(2 6)"/>`
    + `<path d="${band}" fill="none" stroke="${C.goldLine}" stroke-width="8.5"/>`
    + `<path d="${band}" fill="none" stroke="${C.gold}" stroke-width="5"/>`
    + `<path d="M276,306Q310,252 416,242" fill="none" stroke="${C.goldLit}" stroke-width="1.8"/>`
    + `<circle cx="416" cy="246" r="26" fill="#cfe2ff" opacity=".45" filter="${p.refs.glow}"/>`
    + `<path d="${star(n, 416, 246, 28, 8)}" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="2"/>`
    + `<path d="${star(n, 416, 246, 15, 5.5, Math.PI / 8, 4)}" fill="${C.blue}" stroke="${C.blueLine}" stroke-width="1.4"/>`
    + `<path d="M410,240L416,232L422,240" fill="none" stroke="#fff" stroke-width="1.8" opacity=".9"/>`
    + wing(p, 'L') + wing(p, 'R')
    + `</g>`;
}

// ------------------------------------------------------------------ white-and-gold travel dress-armour with a priest's stole
function dress(p) {
  const { smooth, taper, mirrorPath, n } = p.helpers;
  const wL = p.lin('whiteL', [[0, '#ffffff'], [0.35, C.white], [1, C.whiteShade]], [150, 740, 420, 1200]);
  const wR = p.lin('whiteR', [[0, C.whiteShade], [0.55, C.whiteShade], [1, C.whiteDeep]], [420, 760, 700, 1150]);
  const halfL = smooth([[416, 700, 1], [360, 702], [298, 722], [232, 746], [182, 772], [150, 812], [134, 880], [126, 1000], [122, 1216, 1], [416, 1216, 1]], { closed: true });
  let s = `<path d="${halfL}" fill="${wL}" stroke="${C.whiteLine}" stroke-width="3.2"/><path d="${mirrorPath(halfL)}" fill="${wR}" stroke="${C.whiteLine}" stroke-width="3.2"/>`;
  // sleeves in a soft lavender-white so the bodice and stole read as the brightest whites
  const sleeveL = smooth([[236, 780, 1], [236, 912], [234, 1216, 1], [120, 1216, 1], [126, 1000], [134, 880], [150, 812], [182, 772]], { closed: true });
  s += `<path d="${sleeveL}" fill="${p.lin('sleeveL', [[0, '#e9e3f0'], [1, '#bdb4d0']], [0, 780, 0, 1216])}"/><path d="${mirrorPath(sleeveL)}" fill="${p.lin('sleeveR', [[0, '#c4bbd6'], [1, '#9890b2']], [0, 780, 0, 1216])}"/>`
    + `<path d="${p.shapes.armSeamL}${p.shapes.armSeamR}" fill="none" stroke="${C.whiteLine}" stroke-width="2.4" opacity=".8"/>`
    + `<path d="M124,1090Q178,1102 234,1092${mirrorPath('M124,1090Q178,1102 234,1092')}" fill="none" stroke="${C.gold}" stroke-width="5"/>`
    + `<path d="M124,1104Q178,1116 234,1106${mirrorPath('M124,1104Q178,1116 234,1106')}" fill="none" stroke="${C.goldShade}" stroke-width="2"/>`;
  const folds = [[[206, 940], [214, 1060], [210, 1190]], [[626, 940], [618, 1060], [622, 1190]], [[296, 980], [300, 1100], [296, 1200]], [[536, 980], [532, 1100], [536, 1200]]]
    .map((f) => taper(f, { w: 6, start: 0.1, end: 0, peak: 0.4 })).join('');
  s += `<path d="${folds}" fill="${C.whiteDeep}" opacity=".6"/>`;
  // bodice: star-blue centre panel with gold edging and a small star row
  const panel = smooth([[386, 760, 1], [446, 760, 1], [458, 1216, 1], [374, 1216, 1]], { closed: true });
  s += `<path d="${panel}" fill="${p.lin('panel', [[0, C.blue], [1, C.blueDeep]], [0, 760, 0, 1216])}" stroke="${C.goldLine}" stroke-width="2.4"/>`
    + `<path d="M390,766L378,1216M442,766L454,1216" stroke="${C.gold}" stroke-width="4"/>`
    + [930, 1010, 1090, 1170].map((y) => `<path d="${star(n, 416, y, 9, 3, 0, 4)}" fill="${C.goldLit}"/>`).join('');
  // priest's stole: white bands edged in gold, hanging from the neck down each side of the bodice
  const stole = smooth([[372, 706, 1], [404, 712], [384, 800], [372, 900], [364, 1000], [356, 1216, 1], [300, 1216, 1], [312, 1000], [322, 880], [336, 770]], { closed: true });
  s += `<path d="${stole}" fill="${C.white}" stroke="${C.goldLine}" stroke-width="2.6"/><path d="${mirrorPath(stole)}" fill="${C.whiteShade}" stroke="${C.goldLine}" stroke-width="2.6"/>`;
  const sEdge = smooth([[338, 772], [324, 880], [314, 1000], [302, 1216]]);
  const sEdge2 = smooth([[396, 716], [380, 800], [368, 900], [360, 1000], [352, 1216]]);
  s += `<path d="${sEdge}${sEdge2}${mirrorPath(sEdge)}${mirrorPath(sEdge2)}" fill="none" stroke="${C.gold}" stroke-width="4.5"/>`
    + [[346, 880], [336, 1000], [328, 1120]].map(([x, y]) => `<path d="${star(n, x, y, 13, 4, 0, 4)}${star(n, 832 - x, y, 13, 4, 0, 4)}" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="1.4"/>`).join('');
  // cast shadows: the braid on the dress, the gorget on the stole/bodice, the spaulders on the sleeves
  s += `<path d="${taper([[290, 560], [292, 650], [306, 730], [320, 810], [330, 890], [334, 960]], { w: 44, start: 0.6, end: 0.3, peak: 0.3 })}" fill="${C.whiteDeep}" opacity=".45"/>`
    + `<path d="M344,738Q416,786 488,738L486,760Q416,800 346,760Z" fill="${C.whiteDeep}" opacity=".5"/>`
    + `<path d="M132,872Q184,866 280,828L284,850Q190,894 134,900Z${mirrorPath('M132,872Q184,866 280,828L284,850Q190,894 134,900Z')}" fill="${C.whiteDeep}" opacity=".55"/>`;
  // light spaulders: rounded white enamel caps with gold rims, one lame below, star-blue gem
  const capL = smooth([[300, 772], [258, 750], [206, 746], [164, 766], [138, 806], [126, 856, 1], [170, 848], [220, 836], [266, 816]], { closed: true });
  const lameL = smooth([[130, 846, 1], [176, 838], [228, 826], [272, 806], [278, 832], [232, 856], [180, 868], [134, 876, 1]], { closed: true });
  const capG = p.lin('cap', [[0, '#ffffff'], [0.5, C.white], [1, C.whiteShade]], [150, 746, 280, 850]);
  s += `<path d="${lameL}" fill="${C.whiteShade}" stroke="${C.whiteLine}" stroke-width="2.6"/><path d="${mirrorPath(lameL)}" fill="${C.whiteDeep}" stroke="${C.whiteLine}" stroke-width="2.6"/>`
    + `<path d="M134,870Q180,862 276,826${mirrorPath('M134,870Q180,862 276,826')}" fill="none" stroke="${C.gold}" stroke-width="3"/>`
    + `<path d="${capL}" fill="${capG}" stroke="${C.whiteLine}" stroke-width="2.8"/><path d="${mirrorPath(capL)}" fill="${C.whiteShade}" stroke="${C.whiteLine}" stroke-width="2.8"/>`
    + `<path d="M130,850Q176,842 264,812${mirrorPath('M130,850Q176,842 264,812')}" fill="none" stroke="${C.gold}" stroke-width="4"/>`
    + `<path d="M150,786Q190,756 250,754" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>`
    + `<path d="M140,812Q150,830 146,848${mirrorPath('M140,812Q150,830 146,848')}" fill="none" stroke="${C.whiteDeep}" stroke-width="2" opacity=".8"/>`
    + `<circle cx="204" cy="796" r="8" fill="${C.blue}" stroke="${C.goldLine}" stroke-width="2.4"/><circle cx="628" cy="796" r="8" fill="${C.blueDeep}" stroke="${C.goldLine}" stroke-width="2.4"/><circle cx="201" cy="793" r="2.6" fill="#fff"/>`;
  // gold gorget at the base of the collar (the "armour" of the travel dress)
  const gorget = smooth([[350, 704, 1], [416, 722], [482, 704, 1], [500, 728], [470, 748], [416, 758], [362, 748], [332, 728]], { closed: true });
  s += `<path d="${gorget}" fill="${p.lin('gorget', [[0, C.goldLit], [0.45, C.gold], [1, C.goldShade]], [340, 700, 490, 760])}" stroke="${C.goldLine}" stroke-width="2.6"/>`
    + `<path d="M348,724Q416,746 484,724" fill="none" stroke="${C.goldShade}" stroke-width="2"/><path d="M352,716Q380,730 410,734" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
  // high collar lined in star blue, gold top trim
  const collar = smooth([[362, 630, 1], [390, 642], [416, 646], [442, 642], [470, 630, 1], [478, 712, 1], [416, 726], [354, 712, 1]], { closed: true });
  s += `<path d="${collar}" fill="${p.lin('collar', [[0, '#ffffff'], [0.55, C.white], [1, C.whiteShade]], [362, 0, 478, 0])}" stroke="${C.whiteLine}" stroke-width="2.8"/>`
    + `<path d="M442,642L470,630L478,712L450,718Z" fill="${C.whiteShade}"/>`
    + `<path d="M364,636Q416,658 468,636" fill="none" stroke="${C.gold}" stroke-width="3.4"/>`
    + `<path d="M356,708Q416,726 476,708" fill="none" stroke="${C.gold}" stroke-width="3"/>`;
  return s;
}

// ------------------------------------------------------------------ eight-pointed star pendant on a fine gold chain
function pendant(p) {
  const { n } = p.helpers;
  const cx = 416, cy = 800;
  const chain = `M386,716Q396,756 ${cx - 4},${cy - 30}M446,716Q436,756 ${cx + 4},${cy - 30}`;
  const gem = p.rad('gem', [[0, '#ffffff'], [0.4, C.blueLit], [1, C.blueDeep]], { cx: cx - 4, cy: cy - 4, r: 14 });
  return `<g stroke-linejoin="round">`
    + `<path d="${chain}" fill="none" stroke="${C.goldShade}" stroke-width="2.4"/><path d="${chain}" fill="none" stroke="${C.goldLit}" stroke-width="1.2" stroke-dasharray="2 2"/>`
    + `<circle cx="${cx}" cy="${cy}" r="34" fill="#ffe9b0" opacity=".45" filter="${p.refs.glow}"/>`
    + `<path d="${star(n, cx, cy, 30, 9)}" fill="${C.gold}" stroke="${C.goldLine}" stroke-width="2.2"/>`
    + `<path d="${star(n, cx, cy, 30, 9).replace(/L[^L]*L[^L]*L[^L]*L[^L]*L[^L]*L[^L]*L[^L]*L[^L]*Z$/, 'Z')}" fill="${C.goldLit}" opacity=".7"/>`
    + `<circle cx="${cx}" cy="${cy}" r="11" fill="${gem}" stroke="${C.blueLine}" stroke-width="1.8"/>`
    + `<circle cx="${cx - 4}" cy="${cy - 4}" r="3" fill="#fff"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ foreground: drifting light motes and two small white feathers
function motes(p) {
  const { smooth } = p.helpers;
  const feather = (x, y, a, s) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="${smooth([[0, -30], [9, -12], [7, 14], [0, 30, 1], [-7, 14], [-9, -12]], { closed: true })}" fill="#ffffff" stroke="${C.whiteLine}" stroke-width="1.6"/><path d="M0,-26Q2,0 0,30" fill="none" stroke="${C.whiteDeep}" stroke-width="1.4"/></g>`;
  return feather(96, 760, -30, 1) + feather(744, 640, 24, 0.8)
    + `<path d="M120,600h0M700,520h0M760,860h0M80,980h0M640,1120h0" stroke="#fff3cf" stroke-width="6" stroke-linecap="round" opacity=".8"/>`;
}
