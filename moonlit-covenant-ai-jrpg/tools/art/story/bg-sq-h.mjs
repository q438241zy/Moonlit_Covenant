// 成长支线的场景背景：north-slope-registry-tent（北山营地·登记帐篷）。
//   north-slope-registry-tent — inside the camp's registration tent on the north slope (ex024): a canvas tent on a centre
//                               pole, the flap at the back tied open on a bright morning — the slope, a few tents, the wheat
//                               plain and, very small on the horizon, a bell tower. In front, a long trestle table with a thick
//                               open register (ruled lines and little tick marks only), an inkpot and quill, a closed smaller
//                               book with a ribbon, loose papers; a bench behind it; a crate of torn loose pages in the corner;
//                               a lantern hanging from the pole. Canvas beige and morning gold. No text, no figures.
import { Scene, W, H, f, pz, pl, persp, rng } from './lib.mjs';

const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;

function registryTent() {
  const S = new Scene('sbSqhTent', '北山营地·登记帐篷：中柱撑起的帆布帐篷，后面的门帘系开，外面是晴朗的早晨、坡地、几顶帐篷、麦田平原和地平线上很小的一座钟塔；近处一张长条桌，摊着一本厚登记簿（只有格线和小勾）、墨水瓶和羽毛笔、一本系着丝带的小簿子、几张散纸，桌后一条长凳，角落一箱撕下来的册页，柱上挂着一盏提灯；不画人，不写字', 24801);
  const R = rng(24802);
  const P = persp({ vp: [800, 430], F: 820, eye: 1.6 });
  const XW = 5, YW = 1.8, YR = 4.2, ZB = 9, ZN = 2.2;

  // base fill (the shadowed canvas)
  S.add(`<rect width="${W}" height="${H}" fill="#3a2e22"/>`);

  // ── the view through the door (painted first, then the back wall is cut around it) ──
  const door = P.poly([[1.2, 0, ZB], [1.2, 1.55, ZB], [2.2, 2.35, ZB], [3.2, 1.55, ZB], [3.2, 0, ZB]]);
  const doorD = pz(door);
  const clip = S.clip(doorD);
  const [dx0] = door[0], [dx1] = door[4], dyTop = door[2][1], dyBot = door[0][1];
  let out = '';
  out += `<rect x="${f1(dx0 - 4)}" y="${f1(dyTop - 4)}" width="${f1(dx1 - dx0 + 8)}" height="${f1(dyBot - dyTop + 8)}" fill="${S.lin([[0, '#9cc4e4'], [0.55, '#d8e8ee'], [1, '#f6ecd0']])}"/>`;
  out += `<ellipse cx="${f1(dx0 + 40)}" cy="${f1(dyTop + 30)}" rx="120" ry="80" fill="${S.rad([[0, '#fffbe8', 0.8], [1, '#fffbe8', 0]])}"/>`;
  // distant plain and wheat
  const hz = 468;
  out += `<path d="M${f1(dx0 - 4)},${hz}Q${f1((dx0 + dx1) / 2)},${hz - 6} ${f1(dx1 + 4)},${hz - 2}V${f1(dyBot + 4)}H${f1(dx0 - 4)}Z" fill="#c8c08e"/>`;
  out += `<path d="M${f1(dx0 - 4)},${hz + 10}Q${f1((dx0 + dx1) / 2)},${hz + 2} ${f1(dx1 + 4)},${hz + 8}V${hz + 26}H${f1(dx0 - 4)}Z" fill="#e2c874"/>`;
  { let st = ''; for (let k = 0; k < 26; k++) { const x = R.range(dx0, dx1), y = R.range(hz + 12, hz + 24); st += `M${f1(x)},${f1(y)}v-5`; } out += `<path d="${st}" stroke="#c9a84e" stroke-width="1.5"/>`; }
  // the tiny bell tower on the horizon (far off; no detail)
  out += `<path d="M960,${hz - 1}v-30l6,-11l6,11v30z" fill="#7a8088"/><path d="M964,${hz - 26}h4v6h-4z" fill="#5c626a"/>`;
  out += `<path d="M938,${hz}h56v-5q-28,-4 -56,0z" fill="#9aa098" opacity=".8"/>`;
  // the slope falling away, a few tents and a thin smoke
  out += `<path d="M${f1(dx0 - 4)},${hz + 30}Q${f1(dx0 + 80)},${hz + 18} ${f1(dx1 + 4)},${hz + 44}V${f1(dyBot + 4)}H${f1(dx0 - 4)}Z" fill="${S.lin([[0, '#a8b46c'], [1, '#7e8c4c']])}"/>`;
  for (const [x, y, w, h] of [[940, 506, 34, 22], [990, 516, 40, 26], [1052, 510, 28, 18]]) out += `<path d="M${x},${y}l${w / 2},-${h}l${w / 2},${h}z" fill="#d8cbae"/><path d="M${x + w / 2},${y - h}l${w / 2},${h}h-${w * 0.18}z" fill="#b2a284"/>`;
  out += `<path d="${ell(1010, 470, 8, 10)}${ell(1016, 452, 11, 12)}${ell(1024, 432, 14, 13)}" fill="#ffffff" opacity=".55" filter="${S.blur(2)}"/>`;
  // the trampled path up to the door, with the queue's footprints worn into it
  out += `<path d="M${f1(dx0 + 40)},${f1(dyBot + 4)}Q${f1(dx0 + 90)},${hz + 70} ${f1(dx0 + 150)},${hz + 40}" stroke="#c8b88a" stroke-width="30" fill="none" opacity=".75"/>`;
  S.add(`<g clip-path="${clip}">${out}</g>`);

  // ── back wall (pentagon, minus the door) ──
  const back = P.poly([[-XW, 0, ZB], [XW, 0, ZB], [XW, YW, ZB], [0, YR, ZB], [-XW, YW, ZB]]);
  S.add(`<path d="${pz(back)}${[...door].reverse().map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)},${f1(y)}`).join('')}Z" fill="${S.lin([[0, '#c8b490'], [1, '#a8936e']])}" fill-rule="evenodd"/>`);
  // seams on the back wall
  { let sm = ''; for (const X of [-3, -1.2, 0.6, 3.8]) { const a = P(X, 0, ZB), b = P(X, X < 0 ? YW + (YR - YW) * (1 + X / XW) : YW + (YR - YW) * (1 - X / XW), ZB); sm += `M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}`; } S.add(`<path d="${sm}" stroke="#8e7a58" stroke-width="2" opacity=".6"/>`); }
  // the flap, rolled and tied back to the right of the door
  { const t = P(3.2, 1.55, ZB), b = P(3.2, 0, ZB), apex = door[2];
    S.add(`<path d="M${f1(apex[0])},${f1(apex[1])}L${f1(t[0] + 4)},${f1(t[1])}Q${f1(t[0] + 30)},${f1(t[1] + 40)} ${f1(t[0] + 22)},${f1(b[1])}L${f1(t[0] - 2)},${f1(b[1])}Z" fill="#b8a27c"/>`);
    S.add(`<path d="M${f1(t[0] + 2)},${f1(t[1] + 70)}q16,-4 26,2" stroke="#5a4630" stroke-width="4" fill="none"/>`);
    S.add(`<path d="${pl([[door[0][0], door[0][1]], [door[1][0], door[1][1]], [apex[0], apex[1]], [door[3][0], door[3][1]], [door[4][0], door[4][1]]])}" fill="none" stroke="#7a6446" stroke-width="5" stroke-linejoin="round"/>`); }

  // ── side walls and roof panels ──
  const lw = P.poly([[-XW, 0, ZN], [-XW, 0, ZB], [-XW, YW, ZB], [-XW, YW, ZN]]);
  const rw = P.poly([[XW, 0, ZN], [XW, 0, ZB], [XW, YW, ZB], [XW, YW, ZN]]);
  S.add(`<path d="${pz(lw)}" fill="${S.lin([[0, '#8e7a5a'], [1, '#a8946e']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="${pz(rw)}" fill="${S.lin([[0, '#9c8862'], [1, '#7a6648']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  const lr = P.poly([[-XW, YW, ZN], [-XW, YW, ZB], [0, YR, ZB], [0, YR, ZN]]);
  const rr = P.poly([[XW, YW, ZN], [XW, YW, ZB], [0, YR, ZB], [0, YR, ZN]]);
  S.add(`<path d="${pz(lr)}" fill="${S.lin([[0, '#9a8562'], [1, '#bca886']], 'x1="0" y1="0" x2="1" y2="0.4"')}"/>`);
  S.add(`<path d="${pz(rr)}" fill="${S.lin([[0, '#ad9874'], [1, '#806c4c']], 'x1="0" y1="0.4" x2="1" y2="0"')}"/>`);
  // roof seams and rafters running toward the back
  { let sm = '';
    for (const t of [0.25, 0.5, 0.75]) for (const sgn of [-1, 1]) { const X = sgn * XW * (1 - t), Y = YW + (YR - YW) * t; const a = P(X, Y, ZN), b = P(X, Y, ZB); sm += `M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}`; }
    S.add(`<path d="${sm}" stroke="#7a6648" stroke-width="2.5" opacity=".55"/>`);
    let rf = '';
    for (const Z of [3.2, 5, 7]) { const a = P(-XW, YW, Z), m = P(0, YR, Z), b = P(XW, YW, Z); rf += `M${f1(a[0])},${f1(a[1])}L${f1(m[0])},${f1(m[1])}L${f1(b[0])},${f1(b[1])}`; }
    S.add(`<path d="${rf}" stroke="#5e4a32" stroke-width="7" fill="none" stroke-linejoin="round" opacity=".85"/>`); }
  // the ridge pole
  { const a = P(0, YR, ZN), b = P(0, YR, ZB); S.add(`<path d="M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}" stroke="#5a4430" stroke-width="10"/>`); }
  // floor: packed earth, a straw mat under the table, light from the door
  const fl = P.poly([[-XW, 0, ZN], [XW, 0, ZN], [XW, 0, ZB], [-XW, 0, ZB]]);
  S.add(`<path d="${pz(fl)}" fill="${S.lin([[0, '#7a6448'], [1, '#5e4a34']])}"/>`);
  S.add(`<path d="${P.quad([[1.0, 0, ZB], [3.4, 0, ZB], [4.6, 0, 3.6], [-0.4, 0, 3.6]])}" fill="#f6dca0" opacity=".22" filter="${S.blur(3)}"/>`);
  S.add(`<path d="${P.quad([[-2.3, 0, 3.0], [2.9, 0, 3.0], [2.9, 0, 5.6], [-2.3, 0, 5.6]])}" fill="#a88e5c" opacity=".6"/>`);
  S.add(`<path d="${P.quad([[-2.3, 0, 3.0], [2.9, 0, 3.0], [2.9, 0.03, 3.0], [-2.3, 0.03, 3.0]])}" fill="#7a6440"/>`);
  { let st = ''; for (let k = 0; k < 40; k++) { const X = R.range(-2.2, 2.8), Z = R.range(3.1, 5.5), a = P(X, 0, Z); st += `M${f1(a[0])},${f1(a[1])}h${f1(R.range(6, 16))}`; } S.add(`<path d="${st}" stroke="#bfa66e" stroke-width="1.5" opacity=".6"/>`); }
  // a shaft of morning light from the door, in the air
  { const a = P(1.2, 1.55, ZB), b = P(3.2, 1.55, ZB), c = P(4.4, 0, 4), d = P(-0.2, 0, 4);
    S.add(`<path d="${pz([a, b, c, d])}" fill="#fff0c8" opacity=".12" filter="${S.blur(2)}"/>`); }

  // ── the centre pole and the lantern ──
  { const top = P(0, YR, 6.4), bot = P(0, 0, 6.4);
    S.add(`<path d="M${f1(bot[0] - 8)},${f1(bot[1])}L${f1(top[0] - 6)},${f1(top[1])}H${f1(top[0] + 6)}L${f1(bot[0] + 8)},${f1(bot[1])}Z" fill="#6a4e34"/>`);
    S.add(`<path d="M${f1(bot[0] - 8)},${f1(bot[1])}L${f1(top[0] - 6)},${f1(top[1])}" stroke="#8c6c48" stroke-width="3"/>`);
    // lantern on a peg, about head height
    const lp = P(0, 2.5, 6.4), lx = lp[0] + 26, ly = lp[1];
    S.add(`<path d="M${f1(lp[0] + 6)},${f1(ly - 18)}h18v4h-18z" fill="#3a2a1c"/><path d="M${f1(lx)},${f1(ly - 14)}v10" stroke="#3a2a1c" stroke-width="2"/>`);
    S.add(`<ellipse cx="${f1(lx)}" cy="${f1(ly + 18)}" rx="110" ry="110" fill="${S.rad([[0, '#ffd890', 0.35], [1, '#ffd890', 0]])}"/>`);
    S.add(`<path d="M${f1(lx - 12)},${f1(ly - 4)}h24l-3,6h-18z" fill="#4a3624"/><path d="M${f1(lx - 10)},${f1(ly + 2)}h20v30h-20z" fill="#ffe8a8" opacity=".85"/><path d="M${f1(lx - 10)},${f1(ly + 2)}h20v30h-20zM${f1(lx)},${f1(ly + 2)}v30" fill="none" stroke="#4a3624" stroke-width="2.5"/><path d="M${f1(lx - 13)},${f1(ly + 32)}h26v5h-26z" fill="#4a3624"/>`);
    S.add(`<path d="M${f1(lx)},${f1(ly + 24)}q-4,-8 0,-14q4,6 0,14z" fill="#fff6d8"/>`); }

  // ── the crate of torn pages in the left corner ──
  { const x = 36, y = 806, w = 236, h = 118;
    S.add(`<path d="M${x},${y}h${w}v-${h}h-${w}z" fill="#8a643c"/><path d="M${x + w},${y}l40,-26v-${h}l-40,26z" fill="#6a4a2a"/><path d="M${x},${y - h}l40,-26h${w}l-40,26z" fill="#4a3220"/>`);
    S.add(`<path d="M${x},${y - h * 0.5}h${w}M${x + w * 0.5},${y}v-${h}" stroke="#5e4226" stroke-width="4"/>`);
    // loose pages spilling over the rim, some torn
    let pg = '';
    const pages = [[x + 20, y - h - 4, -14], [x + 70, y - h - 14, 8], [x + 120, y - h - 8, -4], [x + 160, y - h - 18, 16], [x + 50, y - h - 26, 22], [x + 140, y - h - 30, -20], [x + 200, y - h - 6, 4]];
    for (const [px, py, a] of pages) pg += `<g transform="rotate(${a} ${px} ${py})"><path d="M${px - 30},${py + 10}l60,-6l4,-34q-10,6 -18,-2q-8,8 -16,0q-10,6 -18,0l-12,4z" fill="#ece0c4" stroke="#b8a888" stroke-width="1.5"/><path d="M${px - 22},${py - 4}h40M${px - 22},${py - 12}h36" stroke="#c8b898" stroke-width="1.5"/></g>`;
    S.add(pg);
    // one page fallen on the floor beside the crate
    S.add(`<path d="M300,850l70,-10l10,28l-72,12z" fill="#e8dcc0" stroke="#b8a888" stroke-width="1.5"/><path d="M314,856l50,-7M318,866l46,-6" stroke="#c8b898" stroke-width="1.5"/>`); }

  // ── a bench behind the table ──
  { const a = P(-3.2, 0.45, 5.2), b = P(3.2, 0.45, 5.2);
    S.add(`<path d="M${f1(a[0])},${f1(a[1])}H${f1(b[0])}v10H${f1(a[0])}z" fill="#6e5236"/>`);
    for (const X of [-2.9, 2.9]) { const t = P(X, 0.45, 5.2), g = P(X, 0, 5.2); S.add(`<path d="M${f1(t[0] - 5)},${f1(t[1] + 10)}V${f1(g[1])}h10V${f1(t[1] + 10)}z" fill="#4e3a26"/>`); } }

  // ── the long trestle table ──
  const tY = 0.78;
  const TX0 = -1.85, TX1 = 2.45, TZ0 = 3.15, TZ1 = 4.15;
  const tTop = P.poly([[TX0, tY, TZ0], [TX1, tY, TZ0], [TX1, tY, TZ1], [TX0, tY, TZ1]]);
  for (const X of [TX0 + 0.35, TX1 - 0.35]) { // trestle legs
    const a = P(X, tY, TZ0 + 0.15), b = P(X, 0, TZ0 + 0.15), c = P(X, tY, TZ1 - 0.15), d = P(X, 0, TZ1 - 0.15);
    S.add(`<path d="M${f1(a[0] - 8)},${f1(a[1])}L${f1(d[0] - 6)},${f1(d[1])}h12L${f1(a[0] + 8)},${f1(a[1])}zM${f1(c[0] - 6)},${f1(c[1])}L${f1(b[0] - 8)},${f1(b[1])}h14L${f1(c[0] + 6)},${f1(c[1])}z" fill="#4a3422"/>`);
  }
  S.add(`<path d="${pz(tTop)}" fill="${S.lin([[0, '#9a7448'], [1, '#b88c58']])}"/>`);
  { const a = P(TX0, tY, TZ0), b = P(TX1, tY, TZ0); S.add(`<path d="M${f1(a[0])},${f1(a[1])}H${f1(b[0])}v20H${f1(a[0])}z" fill="#6a4a2c"/>`); }
  { let gr = ''; for (let k = 1; k < 4; k++) { const a = P(TX0, tY, TZ0 + k * 0.25), b = P(TX1, tY, TZ0 + k * 0.25); gr += `M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}`; } S.add(`<path d="${gr}" stroke="#8a6438" stroke-width="1.5" opacity=".7"/>`); }

  const Pt = (X, Y, Z) => P(X + 0.25, Y, Z - 0.3);
  // the thick register, open, slightly left of centre
  { const q = (X0, X1, Z0, Z1, y = tY + 0.02) => pz([Pt(X0, y, Z0), Pt(X1, y, Z0), Pt(X1, y, Z1), Pt(X0, y, Z1)]);
    S.add(`<path d="${q(-1.75, 0.35, 3.52, 4.12, tY + 0.005)}" fill="#5a3a24"/>`);
    S.add(`<path d="${q(-1.7, -0.7, 3.55, 4.1, tY + 0.06)}" fill="#f0e6cc"/><path d="${q(-0.7, 0.3, 3.55, 4.1, tY + 0.06)}" fill="#e8dcbe"/>`);
    // page block edge
    { const a = Pt(-1.7, tY + 0.06, 3.55), b = Pt(0.3, tY + 0.06, 3.55); S.add(`<path d="M${f1(a[0])},${f1(a[1])}H${f1(b[0])}v7H${f1(a[0])}z" fill="#d8caa8"/>`); }
    // the gutter
    { const a = Pt(-0.7, tY + 0.06, 3.55), b = Pt(-0.7, tY + 0.06, 4.1); S.add(`<path d="M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}" stroke="#a8946c" stroke-width="3"/>`); }
    // ruled lines, a few rows filled with wavy scribble-marks (illegible) and little ticks
    let ln = '', sc = '', tk = '';
    for (let k = 0; k < 9; k++) {
      const Z = 3.6 + k * 0.055;
      for (const [X0, X1] of [[-1.62, -0.78], [-0.62, 0.22]]) { const a = Pt(X0, tY + 0.06, Z), b = Pt(X1, tY + 0.06, Z); ln += `M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}`; }
      const fillRows = k < 9;
      if (fillRows) for (const [X0, X1, side] of [[-1.58, -0.98, 0], [-0.58, -0.08 - (k > 5 ? 0.3 : 0), 1]]) {
        if (side === 1 && k > 6) continue;
        const a = Pt(X0, tY + 0.06, Z - 0.02), b = Pt(X1, tY + 0.06, Z - 0.02);
        const n = 6; let d = `M${f1(a[0])},${f1(a[1])}`;
        for (let i = 1; i <= n; i++) d += `q${f1((b[0] - a[0]) / n / 2)},-3 ${f1((b[0] - a[0]) / n)},0`;
        sc += d;
        const tkp = Pt(side ? 0.12 : -0.88, tY + 0.06, Z - 0.02);
        tk += `M${f1(tkp[0] - 4)},${f1(tkp[1] - 2)}l3,3l6,-6`;
      }
    }
    S.add(`<path d="${ln}" stroke="#c8b894" stroke-width="1" opacity=".8"/><path d="${sc}" stroke="#4a4048" stroke-width="1.3" fill="none" opacity=".55"/><path d="${tk}" stroke="#4a4048" stroke-width="1.4" fill="none" opacity=".7"/>`);
    // a ribbon marker trailing off the front edge
    { const a = Pt(-0.5, tY + 0.06, 3.55); S.add(`<path d="M${f1(a[0])},${f1(a[1])}q4,22 -6,40l8,-2" stroke="#8a2a2a" stroke-width="4" fill="none"/>`); } }

  // inkpot and quill, right of the register
  { const ip = Pt(0.75, tY, 3.75);
    S.add(`<path d="M${f1(ip[0] - 16)},${f1(ip[1])}q0,-24 16,-26q16,2 16,26z" fill="#2a2830"/><path d="M${f1(ip[0] - 7)},${f1(ip[1] - 26)}h14v-6h-14z" fill="#3a3840"/><path d="M${f1(ip[0] - 10)},${f1(ip[1] - 14)}q4,-8 8,-8" stroke="#8a8a9a" stroke-width="2" fill="none"/>`);
    S.add(`<path d="M${f1(ip[0] + 2)},${f1(ip[1] - 30)}L${f1(ip[0] + 30)},${f1(ip[1] - 80)}" stroke="#5a4a3a" stroke-width="2"/><path d="M${f1(ip[0] + 10)},${f1(ip[1] - 50)}q6,-28 26,-46q-4,26 -22,50z" fill="#f2ece0"/><path d="M${f1(ip[0] + 14)},${f1(ip[1] - 56)}q9,-20 20,-38" stroke="#c8beac" stroke-width="1.5" fill="none"/>`); }
  // loose papers fanned beside the inkpot, ruled only
  { const lp = (X, Z, rot, c) => { const a = Pt(X, tY + 0.01, Z); return `<g transform="rotate(${rot} ${f1(a[0])} ${f1(a[1])})"><path d="M${f1(a[0] - 46)},${f1(a[1] - 14)}h92v28h-92z" fill="${c}" stroke="#b8a888" stroke-width="1"/><path d="M${f1(a[0] - 38)},${f1(a[1] - 6)}h70M${f1(a[0] - 38)},${f1(a[1] + 2)}h60" stroke="#c8b898" stroke-width="1.2"/></g>`; };
    S.add(lp(1.35, 3.62, -6, '#ece2c8') + lp(1.45, 3.7, 5, '#f2e8d0') + lp(1.4, 3.66, -1, '#e6dac0')); }
  // the smaller book, closed, with a ribbon, at the right end of the table
  { const a = Pt(1.75, tY, 3.62), b = Pt(2.4, tY, 3.62), c = Pt(2.4, tY, 4.0), d = Pt(1.75, tY, 4.0);
    S.add(`<path d="${pz([a, b, c, d])}" fill="#3e4a6a"/><path d="M${f1(a[0])},${f1(a[1])}H${f1(b[0])}v12H${f1(a[0])}z" fill="#2a3450"/><path d="M${f1(a[0] + 4)},${f1(a[1] + 3)}H${f1(b[0] - 4)}" stroke="#e8e0cc" stroke-width="3"/>`);
    const m1 = Pt(2.07, tY, 3.62), m2 = Pt(2.07, tY, 4.0);
    S.add(`<path d="M${f1(m2[0])},${f1(m2[1])}L${f1(m1[0])},${f1(m1[1])}v26l-6,8" stroke="#d8b860" stroke-width="3" fill="none"/>`); }
  // a tin cup at the left end
  { const cp = Pt(-1.95, tY, 3.95); S.add(`<path d="M${f1(cp[0] - 13)},${f1(cp[1])}v-26h26v26z" fill="#8a8e94"/><path d="M${f1(cp[0] + 13)},${f1(cp[1] - 20)}q12,2 0,14" stroke="#6a6e74" stroke-width="3" fill="none"/><path d="${ell(cp[0], cp[1] - 26, 13, 4)}" fill="#5a5e64"/>`); }

  S.add(`<rect width="${W}" height="420" fill="${S.lin([[0, '#2a1e12', 0.45], [1, '#2a1e12', 0]])}"/>`);
  // warm wash from the lantern and the door over the table; dim corners
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#ffe2a0', 0.12], [1, '#ffe2a0', 0]], 'cx="0.6" cy="0.55" r="0.5"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.65, '#000', 0.12], [1, '#000', 0.5]], 'cx="0.55" cy="0.5" r="0.8"')}"/>`);
  return S.out();
}

export const sqHBgs = {
  'north-slope-registry-tent': () => registryTent(),
};
