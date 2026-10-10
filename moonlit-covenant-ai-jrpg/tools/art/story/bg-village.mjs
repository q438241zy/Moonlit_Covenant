// 赫麦村 daytime / evening backgrounds: hemai-day, pasture, village-road, kitchen-night.
import { Scene, W, H, f, pz, pl, shape, cloud, cloudCluster, wheatEar, ridge, rays, stars, fbm, noise1, tree, pine, fence, sheep, windmill, waterWheel, house, smoke, star7, rock, mix, band, persp, bird } from './lib.mjs';
import { village, VILLAGE_PAL, streetRows } from './village.mjs';
import { bellTower } from './lib.mjs';

const r0 = (v) => f(v, 0);

// ---------------------------------------------------------------------------------------------
// 赫麦村·午后 — aerial view: golden wheat island, village on a gentle slope, windmill, water wheel
// ---------------------------------------------------------------------------------------------
function hemaiDay() {
  const S = new Scene('sbHemaiDay', '赫麦村·午后：金色麦田托起的山坡小村', 1101);
  const R = S.R;
  const SUN = [318, 128];
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#6a96c4'], [0.28, '#a6bfd0'], [0.48, '#ead9b0'], [0.6, '#f7e1aa']])}"/>`);
  S.add(`<circle cx="${SUN[0]}" cy="${SUN[1]}" r="700" fill="${S.rad([[0, '#fff7da', 0.95], [0.1, '#ffe8a8', 0.72], [0.38, '#ffd98a', 0.24], [1, '#ffd98a', 0]])}"/>`);
  // sun disc sits behind the cloud gap; rays fan across the valley
  S.add(`<circle cx="${SUN[0]}" cy="${SUN[1]}" r="52" fill="#fffbea" filter="${S.blur(2)}"/><circle cx="${SUN[0]}" cy="${SUN[1]}" r="31" fill="#fffef6"/>`);
  S.add(`<g filter="${S.blur(3)}">${rays(SUN[0], SUN[1], [[20, 6, 1600], [31, 4, 1600], [42, 7, 1500], [55, 4, 1300], [10, 3, 1600]], '#fff1c4', 0.2)}</g>`);
  const cc = { lit: '#fff7e6', shade: '#e2cfc6', rim: '#ffffff' };
  const ccFar = { lit: '#f8ead0', shade: '#dccdc6', rim: null };
  S.add(`<g opacity=".7">${cloud(R, 930, 262, 240, 40, ccFar, { bumps: 5 })}${cloud(R, 1330, 232, 200, 34, ccFar, { bumps: 5 })}${cloud(R, 610, 300, 150, 26, ccFar, { bumps: 4 })}</g>`);
  S.add(cloudCluster(R, 70, 250, 380, 118, cc, { bumps: 6 }));
  S.add(cloudCluster(R, 1110, 168, 330, 92, cc, { bumps: 6 }));
  S.add(cloud(R, 420, 92, 190, 40, cc, { bumps: 5 }));
  // far mountains (north range) — hazy lavender
  const m1 = ridge(S, { step: 14, base: 405, amp: 34, period: 240, seed: 11, fill: '#a9b0c8', shade: '#8a90b0', shadeOp: 0.5, rim: '#f4ead8', rimOp: 0.7, peaks: [[200, 60, 220], [1350, 80, 260], [760, 30, 200]] });
  S.add(m1.svg);
  const m2 = ridge(S, { step: 14, base: 440, amp: 22, period: 180, seed: 12, fill: '#9cab9a', shade: '#7f8f86', shadeOp: 0.5, rim: '#efe6c8', rimOp: 0.6, peaks: [[1180, 40, 200], [120, 30, 260]] });
  S.add(m2.svg);
  S.add(`<rect y="380" width="${W}" height="100" fill="${S.lin([[0, '#f6e4b8', 0], [0.6, '#f6e4b8', 0.45], [1, '#f6e4b8', 0]])}"/>`);
  // rolling field hills with patchwork
  const nH = fbm(31, 300, 3);
  const hill = (base, amp, seed) => { const n = fbm(seed, 340, 3); const pts = []; for (let x = -20; x <= W + 20; x += 20) pts.push([x, base - amp * n(x) - 34 * Math.exp(-(((x - 800) / 380) ** 2))]); return pts; };
  const h1 = hill(470, 18, 41);
  S.add(`<path d="${pz([...h1, [W + 20, H], [-20, H]])}" fill="${S.lin([[0, '#b8b468'], [0.35, '#d7b35a'], [1, '#a77d3a']])}"/>`);
  // patchwork field strips following the land
  const strips = [
    [488, 516, '#e3c063', 0.9], [520, 548, '#c9b25e', 0.9], [552, 590, '#e8c46a', 0.9], [470, 490, '#b9b56a', 0.7],
  ];
  for (const [ya, yb, c, op] of strips) {
    const top = [], bot = [];
    for (let x = -20; x <= W + 20; x += 40) { top.push([x, ya + nH(x) * 10 - 16 * Math.exp(-(((x - 800) / 380) ** 2))]); bot.unshift([x, yb + nH(x + 90) * 10 - 10 * Math.exp(-(((x - 800) / 380) ** 2))]); }
    S.add(`<path d="${shape([...top, ...bot], true, 0)}" fill="${c}" opacity="${op}"/>`);
  }
  // hedgerows / field boundaries
  let hedge = '';
  for (const [x0, y0, x1, y1] of [[120, 520, 420, 470], [1150, 470, 1500, 520], [380, 560, 640, 500], [1000, 500, 1300, 560], [-20, 590, 300, 540], [1340, 545, 1620, 600]]) {
    hedge += `M${x0},${y0}Q${(x0 + x1) / 2},${Math.min(y0, y1) - 10} ${x1},${y1}`;
  }
  S.add(`<path d="${hedge}" fill="none" stroke="#7a7a3e" stroke-width="5" stroke-linecap="round" opacity=".55"/>`);
  // pasture (left): greener meadow with a low fence and grazing sheep
  S.add(`<path d="M120,560C180,520,330,500,470,512C520,540,500,580,420,596C320,610,180,606,120,560Z" fill="#a9b562"/>`);
  S.add(`<path d="M150,566C210,540,320,526,430,532" fill="none" stroke="#c4cc78" stroke-width="6" opacity=".7"/>`);
  S.add(fence([[140, 566], [190, 548], [250, 534], [310, 526], [370, 522], [430, 526], [478, 538]], 0.55, '#6e4a30', '#e8c890'));
  const sp = { wool: '#fbf6ea', woolShade: '#d8ccbc', dark: '#3e3230' };
  for (const [x, y, d] of [[220, 574, 1], [262, 584, -1], [318, 570, 1], [356, 590, 1], [400, 566, -1], [292, 596, 1]]) S.add(sheep(x, y, 0.42, sp, d));
  // stream from the hills down past the water wheel
  S.add(`<path d="M300,470C380,490,470,500,540,520C600,540,610,580,560,620" fill="none" stroke="#8fb4c8" stroke-width="9" stroke-linecap="round"/>`);
  S.add(`<path d="M300,470C380,490,470,500,540,520C600,540,610,580,560,620" fill="none" stroke="#e8f2f4" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`);
  // trees around the village edges
  const tp = { lit: '#a6ad5a', shade: '#5f7040', trunk: '#4a3628' };
  const tpFar = { lit: '#9aa46a', shade: '#6a7a52', trunk: '#4a3a30' };
  for (const [x, y, s] of [[470, 452, 0.55], [500, 458, 0.48], [1110, 446, 0.55], [1140, 452, 0.5], [640, 412, 0.42], [990, 418, 0.4], [1040, 430, 0.45], [560, 430, 0.46]]) S.add(tree(R, x, y, s, tpFar));
  // village on the slope
  const V = village(S, 812, 478, 1, 'day', { rim: '#fff0c8' });
  // road winding into the village
  S.add(`<path d="M640,900C700,800,820,690,890,610C916,580,912,556,890,540L912,538C948,560,950,590,926,620C870,700,820,800,860,900Z" fill="#c8a066"/>`);
  S.add(`<path d="M700,900C750,800,850,700,906,620" fill="none" stroke="#e8cc94" stroke-width="5" stroke-linecap="round" opacity=".6"/>`);
  S.add(`<path d="${V.shadows}" fill="#6a4a20" opacity=".28"/>`);
  S.add(V.svg);
  S.add(`<path d="${V.smokes}" fill="${VILLAGE_PAL.day.smoke}" opacity=".4" filter="${S.blur(2)}"/>`);
  for (const [x, y, s] of [[420, 520, 0.7], [1210, 520, 0.65], [1250, 528, 0.7], [380, 528, 0.6], [690, 560, 0.6], [1010, 566, 0.62]]) S.add(tree(R, x, y, s, tp));
  // windmill on its knoll (right) — the sun will sink behind it later in the day
  S.add(`<path d="M1180,470C1220,420,1320,410,1380,452C1350,476,1220,482,1180,470Z" fill="#c9ac5a"/>`);
  S.add(windmill(1290, 448, 0.95, 18, { lit: '#efe2c8', shade: '#b4a088', door: '#5a4030', roof: '#9a4e36', sail: '#f6eedc', frame: '#5a4232' }));
  // water wheel by the mill house on the stream
  S.add(house(570, 548, 46, 30, { side: 'l', pal: VILLAGE_PAL.day.thatch }).svg);
  S.add(waterWheel(548, 540, 22, { frame: '#5a3e2a', hub: '#3a2a20' }, 10));
  // foreground wheat (calm, darkening toward the bottom for the dialogue box)
  const fg = [];
  for (let x = -20; x <= W + 20; x += 20) fg.push([x, 640 + nH(x * 0.7) * 16 + 30 * ((x - 800) / 800) ** 2]);
  S.add(`<path d="${pz([...fg, [W + 20, H], [-20, H]])}" fill="${S.lin([[0, '#e2b85c'], [0.4, '#b98a3e'], [1, '#5a3e22']])}"/>`);
  // wheat ripples: wind lines across the near field
  let rip = '';
  for (let i = 0; i < 26; i++) {
    const x = R.range(-40, W), y = R.range(660, 800), l = R.range(80, 220);
    rip += `M${r0(x)},${r0(y)}q${r0(l / 2)},${r0(-8)} ${r0(l)},0`;
  }
  S.add(`<path d="${rip}" fill="none" stroke="#f6d88a" stroke-width="3" stroke-linecap="round" opacity=".35"/>`);
  // drifting cloud shadows on the fields
  S.add(`<g fill="#5a3a18" opacity=".16" filter="${S.blur(3)}"><ellipse cx="1260" cy="700" rx="420" ry="70"/><ellipse cx="260" cy="760" rx="360" ry="60"/></g>`);
  // out-of-focus wheat ears at the bottom corners
  let ears = '';
  for (let i = 0; i < 18; i++) {
    const side = i % 2, x = side ? R.range(1330, 1640) : R.range(-40, 270), y = R.range(880, 960), h = R.range(110, 190), lean = (side ? -1 : 1) * R.range(10, 40);
    ears += wheatEar(x, y, h, lean);
  }
  S.add(`<path d="${ears}" fill="none" stroke="#4e3418" stroke-width="5" stroke-linecap="round" opacity=".75" filter="${S.blur(1)}"/>`);
  // light haze + vignette + bottom calm
  // warm key light from the upper left, cooler shade toward the lower right
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#ffe9b0', 0.18], [0.5, '#ffe9b0', 0], [1, '#3a2a40', 0.22]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.55, '#2a1e10', 0], [1, '#2a1e10', 0.45]], 'cx="0.5" cy="0.42" r="0.78"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#2a1a0e', 0], [1, '#2a1a0e', 0.55]])}"/>`);
  return S.out();
}


// ---------------------------------------------------------------------------------------------
// 牧场羊圈 — late afternoon: the sun is about to sink behind the windmill; pen, trough, sheep, barn
// ---------------------------------------------------------------------------------------------
function pasture() {
  const S = new Scene('sbPasture', '牧场羊圈：夕阳将落到风车后面', 1202);
  const R = S.R;
  const SUN = [640, 318];
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#7f9cc0'], [0.25, '#c4bcc0'], [0.42, '#f2cf98'], [0.52, '#ffdca4']])}"/>`);
  S.add(`<circle cx="${SUN[0]}" cy="${SUN[1]}" r="760" fill="${S.rad([[0, '#fff3cc', 1], [0.08, '#ffe2a0', 0.85], [0.3, '#ffc878', 0.3], [1, '#ffc878', 0]])}"/>`);
  S.add(`<circle cx="${SUN[0]}" cy="${SUN[1]}" r="58" fill="#fff6d8" filter="${S.blur(2)}"/><circle cx="${SUN[0]}" cy="${SUN[1]}" r="36" fill="#fffdf2"/>`);
  const cc = { lit: '#ffeccc', shade: '#d9b4ae', rim: '#fff8ea' };
  S.add(`<g opacity=".85">${cloud(R, 920, 168, 300, 56, cc, { bumps: 6 })}${cloud(R, 1290, 230, 230, 40, cc, { bumps: 5 })}${cloud(R, 120, 150, 260, 50, cc, { bumps: 5 })}</g>`);
  S.add(`<path d="${band(260, 1100, 250, 14, R)}" fill="#ffe6c0" opacity=".55"/>`);
  S.add(`<g filter="${S.blur(3)}">${rays(SUN[0], SUN[1], [[12, 5, 1300], [24, 4, 1300], [38, 6, 1200], [150, 5, 1000], [165, 4, 900], [60, 4, 900]], '#fff0c0', 0.2)}</g>`);
  // far hills (hazy) + windmill knoll right under the sun
  S.add(ridge(S, { step: 14, base: 420, amp: 20, period: 260, seed: 21, fill: '#c9b8a8', shade: '#a898a0', shadeOp: 0.4, rim: '#fff0d0', rimOp: 0.7, peaks: [[1300, 40, 300], [150, 30, 260]] }).svg);
  S.add(`<path d="M380,470C470,420,580,392,680,398C790,404,880,440,960,476Z" fill="#b39c6c"/>`);
  S.add(`<path d="M380,470C470,420,580,392,680,398" fill="none" stroke="#ffe6a8" stroke-width="3" opacity=".8"/>`);
  // the windmill, backlit by the low sun (darker body, warm rim)
  S.add(windmill(690, 410, 1.05, 32, { lit: '#c9ae8e', shade: '#8a7466', door: '#4a3a32', roof: '#7a4636', sail: '#f2e2c6', frame: '#5a4636' }));
  // village roofs on the right, beyond the meadow
  const vp = VILLAGE_PAL.day;
  for (const [x, y, w, side, kind] of [[1060, 470, 44, 'r', 'tile'], [1120, 474, 50, 'r', 'thatch'], [1190, 468, 40, 'r', 'tile'], [1250, 478, 56, 'l', 'tile'], [1340, 472, 46, 'l', 'thatch'], [1410, 480, 52, 'l', 'tile'], [1490, 474, 44, 'l', 'tile'], [990, 478, 40, 'r', 'thatch']]) {
    S.add(house(x, y, w, w * 0.6, { side, pal: vp[kind], rim: '#fff0c8' }).svg);
  }
  const tpFar = { lit: '#b4ae68', shade: '#6e7448', trunk: '#4a3a30' };
  for (const [x, y, s] of [[960, 484, 0.6], [1570, 484, 0.7], [330, 470, 0.6], [290, 476, 0.7], [1210, 486, 0.5]]) S.add(tree(R, x, y, s, tpFar));
  // meadow
  const n = fbm(51, 300, 3);
  const mead = [];
  for (let x = -20; x <= W + 20; x += 40) mead.push([x, 476 + n(x) * 8]);
  S.add(`<path d="${pz([...mead, [W + 20, H], [-20, H]])}" fill="${S.lin([[0, '#c2b45e'], [0.25, '#a3a24e'], [0.6, '#7d7e3a'], [1, '#3e3a20']])}"/>`);
  // long warm light streaks across the grass
  S.add(`<g fill="#ffe6a0" opacity=".16" filter="${S.blur(2)}"><path d="M0,520L1600,540L1600,560L0,548Z"/><path d="M0,600L1600,630L1600,650L0,626Z"/></g>`);
  // the barn (sheep shed) on the right
  const bp = { lit: '#c99a68', mid: '#a87850', shade: '#6a4634', roof: '#9a5a3c', roofShade: '#5e3428', trim: '#3e2620', win: '#2a1c1a', door: '#2a1c1a', chimney: '#7a5a4a' };
  S.add(house(1180, 610, 220, 150, { side: 'r', d: 260, roofH: 110, pal: bp, planks: true, windows: 0, door: false, rim: '#ffe0a8' }).svg);
  // open barn door with hay inside
  S.add(`<path d="M1236,610V500H1344V610Z" fill="#2a1c18"/><path d="M1240,610C1250,570,1290,560,1340,566V610Z" fill="#c9a050"/><path d="M1250,604C1270,584,1300,578,1336,580" fill="none" stroke="#f0d080" stroke-width="3" opacity=".7"/>`);
  S.add(`<path d="M1236,500H1344M1290,500V610" stroke="#3e2620" stroke-width="5"/>`);
  // hay bales stacked by the barn
  for (const [x, y, w, h] of [[1120, 612, 70, 40], [1060, 616, 64, 36], [1092, 578, 64, 36]]) {
    S.add(`<rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="6" fill="#d8b058"/><rect x="${x + w * 0.62}" y="${y - h}" width="${w * 0.38}" height="${h}" rx="6" fill="#a8823e"/><path d="M${x + 4},${y - h + 6}h${w - 10}M${x + 4},${y - h / 2}h${w - 10}" stroke="#8a6630" stroke-width="2" opacity=".7"/>`);
  }
  // pen ground: trampled earth with straw
  S.add(`<path d="M190,566C420,546,820,552,1170,570C1230,620,1240,680,1180,708C900,722,420,722,140,708C100,660,130,600,190,566Z" fill="#8a7448" opacity=".5" filter="${S.blur(2)}"/>`);
  let straw = '';
  for (let i = 0; i < 70; i++) { const x = R.range(200, 1200), y = R.range(570, 690), a = R.range(-0.6, 0.6), l = R.range(8, 18); straw += `M${r0(x)},${r0(y)}l${r0(Math.cos(a) * l)},${r0(Math.sin(a) * l)}`; }
  S.add(`<path d="${straw}" stroke="#e8c870" stroke-width="2" opacity=".6"/>`);
  // back fence of the pen (sheep poking heads over the rails)
  const sp = { wool: '#fbf4e4', woolShade: '#d8c4a8', dark: '#3a2c28' };
  S.add(fence([[160, 566], [260, 560], [360, 556], [460, 553], [560, 552], [660, 552], [760, 553], [860, 555], [960, 558], [1060, 562], [1160, 568]], 1.1, '#5e3e28', '#ffe2a6'));
  for (const [x, y, d, s] of [[470, 588, 1, 1.6], [1010, 590, -1, 1.6], [600, 578, 1, 1.35], [380, 610, -1, 1.9]]) S.add(sheep(x, y, s, sp, d));
  // feeding trough (centre) with fresh alfalfa
  S.add(`<path d="M680,586L940,586L926,622L694,622Z" fill="#7a5232"/><path d="M680,586L940,586L936,596L684,596Z" fill="#a8764a"/><path d="M700,622v14M920,622v14" stroke="#4a3022" stroke-width="7"/>`);
  S.add(`<path d="M690,588C720,570,760,566,800,574C840,562,880,566,930,588Z" fill="#8fb24e"/><path d="M700,586C740,574,780,572,820,578" fill="none" stroke="#c4dc78" stroke-width="3"/>`);
  for (const [x, y, d, s] of [[640, 650, 1, 2.3], [990, 654, -1, 2.4], [1110, 640, -1, 2.0], [470, 664, 1, 2.5]]) S.add(sheep(x, y, s, sp, d));
  // the pen gate on the left (Erin's spot), with a water bucket and empty sacks
  S.add(`<path d="M170,640V520M250,640V520" stroke="#4e3220" stroke-width="12" stroke-linecap="round"/><path d="M178,540L244,540M178,600L244,600M178,600L244,540" stroke="#7a5236" stroke-width="7"/><path d="M168,520v116" stroke="#ffe2a6" stroke-width="2" opacity=".7"/>`);
  S.add(`<path d="M282,640L288,598H324L330,640Z" fill="#6a4a30"/><ellipse cx="306" cy="598" rx="18" ry="5" fill="#8fb4c8"/><path d="M286,612h42M284,628h46" stroke="#3e2a1e" stroke-width="3"/>`);
  S.add(`<path d="M80,646C76,610,92,596,110,600C126,594,140,612,134,646Z" fill="#b89a6c"/><path d="M110,600C116,620,118,636,116,646" fill="none" stroke="#7a6040" stroke-width="2"/>`);
  // foreground grass (dark, calm) — the dialogue box sits here
  let tuft = '';
  for (let i = 0; i < 120; i++) {
    const x = R.range(-20, W + 20), y = R.range(712, 920), h = R.range(10, 30) * (y / 760);
    tuft += `M${r0(x - 5)},${r0(y)}q2,${r0(-h * 0.6)} ${r0(R.range(-6, 6))},${r0(-h)}q2,${r0(h * 0.5)} 6,${r0(h)}z`;
  }
  S.add(`<path d="${tuft}" fill="#3a3a1c" opacity=".55"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#ffe2a8', 0.12], [0.5, '#ffe2a8', 0], [1, '#3a2440', 0.25]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.55, '#24160c', 0], [1, '#24160c', 0.5]], 'cx="0.45" cy="0.4" r="0.8"')}"/>`);
  S.add(`<rect y="620" width="${W}" height="280" fill="${S.lin([[0, '#1e140a', 0], [1, '#1e140a', 0.6]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 赫麦村村道·傍晚 — the main road home at dusk: bakery window, smithy forge, the well, bell tower at
// the end of the street; crows fleeing north and a vast shadow behind the southern cloud bank.
// ---------------------------------------------------------------------------------------------
function villageRoad() {
  const S = new Scene('sbRoad', '赫麦村村道·傍晚：乌鸦北飞，南方云后掠过巨影', 1303);
  const R = S.R;
  const pr = persp({ vp: [800, 486], F: 900, eye: 1.7 });
  const HZ = 486;
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#2e2a52'], [0.22, '#5a4270'], [0.42, '#b8687a'], [0.54, '#ee9a64'], [0.6, '#f6bc78']])}"/>`);
  // the sun has just gone down behind the left roofs
  S.add(`<circle cx="260" cy="${HZ}" r="760" fill="${S.rad([[0, '#ffd59a', 0.9], [0.18, '#ffaa70', 0.5], [0.5, '#e07a6a', 0.15], [1, '#e07a6a', 0]])}"/>`);
  S.add(stars(R, 26, [0, 0, W, 150], { maxR: 1.2, op: [0.2, 0.6] }));
  // southern cloud bank (right) — heavy, bruised, with a vast wing-shaped shadow sliding behind it
  const cs = { lit: '#c57a7e', shade: '#4e3456', rim: '#ffb08a' };
  S.add(`<g opacity=".95">${cloud(R, 900, 250, 420, 70, cs, { bumps: 6 })}${cloud(R, 1230, 210, 420, 96, cs, { bumps: 7 })}</g>`);
  S.add(`<path d="M1010,206C1100,150,1220,130,1330,146L1460,96L1420,160C1500,170,1560,150,1610,130V250C1500,236,1340,250,1200,240C1120,236,1060,226,1010,206Z" fill="#1a1230" opacity=".55" filter="${S.blur(2)}"/>`);
  S.add(`<g opacity=".95">${cloud(R, 1080, 300, 540, 70, { lit: '#a8607a', shade: '#3a2848', rim: '#f0a080' }, { bumps: 8 })}</g>`);
  S.add(`<path d="${band(140, 900, 300, 12, R)}" fill="#f6b08a" opacity=".55"/><path d="${band(300, 760, 340, 8, R)}" fill="#ffd0a0" opacity=".5"/>`);
  // crows fleeing north (to the left), silent
  let crows = '';
  for (let i = 0; i < 26; i++) {
    const t = i / 26;
    const x = 1360 - t * 900 + R.range(-60, 60), y = 150 + Math.sin(t * 5) * 30 + R.range(-40, 40) - t * 20;
    crows += bird(x, y, R.range(0.6, 1.1) * (1.2 - t * 0.5), R());
  }
  S.add(`<path d="${crows}" fill="#1e1428"/>`);
  // distant hills + fields at the end of the road
  S.add(ridge(S, { step: 14, base: HZ - 8, amp: 14, period: 220, seed: 61, fill: '#6a4a6e', shade: '#4a3456', shadeOp: 0.5, rim: '#ffc090', rimOp: 0.6, peaks: [[620, 26, 220], [1100, 30, 260]] }).svg);
  S.add(`<rect y="${HZ - 2}" width="${W}" height="60" fill="#5a3e52"/>`);
  // the bell tower and prayer hall at the end of the street
  const vd = VILLAGE_PAL.dusk;
  const tw = pr(-0.6, 0, 60), tw2 = pr(2.4, 18, 60);
  const bt = bellTower(tw[0], tw[1], tw2[0] - tw[0], tw[1] - tw2[1], { ...vd.stone, lit: '#c48a86', shade: '#6a4a62' }, { side: 'r' });
  S.add(house(pr(-7, 0, 62)[0], pr(-7, 0, 62)[1], pr(-1, 0, 62)[0] - pr(-7, 0, 62)[0], (pr(0, 0, 62)[1] - pr(0, 4.5, 62)[1]), { side: 'l', d: 30, roofH: 50, pal: { ...vd.stone, lit: '#a87a80', mid: '#8a6070' }, windows: 0, door: false, rim: '#ffc090' }).svg);
  S.add(bt.svg);
  // houses lining both sides of the street (ridge parallel to the road)
  S.add(streetRows(S, pr, R, 'dusk').svg);
  // bakery (left, near): warm display window with loaves, bread-shaped hanging sign
  {
    const z0 = 8.3, z1 = 10.1, x = -4.4;
    S.add(`<path d="${pr.quad([[x, 1.05, z0], [x, 2.2, z0], [x, 2.2, z1], [x, 1.05, z1]])}" fill="#ffcf86"/>`);
    S.add(`<path d="${pr.quad([[x, 1.05, z0], [x, 1.25, z0], [x, 1.25, z1], [x, 1.05, z1]])}" fill="#7a4630"/><path d="${pl(pr.poly([[x, 1.05, (z0 + z1) / 2], [x, 2.2, (z0 + z1) / 2]]))}${pl(pr.poly([[x, 1.7, z0], [x, 1.7, z1]]))}" stroke="#6a3a2a" stroke-width="5"/>`);
    let loaves = '';
    for (let i = 0; i < 3; i++) { const z = z0 + 0.15 + i * 0.55; const a = pr(x, 1.25, z), b = pr(x, 1.25, z + 0.42), c = pr(x, 1.5, z + 0.21); loaves += `M${r0(a[0])},${r0(a[1])}Q${r0(c[0])},${r0(c[1] - 18)} ${r0(b[0])},${r0(b[1])}Z`; }
    S.add(`<path d="${loaves}" fill="#b8642e"/>`);
    const wl = pr(x, 1.7, z0);
    S.add(`<circle cx="${r0(wl[0] + 60)}" cy="${r0(wl[1])}" r="230" fill="${S.rad([[0, '#ffc070', 0.35], [1, '#ffc070', 0]])}"/>`);
    const br = pr(x, 2.9, 10.2), bt2 = pr(x + 1.1, 2.9, 10.2);
    S.add(`<path d="M${r0(br[0])},${r0(br[1])}L${r0(bt2[0])},${r0(bt2[1])}" stroke="#2a1a1e" stroke-width="5"/>`);
    S.add(`<ellipse cx="${r0(bt2[0] - 10)}" cy="${r0(bt2[1] + 34)}" rx="34" ry="18" fill="#c27a3a" stroke="#3a2420" stroke-width="4"/><path d="M${r0(bt2[0] - 30)},${r0(bt2[1] + 30)}l12,-8M${r0(bt2[0] - 14)},${r0(bt2[1] + 30)}l12,-8M${r0(bt2[0] + 2)},${r0(bt2[1] + 30)}l10,-7" stroke="#7a4220" stroke-width="3"/><path d="M${r0(bt2[0] - 22)},${r0(bt2[1])}v16M${r0(bt2[0] + 2)},${r0(bt2[1])}v16" stroke="#2a1a1e" stroke-width="2"/>`);
  }
  // smithy (right, near): open shed, banked forge glowing, anvil + hanging tools
  {
    const z0 = 7.2, z1 = 10.8, x = 4.4;
    S.add(`<path d="${pr.quad([[x, 0, z0], [x, 2.7, z0], [x, 2.7, z1], [x, 0, z1]])}" fill="#1e1218"/>`);
    const fg = pr(x + 1.6, 0.9, 9.6);
    S.add(`<circle cx="${r0(fg[0])}" cy="${r0(fg[1])}" r="190" fill="${S.rad([[0, '#ff9a4a', 0.75], [0.3, '#e0502a', 0.35], [1, '#e0502a', 0]])}"/>`);
    S.add(`<path d="${pr.quad([[x + 1.2, 0, 9.2], [x + 1.2, 0.95, 9.2], [x + 1.2, 0.95, 10.3], [x + 1.2, 0, 10.3]])}" fill="#3a2226"/><path d="${pr.quad([[x + 1.2, 0.95, 9.3], [x + 1.2, 1.1, 9.5], [x + 1.2, 1.1, 10.1], [x + 1.2, 0.95, 10.25]])}" fill="#ffb060"/>`);
    const av = pr(x - 0.6, 0.75, 8.2);
    S.add(`<path d="M${r0(av[0] - 40)},${r0(av[1])}h70q-6,14 -22,16v30h22v10h-66v-10h20v-30q-18,-4 -24,-16z" fill="#120c12"/>`);
    let tools = '';
    for (let i = 0; i < 4; i++) { const a = pr(x, 2.5, z0 + 0.6 + i * 0.6), b = pr(x, 1.8, z0 + 0.6 + i * 0.6); tools += `M${r0(a[0])},${r0(a[1])}L${r0(b[0])},${r0(b[1])}`; }
    S.add(`<path d="${tools}" stroke="#2a1a1e" stroke-width="5"/>`);
    // shed roof edge
    S.add(`<path d="${pr.quad([[x - 1, 2.75, z0 - 0.4], [x + 1.2, 3.4, z0 - 0.4], [x + 1.2, 3.4, z1 + 0.3], [x - 1, 2.75, z1 + 0.3]])}" fill="#7a3a34"/>`);
  }
  // the road (dusty, wheel ruts) and verges
  S.add(`<path d="${pr.quad([[-4.4, 0, 3], [-4.4, 0, 80], [4.4, 0, 80], [4.4, 0, 3]])}" fill="${S.lin([[0, '#8a6060'], [0.15, '#a8706a'], [1, '#3a2632']], `gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="${H}"`)}"/>`);
  let ruts = '';
  for (const X of [-1.1, -0.5, 0.6, 1.2]) ruts += pl(pr.poly([[X, 0, 3.4], [X * 0.9 + 0.05, 0, 60]]));
  S.add(`<path d="${ruts}" stroke="#5a3a44" stroke-width="5" opacity=".5"/>`);
  S.add(`<path d="${pl(pr.poly([[-0.2, 0, 3.2], [-0.1, 0, 60]]))}" stroke="#ffc890" stroke-width="7" opacity=".14"/>`);
  // the village well in the little square
  {
    const b = pr(1.3, 0, 22), k = 900 / 22;
    const x = b[0], y = b[1], rw = 0.85 * k;
    S.add(`<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${r0(rw * 1.4)}" ry="${r0(rw * 0.3)}" fill="#2a1a26" opacity=".45"/>`);
    S.add(`<path d="M${r0(x - rw)},${r0(y)}v${r0(-0.8 * k)}a${r0(rw)},${r0(rw * 0.28)} 0 0 1 ${r0(rw * 2)},0v${r0(0.8 * k)}a${r0(rw)},${r0(rw * 0.28)} 0 0 1 ${r0(-rw * 2)},0Z" fill="#8a6a7a"/><ellipse cx="${r0(x)}" cy="${r0(y - 0.8 * k)}" rx="${r0(rw)}" ry="${r0(rw * 0.28)}" fill="#3a2838"/>`);
    S.add(`<path d="M${r0(x - rw * 0.9)},${r0(y - 0.8 * k)}v${r0(-1.3 * k)}M${r0(x + rw * 0.9)},${r0(y - 0.8 * k)}v${r0(-1.3 * k)}" stroke="#3a2430" stroke-width="5"/><path d="M${r0(x - rw * 1.2)},${r0(y - 2 * k)}L${r0(x)},${r0(y - 2.6 * k)}L${r0(x + rw * 1.2)},${r0(y - 2 * k)}Z" fill="#7a3a3e"/><path d="M${r0(x - rw * 1.2)},${r0(y - 2 * k)}L${r0(x)},${r0(y - 2.6 * k)}" stroke="#ffc090" stroke-width="2" opacity=".7"/>`);
  }
  // long dusk shadows across the road from the right-hand houses, cool ambient on the left
  S.add(`<path d="${pr.quad([[4.4, 0, 3], [-2.5, 0, 3], [-1.2, 0, 14], [4.4, 0, 14]])}" fill="#2a1a36" opacity=".3" filter="${S.blur(3)}"/>`);
  // sparks drifting up from the smithy
  let sparks = '';
  for (let i = 0; i < 16; i++) { const p0 = pr(5.4 + R.range(-0.4, 0.6), R.range(1.2, 3.4), R.range(8.8, 10.2)); sparks += `<circle cx="${r0(p0[0])}" cy="${r0(p0[1])}" r="${f(R.range(1.2, 2.6))}"/>`; }
  S.add(`<g fill="#ffb060" opacity=".85">${sparks}</g>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#ffb070', 0.1], [0.5, '#ffb070', 0], [1, '#2a1e4a', 0.3]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.5, '#140c1c', 0], [1, '#140c1c', 0.6]], 'cx="0.5" cy="0.45" r="0.75"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#140c1c', 0], [1, '#140c1c', 0.65]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 亚克家厨房·油灯 — the last whole supper: oil lamp over the table, hearth fire, a letter with the
// seven-pointed-star seal half hidden under a cloth, shutters with a thin crack of cold night.
// ---------------------------------------------------------------------------------------------
function kitchenNight() {
  const S = new Scene('sbKitchen', '亚克家厨房：油灯与灶火下的晚餐', 1404);
  const R = S.R;
  const pr = persp({ vp: [800, 392], F: 860, eye: 1.5 });
  const X0 = -3.3, X1 = 3.3, CEIL = 2.7, BACK = 7.2, NEAR = 1.2;
  const q = (pts) => pr.quad(pts);
  // walls
  S.add(`<rect width="${W}" height="${H}" fill="#1a100e"/>`);
  const wallG = S.lin([[0, '#7a4a30'], [1, '#3a2218']]);
  S.add(`<path d="${q([[X0, 0, BACK], [X0, CEIL, BACK], [X1, CEIL, BACK], [X1, 0, BACK]])}" fill="${wallG}"/>`);
  S.add(`<path d="${q([[X0, 0, NEAR], [X0, CEIL, NEAR], [X0, CEIL, BACK], [X0, 0, BACK]])}" fill="${S.lin([[0, '#2e1c18'], [1, '#5a3626']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="${q([[X1, 0, NEAR], [X1, CEIL, NEAR], [X1, CEIL, BACK], [X1, 0, BACK]])}" fill="${S.lin([[0, '#6a3a24'], [1, '#2e1a14']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="${q([[X0, CEIL, NEAR], [X0, CEIL, BACK], [X1, CEIL, BACK], [X1, CEIL, NEAR]])}" fill="#1e120e"/>`);
  S.add(`<path d="${q([[X0, 0, NEAR], [X0, 0, BACK], [X1, 0, BACK], [X1, 0, NEAR]])}" fill="${S.lin([[0, '#4a2e20'], [1, '#140c0a']], `gradientUnits="userSpaceOnUse" x1="0" y1="${pr(0, 0, BACK)[1]}" x2="0" y2="${H}"`)}"/>`);
  // wall planks + floorboards + ceiling beams
  let pk = '';
  for (let x = X0 + 0.4; x < X1; x += 0.4) pk += pl(pr.poly([[x, 0, BACK], [x, CEIL, BACK]]));
  for (let y = 0.35; y < CEIL; y += 0.38) { pk += pl(pr.poly([[X0, y, NEAR], [X0, y, BACK]])); pk += pl(pr.poly([[X1, y, NEAR], [X1, y, BACK]])); }
  for (let x = X0 + 0.5; x < X1; x += 0.55) pk += pl(pr.poly([[x, 0, NEAR], [x, 0, BACK]]));
  S.add(`<path d="${pk}" stroke="#140a08" stroke-width="2" opacity=".45"/>`);
  let beams = '';
  for (const z of [2.2, 3.8, 5.5, 7.1]) beams += pz(pr.poly([[X0, CEIL, z], [X1, CEIL, z], [X1, CEIL - 0.22, z], [X0, CEIL - 0.22, z]]));
  S.add(`<path d="${beams}" fill="#2a1810"/>`);
  S.add(`<path d="${pl(pr.poly([[X0, CEIL - 0.22, 3.8], [X1, CEIL - 0.22, 3.8]]))}${pl(pr.poly([[X0, CEIL - 0.22, 5.5], [X1, CEIL - 0.22, 5.5]]))}" stroke="#c88a50" stroke-width="2" opacity=".5"/>`);
  // back wall: shelves with jars and pots, hanging herbs
  const sh = (y) => pz(pr.poly([[0.4, y, BACK - 0.02], [2.6, y, BACK - 0.02], [2.6, y - 0.05, BACK - 0.02], [0.4, y - 0.05, BACK - 0.02]]));
  S.add(`<path d="${sh(1.55)}${sh(2.05)}" fill="#2a1810"/>`);
  let jars = '';
  for (const [x, y, w, h, c] of [[0.55, 1.55, 0.22, 0.32, '#8a6a4a'], [0.85, 1.55, 0.18, 0.24, '#5a6a7a'], [1.1, 1.55, 0.28, 0.2, '#a87a50'], [1.5, 1.55, 0.2, 0.34, '#6a4a3a'], [1.9, 1.55, 0.3, 0.22, '#9a8a6a'], [2.3, 1.55, 0.18, 0.28, '#7a5a4a'], [0.6, 2.05, 0.3, 0.2, '#8a5a3a'], [1.1, 2.05, 0.2, 0.3, '#6a7a6a'], [1.6, 2.05, 0.36, 0.18, '#a07050'], [2.2, 2.05, 0.22, 0.26, '#7a6a5a']]) {
    const a = pr(x, y, BACK - 0.05), b = pr(x + w, y + h, BACK - 0.05);
    jars += `<rect x="${r0(a[0])}" y="${r0(b[1])}" width="${r0(b[0] - a[0])}" height="${r0(a[1] - b[1])}" rx="${r0((b[0] - a[0]) * 0.25)}" fill="${c}"/>`;
  }
  S.add(jars);
  let strings = '', bundles = '', bulbs = '';
  for (let i = 0; i < 6; i++) {
    const a = pr(-2.75 + i * 0.36, CEIL - 0.22, 5.5), L = R.range(18, 30), bx = a[0], by = a[1] + L;
    strings += `M${r0(bx)},${r0(a[1])}v${r0(L)}`;
    if (i % 3 === 2) bulbs += `M${r0(bx - 8)},${r0(by + 6)}a8,8 0 1 0 16,0a8,8 0 1 0 -16,0M${r0(bx + 2)},${r0(by + 16)}a7,7 0 1 0 14,0a7,7 0 1 0 -14,0`;
    else bundles += `M${r0(bx - 3)},${r0(by)}h6l${r0(R.range(9, 13))},${r0(R.range(34, 46))}h${r0(-R.range(26, 32))}z`;
  }
  S.add(`<path d="${strings}" stroke="#2a1810" stroke-width="1.5"/><path d="${bundles}" fill="#5e6a32"/><path d="${bundles}" fill="none" stroke="#a8b464" stroke-width="2" opacity=".5"/><path d="${bulbs}" fill="#d8c8a8"/>`);
  // back door (left part of the back wall) with the cloth bundle Erin keeps packed beside it
  S.add(`<path d="${q([[-2.9, 0, BACK - 0.02], [-2.9, 2.0, BACK - 0.02], [-1.9, 2.0, BACK - 0.02], [-1.9, 0, BACK - 0.02]])}" fill="#2e1a12"/>`);
  S.add(`<path d="${pl(pr.poly([[-2.9, 0, BACK - 0.03], [-2.9, 2.0, BACK - 0.03], [-1.9, 2.0, BACK - 0.03], [-1.9, 0, BACK - 0.03]]))}${pl(pr.poly([[-2.4, 0, BACK - 0.03], [-2.4, 2.0, BACK - 0.03]]))}" fill="none" stroke="#1a0e0a" stroke-width="5"/>`);
  { const hk = pr(-1.55, 1.65, BACK - 0.05); S.add(`<path d="M${r0(hk[0])},${r0(hk[1])}c-22,6 -26,40 -18,58c10,10 34,10 42,0c6,-20 0,-50 -24,-58z" fill="#8a7458"/><path d="M${r0(hk[0] - 14)},${r0(hk[1] + 22)}q14,6 30,0" fill="none" stroke="#5a4a38" stroke-width="3"/><circle cx="${r0(hk[0])}" cy="${r0(hk[1])}" r="3" fill="#1a0e0a"/>`); }
  // shuttered window on the left wall — a thin crack of cold night between the boards
  S.add(`<path d="${q([[X0 + 0.02, 1.0, 3.6], [X0 + 0.02, 2.0, 3.6], [X0 + 0.02, 2.0, 5.0], [X0 + 0.02, 1.0, 5.0]])}" fill="#3a2418"/>`);
  S.add(`<path d="${q([[X0 + 0.03, 1.02, 4.27], [X0 + 0.03, 1.98, 4.27], [X0 + 0.03, 1.98, 4.33], [X0 + 0.03, 1.02, 4.33]])}" fill="#9ab0e0"/>`);
  S.add(`<path d="${pl(pr.poly([[X0 + 0.03, 1.0, 3.6], [X0 + 0.03, 2.0, 3.6], [X0 + 0.03, 2.0, 5.0], [X0 + 0.03, 1.0, 5.0], [X0 + 0.03, 1.0, 3.6]]))}${pl(pr.poly([[X0 + 0.03, 1.5, 3.6], [X0 + 0.03, 1.5, 5.0]]))}" fill="none" stroke="#1e120c" stroke-width="7"/>`);
  S.add(`<path d="${pz([pr(X0 + 0.03, 1.98, 4.3), pr(X0 + 0.03, 1.02, 4.3), pr(-0.6, 0.78, 3.4), pr(-0.2, 0.78, 3.6)])}" fill="#9ab0e0" opacity=".12" filter="${S.blur(2)}"/>`);
  // hearth on the right wall: stone surround, fire, hanging pot
  const hz0 = 4.3, hz1 = 6.1;
  S.add(`<path d="${q([[X1 - 0.02, 0, hz0 - 0.3], [X1 - 0.02, 1.5, hz0 - 0.3], [X1 - 0.02, 1.5, hz1 + 0.3], [X1 - 0.02, 0, hz1 + 0.3]])}" fill="#6a5a52"/>`);
  S.add(`<path d="${q([[X1 - 0.03, 0, hz0], [X1 - 0.03, 1.1, hz0], [X1 - 0.03, 1.1, hz1], [X1 - 0.03, 0, hz1]])}" fill="#140a08"/>`);
  let stones = '';
  for (let i = 0; i < 9; i++) { const a = pr(X1 - 0.03, R.range(0.1, 1.45), R.range(hz0 - 0.28, hz1 + 0.28)); stones += `M${r0(a[0] - 10)},${r0(a[1])}h20`; }
  S.add(`<path d="${stones}" stroke="#3a2e2a" stroke-width="4" opacity=".6"/>`);
  const fireC = pr(X1 - 0.05, 0.3, (hz0 + hz1) / 2);
  S.add(`<circle cx="${r0(fireC[0] - 60)}" cy="${r0(fireC[1])}" r="460" fill="${S.rad([[0, '#ffb060', 0.55], [0.25, '#ff7a3a', 0.22], [1, '#ff7a3a', 0]])}"/>`);
  let fl = '', core = '';
  for (let i = 0; i < 5; i++) {
    const a = pr(X1 - 0.04, 0.06, hz0 + 0.3 + i * 0.3), b = pr(X1 - 0.04, 0.06, hz0 + 0.5 + i * 0.3), h = R.range(34, 62);
    const w = b[0] - a[0];
    fl += `M${r0(a[0])},${r0(a[1])}Q${r0(a[0] + w * 0.1)},${r0(a[1] - h * 0.6)} ${r0(a[0] + w * 0.5)},${r0(a[1] - h)}Q${r0(b[0])},${r0(a[1] - h * 0.5)} ${r0(b[0])},${r0(b[1])}Z`;
    core += `M${r0(a[0] + w * 0.2)},${r0(a[1])}Q${r0(a[0] + w * 0.25)},${r0(a[1] - h * 0.35)} ${r0(a[0] + w * 0.5)},${r0(a[1] - h * 0.55)}Q${r0(a[0] + w * 0.8)},${r0(a[1] - h * 0.3)} ${r0(a[0] + w * 0.8)},${r0(b[1])}Z`;
  }
  S.add(`<path d="${fl}" fill="#ff7a32"/><path d="${core}" fill="#ffd27a"/>`);
  { const lg = pr(X1 - 0.04, 0.05, hz0 + 0.25), lg2 = pr(X1 - 0.04, 0.05, hz1 - 0.2); S.add(`<path d="M${r0(lg[0])},${r0(lg[1])}L${r0(lg2[0])},${r0(lg2[1])}" stroke="#2a1410" stroke-width="12" stroke-linecap="round"/>`); }
  // mantel shelf
  S.add(`<path d="${q([[X1 - 0.02, 1.5, hz0 - 0.4], [X1 - 0.25, 1.5, hz0 - 0.4], [X1 - 0.25, 1.5, hz1 + 0.4], [X1 - 0.02, 1.5, hz1 + 0.4]])}" fill="#4a2c1c"/><path d="${pl(pr.poly([[X1 - 0.25, 1.5, hz0 - 0.4], [X1 - 0.25, 1.5, hz1 + 0.4]]))}" stroke="#e0a060" stroke-width="2" opacity=".6"/>`);
  const pot = pr(X1 - 0.08, 0.72, (hz0 + hz1) / 2);
  S.add(`<path d="M${r0(pot[0] - 34)},${r0(pot[1] - 10)}h68q0,44 -34,46q-34,-2 -34,-46z" fill="#1e1412"/><path d="M${r0(pot[0] - 34)},${r0(pot[1] - 10)}h68" stroke="#ffb070" stroke-width="3" opacity=".7"/><path d="M${r0(pot[0])},${r0(pot[1] - 10)}V${r0(pot[1] - 70)}" stroke="#1e1412" stroke-width="3"/>`);
  // hanging oil lamp over the table (focal warm light)
  const lamp = pr(0, 1.85, 3.9);
  S.add(`<circle cx="${r0(lamp[0])}" cy="${r0(lamp[1] + 40)}" r="760" fill="${S.rad([[0, '#ffd890', 0.55], [0.18, '#ffb860', 0.3], [0.5, '#e08840', 0.1], [1, '#e08840', 0]])}"/>`);
  S.add(`<path d="M${r0(lamp[0])},${r0(pr(0, CEIL - 0.22, 3.8)[1])}V${r0(lamp[1] - 20)}" stroke="#1a100c" stroke-width="3"/>`);
  S.add(`<path d="M${r0(lamp[0] - 26)},${r0(lamp[1] + 12)}h52l-8,16h-36z" fill="#3a2418"/><path d="M${r0(lamp[0] - 16)},${r0(lamp[1] - 22)}h32l6,34h-44z" fill="#ffe2a0" opacity=".9"/><path d="M${r0(lamp[0] - 22)},${r0(lamp[1] - 24)}h44" stroke="#2a1810" stroke-width="5"/>`);
  S.add(`<ellipse cx="${r0(lamp[0])}" cy="${r0(lamp[1] - 2)}" rx="7" ry="13" fill="#fff6d0"/>`);
  // the table (top seen from above), with supper
  const TY = 0.78, tz0 = 3.0, tz1 = 4.6, tx = 1.25;
  let legs = '';
  for (const [lx, lz] of [[-tx + 0.08, tz0 + 0.05], [tx - 0.08, tz0 + 0.05], [-tx + 0.08, tz1 - 0.05], [tx - 0.08, tz1 - 0.05]]) legs += pz(pr.poly([[lx - 0.05, 0, lz], [lx - 0.05, TY - 0.08, lz], [lx + 0.05, TY - 0.08, lz], [lx + 0.05, 0, lz]]));
  S.add(`<path d="${legs}" fill="#2e1a10"/>`);
  // benches along the long sides
  S.add(`<path d="${q([[-tx - 0.45, 0.45, tz0 + 0.1], [-tx - 0.45, 0.45, tz1 - 0.1], [-tx - 0.1, 0.45, tz1 - 0.1], [-tx - 0.1, 0.45, tz0 + 0.1]])}" fill="#6a4228"/><path d="${q([[tx + 0.1, 0.45, tz0 + 0.1], [tx + 0.1, 0.45, tz1 - 0.1], [tx + 0.45, 0.45, tz1 - 0.1], [tx + 0.45, 0.45, tz0 + 0.1]])}" fill="#7a4c2c"/>`);
  S.add(`<path d="${q([[-tx - 0.45, 0.45, tz0 + 0.1], [-tx - 0.1, 0.45, tz0 + 0.1], [-tx - 0.1, 0.38, tz0 + 0.1], [-tx - 0.45, 0.38, tz0 + 0.1]])}${q([[tx + 0.1, 0.45, tz0 + 0.1], [tx + 0.45, 0.45, tz0 + 0.1], [tx + 0.45, 0.38, tz0 + 0.1], [tx + 0.1, 0.38, tz0 + 0.1]])}" fill="#3a2214"/>`);
  let bl = '';
  for (const bx of [-tx - 0.4, -tx - 0.15, tx + 0.15, tx + 0.4]) for (const bz of [tz0 + 0.15, tz1 - 0.15]) bl += pz(pr.poly([[bx - 0.03, 0, bz], [bx - 0.03, 0.38, bz], [bx + 0.03, 0.38, bz], [bx + 0.03, 0, bz]]));
  S.add(`<path d="${bl}" fill="#2a180e"/>`);
  S.add(`<path d="${q([[-tx, TY, tz0], [-tx, TY, tz1], [tx, TY, tz1], [tx, TY, tz0]])}" fill="${S.lin([[0, '#8a5a36'], [1, '#c48a52']], `gradientUnits="userSpaceOnUse" x1="0" y1="${pr(0, TY, tz1)[1]}" x2="0" y2="${pr(0, TY, tz0)[1]}"`)}"/>`);
  S.add(`<path d="${q([[-tx, TY, tz0], [tx, TY, tz0], [tx, TY - 0.08, tz0], [-tx, TY - 0.08, tz0]])}" fill="#4a2c1c"/>`);
  let grain = '';
  for (let x = -tx + 0.3; x < tx; x += 0.32) grain += pl(pr.poly([[x, TY, tz0], [x, TY, tz1]]));
  S.add(`<path d="${grain}" stroke="#5a3820" stroke-width="2" opacity=".4"/>`);
  // bowls of vegetable soup, rye bread, cured meat, a wooden cup
  const bowl = (X, Z, rw) => { const c = pr(X, TY, Z), k = 860 / Z * rw; return `<ellipse cx="${r0(c[0])}" cy="${r0(c[1] + k * 0.12)}" rx="${r0(k)}" ry="${r0(k * 0.4)}" fill="#3a2418" opacity=".4"/><path d="M${r0(c[0] - k)},${r0(c[1] - k * 0.1)}q${r0(k)},${r0(k * 0.95)} ${r0(k * 2)},0z" fill="#6a4a3a"/><ellipse cx="${r0(c[0])}" cy="${r0(c[1] - k * 0.1)}" rx="${r0(k)}" ry="${r0(k * 0.3)}" fill="#a8743e"/><ellipse cx="${r0(c[0])}" cy="${r0(c[1] - k * 0.08)}" rx="${r0(k * 0.82)}" ry="${r0(k * 0.22)}" fill="#c98a3a"/><circle cx="${r0(c[0] - k * 0.3)}" cy="${r0(c[1] - k * 0.1)}" r="${r0(k * 0.09)}" fill="#7aa04a"/><circle cx="${r0(c[0] + k * 0.25)}" cy="${r0(c[1] - k * 0.05)}" r="${r0(k * 0.08)}" fill="#e07a3a"/>`; };
  S.add(bowl(-0.75, 3.55, 0.16) + bowl(0.7, 3.5, 0.16) + bowl(0.05, 4.25, 0.15));
  const br = pr(-0.2, TY, 3.6);
  S.add(`<path d="M${r0(br[0] - 46)},${r0(br[1])}q46,-46 92,0q-46,12 -92,0z" fill="#7a4a24"/><path d="M${r0(br[0] - 26)},${r0(br[1] - 14)}l10,-10M${r0(br[0] - 4)},${r0(br[1] - 18)}l10,-10M${r0(br[0] + 18)},${r0(br[1] - 14)}l10,-10" stroke="#c8884a" stroke-width="3"/>`);
  const mt = pr(0.35, TY, 3.85);
  S.add(`<ellipse cx="${r0(mt[0])}" cy="${r0(mt[1])}" rx="34" ry="11" fill="#d8c8b0"/><path d="M${r0(mt[0] - 18)},${r0(mt[1] - 2)}q10,-12 30,-4q-6,8 -30,4z" fill="#b8584a"/>`);
  const cup = pr(-0.95, TY, 4.2);
  S.add(`<path d="M${r0(cup[0] - 12)},${r0(cup[1] - 30)}h24l-3,30h-18z" fill="#8a5a36"/><ellipse cx="${r0(cup[0])}" cy="${r0(cup[1] - 30)}" rx="12" ry="4" fill="#9ab8d8"/>`);
  // the letter: a corner with a wax seal (seven-pointed morning star) peeking out from under a cloth
  const lt = pr(1.0, TY, 4.35);
  S.add(`<path d="M${r0(lt[0] - 40)},${r0(lt[1] + 6)}l60,-12l26,14l-60,10z" fill="#e8dcc0"/><circle cx="${r0(lt[0] - 6)}" cy="${r0(lt[1] + 5)}" r="7" fill="#9a2a2a"/><path d="${star7(lt[0] - 6, lt[1] + 5, 5)}" fill="#e0a08a" opacity=".8"/>`);
  S.add(`<path d="M${r0(lt[0] - 4)},${r0(lt[1] - 14)}q30,-6 56,4l8,26q-30,8 -58,2z" fill="#c0b090"/><path d="M${r0(lt[0] + 8)},${r0(lt[1] - 10)}q20,-2 40,6" fill="none" stroke="#8a7a60" stroke-width="2"/>`);
  // chair backs at the near edge (dark, calm area under the dialogue box)
  for (const [cx, cz, w] of [[-1.95, 2.25, 0.7], [2.05, 2.35, 0.7]]) {
    const top = [[cx - w / 2, 1.05, cz], [cx + w / 2, 1.05, cz]];
    let sp = pz(pr.poly([[cx - w / 2, 0, cz], [cx - w / 2, 1.1, cz], [cx - w / 2 + 0.07, 1.1, cz], [cx - w / 2 + 0.07, 0, cz]])) + pz(pr.poly([[cx + w / 2 - 0.07, 0, cz], [cx + w / 2 - 0.07, 1.1, cz], [cx + w / 2, 1.1, cz], [cx + w / 2, 0, cz]]));
    sp += pz(pr.poly([[cx - w / 2, 0.98, cz], [cx + w / 2, 0.98, cz], [cx + w / 2, 1.1, cz], [cx - w / 2, 1.1, cz]]));
    for (let t = 0.25; t < 0.8; t += 0.25) sp += pz(pr.poly([[cx - w / 2 + w * t - 0.02, 0.5, cz], [cx - w / 2 + w * t - 0.02, 0.98, cz], [cx - w / 2 + w * t + 0.02, 0.98, cz], [cx - w / 2 + w * t + 0.02, 0.5, cz]]));
    sp += pz(pr.poly([[cx - w / 2, 0.45, cz], [cx + w / 2, 0.45, cz], [cx + w / 2, 0.52, cz], [cx - w / 2, 0.52, cz]]));
    S.add(`<path d="${sp}" fill="#160c08"/><path d="${pl(pr.poly(top))}" stroke="#d8985a" stroke-width="3" opacity=".55"/>`);
  }
  // a warm overall glow + darker corners and bottom
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.3, '#0c0606', 0], [1, '#0c0606', 0.7]], 'cx="0.5" cy="0.42" r="0.72"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#0c0606', 0], [1, '#0c0606', 0.7]])}"/>`);
  return S.out();
}

export const villageBgs = {
  'kitchen-night': kitchenNight,
  'village-road': villageRoad,
  'pasture': pasture,
  'hemai-day': hemaiDay,
};
