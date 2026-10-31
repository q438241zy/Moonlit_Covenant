// 龙眠港 — chapter 27 (script 27 美術需求, seven backgrounds):
//   dragonsleep-harbor-far  — Dragonsleep Harbor from the sea: a crescent bay under tall sea cliffs carved with sleeping dragons,
//                             white stone terraces, a lighthouse on the point.
//   dragonsleep-council     — the Council of Memory: a round hall of pale stone, scales carved into the pillars, a ring of
//                             seats around an empty centre, sea light through high arches.
//   dragonsleep-camp-night  — the camp at the harbour at night: tents along the quay, moored boats, lanterns on the water.
//   dragonsleep-sea-sky     — the open sea and sky: a towering cloudscape over a dark sea, the imperial fleet's sails far
//                             below, a long chain hanging down out of the clouds.
//   dragonsleep-reef        — the reef offshore: black rocks awash in surf, a great shape of a dragon lying across them, mist.
//   dragonsleep-graves      — the graveyard by the sea: rows of low stones on a grassy slope above the water, a grey sky.
//   dragonsleep-memory-hall — before the Hall of Memory: a long stone facade with tall doors, steps, carved scales, dusk.
// No text anywhere.
import { Scene, W, H, f, rng, mix } from './lib.mjs';

const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;
const poly = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L') + 'Z';

function sea(S, R, y, top, bottom, glint) {
  S.add(`<path d="M0,${y}H${W}V${H}H0Z" fill="${S.lin([[0, top], [1, bottom]])}"/>`);
  let g = ''; for (let k = 0; k < 50; k++) { const yy = R.range(y + 10, H - 10), x = R.range(0, W); g += `M${f1(x)},${f1(yy)}h${f1(R.range(10, 40) * (yy - y) / (H - y) + 6)}`; }
  S.add(`<path d="${g}" stroke="${glint}" stroke-width="2" opacity=".5"/>`);
}
function vignette(S, a = 0.5, cy = 0.5) { S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', a * 0.3], [1, '#000', a]], `cx="0.5" cy="${cy}" r="0.75"`)}"/>`); }

function harborFar() {
  const S = new Scene('sbDsFar', '龙眠港远景：高高的海崖围着一道新月形的海湾，崖上刻着沉睡的龙，白石的台地，岬角上一座灯塔', 27101);
  const R = rng(27102);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#7a9ab8'], [0.6, '#c8d8e0'], [1, '#e0e4dc']])}"/>`);
  S.add(`<path d="${poly([[0, 560], [0, 220], [260, 180], [420, 260], [520, 520]])}" fill="#7a8088"/><path d="${poly([[W, 560], [W, 200], [1340, 170], [1180, 250], [1080, 520]])}" fill="#6a7078"/>`);
  // the carved sleeping dragons on both cliffs
  S.add(`<path d="M80,330q80,-50 160,-10q60,30 120,0M80,330q40,30 100,30M1280,320q80,-50 160,-10q50,30 120,0M1280,320q40,30 90,30" stroke="#5a6068" stroke-width="10" fill="none" stroke-linecap="round"/>`);
  // white terraces in the bay
  let t = ''; for (let k = 0; k < 5; k++) t += `M${420 + k * 40},${540 - k * 34}h${760 - k * 80}v34h${-(760 - k * 80)}z`;
  S.add(`<path d="${t}" fill="#e8e4d8"/>`);
  { let w = ''; for (let k = 0; k < 30; k++) w += `M${f1(R.range(460, 1140))},${f1(R.range(380, 560))}h8v10h-8z`; S.add(`<path d="${w}" fill="#6a7a88" opacity=".6"/>`); }
  // lighthouse on the point
  S.add(`<path d="M1440,200l14,-120h20l14,120z" fill="#e8e0d0"/><path d="M1446,80h36v-20h-36z" fill="#c8a040"/><ellipse cx="1464" cy="70" rx="40" ry="20" fill="${S.rad([[0, '#fff0b0', 0.6], [1, '#fff0b0', 0]])}"/>`);
  sea(S, R, 560, '#5a7a90', '#2a3a4a', '#e8f0f4');
  vignette(S, 0.35);
  return S.out();
}
function council() {
  const S = new Scene('sbDsCouncil', '龙眠港·记忆议会：浅色石头的圆厅，柱子上刻着鳞片，一圈座位围着空着的中央，高拱里透进海光', 27201);
  const R = rng(27202);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#3a4450'], [1, '#6a7078']])}"/>`);
  for (const x of [200, 520, 1080, 1400]) {
    S.add(`<path d="M${x - 70},540V180q70,-90 140,0V540z" fill="${S.lin([[0, '#c8dce8'], [1, '#8aa0b0']])}" opacity=".75"/>`);
  }
  for (const x of [360, 800, 1240]) {
    S.add(`<path d="M${x - 40},620V120h80v500z" fill="#b8b4a8"/>`);
    let sc = ''; for (let y = 140; y < 600; y += 26) for (let k = 0; k < 3; k++) sc += `M${x - 40 + k * 26},${y}q13,16 26,0`;
    S.add(`<path d="${sc}" stroke="#8a867c" stroke-width="2" fill="none"/>`);
  }
  // ring of seats
  S.add(`<path d="M120,700Q800,560 1480,700v40Q800,600 120,740z" fill="#8a8274"/><path d="M60,800Q800,640 1540,800v40Q800,680 60,840z" fill="#7a7266"/>`);
  S.add(`<path d="M0,840H${W}V${H}H0Z" fill="#5a564e"/><path d="${ell(800, 760, 220, 40)}" fill="#6a665c" opacity=".7"/>`);
  vignette(S, 0.5);
  return S.out();
}
function campNight() {
  const S = new Scene('sbDsCamp', '龙眠港·港口的营地·夜：码头边的帐篷，系着的船，水面上的灯笼', 27301);
  const R = rng(27302);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#060a14'], [0.55, '#14203a'], [1, '#0a101c']])}"/>`);
  { let st = ''; for (let k = 0; k < 80; k++) { const r = R.range(0.8, 1.8); st += ell(R.range(0, W), R.range(0, 380), r, r); } S.add(`<path d="${st}" fill="#dfe6ff" opacity=".7"/>`); }
  S.add(`<path d="${poly([[0, 470], [300, 420], [600, 450], [900, 400], [1300, 440], [W, 410], [W, 520], [0, 520]])}" fill="#0e1424"/>`);
  sea(S, R, 520, '#1a2a44', '#06080e', '#ffd890');
  // quay with tents
  S.add(`<path d="M0,660H900L1000,700H0Z" fill="#2a2a30"/>`);
  for (const [x, w, h] of [[60, 200, 150], [300, 180, 140], [560, 200, 150]]) S.add(`<path d="M${x},660L${x + w / 2},${660 - h}L${x + w},660Z" fill="#3a3a44"/><path d="M${x + w / 2},${660 - h}L${x + w / 2 + 12},660H${x + w / 2 - 12}Z" fill="#ffc870" opacity=".6"/>`);
  // moored boats
  for (const [x, y, s] of [[1080, 640, 1], [1300, 600, 0.8], [1460, 580, 0.6]]) S.add(`<path d="M${x - 90 * s},${y}h${180 * s}l-30,${30 * s}h${-120 * s}z" fill="#2a2018"/><path d="M${x},${y}V${y - 130 * s}" stroke="#3a3028" stroke-width="${4 * s}"/>`);
  // lanterns and reflections
  for (const [x, y] of [[860, 600], [1180, 590], [1380, 560], [980, 620]]) S.add(`<path d="${ell(x, y, 8, 10)}" fill="#ffc870"/><path d="M${x},${y + 30}v80" stroke="#ffc870" stroke-width="5" opacity=".35"/><ellipse cx="${x}" cy="${y}" rx="60" ry="50" fill="${S.rad([[0, '#ffc870', 0.35], [1, '#ffc870', 0]])}"/>`);
  vignette(S, 0.55, 0.55);
  return S.out();
}
function seaSky() {
  const S = new Scene('sbDsSky', '龙眠港的外海与天空：黑沉沉的海上堆着高耸的云，远远的下方是皇朝舰队的帆，一条长长的锁链从云里垂下来', 27401);
  const R = rng(27402);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#2a3446'], [0.5, '#6a7488'], [1, '#3a4a5a']])}"/>`);
  // cloud towers
  for (let k = 0; k < 4; k++) {
    let c = ''; const cx = 200 + k * 400 + R.range(-60, 60);
    for (let j = 0; j < 9; j++) c += ell(cx + R.range(-120, 120), 120 + j * 50 + R.range(-20, 20), R.range(90, 170), R.range(50, 80));
    S.add(`<path d="${c}" fill="${mix('#d8dce4', '#5a6474', k * 0.15)}" opacity=".85" filter="${S.blur(2)}"/>`);
  }
  // the sea far below
  S.add(`<path d="M0,700H${W}V${H}H0Z" fill="${S.lin([[0, '#2a3a4a'], [1, '#0e161e']])}"/>`);
  // the fleet's sails
  let sails = ''; for (let k = 0; k < 12; k++) { const x = R.range(200, 1400), y = R.range(720, 820), s = 0.5 + (y - 720) / 200; sails += `M${f1(x)},${f1(y)}l${f1(10 * s)},${f1(-36 * s)}l${f1(10 * s)},${f1(36 * s)}zM${f1(x - 8 * s)},${f1(y)}h${f1(36 * s)}l-6,${f1(8 * s)}h${f1(-24 * s)}z`; }
  S.add(`<path d="${sails}" fill="#d8d0c0" opacity=".8"/>`);
  // the chain hanging from the clouds
  let ch = ''; for (let y = 0; y < 640; y += 26) { const x = 980 + Math.sin(y / 120) * 30; ch += ell(x, y, 9, 15); }
  S.add(`<path d="${ch}" fill="none" stroke="#3a3a40" stroke-width="5"/>`);
  vignette(S, 0.45);
  return S.out();
}
function reef() {
  const S = new Scene('sbDsReef', '龙眠港外海的礁石：海浪冲刷的黑色礁石，一个巨大的龙形横躺在礁石上，雾气', 27501);
  const R = rng(27502);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#8a98a4'], [0.6, '#c0c8cc'], [1, '#6a7880']])}"/>`);
  sea(S, R, 560, '#4a5a66', '#1a242c', '#e8f0f4');
  // the dragon's shape lying across the rocks
  S.add(`<path d="M200,620Q420,460 700,520Q900,560 1100,480Q1300,420 1440,520Q1360,560 1200,560Q1000,600 800,640Q500,700 200,620Z" fill="#1a1a22"/>`);
  S.add(`<path d="M1100,480l60,-90l20,80M1240,450l50,-70l10,70" fill="#1a1a22"/><path d="M700,520l-80,-140l160,90z" fill="#22222c"/>`);
  S.add(`<path d="M1380,500q30,-10 50,8" stroke="#8a2a2a" stroke-width="3" fill="none"/>`);
  // black rocks and surf
  let rk = ''; for (let k = 0; k < 14; k++) { const x = R.range(0, W), y = R.range(620, 860), w = R.range(60, 180); rk += `M${f1(x)},${f1(y)}l${f1(w * 0.3)},${f1(-R.range(30, 80))}l${f1(w * 0.5)},${f1(R.range(-10, 20))}l${f1(w * 0.2)},${f1(R.range(30, 70))}z`; }
  S.add(`<path d="${rk}" fill="#14161a"/>`);
  { let fo = ''; for (let k = 0; k < 20; k++) fo += ell(R.range(0, W), R.range(630, 880), R.range(30, 80), R.range(5, 10)); S.add(`<path d="${fo}" fill="#f0f4f6" opacity=".6"/>`); }
  { let mi = ''; for (let k = 0; k < 8; k++) mi += ell(R.range(0, W), R.range(380, 600), R.range(160, 320), R.range(30, 60)); S.add(`<path d="${mi}" fill="#e0e6ea" opacity=".45" filter="${S.blur(3)}"/>`); }
  vignette(S, 0.45);
  return S.out();
}
function graves() {
  const S = new Scene('sbDsGraves', '龙眠港·海边的墓地：海上方长着草的山坡上一排一排矮矮的墓石，灰色的天', 27601);
  const R = rng(27602);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#8a9098'], [1, '#b8bcc0']])}"/>`);
  sea(S, R, 420, '#6a7a86', '#4a5a66', '#e8f0f4');
  S.add(`<path d="M0,520Q500,440 1000,500Q1300,540 ${W},500V${H}H0Z" fill="${S.lin([[0, '#6a7a5a'], [1, '#3a4a32']])}"/>`);
  for (let row = 0; row < 4; row++) {
    let st = ''; const y = 560 + row * 80, s = 0.6 + row * 0.25;
    for (let x = 80 + row * 20; x < W; x += 120 * s + R.range(-10, 10)) st += `M${f1(x)},${f1(y)}v${f1(-50 * s)}q${f1(20 * s)},${f1(-16 * s)} ${f1(40 * s)},0v${f1(50 * s)}z`;
    S.add(`<path d="${st}" fill="${mix('#a8a8a0', '#6a6a64', row * 0.2)}"/>`);
  }
  { let gr = ''; for (let k = 0; k < 120; k++) { const x = R.range(0, W), y = R.range(540, 890); gr += `M${f1(x)},${f1(y)}l${f1(R.range(-4, 4))},${f1(-R.range(8, 18))}`; } S.add(`<path d="${gr}" stroke="#4a5a3a" stroke-width="2"/>`); }
  vignette(S, 0.4);
  return S.out();
}
function memoryHall() {
  const S = new Scene('sbDsHall', '龙眠港·记忆馆前：长长的石砌门面，高高的门，台阶，刻着的鳞片，黄昏', 27701);
  const R = rng(27702);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#4a3a5a'], [0.5, '#c88a6a'], [1, '#e8b88a']])}"/>`);
  S.add(`<path d="M160,680V200H1440V680z" fill="#a8a094"/><path d="M120,200h1360l-80,-80H200z" fill="#8a8274"/>`);
  for (let x = 220; x < 1440; x += 160) S.add(`<path d="M${x},680V230h44v450z" fill="#bab2a4"/>`);
  { let sc = ''; for (let y = 140; y < 196; y += 14) for (let x = 220; x < 1380; x += 28) sc += `M${x + ((y / 14) % 2) * 14},${y}q14,12 28,0`; S.add(`<path d="${sc}" stroke="#6a6458" stroke-width="2" fill="none"/>`); }
  S.add(`<path d="M680,680V380q120,-90 240,0V680z" fill="#3a3028"/><path d="M800,320V680" stroke="#2a2018" stroke-width="6"/>`);
  for (let k = 0; k < 6; k++) S.add(`<path d="M${240 - k * 30},${680 + k * 30}H${1360 + k * 30}v30H${240 - k * 30}z" fill="${mix('#9a9284', '#6a6458', k * 0.12)}"/>`);
  vignette(S, 0.45);
  return S.out();
}

export const dragonsleepBgs = {
  'dragonsleep-harbor-far': () => harborFar(),
  'dragonsleep-council': () => council(),
  'dragonsleep-camp-night': () => campNight(),
  'dragonsleep-sea-sky': () => seaSky(),
  'dragonsleep-reef': () => reef(),
  'dragonsleep-graves': () => graves(),
  'dragonsleep-memory-hall': () => memoryHall(),
};
