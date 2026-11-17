// 成长支线的场景背景（剧本/番外/ex015聖女的一天假.md、ex016無名病房.md〈美術需求〉）：
//   holy-city-morning-market  — 白塔圣都·晨市：一点透视往街的深处看；白石铺的街，两边一顶挨一顶的帆布摊子（条纹篷、
//                               柜台上的面包、花、蜂蜜罐、鱼筐），摊子后面是白石的房子与拱形门窗；早上的光从左上斜来，
//                               影子落向右边；街的尽头，屋顶后面立着远远的白塔，几只鸽子。近处左边是面包摊，右边是
//                               插着白百合的水桶、一篮黄色的野花、一排蜂蜜罐。
//   white-tower-nameless-ward — 白塔·无名病房：一间很长的拱顶屋子，一点透视往里看；左墙一排白床，一张挨一张，每张床头
//                               钉着一块木牌，木牌上只有刮过的痕迹；右墙高处一排拱形高窗，冷白的光斜斜落在床单和石地上；
//                               最里面一道小门，门边一张小桌、一个水盆、一张小凳。冷白、灰蓝。
// 不画人物，不画能读出的字。
import { Scene, W, H, f, pz, pl, persp, rng, mix, bird } from './lib.mjs';

const r0 = (v) => f(v, 0);
const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;
const pz1 = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L') + 'Z';

// convex hull (monotone chain) of screen points
function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

// ---------------------------------------------------------------------------------------------
// 白塔圣都·晨市
// ---------------------------------------------------------------------------------------------
function morningMarket() {
  const S = new Scene('sbSqCMarket', '白塔圣都·晨市：白石铺的街往深处延伸，两边一顶挨一顶的帆布摊子，柜台上是面包、花、蜂蜜罐和鱼筐；摊子后面是白石的房子；早上的光从左上斜来；街的尽头，屋顶后面立着远远的白塔和几只鸽子；近处左边是面包摊，右边是插着白百合的水桶、一篮黄色野花和一排蜂蜜罐；不画人', 15015);
  const R = rng(15016);
  const VP = [770, 488], F = 760, EYE = 1.6;
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const C = {
    sky: [[0, '#cfe0ee'], [0.45, '#f4eedc'], [1, '#fbe6c2']],
    stoneLit: '#f2ead8', stone: '#e2d6bc', stoneShade: '#c2b296', stoneDeep: '#94866c', joint: '#cbbc9e',
    roof: ['#7a8aa4', '#5a6884'], tile: ['#c88a64', '#a06a4c'], win: '#5a5048', winDeep: '#3a322c', wood: '#7a5638', woodDark: '#4e3624',
    tower: ['#c8ccd8', '#fbfbf6', '#d6d8e2'], band: '#b8bcc8',
    awn: [['#f4ecd8', '#5a7a9a'], ['#f4ecd8', '#b0584a'], ['#f4ecd8', '#c89a4a'], ['#f4ecd8', '#6a8a5a'], ['#f4ecd8', '#8a6a8a']],
    shadow: '#6a5a44',
  };

  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(C.sky)}"/>`);
  // a soft sun glow upper left
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#fff6dc', 0.85], [0.35, '#fff1d0', 0.25], [1, '#fff1d0', 0]], 'cx="0.12" cy="0.02" r="0.7"')}"/>`);

  // ---- far city and the white tower beyond the end of the street ------------------------------------------------------
  {
    const tx = 905, top = 40, base = VP[1] + 4;
    // haze-blue roofs of the far city
    let far = `M0,${base}`;
    for (let x = 0, i = 0; x <= W; x += 26, i++) { const h = 30 + ((i * 37) % 23) + (Math.abs(x - tx) < 160 ? 22 : 0); far += `L${x},${base - h}L${x + 13},${base - h - 10}`; }
    far += `L${W},${base}Z`;
    S.add(`<path d="${far}" fill="#cdd2d8" opacity=".75"/>`);
    // the tower: a tapering white shaft with band courses, a crown and a thin spire, lit from the left
    const w0 = 30, w1 = 58, crownY = top + 70;
    S.add(`<path d="${pz1([[tx - 6, top - 30], [tx + 6, top - 30], [tx + 3, top - 30], [tx, top - 78]])}" fill="#e8eaf0"/>`);
    S.add(`<path d="${pz1([[tx - w0 - 10, crownY], [tx - w0, top], [tx + w0, top], [tx + w0 + 10, crownY]])}" fill="${S.lin([[0, C.tower[0]], [0.35, C.tower[1]], [1, C.tower[2]]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    S.add(`<path d="${pz1([[tx - w0 - 4, top], [tx, top - 34], [tx + w0 + 4, top]])}" fill="#e2e4ec"/><path d="${pz1([[tx, top - 34], [tx + w0 + 4, top], [tx + 8, top]])}" fill="#c4c8d4"/>`);
    S.add(`<path d="${pz1([[tx - w0, crownY], [tx + w0, crownY], [tx + w1, base - 40], [tx - w1, base - 40]])}" fill="${S.lin([[0, C.tower[0]], [0.3, C.tower[1]], [0.72, C.tower[1]], [1, C.tower[2]]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    let bands = '';
    for (let y = crownY + 30; y < base - 50; y += 40) { const t = (y - crownY) / (base - 40 - crownY), w = w0 + (w1 - w0) * t; bands += `M${f1(tx - w)},${f1(y)}H${f1(tx + w)}`; }
    S.add(`<path d="${bands}" stroke="${C.band}" stroke-width="2"/>`);
    // a row of small arched openings under the crown, and the bell gallery
    let ops = '';
    for (let i = -2; i <= 2; i++) ops += `M${tx + i * 11 - 3},${crownY - 8}v-22a3,3 0 0 1 6,0v22z`;
    S.add(`<path d="${ops}" fill="#9aa0b0"/>`);
    S.add(`<path d="M${tx - w0 - 12},${crownY}h${2 * w0 + 24}v6h${-(2 * w0 + 24)}z" fill="#e6e8ee"/>`);
    // pigeons around the crown
    let birds = '';
    for (const [dx, dy, s, fl] of [[-80, 40, 0.8, 0.2], [-58, 22, 0.6, 0.8], [70, 60, 0.7, 0.4], [96, 34, 0.55, 0.9], [-120, 90, 0.6, 0.5]]) birds += bird(tx + dx, top + dy, s, fl);
    S.add(`<path d="${birds}" fill="#7a7480" opacity=".75"/>`);
  }

  // ---- the street: white paving ---------------------------------------------------------------------------------------
  const XB = 7.4, ZE = 70;
  S.add(`<path d="${q([[-XB, 0, 1], [XB, 0, 1], [XB, 0, ZE], [-XB, 0, ZE]])}" fill="${S.lin([[0, '#e4d8bc'], [0.5, '#eee4cc'], [1, '#d8caa8']])}"/>`);
  {
    let j = '';
    for (let x = -XB; x <= XB + 0.01; x += 0.8) j += pl([pr(x, 0, 1.05), pr(x, 0, ZE)]);
    for (let z = 1.2; z < ZE; z *= 1.16) j += pl([pr(-XB, 0, z), pr(XB, 0, z)]);
    S.add(`<path d="${j}" stroke="${C.joint}" stroke-width="1.2" opacity=".55" fill="none"/>`);
    // the gutter down the middle
    S.add(`<path d="${q([[-0.18, 0, 1], [0.18, 0, 1], [0.18, 0, ZE], [-0.18, 0, ZE]])}" fill="#c8b898" opacity=".55"/>`);
  }

  // ---- the house fronts behind the stalls (both sides) ----------------------------------------------------------------
  for (const side of [-1, 1]) {
    const X = side * XB, lit = side > 0;
    const segs = [3, 8, 13, 19, 26, 34, 44, 56, ZE];
    for (let i = 0; i < segs.length - 1; i++) {
      const za = segs[i], zb = segs[i + 1], hgt = 7.2 + ((i * 3 + (side > 0 ? 1 : 0)) % 4) * 0.9;
      const face = lit ? (i % 2 ? C.stoneLit : C.stone) : (i % 2 ? C.stone : C.stoneShade);
      S.add(`<path d="${q([[X, 0, za], [X, 0, zb], [X, hgt, zb], [X, hgt, za]])}" fill="${face}"/>`);
      // roof edge: a slate or tile slope seen from below
      const rf = i % 3 === 1 ? C.tile : C.roof;
      S.add(`<path d="${q([[X, hgt, za], [X, hgt, zb], [X + side * 1.6, hgt + 1.3, zb], [X + side * 1.6, hgt + 1.3, za]])}" fill="${rf[lit ? 0 : 1]}"/>`);
      S.add(`<path d="${pl([pr(X, hgt, za), pr(X, hgt, zb)])}" stroke="${C.stoneDeep}" stroke-width="1.5" opacity=".6"/>`);
      // a party wall step between houses
      S.add(`<path d="${pl([pr(X, 0, za), pr(X, hgt, za)])}" stroke="${C.stoneDeep}" stroke-width="${f1(Math.max(1, 40 / za))}" opacity=".45"/>`);
      // upper windows (two storeys) and a ground-floor arch
      const n = Math.max(1, Math.round((zb - za) / 2.4));
      let wins = '', arches = '', shut = '';
      for (let k = 0; k < n; k++) {
        const zc = za + (zb - za) * (k + 0.5) / n, hw = Math.min(0.42, (zb - za) / n * 0.2);
        for (const [y0, y1] of [[4.0, 5.3], [5.9, 6.8]]) {
          if (y1 > hgt - 0.3) continue;
          wins += q([[X, y0, zc - hw], [X, y0, zc + hw], [X, y1, zc + hw], [X, y1, zc - hw]]);
          shut += q([[X, y0, zc - hw * 2.0], [X, y0, zc - hw * 1.15], [X, y1, zc - hw * 1.15], [X, y1, zc - hw * 2.0]]);
        }
        const aw = Math.min(0.9, (zb - za) / n * 0.32), pts = [[X, 0, zc - aw], [X, 2.4, zc - aw]];
        for (let t = 1; t < 8; t++) pts.push([X, 2.4 + aw * 0.9 * Math.sin(Math.PI * t / 8), zc - aw + 2 * aw * t / 8]);
        pts.push([X, 2.4, zc + aw], [X, 0, zc + aw]);
        arches += pz(pr.poly(pts));
      }
      S.add(`<path d="${wins}" fill="${C.win}"/><path d="${shut}" fill="${lit ? '#6a86a4' : '#566e88'}" opacity=".85"/><path d="${arches}" fill="${C.winDeep}" opacity=".85"/>`);
    }
    // a line of bunting across the street every few houses (cords only, small coloured flags)
    if (side > 0) {
      for (const z of [9, 18, 33]) {
        const a = pr(-XB, 6.2, z), b = pr(XB, 6.2, z), sag = 120 / z;
        S.add(`<path d="M${r0(a[0])},${r0(a[1])}Q${r0((a[0] + b[0]) / 2)},${r0((a[1] + b[1]) / 2 + sag * 2)} ${r0(b[0])},${r0(b[1])}" fill="none" stroke="#8a7a64" stroke-width="${f1(Math.max(0.8, 10 / z))}"/>`);
        let fl = '';
        const cols = ['#c8604e', '#e2b84e', '#5a7aa4', '#f4ecd8', '#6a9a6a'];
        for (let i = 1; i < 14; i++) {
          const t = i / 14, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t + sag * 2 * 4 * t * (1 - t) * 0.5, s = 70 / z;
          fl += `<path d="M${f1(x - s)},${f1(y)}h${f1(2 * s)}l${f1(-s)},${f1(s * 1.6)}z" fill="${cols[i % cols.length]}"/>`;
        }
        S.add(fl);
      }
    }
  }

  // ---- market stalls in perspective, far to near ------------------------------------------------------------------------
  const GOODS = [
    ['#c88a4a', '#a8683a', '#e0aa64'], // bread
    ['#f4f0e4', '#e8d24a', '#e88a9a'], // flowers
    ['#d8a030', '#c08020', '#f0c460'], // honey
    ['#9aaab4', '#7a8a96', '#c4ccd2'], // fish
    ['#c8503e', '#e8a03a', '#7a9a4a'], // fruit
  ];
  const stall3d = (side, z0, len, kind, k) => {
    const xi = side * 4.3, xo = side * 5.9; // inner (street) and outer edge of the counter
    const zc = z0, z1 = z0 + len, ch = 0.92;
    const out = [];
    // shadow on the paving (light from upper left → shadow falls to the right)
    out.push(`<path d="${q([[xi, 0, zc], [xi + 1.1, 0, zc + 0.3], [xi + 1.1, 0, z1 + 0.3], [xi, 0, z1]])}" fill="${C.shadow}" opacity=".16"/>`);
    // counter: inner face, front face, top
    out.push(`<path d="${q([[xi, 0, zc], [xi, 0, z1], [xi, ch, z1], [xi, ch, zc]])}" fill="${side > 0 ? '#7a5234' : '#9a6c46'}"/>`);
    out.push(`<path d="${q([[xi, 0, zc], [xo, 0, zc], [xo, ch, zc], [xi, ch, zc]])}" fill="${side > 0 ? '#9a6c46' : '#7a5234'}"/>`);
    out.push(`<path d="${q([[xi, ch, zc], [xo, ch, zc], [xo, ch, z1], [xi, ch, z1]])}" fill="#b88a5c"/>`);
    // goods heaped on the counter top
    const g = GOODS[kind];
    let gd = '';
    const nb = zc > 20 ? 2 : 4, na = zc > 20 ? 2 : 3, gp = ['', '', ''];
    for (let a = 0; a < na; a++) for (let b = 0; b < nb; b++) {
      const gx = xi + side * (0.3 + a * 0.45 * 3 / na), gz = zc + 0.25 + b * (len - 0.5) / (nb - 1), p = pr(gx, ch + 0.1, gz), s = F / gz;
      gp[(a + b + k) % 3] += ell(p[0], p[1], 0.17 * s, 0.1 * s);
    }
    gp.forEach((d, i) => { if (d) gd += `<path d="${d}" fill="${g[i]}"/>`; });
    out.push(gd);
    // poles and the striped awning sloping up toward the house
    const pole = Math.max(1, 0.06 * F / zc);
    out.push(`<path d="${pl([pr(xi, 0, zc), pr(xi, 2.3, zc)])}${pl([pr(xi, 0, z1), pr(xi, 2.3, z1)])}" stroke="${C.woodDark}" stroke-width="${f1(pole)}"/>`);
    const [cA, cB] = C.awn[k % C.awn.length];
    const nS = 6;
    for (let i = 0; i < nS; i++) {
      const za = zc - 0.15 + (len + 0.3) * i / nS, zb = zc - 0.15 + (len + 0.3) * (i + 1) / nS;
      out.push(`<path d="${q([[xi - side * 0.25, 2.25, za], [xi - side * 0.25, 2.25, zb], [xo + side * 0.3, 2.9, zb], [xo + side * 0.3, 2.9, za]])}" fill="${i % 2 ? cB : cA}"/>`);
    }
    // the scalloped valance along the street edge
    let val = '';
    for (let i = 0; i < nS; i++) {
      const za = zc - 0.15 + (len + 0.3) * i / nS, zb = zc - 0.15 + (len + 0.3) * (i + 1) / nS;
      const a = pr(xi - side * 0.25, 2.25, za), b = pr(xi - side * 0.25, 2.25, zb), m = pr(xi - side * 0.25, 2.0, (za + zb) / 2);
      val += `<path d="M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}Q${f1(m[0])},${f1(m[1] + 0.15 * F / zb)} ${f1(a[0])},${f1(a[1])}Z" fill="${i % 2 ? cB : cA}"/>`;
    }
    out.push(val);
    out.push(`<path d="${q([[xi - side * 0.25, 2.25, zc - 0.15], [xi - side * 0.25, 2.25, z1 + 0.15], [xo + side * 0.3, 2.9, z1 + 0.15], [xo + side * 0.3, 2.9, zc - 0.15]])}" fill="#000" opacity="${side > 0 ? 0.1 : 0.03}"/>`);
    return out.join('');
  };
  const rows = [];
  for (const side of [-1, 1]) {
    let z = 4.2 + (side > 0 ? 1.2 : 0), k = side > 0 ? 2 : 0;
    while (z < 46) { const len = 2.1 + (k % 3) * 0.4; rows.push({ side, z, len, kind: k % GOODS.length, k }); z += len + 0.9 + (k % 2) * 0.6; k++; }
  }
  rows.sort((a, b) => b.z - a.z).forEach((s) => S.add(stall3d(s.side, s.z, s.len, s.kind, s.k)));

  // pigeons pecking on the paving (tiny grey shapes) and a few dropped petals
  {
    let pg = '';
    for (const [x, z] of [[-0.8, 6], [-0.5, 6.4], [0.6, 9], [1.4, 12], [-1.6, 15]]) {
      const p = pr(x, 0, z), s = F / z * 0.12;
      pg += `${ell(p[0], p[1] - s * 0.5, s * 1.1, s * 0.6)}${ell(p[0] + s * 0.9, p[1] - s * 1.0, s * 0.42, s * 0.4)}`;
    }
    S.add(`<path d="${pg}" fill="#8a8a96"/>`);
  }

  // ---- foreground left: the bread stall, close ------------------------------------------------------------------------
  {
    const x0 = -40, y0 = 900, w = 520, top = 640;
    S.add(`<path d="M${x0},${y0}L${x0},${top}L${x0 + w},${top + 24}L${x0 + w},${y0}Z" fill="#8a5e3a"/>`);
    S.add(`<path d="M${x0},${top}L${x0 + w},${top + 24}L${x0 + w - 30},${top - 36}L${x0 - 10},${top - 66}Z" fill="#b88a5a"/>`);
    S.add(`<path d="M${x0},${top}L${x0 + w},${top + 24}" stroke="#d8aa74" stroke-width="5"/>`);
    // planks
    let pk = '';
    for (let y = top + 60; y < y0; y += 56) pk += `M${x0},${y}L${x0 + w},${y + 10}`;
    S.add(`<path d="${pk}" stroke="#6a4428" stroke-width="3" opacity=".6"/>`);
    // a flat basket and loaves
    S.add(`<path d="${ell(170, top - 30, 150, 36)}" fill="#a87a44"/><path d="${ell(170, top - 38, 138, 28)}" fill="#c89a5a"/>`);
    let lv = '';
    const L = [[90, -52, 46, 20, '#b8743a'], [160, -60, 52, 22, '#c8844a'], [240, -54, 44, 19, '#a8642e'], [120, -76, 40, 17, '#d8945a'], [205, -80, 44, 18, '#b8743a']];
    for (const [cx, dy, rx, ry, col] of L) lv += `<path d="${ell(cx, top + dy, rx, ry)}" fill="${col}"/><path d="M${cx - rx * 0.5},${top + dy - ry * 0.3}l${f1(rx * 0.25)},${f1(-ry * 0.5)}M${cx - rx * 0.1},${top + dy - ry * 0.3}l${f1(rx * 0.25)},${f1(-ry * 0.5)}M${cx + rx * 0.3},${top + dy - ry * 0.3}l${f1(rx * 0.25)},${f1(-ry * 0.5)}" stroke="#f0c890" stroke-width="3" stroke-linecap="round"/>`;
    S.add(lv);
    // ring breads stacked on a peg
    S.add(`<path d="M380,${top - 20}V${top - 190}" stroke="#5a3a22" stroke-width="7"/>`);
    let rg = '';
    for (let i = 0; i < 5; i++) { const y = top - 40 - i * 30; rg += `<path d="${ell(380, y, 34, 12)}" fill="none" stroke="${i % 2 ? '#c88a4a' : '#b07438'}" stroke-width="11"/>`; }
    S.add(rg);
    // the awning edge entering from the top-left corner
    let aw = '';
    for (let i = 0; i < 6; i++) {
      const xa = -60 + i * 100, xb = xa + 100;
      aw += `<path d="M${xa},0L${xb},0L${xb - 4},${118 + i * 6}Q${(xa + xb) / 2},${150 + i * 6} ${xa - 4},${118 + i * 6 - 6}Z" fill="${i % 2 ? '#b0584a' : '#f4ecd8'}"/>`;
    }
    S.add(aw);
    S.add(`<path d="M-60,0L540,0L536,150L-64,120Z" fill="#000" opacity=".06"/>`);
  }

  // ---- foreground right: flower buckets, a basket of yellow wildflowers, honey jars ------------------------------------
  {
    const base = 880;
    // a low trestle with honey jars
    S.add(`<path d="M1180,${base - 150}h420v24h-420z" fill="#8a5e3a"/><path d="M1200,${base - 126}v126M1580,${base - 126}v126" stroke="#5a3a22" stroke-width="12"/>`);
    let jars = '';
    for (let i = 0; i < 7; i++) {
      const cx = 1222 + i * 56, cy = base - 150;
      jars += `<path d="M${cx - 20},${cy}v-44q0,-12 8,-14h24q8,2 8,14v44z" fill="${i % 2 ? '#d89a30' : '#e8b048'}"/><path d="M${cx - 14},${cy - 58}h28v-10h-28z" fill="#efe4cc"/><path d="M${cx - 12},${cy - 40}v26" stroke="#fff2c8" stroke-width="4" opacity=".7"/>`;
    }
    S.add(jars);
    // two zinc buckets of white lilies
    const bucket = (cx, by, w, h) => {
      let o = `<path d="M${cx - w / 2},${by - h}L${cx - w * 0.42},${by}H${cx + w * 0.42}L${cx + w / 2},${by - h}Z" fill="${S.lin([[0, '#a8b0b8'], [0.4, '#dfe4e8'], [1, '#8a929a']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`;
      o += `<path d="${ell(cx, by - h, w / 2, w * 0.12)}" fill="#6a7480"/>`;
      // stems and blossoms
      let st = '', bl = '';
      for (let i = 0; i < 9; i++) {
        const a = -0.5 + i / 8, ex = cx + a * w * 0.9, ey = by - h - 90 - ((i * 37) % 50);
        st += `M${f1(cx + a * w * 0.25)},${by - h}Q${f1(cx + a * w * 0.5)},${f1(by - h - 40)} ${f1(ex)},${f1(ey)}`;
        for (let p = 0; p < 6; p++) {
          const t = p / 6 * Math.PI * 2 + i, px = ex + Math.cos(t) * 16, py = ey + Math.sin(t) * 9;
          bl += `M${f1(ex)},${f1(ey)}Q${f1((ex + px) / 2 + Math.sin(t) * 6)},${f1((ey + py) / 2 - Math.cos(t) * 4)} ${f1(px)},${f1(py)}Q${f1((ex + px) / 2 - Math.sin(t) * 6)},${f1((ey + py) / 2 + Math.cos(t) * 4)} ${f1(ex)},${f1(ey)}Z`;
        }
      }
      o += `<path d="${st}" stroke="#5a8a4a" stroke-width="4" fill="none"/><path d="${bl}" fill="#fbfaf2" stroke="#d8d8c8" stroke-width="1"/>`;
      return o;
    };
    S.add(bucket(1110, base, 120, 120));
    S.add(bucket(1260, base + 14, 110, 100));
    // a low basket of yellow wildflowers, loose, not tied
    S.add(`<path d="M1400,${base}l-24,-70h168l-24,70z" fill="#a87a44"/><path d="${ell(1460, base - 70, 84, 16)}" fill="#7a5630"/>`);
    let yf = '', ys = '';
    for (let i = 0; i < 26; i++) {
      const x = 1390 + (i * 53) % 140, y = base - 84 - ((i * 29) % 40);
      ys += `M${x},${base - 72}L${x + ((i % 3) - 1) * 8},${y}`;
      yf += `<circle cx="${x + ((i % 3) - 1) * 8}" cy="${y}" r="${5 + (i % 3)}" fill="${i % 4 ? '#f0c83a' : '#f6dc6a'}"/>`;
    }
    S.add(`<path d="${ys}" stroke="#6a9a4a" stroke-width="2.5"/>${yf}`);
  }

  // morning light wash from the upper left and a gentle vignette
  S.add(`<path d="M0,0L560,0L1180,900L0,900Z" fill="#fff4d6" opacity=".08"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.72, '#000', 0.05], [1, '#3a2a18', 0.32]], 'cx="0.5" cy="0.5" r="0.78"')}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 白塔·无名病房
// ---------------------------------------------------------------------------------------------
function namelessWard() {
  const S = new Scene('sbSqCWard', '白塔·无名病房：一间很长的拱顶屋子；左墙一排白床，一张挨一张，每张床头钉着一块木牌，木牌上只有刮过的痕迹；右墙高处一排拱形高窗，冷白的光斜斜落在床单和石地上；最里面一道小门，门边一张小桌、一个水盆、一张小凳；冷白、灰蓝；不画人', 16016);
  const R = rng(16017);
  const VP = [820, 452], F = 720, EYE = 1.55;
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const XL = -3.4, XR = 3.0, YS = 3.9, VR = 1.9, ZN = 0.9, ZE = 24;
  const C = {
    deep: '#2a2e38', plaster: '#d2d7de', plasterLit: '#e8ecf0', plasterShade: '#a4abb8', plasterDeep: '#7c8494',
    floor: [[0, '#9aa0aa'], [0.5, '#b4b8c0'], [1, '#7a808a']], joint: '#868c96',
    sheet: '#f4f5f6', sheetShade: '#c6ccd4', sheetDeep: '#9aa2ae', frame: '#6a7078', wood: '#8a6a4c', woodLit: '#a8845e', woodDark: '#5a4432',
    light: '#f4f8ff', glass: [[0, '#f6f9ff'], [1, '#d4dcea']],
  };
  const arc = (z, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const t = Math.PI * i / n; const xc = (XL + XR) / 2, rx = (XR - XL) / 2; return pr(xc + rx * Math.cos(t), YS + VR * Math.sin(t), z); });

  S.add(`<rect width="${W}" height="${H}" fill="${C.deep}"/>`);

  // ---- vault, walls, floor ---------------------------------------------------------------------------------------------
  {
    const near = arc(ZN), far = arc(ZE);
    S.add(`<path d="${pz([...near, ...far.slice().reverse()])}" fill="${S.lin([[0, '#aeb5c2'], [0.6, '#c8ced8'], [1, '#dadee6']])}"/>`);
    // vault ribs (transverse arches) every 3 m
    for (let z = 2.2; z < ZE; z += 3) {
      const w = Math.max(1.2, 0.16 * F / z);
      S.add(`<path d="${pl(arc(z))}" fill="none" stroke="${C.plasterShade}" stroke-width="${f1(w)}"/><path d="${pl(arc(z + 0.06).slice(0, 9))}" fill="none" stroke="${C.plasterLit}" stroke-width="${f1(w * 0.35)}" opacity=".8"/>`);
    }
    // left wall (beds' wall): in the shade of the windows' light
    S.add(`<path d="${q([[XL, 0, ZN], [XL, 0, ZE], [XL, YS, ZE], [XL, YS, ZN]])}" fill="${S.lin([[0, C.plasterShade], [1, C.plaster]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    // right wall (windows' wall): darker against the glare
    S.add(`<path d="${q([[XR, 0, ZN], [XR, 0, ZE], [XR, YS, ZE], [XR, YS, ZN]])}" fill="${S.lin([[0, C.plasterDeep], [1, C.plasterShade]], 'x1="1" y1="0" x2="0" y2="0"')}"/>`);
    // a dado band along both walls
    for (const X of [XL, XR]) S.add(`<path d="${q([[X, 0, ZN], [X, 0, ZE], [X, 0.95, ZE], [X, 0.95, ZN]])}" fill="#7a8290" opacity=".35"/><path d="${pl([pr(X, 0.95, ZN), pr(X, 0.95, ZE)])}" stroke="#6a7280" stroke-width="2" opacity=".6"/>`);
    // floor: big grey flagstones
    S.add(`<path d="${q([[XL, 0, ZN], [XR, 0, ZN], [XR, 0, ZE], [XL, 0, ZE]])}" fill="${S.lin(C.floor)}"/>`);
    let j = '';
    for (let x = XL; x <= XR + 0.01; x += 0.8) j += pl([pr(x, 0, ZN), pr(x, 0, ZE)]);
    for (let z = ZN + 0.4; z < ZE; z *= 1.13) j += pl([pr(XL, 0, z), pr(XR, 0, z)]);
    S.add(`<path d="${j}" stroke="${C.joint}" stroke-width="1.3" opacity=".6" fill="none"/>`);
  }

  // ---- the far end wall: a small arched door (ajar, stairs beyond), a table with a basin, a stool ---------------------
  {
    const z = ZE;
    const outer = [pr(XL, 0, z), ...arc(z).slice().reverse(), pr(XR, 0, z)];
    S.add(`<path d="${pz(outer)}" fill="${S.lin([[0, C.plaster], [1, C.plasterShade]])}"/>`);
    const dx = 0.9, dw = 0.55, dh = 2.0;
    const door = [pr(dx - dw, 0, z), pr(dx - dw, dh, z)];
    for (let i = 1; i < 8; i++) { const t = Math.PI * i / 8; door.push(pr(dx - dw * Math.cos(t), dh + dw * 0.8 * Math.sin(t), z)); }
    door.push(pr(dx + dw, dh, z), pr(dx + dw, 0, z));
    S.add(`<path d="${pz(door)}" fill="#3a3a40"/>`);
    // steps going up beyond the door, catching a little warm light from above
    let st = '';
    for (let i = 0; i < 5; i++) { const a = pr(dx - dw * 0.9, 0.18 * i, z + 0.3 + i * 0.3), b = pr(dx + dw * 0.9, 0.18 * i, z + 0.3 + i * 0.3); st += `M${f1(a[0])},${f1(a[1])}H${f1(b[0])}`; }
    S.add(`<path d="${st}" stroke="#8a8274" stroke-width="2"/>`);
    // the door leaf, open inward to the left
    S.add(`<path d="${q([[dx - dw, 0, z], [dx - dw - 0.5, 0, z - 0.75], [dx - dw - 0.5, dh + 0.2, z - 0.75], [dx - dw, dh + 0.3, z]])}" fill="${C.woodDark}"/>`);
    // small table, basin and a stool by the door
    const tx = 2.0, tz = z - 0.6;
    S.add(`<path d="${q([[tx - 0.5, 0.78, tz - 0.3], [tx + 0.5, 0.78, tz - 0.3], [tx + 0.5, 0.78, tz + 0.3], [tx - 0.5, 0.78, tz + 0.3]])}" fill="${C.woodLit}"/>`);
    S.add(`<path d="${pl([pr(tx - 0.45, 0, tz - 0.25), pr(tx - 0.45, 0.78, tz - 0.25)])}${pl([pr(tx + 0.45, 0, tz - 0.25), pr(tx + 0.45, 0.78, tz - 0.25)])}" stroke="${C.woodDark}" stroke-width="3"/>`);
    const bp = pr(tx, 0.84, tz), bs = F / tz;
    S.add(`<path d="${ell(bp[0], bp[1], 0.28 * bs, 0.07 * bs)}" fill="#c8ccd2"/><path d="${ell(bp[0], bp[1] - 1, 0.22 * bs, 0.05 * bs)}" fill="#9aa8b8"/>`);
    const sx = 0.0, sz = z - 0.9;
    S.add(`<path d="${q([[sx - 0.2, 0.45, sz - 0.2], [sx + 0.2, 0.45, sz - 0.2], [sx + 0.2, 0.45, sz + 0.2], [sx - 0.2, 0.45, sz + 0.2]])}" fill="${C.wood}"/><path d="${pl([pr(sx - 0.16, 0, sz - 0.16), pr(sx - 0.16, 0.45, sz - 0.16)])}${pl([pr(sx + 0.16, 0, sz - 0.16), pr(sx + 0.16, 0.45, sz - 0.16)])}" stroke="${C.woodDark}" stroke-width="2.5"/>`);
  }

  // ---- high arched windows on the right wall, and their cold light ----------------------------------------------------
  const WINZ = [3.2, 6.4, 9.6, 12.8, 16.0, 19.2];
  const dir = [-1.15, -1.0, 0.35]; // light travels down and to the left, a little away from us
  const winPts = (z) => { const hw = 0.55, y0 = 2.55, y1 = 3.55, pts = [[XR, y0, z - hw], [XR, y1, z - hw]]; for (let i = 1; i < 8; i++) { const t = Math.PI * i / 8; pts.push([XR, y1 + 0.4 * Math.sin(t), z - hw * Math.cos(t)]); } pts.push([XR, y1, z + hw], [XR, y0, z + hw]); return pts; };
  const toFloor = ([X, Y, Z]) => { const t = Y / -dir[1]; return [X + dir[0] * t, 0, Z + dir[2] * t]; };
  // floor and bed patches first (drawn after the beds below for the bed tops), shafts last
  const shafts = [];
  for (const z of WINZ) {
    const w3 = winPts(z);
    S.add(`<path d="${pz(pr.poly(w3))}" fill="${S.lin(C.glass)}"/>`);
    // mullion and transom
    const m0 = pr(XR, 2.55, z), m1 = pr(XR, 3.95, z), t0 = pr(XR, 3.2, z - 0.55), t1 = pr(XR, 3.2, z + 0.55);
    S.add(`<path d="M${f1(m0[0])},${f1(m0[1])}L${f1(m1[0])},${f1(m1[1])}M${f1(t0[0])},${f1(t0[1])}L${f1(t1[0])},${f1(t1[1])}" stroke="#7a8496" stroke-width="${f1(Math.max(1, 0.05 * F / z))}"/>`);
    S.add(`<path d="${pz(pr.poly(w3))}" fill="none" stroke="${C.plasterDeep}" stroke-width="${f1(Math.max(1.5, 0.08 * F / z))}"/>`);
    // the sill
    S.add(`<path d="${q([[XR, 2.5, z - 0.62], [XR, 2.5, z + 0.62], [XR - 0.12, 2.5, z + 0.62], [XR - 0.12, 2.5, z - 0.62]])}" fill="${C.plasterLit}"/>`);
    const floorPts = w3.map(toFloor).map(([X, , Z]) => [Math.max(XL, X), 0, Z]);
    S.add(`<path d="${pz(floorPts.map(([X, Y, Z]) => pr(X, Y, Z)))}" fill="${C.light}" opacity=".3"/>`);
    shafts.push(hull([...pr.poly(w3), ...floorPts.map(([X, Y, Z]) => pr(X, Y, Z))]));
  }

  // ---- the row of beds along the left wall, far to near -------------------------------------------------------------------
  const BEDZ = [];
  for (let z = 2.0; z < ZE - 1.4; z += 1.5) BEDZ.push(z); // 十四张床
  const x0 = XL, x1 = XL + 1.95, bh = 0.58, bw = 0.92;
  BEDZ.slice().reverse().forEach((z, idx) => {
    const zA = z, zB = z + bw, s = F / zA;
    const o = [];
    // shadow on the floor beside the bed (cast toward the aisle by the windows? no — windows are on the right, shadow falls left/under)
    o.push(`<path d="${q([[x0, 0, zA - 0.05], [x1 + 0.05, 0, zA - 0.05], [x1 + 0.05, 0, zB + 0.2], [x0, 0, zB + 0.2]])}" fill="#000" opacity=".14"/>`);
    // iron legs at the aisle end
    o.push(`<path d="${pl([pr(x1 - 0.04, 0, zA + 0.04), pr(x1 - 0.04, bh, zA + 0.04)])}${pl([pr(x1 - 0.04, 0, zB - 0.04), pr(x1 - 0.04, bh, zB - 0.04)])}" stroke="${C.frame}" stroke-width="${f1(Math.max(1, 0.05 * s))}"/>`);
    // headboard against the wall: a low wooden panel, face toward the aisle
    o.push(`<path d="${q([[x0 + 0.06, 0, zA], [x0 + 0.06, 0, zB], [x0 + 0.06, 1.12, zB], [x0 + 0.06, 1.12, zA]])}" fill="${C.wood}"/>`);
    o.push(`<path d="${q([[x0 + 0.06, 1.12, zA], [x0 + 0.06, 1.12, zB], [x0 + 0.13, 1.12, zB], [x0 + 0.13, 1.12, zA]])}" fill="${C.woodLit}"/>`);
    // mattress: side facing the aisle, the near end, the top (sheet)
    o.push(`<path d="${q([[x1, 0.32, zA], [x1, 0.32, zB], [x1, bh, zB], [x1, bh, zA]])}" fill="${C.sheetShade}"/>`);
    o.push(`<path d="${q([[x0 + 0.13, 0.32, zA], [x1, 0.32, zA], [x1, bh, zA], [x0 + 0.13, bh, zA]])}" fill="${C.sheet}"/>`);
    o.push(`<path d="${q([[x0 + 0.13, bh, zA], [x1, bh, zA], [x1, bh, zB], [x0 + 0.13, bh, zB]])}" fill="${C.sheet}"/>`);
    // the folded blanket over the foot, and a pillow at the head
    o.push(`<path d="${q([[x1 - 0.55, bh + 0.02, zA], [x1, bh + 0.02, zA], [x1, bh + 0.02, zB], [x1 - 0.55, bh + 0.02, zB]])}" fill="#c4ccd8"/><path d="${q([[x1, bh - 0.12, zA], [x1, bh - 0.12, zB], [x1, bh + 0.02, zB], [x1, bh + 0.02, zA]])}" fill="#a8b2c2"/>`);
    const pp = pr(x0 + 0.42, bh + 0.08, (zA + zB) / 2);
    o.push(`<path d="${ell(pp[0], pp[1], 0.2 * s, 0.07 * s)}" fill="#fbfbfb" stroke="${C.sheetShade}" stroke-width="1"/>`);
    // the name plate on the headboard: a small wooden board, scratched over — no letters, only gouges
    const pa = pr(x0 + 0.14, 0.98, zA + 0.28), pb = pr(x0 + 0.14, 0.82, zA + 0.64);
    o.push(`<path d="${q([[x0 + 0.14, 0.82, zA + 0.28], [x0 + 0.14, 0.82, zA + 0.64], [x0 + 0.14, 0.98, zA + 0.64], [x0 + 0.14, 0.98, zA + 0.28]])}" fill="#c8a678" stroke="${C.woodDark}" stroke-width="${f1(Math.max(0.6, 0.012 * s))}"/>`);
    let sc = '';
    const Rr = rng(1601 + idx);
    for (let k = 0; k < 6; k++) {
      const u0 = Rr(), u1 = Rr(), v0 = Rr(), v1 = Rr();
      const A = [pa[0] + (pb[0] - pa[0]) * (0.1 + 0.8 * u0), pa[1] + (pb[1] - pa[1]) * (0.15 + 0.7 * v0)];
      const B = [pa[0] + (pb[0] - pa[0]) * (0.1 + 0.8 * u1), pa[1] + (pb[1] - pa[1]) * (0.15 + 0.7 * v1)];
      sc += `M${f1(A[0])},${f1(A[1])}L${f1(B[0])},${f1(B[1])}`;
    }
    o.push(`<path d="${sc}" stroke="#7a5a3a" stroke-width="${f1(Math.max(0.6, 0.018 * s))}" stroke-linecap="round" opacity=".85"/>`);
    // nail heads
    o.push(`<path d="${ell(pa[0], (pa[1] + pb[1]) / 2, Math.max(0.6, 0.012 * s), Math.max(0.6, 0.012 * s))}${ell(pb[0], (pa[1] + pb[1]) / 2, Math.max(0.6, 0.012 * s), Math.max(0.6, 0.012 * s))}" fill="#4a4a4a"/>`);
    S.add(o.join(''));
  });

  // ---- light: patches on the bed tops, then the shafts in the air ---------------------------------------------------------
  {
    let patches = '';
    for (const z of WINZ) {
      // where the window's light lands at mattress height on the beds (shifted by the height difference)
      const t = (3.2 - bh) / -dir[1], dz = dir[2] * t, dxx = dir[0] * t;
      const zc = z + dz, xc = XR + dxx;
      if (xc < x1 + 0.6) {
        const za = zc - 0.5, zb = zc + 0.5, xa = Math.max(x0 + 0.2, xc - 0.9), xb = x1;
        patches += q([[xa, bh + 0.03, za], [xb, bh + 0.03, za + 0.1], [xb, bh + 0.03, zb + 0.1], [xa, bh + 0.03, zb]]);
      }
    }
    S.add(`<path d="${patches}" fill="${C.light}" opacity=".35"/>`);
    S.add(`<g opacity=".16" fill="${C.light}">${shafts.map((h) => `<path d="${pz(h)}"/>`).join('')}</g>`);
    // dust motes drifting in the shafts
    let dm = '';
    for (let i = 0; i < 46; i++) {
      const z = WINZ[i % WINZ.length] + R.range(-0.4, 1.2), y = R.range(0.8, 3.2), xx = XR + dir[0] * ((3.2 - y) / -dir[1]) + R.range(-0.3, 0.3);
      const p = pr(xx, y, z + dir[2] * ((3.2 - y) / -dir[1]));
      dm += ell(p[0], p[1], 1.4, 1.4);
    }
    S.add(`<path d="${dm}" fill="#ffffff" opacity=".5"/>`);
  }

  // cold vignette
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.65, '#0a1020', 0.12], [1, '#0a1020', 0.55]], 'cx="0.52" cy="0.5" r="0.78"')}"/>`);
  return S.out();
}

export const sqCBgs = {
  'holy-city-morning-market': () => morningMarket(),
  'white-tower-nameless-ward': () => namelessWard(),
};
