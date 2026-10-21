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
  const p = `sbNpc${id[0].toUpperCase()}${id.slice(1).replace(/_(\w)/g, (m, c) => c.toUpperCase())}`; // goblin_chief -> sbNpcGoblinChief
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

// 芬恩 — twenties, the relief society's cart driver cowering in the ditch: soft cap knocked askew, head
// sunk between raised shoulders, one hand thrown up palm-out; white wood shavings all over his vest,
// the soup-bowl badge of the 湯碗救濟會 on its breast
CAST.finn = {
  id: 'finn', label: '芬恩：缩着肩、抬手求饶的年轻车夫，背心上沾满白木屑', rim: '#c9b48a',
  sil: [
    head(-14, 40, 0.96),
    // soft flat cap, the brim jutting forward-left, pushed back on the crown
    S([[200, 262], [166, 266, 1], [190, 248], [206, 222], [240, 190], [290, 170], [344, 172], [386, 194], [404, 232], [398, 262], [366, 254], [316, 246], [258, 250], [226, 260]]),
    // hair escaping under the cap at the nape and over the ear
    S([[376, 250], [404, 266], [410, 292, 1], [396, 284], [398, 314, 1], [380, 300], [366, 276]]),
    neck(-14, 40, 0.9),
    // hunched torso: shoulders pulled up toward the ears
    S([[262, 386], [214, 394], [160, 400], [118, 424], [98, 472], [90, 560], [86, 700], [84, 820], [516, 820], [514, 700], [506, 560], [494, 472], [468, 420], [424, 398], [380, 390], [344, 378]]),
    // forearm thrown up in front of the face, the hand open and splayed (please — don't)
    S([[132, 470], [124, 444], [110, 426], [96, 406], [98, 396], [108, 396], [121, 404, 1], [120, 366], [116, 324], [120, 312], [129, 316], [134, 356, 1], [140, 310], [146, 298], [155, 304], [154, 352, 1], [164, 314], [171, 306], [177, 313], [172, 358, 1], [184, 332], [191, 326], [195, 334], [186, 376], [182, 424], [178, 470], [216, 560], [236, 640], [186, 652], [156, 560]]),
  ],
  tones: [
    // cap cloth
    [S([[200, 262], [166, 266], [190, 248], [206, 222], [240, 190], [290, 170], [344, 172], [386, 194], [404, 232], [398, 262], [366, 254], [316, 246], [258, 250], [226, 260]]), '#3a3226', 0.85],
    // the vest (two open panels) over a lighter shirt, neckerchief at the throat
    [S([[124, 450], [196, 418], [262, 410], [282, 470], [288, 820], [96, 820], [100, 560]]) + S([[340, 404], [420, 414], [480, 448], [500, 560], [506, 820], [330, 820], [322, 470]]), '#2c2622', 0.92],
    [S([[262, 410], [340, 404], [322, 470], [330, 820], [288, 820], [282, 470]]), '#3a3844', 0.85],
    [S([[256, 404], [300, 420], [346, 398], [338, 430], [304, 446], [270, 434]]) + S([[296, 440], [316, 440], [326, 494], [304, 486]]), '#5a3a2c', 0.9],
    // the raised hand and sleeve, a shade lighter than the body
    [S([[132, 470], [124, 444], [110, 426], [96, 406], [98, 396], [108, 396], [121, 404, 1], [120, 366], [116, 324], [120, 312], [129, 316], [134, 356, 1], [140, 310], [146, 298], [155, 304], [154, 352, 1], [164, 314], [171, 306], [177, 313], [172, 358, 1], [184, 332], [191, 326], [195, 334], [186, 376], [182, 424], [178, 470]]), '#34303a', 0.9],
    [S([[132, 470], [178, 470], [216, 560], [236, 640], [186, 652], [156, 560]]), '#3a3844', 0.85],
  ],
  lines: [
    // jaw/cheek rim, cap crown and seam, brim edge
    [pl([[370, 296], [350, 344], [310, 386]]), 3.5, 0.85],
    [pl([[206, 222], [240, 190], [290, 170], [344, 172], [386, 194], [404, 232]]) + pl([[248, 186], [300, 214], [338, 250]]), 2.5, 0.6],
    [pl([[166, 266], [200, 262], [226, 260]]), 2.5, 0.75],
    // shoulders hunched up; vest edges
    [pl([[106, 456], [160, 404], [214, 394]]) + pl([[380, 390], [440, 404], [488, 450]]), 3, 0.6],
    [pl([[262, 410], [282, 470], [288, 800]]) + pl([[340, 404], [322, 470], [330, 800]]), 2.5, 0.55],
    // the raised hand's fingers and sleeve edge catching the rim
    [pl([[120, 318], [124, 360]]) + pl([[146, 304], [148, 350]]) + pl([[171, 310], [168, 354]]) + pl([[192, 332], [186, 376], [182, 424]]), 2, 0.65],
    [pl([[178, 470], [216, 560], [236, 640]]), 2.5, 0.6],
  ],
  front: ({ rim }) => {
    // white wood shavings: little curled peels caught on the vest, the shoulders and the cap brim
    let curls = '';
    for (const [x, y, s, r] of [[226, 456, 0.9, 0], [248, 482, 0.6, 1], [204, 470, 0.5, 2], [262, 520, 0.7, 2], [210, 600, 0.8, 1], [244, 626, 0.55, 0], [126, 520, 0.7, 0], [140, 470, 0.6, 2], [252, 700, 0.6, 1], [360, 452, 1, 1], [384, 480, 0.6, 0], [402, 452, 0.5, 2], [436, 560, 0.8, 0], [356, 620, 0.6, 2], [470, 470, 0.55, 0], [214, 252, 0.6, 1], [300, 236, 0.5, 2]]) {
      if (r === 2) curls += `M${x},${y}l${f(12 * s, 1)},${f(-4 * s, 1)}`;
      else if (r === 1) curls += `M${x},${y}c${f(6 * s, 1)},${f(-6 * s, 1)} ${f(14 * s, 1)},${f(-2 * s, 1)} ${f(10 * s, 1)},${f(5 * s, 1)}c${f(-3 * s, 1)},${f(5 * s, 1)} ${f(-9 * s, 1)},${f(3 * s, 1)} ${f(-7 * s, 1)},${f(-2 * s, 1)}`;
      else curls += `M${x},${y}c${f(-2 * s, 1)},${f(-7 * s, 1)} ${f(8 * s, 1)},${f(-10 * s, 1)} ${f(11 * s, 1)},${f(-3 * s, 1)}`;
    }
    let s = `<path d="${curls}" fill="none" stroke="#f2ead6" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`;
    // soup-bowl badge on the vest breast
    s += `<path d="M216,530h34a17,13 0 0 1 -34,0z" fill="#c9a868"/><path d="M220,530h26" stroke="#f0d898" stroke-width="2"/><path d="M226,522q-4,-6 0,-11M236,522q-4,-6 0,-11M246,522q-4,-6 0,-11" fill="none" stroke="#c9a868" stroke-width="2" stroke-linecap="round"/>`;
    // wide frightened eye under the brim, brow pulled up, a bead of sweat at the temple
    s += `<path d="M212,286q10,-8 24,-5" fill="none" stroke="${rim}" stroke-width="2.5" stroke-linecap="round" opacity=".8"/><circle cx="226" cy="300" r="4.5" fill="none" stroke="${rim}" stroke-width="2" opacity=".85"/><circle cx="225" cy="300" r="1.8" fill="#f4ecd8"/>`;
    s += `<path d="M262,300q-5,9 0,12q5,-3 0,-12z" fill="#dde8f0" opacity=".7"/>`;
    return s;
  },
};

// 哥布林 — the smallest of the three crystal-bound scavengers, freed: a big bald head, long ears drooping,
// huge wet eyes, a patched grain-sack poncho; both thin hands still clawing at the iron collar where a
// black crystal shard is set, a violet chain snapped off it a few links down
CAST.goblin = {
  id: 'goblin', label: '哥布林：瘦小的拾荒哥布林，项圈嵌着黑色碎晶，紫色锁链已断', rim: '#7fa36b',
  sil: [
    // the near ear, long and limp, hanging out from under the pot down the back of the head
    S([[380, 312], [428, 328], [488, 376], [540, 474, 1], [512, 458], [506, 440, 1], [492, 446], [470, 418], [424, 386], [384, 362]]),
    circle(312, 336, 92),
    // a dented cooking pot worn as a helmet
    S([[200, 298, 1], [206, 280], [224, 268], [228, 236], [256, 206], [300, 190], [336, 190], [348, 202, 1], [362, 194], [392, 212], [416, 248], [420, 288], [436, 300], [434, 318, 1], [380, 312], [300, 302], [240, 298]]),
    // small face under the pot rim: heavy brow, long drooping nose, little mouth, receding chin
    S([[216, 296], [206, 318, 1], [196, 334], [180, 350], [166, 366, 1], [178, 374], [196, 378, 1], [202, 392], [212, 400, 1], [208, 410], [216, 424], [242, 438], [292, 446], [342, 434], [380, 402], [404, 348], [398, 300]]),
    // thin neck, the sack hood pushed back and bunched behind it
    S([[262, 420], [330, 420], [336, 486], [256, 486]]),
    S([[236, 446], [300, 460], [384, 430], [430, 470], [300, 494], [200, 484]]),
    // small sloping shoulders under the sack poncho
    S([[206, 474], [160, 498], [128, 556], [108, 680], [100, 820], [500, 820], [494, 680], [476, 560], [450, 496], [420, 470], [300, 490]]),
    // near arm raised to the collar
    S([[150, 700], [174, 600], [208, 524], [232, 500], [252, 514], [230, 560], [204, 630], [186, 710]]),
  ],
  tones: [
    // olive-grey skin on face and ear; the inside of the ear
    [S([[216, 296], [206, 318], [196, 334], [180, 350], [166, 366], [178, 374], [196, 378], [202, 392], [212, 400], [208, 410], [216, 424], [242, 438], [292, 446], [342, 434], [380, 402], [404, 348], [398, 300]]) + S([[216, 296], [300, 304], [380, 314], [404, 348], [400, 400], [380, 440], [300, 448], [230, 430]]), '#2c3024', 0.8],
    [S([[380, 312], [428, 328], [488, 376], [540, 474], [512, 458], [506, 440], [492, 446], [470, 418], [424, 386], [384, 362]]), '#2c3024', 0.8],
    [S([[396, 330], [428, 346], [470, 390], [506, 444], [474, 418], [418, 374]]), '#4a3438', 0.75],
    // tin pot, a darker band at its rim; the sack hood and poncho, sewn-on patch
    [S([[200, 298], [206, 280], [224, 268], [228, 236], [256, 206], [300, 190], [336, 190], [348, 202], [362, 194], [392, 212], [416, 248], [420, 288], [436, 300], [434, 318], [380, 312], [300, 302], [240, 298]]), '#3e424c', 0.92],
    [S([[204, 286], [300, 292], [380, 302], [434, 306], [434, 318], [380, 312], [300, 302], [200, 298]]), '#2a2c34', 0.9],
    [S([[236, 446], [300, 460], [384, 430], [430, 470], [300, 494], [200, 484]]), '#3a3226', 0.9],
    [S([[206, 474], [160, 498], [128, 556], [108, 680], [100, 820], [500, 820], [494, 680], [476, 560], [450, 496], [420, 470], [300, 490]]), '#332c22', 0.9],
    [S([[360, 600], [432, 590], [440, 662], [366, 672]]), '#4a3e2c', 0.95],
    [S([[150, 700], [174, 600], [208, 524], [232, 500], [252, 514], [230, 560], [204, 630], [186, 710]]), '#2c3024', 0.7],
  ],
  lines: [
    // ear rim, the pot's lit dome and rim, the dent, jaw
    [pl([[380, 312], [428, 328], [488, 376], [540, 474]]), 2.5, 0.8],
    [`M392,318l16,8M394,330l14,14M386,334l6,16`, 2, 0.6],
    [`M228,236C240,214 268,196 300,190`, 3, 0.8, '#e8ecf0'],
    [pl([[200, 298], [300, 302], [380, 312], [434, 318]]) + pl([[336, 190], [348, 202], [362, 194]]), 2, 0.6],
    [pl([[392, 212], [416, 248], [420, 288]]), 3, 0.75],
    [`M380,402C366,428 340,442 300,448`, 2.5, 0.6],
    // poncho shoulders + seams + patch stitches
    [pl([[128, 556], [160, 498], [206, 474]]) + pl([[420, 470], [450, 496], [476, 560]]), 3, 0.6],
    [`M300,500L304,800M180,560L160,800M420,560L440,800`, 2, 0.35],
    [`M360,600L432,590L440,662L366,672Z M372,612l10,10M392,606l10,10M412,604l10,10M376,644l10,10M398,640l10,10`, 1.6, 0.5],
  ],
  defs: (p) => [`<radialGradient id="${p}-shardGlow"><stop offset="0" stop-color="#b58cff" stop-opacity=".6"/><stop offset="1" stop-color="#b58cff" stop-opacity="0"/></radialGradient>`],
  front: ({ rim, p }) => {
    // rivets on the pot's rim
    let s = `<g fill="#9aa0aa">${[[236, 296], [300, 300], [372, 308]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4"/>`).join('')}</g>`;
    // iron collar around the neck, rivets
    s += `<path d="M240,452C262,474 334,478 352,454L356,476C334,500 262,498 236,474Z" fill="#3a3640"/><path d="M240,452C262,474 334,478 352,454" fill="none" stroke="#8a8494" stroke-width="2" opacity=".8"/>`;
    s += `<g fill="#8a8494">${[[252, 472], [322, 480], [342, 470]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6"/>`).join('')}</g>`;
    // the black crystal shard set in the collar, a faint violet heart
    s += `<circle cx="284" cy="474" r="44" fill="url(#${p}-shardGlow)"/>`;
    s += `<path d="M274,456L286,440L298,458L294,488L280,494L270,476Z" fill="#120c1a"/><path d="M286,440L290,466L280,494M290,466L298,458" fill="none" stroke="#b58cff" stroke-width="1.6" opacity=".9"/><path d="M276,458l8,-12" stroke="#e8dcff" stroke-width="2" stroke-linecap="round"/>`;
    // the snapped violet chain: three links hanging from the shard, the last one broken open
    const links = [[283, 506, 6, 11, 0], [284, 526, 3, 11, 1], [283, 546, 6, 11, 0]];
    s += `<g fill="none" stroke="#9a72d8" stroke-width="3.2">${links.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`).join('')}</g>`;
    s += `<path d="M277,566a6,10 0 0 1 12,-2" fill="none" stroke="#9a72d8" stroke-width="3.2" stroke-linecap="round"/><path d="M279,558a6,10 0 0 0 -2,10" fill="none" stroke="#9a72d8" stroke-width="3.2" stroke-linecap="round" opacity=".6"/>`;
    s += `<path d="M280,500v10M281,540v10" stroke="#e0d0ff" stroke-width="1.6" opacity=".8"/><g fill="#d8c4ff"><circle cx="296" cy="574" r="1.8"/><circle cx="270" cy="580" r="1.4"/><circle cx="288" cy="590" r="1.2"/></g>`;
    // both hands clawing at the collar (long thin fingers over the iron band)
    const near = S([[214, 520], [222, 484], [232, 462, 1], [240, 482], [248, 458, 1], [256, 480], [266, 462, 1], [268, 486], [262, 508], [236, 522]]);
    const far = S([[338, 512], [332, 484], [338, 462, 1], [346, 480], [354, 460, 1], [360, 482], [370, 466, 1], [368, 496], [356, 516]]);
    s += `<path d="${near}${far}" fill="url(#${p}-ink)"/><path d="${pl([[232, 462], [240, 482]])}${pl([[248, 458], [256, 480]])}${pl([[266, 462], [268, 486]])}${pl([[354, 460], [360, 482]])}${pl([[370, 466], [368, 496]])}" fill="none" stroke="${rim}" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
    // the huge wet eye looking up, a sad upturned brow, a tear on the cheek
    s += `<path d="M240,318q-14,-4 -26,-14" fill="none" stroke="${rim}" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>`;
    s += `<ellipse cx="228" cy="338" rx="9" ry="10" fill="#dfe8cc" opacity=".92"/><ellipse cx="225" cy="335" rx="5" ry="6" fill="#141a10"/><circle cx="223" cy="332" r="2" fill="#ffffff"/>`;
    s += `<path d="M236,356q-4,8 0,11q4,-3 0,-11z" fill="#d6ecf4" opacity=".85"/>`;
    return s;
  },
};

// 波莉 — Mara's daughter, about six (smaller than Toby): a tangle of uncombed hair, the cage's wool blanket
// pulled round her shoulders, a small fist pressed to her mouth to swallow a sob or a cough; big wet eyes. No arm wrap: her only
// spoken line (and so the only time the bust shows) is the FLAG_CH000_MARA_DAUGHTER_SAVED branch, where she
// just has a chill; on the injured branch she stays silent and appears in narration only.
const pollyAx = (t, v) => [292 - 46 * t + 0.966 * v, 600 - 172 * t - 0.258 * v]; // forearm axis: t 0 = blanket opening, 1 = wrist
const POLLY_ARM = S([pollyAx(-0.15, -22), pollyAx(1, -16), pollyAx(1, 16), pollyAx(-0.15, 22)]);
CAST.polly = {
  id: 'polly', label: '波莉：约六岁的女孩，乱发，裹着毛毯，小手捂在嘴边', rim: '#e6c9a8',
  sil: [
    // hair: the tangled mass behind the head falling past the shoulders, flyaway ends at the back
    S([[262, 290], [300, 248], [356, 242], [404, 268], [428, 312], [436, 360], [450, 400, 1], [440, 408], [452, 446, 1], [434, 444], [444, 490, 1], [420, 478], [404, 504, 1], [396, 470], [372, 450], [350, 400], [330, 360], [290, 340]]),
    head(16, 110, 0.76, true),
    // messy crown and fringe: uneven tufts, strands over the brow
    S([[238, 330], [236, 302, 1], [250, 308], [256, 276, 1], [274, 286], [286, 252, 1], [302, 274], [320, 242, 1], [332, 266], [362, 248, 1], [362, 276], [396, 266, 1], [388, 292], [414, 302, 1], [396, 318], [380, 310], [350, 300], [314, 302], [284, 314], [262, 326], [252, 350, 1], [246, 334]]),
    neck(16, 116, 0.66),
    // the blanket over small shoulders, falling wide to the bottom edge
    S([[262, 478], [222, 490], [184, 514], [150, 556], [128, 620], [114, 700], [106, 820], [506, 820], [498, 690], [484, 610], [462, 548], [436, 510], [404, 490], [372, 478], [330, 486], [296, 490]]),
    // the forearm raised out of the blanket's opening, the small fist at her mouth
    POLLY_ARM,
    circle(240, 414, 24),
  ],
  tones: [
    // hair: dark brown, the back mass and the tufts
    [S([[262, 290], [300, 248], [356, 242], [404, 268], [428, 312], [436, 360], [450, 400], [440, 408], [452, 446], [434, 444], [444, 490], [420, 478], [404, 504], [396, 470], [372, 450], [350, 400], [330, 360], [290, 340]]), '#3e2e24', 0.9],
    [S([[238, 330], [236, 302], [250, 308], [256, 276], [274, 286], [286, 252], [302, 274], [320, 242], [332, 266], [362, 248], [362, 276], [396, 266], [388, 292], [414, 302], [396, 318], [380, 310], [350, 300], [314, 302], [284, 314], [262, 326], [252, 350], [246, 334]]), '#4a3628', 0.9],
    // the grey wool blanket, a woven darker band near its edge, the dark dress in its opening
    [S([[262, 478], [222, 490], [184, 514], [150, 556], [128, 620], [114, 700], [106, 820], [506, 820], [498, 690], [484, 610], [462, 548], [436, 510], [404, 490], [372, 478], [330, 486], [296, 490]]), '#2e2a36', 0.92],
    [S([[176, 530], [214, 504], [228, 520], [196, 546], [160, 600], [140, 660], [128, 820], [112, 820], [120, 660], [140, 596]]), '#1e1a26', 0.9],
    [S([[266, 496], [300, 508], [342, 504], [362, 600], [376, 820], [262, 820], [258, 600]]), '#15121b', 0.92],
    // the bare forearm and fist, a shade lighter; a ragged sleeve cuff where it leaves the blanket
    [POLLY_ARM, '#3e3846', 0.95],
    [circle(240, 414, 24), '#443c4a', 0.95],
    [S([pollyAx(0.06, -23), pollyAx(0.16, -22), pollyAx(0.16, 22), pollyAx(0.06, 23)]), '#26222e', 0.95],
    // the blanket's edge folded back over her elbow
    [S([[196, 566], [240, 578], [290, 592], [334, 588], [362, 606], [350, 650], [300, 664], [240, 650], [190, 616]]), '#2e2a36', 1],
  ],
  lines: [
    // hair strands, flyaways, the jaw
    [`M286,260C292,282 284,302 272,318M332,250C340,274 334,296 320,306M372,260C380,282 374,300 360,308`, 2.5, 0.7],
    [`M404,276C420,308 428,350 436,388M392,302C404,340 412,382 420,430`, 2, 0.55],
    [`M300,248C296,234 304,222 318,218M352,248C360,234 372,230 384,234`, 2, 0.6],
    [pl([[381, 362], [366, 400], [334, 435]]), 3, 0.8],
    // blanket edge and folds, the opening, the forearm's lit edge
    [pl([[150, 556], [184, 514], [222, 490], [262, 478]]) + pl([[404, 490], [436, 510], [462, 548], [484, 610]]), 3, 0.6],
    [`M420,570C430,640 436,720 438,810M210,590C200,660 196,740 194,810`, 2, 0.35],
    [pl([[342, 504], [362, 600], [376, 820]]), 2, 0.4],
    [pl([pollyAx(0.16, 22), pollyAx(1, 16)]), 2.2, 0.7],
    [`M196,566C240,578 290,592 334,588C346,592 356,598 362,606`, 2.4, 0.55],
  ],
  front: ({ rim }) => {
    let s = '';
    // knuckles of the fist pressed to her mouth
    s += `<path d="M222,404q6,-8 14,-8M220,418q8,-6 16,-4M224,432q8,-4 14,-2" fill="none" stroke="${rim}" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
    // a reed seed-head caught in her hair
    s += `<path d="M410,302q14,-8 22,-2q-10,0 -16,8z" fill="#d8c4a0" opacity=".85"/>`;
    // the big wet eye above the fist, a worried brow, a tear-bright glint
    s += `<path d="M254,350q8,-7 20,-6" fill="none" stroke="${rim}" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>`;
    s += `<ellipse cx="264" cy="367" rx="7" ry="8.5" fill="#efe4d6" opacity=".9"/><ellipse cx="261" cy="368" rx="4.4" ry="5.6" fill="#1a1410"/><circle cx="259" cy="365" r="1.8" fill="#ffffff"/>`;
    s += `<path d="M268,383q-3,7 0,10q3,-3 0,-10z" fill="#dde8f0" opacity=".8"/>`;
    return s;
  },
};

// 念祷文的人 — the relief society's young acolyte at the mill: thin and gaunt, cropped hair, a plain grey robe
// with the hood pushed back, a black crystal shard hung on a cord at his breast; he holds up an iron lantern
// by its ring and the hand shakes (a faint double image of the lantern, tremor marks at the fingers).
CAST.acolyte = {
  id: 'acolyte', label: '念祷文的人：瘦削的年轻人，灰袍，胸前吊着一片黑晶，提灯的手在发抖', rim: '#9a98ad',
  sil: [
    head(-6, 26, 0.9),
    // cropped hair, a ragged fringe, close at the nape
    S([[226, 236], [230, 196], [258, 166], [304, 150], [352, 158], [388, 186], [400, 226], [396, 264], [382, 288], [370, 250], [344, 222], [306, 212], [270, 214], [248, 230], [240, 252, 1], [236, 238]]),
    neck(-6, 30, 0.78),
    // the hood pushed back, bunched behind the neck and shoulders
    S([[316, 360], [362, 340], [408, 352], [436, 392], [446, 436], [420, 452], [380, 430], [330, 420], [290, 424]]),
    torso(176, 500, 1.45, -4),
    // the near arm held up: wide grey sleeve from the elbow, the bony hand gripping the lantern's ring
    S([[300, 820], [282, 740], [256, 664], [226, 600], [204, 566], [196, 544], [210, 528], [230, 534], [246, 556], [272, 600], [306, 660], [338, 740], [352, 820]]),
    S([[196, 544], [190, 520], [194, 500], [206, 492], [218, 498], [224, 516], [222, 534], [210, 540]]),
    // the lantern hanging from the ring: peaked cap, cage, base
    S([[192, 534, 1], [226, 556, 1], [154, 556, 1]]) + S([[152, 556], [228, 556], [230, 652], [150, 652]]) + S([[142, 652], [238, 652], [230, 670], [150, 670]]),
    `M190,536C182,524 184,510 194,504L198,508C190,514 190,524 194,534Z`,
  ],
  tones: [
    // hair
    [S([[226, 236], [230, 196], [258, 166], [304, 150], [352, 158], [388, 186], [400, 226], [396, 264], [382, 288], [370, 250], [344, 222], [306, 212], [270, 214], [248, 230], [240, 252], [236, 238]]), '#2a2830', 0.9],
    // the grey robe, the hood's lining in shadow, the sleeve a shade lighter
    [S([[96, 540], [150, 490], [230, 462], [300, 456], [370, 462], [440, 490], [500, 540], [516, 820], [84, 820]]), '#3a3a46', 0.88],
    [S([[316, 360], [362, 340], [408, 352], [436, 392], [446, 436], [420, 452], [380, 430], [330, 420], [290, 424]]), '#2a2a34', 0.9],
    [S([[300, 820], [282, 740], [256, 664], [226, 600], [204, 566], [196, 544], [210, 528], [230, 534], [246, 556], [272, 600], [306, 660], [338, 740], [352, 820]]), '#46465a', 0.85],
    // gaunt hollow under the cheekbone
    [S([[300, 316], [328, 300], [350, 316], [336, 344], [306, 346]]), '#000000', 0.25],
  ],
  lines: [
    // cheekbone and jaw rim, the hood's folds, the robe's front seam and shoulders
    [pl([[372, 268], [354, 314], [318, 348]]), 3.2, 0.85],
    [pl([[230, 196], [258, 168], [304, 152], [352, 160], [388, 188]]), 2.5, 0.6],
    [`M346,346C376,352 404,372 420,404M330,400C360,406 390,420 410,440`, 2, 0.5],
    [pl([[124, 520], [180, 478], [240, 462]]) + pl([[372, 464], [440, 486], [490, 530]]), 2.8, 0.6],
    [pl([[300, 470], [304, 820]]), 2, 0.4],
    [pl([[246, 556], [272, 600], [306, 660], [338, 740]]), 2.2, 0.5],
  ],
  defs: (p) => [
    `<radialGradient id="${p}-lamp"><stop offset="0" stop-color="#ffd890" stop-opacity=".75"/><stop offset=".35" stop-color="#ffb860" stop-opacity=".25"/><stop offset="1" stop-color="#ffb860" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${p}-shard"><stop offset="0" stop-color="#b58cff" stop-opacity=".6"/><stop offset="1" stop-color="#b58cff" stop-opacity="0"/></radialGradient>`,
  ],
  back: ({ p }) => `<circle cx="190" cy="604" r="190" fill="url(#${p}-lamp)"/>`,
  front: ({ rim, p }) => {
    // lamplight from below catching the chin, the fingers and the sleeve edge
    let s = `<path d="M250,350q26,18 58,10M214,500q4,-8 12,-6M228,536q14,6 18,20M196,546q-8,-12 0,-26" fill="none" stroke="#ffcf8a" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>`;
    // the lantern: glowing panes, flame, frame bars; a faint second image where the hand shakes
    s += `<path d="M152,556h78l2,96h-82zM192,534l34,22h-70z" fill="none" stroke="#e0c890" stroke-width="2" opacity=".42" transform="translate(-8 4)"/>`;
    s += `<circle cx="190" cy="604" r="58" fill="url(#${p}-lamp)"/>`;
    s += `<path d="M160,564h62v80h-62z" fill="#ffcf7a"/><path d="M168,572h46v64h-46z" fill="#fff0c4"/><path d="M191,626c-8,-8 -7,-19 0,-30c7,11 8,22 0,30z" fill="#ff9a40"/><path d="M191,620c-4,-4 -3,-9 0,-14c3,5 4,10 0,14z" fill="#fff8e0"/><path d="M191,564v80M160,604h62" stroke="#2a2420" stroke-width="3.5"/>`;
    s += `<path d="M152,556h78M150,652h82" stroke="#4a4038" stroke-width="3.5"/><path d="M156,556L192,534L226,556" fill="none" stroke="#ffcf8a" stroke-width="1.6" opacity=".7"/>`;
    // tremor marks beside the fingers
    s += `<path d="M180,492q-8,6 -6,16M170,484q-11,10 -9,24M234,496q7,8 5,18M244,488q8,12 5,24" fill="none" stroke="${rim}" stroke-width="2" stroke-linecap="round" opacity=".75"/>`;
    // the black crystal shard on its cord, a faint violet heart
    s += `<path d="M262,452C276,500 300,520 312,528M372,456C356,500 330,520 316,528" fill="none" stroke="#1a1820" stroke-width="2.5"/>`;
    s += `<circle cx="314" cy="552" r="40" fill="url(#${p}-shard)"/><path d="M306,532L316,520L326,536L322,566L312,574L302,556Z" fill="#120c1a"/><path d="M316,520L318,548L312,574M318,548L326,536" fill="none" stroke="#b58cff" stroke-width="1.5" opacity=".9"/><path d="M308,536l7,-10" stroke="#e8dcff" stroke-width="1.8" stroke-linecap="round"/>`;
    // a downcast, anxious eye under a knit brow
    s += `<path d="M228,270q8,-2 14,-8M244,264q6,0 12,3" fill="none" stroke="${rim}" stroke-width="2.4" stroke-linecap="round" opacity=".85"/><ellipse cx="240" cy="284" rx="6" ry="4.6" fill="#e4e0ec" opacity=".85"/><circle cx="237" cy="286" r="3" fill="#14121a"/><path d="M233,280q7,-3 14,0" fill="none" stroke="#14121a" stroke-width="2"/>`;
    return s;
  },
};

// 哥布林咒徒长 — chapter 05: the old goblin that hauls the cult's cart. Human height, not a giant and not an ogre:
// goblin head and ears, but bowed and hunched, the neck and shoulders swollen thick (fed on black crystal — shown
// only as bulk and a cold violet cast in the shadow of the hump, nothing grown out of him); the cart harness strapped
// across the bare chest; the huge new collar with its crystal seat and the trace chain hanging from it (only the
// collar's outside — never its inside); the eyes ink-black while the collar holds him. He has no lines: this bust
// is for the roars and the moments he is on screen. A victim, not a monster: no gore, no wounds.
// sparse long grey hair: single strands from the crown, falling back over the skull and the hump
const CHIEF_HAIR = ['M306,158C344,150 388,170 420,212S462,300 470,330', 'M318,154C360,152 404,176 436,220S474,292 486,318', 'M296,164C326,166 356,190 378,232S398,300 396,322',
  'M330,152C372,156 418,184 450,230S488,296 500,312', 'M312,160C340,170 366,198 384,242', 'M342,150C384,160 428,192 458,240'];
const CHIEF_BODY = S([[212, 384], [196, 412], [150, 440], [94, 466], [52, 500], [30, 552], [28, 612], [36, 660], [26, 720], [18, 820], [584, 820], [578, 720], [568, 650], [580, 590], [576, 520], [556, 452], [530, 400], [498, 350], [462, 310], [420, 292], [396, 312], [362, 366], [300, 404]]);
const chiefAx = (t) => { // the trace chain's path down the chest and out of frame (t 0 = shackle, 1 = bottom-left edge)
  const x = 262 - 40 * t - 200 * t * t, y = 492 + 330 * t - 20 * t * t;
  return [x, y];
};
CAST.goblin_chief = {
  id: 'goblin_chief', label: '哥布林咒徒长：佝偻的老哥布林首领，肩颈肿厚，胸前勒着拉车的皮套，粗大颈圈嵌着晶座并连着粗链，眼睛墨黑', rim: '#6f8f5c',
  sil: [
    // the near ear: long, swept back and up, two old notches bitten out of its lower edge
    S([[370, 232], [420, 212], [478, 188], [528, 166], [560, 152, 1], [540, 182], [522, 198], [508, 196, 1], [500, 210, 1], [482, 222], [468, 220, 1], [460, 236, 1], [430, 258], [392, 288]]),
    // bald, heavy skull
    circle(318, 238, 86),
    // the face, low and thrust forward: beetling brow, long hooked nose, the underslung jaw
    S([[256, 172], [228, 196], [214, 220], [202, 236, 1], [214, 248], [206, 260], [188, 280], [168, 302], [152, 322, 1], [164, 334], [184, 334], [198, 330, 1], [194, 344], [184, 358, 1], [192, 374], [208, 388], [238, 400], [278, 404], [318, 394], [354, 366], [382, 318], [396, 266], [386, 208]]),
    // neck, swollen trapezius hump rising behind the head, the bowed shoulders and long arms falling out of frame
    CHIEF_BODY,
  ],
  tones: [
    // olive-grey old skin: skull, face, ear; the ear's inside
    [circle(318, 238, 86) + S([[256, 172], [228, 196], [214, 220], [202, 236], [214, 248], [206, 260], [188, 280], [168, 302], [152, 322], [164, 334], [184, 334], [198, 330], [194, 344], [184, 358], [192, 374], [208, 388], [238, 400], [278, 404], [318, 394], [354, 366], [382, 318], [396, 266], [386, 208]]), '#20261e', 0.55],
    [S([[370, 232], [420, 212], [478, 188], [528, 166], [560, 152], [540, 182], [522, 198], [508, 196], [500, 210], [482, 222], [468, 220], [460, 236], [430, 258], [392, 288]]), '#283024', 0.72],
    [S([[392, 244], [436, 226], [486, 204], [530, 180], [508, 200], [470, 222], [430, 246], [400, 266]]), '#43302e', 0.75],
    // bare torso, the hump in a colder, violet-tinged shadow where the crystal has fed it
    [CHIEF_BODY, '#1c2119', 0.78],
    [S([[396, 312], [420, 292], [462, 310], [500, 352], [536, 420], [552, 480], [520, 470], [470, 420], [420, 388], [380, 380]]), '#2a2638', 0.75],
    [S([[150, 440], [94, 468], [64, 500], [110, 500], [170, 470]]), '#2e2a3c', 0.45],
    // the harness: breast band across the chest, a strap down from each shoulder to the iron ring
    [S([[22, 606, 1], [160, 620], [330, 628], [480, 616], [584, 596, 1], [584, 636, 1], [480, 656], [330, 668], [160, 660], [22, 646, 1]]), '#3a2a1e', 0.95],
    [S([[506, 404, 1], [540, 430, 1], [354, 628, 1], [318, 612, 1]]), '#3a2a1e', 0.95],
    [S([[96, 470, 1], [128, 458, 1], [328, 610, 1], [306, 628, 1]]), '#33251c', 0.95],
  ],
  lines: [
    // ear rim and its notches; skull dome; a pale old scar across the scalp
    [pl([[370, 232], [420, 212], [478, 188], [528, 166], [560, 152]]), 2.6, 0.8],
    [pl([[540, 182], [522, 198], [508, 196], [500, 210], [482, 222], [468, 220], [460, 236]]), 2, 0.55],
    [`M318,152C356,154 392,176 404,214`, 3, 0.8],
    [`M330,170l26,36`, 2.4, 0.55, '#a8b098'],
    // brow ridge, forehead and cheek wrinkles, the nose's hook, the jaw
    [`M206,236C214,226 230,222 246,226`, 3, 0.85],
    [`M232,200q14,-6 28,-2M240,186q12,-4 24,0M262,246q10,8 8,20`, 1.8, 0.55],
    [`M210,262C220,284 222,300 208,320M226,330q18,10 36,8`, 1.8, 0.5],
    [`M394,268C384,320 356,370 318,394`, 3.2, 0.85],
    [`M196,346q10,6 26,6`, 2, 0.6],
    // the grey strands: a dark under-stroke, then the lit hair
    [CHIEF_HAIR.join(''), 4, 0.6, '#0e0c12'],
    [CHIEF_HAIR.join(''), 1.8, 0.8, '#a8aca0'],
    // the hump and bowed shoulders, the swell of the trapezius, the long arms
    [pl([[420, 292], [462, 310], [500, 352], [536, 420], [562, 500], [576, 590]]), 3.4, 0.8],
    [`M404,330C436,348 466,376 488,412M160,444C120,462 84,484 62,520`, 2.2, 0.5],
    [`M524,440C552,474 566,520 562,584M70,486C46,516 38,560 44,606`, 2.2, 0.45],
    [`M562,600C552,630 552,660 566,690M44,622C52,648 50,672 38,700`, 1.8, 0.35],
    [`M110,560C160,578 210,586 250,584M372,586C420,580 470,566 512,546`, 1.8, 0.3],
    // harness edges and stitching
    [`M22,606C160,620 330,628 480,616C540,610 570,602 584,596M22,646C160,660 330,668 480,656C540,650 570,642 584,636`, 2.2, 0.6],
    [`M40,626h12M80,630h12M120,634h12M420,640h12M470,638h12M520,632h12`, 1.4, 0.4],
    [pl([[540, 430], [354, 628]]) + pl([[128, 458], [328, 610]]), 2, 0.5],
  ],
  defs: (p) => [
    `<radialGradient id="${p}-seat"><stop offset="0" stop-color="#b58cff" stop-opacity=".75"/><stop offset=".4" stop-color="#8a5ad8" stop-opacity=".28"/><stop offset="1" stop-color="#8a5ad8" stop-opacity="0"/></radialGradient>`,
  ],
  front: ({ rim, p }) => {
    let s = '';
    // the collar: a thick iron band round the swollen neck (its outside only), riveted, the near edge lit
    const band = `M200,390C236,420 336,430 410,394C426,386 440,378 448,372C452,392 446,414 430,430C340,480 232,470 204,440C196,428 196,404 200,390Z`;
    s += `<path d="${band}" fill="#34303a"/><path d="M200,390C236,420 336,430 424,388" fill="none" stroke="#9a94a4" stroke-width="2.4" opacity=".85"/><path d="M204,440C232,470 340,480 430,430" fill="none" stroke="#14111a" stroke-width="3"/><path d="M404,398C424,390 440,380 448,372C452,392 446,414 430,430C420,420 410,410 404,398Z" fill="#1a1720" opacity=".85"/>`;
    s += `<path d="M204,404C238,432 336,442 426,402" fill="none" stroke="#1e1a24" stroke-width="2" opacity=".8"/>`;
    s += `<g fill="#8a8494">${[[214, 420], [318, 446], [356, 440], [392, 424], [414, 410]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g>`;
    s += `<g fill="#3a2e52" opacity=".35"><ellipse cx="420" cy="350" rx="22" ry="12"/><ellipse cx="470" cy="388" rx="16" ry="9"/><ellipse cx="380" cy="372" rx="12" ry="7"/></g>`;
    // the crystal seat at the throat: a pronged iron mount, the black crystal in it, its violet heart
    s += `<circle cx="262" cy="446" r="78" fill="url(#${p}-seat)"/>`;
    s += `<path d="M234,418L290,418L298,458L262,492L226,458Z" fill="#24202a"/><path d="M234,418L226,458L262,492" fill="none" stroke="#8a8494" stroke-width="1.8" opacity=".7"/>`;
    s += `<path d="M262,410L278,430L274,466L262,482L248,464L248,430Z" fill="#100a18"/><path d="M262,410L266,446L262,482M266,446L278,430" fill="none" stroke="#b58cff" stroke-width="1.8" opacity=".95"/><path d="M252,432l8,-14" stroke="#ece0ff" stroke-width="2.2" stroke-linecap="round"/>`;
    s += `<path d="M230,422l10,8M294,422l-10,8M228,456l10,-4M296,456l-10,-4" stroke="#4a4652" stroke-width="4" stroke-linecap="round"/>`;
    // the shackle under the seat and the heavy trace chain hanging from it, down over the harness and off to the left
    s += `<path d="M250,488a12,12 0 1 0 24,0" fill="none" stroke="#2a2630" stroke-width="7"/><path d="M250,488a12,12 0 1 0 24,0" fill="none" stroke="#7a7484" stroke-width="2" opacity=".8"/>`;
    let dark = '', hi = '';
    for (let i = 0; i < 9; i++) {
      const t0 = 0.035 + i * 0.118, a = chiefAx(t0), b = chiefAx(t0 + 0.02), ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
      const [cx, cy] = chiefAx(t0 + 0.05);
      if (i % 2 === 0) { dark += `<ellipse cx="${r0(cx)}" cy="${r0(cy)}" rx="25" ry="14" transform="rotate(${r0(ang)} ${r0(cx)} ${r0(cy)})"/>`; hi += `<path d="M${r0(cx - 18)},${r0(cy - 8)}a25,14 0 0 1 30,-4" transform="rotate(${r0(ang)} ${r0(cx)} ${r0(cy)})"/>`; }
      else { dark += `<rect x="${r0(cx - 25)}" y="${r0(cy - 6)}" width="50" height="12" rx="6" transform="rotate(${r0(ang)} ${r0(cx)} ${r0(cy)})"/>`; hi += `<path d="M${r0(cx - 18)},${r0(cy - 4)}h32" transform="rotate(${r0(ang)} ${r0(cx)} ${r0(cy)})"/>`; }
    }
    s += `<g fill="none" stroke="#0e0c12" stroke-width="13">${dark}</g><g fill="none" stroke="#3a3640" stroke-width="7">${dark}</g><g fill="none" stroke="#8a8494" stroke-width="1.8" opacity=".7">${hi}</g>`;
    // the harness ring where the straps meet, a buckle on the band
    s += `<circle cx="334" cy="620" r="17" fill="none" stroke="#1a161c" stroke-width="7"/><circle cx="334" cy="620" r="17" fill="none" stroke="#6a6270" stroke-width="2.4"/><path d="M462,618h26v34h-26z" fill="none" stroke="#6a6270" stroke-width="3"/>`;
    // the eye under the brow: ink-black, no white and no pupil, a thin violet sheen from the seat along the lower lid
    s += `<path d="M206,250q14,-10 34,-6" fill="none" stroke="#0a0810" stroke-width="5" stroke-linecap="round"/>`;
    s += `<path d="M204,256q20,-12 44,-4q2,16 -12,22q-20,4 -32,-18z" fill="#0c0a10" opacity=".8"/>`;
    s += `<path d="M210,262q14,-11 32,-5q-4,14 -18,14q-10,0 -14,-9z" fill="#020104"/><path d="M214,268q12,7 26,-7" fill="none" stroke="#b58cff" stroke-width="1.8" opacity=".9"/><path d="M224,259q5,-2 9,0" fill="none" stroke="#e0d4ff" stroke-width="1.4" stroke-linecap="round" opacity=".75"/>`;
    s += `<path d="M210,252q14,-8 32,-4" fill="none" stroke="${rim}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`;
    // the underbite: two short worn tusks over the upper lip, a grim mouth line
    s += `<path d="M192,344l2,-12l6,11zM214,350l3,-11l5,11z" fill="#c8c2ac"/><path d="M186,350q20,8 44,4" fill="none" stroke="#0a0810" stroke-width="2.4" stroke-linecap="round"/>`;
    return s;
  },
};

// ---------------------------------------------------------------------------------------------
// chapters 06–09
// ---------------------------------------------------------------------------------------------

// 沼地食人魔 (06) — taller than a covered wagon: a small heavy-browed head sunk between enormous shoulders, mud-
// coloured skin, a mantle of reeds draped over the shoulders, a long bridge plank carried across them behind the
// head; slow, sleepy eyes. No collar and no chain (this is not the black-chain ogre), nothing grotesque.
const OGRE_BODY = S([[226, 312], [186, 300], [130, 296], [80, 314], [44, 352], [24, 410], [14, 480], [10, 560], [6, 820], [594, 820], [590, 560], [584, 480], [574, 410], [552, 352], [512, 316], [460, 298], [410, 300], [376, 316]]);
const OGRE_HEAD = S([[236, 170], [212, 196], [200, 222], [188, 236, 1], [196, 248], [186, 262], [178, 278, 1], [188, 290], [184, 304, 1], [196, 316], [214, 332], [246, 344], [290, 346], [334, 334], [366, 306], [380, 262], [376, 214], [354, 174], [312, 152], [270, 152]]);
const OGRE_PLANK = S([[14, 300, 1], [594, 272, 1], [594, 318, 1], [14, 346, 1]]);
// the reed shawl: draped over both shoulders and down the upper arms, hem ragged with hanging stalks
const OGRE_SHAWL = S([[44, 354], [86, 316], [140, 300], [190, 304], [226, 314], [300, 338], [376, 316], [420, 302], [474, 302], [520, 320], [556, 356], [574, 410], [578, 470, 1], [566, 508], [556, 470], [546, 520], [532, 474], [516, 512], [500, 462], [470, 448], [440, 468], [420, 440], [390, 460], [364, 430], [336, 450], [300, 424], [264, 450], [236, 430], [208, 460], [180, 440], [150, 466], [120, 444], [100, 474], [84, 462], [70, 514], [56, 474], [40, 516], [28, 470, 1], [26, 410]]);
CAST.marsh_ogre = {
  id: 'marsh_ogre', label: '沼地食人魔：比篷车还高，泥色皮肤，肩上披着芦苇，扛着一块长木板，眼神迟缓；没有颈圈，没有锁链', rim: '#8a7a56',
  sil: [OGRE_PLANK, OGRE_HEAD, S([[352, 232], [378, 220, 1], [394, 236], [388, 262, 1], [366, 266]]), OGRE_BODY, OGRE_SHAWL],
  tones: [
    // the plank behind the shoulders (pale old timber) — painted first so the head and shawl sit over it
    [OGRE_PLANK, '#4e4434', 0.8],
    // mud-brown skin: chest, the huge upper arms below the shawl, the head
    [S([[60, 470], [140, 450], [300, 440], [460, 450], [550, 470], [580, 560], [590, 820], [10, 820], [20, 560]]), '#2e2618', 0.8],
    [OGRE_HEAD, '#2c2417'],
    [OGRE_SHAWL, '#3e3622', 0.92],
    // the chest's middle in deeper shade, the arm creases
    [S([[200, 520], [300, 500], [400, 520], [420, 820], [180, 820]]), '#1e180e', 0.5],
  ],
  lines: [
    // plank edges and grain (only outside the head)
    [`M14,300L190,292M392,282L594,272`, 2.2, 0.75],
    [`M40,318L160,312M420,298L560,290`, 1.4, 0.4],
    // brow ridge, heavy lids, broad nose, slack mouth, the jaw rim
    [`M196,226C214,212 238,208 262,214`, 3.4, 0.85],
    [`M184,282q12,8 26,4M196,318q18,8 40,4`, 2, 0.6],
    [pl([[378, 262], [366, 306], [334, 334], [290, 346]]), 3.4, 0.85],
    // reed stalks in the shawl, falling over the shoulders and arms
    [Array.from({ length: 30 }, (_, i) => { const x = 40 + i * 18, y0 = 330 + Math.abs(x - 300) * 0.1 - (i % 3) * 6 - (Math.abs(x - 300) < 80 ? -10 : 0); return `M${r0(x)},${r0(y0)}l${r0((x - 300) * 0.06)},${r0(100 + (i % 4) * 22)}`; }).join(''), 1.6, 0.6],
    [`M86,316C150,298 200,302 226,314M376,316C430,298 490,300 520,320C540,334 552,350 556,356`, 2.6, 0.75],
    // the huge arms falling out of frame, a crease at the elbow
    [`M26,470C16,540 12,640 10,800M574,470C584,540 588,640 590,800`, 2.6, 0.6],
    [`M60,640q30,10 60,0M480,640q30,10 60,0`, 1.8, 0.4],
  ],
  front: ({ rim }) => {
    let s = '';
    // the sleepy eye: a heavy half-closed lid, a small dull pupil
    s += `<path d="M206,246q14,-8 30,-4q-2,10 -14,12q-12,0 -16,-8z" fill="#0a0806"/><path d="M208,246q14,-7 28,-3" fill="none" stroke="${rim}" stroke-width="2.6" stroke-linecap="round" opacity=".85"/><circle cx="224" cy="250" r="2.4" fill="#c8b890" opacity=".85"/>`;
    // reed plumes poking up from the shawl at the shoulders, two old nail holes in the plank
    let pl2 = '';
    for (const [x, y, l, a] of [[96, 316, 46, -30], [124, 306, 38, -14], [468, 302, 44, 18], [498, 308, 40, 32], [520, 322, 34, 44]]) { const r = a * Math.PI / 180; pl2 += `M${x},${y}l${r0(Math.sin(r) * l)},${r0(-Math.cos(r) * l)}`; }
    s += `<path d="${pl2}" stroke="#c8b47a" stroke-width="3" stroke-linecap="round" opacity=".85"/>`;
    s += `<circle cx="110" cy="316" r="3" fill="#120e0a"/><circle cx="540" cy="292" r="3" fill="#120e0a"/>`;
    // the near hand gripping the plank's edge over the shoulder (thick fingers)
    s += `<path d="M478,276q10,-14 26,-12q14,2 18,14l-2,40q-14,8 -34,0z" fill="#2a2216"/><path d="M482,282h34M480,296h36M480,310h36" stroke="#120e0a" stroke-width="2"/><path d="M478,276q10,-14 26,-12" fill="none" stroke="${rim}" stroke-width="2" opacity=".7"/>`;
    // dried mud flaking on the shoulders
    s += `<g fill="#6a5a3a" opacity=".6"><circle cx="300" cy="350" r="3"/><circle cx="318" cy="356" r="2"/><circle cx="270" cy="352" r="2.5"/></g>`;
    return s;
  },
};

// 领队 (06–09) — the caravan leader: a round-faced woman in middle age, hair in a kerchief-tied bun, an apron over a
// sturdy work dress, sleeves rolled to the elbows, fists on her hips, the abacus hanging at her waist.
const LEADER_FACE = [[238, 182], [222, 210], [214, 238], [216, 252], [204, 272, 1], [214, 282], [210, 294], [218, 302], [216, 312], [226, 332], [250, 356], [286, 368], [326, 354], [364, 310], [384, 256], [372, 198]];
CAST.caravan_leader = {
  id: 'caravan_leader', label: '领队：圆脸的中年女商队领队，头巾包着发髻，袖子卷到手肘，双手叉腰，腰上挂着算盘', rim: '#d4a46a',
  sil: [
    circle(308, 236, 98),
    S(T(LEADER_FACE, 0, 6, 1.02, 300, 240)),
    // kerchief over the hair, knotted at the back; the bun behind
    S([[220, 206], [226, 162], [264, 132], [320, 124], [372, 144], [404, 184], [410, 230], [396, 260], [370, 222], [320, 196], [268, 192], [240, 210]]),
    circle(420, 196, 40),
    S([[430, 214], [470, 236], [480, 270], [458, 254], [446, 280], [436, 244]]),
    neck(0, 8, 1.02),
    // broad body, arms akimbo: elbows out at the frame edges, fists on the hips
    S([[250, 398], [180, 420], [120, 450], [86, 500], [56, 540], [26, 590], [20, 630], [60, 650], [130, 640], [150, 680], [140, 820], [460, 820], [450, 680], [470, 640], [540, 650], [580, 630], [574, 590], [544, 540], [514, 500], [480, 450], [420, 420], [356, 398]]),
  ],
  tones: [
    [S([[220, 206], [226, 162], [264, 132], [320, 124], [372, 144], [404, 184], [410, 230], [396, 260], [370, 222], [320, 196], [268, 192], [240, 210]]) + circle(420, 196, 40), '#4a3424', 0.85],
    // dress body; apron bib and skirt
    [S([[180, 420], [120, 450], [86, 500], [56, 540], [26, 590], [20, 630], [60, 650], [130, 640], [150, 680], [140, 820], [460, 820], [450, 680], [470, 640], [540, 650], [580, 630], [574, 590], [544, 540], [514, 500], [480, 450], [420, 420]]), '#2a2430', 0.9],
    [S([[236, 520], [364, 520], [380, 820], [220, 820]]), '#3a3438', 0.92],
    // bare forearms from the rolled sleeves down to the fists
    [S([[56, 556], [26, 592], [22, 628], [60, 648], [128, 638], [150, 672], [164, 662], [140, 626], [96, 590]]) + S([[544, 556], [574, 592], [578, 628], [540, 648], [472, 638], [450, 672], [436, 662], [460, 626], [504, 590]]), '#4a3a32', 0.85],
  ],
  lines: [
    [pl([[384, 262], [364, 312], [326, 356], [286, 370]]), 3.5, 0.85],
    // the kerchief's folds and its knot
    [pl([[264, 140], [320, 134], [372, 156]]) + pl([[250, 172], [312, 160], [370, 186]]), 2.4, 0.6],
    // rolled sleeve cuffs at the elbows (thick bands)
    [`M50,548q20,-14 44,0M70,534q20,-12 40,2M506,548q20,-14 44,0M490,536q20,-12 40,0`, 4, 0.75],
    // shoulders, apron edges and straps
    [pl([[120, 450], [180, 420], [250, 398]]) + pl([[356, 398], [420, 420], [480, 450]]), 3, 0.6],
    [pl([[236, 520], [364, 520]]) + pl([[236, 440], [246, 520]]) + pl([[364, 440], [354, 520]]), 2.4, 0.6],
    [pl([[60, 648], [128, 638], [150, 672]]) + pl([[540, 648], [472, 638], [450, 672]]), 2.4, 0.6],
  ],
  front: ({ rim }) => {
    let s = '';
    // round cheek blush of the rim light, a crinkled smiling eye, a pencil tucked behind the kerchief
    s += `<path d="M220,268q10,-8 22,-2" fill="none" stroke="${rim}" stroke-width="2.6" stroke-linecap="round" opacity=".85"/><path d="M226,286q10,4 18,0" fill="none" stroke="${rim}" stroke-width="1.6" opacity=".5"/>`;
    s += `<path d="M390,190L436,150" stroke="#e0c890" stroke-width="5" stroke-linecap="round"/><path d="M436,150l6,-6" stroke="#3a2a20" stroke-width="5" stroke-linecap="round"/>`;
    // the belt and the abacus hanging from it on a cord: wooden frame, rods, beads catching the light
    s += `<path d="M150,664H450" stroke="#5a3e2a" stroke-width="10"/><path d="M188,664l-10,16M206,664l10,16" stroke="#c8a870" stroke-width="2"/>`;
    s += `<path d="M150,680h96v60h-96z" fill="#5a3a24"/><path d="M158,688h80v44h-80z" fill="#1e1612"/><path d="M158,704h80" stroke="#5a3a24" stroke-width="4"/>`;
    let beads = '';
    for (let i = 0; i < 6; i++) { const x = 166 + i * 13; beads += `<path d="M${x},688v44" stroke="#8a6a44" stroke-width="1.5"/><ellipse cx="${x}" cy="696" rx="5" ry="3.4" fill="#d8a85a"/><ellipse cx="${x}" cy="${714 + (i % 3) * 5}" rx="5" ry="3.4" fill="#c89a50"/>`; }
    s += beads;
    s += `<path d="M150,680h96" stroke="${rim}" stroke-width="2" opacity=".7"/>`;
    // a ledger tucked into the apron pocket
    s += `<path d="M322,576h36v54h-36z" fill="#6a4a36"/><path d="M318,600h46v40h-46z" fill="#3a3036"/>`;
    return s;
  },
};

// 拾铁机 (07) — the scrap-picker: a barrel body on three spindly legs, one dragging; a single magnet arm; a small
// glass porthole in its chest (the core chamber) with one blue-glowing lens behind it ("the blue eye"); an
// emergency-stop ring sticking up from its back; an iron tag hung on a wire, the old number scratched out and a
// new one cut beside it (marks only, never lettering). No face. Built like a lamp stand of junk, not a weapon.
CAST.scrap_picker = {
  id: 'scrap_picker', label: '拾铁机：三足桶身的废铁机器，一条磁臂，胸前小玻璃窗里一只发蓝光的镜片，背上的急停环，一条拖着的腿，挂着改了编号的铁牌', rim: '#6fa8c8',
  sil: [
    // the emergency-stop ring on its back, standing up behind the cap (right)
    S([[388, 176], [404, 112, 1], [440, 86], [478, 96], [496, 132, 1], [484, 172], [466, 178], [476, 140, 1], [460, 116], [436, 116], [420, 140, 1], [418, 182]]),
    // the cap: a riveted dome with a stub chimney
    S([[176, 250], [190, 196], [236, 160], [300, 150], [364, 160], [410, 196], [424, 250]]),
    S([[280, 152], [282, 118], [318, 118], [320, 152]]),
    // the barrel body
    S([[168, 246], [432, 246], [446, 300], [452, 420], [446, 540], [430, 600], [170, 600], [154, 540], [148, 420], [154, 300]]),
    // the magnet arm from the left shoulder: upper pipe, elbow, forearm raised, the magnet disc
    S([[176, 300], [120, 330], [86, 380], [70, 440], [96, 448], [112, 392], [140, 352], [184, 330]]),
    S([[70, 440], [52, 380], [44, 320], [40, 270], [66, 266], [72, 318], [80, 376], [98, 436]]),
    S([[20, 274, 1], [24, 230], [56, 214], [90, 228], [96, 270, 1], [72, 262], [58, 246], [42, 250], [36, 266]]),
    // three legs: two planted, the third bent and dragging behind (right)
    S([[206, 596, 1], [150, 700, 1], [130, 820, 1], [154, 820, 1], [170, 708, 1], [226, 600, 1]]),
    S([[292, 600, 1], [296, 820, 1], [318, 820, 1], [314, 600, 1]]),
    circle(160, 704, 16),
    // the dragging leg: thigh down-back to a bent knee, the shin trailing behind, foot scraping
    S([[392, 592, 1], [470, 690, 1], [490, 678, 1], [410, 586, 1]]),
    S([[470, 690, 1], [576, 760, 1], [588, 744, 1], [490, 676, 1]]),
    circle(480, 684, 17),
    S([[566, 756, 1], [600, 772, 1], [600, 790, 1], [560, 770, 1]]),
  ],
  tones: [
    [S([[168, 246], [432, 246], [446, 300], [452, 420], [446, 540], [430, 600], [170, 600], [154, 540], [148, 420], [154, 300]]), '#20283a', 0.75],
    [S([[176, 250], [190, 196], [236, 160], [300, 150], [364, 160], [410, 196], [424, 250]]), '#2a3448', 0.8],
    // mismatched patch plates riveted on the barrel
    [S([[176, 470], [250, 462], [256, 560], [182, 566]]), '#2e3a50', 0.8],
    [S([[360, 300], [430, 306], [436, 380], [366, 374]]), '#34404e', 0.8],
  ],
  lines: [
    // hoops round the barrel
    [`M154,300C220,316 380,316 446,300M150,420C220,436 380,436 452,420M154,540C220,556 380,556 446,540`, 3, 0.7],
    // the cap seam and rivets row, the chimney rim
    [`M176,250C230,264 370,264 424,250M190,196C240,186 360,186 410,196`, 2.2, 0.55],
    // arm joints and legs catching the rim
    [`M176,300L120,330L86,380L70,440M70,440L52,380L40,270`, 2.4, 0.65],
    [`M226,600L170,708L154,820M314,600L318,820M410,586L490,678L588,744`, 2.2, 0.55],
    // the e-stop ring's lit edge
    [`M404,112C420,92 452,82 478,96`, 3, 0.8],
  ],
  defs: (p) => [`<radialGradient id="${p}-lens"><stop offset="0" stop-color="#e8f8ff"/><stop offset=".35" stop-color="#6fd0ff"/><stop offset="1" stop-color="#2a6aa8" stop-opacity="0"/></radialGradient>`],
  front: ({ rim, p }) => {
    let s = '';
    // the chest porthole: a brass-rimmed round window, dark glass with a faint crack, the blue eye glowing behind it
    s += `<circle cx="292" cy="404" r="62" fill="#0a0e16"/><circle cx="292" cy="404" r="62" fill="none" stroke="#7a6a4a" stroke-width="10"/><circle cx="292" cy="404" r="62" fill="none" stroke="#c8b07a" stroke-width="2" stroke-dasharray="30 360" stroke-dashoffset="-200" opacity=".8"/>`;
    s += `<circle cx="292" cy="410" r="44" fill="url(#${p}-lens)" opacity=".85"/><circle cx="292" cy="410" r="13" fill="#bff0ff"/><circle cx="292" cy="410" r="6" fill="#ffffff"/>`;
    s += `<path d="M252,372l26,18l14,-6" fill="none" stroke="#c8e4f0" stroke-width="1.6" opacity=".7"/><path d="M262,380a40,40 0 0 1 30,-16" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".55"/>`;
    // rivets on the hoops and patches
    let rv = '';
    for (const [x, y] of [[180, 306], [230, 312], [370, 312], [420, 306], [176, 426], [420, 428], [186, 546], [418, 546], [184, 478], [248, 470], [186, 556], [252, 552], [366, 306], [428, 312], [372, 368], [432, 374]]) rv += `<circle cx="${x}" cy="${y}" r="3.4"/>`;
    s += `<g fill="#8a98a8" opacity=".8">${rv}</g>`;
    // the magnet disc's pole faces, a few scraps of iron clinging to it
    s += `<path d="M24,230C40,214 74,214 90,228" fill="none" stroke="#c8443a" stroke-width="6"/><path d="M28,266l-8,10M44,270l-2,12M90,266l8,8" stroke="#8a8a94" stroke-width="3"/>`;
    // the iron tag on its wire: the old mark scratched through, a new mark cut beside it
    s += `<path d="M214,600l8,40" stroke="#5a6070" stroke-width="2"/><path d="M196,640h56v40h-56z" fill="#4a505c"/><path d="M196,640h56" stroke="${rim}" stroke-width="2" opacity=".7"/>`;
    // old tally of four notches, scratched through; the new tally of five cut beside it
    s += `<path d="M203,650v22M209,650v22M215,650v22M221,650v22" stroke="#1e222a" stroke-width="2.6"/><path d="M199,670l26,-18" stroke="#c8ccd4" stroke-width="2.4"/>`;
    s += `<path d="M229,650v22M234,650v22M239,650v22M244,650v22M226,668l22,-14" fill="none" stroke="#dce2ea" stroke-width="2"/>`;
    // scrape marks along the dragged leg's foot
    s += `<path d="M560,786l24,-4M548,776l20,-2" stroke="#8a98a8" stroke-width="2" opacity=".7"/><circle cx="160" cy="704" r="6" fill="#6a7888"/><circle cx="480" cy="684" r="6" fill="#6a7888"/>`;
    return s;
  },
};

// 伊涅丝 (09) — branch master of the 雾港 guild, 34: perched on the edge of her counter, leaning back on one hand,
// a plain guild coat over a high-collared shirt, dark hair in a loose low tail over her shoulder, a string of small
// silver bells at her waist with their clappers bound in cloth so they cannot ring. No national badge; not sexualised.
const INES_HAIR = S([[226, 196], [234, 152], [272, 126], [328, 122], [378, 142], [404, 182], [408, 226], [398, 262], [390, 300], [378, 250], [344, 214], [300, 202], [262, 204], [240, 220]]);
CAST.ines = {
  id: 'ines', label: '伊涅丝：三十四岁的雾港分会长，侧坐在柜台边，简便的公会外套，低束的深色长发搭在肩前，腰上一串铃舌缠着布的银铃', rim: '#9fb2c8',
  sil: [
    head(0, 4, 0.97, true),
    INES_HAIR,
    // the low tail brought forward over the near shoulder
    S([[388, 262], [412, 300], [416, 360], [404, 430], [384, 500], [366, 520], [372, 470], [380, 410], [376, 340], [366, 296]]),
    neck(0, 4, 0.92),
    // relaxed shoulders, leaning back on the far hand: the far shoulder lifted, the near arm resting in the lap
    S([[262, 392], [200, 410], [142, 436], [104, 476], [86, 540], [78, 640], [74, 820], [520, 820], [522, 700], [530, 600], [540, 520], [536, 450], [506, 400], [456, 380], [400, 376], [350, 374]]),
    // the far arm braced straight down behind her on the counter's edge
    S([[506, 404], [548, 430], [566, 520], [574, 640], [584, 730], [560, 736], [540, 640], [528, 540]]),
    // the counter's edge she sits on, along the bottom
    S([[0, 744, 1], [600, 734, 1], [600, 820, 1], [0, 820, 1]]),
  ],
  tones: [
    [INES_HAIR, '#262a36', 0.9],
    [S([[388, 262], [412, 300], [416, 360], [404, 430], [384, 500], [366, 520], [372, 470], [380, 410], [376, 340], [366, 296]]), '#262a36', 0.9],
    // the guild coat (open), the shirt's high collar between its lapels
    [S([[200, 410], [142, 436], [104, 476], [86, 540], [78, 640], [74, 820], [260, 820], [262, 600], [252, 470], [262, 410]]) + S([[350, 396], [400, 376], [456, 380], [506, 400], [536, 450], [540, 520], [530, 600], [522, 700], [520, 820], [340, 820], [346, 600], [340, 470]]), '#283040', 0.92],
    [S([[506, 404], [548, 430], [566, 520], [574, 640], [584, 730], [560, 736], [540, 640], [528, 540]]), '#222a38', 0.9],
    [S([[0, 744], [600, 734], [600, 820], [0, 820]]), '#3a3430', 0.95],
    [S([[262, 400], [300, 420], [346, 396], [340, 470], [346, 600], [340, 820], [262, 820], [262, 600], [252, 470]]), '#3a4252', 0.9],
    [S([[264, 392], [300, 408], [344, 390], [340, 422], [300, 436], [266, 420]]), '#48526a', 0.9],
  ],
  lines: [
    [pl([[386, 258], [366, 308], [324, 352]]), 3.4, 0.85],
    [pl([[272, 134], [330, 130], [378, 150]]) + pl([[258, 168], [316, 156], [372, 180]]), 2.2, 0.55],
    // the tail's strands
    [`M396,280C410,320 412,380 398,440M386,290C396,330 396,390 382,470`, 1.8, 0.6],
    // lapels and coat edges, the belt
    [pl([[262, 410], [252, 470], [262, 600], [260, 800]]) + pl([[340, 400], [340, 470], [346, 600], [342, 800]]), 2.4, 0.6],
    [pl([[104, 476], [142, 436], [200, 410]]) + pl([[456, 380], [506, 400], [548, 430], [566, 520], [574, 640], [584, 730]]), 3, 0.6],
    [`M80,640C200,652 400,652 524,640`, 4, 0.55],
    [`M0,744L600,734`, 3, 0.7],
  ],
  front: ({ rim }) => {
    let s = '';
    // a level, measuring eye; a small silver earring
    s += `<path d="M222,258q12,-6 24,-2" fill="none" stroke="${rim}" stroke-width="2.4" stroke-linecap="round" opacity=".85"/><path d="M226,264h16" stroke="${rim}" stroke-width="1.4" opacity=".5"/><circle cx="356" cy="292" r="4" fill="#dce4ee"/>`;
    // the shirt collar's two plain buttons; the coat's plain toggles
    s += `<g fill="#c8d0dc"><circle cx="302" cy="430" r="3.4"/><circle cx="304" cy="470" r="3.4"/></g><path d="M256,500h12M256,560h12M336,500h12M336,560h12" stroke="#8a96a8" stroke-width="4" stroke-linecap="round"/>`;
    // the string of silver bells at her waist: small bells on a cord, each clapper bound in a strip of cloth
    let bells = '';
    for (const [i, x] of [140, 172, 204, 236].entries()) {
      const y = 652 + (i % 2) * 10;
      bells += `<path d="M${x},${y}v14" stroke="#9aa6b8" stroke-width="2"/><path d="M${x - 11},${y + 38}q0,-24 11,-24q11,0 11,24z" fill="#cdd6e2"/><path d="M${x - 11},${y + 38}h22" stroke="#7a8698" stroke-width="2"/>`;
      bells += `<path d="M${x - 4},${y + 38}h8v8h-8z" fill="#e8dcc4"/><path d="M${x + 4},${y + 40}q8,4 6,12" fill="none" stroke="#e8dcc4" stroke-width="2.4"/>`;
      bells += `<path d="M${x - 8},${y + 30}q2,-12 8,-14" fill="none" stroke="#ffffff" stroke-width="1.6" opacity=".7"/>`;
    }
    s += `<path d="M120,652q60,16 140,0" fill="none" stroke="#9aa6b8" stroke-width="2.4"/>` + bells;
    // her far hand flat on the counter edge
    s += `<path d="M556,724q14,-6 30,2l4,12h-36z" fill="#2a3040"/><path d="M556,724q14,-6 30,2" fill="none" stroke="${rim}" stroke-width="2" opacity=".7"/>`;
    return s;
  },
};

// ---------------------------------------------------------------------------------------------
// chapter 10
// ---------------------------------------------------------------------------------------------

// 潮腔母虫 (10) — a boat-sized creature of the old cistern: a broad, flat, pale carapace (head end to the left, two
// short feelers, a pair of small dull eye-spots on the front rim, short paddles under the rear edge), and under its belly a
// translucent water sac swollen with what it has drawn in. (No paddles under the head end, so nothing there reads as teeth.) Black roots are wound round the sac — they come up from
// below, cross over and behind it and trail away; they never grow out of the shell, and they never glow. No mouthparts
// shown, no blood, nothing dragon-like (no horns, wings, neck or teeth). Pale grey-green; the rim light is its colour.
// authored at full size, then lifted and narrowed so the sac and roots sit above the dialogue box (the player fades
// busts out below 70% of their height): x' = .92x + 24, y' = .85y - 66 — point-wise for the silhouette, as a group
// transform for everything painted on it
const MOTHER_MAP = 'matrix(.92 0 0 .85 24 -66)';
const mmap = (pts) => pts.map(([x, y, c]) => (c ? [0.92 * x + 24, 0.85 * y - 66, 1] : [0.92 * x + 24, 0.85 * y - 66]));
const MOTHER_SHELL_PTS = ([[34, 334], [52, 270], [104, 214], [190, 178], [300, 160], [410, 168], [496, 196], [552, 236], [578, 280], [572, 320], [548, 350], [500, 374], [430, 392], [340, 404], [250, 404], [168, 394], [100, 376], [56, 356]]);
const MOTHER_RIM_PTS = ([[34, 334, 1], [56, 356], [100, 376], [168, 394], [250, 404], [340, 404], [430, 392], [500, 374], [548, 350], [572, 320, 1], [566, 344], [540, 374], [494, 398], [430, 416], [340, 428], [250, 428], [166, 418], [96, 400], [50, 378], [30, 352]]);
const MOTHER_SHELL = S(MOTHER_SHELL_PTS), MOTHER_RIM = S(MOTHER_RIM_PTS);
const MOTHER_SAC = S([[166, 412], [134, 456], [118, 520], [126, 598], [158, 664], [220, 712], [300, 728], [380, 714], [440, 668], [476, 600], [488, 522], [474, 452], [444, 410], [380, 424], [300, 428], [222, 424]]);
// a cubic sampled into points, and a tapered band along points (screen space)
const cub = (a, b, c, d, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; });
const rootBand = (pts, w0, w1) => {
  const L = [], R = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    tx /= l; ty /= l;
    const w = (w0 + (w1 - w0) * i / (n - 1)) / 2 * (1 + 0.16 * Math.sin(i * 1.7));
    L.push([pts[i][0] - ty * w, pts[i][1] + tx * w]); R.unshift([pts[i][0] + ty * w, pts[i][1] - tx * w]);
  }
  return 'M' + [...L, ...R].map(([x, y]) => `${f(x, 1)},${f(y, 1)}`).join('L') + 'Z';
};
// the roots' course round the sac: rear runs (behind the membrane) and front runs, plus the loose ends
const ROOT_BACK = [
  [cub([486, 630], [420, 560], [200, 520], [122, 500]), 14, 13],
  [cub([452, 682], [400, 640], [240, 628], [160, 640]), 9, 8],
];
const ROOT_FRONT = [
  [[...cub([60, 1000], [40, 820], [80, 670], [124, 600]), ...cub([124, 600], [220, 692], [390, 694], [486, 630]).slice(1)], 24, 15],
  [[...cub([122, 500], [204, 578], [392, 584], [488, 520]), ...cub([488, 520], [528, 590], [566, 720], [586, 1000]).slice(1)], 14, 10],
  [[...cub([240, 1000], [212, 820], [184, 726], [176, 690]), ...cub([176, 690], [240, 748], [380, 748], [452, 682]).slice(1)], 14, 8],
  [cub([160, 640], [126, 660], [96, 720], [80, 820]), 8, 3],
];
const ROOTLETS = [[[56, 800], [24, 786], [8, 800]], [[92, 650], [62, 628], [52, 606]], [[548, 668], [584, 656], [596, 640]], [[568, 780], [596, 800], [604, 830]], [[204, 800], [174, 818], [164, 846]], [[110, 704], [80, 712], [66, 730]]];
CAST.tide_cavity_mother = {
  id: 'tide_cavity_mother', label: '潮腔母虫：小船大小的扁平苍白甲壳，头端两根短触须和一对暗淡的眼点，壳缘下几只短桨足；腹下鼓着半透明的水囊，几道黑色的根从下面缠上来、绕过水囊又垂下去（缠着，不是从壳里长出来，不发光）；不画口器，不像龙', rim: '#b4c2ae',
  sil: [
    S(mmap(MOTHER_SHELL_PTS)), S(mmap(MOTHER_RIM_PTS)),
    // the two short feelers off the head end, drooping forward (nothing points up like a horn)
    S(mmap([[46, 318, 1], [26, 312], [8, 318], [0, 334, 1], [10, 336, 1], [16, 324], [30, 322], [50, 328, 1]])),
    S(mmap([[48, 348, 1], [26, 358], [10, 376], [4, 398, 1], [14, 400, 1], [20, 380], [32, 366], [56, 356, 1]])),
    // short paddles under the rear of the shell's edge (none under the head end)
    S(mmap([[462, 404, 1], [478, 440], [496, 462], [510, 452], [494, 420], [484, 396, 1]])),
    S(mmap([[514, 384, 1], [540, 414], [566, 430], [576, 418], [552, 392], [534, 370, 1]])),
  ],
  tonesM: [
    // the pale carapace: lit toward the upper left, shading off toward the rear and the rim
    [MOTHER_SHELL, '#7a887c', 0.95],
    [S([[52, 300], [88, 230], [170, 190], [280, 170], [360, 172], [300, 214], [200, 250], [120, 296], [70, 330]]), '#a6b2a2', 0.55],
    [S([[300, 404], [420, 392], [520, 360], [570, 312], [560, 270], [500, 300], [420, 340], [330, 372]]), '#55635a', 0.55],
    [MOTHER_RIM, '#3a463e', 0.95],
    // the darker head shield at the front
    [S([[34, 334], [48, 280], [86, 232], [120, 214], [104, 262], [92, 320], [74, 362], [50, 360]]), '#5e6c62', 0.7],
    // paddles and feelers, pale
    [S([[462, 404], [478, 440], [496, 462], [510, 452], [494, 420], [484, 396]]) + S([[514, 384], [540, 414], [566, 430], [576, 418], [552, 392], [534, 370]]), '#6a786c', 0.85],
  ],
  linesM: [
    // the lit upper-left edge of the shell and the head rim
    [`M34,334C40,262 118,190 300,160`, 3.4, 0.85],
    [`M300,160C380,160 470,180 552,236`, 2, 0.5],
    // the keel down its back and six segment ridges across it (bowed toward the head)
    [`M78,304C200,280 400,262 568,282`, 2, 0.45, '#46544a'],
    [[176, 236, 296, 356, 416, 476].map((x) => { const yt = 162 + ((x - 300) / 280) ** 2 * 88, yb = 404 - ((x - 300) / 280) ** 2 * 44; return `M${x},${r0(yt + 6)}C${x - 26},${r0(yt + (yb - yt) * 0.35)} ${x - 22},${r0(yt + (yb - yt) * 0.7)} ${x + 6},${r0(yb - 4)}`; }).join(''), 2.4, 0.7, '#4a584e'],
    [[176, 236, 296, 356, 416, 476].map((x) => { const yt = 162 + ((x - 300) / 280) ** 2 * 88, yb = 404 - ((x - 300) / 280) ** 2 * 44; return `M${x + 3},${r0(yt + 8)}C${x - 22},${r0(yt + (yb - yt) * 0.35)} ${x - 18},${r0(yt + (yb - yt) * 0.68)} ${x + 8},${r0(yb - 8)}`; }).join(''), 1.2, 0.4],
    // the scalloped rear rim where the segments end
    [`M496,196l8,10l6,-2M552,236l2,12l8,0M578,280l-6,10l4,8`, 1.6, 0.55],
  ],
  defs: (p) => [
    `<linearGradient id="${p}-sac" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d2e2d4" stop-opacity=".2"/><stop offset=".55" stop-color="#a8c6b4" stop-opacity=".32"/><stop offset="1" stop-color="#7aa290" stop-opacity=".46"/></linearGradient>`,
  ],
  front: ({ rim, p }) => {
    const spec = CAST.tide_cavity_mother;
    let s = `<g transform="${MOTHER_MAP}">`;
    s += spec.tonesM.map(([d, c, op = 1]) => `<path d="${d}" fill="${c}"${op < 1 ? ` opacity="${op}"` : ''}/>`).join('');
    s += spec.linesM.map(([d, w, op = 0.8, c = rim]) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/>`).join('');
    // the two small eye-spots on the head rim: dull, not glowing
    s += `<ellipse cx="76" cy="304" rx="7" ry="5" fill="#101412"/><ellipse cx="101" cy="293" rx="6" ry="4.4" fill="#101412"/><circle cx="74" cy="302" r="1.6" fill="#dfe8dc" opacity=".7"/><circle cx="99" cy="291" r="1.4" fill="#dfe8dc" opacity=".7"/>`;
    // the roots' rear runs, seen dimly through the membrane
    s += `<path d="${ROOT_BACK.map(([pts, a, b]) => rootBand(pts, a, b)).join('')}" fill="#0c0e0c"/>`;
    // the water sac: translucent, fuller and greener toward the bottom, a few bubbles, a soft light on its shoulder
    s += `<path d="${MOTHER_SAC}" fill="url(#${p}-sac)"/>`;
    s += `<path d="M126,592C200,604 300,598 400,604C440,606 470,598 482,590C478,622 460,650 440,668C400,706 350,724 300,728C250,726 200,706 160,664C140,642 128,618 126,592Z" fill="#6e9a86" opacity=".22"/>`;
    s += `<path d="M130,594q40,8 80,2t80,0t80,2t80,-2t48,-2" fill="none" stroke="#cfe2d4" stroke-width="1.6" opacity=".45"/>`;
    s += `<g fill="none" stroke="#dbeadf" stroke-width="1.5" opacity=".55"><circle cx="232" cy="520" r="6"/><circle cx="252" cy="548" r="3.5"/><circle cx="376" cy="480" r="5"/><circle cx="350" cy="560" r="3"/><circle cx="300" cy="462" r="4"/></g>`;
    s += `<path d="M146,480C146,444 176,428 214,428" fill="none" stroke="#eef6ef" stroke-width="5" stroke-linecap="round" opacity=".35"/><path d="M138,540C136,512 140,494 150,480" fill="none" stroke="#eef6ef" stroke-width="2.4" stroke-linecap="round" opacity=".3"/>`;
    s += `<path d="${MOTHER_SAC}" fill="none" stroke="${rim}" stroke-width="2.4" opacity=".55"/>`;
    // the roots' front runs and their loose ends trailing away below, with thin rootlets; matte black
    s += `<path d="${ROOT_FRONT.map(([pts, a, b]) => rootBand(pts, a, b)).join('')}${ROOTLETS.map((pts) => rootBand(cub(pts[0], pts[1], pts[1], pts[2], 6), 4, 1)).join('')}" fill="#0c0e0c"/>`;
    s += `<path d="${ROOT_FRONT.slice(0, 3).map(([pts]) => pts.filter((_, i) => i % 5 === 2).map(([x, y]) => `M${f(x - 3, 1)},${f(y - 3, 1)}h6`).join('')).join('')}" stroke="#262c26" stroke-width="1.6" opacity=".7"/>`;
    // the shell's rim band over the top of the sac (the sac hangs beneath it)
    s += `<path d="${MOTHER_RIM}" fill="#3a463e"/><path d="M50,378C120,404 240,430 340,428C430,420 500,398 540,374" fill="none" stroke="#1a201c" stroke-width="2" opacity=".8"/><path d="M34,334C60,360 120,382 168,394" fill="none" stroke="${rim}" stroke-width="2" opacity=".5"/>`;
    return s + '</g>';
  },
};

export const npcBusts = Object.fromEntries(Object.entries(CAST).map(([id, spec]) => [id, (rim) => render(spec, rim)]));
