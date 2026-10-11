// 旧磨坊 (chapter 04): old-mill-dusk (outside, from the reeds) and old-mill-floor (the millstone floor).
// The mill keeps the silhouette the two mill-road views show from afar (bg-mill.mjs `oldMill`): a tapered
// tower with a boat-shaped cap and bare sail frames — the 204° arm snapped, its frame dangling — and a low
// mill house on its right with the chimney at the far end. Up close the tower is a smock on a stone base
// ("石砌的底座，木造的上層"), a low stone wheel-house leans on its left side with the big water wheel
// stuck in the half-dry race, and the dry channel runs under the wheel into the wall foot behind an iron grate.
//   old-mill-dusk  — late dusk turning to night (it doubles as the night scene of 04-11): the sun gone into
//                    the reeds, the attic window lit, the chimney smoking, two guards at the fire by the
//                    loading door, the knee-high bell cord strung through the reeds, the upstream gate shut.
//   old-mill-floor — the vertical shaft through floor and ceiling, the wreath-like rack of black crystals
//                    pulsing violet, two thin chains under the cloth of the cage, the table with slate and
//                    ledger, the row of collars and one huge collar on the wall, sacks and old flour dust,
//                    the trapdoor by the shaft, and lamplight leaking down the stair from the attic.
import { Scene, W, H, f, pz, pl, cloud, cloudCluster, ridge, band, tree, stars, bird, noise1, persp } from './lib.mjs';
import { plume } from './bg-mill.mjs';

const r0 = (v) => f(v, 0);
const circ = (cx, cy, r) => `M${r0(cx - r)},${r0(cy)}a${r0(r)},${r0(r)} 0 1 0 ${r0(r * 2)},0a${r0(r)},${r0(r)} 0 1 0 ${r0(-r * 2)},0`;

// ---------------------------------------------------------------------------------------------
// shared painters
// ---------------------------------------------------------------------------------------------

// A bank of reeds standing on a base line, its ragged top following top(x); stalk texture, a few long
// leaves, and plumes on the tips (plumeL(x) sets their length so near banks get big feathery heads).
function reedBank(S, R, o) {
  const { x0, x1, top, base, pal, seed, step = 6, amp = 14, plumeP = 0.45, plumeL, lean = 1, leafP = 0.12, stalkW = 1.4 } = o;
  const n = noise1(seed, 34), n2 = noise1(seed + 5, 9);
  const dir = Math.sign(x1 - x0) || 1;
  const outline = [], tips = [];
  for (let x = x0; dir > 0 ? x <= x1 + 0.1 : x >= x1 - 0.1; x += dir * step) {
    const y = top(x) + amp * (n(x) * 0.75 + n2(x) * 0.35);
    tips.push([x, y]);
    outline.push([x, y], [x + dir * step * 0.5, y + R.range(2, 7)]);
  }
  const yMin = Math.min(...tips.map((t) => t[1]));
  const fill = S.lin(pal.fill, `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(yMin)}" x2="0" y2="${r0(base)}"`);
  let svg = `<path d="${pz([...outline, [x1, base], [x0, base]])}" fill="${fill}"/>`;
  let st = '', hi = '', leaves = '';
  for (const [x, y] of tips) {
    if (R() < 0.85) { const len = (base - y) * R.range(0.12, 0.45); st += `M${r0(x + R.range(-2, 2))},${r0(y + R.range(0, 6))}l${f(lean * len * 0.03, 0)},${r0(len)}`; }
    if (pal.hi && R() < 0.35) { const len = (base - y) * R.range(0.1, 0.3); hi += `M${r0(x + R.range(-2, 2))},${r0(y + 2)}l${f(lean * len * 0.02, 0)},${r0(len)}`; }
    if (R() < leafP) {
      const y0 = y + (base - y) * R.range(0.08, 0.3), L = Math.min(70, (base - y) * R.range(0.18, 0.32)), d = R() < 0.5 ? -1 : 1, wd = Math.max(1.5, L * 0.05);
      leaves += `M${r0(x)},${r0(y0)}q${r0(d * L * 0.5)},${r0(-L * 0.35)} ${r0(d * L)},${r0(L * 0.12)}q${r0(-d * L * 0.45)},${r0(-L * 0.2)} ${r0(-d * L)},${r0(wd)}z`;
    }
  }
  svg += `<path d="${st}" fill="none" stroke="${pal.stalk}" stroke-width="${stalkW}" stroke-linecap="round" opacity=".55"/>`;
  if (hi) svg += `<path d="${hi}" fill="none" stroke="${pal.hi}" stroke-width="${stalkW}" stroke-linecap="round" opacity=".45"/>`;
  if (leaves) svg += `<path d="${leaves}" fill="${pal.leaf}" opacity=".6"/>`;
  let pb = '', pe = '';
  for (const [x, y] of tips) {
    if (R() > plumeP) continue;
    const L = plumeL(x) * R.range(0.75, 1.1);
    if (L < 2.5) continue;
    const { body, edge } = plume(x, y + L * 0.05, L, R.range(22, 58) * lean, R.range(0.18, 0.26));
    pb += body; if (L > 7) pe += edge;
  }
  svg += `<path d="${pb}" fill="${pal.plume}"/>`;
  if (pe && pal.rim) svg += `<path d="${pe}" fill="none" stroke="${pal.rim}" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`;
  return svg;
}

// ---------------------------------------------------------------------------------------------
// 旧磨坊·黄昏芦苇
// ---------------------------------------------------------------------------------------------
const MX = 790, MS = 2.5, GY = 596, HZ = 556; // mill centre x, scale (same build as bg-mill oldMill), ground line, horizon
const P = {
  stone: { lit: '#6a4c58', mid: '#4e3a4a', shade: '#33263a', course: '#1e1624', moss: '#3a3e30' },
  wood: { lit: '#5a3c48', shade: '#2e2030', board: '#160e18', roof: '#3a2434', roofLit: '#5e3a48', frame: '#22161e' },
  rim: '#ffb27a', rimHot: '#ffd8a0', win: '#ffcf7a', winHot: '#fff2c8',
  fire: { glow: '#ff9a48', body: '#ffa040', core: '#fff0b0', tip: '#e8602e' },
  ink: '#140c14',
};

// The water wheel, almost face-on in front of the wheel-house wall: two rims (the back one offset by the
// wheel's width), 8 spokes, 20 floats between the rims, the square hub and axle block; lit from the left.
function waterWheel(cx, cy, r, sq = 0.9) {
  const rx = r * sq, d = r * 0.075; // back rim offset (to the right/up: we see the wheel slightly from the left)
  const at = (a, rr = 1, back = 0) => [cx + Math.cos(a) * rx * rr + back * d, cy + Math.sin(a) * r * rr - back * d * 0.35];
  const ring = (rr, back) => { let s = ''; for (let i = 0; i <= 48; i++) { const p = at(i / 48 * Math.PI * 2, rr, back); s += (i ? 'L' : 'M') + `${r0(p[0])},${r0(p[1])}`; } return s + 'Z'; };
  const out = [];
  // back rim + the floats spanning the two rims
  out.push(`<path d="${ring(1, 1)}${ring(0.84, 1)}" fill="${P.wood.frame}" fill-rule="evenodd"/>`);
  let floats = '', floatLit = '';
  for (let i = 0; i < 20; i++) {
    const a = i / 20 * Math.PI * 2 + 0.08;
    const q = [at(a, 0.82, 0), at(a, 1.07, 0), at(a, 1.07, 1), at(a, 0.82, 1)];
    floats += pz(q);
    if (Math.cos(a) < 0.2 && Math.sin(a) < 0.3) floatLit += pl([at(a, 0.84, 0), at(a, 1.07, 0)]);
  }
  out.push(`<path d="${floats}" fill="#2a1c26" stroke="${P.wood.frame}" stroke-width="2"/>`);
  out.push(`<path d="${floatLit}" stroke="${P.rim}" stroke-width="2" opacity=".55"/>`);
  // spokes: pairs of arms from the hub to the front rim
  let sp = '';
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2; sp += pl([at(a, 0.12), at(a, 0.86)]); }
  out.push(`<path d="${sp}" stroke="${P.wood.frame}" stroke-width="${f(r * 0.07)}" stroke-linecap="round"/>`);
  out.push(`<path d="${sp}" stroke="#3e2a34" stroke-width="${f(r * 0.035)}" stroke-linecap="round"/>`);
  // front rim (felloes) + its lit upper-left arc
  out.push(`<path d="${ring(1, 0)}${ring(0.84, 0)}" fill="#3a2832" fill-rule="evenodd"/>`);
  let arc = '';
  for (let i = 0; i <= 12; i++) { const p = at(Math.PI * (0.92 + i / 12 * 0.62), 1); arc += (i ? 'L' : 'M') + `${r0(p[0])},${r0(p[1])}`; }
  out.push(`<path d="${arc}" fill="none" stroke="${P.rim}" stroke-width="3" stroke-linecap="round" opacity=".75"/>`);
  let joints = '';
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2 + Math.PI / 8; joints += pl([at(a, 0.84), at(a, 1)]); }
  out.push(`<path d="${joints}" stroke="${P.ink}" stroke-width="2" opacity=".7"/>`);
  // hub block and axle
  out.push(`<path d="M${r0(cx - r * 0.14)},${r0(cy - r * 0.14)}h${r0(r * 0.28)}v${r0(r * 0.28)}h${r0(-r * 0.28)}z" fill="#2a1c24"/><path d="M${r0(cx - r * 0.14)},${r0(cy + r * 0.14)}V${r0(cy - r * 0.14)}H${r0(cx + r * 0.14)}" fill="none" stroke="${P.rim}" stroke-width="2" opacity=".6"/>`);
  out.push(`<circle cx="${r0(cx)}" cy="${r0(cy)}" r="${f(r * 0.06)}" fill="#120a10"/>`);
  return out.join('');
}

function oldMillDusk() {
  const S = new Scene('sbOldMill', '旧磨坊·黄昏芦苇：石砌底座木造上层的磨坊，卡住的大水轮，干水渠口的铁栅，冒烟的烟囱，门口火堆与守卫', 6101);
  const R = S.R;

  // --- sky: late dusk, the sun already gone into the reeds (left), first stars ------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#1c1a36'], [0.16, '#342a4e'], [0.33, '#663e5a'], [0.47, '#a85a58'], [0.57, '#d68054'], [0.62, '#eaa264'], [0.7, '#4a3236'], [1, '#1a1618']])}"/>`);
  S.add(`<circle cx="420" cy="${HZ + 6}" r="900" fill="${S.rad([[0, '#ffd8a0', 0.85], [0.06, '#ffb674', 0.66], [0.2, '#e47e56', 0.32], [0.5, '#a85068', 0.08], [1, '#a85068', 0]])}"/>`);
  S.add(stars(R, 46, [0, 0, W, 230], { maxR: 1.2, fill: '#f0e4ff', op: [0.15, 0.7] }));
  const cc = { lit: '#a25c62', shade: '#36263f', rim: '#f6a67e' }, cfar = { lit: '#9e6068', shade: '#46304c', rim: null };
  S.add(`<g opacity=".85">${cloud(R, 1060, 412, 260, 30, cfar, { bumps: 5 })}${cloud(R, 1360, 380, 210, 28, cfar, { bumps: 5 })}${cloud(R, 120, 400, 200, 26, cfar, { bumps: 4 })}</g>`);
  S.add(`<path d="${band(240, 1300, 462, 9, R)}" fill="#ffb886" opacity=".5"/><path d="${band(860, 1640, 492, 6, R)}" fill="#f6a070" opacity=".45"/><path d="${band(-40, 560, 486, 7, R)}" fill="#ffd09a" opacity=".5"/>`);
  S.add(cloudCluster(R, 1250, 196, 300, 78, cc, { bumps: 6 }));
  S.add(cloud(R, 230, 150, 230, 40, cc, { bumps: 5 }) + cloud(R, 1490, 300, 150, 26, cc, { bumps: 4 }));

  // --- far land: hazy hills, the reed sea to the horizon --------------------------------------------
  S.add(ridge(S, { step: 14, base: HZ - 6, amp: 10, period: 230, seed: 611, fill: '#6a4660', shade: '#52364e', shadeOp: 0.45, rim: '#ffb888', rimOp: 0.55, peaks: [[1380, 26, 280], [160, 20, 240]], bottom: HZ + 20 }).svg);
  S.add(`<rect y="${HZ - 50}" width="${W}" height="80" fill="${S.lin([[0, '#ffc488', 0], [0.7, '#ffc488', 0.42], [1, '#ffc488', 0]])}"/>`);
  S.add(`<path d="M-20,${HZ - 3}C400,${HZ - 6} 1100,${HZ - 7} 1620,${HZ - 4}V${HZ + 40}H-20Z" fill="#7a4a4c"/>`);
  // the knoll the mill stands on, and the trodden yard in front of it
  S.add(`<path d="M-20,${GY + 6}C300,${GY + 2} 420,${GY - 10} 560,${GY - 12}C800,${GY - 16} 1080,${GY - 14} 1240,${GY - 4}C1400,${GY + 4} 1500,${GY + 6} 1620,${GY + 8}V${H}H-20Z" fill="${S.lin([[0, '#3e2c34'], [0.15, '#2c2028'], [1, '#141014']], `gradientUnits="userSpaceOnUse" x1="0" y1="${GY - 16}" x2="0" y2="${H}"`)}"/>`);
  S.add(`<path d="M400,${GY - 6}C470,${GY - 11} 520,${GY - 12} 560,${GY - 12}" fill="none" stroke="${P.rim}" stroke-width="2" opacity=".5"/>`);

  // --- back reeds around the knoll, the tree behind the house ----------------------------------------
  const backPal = { fill: [[0, '#6e4250'], [1, '#2a1c26']], stalk: '#2a1a26', plume: '#b06e64', rim: '#ffc890', leaf: '#3a2430' };
  S.add(reedBank(S, R, { x0: -20, x1: 470, top: (x) => GY - 52 + (x / 470) * 14, base: GY + 14, pal: backPal, seed: 6111, step: 5, amp: 8, plumeP: 0.5, plumeL: () => 13 }));
  S.add(reedBank(S, R, { x0: 1620, x1: 1000, top: (x) => GY - 54 + ((1620 - x) / 620) * 16, base: GY + 14, pal: backPal, seed: 6112, step: 5, amp: 8, plumeP: 0.5, plumeL: () => 13 }));
  S.add(tree(R, 1050, GY - 6, 1.55, { lit: '#5a3a4a', shade: '#3a2636', trunk: '#24161e' }));

  // --- chimney smoke (behind the house) ------------------------------------------------------------
  const hx = MX + 46 * MS * 0.2, hw = 64 * MS, hh = 30 * MS;
  const chim = [hx + hw - 9.5 * MS, GY - hh - 28 * MS];
  {
    let puffs = '', lit = '';
    for (let i = 0; i < 15; i++) {
      const t = i / 14, px = chim[0] + 2 + 230 * t * t + Math.sin(t * 6.5) * 9, py = chim[1] - 4 - 380 * t, rr = 8 + 44 * t;
      puffs += circ(px, py, rr);
      lit += circ(px - rr * 0.3, py - rr * 0.25, rr * 0.55);
    }
    const fade = (c, a) => S.lin([[0, c, 0], [0.3, c, a * 0.7], [1, c, a]], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(chim[1] - 400)}" x2="0" y2="${r0(chim[1])}"`);
    S.add(`<g filter="${S.blur(1)}"><path d="${puffs}" fill="${fade('#3a2a40', 0.88)}"/><path d="${lit}" fill="${fade('#c08484', 0.45)}"/></g>`);
  }

  // --- the mill house (behind the tower, right) ----------------------------------------------------
  {
    const h = [];
    // chimney (stone)
    h.push(`<path d="M${r0(hx + hw - 14 * MS)},${r0(GY - hh - 12 * MS)}v${r0(-16 * MS)}h${r0(9 * MS)}v${r0(16 * MS)}z" fill="${P.stone.mid}"/><path d="M${r0(hx + hw - 14 * MS - 2)},${r0(GY - hh - 28 * MS)}h${r0(9 * MS + 4)}v5h${r0(-9 * MS - 4)}z" fill="${P.stone.shade}"/><path d="M${r0(hx + hw - 14 * MS)},${r0(GY - hh - 12 * MS)}v${r0(-16 * MS)}" stroke="${P.rim}" stroke-width="2" opacity=".6"/>`);
    // walls: stone footing, timber above; the far half in deeper shade
    const wTop = GY - hh, sTop = GY - hh * 0.45;
    h.push(`<path d="${pz([[hx, GY], [hx, wTop], [hx + hw, wTop], [hx + hw, GY]])}" fill="${P.wood.lit}"/>`);
    h.push(`<path d="${pz([[hx, GY], [hx, sTop], [hx + hw, sTop], [hx + hw, GY]])}" fill="${P.stone.mid}"/>`);
    h.push(`<path d="${pz([[hx + hw * 0.62, GY], [hx + hw * 0.62, wTop], [hx + hw, wTop], [hx + hw, GY]])}" fill="${P.ink}" opacity=".35"/>`);
    let boards = '';
    for (let x = hx + 8; x < hx + hw; x += 9) boards += `M${r0(x)},${r0(wTop + 2)}V${r0(sTop)}`;
    let courses = '';
    for (let y = sTop + 9, k = 0; y < GY; y += 9, k++) { courses += `M${r0(hx)},${r0(y)}H${r0(hx + hw)}`; for (let x = hx + (k % 2) * 11; x < hx + hw; x += 22) courses += `M${r0(x)},${r0(y - 9)}v9`; }
    h.push(`<path d="${boards}" stroke="${P.wood.board}" stroke-width="1.6" opacity=".55"/><path d="${courses}" stroke="${P.stone.course}" stroke-width="1.4" opacity=".45"/>`);
    h.push(`<path d="M${r0(hx)},${r0(sTop)}H${r0(hx + hw)}" stroke="${P.wood.board}" stroke-width="4"/>`);
    // front gable roof, the left slope catching the afterglow
    const apex = [hx + hw * 0.5, wTop - 18 * MS];
    h.push(`<path d="${pz([[hx - 3 * MS, wTop], apex, [hx + hw + 4 * MS, wTop]])}" fill="${P.wood.roof}"/><path d="${pz([apex, [hx + hw + 4 * MS, wTop], [hx + hw * 0.7, wTop]])}" fill="${P.ink}" opacity=".3"/>`);
    let shingles = '';
    for (let t = 0.2; t < 1; t += 0.2) shingles += `M${r0(apex[0] - (hw * 0.5 + 3 * MS) * t)},${r0(apex[1] + 18 * MS * t)}H${r0(apex[0] + (hw * 0.5 + 4 * MS) * t)}`;
    h.push(`<path d="${shingles}" stroke="${P.ink}" stroke-width="1.5" opacity=".35"/><path d="${pl([[hx - 3 * MS, wTop], apex])}" stroke="${P.rim}" stroke-width="2.5" stroke-linecap="round" opacity=".75"/>`);
    // hoist beam jutting from under the apex: pulley, rope and hook over the loading door
    h.push(`<path d="M${r0(apex[0] - 5)},${r0(apex[1] + 16)}h12v9h-12z" fill="#1e1420"/><circle cx="${r0(apex[0] + 1)}" cy="${r0(apex[1] + 30)}" r="4" fill="none" stroke="#1e1420" stroke-width="2"/><path d="M${r0(apex[0] - 3)},${r0(apex[1] + 30)}V${r0(wTop + 22)}" stroke="#2a1c22" stroke-width="1.5"/><path d="M${r0(apex[0] - 3)},${r0(wTop + 22)}q-4,0 -4,4q0,4 4,4" fill="none" stroke="#2a1c22" stroke-width="2"/>`);
    // window in the shaded half: a faint, banked glow
    h.push(`<path d="M${r0(hx + hw * 0.76)},${r0(wTop + 14)}h16v18h-16z" fill="#7a4a3a"/><path d="M${r0(hx + hw * 0.76 + 8)},${r0(wTop + 14)}v18M${r0(hx + hw * 0.76)},${r0(wTop + 23)}h16" stroke="#1e1420" stroke-width="2"/>`);
    S.add(h.join(''));
  }

  // --- the wheel-house leaning on the tower's left side -------------------------------------------
  const tw = 46 * MS, tt = 27 * MS, th = 116 * MS, tTop = GY - th, sSplit = GY - th * 0.38;
  const xl = (y) => MX - tw / 2 + (GY - y) / th * (tw - tt) / 2, xr = (y) => MX + tw / 2 - (GY - y) / th * (tw - tt) / 2;
  const WX = 572, WY = 508, WR = 116;
  {
    const a = [];
    const ax0 = 448, ax1 = xl(GY) + 4, top = GY - 104, eave = GY - 92;
    // lean-to roof sloping down to the left, front wall of rough stone
    a.push(`<path d="${pz([[ax0 - 14, eave + 6], [ax1, top - 26], [ax1, top - 14], [ax0 - 14, eave + 16]])}" fill="${P.wood.roof}"/><path d="${pl([[ax0 - 14, eave + 6], [ax1, top - 26]])}" stroke="${P.rim}" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>`);
    a.push(`<path d="${pz([[ax0, GY], [ax0, eave + 14], [ax1, top - 12], [ax1, GY]])}" fill="${P.stone.mid}"/>`);
    a.push(`<path d="${pz([[ax0, GY], [ax0, eave + 14], [ax0 + 16, eave + 11], [ax0 + 16, GY]])}" fill="${P.stone.lit}"/>`);
    let st = '';
    for (let y = GY - 12, k = 0; y > top - 10; y -= 13, k++) {
      const yRoof = (x) => eave + 14 + (top - 12 - eave - 14) * (x - ax0) / (ax1 - ax0);
      let x = ax0 + (k % 2) * 13;
      while (x < ax1) { const w2 = R.range(18, 30); if (y > yRoof(x) + 4) st += `M${r0(x)},${r0(y)}h${r0(Math.min(w2, ax1 - x))}M${r0(x)},${r0(y)}v13`; x += w2; }
    }
    a.push(`<path d="${st}" stroke="${P.stone.course}" stroke-width="1.5" opacity=".5"/>`);
    // moss creeping up from the race, a damp dark tide line
    a.push(`<path d="M${ax0},${GY - 20}C500,${GY - 26} 560,${GY - 18} 620,${GY - 24}S700,${GY - 20} ${r0(ax1)},${GY - 26}V${GY}H${ax0}Z" fill="${P.stone.moss}" opacity=".7"/>`);
    // the culvert in the wall foot to the right of the wheel: the dry channel's mouth behind an iron grate
    const cx0 = 664, cx1 = 724, ctop = GY - 50;
    a.push(`<path d="M${cx0 - 6},${GY + 2}V${ctop + 26}A${(cx1 - cx0) / 2 + 6},${(cx1 - cx0) / 2 + 6} 0 0 1 ${cx1 + 6},${ctop + 26}V${GY + 2}Z" fill="${P.stone.lit}"/>`);
    a.push(`<path d="M${cx0},${GY + 2}V${ctop + 26}A${(cx1 - cx0) / 2},${(cx1 - cx0) / 2} 0 0 1 ${cx1},${ctop + 26}V${GY + 2}Z" fill="#07050a"/>`);
    let bars = '';
    for (let i = 1; i <= 5; i++) { const x = cx0 + (cx1 - cx0) * i / 6, yt = ctop + 26 - Math.sqrt(Math.max(0, ((cx1 - cx0) / 2) ** 2 - (x - (cx0 + cx1) / 2) ** 2)) + 2; bars += i === 1 ? `M${r0(x)},${r0(yt)}V${GY - 22}l-5,${24}` : `M${r0(x)},${r0(yt)}V${GY + 2}`; }
    a.push(`<path d="${bars}M${cx0},${ctop + 30}H${cx1}" fill="none" stroke="#4a3a40" stroke-width="3.2" stroke-linecap="round"/><path d="${bars}" fill="none" stroke="${P.rim}" stroke-width="1" opacity=".45" transform="translate(-1.2 0)"/>`);
    // the axle block in the wall behind the hub
    a.push(`<path d="M${WX - 20},${WY - 20}h40v40h-40z" fill="${P.stone.shade}"/>`);
    S.add(a.join(''));
  }

  // --- the tower: stone base, boarded wooden smock, cap, bare sail frames ---------------------------
  {
    const t = [];
    const split = MX + tw * 0.06, splitT = MX + tt * 0.08;
    const sx = (y) => split + (GY - y) / th * (splitT - split);
    // stone base
    t.push(`<path d="${pz([[xl(GY), GY], [xl(sSplit), sSplit], [xr(sSplit), sSplit], [xr(GY), GY]])}" fill="${P.stone.lit}"/>`);
    t.push(`<path d="${pz([[sx(GY), GY], [sx(sSplit), sSplit], [xr(sSplit), sSplit], [xr(GY), GY]])}" fill="${P.stone.shade}"/>`);
    let sc = '';
    for (let y = GY - 12, k = 0; y > sSplit + 4; y -= 12, k++) { sc += `M${r0(xl(y))},${r0(y)}H${r0(xr(y))}`; for (let x = xl(y) + (k % 2) * 12 + 6; x < xr(y) - 4; x += 24) sc += `M${r0(x)},${r0(y)}v12`; }
    t.push(`<path d="${sc}" stroke="${P.stone.course}" stroke-width="1.5" opacity=".55"/>`);
    // wooden smock: weatherboards, a darker shaded half
    t.push(`<path d="${pz([[xl(sSplit) + 3, sSplit], [xl(tTop), tTop], [xr(tTop), tTop], [xr(sSplit) - 3, sSplit]])}" fill="${P.wood.lit}"/>`);
    t.push(`<path d="${pz([[sx(sSplit), sSplit], [sx(tTop), tTop], [xr(tTop), tTop], [xr(sSplit) - 3, sSplit]])}" fill="${P.wood.shade}"/>`);
    let wb = '';
    for (let y = sSplit - 9; y > tTop + 3; y -= 9) wb += `M${r0(xl(y) + 2)},${r0(y)}H${r0(xr(y) - 2)}`;
    t.push(`<path d="${wb}" stroke="${P.wood.board}" stroke-width="1.6" opacity=".6"/>`);
    t.push(`<path d="${pl([[sx(sSplit), sSplit], [sx(tTop), tTop]])}" stroke="${P.wood.board}" stroke-width="2.5" opacity=".7"/>`);
    // ledge where the smock sits on the stone, rim light up the left edges
    t.push(`<path d="M${r0(xl(sSplit) - 8)},${r0(sSplit)}H${r0(xr(sSplit) + 8)}v7H${r0(xl(sSplit) - 8)}z" fill="${P.wood.frame}"/><path d="M${r0(xl(sSplit) - 8)},${r0(sSplit)}H${r0(MX)}" stroke="${P.rim}" stroke-width="2" opacity=".6"/>`);
    t.push(`<path d="${pl([[xl(GY), GY], [xl(sSplit), sSplit]])}${pl([[xl(sSplit) + 3, sSplit - 7], [xl(tTop), tTop]])}" stroke="${P.rim}" stroke-width="3" stroke-linecap="round" opacity=".7"/>`);
    // the low arched door of the distant view becomes the dark mouth of the wheel-room passage under the smock
    // (the low arched door of the distant view, boarded shut: the guards use the house door)
    t.push(`<path d="M${r0(MX - 7 * MS)},${GY}v${r0(-26 * MS + 7 * MS)}a${f(7 * MS)},${f(7 * MS)} 0 0 1 ${r0(14 * MS)},0v${r0(26 * MS - 7 * MS)}z" fill="#1a1018"/>`);
    t.push(`<path d="M${r0(MX - 7 * MS - 3)},${GY - 34}l${r0(14 * MS + 6)},-12M${r0(MX - 7 * MS - 3)},${GY - 14}l${r0(14 * MS + 6)},8M${r0(MX - 7 * MS - 2)},${GY - 54}h${r0(14 * MS + 4)}" stroke="#4a3238" stroke-width="7" stroke-linecap="square"/><path d="M${r0(MX - 7 * MS - 3)},${GY - 37}l${r0(14 * MS + 6)},-12M${r0(MX - 7 * MS - 2)},${GY - 57}h${r0(14 * MS + 4)}" stroke="${P.rim}" stroke-width="1.2" opacity=".5"/>`);
    // the attic window, lit: prayer about to begin
    const wy = GY - th * 0.62, ww = 6 * MS, wh = 10 * MS;
    t.push(`<circle cx="${MX}" cy="${r0(wy + wh / 2)}" r="70" fill="${S.rad([[0, P.win, 0.45], [0.35, '#ff9a50', 0.16], [1, '#ff9a50', 0]])}"/>`);
    t.push(`<path d="M${r0(MX - ww / 2 - 3)},${r0(wy - 3)}h${r0(ww + 6)}v${r0(wh + 6)}h${r0(-ww - 6)}z" fill="${P.wood.frame}"/><path d="M${r0(MX - ww / 2)},${r0(wy)}h${r0(ww)}v${r0(wh)}h${r0(-ww)}z" fill="${P.win}"/><path d="M${r0(MX - ww / 2 + 2)},${r0(wy + 2)}h${r0(ww * 0.45)}v${r0(wh * 0.5)}h${r0(-ww * 0.45)}z" fill="${P.winHot}"/><path d="M${MX},${r0(wy)}v${r0(wh)}M${r0(MX - ww / 2)},${r0(wy + wh * 0.45)}h${r0(ww)}" stroke="${P.wood.frame}" stroke-width="2"/>`);
    // cap
    t.push(`<path d="M${r0(MX - tt * 0.78)},${r0(tTop)}Q${r0(MX - tt * 0.2)},${r0(tTop - 30 * MS)} ${r0(MX + tt * 0.9)},${r0(tTop - 4 * MS)}L${r0(MX + tt * 0.8)},${r0(tTop + 3 * MS)}Z" fill="${P.wood.roof}"/>`);
    t.push(`<path d="M${r0(MX - tt * 0.78)},${r0(tTop)}Q${r0(MX - tt * 0.5)},${r0(tTop - 22 * MS)} ${r0(MX + tt * 0.05)},${r0(tTop - 22 * MS)}" fill="none" stroke="${P.rim}" stroke-width="3" stroke-linecap="round" opacity=".75"/>`);
    t.push(`<path d="M${r0(MX - tt * 0.78)},${r0(tTop)}L${r0(MX + tt * 0.8)},${r0(tTop + 3 * MS)}" stroke="${P.wood.frame}" stroke-width="3"/>`);
    // bare sail frames, stopped; the 204° arm snapped short, its frame hanging from the break
    const hubx = MX - 5 * MS, huby = tTop - 9 * MS;
    let stocks = '', frames = '', rimL = '';
    for (const [deg, len] of [[24, 1], [114, 1], [204, 0.48], [294, 1]]) {
      const ang = deg * Math.PI / 180, ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux;
      const L = 104 * MS * len, w0 = 3 * MS, w1 = 19 * MS;
      const p0 = [hubx + ux * 14 * MS, huby + uy * 14 * MS], p1 = [hubx + ux * L, huby + uy * L];
      stocks += `M${r0(hubx)},${r0(huby)}L${r0(p1[0])},${r0(p1[1])}`;
      if (uy < 0.2) rimL += `M${r0(hubx + ux * 8 - vx * 3)},${r0(huby + uy * 8 - vy * 3)}L${r0(p1[0] - vx * 3)},${r0(p1[1] - vy * 3)}`;
      if (len < 1) {
        frames += `M${r0(p1[0])},${r0(p1[1])}l${r0(4 * MS)},${r0(30 * MS)}l${r0(14 * MS)},${r0(2 * MS)}l${r0(-6 * MS)},${r0(-26 * MS)}`;
        // splintered stump
        stocks += `M${r0(p1[0])},${r0(p1[1])}l${r0(-ux * 9 + vx * 4)},${r0(-uy * 9 + vy * 4)}`;
        continue;
      }
      frames += `M${r0(p0[0] + vx * w1 * 0.7)},${r0(p0[1] + vy * w1 * 0.7)}L${r0(p1[0] + vx * w1)},${r0(p1[1] + vy * w1)}L${r0(p1[0] + vx * w0)},${r0(p1[1] + vy * w0)}`;
      for (let k = 0.25; k < 1; k += 0.15) {
        const qx = p0[0] + (p1[0] - p0[0]) * k, qy = p0[1] + (p1[1] - p0[1]) * k;
        frames += `M${r0(qx + vx * w0)},${r0(qy + vy * w0)}l${r0(vx * (w1 - w0))},${r0(vy * (w1 - w0))}`;
      }
    }
    t.push(`<path d="${frames}" fill="none" stroke="${P.wood.frame}" stroke-width="${f(1.6 * MS)}" stroke-linejoin="round" stroke-linecap="round"/>`);
    t.push(`<path d="${stocks}" stroke="${P.wood.frame}" stroke-width="${f(4.2 * MS)}" stroke-linecap="round"/>`);
    t.push(`<path d="${rimL}" stroke="${P.rim}" stroke-width="2" stroke-linecap="round" opacity=".6"/>`);
    t.push(`<circle cx="${r0(hubx)}" cy="${r0(huby)}" r="${f(5.5 * MS)}" fill="${P.wood.frame}"/><path d="M${r0(hubx - 9)},${r0(huby - 9)}a13,13 0 0 1 12,-4" fill="none" stroke="${P.rim}" stroke-width="2" opacity=".7"/>`);
    S.add(t.join(''));
  }

  // --- the race: upstream water held behind the shut gate, half-dry mud below it; the wheel pit ------
  {
    const c = [];
    const y0 = GY - 4, y1 = GY + 10;
    c.push(`<path d="M-20,${y0}H${WX + 120}V${y1}H-20Z" fill="#100a10"/>`);
    // standing water upstream of the gate (left), a few puddles below it
    c.push(`<path d="M-20,${y0 + 4}H392V${y1 - 1}H-20Z" fill="${S.lin([[0, '#f0a86a'], [1, '#6a3a40']])}" opacity=".85"/><path d="M40,${y0 + 6}h70M180,${y0 + 7}h90M300,${y0 + 6}h50" stroke="#ffe0b0" stroke-width="1.5" opacity=".7"/>`);
    let pud = '';
    for (const [x, w] of [[436, 20], [474, 10], [646, 24], [688, 12]]) pud += `<ellipse cx="${x}" cy="${y1 - 4}" rx="${w}" ry="1.6"/>`;
    c.push(`<g fill="#e0906a" opacity=".5">${pud}</g>`);
    S.add(c.join(''));
    // the wheel itself, its lower floats sunk into the pit
    S.add(waterWheel(WX, WY, WR));
    // stone coping along the near edge of the race and pit (hides the wheel's bottom)
    let cope = '';
    for (let x = -20; x < WX + 150; x += R.range(22, 34)) cope += `M${r0(x)},${y1}h${r0(R.range(20, 30))}`;
    S.add(`<path d="M-20,${y1}H${WX + 150}V${y1 + 10}H-20Z" fill="#3a2a32"/><path d="${cope}" stroke="${P.rim}" stroke-width="1.6" opacity=".4"/><path d="M-20,${y1 + 10}H${WX + 150}" stroke="#0e080c" stroke-width="2"/>`);
    // drips of weed on the lower floats, a wet glint
    S.add(`<path d="M${WX - 70},${y0 - 6}q2,8 0,14M${WX - 40},${y0 - 2}q2,6 0,11M${WX + 60},${y0 - 4}q2,7 0,13" stroke="#2e3a2a" stroke-width="3" stroke-linecap="round" opacity=".8"/>`);
  }

  // --- the upstream sluice gate with its rusted winch (left, on the race) ----------------------------
  {
    const gx0 = 384, gx1 = 414, gt = GY - 52;
    const g = [];
    g.push(`<path d="M${gx0 - 4},${GY + 10}V${gt}h7V${GY + 10}zM${gx1 - 3},${GY + 10}V${gt}h7V${GY + 10}z" fill="#24161e"/>`);
    g.push(`<path d="M${gx0},${GY - 30}H${gx1}V${GY + 8}H${gx0}Z" fill="#3a2830"/><path d="M${gx0},${GY - 20}H${gx1}M${gx0},${GY - 10}H${gx1}M${gx0},${GY}H${gx1}" stroke="${P.ink}" stroke-width="1.5" opacity=".6"/>`);
    g.push(`<path d="M${gx0 - 10},${gt}H${gx1 + 10}v6H${gx0 - 10}z" fill="#24161e"/><path d="M${(gx0 + gx1) / 2},${GY - 30}V${gt - 10}" stroke="#5a3428" stroke-width="3"/>`);
    // winch: spindle on the crossbeam, spoked hand wheel at its end (rust-red)
    const hwx = gx0 - 14, hwy = gt - 8;
    g.push(`<path d="M${hwx},${hwy}H${gx1 + 6}" stroke="#3a2420" stroke-width="5"/>`);
    let sp = '';
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3; sp += `M${hwx},${hwy}l${f(Math.cos(a) * 13, 1)},${f(Math.sin(a) * 13, 1)}`; }
    g.push(`<circle cx="${hwx}" cy="${hwy}" r="14" fill="none" stroke="#7a3e30" stroke-width="3"/><path d="${sp}" stroke="#7a3e30" stroke-width="2"/><path d="M${hwx - 13},${hwy - 4}a14,14 0 0 1 10,-10" fill="none" stroke="${P.rim}" stroke-width="1.6" opacity=".7"/>`);
    g.push(`<path d="M${gx0 - 4},${GY + 10}V${gt}M${gx0 - 10},${gt}H${gx1 + 10}" stroke="${P.rim}" stroke-width="1.6" opacity=".55"/>`);
    S.add(g.join(''));
  }

  // --- loading platform, the door with lamplight in its cracks, the guards' fire --------------------
  {
    const l = [];
    const dx0 = hx + 40, dx1 = hx + 72, dTop = GY - hh + 12, pTop = GY - 14;
    l.push(`<path d="M${r0(dx0)},${r0(pTop)}V${r0(dTop)}H${r0(dx1)}V${r0(pTop)}Z" fill="#1e1218"/><path d="M${r0((dx0 + dx1) / 2)},${r0(pTop)}V${r0(dTop)}" stroke="#ffb860" stroke-width="1.6" opacity=".85"/><path d="M${r0(dx0 + 1)},${r0(pTop - 1)}H${r0(dx1 - 1)}" stroke="#ffb860" stroke-width="2" opacity=".7"/><path d="M${r0(dx0)},${r0(dTop)}H${r0(dx1)}M${r0(dx0)},${r0(dTop)}V${r0(pTop)}" stroke="${P.rim}" stroke-width="1.5" opacity=".5"/>`);
    const p0 = xr(GY) - 6, p1 = hx + 104;
    l.push(`<path d="M${r0(p0)},${GY}V${pTop}H${r0(p1)}V${GY}Z" fill="#2a1c22"/><path d="M${r0(p0)},${pTop}H${r0(p1)}" stroke="${P.rim}" stroke-width="2" opacity=".55"/><path d="M${r0(p0 + 10)},${pTop + 2}V${GY}M${r0(p1 - 6)},${pTop + 2}V${GY}" stroke="${P.ink}" stroke-width="3"/>`);
    let steps = '';
    for (let i = 0; i < 3; i++) steps += `M${r0(p1 + i * 7)},${r0(pTop + i * 4.7)}h8v${r0(14 - i * 4.7)}h-8z`;
    l.push(`<path d="${steps}" fill="#24161c"/>`);
    // sacks stacked on the platform
    l.push(`<path d="M${r0(p0 + 14)},${pTop}q2,-12 12,-13q10,1 12,13z" fill="#5a3e3e"/><path d="M${r0(p0 + 22)},${pTop - 10}q2,-10 10,-10q8,0 9,10z" fill="#4a3236"/>`);
    S.add(l.join(''));
    // old cart ruts curving away from the platform across the yard toward the road
    let ruts = '';
    for (const o of [0, 26]) ruts += `M${r0(p1 + 10 + o)},${GY + 2}C${r0(p1 + 60 + o * 1.4)},${GY + 16} ${r0(p1 + 150 + o * 2)},${GY + 30} ${r0(p1 + 290 + o * 3)},${GY + 42}`;
    S.add(`<path d="${ruts}" fill="none" stroke="#120a10" stroke-width="3" opacity=".45"/>`);
    // the fire on the trodden ground, its light on the house front and the dirt
    const fx = 958, fy = GY + 14;
    S.add(`<ellipse cx="${fx}" cy="${fy + 2}" rx="120" ry="26" fill="${S.rad([[0, P.fire.glow, 0.55], [1, P.fire.glow, 0]])}"/><circle cx="${fx}" cy="${fy - 18}" r="120" fill="${S.rad([[0, P.fire.glow, 0.42], [0.4, '#ff7a3a', 0.14], [1, '#ff7a3a', 0]])}"/>`);
    S.add(`<path d="M${fx - 18},${fy + 2}l34,-6M${fx - 16},${fy - 4}l32,6" stroke="#1a0e10" stroke-width="5" stroke-linecap="round"/>`);
    S.add(`<path d="M${fx - 13},${fy}C${fx - 16},${fy - 12} ${fx - 8},${fy - 16} ${fx - 6},${fy - 26}C${fx - 2},${fy - 18} ${fx + 2},${fy - 30} ${fx + 3},${fy - 38}C${fx + 8},${fy - 26} ${fx + 14},${fy - 18} ${fx + 13},${fy}Z" fill="${P.fire.body}"/><path d="M${fx - 6},${fy}C${fx - 7},${fy - 8} ${fx - 1},${fy - 12} ${fx + 1},${fy - 20}C${fx + 5},${fy - 12} ${fx + 8},${fy - 6} ${fx + 6},${fy}Z" fill="${P.fire.core}"/>`);
    S.add(`<g fill="#ffd08a"><circle cx="${fx + 6}" cy="${fy - 50}" r="1.5"/><circle cx="${fx - 4}" cy="${fy - 62}" r="1.2"/><circle cx="${fx + 12}" cy="${fy - 70}" r="1"/></g>`);
    // two guards in aprons hunched on logs either side, blades across their knees; rim-lit by the fire
    const guard = (x, dir) => {
      const k = dir; // +1 faces right (toward the fire)
      const body = `M${x - 9 * k},${fy + 2}C${x - 12 * k},${fy - 14} ${x - 10 * k},${fy - 28} ${x - 2 * k},${fy - 34}C${x + 6 * k},${fy - 36} ${x + 10 * k},${fy - 26} ${x + 9 * k},${fy - 16}L${x + 20 * k},${fy - 12}L${x + 21 * k},${fy + 2}Z`;
      const head = circ(x + 1 * k, fy - 40, 6.5);
      const blade = `M${x - 14 * k},${fy - 13}L${x + 17 * k},${fy - 14}`;
      return `<path d="${body}${head}" fill="#120a10"/><path d="${blade}" stroke="#c8b8b0" stroke-width="1.6" opacity=".8"/><path d="M${x + 7 * k},${fy - 44}a7,7 0 0 1 ${2 * k},10M${x + 9 * k},${fy - 26}L${x + 20 * k},${fy - 12}" fill="none" stroke="${P.rimHot}" stroke-width="1.8" stroke-linecap="round" opacity=".85"/><path d="M${x - 1 * k},${fy - 30}v20" stroke="#4a3a34" stroke-width="5" opacity=".6"/>`;
    };
    S.add(guard(fx - 40, 1) + guard(fx + 40, -1));
  }

  // --- midground reed banks framing the yard (we lie in them) ----------------------------------------
  const midPal = { fill: [[0, '#4a2e3c'], [0.4, '#2e1e2a'], [1, '#120c12']], stalk: '#1a1018', hi: '#7a4a48', plume: '#9a5e5a', rim: '#ffc08a', leaf: '#2a1a24' };
  S.add(reedBank(S, R, { x0: -20, x1: 372, top: (x) => 300 + ((x + 20) / 392) ** 1.6 * 300, base: H + 10, pal: midPal, seed: 6121, step: 6, amp: 16, plumeP: 0.55, plumeL: (x) => 46 - (x + 20) / 392 * 28, stalkW: 2 }));
  S.add(reedBank(S, R, { x0: 1620, x1: 1150, top: (x) => 290 + ((1620 - x) / 470) ** 1.6 * 316, base: H + 10, pal: midPal, seed: 6122, step: 6, amp: 16, plumeP: 0.55, plumeL: (x) => 46 - (1620 - x) / 470 * 28, stalkW: 2 }));

  // --- the knee-high bell cord across the reeds: stakes, sagging cord, little bells -------------------
  {
    const stakes = [[262, 642], [560, 630], [884, 634], [1214, 646]];
    let cord = '', st = '', bells = '';
    for (let i = 0; i < stakes.length; i++) {
      const [x, y] = stakes[i];
      st += `M${x},${y + 16}V${y - 2}`;
      if (i === stakes.length - 1) break;
      const [x2, y2] = stakes[i + 1], mx = (x + x2) / 2, my = (y + y2) / 2 + 14;
      cord += `M${x},${y}Q${mx},${my + 6} ${x2},${y2}`;
      for (const t of [0.3, 0.62]) {
        const bx = (1 - t) ** 2 * x + 2 * (1 - t) * t * mx + t * t * x2, by = (1 - t) ** 2 * y + 2 * (1 - t) * t * (my + 6) + t * t * y2;
        bells += `M${r0(bx - 3)},${r0(by + 6)}q0,-6 3,-6q3,0 3,6z`;
      }
    }
    S.add(`<path d="${st}" stroke="#1a1016" stroke-width="3" stroke-linecap="round"/><path d="${cord}" fill="none" stroke="#e8a878" stroke-width="1.2" opacity=".75"/><path d="${bells}" fill="#d8a060"/>`);
  }

  // --- foreground: the reeds we lie in (dark, calm under the dialogue box), out-of-focus stalks ----------
  const nearPal = { fill: [[0, '#2a1a24'], [0.25, '#170e16'], [1, '#08060a']], stalk: '#050306', plume: '#5a3438', rim: '#e89a70', leaf: '#120a10' };
  S.add(reedBank(S, R, { x0: -20, x1: 1620, top: (x) => 712 - 270 * (Math.abs(x - 800) / 800) ** 1.7, base: H + 10, pal: nearPal, seed: 6131, step: 7, amp: 12, plumeP: 0.32, plumeL: (x) => 30 + Math.abs(x - 800) / 800 * 40, stalkW: 2.4 }));
  {
    let ns = '', np = '';
    for (const [x, top, lean] of [[-4, 210, 10], [40, 260, 16], [84, 196, 8], [128, 300, 22], [1530, 230, -10], [1572, 280, -18], [1490, 330, -14], [1612, 196, -6]]) {
      ns += `M${x},${H + 10}Q${x + lean * 0.4},${(H + top) / 2} ${x + lean},${top}`;
      np += plume(x + lean, top + 4, 96, lean > 0 ? 34 + lean : -34 + lean, 0.2).body;
    }
    S.add(`<g filter="${S.blur(1)}" opacity=".92"><path d="${ns}" fill="none" stroke="#0a060a" stroke-width="5" stroke-linecap="round"/><path d="${np}" fill="#3e2228"/></g>`);
  }
  let birds = '';
  for (const [x, y, s, fl] of [[1080, 238, 0.7, 0.3], [1118, 222, 0.6, 0.8], [1150, 246, 0.55, 0.5], [1040, 262, 0.5, 0.9]]) birds += bird(x, y, s, fl);
  S.add(`<path d="${birds}" fill="#1e1424"/>`);

  // --- grading: cooler, darker toward night; vignette; calm bottom -------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#ff9a60', 0.1], [0.5, '#ff9a60', 0], [1, '#1a1440', 0.34]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.42, '#0e0a16', 0], [1, '#0e0a16', 0.66]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#0a080c', 0], [1, '#0a080c', 0.7]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 旧磨坊·磨盘间 — a low timber room, seen from a crouch beside the trapdoor
// ---------------------------------------------------------------------------------------------
function oldMillFloor() {
  const S = new Scene('sbMillFloor', '旧磨坊·磨盘间：穿过地板直通屋顶的水车轴，轴上一圈挂满黑晶的晶架泛着紫光，盖布的笼子，桌上的石板与账本，墙上一排颈圈', 6202);
  const R = S.R;
  const FL = 760, EYE = 1.15, VY = 400;
  const pr = persp({ vp: [800, VY], F: FL, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const kAt = (Z) => FL / Z;
  const X0 = -4.4, X1 = 4.4, CEIL = 2.7, BACK = 7.6, NEAR = 1.0;
  const VIO = '#a07ae0', VIO_HI = '#dcc8ff', WARM = '#ffb860';
  const SX = 0.15, SZ = 4.8, SR = 0.24, HY = 1.85, HR = 1.2; // the shaft and the crystal hoop
  const gU = (y0, y1) => `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(y0)}" x2="0" y2="${r0(y1)}"`;
  // grain sacks: [X, Z, width, height, raised-by] each, with old flour dust on their tops
  const sacks = (list, fill = '#2e2630') => list.map(([x, z, w, h, up]) => {
    const a = pr(x, 0, z), k = kAt(z), ww = w * k, hh = h * k, yb = a[1] - up * k;
    const ears = `M${r0(a[0] + ww * 0.06)},${r0(yb - hh * 0.78)}l${r0(-ww * 0.1)},${r0(-hh * 0.22)}l${r0(ww * 0.2)},${r0(hh * 0.08)}zM${r0(a[0] + ww * 0.62)},${r0(yb - hh * 0.9)}l${r0(ww * 0.14)},${r0(-hh * 0.18)}l${r0(-ww * 0.02)},${r0(hh * 0.26)}z`;
    return `<path d="M${r0(a[0])},${r0(yb)}q${r0(-ww * 0.06)},${r0(-hh * 0.9)} ${r0(ww * 0.3)},${r0(-hh)}q${r0(ww * 0.4)},${r0(-hh * 0.12)} ${r0(ww * 0.66)},${r0(hh * 0.08)}q${r0(ww * 0.12)},${r0(hh * 0.5)} ${r0(ww * 0.04)},${r0(hh * 0.92)}z${ears}" fill="${fill}"/><path d="M${r0(a[0] + ww * 0.1)},${r0(yb - hh * 0.82)}q${r0(ww * 0.2)},${r0(-hh * 0.2)} ${r0(ww * 0.5)},${r0(-hh * 0.1)}" fill="none" stroke="#8a7e98" stroke-width="${f(Math.max(2, 0.012 * k))}" opacity=".5"/><path d="M${r0(a[0] + ww * 0.36)},${r0(yb - hh * 0.95)}q${r0(ww * 0.06)},${r0(hh * 0.4)} ${r0(-ww * 0.02)},${r0(hh * 0.9)}" fill="none" stroke="#0e0a12" stroke-width="${f(Math.max(1.5, 0.008 * k))}" opacity=".6"/>`;
  }).join('');

  // --- the room shell -------------------------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="#0c0a10"/>`);
  const bwTop = pr(0, CEIL, BACK)[1], bwBot = pr(0, 0, BACK)[1];
  S.add(`<path d="${q([[X0, 0, BACK], [X0, CEIL, BACK], [X1, CEIL, BACK], [X1, 0, BACK]])}" fill="${S.lin([[0, '#2a2234'], [1, '#1c1724']], gU(bwTop, bwBot))}"/>`);
  S.add(`<path d="${q([[X0, 0, NEAR], [X0, CEIL, NEAR], [X0, CEIL, BACK], [X0, 0, BACK]])}" fill="${S.lin([[0, '#100c14'], [1, '#221c2a']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="${q([[X1, 0, NEAR], [X1, CEIL, NEAR], [X1, CEIL, BACK], [X1, 0, BACK]])}" fill="${S.lin([[0, '#201a28'], [1, '#0e0b12']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="${q([[X0, CEIL, NEAR], [X0, CEIL, BACK], [X1, CEIL, BACK], [X1, CEIL, NEAR]])}" fill="#120e16"/>`);
  S.add(`<path d="${q([[X0, 0, NEAR], [X0, 0, BACK], [X1, 0, BACK], [X1, 0, NEAR]])}" fill="${S.lin([[0, '#2e2634'], [0.45, '#1e1824'], [1, '#0c0a10']], gU(bwBot, H))}"/>`);
  // boards: wall planks (vertical), floorboards running away from us, ceiling joists
  let pk = '';
  for (let x = X0 + 0.32; x < X1; x += 0.32) pk += pl(pr.poly([[x, 0, BACK], [x, CEIL, BACK]]));
  for (let z = 1.6; z < BACK; z += z * 0.09) { pk += pl(pr.poly([[X0, 0, z], [X0, CEIL, z]])); pk += pl(pr.poly([[X1, 0, z], [X1, CEIL, z]])); }
  S.add(`<path d="${pk}" stroke="#08060a" stroke-width="2" opacity=".5"/>`);
  let fb = '';
  for (let x = X0 + 0.28; x < X1; x += 0.28) fb += pl(pr.poly([[x, 0, NEAR + 0.6], [x, 0, BACK]]));
  for (let i = 0; i < 26; i++) { const x = X0 + 0.28 * R.int(1, 30), z = R.range(2, 7.2); fb += pl(pr.poly([[x, 0, z], [x + 0.28, 0, z]])); }
  S.add(`<path d="${fb}" stroke="#08060a" stroke-width="1.6" opacity=".45"/>`);
  let joists = '';
  for (const z of [1.8, 2.6, 3.5, 5.9, 6.8]) joists += pz(pr.poly([[X0, CEIL, z], [X1, CEIL, z], [X1, CEIL - 0.2, z], [X0, CEIL - 0.2, z]]));
  S.add(`<path d="${joists}" fill="#1a141e"/>`);
  // the big beam that carries the shaft's top bearing
  S.add(`<path d="${q([[X0, CEIL - 0.3, SZ - 0.18], [X1, CEIL - 0.3, SZ - 0.18], [X1, CEIL, SZ - 0.18], [X0, CEIL, SZ - 0.18]])}" fill="#221a26"/><path d="${pl(pr.poly([[X0, CEIL - 0.3, SZ - 0.18], [X1, CEIL - 0.3, SZ - 0.18]]))}" stroke="${VIO}" stroke-width="2" opacity=".35"/>`);

  // --- the violet light of the rack spilling over everything --------------------------------------------
  const hc = pr(SX, HY - 0.15, SZ);
  S.add(`<circle cx="${r0(hc[0])}" cy="${r0(hc[1])}" r="620" fill="${S.rad([[0, '#b48cff', 0.5], [0.18, '#8a5ad8', 0.26], [0.5, '#5a3a9a', 0.08], [1, '#5a3a9a', 0]])}"/>`);
  { const fc = pr(SX, 0, SZ); S.add(`<ellipse cx="${r0(fc[0])}" cy="${r0(fc[1])}" rx="430" ry="70" fill="${S.rad([[0, '#c8a8ff', 0.4], [1, '#8a5ad8', 0]])}"/>`); }

  // --- back wall: the row of collars, one huge collar -------------------------------------------------------
  {
    let pegs = '', rings = '', glints = '';
    const rail = pz(pr.poly([[-3.9, 1.62, BACK - 0.02], [-0.4, 1.62, BACK - 0.02], [-0.4, 1.56, BACK - 0.02], [-3.9, 1.56, BACK - 0.02]]));
    const kb = kAt(BACK);
    for (let i = 0; i < 8; i++) {
      const x = -3.6 + i * 0.3, p = pr(x, 1.56, BACK - 0.02), rr = 0.085 * kb;
      pegs += `M${r0(p[0])},${r0(p[1])}v4`;
      rings += `<ellipse cx="${r0(p[0])}" cy="${r0(p[1] + rr + 3)}" rx="${f(rr * 0.9)}" ry="${f(rr)}"/>`;
      glints += `M${r0(p[0] - rr * 0.8)},${r0(p[1] + rr * 0.8)}a${f(rr * 0.9)},${f(rr)} 0 0 1 ${r0(rr * 0.5)},${r0(-rr * 0.7)}`;
    }
    S.add(`<path d="${rail}" fill="#2e2432"/><path d="${pegs}" stroke="#08060a" stroke-width="2"/><g fill="none" stroke="#3a3440" stroke-width="3.2">${rings}</g><path d="${glints}" fill="none" stroke="${VIO_HI}" stroke-width="1.4" opacity=".7"/>`);
    // the huge one: a thick riveted band, big enough for an ox
    const bp = pr(-0.95, 1.56, BACK - 0.03), br = 0.27 * kb;
    let riv = '';
    for (let i = 0; i < 9; i++) { const a = Math.PI * (0.15 + i * 0.09) + Math.PI * 0.55; riv += `<circle cx="${r0(bp[0] + Math.cos(a) * br)}" cy="${r0(bp[1] + br + 6 + Math.sin(a) * br * 1.05)}" r="2"/>`; }
    S.add(`<path d="M${r0(bp[0])},${r0(bp[1])}v8" stroke="#08060a" stroke-width="3"/><ellipse cx="${r0(bp[0])}" cy="${r0(bp[1] + br + 6)}" rx="${f(br)}" ry="${f(br * 1.05)}" fill="none" stroke="#141018" stroke-width="${f(0.075 * kb + 3)}"/><ellipse cx="${r0(bp[0])}" cy="${r0(bp[1] + br + 6)}" rx="${f(br)}" ry="${f(br * 1.05)}" fill="none" stroke="#3e3646" stroke-width="${f(0.075 * kb)}"/><g fill="#6a6074">${riv}</g><path d="M${r0(bp[0] - br * 0.95)},${r0(bp[1] + br * 1.3 + 6)}a${f(br)},${f(br * 1.05)} 0 0 1 ${r0(br * 0.7)},${r0(-br * 0.98)}" fill="none" stroke="${VIO_HI}" stroke-width="2" opacity=".75"/>`);
  }

  // --- the stair up to the attic (back right), lamplight leaking down it ---------------------------------
  {
    const sx0 = 3.0, sx1 = 3.9;
    const top = pr.poly([[sx0, CEIL, 5.7], [sx1, CEIL, 5.7], [sx1, CEIL, 6.4], [sx0, CEIL, 6.4]]);
    S.add(`<path d="${pz(top)}" fill="#ffcf8a"/><path d="${pz(top)}" fill="none" stroke="#2a1c1a" stroke-width="3"/>`);
    S.add(`<path d="${pz([pr(sx0, CEIL, 5.7), pr(sx1, CEIL, 5.7), pr(sx1, 0, 5.2), pr(sx0 - 0.9, 0, 4.4), pr(sx0 - 0.4, 0, 5.4)])}" fill="${WARM}" opacity=".12" filter="${S.blur(2)}"/>`);
    let steps = '', lit = '';
    for (let i = 0; i < 10; i++) {
      const y = i * 0.27, z = 7.3 - i * 0.13;
      steps += pz(pr.poly([[sx0, y + 0.27, z], [sx1, y + 0.27, z], [sx1, y, z], [sx0, y, z]]));
      lit += pl(pr.poly([[sx0, y + 0.27, z], [sx1, y + 0.27, z]]));
    }
    S.add(`<path d="${steps}" fill="#2a2024"/><path d="${lit}" stroke="${WARM}" stroke-width="2" opacity=".45"/>`);
    S.add(`<path d="${pl(pr.poly([[sx0, 0.9, 7.3], [sx0, CEIL + 0.1, 5.9]]))}" stroke="#140e12" stroke-width="7"/><path d="${pl(pr.poly([[sx0 - 0.02, 0, 7.3], [sx0 - 0.02, 0.9, 7.3]]))}" stroke="#140e12" stroke-width="5"/>`);
  }

  // --- millstones: a spare runner stone leaning on the back wall, another lying flat before it ------------
  {
    const kb = kAt(BACK - 0.12), c = pr(-2.05, 0.56, BACK - 0.12), rr = 0.56 * kb;
    let furrows = '';
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2, b = a + 0.5;
      furrows += `M${r0(c[0] + Math.cos(a) * rr * 0.22)},${r0(c[1] + Math.sin(a) * rr * 0.22)}L${r0(c[0] + Math.cos(b) * rr * 0.92)},${r0(c[1] + Math.sin(b) * rr * 0.92)}`;
    }
    S.add(`<ellipse cx="${r0(c[0] + 5)}" cy="${r0(c[1])}" rx="${f(rr)}" ry="${f(rr * 0.98)}" fill="#1a1620"/><ellipse cx="${r0(c[0])}" cy="${r0(c[1])}" rx="${f(rr)}" ry="${f(rr * 0.98)}" fill="#383040"/><path d="${furrows}" stroke="#1e1a24" stroke-width="2.4" opacity=".8"/><circle cx="${r0(c[0])}" cy="${r0(c[1])}" r="${f(rr * 0.16)}" fill="#120e16"/><path d="M${r0(c[0] - rr * 0.96)},${r0(c[1] + rr * 0.25)}A${f(rr)},${f(rr * 0.98)} 0 0 1 ${r0(c[0] - rr * 0.1)},${r0(c[1] - rr * 0.97)}" fill="none" stroke="${VIO_HI}" stroke-width="2" opacity=".55"/>`);
    const fc = pr(-1.25, 0.16, 6.8), kf = kAt(6.8), fr = 0.52 * kf, fry = fr * (EYE - 0.16) / 6.8, th = 0.16 * kf;
    S.add(`<path d="M${r0(fc[0] - fr)},${r0(fc[1])}v${r0(th)}a${f(fr)},${f(fry)} 0 0 0 ${r0(fr * 2)},0v${r0(-th)}z" fill="#2a2430"/><ellipse cx="${r0(fc[0])}" cy="${r0(fc[1])}" rx="${f(fr)}" ry="${f(fry)}" fill="#4a4252"/><ellipse cx="${r0(fc[0])}" cy="${r0(fc[1])}" rx="${f(fr * 0.18)}" ry="${f(fry * 0.18)}" fill="#120e16"/><path d="M${r0(fc[0] - fr)},${r0(fc[1])}a${f(fr)},${f(fry)} 0 0 1 ${r0(fr * 0.9)},${r0(-fry)}" fill="none" stroke="${VIO_HI}" stroke-width="1.6" opacity=".5"/><ellipse cx="${r0(fc[0] + fr * 0.2)}" cy="${r0(fc[1] - fry * 0.1)}" rx="${f(fr * 0.6)}" ry="${f(fry * 0.5)}" fill="#a89cb8" opacity=".18"/>`);
  }

  // --- flour dust on the floor, the manager's footprints from the stair to the table ----------------------
  {
    let dust = '';
    for (let i = 0; i < 16; i++) { const x = R.range(-3.8, 3.8), z = R.range(2.2, 7), c = pr(x, 0, z), k = kAt(z); dust += `<ellipse cx="${r0(c[0])}" cy="${r0(c[1])}" rx="${r0(R.range(0.3, 0.8) * k)}" ry="${r0(R.range(0.04, 0.09) * k)}"/>`; }
    S.add(`<g fill="#9a8eaa" opacity=".22" filter="${S.blur(2)}">${dust}</g>`);
    let fp = '';
    for (let i = 0; i < 12; i++) { const t = i / 11, x = 1.4 - t * 2.7 + (i % 2) * 0.16, z = 5.05 - t * 1.2, c = pr(x, 0, z), k = kAt(z); fp += `<ellipse cx="${r0(c[0])}" cy="${r0(c[1])}" rx="${f(0.07 * k)}" ry="${f(0.13 * k * EYE / z)}"/>`; }
    S.add(`<g fill="#05040a" opacity=".3">${fp}</g>`);
  }

  // --- the table with slate, ledger and a stub of charcoal (left) ------------------------------------------
  {
    const t0 = -2.5, t1 = -1.2, z0 = 2.9, z1 = 3.6, ty = 0.78;
    S.add(`<path d="${q([[t0, ty, z0], [t0, ty, z1], [t1, ty, z1], [t1, ty, z0]])}" fill="#4a3a44"/><path d="${q([[t0, ty, z0], [t1, ty, z0], [t1, ty - 0.08, z0], [t0, ty - 0.08, z0]])}" fill="#241a22"/>`);
    let legs = '';
    for (const [x, z] of [[t0 + 0.06, z0 + 0.05], [t1 - 0.06, z0 + 0.05], [t0 + 0.06, z1 - 0.05], [t1 - 0.06, z1 - 0.05]]) legs += pz(pr.poly([[x - 0.04, 0, z], [x + 0.04, 0, z], [x + 0.04, ty - 0.08, z], [x - 0.04, ty - 0.08, z]]));
    S.add(`<path d="${legs}" fill="#1a1218"/><path d="${pl(pr.poly([[t0, ty, z0], [t1, ty, z0]]))}" stroke="${VIO}" stroke-width="1.6" opacity=".45"/>`);
    // the slate propped upright against a crock at the back of the table: three chalk lines, the first struck out
    const sl = pr.poly([[-2.32, ty, z1 - 0.06], [-2.32, ty + 0.42, z1 - 0.12], [-1.72, ty + 0.42, z1 - 0.12], [-1.72, ty, z1 - 0.06]]);
    S.add(`<path d="${pz(sl)}" fill="#5a4a3a"/>`);
    const inner = pr.poly([[-2.28, ty + 0.03, z1 - 0.065], [-2.28, ty + 0.39, z1 - 0.115], [-1.76, ty + 0.39, z1 - 0.115], [-1.76, ty + 0.03, z1 - 0.065]]);
    S.add(`<path d="${pz(inner)}" fill="#2a2c34"/>`);
    const L = (u0, u1, v) => { const a = [inner[0][0] + (inner[3][0] - inner[0][0]) * u0, inner[0][1] + (inner[1][1] - inner[0][1]) * v], b = [inner[0][0] + (inner[3][0] - inner[0][0]) * u1, a[1]]; return [a, b]; };
    let chalk = '';
    for (const [u0, u1, v] of [[0.1, 0.78, 0.78], [0.1, 0.5, 0.52], [0.1, 0.66, 0.26]]) {
      const [a, b] = L(u0, u1, v);
      // a scrawl: short dashes standing in for words (no text in the art)
      let x = a[0];
      while (x < b[0] - 3) { const w = R.range(4, 9); chalk += `M${r0(x)},${r0(a[1] + R.range(-1, 1))}h${r0(w)}`; x += w + R.range(2, 4); }
    }
    const [s0, s1] = L(0.06, 0.84, 0.78);
    S.add(`<path d="${chalk}" stroke="#d8d4dc" stroke-width="2" stroke-linecap="round" opacity=".8"/><path d="M${r0(s0[0])},${r0(s0[1] + 3)}L${r0(s1[0])},${r0(s1[1] - 3)}" stroke="#e8e4ec" stroke-width="2.2" opacity=".85"/>`);
    { const a = pr(-1.57, ty, z1 - 0.1), kk = kAt(z1 - 0.1), w2 = 0.09 * kk, h2 = 0.2 * kk; S.add(`<path d="M${r0(a[0] - w2 * 0.8)},${r0(a[1])}q${r0(-w2 * 0.3)},${r0(-h2 * 0.6)} ${r0(w2 * 0.2)},${r0(-h2 * 0.85)}v${r0(-h2 * 0.15)}h${r0(w2 * 1.2)}v${r0(h2 * 0.15)}q${r0(w2 * 0.5)},${r0(h2 * 0.25)} ${r0(w2 * 0.2)},${r0(h2 * 0.85)}z" fill="#3a2e34"/><path d="M${r0(a[0] - w2 * 0.9)},${r0(a[1] - h2 * 0.5)}q${r0(w2 * 0.1)},${r0(-h2 * 0.3)} ${r0(w2 * 0.35)},${r0(-h2 * 0.36)}" fill="none" stroke="${VIO}" stroke-width="1.4" opacity=".5"/>`); }
    // the open ledger in front: two pale pages, ruled columns, one page lifting
    const lp = (x0, x1) => pr.poly([[x0, ty + 0.01, z0 + 0.12], [x0, ty + 0.01, z0 + 0.5], [x1, ty + 0.01, z0 + 0.5], [x1, ty + 0.01, z0 + 0.12]]);
    S.add(`<path d="${pz(lp(-2.15, -1.84))}${pz(lp(-1.84, -1.53))}" fill="#a89c8c"/><path d="${pz(lp(-2.18, -1.5))}" fill="none" stroke="#3a2a22" stroke-width="2.5"/>`);
    let rule = '';
    for (const v of [0.22, 0.42, 0.62, 0.82]) rule += pl(pr.poly([[-2.12, ty + 0.012, z0 + 0.12 + v * 0.38], [-1.56, ty + 0.012, z0 + 0.12 + v * 0.38]]));
    for (const u of [-2.02, -1.94, -1.72, -1.62]) rule += pl(pr.poly([[u, ty + 0.012, z0 + 0.14], [u, ty + 0.012, z0 + 0.48]]));
    S.add(`<path d="${rule}" stroke="#5a4a40" stroke-width="1" opacity=".7"/>`);
    const pg = pr(-1.84, ty + 0.01, z0 + 0.31), kk = kAt(z0 + 0.31);
    S.add(`<path d="M${r0(pg[0])},${r0(pg[1])}q${r0(0.08 * kk)},${r0(-0.05 * kk)} ${r0(0.24 * kk)},${r0(-0.03 * kk)}q${r0(-0.1 * kk)},${r0(0.01 * kk)} ${r0(-0.22 * kk)},${r0(0.05 * kk)}z" fill="#c4b8a6"/>`);
    const ch = pr(-1.42, ty + 0.01, z0 + 0.2);
    S.add(`<path d="M${r0(ch[0])},${r0(ch[1])}l14,-3l1,4l-14,3z" fill="#0a080c"/>`);
  }

  // --- the cage under its cloth (behind the shaft, right), two thin chains from the rack slipping under it ---
  {
    const c0 = 0.8, c1 = 2.1, z0 = 5.3, z1 = 6.2, ch = 1.05, hem = 0.3, o = 0.03;
    // below the hem: the dark inside of the cage behind its bars, the bottom rail
    let bars = '';
    for (let x = c0 + 0.07; x < c1; x += 0.12) bars += pl(pr.poly([[x, 0, z0], [x, hem + 0.06, z0]]));
    for (let z = z0 + 0.1; z < z1; z += 0.14) bars += pl(pr.poly([[c0, 0, z], [c0, hem + 0.06, z]]));
    S.add(`<path d="${q([[c0, 0, z0], [c0, hem + 0.06, z0], [c1, hem + 0.06, z0], [c1, 0, z0]])}${q([[c0, 0, z1], [c0, hem + 0.06, z1], [c0, hem + 0.06, z0], [c0, 0, z0]])}" fill="#09070c"/><path d="${bars}" stroke="#3e3446" stroke-width="3.2"/><path d="${pl(pr.poly([[c1, 0.03, z0], [c0, 0.03, z0], [c0, 0.03, z1]]))}" fill="none" stroke="#2a2230" stroke-width="6"/>`);
    // the cloth thrown over it: sagging top edges, folds falling from the corners, a ragged flared hem
    const hemLine = (side) => Array.from({ length: 13 }, (_, i) => {
      const t = i / 12, y = hem + Math.sin(t * Math.PI * 2.5 + (side ? 0.8 : 0)) * 0.045 + R.range(-0.02, 0.025), fl = 0.03 * Math.max(0, side ? t - 0.7 : 0.3 - t) / 0.3;
      return side ? pr(c0 - o - fl, y, z1 - (z1 - z0 + o) * t) : pr(c0 - o + (c1 + o - c0 + o) * t, y, z0 - o - fl);
    });
    const sideHem = hemLine(true), frontHem = hemLine(false);
    const A = pr(c0 - o, ch, z0 - o), B = pr(c1 + o, ch, z0 - o), C = pr(c0 - o, ch, z1), D = pr(c1 + o, ch, z1);
    const sagF = pr((c0 + c1) / 2, ch - 0.035, z0 - o), sagS = pr(c0 - o, ch - 0.03, (z0 + z1) / 2);
    const curve = (a, m, b) => `Q${r0(2 * m[0] - (a[0] + b[0]) / 2)},${r0(2 * m[1] - (a[1] + b[1]) / 2)} ${r0(b[0])},${r0(b[1])}`;
    S.add(`<path d="M${r0(C[0])},${r0(C[1])}${curve(C, sagS, A)}L${sideHem.slice().reverse().map(([x, y]) => `${r0(x)},${r0(y)}`).join('L')}Z" fill="#3e3248"/>`);
    S.add(`<path d="M${r0(A[0])},${r0(A[1])}${curve(A, sagF, B)}L${r0(B[0])},${r0(frontHem[12][1])}L${frontHem.slice().reverse().map(([x, y]) => `${r0(x)},${r0(y)}`).join('L')}Z" fill="#241e2a"/>`);
    S.add(`<path d="M${r0(A[0])},${r0(A[1])}${curve(A, sagF, B)}L${r0(D[0])},${r0(D[1])}L${r0(C[0])},${r0(C[1])}Z" fill="#30283a"/>`);
    let folds = '';
    for (const [t, tt] of [[0.08, 0.02], [0.3, 0.22], [0.55, 0.5], [0.8, 0.86], [0.96, 0.99]]) {
      const top = pr(c0 + (c1 - c0) * t, ch - 0.03, z0 - o), bot = frontHem[Math.round(tt * 12)];
      folds += `M${r0(top[0])},${r0(top[1])}Q${r0((top[0] + bot[0]) / 2 + 6)},${r0((top[1] + bot[1]) / 2)} ${r0(bot[0])},${r0(bot[1] - 2)}`;
    }
    for (const [t, tt] of [[0.25, 0.3], [0.6, 0.62], [0.92, 0.97]]) { const top = pr(c0 - o, ch - 0.03, z1 - (z1 - z0) * t), bot = sideHem[Math.round(tt * 12)]; folds += pl([top, [bot[0], bot[1] - 2]]); }
    S.add(`<path d="${folds}" fill="none" stroke="#0e0a12" stroke-width="2.5" opacity=".65"/><path d="M${r0(C[0])},${r0(C[1])}${curve(C, sagS, A)}${curve(A, sagF, B)}" fill="none" stroke="${VIO_HI}" stroke-width="1.8" opacity=".55"/><path d="${pl(sideHem)}" fill="none" stroke="${VIO}" stroke-width="1.6" opacity=".5"/>`);
    // two thin chains from the hoop's front-right down to the cloth, slipping beneath it
    let chains = '';
    for (const [a, ex, ey] of [[0.2, 1.46, 0.72], [0.62, 1.1, 0.84]]) {
      const s0 = pr(SX + Math.cos(a) * HR, HY - 0.02, SZ + Math.sin(a) * HR), e = pr(ex, ey, z0 - o);
      chains += `M${r0(s0[0])},${r0(s0[1])}Q${r0((s0[0] + e[0]) / 2 + 8)},${r0(Math.max(s0[1], e[1]) + 18)} ${r0(e[0])},${r0(e[1])}`;
    }
    S.add(`<path d="${chains}" fill="none" stroke="#2a1a3e" stroke-width="4"/><path d="${chains}" fill="none" stroke="${VIO}" stroke-width="2.4" stroke-dasharray="4 2.5"/><path d="${chains}" fill="none" stroke="${VIO}" stroke-width="6" opacity=".25" filter="${S.blur(1)}"/>`);
  }

  // --- the shaft through the floor and ceiling, the crystal hoop around it ------------------------------
  const ring = (rad, y, n = 48) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return { a, p: pr(SX + Math.cos(a) * rad, y, SZ + Math.sin(a) * rad), back: Math.sin(a) > 0 }; });
  const hoop = ring(HR, HY, 72);
  // crystals: shards hanging from the hoop; the back half is drawn before the shaft
  const shards = [];
  for (let i = 0; i < 48; i++) {
    const a = (i + R.range(-0.25, 0.25)) / 48 * Math.PI * 2, X = SX + Math.cos(a) * HR, Z = SZ + Math.sin(a) * HR, L = R.range(0.2, 0.36), w = R.range(0.04, 0.065);
    const top = pr(X, HY - 0.02, Z), bot = pr(X, HY - L, Z), mid = pr(X, HY - L * 0.4, Z), k = kAt(Z);
    shards.push({ back: Math.sin(a) > 0, d: pz([top, [mid[0] - w * k, mid[1]], bot, [mid[0] + w * k * 0.8, mid[1] - 1]]), edge: pl([top, [mid[0] - w * k, mid[1]], bot]), core: R() < 0.4 ? pl([[top[0], top[1] + (bot[1] - top[1]) * 0.25], [mid[0] - w * k * 0.2, mid[1] + (bot[1] - mid[1]) * 0.4]]) : '', lit: R() < 0.55 });
  }
  const drawShards = (back) => {
    const list = shards.filter((s) => s.back === back);
    return `<path d="${list.map((s) => s.d).join('')}" fill="#120a1c"/><path d="${list.filter((s) => s.lit).map((s) => s.edge).join('')}" fill="none" stroke="${VIO_HI}" stroke-width="1.4" opacity="${back ? 0.55 : 0.85}"/><path d="${list.map((s) => s.core).join('')}" stroke="#e8d8ff" stroke-width="2.2" stroke-linecap="round" opacity="${back ? 0.5 : 0.85}"/>`;
  };
  // back half of the hoop + its struts to the shaft
  const backArc = hoop.filter((h) => h.back).map((h) => h.p);
  let struts = '';
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.26; struts += pl([pr(SX + Math.cos(a) * SR, HY + 0.12, SZ + Math.sin(a) * SR), pr(SX + Math.cos(a) * HR, HY, SZ + Math.sin(a) * HR)]); }
  S.add(`<path d="${pl(backArc)}" fill="none" stroke="#1a1220" stroke-width="7"/><path d="${pl(backArc)}" fill="none" stroke="${VIO}" stroke-width="1.6" opacity=".5"/>`);
  S.add(`<path d="${pz(hoop.map((h) => h.p))}" fill="none" stroke="#b48cff" stroke-width="34" opacity=".22" filter="${S.blur(2)}"/>`);
  S.add(`<g filter="${S.blur(1)}">${drawShards(true)}</g>`);
  S.add(drawShards(true));
  // the shaft: an eight-sided timber, lit violet on the left; iron bands; floor collar and ceiling bearing
  {
    const L0 = pr(SX - SR, 0, SZ), L1 = pr(SX - SR, CEIL, SZ), R0 = pr(SX + SR, 0, SZ), R1 = pr(SX + SR, CEIL, SZ);
    S.add(`<path d="${pz([L0, L1, R1, R0])}" fill="${S.lin([[0, '#6a5080'], [0.28, '#4a3858'], [0.62, '#2a2030'], [1, '#141018']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    let facets = '';
    for (const u of [0.28, 0.62]) facets += pl([pr(SX - SR + 2 * SR * u, 0, SZ), pr(SX - SR + 2 * SR * u, CEIL, SZ)]);
    S.add(`<path d="${facets}" stroke="#0c0a10" stroke-width="1.6" opacity=".55"/><path d="${pl([L0, L1])}" stroke="${VIO_HI}" stroke-width="2" opacity=".6"/>`);
    let bands = '';
    for (const y of [0.3, 2.35]) bands += pz([pr(SX - SR - 0.01, y, SZ), pr(SX - SR - 0.01, y + 0.06, SZ), pr(SX + SR + 0.01, y + 0.06, SZ), pr(SX + SR + 0.01, y, SZ)]);
    S.add(`<path d="${bands}" fill="#0e0b12"/>`);
    const fl = ring(SR + 0.14, 0.04, 24).map((h) => h.p);
    S.add(`<path d="${pz(fl)}" fill="#1a1420"/><path d="${pl(fl.slice(10, 22))}" fill="none" stroke="${VIO}" stroke-width="1.5" opacity=".5"/>`);
    S.add(`<path d="${pz([pr(SX - SR - 0.12, CEIL - 0.3, SZ), pr(SX - SR - 0.12, CEIL - 0.48, SZ), pr(SX + SR + 0.12, CEIL - 0.48, SZ), pr(SX + SR + 0.12, CEIL - 0.3, SZ)])}" fill="#1e1822"/>`);
    // the violet chain wound round and round the shaft (front halves of each turn)
    let turns = '';
    for (let i = 0; i < 6; i++) {
      const y = 0.62 + i * 0.16;
      const pts = Array.from({ length: 13 }, (_, j) => { const a = Math.PI * j / 12; return pr(SX + Math.cos(a) * (SR + 0.02), y - 0.05 + 0.1 * j / 12, SZ - Math.sin(a) * (SR + 0.02)); });
      turns += pl(pts);
    }
    S.add(`<path d="${turns}" fill="none" stroke="#2a1a3e" stroke-width="5"/><path d="${turns}" fill="none" stroke="${VIO}" stroke-width="3" stroke-dasharray="5 3"/><path d="${turns}" fill="none" stroke="${VIO_HI}" stroke-width="1" stroke-dasharray="2 6" opacity=".9"/>`);
  }
  // struts and the front half of the hoop, front shards
  S.add(`<path d="${struts}" stroke="#1a1220" stroke-width="5"/><path d="${struts}" stroke="${VIO}" stroke-width="1.2" opacity=".45"/>`);
  const frontArc = hoop.filter((h) => !h.back).map((h) => h.p);
  S.add(`<path d="${pl(frontArc)}" fill="none" stroke="#1a1220" stroke-width="9"/><path d="${pl(frontArc)}" fill="none" stroke="${VIO_HI}" stroke-width="2" opacity=".75" transform="translate(0 -3)"/>`);
  S.add(`<g filter="${S.blur(1)}" opacity=".9">${drawShards(false)}</g>`);
  S.add(drawShards(false));

  // --- the trapdoor beside the shaft (where he came up), its iron ring --------------------------------------
  {
    const t = pr.poly([[-0.75, 0.005, 3.55], [-0.75, 0.005, 4.2], [-0.05, 0.005, 4.2], [-0.05, 0.005, 3.55]]);
    S.add(`<path d="${pz(t)}" fill="#1e1822"/><path d="${pz(t)}" fill="none" stroke="#050408" stroke-width="3"/><path d="${pl([t[3], t[0]])}" stroke="${VIO}" stroke-width="1.4" opacity=".45"/>`);
    const rg = pr(-0.4, 0.01, 3.7), kk = kAt(3.7);
    S.add(`<ellipse cx="${r0(rg[0])}" cy="${r0(rg[1])}" rx="${f(0.06 * kk)}" ry="${f(0.025 * kk)}" fill="none" stroke="#3e3646" stroke-width="2.5"/>`);
  }

  // --- sacks heaped in the right foreground (cover on the way along the wall to the cage) -------------------
  S.add(sacks([[2.3, 4.5, 0.72, 0.5, 0], [2.95, 4.6, 0.72, 0.52, 0], [2.6, 4.55, 0.68, 0.44, 0.46], [1.95, 3.9, 0.7, 0.48, 0], [2.6, 3.95, 0.74, 0.52, 0], [3.3, 4.0, 0.7, 0.5, 0], [2.3, 3.95, 0.66, 0.42, 0.47]], '#352c34'));
  { const a = pr(1.95, 0, 3.9), k = kAt(3.9); S.add(`<path d="M${r0(a[0] - 4)},${r0(a[1] - 0.3 * k)}q${r0(0.03 * k)},${r0(-0.16 * k)} ${r0(0.14 * k)},${r0(-0.2 * k)}" fill="none" stroke="${VIO_HI}" stroke-width="2" opacity=".5"/><ellipse cx="${r0(a[0] + 0.3 * k)}" cy="${r0(a[1] + 4)}" rx="${r0(0.6 * k)}" ry="${r0(0.05 * k)}" fill="#9a8eaa" opacity=".18"/>`); }

  // --- motes of old flour drifting in the violet light --------------------------------------------------------
  {
    let m = '';
    for (let i = 0; i < 70; i++) { const a = R() * Math.PI * 2, d = R() ** 0.7 * 340; m += `<circle cx="${r0(hc[0] + Math.cos(a) * d * 1.3)}" cy="${r0(hc[1] + 60 + Math.sin(a) * d * 0.6)}" r="${f(R.range(0.8, 2))}" opacity="${f(R.range(0.2, 0.7), 2)}"/>`; }
    S.add(`<g fill="#e4d6ff">${m}</g>`);
  }

  // --- grading: dark corners, the calm floor under the dialogue box ---------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.3, '#07050a', 0], [1, '#07050a', 0.78]], 'cx="0.52" cy="0.4" r="0.72"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#07050a', 0], [1, '#07050a', 0.72]])}"/>`);
  return S.out();
}

export const oldMillBgs = {
  'old-mill-dusk': oldMillDusk,
  'old-mill-floor': oldMillFloor,
};
