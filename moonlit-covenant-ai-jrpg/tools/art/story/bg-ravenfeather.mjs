// 鸦羽城与无眠镜宫 — chapter 28 (script 28 美術需求, nine backgrounds):
//   ravenfeather-city-far        — Ravenfeather from the road: a dark city of steep slate roofs and thin spires under a violet
//                                  dusk, ravens over it, a tall bell tower.
//   ravenfeather-gate            — the city gate: black stone, a raven carved over the arch, mirrors set into the gate towers.
//   ravenfeather-camp-night      — the camp at night: tents, and every mirror covered with cloth on stands.
//   sleepless-mirror-palace      — the Sleepless Mirror Palace: an endless hall of tall mirrors reflecting each other into the dark.
//   heras-nest                   — deep in the mirror web, Heras's nest: a cavern of broken mirror shards woven into a great nest
//                                  with black feathers.
//   ravenfeather-council-hall    — the Seven Seats' hall: a long table with seven high-backed chairs, one mirror on the wall.
//   sleepless-mirror-last        — the palace's deepest chamber: a single standing mirror in a round dark room, a pale light in it.
//   ravenfeather-belltower-night — under the bell tower at night: the tower rising into the dark, a bell, a square of wet cobbles.
//   road-to-white-tower-dawn     — the great road to the White Tower at dawn: a straight road over plains, the white tower far off.
// No text anywhere.
import { Scene, W, H, f, rng, mix } from './lib.mjs';

const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;
const rect = (x, y, w, h) => `M${f1(x)},${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}z`;
function vignette(S, a = 0.5, cy = 0.5) { S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', a * 0.3], [1, '#000', a]], `cx="0.5" cy="${cy}" r="0.75"`)}"/>`); }
function stars(S, R, n, y1) { let d = ''; for (let k = 0; k < n; k++) { const r = R.range(0.8, 1.8); d += ell(R.range(0, W), R.range(0, y1), r, r); } S.add(`<path d="${d}" fill="#e0e0ff" opacity=".7"/>`); }
function ravens(S, R, n, y0, y1, col) {
  let d = ''; for (let k = 0; k < n; k++) { const x = R.range(100, W - 100), y = R.range(y0, y1), s = R.range(6, 14); d += `M${f1(x - s)},${f1(y)}q${f1(s * 0.5)},${f1(-s * 0.6)} ${f1(s)},0q${f1(s * 0.5)},${f1(-s * 0.6)} ${f1(s)},0`; }
  S.add(`<path d="${d}" stroke="${col}" stroke-width="2.4" fill="none"/>`);
}
function mirror(x, y, w, h) { return `M${f1(x)},${f1(y + h)}V${f1(y + w / 2)}a${f1(w / 2)},${f1(w / 2)} 0 0 1 ${f1(w)},0V${f1(y + h)}z`; }

function cityFar() {
  const S = new Scene('sbRfFar', '鸦羽城远景：紫色黄昏下，陡峭石板屋顶和细尖塔的黑色城市，城上飞着乌鸦，一座高高的钟楼', 28101);
  const R = rng(28102);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#2a1e3a'], [0.6, '#7a5a7a'], [1, '#c89a8a']])}"/>`);
  let roofs = '';
  for (let x = 120; x < 1480; x += R.range(40, 80)) { const h = R.range(60, 160), w = R.range(36, 70); roofs += `M${f1(x)},560V${f1(560 - h)}l${f1(w / 2)},${f1(-h * 0.5)}l${f1(w / 2)},${f1(h * 0.5)}V560z`; }
  for (let k = 0; k < 8; k++) { const x = R.range(200, 1400); roofs += `M${f1(x)},560V${f1(R.range(260, 340))}l8,-90l8,90V560z`; }
  roofs += 'M960,560V200h40l-20,-120l-20,120h40V560z';
  S.add(`<path d="${roofs}" fill="#1a1222"/>`);
  { let w = ''; for (let k = 0; k < 30; k++) w += rect(R.range(140, 1460), R.range(420, 550), 5, 8); S.add(`<path d="${w}" fill="#ffc870" opacity=".7"/>`); }
  ravens(S, R, 24, 80, 300, '#140c18');
  S.add(`<path d="M0,560Q800,540 ${W},560V${H}H0Z" fill="${S.lin([[0, '#2a2028'], [1, '#100a10']])}"/>`);
  vignette(S, 0.45);
  return S.out();
}
function gate() {
  const S = new Scene('sbRfGate', '鸦羽城·城门：黑石，拱上刻着一只乌鸦，门楼上嵌着镜子', 28201);
  const R = rng(28202);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#3a3046'], [1, '#6a5a6a']])}"/>`);
  S.add(`<path d="M200,${H}V160H600V${H}zM1000,${H}V160H1400V${H}z" fill="#2a2430"/><path d="M600,${H}V300H1000V${H}z" fill="#221c28"/>`);
  S.add(`<path d="M660,${H}V520q140,-160 280,0V${H}z" fill="#0c0a10"/><path d="M660,520q140,-160 280,0" fill="none" stroke="#3a3440" stroke-width="12"/>`);
  S.add(`<path d="M760,360q40,-40 80,0q-20,-10 -40,10q-20,-20 -40,-10zM790,350l10,-24l10,24" fill="#4a4250"/>`);
  for (const [x, y] of [[330, 260], [470, 260], [1130, 260], [1270, 260]]) S.add(`<path d="${mirror(x - 40, y, 80, 140)}" fill="${S.lin([[0, '#b8b0d0'], [1, '#5a5070']])}" stroke="#8a8090" stroke-width="5"/>`);
  { let m = ''; for (const x0 of [200, 1000]) for (let x = x0; x < x0 + 400; x += 60) m += `M${x},160v-36h40v36`; S.add(`<path d="${m}" fill="#2a2430"/>`); }
  S.add(`<path d="M0,820H${W}V${H}H0Z" fill="#3a3238"/>`);
  vignette(S, 0.5);
  return S.out();
}
function campNight() {
  const S = new Scene('sbRfCamp', '鸦羽城外的营地·夜：帐篷，架子上每一面镜子都盖着布', 28301);
  const R = rng(28302);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#08060e'], [0.6, '#1e1628'], [1, '#100c14']])}"/>`);
  stars(S, R, 70, 380);
  S.add(`<path d="M0,560H${W}V${H}H0Z" fill="${S.lin([[0, '#241c26'], [1, '#0c080e']])}"/>`);
  for (const [x, w, h] of [[60, 240, 180], [1260, 230, 170], [480, 170, 130]]) S.add(`<path d="M${x},700L${x + w / 2},${700 - h}L${x + w},700Z" fill="#2e2634"/>`);
  // covered mirrors on stands
  for (const [x, s] of [[760, 1], [920, 0.9], [1080, 0.8]]) {
    S.add(`<path d="M${x},${780}v${-40 * s}M${x - 30 * s},780h${60 * s}" stroke="#3a2e28" stroke-width="${6 * s}"/>`);
    S.add(`<path d="M${x - 60 * s},${740 - 180 * s}q${60 * s},${-40 * s} ${120 * s},0l${10 * s},${190 * s}q${-70 * s},${20 * s} ${-140 * s},0z" fill="#5a4a5a"/><path d="M${x - 50 * s},${740 - 120 * s}q${50 * s},${12 * s} ${100 * s},0M${x - 54 * s},${740 - 60 * s}q${54 * s},${14 * s} ${108 * s},0" stroke="#3a2e3a" stroke-width="3" fill="none"/>`);
  }
  S.add(`<ellipse cx="300" cy="780" rx="220" ry="90" fill="${S.rad([[0, '#ffb060', 0.35], [1, '#ffb060', 0]])}"/><path d="M280,790l20,-50l20,50z" fill="#ff9a40"/>`);
  vignette(S, 0.55, 0.6);
  return S.out();
}
function mirrorPalace() {
  const S = new Scene('sbRfPalace', '无眠镜宫：一条没有尽头的大厅，高高的镜子互相映照，一路映进黑暗里', 28401);
  const R = rng(28402);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#0a0814'], [0.5, '#1e1a30'], [1, '#0a0810']])}"/>`);
  // receding pairs of mirrors on both sides
  for (let k = 9; k >= 0; k--) {
    const t = k / 9, sc = 1 - t * 0.85, xl = 800 - 700 * sc, xr = 800 + 700 * sc - 120 * sc, y = 450 - 380 * sc, w = 120 * sc, h = 640 * sc;
    const col = mix('#c8c0e8', '#2a2440', t);
    S.add(`<path d="${mirror(xl, y, w, h)}${mirror(xr, y, w, h)}" fill="${col}" opacity="${0.9 - t * 0.5}" stroke="#8a80a8" stroke-width="${f1(3 * sc + 1)}"/>`);
  }
  S.add(`<path d="M0,820L800,470L${W},820V${H}H0Z" fill="#14101e"/><path d="M800,470V${H}" stroke="#2a2440" stroke-width="2"/>`);
  { let fl = ''; for (let k = 1; k < 10; k++) { const y = 470 + Math.pow(k / 9, 2) * 430; fl += `M${f1(800 - (y - 470) * 2)},${f1(y)}H${f1(800 + (y - 470) * 2)}`; } S.add(`<path d="${fl}" stroke="#2a2440" stroke-width="2"/>`); }
  S.add(`<ellipse cx="800" cy="460" rx="120" ry="160" fill="${S.rad([[0, '#d8d0ff', 0.35], [1, '#d8d0ff', 0]])}"/>`);
  vignette(S, 0.55);
  return S.out();
}
function herasNest() {
  const S = new Scene('sbRfNest', '镜网深处·赫拉斯的巢：碎镜片织成的巨大鸟巢的洞穴，散落着黑色的羽毛', 28501);
  const R = rng(28502);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#06040a'], [1, '#1a1424']])}"/>`);
  // shards woven into a great bowl
  let sh = '';
  for (let k = 0; k < 140; k++) {
    const a = R.range(Math.PI * 0.05, Math.PI * 0.95), rr = R.range(260, 560), x = 800 + Math.cos(a) * rr * 1.3, y = 520 + Math.sin(a) * rr * 0.45, s = R.range(14, 40), r2 = R.range(0, 6.28);
    sh += `M${f1(x)},${f1(y)}l${f1(Math.cos(r2) * s)},${f1(Math.sin(r2) * s)}l${f1(Math.cos(r2 + 2) * s * 0.6)},${f1(Math.sin(r2 + 2) * s * 0.6)}z`;
  }
  S.add(`<path d="${sh}" fill="#8a84a8" opacity=".75" stroke="#c8c0e8" stroke-width="1"/>`);
  S.add(`<path d="M260,520Q800,760 1340,520Q1200,640 800,660Q400,640 260,520Z" fill="#1a1424"/>`);
  let fe = ''; for (let k = 0; k < 26; k++) { const x = R.range(120, 1480), y = R.range(560, 880), a = R.range(-0.6, 0.6), l = R.range(30, 70); fe += `M${f1(x)},${f1(y)}q${f1(l * 0.3)},${f1(-l * 0.2)} ${f1(Math.cos(a) * l)},${f1(Math.sin(a) * l)}q${f1(-l * 0.4)},${f1(l * 0.3)} ${f1(-Math.cos(a) * l)},${f1(-Math.sin(a) * l)}z`; }
  S.add(`<path d="${fe}" fill="#0c0a10"/>`);
  S.add(`<ellipse cx="800" cy="460" rx="360" ry="220" fill="${S.rad([[0, '#b8a8ff', 0.2], [1, '#b8a8ff', 0]])}"/>`);
  vignette(S, 0.6);
  return S.out();
}
function councilHall() {
  const S = new Scene('sbRfHall', '七议席的议厅：一张长桌，七张高背椅，墙上一面镜子', 28601);
  const R = rng(28602);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#1a1420'], [1, '#3a2e3a']])}"/>`);
  S.add(`<path d="${mirror(700, 100, 200, 300)}" fill="${S.lin([[0, '#a8a0c8'], [1, '#4a4260']])}" stroke="#c8a860" stroke-width="8"/>`);
  S.add(`<path d="M200,600L400,480H1200L1400,600Z" fill="#3a2418"/><path d="M200,600h1200v24H200z" fill="#2a1a10"/>`);
  for (let k = 0; k < 7; k++) {
    const t = k / 6, x = 260 + t * 1080, back = 230 - Math.abs(t - 0.5) * 40;
    S.add(`<path d="M${f1(x - 38)},${f1(600 + 40)}V${f1(600 - back)}q38,-30 76,0V${f1(600 + 40)}z" fill="#1a1016" stroke="#6a4a3a" stroke-width="3"/>`);
  }
  S.add(`<path d="M0,700H${W}V${H}H0Z" fill="#20181e"/>`);
  vignette(S, 0.55);
  return S.out();
}
function lastMirror() {
  const S = new Scene('sbRfLast', '无眠镜宫最深处：一间圆形的暗室里，只立着一面镜子，镜子里一点苍白的光', 28701);
  const R = rng(28702);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#1a1828'], [1, '#040308']], 'cx="0.5" cy="0.5" r="0.7"')}"/>`);
  S.add(`<path d="${ell(800, 820, 520, 80)}" fill="#120e18"/>`);
  S.add(`<path d="${mirror(660, 180, 280, 560)}" fill="${S.lin([[0, '#e8e4ff'], [0.5, '#8a84b0'], [1, '#2a2640']])}" stroke="#c8c0e0" stroke-width="10"/>`);
  S.add(`<ellipse cx="800" cy="420" rx="90" ry="140" fill="${S.rad([[0, '#ffffff', 0.6], [1, '#ffffff', 0]])}"/>`);
  S.add(`<path d="M640,740h320v30H640z" fill="#3a3448"/>`);
  vignette(S, 0.5);
  return S.out();
}
function bellTower() {
  const S = new Scene('sbRfBell', '鸦羽城·钟楼下·夜：钟楼升进黑暗里，一口钟，湿漉漉的石子广场', 28801);
  const R = rng(28802);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#06060c'], [1, '#1a1620']])}"/>`);
  stars(S, R, 50, 300);
  S.add(`<path d="M640,${H}V140h320V${H}z" fill="#1a1620"/><path d="M620,140l180,-130l180,130z" fill="#141018"/>`);
  S.add(`<path d="M700,380V240q100,-80 200,0V380z" fill="#0a080c"/><path d="M760,340q0,-70 40,-70q40,0 40,70h10v12h-100v-12z" fill="#8a7040"/>`);
  { let w = ''; for (let y = 460; y < 860; y += 120) w += rect(770, y, 60, 70); S.add(`<path d="${w}" fill="#0a080c"/>`); }
  S.add(`<path d="M0,760H${W}V${H}H0Z" fill="#2a2630"/>`);
  { let cb = ''; for (let k = 0; k < 70; k++) cb += ell(R.range(0, W), R.range(770, 895), R.range(10, 24), R.range(3, 6)); S.add(`<path d="${cb}" fill="#3a3640" opacity=".8"/>`); }
  S.add(`<path d="M300,860V560" stroke="#141014" stroke-width="8"/><path d="M282,520h36l-4,40h-28z" fill="#ffd890"/><ellipse cx="300" cy="560" rx="160" ry="200" fill="${S.rad([[0, '#ffd890', 0.35], [1, '#ffd890', 0]])}"/>`);
  vignette(S, 0.55);
  return S.out();
}
function roadDawn() {
  const S = new Scene('sbRfRoad', '往白塔的大道·黎明：一条笔直的大道穿过平原，远远的一座白塔', 28901);
  const R = rng(28902);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#5a6a8a'], [0.5, '#e8c8a8'], [1, '#f0dcc0']])}"/>`);
  S.add(`<path d="M786,470V250l14,-40l14,40V470z" fill="#f4f0e8"/><path d="M780,470h40v-14h-40z" fill="#d8d0c0"/>`);
  S.add(`<path d="M0,470H${W}V${H}H0Z" fill="${S.lin([[0, '#a8a070'], [1, '#6a6a40']])}"/>`);
  S.add(`<path d="M790,470L520,${H}H1080L810,470Z" fill="#c8b898"/><path d="M800,470V${H}" stroke="#a89878" stroke-width="3" stroke-dasharray="20 30"/>`);
  { let gr = ''; for (let k = 0; k < 100; k++) { const x = R.range(0, W), y = R.range(480, 890); if (Math.abs(x - 800) < (y - 470) * 0.7) continue; gr += `M${f1(x)},${f1(y)}l${f1(R.range(-3, 3))},${f1(-R.range(6, 14))}`; } S.add(`<path d="${gr}" stroke="#5a5a30" stroke-width="2"/>`); }
  S.add(`<ellipse cx="800" cy="460" rx="500" ry="120" fill="${S.rad([[0, '#fff0d0', 0.4], [1, '#fff0d0', 0]])}"/>`);
  vignette(S, 0.35);
  return S.out();
}

export const ravenfeatherBgs = {
  'ravenfeather-city-far': () => cityFar(),
  'ravenfeather-gate': () => gate(),
  'ravenfeather-camp-night': () => campNight(),
  'sleepless-mirror-palace': () => mirrorPalace(),
  'heras-nest': () => herasNest(),
  'ravenfeather-council-hall': () => councilHall(),
  'sleepless-mirror-last': () => lastMirror(),
  'ravenfeather-belltower-night': () => bellTower(),
  'road-to-white-tower-dawn': () => roadDawn(),
};
