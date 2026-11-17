// 番外 ex005 的场景背景（剧本/番外/ex005冬燈夜.md〈美術需求〉）：white-tower-outer-court-winter-lights（白塔·外庭·冬灯夜）、white-tower-outer-court-bathhouse（白塔·外庭浴场·蒸汽）。
//   white-tower-outer-court-winter-lights — the outer court at night, frost on the paving. On the left the long stone wall
//       of the empty house where the party is held, every window lit from inside with a winter lamp on its sill; in front
//       of it a stone balustrade running away from us, a winter lamp on every pier and between them, the nearest one big
//       in the lower-left corner. In the middle distance the frosted fountain and the frost-tide envoy's two tents with
//       lamps at their doors; on the right the heavy northern carriage, frost on its hood and wheels, a lamp on its step.
//       Behind it all the morning gate's wall and the white tower in the night. Cold blue night, warm lamp yellow; frost
//       glitter on the stones. No figures.
//   white-tower-outer-court-bathhouse — inside the old bathhouse on the east side of the outer court: a sunken stone
//       pool of hot water in the middle and right, a tall three-panel wooden screen standing in front of its left end and
//       glowing from a lamp behind it, a wooden rack by the (unseen) door on the left with folded towels and two towels
//       hanging from its rail, more towels on pegs along the right wall, an iron stove glowing orange in the back-right
//       corner with a stack of firewood, wall lamps; the whole room full of steam. No figures.
// No text anywhere.
import { Scene, W, H, f, pz, pl, persp, rng } from './lib.mjs';

const r0 = (v) => f(v, 0);
const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;
const circ = (cx, cy, r) => ell(cx, cy, r, r);

// ---------------------------------------------------------------------------------------------
// A winter lamp: a small square glass lantern with a metal base, a pointed cap and a ring handle, a flame inside and
// a few frost-flower strokes on the glass. (cx, by) = bottom centre on screen, s = pixels per metre at its depth.
// G = shared gradients { halo, glass, pool }.
// ---------------------------------------------------------------------------------------------
function lamp(cx, by, s, G, { pool = true } = {}) {
  const u = (v) => v * s;
  const fy = by - u(0.11);
  let o = `<path d="${circ(cx, fy, u(0.62))}" fill="${G.halo}"/>`;
  if (pool) o += `<path d="${ell(cx, by + u(0.01), u(0.42), u(0.07))}" fill="${G.pool}"/>`;
  o += `<path d="M${f1(cx - u(0.09))},${f1(by)}h${f1(u(0.18))}v${f1(-u(0.028))}h${f1(-u(0.18))}Z" fill="#2a2420"/>`;
  o += `<path d="M${f1(cx - u(0.072))},${f1(by - u(0.028))}h${f1(u(0.144))}v${f1(-u(0.19))}h${f1(-u(0.144))}Z" fill="${G.glass}" stroke="#2a2420" stroke-width="${f1(Math.max(1, u(0.012)))}"/>`;
  o += `<path d="${ell(cx, fy, u(0.02), u(0.042))}" fill="#fffbe6"/>`;
  // frost flower on the upper-left pane
  const fx = cx - u(0.04), fyy = by - u(0.18), k = u(0.026);
  let fr = '';
  for (let a = 0; a < 6; a++) { const t = a * Math.PI / 3; fr += `M${f1(fx)},${f1(fyy)}l${f1(Math.cos(t) * k)},${f1(Math.sin(t) * k)}`; }
  o += `<path d="${fr}" stroke="#f2faff" stroke-width="${f1(Math.max(0.8, u(0.006)))}" opacity=".75"/>`;
  o += `<path d="M${f1(cx - u(0.095))},${f1(by - u(0.218))}h${f1(u(0.19))}l${f1(-u(0.06))},${f1(-u(0.06))}h${f1(-u(0.07))}Z" fill="#3a302a"/>`;
  o += `<path d="${circ(cx, by - u(0.3), u(0.024))}" fill="none" stroke="#3a302a" stroke-width="${f1(Math.max(1, u(0.01)))}"/>`;
  return o;
}

// ---------------------------------------------------------------------------------------------
// 白塔·外庭·冬灯夜
// ---------------------------------------------------------------------------------------------
function winterLights() {
  const S = new Scene('sbEx005Lamps', '白塔·外庭·冬灯夜：结了霜的外庭夜景；左边暂置的空屋，每扇窗台上点着一盏冬灯，屋前的石栏上一盏盏冬灯往远处排；中间远处是结霜的喷泉和霜潮使团门口挂着灯的两顶帐篷；右边一辆北方样式的厚木马车，车篷和车轮上结着霜，踏板上也放着一盏灯；背后是晨门的城墙和夜里的白塔；冷蓝的夜，暖黄的灯，石板上闪着霜；没有人', 5501);
  const R = rng(5502);
  const pr = persp({ vp: [800, 400], F: 820, eye: 1.6 });
  const q = (pts) => pr.quad(pts);
  const G = {
    halo: S.rad([[0, '#ffd88a', 0.6], [0.3, '#ffb860', 0.24], [1, '#ffb860', 0]]),
    glass: S.lin([[0, '#fff0c0'], [1, '#f0a050']]),
    pool: S.rad([[0, '#ffc870', 0.4], [1, '#ffc870', 0]]),
  };

  // sky, stars
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#060a16'], [0.42, '#111a30'], [0.54, '#1c2742'], [1, '#0a0d18']])}"/>`);
  {
    let st = '';
    for (let k = 0; k < 70; k++) st += circ(R.range(0, W), R.range(0, 240), R.range(0.5, 1.5));
    S.add(`<path d="${st}" fill="#e6ecff" opacity=".7"/>`);
  }
  // the white tower far behind, faintly moonlit, a soft cold glow around its top
  {
    const cx = 1010, y0 = -40, y1 = 250, w0 = 40, w1 = 56;
    S.add(`<ellipse cx="${cx}" cy="60" rx="220" ry="200" fill="${S.rad([[0, '#9ab0d8', 0.22], [1, '#9ab0d8', 0]])}"/>`);
    S.add(`<path d="M${cx - w0},${y0}H${cx + w0}L${cx + w1},${y1}H${cx - w1}Z" fill="${S.lin([[0, '#4a5672'], [0.38, '#aab6d0'], [0.7, '#94a2c0'], [1, '#3e4864']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    let d = '';
    for (let y = y0 + 34; y < y1; y += 44) { const t = (y - y0) / (y1 - y0), w = w0 + (w1 - w0) * t; d += `M${f1(cx - w)},${y}H${f1(cx + w)}`; }
    S.add(`<path d="${d}" stroke="#6a7896" stroke-width="2"/>`);
    S.add(`<path d="${circ(cx - 12, 120, 2.5)}${circ(cx + 14, 182, 2.5)}${circ(cx - 4, 228, 2.5)}" fill="#ffd890" opacity=".8"/>`);
  }
  // the morning gate's wall across the back (Z = 16), crenellated, a dark arch; frost along the parapet
  {
    const Z = 16, yT = pr(0, 4.6, Z)[1], yB = pr(0, 0, Z)[1];
    S.add(`<path d="M0,${r0(yB)}V${r0(yT)}H${W}V${r0(yB)}Z" fill="${S.lin([[0, '#2c3448'], [1, '#1a2032']])}"/>`);
    let cr = '';
    for (let x = 0; x < W; x += 52) cr += `M${x},${r0(yT)}v-22h32v22`;
    S.add(`<path d="${cr}" fill="#2c3448"/><path d="M0,${r0(yT)}H${W}${cr}" fill="none" stroke="#8a9ab4" stroke-width="2" opacity=".5"/>`);
    const [ax0] = pr(0.6, 0, Z), [ax1] = pr(2.4, 0, Z), ayT = pr(0, 3, Z)[1];
    S.add(`<path d="M${r0(ax0)},${r0(yB)}V${r0(ayT + 18)}Q${r0((ax0 + ax1) / 2)},${r0(ayT - 26)} ${r0(ax1)},${r0(ayT + 18)}V${r0(yB)}Z" fill="#0c1020"/>`);
    let j = '';
    for (let y = yT + 26; y < yB; y += 28) j += `M0,${r0(y)}H${W}`;
    S.add(`<path d="${j}" stroke="#141a2a" stroke-width="1.4" opacity=".6"/>`);
  }
  // the paving in perspective, frost patches, a low cold mist at the far end
  {
    const yB = pr(0, 0, 16)[1];
    S.add(`<path d="M0,${r0(yB)}H${W}V${H}H0Z" fill="${S.lin([[0, '#2a3246'], [1, '#121826']])}"/>`);
    let d = '';
    for (let x = -14; x <= 14; x += 1.2) d += pl([pr(x, 0, 1.2), pr(x, 0, 16)]);
    for (const z of [1.6, 2.1, 2.7, 3.4, 4.3, 5.4, 6.8, 8.6, 11, 13.6]) d += pl([pr(-30, 0, z), pr(30, 0, z)]);
    S.add(`<path d="${d}" stroke="#0c101c" stroke-width="1.4" opacity=".55"/>`);
    let fr = '';
    for (let k = 0; k < 34; k++) { const y = R.range(yB + 10, H); const s = (y - 400) / 300; fr += ell(R.range(0, W), y, R.range(20, 70) * s, R.range(2, 6) * s); }
    S.add(`<path d="${fr}" fill="#d4e2f2" opacity=".14"/>`);
    S.add(`<rect x="0" y="${r0(yB - 40)}" width="${W}" height="80" fill="${S.lin([[0, '#b8c8e0', 0], [0.5, '#b8c8e0', 0.1], [1, '#b8c8e0', 0]])}"/>`);
  }
  // the envoy's two tents in the middle distance, lamps at their doors
  {
    const tent = (X0, X1, Z, top) => {
      const [x0, yb] = pr(X0, 0, Z), [x1] = pr(X1, 0, Z), [, yt] = pr(0, top, Z), xm = (x0 + x1) / 2, w = x1 - x0;
      let o = `<path d="M${r0(x0)},${r0(yb)}L${r0(xm)},${r0(yt)}L${r0(x1)},${r0(yb)}Z" fill="#3e3a3a"/><path d="M${r0(xm)},${r0(yt)}L${r0(x1)},${r0(yb)}H${r0(xm + w * 0.12)}Z" fill="#2a2628"/>`;
      o += `<path d="M${r0(xm)},${r0(yt + (yb - yt) * 0.25)}L${r0(xm + w * 0.09)},${r0(yb)}H${r0(xm - w * 0.09)}Z" fill="#ffcf80" opacity=".85"/>`;
      o += `<path d="M${r0(x0)},${r0(yb)}L${r0(xm)},${r0(yt)}L${r0(x1)},${r0(yb)}" fill="none" stroke="#a8b8d0" stroke-width="2" opacity=".45"/>`;
      o += lamp(x0 + w * 0.22, yb, 820 / Z, G, { pool: true });
      return o;
    };
    S.add(tent(3.8, 5.8, 13.5, 2.1), tent(1.4, 3.1, 12, 1.9));
  }
  // the fountain, frozen: basin, ice with cracks, the column and its upper dish with icicles
  {
    const Z = 9, X = 0.5, [cx, yb] = pr(X, 0, Z), [, yr] = pr(X, 0.5, Z), rx = 1.2 / Z * 820;
    S.add(`<path d="${ell(cx, yb, rx, 15)}" fill="#1e2434"/><path d="M${f1(cx - rx)},${f1(yb)}V${f1(yr)}H${f1(cx + rx)}V${f1(yb)}Z" fill="${S.lin([[0, '#3a4256'], [0.5, '#5a6478'], [1, '#2e3446']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    S.add(`<path d="${ell(cx, yr, rx + 2, 15)}" fill="#6a7488"/><path d="${ell(cx, yr + 1, rx - 10, 11)}" fill="#3a5068"/>`);
    S.add(`<path d="M${f1(cx - 60)},${f1(yr)}l34,4l20,-6l30,6M${f1(cx + 10)},${f1(yr + 3)}l14,8" fill="none" stroke="#dcecff" stroke-width="1.5" opacity=".8"/>`);
    S.add(`<path d="${ell(cx + 28, yr + 2, 26, 3)}" fill="#ffc870" opacity=".35"/>`);
    const [, yc] = pr(X, 1.55, Z);
    S.add(`<path d="M${f1(cx - 10)},${f1(yr)}V${f1(yc)}h20V${f1(yr)}Z" fill="#545e72"/><path d="${ell(cx, yc, 32, 5)}" fill="#6a7488"/><path d="${ell(cx, yc - 1, 26, 3)}" fill="#3a5068"/>`);
    let ic = '';
    for (let k = 0; k < 7; k++) { const x = cx - 24 + k * 8; ic += `M${f1(x - 2)},${f1(yc + 3)}l2,${f1(R.range(8, 18))}l2,${f1(-R.range(8, 18))}z`; }
    S.add(`<path d="${ic}" fill="#dcecff" opacity=".85"/>`);
  }
  // the northern carriage on the right: wheels, heavy plank body, arched hood edged with frost, a dark empty window,
  // the shaft resting on the ground, a winter lamp on the step
  {
    const Z = 7.2, s = 820 / Z;
    const [x0, yg] = pr(2.6, 0, Z), [x1] = pr(5.6, 0, Z), [, yb] = pr(0, 0.62, Z), [, yt] = pr(0, 1.9, Z), [, yh] = pr(0, 2.75, Z);
    const wheel = (X) => {
      const [cx] = pr(X, 0, Z), r = 0.5 * s, cy = yg - r;
      let sp = '';
      for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5; sp += `M${f1(cx)},${f1(cy)}L${f1(cx + Math.cos(a) * r)},${f1(cy + Math.sin(a) * r)}`; }
      return `<path d="${circ(cx, cy, r)}" fill="none" stroke="#1c1e24" stroke-width="9"/><path d="${sp}" stroke="#2a221c" stroke-width="5"/><path d="${circ(cx, cy, 10)}" fill="#1c1e24"/>`
        + `<path d="M${f1(cx - r * 0.9)},${f1(cy - r * 0.42)}A${f1(r)},${f1(r)} 0 0 1 ${f1(cx + r * 0.9)},${f1(cy - r * 0.42)}" fill="none" stroke="#dce8f6" stroke-width="4" opacity=".85"/>`;
    };
    S.add(`<path d="M${f1(x0)},${f1(yb - 16)}L${f1(x0 - 0.25 * (x1 - x0))},${f1(yg + 30)}" stroke="#2a221c" stroke-width="10"/><path d="M${f1(x0)},${f1(yb - 16)}L${f1(x0 - 0.25 * (x1 - x0))},${f1(yg + 30)}" stroke="#dce8f6" stroke-width="1.5" opacity=".6"/>`);
    S.add(wheel(3.15), wheel(5.05));
    S.add(`<path d="M${f1(x0)},${f1(yb)}V${f1(yt)}H${f1(x1)}V${f1(yb)}Z" fill="${S.lin([[0, '#5a4636'], [1, '#3a2c22']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    let pk = '';
    for (let x = x0 + 30; x < x1; x += 30) pk += `M${f1(x)},${f1(yt)}V${f1(yb)}`;
    S.add(`<path d="${pk}" stroke="#241a14" stroke-width="2" opacity=".6"/><path d="M${f1(x0)},${f1(yb)}H${f1(x1)}v10H${f1(x0)}Z" fill="#241a14"/><path d="M${f1(x0)},${f1(yt)}H${f1(x1)}" stroke="#1c1e24" stroke-width="6"/>`);
    const xm = (x0 + x1) / 2;
    S.add(`<path d="M${f1(x0 - 14)},${f1(yt)}Q${f1(xm)},${f1(yh - (yt - yh) * 0.6)} ${f1(x1 + 14)},${f1(yt)}Z" fill="#3a4050"/><path d="M${f1(x0 - 14)},${f1(yt)}Q${f1(xm)},${f1(yh - (yt - yh) * 0.6)} ${f1(x1 + 14)},${f1(yt)}" fill="none" stroke="#e4eefa" stroke-width="7"/>`);
    S.add(`<path d="M${f1(x0 + 40)},${f1(yt - 30)}Q${f1(xm)},${f1(yh - (yt - yh) * 0.2)} ${f1(x1 - 40)},${f1(yt - 30)}" fill="none" stroke="#565e70" stroke-width="2.5"/>`);
    const wx = x0 + (x1 - x0) * 0.34, wy = yt + 24, ww = (x1 - x0) * 0.26, wh = (yb - yt) * 0.5;
    S.add(`<path d="M${f1(wx)},${f1(wy)}h${f1(ww)}v${f1(wh)}h${f1(-ww)}Z" fill="#141a26" stroke="#241a14" stroke-width="6"/><path d="M${f1(wx)},${f1(wy + wh)}l${f1(ww * 0.3)},0l${f1(-ww * 0.3)},${f1(-wh * 0.35)}ZM${f1(wx + ww)},${f1(wy + wh)}l${f1(-ww * 0.25)},0l${f1(ww * 0.25)},${f1(-wh * 0.3)}Z" fill="#dce8f6" opacity=".5"/>`);
    S.add(`<path d="M${f1(x0)},${f1(yb)}H${f1(x1)}" stroke="#dce8f6" stroke-width="3" opacity=".7"/>`);
    const [sx] = pr(4.1, 0, Z);
    S.add(`<path d="M${f1(sx - 34)},${f1(yb + 10)}h68v9h-68z" fill="#241a14" stroke="#dce8f6" stroke-width="1.5"/>`);
    S.add(lamp(sx, yb + 10, s * 0.9, G, { pool: false }));
  }
  // the empty house: a long stone wall on the left running away from us, its eave and slate roof edged with frost;
  // four lit windows, a winter lamp on every sill
  {
    const X = -3.4, Z0 = 2.6, Z1 = 13, YT = 3.0;
    S.add(`<path d="${q([[X, 0, Z0], [X, YT, Z0], [X, YT, Z1], [X, 0, Z1]])}" fill="${S.lin([[0, '#1e2230'], [0.6, '#323848'], [1, '#2a3040']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    let cs = '';
    for (let y = 0.5; y < YT; y += 0.5) cs += pl([pr(X, y, Z0), pr(X, y, Z1)]);
    for (let z = Z0 + 0.4; z < Z1; z += 0.8) for (let y = 0; y < YT; y += 0.5) { const zz = z + ((y * 2) % 2 ? 0.4 : 0); if (zz < Z1) cs += pl([pr(X, y, zz), pr(X, y + 0.5, zz)]); }
    S.add(`<path d="${cs}" stroke="#141824" stroke-width="1.2" opacity=".55"/>`);
    S.add(`<path d="${q([[X, YT, Z0], [X + 0.32, YT + 0.06, Z0], [X + 0.32, YT + 0.06, Z1], [X, YT, Z1]])}" fill="#141824"/><path d="${q([[X + 0.32, YT + 0.06, Z0], [X - 1.2, YT + 1.3, Z0], [X - 1.2, YT + 1.3, Z1], [X + 0.32, YT + 0.06, Z1]])}" fill="#1a1e2c"/>`);
    S.add(`<path d="${pl([pr(X + 0.32, YT + 0.06, Z0), pr(X + 0.32, YT + 0.06, Z1)])}" stroke="#dce8f6" stroke-width="3" opacity=".75"/>`);
    let ic = '';
    for (let z = 3.2; z < Z1; z += 0.45) { const [x, y] = pr(X + 0.32, YT + 0.06, z), l = 0.12 * 820 / z * R.range(0.4, 1); ic += `M${f1(x - 1.5)},${f1(y)}l1.5,${f1(l)}l1.5,${f1(-l)}z`; }
    S.add(`<path d="${ic}" fill="#dce8f6" opacity=".7"/>`);
    for (const [za, zb] of [[3.9, 4.9], [6.0, 6.8], [8.2, 8.8], [10.4, 10.8]]) {
      const zm = (za + zb) / 2, y0 = 1.0, y1 = 2.2, fr = 0.06;
      S.add(`<path d="${circ(...pr(X, 1.5, zm), 1.3 / zm * 820)}" fill="${S.rad([[0, '#ffb860', 0.28], [1, '#ffb860', 0]])}"/>`);
      S.add(`<path d="${q([[X, y0 - fr, za - fr], [X, y1 + fr, za - fr], [X, y1 + fr, zb + fr], [X, y0 - fr, zb + fr]])}" fill="#241a14"/>`);
      S.add(`<path d="${q([[X, y0, za], [X, y1, za], [X, y1, zb], [X, y0, zb]])}" fill="${S.lin([[0, '#f0b468'], [1, '#9a5a2c']])}"/>`);
      S.add(`<path d="${pl([pr(X, (y0 + y1) / 2, za), pr(X, (y0 + y1) / 2, zb)]) + pl([pr(X, y0, zm), pr(X, y1, zm)])}" stroke="#241a14" stroke-width="${f1(Math.max(2, 0.05 / zm * 820))}"/>`);
      // frost in the lower corners of the panes
      S.add(`<path d="${pz([pr(X, y0, za), pr(X, y0 + 0.28, za), pr(X, y0, za + 0.22)])}${pz([pr(X, y0, zb), pr(X, y0 + 0.22, zb), pr(X, y0, zb - 0.2)])}" fill="#e8f2ff" opacity=".55"/>`);
      S.add(`<path d="${q([[X, y0 - 0.02, za - 0.1], [X + 0.18, y0 - 0.02, za - 0.1], [X + 0.18, y0 - 0.02, zb + 0.1], [X, y0 - 0.02, zb + 0.1]])}" fill="#3a3a44"/><path d="${pl([pr(X + 0.18, y0 - 0.02, za - 0.1), pr(X + 0.18, y0 - 0.02, zb + 0.1)])}" stroke="#dce8f6" stroke-width="1.5" opacity=".7"/>`);
      const [lx, ly] = pr(X + 0.1, y0 - 0.02, zm);
      S.add(lamp(lx, ly, 820 / zm, G, { pool: false }));
    }
  }
  // warm light pooled on the paving along the balustrade
  for (const z of [2.6, 3.6, 4.9, 6.6, 8.8]) { const [x, y] = pr(-1.2, 0, z); S.add(`<path d="${ell(x, y, 1.0 / z * 820, 0.16 / z * 820)}" fill="${G.pool}"/>`); }
  // the stone balustrade in front of the house, running away from us: bottom and top rails, balusters, piers;
  // a winter lamp on every pier and between them on the rail; frost along the top
  {
    const X = -1.75, ZA = 1.25, ZB = 10.4;
    S.add(`<path d="${q([[X + 0.05, 0.05, ZA], [X + 0.05, 0.18, ZA], [X + 0.05, 0.18, ZB], [X + 0.05, 0.05, ZB]])}" fill="#2e3444"/>`);
    let bl = '';
    for (let z = ZA + 0.05; z < ZB; z += 0.22) bl += q([[X, 0.18, z], [X, 0.84, z], [X, 0.84, z + 0.09], [X, 0.18, z + 0.09]]);
    S.add(`<path d="${bl}" fill="#363c4e"/>`);
    S.add(`<path d="${q([[X - 0.1, 0.96, ZA], [X + 0.1, 0.96, ZA], [X + 0.1, 0.96, ZB], [X - 0.1, 0.96, ZB]])}" fill="#545c70"/><path d="${q([[X + 0.1, 0.84, ZA], [X + 0.1, 0.96, ZA], [X + 0.1, 0.96, ZB], [X + 0.1, 0.84, ZB]])}" fill="#3c4356"/>`);
    S.add(`<path d="${pl([pr(X + 0.1, 0.96, ZA), pr(X + 0.1, 0.96, ZB)])}" stroke="#e4eefa" stroke-width="2.5" opacity=".8"/>`);
    const piers = [2.2, 3.6, 5.2, 7.2, 9.6];
    for (const z of piers.slice().reverse()) {
      const a = z - 0.13, b = z + 0.13;
      S.add(`<path d="${q([[X + 0.15, 0, a], [X + 0.15, 1.06, a], [X + 0.15, 1.06, b], [X + 0.15, 0, b]])}" fill="#40485c"/><path d="${q([[X - 0.15, 1.06, a], [X + 0.15, 1.06, a], [X + 0.15, 1.06, b], [X - 0.15, 1.06, b]])}" fill="#5e6678"/>`);
      S.add(`<path d="${pl([pr(X + 0.15, 1.06, a), pr(X + 0.15, 1.06, b)])}" stroke="#e8f2ff" stroke-width="2" opacity=".85"/>`);
    }
    const lamps = [[9.6, 1.06], [8.4, 0.96], [7.2, 1.06], [6.2, 0.96], [5.2, 1.06], [4.4, 0.96], [3.6, 1.06], [2.9, 0.96], [2.2, 1.06]];
    for (const [z, y] of lamps) { const [x, yy] = pr(X, y, z); S.add(lamp(x, yy, 820 / z, G, { pool: false })); }
  }
  // frost glitter on the stones
  {
    let gl = '';
    for (let k = 0; k < 140; k++) { const y = R.range(500, H), x = R.range(0, W); gl += circ(x, y, R.range(0.5, 1.6) * (y - 400) / 300); }
    S.add(`<path d="${gl}" fill="#eef6ff" opacity=".6"/>`);
  }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#05070e', 0], [0.7, '#05070e', 0.12], [1, '#05070e', 0.5]], 'cx="0.5" cy="0.5" r="0.78"')}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 白塔·外庭浴场·蒸汽
// ---------------------------------------------------------------------------------------------
function bathhouse() {
  const S = new Scene('sbEx005Bath', '白塔·外庭浴场·蒸汽：外庭东边的旧浴场里面；中间偏右是石砌的下沉浴池，一池热水；浴池左端前面立着一道三折的高木屏风，后面的灯把它照得发亮；左边门旁的木架上叠着浴巾，横杆上挂着两条；右墙的木钉上也挂着浴巾；右后角是烧得发红的铁炉和一摞柴；墙上几盏灯；满屋蒸汽；没有人', 5511);
  const R = rng(5512);
  const pr = persp({ vp: [800, 400], F: 760, eye: 1.5 });
  const q = (pts) => pr.quad(pts);
  const XL = -2.4, XR = 3.6, YC = 3.2, ZB = 9, ZN = 1.2;
  const halo = S.rad([[0, '#ffe0a0', 0.65], [0.3, '#ffc070', 0.25], [1, '#ffc070', 0]]);
  const wood = S.lin([[0, '#7a5a40'], [1, '#4e3826']], 'x1="0" y1="0" x2="1" y2="0"');
  const towel = (pts, c = '#ece6da', sh = '#b8ae9c') => `<path d="${pz(pts)}" fill="${c}"/><path d="${pz([pts[0], pts[1], [pts[1][0], pts[1][1] + (pts[2][1] - pts[1][1]) * 0.18], [pts[0][0], pts[0][1] + (pts[3][1] - pts[0][1]) * 0.18]])}" fill="${sh}" opacity=".7"/>`;

  S.add(`<rect width="${W}" height="${H}" fill="#2a2420"/>`);
  // ceiling and beams
  S.add(`<path d="${q([[XL, YC, ZN], [XR, YC, ZN], [XR, YC, ZB], [XL, YC, ZB]])}" fill="#2e241c"/>`);
  {
    let bm = '';
    for (const z of [2.6, 4.0, 5.5, 7.0, 8.4]) bm += q([[XL, YC, z], [XR, YC, z], [XR, YC - 0.16, z], [XL, YC - 0.16, z]]);
    S.add(`<path d="${bm}" fill="#46362a"/>`);
  }
  // back wall: stone wainscot, vertical boards above, a high lattice window onto the frosty night
  {
    S.add(`<path d="${q([[XL, 0.9, ZB], [XL, YC, ZB], [XR, YC, ZB], [XR, 0.9, ZB]])}" fill="#5a4432"/><path d="${q([[XL, 0, ZB], [XL, 0.9, ZB], [XR, 0.9, ZB], [XR, 0, ZB]])}" fill="#6e6c6a"/>`);
    let bd = '';
    for (let x = XL + 0.3; x < XR; x += 0.3) bd += pl([pr(x, 0.9, ZB), pr(x, YC, ZB)]);
    for (let x = XL + 0.5; x < XR; x += 0.7) bd += pl([pr(x, 0, ZB), pr(x, 0.45, ZB)]) + pl([pr(x + 0.35, 0.45, ZB), pr(x + 0.35, 0.9, ZB)]);
    bd += pl([pr(XL, 0.45, ZB), pr(XR, 0.45, ZB)]);
    S.add(`<path d="${bd}" stroke="#3a2c20" stroke-width="1.5" opacity=".7"/>`);
    const w0 = -0.2, w1 = 1.4, wy0 = 2.0, wy1 = 2.8;
    S.add(`<path d="${q([[w0 - 0.08, wy0 - 0.08, ZB], [w1 + 0.08, wy0 - 0.08, ZB], [w1 + 0.08, wy1 + 0.08, ZB], [w0 - 0.08, wy1 + 0.08, ZB]])}" fill="#3a2a1e"/><path d="${q([[w0, wy0, ZB], [w1, wy0, ZB], [w1, wy1, ZB], [w0, wy1, ZB]])}" fill="${S.lin([[0, '#1a2440'], [1, '#2e3c5a']])}"/>`);
    let lt = '';
    for (let x = w0 + 0.2; x < w1; x += 0.2) lt += pl([pr(x, wy0, ZB), pr(x, wy1, ZB)]);
    for (let y = wy0 + 0.2; y < wy1; y += 0.2) lt += pl([pr(w0, y, ZB), pr(w1, y, ZB)]);
    S.add(`<path d="${lt}" stroke="#3a2a1e" stroke-width="3"/><path d="${pz([pr(w0, wy0, ZB), pr(w0 + 0.4, wy0, ZB), pr(w0, wy0 + 0.3, ZB)])}${pz([pr(w1, wy0, ZB), pr(w1 - 0.5, wy0, ZB), pr(w1, wy0 + 0.25, ZB)])}" fill="#dce8f6" opacity=".5"/>`);
  }
  // left wall: boards; the towel rack by the door — two shelves of folded towels, a rail with two towels hanging
  {
    S.add(`<path d="${q([[XL, 0, ZN], [XL, YC, ZN], [XL, YC, ZB], [XL, 0, ZB]])}" fill="${S.lin([[0, '#3a2a1e'], [1, '#5e4634']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    let bd = '';
    for (let y = 0.25; y < YC; y += 0.25) bd += pl([pr(XL, y, 2.2), pr(XL, y, ZB)]);
    S.add(`<path d="${bd}" stroke="#2a1e16" stroke-width="1.2" opacity=".6"/>`);
    const za = 2.45, zb = 3.5;
    // uprights and shelves
    let up = '';
    for (const z of [za, zb]) up += q([[XL + 0.02, 0, z], [XL + 0.02, 2.0, z], [XL + 0.02, 2.0, z + 0.06], [XL + 0.02, 0, z + 0.06]]);
    S.add(`<path d="${up}" fill="#3a2a1e"/>`);
    for (const y of [0.6, 1.2]) {
      S.add(`<path d="${q([[XL, y, za], [XL + 0.42, y, za], [XL + 0.42, y, zb + 0.06], [XL, y, zb + 0.06]])}" fill="#6a4c36"/><path d="${q([[XL + 0.42, y - 0.05, za], [XL + 0.42, y, za], [XL + 0.42, y, zb + 0.06], [XL + 0.42, y - 0.05, zb + 0.06]])}" fill="#4a3424"/>`);
      // stacks of folded towels on the shelf
      let k = 0;
      for (let z = za + 0.08; z < zb - 0.15; z += 0.34) {
        const c = ['#f2ede2', '#d8e2e6', '#ece2d0'][k++ % 3], n = 4 - (k % 2), top = y + n * 0.075, xf = XL + 0.36, zt = z + 0.27;
        S.add(`<path d="${q([[xf, y, z], [xf, top, z], [xf, top, zt], [xf, y, zt]])}" fill="${c}"/><path d="${pl([pr(xf, top, z), pr(xf, top, zt)])}" stroke="#fffdf8" stroke-width="2"/>`);
        let ln = '';
        for (let i = 1; i < n; i++) ln += pl([pr(xf, y + i * 0.075, z), pr(xf, y + i * 0.075, zt)]);
        S.add(`<path d="${ln}" stroke="#a89c86" stroke-width="1.2" opacity=".55"/>`);
      }
    }
    S.add(`<path d="${pl([pr(XL + 0.3, 1.9, za), pr(XL + 0.3, 1.9, zb + 0.06)])}" stroke="#2a1e16" stroke-width="6"/>`);
    for (const [z0, z1, c] of [[za + 0.12, za + 0.48, '#f2ede2'], [za + 0.6, za + 0.92, '#d8e2e6']]) {
      S.add(towel([pr(XL + 0.3, 1.9, z0), pr(XL + 0.3, 1.9, z1), pr(XL + 0.3, 1.32, z1 - 0.02), pr(XL + 0.3, 1.36, z0 + 0.02)], c));
    }
  }
  // right wall: boards, pegs with towels
  {
    S.add(`<path d="${q([[XR, 0, 2.2], [XR, YC, 2.2], [XR, YC, ZB], [XR, 0, ZB]])}" fill="${S.lin([[0, '#5e4634'], [1, '#3a2a1e']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    let bd = '';
    for (let y = 0.25; y < YC; y += 0.25) bd += pl([pr(XR, y, 3.4), pr(XR, y, ZB)]);
    S.add(`<path d="${bd}" stroke="#2a1e16" stroke-width="1.2" opacity=".6"/>`);
    for (const [z, c] of [[4.7, '#f2ede2'], [5.5, '#e2dccf'], [6.3, '#d8e2e6']]) {
      S.add(`<path d="${circ(...pr(XR - 0.02, 2.05, z), 3)}" fill="#2a1e16"/>`);
      S.add(towel([pr(XR - 0.03, 2.05, z - 0.22), pr(XR - 0.03, 2.05, z + 0.22), pr(XR - 0.03, 1.2, z + 0.2), pr(XR - 0.03, 1.24, z - 0.2)], c));
    }
  }
  // floor: wet stone slabs with a sheen
  {
    S.add(`<path d="${q([[XL, 0, ZN], [XR, 0, ZN], [XR, 0, ZB], [XL, 0, ZB]])}" fill="${S.lin([[0, '#5a5856'], [1, '#2e2c2a']], `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(pr(0, 0, ZB)[1])}" x2="0" y2="${H}"`)}"/>`);
    let j = '';
    for (let x = XL + 0.6; x < XR; x += 0.6) j += pl([pr(x, 0, ZN), pr(x, 0, ZB)]);
    for (const z of [1.6, 2.1, 2.7, 3.4, 4.2, 5.2, 6.4, 7.8]) j += pl([pr(XL, 0, z), pr(XR, 0, z)]);
    S.add(`<path d="${j}" stroke="#22201e" stroke-width="1.5" opacity=".6"/>`);
    // wet sheen: the stove's and the lamps' light lying on the stones as long soft streaks toward us
    S.add(`<path d="${pz([pr(2.8, 0, 7.6), pr(3.1, 0, 7.6), pr(3.3, 0, 2.6), pr(2.5, 0, 2.6)])}" fill="${S.lin([[0, '#ffb870', 0.22], [1, '#ffb870', 0]])}"/>`);
  }
  // the stove in the back-right corner: an iron box with a glowing mouth, a pipe up into the ceiling; firewood beside it
  {
    const a = 2.5, b = 3.4, za = 7.9, zb = 8.8, h = 1.1;
    S.add(`<path d="${circ(...pr((a + b) / 2, 0.5, za), 1.6 / za * 760)}" fill="${S.rad([[0, '#ff9a40', 0.45], [1, '#ff9a40', 0]])}"/>`);
    S.add(`<path d="${q([[a, 0, za], [a, h, za], [b, h, za], [b, 0, za]])}" fill="#2a2624"/><path d="${q([[a, 0, za], [a, h, za], [a, h, zb], [a, 0, zb]])}" fill="#1e1a18"/><path d="${q([[a, h, za], [b, h, za], [b, h, zb], [a, h, zb]])}" fill="#3a3430"/>`);
    S.add(`<path d="${q([[a + 0.22, 0.2, za - 0.01], [a + 0.22, 0.62, za - 0.01], [b - 0.22, 0.62, za - 0.01], [b - 0.22, 0.2, za - 0.01]])}" fill="${S.lin([[0, '#ffe080'], [0.5, '#ff9a30'], [1, '#c84a18']])}"/>`);
    const pc = (a + b) / 2, pz0 = (za + zb) / 2;
    S.add(`<path d="${q([[pc - 0.12, h, pz0], [pc - 0.12, YC, pz0], [pc + 0.12, YC, pz0], [pc + 0.12, h, pz0]])}" fill="#242020"/>`);
    let lg = '', le = '';
    for (let k = 0; k < 9; k++) {
      const row = Math.floor(k / 3), col = k % 3, z = zb - 0.1, x = 1.75 + col * 0.24 + (row % 2) * 0.12, y = 0.12 + row * 0.22;
      const [cx, cy] = pr(x, y, z - 0.6), r = 0.11 / (z - 0.6) * 760;
      lg += circ(cx, cy, r); le += circ(cx, cy, r * 0.55);
    }
    S.add(`<path d="${lg}" fill="#6a4a30"/><path d="${le}" fill="#a07a50" opacity=".7"/>`);
  }
  // the sunken pool: stone rim, the inner far wall, hot water with lamp reflections and steam lifting off it
  {
    const a = -1.8, b = 3.0, za = 4.8, zb = 7.8, ry = 0.12;
    S.add(`<path d="${q([[a - 0.25, ry, za - 0.25], [b + 0.25, ry, za - 0.25], [b + 0.25, ry, zb + 0.25], [a - 0.25, ry, zb + 0.25]])}" fill="#8a8680"/>`);
    S.add(`<path d="${q([[a - 0.25, 0, za - 0.25], [b + 0.25, 0, za - 0.25], [b + 0.25, ry, za - 0.25], [a - 0.25, ry, za - 0.25]])}" fill="#5e5a56"/>`);
    S.add(`<path d="${q([[a, ry, zb], [b, ry, zb], [b, -0.05, zb], [a, -0.05, zb]])}" fill="#4a4844"/>`);
    S.add(`<path d="${q([[a, -0.05, za], [b, -0.05, za], [b, -0.05, zb], [a, -0.05, zb]])}" fill="${S.lin([[0, '#3a7a84'], [1, '#6ab0b4']])}"/>`);
    let rp = '';
    for (let k = 0; k < 14; k++) { const z = R.range(za + 0.2, zb - 0.2), x = R.range(a + 0.3, b - 0.5), w = R.range(0.3, 0.8); rp += pl([pr(x, -0.05, z), pr(x + w, -0.05, z)]); }
    S.add(`<path d="${rp}" stroke="#bfe6e6" stroke-width="2" opacity=".5" stroke-linecap="round"/>`);
    S.add(`<path d="${pz([pr(0.3, -0.05, za + 0.2), pr(0.8, -0.05, za + 0.2), pr(0.75, -0.05, zb - 0.1), pr(0.45, -0.05, zb - 0.1)])}" fill="#ffd890" opacity=".22"/>`);
    let rj = '';
    for (let x = a; x <= b + 0.01; x += 0.6) rj += pl([pr(x, ry, za - 0.25), pr(x, ry, za)]);
    S.add(`<path d="${rj}" stroke="#5e5a56" stroke-width="1.5"/>`);
  }
  // wall lamps: two on the back wall, one on the right wall, one behind the screen on the left wall
  const wallLamp = (X, Y, Z, side = 0) => {
    const [cx, cy] = pr(X, Y, Z), s = 760 / Z;
    return `<path d="${circ(cx, cy, 0.9 * s)}" fill="${halo}"/><path d="M${f1(cx - 0.07 * s)},${f1(cy - 0.12 * s)}h${f1(0.14 * s)}v${f1(0.2 * s)}h${f1(-0.14 * s)}Z" fill="#ffd890" stroke="#2a1e16" stroke-width="${f1(Math.max(1, 0.015 * s))}"/>`
      + `<path d="${ell(cx, cy - 0.01 * s, 0.025 * s, 0.05 * s)}" fill="#fffbe6"/><path d="M${f1(cx - 0.09 * s)},${f1(cy - 0.12 * s)}l${f1(0.09 * s)},${f1(-0.07 * s)}l${f1(0.09 * s)},${f1(0.07 * s)}Z" fill="#2a1e16"/>`
      + (side ? `<path d="M${f1(cx)},${f1(cy + 0.08 * s)}v${f1(0.08 * s)}h${f1(side * 0.12 * s)}" fill="none" stroke="#2a1e16" stroke-width="${f1(Math.max(1, 0.02 * s))}"/>` : '');
  };
  S.add(wallLamp(-1.4, 2.2, ZB - 0.05), wallLamp(2.2, 2.2, ZB - 0.05), wallLamp(XR - 0.08, 2.3, 4.2, 1), wallLamp(XL + 0.08, 2.0, 5.6, -1));
  // the three-panel folding screen standing before the pool's left end, glowing from the lamp behind it
  {
    const P = [[-2.2, 4.25], [-1.55, 3.95], [-0.9, 4.25], [-0.25, 3.95]], y0 = 0.08, y1 = 2.0;
    const glow = S.lin([[0, '#f6e6c4'], [0.6, '#e8d2a6'], [1, '#c8b08a']]);
    for (let i = 0; i < 3; i++) {
      const [xa, za] = P[i], [xb, zb] = P[i + 1];
      const lit = i % 2 === 0;
      S.add(`<path d="${q([[xa, y0, za], [xa, y1, za], [xb, y1, zb], [xb, y0, zb]])}" fill="#3a2a1e"/>`);
      const ins = 0.06, lerp = (t) => [xa + (xb - xa) * t, za + (zb - za) * t];
      const [ix0, iz0] = lerp(ins), [ix1, iz1] = lerp(1 - ins);
      S.add(`<path d="${q([[ix0, y0 + 0.2, iz0], [ix0, y1 - 0.08, iz0], [ix1, y1 - 0.08, iz1], [ix1, y0 + 0.2, iz1]])}" fill="${glow}" opacity="${lit ? 0.95 : 0.8}"/>`);
      let lt = '';
      for (let t = 0.25; t < 1; t += 0.25) { const [lx, lz] = lerp(ins + (1 - 2 * ins) * t); lt += pl([pr(lx, y0 + 0.2, lz), pr(lx, y1 - 0.08, lz)]); }
      for (let y = y0 + 0.2 + 0.43; y < y1 - 0.1; y += 0.43) lt += pl([pr(ix0, y, iz0), pr(ix1, y, iz1)]);
      S.add(`<path d="${lt}" stroke="#6a4c34" stroke-width="2" opacity=".75"/>`);
      if (!lit) S.add(`<path d="${q([[ix0, y0 + 0.2, iz0], [ix0, y1 - 0.08, iz0], [ix1, y1 - 0.08, iz1], [ix1, y0 + 0.2, iz1]])}" fill="#3a2a1e" opacity=".18"/>`);
    }
    let ft = '';
    for (const [x, z] of P) ft += q([[x - 0.08, 0, z - 0.06], [x + 0.08, 0, z - 0.06], [x + 0.08, 0.08, z - 0.06], [x - 0.08, 0.08, z - 0.06]]);
    S.add(`<path d="${ft}" fill="#2a1e16"/>`);
    // a towel thrown over the top of the middle panel
    const [mx, mz] = [(P[1][0] + P[2][0]) / 2, (P[1][1] + P[2][1]) / 2];
    S.add(towel([pr(mx - 0.22, y1 + 0.03, mz - 0.03), pr(mx + 0.22, y1 + 0.03, mz + 0.03), pr(mx + 0.2, y1 - 0.5, mz + 0.03), pr(mx - 0.2, y1 - 0.46, mz - 0.03)], '#f2ede2'));
  }
  // steam: big soft clouds over the pool and up under the ceiling, wisps rising off the water, a haze over everything
  {
    const big = S.blur(4), mid = S.blur(3);
    S.add(`<ellipse cx="580" cy="470" rx="230" ry="230" fill="${S.rad([[0, '#ffd8a0', 0.3], [1, '#ffd8a0', 0]])}"/>`);
    let st = '';
    for (const [x, y, rx, ry] of [[1000, 380, 380, 150], [760, 230, 360, 130], [1280, 300, 280, 140], [400, 170, 300, 110], [900, 110, 520, 110], [1340, 540, 200, 100]]) st += ell(x, y, rx, ry);
    S.add(`<path d="${st}" fill="#f6f0e6" opacity=".45" filter="${big}"/>`);
    let ws = '';
    for (let k = 0; k < 16; k++) { const x = R.range(780, 1300), y = R.range(400, 520); ws += ell(x, y - 50, R.range(40, 100), R.range(60, 140)); }
    S.add(`<path d="${ws}" fill="#faf6f0" opacity=".5" filter="${mid}"/>`);
    S.add(`<path d="${ell(1020, 560, 330, 34)}" fill="#faf6f0" opacity=".55" filter="${mid}"/>`);
    S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#f4ece0', 0.42], [0.45, '#f4ece0', 0.18], [0.75, '#f4ece0', 0.06], [1, '#f4ece0', 0.02]])}"/>`);
  }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#1a1410', 0], [0.75, '#1a1410', 0.1], [1, '#1a1410', 0.45]], 'cx="0.5" cy="0.5" r="0.78"')}"/>`);
  return S.out();
}

export const ex005Bgs = {
  'white-tower-outer-court-winter-lights': () => winterLights(),
  'white-tower-outer-court-bathhouse': () => bathhouse(),
};
