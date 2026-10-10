// 旧磨坊路 (the old mill road west of 晨钟镇): mill-road-milestone (afternoon) and mill-road-dusk.
// A dirt road through man-high dry reeds; the irrigation ditch along the right; the second milestone on
// the right shoulder where the wheel ruts leave the road; the relief society's grain cart overturned at
// the ditch, its cracked crate pulsing violet; the disused windmill standing still on a far knoll.
// Both variants share one layout (same seed, same geometry); only the light and grading change:
//   day  — afternoon, the sun behind the viewer's left shoulder ("太阳在你背后"), shadows fall away/right;
//   dusk — the sun low ahead-left behind the reeds, the crate's light smothered, smoke over the old mill.
import { Scene, W, H, f, pz, pl, cloud, cloudCluster, ridge, rays, band, tree, persp, smoke, bird, noise1 } from './lib.mjs';

const r0 = (v) => f(v, 0);
const VPX = 600, HZ = 452, F = 900, EYE = 1.6;
// cross-section of the right side (metres from the road centre): road edge, ditch banks and water, reeds
const RD = 1.8, BK0 = 3.1, WT0 = 3.32, WT1 = 4.45, BK1 = 4.72, REED_R = 5.0, REED_L = -2.1;

// ---------------------------------------------------------------------------------------------
// palettes
// ---------------------------------------------------------------------------------------------
const PAL = {
  day: {
    sky: [[0, '#7a9ec4'], [0.24, '#b2c2cc'], [0.42, '#e4d8b8'], [0.5, '#f0e0b6'], [1, '#c8a878']],
    cloud: { lit: '#fff8ea', shade: '#d6cdcc', rim: '#ffffff' },
    cloudFar: { lit: '#f4e8d2', shade: '#d8cec8', rim: null },
    ridge: { fill: '#b4b2c4', shade: '#9a98b0', rim: '#fff4e0' },
    knoll: [[0, '#bcb288'], [1, '#a29878']], knollRim: '#fff2d0',
    treeFar: { lit: '#aaa878', shade: '#83866a', trunk: '#6a5a4c' },
    mill: { lit: '#d4c6b0', shade: '#a0948c', roof: '#94695a', frame: '#605452', door: '#4e4240', house: '#c6b69e', houseShade: '#94887c', houseRoof: '#8a6454', chimney: '#a09080' },
    haze: '#f2e4c2', reedSea: '#d6bf8c',
    ground: [[0, '#cfb888'], [1, '#6e5a3c']],
    road: [[0, '#d8c6a2'], [0.35, '#bca684'], [1, '#7c6650']],
    verge: [[0, '#c8b27a'], [0.4, '#a8925e'], [1, '#5a4a30']],
    bankIn: '#7a6446', bankOut: '#b49a6a',
    water: [[0, '#d2dcdc'], [0.5, '#a4b4b8'], [1, '#56646a']], waterHi: '#ffffff', waterDark: '#4a4a40',
    leftReed: { fill: [[0, '#b29a6e'], [0.3, '#8c7652'], [1, '#3c3022']], stalk: '#5e4c34', plume: '#dccbaa', rim: '#fff4d8', leaf: '#6a5a3a' },
    rightReed: { fill: [[0, '#e6c88c'], [0.3, '#c4a064'], [1, '#6a5232']], stalk: '#9a7a4a', hi: '#f6e2b0', plume: '#f6ead0', rim: '#ffffff', leaf: '#a88a52' },
    rut: '#8a7254', gravel: '#9c8466', gravelHi: '#efe2c8', print: '#8a7256',
    shadow: '#3e3020', shadowOp: 0.3,
    stone: { side: '#d6ccb6', front: '#b8ac96', top: '#e2d8c2', edge: '#7a7062', crack: '#6a6054', lichen: ['#b4ba8a', '#dcd4a4'], moss: '#6e7444', groove: '#4e463e', grooveHi: '#f4ecda' },
    wood: { lit: '#a8784a', mid: '#8a5e3a', shade: '#5e3e26', top: '#c4925e', dark: '#3a2618', iron: '#3e3a3a', hi: '#f0c890' },
    sack: ['#d4c098', '#a8946c'], grain: '#e8cc80',
    glow: true,
    grade: { warm: '#ffe9b0', warmOp: 0.16, cool: '#3a2a40', coolOp: 0.2, vig: '#2a1e10', vigOp: 0.45, bottom: '#2a1a0e', bottomOp: 0.58 },
  },
  dusk: {
    sky: [[0, '#2e2850'], [0.2, '#5e3e6c'], [0.36, '#b4607a'], [0.45, '#ec9a66'], [0.5, '#f8c07a'], [1, '#6a4a4a']],
    cloud: { lit: '#e8907a', shade: '#5e3c5e', rim: '#ffcf9a' },
    cloudFar: { lit: '#d88a7e', shade: '#7a4e66', rim: null },
    ridge: { fill: '#7a5070', shade: '#5a3a5a', rim: '#ffc090' },
    knoll: [[0, '#6a4458'], [1, '#583a4e']], knollRim: '#ffb07a',
    treeFar: { lit: '#6e4a5a', shade: '#4e3448', trunk: '#3a2838' },
    mill: { lit: '#5a3c50', shade: '#3e2a3e', roof: '#4a2e3e', frame: '#2e2030', door: '#22182a', house: '#523848', houseShade: '#3a283a', houseRoof: '#3e283a', chimney: '#4a3446' },
    haze: '#ffc488', reedSea: '#a8645a',
    ground: [[0, '#9a6458'], [1, '#2e2026']],
    road: [[0, '#b47a64'], [0.35, '#86584e'], [1, '#2e2028']],
    verge: [[0, '#94604a'], [0.4, '#6e463c'], [1, '#2a1a22']],
    bankIn: '#4a3034', bankOut: '#a0644e',
    water: [[0, '#ffc890'], [0.5, '#c88078'], [1, '#3e2c3e']], waterHi: '#fff0c8', waterDark: '#2a1e28',
    leftReed: { fill: [[0, '#5a3a48'], [0.3, '#40283a'], [1, '#1c1220']], stalk: '#2a1a28', plume: '#a86a5e', rim: '#ffc890', leaf: '#2e1e2a' },
    rightReed: { fill: [[0, '#b8704e'], [0.3, '#8a5040'], [1, '#2e1e26']], stalk: '#5e3634', hi: '#e8946a', plume: '#e89a70', rim: '#ffd0a0', leaf: '#6a3e38' },
    rut: '#5e3e3e', gravel: '#6e4c48', gravelHi: '#e8a07a', print: '#5e4040',
    shadow: '#24142a', shadowOp: 0.45,
    stone: { side: '#d88a64', front: '#5e4450', top: '#a8705e', edge: '#2e2030', crack: '#3a2836', lichen: ['#7a6a5a', '#a07a5e'], moss: '#3e3a2e', groove: '#2a1c28', grooveHi: '#c07a62' },
    wood: { lit: '#8a5446', mid: '#6a3e38', shade: '#3e2630', top: '#b0705a', dark: '#24161e', iron: '#22181e', hi: '#ffb880' },
    sack: ['#a8786a', '#6e4a4a'], grain: '#d89a6a',
    glow: false,
    grade: { warm: '#ff9a60', warmOp: 0.14, cool: '#2a1a4a', coolOp: 0.32, vig: '#140c1c', vigOp: 0.6, bottom: '#140c1c', bottomOp: 0.68 },
  },
};

// ---------------------------------------------------------------------------------------------
// painters
// ---------------------------------------------------------------------------------------------

// A plume: a soft feathered teardrop rising from (x, y), leaning `ang` degrees clockwise from vertical.
function plume(x, y, L, ang, w = 0.22) {
  const a = ang * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  const T = (u, v) => `${r0(x + v * c + u * s)},${r0(y + v * s - u * c)}`; // u: along the plume, v: across
  const body = `M${T(0, 0)}C${T(L * 0.3, -L * w)} ${T(L * 0.78, -L * w * 0.9)} ${T(L, L * 0.04)}C${T(L * 0.75, L * w * 0.7)} ${T(L * 0.3, L * w * 0.6)} ${T(0, 0)}Z`;
  const edge = `M${T(L * 0.12, -L * w * 0.45)}C${T(L * 0.4, -L * w * 0.95)} ${T(L * 0.78, -L * w * 0.85)} ${T(L * 0.98, 0)}`;
  return { body, edge };
}

// A wall of reeds standing along the ground line X (metres), drawn as one silhouette from the near
// frame edge back to the vanishing point, with stalk texture, leaves and wind-blown plumes on top.
function reedWall(S, R, pr, o) {
  const { X, h0, hv, pal, seed, xNear, step = 5, plumeP = 0.45, leafP = 0.35, lean = 1 } = o;
  const side = Math.sign(X);
  const n = noise1(seed, 26), n2 = noise1(seed + 7, 7);
  const top = [], base = [], tips = [];
  const xs = [];
  for (let x = xNear; side < 0 ? x < VPX - 3 : x > VPX + 3; x += -side * step) xs.push(x);
  for (const x of xs) {
    const Z = X * F / (x - VPX);
    if (Z > 260) continue;
    const h = h0 + hv * (n(x) * 0.7 + n2(x) * 0.3);
    const yt = HZ - (h - EYE) / Z * F, yb = HZ + EYE / Z * F;
    tips.push({ x, y: yt, yb, Z });
    top.push([x, yt], [x - side * step * 0.5, yt + Math.max(1.5, 0.16 / Z * F * R.range(0.4, 1))]);
    base.push([x, yb]);
  }
  const yMin = Math.min(...tips.map((t) => t.y));
  const fill = S.lin(pal.fill, `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(yMin)}" x2="0" y2="${H}"`);
  let svg = `<path d="${pz([...top, ...base.reverse()])}" fill="${fill}"/>`;
  // stalks: verticals dropping from the tips, thinning into the mass
  let st = '', hi = '', leaves = '';
  for (const t of tips) {
    const k = F / t.Z;
    for (let j = 0; j < (t.Z < 8 ? 2 : 1); j++) {
      if (R() > 0.8) continue;
      const x = t.x + R.range(-0.5, 0.5) * step, y = t.y + (t.yb - t.y) * R.range(0, 0.1) * j, len = (t.yb - t.y) * R.range(0.15, 0.6);
      const seg = `M${r0(x)},${r0(y)}l${f(R.range(-1, 1) * len * 0.04 + lean * len * 0.02, 0)},${r0(len)}`;
      if (pal.hi && R() < 0.4) hi += seg; else st += seg;
    }
    if (t.Z < 14 && R() < 0.7) { const len = (t.yb - t.y) * R.range(0.2, 0.5), x = t.x + R.range(-0.5, 0.5) * step; st += `M${r0(x)},${r0(t.yb)}l${f(lean * len * 0.03, 0)},${r0(-len)}`; }
    if (t.Z < 6 && R() < leafP) {
      // long blade leaving the stalk, arching out and drooping
      const y0 = t.y + (t.yb - t.y) * R.range(0.12, 0.5), L = 0.55 * k * R.range(0.7, 1.1), dir = R() < 0.5 ? -1 : 1, wd = Math.max(1.5, 0.018 * k);
      leaves += `M${r0(t.x)},${r0(y0)}q${r0(dir * L * 0.5)},${r0(-L * 0.35)} ${r0(dir * L)},${r0(L * 0.1)}q${r0(-dir * L * 0.45)},${r0(-L * 0.18)} ${r0(-dir * L)},${r0(wd)}z`;
    }
  }
  const sw = (z) => f(Math.max(0.8, 0.012 * F / z), 1);
  svg += `<path d="${st}" fill="none" stroke="${pal.stalk}" stroke-width="${sw(6)}" stroke-linecap="round" opacity=".5"/>`;
  if (hi) svg += `<path d="${hi}" fill="none" stroke="${pal.hi}" stroke-width="${sw(6)}" stroke-linecap="round" opacity=".45"/>`;
  if (leaves) svg += `<path d="${leaves}" fill="${pal.leaf}" opacity=".55"/>`;
  // plumes on the tips (far ones small and dense, near ones large and sparse)
  let pb = '', pe = '';
  for (const t of tips) {
    if (R() > plumeP) continue;
    const L = Math.min(84, 0.34 * F / t.Z) * R.range(0.75, 1.1);
    if (L < 2.2) continue;
    const { body, edge } = plume(t.x, t.y + L * 0.05, L, R.range(28, 62) * lean, R.range(0.18, 0.26));
    pb += body; if (L > 6) pe += edge;
  }
  svg += `<path d="${pb}" fill="${pal.plume}"/><path d="${pe}" fill="none" stroke="${pal.rim}" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>`;
  return { svg, tips };
}

// The disused windmill: tapered tower, boat-shaped cap, bare sail frames (one arm snapped), mill house.
function oldMill(x, y, s, pal) {
  const out = [];
  const tw = 46 * s, tt = 27 * s, th = 116 * s;
  // mill house on the right, its chimney
  const hx = x + tw * 0.2, hw = 64 * s, hh = 30 * s;
  out.push(`<path d="M${r0(hx + hw - 14 * s)},${r0(y - hh - 12 * s)}v${r0(-16 * s)}h${r0(9 * s)}v${r0(16 * s)}z" fill="${pal.chimney}"/>`);
  out.push(`<path d="${pz([[hx, y], [hx, y - hh], [hx + hw, y - hh], [hx + hw, y]])}" fill="${pal.house}"/><path d="${pz([[hx + hw * 0.62, y], [hx + hw * 0.62, y - hh], [hx + hw, y - hh], [hx + hw, y]])}" fill="${pal.houseShade}"/>`);
  out.push(`<path d="${pz([[hx - 3 * s, y - hh], [hx + hw * 0.5, y - hh - 18 * s], [hx + hw + 4 * s, y - hh]])}" fill="${pal.houseRoof}"/>`);
  out.push(`<path d="M${r0(hx + hw * 0.24)},${r0(y)}v${r0(-hh * 0.55)}h${r0(9 * s)}v${r0(hh * 0.55)}z" fill="${pal.door}"/>`);
  // tower
  out.push(`<path d="${pz([[x - tw / 2, y], [x - tt / 2, y - th], [x + tt / 2, y - th], [x + tw / 2, y]])}" fill="${pal.lit}"/>`);
  out.push(`<path d="${pz([[x + tw * 0.06, y], [x + tt * 0.08, y - th], [x + tt / 2, y - th], [x + tw / 2, y]])}" fill="${pal.shade}"/>`);
  out.push(`<path d="M${r0(x - 7 * s)},${r0(y)}v${r0(-26 * s)}a${f(7 * s)},${f(7 * s)} 0 0 1 ${r0(14 * s)},0v${r0(26 * s)}z" fill="${pal.door}"/><path d="M${r0(x - 3 * s)},${r0(y - th * 0.62)}h${r0(6 * s)}v${r0(10 * s)}h${r0(-6 * s)}z" fill="${pal.door}"/>`);
  out.push(`<path d="M${r0(x - tt * 0.78)},${r0(y - th)}Q${r0(x - tt * 0.2)},${r0(y - th - 30 * s)} ${r0(x + tt * 0.9)},${r0(y - th - 4 * s)}L${r0(x + tt * 0.8)},${r0(y - th + 3 * s)}Z" fill="${pal.roof}"/>`);
  // bare sail frames, stopped; the lower-left arm snapped short with its frame hanging
  const hubx = x - 5 * s, huby = y - th - 9 * s;
  let stocks = '', frames = '';
  const arms = [[24, 1], [114, 1], [204, 0.48], [294, 1]];
  for (const [deg, len] of arms) {
    const a = deg * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
    const L = 104 * s * len, w0 = 3 * s, w1 = 19 * s;
    const p0 = [hubx + ux * 14 * s, huby + uy * 14 * s], p1 = [hubx + ux * L, huby + uy * L];
    stocks += `M${r0(hubx)},${r0(huby)}L${r0(p1[0])},${r0(p1[1])}`;
    if (len < 1) {
      // the frame of the snapped arm dangles straight down from the break
      frames += `M${r0(p1[0])},${r0(p1[1])}l${r0(4 * s)},${r0(30 * s)}l${r0(14 * s)},${r0(2 * s)}l${r0(-6 * s)},${r0(-26 * s)}`;
      continue;
    }
    frames += `M${r0(p0[0] + vx * w1 * 0.7)},${r0(p0[1] + vy * w1 * 0.7)}L${r0(p1[0] + vx * w1)},${r0(p1[1] + vy * w1)}L${r0(p1[0] + vx * w0)},${r0(p1[1] + vy * w0)}`;
    for (let t = 0.25; t < 1; t += 0.15) {
      const q = [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t];
      frames += `M${r0(q[0] + vx * w0)},${r0(q[1] + vy * w0)}l${r0(vx * (w1 - w0))},${r0(vy * (w1 - w0))}`;
    }
  }
  out.push(`<path d="${frames}" fill="none" stroke="${pal.frame}" stroke-width="${f(Math.max(1, 1.6 * s))}" stroke-linejoin="round"/>`);
  out.push(`<path d="${stocks}" stroke="${pal.frame}" stroke-width="${f(Math.max(1.4, 4.2 * s))}" stroke-linecap="round"/>`);
  out.push(`<circle cx="${r0(hubx)}" cy="${r0(huby)}" r="${f(5.5 * s)}" fill="${pal.frame}"/>`);
  return { svg: out.join(''), chimney: [hx + hw - 9.5 * s, y - hh - 28 * s] };
}

// The relief society's grain cart, flipped wheels-up at the ditch edge; drawn as a side elevation at
// scale k px/m from its tail end (x0, y0) on the road, the shafts end tipped by `ang` degrees into the ditch.
function cart(x0, y0, k, ang, P) {
  const w = P.wood, L = 2.45 * k, bh = 0.55 * k, dx = 0.16 * k, dy = -0.11 * k;
  const g = [];
  // far wheel (only its upper arc clears the bed)
  const wx = 1.05 * k, wy = -bh - 0.14 * k, wr = 0.56 * k;
  g.push(`<circle cx="${r0(wx + dx)}" cy="${r0(wy + dy)}" r="${r0(wr)}" fill="none" stroke="${w.shade}" stroke-width="${f(0.1 * k)}"/>`);
  // shafts at the front: one snapped and cocked up, the other run down into the ditch
  g.push(`<path d="M${r0(L - 0.1 * k + dx)},${r0(-bh + dy)}L${r0(L + 0.36 * k)},${r0(-bh - 0.42 * k)}l${r0(0.09 * k)},${r0(0.03 * k)}" fill="none" stroke="${w.shade}" stroke-width="${f(0.075 * k)}" stroke-linecap="round" stroke-linejoin="round"/>`);
  g.push(`<path d="M${r0(L - 0.1 * k)},${r0(-bh * 0.9)}L${r0(L + 0.42 * k)},${r0(0.22 * k)}" stroke="${w.mid}" stroke-width="${f(0.08 * k)}" stroke-linecap="round"/>`);
  // the bed upside down: its floor (now on top) with cross-beams and the axle block, the near side panel
  g.push(`<path d="${pz([[0, -bh], [L, -bh], [L + dx, -bh + dy], [dx, -bh + dy]])}" fill="${w.top}"/>`);
  let beams = '';
  for (const t of [0.1, 0.62, 0.9]) beams += `M${r0(L * t)},${r0(-bh)}l${r0(dx)},${r0(dy)}`;
  g.push(`<path d="${beams}" stroke="${w.shade}" stroke-width="${f(0.05 * k)}"/>`);
  g.push(`<path d="${pz([[0, 0], [0, -bh], [L, -bh], [L, 0]])}" fill="${w.lit}"/><path d="${pz([[L * 0.74, 0], [L * 0.74, -bh], [L, -bh], [L, 0]])}" fill="${w.mid}" opacity=".5"/>`);
  g.push(`<path d="M0,${r0(-bh * 0.36)}H${r0(L)}M0,${r0(-bh * 0.7)}H${r0(L)}M${r0(L * 0.04)},0V${r0(-bh)}M${r0(L * 0.96)},0V${r0(-bh)}M${r0(L * 0.6)},0V${r0(-bh)}" stroke="${w.shade}" stroke-width="${f(Math.max(1, 0.035 * k))}"/>`);
  g.push(`<path d="M0,${r0(-bh)}H${r0(L)}" stroke="${w.hi}" stroke-width="${f(Math.max(1, 0.03 * k))}" opacity=".7"/>`);
  g.push(`<path d="M0,0H${r0(L)}" stroke="${w.dark}" stroke-width="${f(0.07 * k)}" opacity=".75"/>`);
  g.push(`<path d="${pz([[wx - 0.3 * k, -bh], [wx + 0.3 * k, -bh], [wx + 0.3 * k + dx, -bh + dy], [wx - 0.3 * k + dx, -bh + dy]])}" fill="${w.shade}"/>`);
  // near wheel, wheels-up: iron tyre, felloe, spokes, hub; one spoke gone
  let sp = '';
  for (let i = 0; i < 10; i++) {
    if (i === 6) continue;
    const a = (i * 36 + 9) * Math.PI / 180;
    sp += `M${r0(wx + Math.cos(a) * wr * 0.18)},${r0(wy + Math.sin(a) * wr * 0.18)}L${r0(wx + Math.cos(a) * wr * 0.9)},${r0(wy + Math.sin(a) * wr * 0.9)}`;
  }
  g.push(`<path d="${sp}" stroke="${w.mid}" stroke-width="${f(0.055 * k)}"/>`);
  g.push(`<circle cx="${r0(wx)}" cy="${r0(wy)}" r="${r0(wr)}" fill="none" stroke="${w.iron}" stroke-width="${f(0.1 * k)}"/><circle cx="${r0(wx)}" cy="${r0(wy)}" r="${r0(wr * 0.86)}" fill="none" stroke="${w.lit}" stroke-width="${f(0.06 * k)}"/>`);
  g.push(`<path d="M${r0(wx - wr * 0.72)},${r0(wy - wr * 0.7)}A${r0(wr)},${r0(wr)} 0 0 1 ${r0(wx + wr * 0.2)},${r0(wy - wr * 0.98)}" fill="none" stroke="${w.hi}" stroke-width="${f(0.045 * k)}" opacity=".8"/>`);
  g.push(`<circle cx="${r0(wx)}" cy="${r0(wy)}" r="${r0(wr * 0.2)}" fill="${w.dark}"/><circle cx="${r0(wx - wr * 0.05)}" cy="${r0(wy - wr * 0.05)}" r="${r0(wr * 0.08)}" fill="${w.hi}" opacity=".7"/>`);
  return `<g transform="translate(${r0(x0)} ${r0(y0)}) rotate(${ang})">${g.join('')}</g>`;
}

// Grain sack lying on the ground (centre x, ground y), k px/m
function sack(x, y, k, P, lean = 0, split = false) {
  const w = 0.62 * k, h = 0.3 * k;
  let s = `<path d="M${r0(x - w / 2)},${r0(y)}q${r0(-w * 0.06)},${r0(-h * 0.9)} ${r0(w * 0.3)},${r0(-h)}q${r0(w * 0.35)},${r0(-h * 0.18)} ${r0(w * 0.62)},${r0(h * 0.06)}q${r0(w * 0.16)},${r0(h * 0.5)} ${r0(w * 0.08)},${r0(h * 0.94)}z" fill="${P.sack[0]}" transform="rotate(${lean} ${r0(x)} ${r0(y)})"/>`;
  s += `<path d="M${r0(x + w * 0.12)},${r0(y)}q${r0(w * 0.28)},${r0(-h * 0.2)} ${r0(w * 0.38)},${r0(-h * 0.8)}q${r0(w * 0.04)},${r0(h * 0.5)} ${r0(-w * 0.1)},${r0(h * 0.8)}z" fill="${P.sack[1]}" transform="rotate(${lean} ${r0(x)} ${r0(y)})"/>`;
  if (split) {
    let gr = '';
    for (let i = 0; i < 14; i++) gr += `<circle cx="${r0(x - w * 0.5 - (i % 5) * w * 0.12 - (i > 6 ? w * 0.1 : 0))}" cy="${r0(y - (i % 3) * 1.5 + (i > 6 ? 2 : 0))}" r="${f(Math.max(1, 0.025 * k))}"/>`;
    s += `<g fill="${P.grain}" opacity=".85">${gr}</g>`;
  }
  return s;
}

// ---------------------------------------------------------------------------------------------
// the scene
// ---------------------------------------------------------------------------------------------
function millRoad(v) {
  const P = PAL[v];
  const day = v === 'day';
  const S = new Scene(day ? 'sbMillRoad' : 'sbMillDusk', day ? '旧磨坊路·第二座里程石：干芦苇间的土路，沟边翻倒的粮车，裂开的木箱透出紫光' : '旧磨坊路·黄昏：远处停工两年的旧磨坊升起炊烟', 5101);
  const R = S.R;
  const pr = persp({ vp: [VPX, HZ], F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const kAt = (Z) => F / Z;

  // --- sky ---------------------------------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(P.sky)}"/>`);
  if (day) {
    // the sun is behind the viewer's left shoulder: warm light pours in from the upper-left corner
    S.add(`<circle cx="-60" cy="-80" r="980" fill="${S.rad([[0, '#fff4d6', 0.75], [0.25, '#ffe8b4', 0.38], [0.6, '#ffe0a0', 0.08], [1, '#ffe0a0', 0]])}"/>`);
  } else {
    S.add(`<circle cx="430" cy="404" r="820" fill="${S.rad([[0, '#fff0c0', 1], [0.07, '#ffd08a', 0.85], [0.25, '#ff9a64', 0.4], [0.6, '#d0607a', 0.12], [1, '#d0607a', 0]])}"/>`);
    S.add(`<circle cx="430" cy="404" r="54" fill="#fff0c8" filter="${S.blur(2)}"/><circle cx="430" cy="404" r="33" fill="#fffaea"/>`);
  }
  const cfar = P.cloudFar, cc = P.cloud;
  S.add(`<g opacity="${day ? 0.75 : 0.8}">${cloud(R, 1010, 302, 230, 34, cfar, { bumps: 5 })}${cloud(R, 1330, 330, 200, 30, cfar, { bumps: 5 })}${cloud(R, 140, 250, 180, 30, cfar, { bumps: 4 })}</g>`);
  S.add(`<path d="${band(560, 1500, 352, 10, R)}" fill="${day ? '#fff4e0' : '#ffc89a'}" opacity=".5"/><path d="${band(980, 1640, 398, 7, R)}" fill="${day ? '#f6ead4' : '#f0a07a'}" opacity=".45"/>`);
  S.add(cloudCluster(R, 1110, 168, 330, 90, cc, { bumps: 6 }));
  S.add(cloud(R, 470, 104, 220, 42, cc, { bumps: 5 }) + cloud(R, 1400, 92, 170, 32, cc, { bumps: 5 }));
  if (day) S.add(`<g filter="${S.blur(3)}">${rays(-60, -80, [[28, 3, 1700], [37, 4, 1700], [46, 3, 1600], [56, 2.5, 1400]], '#fff2cc', 0.16)}</g>`);

  // --- the far land: hazy hills, the knoll with the old mill ---------------------------------------
  S.add(ridge(S, { step: 14, base: 446, amp: 12, period: 240, seed: 701, fill: P.ridge.fill, shade: P.ridge.shade, shadeOp: 0.45, rim: P.ridge.rim, rimOp: 0.6, peaks: [[1340, 34, 300], [230, 24, 260], [560, 14, 160]], bottom: 470 }).svg);
  S.add(`<rect y="396" width="${W}" height="80" fill="${S.lin([[0, P.haze, 0], [0.65, P.haze, day ? 0.5 : 0.55], [1, P.haze, 0]])}"/>`);
  const knoll = `M470,456C560,446,662,398,782,392C902,388,1000,428,1110,456Z`;
  S.add(`<path d="${knoll}" fill="${S.lin(P.knoll, 'gradientUnits="userSpaceOnUse" x1="0" y1="390" x2="0" y2="456"')}"/><path d="M500,452C590,436,676,398,782,392" fill="none" stroke="${P.knollRim}" stroke-width="2" opacity=".65"/>`);
  for (const [x, y, s] of [[640, 420, 0.3], [668, 414, 0.26], [912, 404, 0.28], [944, 410, 0.32], [1010, 426, 0.26]]) S.add(tree(R, x, y, s, P.treeFar));
  const mill = oldMill(796, 396, 0.86, P.mill);
  if (!day) {
    // today's smoke over the mill that has stood idle for two years
    const [cx, cy] = mill.chimney;
    // soft puffs swelling as they rise and lean away on the evening wind, fading toward the top
    let puffs = '', lit = '';
    for (let i = 0; i < 14; i++) {
      const t = i / 13, px = cx + 1 + 140 * t * t + Math.sin(t * 6) * 7, py = cy - 3 - 285 * t, rr = 6 + 31 * t;
      puffs += `M${r0(px - rr)},${r0(py)}a${r0(rr)},${r0(rr)} 0 1 0 ${r0(rr * 2)},0a${r0(rr)},${r0(rr)} 0 1 0 ${r0(-rr * 2)},0`;
      lit += `M${r0(px - rr * 0.85)},${r0(py - rr * 0.2)}a${r0(rr * 0.55)},${r0(rr * 0.55)} 0 1 0 ${r0(rr * 1.1)},0a${r0(rr * 0.55)},${r0(rr * 0.55)} 0 1 0 ${r0(-rr * 1.1)},0`;
    }
    const fade = (c, a) => S.lin([[0, c, 0], [0.3, c, a * 0.75], [1, c, a]], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(cy - 300)}" x2="0" y2="${r0(cy)}"`);
    S.add(`<path d="${smoke(R, cx, cy, 70, 9, 10, 5155)}" fill="#3a2a3e" opacity=".85"/>`);
    S.add(`<g filter="${S.blur(1)}"><path d="${puffs}" fill="${fade('#3a2a40', 0.9)}"/><path d="${lit}" fill="${fade('#b88084', 0.5)}"/></g>`);
  }
  S.add(mill.svg);
  if (!day) {
    let birds = '';
    for (const [x, y, s, fl] of [[700, 300, 0.7, 0.2], [736, 284, 0.6, 0.8], [766, 306, 0.55, 0.5], [640, 318, 0.5, 0.9]]) birds += bird(x, y, s, fl);
    S.add(`<path d="${birds}" fill="#2a1a2e"/>`);
  }
  // the sea of dry reeds reaching the horizon
  S.add(`<path d="M-20,${HZ - 4}C300,${HZ - 7} 900,${HZ - 8} 1620,${HZ - 5}V${HZ + 30}H-20Z" fill="${P.reedSea}"/>`);

  // --- ground: road, shoulders, the ditch -----------------------------------------------------------
  S.add(`<path d="M-20,${HZ}H1620V${H}H-20Z" fill="${S.lin(P.ground, `gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="${H}"`)}"/>`);
  const ZN = 2.2, ZF = 320;
  const gU = `gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="${H}"`;
  S.add(`<path d="${q([[RD, 0, ZN], [RD, 0, ZF], [BK0, 0, ZF], [BK0, 0, ZN]])}" fill="${S.lin(P.verge, gU)}"/>`);
  S.add(`<path d="${q([[REED_L, 0, ZN], [REED_L, 0, ZF], [-RD, 0, ZF], [-RD, 0, ZN]])}" fill="${S.lin(P.verge, gU)}"/>`);
  S.add(`<path d="${q([[-RD, 0, ZN], [-RD, 0, ZF], [RD, 0, ZF], [RD, 0, ZN]])}" fill="${S.lin(P.road, gU)}"/>`);
  // ditch: inner bank (in shade), water at -0.35 m reflecting the sky, the lit outer bank, far verge
  S.add(`<path d="${q([[BK0, 0, ZN], [BK0, 0, ZF], [WT0, -0.35, ZF], [WT0, -0.35, ZN]])}" fill="${P.bankIn}"/>`);
  S.add(`<path d="${q([[WT0, -0.35, ZN], [WT0, -0.35, ZF], [WT1, -0.35, ZF], [WT1, -0.35, ZN]])}" fill="${S.lin(P.water, gU)}"/>`);
  S.add(`<path d="${q([[WT1, -0.35, ZN], [WT1, -0.35, ZF], [BK1, 0, ZF], [BK1, 0, ZN]])}" fill="${P.bankOut}"/>`);
  S.add(`<path d="${q([[BK1, 0, ZN], [BK1, 0, ZF], [REED_R + 0.05, 0, ZF], [REED_R + 0.05, 0, ZN]])}" fill="${S.lin(P.verge, gU)}"/>`);
  // water: reed reflections, a sky glint, the dark lip under the inner bank
  let refl = '';
  for (let i = 0; i < 40; i++) { const Z = 3 + R() ** 1.7 * 60, a = pr(WT1 - R.range(0, 0.15), -0.35, Z), k = kAt(Z); refl += `M${r0(a[0])},${r0(a[1])}l${f(-0.08 * k, 0)},${f(0.05 * k + 1, 0)}`; }
  S.add(`<path d="${refl}" stroke="${P.waterDark}" stroke-width="2" opacity=".35"/>`);
  S.add(`<path d="${q([[WT0, -0.35, ZN], [WT0, -0.35, ZF], [WT0 + 0.32, -0.35, ZF], [WT0 + 0.22, -0.35, ZN]])}" fill="${P.waterDark}" opacity=".3"/>`);
  let rip = '';
  for (let i = 0; i < 26; i++) { const Z = 3 + R() ** 1.6 * 30, p = pr(R.range(WT0 + 0.35, WT1 - 0.1), -0.35, Z), k = kAt(Z); rip += `M${r0(p[0] - 0.12 * k)},${r0(p[1])}h${f(0.24 * k, 0)}`; }
  S.add(`<path d="${rip}" stroke="${P.waterHi}" stroke-width="1.5" stroke-linecap="round" opacity=".45"/>`);
  let lip = '';
  for (let i = 0; i < 70; i++) {
    const Z = 3.2 + R() ** 1.7 * 45, X = R() < 0.65 ? BK0 + R.range(-0.04, 0.04) : BK1 + R.range(-0.04, 0.1), p = pr(X, 0, Z), k = kAt(Z), h = Math.min(30, R.range(0.12, 0.3) * k), d = X > 4 ? -1 : 1;
    lip += `M${r0(p[0])},${r0(p[1])}q${f(d * h * 0.08, 0)},${r0(-h * 0.6)} ${f(d * h * R.range(0.15, 0.35), 0)},${r0(-h)}`;
  }
  S.add(`<path d="${lip}" fill="none" stroke="${day ? '#6e5a36' : '#3e2830'}" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>`);
  S.add(`<path d="${pl(pr.poly([[3.7, -0.35, 3.2], [3.78, -0.35, 40]]))}" stroke="${P.waterHi}" stroke-width="5" opacity=".35"/><path d="${pl(pr.poly([[WT0 + 0.02, -0.35, ZN], [WT0 + 0.02, -0.35, ZF]]))}" stroke="${P.waterDark}" stroke-width="3" opacity=".45"/>`);
  // road: wheel ruts, the cart's tracks swerving off at the milestone, gravel, footprints
  let ruts = '';
  for (const X of [-1.15, 0.15]) ruts += pl(pr.poly([[X, 0, 2.6], [X + 0.02, 0, 120]]));
  S.add(`<path d="${ruts}" stroke="${P.rut}" stroke-width="5" opacity=".42"/>`);
  let swerve = '';
  for (const off of [0, 1.3]) {
    const pts = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10, Z = 6.2 + t * 5.2, X = 0.4 + off + 1.45 * t * t; pts.push(pr(X, 0, Z)); }
    swerve += pl(pts);
  }
  S.add(`<path d="${swerve}" fill="none" stroke="${P.rut}" stroke-width="3.5" opacity=".6"/>`);
  let grv = '', grvHi = '';
  for (let i = 0; i < 230; i++) {
    const Z = 2.6 + R() ** 2.1 * 50, X = R.range(-1.9, 1.9), p = pr(X, 0, Z), k = kAt(Z), rr = R.range(0.018, 0.045) * k;
    grv += `<ellipse cx="${r0(p[0])}" cy="${r0(p[1])}" rx="${f(rr, 1)}" ry="${f(rr * 0.45, 1)}"/>`;
    if (Z < 14 && R() < 0.5) grvHi += `M${r0(p[0] - rr * 0.7)},${r0(p[1] - rr * 0.2)}h${f(rr * 0.9, 1)}`;
  }
  S.add(`<g fill="${P.gravel}" opacity=".65">${grv}</g><path d="${grvHi}" stroke="${P.gravelHi}" stroke-width="1.2" opacity=".55"/>`);
  let prints = '';
  for (let i = 0; i < 14; i++) { const Z = 6 + i * 0.75, X = -0.62 + (i % 2) * 0.26, p = pr(X, 0, Z), k = kAt(Z); prints += `<ellipse cx="${r0(p[0])}" cy="${r0(p[1])}" rx="${f(0.06 * k, 1)}" ry="${f(0.15 * k * EYE / Z, 1)}"/>`; }
  for (let i = 0; i < 18; i++) { const Z = 6.3 + i * 0.52, X = -0.02 + (i % 2) * 0.14, p = pr(X, 0, Z), k = kAt(Z); prints += `<ellipse cx="${r0(p[0])}" cy="${r0(p[1])}" rx="${f(0.032 * k, 1)}" ry="${f(0.08 * k * EYE / Z, 1)}"/>`; }
  S.add(`<g fill="${P.print}" opacity=".62">${prints}</g>`);
  // dry grass on the right shoulder
  let gr = '';
  for (let i = 0; i < 120; i++) {
    const Z = 2.8 + R() ** 1.8 * 40, X = R.range(RD + 0.05, BK0 - 0.05), p = pr(X, 0, Z), k = kAt(Z), h = R.range(0.1, 0.22) * k;
    gr += `M${r0(p[0])},${r0(p[1])}q${f(0.01 * k, 0)},${r0(-h * 0.6)} ${f(R.range(-0.04, 0.09) * k, 0)},${r0(-h)}`;
  }
  S.add(`<path d="${gr}" fill="none" stroke="${day ? '#8a7448' : '#5a3634'}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`);
  // the shade of the left reed wall falls across the near edge of the road (afternoon only)
  if (day) S.add(`<path d="${pz([pr(-1.85, 0, ZN), pr(-1.85, 0, 70), pr(-1.25, 0, 70), pr(-0.95, 0, 14), pr(-0.7, 0, ZN)])}" fill="${P.shadow}" opacity=".26" filter="${S.blur(2)}"/>`);

  // --- reed walls -----------------------------------------------------------------------------------
  S.add(reedWall(S, R, pr, { X: REED_R, h0: 1.85, hv: 0.22, pal: P.rightReed, seed: 5131, xNear: 1660, step: 6, plumeP: 0.5, leafP: 0.12 }).svg);

  // --- the overturned cart, sacks, the cracked crate ----------------------------------------------
  const kC = kAt(11.5), cl = pr(0.85, 0, 11.5);
  const cShadow = day
    ? pz([pr(0.9, 0, 11.5), pr(WT0, -0.3, 11.5), pr(WT0 + 0.9, -0.35, 13.2), pr(1.9, 0, 13.2)])
    : pz([pr(0.9, 0, 11.5), pr(WT0, -0.3, 11.5), pr(WT0 + 1.4, -0.35, 10.1), pr(2.3, 0, 10.1)]);
  S.add(`<path d="${cShadow}" fill="${P.shadow}" opacity="${P.shadowOp}" filter="${S.blur(1)}"/>`);
  S.add(cart(cl[0], cl[1], kC, 9, P));
  const sk1 = pr(-0.25, 0, 10.6), sk2 = pr(2.1, 0, 9.9);
  S.add(sack(sk1[0], sk1[1], kAt(10.6), P, -8, true) + sack(sk2[0], sk2[1], kAt(9.9), P, 6));
  {
    const Z = 9.3, X = 0.52, k = kAt(Z), c = pr(X, 0, Z), cw = 0.74 * k, ch = 0.52 * k, td = 0.12 * k;
    const crate = [];
    if (P.glow) crate.push(`<circle cx="${r0(c[0])}" cy="${r0(c[1] - ch * 0.5)}" r="${r0(2.4 * k)}" fill="${S.rad([[0, '#dcc0ff', 0.55], [0.2, '#a87af0', 0.28], [0.55, '#8a5ad8', 0.08], [1, '#8a5ad8', 0]])}"/>`);
    crate.push(`<ellipse cx="${r0(c[0] + 0.05 * k)}" cy="${r0(c[1])}" rx="${r0(cw * 0.62)}" ry="${r0(0.1 * k)}" fill="${P.shadow}" opacity=".45"/>`);
    // the crate lies askew: front face, thin top, splintered lid board knocked aside
    const g = [];
    g.push(`<path d="${pz([[-cw / 2, 0], [-cw / 2, -ch], [cw / 2, -ch], [cw / 2, 0]])}" fill="${P.wood.mid}"/>`);
    g.push(`<path d="${pz([[-cw / 2, -ch], [cw / 2, -ch], [cw / 2 + td * 0.6, -ch - td], [-cw / 2 + td * 0.6, -ch - td]])}" fill="${P.wood.top}"/>`);
    g.push(`<path d="M${r0(-cw / 2)},${r0(-ch * 0.5)}H${r0(cw / 2)}M${r0(-cw / 2)},${r0(-ch * 0.05)}L${r0(cw / 2)},${r0(-ch * 0.95)}" stroke="${P.wood.shade}" stroke-width="${f(0.04 * k)}"/>`);
    g.push(`<path d="M${r0(-cw / 2 + 2)},${r0(-ch + 2)}V${r0(-2)}" stroke="${P.wood.hi}" stroke-width="${f(0.03 * k)}" opacity=".6"/>`);
    // the crack: a jagged split across the front, crystals inside
    const crack = [[-cw * 0.42, -ch * 0.92], [-cw * 0.18, -ch * 0.64], [-cw * 0.22, -ch * 0.5], [cw * 0.04, -ch * 0.34], [cw * 0.0, -ch * 0.22], [cw * 0.3, -ch * 0.08], [cw * 0.22, -ch * 0.3], [cw * 0.08, -ch * 0.44], [cw * 0.1, -ch * 0.56], [-cw * 0.12, -ch * 0.72], [-cw * 0.1, -ch * 0.84]];
    g.push(`<path d="${pz(crack)}" fill="${P.glow ? '#f2e6ff' : '#160e18'}"/>`);
    if (P.glow) {
      g.push(`<path d="${pz(crack)}" fill="none" stroke="#b58cff" stroke-width="${f(0.05 * k)}" stroke-linejoin="round"/>`);
      g.push(`<path d="${pz([[-cw * 0.14, -ch * 0.62], [-cw * 0.06, -ch * 0.76], [0, -ch * 0.58]])}${pz([[cw * 0.1, -ch * 0.3], [cw * 0.16, -ch * 0.42], [cw * 0.2, -ch * 0.24]])}" fill="#2a1a3a"/>`);
    } else {
      // smothered: the crystals already bundled in cloth on top of the crate, tied with cord
      g.push(`<path d="M${r0(-cw * 0.32)},${r0(-ch - td * 0.4)}q${r0(cw * 0.05)},${r0(-ch * 0.5)} ${r0(cw * 0.34)},${r0(-ch * 0.58)}q${r0(cw * 0.3)},${r0(ch * 0.04)} ${r0(cw * 0.32)},${r0(ch * 0.56)}z" fill="#8a6a6e"/><path d="M${r0(-cw * 0.02)},${r0(-ch - td * 0.4)}q${r0(-cw * 0.06)},${r0(-ch * 0.3)} ${r0(0)},${r0(-ch * 0.6)}" fill="none" stroke="#3a2630" stroke-width="2"/><path d="M${r0(-cw * 0.3)},${r0(-ch - td * 0.6)}q${r0(cw * 0.1)},${r0(-ch * 0.45)} ${r0(cw * 0.3)},${r0(-ch * 0.55)}" fill="none" stroke="${P.wood.hi}" stroke-width="1.5" opacity=".7"/>`);
    }
    g.push(`<path d="M${r0(cw * 0.1)},${r0(-ch - td)}l${r0(cw * 0.52)},${r0(-ch * 0.22)}l${r0(cw * 0.06)},${r0(ch * 0.12)}l${r0(-cw * 0.5)},${r0(ch * 0.24)}z" fill="${P.wood.lit}"/>`);
    crate.push(`<g transform="translate(${r0(c[0])} ${r0(c[1])}) rotate(-9)">${g.join('')}</g>`);
    if (P.glow) {
      // the pulse: light leaking up from the crack and rings spreading over the gravel
      crate.push(`<g fill="none" stroke="#c8a8ff">${[[0.9, 0.5, 3], [1.5, 0.3, 2.2], [2.2, 0.16, 1.6]].map(([rr, op, sw]) => `<ellipse cx="${r0(c[0])}" cy="${r0(c[1] + 0.02 * k)}" rx="${r0(rr * k)}" ry="${r0(rr * k * 0.17)}" stroke-width="${sw}" opacity="${op}"/>`).join('')}</g>`);
      crate.push(`<path d="M${r0(c[0] - 0.06 * k)},${r0(c[1] - ch * 0.62)}l${r0(-0.05 * k)},${r0(-0.6 * k)}M${r0(c[0] + 0.08 * k)},${r0(c[1] - ch * 0.4)}l${r0(0.12 * k)},${r0(-0.5 * k)}" stroke="#e8d8ff" stroke-width="${f(0.08 * k)}" stroke-linecap="round" opacity=".35" filter="${S.blur(1)}"/>`);
      let sparks = '';
      for (let i = 0; i < 9; i++) sparks += `<circle cx="${r0(c[0] + R.range(-0.7, 0.7) * k)}" cy="${r0(c[1] - R.range(0.5, 1.6) * k)}" r="${f(R.range(1.2, 2.6), 1)}"/>`;
      crate.push(`<g fill="#e4d0ff" opacity=".8">${sparks}</g>`);
    } else {
      // one of the torn-off collars left in the road
      crate.push(`<ellipse cx="${r0(c[0] - 0.75 * k)}" cy="${r0(c[1] + 0.12 * k)}" rx="${r0(0.17 * k)}" ry="${r0(0.06 * k)}" fill="none" stroke="#2a1e24" stroke-width="${f(0.04 * k)}"/><path d="M${r0(c[0] - 0.82 * k)},${r0(c[1] + 0.17 * k)}l4,-6l4,6z" fill="#1a1020"/>`);
    }
    S.add(crate.join(''));
  }

  // --- the second milestone -------------------------------------------------------------------------
  {
    const X0 = 2.56, X1 = 3.12, Z0 = 7.5, Z1 = 7.86, Hs = 0.84, Hd = 0.2, k = kAt(Z0), st = P.stone;
    const arch = (Z) => Array.from({ length: 9 }, (_, i) => { const t = i / 8; return pr(X0 + (X1 - X0) * t, Hs + Hd * Math.sin(Math.PI * t) ** 0.8, Z); });
    const b0 = pr(X0, 0, Z0), b1 = pr(X1, 0, Z0);
    // cast shadow
    const sh = day
      ? pz([pr(X0, 0, Z0), pr(X1, 0, Z0), pr(X1, 0, Z1), pr(X1 + 0.85, 0, Z1 + 1.6), pr(X0 + 0.75, 0, Z1 + 1.7)])
      : pz([pr(X0, 0, Z0), pr(X0, 0, Z1), pr(X1, 0, Z1), pr(X1 + 1.9, 0, Z0 - 0.9), pr(X1 + 1.5, 0, Z0 - 1.25)]);
    S.add(`<path d="${sh}" fill="${P.shadow}" opacity="${P.shadowOp + 0.05}" filter="${S.blur(1)}"/>`);
    // pressed grass on the road side of the stone, with black crystal grit caught in it
    let pg = '';
    for (let i = 0; i < 26; i++) { const Z = R.range(6.6, 8.6), X = R.range(1.85, 2.55), p = pr(X, 0, Z), kk = kAt(Z), l = R.range(0.12, 0.26) * kk; pg += `M${r0(p[0])},${r0(p[1])}q${r0(l * 0.5)},${r0(-l * 0.16)} ${r0(l)},${r0(-l * 0.1)}`; }
    S.add(`<path d="${pg}" fill="none" stroke="${day ? '#7a6a40' : '#4a3032'}" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>`);
    let grit = '', glint = '';
    for (let i = 0; i < 9; i++) { const p = pr(R.range(1.9, 2.5), 0, R.range(6.9, 8.2)), s = R.range(2.2, 4.2); grit += `M${r0(p[0])},${r0(p[1] - s)}l${f(s * 0.7, 1)},${f(s, 1)}l${f(-s * 1.3, 1)},${f(-s * 0.2, 1)}z`; glint += `M${r0(p[0])},${r0(p[1] - s)}l1,1.5`; }
    S.add(`<path d="${grit}" fill="#120c1a"/>${day ? `<path d="${glint}" stroke="#d4b8ff" stroke-width="1.4" opacity=".9"/>` : ''}`);
    // the stone: lit left side, front face, the domed top seen from above
    const front = arch(Z0), back = arch(Z1);
    S.add(`<path d="${pz([pr(X0, 0, Z0), pr(X0, Hs, Z0), pr(X0, Hs, Z1), pr(X0, 0, Z1)])}" fill="${st.side}"/>`);
    S.add(`<path d="${pz([...front, ...back.slice().reverse()])}" fill="${st.top}"/>`);
    S.add(`<path d="${pz([b0, ...front, b1])}" fill="${st.front}"/>`);
    S.add(`<path d="${pz([pr(X0 + (X1 - X0) * 0.78, 0, Z0), pr(X0 + (X1 - X0) * 0.78, Hs + 0.06, Z0), ...front.slice(7), b1])}" fill="${st.edge}" opacity=".28"/>`);
    S.add(`<path d="${pl(front)}" fill="none" stroke="${day ? '#fff6e4' : st.side}" stroke-width="2" opacity=".7"/><path d="${pl([pr(X0, 0, Z0), pr(X0, Hs, Z0), front[1]])}" fill="none" stroke="${st.edge}" stroke-width="1.6" opacity=".55"/>`);
    // two carved notches (the second stone), a chipped edge, cracks, lichen, moss at the foot
    const nx = (b0[0] + b1[0]) / 2, ny = b0[1] - k * 0.6;
    S.add(`<path d="M${r0(nx - 0.07 * k)},${r0(ny)}v${r0(0.22 * k)}M${r0(nx + 0.07 * k)},${r0(ny)}v${r0(0.22 * k)}" stroke="${st.groove}" stroke-width="${f(0.045 * k, 1)}" stroke-linecap="round"/><path d="M${r0(nx - 0.07 * k + 0.035 * k)},${r0(ny + 3)}v${r0(0.22 * k - 3)}M${r0(nx + 0.07 * k + 0.035 * k)},${r0(ny + 3)}v${r0(0.22 * k - 3)}" stroke="${st.grooveHi}" stroke-width="1" opacity=".5"/>`);
    S.add(`<path d="M${r0(nx - 0.2 * k)},${r0(ny + 0.36 * k)}l${r0(0.08 * k)},${r0(0.06 * k)}l${r0(-0.02 * k)},${r0(0.1 * k)}M${r0(nx + 0.19 * k)},${r0(ny - 0.14 * k)}l${r0(0.04 * k)},${r0(0.1 * k)}" fill="none" stroke="${st.crack}" stroke-width="1.6" opacity=".7"/>`);
    S.add(`<path d="${pz([front[6], front[7], [front[7][0] - 0.03 * k, front[7][1] + 0.08 * k], [front[6][0] + 0.01 * k, front[6][1] + 0.06 * k]])}" fill="${st.edge}" opacity=".5"/>`);
    let li = '';
    for (let i = 0; i < 12; i++) li += `<circle cx="${r0(b0[0] + R.range(0.08, 0.92) * (b1[0] - b0[0]))}" cy="${r0(b0[1] - R.range(0.05, 0.75) * k)}" r="${f(R.range(1.4, 3.4), 1)}" fill="${st.lichen[i % 2]}"/>`;
    S.add(`<g opacity=".7">${li}</g>`);
    let ms = '';
    for (let i = 0; i < 16; i++) { const x = b0[0] - 0.12 * k + R.range(0, 1.2) * (b1[0] - b0[0] + 0.2 * k), h = R.range(0.05, 0.14) * k; ms += `M${r0(x - 3)},${r0(b0[1] + 2)}q2,${r0(-h * 0.7)} ${r0(R.range(-3, 3))},${r0(-h)}q2,${r0(h * 0.5)} 5,${r0(h)}z`; }
    S.add(`<path d="${ms}" fill="${st.moss}" opacity=".85"/>`);
  }

  // --- the left reed wall (in shade by day, backlit at dusk), framing stalks ---------------------------
  S.add(reedWall(S, R, pr, { X: REED_L, h0: 2.25, hv: 0.3, pal: P.leftReed, seed: 5121, xNear: -70, step: 5, plumeP: 0.55 }).svg);
  {
    // out-of-focus near stalks with plumes at the left edge
    let ns = '', np = '';
    for (const [x, top, lean] of [[-6, 236, 8], [34, 286, 14], [70, 214, 10], [112, 320, 20], [150, 300, 12], [-30, 330, 6]]) {
      ns += `M${x},${H + 10}Q${x + lean * 0.4},${(H + top) / 2} ${x + lean},${top}`;
      np += plume(x + lean, top + 4, 92, 36 + lean, 0.2).body;
    }
    S.add(`<g filter="${S.blur(1)}" opacity=".9"><path d="${ns}" fill="none" stroke="${day ? '#3a2e22' : '#120a14'}" stroke-width="5" stroke-linecap="round"/><path d="${np}" fill="${day ? '#8a7656' : '#4a2a34'}"/></g>`);
  }
  // foreground: low dark tufts on the right shoulder (calm area under the dialogue box)
  let tuft = '';
  for (let i = 0; i < 40; i++) { const y = R.range(700, 920), x = R.range(VPX + (y - HZ) * RD / EYE + 10, VPX + (y - HZ) * BK0 / EYE - 6), h = R.range(12, 28) * (y / 760); tuft += `M${r0(x - 5)},${r0(y)}q2,${r0(-h * 0.6)} ${r0(R.range(-6, 6))},${r0(-h)}q2,${r0(h * 0.5)} 6,${r0(h)}z`; }
  S.add(`<path d="${tuft}" fill="${day ? '#3e3220' : '#1e1218'}" opacity=".5"/>`);

  // --- grading ------------------------------------------------------------------------------------------
  const g = P.grade;
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, g.warm, g.warmOp], [0.5, g.warm, 0], [1, g.cool, g.coolOp]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[day ? 0.55 : 0.45, g.vig, 0], [1, g.vig, g.vigOp]], 'cx="0.5" cy="0.42" r="0.78"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, g.bottom, 0], [1, g.bottom, g.bottomOp]])}"/>`);
  return S.out();
}

export const millBgs = {
  'mill-road-milestone': () => millRoad('day'),
  'mill-road-dusk': () => millRoad('dusk'),
};
