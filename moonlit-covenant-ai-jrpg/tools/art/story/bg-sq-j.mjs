// 成长支线的场景背景：verdant-vine-clinic（绿镜城·藤院诊疗所）。
//   verdant-vine-clinic — a small whitewashed sickroom in an old courtyard house of Verdant Mirror City, one-point
//                         perspective: a big arched window on the left wall with living vines pressing against the
//                         glass (green with a little grey, a few leaves of other colours), soft light slanting in from
//                         the upper left onto a wooden bed under the window; a bedside table in the foreground with a
//                         lit lamp and a heavy cup; on the back wall a mirror covered with an old cloth, a medicine
//                         cabinet of small unlabelled bottles with an old brass pulse dial (needle askew), and a
//                         half-open door onto the vine courtyard; a second, empty bed along the right wall; old floor
//                         boards, ceiling beams, a stool. Warm white, grey-green, a touch of amber lamplight — works for
//                         day and evening. No figures, no text.
import { Scene, W, H, f, pz, pl, persp, rng } from './lib.mjs';

const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;

function clinic() {
  const S = new Scene('sbSqJClinic', '绿镜城·藤院诊疗所：刷白的小病室；左墙一扇大拱窗，窗外贴满活藤，柔光斜进来落在窗下的木床上；近处床头小桌上一盏点着的灯与一只杯子；正面墙上一面用旧布盖着的镜子、一个放满无字小瓶的药柜与一台指针歪着的旧脉表、一扇半开通往藤院的门；右墙一张空床；旧木地板、屋梁、一张凳子；不画人，不写字', 26026);
  const R = rng(26027);
  const VP = [800, 468], F = 760, EYE = 1.55;
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const XL = -2.6, XR = 2.6, YC = 3.0, ZN = 0.7, ZE = 5.5;
  const C = {
    deep: '#2a2a26', plaster: '#e6e0d2', plasterLit: '#f4efe2', plasterShade: '#c4bca8', plasterDeep: '#9e9682',
    wood: '#8a6844', woodLit: '#a8845a', woodDark: '#5a4430', floorA: '#9a7a56', floorB: '#7a5c3e',
    sheet: '#f2eee4', sheetShade: '#cfc8b8', blanket: '#8a9a82', blanketShade: '#6e7e68',
    vine: ['#5e7a52', '#6e8a5a', '#4e6a48', '#7a8a6a', '#8a9478'], vineOdd: ['#b89a4a', '#7a6a9a', '#4a8a8a'],
    lamp: '#ffd48a', cloth: '#b8ab92', clothShade: '#948770', brass: '#b8924a',
  };

  S.add(`<rect width="${W}" height="${H}" fill="${C.deep}"/>`);

  // ---- ceiling, walls, floor ------------------------------------------------------------------------------------------
  S.add(`<path d="${q([[XL, YC, ZN], [XR, YC, ZN], [XR, YC, ZE], [XL, YC, ZE]])}" fill="${S.lin([[0, '#a89e88'], [1, '#d4ccb8']])}"/>`);
  S.add(`<path d="${q([[XL, 0, ZN], [XL, 0, ZE], [XL, YC, ZE], [XL, YC, ZN]])}" fill="${S.lin([[0, C.plasterShade], [1, C.plaster]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="${q([[XR, 0, ZN], [XR, 0, ZE], [XR, YC, ZE], [XR, YC, ZN]])}" fill="${S.lin([[0, C.plasterLit], [1, C.plaster]], 'x1="1" y1="0" x2="0" y2="0"')}"/>`);
  S.add(`<path d="${q([[XL, 0, ZE], [XR, 0, ZE], [XR, YC, ZE], [XL, YC, ZE]])}" fill="${S.lin([[0, C.plasterLit], [1, C.plaster]])}"/>`);
  // floor boards running to the back
  S.add(`<path d="${q([[XL, 0, ZN], [XR, 0, ZN], [XR, 0, ZE], [XL, 0, ZE]])}" fill="${S.lin([[0, C.floorA], [1, C.floorB]])}"/>`);
  {
    let j = '';
    for (let x = XL; x <= XR + 0.01; x += 0.32) j += pl([pr(x, 0, ZN), pr(x, 0, ZE)]);
    S.add(`<path d="${j}" stroke="#5e4630" stroke-width="1.6" opacity=".55" fill="none"/>`);
    let k = '';
    for (let x = XL + 0.16; x < XR; x += 0.32) { const z = 1.2 + R.range(0, 3.8); k += pl([pr(x - 0.16, 0, z), pr(x + 0.16, 0, z)]); }
    S.add(`<path d="${k}" stroke="#5e4630" stroke-width="1.2" opacity=".4" fill="none"/>`);
  }
  // skirting along the walls
  for (const X of [XL, XR]) S.add(`<path d="${q([[X, 0, ZN], [X, 0, ZE], [X, 0.14, ZE], [X, 0.14, ZN]])}" fill="${C.woodDark}" opacity=".8"/>`);
  S.add(`<path d="${q([[XL, 0, ZE], [XR, 0, ZE], [XR, 0.14, ZE], [XL, 0.14, ZE]])}" fill="${C.woodDark}" opacity=".8"/>`);
  // ceiling beams
  for (const z of [1.3, 2.4, 3.5, 4.6]) {
    S.add(`<path d="${q([[XL, YC, z], [XR, YC, z], [XR, YC - 0.16, z], [XL, YC - 0.16, z]])}" fill="${C.woodDark}"/><path d="${q([[XL, YC - 0.16, z], [XR, YC - 0.16, z], [XR, YC - 0.16, z + 0.18], [XL, YC - 0.16, z + 0.18]])}" fill="${C.wood}"/>`);
  }

  // ---- back wall: medicine cabinet, covered mirror, half-open door ---------------------------------------------------
  {
    const z = ZE;
    // the half-open door onto the courtyard (right)
    const dx0 = 1.05, dx1 = 1.95, dh = 2.15;
    S.add(`<path d="${q([[dx0, 0, z], [dx1, 0, z], [dx1, dh, z], [dx0, dh, z]])}" fill="${S.lin([[0, '#eef2dc'], [1, '#b8c8a0']])}"/>`);
    // courtyard beyond: vine wall and leaves catching daylight
    {
      let lv = '';
      const Rv = rng(2611);
      for (let i = 0; i < 70; i++) {
        const X = dx0 + Rv() * (dx1 - dx0), Y = Rv() * dh, p = pr(X, Y, z + 0.01), r = 3 + Rv() * 5;
        lv += ell(p[0], p[1], r, r * 0.7);
      }
      S.add(`<path d="${lv}" fill="#7a9a62" opacity=".75"/>`);
      const p0 = pr(dx0, 0, z), p1 = pr(dx1, 0, z);
      S.add(`<path d="M${f1(p0[0])},${f1(p0[1])}L${f1(p1[0])},${f1(p1[1])}l0,-12L${f1(p0[0])},${f1(p0[1] - 12)}Z" fill="#c8c0a0"/>`);
    }
    S.add(`<path d="${q([[dx0 - 0.06, 0, z], [dx0, 0, z], [dx0, dh + 0.06, z], [dx0 - 0.06, dh + 0.06, z]])}${q([[dx1, 0, z], [dx1 + 0.06, 0, z], [dx1 + 0.06, dh + 0.06, z], [dx1, dh + 0.06, z]])}${q([[dx0 - 0.06, dh, z], [dx1 + 0.06, dh, z], [dx1 + 0.06, dh + 0.08, z], [dx0 - 0.06, dh + 0.08, z]])}" fill="${C.woodDark}"/>`);
    // door leaf swung inward toward the right wall
    S.add(`<path d="${q([[dx1, 0, z], [dx1 + 0.55, 0, z - 0.62], [dx1 + 0.55, dh, z - 0.62], [dx1, dh, z]])}" fill="${C.wood}"/>`);
    S.add(`<path d="${q([[dx1 + 0.08, 0.2, z - 0.09], [dx1 + 0.47, 0.2, z - 0.53], [dx1 + 0.47, 1.0, z - 0.53], [dx1 + 0.08, 1.0, z - 0.09]])}${q([[dx1 + 0.08, 1.15, z - 0.09], [dx1 + 0.47, 1.15, z - 0.53], [dx1 + 0.47, 1.95, z - 0.53], [dx1 + 0.08, 1.95, z - 0.09]])}" fill="${C.woodDark}" opacity=".35"/>`);
    // daylight spilling through the door onto the floor
    S.add(`<path d="${q([[dx0, 0.005, z], [dx1, 0.005, z], [dx1 - 0.2, 0.005, z - 1.6], [dx0 - 0.5, 0.005, z - 1.6]])}" fill="#f4f0d0" opacity=".22"/>`);

    // the medicine cabinet (left of centre)
    const cx0 = -1.55, cx1 = -0.75, ch = 2.05, cd = 0.32;
    S.add(`<path d="${q([[cx1, 0, z - cd], [cx1, 0, z], [cx1, ch, z], [cx1, ch, z - cd]])}" fill="${C.woodDark}"/>`);
    S.add(`<path d="${q([[cx0, 0, z - cd], [cx1, 0, z - cd], [cx1, ch, z - cd], [cx0, ch, z - cd]])}" fill="${C.wood}"/>`);
    S.add(`<path d="${q([[cx0 + 0.06, 0.08, z - cd], [cx1 - 0.06, 0.08, z - cd], [cx1 - 0.06, ch - 0.08, z - cd], [cx0 + 0.06, ch - 0.08, z - cd]])}" fill="#4a3826"/>`);
    S.add(`<path d="${q([[cx0 - 0.03, ch, z - cd - 0.03], [cx1 + 0.03, ch, z - cd - 0.03], [cx1 + 0.03, ch, z], [cx0 - 0.03, ch, z]])}" fill="${C.woodLit}"/>`);
    // shelves with rows of small unlabelled bottles
    const shelves = [0.55, 1.0, 1.45];
    let sh = '', bt = '', hl = '';
    const Rb = rng(2612);
    const bcol = ['#5e8a6a', '#7a9a8a', '#a89a6a', '#6a7a9a', '#8aa07a', '#c4b48a'];
    const bottlesByCol = Object.fromEntries(bcol.map((c) => [c, '']));
    for (const y of shelves) {
      sh += q([[cx0 + 0.06, y, z - cd], [cx1 - 0.06, y, z - cd], [cx1 - 0.06, y + 0.035, z - cd], [cx0 + 0.06, y + 0.035, z - cd]]);
      let x = cx0 + 0.1;
      while (x < cx1 - 0.14) {
        const bw = 0.05 + Rb() * 0.04, bh = 0.12 + Rb() * 0.14, p0 = pr(x, y + 0.035, z - cd - 0.02), p1 = pr(x + bw, y + 0.035 + bh, z - cd - 0.02);
        const col = bcol[Math.floor(Rb() * bcol.length)];
        const w = p1[0] - p0[0], hgt = p0[1] - p1[1];
        bottlesByCol[col] += `M${f1(p0[0])},${f1(p0[1])}h${f1(w)}v${f1(-hgt * 0.72)}h${f1(-w * 0.28)}v${f1(-hgt * 0.28)}h${f1(-w * 0.44)}v${f1(hgt * 0.28)}h${f1(-w * 0.28)}Z`;
        hl += `M${f1(p0[0] + w * 0.22)},${f1(p0[1] - hgt * 0.12)}v${f1(-hgt * 0.5)}`;
        x += bw + 0.03 + Rb() * 0.03;
      }
    }
    S.add(`<path d="${sh}" fill="${C.woodLit}"/>`);
    for (const [col, d] of Object.entries(bottlesByCol)) if (d) S.add(`<path d="${d}" fill="${col}" opacity=".92"/>`);
    S.add(`<path d="${hl}" stroke="#ffffff" stroke-width="1.2" opacity=".45"/>`);
    // the old brass pulse dial on top of the cabinet, needle askew
    {
      const p = pr((cx0 + cx1) / 2, ch + 0.2, z - cd / 2), s = F / (z - cd / 2);
      const r = 0.15 * s;
      S.add(`<path d="${q([[cx0 + 0.2, ch, z - cd / 2 - 0.08], [cx1 - 0.2, ch, z - cd / 2 - 0.08], [cx1 - 0.22, ch + 0.06, z - cd / 2 - 0.08], [cx0 + 0.22, ch + 0.06, z - cd / 2 - 0.08]])}" fill="${C.woodDark}"/>`);
      S.add(`<path d="${ell(p[0], p[1], r, r)}" fill="${C.brass}"/><path d="${ell(p[0], p[1], r * 0.8, r * 0.8)}" fill="#f0e6c8"/>`);
      let tk = '';
      for (let i = 0; i <= 8; i++) { const a = Math.PI * (1.15 - i * 0.1625); tk += `M${f1(p[0] + Math.cos(a) * r * 0.62)},${f1(p[1] - Math.sin(a) * r * 0.62)}L${f1(p[0] + Math.cos(a) * r * 0.76)},${f1(p[1] - Math.sin(a) * r * 0.76)}`; }
      S.add(`<path d="${tk}" stroke="#6a5a3a" stroke-width="1.2"/>`);
      const na = Math.PI * 0.3; // tilted well off the scale's centre
      S.add(`<path d="M${f1(p[0])},${f1(p[1])}L${f1(p[0] + Math.cos(na) * r * 0.7)},${f1(p[1] - Math.sin(na) * r * 0.7)}" stroke="#7a2a20" stroke-width="2"/><path d="${ell(p[0], p[1], 2.4, 2.4)}" fill="#4a3a2a"/>`);
    }

    // the covered mirror (centre): an oval frame under an old cloth, the cloth hanging below with soft folds
    {
      const mx = -0.15, my = 1.65, mw = 0.42, mh = 0.62;
      const c = pr(mx, my, z), s = F / z;
      // the frame's rim peeking out at the top
      S.add(`<path d="${ell(c[0], c[1] - mh * s * 0.05, mw * s * 1.04, mh * s * 1.02)}" fill="${C.woodDark}"/>`);
      S.add(`<path d="${pl([pr(mx, my + mh + 0.18, z), pr(mx, my + mh + 0.02, z)])}" stroke="#6a5a48" stroke-width="2"/><path d="${ell(...pr(mx, my + mh + 0.2, z), 3, 3)}" fill="#4a3a2a"/>`);
      // the cloth: thrown over the top, draping past the frame on both sides
      const top = c[1] - mh * s * 0.98, L0 = c[0] - mw * s * 1.25, R0 = c[0] + mw * s * 1.25, bot = c[1] + mh * s * 1.25;
      const cloth = `M${f1(c[0] - mw * s * 0.6)},${f1(top)}Q${f1(c[0])},${f1(top - 10)} ${f1(c[0] + mw * s * 0.6)},${f1(top)}Q${f1(R0 - 4)},${f1(top + 24)} ${f1(R0)},${f1(c[1])}L${f1(R0 + 6)},${f1(bot)}Q${f1(c[0] + mw * s * 0.6)},${f1(bot + 14)} ${f1(c[0] + 6)},${f1(bot - 6)}Q${f1(c[0] - mw * s * 0.5)},${f1(bot + 18)} ${f1(L0 - 4)},${f1(bot + 4)}L${f1(L0)},${f1(c[1])}Q${f1(L0 + 4)},${f1(top + 24)} ${f1(c[0] - mw * s * 0.6)},${f1(top)}Z`;
      S.add(`<path d="${cloth}" fill="${S.lin([[0, C.cloth], [1, C.clothShade]])}"/>`);
      // folds
      S.add(`<path d="M${f1(c[0] - mw * s * 0.5)},${f1(top + 10)}Q${f1(c[0] - mw * s * 0.7)},${f1(c[1])} ${f1(c[0] - mw * s * 0.8)},${f1(bot)}M${f1(c[0] + mw * s * 0.2)},${f1(top + 6)}Q${f1(c[0] + mw * s * 0.35)},${f1(c[1] + 10)} ${f1(c[0] + mw * s * 0.3)},${f1(bot - 4)}M${f1(c[0] + mw * s * 0.8)},${f1(top + 30)}Q${f1(c[0] + mw * s * 1.0)},${f1(c[1] + 20)} ${f1(c[0] + mw * s * 1.05)},${f1(bot)}" fill="none" stroke="${C.clothShade}" stroke-width="3" opacity=".8"/>`);
      S.add(`<path d="M${f1(c[0] - mw * s * 0.6)},${f1(top + 2)}Q${f1(c[0])},${f1(top - 7)} ${f1(c[0] + mw * s * 0.6)},${f1(top + 2)}" fill="none" stroke="#e0d6c0" stroke-width="3" opacity=".8"/>`);
      // a faint shadow of the cloth on the wall
      S.add(`<path d="${cloth}" fill="#000" opacity=".1" transform="translate(7,6)"/>`);
    }
  }

  // ---- left wall: the big arched window with living vines pressed to the glass ---------------------------------------
  const WZ0 = 2.9, WZ1 = 4.5, WY0 = 1.05, WY1 = 2.3, WR = 0.42;
  const winPts = () => {
    const zc = (WZ0 + WZ1) / 2, hw = (WZ1 - WZ0) / 2, pts = [[XL, WY0, WZ0], [XL, WY1, WZ0]];
    for (let i = 1; i < 12; i++) { const t = Math.PI * i / 12; pts.push([XL, WY1 + WR * Math.sin(t), zc - hw * Math.cos(t)]); }
    pts.push([XL, WY1, WZ1], [XL, WY0, WZ1]);
    return pts;
  };
  {
    const w3 = winPts(), w2 = pr.poly(w3);
    S.add(`<path d="${pz(w2)}" fill="${S.lin([[0, '#e8f0d8'], [1, '#c4d4a8']])}"/>`);
    // vines outside: leaf clusters clipped to the window
    const clipW = S.clip(pz(w2));
    const xs = w2.map((p) => p[0]), ys = w2.map((p) => p[1]);
    const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
    const Rv = rng(2613);
    const groups = C.vine.map(() => '');
    let odd = C.vineOdd.map(() => '');
    for (let i = 0; i < 150; i++) {
      const x = bx0 + Rv() * (bx1 - bx0), y = by0 + Rv() * (by1 - by0) * 1.05, r = 6 + Rv() * 9, a = Rv() * 180;
      const leaf = `M${f1(x)},${f1(y)}m${f1(-r)},0q${f1(r)},${f1(-r * 0.9)} ${f1(r * 2)},0q${f1(-r)},${f1(r * 0.9)} ${f1(-r * 2)},0Z`;
      if (Rv() < 0.05) odd[Math.floor(Rv() * odd.length)] += `<path d="${leaf}" transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})"/>`;
      else groups[Math.floor(Rv() * groups.length)] += `<path d="${leaf}" transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})"/>`;
    }
    S.add(`<g clip-path="${clipW}">${groups.map((g, i) => `<g fill="${C.vine[i]}" opacity=".88">${g}</g>`).join('')}${odd.map((g, i) => `<g fill="${C.vineOdd[i]}" opacity=".85">${g}</g>`).join('')}<rect x="${f1(bx0)}" y="${f1(by0)}" width="${f1(bx1 - bx0)}" height="${f1(by1 - by0)}" fill="#f4f6e8" opacity=".18"/></g>`);
    // mullions and the frame
    const m0 = pr(XL, WY0, (WZ0 + WZ1) / 2), m1 = pr(XL, WY1 + WR, (WZ0 + WZ1) / 2), t0 = pr(XL, (WY0 + WY1) / 2 + 0.2, WZ0), t1 = pr(XL, (WY0 + WY1) / 2 + 0.2, WZ1);
    S.add(`<path d="M${f1(m0[0])},${f1(m0[1])}L${f1(m1[0])},${f1(m1[1])}M${f1(t0[0])},${f1(t0[1])}L${f1(t1[0])},${f1(t1[1])}" stroke="${C.woodDark}" stroke-width="5"/>`);
    S.add(`<path d="${pz(w2)}" fill="none" stroke="${C.woodDark}" stroke-width="8"/>`);
    // deep sill
    S.add(`<path d="${q([[XL, WY0, WZ0 - 0.08], [XL, WY0, WZ1 + 0.08], [XL + 0.18, WY0, WZ1 + 0.08], [XL + 0.18, WY0, WZ0 - 0.08]])}" fill="${C.plasterLit}"/><path d="${q([[XL + 0.18, WY0, WZ0 - 0.08], [XL + 0.18, WY0, WZ1 + 0.08], [XL + 0.18, WY0 - 0.06, WZ1 + 0.08], [XL + 0.18, WY0 - 0.06, WZ0 - 0.08]])}" fill="${C.plasterShade}"/>`);
    // a few tendrils that found their way in, trailing down the wall beside the near side of the arch
    let td = '', tl = '';
    for (let k = 0; k < 3; k++) {
      const a = pr(XL, WY1 + WR * (0.55 - k * 0.2), WZ0 + 0.12 + k * 0.05), b = pr(XL, WY1 - 0.35 - k * 0.3, WZ0 - 0.18 - k * 0.1);
      td += `M${f1(a[0])},${f1(a[1])}Q${f1(b[0] - 18)},${f1((a[1] + b[1]) / 2)} ${f1(b[0])},${f1(b[1])}`;
      tl += ell(b[0], b[1] + 4, 6, 8) + ell((a[0] + b[0]) / 2 - 10, (a[1] + b[1]) / 2, 7, 4.5) + ell((a[0] + b[0]) / 2 - 4, (a[1] + b[1]) / 2 + 18, 5, 4);
    }
    S.add(`<path d="${td}" fill="none" stroke="#5e7a4a" stroke-width="2.5"/><path d="${tl}" fill="#6e8a5a"/>`);
  }

  // ---- right wall: the empty second bed --------------------------------------------------------------------------------
  const bed = (x0, x1, zA, zB, { blanketFold = true, headZ = 'B' } = {}) => {
    const bh = 0.52, o = [];
    o.push(`<path d="${q([[x0, 0, zA], [x1, 0, zA], [x1, 0, zB], [x0, 0, zB]])}" fill="#000" opacity=".16"/>`);
    // headboard at the back end
    const hz = headZ === 'B' ? zB : zA;
    o.push(`<path d="${q([[x0, 0, hz], [x1, 0, hz], [x1, 1.0, hz], [x0, 1.0, hz]])}" fill="${C.wood}"/><path d="${q([[x0, 1.0, hz], [x1, 1.0, hz], [x1, 1.0, hz + 0.06], [x0, 1.0, hz + 0.06]])}" fill="${C.woodLit}"/>`);
    // frame side and foot end
    const sideX = x0 + x1 > 0 ? x0 : x1;
    o.push(`<path d="${q([[sideX, 0.2, zA], [sideX, 0.2, zB], [sideX, bh - 0.12, zB], [sideX, bh - 0.12, zA]])}" fill="${C.woodDark}"/>`);
    o.push(`<path d="${q([[x0, 0, zA], [x0 + 0.06, 0, zA], [x0 + 0.06, 0.62, zA], [x0, 0.62, zA]])}${q([[x1 - 0.06, 0, zA], [x1, 0, zA], [x1, 0.62, zA], [x1 - 0.06, 0.62, zA]])}" fill="${C.woodDark}"/>`);
    o.push(`<path d="${q([[x0, 0.2, zA], [x1, 0.2, zA], [x1, bh - 0.1, zA], [x0, bh - 0.1, zA]])}" fill="${C.wood}"/>`);
    // mattress and sheet
    o.push(`<path d="${q([[sideX, bh - 0.12, zA], [sideX, bh - 0.12, zB], [sideX, bh, zB], [sideX, bh, zA]])}" fill="${C.sheetShade}"/>`);
    o.push(`<path d="${q([[x0, bh - 0.12, zA], [x1, bh - 0.12, zA], [x1, bh, zA], [x0, bh, zA]])}" fill="${C.sheetShade}"/>`);
    o.push(`<path d="${q([[x0, bh, zA], [x1, bh, zA], [x1, bh, zB], [x0, bh, zB]])}" fill="${C.sheet}"/>`);
    // pillow at the head end
    const pp = pr((x0 + x1) / 2, bh + 0.07, hz - 0.25), ps = F / (hz - 0.25);
    o.push(`<path d="${ell(pp[0], pp[1], 0.32 * ps, 0.08 * ps)}" fill="#fbf8f0" stroke="${C.sheetShade}" stroke-width="1"/>`);
    // folded blanket at the foot
    if (blanketFold) o.push(`<path d="${q([[x0, bh + 0.03, zA + 0.05], [x1, bh + 0.03, zA + 0.05], [x1, bh + 0.03, zA + 0.55], [x0, bh + 0.03, zA + 0.55]])}" fill="${C.blanket}"/><path d="${q([[x0, bh - 0.06, zA + 0.05], [x1, bh - 0.06, zA + 0.05], [x1, bh + 0.03, zA + 0.05], [x0, bh + 0.03, zA + 0.05]])}" fill="${C.blanketShade}"/>`);
    return o.join('');
  };
  S.add(bed(1.65, 2.55, 2.7, 4.6));

  // ---- left: the bed under the window (rumpled blanket), the stool ---------------------------------------------------
  S.add(bed(-2.55, -1.65, 2.6, 4.6, { blanketFold: false }));
  {
    // a rumpled blanket thrown back over the near half of the bed
    const bh = 0.52, x0 = -2.55, x1 = -1.65;
    const a = pr(x0, bh + 0.05, 2.62), b = pr(x1, bh + 0.08, 2.62), c = pr(x1, bh + 0.1, 3.7), d = pr(x0, bh + 0.06, 3.9);
    S.add(`<path d="M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}Q${f1(c[0] + 10)},${f1((b[1] + c[1]) / 2)} ${f1(c[0])},${f1(c[1])}Q${f1((c[0] + d[0]) / 2)},${f1(c[1] - 14)} ${f1(d[0])},${f1(d[1])}Z" fill="${C.blanket}"/>`);
    const e = pr(x1, bh - 0.08, 2.62), g = pr(x1, bh - 0.06, 3.7);
    S.add(`<path d="M${f1(b[0])},${f1(b[1])}L${f1(e[0])},${f1(e[1] + 30)}Q${f1(g[0] + 8)},${f1(g[1] + 10)} ${f1(c[0])},${f1(c[1])}Z" fill="${C.blanketShade}"/>`);
    S.add(`<path d="M${f1((a[0] + b[0]) / 2)},${f1((a[1] + b[1]) / 2)}Q${f1((b[0] + c[0]) / 2 - 20)},${f1((b[1] + c[1]) / 2)} ${f1((c[0] + d[0]) / 2)},${f1((c[1] + d[1]) / 2 - 4)}" stroke="${C.blanketShade}" stroke-width="3" fill="none"/>`);
  }
  // window light falling across the bed and the floor (soft)
  {
    const dir = [1.1, -1.0, -0.15];
    const toY = ([X, Y, Z], y) => { const t = (Y - y) / -dir[1]; return [X + dir[0] * t, y, Z + dir[2] * t]; };
    const w3 = winPts();
    const onBed = w3.map((p) => toY(p, 0.53)).map(([X, Y, Z]) => [Math.min(X, -1.65), Y, Z]);
    const onFloor = w3.map((p) => toY(p, 0)).map(([X, Y, Z]) => [Math.max(-1.65, X), Y, Z]);
    S.add(`<path d="${pz(pr.poly(onBed))}" fill="#fffbe8" opacity=".22"/>`);
    S.add(`<path d="${pz(pr.poly(onFloor))}" fill="#fff6d8" opacity=".14"/>`);
    // the shaft itself, blurred
    const top = pr.poly(w3), bot = pr.poly(onFloor);
    S.add(`<path d="${pz([top[0], top[Math.floor(top.length / 2)], top[top.length - 1], bot[bot.length - 1], bot[Math.floor(bot.length / 2)], bot[0]])}" fill="#fffbe8" opacity=".09" filter="${S.blur(3)}"/>`);
  }
  // the stool by the window
  {
    const sx = -1.05, sz = 3.3, sy = 0.46;
    S.add(`<path d="${q([[sx - 0.18, 0, sz - 0.18], [sx + 0.18, 0, sz - 0.18], [sx + 0.18, 0, sz + 0.18], [sx - 0.18, 0, sz + 0.18]])}" fill="#000" opacity=".14"/>`);
    let lg = '';
    for (const [dx, dz] of [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]]) lg += pl([pr(sx + dx, 0, sz + dz), pr(sx + dx * 0.85, sy, sz + dz * 0.85)]);
    S.add(`<path d="${lg}" stroke="${C.woodDark}" stroke-width="4"/>`);
    S.add(`<path d="${q([[sx - 0.18, sy, sz - 0.18], [sx + 0.18, sy, sz - 0.18], [sx + 0.18, sy, sz + 0.18], [sx - 0.18, sy, sz + 0.18]])}" fill="${C.woodLit}"/><path d="${q([[sx - 0.18, sy - 0.04, sz - 0.18], [sx + 0.18, sy - 0.04, sz - 0.18], [sx + 0.18, sy, sz - 0.18], [sx - 0.18, sy, sz - 0.18]])}" fill="${C.wood}"/>`);
  }

  // ---- foreground: the bedside table with the lit lamp and the heavy cup --------------------------------------------
  {
    const tx0 = -2.45, tx1 = -1.85, tz0 = 1.95, tz1 = 2.4, ty = 0.68;
    S.add(`<path d="${q([[tx0, 0, tz0], [tx1, 0, tz0], [tx1, 0, tz1], [tx0, 0, tz1]])}" fill="#000" opacity=".2"/>`);
    S.add(`<path d="${pl([pr(tx1 - 0.04, 0, tz0 + 0.04), pr(tx1 - 0.04, ty, tz0 + 0.04)])}${pl([pr(tx1 - 0.04, 0, tz1 - 0.04), pr(tx1 - 0.04, ty, tz1 - 0.04)])}${pl([pr(tx0 + 0.04, 0, tz0 + 0.04), pr(tx0 + 0.04, ty, tz0 + 0.04)])}" stroke="${C.woodDark}" stroke-width="7"/>`);
    S.add(`<path d="${q([[tx0, ty - 0.06, tz0], [tx1, ty - 0.06, tz0], [tx1, ty, tz0], [tx0, ty, tz0]])}${q([[tx1, ty - 0.06, tz0], [tx1, ty - 0.06, tz1], [tx1, ty, tz1], [tx1, ty, tz0]])}" fill="${C.wood}"/>`);
    S.add(`<path d="${q([[tx0, ty, tz0], [tx1, ty, tz0], [tx1, ty, tz1], [tx0, ty, tz1]])}" fill="${C.woodLit}"/>`);
    // the lamp: a glass chimney on a brass base
    const lb = pr(-2.2, ty, 2.25), ls = F / 2.25;
    const glow = pr(-2.2, ty + 0.2, 2.25);
    S.add(`<path d="${ell(glow[0], glow[1], 150, 130)}" fill="${S.rad([[0, C.lamp, 0.55], [0.45, C.lamp, 0.16], [1, C.lamp, 0]])}"/>`);
    S.add(`<path d="${ell(lb[0], lb[1], 0.07 * ls, 0.02 * ls)}" fill="#8a6a34"/><path d="M${f1(lb[0] - 0.05 * ls)},${f1(lb[1])}l${f1(0.02 * ls)},${f1(-0.06 * ls)}h${f1(0.06 * ls)}l${f1(0.02 * ls)},${f1(0.06 * ls)}Z" fill="${C.brass}"/>`);
    const gy = lb[1] - 0.06 * ls;
    S.add(`<path d="M${f1(lb[0] - 0.035 * ls)},${f1(gy)}q${f1(-0.03 * ls)},${f1(-0.09 * ls)} ${f1(0.005 * ls)},${f1(-0.16 * ls)}h${f1(0.06 * ls)}q${f1(0.035 * ls)},${f1(0.07 * ls)} ${f1(0.005 * ls)},${f1(0.16 * ls)}Z" fill="#fff4d0" opacity=".75"/>`);
    S.add(`<path d="${ell(lb[0], gy - 0.07 * ls, 0.012 * ls, 0.03 * ls)}" fill="#fff8e0"/><path d="${ell(lb[0], gy - 0.07 * ls, 0.03 * ls, 0.05 * ls)}" fill="${C.lamp}" opacity=".6" filter="${S.blur(2)}"/>`);
    // the heavy cup: a copper ring at its foot and a lid
    const cp = pr(-1.98, ty, 2.12), cs = F / 2.12;
    S.add(`<path d="M${f1(cp[0] - 0.04 * cs)},${f1(cp[1])}v${f1(-0.09 * cs)}h${f1(0.08 * cs)}v${f1(0.09 * cs)}Z" fill="#d8d0bc"/><path d="M${f1(cp[0] - 0.044 * cs)},${f1(cp[1])}v${f1(-0.022 * cs)}h${f1(0.088 * cs)}v${f1(0.022 * cs)}Z" fill="#b87a44"/><path d="${ell(cp[0], cp[1] - 0.09 * cs, 0.045 * cs, 0.012 * cs)}" fill="#a89a80"/><path d="M${f1(cp[0] + 0.04 * cs)},${f1(cp[1] - 0.07 * cs)}q${f1(0.03 * cs)},${f1(0.015 * cs)} 0,${f1(0.035 * cs)}" fill="none" stroke="#d8d0bc" stroke-width="3"/>`);
  }

  // dust in the window light, and a warm-green overall wash
  {
    let dm = '';
    for (let i = 0; i < 28; i++) { const p = pr(R.range(-2.4, -1.0), R.range(0.6, 2.4), R.range(2.9, 4.6)); dm += ell(p[0], p[1], 1.3, 1.3); }
    S.add(`<path d="${dm}" fill="#ffffff" opacity=".45"/>`);
  }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#1a1a10', 0.08], [1, '#1a1a10', 0.5]], 'cx="0.45" cy="0.5" r="0.8"')}"/>`);
  return S.out();
}

export const sqJBgs = {
  'verdant-vine-clinic': () => clinic(),
};
