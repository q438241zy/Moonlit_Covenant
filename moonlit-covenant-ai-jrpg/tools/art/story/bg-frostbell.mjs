// 霜铃城与冰库 — chapter 25 (script 25 美術需求):
//   frostbell-far        — Frostbell from the snowfield: a white plain, steam rising from hot springs, a glass ice-crystal
//                          greenhouse glinting, the city's towers, and a great dark hole yawning under the city.
//   frostbell-gate       — the city gate: a pale stone gate under hanging icicles and a bell on the arch, snow on the road.
//   frostbell-camp-night — the camp outside the city at night: tents under snow, a window of a hut with frost ferns on the glass
//                          lit from inside, cold blue stars.
//   ice-archive          — the ice vault under the city: rows and rows of people standing frozen in blocks of ice, burnt
//                          shelves, and at the centre a seated giant of frost with its eyes closed.
//   ice-archive-deep     — the deepest chamber: ledgers sealed in a wall of ice, a stone plinth holding the master book, and one
//                          block of old blue ice with a dim figure inside.
// No text anywhere.
import { Scene, W, H, f, rng, mix } from './lib.mjs';

const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;
const poly = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L') + 'Z';

function stars(S, R, n, y1) {
  let d = ''; for (let k = 0; k < n; k++) { const x = R.range(0, W), y = R.range(0, y1), r = R.range(0.8, 2); d += ell(x, y, r, r); }
  S.add(`<path d="${d}" fill="#dfe8ff" opacity=".8"/>`);
}
function farCity() {
  const S = new Scene('sbFbFar', '霜铃城远景：白色的雪原，温泉冒着白汽，冰晶温室闪着光，城里的尖塔，城底下张着一个黑黑的大洞', 25101);
  const R = rng(25102);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#9aaac0'], [0.55, '#d8e0ea'], [1, '#eef2f6']])}"/>`);
  S.add(`<path d="${poly([[0, 470], [240, 360], [460, 420], [700, 330], [980, 400], [1240, 320], [W, 420], [W, 520], [0, 520]])}" fill="#b8c4d4"/>`);
  // the city on a rise, towers
  S.add(`<path d="M520,520V420h560V520Z" fill="#8a96a8"/>`);
  let tw = '';
  for (const [x, w, h] of [[560, 40, 150], [640, 30, 110], [720, 50, 190], [820, 36, 130], [900, 46, 170], [990, 34, 120]]) tw += `M${x},420V${420 - h}l${w / 2},-40l${w / 2},40V420Z`;
  S.add(`<path d="${tw}" fill="#7a869a"/>`);
  // ice-crystal greenhouse
  S.add(`<path d="M1120,520l60,-90l60,90z" fill="#cfe6f4" opacity=".9"/><path d="M1180,430l-30,90M1180,430l30,90M1135,500h90" stroke="#ffffff" stroke-width="2" opacity=".8"/>`);
  // the great hole under the city
  S.add(`<path d="${ell(800, 600, 300, 70)}" fill="${S.rad([[0, '#0a0e18'], [0.7, '#1a2232'], [1, '#5a6a80']])}"/>`);
  S.add(`<path d="M0,560Q400,520 500,580Q800,680 1100,580Q1200,520 ${W},560V${H}H0Z" fill="${S.lin([[0, '#e8eef4'], [1, '#c8d2de']])}"/>`);
  // hot-spring steam
  let st = ''; for (let k = 0; k < 7; k++) st += ell(280 + k * 12, 520 - k * 30, 26 + k * 7, 16 + k * 5);
  for (let k = 0; k < 5; k++) st += ell(1360 + k * 10, 540 - k * 28, 22 + k * 6, 14 + k * 4);
  S.add(`<path d="${st}" fill="#ffffff" opacity=".55" filter="${S.blur(3)}"/>`);
  S.add(`<path d="${ell(290, 560, 70, 14)}${ell(1360, 580, 60, 12)}" fill="#7aa8c0" opacity=".8"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.75, '#000', 0.04], [1, '#000', 0.3]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}
function gate() {
  const S = new Scene('sbFbGate', '霜铃城·城门：苍白石砌的城门，挂满冰柱，拱顶上悬着一口铃，路上积着雪', 25201);
  const R = rng(25202);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#a8b4c4'], [1, '#dce4ec']])}"/>`);
  S.add(`<path d="M260,${H}V180H1340V${H}Z" fill="#b8c0cc"/><path d="M260,180h1080v-40H260z" fill="#a0a8b6"/>`);
  { let m = ''; for (let x = 260; x < 1340; x += 72) m += `M${x},140v-36h44v36`; S.add(`<path d="${m}" fill="#a0a8b6"/>`); }
  { let s = ''; for (let k = 0; k < 14; k++) { const y = 210 + k * 50; s += `M260,${y}H1340`; } S.add(`<path d="${s}" stroke="#a6aebb" stroke-width="2"/>`); }
  S.add(`<path d="M620,${H}V480q180,-200 360,0V${H}Z" fill="#2a3240"/><path d="M620,480q180,-200 360,0" fill="none" stroke="#8a94a4" stroke-width="10"/>`);
  // the bell
  S.add(`<path d="M800,300V330" stroke="#5a5040" stroke-width="4"/><path d="M770,390q0,-60 30,-60q30,0 30,60h8v10h-76v-10z" fill="#b08a40"/><path d="${ell(800, 404, 8, 8)}" fill="#8a6a30"/>`);
  // icicles along the arch and battlements
  let ic = '';
  for (let x = 270; x < 1330; x += R.range(16, 34)) ic += `M${f1(x)},180l7,${f1(R.range(20, 70))}l7,${f1(-R.range(20, 70))}z`;
  for (let k = 0; k < 18; k++) { const a = Math.PI * (k / 17); const x = 800 - Math.cos(a) * 180, y = 480 - Math.sin(a) * 130; ic += `M${f1(x - 5)},${f1(y)}l5,${f1(R.range(20, 46))}l5,${f1(-R.range(20, 46))}z`; }
  S.add(`<path d="${ic}" fill="#e8f4fc" opacity=".9"/>`);
  S.add(`<path d="M0,800Q800,760 ${W},800V${H}H0Z" fill="#f2f6f9"/><path d="M640,${H}L760,760H840L960,${H}Z" fill="#d8e0e8"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.7, '#000', 0.06], [1, '#000', 0.35]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}
function campNight() {
  const S = new Scene('sbFbCamp', '霜铃城外的营地·夜：积雪的帐篷，一间小屋的窗户里透出灯光，玻璃上结着蕨叶般的窗霜，冷蓝的星星', 25301);
  const R = rng(25302);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#060a16'], [0.6, '#141e34'], [1, '#22304a']])}"/>`);
  stars(S, R, 90, 420);
  S.add(`<path d="${poly([[0, 560], [300, 480], [620, 530], [1000, 470], [1340, 520], [W, 480], [W, 620], [0, 620]])}" fill="#1a2438"/>`);
  S.add(`<path d="M0,600H${W}V${H}H0Z" fill="${S.lin([[0, '#3a4a64'], [1, '#1a2234']])}"/>`);
  for (const [x, w, h] of [[60, 240, 170], [1200, 220, 160], [1420, 150, 110]]) S.add(`<path d="M${x},700L${x + w / 2},${700 - h}L${x + w},700Z" fill="#2a3448"/><path d="M${x + 20},${700 - h * 0.18}L${x + w / 2},${700 - h}L${x + w - 20},${700 - h * 0.18}" fill="none" stroke="#c8d4e4" stroke-width="10" opacity=".6"/>`);
  // the hut with a lit frosted window
  S.add(`<path d="M480,760V470L800,340L1120,470V760Z" fill="#2a2420"/><path d="M460,480L800,330L1140,480" fill="none" stroke="#d8e2ee" stroke-width="22" opacity=".8"/>`);
  S.add(`<rect x="660" y="520" width="280" height="200" fill="${S.rad([[0, '#ffd890'], [1, '#d8903a']])}"/>`);
  let fern = '';
  for (let k = 0; k < 16; k++) {
    const x0 = 660 + R.range(0, 280), y0 = k % 2 ? 720 : 520 + R.range(0, 200), ang = R.range(-2.6, -0.5), len = R.range(40, 110);
    const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len; fern += `M${f1(x0)},${f1(y0)}L${f1(x1)},${f1(y1)}`;
    for (let j = 1; j < 5; j++) { const t = j / 5, px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t; fern += `M${f1(px)},${f1(py)}l${f1(Math.cos(ang - 0.8) * 16)},${f1(Math.sin(ang - 0.8) * 16)}M${f1(px)},${f1(py)}l${f1(Math.cos(ang + 0.8) * 16)},${f1(Math.sin(ang + 0.8) * 16)}`; }
  }
  S.add(`<g clip-path="${S.clip('M660,520h280v200H660z')}"><path d="${fern}" stroke="#eef6ff" stroke-width="2.4" fill="none" opacity=".85"/></g>`);
  S.add(`<path d="M660,520h280v200H660zM800,520v200M660,620h280" fill="none" stroke="#1a140e" stroke-width="10"/>`);
  S.add(`<ellipse cx="800" cy="780" rx="360" ry="90" fill="${S.rad([[0, '#ffc870', 0.25], [1, '#ffc870', 0]])}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', 0.15], [1, '#000', 0.55]], 'cx="0.5" cy="0.6" r="0.75"')}"/>`);
  return S.out();
}
function vault() {
  const S = new Scene('sbIaVault', '冰库：一排一排冻在冰里的人，烧焦的架子，正中央坐着一个闭着眼睛的冰霜巨人', 25401);
  const R = rng(25402);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#0a1420'], [0.5, '#1a3046'], [1, '#0e1a26']])}"/>`);
  // cavern ribs
  S.add(`<path d="M0,0H${W}V120Q800,40 0,120Z" fill="#0a1018"/>`);
  // the seated giant at the centre
  S.add(`<path d="M560,720Q560,520 640,460Q620,360 680,300Q740,220 800,220Q860,220 920,300Q980,360 960,460Q1040,520 1040,720Z" fill="#9ac0d8" opacity=".9"/>`);
  S.add(`<path d="${ell(800, 300, 90, 100)}" fill="#b8d8ea"/><path d="M752,300q14,6 28,0M820,300q14,6 28,0" stroke="#4a6a84" stroke-width="4" fill="none" stroke-linecap="round"/>`);
  S.add(`<path d="M720,380q80,60 160,0l-10,120q-70,40 -140,0z" fill="#d8ecf6" opacity=".8"/><path d="M560,720l-40,-120l80,-60M1040,720l40,-120l-80,-60" stroke="#8ab0c8" stroke-width="36" fill="none" stroke-linecap="round"/>`);
  S.add(`<ellipse cx="800" cy="440" rx="320" ry="300" fill="${S.rad([[0, '#a0d8ff', 0.25], [1, '#a0d8ff', 0]])}"/>`);
  // rows of people frozen in blocks receding to both sides
  const rows = [[0.55, 640], [0.75, 700], [1, 780]];
  for (const [sc, base] of rows) {
    let blocks = '', figs = '';
    for (const side of [-1, 1]) {
      for (let k = 0; k < 4; k++) {
        const x = 800 + side * (300 + k * 150 * sc + (1 - sc) * 80), w = 80 * sc, h = 190 * sc;
        blocks += `M${f1(x - w / 2)},${f1(base)}v${f1(-h)}h${f1(w)}v${f1(h)}z`;
        figs += ell(x, base - h * 0.78, 12 * sc, 14 * sc) + `M${f1(x - 16 * sc)},${f1(base - h * 0.08)}v${f1(-h * 0.55)}q${f1(16 * sc)},${f1(-14 * sc)} ${f1(32 * sc)},0v${f1(h * 0.55)}z`;
      }
    }
    S.add(`<path d="${figs}" fill="#2a3a4c" opacity="${0.5 + sc * 0.3}"/><path d="${blocks}" fill="#a8d0ea" opacity=".35" stroke="#d8f0ff" stroke-width="2"/>`);
  }
  // burnt shelves in the foreground
  S.add(`<path d="M40,${H}V520h30v380zM200,${H}V540h26v360zM40,600h186v14H40zM40,700h186v14H40z" fill="#1a1210"/><path d="M1374,${H}V540h26v360zM1530,${H}V520h30v380zM1374,620h186v14h-186zM1374,720h186v14h-186z" fill="#1a1210"/>`);
  S.add(`<path d="M60,600l30,-30l20,24l30,-40l26,46M1400,620l24,-34l30,30l26,-44l30,48" stroke="#3a2a22" stroke-width="5" fill="none"/>`);
  S.add(`<path d="M0,800Q800,760 ${W},800V${H}H0Z" fill="#c8e0ee" opacity=".55"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', 0.2], [1, '#000', 0.6]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}
function deep() {
  const S = new Scene('sbIaDeep', '冰库最深处：冰墙里封着一册一册的名册，石台上放着母本，旁边一块发蓝的老冰，里面有一个模糊的人影', 25501);
  const R = rng(25502);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#06101a'], [0.5, '#122636'], [1, '#081420']])}"/>`);
  // the ice wall with ledgers sealed inside
  S.add(`<path d="M0,0H${W}V640H0Z" fill="#9ac4dc" opacity=".22"/>`);
  let bk = '';
  for (let r = 0; r < 6; r++) for (let c = 0; c < 22; c++) {
    if (R.range(0, 1) < 0.2) continue;
    const x = 30 + c * 72 + R.range(-6, 6), y = 40 + r * 96 + R.range(-6, 6), w = R.range(26, 46), h = R.range(56, 76);
    bk += `M${f1(x)},${f1(y + 76 - h)}h${f1(w)}v${f1(h)}h${f1(-w)}z`;
  }
  S.add(`<path d="${bk}" fill="#2a3a4a" opacity=".55"/>`);
  { let cr = ''; for (let k = 0; k < 20; k++) { const x = R.range(0, W), y = R.range(0, 620); cr += `M${f1(x)},${f1(y)}l${f1(R.range(-60, 60))},${f1(R.range(20, 80))}`; } S.add(`<path d="${cr}" stroke="#e0f4ff" stroke-width="2" opacity=".35" fill="none"/>`); }
  // floor
  S.add(`<path d="M0,640H${W}V${H}H0Z" fill="${S.lin([[0, '#3a5266'], [1, '#14202c']])}"/>`);
  // the stone plinth with the master book
  S.add(`<path d="M560,820V640h300v180z" fill="#4a5058"/><path d="M540,640h340v-24H540z" fill="#5a6068"/>`);
  S.add(`<path d="M600,616l110,-20l110,20l-110,10z" fill="#d8ccaa"/><path d="M710,596v30" stroke="#8a7a5a" stroke-width="3"/><path d="M600,616l110,10l110,-10v8l-110,10l-110,-10z" fill="#6a3a2a"/>`);
  S.add(`<ellipse cx="710" cy="610" rx="160" ry="60" fill="${S.rad([[0, '#fff0c8', 0.3], [1, '#fff0c8', 0]])}"/>`);
  // the block of old ice with a dim figure
  S.add(`<path d="M1060,820V360h240v460z" fill="#5a9ac8" opacity=".5" stroke="#bfe6ff" stroke-width="3"/>`);
  S.add(`<path d="${ell(1180, 470, 26, 32)}M1146,800V540q34,-30 68,0V800z" fill="#1a2c40" opacity=".55" filter="${S.blur(3)}"/>`);
  S.add(`<path d="M1070,380l60,120M1290,420l-50,90M1080,700l70,-40" stroke="#e8f8ff" stroke-width="2" opacity=".5"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', 0.2], [1, '#000', 0.6]], 'cx="0.55" cy="0.6" r="0.75"')}"/>`);
  return S.out();
}

export const frostbellBgs = {
  'frostbell-far': () => farCity(),
  'frostbell-gate': () => gate(),
  'frostbell-camp-night': () => campNight(),
  'ice-archive': () => vault(),
  'ice-archive-deep': () => deep(),
};
