// 量潮老站 (chapter 08): the old tide-gauge station on the grey-white flats outside 雾港.
//   tide-station-dawn    — 站顶·天亮: a squat stone hut on wooden piles, seen from a little above so its flat roof
//                          shows: the copper wire hanging from a small davit into the mouth of the tide well, the
//                          recording drum with its pen; under the hut the wooden tide gate hangs between the piles
//                          on its chains (closed, down in its trough). Far off in thinning fog, a row of wooden
//                          bridges and a huddle of roofs: 雾港.
//   tide-station-predawn — 站顶·天亮前 (08-04): the same composition, darker and bluer, the fog thick enough to hide
//                          the harbour; the gate hangs half-way up in mid-air and the flood runs in under it.
//   tide-station-room    — 潮室·拂晓: see tideRoom().
// No reflections, no mirrors, no figures (script 08 美術需求). The predawn variant shares seed and geometry with
// the dawn picture, so everything that both show sits in the same place.
import { Scene, W, H, f, pz, pl, shape, band, stars, bird, persp, mix, rng } from './lib.mjs';
import { piles, mudSheen, currents, patch, circ, sag, taper } from './coast.mjs';

const r0 = (v) => f(v, 0);

const DAWN = {
  sky: [[0, '#8e96aa'], [0.22, '#b8b8c4'], [0.4, '#dcd2d0'], [0.48, '#ecdcd2'], [0.52, '#d8d6d0'], [1, '#6e767c']],
  glow: '#ffe2c8', fog: '#eae8e4', far: '#b4b8bc',
  stone: { lit: '#b8b0a6', mid: '#948c84', shade: '#6a6460', course: '#4e4a48', top: '#c8c0b4' },
  wood: { lit: '#8e8070', mid: '#6a5e52', shade: '#4a423c', wet: '#3a3c36', cap: '#a89a86' },
  copper: '#d0884a', copperLit: '#ffc890', iron: '#3a3a40', paper: '#eee8dc',
  mud: [[0, '#c8c6c0'], [0.3, '#a8a49c'], [1, '#5a5650']], sheen: '#f6f4ee', water: '#8e9a9c',
};
const PRE = {
  sky: [[0, '#1c2232'], [0.25, '#2e3648'], [0.45, '#4a5262'], [0.52, '#5a6070'], [0.56, '#4e5664'], [1, '#14181e']],
  glow: '#8a96b8', fog: '#7a8494', far: '#4e5664',
};

function tideStation(pre) {
  const S = new Scene(pre ? 'sbTidePre' : 'sbTideDawn', pre
    ? '量潮老站·站顶·天亮前：浓雾里蹲在木桩上的石屋，木潮门吊在半空，潮水从门底漫进来，站顶垂进井口的铜线与带笔尖的转筒，雾港看不见'
    : '量潮老站·站顶·天亮：灰白泥滩上蹲在木桩上的石造小屋，底下吊着木潮门，站顶垂进井口的铜线与带笔尖的转筒，远处雾中一排木桥与一片屋顶', 6501);
  const R = S.R, R2 = rng(6502); // R2: details only one of the two pictures draws, so R stays in step
  const HZ = 430;
  const C = pre ? { ...DAWN, ...PRE } : DAWN;
  const dim = (c, k = 0.55) => (pre ? mix(c, '#1a2030', k) : c);

  // --- sky -------------------------------------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(C.sky)}"/>`);
  S.add(`<circle cx="260" cy="${HZ - 20}" r="760" fill="${S.rad([[0, C.glow, pre ? 0.3 : 0.75], [0.2, C.glow, pre ? 0.12 : 0.32], [1, C.glow, 0]])}"/>`);
  if (pre) S.add(stars(R2, 26, [700, 0, W, 180], { maxR: 1, fill: '#c8d4ee', op: [0.1, 0.4] }));
  S.add(`<g filter="${S.blur(2)}"><path d="${band(-60, 900, 150, 26, R, 12)}" fill="${pre ? '#3a4254' : '#c4c0c8'}" opacity=".6"/><path d="${band(600, 1700, 230, 22, R, 10)}" fill="${pre ? '#323a4c' : '#c8c2c8'}" opacity=".55"/><path d="${band(-60, 1100, 330, 12, R, 6)}" fill="${pre ? '#5a6274' : '#f4e6dc'}" opacity=".7"/></g>`);
  let gulls = '';
  for (const [x, y, s, fl] of [[460, 230, 0.8, 0.3], [500, 214, 0.6, 0.8], [1240, 260, 0.6, 0.5]]) gulls += bird(x, y, s, fl);
  if (!pre) S.add(`<path d="${gulls}" fill="#6a6a72"/>`);

  // --- far: 雾港 in the fog (right) — a row of low wooden bridges on piles stepping out to a huddle of stilt roofs ---
  {
    const o = [];
    const fy = HZ - 4;
    let roofs = '', walls = '', stilts = '';
    const house = (x, y, w, h, k) => {
      walls += `M${r0(x)},${r0(y)}v${r0(-h * 0.55)}h${r0(w)}v${r0(h * 0.55)}z`;
      roofs += `M${r0(x - 3)},${r0(y - h * 0.55)}l${r0(w / 2 + 3)},${r0(-h * 0.45 * k)}l${r0(w / 2 + 3)},${r0(h * 0.45 * k)}z`;
      stilts += `M${r0(x + 3)},${r0(y)}v12M${r0(x + w / 2)},${r0(y)}v12M${r0(x + w - 3)},${r0(y)}v12`;
    };
    for (let i = 0; i < 11; i++) { const x = 1150 + i * 44 + R.range(-8, 8), w = R.range(30, 46), h = R.range(22, 40), y = fy - 12 - R.range(0, 8) - (i % 3 === 1 ? 10 : 0); house(x, y, w, h, R.range(0.8, 1.3)); }
    for (let i = 0; i < 6; i++) { const x = 1190 + i * 66 + R.range(-8, 8), w = R.range(26, 38), h = R.range(20, 30), y = fy - 32 - R.range(0, 6); house(x, y, w, h, R.range(0.8, 1.2)); }
    house(1336, fy - 30, 30, 70, 1.5); // a tall one: the old watch house
    o.push(`<path d="${stilts}" stroke="${C.far}" stroke-width="2"/><path d="${walls}" fill="${mix(C.far, '#ffffff', 0.12)}"/><path d="${roofs}" fill="${mix(C.far, '#40404a', 0.25)}"/>`);
    // the bridges: one after another, low decks on piles with a hand rail, walking in from the left toward the town
    let br = '';
    for (const [x0, x1, y] of [[1040, 1150, fy - 8], [900, 1030, fy - 6], [770, 890, fy - 4], [660, 760, fy - 2]]) {
      br += `M${x0},${y - 7}H${x1}M${x0},${y - 15}H${x1}`;
      for (let x = x0 + 6; x < x1; x += 18) br += `M${x},${y - 15}v16`;
    }
    o.push(`<path d="${br}" stroke="${mix(C.far, '#545460', 0.3)}" stroke-width="2.6" fill="none"/>`);
    S.add(`<g opacity="${pre ? 0 : 0.8}">${o.join('')}</g>`);
  }
  // fog lying over the far flats (thick in the predawn picture: it swallows the harbour)
  S.add(`<g filter="${S.blur(3)}"><path d="${band(-100, 1700, HZ + 6, pre ? 60 : 26, R, 10)}" fill="${C.fog}" opacity="${pre ? 0.9 : 0.75}"/><path d="${band(300, 1700, HZ - 14, pre ? 50 : 16, R, 8)}" fill="${C.fog}" opacity="${pre ? 0.85 : 0.5}"/></g>`);

  // --- the flats ------------------------------------------------------------------------------------------
  S.add(`<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="${S.lin(C.mud.map(([o, c]) => [o, dim(c)]), `gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="${H}"`)}"/>`);
  let pools = '';
  for (let i = 0; i < 14; i++) { const t = R() ** 0.8, y = HZ + 14 + 260 * t, x = R.range(-40, 1640); pools += patch(R, x, y, 40 + 140 * t, 2 + 6 * t, 12); }
  S.add(`<path d="${pools}" fill="${dim(DAWN.water, 0.5)}" opacity=".55"/>`);
  S.add(`<path d="M-20,${HZ + 90}C200,${HZ + 70} 380,${HZ + 110} 560,${HZ + 150}M1640,${HZ + 60}C1440,${HZ + 80} 1240,${HZ + 120} 1040,${HZ + 168}M200,${H}C320,${HZ + 330} 420,${HZ + 260} 600,${HZ + 220}" fill="none" stroke="${dim('#7e8686')}" stroke-width="5" stroke-linecap="round" opacity=".6"/>`);
  S.add(mudSheen(R, -20, 1620, HZ + 10, 820, 70, pre ? '#8e9ab0' : DAWN.sheen, pre ? 0.35 : 0.55));
  // a line of old marker stakes walking out across the flat
  let stakes = '';
  for (let i = 0; i < 7; i++) { const x = 240 + i * 70 + R.range(-6, 6), y = HZ + 40 + i * 4, h = 30 - i * 2; stakes += `M${x},${y}v${-h}`; }
  S.add(`<path d="${stakes}" stroke="${dim('#4e4840')}" stroke-width="4" stroke-linecap="round"/>`);

  // --- the station: piles, the gate trough, the tide gate, the stone hut, its roof with the well and the drum -----
  const X0 = 600, X1 = 1000, DX = 70, DY = -36; // front face left/right, depth offset (to the back-right)
  const yRoof = 286, yFloor = 448, yMud = 588; // roof edge, hut floor (top of piles), mud line under the hut
  const st = Object.fromEntries(Object.entries(DAWN.stone).map(([k, v]) => [k, dim(v)]));
  const wd = Object.fromEntries(Object.entries(DAWN.wood).map(([k, v]) => [k, dim(v)]));
  {
    // shadow on the mud under the hut
    S.add(`<path d="M${X0 - 40},${yMud + 4}L${X1 + 30},${yMud + 4}L${X1 + DX + 40},${yMud + DY + 6}L${X0 + DX - 30},${yMud + DY + 6}Z" fill="${dim('#5a5650')}" opacity=".5"/>`);
    // back piles (through the gap), then the trough, then front piles
    const back = [], front = [];
    for (let i = 0; i < 5; i++) { const x = X0 + 20 + i * (X1 - X0 - 40) / 4; back.push([x + DX, yFloor + DY + 6, yMud + DY, 16, yMud + DY - 40]); front.push([x, yFloor + 6, yMud, 24, yMud - 56]); }
    S.add(piles(back, { lit: mix(wd.lit, '#999999', 0.2), mid: mix(wd.mid, '#888888', 0.2), shade: mix(wd.shade, '#777777', 0.2), wet: wd.wet }));
    // the stone trough the gate drops into, running out from under the hut toward us
    const tx0 = 740, tx1 = 860;
    S.add(`<path d="M${tx0 + DX},${yMud + DY}L${tx1 + DX},${yMud + DY}L${tx1 + 30},${yMud + 70}L${tx0 - 40},${yMud + 70}Z" fill="${st.shade}"/><path d="M${tx0 + DX + 8},${yMud + DY + 4}L${tx1 + DX - 8},${yMud + DY + 4}L${tx1 + 18},${yMud + 66}L${tx0 - 26},${yMud + 66}Z" fill="${dim('#3e4044')}"/>`);
    S.add(`<path d="M${tx0 - 40},${yMud + 70}L${tx0 + DX},${yMud + DY}M${tx1 + 30},${yMud + 70}L${tx1 + DX},${yMud + DY}" stroke="${st.lit}" stroke-width="3" opacity=".7"/>`);
    // water in the trough: a thin trickle at dawn (gate shut); the flood running in under the raised gate before dawn
    if (pre) {
      S.add(`<path d="M${tx0 + DX + 8},${yMud + DY + 4}L${tx1 + DX - 8},${yMud + DY + 4}L${tx1 + 18},${yMud + 66}L${tx0 - 26},${yMud + 66}Z" fill="#4e6070"/>`);
      S.add(currents(R2, tx0 - 20, tx1 + 40, yMud - 20, yMud + 64, 16, '#a8c0d8', 0.6, 1));
      S.add(`<path d="M${tx0 - 30},${yMud + 70}C${tx0 - 80},${yMud + 90} ${tx0 - 160},${yMud + 96} ${tx0 - 260},${yMud + 120}M${tx1 + 30},${yMud + 70}C${tx1 + 80},${yMud + 84} ${tx1 + 160},${yMud + 90} ${tx1 + 240},${yMud + 110}" fill="none" stroke="#4e6070" stroke-width="10" stroke-linecap="round" opacity=".8"/>`);
    } else {
      S.add(`<path d="M${tx0 + 10},${yMud + 30}L${tx1 - 6},${yMud + 30}" stroke="#9aa8ac" stroke-width="4" opacity=".7"/>`);
    }
    // the tide gate: a heavy plank door with iron straps between the two middle piles, hanging on two chains
    const gy0 = pre ? yFloor + 14 : yFloor + 58, gh = 112; // top of the gate
    const gx0 = tx0 + 16, gx1 = tx1 + 10;
    S.add(`<path d="${sag([gx0 + 14, yFloor + 4], [gx0 + 14, gy0], 0)}${sag([gx1 - 14, yFloor + 4], [gx1 - 14, gy0], 0)}" stroke="${dim(DAWN.iron)}" stroke-width="5" stroke-dasharray="7 3"/>`);
    S.add(`<path d="M${gx0},${gy0}H${gx1}V${gy0 + gh}H${gx0}Z" fill="${wd.mid}"/><path d="M${gx0},${gy0}H${gx0 + 22}V${gy0 + gh}H${gx0}Z" fill="${wd.lit}"/>`);
    let gp = '';
    for (let x = gx0 + 20; x < gx1; x += 20) gp += `M${x},${gy0}v${gh}`;
    S.add(`<path d="${gp}" stroke="${wd.shade}" stroke-width="2"/><path d="M${gx0},${gy0 + 18}H${gx1}M${gx0},${gy0 + gh - 18}H${gx1}" stroke="${dim(DAWN.iron)}" stroke-width="7"/><path d="M${gx0},${gy0 + gh}H${gx1}" stroke="${wd.wet}" stroke-width="10"/>`);
    if (pre) S.add(`<path d="M${gx0 + 6},${gy0 + gh + 8}q20,8 40,0q20,-8 40,0q20,8 40,0" fill="none" stroke="#c8daf0" stroke-width="2.4" opacity=".75"/>`);
    S.add(piles(front, wd));
    // cross-bracing between the front piles
    let brace = '';
    for (let i = 0; i < 4; i++) { const xa = front[i][0], xb = front[i + 1][0]; if (i === 1 || i === 2) continue; brace += `M${xa},${yFloor + 30}L${xb},${yMud - 40}M${xb},${yFloor + 30}L${xa},${yMud - 40}`; }
    S.add(`<path d="${brace}" stroke="${wd.shade}" stroke-width="7"/>`);
  }
  {
    // the hut: side wall (right, shade), front wall (lit), stone courses, a small door with a landing, one window
    const o = [];
    o.push(`<path d="${pz([[X1, yFloor], [X1, yRoof], [X1 + DX, yRoof + DY], [X1 + DX, yFloor + DY]])}" fill="${st.shade}"/>`);
    o.push(`<path d="M${X0},${yFloor}V${yRoof}H${X1}V${yFloor}Z" fill="${st.mid}"/><path d="M${X0},${yFloor}V${yRoof}H${X0 + 120}V${yFloor}Z" fill="${st.lit}" opacity=".6"/>`);
    let co = '';
    for (let y = yFloor - 16, k = 0; y > yRoof + 6; y -= 16, k++) { co += `M${X0},${y}H${X1}`; for (let x = X0 + (k % 2) * 22; x < X1; x += 44) co += `M${x},${y}v16`; co += `M${X1},${y}l${DX},${DY}`; }
    o.push(`<path d="${co}" stroke="${st.course}" stroke-width="1.6" opacity=".45"/>`);
    // floor beam the hut sits on
    o.push(`<path d="M${X0 - 14},${yFloor}H${X1 + 10}l${DX},${DY}v12l-${DX},${-DY}H${X0 - 14}Z" fill="${wd.shade}"/><path d="M${X0 - 14},${yFloor}H${X1 + 10}" stroke="${wd.cap}" stroke-width="2" opacity=".6"/>`);
    // door (left) with a narrow plank landing and the ladder down to the mud
    o.push(`<path d="M${X0 + 40},${yFloor}V${yFloor - 96}h50V${yFloor}z" fill="${dim('#3a3430')}"/><path d="M${X0 + 46},${yFloor - 6}V${yFloor - 90}h38" fill="none" stroke="${wd.lit}" stroke-width="2" opacity=".6"/>`);
    o.push(`<path d="M${X0 - 70},${yFloor + 2}H${X0}v8H${X0 - 70}z" fill="${wd.mid}"/><path d="M${X0 - 60},${yFloor + 6}L${X0 - 72},${yMud + 2}M${X0 - 26},${yFloor + 6}L${X0 - 38},${yMud + 2}" stroke="${wd.shade}" stroke-width="6"/>`);
    let rungs = '';
    for (let y = yFloor + 26; y < yMud; y += 22) { const t = (y - yFloor) / (yMud - yFloor); rungs += `M${r0(X0 - 61 - 12 * t)},${y}H${r0(X0 - 27 - 12 * t)}`; }
    o.push(`<path d="${rungs}" stroke="${wd.shade}" stroke-width="4"/>`);
    // a small window with a shutter (no glass that could reflect: a dark opening)
    o.push(`<path d="M${X0 + 250},${yRoof + 50}h56v44h-56z" fill="${dim('#2e2c2c')}"/><path d="M${X0 + 310},${yRoof + 48}h22v48h-22z" fill="${wd.mid}"/>`);
    // a white tide-mark painted across the front pile beside the door: a gauge board on the wall with tick marks
    o.push(`<path d="M${X1 - 70},${yRoof + 30}h18v${yFloor - yRoof - 40}h-18z" fill="${dim('#e8e4da')}"/>`);
    let ticks = '';
    for (let y = yRoof + 40; y < yFloor - 14; y += 12) ticks += `M${X1 - 70},${y}h${(y - yRoof) % 36 < 12 ? 12 : 7}`;
    o.push(`<path d="${ticks}" stroke="${dim('#3a3a40')}" stroke-width="2"/>`);
    // the roof: a flat stone slab seen from a little above, with a low parapet; the well mouth; the davit and wire
    const rp = [[X0 - 8, yRoof], [X1 + 8, yRoof], [X1 + DX + 8, yRoof + DY], [X0 + DX - 8, yRoof + DY]];
    o.push(`<path d="${pz(rp)}" fill="${st.top}"/><path d="${pz([[X0 - 8, yRoof], [X1 + 8, yRoof], [X1 + 8, yRoof + 12], [X0 - 8, yRoof + 12]])}" fill="${st.shade}"/>`);
    o.push(`<path d="M${X0 - 8},${yRoof}H${X1 + 8}l${DX},${DY}" fill="none" stroke="${dim('#e8e2d6')}" stroke-width="2.5" opacity=".8"/>`);
    // parapet stub posts along the edge and a rope run between them
    let pp = '';
    for (const x of [X0 + 10, X0 + 200, X0 + 390]) pp += `M${x},${yRoof}v-26`;
    pp += `M${X0 + DX - 2},${yRoof + DY}v-24M${X1 + DX},${yRoof + DY}v-24`;
    o.push(`<path d="${pp}" stroke="${wd.shade}" stroke-width="6" stroke-linecap="round"/><path d="${sag([X0 + 10, yRoof - 22], [X0 + 200, yRoof - 22], 8)}${sag([X0 + 200, yRoof - 22], [X0 + 390, yRoof - 22], 8)}" stroke="${wd.lit}" stroke-width="2" fill="none"/>`);
    // the tide well's mouth: a square stone curb, its dark shaft
    const wx = X0 + 270, wy = yRoof + DY * 0.55;
    o.push(`<path d="${pz([[wx - 36, wy + 10], [wx + 30, wy + 10], [wx + 50, wy - 2], [wx - 16, wy - 2]])}" fill="${st.shade}"/><path d="${pz([[wx - 36, wy + 10], [wx + 30, wy + 10], [wx + 30, wy + 18], [wx - 36, wy + 18]])}" fill="${st.course}"/><path d="${pz([[wx - 26, wy + 8], [wx + 26, wy + 8], [wx + 40, wy], [wx - 12, wy]])}" fill="${dim('#141618')}"/>`);
    // the davit over it: a bent iron arm with a pulley, the copper wire running down into the shaft
    const dxp = wx + 6, dtop = wy - 120;
    o.push(`<path d="M${wx - 40},${wy + 6}V${dtop}H${dxp}" fill="none" stroke="${dim(DAWN.iron)}" stroke-width="6" stroke-linejoin="round"/><path d="M${wx - 44},${wy + 6}V${dtop}" stroke="${dim('#8a8a90')}" stroke-width="1.6" opacity=".7"/><circle cx="${dxp}" cy="${dtop + 8}" r="8" fill="none" stroke="${dim(DAWN.iron)}" stroke-width="3"/>`);
    o.push(`<path d="M${dxp + 6},${dtop + 8}V${wy + 4}" stroke="${dim(DAWN.copper)}" stroke-width="2.4"/><path d="M${dxp + 5},${dtop + 14}V${wy - 20}" stroke="${dim(DAWN.copperLit)}" stroke-width="1" opacity=".9"/>`);
    // the wire's other run goes along the roof to the recording drum (left)
    const dx0 = X0 + 60, dy0 = yRoof + DY * 0.5 - 8;
    o.push(`<path d="M${dxp - 6},${dtop + 8}Q${r0((dxp + dx0) / 2)},${dtop + 26} ${dx0 + 60},${dy0 - 30}" fill="none" stroke="${dim(DAWN.copper)}" stroke-width="2"/>`);
    // the drum recorder: stand, horizontal drum wrapped in paper with trace lines, the pen arm resting on it, a clock box
    o.push(`<path d="M${dx0},${dy0 + 14}V${dy0 - 16}M${dx0 + 80},${dy0 + 12}V${dy0 - 18}" stroke="${dim(DAWN.iron)}" stroke-width="5"/><path d="M${dx0 - 6},${dy0 + 14}h92v6h-92z" fill="${wd.shade}"/>`);
    o.push(`<path d="M${dx0 + 4},${dy0 - 36}h72a10,18 0 0 1 0,36h-72a10,18 0 0 1 0,-36z" fill="${dim(DAWN.paper)}"/><path d="M${dx0 + 76},${dy0 - 36}a10,18 0 0 1 0,36" fill="${dim('#b8b2a6')}"/>`);
    o.push(`<path d="M${dx0 + 8},${dy0 - 20}c10,-6 18,6 28,-2s18,8 28,-4" fill="none" stroke="${dim('#4a5a8a')}" stroke-width="1.6"/><path d="M${dx0 + 8},${dy0 - 10}h68" stroke="${dim('#c8a8a0')}" stroke-width="1" opacity=".8"/>`);
    o.push(`<path d="M${dx0 + 98},${dy0 + 12}V${dy0 - 30}h26V${dy0 + 12}z" fill="${dim('#5a504a')}"/><circle cx="${dx0 + 111}" cy="${dy0 - 16}" r="7" fill="${dim('#d8d0c0')}"/><path d="M${dx0 + 111},${dy0 - 16}v-5M${dx0 + 111},${dy0 - 16}h4" stroke="#2a2a2a" stroke-width="1.4"/>`);
    o.push(`<path d="M${dx0 + 98},${dy0 - 24}L${dx0 + 52},${dy0 - 20}" stroke="${dim(DAWN.iron)}" stroke-width="3"/><path d="M${dx0 + 52},${dy0 - 20}l-6,2l4,3z" fill="${dim('#2a2a3a')}"/>`);
    S.add(o.join(''));
  }

  // --- near flat: a few stakes and weed, calm under the dialogue box ---------------------------------------------
  {
    let weed = '';
    for (let i = 0; i < 30; i++) { const x = R.range(-20, 1620), y = R.range(640, 760), h = R.range(6, 16); weed += `M${r0(x)},${r0(y)}q2,${r0(-h)} 6,${r0(-h * 0.8)}q-2,${r0(h * 0.4)} 2,${r0(h * 0.8)}z`; }
    S.add(`<path d="${weed}" fill="${dim('#6a6e5a')}" opacity=".7"/>`);
  }

  // --- grading -------------------------------------------------------------------------------------------------
  if (pre) {
    S.add(`<g filter="${S.blur(3)}"><path d="${band(-100, 1700, 520, 50, R, 14)}" fill="#6a7484" opacity=".5"/><path d="${band(-100, 900, 400, 40, R, 12)}" fill="#6a7484" opacity=".4"/><path d="${band(-100, 1700, 470, 60, R2, 16)}" fill="#7a8494" opacity=".55"/><path d="${band(1000, 1700, 360, 70, R2, 20)}" fill="#7a8494" opacity=".6"/><path d="${band(-100, 640, 330, 60, R2, 16)}" fill="#6a7484" opacity=".5"/></g>`);
    S.add(`<rect width="${W}" height="${H}" fill="#6a7484" opacity=".14"/>`);
    S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.4, '#06080e', 0], [1, '#06080e', 0.6]], 'cx="0.5" cy="0.45" r="0.75"')}"/>`);
    S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#06080e', 0], [1, '#06080e', 0.7]])}"/>`);
  } else {
    S.add(`<g filter="${S.blur(3)}"><path d="${band(-100, 1700, 520, 24, R, 10)}" fill="#f2eee8" opacity=".35"/><path d="${band(-100, 900, 400, 20, R, 8)}" fill="#f2eee8" opacity=".25"/></g>`);
    S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#ffe8d0', 0.14], [0.5, '#ffe8d0', 0], [1, '#2a3038', 0.2]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
    S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.5, '#2a3038', 0], [1, '#2a3038', 0.36]], 'cx="0.5" cy="0.45" r="0.78"')}"/>`);
    S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#2a2e32', 0], [1, '#2a2e32', 0.62]])}"/>`);
  }
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 量潮老站·潮室·拂晓 — the stone room under the roof: the wooden tide gate standing in its stone slot with dark
// water in the trough, the winch on a stone bench (drum, crank, the big gear on its seat, the ratchet pawl),
// its chain over a pulley to the gate; on the back wall a white and a red painted line with the test-lamp board
// nailed between them (a row of clear crystals soldered along it, the oilcloth notebook resting on its top),
// a shelf of papers held down by a brick beneath; the ladder up to the roof hatch; and the dawn tide spilling
// over the doorsill onto the flags. Cold first light from the door and a high slit window. No mirror, no figures.
// ---------------------------------------------------------------------------------------------
const ROOM = {
  wall: '#7e7a70', wallLit: '#9a958a', wallShade: '#4e4c48', course: '#3a3836', floor: '#5e5c56', floorDark: '#2a2a2a',
  beam: '#3a3028', wood: '#6a5a48', woodLit: '#8e7a62', woodShade: '#3e342a', iron: '#2e3036', ironLit: '#7a808c',
  water: '#2e3a44', waterLit: '#a8c0d0', dawn: '#d8dce8', white: '#ece8de', red: '#a8382e', copper: '#c07a42',
  crystal: '#e8f4ff', crystalShade: '#9ab0c4', oilcloth: '#4a5236', paper: '#ddd6c6', brick: '#8a4e3a',
};

function tideRoom() {
  const S = new Scene('sbTideRoom', '量潮老站·潮室·拂晓：石槽里的木潮门，石台上带棘爪与齿轮座的绞盘，墙上一白一红两道漆线之间钉着焊了一排透明晶的试灯回路板与油布本子，板下压着纸的架子，侧梯，漫过门槛的水', 6601);
  const R = S.R;
  const F = 760, pr = persp({ vp: [800, 400], F, eye: 1.55 });
  const q = (pts) => pr.quad(pts);
  const X0 = -4.2, X1 = 4.2, CEIL = 3.3, BACK = 7.2, NEAR = 1.1;
  const k = (z) => F / z;

  // --- shell: back wall, side walls, floor, ceiling -------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="#1a1a1c"/>`);
  S.add(`<path d="${q([[X0, 0, BACK], [X0, CEIL, BACK], [X1, CEIL, BACK], [X1, 0, BACK]])}" fill="${S.lin([[0, ROOM.wallShade], [0.3, ROOM.wall], [1, ROOM.wallShade]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="${q([[X0, 0, NEAR], [X0, CEIL, NEAR], [X0, CEIL, BACK], [X0, 0, BACK]])}" fill="${S.lin([[0, '#3a3836'], [1, ROOM.wall]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="${q([[X1, 0, NEAR], [X1, CEIL, NEAR], [X1, CEIL, BACK], [X1, 0, BACK]])}" fill="${S.lin([[0, ROOM.wallShade], [1, '#262626']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="${q([[X0, CEIL, NEAR], [X0, CEIL, BACK], [X1, CEIL, BACK], [X1, CEIL, NEAR]])}" fill="#262420"/>`);
  S.add(`<path d="${q([[X0, 0, NEAR], [X0, 0, BACK], [X1, 0, BACK], [X1, 0, NEAR]])}" fill="${S.lin([[0, ROOM.floor], [1, ROOM.floorDark]], `gradientUnits="userSpaceOnUse" x1="0" y1="${pr(0, 0, BACK)[1]}" x2="0" y2="${H}"`)}"/>`);
  // stone courses on the walls, flagstone joints on the floor
  let co = '';
  for (let y = 0.3; y < CEIL; y += 0.3) { co += pl(pr.poly([[X0, y, BACK], [X1, y, BACK]])) + pl(pr.poly([[X0, y, NEAR], [X0, y, BACK]])) + pl(pr.poly([[X1, y, NEAR], [X1, y, BACK]])); }
  for (let y = 0, i = 0; y < CEIL; y += 0.3, i++) for (let x = X0 + (i % 2) * 0.35; x < X1; x += 0.7) co += pl(pr.poly([[x, y, BACK], [x, y + 0.3, BACK]]));
  S.add(`<path d="${co}" stroke="${ROOM.course}" stroke-width="1.6" opacity=".4"/>`);
  let fl = '';
  for (let z = NEAR + 0.6; z < BACK; z += 0.8) fl += pl(pr.poly([[X0, 0, z], [1.2, 0, z]]));
  for (let x = X0 + 0.8; x < 1.2; x += 0.8) fl += pl(pr.poly([[x, 0, NEAR], [x, 0, BACK]]));
  S.add(`<path d="${fl}" stroke="#1e1e1e" stroke-width="2" opacity=".5"/>`);
  // ceiling beams and the roof hatch (a square of pale sky at the top of the ladder)
  let beams = '';
  for (const z of [2.2, 3.8, 5.4, 7.0]) beams += pz(pr.poly([[X0, CEIL, z], [X1, CEIL, z], [X1, CEIL - 0.25, z], [X0, CEIL - 0.25, z]]));
  S.add(`<path d="${beams}" fill="${ROOM.beam}"/>`);
  S.add(`<path d="${q([[-4.1, CEIL, 4.2], [-4.1, CEIL, 5.0], [-3.3, CEIL, 5.0], [-3.3, CEIL, 4.2]])}" fill="${ROOM.dawn}"/>`);

  // --- dawn light: the door in the left wall (back) with the tide spilling over its sill; the high slit window -----
  {
    const dz0 = 5.4, dz1 = 6.5, dh = 2.0;
    S.add(`<path d="${q([[X0 + 0.01, 0, dz0], [X0 + 0.01, dh, dz0], [X0 + 0.01, dh, dz1], [X0 + 0.01, 0, dz1]])}" fill="${S.lin([[0, '#e8e2ea'], [0.6, '#c8ccd8'], [1, '#8a96a8']])}"/>`);
    // the flats outside, seen through the door: a line of fog, the grey water rising
    S.add(`<path d="${q([[X0 + 0.02, 0, dz0], [X0 + 0.02, 0.45, dz0], [X0 + 0.02, 0.45, dz1], [X0 + 0.02, 0, dz1]])}" fill="#7a8a96"/>`);
    S.add(`<path d="${q([[X0 + 0.03, 0, dz0 - 0.08], [X0 + 0.03, dh + 0.08, dz0 - 0.08], [X0 + 0.03, dh + 0.08, dz0], [X0 + 0.03, 0, dz0]])}${q([[X0 + 0.03, dh, dz0 - 0.08], [X0 + 0.03, dh + 0.12, dz0 - 0.08], [X0 + 0.03, dh + 0.12, dz1 + 0.08], [X0 + 0.03, dh, dz1 + 0.08]])}" fill="${ROOM.woodShade}"/>`);
    // the sill and the sheet of water coming over it, fanning across the flags
    S.add(`<path d="${q([[X0, 0.12, dz0], [X0 + 0.25, 0.12, dz0], [X0 + 0.25, 0.12, dz1], [X0, 0.12, dz1]])}" fill="${ROOM.wallLit}"/>`);
    const sheet = pz([pr(X0 + 0.25, 0.12, dz0 + 0.1), pr(X0 + 0.25, 0.12, dz1 - 0.1), pr(-1.6, 0, 6.8), pr(-0.4, 0, 5.4), pr(-1.4, 0, 3.6), pr(-3.2, 0, 3.4)]);
    S.add(`<path d="${sheet}" fill="#5a6a7c" opacity=".75"/>`);
    S.add(`<path d="${q([[X0 + 0.25, 0.12, dz0 + 0.1], [X0 + 0.25, 0.12, dz1 - 0.1], [X0 + 0.25, 0, dz1 - 0.1], [X0 + 0.25, 0, dz0 + 0.1]])}" fill="#8aa0b4" opacity=".85"/>`);
    let rip = '';
    for (let i = 0; i < 14; i++) { const z = R.range(3.8, 6.4), x = R.range(-3.6, -1.2), p = pr(x, 0, z), kk = k(z); rip += `M${r0(p[0])},${r0(p[1])}q${f(0.12 * kk)},${f(-0.012 * kk)} ${f(0.26 * kk)},0`; }
    S.add(`<path d="${rip}" fill="none" stroke="${ROOM.waterLit}" stroke-width="1.6" opacity=".6"/>`);
    // light falling in from the door across the wet floor
    S.add(`<path d="${pz([pr(X0, dh, dz0), pr(X0, dh, dz1), pr(-0.6, 0, 7), pr(-1.2, 0, 3.6), pr(X0, 0, dz0)])}" fill="#dfe6f4" opacity=".14" filter="${S.blur(2)}"/>`);
    // the high slit window on the back wall (right), its cold shaft
    S.add(`<path d="${q([[2.2, 2.4, BACK - 0.01], [2.2, 2.9, BACK - 0.01], [2.9, 2.9, BACK - 0.01], [2.9, 2.4, BACK - 0.01]])}" fill="${ROOM.dawn}"/>`);
    S.add(`<path d="${pz([pr(2.2, 2.4, BACK), pr(2.9, 2.4, BACK), pr(2.6, 0, 4.4), pr(1.6, 0, 4.6)])}" fill="#e6ecf8" opacity=".1" filter="${S.blur(2)}"/>`);
  }

  // --- the back wall: white line, red line, the test-lamp board between them, the shelf of papers below ---------
  {
    const z = BACK - 0.02, bx0 = -0.85, bx1 = 1.15, by0 = 1.26, by1 = 2.04;
    S.add(`<path d="${q([[X0, 2.2, z], [X0, 2.3, z], [1.6, 2.3, z], [1.6, 2.2, z]])}" fill="${ROOM.white}"/><path d="${q([[X0, 1.04, z], [X0, 1.14, z], [1.6, 1.14, z], [1.6, 1.04, z]])}" fill="${ROOM.red}"/>`);
    S.add(`<path d="${q([[X0 + 0.01, 2.2, 5.3], [X0 + 0.01, 2.3, 5.3], [X0 + 0.01, 2.3, NEAR + 0.4], [X0 + 0.01, 2.2, NEAR + 0.4]])}${q([[X0 + 0.01, 2.2, z], [X0 + 0.01, 2.3, z], [X0 + 0.01, 2.3, 6.6], [X0 + 0.01, 2.2, 6.6]])}" fill="${ROOM.white}" opacity=".8"/><path d="${q([[X0 + 0.01, 1.04, 5.3], [X0 + 0.01, 1.14, 5.3], [X0 + 0.01, 1.14, NEAR + 0.4], [X0 + 0.01, 1.04, NEAR + 0.4]])}${q([[X0 + 0.01, 1.04, z], [X0 + 0.01, 1.14, z], [X0 + 0.01, 1.14, 6.6], [X0 + 0.01, 1.04, 6.6]])}" fill="${ROOM.red}" opacity=".8"/>`);
    // the board, nailed at its corners
    S.add(`<path d="${q([[bx0, by0, z], [bx0, by1, z], [bx1, by1, z], [bx1, by0, z]])}" fill="${ROOM.wood}"/><path d="${q([[bx0, by0, z], [bx0, by1, z], [bx0 + 0.06, by1, z], [bx0 + 0.06, by0, z]])}" fill="${ROOM.woodLit}"/>`);
    let nails = '';
    for (const [x, y] of [[bx0 + 0.05, by1 - 0.05], [bx1 - 0.05, by1 - 0.05], [bx0 + 0.05, by0 + 0.05], [bx1 - 0.05, by0 + 0.05]]) { const p = pr(x, y, z); nails += circ(p[0], p[1], 2.4); }
    S.add(`<path d="${nails}" fill="#2a2a2e"/>`);
    // copper traces and wire loops on the board, the little test lamp, the row of clear crystals
    let tr = '';
    for (const y of [1.84, 1.62]) tr += pl(pr.poly([[bx0 + 0.12, y, z], [bx1 - 0.12, y, z]]));
    for (let i = 0; i < 9; i++) { const x = bx0 + 0.2 + i * 0.19; tr += pl(pr.poly([[x, 1.84, z], [x, 1.5, z]])); }
    S.add(`<path d="${tr}" stroke="${ROOM.copper}" stroke-width="2.2" fill="none"/>`);
    const lp = pr(bx1 - 0.16, 1.84, z), kk = k(z);
    S.add(`<circle cx="${r0(lp[0])}" cy="${r0(lp[1] - 0.02 * kk)}" r="${f(0.055 * kk)}" fill="#f4e6c0" opacity=".9"/><circle cx="${r0(lp[0])}" cy="${r0(lp[1] - 0.02 * kk)}" r="${f(0.16 * kk)}" fill="${S.rad([[0, '#ffe6a8', 0.4], [1, '#ffe6a8', 0]])}"/>`);
    let cr = '', crS = '', crH = '';
    for (let i = 0; i < 9; i++) {
      const x = bx0 + 0.2 + i * 0.19, p = pr(x, 1.46, z), w = 0.055 * kk, h = 0.15 * kk;
      cr += `M${r0(p[0] - w)},${r0(p[1])}l${f(w * 0.4)},${f(-h)}h${f(w * 1.2)}l${f(w * 0.4)},${f(h)}z`;
      crS += `M${r0(p[0] + w * 0.2)},${r0(p[1])}l${f(w * 0.2)},${f(-h)}h${f(w * 0.4)}l${f(w * 0.4)},${f(h)}z`;
      crH += `M${r0(p[0] - w * 0.4)},${r0(p[1] - h * 0.2)}l${f(w * 0.25)},${f(-h * 0.6)}`;
      cr += circ(p[0], p[1] + 2, w * 0.5);
    }
    S.add(`<path d="${cr}" fill="${ROOM.crystal}" opacity=".85"/><path d="${crS}" fill="${ROOM.crystalShade}" opacity=".7"/><path d="${crH}" stroke="#ffffff" stroke-width="1.6"/>`);
    // the oilcloth notebook lying on the board's top edge (a ledge strip), one corner over the edge
    S.add(`<path d="${q([[bx0 - 0.02, by1, z], [bx0 - 0.02, by1 + 0.04, z], [bx1 + 0.02, by1 + 0.04, z], [bx1 + 0.02, by1, z]])}" fill="${ROOM.woodShade}"/>`);
    S.add(`<path d="${q([[-0.45, by1 + 0.04, z - 0.01], [-0.42, by1 + 0.2, z - 0.01], [0.2, by1 + 0.22, z - 0.01], [0.26, by1 + 0.04, z - 0.01]])}" fill="${ROOM.oilcloth}"/><path d="${pl(pr.poly([[-0.42, by1 + 0.1, z - 0.02], [0.24, by1 + 0.11, z - 0.02]]))}" stroke="#e8e0c8" stroke-width="2" opacity=".8"/><path d="${pl(pr.poly([[-0.45, by1 + 0.04, z - 0.02], [0.26, by1 + 0.04, z - 0.02]]))}" stroke="#2a3020" stroke-width="2"/>`);
    // shelf below the board: two planks on brackets, stacks of paper held under a brick
    const sy = 0.82;
    S.add(`<path d="${q([[bx0 - 0.2, sy, z], [bx0 - 0.2, sy + 0.05, z], [bx1 + 0.2, sy + 0.05, z], [bx1 + 0.2, sy, z]])}" fill="${ROOM.woodLit}"/><path d="${pl(pr.poly([[bx0, sy, z], [bx0, sy - 0.2, z]]))}${pl(pr.poly([[bx1, sy, z], [bx1, sy - 0.2, z]]))}" stroke="${ROOM.woodShade}" stroke-width="4"/>`);
    S.add(`<path d="${q([[-0.7, sy + 0.05, z], [-0.7, sy + 0.18, z], [0.0, sy + 0.18, z], [0.0, sy + 0.05, z]])}" fill="${ROOM.paper}"/><path d="${pl(pr.poly([[-0.7, sy + 0.1, z], [0.0, sy + 0.1, z]]))}${pl(pr.poly([[-0.7, sy + 0.14, z], [0.0, sy + 0.14, z]]))}" stroke="#b0a890" stroke-width="1"/>`);
    S.add(`<path d="${q([[-0.55, sy + 0.18, z], [-0.55, sy + 0.32, z], [-0.15, sy + 0.32, z], [-0.15, sy + 0.18, z]])}" fill="${ROOM.brick}"/>`);
    S.add(`<path d="${q([[0.4, sy + 0.05, z], [0.4, sy + 0.12, z], [0.95, sy + 0.12, z], [0.95, sy + 0.05, z]])}" fill="${ROOM.paper}" opacity=".85"/><path d="${q([[0.5, sy + 0.12, z], [0.5, sy + 0.2, z], [0.72, sy + 0.2, z], [0.72, sy + 0.12, z]])}" fill="#6a6a70"/>`);
  }

  // --- the tide gate in its stone slot (right), the trough of dark water across the floor -------------------
  {
    const tx0 = 1.3, tx1 = 3.4, gz = 5.6;
    // the trough: a channel cut in the floor from the back wall toward us, water a hand below the rim
    S.add(`<path d="${q([[tx0, 0, NEAR], [tx0, 0, BACK], [tx1, 0, BACK], [tx1, 0, NEAR]])}" fill="#1a1e22"/>`);
    S.add(`<path d="${q([[tx0, -0.12, NEAR], [tx0, -0.12, BACK], [tx1, -0.12, BACK], [tx1, -0.12, NEAR]])}" fill="${ROOM.water}"/>`);
    S.add(`<path d="${q([[tx0, 0, NEAR], [tx0, 0, BACK], [tx0, -0.12, BACK], [tx0, -0.12, NEAR]])}" fill="${ROOM.wallShade}"/>`);
    let rp = '';
    for (let i = 0; i < 12; i++) { const z = R.range(1.6, 6.8), x = R.range(tx0 + 0.2, tx1 - 0.4), p = pr(x, -0.12, z), kk = k(z); rp += `M${r0(p[0])},${r0(p[1])}q${f(0.1 * kk)},${f(-0.01 * kk)} ${f(0.22 * kk)},0`; }
    S.add(`<path d="${rp}" fill="none" stroke="${ROOM.waterLit}" stroke-width="1.5" opacity=".55"/>`);
    S.add(`<path d="${pl(pr.poly([[tx0, 0, NEAR], [tx0, 0, BACK]]))}${pl(pr.poly([[tx1, 0, NEAR], [tx1, 0, BACK]]))}" stroke="${ROOM.wallLit}" stroke-width="3" opacity=".7"/>`);
    // stone guide posts either side with their grooves
    for (const x of [tx0 - 0.3, tx1]) {
      S.add(`<path d="${q([[x, 0, gz - 0.2], [x, 2.6, gz - 0.2], [x + 0.3, 2.6, gz - 0.2], [x + 0.3, 0, gz - 0.2]])}" fill="${ROOM.wall}"/><path d="${q([[x + 0.3, 0, gz - 0.2], [x + 0.3, 2.6, gz - 0.2], [x + 0.3, 2.6, gz + 0.2], [x + 0.3, 0, gz + 0.2]])}" fill="${ROOM.wallShade}"/>`);
    }
    S.add(`<path d="${q([[tx0 - 0.35, 2.6, gz - 0.22], [tx0 - 0.35, 2.82, gz - 0.22], [tx1 + 0.35, 2.82, gz - 0.22], [tx1 + 0.35, 2.6, gz - 0.22]])}" fill="${ROOM.beam}"/>`);
    // the gate: planks with two iron straps, hanging a little above the trough floor on its chain
    const g0 = 0.15, g1 = 1.95;
    S.add(`<path d="${q([[tx0, g0, gz], [tx0, g1, gz], [tx1, g1, gz], [tx1, g0, gz]])}" fill="${ROOM.wood}"/><path d="${q([[tx0, g0, gz], [tx0, g1, gz], [tx0 + 0.25, g1, gz], [tx0 + 0.25, g0, gz]])}" fill="${ROOM.woodLit}"/>`);
    let gp = '';
    for (let x = tx0 + 0.3; x < tx1; x += 0.3) gp += pl(pr.poly([[x, g0, gz], [x, g1, gz]]));
    S.add(`<path d="${gp}" stroke="${ROOM.woodShade}" stroke-width="2"/><path d="${q([[tx0, 0.4, gz], [tx0, 0.52, gz], [tx1, 0.52, gz], [tx1, 0.4, gz]])}${q([[tx0, 1.55, gz], [tx0, 1.67, gz], [tx1, 1.67, gz], [tx1, 1.55, gz]])}" fill="${ROOM.iron}"/>`);
    S.add(`<path d="${q([[tx0, g0, gz], [tx0, g0 + 0.12, gz], [tx1, g0 + 0.12, gz], [tx1, g0, gz]])}" fill="#262c2e"/>`);
    // a gap under the gate where the water runs through
    S.add(`<path d="${pl(pr.poly([[tx0 + 0.1, -0.06, gz - 0.05], [tx1 - 0.1, -0.06, gz - 0.05]]))}" stroke="${ROOM.waterLit}" stroke-width="2" opacity=".7"/>`);
    // the gate's ring and chain up to the pulley under the ceiling beam
    const ring = pr((tx0 + tx1) / 2, g1 + 0.05, gz), pul = pr((tx0 + tx1) / 2, CEIL - 0.35, gz - 0.4);
    S.add(`<path d="M${r0(ring[0])},${r0(ring[1])}L${r0(pul[0])},${r0(pul[1])}" stroke="${ROOM.iron}" stroke-width="5" stroke-dasharray="8 3"/><circle cx="${r0(pul[0])}" cy="${r0(pul[1])}" r="14" fill="none" stroke="${ROOM.iron}" stroke-width="5"/><circle cx="${r0(ring[0])}" cy="${r0(ring[1])}" r="9" fill="none" stroke="${ROOM.iron}" stroke-width="4"/>`);
    { const pb = pr(-0.6, CEIL - 0.35, gz - 0.4), dd = pr(-2.7, 1.55, 3.5); S.add(`<path d="M${r0(pul[0] - 14)},${r0(pul[1])}L${r0(pb[0])},${r0(pb[1])}L${r0(dd[0])},${r0(dd[1])}" fill="none" stroke="${ROOM.iron}" stroke-width="5" stroke-dasharray="8 3"/><circle cx="${r0(pb[0])}" cy="${r0(pb[1])}" r="12" fill="none" stroke="${ROOM.iron}" stroke-width="5"/>`); }
  }

  // --- the ladder up the left wall to the roof hatch ---------------------------------------------------------------
  {
    const lx = X0 + 0.25, z0 = 4.3, z1 = 4.9;
    const rails = pl(pr.poly([[lx, 0, z0], [lx, CEIL, z0]])) + pl(pr.poly([[lx, 0, z1], [lx, CEIL, z1]]));
    let rungs = '';
    for (let y = 0.3; y < CEIL; y += 0.32) rungs += pl(pr.poly([[lx, y, z0], [lx, y, z1]]));
    S.add(`<path d="${rungs}" stroke="${ROOM.woodShade}" stroke-width="7"/><path d="${rails}" stroke="${ROOM.wood}" stroke-width="12"/><path d="${rails}" stroke="${ROOM.woodLit}" stroke-width="3" opacity=".7" transform="translate(-4 0)"/>`);
  }

  // --- the winch on its stone bench (left): two cheeks, the drum with the chain, the crank, the big gear and pawl ----
  {
    const bz0 = 3.1, bz1 = 4.0, bx0 = -3.6, bx1 = -1.5, bh = 0.62;
    // stone bench
    S.add(`<path d="${q([[bx0, bh, bz0], [bx0, bh, bz1], [bx1, bh, bz1], [bx1, bh, bz0]])}" fill="${ROOM.wallLit}"/><path d="${q([[bx0, 0, bz0], [bx0, bh, bz0], [bx1, bh, bz0], [bx1, 0, bz0]])}" fill="${ROOM.wall}"/><path d="${q([[bx1, 0, bz0], [bx1, bh, bz0], [bx1, bh, bz1], [bx1, 0, bz1]])}" fill="${ROOM.wallShade}"/>`);
    S.add(`<path d="${pl(pr.poly([[bx0, bh, bz0], [bx1, bh, bz0]]))}" stroke="#c8c2b4" stroke-width="2.4" opacity=".8"/>`);
    let bc = '';
    for (const y of [0.2, 0.42]) bc += pl(pr.poly([[bx0, y, bz0], [bx1, y, bz0]]));
    for (const x of [-3.0, -2.4, -1.9]) bc += pl(pr.poly([[x, 0, bz0], [x, bh, bz0]]));
    S.add(`<path d="${bc}" stroke="${ROOM.course}" stroke-width="1.6" opacity=".5"/>`);
    // two timber cheeks (A-frames) standing on the bench
    const cz = 3.5;
    for (const x of [-3.3, -2.1]) {
      S.add(`<path d="${pz([pr(x - 0.25, bh, cz), pr(x - 0.05, 1.5, cz), pr(x + 0.05, 1.5, cz), pr(x + 0.25, bh, cz), pr(x + 0.12, bh, cz), pr(x, 1.3, cz), pr(x - 0.12, bh, cz)])}" fill="${ROOM.woodShade}"/>`);
    }
    // the drum between the cheeks with the chain wound on it
    const d0 = pr(-3.3, 1.35, cz), d1 = pr(-2.1, 1.35, cz), dr = 0.2 * k(cz);
    S.add(`<path d="M${r0(d0[0])},${r0(d0[1] - dr)}H${r0(d1[0])}V${r0(d1[1] + dr)}H${r0(d0[0])}Z" fill="${ROOM.wood}"/><path d="M${r0(d0[0])},${r0(d0[1] - dr)}H${r0(d1[0])}" stroke="${ROOM.woodLit}" stroke-width="3"/>`);
    let ch = '';
    for (let x = d0[0] + 8; x < d1[0] - 4; x += 9) ch += `M${r0(x)},${r0(d0[1] - dr + 4)}l4,${r0(dr * 2 - 8)}`;
    S.add(`<path d="${ch}" stroke="${ROOM.iron}" stroke-width="4"/>`);
    // the axle through the right cheek to the big gear on its seat, the pawl dropped into its teeth
    const gc = pr(-1.8, 1.35, cz), gr = 0.4 * k(cz);
    S.add(`<path d="${pz([pr(-2.0, bh, cz + 0.1), pr(-1.9, 0.95, cz + 0.1), pr(-1.7, 0.95, cz + 0.1), pr(-1.6, bh, cz + 0.1)])}" fill="${ROOM.iron}"/>`); // the gear seat (cast iron foot)
    let teeth = '';
    const nT = 24;
    for (let i = 0; i < nT; i++) { const a0 = i / nT * Math.PI * 2, a1 = a0 + Math.PI / nT; teeth += `M${r0(gc[0] + Math.cos(a0) * gr * 0.86)},${r0(gc[1] + Math.sin(a0) * gr * 0.86)}L${r0(gc[0] + Math.cos(a0 + 0.04) * gr)},${r0(gc[1] + Math.sin(a0 + 0.04) * gr)}L${r0(gc[0] + Math.cos(a1 - 0.04) * gr)},${r0(gc[1] + Math.sin(a1 - 0.04) * gr)}L${r0(gc[0] + Math.cos(a1) * gr * 0.86)},${r0(gc[1] + Math.sin(a1) * gr * 0.86)}Z`; }
    S.add(`<path d="${teeth}" fill="${ROOM.iron}"/><circle cx="${r0(gc[0])}" cy="${r0(gc[1])}" r="${f(gr * 0.88)}" fill="${ROOM.iron}"/><circle cx="${r0(gc[0])}" cy="${r0(gc[1])}" r="${f(gr * 0.6)}" fill="#3e424a"/>`);
    let spokes = '';
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3; spokes += `M${r0(gc[0])},${r0(gc[1])}l${f(Math.cos(a) * gr * 0.6)},${f(Math.sin(a) * gr * 0.6)}`; }
    S.add(`<path d="${spokes}" stroke="${ROOM.iron}" stroke-width="7"/><circle cx="${r0(gc[0])}" cy="${r0(gc[1])}" r="${f(gr * 0.14)}" fill="${ROOM.ironLit}"/>`);
    S.add(`<path d="M${r0(gc[0] - gr * 0.95)},${r0(gc[1] - gr * 0.2)}A${f(gr)},${f(gr)} 0 0 1 ${r0(gc[0] - gr * 0.2)},${r0(gc[1] - gr * 0.97)}" fill="none" stroke="${ROOM.ironLit}" stroke-width="2.4" opacity=".8"/>`);
    // the ratchet pawl: a short iron tongue on a pivot above the gear, its tip in a notch
    const pv = [gc[0] + gr * 0.9, gc[1] - gr * 1.25];
    S.add(`<path d="M${r0(pv[0] - 6)},${r0(pv[1] - 4)}L${r0(gc[0] + gr * 0.58)},${r0(gc[1] - gr * 0.86)}l8,-2L${r0(pv[0] + 6)},${r0(pv[1] + 4)}Z" fill="#4e525a"/><circle cx="${r0(pv[0])}" cy="${r0(pv[1])}" r="6" fill="${ROOM.ironLit}"/><path d="M${r0(pv[0])},${r0(pv[1])}l18,-26" stroke="${ROOM.iron}" stroke-width="5"/>`);
    // the crank handle on the near side
    const ck = pr(-3.5, 1.35, cz);
    S.add(`<path d="M${r0(ck[0])},${r0(ck[1])}l-30,40" stroke="${ROOM.iron}" stroke-width="7" stroke-linecap="round"/><path d="M${r0(ck[0] - 30)},${r0(ck[1] + 40)}l-6,24" stroke="${ROOM.woodLit}" stroke-width="10" stroke-linecap="round"/>`);
  }

  // --- grading: cold dawn, dark corners, the calm floor under the dialogue box -------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#c8d4f0', 0.08], [0.5, '#c8d4f0', 0], [1, '#0a0c12', 0.3]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.4, '#0c0e12', 0], [1, '#0c0e12', 0.7]], 'cx="0.5" cy="0.45" r="0.75"')}"/>`);
  S.add(`<rect y="610" width="${W}" height="290" fill="${S.lin([[0, '#0c0e12', 0], [1, '#0c0e12', 0.66]])}"/>`);
  return S.out();
}

export const tideBgs = {
  'tide-station-dawn': () => tideStation(false),
  'tide-station-predawn': () => tideStation(true),
  'tide-station-room': tideRoom,
};
