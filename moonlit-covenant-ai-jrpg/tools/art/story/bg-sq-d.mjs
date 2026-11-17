// 成长支线的场景背景（剧本/番外/ex014我也想成為她.md〈美術需求〉）：verdant-mirror-street-day（绿镜城·活藤街·白天）。
//   verdant-mirror-street-day — Green-Mirror City, the Living-Vine Street by day: a canal runs straight away from us between two
//                               rows of tall narrow gabled houses. Every facade is grown over with living vines whose leaves
//                               are mid-change — patches and gradients of green, teal, gold, violet and blue, each house a
//                               different blend — trimmed back around the windows. Plank quays with railings, flower pots
//                               and mooring posts line both banks; four wooden footbridges cross the water, the nearest one
//                               arched. At the far end a cross row of vine-grown houses, and above them the green-glass spire
//                               of the council hall. Morning light from the upper left (the right-hand row is lit, the
//                               left-hand row in shade). Water is flat colour with current streaks, never a reflection
//                               (coast.mjs house rules). No figures, no readable text.
import { Scene, W, H, f, pz, pl, persp, mix, rng } from './lib.mjs';
import { currents } from './coast.mjs';

const r0 = (v) => f(v, 0);

const M = {
  sky: [[0, '#9cc4d8'], [0.55, '#cfe2e2'], [1, '#eef0e0']],
  sun: '#fff8e0', haze: '#e4ecdc',
  water: '#4f8a84', waterFar: '#9cc2b4', waterDeep: '#2f5e5c', waterHi: '#d8eee4',
  plaster: [['#efe4cc', '#cdbf9f'], ['#e6d6c0', '#c2ad94'], ['#dfe2d0', '#b8bca6'], ['#ecd8c4', '#c8a68e']],
  roof: ['#4e5a52', '#6c4a3e', '#3e4c5a', '#5a4e3a'],
  glass: '#2e3a40', glassHi: '#b8d0d4', frame: '#5a4a38',
  wood: { lit: '#b49a76', mid: '#8a7254', shade: '#5e4c38', deep: '#3a2e22' },
  plank: { lit: '#c2aa86', mid: '#9a8466', shade: '#6e5c46', joint: '#4c3e30' },
  // vine blends: each house picks one — the leaves are caught halfway through changing colour
  vines: [
    ['#3e7a3a', '#5aa070', '#9cc460'], ['#2e7468', '#4aa0a0', '#7cc0b8'], ['#5a8a34', '#b8a83a', '#e0c050'],
    ['#4a6a3a', '#7a5a9a', '#a07ac0'], ['#2e6a5a', '#3a7ab0', '#78a8d8'], ['#4e8a3e', '#7ab048', '#c8d070'],
    ['#6a7a30', '#c08a3a', '#e0a860'], ['#3a6a4a', '#5a9a8a', '#9a7ab8'],
  ],
  flowers: ['#e86a6a', '#f0c850', '#f4f0e0', '#d07ab0', '#7aa0e0'],
  spire: ['#5ab89a', '#2e7a6a', '#a8e8d0'],
};

function vineStreet() {
  const S = new Scene('sbSqdVine', '绿镜城·活藤街·白天：一条水道笔直伸向远处，两岸是高而窄的山墙房子，外墙全爬满活藤，藤叶正在换色——绿、青、金、紫、蓝一块一块渐变，每栋房子都不一样，窗边的藤修剪过；两岸是木栈道、栏杆、花盆和系船桩，四座木桥横过水道，最近的一座拱起；尽头是一排同样爬满藤的房子，屋顶后面是议会厅绿色玻璃的尖顶；早上的光从左上来，不画人，不写字', 14001);
  const R = rng(14002);
  const VP = [800, 400], F = 900, EYE = 1.7;
  const pr = persp({ vp: VP, F, eye: EYE });
  const Q = (pts) => pz(pts.map((p) => pr(...p)));
  const L = (pts) => pl(pts.map((p) => pr(...p)));
  const XW = 3.0, XF = 5.0, WY = -0.7, ZEND = 64; // canal half-width, facade plane, water level, far row
  const hazeK = (z) => Math.min(0.7, Math.max(0, (z - 10) / 70));
  const hz = (c, z) => mix(c, M.haze, hazeK(z));
  const leafPattern = (name, t, seed) => {
    const Rl = rng(seed);
    let lt = '', dk = '';
    for (let i = 0; i < 12; i++) {
      const x = Rl.range(0, t), y = Rl.range(0, t), r = t * Rl.range(0.13, 0.2), a = Rl.range(-0.6, 0.6);
      const dx = Math.cos(a) * r, dy = Math.sin(a) * r;
      const leaf = `M${f(x - dx, 1)},${f(y - dy, 1)}q${f(dx - dy * 0.9, 1)},${f(dy + dx * 0.9, 1)} ${f(dx * 2, 1)},${f(dy * 2, 1)}q${f(-dx - dy * 0.9, 1)},${f(-dy + dx * 0.9, 1)} ${f(-dx * 2, 1)},${f(-dy * 2, 1)}Z`;
      if (i % 2) lt += leaf; else dk += leaf;
    }
    S.def(`<pattern id="${S.id(name)}" width="${t}" height="${t}" patternUnits="userSpaceOnUse"><path d="${lt}" fill="#f4ffe8" opacity=".42"/><path d="${dk}" fill="#0e2418" opacity=".36"/></pattern>`);
    return `url(#${S.id(name)})`;
  };
  const LEAF = [leafPattern('leafL', 46, 14051), leafPattern('leafM', 24, 14052), leafPattern('leafS', 12, 14053)];
  const leafFor = (z) => (z < 9 ? LEAF[0] : z < 22 ? LEAF[1] : LEAF[2]);
  const flowerBuf = M.flowers.map(() => '');
  const dot = (x, y, r, ci) => { flowerBuf[ci] += `M${r0(x - r)},${r0(y)}a${f(r, 1)},${f(r, 1)} 0 1 0 ${f(2 * r, 1)},0a${f(r, 1)},${f(r, 1)} 0 1 0 ${f(-2 * r, 1)},0Z`; };

  // --- sky and the far row ----------------------------------------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(M.sky, `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${VP[1] + 20}"`)}"/>`);
  S.add(`<ellipse cx="240" cy="60" rx="620" ry="260" fill="${S.rad([[0, M.sun, 0.85], [1, M.sun, 0]])}"/>`);
  {
    // a few soft clouds
    let d = '';
    for (const [cx, cy, w] of [[420, 110, 220], [1120, 70, 300], [1400, 160, 180], [760, 190, 140]]) {
      for (let k = 0; k < 5; k++) { const x = cx - w / 2 + (w * k) / 4, r = w * (0.16 + 0.08 * Math.sin(k * 1.7 + cx)); d += `M${r0(x - r)},${r0(cy)}a${r0(r)},${r0(r * 0.62)} 0 1 0 ${r0(r * 2)},0a${r0(r)},${r0(r * 0.62)} 0 1 0 ${r0(-r * 2)},0Z`; }
    }
    S.add(`<path d="${d}" fill="#ffffff" opacity=".55"/>`);
  }
  // council hall spire: green glass, behind the far row, a little right of the canal
  {
    const [sx, sy] = pr(1.4, 0, ZEND + 14), top = pr(1.4, 19, ZEND + 14)[1], base = pr(1.4, 7, ZEND + 14)[1], w = 34;
    S.add(`<path d="M${r0(sx - w)},${r0(base + 40)}V${r0(base)}L${r0(sx)},${r0(top)}L${r0(sx + w)},${r0(base)}V${r0(base + 40)}Z" fill="${S.lin([[0, M.spire[2]], [0.5, M.spire[0]], [1, M.spire[1]]], 'x1="0" y1="0" x2="1" y2="0"')}" opacity=".88"/>`);
    S.add(`<path d="M${r0(sx)},${r0(top)}V${r0(base + 40)}M${r0(sx - w)},${r0(base)}H${r0(sx + w)}M${r0(sx - w * 0.5)},${r0((top + base) / 2 + 30)}H${r0(sx + w * 0.5)}" stroke="#e8fff4" stroke-width="1.6" opacity=".6"/>`);
    S.add(`<path d="M${r0(sx - 70)},${r0(base + 60)}V${r0(base + 18)}h140V${r0(base + 60)}Z" fill="${hz('#7a9a88', ZEND + 14)}"/>`);
    void sy;
  }
  {
    // the far cross row facing us
    const Rf = rng(14003);
    for (let x = -XF - 4; x < XF + 4;) {
      const w = Rf.range(1.8, 2.8), h = Rf.range(6.5, 9.5), z = ZEND, pal = M.plaster[Math.floor(Rf() * 4)], vin = M.vines[Math.floor(Rf() * M.vines.length)];
      S.add(`<path d="${Q([[x, WY, z], [x, h, z], [x + w / 2, h + 1.6, z], [x + w, h, z], [x + w, WY, z]])}" fill="${hz(pal[0], 80)}"/>`);
      S.add(`<path d="${Q([[x, WY, z], [x, h * Rf.range(0.5, 0.95), z], [x + w * 0.5, h * Rf.range(0.6, 1), z], [x + w, h * Rf.range(0.4, 0.9), z], [x + w, WY, z]])}" fill="${hz(vin[Math.floor(Rf() * 3)], 75)}"/>`);
      S.add(`<path d="${L([[x - 0.1, h - 0.1, z], [x + w / 2, h + 1.65, z], [x + w + 0.1, h - 0.1, z]])}" fill="none" stroke="${hz(M.roof[Math.floor(Rf() * 4)], 80)}" stroke-width="5"/>`);
      let wn = '';
      for (let yy = 2; yy < h - 1; yy += 2.2) wn += Q([[x + w * 0.35, yy, z], [x + w * 0.35, yy + 1, z], [x + w * 0.65, yy + 1, z], [x + w * 0.65, yy, z]]);
      S.add(`<path d="${wn}" fill="${hz(M.glass, 80)}"/>`);
      x += w + 0.05;
    }
  }

  // --- the canal ----------------------------------------------------------------------------------------------------------
  {
    S.add(`<path d="${Q([[-XW, WY, 1.2], [-XW, WY, ZEND], [XW, WY, ZEND], [XW, WY, 1.2]])}" fill="${S.lin([[0, M.waterFar], [0.25, M.water], [1, M.waterDeep]], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(pr(0, WY, ZEND)[1])}" x2="0" y2="${H}"`)}"/>`);
    S.add(currents(rng(14004), 560, 1040, pr(0, WY, 40)[1], H, 90, M.waterHi, 0.35, 1));
    // a band of sky colour down the middle of the water (not a reflection — just the open sky's tint)
    S.add(`<path d="${Q([[-0.8, WY, 6], [-0.25, WY, ZEND], [0.25, WY, ZEND], [0.8, WY, 6]])}" fill="${M.waterHi}" opacity=".12"/>`);
  }

  // --- both banks: quay, edge timber, railing, then the facades ----------------------------------------------------------
  const houses = { '-1': [], '1': [] };
  for (const side of [-1, 1]) {
    const Rh = rng(14010 + side);
    for (let z = 1.5; z < ZEND; ) { const w = z < 12 ? Rh.range(3.2, 4.6) : Rh.range(2.4, 3.6); houses[side].push([z, z + w, Rh.range(7.2, 10.8), Rh.range(1.4, 2.4), Math.floor(Rh() * 4), Math.floor(Rh() * 8), Rh.range(0.45, 1), Rh() < 0.5]); z += w - 0.03; }
  }
  for (const side of [-1, 1]) {
    const s = side, lit = side > 0; // the right row faces the morning light
    // quay deck
    S.add(`<path d="${Q([[s * XW, 0, 1.2], [s * XW, 0, ZEND], [s * XF, 0, ZEND], [s * XF, 0, 1.2]])}" fill="${S.lin([[0, hz(M.plank.mid, 60)], [0.3, lit ? M.plank.lit : M.plank.mid], [1, M.plank.shade]], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(pr(0, 0, ZEND)[1])}" x2="0" y2="${H}"`)}"/>`);
    let seams = '';
    for (let z = 1.3; z < 40; z += 0.6 * (1 + z / 16)) seams += L([[s * XW, 0, z], [s * XF, 0, z]]);
    S.add(`<path d="${seams}" stroke="${M.plank.joint}" stroke-width="1.2" opacity=".45"/>`);
    // the timber face down to the water
    S.add(`<path d="${Q([[s * XW, 0, 1.2], [s * XW, WY, 1.2], [s * XW, WY, ZEND], [s * XW, 0, ZEND]])}" fill="${lit ? M.wood.shade : M.wood.mid}"/>`);
    let posts = '';
    for (let z = 1.6; z < 30; z += 1.6 * (1 + z / 12)) posts += L([[s * XW, 0, z], [s * XW, WY, z]]);
    S.add(`<path d="${posts}" stroke="${M.wood.deep}" stroke-width="2" opacity=".55"/>`);
  }

  // facades, far to near so the near ones overlap
  const facade = (side, [z0, z1, h, gh, pi, vi, cover, drape]) => {
    const s = side, x = s * XF, zm = (z0 + z1) / 2, lit = side > 0;
    const pal = M.plaster[pi], vin = M.vines[vi];
    const wall = lit ? pal[0] : mix(pal[1], '#6a7064', 0.25);
    const out = [];
    out.push(`<path d="${Q([[x, 0, z0], [x, h, z0], [x, h + gh, zm], [x, h, z1], [x, 0, z1]])}" fill="${hz(wall, zm)}"/>`);
    // the vine mantle: a wavy top edge, sometimes draping from the eaves as well
    const Rv = rng(Math.round(z0 * 1000) + (side > 0 ? 7 : 3));
    const top = [], n = zm < 20 ? 18 : 9;
    for (let i = 0; i <= n; i++) { const z = z0 + ((z1 - z0) * i) / n; const yy = Math.min(h + gh * (1 - Math.abs(2 * i / n - 1)) - 0.1, h * cover + Math.sin(i * 1.3 + z0) * 0.5 + Rv.range(-0.35, 0.35) + (i % 2 ? 0.25 : 0)); top.push([x, Math.max(0.6, yy), z]); }
    const mantle = [[x, 0, z0], ...top, [x, 0, z1]];
    const [ax] = pr(x, 0, z0), [bx] = pr(x, 0, z1);
    const vfill = zm > 30 ? hz(lit ? vin[1] : vin[0], zm) : S.lin([[0, hz(lit ? vin[2] : mix(vin[0], '#203028', 0.15), zm)], [0.5, hz(lit ? vin[1] : vin[0], zm)], [1, hz(lit ? vin[0] : mix(vin[1], '#203028', 0.25), zm)]], `gradientUnits="userSpaceOnUse" x1="${r0(ax)}" y1="0" x2="${r0(bx)}" y2="0"`);
    out.push(`<path d="${Q(mantle)}" fill="${vfill}"/>`);
    if (zm < 26) out.push(`<path d="${Q(mantle)}" fill="${leafFor(zm)}"/>`);
    if (drape) {
      const dr = [[x, h, z0 + 0.1]];
      for (let i = 0; i <= 6; i++) { const z = z0 + 0.1 + ((z1 - z0 - 0.2) * i) / 6; dr.push([x, h - Rv.range(0.6, 2.4), z]); }
      dr.push([x, h, z1 - 0.1], [x, h + gh * 0.6, zm]);
      out.push(`<path d="${Q(dr)}" fill="${hz(lit ? vin[1] : vin[0], zm)}"/>`);
      if (zm < 26) out.push(`<path d="${Q(dr)}" fill="${leafFor(zm)}"/>`);
    }
    // windows (trimmed clear of the vines), with frames and a glint; a flower box on some
    let gl = '', fr = '', hi = '', bx2 = '';
    const nw = Math.max(1, Math.round((z1 - z0) / 1.5));
    for (let yy = 1.6, k = 0; yy + 1.3 < h && zm < 50; yy += 2.3, k++) {
      for (let i = 0; i < nw; i++) {
        const zc = z0 + ((z1 - z0) * (i + 0.5)) / nw, ww = 0.27;
        gl += Q([[x, yy, zc - ww], [x, yy + 1.1, zc - ww], [x, yy + 1.1, zc + ww], [x, yy, zc + ww]]);
        if (zm < 16) fr += Q([[x, yy - 0.1, zc - ww - 0.1], [x, yy + 1.2, zc - ww - 0.1], [x, yy + 1.2, zc + ww + 0.1], [x, yy - 0.1, zc + ww + 0.1]]);
        if (lit && zm < 16) hi += Q([[x, yy + 1.0, zc - ww + 0.05], [x, yy + 1.0, zc - ww + 0.2], [x, yy + 0.35, zc - ww + 0.05]]);
        if ((i + k) % 3 === 0 && zm < 24) bx2 += Q([[x, yy - 0.25, zc - ww - 0.08], [x, yy, zc - ww - 0.08], [x, yy, zc + ww + 0.08], [x, yy - 0.25, zc + ww + 0.08]]);
      }
    }
    if (fr) out.push(`<path d="${fr}" fill="${hz(lit ? pal[1] : mix(pal[1], '#4a4e46', 0.35), zm)}"/>`);
    out.push(`<path d="${gl}" fill="${hz(M.glass, zm)}"/>`);
    if (hi) out.push(`<path d="${hi}" fill="${M.glassHi}" opacity=".35"/>`);
    if (bx2) {
      out.push(`<path d="${bx2}" fill="${hz(M.wood.shade, zm)}"/>`);
      for (const m of bx2.matchAll(/M(-?\d+),(-?\d+)L(-?\d+),(-?\d+)L(-?\d+),(-?\d+)/g)) {
        const xa = +m[1], ya = +m[4], xb = +m[5], rr = Math.max(1.6, 40 / zm);
        for (let t = 0.15; t < 1; t += 0.3) dot(xa + (xb - xa) * t, ya - rr * 0.6, rr, Math.round(t * 9 + zm) % 5);
      }
    }
    // leaf texture over the mantle: light and dark flecks, bigger near us
    if (zm < 40) {
      const acc = ['', '', ''];
      const cnt = Math.round(Math.min(70, 360 / zm));
      for (let i = 0; i < cnt; i++) {
        const z = Rv.range(z0 + 0.05, z1 - 0.05), t = (z - z0) / (z1 - z0), ti = Math.min(n - 1, Math.floor(t * n));
        const ymax = top[ti][1] + (top[ti + 1][1] - top[ti][1]) * (t * n - ti);
        const yy = Rv.range(0.4, ymax), [px, py] = pr(x, yy, z), rr = Math.max(1.5, Rv.range(0.06, 0.11) * F / z);
        const leaf = `M${r0(px - rr)},${r0(py)}q${r0(rr)},${r0(-rr * 0.9)} ${r0(rr * 2)},0q${r0(-rr)},${r0(rr * 0.9)} ${r0(-rr * 2)},0Z`;
        acc[i % 3] += leaf;
      }
      out.push(acc.map((d, j) => `<path d="${d}" fill="${hz(lit ? vin[(j + 1) % 3] : mix(vin[j], '#203028', 0.2), zm)}"/>`).join(''));
      // a few climbing stems
      let st = '';
      for (let i = 0; i < 3; i++) { const z = Rv.range(z0 + 0.3, z1 - 0.3), p0 = pr(x, 0, z), p1 = pr(x, h * cover * Rv.range(0.5, 0.9), z + Rv.range(-0.6, 0.6)); st += `M${r0(p0[0])},${r0(p0[1])}Q${r0((p0[0] + p1[0]) / 2 + Rv.range(-14, 14))},${r0((p0[1] + p1[1]) / 2)} ${r0(p1[0])},${r0(p1[1])}`; }
      out.push(`<path d="${st}" fill="none" stroke="${mix(vin[0], '#1a2a18', 0.4)}" stroke-width="${f(Math.max(1, 14 / zm), 1)}" opacity=".6"/>`);
    }
    // the gable roof edge and a door at quay level
    out.push(`<path d="${L([[x, h - 0.12, z0 - 0.12], [x, h + gh + 0.12, zm], [x, h - 0.12, z1 + 0.12]])}" fill="none" stroke="${hz(M.roof[pi], zm)}" stroke-width="${f(Math.max(3, 0.32 * F / zm), 1)}" stroke-linejoin="round"/>`);
    const dz = z0 + (z1 - z0) * 0.68;
    if (z0 > 6) out.push(`<path d="${Q([[x, 0, dz - 0.4], [x, 1.9, dz - 0.4], [x, 2.1, dz], [x, 1.9, dz + 0.4], [x, 0, dz + 0.4]])}" fill="${hz(M.wood.shade, zm)}" stroke="${hz(M.wood.deep, zm)}" stroke-width="${f(Math.max(1, 0.06 * F / zm), 1)}"/>`);
    return out.join('');
  };
  const all = [...houses['-1'].map((hh) => [-1, hh]), ...houses['1'].map((hh) => [1, hh])].sort((a, b) => b[1][0] - a[1][0]);

  // bridges at fixed depths; drawn interleaved with the facades by depth
  const bridge = (z, arch) => {
    const out = [], c = (col) => hz(col, z), pts = [], N = 16, span = XW + 0.5;
    for (let i = 0; i <= N; i++) { const x = -span + (2 * span * i) / N, u = x / span; pts.push([x, 0.15 + arch * (1 - u * u)]); }
    const topE = pts.map(([x, y]) => [x, y, z]), botE = pts.map(([x, y]) => [x, y - 0.35, z]).reverse();
    // supports into the water
    let legs = '';
    for (const x of [-XW + 0.3, -1.1, 1.1, XW - 0.3]) { const y = 0.15 + arch * (1 - (x / span) ** 2) - 0.35; legs += L([[x, y, z], [x, WY, z]]); }
    out.push(`<path d="${legs}" stroke="${c(M.wood.shade)}" stroke-width="${f(Math.max(2, 0.22 * F / z), 1)}"/>`);
    out.push(`<path d="${Q([...topE, ...botE])}" fill="${c(M.wood.mid)}"/><path d="${L(topE)}" fill="none" stroke="${c(M.wood.lit)}" stroke-width="${f(Math.max(1.5, 0.08 * F / z), 1)}"/>`);
    // railing
    let rail = '';
    for (let i = 0; i <= N; i += 2) { const [x, y] = pts[i]; rail += L([[x, y, z], [x, y + 0.85, z]]); }
    rail += L(pts.map(([x, y]) => [x, y + 0.85, z])) + L(pts.map(([x, y]) => [x, y + 0.45, z]));
    out.push(`<path d="${rail}" fill="none" stroke="${c(M.wood.shade)}" stroke-width="${f(Math.max(1.4, 0.06 * F / z), 1)}"/>`);
    // a vine trailing along the rail, changing colour from one end to the other
    let vn = '';
    const vv = M.vines[Math.round(z) % M.vines.length];
    const vb = ['', '', ''];
    for (let i = 0; i < N * 3; i++) { const t = i / (N * 3), x = -span + 2 * span * t, u = x / span, y = 0.15 + arch * (1 - u * u) + 0.85 - (i % 4) * 0.12, [px, py] = pr(x, y, z), rr = Math.max(1.2, 0.07 * F / z); vb[Math.min(2, Math.floor(t * 3))] += `M${r0(px - rr)},${r0(py)}q${r0(rr)},${r0(-rr)} ${r0(rr * 2)},0q${r0(-rr)},${r0(rr)} ${r0(-rr * 2)},0Z`; }
    vn = vb.map((d, j) => `<path d="${d}" fill="${c(vv[j])}"/>`).join('');
    out.push(vn);
    return out.join('');
  };
  const bridges = [[44, 0.7], [28, 0.8], [16, 0.9], [7.5, 1.1]];
  let bi = 0;
  for (const [side, hh] of all) {
    while (bi < bridges.length && bridges[bi][0] > hh[0]) { S.add(bridge(...bridges[bi])); bi++; }
    S.add(facade(side, hh));
  }
  while (bi < bridges.length) { S.add(bridge(...bridges[bi])); bi++; }

  // --- the quay railings, pots and mooring posts nearest us ------------------------------------------------------------------
  for (const side of [-1, 1]) {
    const s = side;
    let rp = '', rl = '';
    for (let z = 1.6; z < 7.2; z += 1.2 * (1 + z / 26)) rp += L([[s * XW, 0, z], [s * XW, 0.9, z]]);
    rl += L([[s * XW, 0.9, 1.3], [s * XW, 0.9, 7.2]]) + L([[s * XW, 0.5, 1.3], [s * XW, 0.5, 7.2]]);
    S.add(`<path d="${rp}${rl}" fill="none" stroke="${M.wood.deep}" stroke-width="2.4" opacity=".85"/>`);
    // flower pots along the house fronts
    let pots = '', fl = '';
    const Rp = rng(14020 + side);
    for (let z = 2.6; z < 7; z += Rp.range(1.6, 2.6)) {
      const [px, py] = pr(s * (XF - 0.35), 0, z), k = F / z, w = 0.22 * k, hh = 0.32 * k;
      pots += `M${r0(px - w)},${r0(py - hh)}h${r0(w * 2)}l${r0(-w * 0.25)},${r0(hh)}h${r0(-w * 1.5)}Z`;
      for (let q = 0; q < 4; q++) dot(px - w * 0.7 + q * w * 0.47, py - hh - w * 0.35 - (q % 2) * w * 0.3, w * 0.32, (Math.round(z) + q) % 5);
    }
    S.add(`<path d="${pots}" fill="#a8603e"/>`);
    // mooring posts on the edge
    let mp = '';
    for (const z of []) { const a = pr(s * (XW - 0.05), 0, z), b = pr(s * (XW - 0.05), 0.75, z), w = Math.max(3, 0.13 * F / z); mp += `M${r0(a[0] - w)},${r0(a[1])}V${r0(b[1])}h${r0(w * 2)}V${r0(a[1])}Z`; }
    S.add(`<path d="${mp}" fill="${M.wood.deep}"/>`);
  }

  S.add(flowerBuf.map((d, i) => (d ? `<path d="${d}" fill="${M.flowers[i]}"/>` : '')).join(''));

  // --- light: warm wash from the upper left, a touch of vignette -------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#fff2cc', 0.16], [0.5, '#fff2cc', 0], [1, '#1a2a24', 0.1]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.72, '#000', 0], [1, '#000', 0.28]], 'cx="0.5" cy="0.45" r="0.8"')}"/>`);
  return S.out();
}

export const sqDBgs = {
  'verdant-mirror-street-day': vineStreet,
};
