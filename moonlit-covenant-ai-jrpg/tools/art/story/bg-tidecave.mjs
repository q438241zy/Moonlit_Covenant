// 雾港·潮穴 (chapter 14; script 14 美術需求):
//   fog-harbor-tide-cave-sluice      — 老涵洞尽头·潮穴老闸 (14-03, 14-07): looking down the last stretch of the old brick-
//                                      arched culvert to its end wall: a rusted iron gate board hung up in its two iron
//                                      guides, its chain running up over a pulley under the vault and down to a wooden
//                                      winch on the right-hand walkway, a wooden wedge jammed between the cog's teeth;
//                                      black water under the gate and black behind it; a lantern hung on the end wall
//                                      beside the gate, a few small white grubs crawling on its shade. No figures.
//   fog-harbor-tide-cave-sluice-shut — the same, the gate dropped to the bottom: the chain hanging slack, the wedge split
//                                      and lying on the walkway, a short bent metal rod (Mia's 叮当三号) jammed into the
//                                      teeth instead (sluice(true)).
//   fog-harbor-tide-cave             — 潮穴·茧壁 (14-04 … 14-06): a water cave, natural rock and old ashlar mixed; along
//                                      the left wall rows of long white cocoons, longer than a person, hang from iron
//                                      hooks (half-translucent, a human outline faintly inside, no face drawn, no blood),
//                                      the lowest row a hand's breadth above the flat water; at the wall's end three
//                                      empty hooks with small wooden tags; deepest in, a two-leaf stone door with water
//                                      seeping from its seam. The only light is a little cold white from the lower left
//                                      (亚克's palm, out of frame). No figures.
//   fog-harbor-tide-cave-flood       — the same cave with the water risen to waist height and rippling, the stone door
//                                      pushed half open by it (black behind), only three cocoons left on the wall
//                                      (tideCave(true)).
//   fog-harbor-tide-cave-empty       — 潮穴·退潮 (15-02): the same cave at low water the next day, every cocoon gone from
//                                      the wall, only the iron hooks left (and the three tagged ones at its end); the
//                                      stone door shut, its seam wet (tideCave(false, true)).
// Variants are parameters of one generator each, all geometry from fixed seeds, so the pairs line up exactly.
// No reflections in the water (flat colour and ripple lines only), no text on the tags (an ink stroke only).
import { Scene, W, H, f, pz, pl, persp, mix, rng, fbm } from './lib.mjs';

const r0 = (v) => f(v, 0);
const f1 = (v) => f(v, 1);
const pz1 = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L') + 'Z';
const pl1 = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L');

// =============================================================================================
// the old sluice at the end of the culvert
// =============================================================================================
const SL = {
  brick: { lit: '#8a5c44', mid: '#5c3c2e', shade: '#3a2620', deep: '#211612', joint: '#160e0c' },
  slime: '#1c2a24', wet: '#120c0c',
  water: '#0c1416', waterHi: '#4a5e5c',
  iron: '#1e1e20', ironMid: '#3a3634', ironLit: '#7a6c60', rust: '#8a4a2a', rustLit: '#b8683a',
  wood: { lit: '#8a6e4e', mid: '#5e4a34', shade: '#382c20', deep: '#1e1812' },
  lamp: '#ffc874', lampHot: '#fff0c8', grub: '#eef0e6',
  rod: '#9aa2a8', rodLit: '#e2e8ec', brass: '#c8a050',
};

function sluice(shut) {
  const S = new Scene(shut ? 'sbTideSluiceShut' : 'sbTideSluice', shut
    ? '雾港·潮穴老闸·闸落：老涵洞尽头的砖拱，生锈的铁闸板落到了底，链子松松地垂着；右边走道上的木绞盘，齿间卡着一截弯掉的金属小棍，裂开的木楔掉在走道上；闸边那盏提灯还挂着，灯罩上爬着几只白色的小虫；闸前是黑水'
    : '雾港·潮穴老闸：老涵洞尽头的砖拱，一道生锈的铁闸板吊在半空，链子从拱顶的滑轮绕到右边走道上的木绞盘，齿间卡着一根木楔；闸下是黑水，闸后一片黑；闸边挂着一盏提灯，灯罩上爬着几只白色的小虫', 7701);
  const C = SL, B = C.brick;
  const VP = [800, 392], F = 720, EYE = 1.55;
  const pr = persp({ vp: VP, F, eye: EYE });
  const P = (x, y, z) => pr(x, y, z);
  const HW = 2.1, CH = 1.35, YW = 0.42, SPR = 2.0, ZN = 0.55, ZE = 6.6; // half-width, channel edge, walkway top, springing, near, end
  // the culvert's cross-section, left walkway edge → up the left wall → over the vault → down to the right walkway edge
  const prof = [];
  prof.push([-HW, YW]);
  for (let y = YW + 0.26; y < SPR; y += 0.26) prof.push([-HW, y]);
  for (let i = 0; i <= 24; i++) { const a = Math.PI - Math.PI * i / 24; prof.push([HW * Math.cos(a), SPR + HW * Math.sin(a)]); }
  for (let y = SPR - 0.26; y > YW + 0.01; y -= 0.26) prof.push([HW, y]);
  prof.push([HW, YW]);
  const LAMP = [-1.72, 2.05, ZE - 0.16];
  const lampS = P(...LAMP);
  // brightness of a point lit by the lantern (warm) — falls off with distance; a faint grey ambient
  const lampK = (x, y, z) => { const d = Math.hypot(x - LAMP[0], y - LAMP[1], z - LAMP[2]); return 1 / (1 + (d / 1.6) ** 2); };

  S.add(`<rect width="${W}" height="${H}" fill="#060404"/>`);

  // --- vault and walls: strips along z, each split into slabs so the lantern light falls off toward us ---------------
  {
    const zs = [ZN, 1.2, 1.9, 2.7, 3.5, 4.3, 5.0, 5.6, 6.1, ZE];
    let d = '';
    const fills = new Map();
    for (let i = 0; i < prof.length - 1; i++) {
      const [x0, y0] = prof[i], [x1, y1] = prof[i + 1];
      // orientation: the left wall and the vault's left half face the lantern side less than the right (lantern is left)
      const xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
      for (let k = 0; k < zs.length - 1; k++) {
        const za = zs[k], zb = zs[k + 1], zm = (za + zb) / 2;
        const t = Math.min(1, lampK(xm, ym, zm) * 1.25 + 0.06 + (xm > 0 ? 0.04 : 0));
        const col = t > 0.5 ? mix(B.mid, B.lit, (t - 0.5) * 2) : t > 0.2 ? mix(B.shade, B.mid, (t - 0.2) / 0.3) : mix(B.deep, B.shade, t / 0.2);
        const q = pz([P(x0, y0, za), P(x1, y1, za), P(x1, y1, zb), P(x0, y0, zb)]);
        fills.set(col, (fills.get(col) || '') + q);
      }
    }
    for (const [col, dd] of fills) d += `<path d="${dd}" fill="${col}" stroke="${col}" stroke-width=".8"/>`;
    S.add(d);
    // brick courses: lines along z on the walls and along the vault; ring joints staggered course by course
    let co = '', hj = '';
    const courses = [];
    for (let y = YW + 0.22; y < SPR - 0.02; y += 0.22) { courses.push([-HW, y]); courses.push([HW, y]); }
    for (let i = 1; i < 18; i++) { const a = Math.PI * i / 18; courses.push([HW * Math.cos(a), SPR + HW * Math.sin(a)]); }
    for (const [x, y] of courses) co += pl([P(x, y, ZN), P(x, y, ZE)]);
    S.add(`<path d="${co}" stroke="${B.joint}" stroke-width="1.3" opacity=".55"/>`);
    // header joints, the courses' successive pairs (walls) and arcs (vault)
    const wallYs = []; for (let y = YW; y < SPR; y += 0.22) wallYs.push(y);
    for (const side of [-1, 1]) {
      wallYs.forEach((y, row) => {
        const y1 = Math.min(SPR, y + 0.22);
        for (let z = ZN + (row % 2) * 0.22; z < ZE; z += 0.44) hj += pl([P(side * HW, y, z), P(side * HW, y1, z)]);
      });
    }
    for (let i = 0; i < 18; i++) {
      const a0 = Math.PI * i / 18, a1 = Math.PI * (i + 1) / 18;
      for (let z = ZN + (i % 2) * 0.22; z < ZE; z += 0.44) hj += pl([P(HW * Math.cos(a0), SPR + HW * Math.sin(a0), z), P(HW * Math.cos(a1), SPR + HW * Math.sin(a1), z)]);
    }
    S.add(`<path d="${hj}" stroke="${B.joint}" stroke-width="1" opacity=".42"/>`);
    // tide marks: the walls dark and slimy up to where the water comes, a pale salt line on top
    const band = (side, y0, y1) => pz([P(side * HW, y0, ZN), P(side * HW, y0, ZE), P(side * HW, y1, ZE), P(side * HW, y1, ZN)]);
    S.add(`<path d="${band(-1, YW, 1.25)}${band(1, YW, 1.25)}" fill="${C.slime}" opacity=".5"/><path d="${band(-1, 1.23, 1.28)}${band(1, 1.23, 1.28)}" fill="#a8a490" opacity=".22"/>`);
    // damp streaks running down from the vault
    const Rs = rng(7702);
    let st = '';
    for (let i = 0; i < 22; i++) {
      const side = Rs() < 0.5 ? -1 : 1, z = Rs.range(1.2, ZE - 0.3), y0 = Rs.range(1.5, SPR), y1 = Rs.range(1.25, y0 - 0.2), w = Rs.range(0.04, 0.1);
      st += pz([P(side * HW, y0, z), P(side * HW, y0, z + w), P(side * HW, y1, z + w * 0.4), P(side * HW, y1, z)]);
    }
    S.add(`<path d="${st}" fill="${C.wet}" opacity=".22"/>`);
  }

  // --- the end wall: brick, the sluice mouth (black), the gate guides ------------------------------------------------
  const OW = 1.2, OT = 1.95; // opening half-width, top of its jambs (the flat arch rises .3 above)
  {
    const sect = [P(-HW, -0.3, ZE), ...prof.map(([x, y]) => P(x, y, ZE)), P(HW, -0.3, ZE)];
    S.add(`<path d="${pz(sect)}" fill="${B.mid}"/>`);
    // courses on the end wall, a ring of headers round the opening
    let co = '', hj = '';
    for (let y = 0.2, row = 0; y < SPR + HW; y += 0.22, row++) {
      const half = y <= SPR ? HW : Math.sqrt(Math.max(0, HW * HW - (y - SPR) ** 2));
      if (half < 0.1) continue;
      co += pl([P(-half, y, ZE), P(half, y, ZE)]);
      for (let x = -half + (row % 2) * 0.22; x < half; x += 0.44) hj += pl([P(x, y, ZE), P(x, Math.min(y + 0.22, SPR + Math.sqrt(Math.max(0, HW * HW - x * x))), ZE)]);
    }
    S.add(`<path d="${co}" stroke="${B.joint}" stroke-width="1.2" opacity=".55"/><path d="${hj}" stroke="${B.joint}" stroke-width="1" opacity=".4"/>`);
    // the lantern's warm pool on the end wall
    S.add(`<circle cx="${r0(lampS[0])}" cy="${r0(lampS[1])}" r="330" fill="${S.rad([[0, C.lamp, 0.42], [0.35, '#d08a4a', 0.16], [1, '#d08a4a', 0]])}"/>`);
    // the opening: a flat arch, black
    const arch = [P(-OW, -0.3, ZE), P(-OW, OT - 0.3, ZE)];
    for (let i = 0; i <= 10; i++) { const a = Math.PI - Math.PI * i / 10; arch.push(P(OW * Math.cos(a), OT - 0.3 + 0.3 * Math.sin(a), ZE)); }
    arch.push(P(OW, -0.3, ZE));
    S.add(`<path d="${pz(arch)}" fill="#020203"/>`);
    let vs = '';
    for (let i = 0; i <= 12; i++) { const a = Math.PI - Math.PI * i / 12; vs += pl([P(OW * Math.cos(a), OT - 0.3 + 0.3 * Math.sin(a), ZE), P((OW + 0.24) * Math.cos(a), OT - 0.3 + 0.42 * Math.sin(a) + 0.14, ZE)]); }
    S.add(`<path d="${vs}" stroke="${B.joint}" stroke-width="2.4" opacity=".8"/>`);
    // the guides: iron channels standing on the wall face either side of the mouth, up to the vault
    for (const s of [-1, 1]) {
      const x0 = s * (OW + 0.02), x1 = s * (OW + 0.2), zt = ZE - 0.02, zf = ZE - 0.16, top = 3.95;
      S.add(`<path d="${pz([P(x0, -0.3, zf), P(x1, -0.3, zf), P(x1, top, zf), P(x0, top, zf)])}" fill="${C.iron}"/>`);
      S.add(`<path d="${pz([P(s > 0 ? x0 : x1, -0.3, zt), P(s > 0 ? x0 : x1, -0.3, zf), P(s > 0 ? x0 : x1, top, zf), P(s > 0 ? x0 : x1, top, zt)])}" fill="${C.ironMid}"/>`);
      S.add(`<path d="${pl([P(x0, -0.3, zf), P(x0, top, zf)])}" stroke="${s < 0 ? C.ironLit : C.rust}" stroke-width="2" opacity=".7"/>`);
      // bolts down the channel and rust bleeding from them
      let bo = '', ru = '';
      for (let y = 0.3; y < top; y += 0.45) { const p = P((x0 + x1) / 2, y, zf); bo += `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="2.6"/>`; ru += pl([p, [p[0] + 1, p[1] + 16 + (y * 7) % 9]]); }
      S.add(`<g fill="${C.ironLit}" opacity=".6">${bo}</g><path d="${ru}" stroke="${C.rust}" stroke-width="2.4" opacity=".45"/>`);
    }
  }

  // --- the walkways either side of the channel, and the channel water --------------------------------------------
  {
    for (const s of [-1, 1]) {
      const top = pz([P(s * CH, YW, ZN), P(s * HW, YW, ZN), P(s * HW, YW, ZE), P(s * CH, YW, ZE)]);
      const face = pz([P(s * CH, -0.3, ZN), P(s * CH, YW, ZN), P(s * CH, YW, ZE), P(s * CH, -0.3, ZE)]);
      S.add(`<path d="${face}" fill="${S.lin([[0, B.deep], [1, s < 0 ? B.shade : B.mid]], 'x1="0" y1="0" x2="' + (s < 0 ? 1 : 0) + '" y2="0"')}"/>`);
      S.add(`<path d="${top}" fill="${S.lin([[0, mix(B.mid, '#6a5a4c', 0.4)], [1, B.deep]], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(P(0, YW, ZE)[1])}" x2="0" y2="${H}"`)}"/>`);
      // flagstone joints across the walkway and its lit kerb
      let j = '';
      for (let z = ZN + 0.35; z < ZE; z += 0.7) j += pl([P(s * CH, YW, z), P(s * HW, YW, z)]);
      S.add(`<path d="${j}" stroke="${B.joint}" stroke-width="1.6" opacity=".55"/><path d="${pl([P(s * CH, YW, ZN), P(s * CH, YW, ZE)])}" stroke="#a88a6a" stroke-width="2" opacity="${s < 0 ? 0.45 : 0.3}"/>`);
      // wet line on the channel wall
      S.add(`<path d="${pz([P(s * CH, -0.3, ZN), P(s * CH, 0.12, ZN), P(s * CH, 0.12, ZE), P(s * CH, -0.3, ZE)])}" fill="${C.slime}" opacity=".6"/>`);
    }
    const wq = pz([P(-CH, 0, ZN), P(CH, 0, ZN), P(CH, 0, ZE), P(-CH, 0, ZE)]);
    S.add(`<path d="${wq}" fill="${S.lin([[0, '#06090a'], [1, C.water]], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(P(0, 0, ZE)[1])}" x2="0" y2="${H}"`)}"/>`);
    // slow ripple lines on the black water, sparse and dim (no reflections)
    const Rw = rng(7703);
    let rp = '';
    for (let i = 0; i < 26; i++) {
      const z = Rw.range(1.1, ZE - 0.2), x = Rw.range(-CH + 0.15, CH - 0.5), L = Rw.range(0.25, 0.6);
      const a = P(x, 0, z), b = P(x + L, 0, z);
      rp += `M${f1(a[0])},${f1(a[1])}Q${f1((a[0] + b[0]) / 2)},${f1(a[1] - 1.5)} ${f1(b[0])},${f1(b[1])}`;
    }
    S.add(`<path d="${rp}" fill="none" stroke="${C.waterHi}" stroke-width="1.4" stroke-linecap="round" opacity=".35"/>`);
    // the lantern's warm glint on the water by the gate, broken into short dashes
    let gl = '';
    for (let i = 0; i < 7; i++) { const a = P(-1.15 + i * 0.05, 0, ZE - 0.3 - i * 0.28), L = 30 - i * 3; gl += `M${f1(a[0] - L / 2)},${f1(a[1])}h${L}`; }
    S.add(`<path d="${gl}" stroke="${C.lamp}" stroke-width="2" stroke-linecap="round" opacity=".28"/>`);
  }

  // --- the gate board (hung up / dropped), its straps, rivets and rust ---------------------------------------------
  const GZ = ZE - 0.09, GW = OW + 0.14, GH = 2.55;
  const gy0 = shut ? -0.3 : 1.32, gy1 = gy0 + GH, gv = Math.max(gy0, 0); // gv: the lowest edge above the water
  {
    S.add(`<path d="${pz([P(-GW, gv, GZ), P(GW, gv, GZ), P(GW, gy1, GZ), P(-GW, gy1, GZ)])}" fill="${S.lin([[0, C.ironMid], [0.5, '#2c2826'], [1, '#1a1716']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    // rust: blotches and streaks in a clip of the board
    const clip = S.clip(pz([P(-GW, gv, GZ), P(GW, gv, GZ), P(GW, gy1, GZ), P(-GW, gy1, GZ)]));
    const Rr = rng(7704);
    let blot = '', streak = '';
    for (let i = 0; i < 16; i++) {
      const x = Rr.range(-GW, GW), y = Rr.range(gy0 + 0.2, gy1 - 0.1), rx = Rr.range(0.05, 0.16), ry = Rr.range(0.03, 0.1);
      const pts = []; for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; pts.push(P(x + Math.cos(a) * rx * Rr.range(0.7, 1.2), y + Math.sin(a) * ry * Rr.range(0.7, 1.2), GZ)); }
      blot += pz1(pts);
    }
    for (let i = 0; i < 18; i++) { const x = Rr.range(-GW + 0.05, GW - 0.05), y = Rr.range(gy0 + 0.6, gy1), L = Rr.range(0.3, 1.1), w = Rr.range(0.015, 0.04); streak += pz1([P(x, y, GZ), P(x + w, y, GZ), P(x + w * 0.5, y - L, GZ), P(x, y - L, GZ)]); }
    S.add(`<g clip-path="${clip}"><path d="${blot}" fill="${C.rust}" opacity=".34"/><path d="${streak}" fill="${C.rust}" opacity=".3"/></g>`);
    // three horizontal straps and two vertical, rivet rows
    let strap = '', strapLit = '', riv = '';
    for (const y of [gy0 + 0.18, gy0 + GH / 2, gy1 - 0.2].filter((y) => y > gv + 0.08)) {
      strap += pz([P(-GW, y - 0.07, GZ - 0.01), P(GW, y - 0.07, GZ - 0.01), P(GW, y + 0.07, GZ - 0.01), P(-GW, y + 0.07, GZ - 0.01)]);
      strapLit += pl([P(-GW, y + 0.07, GZ - 0.01), P(GW, y + 0.07, GZ - 0.01)]);
      for (let x = -GW + 0.12; x < GW; x += 0.24) { const p = P(x, y, GZ - 0.012); riv += `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="2.2"/>`; }
    }
    for (const x of [-GW / 2, GW / 2]) strap += pz([P(x - 0.06, gv, GZ - 0.01), P(x + 0.06, gv, GZ - 0.01), P(x + 0.06, gy1, GZ - 0.01), P(x - 0.06, gy1, GZ - 0.01)]);
    S.add(`<path d="${strap}" fill="#24201e"/><path d="${strapLit}" stroke="${C.rustLit}" stroke-width="1.6" opacity=".45"/><g fill="${C.ironLit}" opacity=".7">${riv}</g>`);
    // the lantern catches the board's left edge; its bottom edge
    S.add(`<path d="${pl([P(-GW, gv, GZ), P(-GW, gy1, GZ)])}" stroke="${C.rustLit}" stroke-width="2.4" opacity=".6"/>`);
    if (!shut) {
      S.add(`<path d="${pl([P(-GW, gy0, GZ), P(GW, gy0, GZ)])}" stroke="#0c0a0a" stroke-width="5"/><path d="${pl([P(-GW, gy0 + 0.02, GZ), P(GW * 0.2, gy0 + 0.02, GZ)])}" stroke="${C.rustLit}" stroke-width="1.6" opacity=".55"/>`);
      // drops falling from the board's bottom edge into the black water
      let dr = '';
      for (const [x, y] of [[-0.8, 1.1], [-0.25, 0.75], [0.35, 1.0], [0.9, 0.45], [0.05, 0.28]]) { const p = P(x, y, GZ); dr += `<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="1.8" ry="3.6"/>`; }
      S.add(`<g fill="#c8d0cc" opacity=".55">${dr}</g>`);
      // a ring on the water where a drop lands
      const rc = P(0.05, 0, ZE - 0.35);
      S.add(`<ellipse cx="${f1(rc[0])}" cy="${f1(rc[1])}" rx="26" ry="4" fill="none" stroke="${C.waterHi}" stroke-width="1.4" opacity=".5"/><ellipse cx="${f1(rc[0])}" cy="${f1(rc[1])}" rx="12" ry="2" fill="none" stroke="${C.waterHi}" stroke-width="1.2" opacity=".6"/>`);
    } else {
      // the board sunk into the water: a dark wet line where it goes in, the water pushed up against it
      const a = P(-GW, 0.02, GZ - 0.02), b = P(GW, 0.02, GZ - 0.02);
      S.add(`<path d="${pz([P(-GW, 0, GZ), P(GW, 0, GZ), P(GW, 0.35, GZ - 0.01), P(-GW, 0.35, GZ - 0.01)])}" fill="#100c0b" opacity=".6"/><path d="M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}" stroke="${C.waterHi}" stroke-width="2" opacity=".55"/>`);
    }
    // the lifting eye on top of the board
    const e = P(0, gy1 + 0.08, GZ - 0.02);
    S.add(`<circle cx="${f1(e[0])}" cy="${f1(e[1])}" r="8" fill="none" stroke="${C.iron}" stroke-width="4"/><path d="${pz([P(-0.12, gy1, GZ - 0.02), P(0.12, gy1, GZ - 0.02), P(0.05, gy1 + 0.06, GZ - 0.02), P(-0.05, gy1 + 0.06, GZ - 0.02)])}" fill="${C.iron}"/>`);
  }

  // --- the pulley under the vault and the chain down to the winch ------------------------------------------------
  const WX = 1.74, WY = 1.22, WZ0 = ZE - 1.32, WZ1 = ZE - 0.5, DR = 0.17, CR = 0.36; // winch on the right walkway
  const pul = [0.42, 3.92, ZE - 0.3], pulS = P(...pul);
  {
    // the pulley block hung from a bracket in the vault
    const br = P(0.42, SPR + Math.sqrt(HW * HW - 0.42 * 0.42) - 0.02, ZE - 0.3);
    S.add(`<path d="M${f1(br[0])},${f1(br[1])}L${f1(pulS[0])},${f1(pulS[1] - 12)}" stroke="${C.iron}" stroke-width="5"/><circle cx="${f1(pulS[0])}" cy="${f1(pulS[1])}" r="15" fill="${C.ironMid}" stroke="${C.iron}" stroke-width="4"/><circle cx="${f1(pulS[0])}" cy="${f1(pulS[1])}" r="4" fill="${C.ironLit}"/>`);
    // the chain: links along a polyline (taut when the gate is up, slack when it is down)
    const eye = P(0, gy1 + 0.16, GZ - 0.02);
    const drumTop = P(WX - 0.05, WY + DR, (WZ0 + WZ1) / 2);
    const chainPts = [];
    const seg = (a, b, n, sag = 0) => { for (let i = 0; i <= n; i++) { const t = i / n; chainPts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + sag * Math.sin(Math.PI * t)]); } };
    const pl0 = [pulS[0] - 14, pulS[1]], pr0 = [pulS[0] + 13, pulS[1] + 4];
    if (!shut) { seg(eye, pl0, 18); chainPts.push(null); seg(pr0, drumTop, 26); }
    else { seg(eye, pl0, 22, 34); chainPts.push(null); seg(pr0, drumTop, 34, 120); }
    // links alternate: an open oval in the chain's direction, then a short bar (the link seen edge-on)
    let links = '', bars = '';
    for (let i = 1; i < chainPts.length; i++) {
      const a = chainPts[i - 1], b = chainPts[i];
      if (!a || !b) continue;
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (i % 2) links += `<ellipse cx="${f1(mx)}" cy="${f1(my)}" rx="${f1(L * 0.62)}" ry="3.2" transform="rotate(${f1(ang)} ${f1(mx)} ${f1(my)})"/>`;
      else bars += `M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}`;
    }
    S.add(`<g fill="none" stroke="${C.iron}" stroke-width="3.2">${links}</g><path d="${bars}" stroke="${C.iron}" stroke-width="3.6"/><g fill="none" stroke="${C.rustLit}" stroke-width="1.1" opacity=".5" transform="translate(-1 -1)">${links}</g>`);
  }

  // --- the wooden winch on the right walkway: two A-posts, the drum, the cog wheel facing us, the crank ---------------
  {
    const w = C.wood;
    let posts = '', postsLit = '';
    for (const z of [WZ0 + 0.06, WZ1]) {
      for (const dx of [-0.2, 0.2]) {
        const foot = P(WX + dx * 1.3, YW, z), top = P(WX, WY + 0.12, z);
        posts += pz([[foot[0] - 7, foot[1]], [foot[0] + 7, foot[1]], [top[0] + 6, top[1]], [top[0] - 6, top[1]]]);
        postsLit += pl([[foot[0] - 7, foot[1]], [top[0] - 6, top[1]]]);
      }
      const a = P(WX - 0.22, YW + 0.45, z), b = P(WX + 0.22, YW + 0.45, z);
      posts += pz([[a[0], a[1] - 4], [b[0], b[1] - 4], [b[0], b[1] + 4], [a[0], a[1] + 4]]);
    }
    S.add(`<path d="${posts}" fill="${w.mid}"/><path d="${postsLit}" stroke="${w.lit}" stroke-width="2" opacity=".55"/>`);
    // the drum: a cylinder along z, chain wound on it
    const d0 = P(WX, WY, WZ0), d1 = P(WX, WY, WZ1), r0s = DR * F / WZ0, r1s = DR * F / WZ1;
    S.add(`<path d="M${f1(d0[0])},${f1(d0[1] - r0s)}L${f1(d1[0])},${f1(d1[1] - r1s)}L${f1(d1[0])},${f1(d1[1] + r1s)}L${f1(d0[0])},${f1(d0[1] + r0s)}Z" fill="${w.shade}"/>`);
    let wind = '';
    for (let i = 1; i < 9; i++) { const z = WZ0 + (WZ1 - WZ0) * i / 9, c = P(WX, WY, z), rr = DR * F / z; wind += `M${f1(c[0] - rr * 0.3)},${f1(c[1] - rr)}Q${f1(c[0] + rr * 0.6)},${f1(c[1])} ${f1(c[0] - rr * 0.3)},${f1(c[1] + rr)}`; }
    S.add(`<path d="${wind}" fill="none" stroke="${C.iron}" stroke-width="3" opacity="${shut ? 0.5 : 0.9}"/>`);
    // cog wheel at the near end of the drum, square to us
    const cz = WZ0 - 0.04, c = P(WX, WY, cz), R1 = CR * F / cz, R0 = R1 * 0.82, N = 16;
    const cog = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2, da = Math.PI / N;
      cog.push([c[0] + R0 * Math.cos(a - da * 0.55), c[1] + R0 * Math.sin(a - da * 0.55)], [c[0] + R1 * Math.cos(a - da * 0.32), c[1] + R1 * Math.sin(a - da * 0.32)], [c[0] + R1 * Math.cos(a + da * 0.32), c[1] + R1 * Math.sin(a + da * 0.32)], [c[0] + R0 * Math.cos(a + da * 0.55), c[1] + R0 * Math.sin(a + da * 0.55)]);
    }
    S.add(`<path d="${pz1(cog)}" fill="${w.mid}" stroke="${w.deep}" stroke-width="2"/>`);
    S.add(`<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(R0 * 0.78)}" fill="${w.shade}"/><path d="M${f1(c[0] - R0 * 0.75)},${f1(c[1])}H${f1(c[0] + R0 * 0.75)}M${f1(c[0])},${f1(c[1] - R0 * 0.75)}V${f1(c[1] + R0 * 0.75)}" stroke="${w.mid}" stroke-width="8"/>`);
    S.add(`<path d="M${f1(c[0] - R1 * 0.7)},${f1(c[1] - R1 * 0.7)}A${f1(R1)},${f1(R1)} 0 0 1 ${f1(c[0] + R1 * 0.2)},${f1(c[1] - R1 * 0.98)}" fill="none" stroke="${w.lit}" stroke-width="3" opacity=".75"/>`);
    // iron hub, the crank arm and handle
    S.add(`<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="9" fill="${C.iron}"/><path d="M${f1(c[0])},${f1(c[1])}l38,40" stroke="${C.iron}" stroke-width="8" stroke-linecap="round"/><path d="M${f1(c[0] + 38)},${f1(c[1] + 40)}l-6,26" stroke="${w.mid}" stroke-width="11" stroke-linecap="round"/><path d="M${f1(c[0])},${f1(c[1])}l38,40" stroke="${C.ironLit}" stroke-width="2" opacity=".5" transform="translate(-2 -2)"/>`);
    // the pawl bar resting on the teeth from the post
    const tooth = (k) => { const a = (k / N) * Math.PI * 2; return [c[0] + R1 * Math.cos(a), c[1] + R1 * Math.sin(a)]; };
    const tA = tooth(11.5); // between two teeth at the upper left
    if (!shut) {
      // the wooden wedge jammed into the gap between two teeth, sticking out
      const ang = Math.atan2(tA[1] - c[1], tA[0] - c[0]), ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux;
      const tip = [tA[0] - ux * 10, tA[1] - uy * 10], out = [tA[0] + ux * 30, tA[1] + uy * 30];
      S.add(`<path d="${pz1([tip, [out[0] + vx * 9, out[1] + vy * 9], [out[0] - vx * 9, out[1] - vy * 9]])}" fill="${w.lit}" stroke="${w.deep}" stroke-width="1.6"/><path d="${pl1([[tip[0] + ux * 6, tip[1] + uy * 6], [out[0] - vx * 4, out[1] - vy * 4]])}" stroke="${w.shade}" stroke-width="1.2" opacity=".7"/>`);
    } else {
      // the bent rod jammed between the teeth instead: a short metal stick kinked in two places, a brass band, a cap
      const ang = Math.atan2(tA[1] - c[1], tA[0] - c[0]), ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux;
      const p0 = [tA[0] - ux * 12, tA[1] - uy * 12], p1 = [tA[0] + ux * 16, tA[1] + uy * 16], p2 = [p1[0] + ux * 14 + vx * 12, p1[1] + uy * 14 + vy * 12], p3 = [p2[0] + ux * 4 + vx * 22, p2[1] + uy * 4 + vy * 22];
      S.add(`<path d="${pl1([p0, p1, p2, p3])}" fill="none" stroke="#2a2e32" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="${pl1([p0, p1, p2, p3])}" fill="none" stroke="${C.rod}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="${pl1([p1, p2])}" stroke="${C.rodLit}" stroke-width="1.6" opacity=".8" transform="translate(-1 -1)"/>`);
      S.add(`<path d="${pl1([[p1[0] + vx * 4, p1[1] + vy * 4], [p1[0] - vx * 4, p1[1] - vy * 4]])}" stroke="${C.brass}" stroke-width="5"/><circle cx="${f1(p3[0])}" cy="${f1(p3[1])}" r="4.5" fill="${C.brass}"/><circle cx="${f1(p3[0] - 1)}" cy="${f1(p3[1] - 1)}" r="1.6" fill="#fff2c4"/>`);
      // the wedge split in two, lying on the walkway in front of the winch
      const a = P(1.62, YW, WZ0 - 0.55), b = P(1.88, YW, WZ0 - 0.42);
      S.add(`<path d="${pz1([[a[0] - 26, a[1] + 2], [a[0] + 14, a[1] - 3], [a[0] + 10, a[1] + 6]])}" fill="${w.lit}" stroke="${w.deep}" stroke-width="1.4"/><path d="${pz1([[b[0] - 6, b[1] - 6], [b[0] + 24, b[1] - 2], [b[0] - 2, b[1] + 4]])}" fill="${w.mid}" stroke="${w.deep}" stroke-width="1.4"/><path d="M${f1(a[0] - 22)},${f1(a[1] + 1)}l30,-2" stroke="#e8c898" stroke-width="1.2" opacity=".6"/>`);
    }
  }

  // --- the lantern on its bracket beside the gate, grubs crawling on the shade -----------------------------------------
  {
    const [lx, ly] = lampS, k = F / LAMP[2] * 1.7; // ≈ 112 px per metre, the lantern drawn a little large so it reads
    const wall = P(-1.72, 2.5, ZE);
    S.add(`<path d="M${f1(wall[0])},${f1(wall[1])}h${f1(-0.0)}l0,-2M${f1(wall[0] - 18)},${f1(wall[1] - 2)}L${f1(lx)},${f1(wall[1] - 2)}L${f1(lx)},${f1(ly - 0.24 * k)}" fill="none" stroke="${C.iron}" stroke-width="4"/>`);
    // glow
    S.add(`<circle cx="${f1(lx)}" cy="${f1(ly)}" r="120" fill="${S.rad([[0, C.lampHot, 0.6], [0.25, C.lamp, 0.3], [1, C.lamp, 0]])}"/>`);
    // body: a cap, the glass shade (a fat cylinder seen square on), a base, the handle ring
    const sw = 0.13 * k, sh = 0.2 * k, cap = ly - sh / 2;
    S.add(`<path d="M${f1(lx - sw * 0.6)},${f1(cap)}L${f1(lx - sw * 0.25)},${f1(cap - 12)}H${f1(lx + sw * 0.25)}L${f1(lx + sw * 0.6)},${f1(cap)}Z" fill="${C.iron}"/><circle cx="${f1(lx)}" cy="${f1(cap - 18)}" r="6" fill="none" stroke="${C.iron}" stroke-width="3"/>`);
    S.add(`<rect x="${f1(lx - sw / 2)}" y="${f1(cap)}" width="${f1(sw)}" height="${f1(sh)}" rx="5" fill="${S.lin([[0, '#ffe6a8'], [0.5, C.lamp], [1, '#c87a3a']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    S.add(`<ellipse cx="${f1(lx)}" cy="${f1(ly + 2)}" rx="${f1(sw * 0.16)}" ry="${f1(sh * 0.22)}" fill="${C.lampHot}"/>`);
    S.add(`<path d="M${f1(lx - sw / 2)},${f1(cap + 2)}V${f1(cap + sh - 2)}M${f1(lx + sw / 2)},${f1(cap + 2)}V${f1(cap + sh - 2)}" stroke="${C.iron}" stroke-width="3"/><path d="M${f1(lx - sw * 0.6)},${f1(cap + sh)}h${f1(sw * 1.2)}v6h${f1(-sw * 1.2)}z" fill="${C.iron}"/>`);
    // grubs: thumb-sized white segmented bodies crawling up the glass toward the flame
    let gr = '', seg = '';
    for (const [dx, dy, a] of [[-0.32, 0.3, -70], [0.18, 0.12, -100], [-0.05, -0.28, -85], [0.34, -0.1, -60], [-0.38, -0.12, -110]]) {
      const x = lx + dx * sw, y = ly + dy * sh;
      gr += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="6.4" ry="2.8" transform="rotate(${a} ${f1(x)} ${f1(y)})"/>`;
      const rad = a * Math.PI / 180, cx = Math.cos(rad), cy = Math.sin(rad);
      for (const t of [-3, 0, 3]) seg += `M${f1(x + cx * t - cy * 2.8)},${f1(y + cy * t + cx * 2.8)}l${f1(cy * 5.6)},${f1(-cx * 5.6)}`;
    }
    S.add(`<g fill="${C.grub}">${gr}</g><path d="${seg}" stroke="#9a9c90" stroke-width=".9" opacity=".8"/>`);
    // two more on the bracket, on their way
    S.add(`<g fill="${C.grub}" opacity=".8"><ellipse cx="${f1(lx + 30)}" cy="${f1(ly + 44)}" rx="5.5" ry="2.4" transform="rotate(-75 ${f1(lx + 30)} ${f1(ly + 44)})"/><ellipse cx="${f1(lx + 44)}" cy="${f1(ly + 82)}" rx="5" ry="2.2" transform="rotate(-95 ${f1(lx + 44)} ${f1(ly + 82)})"/></g>`);
  }

  // --- grading: the near culvert falls into dark, the bottom quiet under the dialogue box --------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.35, '#040202', 0], [1, '#040202', 0.72]], `gradientUnits="userSpaceOnUse" cx="${r0(lampS[0] + 120)}" cy="${r0(lampS[1] + 60)}" r="900"`)}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#050404', 0], [1, '#050404', 0.7]])}"/>`);
  return S.out();
}

// =============================================================================================
// the tide cave: the cocoon wall and the stone door
// =============================================================================================
const CV = {
  rock: { lit: '#7a8684', mid: '#4a5654', shade: '#2c3434', deep: '#151b1c' },
  ashlar: { lit: '#848a82', mid: '#565c56', shade: '#343a36', joint: '#121616' },
  ceil: [[0, '#030506'], [1, '#121a1c']],
  water: '#0e1a1e', waterFar: '#081012', waterHi: '#6a8484', wet: '#0c1414',
  silk: '#e4e8e0', silkShade: '#8e9894', silkDeep: '#5c6662', inner: '#4a5450',
  iron: '#16191a', ironLit: '#6a7270',
  tag: '#9a8262', tagShade: '#5a4a38', ink: '#1a1410',
  door: { lit: '#6e746c', mid: '#4a504a', shade: '#2c302c' },
};

function tideCave(flood, empty = false) {
  const S = new Scene(flood ? 'sbTideCaveFlood' : empty ? 'sbTideCaveEmpty' : 'sbTideCave', empty
    ? '雾港·潮穴·退潮：同一个水洞，水退了，左边墙上的白色长茧都不在了，只剩一排一排空着的铁钩；墙尽头三个空铁钩上垂着小木牌；最里面两开的石门合着，门缝是湿的；只有左下一点冷白的光'
    : flood
    ? '雾港·潮穴·涨水：同一个水洞，水涨到齐腰高，水面起着波纹；最里面的两扇石门被水推开了一半，门后一片黑；墙上的铁钩大多空了，只剩三个白色长茧还挂着；墙尽头三个空铁钩上垂着小木牌；冷白的一点光从左下照进来'
    : '雾港·潮穴·茧壁：天然岩洞与旧石砌混在一起的水洞，左边的墙上一排一排挂着比人还长的白色长茧，半透明，隐约看得出人形，看不清脸；最低的一排离水面一个手掌；墙尽头三个空铁钩，钩上垂着小木牌；最里面一扇两开的石门，门缝在渗水；水面是平的；只有左下一点冷白的光', flood ? 7712 : 7711);
  const C = CV;
  const VP = [800, 392], F = 700, EYE = 1.3;
  const pr = persp({ vp: VP, F, eye: EYE });
  const P = (x, y, z) => pr(x, y, z);
  const WL = flood ? 1.0 : 0; // water level
  const LIGHT = [-1.5, 1.1, 0.9]; // 亚克's palm, just out of frame at the lower left
  const lk = (x, y, z) => { const d = Math.hypot(x - LIGHT[0], y - LIGHT[1], z - LIGHT[2]); return 1 / (1 + (d / 4.2) ** 2.4); };
  const tone = (pal, t) => (t > 0.55 ? mix(pal.mid, pal.lit, Math.min(1, (t - 0.55) / 0.45)) : t > 0.25 ? mix(pal.shade, pal.mid, (t - 0.25) / 0.3) : mix(pal.deep || pal.shade, pal.shade, t / 0.25));
  // plan: the cocoon wall runs A→B (left, receding), the back wall B→C carries the door, the right rock wall C→E
  const A = [-6.4, 3.4], B = [-0.8, 8.7], Cc = [3.6, 9.2], E = [7.2, 3.6];
  const LAB = Math.hypot(B[0] - A[0], B[1] - A[1]), u = [(B[0] - A[0]) / LAB, (B[1] - A[1]) / LAB], n = [u[1], -u[0]]; // n points into the cave
  const onAB = (s, y, d = 0) => [A[0] + u[0] * s + n[0] * d, y, A[1] + u[1] * s + n[1] * d];
  const LBC = Math.hypot(Cc[0] - B[0], Cc[1] - B[1]), v = [(Cc[0] - B[0]) / LBC, (Cc[1] - B[1]) / LBC], m = [v[1], -v[0]];
  const onBC = (s, y, d = 0) => [B[0] + v[0] * s + m[0] * d, y, B[1] + v[1] * s + m[1] * d];
  const topN = fbm(7713, 1.2, 3);

  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(C.ceil, `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${VP[1]}"`)}"/>`);
  // --- the rock vault overhead: low lumps hanging down, barely lit ---------------------------------------------------
  {
    const R = rng(7714);
    let d = '', lit = '';
    for (let i = 0; i < 26; i++) {
      const x = R.range(-4, 6), z = R.range(4.5, 10.5), y = R.range(5.2, 6.0), rx = R.range(0.5, 1.4), ry = R.range(0.25, 0.6);
      const pts = []; for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; pts.push(P(x + Math.cos(a) * rx * R.range(0.8, 1.15), y + Math.sin(a) * ry * R.range(0.8, 1.15), z)); }
      d += pz(pts);
      const lo = P(x - rx * 0.3, y - ry * 0.85, z), lo2 = P(x + rx * 0.4, y - ry * 0.9, z);
      lit += pl([lo, lo2]);
    }
    S.add(`<path d="${d}" fill="#0e1517" opacity=".55"/><path d="${lit}" stroke="#1e2a2c" stroke-width="2" opacity=".5"/>`);
  }

  // --- the back wall with the stone door ---------------------------------------------------------------------------
  const DS = 2.0, DW = 0.92, DH = 2.95, DB = -0.6; // door centre along B→C, half-width, top, bottom (sunk under the water)
  {
    const top = [], base = [];
    for (let i = 0; i <= 20; i++) { const s = LBC * i / 20; top.push(P(...onBC(s, 5.0 + 0.5 * topN(s)))); base.push(P(...onBC(s, WL - 0.02))); }
    const t = lk(...onBC(LBC / 2, 2, 0));
    for (let i = 0; i < 20; i++) {
      const tt = lk(...onBC(LBC * (i + 0.5) / 20, 2, 0));
      const q = pz([base[i], top[i], top[i + 1], base[i + 1]]);
      S.add(`<path d="${q}" fill="${tone(C.ashlar, tt)}" stroke="${tone(C.ashlar, tt)}" stroke-width="1"/>`);
    }
    // the rock face above the masonry
    S.add(`<path d="${pz([...top, ...Array.from({ length: 21 }, (_, i) => P(...onBC(LBC * (20 - i) / 20, 3.95 + 0.15 * topN(70 + i))))])}" fill="${tone(C.rock, t * 0.85)}" opacity=".9"/>`);
    // old ashlar round the door, rough rock above and to the sides
    let co = '', hj = '';
    for (let y = 0.4, row = 0; y < 3.9; y += 0.55, row++) {
      const s0 = 0.4, s1 = LBC - 0.3;
      co += pl([P(...onBC(s0, y)), P(...onBC(s1, y))]);
      for (let s = s0 + (row % 2) * 0.45; s < s1; s += 0.9) { if (Math.abs(s - DS) < DW + 0.25 && y < DH + 0.2) continue; hj += pl([P(...onBC(s, y)), P(...onBC(s, Math.min(3.9, y + 0.55)))]); }
    }
    S.add(`<path d="${co}" stroke="${C.ashlar.joint}" stroke-width="1.8" opacity=".6"/><path d="${hj}" stroke="${C.ashlar.joint}" stroke-width="1.6" opacity=".5"/>`);
    // the door's frame: jambs and a heavy lintel, a little proud of the wall
    const fr = 0.22;
    S.add(`<path d="${pz([P(...onBC(DS - DW - fr, DB)), P(...onBC(DS - DW - fr, DH + 0.42, 0.05)), P(...onBC(DS + DW + fr, DH + 0.42, 0.05)), P(...onBC(DS + DW + fr, DB))])}" fill="${tone(C.door, t * 1.05)}"/>`);
    S.add(`<path d="${pl([P(...onBC(DS - DW - fr, DH + 0.42, 0.05)), P(...onBC(DS + DW + fr, DH + 0.42, 0.05))])}" stroke="#a8b0a4" stroke-width="2" opacity=".45"/><path d="${pl([P(...onBC(DS - DW - fr, DH + 0.1)), P(...onBC(DS + DW + fr, DH + 0.1))])}" stroke="${C.ashlar.joint}" stroke-width="2" opacity=".6"/>`);
    // the opening behind the leaves: black
    S.add(`<path d="${pz([P(...onBC(DS - DW, DB)), P(...onBC(DS - DW, DH)), P(...onBC(DS + DW, DH)), P(...onBC(DS + DW, DB))])}" fill="#010203"/>`);
    // the leaves: shut (meeting at the seam) or pushed half open, swung inward about their hinges
    const leaf = (side, ang) => {
      // side -1 = left leaf hinged at DS-DW, +1 = right leaf hinged at DS+DW; ang = how far it swung in (radians)
      const hinge = DS + side * DW, L = DW - 0.01;
      const tip = (y) => { const s = hinge - side * L * Math.cos(ang); const dd = -L * Math.sin(ang); return P(...onBC(s, y, dd)); };
      const pts = [P(...onBC(hinge, DB)), P(...onBC(hinge, DH)), tip(DH), tip(DB)];
      return { d: pz(pts), tipTop: tip(DH), tipBot: tip(DB) };
    };
    const ang = flood ? 0.8 : 0;
    const Lf = leaf(-1, ang), Rf = leaf(1, ang);
    const leafCol = tone(C.door, t * (flood ? 0.75 : 0.95));
    S.add(`<path d="${Lf.d}" fill="${leafCol}"/><path d="${Rf.d}" fill="${mix(leafCol, '#000000', 0.18)}"/>`);
    // carved panels on each leaf (only legible while shut)
    if (!flood) {
      let pn = '';
      for (const side of [-1, 1]) {
        const s0 = DS + side * 0.12, s1 = DS + side * (DW - 0.14);
        pn += pz([P(...onBC(Math.min(s0, s1), 0.5)), P(...onBC(Math.max(s0, s1), 0.5)), P(...onBC(Math.max(s0, s1), DH - 0.25)), P(...onBC(Math.min(s0, s1), DH - 0.25))]);
      }
      S.add(`<path d="${pn}" fill="none" stroke="${C.ashlar.joint}" stroke-width="2.4" opacity=".55"/><path d="${pn}" fill="none" stroke="#9aa298" stroke-width="1" opacity=".3" transform="translate(-1.5 -1.5)"/>`);
      // the seam, and the water seeping from it: wet dark streaks down the leaves, a few bright beads
      const sa = P(...onBC(DS, DH)), sb = P(...onBC(DS, WL));
      S.add(`<path d="M${f1(sa[0])},${f1(sa[1])}L${f1(sb[0])},${f1(sb[1])}" stroke="#020303" stroke-width="3"/>`);
      const Rw = rng(7715);
      let wet = '', bead = '';
      for (let i = 0; i < 9; i++) {
        const y0 = Rw.range(0.6, DH - 0.2), s = DS + Rw.range(-0.07, 0.07), y1 = WL;
        const a = P(...onBC(s - 0.04, y0)), b = P(...onBC(s + 0.05, y0)), c1 = P(...onBC(s + Rw.range(-0.12, 0.12), y1));
        wet += `M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}L${f1(c1[0] + 3)},${f1(c1[1])}L${f1(c1[0] - 3)},${f1(c1[1])}Z`;
        const bp = P(...onBC(s, Rw.range(0.15, y0)));
        bead += `<ellipse cx="${f1(bp[0])}" cy="${f1(bp[1])}" rx="1.4" ry="2.4"/>`;
      }
      // seepage along the sill and the jambs too
      for (const s of [DS - DW, DS + DW]) { const a = P(...onBC(s, DH - 0.3)), b = P(...onBC(s, WL)); wet += `M${f1(a[0] - 2)},${f1(a[1])}L${f1(a[0] + 2)},${f1(a[1])}L${f1(b[0] + 3)},${f1(b[1])}L${f1(b[0] - 3)},${f1(b[1])}Z`; }
      S.add(`<path d="${wet}" fill="${C.wet}" opacity=".7"/><g fill="#d8e6e4" opacity=".7">${bead}</g>`);
    } else {
      // the leaves' edges catch a little light; the black gap between them
      S.add(`<path d="M${f1(Lf.tipTop[0])},${f1(Lf.tipTop[1])}L${f1(Lf.tipBot[0])},${f1(Lf.tipBot[1])}M${f1(Rf.tipTop[0])},${f1(Rf.tipTop[1])}L${f1(Rf.tipBot[0])},${f1(Rf.tipBot[1])}" stroke="#8a948c" stroke-width="2" opacity=".55"/>`);
    }
    // rough rock courses above (cracks)
    const Rk = rng(7716);
    let ck = '';
    for (let i = 0; i < 9; i++) { const s = Rk.range(0.3, LBC - 0.3), y = Rk.range(3.9, 4.9); ck += pl([P(...onBC(s, y)), P(...onBC(s + Rk.range(-0.4, 0.4), y - Rk.range(0.3, 0.7))), P(...onBC(s + Rk.range(-0.5, 0.5), y - Rk.range(0.7, 1.1)))]); }
    S.add(`<path d="${ck}" fill="none" stroke="${C.rock.deep}" stroke-width="1.8" opacity=".7"/>`);
  }

  // the inside corner where the cocoon wall meets the back wall: a soft dark seam
  {
    const a = P(B[0], 5.4, B[1]), b = P(B[0], WL, B[1]);
    S.add(`<path d="M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}" stroke="#050808" stroke-width="7" opacity=".6"/>`);
  }
  // --- the right rock wall, from the back corner toward us -----------------------------------------------------------
  {
    const R = rng(7717), N = 14;
    const pts = Array.from({ length: N + 1 }, (_, i) => { const t = i / N; return [Cc[0] + (E[0] - Cc[0]) * t + Math.sin(t * 7) * 0.35, Cc[1] + (E[1] - Cc[1]) * t]; });
    for (let i = 0; i < N; i++) {
      const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
      const yt0 = 5.0 + 0.6 * topN(20 + i), yt1 = 5.0 + 0.6 * topN(21 + i);
      const t = lk((x0 + x1) / 2, 2, (z0 + z1) / 2) * (0.75 + 0.3 * topN(60 + i * 0.7));
      S.add(`<path d="${pz([P(x0, WL - 0.02, z0), P(x0, yt0, z0), P(x1, yt1, z1), P(x1, WL - 0.02, z1)])}" fill="${tone(C.rock, t)}" stroke="${tone(C.rock, t)}" stroke-width="1"/>`);
    }
    // ledges and cracks in the rock
    let ck = '', lit = '';
    for (let i = 0; i < 14; i++) {
      const k = R.range(0.05, 0.9), j = Math.floor(k * N), p = pts[j], y = R.range(0.6, 4.6);
      const a = P(p[0], y, p[1]), b = P(pts[j + 1][0], y + R.range(-0.3, 0.3), pts[j + 1][1]);
      ck += pl([a, b, [b[0] + R.range(-10, 10), b[1] + R.range(10, 30)]]);
      lit += pl([[a[0], a[1] - 2], [b[0], b[1] - 2]]);
    }
    S.add(`<path d="${ck}" fill="none" stroke="${C.rock.deep}" stroke-width="2.2" opacity=".75"/><path d="${lit}" stroke="#7a8886" stroke-width="1.3" opacity=".25"/>`);
    // broken facets of rock: irregular plates, some catching a little light, some in shadow
    let fa = '', fs = '';
    for (let i = 0; i < 22; i++) {
      const tt = R.range(0.02, 0.95), y = R.range(0.6, 4.8), sz = R.range(0.35, 0.9);
      const j = Math.min(N - 1, Math.floor(tt * N)), p0 = pts[j], p1 = pts[j + 1], fr = tt * N - j;
      const cx = p0[0] + (p1[0] - p0[0]) * fr, cz = p0[1] + (p1[1] - p0[1]) * fr, ux = (p1[0] - p0[0]), uz = (p1[1] - p0[1]), ul = Math.hypot(ux, uz);
      const poly = [];
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + R.range(-0.3, 0.3), rr = sz * R.range(0.6, 1.1); poly.push(P(cx + ux / ul * Math.cos(a) * rr, y + Math.sin(a) * rr * 0.6, cz + uz / ul * Math.cos(a) * rr)); }
      if (R() < 0.5) fa += pz(poly); else fs += pz(poly);
    }
    S.add(`<path d="${fa}" fill="#6a7a78" opacity=".09"/><path d="${fs}" fill="${C.rock.deep}" opacity=".35"/>`);
  }

  // --- an old masonry ledge along the foot of the right wall, back to the door (under water in the flood) -------------
  {
    const N = 10, LY = 0.32, Wd = 0.85;
    const wallAt = (t) => [Cc[0] + (E[0] - Cc[0]) * t + Math.sin(t * 7) * 0.35, Cc[1] + (E[1] - Cc[1]) * t];
    const inner = (t) => { const [x, z] = wallAt(t); return [x - Wd, z]; };
    // the stretch in front of the door's right jamb, then down the right wall
    let top = '', face = '', kerb = [], joints = '';
    for (let i = 0; i < N; i++) {
      const t0 = i / N, t1 = (i + 1) / N, [x0, z0] = wallAt(t0), [x1, z1] = wallAt(t1), [ix0, iz0] = inner(t0), [ix1, iz1] = inner(t1);
      const tt = lk((ix0 + ix1) / 2, LY, (iz0 + iz1) / 2);
      S.add(`<path d="${pz([P(ix0, LY, iz0), P(x0, LY, z0), P(x1, LY, z1), P(ix1, LY, iz1)])}" fill="${tone(C.ashlar, tt * 0.9)}" stroke="${tone(C.ashlar, tt * 0.9)}" stroke-width="1"/>`);
      S.add(`<path d="${pz([P(ix0, -0.4, iz0), P(ix0, LY, iz0), P(ix1, LY, iz1), P(ix1, -0.4, iz1)])}" fill="${tone(C.ashlar, tt * 0.6)}" stroke="${tone(C.ashlar, tt * 0.6)}" stroke-width="1"/>`);
      kerb.push(P(ix0, LY, iz0));
      joints += pl([P(ix0, LY, iz0), P(ix0, -0.1, iz0)]) + pl([P(ix0, LY, iz0), P(x0, LY, z0)]);
      if (i === N - 1) kerb.push(P(ix1, LY, iz1));
    }
    S.add(`<path d="${joints}" stroke="${C.ashlar.joint}" stroke-width="1.6" opacity=".55"/><path d="${pl(kerb)}" fill="none" stroke="#9aa49c" stroke-width="1.8" opacity=".35"/>`);
    // an iron mooring ring on the ledge's face
    const rc = P(...inner(0.45).flatMap((v, k) => (k ? [0.05, v] : [v]))), rr = 0.12 * F / inner(0.45)[1];
    S.add(`<ellipse cx="${f1(rc[0])}" cy="${f1(rc[1])}" rx="${f1(rr * 0.6)}" ry="${f1(rr)}" fill="none" stroke="${C.iron}" stroke-width="3"/>`);
  }

  // --- the cocoon wall (left): ashlar low down, raw rock above, the hooks --------------------------------------------
  const SLOTS_LO = [0.9, 1.75, 2.6, 3.45, 4.3, 5.15], SLOTS_HI = [1.3, 2.15, 3.0, 3.85, 4.7, 5.55];
  const LO = { hook: 2.32, top: 2.18, bot: 0.12 }, HI = { hook: 4.72, top: 4.58, bot: 2.5 };
  const EMPTY = [6.35, 6.95, 7.5]; // the three empty hooks at the wall's end, nearest the door
  {
    const N = 24;
    for (let i = 0; i < N; i++) {
      const s0 = (LAB + 0.6) * i / N - 0.6, s1 = (LAB + 0.6) * (i + 1) / N - 0.6;
      const yt0 = 5.6 + 0.5 * topN(40 + s0), yt1 = 5.6 + 0.5 * topN(40 + s1);
      const t = lk(...onAB((s0 + s1) / 2, 2));
      S.add(`<path d="${pz([P(...onAB(s0, WL - 0.02)), P(...onAB(s0, 2.9)), P(...onAB(s1, 2.9)), P(...onAB(s1, WL - 0.02))])}" fill="${tone(C.ashlar, t)}" stroke="${tone(C.ashlar, t)}" stroke-width="1"/>`);
      S.add(`<path d="${pz([P(...onAB(s0, 2.9)), P(...onAB(s0, yt0)), P(...onAB(s1, yt1)), P(...onAB(s1, 2.9))])}" fill="${tone(C.rock, t * 0.92)}" stroke="${tone(C.rock, t * 0.92)}" stroke-width="1"/>`);
    }
    let co = '', hj = '';
    for (let y = 0.5, row = 0; y < 2.95; y += 0.6, row++) {
      co += pl([P(...onAB(-0.6, y)), P(...onAB(LAB, y))]);
      for (let s = -0.6 + (row % 2) * 0.5; s < LAB; s += 1.0) hj += pl([P(...onAB(s, y)), P(...onAB(s, Math.min(2.9, y + 0.6)))]);
    }
    // where the masonry gives out: a ragged top edge to the ashlar
    const Rj = rng(7718);
    let rag = '';
    for (let s = -0.6; s < LAB; s += 0.5) rag += pl([P(...onAB(s, 2.9 + Rj.range(-0.1, 0.12))), P(...onAB(s + 0.5, 2.9 + Rj.range(-0.1, 0.12)))]);
    S.add(`<path d="${co}" stroke="${C.ashlar.joint}" stroke-width="1.8" opacity=".55"/><path d="${hj}" stroke="${C.ashlar.joint}" stroke-width="1.5" opacity=".45"/><path d="${rag}" stroke="${C.rock.deep}" stroke-width="3" opacity=".7"/>`);
    // the old high-water stain on the masonry, and the fresh wet band now that the water is up
    const band = (y0, y1) => pz([P(...onAB(-0.6, y0)), P(...onAB(LAB, y0)), P(...onAB(LAB, y1)), P(...onAB(-0.6, y1))]);
    S.add(`<path d="${band(WL, WL + 0.55)}" fill="${C.wet}" opacity=".5"/><path d="${band(1.55, 1.6)}" fill="#a4aca0" opacity=".14"/>`);
  }

  // --- the water ----------------------------------------------------------------------------------------------------
  {
    // its far edge is the foot of the walls: left wall A→B, back wall B→C, right wall C→E; then down to the frame bottom
    const edge = [];
    for (let i = 0; i <= 16; i++) edge.push(P(...onAB(-0.6 + (LAB + 0.6) * i / 16, WL)));
    for (let i = 1; i <= 8; i++) edge.push(P(...onBC(LBC * i / 8, WL)));
    for (let i = 1; i <= 14; i++) { const t = i / 14; edge.push(P(Cc[0] + (E[0] - Cc[0]) * t + Math.sin(t * 7) * 0.35, WL, Cc[1] + (E[1] - Cc[1]) * t)); }
    const clipX = (p) => [Math.max(-40, Math.min(W + 40, p[0])), p[1]];
    const poly = edge.map(clipX);
    poly.push([W + 40, H + 10], [-40, H + 10]);
    const yFar = P(0, WL, 9.5)[1];
    S.add(`<path d="${pz(poly)}" fill="${S.lin([[0, C.waterFar], [1, C.water]], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(yFar)}" x2="0" y2="${H}"`)}"/>`);
    // the light from the lower left laid on the water as a dim cold sheen
    S.add(`<ellipse cx="160" cy="${r0(H - 40)}" rx="760" ry="260" fill="${S.rad([[0, '#9cb4b4', 0.18], [1, '#9cb4b4', 0]])}"/>`);
    // a pale wet line where the water meets the walls
    S.add(`<path d="${pl(edge.map(clipX))}" fill="none" stroke="${C.waterHi}" stroke-width="1.6" opacity=".45"/>`);
    const Rw = rng(flood ? 7720 : 7719);
    let rp = '';
    if (!flood) {
      // flat water: a few long, still lines
      for (let i = 0; i < 20; i++) {
        const z = Rw.range(3.2, 9.5), x = Rw.range(-3.5, 3.5), L = Rw.range(0.4, 1.4);
        const a = P(x, WL, z), b = P(x + L, WL, z);
        if (a[1] > 760) continue;
        rp += `M${f1(a[0])},${f1(a[1])}H${f1(b[0])}`;
      }
      S.add(`<path d="${rp}" stroke="${C.waterHi}" stroke-width="1.2" stroke-linecap="round" opacity=".3"/>`);
    } else {
      // risen water: rings spreading where it wells up at the door, rippled bands running toward us, wavelets
      const dc = onBC(DS, WL, 0.6);
      let rings = '';
      for (const [rr, op] of [[0.7, 0.55], [1.4, 0.42], [2.3, 0.3], [3.4, 0.2]]) {
        const pts = []; for (let k = 0; k <= 36; k++) { const a = Math.PI + Math.PI * k / 36; pts.push(P(dc[0] + Math.cos(a) * rr * 1.4, WL, dc[2] + Math.sin(a) * rr)); }
        rings += `<path d="${pl1(pts)}" fill="none" stroke="${C.waterHi}" stroke-width="1.6" opacity="${op}"/>`;
      }
      S.add(rings);
      // wavelets: many, spread toward us (z weighted near), bigger and bolder the nearer they are
      let rpNear = '';
      for (let i = 0; i < 120; i++) {
        const z = 0.42 + 8.8 * Rw() ** 1.6, x = Rw.range(-0.55, 0.55) * z * 1.25, L = Rw.range(0.15, 0.45) * (0.6 + z * 0.08), a = P(x, WL, z), b = P(x + L, WL, z), hgt = (F / z) * 0.016;
        if (a[1] > 860 || a[0] < -60 || a[0] > W + 60) continue;
        const d = `M${f1(a[0])},${f1(a[1])}Q${f1((a[0] + b[0]) / 2)},${f1(a[1] - hgt)} ${f1(b[0])},${f1(b[1])}`;
        if (z < 3) rpNear += d; else rp += d;
      }
      S.add(`<path d="${rp}" fill="none" stroke="${C.waterHi}" stroke-width="1.4" stroke-linecap="round" opacity=".38"/><path d="${rpNear}" fill="none" stroke="${C.waterHi}" stroke-width="2.4" stroke-linecap="round" opacity=".3"/>`);
      // foam where the water piles against the wall feet
      let fo = '';
      for (let i = 0; i < 26; i++) { const s = Rw.range(-0.5, LAB), a = P(...onAB(s, WL, 0.05)), L = Rw.range(6, 18); fo += `M${f1(a[0])},${f1(a[1] + 1)}h${f1(L)}`; }
      S.add(`<path d="${fo}" stroke="#c8d4d0" stroke-width="2" stroke-linecap="round" opacity=".35"/>`);
    }
  }

  // --- hooks, cocoons, tags (far to near) ----------------------------------------------------------------------------
  {
    const items = [];
    const keep = empty ? new Set() : flood ? new Set(['hi3', 'hi4', 'hi5']) : null; // the three left hanging in the flood; none the next day
    SLOTS_LO.forEach((s, i) => items.push({ s, row: LO, id: `lo${i}` }));
    SLOTS_HI.forEach((s, i) => items.push({ s, row: HI, id: `hi${i}` }));
    EMPTY.forEach((s, i) => items.push({ s, row: LO, id: `e${i}`, tag: true }));
    const depth = (it) => onAB(it.s, 1, 0.4)[2];
    items.sort((a, b) => depth(b) - depth(a));
    const R = rng(7721);
    const seeds = Object.fromEntries(items.map((it) => [it.id, R.range(0, 1000)]));
    for (const it of items) {
      const Ri = rng(Math.floor(seeds[it.id]) + 7722);
      const t = lk(...onAB(it.s, (it.row.top + it.row.bot) / 2, 0.4));
      // the iron hook: a spike out of the wall and its curl
      const h0 = P(...onAB(it.s, it.row.hook + 0.08, 0)), h1 = P(...onAB(it.s, it.row.hook + 0.08, 0.36)), h2 = P(...onAB(it.s, it.row.hook - 0.06, 0.42)), h3 = P(...onAB(it.s, it.row.hook - 0.1, 0.34));
      const zz = onAB(it.s, 0, 0.4)[2], kk = F / zz;
      const hw = Math.max(2, 0.05 * kk);
      S.add(`<path d="M${f1(h0[0])},${f1(h0[1])}L${f1(h1[0])},${f1(h1[1])}Q${f1(h2[0] + hw)},${f1(h2[1])} ${f1(h3[0])},${f1(h3[1])}" fill="none" stroke="${C.iron}" stroke-width="${f1(hw)}" stroke-linecap="round"/><path d="M${f1(h0[0])},${f1(h0[1] - hw * 0.4)}L${f1(h1[0])},${f1(h1[1] - hw * 0.4)}" stroke="${C.ironLit}" stroke-width="${f1(Math.max(1, hw * 0.3))}" opacity="${f1(0.25 + t * 0.5, 2)}"/>`);
      const full = !it.tag && (!keep || keep.has(it.id));
      if (it.tag) {
        // a short cord and a small wooden tag, a single ink stroke on it (no writing)
        const c0 = P(...onAB(it.s, it.row.hook - 0.1, 0.38)), ty = it.row.hook - 0.42 - Ri.range(0, 0.08), tc = P(...onAB(it.s, ty, 0.38)), tw = 0.2 * kk, th = 0.14 * kk;
        S.add(`<path d="M${f1(c0[0])},${f1(c0[1])}L${f1(tc[0])},${f1(tc[1] - th / 2)}" stroke="#8a7a62" stroke-width="1.4"/><rect x="${f1(tc[0] - tw / 2)}" y="${f1(tc[1] - th / 2)}" width="${f1(tw)}" height="${f1(th)}" rx="1.5" fill="${mix(C.tagShade, C.tag, Math.min(1, t * 1.3))}" transform="rotate(${f1(Ri.range(-12, 12))} ${f1(tc[0])} ${f1(tc[1])})"/><path d="M${f1(tc[0] - tw * 0.04)},${f1(tc[1] - th * 0.3)}v${f1(th * 0.52)}M${f1(tc[0] - tw * 0.04)},${f1(tc[1] - th * 0.04)}h${f1(tw * 0.16)}M${f1(tc[0] - tw * 0.24)},${f1(tc[1] + th * 0.24)}h${f1(tw * 0.46)}" stroke="${C.ink}" stroke-width="${f1(Math.max(1, tw * 0.07))}" opacity=".75"/>`);
        continue;
      }
      if (!full) continue;
      // the cocoon: a long spindle hanging plumb from the hook (a vertical line stays vertical on screen)
      const top = P(...onAB(it.s, it.row.top, 0.4)), bot = P(...onAB(it.s, it.row.bot, 0.4));
      const Rw = 0.34 * kk, Hs = bot[1] - top[1], cx = top[0];
      const prof = (tt) => Rw * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, tt))), 0.62) * (1 + 0.1 * Math.sin(tt * 9 + seeds[it.id]));
      const Lp = [], Rp = [];
      for (let k = 0; k <= 20; k++) { const tt = k / 20, y = top[1] + Hs * tt, w = prof(tt); Lp.push([cx - w * 0.98, y]); Rp.unshift([cx + w, y]); }
      const body = pz1([...Lp, ...Rp]);
      const lit = Math.max(0, Math.min(1, t * 1.7 - 0.2));
      const cLit = mix(C.silkShade, C.silk, lit), cMid = mix(C.silkDeep, C.silkShade, lit), cDark = mix('#2a3230', C.silkDeep, lit);
      S.add(`<path d="${body}" fill="${S.lin([[0, cLit], [0.45, cMid], [1, cDark]], 'x1="0" y1="0" x2="1" y2="0"')}" opacity=".84"/>`);
      // the shape inside, through the membrane: a head, shoulders, the body narrowing to the feet (no face)
      const ox = cx + Rw * 0.06, hy = top[1] + Hs * 0.13, hr = Rw * 0.36;
      const inner = `M${f1(ox - hr)},${f1(hy)}a${f1(hr)},${f1(hr * 1.15)} 0 1 0 ${f1(hr * 2)},0a${f1(hr)},${f1(hr * 1.15)} 0 1 0 ${f1(-hr * 2)},0Z`
        + pz1([[ox - Rw * 0.2, hy + hr * 1.05], [ox - Rw * 0.62, top[1] + Hs * 0.27], [ox - Rw * 0.58, top[1] + Hs * 0.56], [ox - Rw * 0.3, top[1] + Hs * 0.92], [ox + Rw * 0.3, top[1] + Hs * 0.92], [ox + Rw * 0.58, top[1] + Hs * 0.56], [ox + Rw * 0.62, top[1] + Hs * 0.27], [ox + Rw * 0.2, hy + hr * 1.05]]);
      S.add(`<path d="${inner}" fill="${C.inner}" opacity="${f1(0.34 + lit * 0.2, 2)}"/>`);
      // wrapping threads across it, and the bundle of silk tying its top to the hook
      let th = '';
      for (let k = 0; k < 9; k++) {
        const tt = Ri.range(0.08, 0.95), y = top[1] + Hs * tt, w = prof(tt) * 0.95, sl = Ri.range(-0.14, 0.14) * Rw;
        th += `M${f1(cx - w)},${f1(y - sl)}Q${f1(cx)},${f1(y + Rw * 0.18)} ${f1(cx + w)},${f1(y + sl)}`;
      }
      S.add(`<path d="${th}" fill="none" stroke="${cLit}" stroke-width="${f1(Math.max(0.8, Rw * 0.035))}" opacity=".55"/>`);
      S.add(`<path d="M${f1(cx - Rw * 0.2)},${f1(top[1] + Hs * 0.04)}L${f1(h3[0])},${f1(h3[1])}L${f1(cx + Rw * 0.22)},${f1(top[1] + Hs * 0.04)}" fill="${cMid}" stroke="${cLit}" stroke-width="1" opacity=".8"/>`);
      // its lit flank toward the light
      S.add(`<path d="${pl1(Lp.slice(2, 18).map(([x, y]) => [x + Rw * 0.1, y]))}" fill="none" stroke="#f4f8f2" stroke-width="${f1(Math.max(1, Rw * 0.05))}" opacity="${f1(0.15 + lit * 0.4, 2)}"/>`);
    }
  }

  // --- grading: cold, the far corners and the ceiling sink into black, quiet under the dialogue box -----------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.3, '#020405', 0], [1, '#020405', 0.75]], 'gradientUnits="userSpaceOnUse" cx="560" cy="560" r="1050"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#c8dcdc', 0.12], [1, '#c8dcdc', 0]], 'gradientUnits="userSpaceOnUse" cx="40" cy="880" r="700"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#040708', 0], [1, '#040708', 0.68]])}"/>`);
  return S.out();
}

export const tideCaveBgs = {
  'fog-harbor-tide-cave-sluice': () => sluice(false),
  'fog-harbor-tide-cave-sluice-shut': () => sluice(true),
  'fog-harbor-tide-cave': () => tideCave(false),
  'fog-harbor-tide-cave-flood': () => tideCave(true),
  'fog-harbor-tide-cave-empty': () => tideCave(false, true),
};
