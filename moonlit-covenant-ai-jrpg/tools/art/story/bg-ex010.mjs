// 番外 ex010 的场景背景（剧本/番外/ex010如果在另一個世界上班.md〈美術需求〉）：if-modern-office（IF·平行现代·办公室）、if-modern-mall（IF·平行现代·商场）。
//   if-modern-office — 白天的开放式办公室（二十三楼）：中间一条过道，两侧是成排的工位——隔板、桌面、亮着的电脑屏幕
//                      （只有渐变与色块，没有字）、转椅；左墙一块白板（只有不成字的线条、方框与箭头），右墙一只
//                      只有刻度的挂钟和一盆绿植；天花板一格一格的灯板；尽头整面落地窗外是晴天里的高楼，阳光从左上方
//                      斜斜地落在地毯上。
//   if-modern-mall   — 午后的商场中庭：玻璃天顶，两侧三层回廊（玻璃栏板、扶手、檐口灯带），每层一排玻璃店面
//                      （店招只有色块，没有字和商标），中庭里两部交错的扶梯，天顶垂下几盏吊灯，抛光的地砖上有倒影。
// IF 专用（现代商场只出现在 ex010）。不画人物，不画能读出的字与商标；光从左上方来，底部渐暗方便字幕。
import { Scene, W, H, f, pz, pl, persp, cloud } from './lib.mjs';

const r0 = (v) => f(v, 0);

// ─────────────────────────────────────────────────────────────────────────────────────────────
// if-modern-office
// ─────────────────────────────────────────────────────────────────────────────────────────────
const OF = {
  wall: '#d6dae0', wallShade: '#aeb4be', wallLit: '#e6e9ee', ceil: '#e2e5ea', ceilLine: '#c8ccd4', panel: '#fbfcfe',
  floor: [[0, '#a2abb8'], [1, '#4a515e']], carpetLine: '#7e8896',
  top: '#ece6dc', topEdge: '#c8c0b4', side: '#9a948c', leg: '#5a5e66',
  part: '#7a8798', partLit: '#94a2b2', partCap: '#c4ccd6',
  bezel: '#23272f', screen: [[0, '#cfe8f8'], [0.55, '#8ec0e6'], [1, '#5a8ec4']], screenBack: '#3a3f48',
  chair: '#353a44', chairLit: '#4c5260',
  frame: '#9aa2ac', mullion: '#c4cad2', sill: '#bfc5ce',
  sky: [[0, '#8fbfe8'], [0.55, '#c4ddf2'], [1, '#e8f0f6']],
  far: '#b6c6d6', farShade: '#a2b4c6', mid: '#8ea4bc', midShade: '#748aa4', near: '#647a94', nearShade: '#4e627c', grid: '#e6eef6',
  board: '#f4f6f8', boardFrame: '#8e96a0', ink: ['#3a6ac8', '#c84a4a', '#3a9a5a', '#2a2e36'],
  pot: '#c8b8a0', leaf: '#4e8a5a', leafLit: '#7ab46e',
};

function office() {
  const S = new Scene('sbEx010Office', 'IF·平行现代·办公室：白天的开放式办公室，两侧是成排的工位与亮着的电脑屏幕（屏幕上没有字），左墙一块白板，右墙一只挂钟，尽头整面落地窗外是晴天里的高楼；没有人', 10101);
  const R = S.R;
  const VP = [800, 410], F = 760, EYE = 1.5;
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const XL = -3.9, XR = 3.9, YC = 3.0, Z0 = 0.55, ZB = 7;
  const o = [];

  S.add(`<rect width="${W}" height="${H}" fill="${OF.wall}"/>`);

  // ---- the window wall at the end: the city in the sun, behind mullions -----------------------------------------------
  {
    const wy0 = 0.28, wy1 = 2.92, wx0 = XL + 0.06, wx1 = XR - 0.06;
    const tl = pr(wx0, wy1, ZB), br = pr(wx1, wy0, ZB);
    const win = pz([tl, [br[0], tl[1]], br, [tl[0], br[1]]]);
    const clip = S.clip(win);
    const ww = br[0] - tl[0];
    const c = [];
    c.push(`<rect x="${r0(tl[0])}" y="${r0(tl[1])}" width="${r0(ww)}" height="${r0(br[1] - tl[1])}" fill="${S.lin(OF.sky)}"/>`);
    const cc = { shade: '#dfe9f3', lit: '#f8fbfd', rim: '#ffffff' };
    c.push(`<g opacity=".85">${cloud(R, tl[0] + ww * 0.08, tl[1] + 70, 190, 40, cc, { bumps: 6 })}${cloud(R, tl[0] + ww * 0.62, tl[1] + 48, 150, 30, cc, { bumps: 5 })}</g>`);
    // three layers of towers: far (pale, low), middle, near (dark, cut by the window edges); lit faces on the left
    const layer = (n, x0, x1, top0, top1, wmin, wmax, col, shade, gridOp, seed) => {
      let face = '', side = '', grid = '';
      let x = x0;
      for (let i = 0; i < n && x < x1; i++) {
        const w = R.range(wmin, wmax), top = R.range(top0, top1), sd = w * R.range(0.12, 0.22);
        face += `M${r0(x)},${r0(br[1] + 4)}V${r0(top)}h${r0(w)}V${r0(br[1] + 4)}Z`;
        side += `M${r0(x + w)},${r0(br[1] + 4)}V${r0(top)}l${r0(sd)},${r0(sd * 0.25)}V${r0(br[1] + 4)}Z`;
        const step = Math.max(6, w * 0.09);
        for (let y = top + step; y < br[1]; y += step) grid += `M${r0(x + 3)},${r0(y)}h${r0(w - 6)}`;
        if (w > 50) for (let gx = x + w * 0.33; gx < x + w - 4; gx += w * 0.33) grid += `M${r0(gx)},${r0(top + 4)}V${r0(br[1])}`;
        x += w + sd + R.range(-6, 16);
      }
      return `<path d="${side}" fill="${shade}"/><path d="${face}" fill="${col}"/><path d="${grid}" stroke="${OF.grid}" stroke-width="1.6" opacity="${gridOp}"/>`;
    };
    c.push(layer(22, tl[0] - 20, br[0], VP[1] - 70, VP[1] + 10, 30, 70, OF.far, OF.farShade, 0.35, 1));
    c.push(layer(12, tl[0] - 40, br[0], tl[1] + 40, VP[1] - 40, 60, 110, OF.mid, OF.midShade, 0.4, 2));
    c.push(layer(3, tl[0] - 60, tl[0] + 210, tl[1] - 40, tl[1] + 10, 90, 130, OF.near, OF.nearShade, 0.45, 3));
    c.push(layer(2, br[0] - 230, br[0] + 40, tl[1] - 30, tl[1] + 30, 100, 140, OF.near, OF.nearShade, 0.45, 4));
    c.push(`<rect x="${r0(tl[0])}" y="${r0(tl[1])}" width="${r0(ww)}" height="${r0(br[1] - tl[1])}" fill="#ffffff" opacity=".12"/>`);
    S.add(`<g clip-path="${clip}">${c.join('')}</g>`);
    // frame, mullions, transom, sill
    let mu = '';
    for (const x of [-2.6, -1.3, 0, 1.3, 2.6]) mu += pl([pr(x, wy0, ZB), pr(x, wy1, ZB)]);
    mu += pl([pr(wx0, 2.42, ZB), pr(wx1, 2.42, ZB)]);
    S.add(`<path d="${win}" fill="none" stroke="${OF.frame}" stroke-width="7"/><path d="${mu}" stroke="${OF.mullion}" stroke-width="6"/>`);
    S.add(`<path d="${q([[XL, 0, ZB], [XL, wy0, ZB], [XR, wy0, ZB], [XR, 0, ZB]])}" fill="${OF.sill}"/>`);
  }

  // ---- ceiling with light panels; side walls --------------------------------------------------------------------------
  o.push(`<path d="${q([[XL, YC, Z0], [XR, YC, Z0], [XR, YC, ZB], [XL, YC, ZB]])}" fill="${OF.ceil}"/>`);
  let cl = '';
  for (let x = XL + 0.6; x < XR; x += 0.6) cl += pl(pr.poly([[x, YC, Z0 + 0.6], [x, YC, ZB]]));
  for (const z of [1.2, 1.8, 2.4, 3.0, 3.6, 4.2, 4.8, 5.4, 6.0, 6.6]) cl += pl(pr.poly([[XL, YC, z], [XR, YC, z]]));
  o.push(`<path d="${cl}" stroke="${OF.ceilLine}" stroke-width="1.2" opacity=".7"/>`);
  let pn = '';
  for (const z of [1.2, 3.0, 4.8]) for (const [x0, x1] of [[-3.0, -1.8], [-0.6, 0.6], [1.8, 3.0]]) pn += q([[x0, YC - 0.01, z], [x1, YC - 0.01, z], [x1, YC - 0.01, z + 0.6], [x0, YC - 0.01, z + 0.6]]);
  o.push(`<path d="${pn}" fill="${OF.panel}"/>`);
  o.push(`<path d="${q([[XL, 0, Z0], [XL, YC, Z0], [XL, YC, ZB], [XL, 0, ZB]])}" fill="${S.lin([[0, OF.wallShade], [1, OF.wall]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  o.push(`<path d="${q([[XR, 0, Z0], [XR, YC, Z0], [XR, YC, ZB], [XR, 0, ZB]])}" fill="${S.lin([[0, OF.wallLit], [1, OF.wall]], 'x1="1" y1="0" x2="0" y2="0"')}"/>`);
  // skirting
  o.push(`<path d="${pl(pr.poly([[XL, 0.1, Z0], [XL, 0.1, ZB]]))}${pl(pr.poly([[XR, 0.1, Z0], [XR, 0.1, ZB]]))}" stroke="${OF.wallShade}" stroke-width="4"/>`);
  // carpet
  o.push(`<path d="${q([[XL, 0, Z0], [XR, 0, Z0], [XR, 0, ZB], [XL, 0, ZB]])}" fill="${S.lin(OF.floor, `gradientUnits="userSpaceOnUse" x1="0" y1="${VP[1]}" x2="0" y2="${H}"`)}"/>`);
  let cp = '';
  for (let x = XL + 0.5; x < XR; x += 0.5) cp += pl(pr.poly([[x, 0, Z0 + 0.4], [x, 0, ZB]]));
  for (let z = 1.0; z < ZB; z += 0.5) cp += pl(pr.poly([[XL, 0, z], [XR, 0, z]]));
  o.push(`<path d="${cp}" stroke="${OF.carpetLine}" stroke-width="1" opacity=".35"/>`);
  S.add(o.join(''));
  o.length = 0;

  // sunlight through the windows: skewed patches on the carpet, falling toward the front right (key light upper left)
  let sun = '';
  for (const [x0, x1] of [[-3.6, -2.75], [-2.35, -1.45], [-1.05, -0.15], [0.25, 1.15], [1.55, 2.45]]) {
    sun += q([[x0, 0.002, ZB - 0.05], [x1, 0.002, ZB - 0.05], [x1 + 1.3, 0.002, ZB - 2.6], [x0 + 1.3, 0.002, ZB - 2.6]]);
  }
  S.add(`<path d="${sun}" fill="#fff8e4" opacity=".22" filter="${S.blur(2)}"/>`);

  // ---- whiteboard on the left wall: only lines, boxes and arrows, nothing that reads as writing ------------------------
  {
    const z0 = 3.9, z1 = 6.4, y0 = 1.05, y1 = 2.25, x = XL + 0.02;
    o.push(`<path d="${q([[x, y0 - 0.05, z0 - 0.05], [x, y1 + 0.05, z0 - 0.05], [x, y1 + 0.05, z1 + 0.05], [x, y0 - 0.05, z1 + 0.05]])}" fill="${OF.boardFrame}"/>`);
    o.push(`<path d="${q([[x + 0.01, y0, z0], [x + 0.01, y1, z0], [x + 0.01, y1, z1], [x + 0.01, y0, z1]])}" fill="${OF.board}"/>`);
    const P = (zz, yy) => pr(x + 0.02, yy, zz);
    const bx = (za, zb, ya, yb) => pz([P(za, ya), P(zb, ya), P(zb, yb), P(za, yb)]);
    o.push(`<path d="${bx(4.15, 4.9, 1.65, 2.05)}${bx(5.35, 6.1, 1.65, 2.05)}" fill="none" stroke="${OF.ink[0]}" stroke-width="2.5"/>`);
    o.push(`<path d="${pl([P(4.95, 1.85), P(5.3, 1.85)])}M${pr(x + 0.02, 1.9, 5.22).map(r0).join(',')}L${pr(x + 0.02, 1.85, 5.3).map(r0).join(',')}L${pr(x + 0.02, 1.8, 5.22).map(r0).join(',')}" fill="none" stroke="${OF.ink[3]}" stroke-width="2.2"/>`);
    let wv = '';
    for (const [za, zb, yy] of [[4.2, 5.0, 1.45], [4.2, 4.8, 1.3], [5.4, 6.2, 1.45]]) {
      const pts = [];
      for (let k = 0; k <= 8; k++) { const zz = za + (zb - za) * k / 8; pts.push(P(zz, yy + (k % 2 ? 0.025 : -0.025))); }
      wv += pl(pts);
    }
    o.push(`<path d="${wv}" fill="none" stroke="${OF.ink[2]}" stroke-width="2"/>`);
    o.push(`<path d="${pl([P(5.45, 1.25), P(5.7, 1.32), P(5.9, 1.2), P(6.1, 1.3)])}" fill="none" stroke="${OF.ink[1]}" stroke-width="2.4"/>`);
    // tray with two markers
    o.push(`<path d="${q([[x, y0 - 0.06, z0 + 0.2], [x + 0.08, y0 - 0.06, z0 + 0.2], [x + 0.08, y0 - 0.06, z1 - 0.2], [x, y0 - 0.06, z1 - 0.2]])}" fill="${OF.sill}" stroke="${OF.boardFrame}" stroke-width="1.5"/>`);
    S.add(o.join(''));
    o.length = 0;
  }

  // ---- right wall: a clock with ticks only, a tall plant in the far corner --------------------------------------------
  {
    const c = pr(XR - 0.01, 2.3, 4.9), k = F / 4.9, rr = 0.2 * k;
    let tk = '';
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6, s = Math.sin(a), co = Math.cos(a);
      tk += `M${r0(c[0] + s * rr * 0.42 * 0.82)},${r0(c[1] - co * rr * 0.82)}L${r0(c[0] + s * rr * 0.42 * 0.68)},${r0(c[1] - co * rr * 0.68)}`;
    }
    S.add(`<ellipse cx="${r0(c[0])}" cy="${r0(c[1])}" rx="${r0(rr * 0.42 + 3)}" ry="${r0(rr + 4)}" fill="#3a3f48"/><ellipse cx="${r0(c[0])}" cy="${r0(c[1])}" rx="${r0(rr * 0.42)}" ry="${r0(rr)}" fill="#f6f7f8"/>`
      + `<path d="${tk}" stroke="#3a3f48" stroke-width="2"/><path d="M${r0(c[0])},${r0(c[1])}l${r0(rr * 0.02)},${r0(-rr * 0.64)}M${r0(c[0])},${r0(c[1])}l${r0(-rr * 0.19)},${r0(rr * 0.02)}" stroke="#23272f" stroke-width="3" stroke-linecap="round"/>`);
    // plant
    const p = pr(XR - 0.4, 0, ZB - 0.45), kk = F / (ZB - 0.45);
    let lv = '', lt = '';
    for (let i = 0; i < 11; i++) {
      const a = -Math.PI / 2 + (i - 5) * 0.28 + R.range(-0.08, 0.08), len = kk * R.range(0.55, 0.95);
      const bx0 = p[0], by0 = p[1] - kk * 0.42, ex = bx0 + Math.cos(a) * len, ey = by0 + Math.sin(a) * len;
      const nx = -Math.sin(a) * kk * 0.07, ny = Math.cos(a) * kk * 0.07;
      const leaf = `M${r0(bx0)},${r0(by0)}Q${r0((bx0 + ex) / 2 + nx)},${r0((by0 + ey) / 2 + ny)} ${r0(ex)},${r0(ey)}Q${r0((bx0 + ex) / 2 - nx)},${r0((by0 + ey) / 2 - ny)} ${r0(bx0)},${r0(by0)}Z`;
      if (i < 5) lt += leaf; else lv += leaf;
    }
    S.add(`<path d="${lv}" fill="${OF.leaf}"/><path d="${lt}" fill="${OF.leafLit}"/><path d="M${r0(p[0] - kk * 0.2)},${r0(p[1] - kk * 0.45)}h${r0(kk * 0.4)}l${r0(-kk * 0.05)},${r0(kk * 0.45)}h${r0(-kk * 0.3)}Z" fill="${OF.pot}"/>`);
  }

  // ---- workstations: two clusters along the aisle, drawn far to near ----------------------------------------------------
  // cluster on side s (-1 left / +1 right): a far row against the wall, a partition, the aisle row with screens facing the aisle
  const XP = 2.3, XA = 1.15, XW = 3.5, TOP = 0.75;
  const segs = [[5.0, 6.45], [3.4, 4.85], [1.8, 3.25], [0.2, 1.65]];
  for (const [z0, z1] of segs) {
    for (const s of [-1, 1]) {
      const X = (v) => s * v; // mirror
      const g = [];
      const near = z0;
      // far row monitors peeking above the partition (their backs)
      for (const zc of [z0 + 0.4, z1 - 0.4]) g.push(`<path d="${q([[X(XP + 0.12), 0.95, zc - 0.28], [X(XP + 0.12), 1.32, zc - 0.28], [X(XP + 0.12), 1.32, zc + 0.28], [X(XP + 0.12), 0.95, zc + 0.28]])}" fill="${OF.screenBack}"/>`);
      // partition (face toward the aisle) with a cap
      g.push(`<path d="${q([[X(XP), 0, z0], [X(XP), 1.15, z0], [X(XP), 1.15, z1], [X(XP), 0, z1]])}" fill="${s < 0 ? OF.part : OF.partLit}"/>`);
      g.push(`<path d="${pl(pr.poly([[X(XP), 1.15, z0], [X(XP), 1.15, z1]]))}" stroke="${OF.partCap}" stroke-width="3"/>`);
      // aisle desk: top, aisle-side edge, front edge
      g.push(`<path d="${q([[X(XP), TOP, z0], [X(XA), TOP, z0], [X(XA), TOP, z1], [X(XP), TOP, z1]])}" fill="${OF.top}"/>`);
      g.push(`<path d="${q([[X(XA), TOP, z0], [X(XA), TOP - 0.05, z0], [X(XA), TOP - 0.05, z1], [X(XA), TOP, z1]])}" fill="${OF.topEdge}"/>`);
      g.push(`<path d="${q([[X(XP), TOP, near], [X(XA), TOP, near], [X(XA), TOP - 0.05, near], [X(XP), TOP - 0.05, near]])}" fill="${OF.topEdge}"/>`);
      g.push(`<path d="${q([[X(XA + 0.05), 0, z0 + 0.04], [X(XA + 0.05), TOP - 0.05, z0 + 0.04], [X(XA + 0.11), TOP - 0.05, z0 + 0.04], [X(XA + 0.11), 0, z0 + 0.04]])}${q([[X(XA + 0.05), 0, z1 - 0.06], [X(XA + 0.05), TOP - 0.05, z1 - 0.06], [X(XA + 0.11), TOP - 0.05, z1 - 0.06], [X(XA + 0.11), 0, z1 - 0.06]])}" fill="${OF.leg}"/>`);
      // monitors facing the aisle: bezel, screen (gradient and soft blocks only), stand
      for (const zc of [z0 + 0.4, z1 - 0.4]) {
        const xs = X(XP - 0.14);
        g.push(`<path d="${q([[X(XP - 0.1), TOP, zc - 0.08], [X(XP - 0.1), TOP + 0.12, zc], [X(XP - 0.1), TOP, zc + 0.08]])}" fill="${OF.leg}"/>`);
        g.push(`<path d="${q([[xs, TOP + 0.1, zc - 0.3], [xs, TOP + 0.47, zc - 0.3], [xs, TOP + 0.47, zc + 0.3], [xs, TOP + 0.1, zc + 0.3]])}" fill="${OF.bezel}"/>`);
        const scr = pr.poly([[X(XP - 0.145), TOP + 0.13, zc - 0.27], [X(XP - 0.145), TOP + 0.44, zc - 0.27], [X(XP - 0.145), TOP + 0.44, zc + 0.27], [X(XP - 0.145), TOP + 0.13, zc + 0.27]]);
        g.push(`<path d="${pz(scr)}" fill="${S.lin(OF.screen)}"/>`);
        // two soft panes on the screen (no lines that could read as text)
        const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        const [bl, tl, tr, br] = scr;
        const pane = (u0, u1, v0, v1) => pz([lerp(lerp(bl, br, u0), lerp(tl, tr, u0), v1), lerp(lerp(bl, br, u1), lerp(tl, tr, u1), v1), lerp(lerp(bl, br, u1), lerp(tl, tr, u1), v0), lerp(lerp(bl, br, u0), lerp(tl, tr, u0), v0)]);
        g.push(`<path d="${pane(0.08, 0.5, 0.15, 0.8)}" fill="#ffffff" opacity=".35"/><path d="${pane(0.58, 0.92, 0.45, 0.8)}" fill="${R() < 0.5 ? '#ffd091' : '#b8f0d0'}" opacity=".45"/>`);
      }
      // keyboard
      g.push(`<path d="${q([[X(XP - 0.42), TOP + 0.005, z0 + 0.25], [X(XP - 0.6), TOP + 0.005, z0 + 0.25], [X(XP - 0.6), TOP + 0.005, z0 + 0.6], [X(XP - 0.42), TOP + 0.005, z0 + 0.6]])}" fill="#c8ccd2"/>`);
      // a mug or a document tray on some desks
      if (R() < 0.6) { const m = pr(X(XP - 0.5), TOP, z1 - 0.25), k = F / (z1 - 0.25); g.push(`<rect x="${r0(m[0] - 0.035 * k)}" y="${r0(m[1] - 0.1 * k)}" width="${r0(0.07 * k)}" height="${r0(0.1 * k)}" rx="2" fill="${R() < 0.5 ? '#f2f2ee' : '#e88a6a'}"/>`); }
      // chairs pushed in at the aisle side of each desk, their backs to the aisle (none at the nearest desks: the aisle stays clear)
      if (z0 > 3) for (const zc of [z0 + 0.4, z1 - 0.4]) {
        const xc = XA - 0.3, xb = xc - 0.22; // seat centre; the backrest on the aisle side
        const base = pr(X(xc), 0.01, zc), kb = F / zc;
        g.push(`<ellipse cx="${r0(base[0])}" cy="${r0(base[1])}" rx="${r0(0.24 * kb)}" ry="${r0(0.05 * kb)}" fill="#2a2e36" opacity=".55"/>`);
        g.push(`<path d="${pl([pr(X(xc), 0.44, zc), pr(X(xc), 0.03, zc)])}" stroke="${OF.leg}" stroke-width="${f(Math.max(2, 0.05 * kb), 1)}"/>`);
        g.push(`<path d="${q([[X(xc + 0.2), 0.46, zc - 0.22], [X(xb), 0.46, zc - 0.22], [X(xb), 0.46, zc + 0.22], [X(xc + 0.2), 0.46, zc + 0.22]])}" fill="${OF.chairLit}"/>`);
        g.push(`<path d="${q([[X(xc + 0.2), 0.46, zc - 0.22], [X(xc + 0.2), 0.41, zc - 0.22], [X(xb), 0.41, zc - 0.22], [X(xb), 0.46, zc - 0.22]])}" fill="#23272f"/>`);
        g.push(`<path d="${q([[X(xb), 0.5, zc - 0.21], [X(xb), 0.92, zc - 0.19], [X(xb), 0.92, zc + 0.19], [X(xb), 0.5, zc + 0.21]])}" fill="${OF.chair}"/>`);
      }
      // the far end of the cluster facing us (the wall-side desk front, under the partition)
      g.push(`<path d="${q([[X(XW), TOP, near], [X(XP), TOP, near], [X(XP), 0, near], [X(XW), 0, near]])}" fill="${OF.side}"/>`);
      g.push(`<path d="${q([[X(XW), TOP, near], [X(XP), TOP, near], [X(XP), TOP - 0.05, near], [X(XW), TOP - 0.05, near]])}" fill="${OF.topEdge}"/>`);
      S.add(g.join(''));
    }
  }

  // soft light pooling under the ceiling panels on the aisle
  S.add(`<path d="${q([[-0.9, 0.003, 1.4], [0.9, 0.003, 1.4], [0.9, 0.003, 6.2], [-0.9, 0.003, 6.2]])}" fill="#eef2f8" opacity=".12" filter="${S.blur(3)}"/>`);
  // bottom fade for the dialogue box
  S.add(`<rect y="${H * 0.78}" width="${W}" height="${H * 0.22}" fill="${S.lin([[0, '#1a1e26', 0], [1, '#1a1e26', 0.6]])}"/>`);
  return S.out();
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// if-modern-mall
// ─────────────────────────────────────────────────────────────────────────────────────────────
const ML = {
  floor: [[0, '#dcd2c4'], [1, '#6e6458']], tile: '#b4a998', inlay: '#c8b48a',
  lit: '#efe9df', mid: '#d2cabd', shade: '#a99f92', under: '#cfc7bb', underShade: '#b2a99c',
  fascia: '#e6dfd4', led: '#fff1c4', glass: '#d4eaf0', rail: '#8e939a', frame: '#4a4e56', frameLit: '#62666e',
  sky: [[0, '#b4d4f0'], [1, '#f2e8d6']], roofFrame: '#9aa0a8',
  shop: [[[0, '#fff3dc'], [1, '#e6c898']], [[0, '#e8f4f6'], [1, '#b8d4dc']], [[0, '#fbe6e2'], [1, '#e2b6aa']], [[0, '#f0f0e6'], [1, '#cfcab4']]],
  sign: '#3a3f48', accent: ['#e88a6a', '#7fb2d8', '#9ccf9a', '#e8c46a', '#c49ad8', '#f2a8b8'],
  esc: '#9aa0a8', escLit: '#c4c9d0', escDark: '#6a7078', lamp: '#fff2cc',
};

function mall() {
  const S = new Scene('sbEx010Mall', 'IF·平行现代·商场：午后的商场中庭，玻璃天顶，两侧三层回廊与玻璃店面（店招只有色块，没有字和商标），中庭里两部交错的扶梯，天顶垂下几盏吊灯，抛光地砖上有倒影；没有人', 10102);
  const R = S.R;
  const VP = [800, 470], F = 640, EYE = 1.6;
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const XV = 4.5, XS = 8, ZB = 24, Z0 = 1.2;
  const LV = [[0, 4.1], [4.6, 8.7], [9.2, 13.2]]; // storefront bands per level: [floor, underside of the slab above]
  const ROOF = 13.6;
  const qx = (x, y0, y1, z0, z1) => q([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]]);
  const qy = (y, x0, x1, z0, z1) => q([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]);
  const qz = (z, x0, x1, y0, y1) => q([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]);

  S.add(`<rect width="${W}" height="${H}" fill="${ML.mid}"/>`);

  // ---- glass roof over the void: sky, a few clouds, the frame grid --------------------------------------------------
  {
    const rq = qy(ROOF, -XV, XV, 6, ZB);
    const clip = S.clip(rq);
    const top = pr(0, ROOF, ZB);
    const cc = { shade: '#e6edf4', lit: '#fbfcfd', rim: '#ffffff' };
    S.add(`<g clip-path="${clip}"><rect x="0" y="-10" width="${W}" height="${r0(top[1] + 20)}" fill="${S.lin(ML.sky, 'x1="0" y1="1" x2="0" y2="0"')}"/>`
      + `<g opacity=".7">${cloud(R, 560, 90, 220, 46, cc, { bumps: 6 })}${cloud(R, 900, 40, 180, 38, cc, { bumps: 5 })}</g></g>`);
    let fr = '';
    for (let z = 8; z <= ZB; z += 2) fr += pl(pr.poly([[-XV, ROOF, z], [XV, ROOF, z]]));
    for (const x of [-3, -1.5, 0, 1.5, 3]) fr += pl(pr.poly([[x, ROOF, 6], [x, ROOF, ZB]]));
    S.add(`<path d="${fr}" stroke="${ML.roofFrame}" stroke-width="3" fill="none"/>`);
  }

  // shop front on a plane: the whole bay as a dark frame, the glass inset with a lit interior, shelves, a sign band.
  // pts(u, v) maps bay coordinates (u along the frontage 0..1, v up 0..1) to screen.
  const bay = (pts, pal, accent, shelves = true) => {
    const L = (u, v) => pts(u, v);
    const quad = (u0, u1, v0, v1) => pz([L(u0, v0), L(u1, v0), L(u1, v1), L(u0, v1)]);
    let s = `<path d="${quad(0, 1, 0, 1)}" fill="${ML.frame}"/>`;
    s += `<path d="${quad(0.04, 0.96, 0.02, 0.74)}" fill="${S.lin(pal)}"/>`;
    if (shelves) {
      let sh = '';
      for (const v of [0.22, 0.4, 0.58]) sh += pl([L(0.12, v), L(0.42, v)]) + pl([L(0.6, v), L(0.9, v)]);
      s += `<path d="${sh}" stroke="${ML.frameLit}" stroke-width="2" opacity=".55"/>`;
      let bx = '';
      for (const [u, v, du, dv] of [[0.14, 0.22, 0.08, 0.1], [0.26, 0.4, 0.1, 0.09], [0.66, 0.22, 0.12, 0.08], [0.78, 0.58, 0.08, 0.1], [0.32, 0.58, 0.06, 0.08]]) bx += quad(u, u + du, v, v + dv);
      s += `<path d="${bx}" fill="${accent}" opacity=".55"/>`;
    }
    s += `<path d="${pl([L(0.5, 0.02), L(0.5, 0.74)])}" stroke="${ML.frame}" stroke-width="2.5"/>`;
    s += `<path d="${quad(0.04, 0.96, 0.8, 0.95)}" fill="${ML.sign}"/><path d="${quad(0.38, 0.62, 0.84, 0.91)}" fill="${accent}" opacity=".9"/>`;
    return s;
  };

  // ---- back wall: three levels of shop fronts --------------------------------------------------------------------
  {
    const o = [`<path d="${qz(ZB, -XS, XS, 0, ROOF)}" fill="${ML.mid}"/>`];
    LV.forEach(([y0, y1], li) => {
      for (let i = 0; i < 3; i++) {
        const x0 = -XS + 0.3 + i * (2 * XS - 0.6) / 3, x1 = x0 + (2 * XS - 0.6) / 3 - 0.3;
        o.push(bay((u, v) => pr(x0 + (x1 - x0) * u, y0 + (y1 - y0 - 0.2) * v, ZB - 0.01), ML.shop[(i + li) % 4], ML.accent[(i * 2 + li) % 6], li > 0 || i !== 1));
      }
      if (li > 0) o.push(`<path d="${qz(ZB - 0.02, -XS, XS, y0 - 0.5, y0)}" fill="${ML.fascia}"/><path d="${pl([pr(-XS, y0 - 0.25, ZB - 0.03), pr(XS, y0 - 0.25, ZB - 0.03)])}" stroke="${ML.led}" stroke-width="2"/>`);
    });
    S.add(o.join(''));
  }

  // ---- side walls behind the galleries: shop fronts on every level ------------------------------------------------
  for (const s of [-1, 1]) {
    const o = [];
    LV.forEach(([y0, y1], li) => {
      o.push(`<path d="${qx(s * XS, y0, y1 + 0.5, Z0, ZB)}" fill="${s < 0 ? ML.shade : ML.mid}"/>`);
      for (let z = 4; z < ZB - 0.5; z += 4) {
        const z0 = z + 0.15, z1 = z + 3.85;
        o.push(bay((u, v) => pr(s * (XS - 0.01), y0 + (y1 - y0 - 0.2) * v, s < 0 ? z1 - (z1 - z0) * u : z0 + (z1 - z0) * u), ML.shop[(z / 4 + li + (s > 0 ? 1 : 0)) % 4], ML.accent[(z / 4 * 3 + li * 2 + (s > 0 ? 1 : 0)) % 6]));
      }
    });
    S.add(o.join(''));
  }

  // ---- the floor: polished tiles, an inlaid ring, reflections ------------------------------------------------------
  {
    const o = [`<path d="${qy(0, -XS, XS, Z0, ZB)}" fill="${S.lin(ML.floor, `gradientUnits="userSpaceOnUse" x1="0" y1="${VP[1] + 40}" x2="0" y2="${H}"`)}"/>`];
    let tl = '';
    for (let x = -XS + 1.2; x < XS; x += 1.2) tl += pl(pr.poly([[x, 0, Z0 + 0.6], [x, 0, ZB]]));
    for (let z = 2.4; z < ZB; z *= 1.16) tl += pl(pr.poly([[-XS, 0, z], [XS, 0, z]]));
    o.push(`<path d="${tl}" stroke="${ML.tile}" stroke-width="1.3" opacity=".55"/>`);
    // the ring inlay at the middle of the atrium
    let ring = '';
    for (const rr of [2.2, 1.9]) {
      const pts = [];
      for (let k = 0; k <= 48; k++) { const a = k / 48 * Math.PI * 2; pts.push(pr(Math.cos(a) * rr, 0.002, 11 + Math.sin(a) * rr)); }
      ring += pl(pts) + 'Z';
    }
    o.push(`<path d="${ring}" fill="none" stroke="${ML.inlay}" stroke-width="3" opacity=".8"/>`);
    // reflections: soft vertical streaks under the shop fronts and the light of the roof
    let rf = '';
    for (const s of [-1, 1]) for (let z = 4; z < ZB - 0.5; z += 4) {
      const a = pr(s * (XV + 0.4), 0.003, z + 1.2), b = pr(s * (XV + 0.4), 0.003, z + 2.8);
      const k = F / (z + 2), dy = Math.min(140, k * 0.9);
      rf += `M${r0(a[0])},${r0(a[1])}L${r0(b[0])},${r0(b[1])}L${r0(b[0])},${r0(b[1] + dy * 0.5)}L${r0(a[0])},${r0(a[1] + dy)}Z`;
    }
    o.push(`<path d="${rf}" fill="#fff6e2" opacity=".14" filter="${S.blur(2)}"/>`);
    // sunlight from the roof, falling toward the front right
    o.push(`<path d="${q([[-2.4, 0.003, 19], [1.6, 0.003, 19], [4.2, 0.003, 9], [0.4, 0.003, 9]])}" fill="#fffaf0" opacity=".28" filter="${S.blur(3)}"/>`);
    S.add(o.join(''));
  }

  // ---- galleries: slab undersides with downlights, fascias with a light strip, glass balustrades, handrails --------
  const gallery = (s, zFrom, zTo) => {
    const o = [];
    for (const li of [1, 2]) {
      const yf = LV[li][0], yu = yf - 0.5;
      // underside of the slab (seen from below) and its downlights
      o.push(`<path d="${qy(yu, s * XV, s * XS, zFrom, zTo)}" fill="${s < 0 ? ML.underShade : ML.under}"/>`);
      let dl = '';
      for (let z = Math.ceil(zFrom) + 0.5; z < zTo; z += 2) { const p = pr(s * (XV + 1.6), yu - 0.01, z), k = F / z; dl += `<ellipse cx="${r0(p[0])}" cy="${r0(p[1])}" rx="${f(Math.max(1.5, 0.12 * k), 1)}" ry="${f(Math.max(1, 0.06 * k), 1)}"/>`; }
      o.push(`<g fill="${ML.led}">${dl}</g>`);
      // fascia (faces the void) and its light strip
      o.push(`<path d="${qx(s * XV, yu, yf, zFrom, zTo)}" fill="${ML.fascia}"/>`);
      o.push(`<path d="${pl(pr.poly([[s * XV, yu + 0.08, zFrom], [s * XV, yu + 0.08, zTo]]))}" stroke="${ML.led}" stroke-width="3"/>`);
      // glass balustrade and the handrail on it
      o.push(`<path d="${qx(s * XV, yf, yf + 1.0, zFrom, zTo)}" fill="${ML.glass}" opacity=".35"/>`);
      let posts = '';
      for (let z = Math.ceil(zFrom / 1.5) * 1.5; z < zTo; z += 1.5) posts += pl(pr.poly([[s * XV, yf, z], [s * XV, yf + 1.0, z]]));
      o.push(`<path d="${posts}" stroke="${ML.rail}" stroke-width="1.5" opacity=".7"/>`);
      o.push(`<path d="${pl(pr.poly([[s * XV, yf + 1.02, zFrom], [s * XV, yf + 1.02, zTo]]))}" stroke="${ML.rail}" stroke-width="4" stroke-linecap="round"/>`);
    }
    // the ceiling of the top gallery
    o.push(`<path d="${qy(ROOF, s * XV, s * XS, zFrom, zTo)}" fill="${ML.underShade}"/>`);
    return o.join('');
  };
  // the far stretch first (behind the escalators), then the near stretch over them
  for (const s of [-1, 1]) S.add(gallery(s, 15, ZB));

  // ---- columns ----------------------------------------------------------------------------------------------------
  const column = (s, z) => {
    const x0 = s * (XV - 0.05), x1 = s * (XV + 0.55), w = 0.6;
    return `<path d="${q([[x0, 0, z], [x0, LV[1][0] - 0.5, z], [x0, LV[1][0] - 0.5, z + w], [x0, 0, z + w]])}" fill="${s < 0 ? ML.lit : ML.mid}"/>`
      + `<path d="${q([[x0, 0, z], [x1, 0, z], [x1, LV[1][0] - 0.5, z], [x0, LV[1][0] - 0.5, z]])}" fill="${s < 0 ? ML.mid : ML.lit}"/>`;
  };
  S.add(column(-1, 22) + column(1, 22));

  // ---- two escalators crossing the void ---------------------------------------------------------------------------
  // a run from (xa, ya) to (xb, yb) at depth z: flat landings at both ends, the truss below, glass sides, a handrail on top
  const escalator = (xa, ya, xb, yb, z, flip) => {
    const d = Math.sign(xb - xa), land = 1.0, th = 0.75, gh = 0.95;
    const path = [[xa - d * land, ya], [xa, ya], [xb, yb], [xb + d * land, yb]];
    const top = path.map(([x, y]) => pr(x, y, z)), bot = path.map(([x, y]) => pr(x, y - th, z)).reverse();
    const rail = path.map(([x, y]) => pr(x, y + gh, z));
    const glass = [...path.map(([x, y]) => pr(x, y, z)), ...path.map(([x, y]) => pr(x, y + gh, z)).reverse()];
    let s = `<path d="${pz([...top, ...bot])}" fill="${S.lin([[0, flip ? ML.escLit : ML.esc], [1, ML.escDark]])}"/>`;
    s += `<path d="${pl(top)}" stroke="${ML.escLit}" stroke-width="3" fill="none"/>`;
    s += `<path d="${pz(glass)}" fill="${ML.glass}" opacity=".4"/>`;
    s += `<path d="${pl(rail)}" stroke="#2c2f34" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    // the side seam of the truss
    s += `<path d="${pl(path.map(([x, y]) => pr(x, y - th * 0.45, z)))}" stroke="${ML.escDark}" stroke-width="1.5" fill="none" opacity=".6"/>`;
    return s;
  };
  // the upper one (level 1 right → level 2 left) is farther, drawn first; the lower pair (ground → level 1 right) in front
  S.add(escalator(3.5, LV[1][0], -3.5, LV[2][0], 19.8, true));
  S.add(escalator(-3.0, 0, 3.5, LV[1][0], 16.9, false));
  S.add(escalator(-3.0, 0, 3.5, LV[1][0], 15.6, false));

  // near stretch of the galleries and the near columns
  for (const s of [-1, 1]) S.add(gallery(s, Z0, 15));
  S.add(column(-1, 9) + column(1, 9) + column(-1, 13.6) + column(1, 13.6));

  // ---- pendant lamps hanging from the roof into the void ----------------------------------------------------------
  {
    let cords = '', lamps = '', glow = '';
    for (const [x, z, y] of [[-1.6, 8.5, 8.6], [1.9, 10.5, 9.6], [0.2, 12.5, 7.6], [-2.6, 17, 10.8], [2.8, 21, 11.4], [-0.8, 22.5, 10.2]]) {
      const p = pr(x, y, z), t = pr(x, ROOF, z), k = F / z, rr = 0.3 * k;
      cords += `M${r0(p[0])},${r0(Math.max(-5, t[1]))}V${r0(p[1] - rr)}`;
      lamps += `<circle cx="${r0(p[0])}" cy="${r0(p[1])}" r="${f(rr, 1)}"/>`;
      glow += `<circle cx="${r0(p[0])}" cy="${r0(p[1])}" r="${f(rr * 2.6, 1)}"/>`;
    }
    S.add(`<path d="${cords}" stroke="#5a5e66" stroke-width="1.5"/><g fill="${ML.lamp}" opacity=".35" filter="${S.blur(2)}">${glow}</g><g fill="${ML.lamp}" stroke="#d8c48e" stroke-width="1.5">${lamps}</g>`);
  }

  // a cool sheen down the left (shade side) and the bottom fade for the dialogue box
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#5a6a8a', 0.12], [0.5, '#5a6a8a', 0], [1, '#ffe6b8', 0.06]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<rect y="${H * 0.8}" width="${W}" height="${H * 0.2}" fill="${S.lin([[0, '#2a2420', 0], [1, '#2a2420', 0.55]])}"/>`);
  return S.out();
}

export const ex010Bgs = {
  'if-modern-office': () => office(),
  'if-modern-mall': () => mall(),
};
