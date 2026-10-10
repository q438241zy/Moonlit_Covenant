// 赫麦村 — one shared layout painted from different distances and in different states
// (day / dusk / burning / ruins). Local origin = the prayer-hall plaza; the slope rises to the left.
import { rng, f, house, bellTower, skeleton, star7, blackFlame, pz, pl, smoke, windmill, waterWheel, tree, mix } from './lib.mjs';

const r0 = (v) => f(v, 0);

// deterministic layout (local units, scale 1 ≈ the aerial view in hemai-day)
const LAYOUT = (() => {
  const R = rng(4021);
  const houses = [];
  const rings = [[110, 7], [170, 10], [235, 12], [300, 13], [370, 12]];
  for (const [rad, n] of rings) {
    for (let i = 0; i < n; i++) {
      const a = (i + R.range(0.2, 0.8)) / n * Math.PI * 2;
      let x = Math.cos(a) * rad * R.range(0.9, 1.1);
      let y = Math.sin(a) * rad * 0.34 * R.range(0.85, 1.15);
      y += x * 0.1; // slope rises toward the left (north-west)
      if (Math.abs(x) < 120 && y > -60 && y < 34) continue; // plaza / hall
      if (x > 120 && x < 230 && y > 0 && y < 60) continue; // road
      const k = 1 + y / 520;
      houses.push({ x, y, w: R.range(40, 58) * k, h: R.range(24, 32) * k, side: x < -20 ? 'l' : 'r', roof: R() < 0.3 ? 'thatch' : 'tile', chim: R() < 0.55, seed: R.int(1, 9999) });
    }
  }
  houses.sort((a, b) => a.y - b.y);
  return { houses, hall: { x: -96, y: -6, w: 116, h: 56 }, tower: { x: 26, y: -2, w: 38, h: 172 }, statue: { x: -34, y: 32 } };
})();

export const VILLAGE_PAL = {
  day: {
    tile: { lit: '#e2ad72', mid: '#c48a55', shade: '#83563a', roof: '#b25c3e', roofShade: '#743a2e', trim: '#4e2e22', win: '#3d2b2a', door: '#4a3024', chimney: '#9a7a66' },
    thatch: { lit: '#e2ad72', mid: '#c48a55', shade: '#83563a', roof: '#d8aa5c', roofShade: '#93703e', trim: '#5e4128', win: '#3d2b2a', door: '#4a3024', chimney: '#9a7a66' },
    stone: { lit: '#efe4cf', mid: '#cbbca4', shade: '#968673', roof: '#6c7596', roofShade: '#4a5272', trim: '#6b5f58', win: '#4a4050', door: '#4a3a3a', hole: '#3a3040', bell: '#c9a35c', star: '#ffd77a' },
    smoke: '#f3eee6', smokeOp: 0.35,
  },
  dusk: {
    tile: { lit: '#e09a6a', mid: '#a96a52', shade: '#5e3a40', roof: '#a8503e', roofShade: '#5a2a34', trim: '#3a2028', win: '#2c2030', winLit: '#ffc070', door: '#3a2228', chimney: '#7a5a5a' },
    thatch: { lit: '#e09a6a', mid: '#a96a52', shade: '#5e3a40', roof: '#c88a52', roofShade: '#6e4a3e', trim: '#3a2028', win: '#2c2030', winLit: '#ffc070', door: '#3a2228', chimney: '#7a5a5a' },
    stone: { lit: '#e8c4a8', mid: '#b08e86', shade: '#6a5260', roof: '#5a5478', roofShade: '#3a3456', trim: '#4a3a46', win: '#3a2a3a', door: '#3a2a30', hole: '#2a2030', bell: '#c9905c', star: '#ffc98a' },
    smoke: '#d8c0c8', smokeOp: 0.3,
  },
  // black flames drained the colour: ash greys with a cold violet cast
  burning: {
    tile: { lit: '#4c4a5a', mid: '#383646', shade: '#22202c', roof: '#45424f', roofShade: '#24222c', trim: '#15141b', win: '#0c0b10', winLit: '#7a2228', door: '#121117', chimney: '#3a3844' },
    thatch: { lit: '#4c4a5a', mid: '#383646', shade: '#22202c', roof: '#454250', roofShade: '#2a2832', trim: '#15141b', win: '#0c0b10', winLit: '#7a2228', door: '#121117', chimney: '#3a3844' },
    stone: { lit: '#7a7888', mid: '#5a586a', shade: '#33313f', roof: '#3a3848', roofShade: '#22202c', trim: '#2a2834', win: '#101016', door: '#141218', hole: '#0a090e', bell: '#4a4652', star: '#8a8696' },
    smoke: '#16141c', smokeOp: 0.7,
  },
  ruins: {
    tile: { lit: '#8e8690', mid: '#6c6672', shade: '#3e3a46', roof: '#3e3a44', roofShade: '#2c2932', trim: '#1e1b22', win: '#1a171e', door: '#1a171e', chimney: '#4e4856' },
    thatch: { lit: '#8e8690', mid: '#6c6672', shade: '#3e3a46', roof: '#4a4450', roofShade: '#33303a', trim: '#1e1b22', win: '#1a171e', door: '#1a171e', chimney: '#4e4856' },
    stone: { lit: '#d6ccc2', mid: '#a49aa0', shade: '#625c6c', roof: '#4a4658', roofShade: '#33303e', trim: '#3a3642', win: '#26222c', door: '#26222c', hole: '#1a1820', bell: '#6a6064', star: '#b0a69a' },
    smoke: '#8e8894', smokeOp: 0.45,
  },
};

// Paint the village. state: day | dusk | burning | ruins. s = scale, (ox, oy) = plaza on screen.
// Returns { back, front, smokes, flames, towerTop } so callers can interleave their own layers.
export function village(S, ox, oy, s, state = 'day', opt = {}) {
  const R = rng(opt.seed || 77);
  const pal = VILLAGE_PAL[state];
  const L = LAYOUT;
  const X = (x) => ox + x * s, Y = (y) => oy + y * s;
  const items = [];
  let shadows = '';
  const chimneys = [];
  const fires = [];
  const ruined = state === 'burning' || state === 'ruins';
  for (const hh of L.houses) {
    if (opt.clip && !opt.clip(X(hh.x), Y(hh.y))) continue;
    const hp = pal[hh.roof];
    const x = X(hh.x) - hh.w * s / 2, y = Y(hh.y), w = hh.w * s, h = hh.h * s;
    const HR = rng(hh.seed);
    shadows += pz([[x - w * 0.05, y + 1], [x + w * 1.9, y + h * 0.18], [x + w * 1.7, y + h * 0.42], [x + w * 0.1, y + h * 0.3]]);
    let svg;
    if (ruined && HR() < (state === 'ruins' ? 0.78 : 0.4)) {
      // collapsed: low wall stumps + charred frame
      svg = `<path d="${pz([[x, y], [x, y - h * 0.4], [x + w * 0.3, y - h * 0.55], [x + w * 0.55, y - h * 0.3], [x + w, y - h * 0.45], [x + w, y]])}" fill="${hp.shade}"/>`
        + skeleton(HR, x + w * 0.05, y - h * 0.2, w * 0.9, h * 1.3, hp.trim, Math.max(1, 2.2 * s));
      if (state === 'burning') fires.push([x + w / 2, y, w * 1.1, h * 2.2]);
    } else {
      const lit = (state === 'dusk' && HR() < 0.6) || (state === 'burning' && HR() < 0.15);
      const o = house(x, y, w, h, { side: hh.side, pal: hp, planks: s > 1.2, chimney: hh.chim && !ruined, lit, windows: s > 0.35 ? 1 : 0, door: s > 0.35, rim: opt.rim });
      svg = o.svg;
      if (o.chimneyTop && !ruined) chimneys.push(o.chimneyTop);
      if (state === 'burning' && HR() < 0.45) fires.push([x + w * 0.5, y - h * 0.6, w * 0.9, h * 1.6]);
    }
    items.push({ y: hh.y, svg });
  }
  // prayer hall
  const hl = L.hall, st = pal.stone;
  {
    const x = X(hl.x), y = Y(hl.y), w = hl.w * s, h = hl.h * s;
    let svg;
    if (ruined) {
      svg = `<path d="${pz([[x, y], [x, y - h * 0.9], [x + w * 0.12, y - h * 1.1], [x + w * 0.22, y - h * 0.7], [x + w * 0.45, y - h * 0.85], [x + w * 0.58, y - h * 0.4], [x + w, y - h * 0.62], [x + w, y]])}" fill="${st.mid}"/>`
        + `<path d="${pz([[x + w * 0.3, y], [x + w * 0.36, y - h * 0.5], [x + w * 0.46, y - h * 0.5], [x + w * 0.5, y]])}" fill="${st.hole}"/>`
        + skeleton(R, x + w * 0.1, y - h * 0.6, w * 0.8, h * 0.8, st.trim, Math.max(1.4, 3 * s));
    } else {
      const o = house(x, y, w, h, { side: 'l', d: w * 0.55, roofH: w * 0.5, pal: { ...st, lit: st.lit, mid: st.mid }, windows: 0, door: false });
      svg = o.svg
        + `<circle cx="${r0(x + w / 2)}" cy="${r0(y - h - w * 0.2)}" r="${f(w * 0.1)}" fill="${state === 'dusk' ? '#ffc98a' : st.win}"/>`
        + `<path d="M${r0(x + w * 0.4)},${r0(y)}V${r0(y - h * 0.5)}A${f(w * 0.1)},${f(w * 0.1)} 0 0 1 ${r0(x + w * 0.6)},${r0(y - h * 0.5)}V${r0(y)}Z" fill="${st.door}"/>`;
    }
    items.push({ y: hl.y, svg });
  }
  // bell tower (broken in burning / ruins)
  const tw = L.tower;
  const tx = X(tw.x), ty = Y(tw.y);
  let towerTop;
  {
    const w = tw.w * s;
    let h = tw.h * s;
    if (ruined) {
      h *= 0.55;
      const t = bellTower(tx, ty, w, h, st, { broken: 1, bell: false });
      const top = ty - h;
      const jag = `<path d="${pz([[tx - w * 0.08, top + 2], [tx + w * 0.2, top - w * 0.4], [tx + w * 0.45, top - w * 0.1], [tx + w * 0.7, top - w * 0.55], [tx + w * 1.08, top + 2]])}" fill="${st.lit}"/>`;
      items.push({ y: tw.y, svg: t.svg + jag });
      towerTop = [tx + w / 2, top];
    } else {
      const t = bellTower(tx, ty, w, h, st, { side: 'r' });
      items.push({ y: tw.y, svg: t.svg });
      towerTop = t.apex;
    }
  }
  // seven-pointed morning-star statue on its pedestal
  {
    const x = X(L.statue.x), y = Y(L.statue.y), k = s;
    let svg = `<path d="${pz([[x - 9 * k, y], [x - 6 * k, y - 16 * k], [x + 6 * k, y - 16 * k], [x + 9 * k, y]])}" fill="${st.mid}"/>`
      + `<path d="${pz([[x + 1 * k, y], [x + 1 * k, y - 16 * k], [x + 6 * k, y - 16 * k], [x + 9 * k, y]])}" fill="${st.shade}"/>`;
    if (state === 'ruins' || state === 'burning') {
      svg += `<path d="${star7(x + 9 * k, y - 4 * k, 10 * k, 0.46, 64)}" fill="${st.star}" opacity=".9"/>`;
    } else {
      svg += `<path d="M${r0(x)},${r0(y - 16 * k)}v${r0(-8 * k)}" stroke="${st.trim}" stroke-width="${f(Math.max(1, 2 * k))}"/>`
        + `<circle cx="${r0(x)}" cy="${r0(y - 36 * k)}" r="${f(12.5 * k)}" fill="none" stroke="${st.star}" stroke-width="${f(Math.max(0.8, 1.6 * k))}"/>`
        + `<path d="${star7(x, y - 36 * k, 11 * k)}" fill="${st.star}"/>`;
    }
    items.push({ y: L.statue.y, svg });
  }
  items.sort((a, b) => a.y - b.y);
  // chimney smoke (day / dusk) — returned separately so the caller can blur it
  let smokes = '';
  if (!ruined) {
    let k = 0;
    for (const [cx, cy] of chimneys) {
      if (R() < 0.45) continue;
      smokes += smoke(R, cx, cy, R.range(40, 80) * s, 7 * s, 30 * s, 300 + k++);
    }
  }
  return { svg: items.map((i) => i.svg).join(''), shadows, smokes, fires, towerTop, tower: [tx, ty, tw.w * s, tw.h * s], hall: [X(hl.x), Y(hl.y), hl.w * s, hl.h * s] };
}

export const STATIC = { windmill, waterWheel, tree };

// Houses lining both sides of the village main road (ridge parallel to the road), for street-level scenes.
// state: 'dusk' | 'burning'. Returns { svg, rows } (rows carry geometry for flames / props).
export function streetRows(S, pr, R, state = 'dusk') {
  const burning = state === 'burning';
  const rows = [];
  const out = [];
  const L = [[5.5, 10.5], [11.5, 16], [17, 22.5], [24, 29], [30, 35], [36.5, 41], [42, 47], [48.5, 53]];
  const Rr = [[5, 9.5], [10.5, 15.5], [17.5, 22], [23, 28.5], [30, 34], [35.5, 40.5], [42, 46.5], [48, 52]];
  for (const [i, [z0, z1]] of L.entries()) rows.push({ side: -1, z0, z1, i });
  for (const [i, [z0, z1]] of Rr.entries()) rows.push({ side: 1, z0, z1, i });
  for (const r of rows) {
    r.h = i0(r) < 2 ? 3.2 : R.range(2.7, 4.3);
    r.xi = (i0(r) < 2 ? 4.4 : R.range(4.4, 5.3)) * r.side;
    r.roof = R.pick(['tile', 'tile', 'thatch', 'slate']);
    r.pitch = R.range(1.9, 2.8);
  }
  function i0(r) { return r.i; }
  rows.sort((a, b) => b.z0 - a.z0);
  const roofCols = { tile: ['#a04a3c', '#5a2a36'], thatch: ['#c8925a', '#6a4a3e'], slate: ['#6a5a7a', '#3a3048'] };
  for (const r of rows) {
    const sg = r.side, xi = r.xi, xo = xi + 5.6 * sg, xm = xi + 2.8 * sg;
    const ridgeY = r.h + r.pitch;
    const haze = Math.min(1, (r.z0 - 5) / 48);
    const litSide = sg > 0;
    const C = burning
      ? { wl: '#57546a', ws: '#24222e', rl: '#3a3846', rs: '#16141c', gl: '#45424f', gs: '#1c1a24', hz: '#3a3646', ink: '#0a090e', rim: '#aaa6c0', rimS: '#6a6680' }
      : { wl: '#dc946c', ws: '#5e3e5a', rl: roofCols[r.roof][0], rs: roofCols[r.roof][1], gl: '#9a5a68', gs: '#43294a', hz: '#8a5a76', ink: '#2a1a26', rim: '#ffc898', rimS: '#c88a9a' };
    const wall = mix(litSide ? C.wl : C.ws, C.hz, haze * 0.6);
    const roof = mix(litSide ? C.rl : C.rs, burning ? '#3a3646' : '#5a3a5a', haze * 0.55);
    const gable = mix(litSide ? C.gl : C.gs, burning ? '#3e3a4c' : '#6a4466', haze * 0.6);
    const ink = mix(C.ink, burning ? '#2a2834' : '#5a3a56', haze * 0.6);
    r.ruin = burning && (r.i % 3 === 1);
    // front gable end (faces the camera) + its eave boards and timber cross
    out.push(`<path d="${pz(pr.poly([[xo, 0, r.z0], [xo, r.h, r.z0], [xm, ridgeY, r.z0], [xi, r.h, r.z0], [xi, 0, r.z0]]))}" fill="${gable}"/>`);
    out.push(`<path d="${pl(pr.poly([[xo + 0.3 * sg, r.h - 0.25, r.z0 - 0.3], [xm, ridgeY + 0.15, r.z0 - 0.3], [xi - 0.35 * sg, r.h - 0.2, r.z0 - 0.3]]))}${pl(pr.poly([[xi, r.h, r.z0], [xo, r.h, r.z0]]))}${pl(pr.poly([[xm, ridgeY, r.z0], [xm, 0, r.z0]]))}" fill="none" stroke="${ink}" stroke-width="${f(Math.max(1.2, 70 / r.z0))}" stroke-linejoin="round"/>`);
    out.push(`<path d="${pz(pr.poly([[xm - 0.5 * sg, 1.2, r.z0], [xm - 0.5 * sg, 2, r.z0], [xm - 1.3 * sg, 2, r.z0], [xm - 1.3 * sg, 1.2, r.z0]]))}" fill="${burning ? '#0c0b10' : (r.i + sg) % 3 ? '#2e2034' : '#ffbe6a'}"/>`);
    // street facade
    out.push(`<path d="${pr.quad([[xi, 0, r.z0], [xi, r.h, r.z0], [xi, r.h, r.z1], [xi, 0, r.z1]])}" fill="${wall}"/>`);
    // roof plane facing the street
    out.push(`<path d="${pr.quad([[xm, ridgeY, r.z0 - 0.3], [xi - 0.35 * sg, r.h - 0.2, r.z0 - 0.3], [xi - 0.35 * sg, r.h - 0.2, r.z1 + 0.3], [xm, ridgeY, r.z1 + 0.3]])}" fill="${roof}"/>`);
    out.push(`<path d="${pl(pr.poly([[xi - 0.35 * sg, r.h - 0.2, r.z0 - 0.3], [xm, ridgeY, r.z0 - 0.3], [xm, ridgeY, r.z1 + 0.3]]))}" fill="none" stroke="${litSide ? C.rim : C.rimS}" stroke-width="${f(Math.max(1, 34 / r.z0))}" opacity=".75"/>`);
    // timber posts + door + windows on the street facade
    const len = r.z1 - r.z0;
    let tim = '', win = '';
    for (const t of [0, 0.5, 1]) tim += pl(pr.poly([[xi, 0, r.z0 + len * t], [xi, r.h, r.z0 + len * t]]));
    tim += pl(pr.poly([[xi, r.h * 0.58, r.z0], [xi, r.h * 0.58, r.z1]]));
    const glow = burning ? (r.z0 > 30 && sg < 0 && r.i % 2 === 0) : (r.i * 7 + (sg > 0 ? 3 : 0)) % 5 < 3;
    const wins = r.i === 0 && sg < 0 ? [[0.12, 0.28]] : [[0.1, 0.26], [0.66, 0.82]];
    for (const [a, b] of wins) win += `<path d="${pr.quad([[xi, 1.3, r.z0 + len * a], [xi, 2.2, r.z0 + len * a], [xi, 2.2, r.z0 + len * b], [xi, 1.3, r.z0 + len * b]])}" fill="${glow ? '#ffc070' : burning ? '#0c0b10' : '#2e2034'}"/>`;
    if (r.h > 3.7) win += `<path d="${pr.quad([[xi, r.h - 1.1, r.z0 + len * 0.3], [xi, r.h - 0.4, r.z0 + len * 0.3], [xi, r.h - 0.4, r.z0 + len * 0.42], [xi, r.h - 1.1, r.z0 + len * 0.42]])}" fill="${burning ? '#0c0b10' : glow ? '#2e2034' : '#ffc070'}"/>`;
    win += `<path d="${pr.quad([[xi, 0, r.z0 + len * 0.36], [xi, 2.1, r.z0 + len * 0.36], [xi, 2.1, r.z0 + len * 0.5], [xi, 0, r.z0 + len * 0.5]])}" fill="#2a1a28"/>`;
    out.push(`<path d="${tim}" stroke="${ink}" stroke-width="${f(Math.max(1, 60 / r.z0))}" opacity=".75"/>` + win);
  }
  return { svg: out.join(''), rows };
}
