// ending-seal.svg 「静默契约」
// On the roof of the Silver Rail, under the eclipse, the four raise their hands. Four threads of
// memory (Lia crimson, Mia cyan, Serena violet, the captain silver) braid into a key; the seal of
// moon-phase rings turns and its iris closes slowly over the Dawn Seed.
export default function endingSeal(L) {
  const p = 'endingSeal';
  const { PAL, f, shape } = L;
  const R = L.rng(9090);
  const C = [800, 236];          // seed / seal centre
  const RO = 164;                // outer seal radius
  const BOW = [800, 506];        // key bow (where the four threads meet)
  const KEY_TOP = C[1] + RO - 4; // keyhole
  const COL = { lia: PAL.lia, mia: PAL.mia, serena: PAL.serena, player: PAL.silver };

  let defs = L.filters(p) + L.inkDef(p, '#221b40', '#110d22', '#08060f') + L.vignetteDefs(p) + L.warmDef(p)
    + L.linear(`${p}-sky`, [[0, '#05040f'], [0.45, '#110e2a'], [0.78, '#231b48'], [1, '#2e2356']])
    + L.radial(`${p}-halo`, [[0, '#f4efff', 0.55], [0.18, '#cbb8ff', 0.3], [0.5, '#7a5fd0', 0.1], [1, '#3a2a7a', 0]])
    + L.radial(`${p}-seed`, [[0, '#ffffff'], [0.3, '#fff1d6'], [0.62, '#ffd091'], [0.86, '#ffb38a'], [1, '#ff8f9a']], 'cx="0.45" cy="0.4" r="0.65"')
    + L.radial(`${p}-seedGlow`, [[0, '#fff6e6', 0.95], [0.2, '#ffd091', 0.55], [0.5, '#ffb38a', 0.16], [1, '#ff8a6a', 0]])
    + L.linear(`${p}-blade`, [[0, '#d9ceff'], [0.45, '#6f5fc0'], [1, '#231c52']], 'x1="0" y1="0" x2="1" y2="1"')
    + L.linear(`${p}-ridge`, [[0, '#1d1840'], [1, '#0c0a1e']])
    + L.linear(`${p}-ridge2`, [[0, '#14112e'], [1, '#08070f']])
    + L.linear(`${p}-mist`, [[0, '#8f7ae0', 0], [0.5, '#8f7ae0', 0.2], [1, '#8f7ae0', 0]])
    + L.linear(`${p}-roof`, [[0, '#3b4f56'], [0.2, '#1c2a2f'], [1, '#0a1114']])
    + L.radial(`${p}-vig`, [[0.55, '#000', 0], [1, '#000', 0.72]], 'r="0.75"')
    + L.linear(`${p}-bot`, [[0, '#070614', 0], [1, '#070614', 0.85]]);

  let s = '';
  // ---------------------------------------------------------------- far: sky, eclipse, ridges, mist
  s += `<rect width="1600" height="900" fill="url(#${p}-sky)"/>`;
  s += L.stars(R, 170, 0, 0, 1600, 640, PAL.moon, (x, y) => Math.hypot(x - C[0], y - C[1]) < 260);
  s += `<circle cx="${C[0]}" cy="${C[1]}" r="560" fill="url(#${p}-halo)"/>`;
  const ecl = L.eclipse(p, C[0], C[1], 222, { bead: -132, halo: 2.3, beadOp: 0.8 });
  defs += ecl.defs;
  s += ecl.body;
  const ridge = (y0, amp, seed, fill, step = 70) => {
    const Rr = L.rng(seed); const P = [[-20, 900, 1]];
    for (let x = -20; x <= 1620; x += step) P.push([x, y0 - Rr() * amp - Math.sin(x / 260 + seed) * amp * 0.5, 1]);
    P.push([1620, 900, 1]);
    return `<path d="${shape(P)}" fill="${fill}"/>`;
  };
  s += ridge(640, 70, 3, `url(#${p}-ridge)`, 60);
  s += `<rect y="600" width="1600" height="120" fill="url(#${p}-mist)"/>`;
  s += ridge(700, 50, 8, `url(#${p}-ridge2)`, 45);
  // ---------------------------------------------------------------- the Dawn Seed inside its closing seal
  s += `<circle cx="${C[0]}" cy="${C[1]}" r="260" fill="url(#${p}-seedGlow)" opacity=".55"/>`;
  // orbit rings behind
  const orbit = (rx, ry, rot, w, op, front) => {
    const a0 = front ? 0 : Math.PI, a1 = front ? Math.PI : 2 * Math.PI;
    const pt = (a) => { const x = Math.cos(a) * rx, y = Math.sin(a) * ry; const c = Math.cos(rot), sn = Math.sin(rot); return [C[0] + x * c - y * sn, C[1] + x * sn + y * c]; };
    const A = pt(a0), B = pt(a1);
    return `<path d="M${f(A[0])},${f(A[1])}A${rx},${ry} ${f(rot * 180 / Math.PI)} 0 1 ${f(B[0])},${f(B[1])}" fill="none" stroke="#ffe7c8" stroke-width="${w}" opacity="${op}"/>`;
  };
  s += orbit(118, 30, -0.35, 2.5, 0.5, false) + orbit(96, 22, 0.5, 2, 0.4, false);
  // the seed crystal: faceted almond, warm dawn core
  const seed = [[C[0], C[1] - 70, 1], [C[0] + 30, C[1] - 30], [C[0] + 34, C[1] + 16], [C[0] + 16, C[1] + 56], [C[0], C[1] + 66, 1], [C[0] - 16, C[1] + 56], [C[0] - 34, C[1] + 16], [C[0] - 30, C[1] - 30]];
  s += `<circle cx="${C[0]}" cy="${C[1]}" r="120" fill="url(#${p}-seedGlow)"/>`;
  s += `<path d="${shape(seed)}" fill="url(#${p}-seed)"/>`;
  s += `<path d="M${C[0]},${C[1] - 70}L${C[0] - 8},${C[1] + 4}L${C[0]},${C[1] + 66}M${C[0] - 8},${C[1] + 4}L${C[0] - 32},${C[1] - 10}M${C[0] - 8},${C[1] + 4}L${C[0] + 30},${C[1] + 20}" fill="none" stroke="#ffffff" stroke-width="2" opacity=".7"/>`;
  s += `<path d="M${C[0] - 4},${C[1] - 56}L${C[0] - 20},${C[1] - 20}L${C[0] - 12},${C[1] - 24}Z" fill="#ffffff" opacity=".85"/>`;
  s += orbit(118, 30, -0.35, 2.5, 0.85, true) + orbit(96, 22, 0.5, 2, 0.7, true);
  for (const [a, rx, ry, rot] of [[0.7, 118, 30, -0.35], [2.4, 96, 22, 0.5]]) {
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry, c = Math.cos(rot), sn = Math.sin(rot);
    s += `<circle cx="${f(C[0] + x * c - y * sn)}" cy="${f(C[1] + x * sn + y * c)}" r="4.5" fill="#fff6ea"/>`;
  }
  // iris aperture: 8 crescent blades closing over the seed (opening r≈52)
  let blades = '';
  const ri = 52, rb = 132;
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + 0.2;
    const pa = (r, t) => [C[0] + Math.cos(t) * r, C[1] + Math.sin(t) * r];
    const A = pa(rb, a), B = pa(rb, a + 1.05), M1 = pa(ri, a + 0.95), M2 = pa(ri * 1.15, a + 0.25);
    blades += `<path d="M${f(A[0])},${f(A[1])}A${rb},${rb} 0 0 1 ${f(B[0])},${f(B[1])}Q${f(pa(rb * 0.62, a + 1.15)[0])},${f(pa(rb * 0.62, a + 1.15)[1])} ${f(M1[0])},${f(M1[1])}Q${f(pa(ri * 0.9, a + 0.6)[0])},${f(pa(ri * 0.9, a + 0.6)[1])} ${f(M2[0])},${f(M2[1])}Q${f(pa(rb * 0.7, a - 0.05)[0])},${f(pa(rb * 0.7, a - 0.05)[1])} ${f(A[0])},${f(A[1])}Z"/>`;
  }
  s += `<g fill="url(#${p}-blade)" stroke="#f4efff" stroke-width="1.6" opacity=".93">${blades}</g>`;
  // seed light leaking through the remaining opening
  s += `<circle cx="${C[0]}" cy="${C[1]}" r="46" fill="url(#${p}-seedGlow)"/>`;
  // middle ring: 12 rotating arc segments with moon-phase studs
  let segs = '';
  for (let i = 0; i < 12; i++) {
    const a0 = i / 12 * Math.PI * 2 + 0.12, a1 = a0 + Math.PI * 2 / 12 - 0.12, r = 148;
    segs += `M${f(C[0] + Math.cos(a0) * r)},${f(C[1] + Math.sin(a0) * r)}A${r},${r} 0 0 1 ${f(C[0] + Math.cos(a1) * r)},${f(C[1] + Math.sin(a1) * r)}`;
  }
  s += `<path d="${segs}" fill="none" stroke="#d9ccff" stroke-width="7" opacity=".7"/>`;
  s += `<path d="${segs}" fill="none" stroke="#ffffff" stroke-width="1.6" opacity=".9"/>`;
  // outer ring: double line, ticks, eight moon phases, keyhole at the bottom
  s += `<circle cx="${C[0]}" cy="${C[1]}" r="${RO}" fill="none" stroke="#efe9ff" stroke-width="2.5" opacity=".9"/>`;
  s += `<circle cx="${C[0]}" cy="${C[1]}" r="${RO - 14}" fill="none" stroke="#b58cff" stroke-width="1.5" opacity=".8"/>`;
  let ticks = '';
  for (let i = 0; i < 96; i++) {
    const a = i / 96 * Math.PI * 2, r0 = RO - 14, r1 = RO - (i % 4 ? 8 : 2);
    ticks += `M${f(C[0] + Math.cos(a) * r0)},${f(C[1] + Math.sin(a) * r0)}L${f(C[0] + Math.cos(a) * r1)},${f(C[1] + Math.sin(a) * r1)}`;
  }
  s += `<path d="${ticks}" stroke="#e8ddff" stroke-width="1.3" opacity=".75"/>`;
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + i / 8 * Math.PI * 2;
    if (i === 4) continue; // keyhole slot instead of a phase at the bottom
    const x = C[0] + Math.cos(a) * (RO + 20), y = C[1] + Math.sin(a) * (RO + 20), r = 9;
    const k = Math.cos(i / 8 * Math.PI * 2);
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${r + 3}" fill="#0b0920" stroke="#cbb8ff" stroke-width="1.5"/>`;
    s += Math.abs(k) > 0.99 ? (k > 0 ? `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="#f6f2ff"/>` : '')
      : `<path d="M${f(x)},${f(y - r)}A${r},${r} 0 0 ${i < 4 ? 1 : 0} ${f(x)},${f(y + r)}A${f(Math.abs(k) * r)},${r} 0 0 ${(k > 0) === (i < 4) ? 0 : 1} ${f(x)},${f(y - r)}Z" fill="#f6f2ff"/>`;
  }
  // keyhole socket on the ring
  s += `<path d="M${C[0] - 16},${KEY_TOP - 14}h32v22h-32z" fill="#0b0920" stroke="#efe9ff" stroke-width="2"/>`;

  // ---------------------------------------------------------------- the four figures on the roof
  const figs = [
    { key: 'lia', x: 420, y: 1010, s: 0.4, side: 1, sh: [104, -812] },
    { key: 'player', x: 668, y: 1030, s: 0.42, side: 1, sh: [110, -790] },
    { key: 'mia', x: 942, y: 1020, s: 0.37, side: -1, sh: [-112, -744] },
    { key: 'serena', x: 1190, y: 1010, s: 0.4, side: -1, sh: [-98, -808] },
  ];
  const hands = {};
  let figBodies = '';
  for (const F of figs) {
    const tx = (BOW[0] - F.x) / F.s, ty = (BOW[1] - F.y) / F.s;
    const dx = tx - F.sh[0], dy = ty - F.sh[1], d = Math.hypot(dx, dy);
    const reach = F.key === 'mia' ? 300 : 340;
    const hx = F.sh[0] + dx / d * reach, hy = F.sh[1] + dy / d * reach;
    hands[F.key] = [F.x + hx * F.s, F.y + hy * F.s];
    const paths = L.BODY[F.key]().concat([L.raisedArm(F.side, F.sh[0], F.sh[1], hx, hy, F.key === 'mia' ? 46 : F.key === 'lia' ? 34 : 40)]);
    const fig = L.silhouette(p, F.key, paths, F.x, F.y, F.s, { rim: COL[F.key], rimW: 4, moonW: 2.5, glow: 0.55, topRim: '#f4efff', topRimOp: 0.55 });
    defs += fig.defs;
    figBodies += fig.body;
    figBodies += `<circle cx="${f(hands[F.key][0])}" cy="${f(hands[F.key][1])}" r="26" fill="${COL[F.key]}" opacity=".35" filter="url(#${p}-b1)"/><circle cx="${f(hands[F.key][0])}" cy="${f(hands[F.key][1])}" r="5" fill="#ffffff"/>`;
  }

  // ---------------------------------------------------------------- the roof of the Silver Rail
  s += `<path d="M-20,900L-20,858Q800,808 1620,858L1620,900Z" fill="url(#${p}-roof)"/>`;
  s += `<path d="M-20,858Q800,808 1620,858" fill="none" stroke="#cfc6ff" stroke-width="2" opacity=".5"/>`;
  s += `<path d="M-20,872Q800,826 1620,872" fill="none" stroke="#b88a4a" stroke-width="3" opacity=".55"/>`;
  let posts = '';
  for (let x = 40; x < 1600; x += 140) { const y = 858 - 50 * Math.sin(Math.PI * (x + 20) / 1640) * 0.98; posts += `M${x},${f(y + 10)}v-34`; }
  s += `<path d="${posts}" stroke="#b88a4a" stroke-width="4" opacity=".6"/>`;
  s += `<path d="M-20,824Q800,774 1620,824" fill="none" stroke="#d9b57a" stroke-width="3" opacity=".55"/>`;
  s += `<ellipse cx="800" cy="842" rx="520" ry="34" fill="#cbb8ff" opacity=".22" filter="url(#${p}-b2)"/>`;
  s += figBodies;

  // ---------------------------------------------------------------- the threads and the braided key
  const thread = (H, col, bend) => {
    const [hx, hy] = H;
    const mx = (hx + BOW[0]) / 2 + bend, my = Math.min(hy, BOW[1]) - 60;
    return `M${f(hx)},${f(hy)}Q${f(mx)},${f(my)} ${BOW[0]},${BOW[1] + 4}`;
  };
  const T = { lia: thread(hands.lia, COL.lia, -40), player: thread(hands.player, COL.player, -20), mia: thread(hands.mia, COL.mia, 20), serena: thread(hands.serena, COL.serena, 40) };
  // memory beads travelling up each thread, each holding a tiny warm life-fragment
  let beads = '';
  const bends = { lia: -40, player: -20, mia: 20, serena: 40 };
  for (const k of Object.keys(bends)) {
    const [hx, hy] = hands[k], mx = (hx + BOW[0]) / 2 + bends[k], my = Math.min(hy, BOW[1]) - 60;
    for (const t of [0.38, 0.72]) {
      const x = (1 - t) ** 2 * hx + 2 * (1 - t) * t * mx + t * t * BOW[0], y = (1 - t) ** 2 * hy + 2 * (1 - t) * t * my + t * t * (BOW[1] + 4);
      beads += `<circle cx="${f(x)}" cy="${f(y)}" r="22" fill="url(#${p}-warm)" opacity=".55"/><circle cx="${f(x)}" cy="${f(y)}" r="8.5" fill="#fff4e6" stroke="${COL[k]}" stroke-width="2"/>`;
      beads += L.vignette(p, R, x, y, 11, 0, 0.95);
    }
  }
  let glow = '', core = '';
  for (const k of Object.keys(T)) {
    glow += `<path d="${T[k]}" stroke="${COL[k]}"/>`;
    core += `<path d="${T[k]}" stroke="${COL[k]}" stroke-width="3"/><path d="${T[k]}" stroke="#ffffff" stroke-width="1" opacity=".8"/>`;
  }
  s += `<g fill="none" stroke-width="12" opacity=".55" filter="url(#${p}-b1)">${glow}</g><g fill="none" stroke-linecap="round">${core}</g>` + beads;
  // bow: four interlaced loops (quatrefoil)
  const loops = [['lia', 225], ['player', 315], ['mia', 45], ['serena', 135]];
  let bowG = '', bowC = '';
  for (const [k, deg] of loops) {
    const a = deg * Math.PI / 180, r = 38;
    const tip = [BOW[0] + Math.cos(a) * r * 1.7, BOW[1] + Math.sin(a) * r * 1.7];
    const l1 = [BOW[0] + Math.cos(a - 0.9) * r * 1.3, BOW[1] + Math.sin(a - 0.9) * r * 1.3], l2 = [BOW[0] + Math.cos(a + 0.9) * r * 1.3, BOW[1] + Math.sin(a + 0.9) * r * 1.3];
    const d = `M${BOW[0]},${BOW[1]}C${f(l1[0])},${f(l1[1])} ${f(tip[0] + Math.cos(a - 1.6) * 16)},${f(tip[1] + Math.sin(a - 1.6) * 16)} ${f(tip[0])},${f(tip[1])}C${f(tip[0] + Math.cos(a + 1.6) * 16)},${f(tip[1] + Math.sin(a + 1.6) * 16)} ${f(l2[0])},${f(l2[1])} ${BOW[0]},${BOW[1]}`;
    bowG += `<path d="${d}" stroke="${COL[k]}"/>`;
    bowC += `<path d="${d}" stroke="${COL[k]}" stroke-width="4"/><path d="${d}" stroke="#ffffff" stroke-width="1.2" opacity=".8"/>`;
  }
  s += `<g fill="none" stroke-width="14" opacity=".5" filter="url(#${p}-b1)">${bowG}</g><g fill="none">${bowC}</g>`;
  s += `<circle cx="${BOW[0]}" cy="${BOW[1]}" r="22" fill="#ffffff" opacity=".5" filter="url(#${p}-b1)"/><circle cx="${BOW[0]}" cy="${BOW[1]}" r="6" fill="#ffffff"/>`;
  // braided shaft: four sinusoids twisting up into the keyhole, two bit teeth
  const y0 = BOW[1] - 46, y1 = KEY_TOP;
  let braid = '';
  ['lia', 'mia', 'serena', 'player'].forEach((k, i) => {
    let d = '';
    for (let j = 0; j <= 24; j++) {
      const t = j / 24, y = y0 + (y1 - y0) * t, x = BOW[0] + Math.sin(t * Math.PI * 4 + i * Math.PI / 2) * 9;
      d += `${j ? 'L' : 'M'}${f(x)},${f(y)}`;
    }
    braid += `<path d="${d}" stroke="${COL[k]}" stroke-width="3.5"/>`;
  });
  s += `<path d="M${BOW[0]},${y0 + 4}V${y1}" stroke="#ffffff" stroke-width="18" opacity=".25" filter="url(#${p}-b1)"/>`;
  s += `<path d="M${BOW[0] - 70},${BOW[1]}L${BOW[0] - 30},${y1}H${BOW[0] + 30}L${BOW[0] + 70},${BOW[1]}Z" fill="#e8ddff" opacity=".12" filter="url(#${p}-b2)"/>`;
  s += `<g fill="none" stroke-linecap="round">${braid}</g>`;
  const bit = `M${BOW[0] + 9},${y1 + 12}h20a4,4 0 0 1 4,4v24a4,4 0 0 1 -4,4h-20zM${BOW[0] + 21},${y1 + 23}a5,5 0 1 0 0.1,0z`;
  s += `<path d="${bit}" fill="#f4efff" fill-rule="evenodd" opacity=".92"/><path d="${bit}" fill="none" stroke="${PAL.serena}" stroke-width="1.5"/>`;

  // ---------------------------------------------------------------- motes rising along the threads
  let motes = '';
  for (let i = 0; i < 70; i++) {
    const k = R.pick(['lia', 'mia', 'serena', 'player']);
    const [hx, hy] = hands[k], t = R();
    const x = hx + (BOW[0] - hx) * t + R.range(-30, 30), y = hy + (BOW[1] - hy) * t - Math.sin(t * Math.PI) * 50 + R.range(-30, 30);
    motes += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(R.range(1, 2.6))}" fill="${COL[k]}"/>`;
  }
  s += `<g opacity=".85">${motes}</g>`;
  s += `<rect width="1600" height="900" fill="url(#${p}-vig)"/>`;
  s += `<rect y="760" width="1600" height="140" fill="url(#${p}-bot)"/>`;
  return L.svgDoc('静默契约：四人的记忆交织成钥匙，封印在黎明种核心缓缓闭合', defs, s);
}
