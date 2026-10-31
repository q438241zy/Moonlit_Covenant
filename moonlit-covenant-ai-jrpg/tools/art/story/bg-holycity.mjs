// 白塔圣都 — chapter 17 (script 17 美術需求):
//   holy-city-pilgrim-hostel-night — 朝圣者旅舍·夜 (17-01 … 17-03): a narrow upstairs room seen from the door end; two
//                                   wooden beds along the side walls, a small table between them with an oil lamp; the
//                                   window in the back wall looks onto the street — far off the lower half of the white
//                                   tower, across the street a white-stone house; a bar of light under the door on the
//                                   left with the shadow of a pair of boots in it; a small mirror on the wall turned to
//                                   face the wall. Warm lamp yellow against night blue. No figures.
//   saint-residence-smoke-night    — 圣女居所·夜·烟 (17-04, 17-05): the two-storey white-stone residence seen square on
//                                   from the street; on the ground floor the wooden archive door with a row of
//                                   Morningstar guards' shields before it (silhouettes); to the right the open stair hall
//                                   with stone steps going up and black smoke rolling down them; the upstairs windows'
//                                   light choked by smoke, a palm pressed on one pane; three white-robed figures on the
//                                   roof edge walking away. Black, white and dark gold; the smoke black, not grey. No faces.
//   starsong-garden-predawn        — 星歌花园·天未亮 (17-06): the garden behind the residence — a flagstone path, low
//                                   bushes of white flowers, a stone bench, a small fountain; deep-blue sky, a thread of
//                                   smoke still leaving one of the residence's back windows.
//   starsong-garden-dawn           — the same at dawn (17-07 … 17-11): the sky grey-white turning pale gold; a circle cut
//                                   in the grass by a sword's point; far off, the top of the white tower with its bell.
//   white-tower-outer-court-frost  — 白塔·外庭·霜 (17-12): the paved court outside the morning gate, a fountain in the
//                                   middle with a skin of ice; a heavy northern-style wooden carriage with frost on its
//                                   wheels and hood; in its window a blurred figure that does not move (no face). Cold
//                                   white and pale blue — not the city's paper white.
// No text anywhere.
import { Scene, W, H, f, persp, mix, rng, star7, person, cloud } from './lib.mjs';

const f1 = (v) => f(v, 1);
const pz1 = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L') + 'Z';
const pl1 = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L');
const circ = (cx, cy, r) => `M${f1(cx - r)},${f1(cy)}a${f1(r)},${f1(r)} 0 1 0 ${f1(r * 2)},0a${f1(r)},${f1(r)} 0 1 0 ${f1(-r * 2)},0Z`;
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;

// a far white tower: tapering shaft from y0 (top, may be off-frame) to y1, with band courses
function farTower(S, cx, y0, y1, w0, w1, lit, shade, band) {
  const pts = [[cx - w0, y0], [cx + w0, y0], [cx + w1, y1], [cx - w1, y1]];
  S.add(`<path d="${pz1(pts)}" fill="${S.lin([[0, shade], [0.35, lit], [0.7, lit], [1, shade]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  let d = '';
  for (let y = y0 + 30; y < y1; y += 46) { const t = (y - y0) / (y1 - y0), w = w0 + (w1 - w0) * t; d += `M${f1(cx - w)},${f1(y)}H${f1(cx + w)}`; }
  S.add(`<path d="${d}" stroke="${band}" stroke-width="2"/>`);
}

// ---------------------------------------------------------------------------------------------
// 朝圣者旅舍·夜
// ---------------------------------------------------------------------------------------------
function hostel(day = false) {
  const S = new Scene(day ? 'sbHcHostelDay' : 'sbHcHostel', day ? '白塔圣都·朝圣者旅舍·白天：同一间窄小的二楼房间，午后的光从后墙的窗照进来，窗外是白塔的下半段和对街白石的房子；两张木床、小桌、熄着的油灯，门缝底下没有影子，墙上的小镜子仍翻着；不画人' : '白塔圣都·朝圣者旅舍·夜：窄小的二楼房间，两侧墙边各一张木床，中间一张小桌，桌上一盏油灯；后墙的窗对着街，窗外远处是白塔的下半段和对街一栋白石的房子；左边的门缝底下一道光，光里一双靴子的影子；墙上一面小镜子翻了过去，背面朝外；暖黄的灯光和夜蓝，不画人', day ? 17111 : 17101);
  const R = rng(17102);
  const P = persp({ vp: [820, 420], F: 760, eye: 1.55 });
  const X0 = -2.1, X1 = 2.1, Y1 = 2.7, ZN = 1.6, ZF = 5.6;
  const C = day ? { wall: '#8a7a6a', wallLit: '#b89a78', wallFar: '#a89070', ceil: '#5a4a44', floor: '#7a6048', floorLit: '#a8865e', wood: '#7a5a3a', woodLit: '#a87e52', woodDeep: '#4a3626', night: '#a8c0e0', lamp: '#fff4dc' }
    : { wall: '#5a4a44', wallLit: '#8a6a50', wallFar: '#6a5448', ceil: '#2e2630', floor: '#4a3a30', floorLit: '#7a5a3e', wood: '#6a4a32', woodLit: '#9a7048', woodDeep: '#3a2a20', night: '#1c2440', lamp: '#ffd890' };
  S.add(`<rect width="${W}" height="${H}" fill="${day ? '#3a3028' : '#1a1620'}"/>`);
  // the back wall, the ceiling, the floor and the two side walls
  S.add(`<path d="${P.quad([[X0, 0, ZF], [X1, 0, ZF], [X1, Y1, ZF], [X0, Y1, ZF]])}" fill="${C.wallFar}"/>`);
  S.add(`<path d="${P.quad([[X0, Y1, ZN], [X1, Y1, ZN], [X1, Y1, ZF], [X0, Y1, ZF]])}" fill="${C.ceil}"/>`);
  S.add(`<path d="${P.quad([[X0, 0, ZN], [X1, 0, ZN], [X1, 0, ZF], [X0, 0, ZF]])}" fill="${S.lin([[0, C.floor], [0.6, C.floorLit], [1, C.floor]])}"/>`);
  S.add(`<path d="${P.quad([[X0, 0, ZN], [X0, 0, ZF], [X0, Y1, ZF], [X0, Y1, ZN]])}" fill="${S.lin([[0, '#3a2e30'], [1, C.wall]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="${P.quad([[X1, 0, ZN], [X1, 0, ZF], [X1, Y1, ZF], [X1, Y1, ZN]])}" fill="${S.lin([[0, C.wall], [1, '#3a2e30']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  // floorboards and ceiling beams
  {
    let d = '';
    for (let x = X0; x <= X1 + 0.01; x += 0.35) d += 'M' + P(x, 0, ZN).map(f1).join(',') + 'L' + P(x, 0, ZF).map(f1).join(',');
    S.add(`<path d="${d}" stroke="${C.woodDeep}" stroke-width="1.6" opacity=".55"/>`);
    let b = '';
    for (const z of [2.2, 3.4, 4.6]) b += P.quad([[X0, Y1, z], [X1, Y1, z], [X1, Y1 - 0.12, z], [X0, Y1 - 0.12, z]]);
    S.add(`<path d="${b}" fill="${C.woodDeep}"/>`);
  }
  // the window in the back wall, right of centre: night street, the far tower, the white house across the street
  const wx0 = 0.15, wx1 = 1.45, wy0 = 1.0, wy1 = 2.2;
  const wa = P(wx0, wy1, ZF), wb = P(wx1, wy0, ZF);
  S.add(`<path d="${pz1([wa, [wb[0], wa[1]], wb, [wa[0], wb[1]]])}" fill="${day ? S.lin([[0, '#a8c4e4'], [1, '#e4ecf2']]) : S.lin([[0, '#141c38'], [1, '#2c3658']])}"/>`);
  {
    const cx = wa[0] + (wb[0] - wa[0]) * 0.38;
    farTower(S, cx, wa[1] - 4, wb[1] - 52, 12, 20, '#c8ccd8', '#7a8098', '#9aa0b4');
    // the white house across the street, its upper windows lit
    const hx0 = wa[0] + (wb[0] - wa[0]) * 0.52, hy = wb[1] - 70;
    S.add(`<path d="M${f1(hx0)},${f1(wb[1])}V${f1(hy)}l${f1((wb[0] - hx0) * 0.5)},-26L${f1(wb[0])},${f1(hy)}V${f1(wb[1])}Z" fill="#b8bccb"/>`);
    S.add(`<path d="M${f1(hx0 + 14)},${f1(hy + 14)}h14v18h-14zM${f1(hx0 + 46)},${f1(hy + 14)}h14v18h-14z" fill="${day ? '#5a6478' : '#f0c878'}"/>`);
    S.add(`<path d="M${f1(wa[0])},${f1(wb[1] - 30)}H${f1(hx0)}V${f1(wb[1])}H${f1(wa[0])}Z" fill="#2a3048"/>`);
    // mullions and frame
    const mx = (wa[0] + wb[0]) / 2, my = (wa[1] + wb[1]) / 2;
    S.add(`<path d="${pz1([wa, [wb[0], wa[1]], wb, [wa[0], wb[1]]])}M${f1(mx)},${f1(wa[1])}V${f1(wb[1])}M${f1(wa[0])},${f1(my)}H${f1(wb[0])}" fill="none" stroke="${C.wood}" stroke-width="6"/>`);
    S.add(`<path d="M${f1(wa[0] - 8)},${f1(wb[1])}h${f1(wb[0] - wa[0] + 16)}v8h${f1(-(wb[0] - wa[0] + 16))}z" fill="${C.woodLit}"/>`);
  }
  // the door on the left wall, near: dark planks, a bar of light under it with the boots' shadow
  {
    const za = 2.0, zb = 2.9, hy = 2.05;
    S.add(`<path d="${P.quad([[X0, 0, za], [X0, 0, zb], [X0, hy, zb], [X0, hy, za]])}" fill="${C.woodDeep}"/>`);
    let pl = '';
    for (let z = za + 0.18; z < zb; z += 0.18) pl += 'M' + P(X0, 0.04, z).map(f1).join(',') + 'L' + P(X0, hy - 0.04, z).map(f1).join(',');
    S.add(`<path d="${pl}" stroke="#241a14" stroke-width="2"/>`);
    // the light bar on the floor under the door and the two boot shadows breaking it
    const l0 = P(X0, 0, za + 0.04), l1 = P(X0, 0, zb - 0.04), l2 = P(X0 + 0.5, 0, zb - 0.1), l3 = P(X0 + 0.5, 0, za + 0.1);
    S.add(`<path d="${pz1([l0, l1, l2, l3])}" fill="${S.lin([[0, '#ffe0a0', 0.75], [1, '#ffe0a0', 0]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    for (const t of day ? [] : [0.3, 0.62]) {
      const z0 = za + (zb - za) * t, z1 = z0 + 0.12;
      S.add(`<path d="${pz1([P(X0, 0, z0), P(X0, 0, z1), P(X0 + 0.42, 0, z1 + 0.02), P(X0 + 0.42, 0, z0 - 0.02)])}" fill="#1a120e" opacity=".85"/>`);
    }
    const kn = P(X0, 1.0, zb - 0.12);
    S.add(`<path d="${circ(kn[0], kn[1], 5)}" fill="#c8a060"/>`);
  }
  // the small mirror on the right wall, turned to the wall: only its wooden back and the cord
  {
    const z0 = 3.6, z1 = 4.1, y0 = 1.45, y1 = 1.95;
    S.add(`<path d="${P.quad([[X1, y0, z0], [X1, y0, z1], [X1, y1, z1], [X1, y1, z0]])}" fill="#7a5a40" stroke="#4a3426" stroke-width="2"/>`);
    const a = P(X1, y1, z0 + 0.05), b = P(X1, y1 + 0.18, (z0 + z1) / 2), c = P(X1, y1, z1 - 0.05);
    S.add(`<path d="${pl1([a, b, c])}" fill="none" stroke="#3a2a20" stroke-width="1.6"/>`);
  }
  // the two beds along the side walls
  function bed(side) {
    const x0 = side < 0 ? X0 : X1 - 0.95, x1 = side < 0 ? X0 + 0.95 : X1, za = 2.3, zb = 4.6, y = 0.48;
    const top = [[x0, y, za], [x1, y, za], [x1, y, zb], [x0, y, zb]];
    const front = [[x0, 0, za], [x1, 0, za], [x1, y, za], [x0, y, za]];
    const sideFace = side < 0 ? [[x1, 0, za], [x1, 0, zb], [x1, y, zb], [x1, y, za]] : [[x0, 0, za], [x0, 0, zb], [x0, y, zb], [x0, y, za]];
    // headboard at the far end, drawn first so the mattress sits in front of it
    S.add(`<path d="${P.quad([[x0, 0, zb], [x1, 0, zb], [x1, 1.0, zb], [x0, 1.0, zb]])}" fill="${C.wood}" stroke="${C.woodDeep}" stroke-width="2"/>`);
    S.add(`<path d="${P.quad(sideFace)}" fill="${C.wood}"/><path d="${P.quad(front)}" fill="${C.woodLit}"/>`);
    S.add(`<path d="${P.quad(top)}" fill="#c8b8a0"/>`);
    // blanket folded over two thirds, the pillow at the far end
    const bt = [[x0 + 0.04, y + 0.05, za + 0.02], [x1 - 0.04, y + 0.05, za + 0.02], [x1 - 0.04, y + 0.05, zb - 0.7], [x0 + 0.04, y + 0.05, zb - 0.7]];
    S.add(`<path d="${P.quad(bt)}" fill="${side < 0 ? '#6a5a7a' : '#5a6a7a'}"/>`);
    const pw = [[x0 + 0.12, y + 0.12, zb - 0.55], [x1 - 0.12, y + 0.12, zb - 0.55], [x1 - 0.12, y + 0.12, zb - 0.12], [x0 + 0.12, y + 0.12, zb - 0.12]];
    S.add(`<path d="${P.quad(pw)}" fill="#e8dcc8"/>`);
  }
  bed(-1); bed(1);
  // the small table between the beds, the oil lamp on it, and the lamp's warm pool
  const tz = 3.7, ty = 0.72;
  const lampP = P(0, ty + 0.3, tz);
  S.add(`<ellipse cx="${f1(lampP[0])}" cy="${f1(lampP[1])}" rx="560" ry="380" fill="${S.rad([[0, C.lamp, day ? 0.22 : 0.4], [0.5, '#e8a050', day ? 0.05 : 0.14], [1, '#e8a050', 0]])}"/>`);
  {
    const top = [[-0.4, ty, tz - 0.3], [0.4, ty, tz - 0.3], [0.4, ty, tz + 0.3], [-0.4, ty, tz + 0.3]];
    S.add(`<path d="${P.quad([[-0.4, 0, tz - 0.3], [0.4, 0, tz - 0.3], [0.4, ty, tz - 0.3], [-0.4, ty, tz - 0.3]])}" fill="${C.wood}"/>`);
    for (const x of [-0.36, 0.32]) S.add(`<path d="${P.quad([[x, 0, tz - 0.28], [x + 0.05, 0, tz - 0.28], [x + 0.05, ty, tz - 0.28], [x, ty, tz - 0.28]])}" fill="${C.woodDeep}"/>`);
    S.add(`<path d="${P.quad(top)}" fill="${C.woodLit}"/>`);
    // a sheet of paper on the table with a few strokes, and a stick of charcoal
    const pa = [[-0.32, ty + 0.005, tz - 0.22], [0.0, ty + 0.005, tz - 0.22], [0.0, ty + 0.005, tz + 0.12], [-0.32, ty + 0.005, tz + 0.12]];
    S.add(`<path d="${P.quad(pa)}" fill="#efe4cc"/>`);
    const pc = P(-0.16, ty, tz - 0.05);
    let rings = '';
    for (let k = 1; k <= 7; k++) rings += ell(pc[0], pc[1], 3 + k * 3.2, 1.2 + k * 1.1);
    S.add(`<path d="${rings}" fill="none" stroke="#3a3430" stroke-width="1.2" opacity=".7"/>`);
    const ch = P(0.12, ty, tz - 0.15);
    S.add(`<path d="M${f1(ch[0])},${f1(ch[1])}l26,-4l2,4l-26,4z" fill="#1a1818"/>`);
    // the lamp
    const lb = P(0.22, ty, tz + 0.05);
    S.add(`<path d="M${f1(lb[0] - 16)},${f1(lb[1])}h32l-6,-10h-20z" fill="#8a6a3a"/><path d="M${f1(lb[0] - 9)},${f1(lb[1] - 10)}q-3,-30 9,-44q12,14 9,44z" fill="#f8e4b8" opacity=".55"/>${day ? '' : `<path d="M${f1(lb[0])},${f1(lb[1] - 18)}q-6,-10 0,-22q6,12 0,22z" fill="#fff4d0"/>`}`);
  }
  // night-blue cast from the window over the near floor, then a vignette
  S.add(`<path d="${pz1([P(0.15, 0, ZF), P(1.45, 0, ZF), P(2.1, 0, 3.0), P(0.3, 0, 2.6)])}" fill="${day ? '#fff0c8' : '#3a4a7a'}" opacity="${day ? 0.22 : 0.16}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.7, '#000', 0.1], [1, '#000', 0.6]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 圣女居所·夜·烟
// ---------------------------------------------------------------------------------------------
function residence() {
  const S = new Scene('sbHcResidence', '圣女居所·夜·烟：从街上正面看白石两层的居所；一楼左边书库的木门前，一排晨星卫举着盾站成一行（剪影）；右边敞开的楼梯间，石阶往上，黑色的烟顺着石阶往下滚；二楼窗里的灯被烟遮住，一扇窗的玻璃上按着一只手掌；屋顶边上三个穿白袍的人影往外走；黑、白、暗金，烟是黑的不是灰的，不画脸', 17201);
  const R = rng(17202);
  const C = { sky: [[0, '#06070c'], [0.6, '#10121c'], [1, '#1a1a24']], stone: '#c8c4bc', stoneLit: '#dcd8ce', stoneShade: '#8a8680', stoneDeep: '#4a4844', joint: '#9a968e', gold: '#b8903a', wood: '#4a3424', smoke: '#08080a', glow: '#e8a850', street: '#24232a' };
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(C.sky)}"/>`);
  // far rooftops of the city on both sides, the base of the white tower faint behind
  farTower(S, 1300, -40, 260, 34, 44, '#4a4c58', '#24262e', '#383a44');
  S.add(`<path d="M0,330L0,250l60,-30l70,30v-40l80,-26l70,30V330ZM1360,330V240l70,-26l60,26v-20l70,-24l40,20V330Z" fill="#14151c"/>`);
  // the street
  S.add(`<path d="M0,770H${W}V${H}H0Z" fill="${C.street}"/><path d="M0,770H${W}" stroke="#3a3842" stroke-width="3"/>`);
  {
    let d = '';
    for (let x = -40; x < W; x += 90) d += `M${x},${H}L${x + 60},770`;
    S.add(`<path d="${d}" stroke="#1a1920" stroke-width="2"/>`);
  }
  // the house body: x 220..1380, ground 770, first floor line 500, eaves 250, roof ridge 150
  const X0 = 220, X1 = 1380, G = 770, F1 = 500, E = 250;
  S.add(`<path d="M${X0},${G}V${E}H${X1}V${G}Z" fill="${S.lin([[0, C.stoneLit], [0.55, C.stone], [1, C.stoneShade]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  {
    // ashlar joints
    let d = '';
    for (let y = E + 34; y < G; y += 34) {
      d += `M${X0},${y}H${X1}`;
      const off = ((y - E) / 34) % 2 ? 0 : 45;
      for (let x = X0 + off; x < X1; x += 90) d += `M${x},${y}v34`;
    }
    S.add(`<path d="${d}" stroke="${C.joint}" stroke-width="1.4" opacity=".5"/>`);
    S.add(`<path d="M${X0 - 10},${F1}H${X1 + 10}v14H${X0 - 10}Z" fill="${C.stoneShade}"/>`);
  }
  // the roof: a low pitch, dark slate, a gilded seven-star finial at the centre
  S.add(`<path d="M${X0 - 40},${E}L${(X0 + X1) / 2},150L${X1 + 40},${E}Z" fill="#2a2a32"/><path d="M${X0 - 40},${E}H${X1 + 40}v12H${X0 - 40}Z" fill="#4a4a54"/>`);
  S.add(`<path d="M${(X0 + X1) / 2},150v-26" stroke="${C.gold}" stroke-width="4"/><path d="${star7((X0 + X1) / 2, 116, 14)}" fill="${C.gold}"/>`);
  // three white-robed figures on the roof slope, walking away to the right (backs, hoods, no faces)
  for (const [x, s] of [[1010, 1.0], [1090, 0.95], [1170, 0.9]]) {
    const y = 150 + (x - (X0 + X1) / 2) / ((X1 + 40 - (X0 + X1) / 2)) * 100 - 2;
    const h = 92 * s, w = 34 * s;
    S.add(`<path d="M${f1(x - w / 2)},${f1(y)}q${f1(w * 0.1)},${f1(-h * 0.5)} ${f1(w * 0.18)},${f1(-h * 0.78)}q${f1(w * 0.32)},${f1(-h * 0.26)} ${f1(w * 0.64)},0q${f1(w * 0.08)},${f1(h * 0.28)} ${f1(w * 0.18)},${f1(h * 0.78)}z" fill="#e8e6e0"/>`);
    S.add(`<path d="M${f1(x - w * 0.12)},${f1(y - h * 0.78)}q${f1(w * 0.12)},${f1(-h * 0.2)} ${f1(w * 0.3)},0" fill="none" stroke="#a8a49c" stroke-width="2"/>`);
    S.add(`<path d="M${f1(x + w * 0.1)},${f1(y - h * 0.5)}q${f1(w * 0.3)},${f1(h * 0.2)} ${f1(w * 0.36)},${f1(h * 0.5)}" fill="none" stroke="#b8b4aa" stroke-width="2"/>`);
  }
  // upstairs: four windows, lamp light choked with smoke; one has a palm on the glass
  const UW = [[300, 330], [520, 330], [900, 330], [1120, 330]];
  for (const [i, [x, y]] of UW.entries()) {
    const w = 140, h = 130;
    S.add(`<path d="M${x},${y + h}V${y + 20}q${w / 2},-34 ${w},0V${y + h}Z" fill="${S.rad([[0, C.glow, 0.95], [0.6, '#8a4a20', 0.8], [1, '#1a0e08', 1]], 'cx="0.5" cy="0.7" r="0.8"')}"/>`);
    // the smoke inside the room, rolling past the glass
    let sm = '';
    for (let k = 0; k < 4; k++) sm += circ(x + R.range(10, w - 10), y + R.range(20, h - 10), R.range(26, 46));
    S.add(`<path d="${sm}" fill="${C.smoke}" filter="${S.blur(2)}" opacity="${i === 1 ? 0.72 : 0.86}"/>`);
    S.add(`<path d="M${x},${y + h}V${y + 20}q${w / 2},-34 ${w},0V${y + h}ZM${x + w / 2},${y + 6}V${y + h}M${x},${y + 72}H${x + w}" fill="none" stroke="${C.stoneDeep}" stroke-width="7"/>`);
    S.add(`<path d="M${x - 10},${y + h}h${w + 20}v12h${-(w + 20)}z" fill="${C.stoneShade}"/>`);
    if (i === 1) {
      // a palm flat on the lower-left pane: four fingers and a thumb, pale against the dark
      const hx = x + 36, hy = y + 108;
      S.add(`<path d="M${hx - 14},${hy}q-2,-16 2,-24l-4,-26q0,-5 4,-5q4,0 5,5l4,20l1,-30q0,-5 4,-5q4,0 4,5l1,30l3,-28q1,-5 5,-4q4,1 3,6l-2,28l5,-20q2,-4 5,-3q4,2 2,6l-6,30q-2,14 -14,18z" fill="#e8dcd0" opacity=".9"/>`);
    }
  }
  // the ground floor: the archive door on the left (closed, iron-banded), its row of guards' shields
  const AD = { x: 300, w: 240, top: 560 };
  S.add(`<path d="M${AD.x - 24},${G}V${AD.top - 10}q${AD.w / 2 + 24},-70 ${AD.w + 48},0V${G}Z" fill="${C.stoneShade}"/>`);
  S.add(`<path d="M${AD.x},${G}V${AD.top + 10}q${AD.w / 2},-56 ${AD.w},0V${G}Z" fill="${C.wood}"/>`);
  S.add(`<path d="M${AD.x},${AD.top + 70}H${AD.x + AD.w}M${AD.x},${AD.top + 150}H${AD.x + AD.w}M${AD.x + AD.w / 2},${AD.top - 18}V${G}" stroke="#2a1e16" stroke-width="5"/>`);
  // the guards: a row of tall shields with the seven-star, halberd shafts above them; dark silhouettes against the door
  for (let k = 0; k < 6; k++) {
    const x = 250 + k * 66, y = G - 4, sw = 56, sh = 128;
    S.add(`<path d="M${x},${y - sh}h${sw}v${sh * 0.7}q0,${sh * 0.25} ${-sw / 2},${sh * 0.3}q${-sw / 2},${-sh * 0.05} ${-sw / 2},${-sh * 0.3}z" fill="#1c1c22" stroke="#6a6a72" stroke-width="2"/>`);
    S.add(`<path d="${star7(x + sw / 2, y - sh * 0.62, 12)}" fill="${C.gold}" opacity=".75"/>`);
    S.add(`<path d="M${x + sw / 2 + 2},${y - sh}V${y - sh - 120}" stroke="#2a2a30" stroke-width="5"/><path d="M${x + sw / 2 + 2},${y - sh - 120}l-10,18h20z" fill="#5a5a62"/>`);
    S.add(`<path d="${circ(x + sw / 2, y - sh - 10, 13)}" fill="#24242a"/>`);
  }
  // the stair hall on the right: an open arch, stone steps rising to the left inside, black smoke pouring down them
  const SH = { x: 900, w: 300, top: 545 };
  S.add(`<path d="M${SH.x},${G}V${SH.top + 20}q${SH.w / 2},-80 ${SH.w},0V${G}Z" fill="#141016"/>`);
  {
    let st = '';
    for (let k = 0; k < 9; k++) {
      const y = G - k * 22, x0 = SH.x + 30 + k * 10, x1 = SH.x + SH.w - 20 - k * 22;
      st += `M${x0},${y}H${x1}v-22H${x0}Z`;
    }
    S.add(`<path d="${st}" fill="#5a565a" stroke="#2a262a" stroke-width="2"/>`);
    // the smoke: a heavy black mass spilling out of the top of the stair and down over the steps
    const cl = S.clip(`M${SH.x},${G}V${SH.top + 20}q${SH.w / 2},-80 ${SH.w},0V${G}Z`);
    let sm = '';
    for (let k = 0; k < 16; k++) {
      const t = k / 15;
      sm += circ(SH.x + 60 + t * 200 + R.range(-30, 30), SH.top + 10 + t * 180 + R.range(-20, 20), 44 + R.range(0, 30) - t * 10);
    }
    S.add(`<g clip-path="${cl}"><path d="${sm}" fill="${C.smoke}" filter="${S.blur(2)}" opacity=".94"/></g>`);
    // smoke spilling out of the arch onto the street
    let out = '';
    for (let k = 0; k < 9; k++) out += circ(SH.x + 20 + k * 36 + R.range(-10, 10), G - 30 + R.range(-20, 10), 30 + R.range(0, 22));
    S.add(`<path d="${out}" fill="${C.smoke}" filter="${S.blur(2)}" opacity=".8"/>`);
    S.add(`<path d="M${SH.x - 20},${G}V${SH.top + 10}q${SH.w / 2 + 20},-96 ${SH.w + 40},0V${G}h-20V${SH.top + 20}q${-SH.w / 2},-80 ${-SH.w},0V${G}Z" fill="${C.stoneShade}"/>`);
  }
  // smoke from the upstairs windows and the roof, rolling up into the black sky (black, not grey)
  let up = '';
  for (const [x, y] of [[360, 320], [580, 300], [960, 310], [1180, 320]]) {
    for (let k = 0; k < 6; k++) up += circ(x + k * 14 + R.range(-20, 20), y - k * 46, 40 + k * 10 + R.range(-6, 6));
  }
  S.add(`<path d="${up}" fill="${C.smoke}" filter="${S.blur(2)}" opacity=".78"/>`);
  // a faint gold rim along the smoke where the lamps light it from below, and on the door frame
  S.add(`<rect x="${X0}" y="${E}" width="${X1 - X0}" height="${F1 - E}" fill="${S.lin([[0, C.glow, 0], [0.7, C.glow, 0], [1, C.glow, 0.12]])}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.7, '#000', 0.15], [1, '#000', 0.6]], 'cx="0.5" cy="0.55" r="0.75"')}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 星歌花园 (天未亮 / 黎明)
// ---------------------------------------------------------------------------------------------
function garden(dawn) {
  const S = new Scene(dawn ? 'sbHcGardenDawn' : 'sbHcGarden', dawn
    ? '星歌花园·黎明：同一座花园，天边由灰白转成淡金；草地上一个用剑尖划出的圆圈；石板小径、低矮的白花丛、石凳和小喷水池；远处白塔的塔顶，挂着晨钟'
    : '星歌花园·天未亮：居所后面的花园，石板小径、低矮的白花丛、一张石凳、一个小喷水池；天色深蓝，居所背面的一扇窗还冒着一缕烟', dawn ? 17311 : 17301);
  const R = rng(dawn ? 17312 : 17302);
  const C = dawn
    ? { sky: [[0, '#8a96b0'], [0.5, '#d8d4cc'], [0.8, '#f0dcb0'], [1, '#f6e4b8']], wall: '#d8d2c8', wallShade: '#a8a29a', win: '#4a4a58', grass: '#6a8a5a', grassFar: '#8aa070', grassDark: '#4a6a44', path: '#c8c0b0', pathShade: '#9a9284', flower: '#f6f2ea', leaf: '#4a6a48', stone: '#d0cac0', stoneShade: '#9a948a', water: '#c8d4dc', tower: '#f0ece4', towerShade: '#b8b0a4', smoke: '#5a5a62' }
    : { sky: [[0, '#0a1024'], [0.6, '#16224a'], [1, '#24305a']], wall: '#6a7090', wallShade: '#444a66', win: '#1a1e30', grass: '#2a3a44', grassFar: '#34465a', grassDark: '#1a2a34', path: '#5a6078', pathShade: '#3a4058', flower: '#c8d0e8', leaf: '#22343e', stone: '#6a7088', stoneShade: '#444a60', water: '#3a4a6a', tower: '#7a809a', towerShade: '#4a5068', smoke: '#1a1a20' };
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(C.sky)}"/>`);
  if (!dawn) {
    let st = '';
    for (let k = 0; k < 60; k++) st += circ(R.range(0, W), R.range(0, 260), R.range(0.6, 1.6));
    S.add(`<path d="${st}" fill="#e8ecff" opacity=".7"/>`);
  } else {
    S.add(`<ellipse cx="1150" cy="420" rx="700" ry="200" fill="${S.rad([[0, '#fff0c8', 0.7], [1, '#fff0c8', 0]])}"/>`);
  }
  // far off: the white tower's top with the bell, over the residence roof
  farTower(S, 1240, 40, 330, 20, 26, C.tower, C.towerShade, C.towerShade);
  S.add(`<path d="M1214,40h52l-26,-46z" fill="${C.towerShade}"/><path d="M1228,58h24v26h-24z" fill="${C.win}"/><path d="M1232,82q8,-22 16,0z" fill="${dawn ? '#c8a050' : '#8a7a4a'}"/>`);
  // the back of the residence: a white-stone wall across the top, windows, one still breathing smoke
  S.add(`<path d="M0,420V230l120,-40h560l120,40V420Z" fill="${S.lin([[0, C.wall], [1, C.wallShade]])}"/><path d="M0,230l120,-40h560l120,40" fill="none" stroke="${C.wallShade}" stroke-width="6"/>`);
  for (const x of [80, 240, 400, 560, 700]) S.add(`<path d="M${x},400V300q30,-24 60,0V400Z" fill="${C.win}"/>`);
  {
    let sm = '';
    for (let k = 0; k < 7; k++) sm += circ(430 + k * 18 + R.range(-6, 6), 296 - k * 34, 14 + k * 7);
    S.add(`<path d="${sm}" fill="${C.smoke}" filter="${S.blur(2)}" opacity="${dawn ? 0.35 : 0.7}"/>`);
  }
  // a hedge line behind the lawn; the lawn
  S.add(`<path d="M0,430Q400,400 800,420T${W},410V470H0Z" fill="${C.grassDark}"/>`);
  S.add(`<path d="M0,460Q600,440 ${W},450V${H}H0Z" fill="${S.lin([[0, C.grassFar], [1, C.grass]])}"/>`);
  // the flagstone path winding from the bottom-left to the fountain
  {
    const pts = [];
    for (let k = 0; k <= 14; k++) { const t = k / 14; pts.push([180 + t * 640 + Math.sin(t * 3) * 60, H + 20 - t * 400]); }
    let d = '';
    for (const [i, [x, y]] of pts.entries()) {
      const s = 1 - i / 18;
      d += ell(x + R.range(-10, 10), y, 64 * s, 20 * s);
    }
    S.add(`<path d="${d}" fill="${C.path}" stroke="${C.pathShade}" stroke-width="2"/>`);
  }
  // the small fountain right of centre: a round basin, a short column, a little water
  {
    const cx = 980, cy = 560;
    S.add(`<path d="${ell(cx, cy + 20, 170, 46)}" fill="${C.stoneShade}"/><path d="${ell(cx, cy, 170, 46)}" fill="${C.stone}"/><path d="${ell(cx, cy + 4, 150, 36)}" fill="${C.water}"/>`);
    S.add(`<path d="M${cx - 14},${cy}v-90h28v90z" fill="${C.stone}"/><path d="${ell(cx, cy - 92, 46, 12)}" fill="${C.stoneShade}"/>`);
    S.add(`<path d="M${cx},${cy - 100}q-30,10 -40,60M${cx},${cy - 100}q30,10 40,60" fill="none" stroke="${dawn ? '#f0f4f8' : '#8a9ab8'}" stroke-width="2.4" opacity=".7"/>`);
  }
  // the stone bench, front left of the fountain
  {
    const x = 560, y = 640;
    S.add(`<path d="M${x},${y}h260l20,-16h-260z" fill="${C.stone}"/><path d="M${x},${y}h260v14h-260z" fill="${C.stoneShade}"/>`);
    S.add(`<path d="M${x + 20},${y + 14}v40h22v-40zM${x + 218},${y + 14}v40h22v-40z" fill="${C.stoneShade}"/>`);
    if (dawn) {
      // the rubbing laid on the bench: a sheet with seven faint rings
      S.add(`<path d="M${x + 110},${y - 4}l60,0l12,-10l-60,0z" fill="#efe6d0"/>`);
    }
  }
  // the low bushes of white flowers along the edges
  function bush(x, y, w, h) {
    let leaves = '', fl = '';
    for (let k = 0; k < 7; k++) leaves += ell(x + R.range(-w / 2, w / 2), y - R.range(0, h * 0.6), R.range(w * 0.2, w * 0.34), R.range(h * 0.3, h * 0.45));
    for (let k = 0; k < 18; k++) fl += circ(x + R.range(-w / 2, w / 2), y - R.range(h * 0.1, h * 0.9), R.range(3, 6));
    S.add(`<path d="${leaves}" fill="${C.leaf}"/><path d="${fl}" fill="${C.flower}"/>`);
  }
  for (const [x, y, w, h] of [[80, 560, 200, 90], [340, 500, 160, 70], [1300, 520, 220, 90], [1500, 600, 200, 100], [110, 820, 260, 120], [1420, 840, 300, 130]]) bush(x, y, w, h);
  // dawn: the circle cut in the grass by a sword's point, centre of the lawn
  if (dawn) {
    S.add(`<path d="${ell(780, 770, 300, 70)}" fill="none" stroke="#3a5232" stroke-width="5"/><path d="${ell(780, 768, 300, 70)}" fill="none" stroke="#c8d8a0" stroke-width="1.4" opacity=".7"/>`);
  }
  // grass tufts
  {
    let d = '';
    for (let k = 0; k < 140; k++) { const x = R.range(0, W), y = R.range(480, H); d += `M${f1(x)},${f1(y)}l${f1(R.range(-4, 4))},${f1(-R.range(6, 14))}`; }
    S.add(`<path d="${d}" stroke="${C.grassDark}" stroke-width="1.6" opacity=".7"/>`);
  }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.75, '#000', 0.08], [1, '#000', dawn ? 0.3 : 0.55]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 白塔·外庭·霜
// ---------------------------------------------------------------------------------------------
function frost(thawed = false, eve = null) {
  const S = new Scene(eve ? (eve === 'night' ? 'sbHcCourtNight' : eve === 'day' ? 'sbHcCourtDay' : 'sbHcCourtDusk') : thawed ? 'sbHcThawed' : 'sbHcFrost', eve === 'night' ? '白塔·外庭·夜：同一片铺石的外庭，喷泉的水在灯下发亮，北方的马车旁搭着霜潮使团的两顶帐篷，帐篷里亮着灯；一间空屋的窗也亮着；夜蓝和暖黄' : eve === 'day' ? '白塔·外庭·白天：同一片铺石的外庭，喷泉流着水，北方的马车旁搭着霜潮使团的两顶帐篷，通报牌立在墙边；白天平平的光' : eve === 'dusk' ? '白塔·外庭·黄昏：同一片铺石的外庭，夕阳斜照，北方的马车旁搭着霜潮使团的两顶帐篷，一间空屋的门开着；橙色和灰蓝' : thawed ? '白塔·外庭·正午：同一片铺石的外庭，霜化了，石板湿着；喷泉的冰融成水；北方的厚木马车车轮上的霜化成水滴，车窗里没有人影；淡蓝转成正午的白' : '白塔·外庭·霜：晨门外一片铺石的外庭，中央一座喷泉，水面结了一层薄冰；一辆北方样式的厚木马车停在那里，车轮和车篷边缘结着霜；车窗里一个模糊、一动不动的人影，看不见脸；冷白和淡蓝，和圣都纸一样的白分开', eve === 'night' ? 17431 : eve === 'dusk' ? 17421 : eve === 'day' ? 17441 : thawed ? 17411 : 17401);
  const R = rng(17402);
  const C = eve === 'night' ? { sky: [[0, '#0a1020'], [0.6, '#18223a'], [1, '#26304a']], wall: '#4a5468', wallShade: '#2a3244', pave: '#3a4256', paveFar: '#4a5266', joint: '#22283a', frost: '#5a6478', ice: '#4a6a8a', wood: '#3a3028', woodLit: '#5a4a3a', woodDeep: '#201a16', iron: '#2a2e36' }
    : eve === 'day' ? { sky: [[0, '#b8c4d0'], [0.6, '#dce2e8'], [1, '#eef0f2']], wall: '#d0d4d8', wallShade: '#a0a8b2', pave: '#bcc2c8', paveFar: '#ccd2d8', joint: '#8a929c', frost: '#e8eef4', ice: '#8ab0c8', wood: '#5a4a40', woodLit: '#7a6656', woodDeep: '#3a302a', iron: '#4a5058' }
    : eve === 'dusk' ? { sky: [[0, '#6a6a8a'], [0.55, '#d8987a'], [1, '#f0c08a']], wall: '#c8a890', wallShade: '#8a7478', pave: '#a8907e', paveFar: '#c4a488', joint: '#7a6460', frost: '#d8b8a0', ice: '#c89a7a', wood: '#5a4232', woodLit: '#7a5a44', woodDeep: '#3a2a20', iron: '#3a3438' }
    : { sky: [[0, '#b8c8d8'], [0.6, '#dce6ee'], [1, '#eef2f6']], wall: '#c8d0d8', wallShade: '#98a4b2', pave: '#b8c2cc', paveFar: '#ccd4dc', joint: '#8a96a4', frost: '#f4f8fc', ice: thawed ? '#8ab0c8' : '#d8e8f4', wood: '#5a4a40', woodLit: '#7a6656', woodDeep: '#3a302a', iron: '#4a5058' };
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(C.sky)}"/>`);
  // the morning gate's wall across the back with the arch, the tower rising behind into a cold haze
  farTower(S, 800, -40, 300, 46, 56, '#eef2f6', '#a8b4c2', '#c0cad6');
  S.add(`<path d="M0,420V230h${W}V420Z" fill="${S.lin([[0, C.wall], [1, C.wallShade]])}"/>`);
  {
    let d = '';
    for (let x = 0; x < W; x += 64) d += `M${x},230v-30h40v30`;
    S.add(`<path d="${d}" fill="${C.wall}" stroke="${C.wallShade}" stroke-width="2"/>`);
    S.add(`<path d="M700,420V320q100,-90 200,0V420Z" fill="#5a6676"/>`);
    let j = '';
    for (let y = 262; y < 420; y += 32) j += `M0,${y}H700M900,${y}H${W}`;
    S.add(`<path d="${j}" stroke="${C.wallShade}" stroke-width="1.4" opacity=".6"/>`);
  }
  // the paved court in perspective
  const P = persp({ vp: [800, 380], F: 820, eye: 1.6 });
  S.add(`<path d="M0,420H${W}V${H}H0Z" fill="${S.lin([[0, C.paveFar], [1, C.pave]])}"/>`);
  {
    let d = '';
    for (let x = -12; x <= 12; x += 1.2) d += 'M' + P(x, 0, 2.2).map(f1).join(',') + 'L' + P(x, 0, 14).map(f1).join(',');
    for (const z of [2.6, 3.1, 3.7, 4.5, 5.5, 6.8, 8.6, 11]) d += 'M' + P(-30, 0, z).map(f1).join(',') + 'L' + P(30, 0, z).map(f1).join(',');
    S.add(`<path d="${d}" stroke="${C.joint}" stroke-width="1.4" opacity=".55"/>`);
  }
  // frost on the paving: pale patches
  {
    let d = '';
    for (let k = 0; k < 26; k++) d += ell(R.range(0, W), R.range(440, H), R.range(40, 140), R.range(6, 18));
    if (!eve) S.add(`<path d="${d}" fill="${thawed ? '#8a98a8' : C.frost}" opacity="${thawed ? 0.35 : 0.55}"/>`);
  }
  // the fountain in the middle: basin, column, and a skin of ice with cracks
  {
    const cx = 560, cy = 560;
    S.add(`<path d="${ell(cx, cy + 26, 230, 60)}" fill="${C.wallShade}"/><path d="${ell(cx, cy, 230, 60)}" fill="${C.wall}"/><path d="${ell(cx, cy + 6, 205, 48)}" fill="${C.ice}"/>`);
    if (!thawed) S.add(`<path d="M${cx - 70},${cy}l50,10l30,-14l40,18M${cx + 20},${cy + 8}l20,26M${cx - 20},${cy + 10}l-30,22" fill="none" stroke="#f8fcff" stroke-width="2"/>`);
    S.add(`<path d="M${cx - 18},${cy}v-130h36v130z" fill="${C.wall}"/><path d="${ell(cx, cy - 132, 64, 16)}" fill="${C.wallShade}"/><path d="${ell(cx, cy - 136, 54, 12)}" fill="${C.ice}"/>`);
    // icicles hanging from the upper dish
    let ic = '';
    for (let k = 0; k < 9; k++) { const x = cx - 50 + k * 12.5; ic += `M${f1(x - 3)},${cy - 128}l3,${f1(R.range(14, 34))}l3,${f1(-R.range(14, 34))}z`; }
    if (!thawed) S.add(`<path d="${ic}" fill="${C.frost}"/>`);
  }
  // the northern carriage on the right: heavy wooden body, arched hood, big iron-rimmed wheels, all edged in frost
  {
    const x0 = 960, x1 = 1440, by = 660, bt = 430;
    // wheels behind first
    function wheel(cx, cy, r) {
      let sp = '';
      for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5; sp += `M${f1(cx)},${f1(cy)}L${f1(cx + Math.cos(a) * r)},${f1(cy + Math.sin(a) * r)}`; }
      S.add(`<path d="${circ(cx, cy, r)}" fill="none" stroke="${C.iron}" stroke-width="12"/><path d="${sp}" stroke="${C.woodDeep}" stroke-width="7"/><path d="${circ(cx, cy, 16)}" fill="${C.iron}"/>`);
      S.add(`<path d="M${f1(cx - r * 0.9)},${f1(cy - r * 0.42)}A${r},${r} 0 0 1 ${f1(cx + r * 0.9)},${f1(cy - r * 0.42)}" fill="none" stroke="${C.frost}" stroke-width="5"/>`);
    }
    wheel(x0 + 100, by + 40, 96); wheel(x1 - 90, by + 40, 96);
    // body
    S.add(`<path d="M${x0},${by}V${bt}H${x1}V${by}Z" fill="${S.lin([[0, C.woodLit], [1, C.wood]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    let pl = '';
    for (let x = x0 + 40; x < x1; x += 40) pl += `M${x},${bt}V${by}`;
    S.add(`<path d="${pl}" stroke="${C.woodDeep}" stroke-width="2" opacity=".6"/>`);
    S.add(`<path d="M${x0},${by}H${x1}v14H${x0}Z" fill="${C.woodDeep}"/><path d="M${x0},${bt}H${x1}" stroke="${C.iron}" stroke-width="8"/>`);
    // the arched hood
    S.add(`<path d="M${x0 - 20},${bt}Q${(x0 + x1) / 2},${bt - 190} ${x1 + 20},${bt}Z" fill="#5a6270"/><path d="M${x0 - 20},${bt}Q${(x0 + x1) / 2},${bt - 190} ${x1 + 20},${bt}" fill="none" stroke="${C.frost}" stroke-width="9"/>`);
    S.add(`<path d="M${x0 + 60},${bt - 40}Q${(x0 + x1) / 2},${bt - 160} ${x1 - 60},${bt - 40}" fill="none" stroke="#7a8290" stroke-width="3"/>`);
    // the window with the blurred, unmoving figure
    const wx = x0 + 170, wy = bt + 50, ww = 150, wh = 110;
    S.add(`<path d="M${wx},${wy}h${ww}v${wh}h${-ww}z" fill="#3a4658"/>`);
    if (!thawed && !eve) S.add(`<path d="M${wx + 50},${wy + wh}q2,-50 25,-56q23,6 25,56zM${wx + 75},${wy + 46}m-16,0a16,18 0 1 0 32,0a16,18 0 1 0 -32,0" fill="#6a7a8e" filter="${S.blur(1)}"/>`);
    S.add(`<path d="M${wx},${wy}h${ww}v${wh}h${-ww}z" fill="${S.lin([[0, '#f4f8fc', 0.55], [0.4, '#f4f8fc', 0.15], [1, '#f4f8fc', 0.4]])}" stroke="${C.woodDeep}" stroke-width="8"/>`);
    // frost along the body's bottom edge and the step
    S.add(`<path d="M${x0},${by}h${x1 - x0}" stroke="${C.frost}" stroke-width="4"/><path d="M${x0 + 300},${by + 14}h80v12h-80z" fill="${C.woodDeep}" stroke="${C.frost}" stroke-width="2"/>`);
    // the shaft resting on the ground to the left, no horse
    S.add(`<path d="M${x0},${by - 20}L${x0 - 210},${by + 110}" stroke="${C.woodDeep}" stroke-width="12"/><path d="M${x0},${by - 20}L${x0 - 210},${by + 110}" stroke="${C.frost}" stroke-width="2"/>`);
  }
  if (eve) {
    // the envoy's two tents to the left of the carriage, and the empty house by the wall with its door (dusk) or window (night) lit
    const lit = eve === 'night' ? '#ffd890' : eve === 'day' ? '#8a7a68' : '#f0b880';
    for (const [x, w, h] of [[760, 170, 150], [130, 220, 180]]) {
      S.add(`<path d="M${x},700L${x + w / 2},${700 - h}L${x + w},700Z" fill="${eve === 'night' ? '#5a5048' : '#e8dccb'}"/><path d="M${x + w / 2},${700 - h}L${x + w / 2 + 14},700H${x + w / 2 - 14}Z" fill="${lit}" opacity="${eve === 'night' ? 0.9 : 0.5}"/>`);
      S.add(`<path d="M${x},700L${x + w / 2},${700 - h}L${x + w},700" fill="none" stroke="${C.woodDeep}" stroke-width="3"/>`);
    }
    S.add(`<path d="M1450,420V300h140V420Z" fill="${C.wallShade}"/><path d="M1490,420v-70h40v70z" fill="${eve === 'night' ? '#1a1410' : lit}"/><path d="M1550,330h24v24h-24z" fill="${lit}" opacity="${eve === 'night' ? 1 : 0.4}"/>`);
    if (eve === 'night') {
      let st = '';
      for (let k = 0; k < 40; k++) st += circ(R.range(0, W), R.range(0, 200), R.range(0.6, 1.4));
      S.add(`<path d="${st}" fill="#e8ecff" opacity=".7"/>`);
      S.add(`<ellipse cx="560" cy="560" rx="380" ry="160" fill="${S.rad([[0, '#ffd890', 0.18], [1, '#ffd890', 0]])}"/>`);
    }
  }
  // a cold haze over everything, slight vignette
  if (!eve) S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#f4f8fc', 0.25], [0.5, '#f4f8fc', 0.05], [1, '#f4f8fc', 0.15]])}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#20304a', 0], [0.75, '#20304a', 0.06], [1, '#20304a', 0.3]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 七角殿
// ---------------------------------------------------------------------------------------------
// The seven banners: 晨星 (white/gold star), 赤焰, 铸金, 霜潮, 翠影, 夜鸦, 龙脊 (a coiled dragon) — colour fields with simple
// emblems, never letters.
const BANNERS = [
  { c: '#ece6d4', e: '#c8a050', k: 'star' }, { c: '#a8342a', e: '#f0b060', k: 'flame' }, { c: '#8a6a2a', e: '#e8c860', k: 'gear' },
  { c: '#3a6a8a', e: '#e8f4fc', k: 'flake' }, { c: '#2a5a3a', e: '#a8d890', k: 'leaf' }, { c: '#2a2438', e: '#b8a8d8', k: 'moon' },
  { c: '#3a2a5a', e: '#c89048', k: 'dragon' },
];
function emblem(k, cx, cy, r) {
  if (k === 'star') return star7(cx, cy, r);
  if (k === 'flame') return `M${f1(cx)},${f1(cy - r)}q${f1(r * 0.8)},${f1(r * 0.8)} 0,${f1(r * 1.8)}q${f1(-r * 0.8)},${f1(-r * 1)} 0,${f1(-r * 1.8)}z`;
  if (k === 'gear') { let d = ''; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; d += circ(cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8, r * 0.22); } return d + circ(cx, cy, r * 0.6); }
  if (k === 'flake') { let d = ''; for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; d += `M${f1(cx - Math.cos(a) * r)},${f1(cy - Math.sin(a) * r)}L${f1(cx + Math.cos(a) * r)},${f1(cy + Math.sin(a) * r)}`; } return d; }
  if (k === 'leaf') return `M${f1(cx)},${f1(cy - r)}q${f1(r * 0.9)},${f1(r)} 0,${f1(r * 2)}q${f1(-r * 0.9)},${f1(-r)} 0,${f1(-r * 2)}z`;
  if (k === 'moon') return `M${f1(cx + r * 0.3)},${f1(cy - r)}a${f1(r)},${f1(r)} 0 1 0 0,${f1(r * 2)}a${f1(r * 0.75)},${f1(r * 0.75)} 0 1 1 0,${f1(-r * 2)}z`;
  // a coiled dragon: a widening spiral ending in a head
  return `M${f1(cx - r * 0.2)},${f1(cy)}a${f1(r * 0.2)},${f1(r * 0.2)} 0 1 1 ${f1(r * 0.4)},0a${f1(r * 0.45)},${f1(r * 0.45)} 0 1 1 ${f1(-r * 0.9)},0a${f1(r * 0.7)},${f1(r * 0.7)} 0 1 1 ${f1(r * 1.4)},0l${f1(r * 0.3)},${f1(-r * 0.4)}`;
}
function sevenHall() {
  const S = new Scene('sbHcSevenHall', '白塔·七角殿：七角形的石殿，七张椅子各对一个角，每把椅子后面一面旗——晨星、赤焰、铸金、霜潮、翠影、夜鸦、龙脊（盘着的龙）；殿的正中一张矮桌，桌上一本册；墙上嵌着高窄的窗和镜面；晨星卫沿着墙站成一圈（剪影）；冷白和七种颜色，不画人脸', 17501);
  const C = { floor: '#cfc8ba', floorFar: '#bdb6a8', wall: '#e2ddd2', wallShade: '#a8a294', deep: '#6e695e', gold: '#c8a050', glass: '#9aa8b8' };
  S.add(`<rect width="${W}" height="${H}" fill="#2a2a30"/>`);
  // the floor: a large heptagon seen from above the near side, its far vertex up the middle
  const cx = 800, cy = 600, rx = 900, ry = 300;
  const V = Array.from({ length: 7 }, (_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 7; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const WH = 420;
  // the vault above, then the far walls rising from the heptagon's edges
  S.add(`<path d="M0,0H${W}V${f1(V[0][1] - WH + 40)}H0Z" fill="#3a3a44"/>`);
  for (const i of [4, 5, 6, 0, 1, 2]) {
    const a = V[i], b = V[(i + 1) % 7];
    const sh = 0.08 + 0.1 * Math.abs(i - 6.5) / 3;
    S.add(`<path d="${pz1([[a[0], a[1]], [b[0], b[1]], [b[0], b[1] - WH], [a[0], a[1] - WH]])}" fill="${mix(C.wall, C.wallShade, Math.min(sh, 0.6))}"/>`);
  }
  // tall windows and mirrors on the far walls, pilasters at the corners
  for (const i of [5, 6, 0, 1]) {
    const a = V[i], b = V[(i + 1) % 7];
    for (const t of [0.3, 0.7]) {
      const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      const w = Math.max(18, Math.abs(b[0] - a[0]) * 0.08);
      S.add(`<path d="M${f1(x - w)},${f1(y - 140)}V${f1(y - WH + 70)}q${f1(w)},-40 ${f1(w * 2)},0V${f1(y - 140)}Z" fill="${t < 0.5 ? S.lin([[0, '#dfe8f2'], [1, C.glass]]) : S.lin([[0, '#c8ccd4'], [0.5, '#f4f6fa'], [1, '#a8acb4']])}" stroke="${C.deep}" stroke-width="3"/>`);
    }
  }
  for (const i of [5, 6, 0, 1, 2]) { const a = V[i]; S.add(`<path d="M${f1(a[0] - 14)},${f1(a[1])}V${f1(a[1] - WH)}h28V${f1(a[1])}Z" fill="${C.wallShade}"/>`); }
  // the floor with its rings and the inlaid seven-pointed star
  S.add(`<path d="${pz1(V)}" fill="${S.rad([[0, C.floor], [1, C.floorFar]], 'cx="0.5" cy="0.7" r="0.7"')}"/>`);
  {
    let d = '';
    for (const k of [0.33, 0.66]) d += pz1(V.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]));
    for (const v of V) d += `M${cx},${cy}L${f1(v[0])},${f1(v[1])}`;
    S.add(`<path d="${d}" fill="none" stroke="${C.wallShade}" stroke-width="2" opacity=".6"/>`);
    S.add(`<path d="${star7(cx, cy / 0.34, 70, 0.46)}" fill="none" stroke="${C.gold}" stroke-width="3" opacity=".7" transform="matrix(1 0 0 0.34 0 0)"/>`);
  }
  // Morningstar guards along the far walls (silhouettes with halberds)
  for (const i of [5, 6, 0, 1]) {
    const a = V[i], b = V[(i + 1) % 7];
    for (const t of [0.15, 0.5, 0.85]) {
      const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t - 6;
      const s = 0.9 + (y - 300) / 900;
      S.add(`<path d="${person(x, y, 4.2 * s)}" fill="#e8ecf2" stroke="#8a929e" stroke-width="1.5"/><path d="M${f1(x + 9 * s)},${f1(y)}V${f1(y - 120 * s)}" stroke="#5a5e66" stroke-width="${f1(2.4 * s)}"/>`);
    }
  }
  // seven chairs, each at a corner, with its banner behind; far ones first
  const idx = [0, 1, 6, 2, 5, 3, 4];
  for (const i of idx) {
    const x = cx + (V[i][0] - cx) * 0.82, y = cy + (V[i][1] - cy) * 0.82;
    const s = 0.6 + (y - 300) / 600;
    const B = BANNERS[i];
    const bw = 60 * s, bh = 150 * s;
    S.add(`<path d="M${f1(x)},${f1(y - bh - 110 * s)}V${f1(y)}" stroke="${C.deep}" stroke-width="${f1(4 * s)}"/>`);
    S.add(`<path d="M${f1(x - bw / 2)},${f1(y - bh - 100 * s)}h${f1(bw)}v${f1(bh)}l${f1(-bw / 2)},${f1(-18 * s)}l${f1(-bw / 2)},${f1(18 * s)}z" fill="${B.c}" stroke="${C.deep}" stroke-width="1.5"/>`);
    const e = emblem(B.k, x, y - bh * 0.62 - 100 * s, 16 * s);
    S.add(B.k === 'flake' || B.k === 'dragon' ? `<path d="${e}" fill="none" stroke="${B.e}" stroke-width="${f1(3 * s)}"/>` : `<path d="${e}" fill="${B.e}"/>`);
    S.add(`<path d="M${f1(x - 26 * s)},${f1(y)}v${f1(-50 * s)}h${f1(52 * s)}v${f1(50 * s)}zM${f1(x - 26 * s)},${f1(y - 50 * s)}v${f1(-60 * s)}h${f1(52 * s)}v${f1(60 * s)}z" fill="${mix('#5a4636', B.c, 0.25)}" stroke="#2a201a" stroke-width="1.5"/>`);
  }
  // the low table and the open register in the middle
  S.add(`<path d="M${cx - 120},${cy + 40}h240l30,-50h-300z" fill="#7a5a3a"/><path d="M${cx - 120},${cy + 40}h240v14h-240z" fill="#4a3424"/>`);
  S.add(`<path d="M${cx - 50},${cy + 20}l100,0l12,-24l-100,0zM${cx},${cy + 20}l12,-24" fill="#efe6d0" stroke="#8a7a5a" stroke-width="1.5"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.7, '#000', 0.1], [1, '#000', 0.5]], 'cx="0.5" cy="0.55" r="0.75"')}"/>`);
  return S.out();
}

export const holyCityBgs = {
  'holy-city-pilgrim-hostel-night': () => hostel(),
  'saint-residence-smoke-night': () => residence(),
  'starsong-garden-predawn': () => garden(false),
  'starsong-garden-dawn': () => garden(true),
  'white-tower-outer-court-frost': () => frost(),
  'white-tower-outer-court-thawed': () => frost(true),
  'holy-city-pilgrim-hostel-day': () => hostel(true),
  'white-tower-outer-court-dusk': () => frost(true, 'dusk'),
  'white-tower-outer-court-night': () => frost(true, 'night'),
  'white-tower-outer-court-day': () => frost(true, 'day'),
  'white-tower-seven-angle-hall': () => sevenHall(),
};
