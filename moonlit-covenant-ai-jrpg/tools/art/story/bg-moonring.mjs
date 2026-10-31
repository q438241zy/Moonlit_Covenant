// 月蚀加冕 — chapter 30 (script 30 美術需求):
//   hemai-prayer-ruin-eclipse — Hemai's ruined chapel under an eclipse: the burnt walls, the well in the middle, a dark sun.
//   moonring-sanctum / moonring-sanctum-dawn — the Moon-Ring Sanctum under Hemai: a vast ring hall, eight stone seats, an altar,
//                               an inner stair rising behind it; in eclipse (white light falling down the well) / in dawn light.
//   moonring-inner-stair      — the inner stair: narrow white steps rising toward a light.
//   moonring-roof-open        — the ring's roof torn open to the sky, and crowds kneeling on the rim far above.
//   moonring-new-city         — three years on: a new low city of white stone and green roofs around the ring, morning.
//   hemai-rebuilt-dawn        — Hemai rebuilt at dawn: wheat fields, a new chapel, houses, a road.
//   hemai-half-built          — Hemai half rebuilt: scaffolding, unfinished walls, a candle-lit roll of names in a window.
//   white-tower-iron          — the White Tower bound in iron: black iron bands around the white tower, banners, a grey sky.
//   white-tower-throne        — the throne room: a high iron-and-white throne at the end of a long empty hall.
//   gilded-cage               — the gilded cage above the Coronation Hall: a gold-barred room, cushions, a high window.
//   seven-sins-feast          — the Seven Sins feast hall: a long table under the ring, seven crowned chairs, red and gold.
//   silent-empire             — the silent empire: an empty grey city square, shut windows, one figure far off.
// No text anywhere.
import { Scene, W, H, f, rng, mix } from './lib.mjs';

const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;
const rect = (x, y, w, h) => `M${f1(x)},${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}z`;
function vignette(S, a = 0.5, cy = 0.5) { S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', a * 0.3], [1, '#000', a]], `cx="0.5" cy="${cy}" r="0.75"`)}"/>`); }

function ruinEclipse() {
  const S = new Scene('sbMrRuin', '赫麦·祷堂废墟·蚀：烧焦的残墙，中间一口井，天上一轮黑色的太阳', 30101);
  const R = rng(30102);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#1a1420'], [0.6, '#4a3a3a'], [1, '#2a2020']])}"/>`);
  S.add(`<path d="${ell(1100, 200, 90, 90)}" fill="#0a0808"/><path d="${ell(1100, 200, 110, 110)}" fill="none" stroke="#ffd8a0" stroke-width="6" opacity=".8" filter="${S.blur(2)}"/>`);
  S.add(`<path d="M0,600H${W}V${H}H0Z" fill="${S.lin([[0, '#3a3024'], [1, '#1a140e']])}"/>`);
  S.add(`<path d="M300,600V320l80,-50V600zM440,600V260h100l30,80V600zM1060,600V300h70V600zM1180,600V280l90,-40l40,100V600z" fill="#1a1410"/>`);
  S.add(`<path d="${ell(800, 680, 140, 40)}" fill="#2a2420"/><path d="${ell(800, 676, 110, 28)}" fill="#050404"/>`);
  { let wh = ''; for (let k = 0; k < 60; k++) { const x = R.range(0, W), y = R.range(620, 890); if (Math.abs(x - 800) < 180 && y < 720) continue; wh += `M${f1(x)},${f1(y)}l${f1(R.range(-3, 3))},${f1(-R.range(8, 18))}`; } S.add(`<path d="${wh}" stroke="#6a6a3a" stroke-width="2"/>`); }
  vignette(S, 0.55);
  return S.out();
}
function sanctum(dawn) {
  const S = new Scene(dawn ? 'sbMrSanDawn' : 'sbMrSan', dawn ? '月环圣所·晨光：一座巨大的圆环大厅，八个石座，中间一座祭坛，后面一道往上的内阶，晨光从井口照下来' : '月环圣所·全蚀：一座巨大的圆环大厅，八个石座，中间一座祭坛，后面一道往上的内阶，井口落下一道白光', dawn ? 30211 : 30201);
  const R = rng(dawn ? 30212 : 30202);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(dawn ? [[0, '#3a3440'], [1, '#6a5a50']] : [[0, '#06060c'], [1, '#141020']])}"/>`);
  // the great ring: concentric ellipses
  S.add(`<path d="${ell(800, 620, 720, 230)}" fill="${dawn ? '#5a5048' : '#1a1624'}"/><path d="${ell(800, 620, 560, 170)}" fill="${dawn ? '#6a6058' : '#22202e'}"/>`);
  // eight stone seats around
  for (let k = 0; k < 8; k++) { const a = Math.PI * (0.08 + k * 0.12), x = 800 - Math.cos(a) * 640, y = 620 - Math.sin(a) * 200; S.add(`<path d="M${f1(x - 30)},${f1(y + 20)}V${f1(y - 50)}q30,-24 60,0V${f1(y + 20)}z" fill="${dawn ? '#8a8074' : '#3a3648'}"/>`); }
  // inner stair behind the altar
  for (let k = 0; k < 10; k++) S.add(`<path d="${rect(740 + k * 4, 440 - k * 34, 120 - k * 8, 30)}" fill="${mix(dawn ? '#e8e0d0' : '#8a86a0', dawn ? '#fff8e8' : '#c8c4e0', k / 10)}"/>`);
  S.add(`<path d="M720,600h160l-20,-60H740z" fill="${dawn ? '#9a8a78' : '#4a4458'}"/>`);
  // the light from the well
  S.add(`<path d="M760,0H840L900,600H700Z" fill="${S.lin([[0, dawn ? '#ffe8b0' : '#ffffff', 0.55], [1, dawn ? '#ffe8b0' : '#ffffff', 0.05]])}"/>`);
  vignette(S, dawn ? 0.4 : 0.6);
  return S.out();
}
function innerStair() {
  const S = new Scene('sbMrStair', '月环圣所·内阶：窄窄的白色台阶往上，通向一片光', 30301);
  const R = rng(30302);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#fff4e0'], [0.4, '#a8a0a0'], [1, '#2a2630']])}"/>`);
  for (let k = 0; k < 16; k++) { const t = k / 15, w = 160 + t * 600, y = 120 + t * 780; S.add(`<path d="${rect(800 - w / 2, y, w, 40)}" fill="${mix('#fffaf0', '#8a8490', t)}"/>`); }
  S.add(`<path d="M0,0H500L700,900H0ZM${W},0H1100L900,900H${W}Z" fill="#1a1620" opacity=".85"/>`);
  vignette(S, 0.4);
  return S.out();
}
function roofOpen() {
  const S = new Scene('sbMrRoof', '掀开的环顶：圆环的顶被掀开，露出天空，远远的环沿上跪满了人', 30401);
  const R = rng(30402);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#8a98b8'], [0.5, '#c8c0b8'], [1, '#2a2430']])}"/>`);
  S.add(`<path d="${ell(800, 280, 700, 180)}" fill="none" stroke="#3a3430" stroke-width="40"/>`);
  let c = ''; for (let k = 0; k < 260; k++) { const a = R.range(0, Math.PI * 2), x = 800 + Math.cos(a) * 700, y = 280 + Math.sin(a) * 180 - 26; if (y > 330) continue; c += ell(x, y, 5, 6) + `M${f1(x - 7)},${f1(y + 18)}q7,-14 14,0z`; }
  S.add(`<path d="${c}" fill="#1a1618"/>`);
  S.add(`<path d="M0,500Q800,420 ${W},500V${H}H0Z" fill="#14101a"/><path d="M700,900L780,520H820L900,900Z" fill="#e8e0d0" opacity=".25"/>`);
  vignette(S, 0.45);
  return S.out();
}
function newCity() {
  const S = new Scene('sbMrCity', '三年后·月环新城：围着圆环的一座新的低矮城市，白石绿顶，早晨', 30501);
  const R = rng(30502);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#9ab8d8'], [0.6, '#e0e8ee'], [1, '#f0f0e8']])}"/>`);
  S.add(`<path d="${ell(800, 560, 360, 80)}" fill="#c8c0b0"/><path d="${ell(800, 556, 300, 60)}" fill="#8aa0a8"/>`);
  let h = ''; for (let k = 0; k < 40; k++) { const x = R.range(40, 1560), y = R.range(500, 760); if (Math.abs(x - 800) < 380 && y < 640) continue; const w = R.range(50, 90); h += rect(x, y - 50, w, 50); }
  S.add(`<path d="${h}" fill="#f0ece4"/>`);
  let r = ''; for (let k = 0; k < 40; k++) { const x = R.range(40, 1560), y = R.range(480, 740); if (Math.abs(x - 800) < 380 && y < 620) continue; r += `M${f1(x - 8)},${f1(y)}l${f1(45)},-24l${f1(45)},24z`; }
  S.add(`<path d="${r}" fill="#5a8a5a"/>`);
  S.add(`<path d="M0,780H${W}V${H}H0Z" fill="#a8b888"/>`);
  vignette(S, 0.3);
  return S.out();
}
function hemai(full) {
  const S = new Scene(full ? 'sbMrHemai' : 'sbMrHemaiHalf', full ? '赫麦重建·黎明：麦田，一座新的祷堂，房子，一条路' : '赫麦重建到一半：脚手架，没盖完的墙，一扇窗里烛光照着一卷名册', full ? 30601 : 30611);
  const R = rng(full ? 30602 : 30612);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(full ? [[0, '#6a7aa0'], [0.55, '#f0d0a8'], [1, '#f8e4c0']] : [[0, '#2a2a3a'], [0.6, '#5a5060'], [1, '#3a3030']])}"/>`);
  S.add(`<path d="M0,560H${W}V${H}H0Z" fill="${full ? S.lin([[0, '#d8b860'], [1, '#a88a3a']]) : S.lin([[0, '#5a4a30'], [1, '#2a2218']])}"/>`);
  S.add(`<path d="M700,560V400l100,-80l100,80V560z" fill="${full ? '#f0e8dc' : '#6a6058'}"/>`);
  for (const [x, w] of [[200, 140], [400, 120], [1080, 150], [1280, 130]]) S.add(`<path d="M${x},560V${f1(480)}l${f1(w / 2)},-40l${f1(w / 2)},40V560z" fill="${full ? '#e8dcc8' : '#5a5048'}"/>`);
  if (full) { let wh = ''; for (let k = 0; k < 120; k++) { const x = R.range(0, W), y = R.range(580, 890); wh += `M${f1(x)},${f1(y)}l${f1(R.range(-3, 3))},${f1(-R.range(10, 22))}`; } S.add(`<path d="${wh}" stroke="#c8a040" stroke-width="2"/>`); S.add(`<path d="M780,900L800,560L820,900Z" fill="#c8b490"/>`); }
  else {
    S.add(`<path d="M690,560V300M910,560V300M690,380H910M690,460H910M700,300L900,560M900,300L700,560" stroke="#8a7050" stroke-width="5"/>`);
    S.add(`<path d="${rect(1310, 500, 40, 34)}" fill="#ffd080"/><ellipse cx="1330" cy="517" rx="80" ry="60" fill="${S.rad([[0, '#ffd080', 0.4], [1, '#ffd080', 0]])}"/>`);
  }
  vignette(S, full ? 0.3 : 0.55);
  return S.out();
}
function towerIron() {
  const S = new Scene('sbMrIron', '白塔·铁冕：白塔被一道道黑铁箍住，旗帜，灰色的天', 30701);
  const R = rng(30702);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#4a4c54'], [1, '#8a8a8c']])}"/>`);
  S.add(`<path d="M720,700V140l80,-100l80,100V700z" fill="#e8e6e0"/>`);
  let b = ''; for (let y = 180; y < 700; y += 80) b += rect(712, y, 176, 18); S.add(`<path d="${b}" fill="#1a1a1e"/>`);
  for (const x of [400, 1200]) S.add(`<path d="M${x},700V300" stroke="#1a1a1e" stroke-width="6"/><path d="M${x},300h80v120l-40,-20l-40,20z" fill="#2a1a1a"/>`);
  S.add(`<path d="M0,700H${W}V${H}H0Z" fill="#3a3a3e"/>`);
  vignette(S, 0.45);
  return S.out();
}
function throne() {
  const S = new Scene('sbMrThrone', '白塔·王座：一条长长的空大厅尽头，一张高高的铁与白石的王座', 30801);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#1a1a20'], [1, '#3a3a40']])}"/>`);
  for (let k = 0; k < 6; k++) { const t = k / 5, x1 = 200 + t * 480, x2 = 1400 - t * 480, h = 700 - t * 400; S.add(`<path d="M${f1(x1)},${f1(800 - h * 0.1)}V${f1(800 - h)}M${f1(x2)},${f1(800 - h * 0.1)}V${f1(800 - h)}" stroke="${mix('#d8d4cc', '#5a5a60', t)}" stroke-width="${f1(40 - t * 30)}"/>`); }
  S.add(`<path d="M700,520V300l100,-60l100,60V520z" fill="#2a2a30" stroke="#d8d4cc" stroke-width="4"/><path d="M740,520h120v40H740z" fill="#e8e4dc"/>`);
  S.add(`<path d="M0,800L700,560H900L${W},800V${H}H0Z" fill="#28282e"/>`);
  vignette(S, 0.55);
  return S.out();
}
function gildedCage() {
  const S = new Scene('sbMrCage', '冠礼院上层的金笼：金色栏杆围着的房间，软垫，一扇高窗', 30901);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#3a2a1a'], [1, '#5a4228']])}"/>`);
  S.add(`<path d="${rect(700, 80, 200, 260)}" fill="${S.lin([[0, '#c8d8e8'], [1, '#8a98a8']])}" opacity=".7"/>`);
  S.add(`<path d="M0,700H${W}V${H}H0Z" fill="#3a2a1a"/><path d="M500,700q100,-60 220,-20q120,-40 220,20z" fill="#8a2a2a"/>`);
  let bars = ''; for (let x = 40; x < W; x += 70) bars += `M${x},0V${H}`; S.add(`<path d="${bars}" stroke="#d8b050" stroke-width="8"/>`);
  S.add(`<path d="M0,60H${W}M0,840H${W}" stroke="#d8b050" stroke-width="14"/>`);
  vignette(S, 0.5);
  return S.out();
}
function sinsFeast() {
  const S = new Scene('sbMrFeast', '月环圣所·七罪宴：圆环下一张长桌，七张戴冠的椅子，红与金', 31001);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#1a0c10'], [1, '#3a1a18']])}"/>`);
  S.add(`<path d="${ell(800, 160, 700, 140)}" fill="none" stroke="#5a3a2a" stroke-width="30"/>`);
  S.add(`<path d="M160,700L400,500H1200L1440,700Z" fill="#8a1a1a"/><path d="M160,700h1280v24H160z" fill="#4a0e0e"/>`);
  for (let k = 0; k < 7; k++) { const t = k / 6, x = 360 + t * 880; S.add(`<path d="M${f1(x - 36)},740V${f1(520)}q36,-30 72,0V740z" fill="#2a1410" stroke="#d8a840" stroke-width="3"/><path d="M${f1(x - 20)},${f1(500)}l10,-20l10,14l10,-14l10,20z" fill="#d8a840"/>`); }
  S.add(`<ellipse cx="800" cy="560" rx="560" ry="200" fill="${S.rad([[0, '#ffc870', 0.25], [1, '#ffc870', 0]])}"/>`);
  vignette(S, 0.55);
  return S.out();
}
function silentEmpire() {
  const S = new Scene('sbMrSilent', '无声帝国：空荡荡的灰色城市广场，紧闭的窗，远处一个人影', 31101);
  const R = rng(31102);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#6a6a6e'], [1, '#9a9a9c']])}"/>`);
  for (const [x, w, h] of [[0, 420, 520], [420, 300, 440], [1180, 420, 520], [880, 300, 460]]) {
    S.add(`<path d="${rect(x, 640 - h, w, h)}" fill="#5a5a5e"/>`);
    let wd = ''; for (let yy = 640 - h + 40; yy < 600; yy += 70) for (let xx = x + 30; xx < x + w - 30; xx += 60) wd += rect(xx, yy, 26, 40); S.add(`<path d="${wd}" fill="#3a3a3e"/>`);
  }
  S.add(`<path d="M0,640H${W}V${H}H0Z" fill="#7a7a7c"/>`);
  S.add(`<path d="${ell(800, 620, 6, 7)}M794,650q6,-26 12,0z" fill="#1a1a1c"/>`);
  vignette(S, 0.4);
  return S.out();
}

export const moonringBgs = {
  'hemai-prayer-ruin-eclipse': () => ruinEclipse(),
  'moonring-sanctum': () => sanctum(false),
  'moonring-sanctum-dawn': () => sanctum(true),
  'moonring-inner-stair': () => innerStair(),
  'moonring-roof-open': () => roofOpen(),
  'moonring-new-city': () => newCity(),
  'hemai-rebuilt-dawn': () => hemai(true),
  'hemai-half-built': () => hemai(false),
  'white-tower-iron': () => towerIron(),
  'white-tower-throne': () => throne(),
  'gilded-cage': () => gildedCage(),
  'seven-sins-feast': () => sinsFeast(),
  'silent-empire': () => silentEmpire(),
};
