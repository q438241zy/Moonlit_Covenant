// 雾港·桥头旅店 (chapter 10): the upstairs corridor of the bridgehead inn at night.
//   fog-harbor-bridge-inn-night — a wooden corridor with the lamps turned low: at its end an uncovered mirror; on the
//                                 left a door standing half open on a room, the small mirror over its washbasin seen
//                                 through the gap; on the right the railing over the stairwell, the stair turning at a
//                                 landing with a third mirror on the wall above it; a window near us onto the channel
//                                 (flat dark water, no reflections). Every mirror is blank — only a dull dark sheen.
//   fog-harbor-bridge-inn-eyes  — the same picture (same generator, same geometry), used only for the last shot of 10-12:
//                                 in every mirror the same pair of purple eyes is open — the eyes alone, no face, no
//                                 hair, no figure, one identical overlay per mirror.
// No figures, no reflections of anything in the mirrors or the water (script 10 美術需求).
import { Scene, W, H, f, pz, pl, persp } from './lib.mjs';

const r0 = (v) => f(v, 0);

const INN = {
  plaster: '#40372f', plasterShade: '#2c2520', wain: '#4a3426', wainLit: '#6a4c36', wainDark: '#2a1c14',
  floor: [[0, '#3e2e22'], [1, '#120c0a']], board: '#1a120c', ceil: '#1c140e', beam: '#2e2218',
  door: '#5a3e2c', doorLit: '#7a563c', doorDark: '#2e2016', frame: '#3a281c', brass: '#c8a060',
  glass: [[0, '#2e3440'], [0.55, '#1a1e28'], [1, '#12141a']], sheen: '#5a6476', mirrorFrame: '#4a3020', mirrorFrameLit: '#7a5434',
  lamp: '#ffc878', night: [[0, '#080c1c'], [0.6, '#121a30'], [1, '#1a2238']], roofs: '#05070e', water: '#0e1422', waterHi: '#2e3a52',
  moon: '#9aaad0', eyeGlow: '#b58cff', iris: '#a274f2', irisDark: '#5a2ea8', sclera: '#ebe2ff', pupil: '#160c2a',
};

// variant: 'night' | 'eyes' (chapter 10) | 'covered' | 'mirror' (chapter 11)
const CORRIDOR = {
  night: ['sbInnNight', '雾港·桥头旅店·入夜：灯调得很暗的木造旅店走廊，尽头一面没盖布的镜子，左边半开的门里看得见脸盆上方的小镜子，右边栏杆外的楼梯在转角平台上拐弯、墙上也挂着镜子，近处的窗外是夜里的水道；镜面空白，只有暗色的反光'],
  covered: ['sbInnCovered', '雾港·桥头旅店·镜子蒙上毛巾：同一条入夜的旅店走廊，走廊尽头的镜子、楼梯转角的镜子、半开的门里脸盆上方的小镜子都蒙着毛巾；走廊上一把木椅转过来，面对尽头那面蒙着毛巾的镜子；没有人'],
  mirror: ['sbInnMirror', '雾港·桥头旅店·镜子的那一边：同一条旅店走廊左右反过来，楼梯在另一边；两侧七扇门都开着，门框上没有号码，门里是平涂的暗，什么也没有；七根贴着地板的细黑线收进走廊尽头的镜子，镜子那头更黑；整体褪色、冷调，没有人'],
};
function innCorridor(variant) {
  const eyes = variant === 'eyes', covered = variant === 'covered', mirror = variant === 'mirror';
  const S = new Scene(eyes ? 'sbInnEyes' : CORRIDOR[variant][0], eyes
    ? '雾港·桥头旅店·镜中紫眼：同一条入夜的旅店走廊——走廊尽头的镜子、楼梯转角的镜子、半开的门里脸盆上方的小镜子，每一面镜子里同时睁开同一双紫色的眼睛；只有眼睛，没有脸、没有头发、没有人形'
    : CORRIDOR[variant][1], 7301);
  const VP = [800, 390], F = 700, EYE = 1.55;
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const XL = -1.05, XR = 1.05, YC = 2.7, Z0 = 0.9, ZE = 6.8, WN = 0.95; // corridor walls, ceiling, near / end, wainscot
  // the mirror side: the glass is darker, with almost no sheen (the whole picture is faded and cooled at the end)
  const P = mirror ? { ...INN, glass: [[0, '#14161e'], [0.55, '#0a0b10'], [1, '#050508']], sheen: '#3a4050' } : INN;
  const mirrors = []; // glass quads (screen TL, TR, BR, BL) for the eyes overlay

  // glass with a dull dark sheen and no image in it; pts = screen [TL, TR, BR, BL]
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const glass = (pts) => {
    const [tl, tr, br, bl] = pts;
    const band = [lerp(tl, tr, 0.28), lerp(tl, tr, 0.46), lerp(bl, br, 0.24), lerp(bl, br, 0.06)];
    const band2 = [lerp(tl, tr, 0.54), lerp(tl, tr, 0.6), lerp(bl, br, 0.36), lerp(bl, br, 0.3)];
    mirrors.push(pts);
    return `<path d="${pz(pts)}" fill="${S.lin(P.glass, 'x1="0" y1="0" x2=".4" y2="1"')}"/><path d="${pz([band[0], band[1], band[3], band[2]])}" fill="${P.sheen}" opacity=".22"/><path d="${pz([band2[0], band2[1], band2[3], band2[2]])}" fill="${P.sheen}" opacity=".12"/>`;
  };

  // a towel hung over a mirror: thrown over the top of the frame, hanging a little below the glass, a wavy hem
  const towel = (pts) => {
    const [tl, tr, br, bl] = pts;
    const wv = Math.hypot(tr[0] - tl[0], tr[1] - tl[1]), hv = Math.hypot(bl[0] - tl[0], bl[1] - tl[1]);
    const o = (pt, du, dv) => [pt[0] + (tr[0] - tl[0]) / wv * du + (bl[0] - tl[0]) / hv * dv, pt[1] + (tr[1] - tl[1]) / wv * du + (bl[1] - tl[1]) / hv * dv];
    const e = wv * 0.1, top = hv * 0.08, drop = hv * 0.12;
    const T0 = o(tl, -e, -top), T1 = o(tr, e, -top), B1 = o(br, e * 0.6, drop), B0 = o(bl, -e * 0.6, drop);
    const hem = [];
    for (let i = 0; i <= 6; i++) { const t = i / 6, b = lerp(B1, B0, t); hem.push([b[0], b[1] + (i % 2 ? -hv * 0.035 : hv * 0.02)]); }
    const cloth = [T0, T1, ...hem];
    const fold = [lerp(T0, T1, 0.5), lerp(T0, T1, 0.55), lerp(B1, B0, 0.42), lerp(B1, B0, 0.6)];
    const lip = [T0, T1, o(tr, e * 0.9, top * 0.6), o(tl, -e * 0.9, top * 0.6)];
    return `<path d="${pz(cloth)}" fill="${S.lin([[0, '#8e8676'], [1, '#585246']], 'x1="0" y1="0" x2=".3" y2="1"')}" stroke="#2a241c" stroke-width="1.5"/>`
      + `<path d="${pz(fold)}" fill="#4e483e" opacity=".45"/><path d="${pz(lip)}" fill="#a8a090" opacity=".7"/>`
      + `<path d="${pl([lerp(T0, T1, 0.18), lerp(B1, B0, 0.86)])}" stroke="#4e483e" stroke-width="1.5" opacity=".5"/>`;
  };

  S.add(`<rect width="${W}" height="${H}" fill="#0c0908"/>`);

  // ---- the stair hall beyond the railing on the right (drawn first: it lies behind the corridor's right edge) -----
  // The stair climbs along the hall's back wall, seen side-on (its sawtooth profile toward us), to a landing in the
  // corner by the corridor's end wall, where it turns up out of sight; the stair-corner mirror hangs above the landing.
  const SX = 3.6, SZ0 = mirror ? 3.35 : 2.2, SY = 4.4; // the mirror side keeps more wall on the stair side for its doors
  {
    const o = [];
    o.push(`<path d="${q([[XR, 0, ZE], [XR, SY, ZE], [SX, SY, ZE], [SX, 0, ZE]])}" fill="${P.plasterShade}"/>`);
    o.push(`<path d="${q([[SX, 0, SZ0], [SX, SY, SZ0], [SX, SY, ZE], [SX, 0, ZE]])}" fill="${S.lin([[0, '#241c18'], [1, P.plasterShade]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    o.push(`<path d="${q([[XR, 0, ZE], [XR, WN, ZE], [SX, WN, ZE], [SX, 0, ZE]])}" fill="${P.wainDark}"/>`);
    o.push(`<path d="${q([[XR, SY, SZ0], [SX, SY, SZ0], [SX, SY, ZE], [XR, SY, ZE]])}" fill="#100a07"/>`);
    o.push(`<path d="${q([[XR, 0, SZ0], [SX, 0, SZ0], [SX, 0, ZE], [XR, 0, ZE]])}" fill="#1e150e"/>`);
    // the stair-corner mirror on the back wall above the landing
    const m0 = 1.14, m1 = 1.66, my0 = 1.86, my1 = 2.64;
    o.push(`<path d="${q([[m0 - 0.06, my0 - 0.06, ZE - 0.01], [m1 + 0.06, my0 - 0.06, ZE - 0.01], [m1 + 0.06, my1 + 0.06, ZE - 0.01], [m0 - 0.06, my1 + 0.06, ZE - 0.01]])}" fill="${P.mirrorFrame}"/>`);
    o.push(glass([pr(m0, my1, ZE - 0.02), pr(m1, my1, ZE - 0.02), pr(m1, my0, ZE - 0.02), pr(m0, my0, ZE - 0.02)]));
    if (covered) o.push(towel([pr(m0, my1, ZE - 0.03), pr(m1, my1, ZE - 0.03), pr(m1, my0, ZE - 0.03), pr(m0, my0, ZE - 0.03)]));
    // the flight: eight steps rising right to left against the back wall, then the landing in the corner
    const n = 8, xb = 3.35, run = 0.24, rise = 0.18, z0 = 5.85, z1 = ZE - 0.02, xt = xb - n * run, LY = n * rise;
    const prof = [[xb, 0]];
    for (let i = 0; i < n; i++) { const xa = xb - i * run, y = (i + 1) * rise; prof.push([xa, y], [xa - run, y]); }
    prof.push([XR + 0.02, LY], [XR + 0.02, 0]);
    o.push(`<path d="${pz(prof.map(([x, y]) => pr(x, y, z0)))}" fill="#3a2a1e"/>`);
    let tr = '', no = '';
    for (let i = 0; i < n; i++) { const xa = xb - i * run, y = (i + 1) * rise; tr += q([[xa, y, z0], [xa - run, y, z0], [xa - run, y, z1], [xa, y, z1]]); no += pl(pr.poly([[xa, y, z0], [xa - run, y, z0]])); }
    tr += q([[xt, LY, z0], [XR + 0.02, LY, z0], [XR + 0.02, LY, z1], [xt, LY, z1]]);
    o.push(`<path d="${tr}" fill="#5e4632"/><path d="${no}" stroke="#806046" stroke-width="2" opacity=".75"/>`);
    // the handrail up the flight and along the landing, a few balusters
    // (the rail stops at a newel on the top step, so nothing crosses the mirror above the landing)
    let hr = pl([pr(xb + 0.05, 0.92, z0 - 0.03), pr(xt + run * 0.5, LY - rise * 0.5 + 0.92, z0 - 0.03)]);
    for (let i = 0; i < n; i += 2) { const x = xb - i * run, y = i * rise; hr += pl([pr(x, y, z0 - 0.03), pr(x, y + 0.92, z0 - 0.03)]); }
    hr += pl([pr(xt + run * 0.5, LY - rise * 0.5 + 0.18, z0 - 0.03), pr(xt + run * 0.5, LY - rise * 0.5 + 1.0, z0 - 0.03)]);
    o.push(`<path d="${hr}" fill="none" stroke="#2a1c12" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`);
    S.add(o.join(''));
  }

  // ---- the corridor: end wall, ceiling and beams, walls, floor -------------------------------------------------
  {
    const o = [];
    o.push(`<path d="${q([[XL, WN, ZE], [XL, YC, ZE], [XR, YC, ZE], [XR, WN, ZE]])}" fill="${P.plaster}"/><path d="${q([[XL, 0, ZE], [XL, WN, ZE], [XR, WN, ZE], [XR, 0, ZE]])}" fill="${P.wain}"/>`);
    o.push(`<path d="${q([[XL, YC, Z0], [XR, YC, Z0], [XR, YC, ZE], [XL, YC, ZE]])}" fill="${P.ceil}"/>`);
    let bm = '';
    for (const z of [1.5, 2.6, 3.7, 4.8, 5.9]) bm += q([[XL, YC, z], [XR, YC, z], [XR, YC - 0.12, z], [XL, YC - 0.12, z]]);
    o.push(`<path d="${bm}" fill="${P.beam}"/>`);
    // left wall
    o.push(`<path d="${q([[XL, WN, Z0], [XL, YC, Z0], [XL, YC, ZE], [XL, WN, ZE]])}" fill="${S.lin([[0, P.plasterShade], [1, P.plaster]], 'x1="0" y1="0" x2="1" y2="0"')}"/><path d="${q([[XL, 0, Z0], [XL, WN, Z0], [XL, WN, ZE], [XL, 0, ZE]])}" fill="${S.lin([[0, P.wainDark], [1, P.wain]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    // right wall (near part only; beyond it is the railing over the stairwell)
    o.push(`<path d="${q([[XR, WN, Z0], [XR, YC, Z0], [XR, YC, SZ0], [XR, WN, SZ0]])}" fill="${S.lin([[0, P.plaster], [1, P.plasterShade]], 'x1="0" y1="0" x2="1" y2="0"')}"/><path d="${q([[XR, 0, Z0], [XR, WN, Z0], [XR, WN, SZ0], [XR, 0, SZ0]])}" fill="${S.lin([[0, P.wain], [1, P.wainDark]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    // wainscot caps and panel lines
    let cap = pl(pr.poly([[XL, WN, Z0], [XL, WN, ZE], [XR, WN, ZE]])) + pl(pr.poly([[XR, WN, Z0], [XR, WN, SZ0]]));
    o.push(`<path d="${cap}" fill="none" stroke="${P.wainLit}" stroke-width="3"/>`);
    let pn = '';
    for (let z = 1.2; z < ZE; z += 0.6) pn += pl(pr.poly([[XL, 0.08, z], [XL, WN - 0.08, z]]));
    for (let z = 1.2; z < SZ0; z += 0.6) pn += pl(pr.poly([[XR, 0.08, z], [XR, WN - 0.08, z]]));
    for (const x of [-0.6, -0.15, 0.3, 0.75]) pn += pl(pr.poly([[x, 0.08, ZE], [x, WN - 0.08, ZE]]));
    o.push(`<path d="${pn}" stroke="${P.wainDark}" stroke-width="1.5" opacity=".7"/>`);
    // floor boards
    o.push(`<path d="${q([[XL, 0, 0.6], [XR, 0, 0.6], [XR, 0, ZE], [XL, 0, ZE]])}" fill="${S.lin(P.floor, `gradientUnits="userSpaceOnUse" x1="0" y1="${VP[1]}" x2="0" y2="${H}"`)}"/>`);
    let bd = '';
    for (let x = XL + 0.15; x < XR; x += 0.15) bd += pl(pr.poly([[x, 0, 0.6], [x, 0, ZE]]));
    for (const [x0, x1, z] of [[XL, -0.45, 2.2], [-0.15, 0.45, 3.4], [0.3, XR, 1.7], [XL, -0.3, 4.6], [0, 0.6, 5.5]]) bd += pl(pr.poly([[x0, 0, z], [x1, 0, z]]));
    o.push(`<path d="${bd}" stroke="${P.board}" stroke-width="1.4" opacity=".75"/>`);
    // a long runner down the middle
    o.push(`<path d="${q([[-0.45, 0.005, 0.6], [0.45, 0.005, 0.6], [0.45, 0.005, ZE - 0.3], [-0.45, 0.005, ZE - 0.3]])}" fill="#3a1e1c" opacity=".7"/><path d="${pl(pr.poly([[-0.38, 0.006, 0.6], [-0.38, 0.006, ZE - 0.3]])) + pl(pr.poly([[0.38, 0.006, 0.6], [0.38, 0.006, ZE - 0.3]]))}" stroke="#6a3a2a" stroke-width="2" opacity=".6"/>`);
    S.add(o.join(''));
  }

  // ---- the railing over the stairwell: header beam, newel posts, rail, balusters --------------------------------
  {
    const o = [];
    o.push(`<path d="${q([[XR, YC - 0.12, SZ0], [XR, YC, SZ0], [XR, YC, ZE], [XR, YC - 0.12, ZE]])}" fill="${P.beam}"/>`);
    o.push(`<path d="${q([[XR - 0.02, -0.05, SZ0], [XR + 0.12, -0.05, SZ0], [XR + 0.12, 0.02, ZE], [XR - 0.02, 0.02, ZE]])}" fill="${P.wainDark}"/>`);
    let bal = '';
    for (let z = SZ0 + 0.4; z < ZE - 0.1; z += 0.5) bal += pl(pr.poly([[XR + 0.05, 0, z], [XR + 0.05, 0.92, z]]));
    o.push(`<path d="${bal}" stroke="#2c1e14" stroke-width="5"/>`);
    o.push(`<path d="${pl(pr.poly([[XR + 0.05, 0.95, SZ0], [XR + 0.05, 0.95, ZE]]))}" stroke="${P.wainLit}" stroke-width="7" stroke-linecap="round"/><path d="${pl(pr.poly([[XR + 0.05, 0.98, SZ0], [XR + 0.05, 0.98, ZE]]))}" stroke="#8a6648" stroke-width="2" opacity=".7"/>`);
    const np = (z) => q([[XR - 0.04, 0, z], [XR + 0.14, 0, z], [XR + 0.14, 1.18, z], [XR - 0.04, 1.18, z]]);
    o.push(`<path d="${np(SZ0)}" fill="${P.door}"/><path d="${q([[XR - 0.07, 1.18, SZ0], [XR + 0.17, 1.18, SZ0], [XR + 0.12, 1.28, SZ0], [XR - 0.02, 1.28, SZ0]])}" fill="${P.doorLit}"/>`);
    S.add(o.join(''));
  }

  // ---- the half-open door on the left: the dim room beyond with the washstand and its small mirror --------------
  if (!mirror) {
    const D0 = 1.6, D1 = 2.6, DH = 2.05, RX = -3.2;
    const open = q([[XL, 0, D0], [XL, DH, D0], [XL, DH, D1], [XL, 0, D1]]);
    const clip = S.clip(open);
    const o = [];
    o.push(`<path d="${open}" fill="#0e0a08"/>`);
    // the room: its far wall (facing the door), floor, a faint grey of night from its own window
    o.push(`<path d="${q([[RX, 0, 3.5], [RX, 2.5, 3.5], [RX, 2.5, 10], [RX, 0, 10]])}" fill="${S.lin([[0, '#1e1a1e'], [1, '#2c2a34']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    o.push(`<path d="${q([[XL, 0, 1], [RX, 0, 1], [RX, 0, 10], [XL, 0, 10]])}" fill="#150f0c"/>`);
    // washstand, basin and jug, and the small mirror hung over it
    const w0 = 6.25, w1 = 7.15;
    o.push(`<path d="${q([[RX + 0.42, 0.78, w0], [RX + 0.42, 0.78, w1], [RX + 0.42, 0, w1], [RX + 0.42, 0, w0]])}" fill="#3a2a20"/><path d="${q([[RX, 0.78, w0], [RX + 0.42, 0.78, w0], [RX + 0.42, 0.78, w1], [RX, 0.78, w1]])}" fill="#5a4434"/>`);
    const bc = pr(RX + 0.22, 0.8, (w0 + w1) / 2), bk = F / ((w0 + w1) / 2);
    o.push(`<ellipse cx="${r0(bc[0])}" cy="${r0(bc[1])}" rx="${f(0.2 * bk, 1)}" ry="${f(0.05 * bk, 1)}" fill="#8a8e96"/><ellipse cx="${r0(bc[0])}" cy="${r0(bc[1] + 1)}" rx="${f(0.15 * bk, 1)}" ry="${f(0.033 * bk, 1)}" fill="#3a3e48"/>`);
    const jc = pr(RX + 0.18, 0.8, w1 - 0.12);
    o.push(`<path d="M${r0(jc[0] - 4)},${r0(jc[1])}v-12q4,-6 8,0v12z" fill="#6a6e78"/>`);
    const mz0 = 6.42, mz1 = 6.98, my0 = 1.18, my1 = 1.76;
    o.push(`<path d="${q([[RX + 0.01, my0 - 0.06, mz0 - 0.06], [RX + 0.01, my1 + 0.06, mz0 - 0.06], [RX + 0.01, my1 + 0.06, mz1 + 0.06], [RX + 0.01, my0 - 0.06, mz1 + 0.06]])}" fill="${P.mirrorFrame}"/>`);
    o.push(glass([pr(RX + 0.02, my1, mz0), pr(RX + 0.02, my1, mz1), pr(RX + 0.02, my0, mz1), pr(RX + 0.02, my0, mz0)]));
    if (covered) o.push(towel([pr(RX + 0.03, my1, mz0), pr(RX + 0.03, my1, mz1), pr(RX + 0.03, my0, mz1), pr(RX + 0.03, my0, mz0)]));
    // the door leaf, swung half open into the room on its near hinge
    const a = 50 * Math.PI / 180, lx = XL - 0.92 * Math.sin(a), lz = D0 + 0.92 * Math.cos(a);
    o.push(`<path d="${q([[XL, 0, D0], [XL, DH, D0], [lx, DH, lz], [lx, 0, lz]])}" fill="${P.doorDark}"/>`);
    o.push(`<path d="${q([[XL - 0.04, 0.2, D0 + 0.05], [XL - 0.04, 0.95, D0 + 0.05], [lx + 0.06, 0.95, lz - 0.06], [lx + 0.06, 0.2, lz - 0.06]])}" fill="#24180f"/>`);
    S.add(`<g clip-path="${clip}">${o.join('')}</g>`);
    // the door frame on the corridor wall
    const fr = q([[XL + 0.005, 0, D0 - 0.09], [XL + 0.005, DH + 0.1, D0 - 0.09], [XL + 0.005, DH + 0.1, D0], [XL + 0.005, 0, D0]]) + q([[XL + 0.005, 0, D1], [XL + 0.005, DH + 0.1, D1], [XL + 0.005, DH + 0.1, D1 + 0.09], [XL + 0.005, 0, D1 + 0.09]]) + q([[XL + 0.005, DH, D0 - 0.09], [XL + 0.005, DH + 0.1, D0 - 0.09], [XL + 0.005, DH + 0.1, D1 + 0.09], [XL + 0.005, DH, D1 + 0.09]]);
    S.add(`<path d="${fr}" fill="${P.frame}"/>`);
  }

  // ---- the closed door further along on the left --------------------------------------------------------------
  if (!mirror) {
    const D0 = 4.25, D1 = 5.0, DH = 2.0;
    S.add(`<path d="${q([[XL + 0.005, 0, D0 - 0.07], [XL + 0.005, DH + 0.08, D0 - 0.07], [XL + 0.005, DH + 0.08, D1 + 0.07], [XL + 0.005, 0, D1 + 0.07]])}" fill="${P.frame}"/><path d="${q([[XL + 0.01, 0, D0], [XL + 0.01, DH, D0], [XL + 0.01, DH, D1], [XL + 0.01, 0, D1]])}" fill="${P.door}"/>`);
    let pn = '';
    for (const [y0, y1] of [[0.15, 0.9], [1.1, 1.85]]) pn += q([[XL + 0.012, y0, D0 + 0.1], [XL + 0.012, y1, D0 + 0.1], [XL + 0.012, y1, D1 - 0.1], [XL + 0.012, y0, D1 - 0.1]]);
    const kn = pr(XL + 0.02, 1.0, D1 - 0.12);
    S.add(`<path d="${pn}" fill="none" stroke="${P.doorDark}" stroke-width="2"/><circle cx="${r0(kn[0])}" cy="${r0(kn[1])}" r="3.5" fill="${P.brass}"/>`);
  }

  // ---- the window on the right, near us: the channel at night, flat water (no reflections) ----------------------
  if (!mirror) {
    const W0 = 1.5, W1 = 2.12, WY0 = 1.15, WY1 = 1.95;
    const win = q([[XR - 0.005, WY0, W0], [XR - 0.005, WY1, W0], [XR - 0.005, WY1, W1], [XR - 0.005, WY0, W1]]);
    const clip = S.clip(win);
    const a = pr(XR, WY1, W0), b = pr(XR, WY0, W0), c = pr(XR, WY0, W1);
    const top = Math.min(a[1], pr(XR, WY1, W1)[1]), bot = Math.max(b[1], c[1]), x0 = c[0], x1 = a[0];
    let roofs = `M${r0(x0 - 10)},${r0(bot)}V${r0(top + (bot - top) * 0.52)}`;
    for (let x = x0 - 10, i = 0; x < x1 + 20; x += 46, i++) { const h = (bot - top) * (0.44 + (i % 3) * 0.04); roofs += `L${r0(x)},${r0(top + h)}L${r0(x + 20)},${r0(top + h - 16)}L${r0(x + 40)},${r0(top + h)}L${r0(x + 40)},${r0(top + h + 10)}L${r0(x + 46)},${r0(top + h + 10)}`; }
    roofs += `V${r0(bot)}Z`;
    const wy = top + (bot - top) * 0.66;
    let cur = '';
    for (let i = 0; i < 6; i++) { const yy = wy + 8 + i * ((bot - wy - 10) / 6), xx = x0 + 10 + ((i * 37) % Math.max(20, x1 - x0 - 40)); cur += `M${r0(xx)},${r0(yy)}q12,-2 26,0`; }
    S.add(`<g clip-path="${clip}"><rect x="${r0(x0 - 10)}" y="${r0(top - 10)}" width="${r0(x1 - x0 + 20)}" height="${r0(bot - top + 20)}" fill="${S.lin(P.night)}"/><path d="${roofs}" fill="${P.roofs}"/><path d="M${r0(x0 - 10)},${r0(wy)}H${r0(x1 + 10)}V${r0(bot + 10)}H${r0(x0 - 10)}Z" fill="${P.water}"/><path d="${cur}" fill="none" stroke="${P.waterHi}" stroke-width="1.5" opacity=".6"/></g>`);
    const fr = pl(pr.poly([[XR - 0.01, WY0, W0], [XR - 0.01, WY1, W0], [XR - 0.01, WY1, W1], [XR - 0.01, WY0, W1], [XR - 0.01, WY0, W0]])) + pl(pr.poly([[XR - 0.01, WY0, (W0 + W1) / 2], [XR - 0.01, WY1, (W0 + W1) / 2]])) + pl(pr.poly([[XR - 0.01, (WY0 + WY1) / 2, W0], [XR - 0.01, (WY0 + WY1) / 2, W1]]));
    S.add(`<path d="${fr}" fill="none" stroke="${P.frame}" stroke-width="7" stroke-linejoin="round"/>`);
    // the cold window light lying on the floor
    S.add(`<path d="${q([[0.95, 0.004, W0 + 0.35], [0.95, 0.004, W1 + 0.55], [0.15, 0.004, W1 + 1.15], [0.15, 0.004, W0 + 0.75]])}" fill="${P.moon}" opacity=".1" filter="${S.blur(1)}"/>`);
  }

  // ---- the mirror side: seven doors standing open, five on the left and two on the stair side, no numbers on
  //      the frames; inside each only flat dark (no floor, no bed, no basin), each leaf swung back into the dark
  if (mirror) {
    const DH = 2.0, o = [];
    const doorsL = [[1.1, 1.75], [2.2, 2.85], [3.3, 3.95], [4.4, 5.05], [5.5, 6.15]], doorsR = [[1.15, 1.8], [2.35, 3.0]];
    for (const [x, sgn, list] of [[XL, 1, doorsL], [XR, -1, doorsR]]) {
      for (const [d0, d1] of list) {
        const w = x + sgn * 0.005, w2 = x + sgn * 0.008;
        o.push(`<path d="${q([[w, 0, d0 - 0.08], [w, DH + 0.09, d0 - 0.08], [w, DH + 0.09, d1 + 0.08], [w, 0, d1 + 0.08]])}" fill="${P.frame}"/>`);
        o.push(`<path d="${q([[w2, 0, d0], [w2, DH, d0], [w2, DH, d1], [w2, 0, d1]])}" fill="#050407"/>`);
        // the leaf, swung back almost flat against the room side of the wall: only its edge shows, at the hinge
        o.push(`<path d="${q([[w2, 0.02, d0], [w2, DH - 0.02, d0], [w2 - sgn * 0.02, DH - 0.02, d0 + 0.07], [w2 - sgn * 0.02, 0.02, d0 + 0.07]])}" fill="${P.doorDark}"/>`);
        o.push(`<path d="${pl(pr.poly([[w2, 0, d1], [w2, DH, d1], [w2, DH, d0]]))}" fill="none" stroke="#5a4636" stroke-width="1.5" opacity=".55"/>`);
      }
    }
    S.add(o.join(''));
  }

  // ---- the oil lamp on the left wall, turned low ------------------------------------------------------------------
  if (!mirror) {
    const c = pr(XL + 0.14, 1.85, 3.65), k = F / 3.65;
    S.add(`<circle cx="${r0(c[0])}" cy="${r0(c[1])}" r="${r0(1.1 * k)}" fill="${S.rad([[0, P.lamp, 0.32], [0.25, '#ff9a50', 0.12], [1, '#ff9a50', 0]])}"/>`);
    const b = pr(XL + 0.005, 1.7, 3.65);
    S.add(`<path d="M${r0(b[0])},${r0(b[1])}L${r0(c[0])},${r0(c[1] + 0.12 * k)}" stroke="#1a120c" stroke-width="4"/><path d="M${r0(c[0] - 0.06 * k)},${r0(c[1] + 0.12 * k)}h${r0(0.12 * k)}v${r0(-0.04 * k)}h${r0(-0.12 * k)}z" fill="#3a2a1c"/><path d="M${r0(c[0] - 0.05 * k)},${r0(c[1] + 0.08 * k)}q${r0(-0.02 * k)},${r0(-0.12 * k)} ${r0(0.05 * k)},${r0(-0.17 * k)}q${r0(0.07 * k)},${r0(0.05 * k)} ${r0(0.05 * k)},${r0(0.17 * k)}z" fill="#d8c8a0" opacity=".55"/><path d="M${r0(c[0])},${r0(c[1] + 0.06 * k)}q-3,-6 0,-10q3,4 0,10z" fill="#ffe0a0"/>`);
  }

  // ---- the mirror at the end of the corridor, uncovered -----------------------------------------------------------
  {
    const m0 = -0.38, m1 = 0.38, my0 = 0.72, my1 = 2.08;
    S.add(`<path d="${q([[m0 - 0.08, my0 - 0.08, ZE - 0.01], [m1 + 0.08, my0 - 0.08, ZE - 0.01], [m1 + 0.08, my1 + 0.1, ZE - 0.01], [m0 - 0.08, my1 + 0.1, ZE - 0.01]])}" fill="${P.mirrorFrame}"/><path d="${pl(pr.poly([[m0 - 0.08, my1 + 0.1, ZE - 0.012], [m1 + 0.08, my1 + 0.1, ZE - 0.012]]))}" stroke="${P.mirrorFrameLit}" stroke-width="3"/>`);
    S.add(glass([pr(m0, my1, ZE - 0.02), pr(m1, my1, ZE - 0.02), pr(m1, my0, ZE - 0.02), pr(m0, my0, ZE - 0.02)]));
    if (covered) S.add(towel([pr(m0, my1, ZE - 0.03), pr(m1, my1, ZE - 0.03), pr(m1, my0, ZE - 0.03), pr(m0, my0, ZE - 0.03)]));
    if (mirror) {
      // seven thin black threads lying on the floor, from the bottom of the picture (his hand, out of frame) into the
      // mirror: they converge down the corridor, climb the end wall and run into the glass, where they are lost
      let th = '';
      for (let i = 0; i < 7; i++) {
        const t = i / 6, xs = -0.62 + 1.24 * t, xe = -0.21 + 0.42 * t, xm = (xs + xe) / 2 + (i % 2 ? 0.035 : -0.035);
        th += pl(pr.poly([[xs, 0.012, 0.68], [xs * 0.85 + xm * 0.15, 0.012, 1.6], [xm, 0.012, 3.2], [(xm + xe) / 2, 0.012, 5.2], [xe, 0.012, ZE - 0.03], [xe, 0.72, ZE - 0.03], [xe * 0.9, 1.0, ZE - 0.03]]));
      }
      S.add(`<path d="${th}" fill="none" stroke="#000000" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="${th}" fill="none" stroke="#8a90a8" stroke-width=".9" opacity=".3"/>`);
      // where they enter, the glass goes darker still
      S.add(`<path d="${pz([pr(m0, my1, ZE - 0.025), pr(m1, my1, ZE - 0.025), pr(m1, my0, ZE - 0.025), pr(m0, my0, ZE - 0.025)])}" fill="${S.lin([[0, '#000000', 0.2], [1, '#000000', 0.75]])}"/>`);
    }
  }

  // ---- Lia's chair, turned round to face the covered mirror at the end of the corridor (its back toward us) --------
  if (covered) {
    const cx = 0.12, cz = 3.0, sw = 0.22, sd = 0.2, sh = 0.46, bh = 0.98, o = [];
    const leg = (x, z, top) => pl(pr.poly([[x, 0, z], [x, top, z]]));
    o.push(`<path d="${leg(cx - sw, cz + sd, sh) + leg(cx + sw, cz + sd, sh)}" stroke="#2a1c12" stroke-width="5" stroke-linecap="round"/>`);
    o.push(`<path d="${q([[cx - sw, sh, cz - sd], [cx + sw, sh, cz - sd], [cx + sw, sh, cz + sd], [cx - sw, sh, cz + sd]])}" fill="#5a4030" stroke="#24180f" stroke-width="2"/>`);
    o.push(`<path d="${q([[cx - sw, sh - 0.05, cz - sd], [cx + sw, sh - 0.05, cz - sd], [cx + sw, sh, cz - sd], [cx - sw, sh, cz - sd]])}" fill="#3a2a1c"/>`);
    o.push(`<path d="${leg(cx - sw, cz - sd, bh) + leg(cx + sw, cz - sd, bh)}" stroke="#3a281a" stroke-width="7" stroke-linecap="round"/>`);
    let sl = '';
    for (const y of [0.66, 0.8, 0.93]) sl += q([[cx - sw, y, cz - sd], [cx + sw, y, cz - sd], [cx + sw, y + 0.05, cz - sd], [cx - sw, y + 0.05, cz - sd]]);
    o.push(`<path d="${sl}" fill="#6a4c36" stroke="#24180f" stroke-width="1.5"/>`);
    o.push(`<path d="${q([[cx - sw, 0.003, cz - sd - 0.1], [cx + sw + 0.1, 0.003, cz - sd - 0.1], [cx + sw + 0.18, 0.003, cz + sd], [cx - sw + 0.04, 0.003, cz + sd]])}" fill="#000" opacity=".25" filter="${S.blur(1)}"/>`);
    S.add(o.join(''));
  }

  // ---- grading: a dim inn at night, darker toward the corners and under the dialogue box --------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.35, '#060406', 0], [1, '#060406', 0.7]], 'cx="0.5" cy="0.44" r="0.75"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#080608', 0], [1, '#080608', 0.7]])}"/>`);
  // ---- the eyes: one identical overlay per mirror, placed in each glass's own axes ----------------------------------
  if (eyes) {
    const glowG = S.rad([[0, P.eyeGlow, 0.55], [0.5, P.eyeGlow, 0.18], [1, P.eyeGlow, 0]]);
    const irisG = S.rad([[0, '#e4d2ff'], [0.35, P.iris], [1, P.irisDark]]);
    const unitEye = `<path d="M-1,0Q0,-.78 1,0Q0,.78 -1,0Z" fill="${P.sclera}" opacity=".92"/><circle r=".37" fill="${irisG}"/><circle r=".15" fill="${P.pupil}"/><circle cx="-.12" cy="-.12" r=".07" fill="#ffffff" opacity=".8"/><path d="M-1.06,.02Q0,-.86 1.06,.02" fill="none" stroke="#3a1c6a" stroke-width=".09" stroke-linecap="round"/>`;
    let out = '';
    for (const [tl, tr, br, bl] of mirrors) {
      const at = (u, v) => { const t = lerp(tl, tr, u), b = lerp(bl, br, u); return lerp(t, b, v); };
      const ux = [(tr[0] - tl[0] + br[0] - bl[0]) / 2, (tr[1] - tl[1] + br[1] - bl[1]) / 2], vy = [(bl[0] - tl[0] + br[0] - tr[0]) / 2, (bl[1] - tl[1] + br[1] - tr[1]) / 2];
      const s = 0.13; // half the eye's width as a fraction of the glass width; height follows the width
      const mw = Math.hypot(ux[0], ux[1]);
      const vn = Math.hypot(vy[0], vy[1]) || 1;
      for (const u of [0.32, 0.68]) {
        const c = at(u, 0.4);
        const m = [ux[0] * s, ux[1] * s, vy[0] / vn * mw * s, vy[1] / vn * mw * s, c[0], c[1]].map((x) => f(x, 2)).join(' ');
        out += `<g transform="matrix(${m})"><circle r="2.2" fill="${glowG}"/>${unitEye}</g>`;
      }
    }
    S.add(out);
  }

  // ---- the mirror side: the whole picture flipped left to right (the stair on the other side), faded and cooled -------
  if (mirror) {
    const fid = S.id('fade');
    // luminance-preserving desaturation to ~25 %, then a cold cast and a slight lift of the blacks
    const s0 = 0.25, lr = 0.2126, lg = 0.7152, lb = 0.0722;
    const row = (k, off, i) => [lr * (1 - s0) + (i === 0 ? s0 : 0), lg * (1 - s0) + (i === 1 ? s0 : 0), lb * (1 - s0) + (i === 2 ? s0 : 0)].map((v) => f(v * k, 3)).concat([0, off]).join(' ');
    const vals = [row(0.86, 0.012, 0), row(0.96, 0.018, 1), row(1.18, 0.03, 2), '0 0 0 1 0'].join(' ');
    S.def(`<filter id="${fid}" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${vals}"/></filter>`);
    S.body = [`<g filter="url(#${fid})"><g transform="matrix(-1 0 0 1 ${W} 0)">`, ...S.body, '</g></g>'];
    S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#1a2234', 0], [0.6, '#0a0e18', 0.15], [1, '#04060c', 0.45]], 'cx="0.5" cy="0.45" r="0.8"')}"/>`);
  }

  return S.out();
}

// ---- 雾港·桥头旅店·亚克的房间 (chapter 11): a small wooden room upstairs, seen from just inside the far corner -------
//   On the back wall the washstand, its basin and jug, and the small mirror over it (blank: only a dull dark sheen);
//   beside it the window onto the channel at night (flat water). Along the right wall the narrow bed, the blanket
//   thrown back. On the left wall the door stands open onto the corridor, where the lamp is turned low.
//   No figures, nothing in the mirror (script 11 美術需求).
function innRoom() {
  const S = new Scene('sbInnRoom', '雾港·桥头旅店·亚克的房间：木造的小房间，后墙上脸盆架、脸盆和水壶，上方挂着一面小镜子，镜面空白、只有暗色的反光；旁边的窗外是夜里的水道；右边靠墙一张窄床，被子掀开；左边的门开着，门外是灯调得很暗的走廊', 7311);
  const VP = [760, 380], F = 760, EYE = 1.5;
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const P = INN;
  const XL = -1.7, XR = 1.6, YC = 2.55, Z0 = 0.8, ZB = 4.3, WN = 0.9;
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  S.add(`<rect width="${W}" height="${H}" fill="#0c0908"/>`);

  // ---- shell: back wall, ceiling and beams, side walls, floor --------------------------------------------------------
  {
    const o = [];
    o.push(`<path d="${q([[XL, WN, ZB], [XL, YC, ZB], [XR, YC, ZB], [XR, WN, ZB]])}" fill="${P.plaster}"/><path d="${q([[XL, 0, ZB], [XL, WN, ZB], [XR, WN, ZB], [XR, 0, ZB]])}" fill="${P.wain}"/>`);
    o.push(`<path d="${q([[XL, YC, Z0], [XR, YC, Z0], [XR, YC, ZB], [XL, YC, ZB]])}" fill="${P.ceil}"/>`);
    let bm = '';
    for (const z of [1.4, 2.4, 3.4]) bm += q([[XL, YC, z], [XR, YC, z], [XR, YC - 0.12, z], [XL, YC - 0.12, z]]);
    o.push(`<path d="${bm}" fill="${P.beam}"/>`);
    o.push(`<path d="${q([[XL, WN, Z0], [XL, YC, Z0], [XL, YC, ZB], [XL, WN, ZB]])}" fill="${S.lin([[0, P.plasterShade], [1, P.plaster]], 'x1="0" y1="0" x2="1" y2="0"')}"/><path d="${q([[XL, 0, Z0], [XL, WN, Z0], [XL, WN, ZB], [XL, 0, ZB]])}" fill="${S.lin([[0, P.wainDark], [1, P.wain]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    o.push(`<path d="${q([[XR, WN, Z0], [XR, YC, Z0], [XR, YC, ZB], [XR, WN, ZB]])}" fill="${S.lin([[0, P.plaster], [1, P.plasterShade]], 'x1="0" y1="0" x2="1" y2="0"')}"/><path d="${q([[XR, 0, Z0], [XR, WN, Z0], [XR, WN, ZB], [XR, 0, ZB]])}" fill="${S.lin([[0, P.wain], [1, P.wainDark]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    o.push(`<path d="${pl(pr.poly([[XL, WN, Z0], [XL, WN, ZB], [XR, WN, ZB], [XR, WN, Z0]]))}" fill="none" stroke="${P.wainLit}" stroke-width="3"/>`);
    let pn = '';
    for (let x = XL + 0.4; x < XR; x += 0.5) pn += pl(pr.poly([[x, 0.08, ZB], [x, WN - 0.08, ZB]]));
    for (let z = 1.3; z < ZB; z += 0.6) pn += pl(pr.poly([[XL, 0.08, z], [XL, WN - 0.08, z]])) + pl(pr.poly([[XR, 0.08, z], [XR, WN - 0.08, z]]));
    o.push(`<path d="${pn}" stroke="${P.wainDark}" stroke-width="1.5" opacity=".7"/>`);
    o.push(`<path d="${q([[XL, 0, 0.5], [XR, 0, 0.5], [XR, 0, ZB], [XL, 0, ZB]])}" fill="${S.lin(P.floor, `gradientUnits="userSpaceOnUse" x1="0" y1="${VP[1]}" x2="0" y2="${H}"`)}"/>`);
    let bd = '';
    for (let x = XL + 0.16; x < XR; x += 0.16) bd += pl(pr.poly([[x, 0, 0.5], [x, 0, ZB]]));
    for (const [x0, x1, z] of [[XL, -0.9, 2.1], [-0.5, 0.3, 3.3], [0.1, 0.9, 1.6], [-1.2, -0.3, 3.8]]) bd += pl(pr.poly([[x0, 0, z], [x1, 0, z]]));
    o.push(`<path d="${bd}" stroke="${P.board}" stroke-width="1.4" opacity=".75"/>`);
    // a small worn rug by the bed
    o.push(`<path d="${q([[-0.45, 0.004, 1.9], [0.55, 0.004, 1.9], [0.55, 0.004, 3.0], [-0.45, 0.004, 3.0]])}" fill="#3a1e1c" opacity=".75"/><path d="${q([[-0.38, 0.005, 1.98], [0.48, 0.005, 1.98], [0.48, 0.005, 2.92], [-0.38, 0.005, 2.92]])}" fill="none" stroke="#6a3a2a" stroke-width="2" opacity=".6"/>`);
    S.add(o.join(''));
  }

  // ---- the door on the left wall, standing open onto the dim corridor ----------------------------------------------
  {
    const D0 = 1.9, D1 = 2.65, DH = 2.05;
    const open = q([[XL, 0, D0], [XL, DH, D0], [XL, DH, D1], [XL, 0, D1]]);
    const clip = S.clip(open);
    const CX = -2.9; // the corridor's far wall, seen through the doorway
    const o = [`<path d="${open}" fill="#120c08"/>`];
    o.push(`<path d="${q([[CX, 0.9, 0.5], [CX, 2.6, 0.5], [CX, 2.6, 8], [CX, 0.9, 8]])}" fill="#4a3c30"/><path d="${q([[CX, 0, 0.5], [CX, 0.9, 0.5], [CX, 0.9, 8], [CX, 0, 8]])}" fill="#4e3626"/>`);
    o.push(`<path d="${pl(pr.poly([[CX, 0.9, 0.5], [CX, 0.9, 8]]))}" stroke="${P.wainLit}" stroke-width="2"/>`);
    o.push(`<path d="${q([[XL, 0, 0.5], [CX, 0, 0.5], [CX, 0, 8], [XL, 0, 8]])}" fill="#2a1e16"/><path d="${q([[-2.0, 0.003, 0.5], [-2.6, 0.003, 0.5], [-2.6, 0.003, 8], [-2.0, 0.003, 8]])}" fill="#3a1e1c" opacity=".7"/>`);
    // the corridor lamp's warm light on the far wall
    const lc = pr(CX + 0.02, 1.8, 3.6);
    o.push(`<circle cx="${r0(lc[0])}" cy="${r0(lc[1])}" r="${r0(0.9 * F / 3.6)}" fill="${S.rad([[0, P.lamp, 0.4], [0.3, '#ff9a50', 0.16], [1, '#ff9a50', 0]])}"/><circle cx="${r0(lc[0])}" cy="${r0(lc[1])}" r="3" fill="#ffe0a0"/>`);
    S.add(`<g clip-path="${clip}">${o.join('')}</g>`);
    // the leaf, hinged on the far jamb and swung into the room toward the back wall (the doorway stays clear)
    const a = 45 * Math.PI / 180, lx = XL + 0.75 * Math.sin(a), lz = D1 + 0.75 * Math.cos(a);
    S.add(`<path d="${q([[XL, 0, D1], [XL, DH, D1], [lx, DH, lz], [lx, 0, lz]])}" fill="${P.door}" stroke="${P.doorDark}" stroke-width="2"/>`);
    let pnl = '';
    for (const [y0, y1] of [[0.15, 0.9], [1.1, 1.85]]) pnl += q([[XL + 0.1 * Math.sin(a), y0, D1 + 0.1 * Math.cos(a)], [XL + 0.1 * Math.sin(a), y1, D1 + 0.1 * Math.cos(a)], [lx - 0.1 * Math.sin(a), y1, lz - 0.1 * Math.cos(a)], [lx - 0.1 * Math.sin(a), y0, lz - 0.1 * Math.cos(a)]]);
    const kn = pr(lx - 0.08 * Math.sin(a), 1.0, lz - 0.08 * Math.cos(a));
    S.add(`<path d="${pnl}" fill="none" stroke="${P.doorDark}" stroke-width="2"/><circle cx="${r0(kn[0])}" cy="${r0(kn[1])}" r="4" fill="${P.brass}"/>`);
    // the frame, and the lamplight spilling onto the floorboards through the doorway
    const fr = q([[XL + 0.005, 0, D0 - 0.09], [XL + 0.005, DH + 0.1, D0 - 0.09], [XL + 0.005, DH + 0.1, D0], [XL + 0.005, 0, D0]]) + q([[XL + 0.005, 0, D1], [XL + 0.005, DH + 0.1, D1], [XL + 0.005, DH + 0.1, D1 + 0.09], [XL + 0.005, 0, D1 + 0.09]]) + q([[XL + 0.005, DH, D0 - 0.09], [XL + 0.005, DH + 0.1, D0 - 0.09], [XL + 0.005, DH + 0.1, D1 + 0.09], [XL + 0.005, DH, D1 + 0.09]]);
    S.add(`<path d="${fr}" fill="${P.frame}"/>`);
    S.add(`<path d="${q([[XL, 0.004, D0], [XL, 0.004, D1], [XL + 1.2, 0.004, D1 + 0.5], [XL + 1.0, 0.004, D0 - 0.1]])}" fill="${P.lamp}" opacity=".08" filter="${S.blur(1)}"/>`);
  }

  // ---- the window on the back wall: the channel at night, flat water (no reflections) ------------------------------
  {
    const x0w = 0.4, x1w = 1.2, y0w = 1.05, y1w = 1.95, z = ZB - 0.005;
    const tl = pr(x0w, y1w, z), br = pr(x1w, y0w, z);
    const win = pz([tl, [br[0], tl[1]], br, [tl[0], br[1]]]);
    const clip = S.clip(win);
    const ww = br[0] - tl[0], wh = br[1] - tl[1];
    let roofs = `M${r0(tl[0] - 4)},${r0(br[1])}V${r0(tl[1] + wh * 0.5)}`;
    for (let x = tl[0] - 4, i = 0; x < br[0] + 20; x += 38, i++) { const h = wh * (0.42 + (i % 3) * 0.05); roofs += `L${r0(x)},${r0(tl[1] + h)}L${r0(x + 16)},${r0(tl[1] + h - 13)}L${r0(x + 32)},${r0(tl[1] + h)}L${r0(x + 32)},${r0(tl[1] + h + 8)}L${r0(x + 38)},${r0(tl[1] + h + 8)}`; }
    roofs += `V${r0(br[1])}Z`;
    const wy = tl[1] + wh * 0.66;
    let cur = '';
    for (let i = 0; i < 5; i++) cur += `M${r0(tl[0] + 10 + ((i * 41) % Math.max(20, ww - 40)))},${r0(wy + 8 + i * ((br[1] - wy - 10) / 5))}q12,-2 24,0`;
    S.add(`<g clip-path="${clip}"><rect x="${r0(tl[0] - 4)}" y="${r0(tl[1] - 4)}" width="${r0(ww + 8)}" height="${r0(wh + 8)}" fill="${S.lin(P.night)}"/><circle cx="${r0(tl[0] + ww * 0.78)}" cy="${r0(tl[1] + wh * 0.2)}" r="9" fill="${P.moon}" opacity=".8"/><path d="${roofs}" fill="${P.roofs}"/><path d="M${r0(tl[0] - 4)},${r0(wy)}H${r0(br[0] + 4)}V${r0(br[1] + 4)}H${r0(tl[0] - 4)}Z" fill="${P.water}"/><path d="${cur}" fill="none" stroke="${P.waterHi}" stroke-width="1.5" opacity=".6"/></g>`);
    S.add(`<path d="${win}M${r0((tl[0] + br[0]) / 2)},${r0(tl[1])}V${r0(br[1])}M${r0(tl[0])},${r0((tl[1] + br[1]) / 2)}H${r0(br[0])}" fill="none" stroke="${P.frame}" stroke-width="7" stroke-linejoin="round"/>`);
    const sill = q([[x0w - 0.06, y0w - 0.04, z], [x1w + 0.06, y0w - 0.04, z], [x1w + 0.06, y0w - 0.04, z - 0.1], [x0w - 0.06, y0w - 0.04, z - 0.1]]);
    S.add(`<path d="${sill}" fill="${P.wainLit}"/>`);
    // the cold window light on the floor
    S.add(`<path d="${q([[x0w, 0.004, ZB - 0.2], [x1w, 0.004, ZB - 0.2], [x1w - 0.25, 0.004, ZB - 1.3], [x0w - 0.35, 0.004, ZB - 1.3]])}" fill="${P.moon}" opacity=".08" filter="${S.blur(1)}"/>`);
  }

  // ---- the washstand on the back wall, its basin and jug, and the small mirror over it ------------------------------
  {
    const a0 = -0.85, a1 = -0.05, top = 0.8, d = 0.42, z = ZB - 0.005, o = [];
    o.push(`<path d="${q([[a0, 0, z - d], [a1, 0, z - d], [a1, top, z - d], [a0, top, z - d]])}" fill="#3a2a20" stroke="#1e140e" stroke-width="2"/>`);
    o.push(`<path d="${q([[a0, top, z - d], [a1, top, z - d], [a1, top, z], [a0, top, z]])}" fill="#5a4434"/>`);
    o.push(`<path d="${q([[a0 + 0.05, 0.1, z - d - 0.002], [a1 - 0.05, 0.1, z - d - 0.002], [a1 - 0.05, top - 0.12, z - d - 0.002], [a0 + 0.05, top - 0.12, z - d - 0.002]])}" fill="none" stroke="#24180f" stroke-width="2"/>`);
    // a towel over the rail at the side of the stand
    o.push(`<path d="${q([[a1 + 0.005, top - 0.05, z - d + 0.05], [a1 + 0.005, top - 0.05, z - 0.08], [a1 + 0.005, top - 0.45, z - 0.1], [a1 + 0.005, top - 0.42, z - d + 0.07]])}" fill="#8e8676" opacity=".85"/>`);
    const bc = pr((a0 + a1) / 2, top + 0.02, z - d / 2), bk = F / (z - d / 2);
    o.push(`<ellipse cx="${r0(bc[0])}" cy="${r0(bc[1])}" rx="${f(0.26 * bk, 1)}" ry="${f(0.07 * bk, 1)}" fill="#8a8e96"/><ellipse cx="${r0(bc[0])}" cy="${r0(bc[1] + 1)}" rx="${f(0.2 * bk, 1)}" ry="${f(0.048 * bk, 1)}" fill="#2e323c"/>`);
    const jc = pr(a1 - 0.1, top, z - 0.12), jk = F / (z - 0.12);
    o.push(`<path d="M${r0(jc[0] - 0.05 * jk)},${r0(jc[1])}v${r0(-0.17 * jk)}q${r0(0.05 * jk)},${r0(-0.07 * jk)} ${r0(0.1 * jk)},0v${r0(0.17 * jk)}z" fill="#6a6e78" stroke="#2a2c34" stroke-width="1.5"/>`);
    // the mirror: a small framed glass, blank — only a dull dark sheen
    const m0 = -0.68, m1 = -0.22, my0 = 1.18, my1 = 1.74;
    o.push(`<path d="${q([[m0 - 0.06, my0 - 0.06, z], [m1 + 0.06, my0 - 0.06, z], [m1 + 0.06, my1 + 0.07, z], [m0 - 0.06, my1 + 0.07, z]])}" fill="${P.mirrorFrame}" stroke="#1e140e" stroke-width="2"/>`);
    const gl = [pr(m0, my1, z - 0.002), pr(m1, my1, z - 0.002), pr(m1, my0, z - 0.002), pr(m0, my0, z - 0.002)];
    const [tl, tr, br, bl] = gl;
    const band = [lerp(tl, tr, 0.28), lerp(tl, tr, 0.46), lerp(bl, br, 0.24), lerp(bl, br, 0.06)];
    o.push(`<path d="${pz(gl)}" fill="${S.lin(P.glass, 'x1="0" y1="0" x2=".4" y2="1"')}"/><path d="${pz([band[0], band[1], band[3], band[2]])}" fill="${P.sheen}" opacity=".22"/>`);
    o.push(`<path d="${pl([pr(m0 - 0.06, my1 + 0.07, z - 0.003), pr(m1 + 0.06, my1 + 0.07, z - 0.003)])}" stroke="${P.mirrorFrameLit}" stroke-width="3"/>`);
    S.add(o.join(''));
  }

  // ---- the narrow bed along the right wall, the blanket thrown back toward the foot ---------------------------------
  // drawn far to near: headboard, mattress side and top, pillow, blanket, footboard
  {
    const b0 = XR - 0.95, b1 = XR, z0 = 1.55, z1 = 3.95, h = 0.46, o = [];
    o.push(`<path d="${q([[b0 - 0.03, 0, z1], [b0 - 0.03, 0.95, z1], [b1, 0.95, z1], [b1, 0, z1]])}" fill="#4a3426" stroke="#1e140e" stroke-width="2"/>`);
    o.push(`<path d="${pl(pr.poly([[b0 - 0.03, 0.95, z1], [b1, 0.95, z1]]))}" stroke="${P.wainLit}" stroke-width="3"/>`);
    o.push(`<path d="${q([[b0, 0, z0], [b0, h, z0], [b0, h, z1], [b0, 0, z1]])}" fill="#3a281c" stroke="#1e140e" stroke-width="2"/>`);
    o.push(`<path d="${q([[b0, h, z0], [b1, h, z0], [b1, h, z1], [b0, h, z1]])}" fill="#6e6658" stroke="#3a342c" stroke-width="1.5"/>`);
    o.push(`<path d="${q([[b0 + 0.1, h + 0.1, z1 - 0.45], [b1 - 0.08, h + 0.1, z1 - 0.45], [b1 - 0.08, h + 0.03, z1 - 0.06], [b0 + 0.1, h + 0.03, z1 - 0.06]])}" fill="#a8a090" stroke="#4e483e" stroke-width="1.5"/>`);
    // the blanket: over the near half, its turned-back edge a soft roll across the bed
    const zr = z0 + 1.05;
    o.push(`<path d="${q([[b0 - 0.04, h + 0.06, zr], [b1, h + 0.06, zr], [b1, h + 0.04, z0 + 0.02], [b0 - 0.04, h + 0.04, z0 + 0.02]])}" fill="#3e3a52" stroke="#1a1824" stroke-width="2"/>`);
    o.push(`<path d="${q([[b0 - 0.04, h - 0.2, zr], [b0 - 0.04, h + 0.06, zr], [b0 - 0.04, h + 0.04, z0 + 0.02], [b0 - 0.04, h - 0.22, z0 + 0.02]])}" fill="#2e2a40" stroke="#1a1824" stroke-width="2"/>`);
    o.push(`<path d="${q([[b0 - 0.04, h + 0.06, zr + 0.16], [b1, h + 0.06, zr + 0.16], [b1, h + 0.14, zr], [b0 - 0.04, h + 0.14, zr]])}" fill="#57526e" stroke="#1a1824" stroke-width="1.5"/>`);
    o.push(`<path d="${q([[b0 - 0.04, 0, z0 - 0.02], [b0 - 0.04, 0.7, z0 - 0.02], [b1, 0.7, z0 - 0.02], [b1, 0, z0 - 0.02]])}" fill="#4a3426" stroke="#1e140e" stroke-width="2"/>`);
    o.push(`<path d="${pl(pr.poly([[b0 - 0.04, 0.7, z0 - 0.02], [b1, 0.7, z0 - 0.02]]))}" stroke="${P.wainLit}" stroke-width="3"/>`);
    S.add(o.join(''));
  }

  // ---- grading: a dim room at night, darker toward the corners and under the dialogue box ---------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.35, '#060406', 0], [1, '#060406', 0.7]], 'cx="0.48" cy="0.42" r="0.75"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#080608', 0], [1, '#080608', 0.7]])}"/>`);
  return S.out();
}

export const innBgs = {
  'fog-harbor-bridge-inn-night': () => innCorridor('night'),
  'fog-harbor-bridge-inn-eyes': () => innCorridor('eyes'),
  'fog-harbor-bridge-inn-covered': () => innCorridor('covered'),
  'fog-harbor-bridge-inn-mirror': () => innCorridor('mirror'),
  'fog-harbor-bridge-inn-room': () => innRoom(),
};
