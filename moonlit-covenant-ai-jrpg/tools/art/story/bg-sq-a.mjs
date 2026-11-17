// 成长支线的场景背景：fog-harbor-old-bathhouse（雾港·旧浴场·镜厅）、fog-harbor-backstreet-day（雾港·排水区的后街·白天）。
//   fog-harbor-old-bathhouse — inside the old bathhouse of Fog Harbor (ex012). A tiled hall: green-and-white tile wainscot,
//       pale plaster above, three high clerestory windows letting in foggy white daylight. On the back wall a row of five
//       tall wooden-framed mirrors: three still hung over with off-white cloth, two wiped clean — their glass only a pale
//       grey sheen with streaks and steam, reflecting nobody. A sunken stone pool in the middle, its water pale green.
//       On the right a run of wooden changing lockers, one door ajar with the palm-sized mirror inside hung over with a
//       towel. On the left a plank partition (the wall between the two baths) that stops short of the ceiling, steam
//       spilling over its top, a knot-hole at eye height. Wooden stools and buckets, wet floor slabs, two wall lamps,
//       steam everywhere. No figures, no reflections of anyone.
//   fog-harbor-backstreet-day — a back lane of the drainage district by day (ex011). Old wooden houses crowd both sides,
//       plank walls, low doors with small blank name boards beside them, shutters; clotheslines with laundry and a net
//       strung across overhead; along the right a stone-lined drainage ditch holding water with stepping stones across.
//       A few door handles have cloth strips tied to them (blue, grey, washed white); a broken water jar by one door, a
//       crooked net-drying pole by another, a threshold painted red. Overcast grey-green daylight, mist at the far end
//       with masts. No figures, no readable text.
import { Scene, W, H, f, pz, pl, persp } from './lib.mjs';

const r0 = (v) => f(v, 0);
const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;

// ---------------------------------------------------------------------------------------------
// fog-harbor-old-bathhouse
// ---------------------------------------------------------------------------------------------
function oldBathhouse() {
  const S = new Scene('sbSqABath', '雾港·旧浴场·镜厅：青绿与白的瓷砖墙，上面是灰白的灰泥墙和三扇透进雾白天光的高窗；后墙一排木框大镜子，三面还蒙着布，两面擦干净了，镜面只有灰白的反光和蒸汽，照不出任何人；中间是石砌的下沉浴池，水色淡绿；右边一排更衣柜，一格柜门半开，门里巴掌大的小镜子搭着毛巾；左边是一道没顶到天花板的木隔墙，蒸汽从上面翻过来，齐眼高的地方有一个木节的洞；木凳、木桶、湿的石板地、两盏壁灯；满屋蒸汽；没有人', 9101);
  const R = S.R;
  const F = 760;
  const pr = persp({ vp: [800, 410], F, eye: 1.5 });
  const q = (pts) => pr.quad(pts);
  const XL = -3.4, XR = 3.6, YC = 3.6, ZB = 9.4, ZN = 1.1;
  const wall = (X, y0, y1, z0, z1) => q([[X, y0, z0], [X, y1, z0], [X, y1, z1], [X, y0, z1]]);
  const back = (x0, x1, y0, y1, z = ZB) => q([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]);

  S.add(`<rect width="${W}" height="${H}" fill="#2a302e"/>`);
  // ceiling and beams
  S.add(`<path d="${q([[XL, YC, ZN], [XR, YC, ZN], [XR, YC, ZB], [XL, YC, ZB]])}" fill="#3a3a36"/>`);
  {
    let bm = '';
    for (const z of [2.4, 3.9, 5.5, 7.1, 8.7]) bm += q([[XL, YC, z], [XR, YC, z], [XR, YC - 0.18, z], [XL, YC - 0.18, z]]);
    S.add(`<path d="${bm}" fill="#4a4840"/>`);
  }
  // back wall: tile wainscot, plaster above, three clerestory windows
  {
    const ty = 1.3;
    S.add(`<path d="${back(XL, XR, ty, YC)}" fill="${S.lin([[0, '#b8c0b8'], [1, '#d8dcd2']])}"/>`);
    S.add(`<path d="${back(XL, XR, 0, ty)}" fill="#cfe0d8"/>`);
    let tg = '', tl = '';
    const ts = 0.2;
    for (let x = XL, i = 0; x < XR - 0.01; x += ts, i++) for (let y = 0, j = 0; y < ty - 0.01; y += ts, j++) if ((i + j) % 2 === 0) tg += back(x, x + ts, y, y + ts);
    for (let x = XL; x <= XR + 0.01; x += ts) tl += pl([pr(x, 0, ZB), pr(x, ty, ZB)]);
    for (let y = 0; y <= ty + 0.01; y += ts) tl += pl([pr(XL, y, ZB), pr(XR, y, ZB)]);
    S.add(`<path d="${tg}" fill="#6a9a8a" opacity=".8"/><path d="${tl}" stroke="#8aa49a" stroke-width="1" opacity=".7"/>`);
    S.add(`<path d="${back(XL, XR, ty - 0.02, ty + 0.08, ZB - 0.02)}" fill="#3e6a5e"/>`);
    // windows
    for (const cx of [-2.2, 0.1, 2.4]) {
      const w0 = cx - 0.55, w1 = cx + 0.55, y0 = 2.75, y1 = 3.35;
      S.add(`<path d="${back(w0 - 0.06, w1 + 0.06, y0 - 0.06, y1 + 0.04)}" fill="#5a4a38"/><path d="${back(w0, w1, y0, y1)}" fill="${S.lin([[0, '#f4f6f2'], [1, '#d4dcd8']])}"/>`);
      let mu = '';
      for (let x = w0 + 0.275; x < w1 - 0.01; x += 0.275) mu += pl([pr(x, y0, ZB), pr(x, y1, ZB)]);
      mu += pl([pr(w0, (y0 + y1) / 2, ZB), pr(w1, (y0 + y1) / 2, ZB)]);
      S.add(`<path d="${mu}" stroke="#5a4a38" stroke-width="3"/>`);
      // light falling in as a soft shaft
      const [ax, ay] = pr(w0, y0, ZB), [bx] = pr(w1, y0, ZB);
      S.add(`<path d="M${r0(ax)},${r0(ay)}L${r0(bx)},${r0(ay)}L${r0(bx + 150)},${r0(ay + 420)}L${r0(ax + 60)},${r0(ay + 420)}Z" fill="${S.lin([[0, '#fbfcf6', 0.32], [1, '#fbfcf6', 0]])}"/>`);
    }
  }
  // the row of five mirrors on the back wall
  {
    const MW = 0.92, gap = 0.36, y0 = 1.42, y1 = 2.52, z = ZB - 0.04;
    const total = 5 * MW + 4 * gap, x0 = -total / 2 + 0.1;
    const glass = S.lin([[0, '#e2e8e6'], [0.45, '#b4c0c0'], [1, '#8e9c9e']]);
    const cloth = S.lin([[0, '#ece6d8'], [1, '#c8c0ae']], 'x1="0" y1="0" x2="1" y2="0"');
    for (let i = 0; i < 5; i++) {
      const a = x0 + i * (MW + gap), b = a + MW;
      // frame
      S.add(`<path d="${back(a - 0.07, b + 0.07, y0 - 0.07, y1 + 0.1, z)}" fill="#5e4430"/><path d="${back(a - 0.07, b + 0.07, y1 + 0.06, y1 + 0.13, z - 0.01)}" fill="#7a5a40"/>`);
      if (i % 2 === 0) {
        // hung over with cloth: a sheet thrown over the top, falling a little past the bottom, with folds
        const [tlx, tly] = pr(a - 0.1, y1 + 0.14, z - 0.02), [trx] = pr(b + 0.1, y1 + 0.14, z - 0.02);
        const [, bly] = pr(a, y0 - 0.2, z - 0.02);
        const sway = (k) => (R() - 0.5) * k;
        const hem = [];
        for (let t = 0; t <= 1.001; t += 0.125) hem.push([tlx + (trx - tlx) * t + sway(4), bly + Math.sin(t * Math.PI * 3 + i) * 6 + sway(5)]);
        S.add(`<path d="${pz([[tlx, tly], [trx, tly], ...hem.reverse()])}" fill="${cloth}"/>`);
        let fo = '';
        for (const t of [0.22, 0.48, 0.71]) { const x = tlx + (trx - tlx) * (t + sway(0.04)); fo += `M${f1(x)},${f1(tly + 6)}Q${f1(x + sway(10))},${f1((tly + bly) / 2)} ${f1(x + sway(8))},${f1(bly - 2)}`; }
        S.add(`<path d="${fo}" fill="none" stroke="#a89c86" stroke-width="2.2" opacity=".6"/><path d="M${f1(tlx)},${f1(tly)}L${f1(trx)},${f1(tly)}" stroke="#fffaf0" stroke-width="3" opacity=".7"/>`);
      } else {
        // wiped clean: pale glass, diagonal sheen streaks, a fog bloom low down — reflects nobody
        S.add(`<path d="${back(a, b, y0, y1, z - 0.01)}" fill="${glass}"/>`);
        const [gx0, gy1] = pr(a, y1, z), [gx1, gy0] = pr(b, y0, z);
        const w = gx1 - gx0, h = gy0 - gy1;
        S.add(`<path d="M${f1(gx0 + w * 0.15)},${f1(gy1)}l${f1(w * 0.18)},0l${f1(-w * 0.33)},${f1(h * 0.55)}l0,${f1(-h * 0.25)}Z M${f1(gx0 + w * 0.55)},${f1(gy1)}l${f1(w * 0.1)},0l${f1(-w * 0.55)},${f1(h * 0.9)}l0,${f1(-h * 0.14)}Z" fill="#f8fbfa" opacity=".45"/>`);
        S.add(`<path d="${ell(gx0 + w / 2, gy0 - h * 0.12, w * 0.55, h * 0.22)}" fill="#f4f6f2" opacity=".55" filter="${S.blur(3)}"/>`);
      }
    }
    // a little shelf under the mirrors with combs and a jar
    S.add(`<path d="${q([[x0 - 0.1, 1.32, ZB - 0.25], [x0 + total + 0.1, 1.32, ZB - 0.25], [x0 + total + 0.1, 1.32, ZB], [x0 - 0.1, 1.32, ZB]])}" fill="#7a5a40"/><path d="${back(x0 - 0.1, x0 + total + 0.1, 1.27, 1.32, ZB - 0.25)}" fill="#4e3826"/>`);
  }
  // left: the plank partition between the two baths, stopping short of the ceiling, knot-hole at eye height
  {
    const X = XL + 0.25, top = 2.55, za = 2.0, zb = ZB;
    S.add(`<path d="${wall(XL, 0, YC, ZN, ZB)}" fill="#3e3a32"/>`);
    S.add(`<path d="${wall(X, 0, top, za, zb)}" fill="${S.lin([[0, '#5a4636'], [1, '#86684c']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    let pk = '';
    for (let z = za + 0.22; z < zb; z += 0.22) pk += pl([pr(X, 0, z), pr(X, top, z)]);
    S.add(`<path d="${pk}" stroke="#3a2c20" stroke-width="1.6" opacity=".55"/>`);
    S.add(`<path d="${wall(X, top - 0.08, top, za, zb)}" fill="#3a2c20"/><path d="${wall(X, 0.0, 0.12, za, zb)}" fill="#3a2c20" opacity=".6"/>`);
    // the knot-hole
    const [hx, hy] = pr(X, 1.5, 3.4), hs = F / 3.4;
    S.add(`<path d="${ell(hx, hy, 0.022 * hs, 0.032 * hs)}" fill="#1a1410"/><path d="${ell(hx, hy, 0.04 * hs, 0.05 * hs)}" fill="none" stroke="#4a3624" stroke-width="2"/>`);
    // pegs with towels on the partition near us
    for (const z of [3.7, 4.2]) {
      const [px, py] = pr(X + 0.02, 1.85, z), s = F / z;
      S.add(`<path d="${ell(px, py, 0.03 * s, 0.03 * s)}" fill="#2a1e16"/><path d="M${f1(px - 0.03 * s)},${f1(py)}l${f1(0.16 * s)},${f1(0.02 * s)}l${f1(0.02 * s)},${f1(0.55 * s)}l${f1(-0.2 * s)},${f1(-0.03 * s)}Z" fill="#ece6da"/>`);
    }
  }
  // right wall with the run of lockers
  {
    S.add(`<path d="${wall(XR, 0, YC, ZN, ZB)}" fill="${S.lin([[0, '#c8ccc2'], [1, '#9ea49a']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    S.add(`<path d="${wall(XR, 0, 1.0, ZN, ZB)}" fill="#a8c4b8"/>`);
    const X = XR - 0.02, za = 4.0, zb = 8.6, rows = [[0.15, 1.05], [1.1, 2.0]];
    S.add(`<path d="${wall(X, 0.1, 2.06, za - 0.05, zb + 0.05)}" fill="#4a3424"/>`);
    let doors = '', knobs = '', seams = '';
    const n = 8, dz = (zb - za) / n;
    for (const [y0, y1] of rows) for (let k = 0; k < n; k++) {
      const a = za + k * dz + 0.03, b = a + dz - 0.06;
      if (y0 < 0.5 && k === 0) continue; // the ajar door is drawn separately
      doors += wall(X - 0.01, y0 + 0.03, y1 - 0.03, a, b);
      const [kx, ky] = pr(X - 0.02, (y0 + y1) / 2, b - 0.08), ks = F / b;
      knobs += ell(kx, ky, 0.018 * ks, 0.022 * ks);
      seams += pl([pr(X - 0.012, y1 - 0.12, a + 0.05), pr(X - 0.012, y1 - 0.12, b - 0.05)]);
    }
    S.add(`<path d="${doors}" fill="#8a6a4a"/><path d="${seams}" stroke="#5e4430" stroke-width="1.5" opacity=".7"/><path d="${knobs}" fill="#c8a060"/>`);
    // the ajar door: lower row, nearest; swung out toward the room, palm-sized mirror inside with a towel over it
    {
      const a = za + 0.03, b = a + dz - 0.06, y0 = 0.18, y1 = 1.02;
      S.add(`<path d="${wall(X - 0.005, y0, y1, a, b)}" fill="#24180f"/>`);
      const dw = b - a, ang = 0.9, ex = X - Math.sin(ang) * dw, ez = a + Math.cos(ang) * dw;
      S.add(`<path d="${q([[X - 0.01, y0, a], [X - 0.01, y1, a], [ex, y1, ez], [ex, y0, ez]])}" fill="#9a7a56"/>`);
      // inner face mirror + towel
      const m = (t, y) => [X - 0.01 + (ex - X + 0.01) * t, y, a + (ez - a) * t];
      S.add(`<path d="${q([m(0.25, 0.55), m(0.25, 0.85), m(0.75, 0.85), m(0.75, 0.55)])}" fill="#b8c4c4"/>`);
      S.add(`<path d="${q([m(0.18, 0.9), m(0.82, 0.9), m(0.8, 0.5), m(0.2, 0.46)])}" fill="#f2ede2"/><path d="${pl([pr(...m(0.45, 0.88)), pr(...m(0.43, 0.5))])}" stroke="#c4b8a2" stroke-width="2"/>`);
    }
  }
  // floor: wet stone slabs with the window light lying on them
  {
    S.add(`<path d="${q([[XL, 0, ZN], [XR, 0, ZN], [XR, 0, ZB], [XL, 0, ZB]])}" fill="${S.lin([[0, '#8a908c'], [1, '#4a504c']], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(pr(0, 0, ZB)[1])}" x2="0" y2="${H}"`)}"/>`);
    let j = '';
    for (let x = XL + 0.6; x < XR; x += 0.6) j += pl([pr(x, 0, ZN), pr(x, 0, ZB)]);
    for (const z of [1.5, 1.95, 2.5, 3.2, 4.0, 5.0, 6.2, 7.7]) j += pl([pr(XL, 0, z), pr(XR, 0, z)]);
    S.add(`<path d="${j}" stroke="#3a403c" stroke-width="1.5" opacity=".55"/>`);
    S.add(`<path d="${pz([pr(-0.4, 0, 8.6), pr(0.6, 0, 8.6), pr(1.4, 0, 2.2), pr(-0.6, 0, 2.2)])}" fill="${S.lin([[0, '#f6faf4', 0.22], [1, '#f6faf4', 0]])}"/>`);
  }
  // the sunken pool
  {
    const a = -2.0, b = 2.4, za = 4.6, zb = 8.2, ry = 0.14;
    S.add(`<path d="${q([[a - 0.28, ry, za - 0.28], [b + 0.28, ry, za - 0.28], [b + 0.28, ry, zb + 0.28], [a - 0.28, ry, zb + 0.28]])}" fill="#9a9c94"/>`);
    S.add(`<path d="${q([[a - 0.28, 0, za - 0.28], [b + 0.28, 0, za - 0.28], [b + 0.28, ry, za - 0.28], [a - 0.28, ry, za - 0.28]])}" fill="#6a6c66"/>`);
    S.add(`<path d="${q([[a, ry, zb], [b, ry, zb], [b, -0.06, zb], [a, -0.06, zb]])}" fill="#4e6a62"/>`);
    S.add(`<path d="${q([[a, -0.06, za], [b, -0.06, za], [b, -0.06, zb], [a, -0.06, zb]])}" fill="${S.lin([[0, '#5a8e80'], [1, '#9cc4b4']])}"/>`);
    let rp = '';
    for (let k = 0; k < 14; k++) { const z = R.range(za + 0.2, zb - 0.2), x = R.range(a + 0.3, b - 0.6), w = R.range(0.3, 0.8); rp += pl([pr(x, -0.06, z), pr(x + w, -0.06, z)]); }
    S.add(`<path d="${rp}" stroke="#d8eee6" stroke-width="2" opacity=".5" stroke-linecap="round"/>`);
    let rj = '';
    for (let x = a; x <= b + 0.01; x += 0.55) rj += pl([pr(x, ry, za - 0.28), pr(x, ry, za)]);
    S.add(`<path d="${rj}" stroke="#6a6c66" stroke-width="1.5"/>`);
  }
  // wall lamps between the mirrors (lit softly even by day)
  {
    const halo = S.rad([[0, '#ffe6b0', 0.5], [0.35, '#ffd090', 0.18], [1, '#ffd090', 0]]);
    for (const X of [-1.5, 1.7]) {
      const [cx, cy] = pr(X, 2.85, ZB - 0.06), s = F / ZB;
      S.add(`<path d="${ell(cx, cy, 0.8 * s, 0.8 * s)}" fill="${halo}"/><path d="M${f1(cx - 0.07 * s)},${f1(cy - 0.12 * s)}h${f1(0.14 * s)}v${f1(0.2 * s)}h${f1(-0.14 * s)}Z" fill="#ffe0a0" stroke="#2a1e16" stroke-width="1.5"/><path d="M${f1(cx - 0.09 * s)},${f1(cy - 0.12 * s)}l${f1(0.09 * s)},${f1(-0.07 * s)}l${f1(0.09 * s)},${f1(0.07 * s)}Z" fill="#2a1e16"/>`);
    }
  }
  // stools and buckets in front
  {
    const stool = (X, Z, h = 0.32) => {
      const s = F / Z, [cx, cy] = pr(X, h, Z), [, by] = pr(X, 0, Z), w = 0.26 * s;
      return `<path d="M${f1(cx - w)},${f1(cy)}h${f1(w * 2)}v${f1(0.05 * s)}h${f1(-w * 2)}Z" fill="#8a6a48"/><path d="${ell(cx, cy, w, 0.06 * s)}" fill="#a8845c"/><path d="M${f1(cx - w * 0.8)},${f1(cy + 0.05 * s)}L${f1(cx - w * 0.9)},${f1(by)}M${f1(cx + w * 0.8)},${f1(cy + 0.05 * s)}L${f1(cx + w * 0.9)},${f1(by)}" stroke="#5e4430" stroke-width="${f1(0.05 * s)}"/>`;
    };
    const bucket = (X, Z) => {
      const s = F / Z, [cx, by] = pr(X, 0, Z), w = 0.17 * s, h = 0.28 * s;
      return `<path d="M${f1(cx - w)},${f1(by - h)}L${f1(cx - w * 0.82)},${f1(by)}L${f1(cx + w * 0.82)},${f1(by)}L${f1(cx + w)},${f1(by - h)}Z" fill="#9a7a52"/><path d="${ell(cx, by - h, w, 0.05 * s)}" fill="#6a5034"/><path d="M${f1(cx - w * 0.92)},${f1(by - h * 0.65)}L${f1(cx + w * 0.92)},${f1(by - h * 0.65)}M${f1(cx - w * 0.86)},${f1(by - h * 0.22)}L${f1(cx + w * 0.86)},${f1(by - h * 0.22)}" stroke="#4a3624" stroke-width="${f1(0.025 * s)}"/>`;
    };
    S.add(stool(-1.6, 3.4), stool(1.9, 3.0), bucket(-1.1, 3.1), bucket(2.5, 3.7), bucket(-2.3, 4.0));
  }
  // steam: big soft banks, wisps over the pool, steam spilling over the partition top, haze
  {
    const big = S.blur(4), mid = S.blur(3);
    let st = '';
    for (const [x, y, rx, ry] of [[820, 330, 420, 140], [520, 230, 300, 110], [1150, 260, 300, 120], [300, 300, 220, 160], [900, 150, 520, 110], [1300, 460, 220, 110]]) st += ell(x, y, rx, ry);
    S.add(`<path d="${st}" fill="#f2f4ee" opacity=".42" filter="${big}"/>`);
    let ws = '';
    for (let k = 0; k < 14; k++) { const x = R.range(560, 1120), y = R.range(380, 470); ws += ell(x, y - 40, R.range(40, 90), R.range(50, 120)); }
    for (let k = 0; k < 5; k++) { const [px, py] = pr(XL + 0.25, 2.6, R.range(3, 8)); ws += ell(px + 20, py - 10, R.range(40, 80), R.range(30, 60)); }
    S.add(`<path d="${ws}" fill="#f8faf6" opacity=".5" filter="${mid}"/>`);
    S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#eef2ea', 0.4], [0.45, '#eef2ea', 0.16], [0.8, '#eef2ea', 0.05], [1, '#eef2ea', 0.02]])}"/>`);
  }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#141a18', 0], [0.75, '#141a18', 0.1], [1, '#141a18', 0.45]], 'cx="0.5" cy="0.5" r="0.78"')}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// fog-harbor-backstreet-day
// ---------------------------------------------------------------------------------------------
function backstreet() {
  const S = new Scene('sbSqAStreet', '雾港·排水区的后街·白天：两侧挤着旧木屋，木板墙、低矮的门，门边钉着不写字的小门牌，窗上有木板窗；头顶横过几道晾衣绳，挂着衣物和一张渔网；右边是石砌的水沟，积着水，几块踏石横过；有几扇门的把手上系着布条（蓝、灰、洗白了的）；一扇门边有一口破水缸，一家门口立着一根歪了的晾网竿，一家的门槛漆成红色；阴天灰绿的天光，巷尾起雾，看得见远处的桅杆；没有人，没有能读的字', 9201);
  const R = S.R;
  const F = 820;
  const pr = persp({ vp: [800, 420], F, eye: 1.6 });
  const q = (pts) => pr.quad(pts);
  const HW = 2.3, Z0 = 1.3, Z1 = 34, DX0 = 1.05, DX1 = 1.75;
  const wall = (X, y0, y1, z0, z1) => q([[X, y0, z0], [X, y1, z0], [X, y1, z1], [X, y0, z1]]);
  const fogK = (z) => Math.min(1, (z - Z0) / 26);
  const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const mixc = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const FOG = '#c4ccc6';

  // sky + far mist with masts
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#9aa8a4'], [0.5, '#c8d0ca'], [1, '#d4d8d0']], 'gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="460"')}"/>`);
  {
    let m = '';
    for (const [x, h] of [[730, 210], [790, 260], [860, 190], [905, 230]]) m += `M${x},420L${x},${420 - h}M${x - 30},${420 - h * 0.72}L${x + 26},${420 - h * 0.72}`;
    S.add(`<path d="${m}" stroke="#8e9a96" stroke-width="3" opacity=".55"/>`);
    S.add(`<path d="${pz([[600, 440], [600, 380], [1000, 380], [1000, 440]])}" fill="#b0bab4" opacity=".7"/>`);
  }
  // ground: packed earth and flagstones on the left, the stone-lined ditch on the right, a narrow kerb by the right houses
  {
    S.add(`<path d="${q([[-HW, 0, Z0], [-HW, 0, Z1], [DX0, 0, Z1], [DX0, 0, Z0]])}" fill="${S.lin([[0, '#a8a496'], [1, '#6e6a5e']], `gradientUnits="userSpaceOnUse" x1="0" y1="420" x2="0" y2="${H}"`)}"/>`);
    let fl = '';
    for (let z = Z0, row = 0; z < 16; z += 0.55 + z * 0.04, row++) {
      fl += pl([pr(-HW, 0, z), pr(DX0, 0, z)]);
      for (let x = -HW + (row % 2) * 0.4; x < DX0; x += 0.8) fl += pl([pr(x, 0, z), pr(x, 0, z + 0.55 + z * 0.04)]);
    }
    S.add(`<path d="${fl}" stroke="#5a564c" stroke-width="1.3" opacity=".45"/>`);
    // ditch: kerb stones, inner walls, water
    S.add(`<path d="${q([[DX0, 0, Z0], [DX0, 0, Z1], [DX0 + 0.12, 0, Z1], [DX0 + 0.12, 0, Z0]])}" fill="#8a8a80"/>`);
    S.add(`<path d="${q([[DX1 - 0.02, 0, Z0], [DX1 - 0.02, 0, Z1], [HW, 0, Z1], [HW, 0, Z0]])}" fill="#8e8c82"/>`);
    S.add(`<path d="${q([[DX0 + 0.12, -0.45, Z0], [DX0 + 0.12, -0.45, Z1], [DX1 - 0.02, -0.45, Z1], [DX1 - 0.02, -0.45, Z0]])}" fill="${S.lin([[0, '#9aa8a2'], [1, '#4e5e5a']], `gradientUnits="userSpaceOnUse" x1="0" y1="420" x2="0" y2="${H}"`)}"/>`);
    S.add(`<path d="${q([[DX1 - 0.02, 0, Z0], [DX1 - 0.02, 0, Z1], [DX1 - 0.02, -0.45, Z1], [DX1 - 0.02, -0.45, Z0]])}" fill="#5e605a"/>`);
    let dj = '';
    for (let z = Z0; z < 14; z += 0.5) dj += pl([pr(DX1 - 0.02, 0, z), pr(DX1 - 0.02, -0.45, z)]);
    dj += pl([pr(DX1 - 0.02, -0.22, Z0), pr(DX1 - 0.02, -0.22, Z1)]);
    S.add(`<path d="${dj}" stroke="#3e423e" stroke-width="1.2" opacity=".5"/>`);
    let rp = '';
    for (let k = 0; k < 20; k++) { const z = Z0 + 14 * R() ** 1.6, x = R.range(DX0 + 0.18, DX1 - 0.3); rp += pl([pr(x, -0.45, z), pr(x + R.range(0.1, 0.3), -0.45, z)]); }
    S.add(`<path d="${rp}" stroke="#e4ece8" stroke-width="1.6" opacity=".55" stroke-linecap="round"/>`);
    // stepping stones across the ditch
    for (const z of [3.2, 7.4, 13]) {
      S.add(`<path d="${q([[DX0 + 0.08, 0.02, z], [DX1 + 0.02, 0.02, z], [DX1 + 0.02, 0.02, z + 0.42], [DX0 + 0.08, 0.02, z + 0.42]])}" fill="#9c988c"/><path d="${q([[DX0 + 0.08, -0.12, z], [DX1 + 0.02, -0.12, z], [DX1 + 0.02, 0.02, z], [DX0 + 0.08, 0.02, z]])}" fill="#6e6a60"/>`);
    }
    // puddles on the path holding the pale sky
    let pd = '';
    for (const [x, z, w] of [[-0.9, 2.6, 0.7], [0.2, 5.2, 0.5], [-1.5, 9, 0.6], [-0.3, 14, 0.5]]) { const [cx, cy] = pr(x, 0, z), s = F / z; pd += ell(cx, cy, w * s, 0.08 * s); }
    S.add(`<path d="${pd}" fill="#d0d8d4" opacity=".7"/>`);
  }
  // houses along both sides
  const segs = [[Z0, 3.6], [3.6, 6.4], [6.4, 9.8], [9.8, 13.6], [13.6, 18.4], [18.4, 24], [24, Z1]];
  const tones = ['#7a6a58', '#6a5e52', '#86745e', '#5e5650', '#7e6e5c', '#6e6254', '#746656'];
  const details = { L: [], R: [] };
  for (const side of [1, -1]) {
    const X = HW * side, key = side < 0 ? 'L' : 'R';
    for (let i = segs.length - 1; i >= 0; i--) {
      const [za, zb] = segs[i], fk = fogK(za);
      const hh = 3.7 + ((i + (side > 0 ? 1 : 0)) % 2) * 0.22;
      const base = tones[(i + (side > 0 ? 2 : 0)) % tones.length];
      S.add(`<path d="${wall(X, 0, hh, za, zb)}" fill="${mixc(base, FOG, fk * 0.85)}"/>`);
      // planks
      let pk = '';
      for (let y = 0.28; y < hh; y += 0.28) pk += pl([pr(X, y, za), pr(X, y, zb)]);
      S.add(`<path d="${pk}" stroke="${mixc('#3a3028', FOG, fk * 0.8)}" stroke-width="${f1(Math.max(0.8, 14 / za))}" opacity=".5"/>`);
      // corner post at the near edge
      S.add(`<path d="${wall(X, 0, hh, za, za + 0.12)}" fill="${mixc('#3e3228', FOG, fk * 0.8)}"/>`);
      // eave overhang
      S.add(`<path d="${q([[X, hh, za - 0.05], [X - side * 0.6, hh + 0.3, za - 0.05], [X - side * 0.6, hh + 0.3, zb + 0.05], [X, hh, zb + 0.05]])}" fill="${mixc('#2e2824', FOG, fk * 0.85)}"/>`);
      let rf = '';
      for (let z = za + 0.3; z < zb; z += 0.45) rf += pl([pr(X, hh, z), pr(X - side * 0.6, hh + 0.3, z)]);
      S.add(`<path d="${rf}" stroke="${mixc('#4e443a', FOG, fk * 0.85)}" stroke-width="${f1(Math.max(1, 30 / za))}"/><path d="${pl([pr(X - side * 0.6, hh + 0.3, za - 0.05), pr(X - side * 0.6, hh + 0.3, zb + 0.05)])}" stroke="${mixc('#5a4e42', FOG, fk * 0.85)}" stroke-width="${f1(Math.max(1.5, 50 / za))}"/>`);
      // window with shutters on the upper part
      const wa = za + (zb - za) * 0.6, wb = Math.min(zb - 0.15, wa + 0.7);
      S.add(`<path d="${wall(X, 2.2, 2.9, wa, wb)}" fill="${mixc('#2e3232', FOG, fk * 0.7)}"/><path d="${wall(X, 2.2, 2.9, wa - 0.32, wa)}${wall(X, 2.2, 2.9, wb, wb + 0.32)}" fill="${mixc(side < 0 ? '#5e7a72' : '#7a6a4e', FOG, fk * 0.8)}"/>`);
      // door, blank name board beside it
      const da = za + (zb - za) * 0.18, db = da + 0.85;
      S.add(`<path d="${wall(X, 0, 1.85, da, db)}" fill="${mixc('#3a2c22', FOG, fk * 0.75)}"/><path d="${wall(X, 0, 1.85, da, da + 0.06)}" fill="${mixc('#2a2018', FOG, fk * 0.75)}"/>`);
      S.add(`<path d="${wall(X, 1.32, 1.6, db + 0.1, db + 0.42)}" fill="${mixc('#c4b494', FOG, fk * 0.7)}"/>`);
      details[key].push({ X, side, za, zb, da, db, fk });
    }
  }
  // the near doors' props (only on segments close enough to read)
  {
    const strip = (X, side, zh, col, len = 0.38) => {
      const [hx, hy] = pr(X, 1.0, zh), s = F / zh;
      const w = 0.07 * s, L = len * s, sw = side * 0.05 * s;
      return `<path d="${ell(hx, hy, 0.03 * s, 0.03 * s)}" fill="#1e1814"/><path d="M${f1(hx - w * 0.5)},${f1(hy)}Q${f1(hx + sw)},${f1(hy + L * 0.5)} ${f1(hx - w * 0.3 + sw * 1.4)},${f1(hy + L)}L${f1(hx + w * 0.5 + sw * 1.4)},${f1(hy + L * 0.96)}Q${f1(hx + w + sw)},${f1(hy + L * 0.5)} ${f1(hx + w * 0.5)},${f1(hy)}Z" fill="${col}"/><path d="M${f1(hx - w * 0.6)},${f1(hy - 0.02 * s)}l${f1(w * 1.2)},0" stroke="${col}" stroke-width="${f1(0.04 * s)}"/>`;
    };
    const handle = (d) => d.db - 0.12;
    const L = details.L.slice().reverse(), Rr = details.R.slice().reverse(); // nearest first
    // cloth strips: washed white (near left, the broken-jar door), blue (right, crooked pole), grey (far left), blue-grey (right, red threshold)
    S.add(strip(L[0].X + 0.01, -1, handle(L[0]), '#e8e4da'));
    S.add(strip(Rr[1].X - 0.01, 1, handle(Rr[1]), '#4a6a9a'));
    S.add(strip(L[3].X + 0.01, -1, handle(L[3]), mixc('#8a8a86', FOG, L[3].fk * 0.5), 0.34));
    S.add(strip(Rr[2].X - 0.01, 1, handle(Rr[2]), mixc('#5a7aa0', FOG, Rr[2].fk * 0.4), 0.34));
    // the red threshold (right, third door)
    {
      const d = Rr[2];
      S.add(`<path d="${q([[d.X, 0.01, d.da], [d.X - 0.28, 0.01, d.da], [d.X - 0.28, 0.01, d.db], [d.X, 0.01, d.db]])}" fill="${mixc('#a8382c', FOG, d.fk * 0.4)}"/><path d="${q([[d.X - 0.28, 0.01, d.da], [d.X - 0.28, 0.1, d.da], [d.X - 0.28, 0.1, d.db], [d.X - 0.28, 0.01, d.db]])}" fill="${mixc('#c8483a', FOG, d.fk * 0.4)}"/>`);
    }
    // the broken water jar by the nearest left door
    {
      const d = L[0], z = d.db + 0.45, s = F / z, [cx, by] = pr(d.X + 0.38, 0, z);
      const w = 0.3 * s, h = 0.62 * s;
      S.add(`<path d="M${f1(cx - w * 0.6)},${f1(by)}C${f1(cx - w * 1.15)},${f1(by - h * 0.4)} ${f1(cx - w * 0.9)},${f1(by - h * 0.9)} ${f1(cx - w * 0.55)},${f1(by - h)}L${f1(cx + w * 0.1)},${f1(by - h)}L${f1(cx + w * 0.25)},${f1(by - h * 0.78)}L${f1(cx + w * 0.55)},${f1(by - h * 0.86)}C${f1(cx + w * 1.1)},${f1(by - h * 0.5)} ${f1(cx + w * 0.9)},${f1(by - h * 0.15)} ${f1(cx + w * 0.6)},${f1(by)}Z" fill="#8a5a3e"/>`);
      S.add(`<path d="${ell(cx - w * 0.22, by - h, w * 0.36, 0.06 * s)}" fill="#3a2418"/><path d="M${f1(cx - w * 0.2)},${f1(by - h * 0.95)}L${f1(cx)},${f1(by - h * 0.55)}L${f1(cx - w * 0.15)},${f1(by - h * 0.3)}" fill="none" stroke="#3a2418" stroke-width="${f1(0.02 * s)}"/><path d="M${f1(cx - w * 0.8)},${f1(by - h * 0.35)}C${f1(cx - w * 0.7)},${f1(by - h * 0.7)} ${f1(cx - w * 0.6)},${f1(by - h * 0.8)} ${f1(cx - w * 0.45)},${f1(by - h * 0.85)}" stroke="#b07a54" stroke-width="${f1(0.04 * s)}" fill="none"/>`);
      // a shard on the ground
      S.add(`<path d="M${f1(cx + w * 0.9)},${f1(by + 2)}l${f1(w * 0.4)},${f1(-0.04 * s)}l${f1(-w * 0.15)},${f1(-0.1 * s)}Z" fill="#7a4e36"/>`);
    }
    // the crooked net-drying pole by the second right door
    {
      const d = Rr[1], z = d.db + 0.5, [bx, by] = pr(d.X - 0.35, 0, z), [tx, ty] = pr(d.X - 0.85, 3.1, z + 0.3), s = F / z;
      S.add(`<path d="M${f1(bx)},${f1(by)}L${f1(tx)},${f1(ty)}" stroke="#5a4632" stroke-width="${f1(0.06 * s)}" stroke-linecap="round"/>`);
      // a net hung over it
      const [ax, ay] = pr(d.X - 0.6, 2.2, z + 0.15);
      let nt = `M${f1(ax)},${f1(ay)}`;
      for (let k = 1; k <= 6; k++) nt += `L${f1(ax + (tx - ax) * k / 6 + Math.sin(k) * 4)},${f1(ay + (ty - ay) * k / 6)}`;
      S.add(`<path d="${nt}L${f1(tx + 40)},${f1(ty + 160)}L${f1(ax + 30)},${f1(ay + 120)}Z" fill="#6e7a6a" opacity=".55"/>`);
      let mesh = '';
      for (let k = 0; k < 7; k++) mesh += `M${f1(ax + k * 12)},${f1(ay - k * 12)}l${f1(30)},${f1(130)}`;
      S.add(`<path d="${mesh}" stroke="#4a5448" stroke-width="1.2" opacity=".6"/>`);
    }
  }
  // clotheslines across overhead with laundry and a net
  {
    const cols = ['#d8d4c8', '#8aa0b0', '#b8a888', '#9a7a6a', '#c8ccc0', '#6a7e8a', '#e2dccc'];
    for (const [Z, Y, n] of [[19, 4.0, 5], [11, 3.85, 5], [6.2, 3.7, 4], [3.4, 3.55, 3]]) {
      const a = pr(-HW, Y, Z), b = pr(HW, Y, Z), s = F / Z, sag = 0.3 * s;
      const fk = fogK(Z);
      S.add(`<path d="M${r0(a[0])},${r0(a[1])}Q800,${r0(a[1] + sag * 2)} ${r0(b[0])},${r0(b[1])}" fill="none" stroke="${mixc('#2a2a26', FOG, fk * 0.7)}" stroke-width="${f1(Math.max(1, 0.02 * s))}"/>`);
      const yAt = (t) => a[1] + sag * 4 * t * (1 - t) + (b[1] - a[1]) * t;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.6) / (n + 0.4), x = a[0] + (b[0] - a[0]) * t, y = yAt(t);
        const c = mixc(cols[(i * 3 + Math.round(Z)) % cols.length], FOG, fk * 0.75);
        const kind = (i + Math.round(Z)) % 3, w = R.range(0.35, 0.55) * s, h = R.range(0.45, 0.75) * s;
        if (kind === 0) S.add(`<path d="M${f1(x - w / 2)},${f1(y)}L${f1(x + w / 2)},${f1(y)}L${f1(x + w / 2 - 0.04 * s)},${f1(y + h)}Q${f1(x)},${f1(y + h + 0.06 * s)} ${f1(x - w / 2 + 0.03 * s)},${f1(y + h)}Z" fill="${c}"/>`);
        else if (kind === 1) S.add(`<path d="M${f1(x - w * 0.8)},${f1(y)}L${f1(x + w * 0.8)},${f1(y)}L${f1(x + w * 0.8)},${f1(y + h * 0.3)}L${f1(x + w * 0.45)},${f1(y + h * 0.3)}L${f1(x + w * 0.45)},${f1(y + h)}L${f1(x - w * 0.45)},${f1(y + h)}L${f1(x - w * 0.45)},${f1(y + h * 0.3)}L${f1(x - w * 0.8)},${f1(y + h * 0.3)}Z" fill="${c}"/>`);
        else S.add(`<path d="M${f1(x - w * 0.3)},${f1(y)}L${f1(x + w * 0.3)},${f1(y)}L${f1(x + w * 0.34)},${f1(y + h * 1.2)}L${f1(x - w * 0.28)},${f1(y + h * 1.15)}Z" fill="${c}"/>`);
        if (s > 120) S.add(`<path d="M${f1(x - w * 0.3)},${f1(y - 0.03 * s)}l0,${f1(0.07 * s)}M${f1(x + w * 0.3)},${f1(y - 0.03 * s)}l0,${f1(0.07 * s)}" stroke="#4a3a2a" stroke-width="${f1(0.02 * s)}"/>`);
      }
    }
  }
  // mist at the far end, then a gentle overall haze and vignette
  S.add(`<path d="${ell(800, 400, 380, 120)}" fill="#dce2dc" opacity=".7" filter="${S.blur(4)}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#e6ebe6', 0.18], [0.5, '#e6ebe6', 0.08], [1, '#e6ebe6', 0]])}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#1a1e1c', 0], [0.78, '#1a1e1c', 0.08], [1, '#1a1e1c', 0.38]], 'cx="0.5" cy="0.5" r="0.8"')}"/>`);
  return S.out();
}

export const sqABgs = {
  'fog-harbor-old-bathhouse': () => oldBathhouse(),
  'fog-harbor-backstreet-day': () => backstreet(),
};
