// 成长支线的场景背景：north-creek-goblin-camp（北山·溪谷里的哥布林营地）。
//   north-creek-goblin-camp — ex022: the creek valley above the North Hill camp on a clear morning. Grassy valley sides with
//                             a few pines, the North Hill ridge far behind. The creek comes down from the back, is held by a
//                             low dam of stacked stones and branches into a still pool, and spills on through a narrow gap.
//                             Reed huts stand on the right bank by the pool, with a fish-drying rack and two tied bundles of
//                             split firewood in front of one hut. Reeds along both banks. In the foreground the creek bends
//                             past a shoal of pale white stones. No figures, no goblins, no text.
import { Scene, W, H, f, pz, pl, rng, pine } from './lib.mjs';

const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;

// a conical reed hut: body, lit left half, binding rings, dark door
function reedHut(S, R, x, y, w, h) {
  const apex = [x, y - h];
  S.add(`<path d="${pz([[x - w / 2, y], apex, [x + w / 2, y]])}" fill="#8a7a4e"/>`);
  S.add(`<path d="${pz([[x - w / 2, y], apex, [x - w * 0.04, y]])}" fill="#b4a26a"/>`);
  // thatch strokes
  let st = '';
  for (let k = 0; k < 9; k++) {
    const t = (k + 0.5) / 9, bx = x - w / 2 + w * t;
    st += `M${f1(apex[0] + (bx - apex[0]) * 0.12)},${f1(apex[1] + h * 0.12)}L${f1(bx + R.range(-3, 3))},${f1(y - 2)}`;
  }
  S.add(`<path d="${st}" stroke="#6e6038" stroke-width="1.6" opacity=".55" fill="none"/>`);
  // binding rings
  for (const t of [0.35, 0.65]) {
    const yy = apex[1] + h * t, hw = (w / 2) * t;
    S.add(`<path d="M${f1(x - hw)},${f1(yy)}Q${f1(x)},${f1(yy + 5)} ${f1(x + hw)},${f1(yy)}" stroke="#5a4c2a" stroke-width="2.4" fill="none"/>`);
  }
  // tuft at the top
  S.add(`<path d="M${f1(x)},${f1(apex[1] + 4)}l-7,-14M${f1(x)},${f1(apex[1] + 4)}l2,-16M${f1(x)},${f1(apex[1] + 4)}l9,-12" stroke="#a8965e" stroke-width="2.4" stroke-linecap="round"/>`);
  // door
  const dw = w * 0.26, dh = h * 0.42;
  S.add(`<path d="M${f1(x + w * 0.04 - dw / 2)},${f1(y)}Q${f1(x + w * 0.04)},${f1(y - dh * 1.25)} ${f1(x + w * 0.04 + dw / 2)},${f1(y)}Z" fill="#2a2416"/>`);
  // ground shadow
  S.add(`<path d="${ell(x + w * 0.12, y + 2, w * 0.6, 6)}" fill="#3a4a2a" opacity=".35"/>`);
}

// clump of reeds: thin strokes with seed heads
function reeds(S, R, x, y, n, h, spread, col = '#7e8a4a', head = '#9a7a4a') {
  let d = '', hd = '';
  for (let k = 0; k < n; k++) {
    const bx = x + R.range(-spread, spread), hh = h * R.range(0.6, 1.1), lean = R.range(-14, 14);
    d += `M${f1(bx)},${f1(y)}Q${f1(bx + lean * 0.3)},${f1(y - hh * 0.6)} ${f1(bx + lean)},${f1(y - hh)}`;
    if (R() < 0.5) hd += ell(bx + lean, y - hh - 6, 2.4, 7);
  }
  S.add(`<path d="${d}" stroke="${col}" stroke-width="2" fill="none" stroke-linecap="round"/>`);
  if (hd) S.add(`<path d="${hd}" fill="${head}"/>`);
}

function creekCamp() {
  const S = new Scene('sbSqgCreek', '北山·溪谷里的哥布林营地·早上：草坡夹着一道溪谷，远处是北山的山脊和几棵松树；溪水从深处流下来，被一道石头和树枝垒的矮坝拦成一个平静的水塘，坝中间有一道窄口子，水从那里流出去；右岸水塘边是几座芦苇搭的尖顶草棚，一个晾鱼的木架，一座草棚前堆着两捆绑好的劈柴；两岸长着芦苇；近处溪水在一片白色的石头滩前拐弯；不画人，不画哥布林，不写字', 22022);
  const R = rng(22023);

  // ── sky ──
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#9ec2e0'], [0.38, '#cfe0ea'], [0.55, '#f2e8cc'], [1, '#e8dcb8']])}"/>`);
  S.add(`<ellipse cx="300" cy="120" rx="360" ry="220" fill="${S.rad([[0, '#fff6dc', 0.85], [1, '#fff6dc', 0]])}"/>`);
  S.add(`<path d="${ell(300, 120, 30, 30)}" fill="#fffbea" opacity=".95"/>`);
  // a few soft clouds
  {
    let cl = '';
    for (const [x, y, w] of [[720, 110, 160], [980, 160, 120], [1320, 90, 200], [560, 200, 90]]) {
      for (let k = 0; k < 5; k++) cl += ell(x + (k - 2) * w * 0.22, y + Math.abs(k - 2) * 5, w * 0.2, w * 0.1);
    }
    S.add(`<path d="${cl}" fill="#ffffff" opacity=".7" filter="${S.blur(2)}"/>`);
  }

  // ── the North Hill ridge far behind ──
  S.add(`<path d="${pz([[0, 380], [160, 330], [330, 352], [520, 300], [700, 330], [860, 290], [1040, 324], [1220, 286], [1400, 330], [W, 312], [W, 460], [0, 460]])}" fill="#a8b8c0"/>`);
  S.add(`<path d="${pz([[0, 410], [220, 372], [420, 398], [640, 360], [820, 392], [1000, 366], [1200, 396], [1420, 364], [W, 386], [W, 470], [0, 470]])}" fill="#93a89a"/>`);
  { let p = ''; for (let k = 0; k < 26; k++) { const x = R.range(40, 1560); p += pine(x, 404 + R.range(-14, 6), R.range(18, 32), '#6e8478'); } S.add(p); }
  // base ground for the whole valley (so no sky shows between the slopes)
  S.add(`<path d="M0,452Q800,436 ${W},448V${H}H0Z" fill="#7e9852"/>`);
  // morning haze in the valley floor
  S.add(`<rect x="0" y="380" width="${W}" height="120" fill="${S.lin([[0, '#f4ecd4', 0], [0.6, '#f4ecd4', 0.6], [1, '#f4ecd4', 0.1]])}"/>`);

  // ── valley sides ──
  // left slope
  S.add(`<path d="M0,430Q240,420 420,470T700,560L640,620Q380,640 0,700Z" fill="${S.lin([[0, '#8aa25c'], [1, '#6e8a46']])}"/>`);
  // right slope
  S.add(`<path d="M${W},420Q1360,416 1180,470T900,540L980,600Q1300,620 ${W},640Z" fill="${S.lin([[0, '#96aa62'], [1, '#7a904c']])}"/>`);
  // the valley floor (meadow) behind the pool
  S.add(`<path d="M560,520Q800,488 1040,516L1060,600Q800,620 540,606Z" fill="#88a058"/>`);
  // slope light/shade bands
  S.add(`<path d="M0,520Q200,500 400,530T660,590L640,620Q380,640 0,700Z" fill="#5e7a3e" opacity=".45"/>`);
  S.add(`<path d="M0,450Q200,440 360,470L320,500Q160,480 0,500Z" fill="#b4c47a" opacity=".5"/>`);
  // pines on the valley sides
  {
    let p = '';
    for (const [x, y, h] of [[90, 470, 120], [170, 482, 90], [250, 470, 70], [1430, 452, 110], [1510, 470, 140], [1360, 462, 70], [1260, 476, 60]]) p += pine(x, y, h, '#3e5a3e');
    S.add(p);
    let lit = '';
    for (const [x, y, h] of [[90, 470, 120], [170, 482, 90], [1430, 452, 110], [1510, 470, 140]]) lit += pine(x - h * 0.05, y - h * 0.08, h * 0.7, '#577a4e', h * 0.18);
    S.add(lit);
  }

  // ── the creek upstream: from the back down to the pool ──
  S.add(`<path d="M792,470Q800,476 804,488Q812,504 836,526L770,528Q786,506 788,490Q788,478 792,470Z" fill="#b0cad4"/>`);
  S.add(`<path d="M792,478q6,10 6,22M784,500q8,10 20,16" stroke="#eaf4f6" stroke-width="2" fill="none" opacity=".8"/>`);

  // ── the pool behind the dam ──
  const poolD = 'M600,560Q640,524 760,522Q900,518 1000,534Q1060,548 1040,580Q960,600 800,602Q660,604 610,586Z';
  S.add(`<path d="${poolD}" fill="${S.lin([[0, '#a8c8d6'], [0.6, '#cfe2e8'], [1, '#9ab8c4']])}"/>`);
  // sky reflection and ripples
  S.add(`<path d="M660,552Q800,540 960,550" stroke="#f4fafc" stroke-width="4" fill="none" opacity=".7"/>`);
  { let rp = ''; for (let k = 0; k < 9; k++) { const x = R.range(650, 1000), y = R.range(548, 590), w = R.range(14, 40); rp += `M${f1(x)},${f1(y)}q${f1(w / 2)},-3 ${f1(w)},0`; } S.add(`<path d="${rp}" stroke="#ffffff" stroke-width="1.6" fill="none" opacity=".6"/>`); }
  // a few stepping stones in the shallows (left end of the pool)
  { let st = ''; for (const [x, y, r] of [[640, 572, 12], [668, 584, 10], [700, 578, 9]]) st += ell(x, y, r * 1.4, r * 0.6); S.add(`<path d="${st}" fill="#b0a890"/>`); }

  // ── the dam: stacked stones and branches across the creek, a narrow gap near the middle ──
  {
    const stones = [];
    for (let x = 600; x <= 1050; x += R.range(18, 26)) {
      if (x > 800 && x < 836) continue; // the gap
      const t = (x - 600) / 450, y = 600 + Math.sin(t * Math.PI) * 6;
      stones.push([x, y, R.range(12, 18), R.range(8, 12)]);
      if (R() < 0.7) stones.push([x + R.range(-6, 6), y - R.range(8, 12), R.range(9, 14), R.range(6, 9)]);
    }
    let base = '', lit = '';
    for (const [x, y, rx, ry] of stones) { base += ell(x, y, rx, ry); lit += ell(x - rx * 0.25, y - ry * 0.3, rx * 0.55, ry * 0.45); }
    S.add(`<path d="${base}" fill="#8a8270"/>`, `<path d="${lit}" fill="#b8b09a"/>`);
    // branches laid across the stones
    S.add(`<path d="M612,590L780,584M650,596L720,580M850,586L1030,594M900,580L990,598M700,588l-14,-12M940,588l12,-14" stroke="#5a4630" stroke-width="5" stroke-linecap="round" fill="none"/>`);
    S.add(`<path d="M616,588L776,582M854,584L1026,592" stroke="#8a6e4a" stroke-width="2" stroke-linecap="round" fill="none"/>`);
    // water spilling through the gap
    S.add(`<path d="M802,592Q818,600 836,592L842,640Q818,650 796,640Z" fill="#cfe4ea"/>`);
    S.add(`<path d="M806,600q4,20 0,38M818,600q2,22 2,40M830,600q-2,20 2,38" stroke="#ffffff" stroke-width="2" fill="none" opacity=".85"/>`);
  }

  // ── reed huts on the right bank ──
  // a bank strip under the huts
  S.add(`<path d="M960,560Q1100,540 1300,552L1340,612Q1160,622 1000,610Z" fill="#7e9450"/>`);
  reedHut(S, R, 1250, 556, 70, 84);
  reedHut(S, R, 1340, 566, 60, 70);
  reedHut(S, R, 1090, 572, 86, 104);
  reedHut(S, R, 1190, 590, 96, 116);
  reedHut(S, R, 1310, 612, 80, 96);
  // fish-drying rack between the huts
  S.add(`<path d="M1004,610V540M1066,612V542M998,546H1072" stroke="#5a4630" stroke-width="4" stroke-linecap="round"/>`);
  {
    let fish = '';
    for (let k = 0; k < 5; k++) { const x = 1010 + k * 12; fish += `M${x},548q4,10 0,24q-4,-12 0,-24zM${x - 4},574l4,-4l4,4z`; }
    S.add(`<path d="${fish}" fill="#b8b0a0"/>`);
    S.add(`<path d="M1010,548v-3M1022,548v-3M1034,548v-3M1046,548v-3M1058,548v-3" stroke="#3a2e22" stroke-width="1.5"/>`);
  }
  // two tied bundles of split firewood in front of the big hut
  for (const [bx, by] of [[1132, 626], [1176, 634]]) {
    let logs = '', ends = '';
    for (let k = 0; k < 6; k++) {
      const x = bx + (k % 3) * 11, y = by - Math.floor(k / 3) * 10;
      logs += `M${x - 4},${y}h10v-6h-10z`;
      ends += ell(x + 6, y - 3, 3.2, 3.2);
    }
    S.add(`<path d="M${bx - 8},${by}h42v-20h-42z" fill="#7a5a36"/>`, `<path d="${logs}" fill="#9a764a"/>`, `<path d="${ends}" fill="#d8b888"/>`);
    S.add(`<path d="M${bx + 4},${by + 1}v-22M${bx + 22},${by + 1}v-22" stroke="#4a3a22" stroke-width="2.4"/>`);
  }
  // a little smoke from a cold morning fire-pit by the huts
  S.add(`<path d="${ell(1240, 612, 12, 4)}" fill="#4a4a40"/>`);
  S.add(`<path d="${ell(1236, 590, 10, 14)}${ell(1244, 560, 14, 18)}${ell(1236, 526, 18, 22)}" fill="#f4f0e4" opacity=".55" filter="${S.blur(2)}"/>`);

  // ── reeds along both banks of the pool ──
  reeds(S, R, 620, 566, 18, 46, 30);
  reeds(S, R, 580, 600, 14, 54, 26);
  reeds(S, R, 1040, 560, 14, 40, 24);
  reeds(S, R, 1380, 622, 20, 60, 40);
  reeds(S, R, 960, 612, 12, 44, 22);

  // ── the creek downstream: from the gap toward the foreground bend ──
  S.add(`<path d="M796,640Q760,690 700,730Q600,790 420,820Q260,846 0,850V${H}H560Q760,880 900,820Q990,770 930,712Q880,672 842,640Z" fill="${S.lin([[0, '#b4d0da'], [0.5, '#9cc0cc'], [1, '#86aab8']])}"/>`);
  // bright current lines
  {
    let cur = '';
    for (let k = 0; k < 12; k++) {
      const t = k / 11, x = 820 - t * 600 + R.range(-30, 30), y = 680 + t * 170 + R.range(-10, 10);
      cur += `M${f1(x)},${f1(y)}q${f1(-30 - t * 40)},${f1(8 + t * 6)} ${f1(-70 - t * 80)},${f1(12 + t * 8)}`;
    }
    S.add(`<path d="${cur}" stroke="#ffffff" stroke-width="2.4" fill="none" opacity=".65" stroke-linecap="round"/>`);
  }
  // near bank (left) grass edge
  S.add(`<path d="M0,700Q300,660 560,640Q680,632 760,646Q700,700 600,740Q420,800 0,830Z" fill="${S.lin([[0, '#6e8a46'], [1, '#56703a']])}"/>`);
  reeds(S, R, 120, 780, 22, 70, 60, '#6a7a3e');
  reeds(S, R, 520, 700, 16, 56, 40, '#6a7a3e');

  // ── the white-stone shoal at the bend (foreground right) ──
  S.add(`<path d="M900,${H}Q940,820 1000,760Q1080,690 1240,660Q1440,640 ${W},660V${H}Z" fill="${S.lin([[0, '#8a9a5a'], [1, '#6e8048']])}"/>`);
  S.add(`<path d="M940,${H}Q980,830 1060,780Q1160,720 1320,712Q1460,708 ${W},730V${H}Z" fill="#d8d0bc"/>`);
  {
    let base = '', lit = '', shade = '';
    for (let k = 0; k < 70; k++) {
      const t = R(), x = 980 + t * 620 + R.range(-30, 30), y = 740 + R() * 160;
      if (y < 720 + (1 - (x - 940) / 660) * 80) continue;
      const rx = R.range(10, 30) * (0.6 + (y - 720) / 300), ry = rx * R.range(0.45, 0.6);
      base += ell(x, y, rx, ry);
      lit += ell(x - rx * 0.25, y - ry * 0.3, rx * 0.6, ry * 0.5);
      shade += `M${f1(x - rx * 0.9)},${f1(y + ry * 0.4)}q${f1(rx * 0.9)},${f1(ry * 0.8)} ${f1(rx * 1.8)},0`;
    }
    S.add(`<path d="${base}" fill="#e8e2d2"/>`, `<path d="${lit}" fill="#fbf8ef"/>`, `<path d="${shade}" stroke="#b0a68e" stroke-width="2" fill="none" opacity=".7"/>`);
  }
  // water lapping at the shoal's edge
  S.add(`<path d="M930,${H}Q960,836 1030,792Q1110,744 1220,728" stroke="#f4fafc" stroke-width="3" fill="none" opacity=".75"/>`);

  // ── foreground framing: grass tufts and a leaning branch on the left ──
  {
    let g = '';
    for (let k = 0; k < 40; k++) { const x = R.range(0, 420), y = R.range(840, 900), h = R.range(16, 40); g += `M${f1(x)},${f1(y)}q${f1(R.range(-6, 6))},${f1(-h / 2)} ${f1(R.range(-10, 10))},${f1(-h)}`; }
    S.add(`<path d="${g}" stroke="#4e6a32" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
  }
  S.add(`<path d="M0,250Q80,300 160,320Q220,330 260,360" stroke="#3a2e22" stroke-width="10" fill="none" stroke-linecap="round"/>`);
  {
    let lv = '';
    for (let k = 0; k < 26; k++) { const t = R(), x = t * 260 + R.range(-20, 20), y = 250 + t * 100 + R.range(-30, 30); lv += ell(x, y, R.range(10, 18), R.range(6, 10)); }
    S.add(`<path d="${lv}" fill="#4e6e3a"/>`);
    let lv2 = '';
    for (let k = 0; k < 14; k++) { const t = R(), x = t * 240 + R.range(-20, 20), y = 240 + t * 100 + R.range(-30, 20); lv2 += ell(x, y, R.range(8, 14), R.range(5, 8)); }
    S.add(`<path d="${lv2}" fill="#7a9a52"/>`);
  }

  // morning light wash from the upper left and a soft vignette
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#fff2d0', 0.22], [0.5, '#fff2d0', 0], [1, '#fff2d0', 0]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.72, '#000', 0.04], [1, '#000', 0.26]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}

export const sqGBgs = {
  'north-creek-goblin-camp': () => creekCamp(),
};
