// Night of the attack: dragon-sky, village-burning, north-trail-night, shepherd-cave-night, south-ridge.
import { Scene, W, H, f, pz, pl, shape, cloud, ridge, rays, stars, fbm, noise1, house, bellTower, skeleton, star7, rock, pine, smoke, blackFlame, flameMass, billows, band, mix, persp } from './lib.mjs';
import { village, VILLAGE_PAL, streetRows } from './village.mjs';
import { dragon } from './dragon.mjs';

const r0 = (v) => f(v, 0);

// shared: a field of black flames (colour-draining) with ashen coronas and dark-red cores
export function blackFire(S, R, list, { edgeCol = '#d4d0e2', core = '#5a0c12', smoke = true, maxH = 400, wind = 0.3, tongues = 0 } = {}) {
  // list entries: [x0, y0, x1, y1, h] base segments. Black fire does not light the night: no glow halo —
  // a thin ashen rim on the outer silhouette only, and smouldering dark-red embers where it bites the wood.
  let body = '', cores = '', plume = '', base = '';
  for (const [x0, y0, x1, y1, h0] of list) {
    const h = Math.min(h0, maxH);
    const fm = flameMass(R, x0, y0, x1, y1, h, { wind, n: tongues });
    body += fm.body + fm.licks; cores += fm.core;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = Math.abs(x1 - x0) / 2 + h * 0.15;
    base += `M${r0(cx - rx)},${r0(cy)}a${r0(rx)},${r0(h * 0.12)} 0 1 1 ${r0(rx * 2)},0a${r0(rx)},${r0(h * 0.12)} 0 1 1 ${r0(-rx * 2)},0`;
    if (smoke && h > 80) plume += smokeRibbon(R, cx + h * 0.25, cy - h * 0.8, h * 1.5, Math.abs(x1 - x0) * 0.35 + h * 0.3);
  }
  const id = S.uid('fire');
  S.def(`<path id="${id}" d="${body}"/>`);
  return (smoke ? `<path d="${plume}" fill="#141218" opacity=".55" filter="${S.blur(2)}"/>` : '')
    + `<use href="#${id}" fill="${edgeCol}" opacity=".7" transform="translate(-2.5 -2)"/>`
    + `<use href="#${id}" fill="#3a0a10" transform="translate(2 1.5)"/>`
    + `<use href="#${id}" fill="#040306"/>`
    + `<path d="${base}" fill="${core}" opacity=".26" filter="${S.blur(2)}"/>`
    + `<path d="${cores}" fill="${core}" opacity=".7" filter="${S.blur(1)}"/>`;
}
function smokeRibbon(R, x, y, h, w) {
  return smoke(R, x, y, h, w, h * 0.35, Math.round(x * 7 + y));
}

// ---------------------------------------------------------------------------------------------
// 黑翼遮月 — the moon rises; a vast black shape crosses its face, trailing smoke
// ---------------------------------------------------------------------------------------------
function dragonSky() {
  const S = new Scene('sbDragonSky', '黑翼遮月：破损翼膜拖着黑烟掠过月面', 2101);
  const R = S.R;
  const M = [800, 372];
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#0b0a1c'], [0.45, '#1e1c3a'], [0.8, '#3a3452'], [1, '#2a2438']])}"/>`);
  S.add(stars(R, 170, [0, 0, W, 620], { maxR: 1.5, avoid: [M[0], M[1], 420, 360] }));
  // moon + halo
  S.add(`<circle cx="${M[0]}" cy="${M[1]}" r="520" fill="${S.rad([[0, '#e8ddff', 0.5], [0.3, '#b8a8e8', 0.18], [1, '#6a5aa8', 0]])}"/>`);
  S.add(`<circle cx="${M[0]}" cy="${M[1]}" r="176" fill="#f2ecff" filter="${S.blur(2)}"/>`);
  S.add(`<circle cx="${M[0]}" cy="${M[1]}" r="168" fill="${S.rad([[0, '#fffaf2'], [0.75, '#efe6ff'], [1, '#d8ccf4']], 'cx="0.42" cy="0.4" r="0.7"')}"/>`);
  S.add(`<g fill="#cfc2ea" opacity=".55"><circle cx="${M[0] - 50}" cy="${M[1] - 40}" r="34"/><circle cx="${M[0] + 60}" cy="${M[1] + 30}" r="46"/><circle cx="${M[0] - 20}" cy="${M[1] + 70}" r="22"/><circle cx="${M[0] + 40}" cy="${M[1] - 80}" r="18"/></g>`);
  // cloud deck the moon is rising out of (silver-rimmed)
  const cm = { lit: '#4a4670', shade: '#24223e', rim: '#d8ccff' };
  S.add(cloud(R, 180, 520, 520, 90, cm, { bumps: 7, light: 1 }));
  S.add(cloud(R, 980, 500, 600, 100, cm, { bumps: 8 }));
  S.add(`<path d="${band(-40, 1640, 470, 22, R)}" fill="#5a5480" opacity=".35" filter="${S.blur(2)}"/>`);
  S.add(cloud(R, -40, 600, 700, 110, { lit: '#2e2c4a', shade: '#181628', rim: '#a89ad8' }, { bumps: 8, light: 1 }));
  S.add(cloud(R, 760, 610, 900, 120, { lit: '#2e2c4a', shade: '#181628', rim: '#a89ad8' }, { bumps: 9 }));
  // the dragon across the moon
  S.add(dragon(S, { x: 880, y: 468, s: 0.86, rot: -3, pose: 'glide', seed: 11, rimCol: '#cfc4ff', rimOp: 0.75, membOp: 0.96 }));
  // village rooftops below (still lamplit — the fire has not fallen yet); tiles lifting in the wind
  const rp = VILLAGE_PAL.dusk;
  const night = { lit: '#2a2440', mid: '#1e1a30', shade: '#15121f', roof: '#1c1828', roofShade: '#110e18', trim: '#0a0810', win: '#1a1622', winLit: '#ffb05a', door: '#0e0c14', chimney: '#1c1828' };
  S.add(`<rect y="760" width="${W}" height="140" fill="#0d0b16"/>`);
  for (const [x, y, w, side, lit] of [[-30, 880, 160, 'r', 1], [150, 850, 110, 'r', 0], [560, 900, 190, 'l', 1], [840, 870, 130, 'l', 1], [1030, 850, 120, 'r', 0], [1220, 880, 170, 'r', 1], [1430, 846, 130, 'r', 1]]) {
    S.add(house(x, y, w, w * 0.42, { side, pal: night, lit: !!lit, rim: '#8a80c0' }).svg);
  }
  const bt = bellTower(330, 860, 64, 280, { lit: '#262038', shade: '#16121f', hole: '#0a080e', bell: '#4a4058', trim: '#100c18', roof: '#1e1a2c', roofShade: '#120f1c', win: '#0a080e', star: '#8a80b0' }, { side: 'r' });
  S.add(bt.svg);
  S.add(`<path d="M330,860V580M330,580L394,580" stroke="#b0a4e0" stroke-width="2" opacity=".5"/>`);
  let tiles = '';
  for (let i = 0; i < 14; i++) { const x = R.range(560, 1520), y = R.range(640, 760); tiles += `<rect x="${r0(x)}" y="${r0(y)}" width="12" height="5" transform="rotate(${r0(R.range(-40, 40))} ${r0(x)} ${r0(y)})"/>`; }
  S.add(`<g fill="#0e0c16">${tiles}</g>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.45, '#05040a', 0], [1, '#05040a', 0.7]], 'cx="0.5" cy="0.4" r="0.75"')}"/>`);
  S.add(`<rect y="640" width="${W}" height="260" fill="${S.lin([[0, '#05040a', 0], [1, '#05040a', 0.7]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 黑焰中的赫麦村 — black fire crawls up the walls without lighting the night; everything it touches
// loses its colour. The bell tower topples into the prayer hall; the dragon banks overhead.
// ---------------------------------------------------------------------------------------------
function villageBurning() {
  const S = new Scene('sbBurning', '黑焰中的赫麦村：吞噬颜色的黑火，倾倒的钟楼', 2202);
  const R = S.R;
  const GY = 600; // road edge / house baseline
  // colour has drained out of the world: moonlit ash-grey smoke fills the sky behind the black fire
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#2a2638'], [0.28, '#5a546c'], [0.5, '#8a8498'], [0.66, '#5a5468'], [1, '#0c0a12']])}"/>`);
  S.add(`<circle cx="240" cy="110" r="360" fill="${S.rad([[0, '#e8e2f2', 0.4], [1, '#e8e2f2', 0]])}"/><circle cx="240" cy="110" r="46" fill="#ebe6f4" opacity=".9"/>`);
  // big soft smoke masses (pale, behind) and darker drifting columns
  let pale = '', dark = '';
  for (const [x, y, h, w, d] of [[300, 560, 520, 220, 260], [760, 560, 560, 260, 320], [1180, 560, 520, 240, 300], [1500, 560, 420, 200, 200]]) pale += smoke(R, x, y, h, w, d, 2300 + x);
  for (const [x, y, h, w, d] of [[520, 520, 460, 120, 280], [980, 520, 480, 130, 300], [1360, 520, 380, 110, 220]]) dark += smoke(R, x, y, h, w, d, 2400 + x);
  S.add(`<path d="${pale}" fill="#9a94a8" opacity=".55" filter="${S.blur(3)}"/>`);
  S.add(`<path d="${dark}" fill="#2a2634" opacity=".7" filter="${S.blur(3)}"/>`);
  // the dragon banking over the village
  S.add(dragon(S, { x: 1230, y: 170, s: 0.4, rot: 6, pose: 'bank', seed: 23, rimCol: '#ece8f6', rimOp: 0.75, smokeOp: 0.45 }));
  // back row: far roofs, the prayer hall, the bell tower toppling into its roof
  const far = { ...VILLAGE_PAL.burning.tile, lit: '#5e5a6e', mid: '#4a4658', shade: '#33303e', roof: '#3e3a4a', roofShade: '#2a2834', trim: '#1a1820' };
  for (const [x, w, side] of [[30, 80, 'r'], [150, 70, 'r'], [880, 76, 'l'], [1000, 84, 'l'], [1130, 70, 'l'], [1400, 86, 'l'], [1520, 70, 'l']]) S.add(house(x, 500, w, w * 0.55, { side, pal: far, windows: 0, door: false }).svg);
  const stone = { ...VILLAGE_PAL.burning.stone, lit: '#7a768a', mid: '#5a566a', shade: '#3a3848', roof: '#3a3848', roofShade: '#26242e', trim: '#1e1c26' };
  S.add(house(470, 512, 200, 110, { side: 'l', d: 70, roofH: 92, pal: stone, windows: 0, door: false, rim: '#cfcadc' }).svg);
  const tb = [690, 512], tw = 62, th = 300;
  S.add(`<g transform="rotate(-21 ${tb[0] + tw * 0.2} ${tb[1] - th * 0.42})">${bellTower(tb[0], tb[1], tw, th, stone, { side: 'r' }).svg}<path d="M${tb[0]},${tb[1] - th}v${th}" stroke="#d8d4e6" stroke-width="2.5" opacity=".7"/></g>`);
  S.add(`<path d="${pz([[600, 395], [640, 360], [700, 372], [728, 406], [690, 430], [620, 428]])}" fill="#26242e"/>`);
  // middle row: the houses along the road (gable fronts), colour drained
  const mid = { lit: '#5c5869', mid: '#47434f', shade: '#2c2a34', roof: '#3c3946', roofShade: '#24222c', trim: '#141219', win: '#0c0b10', door: '#100f15', chimney: '#34323e' };
  const row = [[-60, 180, 110, 'r'], [170, 150, 96, 'r'], [360, 170, 104, 'r'], [820, 160, 100, 'l'], [1010, 190, 116, 'l'], [1240, 150, 96, 'l'], [1430, 200, 120, 'l']];
  const houses = row.map(([x, w, h, side]) => ({ x, w, h, side, o: house(x, GY, w, h, { side, pal: mid, planks: false, rim: '#d4d0e2', roofH: w * 0.6, noCornerRim: true }) }));
  for (const [i, hs] of houses.entries()) {
    if (i === 5) {
      // collapsed into a charred frame
      S.add(`<path d="${pz([[hs.x, GY], [hs.x, GY - hs.h * 0.5], [hs.x + hs.w * 0.3, GY - hs.h * 0.7], [hs.x + hs.w * 0.5, GY - hs.h * 0.35], [hs.x + hs.w, GY - hs.h * 0.55], [hs.x + hs.w, GY]])}" fill="${mid.mid}"/>`);
      S.add(skeleton(R, hs.x + 8, GY - hs.h * 0.3, hs.w - 16, hs.h * 1.4, '#0c0b10', 7));
      continue;
    }
    S.add(hs.o.svg);
    // cracks spreading where the black fire touched
    let ck = '';
    for (let k = 0; k < 3; k++) { let x = hs.x + hs.w * R.range(0.15, 0.85), y = GY - hs.h * R.range(0.55, 0.95); ck += `M${r0(x)},${r0(y)}`; for (let q = 0; q < 4; q++) { x += R.range(-10, 10); y += R.range(8, 18); ck += `L${r0(x)},${r0(y)}`; } }
    S.add(`<path d="${ck}" fill="none" stroke="#0c0b10" stroke-width="2.5" opacity=".75"/>`);
  }
  // black flames: rising off the roofs (silhouetted against the smoke), out of windows, along the far roofs
  const fl = [];
  const roofFire = (i, k) => { const hs = houses[i]; fl.push([hs.x + hs.w * 0.05, GY - hs.h - hs.w * 0.1, hs.x + hs.w * 0.95, GY - hs.h - hs.w * 0.1, hs.w * k]); };
  roofFire(0, 1.9); roofFire(2, 1.7); roofFire(4, 1.25); roofFire(6, 1.6);
  for (const i of [1, 3, 5]) { const hs = houses[i]; fl.push([hs.x + hs.w * 0.08, GY - hs.h * 0.4, hs.x + hs.w * 0.32, GY - hs.h * 0.4, hs.h * 1.0]); }
  for (const [x0, x1, y, h] of [[20, 230, 470, 150], [880, 1060, 476, 150], [1390, 1600, 470, 140], [470, 660, 440, 170]]) fl.push([x0, y, x1, y, h]);
  S.add(blackFire(S, R, fl));
  // the road: dropped belongings, an overturned cart
  S.add(`<path d="M-20,${GY}H1620V900H-20Z" fill="${S.lin([[0, '#3a3646'], [0.3, '#24222c'], [1, '#0a090e']])}"/>`);
  S.add(`<path d="M-20,${GY}H1620" stroke="#8a86a0" stroke-width="2" opacity=".5"/>`);
  const props = [];
  { const cx = 1100, cy = 668;
    props.push(`<path d="M${cx - 120},${cy}l220,-26l14,-70l-220,26z" fill="#24222c"/><path d="M${cx - 120},${cy}l-60,30" stroke="#24222c" stroke-width="7"/>`);
    let sp = '';
    for (const [wx, wy] of [[cx - 80, cy - 74], [cx + 70, cy - 92]]) { const rr = 34; sp += `M${wx - rr},${wy}a${rr},${rr} 0 1 0 ${rr * 2},0a${rr},${rr} 0 1 0 ${-rr * 2},0`; for (let q = 0; q < 3; q++) { const an = q * Math.PI / 3 + 0.3; sp += `M${r0(wx - Math.cos(an) * rr)},${r0(wy - Math.sin(an) * rr)}L${r0(wx + Math.cos(an) * rr)},${r0(wy + Math.sin(an) * rr)}`; } }
    props.push(`<path d="${sp}" fill="none" stroke="#16141c" stroke-width="7"/>`); }
  props.push(`<path d="M300,700q8,-30 40,-28q34,2 38,28z" fill="#2a2834"/><path d="M560,676h56l-6,26h-44z" fill="#2e2c36"/><path d="M624,700q10,-10 22,0zM650,704q9,-9 20,0z" fill="#4a4652"/><ellipse cx="860" cy="690" rx="24" ry="12" fill="#1a1820"/><path d="${star7(760, 730, 16, 0.46, 30)}" fill="#6a6676"/>`);
  S.add(props.join(''));
  // ash flakes drifting, a few dark-red embers
  let ash = '', emb = '';
  for (let i = 0; i < 50; i++) ash += `<circle cx="${r0(R.range(0, W))}" cy="${r0(R.range(0, 760))}" r="${f(R.range(0.8, 2))}"/>`;
  for (let i = 0; i < 24; i++) emb += `<circle cx="${r0(R.range(100, 1500))}" cy="${r0(R.range(200, 760))}" r="${f(R.range(1, 2.2))}"/>`;
  S.add(`<g fill="#e0dcea" opacity=".55">${ash}</g><g fill="#8a1c1e" opacity=".9">${emb}</g>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.45, '#06050a', 0], [1, '#06050a', 0.6]], 'cx="0.5" cy="0.42" r="0.75"')}"/>`);
  S.add(`<rect y="620" width="${W}" height="280" fill="${S.lin([[0, '#06050a', 0], [1, '#06050a', 0.7]])}"/>`);
  return S.out();
}

// Hemai seen from high above at night: the village on its slope, black fire spots, grey smoke columns,
// smouldering red. Returns svg. (ox, oy) = plaza on screen, s = scale.
export function farVillage(S, R, ox, oy, s, { state = 'burning', smokeH = 260, glow = 1, fireH = 1 } = {}) {
  const V = village(S, ox, oy, s, state === 'smoulder' ? 'ruins' : 'burning', { seed: 91 });
  const out = [];
  // the slope the village sits on
  if (state === 'burning') out.push(`<ellipse cx="${r0(ox - 20 * s)}" cy="${r0(oy + 10 * s)}" rx="${r0(470 * s)}" ry="${r0(120 * s)}" fill="#1a1824" opacity=".8" filter="${S.blur(2)}"/>`);
  out.push(`<ellipse cx="${r0(ox)}" cy="${r0(oy)}" rx="${r0(420 * s)}" ry="${r0(110 * s)}" fill="#6a1016" opacity="${f(0.22 * glow, 2)}" filter="${S.blur(3)}"/>`);
  out.push(V.svg);
  // smoke columns (moonlit grey) drifting south-east
  let sm = '';
  for (let i = 0; i < 6; i++) sm += smoke(R, ox + R.range(-300, 300) * s, oy - R.range(0, 30) * s, smokeH * R.range(0.6, 1.1) * s / 0.5, 56 * s / 0.5, 140 * s / 0.5, 5000 + i);
  out.push(`<path d="${sm}" fill="${state === 'burning' ? '#8a849c' : '#a8a0b0'}" opacity="${state === 'burning' ? 0.3 : 0.5}" filter="${S.blur(3)}"/>`);
  if (state === 'burning') {
    const list = V.fires.map(([x, y, w, h]) => [x - w / 2, y, x + w / 2, y, h * 1.4 * fireH]);
    const t = V.tower;
    list.push([t[0] - 40 * s, t[1] - 10 * s, t[0] + 60 * s, t[1] - 10 * s, 70 * s * fireH]);
    out.push(blackFire(S, R, list, { smoke: false, edgeCol: '#c8c4d8', tongues: s < 0.6 ? 3 : 0 }));
  }
  // embers over the ruins
  let emb = '';
  for (let i = 0; i < 30; i++) emb += `<circle cx="${r0(ox + R.range(-380, 380) * s)}" cy="${r0(oy + R.range(-60, 40) * s)}" r="${f(R.range(0.8, 2))}"/>`;
  out.push(`<g fill="#a82a24" opacity="${f(0.8 * glow, 2)}">${emb}</g>`);
  return out.join('');
}

// ---------------------------------------------------------------------------------------------
// 北山旧牧道·夜 — the narrow old sheep trail: thorny rock wall on the left, steep drop on the right,
// Hemai burning far below in the valley.
// ---------------------------------------------------------------------------------------------
function northTrail() {
  const S = new Scene('sbTrail', '北山旧牧道·夜：窄坡碎石，山下的赫麦村在黑焰中', 2303);
  const R = S.R;
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#121828'], [0.38, '#2a3048'], [0.58, '#44425c'], [1, '#0c0e18']])}"/>`);
  S.add(stars(R, 120, [0, 0, W, 380], { maxR: 1.4 }));
  const MO = [380, 110];
  S.add(`<circle cx="${MO[0]}" cy="${MO[1]}" r="320" fill="${S.rad([[0, '#d8d4f4', 0.42], [1, '#d8d4f4', 0]])}"/><circle cx="${MO[0]}" cy="${MO[1]}" r="42" fill="#eeeaff"/>`);
  S.add(`<path d="${band(480, 1100, 190, 14, R)}" fill="#4e5072" opacity=".7"/><path d="${band(520, 1000, 186, 4, R)}" fill="#c8c4ee" opacity=".35"/>`);
  S.add(`<path d="${band(820, 1500, 250, 10, R)}" fill="#4a4a6e" opacity=".5"/>`);
  // far ranges + valley floor
  S.add(ridge(S, { step: 16, base: 420, amp: 40, period: 260, seed: 71, fill: '#2a2c44', shade: '#1c1e30', shadeOp: 0.6, rim: '#8a8ab8', rimOp: 0.5, peaks: [[1250, 80, 280], [900, 40, 200]] }).svg);
  S.add(`<path d="M-20,480C300,470,800,462,1100,458C1300,458,1500,462,1640,466V760H-20Z" fill="#1a1a26"/>`);
  // Hemai burning far below, near the horizon
  S.add(farVillage(S, R, 1180, 492, 0.28, { smokeH: 300 }));
  // moonlit mist pooled in the valley between us and the village
  S.add(`<path d="${band(560, 1660, 560, 26, R, 16)}" fill="#6a6a90" opacity=".35" filter="${S.blur(2)}"/><path d="${band(700, 1660, 620, 30, R, 20)}" fill="#5a5a80" opacity=".3" filter="${S.blur(2)}"/>`);
  // the slope dropping away to the right of the trail (only treetops show above its edge)
  for (const [x, y, h] of [[1180, 740, 70], [1250, 750, 96], [1330, 770, 60], [1460, 790, 84], [1530, 800, 64], [1000, 690, 50]]) S.add(pine(x, y + 40, h + 40, '#0b0c15'));
  S.add(`<path d="M690,520C760,580,900,660,1080,730C1260,800,1440,840,1640,860V900H860Z" fill="${S.lin([[0, '#232532'], [1, '#0a0a12']])}"/>`);
  S.add(`<path d="M690,520C760,580,900,660,1080,730C1260,800,1440,840,1640,860" fill="none" stroke="#7e7ca6" stroke-width="2" opacity=".5"/>`);
  let scrub = '';
  for (let i = 0; i < 14; i++) { const t = R(), x = 740 + t * 420 + R.range(-20, 20), y = 560 + t * 190 + R.range(0, 30), r = R.range(10, 22); scrub += `M${r0(x - r)},${r0(y)}a${r0(r)},${r0(r * 0.7)} 0 1 1 ${r0(r * 2)},0z`; }
  S.add(`<path d="${scrub}" fill="#10121a"/>`);
  // the rock wall (left): stratified, moon catching the upper planes, thorny brambles
  const rp = { lit: '#4c4c6a', mid: '#2c2c42', shade: '#191928' };
  S.add(`<path d="M-20,90L110,120L230,200L330,250L420,330L500,420L560,520L600,640L560,900H-20Z" fill="${rp.mid}"/>`);
  S.add(`<path d="M-20,90L110,120L230,200L130,250L40,210L-20,230Z" fill="${rp.lit}"/><path d="M230,200L330,250L420,330L300,350L200,280Z" fill="${rp.lit}" opacity=".85"/><path d="M420,330L500,420L560,520L470,500L390,410Z" fill="${rp.lit}" opacity=".7"/>`);
  S.add(`<path d="M130,250L200,280L300,350L390,410L470,500L560,560L600,640L560,900H300L240,720L140,580L40,460L-20,440Z" fill="${rp.shade}" opacity=".85"/>`);
  let strata = '';
  for (const [x0, y0, x1, y1] of [[0, 300, 260, 380], [20, 420, 330, 500], [60, 560, 420, 610], [-10, 700, 380, 740], [280, 300, 470, 440]]) strata += `M${x0},${y0}Q${(x0 + x1) / 2},${Math.min(y0, y1) - 12} ${x1},${y1}`;
  S.add(`<path d="${strata}" fill="none" stroke="#0c0c16" stroke-width="3" opacity=".6"/>`);
  S.add(`<path d="M-20,90L110,120L230,200L330,250L420,330L500,420L560,520" fill="none" stroke="#a8a6d8" stroke-width="3" opacity=".6"/>`);
  let th = '';
  for (let i = 0; i < 10; i++) {
    const x = R.range(60, 540), y = 220 + (x - 60) * 0.72 + R.range(-20, 50);
    for (let k = 0; k < 6; k++) { const an = R.range(-2.8, -0.3), l = R.range(16, 36); th += `M${r0(x)},${r0(y)}q${r0(Math.cos(an) * l * 0.5 + 6)},${r0(Math.sin(an) * l * 0.5)} ${r0(Math.cos(an) * l)},${r0(Math.sin(an) * l)}`; }
  }
  S.add(`<path d="${th}" fill="none" stroke="#08080e" stroke-width="3" stroke-linecap="round"/>`);
  // the trail: wide where we stand, narrowing up the slope to a switchback that turns behind the rock shoulder
  S.add(`<path d="M380,900C460,780,540,660,556,580C562,546,566,520,574,500L690,520C660,540,650,570,660,600C700,700,820,800,1000,900Z" fill="${S.lin([[0, '#4a4660'], [0.5, '#34324a'], [1, '#14121c']])}"/>`);
  S.add(`<path d="M690,520C660,540,650,570,660,600C700,700,820,800,1000,900" fill="none" stroke="#9a96c4" stroke-width="2.5" opacity=".55"/>`);
  let grav = '', edge = '';
  for (let i = 0; i < 70; i++) { const t = R() ** 0.8, y = 520 + t * 380, xl = 600 - t * 220, xr = 680 + t * 320, x = R.range(xl, xr); grav += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${f(R.range(2, 6) * (0.4 + t))}" ry="${f(R.range(1.5, 3) * (0.4 + t))}"/>`; }
  S.add(`<g fill="#6e6a86" opacity=".55">${grav}</g>`);
  for (let i = 0; i < 9; i++) { const t = i / 8, x = 690 + t * 300 + R.range(-10, 10), y = 520 + t * 370; edge += rock(R, x, y, 16 + t * 60, 8 + t * 28, rp); }
  S.add(edge);
  for (const [x, y, w, h] of [[440, 870, 140, 60], [250, 820, 120, 50]]) S.add(rock(R, x, y, w, h, { lit: '#46445e', mid: '#262638', shade: '#141420' }));
  // the rock shoulder the trail turns behind
  S.add(`<path d="M520,540L560,470L620,452L680,470L716,506L700,530L640,520L590,546Z" fill="${rp.shade}"/><path d="M560,470L620,452L680,470L640,486L590,494Z" fill="${rp.mid}"/><path d="M560,470L620,452L680,470L716,506" fill="none" stroke="#a8a6d8" stroke-width="2.5" opacity=".6"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.45, '#05060c', 0], [1, '#05060c', 0.6]], 'cx="0.55" cy="0.45" r="0.75"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#05060c', 0], [1, '#05060c', 0.7]])}"/>`);
  return S.out();
}

// The shepherds' cave mouth on the north mountain, looking out over Hemai far below.
// time: 'night' (burning, lamp lit) | 'dawn' (grey pre-dawn, smouldering, lamp guttering)
export function caveView(S, R, time = 'night') {
  const dawn = time === 'dawn';
  const out = [];
  // sky through the opening
  out.push(`<rect width="${W}" height="${H}" fill="${S.lin(dawn ? [[0, '#3e4060'], [0.35, '#6a6a88'], [0.58, '#a49aae'], [0.7, '#8a7e92'], [1, '#2a2638']] : [[0, '#121626'], [0.4, '#2a2e48'], [0.62, '#4a4058'], [1, '#141018']])}"/>`);
  if (!dawn) out.push(stars(R, 110, [200, 80, 1400, 420], { maxR: 1.4 }));
  else out.push(stars(R, 30, [200, 80, 1400, 260], { maxR: 1.1, op: [0.15, 0.5] }));
  if (dawn) {
    out.push(`<rect y="300" width="${W}" height="260" fill="${S.lin([[0, '#e8c8b8', 0], [0.7, '#e8c8b8', 0.35], [1, '#e8c8b8', 0]])}"/>`);
    out.push(`<path d="${band(260, 1400, 300, 14, R)}" fill="#8a84a4" opacity=".6"/><path d="${band(400, 1200, 360, 10, R)}" fill="#c8b4c0" opacity=".5"/>`);
  } else {
    out.push(`<path d="${band(260, 1100, 250, 12, R)}" fill="#3e4062" opacity=".7"/><path d="${band(300, 900, 246, 4, R)}" fill="#c0bce8" opacity=".3"/>`);
  }
  // distant ranges and valley
  out.push(ridge(S, { step: 16, base: 430, amp: 34, period: 240, seed: dawn ? 82 : 81, fill: dawn ? '#5a5672' : '#262840', shade: dawn ? '#46425e' : '#1a1c2e', shadeOp: 0.6, rim: dawn ? '#e0d0dc' : '#8a8ab8', rimOp: 0.5, peaks: [[1150, 60, 260], [420, 40, 220]] }).svg);
  out.push(`<path d="M-20,470C400,460,1100,456,1640,464V900H-20Z" fill="${S.lin(dawn ? [[0, '#5a5468'], [0.3, '#3a3648'], [1, '#24202e']] : [[0, '#2a2838'], [0.3, '#18161f'], [1, '#0e0c14']])}"/>`);
  out.push(`<path d="M-20,500C200,480,420,486,560,510C700,530,600,560,400,566C200,570,60,560,-20,550ZM1040,520C1200,494,1400,490,1640,500V560C1400,566,1200,560,1040,520Z" fill="${dawn ? '#4a4658' : '#1e1c28'}"/>`);
  // Hemai below
  out.push(farVillage(S, R, 790, 566, 0.66, { state: dawn ? 'smoulder' : 'burning', smokeH: dawn ? 340 : 280, glow: dawn ? 0.5 : 1 }));
  if (dawn) out.push(`<path d="${band(-40, 1640, 610, 34, R, 20)}" fill="#a49aae" opacity=".35" filter="${S.blur(2)}"/>`);
  // the cave: rock frame around a jagged, asymmetric opening; the floor lip across the bottom
  const open = [[220, 780], [244, 620, 1], [226, 540], [286, 446, 1], [292, 350], [362, 276, 1], [468, 222], [556, 160, 1], [690, 136], [776, 156, 1], [884, 120], [1012, 146, 1], [1116, 196], [1196, 236, 1], [1252, 318], [1322, 384, 1], [1334, 480], [1376, 566, 1], [1390, 780]];
  const frame = `M-20,-20H1620V920H-20Z` + shape(open, true, 0);
  const rockC = dawn ? '#1e1c26' : '#0d0b13';
  out.push(`<path d="${frame}" fill="${rockC}" fill-rule="evenodd"/>`);
  // rock facets on the frame (lighter planes catching the sky), cracks
  const fc = dawn ? '#2c2a36' : '#16141e';
  out.push(`<path d="M-20,-20L362,276L292,350L120,300L-20,330ZM556,160L690,136L620,40L480,60ZM1012,146L1116,196L1240,80L1100,40ZM1252,318L1322,384L1500,300L1400,200ZM226,540L286,446L80,420L-20,480Z" fill="${fc}" opacity=".6"/>`);
  out.push(`<path d="M362,276L120,300M556,160L480,60M1116,196L1240,80M1322,384L1500,300M286,446L80,420M244,620L40,640M1376,566L1560,560" stroke="${dawn ? '#3a3846' : '#1e1c28'}" stroke-width="3" fill="none"/>`);
  // inner rim: sky light on the upper-left edges, cooler on the right
  out.push(`<path d="${shape(open.slice(1, 10), false, 0)}" fill="none" stroke="${dawn ? '#d0c4d8' : '#8e8cbc'}" stroke-width="4" opacity=".6"/>`);
  out.push(`<path d="${shape(open.slice(9), false, 0)}" fill="none" stroke="${dawn ? '#a8a0b8' : '#5a5a84'}" stroke-width="3" opacity=".5"/>`);
  // the floor lip of the cave mouth
  out.push(`<path d="M180,790C380,722,560,700,800,700C1040,700,1240,716,1420,790L1440,920H160Z" fill="${dawn ? '#24222c' : '#100e16'}"/>`);
  out.push(`<path d="M180,790C380,722,560,700,800,700C1040,700,1240,716,1420,790" fill="none" stroke="${dawn ? '#b0a6bc' : '#6a6890'}" stroke-width="2.5" opacity=".55"/>`);
  // the highest stone at the mouth (right), the signal lamp on it
  out.push(rock(R, 1220, 716, 170, 84, dawn ? { lit: '#4a4658', mid: '#2e2c38', shade: '#1c1a22' } : { lit: '#3a3650', mid: '#1e1c2a', shade: '#0e0c14' }));
  const L = [1214, 638];
  out.push(`<circle cx="${L[0]}" cy="${L[1] - 8}" r="${dawn ? 90 : 220}" fill="${S.rad([[0, '#ffc070', dawn ? 0.35 : 0.55], [0.35, '#ff9a4a', dawn ? 0.1 : 0.18], [1, '#ff9a4a', 0]])}"/>`);
  out.push(`<path d="M${L[0] - 18},${L[1]}h36l-7,11h-22z" fill="#3a2a22"/><path d="M${L[0] - 11},${L[1]}q11,-9 22,0" fill="#5a4030"/><path d="M${L[0] + 16},${L[1] + 2}q11,-2 9,-11" fill="none" stroke="#3a2a22" stroke-width="3"/>`);
  out.push(`<path d="M${L[0]},${L[1] - 4}q-5,-${dawn ? 6 : 11} 0,-${dawn ? 10 : 22}q5,${dawn ? 4 : 11} 0,${dawn ? 10 : 22}z" fill="#ffe2a0"/>`);
  // warm lamplight catching the right side of the frame
  out.push(`<path d="${shape(open.slice(12), false, 0)}" fill="none" stroke="#ffb070" stroke-width="3" opacity="${dawn ? 0.15 : 0.35}"/>`);
  // cave interior props in the dark: firewood stack (left), old blanket (right)
  let wood = '';
  for (let i = 0; i < 6; i++) wood += `M${90 + i * 8},${860 - i * 24}l170,-12`;
  out.push(`<path d="${wood}" stroke="${dawn ? '#2e2a2a' : '#17131a'}" stroke-width="22" stroke-linecap="round"/><path d="${wood}" stroke="${dawn ? '#6a5a50' : '#3a3036'}" stroke-width="3" opacity=".6" transform="translate(0 -9)"/>`);
  out.push(`<path d="M1340,920C1360,840,1420,810,1500,820C1570,830,1610,870,1620,920Z" fill="${dawn ? '#3a3240' : '#1a1520'}"/><path d="M1370,880C1420,850,1490,846,1560,866" fill="none" stroke="${dawn ? '#5a4e5e' : '#2a2430'}" stroke-width="4"/>`);
  out.push(`<rect width="${W}" height="${H}" fill="${S.rad([[0.35, '#040308', 0], [1, '#040308', 0.65]], 'cx="0.5" cy="0.42" r="0.72"')}"/>`);
  out.push(`<rect y="640" width="${W}" height="260" fill="${S.lin([[0, '#040308', 0], [1, '#040308', 0.6]])}"/>`);
  return out.join('');
}

// ---------------------------------------------------------------------------------------------
// 守羊洞·俯瞰故乡 — from the cave mouth: Hemai burning below, the signal lamp on the highest stone
// ---------------------------------------------------------------------------------------------
function shepherdCave() {
  const S = new Scene('sbCaveNight', '守羊洞：洞口的油灯，山下燃烧的赫麦村', 2404);
  S.add(caveView(S, S.R, 'night'));
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 南侧山脊 — the hidden shot: a far southern crest; violet rune-chains only the caster can see run
// from the rocks across the night toward the smoke over Hemai; far north a white light on the road.
// ---------------------------------------------------------------------------------------------
function southRidge() {
  const S = new Scene('sbRidge', '南侧山脊：通向赫麦村上空的紫色咒链，远方山道上的白光', 2505);
  const R = S.R;
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#0c0a1a'], [0.45, '#221c3a'], [0.6, '#2e2648'], [1, '#06050c']])}"/>`);
  S.add(stars(R, 200, [0, 0, W, 460], { maxR: 1.5, fill: '#d8ccff' }));
  // thin waning moon low on the left, veiled
  S.add(`<circle cx="300" cy="150" r="220" fill="${S.rad([[0, '#b8a8f0', 0.25], [1, '#b8a8f0', 0]])}"/><path d="M300,112a38,38 0 1 0 0,76a48,48 0 1 1 0,-76z" fill="#e2d8ff"/>`);
  S.add(`<path d="${band(-40, 900, 200, 14, R)}" fill="#3a2e5a" opacity=".7"/><path d="${band(700, 1640, 260, 12, R)}" fill="#34285a" opacity=".6"/>`);
  // far northern ranges, Hemai a smudge of smoke and embers on its slope
  S.add(ridge(S, { step: 16, base: 470, amp: 30, period: 260, seed: 95, fill: '#241e3a', shade: '#18142a', shadeOp: 0.6, rim: '#7a6aa8', rimOp: 0.45, peaks: [[300, 50, 260], [1240, 40, 240]] }).svg);
  S.add(`<ellipse cx="820" cy="486" rx="120" ry="18" fill="#7a1c22" opacity=".45" filter="${S.blur(2)}"/>`);
  let emb = '';
  for (let i = 0; i < 18; i++) emb += `<circle cx="${r0(820 + R.range(-80, 80))}" cy="${r0(484 + R.range(-6, 6))}" r="${f(R.range(0.8, 1.6))}"/>`;
  S.add(`<g fill="#c0302a">${emb}</g>`);
  S.add(`<path d="${smoke(R, 830, 480, 360, 60, 120, 2553)}" fill="#4a3e62" opacity=".55" filter="${S.blur(3)}"/>`);
  // a white light on the northern mountain road: three small rings lighting in turn
  S.add(`<path d="M60,500C120,494,150,486,190,478" fill="none" stroke="#3a3256" stroke-width="2"/>`);
  S.add(`<circle cx="192" cy="474" r="26" fill="${S.rad([[0, '#ffffff', 0.7], [0.4, '#e8edf7', 0.25], [1, '#e8edf7', 0]])}"/><circle cx="192" cy="474" r="2.2" fill="#fff"/>`);
  S.add(`<g fill="none" stroke="#f4f6ff" stroke-width="1"><circle cx="192" cy="468" r="3"/><circle cx="192" cy="468" r="5.5" opacity=".7"/><circle cx="192" cy="468" r="8" opacity=".4"/></g>`);
  // the wide dark valley between
  S.add(`<path d="M-20,500C400,492,1200,490,1640,500V900H-20Z" fill="${S.lin([[0, '#1a1528'], [1, '#08070e']])}"/>`);
  S.add(`<path d="${band(-40, 1640, 540, 18, R, 10)}" fill="#3a3058" opacity=".35" filter="${S.blur(2)}"/>`);
  // rune chains: from the crest (lower right, out of shot) arcing over the valley toward Hemai's sky
  let chains = '', runes = '';
  for (const [x0, y0, cx, cy, x1, y1] of [[1420, 760, 1120, 420, 860, 300], [1460, 720, 1180, 380, 900, 250], [1400, 800, 1100, 470, 840, 360]]) {
    chains += `M${x0},${y0}Q${cx},${cy} ${x1},${y1}`;
    for (let k = 1; k < 9; k++) {
      const u = k / 9, x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1, y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1, z = 1 - u * 0.6;
      runes += `M${r0(x - 4 * z)},${r0(y - 3 * z)}l${f(4 * z)},${f(6 * z)}l${f(4 * z)},${f(-6 * z)}M${r0(x)},${r0(y - 6 * z)}v${f(12 * z)}`;
    }
  }
  const maskId = S.uid('m');
  S.def(`<mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect x="820" y="200" width="700" height="640" fill="${S.lin([[0, '#fff', 0], [0.25, '#fff', 0.75], [1, '#fff', 1]], 'x1="0" y1="0" x2="1" y2="0"')}"/></mask>`);
  S.add(`<g mask="url(#${maskId})"><path d="${chains}" fill="none" stroke="#9a74d8" stroke-width="16" opacity=".45" filter="${S.blur(2)}"/><path d="${chains}" fill="none" stroke="#120a1c" stroke-width="7" stroke-dasharray="10 3"/><path d="${chains}" fill="none" stroke="#c8a8ff" stroke-width="2" stroke-dasharray="6 7"/><path d="${runes}" fill="none" stroke="#b58cff" stroke-width="4" opacity=".45" filter="${S.blur(1)}"/><path d="${runes}" fill="none" stroke="#e2d0ff" stroke-width="1.2"/></g>`);
  // the crest: jagged rocks, dead grass, the highest rock on the right where someone stands
  const rp = { lit: '#3a3058', mid: '#1e1830', shade: '#0e0b18' };
  S.add(`<path d="M-20,760C200,720,420,700,640,712C860,724,1040,690,1220,640L1330,560L1400,600L1470,540L1560,600L1640,590V920H-20Z" fill="${rp.mid}"/>`);
  S.add(`<path d="M1220,640L1330,560L1360,640L1290,700ZM1400,600L1470,540L1500,620L1440,660Z" fill="${rp.lit}"/>`);
  S.add(`<path d="M-20,760C200,720,420,700,640,712C860,724,1040,690,1220,640L1330,560L1400,600L1470,540L1560,600" fill="none" stroke="#8a74c8" stroke-width="2.5" opacity=".55"/>`);
  let grass = '';
  for (let i = 0; i < 80; i++) { const x = R.range(-20, 1300), y = 712 + Math.sin(x / 300) * 20 + R.range(0, 30), h = R.range(10, 30); grass += `M${r0(x)},${r0(y)}q${r0(R.range(-4, 6))},${r0(-h * 0.6)} ${r0(R.range(-6, 10))},${r0(-h)}`; }
  S.add(`<path d="${grass}" fill="none" stroke="#2a2240" stroke-width="2"/>`);
  for (const [x, y, w, h] of [[300, 800, 180, 70], [760, 790, 140, 50], [1100, 760, 200, 90]]) S.add(rock(R, x, y, w, h, rp));
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.45, '#04030a', 0], [1, '#04030a', 0.65]], 'cx="0.5" cy="0.45" r="0.75"')}"/>`);
  S.add(`<rect y="620" width="${W}" height="280" fill="${S.lin([[0, '#04030a', 0], [1, '#04030a', 0.6]])}"/>`);
  return S.out();
}

export const nightBgs = {
  'south-ridge': southRidge,
  'shepherd-cave-night': shepherdCave,
  'north-trail-night': northTrail,
  'village-burning': villageBurning,
  'dragon-sky': dragonSky,
};
