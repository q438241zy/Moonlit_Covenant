// 成长支线的场景背景（剧本/番外/ex025身份登記.md〈美術需求〉）：verdant-registry-hall（绿镜城·身份登记所）。
//   verdant-registry-hall — the identity registry of Green-Mirror City, seen from the public side of the room: a stone hall in
//                           one-point perspective. Against the back wall a long wooden counter; in its middle a small timber
//                           booth with the clerk's window, its hinged board propped half down; behind the counter a whole wall
//                           of pigeonhole cabinets stuffed with rolled papers and bound ledgers. On the counter: ink bottles,
//                           three stamps, a green ink pad, stacked forms and a peg board of wooden number tags. Trimmed living
//                           vines on the stone above the cabinets and down the side walls, their leaves caught mid-change
//                           (green, teal, gold, violet). A tall arched window high in the left wall throws a slanting shaft of
//                           daylight across the floor (light from the upper left). In the right-hand corner a tall standing
//                           mirror in a carved frame, a cloth thrown over its upper two-thirds; below the hem a strip of flat grey glass that reflects nothing.
//                           Foreground: polished flagstones and wooden queue rails dividing the floor into three lanes.
//                           No figures, no readable text.
import { Scene, W, H, f, pz, mix, rng } from './lib.mjs';

const r0 = (v) => f(v, 0);
const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;
const rect = (x, y, w, h) => `M${f1(x)},${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}Z`;

const M = {
  stone: ['#b8b2a2', '#9a9484', '#7a7466', '#5a5548'],
  stoneSide: ['#8e8878', '#6e685a'],
  joint: '#4e4a40',
  floor: ['#a8a294', '#7c776a', '#5c584e'],
  wood: { lit: '#b08a5e', mid: '#8a6a46', shade: '#5e4630', deep: '#3a2a1c' },
  paper: ['#efe6d0', '#e2d6b8', '#d6c8a4'],
  ledger: ['#6a3a2e', '#3a4e5a', '#4e5a36', '#6a5a3a', '#4a3a5a'],
  vines: [['#3e7a3a', '#6aa86a', '#a8cc6a'], ['#2e7468', '#4aa0a0', '#88c8bc'], ['#5a8a34', '#b8a83a', '#e0c656'], ['#4a6a3a', '#7a5a9a', '#a882c4']],
  ink: '#3a8a5a', inkHi: '#7ac898',
  light: '#fff6dc',
  cloth: ['#d8d0bc', '#b8ae96', '#8e846c'],
};

// back wall plane and the room's vanishing point
const VP = [800, 420];
const BW = { x0: 250, x1: 1350, y0: 40, y1: 640 }; // back wall rectangle (floor line at y1)
// a point on the floor at screen-x on the back wall line, pulled toward the viewer by t (0 = back wall, 1 = picture edge)
const toward = (x, y, t) => [x + (x - VP[0]) * t * 1.9, y + (y - VP[1]) * t * 1.9];

function leafClusters(S, R, box, n, pals, { size = [5, 10], op = 0.95 } = {}) {
  const buf = pals.map(() => ['', '', '']);
  for (let i = 0; i < n; i++) {
    const x = R.range(box[0], box[2]), y = R.range(box[1], box[3]);
    const p = Math.floor(R() * pals.length), c = Math.floor(R() * 3), r = R.range(size[0], size[1]), a = R.range(-0.9, 0.9);
    const dx = Math.cos(a) * r, dy = Math.sin(a) * r;
    buf[p][c] += `M${f1(x - dx)},${f1(y - dy)}q${f1(dx - dy * 0.8)},${f1(dy + dx * 0.8)} ${f1(dx * 2)},${f1(dy * 2)}q${f1(-dx + dy * 0.8)},${f1(-dy - dx * 0.8)} ${f1(-dx * 2)},${f1(-dy * 2)}Z`;
  }
  let s = '';
  buf.forEach((cols, p) => cols.forEach((d, c) => { if (d) s += `<path d="${d}" fill="${pals[p][c]}" opacity="${op}"/>`; }));
  return s;
}

function registryHall() {
  const S = new Scene('sbSqiRegistry', '绿镜城·身份登记所：从排队的一侧看过去的石砌大厅；正面一道长长的木柜台，中间一个木头小亭子开着窗口，窗板支起一半；柜台后面一整墙格子木柜，塞满卷起的纸和簿册；柜台上有墨水瓶、三枚印章、一块绿色印台、一叠表格和挂着木头号牌的钉板；墙上爬着修剪整齐、正在换色的活藤；左墙高处一扇拱窗，白天的光斜斜地落在地上；右边墙角立着一面雕花框的高镜子，布盖住上面大半，下面露出一截不映任何东西的灰玻璃；前景是磨亮的石地和隔出三条队的木栏；不画人，不写字', 25001);
  const R = rng(25002);

  // ── ceiling, side walls, back wall ───────────────────────────────────────────────────────────────────────────────────
  S.add(`<rect width="${W}" height="${H}" fill="#3a362e"/>`);
  // ceiling (dark timber with beams converging)
  S.add(`<path d="M0,0H${W}L${BW.x1},${BW.y0}H${BW.x0}Z" fill="${S.lin([[0, '#2a241c'], [1, '#4a4034']])}"/>`);
  {
    let b = '';
    for (let k = 0; k <= 6; k++) { const x = BW.x0 + ((BW.x1 - BW.x0) * k) / 6; const [ex] = toward(x, BW.y0, 1); b += `M${f1(x)},${BW.y0}L${f1(ex + (x - VP[0]) * 0.1)},0`; }
    S.add(`<path d="${b}" stroke="#1e1912" stroke-width="10" opacity=".7"/>`);
  }
  // left wall (lit only through its window) and right wall (in the window's light)
  S.add(`<path d="M0,0L${BW.x0},${BW.y0}V${BW.y1}L0,${H}Z" fill="${S.lin([[0, M.stoneSide[1]], [1, M.stoneSide[0]]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="M${W},0L${BW.x1},${BW.y0}V${BW.y1}L${W},${H}Z" fill="${S.lin([[0, M.stone[1]], [1, M.stone[0]]], 'x1="1" y1="0" x2="0" y2="0"')}"/>`);
  // stone courses on the side walls
  {
    let d = '';
    for (let k = 1; k < 12; k++) {
      const t = k / 12, yb = BW.y0 + (BW.y1 - BW.y0) * t;
      const yL = yb + (yb - VP[1]) * 1.9 * 0.97 * (1 / 1);
      d += `M${BW.x0},${f1(yb)}L0,${f1(yb + (yb - VP[1]) * (BW.x0 / (VP[0] - BW.x0)))}`;
      d += `M${BW.x1},${f1(yb)}L${W},${f1(yb + (yb - VP[1]) * ((W - BW.x1) / (BW.x1 - VP[0])))}`;
      void yL;
    }
    S.add(`<path d="${d}" stroke="${M.joint}" stroke-width="2" opacity=".35"/>`);
  }
  // back wall
  S.add(`<path d="${rect(BW.x0, BW.y0, BW.x1 - BW.x0, BW.y1 - BW.y0)}" fill="${S.lin([[0, M.stone[2]], [0.5, M.stone[1]], [1, M.stone[2]]])}"/>`);
  {
    let d = '';
    for (let y = BW.y0 + 34, row = 0; y < 200; y += 34, row++) { d += `M${BW.x0},${y}H${BW.x1}`; for (let x = BW.x0 + (row % 2 ? 40 : 0); x < BW.x1; x += 80) d += `M${x},${y - 34}v34`; }
    S.add(`<path d="${d}" stroke="${M.joint}" stroke-width="1.6" opacity=".4"/>`);
  }

  // ── the arched window high in the left wall and its light ──────────────────────────────────────────────────────────
  {
    // window opening in perspective on the left wall
    const win = [[70, 70], [190, 120], [190, 330], [70, 330]];
    S.add(`<path d="M70,330V110Q130,30 190,140V330Z" fill="${S.lin([[0, '#f4f8e8'], [1, '#c8dcc0']])}"/>`);
    S.add(`<path d="M130,64V330M70,210L190,220" stroke="#4a3e2e" stroke-width="6"/><path d="M70,330V110Q130,30 190,140V330Z" fill="none" stroke="#3a3024" stroke-width="10"/>`);
    void win;
    // light shaft across the floor
    S.add(`<path d="M80,330L190,330L1020,${H}H520Z" fill="${M.light}" opacity=".2" filter="${S.blur(2)}"/>`);
    S.add(`<path d="M120,120L190,140L640,640L380,700Z" fill="${M.light}" opacity=".06"/>`);
  }

  // ── vines on the back wall above the cabinets and down the side walls ───────────────────────────────────────────────
  {
    // stems
    let st = '';
    for (let k = 0; k < 9; k++) { const x = R.range(BW.x0 + 20, BW.x1 - 20); st += `M${f1(x)},${BW.y0}q${f1(R.range(-40, 40))},40 ${f1(R.range(-30, 30))},${f1(R.range(70, 110))}`; }
    for (let k = 0; k < 6; k++) { const y = R.range(60, 300); st += `M${f1(R.range(0, 60))},${f1(y)}q60,${f1(R.range(10, 60))} ${f1(R.range(140, 220))},${f1(R.range(60, 160))}`; }
    for (let k = 0; k < 6; k++) { const y = R.range(60, 300); st += `M${W - f1(R.range(0, 60))},${f1(y)}q-60,${f1(R.range(10, 60))} ${f1(-R.range(140, 220))},${f1(R.range(60, 160))}`; }
    S.add(`<path d="${st}" stroke="#2e3e24" stroke-width="4" fill="none" opacity=".8"/>`);
    S.add(leafClusters(S, R, [BW.x0, BW.y0, BW.x1, 150], 360, M.vines, { size: [5, 9] }));
    S.add(leafClusters(S, R, [0, 0, 58, 420], 70, M.vines, { size: [8, 14] }) + leafClusters(S, R, [200, 30, 248, 380], 60, M.vines, { size: [7, 12] }) + leafClusters(S, R, [60, 0, 200, 50], 30, M.vines, { size: [7, 12] }));
    S.add(leafClusters(S, R, [1380, 20, W, 300], 150, M.vines, { size: [8, 14] }));
    // a trimmed edge line where the vines stop above the cabinets
    S.add(`<path d="M${BW.x0},150H${BW.x1}" stroke="#2e3a24" stroke-width="2" opacity=".5"/>`);
  }

  // ── pigeonhole cabinets behind the counter ─────────────────────────────────────────────────────────────────────────
  {
    const x0 = BW.x0 + 20, x1 = BW.x1 - 20, y0 = 160, y1 = 520, cols = 22, rows = 7;
    const cw = (x1 - x0) / cols, rh = (y1 - y0) / rows;
    S.add(`<path d="${rect(x0 - 10, y0 - 12, x1 - x0 + 20, y1 - y0 + 12)}" fill="${M.wood.mid}"/>`);
    S.add(`<path d="${rect(x0 - 14, y0 - 20, x1 - x0 + 28, 12)}" fill="${M.wood.lit}"/>`);
    let holes = '', scrolls = ['', '', ''], ends = '', books = M.ledger.map(() => '');
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const hx = x0 + c * cw + 3, hy = y0 + r * rh + 3, hw = cw - 6, hh = rh - 6;
      holes += rect(hx, hy, hw, hh);
      const kind = R();
      if (kind < 0.55) {
        // rolled papers: a few circles (the scroll ends facing us)
        const n = 2 + Math.floor(R() * 4);
        for (let i = 0; i < n; i++) { const rr = R.range(5, 8), cx = hx + R.range(rr + 1, hw - rr - 1), cy = hy + hh - rr - R.range(0, hh - 2 * rr - 2); const ci = Math.floor(R() * 3); scrolls[ci] += ell(cx, cy, rr, rr); ends += ell(cx, cy, rr * 0.35, rr * 0.35); }
      } else if (kind < 0.88) {
        // bound ledgers standing up
        let bx = hx + 2;
        while (bx < hx + hw - 6) { const bw = R.range(5, 9), bh = hh * R.range(0.6, 0.95), ci = Math.floor(R() * M.ledger.length); books[ci] += rect(bx, hy + hh - bh, Math.min(bw, hx + hw - bx - 1), bh); bx += bw + 1; }
      }
    }
    S.add(`<path d="${holes}" fill="#2a1e14"/>`);
    scrolls.forEach((d, i) => { if (d) S.add(`<path d="${d}" fill="${M.paper[i]}"/>`); });
    S.add(`<path d="${ends}" fill="#a8987a" opacity=".7"/>`);
    books.forEach((d, i) => { if (d) S.add(`<path d="${d}" fill="${M.ledger[i]}"/>`); });
    // a ladder leaning on the cabinets (right of the booth)
    S.add(`<path d="M1130,520L1170,170M1180,520L1214,170" stroke="${M.wood.shade}" stroke-width="7"/>`);
    let rungs = ''; for (let y = 200; y < 520; y += 42) { const t = (y - 170) / 350; rungs += `M${f1(1170 - 40 * t)},${y}L${f1(1214 - 34 * t)},${y}`; }
    S.add(`<path d="${rungs}" stroke="${M.wood.shade}" stroke-width="5"/>`);
  }

  // ── the long counter ───────────────────────────────────────────────────────────────────────────────────────────────
  const CT = { y: 500, yFront: 532, yBase: 690, x0: 150, x1: 1450 };
  {
    // top surface (seen slightly from above) and front panel
    S.add(`<path d="M${BW.x0 + 6},${CT.y}H${BW.x1 - 6}L${CT.x1},${CT.yFront}H${CT.x0}Z" fill="${M.wood.lit}"/>`);
    // the floor goes in first so the counter front stands on it
    S.add(`<path d="M0,${H}L0,${f1(BW.y1 + (BW.y1 - VP[1]) * (BW.x0 / (VP[0] - BW.x0)))}L${BW.x0},${BW.y1}H${BW.x1}L${W},${f1(BW.y1 + (BW.y1 - VP[1]) * ((W - BW.x1) / (BW.x1 - VP[0])))}V${H}Z" fill="${S.lin([[0, M.floor[1]], [0.5, M.floor[0]], [1, M.floor[2]]], `gradientUnits="userSpaceOnUse" x1="0" y1="${CT.yBase}" x2="0" y2="${H}"`)}"/>`);
    // left end of the counter (its side face, toward the left wall)
    S.add(`<path d="M${CT.x0},${CT.yFront}L${BW.x0 + 6},${CT.y}V${CT.yBase - 40}L${CT.x0},${CT.yBase}Z" fill="${M.wood.shade}"/>`);
    S.add(`<path d="${rect(CT.x0, CT.yFront, CT.x1 - CT.x0, CT.yBase - CT.yFront)}" fill="${S.lin([[0, M.wood.mid], [1, M.wood.shade]])}"/>`);
    S.add(`<path d="M${CT.x0},${CT.yFront}H${CT.x1}" stroke="#d8b888" stroke-width="3" opacity=".7"/>`);
    // panelling
    let pan = '';
    for (let x = CT.x0 + 20; x < CT.x1 - 60; x += 130) pan += rect(x, CT.yFront + 22, 110, CT.yBase - CT.yFront - 44);
    S.add(`<path d="${pan}" fill="none" stroke="${M.wood.deep}" stroke-width="3" opacity=".6"/>`);
    S.add(`<path d="${rect(CT.x0, CT.yBase, CT.x1 - CT.x0, 10)}" fill="${M.wood.deep}"/>`);
  }

  // ── the clerk's booth and window in the middle of the counter ──────────────────────────────────────────────────────
  {
    const bx0 = 640, bx1 = 960, top = 250;
    // side posts and the little roof
    S.add(`<path d="${rect(bx0, top, 34, CT.yFront - top)}${rect(bx1 - 34, top, 34, CT.yFront - top)}" fill="${M.wood.mid}"/>`);
    S.add(`<path d="M${bx0 - 30},${top}L800,${top - 70}L${bx1 + 30},${top}Z" fill="${M.wood.shade}"/><path d="M${bx0 - 30},${top}H${bx1 + 30}" stroke="${M.wood.deep}" stroke-width="8"/>`);
    // a carved stamp emblem on the gable (an oval seal with a leaf, no letters)
    S.add(`<path d="${ell(800, top - 30, 26, 18)}" fill="${M.ink}" stroke="#2a4a34" stroke-width="3"/><path d="M790,${top - 30}q10,-12 20,0q-10,12 -20,0Z" fill="${M.inkHi}"/>`);
    // lower partition below the window
    S.add(`<path d="${rect(bx0 + 34, 410, bx1 - bx0 - 68, CT.y - 410)}" fill="${M.wood.mid}"/>`);
    S.add(`<path d="M${bx0 + 34},410H${bx1 - 34}" stroke="${M.wood.lit}" stroke-width="5"/>`);
    // the window opening (we see the cabinets through it — already drawn), with a grille of two bars
    S.add(`<path d="M${bx0 + 34},${top + 8}H${bx1 - 34}" stroke="${M.wood.deep}" stroke-width="6"/>`);
    // hinged board propped half down, on chains
    S.add(`<path d="M${bx0 + 40},${top + 10}H${bx1 - 40}L${bx1 - 20},${top + 70}H${bx0 + 20}Z" fill="${M.wood.lit}" stroke="${M.wood.deep}" stroke-width="3"/>`);
    S.add(`<path d="M${bx0 + 30},${top + 70}L${bx0 + 34},${top + 140}M${bx1 - 30},${top + 70}L${bx1 - 34},${top + 140}" stroke="#2a2a2a" stroke-width="2" stroke-dasharray="4 3"/>`);
    // a little ledge in front of the window
    S.add(`<path d="M${bx0 + 20},410H${bx1 - 20}l14,14H${bx0 + 6}Z" fill="${M.wood.lit}"/>`);
    // the blank form propped at the window's edge (no writing — a few faint grey strokes only)
    S.add(`<path d="M${bx1 - 96},408l6,-56h40l-6,56Z" fill="${M.paper[0]}" stroke="#8a7e66" stroke-width="1.5"/><path d="M${bx1 - 82},372h22M${bx1 - 84},384h24M${bx1 - 85},396h16" stroke="#9a9078" stroke-width="2" opacity=".6"/>`);
  }

  // ── things on the counter ──────────────────────────────────────────────────────────────────────────────────────────
  {
    // stacks of forms (left)
    for (const [x, n] of [[300, 9], [380, 6], [470, 12]]) {
      let d = '';
      for (let i = 0; i < n; i++) d += `M${x + R.range(-3, 3)},${CT.y + 14 - i * 3}h${70}l${8},-6h-70Z`;
      S.add(`<path d="${d}" fill="${M.paper[1]}" stroke="#a89878" stroke-width="1"/>`);
    }
    // ink pad (green) and three stamps
    S.add(`<path d="M1000,${CT.y + 18}h90l10,-10h-90Z" fill="#3a2a1c"/><path d="M1006,${CT.y + 15}h78l7,-7h-78Z" fill="${M.ink}"/>`);
    for (const [x, h] of [[1120, 34], [1150, 40], [1182, 30]]) {
      S.add(`<path d="${rect(x - 9, CT.y + 6 - 8, 18, 8)}" fill="${M.ink}"/><path d="${rect(x - 4, CT.y + 6 - 8 - h, 8, h)}" fill="${M.wood.mid}"/><path d="${ell(x, CT.y - 2 - h, 9, 7)}" fill="${M.wood.lit}"/>`);
    }
    // ink bottles
    for (const x of [560, 590]) S.add(`<path d="M${x - 10},${CT.y + 14}v-22q0,-8 10,-8q10,0 10,8v22Z" fill="#1e2a2a"/><path d="${rect(x - 4, CT.y - 22, 8, 6)}" fill="#6a5a3a"/><path d="M${x - 6},${CT.y - 4}v12" stroke="#7ab0a0" stroke-width="2" opacity=".5"/>`);
    // quill
    S.add(`<path d="M600,${CT.y - 12}q30,-50 70,-70q-20,40 -66,72Z" fill="#f0ece0" opacity=".9"/>`);
    // peg board of wooden number tags (right end of the counter, standing)
    S.add(`<path d="${rect(1250, 380, 120, CT.y - 380 + 12)}" fill="${M.wood.shade}" stroke="${M.wood.deep}" stroke-width="3"/>`);
    let pegs = '', tags = '';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const x = 1266 + c * 28, y = 396 + r * 38;
      pegs += ell(x, y, 2.5, 2.5);
      if (R() < 0.6) tags += `M${x - 9},${y + 3}h18v22h-18Z`;
    }
    S.add(`<path d="${tags}" fill="${M.wood.lit}" stroke="${M.wood.deep}" stroke-width="1.5"/><path d="${pegs}" fill="#2a2018"/>`);
  }

  // ── floor ──────────────────────────────────────────────────────────────────────────────────────────────────────────
  {
    // the floor region in front of the counter
    // flagstone joints: lines converging to the vanishing point, and cross lines spaced in perspective
    let d = '';
    for (let k = -10; k <= 10; k++) { const x = VP[0] + k * 70; const yb = CT.yBase + 10; const t = (yb - VP[1]); const xb = VP[0] + (x - VP[0]); const xe = VP[0] + (x - VP[0]) * ((H - VP[1]) / t); d += `M${f1(xb)},${yb}L${f1(xe)},${H}`; }
    for (let i = 1; i < 8; i++) { const y = CT.yBase + 10 + (H - CT.yBase - 10) * (1 - Math.pow(0.72, i)) / (1 - Math.pow(0.72, 8)); d += `M0,${f1(y)}H${W}`; }
    S.add(`<path d="${d}" stroke="${M.joint}" stroke-width="2" opacity=".35"/>`);
    // a soft sheen on the polished stone (not a reflection)
    S.add(`<path d="M420,760Q800,720 1180,760L1300,${H}H300Z" fill="#fff8e8" opacity=".05"/>`);
  }

  // ── the covered mirror in the right-hand corner ────────────────────────────────────────────────────────────────────
  {
    const cx = 1450, top = 230, base = 770, w = 210;
    const xl = cx - w / 2, xr = cx + w / 2;
    // its shadow on the floor
    S.add(`<path d="${ell(cx + 10, base + 30, 140, 16)}" fill="#000" opacity=".22"/>`);
    // the frame: a tall rectangle of carved wood on a low plinth with two scrolled feet
    S.add(`<path d="${rect(xl - 10, base - 6, w + 20, 22)}" fill="${M.wood.shade}" stroke="${M.wood.deep}" stroke-width="3"/>`);
    S.add(`<path d="M${xl + 4},${base + 16}q-14,10 -6,22h26l-4,-22ZM${xr - 4},${base + 16}q14,10 6,22h-26l4,-22Z" fill="${M.wood.mid}" stroke="${M.wood.deep}" stroke-width="3"/>`);
    S.add(`<path d="${rect(xl, top, w, base - top)}" fill="${M.wood.mid}" stroke="${M.wood.deep}" stroke-width="4"/>`);
    // the glass at the bottom, below the cloth: flat cool grey, no reflection
    S.add(`<path d="${rect(xl + 16, 610, w - 32, base - 610 - 14)}" fill="${S.lin([[0, '#8a98a0'], [1, '#5a666e']])}"/><path d="M${xl + 30},${base - 30}l40,-110" stroke="#c8d4d8" stroke-width="4" opacity=".35"/>`);
    // a carved crest on top, square-shouldered, with a small round boss
    S.add(`<path d="M${xl - 6},${top}h${w + 12}v-14q-${w / 2 - 10},-8 -${w / 2 + 6},-46q-${w / 2 - 4},38 -${w / 2 + 6},46Z" fill="${M.wood.lit}" stroke="${M.wood.deep}" stroke-width="3"/><path d="${ell(cx, top - 26, 10, 10)}" fill="${M.ink}"/>`);
    // the cloth thrown over the top: square corners hanging down both sides, an uneven hem
    const hem = [[xr + 14, 640], [xr - 20, 600], [cx + 40, 616], [cx, 596], [cx - 50, 620], [xl + 14, 598], [xl - 14, 650]];
    const cloth = `M${xl - 14},${top - 4}H${xr + 14}L${xr + 18},640` + hem.map(([x, y]) => `L${x},${y}`).join('') + 'Z';
    S.add(`<path d="${cloth}" fill="${S.lin([[0, M.cloth[0]], [0.65, M.cloth[1]], [1, M.cloth[2]]], 'x1="0" y1="0" x2="1" y2="0.15"')}"/>`);
    let folds = '';
    for (const x of [xl + 30, cx - 30, cx + 20, xr - 30]) folds += `M${x},${top + 6}Q${x + 6},${top + 200} ${x - 4},${600}`;
    S.add(`<path d="${folds}" stroke="${M.cloth[2]}" stroke-width="5" fill="none" opacity=".5"/>`);
    S.add(`<path d="M${xl - 14},${top - 4}H${xr + 14}" stroke="#fffaf0" stroke-width="3" opacity=".6"/>`);
  }

  // ── queue rails: wooden posts with a rail between, dividing the floor into three lanes ─────────────────────────────
  {
    const posts = [];
    for (const lane of [-1, 1]) {
      const bx = VP[0] + lane * 210; // where the rail line meets the counter base
      for (const t of [0.12, 0.45, 0.9]) {
        const y = CT.yBase + 10 + (H + 120 - CT.yBase) * t;
        const x = VP[0] + (bx - VP[0]) * ((y - VP[1]) / (CT.yBase + 10 - VP[1]));
        const s = (y - VP[1]) / (CT.yBase + 10 - VP[1]);
        posts.push([x, y, s, lane]);
      }
    }
    // rails first (behind the post caps)
    for (const lane of [-1, 1]) {
      const ps = posts.filter((p) => p[3] === lane);
      let d = '';
      for (let i = 0; i < ps.length - 1; i++) { const [ax, ay, as] = ps[i], [bx, by, bs] = ps[i + 1]; d += `M${f1(ax)},${f1(ay - 70 * as)}L${f1(bx)},${f1(by - 70 * bs)}`; }
      S.add(`<path d="${d}" stroke="${M.wood.shade}" stroke-width="10" stroke-linecap="round"/><path d="${d}" stroke="${M.wood.lit}" stroke-width="3" opacity=".7"/>`);
    }
    for (const [x, y, s] of posts.sort((a, b) => a[1] - b[1])) {
      S.add(`<path d="${ell(x, y, 26 * s, 6 * s)}" fill="#000" opacity=".2"/>`);
      S.add(`<path d="${rect(x - 9 * s, y - 90 * s, 18 * s, 90 * s)}" fill="${M.wood.mid}"/><path d="${rect(x - 9 * s, y - 90 * s, 6 * s, 90 * s)}" fill="${M.wood.lit}" opacity=".6"/>`);
      S.add(`<path d="${ell(x, y - 92 * s, 13 * s, 9 * s)}" fill="${M.wood.lit}"/>`);
    }
  }

  // ── light and vignette ─────────────────────────────────────────────────────────────────────────────────────────────
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, M.light, 0.1], [1, M.light, 0]], 'cx="0.15" cy="0.2" r="0.6"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.65, '#000', 0.12], [1, '#000', 0.55]], 'cx="0.5" cy="0.5" r="0.78"')}"/>`);
  void mix; void pz;
  return S.out();
}

export const sqIBgs = {
  'verdant-registry-hall': () => registryHall(),
};
