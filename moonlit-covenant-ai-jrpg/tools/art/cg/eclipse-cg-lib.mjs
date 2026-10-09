// Shared drawing library for the prologue CG set painted by tools/art/cg/eclipse-cg-set.mjs
// (intro-eye / camp-fire / corridor-frost / battle-descend / battle-phase2).
// Zero dependencies. Everything returns SVG markup strings; every id is prefixed by the caller's
// asset prefix so the files can later be inlined side by side without collisions.

export const PAL = {
  void: '#070614', void2: '#0c0b1b', panel: '#17132e', panel2: '#221c45',
  moon: '#e8ddff', oath: '#ffd091', memory: '#ffb38a', abyss: '#0e1a3a',
  lia: '#ff6b7c', liaDeep: '#c13b4c', mia: '#5ed7ff', miaOrange: '#ff9a3c', serena: '#b58cff', serenaWhite: '#efe9ff',
  // train interior
  wall: '#1c2c31', wallHi: '#2d4349', wallSh: '#111b20', wallLine: '#0a1215',
  brass: '#b88a4a', brassHi: '#ffd091', brassSh: '#5e4223',
  amber: '#ffb45e', emergency: '#ff3d55',
  frost: '#e9e1ff', frost2: '#bfaef0', frost3: '#8a78cf',
  ink: '#0b0918', ink2: '#141029',
};

// deterministic PRNG (mulberry32)
export function rng(seed) {
  let a = seed >>> 0;
  const r = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.range = (lo, hi) => lo + (hi - lo) * r();
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  return r;
}

// compact number formatting
export const f = (v, d = 1) => fmt(v, d);
function fmt(v, d) {
  const s = (+v).toFixed(d);
  return s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1').replace(/^-0$/, '0');
}
export const pts = (arr) => arr.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');

// smooth closed path through points (Catmull-Rom -> cubic Bezier)
export function smoothPath(points, closed = true, tension = 1) {
  const p = points;
  const n = p.length;
  let d = `M${f(p[0][0])},${f(p[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    const q0 = closed || i > 0 ? p0 : p1;
    const q3 = closed || i + 2 < n ? p3 : p2;
    const c1 = [p1[0] + (p2[0] - q0[0]) / 6 * tension, p1[1] + (p2[1] - q0[1]) / 6 * tension];
    const c2 = [p2[0] - (q3[0] - p1[0]) / 6 * tension, p2[1] - (q3[1] - p1[1]) / 6 * tension];
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return closed ? d + 'Z' : d;
}

export function svgDoc(p, title, defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-label="${title}">\n<defs>${defs}</defs>\n${body}\n</svg>\n`;
}

// standard filters (max 3 used per CG; the budget is 4)
export function filters(p) {
  return `<filter id="${p}-b1" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>`
    + `<filter id="${p}-b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>`
    + `<filter id="${p}-b3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="36"/></filter>`;
}

export const radial = (id, stops, attrs = '') => `<radialGradient id="${id}" ${attrs}>${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;
export const linear = (id, stops, attrs = 'x1="0" y1="0" x2="0" y2="1"') => `<linearGradient id="${id}" ${attrs}>${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;

// Path DSL: list of points [x, y] (smooth) or [x, y, 1] (corner). Catmull-Rom between smooth points.
export function shape(points, closed = true, dp = 1) {
  const n = points.length;
  const f = (v) => fmt(v, dp);
  const P = (i) => points[(i + n) % n];
  const tan = (i) => {
    const c = P(i);
    if (c[2]) return [0, 0];
    if (!closed && (i === 0 || i === n - 1)) return [0, 0];
    const a = P(i - 1), b = P(i + 1);
    return [(b[0] - a[0]) / 6, (b[1] - a[1]) / 6];
  };
  let d = `M${f(points[0][0])},${f(points[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = P(i), b = P(i + 1), ta = tan(i), tb = tan(i + 1);
    if (!ta[0] && !ta[1] && !tb[0] && !tb[1]) d += `L${f(b[0])},${f(b[1])}`;
    else d += `C${f(a[0] + ta[0])},${f(a[1] + ta[1])} ${f(b[0] - tb[0])},${f(b[1] - tb[1])} ${f(b[0])},${f(b[1])}`;
  }
  return closed ? d + 'Z' : d;
}
const S = (pts, closed = true) => shape(pts, closed, 0);
const mirror = (pts) => pts.map(([x, y, c]) => (c ? [-x, y, 1] : [-x, y]));

// ---------------------------------------------------------------------------------------------
// Party silhouettes, seen from behind. Local units: feet at y=0, ~1000 units tall (8 heads).
// body = shapes merged into one silhouette group (fill inherited from <use>), detail() = lit
// details drawn on top (sword steel, receiver glow, drone, ornament ...).
// ---------------------------------------------------------------------------------------------
export const FIG = {
  lia: {
    rim: PAL.lia,
    body: [
      // torso + legs, weight on her right leg, left leg braced out
      S([[-20, -868], [-62, -846], [-110, -824], [-106, -760], [-96, -700], [-68, -622], [-94, -540], [-104, -500], [-114, -420], [-126, -336], [-132, -278], [-150, -198], [-158, -110], [-162, -58], [-170, -22], [-182, 0, 1], [-122, 0, 1], [-124, -30], [-124, -64], [-106, -160], [-94, -232], [-84, -288], [-60, -362], [-30, -440], [-4, -486, 1],
        [4, -486, 1], [28, -430], [52, -350], [66, -284], [72, -220], [86, -140], [98, -64], [98, -24], [94, 0, 1], [150, 0, 1], [142, -26], [136, -60], [134, -122], [128, -202], [120, -282], [118, -342], [110, -432], [100, -512], [68, -622], [96, -700], [106, -760], [110, -824], [62, -846], [20, -868]]),
      // head
      S([[-22, -866], [-44, -880], [-54, -920], [-50, -964], [-28, -994], [0, -1003], [28, -994], [50, -964], [54, -920], [44, -880], [22, -866]]),
      // high ponytail rising above the crown then falling in a swinging arc
      S([[-10, -988], [8, -1030], [50, -1054], [92, -1040], [118, -994], [128, -920], [126, -842], [116, -772], [100, -712], [78, -646, 1], [86, -716], [84, -770, 1], [76, -716], [58, -672, 1], [66, -740], [70, -820], [64, -894], [48, -948], [24, -978]]),
      // pauldrons (left one battle-notched)
      S([[86, -838, 1], [124, -848], [162, -826], [178, -790], [172, -760], [154, -746, 1], [100, -764, 1]]),
      S([[-86, -838, 1], [-124, -848], [-162, -826], [-178, -790], [-174, -764, 1], [-160, -770, 1], [-150, -748, 1], [-100, -764, 1]]),
      // sword arm (right), angled down and out
      S([[104, -826], [148, -806], [164, -742], [174, -666], [196, -594], [220, -526], [226, -508, 1], [204, -494, 1], [184, -560], [160, -626], [146, -664], [130, -724], [104, -770]]),
      // gauntlet fist
      S([[200, -506], [222, -522], [244, -508], [242, -480], [222, -470], [204, -482]]),
      // left arm, elbow out, forearm hidden in front of the body
      S([[-104, -826], [-148, -806], [-166, -742], [-172, -676], [-162, -640, 1], [-138, -656], [-126, -720], [-106, -770]]),
      // tassets
      S([[-98, -604, 1], [98, -604, 1], [122, -500, 1], [104, -474, 1], [82, -496, 1], [42, -472, 1], [0, -496, 1], [-42, -472, 1], [-82, -496, 1], [-104, -474, 1], [-122, -500, 1]]),
      // cape swept to her left by the pressure wave, burnt hem
      S([[-90, -826], [-40, -846], [40, -846], [90, -826], [82, -770], [64, -650], [40, -540], [22, -480, 1], [-6, -500, 1], [-34, -458, 1], [-74, -484, 1], [-110, -440, 1], [-150, -470, 1], [-196, -424, 1], [-228, -452, 1], [-270, -420, 1], [-256, -500], [-222, -620], [-186, -730], [-146, -808]]),
      // knee-high greaves
      S([[-136, -312, 1], [-80, -306, 1], [-86, -270], [-96, -230, 1], [-148, -230, 1], [-144, -270]]),
      S([[72, -306, 1], [124, -312, 1], [126, -272], [130, -232, 1], [76, -232, 1], [70, -270]]),
    ],
    detail: (p) => [
      // sword: grip, pommel, broken-and-riveted ring guard, slender blade
      `<path d="M208,-534L238,-466" stroke="#3b2430" stroke-width="12" stroke-linecap="round"/>`,
      `<circle cx="206" cy="-540" r="9" fill="${PAL.brass}"/>`,
      `<circle cx="240" cy="-460" r="18" fill="none" stroke="${PAL.brassHi}" stroke-width="5" stroke-dasharray="48 6 52 7"/>`,
      `<path d="M246,-446L484,-70L474,-64L234,-438Z" fill="url(#${p}-steel)"/>`,
      `<path d="M242,-444L479,-67" stroke="#ffffff" stroke-width="1.8" opacity=".9"/>`,
      // hair strands: crimson sheen, dark-red streak, gold band
      `<path d="M8,-1030C50,-1054,92,-1040,118,-994C128,-950,130,-880,124,-830" fill="none" stroke="${PAL.lia}" stroke-width="5"/>`,
      `<path d="M36,-1036C80,-1030,104,-980,108,-900M24,-1012C60,-1000,80,-950,84,-860M-40,-978C-52,-944-54,-910-48,-884" fill="none" stroke="${PAL.liaDeep}" stroke-width="3.5" opacity=".85"/>`,
      `<path d="M-12,-992C0,-984,10,-976,18,-962" fill="none" stroke="${PAL.oath}" stroke-width="7" stroke-linecap="round"/>`,
      // armour + cape edge light
      `<path d="M90,-836C126,-846,160,-826,176,-792" fill="none" stroke="${PAL.moon}" stroke-width="2.5" opacity=".5"/>`,
      `<path d="M-146,-808C-186,-730-222,-620-256,-500" fill="none" stroke="${PAL.liaDeep}" stroke-width="4" opacity=".75"/>`,
      `<path d="M-20,-760C-40,-680-70,-580-110,-470M30,-760C20,-680,0,-580-30,-480" fill="none" stroke="#231a33" stroke-width="4"/>`,
    ].join(''),
  },
  mia: {
    rim: PAL.mia,
    body: [
      // head: self-cut layered short hair
      S([[-34, -784, 1], [-46, -798, 1], [-54, -776, 1], [-60, -806], [-66, -846], [-58, -884], [-32, -906], [0, -912], [32, -906], [58, -884], [66, -846], [60, -806], [54, -776, 1], [46, -798, 1], [34, -784, 1], [22, -770, 1], [12, -790, 1], [0, -772, 1], [-12, -790, 1], [-22, -770, 1]]),
      // mechanical receiver ears (angular shells with a flattened tip)
      S([[-58, -860, 1], [-80, -960, 1], [-66, -968, 1], [-18, -904, 1]]),
      S([[58, -860, 1], [80, -960, 1], [66, -968, 1], [18, -904, 1]]),
      // neck
      S([[-16, -790, 1], [16, -790, 1], [18, -756, 1], [-18, -756, 1]]),
      // oversized bomber jacket: dropped shoulders, puffed body, cinched ribbed hem
      S([[-24, -778, 1], [-72, -768], [-120, -746], [-144, -716], [-156, -650], [-162, -560], [-166, -480], [-168, -440, 1], [-124, -434, 1], [-124, -470], [-112, -452], [-104, -420, 1], [104, -420, 1], [114, -470], [124, -560], [128, -640], [126, -700], [118, -746], [72, -768], [24, -778, 1]]),
      // raised right arm in a long drapey sleeve, pointing at the drone
      S([[112, -752], [160, -772], [196, -792], [214, -822], [224, -852, 1], [254, -846, 1], [250, -806], [232, -756], [200, -706], [160, -690], [120, -692]]),
      // fingertips out of the cuff
      S([[230, -850, 1], [234, -876], [244, -884], [254, -878], [256, -846, 1]]),
      // shorts
      S([[-92, -430, 1], [92, -430, 1], [94, -386, 1], [8, -382, 1], [0, -396, 1], [-8, -382, 1], [-94, -386, 1]]),
      // legs in tights + chunky ankle boots
      S([[-84, -392, 1], [-82, -330], [-72, -272], [-70, -244], [-78, -196], [-72, -150], [-88, -132, 1], [-98, -64], [-108, -12, 1], [-104, 4, 1], [-36, 4, 1], [-38, -24], [-42, -80], [-44, -132, 1], [-40, -170], [-36, -232], [-38, -262], [-26, -330], [-12, -392, 1]]),
      S([[84, -392, 1], [84, -330], [76, -272], [72, -244], [80, -196], [76, -150], [92, -132, 1], [100, -64], [110, -12, 1], [106, 4, 1], [38, 4, 1], [40, -24], [44, -80], [46, -132, 1], [42, -170], [38, -232], [40, -262], [28, -330], [12, -392, 1]]),
      // tool pouch
      S([[-150, -500, 1], [-108, -506, 1], [-102, -440, 1], [-146, -434, 1]]),
    ],
    detail: (p) => [
      `<path d="M-57,-864L-76,-956L-24,-905" fill="none" stroke="${PAL.mia}" stroke-width="5" stroke-linejoin="round"/>`,
      `<path d="M57,-864L76,-956L24,-905" fill="none" stroke="${PAL.mia}" stroke-width="5" stroke-linejoin="round"/>`,
      `<path d="M-72,-966L-84,-1010M72,-966L84,-1010" stroke="#9fb3c4" stroke-width="3"/>`,
      `<circle cx="-85" cy="-1015" r="6" fill="${PAL.mia}"/><circle cx="85" cy="-1015" r="6" fill="${PAL.mia}"/>`,
      `<path d="M-60,-806L-54,-776L-46,-798L-34,-784M60,-806L54,-776L46,-798L34,-784M-22,-770L-12,-790L0,-772L12,-790L22,-770" fill="none" stroke="${PAL.mia}" stroke-width="3.5" opacity=".85"/>`,
      `<path d="M0,-772L0,-560L-30,-530L-30,-424" fill="none" stroke="${PAL.mia}" stroke-width="3" opacity=".8"/>`,
      `<path d="M-104,-430L104,-430" stroke="#2a2440" stroke-width="7"/>`,
      `<path d="M-146,-498L-110,-502" stroke="${PAL.miaOrange}" stroke-width="4"/>`,
      `<path d="M-60,-740C-80,-680-100,-600-110,-520M60,-740C80,-680,96,-600,100,-520" fill="none" stroke="#231a33" stroke-width="4"/>`,
      // drone "Zero"
      `<g transform="translate(270 -982)"><circle r="60" fill="url(#${p}-glowMia)"/><ellipse rx="44" ry="9" fill="none" stroke="#9fb3c4" stroke-width="3"/><circle r="26" fill="#2a3446"/><path d="M-26,0A26,26 0 0 1 26,0" fill="#3d4b60"/><circle cx="6" cy="2" r="8" fill="${PAL.mia}"/><circle cx="8" cy="0" r="3" fill="#ffffff"/><path d="M-20,-12L-8,-16" stroke="${PAL.miaOrange}" stroke-width="3"/></g>`,
    ].join(''),
  },
  serena: {
    rim: PAL.serena,
    body: [
      // long robe: slim waist, flaring to the floor, small train to her left
      S([[-40, -850], [-80, -836], [-104, -812], [-104, -760], [-96, -680], [-76, -620], [-92, -500], [-112, -360], [-134, -220], [-160, -90], [-196, -10, 1], [-228, 0, 1], [190, 0, 1], [168, -40], [150, -140], [130, -260], [110, -380], [92, -500], [76, -620], [96, -680], [104, -760], [104, -812], [80, -836], [40, -850]]),
      // left sleeve hanging (long trumpet sleeve)
      S([[-100, -800], [-126, -740], [-146, -640], [-164, -540], [-176, -476, 1], [-120, -470, 1], [-108, -560], [-100, -660]]),
      // raised right arm with the hanging sleeve drape
      S([[96, -818], [150, -814], [196, -806], [222, -830], [236, -862, 1], [260, -852, 1], [264, -800], [258, -720], [246, -640], [232, -578, 1], [204, -618], [164, -676], [126, -728], [100, -758]]),
      // very long straight hair curtain with tapered tips
      S([[-52, -930], [-48, -966], [-26, -990], [0, -996], [26, -990], [48, -966], [52, -930], [58, -880], [68, -838], [90, -800], [98, -730], [100, -640], [98, -540], [94, -470], [88, -436, 1], [74, -448], [56, -418, 1], [38, -440], [16, -410, 1], [-4, -436], [-26, -414, 1], [-46, -440], [-66, -420, 1], [-80, -444], [-90, -436, 1], [-96, -470], [-98, -540], [-100, -640], [-98, -730], [-90, -800], [-68, -838], [-58, -880]]),
    ],
    detail: (p) => [
      // gloved hand raised (white half glove)
      `<circle cx="252" cy="-900" r="60" fill="url(#${p}-glowSer)"/><path d="M240,-864L238,-894L246,-912L256,-910L262,-892L260,-862Z" fill="${PAL.serenaWhite}"/><circle cx="252" cy="-900" r="40" fill="none" stroke="${PAL.serena}" stroke-width="2.5" stroke-dasharray="10 6" opacity=".9"/>`,
      `<path d="M-26,-984C-60,-944-72,-860-80,-790M22,-988C56,-950,68,-870,74,-790M-42,-720C-46,-620-42,-520-38,-440M34,-720C38,-620,38,-520,32,-440M-4,-740C-6,-620-4,-520-2,-450" fill="none" stroke="#33255a" stroke-width="3"/>`,
      `<path d="M-97,-520L97,-520L94,-470L88,-436L74,-448L56,-418L38,-440L16,-410L-4,-436L-26,-414L-46,-440L-66,-420L-80,-444L-90,-436L-96,-470Z" fill="url(#${p}-hairEnd)"/><path d="M84,-500L88,-440M60,-490L56,-424M30,-500L16,-416M-14,-496L-26,-420M-50,-490L-66,-424M-80,-494L-90,-440" stroke="${PAL.serenaWhite}" stroke-width="2.5" opacity=".55"/>`,
      `<path d="M-50,-920C-64,-880-72,-840-78,-800" fill="none" stroke="#2a1f4a" stroke-width="8" stroke-dasharray="7 4"/>`,
      `<circle cx="-54" cy="-916" r="15" fill="#1b1533" stroke="${PAL.serenaWhite}" stroke-width="3"/><path d="M-54,-928A12,12 0 1 1 -54,-904A7,12 0 1 0 -54,-928Z" fill="${PAL.serenaWhite}"/>`,
      `<path d="M-200,-22C-100,-36,90,-36,176,-22M-150,-80C-80,-92,80,-92,150,-80" fill="none" stroke="${PAL.serena}" stroke-width="2.5" opacity=".55"/>`,
    ].join(''),
  },
  player: {
    rim: PAL.oath,
    body: [
      // travelling cloak with a weathered hem
      S([[-120, -800], [-150, -760], [-164, -660], [-176, -520], [-192, -360], [-210, -200], [-226, -90, 1], [-200, -104, 1], [-184, -76, 1], [-150, -98, 1], [-112, -66, 1], [-70, -92, 1], [-30, -62, 1], [10, -90, 1], [52, -64, 1], [96, -96, 1], [136, -70, 1], [176, -100, 1], [204, -80, 1], [230, -110, 1], [214, -220], [196, -380], [180, -540], [168, -680], [156, -770], [124, -806]]),
      // mantle over the shoulders
      S([[-56, -880], [-104, -856], [-148, -820], [-166, -770], [-160, -724], [-120, -730], [-80, -712], [-40, -722], [0, -708], [40, -722], [80, -712], [120, -730], [162, -724], [168, -770], [150, -820], [106, -856], [56, -880]]),
      // hood with a soft peak
      S([[-60, -870], [-64, -930], [-52, -984], [-20, -1010], [16, -1016, 1], [46, -994], [62, -946], [64, -890], [56, -860]]),
      // boots
      S([[-84, -96, 1], [-38, -96, 1], [-34, 0, 1], [-100, 4, 1]]), S([[40, -96, 1], [86, -96, 1], [100, 4, 1], [34, 0, 1]]),
    ],
    detail: () => [
      `<path d="M-64,-930C-62,-978-40,-1004,-6,-1012" fill="none" stroke="${PAL.moon}" stroke-width="3" opacity=".45"/>`,
      `<path d="M-90,-700C-110,-500-130,-300-150,-120M-20,-700C-24,-500-30,-300-34,-100M60,-700C70,-500,90,-300,110,-120" fill="none" stroke="#231d38" stroke-width="5"/>`,
      `<path d="M-140,-760C-90,-780-40,-790,0,-792C40,-790,90,-780,140,-760" fill="none" stroke="#2a2440" stroke-width="4"/>`,
    ].join(''),
  },
};

// Lia with the sword raised toward the sky (battle stance)
FIG.liaRaise = {
  rim: PAL.lia,
  body: FIG.lia.body.map((d, i) => (i === 5
    ? S([[104, -826], [146, -846], [170, -900], [186, -962], [206, -1010], [214, -1030, 1], [236, -1016, 1], [222, -960], [204, -900], [184, -840], [160, -790], [120, -770]])
    : i === 6 ? S([[204, -1034], [222, -1052], [244, -1040], [244, -1012], [226, -1004], [208, -1012]]) : d)),
  detail: (p) => [
    `<path d="M210,-996L236,-1060" stroke="#3b2430" stroke-width="12" stroke-linecap="round"/>`,
    `<circle cx="207" cy="-990" r="9" fill="${PAL.brass}"/>`,
    `<circle cx="238" cy="-1066" r="18" fill="none" stroke="${PAL.brassHi}" stroke-width="5" stroke-dasharray="48 6 52 7"/>`,
    `<path d="M236,-1086L398,-1500L410,-1496L250,-1080Z" fill="url(#${p}-steel)"/>`,
    `<path d="M243,-1084L404,-1498" stroke="#ffffff" stroke-width="2"/>`,
    FIG.lia.detail(p).split('<path d="M8,-1030')[1] ? `<path d="M8,-1030${FIG.lia.detail(p).split('<path d="M8,-1030')[1]}` : '',
  ].join(''),
};

// Serena standing still, both sleeves hanging (observing)
FIG.serenaCalm = {
  rim: PAL.serena,
  body: [FIG.serena.body[0], FIG.serena.body[1],
    S(mirror([[-100, -800], [-126, -740], [-146, -640], [-164, -540], [-176, -476, 1], [-120, -470, 1], [-108, -560], [-100, -660]])),
    FIG.serena.body[3]],
  detail: (p) => FIG.serena.detail(p).replace(/^.*?<\/circle>|^<circle cx="252"[^]*?stroke-dasharray="10 6" opacity=".9"\/>/, ''),
};

// Silhouette with dual rim (character colour on the right, moonlight on the left) + soft glow.
// s = scale (screen px per local unit). rimW = rim thickness in screen px.
export function figure(p, key, x, y, s, opts = {}) {
  const F = FIG[key];
  const { rimW = 4, moonW = 2.5, glow = 0.45, flip = false, ink = `url(#${p}-ink)`, rim = F.rim, moonRim = PAL.moon, detail = true, id = `${p}-${key}` } = opts;
  const k = 1 / s;
  const defs = `<g id="${id}">${F.body.map((d) => `<path d="${d}"/>`).join('')}</g>`;
  const body = `<g transform="translate(${f(x)} ${f(y)}) scale(${flip ? -s : s} ${s})">`
    + (glow ? `<use href="#${id}" fill="${rim}" opacity="${glow}" filter="url(#${p}-b2)"/>` : '')
    + `<use href="#${id}" fill="${rim}" transform="translate(${f(rimW * k)} ${f(-rimW * k * 0.4)})"/>`
    + `<use href="#${id}" fill="${moonRim}" opacity=".7" transform="translate(${f(-moonW * k)} ${f(-moonW * k * 0.6)})"/>`
    + (opts.topRim ? `<use href="#${id}" fill="${opts.topRim}" opacity="${opts.topRimOp || 0.6}" transform="translate(0 ${f(-3 * k)})"/>` : '')
    + `<use href="#${id}" fill="${ink}"/>`
    + (detail ? F.detail(p) : '')
    + `</g>`;
  return { defs, body };
}

// shared gradient defs used by figure details
export function figureDefs(p) {
  return linear(`${p}-ink`, [[0, '#1d1838'], [0.55, '#0e0b1e'], [1, '#08060f']], 'gradientUnits="userSpaceOnUse" x1="0" y1="-1000" x2="0" y2="0"') + linear(`${p}-steel`, [[0, '#f4f0ff'], [0.5, '#a8a3c8'], [1, '#4b4870']], 'x1="0" y1="0" x2="1" y2="0"')
    + radial(`${p}-glowMia`, [[0, PAL.mia, 0.55], [1, PAL.mia, 0]])
    + radial(`${p}-glowSer`, [[0, PAL.serenaWhite, 0.7], [0.4, PAL.serena, 0.35], [1, PAL.serena, 0]])
    + linear(`${p}-hairEnd`, [[0, PAL.serenaWhite, 0], [1, PAL.serenaWhite, 0.32]]);
}

// ---------------------------------------------------------------------------------------------
// Eclipse moon: black disc + thin silver-violet corona + one diamond-ring bead.
// ---------------------------------------------------------------------------------------------
export function eclipse(p, cx, cy, r, opts = {}) {
  const { bead = -40, halo = 3.2 } = opts;
  const defs = radial(`${p}-corona`, [[0, '#000', 0], [0.30, '#b58cff', 0], [0.33, '#e8ddff', 0.95], [0.40, '#b58cff', 0.55], [0.6, '#6d4fc4', 0.18], [1, '#3a2a7a', 0]], 'r="0.5"');
  const a = bead * Math.PI / 180;
  const bx = cx + Math.cos(a) * r, by = cy + Math.sin(a) * r;
  const body = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * halo)}" fill="url(#${p}-corona)" opacity=".9"/>`
    + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 1.04)}" fill="none" stroke="${PAL.serenaWhite}" stroke-width="${f(Math.max(1.5, r * 0.035))}" opacity=".9"/>`
    + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="#05040c"/>`
    + `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(r * 0.22)}" fill="#ffffff" opacity=".5" filter="url(#${p}-b1)"/>`
    + `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(r * 0.06)}" fill="#ffffff"/>`;
  return { defs, body };
}

export function stars(R, n, x0, y0, x1, y1, color = PAL.moon) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = R.range(x0, x1), y = R.range(y0, y1), r = R() < 0.9 ? R.range(0.6, 1.5) : R.range(1.6, 2.4);
    out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" opacity="${f(R.range(0.25, 0.9), 2)}"/>`;
  }
  return `<g fill="${color}">${out}</g>`;
}

// ---------------------------------------------------------------------------------------------
// Memory vignettes: tiny warm life-fragments shown inside shards / frost facets (20x20 box).
// ---------------------------------------------------------------------------------------------
export function vignetteDefs(p) {
  const c = PAL.memory, c2 = PAL.oath;
  return `<g id="${p}-v0"><circle cx="6" cy="6" r="2.4" fill="${c}"/><circle cx="13" cy="8" r="1.9" fill="${c}"/><path d="M3,18L6,9L9,18ZM10.5,18L13,10.5L15.5,18Z" fill="${c}"/><path d="M8,12L11,12" stroke="${c}" stroke-width="1"/></g>`
    + `<g id="${p}-v1"><path d="M3,18V10L10,4L17,10V18Z" fill="${c}"/><rect x="8" y="11" width="4" height="4" fill="${c2}"/></g>`
    + `<g id="${p}-v2"><path d="M10,18V9" stroke="${c}" stroke-width="1.6"/><circle cx="10" cy="7" r="5.5" fill="${c}"/><path d="M14,11L16,17M12.5,17L16.5,17" stroke="${c2}" stroke-width="1"/></g>`
    + `<g id="${p}-v3"><circle cx="7" cy="5" r="2.6" fill="${c}"/><path d="M3.5,18L7,8L10.5,18Z" fill="${c}"/><circle cx="14" cy="10" r="1.7" fill="${c2}"/><path d="M12,18L14,12L16,18Z" fill="${c2}"/></g>`
    + `<g id="${p}-v4"><circle cx="10" cy="5" r="2.5" fill="${c}"/><path d="M10,7L4,18L16,18Z" fill="${c}"/><path d="M10,3C3,5,2,14,4,18" fill="none" stroke="${c2}" stroke-width="1"/></g>`
    + `<g id="${p}-v5"><path d="M2,16C6,10,14,10,18,16" fill="none" stroke="${c}" stroke-width="1.6"/><circle cx="10" cy="6" r="3" fill="${c2}"/><path d="M4,18L16,18" stroke="${c}" stroke-width="1.4"/></g>`;
}
export function vignette(p, R, x, y, size, rot = 0, op = 0.9) {
  const k = size / 20;
  return `<use href="#${p}-v${Math.floor(R() * 6)}" transform="translate(${f(x - 10 * k, 0)} ${f(y - 10 * k, 0)}) rotate(${f(rot, 0)} ${f(10 * k, 0)} ${f(10 * k, 0)}) scale(${f(k, 2)})"${op < 0.99 ? ` opacity="${f(op, 2)}"` : ''}/>`;
}

// ---------------------------------------------------------------------------------------------
// The Dream Eater (食梦兽·阿涅摩伊) building blocks. Local units: eye centre (0,0), eye radius R.
// The eye is drawn like the eclipse itself: a dark glossy eyeball, a luminous nebula iris whose
// inner rim burns like a corona, and a black eclipse pupil. The lid closes like a moon phase:
// phase 1 = full (wide open), 0 = half, negative = crescent.
// ---------------------------------------------------------------------------------------------
export function dreamEaterDefs(p) {
  return radial(`${p}-ball`, [[0, '#5a5fa8'], [0.45, '#2a2f6c'], [0.8, '#12153a'], [1, '#05060f']], 'cx="0.4" cy="0.36" r="0.66"')
    + radial(`${p}-iris`, [[0, '#000000'], [0.36, '#0c0822'], [0.39, '#ffffff'], [0.47, '#e6dcff'], [0.62, '#a28cf4'], [0.76, '#4f5cc0'], [0.88, '#2a3a86'], [0.95, '#ffb38a', 0.6], [1, '#1a1440']], 'r="0.5"')
    + radial(`${p}-irisGlow`, [[0, '#e8ddff', 0.6], [0.35, '#b58cff', 0.3], [1, '#6d4fc4', 0]])
    + radial(`${p}-lid`, [[0, '#262c62'], [0.7, '#10143a'], [1, '#070920']], 'cx="0.4" cy="0.15" r="0.9"')
    + radial(`${p}-socket`, [[0.75, '#03040b'], [0.92, '#070a1e'], [1, '#0f1636', 0]])
    + radial(`${p}-skin`, [[0, '#1f2958'], [0.55, '#0f1636'], [0.85, '#080b20'], [1, '#080b20', 0]], 'cx="0.45" cy="0.4" r="0.6"')
    + linear(`${p}-shard`, [[0, '#f6f2ff', 0.62], [0.45, '#a9bdff', 0.18], [1, '#ffb38a', 0.4]], 'x1="0" y1="0" x2="1" y2="1"')
    + radial(`${p}-lure`, [[0, '#ffffff'], [0.15, '#eafcff'], [0.35, '#8fe6ff', 0.5], [1, '#5ed7ff', 0]])
    + radial(`${p}-photo`, [[0, '#ffffff'], [0.25, '#e8ddff', 0.9], [0.5, '#b58cff', 0.25], [1, '#b58cff', 0]])
    + radial(`${p}-warm`, [[0, '#fff1e2'], [0.2, '#ffd091', 0.85], [0.5, '#ffb38a', 0.35], [1, '#ff8a6a', 0]]);
}

export function eyeOnly(p, phase = 1, opts = {}) {
  const { spin = 0, R = 100, reflect = true, seed = 77, lashes = true, fibres = 150 } = opts;
  const b = Math.abs(phase) * R;
  const vis = phase >= 0
    ? `M${-R},0A${R},${R} 0 0 0 ${R},0A${R},${f(b)} 0 0 0 ${-R},0Z`
    : `M${-R},0A${R},${R} 0 0 0 ${R},0A${R},${f(b)} 0 0 1 ${-R},0Z`;
  const lidEdge = phase >= 0 ? `M${-R},0A${R},${f(b)} 0 0 1 ${R},0` : `M${-R},0A${R},${f(b)} 0 0 0 ${R},0`;
  const clip = `<clipPath id="${p}-eyeClip"><path d="${vis}"/></clipPath>`;
  const Rr = rng(seed);
  const IR = R * 0.8;
  // iris fibres: thin radial strands with a nebula twist
  let fibL = '', fibD = '', fibW = '';
  for (let i = 0; i < fibres; i++) {
    const a0 = i / fibres * Math.PI * 2 + spin;
    const r0 = IR * Rr.range(0.4, 0.5), r1 = IR * Rr.range(0.78, 0.99), tw = 0.55 + Rr.range(-0.1, 0.1);
    const dp = R > 150 ? 0 : 1;
    const seg = `M${f(Math.cos(a0) * r0, dp)},${f(Math.sin(a0) * r0, dp)}Q${f(Math.cos(a0 + tw * 0.35) * (r0 + r1) / 2, dp)},${f(Math.sin(a0 + tw * 0.35) * (r0 + r1) / 2, dp)} ${f(Math.cos(a0 + tw) * r1, dp)},${f(Math.sin(a0 + tw) * r1, dp)}`;
    const k = Rr();
    if (k < 0.12) fibW += seg; else if (k < 0.6) fibL += seg; else fibD += seg;
  }
  let rays = '';
  for (let i = 0; i < 48; i++) {
    const a = i / 48 * Math.PI * 2 + Rr.range(-0.05, 0.05), r0 = IR * 0.38, r1 = IR * (0.44 + Rr() * Rr() * 0.22);
    rays += `M${f(Math.cos(a) * r0, 1)},${f(Math.sin(a) * r0, 1)}L${f(Math.cos(a + 0.05) * r1, 1)},${f(Math.sin(a + 0.05) * r1, 1)}`;
  }
  let specks = '';
  for (let i = 0; i < 46; i++) {
    const a = Rr() * Math.PI * 2, rr = IR * Rr.range(0.42, 0.95);
    specks += `<circle cx="${f(Math.cos(a) * rr)}" cy="${f(Math.sin(a) * rr)}" r="${f(R * Rr.range(0.004, 0.013), 2)}"/>`;
  }
  // nebula clouds
  let neb = '';
  for (let i = 0; i < 6; i++) {
    const a = spin + i * 1.05 + Rr.range(-0.3, 0.3), rr = IR * Rr.range(0.55, 0.8);
    neb += `<ellipse cx="${f(Math.cos(a) * rr)}" cy="${f(Math.sin(a) * rr)}" rx="${f(IR * 0.32)}" ry="${f(IR * 0.12)}" transform="rotate(${f(a * 180 / Math.PI + 70)} ${f(Math.cos(a) * rr)} ${f(Math.sin(a) * rr)})" fill="${i % 3 === 0 ? PAL.memory : i % 3 === 1 ? '#7fd9ff' : '#c8a8ff'}" opacity="${i % 3 === 0 ? 0.35 : 0.28}"/>`;
  }
  let lash = '';
  if (lashes) {
    for (let i = 1; i < 70; i++) {
      const t = Math.min(0.98, Math.max(0.02, i / 70 + Rr.range(-0.006, 0.006))), ang = Math.PI * (1 - t);
      const x = Math.cos(ang) * R, y = -Math.sin(ang) * b * Math.sign(phase || 1);
      const sway = Rr.range(-0.35, 0.35);
      const nx = Math.cos(ang) * 0.5 + sway, ny = 0.7 + Rr.range(-0.2, 0.2);
      const l = R * (0.03 + 0.07 * Math.sin(Math.PI * t)) * Rr.range(0.4, 1.3);
      lash += `M${f(x, 0)},${f(y, 0)}q${f(nx * l * 0.3, 0)},${f(ny * l * 0.6, 0)} ${f(nx * l, 0)},${f(ny * l, 0)}`;
    }
  }
  const body = `<circle r="${f(R * 1.9)}" fill="url(#${p}-irisGlow)" opacity="${f(0.3 + 0.45 * Math.max(0, (phase + 1) / 2), 2)}"/>`
    // socket: thick lid folds around the eye
    + `<ellipse rx="${f(R * 1.2)}" ry="${f(R * 1.12)}" fill="url(#${p}-socket)"/>`
    + `<path d="M${f(-R * 1.16)},${f(-R * 0.1)}Q${f(-R * 0.9)},${f(-R * 1.18)} ${f(R * 0.2)},${f(-R * 1.16)}" fill="none" stroke="#4a56a8" stroke-width="${f(R * 0.03)}" stroke-linecap="round" opacity=".2"/>`
    + `<path d="M${f(-R * 0.86)},${f(R * 0.84)}Q0,${f(R * 1.22)} ${f(R * 0.9)},${f(R * 0.8)}" fill="none" stroke="#38448e" stroke-width="${f(R * 0.025)}" stroke-linecap="round" opacity=".25"/>`
    + `<circle r="${f(R)}" fill="url(#${p}-lid)"/>`
    + `<path d="M${f(-R * 0.7)},${f(-R * 0.62)}Q0,${f(-R * 1.0)} ${f(R * 0.7)},${f(-R * 0.62)}" fill="none" stroke="#3b4690" stroke-width="${f(R * 0.025)}" opacity=".55"/>`
    + `<g clip-path="url(#${p}-eyeClip)">`
    + `<circle r="${f(R)}" fill="url(#${p}-ball)"/>`
    + `<circle r="${f(IR)}" fill="url(#${p}-iris)"/>`
    + neb
    + `<path d="${fibL}" fill="none" stroke="#dcd2ff" stroke-width="${f(R * 0.006, 2)}" opacity=".45"/>`
    + `<path d="${fibD}" fill="none" stroke="#120c33" stroke-width="${f(R * 0.007, 2)}" opacity=".35"/>`
    + `<path d="${fibW}" fill="none" stroke="${PAL.memory}" stroke-width="${f(R * 0.007, 2)}" opacity=".6"/>`
    + `<g fill="#fff4ea" opacity=".9">${specks}</g>`
    + `<circle r="${f(IR)}" fill="none" stroke="#0b0820" stroke-width="${f(R * 0.035)}" opacity=".8"/>`
    + `<circle r="${f(IR * 0.44)}" fill="none" stroke="#f3edff" stroke-width="${f(R * 0.07)}" opacity=".8" filter="url(#${p}-b1)"/>`
    + `<path d="${rays}" fill="none" stroke="#f6f1ff" stroke-width="${f(R * 0.008, 2)}" stroke-linecap="round" opacity=".7"/>`
    + `<circle r="${f(IR * 0.38)}" fill="#020108"/>`
    + `<circle r="${f(IR * 0.39)}" fill="none" stroke="#ffffff" stroke-width="${f(R * 0.012)}"/>`
    // wet cornea highlights: arched window reflection + rim gleam + pin light
    + (reflect ? `<path d="M${f(-R * 0.56)},${f(-R * 0.1)}V${f(-R * 0.34)}A${f(R * 0.1)},${f(R * 0.1)} 0 0 1 ${f(-R * 0.36)},${f(-R * 0.34)}V${f(-R * 0.1)}Z" fill="#ffffff" opacity=".3"/><path d="M${f(-R * 0.46)},${f(-R * 0.1)}V${f(-R * 0.44)}M${f(-R * 0.56)},${f(-R * 0.24)}H${f(-R * 0.36)}" stroke="#3a3a70" stroke-width="${f(R * 0.012)}" opacity=".6"/>` : '')
    + `<path d="M${f(R * 0.18)},${f(R * 0.86)}A${f(R * 0.88)},${f(R * 0.88)} 0 0 0 ${f(R * 0.8)},${f(R * 0.3)}" fill="none" stroke="#ffffff" stroke-width="${f(R * 0.03)}" stroke-linecap="round" opacity=".35"/>`
    + `<circle cx="${f(-R * 0.2)}" cy="${f(-R * 0.17)}" r="${f(R * 0.014)}" fill="#ffffff" opacity=".7"/><circle cx="${f(-R * 0.13)}" cy="${f(-R * 0.21)}" r="${f(R * 0.007)}" fill="#ffffff" opacity=".5"/>`
    + `<path d="${lidEdge}" fill="none" stroke="#04040e" stroke-width="${f(R * 0.22)}" opacity=".65" transform="translate(0 ${f(R * 0.07)})"/>`
    + `</g>`
    + `<path d="${lidEdge}" fill="none" stroke="#0b0d24" stroke-width="${f(R * 0.05)}"/>`
    + `<path d="${lidEdge}" fill="none" stroke="${PAL.moon}" stroke-width="${f(R * 0.016)}" opacity=".95" transform="translate(0 ${f(-R * 0.02)})"/>`
    + (lash ? `<path d="${lash}" fill="none" stroke="#c9c0ec" stroke-width="${f(Math.max(0.8, R * 0.005))}" stroke-linecap="round" opacity=".45"/>` : '')
    + `<path d="M${f(-R * 0.9)},${f(R * 0.42)}A${R},${R} 0 0 0 ${f(R * 0.5)},${f(R * 0.86)}" fill="none" stroke="#9aa6e8" stroke-width="${f(R * 0.012)}" opacity=".35"/>`;
  return { defs: clip, body };
}

// small bioluminescent photophores in moon phases (brow ridge)
export function moonBrow(p, R, count = 7, rad = 1.3, a0 = -156, a1 = -24, size = 0.075) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1), a = (a0 + (a1 - a0) * t) * Math.PI / 180;
    const x = Math.cos(a) * R * rad, y = Math.sin(a) * R * rad, r = R * size * (0.8 + 0.4 * Math.sin(Math.PI * t));
    const k = Math.cos(Math.PI * t); // 1 -> -1 : crescent -> full -> crescent
    const sweepOuter = t < 0.5 ? 1 : 0;
    const lit = Math.abs(k) < 0.2
      ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#f6f2ff"/>`
      : `<path d="M${f(x)},${f(y - r)}A${f(r)},${f(r)} 0 0 ${sweepOuter} ${f(x)},${f(y + r)}A${f(Math.abs(k) * r)},${f(r)} 0 0 ${sweepOuter} ${f(x)},${f(y - r)}Z" fill="#f6f2ff"/>`;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 3.2)}" fill="url(#${p}-photo)" opacity=".75"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 1.15)}" fill="#0a0c24" stroke="#5a64b0" stroke-width="${f(r * 0.14)}"/>${lit}`;
  }
  return s;
}

// translucent memory-shard scales as 5 reusable symbols (len 100 along +x, centred)
export function shardDefs(p, seed = 31) {
  const R = rng(seed);
  let d = '';
  for (let k = 0; k < 5; k++) {
    const w = 100 * R.range(0.32, 0.55);
    const P = [[-50, R.range(-6, 6)], [R.range(-25, 5), -w / 2], [50, R.range(-8, 8)], [R.range(0, 25), w / 2]];
    if (k > 2) P.splice(2, 0, [R.range(25, 40), -w * 0.35]);
    const dd = P.map(([x, y]) => `${f(x, 0)},${f(y, 0)}`).join('L');
    d += `<g id="${p}-sh${k}"><path d="M${dd}Z" fill="url(#${p}-shard)" stroke="${PAL.memory}" stroke-width="3" stroke-opacity=".75"/><path d="M${P.slice(0, 3).map(([x, y]) => `${f(x, 0)},${f(y, 0)}`).join('L')}" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity=".75"/></g>`;
  }
  return d;
}
export function shard(p, R, x, y, len, a, opts = {}) {
  const { vig = 0.3, op = 1, glow = false } = opts;
  let s = '';
  if (glow) s += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(len * 0.8, 0)}" fill="url(#${p}-warm)" opacity=".35"/>`;
  s += `<use href="#${p}-sh${Math.floor(R() * 5)}" transform="translate(${f(x, 0)} ${f(y, 0)}) rotate(${f(a, 0)}) scale(${f(len / 100, 2)})"${op < 1 ? ` opacity="${f(op, 2)}"` : ''}/>`;
  if (R() < vig && len > 14) s += vignette(p, R, x, y, len * 0.32, R.range(-15, 15), 0.9 * op);
  return s;
}

// pseudo-glyph "word fragments" (no <text>): little stroke clusters
export function glyph(R, x, y, s) {
  const segs = [];
  const n = 2 + Math.floor(R() * 3);
  for (let i = 0; i < n; i++) {
    const t = R();
    if (t < 0.35) { const yy = R.range(0.15, 0.85) * s; segs.push(`M${f(x + R.range(0, 0.25) * s)},${f(y + yy)}h${f(R.range(0.5, 0.8) * s)}`); }
    else if (t < 0.7) { const xx = R.range(0.15, 0.85) * s; segs.push(`M${f(x + xx)},${f(y + R.range(0, 0.2) * s)}v${f(R.range(0.5, 0.8) * s)}`); }
    else if (t < 0.85) { segs.push(`M${f(x + R.range(0, 0.3) * s)},${f(y + R.range(0.5, 1) * s)}l${f(R.range(0.4, 0.7) * s)},${f(-R.range(0.4, 0.7) * s)}`); }
    else { const cx = x + s / 2, cy = y + s / 2, rr = s * 0.3; segs.push(`M${f(cx - rr)},${f(cy)}a${f(rr)},${f(rr)} 0 1 0 ${f(rr * 2)},0`); }
  }
  return segs.join('');
}
// stream of glyphs along a curve from (x0,y0) drifting toward (x1,y1)
export function glyphStream(R, x0, y0, x1, y1, n, size, spread, color, opts = {}) {
  const { width = 1.6, op = 0.85 } = opts;
  let near = '', far = '';
  for (let i = 0; i < n; i++) {
    const t = R();
    const x = x0 + (x1 - x0) * t + R.range(-1, 1) * spread * (0.3 + t);
    const y = y0 + (y1 - y0) * t + R.range(-1, 1) * spread * 0.5 * (0.3 + t) - Math.sin(t * Math.PI) * spread * 0.6;
    const g = glyph(R, x, y, size * (1.2 - t * 0.5));
    if (t < 0.5) near += g; else far += g;
  }
  return `<path d="${near}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" opacity="${op}"/>`
    + `<path d="${far}" fill="none" stroke="${color}" stroke-width="${f(width * 0.8)}" stroke-linecap="round" opacity="${f(op * 0.5, 2)}"/>`;
}

// moth antenna: soft dusty bipectinate plume along a cubic curve
export function antenna(p, P0, C1, C2, P1, maxBarb, n, color, opts = {}) {
  const { width = 1.1, op = 0.55, shaft = 3 } = opts;
  const B = (t, i) => (1 - t) ** 3 * P0[i] + 3 * (1 - t) ** 2 * t * C1[i] + 3 * (1 - t) * t * t * C2[i] + t ** 3 * P1[i];
  const D = (t, i) => 3 * (1 - t) ** 2 * (C1[i] - P0[i]) + 6 * (1 - t) * t * (C2[i] - C1[i]) + 3 * t * t * (P1[i] - C2[i]);
  let barbs = '';
  const left = [], right = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const x = B(t, 0), y = B(t, 1), dx = D(t, 0), dy = D(t, 1);
    const L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, tx = dx / L, ty = dy / L;
    const b = maxBarb * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), 0.7) * (0.8 + 0.2 * Math.sin(i * 2.3));
    const lx = x + nx * b + tx * b * 0.9, ly = y + ny * b + ty * b * 0.9;
    const rx = x - nx * b + tx * b * 0.9, ry = y - ny * b + ty * b * 0.9;
    barbs += `M${f(lx, 0)},${f(ly, 0)}Q${f(x + nx * b * 0.2, 0)},${f(y + ny * b * 0.2, 0)} ${f(x, 0)},${f(y, 0)}Q${f(x - nx * b * 0.2, 0)},${f(y - ny * b * 0.2, 0)} ${f(rx, 0)},${f(ry, 0)}`;
    left.push([lx, ly]); right.push([rx, ry]);
  }
  const plume = `M${f(P0[0], 0)},${f(P0[1], 0)}L${left.map(([a, b]) => `${f(a, 0)},${f(b, 0)}`).join('L')}L${f(P1[0], 0)},${f(P1[1], 0)}L${right.reverse().map(([a, b]) => `${f(a, 0)},${f(b, 0)}`).join('L')}Z`;
  return `<path d="${plume}" fill="${color}" opacity="${f(op * 0.3, 2)}" filter="url(#${p}-b1)"/>`
    + `<path d="${barbs}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${op}"/>`
    + `<path d="M${f(P0[0])},${f(P0[1])}C${f(C1[0])},${f(C1[1])} ${f(C2[0])},${f(C2[1])} ${f(P1[0])},${f(P1[1])}" fill="none" stroke="${color}" stroke-width="${shaft}" stroke-linecap="round" opacity="${f(Math.min(1, op + 0.25), 2)}"/>`;
}

// anglerfish lure: thin stalk + glowing esca
export function lure(p, x0, y0, cx, cy, x1, y1, r) {
  return `<path d="M${f(x0)},${f(y0)}Q${f(cx)},${f(cy)} ${f(x1)},${f(y1)}" fill="none" stroke="#8e9ad6" stroke-width="${f(Math.max(1.5, r * 0.22))}" opacity=".6"/>`
    + `<circle cx="${f(x1)}" cy="${f(y1 + r)}" r="${f(r * 6)}" fill="url(#${p}-lure)" opacity=".55"/>`
    + `<circle cx="${f(x1)}" cy="${f(y1 + r)}" r="${f(r)}" fill="#f4feff"/>`;
}

// ---------------------------------------------------------------------------------------------
// Memory frost (记忆之霜): built from a few reusable symbols so a frost-covered scene stays small.
//   ${p}-fz0..2  feathery dendrite fronds (pointing +x, ~100 units long)
//   ${p}-fc0..2  faceted crystal clusters (fan toward +x, ~70 units)
// frost(): irregular haze band + clusters on the base line + fronds creeping outward + warm
// vignettes caught in a few facets.
// ---------------------------------------------------------------------------------------------
export function frostDefs(p, seed = 909) {
  const R = rng(seed);
  const i0 = (v) => f(v, 0);
  let d = '';
  for (let k = 0; k < 3; k++) {
    let stem = '', barbs = '';
    const bend = R.range(-10, 10);
    const yAt = (x) => bend * Math.sin(Math.PI * x / 100);
    stem = `M0,0Q50,${f(bend * 2)} 100,0`;
    const branch = (x0, y0, ang, len, bl) => {
      let s = '';
      const ca = Math.cos(ang), sa = Math.sin(ang);
      s += `M${f(x0, 0)},${f(y0, 0)}l${f(ca * len, 0)},${f(sa * len, 0)}`;
      for (let t = 4; t < len; t += 5) {
        const l = bl * Math.pow(1 - t / len, 0.75) + 1.5;
        const bx = x0 + ca * t, by = y0 + sa * t;
        for (const sg of [-1, 1]) {
          const ta = ang + sg * 1.05;
          s += `M${f(bx, 0)},${f(by, 0)}l${f(Math.cos(ta) * l, 0)},${f(Math.sin(ta) * l, 0)}`;
        }
      }
      return s;
    };
    for (let x = 3; x < 100; x += 4.4) {
      const l = 13 * Math.pow(1 - x / 100, 0.7) + 1.5;
      const y = yAt(x);
      for (const sg of [-1, 1]) barbs += `M${f(x, 0)},${f(y, 0)}l${f(Math.cos(sg * 1.05) * l, 0)},${f(Math.sin(sg * 1.05) * l, 0)}`;
    }
    for (const [x, sg, len] of [[22 + R.range(0, 8), 1, 42], [44 + R.range(0, 8), -1, 34], [64, 1, 20]]) barbs += branch(x, yAt(x), sg * 1.05, len, 8);
    d += `<g id="${p}-fz${k}"><path d="${stem}" fill="none" stroke-width="1.6"/><path d="${barbs}" fill="none" stroke-width=".8"/></g>`;
  }
  for (let k = 0; k < 3; k++) {
    let lit = '', dark = '', edge = '';
    for (let i = 0; i < 22; i++) {
      const dist = Math.pow(R(), 0.8) * 62;
      const spread = R.range(-0.9, 0.9);
      const cx = Math.cos(spread * 0.7) * dist, cy = Math.sin(spread * 0.7) * dist;
      const ang = R.pick([0, 1.047, -1.047]) + R.range(-0.2, 0.2);
      const len = (1 - dist / 85) * R.range(14, 36), w = len * R.range(0.1, 0.18);
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const P = (u, v) => [cx + u * ca - v * sa, cy + u * sa + v * ca];
      const a1 = P(-len / 2, 0), a2 = P(-len * 0.3, -w), a3 = P(len * 0.3, -w), a4 = P(len / 2, 0), a5 = P(len * 0.3, w), a6 = P(-len * 0.3, w);
      const q = (pp) => `${f(pp[0], 0)},${f(pp[1], 0)}`;
      lit += `M${q(a1)}L${q(a2)}L${q(a3)}L${q(a4)}Z`;
      dark += `M${q(a1)}L${q(a6)}L${q(a5)}L${q(a4)}Z`;
      edge += `M${q(a1)}L${q(a4)}`;
    }
    d += `<g id="${p}-fc${k}"><path d="${dark}" fill="#a99be0" fill-opacity=".5"/><path d="${lit}" fill="#f4f0ff" fill-opacity=".8"/><path d="${edge}" stroke="#ffffff" stroke-width=".7" stroke-opacity=".7"/></g>`;
  }
  return d;
}

export function frost(p, R, base, dir, reach, opts = {}) {
  const { density = 1, vig = 1, scale = 1, op = 1, haze = 0.55, ferns = 1, cornerBoost = 0.6, color = PAL.frost } = opts;
  const da = dir * Math.PI / 180;
  const ux = Math.cos(da), uy = Math.sin(da);
  const segs = [];
  let total = 0;
  for (let i = 0; i < base.length - 1; i++) {
    const Lg = Math.hypot(base[i + 1][0] - base[i][0], base[i + 1][1] - base[i][1]);
    segs.push([base[i], base[i + 1], Lg]); total += Lg;
  }
  const at = (d) => {
    for (const [a1, b1, Lg] of segs) { if (d <= Lg) { const t = d / Lg; return [a1[0] + (b1[0] - a1[0]) * t, a1[1] + (b1[1] - a1[1]) * t]; } d -= Lg; }
    return base[base.length - 1];
  };
  const ph = [R() * 6.28, R() * 6.28, R() * 6.28];
  const depthAt = (t) => reach * Math.min(1, 0.32 + 0.22 * (Math.sin(t * 9 + ph[0]) * 0.5 + 0.5) + 0.18 * (Math.sin(t * 23 + ph[1]) * 0.5 + 0.5) + cornerBoost * Math.pow(Math.max(0, 1 - t * 2.2), 2));
  const tr = (x, y, a, s) => `translate(${f(x, 0)} ${f(y, 0)}) rotate(${f(a, 0)}) scale(${f(s, 2)})`;
  let out = '';
  // haze band with an irregular frontier
  if (haze) {
    const N = Math.max(6, Math.round(total / 30));
    const Pb = [], Pf = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, [x, y] = at(t * total), dd = depthAt(t) * 0.8;
      Pb.push([x - ux * 6, y - uy * 6]); Pf.push([x + ux * dd, y + uy * dd]);
    }
    out += `<path d="${smoothPath(Pb.concat(Pf.reverse()), true)}" fill="${color}" opacity="${f(haze * 0.6, 2)}" filter="url(#${p}-b2)"/>`;
  }
  // fronds
  let fz = '';
  const nF = Math.round(total / 26 * ferns);
  for (let i = 0; i < nF; i++) {
    const t = R(), [bx, by] = at(t * total), dd = depthAt(t);
    const a = dir + R.range(-42, 42), sc = dd / 100 * R.range(0.55, 1.05) * scale;
    fz += `<use href="#${p}-fz${Math.floor(R() * 3)}" transform="${tr(bx + ux * dd * 0.1, by + uy * dd * 0.1, a, sc)}"/>`;
  }
  out += `<g stroke="${color}" stroke-linecap="round" opacity="${opts.fernOp || 0.7}">${fz}</g>`;
  // crystal clusters on the base
  let fc = '';
  const nC = Math.round(total / 30 * density);
  for (let i = 0; i < nC; i++) {
    const t = R(), [bx, by] = at(t * total), dd = depthAt(t);
    const a = dir + R.range(-40, 40), sc = Math.min(1.4, dd / 120) * R.range(0.5, 1.0) * scale;
    fc += `<use href="#${p}-fc${Math.floor(R() * 3)}" transform="${tr(bx - ux * 4, by - uy * 4, a, sc)}"/>`;
  }
  out += fc;
  // warm memory vignettes caught inside the facets
  const nV = Math.round(total / 120 * vig * density);
  for (let i = 0; i < nV; i++) {
    const t = R(), [bx, by] = at(t * total), dd = depthAt(t) * R.range(0.1, 0.4);
    const x = bx + ux * dd, y = by + uy * dd, sz = R.range(11, 19) * scale;
    out += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(sz * 1.6, 0)}" fill="url(#${p}-warm)" opacity=".55"/><path d="M${f(x - sz * 0.75, 0)},${f(y, 0)}L${f(x, 0)},${f(y - sz * 0.85, 0)}L${f(x + sz * 0.75, 0)},${f(y, 0)}L${f(x, 0)},${f(y + sz * 0.85, 0)}Z" fill="#fff3e6" fill-opacity=".22" stroke="${PAL.memory}" stroke-width="1" stroke-opacity=".8"/>` + vignette(p, R, x, y, sz, R.range(-20, 20), 0.95);
  }
  // sparkles
  let sp = '';
  for (let i = 0; i < total / 50; i++) {
    const t = R(), [bx, by] = at(t * total), dd = depthAt(t) * R.range(0, 0.9);
    sp += `<circle cx="${f(bx + ux * dd, 0)}" cy="${f(by + uy * dd, 0)}" r="${f(R.range(0.7, 1.8))}"/>`;
  }
  out += `<g fill="#ffffff">${sp}</g>`;
  return op < 1 ? `<g opacity="${f(op, 2)}">${out}</g>` : out;
}

// ---------------------------------------------------------------------------------------------
// Full Dream Eater, front view (head toward the viewer, body trailing back/up).
// Local units: eye centre (0,0), eye radius 100. Returns { defs, back, body } where back holds
// fins + antennae + body mass (draw first) and body holds head, eye, mouth, lures, words.
// ---------------------------------------------------------------------------------------------
export function dreamEaterFront(p, opts = {}) {
  const { phase = 1, mouth = 0, seed = 11, spin = 0.3, bodyShards = 40, ruff = 1, words = 40, burst = 0, fibres = 110, finSweep = 1, fins = true } = opts;
  const R = rng(seed);
  const E = eyeOnly(p, phase, { R: 100, spin, reflect: false, fibres });
  const H = mouth * 150;
  let back = '';
  // ---- whale-scale body trailing back into the dark (rim-lit from the upper left)
  const bodyPath = shape([[-230, 40], [-320, -120], [-360, -320], [-330, -520], [-250, -680], [-130, -790], [0, -830], [130, -790], [250, -680], [330, -520], [360, -320], [320, -120], [230, 40], [0, 90]]);
  back += opts.softBody ? `<ellipse cx="0" cy="-150" rx="330" ry="420" fill="#080a20" opacity=".85" filter="url(#${p}-b3)"/>` : `<path d="${bodyPath}" fill="url(#${p}-body)"/>`;
  if (!opts.softBody) back += `<path d="M-360,-320C-350,-520-260,-690-80,-810" fill="none" stroke="${opts.rimColor || PAL.moon}" stroke-width="7" opacity=".45" filter="url(#${p}-b1)"/>`;
  if (opts.rimColor && !opts.softBody) back += `<path d="M360,-320C350,-520,260,-690,80,-810M-330,-120C-300,-40-250,20-200,40M330,-120C300,-40,250,20,200,40" fill="none" stroke="${opts.rimColor}" stroke-width="6" opacity=".5" filter="url(#${p}-b1)"/>`;
  for (let i = 0; i < bodyShards; i++) {
    const t = Math.pow(R(), 0.8);
    const y = -260 - t * 540, half = 320 * Math.sin(Math.PI * (0.18 + 0.82 * (1 - t))) + 10;
    const x = R.range(-half, half);
    back += shard(p, R, x, y, (48 - t * 26) * R.range(0.7, 1.15), 90 + x * 0.12 + R.range(-18, 18), { vig: 0.45, op: 0.85 - t * 0.5, glow: R() < 0.12 });
  }
  // ---- humpback-like pectoral fins: long, narrow, knobbed leading edge, translucent tip
  if (fins) for (const side of [-1, 1]) {
    const sw = finSweep;
    const root = [230, -40], tip = [900, -560 * sw];
    const N = 12, lead = [], trail = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = root[0] + (tip[0] - root[0]) * t, y = root[1] + (tip[1] - root[1]) * Math.pow(t, 1.25);
      const nx = -(tip[1] - root[1]), ny = tip[0] - root[0], nl = Math.hypot(nx, ny);
      const w = 150 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.92 + 0.08)), 0.8) * (1 - t * 0.55);
      const bump = i > 0 && i < N ? (i % 2 ? 10 : -2) * (1 - t) : 0;
      lead.push([(x + nx / nl * (w * 0.55 + bump)) * side, y + ny / nl * (w * 0.55 + bump)]);
      trail.push([(x - nx / nl * w * 0.45) * side, y - ny / nl * w * 0.45]);
    }
    const fin = shape(lead.concat(trail.reverse().slice(1, -1)));
    back += `<path d="${fin}" fill="url(#${p}-${opts.finFill || 'fin'})"/>`;
    back += `<path d="${shape(lead, false)}" fill="none" stroke="${PAL.moon}" stroke-width="4" opacity=".6"/>`;
    let rays = '';
    for (let k = 0; k < 4; k++) {
      const o = -0.3 + k * 0.22;
      const pts2 = [];
      for (let i = 1; i < N; i += 2) { const a1 = lead[i], b1 = trail[trail.length - 1 - i] || trail[0]; pts2.push([a1[0] + (b1[0] - a1[0]) * (0.5 + o), a1[1] + (b1[1] - a1[1]) * (0.5 + o)]); }
      rays += shape(pts2, false);
    }
    back += `<path d="${rays}" fill="none" stroke="${PAL.moon}" stroke-width="2" opacity=".14"/>`;
    for (let i = 0; i < 8; i++) {
      const t = R.range(0.05, 0.8), j = Math.round(t * N);
      const a1 = lead[j], b1 = trail[trail.length - 1 - j] || trail[0], u = R.range(0.2, 0.8);
      back += shard(p, R, a1[0] + (b1[0] - a1[0]) * u, a1[1] + (b1[1] - a1[1]) * u, R.range(20, 34) * (1 - t * 0.4), side * -40 + R.range(-20, 20), { vig: 0.35, op: 0.75 });
    }
  }
  // ---- crest (moth thorax ruff) + feathered antennae
  if (!opts.softBody) back += `<path d="${shape([[-200, -150], [-150, -250], [-60, -290], [60, -290], [150, -250], [200, -150], [0, -120]])}" fill="#0b1030"/>`;
  const nb = opts.barbs || 46;
  back += antenna(p, [-70, -270], [-150, -500], [-330, -620], [-450, -800], 52, nb, '#ddd3f6', { op: 0.62, shaft: 4 });
  back += antenna(p, [70, -270], [150, -500], [330, -620], [450, -800], 52, nb, '#ddd3f6', { op: 0.62, shaft: 4 });

  let s = '';
  // ---- mouth beneath the ruff: a long dark slit (or a howling oval maw), baleen veil, throat light
  const my = 214;
  s += `<ellipse cx="0" cy="${f(my + 20 + H * 0.5, 0)}" rx="230" ry="${f(110 + H * 0.4, 0)}" fill="url(#${p}-warm)" opacity=".26"/>`;
  if (!opts.softBody && !opts.noChin) s += `<path d="${shape([[-210, my - 70], [0, my - 96], [210, my - 70], [150, my + 50 + H * 0.8], [40, my + 120 + H], [0, my + 128 + H], [-40, my + 120 + H], [-150, my + 50 + H * 0.8]])}" fill="url(#${p}-chin)"/>`;
  if (opts.noMouth) {
    // mouth hidden (lost in the dark mass)
  } else if (mouth > 0) {
    s += `<path d="M0,${f(my - 14, 0)}C${f(120 - H * 0.2, 0)},${f(my - 10, 0)} ${f(96 - H * 0.2, 0)},${f(my + H * 0.95, 0)} 0,${f(my + 14 + H, 0)}C${f(-96 + H * 0.2, 0)},${f(my + H * 0.95, 0)} ${f(-120 + H * 0.2, 0)},${f(my - 10, 0)} 0,${f(my - 14, 0)}Z" fill="url(#${p}-maw)" stroke="#3a4690" stroke-width="3"/>`;
    s += `<ellipse cx="0" cy="${f(my + H * 0.55, 0)}" rx="${f(60, 0)}" ry="${f(8 + H * 0.25, 0)}" fill="url(#${p}-warm)" opacity=".55"/>`;
  } else {
    s += `<path d="M-160,${my}C-90,${my + 6} -40,${my - 6} 0,${my - 2}S110,${my + 4} 160,${my - 2}" fill="none" stroke="#020208" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
    s += `<path d="M-140,${my + 10}C-80,${my + 14} 80,${my + 12} 140,${my + 8}" fill="none" stroke="${PAL.memory}" stroke-width="2" opacity=".4"/>`;
  }
  let fil = '';
  for (let i = 0; i < 30; i++) {
    const t = i / 29, x = -160 + t * 320 + R.range(-4, 4), y0 = my + 6 + (mouth > 0 ? H * 0.9 * Math.sin(Math.PI * t) * 0.9 : 0), Lf = R.range(50, 150) * (0.5 + 0.5 * Math.sin(Math.PI * t));
    fil += `M${f(x, 0)},${f(y0, 0)}q${f(R.range(-16, 16), 0)},${f(Lf * 0.5, 0)} ${f(R.range(-24, 24), 0)},${f(Lf, 0)}`;
  }
  if (!opts.noMouth || opts.veil) s += `<path d="${fil}" fill="none" stroke="#d8d0f4" stroke-width="1.3" opacity=".3"/>`;
  const jawTop = my;
  // ---- the ruff: memory-shard scales radiating around the eye like a corona
  const rings = [[118, 24, 34, 0.95], [150, 28, 50, 0.85], [192, 26, 70, 0.7], [236, 20, 92, 0.5]];
  for (let ri = rings.length - 1; ri >= 0; ri--) {
    const [rad, n, len, op] = rings[ri];
    for (let i = 0; i < n * ruff; i++) {
      const a = (i + R.range(-0.35, 0.35)) / n * Math.PI * 2 + ri * 0.4;
      let rr = rad + R.range(-10, 10), L2 = len * R.range(0.75, 1.2);
      const below = Math.sin(a) > 0.35;
      if (below && ri > 2) continue;
      if (below && ri === 2) L2 *= 0.6;
      let x = Math.cos(a) * rr, y = Math.sin(a) * rr * 0.96, ang = a * 180 / Math.PI + R.range(-10, 10), o = op * (Math.cos(a + 0.8) * 0.25 + 0.8);
      if (burst && R() < burst * (0.3 + ri * 0.25)) {
        const x0 = x, y0 = y, k = R.range(1.3, 2.8); x *= k; y *= k; ang += R.range(-120, 120); o *= 0.85;
        if (R() < 0.5) s += `<path d="M${f(x0 * 1.1 + (x - x0) * 0.5, 0)},${f(y0 * 1.1 + (y - y0) * 0.5, 0)}L${f(x * 0.96, 0)},${f(y * 0.96, 0)}" stroke="${PAL.oath}" stroke-width="1.5" opacity=".3"/>`;
        s += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(L2 * 0.9, 0)}" fill="url(#${p}-warm)" opacity=".45"/>`;
      }
      s += shard(p, R, x, y, L2, ang, { vig: 0.35, op: Math.min(1, o), glow: R() < 0.1 });
    }
  }
  // ---- socket skin ring + moon-phase photophores
  s += `<circle r="134" fill="url(#${p}-ring)"/>`;
  s += moonBrow(p, 100, 7, 2.02, -146, -34, 0.085);
  s += E.body;
  // ---- lures from the crest
  if (opts.lures !== false) s += lure(p, -130, -250, -560, -460, -420, 190, 11) + lure(p, 130, -254, 580, -480, 440, 230, 13);
  if (words) {
    s += glyphStream(R, -150, jawTop + 30 + H * 0.5, -460, 400 + H, Math.round(words / 2), 15, 80, '#c8f1ff', { width: 2 });
    s += glyphStream(R, 150, jawTop + 30 + H * 0.5, 470, 380 + H, Math.round(words / 2), 15, 80, '#c8f1ff', { width: 2 });
  }
  return { defs: E.defs, back, body: s };
}
export function dreamEaterFrontDefs(p) {
  return radial(`${p}-head`, [[0, '#26305f'], [0.5, '#121a40'], [1, '#070a1c']], 'cx="0.4" cy="0.32" r="0.7"')
    + linear(`${p}-body`, [[0, '#04050d', 0], [0.35, '#080b20', 0.85], [0.7, '#0e1434'], [1, '#18214c']])
    + linear(`${p}-fin`, [[0, '#9fb0ff', 0.12], [0.45, '#2a3a8a', 0.5], [1, '#0e163e', 0.92]], 'x1="0" y1="0" x2="0" y2="1"')
    + radial(`${p}-maw`, [[0, '#3a2a5a'], [0.35, '#120c2a'], [1, '#020106']], 'cx="0.5" cy="0.25" r="0.7"')
    + radial(`${p}-ring`, [[0.7, '#05060f'], [0.88, '#0e1434'], [1, '#141c48', 0]])
    + linear(`${p}-chin`, [[0, '#121a42'], [0.6, '#0a0f28'], [1, '#05070f', 0]])
    + radial(`${p}-chinR`, [[0, '#141c46'], [0.6, '#0a0f28', 0.9], [1, '#05070f', 0]], 'cx="0.5" cy="0.25" r="0.75"')
    + radial(`${p}-bodyR`, [[0, '#0d1336'], [0.55, '#090c24', 0.9], [1, '#05070f', 0]], 'cx="0.5" cy="0.8" r="0.75"');
}

// Seamless memory-frost texture tile (size T) built from the frost symbols; returns a <g id=...>.
// Use it inside <pattern>s at different scales to coat whole walls cheaply.
export function frostTile(p, T = 240, seed = 4242, opts = {}) {
  const R = rng(seed);
  const { clusters = 3, ferns = 12, vig = 2, facets = 4, color = '#d8ccff' } = opts;
  let fc = '', fz = '', vg = '';
  const wrap = (x, y, r, fn) => {
    for (const dx of [-T, 0, T]) for (const dy of [-T, 0, T]) {
      if (x + dx < -r || x + dx > T + r || y + dy < -r || y + dy > T + r) continue;
      fn(x + dx, y + dy);
    }
  };
  for (let i = 0; i < clusters; i++) {
    const x = R() * T, y = R() * T, a = R() * 360, sc = R.range(0.35, 0.8);
    const k = Math.floor(R() * 3);
    wrap(x, y, 60, (X, Y) => { fc += `<use href="#${p}-fc${k}" transform="translate(${f(X, 0)} ${f(Y, 0)}) rotate(${f(a, 0)}) scale(${f(sc, 2)})"/>`; });
  }
  for (let i = 0; i < ferns; i++) {
    const x = R() * T, y = R() * T, a = (R() < 0.5 ? -90 : 90) + R.range(-35, 35), sc = R.range(0.6, 1.25);
    const k = Math.floor(R() * 3);
    wrap(x, y, 110, (X, Y) => { fz += `<use href="#${p}-fz${k}" transform="translate(${f(X, 0)} ${f(Y, 0)}) rotate(${f(a, 0)}) scale(${f(sc, 2)})"/>`; });
  }
  for (let i = 0; i < vig; i++) {
    const x = R.range(20, T - 20), y = R.range(20, T - 20), sz = R.range(10, 15);
    vg += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(sz * 1.5, 0)}" fill="url(#${p}-warm)" opacity=".5"/>` + vignette(p, R, x, y, sz, R.range(-20, 20), 0.9);
  }
  let fa = '';
  for (let i = 0; i < facets; i++) {
    const x = R() * T, y = R() * T, a = R.range(-110, -70), sc = R.range(0.3, 0.5), k = Math.floor(R() * 5);
    wrap(x, y, 30, (X, Y) => { fa += `<use href="#${p}-sh${k}" transform="translate(${f(X, 0)} ${f(Y, 0)}) rotate(${f(a, 0)}) scale(${f(sc, 2)})" opacity=".7"/>`; });
  }
  return `<g id="${p}-ftile"><g stroke="${color}" stroke-linecap="round" opacity=".42">${fz}</g>${fa}${fc}${vg}</g>`;
}
