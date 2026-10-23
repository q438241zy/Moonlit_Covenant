// 雾港·冒险者公会分会 (chapter 15; script 15 美術需求):
//   fog-harbor-guild-dock — 分会门前的码头·午后 (15-09 … 15-12): the guild's wooden front square to us at the end of a
//                           plank dock — two storeys of weathered boards on a stone plinth, a heavy door under a small
//                           awning, shuttered windows, the guild's hanging board (the sword-and-bell emblem, no text) —
//                           and beside it the guild's shed with its big double door, one leaf swung half open: inside,
//                           in the lamp light, folded blankets stacked high. On the dock: mooring bollards along the
//                           edge, a wooden cargo boom (吊杆) leaning out over the water with a net bundle on its hook, a
//                           tide-lamp post, fishing nets hung to dry on a rack, crates and a coil of rope. To the left,
//                           the high tide — grey-green water lapping just under the planks — and the harbour fading into
//                           the fog. Afternoon, overcast, warm grey light from the upper left. No figures.
//   fog-harbor-guild-shed — 分会的仓内 (15-08, optional): see guildShed().
// Water is flat colour with current streaks, never a reflection (coast.mjs house rules); no text on the sign.
import { Scene, W, H, f, pz, pl, persp, mix, rng } from './lib.mjs';
import { currents, tideLamp, sag } from './coast.mjs';
import { swordBell } from './bg-town.mjs';

const r0 = (v) => f(v, 0);
const f1 = (v) => f(v, 1);
const pz1 = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L') + 'Z';
const pl1 = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L');

const D = {
  sky: [[0, '#a8b0b0'], [0.5, '#c8c8be'], [1, '#d8d2c2']],
  fog: '#d4d2c6', far: '#8e9690',
  water: '#5e7268', waterFar: '#8a9a92', waterDeep: '#3e5048', waterHi: '#c8d4c8',
  board: { lit: '#9a8a72', mid: '#7a6c58', shade: '#544a3e', deep: '#2e2822', line: '#3e362e' },
  boardOld: { lit: '#8a8478', mid: '#6a665c', shade: '#4a4740', deep: '#2a2824', line: '#36332e' },
  plank: { lit: '#a8987c', mid: '#857660', shade: '#5e5444', joint: '#3a3228' },
  stone: { lit: '#aaa69a', mid: '#86827a', shade: '#5a5852', joint: '#3e3c38' },
  roof: '#4e5258', roofLit: '#6e727a', roofShade: '#34383e',
  glass: '#3c424a', glassHi: '#9aa6b0', shutter: '#5a6a6a',
  iron: '#2a2c2e', rope: '#a89a7a', ropeShade: '#6e624c', net: '#6e7468',
  banner: '#2e3e5a', lamp: { iron: '#2a2c2e', glass: '#56606a', glint: '#c8d4dc', glow: '#ffd28a', core: '#fff2c8' },
  blankets: ['#6e6252', '#8a5e4a', '#5a6066', '#7a6a5a', '#4e5a52', '#8e8270', '#6a5448'],
  crate: { lit: '#a08a68', mid: '#7a684e', shade: '#54483a' },
  warm: '#ffcf8a',
};

const VP = [700, 404], F = 900, EYE = 1.6;
const pr = persp({ vp: VP, F, eye: EYE });
const P = (x, y, z) => pr(x, y, z);
const FZ = 12; // the building fronts
const EDGE = -3.2, WY = -0.5; // the dock's water edge, the water level (high tide, just under the planks)
const fogK = (z) => Math.min(1, Math.max(0, (z - 10) / 60)); // how much fog a thing at depth z takes

function guildDock() {
  const S = new Scene('sbGuildDock', '雾港·分会门前的码头·午后：码头木栈道的尽头是冒险者公会分会的木造门面，两层旧木板墙、石砌墙基，挂着画有剑与铃纹章的招牌，门上一个小雨棚；门旁分会的仓，两扇大门开了一扇，灯光里看得见里面叠得高高的毯子；栈道上有缆桩、伸到水上的木吊杆和吊钩上的一捆渔网、潮灯柱、晾着的渔网、木箱和一盘缆绳；左边是涨潮的灰绿海水，几乎漫到栈道下，远处的港口隐在雾里；阴天午后，不画人', 8101);
  const R = rng(8102);

  // --- sky and the far harbour in the fog ---------------------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(D.sky, `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${VP[1]}"`)}"/>`);
  S.add(`<ellipse cx="300" cy="120" rx="520" ry="200" fill="${S.rad([[0, '#f4ecd8', 0.55], [1, '#f4ecd8', 0]])}"/>`);
  {
    // far stilt houses and piers along the horizon: flat silhouettes, two depths
    for (const [z, col, seed] of [[70, mix(D.far, D.fog, 0.55), 8103], [42, mix(D.far, D.fog, 0.25), 8104]]) {
      const Rf = rng(seed);
      let d = '', piles = '';
      for (let x = -40; x < 640;) {
        const w = Rf.range(40, 90) * (42 / z) * 1.6, h = Rf.range(30, 70) * (42 / z) * 1.4, base = P(0, 0.8, z)[1];
        d += `M${f1(x)},${f1(base)}V${f1(base - h)}l${f1(w * 0.5)},${f1(-h * 0.3)}l${f1(w * 0.5)},${f1(h * 0.3)}V${f1(base)}Z`;
        for (let k = 0; k < 3; k++) piles += `M${f1(x + w * (0.15 + k * 0.35))},${f1(base)}v${f1(14 * 42 / z)}`;
        x += w + Rf.range(4, 40);
      }
      S.add(`<path d="${d}" fill="${col}"/><path d="${piles}" stroke="${col}" stroke-width="2.4"/>`);
    }
    // two masts out on the water
    for (const [x, z, h] of [[-14, 34, 9], [-8, 50, 11]]) { const a = P(x, 0, z), b = P(x, h, z); S.add(`<path d="M${f1(a[0])},${f1(a[1])}V${f1(b[1])}M${f1(a[0] - 12)},${f1(b[1] + 18)}h24" stroke="${mix(D.far, D.fog, 0.4)}" stroke-width="2.4"/><path d="M${f1(a[0] - 26)},${f1(a[1])}h52l-8,8h-36z" fill="${mix(D.far, D.fog, 0.35)}"/>`); }
    S.add(`<rect x="0" y="${VP[1] - 60}" width="760" height="90" fill="${S.lin([[0, D.fog, 0], [0.5, D.fog, 0.6], [1, D.fog, 0.2]])}"/>`);
  }

  // --- the water (left), up to the dock edge -----------------------------------------------------------------------
  {
    const edgeFar = P(EDGE, 0, FZ + 0.5), edgeNear = P(EDGE, 0, 2.0);
    const top = P(0, WY, 80)[1];
    S.add(`<path d="M0,${f1(top)}H${f1(edgeFar[0] + 200)}L${f1(edgeFar[0])},${f1(edgeFar[1])}L${f1(edgeNear[0])},${f1(edgeNear[1])}L0,${H}Z" fill="${S.lin([[0, D.waterFar], [0.25, D.water], [1, D.waterDeep]], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(top)}" x2="0" y2="${H}"`)}"/>`);
    S.add(currents(rng(8105), 0, 560, top + 6, 880, 60, D.waterHi, 0.35, 1));
    // the dark band of the dock's side and piles just above the water
    const a = P(EDGE, 0, FZ + 0.5), b = P(EDGE, 0, 2.0), a2 = P(EDGE, WY, FZ + 0.5), b2 = P(EDGE, WY, 2.0);
    S.add(`<path d="${pz1([a, b, b2, a2])}" fill="${D.plank.shade}"/>`);
    let pls = '';
    for (let z = 2.6; z < FZ; z += 1.5) { const t = P(EDGE - 0.02, 0, z), u = P(EDGE - 0.02, WY, z); pls += `M${f1(t[0])},${f1(t[1])}L${f1(u[0])},${f1(u[1])}`; }
    S.add(`<path d="${pls}" stroke="${D.plank.joint}" stroke-width="5"/><path d="${pl1([a2, b2])}" stroke="#2e3a34" stroke-width="5" opacity=".7"/><path d="${pl1([a2, b2].map(([x, y]) => [x - 4, y + 4]))}" stroke="${D.waterHi}" stroke-width="2" opacity=".5"/>`);
  }

  // --- the dock: planks across, the edge timber -------------------------------------------------------------------
  {
    const deck = pz1([P(EDGE, 0, 1.6), P(EDGE, 0, FZ), P(13, 0, FZ), P(13, 0, 1.6)]);
    S.add(`<path d="${deck}" fill="${S.lin([[0, D.plank.mid], [1, D.plank.shade]], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(P(0, 0, FZ)[1])}" x2="0" y2="${H}"`)}"/>`);
    let seams = '', lit = '', butts = '';
    for (let z = 1.8, k = 0; z < FZ; z += 0.32, k++) {
      seams += pl1([P(EDGE, 0, z), P(13, 0, z)]);
      if (k % 3 === 0) lit += pl1([P(EDGE, 0, z + 0.04), P(13, 0, z + 0.04)]);
      const xb = -2.6 + ((k * 2.3) % 4.4);
      for (let x = xb; x < 13; x += 4.4) butts += pl1([P(x, 0, z), P(x, 0, z + 0.32)]);
    }
    S.add(`<path d="${seams}" stroke="${D.plank.joint}" stroke-width="1.6" opacity=".7"/><path d="${lit}" stroke="${D.plank.lit}" stroke-width="1.2" opacity=".35"/><path d="${butts}" stroke="${D.plank.joint}" stroke-width="1.4" opacity=".55"/>`);
    // wet patches where the tide splashed over the edge
    let wet = '';
    for (let i = 0; i < 7; i++) { const z = R.range(2.5, 10), x = EDGE + R.range(0, 1.2), w = R.range(0.6, 1.4), d = R.range(0.4, 1); wet += pz1([P(x, 0, z), P(x + w, 0, z + 0.1), P(x + w * 0.8, 0, z + d), P(x, 0, z + d * 0.8)]); }
    S.add(`<path d="${wet}" fill="${D.plank.joint}" opacity=".16"/>`);
    // the edge timber (a kerb) along the water
    S.add(`<path d="${pz1([P(EDGE, 0, 1.6), P(EDGE, 0.16, 1.6), P(EDGE, 0.16, FZ), P(EDGE, 0, FZ)])}" fill="${D.board.mid}"/><path d="${pz1([P(EDGE, 0.16, 1.6), P(EDGE + 0.22, 0.16, 1.6), P(EDGE + 0.22, 0.16, FZ), P(EDGE, 0.16, FZ)])}" fill="${D.plank.lit}"/>`);
    // the dock's end beyond the guild's left corner: a short rail
    let rail = '';
    for (const x of [EDGE, -2.0, -0.8]) { const a = P(x, 0, FZ), b = P(x, 1.0, FZ); rail += `M${f1(a[0])},${f1(a[1])}V${f1(b[1])}`; }
    rail += pl1([P(EDGE, 1.0, FZ), P(-0.6, 1.0, FZ)]) + pl1([P(EDGE, 0.55, FZ), P(-0.6, 0.55, FZ)]);
    S.add(`<path d="${rail}" stroke="${D.board.shade}" stroke-width="4"/>`);
  }

  // --- the guild front ----------------------------------------------------------------------------------------------
  const GX0 = -0.6, GX1 = 5.4, GH = 6.0;
  {
    const q = (x0, y0, x1, y1, z = FZ) => pz1([P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)]);
    // roof: the eave band projecting, the slope going back
    S.add(`<path d="${pz1([P(GX0 - 0.5, GH, FZ - 0.6), P(GX1 + 0.5, GH, FZ - 0.6), P(GX1 + 0.3, GH + 2.2, FZ + 2.5), P(GX0 - 0.3, GH + 2.2, FZ + 2.5)])}" fill="${D.roof}"/>`);
    let tiles = '';
    for (let t = 0.15; t < 1; t += 0.14) tiles += pl1([P(GX0 - 0.5 + 0.2 * t, GH + 2.2 * t, FZ - 0.6 + 3.1 * t), P(GX1 + 0.5 - 0.2 * t, GH + 2.2 * t, FZ - 0.6 + 3.1 * t)]);
    S.add(`<path d="${tiles}" stroke="${D.roofShade}" stroke-width="2" opacity=".7"/>`);
    // a chimney
    S.add(`<path d="${q(3.8, GH + 0.6, 4.5, GH + 2.6, FZ + 1.2)}" fill="${D.stone.mid}"/><path d="${q(3.7, GH + 2.5, 4.6, GH + 2.75, FZ + 1.2)}" fill="${D.stone.shade}"/>`);
    // walls: boards on a stone plinth
    S.add(`<path d="${q(GX0, 0.55, GX1, GH)}" fill="${D.board.mid}"/><path d="${q(GX0, 0, GX1, 0.55)}" fill="${D.stone.mid}"/>`);
    let bl = '';
    for (let x = GX0 + 0.22; x < GX1; x += 0.22) bl += pl1([P(x, 0.55, FZ), P(x, GH, FZ)]);
    S.add(`<path d="${bl}" stroke="${D.board.line}" stroke-width="1.2" opacity=".5"/>`);
    // timber frame: corner posts, the floor beam between storeys, the eave fascia
    S.add(`<path d="${q(GX0, 0.55, GX0 + 0.28, GH)}${q(GX1 - 0.28, 0.55, GX1, GH)}${q(GX0, 3.0, GX1, 3.24)}" fill="${D.board.shade}"/><path d="${q(GX0 - 0.5, GH - 0.1, GX1 + 0.5, GH + 0.18, FZ - 0.6)}" fill="${D.board.deep}"/>`);
    let st = '';
    for (let x = GX0 + 0.4; x < GX1; x += 0.7) st += pl1([P(x, 0, FZ), P(x, 0.55, FZ)]);
    S.add(`<path d="${st}${pl1([P(GX0, 0.28, FZ), P(GX1, 0.28, FZ)])}" stroke="${D.stone.joint}" stroke-width="1.4" opacity=".6"/>`);
    // windows: glass, frames, open shutters
    const win = (x0, y0, x1, y1) => {
      let s = `<path d="${q(x0, y0, x1, y1)}" fill="${D.glass}"/>`;
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      s += `<path d="${pl1([P(mx, y0, FZ), P(mx, y1, FZ)])}${pl1([P(x0, my, FZ), P(x1, my, FZ)])}" stroke="${D.board.deep}" stroke-width="3"/>`;
      s += `<path d="${pz1([P(x0 + 0.05, y1 - 0.1, FZ), P(x0 + 0.28, y1 - 0.1, FZ), P(x0 + 0.05, my + 0.1, FZ)])}" fill="${D.glassHi}" opacity=".45"/>`;
      s += `<path d="${q(x0 - 0.42, y0, x0 - 0.04, y1)}${q(x1 + 0.04, y0, x1 + 0.42, y1)}" fill="${D.shutter}"/>`;
      s += `<path d="${q(x0 - 0.12, y0 - 0.12, x1 + 0.12, y0)}" fill="${D.board.deep}"/>`;
      return s;
    };
    S.add(win(-0.05, 1.0, 1.0, 2.2) + win(3.6, 1.0, 4.7, 2.2) + win(-0.05, 3.7, 0.95, 5.0) + win(2.0, 3.7, 3.0, 5.0) + win(4.0, 3.7, 4.9, 5.0));
    // the door: a step, the heavy plank door with iron straps, the little awning on two brackets
    S.add(`<path d="${q(1.45, 0, 2.95, 0.2, FZ - 0.25)}" fill="${D.stone.lit}"/><path d="${q(1.6, 0.2, 2.8, 2.55)}" fill="${D.board.deep}"/><path d="${q(1.7, 0.25, 2.7, 2.5)}" fill="#4a3c30"/>`);
    let dp = '';
    for (let x = 1.85; x < 2.7; x += 0.17) dp += pl1([P(x, 0.25, FZ), P(x, 2.5, FZ)]);
    S.add(`<path d="${dp}" stroke="#2e2620" stroke-width="1.4" opacity=".7"/><path d="${pl1([P(1.7, 0.8, FZ), P(2.7, 0.8, FZ)])}${pl1([P(1.7, 2.0, FZ), P(2.7, 2.0, FZ)])}" stroke="${D.iron}" stroke-width="4"/>`);
    const ring = P(2.52, 1.35, FZ);
    S.add(`<circle cx="${f1(ring[0])}" cy="${f1(ring[1])}" r="5" fill="none" stroke="#b8a070" stroke-width="2"/>`);
    S.add(`<path d="${pz1([P(1.35, 2.75, FZ - 0.05), P(3.05, 2.75, FZ - 0.05), P(3.05, 2.6, FZ - 0.8), P(1.35, 2.6, FZ - 0.8)])}" fill="${D.roofLit}"/><path d="${pz1([P(1.35, 2.6, FZ - 0.8), P(3.05, 2.6, FZ - 0.8), P(3.05, 2.5, FZ - 0.8), P(1.35, 2.5, FZ - 0.8)])}" fill="${D.roofShade}"/>`);
    // the guild's hanging board on an iron bracket by the door, the emblem painted on it (no text)
    const br0 = P(3.25, 3.4, FZ), br1 = P(3.25, 3.4, FZ - 1.2);
    S.add(`<path d="M${f1(br0[0])},${f1(br0[1])}L${f1(br1[0])},${f1(br1[1])}M${f1(br0[0])},${f1(br0[1] + 22)}L${f1((br0[0] + br1[0]) / 2)},${f1(br1[1])}" stroke="${D.iron}" stroke-width="3"/>`);
    const bc = P(3.25, 2.95, FZ - 0.8), bw = 46, bh = 58;
    S.add(`<path d="M${f1(bc[0] - 12)},${f1(br1[1])}v${f1(bc[1] - bh / 2 - br1[1])}M${f1(bc[0] + 12)},${f1(br1[1])}v${f1(bc[1] - bh / 2 - br1[1])}" stroke="${D.iron}" stroke-width="1.6"/>`);
    S.add(`<path d="M${f1(bc[0] - bw / 2)},${f1(bc[1] - bh / 2)}h${bw}v${bh - 10}l${f1(-bw / 2)},10l${f1(-bw / 2)},-10z" fill="${D.banner}" stroke="#c8a860" stroke-width="2"/>${swordBell(bc[0], bc[1] - 2, 0.55)}`);
    // a tide lamp by the door (unlit in the day)
    const lp = P(1.25, 2.3, FZ - 0.1);
    S.add(tideLamp(lp[0], lp[1], 1.3, D.lamp, false));
    // a few notices pinned beside the door (pale scraps, no writing)
    let nt = '';
    for (const [x, y, w, h] of [[0.15, 0.62, 0.35, 0.3], [0.62, 0.66, 0.3, 0.26]]) nt += q(x, y, x + w, y + h);
    S.add(`<path d="${nt}" fill="#e6dfcc" opacity=".85"/>`);
    // daylight from the upper left across the front, the plinth darker
    S.add(`<path d="${q(GX0, 0, GX1, GH)}" fill="${S.lin([[0, '#fff2d8', 0.14], [1, '#fff2d8', 0]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  }

  // --- the shed: weathered boards, the double door, one leaf open, blankets inside -----------------------------------
  const SX0 = GX1, SX1 = 11.2, SH = 4.8, DX0 = 6.5, DX1 = 9.3, DH = 3.5;
  {
    const q = (x0, y0, x1, y1, z = FZ) => pz1([P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)]);
    S.add(`<path d="${pz1([P(SX0, SH, FZ - 0.4), P(SX1 + 0.4, SH, FZ - 0.4), P(SX1 + 0.4, SH + 1.4, FZ + 2.4), P(SX0, SH + 1.4, FZ + 2.4)])}" fill="${D.roofShade}"/>`);
    S.add(`<path d="${q(SX0, 0, SX1, SH)}" fill="${D.boardOld.mid}"/>`);
    let bl = '';
    for (let y = 0.3; y < SH; y += 0.3) bl += pl1([P(SX0, y, FZ), P(SX1, y, FZ)]);
    S.add(`<path d="${bl}" stroke="${D.boardOld.line}" stroke-width="1.3" opacity=".55"/><path d="${q(SX0, SH - 0.1, SX1 + 0.4, SH + 0.14, FZ - 0.4)}" fill="${D.board.deep}"/>`);
    // the interior: dark, lamp-warm toward the back, the blankets stacked against the far wall
    S.add(`<path d="${q(DX0, 0, DX1, DH)}" fill="#14110e"/>`);
    const lampIn = P(7.6, 2.6, FZ + 3.2);
    const inner = S.clip(q(DX0, 0, DX1, DH));
    let stacks = '';
    const RB = rng(8106);
    for (const [x0, x1, z, n] of [[7.0, 8.0, FZ + 2.6, 13], [7.5, 8.5, FZ + 2.9, 10], [7.0, 7.9, FZ + 0.9, 6]]) {
      let y = 0;
      for (let k = 0; k < n; k++) {
        const th = RB.range(0.16, 0.24), sh = RB.range(-0.05, 0.05), col = D.blankets[(k + Math.round(x0 * 3)) % D.blankets.length];
        stacks += `<path d="${pz1([P(x0 + sh, y, z), P(x1 + sh, y, z), P(x1 + sh + 0.03, y + th, z), P(x0 + sh - 0.02, y + th, z)])}" fill="${col}"/>`;
        stacks += `<path d="${pl1([P(x0 + sh, y + th * 0.5, z), P(x1 + sh, y + th * 0.5, z)])}" stroke="#2a241e" stroke-width="1" opacity=".5"/>`;
        y += th;
      }
    }
    S.add(`<g clip-path="${inner}"><circle cx="${f1(lampIn[0])}" cy="${f1(lampIn[1])}" r="190" fill="${S.rad([[0, D.warm, 0.45], [0.4, '#c8884a', 0.18], [1, '#c8884a', 0]])}"/>${stacks}<rect width="${W}" height="${H}" fill="${S.rad([[0, D.warm, 0.18], [1, D.warm, 0]], `gradientUnits="userSpaceOnUse" cx="${r0(lampIn[0])}" cy="${r0(lampIn[1])}" r="160"`)}"/>${tideLamp(lampIn[0], lampIn[1] - 10, 0.9, D.lamp, true)}</g>`);
    // door frame; the right leaf shut (planks with a Z brace), the left leaf swung out toward us
    S.add(`<path d="${q(DX0 - 0.16, 0, DX0, DH + 0.16)}${q(DX1, 0, DX1 + 0.16, DH + 0.16)}${q(DX0 - 0.16, DH, DX1 + 0.16, DH + 0.2)}" fill="${D.board.shade}"/>`);
    const mid = (DX0 + DX1) / 2;
    S.add(`<path d="${q(mid, 0.02, DX1, DH)}" fill="${D.boardOld.mid}"/>`);
    let lp = '';
    for (let x = mid + 0.2; x < DX1; x += 0.2) lp += pl1([P(x, 0.02, FZ), P(x, DH, FZ)]);
    lp += pl1([P(mid + 0.05, 0.4, FZ), P(DX1 - 0.05, 0.4, FZ)]) + pl1([P(mid + 0.05, DH - 0.4, FZ), P(DX1 - 0.05, DH - 0.4, FZ)]) + pl1([P(mid + 0.05, 0.4, FZ), P(DX1 - 0.05, DH - 0.4, FZ)]);
    S.add(`<path d="${lp}" stroke="${D.boardOld.line}" stroke-width="2.2" opacity=".75"/>`);
    // the open leaf: hinged at DX0, swung out 36°
    const a = 36 * Math.PI / 180, Lf = mid - DX0, ex = DX0 - Lf * Math.cos(a), ez = FZ - Lf * Math.sin(a);
    const leaf = pz1([P(DX0, 0.02, FZ), P(DX0, DH, FZ), P(ex, DH, ez), P(ex, 0.02, ez)]);
    S.add(`<path d="${leaf}" fill="${D.boardOld.lit}"/>`);
    let ll = '';
    for (let t = 0.14; t < 1; t += 0.14) { const x = DX0 - Lf * t * Math.cos(a), z = FZ - Lf * t * Math.sin(a); ll += pl1([P(x, 0.02, z), P(x, DH, z)]); }
    ll += pl1([P(DX0, 0.4, FZ), P(ex, 0.4, ez)]) + pl1([P(DX0, DH - 0.4, FZ), P(ex, DH - 0.4, ez)]) + pl1([P(DX0, 0.4, FZ), P(ex, DH - 0.4, ez)]);
    S.add(`<path d="${ll}" stroke="${D.boardOld.shade}" stroke-width="2.4" opacity=".7"/><path d="${pl1([P(ex, 0.02, ez), P(ex, DH, ez)])}" stroke="${D.boardOld.deep}" stroke-width="3"/>`);
    // a warm spill of lamp light on the planks in front of the gap
    S.add(`<path d="${pz1([P(mid - 0.2, 0, FZ), P(DX0 + 0.1, 0, FZ), P(DX0 - 0.4, 0, FZ - 2.4), P(mid + 0.4, 0, FZ - 2.6)])}" fill="${D.warm}" opacity=".12"/>`);
    // the net rack against the shed wall to the right of the door: two posts and a pole, a net hung over it
    const n0 = P(9.7, 2.6, FZ - 0.3), n1 = P(11.0, 2.6, FZ - 0.3);
    S.add(`<path d="${pl1([P(9.7, 0, FZ - 0.3), n0])}${pl1([P(11.0, 0, FZ - 0.3), n1])}${pl1([n0, n1])}" stroke="${D.board.shade}" stroke-width="5"/>`);
    let net = '';
    const nb = (x) => { const t = (x - 9.65) / 1.4; return 0.4 + 0.5 * Math.sin(t * 9) * 0.3 + t * 0.2; };
    for (let x = 9.65; x <= 11.05; x += 0.1) net += pl1([P(x, 2.62, FZ - 0.32), P(x + 0.04, nb(x), FZ - 0.32)]);
    for (let y = 0.6; y < 2.6; y += 0.16) net += pl1(Array.from({ length: 15 }, (_, i) => { const x = 9.65 + i * 0.1; return P(x, Math.max(nb(x), y + 0.05 * Math.sin(i * 1.3)), FZ - 0.32); }));
    S.add(`<path d="${net}" fill="none" stroke="${D.net}" stroke-width="1.2" opacity=".85"/><path d="${pl1([n0, n1])}" stroke="${D.board.lit}" stroke-width="1.6" opacity=".6"/>`);
    // weather stain low on the shed boards
    S.add(`<path d="${q(SX0, 0, SX1, 0.5)}" fill="#2e2c28" opacity=".35"/>`);
  }

  // --- props on the dock (far to near) -----------------------------------------------------------------------------
  {
    // crates by the shed and a coil of rope
    const crate = (x, z, s) => {
      const a = P(x, 0, z), b = P(x + s, s, z), c = P(x + s, s, z + s);
      return `<path d="${pz1([a, [b[0], a[1]], b, [a[0], b[1]]])}" fill="${D.crate.mid}"/><path d="${pz1([[a[0], b[1]], b, c, P(x, s, z + s)])}" fill="${D.crate.lit}"/>`
        + `<path d="M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}M${f1(a[0])},${f1(b[1])}L${f1(b[0])},${f1(a[1])}" stroke="${D.crate.shade}" stroke-width="2"/>`;
    };
    S.add(crate(9.4, FZ - 1.6, 0.8) + crate(10.3, FZ - 1.4, 0.7));
    const coil = P(4.6, 0, FZ - 1.4);
    let cl = '';
    for (let k = 0; k < 4; k++) cl += `<ellipse cx="${f1(coil[0])}" cy="${f1(coil[1] - 3 - k * 3)}" rx="${f1(30 - k * 4)}" ry="${f1(8 - k)}"/>`;
    S.add(`<g fill="none" stroke="${D.rope}" stroke-width="4">${cl}</g><ellipse cx="${f1(coil[0])}" cy="${f1(coil[1] - 2)}" rx="30" ry="8" fill="none" stroke="${D.ropeShade}" stroke-width="2"/>`);
    // a fishing net heaped on the planks
    const hp = P(1.0, 0, FZ - 2.2);
    S.add(`<path d="M${f1(hp[0] - 60)},${f1(hp[1])}q20,-30 60,-28q40,-2 58,28z" fill="${D.net}" opacity=".9"/><path d="M${f1(hp[0] - 44)},${f1(hp[1] - 8)}q30,-20 70,-4M${f1(hp[0] - 30)},${f1(hp[1] - 18)}q24,-8 50,0" fill="none" stroke="#8e9488" stroke-width="1.4"/><g fill="#c8a860">${[-40, -10, 22, 46].map((d) => `<circle cx="${f1(hp[0] + d)}" cy="${f1(hp[1] - 4)}" r="4"/>`).join('')}</g>`);

    // the cargo boom: a mast at the edge, the boom leaning out over the water, a guy line, the hook with a net bundle
    const m0 = P(-2.4, 0, 8.6), m1 = P(-2.4, 4.8, 8.6), tip = P(-5.6, 4.2, 8.4), bootA = P(-2.4, 1.3, 8.6);
    S.add(`<path d="M${f1(m0[0] - 7)},${f1(m0[1])}L${f1(m1[0] - 5)},${f1(m1[1])}L${f1(m1[0] + 5)},${f1(m1[1])}L${f1(m0[0] + 7)},${f1(m0[1])}Z" fill="${D.board.mid}"/><path d="M${f1(m0[0] - 7)},${f1(m0[1])}L${f1(m1[0] - 5)},${f1(m1[1])}" stroke="${D.board.lit}" stroke-width="3"/>`);
    S.add(`<path d="M${f1(bootA[0])},${f1(bootA[1])}L${f1(tip[0])},${f1(tip[1])}" stroke="${D.board.shade}" stroke-width="9" stroke-linecap="round"/><path d="M${f1(bootA[0])},${f1(bootA[1] - 3)}L${f1(tip[0])},${f1(tip[1] - 3)}" stroke="${D.board.lit}" stroke-width="2.4" opacity=".7"/>`);
    S.add(`<path d="M${f1(m1[0])},${f1(m1[1])}L${f1(tip[0])},${f1(tip[1])}" stroke="${D.ropeShade}" stroke-width="2"/>`);
    const hookY = P(-5.6, 1.6, 8.4)[1];
    S.add(`<path d="M${f1(tip[0])},${f1(tip[1])}V${f1(hookY)}" stroke="${D.ropeShade}" stroke-width="2"/><path d="M${f1(tip[0])},${f1(hookY)}q0,10 -8,10q-6,0 -6,-6" fill="none" stroke="${D.iron}" stroke-width="3"/>`);
    S.add(`<path d="M${f1(tip[0] - 8)},${f1(hookY + 8)}q-26,10 -22,46q12,26 30,24q22,-2 26,-26q2,-34 -26,-44z" fill="${D.net}"/><path d="M${f1(tip[0] - 24)},${f1(hookY + 30)}q16,-6 36,4M${f1(tip[0] - 26)},${f1(hookY + 48)}q20,-4 40,4M${f1(tip[0] - 12)},${f1(hookY + 14)}l-4,60M${f1(tip[0] + 4)},${f1(hookY + 16)}l2,60" fill="none" stroke="#8e9488" stroke-width="1.3"/>`);
    // the winch drum at the mast's foot
    S.add(`<rect x="${f1(m0[0] + 6)}" y="${f1(m0[1] - 26)}" width="22" height="20" rx="4" fill="${D.board.deep}"/><path d="M${f1(m0[0] + 6)},${f1(m0[1] - 18)}h22" stroke="${D.rope}" stroke-width="3"/>`);

    // the tide-lamp post on the edge (unlit)
    const t0 = P(-2.75, 0, 6.6), t1 = P(-2.75, 3.4, 6.6), arm = P(-2.2, 3.3, 6.6);
    S.add(`<path d="M${f1(t0[0] - 5)},${f1(t0[1])}L${f1(t1[0] - 4)},${f1(t1[1])}H${f1(t1[0] + 4)}L${f1(t0[0] + 5)},${f1(t0[1])}Z" fill="${D.iron}"/><path d="M${f1(t1[0])},${f1(t1[1] + 6)}L${f1(arm[0])},${f1(arm[1] + 6)}" stroke="${D.iron}" stroke-width="4"/>${tideLamp(arm[0], arm[1] + 18, 1.6, D.lamp, false)}<circle cx="${f1(t1[0])}" cy="${f1(t1[1])}" r="6" fill="${D.iron}"/>`);

    // mooring bollards along the edge, one with a rope running down to the water
    for (const [z, rope] of [[10.4, false], [7.4, true], [5.0, false]]) {
      const b0 = P(-2.9, 0, z), b1 = P(-2.9, 0.55, z), w = 0.18 * F / z;
      S.add(`<path d="M${f1(b0[0] - w)},${f1(b0[1])}V${f1(b1[1] + w * 0.25)}h${f1(w * 2)}V${f1(b0[1])}Z" fill="${D.iron}"/><ellipse cx="${f1(b1[0])}" cy="${f1(b1[1] + w * 0.25)}" rx="${f1(w * 1.25)}" ry="${f1(w * 0.4)}" fill="#3e4244"/><path d="M${f1(b0[0] - w)},${f1(b0[1])}V${f1(b1[1] + w * 0.4)}" stroke="#6e7274" stroke-width="2" opacity=".7"/>`);
      if (rope) { const wa = P(-5.0, WY, z - 1.2); S.add(`<path d="${sag([b1[0], b1[1] + w * 0.6], wa, 18)}" fill="none" stroke="${D.rope}" stroke-width="3.4"/><path d="M${f1(b1[0] - w)},${f1(b1[1] + w * 0.6)}h${f1(w * 2)}" stroke="${D.rope}" stroke-width="4"/>`); }
    }
  }

  // --- grading: overcast, a little fog in the distance, the bottom quiet under the dialogue box ---------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#fff4e0', 0.08], [0.5, '#fff4e0', 0], [1, '#20262a', 0.25]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#22262a', 0], [1, '#22262a', 0.62]])}"/>`);
  return S.out();
}

// 分会的仓内 (15-08, optional in the script): a long wooden shed seen down its length — board walls on posts, tie beams
// and rafters under a pitched roof, a plank floor; along both walls a row of the guild's coarse blankets laid out on the
// floor (a dozen and more, rumpled, some folded back), a tide lamp hanging from the middle tie beam, its warm light
// falling off into the dark ends; a small high window at the far end lets in grey daylight. No figures.
function guildShed() {
  const S = new Scene('sbGuildShed', '雾港·分会的仓内：一座长条木仓，木板墙、立柱、横梁与屋椽，地上沿两边墙铺着十几张分会的粗毯子，有的揉皱、有的折起一角；中间的横梁上挂着一盏潮灯，暖光照到两头就暗下去；尽头高处一扇小窗透进灰白的天光；不画人', 8111);
  const pr2 = persp({ vp: [800, 392], F: 760, eye: 1.55 });
  const Q = (x, y, z) => pr2(x, y, z);
  const HW = 3.3, WH = 2.7, RH = 4.3, Z0 = 1.0, Z1 = 15.5;
  const LAMP = [0, 2.35, 6.2];
  const lk = (x, y, z) => { const d = Math.hypot(x - LAMP[0], y - LAMP[1], z - LAMP[2]); return 1 / (1 + (d / 3.2) ** 2); };
  const wood = (t) => (t > 0.5 ? mix(D.board.mid, '#b89468', Math.min(1, (t - 0.5) * 1.6)) : mix('#1a1612', D.board.mid, t / 0.5));
  S.add(`<rect width="${W}" height="${H}" fill="#0e0c0a"/>`);
  // walls, floor and roof in strips along z, each toned by the lamp
  const zs = []; for (let z = Z0; z < Z1; z += 0.9) zs.push(z); zs.push(Z1);
  for (let i = 0; i < zs.length - 1; i++) {
    const za = zs[i], zb = zs[i + 1], zm = (za + zb) / 2;
    for (const sd of [-1, 1]) {
      const t = lk(sd * HW, 1.4, zm) * (sd < 0 ? 1.05 : 0.9);
      S.add(`<path d="${pz1([Q(sd * HW, 0, za), Q(sd * HW, WH, za), Q(sd * HW, WH, zb), Q(sd * HW, 0, zb)])}" fill="${wood(t * 0.85)}" stroke="${wood(t * 0.85)}" stroke-width=".8"/>`);
      const tr = lk(sd * HW / 2, 3.4, zm) * 0.7;
      S.add(`<path d="${pz1([Q(sd * HW, WH, za), Q(0, RH, za), Q(0, RH, zb), Q(sd * HW, WH, zb)])}" fill="${wood(tr * 0.7)}" stroke="${wood(tr * 0.7)}" stroke-width=".8"/>`);
    }
    const tf = lk(0, 0, zm);
    S.add(`<path d="${pz1([Q(-HW, 0, za), Q(-HW, 0, zb), Q(HW, 0, zb), Q(HW, 0, za)])}" fill="${mix('#16120e', D.plank.mid, Math.min(1, tf * 1.1))}" stroke="${mix('#16120e', D.plank.mid, Math.min(1, tf * 1.1))}" stroke-width=".8"/>`);
  }
  // the far wall with the small high window
  {
    const t = lk(0, 1.5, Z1);
    S.add(`<path d="${pz1([Q(-HW, 0, Z1), Q(-HW, WH, Z1), Q(0, RH, Z1), Q(HW, WH, Z1), Q(HW, 0, Z1)])}" fill="${wood(t * 0.8)}"/>`);
    let bl = '';
    for (let x = -HW + 0.25; x < HW; x += 0.25) bl += pl1([Q(x, 0, Z1), Q(x, Math.min(RH - Math.abs(x) * (RH - WH) / HW, 4.3), Z1)]);
    S.add(`<path d="${bl}" stroke="${D.board.deep}" stroke-width="1" opacity=".45"/>`);
    S.add(`<path d="${pz1([Q(-1.7, 2.3, Z1), Q(-1.7, 2.9, Z1), Q(-0.8, 2.9, Z1), Q(-0.8, 2.3, Z1)])}" fill="#c8ccc8"/><path d="${pl1([Q(-1.25, 2.3, Z1), Q(-1.25, 2.9, Z1)])}${pl1([Q(-1.7, 2.6, Z1), Q(-0.8, 2.6, Z1)])}" stroke="${D.board.deep}" stroke-width="3"/>`);
    const wc = Q(-1.25, 2.6, Z1);
    S.add(`<path d="M${f1(wc[0] - 30)},${f1(wc[1] - 20)}L${f1(wc[0] + 30)},${f1(wc[1] - 20)}L${f1(wc[0] + 150)},${f1(Q(0, 0, Z1 - 4)[1])}L${f1(wc[0] - 90)},${f1(Q(0, 0, Z1 - 4)[1])}Z" fill="#dce2e0" opacity=".06"/>`);
  }
  // board lines on the side walls, floor planks, posts, tie beams and rafters
  {
    let bl = '', fl = '', posts = '', postLit = '', ties = '', raft = '';
    for (const sd of [-1, 1]) for (let y = 0.3; y < WH; y += 0.3) bl += pl1([Q(sd * HW, y, Z0), Q(sd * HW, y, Z1)]);
    for (let x = -HW + 0.3; x < HW; x += 0.3) fl += pl1([Q(x, 0, Z0), Q(x, 0, Z1)]);
    S.add(`<path d="${bl}" stroke="${D.board.deep}" stroke-width="1.2" opacity=".45"/><path d="${fl}" stroke="#14100c" stroke-width="1.3" opacity=".5"/>`);
    for (let z = 2.2; z < Z1; z += 2.6) {
      for (const sd of [-1, 1]) {
        const x = sd * (HW - 0.06), a = Q(x, 0, z), b = Q(x, WH, z), w = 0.13 * 760 / z;
        posts += pz1([[a[0] - w, a[1]], [a[0] + w, a[1]], [b[0] + w, b[1]], [b[0] - w, b[1]]]);
        postLit += pl1([[a[0] + (sd < 0 ? w : -w), a[1]], [b[0] + (sd < 0 ? w : -w), b[1]]]);
      }
      const t1 = Q(-HW, WH, z), t2 = Q(HW, WH, z), h = 0.16 * 760 / z;
      ties += pz1([t1, t2, [t2[0], t2[1] + h], [t1[0], t1[1] + h]]);
      raft += pl1([Q(-HW, WH, z), Q(0, RH, z), Q(HW, WH, z)]) + pl1([Q(0, RH, z), Q(0, WH, z)]);
    }
    S.add(`<path d="${raft}" fill="none" stroke="#1e1812" stroke-width="7"/><path d="${ties}" fill="#2a2018"/><path d="${posts}" fill="#2a2018"/><path d="${postLit}" stroke="#c89a62" stroke-width="2" opacity=".35"/>`);
  }
  // the blankets along both walls: rumpled rectangles across the floor, a fold turned back on some
  {
    const R = rng(8112);
    const items = [];
    for (const sd of [-1, 1]) for (let z = 3.1, k = 0; z < 12.6; z += R.range(1.0, 1.25), k++) items.push({ sd, z, k });
    items.sort((a, b) => b.z - a.z);
    for (const { sd, z, k } of items) {
      const xa = sd * (HW - 0.4), xb = sd * R.range(0.8, 1.2), zw = R.range(0.72, 0.86), zz = z + R.range(-0.08, 0.08);
      const col = D.blankets[(k * 3 + (sd > 0 ? 2 : 0)) % D.blankets.length];
      const t = Math.min(1, lk((xa + xb) / 2, 0, zz) * 1.4);
      const c = mix('#141210', col, 0.25 + t * 0.85), cs = mix('#0c0a08', col, 0.15 + t * 0.5);
      const corners = [[xa, zz], [xb, zz + R.range(-0.06, 0.06)], [xb + sd * R.range(-0.1, 0.05), zz + zw], [xa, zz + zw + R.range(-0.05, 0.05)]];
      const h = 0.05;
      const top = corners.map(([x, zq]) => Q(x, h, zq));
      S.add(`<path d="${pz1(top)}" fill="${c}"/>`);
      // the near edge's thickness and a couple of rumple lines
      S.add(`<path d="${pz1([top[0], top[1], Q(corners[1][0], 0, corners[1][1]), Q(corners[0][0], 0, corners[0][1])])}" fill="${cs}"/>`);
      const m1 = Q(xa + (xb - xa) * 0.3, h, zz + zw * 0.15), m2 = Q(xa + (xb - xa) * 0.55, h, zz + zw * 0.8), m3 = Q(xa + (xb - xa) * 0.75, h, zz + zw * 0.3);
      const m4 = Q(xa + (xb - xa) * 0.15, h, zz + zw * 0.7), m5 = Q(xa + (xb - xa) * 0.4, h, zz + zw * 0.45), m6 = Q(xa + (xb - xa) * 0.62, h, zz + zw * 0.92);
      S.add(`<path d="M${f1(m1[0])},${f1(m1[1])}Q${f1(m2[0])},${f1(m2[1])} ${f1(m3[0])},${f1(m3[1])}M${f1(m4[0])},${f1(m4[1])}Q${f1(m5[0])},${f1(m5[1])} ${f1(m6[0])},${f1(m6[1])}" fill="none" stroke="${cs}" stroke-width="${f1(Math.max(1, 14 / z))}" opacity=".8"/><path d="M${f1(m1[0])},${f1(m1[1] - 2)}Q${f1(m2[0])},${f1(m2[1] - 2)} ${f1(m3[0])},${f1(m3[1] - 2)}" fill="none" stroke="${mix(c, '#fff0d8', 0.2)}" stroke-width="${f1(Math.max(1, 8 / z))}" opacity=".6"/>`);
      // the end by the wall rolled up into a thick pillow roll, lit on top
      const r0p = Q(xa - sd * 0.02, h, zz + 0.02), r1p = Q(xa - sd * 0.02, h, zz + zw - 0.02), rw = 0.22 * 760 / zz, rh = 0.14 * 760 / zz;
      S.add(`<path d="M${f1(r0p[0])},${f1(r0p[1])}l${f1(-sd * rw)},0L${f1(r1p[0] - sd * rw * zz / (zz + zw))},${f1(r1p[1])}L${f1(r1p[0])},${f1(r1p[1])}Z" fill="${cs}"/><path d="M${f1(r0p[0] - sd * rw * 0.5)},${f1(r0p[1] - rh * 0.6)}L${f1(r1p[0] - sd * rw * 0.5 * zz / (zz + zw))},${f1(r1p[1] - rh * 0.6 * zz / (zz + zw))}" stroke="${c}" stroke-width="${f1(rh * 0.9)}" stroke-linecap="round"/>`);
      if (k % 3 === 1) { const f0 = Q(xa, h, zz), f1p = Q(xa + (xb - xa) * 0.3, h, zz), f2 = Q(xa + (xb - xa) * 0.3, h + 0.04, zz + zw), f3 = Q(xa, h, zz + zw); S.add(`<path d="${pz1([f0, f1p, f2, f3])}" fill="${mix(c, '#000000', 0.25)}"/>`); }
    }
  }
  // the lamp on its cord from the middle tie beam, its glow
  {
    const [lx, ly] = Q(...LAMP), top = Q(0, WH + 0.1, LAMP[2]);
    S.add(`<circle cx="${f1(lx)}" cy="${f1(ly)}" r="420" fill="${S.rad([[0, D.warm, 0.3], [0.3, '#c8884a', 0.12], [1, '#c8884a', 0]])}"/>`);
    S.add(`<path d="M${f1(lx)},${f1(top[1])}V${f1(ly - 30)}" stroke="${D.iron}" stroke-width="2"/>${tideLamp(lx, ly - 18, 2.2, D.lamp, true)}`);
    S.add(`<circle cx="${f1(lx)}" cy="${f1(ly + 4)}" r="60" fill="${S.rad([[0, D.lamp.core, 0.55], [1, D.lamp.core, 0]])}"/>`);
  }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.35, '#080605', 0], [1, '#080605', 0.7]], 'gradientUnits="userSpaceOnUse" cx="800" cy="420" r="980"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#0c0a08', 0], [1, '#0c0a08', 0.62]])}"/>`);
  return S.out();
}

export const guildDockBgs = {
  'fog-harbor-guild-dock': guildDock,
  'fog-harbor-guild-shed': guildShed,
};
