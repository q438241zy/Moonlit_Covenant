// 晨钟镇 (Chime Town): chime-town-gate, guild-hall, market, dye-alley, barrel-alley, guard-square.
// A lively market town that was never burned: warm plaster, timber frames, red tiles, the bell tower.
import { Scene, W, H, f, pz, pl, shape, cloud, cloudCluster, ridge, rays, stars, smoke, band, tree, rock, persp, bellTower, star7, mix, TOWN, townhouse, stall, person, bird } from './lib.mjs';

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
function swordBell(cx, cy, k) {
  const a = Math.PI / 4, c = Math.cos(a), sn = Math.sin(a), L = 34 * k;
  const tip = [cx + c * L, cy - sn * L], pom = [cx - c * L * 0.8, cy + sn * L * 0.8], g0 = [cx - c * L * 0.42 - sn * 11 * k, cy + sn * L * 0.42 - c * 11 * k], g1 = [cx - c * L * 0.42 + sn * 11 * k, cy + sn * L * 0.42 + c * 11 * k];
  return `<path d="M${r0(pom[0])},${r0(pom[1])}L${r0(tip[0])},${r0(tip[1])}" stroke="#e8d0a0" stroke-width="${f(5 * k)}" stroke-linecap="round"/><path d="M${r0(g0[0])},${r0(g0[1])}L${r0(g1[0])},${r0(g1[1])}" stroke="#e8d0a0" stroke-width="${f(4 * k)}"/><circle cx="${r0(pom[0])}" cy="${r0(pom[1])}" r="${f(4 * k)}" fill="#e8d0a0"/>`
    + `<path d="M${r0(cx - 9 * k)},${r0(cy + 10 * k)}q0,${r0(-18 * k)} ${r0(9 * k)},${r0(-18 * k)}q${r0(9 * k)},0 ${r0(9 * k)},${r0(18 * k)}z" fill="#f2c25a"/>`;
}

// Narrow alley in one-point perspective: half-timbered walls at X = ±hw, eaves, cobbles.
// pal: { wall, wallFar, timber, shade, glass, ground, eave } ; dim (0..1) darkens toward the far end.
function alley(S, R, pr, { hw = 2.2, z0 = 1.4, z1 = 40, hgt = 9, pal, segs = null }) {
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

export const townBgs = {
  'guild-hall': guildHall,
  'guard-square': guardSquare,
  'dye-alley': dyeAlley,
  'barrel-alley': barrelAlley,
  'chime-town-gate': chimeGate,
  'market': market,
};
