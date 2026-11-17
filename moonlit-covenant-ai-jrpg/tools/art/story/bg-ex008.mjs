// 番外 ex008 的场景背景（剧本/番外/ex008一路走來的紀念日.md〈美術需求〉）：north-slope-camp-anniversary-dusk（北山缓坡·营地·黄昏的长桌）、north-slope-camp-anniversary-night（北山缓坡·营地·灯下的长桌）。
//   north-slope-camp-anniversary-dusk  — the north-slope camp of chapter 22 seen from the cook-tent's long table at sunset: the sun
//                                        sinking behind the far ridge on the left, Hemai's wheat fields filling the valley (a few
//                                        dark burnt strips, a few new timber frames, no smoke), tents along the slope. In the
//                                        foreground the long plank table runs off to the right with an old folded map spread on
//                                        it — a pencilled route of small circles, the last stop still empty — held down by
//                                        stones, a pencil, a closed report folder and an unlit lantern; the cook-tent's awning
//                                        with barrels and crates behind the far end of the table.
//   north-slope-camp-anniversary-night — the same table after dark under a starry sky and a high moon: one lit lantern on the table
//                                        (the rest of the "few lamps" are the camp's lanterns and fires on the slope), four tin
//                                        cups, a small jug, a basket of bread, and the map with a mark now at the last stop.
// Same composition in both; no figures, no shield, no readable text anywhere.
import { Scene, W, H, f, pz, rng, cloud, band, ridge, stars, smoke, pine, wheatEar, fbm } from './lib.mjs';

const r0 = (v) => f(v, 0);
const f1 = (v) => f(v, 1);
const lerp = (a, b, t) => a + (b - a) * t;
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;

// ── the long table: a plank top running from the bottom-left corner off to the right ──
// u: 0 at the near-left end … 1 at the far-right end; w: 0 on the near edge … 1 on the far edge
const TQ = { nl: [-30, 912], nr: [1236, 770], fr: [1222, 712], fl: [92, 770] };
function tq(u, w) {
  const nx = lerp(TQ.nl[0], TQ.nr[0], u), ny = lerp(TQ.nl[1], TQ.nr[1], u);
  const fx = lerp(TQ.fl[0], TQ.fr[0], u), fy = lerp(TQ.fl[1], TQ.fr[1], u);
  return [lerp(nx, fx, w), lerp(ny, fy, w)];
}
const depth = (u) => Math.hypot(tq(u, 1)[0] - tq(u, 0)[0], tq(u, 1)[1] - tq(u, 0)[1]) / 180; // 1 at the near end
const quad = (u0, u1, w0, w1) => pz([tq(u0, w0), tq(u1, w0), tq(u1, w1), tq(u0, w1)]);

const PAL = {
  dusk: {
    sky: [[0, '#3c3866'], [0.18, '#6a5482'], [0.33, '#b8708a'], [0.42, '#e8936e'], [0.48, '#ffc98e'], [0.56, '#ffe0aa'], [1, '#ffe0aa']],
    ridge: '#5e4a6a', ridgeShade: '#47385a', rim: '#ffc890', ridge2: '#7a5a6e',
    valley: '#8e6a4a', fields: ['#d8a656', '#c99248', '#e2b968', '#bd8744', '#cf9e52'], burnt: '#5e4636', rows: '#8a6236',
    frame: '#5a4232', slopeA: '#7a6248', slopeB: '#4a3c30', slopeC: '#231d18', rimSlope: '#ffd8a0',
    tentLit: ['#e8c8a0', '#d8b48c', '#ecd0aa'], tentShade: ['#8e7462', '#7e6656', '#94786a'], pole: '#3a2c22',
    pine: '#3a3030', grass: '#2a221c',
    wood: [[0, '#b27c4a'], [0.5, '#9a6a40'], [1, '#7a5232']], woodEdge: '#5a3a24', woodSeam: '#6e4a2c', leg: '#3a2618',
    paper: [[0, '#f2e2bc'], [1, '#e2cc9e']], ink: '#7a3a28', faint: '#9a8a70', sea: '#a8b4b0', forest: '#7a8a5a',
    shadow: '#2a1a10', shadowOp: 0.35,
  },
  night: {
    sky: [[0, '#070b1e'], [0.25, '#0e1430'], [0.45, '#1c2242'], [0.5, '#262a48'], [1, '#262a48']],
    ridge: '#181a2a', ridgeShade: '#10121e', rim: '#8a92c0', ridge2: '#22243a',
    valley: '#26262a', fields: ['#4a4a44', '#42423c', '#525248', '#3e3e38', '#4c4b42'], burnt: '#1e1d20', rows: '#2e2e2a',
    frame: '#1a1a22', slopeA: '#2c2a30', slopeB: '#1c1a1e', slopeC: '#0c0b0e', rimSlope: '#9aa2c8',
    tentLit: ['#6a6474', '#5e5868', '#706a7a'], tentShade: ['#3a3644', '#34303e', '#403a48'], pole: '#16141a',
    pine: '#121218', grass: '#0e0d10',
    wood: [[0, '#5a4234'], [0.5, '#4a362a'], [1, '#3a2a22']], woodEdge: '#22180f', woodSeam: '#3a2a20', leg: '#140e0a',
    paper: [[0, '#c8bca4'], [1, '#a89c86']], ink: '#5a2a20', faint: '#7a705e', sea: '#6a7480', forest: '#5a6448',
    shadow: '#05040a', shadowOp: 0.45,
  },
};

function sky(S, P, night) {
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(P.sky)}"/>`);
  if (!night) {
    // the sun going down behind the far ridge (upper left keeps the key light)
    S.add(`<circle cx="250" cy="420" r="760" fill="${S.rad([[0, '#fff2d0', 0.85], [0.12, '#ffd8a0', 0.5], [0.45, '#f4a878', 0.16], [1, '#f4a878', 0]])}"/>`);
    S.add(`<circle cx="250" cy="414" r="44" fill="#fff6e0"/>`);
    const R = rng(8101);
    const c1 = { lit: '#ffcf9a', shade: '#b0687a', rim: '#fff0d0' };
    const c2 = { lit: '#f6b08a', shade: '#8a5a7a', rim: '#ffe0c0' };
    S.add(`<g opacity=".85">${cloud(R, 620, 250, 380, 46, c1, { bumps: 6, flat: 0.08 })}${cloud(R, 1120, 190, 320, 40, c2, { bumps: 5, flat: 0.08 })}${cloud(R, 1380, 300, 240, 30, c1, { bumps: 4, flat: 0.08 })}</g>`);
    S.add(`<path d="${band(420, 1500, 352, 10, R)}" fill="#f2a27e" opacity=".55"/><path d="${band(700, 1640, 120, 12, R)}" fill="#8a6a96" opacity=".45"/>`);
  } else {
    const R = rng(8102);
    // the river of stars, soft, across the upper sky
    S.add(`<path d="M-40,250C300,170 700,120 1000,90C1260,64 1480,40 1660,10L1660,110C1460,140 1260,170 1010,200C700,236 320,300 -40,360Z" fill="#8a94c8" opacity=".16" filter="${S.blur(3)}"/>`);
    S.add(stars(R, 230, [0, 0, W, 430], { avoid: [1350, 150, 120, 110], fill: '#e8ecff', op: [0.25, 0.9] }));
    S.add(stars(R, 60, [200, 60, 1500, 260], { maxR: 1.1, fill: '#fff4dc', op: [0.4, 0.95] }));
    // a high, nearly full moon to the right
    S.add(`<circle cx="1350" cy="150" r="200" fill="${S.rad([[0, '#e8ecff', 0.32], [0.4, '#c8d0f0', 0.08], [1, '#c8d0f0', 0]])}"/>`);
    S.add(`<circle cx="1350" cy="150" r="40" fill="#efece0"/><path d="M1338,112a40,40 0 0 1 0,76a46,46 0 0 0 0,-76z" fill="#cfcabc" opacity=".55"/>`);
    S.add(`<path d="${ell(1336, 140, 7, 5)}${ell(1360, 162, 5, 4)}${ell(1350, 128, 4, 3)}" fill="#c4bfb0" opacity=".6"/>`);
  }
}

function farLand(S, P, night) {
  // the far ridge across the valley
  S.add(ridge(S, { step: 14, base: 404, amp: 26, period: 280, seed: 8111, fill: P.ridge2, bottom: 560, peaks: [[880, 30, 260], [1400, 22, 220]] }).svg);
  S.add(ridge(S, { step: 12, base: 424, amp: 22, period: 220, seed: 8112, fill: P.ridge, shade: P.ridgeShade, shadeOp: 0.5, peaks: [[160, 46, 240], [620, 18, 200]], bottom: 600 }).svg);
  // the valley floor and Hemai's wheat fields, strip after strip
  S.add(`<path d="M-20,440C300,446 900,450 1640,446V640H-20Z" fill="${P.valley}"/>`);
  const n = fbm(8113, 160, 3);
  let rowsD = '';
  const bands = [[446, 462], [462, 482], [482, 506], [506, 534], [534, 566], [566, 604]];
  bands.forEach(([y0, y1], bi) => {
    let x = -20, k = 0;
    while (x < 1640) {
      const wv = (120 + bi * 70) * (0.7 + 0.6 * ((n(x * 1.7 + bi * 90) + 1) / 2));
      const x1 = Math.min(1660, x + wv), sk = (bi + 1) * 6;
      const burnt = (bi >= 2 && (k + bi) % 7 === 3 && x > 600);
      const col = burnt ? P.burnt : P.fields[(k * 3 + bi) % P.fields.length];
      S.add(`<path d="${pz([[x - sk, y1], [x, y0], [x1, y0], [x1 - sk, y1]])}" fill="${col}"/>`);
      if (!burnt) for (let rr = 1; rr < 3 + bi; rr++) { const yy = lerp(y0, y1, rr / (3 + bi)); rowsD += `M${r0(x - sk * rr / (3 + bi))},${r0(yy)}H${r0(x1 - sk * rr / (3 + bi))}`; }
      x = x1; k += 1;
    }
  });
  S.add(`<path d="${rowsD}" stroke="${P.rows}" stroke-width="1" opacity=".55" fill="none"/>`);
  // the road down the valley and the new timber frames where the village is being raised again — no smoke
  S.add(`<path d="M1640,520C1400,512 1260,500 1180,492C1100,486 1020,486 960,490" stroke="${night ? '#3a3c48' : '#e8cf9a'}" stroke-width="5" fill="none" opacity=".7"/>`);
  let fr = '';
  for (const [x, y, w, h] of [[1150, 492, 46, 30], [1210, 494, 36, 24], [1262, 497, 50, 34], [1110, 494, 30, 20]]) {
    fr += `M${x},${y}v${-h}M${x + w},${y}v${-h}M${x + w / 2},${y}v${-h - 14}M${x - 4},${y - h}L${x + w / 2},${y - h - 16}L${x + w + 4},${y - h}M${x},${y - h * 0.5}H${x + w}`;
  }
  S.add(`<path d="${fr}" stroke="${P.frame}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`);
  if (!night) S.add(`<rect y="380" width="${W}" height="120" fill="${S.lin([[0, '#ffd8a0', 0], [0.6, '#ffd8a0', 0.28], [1, '#ffd8a0', 0]])}"/>`);
  else S.add(`<rect y="430" width="${W}" height="120" fill="${S.lin([[0, '#8a94c0', 0], [0.4, '#8a94c0', 0.07], [1, '#8a94c0', 0]])}"/>`);
}

const tent = (x, y, w, h, c, cs, pole) => `<path d="M${r0(x - w / 2)},${r0(y)}L${r0(x)},${r0(y - h)}L${r0(x + w * 0.1)},${r0(y)}Z" fill="${c}"/><path d="M${r0(x)},${r0(y - h)}L${r0(x + w / 2)},${r0(y)}L${r0(x + w * 0.1)},${r0(y)}Z" fill="${cs}"/><path d="M${r0(x)},${r0(y - h - 8)}V${r0(y)}M${r0(x - w / 2)},${r0(y)}L${r0(x - w * 0.72)},${r0(y + 5)}M${r0(x + w / 2)},${r0(y)}L${r0(x + w * 0.72)},${r0(y + 5)}" stroke="${pole}" stroke-width="2.5"/>`;

function camp(S, P, night) {
  const R = rng(night ? 8122 : 8121);
  // the slope the camp stands on, falling away to the right into the valley
  S.add(`<path d="M-20,520C300,532 560,552 820,574C1080,594 1340,600 1640,606V900H-20Z" fill="${S.lin([[0, P.slopeA], [0.35, P.slopeB], [1, P.slopeC]])}"/>`);
  S.add(`<path d="M-20,520C300,532 560,552 820,574C1080,594 1340,600 1640,606" fill="none" stroke="${P.rimSlope}" stroke-width="2" opacity="${night ? 0.25 : 0.5}"/>`);
  for (const [x, y, h] of [[30, 524, 130], [86, 528, 96], [1580, 606, 110], [1530, 604, 76]]) S.add(pine(x, y, h, P.pine));
  // tents along the slope
  const tents = [[200, 556, 120, 76], [350, 566, 96, 60], [500, 578, 128, 80], [680, 594, 104, 64], [880, 610, 132, 82], [1360, 626, 110, 66], [1480, 632, 90, 56]];
  tents.forEach(([x, y, w, h], i) => {
    S.add(tent(x, y, w, h, P.tentLit[i % 3], P.tentShade[i % 3], P.pole));
    if (night && i % 2 === 0) S.add(`<path d="M${r0(x - w * 0.3)},${r0(y)}L${r0(x)},${r0(y - h * 0.86)}L${r0(x + w * 0.08)},${r0(y)}Z" fill="#ffb860" opacity=".32"/><path d="M${r0(x + 2)},${r0(y - h * 0.5)}L${r0(x + 6)},${r0(y)}H${r0(x - 2)}Z" fill="#ffd27a" opacity=".8"/>`);
  });
  // cooking fires (dusk: small with thin smoke; night: higher, glowing)
  for (const [x, y] of [[420, 610], [780, 636], [1260, 650]]) {
    const g = night ? 110 : 60;
    S.add(`<circle cx="${x}" cy="${y - 6}" r="${g}" fill="${S.rad([[0, '#ffb060', night ? 0.6 : 0.45], [1, '#ffb060', 0]])}"/><path d="M${x - 10},${y}q2,-18 10,-26q6,10 10,26z" fill="#ff9a3a"/><path d="M${x - 4},${y}q2,-9 4,-13q3,6 4,13z" fill="#ffe08a"/><path d="M${x - 16},${y + 2}l32,-4M${x - 14},${y - 2}l30,6" stroke="#2a1e16" stroke-width="4"/>`);
    if (!night) S.add(`<path d="${smoke(R, x + 4, y - 28, 110, 9, 50, x)}" fill="#d8c0b0" opacity=".35"/>`);
  }
  // a trodden path from the long table down between the tents
  S.add(`<path d="M560,900C600,800 640,720 700,660C730,632 760,616 790,606L812,612C786,626 760,646 742,670C700,730 690,810 700,900Z" fill="${night ? '#3a3640' : '#9a7c5a'}" opacity="${night ? 0.35 : 0.4}"/>`);
  // the cook-tent's awning behind the table's far end, barrels and crates under it
  S.add(`<path d="M960,640L1190,628L1180,664L972,676Z" fill="${night ? '#4a4450' : '#c8b090'}"/><path d="M972,676L1180,664L1176,672L974,684Z" fill="${night ? '#2a2630' : '#8a7058'}"/><path d="M962,640V720M1188,628V712" stroke="${P.pole}" stroke-width="5"/>`);
  for (const [x, y, w, h] of [[1000, 712, 34, 40], [1040, 714, 30, 36]]) S.add(`<path d="M${x},${y}h${w}v${-h}h${-w}z" fill="${night ? '#2e2620' : '#6a4a30'}"/><path d="M${x},${y - h * 0.33}h${w}M${x},${y - h * 0.66}h${w}" stroke="${night ? '#1a1410' : '#3a2818'}" stroke-width="3"/>`);
  for (const [x, y, w, h] of [[1100, 712, 52, 34], [1112, 678, 34, 34]]) S.add(`<path d="M${x},${y}h${w}v${-h}h${-w}z" fill="${night ? '#3a3026' : '#8a6440'}"/><path d="M${x},${y}l${w},${-h}M${x},${y - h}l${w},${h}" stroke="${night ? '#22190f' : '#5a3e24'}" stroke-width="2.5"/>`);
  // night: a few lanterns hung on poles along the camp
  if (night) {
    for (const [x, y] of [[270, 548], [600, 574], [980, 606], [1420, 618]]) {
      S.add(`<path d="M${x},${y + 40}V${y - 6}h14" stroke="${P.pole}" stroke-width="3" fill="none"/><circle cx="${x + 14}" cy="${y + 4}" r="44" fill="${S.rad([[0, '#ffc870', 0.55], [1, '#ffc870', 0]])}"/><path d="M${x + 9},${y - 2}h10v13h-10z" fill="#ffd890"/>`);
    }
  }
  // grass on the slope and stray wheat at the lower right, beside the end of the table
  let g = '';
  for (let i = 0; i < 46; i++) { const x = R.range(-20, 1620), y = R.range(700, 900), h = R.range(8, 22); g += `M${r0(x - 4)},${r0(y)}q2,${r0(-h * 0.6)} ${r0(R.range(-6, 6))},${r0(-h)}q2,${r0(h * 0.5)} 5,${r0(h)}z`; }
  S.add(`<path d="${g}" fill="${P.grass}" opacity=".35"/>`);
  let wh = '';
  for (let i = 0; i < 9; i++) wh += wheatEar(1300 + i * 34 + R.range(-10, 10), 912, R.range(120, 190), R.range(-30, 24));
  S.add(`<path d="${wh}" fill="none" stroke="${night ? '#3a3a40' : '#c8a060'}" stroke-width="2.4" stroke-linecap="round" opacity="${night ? 0.8 : 0.85}"/>`);
}

// ── the table and what is on it ──
function tableTop(S, P, night) {
  // legs and the trestle at the right end, the front face, then the top and its planks
  const legs = [0.12, 0.5, 0.96].map((u) => { const [x, y] = tq(u, 0.04); return `M${r0(x - 7)},${r0(y + 16)}h14v${r0(260 - u * 120)}h-14z`; }).join('');
  S.add(`<path d="${legs}" fill="${P.leg}"/>`);
  const [ex, ey] = tq(1, 1), [nx, ny] = tq(1, 0);
  S.add(`<path d="M${r0(ex)},${r0(ey)}L${r0(nx)},${r0(ny)}V${r0(ny + 120)}h-12V${r0(ny + 14)}L${r0(ex - 10)},${r0(ey + 12)}V${r0(ey + 96)}h-10V${r0(ey)}Z" fill="${P.leg}"/>`);
  S.add(`<path d="${pz([TQ.nl, TQ.nr, [TQ.nr[0], TQ.nr[1] + 16], [TQ.nl[0], TQ.nl[1] + 22]])}" fill="${P.woodEdge}"/>`);
  S.add(`<path d="${pz([TQ.nl, TQ.nr, TQ.fr, TQ.fl])}" fill="${S.lin(P.wood, 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  let seams = '';
  for (const w of [0.25, 0.5, 0.75]) seams += `M${r0(tq(0, w)[0])},${r0(tq(0, w)[1])}L${r0(tq(1, w)[0])},${r0(tq(1, w)[1])}`;
  for (const u of [0.31, 0.63]) seams += `M${r0(tq(u, 0)[0])},${r0(tq(u, 0)[1])}L${r0(tq(u, 0.25)[0])},${r0(tq(u, 0.25)[1])}`;
  S.add(`<path d="${seams}" stroke="${P.woodSeam}" stroke-width="1.6" opacity=".8" fill="none"/>`);
  S.add(`<path d="M${r0(TQ.fl[0])},${r0(TQ.fl[1])}L${r0(TQ.fr[0])},${r0(TQ.fr[1])}" stroke="${night ? '#6a5040' : '#d8a470'}" stroke-width="2" opacity=".6"/>`);
}

function oldMap(S, P, night) {
  const U0 = 0.15, U1 = 0.5, W0 = 0.14, W1 = 0.88;
  const mp = (s, t) => tq(lerp(U0, U1, s), lerp(W0, W1, t));
  const sx = (pts) => pz(pts.map(([s, t]) => mp(s, t)));
  // shadow, the sheet with ragged corners, the folds
  S.add(`<path d="${pz([mp(0.02, -0.04), mp(1.04, -0.04), mp(1.04, 0.96), mp(0.02, 0.96)].map(([x, y]) => [x + 10, y + 4]))}" fill="${P.shadow}" opacity="${P.shadowOp}"/>`);
  S.add(`<path d="${sx([[0, 0], [0.32, 0.01], [0.66, -0.01], [1, 0], [1.01, 0.5], [1, 1], [0.66, 1.01], [0.33, 0.99], [0, 1], [0.01, 0.5]])}" fill="${S.lin(P.paper, 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  let folds = '';
  for (const s of [0.33, 0.66]) folds += `M${r0(mp(s, 0)[0])},${r0(mp(s, 0)[1])}L${r0(mp(s, 1)[0])},${r0(mp(s, 1)[1])}`;
  folds += `M${r0(mp(0, 0.5)[0])},${r0(mp(0, 0.5)[1])}L${r0(mp(1, 0.5)[0])},${r0(mp(1, 0.5)[1])}`;
  S.add(`<path d="${folds}" stroke="${P.faint}" stroke-width="1.4" opacity=".55" fill="none"/>`);
  // the sea in the lower right, a river, forest stipple and a row of little mountains — all faded ink
  S.add(`<path d="${sx([[0.64, 0], [1, 0], [1, 0.4], [0.92, 0.36], [0.86, 0.3], [0.8, 0.24], [0.74, 0.14], [0.68, 0.06]])}" fill="${P.sea}" opacity=".6"/>`);
  const river = [[0.46, 1], [0.5, 0.82], [0.47, 0.64], [0.55, 0.46], [0.62, 0.3], [0.7, 0.12]].map(([s, t]) => mp(s, t));
  S.add(`<path d="M${river.map(([x, y]) => `${r0(x)},${r0(y)}`).join('L')}" stroke="${P.sea}" stroke-width="2" fill="none" opacity=".8"/>`);
  const R = rng(8131);
  let dots = '';
  for (let i = 0; i < 26; i++) { const [x, y] = mp(R.range(0.42, 0.62), R.range(0.2, 0.42)); dots += ell(x, y, 2.6, 1.6); }
  S.add(`<path d="${dots}" fill="${P.forest}" opacity=".7"/>`);
  let mts = '';
  for (let i = 0; i < 6; i++) { const [x, y] = mp(0.1 + i * 0.12, 0.9); mts += `M${r0(x - 9)},${r0(y + 3)}L${r0(x)},${r0(y - 7)}L${r0(x + 9)},${r0(y + 3)}`; }
  S.add(`<path d="${mts}" stroke="${P.faint}" stroke-width="1.6" fill="none" opacity=".8"/>`);
  // the pencilled road: from the town west to the mill, back past the town, down to the forest edge and the harbour
  // (looping there), out and away, and round again to the north slope beside the very first circle
  const stops = [[0.3, 0.56], [0.17, 0.64], [0.36, 0.4], [0.52, 0.28], [0.72, 0.2], [0.86, 0.5], [0.7, 0.76], [0.4, 0.72]];
  const route = [stops[0], stops[1], [0.24, 0.52], stops[2], stops[3], stops[4], [0.78, 0.14], [0.68, 0.16], stops[4], [0.82, 0.34], stops[5], stops[6], [0.54, 0.8], stops[7]].map(([s, t]) => mp(s, t));
  S.add(`<path d="M${route.map(([x, y]) => `${r0(x)},${r0(y)}`).join('L')}" stroke="${P.ink}" stroke-width="2.2" stroke-dasharray="7 5" fill="none" stroke-linecap="round" opacity=".85"/>`);
  let circ = '';
  stops.slice(0, 7).forEach(([s, t]) => { const [x, y] = mp(s, t); circ += ell(x, y, 8, 5); });
  S.add(`<path d="${circ}" stroke="${P.ink}" stroke-width="2" fill="${night ? '#b0a48c' : '#f6e8c8'}"/>`);
  // the second leg into the mill, pressed hard
  const [ax, ay] = mp(...stops[0]), [bx, by] = mp(...stops[1]);
  S.add(`<path d="M${r0(ax)},${r0(ay)}L${r0(bx)},${r0(by)}" stroke="${P.ink}" stroke-width="3.4" fill="none" opacity=".75"/>`);
  if (night) { const [x, y] = mp(...stops[7]); S.add(`<path d="${ell(x, y, 9, 6)}" stroke="${P.ink}" stroke-width="2.6" fill="#9a8a70"/><path d="${ell(x, y, 3, 2)}" fill="${P.ink}"/>`); }
  // four stones on the corners
  let st = '';
  for (const [s, t, w] of [[0.02, 0.02, 15], [0.98, 0.03, 11], [0.99, 0.95, 9], [0.03, 0.96, 12]]) { const [x, y] = mp(s, t); st += ell(x, y, w, w * 0.62); }
  S.add(`<path d="${st}" fill="${night ? '#4a4850' : '#8a8478'}"/>`);
  let sth = '';
  for (const [s, t, w] of [[0.02, 0.02, 15], [0.98, 0.03, 11], [0.99, 0.95, 9], [0.03, 0.96, 12]]) { const [x, y] = mp(s, t); sth += ell(x - w * 0.25, y - w * 0.2, w * 0.45, w * 0.25); }
  S.add(`<path d="${sth}" fill="${night ? '#6a6870' : '#c4bcac'}"/>`);
  // the pencil, lying by the near right corner
  const [px, py] = mp(0.86, -0.12);
  S.add(`<path d="M${r0(px - 60)},${r0(py + 10)}L${r0(px + 40)},${r0(py - 4)}L${r0(px + 52)},${r0(py - 3)}L${r0(px + 41)},${r0(py + 2)}L${r0(px - 59)},${r0(py + 16)}Z" fill="${night ? '#8a7a3a' : '#e0b84a'}"/><path d="M${r0(px + 40)},${r0(py - 4)}L${r0(px + 52)},${r0(py - 3)}L${r0(px + 41)},${r0(py + 2)}Z" fill="${night ? '#5a4a3a' : '#c8a07a'}"/>`);
}

function lantern(S, u, w, lit, P) {
  const [x, y] = tq(u, w), s = depth(u) * 1.45;
  if (lit) S.add(`<ellipse cx="${r0(x)}" cy="${r0(y - 30 * s)}" rx="${r0(620)}" ry="${r0(360)}" fill="${S.rad([[0, '#ffd08a', 0.55], [0.35, '#f0a050', 0.2], [1, '#f0a050', 0]])}"/>`);
  S.add(`<path d="${ell(x + 14 * s, y + 2, 22 * s, 6 * s)}" fill="${P.shadow}" opacity="${P.shadowOp}"/>`);
  S.add(`<path d="M${f1(x - 14 * s)},${f1(y)}h${f1(28 * s)}v${f1(-8 * s)}h${f1(-28 * s)}z" fill="#3a2a1e"/>`);
  S.add(`<path d="M${f1(x - 11 * s)},${f1(y - 8 * s)}h${f1(22 * s)}l${f1(-3 * s)},${f1(-38 * s)}h${f1(-16 * s)}z" fill="${lit ? '#ffe0a0' : '#8a8a8a'}" opacity="${lit ? 0.95 : 0.55}"/>`);
  if (lit) S.add(`<path d="M${f1(x)},${f1(y - 12 * s)}q${f1(-6 * s)},${f1(-12 * s)} 0,${f1(-26 * s)}q${f1(6 * s)},${f1(14 * s)} 0,${f1(26 * s)}z" fill="#fff6d8"/>`);
  S.add(`<path d="M${f1(x - 11 * s)},${f1(y - 8 * s)}l${f1(3 * s)},${f1(-38 * s)}M${f1(x + 11 * s)},${f1(y - 8 * s)}l${f1(-3 * s)},${f1(-38 * s)}M${f1(x - 10 * s)},${f1(y - 46 * s)}h${f1(20 * s)}" stroke="#2a1e16" stroke-width="${f1(2.4 * s)}" fill="none"/><path d="M${f1(x - 6 * s)},${f1(y - 46 * s)}q${f1(6 * s)},${f1(-14 * s)} ${f1(12 * s)},0" stroke="#2a1e16" stroke-width="${f1(2 * s)}" fill="none"/>`);
}

function folder(S, u, P) {
  S.add(`<path d="${pz([tq(u + 0.012, 0.2), tq(u + 0.1, 0.2), tq(u + 0.1, 0.76), tq(u + 0.012, 0.76)].map(([x, y]) => [x + 6, y + 3]))}" fill="${P.shadow}" opacity="${P.shadowOp}"/>`);
  S.add(`<path d="${quad(u, u + 0.09, 0.22, 0.78)}" fill="#4a3022"/><path d="${quad(u + 0.004, u + 0.086, 0.26, 0.74)}" fill="#5e3e2a"/>`);
  const [a, b] = [tq(u + 0.045, 0.22), tq(u + 0.045, 0.78)];
  S.add(`<path d="M${r0(a[0])},${r0(a[1])}L${r0(b[0])},${r0(b[1])}" stroke="#2a1a10" stroke-width="3"/>`);
}

function cups(S, P) {
  for (const [u, w] of [[0.575, 0.3], [0.6, 0.66], [0.63, 0.4], [0.655, 0.7]]) {
    const [x, y] = tq(u, w), s = depth(u) * 1.4;
    S.add(`<path d="${ell(x + 8 * s, y + 1, 14 * s, 4 * s)}" fill="${P.shadow}" opacity="${P.shadowOp}"/><path d="M${f1(x - 9 * s)},${f1(y - 22 * s)}V${f1(y)}a${f1(9 * s)},${f1(3 * s)} 0 0 0 ${f1(18 * s)},0V${f1(y - 22 * s)}z" fill="#8a8e96"/><path d="${ell(x, y - 22 * s, 9 * s, 3 * s)}" fill="#5a3a24"/><path d="M${f1(x - 7 * s)},${f1(y - 20 * s)}v${f1(16 * s)}" stroke="#e8e0d0" stroke-width="${f1(2 * s)}" opacity=".7"/><path d="M${f1(x + 9 * s)},${f1(y - 18 * s)}q${f1(8 * s)},${f1(2 * s)} 0,${f1(12 * s)}" stroke="#6a6e76" stroke-width="${f1(2.2 * s)}" fill="none"/>`);
  }
  // the small jug of rationed ale and the basket of bread
  const [jx, jy] = tq(0.69, 0.5), js = depth(0.69) * 1.35;
  S.add(`<path d="${ell(jx + 12 * js, jy + 2, 22 * js, 6 * js)}" fill="${P.shadow}" opacity="${P.shadowOp}"/><path d="M${f1(jx - 8 * js)},${f1(jy - 40 * js)}h${f1(16 * js)}v${f1(6 * js)}q${f1(12 * js)},${f1(6 * js)} ${f1(12 * js)},${f1(18 * js)}v${f1(12 * js)}q0,${f1(6 * js)} ${f1(-8 * js)},${f1(6 * js)}h${f1(-24 * js)}q${f1(-8 * js)},0 ${f1(-8 * js)},${f1(-6 * js)}v${f1(-12 * js)}q0,${f1(-12 * js)} ${f1(12 * js)},${f1(-18 * js)}z" fill="#8a5a3a"/><path d="M${f1(jx - 14 * js)},${f1(jy - 16 * js)}q${f1(-2 * js)},${f1(8 * js)} 0,${f1(14 * js)}" stroke="#d8a070" stroke-width="${f1(2 * js)}" fill="none" opacity=".7"/>`);
  const [bx, by] = tq(0.76, 0.45), bs = depth(0.76) * 1.35;
  S.add(`<path d="${ell(bx + 12 * bs, by + 3, 46 * bs, 10 * bs)}" fill="${P.shadow}" opacity="${P.shadowOp}"/><path d="M${f1(bx - 40 * bs)},${f1(by - 16 * bs)}q${f1(40 * bs)},${f1(14 * bs)} ${f1(80 * bs)},0l${f1(-8 * bs)},${f1(18 * bs)}q${f1(-32 * bs)},${f1(8 * bs)} ${f1(-64 * bs)},0z" fill="#9a6a3a"/>`);
  S.add(`<path d="${ell(bx - 14 * bs, by - 20 * bs, 18 * bs, 9 * bs)}${ell(bx + 12 * bs, by - 22 * bs, 20 * bs, 10 * bs)}${ell(bx - 1 * bs, by - 28 * bs, 16 * bs, 8 * bs)}" fill="#b07a40"/><path d="M${f1(bx - 22 * bs)},${f1(by - 23 * bs)}l${f1(10 * bs)},${f1(-3 * bs)}M${f1(bx + 4 * bs)},${f1(by - 25 * bs)}l${f1(12 * bs)},${f1(-3 * bs)}" stroke="#e0b070" stroke-width="${f1(2 * bs)}"/><path d="M${f1(bx - 40 * bs)},${f1(by - 16 * bs)}q${f1(40 * bs)},${f1(14 * bs)} ${f1(80 * bs)},0" stroke="#6a4424" stroke-width="${f1(2.4 * bs)}" fill="none"/>`);
}

function scene(night) {
  const P = night ? PAL.night : PAL.dusk;
  const S = night
    ? new Scene('sbEx8Night', '北山缓坡·营地·灯下的长桌：同一张长桌入夜，星空和一轮高月，桌上一盏亮着的灯、四个锡杯、一小坛酒、一篮面包和摊开的旧地图，最后一站多了一个记号；坡上帐篷里透出灯光，杆子上挂着几盏灯；不画人', 8201)
    : new Scene('sbEx8Dusk', '北山缓坡·营地·黄昏的长桌：夕阳落在远处的山脊后面，坡下是赫麦的麦田，坡上一排帐篷；近处一张长桌，摊开一张旧地图，铅笔画的小圈连成一条路线，用石头压着角，旁边一支铅笔、一本合上的报告夹和一盏没点的灯；不画人', 8101);
  sky(S, P, night);
  farLand(S, P, night);
  camp(S, P, night);
  tableTop(S, P, night);
  oldMap(S, P, night);
  if (night) { lantern(S, 0.53, 0.6, true, P); cups(S, P); folder(S, 0.85, P); }
  else { lantern(S, 0.56, 0.56, false, P); folder(S, 0.66, P); }
  // low warm sun across the table at dusk / the cool of night pressing in at the edges
  if (!night) S.add(`<path d="${pz([TQ.nl, TQ.nr, TQ.fr, TQ.fl])}" fill="${S.lin([[0, '#ffd8a0', 0.22], [0.6, '#ffd8a0', 0.05], [1, '#5a3a4a', 0.18]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad(night ? [[0.45, '#05060c', 0], [1, '#05060c', 0.65]] : [[0.5, '#2a1a22', 0], [1, '#2a1a22', 0.45]], 'cx="0.42" cy="0.55" r="0.8"')}"/>`);
  return S.out();
}

export const ex008Bgs = {
  'north-slope-camp-anniversary-dusk': () => scene(false),
  'north-slope-camp-anniversary-night': () => scene(true),
};
