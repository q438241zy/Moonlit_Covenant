// 白塔之围 — chapter 29 (script 29 美術需求; reused: white-tower-seven-angle-hall, white-tower-registry-hall,
// arch-tide-gate-sanctuary as the cells, arch-tide-gate-channel as the waterway mouth):
//   white-tower-city-siege-far   — the White Tower city from the siege lines: white walls, the tower into cloud, camp smoke.
//   white-tower-walls-predawn / white-tower-walls-dawn — under the outer walls: tall white stone, ladders, before/at dawn.
//   white-tower-camp-predawn / white-tower-camp-night  — the siege camp: tents, a command table, the white walls behind.
//   white-tower-belltower        — inside the bell tower: a stair winding up, a great bell overhead, a high window.
//   morning-gate                 — the Morning Gate: a deep gate passage whose wall is a stone giant gripping the gate chains.
//   coronation-hall-exterior / coronation-hall-ruin / coronation-hall-feast — the Coronation Hall: its white facade; the same
//                                  hall blasted open (dome cracked, rubble); its great room laid for a feast.
//   white-stair-dusk             — the white stair at dusk: a long flight of white steps up to the hall, long shadows.
//   register-hall-night          — the registry hall at night: shelves of ledgers, one lamp on the table.
//   dawn-stair-scaffold / dawn-stair-scaffold-empty — the scaffold at the top of the white stair before the hall door at
//                                  dawn, with a crowd below / with the square empty.
//   hemai-ruin-camp-night        — the camp outside the ruined chapel of Hemai at night: the burnt chapel walls, a fire.
// No text anywhere.
import { Scene, W, H, f, rng, mix } from './lib.mjs';

const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;
const rect = (x, y, w, h) => `M${f1(x)},${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}z`;
function vignette(S, a = 0.5, cy = 0.5) { S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', a * 0.3], [1, '#000', a]], `cx="0.5" cy="${cy}" r="0.75"`)}"/>`); }
function stars(S, R, n, y1) { let d = ''; for (let k = 0; k < n; k++) { const r = R.range(0.8, 1.8); d += ell(R.range(0, W), R.range(0, y1), r, r); } S.add(`<path d="${d}" fill="#e6ecff" opacity=".7"/>`); }
function tents(S, list, col, door) { for (const [x, w, h, b] of list) S.add(`<path d="M${x},${b}L${x + w / 2},${b - h}L${x + w},${b}Z" fill="${col}"/><path d="M${x + w / 2},${b - h}L${x + w / 2 + 12},${b}H${x + w / 2 - 12}Z" fill="${door}"/>`); }
const SKIES = {
  predawn: [[0, '#141a30'], [0.6, '#3a4260'], [1, '#6a6a80']],
  dawn: [[0, '#5a6a90'], [0.55, '#e8c8b0'], [1, '#f4dcc0']],
  dusk: [[0, '#3a2a4a'], [0.55, '#c88a6a'], [1, '#e8b080']],
  night: [[0, '#060810'], [0.6, '#141a2a'], [1, '#0c0e14']],
  day: [[0, '#8aa0c0'], [0.6, '#d8e0e8'], [1, '#eef0f2']],
};

function cityFar() {
  const S = new Scene('sbSgFar', '白塔城远景：白色的城墙，塔顶没进云里，营地的炊烟', 29101);
  const R = rng(29102);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(SKIES.day)}"/>`);
  S.add(`<path d="M770,520V120l30,-80l30,80V520z" fill="#f4f2ec"/><path d="${ell(800, 60, 260, 70)}${ell(700, 90, 180, 50)}${ell(920, 80, 200, 56)}" fill="#e8ecf2" opacity=".9" filter="${S.blur(2)}"/>`);
  S.add(`<path d="M200,560V440h1200V560z" fill="#e8e4dc"/>`);
  { let m = ''; for (let x = 200; x < 1400; x += 50) m += `M${x},440v-24h30v24`; S.add(`<path d="${m}" fill="#e8e4dc"/>`); }
  for (const x of [200, 500, 1100, 1400]) S.add(`<path d="M${x - 30},560V380h60V560z" fill="#dcd8d0"/>`);
  S.add(`<path d="M0,560H${W}V${H}H0Z" fill="${S.lin([[0, '#8a8a6a'], [1, '#5a5a40']])}"/>`);
  tents(S, [[60, 160, 100, 760], [260, 140, 90, 780], [1260, 170, 110, 770], [1440, 120, 80, 760]], '#7a6a52', '#3a2e22');
  let sm = ''; for (let k = 0; k < 5; k++) sm += ell(160 + k * 14, 640 - k * 40, 20 + k * 8, 14 + k * 5);
  S.add(`<path d="${sm}" fill="#8a8a8a" opacity=".5" filter="${S.blur(2)}"/>`);
  vignette(S, 0.35);
  return S.out();
}
function walls(sky) {
  const dawn = sky === 'dawn';
  const S = new Scene(dawn ? 'sbSgWallDawn' : 'sbSgWallPre', dawn ? '白塔城外城墙下·黎明：高高的白石城墙，靠着的云梯，天亮了' : '白塔城外·天亮前：高高的白石城墙，靠着的云梯，天还没亮', dawn ? 29211 : 29201);
  const R = rng(dawn ? 29212 : 29202);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(SKIES[sky])}"/>`);
  S.add(`<path d="M0,620V160H${W}V620z" fill="${dawn ? '#e0dcd4' : '#6a6c78'}"/>`);
  { let m = ''; for (let x = 0; x < W; x += 64) m += `M${x},160v-34h40v34`; S.add(`<path d="${m}" fill="${dawn ? '#e0dcd4' : '#6a6c78'}"/>`); }
  { let st = ''; for (let k = 0; k < 9; k++) { const y = 200 + k * 48; st += `M0,${y}H${W}`; } S.add(`<path d="${st}" stroke="${dawn ? '#c8c4bc' : '#5a5c68'}" stroke-width="2"/>`); }
  let lad = ''; for (const x of [300, 820, 1240]) { lad += `M${x},900L${x + 60},170M${x + 40},900L${x + 100},170`; for (let k = 0; k < 14; k++) { const t = k / 14, y = 900 - t * 730; lad += `M${f1(x + t * 60)},${f1(y)}h40`; } }
  S.add(`<path d="${lad}" stroke="#4a3a2a" stroke-width="6"/>`);
  S.add(`<path d="M0,620H${W}V${H}H0Z" fill="${dawn ? '#8a7a5a' : '#2a2a30'}"/>`);
  vignette(S, dawn ? 0.35 : 0.55);
  return S.out();
}
function camp(night) {
  const S = new Scene(night ? 'sbSgCampNight' : 'sbSgCampPre', night ? '白塔城外的营地·夜：帐篷，一张军议桌，后面是白色的城墙' : '白塔城外的营地·天亮前：帐篷，一张军议桌，后面是白色的城墙', night ? 29321 : 29301);
  const R = rng(night ? 29322 : 29302);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(night ? SKIES.night : SKIES.predawn)}"/>`);
  if (night) stars(S, R, 70, 320);
  S.add(`<path d="M200,520V380h1200V520z" fill="${night ? '#3a3c48' : '#5a5c6a'}"/><path d="M780,520V120l20,-60l20,60V520z" fill="${night ? '#4a4c58' : '#7a7c88'}"/>`);
  S.add(`<path d="M0,520H${W}V${H}H0Z" fill="${S.lin([[0, '#2a2620'], [1, '#14100c']])}"/>`);
  tents(S, [[60, 240, 180, 700], [1280, 230, 170, 700], [1480, 120, 90, 690]], '#3a3228', '#120c08');
  S.add(`<path d="M420,760V560L800,470L1180,560V760Z" fill="#463a2c"/><path d="M520,760V600H1080V760Z" fill="#1a120c"/>`);
  S.add(`<path d="M600,730h400l30,-40h-460z" fill="#6a4a30"/><path d="M640,720h320l20,-28h-320z" fill="#d8c8a0"/>`);
  S.add(`<ellipse cx="800" cy="700" rx="380" ry="200" fill="${S.rad([[0, '#ffb060', 0.3], [1, '#ffb060', 0]])}"/>`);
  vignette(S, 0.55, 0.6);
  return S.out();
}
function bellTower() {
  const S = new Scene('sbSgBell', '白塔城的钟楼里：一道盘旋往上的楼梯，头顶一口大钟，一扇高窗', 29401);
  const R = rng(29402);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#2a2420'], [1, '#14100c']])}"/>`);
  S.add(`<path d="M620,0h360v120H620z" fill="${S.lin([[0, '#c8d0e0'], [1, '#8a90a0']])}" opacity=".6"/>`);
  S.add(`<path d="M680,300q0,-180 120,-180q120,0 120,180h20v30H660v-30z" fill="#9a7a3a"/><path d="M800,330v40" stroke="#5a4a2a" stroke-width="10"/>`);
  let st = ''; for (let k = 0; k < 16; k++) { const a = k * 0.5, x = 800 + Math.cos(a) * 420, y = 880 - k * 34; st += `M${f1(x - 70)},${f1(y)}h140v14h-140z`; }
  S.add(`<path d="${st}" fill="#5a4a3a"/>`);
  S.add(`<ellipse cx="800" cy="60" rx="260" ry="140" fill="${S.rad([[0, '#e8ecff', 0.35], [1, '#e8ecff', 0]])}"/>`);
  vignette(S, 0.55);
  return S.out();
}
function morningGate() {
  const S = new Scene('sbSgGate', '晨门：很深的门洞，门洞的墙是一个石头的巨人，双手握着闸链', 29501);
  const R = rng(29502);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#2a2a30'], [1, '#4a4a50']])}"/>`);
  S.add(`<path d="M520,${H}V320q280,-220 560,0V${H}z" fill="#14141a"/><path d="M620,${H}V380q180,-140 360,0V${H}z" fill="${S.lin([[0, '#e8d8b8'], [1, '#c8b898']])}" opacity=".5"/>`);
  // the stone giant forming the wall: head and shoulders over the arch, two arms down the sides gripping the chains
  S.add(`<path d="${ell(800, 170, 110, 120)}" fill="#7a7a80"/><path d="M752,170q14,6 28,0M820,170q14,6 28,0" stroke="#3a3a40" stroke-width="5" fill="none"/>`);
  S.add(`<path d="M520,320Q560,220 700,240L760,300L840,300L900,240Q1040,220 1080,320L1100,${H}H980V420L940,360H660L620,420V${H}H500Z" fill="#6a6a70"/>`);
  S.add(`<path d="M560,420q-30,120 0,240q20,40 60,30M1040,420q30,120 0,240q-20,40 -60,30" stroke="#8a8a90" stroke-width="40" fill="none" stroke-linecap="round"/>`);
  let ch = ''; for (let y = 300; y < 820; y += 26) { ch += ell(600, y, 9, 15) + ell(1000, y, 9, 15); }
  S.add(`<path d="${ch}" fill="none" stroke="#3a3a3e" stroke-width="5"/>`);
  S.add(`<path d="M0,820H${W}V${H}H0Z" fill="#3a3a40"/>`);
  vignette(S, 0.5);
  return S.out();
}
function hall(mode) {
  const ids = { ext: ['sbSgHallExt', '冠礼院大殿外：白色的门面，高高的穹顶，门前的台阶', 29601], ruin: ['sbSgHallRuin', '冠礼院的废墟：穹顶裂开，墙塌了一半，瓦砾和烟尘', 29611], feast: ['sbSgHallFeast', '冠礼院大殿·宴：长长的宴桌，金色的烛台，高高的穹顶下', 29621] }[mode];
  const S = new Scene(ids[0], ids[1], ids[2]);
  const R = rng(ids[2] + 1);
  if (mode === 'feast') {
    S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#2a2018'], [1, '#4a3a28']])}"/>`);
    S.add(`<path d="M300,0Q800,-200 1300,0V200Q800,40 300,200Z" fill="#3a2e22"/>`);
    for (const x of [200, 520, 1080, 1400]) S.add(`<path d="M${x - 40},700V160h80v540z" fill="#e8dcc0" opacity=".85"/>`);
    S.add(`<path d="M160,700L420,520H1180L1440,700Z" fill="#8a2a24"/><path d="M160,700h1280v24H160z" fill="#5a1a14"/>`);
    let cn = ''; for (let k = 0; k < 9; k++) { const x = 440 + k * 90; cn += `M${x},560v-40M${x - 10},560h20`; } S.add(`<path d="${cn}" stroke="#d8b050" stroke-width="5"/>`);
    let fl = ''; for (let k = 0; k < 9; k++) fl += ell(440 + k * 90, 512, 5, 9); S.add(`<path d="${fl}" fill="#ffd890"/>`);
    S.add(`<ellipse cx="800" cy="540" rx="520" ry="200" fill="${S.rad([[0, '#ffd890', 0.3], [1, '#ffd890', 0]])}"/>`);
    S.add(`<path d="M0,760H${W}V${H}H0Z" fill="#2a1e14"/>`);
    vignette(S, 0.5);
    return S.out();
  }
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(mode === 'ruin' ? [[0, '#5a5a60'], [1, '#8a8480']] : SKIES.day)}"/>`);
  S.add(`<path d="M260,620V300H1340V620z" fill="#f0ece4"/><path d="M500,300Q800,40 1100,300z" fill="#e8e4dc"/>`);
  for (let x = 320; x < 1340; x += 120) S.add(`<path d="M${x},620V320h40v300z" fill="#fbf8f2"/>`);
  S.add(`<path d="M720,620V440q80,-70 160,0V620z" fill="#3a3430"/>`);
  for (let k = 0; k < 6; k++) S.add(`<path d="M${260 - k * 40},${620 + k * 46}H${1340 + k * 40}v46H${260 - k * 40}z" fill="${mix('#e8e4dc', '#b8b4ac', k * 0.12)}"/>`);
  if (mode === 'ruin') {
    S.add(`<path d="M700,90L760,300L700,300L640,230ZM980,140L1060,300H960Z" fill="#5a5a60"/><path d="M560,300l120,-160M1000,300l-60,-150M820,60l-20,240" stroke="#3a3a40" stroke-width="6"/>`);
    S.add(`<path d="M260,620V420l160,-40l60,240zM1340,620V380l-200,60l-40,180z" fill="#7a7672"/>`);
    let rb = ''; for (let k = 0; k < 40; k++) { const x = R.range(160, 1440), y = R.range(620, 880), s = R.range(16, 50); rb += `M${f1(x)},${f1(y)}l${f1(s)},${f1(-s * 0.4)}l${f1(s * 0.4)},${f1(s * 0.6)}l${f1(-s)},${f1(s * 0.2)}z`; }
    S.add(`<path d="${rb}" fill="#8a8680"/>`);
    let sm = ''; for (let k = 0; k < 10; k++) sm += ell(R.range(300, 1300), R.range(80, 420), R.range(80, 180), R.range(40, 80));
    S.add(`<path d="${sm}" fill="#4a4a50" opacity=".5" filter="${S.blur(3)}"/>`);
  }
  vignette(S, 0.4);
  return S.out();
}
function whiteStair() {
  const S = new Scene('sbSgStair', '白石阶·黄昏：一长段白色的石阶通往大殿，长长的影子', 29701);
  const R = rng(29702);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(SKIES.dusk)}"/>`);
  S.add(`<path d="M520,260V120q280,-90 560,0V260z" fill="#e8d8c8"/>`);
  for (let k = 0; k < 18; k++) { const t = k / 17, w = 500 + t * 1100, y = 260 + t * 640; S.add(`<path d="M${f1(800 - w / 2)},${f1(y)}h${f1(w)}v${f1(36)}h${f1(-w)}z" fill="${mix('#e8ddd0', '#a89888', t * 0.6)}"/>`); }
  S.add(`<path d="M800,260L1500,${H}H1300L800,300z" fill="#3a2a3a" opacity=".25"/>`);
  vignette(S, 0.4);
  return S.out();
}
function registerNight() {
  const S = new Scene('sbSgRegNight', '册厅·夜：一排一排装满名册的架子，桌上一盏灯', 29801);
  const R = rng(29802);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#0c0a08'], [1, '#1e1810']])}"/>`);
  for (let col = 0; col < 6; col++) {
    const x = 60 + col * 260; S.add(`<path d="M${x},700V100h200v600z" fill="#2a1e14"/>`);
    let b = ''; for (let r = 0; r < 7; r++) for (let k = 0; k < 8; k++) { if (R.range(0, 1) < 0.15) continue; b += rect(x + 10 + k * 23, 110 + r * 84, 18, R.range(50, 72)); }
    S.add(`<path d="${b}" fill="#5a4630" opacity=".8"/>`);
  }
  S.add(`<path d="M0,700H${W}V${H}H0Z" fill="#1a140e"/><path d="M500,760h600v24H500zM520,784h20v100h-20zM1060,784h20v100h-20z" fill="#4a3424"/>`);
  S.add(`<path d="M780,700h40v60h-40z" fill="#c89040"/><ellipse cx="800" cy="720" rx="420" ry="260" fill="${S.rad([[0, '#ffd080', 0.35], [1, '#ffd080', 0]])}"/>`);
  vignette(S, 0.6);
  return S.out();
}
function scaffold(crowd) {
  const S = new Scene(crowd ? 'sbSgScaf' : 'sbSgScafEmpty', crowd ? '晨阶刑台：白石阶顶端、冠礼院正门前的刑台，黎明，台下站满了人' : '晨阶刑台：白石阶顶端、冠礼院正门前的刑台，黎明，台下空无一人', crowd ? 29901 : 29911);
  const R = rng(crowd ? 29902 : 29912);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(SKIES.dawn)}"/>`);
  S.add(`<path d="M360,420V160H1240V420z" fill="#efeae0"/><path d="M700,420V260q100,-70 200,0V420z" fill="#3a3430"/>`);
  S.add(`<path d="M500,520h600v-100H500z" fill="#5a4636"/><path d="M500,420h600v-16H500z" fill="#3a2a1e"/><path d="M780,404V300h14v104M770,300h120" stroke="#2a1e14" stroke-width="10"/>`);
  for (let k = 0; k < 8; k++) S.add(`<path d="M${300 - k * 40},${520 + k * 46}H${1300 + k * 40}v46H${300 - k * 40}z" fill="${mix('#e8e2d6', '#b0a898', k * 0.1)}"/>`);
  if (crowd) {
    let c = ''; for (let k = 0; k < 160; k++) { const x = R.range(40, 1560), y = R.range(700, 890), s = 0.6 + (y - 700) / 300; c += ell(x, y - 26 * s, 9 * s, 10 * s) + `M${f1(x - 12 * s)},${f1(y)}v${f1(-18 * s)}q${f1(12 * s)},${f1(-10 * s)} ${f1(24 * s)},0v${f1(18 * s)}z`; }
    S.add(`<path d="${c}" fill="#3a3436" opacity=".85"/>`);
  }
  vignette(S, 0.4);
  return S.out();
}
function hemaiCamp() {
  const S = new Scene('sbSgHemai', '赫麦：祷堂废墟外的营地·夜：烧焦的祷堂残墙，一堆营火', 29951);
  const R = rng(29952);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(SKIES.night)}"/>`);
  stars(S, R, 90, 400);
  S.add(`<path d="M0,560H${W}V${H}H0Z" fill="${S.lin([[0, '#1e1a14'], [1, '#0c0a08']])}"/>`);
  S.add(`<path d="M520,560V300l60,-40V560zM620,560V250h80l20,60V560zM760,560V320h60V560zM900,560V280l70,-30l30,80V560z" fill="#1a1410"/><path d="M640,330h40v60h-40z" fill="#0a0806"/>`);
  tents(S, [[100, 220, 160, 720], [1300, 200, 150, 720]], '#2e2620', '#0e0a06');
  S.add(`<ellipse cx="800" cy="760" rx="320" ry="130" fill="${S.rad([[0, '#ffb060', 0.45], [1, '#ffb060', 0]])}"/><path d="M770,780l30,-70l30,70zM784,780l16,-40l16,40z" fill="#ff9a40"/>`);
  vignette(S, 0.55, 0.6);
  return S.out();
}

export const siegeBgs = {
  'white-tower-city-siege-far': () => cityFar(),
  'white-tower-walls-predawn': () => walls('predawn'),
  'white-tower-walls-dawn': () => walls('dawn'),
  'white-tower-camp-predawn': () => camp(false),
  'white-tower-camp-night': () => camp(true),
  'white-tower-belltower': () => bellTower(),
  'morning-gate': () => morningGate(),
  'coronation-hall-exterior': () => hall('ext'),
  'coronation-hall-ruin': () => hall('ruin'),
  'coronation-hall-feast': () => hall('feast'),
  'white-stair-dusk': () => whiteStair(),
  'register-hall-night': () => registerNight(),
  'dawn-stair-scaffold': () => scaffold(true),
  'dawn-stair-scaffold-empty': () => scaffold(false),
  'hemai-ruin-camp-night': () => hemaiCamp(),
};
