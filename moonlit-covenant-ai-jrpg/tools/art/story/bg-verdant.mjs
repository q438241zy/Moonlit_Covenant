// 翠影公国 — chapter 23 (script 23 美術需求):
//   verdant-waterway-night    — the waterway to Green-Mirror City at night: a dark channel between tall reeds, a line of small
//                               boats with lanterns, far ahead a water gate grown over with vines and two watch lamps on it.
//   verdant-mirror-vine-gate  — the mirror-vine gate up close: a stone water gate overgrown with thick vines, the vine tips
//                               swelling into pale face-like knots (blank ovals — no features), a stone landing in front.
//   verdant-council-hall      — the council hall: seven chairs in a ring on a green-veined stone floor, an empty space in the
//                               middle, tall windows of green glass, morning grey light. No figures.
//   fog-marsh-edge            — the edge of the marsh forest: a low flat stone table at the water's edge among roots and reeds,
//                               morning mist, the dark marsh trees behind.
//   verdant-camp-night        — the camp outside Green-Mirror City at night: tents, one campfire in the middle with logs around
//                               it, the city's green-lit walls far off.
// No text anywhere; the faces on the vines are blank shapes.
import { Scene, W, H, f, persp, mix, rng } from './lib.mjs';

const f1 = (v) => f(v, 1);
const pz1 = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L') + 'Z';
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;

function reeds(R, x0, x1, yBase, h, col, n) {
  let d = '';
  for (let k = 0; k < n; k++) { const x = R.range(x0, x1), hh = R.range(h * 0.5, h), lean = R.range(-14, 14); d += `M${f1(x)},${f1(yBase)}q${f1(lean * 0.4)},${f1(-hh * 0.6)} ${f1(lean)},${f1(-hh)}`; }
  return `<path d="${d}" stroke="${col}" stroke-width="3" fill="none"/>`;
}

function waterway() {
  const S = new Scene('sbVdWaterway', '往绿镜城的水路·夜：两岸高高的芦苇之间一条暗色的水道，一排挂着灯的小船，远处一道长满藤的水门，门上两盏岗哨的灯', 23101);
  const R = rng(23102);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#070b14'], [0.55, '#101c24'], [1, '#0a1210']])}"/>`);
  { let st = ''; for (let k = 0; k < 50; k++) st += ell(R.range(0, W), R.range(0, 260), 1, 1); S.add(`<path d="${st}" fill="#e8f0ff" opacity=".6"/>`); }
  // the gate far ahead
  S.add(`<path d="M690,430V330h220V430Z" fill="#26302a"/><path d="M740,430V370q60,-40 120,0V430Z" fill="#0a100c"/>`);
  { let v = ''; for (let k = 0; k < 18; k++) { const x = R.range(690, 910); v += `M${f1(x)},330q${f1(R.range(-20, 20))},40 ${f1(R.range(-10, 10))},${f1(R.range(40, 100))}`; } S.add(`<path d="${v}" stroke="#3a5a3a" stroke-width="4" fill="none"/>`); }
  for (const x of [700, 900]) S.add(`<ellipse cx="${x}" cy="326" rx="40" ry="30" fill="${S.rad([[0, '#ffd890', 0.6], [1, '#ffd890', 0]])}"/><path d="M${x - 5},334h10v-14h-10z" fill="#ffe0a0"/>`);
  // water
  S.add(`<path d="M0,520Q800,430 ${W},520V${H}H0Z" fill="${S.lin([[0, '#14222a'], [1, '#081014']])}"/>`);
  { let d = ''; for (let k = 0; k < 30; k++) { const y = R.range(470, 880), x = R.range(0, W); d += `M${f1(x)},${f1(y)}h${f1(R.range(20, 90))}`; } S.add(`<path d="${d}" stroke="#4a6a7a" stroke-width="1.6" opacity=".5"/>`); }
  // reeds both banks
  S.add(`<path d="M0,${H}V420Q300,470 560,500L520,${H}Z" fill="#0c1610"/><path d="M${W},${H}V420Q1300,470 1040,500L1080,${H}Z" fill="#0c1610"/>`);
  S.add(reeds(R, 0, 540, 900, 380, '#1e3020', 120) + reeds(R, 1060, W, 900, 380, '#1e3020', 120));
  // boats with lanterns in a line toward the gate
  for (const [x, y, s] of [[800, 470, 0.4], [770, 520, 0.6], [820, 600, 0.85], [760, 720, 1.2]]) {
    S.add(`<path d="M${f1(x - 90 * s)},${f1(y)}q${f1(90 * s)},${f1(26 * s)} ${f1(180 * s)},0l${f1(-20 * s)},${f1(18 * s)}h${f1(-140 * s)}z" fill="#2a2018"/>`);
    S.add(`<ellipse cx="${f1(x + 40 * s)}" cy="${f1(y - 30 * s)}" rx="${f1(60 * s)}" ry="${f1(50 * s)}" fill="${S.rad([[0, '#ffcf80', 0.55], [1, '#ffcf80', 0]])}"/><path d="M${f1(x + 36 * s)},${f1(y - 22 * s)}h${f1(8 * s)}v${f1(-14 * s)}h${f1(-8 * s)}z" fill="#ffe8b0"/>`);
  }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', 0.2], [1, '#000', 0.6]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}

function vineGate() {
  const S = new Scene('sbVdVineGate', '绿镜城水门·镜藤：一道长满粗藤的石砌水门近景，藤尖鼓成一个个苍白的、像脸一样的结（没有五官的椭圆），门前一块石台', 23201);
  const R = rng(23202);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#0a1410'], [1, '#162420']])}"/>`);
  // the gate: massive stone with an arch over black water
  S.add(`<path d="M160,${H}V120H1440V${H}Z" fill="#3a4a40"/><path d="M460,${H}V420Q800,180 1140,420V${H}Z" fill="#060a08"/>`);
  { let j = ''; for (let y = 160; y < H; y += 60) j += `M160,${y}H460M1140,${y}H1440`; S.add(`<path d="${j}" stroke="#2a382e" stroke-width="2"/>`); }
  // vines: thick curving ropes over the stone, converging on the arch
  let vines = '';
  for (let k = 0; k < 26; k++) {
    const x0 = R.range(160, 1440), y0 = R.range(120, 300), x1 = R.range(420, 1180), y1 = R.range(380, 760);
    vines += `M${f1(x0)},${f1(y0)}C${f1(x0 + R.range(-200, 200))},${f1(y0 + 200)} ${f1(x1 + R.range(-200, 200))},${f1(y1 - 200)} ${f1(x1)},${f1(y1)}`;
  }
  S.add(`<path d="${vines}" stroke="#2a4a2e" stroke-width="16" fill="none" stroke-linecap="round"/><path d="${vines}" stroke="#4a7a4a" stroke-width="3" fill="none" opacity=".6"/>`);
  // the face-knots at the vine tips: pale blank ovals with a faint sheen, one large one in the centre of the arch
  let faces = '';
  for (let k = 0; k < 9; k++) faces += ell(R.range(420, 1180), R.range(360, 720), R.range(26, 40), R.range(34, 50));
  S.add(`<path d="${faces}" fill="#c8d8c8" opacity=".75"/><path d="${ell(800, 470, 70, 92)}" fill="${S.rad([[0, '#e8f4e8'], [1, '#8aa88a']])}" opacity=".9"/>`);
  // the stone landing in front
  S.add(`<path d="M0,${H}L240,760H1360L${W},${H}Z" fill="#4a524a"/><path d="M240,760H1360" stroke="#6a726a" stroke-width="4"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', 0.2], [1, '#000', 0.65]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}

function councilHall() {
  const S = new Scene('sbVdCouncil', '绿镜城议会厅：绿纹石地上七张椅子围成一圈，中间一片空地，高高的绿玻璃窗，清晨灰白的光，不画人', 23301);
  const P = persp({ vp: [800, 380], F: 760, eye: 1.8 });
  S.add(`<rect width="${W}" height="${H}" fill="#1e2420"/>`);
  // back wall with green-glass windows
  S.add(`<path d="M0,0H${W}V500H0Z" fill="${S.lin([[0, '#3a463e'], [1, '#56625a']])}"/>`);
  for (let k = 0; k < 5; k++) {
    const x = 200 + k * 300;
    S.add(`<path d="M${x - 50},440V170q50,-60 100,0V440Z" fill="${S.lin([[0, '#a8d0b0'], [1, '#5a8a6a']])}" stroke="#2a3a30" stroke-width="5"/><path d="M${x},440V140M${x - 50},300H${x + 50}" stroke="#2a3a30" stroke-width="4"/>`);
  }
  // floor: green-veined stone
  S.add(`<path d="M0,500H${W}V${H}H0Z" fill="${S.lin([[0, '#6a7468'], [1, '#4a5248']])}"/>`);
  { const R = rng(23302); let d = ''; for (let k = 0; k < 24; k++) { const x = R.range(0, W), y = R.range(520, H); d += `M${f1(x)},${f1(y)}q${f1(R.range(30, 80))},${f1(R.range(-10, 10))} ${f1(R.range(80, 200))},${f1(R.range(-20, 20))}`; } S.add(`<path d="${d}" stroke="#3a6a4a" stroke-width="2" fill="none" opacity=".6"/>`); }
  // the light from the windows
  S.add(`<path d="M150,440L80,${H}H520L250,440ZM750,440L640,${H}H1000L850,440ZM1350,440L1100,${H}H1560L1450,440Z" fill="#e8f4e8" opacity=".06"/>`);
  // seven chairs in a ring (an ellipse on the floor), high backs
  const cx = 800, cy = 700, rx = 520, ry = 140;
  const chairs = Array.from({ length: 7 }, (_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 7; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; }).sort((a, b) => a[1] - b[1]);
  S.add(`<path d="${ell(cx, cy, rx * 0.6, ry * 0.6)}" fill="none" stroke="#8a9a88" stroke-width="2" opacity=".5"/>`);
  for (const [x, y] of chairs) {
    const s = 0.7 + (y - 560) / 400;
    S.add(`<path d="M${f1(x - 30 * s)},${f1(y)}v${f1(-40 * s)}h${f1(60 * s)}v${f1(40 * s)}zM${f1(x - 30 * s)},${f1(y - 40 * s)}v${f1(-110 * s)}q${f1(30 * s)},${f1(-24 * s)} ${f1(60 * s)},0v${f1(110 * s)}z" fill="#3a4a3e" stroke="#1a221c" stroke-width="2"/>`);
    S.add(`<path d="M${f1(x - 30 * s)},${f1(y - 150 * s)}q${f1(30 * s)},${f1(-24 * s)} ${f1(60 * s)},0" fill="none" stroke="#8ab08a" stroke-width="2" opacity=".6"/>`);
  }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.7, '#000', 0.1], [1, '#000', 0.5]], 'cx="0.5" cy="0.55" r="0.75"')}"/>`);
  return S.out();
}

function marshEdge() {
  const S = new Scene('sbVdMarshEdge', '沼林边·石台：水边一块低平的石台，周围是树根和芦苇，清晨的雾，后面是暗色的沼泽林', 23401);
  const R = rng(23402);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#9aa8a0'], [0.5, '#c8d0c8'], [1, '#7a8a7a']])}"/>`);
  // the dark marsh trees behind, fading into mist
  let trees = '';
  for (let k = 0; k < 16; k++) { const x = R.range(0, W), w = R.range(18, 40), h = R.range(260, 420); trees += `M${f1(x - w / 2)},520V${f1(520 - h)}h${f1(w)}V520Z`; }
  S.add(`<path d="${trees}" fill="#4a5a4e" opacity=".55"/>`);
  { let c = ''; for (let k = 0; k < 10; k++) c += ell(R.range(0, W), R.range(140, 360), R.range(100, 220), R.range(50, 90)); S.add(`<path d="${c}" fill="#3a4a3e" opacity=".45"/>`); }
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#e0e6e0', 0], [0.45, '#e0e6e0', 0.5], [0.7, '#e0e6e0', 0.1]])}"/>`);
  // water and mud bank
  S.add(`<path d="M0,560Q800,520 ${W},560V700H0Z" fill="#7a8a84"/><path d="M0,680Q800,640 ${W},680V${H}H0Z" fill="${S.lin([[0, '#5a5a44'], [1, '#3a3a2a']])}"/>`);
  // roots crawling toward the stone
  let roots = '';
  for (let k = 0; k < 14; k++) { const x0 = R.range(0, W), y0 = R.range(700, H); roots += `M${f1(x0)},${f1(y0)}Q${f1((x0 + 800) / 2)},${f1(y0 - 40)} ${f1(800 + R.range(-220, 220))},${f1(R.range(640, 700))}`; }
  S.add(`<path d="${roots}" stroke="#3a2e22" stroke-width="10" fill="none" stroke-linecap="round"/>`);
  // the flat stone table
  S.add(`<path d="M560,700l40,-50h400l40,50z" fill="#8a8a80"/><path d="M560,700h480v26h-480z" fill="#5a5a52"/>`);
  S.add(reeds(R, 0, 420, 760, 220, '#4a5a3a', 60) + reeds(R, 1180, W, 760, 220, '#4a5a3a', 60));
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.75, '#000', 0.05], [1, '#000', 0.35]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}

function campNight() {
  const S = new Scene('sbVdCamp', '绿镜城外的营地·夜：几顶帐篷，中间一堆营火，周围放着几根木头当凳子，远处是绿镜城泛着绿光的城墙', 23501);
  const R = rng(23502);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#060a10'], [0.6, '#0e1418'], [1, '#14100c']])}"/>`);
  { let st = ''; for (let k = 0; k < 60; k++) st += ell(R.range(0, W), R.range(0, 300), 1, 1); S.add(`<path d="${st}" fill="#e8f0ff" opacity=".6"/>`); }
  // the city walls far off with a green glow
  S.add(`<path d="M0,420V360h80v-20h60v20h120v-30h60v30H${W}V420Z" fill="#162420"/><path d="M0,360H${W}" stroke="#4a8a5a" stroke-width="2" opacity=".5"/>`);
  { let w = ''; for (let k = 0; k < 20; k++) w += `M${f1(R.range(0, W))},${f1(R.range(370, 410))}h6v8h-6z`; S.add(`<path d="${w}" fill="#8adca0" opacity=".7"/>`); }
  // ground
  S.add(`<path d="M0,420H${W}V${H}H0Z" fill="${S.lin([[0, '#1a1a14'], [1, '#2a2418']])}"/>`);
  // tents
  for (const [x, w, h] of [[160, 260, 200], [520, 200, 160], [1100, 240, 190], [1360, 200, 150]]) {
    S.add(`<path d="M${x},640L${x + w / 2},${640 - h}L${x + w},640Z" fill="#3a3428"/><path d="M${x + w / 2},${640 - h}L${x + w / 2 + 16},640H${x + w / 2 - 16}Z" fill="#1a1610"/>`);
  }
  // the campfire and its glow, logs around it
  S.add(`<ellipse cx="800" cy="700" rx="520" ry="260" fill="${S.rad([[0, '#ffb060', 0.45], [0.5, '#e07030', 0.12], [1, '#e07030', 0]])}"/>`);
  for (const [x, y, w, a] of [[620, 760, 160, -8], [880, 770, 170, 6], [760, 820, 150, 0]]) S.add(`<path d="M${x},${y}l${w},${f1(w * Math.tan(a * Math.PI / 180))}l0,22l${-w},${f1(-w * Math.tan(a * Math.PI / 180))}z" fill="#4a3424"/>`);
  S.add(`<path d="M760,720l40,-90l40,90zM780,720l20,-60l20,60z" fill="#ff9a40"/><path d="M790,720l10,-36l10,36z" fill="#ffe08a"/><path d="M740,726h120v10h-120z" fill="#2a1a10"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', 0.2], [1, '#000', 0.6]], 'cx="0.5" cy="0.6" r="0.75"')}"/>`);
  return S.out();
}

export const verdantBgs = {
  'verdant-waterway-night': () => waterway(),
  'verdant-mirror-vine-gate': () => vineGate(),
  'verdant-council-hall': () => councilHall(),
  'fog-marsh-edge': () => marshEdge(),
  'verdant-camp-night': () => campNight(),
};
