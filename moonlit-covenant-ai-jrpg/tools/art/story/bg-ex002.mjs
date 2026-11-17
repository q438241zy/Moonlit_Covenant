// 番外 ex002 的场景背景（剧本/番外/ex002退潮的沙洲.md〈美術需求〉）：fog-harbor-sandbar（雾港外海·沙洲·退潮）、fog-harbor-sandbar-dusk（雾港外海·沙洲·黄昏涨潮）。
//   fog-harbor-sandbar      — 白天，退潮：雾港外海一片长长的沙洲，沙嘴一直伸到右边天边；近处湿沙上的波纹、贝壳、一截漂白的
//                             流木，几洼潮池（平涂的水色，不映出任何东西）；左中一道矮沙丘；沙洲中间一根竹竿，半腰系着一块红布；
//                             右边浅水里搁着船家的平底船，后半截搭着帆布船篷，一根撑篙插在沙里；天边是雾港的轮廓——
//                             一排低低的高脚木屋和一片沼林，最外面石堤上的旧灯塔；海上两三片小帆，天上几只海鸥。
//   fog-harbor-sandbar-dusk — 同一片沙洲，黄昏涨潮：低处都淹了，沙嘴和潮池没进水里，只剩沙丘那一块和近处一条沙；
//                             竹竿立在水里，水面离红布只差一点；平底船浮在水上，船篷柱上挂着一盏点亮的灯；
//                             雾港的木屋亮起几扇窗，旧灯塔是暗的；天是橘红到紫的渐层，太阳低在左边的雾里。
// 两张都不画人、不画字；水一律平涂加水流线，不画倒影（coast.mjs 的规矩，也是塞雷娜「水面，不看」的那一面）。
import { Scene, W, H, f, pz, pl, shape, cloud, bird } from './lib.mjs';
import { currents, treeLine, mudSheen } from './coast.mjs';

const r0 = (v) => f(v, 0);
const HZ = 330; // horizon

const PAL = {
  day: {
    sky: [[0, '#8fb6cc'], [0.55, '#c4dae2'], [1, '#e6eeec']], sun: '#fffbe8', cloud: { shade: '#c6d4dc', lit: '#f6f8f6', rim: '#ffffff' },
    far: '#9fb0b4', far2: '#b6c4c6', tower: '#8e9ca2', towerShade: '#78868c', winLit: null,
    sea: [[0, '#9ec2c6'], [0.35, '#6e9ea4'], [1, '#3e6e76']], cur: '#d8ecea', foam: '#f4faf8',
    wet: '#a8987a', wetDark: '#8a7c62', dry: [[0, '#eadcc0'], [1, '#d6c4a2']], dune: '#efe2c6', duneShade: '#cdb994', ripple: '#7a6c54', sheen: '#f2eee2',
    pool: '#7fb2b2', poolRim: '#7a6e56', poolLine: '#c8e4e0', rock: '#6e6a62', rockLit: '#9a958a', barnacle: '#d8d2c4',
    weed: '#4e5a3a', grass: '#9a9a62', log: '#b8ae9c', logShade: '#8a8070', shell: '#f4ece0', shellPink: '#e8b8aa', shellShade: '#b8a890',
    pole: '#b8a46a', poleShade: '#8a7a4a', cloth: '#c8323a', clothShade: '#8e1e26',
    hull: '#5a4634', hullLit: '#7e6448', hullDark: '#3a2c22', canvas: '#d4ccb4', canvasShade: '#a8a088', rope: '#a8966e',
    sail: '#e8e4d8', gull: '#4a5054', haze: '#e6eeee', grade: [[0, '#ffffff', 0.06], [0.5, '#ffffff', 0], [1, '#1a2a30', 0.32]],
  },
  dusk: {
    sky: [[0, '#2e2c4a'], [0.4, '#7a4e66'], [0.75, '#e2966e'], [1, '#f4c48a']], sun: '#ffe0a0', cloud: { shade: '#6a4a62', lit: '#e8a07a', rim: '#ffd29a' },
    far: '#4a3e4c', far2: '#6a5260', tower: '#3e3442', towerShade: '#2e2834', winLit: '#ffc878',
    sea: [[0, '#b88a7a'], [0.3, '#6a5a6e'], [1, '#2a2a3e']], cur: '#f0b88a', foam: '#f6dcc4',
    wet: '#7a6252', wetDark: '#5e4a40', dry: [[0, '#c89a7a'], [1, '#8e6e5e']], dune: '#d8a882', duneShade: '#7a5a54', ripple: '#4e3c38', sheen: '#f4c89a',
    pool: '#6a5a6e', poolRim: '#4e3c38', poolLine: '#f0b88a', rock: '#3e3238', rockLit: '#8a6a5e', barnacle: '#b89a8a',
    weed: '#2e2a26', grass: '#7a6248', log: '#9a7e6c', logShade: '#5e4a44', shell: '#f0c8a8', shellPink: '#e09888', shellShade: '#8e6a5e',
    pole: '#9a7a54', poleShade: '#5e4a36', cloth: '#b82a34', clothShade: '#6e1820',
    hull: '#3e2e26', hullLit: '#8a5a3e', hullDark: '#241a16', canvas: '#b89a84', canvasShade: '#7a6258', rope: '#8a6e56',
    sail: '#d8b8a0', gull: '#2a2228', haze: '#f0b890', grade: [[0, '#2a1a3a', 0.12], [0.5, '#2a1a3a', 0], [1, '#140e1e', 0.42]],
  },
};

// the day sandbar's outline: far edge left→right, then the lagoon edge on the right coming back down to the bottom
const SAND_DAY = [[-20, 515], [120, 500], [260, 478], [420, 468], [560, 470], [700, 482], [820, 500], [940, 492], [1060, 470], [1180, 446], [1300, 420], [1420, 398], [1540, 384], [1620, 380],
  [1620, 394], [1500, 418], [1390, 450], [1310, 498], [1252, 556], [1206, 630], [1176, 712], [1172, 812], [1196, 920], [-20, 920]];
const DRY_DAY = [[-20, 540], [140, 524], [280, 500], [430, 490], [560, 492], [690, 504], [800, 524], [930, 518], [1050, 496], [1170, 474], [1290, 448], [1400, 428], [1480, 414],
  [1380, 446], [1290, 494], [1226, 552], [1180, 628], [1146, 712], [1140, 812], [1160, 920], [-20, 920]];
// at dusk the low ground is under water: the spit and the pools are gone; the dune and a strip of the near sand are left
const SAND_DUSK = [[-20, 522], [120, 507], [260, 486], [420, 476], [560, 480], [680, 496], [760, 522], [802, 566], [818, 626], [802, 704], [768, 782], [746, 862], [760, 920], [-20, 920]];
const DRY_DUSK = [[-20, 548], [140, 532], [280, 506], [430, 498], [560, 502], [670, 516], [736, 546], [770, 600], [772, 680], [738, 770], [712, 860], [722, 920], [-20, 920]];

const POOLS = [[640, 590, 84, 15], [860, 556, 56, 10], [300, 642, 118, 22], [980, 690, 132, 26], [560, 778, 176, 32], [150, 740, 92, 18]];
const POLE = { x: 980, base: 560, top: 380, lean: -8, clothY: 470 };
const BOAT = { day: [1336, 632], dusk: [1270, 660] };

function sky(S, P, dusk) {
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(P.sky, `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HZ}"`)}"/>`);
  const [sx, sy, sr] = dusk ? [260, 290, 520] : [240, 90, 620];
  S.add(`<circle cx="${sx}" cy="${sy}" r="${sr}" fill="${S.rad([[0, P.sun, dusk ? 0.75 : 0.6], [0.35, P.sun, 0.22], [1, P.sun, 0]])}"/>`);
  if (dusk) S.add(`<circle cx="${sx}" cy="${sy}" r="34" fill="#fff0c8" opacity=".9"/>`);
  const R = S.R;
  for (const [x, y, w, h] of dusk ? [[520, 200, 300, 60], [980, 150, 360, 70], [1340, 230, 240, 46], [60, 150, 220, 40]] : [[560, 170, 280, 80], [1020, 120, 340, 96], [1360, 210, 220, 56], [80, 230, 200, 44]]) {
    S.add(cloud(R, x, y, w, h, P.cloud, { bumps: 6, light: -1, flat: 0.1 }));
  }
}

function harbor(S, P, dusk) {
  const R = S.R;
  // the marsh forest behind the town, two depths
  S.add(`<path d="${treeLine(R, 40, 820, HZ + 2, 10, 26, HZ + 4, { step: 18, spireP: 0.2 })}" fill="${P.far2}"/>`);
  S.add(`<path d="${treeLine(R, 120, 700, HZ + 3, 6, 16, HZ + 5, { step: 14, spireP: 0.15 })}" fill="${P.far}" opacity=".85"/>`);
  // stilt houses along the water
  let hs = '', st = '', win = '';
  for (let x = 110; x < 690;) {
    const w = R.range(18, 34), h = R.range(10, 20), b = HZ + 1, roof = h * 0.55;
    hs += `M${r0(x)},${r0(b - 3)}V${r0(b - 3 - h)}L${f(x + w / 2)},${r0(b - 3 - h - roof)}L${r0(x + w)},${r0(b - 3 - h)}V${r0(b - 3)}Z`;
    st += `M${r0(x + 2)},${r0(b - 3)}V${r0(b + 3)}M${r0(x + w - 2)},${r0(b - 3)}V${r0(b + 3)}`;
    if (dusk && R() < 0.45) win += `M${f(x + w * 0.4)},${f(b - 3 - h * 0.7)}h3v3h-3z`;
    x += w + R.range(2, 14);
  }
  S.add(`<path d="${hs}" fill="${P.far}"/><path d="${st}" stroke="${P.far}" stroke-width="1.5"/>`);
  if (win) S.add(`<path d="${win}" fill="${P.winLit}"/>`);
  // the outermost mole and the old lighthouse on it (no lens: the lamp room is dark)
  S.add(`<path d="M690,${HZ + 3}L800,${HZ + 1}L812,${HZ + 4}L688,${HZ + 6}Z" fill="${P.towerShade}"/>`);
  S.add(`<path d="M770,${HZ + 2}L773,${HZ - 60}H787L790,${HZ + 2}Z" fill="${P.tower}"/><path d="M782,${HZ + 2}L781,${HZ - 60}H787L790,${HZ + 2}Z" fill="${P.towerShade}"/>`);
  S.add(`<path d="M771,${HZ - 60}h18v-3h-18zM774,${HZ - 63}v-9h12v9z" fill="${P.towerShade}"/><path d="M773,${HZ - 72}q7,-8 14,0z" fill="${P.tower}"/>`);
  // a few far sails on the sea
  let sl = '', hl = '';
  for (const [x, y, s] of [[900, HZ + 8, 0.8], [1090, HZ + 5, 0.6], [1210, HZ + 12, 1]]) {
    sl += `M${r0(x)},${r0(y - 2)}l${f(6 * s)},${f(-18 * s)}l${f(5 * s)},${f(18 * s)}z`;
    hl += `M${f(x - 5 * s)},${r0(y - 2)}h${f(20 * s)}l${f(-3 * s)},${f(4 * s)}h${f(-14 * s)}z`;
  }
  S.add(`<path d="${sl}" fill="${P.sail}" opacity=".85"/><path d="${hl}" fill="${P.far}"/>`);
  // haze lying on the horizon
  S.add(`<rect y="${HZ - 40}" width="${W}" height="70" fill="${S.lin([[0, P.haze, 0], [0.6, P.haze, dusk ? 0.35 : 0.5], [1, P.haze, 0]])}"/>`);
}

function sea(S, P) {
  S.add(`<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="${S.lin(P.sea, `gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="${H}"`)}"/>`);
  S.add(currents(S.R, 0, W, HZ + 6, H - 10, 90, P.cur, 0.42));
}


// smooth closed outline; points on the frame edge (x ≤ -20, x ≥ 1620, y ≥ 920) stay sharp corners
const smooth = (pts) => shape(pts.map(([x, y]) => (x <= -20 || x >= 1620 || y >= 920 ? [x, y, 1] : [x, y])), true, 0);
// an organic flat patch (pool, rim) as a smooth closed curve
function blob(R, cx, cy, rx, ry, n = 9) {
  const pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = R.range(0.82, 1.1); pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  return shape(pts, true, 0);
}

// short foam strokes lapping along a list of edge points (offset toward the water by dx / dy)
function foam(pts, P, dx = 0, dy = -4) {
  let d = '';
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const mx = (ax + bx) / 2 + dx, my = (ay + by) / 2 + dy;
    d += `M${r0(ax + dx)},${r0(ay + dy)}Q${r0(mx)},${r0(my - 3)} ${r0(bx + dx)},${r0(by + dy)}`;
  }
  return `<path d="${d}" fill="none" stroke="${P.foam}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`;
}

function sand(S, P, dusk) {
  const R = S.R;
  const outline = dusk ? SAND_DUSK : SAND_DAY, dry = dusk ? DRY_DUSK : DRY_DAY;
  const sandPath = smooth(outline);
  // wet sand, the foam where the water laps it, then the drier middle and the dune on top
  S.add(`<path d="${sandPath}" fill="${P.wet}"/>`);
  S.add(foam(outline.slice(0, dusk ? 13 : 14), P));
  if (!dusk) S.add(foam(outline.slice(14, 23), P, 6, 0));
  S.add(`<path d="${smooth(dry)}" fill="${S.lin(P.dry, `gradientUnits="userSpaceOnUse" x1="0" y1="470" x2="0" y2="${H}"`)}"/>`);
  const clip = S.clip(sandPath);
  // the dune: a low mound left of centre, lit from the left, its right flank in shade
  const dune = [[230, 506], [330, 474], [430, 454], [530, 451], [630, 463], [712, 494], [680, 518], [560, 512], [420, 514], [300, 518]];
  S.add(`<path d="${shape(dune, true, 0)}" fill="${P.dune}"/><path d="${shape([[540, 452], [630, 463], [712, 494], [682, 517], [610, 511], [580, 486]], true, 0)}" fill="${P.duneShade}" opacity=".55"/>`);
  if (dusk) S.add(`<path d="${shape([[712, 494], [760, 520], [790, 548], [700, 534], [650, 516]], true, 0)}" fill="${P.duneShade}" opacity=".45"/>`); // the long evening shadow
  // dune grass tufts
  let gr = '';
  for (let i = 0; i < 26; i++) {
    const x = R.range(300, 690), y = R.range(464, 512), h = R.range(8, 18);
    for (let k = -1; k <= 1; k++) gr += `M${r0(x)},${r0(y)}q${f(k * 3)},${f(-h * 0.6)} ${f(k * 6 + R.range(-2, 2))},${f(-h)}`;
  }
  S.add(`<path d="${gr}" fill="none" stroke="${P.grass}" stroke-width="1.6" stroke-linecap="round"/>`);
  // ripple marks on the wet and damp sand, larger toward the viewer
  let rp = '';
  for (let i = 0; i < 150; i++) {
    const y = 520 + (H - 520) * R() ** 0.85, x = R.range(-10, dusk ? 800 : 1240), t = (y - 520) / (H - 520), L = 10 + 44 * t;
    if (x > 230 && x < 720 && y < 525) continue;
    rp += `M${r0(x)},${r0(y)}q${f(L * 0.5)},${f(-2 - 3 * t)} ${r0(L)},0`;
  }
  S.add(`<g clip-path="${clip}"><path d="${rp}" fill="none" stroke="${P.ripple}" stroke-width="1.4" opacity=".35"/>${mudSheen(R, -10, dusk ? 800 : 1240, 520, H, 60, P.sheen, 0.35)}</g>`);
  return { clip, outline };
}

function pools(S, P) {
  const R = S.R;
  let rim = '', water = '', lines = '', rocks = '', rlit = '', barn = '';
  for (const [cx, cy, rx, ry] of POOLS) {
    rim += blob(R, cx, cy + 1, rx * 1.14, ry * 1.3);
    water += blob(R, cx, cy, rx, ry);
    // current streaks on the flat water (not reflections)
    for (let k = 0; k < 3; k++) { const y = cy + R.range(-ry * 0.4, ry * 0.4), x = cx + R.range(-rx * 0.5, rx * 0.1), L = rx * R.range(0.3, 0.6); lines += `M${r0(x)},${r0(y)}q${f(L / 2)},-1.5 ${r0(L)},0`; }
    // a couple of rocks on the rim, with barnacles
    for (let k = 0; k < 2; k++) {
      const a = R.range(0.2, 1) * Math.PI * (k ? 1 : -1), x = cx + Math.cos(a) * rx * 0.95, y = cy + Math.sin(a) * ry * 0.9, s = ry * R.range(0.5, 0.9);
      rocks += `M${r0(x - s * 1.4)},${r0(y + s * 0.3)}Q${r0(x - s)},${r0(y - s)} ${r0(x)},${r0(y - s * 0.9)}Q${r0(x + s * 1.3)},${r0(y - s * 0.6)} ${r0(x + s * 1.4)},${r0(y + s * 0.3)}Z`;
      rlit += `M${r0(x - s * 1.2)},${r0(y + s * 0.1)}Q${r0(x - s * 0.8)},${r0(y - s * 0.8)} ${r0(x)},${r0(y - s * 0.8)}`;
      for (let j = 0; j < 4; j++) barn += `M${f(x + R.range(-s, s))},${f(y + R.range(-s * 0.4, s * 0.2))}h1.6`;
    }
  }
  S.add(`<path d="${rim}" fill="${P.poolRim}" opacity=".6"/><path d="${water}" fill="${P.pool}"/><path d="${lines}" fill="none" stroke="${P.poolLine}" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>`);
  S.add(`<path d="${rocks}" fill="${P.rock}"/><path d="${rlit}" fill="none" stroke="${P.rockLit}" stroke-width="2" opacity=".8"/><path d="${barn}" stroke="${P.barnacle}" stroke-width="1.6" stroke-linecap="round"/>`);
}

// shells, seaweed and the bleached driftwood log in the foreground
function litter(S, P, dusk, clip) {
  const R = S.R;
  let sh = '', shP = '', shL = '', wd = '';
  const fan = (x, y, s) => `M${f(x - s)},${f(y)}Q${f(x - s * 1.1)},${f(y - s * 1.2)} ${f(x)},${f(y - s * 1.5)}Q${f(x + s * 1.1)},${f(y - s * 1.2)} ${f(x + s)},${f(y)}Q${f(x)},${f(y + s * 0.3)} ${f(x - s)},${f(y)}Z`;
  const ribs = (x, y, s) => `M${f(x)},${f(y)}L${f(x)},${f(y - s * 1.3)}M${f(x)},${f(y)}L${f(x - s * 0.7)},${f(y - s)}M${f(x)},${f(y)}L${f(x + s * 0.7)},${f(y - s)}`;
  const spiral = (x, y, s) => `M${f(x - s * 0.7)},${f(y)}a${f(s * 0.7)},${f(s * 0.5)} 0 1 1 ${f(s * 1.4)},0a${f(s * 0.7)},${f(s * 0.5)} 0 1 1 ${f(-s * 1.4)},0Z`;
  for (let i = 0; i < 46; i++) {
    const y = 540 + (H - 560) * R() ** 0.7, x = R.range(10, dusk ? 760 : 1150), s = 1.5 + 6 * (y - 540) / (H - 540);
    const kind = R(), pink = R();
    if (!dusk && POOLS.some(([cx, cy, rx, ry]) => ((x - cx) / (rx * 1.25)) ** 2 + ((y - cy) / (ry * 1.5)) ** 2 < 1)) continue; // not in the pools
    if (kind < 0.5) { if (pink < 0.3) shP += fan(x, y, s); else sh += fan(x, y, s); if (s > 4) shL += ribs(x, y, s); }
    else { sh += spiral(x, y, s); if (s > 4) shL += `M${f(x - s * 0.3)},${f(y)}a${f(s * 0.3)},${f(s * 0.22)} 0 1 1 ${f(s * 0.6)},0`; }
  }
  // a few big ones close to the viewer
  for (const [x, y, s, pink] of dusk ? [[520, 846, 11, 0], [640, 806, 9, 1]] : [[520, 846, 11, 0], [700, 812, 9, 1], [930, 860, 12, 0], [1060, 792, 8, 1]]) { if (pink) shP += fan(x, y, s); else sh += fan(x, y, s); shL += ribs(x, y, s); }
  S.add(`<g clip-path="${clip}"><path d="${sh}" fill="${P.shell}"/><path d="${shP}" fill="${P.shellPink}"/><path d="${shL}" fill="none" stroke="${P.shellShade}" stroke-width="1.2"/></g>`);
  // seaweed washed up on the sand side of the water edge
  const edge = dusk ? SAND_DUSK.slice(7, 12) : SAND_DAY.slice(18, 22);
  for (const [x, y] of edge) for (let k = 0; k < 2; k++) { const a = x - 30 + R.range(-8, 8), b = y + R.range(-6, 10); wd += `M${r0(a)},${r0(b)}q${f(R.range(5, 9))},${f(R.range(-4, 1))} ${f(R.range(12, 20))},${f(R.range(-1, 4))}`; }
  S.add(`<path d="${wd}" fill="none" stroke="${P.weed}" stroke-width="3" stroke-linecap="round" opacity=".7"/>`);
  // driftwood: a long bleached log lying in the near left, one branch stub, a knot, a lit upper edge
  S.add(`<path d="M60,868Q210,846 380,852Q394,858 392,868Q230,878 64,888Q52,878 60,868Z" fill="${P.log}"/><path d="M64,882Q230,872 392,866Q392,868 391,870Q230,882 64,890Z" fill="${P.logShade}"/>`
    + `<path d="M250,856l26,-30l8,4l-22,28z" fill="${P.log}"/><path d="M262,852l18,-22" stroke="${P.logShade}" stroke-width="2"/>`
    + `<path d="M64,867Q210,847 378,853" fill="none" stroke="${P.sheen}" stroke-width="2" opacity=".7"/>`
    + `<ellipse cx="150" cy="866" rx="9" ry="4" fill="${P.logShade}"/><path d="M90,868q80,-10 160,-8M300,860q40,-2 80,0" fill="none" stroke="${P.logShade}" stroke-width="1.5" opacity=".7"/>`);
}

function pole(S, P, dusk) {
  const { x, base, top, lean, clothY } = POLE;
  const wl = dusk ? clothY + 18 : base; // where the pole leaves the sand / the water
  const xb = x + lean * (wl - top) / (base - top);
  let s = '';
  if (!dusk) s += `<ellipse cx="${x + lean}" cy="${base + 2}" rx="26" ry="5" fill="${P.wetDark}" opacity=".6"/><path d="M${x + lean - 14},${base + 2}q14,-8 28,0z" fill="${P.wet}"/>`;
  else s += `<ellipse cx="${r0(xb)}" cy="${wl}" rx="22" ry="4" fill="none" stroke="${P.foam}" stroke-width="2" opacity=".7"/><ellipse cx="${r0(xb)}" cy="${wl + 2}" rx="38" ry="6" fill="none" stroke="${P.cur}" stroke-width="1.5" opacity=".45"/>`;
  s += `<path d="M${r0(xb - 3)},${wl}L${x - 2},${top}H${x + 2}L${r0(xb + 3)},${wl}Z" fill="${P.pole}"/><path d="M${r0(xb)},${wl}L${x},${top}H${x + 2}L${r0(xb + 3)},${wl}Z" fill="${P.poleShade}"/>`;
  // bamboo nodes
  let nd = '';
  for (let y = top + 22; y < wl - 4; y += 26) { const t = (y - top) / (base - top), xx = x + lean * t; nd += `M${f(xx - 3)},${y}h6`; }
  s += `<path d="${nd}" stroke="${P.poleShade}" stroke-width="2"/>`;
  // the red cloth tied at half height, flapping to the right
  const t = (clothY - top) / (base - top), cx = x + lean * t;
  s += `<path d="M${f(cx + 2)},${clothY - 8}Q${f(cx + 22)},${clothY - 14} ${f(cx + 40)},${clothY - 6}Q${f(cx + 52)},${clothY - 2} ${f(cx + 62)},${clothY - 8}L${f(cx + 56)},${clothY + 4}Q${f(cx + 44)},${clothY + 10} ${f(cx + 32)},${clothY + 6}Q${f(cx + 16)},${clothY + 2} ${f(cx + 2)},${clothY + 8}Z" fill="${P.cloth}"/>`;
  s += `<path d="M${f(cx + 30)},${clothY - 6}Q${f(cx + 42)},${clothY} ${f(cx + 56)},${clothY + 4}L${f(cx + 44)},${clothY + 9}Q${f(cx + 36)},${clothY + 4} ${f(cx + 30)},${clothY + 6}Z" fill="${P.clothShade}" opacity=".7"/>`;
  s += `<path d="M${f(cx - 3)},${clothY - 9}h7v18h-7z" fill="${P.clothShade}"/>`;
  S.add(s);
}

// the ferry: a flat-bottomed punt seen from the side and a little above, its raked bow up on the sand (day) or
// afloat (dusk), a canvas awning arched over the stern half
function boat(S, P, dusk) {
  const [bx, by] = dusk ? BOAT.dusk : BOAT.day;
  const L = 260, x0 = bx - L / 2, x1 = bx + L / 2;
  const G = (x) => by - 12 + (x - x0) / L * 12; // near gunwale: the bow sits a little higher
  const F = (x) => G(x) - 20; // far gunwale
  const B = (x) => G(x) + 30; // keel line (flat bottom)
  let s = '';
  // shadow on the sand / a ring on the water
  s += dusk ? `<ellipse cx="${bx}" cy="${by + 26}" rx="${L * 0.6}" ry="11" fill="none" stroke="${P.foam}" stroke-width="2" opacity=".5"/><ellipse cx="${bx + 10}" cy="${by + 30}" rx="${L * 0.75}" ry="15" fill="none" stroke="${P.cur}" stroke-width="1.4" opacity=".35"/>`
    : `<ellipse cx="${bx - 10}" cy="${by + 24}" rx="${L * 0.58}" ry="10" fill="${P.wetDark}" opacity=".35"/>`;
  // the inside: the far gunwale's inner face and the floor boards between the two gunwales
  s += `<path d="${pz([[x0 + 4, F(x0 + 4)], [x1 - 4, F(x1 - 4)], [x1, G(x1)], [x0 - 26, G(x0) - 2]])}" fill="${P.hullDark}"/>`;
  let pk = '';
  for (let k = 1; k < 7; k++) { const x = x0 + L * k / 7; pk += `M${r0(x - 6)},${r0(G(x) - 2)}L${r0(x + 4)},${r0(F(x) + 2)}`; }
  s += `<path d="${pk}" stroke="${P.hull}" stroke-width="2" opacity=".8"/>`;
  s += `<path d="${pl([[x0 + 4, F(x0 + 4)], [x1 - 4, F(x1 - 4)]])}" stroke="${P.hullLit}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
  // a thwart across the middle
  s += `<path d="${pz([[bx - 40, G(bx - 40) - 1], [bx - 18, G(bx - 18) - 1], [bx - 8, F(bx - 8) + 1], [bx - 30, F(bx - 30) + 1]])}" fill="${P.hullLit}"/>`;
  // the near side: raked bow, flat bottom, square stern
  s += `<path d="${pz([[x0 - 26, G(x0) - 2], [x1, G(x1)], [x1 - 6, B(x1)], [x0 + 30, B(x0 + 30)]])}" fill="${P.hull}"/>`;
  s += `<path d="M${r0(x0 - 10)},${r0(G(x0) + 10)}L${r0(x1 - 2)},${r0(G(x1) + 10)}M${r0(x0 + 8)},${r0(G(x0) + 20)}L${r0(x1 - 4)},${r0(G(x1) + 20)}" stroke="${P.hullDark}" stroke-width="1.6" opacity=".7"/>`;
  s += `<path d="M${r0(x0 - 26)},${r0(G(x0) - 2)}L${r0(x1)},${r0(G(x1))}" stroke="${P.hullLit}" stroke-width="4" stroke-linecap="round"/>`;
  // the awning: a half-barrel of canvas over the stern half; the bow-side opening dark, three hoops
  const a0 = bx + 18, a1 = x1 - 8, ah = 62;
  const top0 = (G(a0) + F(a0)) / 2 - ah, top1 = (G(a1) + F(a1)) / 2 - ah;
  s += `<path d="M${a0},${r0(G(a0))}C${a0 - 4},${r0(top0 + 10)} ${a0 + 8},${r0(top0)} ${a0 + 26},${r0(top0)}L${a1 - 22},${r0(top1)}C${a1 - 4},${r0(top1)} ${a1 + 4},${r0(top1 + 12)} ${a1},${r0(G(a1))}Z" fill="${P.canvas}"/>`;
  s += `<path d="M${a0},${r0(G(a0))}C${a0 - 4},${r0(top0 + 10)} ${a0 + 8},${r0(top0)} ${a0 + 26},${r0(top0)}C${a0 + 30},${r0(top0 + 16)} ${a0 + 26},${r0(F(a0) - 4)} ${a0 + 22},${r0(F(a0) + 2)}Z" fill="${P.hullDark}" opacity=".8"/>`;
  s += `<path d="M${a0 + 26},${r0(top0)}L${a1 - 22},${r0(top1)}" stroke="${P.sheen}" stroke-width="2" opacity=".5"/>`;
  let hoops = '';
  for (const t of [0.35, 0.68]) { const x = a0 + 26 + (a1 - 22 - a0 - 26) * t, yt = top0 + (top1 - top0) * t; hoops += `M${r0(x)},${r0(yt)}C${r0(x + 6)},${r0(yt + 20)} ${r0(x + 6)},${r0(G(x) - 20)} ${r0(x + 2)},${r0(G(x))}`; }
  s += `<path d="${hoops}" fill="none" stroke="${P.canvasShade}" stroke-width="2.4"/>`;
  s += `<path d="M${a1},${r0(G(a1))}C${a1 + 4},${r0(top1 + 12)} ${a1 - 4},${r0(top1)} ${a1 - 22},${r0(top1)}" fill="none" stroke="${P.canvasShade}" stroke-width="3"/>`;
  if (!dusk) {
    // the punting pole stuck in the shallows by the stern; a mooring line from the bow to a stake in the sand
    s += `<path d="M${x1 + 26},${by + 40}L${x1 + 56},${by - 170}" stroke="${P.poleShade}" stroke-width="5" stroke-linecap="round"/>`;
    s += `<path d="M${r0(x0 - 24)},${r0(G(x0))}Q${r0(x0 - 60)},${r0(G(x0) + 34)} ${r0(x0 - 96)},${r0(G(x0) + 30)}" fill="none" stroke="${P.rope}" stroke-width="2.4"/><path d="M${r0(x0 - 98)},${r0(G(x0) + 36)}v-18" stroke="${P.hullDark}" stroke-width="5" stroke-linecap="round"/>`;
  } else {
    // afloat: the pole laid along the gunwale, a lit lamp hung from the awning's front hoop
    s += `<path d="M${r0(x0 - 34)},${r0(G(x0) - 8)}L${r0(x1 + 30)},${r0(G(x1) - 6)}" stroke="${P.poleShade}" stroke-width="5" stroke-linecap="round"/>`;
    const lx = a0 + 14, ly = top0 + 22;
    s += `<circle cx="${lx}" cy="${r0(ly + 12)}" r="34" fill="${S.rad([[0, '#ffd28a', 0.55], [1, '#ffd28a', 0]])}"/><path d="M${lx},${r0(ly - 4)}v6" stroke="${P.hullDark}" stroke-width="2"/><rect x="${lx - 6}" y="${r0(ly + 2)}" width="12" height="16" fill="#ffd28a"/><rect x="${lx - 7}" y="${r0(ly)}" width="14" height="3" fill="${P.hullDark}"/>`;
  }
  S.add(s);
}

function gulls(S, P, dusk) {
  let d = '';
  for (const [x, y, s, fl] of dusk ? [[1120, 180, 1.1, 0.3], [1180, 214, 0.8, 0.8]] : [[860, 150, 1.2, 0.2], [930, 196, 0.9, 0.7], [1240, 120, 1, 0.5], [1300, 160, 0.7, 0.9], [420, 250, 0.6, 0.4]]) d += bird(x, y, s, fl);
  S.add(`<path d="${d}" fill="${P.gull}"/>`);
  // one gull standing on the pool rocks (day only)
  if (!dusk) S.add(`<path d="M1060,676q6,-12 16,-12q8,0 10,6l8,-2l-7,5q-2,8 -12,9h-10z" fill="#f2f2ee"/><path d="M1064,668q10,-6 22,4l-14,2z" fill="#9aa2a6"/><path d="M1070,684v10M1076,684v10" stroke="#d89a3a" stroke-width="1.6"/>`);
}

function sandbar(mode) {
  const dusk = mode === 'dusk';
  const P = PAL[mode];
  const S = dusk
    ? new Scene('sbEx002Dusk', '雾港外海·沙洲·黄昏涨潮：同一片沙洲，低处都淹了，只剩沙丘那一块和近处一条沙；竹竿立在水里，水面离半腰的红布只差一点；平底船浮在水上，船篷前一盏点亮的灯；远处雾港的木屋亮起几扇窗，石堤上的旧灯塔是暗的；天从紫到橘红，太阳低在左边的雾里；不画人', 20202)
    : new Scene('sbEx002Sand', '雾港外海·沙洲·退潮：一片长长的沙洲，沙嘴伸到天边；近处湿沙上有波纹、贝壳和一截漂白的流木，几洼潮池，左中一道矮沙丘；沙洲中间一根竹竿，半腰系着红布；右边浅水里搁着搭帆布船篷的平底船，船尾插着一根撑篙；天边是雾港的高脚木屋、沼林和石堤上的旧灯塔，海上几片小帆，天上几只海鸥；不画人', 20201);
  sky(S, P, dusk);
  harbor(S, P, dusk);
  sea(S, P);
  const { clip } = sand(S, P, dusk);
  if (!dusk) pools(S, P);
  litter(S, P, dusk, clip);
  pole(S, P, dusk);
  boat(S, P, dusk);
  gulls(S, P, dusk);
  if (dusk) {
    // the flooded pools: faint current lines where they were, out on the open water
    let rings = '';
    for (const [cx, cy, rx] of POOLS) if (cx > 820) rings += `M${r0(cx - rx * 0.6)},${r0(cy)}q${r0(rx * 0.6)},-3 ${r0(rx * 1.2)},0`;
    S.add(`<path d="${rings}" fill="none" stroke="${P.cur}" stroke-width="1.6" opacity=".4"/>`);
    // warm low light from the left grazing the scene
    S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#ffb070', 0.18], [0.5, '#ffb070', 0], [1, '#ffb070', 0]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  }
  // grade and the dialogue band
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(P.grade)}"/>`);
  S.add(`<rect y="620" width="${W}" height="280" fill="${S.lin([[0, '#0a1014', 0], [1, '#0a1014', dusk ? 0.4 : 0.26]])}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.55, '#0a0c10', 0], [1, '#0a0c10', dusk ? 0.45 : 0.28]], 'cx="0.5" cy="0.45" r="0.8"')}"/>`);
  return S.out();
}

export const ex002Bgs = {
  'fog-harbor-sandbar': () => sandbar('day'),
  'fog-harbor-sandbar-dusk': () => sandbar('dusk'),
};
