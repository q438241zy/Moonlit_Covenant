// 雾港·东口以下 (chapter 10): under the east outfall — the brick sewer, pump house No. 3 and the old cistern.
//   fog-harbor-sewer-pump — 砖拱水道与三号泵房: one pannable wide view in two halves, each in its own one-point
//                           perspective, joined by a brick pier (the seam sits in the phone crop with the door 三
//                           on its left and the pump on its right):
//     left  (10-02): the low brick-arched sewer running away into the dark: two tide lines of different height on its
//                    walls (the upper one higher than the tide outside ever comes), the slit and the small iron grate
//                    at the left wall foot, puddles, drag marks along the floor going on down past the iron door with
//                    「三」 painted on it, the floor stepping down at the far end; grey dawn through a grate in the vault.
//     right (10-03/04): the pump house — the old tide pump on its plinth with the float hung upside down on the far
//                    end of its lever and the bolted crystal-seat cover; the hopper heaped with thumb-sized white
//                    grubs over its mouth; the thick pipe running back and down through a low arch in the back wall,
//                    a chalk mark like an arch or a wave on that arch with 「大四」 under it; three sacks printed with
//                    a soup bowl against the wall, one open on black grit; empty green bottles on the floor.
//   fog-harbor-tide-cavity / fog-harbor-tide-cavity-ebb — see tideCavity().
// No mirrors, no reflections (water, glass and metal are flat colour), no figures, no seven rings, the soup bowl is
// a bowl (never a star), and nothing glows but daylight (script 10 美術需求).
import { Scene, W, H, f, pz, pl, persp, mix, rng } from './lib.mjs';
import { circ } from './coast.mjs';

const r0 = (v) => f(v, 0);

const SEW = {
  brick: { lit: '#7e5646', mid: '#5e3f34', shade: '#432d27', deep: '#2b1e1c', course: '#22171a', mortar: '#8e7464' },
  floor: [[0, '#4a3e36'], [1, '#17141a']], flag: '#2e2826', wet: '#1c2626', puddle: '#262e34', puddleHi: '#56626a',
  salt: '#a49c8a', iron: '#26282c', ironLit: '#6e7278', rust: '#7c4e36',
  copper: '#8c5636', copperLit: '#c07c4e', verd: '#5e8272',
  wood: { lit: '#7a6250', mid: '#58483a', shade: '#3a2e26' },
  sack: { lit: '#ae9a74', mid: '#867452', shade: '#5e5038' }, bowl: '#5a3a28', grit: '#121214',
  glass: '#3e6c4a', glassLit: '#86b492', glassDark: '#223c2a', seal: '#d8cdb0',
  paint: '#d6be88', chalk: '#e6e2d6', worm: '#ece6d2', wormShade: '#bdb4a0', light: '#d8dce2',
};

// ---------------------------------------------------------------------------------------------
// 砖拱水道与三号泵房
// ---------------------------------------------------------------------------------------------
function sewerPump() {
  const S = new Scene('sbSewerPump', '雾港·东口以下·砖拱水道与三号泵房：左边是往黑里去的低矮砖拱水道，砖墙上一高一低两道水痕，墙根的条缝与小铁栅，水洼，地上往下去的拖痕经过漆着「三」的铁门；右边是泵房，老潮泵的浮子倒挂在杠杆另一头，晶座盖用螺栓锁着，投料槽里挤满拇指大的白色小虫，往下走的粗管穿过墙根的矮拱，拱上粉笔画着像拱又像浪的记号，底下「大四」，墙边三个印着汤碗的麻袋（一袋开着，是黑色碎粒），地上几个空的绿玻璃瓶', 7101);
  const R = S.R;
  const B = SEW.brick;
  const SEAM0 = 722, SEAM1 = 792; // the brick pier between the halves

  S.add(`<rect width="${W}" height="${H}" fill="#120e10"/>`);

  // ===================================== left: the sewer =====================================
  {
    const VP = [400, 450], F = 600, EYE = 1.5;
    const pr = persp({ vp: VP, F, eye: EYE });
    const q = (pts) => pr.quad(pts);
    const XW = 1.1, YS = 1.7, RV = XW, ZN = 1.3, ZF = 17; // half width, springing, vault radius, near / far
    const arc = (z, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const t = Math.PI * i / n; return pr(XW * Math.cos(t), YS + RV * Math.sin(t), z); });
    const o = [];
    // the far end: black under the last arch
    o.push(`<path d="${pz([pr(XW, 0, ZF), ...arc(ZF), pr(-XW, 0, ZF)])}" fill="#06060a"/>`);
    // vault: wedges between springings, cel-shaded (lit toward the crown where the grate lets the dawn in)
    const NV = 12;
    for (let i = 0; i < NV; i++) {
      const t0 = Math.PI * i / NV, t1 = Math.PI * (i + 1) / NV, tm = (t0 + t1) / 2;
      const c = mix(B.mid, B.deep, Math.abs(Math.cos(tm)) * 0.55 + (i < NV / 2 ? 0.12 : 0));
      o.push(`<path d="${q([[XW * Math.cos(t0), YS + RV * Math.sin(t0), ZN], [XW * Math.cos(t1), YS + RV * Math.sin(t1), ZN], [XW * Math.cos(t1), YS + RV * Math.sin(t1), ZF], [XW * Math.cos(t0), YS + RV * Math.sin(t0), ZF]])}" fill="${c}"/>`);
    }
    // walls and floor
    o.push(`<path d="${q([[-XW, 0, ZN], [-XW, YS, ZN], [-XW, YS, ZF], [-XW, 0, ZF]])}" fill="${S.lin([[0, B.lit], [1, B.shade]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    o.push(`<path d="${q([[XW, 0, ZN], [XW, YS, ZN], [XW, YS, ZF], [XW, 0, ZF]])}" fill="${S.lin([[0, B.shade], [1, B.mid]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    o.push(`<path d="${q([[-XW, 0, 0.9], [XW, 0, 0.9], [XW, 0, ZF], [-XW, 0, ZF]])}" fill="${S.lin(SEW.floor, `gradientUnits="userSpaceOnUse" x1="0" y1="${VP[1]}" x2="0" y2="${H}"`)}"/>`);
    // brick courses: wall courses converge on the vanishing point, vault courses are lines along the tunnel
    let co = '';
    for (let y = 0.17; y < YS; y += 0.17) co += pl(pr.poly([[-XW, y, ZN], [-XW, y, ZF]])) + pl(pr.poly([[XW, y, ZN], [XW, y, ZF]]));
    for (let i = 1; i < 24; i++) { const t = Math.PI * i / 24; co += pl(pr.poly([[XW * Math.cos(t), YS + RV * Math.sin(t), ZN], [XW * Math.cos(t), YS + RV * Math.sin(t), ZF]])); }
    let jo = '';
    for (let z = ZN + 0.1; z < 7; z += 0.24) {
      for (let k = 0; k < 10; k++) {
        const y = k * 0.17, zz = z + (k % 2) * 0.12;
        jo += pl(pr.poly([[-XW, y, zz], [-XW, y + 0.17, zz]])) + pl(pr.poly([[XW, y, zz], [XW, y + 0.17, zz]]));
      }
    }
    o.push(`<path d="${co}" stroke="${B.course}" stroke-width="1.3" opacity=".55"/><path d="${jo}" stroke="${B.course}" stroke-width="1" opacity=".35"/>`);
    // floor flags (lines across and along)
    let fl = '';
    for (let z = 1.2; z < ZF; z *= 1.22) fl += pl(pr.poly([[-XW, 0, z], [XW, 0, z]]));
    for (const x of [-0.55, 0, 0.55]) fl += pl(pr.poly([[x, 0, 0.9], [x, 0, ZF]]));
    o.push(`<path d="${fl}" stroke="#0e0c0e" stroke-width="1.4" opacity=".5"/>`);
    // transverse arch ribs: lit soffit band + dark underside line
    for (const z of [ZN + 0.2, 2.1, 2.9, 3.8, 4.8, 6.0, 7.5, 9.3, 11.5, 14.2]) { // ten ribs (never a count of seven rings)
      const kk = F / z, path = pl([pr(-XW, 0, z), pr(-XW, YS, z), ...arc(z).reverse(), pr(XW, 0, z)]);
      o.push(`<path d="${path}" fill="none" stroke="${mix(B.lit, B.deep, Math.min(0.7, (z - 1.5) / 14))}" stroke-width="${f(0.2 * kk)}" stroke-linejoin="round"/>`);
      o.push(`<path d="${pl([pr(-XW, 0, z + 0.12), pr(-XW, YS, z + 0.12), ...arc(z + 0.12).reverse(), pr(XW, 0, z + 0.12)])}" fill="none" stroke="${B.course}" stroke-width="${f(Math.max(1, 0.035 * kk))}" opacity=".7"/>`);
    }
    // the two tide lines on both walls: the low one is the harbour's tide (wet and green below it); the high one,
    // a pale salt line with a faint stain under it, stands higher than any tide outside
    for (const side of [-1, 1]) {
      const x = side * XW;
      o.push(`<path d="${q([[x, 0, ZN], [x, 0.74, ZN], [x, 0.74, ZF], [x, 0, ZF]])}" fill="${SEW.wet}" opacity=".5"/>`);
      o.push(`<path d="${q([[x, 0.72, ZN], [x, 0.77, ZN], [x, 0.77, ZF], [x, 0.72, ZF]])}" fill="#6e7c64" opacity=".6"/>`);
      o.push(`<path d="${q([[x, 0.96, ZN], [x, 1.27, ZN], [x, 1.27, ZF], [x, 0.96, ZF]])}" fill="${SEW.wet}" opacity=".2"/>`);
      o.push(`<path d="${q([[x, 1.27, ZN], [x, 1.305, ZN], [x, 1.305, ZF], [x, 1.27, ZF]])}" fill="${SEW.salt}" opacity=".36"/>`);
    }
    // the slit along the left wall foot and the small iron grate further in
    o.push(`<path d="${q([[-XW, 0.07, 2.3], [-XW, 0.15, 2.3], [-XW, 0.15, 4.3], [-XW, 0.07, 4.3]])}" fill="#07070a"/>`);
    o.push(`<path d="${q([[-XW, 0.02, 5.0], [-XW, 0.42, 5.0], [-XW, 0.42, 5.55], [-XW, 0.02, 5.55]])}" fill="#07070a"/>`);
    let gb = '';
    for (const z of [5.1, 5.21, 5.32, 5.43]) gb += pl(pr.poly([[-XW, 0.02, z], [-XW, 0.42, z]]));
    gb += pl(pr.poly([[-XW, 0.22, 5.0], [-XW, 0.22, 5.55]]));
    o.push(`<path d="${gb}" stroke="${SEW.iron}" stroke-width="3"/><path d="${pl(pr.poly([[-XW, 0.42, 5.0], [-XW, 0.42, 5.55]]))}" stroke="${SEW.ironLit}" stroke-width="1.5" opacity=".6"/>`);
    // the iron door in the right wall, ajar: stone jambs and lintel, riveted plates, 「三」 painted across it
    {
      const z0 = 2.6, z1 = 3.4, top = 1.62;
      o.push(`<path d="${q([[XW - 0.01, 0, z0 - 0.07], [XW - 0.01, top + 0.1, z0 - 0.07], [XW - 0.01, top + 0.1, z1 + 0.07], [XW - 0.01, 0, z1 + 0.07]])}" fill="#6e685e"/>`);
      o.push(`<path d="${q([[XW - 0.02, 0, z0 - 0.04], [XW - 0.02, top + 0.06, z0 - 0.04], [XW - 0.02, top + 0.06, z1 + 0.04], [XW - 0.02, 0, z1 + 0.04]])}" fill="#08080a"/>`);
      // the leaf, pushed in a hand's breadth at its near edge (a dark gap shows along it)
      o.push(`<path d="${q([[XW + 0.06, 0, z0 + 0.03], [XW + 0.06, top, z0 + 0.03], [XW - 0.02, top, z1], [XW - 0.02, 0, z1]])}" fill="${SEW.iron}"/>`);
      o.push(`<path d="${q([[XW + 0.06, 0, z0 + 0.03], [XW + 0.06, top, z0 + 0.03], [XW + 0.04, top, z0 + 0.14], [XW + 0.04, 0, z0 + 0.14]])}" fill="${SEW.ironLit}" opacity=".45"/>`);
      const lx = (t) => XW + 0.06 - 0.08 * t, lz = (t) => z0 + 0.03 + (z1 - z0 - 0.03) * t;
      let seams = '', rv = '';
      for (const y of [0.45, 0.95, 1.4]) seams += pl([pr(lx(0), y, lz(0)), pr(lx(1), y, lz(1))]);
      for (const t of [0.08, 0.92]) for (let y = 0.15; y < top; y += 0.22) { const p = pr(lx(t), y, lz(t)); rv += circ(p[0], p[1], 2); }
      o.push(`<path d="${seams}" stroke="#141518" stroke-width="2"/><path d="${rv}" fill="${SEW.ironLit}" opacity=".7"/>`);
      o.push(`<path d="${q([[lx(0) + 0.001, 0, lz(0)], [lx(0) + 0.001, 0.5, lz(0)], [lx(1), 0.5, lz(1)], [lx(1), 0, lz(1)]])}" fill="${SEW.rust}" opacity=".4"/>`);
      // 三: three quick brush strokes in pale paint (the bottom one the longest), thick at the start, thinning and
      // ragged where the brush ran dry, a couple of drips under the last; they follow the leaf's perspective
      let san = '', drip = '';
      for (const [y, a, b, th] of [[1.3, 0.26, 0.7, 0.05], [1.08, 0.3, 0.66, 0.046], [0.83, 0.18, 0.8, 0.055]]) {
        const pts = [], n = 6;
        for (let i = 0; i <= n; i++) { const t = a + (b - a) * i / n; pts.push(pr(lx(t), y + R.range(-0.006, 0.006) + 0.01 * (i / n), lz(t))); }
        for (let i = n; i >= 0; i--) { const t = a + (b - a) * i / n, w = th * (1 - 0.45 * (i / n)) * R.range(0.85, 1.1); pts.push(pr(lx(t), y - w + 0.01 * (i / n), lz(t))); }
        san += pz(pts);
      }
      for (const t of [0.34, 0.62]) drip += pl([pr(lx(t), 0.78, lz(t)), pr(lx(t), 0.78 - R.range(0.06, 0.12), lz(t))]);
      o.push(`<path d="${san}" fill="${SEW.paint}" opacity=".82"/><path d="${drip}" stroke="${SEW.paint}" stroke-width="2" stroke-linecap="round" opacity=".7"/>`);
    }
    // puddles and the drag marks: from the steps behind us along the floor, past the door, on down into the dark
    let pud = '', pudHi = '';
    for (const [x, z, rx, rz] of [[-0.55, 1.5, 0.32, 0.22], [0.25, 2.0, 0.28, 0.2], [-0.3, 3.4, 0.4, 0.4], [0.5, 4.9, 0.35, 0.5], [-0.4, 7.4, 0.45, 0.9]]) {
      const pts = [];
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, kq = R.range(0.75, 1.1); pts.push(pr(x + Math.cos(a) * rx * kq, 0, z + Math.sin(a) * rz * kq)); }
      pud += pz(pts);
      pudHi += pl([pr(x - rx * 0.5, 0, z + rz * 0.85), pr(x + rx * 0.4, 0, z + rz * 0.9)]);
    }
    o.push(`<path d="${pud}" fill="${SEW.puddle}"/><path d="${pudHi}" stroke="${SEW.puddleHi}" stroke-width="1.6" opacity=".55"/>`);
    let drag = '';
    const dragPath = [[-0.7, 0.95], [-0.35, 1.5], [0.1, 2.1], [0.45, 2.8], [0.55, 3.6], [0.45, 5], [0.3, 7], [0.2, 10], [0.15, 14]];
    for (const [off, w0] of [[-0.13, 0.05], [0.02, 0.07], [0.13, 0.04]]) {
      const L = [], Rr = [];
      for (const [x, z] of dragPath) { const w = w0 * R.range(0.7, 1.2); L.push(pr(x + off - w, 0, z)); Rr.unshift(pr(x + off + w * 0.8, 0, z)); }
      drag += pz([...L, ...Rr]);
    }
    o.push(`<path d="${drag}" fill="#0c0a0c" opacity=".38"/>`);
    // the floor stepping down at the far end, into the dark
    let st = '';
    for (const [z, y] of [[13, 0], [13.5, -0.25], [14, -0.5], [14.5, -0.75]]) st += pl(pr.poly([[-XW, y, z], [XW, y, z]]));
    o.push(`<path d="${st}" stroke="#5a4a42" stroke-width="1.6" opacity=".6"/>`);
    // dawn through the grate in the vault crown: the barred square, the beam, the patch of light on the floor
    {
      const g0 = 4.0, g1 = 4.5, gx = 0.24, gy = YS + RV - 0.005;
      o.push(`<path d="${q([[-gx, gy, g0], [gx, gy, g0], [gx, gy, g1], [-gx, gy, g1]])}" fill="${SEW.light}"/>`);
      let bars = '';
      for (const x of [-0.12, 0, 0.12]) bars += pl(pr.poly([[x, gy, g0], [x, gy, g1]]));
      o.push(`<path d="${bars}" stroke="${SEW.iron}" stroke-width="3"/>`);
      o.push(`<path d="${pz([pr(-gx, gy, g0), pr(gx, gy, g0), pr(gx + 0.25, 0, g1 + 0.3), pr(-gx + 0.1, 0, g1 + 0.3), pr(-gx + 0.1, 0, g0 + 0.2)])}" fill="${SEW.light}" opacity=".13" filter="${S.blur(2)}"/>`);
      o.push(`<path d="${q([[-gx + 0.1, 0, g0 + 0.2], [gx + 0.25, 0, g0 + 0.2], [gx + 0.25, 0, g1 + 0.3], [-gx + 0.1, 0, g1 + 0.3]])}" fill="${SEW.light}" opacity=".18" filter="${S.blur(1)}"/>`);
    }
    // darkness swallowing the far reach
    o.push(`<circle cx="${VP[0]}" cy="${VP[1] - 20}" r="300" fill="${S.rad([[0, '#040406', 0.95], [0.35, '#040406', 0.7], [1, '#040406', 0]])}"/>`);
    S.add(`<g clip-path="${S.clip(`M-10,-10H${SEAM0 + 4}V910H-10Z`)}">${o.join('')}</g>`);
  }

  // ===================================== right: the pump house =====================================
  {
    const VP = [1100, 440], F = 640, EYE = 1.6;
    const pr = persp({ vp: VP, F, eye: EYE });
    const q = (pts) => pr.quad(pts);
    const X0 = -1.6, X1 = 5.2, ZB = 7.0, ZN = 2.0, YS = 2.6, RV = (X1 - X0) / 2, XC = (X0 + X1) / 2;
    const vpt = (t, z) => [XC + RV * Math.cos(t), YS + RV * Math.sin(t), z];
    const o = [];
    // back wall (arch-topped), side walls, floor, vault
    const back = [pr(X0, 0, ZB), ...Array.from({ length: 25 }, (_, i) => pr(...vpt(Math.PI - Math.PI * i / 24, ZB))), pr(X1, 0, ZB)];
    o.push(`<path d="${pz(back)}" fill="${S.lin([[0, B.mid], [0.6, B.lit], [1, B.mid]])}"/>`);
    const NV = 12;
    for (let i = 0; i < NV; i++) {
      const t0 = Math.PI * i / NV, t1 = Math.PI * (i + 1) / NV, tm = (t0 + t1) / 2;
      o.push(`<path d="${q([vpt(t0, ZN), vpt(t1, ZN), vpt(t1, ZB), vpt(t0, ZB)])}" fill="${mix(B.mid, B.deep, Math.abs(Math.cos(tm)) * 0.5 + (i < NV / 2 ? 0.1 : 0))}"/>`);
    }
    o.push(`<path d="${q([[X0, 0, ZN], [X0, YS, ZN], [X0, YS, ZB], [X0, 0, ZB]])}" fill="${S.lin([[0, B.lit], [1, B.mid]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    o.push(`<path d="${q([[X1, 0, ZN], [X1, YS, ZN], [X1, YS, ZB], [X1, 0, ZB]])}" fill="${S.lin([[0, B.mid], [1, B.shade]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    o.push(`<path d="${q([[X0, 0, 1.2], [X1, 0, 1.2], [X1, 0, ZB], [X0, 0, ZB]])}" fill="${S.lin(SEW.floor, `gradientUnits="userSpaceOnUse" x1="0" y1="${VP[1]}" x2="0" y2="${H}"`)}"/>`);
    // courses: back wall frontal (staggered joints), side walls and vault converge on the vanishing point
    let co = '', jo = '';
    const kB = F / ZB;
    for (let y = 0.17, row = 0; y < YS + RV; y += 0.17, row++) {
      const yy = VP[1] - (y - EYE) * kB;
      const half = y <= YS ? RV : Math.sqrt(Math.max(0, RV * RV - (y - YS) ** 2));
      const xa = VP[0] + (XC - half) * kB, xb = VP[0] + (XC + half) * kB;
      co += `M${r0(xa)},${r0(yy)}H${r0(xb)}`;
      for (let x = xa + (row % 2) * 14; x < xb; x += 28) jo += `M${r0(x)},${r0(yy)}v${r0(0.17 * kB)}`;
    }
    for (let y = 0.17; y < YS; y += 0.17) co += pl(pr.poly([[X0, y, ZN], [X0, y, ZB]])) + pl(pr.poly([[X1, y, ZN], [X1, y, ZB]]));
    for (let i = 1; i < 30; i++) co += pl(pr.poly([vpt(Math.PI * i / 30, ZN), vpt(Math.PI * i / 30, ZB)]));
    let fl = '';
    for (let z = 2.2; z < ZB; z *= 1.18) fl += pl(pr.poly([[X0, 0, z], [X1, 0, z]]));
    for (let x = X0 + 0.85; x < X1; x += 0.85) fl += pl(pr.poly([[x, 0, 1.2], [x, 0, ZB]]));
    o.push(`<path d="${co}" stroke="${B.course}" stroke-width="1.3" opacity=".5"/><path d="${jo}" stroke="${B.course}" stroke-width="1" opacity=".35"/><path d="${fl}" stroke="#0e0c0e" stroke-width="1.4" opacity=".45"/>`);
    // two arch ribs across the vault
    for (const z of [3.6, 6.0]) {
      const kk = F / z;
      o.push(`<path d="${pl([pr(X0, 0, z), pr(X0, YS, z), ...Array.from({ length: 25 }, (_, i) => pr(...vpt(Math.PI - Math.PI * i / 24, z))), pr(X1, YS, z), pr(X1, 0, z)])}" fill="none" stroke="${mix(B.lit, B.deep, (z - 3) / 8)}" stroke-width="${f(0.22 * kk)}" stroke-linejoin="round"/>`);
    }
    // a damp band along the wall feet (the pump house floods too, lower)
    o.push(`<path d="${q([[X0 + 0.01, 0, ZN], [X0 + 0.01, 0.5, ZN], [X0 + 0.01, 0.5, ZB], [X0 + 0.01, 0, ZB]])}" fill="${SEW.wet}" opacity=".35"/><path d="${pz([pr(X0, 0, ZB - 0.01), pr(X0, 0.5, ZB - 0.01), pr(X1, 0.5, ZB - 0.01), pr(X1, 0, ZB - 0.01)])}" fill="${SEW.wet}" opacity=".35"/>`);
    // dawn through the light well in the vault: the opening, the beam onto the floor between pump and hopper
    {
      const t0 = 1.75, t1 = 2.05, z0 = 4.4, z1 = 5.2;
      o.push(`<path d="${q([vpt(t0, z0), vpt(t1, z0), vpt(t1, z1), vpt(t0, z1)])}" fill="${SEW.light}"/>`);
      const a = vpt(t0, z0), b = vpt(t1, z1);
      o.push(`<path d="${pz([pr(...vpt(t1, z0)), pr(...vpt(t0, z0)), pr(a[0] + 0.6, 0, z0 + 0.3), pr(a[0] + 0.6, 0, z1 + 0.5), pr(b[0] + 0.2, 0, z1 + 0.5), pr(...vpt(t1, z1))])}" fill="${SEW.light}" opacity=".12" filter="${S.blur(2)}"/>`);
      o.push(`<path d="${q([[b[0] + 0.2, 0, z0 + 0.3], [a[0] + 0.6, 0, z0 + 0.3], [a[0] + 0.6, 0, z1 + 0.5], [b[0] + 0.2, 0, z1 + 0.5]])}" fill="${SEW.light}" opacity=".16" filter="${S.blur(1)}"/>`);
    }

    // --- the low arch in the back wall, the thick pipe going down through it, the chalk on the arch ---------------
    const AX0 = 2.8, AX1 = 3.8, AH = 0.95;
    {
      const k = kB, X = (x) => VP[0] + x * k, Y = (y) => VP[1] - (y - EYE) * k;
      const cx = X((AX0 + AX1) / 2), rx = (AX1 - AX0) / 2 * k;
      o.push(`<path d="M${r0(X(AX0) - 0.16 * k)},${r0(Y(0))}V${r0(Y(AH - 0.2))}A${r0(rx + 0.16 * k)},${r0(0.36 * k + 0.16 * k)} 0 0 1 ${r0(X(AX1) + 0.16 * k)},${r0(Y(AH - 0.2))}V${r0(Y(0))}Z" fill="#8a7466"/>`);
      let vs = '';
      for (let i = 0; i <= 8; i++) { const a = Math.PI + i * Math.PI / 8; vs += `M${r0(cx + Math.cos(a) * rx)},${r0(Y(AH - 0.2) + Math.sin(a) * 0.36 * k)}L${r0(cx + Math.cos(a) * (rx + 0.16 * k))},${r0(Y(AH - 0.2) + Math.sin(a) * 0.52 * k)}`; }
      o.push(`<path d="M${r0(X(AX0))},${r0(Y(0))}V${r0(Y(AH - 0.2))}A${r0(rx)},${r0(0.36 * k)} 0 0 1 ${r0(X(AX1))},${r0(Y(AH - 0.2))}V${r0(Y(0))}Z" fill="#070608"/><path d="${vs}" stroke="${B.course}" stroke-width="1.6" opacity=".7"/>`);
      // the chalk: a mark like an arch whose end curls over like a wave, and 大四 under it (rough, fast strokes)
      const cy = Y(AH + 0.98), u = 0.3 * k;
      const mark = `M${r0(cx - u)},${r0(cy + u * 0.5)}C${r0(cx - u)},${r0(cy - u * 0.55)} ${r0(cx + u * 0.75)},${r0(cy - u * 0.6)} ${r0(cx + u * 0.8)},${r0(cy + u * 0.05)}C${r0(cx + u * 0.82)},${r0(cy + u * 0.35)} ${r0(cx + u * 0.42)},${r0(cy + u * 0.38)} ${r0(cx + u * 0.42)},${r0(cy + u * 0.08)}M${r0(cx + u * 0.8)},${r0(cy + u * 0.05)}C${r0(cx + u * 0.95)},${r0(cy + u * 0.3)} ${r0(cx + u * 1.05)},${r0(cy + u * 0.45)} ${r0(cx + u * 1.15)},${r0(cy + u * 0.5)}`;
      const c2 = Y(AH + 0.45), s = 0.13 * k, xa = cx - s * 1.15, xb = cx + s * 1.15;
      // 大
      const da = `M${r0(xa - s * 0.8)},${r0(c2 - s * 0.35)}h${r0(s * 1.6)}M${r0(xa + s * 0.02)},${r0(c2 - s)}c0,${r0(s * 0.9)} -${r0(s * 0.3)},${r0(s * 1.5)} -${r0(s * 0.85)},${r0(s * 1.9)}M${r0(xa + s * 0.05)},${r0(c2 - s * 0.2)}c${r0(s * 0.3)},${r0(s * 0.6)} ${r0(s * 0.5)},${r0(s * 0.9)} ${r0(s * 0.85)},${r0(s * 1.1)}`;
      // 四
      const si = `M${r0(xb - s * 0.75)},${r0(c2 - s * 0.75)}v${r0(s * 1.6)}M${r0(xb - s * 0.75)},${r0(c2 - s * 0.75)}h${r0(s * 1.5)}v${r0(s * 1.6)}M${r0(xb - s * 0.75)},${r0(c2 + s * 0.8)}h${r0(s * 1.5)}M${r0(xb - s * 0.22)},${r0(c2 - s * 0.7)}c0,${r0(s * 0.5)} -${r0(s * 0.1)},${r0(s * 0.8)} -${r0(s * 0.32)},${r0(s * 1.0)}M${r0(xb + s * 0.22)},${r0(c2 - s * 0.7)}v${r0(s * 0.85)}h${r0(s * 0.3)}`;
      o.push(`<path d="${mark}${da}${si}" fill="none" stroke="${SEW.chalk}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`);
    }

    // --- three sacks against the back wall's right end, printed with a soup bowl; the near one open on black grit --
    {
      const sack = (x, z, w, h, open) => {
        const k = F / z, a = pr(x, 0, z), cx = a[0], by = a[1], W2 = w * k / 2, Hh = h * k;
        let s = `<ellipse cx="${r0(cx)}" cy="${r0(by)}" rx="${r0(W2 * 1.05)}" ry="${r0(0.08 * k)}" fill="#0c0a0c" opacity=".5"/>`;
        const body = open
          ? `M${r0(cx - W2)},${r0(by)}C${r0(cx - W2 * 1.1)},${r0(by - Hh * 0.5)} ${r0(cx - W2 * 0.9)},${r0(by - Hh * 0.9)} ${r0(cx - W2 * 0.75)},${r0(by - Hh)}L${r0(cx + W2 * 0.75)},${r0(by - Hh * 1.02)}C${r0(cx + W2 * 0.9)},${r0(by - Hh * 0.9)} ${r0(cx + W2 * 1.1)},${r0(by - Hh * 0.5)} ${r0(cx + W2)},${r0(by)}Z`
          : `M${r0(cx - W2)},${r0(by)}C${r0(cx - W2 * 1.12)},${r0(by - Hh * 0.55)} ${r0(cx - W2 * 0.85)},${r0(by - Hh * 0.92)} ${r0(cx - W2 * 0.4)},${r0(by - Hh)}Q${r0(cx)},${r0(by - Hh * 1.22)} ${r0(cx + W2 * 0.4)},${r0(by - Hh)}C${r0(cx + W2 * 0.85)},${r0(by - Hh * 0.92)} ${r0(cx + W2 * 1.12)},${r0(by - Hh * 0.55)} ${r0(cx + W2)},${r0(by)}Z`;
        s += `<path d="${body}" fill="${SEW.sack.mid}"/><path d="M${r0(cx - W2)},${r0(by)}C${r0(cx - W2 * 1.12)},${r0(by - Hh * 0.55)} ${r0(cx - W2 * 0.85)},${r0(by - Hh * 0.92)} ${r0(cx - W2 * 0.4)},${r0(by - Hh)}L${r0(cx - W2 * 0.3)},${r0(by)}Z" fill="${SEW.sack.lit}" opacity=".6"/>`;
        s += `<path d="M${r0(cx + W2 * 0.45)},${r0(by - Hh * 0.9)}q${r0(W2 * 0.3)},${r0(Hh * 0.45)} ${r0(W2 * 0.2)},${r0(Hh * 0.88)}M${r0(cx - W2 * 0.6)},${r0(by - Hh * 0.15)}q${r0(W2 * 0.5)},${r0(-Hh * 0.08)} ${r0(W2 * 1.1)},${r0(Hh * 0.02)}" fill="none" stroke="${SEW.sack.shade}" stroke-width="${f(Math.max(1.2, 0.02 * k))}" opacity=".8"/>`;
        // the printed soup bowl: a half-round bowl under a rim line, three wisps of steam (a bowl, never a star)
        const bx = cx - W2 * 0.05, byy = by - Hh * 0.5, bw = W2 * 0.42;
        s += `<path d="M${r0(bx - bw)},${r0(byy)}h${r0(bw * 2)}a${r0(bw)},${r0(bw * 0.75)} 0 0 1 ${r0(-bw * 2)},0z" fill="${SEW.bowl}" opacity=".85"/><path d="M${r0(bx - bw * 1.15)},${r0(byy - bw * 0.12)}h${r0(bw * 2.3)}" stroke="${SEW.bowl}" stroke-width="${f(Math.max(1.2, bw * 0.12))}" opacity=".85"/>`;
        s += `<path d="M${r0(bx - bw * 0.5)},${r0(byy - bw * 0.35)}q${r0(-bw * 0.2)},${r0(-bw * 0.35)} 0,${r0(-bw * 0.7)}M${r0(bx)},${r0(byy - bw * 0.35)}q${r0(-bw * 0.2)},${r0(-bw * 0.35)} 0,${r0(-bw * 0.7)}M${r0(bx + bw * 0.5)},${r0(byy - bw * 0.35)}q${r0(-bw * 0.2)},${r0(-bw * 0.35)} 0,${r0(-bw * 0.7)}" fill="none" stroke="${SEW.bowl}" stroke-width="${f(Math.max(1, bw * 0.1))}" stroke-linecap="round" opacity=".8"/>`;
        if (open) {
          // the mouth rolled back on a heap of black grit, a spill of it on the floor, wet at its edge
          s += `<ellipse cx="${r0(cx)}" cy="${r0(by - Hh)}" rx="${r0(W2 * 0.78)}" ry="${r0(0.1 * k)}" fill="${SEW.sack.shade}"/><ellipse cx="${r0(cx)}" cy="${r0(by - Hh + 0.01 * k)}" rx="${r0(W2 * 0.62)}" ry="${r0(0.07 * k)}" fill="${SEW.grit}"/>`;
          let gr = '';
          for (let i = 0; i < 26; i++) { const gx = cx - W2 * 0.6 + R() * W2 * 1.2, gy = by - Hh - 0.06 * k + R() * 0.05 * k; gr += circ(gx, gy, R.range(1.2, 2.6)); }
          s += `<path d="${gr}" fill="${SEW.grit}"/>`;
          s += `<path d="M${r0(cx + W2 * 0.4)},${r0(by + 2)}q${r0(W2 * 0.5)},${r0(0.05 * k)} ${r0(W2 * 1.1)},${r0(0.02 * k)}q${r0(-W2 * 0.4)},${r0(0.07 * k)} ${r0(-W2 * 1.1)},${r0(0.02 * k)}z" fill="${SEW.grit}"/><path d="M${r0(cx + W2 * 0.6)},${r0(by + 0.05 * k)}q${r0(W2 * 0.4)},${r0(0.02 * k)} ${r0(W2 * 0.85)},${r0(-0.01 * k)}" stroke="#3a4a50" stroke-width="1.4" opacity=".7"/>`;
        }
        return s;
      };
      o.push(sack(4.8, 6.75, 0.62, 0.78, false) + sack(4.2, 6.6, 0.6, 0.74, false) + sack(3.95, 5.9, 0.6, 0.62, true));
    }

    // --- the hopper: a wooden trough on legs heaped with small white grubs, its spout into the thick pipe ---------
    const HX0 = 1.15, HX1 = 2.25, HZ0 = 4.9, HZ1 = 5.8, HT = 1.05;
    const SX0 = (HX0 + HX1) / 2 - 0.12, SX1 = SX0 + 0.24, SZ = HZ0 + 0.3; // the hopper's spout
    {
      const w = SEW.wood;
      // the pipe from the spout running back along the floor and down through the low arch
      o.push(`<path d="${q([[SX0, 0.22, SZ + 0.1], [SX1, 0.22, SZ + 0.1], [AX0 + 0.62, 0.22, ZB], [AX0 + 0.38, 0.22, ZB]])}" fill="${SEW.iron}"/><path d="${q([[SX0, 0.32, SZ + 0.1], [SX1, 0.32, SZ + 0.1], [AX0 + 0.62, 0.32, ZB], [AX0 + 0.38, 0.32, ZB]])}" fill="${SEW.ironLit}" opacity=".35"/>`);
      o.push(`<path d="${q([[AX0 + 0.2, 0.05, ZB - 0.02], [AX0 + 0.8, 0.05, ZB - 0.02], [AX0 + 0.8, 0.6, ZB - 0.02], [AX0 + 0.2, 0.6, ZB - 0.02]])}" fill="${SEW.iron}"/>`);
      let fl2 = '';
      for (const z of [SZ + 0.7, SZ + 1.4]) { const t = (z - SZ - 0.1) / (ZB - SZ - 0.1), a = pr(SX0 + (AX0 + 0.38 - SX0) * t, 0.38, z), b = pr(SX1 + (AX0 + 0.62 - SX1) * t, 0.38, z); fl2 += `M${r0(a[0] - 2)},${r0(a[1])}h${r0(b[0] - a[0] + 4)}`; }
      o.push(`<path d="${fl2}" stroke="#141518" stroke-width="3"/>`);
      // legs
      let legs = '';
      for (const [x, z] of [[HX0 + 0.06, HZ0], [HX1 - 0.06, HZ0], [HX0 + 0.06, HZ1], [HX1 - 0.06, HZ1]]) legs += pl([pr(x, 0, z), pr(x, HT - 0.3, z)]);
      o.push(`<path d="${legs}" stroke="${w.shade}" stroke-width="7"/>`);
      // the box: front face tapering to the spout, the top opening seen from a little above
      o.push(`<path d="${pz([pr(HX0, HT, HZ0), pr(HX1, HT, HZ0), pr(HX1 - 0.25, HT - 0.55, HZ0 + 0.1), pr(SX1, 0.42, SZ), pr(SX0, 0.42, SZ), pr(HX0 + 0.25, HT - 0.55, HZ0 + 0.1)])}" fill="${w.mid}"/>`);
      o.push(`<path d="${pz([pr(HX0, HT, HZ0), pr(HX0 + 0.3, HT, HZ0), pr(HX0 + 0.4, HT - 0.55, HZ0 + 0.1), pr(HX0 + 0.25, HT - 0.55, HZ0 + 0.1)])}" fill="${w.lit}" opacity=".6"/>`);
      let pk = '';
      for (const y of [HT - 0.18, HT - 0.36]) pk += pl([pr(HX0 + (HT - y) * 0.45, y, HZ0), pr(HX1 - (HT - y) * 0.45, y, HZ0)]);
      o.push(`<path d="${pk}" stroke="${w.shade}" stroke-width="2"/>`);
      o.push(`<path d="${q([[HX0, HT, HZ0], [HX1, HT, HZ0], [HX1, HT, HZ1], [HX0, HT, HZ1]])}" fill="#2a2420"/>`);
      o.push(`<path d="${pl([pr(HX0, HT, HZ1), pr(HX0, HT, HZ0), pr(HX1, HT, HZ0)])}" fill="none" stroke="${w.lit}" stroke-width="3"/><path d="${pl([pr(HX1, HT, HZ0), pr(HX1, HT, HZ1), pr(HX0, HT, HZ1)])}" fill="none" stroke="${w.shade}" stroke-width="3"/>`);
      // the grubs: thumb-sized pale capsules heaped in the opening, crowding toward the mouth (no faces, no gore)
      let gb = '', gs = '';
      for (let i = 0; i < 150; i++) {
        const u = R(), v = R(), x = HX0 + 0.06 + u * (HX1 - HX0 - 0.12), z = HZ0 + 0.05 + v * (HZ1 - HZ0 - 0.1), p = pr(x, HT + 0.02 + R() * 0.04, z);
        const L = (F / z) * 0.05 * R.range(0.8, 1.2), a = R.range(0, 180);
        const g = `<ellipse cx="${r0(p[0])}" cy="${r0(p[1])}" rx="${f(L * 0.62, 1)}" ry="${f(L * 0.3, 1)}" transform="rotate(${r0(a)} ${r0(p[0])} ${r0(p[1])})"/>`;
        if (v > 0.6) gs += g; else gb += g;
      }
      o.push(`<g fill="${SEW.wormShade}">${gs}</g><g fill="${SEW.worm}">${gb}</g>`);
      // a few at the spout's lip, nosing into the mouth
      let lip = '';
      for (let i = 0; i < 7; i++) { const p = pr(SX0 + 0.02 + i * 0.03, 0.47 + (i % 2) * 0.02, SZ - 0.01); lip += `<ellipse cx="${r0(p[0])}" cy="${r0(p[1])}" rx="3.4" ry="1.7" transform="rotate(${r0(20 + i * 18)} ${r0(p[0])} ${r0(p[1])})"/>`; }
      o.push(`<g fill="${SEW.worm}">${lip}</g>`);
    }

    // --- the old tide pump against the left wall --------------------------------------------------------------
    {
      const PZ = 4.3, k = F / PZ, X = (x) => VP[0] + x * k, Y = (y) => VP[1] - (y - EYE) * k;
      const iron = SEW.iron, lit = SEW.ironLit;
      // plinth
      o.push(`<path d="${q([[-1.55, 0.35, 3.85], [-0.42, 0.35, 3.85], [-0.42, 0.35, 4.75], [-1.55, 0.35, 4.75]])}" fill="#6c665c"/><path d="${q([[-1.55, 0, 3.85], [-0.42, 0, 3.85], [-0.42, 0.35, 3.85], [-1.55, 0.35, 3.85]])}" fill="#544e46"/><path d="${q([[-0.42, 0, 3.85], [-0.42, 0, 4.75], [-0.42, 0.35, 4.75], [-0.42, 0.35, 3.85]])}" fill="#4e4842"/>`);
      // outlet pipe from the barrel foot, through the valve (mounted the wrong way round), down into the floor
      o.push(`<path d="M${r0(X(-0.66))},${r0(Y(0.66))}H${r0(X(-0.05))}V${r0(Y(0.02))}" fill="none" stroke="${iron}" stroke-width="${f(0.13 * k)}"/><path d="M${r0(X(-0.66))},${r0(Y(0.66) - 0.05 * k)}H${r0(X(-0.08))}" stroke="${lit}" stroke-width="1.6" opacity=".55"/>`);
      o.push(`<path d="M${r0(X(-0.42))},${r0(Y(0.82))}h${r0(0.22 * k)}v${r0(0.32 * k)}h${r0(-0.22 * k)}z" fill="#3a3c40"/><path d="M${r0(X(-0.45))},${r0(Y(0.82))}v${r0(0.32 * k)}M${r0(X(-0.17))},${r0(Y(0.82))}v${r0(0.32 * k)}" stroke="${iron}" stroke-width="4"/><path d="M${r0(X(-0.31))},${r0(Y(0.82))}l${r0(0.16 * k)},${r0(-0.2 * k)}" stroke="${iron}" stroke-width="5" stroke-linecap="round"/><circle cx="${r0(X(-0.31))}" cy="${r0(Y(0.82))}" r="4" fill="${lit}"/>`);
      // the barrel
      const bx0 = X(-1.36), bx1 = X(-0.64), bt = Y(1.78), bb = Y(0.35);
      o.push(`<path d="M${r0(bx0)},${r0(bb)}V${r0(bt)}H${r0(bx1)}V${r0(bb)}Z" fill="${S.lin([[0, '#5a5e64'], [0.3, '#3e4146'], [1, '#1c1e22']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
      o.push(`<ellipse cx="${r0((bx0 + bx1) / 2)}" cy="${r0(bt)}" rx="${r0((bx1 - bx0) / 2)}" ry="${r0(0.04 * k)}" fill="#2a2c30"/>`);
      let hoops = '';
      for (const y of [0.5, 1.3, 1.68]) hoops += `M${r0(bx0)},${r0(Y(y))}H${r0(bx1)}`;
      o.push(`<path d="${hoops}" stroke="#16171a" stroke-width="${f(0.06 * k)}"/><path d="${hoops}" stroke="${lit}" stroke-width="1.4" opacity=".5" transform="translate(0 -3)"/>`);
      // the crystal-seat cover: a round plate on the barrel's face, held by eight bolts round its rim
      const ccx = (bx0 + bx1) / 2 + 0.02 * k, ccy = Y(0.95), cr = 0.2 * k;
      o.push(`<circle cx="${r0(ccx)}" cy="${r0(ccy)}" r="${r0(cr)}" fill="#4a4c50"/><circle cx="${r0(ccx)}" cy="${r0(ccy)}" r="${r0(cr)}" fill="none" stroke="#16171a" stroke-width="3"/><path d="M${r0(ccx - cr * 0.7)},${r0(ccy - cr * 0.55)}a${r0(cr * 0.9)},${r0(cr * 0.9)} 0 0 1 ${r0(cr * 1.1)},${r0(-cr * 0.35)}" fill="none" stroke="${lit}" stroke-width="2" opacity=".55"/>`);
      let bolts = '';
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8; bolts += `<rect x="${r0(ccx + Math.cos(a) * cr * 0.8 - 4)}" y="${r0(ccy + Math.sin(a) * cr * 0.8 - 4)}" width="8" height="8" transform="rotate(${r0(a * 180 / Math.PI)} ${r0(ccx + Math.cos(a) * cr * 0.8)} ${r0(ccy + Math.sin(a) * cr * 0.8)})"/>`; }
      o.push(`<g fill="#8a8c90" stroke="#16171a" stroke-width="1.2">${bolts}</g><path d="M${r0(ccx - cr * 0.28)},${r0(ccy - cr * 0.05)}v${r0(-cr * 0.3)}h${r0(cr * 0.56)}v${r0(cr * 0.3)}" fill="none" stroke="#16171a" stroke-width="4" stroke-linejoin="round"/>`);
      // the fulcrum post and the lever; the piston rod at the near end, the float hung upside down at the far end
      const px = X(-0.25);
      o.push(`<path d="M${r0(px - 0.07 * k)},${r0(Y(0))}V${r0(Y(2.18))}h${r0(0.14 * k)}V${r0(Y(0))}Z" fill="${SEW.wood.mid}"/><path d="M${r0(px - 0.07 * k)},${r0(Y(0))}V${r0(Y(2.18))}h${r0(0.04 * k)}V${r0(Y(0))}Z" fill="${SEW.wood.lit}" opacity=".6"/>`);
      o.push(`<path d="M${r0((bx0 + bx1) / 2)},${r0(bt)}V${r0(Y(2.08))}" stroke="${lit}" stroke-width="${f(0.05 * k)}"/>`);
      const L0 = [(bx0 + bx1) / 2 - 0.12 * k, Y(2.04)], L1 = [X(0.6), Y(2.4)];
      const nx = 0, th = 0.07 * k;
      o.push(`<path d="M${r0(L0[0])},${r0(L0[1] - th)}L${r0(L1[0])},${r0(L1[1] - th)}L${r0(L1[0])},${r0(L1[1] + th)}L${r0(L0[0])},${r0(L0[1] + th)}Z" fill="${SEW.wood.mid}"/><path d="M${r0(L0[0])},${r0(L0[1] - th)}L${r0(L1[0])},${r0(L1[1] - th)}" stroke="${SEW.wood.lit}" stroke-width="2.4"/>`);
      const piv = [px, L0[1] + (L1[1] - L0[1]) * (px - L0[0]) / (L1[0] - L0[0]) + nx];
      o.push(`<circle cx="${r0(piv[0])}" cy="${r0(piv[1])}" r="${r0(0.06 * k)}" fill="${iron}"/><circle cx="${r0(piv[0])}" cy="${r0(piv[1])}" r="${r0(0.025 * k)}" fill="${lit}"/>`);
      // the float: a copper drum hung by a rod from the lever's end — upside down: its cone, which should point down
      // into the water, points up at the lever, and its lifting eye dangles underneath with a broken link
      const fx = L1[0] - 0.04 * k, ft = L1[1] + 0.3 * k, fw = 0.24 * k, fh = 0.4 * k;
      o.push(`<path d="M${r0(fx)},${r0(L1[1] + th)}V${r0(ft)}" stroke="${iron}" stroke-width="${f(0.035 * k)}"/>`);
      const fb = ft + 0.16 * k + fh; // the drum's rounded underside (its flat top, upside down)
      o.push(`<path d="M${r0(fx)},${r0(ft)}L${r0(fx + fw)},${r0(ft + 0.16 * k)}V${r0(fb)}Q${r0(fx)},${r0(fb + 0.09 * k)} ${r0(fx - fw)},${r0(fb)}V${r0(ft + 0.16 * k)}Z" fill="${SEW.copper}"/>`);
      o.push(`<path d="M${r0(fx)},${r0(ft)}L${r0(fx - fw)},${r0(ft + 0.16 * k)}V${r0(fb)}Q${r0(fx - fw * 0.8)},${r0(fb + 0.03 * k)} ${r0(fx - fw * 0.55)},${r0(fb + 0.05 * k)}V${r0(ft + 0.16 * k)}Z" fill="${SEW.copperLit}" opacity=".55"/>`);
      let fr = '';
      for (let i = 0; i < 5; i++) fr += circ(fx - fw * 0.8 + i * fw * 0.4, ft + 0.16 * k + 3, 1.6);
      o.push(`<path d="M${r0(fx - fw)},${r0(ft + 0.16 * k)}H${r0(fx + fw)}" stroke="#4a2c1c" stroke-width="2"/><path d="${fr}" fill="#d8a070" opacity=".8"/>`);
      o.push(`<path d="M${r0(fx - fw)},${r0(ft + 0.16 * k + fh * 0.35)}H${r0(fx + fw)}M${r0(fx - fw)},${r0(ft + 0.16 * k + fh * 0.72)}H${r0(fx + fw)}" stroke="${SEW.verd}" stroke-width="3" opacity=".8"/>`);
      o.push(`<circle cx="${r0(fx)}" cy="${r0(fb + 0.045 * k + 7)}" r="6" fill="none" stroke="${iron}" stroke-width="3"/><path d="M${r0(fx - 2)},${r0(fb + 0.045 * k + 13)}l3,9" stroke="${iron}" stroke-width="3"/>`);
      // pipes up the wall behind the pump
      o.push(`<path d="${q([[X0 + 0.02, 0.3, 4.95], [X0 + 0.02, 2.5, 4.95], [X0 + 0.02, 2.5, 5.12], [X0 + 0.02, 0.3, 5.12]])}" fill="${iron}"/>`);
    }

    // --- empty green bottles on the floor, their seal strips still on ---------------------------------------
    {
      const bottle = (x, z, rot, standing) => {
        const k = F / z, p = pr(x, 0, z), L = 0.3 * k, w = 0.075 * k;
        const g = standing ? '' : `rotate(${rot} ${r0(p[0])} ${r0(p[1])})`;
        let s = `<ellipse cx="${r0(p[0])}" cy="${r0(p[1] + 1)}" rx="${r0(standing ? w * 0.8 : L * 0.55)}" ry="${r0(0.025 * k)}" fill="#080708" opacity=".55"/><g${g ? ` transform="${g}"` : ''}>`;
        if (standing) {
          s += `<path d="M${r0(p[0] - w / 2)},${r0(p[1])}V${r0(p[1] - L * 0.62)}Q${r0(p[0] - w / 2)},${r0(p[1] - L * 0.78)} ${r0(p[0] - w * 0.18)},${r0(p[1] - L * 0.82)}V${r0(p[1] - L)}h${r0(w * 0.36)}V${r0(p[1] - L * 0.82)}Q${r0(p[0] + w / 2)},${r0(p[1] - L * 0.78)} ${r0(p[0] + w / 2)},${r0(p[1] - L * 0.62)}V${r0(p[1])}Z" fill="${SEW.glass}"/>`;
          s += `<path d="M${r0(p[0] - w * 0.3)},${r0(p[1] - L * 0.1)}V${r0(p[1] - L * 0.6)}" stroke="${SEW.glassLit}" stroke-width="2" opacity=".7"/><path d="M${r0(p[0] - w * 0.2)},${r0(p[1] - L * 0.92)}h${r0(w * 0.4)}v${r0(L * 0.06)}h${r0(-w * 0.4)}z" fill="${SEW.seal}"/>`;
        } else {
          s += `<path d="M${r0(p[0] - L / 2)},${r0(p[1] - w)}h${r0(L * 0.62)}q${r0(L * 0.14)},0 ${r0(L * 0.2)},${r0(w * 0.32)}h${r0(L * 0.18)}v${r0(w * 0.36)}h${r0(-L * 0.18)}q${r0(-L * 0.06)},${r0(w * 0.32)} ${r0(-L * 0.2)},${r0(w * 0.32)}h${r0(-L * 0.62)}z" fill="${SEW.glass}"/>`;
          s += `<path d="M${r0(p[0] - L * 0.42)},${r0(p[1] - w * 0.75)}h${r0(L * 0.5)}" stroke="${SEW.glassLit}" stroke-width="2" opacity=".7"/><path d="M${r0(p[0] + L * 0.3)},${r0(p[1] - w * 0.68)}h${r0(L * 0.08)}v${r0(w * 0.36)}h${r0(-L * 0.08)}z" fill="${SEW.seal}"/><path d="M${r0(p[0] - L * 0.5)},${r0(p[1] - w)}v${r0(w)}" stroke="${SEW.glassDark}" stroke-width="2"/>`;
        }
        return s + '</g>';
      };
      o.push(bottle(1.3, 4.5, -6, false) + bottle(1.95, 4.85, 18, false) + bottle(2.6, 4.3, -24, false) + bottle(2.55, 5.3, 0, true) + bottle(3.2, 4.8, 8, false));
    }
    S.add(`<g clip-path="${S.clip(`M${SEAM1 - 4},-10H1610V910H${SEAM1 - 4}Z`)}">${o.join('')}</g>`);
  }

  // ===================================== the pier between the halves =====================================
  {
    let co = '', jo = '';
    for (let y = 8, row = 0; y < H; y += 17, row++) { co += `M${SEAM0},${y}H${SEAM1}`; for (let x = SEAM0 + (row % 2 ? 12 : 26); x < SEAM1; x += 30) jo += `M${x},${y}v17`; }
    S.add(`<path d="M${SEAM0},0H${SEAM1}V${H}H${SEAM0}Z" fill="${S.lin([[0, B.mid], [0.55, B.shade], [1, B.deep]])}"/><path d="M${SEAM0},0H${SEAM0 + 10}V${H}H${SEAM0}Z" fill="${B.lit}" opacity=".7"/><path d="M${SEAM1 - 8},0H${SEAM1}V${H}H${SEAM1 - 8}Z" fill="#100c0e" opacity=".7"/>`);
    S.add(`<path d="${co}" stroke="${B.course}" stroke-width="1.6" opacity=".6"/><path d="${jo}" stroke="${B.course}" stroke-width="1.2" opacity=".45"/>`);
    // the same two tide lines carried across the pier's face
    S.add(`<path d="M${SEAM0},560H${SEAM1}V720H${SEAM0}Z" fill="${SEW.wet}" opacity=".35"/><path d="M${SEAM0},556H${SEAM1}v5H${SEAM0}Z" fill="#6e7c64" opacity=".5"/><path d="M${SEAM0},470H${SEAM1}v4H${SEAM0}Z" fill="${SEW.salt}" opacity=".32"/>`);
  }

  // ===================================== grading =====================================
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.45, '#0a0708', 0], [1, '#0a0708', 0.62]], 'cx="0.52" cy="0.45" r="0.78"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#0c0a0c', 0], [1, '#0c0a0c', 0.72]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 潮腔·旧蓄水池 — the round old cistern at the foot of the steps, seen from the landing ("this end"): a shallow pool
// in the middle (a pale flat shape lying faint under the water), the dry floor ring round it and four stone ledges
// of different heights against the wall — the farthest across the deep channel that runs to the culvert, one cut off
// from the step below it by a narrow runnel, one high along the wall, one low by the water; black roots crawling out
// of the water over the floor and wrapped round the ledges (matte, never glowing); on the right wall the inlet pipe
// with its rotten wooden gate board propped up on a wedge; at the bottom of the far wall the old culvert, black, its
// grate broken, and a smaller iron grate by the far ledge leading into it; the steps coming down along the left wall.
// ebb = true (fog-harbor-tide-cavity-ebb, after the fight): the same picture — the water drawn back into the middle,
// the roots gone down into it (dark shapes under the surface), the gate board dropped and the wedge on the floor, the
// floor and the ledge feet wet to the height the water reached, no pale shape any more.
// Every element draws from its own seed, so both variants share all geometry. No reflections, no figures.
// ---------------------------------------------------------------------------------------------
const CAV = {
  stone: { lit: '#66726c', mid: '#4a5652', shade: '#323c3a', deep: '#1e2626', course: '#141c1c' },
  floor: [[0, '#3e4a46'], [1, '#101616']], flag: '#0c1212',
  water: '#1c2c30', deep: '#0f1b1f', shallow: '#33484a', waterHi: '#55716e',
  wet: '#101818', salt: '#8c968c',
  root: '#0a0c0b', rootEdge: '#2a302c',
  shell: '#7e8e84',
  iron: '#1c2022', ironLit: '#5a6461', rust: '#6c4c38',
  wood: { lit: '#6e5c48', mid: '#4c4033', shade: '#30281f', rot: '#3e4c38' },
  light: '#c8d4d2',
};

function tideCavity(ebb) {
  const S = new Scene(ebb ? 'sbTideCavityEbb' : 'sbTideCavity', ebb
    ? '雾港·潮腔·排水后：同一口圆形老蓄水池，水退回中间，根沉回水里只剩水下的暗影，右墙进水口的烂木闸板落了下来、木楔掉在地上，石台脚与墙上留着刚退的水痕，地面湿漉漉的；池底断了栅的老涵洞黑着，石台边通往涵洞的铁栅，沿左墙下来的石阶'
    : '雾港·潮腔·旧蓄水池：石阶脚下圆形的老蓄水池，中间一池浅水，水下一片扁平苍白的淡影；四处高低不同的石台——最远一处隔着深水，一处与下一级隔着窄水，一处靠墙，一处离水最近；黑色的根从水里爬过地面、缠上石台；右墙进水口的烂木闸板被一根木楔撑着；池底断了栅的老涵洞，石台边通往涵洞的铁栅，沿左墙下来的石阶', 7201);
  const VP = [800, 360], F = 620, EYE = 2.0, CAM = [0, EYE, 0];
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const RC = 6.2, ZC = 6.5, WT = 5.0, WL = -0.12; // cistern radius, centre depth, wall top, water level
  const C = CAV, deg = Math.PI / 180;
  const f1 = (v) => f(v, 1);
  const pz1 = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L') + 'Z';
  const at = (th, y, r = RC) => [r * Math.cos(th), y, ZC + r * Math.sin(th)];
  // a frame on the wall at angle th: u along the wall (toward increasing th), y up, d in from the wall face
  const frame = (th) => { const c = Math.cos(th), s = Math.sin(th); return (u, y, d = 0) => [(RC - d) * c - u * s, y, ZC + (RC - d) * s + u * c]; };
  const sees = (p, nrm) => (CAM[0] - p[0]) * nrm[0] + (CAM[1] - p[1]) * nrm[1] + (CAM[2] - p[2]) * nrm[2] > 0;
  const TH = Array.from({ length: 61 }, (_, i) => (-60 + i * 5) * deg); // wall samples, all in front of the camera

  S.add(`<rect width="${W}" height="${H}" fill="#0a1012"/>`);
  // --- the dome over the cistern, ribs rising into the dark -------------------------------------------------------
  {
    const top = TH.map((t) => pr(...at(t, WT)));
    S.add(`<path d="M-10,-10H1610V${r0(top[top.length - 1][1])}${top.slice().reverse().map((p) => `L${r0(p[0])},${r0(p[1])}`).join('')}L-10,${r0(top[0][1])}Z" fill="${S.lin([[0, '#05080a'], [1, '#1a2424']], `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${r0(pr(...at(90 * deg, WT))[1])}"`)}"/>`);
    let ribs = '';
    for (let a = -30; a <= 210; a += 30) { const p0 = at(a * deg, WT), p1 = at(a * deg, WT + 2.6, RC * 0.55); ribs += pl([pr(...p0), pr(...p1)]); }
    S.add(`<path d="${ribs}" stroke="#202c2c" stroke-width="10" opacity=".7"/>`);
  }
  // --- the round wall: stone courses, the flood stain, the salt line ---------------------------------------------
  {
    const top = TH.map((t) => pr(...at(t, WT))), base = TH.map((t) => pr(...at(t, 0)));
    S.add(`<path d="${pz([...top, ...base.slice().reverse()])}" fill="${S.lin([[0, C.stone.deep], [0.3, C.stone.mid], [0.55, C.stone.lit], [0.75, C.stone.mid], [1, C.stone.deep]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    let co = '', jo = '';
    for (let y = 0.5, row = 0; y < WT - 0.01; y += 0.5, row++) { // nine courses
      co += pl(TH.map((t) => pr(...at(t, y))));
      for (let a = -40 + (row % 2) * 4; a < 225; a += 8) jo += pl([pr(...at(a * deg, y)), pr(...at(a * deg, y - 0.5))]);
    }
    S.add(`<path d="${co}" fill="none" stroke="${C.stone.course}" stroke-width="1.6" opacity=".6"/><path d="${jo}" stroke="${C.stone.course}" stroke-width="1.2" opacity=".45"/>`);
    const band = (y0, y1) => pz([...TH.map((t) => pr(...at(t, y1))), ...TH.slice().reverse().map((t) => pr(...at(t, y0)))]);
    S.add(`<path d="${band(1.6, WT)}" fill="#0a1010" opacity=".16"/><path d="${band(2.4, WT)}" fill="#0a1010" opacity=".3"/><path d="${band(3.6, WT)}" fill="#0a1010" opacity=".3"/>`);
    S.add(`<path d="${band(0, 1.55)}" fill="${C.wet}" opacity=".45"/><path d="${band(1.55, 1.6)}" fill="${C.salt}" opacity=".3"/>`);
    if (ebb) S.add(`<path d="${band(0, 0.95)}" fill="${C.wet}" opacity=".5"/><path d="${band(0.93, 0.97)}" fill="${C.waterHi}" opacity=".3"/>`);
  }
  // --- the old culvert at the bottom of the far wall: black, its grate broken ----------------------------------
  const CU = 95 * deg, cw = frame(CU), CR = 1.45, CS = 0.85;
  {
    const ring = (rr) => [pr(...cw(-rr, -0.4)), ...Array.from({ length: 17 }, (_, i) => { const a = Math.PI - Math.PI * i / 16; return pr(...cw(rr * Math.cos(a), CS + rr * Math.sin(a))); }), pr(...cw(rr, -0.4))];
    S.add(`<path d="${pz(ring(CR + 0.3))}" fill="${C.stone.lit}"/>`);
    let vs = '';
    for (let i = 0; i <= 10; i++) { const a = Math.PI - Math.PI * i / 10; vs += pl([pr(...cw(CR * Math.cos(a), CS + CR * Math.sin(a))), pr(...cw((CR + 0.3) * Math.cos(a), CS + (CR + 0.3) * Math.sin(a)))]); }
    S.add(`<path d="${pz(ring(CR))}" fill="#030405"/><path d="${vs}" stroke="${C.stone.course}" stroke-width="2" opacity=".7"/>`);
    // bars: two snapped off near the top (the gap), one bent outward, the rest rusted down into the water
    const Rg = rng(7211);
    let bars = '', stubs = '';
    for (const u of [-1.15, -0.7, -0.23, 0.23, 0.7, 1.15]) {
      const yt = CS + Math.sqrt(CR * CR - u * u) - 0.02;
      if (Math.abs(u) < 0.3) { stubs += pl([pr(...cw(u, yt)), pr(...cw(u + Rg.range(-0.05, 0.05), yt - Rg.range(0.25, 0.45)))]); continue; }
      if (u === 0.7) { bars += pl([pr(...cw(u, yt)), pr(...cw(u, 1.3)), pr(...cw(u + 0.25, 0.7, -0.5)), pr(...cw(u + 0.35, 0.2, -0.9))]); continue; }
      bars += pl([pr(...cw(u, yt)), pr(...cw(u, -0.4))]);
    }
    const cb = pl([pr(...cw(-CR + 0.05, 1.7)), pr(...cw(-0.45, 1.7))]) + pl([pr(...cw(0.5, 1.72)), pr(...cw(CR - 0.05, 1.7))]);
    S.add(`<path d="${bars}${stubs}${cb}" fill="none" stroke="${C.iron}" stroke-width="5" stroke-linejoin="round"/><path d="${bars}${cb}" fill="none" stroke="${C.rust}" stroke-width="1.6" opacity=".55" transform="translate(-1.5 0)"/>`);
  }
  // --- the small iron grate beside the far ledge, leading into the culvert --------------------------------------
  {
    const g = frame(73.5 * deg), gr = 0.4;
    const open = [pr(...g(-gr, -0.2)), ...Array.from({ length: 9 }, (_, i) => { const a = Math.PI - Math.PI * i / 8; return pr(...g(gr * Math.cos(a), 0.55 + gr * Math.sin(a))); }), pr(...g(gr, -0.2))];
    let gb = '';
    for (const u of [-0.24, -0.08, 0.08, 0.24]) gb += pl([pr(...g(u, 0.55 + Math.sqrt(gr * gr - u * u) - 0.02)), pr(...g(u, -0.2))]);
    gb += pl([pr(...g(-gr, 0.5)), pr(...g(gr, 0.5))]);
    S.add(`<path d="${pz(open)}" fill="#040506"/><path d="${gb}" stroke="${C.iron}" stroke-width="3.5"/><path d="${gb}" stroke="${C.ironLit}" stroke-width="1" opacity=".5" transform="translate(-1 -1)"/>`);
  }
  // --- the inlet on the right wall: the pipe mouth, its rails and the rotten gate board (propped up / dropped) ---
  {
    const g = frame(-8 * deg), w = C.wood;
    const ell = (cy, r, d = 0) => pz(Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; return pr(...g(r * Math.cos(a), cy + r * Math.sin(a), d)); }));
    S.add(`<path d="${ell(1.6, 0.52, -0.01)}" fill="${C.iron}"/><path d="${ell(1.6, 0.42, -0.02)}" fill="#050607"/>`);
    S.add(`<path d="${pl([pr(...g(-0.66, 0.95, -0.03)), pr(...g(-0.66, 3.5, -0.03))]) + pl([pr(...g(0.66, 0.95, -0.03)), pr(...g(0.66, 3.5, -0.03))])}" stroke="${C.iron}" stroke-width="6"/>`);
    const by = ebb ? 1.02 : 2.32, bh = 1.05, Rb = rng(7212);
    let planks = '', gaps = '', rot = '';
    for (let i = 0; i < 3; i++) {
      const u0 = -0.6 + i * 0.4, u1 = u0 + 0.38, rag = [Rb.range(0, 0.12), Rb.range(0, 0.12)];
      planks += pz([pr(...g(u0, by + rag[0], -0.06)), pr(...g(u0, by + bh, -0.06)), pr(...g(u1, by + bh, -0.06)), pr(...g(u1, by + rag[1], -0.06))]);
      rot += pz([pr(...g(u0, by + rag[0], -0.065)), pr(...g(u0, by + 0.3 + Rb.range(0, 0.15), -0.065)), pr(...g(u1, by + 0.25 + Rb.range(0, 0.15), -0.065)), pr(...g(u1, by + rag[1], -0.065))]);
      if (i) gaps += pl([pr(...g(u0 - 0.01, by + 0.1, -0.07)), pr(...g(u0 - 0.01, by + bh, -0.07))]);
    }
    S.add(`<path d="${planks}" fill="${w.mid}"/><path d="${rot}" fill="${w.rot}" opacity=".75"/><path d="${gaps}" stroke="#0c0a08" stroke-width="2.4"/><path d="${pl([pr(...g(-0.6, by + bh, -0.06)), pr(...g(0.6, by + bh, -0.06))])}" stroke="${w.lit}" stroke-width="2.4"/>`);
    S.add(`<path d="${pl([pr(...g(-0.6, by + bh * 0.7, -0.07)), pr(...g(0.6, by + bh * 0.7, -0.07))])}" stroke="${C.iron}" stroke-width="4"/>`);
    if (!ebb) {
      // the wedge jammed between the board's foot and the pipe's rim, holding it up
      S.add(`<path d="${pz([pr(...g(-0.16, 2.12, -0.12)), pr(...g(0.2, 2.12, -0.12)), pr(...g(-0.12, 2.36, -0.12))])}" fill="${w.lit}"/><path d="${pl([pr(...g(-0.16, 2.12, -0.12)), pr(...g(0.2, 2.12, -0.12))])}" stroke="${w.shade}" stroke-width="2"/>`);
    } else {
      // the wedge kicked out, lying on the floor below
      const a = pr(...g(0.5, 0, 0.7)), b = pr(...g(0.95, 0, 0.75)), c = pr(...g(0.6, 0.18, 0.72));
      S.add(`<path d="${pz([a, b, c])}" fill="${w.lit}"/><path d="${pl([a, b])}" stroke="${w.shade}" stroke-width="2"/>`);
    }
  }
  // --- the floor ring ---------------------------------------------------------------------------------------------
  {
    const base = TH.map((t) => pr(...at(t, 0)));
    S.add(`<path d="M-10,910L-10,${r0(base[base.length - 1][1])}${base.slice().reverse().map((p) => `L${r0(p[0])},${r0(p[1])}`).join('')}L1610,${r0(base[0][1])}L1610,910Z" fill="${S.lin(C.floor, `gradientUnits="userSpaceOnUse" x1="0" y1="${VP[1]}" x2="0" y2="${H}"`)}"/>`);
    let fl = '';
    for (const r of [4.0, 5.1]) fl += pl(TH.map((t) => pr(...at(t, 0, r))));
    for (let a = -40; a < 225; a += 15) fl += pl([pr(...at(a * deg, 0, 3.6)), pr(...at(a * deg, 0, RC))]);
    S.add(`<path d="${fl}" fill="none" stroke="${C.flag}" stroke-width="1.5" opacity=".5"/>`);
    // drag marks over the floor toward the culvert
    const Rd = rng(7213);
    let dr = '';
    for (const off of [-0.25, 0, 0.22]) {
      const pts = [[-2.7 + off, 4.6], [-2.9 + off, 6.6], [-2.2 + off, 8.8], [-1.3 + off, 10.6], [-0.8 + off, 12.2]];
      const L = [], Rr = [];
      for (const [x, z] of pts) { const w = 0.08 * Rd.range(0.6, 1.3); L.push(pr(x - w, 0, z)); Rr.unshift(pr(x + w * 0.7, 0, z)); }
      dr += pz1([...L, ...Rr]);
    }
    S.add(`<path d="${dr}" fill="#0a0f10" opacity=".28"/>`);
    // wet glints on the floor (more of them after the water went down)
    const Rw = rng(7214);
    let gl = '';
    for (let i = 0; i < (ebb ? 90 : 36); i++) {
      const a = Rw.range(-40, 220) * deg, r = Rw.range(3.6, RC - 0.3), p = pr(...at(a, 0, r)), L = 6 + 40 * Math.min(1, 6 / p[1] * 60) * Rw.range(0.3, 0.8);
      gl += `M${r0(p[0])},${r0(p[1])}h${r0(Math.min(L, 46))}`;
    }
    S.add(`<path d="${gl}" stroke="${C.waterHi}" stroke-width="1.5" stroke-linecap="round" opacity="${ebb ? 0.5 : 0.3}"/>`);
  }
  // --- the pool: shallow in the middle, a deep channel running out to the culvert, a lobe toward the low ledge ------
  const poolR = (phi) => {
    const base = (ebb ? 2.3 : 3.1) * (1 + 0.06 * Math.sin(3 * phi + 1) + 0.04 * Math.sin(5 * phi + 2));
    const dch = (phi / deg - 85) / (ebb ? 13 : 21), wch = Math.exp(-(dch ** 4));
    const dlb = (phi / deg - 22) / 16, wlb = Math.exp(-(dlb ** 2)) * (ebb ? 0.3 : 1.1);
    return base + wlb + (RC - 0.08 - base - wlb) * wch;
  };
  const poolPts = Array.from({ length: 72 }, (_, i) => { const phi = (i / 72) * Math.PI * 2; return pr(poolR(phi) * Math.cos(phi), WL, ZC + poolR(phi) * Math.sin(phi)); });
  const poolD = pz1(poolPts);
  {
    S.add(`<path d="${poolD}" fill="${C.water}"/>`);
    // the deep channel (darker) and the shallow margin
    const chan = [];
    for (let a = 66; a <= 104; a += 2) chan.push(pr(...at(a * deg, WL, RC - 0.08)));
    for (let a = 104; a >= 66; a -= 2) chan.push(pr(...at(a * deg, WL, Math.max(poolR(a * deg) * 0.62, 2.9))));
    const clipP = S.clip(poolD), Rc = rng(7215);
    S.add(`<path d="${pz1(chan)}" fill="${C.deep}" opacity=".85" clip-path="${clipP}"/>`);
    S.add(`<path d="${poolD}" fill="none" stroke="${C.shallow}" stroke-width="5" opacity=".8"/><path d="${poolD}" fill="none" stroke="#0a1012" stroke-width="1.5" opacity=".7"/>`);
    let cur = '';
    for (let i = 0; i < 40; i++) {
      const phi = Rc.range(0, Math.PI * 2), rr = Rc.range(0.3, 1) * poolR(phi), p = pr(rr * Math.cos(phi), WL, ZC + rr * Math.sin(phi)), L = (F / (ZC + rr * Math.sin(phi))) * Rc.range(0.15, 0.4);
      cur += `M${r0(p[0])},${r0(p[1])}q${r0(L / 2)},-2 ${r0(L)},0`;
    }
    let under = '';
    if (!ebb) {
      // the pale flat shape lying still under the water: a faint blurred shell, a few growth ridges
      // a broad, flat, rounded carapace lying lengthwise, its rim scalloped by the shell's segments
      // lying sideways to us: the broad rounded head end to the right, narrowing toward the rear on the left, the rim
      // scalloped by its segments toward the tail; a keel down its back and three segment lines across the rear
      const YS2 = -0.42, SZ = ZC + 0.55;
      const sh = Array.from({ length: 56 }, (_, i) => { const a = i / 56 * Math.PI * 2, c = Math.cos(a), sc = 1 + (c < 0 ? 0.04 * Math.abs(Math.sin(a * 6)) : 0); return pr(1.55 * c * sc + 0.25, YS2, SZ + 0.9 * Math.sin(a) * (1 + 0.16 * c) * sc); });
      under += `<path d="${pz1(sh)}" fill="${C.shell}" opacity=".24"/>`;
      let ridges = pl([pr(-1.45, YS2, SZ), pr(1.55, YS2, SZ)]);
      for (const x of [-0.95, -0.55, -0.15]) ridges += pl(Array.from({ length: 7 }, (_, i) => { const t = -1 + i / 3; return pr(x + 0.14 * (1 - t * t), YS2, SZ + t * 0.7 * (1 + 0.16 * Math.cos(Math.acos(Math.max(-1, Math.min(1, (x - 0.25) / 1.55)))))); }));
      under += `<path d="${ridges}" fill="none" stroke="#56665e" stroke-width="1.6" opacity=".3"/>`;
    } else {
      // the roots gone down: dark shapes just under the surface near the edge
      const Ru = rng(7216);
      let rs = '';
      for (const a0 of [30, 70, 135, 160, 205, 330]) {
        const pts = [];
        for (let i = 0; i <= 12; i++) { const a = (a0 + i * 3) * deg, rr = poolR(a) - 0.25 - i * 0.09 + Math.sin(i * 0.9 + Ru.range(0, 6)) * 0.08; pts.push([rr * Math.cos(a), WL - 0.2, ZC + rr * Math.sin(a)]); }
        rs += pz1(rootOutline(pr, pts, 0.22, 0.06, F));
      }
      under += `<path d="${rs}" fill="#050a0b" opacity=".45"/>`;
    }
    S.add(`<g clip-path="${clipP}">${under}<path d="${cur}" fill="none" stroke="${C.waterHi}" stroke-width="1.5" stroke-linecap="round" opacity=".4"/></g>`);
  }
  // --- the narrow runnel cut between the left ledge and the step below it -----------------------------------------
  const LN = { th: 122 * deg, hw: 1.0, d: 1.15, h: 0.78 };
  {
    const g = frame(LN.th);
    S.add(`<path d="${q([g(-LN.hw - 0.1, WL, LN.d), g(LN.hw + 0.1, WL, LN.d), g(LN.hw + 0.1, WL, LN.d + 0.55), g(-LN.hw - 0.1, WL, LN.d + 0.55)])}" fill="${C.deep}"/>`);
  }
  // --- the ledges, far to near ------------------------------------------------------------------------------------
  const ledges = [
    { th: 57 * deg, hw: 1.2, d: 1.35, h: 0.95 }, // the farthest, across the deep channel
    LN, // cut off by the runnel from the step below it
    { th: 122 * deg, hw: 1.0, d: 2.25, d0: 1.7, h: 0.36 }, // that lower step
    { th: 152 * deg, hw: 1.45, d: 0.95, h: 1.15 }, // high along the wall
    { th: 22 * deg, hw: 1.15, d: 1.3, h: 0.32 }, // low, nearest the water
  ];
  const ledgeOf = (L) => {
    const g = frame(L.th), d0 = L.d0 || 0, o = [];
    const tw = [-Math.sin(L.th), 0, Math.cos(L.th)];
    const P = (u, y, d) => pr(...g(u, y, d));
    // side faces (only the ones turned toward us), the front face, the top
    if (sees(g(-L.hw, 0, (d0 + L.d) / 2), [-tw[0], 0, -tw[2]])) o.push(`<path d="${pz([P(-L.hw, 0, d0), P(-L.hw, L.h, d0), P(-L.hw, L.h, L.d), P(-L.hw, 0, L.d)])}" fill="${C.stone.shade}"/>`);
    if (sees(g(L.hw, 0, (d0 + L.d) / 2), tw)) o.push(`<path d="${pz([P(L.hw, 0, d0), P(L.hw, L.h, d0), P(L.hw, L.h, L.d), P(L.hw, 0, L.d)])}" fill="${C.stone.shade}"/>`);
    o.push(`<path d="${pz([P(-L.hw, 0, L.d), P(L.hw, 0, L.d), P(L.hw, L.h, L.d), P(-L.hw, L.h, L.d)])}" fill="${C.stone.mid}"/>`);
    o.push(`<path d="${pz([P(-L.hw, L.h, d0), P(L.hw, L.h, d0), P(L.hw, L.h, L.d), P(-L.hw, L.h, L.d)])}" fill="${C.stone.lit}"/>`);
    o.push(`<path d="${pl([P(-L.hw, L.h, L.d), P(L.hw, L.h, L.d)])}" stroke="#a4b0a8" stroke-width="2" opacity=".6"/>`);
    let j = '';
    for (const u of [-L.hw / 3, L.hw / 3]) j += pl([P(u, 0, L.d), P(u, L.h, L.d)]);
    if (L.h > 0.6) j += pl([P(-L.hw, L.h / 2, L.d), P(L.hw, L.h / 2, L.d)]);
    o.push(`<path d="${j}" stroke="${C.stone.course}" stroke-width="1.4" opacity=".6"/>`);
    // the flood stain on its foot (to the height the water reached, after the fight)
    const wh = Math.min(L.h, ebb ? 0.9 : 0.35);
    o.push(`<path d="${pz([P(-L.hw, 0, L.d), P(L.hw, 0, L.d), P(L.hw, wh, L.d), P(-L.hw, wh, L.d)])}" fill="${C.wet}" opacity="${ebb ? 0.55 : 0.35}"/>`);
    return o.join('');
  };
  const order = ledges.map((L) => ({ L, z: frame(L.th)(0, 0, L.d)[2] })).sort((a, b) => b.z - a.z);
  for (const { L } of order) S.add(ledgeOf(L));

  // --- the roots: out of the water, over the floor, wrapped round the ledges (matte black, never glowing) -----------
  if (!ebb) {
    const Rr = rng(7217);
    let body = '', edge = '';
    const root = (pts, w0, w1) => { body += pz1(rootOutline(pr, pts, w0, w1, F, 0.18)); };
    // knots along a root and thin rootlets branching off it over the floor
    const knots = (pts, n, w) => { for (let i = 0; i < n; i++) { const p = pts[Math.floor(Rr.range(0.15, 0.75) * pts.length)], c = pr(...p), r = w * F / p[2]; edge += `<ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="${f1(r * 0.8)}" ry="${f1(r * 0.45)}"/>`; } };
    // a gently meandering line over the floor from a to b: one random phase per root, many samples (no kinks)
    const wiggle = (a, b, n, amp, y = 0) => {
      const ph = Rr.range(0, 6), ln = Math.hypot(b[0] - a[0], b[2] - a[2]) || 1, nx = (b[2] - a[2]) / ln, nz = -(b[0] - a[0]) / ln;
      return Array.from({ length: n * 3 + 1 }, (_, i) => { const t = i / (n * 3), s = Math.sin(t * Math.PI * 2.2 + ph) * amp * Math.sin(t * Math.PI); return [a[0] + (b[0] - a[0]) * t + s * nx, y, a[2] + (b[2] - a[2]) * t + s * nz]; });
    };
    const smooth = (pts) => { const out = []; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)]; for (let k = 0; k < 4; k++) { const t = k / 4, t2 = t * t, t3 = t2 * t; out.push([0, 1, 2].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } } out.push(pts[pts.length - 1]); return out; };
    for (const L of ledges.filter((l) => !l.d0)) {
      const g = frame(L.th), phi = L.th + Rr.range(-0.08, 0.08);
      const start = [(poolR(phi) - 0.35) * Math.cos(phi), WL, ZC + (poolR(phi) - 0.35) * Math.sin(phi)];
      const foot = g(-L.hw * 0.55, 0.02, L.d + 0.02);
      const crawl = wiggle(start, foot, 8, 0.25);
      // up and across the front face, over the top edge and back toward the wall: the wrap
      const wrap = [g(-L.hw * 0.5, 0.05, L.d + 0.02), g(-L.hw * 0.1, L.h * 0.35, L.d + 0.02), g(L.hw * 0.35, L.h * 0.75, L.d + 0.02), g(L.hw * 0.55, L.h + 0.02, L.d - 0.05), g(L.hw * 0.6, L.h + 0.02, L.d * 0.5), g(L.hw * 0.4, L.h + 0.02, 0.15)];
      root([...crawl, ...smooth(wrap)], 0.26, 0.05);
      knots(crawl, 2, 0.1);
      for (const t of [0.3, 0.55, 0.8]) { const p = crawl[Math.floor(t * (crawl.length - 1))], ang = Rr.range(0, Math.PI * 2), ln = Rr.range(0.5, 0.9); root(smooth([p, [p[0] + Math.cos(ang) * ln * 0.5, 0, p[2] + Math.sin(ang) * ln * 0.5], [p[0] + Math.cos(ang + 0.5) * ln, 0, p[2] + Math.sin(ang + 0.5) * ln]]), 0.07, 0.01); }
      // a second turn lower round the face, its end gone behind the corner
      if (L.h > 0.3) root(smooth([g(L.hw * 0.9, 0.02, L.d + 0.35), g(L.hw * 0.7, L.h * 0.2, L.d + 0.02), g(0, L.h * 0.5, L.d + 0.02), g(-L.hw * 0.75, L.h * 0.62, L.d + 0.02), g(-L.hw - 0.02, L.h * 0.55, L.d * 0.6)]), 0.13, 0.05);
      // a rootlet branching off over the floor
      const mid = crawl[12];
      root(wiggle(mid, [mid[0] + Rr.range(-1, 1), 0, mid[2] + Rr.range(-0.6, 0.6)], 4, 0.12), 0.08, 0.02);
    }
    // two more crawling out over the open floor toward the landing and the stair foot
    for (const [a, r1] of [[205 * deg, 4.8], [235 * deg, 3.7]]) {
      const s = [(poolR(a) - 0.3) * Math.cos(a), WL, ZC + (poolR(a) - 0.3) * Math.sin(a)], e = [r1 * Math.cos(a + 0.15), 0, ZC + r1 * Math.sin(a + 0.15)];
      const cr = wiggle(s, e, 8, 0.3);
      root(cr, 0.15, 0.02);
      knots(cr, 2, 0.07);
      for (const t of [0.35, 0.6]) { const p = cr[Math.floor(t * (cr.length - 1))], ang = Rr.range(0, Math.PI * 2), ln = Rr.range(0.4, 0.7); root(smooth([p, [p[0] + Math.cos(ang) * ln * 0.5, 0, p[2] + Math.sin(ang) * ln * 0.5], [p[0] + Math.cos(ang + 0.6) * ln, 0, p[2] + Math.sin(ang + 0.6) * ln]]), 0.05, 0.01); }
    }
    S.add(`<path d="${body}" fill="${C.root}"/><g fill="${C.root}">${edge}</g>`);
  }

  // --- the steps coming down along the left wall from the doorway high up ------------------------------------------
  {
    const n = 12, a0 = 170, a1 = 212, y0 = 3.8, y1 = 0.5, SW = 1.15, o = [];
    const da = (a1 - a0) / n, dy = (y0 - y1) / n;
    const P = (a, y, r) => pr(...at(a * deg, y, r));
    // the doorway at the head of the stair, a little cold light at its sill
    const dg = frame((a0 - 4) * deg);
    o.push(`<path d="${pz([pr(...dg(-0.6, y0, 0)), pr(...dg(-0.6, y0 + 1.5, 0)), pr(...dg(0, y0 + 1.85, 0)), pr(...dg(0.6, y0 + 1.5, 0)), pr(...dg(0.6, y0, 0))])}" fill="#040607"/>`);
    o.push(`<circle cx="${r0(pr(...dg(0, y0 + 0.6, 0))[0])}" cy="${r0(pr(...dg(0, y0 + 0.6, 0))[1])}" r="110" fill="${S.rad([[0, C.light, 0.28], [1, C.light, 0]])}"/>`);
    // the stair's inner face, stepped along its top
    const prof = [];
    for (let i = 0; i < n; i++) { const a = a0 + i * da, y = y0 - i * dy; prof.push(P(a, y, RC - SW), P(a + da, y, RC - SW)); }
    o.push(`<path d="${pz([...prof, P(a1, 0, RC - SW), P(a0, 0, RC - SW)])}" fill="${C.stone.shade}"/>`);
    let tr = '', ri = '', nose = '';
    for (let i = 0; i < n; i++) {
      const a = a0 + i * da, y = y0 - i * dy;
      tr += pz([P(a, y, RC), P(a + da, y, RC), P(a + da, y, RC - SW), P(a, y, RC - SW)]);
      ri += pz([P(a + da, y, RC), P(a + da, y - dy, RC), P(a + da, y - dy, RC - SW), P(a + da, y, RC - SW)]);
      nose += pl([P(a + da, y, RC), P(a + da, y, RC - SW)]);
    }
    o.push(`<path d="${ri}" fill="${C.stone.shade}"/><path d="${tr}" fill="${C.stone.mid}"/><path d="${nose}" stroke="#8a968e" stroke-width="1.6" opacity=".5"/>`);
    // the light from the doorway running down the treads
    o.push(`<path d="${pz([P(a0, y0 + 0.02, RC), P(a0 + da * 6, y0 - dy * 6 + 0.02, RC - 0.1), P(a0 + da * 6, y0 - dy * 6 + 0.02, RC - SW + 0.2), P(a0, y0 + 0.02, RC - SW + 0.3)])}" fill="${C.light}" opacity=".14" filter="${S.blur(2)}"/>`);
    S.add(o.join(''));
  }

  // --- the landing we stand on: big flags, damp, the edge over the floor ------------------------------------------
  {
    const LZ = 2.2, LY = 0.5;
    const e0 = pr(-6, LY, LZ), e1 = pr(6, LY, LZ);
    S.add(`<path d="M-10,910V${r0(e0[1])}L${r0(e0[0])},${r0(e0[1])}L${r0(e1[0])},${r0(e1[1])}L1610,${r0(e1[1])}V910Z" fill="${S.lin([[0, '#4e5a56'], [1, '#161c1c']], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(e0[1])}" x2="0" y2="${H}"`)}"/>`);
    S.add(`<path d="M-10,${r0(e0[1])}H1610" stroke="#94a09a" stroke-width="3" opacity=".55"/><path d="M-10,${r0(e0[1]) + 4}H1610" stroke="#0a0e0e" stroke-width="3" opacity=".6"/>`);
    let fl = '';
    for (const x of [-2.4, -0.8, 0.8, 2.4]) fl += pl([pr(x, LY, LZ), pr(x * 0.5, LY, 1.1)]);
    fl += pl([pr(-6, LY, 1.6), pr(6, LY, 1.6)]);
    const Rl = rng(7218);
    let wetp = '';
    for (const [x, z, rx, rz] of [[-1.6, 1.9, 0.5, 0.18], [1.3, 1.75, 0.4, 0.16]]) { const pts = []; for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, kk = Rl.range(0.75, 1.1); pts.push(pr(x + Math.cos(a) * rx * kk, LY, z + Math.sin(a) * rz * kk)); } wetp += pz(pts); }
    S.add(`<path d="${fl}" stroke="#0c1010" stroke-width="2" opacity=".5"/><path d="${wetp}" fill="${C.wet}" opacity="${ebb ? 0.7 : 0.45}"/>`);
  }

  // --- grading: cold dim light, darker toward the edges and under the dialogue box -------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.4, '#040808', 0], [1, '#040808', 0.66]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  S.add(`<rect y="610" width="${W}" height="290" fill="${S.lin([[0, '#060a0a', 0], [1, '#060a0a', 0.66]])}"/>`);
  return S.out();
}

// Outline of a tapered root along a 3-D polyline (projected): width w0 at the first point to w1 at the last, in metres.
function rootOutline(pr, pts, w0, w1, F, bump = 0) {
  const P = pts.map((p) => pr(...p)), n = P.length, L = [], Rr = [];
  for (let i = 0; i < n; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    tx /= l; ty /= l;
    const w = (w0 + (w1 - w0) * i / (n - 1)) * F / pts[i][2] / 2 * (1 + bump * (Math.sin(i * 1.9) * 0.6 + Math.sin(i * 0.7 + 1) * 0.4));
    L.push([P[i][0] - ty * w, P[i][1] + tx * w]);
    Rr.unshift([P[i][0] + ty * w, P[i][1] - tx * w]);
  }
  return [...L, ...Rr];
}

export const sewerBgs = {
  'fog-harbor-sewer-pump': sewerPump,
  'fog-harbor-tide-cavity': () => tideCavity(false),
  'fog-harbor-tide-cavity-ebb': () => tideCavity(true),
};
