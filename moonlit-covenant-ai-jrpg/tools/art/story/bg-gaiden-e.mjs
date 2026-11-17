// 外传《银轨号》正篇第9、10章的场景背景：nox-observatory-lab（诺克斯观测所·地下实验室）、nox-observatory-core（诺克斯观测所·核心室）、nox-observatory-core-eclipse（诺克斯观测所·核心室·月蚀）。
//   nox-observatory-lab          — 一点透视往石砌拱廊的深处看：拱顶刻着星图（星点连线、黄道弧），左上一口采光井漏下一道月光；
//                                  两侧石墙的拱龛里上下两层横卧的玻璃舱，泛着青白的霜光（看不见里面的人）；细细的银线从每个舱
//                                  汇向中央的黄铜装置——立柱、刻度环、玻璃球里一团金光；后墙一面黄铜星盘；左前方工作台上摆着
//                                  烧瓶、量筒、曲颈瓶和一架小天球仪；右前方黄铜支架上一块倾斜的发光水晶板（只有光条和环图，
//                                  不画能读出的字）；肋拱上垂着琥珀色的灯。
//   nox-observatory-core         — 球形的核心室：穹顶的圆口镶着一圈齿轮（就是“齿轮环绕的月亮”），口里是星空和被蚀去大半的月亮；
//                                  几道巨大的黄铜环（带刻度）层层围着中央悬浮的种子状核心，四周飘着金色的碎光；地上一圈阵纹，
//                                  四个方位各一个基座；环墙上立着黄铜壁柱与琥珀壁灯。
//   nox-observatory-core-eclipse — 同一个核心室·月蚀：月亮蚀成暗红的环，室内转为暗红紫，碎光变成红色的余烬，核心发白（第十二章用）。
// 不画人物，不画能读出的字。
import { Scene, W, H, f, pz, pl, persp, rng } from './lib.mjs';

const r0 = (v) => f(v, 0);
const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;
const circ = (cx, cy, r) => ell(cx, cy, r, r);
const U = (cx, cy, r) => `gradientUnits="userSpaceOnUse" cx="${r0(cx)}" cy="${r0(cy)}" r="${r0(r)}"`;
const UL = (x1, y1, x2, y2) => `gradientUnits="userSpaceOnUse" x1="${r0(x1)}" y1="${r0(y1)}" x2="${r0(x2)}" y2="${r0(y2)}"`;

// ---------------------------------------------------------------------------------------------
// 诺克斯观测所·地下实验室
// ---------------------------------------------------------------------------------------------
function noxLab() {
  const S = new Scene('sbGdNoxLab', '诺克斯观测所·地下实验室：石砌拱廊往深处延伸，拱顶刻着星图，左上一口采光井漏下一道月光；两侧拱龛里上下两层横卧的玻璃舱泛着青白的霜光，细细的银线从每个舱汇向中央的黄铜装置，装置的玻璃球里一团金光；后墙一面黄铜星盘；左前方工作台上摆着烧瓶、量筒、曲颈瓶和一架小天球仪；右前方黄铜支架上一块倾斜的发光水晶板；肋拱上垂着琥珀色的灯；不画人物，不画能读出的字', 90901);
  const R = rng(90902);
  const VP = [800, 430], F = 620, EYE = 1.6;
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const XW = 4.2, YS = 3.6, VR = 4.2, ZN = 2.0, ZE = 17;
  const C = {
    deep: '#07070d', stone: '#262636', stoneLit: '#32324a', stoneShade: '#1a1a28', joint: '#12121c',
    vault: [[0, '#10101c'], [1, '#22223a']], rib: '#3a3448', ribHi: '#6a5a4a',
    brass: '#a8844a', brassHi: '#e8c88a', brassDark: '#5a4426', glass: '#9fe4ee', glassDeep: '#2e6a7a', frost: '#e8fbff',
    gold: '#ffd27a', goldCore: '#fff6d8', amber: '#ffb35a', silver: '#d8e2f4', moon: '#c8d6f4', star: '#cfd8ff',
    floor: [[0, '#1c1c2a'], [1, '#0c0c14']], wood: '#3a2a20', woodLit: '#5a4030', woodDark: '#1e1612',
  };
  const arc = (z, n = 20) => Array.from({ length: n + 1 }, (_, i) => { const t = Math.PI * i / n; return pr(XW * Math.cos(t), YS + VR * Math.sin(t), z); });
  const onVault = (t, z) => pr(XW * Math.cos(t), YS + VR * Math.sin(t), z);
  const RIBS = [4.5, 7, 9.5, 12, 14.5];

  S.add(`<rect width="${W}" height="${H}" fill="${C.deep}"/>`);

  // ---- vault: dark stone barrel, engraved star chart, ribs ------------------------------------------------------------
  {
    const near = arc(ZN), far = arc(ZE);
    S.add(`<path d="${pz([...near, ...far.slice().reverse()])}" fill="${S.lin(C.vault, UL(0, 0, 0, 380))}"/>`);
    // courses of stone along the barrel
    let co = '';
    for (let k = 1; k < 12; k++) { const t = Math.PI * k / 12; co += pl([onVault(t, ZN + 0.3), onVault(t, ZE)]); }
    S.add(`<path d="${co}" fill="none" stroke="${C.joint}" stroke-width="1.6" opacity=".8"/>`);
    // engraved star chart: constellations (dots joined by thin lines) and a golden ecliptic arc
    let dots = '', links = '';
    for (let c = 0; c < 9; c++) {
      const t0 = R.range(0.22, 0.78) * Math.PI, z0 = R.range(6.5, 16);
      const n = R.int(3, 6);
      let prev = null;
      for (let i = 0; i < n; i++) {
        const p = onVault(t0 + R.range(-0.09, 0.09), z0 + R.range(-0.9, 0.9));
        if (p[1] < -10) continue;
        dots += circ(p[0], p[1], R.range(1.2, 2.6));
        if (prev) links += `M${r0(prev[0])},${r0(prev[1])}L${r0(p[0])},${r0(p[1])}`;
        prev = p;
      }
    }
    for (let i = 0; i < 70; i++) { const p = onVault(R.range(0.12, 0.88) * Math.PI, R.range(5, 16.8)); if (p[1] > -4) dots += circ(p[0], p[1], R.range(0.6, 1.3)); }
    S.add(`<path d="${links}" fill="none" stroke="${C.silver}" stroke-width="1" opacity=".28"/><path d="${dots}" fill="${C.star}" opacity=".55"/>`);
    const ecl = [];
    for (let i = 0; i <= 24; i++) { const s = i / 24; ecl.push(onVault((0.3 + 0.45 * s) * Math.PI, 6 + 10.5 * s)); }
    S.add(`<path d="${pl(ecl)}" fill="none" stroke="${C.gold}" stroke-width="1.4" stroke-dasharray="6 5" opacity=".3"/>`);
    // the light-well, left of the crown: a round hole with moonlight
    const well = [];
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; well.push(onVault(0.69 * Math.PI + 0.13 * Math.cos(a), 10.4 + 0.62 * Math.sin(a))); }
    const wc = onVault(0.69 * Math.PI, 10.4);
    const grille = pl([onVault(0.69 * Math.PI - 0.13, 10.4), onVault(0.69 * Math.PI + 0.13, 10.4)]) + pl([onVault(0.69 * Math.PI, 9.78), onVault(0.69 * Math.PI, 11.02)]);
    S.add(`<path d="${circ(wc[0], wc[1], 52)}" fill="${C.moon}" opacity=".3" filter="${S.blur(2)}"/>`);
    S.add(`<path d="${pz(well)}" fill="${S.rad([[0, '#f4f8ff'], [0.55, C.moon], [1, '#56648a']], U(wc[0] + 6, wc[1] + 8, 40))}"/><path d="${grille}" stroke="${C.brassDark}" stroke-width="2.4"/><path d="${pz(well)}" fill="none" stroke="${C.brass}" stroke-width="3.5"/>`);
    // ribs
    for (const z of [...RIBS, ZE]) {
      const w = Math.max(2, 0.16 * F / z);
      S.add(`<path d="${pl(arc(z))}" fill="none" stroke="${C.rib}" stroke-width="${f1(w)}"/><path d="${pl(arc(z - 0.06).slice(2, 11))}" fill="none" stroke="${C.ribHi}" stroke-width="${f1(w * 0.25)}" opacity=".55"/>`);
    }
  }

  // ---- back wall: plain stone, a brass star disc in the lunette --------------------------------------------------------
  {
    const lun = [pr(-XW, 0, ZE), ...arc(ZE).slice().reverse(), pr(XW, 0, ZE)];
    S.add(`<path d="${pz(lun)}" fill="${C.stone}"/>`);
    const c = pr(0, 4.9, ZE), k = F / ZE;
    const rr = 1.75 * k;
    let tk = '';
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2, r1 = rr * (i % 4 ? 0.9 : 0.84); tk += `M${f1(c[0] + Math.cos(a) * r1)},${f1(c[1] + Math.sin(a) * r1)}L${f1(c[0] + Math.cos(a) * rr * 0.96)},${f1(c[1] + Math.sin(a) * rr * 0.96)}`; }
    let sd = '';
    for (let i = 0; i < 18; i++) { const a = R.range(0, Math.PI * 2), d = R.range(0.1, 0.75) * rr; sd += circ(c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d, R.range(0.8, 1.8)); }
    S.add(`<path d="${circ(c[0], c[1], rr)}${circ(c[0], c[1], rr * 0.62)}" fill="none" stroke="${C.brass}" stroke-width="2.2" opacity=".85"/><path d="${tk}" stroke="${C.brass}" stroke-width="1.2" opacity=".8"/>` +
      `<path d="${ell(c[0], c[1], rr * 0.62, rr * 0.25)}" fill="none" stroke="${C.gold}" stroke-width="1.2" opacity=".5" transform="rotate(-18 ${r0(c[0])} ${r0(c[1])})"/><path d="${sd}" fill="${C.star}" opacity=".7"/>`);
    // a low arched doorway at the foot of the back wall
    const dw = [pr(-0.7, 0, ZE)];
    for (let i = 0; i <= 10; i++) { const t = Math.PI * i / 10; dw.push(pr(-0.7 * Math.cos(t), 1.5 + 0.7 * Math.sin(t), ZE)); }
    dw.push(pr(0.7, 0, ZE));
    S.add(`<path d="${pz(dw)}" fill="#0a0a12"/>`);
  }

  // ---- side walls with arched niches; two tiers of lying glass pods in every bay -----------------------------------------
  const podTops = [];
  for (const side of [-1, 1]) {
    const X = side * XW;
    const o = [];
    o.push(`<path d="${q([[X, 0, ZN], [X, 0, ZE], [X, YS, ZE], [X, YS, ZN]])}" fill="${side < 0 ? C.stoneShade : C.stone}"/>`);
    let cs = '';
    for (let y = 0.45; y < YS; y += 0.45) cs += pl([pr(X, y, ZN), pr(X, y, ZE)]);
    o.push(`<path d="${cs}" stroke="${C.joint}" stroke-width="1.3" opacity=".7"/>`);
    const bays = [ZN + 0.3, ...RIBS, ZE];
    for (let b = 0; b < bays.length - 1; b++) {
      const za = bays[b] + 0.22, zb = bays[b + 1] - 0.22;
      // the niche: a dark recess with a round head
      const ni = [[X, 0.15, za], [X, 3.0, za]];
      for (let i = 1; i < 10; i++) { const t = i / 10; ni.push([X, 3.0 + 0.32 * Math.sin(Math.PI * t), za + (zb - za) * t]); }
      ni.push([X, 3.0, zb], [X, 0.15, zb]);
      o.push(`<path d="${pz(pr.poly(ni))}" fill="#0c0c16"/>`);
      for (const [yc, hh] of [[0.92, 0.42], [2.18, 0.42]]) {
        const z0 = za + 0.12 + hh, z1 = zb - 0.12 - hh;
        if (z1 <= z0) continue;
        const pts = [];
        for (let i = 0; i <= 6; i++) pts.push([X, yc + hh, z0 + (z1 - z0) * i / 6]);
        for (let i = 1; i < 8; i++) { const a = Math.PI / 2 - Math.PI * i / 8; pts.push([X, yc + hh * Math.sin(a), z1 + hh * Math.cos(a)]); }
        for (let i = 6; i >= 0; i--) pts.push([X, yc - hh, z0 + (z1 - z0) * i / 6]);
        for (let i = 1; i < 8; i++) { const a = -Math.PI / 2 - Math.PI * i / 8; pts.push([X, yc + hh * Math.sin(a), z0 + hh * Math.cos(a)]); }
        const pod = pz(pr.poly(pts));
        const zm = (z0 + z1) / 2, k = F / zm;
        const a = pr(X, yc + hh, zm), bt = pr(X, yc - hh, zm);
        o.push(`<path d="${pod}" fill="${S.lin([[0, C.frost, 0.85], [0.45, C.glass, 0.75], [1, C.glassDeep, 0.9]], UL(0, a[1], 0, bt[1]))}" stroke="${C.brass}" stroke-width="${f1(Math.max(1, 0.05 * k))}"/>`);
        // inner glow along the pod (a softer, narrower band) and a frost highlight
        const inner = pz(pr.poly(pts.map(([x, y, z]) => [x, yc + (y - yc) * 0.45, zm + (z - zm) * 0.86])));
        o.push(`<path d="${inner}" fill="${C.frost}" opacity=".45" filter="${S.blur(1)}"/>`);
        o.push(`<path d="${pl(pr.poly([[X, yc + hh * 0.7, z0], [X, yc + hh * 0.7, z1]]))}" stroke="#fff" stroke-width="${f1(Math.max(0.8, 0.025 * k))}" opacity=".5"/>`);
        // little amber status light on the frame
        const s = pr(X, yc - hh - 0.1, z1 + hh * 0.6);
        o.push(`<path d="${circ(s[0], s[1], Math.max(1.2, 0.035 * k))}" fill="${C.amber}"/>`);
        podTops.push(pr(X, yc + hh * 0.2, zm));
      }
    }
    // pilasters at every rib
    for (const z of RIBS) {
      const xi = X - side * 0.16;
      o.push(`<path d="${q([[X, 0, z - 0.2], [xi, 0, z - 0.2], [xi, YS, z - 0.2], [X, YS, z - 0.2]])}" fill="${C.stoneShade}"/>`);
      o.push(`<path d="${q([[xi, 0, z - 0.2], [xi, 0, z + 0.2], [xi, YS, z + 0.2], [xi, YS, z - 0.2]])}" fill="${side < 0 ? C.stone : C.stoneLit}"/>`);
      o.push(`<path d="${q([[xi, YS - 0.18, z - 0.24], [xi, YS - 0.18, z + 0.24], [xi, YS, z + 0.24], [xi, YS, z - 0.24]])}" fill="${C.brass}"/>`);
    }
    S.add(o.join(''));
  }

  // ---- floor: flagstones converging on the vanishing point ---------------------------------------------------------------
  {
    S.add(`<path d="${q([[-XW, 0, ZN], [XW, 0, ZN], [XW, 0, ZE], [-XW, 0, ZE]])}" fill="${S.lin(C.floor, UL(0, VP[1], 0, H))}"/>`);
    let fl = '';
    for (let x = -XW + 0.7; x < XW; x += 0.7) fl += pl([pr(x, 0, ZN), pr(x, 0, ZE)]);
    for (let z = ZN + 0.3; z < ZE; z *= 1.16) fl += pl([pr(-XW, 0, z), pr(XW, 0, z)]);
    S.add(`<path d="${fl}" stroke="#2c2c40" stroke-width="1.4" opacity=".75"/>`);
    // cold reflections under the pods
    for (const side of [-1, 1]) S.add(`<path d="${q([[side * XW, 0, 3.4], [side * (XW - 1.1), 0, 3.4], [side * (XW - 0.6), 0, ZE], [side * XW, 0, ZE]])}" fill="${C.glass}" opacity=".07"/>`);
  }

  // ---- moonlight shaft from the light-well --------------------------------------------------------------------------------
  {
    const top = [onVault(0.69 * Math.PI - 0.1, 10.0), onVault(0.69 * Math.PI + 0.12, 10.8)];
    const foot = [pr(-3.4, 0, 8.6), pr(-1.9, 0, 9.6)];
    S.add(`<path d="${pz([top[0], top[1], foot[1], foot[0]])}" fill="${C.moon}" opacity=".2" filter="${S.blur(2)}"/>`);
    const f0 = pr(-2.65, 0, 9.1);
    S.add(`<path d="${ell(f0[0], f0[1], 70, 12)}" fill="${C.moon}" opacity=".3" filter="${S.blur(2)}"/>`);
  }

  // ---- the central device: plinth, brass column, rings, a glass sphere with the golden light, a collector on top --------
  const DZ = 9.5, k = F / DZ;
  const base = pr(0, 0, DZ), sph = pr(0, 2.2, DZ), crown = pr(0, 3.35, DZ);
  {
    S.add(`<path d="${circ(sph[0], sph[1], 2.4 * k)}" fill="${S.rad([[0, C.gold, 0.55], [0.4, C.amber, 0.18], [1, C.amber, 0]], U(sph[0], sph[1], 2.4 * k))}"/>`);
    S.add(`<path d="${ell(base[0], base[1] + 4, 2.4 * k, 0.32 * k)}" fill="${C.gold}" opacity=".22" filter="${S.blur(3)}"/><path d="${ell(base[0], base[1] + 90, 0.55 * k, 95)}" fill="${C.gold}" opacity=".1" filter="${S.blur(3)}"/>`);
    // floor conduits feeding the plinth
    let cd = '';
    for (const x of [-3.2, -2.1, -1.0, 1.0, 2.1, 3.2]) cd += pl([pr(x * 1.1, 0.02, DZ + 3), pr(x * 0.35, 0.02, DZ + 0.4)]) + pl([pr(x * 1.1, 0.02, DZ - 3.5), pr(x * 0.3, 0.02, DZ - 0.5)]);
    S.add(`<path d="${cd}" fill="none" stroke="${C.brassDark}" stroke-width="3.2"/><path d="${cd}" fill="none" stroke="${C.brass}" stroke-width="1" opacity=".7"/>`);
    // stepped plinth
    for (const [rr, h, col] of [[1.25, 0.18, C.brassDark], [0.95, 0.38, C.brass]]) {
      const c0 = pr(0, 0, DZ), c1 = pr(0, h, DZ);
      S.add(`<path d="M${f1(c0[0] - rr * k)},${f1(c0[1])}V${f1(c1[1])}A${f1(rr * k)},${f1(rr * 0.2 * k)} 0 0 0 ${f1(c0[0] + rr * k)},${f1(c1[1])}V${f1(c0[1])}A${f1(rr * k)},${f1(rr * 0.2 * k)} 0 0 1 ${f1(c0[0] - rr * k)},${f1(c0[1])}Z" fill="${col}"/>`);
      S.add(`<path d="${ell(c1[0], c1[1], rr * k, rr * 0.2 * k)}" fill="${C.brassHi}" opacity=".5"/>`);
    }
    // column
    const cb = pr(0, 0.38, DZ), ct = pr(0, 1.45, DZ), cw = 0.42 * k;
    S.add(`<path d="M${f1(cb[0] - cw)},${f1(cb[1])}V${f1(ct[1])}H${f1(cb[0] + cw)}V${f1(cb[1])}Z" fill="${S.lin([[0, C.brassDark], [0.35, C.brassHi], [0.6, C.brass], [1, C.brassDark]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    let bands = '';
    for (const y of [0.62, 0.95, 1.28]) { const p = pr(0, y, DZ); bands += `M${f1(p[0] - cw - 2)},${f1(p[1])}h${f1(cw * 2 + 4)}`; }
    S.add(`<path d="${bands}" stroke="${C.brassDark}" stroke-width="3"/>`);
    // cradle arms holding the sphere
    const sr = 0.78 * k;
    S.add(`<path d="M${f1(ct[0] - cw)},${f1(ct[1])}Q${f1(sph[0] - sr * 1.35)},${f1(sph[1] + sr * 0.2)} ${f1(sph[0] - sr * 1.05)},${f1(sph[1] - sr * 0.55)}M${f1(ct[0] + cw)},${f1(ct[1])}Q${f1(sph[0] + sr * 1.35)},${f1(sph[1] + sr * 0.2)} ${f1(sph[0] + sr * 1.05)},${f1(sph[1] - sr * 0.55)}" fill="none" stroke="${C.brass}" stroke-width="${f1(0.09 * k)}" stroke-linecap="round"/>`);
    // glass sphere with the golden light inside
    S.add(`<path d="${circ(sph[0], sph[1], sr)}" fill="${S.rad([[0, C.goldCore], [0.25, C.gold], [0.6, '#c88a3a', 0.55], [1, '#3a2a30', 0.35]], U(sph[0], sph[1], sr))}"/>`);
    S.add(`<path d="${circ(sph[0], sph[1], sr * 0.32)}" fill="${C.goldCore}" filter="${S.blur(2)}"/>`);
    S.add(`<path d="M${f1(sph[0] - sr * 0.55)},${f1(sph[1] - sr * 0.5)}A${f1(sr * 0.75)},${f1(sr * 0.75)} 0 0 1 ${f1(sph[0] + sr * 0.15)},${f1(sph[1] - sr * 0.78)}" fill="none" stroke="#fff" stroke-width="2.4" opacity=".6"/>`);
    S.add(`<path d="${circ(sph[0], sph[1], sr)}" fill="none" stroke="${C.brassHi}" stroke-width="2" opacity=".7"/>`);
    // tilted graduated rings around the sphere
    for (const [rx, ry, rot] of [[1.25, 0.32, -14], [1.05, 0.9, 32]]) {
      S.add(`<path d="${ell(sph[0], sph[1], rx * k, ry * k)}" fill="none" stroke="${C.brass}" stroke-width="${f1(0.06 * k)}" transform="rotate(${rot} ${r0(sph[0])} ${r0(sph[1])})"/>`);
    }
    // the collector on top, where the silver threads gather
    S.add(`<path d="M${f1(sph[0] - 0.18 * k)},${f1(sph[1] - sr * 0.95)}L${f1(crown[0])},${f1(crown[1])}L${f1(sph[0] + 0.18 * k)},${f1(sph[1] - sr * 0.95)}Z" fill="${C.brass}"/><path d="${circ(crown[0], crown[1], 0.12 * k)}" fill="${C.brassHi}"/>`);
  }

  // ---- silver threads from every pod to the collector -----------------------------------------------------------------
  {
    let th = '';
    for (const p of podTops) {
      const mx = (p[0] + crown[0]) / 2, my = Math.max(p[1], crown[1]) - 30;
      th += `M${r0(p[0])},${r0(p[1])}Q${r0(mx)},${r0(my)} ${r0(crown[0])},${r0(crown[1])}`;
    }
    S.add(`<path d="${th}" fill="none" stroke="${C.silver}" stroke-width="1.1" opacity=".38"/>`);
  }

  // ---- hanging amber lamps from the ribs ----------------------------------------------------------------------------------
  {
    let ch = '', bodies = '', glows = '';
    for (const z of [7, 12]) for (const x of [-2.5, 2.5]) {
      const top = pr(x, YS + Math.sqrt(VR * VR - x * x) - 0.1, z), lamp = pr(x, 3.1, z), kk = F / z;
      ch += `M${r0(top[0])},${r0(Math.max(-5, top[1]))}L${r0(lamp[0])},${r0(lamp[1] - 0.2 * kk)}`;
      bodies += `M${f1(lamp[0] - 0.12 * kk)},${f1(lamp[1] - 0.2 * kk)}h${f1(0.24 * kk)}l${f1(0.05 * kk)},${f1(0.28 * kk)}l${f1(-0.17 * kk)},${f1(0.12 * kk)}l${f1(-0.17 * kk)},${f1(-0.12 * kk)}Z`;
      glows += circ(lamp[0], lamp[1], 0.75 * kk);
    }
    S.add(`<path d="${glows}" fill="${C.amber}" opacity=".22" filter="${S.blur(3)}"/><path d="${ch}" stroke="${C.brassDark}" stroke-width="2"/><path d="${bodies}" fill="${C.amber}" stroke="${C.brass}" stroke-width="1.5"/>`);
  }

  // ---- foreground left: the workbench with glassware and a little armillary ---------------------------------------------
  {
    const o = [];
    o.push(`<path d="M-10,678L420,660L505,712L-10,736Z" fill="${C.woodLit}"/><path d="M-10,736L505,712V900H-10Z" fill="${C.woodDark}"/>`);
    o.push(`<path d="M-10,736L505,712" stroke="${C.brass}" stroke-width="4"/><path d="M-10,760L505,736" stroke="${C.wood}" stroke-width="2"/>`);
    o.push(`<path d="M40,782L230,773V842L40,851ZM270,771L460,762V831L270,840Z" fill="none" stroke="${C.wood}" stroke-width="3"/><path d="${circ(135, 810, 5)}${circ(365, 799, 5)}" fill="${C.brass}"/>`);
    o.push(`<path d="${ell(160, 690, 150, 18)}" fill="${C.glass}" opacity=".1" filter="${S.blur(2)}"/>`);
    // round-bottom flask with a teal liquid
    o.push(`<path d="M106,560h20v52a40,40 0 1 1 -20,0Z" fill="${C.glass}" opacity=".22" stroke="${C.frost}" stroke-width="2"/>`);
    o.push(`<path d="M80,650a36,36 0 0 0 72,0Z" fill="#4ad0c8" opacity=".75"/><path d="${circ(108, 642, 6)}" fill="#fff" opacity=".6"/>`);
    // graduated cylinder (violet) with tick marks only
    o.push(`<path d="M190,560h26v118h-26Z" fill="${C.glass}" opacity=".18" stroke="${C.frost}" stroke-width="2"/><path d="M192,610h22v66h-22Z" fill="#9a7ae0" opacity=".7"/>`);
    let gt = '';
    for (let y = 572; y < 670; y += 12) gt += `M190,${y}h${y % 24 ? 6 : 10}`;
    o.push(`<path d="${gt}" stroke="${C.frost}" stroke-width="1.2" opacity=".7"/>`);
    // retort with amber liquid over a tiny burner
    o.push(`<path d="M300,668a34,34 0 1 1 30,-50L392,598" fill="none" stroke="${C.frost}" stroke-width="2.4" opacity=".8"/><path d="M270,650a34,34 0 0 0 64,0Z" fill="${C.amber}" opacity=".7"/>`);
    o.push(`<path d="M284,688h44l-6,-14h-32Z" fill="${C.brassDark}"/><path d="${circ(306, 676, 6)}" fill="${C.amber}"/><path d="${circ(306, 672, 16)}" fill="${C.amber}" opacity=".3" filter="${S.blur(2)}"/>`);
    // little armillary on a stand
    o.push(`<path d="M430,676h40l-8,-8h-24ZM448,668V626h4V668Z" fill="${C.brassDark}"/><path d="${circ(450, 604, 24)}${ell(450, 604, 24, 8)}" fill="none" stroke="${C.brass}" stroke-width="2"/><path d="${ell(450, 604, 8, 24)}" fill="none" stroke="${C.brassHi}" stroke-width="1.6" transform="rotate(24 450 604)"/><path d="${circ(450, 604, 5)}" fill="${C.gold}"/>`);
    // stacked plain books and a rack of test tubes
    o.push(`<path d="M20,676l70,-4v-14l-70,4ZM26,660l62,-4v-12l-62,4Z" fill="#4a3a5a"/><path d="M20,676l70,-4" stroke="${C.brassHi}" stroke-width="1" opacity=".5"/>`);
    let tt = '';
    for (let i = 0; i < 4; i++) tt += `M${238 + i * 11},620v40a4,4 0 0 0 8,0v-40Z`;
    o.push(`<path d="M232,664h50v6h-50Z" fill="${C.brassDark}"/><path d="${tt}" fill="${C.glass}" opacity=".35" stroke="${C.frost}" stroke-width="1"/><path d="M239,646v14a4,4 0 0 0 6,0v-14ZM261,640v20a4,4 0 0 0 6,0v-20Z" fill="${C.gold}" opacity=".7"/>`);
    S.add(o.join(''));
  }

  // ---- foreground right: the crystal terminal on a brass stand -----------------------------------------------------------
  {
    const o = [];
    const panel = [[1150, 540], [1420, 512], [1452, 702], [1176, 732]];
    o.push(`<path d="${ell(1300, 845, 210, 30)}" fill="${C.glass}" opacity=".16" filter="${S.blur(3)}"/>`);
    o.push(`<path d="M1270,900L1284,744h30L1330,900Z" fill="${C.brassDark}"/><path d="M1284,744h30" stroke="${C.brassHi}" stroke-width="3"/><path d="M1220,900l50,-30h60l50,30Z" fill="${C.brass}"/>`);
    o.push(`<path d="${pz(panel)}" fill="${C.glass}" opacity=".35" filter="${S.blur(2)}" transform="translate(0 4)"/>`);
    o.push(`<path d="${pz(panel)}" fill="${S.lin([[0, '#dffaff', 0.92], [0.5, '#7fd2e2', 0.82], [1, '#2a6a80', 0.9]], UL(1150, 520, 1440, 730))}" stroke="${C.brassHi}" stroke-width="3"/>`);
    o.push(`<path d="M1150,540L1176,732" stroke="#fff" stroke-width="2" opacity=".6"/><path d="M1420,512L1452,702" stroke="${C.glassDeep}" stroke-width="3" opacity=".7"/>`);
    // rows of light (no glyphs) on the left of the slab, a ring schematic on the right
    const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    let rows = '';
    for (let i = 0; i < 9; i++) {
      const t = 0.12 + i * 0.09;
      const l = lerp(panel[0], panel[3], t), rgt = lerp(panel[1], panel[2], t);
      const a = lerp(l, rgt, 0.07), b = lerp(l, rgt, 0.07 + R.range(0.18, 0.46));
      rows += `M${r0(a[0])},${r0(a[1])}L${r0(b[0])},${r0(b[1])}`;
    }
    o.push(`<path d="${rows}" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" opacity=".55"/>`);
    const cc = [1366, 600];
    let nodes = '', spokes = '';
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const p = [cc[0] + Math.cos(a) * 40, cc[1] + Math.sin(a) * 34]; nodes += circ(p[0], p[1], 3); spokes += `M${cc[0]},${cc[1]}L${r0(p[0])},${r0(p[1])}`; }
    o.push(`<path d="${ell(cc[0], cc[1], 40, 34)}${ell(cc[0], cc[1], 22, 19)}" fill="none" stroke="#ffffff" stroke-width="1.6" opacity=".6"/><path d="${spokes}" stroke="#ffffff" stroke-width="1" opacity=".4"/><path d="${nodes}" fill="#ffffff" opacity=".8"/><path d="${circ(cc[0], cc[1], 6)}" fill="${C.gold}"/>`);
    S.add(o.join(''));
  }

  // ---- vignette ---------------------------------------------------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.62, '#000', 0], [1, '#000', 0.72]], U(800, 430, 980))}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 诺克斯观测所·核心室（平时 / 月蚀）
// ---------------------------------------------------------------------------------------------
const CORE = {
  base: {
    deep: '#06050e', sky: [[0, '#1a1a42'], [1, '#07071a']], star: '#e8e4ff',
    dome: [[0, '#0c0b1a'], [0.55, '#1a1730'], [1, '#2a2446']], rib: '#2e2a4a', ribHi: '#5a5070',
    wall: [[0, '#2a2440'], [1, '#171426']], pilaster: '#3a3454', pilasterLit: '#4a4266',
    brass: '#b08a4a', brassHi: '#f0d08a', brassDark: '#5e4626', lamp: '#ffb35a',
    floor: [[0, '#1c1830'], [1, '#09080f']], rune: '#ffd27a', runeOp: 0.42,
    pedestal: '#36304a', pedestalTop: '#4a4462', pedestalGlow: '#ffd27a',
    beam: '#c8d4f4', beamOp: 0.2,
    seedCore: '#fffbea', seedMid: '#ffd27a', seedEdge: '#e0963a', aura: '#ffcf70', mote: '#ffe2a0',
  },
  eclipse: {
    deep: '#08030a', sky: [[0, '#2a0a18'], [1, '#0a0208']], star: '#ffb8c0',
    dome: [[0, '#0e040c'], [0.55, '#220a1c'], [1, '#3a1430']], rib: '#3e1630', ribHi: '#6a2a44',
    wall: [[0, '#3a1430'], [1, '#1c0814']], pilaster: '#4a1a36', pilasterLit: '#5a2242',
    brass: '#9a5a3c', brassHi: '#e8907a', brassDark: '#4a2018', lamp: '#d0503a',
    floor: [[0, '#220c1c'], [1, '#0a0308']], rune: '#ff6a6a', runeOp: 0.5,
    pedestal: '#3e1a30', pedestalTop: '#56243e', pedestalGlow: '#ff6a6a',
    beam: '#ff7a7a', beamOp: 0.14,
    seedCore: '#ffffff', seedMid: '#ffe4ec', seedEdge: '#d04a6a', aura: '#ff8a9a', mote: '#ff7a86',
  },
};

function noxCore(eclipse) {
  const C = eclipse ? CORE.eclipse : CORE.base;
  const S = new Scene(eclipse ? 'sbGdNoxCoreEcl' : 'sbGdNoxCore', eclipse
    ? '诺克斯观测所·核心室·月蚀：同一个球形核心室，穹顶齿轮圆口里的月亮蚀成了暗红的环，整个房间转为暗红紫；巨大的黄铜环层层围着中央发白的种子状核心，四周飘着红色的余烬；地上一圈阵纹和四个基座泛着红光；不画人物，不画能读出的字'
    : '诺克斯观测所·核心室：球形的房间，穹顶的圆口镶着一圈齿轮，口里是星空和被蚀去大半的月亮，一道淡淡的月光落下来；几道巨大的黄铜环带着刻度，层层围着中央悬浮的金色种子状核心，四周飘着金色的碎光；地上一圈阵纹，四个方位各立一个基座；环墙上是黄铜壁柱与琥珀色的壁灯；不画人物，不画能读出的字', 91001);
  const R = rng(91002);
  const SX = 800, SY = 388; // the seed
  const OC = [800, 112], ORX = 190, ORY = 86; // the oculus

  // ---- dome: radial shell, parallels and meridians ------------------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${C.deep}"/>`);
  S.add(`<rect width="${W}" height="620" fill="${S.lin(C.dome, UL(0, 0, 0, 620))}"/>`);
  {
    // seen from below at a slant: the parallels are ellipses around the oculus, the ribs run straight out of it
    let par = '';
    for (const [rx, ry] of [[360, 168], [610, 290], [920, 430]]) par += ell(OC[0], OC[1] + ry * 0.12, rx, ry);
    let mer = '';
    for (let i = 0; i < 18; i++) {
      const a = (i + 0.5) / 18 * Math.PI * 2;
      const dx = Math.cos(a), dy = Math.sin(a);
      if (dy < -0.25) continue;
      const p0 = [OC[0] + dx * (ORX + 26), OC[1] + dy * (ORY + 14)];
      const p1 = [OC[0] + dx * 1500, OC[1] + dy * 1500 * ORY / ORX + 260];
      mer += `M${r0(p0[0])},${r0(p0[1])}L${r0(p1[0])},${r0(p1[1])}`;
    }
    S.add(`<path d="${par}" fill="none" stroke="${C.rib}" stroke-width="6"/><path d="${mer}" fill="none" stroke="${C.rib}" stroke-width="8"/>`);
    S.add(`<path d="${mer}" fill="none" stroke="${C.ribHi}" stroke-width="1.4" opacity=".45" transform="translate(-3 0)"/><path d="${par}" fill="none" stroke="${C.ribHi}" stroke-width="1.2" opacity=".35" transform="translate(0 -3)"/>`);
    // faint engraved stars on the shell
    let sd = '';
    for (let i = 0; i < 60; i++) { const x = R.range(40, 1560), y = R.range(40, 420); if (Math.hypot((x - OC[0]) / (ORX + 40), (y - OC[1]) / (ORY + 40)) > 1) sd += circ(x, y, R.range(0.6, 1.4)); }
    S.add(`<path d="${sd}" fill="${C.star}" opacity=".3"/>`);
  }

  // ---- the oculus: sky, stars, the moon (partly eclipsed / a dark red ring), a toothed brass rim ----------------------------
  {
    const hole = ell(OC[0], OC[1], ORX, ORY);
    const clip = S.clip(hole);
    const o = [`<rect x="${OC[0] - ORX}" y="${OC[1] - ORY}" width="${ORX * 2}" height="${ORY * 2}" fill="${S.lin(C.sky)}"/>`];
    let st = '';
    for (let i = 0; i < 46; i++) st += circ(OC[0] + R.range(-ORX, ORX), OC[1] + R.range(-ORY, ORY), R.range(0.5, 1.6));
    o.push(`<path d="${st}" fill="${C.star}" opacity=".8"/>`);
    const M = [688, 104], MR = 44;
    if (eclipse) {
      o.push(`<path d="${circ(M[0], M[1], MR * 2.1)}" fill="${S.rad([[0, '#ff4a3a', 0.45], [0.5, '#8a1a2a', 0.2], [1, '#3a0a18', 0]], U(M[0], M[1], MR * 2.1))}"/>`);
      o.push(`<path d="${circ(M[0], M[1], MR + 5)}" fill="none" stroke="#c8302a" stroke-width="7" opacity=".85" filter="${S.blur(1)}"/>`);
      o.push(`<path d="${circ(M[0], M[1], MR)}" fill="#0c0306"/><path d="${circ(M[0], M[1], MR)}" fill="none" stroke="#ff7a5a" stroke-width="2.2"/>`);
    } else {
      const mc = S.clip(circ(M[0], M[1], MR));
      o.push(`<path d="${circ(M[0], M[1], MR * 1.9)}" fill="${S.rad([[0, '#e8e4ff', 0.35], [1, '#e8e4ff', 0]], U(M[0], M[1], MR * 1.9))}"/>`);
      o.push(`<g clip-path="${mc}"><path d="${circ(M[0], M[1], MR)}" fill="#f2ecdc"/><path d="${circ(M[0] + 6, M[1] - 4, MR * 0.22)}${circ(M[0] - 14, M[1] + 12, MR * 0.14)}" fill="#d8d0c0"/>` +
        `<path d="${circ(M[0] + MR * 0.55, M[1] - MR * 0.2, MR * 1.05)}" fill="#3a2430" opacity=".95" filter="${S.blur(1)}"/></g>`);
    }
    S.add(`<g clip-path="${clip}">${o.join('')}</g>`);
    // toothed rim: the gear around the moon
    let teeth = '';
    const n = 40;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2, a1 = a0 + Math.PI / n;
      const p = (a, s) => [OC[0] + Math.cos(a) * (ORX + s), OC[1] + Math.sin(a) * (ORY + s * 0.45)];
      const A = p(a0, 10), B = p(a0 + 0.02, 30), Cc = p(a1 - 0.02, 30), D = p(a1, 10);
      teeth += pz([A, B, Cc, D]);
    }
    S.add(`<path d="${teeth}" fill="${C.brass}" stroke="${C.brassDark}" stroke-width="2"/><path d="${ell(OC[0], OC[1], ORX + 9, ORY + 4)}" fill="none" stroke="${C.brass}" stroke-width="14"/><path d="${ell(OC[0], OC[1], ORX + 2, ORY + 1)}" fill="none" stroke="${C.brassHi}" stroke-width="2.5" opacity=".7"/>`);
  }

  // ---- ring wall below the dome: pilasters, brass dials, wall lamps --------------------------------------------------------
  {
    const top = (x) => 470 - 0.00012 * (x - 800) ** 2;
    const bot = (x) => 598 + 0.00013 * (x - 800) ** 2;
    const xs = Array.from({ length: 33 }, (_, i) => -20 + i * 51.25);
    S.add(`<path d="M${xs.map((x) => `${r0(x)},${r0(top(x))}`).join('L')}L${xs.slice().reverse().map((x) => `${r0(x)},${r0(bot(x))}`).join('L')}Z" fill="${S.lin(C.wall, UL(0, 380, 0, 680))}"/>`);
    S.add(`<path d="M${xs.map((x) => `${r0(x)},${r0(top(x))}`).join('L')}" fill="none" stroke="${C.brass}" stroke-width="5"/>`);
    let pil = '', lit = '', dials = '', lamps = '', glows = '';
    for (let i = -5; i <= 5; i++) {
      const x = 800 + Math.tan(i * 0.135) * 1200;
      if (x < -60 || x > 1660) continue;
      const w = 22 / Math.cos(i * 0.135) ** 2;
      const t = top(x), b = bot(x);
      pil += `M${f1(x - w / 2)},${f1(t)}V${f1(b)}H${f1(x + w / 2)}V${f1(t)}Z`;
      lit += `M${f1(x - w / 2)},${f1(t)}V${f1(b)}h${f1(w * 0.3)}V${f1(t)}Z`;
      if (i !== 5) {
        const xm = 800 + Math.tan((i + 0.5) * 0.135) * 1200, ym = (top(xm) + bot(xm)) / 2, rr = 18 / Math.cos((i + 0.5) * 0.135);
        if (xm > -40 && xm < 1640 && Math.abs(i + 0.5) > 1) dials += circ(xm, ym, rr) + `M${f1(xm)},${f1(ym)}L${f1(xm + rr * 0.7)},${f1(ym - rr * 0.4)}`;
      }
      if (Math.abs(i) >= 2) { const ly = t + (b - t) * 0.32; lamps += `M${f1(x - 6)},${f1(ly)}h12l-3,12h-6Z`; glows += circ(x, ly + 4, 38); }
    }
    S.add(`<path d="${pil}" fill="${C.pilaster}"/><path d="${lit}" fill="${C.pilasterLit}"/><path d="${dials}" fill="none" stroke="${C.brass}" stroke-width="2.2" opacity=".75"/>`);
    S.add(`<path d="${glows}" fill="${C.lamp}" opacity="${eclipse ? 0.18 : 0.28}" filter="${S.blur(3)}"/><path d="${lamps}" fill="${C.lamp}" stroke="${C.brass}" stroke-width="1.2"/>`);
  }

  // ---- floor and the ritual circle with four pedestals ---------------------------------------------------------------------
  const FC = [800, 738], FRX = 610, FRY = 124;
  {
    const bot = (x) => 598 + 0.00013 * (x - 800) ** 2;
    const xs = Array.from({ length: 33 }, (_, i) => -20 + i * 51.25);
    S.add(`<path d="M${xs.map((x) => `${r0(x)},${r0(bot(x))}`).join('L')}L1640,900L-40,900Z" fill="${S.lin(C.floor, UL(0, 600, 0, 900))}"/>`);
    S.add(`<path d="${ell(FC[0], FC[1], FRX + 60, FRY + 16)}" fill="#000" opacity=".25"/>`);
    let rings = '';
    for (const s of [1, 0.95, 0.7, 0.42]) rings += ell(FC[0], FC[1], FRX * s, FRY * s);
    const P = (a, s) => [FC[0] + Math.cos(a) * FRX * s, FC[1] + Math.sin(a) * FRY * s];
    let geo = '';
    const sq = [0, 1, 2, 3].map((i) => P(i * Math.PI / 2, 0.95));
    geo += pz(sq);
    const sq2 = [0, 1, 2, 3].map((i) => P(Math.PI / 4 + i * Math.PI / 2, 0.7));
    geo += pz(sq2);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; const A = P(a, 0.42), B = P(a, 0.7); geo += `M${r0(A[0])},${r0(A[1])}L${r0(B[0])},${r0(B[1])}`; }
    // rune-like marks between the outer rings: ticks, small circles and chevrons (never letters)
    let marks = '';
    for (let i = 0; i < 56; i++) {
      const a = i / 56 * Math.PI * 2, A = P(a, 0.965), B = P(a, 0.985), k = 0.5 + 0.5 * Math.sin(a);
      const kind = i % 4;
      if (kind === 0) marks += `M${f1(A[0])},${f1(A[1] - 2 * k)}L${f1(B[0])},${f1(B[1] + 2 * k)}`;
      else if (kind === 1) marks += circ((A[0] + B[0]) / 2, (A[1] + B[1]) / 2, 1.6 + 1.6 * k);
      else if (kind === 2) marks += `M${f1(A[0] - 3 * k - 1)},${f1(A[1] + 2)}L${f1(A[0])},${f1(A[1] - 2 - k)}L${f1(A[0] + 3 * k + 1)},${f1(A[1] + 2)}`;
    }
    S.add(`<path d="${rings}${geo}${marks}" fill="none" stroke="${C.rune}" stroke-width="2" opacity="${C.runeOp}"/>`);
    S.add(`<path d="${ell(FC[0], FC[1], FRX * 0.42, FRY * 0.42)}" fill="${C.rune}" opacity=".07"/>`);
    // pedestals at the four quarters, back pair first
    const peds = [[225, 0.82], [315, 0.82], [135, 1], [45, 1]].map(([deg, sc]) => { const p = P(deg * Math.PI / 180, 0.78); return [p[0], p[1], sc]; });
    for (const [x, y, sc] of peds) {
      const rx = 54 * sc, ry = 14 * sc, h = 56 * sc, top = y - h, bx = rx * 1.22, by = ry * 1.22;
      S.add(`<path d="${ell(x, y + 4, rx * 1.7, ry * 1.6)}" fill="${C.pedestalGlow}" opacity=".14" filter="${S.blur(2)}"/>`);
      S.add(`<path d="M${f1(x - bx)},${f1(y)}L${f1(x - rx)},${f1(top)}A${f1(rx)},${f1(ry)} 0 0 0 ${f1(x + rx)},${f1(top)}L${f1(x + bx)},${f1(y)}A${f1(bx)},${f1(by)} 0 0 1 ${f1(x - bx)},${f1(y)}Z" fill="${S.lin([[0, C.pedestalTop], [0.4, C.pedestal], [1, C.deep]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
      S.add(`<path d="M${f1(x - bx * 0.97)},${f1(y - h * 0.18)}A${f1(bx)},${f1(by)} 0 0 0 ${f1(x + bx * 0.97)},${f1(y - h * 0.18)}M${f1(x - rx * 1.04)},${f1(top + h * 0.12)}A${f1(rx)},${f1(ry)} 0 0 0 ${f1(x + rx * 1.04)},${f1(top + h * 0.12)}" fill="none" stroke="${C.brass}" stroke-width="${f1(3 * sc)}"/>`);
      S.add(`<path d="${ell(x, top, rx, ry)}" fill="${C.pedestalTop}" stroke="${C.brassHi}" stroke-width="${f1(1.6 * sc)}"/><path d="${ell(x, top, rx * 0.62, ry * 0.62)}" fill="${C.pedestalGlow}" opacity=".5"/><path d="${ell(x, top, rx * 0.3, ry * 0.3)}" fill="${C.seedCore}" opacity=".5"/>`);
    }
  }

  // ---- the beam of moonlight from the oculus down through the seed ------------------------------------------------------
  S.add(`<path d="M${OC[0] - 120},${OC[1] + 40}L${OC[0] + 70},${OC[1] + 50}L${FC[0] + 150},${FC[1]}L${FC[0] - 210},${FC[1]}Z" fill="${C.beam}" opacity="${C.beamOp}" filter="${S.blur(3)}"/>`);

  // ---- rings of the great apparatus: back halves, then the seed, then front halves ----------------------------------------
  const RINGS = [
    { rx: 520, ry: 118, rot: -8, w: 15 },
    { rx: 370, ry: 282, rot: 30, w: 10 },
    { rx: 112, ry: 318, rot: -7, w: 11 },
    { rx: 245, ry: 62, rot: 13, w: 7 },
  ];
  const ringHalf = (g, back) => {
    const a = back ? `M${SX - g.rx},${SY}A${g.rx},${g.ry} 0 0 1 ${SX + g.rx},${SY}` : `M${SX + g.rx},${SY}A${g.rx},${g.ry} 0 0 1 ${SX - g.rx},${SY}`;
    let tk = '';
    const n = Math.round(g.rx / 14);
    for (let i = 1; i < n; i++) {
      const t = Math.PI * i / n * (back ? -1 : 1) + Math.PI;
      const c = Math.cos(t), s = Math.sin(t);
      const long = i % 5 === 0;
      const i0 = 1 - (g.w * (long ? 0.9 : 0.5)) / g.rx, i1 = 1 + 0.2 * g.w / g.rx;
      tk += `M${f1(SX + c * g.rx * i0)},${f1(SY + s * g.ry * i0)}L${f1(SX + c * g.rx * i1)},${f1(SY + s * g.ry * i1)}`;
    }
    const tr = `transform="rotate(${g.rot} ${SX} ${SY})"`;
    return `<g ${tr}${back ? ' opacity=".72"' : ''}><path d="${a}" fill="none" stroke="${C.brassDark}" stroke-width="${g.w + 4}"/><path d="${a}" fill="none" stroke="${C.brass}" stroke-width="${g.w}"/>` +
      `<path d="${a}" fill="none" stroke="${C.brassHi}" stroke-width="${f1(g.w * 0.22)}" opacity=".8"/><path d="${tk}" stroke="${C.brassDark}" stroke-width="1.6"/></g>`;
  };
  for (const g of RINGS) S.add(ringHalf(g, true));

  // golden motes behind and around the seed (a little sky of their own)
  {
    let back = '', front = '';
    for (let i = 0; i < 150; i++) {
      const a = R.range(0, Math.PI * 2), d = Math.pow(R(), 0.6);
      const x = SX + Math.cos(a) * d * 330, y = SY + Math.sin(a) * d * 220;
      const s = R.range(1.2, 3.6) * (1.2 - d * 0.5);
      const m = R() < 0.5 ? `M${f1(x)},${f1(y - s)}L${f1(x + s * 0.6)},${f1(y)}L${f1(x)},${f1(y + s)}L${f1(x - s * 0.6)},${f1(y)}Z` : circ(x, y, s * 0.55);
      if (R() < 0.5) back += m; else front += m;
    }
    S.add(`<path d="${back}" fill="${C.mote}" opacity=".55"/>`);
    // the seed's aura, rays and body
    S.add(`<path d="${circ(SX, SY, 260)}" fill="${S.rad([[0, C.aura, 0.42], [0.35, C.aura, 0.14], [1, C.aura, 0]], U(SX, SY, 260))}"/>`);
    let ry = '';
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2 + 0.11, l = i % 2 ? 150 : 230, sp = 0.035;
      ry += `M${SX},${SY}L${f1(SX + Math.cos(a - sp) * l)},${f1(SY + Math.sin(a - sp) * l * 0.85)}L${f1(SX + Math.cos(a + sp) * l)},${f1(SY + Math.sin(a + sp) * l * 0.85)}Z`;
    }
    S.add(`<path d="${ry}" fill="${C.seedMid}" opacity=".12"/>`);
    S.add(`<path d="${circ(SX, SY, 84)}" fill="${C.seedMid}" opacity=".7" filter="${S.blur(3)}"/>`);
    // the seed itself, drawn in units of K (pointed crown up, rounded base)
    const K = 1.4, X = (dx) => f1(SX + dx * K), Y = (dy) => f1(SY + dy * K);
    const seed = `M${X(0)},${Y(-50)}C${X(30)},${Y(-30)} ${X(36)},${Y(8)} ${X(24)},${Y(30)}C${X(14)},${Y(46)} ${X(-14)},${Y(46)} ${X(-24)},${Y(30)}C${X(-36)},${Y(8)} ${X(-30)},${Y(-30)} ${X(0)},${Y(-50)}Z`;
    S.add(`<path d="${seed}" fill="${S.rad([[0, C.seedCore], [0.45, C.seedMid], [1, C.seedEdge]], U(SX - 8, SY + 6, 52 * K))}" stroke="${C.seedCore}" stroke-width="2"/>`);
    S.add(`<path d="M${X(0)},${Y(-40)}C${X(8)},${Y(-10)} ${X(6)},${Y(18)} ${X(0)},${Y(38)}M${X(0)},${Y(-6)}C${X(-10)},${Y(4)} ${X(-14)},${Y(14)} ${X(-16)},${Y(24)}M${X(2)},${Y(8)}C${X(10)},${Y(16)} ${X(14)},${Y(22)} ${X(16)},${Y(28)}" fill="none" stroke="${C.seedEdge}" stroke-width="2" opacity=".55"/>`);
    S.add(`<path d="${ell(SX - 9 * K, SY - 16 * K, 6 * K, 12 * K)}" fill="#fff" opacity=".7" transform="rotate(-20 ${r0(SX - 9 * K)} ${r0(SY - 16 * K)})"/>`);
    for (const g of RINGS) S.add(ringHalf(g, false));
    S.add(`<path d="${front}" fill="${C.mote}" opacity=".85"/>`);
  }

  // ---- vignette ---------------------------------------------------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', 0], [1, '#000', eclipse ? 0.8 : 0.7]], U(800, 420, 960))}"/>`);
  return S.out();
}

export const gaidenEBgs = {
  'nox-observatory-lab': () => noxLab(),
  'nox-observatory-core': () => noxCore(false),
  'nox-observatory-core-eclipse': () => noxCore(true),
};
