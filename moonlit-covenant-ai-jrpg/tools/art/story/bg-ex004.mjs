// 番外 ex004 的场景背景（剧本/番外/ex004演武場的操練日.md〈美術需求〉）：holy-city-knights-drill-ground（白塔圣都·骑士团演武场·白天）、holy-city-knights-drill-ground-dusk（白塔圣都·骑士团演武场·黄昏）。
//   holy-city-knights-drill-ground      — 骑士团演武场·白天 (ex004-02 … ex004-05): raked sand running back to a high white
//                                         city wall with crenels; above the wall, far off, the upper half of the white
//                                         tower; on the left a wooden grandstand (four benches under a plank roof, its
//                                         first pillar nearest), pennants along the eave; a row of wooden post targets
//                                         crossing the sand on a diagonal, each with three painted rings; on the right a
//                                         scoreboard on two legs — rows of peg holes, pegs in some, no letters; straw
//                                         archery butts against the wall; a rack of wooden practice swords; two sandbags
//                                         and a small table with an hourglass in front. Flat light, white and sand. No one.
//   holy-city-knights-drill-ground-dusk — the same at dusk (ex004-06): the stands empty, the white wall gone orange, long
//                                         shadows to the right across the rake lines, only the last row of pegs left on
//                                         the board. No one.
// No text anywhere: the board is holes and pegs, the target faces are rings.
import { Scene, W, H, f, persp, mix, rng, cloud, star7 } from './lib.mjs';

const f1 = (v) => f(v, 1);
const pz1 = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L') + 'Z';
const circ = (cx, cy, r) => `M${f1(cx - r)},${f1(cy)}a${f1(r)},${f1(r)} 0 1 0 ${f1(r * 2)},0a${f1(r)},${f1(r)} 0 1 0 ${f1(-r * 2)},0Z`;
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;

const PAL = {
  day: {
    sky: [[0, '#c9d8e6'], [0.55, '#e4e8e6'], [1, '#f2ece0']],
    cloud: { lit: '#f8f6f0', shade: '#d4d9df', rim: '#ffffff' },
    tower: '#f4f2ec', towerShade: '#ccc9c1', band: '#c2beb4',
    wall: { lit: '#ece8de', mid: '#d8d3c7', shade: '#b2ada2', joint: '#c3beb2', top: '#f6f3ec' },
    sand: { far: '#e4d8be', near: '#ccb892', rake: '#b39c76', pebble: '#a08c6a' },
    wood: { lit: '#ab895f', mid: '#88694b', shade: '#5f4935', deep: '#3e3024' },
    roof: '#8c5c46', roofShade: '#6a4434', straw: '#d8bc72', strawShade: '#b0924e',
    ring: ['#f2ece0', '#b8463c', '#d9b04a'], ringLine: '#4a3a2c',
    board: '#3e4a52', hole: '#232c2c', peg: '#ead6a2',
    pennant: ['#d9b04a', '#7aa0c8', '#f2ece0'], cloth: '#e8e2d4', sack: '#c8b48a', sackShade: '#9a8462',
    shadow: '#6a5a42', shadowOp: 0.22, shadowLen: 0.35, light: null,
  },
  dusk: {
    sky: [[0, '#6a587c'], [0.45, '#d48e6a'], [1, '#f0b676']],
    cloud: { lit: '#f2b68a', shade: '#9a6c7c', rim: '#ffd6a6' },
    tower: '#f6c89e', towerShade: '#a67c84', band: '#c4947c',
    wall: { lit: '#eebd94', mid: '#d29e80', shade: '#98706e', joint: '#bc8872', top: '#f8d2a8' },
    sand: { far: '#d6a27a', near: '#a67a5c', rake: '#86604a', pebble: '#7a5444' },
    wood: { lit: '#9c6c48', mid: '#764e38', shade: '#4e3428', deep: '#33241c' },
    roof: '#7a4434', roofShade: '#56302a', straw: '#d8a464', strawShade: '#a07444',
    ring: ['#efc6a2', '#a63e38', '#e2a646'], ringLine: '#3e2a24',
    board: '#383844', hole: '#201c24', peg: '#f0c88e',
    pennant: ['#e2a646', '#8a7aa8', '#efc6a2'], cloth: '#e6bc98', sack: '#b88e66', sackShade: '#80604a',
    shadow: '#3e2630', shadowOp: 0.34, shadowLen: 2.4, light: '#ffcf8e',
  },
};

const VP = [800, 430], F = 900, EYE = 1.7;
const pr = persp({ vp: VP, F, eye: EYE });
const P2 = (X, Y, Z) => pr(X, Y, Z);
const quad = (pts) => pz1(pts.map(([X, Y, Z]) => P2(X, Y, Z)));
const WALL_Z = 40, WALL_H = 9;
const yAt = (Y, Z) => VP[1] - (Y - EYE) / Z * F;
// layout: the grandstand, the scoreboard and the post targets (metres; ground Y = 0, camera at Z = 0)
const ST = { Z0: 12, Z1: 36, Xf: -8, step: 1.5, rise: 0.62, tiers: 4, roofY: 5.4 };
const SB = { X: 7.4, Z: 11.5, bw: 2.7, Y0: 1.0, Y1: 2.45 };
const POSTS = [[4.6, 25], [3.5, 20.5], [2.2, 16.2], [0.6, 12.6], [-1.4, 9.4]];

function drill(dusk) {
  const C = dusk ? PAL.dusk : PAL.day;
  const S = new Scene(dusk ? 'sbEx004DrillDusk' : 'sbEx004Drill', dusk
    ? '白塔圣都·骑士团演武场·黄昏：同一座演武场，看台空着，白色的城墙染成橙色；木桩靶、计分板、看台柱子的影子长长地拖向右边，扫过沙地上的耙痕；计分板上只剩最后一排木钉；城墙上方远处的白塔一片暖色；没有人'
    : '白塔圣都·骑士团演武场·白天：耙平的沙地一直铺到高高的白色城墙脚下，墙上一排墙垛，墙外远处露出白塔的上半段；左边一座木造看台，四层长凳、木板屋顶，第一根柱子在最前面，檐下挂着三角小旗；一排木桩靶斜斜穿过沙地，每根桩上画着三个圈；右边两条腿撑着的计分板，一排排钉孔，有些插着木钉，不写字；墙根有草靶和一排木剑架，前面两袋沙和一张放着沙漏的小桌；光很平，白与沙色，没有人', dusk ? 40412 : 40402);
  const R = rng(dusk ? 40413 : 40403);
  const { wall, sand, wood } = C;
  const wallTop = yAt(WALL_H, WALL_Z), wallBase = yAt(0, WALL_Z);

  // sky
  S.add(`<rect width="${W}" height="${Math.ceil(wallBase) + 2}" fill="${S.lin(C.sky)}"/>`);
  if (dusk) S.add(`<ellipse cx="260" cy="${f1(wallTop - 10)}" rx="520" ry="200" fill="${S.rad([[0, C.light, 0.55], [1, C.light, 0]])}"/>`);
  // clouds
  {
    const Rc = rng(dusk ? 40414 : 40404);
    let cl = '';
    for (const [x, y, w, h] of [[80, 120, 300, 70], [520, 80, 220, 52], [1240, 140, 340, 78], [920, 196, 180, 40]]) cl += cloud(Rc, x, y, w, h, C.cloud, { bumps: 6, light: -1 });
    S.add(`<g opacity="${dusk ? 0.85 : 0.9}">${cl}</g>`);
  }

  // the white tower far beyond the wall, its top lost in a cloud bank
  {
    const cx = 1080, y1 = wallTop + 6, y0 = -40, w0 = 30, w1 = 42;
    S.add(`<path d="${pz1([[cx - w0, y0], [cx + w0, y0], [cx + w1, y1], [cx - w1, y1]])}" fill="${S.lin([[0, C.towerShade], [0.35, C.tower], [0.7, C.tower], [1, C.towerShade]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    let d = '', sl = '';
    for (let y = y0 + 40; y < y1; y += 44) { const t = (y - y0) / (y1 - y0), w = w0 + (w1 - w0) * t; d += `M${f1(cx - w)},${f1(y)}H${f1(cx + w)}`; }
    for (let y = 30; y < y1 - 30; y += 88) sl += `M${f1(cx - 4)},${f1(y)}h8v22h-8z`;
    S.add(`<path d="${d}" stroke="${C.band}" stroke-width="2"/><path d="${sl}" fill="${wall.shade}" opacity=".6"/>`);
    let cb = '';
    for (let x = cx - 160; x < cx + 180; x += R.range(46, 70)) cb += circ(x, R.range(-6, 22), R.range(30, 48));
    S.add(`<path d="${cb}" fill="${C.cloud.shade}" opacity=".7" transform="translate(0 14)"/><path d="${cb}" fill="${C.cloud.lit}"/>`);
  }

  // the city wall: face, ashlar courses, crenels, two buttresses and a small shut door
  {
    S.add(`<rect x="0" y="${f1(wallTop)}" width="${W}" height="${f1(wallBase - wallTop + 1)}" fill="${S.lin([[0, wall.lit], [0.75, wall.mid], [1, wall.shade]])}"/>`);
    let cr = '';
    const cw = 34, cg = 22;
    for (let x = -10; x < W; x += cw + cg) cr += `M${f1(x)},${f1(wallTop)}v-22h${cw}v22z`;
    S.add(`<path d="${cr}" fill="${wall.lit}"/><path d="M0,${f1(wallTop)}H${W}" stroke="${wall.shade}" stroke-width="3"/><path d="M0,${f1(wallTop + 3)}H${W}" stroke="${wall.top}" stroke-width="2" opacity=".7"/>`);
    let j = '';
    const rowH = (wallBase - wallTop) / 8;
    for (let k = 1; k < 8; k++) {
      const y = wallTop + rowH * k;
      j += `M0,${f1(y)}H${W}`;
      for (let x = (k % 2) * 36; x < W; x += 72) j += `M${f1(x)},${f1(y - rowH)}V${f1(y)}`;
    }
    S.add(`<path d="${j}" stroke="${wall.joint}" stroke-width="1.4" opacity=".75"/>`);
    // buttresses (slightly proud of the wall)
    for (const bx of [300, 1460]) {
      S.add(`<path d="${pz1([[bx, wallTop - 30], [bx + 46, wallTop - 30], [bx + 52, wallBase], [bx - 6, wallBase]])}" fill="${wall.lit}"/><path d="${pz1([[bx + 34, wallTop - 30], [bx + 46, wallTop - 30], [bx + 52, wallBase], [bx + 38, wallBase]])}" fill="${wall.shade}" opacity=".7"/>`);
    }
    // a small shut postern door with iron bands, under a round arch
    const dx = 1180, dw = 54, dh = 74;
    S.add(`<path d="M${dx},${f1(wallBase)}v${-dh + dw / 2}a${dw / 2},${dw / 2} 0 0 1 ${dw},0v${dh - dw / 2}z" fill="${wood.shade}"/><path d="M${dx},${f1(wallBase - 22)}h${dw}M${dx},${f1(wallBase - 50)}h${dw}" stroke="${wood.deep}" stroke-width="3"/><path d="M${dx - 6},${f1(wallBase)}v${-dh + dw / 2}a${dw / 2 + 6},${dw / 2 + 6} 0 0 1 ${dw + 12},0v${dh - dw / 2}" fill="none" stroke="${wall.shade}" stroke-width="4"/>`);
    // a seven-pointed star carved over the door
    S.add(`<path d="${star7(dx + dw / 2, wallBase - dh - 22, 9)}" fill="${wall.shade}" opacity=".8"/>`);
    // wall foot shadow line
    S.add(`<rect x="0" y="${f1(wallBase - 6)}" width="${W}" height="7" fill="${wall.shade}" opacity=".45"/>`);
  }

  // sand: ground plane, wavy rake lines running across the field (closer together with distance), trampled patches, pebbles
  {
    S.add(`<rect x="0" y="${f1(wallBase)}" width="${W}" height="${f1(H - wallBase)}" fill="${S.lin([[0, sand.far], [1, sand.near]])}"/>`);
    const wave = rng(dusk ? 40416 : 40407);
    let rk = '', rk2 = '';
    let row = 0;
    for (let Z = 3.1; Z < WALL_Z - 1; Z *= 1.075, row++) {
      const y0 = yAt(0, Z), amp = Math.min(3.2, 26 / Z), ph = wave.range(0, 6.28), per = wave.range(170, 260);
      let d = '';
      for (let x = -20; x <= W + 20; x += 40) d += `${x === -20 ? 'M' : 'L'}${f1(x)},${f1(y0 + Math.sin(ph + x / per * 6.28) * amp)}`;
      if (row % 3 === 2) rk2 += d; else rk += d;
    }
    S.add(`<path d="${rk}" fill="none" stroke="${sand.rake}" stroke-width="1.2" opacity=".24"/><path d="${rk2}" fill="none" stroke="${sand.rake}" stroke-width="2" opacity=".2"/>`);
    // trampled sand around the post targets, the archery line and the sandbag lane
    let tp = '';
    for (const [X, Z] of POSTS) { const [x, y] = P2(X, 0, Z), rx = 1.1 / Z * F, ry = rx * 0.16; tp += ell(x + rx * 0.2, y, rx, ry); }
    { const [x, y] = P2(-2.5, 0, WALL_Z - 6), rx = 6 / (WALL_Z - 6) * F; tp += ell(x, y, rx, rx * 0.05); }
    { const [x, y] = P2(1, 0, 17), rx = 9 / 17 * F; tp += ell(x, y, rx, rx * 0.07); }
    S.add(`<path d="${tp}" fill="${sand.rake}" opacity=".16"/>`);
    let pb = '';
    const Rp = rng(dusk ? 40415 : 40405);
    for (let i = 0; i < 70; i++) {
      const Z = Rp.range(4, 34), X = Rp.range(-14, 16), [x, y] = P2(X, 0, Z);
      const r = Math.max(0.8, 9 / Z * Rp.range(0.6, 1.3));
      pb += ell(x, y, r * 1.6, r * 0.7);
    }
    S.add(`<path d="${pb}" fill="${sand.pebble}" opacity=".55"/>`);
  }

  // shadows cast on the sand (short at noon, long to the right at dusk); one shared path
  let shadowD = '';
  const castPost = (X, Z, h, w) => {
    const L = h * C.shadowLen;
    // the strip runs away from the low sun (to the right and a little back); its width is across that direction
    const k = 0.45, a = P2(X, 0, Z - w), b = P2(X, 0, Z + w), c = P2(X + L, 0, Z + w + L * k), d = P2(X + L, 0, Z - w + L * k);
    shadowD += pz1([a, b, c, d]);
  };
  {
    for (let Z = ST.Z0; Z <= ST.Z1 + 0.01; Z += 6) castPost(ST.Xf + 0.3, Z, ST.roofY * 0.7, 0.16);
    castPost(SB.X - SB.bw / 2 + 0.25, SB.Z, 2.4, 0.08); castPost(SB.X + SB.bw / 2 - 0.25, SB.Z, 2.4, 0.08);
    for (const [X, Z] of POSTS) castPost(X, Z, 1.9, 0.18);
    for (const [X, Z] of [[2.4, 6.4], [3.3, 6.9]]) castPost(X, Z, 0.4, 0.28);
    castPost(-2.9, 7.5, 0.9, 0.42);
    {
      // the grandstand's roof throws one wide shadow out from its front edge
      const Ls = ST.roofY * C.shadowLen * 0.55, k = 0.45, X = ST.Xf + 0.6;
      shadowD += pz1([P2(X, 0, ST.Z0), P2(X, 0, ST.Z1), P2(X + Ls, 0, ST.Z1 + Ls * k), P2(X + Ls, 0, ST.Z0 + Ls * k)]);
    }
    S.add(`<path d="${shadowD}" fill="${C.shadow}" opacity="${C.shadowOp}"/>`);
  }

  // straw archery butts against the wall, on low trestles
  {
    let st = '', tr = '', rings = '';
    for (const X of [-6.5, -3, 0.5]) {
      const Z = WALL_Z - 3, [x, yb] = P2(X, 0, Z), r = 0.62 / Z * F, [, yc] = P2(X, 1.15, Z);
      tr += `M${f1(x - r * 0.9)},${f1(yb)}L${f1(x - r * 0.3)},${f1(yc)}M${f1(x + r * 0.9)},${f1(yb)}L${f1(x + r * 0.3)},${f1(yc)}`;
      st += circ(x, yc, r);
      rings += circ(x, yc, r * 0.66) + circ(x, yc, r * 0.33);
    }
    S.add(`<path d="${tr}" stroke="${wood.shade}" stroke-width="3"/><path d="${st}" fill="${C.straw}"/><path d="${rings}" fill="none" stroke="${C.ring[1]}" stroke-width="2" opacity=".85"/>`);
  }

  // rack of wooden practice swords leaning on the wall
  {
    const Z = WALL_Z - 1.2, X0 = 3.2, X1 = 7.6;
    const a = P2(X0, 1.1, Z), b = P2(X1, 1.1, Z), a0 = P2(X0, 0, Z), b0 = P2(X1, 0, Z), a1 = P2(X0, 0.5, Z), b1 = P2(X1, 0.5, Z);
    let sw = '';
    for (let k = 0; k < 9; k++) {
      const X = X0 + 0.25 + k * (X1 - X0 - 0.5) / 8, top = P2(X + 0.08, 1.55, Z), bot = P2(X, 0.06, Z);
      sw += `M${f1(bot[0])},${f1(bot[1])}L${f1(top[0])},${f1(top[1])}`;
    }
    S.add(`<path d="${sw}" stroke="${wood.lit}" stroke-width="3" stroke-linecap="round"/><path d="M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}M${f1(a1[0])},${f1(a1[1])}L${f1(b1[0])},${f1(b1[1])}M${f1(a0[0])},${f1(a0[1])}V${f1(a[1])}M${f1(b0[0])},${f1(b0[1])}V${f1(b[1])}" stroke="${wood.shade}" stroke-width="3.4"/>`);
  }

  // the grandstand on the left: four benches stepping up and back, a plank roof on posts, pennants on the eave
  {
    const out = [];
    // back wall of the stand
    const Xb = ST.Xf - ST.step * ST.tiers - 0.4;
    out.push(`<path d="${quad([[Xb, 0, ST.Z0], [Xb, ST.roofY, ST.Z0], [Xb, ST.roofY, ST.Z1], [Xb, 0, ST.Z1]])}" fill="${wood.shade}"/>`);
    // tiers: riser (vertical face toward the field) then the seat (horizontal)
    for (let i = 0; i < ST.tiers; i++) {
      const Xr = ST.Xf - ST.step * i, Y0 = i === 0 ? 0 : 0.35 + ST.rise * (i - 1) + 0.25, Y1 = 0.35 + ST.rise * i + 0.25;
      out.push(`<path d="${quad([[Xr, Y0, ST.Z0], [Xr, Y1, ST.Z0], [Xr, Y1, ST.Z1], [Xr, Y0, ST.Z1]])}" fill="${wood.mid}"/>`);
      out.push(`<path d="${quad([[Xr, Y1, ST.Z0], [Xr - ST.step, Y1, ST.Z0], [Xr - ST.step, Y1, ST.Z1], [Xr, Y1, ST.Z1]])}" fill="${wood.lit}"/>`);
      // plank seams on the seat
      let seam = '';
      for (const t of [0.33, 0.66]) { const Xs = Xr - ST.step * t, p = P2(Xs, Y1, ST.Z0), q = P2(Xs, Y1, ST.Z1); seam += `M${f1(p[0])},${f1(p[1])}L${f1(q[0])},${f1(q[1])}`; }
      out.push(`<path d="${seam}" stroke="${wood.shade}" stroke-width="1.2" opacity=".55"/>`);
      // the riser's edge highlight
      const e0 = P2(Xr, Y1, ST.Z0), e1 = P2(Xr, Y1, ST.Z1);
      out.push(`<path d="M${f1(e0[0])},${f1(e0[1])}L${f1(e1[0])},${f1(e1[1])}" stroke="${mix(wood.lit, '#ffffff', 0.25)}" stroke-width="1.6" opacity=".8"/>`);
    }
    // the near end: a side panel in profile (stepped)
    {
      const pts = [[ST.Xf, 0]];
      for (let i = 0; i < ST.tiers; i++) {
        const Xr = ST.Xf - ST.step * i, Y1 = 0.35 + ST.rise * i + 0.25;
        pts.push([Xr, Y1], [Xr - ST.step, Y1]);
      }
      pts.push([Xb, ST.roofY - 0.6], [Xb, 0]);
      out.push(`<path d="${pz1(pts.map(([X, Y]) => P2(X, Y, ST.Z0)))}" fill="${wood.shade}"/>`);
    }
    // roof plane (seen from below: we see the underside as a dark band) and its front fascia
    const Xo = ST.Xf + 0.6;
    out.push(`<path d="${quad([[Xo, ST.roofY, ST.Z0], [Xb, ST.roofY + 0.8, ST.Z0], [Xb, ST.roofY + 0.8, ST.Z1], [Xo, ST.roofY, ST.Z1]])}" fill="${C.roofShade}"/>`);
    out.push(`<path d="${quad([[Xo, ST.roofY, ST.Z0], [Xo, ST.roofY + 0.32, ST.Z0], [Xo, ST.roofY + 0.32, ST.Z1], [Xo, ST.roofY, ST.Z1]])}" fill="${C.roof}"/>`);
    // posts along the front edge; the first (nearest) pillar is the one the names are carved on
    let posts = '';
    for (let Z = ST.Z0; Z <= ST.Z1 + 0.01; Z += 6) {
      const w = 0.16, a = P2(ST.Xf + 0.3 - w, 0, Z), b = P2(ST.Xf + 0.3 + w, ST.roofY, Z);
      posts += `M${f1(a[0])},${f1(a[1])}H${f1(b[0])}V${f1(b[1])}H${f1(a[0])}Z`;
    }
    out.push(`<path d="${posts}" fill="${wood.mid}"/>`);
    {
      // the first pillar, nearer and thicker, lit on its left face, with a faint band of carved marks (not letters)
      const w = 0.22, Z = ST.Z0, x0 = P2(ST.Xf + 0.3 - w, 0, Z), x1 = P2(ST.Xf + 0.3 + w, ST.roofY, Z), xm = P2(ST.Xf + 0.3, 0, Z);
      out.push(`<path d="M${f1(x0[0])},${f1(x0[1])}H${f1(x1[0])}V${f1(x1[1])}H${f1(x0[0])}Z" fill="${wood.mid}"/><path d="M${f1(x0[0])},${f1(x0[1])}H${f1(xm[0] - 2)}V${f1(x1[1])}H${f1(x0[0])}Z" fill="${wood.lit}"/>`);
      let marks = '';
      for (let k = 0; k < 6; k++) { const y = yAt(2.9 - k * 0.22, Z); marks += `M${f1(x0[0] + 5)},${f1(y)}h${f1(x1[0] - x0[0] - 10 - (k % 3) * 4)}`; }
      out.push(`<path d="${marks}" stroke="${wood.deep}" stroke-width="1.6" opacity=".55"/>`);
    }
    // pennants strung along the eave
    {
      const e = [], n = 16;
      for (let i = 0; i <= n; i++) { const Z = ST.Z0 + (ST.Z1 - ST.Z0) * i / n; e.push(P2(Xo, ST.roofY - 0.05, Z)); }
      let tri = ['', '', ''];
      for (let i = 0; i < n; i++) {
        const [ax, ay] = e[i], [bx, by] = e[i + 1], mx = (ax + bx) / 2, sag = 0.5 / (ST.Z0 + (ST.Z1 - ST.Z0) * (i + 0.5) / n) * F;
        tri[i % 3] += pz1([[ax, ay], [bx, by], [mx, (ay + by) / 2 + sag]]);
      }
      out.push(`<path d="${pz1(e.map((p) => p)).replace(/Z$/, '')}" fill="none" stroke="${wood.deep}" stroke-width="1"/>`);
      tri.forEach((d, k) => out.push(`<path d="${d}" fill="${C.pennant[k]}"/>`));
    }
    S.add(out.join(''));
  }

  // the scoreboard on the right: a framed slate panel on two legs; rows of holes, some pegged; no letters
  {
    const { X, Z, bw, Y0, Y1 } = SB;
    const tl = P2(X - bw / 2, Y1, Z), br = P2(X + bw / 2, Y0, Z), legL = P2(X - bw / 2 + 0.25, 0, Z), legR = P2(X + bw / 2 - 0.25, 0, Z);
    const out = [];
    out.push(`<path d="M${f1(legL[0])},${f1(legL[1])}V${f1(br[1])}M${f1(legR[0])},${f1(legR[1])}V${f1(br[1])}" stroke="${wood.shade}" stroke-width="9"/>`);
    out.push(`<rect x="${f1(tl[0] - 8)}" y="${f1(tl[1] - 8)}" width="${f1(br[0] - tl[0] + 16)}" height="${f1(br[1] - tl[1] + 16)}" fill="${wood.mid}"/><rect x="${f1(tl[0] - 8)}" y="${f1(tl[1] - 8)}" width="${f1(br[0] - tl[0] + 16)}" height="5" fill="${wood.lit}"/>`);
    out.push(`<rect x="${f1(tl[0])}" y="${f1(tl[1])}" width="${f1(br[0] - tl[0])}" height="${f1(br[1] - tl[1])}" fill="${C.board}"/>`);
    // a seven-pointed star burnt into the frame's top, the order's mark
    out.push(`<path d="${star7((tl[0] + br[0]) / 2, tl[1] - 22, 10)}" fill="${C.ring[2]}"/>`);
    const rows = 4, cols = 12, padX = 14, padY = 14;
    const cw = (br[0] - tl[0] - padX * 2) / (cols - 1), rh = (br[1] - tl[1] - padY * 2) / (rows - 1);
    let holes = '', pegs = '', pegShade = '';
    const Rq = rng(40406);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = tl[0] + padX + c * cw, y = tl[1] + padY + r * rh;
        const pegged = dusk ? r === rows - 1 && c < 9 : (r < 3 && c < [7, 6, 6][r]) || (r === 3 && Rq() < 0.2);
        if (pegged) { pegs += circ(x, y, 4.2); pegShade += circ(x + 1.2, y + 1.4, 4.2); } else holes += circ(x, y, 2.6);
      }
    }
    out.push(`<path d="${holes}" fill="${C.hole}"/>${pegShade ? `<path d="${pegShade}" fill="#000" opacity=".3"/>` : ''}${pegs ? `<path d="${pegs}" fill="${C.peg}"/>` : ''}`);
    // a little shelf with the box of pegs under the board
    const sh0 = P2(X - 0.6, 0.85, Z), sh1 = P2(X + 0.2, 0.85, Z);
    out.push(`<path d="M${f1(sh0[0])},${f1(sh0[1])}H${f1(sh1[0])}" stroke="${wood.shade}" stroke-width="5"/><rect x="${f1(sh0[0] + 8)}" y="${f1(sh0[1] - 14)}" width="30" height="14" fill="${wood.lit}"/><rect x="${f1(sh0[0] + 8)}" y="${f1(sh0[1] - 14)}" width="30" height="4" fill="${wood.deep}" opacity=".5"/>`);
    S.add(out.join(''));
  }

  // the row of post targets crossing the sand on a diagonal (far first so near ones overlap)
  {
    const out = [];
    for (const [X, Z] of POSTS) {
      const w = 0.17, [xl, yb] = P2(X - w, 0, Z), [xr, yt] = P2(X + w, 1.9, Z), cx = (xl + xr) / 2;
      const cap = (xr - xl) / 2;
      out.push(`<path d="M${f1(xl)},${f1(yb)}V${f1(yt)}A${f1(cap)},${f1(cap * 0.4)} 0 0 1 ${f1(xr)},${f1(yt)}V${f1(yb)}Z" fill="${wood.mid}"/>`);
      out.push(`<path d="M${f1(xl)},${f1(yb)}V${f1(yt)}H${f1(cx - cap * 0.3)}V${f1(yb)}Z" fill="${wood.lit}"/><path d="M${f1(xr - cap * 0.45)},${f1(yb)}V${f1(yt)}H${f1(xr)}V${f1(yb)}Z" fill="${wood.shade}"/>`);
      out.push(`<path d="${ell(cx, yt, cap, cap * 0.4)}" fill="${wood.lit}"/>`);
      // the painted target face: three rings on a round board strapped to the post
      const [, yc] = P2(X, 1.35, Z), r = 0.36 / Z * F;
      out.push(`<path d="${circ(cx, yc, r)}" fill="${C.ring[0]}" stroke="${C.ringLine}" stroke-width="${f1(Math.max(1, r * 0.06))}"/><path d="${circ(cx, yc, r * 0.66)}" fill="${C.ring[1]}"/><path d="${circ(cx, yc, r * 0.33)}" fill="${C.ring[2]}"/>`);
      out.push(`<path d="M${f1(cx - r * 0.98)},${f1(yc - r * 0.15)}a${f1(r)},${f1(r)} 0 0 1 ${f1(r * 0.7)},${f1(-r * 0.7)}" fill="none" stroke="#ffffff" stroke-width="${f1(Math.max(1, r * 0.08))}" opacity=".45"/>`);
      // sword nicks on the post and on the rings (a few short dark strokes)
      let nk = '';
      for (let k = 0; k < 3; k++) { const yy = yc + r * (0.2 + k * 0.25), xx = cx + R.range(-r * 0.5, r * 0.3); nk += `M${f1(xx)},${f1(yy)}l${f1(r * 0.3)},${f1(-r * 0.12)}`; }
      out.push(`<path d="${nk}" stroke="${C.ringLine}" stroke-width="${f1(Math.max(0.8, r * 0.05))}" opacity=".6"/>`);
    }
    S.add(out.join(''));
  }

  // foreground props: two sandbags, the little table with the hourglass, a leaning rake
  {
    const out = [];
    // sandbags
    for (const [X, Z, s] of [[2.4, 6.4, 1], [3.3, 6.9, 0.92]]) {
      const [x, y] = P2(X, 0, Z), w = 0.55 / Z * F * s, h = 0.34 / Z * F * s;
      out.push(`<path d="M${f1(x - w)},${f1(y)}Q${f1(x - w * 1.08)},${f1(y - h * 1.1)} ${f1(x - w * 0.4)},${f1(y - h * 1.15)}Q${f1(x)},${f1(y - h * 1.35)} ${f1(x + w * 0.45)},${f1(y - h * 1.1)}Q${f1(x + w * 1.1)},${f1(y - h)} ${f1(x + w)},${f1(y)}Z" fill="${C.sack}"/>`);
      out.push(`<path d="M${f1(x + w * 0.1)},${f1(y)}Q${f1(x + w * 0.7)},${f1(y - h * 0.9)} ${f1(x + w)},${f1(y)}Z" fill="${C.sackShade}"/><path d="M${f1(x - w * 0.35)},${f1(y - h * 1.15)}q${f1(w * 0.1)},${f1(-h * 0.35)} ${f1(w * 0.3)},${f1(-h * 0.2)}" stroke="${C.sackShade}" stroke-width="3" fill="none" stroke-linecap="round"/>`);
    }
    // table with an hourglass
    {
      const X = -2.9, Z = 7.2, tw = 0.6, th = 0.85;
      const a = P2(X - tw, th, Z), b = P2(X + tw, th, Z), a2 = P2(X - tw + 0.1, th, Z + 0.7), b2 = P2(X + tw + 0.1, th, Z + 0.7);
      const l0 = P2(X - tw + 0.08, 0, Z), l1 = P2(X + tw - 0.08, 0, Z), l2 = P2(X - tw + 0.18, 0, Z + 0.62), l3 = P2(X + tw + 0.02, 0, Z + 0.62);
      out.push(`<path d="M${f1(l2[0])},${f1(l2[1])}V${f1(a2[1])}M${f1(l3[0])},${f1(l3[1])}V${f1(b2[1])}" stroke="${wood.shade}" stroke-width="5"/>`);
      out.push(`<path d="${pz1([a, b, b2, a2])}" fill="${wood.lit}"/><path d="M${f1(a[0])},${f1(a[1])}H${f1(b[0])}v7H${f1(a[0])}z" fill="${wood.mid}"/>`);
      out.push(`<path d="M${f1(l0[0])},${f1(l0[1])}V${f1(a[1] + 7)}M${f1(l1[0])},${f1(l1[1])}V${f1(b[1] + 7)}" stroke="${wood.mid}" stroke-width="7"/>`);
      const hx = (a[0] + b[0]) / 2 - 10, hy = a[1] - 4, hh = 46, hw = 16;
      out.push(`<path d="M${f1(hx - hw)},${f1(hy - hh)}h${hw * 2}M${f1(hx - hw)},${f1(hy)}h${hw * 2}" stroke="${wood.deep}" stroke-width="5" stroke-linecap="round"/>`);
      out.push(`<path d="M${f1(hx - hw + 3)},${f1(hy - hh + 3)}L${f1(hx + hw - 3)},${f1(hy - hh + 3)}L${f1(hx + 2)},${f1(hy - hh / 2)}L${f1(hx + hw - 3)},${f1(hy - 3)}L${f1(hx - hw + 3)},${f1(hy - 3)}L${f1(hx - 2)},${f1(hy - hh / 2)}Z" fill="#dfe8ee" opacity=".75"/>`);
      out.push(`<path d="M${f1(hx - hw + 6)},${f1(hy - 3)}L${f1(hx)},${f1(hy - hh * 0.3)}L${f1(hx + hw - 6)},${f1(hy - 3)}Z" fill="${sand.near}"/><path d="M${f1(hx - 6)},${f1(hy - hh + 6)}h12l-6,6z" fill="${sand.near}"/><path d="M${f1(hx)},${f1(hy - hh / 2)}V${f1(hy - hh * 0.3)}" stroke="${sand.near}" stroke-width="1.4"/>`);
      // a folded towel on the table
      out.push(`<path d="${pz1([[b[0] - 34, b[1] - 2], [b[0] - 6, b[1] - 2], [b[0] - 2, b[1] - 12], [b[0] - 30, b[1] - 12]])}" fill="${C.cloth}"/>`);
    }
    // a wooden rake leaning on the near-left, out of focus
    out.push(`<path d="M1660,812L1250,868" stroke="${C.shadow}" stroke-width="14" stroke-linecap="round" opacity="${C.shadowOp}" transform="translate(10 12)"/><path d="M1660,812L1250,868" stroke="${wood.mid}" stroke-width="12" stroke-linecap="round"/><path d="M1660,812L1250,868" stroke="${wood.lit}" stroke-width="3" stroke-linecap="round" opacity=".7" transform="translate(0 -4)"/><path d="M1232,822L1262,906" stroke="${wood.deep}" stroke-width="14" stroke-linecap="round"/><path d="M1236,834l-26,6M1242,852l-26,6M1248,870l-26,6M1254,888l-26,6" stroke="${wood.deep}" stroke-width="7" stroke-linecap="round"/>`);
    S.add(out.join(''));
  }

  // light: dusk wash from the low sun on the left; day gets a faint warm vignette at the bottom
  if (dusk) {
    S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, C.light, 0.28], [0.5, C.light, 0.08], [1, '#5a3040', 0.22]], 'x1="0" y1="0" x2="1" y2="0.3"')}"/>`);
    S.add(`<path d="M0,${f1(wallTop - 30)}L${f1(W * 0.5)},${f1(wallBase)}L0,${f1(wallBase)}Z" fill="${C.light}" opacity=".12"/>`);
  } else {
    S.add(`<rect y="${H - 160}" width="${W}" height="160" fill="${S.lin([[0, sand.near, 0], [1, wood.shade, 0.18]])}"/>`);
  }
  return S.out();
}

export const ex004Bgs = {
  'holy-city-knights-drill-ground': () => drill(false),
  'holy-city-knights-drill-ground-dusk': () => drill(true),
};
