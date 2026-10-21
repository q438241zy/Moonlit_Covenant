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

function innCorridor(eyes) {
  const S = new Scene(eyes ? 'sbInnEyes' : 'sbInnNight', eyes
    ? '雾港·桥头旅店·镜中紫眼：同一条入夜的旅店走廊——走廊尽头的镜子、楼梯转角的镜子、半开的门里脸盆上方的小镜子，每一面镜子里同时睁开同一双紫色的眼睛；只有眼睛，没有脸、没有头发、没有人形'
    : '雾港·桥头旅店·入夜：灯调得很暗的木造旅店走廊，尽头一面没盖布的镜子，左边半开的门里看得见脸盆上方的小镜子，右边栏杆外的楼梯在转角平台上拐弯、墙上也挂着镜子，近处的窗外是夜里的水道；镜面空白，只有暗色的反光', 7301);
  const VP = [800, 390], F = 700, EYE = 1.55;
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const XL = -1.05, XR = 1.05, YC = 2.7, Z0 = 0.9, ZE = 6.8, WN = 0.95; // corridor walls, ceiling, near / end, wainscot
  const P = INN;
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

  S.add(`<rect width="${W}" height="${H}" fill="#0c0908"/>`);

  // ---- the stair hall beyond the railing on the right (drawn first: it lies behind the corridor's right edge) -----
  // The stair climbs along the hall's back wall, seen side-on (its sawtooth profile toward us), to a landing in the
  // corner by the corridor's end wall, where it turns up out of sight; the stair-corner mirror hangs above the landing.
  const SX = 3.6, SZ0 = 2.2, SY = 4.4;
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
  {
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
  {
    const D0 = 4.25, D1 = 5.0, DH = 2.0;
    S.add(`<path d="${q([[XL + 0.005, 0, D0 - 0.07], [XL + 0.005, DH + 0.08, D0 - 0.07], [XL + 0.005, DH + 0.08, D1 + 0.07], [XL + 0.005, 0, D1 + 0.07]])}" fill="${P.frame}"/><path d="${q([[XL + 0.01, 0, D0], [XL + 0.01, DH, D0], [XL + 0.01, DH, D1], [XL + 0.01, 0, D1]])}" fill="${P.door}"/>`);
    let pn = '';
    for (const [y0, y1] of [[0.15, 0.9], [1.1, 1.85]]) pn += q([[XL + 0.012, y0, D0 + 0.1], [XL + 0.012, y1, D0 + 0.1], [XL + 0.012, y1, D1 - 0.1], [XL + 0.012, y0, D1 - 0.1]]);
    const kn = pr(XL + 0.02, 1.0, D1 - 0.12);
    S.add(`<path d="${pn}" fill="none" stroke="${P.doorDark}" stroke-width="2"/><circle cx="${r0(kn[0])}" cy="${r0(kn[1])}" r="3.5" fill="${P.brass}"/>`);
  }

  // ---- the window on the right, near us: the channel at night, flat water (no reflections) ----------------------
  {
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

  // ---- the oil lamp on the left wall, turned low ------------------------------------------------------------------
  {
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

  return S.out();
}

export const innBgs = {
  'fog-harbor-bridge-inn-night': () => innCorridor(false),
  'fog-harbor-bridge-inn-eyes': () => innCorridor(true),
};
