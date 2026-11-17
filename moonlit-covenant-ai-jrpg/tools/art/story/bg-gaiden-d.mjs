// 外传《银轨号》正篇第7、8章的场景背景：memory-labyrinth-hall（记忆迷宫·入口大厅）、memory-labyrinth-ruin（记忆迷宫·废墟）、rift-depths（裂隙深处·数据残骸）。
//   memory-labyrinth-hall — 记忆迷宫·入口大厅：一座看不见顶的圆形大厅，从入口往深处看。墙是无数记忆碎片拼成的马赛克，
//                           零星几片亮着别人记忆的暖光、冷光；墙上一圈歪斜的尖拱门，门洞里幽幽发亮，正对面最大的一道
//                           通往迷宫深处；地上铺满碎镜，映着门洞的光和淡紫的光点；半空悬着发光的碎片和萤火一样的光点；
//                           穹顶隐在紫黑的雾里，只有几道肋线往上消失，一层淡淡的月白光从高处落下。
//   memory-labyrinth-ruin — 同一座大厅（同一套几何）战后：墙上的碎片熄了、掉了一块块，露出黑洞；两道拱门塌了顶；
//                           地上堆着崩落的大块碎镜，有的斜立着；悬着的碎片都落了地；大厅中央裂开一道冒着紫光的裂缝，
//                           裂缝边一点暖金的光；空气里飘着淡金的光尘。
//   rift-depths           — 裂隙深处：一道巨大的黑紫色虚空裂缝，两壁是一层层参差的暗色岩晶，朝缝心的一侧泛紫，壁里
//                           嵌着发光的细线；缝里漂着“数据残骸”——线框方块、棱柱、缺格的光栅、断成两截的扫描条，其中
//                           一片上是齿轮环绕的月亮；一串悬空的碎石板一级一级通往深处，尽头一点暖金色的门光；顶上是来时
//                           的塌口，漏下淡金的光尘。
// 不画人物，不画怪物，不画能读出的字。
import { Scene, W, H, f, pz, pl, rng, mix } from './lib.mjs';

const r0 = (v) => f(v, 0);
const circ = (x, y, r) => `M${r0(x - r)},${r0(y)}a${f(r, 1)},${f(r, 1)} 0 1 0 ${f(r * 2, 1)},0a${f(r, 1)},${f(r, 1)} 0 1 0 ${f(-r * 2, 1)},0Z`;
const diamond = (x, y, s) => `M${r0(x)},${r0(y - s)}l${f(s * 0.45, 1)},${f(s, 1)}l${f(-s * 0.45, 1)},${f(s, 1)}l${f(-s * 0.45, 1)},${f(-s, 1)}Z`;

// ---------------------------------------------------------------------------------------------
// 记忆迷宫（入口大厅 / 废墟）：圆形大厅＝圆心 (0, ZC)、半径 RC 的圆柱墙，摄像机站在圆里靠近入口处
// ---------------------------------------------------------------------------------------------
const VP = [800, 500], F = 760, EYE = 1.7;
const RC = 15, ZC = 12.5, WALL_H = 14;
const pr = (X, Y, Z) => [VP[0] + X / Z * F, VP[1] - (Y - EYE) / Z * F];
const onWall = (t, Y) => pr(RC * Math.cos(t), Y, ZC + RC * Math.sin(t));
const inFrame = (pts, m = 40) => pts.some(([x, y]) => x > -m && x < W + m && y > -m && y < H + m);
const HALF = Math.PI / 2;

// 墙上的拱门：θ 中心、半宽、起拱高、拱顶高、歪斜（诡异的拱门）；broken 只在废墟里塌顶
const ARCHES = [
  { t: HALF, w: 0.16, spring: 7.0, top: 12.2, lean: 0.006, main: true },
  { t: HALF + 0.46, w: 0.085, spring: 4.6, top: 8.2, lean: 0.03, broken: true },
  { t: HALF - 0.46, w: 0.08, spring: 5.2, top: 7.8, lean: -0.022 },
  { t: HALF + 0.92, w: 0.09, spring: 5.0, top: 7.2, lean: 0.018 },
  { t: HALF - 0.92, w: 0.085, spring: 4.4, top: 8.0, lean: -0.035, broken: true },
  { t: HALF + 1.38, w: 0.08, spring: 4.6, top: 7.4, lean: 0.03 },
  { t: HALF - 1.38, w: 0.08, spring: 4.8, top: 6.8, lean: -0.02 },
];
function archOutline(a, grow = 0) {
  const w = a.w + grow, s = a.spring, top = a.top + grow * 30, pts = [];
  const sideP = (sgn, u) => [a.t + sgn * w * (1 - Math.sin(u * HALF)) + a.lean * u, s + (top - s) * Math.sin(u * HALF) ** 0.8];
  pts.push([a.t + w, 0]);
  for (let i = 0; i <= 8; i++) pts.push(sideP(1, i / 8));
  for (let i = 8; i >= 0; i--) pts.push(sideP(-1, i / 8));
  pts.push([a.t - w, 0]);
  return pts;
}
const inArch = (t, Y) => ARCHES.some((a) => Math.abs(t - a.t - a.lean * Math.max(0, (Y - a.spring) / (a.top - a.spring))) < a.w + 0.03 && Y < a.top + 0.9);

function labyrinth(ruin) {
  const S = ruin
    ? new Scene('sbGdDRuin', '记忆迷宫·废墟：同一座圆形大厅战后，墙上的记忆碎片熄了、掉了一块块，露出黑洞；两道歪斜的拱门塌了顶；地上堆着崩落的大块碎镜，有的斜立着，不再映出画面；大厅中央裂开一道冒着紫光的裂缝，裂缝边一点暖金的光；空气里飘着淡金的光尘；不画人物', 70711)
    : new Scene('sbGdDHall', '记忆迷宫·入口大厅：看不见顶的圆形大厅，墙由无数记忆碎片拼成，零星几片亮着暖光与冷光；墙上一圈歪斜的尖拱门幽幽发亮，正对面最大的一道通往深处；地上铺满碎镜，映着门洞的光和淡紫的光点；半空悬着发光的碎片和萤火一样的光点；穹顶隐在紫黑的雾里；不画人物', 70701);
  const R = rng(ruin ? 70712 : 70702);
  const C = ruin
    ? {
      bg: [[0, '#0c0a12'], [0.45, '#1e1a26'], [0.62, '#262230'], [1, '#09080d']], wallBase: '#0a0910',
      wall: ['#16131e', '#1a1724', '#1f1b2a', '#242030', '#2a2536', '#13111a'], hole: '#040306', holeEdge: '#3a3446', edge: '#4e4860', edgeOp: 0.32,
      lit: [['#7a6658', 0.3], ['#56607a', 0.26], ['#605a70', 0.26]], litN: 7, crack: '#05040a', crackOp: 0.7,
      floor: [[0, '#1c1924'], [1, '#0a090e']], shard: ['#121017', '#16141c', '#1b1822', '#211e2a', '#282432', '#302c3a'], shardEdge: '#5a5468', shardEdgeOp: 0.2, litEdge: '#8a8098', litEdgeOp: 0.3,
      glow: '#b4a8c8', glowOp: 0.07, mote: '#ffd9a0', moteN: 80, moteOp: [0.14, 0.5], arch: [[0, '#241e30'], [0.6, '#0e0b14'], [1, '#050407']], archGlow: '#8a7aa8', archGlowOp: 0.12,
      frame: '#34303f', frameLit: '#6a6080', rib: '#33303e', ray: '#c8bcd8', rayOp: 0.05, refl: '#9a8eb4', reflOp: 0.06, grade: '#07060a',
    }
    : {
      bg: [[0, '#07050e'], [0.42, '#1a1530'], [0.6, '#2a2440'], [1, '#08060f']], wallBase: '#0d0a19',
      wall: ['#1a152c', '#1f1934', '#251e3e', '#2c2448', '#342b54', '#161226'], hole: '#06050c', holeEdge: '#3a3058', edge: '#8a78c8', edgeOp: 0.4,
      lit: [['#ffb38a', 0.62], ['#8fb4ff', 0.56], ['#e8ddff', 0.56]], litN: 38, crack: '#c8b8ff', crackOp: 0.3,
      floor: [[0, '#2a2442'], [1, '#0c0a16']], shard: ['#120e1d', '#171326', '#1d182f', '#25203a', '#302948', '#40375e'], shardEdge: '#9a88d8', shardEdgeOp: 0.28, litEdge: '#d8ccff', litEdgeOp: 0.5,
      glow: '#d8ccff', glowOp: 0.2, mote: '#c9b8ff', moteN: 160, moteOp: [0.3, 0.95], arch: [[0, '#6a58a0'], [0.5, '#221a40'], [1, '#08060f']], archGlow: '#c0aeff', archGlowOp: 0.42,
      frame: '#463a6c', frameLit: '#b0a0e8', rib: '#4a3f70', ray: '#e8ddff', rayOp: 0.09, refl: '#b8a4ff', reflOp: 0.16, grade: '#05040a',
    };
  const b2 = S.blur(2), b3 = S.blur(3);

  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(C.bg)}"/>`);

  // ---- 穹顶：看不见顶，只有几道肋线往上没入雾里 --------------------------------------------------
  {
    let d = '';
    for (let k = 0; k <= 12; k++) {
      const t = -0.2 + (Math.PI + 0.4) * k / 12, pts = [];
      for (let i = 0; i <= 10; i++) {
        const ph = HALF * 0.7 * i / 10;
        const Z = ZC + RC * Math.cos(ph) * Math.sin(t);
        if (Z > 1.5) pts.push(pr(RC * Math.cos(ph) * Math.cos(t), WALL_H + RC * Math.sin(ph), Z));
      }
      if (pts.length > 1 && inFrame(pts)) d += pl(pts);
    }
    S.add(`<path d="${d}" fill="none" stroke="${C.rib}" stroke-width="3" opacity=".5"/>`);
  }

  // ---- 墙：记忆碎片的马赛克 ------------------------------------------------------------------------
  {
    const T0 = -0.18, T1 = Math.PI + 0.18;
    const base = [];
    for (let i = 0; i <= 40; i++) base.push(onWall(T0 + (T1 - T0) * i / 40, 0));
    for (let i = 40; i >= 0; i--) base.push(onWall(T0 + (T1 - T0) * i / 40, WALL_H));
    S.add(`<path d="${pz(base)}" fill="${C.wallBase}"/>`);
    const groups = C.wall.map(() => '');
    let holes = '';
    const lit = [];
    const put = (tri, ym) => {
      if (ruin && R() < (ym > 8 ? 0.3 : ym > 3 ? 0.16 : 0.06)) { holes += pz(tri); return; }
      if (lit.length < C.litN && ym < 11.5 && R() < 0.05) { lit.push(tri); return; }
      groups[R() * C.wall.length | 0] += pz(tri);
    };
    for (let ta = T0; ta < T1; ) {
      const tb = Math.min(T1, ta + 0.06 + R() * 0.05);
      let Y = 0;
      while (Y < WALL_H) {
        const Yb = Math.min(WALL_H, Y + 0.7 + R() * 0.9);
        const tm = (ta + tb) / 2, ym = (Y + Yb) / 2;
        if (!inArch(tm, ym)) {
          const j = () => (R() - 0.5) * 0.3;
          const q = [onWall(ta, Y + j()), onWall(tb, Y + j()), onWall(tb, Yb + j()), onWall(ta, Yb + j())];
          if (inFrame(q)) {
            const r = R();
            if (r < 0.28) put(q, ym);
            else if (r < 0.72) { if (R() < 0.5) { put([q[0], q[1], q[2]], ym); put([q[0], q[2], q[3]], ym); } else { put([q[0], q[1], q[3]], ym); put([q[1], q[2], q[3]], ym); } }
            else {
              const u = 0.25 + R() * 0.5, m = [q[1][0] + (q[2][0] - q[1][0]) * u, q[1][1] + (q[2][1] - q[1][1]) * u];
              put([q[0], q[1], m], ym); put([q[0], m, q[3]], ym); put([m, q[2], q[3]], ym);
            }
          }
        }
        Y = Yb;
      }
      ta = tb;
    }
    groups.forEach((d, k) => { if (d) S.add(`<path d="${d}" fill="${C.wall[k]}" stroke="${C.edge}" stroke-width="1.1" stroke-opacity="${C.edgeOp}" stroke-linejoin="round"/>`); });
    if (holes) S.add(`<path d="${holes}" fill="${C.hole}" stroke="${C.holeEdge}" stroke-width="1.2" stroke-opacity=".7" stroke-linejoin="round"/>`);
    // 亮着别人记忆的碎片：暖光、冷光、月白，各自带一圈光晕
    const grads = C.lit.map(([c, op]) => S.rad([[0, mix(c, '#ffffff', 0.4), op], [0.65, c, op * 0.6], [1, c, op * 0.2]], 'cx="42%" cy="38%" r="72%"'));
    let halo = '';
    for (const q of lit) {
      S.add(`<path d="${pz(q)}" fill="${grads[R() * grads.length | 0]}" stroke="${C.edge}" stroke-width="1" stroke-opacity="${C.edgeOp}"/>`);
      const cx = q.reduce((s, p) => s + p[0], 0) / q.length, cy = q.reduce((s, p) => s + p[1], 0) / q.length;
      const sz = Math.max(...q.map((p) => Math.hypot(p[0] - cx, p[1] - cy)));
      if (!ruin && R() < 0.6) halo += circ(cx, cy, sz * 1.1);
    }
    if (halo) S.add(`<path d="${halo}" fill="#c8b4ff" opacity=".16" filter="${b2}"/>`);
    // 墙上的裂纹
    let cr = '';
    for (let k = 0; k < (ruin ? 10 : 6); k++) {
      let t = T0 + 0.2 + R() * (T1 - T0 - 0.4), Y = 1 + R() * 10;
      const pts = [onWall(t, Y)];
      for (let i = 0; i < 5; i++) { t += (R() - 0.5) * 0.12; Y += 0.6 + R() * 1.2; pts.push(onWall(t, Y)); }
      if (!pts.some(([x]) => Math.abs(x - 800) < 90 && false)) cr += pl(pts);
    }
    S.add(`<path d="${cr}" fill="none" stroke="${C.crack}" stroke-width="1.6" opacity="${C.crackOp}" stroke-linejoin="round"/>`);
    // 越往上越暗，最后没入穹顶的雾
    S.add(`<rect width="${W}" height="430" fill="${S.lin([[0, C.grade, 0.97], [0.5, C.grade, 0.6], [1, C.grade, 0]])}"/>`);
  }

  // ---- 拱门：门洞里幽幽发亮，框是一圈更亮的碎片 ------------------------------------------------------
  const archInfo = [];
  {
    for (const a of ARCHES) {
      const hole = archOutline(a, 0).map(([t, Y]) => onWall(t, Y));
      if (!inFrame(hole)) continue;
      const grow = a.main ? 0.03 : 0.022;
      const outer = archOutline(a, grow).map(([t, Y]) => onWall(t, Y));
      const xs = hole.map((p) => p[0]), ys = hole.map((p) => p[1]);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2, by = Math.max(...ys), ty = Math.min(...ys), gw = Math.max(...xs) - Math.min(...xs);
      archInfo.push({ cx, by, gw, main: a.main });
      // 门框，框上伸出几颗碎片的尖
      let teeth = '';
      for (const i of [3, 6, 13, 16]) {
        if (R() < 0.3) continue;
        const [x, y] = outer[i], [hx, hy] = hole[i];
        const dx = x - hx, dy = y - hy, k = 0.5 + R() * 0.8, sk = (R() - 0.5) * 0.8;
        teeth += pz([[x - dy * 0.3, y + dx * 0.3], [x + (dx + dy * sk) * k, y + (dy - dx * sk) * k], [x + dy * 0.3, y - dx * 0.3]]);
      }
      S.add(`<path d="${pz(outer)}${teeth}" fill="${C.frame}" stroke="${C.frameLit}" stroke-width="1.4" stroke-opacity=".6" stroke-linejoin="round"/>`);
      let seams = '';
      for (let i = 1; i < outer.length - 1; i += 2) seams += pl([outer[i], hole[i]]);
      S.add(`<path d="${seams}" stroke="${C.frameLit}" stroke-width="1" opacity=".35"/>`);
      // 门洞与洞里的光
      S.add(`<path d="${pz(hole)}" fill="${S.lin(C.arch, 'x1="0" y1="1" x2="0" y2="0"')}"/>`);
      S.add(`<ellipse cx="${r0(cx)}" cy="${r0(by - (by - ty) * 0.22)}" rx="${r0(gw * 0.4)}" ry="${r0((by - ty) * 0.3)}" fill="${C.archGlow}" opacity="${f(C.archGlowOp * (a.main ? 1.3 : 1), 2)}" filter="${b2}"/>`);
      let far = '';
      for (let i = 0; i < (a.main ? 11 : 4); i++) {
        const x = cx + (R() - 0.5) * gw * 0.7, y = ty + (by - ty) * (0.25 + R() * 0.6), s = gw * (0.025 + R() * 0.045);
        far += pz([[x, y - s], [x + s * 0.6, y], [x, y + s * 0.9], [x - s * 0.5, y + s * 0.1]]);
      }
      S.add(`<path d="${far}" fill="${ruin ? '#3a3448' : '#d4c6ff'}" opacity="${ruin ? 0.35 : 0.55}"/>`);
      if (ruin && a.broken) {
        // 塌顶：拱顶连框带墙缺了一大块（参差的黑洞），碎块挂在缺口下沿，门脚堆着掉下来的框
        const [ax, ay] = outer[10];
        const rx = gw * 0.78, ry = (by - ty) * 0.34, gap = [];
        for (let i = 0; i < 18; i++) {
          const ang = (i + (R() - 0.5) * 0.7) / 18 * Math.PI * 2, rr = (i % 2 ? 0.42 : 0.62) + R() * (i % 3 ? 0.3 : 0.55);
          gap.push([ax + Math.cos(ang) * rx * rr, ay + ry * 0.25 + Math.sin(ang) * ry * rr]);
        }
        S.add(`<path d="${pz(gap)}" fill="${C.hole}" stroke="${C.holeEdge}" stroke-width="1.6" stroke-linejoin="round"/>`);
        let hang = '', rub = '';
        for (const i of [3, 5, 7]) {
          const [x, y] = gap[i], sz = gw * (0.05 + R() * 0.05);
          hang += pz([[x - sz * 0.6, y - sz * 0.4], [x + sz * 0.6, y - sz * 0.3], [x + sz * 0.1, y + sz * 1.6]]);
        }
        for (let i = 0; i < 7; i++) {
          const x = cx + (R() - 0.5) * gw * 1.1, y = by + 2 + R() * gw * 0.06, sz = gw * (0.06 + R() * 0.08);
          rub += pz([[x - sz, y], [x - sz * 0.2, y - sz * (0.4 + R() * 0.6)], [x + sz * 0.9, y - sz * 0.1]]);
        }
        S.add(`<path d="${hang}${rub}" fill="${C.frame}" stroke="${C.frameLit}" stroke-width="1" stroke-opacity=".45" stroke-linejoin="round"/>`);
      }
    }
  }

  // ---- 高处落下的一层淡光，正对面门洞后的光晕 --------------------------------------------------------
  {
    const [cx, cy] = onWall(HALF, 4.6);
    S.add(`<path d="M600,-40L1000,-40L1120,640L480,640Z" fill="${C.ray}" opacity="${C.rayOp}" filter="${b3}"/>`);
    S.add(`<ellipse cx="${r0(cx)}" cy="${r0(cy)}" rx="280" ry="160" fill="${C.glow}" opacity="${C.glowOp}" filter="${b3}"/>`);
  }

  // ---- 地面：碎镜 ------------------------------------------------------------------------------------
  {
    const rim = [];
    for (let i = 0; i <= 48; i++) rim.push(onWall(-0.18 + (Math.PI + 0.36) * i / 48, 0));
    S.add(`<path d="${pz([...rim, [-400, H + 20], [W + 400, H + 20]])}" fill="${S.lin(C.floor)}"/>`);
    const groups = C.shard.map(() => '');
    let edges = '', glints = '';
    const ZS = [2.4, 2.9, 3.5, 4.2, 5.0, 5.9, 6.9, 8.1, 9.5, 11.1, 13.0, 15.2, 17.8, 20.8];
    const P = (X, Z) => pr(X, 0, Z);
    for (let zi = 0; zi < ZS.length - 1; zi++) {
      const za = ZS[zi], zb = ZS[zi + 1], step = 0.75 + za * 0.085;
      const XS = [];
      for (let X = -16; X < 16; X += step * (0.6 + R() * 0.8)) XS.push(X);
      const jz = () => (R() - 0.5) * (zb - za) * 0.4;
      for (let xi = 0; xi < XS.length - 1; xi++) {
        const xa = XS[xi], xb = XS[xi + 1], zc = (za + zb) / 2, xc = (xa + xb) / 2;
        if (Math.hypot(xc, zc - ZC) > RC - 0.5) continue;
        const q = [P(xa, za + jz()), P(xb, za + jz()), P(xb + (R() - 0.5) * step * 0.4, zb + jz()), P(xa + (R() - 0.5) * step * 0.3, zb + jz())];
        if (!inFrame(q, 0)) continue;
        // 碎镜映着门洞的光：门洞正下方、和视线正中的镜片更亮
        const sx = (q[0][0] + q[1][0]) / 2;
        let bright = Math.max(0, 1 - Math.abs(sx - 800) / (120 + 900 / zc)) * 0.8;
        for (const a of archInfo) bright = Math.max(bright, (1 - Math.abs(sx - a.cx) / (a.gw * 0.9)) * (a.main ? 0.9 : 0.6));
        const pick = () => Math.max(0, Math.min(C.shard.length - 1, (R() * 2.6 + bright * 3.4 - 0.3) | 0));
        if (R() < 0.6) { groups[pick()] += pz([q[0], q[1], q[2]]); groups[pick()] += pz([q[0], q[2], q[3]]); }
        else groups[pick()] += pz(q);
        if (R() < 0.3) edges += pl([q[3], q[2]]);
        if (!ruin && R() < 0.14) { const [gx, gy] = P(xc + (R() - 0.5) * step, zc); glints += diamond(gx, gy, 1.5 + 9 / zc); }
      }
    }
    groups.forEach((d, k) => { if (d) S.add(`<path d="${d}" fill="${C.shard[k]}" stroke="${C.shardEdge}" stroke-width="1" stroke-opacity="${C.shardEdgeOp}" stroke-linejoin="round"/>`); });
    S.add(`<path d="${edges}" fill="none" stroke="${C.litEdge}" stroke-width="1.3" opacity="${C.litEdgeOp}"/>`);
    // 门洞的倒影：从门脚往近处拖出一道道光
    let refl = '';
    for (const a of archInfo) {
      const w = a.gw * 0.42, len = (H - a.by) * (a.main ? 0.95 : 0.7);
      refl += `M${r0(a.cx - w)},${r0(a.by + 2)}L${r0(a.cx + w)},${r0(a.by + 2)}L${r0(a.cx + w * 1.6 + (a.cx - 800) * 0.25)},${r0(a.by + len)}L${r0(a.cx - w * 1.6 + (a.cx - 800) * 0.25)},${r0(a.by + len)}Z`;
    }
    S.add(`<path d="${refl}" fill="${C.refl}" opacity="${C.reflOp}" filter="${b3}"/>`);
    const [fx, fy] = onWall(HALF, 0);
    S.add(`<ellipse cx="${r0(fx)}" cy="${r0(fy + 10)}" rx="560" ry="40" fill="${C.glow}" opacity="${f(C.glowOp * 0.9, 2)}" filter="${b3}"/>`);
    if (glints) S.add(`<path d="${glints}" fill="#f0eaff" opacity=".6"/>`);
  }

  if (ruin) {
    // ---- 废墟：中央的裂缝、裂缝边一点暖金的光 ------------------------------------------------------------
    {
      const P = (X, Z) => pr(X, 0, Z);
      const L = [], Rr = [], n = 14;
      for (let i = 0; i <= n; i++) {
        const Z = 7.2 + i * 1.05, w = 0.12 + Math.sin(i / n * Math.PI) * 0.75 + (i % 2) * 0.12, X = Math.sin(i * 1.3) * 0.6 + (i - 7) * 0.08;
        L.push(P(X - w, Z)); Rr.unshift(P(X + w * (0.7 + 0.3 * (i % 3)), Z + 0.3));
      }
      const crack = pz([...L, ...Rr]);
      S.add(`<path d="${crack}" fill="#040208"/>`);
      S.add(`<path d="${crack}" fill="none" stroke="#9a6ad8" stroke-width="2" opacity=".55"/>`);
      const [gx, gy] = P(0.2, 10.5);
      S.add(`<ellipse cx="${r0(gx)}" cy="${r0(gy)}" rx="80" ry="18" fill="#9a6ad8" opacity=".32" filter="${b2}"/>`);
      let veins = '';
      for (let k = 0; k < 9; k++) {
        const a = R() * Math.PI * 2;
        let X = (R() - 0.5) * 1.2, Z = 9 + R() * 5;
        const pts = [P(X, Z)];
        for (let i = 0; i < 4; i++) { X += Math.cos(a + (R() - 0.5)) * 0.9; Z += Math.sin(a + (R() - 0.5)) * 0.9; pts.push(P(X, Math.max(3, Z))); }
        veins += pl(pts);
      }
      S.add(`<path d="${veins}" fill="none" stroke="#7a5ab0" stroke-width="1.4" opacity=".45"/>`);
      const [sx, sy] = P(-1.1, 9.4);
      S.add(`<ellipse cx="${r0(sx)}" cy="${r0(sy)}" rx="50" ry="22" fill="#ffd091" opacity=".4" filter="${b2}"/>`);
      S.add(`<path d="${circ(sx, sy - 3, 3.2)}" fill="#fff0c8"/>`);
    }
    // ---- 崩落的大块碎镜：躺着的一堆堆，几块斜立着 ----------------------------------------------------
    {
      let flat = '', flatLit = '', slab = '', slabFace = '', slabEdge = '';
      const pile = (cx, by, wd, n, stand, seed) => {
        const Q = rng(seed);
        for (let i = 0; i < n; i++) {
          const x = cx + (Q() - 0.5) * wd, y = by - Q() * wd * 0.16, s = wd * (0.07 + Q() * 0.12), a = Q() * Math.PI;
          const pts = [0, 1, 2].map((k) => { const ang = a + k * 2.1 + (Q() - 0.5) * 0.6; const rr = s * (0.6 + Q() * 0.6); return [x + Math.cos(ang) * rr, y + Math.sin(ang) * rr * 0.45]; });
          flat += pz(pts);
          if (Q() < 0.5) flatLit += pl([pts[0], pts[1]]);
        }
        for (let i = 0; i < stand; i++) {
          const x = cx + (Q() - 0.5) * wd * 0.8, y = by - Q() * wd * 0.08, h = wd * (0.3 + Q() * 0.35), w = h * (0.28 + Q() * 0.2), lean = (Q() - 0.5) * h * 0.9;
          const pts = [[x - w / 2, y], [x + w / 2, y + w * 0.12], [x + w * 0.3 + lean, y - h], [x - w * 0.15 + lean * 1.1, y - h * 0.82]];
          slab += pz(pts);
          slabFace += pz([pts[0], pts[3], [(pts[0][0] + pts[1][0]) / 2 + lean * 0.4, (pts[0][1] + pts[1][1]) / 2 - h * 0.4]]);
          slabEdge += pl([pts[3], pts[2], pts[1]]);
        }
      };
      pile(150, 890, 420, 24, 3, 7071);
      pile(1460, 870, 400, 22, 3, 7072);
      pile(560, 650, 160, 10, 1, 7073);
      pile(1080, 660, 150, 9, 1, 7074);
      S.add(`<path d="${flat}" fill="#262230" stroke="#5a5468" stroke-width="1.1" stroke-opacity=".55" stroke-linejoin="round"/>`);
      S.add(`<path d="${flatLit}" fill="none" stroke="#a89cbc" stroke-width="1.8" opacity=".45"/>`);
      S.add(`<path d="${slab}" fill="#1e1a28" stroke="#4a4458" stroke-width="1.2"/>`);
      S.add(`<path d="${slabFace}" fill="#3a3448" opacity=".7"/>`);
      S.add(`<path d="${slabEdge}" fill="none" stroke="#b4a8c8" stroke-width="2" opacity=".5" stroke-linejoin="round"/>`);
    }
  } else {
    // ---- 悬着的发光碎片 --------------------------------------------------------------------------------
    let halos = '', sA = '', sB = '', sC = '', edges = '';
    for (let i = 0; i < 46; i++) {
      const x = R() * W, y = 60 + R() * 560;
      if (y > 520 && x > 420 && x < 1180) continue;
      const s = 5 + R() ** 2 * 26, a = R() * Math.PI;
      const pts = [[0, -1], [0.5, -0.1], [0.12, 1.1], [-0.42, 0.2]].map(([u, v]) => [x + (u * Math.cos(a) - v * Math.sin(a)) * s, y + (u * Math.sin(a) + v * Math.cos(a)) * s]);
      const r = R();
      if (r < 0.55) sA += pz(pts); else if (r < 0.8) sB += pz(pts); else sC += pz(pts);
      edges += pl([pts[0], pts[1], pts[2]]);
      if (s > 13) halos += circ(x, y, s * 1.5);
    }
    S.add(`<path d="${halos}" fill="#b8a4ff" opacity=".3" filter="${b2}"/>`);
    S.add(`<path d="${sA}" fill="#d8ccff" opacity=".82"/>`);
    S.add(`<path d="${sB}" fill="#ffc9a0" opacity=".8"/>`);
    S.add(`<path d="${sC}" fill="#a8c4ff" opacity=".78"/>`);
    S.add(`<path d="${edges}" fill="none" stroke="#ffffff" stroke-width="1.2" opacity=".6"/>`);
  }

  // ---- 光点（入口大厅是淡紫的萤火，废墟是淡金的光尘） ------------------------------------------------
  {
    let a = '', b = '';
    for (let i = 0; i < C.moteN; i++) {
      const x = R() * W, y = 40 + R() * 780, r = 0.8 + R() ** 3 * 2.6;
      if (R() < 0.5) a += circ(x, y, r); else b += circ(x, y, r);
    }
    S.add(`<path d="${a}" fill="${C.mote}" opacity="${C.moteOp[1]}"/>`);
    S.add(`<path d="${b}" fill="${C.mote}" opacity="${C.moteOp[0]}"/>`);
  }

  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, C.grade, 0], [0.6, C.grade, 0], [1, C.grade, 0.8]], 'cx="50%" cy="46%" r="72%"')}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 裂隙深处·数据残骸
// ---------------------------------------------------------------------------------------------
function riftDepths() {
  const S = new Scene('sbGdDRift', '裂隙深处：一道巨大的黑紫色虚空裂缝，两壁是一层层参差的暗色岩晶，朝缝心的一侧泛紫，壁里嵌着发光的细线；缝里漂着数据残骸——线框方块、棱柱、缺格的光栅、断成两截的扫描条，其中一片上是齿轮环绕的月亮；一串悬空的碎石板一级一级通往深处，尽头一点暖金色的门光；顶上是来时的塌口，漏下淡金的光尘；不画人物', 70801);
  const R = rng(70802);
  const FX0 = 800, FY0 = 420; // 深处的焦点（门光）
  const b1 = S.blur(1), b2 = S.blur(2), b3 = S.blur(3);

  // 虚空
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#0a0614'], [0.35, '#1a1030'], [0.62, '#120a24'], [1, '#040208']])}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#7a48c0', 0.6], [0.2, '#3a1a6a', 0.38], [0.6, '#1a0c34', 0], [1, '#000000', 0]], `cx="50%" cy="${f(FY0 / H * 100)}%" r="60%"`)}"/>`);
  // 缝心的一道紫光（在门光后面，往上散开）
  S.add(`<path d="M${FX0 - 14},60L${FX0 + 14},60L${FX0 + 40},${FY0}L${FX0},${FY0 + 60}L${FX0 - 40},${FY0}Z" fill="#b58cff" opacity=".4" filter="${b3}"/>`);

  // 远处漂着的小碎片（星尘一样）
  {
    let d = '';
    for (let i = 0; i < 100; i++) {
      const a = R() * Math.PI * 2, rr = 20 + R() ** 0.7 * 560;
      d += diamond(FX0 + Math.cos(a) * rr * 1.2, FY0 + Math.sin(a) * rr * 0.75, 0.8 + rr / 240);
    }
    S.add(`<path d="${d}" fill="#c9b8ff" opacity=".45"/>`);
  }

  // 门光：深处一点暖金
  S.add(`<ellipse cx="${FX0}" cy="${FY0 + 10}" rx="70" ry="40" fill="#ffd091" opacity=".55" filter="${b2}"/>`);
  S.add(`<path d="M${FX0 - 10},${FY0 + 26}L${FX0 - 10},${FY0 + 2}Q${FX0},${FY0 - 12} ${FX0 + 10},${FY0 + 2}L${FX0 + 10},${FY0 + 26}Z" fill="#fff0c8" opacity=".92"/>`);

  // 两壁：一层层参差的暗色岩晶，越近越暗、越宽
  const BASE = [110, 230, 400, 640];
  for (let layer = 0; layer < 4; layer++) {
    for (const side of [-1, 1]) {
      const Q = rng(70820 + layer * 11 + (side > 0 ? 5 : 0));
      const near = layer / 3;
      const pts = [];
      for (let i = 0; i <= 9; i++) {
        const y = -40 + (H + 80) * i / 9 + (i && i < 9 ? (Q() - 0.5) * 50 : 0);
        const open = Math.min(1, Math.abs(y - FY0) / 460);
        const hw = BASE[layer] * (0.38 + 0.62 * open) + (Q() - 0.5) * BASE[layer] * 0.22;
        pts.push([FX0 + side * hw, y]);
      }
      const edgeX = side < 0 ? -60 : W + 60;
      S.add(`<path d="${pz([...pts, [edgeX, H + 40], [edgeX, -40]])}" fill="${mix('#1e1338', '#07040d', near)}"/>`);
      // 晶面：沿着内缘长出的斜面
      let facet = '', facetDark = '';
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
        const depth = (30 + Q() * 70) * (1 + near);
        const m = [(x0 + x1) / 2 - side * depth, (y0 + y1) / 2 + (Q() - 0.5) * 40];
        if (Q() < 0.6) facet += pz([[x0, y0], [x1, y1], m]); else facetDark += pz([[x0, y0], [x1, y1], m]);
      }
      S.add(`<path d="${facet}" fill="${mix('#3a2862', '#1a1030', near)}" opacity=".85"/>`);
      if (facetDark) S.add(`<path d="${facetDark}" fill="${mix('#120a22', '#040208', near)}"/>`);
      // 朝缝心的一侧泛紫
      S.add(`<path d="${pl(pts)}" fill="none" stroke="${mix('#8a64d8', '#c0a0ff', near)}" stroke-width="${f(1.4 + near * 2.4, 1)}" opacity="${f(0.5 + near * 0.3, 2)}" stroke-linejoin="round"/>`);
      // 壁里的发光细线（数据的脉络，直角拐弯）
      let veins = '';
      for (let k = 0; k < 2 + layer; k++) {
        const [x0, y0] = pts[1 + (Q() * (pts.length - 2) | 0)];
        let x = x0 - side * (14 + Q() * 30), y = y0;
        let d = `M${r0(x)},${r0(y)}`;
        for (let s = 0; s < 3; s++) { if (s % 2 === 0) x -= side * (30 + Q() * 70); else y += (Q() < 0.5 ? -1 : 1) * (24 + Q() * 60); d += `L${r0(x)},${r0(y)}`; }
        veins += d + circ(x, y, 2.2);
      }
      S.add(`<path d="${veins}" fill="none" stroke="#a88af0" stroke-width="1.3" opacity="${f(0.22 + near * 0.22, 2)}"/>`);
    }
  }

  // 顶上：来时的塌口，漏下淡金的光尘
  {
    const hole = [[660, -10], [940, -10], [918, 18], [884, 34], [852, 28], [818, 46], [776, 36], [736, 44], [700, 24]];
    S.add(`<path d="${pz(hole)}" fill="${S.lin([[0, '#5a4c5e'], [1, '#2a2232']])}" stroke="#ffd9a0" stroke-width="1.6" stroke-opacity=".4"/>`);
    S.add(`<path d="M620,-40L980,-40L900,460L700,460Z" fill="#ffd9a0" opacity=".07" filter="${b3}"/>`);
    let dust = '';
    for (let i = 0; i < 70; i++) { const y = 30 + R() ** 1.4 * 520, x = 800 + (R() - 0.5) * (120 + y * 0.5); dust += circ(x, y, 0.7 + R() * 1.5); }
    S.add(`<path d="${dust}" fill="#ffd9a0" opacity=".55"/>`);
  }

  // 悬空的碎石板：从脚下一级一级通往深处
  {
    let tops = '', sides = '', rims = '';
    const steps = 9;
    for (let i = steps - 1; i >= 0; i--) {
      const u = i / (steps - 1), k = (1 - u) ** 1.6;
      const cx = FX0 + Math.sin(i * 1.1) * 70 * k + (1 - u) * 30, cy = FY0 + 46 + 430 * k;
      const w = 16 + 300 * k, h = 4 + 60 * k, th = 3 + 46 * k;
      const j = () => (R() - 0.5) * w * 0.16;
      const top = [[cx - w / 2 + j(), cy + j() * 0.3], [cx + w / 2 + j(), cy - h * 0.15 + j() * 0.3], [cx + w * 0.42 + j(), cy + h], [cx - w * 0.46 + j(), cy + h * 0.9]];
      const side = [top[3], top[2], [top[2][0] - w * 0.06, top[2][1] + th], [(top[2][0] + top[3][0]) / 2, top[2][1] + th * 1.5], [top[3][0] + w * 0.08, top[3][1] + th * 0.9]];
      tops += pz(top); sides += pz(side); rims += pl([top[0], top[1]]);
    }
    S.add(`<path d="${sides}" fill="#0a0614"/>`);
    S.add(`<path d="${tops}" fill="#2a1e40" stroke="#4a3a6a" stroke-width="1"/>`);
    S.add(`<path d="${rims}" fill="none" stroke="#c8b0ff" stroke-width="2" opacity=".55"/>`);
  }

  // 数据残骸：线框方块、实心棱柱、缺格光栅、扫描条
  {
    const cube = (x, y, s, a) => {
      const c = Math.cos(a), sn = Math.sin(a);
      const P = (u, v, w) => [x + (u * c - w * sn) * s, y + (v + (u * sn + w * c) * 0.45) * s];
      const v = [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1], [-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]].map(([u, vv, w]) => P(u, vv, w));
      return [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].map(([p, q]) => pl([v[p], v[q]])).join('');
    };
    const prism = (x, y, s, a) => {
      const c = Math.cos(a), sn = Math.sin(a);
      const T = [[0, -1.2], [1, 0.6], [-1, 0.6]].map(([u, v]) => [x + (u * c - v * sn) * s, y + (u * sn + v * c) * s]);
      const D = T.map(([px, py]) => [px + s * 0.5, py + s * 0.8]);
      return { lit: pz([T[0], T[1], D[1], D[0]]), dark: pz([T[1], T[2], D[2], D[1]]), cap: pz(T) };
    };
    let wire = '', wireFar = '', litF = '', darkF = '', caps = '', grid = '', gridOn = '', scan = '', halos = '';
    const items = [];
    for (let i = 0; i < 34; i++) {
      let x, y;
      do { x = 80 + R() * 1440; y = 70 + R() * 640; } while ((Math.abs(x - FX0) < 90 && y > FY0 - 140) || (Math.abs(x - 1236) < 110 && Math.abs(y - 262) < 90));
      items.push({ x, y, depth: R(), kind: R() });
    }
    items.sort((a, b) => a.depth - b.depth);
    for (const it of items) {
      const s = 5 + it.depth ** 1.5 * 34, a = R() * Math.PI;
      if (it.kind < 0.3) { if (it.depth < 0.5) wireFar += cube(it.x, it.y, s, a); else wire += cube(it.x, it.y, s, a); }
      else if (it.kind < 0.55) { const p = prism(it.x, it.y, s, a); litF += p.lit; darkF += p.dark; caps += p.cap; }
      else if (it.kind < 0.8) {
        const n = 4 + (R() * 3 | 0), cell = s * 0.42, sk = (R() - 0.5) * 0.8;
        for (let gx = 0; gx < n; gx++) for (let gy = 0; gy < n; gy++) {
          if (R() < 0.28) continue;
          const px = it.x + (gx - n / 2) * cell + gy * cell * sk, py = it.y + (gy - n / 2) * cell * 0.7;
          const sq = `M${r0(px)},${r0(py)}h${f(cell * 0.8, 1)}l${f(cell * sk * 0.8, 1)},${f(cell * 0.56, 1)}h${f(-cell * 0.8, 1)}Z`;
          if (R() < 0.18) gridOn += sq; else grid += sq;
        }
      } else {
        const len = s * 3.4, gap = s * (0.3 + R() * 0.6), hh = Math.max(1.5, s * 0.14), half = len / 2 - gap / 2;
        scan += `M${r0(it.x - len / 2)},${r0(it.y)}h${f(half, 1)}v${f(hh, 1)}h${f(-half, 1)}Z`;
        scan += `M${r0(it.x + gap / 2)},${r0(it.y + hh * 1.6)}h${f(half, 1)}v${f(hh, 1)}h${f(-half, 1)}Z`;
      }
      if (it.depth > 0.72) halos += circ(it.x, it.y, s * 1.4);
    }
    S.add(`<path d="${halos}" fill="#8a6ae0" opacity=".22" filter="${b2}"/>`);
    S.add(`<path d="${wireFar}" fill="none" stroke="#9a86d8" stroke-width="1" opacity=".45"/>`);
    S.add(`<path d="${darkF}" fill="#24183e"/>`);
    S.add(`<path d="${litF}" fill="#6a52a8"/>`);
    S.add(`<path d="${caps}" fill="#b8a0f0"/>`);
    S.add(`<path d="${grid}" fill="#8fb4ff" opacity=".38"/>`);
    S.add(`<path d="${gridOn}" fill="#e8f0ff" opacity=".85"/>`);
    S.add(`<path d="${scan}" fill="#c9b8ff" opacity=".6"/>`);
    S.add(`<path d="${wire}" fill="none" stroke="#e0d4ff" stroke-width="1.6" opacity=".75" stroke-linejoin="round"/>`);
  }

  // 一片漂着的碎板上：齿轮环绕的月亮（只是图案，没有字）
  {
    const cx = 1236, cy = 262, r = 34;
    S.add(`<ellipse cx="${cx}" cy="${cy}" rx="80" ry="66" fill="#8a6ae0" opacity=".18" filter="${b2}"/>`);
    S.add(`<path d="${pz([[cx - 62, cy - 44], [cx + 58, cy - 58], [cx + 70, cy + 40], [cx - 50, cy + 56]])}" fill="#1c1430" stroke="#6a52a8" stroke-width="1.5"/>`);
    let teeth = '';
    for (let i = 0; i < 16; i++) {
      const a0 = i / 16 * Math.PI * 2, a1 = a0 + Math.PI / 16;
      const o = (a, rr) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.92];
      teeth += pz([o(a0, r), o(a0 + 0.05, r + 8), o(a1 - 0.05, r + 8), o(a1, r)]);
    }
    S.add(`<path d="${teeth}${circ(cx, cy, r)}" fill="none" stroke="#c9b8ff" stroke-width="2.2" opacity=".75"/>`);
    S.add(`<path d="M${cx + 4},${cy - 22}A22,22 0 1 0 ${cx + 4},${cy + 22}A16,18 0 1 1 ${cx + 4},${cy - 22}Z" fill="#e8ddff" opacity=".8"/>`);
  }

  // 近处飘过的大碎片（虚化）
  {
    let d = '';
    for (const [x, y, s, a] of [[130, 190, 70, 0.6], [1480, 640, 90, 2.2], [1400, 110, 50, 1.2]]) {
      d += pz([[0, -1], [0.7, 0], [0.1, 1.1], [-0.6, 0.2]].map(([u, v]) => [x + (u * Math.cos(a) - v * Math.sin(a)) * s, y + (u * Math.sin(a) + v * Math.cos(a)) * s]));
    }
    S.add(`<path d="${d}" fill="#3a2a5a" stroke="#9a7ae8" stroke-width="2" opacity=".55" filter="${b1}"/>`);
  }

  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000000', 0], [0.55, '#000000', 0], [1, '#020104', 0.85]], 'cx="50%" cy="48%" r="75%"')}"/>`);
  return S.out();
}

export const gaidenDBgs = {
  'memory-labyrinth-hall': () => labyrinth(false),
  'memory-labyrinth-ruin': () => labyrinth(true),
  'rift-depths': riftDepths,
};
