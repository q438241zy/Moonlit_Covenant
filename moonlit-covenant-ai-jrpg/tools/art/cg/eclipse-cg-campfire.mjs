// camp-fire.svg 「战前餐车」 — the three heroines around a lamp-lit table in the dining car.
// Hand-authored character shapes (cel style: base + shadow + highlight, coloured line art).
import * as L from './eclipse-cg-lib.mjs';

const { PAL, f, shape: S0 } = L;
const S = (pts, closed = true) => S0(pts, closed, 1);
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
const line = (d, stroke, w, extra = '') => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;

const SKIN = { base: '#f7dccd', sh: '#d9a59e', hi: '#fff3ea', line: '#7a3f48' };
const INK = '#3a2236';

// ---------------------------------------------------------------------------------------------
// Serena — seated facing us, eyes closed, both hands around a teacup. Head centre (0,0), head ~110 tall.
// ---------------------------------------------------------------------------------------------
function serena(p) {
  const H = { base: '#2b2050', sh: '#170f2e', hi: '#6a58aa', tip: '#efe9ff' };
  const RB = { base: '#2e2450', sh: '#181032', hi: '#54448a', trim: '#d4cdf0' };
  let s = '';
  // back hair: long straight curtain behind the shoulders
  s += path(S([[-52, -56], [-58, -10], [-60, 60], [-64, 130], [-72, 380, 1], [72, 380, 1], [66, 130], [62, 60], [60, -10], [54, -56], [0, -76]]), H.sh);
  // robe: sloped shoulders, torso
  s += path(S([[-14, 84], [14, 84], [34, 98], [92, 112], [116, 138], [124, 220], [128, 380, 1], [-128, 380, 1], [-124, 220], [-116, 138], [-92, 112], [-34, 98]]), RB.base);
  s += path(S([[40, 100], [92, 112], [116, 138], [124, 220], [128, 380, 1], [70, 380, 1], [78, 240], [72, 150]]), RB.sh);
  s += line('M-92,114Q-60,104-34,100M-116,140Q-120,180-122,220', RB.hi, 2.2, ' opacity=".8"');
  // seal embroidery down the front + observer pendant (closed silver eyelid)
  s += line('M0,170V380', RB.trim, 1.2, ' opacity=".35"');
  s += line('M-14,112Q0,140,14,112', '#b9b2d8', 1.2, ' opacity=".8"');
  s += path('M-12,146Q0,136,12,146Q0,156-12,146Z', '#dcd6f4', ` stroke="#8d86b0" stroke-width="1.2"`) + line('M-8,147Q0,151,8,147', '#8d86b0', 1);
  // neck + high collar
  s += path(S([[-12, 36], [14, 36], [15, 86], [0, 90], [-13, 86]]), SKIN.base);
  s += path(S([[-12, 40], [14, 40], [14, 56], [0, 62], [-12, 56]]), SKIN.sh, ' opacity=".7"');
  s += path(S([[-26, 82, 1], [26, 82, 1], [30, 104], [0, 112], [-30, 104]]), RB.base, ` stroke="${RB.trim}" stroke-width="2.4"`);
  s += line('M-24,96Q0,104,26,96', RB.trim, 1.4);
  // face: adult oval, slight turn to her right
  s += path(S([[-36, -32], [-37, -2], [-33, 20], [-22, 38], [-3, 50], [18, 41], [32, 21], [38, -2], [37, -32]]), SKIN.base, ` stroke="${SKIN.line}" stroke-width="1.5"`);
  s += path(S([[20, 36], [32, 21], [38, -2], [37, -26], [28, -8], [26, 18]]), SKIN.sh, ' opacity=".5"');
  s += path(S([[-30, 6], [-26, 22], [-16, 30], [-22, 16]]), SKIN.hi, ' opacity=".7"');
  // closed eyes with lashes, calm brows, nose, mouth, faint blush
  s += line('M-28,3Q-18,10-7,5', INK, 2.4) + line('M8,5Q19,10,30,3', INK, 2.4);
  s += line('M-28,3l-4,-3M-24,6l-3,3M30,3l4,-3M26,6l3,3', INK, 1.4);
  s += line('M-28,-12Q-18,-16-8,-13M9,-13Q19,-16,29,-12', '#4a2f5e', 1.5);
  s += line('M3,13Q4,19,1,23', SKIN.line, 1.3);
  s += line('M-5,33Q2,35,9,33', '#9a4a5a', 1.6);
  s += `<ellipse cx="-20" cy="18" rx="7" ry="3" fill="#f2a0a8" opacity=".4"/><ellipse cx="22" cy="18" rx="7" ry="3" fill="#f2a0a8" opacity=".4"/>`;
  // front hair: hime fringe + straight side locks to the chest, moon-white ends
  s += path(S([[-44, -24], [-46, -50], [-26, -70], [4, -76], [30, -70], [47, -52], [46, -24], [40, -17, 1], [18, -16, 1], [14, -22, 1], [10, -15, 1], [-12, -15, 1], [-16, -21, 1], [-20, -15, 1], [-40, -17, 1]]), H.base);
  s += line('M-40,-17L-20,-15M-12,-15L10,-15M18,-16L40,-17', H.sh, 1.6);
  s += path(S([[-38, -22], [-44, 30], [-46, 100], [-46, 168, 1], [-31, 168, 1], [-32, 100], [-33, 30], [-31, -10]]), `url(#${p}-lock)`);
  s += path(S([[38, -22], [46, 30], [48, 100], [48, 168, 1], [32, 168, 1], [32, 100], [32, 30], [30, -10]]), `url(#${p}-lock)`);

  s += line('M-30,-64Q-4,-72,24,-66M-38,-44Q-32,-56-20,-62', H.hi, 2.6, ' opacity=".85"');
  s += line('M54,-56Q62,-10,62,60M-52,-56Q-58,-10-60,60', PAL.serena, 3, ' opacity=".75"');
  s += line('M-40,20Q-42,80-40,140M42,20Q44,80,42,140', H.hi, 1.8, ' opacity=".55"');
  // thin braid with the moon-phase ornament (her left)
  s += line('M46,-30Q56,10,54,70', '#1c1436', 6, ' stroke-dasharray="6 3"');
  s += `<circle cx="52" cy="-16" r="9" fill="#1b1533" stroke="${RB.trim}" stroke-width="2"/><path d="M52,-23.5A7.5,7.5 0 1 1 52,-8.5A4.5,7.5 0 1 0 52,-23.5Z" fill="#efe9ff"/>`;
  // arms: wide sleeves bent at the elbow, forearms rising to the cup
  s += path(S([[-104, 120], [-124, 180], [-122, 236], [-96, 258], [-60, 252], [-30, 226], [-28, 206], [-62, 210], [-88, 200], [-96, 160]]), RB.base, ` stroke="${RB.sh}" stroke-width="2"`);
  s += path(S([[104, 120], [124, 180], [124, 236], [98, 258], [62, 252], [32, 226], [30, 206], [64, 210], [90, 200], [98, 160]]), RB.sh, ` stroke="#0f0a20" stroke-width="2"`);
  s += path(S([[-122, 236], [-110, 286], [-80, 300], [-60, 252], [-96, 258]]), RB.sh) + path(S([[124, 236], [112, 286], [82, 300], [62, 252], [98, 258]]), '#120c26');
  s += line('M-60,252Q-46,236-30,226M62,252Q48,236,32,226', RB.trim, 1.4, ' opacity=".6"');
  // teacup cradled in both hands (white half-glove on her right hand)
  s += path('M-22,188H28L23,218Q3,228-17,218Z', '#f6f1ea', ` stroke="#b08a50" stroke-width="1.6"`);
  s += `<ellipse cx="3" cy="188" rx="25" ry="6" fill="#b8763e" stroke="${PAL.brassHi}" stroke-width="2"/>`;
  // her right hand (white half-glove): palm on the side, four fingers curled across the front
  s += path(S([[-40, 200], [-28, 192], [-18, 196], [-18, 218], [-30, 226], [-40, 220]]), '#f7f4ff', ` stroke="#8d86b0" stroke-width="1.2"`);
  for (let i = 0; i < 4; i++) s += `<rect x="${-20 + i * 0}" y="${196 + i * 7}" width="14" height="6.5" rx="3.2" fill="${i < 3 ? '#f7f4ff' : SKIN.base}" stroke="#8d86b0" stroke-width="1"/>`;
  // her left hand (bare)
  s += path(S([[44, 200], [32, 192], [22, 196], [22, 218], [34, 226], [44, 220]]), SKIN.base, ` stroke="${SKIN.line}" stroke-width="1.2"`);
  for (let i = 0; i < 4; i++) s += `<rect x="12" y="${196 + i * 7}" width="13" height="6.5" rx="3.2" fill="${SKIN.base}" stroke="${SKIN.line}" stroke-width="1"/>`;
  s += line('M-2,178C-8,166,4,160-2,148M12,178C17,164,8,158,14,146', '#fff6ea', 1.6, ' opacity=".3"');
  // warm lamp light on the near-side cheek & cup; cool window rim on the hair silhouette
  s += line('M-36,-2L-33,20L-22,38', '#ffd091', 2, ' opacity=".6"');
  s += line('M-52,-56Q-58,-10-60,60M54,-56Q60,-10,62,60M-92,112Q-112,120-118,150', '#b9a8ff', 2.5, ' opacity=".55"');
  return s;
}

// ---------------------------------------------------------------------------------------------
// Lia — standing, profile facing right, striking the table with the sword pommel.
// ---------------------------------------------------------------------------------------------
function lia(p) {
  const H = { base: '#d23a4e', sh: '#8a1d33', hi: '#ff8c98', streak: '#5e1222' };
  const AR = { base: '#c4c7de', sh: '#7a7c9c', hi: '#ffffff', red: '#a32a3e', redSh: '#64172a' };
  let s = '';
  // cape behind (burnt hem)
  s += path(S([[-30, 84], [-74, 120], [-104, 230], [-118, 360], [-130, 470, 1], [-108, 452, 1], [-90, 478, 1], [-66, 450, 1], [-44, 474, 1], [-26, 330], [-6, 140]]), AR.redSh);
  // ponytail: rises from the crown, sweeps back and falls to the waist
  s += '<g transform="translate(4 14)">';
  s += path(S([[-20, -56], [-50, -84], [-96, -86], [-128, -54], [-140, 0], [-138, 80], [-124, 160, 1], [-118, 100], [-104, 140, 1], [-102, 70], [-92, 20], [-64, -26], [-30, -38]]), H.base);
  s += path(S([[-64, -26], [-92, 20], [-102, 70], [-104, 140, 1], [-118, 100], [-124, 160, 1], [-138, 80], [-136, 20], [-110, -10]]), H.sh);
  s += line('M-40,-70Q-90,-90-124,-50M-60,-50Q-110,-60-128,-10', H.hi, 2.4, ' opacity=".8"');
  s += path('M-30,-58L-16,-46L-24,-38L-38,-50Z', PAL.oath);
  s += '</g>';
  // far arm (elbow behind the body)
  s += path(S([[-30, 120], [-56, 190], [-50, 250], [-30, 240], [-24, 180]]), AR.redSh);
  // neck
  s += path(S([[-8, 34], [22, 46], [26, 88], [-4, 92], [-10, 60]]), SKIN.sh);
  // torso: armour in profile, leaning toward the table
  s += path(S([[-8, 82], [24, 88], [38, 102], [56, 138], [54, 178], [40, 220], [34, 250], [42, 300, 1], [-38, 300, 1], [-32, 256], [-42, 196], [-44, 140], [-34, 104]]), AR.base, ` stroke="${AR.sh}" stroke-width="2"`);
  s += path(S([[30, 96], [38, 102], [56, 138], [54, 178], [40, 220], [36, 190], [42, 140]]), AR.hi, ' opacity=".5"');
  s += path(S([[-44, 140], [-42, 196], [-32, 256], [-38, 300, 1], [-14, 300, 1], [-14, 250], [-22, 190], [-24, 140]]), AR.sh, ' opacity=".5"');
  s += line('M-30,232Q4,226,38,232', AR.sh, 2);
  s += path(S([[-34, 266, 1], [38, 270, 1], [42, 300, 1], [-38, 300, 1]]), AR.red);
  s += path(S([[-40, 298, 1], [46, 298, 1], [56, 350, 1], [28, 342, 1], [8, 356, 1], [-18, 344, 1], [-42, 352, 1]]), AR.base, ` stroke="${AR.sh}" stroke-width="2"`);
  s += path('M44,150L52,140L60,150L52,164Z', PAL.oath, ` stroke="#b07a3a" stroke-width="1.4"`) + line('M52,142L50,150L55,155', '#fff3d6', 1.1);
  // head: skull, face profile (adult, high cheekbones), jaw
  s += '<g transform="translate(4 14)">';
  s += path(S([[24, -44], [0, -60], [-30, -52], [-44, -24], [-42, 10], [-28, 36], [-6, 48], [12, 53], [34, 48, 1], [40, 40], [41, 32, 1], [36, 28, 1], [42, 24, 1], [41, 18, 1], [47, 14, 1], [44, 8], [36, -6], [38, -14], [34, -30]]), SKIN.base, ` stroke="${SKIN.line}" stroke-width="1.5"`);
  s += path(S([[-30, 6], [-16, 34], [8, 50], [-6, 30], [-14, 10]]), SKIN.sh, ' opacity=".45"');
  // eye (amber), frowning brow, scar through the brow tail
  s += path('M22,-7Q30,-10,36,-6L34,2Q28,4,23,2Z', '#fff8f2');
  s += path('M28,-8Q34,-7,35,-3L34,2Q31,3,28,2Z', '#d8902c');
  s += path('M31,-6L34,-5L33,1L31,1Z', '#3a1a10');
  s += line('M20,-8Q29,-12,38,-7', INK, 2.6);
  s += line('M21,3Q27,5,33,3', SKIN.line, 1.1, ' opacity=".7"');
  s += line('M17,-17L39,-13', '#6a1828', 2.8);
  s += line('M34,-19L31,-9', '#c97a7a', 1.1, ' opacity=".7"');
  // mouth mid-command
  s += path('M42,24L36,28L41,31Z', '#9a3a46');
  // ear
  s += path(S([[-12, -4], [-3, -9], [2, 2], [-1, 13], [-10, 12]]), SKIN.sh, ` stroke="${SKIN.line}" stroke-width="1.1"`);
  // hair: crown, spiky fringe over the forehead, lock before the ear, dark streak
  s += path(S([[36, -24], [34, -50], [6, -66], [-30, -60], [-46, -30], [-38, -6, 1], [-28, -28], [-20, -8, 1], [-12, -32], [0, -14, 1], [8, -34], [18, -16, 1], [22, -32], [32, -14, 1], [34, -22]]), H.base);
  s += path(S([[2, -28], [-2, 0], [0, 30, 1], [-10, 6], [-12, -22]]), H.base);
  s += line('M-8,-30Q-6,-10,-4,8', H.streak, 3, ' opacity=".9"');
  s += line('M26,-56Q-2,-68-30,-54M-10,-36Q-4,-50,10,-58', H.hi, 2.4, ' opacity=".85"');
  s += '</g>';
  // pauldron (battle-notched)
  s += path(S([[-34, 92], [6, 76], [42, 88], [54, 116], [40, 138], [26, 130, 1], [20, 142, 1], [-22, 138], [-42, 114]]), AR.base, ` stroke="${AR.sh}" stroke-width="2"`);
  s += line('M-32,96Q6,80,42,92', AR.hi, 2.4);
  s += path(S([[-22, 120], [18, 114], [40, 124], [26, 130, 1], [20, 142, 1], [-22, 138]]), AR.sh, ' opacity=".5"');
  // near arm: shoulder -> elbow -> fist on the scabbard (red sleeve + vambrace)
  s += path(S([[-4, 124], [20, 128], [34, 170], [44, 206], [50, 222], [34, 236], [18, 220], [6, 176], [-12, 140]]), AR.red, ` stroke="${AR.redSh}" stroke-width="1.6"`);
  s += path(S([[30, 212], [52, 214], [76, 224], [104, 228], [106, 250], [76, 250], [48, 244], [30, 236]]), AR.red, ` stroke="${AR.redSh}" stroke-width="1.6"`);
  s += path(S([[56, 218, 1], [100, 226, 1], [102, 250, 1], [58, 246, 1]]), AR.base, ` stroke="${AR.sh}" stroke-width="1.5"`);
  s += `<circle cx="38" cy="222" r="11" fill="${AR.base}" stroke="${AR.sh}" stroke-width="1.5"/>`;
  s += line('M58,220L100,228', AR.hi, 1.6);
  // the sword, hilt down: slim scabbard rising past her shoulder, pommel striking the table
  s += path('M113,-24L129,-24L130,226L112,226Z', '#4a2836', ` stroke="#1e1018" stroke-width="1.6"`);
  s += line('M117,-18L117,220', '#7a4458', 1.8);
  s += path('M111,-34h20l-4,12h-12zM111,60h20v9h-20zM111,150h20v9h-20z', PAL.brass);
  s += `<circle cx="121" cy="268" r="11" fill="none" stroke="${PAL.brassHi}" stroke-width="3.5" stroke-dasharray="29 4 31 5"/>`;
  s += path('M117,278h8v26h-8z', '#2a1a20');
  s += `<circle cx="121" cy="310" r="7.5" fill="${PAL.brass}" stroke="#6b4a26" stroke-width="1.4"/>`;
  // gauntleted fist around the scabbard mouth
  s += path(S([[106, 228], [124, 222], [138, 230], [138, 254], [122, 260], [106, 252]]), AR.base, ` stroke="${AR.sh}" stroke-width="1.5"`);
  s += line('M126,230Q132,238,130,252M116,230Q121,240,119,252', AR.sh, 1.2);
  // standard-colour rim on the back edges (ponytail, cape), warm lamp rim on the front
  s += line('M-46,-70Q-92,-72-124,-40Q-136,14-134,94', PAL.lia, 3, ' opacity=".85"') + line('M-74,120Q-104,230-118,360', PAL.lia, 3, ' opacity=".7"');
  s += line('M51,28L48,22L40,8L42,0L38,-16', '#ffd091', 2, ' opacity=".8"');
  s += line('M56,138L54,178L40,220', '#ffd091', 2.6, ' opacity=".6"');
  return s;
}

// ---------------------------------------------------------------------------------------------
// Mia — seated, profile facing left, hunched over her drone with a screwdriver.
// ---------------------------------------------------------------------------------------------
function mia(p, part = 'body') {
  const H = { base: '#3cb4de', sh: '#1d6b98', hi: '#a6eeff', tip: '#7ff0ff' };
  const J = { base: '#3b404c', sh: '#23262e', hi: '#5c6372' };
  const T = { base: '#a3acbc', sh: '#5b6578', hi: '#e6ecf6' };
  let s = '';
  // far ear (behind the head)
  const ear = (x0, y0, k, fill) => {
    let e = path(S([[x0 - 16 * k, y0, 1], [x0 - 8 * k, y0 - 50 * k, 1], [x0 + 2 * k, y0 - 54 * k, 1], [x0 + 20 * k, y0 - 6 * k, 1]]), fill, ` stroke="#2b3240" stroke-width="2"`);
    e += path(S([[x0 - 9 * k, y0 - 6 * k, 1], [x0 - 4 * k, y0 - 40 * k, 1], [x0 + 10 * k, y0 - 8 * k, 1]]), '#1e2636');
    e += line(`M${x0 - 6 * k},${y0 - 10 * k}L${x0 - 2 * k},${y0 - 32 * k}M${x0 + 3 * k},${y0 - 12 * k}L${x0 + 1 * k},${y0 - 24 * k}`, PAL.mia, 1.3, ' opacity=".9"');
    e += line(`M${x0 - 16 * k},${y0}L${x0 - 8 * k},${y0 - 50 * k}L${x0 + 2 * k},${y0 - 54 * k}L${x0 + 20 * k},${y0 - 6 * k}`, PAL.mia, 2, ' opacity=".9"');
    e += line(`M${x0 - 3 * k},${y0 - 54 * k}L${x0 - 8 * k},${y0 - 74 * k}`, '#a9b3c4', 2) + `<circle cx="${x0 - 9 * k}" cy="${y0 - 77 * k}" r="3.4" fill="${PAL.mia}"/>`;
    e += line(`M${x0 - 15 * k},${y0 - 2}Q${x0 + 2 * k},${y0 + 3} ${x0 + 19 * k},${y0 - 6 * k}`, PAL.mia, 2.4, ' opacity=".9"');
    return e;
  };
  s += `<g transform="rotate(-10 0 40)">` + ear(36, -40, 1.12, T.sh) + `</g>`;
  // jacket body hunched toward the table
  s += path(S([[4, 56], [44, 66], [80, 112], [96, 190], [104, 300, 1], [-60, 300, 1], [-64, 220], [-50, 140], [-26, 76]]), J.base);
  s += path(S([[44, 66], [80, 112], [96, 190], [104, 300, 1], [64, 300, 1], [66, 190], [56, 110]]), J.sh);
  s += line('M-36,110L-46,160L-28,180L-34,250', PAL.mia, 2.2, ' opacity=".85"');
  s += line('M44,66Q80,112,96,190L104,300', PAL.mia, 3, ' opacity=".8"');
  // collar
  s += path(S([[-28, 58], [8, 48], [40, 62], [20, 86], [-18, 88]]), J.hi);
  // neck
  s += path(S([[-6, 34], [16, 40], [16, 62], [-6, 64]]), SKIN.sh);
  s += `<g transform="rotate(-10 0 40)">`;
  // head + profile facing left (soft cheek, small upturned nose)
  s += path(S([[-24, -40], [4, -56], [30, -46], [44, -16], [40, 18], [24, 42], [0, 50], [-20, 47], [-32, 38], [-34, 32], [-33, 27, 1], [-37, 24, 1], [-35, 19], [-37, 14, 1], [-43, 9, 1], [-38, 2], [-34, -8], [-35, -18], [-32, -32]]), SKIN.base, ` stroke="${SKIN.line}" stroke-width="1.5"`);
  s += path(S([[30, 8], [20, 34], [0, 46], [14, 26], [18, 8]]), SKIN.sh, ' opacity=".55"');
  // big cyan eye, lids lowered in concentration
  s += '<g transform="translate(5 0)">';
  s += path('M-35,-3Q-26,-8-16,-5L-17,6Q-26,9-33,5Z', '#ffffff');
  s += path('M-33,-2Q-26,-5-20,-3L-21,6Q-27,8-32,5Z', '#2aa6d8');
  s += path('M-31,0Q-27,-2-24,0L-25,5Q-28,6-31,4Z', '#0a3a5a');
  s += `<circle cx="-29" cy="0" r="1.5" fill="#ffffff"/><circle cx="-24" cy="4" r="1" fill="#bff3ff"/>`;
  s += path('M-37,-5Q-27,-11-14,-6L-15,-3Q-26,-7-35,-2Z', INK);
  s += line('M-37,-5l-3,0M-36,-3l-3,2', INK, 1.3);
  s += '</g>';
  s += line('M-37,-17Q-28,-21-18,-18', '#1d4a68', 2);
  s += `<circle cx="-42" cy="9" r="1.1" fill="#7a3f48"/>`;
  s += line('M-33,28Q-30,30-27,29', '#9a4a5a', 1.5) + path('M-31,29q2,3 4,0z', '#f08a9a');
  s += `<ellipse cx="-16" cy="18" rx="7" ry="3.2" fill="#f2a0a8" opacity=".5"/>`;
  // short self-cut layered hair, neon tips
  s += path(S([[-38, -20], [-36, -44], [-12, -62], [18, -62], [40, -46], [50, -18], [48, 12], [40, 32, 1], [34, 10], [28, 30, 1], [24, 6], [12, 16, 1], [14, -8], [0, -4, 1], [-6, -20], [-16, -8, 1], [-20, -22], [-30, -10, 1]]), H.base);
  s += path(S([[40, -46], [50, -18], [48, 12], [40, 32, 1], [34, 10], [28, 30, 1], [26, -10], [30, -36]]), H.sh);
  s += line('M40,32L34,10L28,30M24,6L12,16M-16,-8L-20,-22L-30,-10', H.tip, 2.2);
  s += line('M-24,-54Q2,-64,26,-56M-28,-38Q-18,-50-2,-54', H.hi, 2.4, ' opacity=".85"');
  // near ear on the crown
  s += ear(6, -46, 1.25, T.base);
  s += path(S([[-18, -50], [-10, -60, 1], [-2, -50], [6, -62, 1], [14, -50], [22, -58, 1], [28, -46], [4, -42]]), H.base);
  s += line('M-43,9L-38,2L-34,-8L-35,-18', PAL.mia, 2, ' opacity=".8"') + line('M40,-46Q52,-20,48,12', '#ffd091', 2, ' opacity=".5"');
  s += `</g>`;
  if (part === 'body') return s;
  s = '';
  // the drone "Zero" on the table (hatch open) with its cyan glow
  s += `<circle cx="-176" cy="228" r="70" fill="url(#${p}-droneGlow)"/>`;
  s += `<circle cx="-176" cy="230" r="30" fill="#2a3446" stroke="#0f141c" stroke-width="2"/><path d="M-206,230A30,30 0 0 1 -146,230" fill="#3d4b60"/>`;
  s += path('M-194,214l16,-16l18,8l-12,18z', '#55657e', ` stroke="#0f141c" stroke-width="1.5"`);
  s += `<circle cx="-188" cy="236" r="9" fill="${PAL.mia}"/><circle cx="-190" cy="234" r="3.4" fill="#ffffff"/>`;
  s += path('M-164,236h14v7h-14z', '#f4efe8', ' transform="rotate(10 -157 240)"') + line('M-206,230H-146', '#9fb3c4', 2);
  s += line('M-176,200V188M-190,190h28', '#9fb3c4', 2);
  // arms in long sleeves resting on the table; fingertips + screwdriver into the hatch
  s += path(S([[-20, 96], [-40, 170], [-30, 232], [-60, 252], [-120, 250], [-128, 232], [-70, 222], [-56, 160], [-44, 110]]), J.base, ` stroke="${J.sh}" stroke-width="2"`);
  s += path(S([[30, 110], [6, 190], [-30, 246], [-92, 266], [-98, 250], [-50, 228], [-24, 176], [-6, 120]]), J.hi, ` stroke="${J.sh}" stroke-width="2"`);
  s += path(S([[-126, 234], [-138, 232], [-142, 240], [-128, 246]]), SKIN.base, ` stroke="${SKIN.line}" stroke-width="1.1"`);
  s += path(S([[-96, 252], [-110, 250], [-114, 258], [-98, 264]]), SKIN.base, ` stroke="${SKIN.line}" stroke-width="1.1"`);
  s += path('M-138,234l-14,-10l3,-4l14,10z', PAL.miaOrange) + line('M-151,222L-168,212', '#d9dee8', 2);
  return s;
}

// ---------------------------------------------------------------------------------------------
export function campFire() {
  const p = 'campFire';
  const R = L.rng(1801);
  const ecl = L.eclipse(p, 1010, 222, 46, { bead: -140 });
  let defs = L.filters(p) + ecl.defs
    + L.linear(`${p}-wall`, [[0, '#0f171b'], [1, '#1a282d']])
    + L.radial(`${p}-lamp`, [[0, '#fff1d6', 0.95], [0.12, '#ffc670', 0.75], [0.4, '#ff9a4a', 0.3], [1, '#ff8a3c', 0]])
    + L.radial(`${p}-lampSmall`, [[0, '#ffe2b0', 0.9], [0.3, '#ffb45e', 0.4], [1, '#ff8a3c', 0]])
    + L.linear(`${p}-sky`, [[0, '#0a0820'], [1, '#2a1f52']])
    + L.linear(`${p}-cloth`, [[0, '#a8896a'], [0.4, '#6a5240'], [1, '#2e221a']])
    + L.radial(`${p}-clothTop`, [[0, '#f6e4c6'], [0.3, '#dcbf96'], [0.7, '#8e7052'], [1, '#4a382a']], 'gradientUnits="userSpaceOnUse" cx="690" cy="640" r="760"')
    + L.linear(`${p}-wood`, [[0, '#3a2216'], [1, '#1c0f08']])
    + L.linear(`${p}-curtain`, [[0, '#6a1a2c'], [0.5, '#4a1020'], [1, '#2a0812']], 'x1="0" y1="0" x2="1" y2="0"')
    + L.radial(`${p}-droneGlow`, [[0, PAL.mia, 0.65], [1, PAL.mia, 0]])
    + L.radial(`${p}-vig`, [[0.45, '#000', 0], [1, '#000', 0.82]], 'r="0.75"')
    + L.linear(`${p}-shade`, [[0, '#ffd27a'], [1, '#e0782c']])
    + L.linear(`${p}-tipFade`, [[0, '#efe9ff', 0], [1, '#efe9ff', 0.6]])
    + L.linear(`${p}-lock`, [[0, '#2b2050'], [0.78, '#2b2050'], [1, '#9a8ad0']])
    + L.linear(`${p}-bgCloth`, [[0, '#a88a6a'], [1, '#5a4434']])
    + L.radial(`${p}-pool`, [[0, '#fff3dc', 0.4], [0.6, '#ffd8a0', 0.12], [1, '#ffd8a0', 0]]);
  let s = '';
  // ---- back wall, ceiling, windows with curtains
  s += `<rect width="1600" height="900" fill="url(#${p}-wall)"/>`;
  s += `<rect width="1600" height="70" fill="#0e1619"/><path d="M0,70H1600" stroke="${PAL.brass}" stroke-width="4"/><path d="M0,80H1600" stroke="#0a1013" stroke-width="3"/>`;
  const wins = [[120, 300], [560, 760], [880, 1140], [1310, 1520]];
  for (const [x0, x1] of wins) {
    const r = (x1 - x0) / 2;
    s += `<path d="M${x0},470V${150 + r * 0.5}Q${x0},150 ${x0 + r},150Q${x1},150 ${x1},${150 + r * 0.5}V470Z" fill="url(#${p}-sky)" stroke="#6b4a26" stroke-width="10"/>`;
  }
  s += `<path d="M560,470V150H1140V470Z" fill="none"/>`;
  s += L.stars(R, 40, 130, 160, 1510, 460);
  s += ecl.body;
  s += `<path d="M560,430L620,410L690,428L760,404V470H560ZM880,420L960,398L1040,424L1140,400V470H880Z" fill="#120f26"/>`;
  for (const [x0, x1] of wins) {
    const r = (x1 - x0) / 2;
    s += `<path d="M${x0},470V${150 + r * 0.5}Q${x0},150 ${x0 + r},150Q${x1},150 ${x1},${150 + r * 0.5}V470" fill="none" stroke="${PAL.brass}" stroke-width="5"/>`;
    s += `<path d="M${x0 + r},150V470" stroke="#6b4a26" stroke-width="6"/>`;
  }
  // tied-back curtains
  for (const x of [536, 786, 856, 1166]) s += `<path d="M${x - 26},90Q${x},120 ${x + 26},90L${x + 20},300Q${x + 34},330 ${x + 16},360Q${x},480 ${x + 8},520H${x - 26}Q${x - 18},420 ${x - 30},330Z" fill="url(#${p}-curtain)"/>`;
  // wainscot
  s += `<rect y="470" width="1600" height="200" fill="url(#${p}-wood)"/><path d="M0,474H1600" stroke="${PAL.brass}" stroke-width="5"/>`;
  for (let x = 40; x < 1600; x += 160) s += `<rect x="${x}" y="500" width="120" height="140" fill="none" stroke="#5a3624" stroke-width="3"/>`;
  // background tables left & right with small lamps
  for (const [x, w] of [[200, 210], [1420, 200]]) {
    s += `<circle cx="${x}" cy="440" r="120" fill="url(#${p}-lampSmall)" opacity=".7"/>`;
    s += `<path d="M${x - w / 2},500H${x + w / 2}L${x + w / 2 + 12},520H${x - w / 2 - 12}Z" fill="#c9b08c"/><path d="M${x - w / 2 - 12},520H${x + w / 2 + 12}V600H${x - w / 2 - 12}Z" fill="url(#${p}-bgCloth)"/><path d="M${x - w / 2 - 12},520H${x + w / 2 + 12}" stroke="#f0e2c8" stroke-width="2"/>`;
    s += `<rect x="${x - 50}" y="600" width="100" height="70" fill="#1a1210"/>`;
    s += `<path d="M${x - 14},470h28l-6,28h-16z" fill="url(#${p}-shade)"/><rect x="${x - 3}" y="498" width="6" height="6" fill="${PAL.brass}"/>`;
  }
  // red emergency light over the far door (tension before the battle)

  // ---- the big lamp glow
  s += `<ellipse cx="690" cy="540" rx="780" ry="540" fill="url(#${p}-lamp)"/>`;
  // ---- characters behind the table
  let fg = '';
  fg += `<g transform="translate(830 300) scale(1.08)">${serena(p)}</g>`;
  fg += `<g transform="translate(1200 352) scale(1.12)">${mia(p, 'body')}</g>`;
  fg += `<g transform="translate(400 236) scale(1.1)">${lia(p)}</g>`;
  // ---- table: cloth top lit by the lamp + short front drape
  fg += `<path d="M250,600H1350L1450,760H150Z" fill="url(#${p}-clothTop)"/>`;
  fg += `<ellipse cx="690" cy="660" rx="560" ry="110" fill="url(#${p}-pool)"/>`;
  fg += `<path d="M150,760H1450L1462,900H138Z" fill="url(#${p}-cloth)"/>`;
  fg += `<path d="M150,760H1450" stroke="#fff6e6" stroke-width="3"/>`;
  fg += `<path d="M300,770Q306,840,296,900M600,770Q610,840,604,900M900,770Q906,840,904,900M1200,770Q1210,840,1214,900" stroke="#b08c6c" stroke-width="3" opacity=".5"/>`;
  fg += `<path d="M250,600H1350" stroke="#b8946a" stroke-width="2" opacity=".6"/>`;
  // map with the rail line
  fg += `<path d="M600,662L860,650L884,716L574,726Z" fill="#e9d6b0" stroke="#a5835a" stroke-width="1.5"/><path d="M606,700Q680,664,744,690T876,676" fill="none" stroke="#7a3a2a" stroke-width="2.2" stroke-dasharray="7 5"/><circle cx="744" cy="690" r="5" fill="#c13b4c"/><path d="M620,672l20,-2M630,712l26,-2" stroke="#a5835a" stroke-width="1.5"/>`;
  // teapot
  fg += `<g transform="translate(330 650)"><ellipse cx="0" cy="26" rx="44" ry="7" fill="#8a6a50" opacity=".35"/><path d="M-34,24Q-34,-8,0,-10Q34,-8,34,24Z" fill="#f4efe8" stroke="#b08a50" stroke-width="2"/><path d="M34,4Q54,-2,58,-16" fill="none" stroke="#f4efe8" stroke-width="6" stroke-linecap="round"/><path d="M-34,4Q-50,4-48,20" fill="none" stroke="#f4efe8" stroke-width="5"/><circle cx="0" cy="-12" r="6" fill="${PAL.brass}"/><path d="M-30,4H30" stroke="${PAL.brassHi}" stroke-width="2"/></g>`;
  // plate of moon-shaped pastries
  fg += `<g transform="translate(470 712)"><ellipse rx="62" ry="15" fill="#f6f1ea" stroke="#b08a50" stroke-width="2"/><ellipse rx="48" ry="10" fill="none" stroke="${PAL.brassHi}" stroke-width="1.5"/><path d="M-30,-2a14,10 0 1 1 22,-6a10,8 0 1 0 -22,6z" fill="#d9944a"/><path d="M2,-4a14,10 0 1 1 22,-6a10,8 0 1 0 -22,6z" fill="#c97f3a"/><path d="M-12,4a12,8 0 1 1 20,-5a9,7 0 1 0 -20,5z" fill="#e2a45c"/></g>`;
  // Lia's cup jumping from the knock (tea splash)
  fg += `<g transform="translate(600 604) rotate(-16)"><path d="M-15,0H15L12,23H-12Z" fill="#f4efe8" stroke="#b08a50" stroke-width="1.5"/><path d="M15,5Q24,8 20,17" fill="none" stroke="#f4efe8" stroke-width="2.5"/><ellipse cx="0" cy="0" rx="15" ry="3.5" fill="#b8763e"/></g>`;
  fg += `<path d="M586,596q-6,-12 2,-20M612,588q4,-10 12,-12M598,584q0,-8 6,-14" fill="none" stroke="#b8763e" stroke-width="3" stroke-linecap="round"/>`;
  fg += `<circle cx="580" cy="574" r="3" fill="#b8763e"/><circle cx="626" cy="570" r="2.5" fill="#b8763e"/>`;
  // impact under the pommel
  fg += `<path d="M512,580l-26,-8M510,588l-30,6M524,592l-10,20M540,582l28,-8M540,590l24,12" stroke="#fff3d6" stroke-width="2.5" stroke-linecap="round" opacity=".9"/>`;
  fg += `<ellipse cx="533" cy="586" rx="28" ry="6" fill="#7a5a40" opacity=".35"/>`;
  // the brass table lamp
  fg += `<g transform="translate(690 0)"><ellipse cx="0" cy="640" rx="40" ry="7" fill="#6b4a26" opacity=".4"/><path d="M-18,640h36l-4,-12h-28z" fill="#6b4a26"/><path d="M-4,628V560h8v68z" fill="${PAL.brass}"/>`;
  fg += `<path d="M-42,566L-30,508H30L42,566Z" fill="url(#${p}-shade)"/><path d="M-42,566H42" stroke="#fff1d6" stroke-width="2"/><path d="M-30,508H30" stroke="#8a4a1c" stroke-width="3"/>`;
  fg += `<ellipse cx="0" cy="570" rx="46" ry="8" fill="#fff4dc" opacity=".85"/></g>`;
  // Lia's spare gauntlet + Serena's saucer
  fg += `<g transform="translate(980 708) rotate(-8)"><path d="M-26,-6Q-10,-18,14,-12L28,0L14,12Q-10,16-26,6Z" fill="#c4c7de" stroke="#7a7c9c" stroke-width="1.5"/><path d="M-20,-4L18,-2M-18,4L16,6" stroke="#7a7c9c" stroke-width="1.2"/></g>`;
  fg += `<ellipse cx="840" cy="626" rx="34" ry="7" fill="#f6f1ea" stroke="#b08a50" stroke-width="1.5"/>`;
  // Mia's forearms + drone resting on the table, scattered parts
  fg += `<g transform="translate(1200 352) scale(1.12)">${mia(p, 'table')}</g>`;
  fg += `<g fill="#c9cfdb"><circle cx="1110" cy="690" r="3"/><circle cx="1126" cy="682" r="2.5"/><rect x="1136" y="694" width="18" height="4" rx="2"/></g><path d="M930,690l34,-6" stroke="${PAL.miaOrange}" stroke-width="4" stroke-linecap="round"/>`;
  s += `<g transform="translate(800 560) scale(1.1) translate(-800 -560)">${fg}</g>`;
  s += `<ellipse cx="680" cy="560" rx="620" ry="420" fill="url(#${p}-lamp)" opacity=".22"/>`;
  s += `<circle cx="680" cy="560" r="120" fill="url(#${p}-lamp)" opacity=".5"/>`;
  // ---- foreground: the captain's shoulder (over-the-shoulder framing)
  s += `<path d="M-80,900Q-70,790 -10,740Q20,640 110,630Q190,628 214,700Q290,740 310,900Z" fill="#0f0c18"/>`;
  s += `<path d="M-10,740Q20,640 110,630Q190,628 214,700Q290,740 310,900" fill="none" stroke="#ffb45e" stroke-width="4" opacity=".55"/>`;
  s += `<path d="M40,690Q90,700 120,760M214,700Q170,720 150,800" fill="none" stroke="#231d30" stroke-width="6"/>`;
  s += `<rect width="1600" height="900" fill="url(#${p}-vig)"/>`;
  return L.svgDoc(p, '战前餐车', defs, s);
}
