// 晨钟镇 (Chime Town): chime-town-gate, guild-hall, market, dye-alley, barrel-alley, guard-square, training-ground-dawn,
// and the west gate (west-gate-day / west-gate-dusk / west-gate-night).
// A lively market town that was never burned: warm plaster, timber frames, red tiles, the bell tower.
import { Scene, W, H, f, pz, pl, shape, cloud, cloudCluster, ridge, rays, stars, smoke, band, tree, rock, persp, bellTower, star7, mix, TOWN, townhouse, stall, person, bird, fence, rng } from './lib.mjs';
import { oldMill, plume } from './bg-mill.mjs';

const r0 = (v) => f(v, 0);
const TOWER_PAL = { lit: '#eadcc4', shade: '#a8967e', hole: '#3a3040', bell: '#d0a050', trim: '#7a6a5a', roof: '#5e6888', roofShade: '#3e4664', win: '#4a4050', star: '#ffd77a' };

function sky(S, top = '#86a8cc', mid = '#cfd6d4', low = '#f2dcae') {
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, top], [0.32, mid], [0.55, low], [1, '#c8b08a']])}"/>`);
}

// cobbles: rows of flattened ellipses in perspective (y0 = far edge, y1 = near edge)
function cobbles(R, y0, y1, col, n = 220, x0 = -20, x1 = W + 20) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const t = R() ** 1.6, y = y0 + (y1 - y0) * t, s = 0.4 + t * 1.6, x = R.range(x0, x1);
    d += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${f(8 * s)}" ry="${f(3 * s)}"/>`;
  }
  return `<g fill="${col}">${d}</g>`;
}

// ---------------------------------------------------------------------------------------------
// 晨钟镇东门·清晨 — the east gate thrown open; a caravan queueing in; unburned roofs and the bell tower
// ---------------------------------------------------------------------------------------------
function chimeGate() {
  const S = new Scene('sbGate', '晨钟镇东门·清晨：敞开的城门与排队入城的商队', 4101);
  const R = S.R;
  sky(S, '#7ea4cc', '#c6d2d6', '#f4e0b4');
  const SUN = [250, 210];
  S.add(`<circle cx="${SUN[0]}" cy="${SUN[1]}" r="640" fill="${S.rad([[0, '#fff6dc', 0.9], [0.12, '#ffe8b0', 0.55], [0.45, '#ffd890', 0.15], [1, '#ffd890', 0]])}"/><circle cx="${SUN[0]}" cy="${SUN[1]}" r="38" fill="#fffdf2"/>`);
  const cc = { lit: '#fffaf0', shade: '#d8d0d4', rim: '#ffffff' };
  S.add(cloudCluster(R, 960, 150, 300, 70, cc, { bumps: 6 }) + cloud(R, 520, 110, 200, 40, cc, { bumps: 5 }) + cloud(R, 1350, 230, 200, 36, cc, { bumps: 5 }));
  S.add(`<g filter="${S.blur(3)}">${rays(SUN[0], SUN[1], [[14, 4, 1500], [26, 5, 1500], [38, 3, 1400]], '#fff4d0', 0.2)}</g>`);
  // town roofs + the bell tower rising behind the wall
  // two rows of roofs peeking over the wall (far row hazier), chimneys with thin smoke
  for (const [row, yb, hz] of [[0, 350, 0.45], [1, 362, 0]]) {
    let x = -60 + row * 50;
    while (x < 1640) {
      const w = R.range(70, 130), hgt = w * R.range(0.38, 0.6), kind = R() < 0.7;
      const c1 = mix(kind ? '#c0603e' : '#66708e', '#b8c4d4', hz), c2 = mix(kind ? '#8e3e2e' : '#434a66', '#9aa6b8', hz);
      S.add(`<path d="${pz([[x, yb], [x + w / 2, yb - hgt], [x + w, yb]])}" fill="${c1}"/><path d="${pz([[x + w / 2, yb - hgt], [x + w, yb], [x + w * 0.62, yb]])}" fill="${c2}"/>`);
      if (R() < 0.35) S.add(`<path d="M${r0(x + w * 0.7)},${r0(yb - hgt * 0.4)}v-24h10v24z" fill="${mix('#968a7a', '#b8c4d4', hz)}"/>`);
      x += w * R.range(0.8, 1.05);
    }
  }
  S.add(bellTower(770, 362, 64, 230, TOWER_PAL, { side: 'r' }).svg);
  S.add(`<circle cx="802" cy="236" r="14" fill="none" stroke="#7a6a5a" stroke-width="3"/><path d="${star7(802, 236, 11)}" fill="#ffd77a"/>`);
  // the wall
  const WT = 360, GYd = 600;
  S.add(`<path d="M-20,${WT}H1620V${GYd}H-20Z" fill="${S.lin([[0, '#d8c8aa'], [1, '#a8987e']])}"/>`);
  let cren = '', courses = '';
  for (let x = -20; x < 1620; x += 44) cren += `M${x},${WT}v-22h26v22z`;
  for (let y = WT + 40; y < GYd; y += 40) courses += `M-20,${y}H1620`;
  for (let y = WT + 20, k = 0; y < GYd; y += 40, k++) for (let x = -20 + (k % 2) * 40; x < 1620; x += 80) courses += `M${x},${y - 20}v40`;
  S.add(`<path d="${cren}" fill="#d0c0a0"/><path d="${courses}" stroke="#8a7a62" stroke-width="2" opacity=".35"/>`);
  S.add(`<rect y="${WT}" width="${W}" height="${GYd - WT}" fill="${S.lin([[0, '#fff0d0', 0.18], [0.45, '#fff0d0', 0], [1, '#3a2e28', 0.22]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  let slits = '', stains = '';
  for (const x of [120, 300, 460, 1120, 1290, 1460]) slits += `M${x},${WT + 50}h8v34h-8z`;
  for (let i = 0; i < 10; i++) { const x = R.range(0, 1600), y = R.range(WT + 60, GYd - 20); stains += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${r0(R.range(20, 60))}" ry="${r0(R.range(6, 14))}"/>`; }
  S.add(`<path d="${slits}" fill="#4a3e3a"/><g fill="#8a9a5a" opacity=".18">${stains}</g>`);
  S.add(`<path d="M-20,${WT}H1620" stroke="#fff4dc" stroke-width="3" opacity=".7"/>`);
  // gatehouse towers flanking the arch, banners with the bell emblem
  const tower = (x, w) => {
    let t = `<path d="M${x},${GYd}V250H${x + w}V${GYd}Z" fill="#e2d2b4"/><path d="M${x + w},${GYd}V250l22,-8V${GYd - 8}Z" fill="#9a8a72"/>`;
    t += `<path d="M${x - 10},250L${x + w / 2},150L${x + w + 10},250Z" fill="#66708e"/><path d="M${x + w / 2},150L${x + w + 10},250L${x + w + 32},242Z" fill="#434a66"/><path d="M${x - 10},250L${x + w / 2},150" stroke="#fff4dc" stroke-width="2.5" opacity=".8"/>`;
    t += `<path d="M${x + w * 0.4},300h${w * 0.2}v34h${-w * 0.2}z" fill="#3a3040"/>`;
    // banner
    const bx = x + w * 0.2, bw = w * 0.6;
    t += `<path d="M${bx},360h${bw}v110l${-bw / 2},-22l${-bw / 2},22z" fill="#a8343e"/><path d="M${bx + bw},360v110l${-bw * 0.15},-3V360z" fill="#7a2430"/>`;
    t += `<path d="M${bx + bw * 0.32},420q0,-28 ${bw * 0.18},-30q${bw * 0.18},2 ${bw * 0.18},30z" fill="#f2c25a"/><circle cx="${bx + bw / 2}" cy="424" r="4" fill="#f2c25a"/>`;
    return t;
  };
  S.add(tower(560, 120) + tower(920, 120));
  // the arch, gates swung open, a sunny street glimpsed through
  S.add(`<path d="M680,${GYd}V430A120,120 0 0 1 920,430V${GYd}Z" fill="#f4dcae"/>`);
  S.add(townhouse(R, 694, GYd - 44, 62, 96, { floors: 3, k: 0.42, roof: 'gable', tone: 0.15 }) + townhouse(R, 760, GYd - 48, 52, 110, { floors: 3, k: 0.42, roof: 'eave', tone: 0.2 }) + townhouse(R, 840, GYd - 44, 66, 100, { floors: 3, k: 0.42, roof: 'gable', tone: 0.15 }));
  S.add(`<path d="M680,${GYd}L760,${GYd - 44}H840L920,${GYd}Z" fill="#dcc6a0"/>`);
  let tp = '';
  for (const [x, y, s2] of [[780, 556, 0.6], [812, 552, 0.55], [745, 560, 0.62]]) tp += person(x, y, s2, '#4a3e36', R);
  S.add(`<path d="${tp}" fill="#5a4a40"/>`);
  S.add(`<path d="M680,${GYd}V430A120,120 0 0 1 920,430V${GYd}H940V430A140,140 0 0 0 660,430V${GYd}Z" fill="#b8a688"/><path d="M660,430A140,140 0 0 1 940,430" fill="none" stroke="#fff4dc" stroke-width="2.5" opacity=".7"/>`);
  S.add(`<path d="M680,${GYd}V440L620,470V${GYd + 20}Z" fill="#6a4a30"/><path d="M920,${GYd}V440L980,470V${GYd + 20}Z" fill="#5a3e28"/><path d="M684,500L624,520M684,560L624,574M916,500L976,520M916,560L976,574" stroke="#2a2a30" stroke-width="5"/>`);
  // the road and the caravan queueing in
  S.add(`<path d="M-20,${GYd}H1620V900H-20Z" fill="${S.lin([[0, '#d0b890'], [0.4, '#a88e6a'], [1, '#4a3a2a']])}"/>`);
  S.add(`<path d="M560,900L700,${GYd}H900L1040,900Z" fill="#c4a87e"/>`);
  S.add(cobbles(R, GYd + 4, 900, '#9a8060', 160, 540, 1060));
  const cart = (x, y, s, load) => {
    let c = `<path d="M${x},${y - 40 * s}h${150 * s}v${26 * s}h${-150 * s}z" fill="#7a5034"/><path d="M${x + 150 * s},${y - 30 * s}l${50 * s},${10 * s}" stroke="#5a3a28" stroke-width="${4 * s}"/>`;
    for (const [lx, lw, lh, col] of load) c += `<path d="M${x + lx * s},${y - 40 * s}v${-lh * s}h${lw * s}v${lh * s}z" fill="${col}"/>`;
    for (const wx of [30, 120]) c += `<circle cx="${x + wx * s}" cy="${y - 10 * s}" r="${16 * s}" fill="none" stroke="#3a2a20" stroke-width="${4 * s}"/><path d="M${x + wx * s - 16 * s},${y - 10 * s}h${32 * s}M${x + wx * s},${y - 26 * s}v${32 * s}" stroke="#3a2a20" stroke-width="${2 * s}"/>`;
    // donkey
    c += `<path d="M${x + 196 * s},${y - 2 * s}v${-24 * s}h${34 * s}l${12 * s},${-16 * s}l${8 * s},${4 * s}l${-6 * s},${18 * s}v${18 * s}" fill="none" stroke="#5e5248" stroke-width="${7 * s}" stroke-linejoin="round"/>`;
    return c;
  };
  S.add(cart(320, 640, 1, [[10, 40, 34, '#a87a4a'], [56, 36, 24, '#7a9a4a'], [98, 44, 40, '#c8a060']]));
  S.add(cart(1130, 630, 0.9, [[8, 48, 30, '#8a6a9a'], [62, 40, 44, '#b08a5a'], [106, 36, 26, '#d0b080']]));
  let ppl = '';
  for (const [x, y, s] of [[300, 640, 1.5], [540, 640, 1.4], [1100, 630, 1.4], [1380, 632, 1.3], [760, 612, 1.1], [840, 608, 1], [720, 598, 0.8]]) ppl += person(x, y, s, '#3a2e2a', R);
  S.add(`<path d="${ppl}" fill="#3e322c"/>`);
  // light + vignette + calm bottom
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#fff0c8', 0.15], [0.5, '#fff0c8', 0], [1, '#3a3040', 0.2]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.55, '#2a1e14', 0], [1, '#2a1e14', 0.4]], 'cx="0.5" cy="0.42" r="0.78"')}"/>`);
  S.add(`<rect y="620" width="${W}" height="280" fill="${S.lin([[0, '#2a1e14', 0], [1, '#2a1e14', 0.55]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 晨钟镇中央市集 — awnings, heaped fruit, bunting, the bell tower over the gables, a busy morning
// ---------------------------------------------------------------------------------------------
function market() {
  const S = new Scene('sbMarket', '晨钟镇中央市集：遮阳篷、果摊与钟楼', 4303);
  const R = S.R;
  sky(S, '#88aed4', '#d2dade', '#f6e6c0');
  S.add(`<circle cx="230" cy="160" r="560" fill="${S.rad([[0, '#fff8e0', 0.85], [0.15, '#ffeec0', 0.4], [1, '#ffeec0', 0]])}"/>`);
  const cc = { lit: '#fffaf2', shade: '#dcd4d6', rim: '#ffffff' };
  S.add(cloud(R, 1060, 130, 320, 64, cc, { bumps: 6 }) + cloud(R, 420, 90, 220, 44, cc, { bumps: 5 }));
  // the bell tower behind the plaza
  S.add(bellTower(760, 470, 84, 310, TOWER_PAL, { side: 'r' }).svg);
  S.add(`<circle cx="802" cy="300" r="20" fill="none" stroke="#7a6a5a" stroke-width="4"/><path d="${star7(802, 300, 16)}" fill="#ffd77a"/>`);
  // townhouses around the plaza
  const back = [[-30, 150, 300, 3, 'gable'], [116, 130, 260, 3, 'eave'], [244, 150, 320, 4, 'gable'], [392, 140, 280, 3, 'gable'], [530, 120, 250, 3, 'eave'], [900, 130, 270, 3, 'eave'], [1028, 150, 310, 4, 'gable'], [1176, 130, 260, 3, 'gable'], [1304, 150, 300, 3, 'eave'], [1452, 170, 320, 4, 'gable']];
  for (const [x, w, h, fl, roof] of back) S.add(townhouse(R, x, 540, w, h, { floors: fl, roof, side: 0, k: 0.9, tone: 0.05 }));
  // bunting strung across the plaza
  let bun = '';
  const cols = ['#e85a5a', '#f2c25a', '#5aa0e0', '#7ac06a', '#e88ac0'];
  for (const [x0, y0, x1, y1, sag] of [[0, 300, 760, 330, 60], [850, 330, 1600, 290, 60], [80, 400, 1520, 400, 90]]) {
    bun += `<path d="M${x0},${y0}Q${(x0 + x1) / 2},${(y0 + y1) / 2 + sag * 2} ${x1},${y1}" fill="none" stroke="#5a4a3a" stroke-width="1.5"/>`;
    for (let i = 1; i < 18; i++) {
      const t = i / 18, x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * (x0 + x1) / 2 + t * t * x1, y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * ((y0 + y1) / 2 + sag * 2) + t * t * y1;
      bun += `<path d="M${r0(x - 9)},${r0(y)}h18l-9,20z" fill="${cols[i % cols.length]}"/>`;
    }
  }
  S.add(bun);
  // plaza floor
  S.add(`<path d="M-20,540H1620V900H-20Z" fill="${S.lin([[0, '#d6c4a2'], [0.4, '#b49c78'], [1, '#5a4a38']])}"/>`);
  S.add(cobbles(R, 546, 900, '#a08a68', 260));
  // crowd in the back
  let ppl = '';
  for (let i = 0; i < 30; i++) ppl += person(R.range(20, 1580), R.range(552, 576), R.range(0.8, 1.1), '#4a3e36', R);
  S.add(`<path d="${ppl}" fill="#54463c"/>`);
  // back row of stalls
  const fruit = [['#e04a3a', '#f2a03a', '#f2d24a'], ['#7ab04a', '#a8d060', '#5a8a3a'], ['#9a4a8a', '#c86aa8', '#6a3a7a'], ['#e8c070', '#c89050', '#a87040']];
  const awn = [['#e85a5a', '#fff2e0'], ['#4a8ac8', '#fff2e0'], ['#f2b84a', '#fff2e0'], ['#5aa070', '#fff2e0']];
  for (let i = 0; i < 6; i++) S.add(stall(R, 30 + i * 270 + (i > 2 ? 60 : 0), 600, 180, 120, awn[i % 4], fruit[i % 4]));
  // front row (larger), leaving the centre open toward the tower
  S.add(stall(R, -40, 680, 340, 210, awn[1], fruit[0]) + stall(R, 1300, 690, 340, 220, awn[0], fruit[1]));
  // baskets and crates on the cobbles
  S.add(`<path d="M420,700h70l-8,40h-54z" fill="#a8783e"/><path d="M424,700q31,-20 62,0" fill="#e04a3a"/><path d="M1130,690h80v50h-80z" fill="#8a5a3a"/><path d="M1130,690h80" stroke="#c4885a" stroke-width="3"/><circle cx="1150" cy="684" r="10" fill="#f2a03a"/><circle cx="1172" cy="682" r="10" fill="#f2d24a"/><circle cx="1192" cy="686" r="10" fill="#f2a03a"/>`);
  // the copper sweeping beetle chasing a brush (tiny)
  S.add(`<ellipse cx="960" cy="606" rx="12" ry="8" fill="#c87a3a"/><path d="M952,606h16M960,598v16" stroke="#7a4a2a" stroke-width="1.5"/><path d="M972,612l16,4" stroke="#5a3a2a" stroke-width="3"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#fff0c8', 0.15], [0.5, '#fff0c8', 0], [1, '#3a3040', 0.2]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.55, '#2a1e14', 0], [1, '#2a1e14', 0.4]], 'cx="0.5" cy="0.42" r="0.78"')}"/>`);
  S.add(`<rect y="620" width="${W}" height="280" fill="${S.lin([[0, '#2a1e14', 0], [1, '#2a1e14', 0.55]])}"/>`);
  return S.out();
}

// Guild emblem: a pointed sword laid diagonally behind a small bell (no text, no cross shape)
export function swordBell(cx, cy, k) {
  const a = Math.PI / 4, c = Math.cos(a), sn = Math.sin(a), L = 34 * k;
  const tip = [cx + c * L, cy - sn * L], pom = [cx - c * L * 0.8, cy + sn * L * 0.8], g0 = [cx - c * L * 0.42 - sn * 11 * k, cy + sn * L * 0.42 - c * 11 * k], g1 = [cx - c * L * 0.42 + sn * 11 * k, cy + sn * L * 0.42 + c * 11 * k];
  return `<path d="M${r0(pom[0])},${r0(pom[1])}L${r0(tip[0])},${r0(tip[1])}" stroke="#e8d0a0" stroke-width="${f(5 * k)}" stroke-linecap="round"/><path d="M${r0(g0[0])},${r0(g0[1])}L${r0(g1[0])},${r0(g1[1])}" stroke="#e8d0a0" stroke-width="${f(4 * k)}"/><circle cx="${r0(pom[0])}" cy="${r0(pom[1])}" r="${f(4 * k)}" fill="#e8d0a0"/>`
    + `<path d="M${r0(cx - 9 * k)},${r0(cy + 10 * k)}q0,${r0(-18 * k)} ${r0(9 * k)},${r0(-18 * k)}q${r0(9 * k)},0 ${r0(9 * k)},${r0(18 * k)}z" fill="#f2c25a"/>`;
}

// Narrow alley in one-point perspective: half-timbered walls at X = ±hw, eaves, cobbles.
// pal: { wall, wallFar, timber, shade, glass, ground, eave } ; dim (0..1) darkens toward the far end.
export function alley(S, R, pr, { hw = 2.2, z0 = 1.4, z1 = 40, hgt = 9, pal, segs = null }) {
  const out = [];
  const segList = segs || (() => { const a = []; let z = z0; while (z < z1) { const l = R.range(3, 5.5); a.push([z, Math.min(z1, z + l)]); z += l; } return a; })();
  for (const side of [-1, 1]) {
    for (const [za, zb] of [...segList].reverse()) {
      const X = hw * side, hh = hgt * R.range(0.8, 1.1);
      const far = Math.min(1, (za - z0) / (z1 - z0));
      const wc = mix(side < 0 ? pal.wall : pal.wallR || pal.wall, pal.wallFar, far * 0.8);
      out.push(`<path d="${pr.quad([[X, 0, za], [X, hh, za], [X, hh, zb], [X, 0, zb]])}" fill="${wc}"/>`);
      // stone ground course
      out.push(`<path d="${pr.quad([[X, 0, za], [X, 2.4, za], [X, 2.4, zb], [X, 0, zb]])}" fill="${mix(pal.stone, pal.wallFar, far * 0.8)}"/>`);
      // timbers: floor beams, posts, braces
      let tb = '';
      for (const y of [2.4, 5.2, 8]) if (y < hh) tb += pl(pr.poly([[X, y, za], [X, y, zb]]));
      for (const t of [0, 0.5, 1]) tb += pl(pr.poly([[X, 2.4, za + (zb - za) * t], [X, hh, za + (zb - za) * t]]));
      tb += pl(pr.poly([[X, 2.4, za], [X, 5.2, za + (zb - za) * 0.5]])) + pl(pr.poly([[X, 5.2, za + (zb - za) * 0.5], [X, 8, zb]]));
      out.push(`<path d="${tb}" fill="none" stroke="${mix(pal.timber, pal.wallFar, far * 0.6)}" stroke-width="${f(Math.max(1.5, 26 / za))}"/>`);
      // windows + shutters, a door
      let win = '';
      for (const y of [3.2, 6]) if (y + 1.4 < hh) for (const t of [0.18, 0.62]) {
        const a = za + (zb - za) * t, b = a + Math.min(1, (zb - za) * 0.2);
        win += `<path d="${pr.quad([[X, y, a], [X, y + 1.3, a], [X, y + 1.3, b], [X, y, b]])}" fill="${mix(pal.glass, pal.wallFar, far * 0.5)}"/>`;
      }
      const da = za + (zb - za) * 0.35;
      win += `<path d="${pr.quad([[X, 0, da], [X, 2.1, da], [X, 2.1, da + 1], [X, 0, da + 1]])}" fill="${mix(pal.timber, pal.wallFar, far * 0.6)}"/>`;
      out.push(win);
      // eave (overhang) along the top
      out.push(`<path d="${pr.quad([[X, hh, za - 0.1], [X - side * 0.8, hh + 0.5, za - 0.1], [X - side * 0.8, hh + 0.5, zb + 0.1], [X, hh, zb + 0.1]])}" fill="${mix(pal.eave, pal.wallFar, far * 0.6)}"/>`);
    }
  }
  // cobbled ground
  out.push(`<path d="${pr.quad([[-hw, 0, z0], [-hw, 0, z1], [hw, 0, z1], [hw, 0, z0]])}" fill="${pal.ground}"/>`);
  let cb = '';
  for (let i = 0; i < 200; i++) { const z = z0 + (z1 - z0) * R() ** 2.2, X = R.range(-hw, hw), p = pr(X, 0, z), k = 900 / z; cb += `<ellipse cx="${r0(p[0])}" cy="${r0(p[1])}" rx="${f(0.12 * k)}" ry="${f(0.045 * k)}"/>`; }
  out.push(`<g fill="${pal.cobble}" opacity=".5">${cb}</g>`);
  return out.join('');
}

// ---------------------------------------------------------------------------------------------
// 染布巷 — wet dyed cloth hung on lines across a narrow alley; dye vats, puddles holding the colours
// ---------------------------------------------------------------------------------------------
function dyeAlley() {
  const S = new Scene('sbDye', '染布巷：横跨窄巷的湿染布与染缸', 4404);
  const R = S.R;
  const pr = persp({ vp: [800, 470], F: 820, eye: 1.6 });
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#c8d4ea'], [0.45, '#e8dcd4'], [1, '#5a5068']])}"/>`);
  S.add(`<circle cx="760" cy="200" r="420" fill="${S.rad([[0, '#fff6e6', 0.7], [1, '#fff6e6', 0]])}"/>`);
  S.add(alley(S, R, pr, { hw: 2.4, hgt: 10, pal: { wall: '#9a8cae', wallR: '#c8b8c8', wallFar: '#d8cce0', stone: '#7a7088', timber: '#3e3448', glass: '#3a3450', eave: '#4a3a50', ground: '#6a6078', cobble: '#4a4258' } }));
  // dye vats along the walls
  for (const [X, Z, c] of [[-1.9, 4.5, '#3a4a9a'], [-1.9, 6.2, '#b83a4a'], [1.9, 5, '#d8a02a'], [1.9, 8.5, '#3a8a5a'], [-1.9, 11, '#7a3a8a']]) {
    const b = pr(X, 0, Z), k = 820 / Z;
    S.add(`<path d="M${r0(b[0] - 0.5 * k)},${r0(b[1])}v${r0(-0.8 * k)}h${r0(k)}v${r0(0.8 * k)}z" fill="#6a4a3a"/><ellipse cx="${r0(b[0])}" cy="${r0(b[1] - 0.8 * k)}" rx="${r0(0.5 * k)}" ry="${r0(0.13 * k)}" fill="${c}"/><path d="M${r0(b[0] - 0.5 * k)},${r0(b[1] - 0.4 * k)}h${r0(k)}" stroke="#3a2a22" stroke-width="${f(0.05 * k)}"/>`);
  }
  // lines of wet cloth at several depths (long hanging lengths with soft folds), dripping
  const cols = [['#3a4ea8', '#28367a'], ['#c8404e', '#8e2a36'], ['#e8b030', '#b07e1a'], ['#3a9a6a', '#26704a'], ['#8a4aa8', '#5e3278'], ['#e86a8a', '#b04a64'], ['#4ab0c8', '#2e7e92']];
  let drips = '';
  for (const [Z, Y, n, L] of [[22, 5, 6, 1.8], [15, 4.9, 5, 2], [10, 4.8, 4, 2.2]]) {
    const a = pr(-2.4, Y, Z), b = pr(2.4, Y, Z), k = 820 / Z, sagPx = 0.35 * k;
    S.add(`<path d="M${r0(a[0])},${r0(a[1])}Q800,${r0(a[1] + sagPx * 2)} ${r0(b[0])},${r0(b[1])}" fill="none" stroke="#2a2430" stroke-width="${f(Math.max(1, 0.025 * k))}"/>`);
    const sag = (t) => a[1] + sagPx * 4 * t * (1 - t);
    for (let i = 0; i < n; i++) {
      const t0 = (i + 0.06) / n, t1 = (i + 0.94) / n;
      const x0 = a[0] + (b[0] - a[0]) * t0, x1 = a[0] + (b[0] - a[0]) * t1, xm = (x0 + x1) / 2;
      const y0 = sag(t0), y1 = sag(t1), ym = sag((t0 + t1) / 2);
      const len = k * L * R.range(0.8, 1.1);
      const [c, cs] = cols[(i * 3 + Math.round(Z)) % cols.length];
      const h0 = y0 + len, h1 = y1 + len * R.range(0.92, 1.05);
      S.add(`<path d="M${r0(x0)},${r0(y0)}Q${r0(xm)},${r0(ym + (y0 + y1) / 2 - ym)} ${r0(x1)},${r0(y1)}L${r0(x1 + k * 0.03)},${r0(h1)}L${r0(xm)},${r0((h0 + h1) / 2 + k * 0.06)}L${r0(x0 - k * 0.02)},${r0(h0)}Z" fill="${c}"/>`);
      // folds + the wet sheen on the lit edge
      S.add(`<path d="M${r0(x0 + (x1 - x0) * 0.3)},${r0(y0 + 2)}L${r0(x0 + (x1 - x0) * 0.28)},${r0(h0)}M${r0(x0 + (x1 - x0) * 0.68)},${r0(y1 + 2)}L${r0(x0 + (x1 - x0) * 0.7)},${r0(h1)}" stroke="${cs}" stroke-width="${f(Math.max(1, (x1 - x0) * 0.04))}" opacity=".7"/><path d="M${r0(x0 + 2)},${r0(y0 + 2)}V${r0(h0)}" stroke="#fff" stroke-width="${f(Math.max(1, 0.03 * k))}" opacity=".35"/>`);
      for (let q = 0; q < 2; q++) { const dx = R.range(x0, x1); drips += `<ellipse cx="${r0(dx)}" cy="${r0(Math.max(h0, h1) + R.range(0.15, 0.9) * k)}" rx="${f(0.02 * k + 0.6)}" ry="${f(0.05 * k + 1)}"/>`; }
    }
  }
  S.add(`<g fill="#c8d8f0" opacity=".7">${drips}</g>`);
  // puddles holding the colours
  for (const [X, Z, w, c] of [[-0.6, 5.5, 1.4, '#6a7ab8'], [0.8, 8, 1, '#c86a7a'], [-0.2, 12, 0.8, '#d8b060']]) {
    const p = pr(X, 0, Z), k = 820 / Z;
    S.add(`<ellipse cx="${r0(p[0])}" cy="${r0(p[1])}" rx="${r0(w * k / 2)}" ry="${r0(w * k * 0.08)}" fill="${c}" opacity=".55"/><ellipse cx="${r0(p[0] - w * k * 0.1)}" cy="${r0(p[1] - 1)}" rx="${r0(w * k * 0.2)}" ry="${r0(w * k * 0.02)}" fill="#fff" opacity=".5"/>`);
  }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.45, '#1e1828', 0], [1, '#1e1828', 0.6]], 'cx="0.5" cy="0.4" r="0.75"')}"/>`);
  S.add(`<rect y="620" width="${W}" height="280" fill="${S.lin([[0, '#1e1828', 0], [1, '#1e1828', 0.6]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 旧酒桶巷 — a dim back alley of stacked old wine barrels, a loose rack, low eaves, a laundry line,
// wash water across the stones; the far end turns into shadow.
// ---------------------------------------------------------------------------------------------
function barrelAlley() {
  const S = new Scene('sbBarrel', '旧酒桶巷：堆叠的旧酒桶、松动的木架与低矮屋檐', 4505);
  const R = S.R;
  const pr = persp({ vp: [820, 450], F: 820, eye: 1.6 });
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#b8b0a4'], [0.4, '#8a7a6a'], [1, '#1e1a1a']])}"/>`);
  S.add(alley(S, R, pr, { hw: 2.0, z1: 22, hgt: 7.5, pal: { wall: '#6e5a48', wallR: '#8a7058', wallFar: '#4a3e36', stone: '#5a4e44', timber: '#2e221c', glass: '#1e1a1e', eave: '#3a2a22', ground: '#3e342e', cobble: '#2a221e' } }));
  // dead end in shadow
  const e0 = pr(-2, 0, 22), e1 = pr(2, 7.5, 22);
  S.add(`<rect x="${r0(e0[0])}" y="${r0(e1[1])}" width="${r0(e1[0] - e0[0])}" height="${r0(e0[1] - e1[1])}" fill="#2a221e"/>`);
  // a shaft of light falling across the middle of the alley
  S.add(`<path d="${pz([pr(-2, 7.5, 9), pr(0.6, 7.5, 9), pr(1.6, 0, 11), pr(-1, 0, 11)])}" fill="#ffe6b8" opacity=".22" filter="${S.blur(2)}"/>`);
  // barrels: stacked pyramids along both walls
  // old wine barrels standing along the walls (bulging staves, iron hoops), a few stacked
  const barrel = (X, Y, Z, r, hgt) => {
    const k = 820 / Z, bot = pr(X, Y, Z), top = pr(X, Y + hgt, Z), rr = r * k, bulge = rr * 0.16;
    const xl = bot[0] - rr, xr = bot[0] + rr, yb = bot[1], yt = top[1];
    let b = `<path d="M${r0(xl)},${r0(yb)}Q${r0(xl - bulge)},${r0((yb + yt) / 2)} ${r0(xl)},${r0(yt)}L${r0(xr)},${r0(yt)}Q${r0(xr + bulge)},${r0((yb + yt) / 2)} ${r0(xr)},${r0(yb)}Z" fill="#7a5434"/>`;
    b += `<path d="M${r0(bot[0] + rr * 0.3)},${r0(yb)}Q${r0(xr + bulge * 0.6)},${r0((yb + yt) / 2)} ${r0(bot[0] + rr * 0.3)},${r0(yt)}L${r0(xr)},${r0(yt)}Q${r0(xr + bulge)},${r0((yb + yt) / 2)} ${r0(xr)},${r0(yb)}Z" fill="#4e3422"/>`;
    b += `<path d="M${r0(xl - bulge * 0.4)},${r0(yb + (yt - yb) * 0.22)}H${r0(xr + bulge * 0.4)}M${r0(xl - bulge * 0.4)},${r0(yb + (yt - yb) * 0.78)}H${r0(xr + bulge * 0.4)}" stroke="#2a2420" stroke-width="${f(Math.max(1.5, rr * 0.1))}"/>`;
    b += `<ellipse cx="${r0(top[0])}" cy="${r0(yt)}" rx="${r0(rr)}" ry="${r0(rr * 0.22)}" fill="#9a7048"/><path d="M${r0(xl + rr * 0.15)},${r0(yb - 4)}V${r0(yt + 6)}" stroke="#e8c090" stroke-width="${f(Math.max(1, rr * 0.07))}" opacity=".5"/>`;
    return b;
  };
  let bar = '';
  for (const [X, Z, stack] of [[-1.55, 15, 1], [1.5, 13, 0], [-1.5, 10.5, 1], [1.5, 7.2, 1], [-1.45, 6, 0], [-1.45, 4.6, 1]]) {
    bar += barrel(X, 0, Z, 0.36, 0.95) + barrel(X - 0.3 * Math.sign(X), 0, Z + 0.9, 0.36, 0.95);
    if (stack) bar += barrel(X - 0.12 * Math.sign(X), 0.95, Z + 0.45, 0.34, 0.9);
  }
  S.add(bar);
  // loose wooden rack leaning against the right wall
  const ra = pr(1.95, 0, 8.2), rb = pr(1.95, 2.6, 8.2), rc = pr(1.95, 2.6, 9.6), rd = pr(1.95, 0, 9.6);
  S.add(`<path d="M${r0(ra[0])},${r0(ra[1])}L${r0(rb[0] - 14)},${r0(rb[1])}M${r0(rd[0])},${r0(rd[1])}L${r0(rc[0] - 10)},${r0(rc[1])}" stroke="#4a3626" stroke-width="7"/><path d="M${r0(rb[0] - 14)},${r0(rb[1] + 40)}L${r0(rc[0] - 10)},${r0(rc[1] + 34)}M${r0(rb[0] - 8)},${r0(rb[1] + 100)}L${r0(rc[0] - 6)},${r0(rc[1] + 86)}" stroke="#5a4230" stroke-width="5"/>`);
  // low eave overhanging on the right (the crossbowman's perch), with a laundry line under it
  S.add(`<path d="${pr.quad([[2.0, 3.9, 6], [0.9, 3.35, 6], [0.9, 3.35, 13], [2.0, 3.9, 13]])}" fill="#3a2a22"/><path d="${pr.quad([[0.9, 3.35, 6], [0.9, 3.2, 6], [0.9, 3.2, 13], [0.9, 3.35, 13]])}" fill="#22180f"/><path d="${pl(pr.poly([[0.9, 3.35, 6], [0.9, 3.35, 13]]))}" stroke="#c8a070" stroke-width="2" opacity=".5"/>`);
  const l0 = pr(-2, 3.1, 7.5), l1 = pr(2, 3.1, 7.5);
  S.add(`<path d="M${r0(l0[0])},${r0(l0[1])}Q${r0((l0[0] + l1[0]) / 2)},${r0(l0[1] + 40)} ${r0(l1[0])},${r0(l1[1])}" fill="none" stroke="#2a2220" stroke-width="2"/>`);
  S.add(`<path d="M${r0(l0[0] + 120)},${r0(l0[1] + 18)}l90,10v120l-90,-6z" fill="#b8b0a0"/><path d="M${r0(l0[0] + 260)},${r0(l0[1] + 30)}l70,4v90l-70,-2z" fill="#8a9aa8"/>`);
  // wash water spreading across the stones
  const pw = pr(0.2, 0, 6.5);
  S.add(`<ellipse cx="${r0(pw[0])}" cy="${r0(pw[1])}" rx="200" ry="22" fill="#8a8a90" opacity=".4"/><ellipse cx="${r0(pw[0] - 40)}" cy="${r0(pw[1] - 4)}" rx="60" ry="5" fill="#e8e0d0" opacity=".45"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.4, '#0e0a08', 0], [1, '#0e0a08', 0.7]], 'cx="0.5" cy="0.42" r="0.72"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#0e0a08', 0], [1, '#0e0a08', 0.7]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 晨钟镇冒险者公会 — not a hall of heroes: muddy benches, a crowded quest board, a supply counter,
// the registration desk under the stair; morning light through the windows; a slime under the notice.
// ---------------------------------------------------------------------------------------------
function guildHall() {
  const S = new Scene('sbGuild', '晨钟镇冒险者公会一楼：委托板、登记柜台与补给架', 4202);
  const R = S.R;
  const pr = persp({ vp: [800, 400], F: 760, eye: 1.6 });
  const X0 = -5, X1 = 5, CEIL = 4.2, BACK = 12, NEAR = 1.2;
  const q = (pts) => pr.quad(pts);
  S.add(`<rect width="${W}" height="${H}" fill="#2a1c14"/>`);
  S.add(`<path d="${q([[X0, 0, BACK], [X0, CEIL, BACK], [X1, CEIL, BACK], [X1, 0, BACK]])}" fill="${S.lin([[0, '#a07650'], [1, '#6a4a32']])}"/>`);
  S.add(`<path d="${q([[X0, 0, NEAR], [X0, CEIL, NEAR], [X0, CEIL, BACK], [X0, 0, BACK]])}" fill="${S.lin([[0, '#5a3e2a'], [1, '#8a6444']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="${q([[X1, 0, NEAR], [X1, CEIL, NEAR], [X1, CEIL, BACK], [X1, 0, BACK]])}" fill="${S.lin([[0, '#7a5638'], [1, '#4a3222']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="${q([[X0, CEIL, NEAR], [X0, CEIL, BACK], [X1, CEIL, BACK], [X1, CEIL, NEAR]])}" fill="#2e2016"/>`);
  S.add(`<path d="${q([[X0, 0, NEAR], [X0, 0, BACK], [X1, 0, BACK], [X1, 0, NEAR]])}" fill="${S.lin([[0, '#7a5a3e'], [1, '#2a1c14']], `gradientUnits="userSpaceOnUse" x1="0" y1="${pr(0, 0, BACK)[1]}" x2="0" y2="${H}"`)}"/>`);
  let pk = '';
  for (let x = X0 + 0.6; x < X1; x += 0.6) pk += pl(pr.poly([[x, 0, NEAR], [x, 0, BACK]]));
  for (let x = X0 + 0.5; x < X1; x += 0.5) pk += pl(pr.poly([[x, 0, BACK], [x, CEIL, BACK]]));
  S.add(`<path d="${pk}" stroke="#2a1a10" stroke-width="2" opacity=".35"/>`);
  let beams = '';
  for (const z of [2.5, 5, 7.5, 10, 11.9]) beams += pz(pr.poly([[X0, CEIL, z], [X1, CEIL, z], [X1, CEIL - 0.3, z], [X0, CEIL - 0.3, z]]));
  S.add(`<path d="${beams}" fill="#3a2618"/>`);
  // windows on the left wall with morning light falling across the floor
  for (const [z0, z1] of [[3.2, 4.6], [6.4, 7.8]]) {
    S.add(`<path d="${q([[X0 + 0.02, 1.3, z0], [X0 + 0.02, 3.2, z0], [X0 + 0.02, 3.2, z1], [X0 + 0.02, 1.3, z1]])}" fill="#f6e2b0"/><path d="${pl(pr.poly([[X0 + 0.03, 2.25, z0], [X0 + 0.03, 2.25, z1]]))}${pl(pr.poly([[X0 + 0.03, 1.3, (z0 + z1) / 2], [X0 + 0.03, 3.2, (z0 + z1) / 2]]))}" stroke="#4a3222" stroke-width="5"/>`);
    S.add(`<path d="${pz([pr(X0, 3.2, z0), pr(X0, 3.2, z1), pr(-1.2, 0, z1 + 2.2), pr(-1.6, 0, z0 + 1.6)])}" fill="#ffe2a8" opacity=".2" filter="${S.blur(2)}"/>`);
  }
  // the quest board on the left wall, crowded with pinned requests; the big red-bordered notice
  S.add(`<path d="${q([[X0 + 0.03, 1.1, 8.4], [X0 + 0.03, 3, 8.4], [X0 + 0.03, 3, 11.4], [X0 + 0.03, 1.1, 11.4]])}" fill="#8a6440"/>`);
  let papers = '';
  for (let i = 0; i < 16; i++) { const z = R.range(8.6, 11), y = R.range(1.3, 2.6), w = R.range(0.25, 0.4), h = R.range(0.25, 0.4); papers += `<path d="${q([[X0 + 0.05, y, z], [X0 + 0.05, y + h, z], [X0 + 0.05, y + h, z + w], [X0 + 0.05, y, z + w]])}" fill="${R() < 0.7 ? '#f0e4c8' : '#e8d4a8'}"/>`; }
  S.add(papers);
  S.add(`<path d="${q([[X0 + 0.06, 3.2, 8.8], [X0 + 0.06, 4, 8.8], [X0 + 0.06, 4, 10.6], [X0 + 0.06, 3.2, 10.6]])}" fill="#f4ead0" stroke="#b03a3a" stroke-width="4"/>`);
  // the slime creeping along beneath the notice
  { const p = pr(X0 + 0.25, 0, 9.6); S.add(`<path d="M${r0(p[0] - 14)},${r0(p[1])}q2,-18 14,-18q14,0 16,18z" fill="#6ac0e8" opacity=".9"/><circle cx="${r0(p[0] - 2)}" cy="${r0(p[1] - 11)}" r="2" fill="#1a3a5a"/><circle cx="${r0(p[0] + 6)}" cy="${r0(p[1] - 11)}" r="2" fill="#1a3a5a"/><path d="M${r0(p[0] - 8)},${r0(p[1] - 14)}q4,-4 8,-2" fill="none" stroke="#e0f6ff" stroke-width="2"/>`); }
  // benches along the left wall, muddy boot prints on the boards
  S.add(`<path d="${q([[X0 + 0.1, 0.48, 2.4], [X0 + 0.1, 0.48, 7.6], [X0 + 0.7, 0.48, 7.6], [X0 + 0.7, 0.48, 2.4]])}" fill="#6a4628"/><path d="${q([[X0 + 0.7, 0.48, 2.4], [X0 + 0.7, 0.48, 7.6], [X0 + 0.7, 0.36, 7.6], [X0 + 0.7, 0.36, 2.4]])}" fill="#3a2414"/>`);
  let prints = '';
  for (let i = 0; i < 16; i++) { const z = 2.6 + i * 0.5, x = -2.4 + Math.sin(i * 1.3) * 0.6 + (i % 2) * 0.3, p = pr(x, 0, z), k = 760 / z; prints += `<ellipse cx="${r0(p[0])}" cy="${r0(p[1])}" rx="${f(0.08 * k)}" ry="${f(0.03 * k)}"/>`; }
  S.add(`<g fill="#3a2a1a" opacity=".55">${prints}</g>`);
  // supply counter on the right: potions, rope coils, ration sacks
  S.add(`<path d="${q([[X1 - 1, 0, 3], [X1 - 1, 1.1, 3], [X1 - 1, 1.1, 8], [X1 - 1, 0, 8]])}" fill="#6a4426"/><path d="${q([[X1 - 1, 1.1, 3], [X1 - 1.3, 1.1, 3], [X1 - 1.3, 1.1, 8], [X1 - 1, 1.1, 8]])}" fill="#a87448"/>`);
  let shelf = '';
  for (const y of [1.7, 2.4, 3.1]) shelf += pz(pr.poly([[X1 - 0.02, y, 3.2], [X1 - 0.02, y, 7.8], [X1 - 0.02, y - 0.06, 7.8], [X1 - 0.02, y - 0.06, 3.2]]));
  S.add(`<path d="${shelf}" fill="#3a2414"/>`);
  let bottles = '';
  const bc = ['#e85a6a', '#5ab0e8', '#7ad06a', '#f2c25a', '#b07ae0'];
  for (let i = 0; i < 22; i++) { const z = 3.4 + (i % 11) * 0.4, y = i < 11 ? 1.7 : 2.4, p = pr(X1 - 0.05, y, z), k = 760 / z; bottles += `<path d="M${r0(p[0] - 0.05 * k)},${r0(p[1])}v${r0(-0.16 * k)}l${r0(0.025 * k)},${r0(-0.06 * k)}v${r0(-0.04 * k)}h${r0(0.05 * k)}v${r0(0.04 * k)}l${r0(0.025 * k)},${r0(0.06 * k)}v${r0(0.16 * k)}z" fill="${bc[i % bc.length]}"/>`; }
  S.add(bottles);
  for (const z of [4, 5.2, 6.4]) { const p = pr(X1 - 0.05, 3.15, z), k = 760 / z; S.add(`<ellipse cx="${r0(p[0])}" cy="${r0(p[1] - 0.15 * k)}" rx="${r0(0.12 * k)}" ry="${r0(0.15 * k)}" fill="none" stroke="#c8a870" stroke-width="${f(0.05 * k)}"/>`); }
  for (const z of [3.5, 4.3]) { const p = pr(X1 - 1.3, 1.1, z), k = 760 / z; S.add(`<path d="M${r0(p[0] - 0.2 * k)},${r0(p[1])}q${r0(0.02 * k)},${r0(-0.36 * k)} ${r0(0.2 * k)},${r0(-0.38 * k)}q${r0(0.2 * k)},${r0(0.02 * k)} ${r0(0.2 * k)},${r0(0.38 * k)}z" fill="#c8b088"/>`); }
  // the stair to the upper floor (right, back)
  let st = '';
  for (let i = 0; i < 9; i++) { const y = i * 0.4, z = 11.8 - i * 0.12; st += pz(pr.poly([[X1 - 2.2, y + 0.4, z], [X1 - 0.1, y + 0.4, z], [X1 - 0.1, y, z], [X1 - 2.2, y, z]])); }
  S.add(`<path d="${st}" fill="#5a3a24"/><path d="${pl(pr.poly([[X1 - 2.2, 0.9, 11.8], [X1 - 2.2, 4.1, 10.8]]))}" stroke="#2a1a10" stroke-width="6"/>`);
  // the registration counter (back centre): ledgers, inkwell and quill, the seven-sided crystal disk
  S.add(`<path d="${q([[-2.6, 0, 10.4], [-2.6, 1.15, 10.4], [1.6, 1.15, 10.4], [1.6, 0, 10.4]])}" fill="#6a4226"/><path d="${q([[-2.6, 1.15, 10.4], [-2.6, 1.15, 11.2], [1.6, 1.15, 11.2], [1.6, 1.15, 10.4]])}" fill="#b07a4c"/>`);
  S.add(`<path d="${q([[-2.4, 0.2, 10.38], [-2.4, 0.95, 10.38], [-0.6, 0.95, 10.38], [-0.6, 0.2, 10.38]])}" fill="#4a2c18"/><path d="${q([[0, 0.2, 10.38], [0, 0.95, 10.38], [1.4, 0.95, 10.38], [1.4, 0.2, 10.38]])}" fill="#4a2c18"/>`);
  { const p = pr(-1.4, 1.15, 10.8), k = 760 / 10.8; S.add(`<path d="M${r0(p[0])},${r0(p[1])}h${r0(0.5 * k)}v${r0(-0.06 * k)}h${r0(-0.5 * k)}z" fill="#f0e4c8"/><path d="M${r0(p[0] + 0.1 * k)},${r0(p[1] - 0.06 * k)}h${r0(0.4 * k)}v${r0(-0.08 * k)}h${r0(-0.4 * k)}z" fill="#8a3a2a"/>`); }
  { const p = pr(-0.4, 1.15, 10.7), k = 760 / 10.7; S.add(`<path d="M${r0(p[0])},${r0(p[1])}v${r0(-0.08 * k)}h${r0(0.1 * k)}v${r0(0.08 * k)}z" fill="#1a1a2a"/><path d="M${r0(p[0] + 0.05 * k)},${r0(p[1] - 0.08 * k)}q${r0(0.1 * k)},${r0(-0.3 * k)} ${r0(0.25 * k)},${r0(-0.45 * k)}q${r0(-0.06 * k)},${r0(0.22 * k)} ${r0(-0.22 * k)},${r0(0.44 * k)}z" fill="#f4f0e8"/>`); }
  { const p = pr(0.7, 1.15, 10.8), k = 760 / 10.8; S.add(`<ellipse cx="${r0(p[0])}" cy="${r0(p[1] - 0.03 * k)}" rx="${r0(0.28 * k)}" ry="${r0(0.07 * k)}" fill="#5a4a6a"/><path d="${star7(p[0], p[1] - 0.05 * k, 0.2 * k, 0.6)}" fill="#b8a8e0" transform="translate(0 0) scale(1 1)" opacity=".8"/>`); }
  // shelves of ledgers behind the counter, the guild banner above
  let led = '';
  for (let i = 0; i < 18; i++) { const x = -2.4 + i * 0.22, y = i % 2 ? 1.9 : 2.6, p = pr(x, y, BACK - 0.02), k = 760 / BACK; led += `<rect x="${r0(p[0])}" y="${r0(p[1] - 0.45 * k)}" width="${r0(0.16 * k)}" height="${r0(0.45 * k)}" fill="${['#8a3a2a', '#3a5a7a', '#5a6a3a', '#7a5a3a'][i % 4]}"/>`; }
  S.add(led);
  { const a = pr(-1.2, 4, BACK - 0.03), b = pr(0.2, 3.1, BACK - 0.03); S.add(`<path d="M${r0(a[0])},${r0(a[1])}H${r0(b[0])}V${r0(b[1])}l${r0((a[0] - b[0]) / 2)},${r0(-18)}l${r0((a[0] - b[0]) / 2)},18z" fill="#3a5a8a"/>${swordBell((a[0] + b[0]) / 2, a[1] + 40, 0.9)}`); }
  // tables with tankards in the middle
  for (const [x, z] of [[-1.6, 5.2], [1.2, 6.6]]) {
    S.add(`<path d="${q([[x - 0.8, 0.8, z - 0.5], [x - 0.8, 0.8, z + 0.5], [x + 0.8, 0.8, z + 0.5], [x + 0.8, 0.8, z - 0.5]])}" fill="#9a6a40"/><path d="${q([[x - 0.8, 0.8, z - 0.5], [x + 0.8, 0.8, z - 0.5], [x + 0.8, 0.72, z - 0.5], [x - 0.8, 0.72, z - 0.5]])}" fill="#4a2c18"/>`);
    S.add(`<path d="${q([[x - 0.1, 0, z], [x - 0.1, 0.72, z], [x + 0.1, 0.72, z], [x + 0.1, 0, z]])}" fill="#3a2414"/>`);
    const p = pr(x + 0.3, 0.8, z), k = 760 / z; S.add(`<path d="M${r0(p[0])},${r0(p[1])}v${r0(-0.2 * k)}h${r0(0.12 * k)}v${r0(0.2 * k)}z" fill="#c8a060"/><path d="M${r0(p[0] + 0.12 * k)},${r0(p[1] - 0.15 * k)}h${r0(0.04 * k)}v${r0(0.08 * k)}h${r0(-0.04 * k)}" fill="none" stroke="#c8a060" stroke-width="2"/>`);
  }
  // hanging iron lantern rings
  for (const [x, z] of [[-1, 4], [1.5, 8]]) { const a = pr(x, CEIL - 0.3, z), b = pr(x, 2.9, z), k = 760 / z; S.add(`<path d="M${r0(a[0])},${r0(a[1])}V${r0(b[1])}" stroke="#1a120c" stroke-width="2"/><ellipse cx="${r0(b[0])}" cy="${r0(b[1])}" rx="${r0(0.5 * k)}" ry="${r0(0.1 * k)}" fill="none" stroke="#1a120c" stroke-width="4"/><circle cx="${r0(b[0])}" cy="${r0(b[1])}" r="${r0(0.6 * k)}" fill="${S.rad([[0, '#ffd890', 0.45], [1, '#ffd890', 0]])}"/>`); for (const dx of [-0.4, 0, 0.4]) { const c = pr(x + dx, 2.95, z); S.add(`<path d="M${r0(c[0])},${r0(c[1])}q-3,-8 0,-14q3,6 0,14z" fill="#ffe2a0"/>`); } }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.4, '#140c08', 0], [1, '#140c08', 0.65]], 'cx="0.5" cy="0.42" r="0.75"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#140c08', 0], [1, '#140c08', 0.65]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 治安所前·公会广场 — the guild's big doors with its notice board and commission bell, the guard post
// opposite, a fountain, the bell tower over the roofs; bright late morning
// ---------------------------------------------------------------------------------------------
function guardSquare() {
  const S = new Scene('sbSquare', '治安所前·公会广场：公会大门、委托钟与治安所', 4606);
  const R = S.R;
  sky(S, '#8ab0d6', '#d4dce0', '#f2e6c8');
  S.add(`<circle cx="260" cy="120" r="520" fill="${S.rad([[0, '#fff8e4', 0.8], [0.2, '#fff0c8', 0.3], [1, '#fff0c8', 0]])}"/>`);
  const cc = { lit: '#fffaf2', shade: '#d8d2d8', rim: '#ffffff' };
  S.add(cloud(R, 560, 120, 260, 50, cc, { bumps: 5 }) + cloud(R, 1180, 90, 300, 56, cc, { bumps: 6 }));
  // background townhouses + the bell tower
  S.add(bellTower(980, 430, 70, 280, TOWER_PAL, { side: 'r' }).svg);
  for (const [x, w, h, fl, roof] of [[560, 120, 220, 3, 'gable'], [690, 110, 200, 3, 'eave'], [810, 120, 230, 3, 'gable'], [1080, 110, 210, 3, 'eave']]) S.add(townhouse(R, x, 470, w, h, { floors: fl, roof, k: 0.7, tone: 0.18 }));
  // the guild hall (left): broad timber front, double doors with three patches, notice board, the commission bell
  const gx = -40, gw = 560, gy = 640, gh = 380;
  S.add(`<path d="${pz([[gx - 20, gy - gh + 4], [gx + gw * 0.55, gy - gh - 200], [gx + gw + 30, gy - gh + 4]])}" fill="#b85a3e"/><path d="${pz([[gx + gw * 0.55, gy - gh - 200], [gx + gw + 30, gy - gh + 4], [gx + gw * 0.85, gy - gh + 4]])}" fill="#8a3e2e"/><path d="M${gx - 20},${gy - gh + 4}L${gx + gw * 0.55},${gy - gh - 200}" stroke="#fff4dc" stroke-width="3" opacity=".8"/>`);
  S.add(`<rect x="${gx}" y="${gy - gh}" width="${gw}" height="${gh}" fill="#efe0c4"/><rect x="${gx}" y="${gy - gh * 0.38}" width="${gw}" height="${gh * 0.38}" fill="#b8ab96"/>`);
  let tb = '';
  for (const yy of [gy - gh, gy - gh * 0.38, gy - gh * 0.7]) tb += `M${gx},${yy}H${gx + gw}`;
  for (let i = 0; i <= 6; i++) tb += `M${gx + gw * i / 6},${gy - gh}V${gy - gh * 0.38}`;
  for (let i = 0; i < 6; i += 2) tb += `M${gx + gw * i / 6},${gy - gh * 0.38}L${gx + gw * (i + 1) / 6},${gy - gh * 0.7}M${gx + gw * (i + 1) / 6},${gy - gh * 0.7}L${gx + gw * (i + 2) / 6},${gy - gh}`;
  S.add(`<path d="${tb}" stroke="#5a3a2a" stroke-width="7" fill="none"/>`);
  let gwin = '';
  for (let i = 0; i < 6; i++) gwin += `M${gx + gw * (i + 0.3) / 6},${gy - gh * 0.93}h${gw * 0.4 / 6}v${gh * 0.17}h${-gw * 0.4 / 6}z`;
  S.add(`<path d="${gwin}" fill="#3a4256"/>`);
  const dx = gx + gw * 0.42, dw = 130, dh = 190;
  S.add(`<path d="M${dx - 14},${gy}V${gy - dh}A${dw / 2 + 14},${dw / 2 + 14} 0 0 1 ${dx + dw + 14},${gy - dh}V${gy}Z" fill="#8a7a66"/><path d="M${dx},${gy}V${gy - dh}A${dw / 2},${dw / 2} 0 0 1 ${dx + dw},${gy - dh}V${gy}Z" fill="#6a4228"/><path d="M${dx + dw / 2},${gy}V${gy - dh - dw / 2}" stroke="#3a2414" stroke-width="5"/>`);
  S.add(`<path d="M${dx + 14},${gy - 150}l34,6l-2,22l-34,-6zM${dx + 80},${gy - 110}l30,-4l2,24l-30,4zM${dx + 20},${gy - 70}l40,0l0,20l-40,0z" fill="#9a7048" stroke="#3a2414" stroke-width="2"/>`);
  // sign bracket with a sword-and-shield emblem
  S.add(`<path d="M${dx + dw + 30},${gy - 260}h90" stroke="#2a2220" stroke-width="6"/><path d="M${dx + dw + 60},${gy - 256}v12M${dx + dw + 110},${gy - 256}v12" stroke="#2a2220" stroke-width="3"/><path d="M${dx + dw + 52},${gy - 244}h66v40q-33,28 -66,0z" fill="#3a5a8a" stroke="#e8d0a0" stroke-width="3"/>${swordBell(dx + dw + 85, gy - 216, 0.75)}`);
  // notice board + commission bell on its post by the door
  S.add(`<path d="M${dx - 180},${gy - 60}v-140h130v140" fill="none" stroke="#4a3020" stroke-width="8"/><rect x="${dx - 174}" y="${gy - 196}" width="118" height="100" fill="#9a7048"/>`);
  let np = '';
  for (let i = 0; i < 7; i++) np += `<rect x="${dx - 168 + (i % 3) * 38}" y="${gy - 188 + Math.floor(i / 3) * 30}" width="30" height="24" fill="#f2e6cc" transform="rotate(${R.range(-6, 6).toFixed(0)} ${dx - 150 + (i % 3) * 38} ${gy - 176 + Math.floor(i / 3) * 30})"/>`;
  S.add(np);
  S.add(`<path d="M${dx + dw + 60},${gy}V${gy - 150}h50" stroke="#4a3020" stroke-width="8" fill="none"/><path d="M${dx + dw + 96},${gy - 150}v8" stroke="#2a2220" stroke-width="3"/><path d="M${dx + dw + 82},${gy - 112}q0,-30 14,-30q14,0 14,30z" fill="#d0a050"/><path d="M${dx + dw + 86},${gy - 132}q4,-6 8,-6" fill="none" stroke="#fff0c0" stroke-width="2"/><circle cx="${dx + dw + 96}" cy="${gy - 108}" r="4" fill="#8a6a30"/>`);
  // the guard post (right): stone, barred window, a banner and a lantern
  const px = 1180, pw = 460, ph = 300;
  S.add(`<path d="M${px - 20},${gy - ph}H${px + pw}V${gy - ph - 30}H${px - 20}Z" fill="#7a6a5a"/>`);
  let cren = '';
  for (let x = px - 20; x < px + pw; x += 50) cren += `M${x},${gy - ph - 30}v-24h30v24z`;
  S.add(`<path d="${cren}" fill="#a8988a"/><rect x="${px}" y="${gy - ph}" width="${pw}" height="${ph}" fill="#c8baa6"/><rect x="${px + pw * 0.7}" y="${gy - ph}" width="${pw * 0.3}" height="${ph}" fill="#000" opacity=".12"/>`);
  let sc = '';
  for (let y = gy - ph + 40; y < gy; y += 40) sc += `M${px},${y}H${px + pw}`;
  S.add(`<path d="${sc}" stroke="#8a7a68" stroke-width="2" opacity=".4"/>`);
  S.add(`<rect x="${px + 60}" y="${gy - 210}" width="90" height="80" fill="#2a2a34"/><path d="M${px + 78},${gy - 210}v80M${px + 96},${gy - 210}v80M${px + 114},${gy - 210}v80M${px + 132},${gy - 210}v80" stroke="#6a6a72" stroke-width="5"/>`);
  S.add(`<path d="M${px + 240},${gy}V${gy - 170}h110v170z" fill="#4a3a2e"/><path d="M${px + 230},${gy - 180}h130" stroke="#5a4a3e" stroke-width="10"/>`);
  S.add(`<path d="M${px + 380},${gy - 290}h60v130l-30,-20l-30,20z" fill="#3a5a8a"/><path d="M${px + 394},${gy - 206}v-44h8v8h8v-8h8v8h8v-8h8v44z" fill="#e8d0a0"/><path d="M${px + 406},${gy - 206}v-14a4,4 0 0 1 8,0v14z" fill="#3a5a8a"/>`);
  // the square: cobbles + a fountain in the middle
  S.add(`<path d="M-20,${gy}H1620V900H-20Z" fill="${S.lin([[0, '#d0bea0'], [0.4, '#b09a78'], [1, '#5a4a38']])}"/>`);
  S.add(cobbles(R, gy + 6, 900, '#a08a6a', 240));
  S.add(`<ellipse cx="900" cy="${gy + 20}" rx="150" ry="30" fill="#8a7a66"/><ellipse cx="900" cy="${gy + 12}" rx="134" ry="22" fill="#7aa8c8"/><ellipse cx="880" cy="${gy + 8}" rx="60" ry="6" fill="#e8f4ff" opacity=".6"/><path d="M886,${gy + 10}v-70h28v70z" fill="#b8a890"/><path d="M900,${gy - 60}q-30,10 -40,50M900,${gy - 60}q30,10 40,50" fill="none" stroke="#bfe0f4" stroke-width="4" opacity=".8"/><circle cx="900" cy="${gy - 66}" r="12" fill="#c8b8a0"/>`);
  let ppl = '';
  for (const [x, y, s] of [[640, 652, 1.1], [700, 660, 1.2], [1060, 650, 1.1], [1120, 664, 1.25], [560, 670, 1.3]]) ppl += person(x, y, s, '#3e322c', R);
  S.add(`<path d="${ppl}" fill="#4a3e36"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#fff0c8', 0.12], [0.5, '#fff0c8', 0], [1, '#3a3040', 0.18]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.55, '#2a1e14', 0], [1, '#2a1e14', 0.4]], 'cx="0.5" cy="0.42" r="0.78"')}"/>`);
  S.add(`<rect y="640" width="${W}" height="260" fill="${S.lin([[0, '#2a1e14', 0], [1, '#2a1e14', 0.55]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 晨钟镇训练场·日出 (chapter 04) — the guild's sand yard before sunrise: dew on the wooden pells and the
// bench at the field's back edge; the sun is just behind the bell tower, so the yard is still in cool shade,
// the belfry blazes through, and a single line of gold runs along the tower's upper edges.
// ---------------------------------------------------------------------------------------------
function trainingGround() {
  const S = new Scene('sbTraining', '晨钟镇训练场·日出：结露的木桩与场边长凳，太阳正要跳出钟塔，塔顶边缘一线金光', 4707);
  const R = S.R;
  const HZ = 500, FL = 900, EYE = 1.6;
  const pr = persp({ vp: [800, HZ], F: FL, eye: EYE });
  const kAt = (Z) => FL / Z;
  const GOLD = '#ffd88a', GOLD_HI = '#fff4cc';
  // --- dawn sky; the sun hidden behind the tower roof -------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#5a6088'], [0.2, '#9a8ea4'], [0.36, '#dcae8e'], [0.48, '#f4c88e'], [0.56, '#ffe2ac'], [0.64, '#d8b498'], [1, '#6a6a7a']])}"/>`);
  const SUN = [842, 150];
  S.add(`<circle cx="${SUN[0]}" cy="${SUN[1]}" r="980" fill="${S.rad([[0, '#fff8de', 1], [0.05, '#ffeab4', 0.85], [0.16, '#ffd08a', 0.45], [0.42, '#f0a87a', 0.14], [1, '#f0a87a', 0]])}"/>`);
  S.add(stars(R, 14, [0, 0, 520, 140], { maxR: 1.1, fill: '#fff4ff', op: [0.15, 0.5] }) + stars(R, 10, [1180, 0, W, 130], { maxR: 1.1, fill: '#fff4ff', op: [0.15, 0.5] }));
  S.add(`<g filter="${S.blur(3)}">${rays(SUN[0], SUN[1], [[-158, 4, 1200], [-140, 3, 1100], [-118, 5, 900], [-62, 5, 900], [-40, 3, 1100], [-22, 4, 1200], [-4, 3, 1100], [182, 3, 1000]], '#fff0c0', 0.22)}</g>`);
  const cc = { lit: '#ffd6a4', shade: '#a88a9c', rim: '#fff6dc' }, cfar = { lit: '#f4c8a0', shade: '#b8a0aa', rim: null };
  S.add(`<g opacity=".8">${cloud(R, 180, 330, 240, 30, cfar, { bumps: 5 })}${cloud(R, 1240, 300, 260, 32, cfar, { bumps: 5 })}</g>`);
  S.add(`<path d="${band(-40, 700, 372, 9, R)}" fill="#ffe0b0" opacity=".55"/><path d="${band(980, 1640, 356, 8, R)}" fill="#ffe0b0" opacity=".5"/><path d="${band(420, 1300, 420, 6, R)}" fill="#fff0c8" opacity=".45"/>`);
  S.add(cloud(R, 230, 150, 250, 46, cc, { bumps: 5 }) + cloudCluster(R, 1290, 170, 280, 64, cc, { bumps: 6 }));
  // --- the town beyond the yard: a hazy far row of roofs, the bell tower, a nearer row hiding its foot --------
  const skyline = (y, o) => {
    let x = -60, out = '', win = '', rims = '', sm = '';
    while (x < 1660) {
      const w = R.range(o.w[0], o.w[1]), h = R.range(o.h[0], o.h[1]), kind = R.pick(['gable', 'side', 'gable', 'hip', 'side']);
      const top = y - h;
      let roof;
      if (kind === 'gable') roof = [[x - 3, top], [x + w / 2, top - w * 0.58], [x + w + 3, top]];
      else if (kind === 'side') roof = [[x - 5, top], [x + w * 0.16, top - w * 0.36], [x + w * 0.84, top - w * 0.36], [x + w + 5, top]];
      else roof = [[x - 4, top], [x + w * 0.3, top - w * 0.3], [x + w * 0.7, top - w * 0.3], [x + w + 4, top]];
      out += `<path d="${pz([[x, y + 60], [x, top], ...roof, [x + w, top], [x + w, y + 60]])}" fill="${o.col}"/>`;
      out += `<path d="${pz([[x + w * 0.64, y + 60], [x + w * 0.64, top], ...roof.filter((p) => p[0] >= x + w * 0.64), [x + w, top], [x + w, y + 60]])}" fill="${o.side}"/>`;
      rims += pl(roof.slice(0, 2));
      if (R() < 0.5) { const cx = x + w * R.range(0.2, 0.75), cy = top - w * 0.22; out += `<path d="M${r0(cx)},${r0(cy + 10)}v${r0(-w * 0.2 - 10)}h${r0(w * 0.08 + 4)}v${r0(w * 0.2 + 10)}z" fill="${o.side}"/>`; if (o.smoke && R() < 0.6) sm += smoke(R, cx + w * 0.04 + 2, cy - w * 0.2, R.range(60, 120), 8, R.range(20, 50), 4700 + Math.round(x)); }
      const nw = Math.max(1, Math.round(w / 46));
      for (let i = 0; i < nw; i++) for (const fy of [0.3, 0.62]) if (h * fy > 22 && R() < 0.8) win += `<path d="M${r0(x + w * (i + 0.5) / nw - 5)},${r0(top + h * fy)}h10v${r0(Math.min(14, h * 0.18))}h-10z" fill="${R() < o.lit ? '#ffc874' : o.win}"/>`;
      x += w + R.range(-6, 4);
    }
    return { svg: out + win, rims, sm };
  };
  const far = skyline(486, { w: [70, 150], h: [40, 90], col: '#8a7a92', side: '#7a6c88', win: '#6e6282', lit: 0.15 });
  S.add(far.svg + `<path d="${far.rims}" stroke="#ffd8a8" stroke-width="2" opacity=".45"/>`);
  S.add(`<rect y="400" width="${W}" height="120" fill="${S.lin([[0, '#ffd8b0', 0], [0.7, '#ffd8b0', 0.4], [1, '#ffd8b0', 0.1]])}"/>`);
  // the bell tower, backlit: the belfry burns through, one line of gold along its upper edges
  const TW = { lit: '#4a5070', shade: '#343a54', hole: '#fff0c4', bell: '#23263c', trim: '#383c58', roof: '#383d5c', roofShade: '#282c46', win: '#22243a', star: '#ffe08a' };
  const tx = 780, tw = 92, th = 330, tb = 520;
  const T = bellTower(tx, tb, tw, th, TW, { side: 'r' });
  S.add(`<circle cx="${r0(tx + tw / 2)}" cy="${r0(tb - th * 0.78)}" r="120" fill="${S.rad([[0, '#fff2c8', 0.6], [1, '#fff2c8', 0]])}"/>`);
  S.add(T.svg);
  {
    const top = tb - th, d = tw * 0.45, dy = -d * 0.3;
    const L = [tx - tw * 0.08, top], B = [tx + tw + d + tw * 0.08, top + dy], ap = T.apex;
    S.add(`<path d="${pl([L, ap, B])}" fill="none" stroke="${GOLD}" stroke-width="3.2" stroke-linejoin="round" opacity=".95"/><path d="${pl([L, ap, B])}" fill="none" stroke="${GOLD}" stroke-width="10" opacity=".35" filter="${S.blur(1)}"/>`);
    S.add(`<path d="M${r0(tx - tw * 0.08)},${r0(top - tw * 0.02)}h${r0(tw * 1.16)}l${r0(d)},${r0(dy)}" fill="none" stroke="${GOLD}" stroke-width="2.2" opacity=".85"/><path d="M${r0(tx + tw + d)},${r0(top + dy)}V${r0(tb - th * 0.4)}" stroke="${GOLD}" stroke-width="2" opacity=".55"/>`);
    S.add(`<path d="M${r0(ap[0])},${r0(ap[1])}v${r0(-tw * 0.35)}" stroke="${GOLD}" stroke-width="2" opacity=".8"/>`);
    const g = [ap[0] + 24, ap[1] + 52];
    S.add(`<circle cx="${r0(g[0])}" cy="${r0(g[1])}" r="26" fill="${S.rad([[0, GOLD_HI, 0.95], [0.4, GOLD, 0.45], [1, GOLD, 0]])}"/><path d="M${r0(g[0] - 40)},${r0(g[1])}h80M${r0(g[0])},${r0(g[1] - 30)}v60" stroke="${GOLD_HI}" stroke-width="1.6" opacity=".7"/>`);
  }
  const near = skyline(552, { w: [90, 170], h: [60, 110], col: '#4e506a', side: '#3e405a', win: '#34364c', lit: 0.3, smoke: true });
  S.add(`<path d="${near.sm}" fill="#d8c4c4" opacity=".35"/>` + near.svg + `<path d="${near.rims}" stroke="#ffc890" stroke-width="2.2" opacity=".6"/>`);
  // --- the yard: the back fence, morning mist, cool sand still in shade --------------------------------------
  const ZB = 15, yB = pr(0, 0, ZB)[1];
  S.add(`<path d="M-20,${r0(yB - 36)}H1620V${H}H-20Z" fill="${S.lin([[0, '#8a8494'], [0.12, '#767888'], [0.5, '#56606e'], [1, '#2e3644']], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(yB - 30)}" x2="0" y2="${H}"`)}"/>`);
  // a warm sheen on the dew-wet sand toward the light
  S.add(`<ellipse cx="830" cy="${r0(yB + 18)}" rx="620" ry="56" fill="${S.rad([[0, '#ffdcaa', 0.5], [1, '#ffdcaa', 0]])}"/>`);
  // grass verges along the sides with dew on them
  S.add(`<path d="${pz([pr(-6, 0, 3), pr(-6, 0, ZB), pr(-4.6, 0, ZB), pr(-4.2, 0, 3)])}${pz([pr(6, 0, 3), pr(6, 0, ZB), pr(4.8, 0, ZB), pr(4.4, 0, 3)])}" fill="#4e5e5a"/>`);
  let blades = '', dew = '';
  for (let i = 0; i < 150; i++) {
    const side = i % 2 ? 1 : -1, Z = 3.2 + R() ** 1.5 * 11.5, X = side * R.range(4.35, 6.2), p = pr(X, 0, Z), k = kAt(Z), h = R.range(0.08, 0.18) * k;
    blades += `M${r0(p[0])},${r0(p[1])}q${f(0.01 * k, 0)},${r0(-h * 0.6)} ${f(R.range(-0.05, 0.05) * k, 0)},${r0(-h)}`;
    if (R() < 0.35) dew += `<circle cx="${r0(p[0] + R.range(-0.04, 0.04) * k)}" cy="${r0(p[1] - h * R.range(0.5, 1))}" r="${f(Math.max(0.8, 0.008 * k), 1)}"/>`;
  }
  S.add(`<path d="${blades}" fill="none" stroke="#3a4a46" stroke-width="1.6" stroke-linecap="round" opacity=".8"/><g fill="#fff8e8" opacity=".85">${dew}</g>`);
  // the back fence (rails + posts), townhouse backs already behind it
  {
    const pts = [];
    for (let X = -8; X <= 8.01; X += 1.6) pts.push(pr(X, 0, ZB));
    const k = kAt(ZB);
    S.add(fence(pts, k / 22 * 1.15, '#46465a'));
    S.add(`<path d="${pl(pr.poly([[-8, 1.05, ZB], [8, 1.05, ZB]]))}" stroke="${GOLD}" stroke-width="1.4" opacity=".55"/>`);
    // side fences running toward us
    const sideL = [], sideR = [];
    for (let Z = ZB; Z >= 4; Z -= 1.6) { sideL.push(pr(-6, 0, Z)); sideR.push(pr(6, 0, Z)); }
    S.add(`<g opacity=".9">${fence(sideL, 1.3, '#3a3c4c')}${fence(sideR, 1.3, '#3a3c4c')}</g>`);
  }
  S.add(`<rect x="-20" y="${r0(yB - 44)}" width="1640" height="90" fill="${S.lin([[0, '#f6dcc4', 0], [0.55, '#f6dcc4', 0.42], [1, '#f6dcc4', 0]])}" filter="${S.blur(2)}"/>`);
  // scuffed sand: arcs of footwork, a raked patch, pebbles
  let scuff = '';
  for (let i = 0; i < 40; i++) { const Z = R.range(4, 14), X = R.range(-4, 4), p = pr(X, 0, Z), k = kAt(Z), w = R.range(0.3, 0.9) * k; scuff += `M${r0(p[0] - w / 2)},${r0(p[1])}q${r0(w / 2)},${f(R.range(-0.04, 0.04) * k, 0)} ${r0(w)},0`; }
  S.add(`<path d="${scuff}" fill="none" stroke="#2e3644" stroke-width="2" opacity=".35"/>`);
  let peb = '';
  for (let i = 0; i < 120; i++) { const Z = 3.5 + R() ** 1.8 * 11, p = pr(R.range(-4.4, 4.4), 0, Z), k = kAt(Z), rr = R.range(0.012, 0.03) * k; peb += `<ellipse cx="${r0(p[0])}" cy="${r0(p[1])}" rx="${f(rr, 1)}" ry="${f(rr * 0.5, 1)}"/>`; }
  S.add(`<g fill="#3a4250" opacity=".55">${peb}</g>`);

  // --- the bench at the back edge of the yard (Leah's seat), dew beaded on the plank ----------------------
  {
    const x0 = -2.4, x1 = 0.4, z = 13.6, hS = 0.46;
    S.add(`<path d="${pz(pr.poly([[x0, hS, z], [x1, hS, z], [x1, hS, z + 0.4], [x0, hS, z + 0.4]]))}" fill="#7a6a62"/><path d="${pz(pr.poly([[x0, hS, z], [x1, hS, z], [x1, hS - 0.07, z], [x0, hS - 0.07, z]]))}" fill="#3e3438"/>`);
    let legs = '';
    for (const x of [x0 + 0.15, x1 - 0.15]) legs += pz(pr.poly([[x - 0.05, 0, z + 0.05], [x + 0.05, 0, z + 0.05], [x + 0.05, hS - 0.07, z + 0.05], [x - 0.05, hS - 0.07, z + 0.05]]));
    S.add(`<path d="${legs}" fill="#2e2830"/><path d="${pl(pr.poly([[x0, hS, z + 0.4], [x1, hS, z + 0.4]]))}" stroke="${GOLD}" stroke-width="1.6" opacity=".7"/>`);
    let dw = '';
    for (let i = 0; i < 9; i++) { const p = pr(R.range(x0 + 0.1, x1 - 0.1), hS, z + R.range(0.05, 0.35)); dw += `<circle cx="${r0(p[0])}" cy="${r0(p[1])}" r="${f(R.range(0.8, 1.5), 1)}"/>`; }
    S.add(`<g fill="${GOLD_HI}">${dw}</g>`);
    // a whetstone and a water bucket left by the bench
    const b = pr(x1 + 0.45, 0, z), kb = kAt(z);
    S.add(`<path d="M${r0(b[0] - 0.16 * kb)},${r0(b[1])}l${r0(-0.03 * kb)},${r0(-0.34 * kb)}h${r0(0.38 * kb)}l${r0(-0.03 * kb)},${r0(0.34 * kb)}z" fill="#4a4250"/><ellipse cx="${r0(b[0])}" cy="${r0(b[1] - 0.34 * kb)}" rx="${r0(0.19 * kb)}" ry="${f(0.04 * kb, 1)}" fill="#c8b8a8"/><path d="M${r0(b[0] - 0.16 * kb)},${r0(b[1] - 0.24 * kb)}h${r0(0.32 * kb)}" stroke="#2a2430" stroke-width="2"/>`);
  }

  // --- the wooden pells, a straw dummy, the weapon rack: all backlit, wet with dew -------------------------
  const pell = (X, Z, h = 1.9, wd = 0.24, seed = 1) => {
    const k = kAt(Z), b = pr(X, 0, Z), t = pr(X, h, Z), w = wd * k;
    const Rp = rng(seed);
    let s = `<ellipse cx="${r0(b[0] + 0.1 * k)}" cy="${r0(b[1] + 0.03 * k)}" rx="${r0(0.55 * k)}" ry="${r0(0.07 * k)}" fill="#1e2430" opacity=".45"/>`;
    s += `<path d="M${r0(b[0] - w / 2)},${r0(b[1])}V${r0(t[1] + w * 0.15)}q${r0(w / 2)},${r0(-w * 0.3)} ${r0(w)},0V${r0(b[1])}z" fill="#3e3640"/>`;
    s += `<path d="M${r0(b[0] + w * 0.12)},${r0(b[1])}V${r0(t[1] + w * 0.1)}q${r0(w * 0.2)},${r0(-w * 0.05)} ${r0(w * 0.38)},${r0(w * 0.05)}V${r0(b[1])}z" fill="#2a242e"/>`;
    // rope bindings and sword nicks
    let rope = '', nicks = '';
    for (const v of [0.42, 0.74]) { const y = b[1] + (t[1] - b[1]) * v; for (let j = 0; j < 3; j++) rope += `M${r0(b[0] - w / 2 - 1)},${r0(y + j * 0.035 * k)}l${r0(w + 2)},${r0(0.015 * k)}`; }
    for (let j = 0; j < 5; j++) { const y = b[1] + (t[1] - b[1]) * Rp.range(0.25, 0.9), x = b[0] - w / 2 + w * Rp.range(0.1, 0.5); nicks += `M${r0(x)},${r0(y)}l${r0(w * 0.35)},${f(Rp.range(-0.03, 0.03) * k, 0)}`; }
    s += `<path d="${rope}" stroke="#b09878" stroke-width="${f(Math.max(1.4, 0.02 * k), 1)}"/><path d="${nicks}" stroke="#14101a" stroke-width="${f(Math.max(1, 0.012 * k), 1)}" opacity=".8"/>`;
    // gold rim along the top and the side toward the light; dew beads
    s += `<path d="M${r0(b[0] - w / 2)},${r0(b[1] - (b[1] - t[1]) * 0.35)}V${r0(t[1] + w * 0.15)}q${r0(w / 2)},${r0(-w * 0.3)} ${r0(w)},0" fill="none" stroke="${GOLD}" stroke-width="${f(Math.max(1.2, 0.016 * k), 1)}" opacity=".8"/>`;
    let d = '';
    for (let j = 0; j < 7; j++) d += `<circle cx="${r0(b[0] - w / 2 + w * Rp.range(0.1, 0.9))}" cy="${r0(t[1] + (b[1] - t[1]) * Rp.range(0.02, 0.7))}" r="${f(Math.max(0.8, 0.007 * k), 1)}"/>`;
    s += `<g fill="${GOLD_HI}" opacity=".9">${d}</g>`;
    return s;
  };
  // straw dummy on a post with a crossbar, a sack head
  {
    const X = 1.55, Z = 10.5, k = kAt(Z), b = pr(X, 0, Z), y = (hh) => pr(X, hh, Z)[1];
    S.add(`<ellipse cx="${r0(b[0] + 0.1 * k)}" cy="${r0(b[1] + 0.03 * k)}" rx="${r0(0.6 * k)}" ry="${r0(0.07 * k)}" fill="#1e2430" opacity=".45"/>`);
    S.add(`<path d="M${r0(b[0] - 0.05 * k)},${r0(b[1])}V${r0(y(1.4))}h${r0(0.1 * k)}V${r0(b[1])}z" fill="#2e2830"/>`);
    S.add(`<path d="M${r0(b[0] - 0.62 * k)},${r0(y(1.42))}h${r0(1.24 * k)}v${r0(0.08 * k)}h${r0(-1.24 * k)}z" fill="#3a3238"/>`);
    S.add(`<path d="M${r0(b[0] - 0.24 * k)},${r0(y(0.7))}q${r0(-0.04 * k)},${r0(-0.4 * k)} ${r0(0.02 * k)},${r0(-0.72 * k)}h${r0(0.44 * k)}q${r0(0.06 * k)},${r0(0.32 * k)} ${r0(0.02 * k)},${r0(0.72 * k)}z" fill="#8a7458"/>`);
    let straw = '';
    for (let i = 0; i < 14; i++) { const x0 = b[0] - 0.22 * k + i * 0.032 * k; straw += `M${r0(x0)},${r0(y(0.72))}l${f(R.range(-0.04, 0.04) * k, 0)},${r0(0.12 * k)}`; }
    S.add(`<path d="${straw}" stroke="#a88a5e" stroke-width="2" stroke-linecap="round"/><path d="M${r0(b[0] - 0.24 * k)},${r0(y(1.05))}h${r0(0.48 * k)}M${r0(b[0] - 0.25 * k)},${r0(y(0.85))}h${r0(0.5 * k)}" stroke="#4a3a2a" stroke-width="3"/>`);
    S.add(`<ellipse cx="${r0(b[0])}" cy="${r0(y(1.62))}" rx="${r0(0.17 * k)}" ry="${r0(0.2 * k)}" fill="#7a6a56"/><path d="M${r0(b[0] - 0.08 * k)},${r0(y(1.76))}l${r0(-0.06 * k)},${r0(-0.06 * k)}M${r0(b[0] + 0.08 * k)},${r0(y(1.77))}l${r0(0.07 * k)},${r0(-0.05 * k)}" stroke="#5a4a3a" stroke-width="3"/>`);
    S.add(`<path d="M${r0(b[0] - 0.62 * k)},${r0(y(1.42))}h${r0(1.24 * k)}M${r0(b[0] - 0.17 * k)},${r0(y(1.62))}a${r0(0.17 * k)},${r0(0.2 * k)} 0 0 1 ${r0(0.3 * k)},${r0(-0.12 * k)}M${r0(b[0] - 0.24 * k)},${r0(y(0.7))}q${r0(-0.04 * k)},${r0(-0.4 * k)} ${r0(0.02 * k)},${r0(-0.72 * k)}" fill="none" stroke="${GOLD}" stroke-width="1.6" opacity=".75"/>`);
  }
  // weapon rack against the right fence: wooden practice swords and staves
  {
    const Z0 = 9.5, Z1 = 13, X = 5.2;
    const a = pr(X, 0, Z0), b = pr(X, 0, Z1), at = pr(X, 1.1, Z0), bt = pr(X, 1.1, Z1);
    S.add(`<path d="M${r0(a[0])},${r0(a[1])}L${r0(at[0])},${r0(at[1])}L${r0(bt[0])},${r0(bt[1])}L${r0(b[0])},${r0(b[1])}M${r0(pr(X, 0.5, Z0)[0])},${r0(pr(X, 0.5, Z0)[1])}L${r0(pr(X, 0.5, Z1)[0])},${r0(pr(X, 0.5, Z1)[1])}" fill="none" stroke="#2e2830" stroke-width="4"/>`);
    let w = '';
    for (let i = 0; i < 9; i++) { const Z = Z0 + 0.2 + i * 0.36, p0 = pr(X - 0.25, 0, Z), p1 = pr(X + 0.05, i % 3 === 0 ? 1.7 : 1.3, Z + 0.05); w += `M${r0(p0[0])},${r0(p0[1])}L${r0(p1[0])},${r0(p1[1])}`; }
    S.add(`<path d="${w}" stroke="#5a4a44" stroke-width="3.5" stroke-linecap="round"/><path d="${w}" stroke="${GOLD}" stroke-width="1" opacity=".5" transform="translate(-1 0)"/>`);
  }
  S.add(pell(-4.0, 12, 1.8, 0.24, 47071) + pell(3.5, 12.8, 1.8, 0.24, 47072));
  S.add(pell(-1.75, 8.8, 1.9, 0.25, 47075) + pell(2.9, 8, 1.9, 0.26, 47073) + pell(-3.0, 6.2, 1.95, 0.26, 47074));

  // --- grading: cool shade below, warm glow above; vignette; calm bottom ------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#ffe8c0', 0.12], [0.55, '#ffe8c0', 0], [1, '#26304a', 0.3]])}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.5, '#1a1e2c', 0], [1, '#1a1e2c', 0.5]], 'cx="0.53" cy="0.32" r="0.8"')}"/>`);
  S.add(`<rect y="620" width="${W}" height="280" fill="${S.lin([[0, '#1a1e2c', 0], [1, '#1a1e2c', 0.62]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 晨钟镇西门 — the back gate the old mill road leaves from, seen from INSIDE the town looking west
// (the east gate, chime-town-gate, is seen from outside with the town behind it). One broad gatehouse
// with a timber hoarding and a red hip roof over a single arch; the portcullis (闸门) in the passage;
// the postern (小门) with its lantern, the guards' notice board and register desk on the left; the
// spouted stone horse trough (城门水槽) on the right; the stair up to the wall-walk; through the arch
// the mill road runs out across the reed flats to the disused windmill (bg-mill `oldMill`, the 204° arm
// snapped). Three variants share one layout (same seed, same geometry); light, sky and gate state change:
//   day   — late morning (03-04/03-05, 04-04): the sun behind the viewer's left shoulder lights the inner
//           face; the gate open, the portcullis up, fresh wheel ruts on the mud outside.
//   dusk  — sunset before the gate closes (05-01): the sun sits on the reeds right under the raised
//           portcullis ("夕阳压在西门的闸门上"); the wall backlit, light pouring through the passage.
//   night — after the gate is shut (04-13, 05-11): the portcullis down, no moon (05: "门外没有月亮"),
//           only the postern lantern and the guardroom window lit.
// ---------------------------------------------------------------------------------------------
const WGP = {
  day: {
    id: 'sbWGateDay', label: '晨钟镇西门·上午：从镇内望向敞开的西门与升起的闸门，门外旧磨坊路穿过芦苇滩，远处是断了一臂的旧磨坊；左侧小门与提灯，右侧城门水槽',
    sky: [[0, '#7ea4cc'], [0.28, '#b4c8d6'], [0.5, '#e8dec2'], [0.56, '#f0e2c0'], [1, '#c8b08a']],
    cloud: { lit: '#fffaf0', shade: '#d8d0d4', rim: '#ffffff' },
    far: { ridge: '#b6b4c4', ridgeShade: '#9c9ab0', ridgeRim: '#fff4e0', haze: '#f2e4c2', hazeOp: 0.5, sea: '#d8c08c', flats: [[0, '#d2ba86'], [1, '#a88e5e']], reed: '#b8995e', plume: '#f2e4c4', road: [[0, '#d4bc94'], [1, '#b49a72']], rut: '#8a7254', knoll: '#b8ae86', tree: { lit: '#aaa878', shade: '#83866a', trunk: '#6a5a4c' } },
    mill: { lit: '#d4c6b0', shade: '#a0948c', roof: '#94695a', frame: '#605452', door: '#4e4240', house: '#c6b69e', houseShade: '#94887c', houseRoof: '#8a6454', chimney: '#a09080' },
    wall: [[0, '#d6c6a6'], [1, '#ab9b7e']], wallLine: '#7e6e58', lineOp: 0.35, parapet: '#c8b898', merlon: '#d2c2a2', ledge: '#8e7e66', moss: '#8a9a5a', ivy: ['#6e8a4a', '#4e6a3a'], rim: '#fff4dc', rimOp: 0.75,
    gh: [[0, '#dccaa8'], [1, '#b4a282']], ring: '#b8a688', ringLine: '#857560', roof: ['#b85c3e', '#80402e'], hoard: ['#7a5638', '#4e3424'], slot: '#2e2420', win: '#3a3040', winLit: false,
    pass: [[0, '#5e5246'], [1, '#8e7e68']], passFloor: '#b49e7c', port: '#3a3236', portHi: '#8a7e78',
    door: ['#76523a', '#54382a'], iron: '#2c2a2e', stair: [[0, '#cdbd9e'], [1, '#a49478']], stairEdge: '#fff0d4', niche: '#3a3036',
    ground: [[0, '#cfb994'], [0.4, '#a88e6a'], [1, '#4a3a2a']], street: '#c8b088', cobble: '#9a8262',
    trough: { top: '#d0c4ac', front: '#a89a82', side: '#8a7e6a', water: [[0, '#b8ccd2'], [1, '#7e98a4']], hi: '#ffffff' },
    house: { plaster: '#ecdcc0', shade: '#bca88a', timber: '#5a3a2a', stone: '#bcae98', roof: '#a8543a', glass: '#3a4256', lit: false },
    wood: '#7a5a3c', paper: '#f0e4c8', lampGlass: '#5a5048', shadow: '#3a2c22', shadowOp: 0.22,
    grade: { warm: '#fff0c8', warmOp: 0.14, cool: '#3a3040', coolOp: 0.18, vig: '#2a1e14', vigOp: 0.38, bottom: '#2a1e14', bottomOp: 0.55 },
  },
  dusk: {
    id: 'sbWGateDusk', label: '晨钟镇西门·黄昏：夕阳正压在升起的闸门下，逆光的城墙与门楼，光从门洞里倒进来；门外芦苇滩与旧磨坊的剪影',
    sky: [[0, '#2e2850'], [0.2, '#5e3e6c'], [0.36, '#b4607a'], [0.47, '#ec9a66'], [0.54, '#f8c07a'], [1, '#6a4a4a']],
    cloud: { lit: '#e8907a', shade: '#5e3c5e', rim: '#ffcf9a' },
    far: { ridge: '#7a5070', ridgeShade: '#5a3a5a', ridgeRim: '#ffc090', haze: '#ffc488', hazeOp: 0.6, sea: '#a8645a', flats: [[0, '#b8704e'], [1, '#6a4038']], reed: '#5e3634', plume: '#f0a274', road: [[0, '#e0a078'], [1, '#9a6050']], rut: '#5e3e3e', knoll: '#6a4458', tree: { lit: '#6e4a5a', shade: '#4e3448', trunk: '#3a2838' } },
    mill: { lit: '#5a3c50', shade: '#3e2a3e', roof: '#4a2e3e', frame: '#2e2030', door: '#22182a', house: '#523848', houseShade: '#3a283a', houseRoof: '#3e283a', chimney: '#4a3446' },
    wall: [[0, '#6e5266'], [1, '#463444']], wallLine: '#2e2232', lineOp: 0.4, parapet: '#5e4458', merlon: '#664a5e', ledge: '#3a2a3a', moss: '#4a4a3a', ivy: ['#3e3a3a', '#2e2a30'], rim: '#ffb888', rimOp: 0.85,
    gh: [[0, '#6a4e62'], [1, '#4a3646']], ring: '#5a4254', ringLine: '#2e2232', roof: ['#5e3442', '#3e2232'], hoard: ['#4a2e36', '#2e1c24'], slot: '#1e141c', win: '#241a26', winLit: false,
    pass: [[0, '#2a1e2a'], [1, '#5a3a40']], passFloor: '#e8a478', port: '#2a1c26', portHi: '#ffb27a',
    door: ['#56363a', '#3a2428'], iron: '#1e1620', stair: [[0, '#6a5064'], [1, '#4a3646']], stairEdge: '#e89a78', niche: '#1e1620',
    ground: [[0, '#7a5458'], [0.4, '#4e3440'], [1, '#1a1018']], street: '#8a5e5a', cobble: '#4a3038',
    trough: { top: '#8a6a70', front: '#4e3846', side: '#3a2a36', water: [[0, '#ffc890'], [1, '#a86a6a']], hi: '#fff0c8' },
    house: { plaster: '#6a5260', shade: '#4e3a4a', timber: '#2e1e26', stone: '#5a4452', roof: '#4a2a34', glass: '#2a1e2a', lit: false },
    wood: '#4e3436', paper: '#b49088', lampGlass: '#3a2a30', shadow: '#1a0e18', shadowOp: 0.4,
    grade: { warm: '#ff9a60', warmOp: 0.1, cool: '#2a1a4a', coolOp: 0.3, vig: '#140c1c', vigOp: 0.55, bottom: '#140c1c', bottomOp: 0.66 },
  },
  night: {
    id: 'sbWGateNight', label: '晨钟镇西门·入夜：闸门已落，小门上的提灯还亮着，门楼一扇窗透出灯光；没有月亮的星空',
    sky: [[0, '#0b0c1e'], [0.3, '#161a32'], [0.52, '#262a46'], [0.56, '#2a2c48'], [1, '#121220']],
    cloud: { lit: '#2a2c46', shade: '#181a2c', rim: null },
    far: { ridge: '#22243a', ridgeShade: '#1a1c2e', ridgeRim: '#4a4c6a', haze: '#3a3e5a', hazeOp: 0.45, sea: '#1c1e2c', flats: [[0, '#1e2030'], [1, '#121420']], reed: '#0e0f18', plume: '#3a3c54', road: [[0, '#2e3044'], [1, '#1a1c2a']], rut: '#121420', knoll: '#1a1c2c', tree: { lit: '#1e2032', shade: '#14152a', trunk: '#101020' } },
    mill: { lit: '#1a1a2a', shade: '#141422', roof: '#161624', frame: '#10101c', door: '#0c0c16', house: '#181828', houseShade: '#121220', houseRoof: '#141422', chimney: '#161626' },
    wall: [[0, '#3a3c54'], [1, '#262838']], wallLine: '#14141e', lineOp: 0.4, parapet: '#34364c', merlon: '#3a3c54', ledge: '#1c1c28', moss: '#2a3030', ivy: ['#1e2626', '#161c1e'], rim: '#7a7ea0', rimOp: 0.5,
    gh: [[0, '#3c3e56'], [1, '#2a2c3e']], ring: '#33354a', ringLine: '#14141e', roof: ['#3e2a32', '#2a1c24'], hoard: ['#2e2228', '#1c1418'], slot: '#0e0c12', win: '#14121c', winLit: true,
    pass: [[0, '#101018'], [1, '#22222e']], passFloor: '#2a2a36', port: '#0c0c12', portHi: '#4a4a62',
    door: ['#2e2a30', '#201c22'], iron: '#0e0e14', stair: [[0, '#36384e'], [1, '#262838']], stairEdge: '#6a6e8e', niche: '#0e0e16',
    ground: [[0, '#2e2e3e'], [0.4, '#1e1e2a'], [1, '#08080e']], street: '#2c2c3a', cobble: '#16161e',
    trough: { top: '#3a3a4e', front: '#24243a', side: '#1a1a2a', water: [[0, '#2a3048'], [1, '#14182a']], hi: '#c8ccf0' },
    house: { plaster: '#363648', shade: '#28283a', timber: '#16141c', stone: '#2e2e40', roof: '#2a1e26', glass: '#141420', lit: true },
    wood: '#2e2628', paper: '#6a6470', lampGlass: '#ffd890', shadow: '#05050a', shadowOp: 0.35,
    grade: { warm: '#ffb870', warmOp: 0.06, cool: '#0a0c24', coolOp: 0.35, vig: '#05050c', vigOp: 0.62, bottom: '#05050c', bottomOp: 0.7 },
  },
};

function westGate(v) {
  const P = WGP[v], day = v === 'day', dusk = v === 'dusk', night = v === 'night';
  const S = new Scene(P.id, P.label, 4111);
  // S.R and RS (shared props) are identical in every variant; R2 drives the sky, which differs per variant
  const R = S.R, RS = rng(4117), R2 = rng(4118 + (day ? 0 : dusk ? 1 : 2));
  const VX = 860, HZ = 488, GYd = 600, WT = 330;
  // the passage in perspective: inner arch (k = 1), portcullis groove (k = .9), outer arch (k = .82)
  const sec = (k) => ({ x0: VX - 120 * k, x1: VX + 120 * k, sp: HZ - (HZ - 460) * k, r: 120 * k, gy: HZ + (GYd - HZ) * k });
  const IN = sec(1), PORT = sec(0.9), OUT = sec(0.82);
  const arch = (a) => `M${f(a.x0, 1)},${f(a.gy, 1)}V${f(a.sp, 1)}A${f(a.r, 1)},${f(a.r, 1)} 0 0 1 ${f(a.x1, 1)},${f(a.sp, 1)}V${f(a.gy, 1)}Z`;
  const SUN = [826, 472], MILL = [918, 487];

  // --- sky -------------------------------------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(P.sky)}"/>`);
  if (day) S.add(`<circle cx="-80" cy="-120" r="1150" fill="${S.rad([[0, '#fff6dc', 0.75], [0.25, '#ffe8b4', 0.35], [0.6, '#ffe0a0', 0.08], [1, '#ffe0a0', 0]])}"/>`);
  if (dusk) S.add(`<circle cx="${SUN[0]}" cy="${SUN[1]}" r="1000" fill="${S.rad([[0, '#fff0c0', 1], [0.06, '#ffd08a', 0.85], [0.22, '#ff9a64', 0.42], [0.55, '#d0607a', 0.12], [1, '#d0607a', 0]])}"/>`);
  if (night) {
    S.add(stars(R2, 190, [0, 0, W, 330], { maxR: 1.4, fill: '#e4e2ff', op: [0.2, 0.9] }));
    S.add(`<rect y="300" width="${W}" height="230" fill="${S.lin([[0, '#3a4064', 0], [0.75, '#3a4064', 0.35], [1, '#3a4064', 0]])}"/>`);
  }
  const cc = P.cloud;
  if (night) S.add(`<g opacity=".7"><path d="${band(-40, 700, 120, 14, R2, 14)}" fill="${cc.lit}"/><path d="${band(980, 1660, 72, 10, R2, 12)}" fill="${cc.lit}"/><path d="${band(300, 1200, 210, 8, R2, 10)}" fill="${cc.shade}"/></g>`);
  else {
    S.add(cloudCluster(R2, 1240, 120, 300, 70, cc, { bumps: 6 }) + cloud(R2, 380, 92, 230, 40, cc, { bumps: 5 }) + cloud(R2, 760, 60, 160, 28, cc, { bumps: 4 }));
    if (dusk) S.add(`<path d="${band(-40, 600, 236, 9, R2)}" fill="#ffc89a" opacity=".45"/><path d="${band(1100, 1660, 214, 7, R2)}" fill="#f0a07a" opacity=".45"/>`);
  }
  if (dusk) {
    let birds = '';
    for (const [x, y, s, fl] of [[420, 190, 0.7, 0.2], [452, 176, 0.6, 0.8], [486, 198, 0.55, 0.5], [1180, 230, 0.5, 0.9]]) birds += bird(x, y, s, fl);
    S.add(`<path d="${birds}" fill="#2a1a2e"/>`);
  }

  // --- the land beyond the gate (only seen through the arch) ---------------------------------------------
  const F = P.far, fx0 = 700, fx1 = 1020;
  S.add(`<path d="M${fx0},${HZ - 6}C780,${HZ - 14} 840,${HZ - 9} 900,${HZ - 12}C950,${HZ - 15} 990,${HZ - 8} ${fx1},${HZ - 10}V${HZ + 4}H${fx0}Z" fill="${F.ridge}"/><path d="M${fx0},${HZ - 6}C780,${HZ - 14} 840,${HZ - 9} 900,${HZ - 12}" fill="none" stroke="${F.ridgeRim}" stroke-width="1.5" opacity=".5"/>`);
  S.add(`<rect x="${fx0}" y="${HZ - 40}" width="${fx1 - fx0}" height="48" fill="${S.lin([[0, F.haze, 0], [0.7, F.haze, F.hazeOp], [1, F.haze, 0]])}"/>`);
  if (dusk) S.add(`<circle cx="${SUN[0]}" cy="${SUN[1]}" r="46" fill="#fff0c8" filter="${S.blur(2)}"/><circle cx="${SUN[0]}" cy="${SUN[1]}" r="27" fill="#fffaea"/>`);
  // the knoll with the disused windmill, a few trees
  S.add(`<path d="M872,${HZ + 1}C890,${HZ - 4} 905,${HZ - 9} 922,${HZ - 9}C942,${HZ - 9} 958,${HZ - 4} 980,${HZ + 1}Z" fill="${F.knoll}"/>`);
  S.add(tree(RS, 890, HZ - 3, 0.16, F.tree) + tree(RS, 952, HZ - 4, 0.15, F.tree));
  S.add(oldMill(MILL[0], MILL[1] - 7, 0.4, P.mill).svg);
  // reed flats, the mill road with fresh wheel ruts running out of the gate
  S.add(`<path d="M${fx0},${HZ - 1}H${fx1}V${HZ + 6}H${fx0}Z" fill="${F.sea}"/>`);
  S.add(`<path d="M${fx0},${HZ + 4}H${fx1}V${OUT.gy + 2}H${fx0}Z" fill="${S.lin(F.flats, `gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="${r0(OUT.gy)}"`)}"/>`);
  const RVX = 884;
  S.add(`<path d="M${RVX - 1},${HZ + 1}L${RVX + 1},${HZ + 1}L${f(OUT.x1 - 18, 0)},${f(OUT.gy + 2, 0)}L${f(OUT.x0 + 22, 0)},${f(OUT.gy + 2, 0)}Z" fill="${S.lin(F.road, `gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="${r0(OUT.gy)}"`)}"/>`);
  S.add(`<path d="M${RVX},${HZ + 2}L${f(OUT.x0 + 70, 0)},${f(OUT.gy + 2, 0)}M${RVX + 1},${HZ + 2}L${f(OUT.x1 - 62, 0)},${f(OUT.gy + 2, 0)}" stroke="${F.rut}" stroke-width="${day ? 2.4 : 1.8}" opacity="${day ? 0.8 : 0.55}"/>`);
  // reeds on both sides of the road just outside the gate, plumes catching the light; a plume haze on the flats
  let hp = '';
  for (let x = fx0; x < fx1; x += 4) if (RS() < 0.6) hp += plume(x, HZ + 3 + RS.range(0, 3), RS.range(3, 5), RS.range(30, 60), 0.24).body;
  S.add(`<path d="${hp}" fill="${F.plume}" opacity=".55"/>`);
  // the reed walls stand along both road edges: tall at the threshold, shrinking toward the horizon
  const roadL = [OUT.x0 + 22, OUT.gy + 2], roadR = [OUT.x1 - 18, OUT.gy + 2];
  let rd = '', st = '', pb = '';
  for (const [edge, far, side] of [[roadL, fx0, -1], [roadR, fx1, 1]]) {
    const top = [], base = [];
    for (let i = 0; i <= 26; i++) {
      const t = (i / 26) ** 1.4, bx = edge[0] + (RVX + side * 3 - edge[0]) * t, by = edge[1] + (HZ + 1 - edge[1]) * t;
      const h = (by - HZ) * RS.range(0.78, 0.98), tx = bx + side * RS.range(-1, 1);
      top.push([tx, by - h]); base.push([bx, by]);
      if (h > 4 && RS() < 0.6) pb += plume(tx, by - h + 1, Math.max(3, h * 0.24), RS.range(30, 62), 0.22).body;
      if (h > 10 && RS() < 0.5) st += `M${r0(tx)},${r0(by - h * RS.range(0.5, 0.85))}V${r0(by - h * 0.2)}`;
    }
    // the outer part of each wall runs back behind the arch jamb at threshold height
    const outer = [];
    for (let x = edge[0] + side * 6; side < 0 ? x > far : x < far; x += side * 5) {
      const y = edge[1] - (edge[1] - HZ) * RS.range(0.8, 0.95);
      outer.push([x, y]);
      if (RS() < 0.55) pb += plume(x, y + 1, RS.range(12, 19), RS.range(30, 62), 0.22).body;
      if (RS() < 0.35) st += `M${r0(x)},${r0(y + RS.range(6, 20))}V${r0(y + RS.range(30, 64))}`;
    }
    rd += pz([[far, edge[1]], ...outer.reverse(), ...top, ...base.reverse()]);
  }
  S.add(`<path d="${rd}" fill="${F.reed}"/><path d="${st}" stroke="${mix(F.reed, '#1a1210', 0.35)}" stroke-width="1.4" opacity=".45"/><path d="${pb}" fill="${F.plume}" opacity=".9"/>`);

  // --- the passage: vault and side walls, floor, the portcullis -------------------------------------------
  S.add(`<path d="${arch(IN)}${arch(OUT)}" fill-rule="evenodd" fill="${S.lin(P.pass, `gradientUnits="userSpaceOnUse" x1="0" y1="${IN.sp - IN.r}" x2="0" y2="${GYd}"`)}"/>`);
  S.add(`<path d="M${IN.x0},${GYd}L${f(OUT.x0, 1)},${f(OUT.gy, 1)}H${f(OUT.x1, 1)}L${IN.x1},${GYd}Z" fill="${P.passFloor}"/>`);
  S.add(`<path d="M${f(PORT.x0, 1)},${f(PORT.gy, 1)}V${f(PORT.sp, 1)}A${f(PORT.r, 1)},${f(PORT.r, 1)} 0 0 1 ${f(PORT.x1, 1)},${f(PORT.sp, 1)}V${f(PORT.gy, 1)}" fill="none" stroke="${P.slot}" stroke-width="5" opacity=".8"/>`);
  if (dusk) S.add(`<path d="M${f(OUT.x0, 1)},${f(OUT.gy, 1)}V${f(OUT.sp, 1)}A${f(OUT.r, 1)},${f(OUT.r, 1)} 0 0 1 ${f(OUT.x1, 1)},${f(OUT.sp, 1)}V${f(OUT.gy, 1)}" fill="none" stroke="#ffc890" stroke-width="3" opacity=".8"/>`);
  {
    const bot = night ? PORT.gy - 1 : PORT.sp - PORT.r + 34, top = PORT.sp - PORT.r - 4;
    let bars = '', spikes = '';
    for (let x = PORT.x0 + 6; x < PORT.x1; x += 19) { bars += `M${r0(x)},${r0(top)}V${r0(bot)}`; spikes += `M${r0(x - 3.5)},${r0(bot)}h7l-3.5,10z`; }
    for (let y = bot - 6; y > top; y -= 27) bars += `M${r0(PORT.x0)},${r0(y)}H${r0(PORT.x1)}`;
    const clip = S.clip(arch(PORT));
    S.add(`<g clip-path="${clip}"><path d="${bars}" stroke="${P.port}" stroke-width="6"/><path d="${bars}" stroke="${P.portHi}" stroke-width="1.2" opacity="${night ? 0.35 : 0.5}" transform="translate(-2 0)"/>${night ? '' : `<path d="${spikes}" fill="${P.port}"/>`}</g>`);
  }

  // --- the wall (inner face), parapet and merlons --------------------------------------------------------
  S.add(`<path d="M-20,${WT}H1620V${GYd}H-20Z${arch(IN)}" fill-rule="evenodd" fill="${S.lin(P.wall, `gradientUnits="userSpaceOnUse" x1="0" y1="${WT}" x2="0" y2="${GYd}"`)}"/>`);
  let courses = '';
  for (let y = WT + 46; y < GYd; y += 38) courses += `M-20,${y}H650M1070,${y}H1620`;
  for (let y = WT + 46, k = 0; y < GYd - 38; y += 38, k++) for (let x = -20 + (k % 2) * 46; x < 1620; x += 92) if (x < 640 || x > 1080) courses += `M${x},${y}v38`;
  S.add(`<path d="${courses}" stroke="${P.wallLine}" stroke-width="2" opacity="${P.lineOp}"/>`);
  let stains = '';
  for (let i = 0; i < 12; i++) { const x = R.range(0, 1600), y = R.range(WT + 50, GYd - 10); if (x > 620 && x < 1100) continue; stains += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${r0(R.range(18, 56))}" ry="${r0(R.range(6, 16))}"/>`; }
  S.add(`<g fill="${P.moss}" opacity=".22">${stains}</g>`);
  let cren = '';
  for (let x = -20; x < 1620; x += 52) cren += `M${x},292v-30h30v30z`;
  S.add(`<path d="M-20,292H1620V${WT - 6}H-20Z" fill="${P.parapet}"/><path d="${cren}" fill="${P.merlon}"/>`);
  S.add(`<path d="M-20,${WT - 8}H1620V${WT + 6}H-20Z" fill="${P.ledge}"/><path d="M-20,${WT + 6}H1620" stroke="${P.wallLine}" stroke-width="2" opacity=".5"/>`);
  S.add(`<path d="M-20,${WT + 6}H1620V${WT + 22}H-20Z" fill="${P.shadow}" opacity="${P.shadowOp * 0.8}"/>`);
  // a few weathered blocks, and ivy hanging from the parapet over the trough (the old back wall)
  let blk = '';
  for (let i = 0; i < 26; i++) { const k = Math.floor(RS.range(1, 7)), y = WT + 46 + k * 38, x = -20 + (k % 2) * 46 + Math.floor(RS.range(0, 18)) * 92; if (x > 600 && x < 1090) continue; blk += `M${x},${y}h92v-38h-92z`; }
  S.add(`<path d="${blk}" fill="${P.wallLine}" opacity=".1"/>`);
  {
    let ivy = '', ivy2 = '';
    for (const [cx, len, n] of [[1140, 150, 26], [1176, 110, 18], [1300, 190, 30], [1338, 120, 18], [370, 96, 14]]) {
      for (let i = 0; i < n; i++) {
        const t = i / n, y = 300 + len * t + RS.range(-4, 4), x = cx + Math.sin(t * 9 + cx) * 10 + RS.range(-14, 14) * (1 - t * 0.6), r = RS.range(4.5, 8) * (1 - t * 0.35);
        const leaf = `M${r0(x - r)},${r0(y)}q${r0(r)},${r0(-r * 1.3)} ${r0(r * 2)},0q${r0(-r)},${r0(r * 1.1)} ${r0(-r * 2)},0z`;
        if (RS() < 0.6) ivy += leaf; else ivy2 += leaf;
      }
    }
    S.add(`<path d="${ivy2}" fill="${P.ivy[1]}"/><path d="${ivy}" fill="${P.ivy[0]}"/>`);
  }
  let rimT = '';
  for (let x = -20; x < 1620; x += 52) rimT += `M${x},262h30`;
  S.add(`<path d="${rimT}M-20,292H1620" stroke="${P.rim}" stroke-width="${dusk ? 3 : 2}" opacity="${P.rimOp}"/>`);

  // --- the gatehouse over the arch: hoarding, hip roof, weathervane --------------------------------------
  const G0 = 650, G1 = 1070, GT = 196;
  S.add(`<path d="M${G0},${GYd}V${GT}H${G1}V${GYd}Z${arch(IN)}" fill-rule="evenodd" fill="${S.lin(P.gh, `gradientUnits="userSpaceOnUse" x1="0" y1="${GT}" x2="0" y2="${GYd}"`)}"/>`);
  let gc = '';
  for (let y = GT + 40; y < GYd; y += 38) gc += `M${G0},${y}H${y > 330 ? IN.x0 : G1}${y > 330 ? `M${IN.x1},${y}H${G1}` : ''}`;
  S.add(`<path d="${gc}" stroke="${P.wallLine}" stroke-width="1.6" opacity="${P.lineOp * 0.8}"/>`);
  S.add(`<path d="M${G0},${GYd}V${GT}" stroke="${P.rim}" stroke-width="2.5" opacity="${P.rimOp * 0.8}"/><path d="M${G1},${GYd}V${GT}" stroke="${P.wallLine}" stroke-width="3" opacity=".45"/>`);
  // voussoirs around the inner arch, keystone
  {
    let vs = '', jl = '';
    const n = 15, r1 = IN.r, r2 = IN.r + 26;
    for (let i = 0; i <= n; i++) {
      const a = Math.PI * i / n, c = Math.cos(a), s = Math.sin(a);
      jl += `M${f(VX - c * r1, 1)},${f(IN.sp - s * r1, 1)}L${f(VX - c * r2, 1)},${f(IN.sp - s * r2, 1)}`;
    }
    vs = `M${IN.x0 - 26},${IN.sp}A${r2},${r2} 0 0 1 ${IN.x1 + 26},${IN.sp}H${IN.x1}A${r1},${r1} 0 0 0 ${IN.x0},${IN.sp}Z`;
    S.add(`<path d="${vs}" fill="${P.ring}"/><path d="${jl}" stroke="${P.ringLine}" stroke-width="2" opacity=".55"/>`);
    S.add(`<path d="M${VX - 14},${IN.sp - r1 + 2}L${VX - 18},${IN.sp - r2 - 6}H${VX + 18}L${VX + 14},${IN.sp - r1 + 2}Z" fill="${P.ring}" stroke="${P.ringLine}" stroke-width="2" stroke-opacity=".6"/>`);
    S.add(`<path d="M${IN.x0 - 26},${IN.sp}A${r2},${r2} 0 0 1 ${VX},${IN.sp - r2}" fill="none" stroke="${P.rim}" stroke-width="2" opacity="${P.rimOp * 0.7}"/>`);
    // jamb stones down both sides
    let jb = '';
    for (let y = IN.sp + 4; y < GYd - 10; y += 30) jb += `M${IN.x0 - 22},${y}h22v24h-22zM${IN.x1},${y + 15}h22v${Math.min(24, GYd - y - 15)}h-22z`;
    S.add(`<path d="${jb}" fill="${P.ring}" stroke="${P.ringLine}" stroke-width="1.5" stroke-opacity=".45"/>`);
  }
  // guardroom windows (the portcullis winch room)
  S.add(`<path d="M738,242h26v36h-26zM956,242h26v36h-26z" fill="${P.win}"/><path d="M736,240h30M954,240h30" stroke="${P.ringLine}" stroke-width="3" opacity=".5"/>`);
  if (P.winLit) S.add(`<circle cx="969" cy="260" r="70" fill="${S.rad([[0, '#ffc870', 0.4], [1, '#ffc870', 0]])}"/><path d="M956,242h26v36h-26z" fill="#ffd690"/><path d="M969,242v36M956,258h26" stroke="#5a3a26" stroke-width="2"/>`);
  // timber hoarding on top, red hip roof, iron weathervane
  S.add(`<path d="M${G0 - 22},${GT}V152H${G1 + 22}V${GT}Z" fill="${P.hoard[0]}"/>`);
  let hb = '', hs = '';
  for (let x = G0 - 22; x < G1 + 22; x += 14) hb += `M${x},154V${GT}`;
  for (let x = G0 + 8; x < G1 - 20; x += 64) hs += `M${x},166h18v18h-18z`;
  S.add(`<path d="${hb}" stroke="${P.hoard[1]}" stroke-width="2" opacity=".6"/><path d="${hs}" fill="${P.slot}"/><path d="M${G0 - 22},${GT}H${G1 + 22}" stroke="${P.hoard[1]}" stroke-width="6"/>`);
  let brk = '';
  for (let x = G0 - 10; x < G1 + 20; x += 52) brk += `M${x},${GT}l10,16h6l-4,-16z`;
  S.add(`<path d="${brk}" fill="${P.hoard[1]}"/><path d="M${G0},${GT + 6}H${G1}V${GT + 30}H${G0}Z" fill="${P.shadow}" opacity="${P.shadowOp}"/>`);
  S.add(`<path d="M${G0 - 40},154L${VX - 96},92H${VX + 96}L${G1 + 40},154Z" fill="${P.roof[0]}"/><path d="M${VX + 96},92L${G1 + 40},154H${VX + 150}Z" fill="${P.roof[1]}" opacity=".6"/>`);
  let tl = '';
  for (let k = 1; k < 4; k++) { const y = 92 + 62 * k / 4, dx = 96 + (G1 + 40 - VX - 96) * k / 4; tl += `M${r0(VX - dx)},${r0(y)}H${r0(VX + dx)}`; }
  S.add(`<path d="${tl}" stroke="#000" stroke-opacity=".16" stroke-width="2"/><path d="M${G0 - 40},154L${VX - 96},92H${VX + 96}" fill="none" stroke="${P.rim}" stroke-width="2.5" opacity="${P.rimOp}"/>`);
  S.add(`<path d="M${VX + 40},92V52M${VX + 26},62H${VX + 58}" stroke="${P.iron}" stroke-width="3"/><path d="M${VX + 58},62l-10,-6v12z" fill="${P.iron}"/>`);

  // --- the street: cobbles, the worn path out through the gate ---------------------------------------------
  S.add(`<path d="M-20,${GYd}H1620V${H}H-20Z" fill="${S.lin(P.ground, `gradientUnits="userSpaceOnUse" x1="0" y1="${GYd}" x2="0" y2="${H}"`)}"/>`);
  S.add(`<path d="M${IN.x0},${GYd}H${IN.x1}L1200,${H}H520Z" fill="${S.lin([[0, P.street, day ? 0.75 : 0.45], [1, P.street, day ? 0.2 : 0.1]])}"/>`);
  S.add(`<path d="M-20,${GYd}H1620V${GYd + 14}H-20Z" fill="${P.shadow}" opacity="${P.shadowOp * 1.2}"/>`);
  S.add(cobbles(R, GYd + 4, H, P.cobble, 240));
  if (dusk) {
    // the low sun pours through the passage and lays a long tongue of light up the street
    const sx = SUN[0], sl = (OUT.x0 - sx) / (OUT.gy - HZ), sr = (OUT.x1 - sx) / (OUT.gy - HZ);
    S.add(`<path d="M${f(OUT.x0, 1)},${f(OUT.gy, 1)}H${f(OUT.x1, 1)}L${r0(sx + sr * (H - HZ))},${H}H${r0(sx + sl * (H - HZ))}Z" fill="${S.lin([[0, '#ffd8a0', 0.75], [0.15, '#ffb070', 0.42], [0.6, '#ff9060', 0.12], [1, '#ff9060', 0]], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(OUT.gy)}" x2="0" y2="${H}"`)}" filter="${S.blur(2)}"/>`);
    S.add(`<path d="${arch(OUT)}" fill="${S.rad([[0, '#fff0c8', 0.35], [1, '#fff0c8', 0]], 'cx="0.33" cy="0.75" r="0.7"')}"/>`);
  }
  if (night) S.add(`<ellipse cx="548" cy="${GYd + 26}" rx="250" ry="46" fill="${S.rad([[0, '#ffc070', 0.32], [1, '#ffc070', 0]])}"/>`);

  // --- the gate leaves, swung in against the gatehouse -----------------------------------------------------
  for (const s of [-1, 1]) {
    const hx = s < 0 ? IN.x0 : IN.x1, ex = hx + s * 64;
    S.add(`<path d="M${hx},${GYd}V${IN.sp + 6}L${ex},${IN.sp - 8}V${GYd + 18}Z" fill="${s < 0 ? P.door[0] : P.door[1]}"/>`);
    let pk = '';
    for (const t of [0.25, 0.5, 0.75]) pk += `M${r0(hx + s * 64 * t)},${r0(GYd + 18 * t)}V${r0(IN.sp + 6 - 14 * t)}`;
    S.add(`<path d="${pk}" stroke="${P.iron}" stroke-width="1.5" opacity=".35"/><path d="M${hx},${IN.sp + 40}L${ex},${IN.sp + 30}M${hx},${GYd - 40}L${ex},${GYd - 34}" stroke="${P.iron}" stroke-width="5"/>`);
    if (dusk) S.add(`<path d="M${ex},${IN.sp - 8}V${GYd + 18}" stroke="#ffb888" stroke-width="2" opacity=".6"/>`);
  }

  // --- left: the stair to the wall-walk, the postern with its lantern, notice board, register desk ---------
  {
    const sx0 = 96, sx1 = 438, sy0 = GYd, sy1 = WT + 4, n = 12;
    let steps = `M${sx0},${sy0}`;
    for (let i = 0; i < n; i++) { const x = sx0 + (sx1 - sx0) * i / n, y = sy0 - (sy0 - sy1) * (i + 1) / n; steps += `V${r0(y)}H${r0(x + (sx1 - sx0) / n)}`; }
    steps += `H${sx1 + 30}V${GYd}Z`;
    S.add(`<path d="${steps}" fill="${S.lin(P.stair, 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    let edge = '';
    for (let i = 0; i < n; i++) { const x = sx0 + (sx1 - sx0) * i / n, y = sy0 - (sy0 - sy1) * (i + 1) / n; edge += `M${r0(x)},${r0(y)}h${r0((sx1 - sx0) / n)}`; }
    S.add(`<path d="${edge}" stroke="${P.stairEdge}" stroke-width="2.5" opacity="${P.rimOp * 0.8}"/>`);
    S.add(`<path d="M${sx0 + 6},${GYd}L${sx1 + 6},${sy1 + 30}" stroke="${P.wallLine}" stroke-width="2" opacity=".4"/>`);
    // arched niche under the stair with a barrel
    S.add(`<path d="M318,${GYd}V532A36,36 0 0 1 390,532V${GYd}Z" fill="${P.niche}"/><path d="M330,${GYd}v-44h34v44z" fill="${P.wood}" opacity=".85"/><path d="M328,${GYd - 14}h38M328,${GYd - 34}h38" stroke="${P.iron}" stroke-width="3" opacity=".7"/>`);
    if (day) S.add(`<path d="M${sx1 + 30},${GYd}V${sy1 + 8}L${sx1 + 62},${sy1 + 40}V${GYd}Z" fill="${P.shadow}" opacity="${P.shadowOp}"/>`);
  }
  {
    // the postern: a small arched door in the wall, iron-strapped; ajar at night with a black gap
    const px0 = 512, px1 = 576, pt = 512;
    S.add(`<path d="M${px0 - 12},${GYd}V${pt}A${(px1 - px0) / 2 + 12},${(px1 - px0) / 2 + 12} 0 0 1 ${px1 + 12},${pt}V${GYd}Z" fill="${P.ring}"/>`);
    S.add(`<path d="M${px0},${GYd}V${pt}A${(px1 - px0) / 2},${(px1 - px0) / 2} 0 0 1 ${px1},${pt}V${GYd}Z" fill="${night ? '#05050a' : P.door[1]}"/>`);
    const dx1 = night ? px1 - 12 : px1;
    S.add(`<path d="M${px0},${GYd}V${pt}A${(px1 - px0) / 2},${(px1 - px0) / 2} 0 0 1 ${dx1},${pt - (night ? 26 : 0)}V${GYd}Z" fill="${P.door[0]}"/>`);
    S.add(`<path d="M${px0},${pt + 18}H${dx1}M${px0},${GYd - 26}H${dx1}" stroke="${P.iron}" stroke-width="4"/><path d="M${px0 + 21},${pt - 26}V${GYd}M${px0 + 42},${pt - 26}V${GYd}" stroke="${P.iron}" stroke-width="1.2" opacity=".35"/><circle cx="${dx1 - 10}" cy="${GYd - 52}" r="3" fill="${P.iron}"/>`);
    // the postern's lantern, hung from a curled iron arm right above the door
    const lx = (px0 + px1) / 2, ly = 432;
    S.add(`<path d="M${lx - 30},404H${lx + 4}q8,0 8,8M${lx - 30},420q16,-2 20,-16" fill="none" stroke="${P.iron}" stroke-width="3"/><path d="M${lx - 30},398v28" stroke="${P.iron}" stroke-width="4"/><path d="M${lx},404v16" stroke="${P.iron}" stroke-width="2"/>`);
    if (night) S.add(`<circle cx="${lx}" cy="${ly + 10}" r="260" fill="${S.rad([[0, '#ffdc90', 0.6], [0.1, '#ffb858', 0.36], [0.4, '#e8823a', 0.1], [1, '#e8823a', 0]])}"/>`);
    S.add(`<path d="M${lx - 12},${ly - 4}h24l-4,-8h-16z" fill="${P.iron}"/><path d="M${lx - 10},${ly - 4}h20v28h-20z" fill="${P.lampGlass}"/><path d="M${lx - 10},${ly - 4}h20v28h-20zM${lx},${ly - 4}v28" fill="none" stroke="${P.iron}" stroke-width="2"/><path d="M${lx - 12},${ly + 24}h24v4h-24z" fill="${P.iron}"/>`);
    if (night) S.add(`<circle cx="${lx}" cy="${ly + 10}" r="9" fill="#fffbe8" filter="${S.blur(1)}"/>`);
    // notice board with the 治安所 order pinned up (no legible text)
    S.add(`<path d="M594,486h62v56h-62z" fill="${P.wood}"/><path d="M594,486h62" stroke="${P.rim}" stroke-width="1.5" opacity="${P.rimOp * 0.6}"/>`);
    S.add(`<path d="M600,492h22v28h-22zM628,494h22v20h-22zM626,518h24v18h-24z" fill="${P.paper}"/><path d="M604,500h14M604,506h14M604,512h10M632,500h14M632,506h12" stroke="${P.wallLine}" stroke-width="1.5" opacity=".5"/><circle cx="611" cy="494" r="2" fill="#b03a3a"/><circle cx="639" cy="496" r="2" fill="#b03a3a"/>`);
    // the register desk: a slanted lectern with the open book
    S.add(`<path d="M602,${GYd}V570M650,${GYd}V570" stroke="${P.wood}" stroke-width="5"/><path d="M596,566L654,558V572L596,578Z" fill="${P.wood}"/><path d="M600,564L624,560L626,568L602,572ZM626,560L650,556L652,564L628,568Z" fill="${P.paper}"/>`);
    if (day) S.add(`<path d="M656,${GYd}V560l14,8V${GYd}Z" fill="${P.shadow}" opacity="${P.shadowOp}"/>`);
  }

  // --- right: the spouted horse trough, a bucket --------------------------------------------------------
  {
    const T0 = 1112, T1 = 1336, TT = 562, TF = 574, TB = 614, T = P.trough;
    S.add(`<path d="M1206,${GYd - 92}h28v26h-28z" fill="${P.ring}" stroke="${P.ringLine}" stroke-width="2" stroke-opacity=".5"/><circle cx="1220" cy="${GYd - 79}" r="7" fill="${P.ringLine}" opacity=".7"/>`);
    S.add(`<path d="M1220,${GYd - 72}v18q0,8 8,8h4" fill="none" stroke="${P.iron}" stroke-width="6" stroke-linecap="round"/>`);
    S.add(`<path d="M1233,${GYd - 46}q4,14 2,${TF - GYd + 50}" fill="none" stroke="${T.hi}" stroke-width="3" opacity=".55"/>`);
    if (day) S.add(`<path d="M${T1},${TB}L${T1},${TT}L${T1 + 40},${TT + 14}V${TB}Z" fill="${P.shadow}" opacity="${P.shadowOp}"/>`);
    S.add(`<path d="M${T0},${TT}H${T1}L${T1 + 8},${TF}H${T0 - 8}Z" fill="${T.top}"/>`);
    S.add(`<path d="M${T0 + 10},${TT + 3}H${T1 - 10}L${T1 - 6},${TF - 3}H${T0 + 6}Z" fill="${S.lin(T.water)}"/>`);
    S.add(`<path d="M${T0 + 40},${TT + 7}h60M${T0 + 140},${TT + 6}h40" stroke="${T.hi}" stroke-width="1.5" opacity=".6"/><ellipse cx="1236" cy="${TT + 7}" rx="12" ry="2.5" fill="none" stroke="${T.hi}" stroke-width="1.2" opacity=".6"/>`);
    S.add(`<path d="M${T0 - 8},${TF}H${T1 + 8}V${TB}H${T0 - 8}Z" fill="${T.front}"/><path d="M${T1 - 50},${TF}H${T1 + 8}V${TB}H${T1 - 50}Z" fill="${T.side}" opacity=".45"/><path d="M${T0 - 8},${TF}H${T1 + 8}" stroke="${P.rim}" stroke-width="2" opacity="${P.rimOp * 0.7}"/>`);
    S.add(`<path d="M${T0 + 60},${TF}V${TB}M${T0 + 150},${TF}V${TB}" stroke="${P.wallLine}" stroke-width="2" opacity=".35"/>`);
    S.add(`<path d="M1356,${TB}l-4,-34h30l-4,34z" fill="${P.wood}"/><path d="M1353,${TB - 26}h28M1355,${TB - 8}h24" stroke="${P.iron}" stroke-width="2.5"/><path d="M1352,${TB - 34}q15,-18 30,0" fill="none" stroke="${P.iron}" stroke-width="2"/>`);
  }

  // --- framing: the last houses of the town at both edges --------------------------------------------------
  {
    const Hs = P.house;
    const edgeHouse = (x0, x1, gy, top, side) => {
      const o = [];
      const fh = (gy - top) / 3;
      o.push(`<path d="M${x0},${gy}V${top}H${x1}V${gy}Z" fill="${Hs.plaster}"/>`);
      o.push(`<path d="M${x0},${gy}V${gy - fh}H${x1}V${gy}Z" fill="${Hs.stone}"/>`);
      o.push(`<path d="M${side < 0 ? x1 - 26 : x0},${gy}V${top}h26V${gy}Z" fill="${Hs.shade}" opacity=".6"/>`);
      let tb = `M${x0},${gy - fh}H${x1}M${x0},${gy - 2 * fh}H${x1}M${x0},${top}H${x1}`;
      for (let x = x0 + 6; x < x1; x += 64) tb += `M${x},${top}V${gy - fh}`;
      for (let x = x0 + 6; x < x1 - 32; x += 128) tb += `M${x},${gy - fh}L${x + 64},${gy - 2 * fh}M${x},${gy - 2 * fh}L${x + 64},${top}`;
      o.push(`<path d="${tb}" stroke="${Hs.timber}" stroke-width="5" fill="none"/>`);
      return o.join('');
    };
    // right: front corner of a townhouse, its eave cutting the sky
    S.add(edgeHouse(1430, 1640, 660, 236, 1));
    S.add(`<path d="M1404,244L1640,150V196L1424,262Z" fill="${Hs.roof}"/><path d="M1404,244L1640,150" stroke="${P.rim}" stroke-width="2.5" opacity="${P.rimOp * 0.8}"/>`);
    const lit = Hs.lit ? '#ffd690' : Hs.glass;
    // windows sit in the brace-free panel between the posts at x 1500 and 1564
    S.add(`<path d="M1513,412h38v62h-38zM1513,272h38v58h-38z" fill="${Hs.glass}"/><path d="M1507,474h50v6h-50zM1507,330h50v6h-50z" fill="${Hs.timber}"/>`);
    if (Hs.lit) S.add(`<circle cx="1532" cy="443" r="80" fill="${S.rad([[0, '#ffc870', 0.32], [1, '#ffc870', 0]])}"/><path d="M1513,412h38v62h-38z" fill="${lit}"/><path d="M1532,412v62M1513,440h38" stroke="${Hs.timber}" stroke-width="3"/>`);
    S.add(`<path d="M1462,660V566a24,24 0 0 1 48,0V660Z" fill="${Hs.timber}"/><path d="M1542,${660 - 112}h70v52h-70z" fill="${Hs.glass}"/>`);
    // left: the corner of the house by the stair foot, mostly cropped
    S.add(edgeHouse(-40, 72, 668, 250, -1));
    S.add(`<path d="M-40,232L100,270V292L-40,256Z" fill="${Hs.roof}"/>`);
  }

  // --- grading: light, vignette, calm bottom for the dialogue box ------------------------------------------
  const g = P.grade;
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, g.warm, g.warmOp], [0.5, g.warm, 0], [1, g.cool, g.coolOp]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[night ? 0.4 : 0.52, g.vig, 0], [1, g.vig, g.vigOp]], 'cx="0.52" cy="0.46" r="0.78"')}"/>`);
  S.add(`<rect y="612" width="${W}" height="288" fill="${S.lin([[0, g.bottom, 0], [1, g.bottom, g.bottomOp]])}"/>`);
  return S.out();
}

export const townBgs = {
  'guild-hall': guildHall,
  'guard-square': guardSquare,
  'dye-alley': dyeAlley,
  'barrel-alley': barrelAlley,
  'chime-town-gate': chimeGate,
  'market': market,
  'training-ground-dawn': trainingGround,
  'west-gate-day': () => westGate('day'),
  'west-gate-dusk': () => westGate('dusk'),
  'west-gate-night': () => westGate('night'),
};
