// 外传《银轨号》正篇第13、14、15章的场景背景：memory-space（记忆空间·共鸣）、nox-observatory-dawn（诺克斯观测所·黎明）、silver-rail-window-dusk（银轨号·车窗旁·黄昏）。
//   memory-space            — 黎明种内部的记忆层：明亮的白紫色虚空，没有上下；赤、青蓝、紫、无色四道光带从画面四角盘旋着汇向中心，
//                             中心是一团黎明色的光；四周浮着记忆光点和一片片像旧胶片的记忆碎片（碎片里只有光，没有画面和字）。
//   nox-observatory-dawn    — 诺克斯观测所·黎明：站在观测所最高处，穹壳向两边滑开；东边山脊上太阳刚露出来，晨光斜照进雾里的山谷，
//                             河弯发亮；近处是观测台的铜栏杆和一架望远镜的剪影，空中飘着黎明种发芽时散出的金色光尘。
//   silver-rail-window-dusk — 银轨号·车窗旁·黄昏：餐车一样的木墙、铜框拱窗和红丝绒窗帘；窗外金红色的夕阳压在原野上，草浪一层层往远处滚，
//                             地平线上浮着一座有穹顶和高塔的城市剪影；窗边一张铺白布的小桌，茶杯、小花瓶和一本合上的书；墙上的铜壁灯亮着。
// 不画人物，不画能读出的字。三张各用一个文件前缀：sbGdMem / sbGdDawn / sbGdDusk。
import { Scene, W, H, f, pz, pl, rng, mix, ridge, rays, band, stars, bird } from './lib.mjs';

const r0 = (v) => f(v, 0);
const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;
const circ = (cx, cy, r) => ell(cx, cy, r, r);
// four-pointed sparkle centred at (x, y)
const spark = (x, y, r, k = 0.22) => pz([[x, y - r], [x + r * k, y - r * k], [x + r, y], [x + r * k, y + r * k], [x, y + r], [x - r * k, y + r * k], [x - r, y], [x - r * k, y - r * k]]);
// a tapered ribbon along a polyline: width w(t) for t in [0, 1]
function ribbon(pts, w) {
  const L = [], Rr = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len, ww = w(i / (pts.length - 1)) / 2;
    L.push([pts[i][0] + nx * ww, pts[i][1] + ny * ww]);
    Rr.unshift([pts[i][0] - nx * ww, pts[i][1] - ny * ww]);
  }
  return pz([...L, ...Rr]);
}

// ---------------------------------------------------------------------------------------------
// 记忆空间·共鸣
// ---------------------------------------------------------------------------------------------
function memorySpace() {
  const S = new Scene('sbGdMem', '记忆空间·共鸣：明亮的白紫色虚空，没有上下；赤、青蓝、紫、无色四道光带从四角盘旋着汇向中心那团黎明色的光，四周浮着记忆光点和一片片只有光的记忆碎片；不画人', 130013);
  const R = rng(130014);
  const CX = 800, CY = 440;

  // ---- the void: bright at the heart, deepening to violet at the edges ----------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#fffdfb'], [0.16, '#fbf3ff'], [0.42, '#eadcfb'], [0.72, '#bfa6e6'], [1, '#6e58a6']], `gradientUnits="userSpaceOnUse" cx="${CX}" cy="${CY}" r="1000"`)}"/>`);
  // soft drifting haze (big blurred clouds of lavender and blush)
  {
    let haze = '';
    for (const [x, y, rx, ry, c, op] of [[260, 200, 360, 150, '#f6e6ff', 0.75], [1330, 230, 380, 160, '#ffe9f2', 0.6], [300, 720, 420, 170, '#e6dcff', 0.7], [1310, 700, 400, 150, '#f0e4ff', 0.65], [800, 120, 520, 90, '#ffffff', 0.55], [820, 800, 560, 90, '#f7efff', 0.5]]) {
      haze += `<path d="${ell(x, y, rx, ry)}" fill="${c}" opacity="${op}"/>`;
    }
    S.add(`<g filter="${S.blur(4)}">${haze}</g>`);
  }
  // faint ripple rings around the heart
  {
    let rings = '';
    for (let k = 1; k <= 7; k++) rings += ell(CX, CY, 70 * k * 1.5, 70 * k * 0.86);
    S.add(`<path d="${rings}" fill="none" stroke="#ffffff" stroke-width="1.4" opacity=".26"/>`);
    let rings2 = '';
    for (let k = 1; k <= 7; k++) rings2 += ell(CX, CY, (70 * k + 35) * 1.5, (70 * k + 35) * 0.86);
    S.add(`<path d="${rings2}" fill="none" stroke="#b49ae0" stroke-width="1" opacity=".14"/>`);
  }

  // ---- distant memory shards: small film-like panes floating far back -----------------------------------------------
  const shard = (x, y, w, h, a, tint, op) => {
    const ca = Math.cos(a * Math.PI / 180), sa = Math.sin(a * Math.PI / 180);
    const P = (u, v) => [x + u * ca - v * sa, y + u * sa + v * ca];
    const outer = pz([P(-w / 2, -h / 2), P(w / 2, -h / 2), P(w / 2, h / 2), P(-w / 2, h / 2)]);
    const inner = pz([P(-w * 0.4, -h * 0.34), P(w * 0.4, -h * 0.34), P(w * 0.4, h * 0.34), P(-w * 0.4, h * 0.34)]);
    const glint = pl([P(-w * 0.34, -h * 0.22), P(-w * 0.05, -h * 0.22)]);
    return `<g opacity="${f(op, 2)}"><path d="${outer}" fill="${tint}"/><path d="${inner}" fill="#ffffff" opacity=".55"/><path d="${glint}" stroke="#ffffff" stroke-width="${f1(Math.max(1, h * 0.05))}" stroke-linecap="round"/></g>`;
  };
  {
    let far = '';
    const tints = ['#f4d6e4', '#d6ecf8', '#e4d8fa', '#fbeccb'];
    for (let i = 0; i < 26; i++) {
      const a = R() * Math.PI * 2, d = R.range(260, 760);
      const x = CX + Math.cos(a) * d * 1.45, y = CY + Math.sin(a) * d * 0.8;
      if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
      const s = R.range(18, 40);
      far += shard(x, y, s * 1.4, s, R.range(-30, 30), tints[i % 4], R.range(0.35, 0.6));
    }
    S.add(`<g filter="${S.blur(1)}">${far}</g>`);
  }

  // ---- the four light bands, spiralling in from the corners ----------------------------------------------------------
  const BANDS = [
    { c: '#ff6b7c', core: '#ffd6dc', a0: 205 }, // 赤（莉亚）——左上
    { c: '#5ed7ff', core: '#dcf7ff', a0: 325 }, // 青蓝（米娅）——右上
    { c: '#b58cff', core: '#efe4ff', a0: 145 }, // 紫（塞雷娜）——左下
    { c: '#f4e6c8', core: '#ffffff', a0: 25 }, // 无色（他）——右下
  ];
  const spiral = (a0) => {
    const pts = [];
    for (let i = 0; i <= 48; i++) {
      const t = i / 48;
      const r = 1060 * Math.pow(1 - t, 1.25);
      const a = (a0 + 170 * t) * Math.PI / 180;
      pts.push([CX + Math.cos(a) * r * 1.32, CY + Math.sin(a) * r * 0.78]);
    }
    return pts;
  };
  const glow = [], body = [], core = [];
  for (const b of BANDS) {
    const pts = spiral(b.a0);
    glow.push(`<path d="${ribbon(pts, (t) => 230 * Math.pow(1 - t, 0.8) + 14)}" fill="${b.c}" opacity=".38"/>`);
    body.push(`<path d="${ribbon(pts, (t) => 100 * Math.pow(1 - t, 0.85) + 5)}" fill="${b.c}" opacity=".7"/>`);
    core.push(`<path d="${ribbon(pts, (t) => 24 * Math.pow(1 - t, 0.7) + 2)}" fill="${b.core}"/>`);
  }
  S.add(`<g filter="${S.blur(3)}">${glow.join('')}</g>`);
  S.add(`<g filter="${S.blur(1)}">${body.join('')}</g>`);
  S.add(core.join(''));

  // ---- the heart: a dawn-coloured light where the four bands meet ----------------------------------------------------
  S.add(`<path d="${circ(CX, CY, 260)}" fill="${S.rad([[0, '#ffffff'], [0.18, '#fff6e2', 0.95], [0.4, '#ffd6c0', 0.6], [0.7, '#f0b8e0', 0.22], [1, '#e8b0ff', 0]])}"/>`);
  S.add(`<path d="${ell(CX, CY, 150, 86)}" fill="none" stroke="#ffd9a8" stroke-width="3" opacity=".8" filter="${S.blur(1)}"/>`);
  S.add(`<path d="${ell(CX, CY, 92, 54)}" fill="none" stroke="#ffffff" stroke-width="2" opacity=".9"/>`);
  S.add(`<path d="${spark(CX, CY, 120, 0.12)}" fill="#ffffff" opacity=".9"/><path d="${spark(CX, CY, 60, 0.2)}" fill="#fffaf0"/>`);
  S.add(`<path d="${circ(CX, CY, 26)}" fill="#ffffff"/>`);

  // ---- near memory shards drifting toward the heart ------------------------------------------------------------------
  {
    let near = '';
    const tints = ['#ffc6d0', '#bfeeff', '#dcc8ff', '#fff0d0'];
    for (const [x, y, s, a, k] of [[210, 150, 66, -14, 0], [1410, 130, 58, 12, 1], [150, 610, 74, 10, 2], [1450, 640, 70, -10, 3], [520, 90, 40, 8, 1], [1080, 790, 46, -6, 0], [470, 780, 38, 16, 3], [1170, 96, 36, -18, 2], [620, 300, 30, 20, 0], [1010, 590, 32, -16, 1]]) {
      near += shard(x, y, s * 1.42, s, a, tints[k], 0.82);
    }
    S.add(near);
  }

  // ---- memory motes and sparkles -------------------------------------------------------------------------------------
  {
    const mote = S.rad([[0, '#ffffff'], [0.35, '#fff6ff', 0.9], [1, '#e8d8ff', 0]]);
    let big = '', small = '', sp = '';
    for (let i = 0; i < 60; i++) {
      const a = R() * Math.PI * 2, d = Math.pow(R(), 0.7) * 820;
      const x = CX + Math.cos(a) * d * 1.4, y = CY + Math.sin(a) * d * 0.8;
      if (x < 0 || x > W || y < 0 || y > H) continue;
      const r = R.range(6, 18);
      big += `<path d="${circ(x, y, r)}"/>`;
    }
    for (let i = 0; i < 140; i++) {
      const x = R.range(0, W), y = R.range(0, H);
      small += `<circle cx="${r0(x)}" cy="${r0(y)}" r="${f1(R.range(0.8, 2.6))}" opacity="${f(R.range(0.4, 1), 2)}"/>`;
    }
    for (let i = 0; i < 22; i++) {
      const x = R.range(40, W - 40), y = R.range(30, H - 30);
      sp += spark(x, y, R.range(5, 13));
    }
    S.add(`<g fill="${mote}">${big}</g>`);
    S.add(`<g fill="#ffffff">${small}</g>`);
    S.add(`<path d="${sp}" fill="#ffffff" opacity=".9"/>`);
  }
  // corner vignette so the edges sit with the darker story frames
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.55, '#2a1c4a', 0], [1, '#2a1c4a', 0.42]], `gradientUnits="userSpaceOnUse" cx="${CX}" cy="${CY}" r="980"`)}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 诺克斯观测所·黎明
// ---------------------------------------------------------------------------------------------
function observatoryDawn() {
  const S = new Scene('sbGdDawn', '诺克斯观测所·黎明：从观测所最高处往外看，金属穹壳向两边滑开，东边山脊上太阳刚刚露出来，晨光斜照进雾里的山谷，河弯发亮；近处是观测台的铜栏杆和一架望远镜的剪影，空中飘着金色的光尘；不画人', 140014);
  const R = rng(140015);
  const SUN = [1010, 468];

  // ---- sky ------------------------------------------------------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#1c1e46'], [0.22, '#3a3466'], [0.4, '#7a5a86'], [0.52, '#c97f86'], [0.6, '#f2a882'], [0.68, '#ffd29a'], [1, '#ffe2b0']])}"/>`);
  S.add(`<path d="${circ(SUN[0], SUN[1], 520)}" fill="${S.rad([[0, '#fff6dc'], [0.08, '#ffe6b0', 0.95], [0.25, '#ffc888', 0.5], [0.55, '#f09a80', 0.18], [1, '#c87890', 0]])}"/>`);
  S.add(stars(R, 70, [0, 0, W, 230], { fill: '#e8e0ff', op: [0.2, 0.7], maxR: 1.3 }));
  // thin dawn clouds
  {
    let cl = '';
    for (const [x0, x1, y, th, c] of [[80, 760, 300, 16, '#d88ea0'], [880, 1560, 270, 14, '#e8a49a'], [300, 980, 360, 10, '#f5b890'], [1100, 1600, 352, 12, '#f8c49a']]) cl += `<path d="${band(x0, x1, y, th, R, 6)}" fill="${c}"/>`;
    S.add(`<g filter="${S.blur(2)}" opacity=".8">${cl}</g>`);
  }
  S.add(rays(SUN[0], SUN[1], [[-150, 5, 900], [-128, 4, 900], [-106, 6, 900], [-84, 4, 900], [-62, 5, 900], [-40, 4, 900], [-20, 3, 700]], '#fff1cc', 0.09));
  // the sun itself, just clearing the ridge
  S.add(`<path d="${circ(SUN[0], SUN[1] + 18, 46)}" fill="#fff8e6"/>`);

  // ---- mountains and the valley ---------------------------------------------------------------------------------------
  const far = ridge(S, { base: 488, amp: 34, period: 300, seed: 1401, fill: '#9a7ea6', rim: '#ffd6a8', rimOp: 0.35, peaks: [[1300, 40, 220], [260, 30, 260]] });
  S.add(far.svg);
  S.add(`<rect y="470" width="${W}" height="60" fill="${S.lin([[0, '#ffd8a8', 0], [0.5, '#ffd8a8', 0.45], [1, '#ffd8a8', 0]])}"/>`);
  const mid = ridge(S, { base: 548, amp: 40, period: 240, seed: 1402, fill: '#6a5480', shade: '#4a3a62', shadeOp: 0.5, rim: '#ffc890', rimOp: 0.55, peaks: [[240, 70, 260], [1460, 60, 240]] });
  S.add(mid.svg);
  // valley floor with the river bend
  S.add(`<path d="M0,600Q400,560 800,575T1600,592V900H0Z" fill="${S.lin([[0, '#5a4870'], [1, '#2e2640']])}"/>`);
  {
    // the river: a gold ribbon winding out of the far valley, widening as it comes toward the observatory
    const C = [[952, 574], [900, 581], [870, 588], [910, 596], [1010, 604], [1060, 614], [990, 624], [860, 634], [800, 648]];
    const pts = [];
    for (let i = 0; i < C.length - 1; i++) for (let k = 0; k < 6; k++) {
      const t = k / 6, a = C[Math.max(0, i - 1)], b = C[i], c = C[i + 1], d = C[Math.min(C.length - 1, i + 2)];
      const cr = (p0, p1, p2, p3) => 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
      pts.push([cr(a[0], b[0], c[0], d[0]), cr(a[1], b[1], c[1], d[1])]);
    }
    pts.push(C[C.length - 1]);
    S.add(`<path d="${ribbon(pts, (t) => 2 + 30 * t * t)}" fill="${S.lin([[0, '#fff4d4'], [0.5, '#ffd498'], [1, '#e8a888']])}" opacity=".9"/>`);
  }
  // mist lying in the valley, lit gold on the sun side
  {
    let mist = '';
    for (const [x0, x1, y, th, c] of [[0, 900, 600, 30, '#e8c4c0'], [600, 1600, 590, 34, '#ffdcb8'], [100, 1300, 650, 26, '#d8b8c4'], [900, 1600, 660, 24, '#f2cdb4']]) mist += `<path d="${band(x0, x1, y, th, R, 10)}" fill="${c}"/>`;
    S.add(`<g filter="${S.blur(3)}" opacity=".75">${mist}</g>`);
  }
  // near hills either side of the valley, dark and rim-lit
  // (one layer across the whole width: high at both sides, dropping below the railing in the middle)
  const near = ridge(S, { base: 690, amp: 14, period: 200, seed: 1403, fill: '#382c4e', rim: '#ffc890', rimOp: 0.5, peaks: [[200, 130, 520], [1430, 120, 470]] });
  S.add(near.svg);

  // ---- the opened dome: two shell petals slid aside, a crown ring across the top --------------------------------------
  const SHELL = '#1c1830', SHELL2 = '#26203c', RIB = '#3a3256', RIM = '#ffc888';
  for (const side of [-1, 1]) {
    const xo = side < 0 ? 0 : W;
    // shell edge: a dome meridian seen from inside — leans in toward the zenith, opens out toward the floor
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20, y = -20 + 762 * t, k = 250 * Math.pow(1 - t, 1.8);
      pts.push([side < 0 ? 190 + k : 1410 - k, y]);
    }
    const shell = pz([[xo, -20], ...pts, [xo, 742]]);
    S.add(`<path d="${shell}" fill="${side < 0 ? SHELL : SHELL2}"/>`);
    // ribs and rivet lines on the shell
    let ribs = '';
    for (let k = 1; k <= 4; k++) {
      const t = k / 5;
      const r = pts.map(([x, y]) => [x + (xo - x) * t, y]);
      ribs += pl(r);
    }
    for (let y = 60; y < 700; y += 90) {
      const i = Math.round((y + 20) / 762 * 20), [x] = pts[Math.min(20, i)];
      ribs += `M${r0(x)},${r0(y)}L${r0(xo)},${r0(y + side * 6)}`;
    }
    S.add(`<path d="${ribs}" fill="none" stroke="${RIB}" stroke-width="3"/>`);
    // lit leading edge (the side facing the sunrise burns warm)
    S.add(`<path d="${pl(pts)}" fill="none" stroke="${RIM}" stroke-width="${side > 0 ? 5 : 3}" opacity="${side > 0 ? 0.9 : 0.55}" stroke-linecap="round"/>`);
  }
  // the crown ring of the dome track, broken where the shells parted
  S.add(`<path d="M-20,90Q800,-70 1620,90" fill="none" stroke="${SHELL}" stroke-width="34"/>`);
  S.add(`<path d="M-20,108Q800,-52 1620,108" fill="none" stroke="${RIM}" stroke-width="2.5" opacity=".55"/>`);
  {
    let bolts = '';
    for (let i = 1; i < 16; i++) {
      const t = i / 16, x = -20 + 1640 * t, y = (1 - t) * (1 - t) * 90 + 2 * (1 - t) * t * -70 + t * t * 90;
      bolts += circ(x, y + 4, 4);
    }
    S.add(`<path d="${bolts}" fill="#4a4066"/>`);
  }

  // ---- the observation deck: floor, brass railing, a telescope ---------------------------------------------------------
  S.add(`<path d="M0,742L1600,742V900H0Z" fill="${S.lin([[0, '#2a2236'], [1, '#120e1a']])}"/>`);
  S.add(`<path d="M0,742H1600" stroke="#f2b882" stroke-width="2" opacity=".6"/>`);
  // light from the sunrise across the floor
  S.add(`<path d="M780,742L1240,742L1600,900L520,900Z" fill="#ffc890" opacity=".12"/>`);
  {
    // railing: top rail, posts and balusters
    let post = '', bal = '';
    for (let x = 40; x < W; x += 180) post += `M${x},742V636`;
    for (let x = 16; x < W; x += 30) bal += `M${x},742V650`;
    S.add(`<path d="${bal}" stroke="#3a2c2a" stroke-width="5"/>`);
    S.add(`<path d="${post}" stroke="#4a3830" stroke-width="12"/>`);
    S.add(`<path d="M0,640H1600" stroke="#5a4032" stroke-width="12"/><path d="M0,634H1600" stroke="#e8a868" stroke-width="3" opacity=".8"/>`);
    let glint = '';
    for (let x = 40; x < W; x += 180) glint += `M${x - 4},640V742`;
    S.add(`<path d="${glint}" stroke="#ffcc90" stroke-width="2" opacity=".45"/>`);
  }
  {
    // telescope on a tripod mount, left of centre, pointing at the sky
    const bx = 330, by = 742;
    S.add(`<path d="M${bx - 70},${by}L${bx},${by - 150}L${bx + 70},${by}M${bx},${by - 150}V${by}" fill="none" stroke="#2a2030" stroke-width="10" stroke-linecap="round"/>`);
    S.add(`<path d="${circ(bx, by - 156, 16)}" fill="#3a2e3c"/>`);
    const a = -38 * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    const P0 = [bx - ux * 120, by - 156 - uy * 120], P1 = [bx + ux * 210, by - 156 + uy * 210];
    const tube = (w0, w1) => pz([[P0[0] + nx * w0, P0[1] + ny * w0], [P1[0] + nx * w1, P1[1] + ny * w1], [P1[0] - nx * w1, P1[1] - ny * w1], [P0[0] - nx * w0, P0[1] - ny * w0]]);
    S.add(`<path d="${tube(14, 26)}" fill="#3a2c34"/>`);
    S.add(`<path d="M${r0(P0[0] + nx * 13)},${r0(P0[1] + ny * 13)}L${r0(P1[0] + nx * 25)},${r0(P1[1] + ny * 25)}" stroke="#ffc888" stroke-width="3" opacity=".8"/>`);
    // brass bands on the tube
    let bands = '';
    for (const t of [0.15, 0.55, 0.92]) {
      const cx = P0[0] + (P1[0] - P0[0]) * t, cy = P0[1] + (P1[1] - P0[1]) * t, w = 15 + 11 * t;
      bands += `M${r0(cx + nx * w)},${r0(cy + ny * w)}L${r0(cx - nx * w)},${r0(cy - ny * w)}`;
    }
    S.add(`<path d="${bands}" stroke="#b08048" stroke-width="7"/>`);
  }

  // ---- golden dust from the sprouting seed, drifting up through the light ----------------------------------------------
  {
    const dust = S.rad([[0, '#fff4c8'], [0.4, '#ffd88a', 0.8], [1, '#ffc060', 0]]);
    let d = '', sp = '';
    for (let i = 0; i < 46; i++) {
      const x = R.range(380, 1360), y = R.range(120, 720);
      d += circ(x, y, R.range(3, 9));
    }
    for (let i = 0; i < 14; i++) sp += spark(R.range(420, 1300), R.range(160, 640), R.range(5, 10));
    S.add(`<path d="${d}" fill="${dust}"/>`);
    S.add(`<path d="${sp}" fill="#fff6d8" opacity=".85"/>`);
  }
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 银轨号·车窗旁·黄昏
// ---------------------------------------------------------------------------------------------
function windowDusk() {
  const S = new Scene('sbGdDusk', '银轨号·车窗旁·黄昏：餐车一样的木墙、铜框拱窗和红丝绒窗帘；窗外金红色的夕阳压在原野上，草浪一层层往远处滚，地平线上浮着一座有穹顶和高塔的城市剪影；窗边一张铺白布的小桌，茶杯、小花瓶和一本合上的书；墙上的铜壁灯亮着；不画人', 150015);
  const R = rng(150016);
  const WIN = { x0: 330, x1: 1110, top: 150, spring: 290, bot: 610 }; // the main arched window
  const WIN2 = { x0: 1330, x1: 1900, top: 150, spring: 290, bot: 610 }; // a second window cut by the right edge
  const SUN = [860, 500];

  const archPath = (o, inset = 0) => {
    const x0 = o.x0 + inset, x1 = o.x1 - inset, cx = (x0 + x1) / 2, rx = (x1 - x0) / 2, ry = o.spring - o.top - inset;
    return `M${r0(x0)},${r0(o.bot - inset)}V${r0(o.spring)}A${f1(rx)},${f1(ry)} 0 0 1 ${r0(x1)},${r0(o.spring)}V${r0(o.bot - inset)}Z`;
  };

  // ---- the view outside (drawn once, clipped to both windows) ---------------------------------------------------------
  const view = [];
  view.push(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#5a3466'], [0.18, '#9a4a6a'], [0.32, '#e0706a'], [0.44, '#ff9a5e'], [0.53, '#ffc070'], [0.58, '#ffe0a0'], [1, '#ffd890']])}"/>`);
  view.push(`<path d="${circ(SUN[0], SUN[1], 420)}" fill="${S.rad([[0, '#fff4d0'], [0.1, '#ffe0a0', 0.9], [0.3, '#ffb070', 0.45], [0.7, '#f07a60', 0.12], [1, '#e06060', 0]])}"/>`);
  {
    let cl = '';
    for (const [x0, x1, y, th, c] of [[300, 820, 250, 14, '#c8566a'], [760, 1300, 222, 12, '#d8686a'], [380, 1000, 330, 10, '#f08a66'], [1340, 1880, 260, 14, '#c8566a'], [1400, 1900, 350, 10, '#f09068']]) cl += `<path d="${band(x0, x1, y, th, R, 5)}" fill="${c}"/>`;
    view.push(`<g filter="${S.blur(2)}" opacity=".85">${cl}</g>`);
  }
  view.push(`<path d="${circ(SUN[0], SUN[1] + 4, 40)}" fill="#fffbea"/>`);
  // the distant city on the horizon: a dome, a tall tower, spires — silhouettes only
  {
    const hy = 530;
    let city = `M384,${hy + 30}L384,${hy}`;
    const sky = [[384, 10], [400, 18], [418, 18], [418, 30], [440, 30], [440, 22], [462, 22], [462, 40], [470, 52], [478, 40], [478, 26], [500, 26], [500, 34], [522, 34], [522, 16], [540, 16]];
    for (const [x, h] of sky) city += `L${x},${hy - h}`;
    city += `L548,${hy - 16}L548,${hy - 46}A26,26 0 0 1 600,${hy - 46}L600,${hy - 16}L612,${hy - 16}L612,${hy - 70}L620,${hy - 96}L628,${hy - 70}L628,${hy - 20}L650,${hy - 20}L650,${hy - 30}L672,${hy - 30}L672,${hy - 14}L700,${hy - 14}L700,${hy + 30}Z`;
    view.push(`<path d="${city}" fill="#7a4a6a" opacity=".75"/>`);
    let lights = '';
    for (const [x, y] of [[452, hy - 14], [508, hy - 20], [566, hy - 24], [584, hy - 30], [618, hy - 50], [660, hy - 18]]) lights += circ(x, y, 1.6);
    view.push(`<path d="${lights}" fill="#ffe0a0"/>`);
  }
  // rolling prairie: layered swells of grass, lit gold on the sun side
  const swell = (base, amp, seed, fill, rim) => ridge(S, { x0: 300, x1: 1910, base, amp, period: 260, seed, fill, rim, rimOp: 0.75, rimW: 2.5 }).svg;
  view.push(swell(530, 10, 1501, '#b8705a', '#ffd088'));
  view.push(swell(548, 12, 1502, '#9a5a4a', '#ffc078'));
  view.push(swell(572, 14, 1503, '#7a4638', '#f8b068'));
  view.push(`<rect x="300" y="590" width="1610" height="40" fill="#5e3428"/>`);
  // grass stroke texture in the foreground swell
  {
    let blades = '';
    for (let i = 0; i < 160; i++) {
      const x = R.range(300, 1910), y = R.range(574, 612), h = R.range(6, 14), lean = R.range(2, 6);
      blades += `M${r0(x)},${r0(y)}q${f1(lean * 0.3)},${f1(-h * 0.6)} ${f1(lean)},${f1(-h)}`;
    }
    view.push(`<path d="${blades}" fill="none" stroke="#e8a060" stroke-width="1.4" opacity=".55"/>`);
  }
  let birds = '';
  for (const [x, y, s, fl] of [[1000, 300, 0.8, 0.2], [1030, 290, 0.6, 0.7], [1052, 308, 0.55, 0.4]]) birds += bird(x, y, s, fl);
  view.push(`<path d="${birds}" fill="#6a3a4a" opacity=".7"/>`);
  const clip1 = S.clip(archPath(WIN, 10)), clip2 = S.clip(archPath(WIN2, 10));
  const viewSvg = view.join('');
  // the wall first (the window holes are cut out of it), then the view inside the holes
  const WOOD = { lit: '#7a3e2c', mid: '#5e2e22', dark: '#3e1e18', deep: '#2a1410' }, BRASS = '#d0a050', BRASS2 = '#8a6a34';
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#3a1c16'], [0.5, WOOD.mid], [1, WOOD.dark]])}"/>`);
  S.add(`<g clip-path="${clip1}">${viewSvg}</g>`);
  S.add(`<g clip-path="${clip2}">${viewSvg}</g>`);

  // ---- ceiling, cornice and wall paneling -------------------------------------------------------------------------------
  S.add(`<path d="M0,0H1600V96H0Z" fill="${S.lin([[0, '#1e0e0c'], [1, '#3a1c16']])}"/>`);
  S.add(`<path d="M0,96H1600" stroke="${BRASS}" stroke-width="4" opacity=".7"/><path d="M0,108H1600" stroke="${BRASS2}" stroke-width="2" opacity=".6"/>`);
  // warm light falling on the wall around the windows
  S.add(`<path d="${circ(720, 380, 560)}" fill="${S.rad([[0, '#ff9a5a', 0.32], [0.6, '#ff8a50', 0.1], [1, '#ff8a50', 0]])}"/>`);
  // window frames: brass outer frame, mullions and transom
  for (const o of [WIN, WIN2]) {
    S.add(`<path d="${archPath(o, 0)}${archPath(o, 10)}" fill-rule="evenodd" fill="${BRASS2}"/>`);
    S.add(`<path d="${archPath(o, 2)}" fill="none" stroke="${BRASS}" stroke-width="3"/>`);
    const cx = (o.x0 + o.x1) / 2;
    S.add(`<path d="M${cx},${o.top + 6}V${o.bot}M${o.x0 + 8},${o.spring + 30}H${o.x1 - 8}" stroke="${BRASS2}" stroke-width="7"/>`);
    S.add(`<path d="M${cx - 2},${o.top + 8}V${o.bot}M${o.x0 + 8},${o.spring + 27}H${o.x1 - 8}" stroke="#f0c070" stroke-width="1.6" opacity=".7"/>`);
    // glass glints
    S.add(`<path d="M${o.x0 + 60},${o.bot - 40}L${o.x0 + 150},${o.spring + 60}M${o.x0 + 90},${o.bot - 30}L${o.x0 + 165},${o.spring + 110}M${cx + 70},${o.bot - 50}L${cx + 150},${o.spring + 70}" stroke="#fff6e0" stroke-width="3" opacity=".22"/>`);
    // sill
    S.add(`<path d="M${o.x0 - 24},${o.bot}H${o.x1 + 24}V${o.bot + 18}H${o.x0 - 24}Z" fill="${WOOD.lit}"/><path d="M${o.x0 - 24},${o.bot}H${o.x1 + 24}" stroke="#ffb878" stroke-width="2.5" opacity=".8"/>`);
  }
  // curtains: red velvet gathered with brass tie-backs, either side of each window
  const curtain = (x, dir, top, bot, tieY) => {
    const w = 120;
    const pts = [[x, top], [x + dir * w, top], [x + dir * w * 0.95, tieY - 40], [x + dir * w * 0.42, tieY], [x + dir * w * 0.9, tieY + 60], [x + dir * w * 1.2, bot], [x, bot]];
    const body = pz(pts);
    let folds = '';
    for (const k of [0.25, 0.5, 0.75]) folds += `M${r0(x + dir * w * k)},${top}Q${r0(x + dir * w * (k * 0.7))},${tieY} ${r0(x + dir * w * (k * 0.5 + 0.2))},${tieY}T${r0(x + dir * w * (k * 1.1))},${bot}`;
    return `<path d="${body}" fill="#8a2230"/><path d="${folds}" fill="none" stroke="#5a1220" stroke-width="5" opacity=".8"/><path d="M${r0(x + dir * w * 0.95)},${top}L${r0(x + dir * w * 0.95)},${tieY - 40}" stroke="#d04a50" stroke-width="3" opacity=".7"/><path d="${circ(x + dir * w * 0.42, tieY, 9)}" fill="${BRASS}"/>`;
  };
  S.add(curtain(250, 1, 120, 640, 400));
  S.add(curtain(1190, -1, 120, 640, 400));
  S.add(curtain(1250, 1, 120, 640, 400));
  // curtain rail
  S.add(`<path d="M220,124H1600" stroke="${BRASS}" stroke-width="6"/><path d="M220,121H1600" stroke="#ffe0a0" stroke-width="1.5" opacity=".7"/>`);
  // wainscot below the windows
  S.add(`<path d="M0,628H1600V900H0Z" fill="${S.lin([[0, WOOD.mid], [1, WOOD.deep]])}"/>`);
  S.add(`<path d="M0,628H1600" stroke="${BRASS}" stroke-width="5"/>`);
  {
    let panels = '';
    for (let x = 30; x < W; x += 200) panels += `M${x},660h170v150h-170z`;
    S.add(`<path d="${panels}" fill="none" stroke="#2a120e" stroke-width="4"/>`);
    let hi = '';
    for (let x = 30; x < W; x += 200) hi += `M${x + 2},662h166`;
    S.add(`<path d="${hi}" stroke="#a05a3a" stroke-width="2" opacity=".5"/>`);
  }
  // the wall sconce between the windows, lit
  {
    const lx = 1220, ly = 300;
    S.add(`<path d="${circ(lx, ly - 10, 150)}" fill="${S.rad([[0, '#ffd890', 0.55], [0.4, '#ffb060', 0.18], [1, '#ffb060', 0]])}"/>`);
    S.add(`<path d="M${lx - 10},${ly + 40}h20v18h-20zM${lx},${ly + 40}V${ly + 8}" stroke="${BRASS}" stroke-width="5" fill="${BRASS2}"/>`);
    S.add(`<path d="M${lx - 22},${ly + 6}L${lx - 14},${ly - 34}H${lx + 14}L${lx + 22},${ly + 6}Z" fill="#ffe8b0"/><path d="M${lx - 22},${ly + 6}H${lx + 22}" stroke="${BRASS}" stroke-width="4"/>`);
  }

  // ---- the little table by the window ----------------------------------------------------------------------------------
  {
    const tl = [470, 660], tr = [990, 660], br = [1060, 716], bl = [400, 716];
    // tablecloth: top, front drop, a soft scalloped hem
    S.add(`<path d="${pz([tl, tr, br, bl])}" fill="#f4e6d4"/>`);
    let hem = `M${bl[0]},${bl[1]}L${br[0]},${br[1]}L${br[0] + 6},820`;
    for (let x = br[0] + 6; x > bl[0] - 6; x -= 44) hem += `Q${r0(x - 22)},838 ${r0(x - 44)},820`;
    hem += 'Z';
    S.add(`<path d="${hem}" fill="${S.lin([[0, '#e8d4bc'], [1, '#b89a80']])}"/>`);
    S.add(`<path d="M${bl[0]},${bl[1]}L${br[0]},${br[1]}" stroke="#fff6ea" stroke-width="3"/>`);
    // the sunset lying across the tablecloth
    S.add(`<path d="M600,660L860,660L980,716L560,716Z" fill="#ffb070" opacity=".45"/>`);
    let folds = '';
    for (const x of [520, 640, 760, 880, 1000]) folds += `M${x},722Q${x - 6},770 ${x - 2},826`;
    S.add(`<path d="${folds}" fill="none" stroke="#a08068" stroke-width="3" opacity=".5"/>`);
    // a closed book
    S.add(`<path d="M520,684L640,676L660,694L536,704Z" fill="#5a3a5a"/><path d="M536,704L660,694L660,700L536,710Z" fill="#efe0c8"/><path d="M520,684L536,704" stroke="#d0a050" stroke-width="2"/>`);
    // teacup and saucer
    const cx = 820, cy = 690;
    S.add(`<path d="${ell(cx, cy + 10, 46, 11)}" fill="#e8ecf2"/><path d="${ell(cx, cy + 9, 46, 11)}" fill="none" stroke="#a0a8b8" stroke-width="1.5"/>`);
    S.add(`<path d="M${cx - 28},${cy - 26}Q${cx - 28},${cy + 8} ${cx},${cy + 8}Q${cx + 28},${cy + 8} ${cx + 28},${cy - 26}Z" fill="#f6f8fb"/>`);
    S.add(`<path d="${ell(cx, cy - 26, 28, 7)}" fill="#a0542e"/><path d="${ell(cx, cy - 26, 28, 7)}" fill="none" stroke="#c8ccd6" stroke-width="2"/>`);
    S.add(`<path d="M${cx + 27},${cy - 18}q20,2 14,16q-6,8 -16,4" fill="none" stroke="#e8ecf2" stroke-width="5"/>`);
    S.add(`<path d="M${cx - 22},${cy - 18}Q${cx - 20},${cy + 2} ${cx - 6},${cy + 4}" fill="none" stroke="#ffd0a0" stroke-width="3" opacity=".8"/>`);
    // steam
    S.add(`<path d="M${cx - 6},${cy - 36}q-10,-18 2,-34q10,-14 -2,-30M${cx + 8},${cy - 38}q10,-16 -2,-30" fill="none" stroke="#fff4e4" stroke-width="3" stroke-linecap="round" opacity=".35"/>`);
    // a small bud vase with a sprig of flowers
    const vx = 930, vy = 676;
    S.add(`<path d="M${vx - 10},${vy}Q${vx - 16},${vy - 22} ${vx - 4},${vy - 36}V${vy - 50}H${vx + 4}V${vy - 36}Q${vx + 16},${vy - 22} ${vx + 10},${vy}Z" fill="#7aa0b8"/><path d="M${vx - 7},${vy - 6}Q${vx - 11},${vy - 22} ${vx - 2},${vy - 34}" stroke="#d8eef8" stroke-width="2" fill="none" opacity=".8"/>`);
    S.add(`<path d="M${vx},${vy - 50}Q${vx - 8},${vy - 80} ${vx - 18},${vy - 96}M${vx},${vy - 50}Q${vx + 6},${vy - 84} ${vx + 16},${vy - 104}M${vx},${vy - 50}V${vy - 92}" stroke="#4a6a3a" stroke-width="2.5" fill="none"/>`);
    let petals = '';
    for (const [px, py, pr] of [[vx - 18, vy - 98, 8], [vx + 16, vy - 106, 9], [vx, vy - 94, 7]]) petals += circ(px, py, pr);
    S.add(`<path d="${petals}" fill="#f6d27a"/><path d="${circ(vx - 18, vy - 98, 3)}${circ(vx + 16, vy - 106, 3)}${circ(vx, vy - 94, 2.6)}" fill="#c87a3a"/>`);
  }
  // the bench backs either side of the table, red velvet, close to the viewer
  S.add(`<path d="M0,700Q150,680 300,700L330,900H0Z" fill="#6e1a26"/><path d="M0,700Q150,680 300,700" fill="none" stroke="#c0505a" stroke-width="4" opacity=".7"/>`);
  S.add(`<path d="M1180,710Q1350,686 1600,700V900H1150Z" fill="#6a1824"/><path d="M1180,710Q1350,686 1600,700" fill="none" stroke="#c0505a" stroke-width="4" opacity=".6"/>`);
  {
    let tufts = '';
    for (const [x, y] of [[80, 760], [200, 756], [120, 830], [250, 826], [1270, 770], [1400, 762], [1520, 760], [1330, 840], [1470, 836]]) tufts += circ(x, y, 4);
    S.add(`<path d="${tufts}" fill="#3e0c14"/>`);
  }
  // warm dusk glow over everything near the windows, dark edges to sit with the other train scenes
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.5, '#140806', 0], [1, '#140806', 0.55]], `gradientUnits="userSpaceOnUse" cx="760" cy="420" r="1000"`)}"/>`);
  return S.out();
}

export const gaidenGBgs = {
  'memory-space': memorySpace,
  'nox-observatory-dawn': observatoryDawn,
  'silver-rail-window-dusk': windowDusk,
};
