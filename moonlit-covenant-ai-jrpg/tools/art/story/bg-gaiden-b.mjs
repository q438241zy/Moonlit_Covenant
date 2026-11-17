// 外传《银轨号》正篇第3、4章的场景背景：silver-rail-luggage-workshop（银轨号·行李车厢·米娅的工作室）、silver-rail-roof-night（银轨号·车顶·月夜）。
//   silver-rail-luggage-workshop — the luggage car turned into Mia's workshop, seen down its length: a ribbed, arched
//                                  ceiling strung with a dozen home-made tin-can lamps (warm amber), a long workbench
//                                  down the middle cluttered with gears, copper pipe, springs, a vise and a little brass
//                                  tea machine; suitcases and trunks stacked into walls on both sides; two small windows
//                                  on the left onto the night (a moon with a corner missing); gears and springs on the
//                                  plank floor; the far end door with a round porthole. No figures, no Zero, no text.
//   silver-rail-roof-night       — on the roof of the moving train at night, looking ahead along the cars: riveted roof
//                                  plates curving away, a ventilator hump, the gap to the next car, the locomotive far
//                                  ahead with its lit cab and smoke trailing back; a marker lantern on the ladder top near
//                                  us; the moon with a corner bitten away in a purple halo, thin cloud bands, stars; the
//                                  wilderness flying past in streaked silhouettes and telegraph poles. No figures.
import { Scene, W, H, f, pz, pl, persp } from './lib.mjs';

const r0 = (v) => f(v, 0);

// gear outline (optionally squashed vertically for gears lying flat), with a centre hole (fill-rule evenodd)
function gear(cx, cy, r, teeth, { rot = 0, sy = 1, hole = 0.32 } = {}) {
  const pts = [];
  const n = teeth * 4;
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    const rr = i % 4 < 2 ? r : r * 0.78;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * sy]);
  }
  let d = pz(pts);
  if (hole) { const hr = r * hole; d += `M${r0(cx - hr)},${r0(cy)}a${r0(hr)},${f(hr * sy, 1)} 0 1 0 ${r0(hr * 2)},0a${r0(hr)},${f(hr * sy, 1)} 0 1 0 ${r0(-hr * 2)},0Z`; }
  return d;
}

// ---------------------------------------------------------------------------------------------------------------------
// silver-rail-luggage-workshop
// ---------------------------------------------------------------------------------------------------------------------
function workshop() {
  const S = new Scene('sbGdBLug', '银轨号·行李车厢·米娅的工作室：被改成工坊的行李车厢，拱形车顶的肋梁上挂着十几盏罐头灯罩的自制小灯，暖橘色的光；中间一张长工作台，台上散着齿轮、铜管、弹簧、台钳和一台小小的黄铜泡茶机；两侧行李箱和皮箱垒成墙；左边两扇小窗外是夜空和缺了一角的月亮；木地板上散落着齿轮和弹簧；尽头一扇带圆窗的车门；不画人，没有零号，没有字', 3301);
  const R = S.R;
  const VP = [820, 410], F = 760, EYE = 1.55;
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const XL = -1.65, XR = 1.65, YW = 2.05, YC = 2.75, Z0 = 0.5, ZB = 7.2;
  const C = {
    wall: '#4a3322', wallDark: '#24170f', panel: '#3a281a', ceil: '#2a1d13', ceilLit: '#4e3624', rib: '#1c130c', ribLit: '#6a4a2e',
    floor: [[0, '#4a3624'], [1, '#140e0a']], plank: '#1e140c', brass: '#d0a45e', brassDark: '#7a5a2e', copper: '#c0703e',
    steel: '#8a8e96', steelDark: '#4a4e56', lamp: '#ffc070', bulb: '#fff0c8', velvet: '#26306a', velvetLit: '#3e4a90',
  };
  const ceilY = (x) => YW + (YC - YW) * Math.sqrt(Math.max(0, 1 - (x / XR) ** 2));
  S.add(`<rect width="${W}" height="${H}" fill="#120c08"/>`);

  // ---- shell: arched ceiling strips, walls, back wall, floor ---------------------------------------------------------
  {
    const NP = 12, prof = [];
    for (let i = 0; i <= NP; i++) { const t = Math.PI * i / NP; prof.push([XR * Math.cos(t), YW + (YC - YW) * Math.sin(t)]); }
    let o = '';
    for (let i = 0; i < NP; i++) {
      const [xa, ya] = prof[i], [xb, yb] = prof[i + 1];
      const lit = Math.sin(Math.PI * (i + 0.5) / NP);
      o += `<path d="${q([[xa, ya, Z0], [xb, yb, Z0], [xb, yb, ZB], [xa, ya, ZB]])}" fill="${lit > 0.8 ? C.ceilLit : C.ceil}" opacity="${f(0.75 + lit * 0.25, 2)}"/>`;
    }
    o += `<path d="${q([[XL, 0, Z0], [XL, YW, Z0], [XL, YW, ZB], [XL, 0, ZB]])}" fill="${S.lin([[0, C.wallDark], [1, C.wall]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`;
    o += `<path d="${q([[XR, 0, Z0], [XR, YW, Z0], [XR, YW, ZB], [XR, 0, ZB]])}" fill="${S.lin([[0, C.wall], [1, C.wallDark]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`;
    // vertical boarding on the walls
    let bd = '';
    for (let z = 0.9; z < ZB; z += 0.32) bd += pl(pr.poly([[XL + 0.002, 0.05, z], [XL + 0.002, YW - 0.05, z]])) + pl(pr.poly([[XR - 0.002, 0.05, z], [XR - 0.002, YW - 0.05, z]]));
    o += `<path d="${bd}" stroke="${C.wallDark}" stroke-width="1.4" opacity=".55"/>`;
    // back wall (arched top) with the end door
    const back = [...prof.map(([x, y]) => [x, y, ZB]), [XL, 0, ZB], [XR, 0, ZB]];
    o += `<path d="${pz(pr.poly(back))}" fill="${C.panel}"/>`;
    o += `<path d="${q([[-0.42, 0, ZB - 0.01], [-0.42, 1.98, ZB - 0.01], [0.42, 1.98, ZB - 0.01], [0.42, 0, ZB - 0.01]])}" fill="${C.wallDark}"/>`;
    o += `<path d="${q([[-0.36, 0, ZB - 0.02], [-0.36, 1.92, ZB - 0.02], [0.36, 1.92, ZB - 0.02], [0.36, 0, ZB - 0.02]])}" fill="#3e2a1a" stroke="#160e08" stroke-width="2"/>`;
    const pc = pr(0, 1.45, ZB - 0.03), pk = F / ZB;
    o += `<circle cx="${r0(pc[0])}" cy="${r0(pc[1])}" r="${r0(0.17 * pk)}" fill="${C.brassDark}"/><circle cx="${r0(pc[0])}" cy="${r0(pc[1])}" r="${r0(0.13 * pk)}" fill="#1a1c3a"/><circle cx="${r0(pc[0] + 4)}" cy="${r0(pc[1] - 4)}" r="2" fill="#e8ddff" opacity=".8"/>`;
    const kn = pr(0.27, 0.95, ZB - 0.03);
    o += `<circle cx="${r0(kn[0])}" cy="${r0(kn[1])}" r="4" fill="${C.brass}"/>`;
    // floor and planks
    o += `<path d="${q([[XL, 0, Z0], [XR, 0, Z0], [XR, 0, ZB], [XL, 0, ZB]])}" fill="${S.lin(C.floor, `gradientUnits="userSpaceOnUse" x1="0" y1="${VP[1] + 160}" x2="0" y2="${H}"`)}"/>`;
    let pk2 = '';
    for (let x = XL + 0.22; x < XR; x += 0.22) pk2 += pl(pr.poly([[x, 0, 0.75], [x, 0, ZB]]));
    for (const z of [1.3, 2.4, 3.6, 4.9, 6.1]) { const x0 = XL + R.range(0.1, 1.2); pk2 += pl(pr.poly([[x0, 0, z], [x0 + 0.22, 0, z]])) + pl(pr.poly([[x0 + 1.1, 0, z + 0.4], [x0 + 1.32, 0, z + 0.4]])); }
    o += `<path d="${pk2}" stroke="${C.plank}" stroke-width="1.5" opacity=".7"/>`;
    S.add(o);
    // ribs across the ceiling and down the walls
    let rib = '', ribHi = '';
    for (const z of [1.25, 2.45, 3.65, 4.85, 6.05]) {
      const pts = [[XR, 0, z], ...prof.map(([x, y]) => [x, y, z]), [XL, 0, z]];
      rib += pl(pr.poly(pts));
      ribHi += pl(pr.poly(prof.slice(3, 10).map(([x, y]) => [x, y - 0.03, z])));
    }
    S.add(`<path d="${rib}" fill="none" stroke="${C.rib}" stroke-width="9" stroke-linejoin="round"/><path d="${ribHi}" fill="none" stroke="${C.ribLit}" stroke-width="2" opacity=".6"/>`);
    // luggage rack rail along both walls
    S.add(`<path d="${pl(pr.poly([[XL + 0.02, 1.95, 0.6], [XL + 0.02, 1.95, ZB]]))}${pl(pr.poly([[XR - 0.02, 1.95, 0.6], [XR - 0.02, 1.95, ZB]]))}" stroke="${C.brassDark}" stroke-width="3" opacity=".8"/>`);
  }

  // ---- two small windows on the left wall onto the night, moonlight on the floor -----------------------------------
  {
    const wins = [[2.25, 3.0], [4.55, 5.15]];
    wins.forEach(([z0, z1], k) => {
      const y0 = 1.28, y1 = 1.82, x = XL + 0.004;
      const poly = pr.poly([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]]);
      const clip = S.clip(pz(poly));
      const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
      const bx = Math.min(...xs), by = Math.min(...ys), bw = Math.max(...xs) - bx, bh = Math.max(...ys) - by;
      let g = `<rect x="${r0(bx)}" y="${r0(by)}" width="${r0(bw)}" height="${r0(bh)}" fill="${S.lin([[0, '#080a1e'], [0.7, '#1e1c44'], [1, '#2e2650']])}"/>`;
      let st = '';
      for (let i = 0; i < 9; i++) st += `<circle cx="${r0(bx + R() * bw)}" cy="${r0(by + R() * bh * 0.7)}" r="${f(R.range(0.6, 1.5), 1)}"/>`;
      g += `<g fill="#e8ddff" opacity=".8">${st}</g>`;
      if (k === 0) {
        const mx = bx + bw * 0.62, my = by + bh * 0.36, mr = Math.min(bw, bh) * 0.17;
        g += `<circle cx="${r0(mx)}" cy="${r0(my)}" r="${r0(mr * 2.4)}" fill="${S.rad([[0, '#b58cff', 0.35], [1, '#b58cff', 0]])}"/><circle cx="${r0(mx)}" cy="${r0(my)}" r="${r0(mr)}" fill="#ece4ff"/><circle cx="${r0(mx + mr * 0.98)}" cy="${r0(my - mr * 0.62)}" r="${r0(mr * 0.66)}" fill="#141432"/>`;
      }
      g += `<path d="M${r0(bx)},${r0(by + bh * 0.82)}L${r0(bx + bw * 0.3)},${r0(by + bh * 0.74)}L${r0(bx + bw * 0.55)},${r0(by + bh * 0.8)}L${r0(bx + bw)},${r0(by + bh * 0.72)}V${r0(by + bh)}H${r0(bx)}Z" fill="#06060e"/>`;
      S.add(`<g clip-path="${clip}">${g}</g>`);
      const mid = pr.poly([[x, (y0 + y1) / 2, z0], [x, (y0 + y1) / 2, z1]]), mz = pr.poly([[x, y0, (z0 + z1) / 2], [x, y1, (z0 + z1) / 2]]);
      S.add(`<path d="${pz(poly)}${pl(mid)}${pl(mz)}" fill="none" stroke="#2a1a10" stroke-width="5" stroke-linejoin="round"/>`);
      // cold moonlight spilling across the floor
      S.add(`<path d="${q([[XL + 0.05, 0.003, z0 + 0.1], [XL + 0.05, 0.003, z1 + 0.1], [XL + 1.35, 0.003, z1 + 0.55], [XL + 1.35, 0.003, z0 + 0.55]])}" fill="#9a8cff" opacity=".1" filter="${S.blur(2)}"/>`);
    });
  }

  // ---- suitcases and trunks stacked into walls ---------------------------------------------------------------------
  const SUIT = [['#6a3a26', '#8a5234', '#3a1e12'], ['#4a3a2a', '#6a5640', '#2a1e14'], ['#5a2a2e', '#7a3a3e', '#2e1416'], ['#3a4232', '#525c44', '#1e2418'], ['#2e3448', '#465068', '#181c28'], ['#7a5a36', '#9a7648', '#3e2c18']];
  const box = (x0, x1, y0, y1, z0, z1, pal, side) => {
    const [front, top, dark] = pal;
    let o = '';
    if (side === 'r') o += `<path d="${q([[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]])}" fill="${dark}"/>`;
    else o += `<path d="${q([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]])}" fill="${dark}"/>`;
    if (y1 < EYE) o += `<path d="${q([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])}" fill="${top}"/>`;
    o += `<path d="${q([[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]])}" fill="${front}" stroke="${dark}" stroke-width="1.5"/>`;
    // straps, corner caps and a handle on the front face
    const w = x1 - x0, h = y1 - y0;
    let s = '';
    for (const t of [0.28, 0.72]) s += q([[x0 + w * t - 0.025, y0, z0 - 0.002], [x0 + w * t - 0.025, y1, z0 - 0.002], [x0 + w * t + 0.025, y1, z0 - 0.002], [x0 + w * t + 0.025, y0, z0 - 0.002]]);
    o += `<path d="${s}" fill="${dark}" opacity=".75"/>`;
    let cap = '';
    for (const [cx, cy] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) { const p = pr(cx, cy, z0 - 0.003); cap += `<circle cx="${r0(p[0])}" cy="${r0(p[1])}" r="${f(Math.max(1.2, 0.016 * F / z0), 1)}"/>`; }
    o += `<g fill="${C.brass}" opacity=".85">${cap}</g>`;
    if (h > 0.25) { const hp = pr(x0 + w / 2, y0 + h * 0.55, z0 - 0.004), k = F / z0; o += `<path d="M${r0(hp[0] - 0.06 * k)},${r0(hp[1])}q${r0(0.06 * k)},${r0(-0.05 * k)} ${r0(0.12 * k)},0" fill="none" stroke="${C.brassDark}" stroke-width="${f(Math.max(1.5, 0.012 * k), 1)}"/>`; }
    return o;
  };
  const stacks = [];
  // cases about 0.5–0.8 m long, stacked against each wall in short columns, far to near
  const column = (side, zA, zB, maxH) => {
    for (let z = zA; z < zB - 0.3;) {
      const len = R.range(0.5, 0.82), z1 = Math.min(zB, z + len);
      let y = 0;
      const top = maxH * R.range(0.7, 1);
      for (let i = 0; y < top - 0.18 && i < 4; i++) {
        const h = R.range(0.26, 0.46), dep = R.range(0.42, 0.62), y0 = y, y1 = Math.min(top, y + h), zz = z + R.range(0, 0.06), pal = SUIT[R.int(0, SUIT.length - 1)];
        if (side === 'r') stacks.push({ z, y: y0, draw: () => box(XR - 0.02 - dep, XR - 0.02, y0, y1, zz, z1, pal, 'r') });
        else stacks.push({ z, y: y0, draw: () => box(XL + 0.02, XL + 0.02 + dep, y0, y1, zz, z1, pal, 'l') });
        y = y1;
      }
      z = z1 + R.range(0.02, 0.08);
    }
  };
  column('r', 1.7, 7.1, 1.85);
  column('l', 1.95, 7.1, 1.05);
  // the back-right corner: a trunk with the deep-blue velvet cloth folded over it (nothing under it)
  stacks.push({ z: 6.5, y: 0, draw: () => {
    let o = box(0.5, 0.98, 0, 0.5, 6.5, 7.0, SUIT[5], 'r');
    o += `<path d="${q([[0.5, 0.505, 6.5], [0.98, 0.505, 6.5], [0.98, 0.505, 6.95], [0.5, 0.505, 6.95]])}" fill="${C.velvet}"/>`;
    o += `<path d="${pl(pr.poly([[0.5, 0.505, 6.5], [0.52, 0.32, 6.49], [0.62, 0.22, 6.49], [0.74, 0.3, 6.49], [0.86, 0.2, 6.49], [0.98, 0.34, 6.49], [0.98, 0.505, 6.5]]))}Z" fill="${C.velvetLit}" stroke="#141a40" stroke-width="1.5"/>`;
    return o;
  } });
  stacks.sort((a, b) => b.z - a.z || a.y - b.y).forEach((s) => S.add(s.draw()));

  // ---- the long workbench and its clutter -------------------------------------------------------------------------
  {
    const bx0 = -0.78, bx1 = 0.06, bz0 = 1.85, bz1 = 4.7, TH = 0.86;
    let o = '';
    // legs and stretcher
    const legs = [[bx0 + 0.06, bz0 + 0.06], [bx1 - 0.06, bz0 + 0.06], [bx0 + 0.06, bz1 - 0.06], [bx1 - 0.06, bz1 - 0.06], [bx1 - 0.06, (bz0 + bz1) / 2]];
    o += `<path d="${legs.map(([x, z]) => pl(pr.poly([[x, 0, z], [x, TH, z]]))).join('')}${pl(pr.poly([[bx1 - 0.06, 0.25, bz0 + 0.06], [bx1 - 0.06, 0.25, bz1 - 0.06]]))}" stroke="#24160c" stroke-width="7"/>`;
    // a shelf under the top with a toolbox and cans
    o += `<path d="${q([[bx0 + 0.04, 0.3, bz0 + 0.1], [bx1 - 0.04, 0.3, bz0 + 0.1], [bx1 - 0.04, 0.3, bz1 - 0.1], [bx0 + 0.04, 0.3, bz1 - 0.1]])}" fill="#2e1e12"/>`;
    o += `<path d="${q([[bx1 - 0.3, 0.3, 2.6], [bx1 - 0.3, 0.52, 2.6], [bx1 - 0.05, 0.52, 2.6], [bx1 - 0.05, 0.3, 2.6]])}" fill="#7a2e22" stroke="#2e1008" stroke-width="1.5"/>`;
    // top: side face, then surface
    o += `<path d="${q([[bx1, TH - 0.08, bz0], [bx1, TH, bz0], [bx1, TH, bz1], [bx1, TH - 0.08, bz1]])}" fill="#3a2414"/>`;
    o += `<path d="${q([[bx0, TH, bz0], [bx1, TH, bz0], [bx1, TH, bz1], [bx0, TH, bz1]])}" fill="${S.lin([[0, '#6a4628'], [1, '#4a3018']], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(pr(0, TH, bz1)[1])}" x2="0" y2="${r0(pr(0, TH, bz0)[1])}"`)}" stroke="#24160c" stroke-width="2"/>`;
    o += `<path d="${q([[bx0, TH - 0.08, bz0], [bx1, TH - 0.08, bz0], [bx1, TH, bz0], [bx0, TH, bz0]])}" fill="#3e2816"/>`;
    S.add(o);
    // gears lying on the bench (flattened), copper pipe, springs, tools
    let gs = '', gl = '';
    const benchGears = [[-0.55, 2.2, 0.11, 12], [-0.3, 2.45, 0.07, 9], [-0.12, 2.15, 0.05, 8], [-0.62, 3.0, 0.09, 11], [-0.2, 3.25, 0.12, 14], [-0.45, 3.7, 0.06, 8], [-0.1, 4.1, 0.08, 10], [-0.6, 4.35, 0.05, 7]];
    for (const [x, z, r, t] of benchGears) {
      const c = pr(x, TH + 0.005, z), k = F / z, sy = (EYE - TH) / Math.hypot(EYE - TH, z) * 1.1;
      gs += `<path d="${gear(c[0], c[1], r * k, t, { rot: R() * 6, sy })}"/>`;
      gl += `<path d="${gear(c[0], c[1] - 2, r * k, t, { rot: R() * 6, sy, hole: 0 })}" />`;
    }
    S.add(`<g fill="${C.brassDark}">${gl}</g><g fill="${C.brass}" fill-rule="evenodd" stroke="#4a3418" stroke-width="1">${gs}</g>`);
    let pipes = '';
    for (const [x0, z0, x1, z1] of [[-0.7, 2.6, -0.35, 2.9], [-0.05, 2.7, -0.4, 3.05], [-0.68, 3.9, -0.3, 4.0]]) pipes += pl(pr.poly([[x0, TH + 0.02, z0], [x1, TH + 0.02, z1]]));
    S.add(`<path d="${pipes}" stroke="${C.copper}" stroke-width="5" stroke-linecap="round"/><path d="${pipes}" stroke="#f0a070" stroke-width="1.3" opacity=".6" transform="translate(0 -2)"/>`);
    // springs (zigzag)
    let spr = '';
    for (const [x, z, len] of [[-0.42, 2.0, 0.22], [-0.05, 3.55, 0.18]]) {
      const pts = [];
      for (let i = 0; i <= 14; i++) pts.push(pr(x - len / 2 + len * i / 14, TH + 0.03 + (i % 2 ? 0.035 : 0), z));
      spr += pl(pts);
    }
    S.add(`<path d="${spr}" fill="none" stroke="${C.steel}" stroke-width="2.2"/>`);
    // a wrench and a screwdriver near the front edge
    const w0 = pr(-0.36, TH + 0.01, 1.95), w1 = pr(-0.12, TH + 0.01, 2.05), k0 = F / 2;
    S.add(`<path d="M${r0(w0[0])},${r0(w0[1])}L${r0(w1[0])},${r0(w1[1])}" stroke="${C.steel}" stroke-width="${r0(0.025 * k0)}" stroke-linecap="round"/><circle cx="${r0(w0[0])}" cy="${r0(w0[1])}" r="${r0(0.03 * k0)}" fill="none" stroke="${C.steel}" stroke-width="${r0(0.016 * k0)}"/>`);
    const s0 = pr(-0.7, TH + 0.01, 2.05), s1 = pr(-0.5, TH + 0.01, 1.98);
    S.add(`<path d="M${r0(s0[0])},${r0(s0[1])}L${r0((s0[0] + s1[0]) / 2)},${r0((s0[1] + s1[1]) / 2)}" stroke="#c03a2a" stroke-width="${r0(0.03 * k0)}" stroke-linecap="round"/><path d="M${r0((s0[0] + s1[0]) / 2)},${r0((s0[1] + s1[1]) / 2)}L${r0(s1[0])},${r0(s1[1])}" stroke="${C.steel}" stroke-width="${r0(0.01 * k0)}"/>`);
    // a vice clamped at the near end
    {
      const v = pr(0.0, TH, 2.0), k = F / 2.0;
      S.add(`<path d="M${r0(v[0] - 0.06 * k)},${r0(v[1])}v${r0(-0.1 * k)}h${r0(0.05 * k)}v${r0(0.04 * k)}h${r0(0.03 * k)}v${r0(-0.04 * k)}h${r0(0.05 * k)}v${r0(0.1 * k)}Z" fill="${C.steelDark}" stroke="#22252a" stroke-width="2"/><path d="M${r0(v[0] - 0.12 * k)},${r0(v[1] - 0.05 * k)}h${r0(0.24 * k)}" stroke="${C.steel}" stroke-width="3" stroke-linecap="round"/>`);
    }
    // the little brass tea machine at the far end: boiler, dome, spout, gauge, a wisp of steam
    {
      const b = pr(-0.38, TH, 4.45), k = F / 4.45, w = 0.13 * k, h = 0.26 * k;
      let o = `<path d="M${r0(b[0] - w)},${r0(b[1])}V${r0(b[1] - h)}h${r0(w * 2)}V${r0(b[1])}Z" fill="${C.brass}" stroke="${C.brassDark}" stroke-width="2"/>`;
      o += `<path d="M${r0(b[0] - w)},${r0(b[1] - h)}a${r0(w)},${r0(w * 0.8)} 0 0 1 ${r0(w * 2)},0Z" fill="#e0b870" stroke="${C.brassDark}" stroke-width="2"/>`;
      o += `<path d="M${r0(b[0] + w)},${r0(b[1] - h * 0.6)}q${r0(w * 0.8)},${r0(-h * 0.1)} ${r0(w * 1.1)},${r0(-h * 0.45)}" fill="none" stroke="${C.copper}" stroke-width="${r0(Math.max(3, w * 0.25))}" stroke-linecap="round"/>`;
      o += `<circle cx="${r0(b[0] - w * 0.3)}" cy="${r0(b[1] - h * 0.45)}" r="${r0(w * 0.32)}" fill="#f4ead0" stroke="${C.brassDark}" stroke-width="1.5"/><path d="M${r0(b[0] - w * 0.3)},${r0(b[1] - h * 0.45)}l${r0(w * 0.2)},${r0(-w * 0.12)}" stroke="#7a2a1a" stroke-width="1.5"/>`;
      o += `<path d="M${r0(b[0] + w * 2.1)},${r0(b[1] - h * 1.1)}q${r0(w * 0.4)},${r0(-h * 0.4)} ${r0(-w * 0.1)},${r0(-h * 0.8)}q${r0(-w * 0.5)},${r0(-h * 0.4)} ${r0(w * 0.2)},${r0(-h * 0.9)}" fill="none" stroke="#f4ead8" stroke-width="${r0(w * 0.35)}" stroke-linecap="round" opacity=".35" filter="${S.blur(1)}"/>`;
      S.add(o);
    }
  }

  // ---- gears and springs on the floor, a big gear leaning on the right stack -------------------------------------
  {
    let gs = '';
    for (const [x, z, r, t] of [[0.55, 1.35, 0.09, 11], [0.3, 1.7, 0.05, 8], [0.85, 2.1, 0.06, 9], [-0.95, 1.25, 0.07, 10], [0.15, 2.6, 0.04, 7], [0.65, 3.2, 0.05, 8]]) {
      const c = pr(x, 0.004, z), k = F / z, sy = EYE / Math.hypot(EYE, z) * 1.05;
      gs += `<path d="${gear(c[0], c[1], r * k, t, { rot: R() * 6, sy })}"/>`;
    }
    S.add(`<g fill="${C.brass}" fill-rule="evenodd" stroke="#3a2812" stroke-width="1.2" opacity=".92">${gs}</g>`);
    const sp = [];
    for (let i = 0; i <= 12; i++) sp.push(pr(0.42 + i * 0.02, 0.01 + (i % 2 ? 0.03 : 0), 1.55));
    S.add(`<path d="${pl(sp)}" fill="none" stroke="${C.steel}" stroke-width="2.5"/>`);
    const bg = pr(1.02, 0.42, 1.6), k = F / 1.6;
    S.add(`<path d="${gear(bg[0], bg[1], 0.38 * k, 18, { rot: 0.3, sy: 1, hole: 0.22 })}" fill="#a07a3e" fill-rule="evenodd" stroke="#3a2812" stroke-width="3"/><circle cx="${r0(bg[0])}" cy="${r0(bg[1])}" r="${r0(0.26 * k)}" fill="none" stroke="#7a5a2e" stroke-width="${r0(0.03 * k)}"/>`);
  }

  // ---- a dozen tin-can lamps on wires under the ribs ---------------------------------------------------------------
  {
    const lamps = [[-0.95, 1.9, 1.92], [0.05, 2.05, 2.18], [-0.45, 2.9, 2.1], [0.55, 3.0, 1.95], [-1.1, 3.6, 1.98], [0.1, 3.9, 2.2], [1.05, 4.1, 2.0], [-0.6, 4.7, 2.05], [0.45, 5.2, 2.15], [-0.2, 5.9, 1.98], [0.85, 6.3, 2.08], [-1.0, 6.5, 2.12]];
    lamps.sort((a, b) => b[1] - a[1]);
    // the wire the lamps are strung from, sagging between the ribs
    let wire = '';
    for (const [xa, xb, z0, z1] of [[-1.5, 1.5, 1.9, 2.0], [1.5, -1.5, 3.0, 3.6], [-1.5, 1.5, 4.1, 4.7], [1.5, -1.5, 5.2, 6.0]]) {
      const pts = [];
      for (let i = 0; i <= 10; i++) { const t = i / 10, x = xa + (xb - xa) * t; pts.push(pr(x, ceilY(x) - 0.12 - Math.sin(Math.PI * t) * 0.18, z0 + (z1 - z0) * t)); }
      wire += pl(pts);
    }
    S.add(`<path d="${wire}" fill="none" stroke="#120a06" stroke-width="2" opacity=".8"/>`);
    let glow = '', body = '';
    for (const [x, z, y] of lamps) {
      const top = pr(x, ceilY(x) - 0.14 - 0.1, z), c = pr(x, y, z), k = F / z;
      body += `<path d="M${r0(top[0])},${r0(top[1])}V${r0(c[1] - 0.09 * k)}" stroke="#140c06" stroke-width="${f(Math.max(1, 0.008 * k), 1)}"/>`;
      body += `<path d="M${r0(c[0] - 0.05 * k)},${r0(c[1] - 0.09 * k)}h${r0(0.1 * k)}l${r0(0.025 * k)},${r0(0.09 * k)}h${r0(-0.15 * k)}Z" fill="#5a5048" stroke="#2a2018" stroke-width="1.2"/>`;
      body += `<path d="M${r0(c[0] - 0.05 * k)},${r0(c[1] - 0.06 * k)}h${r0(0.1 * k)}" stroke="#8a7e70" stroke-width="${f(Math.max(1, 0.01 * k), 1)}"/>`;
      body += `<ellipse cx="${r0(c[0])}" cy="${r0(c[1] + 0.012 * k)}" rx="${f(0.06 * k, 1)}" ry="${f(0.022 * k, 1)}" fill="${C.bulb}"/>`;
      glow += `<circle cx="${r0(c[0])}" cy="${r0(c[1] + 0.03 * k)}" r="${r0(0.55 * k)}"/>`;
    }
    const gid = S.rad([[0, C.lamp, 0.42], [0.25, '#ff9a48', 0.16], [1, '#ff9a48', 0]]);
    S.add(`<g fill="${gid}">${glow}</g>${body}`);
    // warm pools on the bench and the floor
    let pools = '';
    for (const [x, z, rx] of [[-0.35, 2.4, 0.5], [-0.3, 3.4, 0.45], [-0.4, 4.4, 0.4]]) { const c = pr(x, 0.86, z), k = F / z; pools += `<ellipse cx="${r0(c[0])}" cy="${r0(c[1])}" rx="${r0(rx * k)}" ry="${r0(rx * k * 0.22)}"/>`; }
    for (const [x, z, rx] of [[0.6, 2.0, 0.6], [0.45, 3.4, 0.55], [0.3, 5.2, 0.5]]) { const c = pr(x, 0, z), k = F / z; pools += `<ellipse cx="${r0(c[0])}" cy="${r0(c[1])}" rx="${r0(rx * k)}" ry="${r0(rx * k * 0.3)}"/>`; }
    S.add(`<g fill="#ffb060" opacity=".14" filter="${S.blur(2)}">${pools}</g>`);
  }

  // ---- one lamp very near, top right, soft --------------------------------------------------------------------------
  {
    const c = [1330, 120];
    S.add(`<circle cx="${c[0]}" cy="${c[1] + 40}" r="230" fill="${S.rad([[0, C.lamp, 0.3], [0.4, '#ff9a48', 0.08], [1, '#ff9a48', 0]])}"/>`);
    S.add(`<g filter="${S.blur(1)}"><path d="M${c[0]},-10V${c[1] - 40}" stroke="#0e0804" stroke-width="5"/><path d="M${c[0] - 52},${c[1] - 40}h104l26,90h-156Z" fill="#3e352c"/><path d="M${c[0] - 52},${c[1] - 14}h104" stroke="#7a6e60" stroke-width="6"/><ellipse cx="${c[0]}" cy="${c[1] + 56}" rx="64" ry="18" fill="${C.bulb}"/></g>`);
  }

  // ---- grading -------------------------------------------------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.3, '#0a0604', 0], [1, '#0a0604', 0.72]], 'cx="0.5" cy="0.48" r="0.78"')}"/>`);
  S.add(`<rect y="640" width="${W}" height="260" fill="${S.lin([[0, '#0a0604', 0], [1, '#0a0604', 0.55]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------------------------------
// silver-rail-roof-night
// ---------------------------------------------------------------------------------------------------------------------
function roofNight() {
  const S = new Scene('sbGdBRoof', '银轨号·车顶·月夜：站在行驶中的列车车顶，顺着车厢望向车头：铆着铆钉的金属车顶板一节节向前延伸，中间一个通风罩，前面是车厢之间的缝隙和下一节车顶，远处车头的驾驶室亮着琥珀色的灯，黑烟向后拖；近处梯子顶上挂着一盏提灯；右上方的月亮缺了一角，紫色月晕里飘着细长的云；星空下，荒野的山影和电线杆被速度拉成模糊的长条；不画人', 4401);
  const R = S.R;
  const HZ = 500, VPX = 760;
  const pr = persp({ vp: [VPX, HZ], F: 820, eye: 1.6 });
  const C = { sky: [[0, '#05061a'], [0.45, '#141238'], [0.78, '#2c2152'], [1, '#463066']], moon: '#efe8ff', halo: '#b58cff', plate: '#3a3f58', plateLit: '#5a6080', plateDark: '#1e2234', seam: '#12141f', rivet: '#8a90b0', lamp: '#ffc070' };
  // custom horizontal motion blur (directional) for the passing silhouettes
  const mb = S.id('mb');
  S.def(`<filter id="${mb}" x="-20%" y="-10%" width="140%" height="120%"><feGaussianBlur stdDeviation="22 1.5"/></filter>`);
  const mb2 = S.id('mbs');
  S.def(`<filter id="${mb2}" x="-20%" y="-10%" width="140%" height="120%"><feGaussianBlur stdDeviation="7 0.6"/></filter>`);

  // ---- sky, stars, moon with a bite out of it, purple halo, thin clouds ---------------------------------------------
  S.add(`<rect width="${W}" height="${HZ + 40}" fill="${S.lin(C.sky)}"/>`);
  {
    let st = '';
    for (let i = 0; i < 170; i++) {
      const x = R() * W, y = R() * (HZ - 60);
      if (Math.hypot(x - 1170, y - 200) < 150) continue;
      st += `<circle cx="${r0(x)}" cy="${r0(y)}" r="${f(R() < 0.06 ? R.range(1.5, 2.2) : R.range(0.5, 1.3), 1)}" opacity="${f(R.range(0.3, 0.95), 2)}"/>`;
    }
    S.add(`<g fill="#e8ddff">${st}</g>`);
    const mx = 1170, my = 200, mr = 64;
    S.add(`<circle cx="${mx}" cy="${my}" r="${mr * 5}" fill="${S.rad([[0, C.halo, 0.42], [0.3, '#8a5ad8', 0.16], [1, '#6a3ab8', 0]])}"/>`);
    S.add(`<circle cx="${mx}" cy="${my}" r="${mr * 1.5}" fill="none" stroke="${C.halo}" stroke-width="3" opacity=".35" filter="${S.blur(1)}"/>`);
    S.add(`<circle cx="${mx}" cy="${my}" r="${mr}" fill="${S.rad([[0, '#ffffff'], [0.7, C.moon], [1, '#cfc2f0']], 'cx="0.42" cy="0.42" r="0.6"')}"/>`);
    S.add(`<circle cx="${r0(mx + mr * 1.02)}" cy="${r0(my - mr * 0.5)}" r="${r0(mr * 0.66)}" fill="#120f30"/>`);
    // thin cloud bands drifting across the halo, lit purple on top
    let cl = '', clHi = '';
    for (const [x, y, w, h] of [[880, 250, 520, 16], [1020, 170, 380, 10], [620, 320, 560, 18], [1180, 300, 420, 12], [240, 140, 360, 10]]) {
      const pts = [];
      for (let i = 0; i <= 8; i++) pts.push([x + w * i / 8, y - h * Math.sin(Math.PI * i / 8) * R.range(0.6, 1)]);
      const bot = [];
      for (let i = 8; i >= 0; i--) bot.push([x + w * i / 8, y + h * 0.35 * Math.sin(Math.PI * i / 8)]);
      cl += pz([...pts, ...bot]);
      clHi += pl(pts.slice(1, 7));
    }
    S.add(`<path d="${cl}" fill="#2a2050" opacity=".85" filter="${S.blur(1)}"/><path d="${clHi}" fill="none" stroke="#c8a8ff" stroke-width="2" opacity=".45"/>`);
  }

  // ---- the wilderness: far ridge, near hills, all streaking past -----------------------------------------------------
  {
    const ridge = (base, amp, seed, step = 40) => {
      const pts = [[-60, HZ + 40]];
      let v = 0;
      for (let x = -60; x <= W + 60; x += step) { v = Math.sin(x / 170 + seed) * 0.5 + Math.sin(x / 61 + seed * 2) * 0.3 + Math.sin(x / 23 + seed * 3) * 0.12; pts.push([x, base - amp * (0.5 + v * 0.5)]); }
      pts.push([W + 60, HZ + 40]);
      return pz(pts);
    };
    S.add(`<path d="${ridge(HZ - 6, 70, 1.3)}" fill="#2a2248"/>`);
    S.add(`<path d="${ridge(HZ + 4, 44, 4.1, 30)}" fill="#1c1734" filter="url(#${mb2})"/>`);
    S.add(`<rect y="${HZ - 2}" width="${W}" height="${H - HZ + 2}" fill="${S.lin([[0, '#15112a'], [1, '#07060e']])}"/>`);
    // near scrub and rocks flying past on both sides of the train, streaked
    let near = '';
    for (let i = 0; i < 26; i++) {
      const side = i % 2 ? 1 : -1, x = side < 0 ? R.range(-80, 520) : R.range(1020, W + 80), y = R.range(HZ + 14, HZ + 190), w = R.range(140, 360), h = R.range(3, 9);
      near += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${r0(w)}" ry="${r0(h)}"/>`;
    }
    S.add(`<g fill="#0c0a18" filter="url(#${mb})">${near}</g>`);
    // speed streaks of moonlight on the ground
    let streak = '';
    for (let i = 0; i < 18; i++) { const y = R.range(HZ + 12, H - 60), x = R.range(-100, W), w = R.range(120, 380); if (x > 420 && x < 1100 && y > HZ + 80) continue; streak += `M${r0(x)},${r0(y)}h${r0(w)}`; }
    S.add(`<path d="${streak}" stroke="#7a6ab0" stroke-width="2" opacity=".22" filter="url(#${mb2})"/>`);
    // telegraph poles on the left, the nearest one blurred by speed
    for (const [x, top, w, blur] of [[540, HZ - 70, 4, false], [430, HZ - 120, 6, false], [250, HZ - 220, 10, true], [-30, HZ - 420, 22, true]]) {
      const bot = HZ + (HZ - top) * 0.28;
      S.add(`<g${blur ? ` filter="url(#${mb})" opacity=".85"` : ''}><path d="M${x},${r0(top)}V${r0(bot)}" stroke="#0a0814" stroke-width="${w}"/><path d="M${r0(x - w * 4)},${r0(top + w * 2)}h${r0(w * 8)}" stroke="#0a0814" stroke-width="${r0(w * 0.8)}"/></g>`);
    }
    S.add(`<path d="M-40,${HZ - 380}Q120,${HZ - 250} 250,${HZ - 205}T430,${HZ - 108}T540,${HZ - 62}" fill="none" stroke="#0a0814" stroke-width="1.5" opacity=".7"/>`);
  }

  // ---- the train ahead: next car roofs, the locomotive with lit cab and smoke ------------------------------------
  {
    // locomotive far ahead
    const lz = 70, lk = 820 / lz, lb = pr(0, -0.3, lz);
    let o = '';
    o += `<path d="M${r0(lb[0] - 1.6 * lk)},${r0(lb[1])}v${r0(-2.0 * lk)}h${r0(1.2 * lk)}v${r0(-0.9 * lk)}h${r0(2.0 * lk)}v${r0(2.9 * lk)}Z" fill="#0c0b18"/>`;
    o += `<rect x="${r0(lb[0] - 1.3 * lk)}" y="${r0(lb[1] - 2.7 * lk)}" width="${r0(0.8 * lk)}" height="${r0(0.6 * lk)}" fill="${C.lamp}"/>`;
    o += `<path d="M${r0(lb[0] + 0.6 * lk)},${r0(lb[1] - 2.9 * lk)}v${r0(-0.9 * lk)}h${r0(0.45 * lk)}v${r0(0.9 * lk)}Z" fill="#0c0b18"/>`;
    o += `<circle cx="${r0(lb[0] - 0.9 * lk)}" cy="${r0(lb[1] - 2.4 * lk)}" r="${r0(2.4 * lk)}" fill="${S.rad([[0, C.lamp, 0.35], [1, C.lamp, 0]])}"/>`;
    S.add(o);
    // smoke trailing back over the train, lit faintly from below
    const sx = lb[0] + 0.8 * lk, sy = lb[1] - 3.8 * lk;
    S.add(`<path d="M${r0(sx)},${r0(sy)}C${r0(sx - 40)},${r0(sy - 30)} ${r0(sx - 160)},${r0(sy - 40)} ${r0(sx - 330)},${r0(sy - 70)}C${r0(sx - 520)},${r0(sy - 100)} ${r0(sx - 760)},${r0(sy - 80)} ${r0(sx - 980)},${r0(sy - 140)}L${r0(sx - 980)},${r0(sy - 60)}C${r0(sx - 700)},${r0(sy - 10)} ${r0(sx - 420)},${r0(sy - 20)} ${r0(sx - 200)},${r0(sy - 8)}C${r0(sx - 90)},${r0(sy)} ${r0(sx - 30)},${r0(sy + 6)} ${r0(sx)},${r0(sy + 4)}Z" fill="#2a2440" opacity=".7" filter="${S.blur(2)}"/>`);
    // the next cars: roofs as strips with car-end gaps
    const half = 1.5;
    const roofStrip = (z0, z1, shade) => `<path d="${pz(pr.poly([[-half, 0, z0], [half, 0, z0], [half, 0, z1], [-half, 0, z1]]))}" fill="${shade}"/>`;
    let cars = '';
    for (const [z0, z1] of [[52, 68], [34, 51], [16.6, 33.2]]) {
      cars += roofStrip(z0, z1, C.plateDark);
      cars += `<path d="${pz(pr.poly([[-half, 0, z0], [half, 0, z0], [half, -0.35, z0], [-half, -0.35, z0]]))}" fill="#0e101c"/>`;
      cars += `<path d="${pl(pr.poly([[0.0, 0.12, z0 + 0.3], [0.0, 0.12, z1]]))}" stroke="${C.plateLit}" stroke-width="1.2" opacity=".5"/>`;
    }
    S.add(cars);
  }

  // ---- our car's roof: cambered riveted plates running away from us -------------------------------------------------
  {
    const half = 1.5, Zn = 2.4, Zf = 16.0;
    const camber = (x) => 0.16 * (1 - (x / half) ** 2);
    const xs = [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5];
    let o = '';
    for (let i = 0; i < xs.length - 1; i++) {
      const xa = xs[i], xb = xs[i + 1];
      const col = ['#1c2032', '#242a3e', '#2e344c', '#3a4060', '#474e72', '#555c80'][i];
      o += `<path d="${pz(pr.poly([[xa, camber(xa), Zn], [xb, camber(xb), Zn], [xb, camber(xb), Zf], [xa, camber(xa), Zf]]))}" fill="${col}"/>`;
    }
    S.add(o);
    // moonlight sheen along the crown (light from the upper right)
    S.add(`<path d="${pz(pr.poly([[0.15, 0.161, Zn], [0.9, 0.11, Zn], [0.5, 0.135, Zf], [0.1, 0.16, Zf]]))}" fill="#c8b8ff" opacity=".12" filter="${S.blur(2)}"/>`);
    // seams: longitudinal and transverse
    let seam = '';
    for (const x of xs.slice(1, -1)) seam += pl(pr.poly([[x, camber(x) + 0.002, Zn], [x, camber(x) + 0.002, Zf]]));
    for (let z = Zn + 0.4; z < Zf; z += 1.15) seam += pl(xs.map((x) => pr(x, camber(x) + 0.002, z)));
    S.add(`<path d="${seam}" fill="none" stroke="${C.seam}" stroke-width="2" opacity=".85"/>`);
    // rivets along the transverse seams, bigger near us
    let rv = '', rvHi = '';
    for (let z = Zn + 0.4; z < 11; z += 1.15) {
      for (let x = -1.42; x <= 1.42; x += 0.16) {
        const p = pr(x, camber(x) + 0.004, z - 0.05), k = 820 / z, r = Math.max(0.8, 0.014 * k);
        rv += `<circle cx="${r0(p[0])}" cy="${r0(p[1])}" r="${f(r, 1)}"/>`;
        if (k > 160) rvHi += `<circle cx="${f(p[0] + r * 0.3, 1)}" cy="${f(p[1] - r * 0.3, 1)}" r="${f(r * 0.45, 1)}"/>`;
      }
    }
    S.add(`<g fill="${C.seam}">${rv}</g><g fill="${C.rivet}" opacity=".7">${rvHi}</g>`);
    // the roof edges: drip rails catching the moon
    S.add(`<path d="${pl(pr.poly([[half, 0.0, Zn], [half, 0.0, Zf]]))}" stroke="#9a92c8" stroke-width="3" opacity=".6"/><path d="${pl(pr.poly([[-half, 0.0, Zn], [-half, 0.0, Zf]]))}" stroke="#4a4870" stroke-width="3" opacity=".6"/>`);
    // car end and the gap before the next car
    S.add(`<path d="${pz(pr.poly([[-half, 0, Zf], [half, 0, Zf], [half, -0.45, Zf], [-half, -0.45, Zf]]))}" fill="#0a0b14"/>`);
    // a ventilator hump on the crown
    {
      const z0 = 7.2, z1 = 8.4, w = 0.32, h = 0.22;
      const a = pr(-w, camber(0), z0), b = pr(w, camber(0), z0), t = pr(0, camber(0) + h, z0), t2 = pr(0, camber(0) + h, z1);
      S.add(`<path d="M${r0(a[0])},${r0(a[1])}Q${r0(a[0])},${r0(t[1])} ${r0(t[0])},${r0(t[1])}L${r0(t2[0])},${r0(t2[1])}L${r0(pr(w, camber(0), z1)[0])},${r0(pr(w, camber(0), z1)[1])}L${r0(b[0])},${r0(b[1])}Z" fill="${C.plateDark}" stroke="${C.seam}" stroke-width="2"/>`);
      S.add(`<path d="M${r0(a[0])},${r0(a[1])}Q${r0(a[0])},${r0(t[1])} ${r0(t[0])},${r0(t[1])}Q${r0(b[0])},${r0(t[1])} ${r0(b[0])},${r0(b[1])}Z" fill="${C.plate}" stroke="${C.seam}" stroke-width="2"/>`);
      S.add(`<path d="M${r0(t[0])},${r0(t[1])}Q${r0(b[0])},${r0(t[1])} ${r0(b[0])},${r0(b[1])}" fill="none" stroke="#b8acf0" stroke-width="2" opacity=".55"/>`);
    }
  }

  // ---- near: the ladder top with its grab rails and a marker lantern (amber) -----------------------------------------
  {
    const g = '#141626', gl = '#7a78a8';
    S.add(`<path d="M1340,900V720Q1340,660 1400,660H1470Q1530,660 1530,720V900" fill="none" stroke="${g}" stroke-width="18" stroke-linecap="round"/><path d="M1340,900V720Q1340,660 1400,660H1470" fill="none" stroke="${gl}" stroke-width="3" opacity=".6"/>`);
    S.add(`<path d="M1470,660V610" stroke="${g}" stroke-width="8"/><path d="M1452,610h36" stroke="${g}" stroke-width="6"/>`);
    S.add(`<circle cx="1470" cy="640" r="170" fill="${S.rad([[0, C.lamp, 0.38], [0.35, '#ff9a48', 0.12], [1, '#ff9a48', 0]])}"/>`);
    S.add(`<path d="M1448,612h44l-6,16h-32Z" fill="#2a2018"/><rect x="1446" y="628" width="48" height="44" rx="6" fill="#ffd890" stroke="#3a2a18" stroke-width="4"/><path d="M1470,628v44M1446,650h48" stroke="#3a2a18" stroke-width="3"/><path d="M1444,672h52l-6,10h-40Z" fill="#2a2018"/>`);
    S.add(`<ellipse cx="1430" cy="760" rx="160" ry="40" fill="#ffb060" opacity=".1" filter="${S.blur(2)}"/>`);
  }

  // ---- grading: cold vignette, darker foreground --------------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.35, '#04040c', 0], [1, '#04040c', 0.7]], 'cx="0.55" cy="0.45" r="0.8"')}"/>`);
  S.add(`<rect y="720" width="${W}" height="180" fill="${S.lin([[0, '#04040c', 0], [1, '#04040c', 0.5]])}"/>`);
  return S.out();
}

export const gaidenBBgs = {
  'silver-rail-luggage-workshop': () => workshop(),
  'silver-rail-roof-night': () => roofNight(),
};
