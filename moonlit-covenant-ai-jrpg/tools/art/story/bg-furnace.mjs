// 衡炉城 — chapter 26 (script 26 美術需求, nine backgrounds):
//   furnace-city-far        — Furnace City from the rail line: chimneys and furnace towers, rail viaducts on arches, copper
//                             domes, an amber smoke haze.
//   furnace-council         — the council chamber: a semicircle of tiered brass benches, a great balance scale on the dais,
//                             tall windows full of smoke-light.
//   furnace-camp-night      — the camp outside the city at night: tents, a fire, the city's furnace glow on the horizon.
//   furnace-zero            — Furnace Zero: a cavernous foundry hall, a giant cold furnace mouth, chains and gantries, a
//                             bundle of a hundred mechanical arms hanging from the dark, papers fluttering.
//   furnace-secret-workshop — the secret workshop under Furnace Zero: a cramped room of workbenches, drawings pinned to the
//                             walls, a single lamp, a cot.
//   furnace-debt-vault      — before the debt vault: a squat iron-bound vault door in a stone facade, ledger-clerks' lamps,
//                             a paved square.
//   furnace-workshop-night  — Mia's temporary workshop at night: a lathe, coils and tools, a lamp, a door with a heavy lock.
//   furnace-street-night    — the street-mouth in the workers' quarter at night: narrow brick houses, a gas lamp, cobbles.
//   furnace-rail-night      — the front of a rail engine at night: the headlamp, the long track running into the dark.
// No text anywhere.
import { Scene, W, H, f, rng, mix } from './lib.mjs';

const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;
const rect = (x, y, w, h) => `M${f1(x)},${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}z`;

function skyline(S, R, base, col, glow) {
  let d = '';
  for (let x = 0; x < W; x += R.range(50, 110)) d += rect(x, base - R.range(60, 200), R.range(40, 90), 400);
  for (let k = 0; k < 9; k++) { const x = R.range(40, W - 40); d += rect(x, base - R.range(240, 360), R.range(14, 24), 400); }
  S.add(`<path d="${d}" fill="${col}"/>`);
  if (glow) { let w = ''; for (let k = 0; k < 40; k++) w += rect(R.range(0, W), base - R.range(20, 180), 6, 8); S.add(`<path d="${w}" fill="${glow}" opacity=".8"/>`); }
}
function smoke(S, R, n, x0, x1, y0, y1, col, op) {
  let sm = ''; for (let k = 0; k < n; k++) sm += ell(R.range(x0, x1), R.range(y0, y1), R.range(60, 160), R.range(30, 70));
  S.add(`<path d="${sm}" fill="${col}" opacity="${op}" filter="${S.blur(3)}"/>`);
}
function vignette(S, a = 0.5, cy = 0.5) { S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', a * 0.3], [1, '#000', a]], `cx="0.5" cy="${cy}" r="0.75"`)}"/>`); }

function cityFar() {
  const S = new Scene('sbFcFar', '衡炉城远景：烟囱与炉塔，架在拱桥上的魔轨高架，铜色的圆顶，琥珀色的烟雾', 26101);
  const R = rng(26102);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#6a5038'], [0.55, '#c8904a'], [1, '#e8b870']])}"/>`);
  skyline(S, R, 560, '#4a3a2e', null);
  S.add(`<path d="${ell(560, 430, 70, 50)}${ell(1040, 450, 56, 40)}" fill="#a8683a"/>`);
  smoke(S, R, 9, 100, 1500, 120, 360, '#5a4030', 0.45);
  // the rail viaduct on arches across the foreground
  let arch = `M0,640H${W}v26H0z`;
  for (let x = 0; x < W; x += 120) arch += `M${x},666h120v160h-20q-40,-90 -80,0h-20z`;
  S.add(`<path d="${arch}" fill="#3a2a20"/><path d="M0,636H${W}" stroke="#8a6a4a" stroke-width="4"/>`);
  S.add(`<path d="M0,826H${W}V${H}H0Z" fill="#2a1e16"/>`);
  vignette(S, 0.4);
  return S.out();
}
function council() {
  const S = new Scene('sbFcCouncil', '衡炉城议会：半圆形层层的黄铜长椅，台上一座巨大的天平，高窗里透进烟色的光', 26201);
  const R = rng(26202);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#2a2018'], [1, '#4a3626']])}"/>`);
  for (const x of [180, 520, 1080, 1420]) S.add(`<path d="M${x - 70},120h140v360h-140z" fill="${S.lin([[0, '#c8a070'], [1, '#806040']])}" opacity=".7"/><path d="M${x},120v360M${x - 70},300h140" stroke="#2a2018" stroke-width="6"/>`);
  // tiered brass benches
  for (let k = 0; k < 4; k++) S.add(`<path d="M${80 + k * 60},${560 + k * 70}Q800,${470 + k * 70} ${1520 - k * 60},${560 + k * 70}v26Q800,${496 + k * 70} ${80 + k * 60},${586 + k * 70}z" fill="${mix('#b08840', '#3a2a1a', k * 0.18)}"/>`);
  // the dais and scale
  S.add(`<path d="M640,560h320v-40H640z" fill="#5a4430"/><path d="M800,520V250" stroke="#d8b050" stroke-width="10"/><path d="M640,270H960" stroke="#d8b050" stroke-width="8"/>`);
  S.add(`<path d="M640,270l-40,110h80zM960,270l-40,110h80z" fill="none" stroke="#d8b050" stroke-width="3"/><path d="M590,380h100l-10,14h-80zM910,380h100l-10,14h-80z" fill="#d8b050"/><path d="${ell(800, 246, 16, 16)}" fill="#f0d070"/>`);
  S.add(`<ellipse cx="800" cy="300" rx="300" ry="220" fill="${S.rad([[0, '#ffd080', 0.18], [1, '#ffd080', 0]])}"/>`);
  vignette(S, 0.55);
  return S.out();
}
function campNight() {
  const S = new Scene('sbFcCamp', '衡炉城外的营地·夜：帐篷，营火，地平线上城里炉火的红光', 26301);
  const R = rng(26302);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#0a0808'], [0.55, '#2a1810'], [0.62, '#5a2a14'], [1, '#140c08']])}"/>`);
  skyline(S, R, 520, '#1a120e', '#ff9a40');
  S.add(`<ellipse cx="800" cy="500" rx="900" ry="90" fill="${S.rad([[0, '#ff7a30', 0.35], [1, '#ff7a30', 0]])}"/>`);
  S.add(`<path d="M0,560H${W}V${H}H0Z" fill="${S.lin([[0, '#2a1c14'], [1, '#100a06']])}"/>`);
  for (const [x, w, h] of [[80, 240, 180], [1240, 220, 170], [1460, 140, 110], [420, 160, 120]]) S.add(`<path d="M${x},720L${x + w / 2},${720 - h}L${x + w},720Z" fill="#3a2c22"/><path d="M${x + w / 2},${720 - h}L${x + w / 2 + 12},720H${x + w / 2 - 12}Z" fill="#120c08"/>`);
  S.add(`<ellipse cx="820" cy="760" rx="300" ry="120" fill="${S.rad([[0, '#ffb060', 0.45], [1, '#ffb060', 0]])}"/><path d="M790,780l30,-70l30,70zM804,780l16,-40l16,40z" fill="#ff9a40"/><path d="M770,786h100" stroke="#3a2416" stroke-width="8"/>`);
  vignette(S, 0.55, 0.6);
  return S.out();
}
function zero() {
  const S = new Scene('sbFcZero', '零号衡炉：空洞的铸造大厅，一座巨大的冷炉口，锁链与吊架，黑暗里垂下一大束机械手臂，纸片飘着', 26401);
  const R = rng(26402);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#0e0c0a'], [0.6, '#2a2018'], [1, '#1a140e']])}"/>`);
  // the furnace mouth
  S.add(`<path d="M520,760V380q280,-200 560,0V760z" fill="#2a2420"/><path d="M600,760V420q200,-140 400,0V760z" fill="#0a0806"/><path d="M520,380q280,-200 560,0" fill="none" stroke="#5a4a3a" stroke-width="16"/>`);
  // gantries and chains
  S.add(`<path d="M0,180H${W}M0,200H${W}" stroke="#3a3028" stroke-width="10"/><path d="M200,200V60M1400,200V60" stroke="#3a3028" stroke-width="14"/>`);
  { let c = ''; for (const x of [260, 420, 1180, 1340]) { const len = R.range(160, 380); for (let y = 200; y < 200 + len; y += 14) c += ell(x, y, 4, 7); } S.add(`<path d="${c}" fill="none" stroke="#6a5a48" stroke-width="2"/>`); }
  // the hundred arms hanging from the dark, papers in the hands
  let arms = '', paper = '';
  for (let k = 0; k < 34; k++) {
    const a = -Math.PI / 2 + R.range(-1.2, 1.2), len = R.range(160, 340), x0 = 800 + R.range(-40, 40), y0 = 60;
    const xm = x0 + Math.cos(a + Math.PI) * -len * 0.5 + R.range(-40, 40), ym = y0 + len * 0.6, x1 = xm + R.range(-80, 80), y1 = ym + R.range(40, 120);
    arms += `M${f1(x0)},${f1(y0)}L${f1(xm)},${f1(ym)}L${f1(x1)},${f1(y1)}`;
    if (k % 2) paper += `M${f1(x1 - 8)},${f1(y1)}l16,-4l4,20l-16,4z`;
  }
  S.add(`<path d="${arms}" stroke="#7a6a50" stroke-width="7" fill="none" stroke-linecap="round" opacity=".85"/><path d="${arms}" stroke="#b8a070" stroke-width="2" fill="none" opacity=".5"/>`);
  S.add(`<path d="${paper}" fill="#e8dcc0" opacity=".9"/>`);
  { let fl = ''; for (let k = 0; k < 16; k++) { const x = R.range(200, 1400), y = R.range(300, 800); fl += `M${f1(x)},${f1(y)}l${f1(R.range(10, 18))},${f1(R.range(-6, 6))}l2,12l-14,2z`; } S.add(`<path d="${fl}" fill="#d8ccb0" opacity=".6"/>`); }
  S.add(`<path d="M0,760H${W}V${H}H0Z" fill="#14100c"/>`);
  S.add(`<ellipse cx="800" cy="300" rx="320" ry="260" fill="${S.rad([[0, '#ffc870', 0.15], [1, '#ffc870', 0]])}"/>`);
  vignette(S, 0.6);
  return S.out();
}
function secretWorkshop() {
  const S = new Scene('sbFcSecret', '零号衡炉底下的秘密工坊：窄小的房间，工作台，墙上钉满图纸，一盏灯，一张行军床', 26501);
  const R = rng(26502);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#1a1410'], [1, '#2a2018']])}"/>`);
  S.add(`<path d="M0,0H${W}V620H0Z" fill="#3a2e24"/>`);
  { let pg = ''; for (let k = 0; k < 26; k++) { const x = R.range(60, 1500), y = R.range(60, 480); pg += rect(x, y, R.range(60, 110), R.range(70, 120)); } S.add(`<path d="${pg}" fill="#d8ccaa" opacity=".75" stroke="#8a7a5a" stroke-width="2"/>`); }
  { let ln = ''; for (let k = 0; k < 40; k++) { const x = R.range(60, 1500), y = R.range(80, 560); ln += `M${f1(x)},${f1(y)}h${f1(R.range(20, 60))}`; } S.add(`<path d="${ln}" stroke="#4a3a2a" stroke-width="2" opacity=".6"/>`); }
  S.add(`<path d="M0,620H${W}V${H}H0Z" fill="#20180f"/>`);
  S.add(`<path d="M300,620h700v30H300zM330,650h20v160h-20zM950,650h20v160h-20z" fill="#5a4430"/><path d="M420,600h140v20H420zM640,590l60,-30l40,30z" fill="#8a7a6a"/>`);
  S.add(`<path d="M1120,700h380v40h-380zM1130,740v80M1490,740v80" fill="#3a3028" stroke="#3a3028" stroke-width="10"/><path d="M1130,690h360v14h-360z" fill="#6a6a5a"/>`);
  S.add(`<path d="M760,300V420" stroke="#2a2018" stroke-width="3"/><path d="M730,420h60l-10,30h-40z" fill="#c89040"/><ellipse cx="760" cy="470" rx="420" ry="300" fill="${S.rad([[0, '#ffd080', 0.35], [1, '#ffd080', 0]])}"/>`);
  vignette(S, 0.6);
  return S.out();
}
function debtVault() {
  const S = new Scene('sbFcVault', '衡炉城·债库前：石砌门面里一扇矮壮的铁箍门，账房的灯，铺石的广场', 26601);
  const R = rng(26602);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#3a3038'], [1, '#6a5a52']])}"/>`);
  S.add(`<path d="M200,700V160H1400V700z" fill="#7a6a5e"/><path d="M200,160h1200v-40H200z" fill="#6a5a50"/>`);
  for (const x of [260, 420, 1180, 1340]) S.add(`<path d="M${x - 24},700V200h48V700z" fill="#8a7a6c"/>`);
  S.add(`<path d="M600,700V380h400V700z" fill="#3a3430"/><path d="M620,700V400h360V700z" fill="#5a5048" stroke="#2a2420" stroke-width="6"/>`);
  { let bd = ''; for (let y = 440; y < 700; y += 60) bd += `M620,${y}h360`; for (let x = 660; x < 980; x += 80) bd += `M${x},400v300`; S.add(`<path d="${bd}" stroke="#2a2420" stroke-width="8"/>`); }
  S.add(`<path d="${ell(800, 550, 46, 46)}" fill="none" stroke="#a89060" stroke-width="10"/><path d="M800,504v92M754,550h92" stroke="#a89060" stroke-width="6"/>`);
  for (const x of [500, 1100]) S.add(`<path d="M${x},700V460" stroke="#2a2420" stroke-width="6"/><path d="M${x - 16},440h32v30h-32z" fill="#ffc870"/><ellipse cx="${x}" cy="456" rx="90" ry="90" fill="${S.rad([[0, '#ffc870', 0.4], [1, '#ffc870', 0]])}"/>`);
  { let cb = `M0,700H${W}V${H}H0Z`; S.add(`<path d="${cb}" fill="#4a4038"/>`); let ln = ''; for (let k = 0; k < 8; k++) ln += `M0,${720 + k * 24}H${W}`; S.add(`<path d="${ln}" stroke="#3a3028" stroke-width="2"/>`); }
  vignette(S, 0.5);
  return S.out();
}
function miaWorkshop() {
  const S = new Scene('sbFcMiaWs', '衡炉城·米娅的临时工坊·夜：一台车床，线圈与工具，一盏灯，一扇挂着沉重门锁的门', 26701);
  const R = rng(26702);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#100c0a'], [1, '#2a2018']])}"/>`);
  S.add(`<path d="M0,0H${W}V640H0Z" fill="#2a221c"/>`);
  // the door with the lock (right)
  S.add(`<path d="M1180,640V180h260v460z" fill="#4a3826" stroke="#1a120c" stroke-width="10"/><path d="M1200,300h220M1200,460h220" stroke="#2a1e14" stroke-width="10"/>`);
  S.add(`<path d="M1190,380h50v70h-50z" fill="#8a8070"/><path d="M1200,380v-24q15,-24 30,0v24" fill="none" stroke="#8a8070" stroke-width="7"/>`);
  // tool wall
  { let t = ''; for (let k = 0; k < 14; k++) { const x = 120 + k * 60; t += `M${x},140v${f1(R.range(70, 140))}`; } S.add(`<path d="${t}" stroke="#8a8a80" stroke-width="6" stroke-linecap="round"/>`); }
  // coils
  { let c = ''; for (let k = 0; k < 7; k++) c += ell(300 + k * 22, 540, 30, 44); S.add(`<path d="${c}" fill="none" stroke="#c8784a" stroke-width="5"/>`); }
  S.add(`<path d="M0,640H${W}V${H}H0Z" fill="#1a140e"/>`);
  // lathe on bench
  S.add(`<path d="M520,640h520v26H520zM540,666h20v150h-20zM1000,666h20v150h-20z" fill="#5a4430"/><path d="M600,560h220v80H600zM820,590h140v24H820z" fill="#6a6a62"/><path d="${ell(640, 600, 30, 30)}" fill="#4a4a44"/>`);
  S.add(`<path d="M780,260V380" stroke="#2a2018" stroke-width="3"/><path d="M750,380h60l-10,30h-40z" fill="#c89040"/><ellipse cx="780" cy="440" rx="420" ry="280" fill="${S.rad([[0, '#ffd080', 0.35], [1, '#ffd080', 0]])}"/>`);
  vignette(S, 0.6);
  return S.out();
}
function streetNight() {
  const S = new Scene('sbFcStreet', '衡炉城·工人区的街口·夜：窄窄的砖房，一盏煤气灯，石子路', 26801);
  const R = rng(26802);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#0a0a10'], [1, '#2a2020']])}"/>`);
  // houses converging to a far point
  S.add(`<path d="M0,0H520L700,420L700,560L0,${H}Z" fill="#3a2620"/><path d="M${W},0H1080L900,420L900,560L${W},${H}Z" fill="#32221c"/>`);
  { let br = ''; for (let k = 0; k < 18; k++) { const y = 40 + k * 48; br += `M0,${y}L${f1(520 + (700 - 520) * (y / 900))},${f1(y * 0.9)}M${W},${y}L${f1(1080 - (1080 - 900) * (y / 900))},${f1(y * 0.9)}`; } S.add(`<path d="${br}" stroke="#2a1a14" stroke-width="2" opacity=".7"/>`); }
  { let win = ''; for (const [x, y] of [[120, 200], [300, 260], [460, 330], [1400, 210], [1240, 280], [1110, 340]]) win += rect(x, y, 50, 70); S.add(`<path d="${win}" fill="#ffb860" opacity=".7"/>`); }
  S.add(`<path d="M700,560H900L${W},${H}H0Z" fill="#3a3430"/>`);
  { let cb = ''; for (let k = 0; k < 60; k++) { const y = R.range(580, 890), sp = (y - 560) / 340; cb += ell(800 + R.range(-1, 1) * (100 + sp * 700), y, 10 + sp * 18, 4 + sp * 6); } S.add(`<path d="${cb}" fill="#4a4440" opacity=".8"/>`); }
  // the gas lamp
  S.add(`<path d="M560,860V380" stroke="#1a1a1a" stroke-width="10"/><path d="M536,340h48l-6,46h-36z" fill="#ffd890"/><ellipse cx="560" cy="380" rx="220" ry="260" fill="${S.rad([[0, '#ffd890', 0.4], [1, '#ffd890', 0]])}"/>`);
  vignette(S, 0.55);
  return S.out();
}
function railNight() {
  const S = new Scene('sbFcRail', '魔轨的车头·夜：车头的大灯，一条长长的铁轨伸进黑暗里', 26901);
  const R = rng(26902);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#06080e'], [0.6, '#141820'], [1, '#0a0a0c']])}"/>`);
  { let st = ''; for (let k = 0; k < 70; k++) { const r = R.range(0.8, 1.8); st += ell(R.range(0, W), R.range(0, 380), r, r); } S.add(`<path d="${st}" fill="#dfe6ff" opacity=".7"/>`); }
  S.add(`<path d="M0,470H${W}V${H}H0Z" fill="#14120e"/>`);
  // the track running to the vanishing point
  S.add(`<path d="M800,470L560,${H}M800,470L1040,${H}" stroke="#8a8478" stroke-width="6"/>`);
  { let sl = ''; for (let k = 0; k < 16; k++) { const t = Math.pow(k / 15, 2), y = 470 + t * 430, w = 30 + t * 620; sl += `M${f1(800 - w / 2)},${f1(y)}h${f1(w)}`; } S.add(`<path d="${sl}" stroke="#3a3026" stroke-width="${8}"/>`); }
  // the headlamp beam and the engine front edges
  S.add(`<path d="M800,${H}L640,470H960Z" fill="${S.lin([[0, '#fff0c0', 0.05], [1, '#fff0c0', 0.3]])}"/>`);
  S.add(`<path d="M0,${H}V600L240,560V${H}zM${W},${H}V600L1360,560V${H}z" fill="#2a2a2c"/><path d="M240,560L240,${H}M1360,560L1360,${H}" stroke="#5a5a5c" stroke-width="6"/>`);
  S.add(`<ellipse cx="800" cy="760" rx="140" ry="90" fill="${S.rad([[0, '#fff4d0', 0.5], [1, '#fff4d0', 0]])}"/>`);
  vignette(S, 0.5);
  return S.out();
}

export const furnaceBgs = {
  'furnace-city-far': () => cityFar(),
  'furnace-council': () => council(),
  'furnace-camp-night': () => campNight(),
  'furnace-zero': () => zero(),
  'furnace-secret-workshop': () => secretWorkshop(),
  'furnace-debt-vault': () => debtVault(),
  'furnace-workshop-night': () => miaWorkshop(),
  'furnace-street-night': () => streetNight(),
  'furnace-rail-night': () => railNight(),
};
