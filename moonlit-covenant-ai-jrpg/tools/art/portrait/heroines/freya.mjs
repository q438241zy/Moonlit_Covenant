// Freya Frostbloom (芙蕾娅·霜华) - ice mage and tomb keeper of the Ice-Crown chapel.
// Canon: 设定集/03 section 5. Drawn as an adult (age-appearance 24-26), tall, gentle and modest.
// Signature silhouette: long flowing WAVY cyan-blue hair whose tips frost over, an ice-crystal
// comb fanning out of the hair on her right (viewer's left), hair tucked behind her left ear
// with a crystal drop earring, white fur stole over layered northern robes, staff "Spring Sleep"
// (snowflake orb in a crystal cradle) beside her. Gentle, calm smile; warm amber eyes.
const C = {
  robe: '#2b4d7a', robeLit: '#3f6b9f', robeShade: '#1c3456', robeDeep: '#11223b', robeLine: '#0a1526',
  mid: '#7fb0d6', midShade: '#5585b0', midLine: '#22476b',
  inner: '#c4e0f2', innerShade: '#8fb8d6', innerLine: '#3f6688',
  fur: '#f3f8fc', furShade: '#c4d6e6', furDeep: '#90a9c3', furLine: '#56718e',
  frost: '#f2fbff', ice: '#3f8fc4', iceLit: '#c6eeff', iceMid: '#82cbec', iceDeep: '#2a6a9c', iceLine: '#143a5a',
  silver: '#d6e3ee', silverShade: '#8ea5bc', silverLine: '#2a3b52',
  aurora: '#8ff3d6', violet: '#b9a2ff',
};

export default {
  id: 'freya',
  name: '芙蕾娅·霜华',
  palette: {
    accent: '#8fd4f5', accent2: '#f2fbff',
    hair: '#74c0dc', hairShadow: '#4a92b6', hairDeep: '#2b6288', hairHighlight: '#dcf6ff', hairLine: '#173f5c',
    eyeTop: '#6a3315', eyeBottom: '#f6bd6c', eyeLine: '#2a1610', lash: '#2b2232',
    skin: '#fae7de', skinShadow: '#e2b1b0', skinDeep: '#c4909a', skinLine: '#94606c', skinHighlight: '#fff8f4',
    blush: '#f39aa8', lip: '#d08890', mouthLine: '#783a46', brow: '#2c5f80',
    bgTop: '#071022', bgMid: '#12203f', bgBottom: '#060a18',
  },
  expression: {
    eyeShape: 'gentle', gaze: [0.28, 0.05], browAngle: -0.3, browRaise: 0.08, browWeight: 0.9,
    mouth: 'smile', mouthWidth: 0.86, blush: 0.32, lashWeight: 1.1, lashFlick: true, browsOverHair: 0.4,
  },
  costumeLayers: ['bodyBack', 'neckAccessory', 'foreground'],
  layers: {
    bgMotif,
    hairBack,
    outfit: robes,
    neckAccessory: brooch,
    hairFront,
    headFront: crystals,
    foreground: staff,
  },
};

// ------------------------------------------------------------------ local helpers
/** points of a wavy centre line: the spline through ctrl, displaced sideways by a sine */
function wavy(p, ctrl, { amp = 12, waves = 2, phase = 0, count = 12, grow = 1 } = {}) {
  const c = p.helpers.sampleSpline(ctrl, count);
  const disp = [], nrm = [];
  const pts = c.map((q, i) => {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(count - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
    const t = i / (count - 1);
    const o = Math.sin(t * waves * Math.PI * 2 + phase) * amp * Math.min(1, t * 2.5) * (1 + (grow - 1) * t);
    disp.push(o);
    nrm.push([dy / m, -dx / m]);
    return [q[0] + (dy / m) * o, q[1] - (dx / m) * o];
  });
  pts.disp = disp;
  pts.nrm = nrm;
  return pts;
}
/** cel shadow crescents on the inner (concave) side of every bend of a wavy lock */
function waveShade(p, L, k = 0.68) {
  const { profile, taper } = p.helpers;
  const pts = L.points, d = pts.disp, nm = pts.nrm;
  if (!d) return '';
  const wf = profile({ w: L.w, start: L.start ?? 0.3, end: 0, peak: L.swell ?? 0.35 });
  let out = '';
  for (let i = 1; i < pts.length - 1; i++) {
    const a = Math.abs(d[i]);
    if (a < 4 || a < Math.abs(d[i - 1]) || a < Math.abs(d[i + 1])) continue;
    const s = Math.sign(d[i]), hw = wf(i / (pts.length - 1)) / 2;
    const seg = [i - 1, i, i + 1].map((j) => [pts[j][0] - nm[j][0] * s * hw * 0.42, pts[j][1] - nm[j][1] * s * hw * 0.42]);
    out += taper(seg, { w: hw * k, start: 0, end: 0, peak: 0.5, samples: 6 });
  }
  return out;
}
/** a six-armed snowflake glyph as a stroke path */
function flake(p, x, y, r, rot = 0) {
  const { n } = p.helpers;
  let d = '';
  for (let k = 0; k < 6; k++) {
    const a = rot + (k * Math.PI) / 3, ca = Math.cos(a), sa = Math.sin(a);
    const X = (t, s) => n(x + ca * r * t - sa * r * s), Y = (t, s) => n(y + sa * r * t + ca * r * s);
    d += `M${n(x)},${n(y)}L${X(1, 0)},${Y(1, 0)}M${X(0.55, 0)},${Y(0.55, 0)}L${X(0.8, 0.22)},${Y(0.8, 0.22)}M${X(0.55, 0)},${Y(0.55, 0)}L${X(0.8, -0.22)},${Y(0.8, -0.22)}`;
  }
  return d;
}

// ------------------------------------------------------------------ background: aurora over a snowfield, light snowfall
function bgMotif(p) {
  const { n, rng, smooth, sampleSpline } = p.helpers;
  const rand = rng('freya-snow');
  // aurora curtain: the glowing hem curve stacked upward in fading layers (curtains hang vertically, so a
  // vertical translate keeps every layer aligned with the hem), plus rays rising out of it
  const curtain = (name, base, h, col, op, rays) => {
    const ys = base.map((q) => q[1]);
    const g = p.lin(name, [[0, col, 0], [0.6, col, 0.2], [1, col, 0.65]], [0, Math.min(...ys) - h, 0, Math.max(...ys)]);
    const hid = p.id(`${name}Hem`);
    p.def(`<path id="${hid}" d="${smooth(base)}"/>`);
    const bins = [[], [], []];
    for (const q of sampleSpline(base, rays)) {
      const len = h * (0.45 + rand() * 0.7);
      bins[Math.floor(rand() * 3)].push(`M${n(q[0])},${n(q[1] + 4)}l${n(len * 0.12)},${n(-len)}`);
    }
    const r = bins.map((b, k) => `<path d="${b.join('')}" stroke-width="${[3, 6, 10][k]}" opacity="${[0.32, 0.22, 0.14][k]}"/>`).join('');
    // nested layers all resting on the hem, each taller and fainter: they sum to a ramp that is brightest at the hem
    const L = 8;
    let layers = '';
    for (let i = 1; i <= L; i++) {
      const Hi = (h * i) / L;
      layers += `<use href="#${hid}" transform="translate(0 ${n(-Hi / 2)})" stroke-width="${n(Hi)}" opacity="${n(op * 0.076)}"/>`;
    }
    return `<g stroke="${col}">${layers}</g>`
      + `<g stroke="${g}">${r}</g>`
      + `<use href="#${hid}" stroke="${col}" stroke-width="16" opacity="${n(op * 0.5)}" filter="${p.refs.soft}"/>`
      + `<use href="#${hid}" stroke="${p.helpers.lighten(col, 0.55)}" stroke-width="2.4" opacity="${n(op * 0.75)}"/>`;
  };
  const aur = curtain('aurA', [[-40, 380], [140, 318], [300, 352], [460, 280], [610, 310], [740, 236], [880, 262]], 250, C.aurora, 0.9, 18)
    + curtain('aurB', [[-40, 214], [170, 160], [350, 196], [540, 128], [720, 160], [880, 104]], 160, '#8fd4f5', 0.6, 8);
  // distant ice mountains with lit (left) faces, then the snowfield
  const ridge = 'M-10,760L60,720L118,742L196,668L260,736L330,760L420,712L500,740L590,650L660,724L740,700L842,760';
  const litFaces = 'M196,668L170,700L184,712L160,736L210,724ZM590,650L556,690L572,700L544,730L600,712ZM420,712L404,728L416,734L398,750L440,724ZM740,700L722,716L748,712Z';
  const mount = p.lin('mount', [[0, '#1b2e52'], [1, '#0d1730']], [0, 650, 0, 900]);
  const field = p.lin('field', [[0, '#3a5884'], [0.35, '#20375c'], [1, '#0e1a33']], [0, 860, 0, 1216]);
  // snowfall (three depths) + a few crystalline flakes
  const groups = [[], [], []];
  for (let i = 0; i < 36; i++) {
    const x = rand() * 832, y = rand() * 1150, k = rand() < 0.55 ? 0 : rand() < 0.7 ? 1 : 2;
    groups[k].push(`M${n(x)},${n(y)}h0`);
  }
  const snow = groups.map((g, k) => `<path d="${g.join('')}" stroke-width="${[3, 5, 8][k]}" opacity="${[0.5, 0.65, 0.3][k]}"/>`).join('');
  const flakes = [[96, 520, 13, 0.2], [770, 400, 12, 0.35]].map(([x, y, r, a]) => flake(p, x, y, r, a)).join('');
  return `<g fill="none" stroke-linecap="round">${aur}</g>`
    + `<circle cx="132" cy="104" r="26" fill="${C.frost}" opacity=".85" filter="${p.refs.glow}"/><circle cx="142" cy="97" r="23" fill="#0a1530"/>`
    + `<path d="${ridge}L842,900H-10Z" fill="${mount}"/><path d="${litFaces}" fill="#7b9dc8" opacity=".45"/>`
    + `<path d="${ridge}" fill="none" stroke="#a9d2f2" stroke-width="2" opacity=".45"/>`
    + `<path d="M-10,880Q200,850 416,862Q640,872 842,846V1216H-10Z" fill="${field}"/>`
    + `<path d="M-10,880Q200,850 416,862Q640,872 842,846" fill="none" stroke="#bfe4ff" stroke-width="2.4" opacity=".5"/>`
    + `<g stroke="${C.frost}" stroke-linecap="round" fill="none">${snow}</g>`
    + `<path d="${flakes}" fill="none" stroke="${C.frost}" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>`;
}

// ------------------------------------------------------------------ hair (back): voluminous wavy mass behind the head and shoulders
function hairBack(p) {
  const { smoothQ, lock, taper } = p.helpers;
  const pal = p.palette;
  // the silhouette edge itself is wavy (scalloped clumps beside the arms)
  const edgeL = wavy(p, [[300, 190], [240, 250], [212, 360], [204, 480], [188, 600], [164, 720], [138, 840], [116, 960], [100, 1080], [92, 1216]], { amp: 16, waves: 3.2, phase: 0.6, count: 26 });
  const edgeR = wavy(p, [[532, 190], [592, 250], [620, 360], [628, 480], [644, 600], [668, 720], [694, 840], [716, 960], [732, 1080], [740, 1216]], { amp: 16, waves: 3.2, phase: 3.7, count: 26 });
  const mass = smoothQ([[416, 166, 1], [340, 172], ...edgeL.slice(0, -1), [...edgeL[edgeL.length - 1], 1], [...edgeR[edgeR.length - 1], 1], ...edgeR.slice(0, -1).reverse(), [492, 172]], { closed: true });
  const W = (ctrl, w, o = {}) => {
    const pts = wavy(p, ctrl, o);
    return { root: pts[0], tip: pts[pts.length - 1], points: pts, w, swell: 0.45, start: 0.35, ...o };
  };
  const tips = p.lin('backFrost', [[0, pal.hairShadow], [0.6, pal.hairShadow], [0.88, '#7fbfd8'], [1, '#c8ecf8']], [0, 300, 0, 1216]);
  const outer = [
    W([[230, 420], [206, 560], [176, 700], [146, 840], [122, 980], [104, 1120], [98, 1200]], 70, { amp: 16, waves: 2.3, phase: 1.3 }),
    W([[602, 420], [626, 560], [656, 700], [686, 840], [710, 980], [728, 1120], [734, 1200]], 70, { amp: 16, waves: 2.3, phase: 4.4 }),
  ];
  const style = { fill: tips, shade: pal.hairDeep, line: pal.hairLine, stroke: pal.hairLine, highlight: pal.hairHighlight, strokeWidth: 2.4, lineOpacity: 0.4, shadeOpacity: 0.7 };
  for (const L of outer) L.noLine = true;
  let hi = '';
  for (const L of outer) for (const r of [[0.2, 0.3], [0.5, 0.6]]) hi += lock(L.root, L.tip, { ...L, hi: r }).hi;
  return `<g stroke-linejoin="round">`
    + `<path d="${mass}" fill="${p.lin('backMass', [[0, pal.hairShadow], [0.55, pal.hairDeep], [0.85, '#2f6d90'], [1, '#6fb0cc']], [0, 200, 0, 1216])}" stroke="${pal.hairLine}" stroke-width="3"/>`
    + p.helpers.locks(outer, style)
    + `<path d="${outer.map((L) => waveShade(p, L)).join('')}" fill="${pal.hairDeep}" opacity=".8"/>`
    + `<path d="${hi}" fill="${pal.hairHighlight}" opacity=".45"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ hair (front): deep side part, one sweeping curtain bang, big wavy front lengths
function hairFront(p) {
  const { smooth, taper, lock } = p.helpers;
  const pal = p.palette;
  const frostFill = p.lin('frontFrost', [[0, pal.hair], [0.5, pal.hair], [0.82, '#a2d8ec'], [1, '#e6f8ff']], [0, 500, 0, 1140]);
  const frostShade = p.lin('frontFrostS', [[0, pal.hairShadow], [0.5, pal.hairShadow], [0.85, '#74b3d0'], [1, '#b6e2f4']], [0, 500, 0, 1140]);
  const domeG = p.lin('dome', [[0, '#8ccde6'], [0.45, pal.hair], [1, pal.hairShadow]], [300, 170, 560, 420]);
  const dome = smooth([[254, 430], [244, 360], [248, 296], [268, 238], [306, 196], [360, 172], [422, 166], [486, 174], [536, 198], [568, 240], [582, 296], [582, 360], [572, 420],
    [556, 360], [524, 306], [470, 276], [400, 280], [330, 306], [280, 366]], { closed: true });
  const domeShade = smooth([[582, 296], [582, 360], [572, 420], [556, 360], [530, 314], [550, 290], [566, 276]], { closed: true });
  const ring = smooth([[262, 314, 1], [284, 262], [326, 220], [384, 196], [470, 186, 1], [480, 196, 1], [456, 212, 1], [440, 206, 1], [420, 226, 1], [402, 218, 1], [376, 242, 1], [356, 236, 1], [330, 262, 1], [312, 258, 1], [290, 290, 1], [278, 286, 1]], { closed: true });
  const ringR = smooth([[512, 194, 1], [538, 208], [560, 236], [574, 270, 1], [562, 268, 1], [550, 250, 1], [536, 256, 1], [524, 234, 1], [512, 236, 1], [504, 212, 1]], { closed: true });
  const part = taper([[500, 176], [498, 196], [494, 218]], { w: 6, start: 0.2, end: 0, peak: 0.3 });
  const sweep = [[[480, 184], [400, 194], [330, 226], [288, 278]], [[512, 190], [544, 212], [566, 250]], [[470, 202], [396, 222], [340, 260]]]
    .map((s) => taper(s, { w: 2.4, start: 0.1, end: 0, peak: 0.5 })).join('');
  const P = (pts, w, o = {}) => ({ root: pts[0], tip: pts[pts.length - 1], points: pts, w, swell: 0.4, start: 0.25, ...o });
  // parallel locks sharing one wave phase read as ONE thick wavy clump
  const clump = (ctrl, specs, wo, extra = {}) => specs.map(([dx, w, cut]) => {
    const c = ctrl.slice(0, ctrl.length - cut).map(([x, y], i) => [x + dx * Math.min(1, i / 2), y]);
    const pts = wavy(p, c, wo);
    return { root: pts[0], tip: pts[pts.length - 1], points: pts, w, swell: 0.35, start: 0.3, fill: frostFill, shadeFill: frostShade, noLine: dx !== 0, noShade: dx !== 0, shadeOpacity: 0.45, ...extra };
  });
  const lenL = [[284, 320], [252, 430], [236, 550], [234, 670], [228, 790], [218, 910], [208, 1030], [202, 1130]];
  const lenR = [[572, 470], [588, 570], [598, 680], [602, 800], [610, 920], [620, 1040], [628, 1120]];
  const WL = { amp: 20, waves: 2.3, phase: 0.3, count: 15 }, WR = { amp: 18, waves: 2, phase: 3.4, count: 14 };
  const longL = clump(lenL, [[-26, 50, 1], [0, 66, 0], [30, 44, 2]], WL);
  const longR = clump(lenR, [[24, 46, 1], [0, 62, 0], [-26, 38, 2]], WR, { start: 0.2 });
  // one sweeping curtain bang from the part across the forehead to the viewer's-left cheek, smaller locks layered under it
  const bangsBack = [
    P([[506, 204], [538, 240], [556, 296], [562, 356], [562, 420]], 54, { swell: 0.42, start: 0.1 }),
    P([[490, 206], [420, 226], [358, 268], [318, 330], [300, 400]], 70, { swell: 0.42, start: 0.1 }),
  ];
  const bangs = [
    P([[496, 200], [440, 212], [378, 240], [328, 286], [298, 348], [284, 416], [288, 480], [302, 540]], 100, { swell: 0.26, start: 0.2, curl: -6 }),
    P([[494, 206], [450, 234], [410, 278], [384, 334], [372, 392]], 70, { swell: 0.4, curl: -8 }),
    P([[494, 212], [466, 252], [440, 300], [420, 350], [410, 398]], 38, { swell: 0.4, curl: -6 }),
    P([[504, 204], [528, 240], [544, 292], [552, 352], [556, 412]], 60, { swell: 0.36, curl: 6 }),
  ];
  const H = p.helpers.locks;
  const style = { fill: pal.hair, shade: pal.hairShadow, line: pal.hairLine, stroke: pal.hairLine, highlight: pal.hairHighlight, strokeWidth: 2.2, lineOpacity: 0.4, shadeOpacity: 0.85 };
  const bangDs = bangs.map((b) => lock(b.root, b.tip, b).d);
  const bangClip = p.clip('bangClip', bangDs);
  const rootShade = p.lin('bangRoot', [[0, pal.hairDeep, 0.7], [1, pal.hairDeep, 0]], [0, 200, 0, 280]);
  // highlights on the crests of the long waves (the middle lock of each clump)
  let crest = '';
  for (const [L, rs] of [[longL[1], [[0.2, 0.29], [0.42, 0.51], [0.64, 0.73]]], [longR[1], [[0.24, 0.34], [0.5, 0.6], [0.74, 0.82]]]]) for (const r of rs) crest += lock(L.root, L.tip, { ...L, hi: r }).hi;
  const wisps = [
    taper([[296, 400], [286, 470], [294, 530], [310, 576]], { w: 4, start: 0.1, end: 0, peak: 0.25 }),
    taper([[548, 360], [560, 420], [556, 470]], { w: 4, start: 0.1, end: 0, peak: 0.25 }),
  ].join('');
  return `<g stroke-linejoin="round">`
    + H(longL.concat(longR), { ...style, hiOpacity: 0.6 })
    + `<path d="${longL.concat(longR).map((L) => waveShade(p, L)).join('')}" fill="${pal.hairShadow}" opacity=".85"/>`
    + `<path d="${crest}" fill="${pal.hairHighlight}" opacity=".75"/>`
    + `<path d="${dome}" fill="${domeG}" stroke="${pal.hairLine}" stroke-width="3.4"/>`
    + `<path d="${domeShade}" fill="${pal.hairShadow}" opacity=".8"/>`
    + `<path d="${sweep}" fill="${pal.hairLine}" opacity=".4"/>`
    + `<path d="${ring}${ringR}" fill="#f0fbff" opacity=".9"/>`
    + `<path d="${part}" fill="${pal.hairDeep}"/>`
    + H(bangsBack.map((b) => ({ ...b, noLine: true })), { ...style, fill: pal.hairShadow, shade: pal.hairDeep })
    + H(bangs.map((b, i) => ({ ...b, hi: i === 0 ? [0.14, 0.3] : [0.3, 0.5] })), { ...style, hi: true, hiOpacity: 0.85 })
    + `<g clip-path="${bangClip}"><rect x="250" y="190" width="340" height="90" fill="${rootShade}"/>`
    // angel ring: one continuous sheen band following the curve of the head, broken into teeth on its lower edge
    + `<path d="${smooth([[262, 352, 1], [286, 292], [330, 250], [392, 226], [462, 220], [522, 230], [570, 262, 1], [560, 276, 1], [546, 262, 1], [530, 272, 1], [514, 252, 1], [496, 262, 1], [478, 244, 1], [458, 256, 1], [438, 242, 1], [418, 256, 1], [398, 246, 1], [376, 266, 1], [358, 260, 1], [338, 284, 1], [322, 280, 1], [302, 312, 1], [290, 308, 1], [276, 352, 1]], { closed: true })}" fill="#ecfaff" opacity=".72"/></g>`
    + `<path d="${wisps}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="1.2"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ head ornaments: ice-crystal comb (viewer's left) + crystal drop earring (left ear, viewer's right)
function crystal(p, x, y, len, w, ang, lit = true) {
  const { n } = p.helpers;
  const a = (ang * Math.PI) / 180, ux = Math.sin(a), uy = -Math.cos(a), vx = -uy, vy = ux;
  const P = (t, s) => `${n(x + ux * len * t + vx * w * s)},${n(y + uy * len * t + vy * w * s)}`;
  // hexagonal prism seen from the side: two facets + a pointed tip
  return `<path d="M${P(0, -0.5)}L${P(0.78, -0.5)}L${P(1, 0)}L${P(0.78, 0.5)}L${P(0, 0.5)}Z" fill="${C.iceMid}" stroke="${C.iceLine}" stroke-width="2"/>`
    + `<path d="M${P(0, -0.5)}L${P(0.78, -0.5)}L${P(1, 0)}L${P(0, 0)}Z" fill="${lit ? C.iceLit : C.iceMid}"/>`
    + `<path d="M${P(0, 0.12)}L${P(0.78, 0.12)}L${P(1, 0)}" fill="none" stroke="#fff" stroke-width="1.4" opacity=".8"/>`
    + `<path d="M${P(0.1, 0.3)}L${P(0.7, 0.3)}" stroke="${C.iceDeep}" stroke-width="1.4" opacity=".6"/>`;
}
function crystals(p) {
  const { n } = p.helpers;
  // comb: a fan of slender crystals springing from a silver filigree band above her right temple
  const cx = 302, cy = 258;
  const fan = [[-100, 44, 12], [-74, 70, 15], [-48, 96, 19], [-22, 84, 17], [2, 60, 14], [24, 40, 11]];
  const comb = fan.map(([ang, len, w]) => crystal(p, cx, cy, len, w, ang, ang < -30)).join('');
  const band = 'M262,286Q290,258 334,244';
  const base = `<path d="${band}" fill="none" stroke="${C.silverLine}" stroke-width="12" stroke-linecap="round"/><path d="${band}" fill="none" stroke="${C.silver}" stroke-width="7.5" stroke-linecap="round"/>`
    + `<path d="M266,280Q292,256 330,244" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/>`
    + [[274, 276, 6], [300, 262, 7.5], [326, 250, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.iceMid}" stroke="${C.iceLine}" stroke-width="1.8"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${n(r * 0.38)}" fill="#fff"/>`).join('');
  // earring: short silver chain + elongated crystal drop under the left earlobe (viewer's right)
  const ex = 578, ey = 494;
  const ear = `<path d="M${ex},${ey}v14" stroke="${C.silverShade}" stroke-width="2.2"/><circle cx="${ex}" cy="${ey}" r="3.4" fill="${C.silver}" stroke="${C.silverLine}" stroke-width="1.4"/>`
    + `<path d="M${ex},${ey + 12}L${ex + 8},${ey + 28}L${ex},${ey + 56}L${ex - 8},${ey + 28}Z" fill="${C.iceMid}" stroke="${C.iceLine}" stroke-width="1.8" stroke-linejoin="round"/>`
    + `<path d="M${ex},${ey + 12}L${ex - 8},${ey + 28}L${ex},${ey + 56}Z" fill="${C.iceLit}"/>`
    + `<circle cx="${ex}" cy="${ey + 32}" r="9" fill="${C.iceLit}" opacity=".35" filter="${p.refs.glow}"/>`;
  return `<g stroke-linejoin="round"><path d="M262,300Q300,270 344,262" fill="none" stroke="${p.palette.hairDeep}" stroke-width="8" opacity=".45"/>${comb}${base}${ear}</g>`;
}

// ------------------------------------------------------------------ layered northern robes + white fur stole
function fluffEdge(p, pts, bump, count) {
  // fluffy tufted edge along a spline: sharp notches with outward-bulging quadratic tufts between them
  const c = p.helpers.sampleSpline(pts, count);
  const out = [];
  for (let i = 0; i < c.length; i++) {
    out.push([...c[i], 1]);
    if (i < c.length - 1) {
      const a = c[i], b = c[i + 1];
      const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
      const k = bump * (0.75 + 0.5 * ((i * 7) % 5) / 4);
      out.push([(a[0] + b[0]) / 2 + (-dy / m) * k, (a[1] + b[1]) / 2 + (dx / m) * k]);
    }
  }
  return out;
}
function robes(p) {
  const { smooth, smoothQ, taper, mirrorPath, n } = p.helpers;
  const robeL = p.lin('robeL', [[0, C.robeLit], [0.35, C.robe], [1, C.robeShade]], [150, 760, 420, 1200]);
  const robeR = p.lin('robeR', [[0, C.robe], [0.5, C.robeShade], [1, C.robeDeep]], [420, 760, 700, 1150]);
  let s = '';
  // outer robe over the whole body
  const halfL = smooth([[416, 700, 1], [360, 702], [298, 722], [232, 746], [182, 772], [150, 812], [134, 880], [124, 1000], [118, 1216, 1], [416, 1216, 1]], { closed: true });
  s += `<path d="${halfL}" fill="${robeL}" stroke="${C.robeLine}" stroke-width="3.4"/><path d="${mirrorPath(halfL)}" fill="${robeR}" stroke="${C.robeLine}" stroke-width="3.4"/>`;
  // sleeve seams + soft folds
  const folds = [[[196, 930], [206, 1040], [204, 1170]], [[636, 930], [628, 1040], [630, 1170]], [[300, 960], [306, 1080], [302, 1200]], [[532, 960], [526, 1080], [530, 1200]]]
    .map((f) => taper(f, { w: 7, start: 0.1, end: 0, peak: 0.4 })).join('');
  s += `<path d="${p.shapes.armSeamL}${p.shapes.armSeamR}" fill="none" stroke="${C.robeLine}" stroke-width="2.6" opacity=".8"/>`
    + `<path d="${folds}" fill="${C.robeDeep}" opacity=".75"/>`
    + `<path d="${taper([[146, 900], [136, 1000], [130, 1120]], { w: 12, start: 0.2, end: 0, peak: 0.3 })}" fill="${C.robeLit}" opacity=".8"/>`;
  // middle layer (ice-blue robe) and inner silk panel down the centre front
  const midL = smoothQ([[416, 800, 1], [378, 830], [364, 940], [352, 1216, 1], [416, 1216, 1]], { closed: true });
  s += `<path d="${midL}" fill="${C.mid}" stroke="${C.midLine}" stroke-width="2.6"/><path d="${mirrorPath(midL)}" fill="${C.midShade}" stroke="${C.midLine}" stroke-width="2.6"/>`;
  const innerP = smoothQ([[416, 820, 1], [398, 900], [392, 1216, 1], [440, 1216, 1], [434, 900], [416, 820, 1]], { closed: true });
  s += `<path d="${innerP}" fill="${C.inner}" stroke="${C.innerLine}" stroke-width="2"/>`
    + `<path d="M416,860V1216" stroke="${C.innerShade}" stroke-width="2"/>`
    + [930, 1000, 1070, 1140].map((y) => `<path d="M416,${y - 9}l6,9l-6,9l-6,-9z" fill="${C.ice}"/>`).join('');
  // frost-white trim with embroidered snow-diamonds along the outer robe's front edges
  const edgeL = smooth([[384, 820], [366, 900], [356, 1040], [350, 1216]]);
  s += `<path d="${edgeL}${mirrorPath(edgeL)}" fill="none" stroke="${C.robeLine}" stroke-width="15"/>`
    + `<path d="${edgeL}${mirrorPath(edgeL)}" fill="none" stroke="${C.frost}" stroke-width="10"/>`
    + `<path d="${edgeL}${mirrorPath(edgeL)}" fill="none" stroke="${C.ice}" stroke-width="3" stroke-dasharray="4 7"/>`;
  // high inner collar (soft knit) rising out of the stole
  const collar = smooth([[364, 628, 1], [390, 640], [416, 644], [442, 640], [468, 628, 1], [476, 712, 1], [416, 724], [356, 712, 1]], { closed: true });
  const collarG = p.lin('collar', [[0, C.inner], [0.55, C.inner], [1, C.innerShade]], [364, 0, 476, 0]);
  s += `<path d="${collar}" fill="${collarG}" stroke="${C.innerLine}" stroke-width="2.8"/>`
    + `<path d="M442,640L468,628L476,712L450,718Z" fill="${C.innerShade}"/>`
    + `<path d="M366,634Q416,656 466,634" fill="none" stroke="${C.ice}" stroke-width="2.6"/>`
    + `<path d="M384,650V712M400,654V718M432,654V718M448,650V714" stroke="${C.innerShade}" stroke-width="1.6" opacity=".8"/>`;
  // the stole's cast shadow on the robe
  s += `<path d="M136,856Q240,930 416,880Q592,930 696,856L700,900Q592,968 416,918Q240,968 132,900Z" fill="${C.robeDeep}" opacity=".6"/>`;
  // inner bodice showing in the V of the stole
  s += `<path d="M366,700L466,700L436,850L396,850Z" fill="${C.inner}" stroke="${C.innerLine}" stroke-width="2"/><path d="M430,700L466,700L436,850L420,850Z" fill="${C.innerShade}" opacity=".8"/>`
    + `<path d="M416,724V840" stroke="${C.innerShade}" stroke-width="2"/>`;
  // white fur stole: tufted, puffy, draped over both shoulders, its ends meeting under the brooch
  const outerEdge = fluffEdge(p, [[346, 688], [290, 696], [236, 716], [192, 746], [160, 790], [140, 852]], 9, 9);
  const bottomEdge = fluffEdge(p, [[140, 852], [178, 888], [238, 904], [300, 906], [352, 896], [392, 876], [416, 860]], 12, 9);
  const half = smoothQ([[416, 860, 1], [404, 826], [388, 778], [374, 730], [366, 700], ...outerEdge, ...bottomEdge.slice(1)], { closed: true });
  const furL = p.lin('furL', [[0, '#ffffff'], [0.45, C.fur], [1, C.furShade]], [160, 690, 360, 900]);
  const furR = p.lin('furR', [[0, C.furShade], [0.6, C.furShade], [1, C.furDeep]], [470, 690, 700, 900]);
  // tuft strokes: short curved flicks following the drape
  const flick = (x, y, a, l) => [[x, y], [x + Math.cos(a) * l * 0.5 + 3, y + Math.sin(a) * l * 0.5], [x + Math.cos(a) * l, y + Math.sin(a) * l]];
  const tufts = [[224, 760, 2.2, 26], [262, 742, 2.0, 24], [302, 730, 1.9, 22], [190, 800, 2.3, 26], [176, 846, 2.0, 22], [214, 868, 1.7, 24], [258, 878, 1.6, 26], [304, 878, 1.5, 24],
    [344, 866, 1.4, 22], [376, 836, 1.3, 20], [366, 760, 1.6, 22], [340, 790, 1.7, 24], [300, 806, 1.8, 26], [250, 816, 1.9, 26]]
    .map(([x, y, a, l]) => taper(flick(x, y, a, l), { w: 3.6, start: 0.3, end: 0, peak: 0.3 })).join('');
  const furShadeL = smoothQ([[140, 852, 1], [178, 888], [238, 904], [300, 906], [352, 896], [392, 876], [416, 860, 1], [408, 836, 1], [380, 856], [330, 872], [266, 876], [204, 862], [160, 828, 1]], { closed: true });
  s += `<path d="${half}" fill="${furL}" stroke="${C.furLine}" stroke-width="3"/>`
    + `<path d="${mirrorPath(half)}" fill="${furR}" stroke="${C.furLine}" stroke-width="3"/>`
    + `<path d="${furShadeL}" fill="${C.furShade}" opacity=".75"/><path d="${mirrorPath(furShadeL)}" fill="${C.furDeep}" opacity=".6"/>`
    + `<path d="${tufts}" fill="${C.furDeep}" opacity=".75"/><path d="${mirrorPath(tufts.split('Z').slice(0, 8).join('Z') + 'Z')}" fill="${C.furLine}" opacity=".5"/>`
    + `<path d="${taper([[340, 702], [280, 712], [224, 736], [182, 772], [158, 816]], { w: 10, start: 0.2, end: 0, peak: 0.4 })}" fill="#fff" opacity=".95"/>`
    + `<path d="M368,704Q380,780 410,850" fill="none" stroke="${C.furDeep}" stroke-width="4" opacity=".5"/><path d="M464,704Q452,780 422,850" fill="none" stroke="${C.furLine}" stroke-width="4" opacity=".4"/>`;
  return s;
}

// ------------------------------------------------------------------ brooch: hexagonal ice crystal in a silver snowflake setting
function brooch(p) {
  const { n } = p.helpers;
  const cx = 416, cy = 852;
  const hex = (r, rot = 0) => Array.from({ length: 6 }, (_, k) => {
    const a = rot + (k * Math.PI) / 3;
    return `${n(cx + Math.cos(a) * r)},${n(cy + Math.sin(a) * r)}`;
  });
  const h = hex(17, Math.PI / 6);
  const gem = p.lin('gem', [[0, '#ffffff'], [0.4, C.iceLit], [1, C.ice]], [cx - 14, cy - 16, cx + 14, cy + 16]);
  return `<g stroke-linejoin="round">`
    + `<circle cx="${cx}" cy="${cy}" r="28" fill="#bfeaff" opacity=".35" filter="${p.refs.glow}"/>`
    + p.def(`<path id="${p.id('broochFlake')}" d="${flake(p, cx, cy, 34, Math.PI / 6)}" stroke-linecap="round"/>`)
    + `<use href="#${p.id('broochFlake')}" stroke="${C.silverLine}" stroke-width="6"/><use href="#${p.id('broochFlake')}" stroke="${C.silver}" stroke-width="3"/>`
    + `<path d="M${hex(22, Math.PI / 6).join('L')}Z" fill="${C.silver}" stroke="${C.silverLine}" stroke-width="2.4"/>`
    + `<path d="M${h.join('L')}Z" fill="${gem}" stroke="${C.iceLine}" stroke-width="1.8"/>`
    + `<path d="M${h[3]}L${h[4]}L${h[5]}L${cx},${cy}Z" fill="#fff" opacity=".75"/><path d="M${h[0]}L${h[1]}L${h[2]}L${cx},${cy}Z" fill="${C.iceDeep}" opacity=".45"/>`
    + `</g>`;
}

// ------------------------------------------------------------------ staff "Spring Sleep": birch-white shaft, crescent crystal cradle, snowflake orb
function staff(p) {
  const { n, taper, mirrorPath } = p.helpers;
  const ox = 704, oy = 726; // orb centre
  const shaft = 'M710,1216L696,826L716,826L736,1216Z';
  const sg = p.lin('shaft', [[0, '#f4f8fb'], [0.45, '#cfdcea'], [1, '#7f97b0']], [696, 0, 736, 0]);
  const orb = p.rad('orb', [[0, '#ffffff'], [0.3, '#dcf6ff'], [0.72, '#8fd4f5'], [1, C.ice]], { cx: ox - 12, cy: oy - 14, r: 46 });
  // crescent cradle: two curved crystal horns sweeping up around the orb, shards fanning behind
  const hornPts = [[ox - 8, 812], [ox - 44, 780], [ox - 56, 730], [ox - 44, 680], [ox - 18, 650]];
  const horn = taper(hornPts, { w: 22, start: 0.7, end: 0, peak: 0.25 });
  const hornR = horn.replace(/-?\d+\.?\d*,-?\d+\.?\d*/g, (m) => { const [x, y] = m.split(',').map(Number); return `${n(2 * ox - x)},${n(y)}`; });
  const hornFacet = taper(hornPts.map(([x, y]) => [x + 4, y]), { w: 6, start: 0.6, end: 0, peak: 0.25 });
  const shards = [[-26, 70, 14], [0, 120, 18], [26, 74, 14]].map(([ang, len, w]) => crystal(p, ox + ang * 0.4, 800, len, w, ang, ang <= 0)).join('');
  const motes = [[ox - 74, 700, 6], [ox + 70, 668, 5], [ox + 60, 770, 4], [ox - 64, 620, 4]].map(([x, y, r]) => `M${x},${y - r * 1.6}l${r},${r * 1.6}l${-r},${r * 1.6}l${-r},${-r * 1.6}z`).join('');
  return `<g stroke-linejoin="round">`
    + `<path d="${shaft}" fill="${sg}" stroke="${C.silverLine}" stroke-width="2.8"/>`
    + `<path d="M700,900L732,880M702,960L734,940M704,1020L736,1000M706,1080L736,1062" stroke="${C.ice}" stroke-width="6"/>`
    + `<path d="M700,900L732,880M702,960L734,940M704,1020L736,1000" stroke="${C.iceLit}" stroke-width="1.6"/>`
    + `<path d="${taper([[704, 840], [708, 1000], [714, 1180]], { w: 3, start: 0.2, end: 0, peak: 0.3 })}" fill="#fff" opacity=".8"/>`
    + `<circle cx="${ox}" cy="${oy}" r="70" fill="#bfeaff" opacity=".28" filter="${p.refs.glow}"/>`
    + shards
    + `<path d="${horn}" fill="${C.iceLit}" stroke="${C.iceLine}" stroke-width="2.2"/><path d="${hornFacet}" fill="#fff" opacity=".85"/>`
    + `<path d="${hornR}" fill="${C.iceMid}" stroke="${C.iceLine}" stroke-width="2.2"/>`
    + `<path d="M680,812L728,812L736,834L672,834Z" fill="${C.silver}" stroke="${C.silverLine}" stroke-width="2.4"/><path d="M682,818H726" stroke="#fff" stroke-width="2" opacity=".8"/>`
    + `<circle cx="${ox}" cy="${oy}" r="38" fill="${orb}" stroke="${C.iceLine}" stroke-width="2.4"/>`
    + `<path d="${flake(p, ox, oy, 25, 0.26)}" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/>`
    + `<path d="M${ox - 26},${oy - 15}A30,30 0 0 1 ${ox - 6},${oy - 30}" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" opacity=".9"/>`
    + `<path d="${motes}" fill="${C.iceLit}" opacity=".85"/>`
    + `</g>`;
}
