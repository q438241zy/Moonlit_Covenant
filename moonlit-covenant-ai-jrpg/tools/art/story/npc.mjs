// NPC busts for the story mode: 600×800, transparent, stylised back-lit silhouettes.
// Every bust shares one construction: a single silhouette group (head + hair + body + silhouetted props)
// rendered as soft glow → coloured rim (offset right/up) → cool moon rim (offset left/up) → dark ink,
// then a few interior tone planes and rim lines, and 2–3 lit signature accents. Rim = speakers.json colour.
// Geometry is authored facing LEFT (toward screen centre for the right-hand slot); `dir: 1` mirrors the
// geometry only, so the light stays consistent (moonlight upper-left, character colour on the right).
import { f, shape, pz, pl, mix, star7 } from './lib.mjs';

const r0 = (v) => f(v, 0);
const BW = 600, BH = 800;
const MOON = '#e8ddff';

// ---------------------------------------------------------------------------------------------
// shared body parts (left-facing)
// ---------------------------------------------------------------------------------------------
const S = (pts) => shape(pts, true, 0);
const circle = (cx, cy, r) => `M${r0(cx - r)},${r0(cy)}a${r0(r)},${r0(r)} 0 1 0 ${r0(r * 2)},0a${r0(r)},${r0(r)} 0 1 0 ${r0(-r * 2)},0Z`;
const T = (pts, dx = 0, dy = 0, k = 1, cx = 300, cy = 240) => pts.map(([x, y, c]) => (c ? [cx + (x - cx) * k + dx, cy + (y - cy) * k + dy, 1] : [cx + (x - cx) * k + dx, cy + (y - cy) * k + dy]));

// adult head: cranium + a three-quarter face with brow, nose, lips and chin on the left edge
const FACE = [[236, 176], [220, 206], [212, 236], [214, 250], [200, 274, 1], [214, 284], [210, 296], [216, 304], [214, 314], [224, 332], [246, 356], [282, 368], [324, 352], [366, 306], [386, 254], [372, 196]];
const FACE_SOFT = [[236, 178], [222, 208], [214, 238], [216, 252], [205, 274, 1], [216, 284], [213, 296], [218, 304], [217, 314], [228, 334], [250, 354], [282, 364], [322, 350], [364, 306], [384, 254], [372, 196]];
const head = (dx = 0, dy = 0, k = 1, soft = false) => circle(306 + dx, 230 + dy, 96 * k) + S(T(soft ? FACE_SOFT : FACE, dx, dy, k, 300, 240));
const neck = (dx = 0, dy = 0, w = 1) => S([[300 - 42 * w + dx, 320 + dy], [300 + 52 * w + dx, 316 + dy], [300 + 56 * w + dx, 430 + dy], [300 - 46 * w + dx, 434 + dy]]);
// torso from the neck down; w = shoulder half-width, sy = shoulder line
const torso = (w = 214, sy = 470, slope = 1, dx = 0) => S([[300 - 48 + dx, sy - 78], [300 - w * 0.5 + dx, sy - 56 * slope], [300 - w * 0.86 + dx, sy - 28 * slope], [300 - w + dx, sy + 8], [300 - w * 1.06 + dx, sy + 90], [300 - w * 1.1 + dx, sy + 200], [300 - w * 1.12 + dx, BH + 20], [300 + w * 1.12 + dx, BH + 20], [300 + w * 1.1 + dx, sy + 200], [300 + w * 1.06 + dx, sy + 90], [300 + w + dx, sy + 4], [300 + w * 0.86 + dx, sy - 30 * slope], [300 + w * 0.5 + dx, sy - 60 * slope], [300 + 58 + dx, sy - 82]]);

// ---------------------------------------------------------------------------------------------
// renderer
// ---------------------------------------------------------------------------------------------
function render(spec, rimArg) {
  const { id, label, dir = -1 } = spec;
  const rim = rimArg || spec.rim;
  const p = `sbNpc${id[0].toUpperCase()}${id.slice(1)}`;
  const mirror = dir > 0 ? ' transform="matrix(-1 0 0 1 600 0)"' : '';
  const inkTop = mix('#1d1838', rim, 0.1), inkMid = mix('#0e0b1e', rim, 0.05);
  const defs = [
    `<g id="${p}-sil"${mirror}>${spec.sil.map((d) => `<path d="${d}"/>`).join('')}</g>`,
    `<linearGradient id="${p}-ink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${inkTop}"/><stop offset=".55" stop-color="${inkMid}"/><stop offset="1" stop-color="#07060e"/></linearGradient>`,
    `<filter id="${p}-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>`,
    `<filter id="${p}-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>`,
    `<linearGradient id="${p}-fadeG" x1="0" y1="0" x2="0" y2="1"><stop offset=".84" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
    `<mask id="${p}-fade" maskUnits="userSpaceOnUse" x="0" y="0" width="${BW}" height="${BH}"><rect width="${BW}" height="${BH}" fill="url(#${p}-fadeG)"/></mask>`,
    ...(spec.defs ? spec.defs(p) : []),
  ];
  const ctx = { p, rim, moon: MOON, mirror };
  const body = [
    spec.back ? `<g${mirror}>${spec.back(ctx)}</g>` : '',
    `<use href="#${p}-sil" fill="${rim}" opacity=".38" filter="url(#${p}-glow)"/>`,
    `<use href="#${p}-sil" fill="${rim}" transform="translate(6 -4)"/>`,
    `<use href="#${p}-sil" fill="${MOON}" opacity=".55" transform="translate(-3.5 -3)"/>`,
    `<use href="#${p}-sil" fill="url(#${p}-ink)"/>`,
    `<g${mirror}>${(spec.tones || []).map(([d, c, op = 1]) => `<path d="${d}" fill="${c}"${op < 1 ? ` opacity="${op}"` : ''}/>`).join('')}`
      + `${(spec.lines || []).map(([d, w, op = 0.8, c = rim]) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/>`).join('')}`
      + `${spec.front ? spec.front(ctx) : ''}</g>`,
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BW} ${BH}" role="img" aria-label="${label}">\n<defs>${defs.join('')}</defs>\n<g mask="url(#${p}-fade)">${body.join('')}</g>\n</svg>\n`;
}

// ---------------------------------------------------------------------------------------------
// the cast
// ---------------------------------------------------------------------------------------------
const CAST = {};

// 亚克 — 18, blond village youth, worn cloak, the old iron sword's cloth-wrapped hilt over the shoulder
CAST.aku = {
  id: 'aku', label: '亚克：金发牧羊青年，旧斗篷，肩后露出旧铁剑剑柄', rim: '#e9c46a', dir: 1,
  sil: [
    // sword: grip + crossguard + pommel rising behind the far shoulder
    S([[404, 430], [470, 168], [486, 172], [422, 434]]),
    S([[430, 252], [516, 276], [512, 292], [426, 268]]),
    circle(482, 150, 15),
    head(0, 0, 1),
    // messy short hair: spiky crown, fringe over the brow, nape locks
    S([[214, 214], [208, 170, 1], [236, 176], [238, 132, 1], [268, 150], [288, 104, 1], [312, 140], [350, 106, 1], [360, 146], [406, 132, 1], [396, 170], [430, 186, 1], [404, 214], [420, 252, 1], [396, 264], [404, 306, 1], [376, 300], [354, 250], [300, 214], [262, 226], [240, 252, 1], [234, 220]]),
    neck(0, 0, 0.94),
    torso(188, 478, 1.1),
    // cloak: hood bunched behind the neck, folds falling over the shoulders
    S([[236, 396], [300, 378], [380, 384], [430, 404], [470, 440], [440, 452], [380, 430], [300, 420], [240, 436], [190, 452], [160, 440]]),
  ],
  tones: [
    [S([[214, 214], [208, 170], [236, 176], [238, 132], [268, 150], [288, 104], [312, 140], [350, 106], [360, 146], [406, 132], [396, 170], [404, 214], [376, 236], [330, 216], [290, 200], [262, 214], [240, 240]]), '#3a3020', 0.85],
    [S([[96, 520], [150, 470], [230, 440], [300, 430], [370, 438], [450, 470], [504, 520], [520, 820], [80, 820]]), '#221c2a', 0.9],
    // the cloak hangs open: a darker tunic between its edges
    [S([[262, 440], [300, 452], [334, 440], [352, 820], [238, 820]]), '#120f1a', 0.95],
  ],
  lines: [
    [pl([[288, 104], [300, 150], [282, 196]]) + pl([[350, 106], [346, 158], [326, 200]]) + pl([[406, 132], [384, 176], [360, 214]]), 3, 0.75],
    [pl([[386, 256], [366, 306], [324, 352]]), 3.5, 0.85],
    [pl([[170, 470], [230, 446], [262, 440]]) + pl([[334, 440], [380, 446], [452, 476]]) + pl([[334, 440], [352, 820]]), 2.5, 0.6],
    [pl([[150, 560], [170, 760]]) + pl([[430, 560], [446, 760]]), 2, 0.35],
    [pl([[380, 384], [430, 404], [470, 440]]), 3, 0.7],
  ],
  front: ({ rim }) => {
    // the hilt's lit metal + the old cloth strip wound on the grip, one end fluttering
    let s = `<path d="M430,252L516,276" stroke="#c8c0b0" stroke-width="3" opacity=".75"/><circle cx="482" cy="150" r="8" fill="#9a948a"/>`;
    s += `<path d="M454,214l24,7M450,232l24,7M460,196l22,6" stroke="#b89a6a" stroke-width="6" stroke-linecap="round"/>`;
    s += `<path d="M476,200q20,-4 34,8q-14,0 -22,8z" fill="#a8885a"/>`;
    s += `<path d="M470,168L436,300" stroke="${rim}" stroke-width="2" opacity=".7"/>`;
    // cloak clasp at the collar; a glint at the eye line, nothing more
    s += `<circle cx="300" cy="446" r="9" fill="#b8944a"/><circle cx="297" cy="443" r="3" fill="#fff0c0"/>`;
    s += `<path d="M232,262h14" stroke="${rim}" stroke-width="2.5" opacity=".8"/>`;
    return s;
  },
};

// 艾琳 — late 30s, dark-brown hair loosely pinned up with a wheat-ear hairpin, apron over a work dress
CAST.erin = {
  id: 'erin', label: '艾琳：随意盘起的深棕长发与麦穗发夹，围裙', rim: '#d9a77a',
  sil: [
    head(0, 6, 0.96, true),
    // hair swept back into a loose bun; strands escaping at the temple and nape
    S([[226, 200], [236, 158], [276, 132], [330, 128], [378, 150], [402, 190], [404, 236], [392, 270], [380, 292], [362, 240], [320, 206], [270, 196], [244, 214]]),
    S([[372, 168], [410, 138], [456, 146], [478, 182], [470, 222], [436, 240], [400, 228]]),
    S([[226, 210], [216, 262], [222, 300], [212, 330], [232, 300], [236, 250]]),
    S([[384, 270], [400, 312], [394, 350], [410, 380], [380, 352], [376, 300]]),
    neck(0, 6, 0.92),
    torso(196, 486, 1.15),
  ],
  tones: [
    [S([[236, 158], [276, 132], [330, 128], [378, 150], [402, 190], [404, 236], [380, 280], [356, 236], [312, 204], [262, 200], [232, 214]]), '#3a2620', 0.9],
    [S([[372, 168], [410, 138], [456, 146], [478, 182], [470, 222], [436, 240], [400, 228]]), '#4a3024', 0.9],
    // apron bib + skirt, straps over the shoulders
    [S([[226, 520], [374, 520], [392, 820], [208, 820]]), '#2e2632', 0.95],
    [S([[218, 440], [236, 430], [246, 524], [228, 524]]) + S([[364, 430], [382, 438], [372, 524], [354, 524]]), '#2e2632', 0.95],
  ],
  lines: [
    [pl([[384, 256], [364, 306], [322, 350]]), 3.5, 0.85],
    [pl([[92, 600], [124, 590]]) + pl([[508, 596], [478, 588]]), 4, 0.6],
    [pl([[276, 140], [332, 136], [380, 160]]) + pl([[262, 172], [318, 160], [370, 184]]), 2.5, 0.6],
    [pl([[226, 520], [374, 520]]) + pl([[300, 600], [304, 800]]), 2.5, 0.6],
    [pl([[236, 430], [246, 524]]) + pl([[382, 438], [372, 524]]), 2, 0.55],
  ],
  front: ({ rim }) => {
    // the wheat-ear hairpin through the bun (gold), flour dust on the apron
    let s = `<path d="M396,206L488,150" stroke="#e8c27a" stroke-width="4" stroke-linecap="round"/>`;
    for (let i = 0; i < 5; i++) { const x = 470 + i * 7, y = 160 - i * 4.4; s += `<path d="M${x},${y}q-6,-8 -2,-14q6,6 2,14zM${x},${y}q8,-4 12,2q-8,4 -12,-2z" fill="#f2d088"/>`; }
    s += `<g fill="#e8dcc8" opacity=".5"><circle cx="262" cy="600" r="2.5"/><circle cx="300" cy="640" r="2"/><circle cx="330" cy="590" r="3"/><circle cx="284" cy="700" r="2"/><circle cx="346" cy="680" r="2.5"/></g>`;
    s += `<path d="M228,270h12" stroke="${rim}" stroke-width="2.5" opacity=".8"/>`;
    return s;
  },
};

// 托比 — 8, messy pale-blond hair, clutching a shepherd's crook taller than himself
CAST.toby = {
  id: 'toby', label: '托比：八岁，乱翘的浅金发，抱着比自己还高的牧羊杖', rim: '#f2d48b',
  sil: [
    // the crook: a staff from the bottom edge to above his head, hooked at the top
    S([[150, 820], [150, 150], [164, 150], [164, 820]]),
    `M157,152C157,92 196,62 236,70C276,78 290,116 276,146L262,140C272,118 262,92 236,86C206,80 172,104 172,152Z`,
    head(10, 132, 0.84, true),
    // messy tufts sticking up and out
    S([[226, 330], [222, 296], [244, 290], [250, 262], [278, 262], [296, 236], [322, 252], [350, 236], [366, 262], [396, 262], [404, 292], [424, 312], [406, 334], [410, 366], [384, 366], [360, 330], [310, 318], [270, 326], [248, 350]]),
    circle(300, 238, 9) + circle(352, 232, 8) + circle(420, 318, 8),
    neck(10, 140, 0.8),
    torso(152, 560, 1.2, 10),
    // little fist around the staff
    circle(170, 560, 30),
  ],
  tones: [
    [S([[226, 330], [222, 296], [244, 290], [250, 262], [278, 262], [296, 236], [322, 252], [350, 236], [366, 262], [396, 262], [404, 292], [396, 340], [370, 344], [330, 316], [290, 306], [262, 318], [244, 340]]), '#4a4026', 0.85],
    [S([[180, 600], [250, 560], [330, 556], [400, 572], [450, 620], [470, 820], [160, 820]]), '#22202e', 0.9],
  ],
  lines: [
    [`M296,240C306,262 300,290 286,312M350,240C356,264 348,292 330,316M396,266C390,290 380,306 366,320`, 3, 0.7],
    [pl([[372, 374], [356, 412], [318, 448]]), 3, 0.8],
    [pl([[164, 820], [164, 150]]) + `M276,146C290,116 276,78 236,70`, 2.5, 0.8],
  ],
  front: ({ rim }) => `<path d="M150,600V820" stroke="#7a5a3a" stroke-width="3" opacity=".6"/><path d="M146,548q24,-14 46,4" fill="none" stroke="${rim}" stroke-width="2.5" opacity=".8"/><path d="M240,384h11" stroke="${rim}" stroke-width="2.5" opacity=".8"/>`,
};

// 玛拉 — the baker: headscarf knotted at the nape, sturdy shoulders, sleeves pushed up, flour
CAST.mara = {
  id: 'mara', label: '玛拉：头巾在脑后打结的面包师', rim: '#e8b07a',
  sil: [
    head(0, 8, 0.98, true),
    // headscarf over the crown, knot + two tails at the back
    S([[220, 214], [228, 160], [270, 128], [330, 122], [384, 144], [410, 186], [412, 236], [398, 262], [360, 230], [300, 210], [246, 222]]),
    S([[396, 226], [436, 212], [452, 236], [430, 256], [404, 252]]),
    S([[426, 244], [478, 300], [462, 318], [418, 262]]) + S([[420, 252], [452, 330], [432, 336], [410, 264]]),
    neck(0, 8, 1),
    torso(218, 488, 1.1),
  ],
  tones: [
    [S([[228, 160], [270, 128], [330, 122], [384, 144], [410, 186], [412, 236], [398, 262], [360, 230], [300, 210], [246, 222], [226, 210]]), '#3e2a24', 0.9],
    [S([[224, 540], [376, 540], [398, 820], [200, 820]]), '#2c2430', 0.92],
  ],
  lines: [
    [pl([[386, 262], [366, 312], [324, 356]]), 3.5, 0.85],
    [pl([[246, 168], [304, 150], [370, 168]]) + pl([[238, 200], [300, 184], [380, 206]]), 2.5, 0.65],
    [pl([[224, 540], [376, 540]]), 2.5, 0.6],
  ],
  front: ({ rim }) => {
    let s = `<g fill="#f4ecdc" opacity=".55"><circle cx="110" cy="600" r="3"/><circle cx="126" cy="586" r="2"/><circle cx="480" cy="596" r="3"/><circle cx="270" cy="620" r="2.5"/><circle cx="320" cy="660" r="2"/><circle cx="350" cy="610" r="2.5"/></g>`;
    s += `<path d="M86,614l40,-12M514,610l-38,-12" stroke="${rim}" stroke-width="4" opacity=".55"/>`;
    s += `<path d="M230,276h12" stroke="${rim}" stroke-width="2.5" opacity=".8"/>`;
    return s;
  },
};

// 伯伦 — old blacksmith: huge shoulders, bald head with a sweat-band, short thick beard,
// the long-handled hammer resting on his shoulder
CAST.borin = {
  id: 'borin', label: '伯伦：宽肩老铁匠，扛着长柄锤', rim: '#c9875a',
  sil: [
    // hammer: long handle over the far shoulder, heavy head up behind
    S([[110, 820], [420, 196], [436, 204], [128, 828]]),
    S([[388, 150], [470, 186], [446, 242], [362, 206]]),
    head(0, 14, 1.02),
    // short thick beard on jaw and chin
    S([[210, 300], [226, 346], [258, 380], [300, 392], [344, 374], [372, 336], [380, 300], [350, 330], [300, 340], [250, 330]]),
    neck(0, 20, 1.35),
    torso(262, 482, 0.8),
    // big fist on the haft at chest height
    S([[196, 560], [214, 524], [262, 520], [282, 552], [270, 594], [222, 600]]),
  ],
  tones: [
    // leather apron
    [S([[210, 520], [390, 520], [410, 820], [190, 820]]), '#2a1e1c', 0.95],
    [S([[200, 446], [222, 440], [232, 524], [212, 524]]) + S([[378, 440], [400, 446], [388, 524], [368, 524]]), '#2a1e1c', 0.95],
    [S([[210, 300], [226, 346], [258, 380], [300, 392], [344, 374], [372, 336], [380, 300], [350, 330], [300, 340], [250, 330]]), '#3a2a26', 0.85],
    // the haft across the chest to the shoulder, and the fist around it
    [S([[226, 600], [376, 300], [392, 308], [244, 608]]), '#4a3426', 1],
    [S([[196, 560], [214, 524], [262, 520], [282, 552], [270, 594], [222, 600]]), '#2e2430', 1],
  ],
  lines: [
    [pl([[392, 284], [376, 330], [344, 374]]), 3.5, 0.85],
    [`M226,176C260,150 330,146 380,170`, 6, 0.55, '#7a4a3a'],
    [pl([[210, 520], [390, 520]]) + pl([[300, 560], [300, 800]]), 2.5, 0.55],
    [pl([[60, 560], [96, 500], [170, 460]]) + pl([[540, 560], [504, 500], [430, 460]]), 3, 0.6],
  ],
  front: ({ rim }) => `<path d="M388,150L470,186" stroke="#d8d0c8" stroke-width="4" opacity=".8"/><path d="M470,186L446,242" stroke="${rim}" stroke-width="3" opacity=".8"/><path d="M436,204L376,322" stroke="${rim}" stroke-width="2.5" opacity=".7"/><path d="M392,308L300,492" stroke="${rim}" stroke-width="2" opacity=".55"/><path d="M216,534q24,-12 52,-4M212,556q26,-8 58,0M214,578q24,-6 50,0" fill="none" stroke="${rim}" stroke-width="2" opacity=".6"/><path d="M262,520q20,8 20,32" fill="none" stroke="${rim}" stroke-width="2.5" opacity=".8"/><path d="M226,176C260,150 330,146 380,170" fill="none" stroke="#8a5a40" stroke-width="10" opacity=".8"/><path d="M232,280h12" stroke="${rim}" stroke-width="2.5" opacity=".7"/>`,
};

// 霍恩 — the elderly village chief: thinning swept-back hair, long beard over the chest, fur-collared mantle
CAST.horn = {
  id: 'horn', label: '霍恩：留长须的年迈村长，毛领披风', rim: '#b8a07a',
  sil: [
    head(0, 10, 0.98),
    S([[232, 196], [250, 150], [300, 132], [356, 140], [396, 176], [404, 226], [394, 270], [372, 230], [320, 196], [262, 196]]),
    // long beard flowing down onto the chest
    S([[208, 296], [214, 360], [232, 430], [262, 500], [300, 540], [330, 504], [356, 440], [372, 370], [378, 300], [344, 340], [300, 350], [248, 336]]),
    neck(0, 14, 1.05),
    torso(222, 486, 1.1),
    // fur collar
    S([[150, 452], [190, 420], [240, 410], [300, 420], [360, 410], [416, 420], [456, 452], [430, 480], [380, 462], [300, 470], [220, 462], [170, 480]]),
  ],
  tones: [
    [S([[208, 296], [214, 360], [232, 430], [262, 500], [300, 540], [330, 504], [356, 440], [372, 370], [378, 300], [344, 340], [300, 350], [248, 336]]), '#3a3430', 0.9],
    [S([[100, 520], [170, 486], [430, 486], [500, 520], [520, 820], [80, 820]]), '#221e2a', 0.9],
  ],
  lines: [
    [pl([[230, 330], [244, 410], [270, 470]]) + pl([[270, 340], [282, 430], [298, 500]]) + pl([[320, 344], [326, 430], [318, 490]]), 2.5, 0.65],
    [pl([[386, 262], [376, 300]]), 3.5, 0.8],
    [pl([[150, 452], [190, 426], [240, 416]]) + pl([[360, 416], [416, 426], [456, 452]]), 3, 0.7],
    [pl([[250, 156], [300, 142], [356, 150], [394, 182]]), 2.5, 0.6],
  ],
  front: ({ rim }) => `<path d="M234,262q8,-4 16,0" stroke="${rim}" stroke-width="2.5" fill="none" opacity=".8"/><circle cx="300" cy="600" r="8" fill="#c8a868"/><path d="M300,592v16M292,600h16" stroke="#7a5a30" stroke-width="2"/>`,
};

// 白·可恩 — tall white-robed mage: high-collared robe, hair tied back, the silver staff crowned by
// three separate rings of light
CAST.kern = {
  id: 'kern', label: '白·可恩：白袍魔术师，杖首悬着三枚光环', rim: '#e8edf7',
  sil: [
    // staff in front (left), from the bottom edge up past his head
    S([[140, 820], [146, 120], [160, 120], [158, 820]]),
    head(0, -14, 0.96),
    S([[226, 184], [244, 136], [292, 112], [350, 116], [394, 148], [410, 196], [404, 246], [384, 270], [366, 224], [320, 190], [262, 186]]),
    // hair tied at the nape, a tail falling down the back
    S([[392, 250], [424, 300], [434, 380], [420, 440], [400, 420], [404, 340], [378, 280]]),
    neck(0, -10, 0.92),
    torso(212, 468, 1.2),
    // high standing collar of the robe
    S([[236, 360], [258, 330], [300, 350], [356, 330], [380, 360], [384, 430], [300, 440], [228, 430]]),
    // hand on the staff
    S([[124, 548], [150, 524], [190, 532], [196, 580], [168, 598], [128, 588]]),
  ],
  tones: [
    // the white robe catches far more light than the others' clothes
    [S([[96, 500], [170, 450], [236, 436], [300, 444], [370, 436], [440, 452], [504, 500], [516, 820], [84, 820]]), '#4a5468', 0.85],
    [S([[236, 360], [258, 330], [300, 350], [356, 330], [380, 360], [384, 430], [300, 440], [228, 430]]), '#5a6478', 0.85],
    [S([[300, 444], [314, 820], [290, 820]]), '#2a3040', 0.7],
  ],
  lines: [
    [pl([[392, 240], [372, 290], [330, 336]]), 3.5, 0.9],
    [pl([[258, 330], [300, 350], [356, 330]]) + pl([[300, 350], [300, 440]]), 2.5, 0.8],
    [pl([[160, 820], [160, 120]]), 2.5, 0.85],
    [pl([[150, 470], [236, 436], [300, 444], [370, 436], [460, 470]]) + pl([[240, 520], [230, 800]]) + pl([[366, 520], [380, 800]]), 2.5, 0.6],
    [pl([[244, 136], [292, 118], [350, 122], [394, 154]]), 2.5, 0.7],
  ],
  back: () => `<circle cx="152" cy="100" r="110" fill="url(#sbNpcKern-ringGlow)"/>`,
  defs: (p) => [`<radialGradient id="${p}-ringGlow"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".4" stop-color="#e8edf7" stop-opacity=".2"/><stop offset="1" stop-color="#e8edf7" stop-opacity="0"/></radialGradient>`],
  front: ({ p }) => {
    // three rings of light floating apart above the staff head
    let s = '';
    for (const [cy, rx, ry, op] of [[100, 46, 13, 1], [72, 36, 10, 0.9], [48, 26, 7, 0.8]]) {
      s += `<ellipse cx="153" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#ffffff" stroke-width="10" opacity="${op * 0.35}" filter="url(#${p}-soft)"/>`;
      s += `<ellipse cx="153" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#fffaf0" stroke-width="3.5" opacity="${op}"/>`;
    }
    s += `<path d="M146,120h14l-7,-12z" fill="#e8edf7"/>`;
    return s;
  },
};

// 梅芙 — guild registrar: black hair pinned up with a quill pen, a monocle over the left eye,
// a buttoned clerk's coat with a high collar
CAST.maeve = {
  id: 'maeve', label: '梅芙：用羽毛笔盘起黑发、戴单片读取镜的登记官', rim: '#9fc6a8',
  sil: [
    head(0, 4, 0.95, true),
    S([[222, 204], [230, 156], [272, 126], [330, 120], [380, 144], [404, 190], [402, 240], [388, 272], [364, 228], [316, 198], [262, 196], [240, 220]]),
    // high bun
    S([[318, 132], [338, 92], [384, 86], [412, 114], [404, 150], [366, 160]]),
    // the quill stuck through the bun
    S([[350, 120], [470, 30], [480, 38], [362, 130]]),
    neck(0, 6, 0.88),
    torso(196, 482, 1.1),
    S([[246, 392], [300, 410], [356, 392], [360, 440], [300, 452], [242, 440]]),
  ],
  tones: [
    [S([[230, 156], [272, 126], [330, 120], [380, 144], [404, 190], [402, 240], [388, 272], [364, 228], [316, 198], [262, 196], [232, 212]]), '#1a1a26', 0.9],
    [S([[100, 520], [170, 480], [430, 480], [500, 520], [516, 820], [84, 820]]), '#1e2a26', 0.9],
  ],
  lines: [
    [pl([[384, 262], [364, 310], [322, 352]]), 3.5, 0.85],
    [pl([[300, 452], [300, 800]]), 2.5, 0.6],
    [pl([[272, 134], [330, 128], [380, 152]]), 2.5, 0.55],
    [pl([[246, 392], [300, 410], [356, 392]]), 2.5, 0.7],
  ],
  front: ({ rim, p }) => {
    // quill: white feather vanes, ink-dark nib
    let s = `<path d="M470,30C440,40 400,70 372,112C392,96 430,70 476,40Z" fill="#f2f0e8"/><path d="M470,30C450,56 412,92 380,118C406,104 446,74 478,38Z" fill="#c8d8cc" opacity=".8"/><path d="M356,124l-10,10" stroke="#1a1a26" stroke-width="3"/>`;
    // monocle over her left eye (the far side for a left-facing three-quarter view sits near the nose)
    s += `<circle cx="248" cy="262" r="17" fill="#9fc6a8" opacity=".18"/><circle cx="248" cy="262" r="17" fill="none" stroke="#d8e8dc" stroke-width="3"/><path d="M238,254a12,12 0 0 1 12,-6" fill="none" stroke="#ffffff" stroke-width="2.5" opacity=".9"/><path d="M265,264q30,40 20,110" fill="none" stroke="#c8d8cc" stroke-width="1.5" opacity=".7"/>`;
    // coat buttons
    for (const y of [500, 560, 620, 680]) s += `<circle cx="300" cy="${y}" r="5" fill="#c8b070"/>`;
    return s;
  },
};

// 罗奇 — lean, stooped thief: scruffy hair under a loose hood, scarf, a short dagger hidden behind the elbow
CAST.rocky = {
  id: 'rocky', label: '罗奇：瘦高窃贼，匕首藏在肘后', rim: '#8f9a6b',
  sil: [
    head(-34, 62, 0.9),
    // loose hood pushed back (bunched high behind the head) + scruffy fringe
    S([[190, 282], [198, 228], [238, 192], [300, 180], [360, 196], [404, 236], [426, 286], [430, 340], [412, 392], [380, 420], [366, 360], [346, 296], [296, 262], [246, 262], [216, 288], [208, 272]]),
    S([[190, 268], [182, 300, 1], [202, 294], [206, 322, 1], [220, 294], [238, 264]]),
    // scarf wound high around the neck
    S([[196, 392], [236, 388], [306, 394], [350, 372], [372, 412], [340, 452], [280, 462], [212, 446]]),
    neck(-34, 62, 0.8),
    torso(156, 520, 1.5, -10),
    // the arm crooked up on the near side, the dagger's blade peeking out behind the elbow
    S([[108, 560], [150, 520], [206, 540], [214, 600], [170, 640], [118, 632]]),
    S([[160, 590], [110, 470], [122, 466], [176, 584]]),
  ],
  tones: [
    [S([[196, 392], [236, 388], [306, 394], [350, 372], [372, 412], [340, 452], [280, 462], [212, 446]]), '#2e3426', 0.9],
    [S([[140, 560], [210, 524], [390, 524], [450, 560], [460, 820], [130, 820]]), '#1e2220', 0.9],
  ],
  lines: [
    [pl([[370, 322], [352, 368], [314, 402]]), 3, 0.8],
    [pl([[198, 228], [238, 196], [300, 184], [360, 200], [404, 240], [426, 290], [428, 340]]), 3, 0.65],
    [pl([[212, 446], [280, 458], [340, 450]]), 2.5, 0.6],
  ],
  front: ({ rim }) => `<path d="M122,466L110,470L160,590" fill="none" stroke="#e8f0e0" stroke-width="3" opacity=".9"/><path d="M114,470l4,-14l8,10z" fill="#f4f8f0"/><path d="M160,590l20,-10" stroke="#5a4a3a" stroke-width="7" stroke-linecap="round"/><path d="M200,332h11" stroke="${rim}" stroke-width="2.5" opacity=".75"/>`,
};

// 黑袍人 — hood and black robe, the face lost in shadow; a black-gloved hand raised, an inverted
// seven-pointed star faintly alight on its back
CAST.blackrobe = {
  id: 'blackrobe', label: '黑袍人：兜帽遮面，黑手套背面的倒置七角星', rim: '#7a5c9e',
  sil: [
    // deep hood, pointed, falling into the robe
    S([[186, 330], [196, 230], [236, 150], [300, 102], [356, 96], [404, 130], [430, 200], [440, 290], [436, 380], [470, 440], [300, 470], [150, 440], [176, 390]]),
    torso(226, 486, 1.25),
    // raised gloved hand (back toward us) on the left
    S([[118, 470], [126, 420], [146, 386], [162, 330, 1], [172, 384], [182, 320, 1], [192, 380], [202, 326, 1], [208, 384], [222, 340, 1], [222, 400], [214, 470], [196, 520], [150, 530]]),
    S([[136, 520], [214, 500], [252, 620], [166, 660]]),
  ],
  tones: [
    // the void inside the hood
    [S([[224, 270], [246, 196], [300, 152], [360, 158], [392, 214], [396, 300], [370, 360], [300, 380], [240, 350]]), '#030205', 1],
    [S([[300, 470], [320, 820], [280, 820]]), '#0c0a14', 0.8],
  ],
  lines: [
    [pl([[236, 150], [300, 102], [356, 96], [404, 130], [430, 200]]), 3, 0.7],
    [pl([[224, 270], [246, 196], [300, 152], [360, 158]]), 2, 0.45, MOON],
    [pl([[162, 330], [172, 384]]) + pl([[182, 320], [192, 380]]) + pl([[202, 326], [208, 384]]), 2, 0.5],
  ],
  front: ({ p }) => {
    // the inverted morning star on the back of the glove: faint violet light
    let s = `<path d="${star7(176, 440, 30, 0.46, 180)}" fill="#7a5c9e" opacity=".45" filter="url(#${p}-soft)"/>`;
    s += `<path d="${star7(176, 440, 24, 0.46, 180)}" fill="none" stroke="#c8a8ff" stroke-width="2.2" opacity=".9"/>`;
    s += `<circle cx="176" cy="440" r="31" fill="none" stroke="#b58cff" stroke-width="1.4" opacity=".6"/>`;
    // the faintest chin edge inside the hood
    s += `<path d="M262,350q30,18 60,6" fill="none" stroke="#5a4a70" stroke-width="2" opacity=".6"/>`;
    return s;
  },
};

export const npcBusts = Object.fromEntries(Object.entries(CAST).map(([id, spec]) => [id, (rim) => render(spec, rim)]));
