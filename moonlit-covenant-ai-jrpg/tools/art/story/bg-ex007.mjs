// 番外 ex007 的场景背景（剧本/番外/ex007影市砍價記.md〈美術需求〉）：fog-harbor-market-day（雾港·市集·白天）、fog-harbor-shadow-market（雾港·影市）。
//   fog-harbor-market-day    — 雾港·市集·白天: a plank quay running away from us along a tidal channel. On the left, under the
//                              upper floors of the harbour houses, a row of market stalls: striped awnings seen from below
//                              with scalloped hems, plank counters heaped with coils of rope, fish baskets (鱼篓), cabbages
//                              and onions, oil barrels and stacked crates. On the right, the channel — flat water with
//                              current streaks and a few floating cabbage leaves — a moored skiff with crates, the quay
//                              railing with a mooring line, a tide-lamp post; across the water the stilt houses of the far
//                              bank, a second wooden trestle bridge spanning the channel, and the harbour fading into a thin
//                              fog. Bunting strung across the water. Morning light from the upper left. No figures, no text.
//   fog-harbor-shadow-market — 雾港·影市: see shadowMarket().
// Water is flat colour with current streaks, never a reflection (coast.mjs house rules); no figures, no readable text.
import { Scene, W, H, f, pz, pl, persp, mix, rng } from './lib.mjs';
import { currents, tideLamp, sag } from './coast.mjs';

const r0 = (v) => f(v, 0);

// ---------------------------------------------------------------------------------------------------------------------
// 雾港·市集·白天
// ---------------------------------------------------------------------------------------------------------------------
const M = {
  sky: [[0, '#b8c2c4'], [0.45, '#d8d8cc'], [1, '#ece4d0']],
  fog: '#e2ddcc', far: '#9aa096',
  water: '#6e8078', waterFar: '#a2aea4', waterDeep: '#4a5c54', waterHi: '#d6dccc',
  wood: { lit: '#a8947a', mid: '#82705c', shade: '#5a4c40', deep: '#3a3028', line: '#463a30' },
  plank: { lit: '#b4a284', mid: '#8e7c64', shade: '#66584a', joint: '#463c32' },
  plaster: ['#e2d8c4', '#c4b8a2', '#9a8e7a'], board: ['#9a8a74', '#7a6c5c', '#5a5046'],
  roof: ['#5e6268', '#7a7e86', '#3e4248'], roofRed: ['#8e5a48', '#a8705a', '#64402e'],
  glass: '#46505a', glassHi: '#a8b4bc', shutters: ['#5a7076', '#7a6a50', '#6a5a6e', '#4e6a5a'],
  rope: '#b8a47e', ropeShade: '#7a6a4e', basket: '#a88a58', basketShade: '#6e5a3a',
  cabbage: ['#8aa860', '#6a8a48', '#b0c880'], onion: ['#c89a5a', '#a8703e'], fish: '#b8c4c4', fishShade: '#7e8a8e',
  barrel: { lit: '#9a7a54', mid: '#765c40', shade: '#4e3c2a', hoop: '#3a3a38' },
  crate: { lit: '#b09a74', mid: '#8a7656', shade: '#5e503c' },
  iron: '#2e3032', lamp: { iron: '#2e3032', glass: '#56606a', glint: '#c8d4dc', glow: '#ffd28a', core: '#fff2c8' },
  awnings: [['#b05a48', '#e8dcc4'], ['#4e7690', '#e8dcc4'], ['#c8964a', '#e8dcc4'], ['#5e8a64', '#e8dcc4']],
  flags: ['#b05a48', '#e0b450', '#4e7690', '#e8dcc4', '#5e8a64'],
};

function marketDay() {
  const S = new Scene('sbEx7Market', '雾港·市集·白天：沿水道的木栈道伸向远处，左边一排市集摊位挤在港屋底下，条纹遮阳布从下面看得见荷叶边，木柜台上堆着一盘盘麻绳、鱼篓、包心菜和洋葱，摊前摆着油桶和叠起来的木箱；右边是水道，平静的水面漂着几片菜叶，系着一条装货的小船，栈道的栏杆、缆绳和潮灯柱；对岸是高脚屋，远处第二座木栈桥横过水道，港口隐在薄雾里；水上拉着一串小旗；早上的光从左上来，不画人，不写字', 70701);
  const R = rng(70702);
  const VP = [900, 380], F = 950, EYE = 1.65;
  const pr = persp({ vp: VP, F, eye: EYE });
  const P = (x, y, z) => pr(x, y, z);
  const Q = (pts) => pz(pts.map((p) => P(...p)));
  const L = (pts) => pl(pts.map((p) => P(...p)));
  const XH = -5.7, XC = -3.55, XA = -3.15, YA = 2.3, YB = 2.95, YC = 0.9; // house wall, counter front, awning front
  const XE = 1.8, WY = -0.6, XR = 9.6, ZB = 26; // quay edge, water level, far bank, far bridge
  const fogK = (z) => Math.min(0.75, Math.max(0, (z - 9) / 26));
  const fc = (c, z) => mix(c, M.fog, fogK(z));

  // --- sky, the far harbour --------------------------------------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(M.sky, `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${VP[1] + 40}"`)}"/>`);
  S.add(`<ellipse cx="260" cy="70" rx="640" ry="240" fill="${S.rad([[0, '#fff6e2', 0.7], [1, '#fff6e2', 0]])}"/>`);
  {
    // far stilt houses beyond the bridge: flat silhouettes, two depths
    for (const [z, t, seed] of [[60, 0.62, 70703], [40, 0.4, 70704]]) {
      const Rf = rng(seed), col = mix(M.far, M.fog, t);
      let d = '', pil = '';
      const base = P(0, 0.4, z)[1], k = 30 / z;
      for (let x = 560; x < 1600;) {
        const w = Rf.range(50, 110) * k, h = Rf.range(40, 90) * k;
        d += `M${r0(x)},${r0(base)}V${r0(base - h)}l${r0(w * 0.5)},${r0(-h * 0.32)}l${r0(w * 0.5)},${r0(h * 0.32)}V${r0(base)}Z`;
        for (let i = 0; i < 3; i++) pil += `M${r0(x + w * (0.15 + i * 0.35))},${r0(base)}v${r0(16 * k)}`;
        x += w + Rf.range(6, 40) * k;
      }
      S.add(`<path d="${d}" fill="${col}"/><path d="${pil}" stroke="${col}" stroke-width="2"/>`);
    }
    // two masts out past the bridge
    for (const [x, z, h] of [[4.5, 48, 8], [8.0, 56, 10]]) { const a = P(x, WY, z), b = P(x, h, z); S.add(`<path d="M${r0(a[0])},${r0(a[1])}V${r0(b[1])}M${r0(a[0] - 10)},${r0(b[1] + 16)}h20" stroke="${mix(M.far, M.fog, 0.45)}" stroke-width="2"/>`); }
    S.add(`<rect x="0" y="${VP[1] - 50}" width="${W}" height="90" fill="${S.lin([[0, M.fog, 0], [0.55, M.fog, 0.75], [1, M.fog, 0.2]])}"/>`);
  }

  // --- the channel ----------------------------------------------------------------------------------------------------
  {
    const top = P(0, WY, 80)[1];
    S.add(`<path d="M520,${r0(top)}H${W}V${H}H520Z" fill="${S.lin([[0, M.waterFar], [0.3, M.water], [1, M.waterDeep]], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(top)}" x2="0" y2="${H}"`)}"/>`);
    S.add(currents(rng(70705), 900, 1600, top + 4, 900, 70, M.waterHi, 0.35, 1));
  }

  // --- the far bank: stilt houses facing us across the water -------------------------------------------------------------
  {
    const Rb = rng(70706);
    const list = [];
    for (let z = 15; z < ZB; ) { const w = Rb.range(2.6, 4.2); list.push([z, z + w]); z += w + Rb.range(0.1, 0.6); }
    for (const [z0, z1] of list.reverse()) {
      const zm = (z0 + z1) / 2, h = Rb.range(4.2, 6.4), y0 = 0.5;
      const pal = Rb() < 0.5 ? M.plaster : M.board;
      // piles into the water
      let pp = '';
      for (let z = z0 + 0.2; z < z1; z += 0.9) pp += L([[XR, y0, z], [XR, WY, z]]);
      S.add(`<path d="${pp}" stroke="${fc(M.wood.shade, zm)}" stroke-width="${f(Math.max(2, 0.16 * F / zm), 1)}"/>`);
      // the gable end toward us (in shade), the front over the water, the roof rising to a ridge along the house
      const D = 2.6, XG = XR + D / 2, roof = Rb() < 0.6 ? M.roof : M.roofRed;
      S.add(`<path d="${Q([[XR, y0, z0], [XR, h, z0], [XG, h + 1.5, z0], [XR + D, h, z0], [XR + D, y0, z0]])}" fill="${fc(pal[2], zm)}"/>`);
      S.add(`<path d="${Q([[XR, y0, z0], [XR, h, z0], [XR, h, z1], [XR, y0, z1]])}" fill="${fc(pal[1], zm)}"/>`);
      S.add(`<path d="${Q([[XR - 0.3, h - 0.25, z0 - 0.2], [XR - 0.3, h - 0.25, z1 + 0.15], [XG, h + 1.5, z1 + 0.15], [XG, h + 1.5, z0 - 0.2]])}" fill="${fc(roof[0], zm)}"/>`);
      S.add(`<path d="${L([[XR - 0.3, h - 0.25, z0 - 0.2], [XG, h + 1.5, z0 - 0.2], [XR + D + 0.3, h - 0.25, z0 - 0.2]])}" fill="none" stroke="${fc(roof[2], zm)}" stroke-width="${f(Math.max(2, 0.14 * F / zm), 1)}"/><path d="${L([[XR - 0.3, h - 0.25, z0 - 0.2], [XR - 0.3, h - 0.25, z1 + 0.15]])}" stroke="${fc(M.wood.deep, zm)}" stroke-width="3"/>`);
      let wn = '';
      for (const yy of [1.4, 3.2]) for (let z = z0 + 0.5; z < z1 - 0.7; z += 1.3) if (yy + 1 < h) wn += Q([[XR, yy, z], [XR, yy + 0.9, z], [XR, yy + 0.9, z + 0.6], [XR, yy, z + 0.6]]);
      S.add(`<path d="${wn}" fill="${fc(M.glass, zm)}"/>`);
    }
  }

  // --- the far bridge spanning the channel -----------------------------------------------------------------------------
  {
    const z = ZB, c = (col) => mix(col, M.fog, 0.45);
    let legs = '';
    for (const x of [-4.6, -1.0, 2.6, 6.2, 9.8]) {
      legs += L([[x - 0.25, 2.1, z], [x - 0.25, WY, z]]) + L([[x + 0.25, 2.1, z], [x + 0.25, WY, z]]);
      legs += L([[x - 1.6, 2.1, z], [x + 0.25, 0.2, z]]) + L([[x + 1.6, 2.1, z], [x - 0.25, 0.2, z]]);
    }
    S.add(`<path d="${legs}" stroke="${c(M.wood.shade)}" stroke-width="5"/>`);
    S.add(`<path d="${Q([[-7, 2.1, z], [12, 2.1, z], [12, 2.5, z], [-7, 2.5, z]])}" fill="${c(M.wood.mid)}"/><path d="${L([[-7, 2.5, z], [12, 2.5, z]])}" stroke="${c(M.wood.lit)}" stroke-width="2"/>`);
    let rail = '';
    for (let x = -6.6; x < 12; x += 0.9) rail += L([[x, 2.5, z], [x, 3.25, z]]);
    rail += L([[-7, 3.25, z], [12, 3.25, z]]) + L([[-7, 2.9, z], [12, 2.9, z]]);
    S.add(`<path d="${rail}" stroke="${c(M.wood.shade)}" stroke-width="2.4"/>`);
    // lanterns and a few hanging baskets under the bridge rail
    let hb = '';
    for (const x of [-2.2, 3.4, 7.4]) { const a = P(x, 2.1, z); hb += `M${r0(a[0] - 6)},${r0(a[1] + 6)}h12l-3,12h-6z`; }
    S.add(`<path d="${hb}" fill="${c(M.basket)}"/>`);
  }

  // --- the left houses above the stalls --------------------------------------------------------------------------------
  {
    const Rh = rng(70707);
    const list = [];
    for (let z = 1.2; z < ZB; ) { const w = z < 8 ? Rh.range(3.2, 4.4) : Rh.range(2.4, 3.6); list.push([z, z + w]); z += w + 0.05; }
    for (const [z0, z1] of list.reverse()) {
      const zm = (z0 + z1) / 2, h = Rh.range(6.0, 8.2), gable = Rh() < 0.45;
      const pal = Rh() < 0.55 ? M.plaster : M.board, roof = Rh() < 0.7 ? M.roof : M.roofRed;
      const face = [[XH, 0, z0], [XH, h, z0], [XH, h, z1], [XH, 0, z1]];
      S.add(`<path d="${Q(face)}" fill="${fc(pal[0], zm)}"/>`);
      // the far half of each front a shade darker, the board seams or timber
      S.add(`<path d="${Q([[XH, 0, zm + (z1 - zm) * 0.4], [XH, h, zm + (z1 - zm) * 0.4], [XH, h, z1], [XH, 0, z1]])}" fill="${fc(pal[1], zm)}" opacity=".45"/>`);
      let tb = L([[XH, YB + 0.15, z0], [XH, YB + 0.15, z1]]) + L([[XH, 4.9, z0], [XH, 4.9, z1]]) + L([[XH, 0, z0 + 0.05], [XH, h, z0 + 0.05]]);
      S.add(`<path d="${tb}" stroke="${fc(M.wood.deep, zm)}" stroke-width="${f(Math.max(1.5, 0.12 * F / zm), 1)}"/>`);
      if (gable) {
        S.add(`<path d="${Q([[XH, h, z0], [XH, h + 1.6, zm], [XH, h, z1]])}" fill="${fc(pal[0], zm)}"/><path d="${L([[XH + 0.12, h - 0.05, z0 - 0.15], [XH + 0.12, h + 1.65, zm], [XH + 0.12, h - 0.05, z1 + 0.15]])}" fill="none" stroke="${fc(roof[0], zm)}" stroke-width="${f(Math.max(3, 0.28 * F / zm), 1)}"/>`);
        const a = P(XH, h + 0.5, zm - 0.25), b = P(XH, h + 1.0, zm + 0.25);
        S.add(`<path d="M${r0(a[0])},${r0(a[1])}H${r0(b[0])}V${r0(b[1])}H${r0(a[0])}Z" fill="${fc(M.glass, zm)}"/>`);
      } else {
        S.add(`<path d="${Q([[XH + 0.45, h, z0 - 0.1], [XH - 2.2, h + 1.7, z0 - 0.1], [XH - 2.2, h + 1.7, z1 + 0.1], [XH + 0.45, h, z1 + 0.1]])}" fill="${fc(roof[0], zm)}"/>`);
        S.add(`<path d="${Q([[XH + 0.45, h - 0.18, z0 - 0.1], [XH + 0.45, h, z0 - 0.1], [XH + 0.45, h, z1 + 0.1], [XH + 0.45, h - 0.18, z1 + 0.1]])}" fill="${fc(M.wood.deep, zm)}"/>`);
      }
      // windows on the upper floors, shutters, a flower box now and then
      let gl = '', sh = '', hi = '', bx = '';
      const shc = M.shutters[Math.floor(Rh() * M.shutters.length)];
      for (const [ya, yb] of [[3.45, 4.5], [5.4, 6.4]]) {
        if (yb > h - 0.3) continue;
        const n = Math.max(1, Math.round((z1 - z0) / 1.6));
        for (let i = 0; i < n; i++) {
          const zc = z0 + (z1 - z0) * (i + 0.5) / n, ww = 0.32;
          gl += Q([[XH, ya, zc - ww], [XH, yb, zc - ww], [XH, yb, zc + ww], [XH, ya, zc + ww]]);
          hi += Q([[XH, yb - 0.1, zc - ww + 0.04], [XH, yb - 0.1, zc - ww + 0.2], [XH, ya + 0.4, zc - ww + 0.04]]);
          sh += Q([[XH, ya, zc - ww - 0.3], [XH, yb, zc - ww - 0.3], [XH, yb, zc - ww - 0.04], [XH, ya, zc - ww - 0.04]]);
          sh += Q([[XH, ya, zc + ww + 0.04], [XH, yb, zc + ww + 0.04], [XH, yb, zc + ww + 0.3], [XH, ya, zc + ww + 0.3]]);
          if ((i + Math.round(z0)) % 2 === 0) bx += Q([[XH + 0.12, ya - 0.18, zc - ww - 0.05], [XH + 0.12, ya, zc - ww - 0.05], [XH + 0.12, ya, zc + ww + 0.05], [XH + 0.12, ya - 0.18, zc + ww + 0.05]]);
        }
      }
      S.add(`<path d="${gl}" fill="${fc(M.glass, zm)}"/><path d="${hi}" fill="${fc(M.glassHi, zm)}" opacity=".4"/><path d="${sh}" fill="${fc(shc, zm)}"/><path d="${bx}" fill="${fc(M.wood.shade, zm)}"/>`);
      if (bx && zm < 14) {
        let fl = '';
        for (const m of bx.matchAll(/M(-?\d+),(-?\d+)L(-?\d+),(-?\d+)L(-?\d+),(-?\d+)/g)) {
          const x0 = +m[1], y0 = +m[4], x1 = +m[5];
          for (let t = 0.15; t < 1; t += 0.23) fl += `<circle cx="${r0(x0 + (x1 - x0) * t)}" cy="${r0(y0 - 2)}" r="${f(Math.max(2, 46 / zm), 1)}" fill="${['#c85a5a', '#e8c050', '#e8e0d0', '#c87aa0'][Math.round(t * 7) % 4]}"/>`;
        }
        S.add(fl);
      }
    }
  }

  // --- the quay deck ---------------------------------------------------------------------------------------------------
  {
    S.add(`<path d="${Q([[XH, 0, 1.5], [XH, 0, ZB], [XE, 0, ZB], [XE, 0, 1.5]])}" fill="${S.lin([[0, mix(M.plank.mid, M.fog, 0.4)], [0.25, M.plank.mid], [1, M.plank.shade]], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(P(0, 0, ZB)[1])}" x2="0" y2="${H}"`)}"/>`);
    let seams = '', lit = '';
    for (let z = 1.6, k = 0; z < ZB; z += 0.36 * (1 + z / 30), k++) {
      seams += L([[XC + 0.6, 0, z], [XE, 0, z]]);
      if (k % 3 === 0) lit += L([[XC + 0.6, 0, z + 0.05], [XE, 0, z + 0.05]]);
    }
    S.add(`<path d="${seams}" stroke="${M.plank.joint}" stroke-width="1.4" opacity=".6"/><path d="${lit}" stroke="${M.plank.lit}" stroke-width="1.2" opacity=".35"/>`);
    // the edge timber along the water
    S.add(`<path d="${Q([[XE, 0, 1.5], [XE, 0.14, 1.5], [XE, 0.14, ZB], [XE, 0, ZB]])}" fill="${M.wood.mid}"/><path d="${L([[XE - 0.2, 0.14, 1.5], [XE - 0.2, 0.14, ZB]])}" stroke="${M.plank.lit}" stroke-width="2" opacity=".6"/>`);
  }

  // --- small helpers for props -----------------------------------------------------------------------------------------
  // an axis box; shows the near (−z) face, the top if below the eye, and the side that faces the camera
  const box = (x0, x1, y0, y1, z0, z1, c) => {
    let s = `<path d="${Q([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]])}" fill="${c.mid}"/>`;
    if (y1 < EYE) s += `<path d="${Q([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])}" fill="${c.lit}"/>`;
    if (x1 < 0) s += `<path d="${Q([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]])}" fill="${c.shade}"/>`;
    else if (x0 > 0) s += `<path d="${Q([[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]])}" fill="${c.shade}"/>`;
    return s;
  };
  const crate = (x, y, z, s) => {
    const c = M.crate;
    let o = box(x, x + s, y, y + s * 0.8, z, z + s, c);
    const a = P(x, y, z), b = P(x + s, y + s * 0.8, z);
    o += `<path d="M${r0(a[0])},${r0(a[1])}L${r0(b[0])},${r0(b[1])}M${r0(a[0])},${r0(b[1])}L${r0(b[0])},${r0(a[1])}M${r0(a[0])},${r0((a[1] + b[1]) / 2)}H${r0(b[0])}" stroke="${c.shade}" stroke-width="${f(Math.max(1.2, 0.05 * F / z), 1)}"/>`;
    return o;
  };
  const ell = (x, y, z, rw) => { const [cx, cy] = P(x, y, z), rx = rw * F / z, ry = rx * Math.min(0.55, Math.max(0.14, Math.abs(EYE - y) / z * 1.4)); return { cx, cy, rx, ry }; };
  const coil = (x, y, z, rw) => {
    const e = ell(x, y, z, rw);
    let o = '';
    for (let k = 0; k < 4; k++) o += `<ellipse cx="${r0(e.cx)}" cy="${r0(e.cy - k * e.ry * 0.5)}" rx="${r0(e.rx * (1 - k * 0.12))}" ry="${f(e.ry * (1 - k * 0.12), 1)}"/>`;
    return `<g fill="none" stroke="${M.rope}" stroke-width="${f(Math.max(1.6, e.rx * 0.16), 1)}">${o}</g><ellipse cx="${r0(e.cx)}" cy="${r0(e.cy)}" rx="${r0(e.rx)}" ry="${f(e.ry, 1)}" fill="none" stroke="${M.ropeShade}" stroke-width="${f(Math.max(1, e.rx * 0.08), 1)}"/>`;
  };
  const basket = (x, y, z, rw, hh, fill) => {
    const e = ell(x, y + hh, z, rw), b = P(x, y, z);
    const w0 = e.rx, w1 = e.rx * 0.78;
    let o = `<path d="M${r0(e.cx - w0)},${r0(e.cy)}L${r0(b[0] - w1)},${r0(b[1])}Q${r0(b[0])},${r0(b[1] + e.ry * 0.8)} ${r0(b[0] + w1)},${r0(b[1])}L${r0(e.cx + w0)},${r0(e.cy)}Z" fill="${M.basket}"/>`;
    let wv = '';
    for (let t = 0.25; t < 1; t += 0.25) { const yy = e.cy + (b[1] - e.cy) * t, ww = w0 + (w1 - w0) * t; wv += `M${r0(e.cx - ww)},${r0(yy)}Q${r0(e.cx)},${r0(yy + e.ry * 0.6)} ${r0(e.cx + ww)},${r0(yy)}`; }
    o += `<path d="${wv}" fill="none" stroke="${M.basketShade}" stroke-width="${f(Math.max(1, rw * F / z * 0.06), 1)}"/>`;
    o += `<ellipse cx="${r0(e.cx)}" cy="${r0(e.cy)}" rx="${r0(e.rx)}" ry="${f(e.ry, 1)}" fill="${fill}" stroke="${M.basketShade}" stroke-width="${f(Math.max(1, e.rx * 0.08), 1)}"/>`;
    return o;
  };
  const barrel = (x, z, rw, hh) => {
    const c = M.barrel, top = ell(x, hh, z, rw), bot = P(x, 0, z);
    const bw = top.rx * 1.06;
    let o = `<path d="M${r0(top.cx - top.rx)},${r0(top.cy)}Q${r0(top.cx - bw * 1.1)},${r0((top.cy + bot[1]) / 2)} ${r0(bot[0] - top.rx)},${r0(bot[1])}Q${r0(bot[0])},${r0(bot[1] + top.ry)} ${r0(bot[0] + top.rx)},${r0(bot[1])}Q${r0(top.cx + bw * 1.1)},${r0((top.cy + bot[1]) / 2)} ${r0(top.cx + top.rx)},${r0(top.cy)}Z" fill="${c.mid}"/>`;
    o += `<path d="M${r0(top.cx - top.rx * 0.7)},${r0(top.cy + 2)}Q${r0(top.cx - bw * 0.9)},${r0((top.cy + bot[1]) / 2)} ${r0(bot[0] - top.rx * 0.65)},${r0(bot[1])}" fill="none" stroke="${c.lit}" stroke-width="${f(Math.max(2, top.rx * 0.25), 1)}" opacity=".7"/>`;
    let hp = '';
    for (const t of [0.22, 0.78]) { const yy = top.cy + (bot[1] - top.cy) * t; hp += `M${r0(top.cx - bw)},${r0(yy)}Q${r0(top.cx)},${r0(yy + top.ry * 1.1)} ${r0(top.cx + bw)},${r0(yy)}`; }
    o += `<path d="${hp}" fill="none" stroke="${c.hoop}" stroke-width="${f(Math.max(1.5, top.rx * 0.12), 1)}"/><ellipse cx="${r0(top.cx)}" cy="${r0(top.cy)}" rx="${r0(top.rx)}" ry="${f(top.ry, 1)}" fill="${c.lit}" stroke="${c.shade}" stroke-width="1.5"/>`;
    return o;
  };

  // --- the stalls along the houses (far to near) -----------------------------------------------------------------------
  const stalls = [];
  {
    const zs = [[2.2, 5.0], [5.5, 8.3], [8.8, 11.4], [11.9, 14.3], [14.8, 17.0], [17.5, 19.6], [20.1, 22.0], [22.5, 24.2]];
    const kinds = ['fish', 'rope', 'veg', 'oil', 'rope', 'veg', 'fish', 'oil'];
    zs.forEach(([z0, z1], i) => stalls.push({ z0, z1, kind: kinds[i], awn: M.awnings[i % M.awnings.length] }));
  }
  for (const st of [...stalls].reverse()) {
    const { z0, z1, kind, awn } = st, zm = (z0 + z1) / 2, k = fogK(zm) * 0.9;
    const g = (c) => mix(c, M.fog, k);
    const out = [];
    // the stall's dark interior against the house wall
    out.push(`<path d="${Q([[XH, 0, z0], [XH, YB, z0], [XH, YB, z1], [XH, 0, z1]])}" fill="${g('#3e3630')}"/>`);
    // a back shelf with jars / bundles
    {
      const c = { lit: g(M.wood.lit), mid: g(M.wood.mid), shade: g(M.wood.shade) };
      out.push(box(XH, XH + 0.45, 1.3, 1.38, z0 + 0.2, z1 - 0.2, c));
      let jr = '';
      for (let z = z0 + 0.45; z < z1 - 0.3; z += 0.42) { const a = P(XH + 0.22, 1.38, z), r = 0.12 * F / z; jr += `<path d="M${r0(a[0] - r)},${r0(a[1])}v${r0(-r * 2)}q${r0(r)},${r0(-r * 0.7)} ${r0(r * 2)},0v${r0(r * 2)}z" fill="${g(['#8a6a4a', '#5a6a70', '#a88a5a'][Math.round(z * 3) % 3])}"/>`; }
      out.push(jr);
    }
    // the counter: front planks and top
    const cz0 = z0 + 0.12, cz1 = z1 - 0.12;
    out.push(`<path d="${Q([[XC - 0.75, YC, cz0], [XC, YC, cz0], [XC, YC, cz1], [XC - 0.75, YC, cz1]])}" fill="${g(M.wood.lit)}"/>`);
    out.push(`<path d="${Q([[XC, 0, cz0], [XC, YC, cz0], [XC, YC, cz1], [XC, 0, cz1]])}" fill="${g(M.wood.mid)}"/>`);
    let cp = '';
    for (let z = cz0 + 0.3; z < cz1; z += 0.3) cp += L([[XC, 0.02, z], [XC, YC - 0.02, z]]);
    out.push(`<path d="${cp}" stroke="${g(M.wood.line)}" stroke-width="${f(Math.max(1, 0.03 * F / zm), 1)}" opacity=".6"/><path d="${L([[XC, YC, cz0], [XC, YC, cz1]])}" stroke="${g(M.plank.lit)}" stroke-width="${f(Math.max(1.2, 0.04 * F / zm), 1)}"/>`);
    // goods on the counter
    if (kind === 'rope') for (let z = z0 + 0.55; z < z1 - 0.3; z += 0.6) out.push(coil(XC - 0.35, YC, z, 0.24));
    if (kind === 'veg') {
      let v = '';
      for (let z = z0 + 0.35; z < z1 - 0.2; z += 0.26) for (const dx of [-0.5, -0.25]) {
        const [cx, cy] = P(XC + dx, YC, z), r = (dx < -0.3 ? 0.14 : 0.12) * F / z, cab = (Math.round(z * 4) + (dx < -0.3 ? 1 : 0)) % 3 !== 0;
        v += `<circle cx="${r0(cx)}" cy="${r0(cy - r * 0.8)}" r="${f(r, 1)}" fill="${g(cab ? M.cabbage[Math.round(z * 7) % 2] : M.onion[0])}"/><path d="M${r0(cx - r * 0.6)},${r0(cy - r * 1.2)}q${r0(r * 0.6)},${r0(-r * 0.5)} ${r0(r * 1.2)},0" fill="none" stroke="${g(cab ? M.cabbage[2] : '#e8c890')}" stroke-width="${f(Math.max(1, r * 0.2), 1)}"/>`;
      }
      out.push(v);
    }
    if (kind === 'fish') {
      let fi = '';
      for (let z = z0 + 0.35; z < z1 - 0.2; z += 0.2) for (const dx of [-0.55, -0.3]) {
        const [cx, cy] = P(XC + dx, YC + 0.04, z), s = 0.16 * F / z;
        fi += `M${r0(cx - s)},${r0(cy)}q${r0(s)},${r0(-s * 0.55)} ${r0(s * 1.7)},0l${r0(s * 0.4)},${r0(-s * 0.3)}v${r0(s * 0.6)}l${r0(-s * 0.4)},${r0(-s * 0.3)}q${r0(-s * 0.7)},${r0(s * 0.55)} ${r0(-s * 1.7)},0z`;
      }
      out.push(`<path d="${fi}" fill="${g(M.fish)}" stroke="${g(M.fishShade)}" stroke-width="1"/>`);
    }
    if (kind === 'oil') {
      let jg = '';
      for (let z = z0 + 0.4; z < z1 - 0.2; z += 0.5) { const a = P(XC - 0.35, YC, z), r = 0.13 * F / z; jg += `<path d="M${r0(a[0] - r)},${r0(a[1])}v${r0(-r * 1.6)}q0,${r0(-r * 0.6)} ${r0(r * 0.6)},${r0(-r * 0.7)}v${r0(-r * 0.4)}h${r0(r * 0.8)}v${r0(r * 0.4)}q${r0(r * 0.6)},${r0(r * 0.1)} ${r0(r * 0.6)},${r0(r * 0.7)}v${r0(r * 1.6)}z" fill="${g('#7a6a4e')}"/>`; }
      out.push(jg);
    }
    // goods on the deck in front of the counter
    if (zm < 18) {
      if (kind === 'fish') { out.push(basket(XC + 0.35, 0, z0 + 0.6, 0.3, 0.5, g(M.fish))); out.push(basket(XC + 0.4, 0, z1 - 0.7, 0.28, 0.46, g('#8a9a90'))); }
      if (kind === 'oil') { out.push(barrel(XC + 0.4, z1 - 0.6, 0.3, 0.8)); out.push(barrel(XC + 0.45, z0 + 0.8, 0.3, 0.8)); }
      if (kind === 'veg') out.push(basket(XC + 0.35, 0, z1 - 0.6, 0.32, 0.42, g(M.cabbage[0])));
      if (kind === 'rope') out.push(coil(XC + 0.5, 0, z0 + 0.8, 0.32));
    }
    // the posts and the awning (seen from below: striped underside, a lit scalloped hem)
    const pw = 0.05;
    out.push(`<path d="${Q([[XA - pw, 0, z0 + 0.05], [XA - pw, YA, z0 + 0.05], [XA + pw, YA, z0 + 0.05], [XA + pw, 0, z0 + 0.05]])}${Q([[XA - pw, 0, z1 - 0.05], [XA - pw, YA, z1 - 0.05], [XA + pw, YA, z1 - 0.05], [XA + pw, 0, z1 - 0.05]])}" fill="${g(M.wood.shade)}"/>`);
    const n = Math.max(4, Math.round((z1 - z0) / 0.42));
    let und = ['', ''], hem = ['', ''];
    for (let i = 0; i < n; i++) {
      const za = z0 - 0.05 + (z1 - z0 + 0.1) * i / n, zb = z0 - 0.05 + (z1 - z0 + 0.1) * (i + 1) / n, j = i % 2;
      und[j] += Q([[XH, YB, za], [XH, YB, zb], [XA, YA, zb], [XA, YA, za]]);
      const a = P(XA, YA, za), b = P(XA, YA, zb), c1 = P(XA, YA - 0.2, zb), c0 = P(XA, YA - 0.2, za), m = P(XA, YA - 0.32, (za + zb) / 2);
      hem[j] += `M${r0(a[0])},${r0(a[1])}L${r0(b[0])},${r0(b[1])}L${r0(c1[0])},${r0(c1[1])}Q${r0(m[0])},${r0(m[1])} ${r0(c0[0])},${r0(c0[1])}Z`;
    }
    out.push(`<path d="${und[0]}" fill="${g(mix(awn[0], '#3a3028', 0.4))}"/><path d="${und[1]}" fill="${g(mix(awn[1], '#3a3028', 0.4))}"/>`);
    out.push(`<path d="${hem[0]}" fill="${g(awn[0])}"/><path d="${hem[1]}" fill="${g(awn[1])}"/><path d="${L([[XA, YA, z0 - 0.05], [XA, YA, z1 + 0.05]])}" stroke="${g('#fff4dc')}" stroke-width="${f(Math.max(1, 0.05 * F / zm), 1)}" opacity=".7"/>`);
    // sun through the awning edge: a soft shade on the counter top's back half
    out.push(`<path d="${Q([[XC - 0.75, YC + 0.01, cz0], [XC - 0.4, YC + 0.01, cz0], [XC - 0.4, YC + 0.01, cz1], [XC - 0.75, YC + 0.01, cz1]])}" fill="#2a2420" opacity=".22"/>`);
    S.add(out.join(''));
  }

  // --- bunting strung across the channel -------------------------------------------------------------------------------
  {
    let ln = '', fl = ['', '', '', '', ''];
    for (const [z, y0, y1, sg] of [[13, 5.3, 4.9, 0.9], [21, 5.6, 5.2, 0.8]]) {
      const pts = [];
      for (let i = 0; i <= 24; i++) { const t = i / 24, x = XH + (XR - XH) * t, y = y0 + (y1 - y0) * t - sg * 4 * t * (1 - t); pts.push([x, y, z]); }
      ln += L(pts);
      pts.forEach(([x, y], i) => { if (!i || i === 24) return; const [cx, cy] = P(x, y, z), s = 0.3 * F / z; fl[i % 5] += `M${r0(cx - s * 0.5)},${r0(cy)}h${r0(s)}l${r0(-s * 0.5)},${r0(s * 1.2)}z`; });
    }
    S.add(`<path d="${ln}" fill="none" stroke="${M.wood.deep}" stroke-width="1.4"/>${fl.map((d, i) => `<path d="${d}" fill="${mix(M.flags[i], M.fog, 0.2)}"/>`).join('')}`);
  }

  // --- the skiff moored off the quay -----------------------------------------------------------------------------------
  {
    const yr = -0.28;
    const rim = [[2.75, 5.6], [2.55, 6.6], [2.75, 8.0], [3.25, 8.9], [3.75, 8.0], [3.95, 6.6], [3.8, 5.6]];
    S.add(`<path d="${Q(rim.map(([x, z]) => [x, yr, z]))}" fill="#4a3c30"/>`);
    // the near side and the transom
    const side = [[2.75, 5.6], [2.55, 6.6], [2.75, 8.0], [3.25, 8.9]];
    S.add(`<path d="${Q([...side.map(([x, z]) => [x, yr, z]), ...side.slice().reverse().map(([x, z]) => [x + 0.08, WY, z])])}" fill="${M.wood.mid}"/>`);
    S.add(`<path d="${Q([[2.75, yr, 5.6], [3.8, yr, 5.6], [3.72, WY, 5.6], [2.83, WY, 5.6]])}" fill="${M.wood.shade}"/>`);
    S.add(`<path d="${L(side.map(([x, z]) => [x, yr, z]))}" fill="none" stroke="${M.plank.lit}" stroke-width="3"/><path d="${L(side.map(([x, z]) => [x + 0.04, yr - 0.14, z]))}" fill="none" stroke="${M.wood.deep}" stroke-width="2" opacity=".6"/>`);
    S.add(`<path d="${Q([[2.6, yr - 0.05, 6.9], [3.9, yr - 0.05, 6.9], [3.9, yr - 0.05, 7.1], [2.6, yr - 0.05, 7.1]])}" fill="${M.wood.lit}"/>`);
    S.add(crate(2.95, yr, 6.0, 0.5) + crate(3.1, yr, 7.3, 0.45));
    S.add(`<path d="${pl([P(2.4, WY, 5.4), P(4.2, WY, 5.4)])}" stroke="${M.waterHi}" stroke-width="2" opacity=".5"/>`);
    // a second boat out by the far bank
    const r2 = [[7.2, 15.5], [7.0, 16.6], [7.3, 18.2], [7.8, 19.0], [8.3, 18.2], [8.4, 16.6], [8.2, 15.5]];
    S.add(`<path d="${Q(r2.map(([x, z]) => [x, yr, z]))}" fill="${fc('#4a3c30', 17)}"/><path d="${Q([[7.2, yr, 15.5], [7.0, yr, 16.6], [7.3, yr, 18.2], [7.8, yr, 19.0], [7.85, WY, 19.0], [7.35, WY, 18.2], [7.05, WY, 16.6], [7.25, WY, 15.5]])}" fill="${fc(M.wood.mid, 17)}"/>`);
  }

  // --- floating leaves on the water ------------------------------------------------------------------------------------
  {
    const Rl = rng(70708);
    let lv = '';
    for (let i = 0; i < 9; i++) { const z = Rl.range(3, 14), x = Rl.range(2.0, 6.5), [cx, cy] = P(x, WY, z), s = 0.22 * F / z; lv += `<ellipse cx="${r0(cx)}" cy="${r0(cy)}" rx="${f(s, 1)}" ry="${f(s * 0.35, 1)}" transform="rotate(${r0(Rl.range(-30, 30))} ${r0(cx)} ${r0(cy)})"/>`; }
    S.add(`<g fill="${M.cabbage[1]}" opacity=".85">${lv}</g>`);
  }

  // --- the railing along the quay edge, the mooring line, the tide-lamp post ------------------------------------------
  {
    const XRl = XE - 0.12;
    let posts = '', lit = '';
    for (let z = 2.2; z < ZB; z += 1.6) {
      const a = P(XRl, 0, z), b = P(XRl, 1.0, z), w = 0.06 * F / z;
      posts += `M${r0(a[0] - w)},${r0(a[1])}L${r0(b[0] - w)},${r0(b[1])}h${f(w * 2, 1)}L${r0(a[0] + w)},${r0(a[1])}Z`;
      lit += `M${r0(a[0] - w)},${r0(a[1])}L${r0(b[0] - w)},${r0(b[1])}`;
    }
    S.add(`<path d="${posts}" fill="${M.wood.mid}"/><path d="${lit}" stroke="${M.plank.lit}" stroke-width="2" opacity=".7"/>`);
    S.add(`<path d="${L([[XRl, 1.0, 1.6], [XRl, 1.0, ZB]])}" stroke="${M.wood.shade}" stroke-width="7"/><path d="${L([[XRl, 1.04, 1.6], [XRl, 1.04, ZB]])}" stroke="${M.plank.lit}" stroke-width="2" opacity=".7"/><path d="${L([[XRl, 0.5, 1.6], [XRl, 0.5, ZB]])}" stroke="${M.wood.shade}" stroke-width="4"/>`);
    // mooring line from a post to the skiff's bow
    const pa = P(XRl, 0.9, 8.6), pb = P(3.25, -0.22, 8.9);
    S.add(`<path d="${sag(pa, pb, 26)}" fill="none" stroke="${M.rope}" stroke-width="3"/>`);
    // a coil of rope hung on the nearest post, a coil on the deck
    S.add(coil(XRl - 0.25, 0, 3.6, 0.32));
    // the tide-lamp post
    const t0 = P(XRl - 0.1, 0, 11), t1 = P(XRl - 0.1, 3.2, 11), arm = P(XRl - 0.6, 3.1, 11);
    S.add(`<path d="M${r0(t0[0] - 4)},${r0(t0[1])}L${r0(t1[0] - 3)},${r0(t1[1])}H${r0(t1[0] + 3)}L${r0(t0[0] + 4)},${r0(t0[1])}Z" fill="${M.iron}"/><path d="M${r0(t1[0])},${r0(t1[1] + 6)}L${r0(arm[0])},${r0(arm[1] + 6)}" stroke="${M.iron}" stroke-width="3"/>${tideLamp(arm[0], arm[1] + 16, 1.3, M.lamp, false)}`);
  }

  // --- crates and fish baskets stacked on the quay in front (near left) ------------------------------------------------
  S.add(crate(-3.05, 0, 2.6, 0.62) + crate(-3.0, 0.5, 2.75, 0.5) + crate(-2.35, 0, 3.0, 0.55));
  S.add(basket(-1.85, 0, 2.8, 0.26, 0.42, M.fish) + basket(-1.95, 0, 3.6, 0.24, 0.4, '#8a9a90'));

  // --- grading: morning light from the upper left, a thin haze, the bottom quiet under the dialogue box ---------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#fff2d6', 0.14], [0.5, '#fff2d6', 0], [1, '#2a2a28', 0.2]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#26241f', 0], [1, '#26241f', 0.6]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------------------------------
// 雾港·影市: an old warehouse built in under the big bridge, at night, seen from just inside the entrance down its one
// aisle. Overhead, the bridge's underside: heavy cross beams on timber piers; down both sides, stalls in the dark —
// tables draped with cloth, jars, crates and bundles — divided by hanging cloths; across the aisle, layer after layer
// of curtains (the near pair gathered and tied back, then short split curtains hung from strings), and between them
// strings of paper lanterns, warm. Far down the aisle, on the last table, a coil of rope glowing a faint cyan (萤苔绳).
// The right side is open between the piers onto the night channel: dark water with lantern-warm current streaks (no
// reflections) and the lit windows of the far bank in the fog. No figures, no signs, no readable text.
// ---------------------------------------------------------------------------------------------------------------------
const N = {
  sky: [[0, '#10141f'], [0.6, '#1c2232'], [1, '#2a2a36']], fog: '#2e3040',
  bank: '#0c0e16', win: '#e8a45a', water: '#121722', waterDeep: '#090b10', streakWarm: '#d88a48', streakCool: '#4a5670',
  beam: { lit: '#4a3a2c', mid: '#30261e', shade: '#1c1610' }, ceil: '#16120e', wall: '#221a14', wallLine: '#120e0a',
  floor: ['#3a2e22', '#241c14'], floorLine: '#120e0a',
  cloth: ['#3e2436', '#242a42', '#4a3626', '#2e3a30', '#4a2a2a'],
  table: { lit: '#5a4632', mid: '#3a2c20', shade: '#22180e' },
  jar: ['#6a4a34', '#4a5258', '#7a6a48', '#5a3a3a'], lantern: '#d2643a', lanternLit: '#ffb466', lanternCore: '#fff0c4', cap: '#2a1a12',
  moss: '#8ef0d6', mossDim: '#3a8a7a',
};

function shadowMarket() {
  const S = new Scene('sbEx7Shadow', '雾港·影市：大桥底下的一间旧仓，入夜，从门口往里看那一条走道：头顶是桥底的粗横梁和木桥墩；两边暗处的摊子，桌上盖着布，摆着罐子、木箱和包袱，摊与摊之间垂着布帘；走道上一层又一层的帘子——近处一对撩起来系住，往里是从绳上垂下的短帘——帘与帘之间挂着一串串纸灯笼，暖黄的光；走道尽头最后一张桌上，一卷绳子发着淡淡的青光；右边桥墩之间敞开，看得见夜里的水道，水面上有灯笼照出的暖色水纹（不画倒影）和对岸雾里亮着的窗；不画人，没有招牌，没有能读出的字', 70711);
  const R = rng(70712);
  const VP = [800, 430], F = 820, EYE = 1.55;
  const pr = persp({ vp: VP, F, eye: EYE });
  const P = (x, y, z) => pr(x, y, z);
  const Q = (pts) => pz(pts.map((p) => P(...p)));
  const L = (pts) => pl(pts.map((p) => P(...p)));
  const XL = -4.4, XRt = 4.2, YCe = 4.3, YBm = 3.85, ZE = 27.5, ZN = 1.4;
  const dk = (z) => Math.min(0.7, Math.max(0, (z - 6) / 30)); // darkness down the aisle
  const dc = (c, z) => mix(c, '#0c0a0e', dk(z));
  const glow = S.rad([[0, '#ffb060', 0.42], [0.3, '#e07838', 0.16], [1, '#e07838', 0]]);
  const glowSoft = S.rad([[0, '#ffa050', 0.22], [1, '#ffa050', 0]]);
  const cyan = S.rad([[0, N.moss, 0.55], [0.35, '#4ac8b0', 0.2], [1, '#4ac8b0', 0]]);

  // --- the night beyond the open side: sky, the far bank, the water -----------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(N.sky, `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${VP[1] + 60}"`)}"/>`);
  {
    const top = P(0, -0.9, 60)[1];
    S.add(`<path d="M780,${r0(top)}H${W}V${H}H780Z" fill="${S.lin([[0, N.water], [1, N.waterDeep]], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(top)}" x2="0" y2="${H}"`)}"/>`);
    // far bank houses on stilts, a few windows lit
    const Rb = rng(70713);
    let d = '', wn = '', pil = '';
    for (let z = 18; z < 52;) {
      const w = Rb.range(2.4, 4), h = Rb.range(4, 6.5), X = 17, y0 = 0.2;
      const a = P(X, y0, z), b = P(X, h, z + w), c = P(X, y0, z + w), top0 = P(X, h, z);
      d += `M${r0(a[0])},${r0(a[1])}L${r0(top0[0])},${r0(top0[1])}L${r0((top0[0] + b[0]) / 2)},${r0(Math.min(top0[1], b[1]) - 0.8 * F / z)}L${r0(b[0])},${r0(b[1])}L${r0(c[0])},${r0(c[1])}Z`;
      for (let zz = z + 0.4; zz < z + w - 0.4; zz += 1.1) pil += L([[X, y0, zz], [X, -0.9, zz]]);
      for (const yy of [1.3, 3.0]) for (let zz = z + 0.5; zz < z + w - 0.6; zz += 1.2) if (Rb() < 0.45) wn += Q([[X, yy, zz], [X, yy + 0.8, zz], [X, yy + 0.8, zz + 0.5], [X, yy, zz + 0.5]]);
      z += w + Rb.range(0.2, 1.2);
    }
    S.add(`<path d="${pil}" stroke="${N.bank}" stroke-width="2.4"/><path d="${d}" fill="${N.bank}"/><path d="${wn}" fill="${N.win}" opacity=".85"/>`);
    S.add(`<rect x="900" y="${VP[1] - 70}" width="700" height="140" fill="${S.lin([[0, N.fog, 0], [0.5, N.fog, 0.55], [1, N.fog, 0]])}"/>`);
    // current streaks on the water: warm under the windows and lanterns, cool elsewhere (no reflections)
    S.add(currents(rng(70714), 1000, 1600, top + 6, 900, 46, N.streakCool, 0.5, 1));
    S.add(currents(rng(70715), 1050, 1600, top + 4, 640, 26, N.streakWarm, 0.55, 1));
    S.add(currents(rng(70716), 1240, 1600, 640, 900, 22, N.streakWarm, 0.4, -1));
  }

  // --- the warehouse shell: ceiling (the bridge's underside), left wall, floor, the far end -----------------------------
  {
    S.add(`<path d="${Q([[XL, YCe, ZN], [XL, YCe, ZE], [XRt + 0.6, YCe, ZE], [XRt + 0.6, YCe, ZN]])}" fill="${N.ceil}"/>`);
    let pk = '';
    for (let x = XL + 0.45; x < XRt + 0.6; x += 0.45) pk += L([[x, YCe, ZN], [x, YCe, ZE]]);
    S.add(`<path d="${pk}" stroke="#0a0806" stroke-width="2" opacity=".7"/>`);
    S.add(`<path d="${Q([[XL, 0, ZN], [XL, YCe, ZN], [XL, YCe, ZE], [XL, 0, ZE]])}" fill="${N.wall}"/>`);
    let wl = '';
    for (let y = 0.35; y < YCe; y += 0.35) wl += L([[XL, y, ZN], [XL, y, ZE]]);
    S.add(`<path d="${wl}" stroke="${N.wallLine}" stroke-width="1.4" opacity=".7"/>`);
    S.add(`<path d="${Q([[XL, 0, ZN], [XL, 0, ZE], [XRt, 0, ZE], [XRt, 0, ZN]])}" fill="${S.lin([[0, '#1a140e'], [0.5, N.floor[0]], [1, N.floor[1]]], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(P(0, 0, ZE)[1])}" x2="0" y2="${H}"`)}"/>`);
    let fl = '';
    for (let x = XL + 0.3; x < XRt; x += 0.3) fl += L([[x, 0, ZN], [x, 0, ZE]]);
    for (let z = 2; z < ZE; z += 1.2 * (1 + z / 20)) fl += L([[XL, 0, z], [XRt, 0, z]]);
    S.add(`<path d="${fl}" stroke="${N.floorLine}" stroke-width="1.2" opacity=".55"/>`);
    // the quay edge on the open side
    S.add(`<path d="${L([[XRt, 0, ZN], [XRt, 0, ZE]])}" stroke="#4a3e30" stroke-width="3"/>`);
    // the far end: dark boards and a closed curtain in the doorway
    S.add(`<path d="${Q([[XL, 0, ZE], [XL, YCe, ZE], [XRt + 0.6, YCe, ZE], [XRt + 0.6, 0, ZE]])}" fill="#140f0c"/><path d="${Q([[-0.9, 0, ZE - 0.05], [-0.9, 2.4, ZE - 0.05], [0.9, 2.4, ZE - 0.05], [0.9, 0, ZE - 0.05]])}" fill="${mix(N.cloth[0], '#0c0a0e', 0.4)}"/>`);
  }

  // --- everything along the aisle, sorted far to near ----------------------------------------------------------------
  const items = [];
  const add = (z, svg) => items.push({ z, svg });
  const box = (x0, x1, y0, y1, z0, z1, c) => {
    let s = `<path d="${Q([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]])}" fill="${c.mid}"/>`;
    if (y1 < EYE) s += `<path d="${Q([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])}" fill="${c.lit}"/>`;
    else if (y0 > EYE) s += `<path d="${Q([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]])}" fill="${c.shade}"/>`;
    if (x1 < 0) s += `<path d="${Q([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]])}" fill="${c.shade}"/>`;
    else if (x0 > 0) s += `<path d="${Q([[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]])}" fill="${c.shade}"/>`;
    return s;
  };
  const tone = (c, z) => ({ lit: dc(c.lit, z), mid: dc(c.mid, z), shade: dc(c.shade, z) });

  // piers on the open side and the cross beams of the bridge
  for (const z of [5.2, 9.6, 14.0, 18.4, 22.8]) {
    add(z + 0.5, box(XRt, XRt + 0.5, 0, YBm, z, z + 0.5, tone(N.beam, z)));
    add(z + 0.6, box(XL, XRt + 0.6, YBm, YCe, z - 0.1, z + 0.35, tone(N.beam, z)) + `<path d="${L([[XL, YBm, z - 0.1], [XRt + 0.6, YBm, z - 0.1]])}" stroke="${dc('#6a5442', z)}" stroke-width="${f(Math.max(1, 0.04 * F / z), 1)}" opacity=".6"/>`);
  }

  // a draped table: cloth over the top hanging down the face that looks at the aisle, goods on top
  const table = (side, x0, x1, z0, z1, ci) => {
    const zm = (z0 + z1) / 2, cl = dc(N.cloth[ci % N.cloth.length], zm), clL = dc(mix(N.cloth[ci % N.cloth.length], '#c89a6a', 0.25), zm);
    const fx = side < 0 ? x1 : x0, h = 0.8;
    let s = box(x0, x1, 0, h, z0, z1, tone(N.table, zm));
    // the cloth: top, then the drop on the aisle face with a ragged hem and fold lines
    s += `<path d="${Q([[x0, h + 0.01, z0], [x1, h + 0.01, z0], [x1, h + 0.01, z1], [x0, h + 0.01, z1]])}" fill="${clL}"/>`;
    const hem = [];
    for (let i = 0; i <= 8; i++) { const z = z0 + (z1 - z0) * i / 8; hem.push([fx, 0.18 + (i % 2) * 0.12 + R.range(-0.04, 0.04), z]); }
    s += `<path d="${Q([[fx, h + 0.01, z0], [fx, h + 0.01, z1], ...hem.slice().reverse()])}" fill="${cl}"/>`;
    s += `<path d="${Q([[x0, h + 0.01, z0], [x1, h + 0.01, z0], [x1, 0.2, z0], [x0, 0.25, z0]])}" fill="${dc(mix(N.cloth[ci % N.cloth.length], '#000000', 0.25), zm)}"/>`;
    let fd = '';
    for (let i = 1; i < 8; i += 2) { const z = z0 + (z1 - z0) * i / 8; fd += L([[fx, h, z], [fx, 0.3, z]]); }
    s += `<path d="${fd}" stroke="${dc('#000000', 0)}" stroke-opacity=".3" stroke-width="${f(Math.max(1, 0.05 * F / zm), 1)}"/>`;
    // jars, a crate, a bundle
    let gd = '';
    for (let z = z0 + 0.35; z < z1 - 0.2; z += 0.42) {
      const x = (x0 + x1) / 2 + R.range(-0.15, 0.15), [cx, cy] = P(x, h, z), r = R.range(0.09, 0.14) * F / z, c = dc(N.jar[Math.floor(R() * N.jar.length)], zm);
      if (R() < 0.65) gd += `<path d="M${r0(cx - r)},${r0(cy)}v${r0(-r * 1.5)}q${r0(r * 0.2)},${r0(-r * 0.5)} ${r0(r * 0.5)},${r0(-r * 0.6)}v${r0(-r * 0.3)}h${r0(r)}v${r0(r * 0.3)}q${r0(r * 0.3)},${r0(r * 0.1)} ${r0(r * 0.5)},${r0(r * 0.6)}v${r0(r * 1.5)}z" fill="${c}"/><path d="M${r0(cx - r * 0.6)},${r0(cy - r * 0.3)}v${r0(-r * 1.2)}" stroke="${dc('#c8a070', zm)}" stroke-width="${f(Math.max(1, r * 0.18), 1)}" opacity=".5"/>`;
      else gd += `<ellipse cx="${r0(cx)}" cy="${r0(cy - r * 0.6)}" rx="${r0(r * 1.4)}" ry="${r0(r * 0.8)}" fill="${c}"/><path d="M${r0(cx - r * 0.4)},${r0(cy - r * 1.3)}l${r0(r * 0.4)},${r0(-r * 0.5)}l${r0(r * 0.4)},${r0(r * 0.5)}" fill="none" stroke="${dc('#8a7050', zm)}" stroke-width="${f(Math.max(1, r * 0.2), 1)}"/>`;
    }
    s += gd;
    return s;
  };
  // a hanging cloth (partition, curtain strip) on the plane z, from x0 to x1, top y0 down to a ragged bottom y1
  const cloth = (x0, x1, y0, y1, z, ci, { lit = 0.2, sway = 0.06 } = {}) => {
    const c = dc(N.cloth[ci % N.cloth.length], z), cs = dc(mix(N.cloth[ci % N.cloth.length], '#000000', 0.4), z), clit = dc(mix(N.cloth[ci % N.cloth.length], '#ffb070', lit), z);
    const n = Math.max(3, Math.round(Math.abs(x1 - x0) / 0.3));
    const bot = [];
    for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; bot.push([x + R.range(-sway, sway), y1 + R.range(-0.05, 0.05) + (i % 2) * 0.05, z]); }
    let s = `<path d="${Q([[x0, y0, z], [x1, y0, z], ...bot.slice().reverse()])}" fill="${c}"/>`;
    let fd = '', fl = '';
    for (let i = 1; i < n; i++) { const t = bot[i], seg = L([[x0 + (x1 - x0) * i / n, y0, z], [t[0], t[1] + 0.05, z]]); if (i % 2) fd += seg; else fl += seg; }
    s += `<path d="${fd}" stroke="${cs}" stroke-width="${f(Math.max(1, 0.08 * F / z), 1)}"/><path d="${fl}" stroke="${clit}" stroke-width="${f(Math.max(1, 0.04 * F / z), 1)}" opacity=".7"/>`;
    s += `<path d="${L([[x0 - 0.05, y0, z], [x1 + 0.05, y0, z]])}" stroke="${dc('#1a120c', z)}" stroke-width="${f(Math.max(1.5, 0.05 * F / z), 1)}"/>`;
    return s;
  };

  // stalls down the left side: tables, a short valance over each, cloth partitions between them
  {
    const zs = [[4.4, 6.6], [7.2, 9.5], [10.1, 12.3], [12.9, 15.0], [15.6, 17.6], [18.2, 20.0], [20.6, 22.4], [23.0, 24.8]];
    zs.forEach(([z0, z1], i) => {
      const zm = (z0 + z1) / 2;
      add(zm, table(-1, -3.9, -2.65, z0, z1, i));
      add(zm + 0.01, `<path d="${Q([[-2.6, 2.55, z0], [-2.6, 2.55, z1], [-2.6, 2.2, z1], [-2.6, 2.2, z0]])}" fill="${dc(N.cloth[(i + 2) % N.cloth.length], zm)}"/><path d="${L([[-2.6, 2.55, z0 - 0.1], [-2.6, 2.55, z1 + 0.1]])}" stroke="${dc('#1a120c', zm)}" stroke-width="${f(Math.max(1.5, 0.05 * F / zm), 1)}"/>`);
      add(z0, cloth(XL, -2.55, 2.55, 0.15, z0, i + 1, { lit: 0.12 }));
      // bundles hanging on the wall above the stall
      const hz = zm, a = P(XL + 0.05, 3.3, hz), r = 0.18 * F / hz;
      add(zm - 0.5, `<path d="M${r0(a[0])},${r0(a[1])}v${r0(r * 0.8)}" stroke="${dc('#5a4a3a', hz)}" stroke-width="1.5"/><ellipse cx="${r0(a[0])}" cy="${r0(a[1] + r * 1.6)}" rx="${r0(r * 0.7)}" ry="${r0(r)}" fill="${dc(N.jar[i % N.jar.length], hz)}"/>`);
    });
  }
  // stalls on the right, between the piers
  {
    const zs = [[6.0, 8.6], [14.6, 17.4]];
    zs.forEach(([z0, z1], i) => add((z0 + z1) / 2, table(1, 2.55, 3.7, z0, z1, i + 3)));
  }
  // the last table at the end of the aisle: the glowing coil of moss rope
  {
    const z = 24.2;
    let s = table(-1, -1.1, 0.5, z - 0.6, z + 0.6, 1);
    const [cx, cy] = P(-0.3, 0.82, z), rx = 0.36 * F / z, ry = rx * 0.32;
    const fp = P(-0.3, 0, z - 1.2);
    s += `<ellipse cx="${r0(fp[0])}" cy="${r0(fp[1])}" rx="${r0(rx * 9)}" ry="${r0(rx * 2)}" fill="${cyan}" opacity=".6"/><ellipse cx="${r0(cx)}" cy="${r0(cy - 6)}" rx="${r0(rx * 9)}" ry="${r0(rx * 6.5)}" fill="${cyan}"/>`;
    let c = '';
    for (let k = 0; k < 4; k++) c += `<ellipse cx="${r0(cx)}" cy="${f(cy - k * ry * 0.6, 1)}" rx="${f(rx * (1 - k * 0.13), 1)}" ry="${f(ry * (1 - k * 0.13), 1)}"/>`;
    s += `<g fill="none" stroke="${N.moss}" stroke-width="2.6">${c}</g><ellipse cx="${r0(cx)}" cy="${r0(cy)}" rx="${f(rx, 1)}" ry="${f(ry, 1)}" fill="none" stroke="${N.mossDim}" stroke-width="1.4"/>`;
    add(z - 0.7, s);
  }
  // across the aisle: short split curtains hung from strings (two layers), and the near pair gathered and tied back
  {
    for (const [z, ci, y1] of [[10.6, 0, 2.55], [18.2, 1, 2.6], [22.9, 4, 2.7]]) {
      let s = '';
      const strips = [[-2.5, -1.45], [-1.35, -0.3], [0.45, 1.5], [1.6, 2.4]];
      strips.forEach(([a, b], k) => { s += cloth(a, b, 3.65, y1 + (k % 2) * 0.12, z, ci + k, { lit: 0.3, sway: 0.03 }); });
      s += `<path d="${L([[XL, 3.68, z], [XRt, 3.68, z]])}" stroke="${dc('#2a1e14', z)}" stroke-width="2"/>`;
      add(z, s);
    }
    // the near pair: wide at the rod, gathered at the waist with a cord, flaring to the floor
    const z = 4.0, ci = 0;
    for (const sd of [-1]) {
      const xo = sd < 0 ? XL : XRt + 0.2, xi = sd < 0 ? -1.55 : 1.45, wa = sd < 0 ? -3.4 : 3.3, fo = sd < 0 ? -2.85 : 2.8;
      const c = mix(N.cloth[ci], '#000000', 0.15), cs = mix(N.cloth[ci], '#000000', 0.5), cl = mix(N.cloth[ci], '#ffb070', 0.3);
      const pts = [[xo, 3.75, z], [xi, 3.75, z], [(xi + wa) / 2 + sd * -0.2, 2.6, z], [wa, 1.35, z], [(wa + fo) / 2, 0.7, z], [fo, 0.04, z], [xo, 0.04, z]];
      let s = `<path d="${Q(pts)}" fill="${c}"/>`;
      let fd = '';
      for (let t = 0.2; t < 1; t += 0.2) {
        const xt = xo + (xi - xo) * t, xw = xo + (wa - xo) * t, xf = xo + (fo - xo) * t;
        fd += L([[xt, 3.75, z], [xw, 1.35, z]]) + L([[xw, 1.35, z], [xf, 0.05, z]]);
      }
      s += `<path d="${fd}" stroke="${cs}" stroke-width="5" fill="none"/>`;
      s += `<path d="${L([[xi, 3.75, z], [(xi + wa) / 2 + sd * -0.2, 2.6, z], [wa, 1.35, z]])}" stroke="${cl}" stroke-width="3" fill="none" opacity=".75"/>`;
      const k0 = P(wa - sd * 0.02, 1.4, z), k1 = P(xo, 1.32, z);
      s += `<path d="M${r0(k0[0])},${r0(k0[1])}L${r0(k1[0])},${r0(k1[1])}" stroke="#a8804a" stroke-width="6"/><circle cx="${r0(k0[0])}" cy="${r0(k0[1] + 6)}" r="7" fill="#a8804a"/><path d="M${r0(k0[0])},${r0(k0[1] + 10)}l${sd * -4},28M${r0(k0[0])},${r0(k0[1] + 10)}l${sd * 4},26" stroke="#a8804a" stroke-width="3"/>`;
      add(z, s);
    }
    add(z - 0.01, `<path d="${L([[XL, 3.78, z], [-1.2, 3.78, z]])}" stroke="#1a120c" stroke-width="9"/>`);
  }
  // strings of paper lanterns across the aisle, their glow on the floor
  {
    const rows = [[3.8, [-1.7, 1.3]], [6.6, [-2.3, 0.1, 2.3]], [9.2, [-2.2, -0.1, 1.8]], [13.0, [-1.4, 0.8]], [15.8, [-2.0, 0.2, 2.0]], [20.0, [-1.2, 1.0]], [24.0, [-1.6, 0.4]]];
    for (const [z, xs] of rows) {
      const yr = 3.55;
      const pts = [];
      for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push([XL + (XRt - XL) * t, yr - 0.35 * 4 * t * (1 - t), z]); }
      let s = `<path d="${L(pts)}" fill="none" stroke="${dc('#3a2a1c', z)}" stroke-width="${f(Math.max(1, 0.025 * F / z), 1)}"/>`;
      let halos = '', pools = '';
      for (const x of xs) {
        const t = (x - XL) / (XRt - XL), ys = yr - 0.35 * 4 * t * (1 - t), yl = ys - 0.55;
        const [cx, cy] = P(x, yl, z), rx = 0.2 * F / z, ry = 0.27 * F / z, top = P(x, ys, z);
        halos += `<circle cx="${r0(cx)}" cy="${r0(cy)}" r="${r0(1.5 * F / z)}" fill="${glow}"/>`;
        const fp = P(x, 0, z);
        pools += `<ellipse cx="${r0(fp[0])}" cy="${r0(fp[1])}" rx="${r0(1.8 * F / z)}" ry="${r0(1.8 * F / z * Math.min(0.5, EYE / z * 1.2))}" fill="${glowSoft}"/>`;
        s += `<path d="M${r0(top[0])},${r0(top[1])}V${r0(cy - ry)}" stroke="${dc('#2a1c12', z)}" stroke-width="1.2"/>`;
        s += `<ellipse cx="${r0(cx)}" cy="${r0(cy)}" rx="${f(rx, 1)}" ry="${f(ry, 1)}" fill="${N.lantern}"/><ellipse cx="${r0(cx)}" cy="${r0(cy)}" rx="${f(rx * 0.55, 1)}" ry="${f(ry * 0.8, 1)}" fill="${N.lanternLit}"/><ellipse cx="${r0(cx)}" cy="${r0(cy)}" rx="${f(rx * 0.22, 1)}" ry="${f(ry * 0.5, 1)}" fill="${N.lanternCore}"/>`;
        s += `<path d="M${f(cx - rx, 1)},${r0(cy)}h${f(rx * 2, 1)}M${f(cx - rx * 0.9, 1)},${f(cy - ry * 0.45, 1)}h${f(rx * 1.8, 1)}M${f(cx - rx * 0.9, 1)},${f(cy + ry * 0.45, 1)}h${f(rx * 1.8, 1)}" stroke="#a84a2a" stroke-width="${f(Math.max(0.8, rx * 0.08), 1)}" opacity=".6"/>`;
        s += `<path d="M${f(cx - rx * 0.5, 1)},${f(cy - ry, 1)}h${f(rx, 1)}v${f(-ry * 0.16, 1)}h${f(-rx, 1)}zM${f(cx - rx * 0.5, 1)},${f(cy + ry, 1)}h${f(rx, 1)}v${f(ry * 0.16, 1)}h${f(-rx, 1)}z" fill="${N.cap}"/>`;
        if (z < 14) s += `<path d="M${r0(cx)},${f(cy + ry * 1.16, 1)}v${f(ry * 0.7, 1)}" stroke="#c8402a" stroke-width="${f(Math.max(1, rx * 0.1), 1)}"/>`;
      }
      add(z - 0.05, pools);
      add(z + 0.02, halos + s);
    }
  }
  // candle jars on a few tables
  for (const [x, z] of [[-3.2, 7.2], [-3.3, 13.1], [3.2, 10.3], [-3.25, 18.7]]) {
    const [cx, cy] = P(x, 0.82, z), r = 0.07 * F / z;
    add(z - 0.4, `<circle cx="${r0(cx)}" cy="${r0(cy - r * 2)}" r="${r0(0.9 * F / z)}" fill="${glow}"/><path d="M${r0(cx - r)},${r0(cy)}v${r0(-r * 2)}h${r0(r * 2)}v${r0(r * 2)}z" fill="#8a6a48"/><circle cx="${r0(cx)}" cy="${r0(cy - r * 2.6)}" r="${f(Math.max(1.2, r * 0.6), 1)}" fill="${N.lanternCore}"/>`);
  }

  items.sort((a, b) => b.z - a.z);
  S.add(...items.map((i) => i.svg));

  // --- grading: a warm haze down the aisle, the darkness closing in at the edges, the bottom quiet under the box ------
  S.add(`<ellipse cx="760" cy="380" rx="520" ry="300" fill="${S.rad([[0, '#ff9a50', 0.1], [1, '#ff9a50', 0]])}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.4, '#06050a', 0], [1, '#06050a', 0.75]], 'gradientUnits="userSpaceOnUse" cx="790" cy="420" r="960"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#08060a', 0], [1, '#08060a', 0.6]])}"/>`);
  return S.out();
}

export const ex007Bgs = {
  'fog-harbor-market-day': marketDay,
  'fog-harbor-shadow-market': shadowMarket,
};
