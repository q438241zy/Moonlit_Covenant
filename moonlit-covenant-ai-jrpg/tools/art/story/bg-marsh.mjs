// 盐沼与林边 (chapters 06–07):
//   salt-marsh-bridge         — 盐沼桥·午后涨潮 (06): a long, low one-cart bridge on rows of piles over a tidal creek,
//                               seen slightly from above on the downstream side. The middle span has lost its planks —
//                               only the two stringers are left; a length of the near railing is broken off and hangs
//                               over the edge; the second pile carries a band of white paint (the tide mark the
//                               collapse later drowns). Downstream on the mud flat a fish weir of planks stuck upright
//                               in the mud — old bridge planks, their nails still in them. Reeds and white salt land
//                               all round, a grey-white afternoon sky, the tide coming in.
//   forest-edge-inn           — 林边旅店·黄昏 (06): see forestEdgeInn().
//   forest-edge-channel-night — 林边水道泥滩·夜 (07): see forestChannelNight().
// No reflections in the water, no mirrors, no human figures (scripts 06/07 美術需求).
import { Scene, W, H, f, pz, pl, shape, cloud, band, stars, bird, noise1, persp, mix } from './lib.mjs';
import { reedBank } from './bg-oldmill.mjs';
import { piles, mudSheen, currents, patch, circ, sag, treeLine, tideLamp, taper } from './coast.mjs';

const r0 = (v) => f(v, 0);

// ---------------------------------------------------------------------------------------------
// 盐沼桥·午后涨潮
// ---------------------------------------------------------------------------------------------
const SB = {
  sky: [[0, '#aeb8ba'], [0.22, '#c8cfcc'], [0.4, '#dfe2dc'], [0.47, '#eceee6'], [1, '#e8e8e0']],
  wood: { lit: '#9a8e7a', mid: '#6e6456', shade: '#4c463e', wet: '#3c4034', cap: '#b8ae98' },
  plank: '#a89e8a', plankLit: '#c4baa4', seam: '#5e564a', fascia: '#5a5246', dark: '#2e2a26',
  water: [[0, '#c2c8c0'], [0.35, '#a2aea8'], [1, '#6e8078']], streak: '#eef2ea',
  mud: [[0, '#a69e8e'], [0.4, '#857c6c'], [1, '#4e483e']], salt: '#eeeee6', saltShade: '#d4d4c8',
  nail: '#2a2420', rust: '#8a4e30', paint: '#f4f4ee',
};

function saltMarshBridge() {
  const S = new Scene('sbSaltBridge', '盐沼桥·午后涨潮：长排木桩上的低矮木桥，中段缺板只剩两根横梁，近侧栏杆断了一截挂在桥边，第二根桩上一道白漆，下游泥滩上的插板鱼梁，四周芦苇与白盐地', 6201);
  const R = S.R;
  // camera low on the downstream mud bank: the deck stands just above eye level, so the bridge reads as a
  // band against the bright sky and the plankless span shows as sky between the two stringers
  const HZ = 455, F = 900, EYE = 0.78;
  const P = persp({ vp: [800, HZ], F, eye: EYE });
  const proj = (pts, Y = 0) => pts.map(([X, Z]) => P(X, Y, Z));
  const X0 = -7.33, DX = 30.8, Z0 = 7.5, DZ = 16.5;
  const len = Math.hypot(DX, DZ), ux = DX / len, uz = DZ / len, nx = -uz * 2.6, nz = ux * 2.6;
  const zAt = (t, far = 0) => Z0 + DZ * t + nz * far;
  const B = (t, far = 0, Y = 0) => P(X0 + DX * t + nx * far, Y, zAt(t, far));
  const YD = 1.6, YT = 1.44, YS = 1.18, YC = 1.02; // deck top, plank underside, stringer underside, cap underside
  const NB = 12, G0 = 0.176, G1 = 0.326; // bents; the plankless gap (bent 3 stands in it)
  const inGap = (t) => t > G0 && t < G1;
  const T0 = 0.12, T1 = 0.5; // where the creek's banks pass under the bridge

  // --- sky: high grey overcast, the afternoon sun a pale smear upper left ---------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#a8b2b4'], [0.2, '#c4cbc8'], [0.42, '#dfe2dc'], [0.505, '#eef0e8'], [0.52, '#c8c8ba'], [1, '#5e584a']])}"/>`);
  S.add(`<circle cx="330" cy="130" r="600" fill="${S.rad([[0, '#fffbea', 0.85], [0.15, '#f6f2e0', 0.45], [1, '#f6f2e0', 0]])}"/>`);
  S.add(`<g filter="${S.blur(2)}"><path d="${band(480, 1720, 110, 36, R, 16)}" fill="#a2acae" opacity=".55"/><path d="${band(-120, 720, 196, 26, R, 12)}" fill="#b8c0be" opacity=".5"/><path d="${band(760, 1720, 250, 24, R, 10)}" fill="#b0b8b6" opacity=".5"/><path d="${band(-60, 980, 322, 14, R, 6)}" fill="#f8f8f0" opacity=".75"/><path d="${band(900, 1700, 372, 10, R, 4)}" fill="#c8cecc" opacity=".6"/></g>`);
  S.add(`<path d="${band(500, 1480, 118, 7, R, 4)}" fill="#e6eae4" opacity=".55"/><path d="${band(30, 620, 204, 6, R, 3)}" fill="#fbfbf4" opacity=".6"/>`);
  S.add(`<g filter="${S.blur(2)}" opacity=".6"><path d="${band(820, 1320, 236, 30, R, 14)}" fill="#c4cac6"/><path d="${band(1180, 1560, 312, 20, R, 8)}" fill="#c0c6c2"/></g>`);
  let gulls = '';
  for (const [x, y, s, fl] of [[1120, 200, 0.95, 0.2], [1166, 184, 0.75, 0.7], [1204, 214, 0.65, 0.4], [600, 246, 0.6, 0.9], [1290, 168, 0.5, 0.5]]) gulls += bird(x, y, s, fl);
  S.add(`<path d="${gulls}" fill="#66706e"/>`);

  // --- far land: flat salt marsh to the horizon, faint low hills, white salt land, a band of reeds ------------
  S.add(`<path d="M940,${HZ - 2}C1060,${HZ - 12} 1200,${HZ - 20} 1310,${HZ - 15}C1430,${HZ - 10} 1520,${HZ - 18} 1640,${HZ - 13}V${HZ + 4}H940Z" fill="#b8c0bc" opacity=".8"/>`);
  S.add(`<path d="M-20,${HZ - 1}C200,${HZ - 6} 340,${HZ - 4} 420,${HZ - 1}V${HZ + 4}H-20Z" fill="#bcc2bc" opacity=".7"/>`);
  const farReed = { fill: [[0, '#9e9e86'], [1, '#7c7a64']], stalk: '#686852', plume: '#c8c2a6', leaf: '#787860' };
  S.add(reedBank(S, R, { x0: -20, x1: 1620, top: (x) => HZ - 4 + Math.sin(x / 70) * 1.5, base: HZ + 8, pal: farReed, seed: 6211, step: 4, amp: 3, plumeP: 0.25, plumeL: () => 4, stalkW: 1 }));
  S.add(`<rect y="${HZ + 6}" width="${W}" height="${H - HZ - 6}" fill="${S.lin([[0, '#c4c2b2'], [0.08, '#a8a28e'], [0.45, '#837a68'], [1, '#4e483c']], `gradientUnits="userSpaceOnUse" x1="0" y1="${HZ + 6}" x2="0" y2="${H}"`)}"/>`);
  let salt = '';
  for (const [x, y, rx, ry] of [[150, HZ + 12, 180, 4], [520, HZ + 10, 120, 3], [1180, HZ + 11, 230, 4], [1500, HZ + 16, 140, 5], [380, HZ + 22, 150, 6]]) salt += patch(R, x, y, rx, ry, 11);
  S.add(`<path d="${salt}" fill="${SB.salt}" opacity=".9"/>`);

  // --- the creek: the flood tide coming in from downstream (toward us), under the bridge and away inland ------
  const leftBank = [[-1.2, 140], [-1.4, 40], [-2.4, 18], [X0 + DX * T0 - 0.3, zAt(T0) + 1.2], [-5, 6.5], [-8, 4.5], [-12, 3.2], [-16, 2.6]];
  const rightBank = [[-3, 2.6], [-1, 3.6], [1, 6], [4.5, 10], [X0 + DX * T1 + 0.6, zAt(T1) + 1.2], [10, 30], [6, 70], [3.6, 140]];
  S.add(`<path d="${shape([...proj(leftBank), ...proj(rightBank)], true, 0)}" fill="${S.lin(SB.water, `gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="${H}"`)}"/>`);
  S.add(`<path d="${shape(proj(leftBank), false, 0)}${shape(proj(rightBank), false, 0)}" fill="none" stroke="#4e4a3e" stroke-width="3" opacity=".5"/>`);
  S.add(`<path d="${shape(proj(leftBank.map(([x, z]) => [x - 0.35, z])), false, 0)}${shape(proj(rightBank.map(([x, z]) => [x + 0.4, z])), false, 0)}" fill="none" stroke="#d8d8cc" stroke-width="2" opacity=".55"/>`);
  S.add(`<path d="${shape(proj([[0.4, 140], [1.6, 40], [2.2, 18], [-0.6, 8], [-6, 3.6], [-3, 3.4], [1.6, 7], [4.8, 17], [5, 40], [2, 140]]), true, 0)}" fill="#5a6c66" opacity=".2"/>`);
  S.add(currents(R, 820, 1200, HZ + 6, HZ + 30, 14, SB.streak, 0.5, -1) + currents(R, 520, 1080, HZ + 40, 560, 22, SB.streak, 0.45, -1) + currents(R, -20, 700, 560, 880, 26, SB.streak, 0.36, -1));
  // salt crust and wet glints on the flats
  let crust = '', pud = '', tuft = '';
  for (let i = 0; i < 26; i++) { const lf = R() < 0.25, t = R() ** 0.8 * (lf ? 0.12 : 1), y = HZ + 24 + 330 * t, x = lf ? R.range(-20, 420) : R.range(1080 - 380 * t, 1620); crust += patch(R, x, y, 30 + 120 * t, 1.5 + 4 * t, 13); }
  S.add(`<path d="${crust}" fill="${SB.saltShade}" opacity=".45"/>`);
  for (let i = 0; i < 9; i++) { const t = R() ** 0.9, y = HZ + 60 + 260 * t, x = R.range(1000 - 250 * t, 1560); pud += patch(R, x, y, 16 + 70 * t, 2 + 6 * t, 10); }
  S.add(`<path d="${pud}" fill="#c6ccc6" opacity=".75"/><path d="${pud}" fill="none" stroke="#5e584a" stroke-width="1.5" opacity=".35" transform="translate(0 1.5)"/>`);
  // rivulets the ebb cut through the flat, now filling again
  S.add(`<path d="M1460,${HZ + 80}C1380,${HZ + 120} 1300,${HZ + 130} 1180,${HZ + 190}S1020,${HZ + 260} 960,${HZ + 330}M1600,${HZ + 190}C1520,${HZ + 230} 1440,${HZ + 290} 1400,${HZ + 400}" fill="none" stroke="#9aa6a0" stroke-width="5" stroke-linecap="round" opacity=".55"/>`);
  // tufts of samphire on the flats
  for (let i = 0; i < 40; i++) {
    const lf = R() < 0.25, t = R() ** 0.9 * (lf ? 0.1 : 1), y = HZ + 30 + 300 * t, x = lf ? R.range(-20, 380) : R.range(1060 - 300 * t, 1620), h = 4 + 16 * t;
    tuft += `M${r0(x - h * 0.6)},${r0(y)}q${f(h * 0.2)},${f(-h)} ${f(h * 0.5)},${f(-h * 0.8)}q${f(h * 0.1)},${f(-h * 0.5)} ${f(h * 0.4)},${f(-h * 0.3)}q${f(h * 0.3)},${f(-h * 0.3)} ${f(h * 0.3)},${f(h * 1.1)}z`;
  }
  S.add(`<path d="${tuft}" fill="#6e7458" opacity=".8"/>`);
  S.add(mudSheen(R, 0, 420, HZ + 30, 520, 14, '#f2f0e6', 0.5) + mudSheen(R, 900, 1600, HZ + 50, 760, 30, '#f2f0e6', 0.45));

  // --- the bridge: far piles, far railing, far stringer ---------------------------------------------------------
  const ts = Array.from({ length: NB + 1 }, (_, k) => k / NB);
  const waterAt = (t) => t > T0 && t < T1;
  const pileList = (far) => ts.map((t) => {
    const top = B(t, far, YC), foot = B(t, far, waterAt(t) ? 0 : 0.12), sc = F / zAt(t, far);
    return [top[0], top[1], foot[1], Math.max(5, 0.32 * sc), B(t, far, 0.5)[1], 0];
  });
  const farWood = { lit: mix(SB.wood.lit, '#c4c8c0', 0.32), mid: mix(SB.wood.mid, '#a8aea6', 0.3), shade: mix(SB.wood.shade, '#8e948c', 0.3), wet: mix(SB.wood.wet, '#7a8278', 0.25) };
  S.add(piles(pileList(1), farWood));
  const beam = (t0, t1, far, y0, y1) => pz([B(t0, far, y0), B(t1, far, y0), B(t1, far, y1), B(t0, far, y1)]);
  let farRail = '';
  for (const t of ts) farRail += pl([B(t, 1, YT), B(t, 1, YD + 1)]);
  farRail += pl(ts.map((t) => B(t, 1, YD + 0.96))) + pl(ts.map((t) => B(t, 1, YD + 0.5)));
  S.add(`<path d="${farRail}" fill="none" stroke="${mix(SB.wood.mid, '#a4aaa2', 0.32)}" stroke-width="5" stroke-linecap="round"/>`);
  S.add(`<path d="${beam(0, 1, 1, YT, YS)}" fill="${mix(SB.wood.shade, '#868c84', 0.25)}"/>`);
  // far fascia (plank ends on the far side), visible below the deck where planks remain
  S.add(`<path d="${beam(0, G0, 1, YD, YT)}${beam(G1, 1, 1, YD, YT)}" fill="${mix(SB.fascia, '#8a8e86', 0.3)}"/>`);
  // plank undersides: the shadowed band between the near and far plank edges (none in the gap)
  const under = (t0, t1) => pz([B(t0, 0, YT), B(t1, 0, YT), B(t1, 1, YT), B(t0, 1, YT)]);
  S.add(`<path d="${under(0, G0)}${under(G1, 1)}" fill="#3e3a32"/>`);
  let ribs = '';
  for (let off = 0.34; off < len; off += 0.34) { const t = off / len; if (!inGap(t)) ribs += pl([B(t, 0, YT), B(t, 1, YT)]); }
  S.add(`<path d="${ribs}" stroke="#2a2620" stroke-width="1.2" opacity=".6"/>`);

  // --- near pile row with the bent caps; the second pile's band of white paint ---------------------------------
  let caps = '';
  for (const t of ts) caps += pz([B(t, -0.1, YS), B(t, -0.1, YC), B(t, 1.08, YC), B(t, 1.08, YS)]);
  S.add(`<path d="${caps}" fill="${SB.wood.shade}"/>`);
  S.add(piles(pileList(0), SB.wood));
  {
    const t = ts[1], a = B(t, 0, 0.74), b = B(t, 0, 0.96), w = 0.32 * F / zAt(t) * 1.03;
    S.add(`<path d="M${r0(a[0] - w / 2)},${r0(b[1])}h${f(w)}v${f(a[1] - b[1])}h${f(-w)}z" fill="${SB.paint}"/><path d="M${r0(a[0] + w * 0.12)},${r0(b[1])}h${f(w * 0.38)}v${f(a[1] - b[1])}h${f(-w * 0.38)}z" fill="#c8ccc6"/>`);
  }
  let foam = '';
  for (const t of ts) { if (!waterAt(t)) continue; for (const far of [0, 1]) { const [x, y] = B(t, far, 0), sc = F / zAt(t, far); foam += `M${r0(x - 0.34 * sc)},${r0(y)}q${f(0.34 * sc)},${f(0.06 * sc)} ${f(0.7 * sc)},0M${r0(x + 0.36 * sc)},${r0(y + 0.05 * sc)}h${f(0.5 * sc)}`; } }
  S.add(`<path d="${foam}" fill="none" stroke="${SB.streak}" stroke-width="2" stroke-linecap="round" opacity=".75"/>`);

  // --- near stringer (one of the two beams left across the gap), the near plank ends ---------------------------
  S.add(`<path d="${beam(0, 1, 0, YT, YS)}" fill="${SB.wood.mid}"/><path d="${pl([B(0, 0, YT), B(1, 0, YT)])}" stroke="${SB.wood.cap}" stroke-width="2" opacity=".55"/>`);
  S.add(`<path d="${beam(0, G0, 0, YD, YT)}${beam(G1, 1, 0, YD, YT)}" fill="${SB.fascia}"/>`);
  let ends = '';
  for (let off = 0.34; off < len; off += 0.34) { const t = off / len; if (!inGap(t)) ends += pl([B(t, 0, YD), B(t, 0, YT)]); }
  S.add(`<path d="${ends}" stroke="${SB.dark}" stroke-width="1.4" opacity=".55"/><path d="${pl([B(0, 0, YD), B(G0, 0, YD)])}${pl([B(G1, 0, YD), B(1, 0, YD)])}" stroke="${SB.plankLit}" stroke-width="2.4" opacity=".85"/>`);
  // splintered plank stubs jutting into the gap from both sides, on the near and far stringers
  let stubs = '';
  for (const [t, dirn] of [[G0, 1], [G1, -1]]) for (const far of [0, 1]) {
    const d = dirn * R.range(0.25, 0.7) / len;
    stubs += pz([B(t, far, YD), B(t + d, far, YD - 0.03), B(t + d * 0.5, far, YT), B(t, far, YT)]);
  }
  S.add(`<path d="${stubs}" fill="${SB.fascia}"/>`);
  // the gap's two beams catch the light on top (the far one through the hole)
  S.add(`<path d="${pl([B(G0 - 0.01, 1, YT), B(G1 + 0.01, 1, YT)])}" stroke="#d6cdb8" stroke-width="2.4" opacity=".8"/><path d="${pl([B(G0 - 0.004, 0, YT), B(G1 + 0.004, 0, YT)])}" stroke="#eee6d2" stroke-width="3" opacity=".9"/>`);

  // --- near railing: posts on the stringer, two rails; the span by the gap broken off and hanging over the edge --
  const brk0 = ts[2], brk1 = ts[3];
  let posts = '', rails = '';
  for (const t of ts) posts += pl([B(t, 0, YS + 0.02), B(t, 0, YD + 1)]);
  for (const yy of [YD + 0.96, YD + 0.5]) rails += pl(ts.filter((t) => t <= brk0).map((t) => B(t, 0, yy))) + pl(ts.filter((t) => t >= brk1).map((t) => B(t, 0, yy)));
  S.add(`<path d="${rails}" fill="none" stroke="${SB.wood.shade}" stroke-width="7" stroke-linecap="round"/><path d="${posts}" stroke="${SB.wood.shade}" stroke-width="9" stroke-linecap="round"/>`);
  S.add(`<path d="${rails}" fill="none" stroke="${SB.wood.cap}" stroke-width="2" stroke-linecap="round" opacity=".7" transform="translate(0 -3)"/><path d="${posts}" stroke="${SB.wood.lit}" stroke-width="2.4" opacity=".7" transform="translate(-3 0)"/>`);
  {
    // the span's two rails tore loose from bent 3's post and hang from bent 2's, swung down past the deck
    // edge with the free ends dangling over the flood; torn nail holes and splinters left on bent 3's post
    const tr = B(brk1, 0, YD + 0.96), tr2 = B(brk1, 0, YD + 0.5);
    S.add(`<path d="M${r0(tr[0] - 6)},${r0(tr[1] - 2)}l-7,-3l2,5zM${r0(tr2[0] - 6)},${r0(tr2[1] - 2)}l-7,3l2,4z" fill="${SB.wood.lit}"/><path d="${circ(tr[0], tr[1], 1.6)}${circ(tr2[0], tr2[1], 1.6)}" fill="${SB.nail}"/>`);
    const h1 = B(brk0, 0, YD + 0.96), h2 = B(brk0, 0, YD + 0.5);
    const e1 = B(brk0 + 0.03, -0.3, 0.36), e2 = B(brk0 + 0.042, -0.38, 0.02);
    const at = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    S.add(`<path d="${pl([h1, e1])}${pl([h2, e2])}" stroke="${SB.wood.shade}" stroke-width="7" stroke-linecap="round"/><path d="${pl([at(h1, e1, 0.78), at(h2, e2, 0.8)])}" stroke="${SB.wood.mid}" stroke-width="8" stroke-linecap="round"/>`);
    S.add(`<path d="${pl([h1, e1])}${pl([h2, e2])}" stroke="${SB.wood.cap}" stroke-width="2" opacity=".75" transform="translate(-2.5 0)"/><path d="M${r0(e1[0])},${r0(e1[1])}l6,4l-3,6M${r0(e2[0])},${r0(e2[1])}l6,4l-4,5" stroke="${SB.wood.lit}" stroke-width="2.4" fill="none"/>`);
    S.add(`<path d="M${r0(e2[0] - 16)},${r0(e2[1] + 12)}q16,5 34,0" fill="none" stroke="${SB.streak}" stroke-width="2" opacity=".7"/>`);
  }

  // --- the fish weir on the downstream flat: bridge planks stuck upright in the mud, their nails still in them --
  {
    const arms = [[[5.6, 13.6], [6.5, 9.7]], [[10.2, 12.6], [6.5, 9.7]]];
    let boards = '', lit = '', shade = '', nails = '', rust = '', foot = '';
    const mid = (p0, p1, u) => [p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u];
    for (const [ai, [a, b]] of arms.entries()) {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.round(L / 0.3);
      for (let i = 0; i < n; i++) {
        const t0 = i / n, t1 = (i + 0.84) / n;
        const xa = a[0] + (b[0] - a[0]) * t0, za = a[1] + (b[1] - a[1]) * t0, xb = a[0] + (b[0] - a[0]) * t1, zb = a[1] + (b[1] - a[1]) * t1;
        const h = R.range(0.82, 1.02), tilt = R.range(-0.05, 0.05), Y0 = 0.15;
        const q = [P(xa, Y0, za), P(xb, Y0, zb), P(xb + tilt, h, zb), P(xa + tilt, h - R.range(0, 0.07), za)];
        boards += pz(q);
        if (ai === 0) lit += pz([q[0], mid(q[0], q[1], 0.42), mid(q[3], q[2], 0.42), q[3]]);
        else shade += pz([mid(q[0], q[1], 0.5), q[1], q[2], mid(q[3], q[2], 0.5)]);
        const sc = F / za;
        for (const [u, v] of [[0.26, 0.86], [0.74, 0.84], [0.5, 0.4]]) {
          const [px, py0] = mid(q[0], q[1], u), py = py0 - (q[0][1] - q[3][1]) * v;
          nails += circ(px, py, Math.max(1.2, 0.016 * sc));
          rust += `M${r0(px)},${r0(py + 1)}v${f(0.07 * sc)}`;
        }
        foot += `M${r0(q[0][0] - 2)},${r0(q[0][1] + 1)}L${r0(q[1][0] + 2)},${r0(q[1][1] + 1)}`;
      }
    }
    S.add(`<path d="${boards}" fill="${SB.plank}"/><path d="${lit}" fill="${SB.plankLit}"/><path d="${shade}" fill="${SB.wood.mid}" opacity=".75"/>`);
    S.add(`<path d="${rust}" stroke="${SB.rust}" stroke-width="1.8" opacity=".75"/><path d="${nails}" fill="${SB.nail}"/><path d="${foot}" stroke="#3a342a" stroke-width="4" stroke-linecap="round" opacity=".6"/>`);
    // the trap basket at the apex, puddles of the rising tide round the weir's foot
    const ap = P(6.5, 0.15, 9.5), sc = F / 9.5;
    S.add(`<path d="M${r0(ap[0] - 0.42 * sc)},${r0(ap[1])}q${f(0.42 * sc)},${f(0.12 * sc)} ${f(0.84 * sc)},0l${f(-0.08 * sc)},${f(-0.46 * sc)}h${f(-0.68 * sc)}z" fill="#7e6e50"/><path d="M${r0(ap[0] - 0.32 * sc)},${r0(ap[1] - 0.12 * sc)}h${f(0.64 * sc)}M${r0(ap[0] - 0.34 * sc)},${r0(ap[1] - 0.28 * sc)}h${f(0.68 * sc)}" stroke="#4a3e2c" stroke-width="2.4"/>`);
    let pud = '';
    for (const [x, z, w] of [[7.4, 12, 0.8], [9, 11, 0.6], [5.2, 9.2, 1], [8.6, 8.8, 0.7]]) { const p = P(x, 0.15, z), s2 = F / z; pud += `<ellipse cx="${r0(p[0])}" cy="${r0(p[1])}" rx="${f(w * s2)}" ry="${f(w * s2 * 0.1)}"/>`; }
    S.add(`<g fill="#c4ccc6" opacity=".8">${pud}</g>`);
  }

  // --- reeds: a clump at the right bridge end, the near corners --------------------------------------------------
  const midReed = { fill: [[0, '#8e8a6a'], [1, '#625e4a']], stalk: '#4a4636', hi: '#b8b290', plume: '#c8c0a0', rim: '#f4f2e6', leaf: '#5a5642' };
  S.add(reedBank(S, R, { x0: 1440, x1: 1620, top: (x) => HZ + 26 - 64 * Math.sin(Math.PI * Math.min(1, (x - 1440) / 260)) ** 0.6, base: HZ + 30, pal: midReed, seed: 6231, step: 5, amp: 9, plumeP: 0.5, plumeL: () => 14, stalkW: 1.6 }));
  S.add(reedBank(S, R, { x0: -20, x1: 260, top: (x) => HZ + 22 - 40 * Math.sin(Math.PI * Math.min(1, (x + 20) / 280)) ** 0.6, base: HZ + 26, pal: midReed, seed: 6232, step: 5, amp: 8, plumeP: 0.5, plumeL: () => 12, stalkW: 1.6 }));
  const nearReed = { fill: [[0, '#6a664e'], [0.4, '#4a4636'], [1, '#26241c']], stalk: '#22201a', hi: '#9a9474', plume: '#aea686', rim: '#eceadc', leaf: '#36342a' };
  S.add(reedBank(S, R, { x0: 1620, x1: 1330, top: (x) => 600 + ((1620 - x) / 290) ** 2 * 330, base: H + 10, pal: nearReed, seed: 6222, step: 6, amp: 14, plumeP: 0.55, plumeL: (x) => 46 - (1620 - x) / 290 * 26, stalkW: 2.2 }));
  S.add(reedBank(S, R, { x0: -20, x1: 210, top: (x) => 660 + ((x + 20) / 230) ** 2 * 270, base: H + 10, pal: nearReed, seed: 6221, step: 6, amp: 14, plumeP: 0.55, plumeL: (x) => 40 - (x + 20) / 230 * 22, stalkW: 2.2 }));

  // --- grading: soft light from the upper left, the calm darker flats under the dialogue box -----------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#fff8e8', 0.14], [0.5, '#fff8e8', 0], [1, '#2a3434', 0.2]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.5, '#28302e', 0], [1, '#28302e', 0.36]], 'cx="0.5" cy="0.45" r="0.78"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#2a302c', 0], [1, '#2a302c', 0.62]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 林边旅店·黄昏 — a two-storey timber inn at the edge of a black wood: the courtyard with its long table and
// benches, lanterns under the porch eave, an iron brazier, the stable lean-to on the left, the kitchen window
// thrown open onto the yard, a covered wagon of the caravan, and behind the inn's far corner just a sliver of
// the tidal channel. The sun has gone into the trees; the picture is dark enough to be darkened into night.
// ---------------------------------------------------------------------------------------------
const INN = {
  sky: [[0, '#2a2442'], [0.14, '#463456'], [0.3, '#8a5068'], [0.41, '#d07c62'], [0.47, '#eea26a'], [0.5, '#f6c07e'], [1, '#2a1e24']],
  trees: '#191220', treesFar: '#3e2a40', treeRim: '#ff9e6a',
  wood: { lit: '#7a5444', mid: '#5a3c36', shade: '#3a2830', dark: '#22161c', board: '#2a1a1e' },
  roof: '#3e2e3c', roofShade: '#2a1e2a', roofRim: '#ffae7a', stone: '#5a4a4c',
  win: '#ffc872', winHot: '#fff0c4', winDark: '#2a2030', glow: '#ffb860',
  ground: [[0, '#6a4a40'], [0.3, '#4a3434'], [1, '#18141a']],
};

function forestEdgeInn() {
  const S = new Scene('sbForestInn', '林边旅店·黄昏：两层木楼，院子里的长桌与长凳，檐下的灯，铁火盆，左侧马厩，朝院子开的厨房窗口，背后黑色林线，店后潮汐水道露出一角', 6301);
  const R = S.R;
  const GY = 575; // the inn's ground line

  // --- sky: the sun just gone into the wood on the left ---------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(INN.sky)}"/>`);
  S.add(`<circle cx="250" cy="430" r="760" fill="${S.rad([[0, '#ffd89a', 0.8], [0.12, '#ffae6e', 0.5], [0.4, '#d8706a', 0.16], [1, '#a05070', 0]])}"/>`);
  S.add(stars(R, 30, [700, 0, W, 170], { maxR: 1.1, fill: '#f6e8ff', op: [0.15, 0.6] }));
  const cc = { lit: '#c47a70', shade: '#5a3a52', rim: '#ffc08a' }, cf = { lit: '#a8606a', shade: '#4a3048', rim: null };
  S.add(`<g opacity=".85">${cloud(R, 900, 250, 300, 34, cf, { bumps: 6 })}${cloud(R, 1300, 190, 240, 28, cf, { bumps: 5 })}</g>`);
  S.add(cloud(R, 380, 150, 340, 54, cc, { bumps: 7 }) + cloud(R, 1080, 110, 260, 40, cc, { bumps: 6 }));
  S.add(`<path d="${band(-40, 900, 330, 8, R)}" fill="#ffd0a0" opacity=".5"/><path d="${band(700, 1640, 300, 6, R)}" fill="#e89a86" opacity=".45"/>`);

  // --- the wood behind: a far hazy layer, then the black edge with a warm rim on its crowns ---------------
  S.add(`<path d="${treeLine(R, -20, 1620, 452, 150, 230, 620, { step: 30, spireP: 0.3 })}" fill="${INN.treesFar}"/>`);
  const edge = treeLine(R, -20, 1620, 470, 110, 250, 620, { step: 26, spireP: 0.42 });
  S.add(`<path d="${edge}" fill="${INN.treeRim}" opacity=".55" transform="translate(-3 -3)"/><path d="${edge}" fill="${INN.trees}"/>`);
  S.add(`<rect y="380" width="${W}" height="140" fill="${S.lin([[0, '#ff9a6a', 0], [0.6, '#ffb070', 0.12], [1, '#ff9a6a', 0]])}"/>`);

  // --- the tidal channel behind the inn: only a corner of it, right of the inn ------------------------------
  S.add(`<path d="M1196,532C1300,528 1420,522 1620,518V546C1460,550 1320,556 1196,560Z" fill="${S.lin([[0, '#d88a70'], [1, '#6a4250']])}"/>`);
  S.add(`<path d="M1230,540h60M1330,536h50M1480,531h70" stroke="#ffd2a8" stroke-width="1.5" opacity=".6"/>`);
  S.add(`<path d="M1196,560C1320,556 1460,550 1620,546V600H1196Z" fill="#2a1e24"/><path d="M1196,560C1320,556 1460,550 1620,546" fill="none" stroke="#ffb488" stroke-width="1.6" opacity=".5"/>`);
  S.add(`<path d="M1270,512v50M1296,510v50" stroke="#1a1218" stroke-width="5" stroke-linecap="round"/><path d="M1260,526h46" stroke="#1a1218" stroke-width="4"/><path d="M1264,512v50" stroke="#ffae7a" stroke-width="1.5" opacity=".5"/>`);

  // --- yard ground ---------------------------------------------------------------------------------------
  S.add(`<path d="M-20,${GY + 6}C400,${GY - 4} 1100,${GY - 2} 1620,${GY + 12}V${H}H-20Z" fill="${S.lin(INN.ground, `gradientUnits="userSpaceOnUse" x1="0" y1="${GY}" x2="0" y2="${H}"`)}"/>`);

  // --- the inn: oblique box (front facade + right gable end), roof, porch --------------------------------
  const x0 = 560, x1 = 1080, yT = 345, yM = 455; // facade left/right, eave line, floor line
  const dx = 108, dy = -60; // depth offset to the back corner
  const ridgeY = 222, rx0 = x0 + dx / 2, rx1 = x1 + dx / 2;
  const w = INN.wood;
  {
    const o = [];
    // gable end (right, in shade) and its triangle
    o.push(`<path d="${pz([[x1, GY], [x1, yT], [x1 + dx, yT + dy], [x1 + dx, GY + dy]])}" fill="${w.shade}"/>`);
    o.push(`<path d="${pz([[x1, yT], [rx1, ridgeY], [x1 + dx, yT + dy]])}" fill="${w.dark}"/>`);
    let gb = '';
    for (let y = GY - 12; y > yT + 4; y -= 12) gb += `M${r0(x1)},${r0(y)}l${dx},${dy}`;
    o.push(`<path d="${gb}" stroke="${w.board}" stroke-width="1.4" opacity=".5"/>`);
    // a small lit window high in the gable, a back door glow on the gable foot
    o.push(`<path d="M${r0(rx1 - 10)},${r0(ridgeY + 52)}l20,-8v24l-20,8z" fill="${INN.win}" opacity=".85"/>`);
    // facade: weatherboards, the shaded right third
    o.push(`<path d="M${x0},${GY}V${yT}H${x1}V${GY}Z" fill="${w.mid}"/><path d="M${x0},${GY}V${yT}H${x0 + 70}V${GY}Z" fill="${w.lit}" opacity=".55"/><path d="M${x1 - 160},${GY}V${yT}H${x1}V${GY}Z" fill="${w.dark}" opacity=".35"/>`);
    let wb = '';
    for (let y = yT + 11; y < GY; y += 11) wb += `M${x0},${y}H${x1}`;
    o.push(`<path d="${wb}" stroke="${w.board}" stroke-width="1.5" opacity=".5"/>`);
    // corner posts and the floor beam between the storeys
    o.push(`<path d="M${x0 + 4},${GY}V${yT}M${x1 - 4},${GY}V${yT}" stroke="${w.dark}" stroke-width="9"/><path d="M${x0},${yM}H${x1}" stroke="${w.dark}" stroke-width="8"/><path d="M${x0 + 1},${GY}V${yT}" stroke="${INN.roofRim}" stroke-width="2" opacity=".6"/>`);
    // upper windows: two lit, two dark; shutters
    let wl = '', wd = '', sh = '';
    for (const [i, x] of [600, 720, 880, 990].entries()) {
      const lit = i === 1 || i === 3, y = yT + 30, ww = 52, wh = 58;
      (lit ? (wl += `M${x},${y}h${ww}v${wh}h-${ww}z`) : (wd += `M${x},${y}h${ww}v${wh}h-${ww}z`));
      sh += `M${x - 16},${y}h13v${wh}h-13zM${x + ww + 3},${y}h13v${wh}h-13z`;
    }
    o.push(`<path d="${sh}" fill="#4a3236"/><path d="${wd}" fill="${INN.winDark}"/><path d="${wl}" fill="${INN.win}"/>`);
    o.push(`<path d="M626,${yT + 30}v58M600,${yT + 57}h52M746,${yT + 30}v58M720,${yT + 57}h52M906,${yT + 30}v58M880,${yT + 57}h52M1016,${yT + 30}v58M990,${yT + 57}h52" stroke="${w.dark}" stroke-width="3"/>`);
    o.push(`<path d="M724,${yT + 34}h18v22h-18zM994,${yT + 34}h18v22h-18z" fill="${INN.winHot}" opacity=".8"/>`);
    S.add(o.join(''));
    // roof: front slope from the eave up to the ridge, rim of afterglow on the left verge and ridge
    const ov = 22;
    S.add(`<path d="${pz([[x0 - ov, yT + 4], [x1 + ov, yT + 4], [rx1 + ov * 0.6, ridgeY], [rx0 - ov * 0.6, ridgeY]])}" fill="${INN.roof}"/>`);
    let sh2 = '';
    for (let k = 1; k < 7; k++) { const t = k / 7; sh2 += `M${r0(x0 - ov + (rx0 - ov * 0.6 - x0 + ov) * t)},${r0(yT + 4 + (ridgeY - yT - 4) * t)}H${r0(x1 + ov + (rx1 + ov * 0.6 - x1 - ov) * t)}`; }
    S.add(`<path d="${sh2}" stroke="${INN.roofShade}" stroke-width="2.5" opacity=".8"/>`);
    // verge boards along the gable's two edges (the gable wall itself stays visible under them)
    S.add(`<path d="M${r0(x1 + ov)},${yT + 4}L${r0(rx1 + ov * 0.6)},${ridgeY}L${r0(x1 + dx + ov * 0.7)},${r0(yT + dy + 6)}" fill="none" stroke="${INN.roofShade}" stroke-width="9" stroke-linejoin="round"/>`);
    S.add(`<path d="M${r0(x0 - ov)},${yT + 4}L${r0(rx0 - ov * 0.6)},${ridgeY}H${r0(rx1 + ov * 0.6)}" fill="none" stroke="${INN.roofRim}" stroke-width="3" stroke-linecap="round" opacity=".75"/>`);
    // chimney and its smoke drifting right
    const cx = 990, cTop = 170;
    S.add(`<path d="M${cx},${ridgeY + 38}V${cTop}h34V${ridgeY + 30}Z" fill="${INN.stone}"/><path d="M${cx - 4},${cTop}h42v10h-42z" fill="#3a2e34"/><path d="M${cx},${ridgeY + 38}V${cTop}" stroke="${INN.roofRim}" stroke-width="2" opacity=".55"/>`);
    let puffs = '';
    for (let i = 0; i < 12; i++) { const t = i / 11; puffs += circ(cx + 17 + 260 * t * t + Math.sin(t * 6) * 8, cTop - 8 - 170 * t, 7 + 30 * t); }
    S.add(`<path d="${puffs}" fill="#5a4258" opacity=".55" filter="${S.blur(1)}"/>`);
  }

  // --- stable lean-to on the left: open stalls, a mule looking over the half door, hay -------------------
  {
    const sx0 = 190, sTop = 440, sEave = 470, sFloor = GY + 8;
    const o = [];
    o.push(`<path d="${pz([[sx0 - 20, sEave + 4], [x0 + 2, sTop - 22], [x0 + 2, sTop - 8], [sx0 - 20, sEave + 16]])}" fill="${INN.roof}"/><path d="${pl([[sx0 - 20, sEave + 4], [x0 + 2, sTop - 22]])}" stroke="${INN.roofRim}" stroke-width="2.5" opacity=".7"/>`);
    o.push(`<path d="${pz([[sx0, sFloor], [sx0, sEave + 14], [x0, sTop - 6], [x0, sFloor]])}" fill="${w.dark}"/>`);
    o.push(`<path d="${pz([[sx0 + 10, sFloor], [sx0 + 10, sEave + 26], [x0 - 10, sTop + 8], [x0 - 10, sFloor]])}" fill="#120c12"/>`);
    // stall posts and half doors
    let posts = '', doors = '';
    for (const x of [sx0 + 6, 300, 420, x0 - 6]) posts += `M${x},${sFloor}V${r0(sEave + 14 - (x - sx0) * ((sEave + 14 - sTop + 6) / (x0 - sx0)))}`;
    for (const [a, b] of [[sx0 + 12, 294], [306, 414], [426, x0 - 12]]) doors += `M${a},${sFloor}V${sFloor - 52}H${b}V${sFloor}Z`;
    o.push(`<path d="${doors}" fill="${w.mid}"/><path d="${doors.replace(/V(\d+)H/g, 'V$1H')}" fill="none" stroke="${w.board}" stroke-width="2" opacity=".6"/>`);
    o.push(`<path d="M${sx0 + 12},${sFloor - 52}L294,${sFloor}M306,${sFloor - 52}L414,${sFloor}M426,${sFloor - 52}L${x0 - 12},${sFloor}" stroke="${w.dark}" stroke-width="4"/>`);
    o.push(`<path d="${posts}" stroke="${w.mid}" stroke-width="9"/><path d="${posts}" stroke="${INN.roofRim}" stroke-width="1.6" opacity=".45" transform="translate(-4 0)"/>`);
    // the mule: long ears, long face resting over the middle half door
    o.push(`<path d="M352,${sFloor - 50}C350,${sFloor - 76} 356,${sFloor - 92} 366,${sFloor - 100}L360,${sFloor - 128}L372,${sFloor - 104}L382,${sFloor - 106}L388,${sFloor - 132}L392,${sFloor - 100}C402,${sFloor - 90} 400,${sFloor - 70} 392,${sFloor - 50}Z" fill="#3a2a2a"/><path d="M362,${sFloor - 96}C358,${sFloor - 80} 358,${sFloor - 64} 360,${sFloor - 52}" stroke="${INN.roofRim}" stroke-width="2" fill="none" opacity=".6"/><circle cx="368" cy="${sFloor - 82}" r="2.5" fill="#120a0c"/><path d="M358,${sFloor - 56}q8,6 20,2" stroke="#1a1012" stroke-width="2" fill="none"/>`);
    // hay rack and a heap of hay by the stable, a saddle on the rail
    o.push(`<path d="M196,${sFloor + 2}q30,-40 70,-42q44,4 64,42z" fill="#9a7a4a"/><path d="M210,${sFloor - 8}q30,-30 56,-30M236,${sFloor - 2}q24,-26 50,-28M260,${sFloor}q20,-20 50,-16" stroke="#c8a466" stroke-width="2" fill="none" opacity=".8"/>`);
    o.push(`<path d="M440,${sFloor - 52}q20,-14 40,0v18q-20,-8 -40,0z" fill="#5a3426"/>`);
    S.add(o.join(''));
  }

  // --- ground floor: porch roof, posts, the kitchen window open onto the yard, the door, eave lanterns ---
  {
    const o = [];
    // kitchen window (left of the door): wide, both shutters folded back, a sill-counter, steam
    const kx = 600, ky = 488, kw = 130, kh = 62;
    o.push(`<circle cx="${kx + kw / 2}" cy="${ky + kh / 2}" r="150" fill="${S.rad([[0, INN.glow, 0.45], [1, INN.glow, 0]])}"/>`);
    o.push(`<path d="M${kx},${ky}h${kw}v${kh}h-${kw}z" fill="${INN.win}"/><path d="M${kx + 8},${ky + 6}h44v26h-44z" fill="${INN.winHot}" opacity=".8"/>`);
    o.push(`<path d="M${kx - 30},${ky - 2}h26v${kh + 4}h-26zM${kx + kw + 4},${ky - 2}h26v${kh + 4}h-26z" fill="#4a3236"/><path d="M${kx - 6},${ky - 2}v${kh + 4}M${kx + kw + 6},${ky - 2}v${kh + 4}" stroke="${w.dark}" stroke-width="3"/>`);
    // inside: hanging pots and a shelf in silhouette
    o.push(`<path d="M${kx + 70},${ky}v12M${kx + 100},${ky}v16" stroke="#3a2420" stroke-width="2"/><path d="M${kx + 62},${ky + 12}h16l-2,10h-12zM${kx + 92},${ky + 16}h16l-2,10h-12z" fill="#3a2420"/><path d="M${kx + 4},${ky + 40}h${kw - 8}" stroke="#7a4a30" stroke-width="3"/>`);
    o.push(`<path d="M${kx - 8},${ky + kh}h${kw + 16}v9h-${kw + 16}z" fill="${w.lit}"/><path d="M${kx - 8},${ky + kh}h${kw + 16}" stroke="${INN.winHot}" stroke-width="2" opacity=".7"/>`);
    o.push(`<path d="M${kx + 20},${ky + kh}q-2,-10 6,-12q8,2 6,12zM${kx + 96},${ky + kh}h18v-10h-18z" fill="#6a4434"/>`);
    let steam = '';
    for (let i = 0; i < 6; i++) { const t = i / 5; steam += circ(kx + 40 + Math.sin(t * 5) * 8 + t * 20, ky - 6 - t * 60, 6 + t * 12); }
    o.push(`<path d="${steam}" fill="#f0d8c8" opacity=".22" filter="${S.blur(1)}"/>`);
    // door: ajar, warm light in the gap; a smaller window right of it
    o.push(`<path d="M790,${GY}V${yM + 40}h66V${GY}z" fill="${w.dark}"/><path d="M800,${GY}V${yM + 46}h20V${GY}z" fill="${INN.win}"/><path d="M820,${GY}V${yM + 46}l30,-4V${GY - 2}z" fill="#3a2628"/>`);
    o.push(`<path d="M900,${ky + 4}h70v50h-70z" fill="${INN.winDark}"/><path d="M935,${ky + 4}v50M900,${ky + 29}h70" stroke="${w.dark}" stroke-width="3"/><path d="M904,${ky + 8}h26v18h-26z" fill="#6a5060" opacity=".6"/>`);
    // porch roof (pent) along the ground floor and its posts
    const pTop = yM + 2, pEdge = yM + 26, pOv = 30;
    o.push(`<path d="${pz([[x0 - pOv, pEdge], [x1 + pOv, pEdge], [x1, pTop], [x0, pTop]])}" fill="${INN.roof}"/><path d="M${x0 - pOv},${pEdge}H${x1 + pOv}" stroke="${INN.roofShade}" stroke-width="5"/><path d="M${x0 - pOv},${pEdge - 1}L${x0},${pTop}" stroke="${INN.roofRim}" stroke-width="2" opacity=".6"/>`);
    let pp = '';
    for (const x of [x0 - 18, 760, 880, x1 + 18]) pp += `M${x},${GY + 12}V${pEdge + 2}`;
    o.push(`<path d="${pp}" stroke="${w.mid}" stroke-width="10"/><path d="${pp}" stroke="${INN.roofRim}" stroke-width="2" opacity=".4" transform="translate(-4 0)"/>`);
    // a hanging sign by the door (an emblem of a cup and a leaf, no lettering)
    o.push(`<path d="M${x0 - 4},${yM - 50}h56" stroke="${w.dark}" stroke-width="4"/><path d="M${x0 + 6},${yM - 48}v8M${x0 + 44},${yM - 48}v8" stroke="#2a1a1a" stroke-width="2"/><path d="M${x0 - 2},${yM - 40}h56v34h-56z" fill="#6a4630"/><path d="M${x0 + 14},${yM - 34}h16l-2,18h-12zM${x0 + 30},${yM - 30}q8,0 6,8M${x0 + 38},${yM - 32}q8,-10 12,0q-6,6 -12,0z" fill="none" stroke="#e8c070" stroke-width="2"/>`);
    // eave lanterns under the porch edge, with their glow
    for (const x of [620, 740, 900, 1040]) {
      o.push(`<circle cx="${x}" cy="${pEdge + 30}" r="70" fill="${S.rad([[0, INN.glow, 0.5], [0.4, '#ff9a50', 0.16], [1, '#ff9a50', 0]])}"/>`);
      o.push(tideLamp(x, pEdge + 18, 1.05, { iron: '#24181c', glass: '#3a3040', glow: INN.win, core: INN.winHot, glint: '#fff' }, true));
    }
    S.add(o.join(''));
  }

  // --- a covered wagon of the caravan parked on the right, shafts down ------------------------------------
  {
    const bx = 1390, by = 604;
    const o = [];
    o.push(`<path d="M${bx},${by - 30}C${bx + 4},${by - 150} ${bx + 290},${by - 156} ${bx + 300},${by - 30}Z" fill="#c8a88a"/><path d="M${bx + 150},${by - 148}C${bx + 250},${by - 140} ${bx + 296},${by - 110} ${bx + 300},${by - 30}H${bx + 160}Z" fill="#7a6058"/>`);
    o.push(`<path d="M${bx + 60},${by - 118}C${bx + 64},${by - 80} ${bx + 64},${by - 50} ${bx + 62},${by - 30}M${bx + 120},${by - 142}V${by - 30}M${bx + 190},${by - 140}C${bx + 194},${by - 90} ${bx + 194},${by - 60} ${bx + 192},${by - 30}" stroke="#6a5048" stroke-width="3" fill="none" opacity=".7"/>`);
    o.push(`<path d="M${bx + 6},${by - 70}C${bx + 20},${by - 136} ${bx + 90},${by - 152} ${bx + 150},${by - 150}" fill="none" stroke="${INN.roofRim}" stroke-width="3" opacity=".7"/>`);
    o.push(`<path d="M${bx - 10},${by - 34}h320v18h-320z" fill="${w.mid}"/><path d="M${bx - 10},${by - 34}h320" stroke="${INN.roofRim}" stroke-width="2" opacity=".5"/>`);
    o.push(`<path d="M${bx - 10},${by - 22}L${bx - 110},${by + 40}" stroke="${w.dark}" stroke-width="7" stroke-linecap="round"/>`);
    for (const wx of [bx + 50, bx + 250]) {
      o.push(`<circle cx="${wx}" cy="${by}" r="38" fill="none" stroke="${w.dark}" stroke-width="7"/><circle cx="${wx}" cy="${by}" r="7" fill="${w.dark}"/>`);
      let sp = '';
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; sp += `M${wx},${by}l${f(Math.cos(a) * 36)},${f(Math.sin(a) * 36)}`; }
      o.push(`<path d="${sp}" stroke="${w.dark}" stroke-width="3"/><path d="M${wx - 34},${by - 14}a38,38 0 0 1 22,-22" fill="none" stroke="${INN.roofRim}" stroke-width="2" opacity=".6"/>`);
    }
    S.add(o.join(''));
  }

  // --- the long table and benches in the yard, the brazier --------------------------------------------------
  {
    const o = [];
    const tY = 600, tx0 = 600, tx1 = 1000;
    o.push(`<ellipse cx="800" cy="${tY + 54}" rx="260" ry="16" fill="#120c10" opacity=".45"/>`);
    // back bench, table top (seen slightly from above), apron, legs, front bench
    o.push(`<path d="M${tx0 + 10},${tY - 18}h${tx1 - tx0 - 20}v6h-${tx1 - tx0 - 20}z" fill="${w.mid}"/>`);
    o.push(`<path d="${pz([[tx0 - 10, tY + 4], [tx1 + 10, tY + 4], [tx1 - 6, tY - 10], [tx0 + 6, tY - 10]])}" fill="#8a6050"/><path d="M${tx0 - 10},${tY + 4}h${tx1 - tx0 + 20}v10h-${tx1 - tx0 + 20}z" fill="${w.mid}"/>`);
    o.push(`<path d="M${tx0 + 6},${tY - 10}L${tx0 - 10},${tY + 4}H${tx1 + 10}" fill="none" stroke="#ffc896" stroke-width="2" opacity=".6"/>`);
    o.push(`<path d="M${tx0 + 10},${tY + 14}v40M${tx1 - 10},${tY + 14}v40M${tx0 + 60},${tY + 14}v36M${tx1 - 60},${tY + 14}v36" stroke="${w.dark}" stroke-width="8"/>`);
    o.push(`<path d="M${tx0 - 20},${tY + 30}h${tx1 - tx0 + 40}v8h-${tx1 - tx0 + 40}z" fill="${w.lit}"/><path d="M${tx0 - 10},${tY + 38}v20M${tx1 + 10},${tY + 38}v20" stroke="${w.dark}" stroke-width="6"/>`);
    // on the table: a candle lantern, plates, mugs, a cloth-covered dish
    o.push(`<circle cx="800" cy="${tY - 18}" r="70" fill="${S.rad([[0, INN.glow, 0.5], [1, INN.glow, 0]])}"/>`);
    o.push(tideLamp(800, tY - 24, 0.8, { iron: '#24181c', glass: '#3a3040', glow: INN.win, core: INN.winHot, glint: '#fff' }, true));
    let pl2 = '';
    for (const x of [660, 720, 880, 950]) pl2 += `<ellipse cx="${x}" cy="${tY - 2}" rx="16" ry="4"/>`;
    o.push(`<g fill="#e8dccc">${pl2}</g><path d="M690,${tY - 4}v-14h12v14zM910,${tY - 4}v-14h12v14z" fill="#8a6a4a"/><path d="M840,${tY - 2}q16,-22 32,0z" fill="#d8c8b0"/>`);
    // the brazier: iron basket on three legs, fire, sparks, glow on the ground
    const bx = 1130, by = 590;
    o.push(`<ellipse cx="${bx}" cy="${by + 54}" rx="140" ry="22" fill="${S.rad([[0, '#ff9a48', 0.5], [1, '#ff9a48', 0]])}"/><circle cx="${bx}" cy="${by - 20}" r="150" fill="${S.rad([[0, '#ff9a48', 0.4], [0.4, '#ff7a3a', 0.14], [1, '#ff7a3a', 0]])}"/>`);
    o.push(`<path d="M${bx - 20},${by + 6}L${bx - 34},${by + 54}M${bx + 20},${by + 6}L${bx + 34},${by + 54}M${bx},${by + 8}V${by + 56}" stroke="#1a1012" stroke-width="5" stroke-linecap="round"/>`);
    o.push(`<path d="M${bx - 30},${by - 14}h60l-10,24h-40z" fill="#2a1a1a"/><path d="M${bx - 24},${by - 14}l6,24M${bx - 8},${by - 14}l2,24M${bx + 8},${by - 14}l-2,24M${bx + 24},${by - 14}l-6,24" stroke="#5a3428" stroke-width="2"/>`);
    o.push(`<path d="M${bx - 22},${by - 14}C${bx - 26},${by - 34} ${bx - 12},${by - 40} ${bx - 10},${by - 58}C${bx - 4},${by - 44} ${bx + 2},${by - 64} ${bx + 4},${by - 76}C${bx + 12},${by - 56} ${bx + 24},${by - 40} ${bx + 22},${by - 14}Z" fill="#ffa040"/><path d="M${bx - 10},${by - 14}C${bx - 12},${by - 26} ${bx - 2},${by - 32} ${bx + 2},${by - 44}C${bx + 8},${by - 30} ${bx + 12},${by - 22} ${bx + 10},${by - 14}Z" fill="#fff0b0"/>`);
    o.push(`<g fill="#ffd08a"><circle cx="${bx + 8}" cy="${by - 92}" r="1.6"/><circle cx="${bx - 6}" cy="${by - 110}" r="1.3"/><circle cx="${bx + 16}" cy="${by - 124}" r="1"/></g>`);
    S.add(o.join(''));
  }

  // --- low wattle fence at the yard's left edge, ruts and puddles in the yard -----------------------------------
  {
    let posts = '', weave = '';
    for (let x = -10; x < 170; x += 26) posts += `M${x},${GY + 40}v-46`;
    for (const y of [GY + 4, GY + 16, GY + 28]) weave += `M-10,${y}Q80,${y - 6} 170,${y + 2}`;
    S.add(`<path d="${weave}" stroke="#3a2628" stroke-width="5" fill="none"/><path d="${posts}" stroke="#2a1a1e" stroke-width="6" stroke-linecap="round"/>`);
    S.add(`<path d="M300,${H}C420,760 560,690 700,650M520,${H}C600,780 700,700 780,660" fill="none" stroke="#120c10" stroke-width="5" opacity=".4"/>`);
    let pud = '';
    for (const [x, y, rx] of [[460, 700, 40], [1240, 720, 60], [980, 690, 30]]) pud += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${f(rx * 0.12)}"/>`;
    S.add(`<g fill="#b07a6a" opacity=".45">${pud}</g>`);
  }

  // --- grading: cooling toward night, vignette, the calm dark yard under the dialogue box ----------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#ff9a60', 0.08], [0.5, '#ff9a60', 0], [1, '#1a1440', 0.32]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.45, '#0e0a16', 0], [1, '#0e0a16', 0.62]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  S.add(`<rect y="610" width="${W}" height="290" fill="${S.lin([[0, '#0c0a10', 0], [1, '#0c0a10', 0.72]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 林边水道泥滩·夜 (07) — where the wood runs down to a bend of the tidal channel. Low tide: the channel is a
// ribbon of water in a bed of wet mud cut by narrow gullies. Salt trees stand on their bared roots along the
// near bank; on the big trunk, at chest height, a ring of char; blue smoke hangs low under the branches. A dry
// root sticks up out of the mud, an old fence with every nail pulled stands on the far bank, an old mooring post
// leans by the water, and the channel runs on to the stone steps of the inn's back door, one eave lamp in the
// gap between the trees. Blue-black night, wet mud glinting; no reflections, no mirrors, no figures.
// ---------------------------------------------------------------------------------------------
const CH = {
  sky: [[0, '#070a14'], [0.3, '#101828'], [0.5, '#1e2a42'], [0.56, '#26344e'], [1, '#070a12']],
  far: '#0c1220', trunk: '#141a26', trunkLit: '#2a3448', rim: '#8eaee0', moon: '#cfe0ff',
  mud: [[0, '#1e2636'], [0.35, '#151b28'], [1, '#06080e']], mudLit: '#9ab4dc', water: '#121a2c', waterLit: '#6a8ac0',
  smoke: '#5a8ad8', lamp: '#ffc070', char: '#050608', ash: '#8a8e98', wood: '#2e2a30', woodLit: '#5a5664',
};

// a salt tree: a trunk standing on an arch of bared prop roots planted in the mud.
// Returns path data: trunk, roots (filled, tapered), lit (left flank strokes) and the trunk's top point.
function saltTree(R, x, base, h, w, lean, spread = 1) {
  const top = [x + lean, base - h];
  const xl = (u) => x - w / 2 + (lean - w * 0.18) * u, xr = (u) => x + w / 2 + (lean - w * 0.82 + w * 0.64) * u; // flanks at height fraction u
  const foot = base - h * 0.13; // the trunk ends where the roots fan out
  const trunk = `M${r0(x - w * 0.42)},${r0(foot)}C${r0(xl(0.3))},${r0(base - h * 0.5)} ${r0(xl(0.7))},${r0(base - h * 0.8)} ${r0(top[0] - w * 0.3)},${r0(top[1])}L${r0(top[0] + w * 0.3)},${r0(top[1])}C${r0(xr(0.7) - w * 0.2)},${r0(base - h * 0.8)} ${r0(xr(0.3) - w * 0.1)},${r0(base - h * 0.5)} ${r0(x + w * 0.42)},${r0(foot)}Z`;
  let roots = '';
  const n = 9;
  for (let i = 0; i < n; i++) {
    const u = (i / (n - 1) - 0.5) * 2, out = u * w * (0.9 + 0.9 * Math.abs(u)) * spread * R.range(0.85, 1.15);
    const p0 = [x + u * w * 0.34, foot + 8 - Math.abs(u) * h * 0.03], p1 = [x + out, base + Math.abs(u) * 5 + R.range(-3, 3)];
    const c = [x + out * 0.8, Math.min(p0[1], p1[1]) - h * (0.03 + 0.03 * (1 - Math.abs(u)))];
    roots += taper(p0, c, p1, w * (0.3 - Math.abs(u) * 0.08), w * 0.1);
  }
  const lit = `M${r0(x - w * 0.4)},${r0(foot)}C${r0(xl(0.3) + 2)},${r0(base - h * 0.5)} ${r0(xl(0.7) + 2)},${r0(base - h * 0.8)} ${r0(top[0] - w * 0.28)},${r0(top[1])}`;
  return { trunk, roots, lit, top };
}

function forestChannelNight() {
  const S = new Scene('sbChannelNight', '林边水道泥滩·夜：退潮后的窄沟与湿泥，盐树裸露的根，树干齐胸高的一圈焦痕，枝下低挂的蓝烟，泥里露出的干树根，拔空了钉子的老篱笆与老拴船柱，水道尽头旅店后门的石阶与一点檐灯', 6401);
  const R = S.R;
  const HZ = 452;

  // --- sky, a veiled moon behind the wood (upper left), a few stars -------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(CH.sky)}"/>`);
  S.add(`<circle cx="300" cy="120" r="520" fill="${S.rad([[0, '#9ab8f0', 0.35], [0.25, '#4a6aa8', 0.12], [1, '#2a3a68', 0]])}"/>`);
  S.add(stars(R, 60, [500, 0, W, 300], { maxR: 1.2, fill: '#dce8ff', op: [0.15, 0.7] }));
  S.add(`<path d="${band(600, 1500, 190, 12, R, 6)}" fill="#2a3a5a" opacity=".6"/><path d="${band(900, 1660, 250, 8, R, 4)}" fill="#24304c" opacity=".5"/>`);

  // --- the far bank: a black tree line; the inn's back roof among the trees, its eave lamp; the steps -------
  S.add(`<path d="${treeLine(R, 760, 1640, HZ + 2, 90, 200, HZ + 60, { step: 24, spireP: 0.4 })}" fill="${CH.far}"/>`);
  {
    // the inn's back: a dark roof wedge, the back door with a thin warm line, a lamp under the eave, the steps
    const o = [];
    o.push(`<path d="M1050,${HZ - 6}V${HZ - 70}L1110,${HZ - 108}L1220,${HZ - 108}L1260,${HZ - 70}V${HZ - 6}Z" fill="#0a0e18"/><path d="M1050,${HZ - 70}L1110,${HZ - 108}" stroke="${CH.rim}" stroke-width="1.6" opacity=".45"/>`);
    o.push(`<path d="M1120,${HZ - 6}V${HZ - 44}h26V${HZ - 6}z" fill="#05070c"/><path d="M1133,${HZ - 6}V${HZ - 44}" stroke="${CH.lamp}" stroke-width="1.4" opacity=".6"/>`);
    o.push(`<circle cx="1100" cy="${HZ - 58}" r="54" fill="${S.rad([[0, CH.lamp, 0.55], [0.3, '#ff9a50', 0.16], [1, '#ff9a50', 0]])}"/><path d="M1096,${HZ - 64}h8v12h-8z" fill="#ffe0a8"/><path d="M1100,${HZ - 70}v-4" stroke="#0a0a0e" stroke-width="1.5"/>`);
    // stone steps down from the door to the channel: five slabs, lit edges
    let st = '', stL = '';
    for (let i = 0; i < 6; i++) { const y = HZ - 6 + i * 6, x0 = 1112 - i * 10, x1 = 1158 + i * 4; st += `M${x0},${y}h${x1 - x0}v6h-${x1 - x0}z`; stL += `M${x0},${y}h${x1 - x0}`; }
    o.push(`<path d="${st}" fill="#2a3040"/><path d="${stL}" stroke="#6a7ea8" stroke-width="1.2" opacity=".6"/>`);
    S.add(o.join(''));
  }
  // trunks between the far trees, the lamp showing through a gap
  S.add(`<path d="M980,${HZ + 4}V${HZ - 140}h10V${HZ + 4}zM1290,${HZ + 4}V${HZ - 160}h12V${HZ + 4}zM1380,${HZ + 4}V${HZ - 120}h9V${HZ + 4}z" fill="#080b14"/>`);

  // --- the channel bed and the mud flats (low tide), the ribbon of water ----------------------------------
  S.add(`<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="${S.lin(CH.mud, `gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="${H}"`)}"/>`);
  // the bed: a darker trough curving from the steps (far right) toward us and out at the bottom
  const bed = `M1100,${HZ + 22}C1000,${HZ + 30} 900,${HZ + 44} 860,${HZ + 80}C820,${HZ + 120} 900,${HZ + 170} 960,${HZ + 220}C1040,${HZ + 290} 1100,${HZ + 360} 1120,${H + 10}H560C640,${HZ + 360} 700,${HZ + 280} 700,${HZ + 210}C700,${HZ + 140} 620,${HZ + 90} 700,${HZ + 54}C780,${HZ + 30} 960,${HZ + 18} 1100,${HZ + 14}Z`;
  S.add(`<path d="${bed}" fill="#0c1018"/>`);
  const water = `M1090,${HZ + 18}C990,${HZ + 26} 880,${HZ + 40} 820,${HZ + 70}C770,${HZ + 100} 810,${HZ + 150} 860,${HZ + 210}C920,${HZ + 280} 960,${HZ + 360} 960,${H + 10}H760C790,${HZ + 360} 790,${HZ + 280} 780,${HZ + 220}C770,${HZ + 150} 720,${HZ + 100} 760,${HZ + 62}C820,${HZ + 34} 960,${HZ + 20} 1090,${HZ + 16}Z`;
  S.add(`<path d="${water}" fill="${CH.water}"/>`);
  S.add(currents(R, 780, 940, HZ + 60, H, 22, CH.waterLit, 0.45, 1));
  // the bed's wet slopes catch the moon: glints along both edges
  S.add(`<path d="M700,${HZ + 54}C620,${HZ + 90} 700,${HZ + 140} 700,${HZ + 210}M860,${HZ + 80}C900,${HZ + 60} 1000,${HZ + 34} 1100,${HZ + 22}" fill="none" stroke="${CH.mudLit}" stroke-width="2" opacity=".5"/>`);
  // narrow gullies cut through the flats and running into the channel, wet and shining
  const gullies = [
    [[240, HZ + 40], [360, HZ + 70], [470, HZ + 76], [600, HZ + 100], [690, HZ + 110]],
    [[120, HZ + 150], [300, HZ + 160], [480, HZ + 190], [640, HZ + 196], [700, HZ + 200]],
    [[1600, HZ + 70], [1450, HZ + 90], [1300, HZ + 130], [1150, HZ + 150], [990, HZ + 180]],
    [[1560, HZ + 230], [1400, HZ + 236], [1250, HZ + 270], [1100, HZ + 300]],
  ];
  let gd = '', gl = '';
  for (const g of gullies) { gd += shape(g, false, 0); gl += shape(g.map(([x, y]) => [x - 2, y - 2]), false, 0); }
  S.add(`<path d="${gd}" fill="none" stroke="#04060a" stroke-width="7" stroke-linecap="round"/><path d="${gl}" fill="none" stroke="${CH.mudLit}" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>`);
  S.add(mudSheen(R, 0, 700, HZ + 20, 760, 46, CH.mudLit, 0.4) + mudSheen(R, 960, 1600, HZ + 20, 760, 46, CH.mudLit, 0.4));

  // --- the old mooring post leaning by the water, rope grooves and an iron ring --------------------------------
  {
    const x = 930, b = HZ + 132, h = 150;
    S.add(`<path d="M${x - 14},${b}L${x - 4},${b - h}h22L${x + 16},${b}Z" fill="#221e26"/><path d="M${x - 14},${b}L${x - 4},${b - h}h7L${x - 5},${b}Z" fill="#4a4656"/><path d="M${x - 6},${b - h}h24l-2,-8h-20z" fill="#3a3640"/>`);
    S.add(`<path d="M${x - 8},${b - 96}q12,5 24,0M${x - 9},${b - 86}q12,5 24,0M${x - 10},${b - 30}h24" stroke="#14121a" stroke-width="3" fill="none"/><circle cx="${x + 4}" cy="${b - 60}" r="9" fill="none" stroke="#4a5060" stroke-width="3"/><path d="M${x - 4},${b - 66}a9,9 0 0 1 8,-3" stroke="${CH.rim}" stroke-width="1.5" fill="none" opacity=".7"/>`);
    S.add(`<path d="M${x - 14},${b}h30" stroke="#04060a" stroke-width="5"/><path d="M${x - 4},${b - h}L${x - 14},${b}" stroke="${CH.rim}" stroke-width="1.8" opacity=".6"/>`);
  }

  // --- the old fence on the far-right bank: boards on two posts, every nail pulled (empty holes, rust runs) ---
  {
    const o = [];
    const bx = 1180, by = HZ + 110;
    o.push(`<path d="M${bx},${by}V${by - 110}M${bx + 190},${by - 6}V${by - 104}" stroke="${CH.wood}" stroke-width="12"/><path d="M${bx - 5},${by}V${by - 110}M${bx + 185},${by - 6}V${by - 104}" stroke="${CH.woodLit}" stroke-width="2" opacity=".6"/>`);
    let boards = '', holes = '', rust = '';
    for (const [i, y] of [by - 96, by - 72, by - 48].entries()) {
      const tilt = [-4, 6, -10][i], x0 = bx - 18, x1 = bx + 210;
      boards += `M${x0},${y}L${x1},${y + tilt}l0,16L${x0},${y + 16}Z`;
      for (const xx of [bx, bx + 190]) { const yy = y + 8 + (tilt * (xx - x0)) / (x1 - x0); holes += circ(xx - 6, yy, 2.2) + circ(xx + 6, yy, 2.2); rust += `M${xx - 6},${r0(yy + 2)}v7M${xx + 6},${r0(yy + 2)}v5`; }
    }
    o.push(`<path d="${boards}" fill="#3a3844"/><path d="${boards}" fill="none" stroke="#14121a" stroke-width="1.5"/>`);
    o.push(`<path d="${rust}" stroke="#5a3a30" stroke-width="2" opacity=".8"/><path d="${holes}" fill="#05060a"/>`);
    o.push(`<path d="M${bx - 18},${by - 96}L${bx + 210},${by - 100}" stroke="${CH.rim}" stroke-width="1.5" opacity=".5"/>`);
    // a fallen board half sunk in the mud
    o.push(`<path d="M${bx + 40},${by + 30}l120,-14l2,12l-120,14z" fill="#2a2834"/><path d="${circ(bx + 70, by + 30, 2)}${circ(bx + 130, by + 23, 2)}" fill="#05060a"/>`);
    S.add(o.join(''));
  }

  // --- near bank: salt trees on bared roots (left), the big trunk with the char ring, branches overhead -----
  {
    const o = [];
    const T = [saltTree(R, 110, HZ + 130, 600, 58, 24, 1.1), saltTree(R, 330, HZ + 66, 520, 44, -14, 1), saltTree(R, 500, HZ + 34, 470, 34, 16, 0.9)];
    const big = saltTree(R, 700, HZ + 112, 660, 88, -30, 1.1);
    const all = [...T, big];
    // limbs reaching right over the channel and up into the canopy (tapered)
    let limbs = '';
    limbs += taper([big.top[0] + 10, big.top[1] + 150], [820, HZ - 450], [1030, HZ - 420], 36, 8);
    limbs += taper([big.top[0] + 14, big.top[1] + 250], [840, HZ - 340], [960, HZ - 300], 26, 6);
    limbs += taper([1030, HZ - 420], [1080, HZ - 400], [1110, HZ - 360], 8, 3) + taper([900, HZ - 432], [930, HZ - 470], [970, HZ - 490], 10, 3);
    limbs += taper([960, HZ - 300], [985, HZ - 290], [1000, HZ - 262], 6, 2) + taper([1010, HZ - 452], [1040, HZ - 470], [1066, HZ - 476], 6, 2);
    limbs += taper([T[2].top[0], T[2].top[1] + 120], [580, HZ - 330], [640, HZ - 290], 14, 4);
    limbs += taper([T[0].top[0], T[0].top[1] + 80], [220, HZ - 420], [260, HZ - 480], 18, 5);
    const body = all.map((t) => t.trunk + t.roots).join('') + limbs;
    o.push(`<path d="${body}" fill="${CH.rim}" opacity=".6" transform="translate(-3.5 -2)"/><path d="${body}" fill="#090c14"/>`);
    o.push(`<path d="${all.map((t) => t.lit).join('')}" fill="none" stroke="${CH.trunkLit}" stroke-width="7" opacity=".9" transform="translate(4 0)"/>`);
    // root foots sunk in the wet mud: dark ovals and a glint
    let feet = '';
    for (const t of all) feet += t.roots.match(/M[^L]+/g).length ? '' : '';
    o.push(feet);
    // the char ring at chest height on the big trunk: a ragged black band hugging the bark, grey ash at its edges
    {
      const cy = HZ + 112 - 212, w0 = 88 * 0.84, cx = 700 - 10, k = 6;
      let top = '', bot = '';
      const N = 12;
      const tp = [], bt = [];
      for (let i = 0; i <= N; i++) { const u = i / N, x = cx - w0 / 2 + w0 * u, arc = Math.sin(Math.PI * u) * k; tp.push([x, cy - 18 + arc + R.range(-4, 4)]); bt.push([x, cy + 20 + arc + R.range(-5, 4)]); }
      o.push(`<path d="${pz([...tp, ...bt.reverse()])}" fill="${CH.char}"/>`);
      top = pl(tp); bot = pl([...bt].reverse());
      o.push(`<path d="${top}${bot}" fill="none" stroke="${CH.ash}" stroke-width="2" opacity=".4"/>`);
      o.push(`<path d="M${r0(cx - w0 / 2)},${cy - 50}h${r0(w0)}v120h${r0(-w0)}z" fill="${S.lin([[0, '#000', 0], [0.4, '#000', 0.5], [0.6, '#000', 0.5], [1, '#000', 0]])}"/>`);
      o.push(`<path d="M${r0(cx - 24)},${cy - 8}q4,10 -2,20M${r0(cx + 6)},${cy - 10}q-5,12 2,22M${r0(cx + 26)},${cy - 6}q3,8 -1,16" stroke="#3a3e4c" stroke-width="2" fill="none"/>`);
      o.push(`<path d="M${r0(cx - w0 / 2 + 4)},${cy - 14}l-10,-4l6,10zM${r0(cx - w0 / 2 + 2)},${cy + 16}l-9,5l9,2z" fill="#4a4e5c"/>`);
    }
    // canopy overhead: leaf masses (dark undersides, moonlit tops) from the left trees across the top of the frame
    // canopy: a ragged mass of leaves along the top edge (scalloped underside), moonlit tufts on its left edges
    let cn = 'M-20,-20H1200';
    const lowEdge = (x) => 70 + 120 * Math.max(0, 1 - Math.abs(x - 380) / 640) + 26 * Math.sin(x / 47);
    for (let x = 1200; x > -40; x -= R.range(26, 48)) { const y = lowEdge(x), rr = R.range(18, 34); cn += `L${r0(x)},${r0(y - rr * 0.3)}A${r0(rr)},${r0(rr)} 0 0 1 ${r0(x - rr * 1.4)},${r0(y + R.range(-8, 8))}`; }
    cn += 'L-20,-20Z';
    o.push(`<path d="${cn}" fill="#2a3a5e" opacity=".55" transform="translate(-4 -4)"/><path d="${cn}" fill="#06080e"/>`);
    let tufts = '';
    for (let i = 0; i < 26; i++) { const x = R.range(-20, 1180), y = lowEdge(x) - R.range(10, 60), rr = R.range(6, 14); tufts += circ(x, y, rr); }
    o.push(`<path d="${tufts}" fill="#1a2640" opacity=".8"/>`);
    S.add(o.join(''));
  }

  // --- blue smoke hanging low beneath the branches ---------------------------------------------------------------
  {
    let puffs = '';
    for (let i = 0; i < 22; i++) { const x = R.range(160, 1180), y = HZ - 300 + R.range(-30, 60) + (x - 160) * 0.06, rr = R.range(30, 70); puffs += `M${r0(x - rr * 1.8)},${r0(y)}a${r0(rr * 1.8)},${r0(rr * 0.5)} 0 1 0 ${r0(rr * 3.6)},0a${r0(rr * 1.8)},${r0(rr * 0.5)} 0 1 0 ${r0(-rr * 3.6)},0`; }
    S.add(`<g filter="${S.blur(3)}"><path d="${puffs}" fill="${CH.smoke}" opacity=".32"/><path d="${band(300, 1160, HZ - 250, 40, R, 18)}" fill="${CH.smoke}" opacity=".3"/><path d="${band(520, 1300, HZ - 196, 26, R, 10)}" fill="${CH.smoke}" opacity=".24"/></g>`);
  }
  S.add(`<g filter="${S.blur(1)}"><path d="${band(420, 1000, HZ - 236, 6, R, 4)}" fill="#a8c8ff" opacity=".35"/></g>`);

  // --- the dry root sticking up out of the mud (left of the channel, near): a bleached, gnarled fork ------------
  {
    const x = 470, y = HZ + 164;
    const d = taper([x, y + 4], [x - 6, y - 40], [x - 30, y - 92], 34, 9) + taper([x - 4, y - 36], [x + 30, y - 56], [x + 52, y - 104], 18, 5) + taper([x - 20, y - 70], [x - 52, y - 84], [x - 64, y - 76], 9, 3) + taper([x + 6, y + 2], [x + 40, y - 4], [x + 66, y - 22], 14, 4);
    S.add(`<ellipse cx="${x + 4}" cy="${y + 4}" rx="60" ry="7" fill="#04060a" opacity=".75"/><path d="${d}" fill="#4a4a56"/><path d="${d}" fill="#9aa2bc" opacity=".35" transform="translate(-2 -2)"/><path d="${d}" fill="#3a3a46" transform="translate(2 1)"/>`);
  }

  // --- grading: deep blue night, darker corners, the calm dark mud under the dialogue box ----------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#3a5aa0', 0.08], [0.5, '#3a5aa0', 0], [1, '#02030a', 0.3]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.42, '#03050a', 0], [1, '#03050a', 0.66]], 'cx="0.55" cy="0.48" r="0.75"')}"/>`);
  S.add(`<rect y="610" width="${W}" height="290" fill="${S.lin([[0, '#03050a', 0], [1, '#03050a', 0.7]])}"/>`);
  return S.out();
}

export const marshBgs = {
  'salt-marsh-bridge': saltMarshBridge,
  'forest-edge-inn': forestEdgeInn,
  'forest-edge-channel-night': forestChannelNight,
};
