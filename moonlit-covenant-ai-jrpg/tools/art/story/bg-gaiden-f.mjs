// 外传《银轨号》正篇第11、12章的场景背景：nox-observatory-restroom（诺克斯观测所·休整室）、nox-observatory-eclipse-void（月蚀完成·虚空）。
import { Scene, W, H, f, pz, pl, persp } from './lib.mjs';

const r0 = (v) => f(v, 0);

// ─────────────────────────────────────────────────────────────────────────────────────────────
// 诺克斯观测所·休整室：地下观测所里观测员的休息室。几张行军床、叠好的灰毛毯、桌上一盏油灯（唯一的光）、
// 墙上钉着泛黄的旧星图；门缝底下漏进一线黎明种的金光。温暖，但疲惫。
// ─────────────────────────────────────────────────────────────────────────────────────────────
function restroom() {
  const S = new Scene('sbGdRestroom', '诺克斯观测所·休整室：地下观测所里一间观测员的休息室，白墙被油灯照成暖褐色；几张简易行军床上叠着灰毛毯，桌上一盏油灯是唯一的光，墙上钉着一张泛黄的旧星图，衣钩上挂着一件旧观测袍，门缝底下漏进一线金光；温暖但疲惫，没有人', 11201);
  const VP = [800, 430], F = 760, EYE = 1.5;
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const XL = -2.6, XR = 2.6, YC = 2.7, Z0 = 0.8, ZB = 5.6, WN = 0.82;
  const C = {
    plaster: '#4e3d34', plasterLit: '#7a5e48', plasterDark: '#211a20',
    wain: '#33262a', wainLit: '#5a4232', wainDark: '#18121a',
    ceil: '#161117', metal: '#2a2228', metalHi: '#9a744c',
    blanket: '#3c3c44', blanketLit: '#4c4a54', blanketDark: '#22222a', stripe: '#6a3030',
    mat: '#40382f', matLit: '#52463a', matDark: '#241e1a',
    wood: '#4a3424', woodLit: '#7a5638', woodDark: '#241812',
    paper: '#b4935e', paperDark: '#7e6440', ink: '#4e3a26',
    gold: '#ffc66a', flame: '#fff1c4',
  };
  const lamp = { X: -0.1, Z: 3.5, Y: 0.74 };
  const L = pr(lamp.X, lamp.Y + 0.27, lamp.Z); // flame
  S.add(`<rect width="${W}" height="${H}" fill="#0c090c"/>`);

  // ---- shell: walls, wainscot, ceiling, floor ---------------------------------------------------------------------------
  {
    const o = [];
    const warmAt = (x0, x1) => S.lin([[0, x0], [1, x1]], 'x1="0" y1="0" x2="1" y2="0"');
    o.push(`<path d="${q([[XL, YC, Z0], [XR, YC, Z0], [XR, YC, ZB], [XL, YC, ZB]])}" fill="${C.ceil}"/>`);
    // back wall: lit around the lamp's x, darker to both sides
    const bw = S.lin([[0, C.plasterDark], [0.42, C.plasterLit], [0.62, C.plaster], [1, C.plasterDark]], 'x1="0" y1="0" x2="1" y2="0"');
    o.push(`<path d="${q([[XL, WN, ZB], [XL, YC, ZB], [XR, YC, ZB], [XR, WN, ZB]])}" fill="${bw}"/>`);
    o.push(`<path d="${q([[XL, 0, ZB], [XL, WN, ZB], [XR, WN, ZB], [XR, 0, ZB]])}" fill="${S.lin([[0, C.wainDark], [0.42, C.wainLit], [1, C.wainDark]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    o.push(`<path d="${q([[XL, WN, Z0], [XL, YC, Z0], [XL, YC, ZB], [XL, WN, ZB]])}" fill="${warmAt(C.plasterDark, C.plaster)}"/>`);
    o.push(`<path d="${q([[XL, 0, Z0], [XL, WN, Z0], [XL, WN, ZB], [XL, 0, ZB]])}" fill="${warmAt(C.wainDark, C.wain)}"/>`);
    o.push(`<path d="${q([[XR, WN, Z0], [XR, YC, Z0], [XR, YC, ZB], [XR, WN, ZB]])}" fill="${warmAt(C.plaster, C.plasterDark)}"/>`);
    o.push(`<path d="${q([[XR, 0, Z0], [XR, WN, Z0], [XR, WN, ZB], [XR, 0, ZB]])}" fill="${warmAt(C.wain, C.wainDark)}"/>`);
    // chair rail along the top of the wainscot
    o.push(`<path d="${pl(pr.poly([[XL, WN, Z0], [XL, WN, ZB], [XR, WN, ZB], [XR, WN, Z0]]))}" fill="none" stroke="${C.wainLit}" stroke-width="3" opacity=".8"/>`);
    // wainscot panel seams
    let pn = '';
    for (let x = XL + 0.5; x < XR; x += 0.62) pn += pl(pr.poly([[x, 0.06, ZB], [x, WN - 0.06, ZB]]));
    for (let z = 1.4; z < ZB; z += 0.75) pn += pl(pr.poly([[XL, 0.06, z], [XL, WN - 0.06, z]])) + pl(pr.poly([[XR, 0.06, z], [XR, WN - 0.06, z]]));
    o.push(`<path d="${pn}" stroke="${C.wainDark}" stroke-width="1.5" opacity=".75"/>`);
    // floor: worn stone tiles, warm near the lamp
    o.push(`<path d="${q([[XL, 0, 0.5], [XR, 0, 0.5], [XR, 0, ZB], [XL, 0, ZB]])}" fill="${S.lin([[0, '#2e231e'], [0.35, '#3e2f24'], [1, '#120d10']], `gradientUnits="userSpaceOnUse" x1="0" y1="${VP[1] + 200}" x2="0" y2="${H}"`)}"/>`);
    let tl = '';
    for (let x = XL + 0.52; x < XR; x += 0.52) tl += pl(pr.poly([[x, 0, 0.5], [x, 0, ZB]]));
    for (let z = 1.0; z < ZB; z *= 1.22) tl += pl(pr.poly([[XL, 0, z], [XR, 0, z]]));
    o.push(`<path d="${tl}" stroke="#0e0a0c" stroke-width="1.6" opacity=".55"/>`);
    S.add(o.join(''));
  }

  // ---- pipes along the ceiling edge (an underground observatory) ---------------------------------------------------------
  {
    const o = [];
    const pipeZ = (x, y, z0, z1, t) => q([[x, y - t, z0], [x, y + t, z0], [x, y + t, z1], [x, y - t, z1]]);
    o.push(`<path d="${pipeZ(XL + 0.14, YC - 0.16, 1.2, ZB, 0.05)}${pipeZ(XL + 0.3, YC - 0.12, 1.2, ZB, 0.035)}" fill="${C.metal}"/>`);
    o.push(`<path d="${pl(pr.poly([[XL + 0.14, YC - 0.2, 1.2], [XL + 0.14, YC - 0.2, ZB]]))}" stroke="${C.metalHi}" stroke-width="1.5" opacity=".35"/>`);
    o.push(`<path d="${q([[XL, YC - 0.2, ZB - 0.04], [XR, YC - 0.2, ZB - 0.04], [XR, YC - 0.1, ZB - 0.04], [XL, YC - 0.1, ZB - 0.04]])}" fill="${C.metal}"/>`);
    let br = '';
    for (const z of [1.8, 3.0, 4.2]) br += q([[XL + 0.02, YC - 0.24, z], [XL + 0.02, YC - 0.04, z], [XL + 0.02, YC - 0.04, z + 0.06], [XL + 0.02, YC - 0.24, z + 0.06]]);
    o.push(`<path d="${br}" fill="#0e0a0e" opacity=".55"/>`);
    // a ceiling lamp that no longer works
    const a = pr(0.25, YC, 3.0), b = pr(0.25, 2.38, 3.0), k = F / 3.0;
    o.push(`<path d="M${r0(a[0])},${r0(a[1])}V${r0(b[1])}" stroke="#0e0a0e" stroke-width="2"/>`);
    o.push(`<path d="M${r0(b[0] - 0.16 * k)},${r0(b[1] + 0.12 * k)}Q${r0(b[0])},${r0(b[1] - 0.08 * k)} ${r0(b[0] + 0.16 * k)},${r0(b[1] + 0.12 * k)}Z" fill="#1e181c" stroke="#0a070a" stroke-width="2"/>`);
    o.push(`<ellipse cx="${r0(b[0])}" cy="${r0(b[1] + 0.12 * k)}" rx="${r0(0.16 * k)}" ry="${r0(0.035 * k)}" fill="#3a3034"/>`);
    S.add(o.join(''));
  }

  // ---- the old star chart over the back bed -------------------------------------------------------------------------------
  {
    const z = ZB - 0.004, k = F / z;
    const x0 = -1.62, x1 = 0.18, y0 = 1.14, y1 = 2.3;
    const tlp = pr(x0, y1, z), trp = pr(x1, y1 - 0.035, z), brp = pr(x1, y0 - 0.03, z), blp = pr(x0, y0, z);
    const paper = pz([tlp, trp, brp, blp]);
    const o = [];
    o.push(`<path d="${pz([[tlp[0] + 5, tlp[1] + 6], [trp[0] + 5, trp[1] + 6], [brp[0] + 5, brp[1] + 6], [blp[0] + 5, blp[1] + 6]])}" fill="#0c080a" opacity=".45"/>`);
    o.push(`<path d="${paper}" fill="${S.lin([[0, C.paper], [0.7, '#a4844f'], [1, C.paperDark]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
    const clip = S.clip(paper);
    const g = [];
    // border
    const ins = 6;
    g.push(`<path d="${pz([[tlp[0] + ins, tlp[1] + ins], [trp[0] - ins, trp[1] + ins], [brp[0] - ins, brp[1] - ins], [blp[0] + ins, blp[1] - ins]])}" fill="none" stroke="${C.ink}" stroke-width="1.4" opacity=".7"/>`);
    // the celestial disc with a graticule
    const cx = tlp[0] + (trp[0] - tlp[0]) * 0.36, cy = (tlp[1] + blp[1]) / 2 + 2, R = 0.5 * k;
    g.push(`<circle cx="${r0(cx)}" cy="${r0(cy)}" r="${r0(R)}" fill="#c4a674" opacity=".55" stroke="${C.ink}" stroke-width="1.6"/>`);
    let gr = '';
    for (const t of [0.34, 0.67]) gr += `M${f(cx - R * t, 1)},${r0(cy)}a${f(R * t, 1)},${f(R * t, 1)} 0 1 0 ${f(2 * R * t, 1)},0a${f(R * t, 1)},${f(R * t, 1)} 0 1 0 ${f(-2 * R * t, 1)},0`;
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; gr += `M${r0(cx)},${r0(cy)}L${f(cx + Math.cos(a) * R, 1)},${f(cy + Math.sin(a) * R, 1)}`; }
    g.push(`<path d="${gr}" fill="none" stroke="${C.ink}" stroke-width=".9" opacity=".45"/>`);
    // the ecliptic, tilted
    g.push(`<ellipse cx="${r0(cx)}" cy="${r0(cy)}" rx="${r0(R * 0.96)}" ry="${r0(R * 0.34)}" transform="rotate(-23 ${r0(cx)} ${r0(cy)})" fill="none" stroke="#8a3a2a" stroke-width="1.4" opacity=".7"/>`);
    // constellations: dots joined by thin lines
    const R2 = S.R;
    const cons = [];
    for (let c = 0; c < 5; c++) {
      const a = R2.range(0, Math.PI * 2), d = R2.range(0.2, 0.8) * R;
      const bx = cx + Math.cos(a) * d, by = cy + Math.sin(a) * d;
      const pts = [];
      for (let i = 0; i < 4; i++) pts.push([bx + R2.range(-R * 0.22, R * 0.22), by + R2.range(-R * 0.18, R * 0.18)]);
      cons.push(pts);
    }
    g.push(`<path d="${cons.map((p) => pl(p)).join('')}" fill="none" stroke="${C.ink}" stroke-width="1" opacity=".75"/>`);
    let dots = '';
    for (const p of cons) for (const [x, y] of p) dots += `<circle cx="${r0(x)}" cy="${r0(y)}" r="${f(R2.range(1.3, 2.3), 1)}"/>`;
    for (let i = 0; i < 26; i++) { const a = R2.range(0, Math.PI * 2), d = Math.sqrt(R2()) * R * 0.95; dots += `<circle cx="${f(cx + Math.cos(a) * d, 1)}" cy="${f(cy + Math.sin(a) * d, 1)}" r="${f(R2.range(0.5, 1.1), 1)}"/>`; }
    g.push(`<g fill="${C.ink}">${dots}</g>`);
    // a row of moon phases down the right side, ending in an eclipse
    const mx = tlp[0] + (trp[0] - tlp[0]) * 0.8, mr = 0.07 * k;
    let ph = '';
    for (let i = 0; i < 5; i++) {
      const my = tlp[1] + 22 + i * (mr * 2.55);
      ph += `<circle cx="${r0(mx)}" cy="${r0(my)}" r="${f(mr, 1)}" fill="#e2c894" stroke="${C.ink}" stroke-width="1"/>`;
      const cover = i / 4;
      if (cover > 0) ph += `<circle cx="${f(mx + mr * 2 * (1 - cover), 1)}" cy="${r0(my)}" r="${f(mr, 1)}" fill="${i === 4 ? '#3a1a16' : C.ink}" opacity="${i === 4 ? 0.95 : 0.75}"/>`;
    }
    g.push(`<g clip-path="${S.clip(pz([[mx - mr - 1, tlp[1] + 4], [mx + mr + 1, tlp[1] + 4], [mx + mr + 1, blp[1] - 4], [mx - mr - 1, blp[1] - 4]]))}">${ph}</g>`);
    // ruled lines where the legend would be (no readable marks)
    let rl = '';
    for (let i = 0; i < 4; i++) { const y = blp[1] - 14 - i * 6; rl += `M${r0(cx - R * 0.8)},${r0(y)}h${r0(R * (0.7 + (i % 2) * 0.5))}`; }
    g.push(`<path d="${rl}" stroke="${C.ink}" stroke-width="1.2" opacity=".35"/>`);
    // age: stains and a fold line
    g.push(`<ellipse cx="${r0(trp[0] - 34)}" cy="${r0(brp[1] - 26)}" rx="28" ry="18" fill="#6a4e2c" opacity=".22"/><path d="M${r0((tlp[0] + trp[0]) / 2 + 8)},${r0(tlp[1])}L${r0((blp[0] + brp[0]) / 2 + 8)},${r0(blp[1])}" stroke="#5a4428" stroke-width="1.2" opacity=".3"/>`);
    o.push(`<g clip-path="${clip}">${g.join('')}</g>`);
    // a curled corner bottom right and four pins
    o.push(`<path d="M${r0(brp[0])},${r0(brp[1] - 22)}L${r0(brp[0] - 22)},${r0(brp[1])}L${r0(brp[0] - 4)},${r0(brp[1] - 4)}Z" fill="#d6b884" stroke="${C.paperDark}" stroke-width="1"/>`);
    for (const [x, y] of [[tlp[0] + 7, tlp[1] + 7], [trp[0] - 7, trp[1] + 7], [blp[0] + 7, blp[1] - 7]]) o.push(`<circle cx="${r0(x)}" cy="${r0(y)}" r="3.2" fill="#9a2a22"/>`);
    S.add(o.join(''));
  }

  // ---- the door at the back right, a line of gold light under it -------------------------------------------------------
  {
    const z = ZB - 0.004, D0 = 1.48, D1 = 2.28, DH = 2.02, o = [];
    o.push(`<path d="${q([[D0 - 0.08, 0, z], [D0 - 0.08, DH + 0.09, z], [D1 + 0.08, DH + 0.09, z], [D1 + 0.08, 0, z]])}" fill="#1c161a"/>`);
    o.push(`<path d="${q([[D0, 0.02, z - 0.001], [D0, DH, z - 0.001], [D1, DH, z - 0.001], [D1, 0.02, z - 0.001]])}" fill="${S.lin([[0, '#352c32'], [1, '#221c22']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    // riveted bands and a round porthole
    o.push(`<path d="${q([[D0, 0.45, z - 0.002], [D0, 0.52, z - 0.002], [D1, 0.52, z - 0.002], [D1, 0.45, z - 0.002]])}${q([[D0, 1.62, z - 0.002], [D0, 1.69, z - 0.002], [D1, 1.69, z - 0.002], [D1, 1.62, z - 0.002]])}" fill="#4a3c3a"/>`);
    const ph = pr((D0 + D1) / 2, 1.32, z - 0.002), k = F / z;
    o.push(`<circle cx="${r0(ph[0])}" cy="${r0(ph[1])}" r="${f(0.19 * k, 1)}" fill="#4a3c3a"/><circle cx="${r0(ph[0])}" cy="${r0(ph[1])}" r="${f(0.14 * k, 1)}" fill="${S.rad([[0, '#6a5228'], [1, '#14100e']])}"/>`);
    o.push(`<path d="M${r0(ph[0] - 0.08 * k)},${r0(ph[1] - 0.04 * k)}a${f(0.1 * k, 1)},${f(0.1 * k, 1)} 0 0 1 ${f(0.12 * k, 1)},${f(-0.07 * k, 1)}" stroke="${C.gold}" stroke-width="1.5" fill="none" opacity=".55"/>`);
    const hd = pr(D0 + 0.1, 1.0, z - 0.003);
    o.push(`<rect x="${r0(hd[0] - 3)}" y="${r0(hd[1] - 9)}" width="6" height="18" rx="2" fill="${C.metalHi}" opacity=".8"/>`);
    // the gold seeping under and around the door
    o.push(`<path d="${pl(pr.poly([[D0 + 0.02, 0.012, z - 0.002], [D1 - 0.02, 0.012, z - 0.002]]))}" stroke="${C.gold}" stroke-width="3"/>`);
    o.push(`<path d="${pl(pr.poly([[D1 + 0.005, 0.05, z - 0.002], [D1 + 0.005, DH - 0.05, z - 0.002]]))}" stroke="${C.gold}" stroke-width="1.2" opacity=".5"/>`);
    o.push(`<path d="${q([[D0 - 0.05, 0.002, z], [D1 + 0.05, 0.002, z], [D1 + 0.25, 0.002, z - 0.75], [D0 - 0.2, 0.002, z - 0.75]])}" fill="${C.gold}" opacity=".22" filter="${S.blur(2)}"/>`);
    S.add(o.join(''));
  }

  // ---- an old observer's robe on a peg between the chart and the door ---------------------------------------------------
  {
    const z = ZB - 0.01, k = F / z;
    const pg = pr(0.82, 2.02, z), o = [];
    const w = 0.42 * k, h = 1.12 * k, x = pg[0], y = pg[1] + 6;
    o.push(`<path d="M${r0(x - 0.07 * k)},${r0(y + 4)}C${r0(x - w * 0.55)},${r0(y + 10)} ${r0(x - w * 0.6)},${r0(y + h * 0.5)} ${r0(x - w * 0.5)},${r0(y + h)}L${r0(x + w * 0.46)},${r0(y + h - 3)}C${r0(x + w * 0.58)},${r0(y + h * 0.5)} ${r0(x + w * 0.52)},${r0(y + 10)} ${r0(x + 0.07 * k)},${r0(y + 4)}Z" fill="${S.lin([[0, '#8e8478'], [1, '#4e4640']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    o.push(`<path d="M${r0(x - w * 0.15)},${r0(y + 16)}C${r0(x - w * 0.22)},${r0(y + h * 0.5)} ${r0(x - w * 0.18)},${r0(y + h * 0.8)} ${r0(x - w * 0.24)},${r0(y + h - 1)}M${r0(x + w * 0.12)},${r0(y + 18)}C${r0(x + w * 0.2)},${r0(y + h * 0.55)} ${r0(x + w * 0.14)},${r0(y + h * 0.8)} ${r0(x + w * 0.22)},${r0(y + h - 2)}" stroke="#3a332e" stroke-width="2" fill="none" opacity=".6"/>`);
    o.push(`<path d="M${r0(x - 0.07 * k)},${r0(y + 4)}L${r0(x)},${r0(y + 22)}L${r0(x + 0.07 * k)},${r0(y + 4)}" stroke="#2e2824" stroke-width="2.5" fill="none"/>`);
    o.push(`<circle cx="${r0(x)}" cy="${r0(y - 2)}" r="4" fill="${C.metalHi}"/>`);
    S.add(o.join(''));
  }

  // ---- beds -----------------------------------------------------------------------------------------------------------------
  // axis 'z': runs from z0 (foot) to z1 (head); axis 'x': runs from x0 (head) to x1 (foot)
  const bed = (x0, x1, z0, z1, axis) => {
    const H0 = 0.34, HM = 0.43, o = [];
    // shadow on the floor
    o.push(`<path d="${q([[x0 - 0.05, 0.003, z0 - 0.05], [x1 + 0.05, 0.003, z0 - 0.05], [x1 + 0.1, 0.003, z1 + 0.05], [x0 - 0.1, 0.003, z1 + 0.05]])}" fill="#050305" opacity=".55" filter="${S.blur(2)}"/>`);
    // legs
    let lg = '';
    for (const [x, z] of [[x0 + 0.04, z0 + 0.04], [x1 - 0.04, z0 + 0.04], [x0 + 0.04, z1 - 0.04], [x1 - 0.04, z1 - 0.04]]) lg += pl(pr.poly([[x, 0, z], [x, H0, z]]));
    o.push(`<path d="${lg}" stroke="${C.metal}" stroke-width="4"/>`);
    // the side that faces the middle of the room is the one we see
    const side = x0 > 0 ? x0 : x1;
    // frame side and front
    o.push(`<path d="${q([[x0, H0 - 0.06, z0], [x0, H0, z0], [x1, H0, z0], [x1, H0 - 0.06, z0]])}${q([[side, H0 - 0.06, z0], [side, H0, z0], [side, H0, z1], [side, H0 - 0.06, z1]])}" fill="${C.metal}"/>`);
    // mattress: visible side, front and top
    o.push(`<path d="${q([[side, H0, z0], [side, HM, z0], [side, HM, z1], [side, H0, z1]])}" fill="${C.matDark}"/>`);
    o.push(`<path d="${q([[x0, H0, z0], [x0, HM, z0], [x1, HM, z0], [x1, H0, z0]])}" fill="${C.mat}"/>`);
    o.push(`<path d="${q([[x0, HM, z0], [x1, HM, z0], [x1, HM, z1], [x0, HM, z1]])}" fill="${S.lin([[0, C.matLit], [1, C.mat]])}"/>`);
    o.push(`<path d="${axis === 'z' ? pl(pr.poly([[(x0 + x1) / 2, HM + 0.002, z0 + 0.55], [(x0 + x1) / 2 + 0.06, HM + 0.002, z1 - 0.45]])) : pl(pr.poly([[x0 + 0.5, HM + 0.002, (z0 + z1) / 2], [x1 - 0.6, HM + 0.002, (z0 + z1) / 2 + 0.05]]))}" stroke="${C.matDark}" stroke-width="2" opacity=".6"/>`);
    // pillow at the head, folded blanket at the foot
    if (axis === 'z') {
      const px0 = x0 + 0.1, px1 = x1 - 0.1;
      o.push(`<path d="${q([[px0, HM, z1 - 0.38], [px1, HM, z1 - 0.38], [px1, HM + 0.1, z1 - 0.1], [px0, HM + 0.1, z1 - 0.1]])}" fill="#5a544a"/>`);
      const b0 = z0 + 0.06, b1 = z0 + 0.5, bh = 0.12;
      o.push(`<path d="${q([[x0 + 0.02, HM, b0], [x0 + 0.02, HM + bh, b0], [x1 - 0.02, HM + bh, b0], [x1 - 0.02, HM, b0]])}" fill="${C.blanket}"/>`);
      o.push(`<path d="${q([[side, HM, b0], [side, HM + bh, b0], [side, HM + bh, b1], [side, HM, b1]])}" fill="${C.blanketDark}"/>`);
      o.push(`<path d="${q([[x0 + 0.02, HM + bh, b0], [x1 - 0.02, HM + bh, b0], [x1 - 0.02, HM + bh, b1], [x0 + 0.02, HM + bh, b1]])}" fill="${C.blanketLit}"/>`);
      o.push(`<path d="${q([[x0 + 0.02, HM + bh * 0.45, b0 - 0.001], [x0 + 0.02, HM + bh * 0.62, b0 - 0.001], [x1 - 0.02, HM + bh * 0.62, b0 - 0.001], [x1 - 0.02, HM + bh * 0.45, b0 - 0.001]])}" fill="${C.stripe}"/>`);
    } else {
      o.push(`<path d="${q([[x0 + 0.08, HM, z0 + 0.12], [x0 + 0.08, HM + 0.1, z0 + 0.12], [x0 + 0.42, HM + 0.1, z0 + 0.12], [x0 + 0.42, HM, z0 + 0.12]])}" fill="#5e584e"/>`);
      o.push(`<path d="${q([[x0 + 0.08, HM + 0.1, z0 + 0.12], [x0 + 0.42, HM + 0.1, z0 + 0.12], [x0 + 0.42, HM + 0.1, z1 - 0.08], [x0 + 0.08, HM + 0.1, z1 - 0.08]])}" fill="#5e584c"/>`);
      const b0 = x1 - 0.55, b1 = x1 - 0.06, bh = 0.13;
      o.push(`<path d="${q([[b0, HM, z0 + 0.04], [b0, HM + bh, z0 + 0.04], [b1, HM + bh, z0 + 0.04], [b1, HM, z0 + 0.04]])}" fill="${C.blanket}"/>`);
      o.push(`<path d="${q([[b1, HM, z0 + 0.04], [b1, HM + bh, z0 + 0.04], [b1, HM + bh, z1 - 0.04], [b1, HM, z1 - 0.04]])}" fill="${C.blanketDark}"/>`);
      o.push(`<path d="${q([[b0, HM + bh, z0 + 0.04], [b1, HM + bh, z0 + 0.04], [b1, HM + bh, z1 - 0.04], [b0, HM + bh, z1 - 0.04]])}" fill="${C.blanketLit}"/>`);
      o.push(`<path d="${q([[b0, HM + bh * 0.45, z0 + 0.039], [b0, HM + bh * 0.62, z0 + 0.039], [b1, HM + bh * 0.62, z0 + 0.039], [b1, HM + bh * 0.45, z0 + 0.039]])}" fill="${C.stripe}"/>`);
    }
    return o.join('');
  };
  S.add(bed(-2.5, -0.85, 4.82, 5.54, 'x'));
  // a small shelf on the right wall above the right bed: a few books and a brass eyepiece
  {
    const o = [], x = XR - 0.004, y = 1.58, z0 = 3.0, z1 = 4.1;
    o.push(`<path d="${q([[x, y, z0], [x - 0.22, y, z0], [x - 0.22, y, z1], [x, y, z1]])}" fill="${C.woodLit}"/><path d="${q([[x - 0.22, y - 0.05, z0], [x - 0.22, y, z0], [x, y, z0], [x, y - 0.05, z0]])}" fill="${C.woodDark}"/>`);
    let bk = '';
    const cols = ['#5a2e2a', '#2e3e4a', '#4a4030', '#3a2a3e', '#5a4a2a'];
    let zz = z0 + 0.12;
    for (let i = 0; i < 5; i++) {
      const th = 0.07 + (i % 3) * 0.025, hh = 0.24 + (i % 2) * 0.06;
      bk += `<path d="${q([[x - 0.02, y, zz], [x - 0.02, y + hh, zz], [x - 0.02, y + hh, zz + th], [x - 0.02, y, zz + th]])}" fill="${cols[i]}"/>`;
      zz += th + 0.01;
    }
    // one leaning book
    bk += `<path d="${q([[x - 0.02, y, zz + 0.02], [x - 0.02, y + 0.26, zz + 0.12], [x - 0.02, y + 0.26, zz + 0.2], [x - 0.02, y, zz + 0.1]])}" fill="#4a3a2a"/>`;
    const ey = pr(x - 0.1, y + 0.05, z1 - 0.25), ek = F / (z1 - 0.25);
    bk += `<rect x="${r0(ey[0] - 0.035 * ek)}" y="${r0(ey[1] - 0.16 * ek)}" width="${r0(0.07 * ek)}" height="${r0(0.16 * ek)}" rx="2" fill="${C.metalHi}"/>`;
    o.push(bk);
    S.add(o.join(''));
  }
  S.add(bed(1.82, 2.56, 2.7, 4.42, 'z'));
  S.add(bed(-2.56, -1.82, 2.9, 4.62, 'z'));

  // ---- the table with the oil lamp, a stool ---------------------------------------------------------------------------
  {
    const t0 = -0.58, t1 = 0.38, z0 = 3.18, z1 = 3.9, TH = 0.74, o = [];
    o.push(`<ellipse cx="${r0(pr(-0.1, 0, 3.55)[0])}" cy="${r0(pr(-0.1, 0, 3.55)[1])}" rx="150" ry="26" fill="#050305" opacity=".6" filter="${S.blur(2)}"/>`);
    let lg = '';
    for (const [x, z] of [[t0 + 0.06, z0 + 0.06], [t1 - 0.06, z0 + 0.06], [t0 + 0.06, z1 - 0.06], [t1 - 0.06, z1 - 0.06]]) lg += q([[x - 0.025, 0, z], [x - 0.025, TH, z], [x + 0.025, TH, z], [x + 0.025, 0, z]]);
    o.push(`<path d="${lg}" fill="${C.woodDark}"/>`);
    o.push(`<path d="${q([[t0, TH - 0.06, z0], [t0, TH, z0], [t1, TH, z0], [t1, TH - 0.06, z0]])}" fill="${C.wood}"/>`);
    o.push(`<path d="${q([[t0, TH, z0], [t1, TH, z0], [t1, TH, z1], [t0, TH, z1]])}" fill="${S.rad([[0, '#a07850'], [0.6, C.woodLit], [1, C.wood]], `gradientUnits="userSpaceOnUse" cx="${r0(L[0])}" cy="${r0(pr(lamp.X, TH, lamp.Z)[1])}" r="160"`)}"/>`);
    // a tin cup and a box of matches
    const cp = pr(0.18, TH, 3.32), ck = F / 3.32;
    o.push(`<path d="M${r0(cp[0] - 0.045 * ck)},${r0(cp[1] - 0.1 * ck)}L${r0(cp[0] - 0.04 * ck)},${r0(cp[1])}H${r0(cp[0] + 0.04 * ck)}L${r0(cp[0] + 0.045 * ck)},${r0(cp[1] - 0.1 * ck)}Z" fill="#6a6a70"/><ellipse cx="${r0(cp[0])}" cy="${r0(cp[1] - 0.1 * ck)}" rx="${r0(0.045 * ck)}" ry="${r0(0.012 * ck)}" fill="#a49a90"/>`);
    o.push(`<path d="${q([[-0.45, TH + 0.002, 3.3], [-0.3, TH + 0.002, 3.3], [-0.3, TH + 0.002, 3.4], [-0.45, TH + 0.002, 3.4]])}" fill="#8a3a2a"/>`);
    // the oil lamp: brass foot, glass font, chimney, flame
    const fb = pr(lamp.X, TH, lamp.Z), k = F / lamp.Z;
    const X = fb[0], Y = fb[1];
    o.push(`<path d="M${r0(X - 0.075 * k)},${r0(Y)}L${r0(X - 0.04 * k)},${r0(Y - 0.03 * k)}H${r0(X + 0.04 * k)}L${r0(X + 0.075 * k)},${r0(Y)}Z" fill="#b88a48"/>`);
    o.push(`<ellipse cx="${r0(X)}" cy="${r0(Y - 0.075 * k)}" rx="${r0(0.065 * k)}" ry="${r0(0.05 * k)}" fill="#c89a58" opacity=".85"/><ellipse cx="${r0(X)}" cy="${r0(Y - 0.06 * k)}" rx="${r0(0.05 * k)}" ry="${r0(0.025 * k)}" fill="#8a5a24" opacity=".7"/>`);
    o.push(`<rect x="${r0(X - 0.03 * k)}" y="${r0(Y - 0.135 * k)}" width="${r0(0.06 * k)}" height="${r0(0.02 * k)}" fill="#b88a48"/>`);
    o.push(`<path d="M${r0(X - 0.035 * k)},${r0(Y - 0.13 * k)}C${r0(X - 0.06 * k)},${r0(Y - 0.2 * k)} ${r0(X - 0.025 * k)},${r0(Y - 0.27 * k)} ${r0(X - 0.025 * k)},${r0(Y - 0.34 * k)}H${r0(X + 0.025 * k)}C${r0(X + 0.025 * k)},${r0(Y - 0.27 * k)} ${r0(X + 0.06 * k)},${r0(Y - 0.2 * k)} ${r0(X + 0.035 * k)},${r0(Y - 0.13 * k)}Z" fill="#fff0d0" opacity=".28" stroke="#ffe4b0" stroke-width="1"/>`);
    o.push(`<path d="M${r0(X)},${r0(Y - 0.27 * k)}C${r0(X - 0.02 * k)},${r0(Y - 0.22 * k)} ${r0(X - 0.016 * k)},${r0(Y - 0.17 * k)} ${r0(X)},${r0(Y - 0.165 * k)}C${r0(X + 0.016 * k)},${r0(Y - 0.17 * k)} ${r0(X + 0.02 * k)},${r0(Y - 0.22 * k)} ${r0(X)},${r0(Y - 0.27 * k)}Z" fill="${C.flame}"/>`);
    S.add(o.join(''));
    // stool in front of the table
    const s0 = 0.55, s1 = 0.85, sz0 = 2.75, sz1 = 3.05, SH = 0.46, so = [];
    so.push(`<ellipse cx="${r0(pr(0.7, 0, 2.9)[0])}" cy="${r0(pr(0.7, 0, 2.9)[1])}" rx="64" ry="14" fill="#050305" opacity=".55" filter="${S.blur(2)}"/>`);
    let sl = '';
    for (const [x, z] of [[s0 + 0.03, sz0 + 0.03], [s1 - 0.03, sz0 + 0.03], [s1 - 0.03, sz1 - 0.03]]) sl += pl(pr.poly([[x, 0, z], [x, SH, z]]));
    so.push(`<path d="${sl}" stroke="${C.woodDark}" stroke-width="7"/>`);
    so.push(`<path d="${q([[s0, SH - 0.05, sz0], [s0, SH, sz0], [s1, SH, sz0], [s1, SH - 0.05, sz0]])}" fill="${C.wood}"/><path d="${q([[s0, SH, sz0], [s1, SH, sz0], [s1, SH, sz1], [s0, SH, sz1]])}" fill="${C.woodLit}"/>`);
    S.add(so.join(''));
  }

  // ---- lamplight: a warm pool around the flame, a hot halo, then the vignette --------------------------------------------
  S.add(`<circle cx="${r0(L[0])}" cy="${r0(L[1])}" r="720" fill="${S.rad([[0, '#ffb45a', 0.42], [0.35, '#e8903c', 0.16], [1, '#e8903c', 0]])}"/>`);
  S.add(`<circle cx="${r0(L[0])}" cy="${r0(L[1])}" r="70" fill="${C.gold}" opacity=".35" filter="${S.blur(3)}"/>`);
  S.add(`<circle cx="${r0(L[0])}" cy="${r0(L[1])}" r="16" fill="${C.flame}" opacity=".7" filter="${S.blur(2)}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#06040a', 0], [0.5, '#06040a', 0.12], [0.82, '#06040a', 0.6], [1, '#06040a', 0.88]], `gradientUnits="userSpaceOnUse" cx="${r0(L[0])}" cy="${r0(L[1] - 20)}" r="980"`)}"/>`);
  // cool shadow in the corners
  S.add(`<rect width="${W}" height="300" fill="${S.lin([[0, '#0a0814', 0.55], [1, '#0a0814', 0]])}"/>`);
  return S.out();
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// 月蚀完成·虚空：月亮被蚀尽，只剩一圈暗红的月环悬在无边的黑里；碎片与微尘缓缓漂浮，透明穹顶的骨架几乎看不见，
// 底下透上来一点黎明种的白光。
// ─────────────────────────────────────────────────────────────────────────────────────────────
function eclipseVoid() {
  const S = new Scene('sbGdEclVoid', '月蚀完成·虚空：月亮被完全蚀尽，只剩一圈暗红的月环悬在无边的黑里，四周没有一颗星；碎片和微尘在黑暗里缓缓漂浮，有些碎片里透着一点暖色的光，透明穹顶的细骨架几乎看不见，最底下透上来一点白光；没有人', 11202);
  const R = S.R;
  const cx = 800, cy = 318, MR = 150;
  S.add(`<rect width="${W}" height="${H}" fill="#030205"/>`);
  // a breath of deep crimson around the ring, fading into the black
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#2c0a14', 0.9], [0.35, '#160610', 0.6], [1, '#030205', 0]], `gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="820"`)}"/>`);
  // the seed's white light rising from below, faint
  S.add(`<ellipse cx="800" cy="${H + 70}" rx="760" ry="250" fill="${S.rad([[0, '#f2e6c8', 0.26], [0.5, '#c8b8a0', 0.08], [1, '#c8b8a0', 0]])}"/>`);

  // ---- the ghost of the transparent dome: ribs converging above the frame ------------------------------------------------
  {
    let d = '';
    const ax = 800, ay = -520;
    for (let i = -4; i <= 4; i++) {
      const bx = 800 + i * 330;
      const mx = (ax + bx) / 2 + i * 60, my = 260;
      d += `M${ax},${ay}Q${r0(mx)},${my} ${r0(bx)},${H + 40}`;
    }
    S.add(`<path d="${d}" fill="none" stroke="#5a4a5e" stroke-width="1.4" opacity=".12"/>`);
    S.add(`<path d="M-40,610Q800,470 1640,610M-40,780Q800,640 1640,780" fill="none" stroke="#5a4a5e" stroke-width="1.2" opacity=".09"/>`);
  }

  // ---- far dust, drifting slowly -------------------------------------------------------------------------------------------
  {
    let s = '';
    for (let i = 0; i < 150; i++) {
      const a = R.range(0, Math.PI * 2), d = MR * 1.15 + Math.pow(R(), 1.6) * 760;
      const x = cx + Math.cos(a) * d * 1.25, y = cy + Math.sin(a) * d * 0.85;
      if (x < -5 || x > W + 5 || y < -5 || y > H + 5) continue;
      s += `<circle cx="${r0(x)}" cy="${r0(y)}" r="${f(R.range(0.5, 1.6), 1)}" opacity="${f(R.range(0.12, 0.55), 2)}"/>`;
    }
    S.add(`<g fill="#d89aa2">${s}</g>`);
  }

  // ---- the eclipsed moon: corona, streamers, the dark disc, a thin blood-red rim -------------------------------------------
  {
    const o = [];
    o.push(`<circle cx="${cx}" cy="${cy}" r="${MR * 2.4}" fill="${S.rad([[0, '#000000', 0], [0.4, '#000000', 0], [0.43, '#962234', 0.42], [0.55, '#5a1020', 0.22], [0.75, '#3a0a16', 0.1], [1, '#3a0a16', 0]], `gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${MR * 2.4}"`)}"/>`);
    // corona streamers: thin tapering petals
    let st = '';
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + R.range(-0.12, 0.12);
      const len = MR * R.range(0.35, i % 4 === 0 ? 1.15 : 0.7), w = R.range(0.035, 0.07);
      const p0 = [cx + Math.cos(a - w) * MR, cy + Math.sin(a - w) * MR], p1 = [cx + Math.cos(a + w) * MR, cy + Math.sin(a + w) * MR];
      const tip = [cx + Math.cos(a + R.range(-0.04, 0.04)) * (MR + len), cy + Math.sin(a) * (MR + len)];
      st += `M${r0(p0[0])},${r0(p0[1])}Q${r0((p0[0] + tip[0]) / 2)},${r0((p0[1] + tip[1]) / 2)} ${r0(tip[0])},${r0(tip[1])}Q${r0((p1[0] + tip[0]) / 2)},${r0((p1[1] + tip[1]) / 2)} ${r0(p1[0])},${r0(p1[1])}Z`;
    }
    o.push(`<path d="${st}" fill="#86202e" opacity=".2" filter="${S.blur(1)}"/>`);
    o.push(`<circle cx="${cx}" cy="${cy}" r="${MR + 22}" fill="none" stroke="#7a1626" stroke-width="40" opacity=".35" filter="${S.blur(3)}"/>`);
    // the disc, a touch blacker than the sky
    o.push(`<circle cx="${cx}" cy="${cy}" r="${MR}" fill="${S.rad([[0, '#0a0408'], [0.85, '#050206'], [1, '#12060a']], `gradientUnits="userSpaceOnUse" cx="${cx - 20}" cy="${cy - 26}" r="${MR}"`)}"/>`);
    // the ring itself: dark red, brightening toward the lower left
    o.push(`<circle cx="${cx}" cy="${cy}" r="${MR}" fill="none" stroke="${S.lin([[0, '#360812'], [0.55, '#6a1422'], [1, '#a62a3a']], `gradientUnits="userSpaceOnUse" x1="${cx + MR}" y1="${cy - MR}" x2="${cx - MR}" y2="${cy + MR}"`)}" stroke-width="7"/>`);
    const arc = (a0, a1, r) => `M${r0(cx + Math.cos(a0) * r)},${r0(cy + Math.sin(a0) * r)}A${r},${r} 0 0 1 ${r0(cx + Math.cos(a1) * r)},${r0(cy + Math.sin(a1) * r)}`;
    o.push(`<path d="${arc(Math.PI * 0.55, Math.PI * 1.05, MR + 3)}" fill="none" stroke="#e0606a" stroke-width="2" opacity=".55" stroke-linecap="round"/>`);
    o.push(`<path d="${arc(Math.PI * 0.62, Math.PI * 0.92, MR + 6)}" fill="none" stroke="#e8908a" stroke-width="3" opacity=".22" stroke-linecap="round" filter="${S.blur(1)}"/>`);
    // small prominences licking off the rim
    let pm = '';
    for (const a of [0.7, 1.32, 1.9, 0.18]) {
      const t = a * Math.PI, h = R.range(7, 14), w = 0.05;
      const b0 = [cx + Math.cos(t - w) * MR, cy + Math.sin(t - w) * MR], b1 = [cx + Math.cos(t + w) * MR, cy + Math.sin(t + w) * MR];
      const tp = [cx + Math.cos(t + 0.02) * (MR + h), cy + Math.sin(t + 0.02) * (MR + h)];
      pm += `M${r0(b0[0])},${r0(b0[1])}Q${r0(tp[0])},${r0(tp[1])} ${r0(b1[0])},${r0(b1[1])}Z`;
    }
    o.push(`<path d="${pm}" fill="#a82834" opacity=".7"/>`);
    S.add(o.join(''));
  }

  // ---- floating fragments: dark shards rim-lit by the ring, a few holding a warm glint of eaten memory -------------------
  {
    const shard = (x, y, s, rot) => {
      const n = R() < 0.4 ? 3 : 4, pts = [];
      for (let i = 0; i < n; i++) {
        const a = rot + (i / n) * Math.PI * 2 + R.range(-0.4, 0.4), rr = s * R.range(0.55, 1.15) * (i % 2 ? 0.55 : 1);
        pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
      }
      return pts;
    };
    const far = [], near = [];
    for (let i = 0; i < 46; i++) {
      let x, y, tries = 0;
      do { x = R.range(30, W - 30); y = R.range(30, H - 30); tries++; } while (Math.hypot(x - cx, (y - cy) * 1.1) < MR * 1.35 && tries < 20);
      const depth = R();
      const s = 5 + depth * depth * 42;
      (depth > 0.86 ? near : far).push({ x, y, s, rot: R.range(0, Math.PI * 2), depth, warm: R() < 0.22 });
    }
    const draw = (list, blurred) => {
      let body = '', rim = '', warm = '', trails = '';
      for (const p of list) {
        const pts = shard(p.x, p.y, p.s, p.rot);
        body += pz(pts);
        // the edge that faces the ring catches its red light
        const dir = Math.atan2(cy - p.y, cx - p.x);
        let best = 0, bestDot = -Infinity;
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i], b = pts[(i + 1) % pts.length];
          const mx = (a[0] + b[0]) / 2 - p.x, my = (a[1] + b[1]) / 2 - p.y;
          const dot = (mx * Math.cos(dir) + my * Math.sin(dir)) / (Math.hypot(mx, my) || 1);
          if (dot > bestDot) { bestDot = dot; best = i; }
        }
        rim += pl([pts[best], pts[(best + 1) % pts.length]]);
        if (p.warm) {
          const inner = pts.map(([x, y]) => [p.x + (x - p.x) * 0.5, p.y + (y - p.y) * 0.5]);
          warm += pz(inner);
        }
        if (!blurred && p.depth > 0.35 && R() < 0.35) {
          const len = p.s * R.range(1.4, 2.6), a = dir + Math.PI + R.range(-0.5, 0.5);
          trails += `M${r0(p.x)},${r0(p.y)}l${r0(Math.cos(a) * len)},${r0(Math.sin(a) * len)}`;
        }
      }
      const fl = blurred ? ` filter="${S.blur(2)}"` : '';
      let s = '';
      if (trails) s += `<path d="${trails}" stroke="#7a2a3a" stroke-width="1.2" opacity=".14" stroke-linecap="round"/>`;
      s += `<path d="${body}" fill="${blurred ? '#1e1018' : '#1c0f16'}"${fl}/>`;
      if (warm) s += `<path d="${warm}" fill="#d89a62" opacity="${blurred ? 0.16 : 0.24}"${fl}/>`;
      s += `<path d="${rim}" fill="none" stroke="#e05462" stroke-width="${blurred ? 3 : 1.5}" opacity="${blurred ? 0.55 : 0.75}" stroke-linecap="round"${fl}/>`;
      return s;
    };
    S.add(draw(far, false));
    // a few fragments drifting close in front, out of focus
    S.add(draw(near, true));
    // two larger ones near the corners frame the void
    const big = [[150, 760, 62, 0.4], [1470, 140, 48, 2.1]].map(([x, y, s, rot]) => ({ x, y, s, rot, depth: 1, warm: x < 800 }));
    S.add(draw(big, true));
  }

  // ---- vignette ------------------------------------------------------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000000', 0], [0.55, '#000000', 0.1], [1, '#000000', 0.8]], `gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy + 80}" r="1000"`)}"/>`);
  return S.out();
}

export const gaidenFBgs = {
  'nox-observatory-restroom': restroom,
  'nox-observatory-eclipse-void': eclipseVoid,
};
