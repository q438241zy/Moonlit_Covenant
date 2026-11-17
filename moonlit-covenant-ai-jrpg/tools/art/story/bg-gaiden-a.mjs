// 外传《银轨号》正篇第1、2章的场景背景：silver-rail-observation-car（银轨号·观景车厢·夜）、silver-rail-observation-car-day（银轨号·观景车厢·白天）、silver-rail-dark-car（银轨号·熄灯的车厢）、north-snowfield-memory（回忆·北境雪原）、silver-rail-corridor（银轨号·列车走廊·夜）。
//   silver-rail-observation-car     — 一点透视往车厢深处看：两侧一排大窗（窗间柱上系着深红的帘子），头顶是一节一节铜肋的
//                                     玻璃拱顶；靠窗两两相对的深红天鹅绒座椅，窗下小桌上一盏盏琥珀色台灯；暖黄的壁灯；
//                                     窗外是夜、远山与月亮，月光在地毯上铺开一块块银白的光斑；尽头一扇通往下一节车厢的门。
//   silver-rail-observation-car-day — 同一节车厢（同一个生成器、同一套几何），白天：窗外是晴空、云与开阔的原野，灯都熄着，
//                                     阳光在地毯上落成暖色的光斑。
//   silver-rail-dark-car            — 同一节车厢熄了灯：只有窗外的冷月光、窗沿结的霜，和尽头门上方一盏红色的应急灯；
//                                     车厢深处的地上贴着一层暗色的雾。
//   north-snowfield-memory          — 回忆里的北境雪原：漫天风雪，远处被雪埋了一半的营地残骸——塌掉的帐篷、折断的长枪、
//                                     熄灭的篝火圈——一面破了边的赤色军旗斜插在雪里；整张图泛白、四角褪成雪雾。
//   silver-rail-corridor            — 列车走廊·夜：窄长的走廊，左边一扇扇包厢门，右边是车窗与帘子，外面是月夜；壁灯随车身
//                                     晃动（灯罩歪着、光斑被拉长）；走廊尽头一扇关着的车门，门上的小窗透着月光。
// 不画人物，不画能读出的字。
import { Scene, W, H, f, pz, pl, persp, stars, ridge, cloud, rng, mix } from './lib.mjs';

const r0 = (v) => f(v, 0);

// ---------------------------------------------------------------------------------------------
// 银轨号·观景车厢（夜 / 白天 / 熄灯）
// ---------------------------------------------------------------------------------------------
const CAR_PAL = {
  night: {
    p: 'sbGdAObsN', label: '银轨号·观景车厢·夜：一点透视往车厢深处看，两侧一排大窗，窗间柱上系着深红的帘子，头顶是铜肋的玻璃拱顶；靠窗两两相对的深红天鹅绒座椅，窗下小桌上亮着琥珀色台灯，柱上是暖黄的壁灯；窗外是夜、远山与月亮，月光在地毯上铺开一块块银白的光斑；尽头一扇通往下一节车厢的门',
    sky: [[0, '#05071a'], [0.55, '#10163a'], [1, '#232850']], hills: '#0b0d20', hills2: '#141632', ground: '#05060e', star: '#e8ddff',
    wall: '#2e1a26', wallFar: '#3c2632', wain: '#3a2018', wainLit: '#5c3624', wainDark: '#22120c', trim: '#b8904e', pillar: '#26141c',
    frieze: '#21111a', roof: '#1e1220', roof2: '#2a1a2c', rib: '#9a7846', glassTint: '#8a9ad8', glassOp: 0.06,
    floor: [[0, '#2a141c'], [1, '#12080c']], runner: '#561722', runnerEdge: '#a07c44', curtain: '#7a1c2a', curtainLit: '#a8323e', curtainDark: '#3e0c16',
    seat: '#741c2a', seatLit: '#a23442', seatDark: '#3a0e18', wood: '#46281a', woodLit: '#6a4028', end: '#2c1c26', door: '#3c2618', doorLit: '#5a3a26',
    brass: '#d8b070', lamp: '#ffc878', lampOn: true, patch: '#c8d4ff', patchOp: 0.12, moon: '#f2ecff', grade: '#07050c',
  },
  day: {
    p: 'sbGdAObsD', label: '银轨号·观景车厢·白天：同一节观景车厢，窗外是晴空、白云与开阔的原野，远处是淡蓝的山；灯都熄着，阳光从窗和玻璃拱顶照进来，在地毯与座椅上落成暖色的光斑；深红天鹅绒座椅、窗间系着的帘子、尽头的车门',
    sky: [[0, '#6a9ed4'], [0.6, '#a8c8e6'], [1, '#e4ecf0']], hills: '#8aa8b8', hills2: '#a8b88a', ground: '#b8b06a', star: null,
    wall: '#6a4644', wallFar: '#7a5650', wain: '#6a4230', wainLit: '#8e5c40', wainDark: '#4a2c1e', trim: '#d8b070', pillar: '#5a3a38',
    frieze: '#54343a', roof: '#4a3440', roof2: '#5a4450', rib: '#c8a060', glassTint: '#ffffff', glassOp: 0.08,
    floor: [[0, '#6a3a34'], [1, '#3a1e1c']], runner: '#9a3038', runnerEdge: '#d8b070', curtain: '#a8323e', curtainLit: '#d0505a', curtainDark: '#6a1a26',
    seat: '#a8323e', seatLit: '#d0565e', seatDark: '#64182a', wood: '#7a4c30', woodLit: '#a87048', end: '#6a4a48', door: '#7a5034', doorLit: '#a07048',
    brass: '#e8c888', lamp: '#fff2d0', lampOn: false, patch: '#fff0c4', patchOp: 0.3, moon: null, grade: '#2a1810',
  },
  dark: {
    p: 'sbGdADark', label: '银轨号·熄灯的车厢：同一节观景车厢熄了灯，只剩窗外的冷月光与窗沿结的霜；深红的座椅成了暗影，只有边缘泛着冷光；尽头门上方一盏红色的应急灯；车厢深处的地上贴着一层暗色的雾',
    sky: [[0, '#04061a'], [0.55, '#0e1638'], [1, '#1c2650']], hills: '#070914', hills2: '#0c1024', ground: '#030409', star: '#d8e0ff',
    wall: '#0e0c16', wallFar: '#14121e', wain: '#100a0c', wainLit: '#1c1418', wainDark: '#08060a', trim: '#3a3448', pillar: '#0a0810',
    frieze: '#09070e', roof: '#0a0812', roof2: '#100e1a', rib: '#3a3a54', glassTint: '#a8b8ff', glassOp: 0.07,
    floor: [[0, '#0e0a12'], [1, '#040306']], runner: '#1e0c12', runnerEdge: '#2e2a3a', curtain: '#240a12', curtainLit: '#3a1a28', curtainDark: '#12040a',
    seat: '#200a12', seatLit: '#3a1c2c', seatDark: '#0e0408', wood: '#140c0e', woodLit: '#22181e', end: '#0e0a12', door: '#120c10', doorLit: '#1e161c',
    brass: '#4a4658', lamp: '#ff6a5a', lampOn: false, patch: '#b8c8ff', patchOp: 0.2, moon: '#e8f0ff', grade: '#020106', rim: '#8a9ad8',
  },
};

function observationCar(variant) {
  const C = CAR_PAL[variant];
  const day = variant === 'day', dark = variant === 'dark';
  const S = new Scene(C.p, C.label, 9101);
  const R = rng(9102);
  const VP = [800, 400], F = 760, EYE = 1.45;
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const XL = -1.55, XR = 1.55, YW = 2.25, Z0 = 1.05, ZE = 11.0, WY0 = 0.8, WY1 = 2.06;
  const ROOF = [[XL, YW], [-1.32, 2.56], [-0.92, 2.74], [-0.38, 2.82], [0.38, 2.82], [0.92, 2.74], [1.32, 2.56], [XR, YW]];
  const BAY = 1.7, PIL = 0.36, ZS = 2.0;
  const bays = [];
  for (let z = ZS; z + BAY <= ZE - 0.45; z += BAY) bays.push([z + PIL / 2, z + BAY - PIL / 2]);
  const pillars = bays.map(([a]) => a - PIL / 2).concat([bays[bays.length - 1][1] + PIL / 2]);
  const winQuad = (x, [a, b]) => q([[x, WY0, a], [x, WY1, a], [x, WY1, b], [x, WY0, b]]);
  const wins = [...bays.map((b) => winQuad(XL, b)), ...bays.map((b) => winQuad(XR, b))];
  const glassStrips = [];
  for (let i = 1; i < ROOF.length - 2; i++) glassStrips.push(q([[ROOF[i][0], ROOF[i][1], Z0], [ROOF[i + 1][0], ROOF[i + 1][1], Z0], [ROOF[i + 1][0], ROOF[i + 1][1], ZE], [ROOF[i][0], ROOF[i][1], ZE]]));

  // ---- outside: sky, moon or clouds, distant hills, the land, seen through the windows and the glass roof ----------
  {
    const clip = S.clip(wins.join('') + glassStrips.join(''));
    const o = [];
    o.push(`<rect width="${W}" height="${VP[1] + 30}" fill="${S.lin(C.sky, `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${VP[1] + 30}"`)}"/>`);
    if (C.star) o.push(stars(R, 260, [0, 0, W, VP[1] - 20], { fill: C.star, op: dark ? [0.2, 0.8] : [0.25, 0.9] }));
    const moonC = [380, 252];
    if (C.moon) {
      o.push(`<circle cx="${moonC[0]}" cy="${moonC[1]}" r="120" fill="${S.rad([[0, C.moon, dark ? 0.32 : 0.26], [0.35, C.moon, 0.08], [1, C.moon, 0]])}"/>`);
      o.push(`<circle cx="${moonC[0]}" cy="${moonC[1]}" r="23" fill="${C.moon}"/><circle cx="${moonC[0] - 7}" cy="${moonC[1] - 5}" r="7" fill="#c8c0e0" opacity=".35"/><circle cx="${moonC[0] + 8}" cy="${moonC[1] + 7}" r="5" fill="#c8c0e0" opacity=".3"/>`);
    }
    if (day) {
      for (const [x, y, w, h] of [[120, 210, 260, 70], [560, 120, 200, 56], [1120, 180, 300, 80], [1380, 300, 180, 44], [880, 70, 220, 50]]) {
        o.push(cloud(R, x, y, w, h, { shade: '#d8e2ee', lit: '#ffffff', rim: '#fffaf0' }, { bumps: 6 }));
      }
    }
    const far = ridge(S, { base: VP[1] + 6, amp: 26, period: 220, seed: 31, fill: C.hills2, step: 10 });
    const near = ridge(S, { base: VP[1] + 22, amp: 16, period: 140, seed: 37, fill: C.hills, step: 10 });
    o.push(far.svg, near.svg);
    o.push(`<rect y="${VP[1] + 26}" width="${W}" height="${H - VP[1] - 26}" fill="${C.ground}"/>`);
    if (day) {
      let fl = '';
      for (let i = 0; i < 9; i++) fl += `M0,${VP[1] + 34 + i * i * 6}H${W}`;
      o.push(`<path d="${fl}" stroke="#8a8a4a" stroke-width="2" opacity=".35"/>`);
    }
    S.add(`<g clip-path="${clip}">${o.join('')}</g>`);
    // the glass roof's own faint sheen
    S.add(`<path d="${glassStrips.join('')}" fill="${C.glassTint}" opacity="${C.glassOp}"/>`);
  }

  // ---- end wall and the door to the next car --------------------------------------------------------------------
  {
    const o = [];
    const endPts = [[XL, 0], ...ROOF, [XR, 0]].map(([x, y]) => pr(x, y, ZE));
    o.push(`<path d="${pz(endPts)}" fill="${C.end}"/>`);
    o.push(`<path d="${q([[XL, 0, ZE], [XL, WY0, ZE], [XR, WY0, ZE], [XR, 0, ZE]])}" fill="${C.wain}"/>`);
    o.push(`<path d="${q([[-0.5, 0, ZE - 0.01], [-0.5, 2.08, ZE - 0.01], [0.5, 2.08, ZE - 0.01], [0.5, 0, ZE - 0.01]])}" fill="${C.trim}" opacity=".7"/>`);
    o.push(`<path d="${q([[-0.44, 0, ZE - 0.02], [-0.44, 2.02, ZE - 0.02], [0.44, 2.02, ZE - 0.02], [0.44, 0, ZE - 0.02]])}" fill="${C.door}"/>`);
    // the door's small window onto the next car (dim)
    o.push(`<path d="${q([[-0.24, 1.2, ZE - 0.03], [-0.24, 1.78, ZE - 0.03], [0.24, 1.78, ZE - 0.03], [0.24, 1.2, ZE - 0.03]])}" fill="${dark ? '#1a1e34' : day ? '#c8b89a' : '#6a4a2a'}"/>`);
    o.push(`<path d="${q([[-0.3, 0.2, ZE - 0.03], [-0.3, 0.95, ZE - 0.03], [0.3, 0.95, ZE - 0.03], [0.3, 0.2, ZE - 0.03]])}" fill="none" stroke="${C.doorLit}" stroke-width="1.5"/>`);
    const kn = pr(0.34, 1.0, ZE - 0.04);
    o.push(`<circle cx="${r0(kn[0])}" cy="${r0(kn[1])}" r="2.5" fill="${C.brass}"/>`);
    S.add(o.join(''));
    // the red emergency lamp above the door (lit only when the car is dark)
    const el = pr(0, 2.24, ZE - 0.05);
    if (dark) {
      S.add(`<circle cx="${r0(el[0])}" cy="${r0(el[1])}" r="240" fill="${S.rad([[0, C.lamp, 0.55], [0.18, '#c83040', 0.22], [1, '#c83040', 0]])}"/>`);
      S.add(`<rect x="${r0(el[0] - 9)}" y="${r0(el[1] - 4)}" width="18" height="8" rx="2" fill="#ff8a7a"/>`);
    } else {
      S.add(`<rect x="${r0(el[0] - 9)}" y="${r0(el[1] - 4)}" width="18" height="8" rx="2" fill="${day ? '#a87a6a' : '#5a2a2a'}"/>`);
    }
  }

  // ---- floor: carpet, the runner, the patches of moon- or sunlight ----------------------------------------------
  {
    const o = [];
    o.push(`<path d="${q([[XL, 0, Z0], [XR, 0, Z0], [XR, 0, ZE], [XL, 0, ZE]])}" fill="${S.lin(C.floor, `gradientUnits="userSpaceOnUse" x1="0" y1="${H}" x2="0" y2="${VP[1]}"`)}"/>`);
    o.push(`<path d="${q([[-0.5, 0.002, Z0], [0.5, 0.002, Z0], [0.5, 0.002, ZE], [-0.5, 0.002, ZE]])}" fill="${C.runner}"/>`);
    o.push(`<path d="${pl(pr.poly([[-0.43, 0.003, Z0], [-0.43, 0.003, ZE]])) + pl(pr.poly([[0.43, 0.003, Z0], [0.43, 0.003, ZE]]))}" stroke="${C.runnerEdge}" stroke-width="2" opacity=".55"/>`);
    let dia = '';
    for (let z = 1.6; z < ZE - 0.3; z += 0.9) dia += q([[0, 0.003, z - 0.22], [0.2, 0.003, z], [0, 0.003, z + 0.22], [-0.2, 0.003, z]]);
    o.push(`<path d="${dia}" fill="none" stroke="${C.runnerEdge}" stroke-width="1.2" opacity=".35"/>`);
    // light through the left windows falls across the floor toward the right (moon or sun from the upper left)
    let pt = '';
    for (const [a, b] of bays) pt += q([[XL + 0.02, 0.004, a + 0.15], [XL + 0.02, 0.004, b + 0.15], [0.55, 0.004, b + 1.25], [0.55, 0.004, a + 1.25]]);
    o.push(`<path d="${pt}" fill="${C.patch}" opacity="${C.patchOp}"/>`);
    if (day) {
      let pr2 = '';
      for (const [a, b] of bays) pr2 += q([[0.65, 0.004, a + 0.9], [0.65, 0.004, b + 0.9], [XR - 0.02, 0.004, b + 1.6], [XR - 0.02, 0.004, a + 1.6]]);
      o.push(`<path d="${pr2}" fill="${C.patch}" opacity=".16"/>`);
    }
    S.add(o.join(''));
  }

  // ---- side walls (window holes), wainscot, frieze, window frames, curtains --------------------------------------
  for (const side of [-1, 1]) {
    const x = side < 0 ? XL : XR;
    const o = [];
    const wall = q([[x, 0, Z0], [x, YW, Z0], [x, YW, ZE], [x, 0, ZE]]);
    const grad = S.lin(side < 0 ? [[0, C.pillar], [1, C.wallFar]] : [[0, C.wallFar], [1, C.pillar]], `gradientUnits="userSpaceOnUse" x1="${side < 0 ? 0 : W}" y1="0" x2="${VP[0]}" y2="0"`);
    o.push(`<path d="${wall}${bays.map((b) => winQuad(x, b)).join('')}" fill="${grad}" fill-rule="evenodd"/>`);
    o.push(`<path d="${q([[x, 0, Z0], [x, WY0 - 0.04, Z0], [x, WY0 - 0.04, ZE], [x, 0, ZE]])}" fill="${C.wain}"/>`);
    let pn = '';
    for (const [a, b] of bays) pn += q([[x, 0.12, a + 0.08], [x, WY0 - 0.16, a + 0.08], [x, WY0 - 0.16, b - 0.08], [x, 0.12, b - 0.08]]);
    o.push(`<path d="${pn}" fill="none" stroke="${C.wainDark}" stroke-width="2"/>`);
    o.push(`<path d="${pl(pr.poly([[x, WY0 - 0.04, Z0], [x, WY0 - 0.04, ZE]]))}" stroke="${C.wainLit}" stroke-width="3"/>`);
    o.push(`<path d="${q([[x, WY1 + 0.04, Z0], [x, YW, Z0], [x, YW, ZE], [x, WY1 + 0.04, ZE]])}" fill="${C.frieze}"/>`);
    // gilt window frames
    let fr = '';
    for (const [a, b] of bays) fr += pl(pr.poly([[x, WY0, a], [x, WY1, a], [x, WY1, b], [x, WY0, b], [x, WY0, a]]));
    o.push(`<path d="${fr}" fill="none" stroke="${C.trim}" stroke-width="3" stroke-linejoin="round" opacity=".85"/>`);
    let mul = '';
    for (const [a, b] of bays) mul += pl(pr.poly([[x, (WY0 + WY1) / 2 + 0.25, a], [x, (WY0 + WY1) / 2 + 0.25, b]]));
    o.push(`<path d="${mul}" stroke="${C.trim}" stroke-width="2" opacity=".55"/>`);
    // window sill
    let sill = '';
    for (const [a, b] of bays) sill += q([[x, WY0, a - 0.04], [x - side * 0.08, WY0, a - 0.04], [x - side * 0.08, WY0, b + 0.04], [x, WY0, b + 0.04]]);
    o.push(`<path d="${sill}" fill="${C.woodLit}"/>`);
    // curtains gathered on every pillar
    let cu = '', cuL = '';
    for (const z of pillars) {
      if (z > ZE - 0.3) continue;
      const xc = x - side * 0.03;
      const pts = [[z - 0.3, WY1 + 0.04], [z + 0.3, WY1 + 0.04], [z + 0.14, 1.25], [z + 0.2, 0.84], [z - 0.2, 0.84], [z - 0.14, 1.25]].map(([zz, y]) => pr(xc, y, zz));
      cu += pz(pts);
      cuL += pz([[z - 0.3, WY1 + 0.04], [z - 0.12, WY1 + 0.04], [z - 0.05, 1.25], [z - 0.14, 1.25]].map(([zz, y]) => pr(xc - side * 0.005, y, zz)));
    }
    o.push(`<path d="${cu}" fill="${C.curtain}"/><path d="${cuL}" fill="${side < 0 ? C.curtainLit : C.curtainDark}" opacity=".8"/>`);
    let tie = '';
    for (const z of pillars) { if (z > ZE - 0.3) continue; const t = pr(x - side * 0.04, 1.25, z); const k = F / z; tie += `M${r0(t[0] - 0.07 * k)},${r0(t[1])}h${r0(0.14 * k)}`; }
    o.push(`<path d="${tie}" stroke="${C.trim}" stroke-width="4" stroke-linecap="round" opacity=".8"/>`);
    // wall sconces above the curtains
    for (const z of pillars) {
      if (z > ZE - 0.3) continue;
      const c = pr(x - side * 0.1, 2.16, z), k = F / z;
      if (C.lampOn) o.push(`<circle cx="${r0(c[0])}" cy="${r0(c[1])}" r="${r0(1.35 * k)}" fill="${S.rad([[0, C.lamp, 0.5], [0.22, '#ff9a50', 0.16], [1, '#ff9a50', 0]])}"/>`);
      o.push(`<path d="M${r0(c[0] - 0.05 * k)},${r0(c[1] + 0.06 * k)}q${r0(0.05 * k)},${r0(-0.16 * k)} ${r0(0.1 * k)},0z" fill="${C.lampOn ? '#ffe2a8' : dark ? '#2a2632' : '#d8c8a8'}"/><path d="M${r0(c[0] - 0.07 * k)},${r0(c[1] + 0.06 * k)}h${r0(0.14 * k)}" stroke="${C.brass}" stroke-width="${f(Math.max(1, 0.025 * k), 1)}"/>`);
    }
    if (dark) {
      // frost along the bottom and the edges of each window
      let fz = '';
      for (const [a, b] of bays.slice(1)) {
        for (let i = 0; i < 9; i++) {
          const z = a + (b - a) * (i + R()) / 9, h = 0.03 + R() * 0.07;
          const p0 = pr(x, WY0, z - 0.03), p1 = pr(x, WY0 + h, z), p2 = pr(x, WY0, z + 0.03);
          fz += pz([p0, p1, p2]);
        }
        for (const zz of [a, b]) for (let i = 0; i < 4; i++) {
          const y = WY0 + 0.1 + R() * (WY1 - WY0 - 0.2), d = (zz === a ? 1 : -1) * (0.04 + R() * 0.06);
          fz += pz([pr(x, y - 0.03, zz), pr(x, y, zz + d), pr(x, y + 0.03, zz)]);
        }
      }
      o.push(`<path d="${fz}" fill="#dce6ff" opacity=".35"/>`);
    }
    S.add(o.join(''));
  }

  // ---- roof: solid edge strips, glass panels between brass ribs ------------------------------------------------
  {
    const o = [];
    const strip = (i) => q([[ROOF[i][0], ROOF[i][1], Z0], [ROOF[i + 1][0], ROOF[i + 1][1], Z0], [ROOF[i + 1][0], ROOF[i + 1][1], ZE], [ROOF[i][0], ROOF[i][1], ZE]]);
    o.push(`<path d="${strip(0)}" fill="${C.roof2}"/><path d="${strip(ROOF.length - 2)}" fill="${C.roof}"/>`);
    let ribs = '';
    for (const z of [...pillars, ZE - 0.02]) ribs += pl(ROOF.map(([x, y]) => pr(x, y, z)));
    let longi = '';
    for (let i = 1; i < ROOF.length - 1; i++) longi += pl(pr.poly([[ROOF[i][0], ROOF[i][1], Z0], [ROOF[i][0], ROOF[i][1], ZE]]));
    o.push(`<path d="${longi}" fill="none" stroke="${C.rib}" stroke-width="3" opacity=".75"/>`);
    o.push(`<path d="${ribs}" fill="none" stroke="${C.rib}" stroke-width="7" stroke-linejoin="round"/>`);
    o.push(`<path d="${ribs}" fill="none" stroke="${C.brass}" stroke-width="2" opacity="${dark ? 0.25 : 0.5}" transform="translate(-2 -2)"/>`);
    // cornice
    o.push(`<path d="${pl(pr.poly([[XL, YW, Z0], [XL, YW, ZE], [XR, YW, ZE], [XR, YW, Z0]]))}" fill="none" stroke="${C.trim}" stroke-width="4"/>`);
    S.add(o.join(''));
  }

  // ---- seats and tables, far to near on both sides ----------------------------------------------------------------
  {
    // visible faces of an axis-aligned box: the near face, the top (below eye level), the face toward the aisle
    const box = (x0, x1, y0, y1, z0, z1, c) => {
      let s = '';
      if (x1 < 0) s += `<path d="${q([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]])}" fill="${c.side}"/>`;
      if (x0 > 0) s += `<path d="${q([[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]])}" fill="${c.side}"/>`;
      if (y1 < EYE) s += `<path d="${q([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])}" fill="${c.top}"/>`;
      s += `<path d="${q([[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]])}" fill="${c.front}"/>`;
      return s;
    };
    const velvet = { front: C.seat, top: C.seatLit, side: C.seatDark };
    const velvetBack = { front: C.seatDark, top: C.seatLit, side: C.seat };
    const woodC = { front: C.wood, top: C.woodLit, side: C.wood };
    const items = [];
    const D = 0.74;
    for (const side of [-1, 1]) {
      const xa = side < 0 ? XL : XR - D, xb = side < 0 ? XL + D : XR;
      for (const [a, b] of bays) {
        const mid = (a + b) / 2;
        // the far seat faces us: cushion, then its backrest behind it
        items.push({ z: b, svg: () => {
          let s = box(xa, xb, 0.44, 1.0, b - 0.18, b - 0.02, velvet) + box(xa, xb, 0, 0.44, b - 0.66, b - 0.18, velvet);
          // tufting on the backrest
          let tf = '';
          for (const u of [0.25, 0.5, 0.75]) for (const yy of [0.66, 0.86]) { const p = pr(xa + (xb - xa) * u, yy, b - 0.181); tf += `M${r0(p[0])},${r0(p[1])}h0.1`; }
          s += `<path d="${tf}" stroke="${C.seatDark}" stroke-width="${f(Math.max(1.2, 0.04 * F / b), 1)}" stroke-linecap="round" opacity=".7"/>`;
          if (C.rim) s += `<path d="${pl(pr.poly([[xa, 1.0, b - 0.18], [xb, 1.0, b - 0.18]]))}" stroke="${C.rim}" stroke-width="1.5" opacity=".5"/>`;
          return s;
        } });
        // the small table under the window, with its lamp
        items.push({ z: mid + 0.22, svg: () => {
          const t0 = side < 0 ? XL : XR - 0.42, t1 = side < 0 ? XL + 0.42 : XR;
          let s = box(t0, t1, 0.64, 0.68, mid - 0.22, mid + 0.22, woodC);
          const lc = (t0 + t1) / 2 - side * 0.06;
          s += box(lc - 0.015, lc + 0.015, 0, 0.64, mid - 0.015, mid + 0.015, woodC);
          const lp = pr(lc, 0.68, mid), k = F / mid;
          s += `<path d="M${r0(lp[0])},${r0(lp[1])}v${r0(-0.26 * k)}" stroke="${C.brass}" stroke-width="${f(Math.max(1, 0.02 * k), 1)}"/>`;
          const sh = [[lp[0] - 0.06 * k, lp[1] - 0.24 * k], [lp[0] + 0.06 * k, lp[1] - 0.24 * k], [lp[0] + 0.04 * k, lp[1] - 0.35 * k], [lp[0] - 0.04 * k, lp[1] - 0.35 * k]];
          if (C.lampOn) s += `<circle cx="${r0(lp[0])}" cy="${r0(lp[1] - 0.29 * k)}" r="${r0(0.7 * k)}" fill="${S.rad([[0, C.lamp, 0.5], [0.3, '#ff9a50', 0.14], [1, '#ff9a50', 0]])}"/>`;
          s += `<path d="${pz(sh)}" fill="${C.lampOn ? '#ffd890' : dark ? '#1e1a22' : '#e8d8b8'}"/>`;
          return s;
        } });
        // the near seat has its back to us
        items.push({ z: a, svg: () => {
          let s = box(xa, xb, 0, 0.44, a + 0.16, a + 0.66, velvet) + box(xa, xb, 0, 1.0, a + 0.02, a + 0.16, velvetBack);
          const piping = pl(pr.poly([[xa, 0.96, a + 0.019], [xb, 0.96, a + 0.019]]));
          s += `<path d="${piping}" stroke="${C.trim}" stroke-width="${f(Math.max(1, 0.025 * F / a), 1)}" opacity=".5"/>`;
          if (C.rim) s += `<path d="${pl(pr.poly([[xa, 1.0, a + 0.02], [xb, 1.0, a + 0.02], [xb, 1.0, a + 0.16]]))}" stroke="${C.rim}" stroke-width="2" opacity=".55"/>`;
          return s;
        } });
      }
    }
    items.sort((m, n) => n.z - m.z);
    S.add(items.map((it) => it.svg()).join(''));
  }

  // ---- dark: a low haze of dark mist hugging the floor at the far end -------------------------------------------
  if (dark) {
    const m = pr(0, 0.2, 9.5);
    S.add(`<ellipse cx="${r0(m[0])}" cy="${r0(m[1])}" rx="300" ry="46" fill="#05030c" opacity=".7" filter="${S.blur(3)}"/>`);
    S.add(`<ellipse cx="${r0(m[0] - 120)}" cy="${r0(m[1] - 30)}" rx="140" ry="40" fill="#1a1030" opacity=".5" filter="${S.blur(3)}"/>`);
  }

  // ---- grading ------------------------------------------------------------------------------------------------------
  if (day) S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#fff4d8', 0.18], [1, '#fff4d8', 0]], 'cx="0.2" cy="0.05" r="0.7"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.4, C.grade, 0], [1, C.grade, day ? 0.35 : 0.7]], 'cx="0.5" cy="0.45" r="0.78"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, C.grade, 0], [1, C.grade, day ? 0.35 : 0.6]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 银轨号·列车走廊·夜
// ---------------------------------------------------------------------------------------------
function corridor() {
  const S = new Scene('sbGdACorr', '银轨号·列车走廊·夜：窄长的走廊，左边一扇扇关着的包厢门，右边是车窗与系起的帘子，窗外是月夜；壁灯随车身晃动，灯罩歪着，光斑被拉长；地上一条长地毯；走廊尽头一扇关着的车门，门上的小窗透着月光', 9201);
  const R = rng(9202);
  const VP = [760, 410], F = 720, EYE = 1.5;
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const XL = -0.62, XR = 0.62, YC = 2.3, Z0 = 0.32, ZE = 11.5, WY0 = 0.95, WY1 = 1.95;
  const P = {
    wall: '#3a2a2a', wallDark: '#221616', wain: '#4a2c20', wainDark: '#2a1810', trim: '#b8904e', door: '#5a3624', doorLit: '#7a4c32', doorDark: '#301c12',
    ceil: '#1a1012', floor: [[0, '#2a1818'], [1, '#100808']], runner: '#5a1a24', lamp: '#ffc878', brass: '#d8b070', curtain: '#741c2a', curtainDark: '#3e0c16',
    sky: [[0, '#06081c'], [0.6, '#121a3c'], [1, '#222a50']], hills: '#0a0c1c', moon: '#eef0ff',
  };
  const bays = [];
  for (let z = 0.45; z < ZE - 1.2; z += 1.9) bays.push([z + 0.25, z + 1.55]);

  S.add(`<rect width="${W}" height="${H}" fill="#0a0606"/>`);
  // ---- outside through the right-hand windows and the end door's window --------------------------------------------
  const winR = bays.map(([a, b]) => q([[XR, WY0, a], [XR, WY1, a], [XR, WY1, b], [XR, WY0, b]]));
  const endWin = q([[-0.16, 1.15, ZE - 0.02], [-0.16, 1.75, ZE - 0.02], [0.16, 1.75, ZE - 0.02], [0.16, 1.15, ZE - 0.02]]);
  {
    const clip = S.clip(winR.join('') + endWin);
    const o = [];
    o.push(`<rect width="${W}" height="${VP[1] + 40}" fill="${S.lin(P.sky, `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${VP[1] + 40}"`)}"/>`);
    o.push(stars(R, 200, [VP[0], 0, W, VP[1]], { fill: '#e8ddff' }));
    const mc = [1170, 240];
    o.push(`<circle cx="${mc[0]}" cy="${mc[1]}" r="130" fill="${S.rad([[0, P.moon, 0.3], [0.35, P.moon, 0.08], [1, P.moon, 0]])}"/><circle cx="${mc[0]}" cy="${mc[1]}" r="30" fill="${P.moon}"/>`);
    o.push(ridge(S, { base: VP[1] + 14, amp: 22, period: 180, seed: 53, fill: P.hills, step: 10 }).svg);
    o.push(`<rect y="${VP[1] + 30}" width="${W}" height="${H}" fill="#04050c"/>`);
    // a soft moonlit glow in the end door's little window
    const ew = pr(0, 1.45, ZE);
    o.push(`<circle cx="${r0(ew[0])}" cy="${r0(ew[1])}" r="40" fill="${S.rad([[0, '#c8d4ff', 0.5], [1, '#c8d4ff', 0]])}"/>`);
    S.add(`<g clip-path="${clip}">${o.join('')}</g>`);
  }

  // ---- end wall, the closed door -----------------------------------------------------------------------------------
  {
    const o = [];
    o.push(`<path d="${q([[XL, 0, ZE], [XL, YC, ZE], [XR, YC, ZE], [XR, 0, ZE]])}${endWin}" fill="${P.wallDark}" fill-rule="evenodd"/>`);
    o.push(`<path d="${q([[-0.38, 0, ZE - 0.01], [-0.38, 2.06, ZE - 0.01], [0.38, 2.06, ZE - 0.01], [0.38, 0, ZE - 0.01]])}${endWin}" fill="${P.door}" fill-rule="evenodd"/>`);
    o.push(`<path d="${pl(pr.poly([[-0.16, 1.15, ZE - 0.02], [-0.16, 1.75, ZE - 0.02], [0.16, 1.75, ZE - 0.02], [0.16, 1.15, ZE - 0.02], [-0.16, 1.15, ZE - 0.02]]))}" fill="none" stroke="${P.trim}" stroke-width="2"/>`);
    const kn = pr(0.3, 1.0, ZE - 0.02);
    o.push(`<circle cx="${r0(kn[0])}" cy="${r0(kn[1])}" r="2" fill="${P.brass}"/>`);
    S.add(o.join(''));
  }

  // ---- ceiling, floor, runner, the moonlight from the windows --------------------------------------------------------
  {
    const o = [];
    o.push(`<path d="${q([[XL, YC, Z0], [XR, YC, Z0], [XR, YC, ZE], [XL, YC, ZE]])}" fill="${P.ceil}"/>`);
    let bm = '';
    for (let z = 1.0; z < ZE; z += 0.95) bm += pl(pr.poly([[XL, YC, z], [XR, YC, z]]));
    o.push(`<path d="${bm}" stroke="#2a1a1c" stroke-width="5"/>`);
    o.push(`<path d="${q([[XL, 0, Z0], [XR, 0, Z0], [XR, 0, ZE], [XL, 0, ZE]])}" fill="${S.lin(P.floor, `gradientUnits="userSpaceOnUse" x1="0" y1="${H}" x2="0" y2="${VP[1]}"`)}"/>`);
    o.push(`<path d="${q([[-0.38, 0.002, Z0], [0.38, 0.002, Z0], [0.38, 0.002, ZE], [-0.38, 0.002, ZE]])}" fill="${P.runner}"/>`);
    o.push(`<path d="${pl(pr.poly([[-0.32, 0.003, Z0], [-0.32, 0.003, ZE]])) + pl(pr.poly([[0.32, 0.003, Z0], [0.32, 0.003, ZE]]))}" stroke="${P.trim}" stroke-width="1.6" opacity=".45"/>`);
    let mp = '';
    for (const [a, b] of bays) mp += q([[XR - 0.01, 0.004, a + 0.3], [XR - 0.01, 0.004, b + 0.3], [-0.3, 0.004, b + 1.1], [-0.3, 0.004, a + 1.1]]);
    o.push(`<path d="${mp}" fill="#c8d4ff" opacity=".1"/>`);
    S.add(o.join(''));
  }

  // ---- left wall: compartment doors ----------------------------------------------------------------------------------
  {
    const o = [];
    o.push(`<path d="${q([[XL, 0, Z0], [XL, YC, Z0], [XL, YC, ZE], [XL, 0, ZE]])}" fill="${S.lin([[0, P.wallDark], [1, P.wall]], `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${VP[0]}" y2="0"`)}"/>`);
    o.push(`<path d="${q([[XL, 0, Z0], [XL, 0.9, Z0], [XL, 0.9, ZE], [XL, 0, ZE]])}" fill="${P.wain}"/>`);
    o.push(`<path d="${pl(pr.poly([[XL, 0.9, Z0], [XL, 0.9, ZE]])) + pl(pr.poly([[XL, 2.1, Z0], [XL, 2.1, ZE]]))}" stroke="${P.trim}" stroke-width="3" opacity=".7"/>`);
    for (const [a, b] of bays) {
      const d0 = a + 0.15, d1 = b - 0.25;
      o.push(`<path d="${q([[XL + 0.005, 0, d0 - 0.06], [XL + 0.005, 2.06, d0 - 0.06], [XL + 0.005, 2.06, d1 + 0.06], [XL + 0.005, 0, d1 + 0.06]])}" fill="${P.doorDark}"/>`);
      o.push(`<path d="${q([[XL + 0.01, 0, d0], [XL + 0.01, 2.0, d0], [XL + 0.01, 2.0, d1], [XL + 0.01, 0, d1]])}" fill="${S.lin([[0, P.door], [1, P.doorLit]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
      // a small frosted pane with warm light behind it, and the lower panel
      o.push(`<path d="${q([[XL + 0.012, 1.38, d0 + 0.16], [XL + 0.012, 1.8, d0 + 0.16], [XL + 0.012, 1.8, d1 - 0.16], [XL + 0.012, 1.38, d1 - 0.16]])}" fill="#b08860" opacity=".42"/>`);
      o.push(`<path d="${q([[XL + 0.012, 0.15, d0 + 0.12], [XL + 0.012, 0.95, d0 + 0.12], [XL + 0.012, 0.95, d1 - 0.12], [XL + 0.012, 0.15, d1 - 0.12]])}" fill="none" stroke="${P.doorDark}" stroke-width="2"/>`);
      const kn = pr(XL + 0.02, 1.0, d1 - 0.06), k = F / (d1 - 0.06);
      o.push(`<path d="M${r0(kn[0])},${r0(kn[1])}h${r0(0.06 * k)}" stroke="${P.brass}" stroke-width="${f(Math.max(1.5, 0.025 * k), 1)}" stroke-linecap="round"/>`);
    }
    S.add(o.join(''));
  }

  // ---- right wall: windows, gathered curtains -----------------------------------------------------------------------
  {
    const o = [];
    const wall = q([[XR, 0, Z0], [XR, YC, Z0], [XR, YC, ZE], [XR, 0, ZE]]);
    o.push(`<path d="${wall}${winR.join('')}" fill="${S.lin([[0, P.wall], [1, P.wallDark]], `gradientUnits="userSpaceOnUse" x1="${VP[0]}" y1="0" x2="${W}" y2="0"`)}" fill-rule="evenodd"/>`);
    o.push(`<path d="${q([[XR, 0, Z0], [XR, 0.9, Z0], [XR, 0.9, ZE], [XR, 0, ZE]])}" fill="${P.wainDark}"/>`);
    o.push(`<path d="${pl(pr.poly([[XR, 0.9, Z0], [XR, 0.9, ZE]]))}" stroke="${P.trim}" stroke-width="3" opacity=".6"/>`);
    let fr = '', cu = '';
    for (const [a, b] of bays) {
      fr += pl(pr.poly([[XR, WY0, a], [XR, WY1, a], [XR, WY1, b], [XR, WY0, b], [XR, WY0, a]]));
      for (const [z, dir] of [[a, 1], [b, -1]]) {
        cu += pz([[z - dir * 0.04, WY1 + 0.08], [z + dir * 0.22, WY1 + 0.08], [z + dir * 0.1, 1.35], [z + dir * 0.14, WY0 - 0.06], [z - dir * 0.04, WY0 - 0.06]].map(([zz, y]) => pr(XR - 0.02, y, zz)));
      }
    }
    o.push(`<path d="${fr}" fill="none" stroke="${P.trim}" stroke-width="3" opacity=".8"/>`);
    o.push(`<path d="${cu}" fill="${P.curtain}"/>`);
    S.add(o.join(''));
  }

  // ---- the swaying wall lamps on the left wall (shades tilted, light pools stretched) --------------------------------
  {
    const o = [];
    bays.forEach(([a, b], i) => {
      const z = b + 0.1, tilt = [14, -9, 11, -6, 8][i % 5];
      const c = pr(XL + 0.12, 2.0, z), k = F / z;
      o.push(`<ellipse cx="${r0(c[0] + tilt * 0.06 * k * 0.1)}" cy="${r0(c[1] + 0.1 * k)}" rx="${r0(0.8 * k)}" ry="${r0(1.0 * k)}" fill="${S.rad([[0, P.lamp, 0.34], [0.3, '#ff9a50', 0.1], [1, '#ff9a50', 0]])}" transform="rotate(${tilt} ${r0(c[0])} ${r0(c[1])})"/>`);
      const arm = pr(XL + 0.005, 2.06, z);
      o.push(`<path d="M${r0(arm[0])},${r0(arm[1])}L${r0(c[0])},${r0(c[1] - 0.06 * k)}" stroke="${P.brass}" stroke-width="${f(Math.max(1.2, 0.02 * k), 1)}"/>`);
      o.push(`<g transform="rotate(${tilt} ${r0(c[0])} ${r0(c[1] - 0.06 * k)})"><path d="M${r0(c[0] - 0.07 * k)},${r0(c[1] + 0.06 * k)}L${r0(c[0] - 0.035 * k)},${r0(c[1] - 0.06 * k)}h${r0(0.07 * k)}L${r0(c[0] + 0.07 * k)},${r0(c[1] + 0.06 * k)}z" fill="#ffd890"/><path d="M${r0(c[0] - 0.07 * k)},${r0(c[1] + 0.06 * k)}h${r0(0.14 * k)}" stroke="${P.brass}" stroke-width="${f(Math.max(1, 0.015 * k), 1)}"/></g>`);
      // the warm pool on the floor below, pushed to one side by the swing
      const fp = pr(XL + 0.32 + tilt * 0.006, 0.004, z + 0.2);
      o.push(`<ellipse cx="${r0(fp[0])}" cy="${r0(fp[1])}" rx="${r0(0.42 * k)}" ry="${r0(0.1 * k)}" fill="${P.lamp}" opacity=".07" transform="rotate(${-tilt * 0.4} ${r0(fp[0])} ${r0(fp[1])})"/>`);
    });
    S.add(o.join(''));
  }

  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.38, '#060306', 0], [1, '#060306', 0.72]], 'cx="0.48" cy="0.46" r="0.78"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#080406', 0], [1, '#080406', 0.6]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 回忆·北境雪原
// ---------------------------------------------------------------------------------------------
function snowfield() {
  const S = new Scene('sbGdASnow', '回忆·北境雪原：漫天风雪，灰白的天，远山只剩淡影；雪地上被埋了一半的营地残骸——塌掉的帐篷、折断的长枪、熄灭的篝火圈——一面破了边的赤色军旗斜插在雪里；整张图泛白，四角褪成雪雾；没有人', 9301);
  const R = rng(9302);
  const HZ = 470;
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#9aa6b6'], [0.45, '#c4ccd6'], [0.6, '#d4dae2'], [1, '#e6eaee']])}"/>`);
  // far mountains, almost swallowed by the snow
  S.add(ridge(S, { base: HZ - 60, amp: 70, period: 300, seed: 71, fill: '#aeb8c6', step: 10, ridged: true }).svg);
  S.add(ridge(S, { base: HZ - 18, amp: 40, period: 200, seed: 73, fill: '#bcc4d0', step: 10, shade: '#9aa4b4', shadeOp: 0.35 }).svg);
  S.add(`<rect y="${HZ - 120}" width="${W}" height="200" fill="${S.lin([[0, '#d8dee6', 0], [0.6, '#d8dee6', 0.65], [1, '#d8dee6', 0]])}"/>`);
  // the snowfield, in long drifts
  const g1 = ridge(S, { base: HZ + 30, amp: 18, period: 260, seed: 75, fill: '#dfe4ea', step: 10 });
  const g2 = ridge(S, { base: HZ + 120, amp: 30, period: 340, seed: 77, fill: '#e8ecf0', step: 10 });
  const g3 = ridge(S, { base: HZ + 260, amp: 40, period: 420, seed: 79, fill: '#f0f2f4', step: 10 });
  S.add(g1.svg);
  // ---- the ruined camp on the middle drift ----------------------------------------------------------------------
  {
    const o = [];
    const y0 = g1.yAt(760) + 8;
    // collapsed tents, half buried: dark canvas triangles with snow on their ridges
    for (const [x, w, h, lean] of [[520, 120, 54, -0.3], [690, 90, 40, 0.5], [880, 150, 30, 0.1], [1060, 100, 46, -0.6]]) {
      const yb = g1.yAt(x) + 10;
      const apex = [x + w * (0.5 + lean * 0.25), yb - h];
      o.push(`<path d="${pz([[x, yb], apex, [x + w, yb]])}" fill="#5e4648"/><path d="${pz([apex, [x + w, yb], [x + w * 0.62, yb]])}" fill="#3e2e34"/>`);
      const m = [apex[0] + (x - apex[0]) * 0.5, apex[1] + (yb - apex[1]) * 0.5];
      o.push(`<path d="${pz([apex, m, [m[0] + 7, m[1] + 3], [apex[0] + 4, apex[1] + 7]])}" fill="#f2f4f6" opacity=".9"/>`);
      o.push(`<path d="M${x - 12},${r0(yb + 3)}Q${r0(x + w * 0.3)},${r0(yb - h * 0.3)} ${r0(x + w * 0.55)},${r0(yb - h * 0.18)}T${x + w + 12},${r0(yb + 3)}Z" fill="#e6eaee"/>`);
    }
    // broken spears and poles
    let sp = '';
    for (const [x, l, a] of [[600, 90, -70], [640, 60, -100], [800, 110, -62], [960, 70, -115], [1000, 50, -80], [1150, 85, -96]]) {
      const yb = g1.yAt(x) + 14, rad = a * Math.PI / 180;
      sp += `M${x},${r0(yb)}l${r0(Math.cos(rad) * l)},${r0(Math.sin(rad) * l)}`;
    }
    o.push(`<path d="${sp}" stroke="#3a3034" stroke-width="3" stroke-linecap="round"/>`);
    // the dead campfire ring
    const fx = 760, fy = y0 + 30;
    let ring = '';
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; ring += `M${r0(fx + Math.cos(a) * 34 - 6)},${r0(fy + Math.sin(a) * 9)}a6,4 0 1 0 12,0a6,4 0 1 0 -12,0`; }
    o.push(`<path d="${ring}" fill="#5a5258"/><path d="M${fx - 18},${fy}l36,-4M${fx - 14},${fy + 3}l30,3" stroke="#2a2226" stroke-width="4" stroke-linecap="round"/>`);
    o.push(`<ellipse cx="${fx}" cy="${fy + 1}" rx="16" ry="4" fill="#c86a3a" opacity=".35"/>`);
    S.add(`<g opacity=".92">${o.join('')}</g>`);
  }
  S.add(g2.svg);
  // ---- the crimson banner, planted askew in the near drift --------------------------------------------------------
  {
    const bx = 1180, by = g2.yAt(1180) + 6;
    const top = [bx - 46, by - 330];
    S.add(`<path d="M${bx},${r0(by)}L${top[0]},${top[1]}" stroke="#2e2428" stroke-width="7" stroke-linecap="round"/>`);
    // the cloth streams to the right in the wind, the far edge torn
    const cloth = [[top[0] + 4, top[1] + 8], [top[0] + 70, top[1] - 4, 0], [top[0] + 150, top[1] + 10], [top[0] + 210, top[1] + 4, 1], [top[0] + 196, top[1] + 30, 1], [top[0] + 218, top[1] + 46, 1], [top[0] + 190, top[1] + 62, 1], [top[0] + 206, top[1] + 84, 1], [top[0] + 140, top[1] + 96], [top[0] + 70, top[1] + 112], [top[0] - 2, top[1] + 120, 1]];
    const d = 'M' + cloth.map(([x, y]) => `${r0(x)},${r0(y)}`).join('L') + 'Z';
    S.add(`<path d="${d}" fill="#a82838"/>`);
    S.add(`<path d="M${top[0] + 6},${top[1] + 60}C${top[0] + 70},${top[1] + 44} ${top[0] + 130},${top[1] + 70} ${top[0] + 196},${top[1] + 52}L${top[0] + 190},${top[1] + 64}C${top[0] + 128},${top[1] + 86} ${top[0] + 70},${top[1] + 62} ${top[0] + 4},${top[1] + 80}Z" fill="#7a1626" opacity=".7"/>`);
    // a plain gold stripe along the hoist (no emblem, nothing legible) and snow caked on the top edge
    S.add(`<path d="M${top[0] + 6},${top[1] + 10}L${top[0] + 18},${top[1] + 10}L${top[0] + 16},${top[1] + 118}L${top[0] + 4},${top[1] + 118}Z" fill="#d8b070" opacity=".85"/>`);
    S.add(`<path d="M${top[0] + 4},${top[1] + 8}Q${top[0] + 70},${top[1] - 10} ${top[0] + 150},${top[1] + 8}" fill="none" stroke="#f4f6f8" stroke-width="4" stroke-linecap="round" opacity=".8"/>`);
    S.add(`<ellipse cx="${bx}" cy="${r0(by + 2)}" rx="34" ry="7" fill="#c8d0da"/>`);
  }
  S.add(g3.svg);
  // a broken lance stuck in the foreground snow (left), a torn red ribbon on it
  {
    const x = 250, y = r0(g3.yAt(250) + 24);
    S.add(`<path d="M${x},${y}L${x + 62},${y - 250}" stroke="#3a3034" stroke-width="9" stroke-linecap="round"/><path d="M${x + 62},${y - 250}l-6,-14l10,6l2,-12l4,16" fill="#3a3034"/>`);
    S.add(`<path d="M${x + 50},${y - 200}q34,6 60,-6q-14,14 -6,26q-30,-8 -56,0z" fill="#a82838" opacity=".9"/>`);
    S.add(`<ellipse cx="${x}" cy="${y + 2}" rx="40" ry="8" fill="#dde2e8"/>`);
  }
  // ---- the blizzard: streaks and flakes driven from the left, soft banks of snow-haze --------------------------------
  {
    let st = '', fl = '', big = '';
    for (let i = 0; i < 160; i++) {
      const x = R.range(-100, W), y = R.range(-20, H), l = R.range(30, 90);
      st += `M${r0(x)},${r0(y)}l${r0(l)},${r0(l * 0.28)}`;
    }
    for (let i = 0; i < 260; i++) fl += `<circle cx="${r0(R.range(0, W))}" cy="${r0(R.range(0, H))}" r="${f(R.range(1, 2.6), 1)}"/>`;
    for (let i = 0; i < 26; i++) big += `<circle cx="${r0(R.range(0, W))}" cy="${r0(R.range(0, H))}" r="${f(R.range(4, 8), 1)}"/>`;
    S.add(`<path d="${st}" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity=".45"/>`);
    S.add(`<g fill="#ffffff" opacity=".8">${fl}</g>`);
    S.add(`<g fill="#ffffff" opacity=".55" filter="${S.blur(1)}">${big}</g>`);
    S.add(`<ellipse cx="380" cy="${HZ - 20}" rx="420" ry="90" fill="#eef2f6" opacity=".55" filter="${S.blur(3)}"/>`);
    S.add(`<ellipse cx="1320" cy="${HZ + 40}" rx="360" ry="80" fill="#eef2f6" opacity=".45" filter="${S.blur(3)}"/>`);
  }
  // ---- memory grading: washed out, the corners dissolving into white snow-mist -----------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.45, '#f4f6f8', 0], [1, '#f4f6f8', 0.85]], 'cx="0.52" cy="0.5" r="0.72"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="#b8c4d4" opacity=".12"/>`);
  S.add(`<rect y="640" width="${W}" height="260" fill="${S.lin([[0, '#5a6470', 0], [1, '#5a6470', 0.35]])}"/>`);
  return S.out();
}

export const gaidenABgs = {
  'silver-rail-observation-car': () => observationCar('night'),
  'silver-rail-observation-car-day': () => observationCar('day'),
  'silver-rail-dark-car': () => observationCar('dark'),
  'north-snowfield-memory': () => snowfield(),
  'silver-rail-corridor': () => corridor(),
};
