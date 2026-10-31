// 雾港·石门后·沉船残巢 (chapter 15; script 15 美術需求), one generator with three states:
//   fog-harbor-tide-nest        — 15-02 … 15-07 ('nest'): a natural water cave behind the stone door. An old wooden ship
//                                 lies slanted in the black water, the bow lifted at the left, the stern sunk at the
//                                 right, half of the hull under water; the planking of its upper side is gone over most
//                                 of its length, so the frames stand out one by one like ribs. From the broken tops of
//                                 three ribs hang long white cocoons, longer than a person (half-translucent, only the
//                                 outline of a human shape inside, no face, no blood). In the open hold behind the ribs,
//                                 strings of half-translucent small sacs, a thumb-sized white grub curled in each. Along
//                                 the right-hand cave wall four rusted old sluice gates in a row, above a stone sluice
//                                 platform standing clear of the water. Along the keel, low in the water, a grey-white
//                                 shell mass longer than the ship (plates like stacked old boat planks and shells) — the
//                                 place a battle portrait stands in front of; no head, no face, no creature drawn. The
//                                 only light is a little cold white from out of frame at the lower left (亚克's palm). No
//                                 figures.
//   fog-harbor-tide-nest-ruin   — after the fight ('ruin'): the cocoons gone (only torn silk tufts on the rib tops); the
//                                 shell along the keel split open, and out of the split a palm-sized living ring of wood
//                                 with fine leaves of seven colours, a corner of a copper plate under it (seven concentric
//                                 rings scored on it); the sacs in the hold hang empty and slack; small white grubs crawl
//                                 on the ribs and the shell toward the light; the water has risen to the platform's foot.
//   fog-harbor-tide-nest-burned — the burned nest ('burned'): the same ship burned black, smoke still rising from the
//                                 charred ribs, the sacs burned dry to dark husks, a few embers; on the blackened keel
//                                 the ring of wood is still green. No remains, no grubs in the fire, no cocoons.
// All geometry comes from fixed seeds shared by the three states, so they line up exactly. Water is flat colour with
// ripple lines, never a reflection (house rule of the coast scenes, coast.mjs).
import { Scene, W, H, f, pz, pl, persp, mix, rng, fbm } from './lib.mjs';
import { taper } from './coast.mjs';

const r0 = (v) => f(v, 0);
const f1 = (v) => f(v, 1);
const pz1 = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L') + 'Z';
const pl1 = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L');
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const C = {
  rock: { lit: '#4c5a5a', mid: '#2c3637', shade: '#192122', deep: '#0b1011' },
  ashlar: { lit: '#6a6e66', mid: '#464a44', shade: '#2a2e2a', joint: '#0e1110' },
  water: '#0d181b', waterFar: '#070e10', waterHi: '#6a8484',
  wood: { lit: '#7e6c56', mid: '#4e4234', shade: '#30281f', deep: '#17120d', hold: '#0c0a08' },
  char: { lit: '#4a3a30', mid: '#211a16', shade: '#120e0c', deep: '#080606' },
  ember: '#e0703a', emberHot: '#ffc06a', smoke: '#5a5a5c',
  silk: '#e4e8e0', silkShade: '#8e9894', silkDeep: '#5c6662', inner: '#4a5450',
  sac: '#c8dcd4', sacEdge: '#e8f2ee', grub: '#eef0e6', husk: '#2a2420',
  shell: { lit: '#aab0a6', mid: '#6e766e', shade: '#465048', deep: '#222824', seam: '#121614' },
  iron: '#1a1a1c', ironMid: '#363230', ironLit: '#6e645a', rust: '#8a4a2a', rustLit: '#b8683a',
  ringWood: '#4e7a36', ringLit: '#8ec060',
  leaves: ['#e0605a', '#e8984a', '#e6d04a', '#6cc46a', '#4ab4c8', '#5a74d8', '#a66ad0'],
  copper: '#a8683a', copperLit: '#e0a86a',
};

// the camera (cave space: X right, Y up, Z away; water at Y = WL)
const VP = [760, 380], F = 800, EYE = 1.6;
const pr = persp({ vp: VP, F, eye: EYE });
const P = (x, y, z) => pr(x, y, z);
const LIGHT = [-3.6, 1.0, 3.6]; // 亚克's palm, just out of frame at the lower left
const lk = (x, y, z) => { const d = Math.hypot(x - LIGHT[0], y - LIGHT[1], z - LIGHT[2]); return 1 / (1 + (d / 5.2) ** 2.2); };
const tone = (pal, t) => (t > 0.55 ? mix(pal.mid, pal.lit, Math.min(1, (t - 0.55) / 0.45)) : t > 0.25 ? mix(pal.shade, pal.mid, (t - 0.25) / 0.3) : mix(pal.deep || pal.shade, pal.shade, Math.max(0, t) / 0.25));
const XL = -6.0, XR = 4.0, ZB = 14.5, YC = 5.2; // left wall, right wall, back wall, ceiling

// the ship in screen space: gunwale from the lifted bow (left) to the sunk stern (right), hull depth along n
const BOW = [262, 236], STERN = [972, 440], HD = 214;
const SD = (() => { const dx = STERN[0] - BOW[0], dy = STERN[1] - BOW[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; })();
const SN = [-SD[1] * 0.35 + 0.0, 1]; // hull "down": mostly straight down, leaning a little toward the bow
const depth = (u) => HD * (u < 0.2 ? Math.pow(u / 0.2, 0.55) : 1) * (u > 0.9 ? 1 - (u - 0.9) * 0.6 : 1);
const G = (u) => { const p = lerp(BOW, STERN, u); return [p[0], p[1] + 16 * Math.sin(Math.PI * u)]; }; // the gunwale, a little sheer
const Q = (u, v) => { const g = G(u), d = depth(u) * v; return [g[0] + SN[0] * d - 22 * v * v * (1 - u), g[1] + SN[1] * d]; };
const RIBS = Array.from({ length: 13 }, (_, i) => 0.07 + i * 0.07);
const COCOON_RIBS = [1, 3, 5]; // ribs carrying the three cocoons
const GAP = (v, R) => v < 0.64; // the planking is gone from the upper side between the bow and the stern sections

function tideNest(state) {
  const nest = state === 'nest', ruin = state === 'ruin', burned = state === 'burned';
  const label = nest
    ? '雾港·石门后·沉船残巢：天然水洞里一条老木船斜躺在黑水中，船头翘起、船尾沉下，船身一半没在水里，船板脱落处一根一根的船肋露出来像肋骨；三根船肋上各挂一个比人还长的白色长茧，半透明，只看得出人形的轮廓；船舱里挂满一串一串半透明的小囊，囊里蜷着拇指大的白色小虫；右边洞壁上一字排开四道生锈的老闸，闸下是一座高出水面的石砌闸台；龙骨处的水里伏着一团比船还长的灰白甲壳；只有左下一点冷白的光'
    : ruin
      ? '雾港·沉船残巢·战后：同一条沉船，长茧都不在了，船肋顶上只剩撕开的丝；龙骨上的灰白甲壳裂开，裂缝里长出一个巴掌大的活木环，细叶有七种颜色，木环底下露出一角刻着七道同心环的铜片；船舱里的小囊都空了，白色的小虫在船肋和甲壳上往光那边爬；水涨到了闸台的下缘'
      : '雾港·沉船残巢·烧巢：同一条沉船烧成了焦黑，船肋冒着余烟，船舱里的小囊都烧干了，只剩黑色的空壳，几点余烬；焦黑的龙骨上，那个巴掌大的木环还是绿的；右边洞壁上四道生锈的老闸和闸台还在';
  const S = new Scene(nest ? 'sbTideNest' : ruin ? 'sbTideNestRuin' : 'sbTideNestBurned', label, 7801);
  const WL = ruin ? 0.45 : burned ? 0.18 : 0;
  const wy = (z) => VP[1] - (WL - EYE) / z * F; // the water line's screen y at depth z
  const SHIPZ = 8.6, shipWY = wy(SHIPZ);
  const topN = fbm(7802, 1.4, 3);

  // --- the cave: ceiling, back wall, left rock wall ------------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#030505'], [0.45, '#0a1012'], [1, '#0c1314']], `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${H}"`)}"/>`);
  {
    // the ceiling: lumpy rock seen from below, a few hanging lumps catching nothing
    const R = rng(7803);
    let d = '', lit = '';
    for (let i = 0; i < 30; i++) {
      const x = R.range(-5.5, 4), z = R.range(4.2, ZB), y = R.range(YC - 0.4, YC + 0.1), rx = R.range(0.5, 1.4), ry = R.range(0.2, 0.55);
      const pts = []; for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; pts.push(P(x + Math.cos(a) * rx * R.range(0.8, 1.15), y + Math.sin(a) * ry * R.range(0.8, 1.15), z)); }
      d += pz(pts);
      lit += pl([P(x - rx * 0.5, y - ry * 0.85, z), P(x + rx * 0.3, y - ry * 0.95, z)]);
    }
    S.add(`<path d="${d}" fill="#0f1617" opacity=".6"/><path d="${lit}" stroke="#1a2426" stroke-width="2" opacity=".35"/>`);
    // the back wall: rough rock, a little lit low on its left
    const N = 16;
    for (let i = 0; i < N; i++) {
      const x0 = XL + (XR - XL) * i / N, x1 = XL + (XR - XL) * (i + 1) / N;
      const t = lk((x0 + x1) / 2, 1.5, ZB) * (0.8 + 0.3 * topN(i * 0.9));
      S.add(`<path d="${pz([P(x0, WL - 0.05, ZB), P(x0, YC + 0.2 * topN(30 + i), ZB), P(x1, YC + 0.2 * topN(31 + i), ZB), P(x1, WL - 0.05, ZB)])}" fill="${tone(C.rock, t)}" stroke="${tone(C.rock, t)}" stroke-width="1"/>`);
    }
    // the left wall: rock strips receding, the lit side toward the palm light
    const NZ = 14;
    for (let i = 0; i < NZ; i++) {
      const z0 = 2.2 + (ZB - 2.2) * i / NZ, z1 = 2.2 + (ZB - 2.2) * (i + 1) / NZ;
      const xa = XL + 0.5 * topN(50 + i), xb = XL + 0.5 * topN(51 + i);
      const t = lk(XL, 1.5, (z0 + z1) / 2) * (0.85 + 0.35 * topN(70 + i * 0.6));
      S.add(`<path d="${pz([P(xa, WL - 0.05, z0), P(xa, YC + 0.3, z0), P(xb, YC + 0.3, z1), P(xb, WL - 0.05, z1)])}" fill="${tone(C.rock, t)}" stroke="${tone(C.rock, t)}" stroke-width="1"/>`);
    }
    // broken facets and ledges on both rock faces
    let fa = '', fs = '', ck = '';
    for (let i = 0; i < 40; i++) {
      const left = i < 26;
      const z = left ? R.range(2.6, ZB) : ZB, x = left ? XL + 0.3 * topN(50 + (z - 2.2) / (ZB - 2.2) * NZ) : R.range(XL + 0.3, XR - 0.3), y = R.range(WL + 0.4, YC - 0.3), sz = R.range(0.35, 0.9);
      const poly = [];
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + R.range(-0.3, 0.3), rr = sz * R.range(0.6, 1.1); poly.push(left ? P(x, y + Math.sin(a) * rr * 0.6, z + Math.cos(a) * rr) : P(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.6, z)); }
      if (R() < 0.45) fa += pz(poly); else fs += pz(poly);
      if (i % 3 === 0) { const a = left ? P(x, y, z) : P(x, y, z), b = [a[0] + R.range(-40, 40), a[1] + R.range(20, 60)]; ck += pl([a, b, [b[0] + R.range(-14, 14), b[1] + R.range(10, 30)]]); }
    }
    S.add(`<path d="${fa}" fill="#7a8a88" opacity=".08"/><path d="${fs}" fill="${C.rock.deep}" opacity=".4"/><path d="${ck}" fill="none" stroke="${C.rock.deep}" stroke-width="2" opacity=".7"/>`);
    // the old tide stain on the walls just above the water
    const band = (y0, y1) => pz([P(XL, y0, 2.2), P(XL, y0, ZB), P(XR, y0, ZB), P(XR, y1, ZB), P(XL, y1, ZB), P(XL, y1, 2.2)]);
    S.add(`<path d="${band(WL, WL + 0.5)}" fill="#0a1212" opacity=".55"/><path d="${band(0.92, 0.97)}" fill="#a4aca0" opacity=".1"/>`);
  }

  let waterFill = '';
  // --- the water (all of it; walls and the platform stand in it) ------------------------------------------------------
  {
    const yFar = wy(ZB);
    waterFill = S.lin([[0, C.waterFar], [1, C.water]], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(yFar)}" x2="0" y2="${H}"`);
    S.add(`<path d="M0,${f1(Math.min(yFar, P(XL, WL, 2.2)[1]))}H${W}V${H}H0Z" fill="${waterFill}"/>`);
    // a pale wet line where the water meets the left and back walls
    const foot = []; for (let i = 0; i <= 14; i++) { const z = 2.2 + (ZB - 2.2) * i / 14; foot.push(P(XL + 0.5 * topN(50 + i), WL, z)); }
    S.add(`<path d="${pl1([...foot, P(XR, WL, ZB)])}" fill="none" stroke="${C.waterHi}" stroke-width="1.6" opacity=".4"/>`);
  }

  // --- the right wall: old ashlar with the four sluices, the stone platform in front of them --------------------------
  const PX = 2.55, PY = 1.0, PZ0 = 5.4, PZ1 = ZB, FOOT = 0.45; // platform front face, top, near end, far end, rough foot
  const GATES = [[12.7, 0], [10.7, 0.5], [8.7, 0], [6.6, 0.28]]; // [z centre, how far the board is lifted]
  {
    const NZ = 12;
    for (let i = 0; i < NZ; i++) {
      const z0 = 3.2 + (ZB - 3.2) * i / NZ, z1 = 3.2 + (ZB - 3.2) * (i + 1) / NZ;
      const t = lk(XR, 2, (z0 + z1) / 2) * 1.15;
      S.add(`<path d="${pz([P(XR, WL - 0.05, z0), P(XR, 3.6, z0), P(XR, 3.6, z1), P(XR, WL - 0.05, z1)])}" fill="${tone(C.ashlar, t)}" stroke="${tone(C.ashlar, t)}" stroke-width="1"/>`);
      S.add(`<path d="${pz([P(XR, 3.6, z0), P(XR, YC + 0.3 * topN(90 + i), z0), P(XR, YC + 0.3 * topN(91 + i), z1), P(XR, 3.6, z1)])}" fill="${tone(C.rock, t * 0.9)}" stroke="${tone(C.rock, t * 0.9)}" stroke-width="1"/>`);
    }
    let co = '', hj = '';
    for (let y = 1.0, row = 0; y < 3.6; y += 0.4, row++) {
      co += pl([P(XR, y, 3.2), P(XR, y, ZB)]);
      for (let z = 3.2 + (row % 2) * 0.45; z < ZB; z += 0.9) { if (GATES.some(([gz]) => Math.abs(z - gz) < 0.85) && y < 3.0) continue; hj += pl([P(XR, y, z), P(XR, Math.min(3.6, y + 0.4), z)]); }
    }
    const Rj = rng(7804);
    let rag = '';
    for (let z = 3.2; z < ZB; z += 0.6) rag += pl([P(XR, 3.6 + Rj.range(-0.08, 0.1), z), P(XR, 3.6 + Rj.range(-0.08, 0.1), z + 0.6)]);
    S.add(`<path d="${co}" stroke="${C.ashlar.joint}" stroke-width="1.6" opacity=".55"/><path d="${hj}" stroke="${C.ashlar.joint}" stroke-width="1.4" opacity=".45"/><path d="${rag}" stroke="${C.rock.deep}" stroke-width="2.6" opacity=".7"/>`);
    // the sluices, far to near: an arched mouth, iron guides, a rusted board hung in them, a spindle up to a handwheel
    const Rr = rng(7805);
    for (const [gz, lift] of GATES) {
      const hw = 0.62, top = 2.75, z0 = gz - hw, z1 = gz + hw;
      const t = lk(XR, 2, gz);
      const archPts = [P(XR, PY, z0), P(XR, top - 0.35, z0)];
      for (let i = 0; i <= 10; i++) { const a = Math.PI - Math.PI * i / 10; archPts.push(P(XR, top - 0.35 + 0.35 * Math.sin(a), gz + Math.cos(a) * hw)); }
      archPts.push(P(XR, PY, z1));
      S.add(`<path d="${pz1(archPts)}" fill="#020303"/>`);
      // voussoirs round the arch
      let vs = '';
      for (let i = 0; i <= 8; i++) { const a = Math.PI - Math.PI * i / 8; vs += pl([P(XR, top - 0.35 + 0.35 * Math.sin(a), gz + Math.cos(a) * hw), P(XR, top - 0.35 + 0.55 * Math.sin(a) + 0.12, gz + Math.cos(a) * (hw + 0.2))]); }
      S.add(`<path d="${vs}" stroke="${C.ashlar.joint}" stroke-width="2" opacity=".75"/>`);
      // the board
      const b0 = PY + lift, b1 = Math.min(top + 0.15, b0 + 1.75);
      const board = pz1([P(XR - 0.02, b0, z0 - 0.06), P(XR - 0.02, b1, z0 - 0.06), P(XR - 0.02, b1, z1 + 0.06), P(XR - 0.02, b0, z1 + 0.06)]);
      S.add(`<path d="${board}" fill="${mix('#1c1a19', '#3a302a', Math.min(1, t * 1.2))}"/>`);
      let blot = '', streak = '';
      for (let i = 0; i < 7; i++) {
        const z = Rr.range(z0, z1), y = Rr.range(b0 + 0.15, b1 - 0.1), rz = Rr.range(0.06, 0.16), ry = Rr.range(0.05, 0.12);
        const pts = []; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; pts.push(P(XR - 0.03, y + Math.sin(a) * ry, z + Math.cos(a) * rz)); }
        blot += pz1(pts);
        const sz = Rr.range(z0 + 0.05, z1 - 0.05), sy = Rr.range(b0 + 0.4, b1);
        streak += pl1([P(XR - 0.03, sy, sz), P(XR - 0.03, sy - Rr.range(0.3, 0.9), sz + 0.02)]);
      }
      S.add(`<path d="${blot}" fill="${C.rust}" opacity=".26"/><path d="${streak}" stroke="${C.rust}" stroke-width="2" opacity=".3"/>`);
      // straps across the board
      let st = '';
      for (const y of [b0 + 0.2, (b0 + b1) / 2, b1 - 0.2]) st += pl1([P(XR - 0.04, y, z0 - 0.06), P(XR - 0.04, y, z1 + 0.06)]);
      S.add(`<path d="${st}" stroke="#1e1a18" stroke-width="5"/><path d="${st}" stroke="${C.rustLit}" stroke-width="1.2" opacity=".4" transform="translate(0 2)"/>`);
      if (lift > 0) S.add(`<path d="${pl1([P(XR - 0.03, b0, z0 - 0.06), P(XR - 0.03, b0, z1 + 0.06)])}" stroke="${C.rustLit}" stroke-width="1.6" opacity=".5"/>`);
      // the guides either side
      for (const z of [z0 - 0.1, z1 + 0.1]) S.add(`<path d="${pl1([P(XR - 0.05, PY, z), P(XR - 0.05, top + 0.5, z)])}" stroke="${C.iron}" stroke-width="${f1(Math.max(3, 0.1 * F / z))}"/><path d="${pl1([P(XR - 0.05, PY, z), P(XR - 0.05, top + 0.5, z)])}" stroke="${C.rust}" stroke-width="1.2" opacity=".3" transform="translate(-2 0)"/>`);
      // a lintel beam over the guides, the spindle and its handwheel
      S.add(`<path d="${pz1([P(XR - 0.08, top + 0.5, z0 - 0.25), P(XR - 0.08, top + 0.66, z0 - 0.25), P(XR - 0.08, top + 0.66, z1 + 0.25), P(XR - 0.08, top + 0.5, z1 + 0.25)])}" fill="${C.wood.shade}"/>`);
      const sp0 = P(XR - 0.1, b1, gz), sp1 = P(XR - 0.1, top + 0.95, gz), wr = 0.24 * F / gz;
      S.add(`<path d="M${f1(sp0[0])},${f1(sp0[1])}L${f1(sp1[0])},${f1(sp1[1])}" stroke="${C.iron}" stroke-width="3"/><ellipse cx="${f1(sp1[0])}" cy="${f1(sp1[1])}" rx="${f1(wr * 0.35)}" ry="${f1(wr * 0.5)}" fill="none" stroke="${C.ironMid}" stroke-width="3"/><path d="M${f1(sp1[0])},${f1(sp1[1] - wr * 0.5)}V${f1(sp1[1] + wr * 0.5)}" stroke="${C.ironMid}" stroke-width="2"/>`);
    }
    // the platform: the rough foot in the water, the dressed face, the top, the near end
    const tP = lk(PX, PY, 7);
    const faceRough = pz([P(PX, WL - 0.05, PZ0), P(PX, FOOT, PZ0), P(PX, FOOT, PZ1), P(PX, WL - 0.05, PZ1)]);
    const face = pz([P(PX, FOOT, PZ0), P(PX, PY, PZ0), P(PX, PY, PZ1), P(PX, FOOT, PZ1)]);
    const top = pz([P(PX, PY, PZ0), P(XR, PY, PZ0), P(XR, PY, PZ1), P(PX, PY, PZ1)]);
    const end = pz([P(PX, WL - 0.05, PZ0), P(PX, PY, PZ0), P(XR, PY, PZ0), P(XR, WL - 0.05, PZ0)]);
    if (WL < FOOT) S.add(`<path d="${faceRough}" fill="${tone(C.rock, tP * 0.7)}"/>`);
    S.add(`<path d="${face}" fill="${tone(C.ashlar, tP * 0.95)}"/><path d="${top}" fill="${tone(C.ashlar, tP * 1.3)}"/><path d="${end}" fill="${tone(C.ashlar, lk(3.2, 0.6, PZ0) * 1.2)}"/>`);
    let pj = '';
    for (let z = PZ0 + 0.7; z < PZ1; z += 0.9) pj += pl([P(PX, FOOT, z), P(PX, PY, z)]) + pl([P(PX, PY, z), P(XR, PY, z)]);
    pj += pl([P(PX, (FOOT + PY) / 2, PZ0), P(PX, (FOOT + PY) / 2, PZ1)]) + pl([P(PX, FOOT, PZ0), P(PX, FOOT, PZ1)]);
    // courses and joints on the near end
    for (const y of [0.25, FOOT, 0.72]) if (y > WL) pj += pl([P(PX, y, PZ0), P(XR, y, PZ0)]);
    for (const [x, y0, y1] of [[3.0, FOOT, 0.72], [3.5, 0.72, PY], [3.3, Math.max(WL, 0.25), FOOT], [2.8, 0.72, PY]]) if (y1 > WL) pj += pl([P(x, Math.max(WL, y0), PZ0), P(x, y1, PZ0)]);
    S.add(`<path d="${pj}" stroke="${C.ashlar.joint}" stroke-width="1.6" opacity=".6"/><path d="${pl([P(PX, PY, PZ0), P(PX, PY, PZ1)])}" stroke="#a8ac9c" stroke-width="2" opacity=".35"/>`);
    // the wet band on the face up to the old tide line; an iron mooring ring
    S.add(`<path d="${pz([P(PX, WL, PZ0), P(PX, WL + 0.3, PZ0), P(PX, WL + 0.3, PZ1), P(PX, WL, PZ1)])}" fill="#0a1010" opacity=".55"/>`);
    const mr = P(PX - 0.01, 0.72, 6.2), mrr = 0.11 * F / 6.2;
    S.add(`<ellipse cx="${f1(mr[0])}" cy="${f1(mr[1] + mrr * 0.6)}" rx="${f1(mrr * 0.5)}" ry="${f1(mrr * 0.8)}" fill="none" stroke="${C.iron}" stroke-width="3"/>`);
  }

  // --- the ship --------------------------------------------------------------------------------------------------------
  const hullPts = []; for (let i = 0; i <= 40; i++) hullPts.push(Q(i / 40, 0)); for (let i = 40; i >= 0; i--) hullPts.push(Q(i / 40, 1));
  const hullD = pz1(hullPts);
  const W_ = burned ? C.char : C.wood;
  const lt = (x, y) => Math.max(0, Math.min(1, 1.25 - Math.hypot(x - 60, y - 900) / 900)); // screen-space light from the lower left
  const Rs = rng(7806);
  {
    // the hold, dark, seen through the missing planks
    S.add(`<path d="${hullD}" fill="${burned ? '#070505' : C.wood.hold}"/>`);
    // the far side's frames inside the hold, and the deck beams across
    let far = '', beams = '';
    for (const u of RIBS) {
      const a = Q(u + 0.02, 0.02), b = Q(u + 0.03, 0.85);
      far += `M${f1(a[0] + 10)},${f1(a[1] + 8)}Q${f1((a[0] + b[0]) / 2 + 26)},${f1((a[1] + b[1]) / 2)} ${f1(b[0] + 6)},${f1(b[1])}`;
    }
    for (const v of [0.18, 0.5]) beams += pl1([Q(0.08, v), Q(0.7, v)].map(([x, y]) => [x + 12, y - 6]));
    S.add(`<path d="${far}" fill="none" stroke="${burned ? '#1a1412' : '#2a2219'}" stroke-width="7" opacity=".9"/><path d="${beams}" stroke="${burned ? '#140f0d' : '#221b14'}" stroke-width="9" opacity=".8"/>`);
    // strings of sacs hanging in the hold, between the ribs (full / empty / burned dry)
    const Rk = rng(7807);
    let thr = '', sacs = '', sacEdge = '', grubs = '', husks = '';
    for (let i = 0; i < 26; i++) {
      const u = Rk.range(0.1, 0.68), vTop = Rk.range(0.02, 0.2), len = Rk.range(0.25, 0.6);
      const a = Q(u, vTop), b = Q(u, Math.min(0.9, vTop + len));
      const x = a[0] + Rk.range(-4, 4);
      const n = Math.max(3, Math.round((b[1] - a[1]) / 20));
      thr += `M${f1(x)},${f1(a[1])}V${f1(b[1])}`;
      for (let k = 0; k < n; k++) {
        const y = a[1] + 12 + k * (b[1] - a[1] - 10) / n, rx = Rk.range(6, 9.5), ry = rx * Rk.range(1.1, 1.35);
        const sx = x + Rk.range(-2, 2);
        if (nest) {
          sacs += `<ellipse cx="${f1(sx)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}"/>`;
          sacEdge += `M${f1(sx - rx * 0.6)},${f1(y - ry * 0.5)}q${f1(rx * 0.3)},${f1(-ry * 0.45)} ${f1(rx * 0.9)},${f1(-ry * 0.4)}`;
          const ga = Rk.range(-60, 60);
          grubs += `<ellipse cx="${f1(sx + Rk.range(-1.5, 1.5))}" cy="${f1(y + 1)}" rx="${f1(rx * 0.42)}" ry="${f1(rx * 0.2)}" transform="rotate(${r0(ga)} ${f1(sx)} ${f1(y + 1)})"/>`;
        } else if (ruin) {
          // empty: a slack, wrinkled skin hanging off the string
          sacs += `<path d="M${f1(sx - rx * 0.5)},${f1(y - ry * 0.7)}q${f1(-rx * 0.3)},${f1(ry)} ${f1(rx * 0.2)},${f1(ry * 1.5)}q${f1(rx * 0.5)},${f1(-ry * 0.3)} ${f1(rx * 0.6)},${f1(-ry * 1.5)}z"/>`;
        } else {
          husks += `<path d="M${f1(sx - rx * 0.45)},${f1(y - ry * 0.5)}q${f1(-rx * 0.1)},${f1(ry * 0.8)} ${f1(rx * 0.4)},${f1(ry)}q${f1(rx * 0.4)},${f1(-ry * 0.4)} ${f1(rx * 0.3)},${f1(-ry)}z"/>`;
        }
      }
    }
    S.add(`<path d="${thr}" stroke="${burned ? '#2a2420' : '#8a9a94'}" stroke-width="1.1" opacity="${burned ? 0.6 : 0.55}"/>`);
    if (nest) S.add(`<g fill="${C.sac}" opacity=".3">${sacs}</g><g fill="${C.grub}" opacity=".85">${grubs}</g><path d="${sacEdge}" fill="none" stroke="${C.sacEdge}" stroke-width="1.2" opacity=".55"/>`);
    if (ruin) S.add(`<g fill="${C.sac}" opacity=".16" stroke="${C.sacEdge}" stroke-width=".8" stroke-opacity=".5">${sacs}</g>`);
    if (burned) S.add(`<g fill="${C.husk}" stroke="#4a3a30" stroke-width=".8">${husks}</g>`);
  }
  // the near-side frames (ribs), standing up past the gunwale where they are broken off
  const ribTop = (i) => { const u = RIBS[i]; const g = Q(u, 0); return [g[0] - 4 + (i % 3) * 3, g[1] - 34 - ((i * 37) % 23)]; };
  {
    let body = '', lit = '';
    RIBS.forEach((u, i) => {
      const a = Q(u, 0.95), t = ribTop(i);
      const c = [(a[0] + t[0]) / 2 - 30, (a[1] + t[1]) / 2];
      body += taper(a, c, t, 17, 11, 12);
      lit += `M${f1(a[0] - 8)},${f1(a[1])}Q${f1(c[0] - 8)},${f1(c[1])} ${f1(t[0] - 5)},${f1(t[1] + 2)}`;
      // the broken top: a splintered notch
      body += pz1([[t[0] - 6, t[1] + 2], [t[0] - 2, t[1] - 9], [t[0] + 2, t[1] - 2], [t[0] + 5, t[1] - 7], [t[0] + 6, t[1] + 3]]);
    });
    S.add(`<path d="${body}" fill="${W_.mid}"/><path d="${lit}" fill="none" stroke="${W_.lit}" stroke-width="3" opacity="${burned ? 0.55 : 0.7}"/>`);
    // shading on the far edge of each rib
    let sh = '';
    RIBS.forEach((u, i) => { const a = Q(u, 0.95), t = ribTop(i), c = [(a[0] + t[0]) / 2 - 30, (a[1] + t[1]) / 2]; sh += `M${f1(a[0] + 6)},${f1(a[1])}Q${f1(c[0] + 6)},${f1(c[1])} ${f1(t[0] + 4)},${f1(t[1] + 2)}`; });
    S.add(`<path d="${sh}" fill="none" stroke="${W_.deep}" stroke-width="4" opacity=".8"/>`);
  }
  // the planking that is left: the lower strakes all along, the upper strakes at the bow and over the stern
  {
    const R = rng(7808);
    const rows = 8;
    let pk = '', seams = '', lit = '', holes = '';
    for (let k = 0; k < rows; k++) {
      const v0 = k / rows, v1 = (k + 1) / rows;
      const spans = GAP(v0) ? [[0, R.range(0.06, 0.12)], [R.range(0.66, 0.76), 1]] : [[0, 1]];
      for (const [ua, ub] of spans) {
        const pts = [];
        for (let i = 0; i <= 12; i++) pts.push(Q(ua + (ub - ua) * i / 12, v0));
        for (let i = 12; i >= 0; i--) pts.push(Q(ua + (ub - ua) * i / 12, v1));
        // ragged plank ends where they broke off
        pk += pz1(pts);
        seams += pl1(Array.from({ length: 13 }, (_, i) => Q(ua + (ub - ua) * i / 12, v1)));
        lit += pl1(Array.from({ length: 13 }, (_, i) => Q(ua + (ub - ua) * i / 12, v0)).map(([x, y]) => [x, y + 2]));
        // butt joints along the strake
        for (let u = ua + 0.09 + (k % 2) * 0.045; u < ub - 0.02; u += 0.09) seams += pl1([Q(u, v0), Q(u, v1)]);
      }
      // a few strakes broken short into the gap
      if (GAP(v0) && R() < 0.6) { const ua = R.range(0.1, 0.2), a = Q(0.08, v0), b = Q(ua, v0 + 0.02), c = Q(ua - 0.03, v1), d = Q(0.08, v1); pk += pz1([a, b, c, d]); }
    }
    // holes punched in the lower strakes (dark)
    for (const [u, v] of [[0.3, 0.8], [0.52, 0.72], [0.8, 0.7]]) holes += pz1([Q(u - 0.02, v - 0.04), Q(u + 0.025, v - 0.05), Q(u + 0.03, v + 0.06), Q(u - 0.025, v + 0.05)]);
    S.add(`<path d="${pk}" fill="${W_.shade}"/>`);
    // light on the planking from the lower left, fading toward the stern
    const cl = S.clip(pk);
    S.add(`<g clip-path="${cl}"><rect width="${W}" height="${H}" fill="${S.rad([[0, burned ? '#2e2420' : '#8a765c', 0.75], [1, burned ? '#2e2420' : '#8a765c', 0]], 'gradientUnits="userSpaceOnUse" cx="140" cy="760" r="900"')}"/></g>`);
    S.add(`<path d="${seams}" fill="none" stroke="${W_.deep}" stroke-width="2" opacity=".75"/><path d="${lit}" fill="none" stroke="${W_.lit}" stroke-width="1.4" opacity=".4"/><path d="${holes}" fill="${burned ? '#050404' : C.wood.hold}"/>`);
    // the stem post at the bow and the transom at the stern
    const s0 = Q(0, 0), s1 = Q(0.03, 0.6), s2 = Q(0.12, 1);
    S.add(`<path d="${taper([s0[0] - 2, s0[1] - 30], [s1[0] - 20, s1[1]], s2, 14, 20, 12)}" fill="${W_.mid}"/><path d="M${f1(s0[0] - 8)},${f1(s0[1] - 30)}Q${f1(s1[0] - 28)},${f1(s1[1])} ${f1(s2[0] - 8)},${f1(s2[1])}" fill="none" stroke="${W_.lit}" stroke-width="2.4" opacity=".7"/>`);
    const t0 = Q(1, 0), t1 = lerp(t0, Q(1, 1), Math.min(1, (shipWY - t0[1]) / (Q(1, 1)[1] - t0[1]))); // only above the water
    S.add(`<path d="${pz1([[t0[0], t0[1] - 6], [t0[0] + 18, t0[1] - 2], [t1[0] + 14, t1[1]], [t1[0], t1[1]]])}" fill="${W_.deep}"/>`);
    // the gunwale rail where it survives, at the bow and the stern
    for (const [ua, ub] of [[0, 0.1], [0.7, 1]]) S.add(`<path d="${pl1(Array.from({ length: 9 }, (_, i) => Q(ua + (ub - ua) * i / 8, 0)))}" fill="none" stroke="${W_.mid}" stroke-width="8"/><path d="${pl1(Array.from({ length: 9 }, (_, i) => Q(ua + (ub - ua) * i / 8, 0)).map(([x, y]) => [x, y - 3]))}" fill="none" stroke="${W_.lit}" stroke-width="1.6" opacity=".55"/>`);
    // char: blistered cracks across the burned wood, embers in them
    if (burned) {
      const Rc = rng(7809);
      let ck = '', em = '';
      for (let i = 0; i < 44; i++) {
        const u = Rc.range(0.02, 0.98), v = Rc.range(0.05, 0.95), a = Q(u, v), L = Rc.range(8, 22);
        ck += `M${f1(a[0])},${f1(a[1])}h${f1(L)}m${f1(-L * 0.4)},0v${f1(Rc.range(4, 9))}`;
        if (i % 4 === 0 && a[1] < shipWY - 6) em += `<path d="M${f1(a[0] + 2)},${f1(a[1])}h${f1(L * 0.6)}" />`;
      }
      S.add(`<path d="${ck}" fill="none" stroke="#050403" stroke-width="2" opacity=".8"/><g stroke="${C.ember}" stroke-width="2" stroke-linecap="round" opacity=".8">${em}</g>`);
    }
  }

  // --- cocoons on three ribs (nest) / torn silk on the rib tops (ruin) ----------------------------------------------
  if (nest) {
    const R = rng(7810);
    for (const i of COCOON_RIBS) {
      const t = ribTop(i), Hs = 150 + i * 6, Rw = 30;
      const top = [t[0] - 6, t[1] + 4], cx = top[0] - 10;
      const prof = (tt) => Rw * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, tt))), 0.62) * (1 + 0.08 * Math.sin(tt * 9 + i));
      const Lp = [], Rp = [];
      for (let k = 0; k <= 20; k++) { const tt = k / 20, y = top[1] + 10 + Hs * tt, w = prof(tt); Lp.push([cx - w * 0.98, y]); Rp.unshift([cx + w, y]); }
      const litk = lt(cx, top[1] + Hs / 2);
      const cLit = mix(C.silkShade, C.silk, litk), cMid = mix(C.silkDeep, C.silkShade, litk), cDark = mix('#2a3230', C.silkDeep, litk);
      S.add(`<path d="${pz1([...Lp, ...Rp])}" fill="${S.lin([[0, cLit], [0.45, cMid], [1, cDark]], 'x1="0" y1="0" x2="1" y2="0"')}" opacity=".86"/>`);
      const y0 = top[1] + 10, ox = cx + 2, hy = y0 + Hs * 0.13, hr = Rw * 0.36;
      S.add(`<path d="M${f1(ox - hr)},${f1(hy)}a${f1(hr)},${f1(hr * 1.15)} 0 1 0 ${f1(hr * 2)},0a${f1(hr)},${f1(hr * 1.15)} 0 1 0 ${f1(-hr * 2)},0Z${pz1([[ox - Rw * 0.2, hy + hr * 1.05], [ox - Rw * 0.62, y0 + Hs * 0.27], [ox - Rw * 0.58, y0 + Hs * 0.56], [ox - Rw * 0.3, y0 + Hs * 0.92], [ox + Rw * 0.3, y0 + Hs * 0.92], [ox + Rw * 0.58, y0 + Hs * 0.56], [ox + Rw * 0.62, y0 + Hs * 0.27], [ox + Rw * 0.2, hy + hr * 1.05]])}" fill="${C.inner}" opacity=".42"/>`);
      let th = '';
      for (let k = 0; k < 8; k++) { const tt = R.range(0.08, 0.95), y = y0 + Hs * tt, w = prof(tt) * 0.95, sl = R.range(-0.14, 0.14) * Rw; th += `M${f1(cx - w)},${f1(y - sl)}Q${f1(cx)},${f1(y + Rw * 0.18)} ${f1(cx + w)},${f1(y + sl)}`; }
      S.add(`<path d="${th}" fill="none" stroke="${cLit}" stroke-width="1.1" opacity=".55"/>`);
      S.add(`<path d="M${f1(cx - 7)},${f1(y0 + 6)}L${f1(t[0] - 3)},${f1(t[1] - 4)}L${f1(cx + 8)},${f1(y0 + 6)}" fill="${cMid}" stroke="${cLit}" stroke-width="1" opacity=".85"/>`);
      S.add(`<path d="${pl1(Lp.slice(2, 18).map(([x, y]) => [x + 3, y]))}" fill="none" stroke="#f4f8f2" stroke-width="1.6" opacity="${f1(0.2 + litk * 0.45, 2)}"/>`);
    }
  } else if (ruin) {
    let tufts = '';
    for (const i of COCOON_RIBS) { const t = ribTop(i); tufts += `M${f1(t[0] - 4)},${f1(t[1] - 2)}q-6,14 -3,30q5,-12 4,-24q4,14 10,22q-2,-16 -5,-28z`; }
    S.add(`<path d="${tufts}" fill="${C.silkShade}" opacity=".75"/>`);
  }

  // the water over the hull's sunk half (the shell lies in front of it)
  {
    const cl = S.clip(hullD);
    S.add(`<g clip-path="${cl}"><rect x="0" y="${f1(shipWY)}" width="${W}" height="${f1(H - shipWY)}" fill="${waterFill}" opacity=".96"/></g>`);
  }

  // --- the shell mass along the keel, in the water ---------------------------------------------------------------------
  {
    const R = rng(7811);
    const x0 = 120, x1 = 1380, base = shipWY + 8;
    const hump = (x) => { const t = (x - x0) / (x1 - x0); return 96 * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, t))), 0.55) * (1 + 0.06 * Math.sin(t * 11)); };
    const topPts = []; for (let i = 0; i <= 48; i++) { const x = x0 + (x1 - x0) * i / 48; topPts.push([x, base - hump(x)]); }
    const SH = burned ? { lit: '#5a5650', mid: '#34322e', shade: '#201e1c', deep: '#100f0e', seam: '#070606' } : C.shell;
    const mass = pz1([...topPts, [x1, base], [x0, base]]);
    S.add(`<path d="${mass}" fill="${S.lin([[0, SH.mid], [0.55, SH.shade], [1, SH.deep]], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(base - 100)}" x2="0" y2="${r0(base)}"`)}"/>`);
    const cl = S.clip(mass);
    // segments: broad bands across the back, each overlapping the next like stacked old boat planks, a lit front lip
    // and a dark seam behind it; their edges are ragged with small shells stuck on them
    const NSEG = 17;
    let segSh = '', segLit = '', segFace = '', barn = '';
    for (let i = 1; i < NSEG; i++) {
      const x = x0 + (x1 - x0) * i / NSEG + R.range(-8, 8), h = hump(x);
      const pts = []; for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push([x - 26 * Math.sin(Math.PI * t * 0.5) + 30 * t * t - 4, base - h - 2 + (h + 2) * t]); }
      const back = pts.map(([px, py]) => [px + 18, py]);
      segFace += pz1([...pts, ...back.slice().reverse()]);
      segSh += pl1(back);
      segLit += pl1(pts.slice(0, 7));
      for (let k = 0; k < 3; k++) { const t = R.range(0.1, 0.7), bx = x - 20 * t + R.range(-4, 10), by = base - h + h * t; barn += `M${f1(bx - 5)},${f1(by + 3)}q5,-9 10,0z`; }
    }
    // a lengthwise ridge (the keel of the shell) and plank-like lines along the flank
    const ridge = topPts.slice(2, 47).map(([x, y]) => [x, y + 10]);
    let planks = '';
    for (const k of [0.32, 0.55, 0.76]) planks += pl1(topPts.slice(3, 46).map(([x, y]) => [x, y + (base - y) * k + 3 * Math.sin(x / 40)]));
    S.add(`<g clip-path="${cl}"><path d="${segFace}" fill="${SH.shade}" opacity=".7"/><path d="${planks}" fill="none" stroke="${SH.seam}" stroke-width="1.6" opacity=".55"/><path d="${segSh}" fill="none" stroke="${SH.seam}" stroke-width="5" opacity=".8"/><path d="${segLit}" fill="none" stroke="${SH.lit}" stroke-width="2.6" opacity=".75"/>`
      + `<path d="${barn}" fill="${SH.mid}" stroke="${SH.lit}" stroke-width=".8" opacity=".85"/><path d="${pl1(ridge)}" fill="none" stroke="${SH.seam}" stroke-width="2" opacity=".5"/>`
      + `<rect width="${W}" height="${H}" fill="${S.rad([[0, '#d8e4e0', burned ? 0.08 : 0.26], [1, '#d8e4e0', 0]], `gradientUnits="userSpaceOnUse" cx="160" cy="${r0(base)}" r="820"`)}"/>`
      + `<rect width="${W}" height="${H}" fill="${S.lin([[0, '#000', 0], [0.6, '#000', 0.25], [1, '#000', 0.5]], 'gradientUnits="userSpaceOnUse" x1="200" y1="0" x2="1380" y2="0"')}"/></g>`);
    S.add(`<path d="${pl1(topPts.slice(1, 32))}" fill="none" stroke="${SH.lit}" stroke-width="2.2" opacity="${burned ? 0.3 : 0.5}"/>`);
    // the split along its back (ruin, burned): a dark rift, its lips curled up
    const sx = 560, ring = [sx + 40, base - hump(sx + 40) - 4];
    if (!nest) {
      const rift = []; for (let i = 0; i <= 14; i++) { const x = sx - 150 + i * 28; rift.push([x, base - hump(x) + 8 + (i % 2) * 5]); }
      const lip = rift.map(([x, y], i) => [x + 4, y - 10 - Math.sin(Math.PI * i / 14) * 12]);
      S.add(`<path d="${pz1([...rift, ...lip.slice().reverse()])}" fill="${SH.seam}"/><path d="${pl1(lip)}" fill="none" stroke="${SH.lit}" stroke-width="1.8" opacity=".5"/>`);
    }
    // small white grubs crawling on the ribs and the shell, all heading down-left toward the light (ruin)
    if (ruin) {
      let gr = '', seg = '';
      const add = (x, y, a, s = 1) => {
        gr += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(6 * s)}" ry="${f1(2.6 * s)}" transform="rotate(${r0(a)} ${f1(x)} ${f1(y)})"/>`;
        const rad = a * Math.PI / 180, cx = Math.cos(rad), cy = Math.sin(rad);
        for (const t of [-2.6, 0, 2.6]) seg += `M${f1(x + cx * t * s - cy * 2.4 * s)},${f1(y + cy * t * s + cx * 2.4 * s)}l${f1(cy * 4.8 * s)},${f1(-cx * 4.8 * s)}`;
      };
      for (let i = 0; i < 16; i++) { const x = x0 + 80 + 760 * R() ** 1.4, y = base - hump(x) * R.range(0.2, 0.8); add(x, y, R.range(155, 195), R.range(0.8, 1.1)); }
      RIBS.forEach((u, i) => { if (i % 2) return; const a = Q(u, R.range(0.2, 0.7)); if (a[1] < shipWY - 8) add(a[0] - 18, a[1], R.range(100, 125)); });
      // and on the platform's top, toward its near end
      for (let i = 0; i < 6; i++) { const p = P(R.range(PX + 0.1, XR - 0.2), PY, R.range(PZ0 + 0.3, 8)); add(p[0], p[1] + 2, R.range(150, 190), 0.8); }
      S.add(`<g fill="${C.grub}" opacity=".9">${gr}</g><path d="${seg}" stroke="#8a8c80" stroke-width=".8" opacity=".8"/>`);
    }
    // the ring of wood growing out of the split, the copper plate under it (ruin, burned)
    if (!nest) {
      const [rx, ry] = ring, rr = 23;
      S.add(`<ellipse cx="${f1(rx)}" cy="${f1(ry)}" rx="70" ry="44" fill="${S.rad([[0, '#a8e08a', burned ? 0.32 : 0.22], [1, '#a8e08a', 0]])}"/>`);
      // the copper plate's corner sticking out of the rift below the ring: seven concentric scored rings
      const cx = rx + 16, cy = ry + 26;
      let rings = '';
      for (let k = 1; k <= 7; k++) rings += `M${f1(cx - 3.2 * k)},${f1(cy)}a${f1(3.2 * k)},${f1(2 * k)} 0 0 1 ${f1(6.4 * k)},0`;
      S.add(`<path d="${pz1([[cx - 28, cy + 4], [cx - 22, cy - 16], [cx + 18, cy - 20], [cx + 30, cy + 2]])}" fill="${C.copper}"/><g clip-path="${S.clip(pz1([[cx - 28, cy + 4], [cx - 22, cy - 16], [cx + 18, cy - 20], [cx + 30, cy + 2]]))}"><path d="${rings}" transform="translate(0 4)" fill="none" stroke="#5a3418" stroke-width="1.1"/></g><path d="M${f1(cx - 22)},${f1(cy - 16)}L${f1(cx + 18)},${f1(cy - 20)}" stroke="${C.copperLit}" stroke-width="1.6" opacity=".85"/>`);
      // roots from the ring down into the rift
      let roots = '';
      for (const [dx, dy, ex, ey] of [[-14, 14, -30, 32], [-4, 20, -8, 40], [10, 18, 4, 36], [18, 10, 40, 26]]) roots += `M${f1(rx + dx)},${f1(ry + dy)}Q${f1(rx + (dx + ex) / 2 - 4)},${f1(ry + (dy + ey) / 2 + 4)} ${f1(rx + ex)},${f1(ry + ey)}`;
      S.add(`<path d="${roots}" fill="none" stroke="#3a5a28" stroke-width="2.6" stroke-linecap="round"/>`);
      // the ring itself: a twisted band of living wood, its lit upper rim
      S.add(`<ellipse cx="${f1(rx)}" cy="${f1(ry)}" rx="${rr}" ry="${f1(rr * 0.9)}" fill="none" stroke="#2c4a1e" stroke-width="10"/><ellipse cx="${f1(rx)}" cy="${f1(ry)}" rx="${rr}" ry="${f1(rr * 0.9)}" fill="none" stroke="${C.ringWood}" stroke-width="7"/>`);
      S.add(`<path d="M${f1(rx - rr)},${f1(ry)}A${rr},${f1(rr * 0.9)} 0 0 1 ${f1(rx + rr * 0.5)},${f1(ry - rr * 0.78)}" fill="none" stroke="${C.ringLit}" stroke-width="2.4" opacity=".9"/>`);
      let tw = '';
      for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, x = rx + Math.cos(a) * rr, y = ry + Math.sin(a) * rr * 0.9; tw += `M${f1(x - 2.6)},${f1(y - 2.6)}l5.2,5.2`; }
      S.add(`<path d="${tw}" stroke="#2c4a1e" stroke-width="1.4" opacity=".8"/>`);
      // fine leaves of seven colours round the ring
      const Rl = rng(7812);
      for (let k = 0; k < 21; k++) {
        const a = k / 21 * Math.PI * 2 + Rl.range(-0.1, 0.1), x = rx + Math.cos(a) * (rr + 2), y = ry + Math.sin(a) * (rr + 2) * 0.9;
        const L = Rl.range(7, 10), ang = a * 180 / Math.PI + Rl.range(-30, 30);
        S.add(`<path d="M${f1(x)},${f1(y)}q${f1(L * 0.5)},-3.4 ${f1(L)},0q${f1(-L * 0.5)},3.4 ${f1(-L)},0z" fill="${C.leaves[k % 7]}" transform="rotate(${r0(ang)} ${f1(x)} ${f1(y)})"/>`);
      }
    }
  }

  // --- the water over the hull's sunk half, the waterline, ripples ------------------------------------------------------
  {
    // where the water meets the hull and the shell: a pale line
    S.add(`<path d="M120,${f1(shipWY + 8)}H1380" stroke="${C.waterHi}" stroke-width="2" opacity=".4"/><path d="M120,${f1(shipWY + 4)}H1380" stroke="#050808" stroke-width="7" opacity=".45"/>`);
    const R = rng(ruin ? 7814 : 7813);
    let rp = '';
    for (let i = 0; i < 46; i++) {
      const z = R.range(2.8, ZB - 0.5), x = R.range(-4.5, 2.4), L = R.range(0.3, 1.1);
      const a = P(x, WL, z), b = P(x + L, WL, z);
      if (a[1] > 860 || (a[1] < shipWY + 10 && a[0] > 140 && a[0] < 1380)) continue;
      rp += `M${f1(a[0])},${f1(a[1])}Q${f1((a[0] + b[0]) / 2)},${f1(a[1] - 1.5)} ${f1(b[0])},${f1(b[1])}`;
    }
    S.add(`<path d="${rp}" fill="none" stroke="${C.waterHi}" stroke-width="1.4" stroke-linecap="round" opacity=".3"/>`);
    S.add(`<ellipse cx="140" cy="${H - 20}" rx="760" ry="250" fill="${S.rad([[0, '#9cb4b4', 0.16], [1, '#9cb4b4', 0]])}"/>`);
  }

  // --- smoke and embers (burned) ---------------------------------------------------------------------------------------
  if (burned) {
    const R = rng(7815);
    let sm = '';
    RIBS.forEach((u, i) => {
      if (i % 2 === 0) return;
      const t = ribTop(i);
      let d = `M${f1(t[0])},${f1(t[1])}`, x = t[0], y = t[1];
      for (let k = 0; k < 5; k++) { const nx = x + R.range(-10, 26), ny = y - R.range(36, 54); d += `Q${f1(x + R.range(-24, 24))},${f1((y + ny) / 2)} ${f1(nx)},${f1(ny)}`; x = nx; y = ny; }
      sm += `<path d="${d}" fill="none" stroke="${C.smoke}" stroke-width="${f1(R.range(10, 16))}" stroke-linecap="round" opacity=".22"/>`;
    });
    S.add(`<g filter="${S.blur(2)}">${sm}</g>`);
    // a few embers glowing at the rib tops and drifting up
    let em = '';
    RIBS.forEach((u, i) => { if (i % 3 === 1) return; const t = ribTop(i); em += `<path d="M${f1(t[0] - 4)},${f1(t[1] + 4 + (i % 2) * 6)}l${f1(3 + (i % 3))},-2"/>`; });
    for (let i = 0; i < 14; i++) em += `<circle cx="${f1(R.range(300, 1000))}" cy="${f1(R.range(120, 380))}" r="${f1(R.range(1, 2), 1)}"/>`;
    S.add(`<g fill="${C.emberHot}" stroke="${C.ember}" stroke-width="2.4" stroke-linecap="round" opacity=".8">${em}</g>`);
    S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#ff8040', 0.1], [1, '#ff8040', 0]], 'gradientUnits="userSpaceOnUse" cx="640" cy="360" r="700"')}"/>`);
  }

  // --- grading: cold, the corners and ceiling sink into black, the bottom quiet under the dialogue box -----------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.3, '#020405', 0], [1, '#020405', 0.72]], 'gradientUnits="userSpaceOnUse" cx="640" cy="470" r="1050"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#c8dcdc', 0.12], [1, '#c8dcdc', 0]], 'gradientUnits="userSpaceOnUse" cx="40" cy="880" r="700"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#040708', 0], [1, '#040708', 0.7]])}"/>`);
  return S.out();
}

export const tideNestBgs = {
  'fog-harbor-tide-nest': () => tideNest('nest'),
  'fog-harbor-tide-nest-ruin': () => tideNest('ruin'),
  'fog-harbor-tide-nest-burned': () => tideNest('burned'),
};
