// ending-destroy.svg 「永夜终章」
// The eclipse never ends. In a gloved hand the Dawn Seed cracks and comes apart: embers first, then
// grey ash carried off on the wind toward the black moon. Below, the towns along the rails stay dark.
export default function endingDestroy(L) {
  const p = 'endingDestroy';
  const { PAL, f, shape } = L;
  const R = L.rng(6606);
  const SEED = [1124, 622];
  const MOON = [392, 226];

  let defs = L.filters(p) + L.warmDef(p)
    + L.linear(`${p}-sky`, [[0, '#04030b'], [0.5, '#0b0d24'], [0.8, '#141a3a'], [1, '#1b1f44']], 'gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="720"')
    + L.linear(`${p}-r1`, [[0, '#151a3a'], [1, '#0b0e22']])
    + L.linear(`${p}-r2`, [[0, '#0c0f24'], [1, '#06070f']])
    + L.linear(`${p}-fog`, [[0, '#6a72b0', 0], [0.5, '#6a72b0', 0.16], [1, '#6a72b0', 0]])
    + L.linear(`${p}-glove`, [[0, '#3a3046'], [0.45, '#1e1828'], [1, '#0d0a12']], 'gradientUnits="userSpaceOnUse" x1="0" y1="595" x2="0" y2="722"')
    + L.linear(`${p}-sleeve`, [[0, '#24203a'], [1, '#0a0812']], 'x1="0" y1="0" x2="1" y2="1"')
    + L.radial(`${p}-ember`, [[0, '#fff1d6'], [0.2, '#ffb45e', 0.9], [0.5, '#ff7a3c', 0.35], [1, '#c43a2a', 0]])
    + L.radial(`${p}-cinder`, [[0, '#ffe2b8'], [0.5, '#ff9a5a'], [1, '#7a3a3a']], 'cx="0.45" cy="0.35" r="0.7"')
    + L.radial(`${p}-vig`, [[0.5, '#000', 0], [1, '#000', 0.8]], 'cx="0.55" cy="0.5" r="0.78"')
    + L.linear(`${p}-bot`, [[0, '#04030b', 0], [1, '#04030b', 0.85]]);

  let s = '';
  // ---------------------------------------------------------------- endless night: sky, the black moon
  s += `<rect width="1600" height="900" fill="url(#${p}-sky)"/>`;
  s += L.stars(R, 150, 0, 0, 1600, 640, '#c9c4ea');
  const ecl = L.eclipse(p, MOON[0], MOON[1], 98, { bead: 0, beadOp: 0, halo: 3.0, coronaOp: 0.75 });
  defs += ecl.defs;
  s += ecl.body;
  // cold high cloud bands drifting across the endless night
  let clouds = '';
  for (const [x, y, w, h, o] of [[1180, 150, 520, 26, 0.16], [1320, 250, 420, 18, 0.12], [860, 110, 360, 14, 0.1], [200, 420, 520, 20, 0.1], [1240, 380, 300, 12, 0.1]]) {
    clouds += `<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="${h}" opacity="${o}"/>`;
  }
  s += `<g fill="#7a80c0" filter="url(#${p}-b2)">${clouds}</g>`;
  // faint second corona ring: cold, thin
  s += `<circle cx="${MOON[0]}" cy="${MOON[1]}" r="122" fill="none" stroke="#8f86c8" stroke-width="1" opacity=".5"/>`;

  // ---------------------------------------------------------------- the dark world below
  const ridge = (y0, amp, seed, step) => {
    const Rr = L.rng(seed); const P = [[-20, 900, 1]];
    for (let x = -20; x <= 1620; x += step) P.push([x, y0 - Rr() * amp - Math.sin(x / 210 + seed) * amp * 0.7]);
    P.push([1620, 900, 1]);
    return { d: shape(P), top: P.slice(1, -1) };
  };
  const r1 = ridge(640, 70, 4, 50);
  s += `<path d="${r1.d}" fill="url(#${p}-r1)"/><path d="${shape(r1.top, false)}" fill="none" stroke="#5a62a0" stroke-width="1.5" opacity=".45"/>`;
  s += `<rect y="610" width="1600" height="120" fill="url(#${p}-fog)"/>`;
  const r2 = ridge(712, 40, 11, 40);
  s += `<path d="${r2.d}" fill="url(#${p}-r2)"/><path d="${shape(r2.top, false)}" fill="none" stroke="#3a4278" stroke-width="1.5" opacity=".5"/>`;
  // rails: a thin cold thread through the valley; dark towns with no lights
  s += `<path d="M-20,812C300,780 520,760 760,744S1180,724 1620,730" fill="none" stroke="#9aa2d6" stroke-width="1.6" opacity=".45"/>`;
  s += `<path d="M-20,822C300,790 520,770 760,754S1180,734 1620,740" fill="none" stroke="#9aa2d6" stroke-width="1.2" opacity=".3"/>`;
  let houses = '';
  for (const [tx, ty, k] of [[240, 770, 1], [610, 742, 0.8], [880, 730, 0.7]]) {
    for (let i = 0; i < 9; i++) {
      const x = tx + R.range(-50, 50) * k, y = ty + R.range(-6, 10) * k, w = R.range(10, 16) * k, h = R.range(7, 12) * k;
      houses += `<path d="M${f(x - w / 2, 0)},${f(y, 0)}v${f(-h, 0)}l${f(w / 2, 0)},${f(-h * 0.7, 0)}l${f(w / 2, 0)},${f(h * 0.7, 0)}v${f(h, 0)}z"/>`;
    }
    houses += `<path d="M${f(tx - 5 * k, 0)},${f(ty - 6 * k, 0)}v${f(-24 * k, 0)}l${f(5 * k, 0)},${f(-12 * k, 0)}l${f(5 * k, 0)},${f(12 * k, 0)}v${f(24 * k, 0)}z"/>`;
  }
  s += `<g fill="#05060e">${houses}</g>`;

  // ---------------------------------------------------------------- hand placement (local hand coords -> canvas)
  const K = 2.4, HP = [1124, 622], HC = [1000, 548];
  const toC = ([x, y]) => [HC[0] + (x - HP[0]) * K, HC[1] + (y - HP[1]) * K];
  const HT = `translate(${f(HC[0] - HP[0] * K)} ${f(HC[1] - HP[1] * K)}) scale(${K})`;

  // ---------------------------------------------------------------- ash and embers carried toward the moon
  const A0 = toC([SEED[0] + 2, SEED[1] - 32]), A1 = [880, 330], A2 = [690, 280], A3 = [470, 276];
  let embers = '', glowE = '', ashN = '', ashF = '', flakes = '';
  for (let i = 0; i < 300; i++) {
    const t = Math.pow(R(), 0.8);
    const [bx, by] = L.bezierAt(A0, A1, A2, A3, t);
    const spread = 10 + 130 * t;
    const x = bx + R.range(-1, 1) * spread, y = by + R.range(-1, 1) * spread * 0.6 + Math.sin(t * 9 + i) * 12 * t;
    if (t < 0.25 && R() < 0.75) {
      const r = R.range(1.6, 4.4) * (1 - t * 2);
      embers += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(Math.max(0.9, r))}"/>`;
      if (R() < 0.35) glowE += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(r * 6, 0)}" fill="url(#${p}-ember)" opacity=".7"/>`;
    } else if (t < 0.6) {
      if (R() < 0.45) {
        const sz = R.range(3.5, 9) * (1 - t * 0.8), a = R.range(0, 6.28);
        flakes += `<path d="M${f(x + Math.cos(a) * sz, 0)},${f(y + Math.sin(a) * sz, 0)}L${f(x + Math.cos(a + 2.2) * sz * 0.6, 0)},${f(y + Math.sin(a + 2.2) * sz * 0.6, 0)}L${f(x + Math.cos(a + 3.9) * sz, 0)},${f(y + Math.sin(a + 3.9) * sz, 0)}Z"/>`;
      } else ashN += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(R.range(0.9, 2.4))}"/>`;
    } else ashF += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(R.range(0.6, 1.7))}"/>`;
  }
  s += `<path d="M${f(A0[0])},${f(A0[1])}C${A1[0]},${A1[1]} ${A2[0]},${A2[1]} ${A3[0]},${A3[1]}" fill="none" stroke="#8a84b0" stroke-width="70" stroke-linecap="round" opacity=".09" filter="url(#${p}-b2)"/>`;
  // wind-drawn wisps along the stream
  let wisps = '';
  for (let k = 0; k < 4; k++) {
    const o = (k - 1.5) * 26;
    wisps += `M${f(A0[0] + o * 0.3, 0)},${f(A0[1] + o * 0.2, 0)}C${f(A1[0] + o, 0)},${f(A1[1] + o * 0.8, 0)} ${f(A2[0] + o * 1.4, 0)},${f(A2[1] + o * 1.2, 0)} ${f(A3[0] + 90 + o * 2, 0)},${f(A3[1] + 10 + o * 1.6, 0)}`;
  }
  s += `<path d="${wisps}" fill="none" stroke="#a8a0c8" stroke-width="1.4" stroke-dasharray="60 30 20 40" opacity=".22"/>`;
  s += `<g fill="#6f6a86" opacity=".6">${ashF}</g><g fill="#9a90a8" opacity=".8">${ashN}</g><g fill="#b8a8ac" opacity=".85">${flakes}</g>`;
  s += glowE + `<g fill="#ffd9a0">${embers}</g>`;

  // ---------------------------------------------------------------- the cloak sleeve (canvas coords)
  const sleeve = shape([[1640, 470, 1], [1520, 488], [1390, 516], [1268, 548], [1226, 560, 1], [1244, 604, 1], [1220, 642, 1], [1246, 688, 1], [1218, 728, 1], [1248, 770, 1], [1232, 800, 1], [1300, 830], [1380, 880], [1420, 920, 1], [1640, 920, 1]]);
  s += `<path d="${sleeve}" fill="url(#${p}-sleeve)"/>`;
  s += `<path d="M1640,470C1520,488 1390,516 1268,548L1226,560" fill="none" stroke="${PAL.moon}" stroke-width="3" opacity=".6"/>`;
  s += `<path d="M1420,540C1370,600 1350,690 1360,790M1520,520C1480,600 1470,700 1490,820M1590,540C1560,620 1560,720 1580,840" fill="none" stroke="#08060e" stroke-width="6" opacity=".75"/>`;
  s += `<path d="M1244,604L1220,642L1246,688L1218,728L1248,770" fill="none" stroke="#ff9a5a" stroke-width="2" opacity=".35"/>`;

  // ---------------------------------------------------------------- the gloved hand (local coords, scaled)
  const fingerDefs = [
    [[[1160, 650], [1142, 630], [1126, 617], [1108, 609]], 24, 19],   // thumb (behind the cup)
    [[[1100, 648], [1062, 639], [1032, 624], [1016, 606]], 19, 14],   // index
    [[[1098, 660], [1056, 659], [1022, 650], [1002, 634]], 20, 14.5], // middle
    [[[1098, 673], [1058, 677], [1028, 675], [1010, 662]], 19, 14],   // ring
    [[[1100, 688], [1068, 694], [1046, 695], [1032, 686]], 16.5, 12], // little finger
  ];
  const fingerShapes = fingerDefs.map(([P0, w0, w1]) => {
    const P = P0.map(([x, y]) => [P0[0][0] + (x - P0[0][0]) * 0.86, P0[0][1] + (y - P0[0][1]) * 0.9]);
    const S = L.spline(P, 16);
    const rb = L.ribbon(S, (t) => w0 + (w1 - w0) * t);
    const tip = S[S.length - 1];
    const lt = rb.left[rb.left.length - 1], rt = rb.right[rb.right.length - 1];
    const d = `M${rb.left.map(([x, y]) => `${f(x)},${f(y)}`).join('L')}A${f(w1 / 2)},${f(w1 / 2)} 0 0 0 ${f(rt[0])},${f(rt[1])}L${rb.right.slice().reverse().map(([x, y]) => `${f(x)},${f(y)}`).join('L')}Z`;
    return { d, tip, w1, S, w0, top: rb.left, bot: rb.right, lt };
  });
  const palm = 'M1174,642C1146,634 1116,636 1094,644C1088,656 1090,668 1088,680C1086,692 1090,700 1094,708C1116,718 1144,722 1176,714Z';
  const cuff = 'M1168,634C1180,630 1196,628 1214,628L1218,722C1200,722 1184,720 1172,716Z';
  const fingerPath = (F) => `<path d="${F.d}"/>`;
  defs += `<g id="${p}-hand"><path d="${palm}"/><path d="${cuff}"/>${fingerShapes.map(fingerPath).join('')}</g>`;
  let h = '';
  h += `<use href="#${p}-hand" fill="#ffb38a" opacity=".28" filter="url(#${p}-b1)" transform="translate(0 0)"/>`;
  h += `<use href="#${p}-hand" fill="${PAL.moon}" opacity=".75" transform="translate(-1.2 -1.6)"/>`;
  h += `<use href="#${p}-hand" fill="#07050b" transform="translate(.8 1.2)"/>`;
  const drawFinger = (F, i) => {
    let o = `<g fill="url(#${p}-glove)" stroke="#07050b" stroke-width="1.6">${fingerPath(F)}</g>`;
    // the palmar side faces up: warm light from the burning seed along the top edge
    const topEdge = F.top.slice(1).map(([x, y]) => [x + 0.9, y + 1.6]);
    o += `<path d="${L.polyline(topEdge, 1)}" fill="none" stroke="#ff9a5a" stroke-width="${i === 0 ? 1.6 : 2.4}" stroke-linecap="round" opacity="${i === 0 ? 0.35 : 0.6}"/>`;
    if (i === 1) o += `<path d="${L.polyline(F.top.slice(0), 1)}" fill="none" stroke="#d6cef4" stroke-width="1.3" opacity=".75"/>`;
    for (const k of [7, 12]) {
      const q = F.S[k], w = F.w0 * 0.38;
      o += `<path d="M${f(q.x + q.nx * w)},${f(q.y + q.ny * w)}Q${f(q.x - q.tx * 2)},${f(q.y - q.ty * 2)} ${f(q.x - q.nx * w * 0.2)},${f(q.y - q.ny * w * 0.2)}" fill="none" stroke="#07050b" stroke-width="1" opacity=".6"/>`;
    }
    return o;
  };
  h += drawFinger(fingerShapes[0], 0);
  // the crumbling seed in the cup
  h += `<circle cx="${SEED[0]}" cy="${SEED[1] - 6}" r="64" fill="url(#${p}-ember)" opacity=".65"/>`;
  const X = SEED[0], Y = SEED[1];
  const body = `M${X - 20},${Y + 6}L${X - 14},${Y - 18}L${X - 4},${Y - 26}L${X + 2},${Y - 16}L${X + 9},${Y - 30}L${X + 16},${Y - 14}L${X + 22},${Y + 4}L${X + 14},${Y + 26}L${X},${Y + 32}L${X - 14},${Y + 24}Z`;
  h += `<path d="${body}" fill="#c4583e"/>`;
  h += `<path d="M${X - 20},${Y + 6}L${X - 14},${Y - 18}L${X - 4},${Y - 26}L${X - 2},${Y + 4}L${X},${Y + 32}L${X - 14},${Y + 24}Z" fill="#ffd2a0"/>`;
  h += `<path d="M${X - 2},${Y + 4}L${X + 2},${Y - 16}L${X + 9},${Y - 30}L${X + 16},${Y - 14}L${X + 22},${Y + 4}Z" fill="#ff9a5a"/>`;
  h += `<path d="M${X - 2},${Y + 4}L${X + 22},${Y + 4}L${X + 14},${Y + 26}L${X},${Y + 32}Z" fill="#8a3a32"/>`;
  // ash crust where it is already burning away (the broken crown)
  h += `<path d="M${X - 14},${Y - 18}L${X - 4},${Y - 26}L${X + 2},${Y - 16}L${X + 9},${Y - 30}L${X + 16},${Y - 14}L${X + 8},${Y - 10}L${X + 1},${Y - 6}L${X - 8},${Y - 10}Z" fill="#7a7088"/>`;
  h += `<path d="M${X - 2},${Y + 4}L${X - 10},${Y + 14}M${X - 2},${Y + 4}L${X + 8},${Y + 16}M${X + 2},${Y - 6}L${X - 2},${Y + 4}L${X + 14},${Y - 2}" fill="none" stroke="#fff1d6" stroke-width="1.1"/>`;
  h += `<circle cx="${X - 2}" cy="${Y + 4}" r="3.2" fill="#ffffff"/>`;
  // flakes lifting off the crown
  for (const [dx, dy, r, c] of [[-6, -36, 3, '#ffb38a'], [6, -40, 2.4, '#8a8298'], [14, -36, 2, '#ffd2a0'], [-2, -46, 2, '#9a90a8'], [10, -50, 1.6, '#ffb38a'], [20, -44, 1.6, '#8a8298']]) {
    h += `<path d="M${X + dx},${Y + dy - r}l${r},${r * 1.4}l${-r * 1.6},${-r * 0.2}z" fill="${c}"/>`;
  }
  for (let i = 1; i < fingerShapes.length; i++) h += drawFinger(fingerShapes[i], i);
  // palm + cuff in front of the seed's lower half and the finger roots
  h += `<path d="${palm}" fill="url(#${p}-glove)"/>`;
  h += `<path d="M1094,644C1116,636 1146,634 1174,642" fill="none" stroke="#ff9a5a" stroke-width="2.2" opacity=".6"/>`;
  h += `<path d="M1094,644C1088,656 1090,668 1088,680C1086,692 1090,700 1094,708" fill="none" stroke="#07050b" stroke-width="1.6"/>`;
  h += `<path d="M1088,682C1112,690 1144,694 1172,690" fill="none" stroke="#07050b" stroke-width="1.3" opacity=".8"/>`;
  h += `<path d="M1092,662C1118,668 1146,670 1170,666" fill="none" stroke="#4a3e5a" stroke-width="1" stroke-dasharray="3 3" opacity=".8"/>`;
  h += `<path d="${cuff}" fill="#251d30"/><path d="M1168,634C1180,630 1196,628 1214,628" fill="none" stroke="${PAL.moon}" stroke-width="1.2" opacity=".7"/><path d="M1171,648L1215,644M1172,704L1217,704" stroke="#b88a4a" stroke-width="2" opacity=".75"/>`;
  s += `<g transform="${HT}">${h}</g>`;

  // ash sifting down between the fingers
  let fall = '';
  for (let i = 0; i < 50; i++) {
    const t = R(), x = 730 + R.range(-10, 130) - t * 40, y = 700 + t * 200;
    fall += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(R.range(0.9, 2.4) * (1 - t * 0.5))}"/>`;
  }
  s += `<g fill="#8a8298" opacity=".7">${fall}</g>`;
  s += `<g fill="#ffb45e">${[[760, 730], [742, 780], [776, 806]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4"/>`).join('')}</g>`;
  // out-of-focus embers near the lens
  s += `<g filter="url(#${p}-b2)"><circle cx="1180" cy="330" r="16" fill="#ff9a5a" opacity=".5"/><circle cx="1290" cy="420" r="10" fill="#ffb45e" opacity=".45"/><circle cx="930" cy="250" r="12" fill="#ff8a6a" opacity=".35"/></g>`;

  s += `<rect width="1600" height="900" fill="url(#${p}-vig)"/>`;
  s += `<rect y="760" width="1600" height="140" fill="url(#${p}-bot)"/>`;
  return L.svgDoc('永夜终章：黎明种在手中化为灰烬，恢复过去的机会永远消失', defs, s);
}
