// 番外 ex003 的场景背景（剧本/番外/ex003禮服櫥窗.md〈美術需求〉）：
//   white-tower-arcade-street     — 白塔圣都·朝圣者拱廊街：一点透视往街的深处看；头顶是一节一节铁肋的玻璃拱顶，
//                                   午后的光从左上的玻璃斜落在石板上；两边一家挨一家的店面（拱形门窗、布篷、只有形状
//                                   没有字的挂牌）；右手边近处一扇挂白纱的橱窗（铸金商会的礼服店）；街的尽头一道拱门，
//                                   门外远远露出白塔的下半段与几只鸽子。
//   white-tower-arcade-dress-shop — 拱廊街·铸金商会礼服店店内：象牙白与淡金；头顶的铁肋玻璃天窗开着一扇气窗；后墙是
//                                   临街的大橱窗（白纱）与店门，窗前一座圆台；左墙一排落地镜框——镜面空白，只有反光，
//                                   不映任何人——近处一道试衣帘，帘外立着几卷布料；右墙的架子上布料卷堆到架顶；
//                                   几个没有头的人台披着纱；右前方一张小桌，上面一篮小花、一卷软尺。
// 不画人物，不画能读出的字。
import { Scene, W, H, f, pz, pl, persp, rng, mix, bird } from './lib.mjs';

const r0 = (v) => f(v, 0);
const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;

// ---------------------------------------------------------------------------------------------
// 白塔圣都·朝圣者拱廊街
// ---------------------------------------------------------------------------------------------
function arcadeStreet() {
  const S = new Scene('sbEx003Street', '白塔圣都·朝圣者拱廊街：玻璃拱顶下的石板街，一节一节的铁肋，午后的光从左上斜落；两边一家挨一家的店面，拱形门窗、布篷、只有形状没有字的挂牌；右手边近处一扇挂白纱的橱窗；街的尽头一道拱门，门外远远露出白塔的下半段和几只鸽子；不画人', 30031);
  const R = rng(30032);
  const VP = [800, 440], F = 640, EYE = 1.6;
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const XW = 3.0, YS = 4.4, VR = 2.4, ZN = 1.0, ZE = 32;
  const C = {
    deep: '#4a4038', sky: [[0, '#fbf7ea'], [0.5, '#eef0e6'], [1, '#d8e2e4']],
    stoneLit: '#e6dac2', stone: '#d2c4a8', stoneShade: '#a8987c', stoneDeep: '#7a6c58', joint: '#b8a888',
    iron: '#4e4238', ironLit: '#7a6a58', glassA: '#f6f2e2', glassB: '#e4ece8', glassC: '#d4e0e2',
    wood: '#6a4e36', woodLit: '#8e6c4a', woodDark: '#3e2c1e', win: [[0, '#5a5048'], [0.6, '#3a322c'], [1, '#2a2420']],
    floor: [[0, '#cfc2a6'], [0.55, '#bcae90'], [1, '#8a7c64']], sun: '#fff4d6', gauze: '#f4efe4', gold: '#c8a46a',
  };
  const PIERS = [1.6, 4.8, 8.0, 11.2, 14.4, 17.6, 20.8, 24.0, 27.2, 30.4];
  const arc = (z, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const t = Math.PI * i / n; return pr(XW * Math.cos(t), YS + VR * Math.sin(t), z); });

  S.add(`<rect width="${W}" height="${H}" fill="${C.deep}"/>`);

  // ---- the glass vault: sky behind, faceted panes between the ribs, purlins, ribs, tie rods ---------------------------
  {
    const near = arc(1.2), far = arc(ZE);
    S.add(`<path d="${pz([...near, ...far.slice().reverse()])}" fill="${S.lin(C.sky)}"/>`);
    const o = [];
    const zs = [2.0, ...PIERS.slice(1), ZE];
    for (let b = 0; b < zs.length - 1; b++) {
      const za = zs[b], zb = zs[b + 1];
      for (let i = 0; i < 8; i++) {
        const t0 = Math.PI * i / 8, t1 = Math.PI * (i + 1) / 8;
        const P = (t, z) => [XW * Math.cos(t), YS + VR * Math.sin(t), z];
        const tint = i >= 4 ? (i >= 6 ? C.glassA : C.glassB) : (i <= 1 ? C.glassC : C.glassB);
        o.push(`<path d="${q([P(t0, za + 0.05), P(t1, za + 0.05), P(t1, zb - 0.05), P(t0, zb - 0.05)])}" fill="${tint}" opacity="${f((i + b) % 3 === 0 ? 0.55 : 0.32, 2)}"/>`);
      }
    }
    S.add(o.join(''));
    let pu = '';
    for (let k = 1; k < 8; k++) {
      const t = Math.PI * k / 8, X = XW * Math.cos(t), Y = YS + VR * Math.sin(t);
      pu += pl([pr(X, Y, 2.2), pr(X, Y, ZE)]);
    }
    S.add(`<path d="${pu}" fill="none" stroke="${C.iron}" stroke-width="2.2" opacity=".8"/>`);
    for (const z of [...PIERS, ZE]) {
      const w = Math.max(1.6, 0.11 * F / z);
      S.add(`<path d="${pl(arc(z))}" fill="none" stroke="${C.iron}" stroke-width="${f1(w)}" stroke-linejoin="round"/>`);
      S.add(`<path d="${pl(arc(z - 0.05).slice(9))}" fill="none" stroke="${C.ironLit}" stroke-width="${f1(w * 0.35)}" opacity=".7"/>`);
      // tie rod across the springing, with a small ring in the middle
      const a = pr(-XW, YS, z), b = pr(XW, YS, z), m = pr(0, YS, z);
      S.add(`<path d="M${r0(a[0])},${r0(a[1])}L${r0(b[0])},${r0(b[1])}${ell(m[0], m[1] - 0.35 * F / z, 0.3 * F / z, 0.3 * F / z)}" fill="none" stroke="${C.iron}" stroke-width="${f1(Math.max(1, w * 0.35))}"/>`);
    }
  }

  // ---- the far end: an arched gate, beyond it the open sky, roofs and the lower half of the white tower ----------------
  {
    const z = ZE;
    const outer = [pr(-XW, 0, z), ...arc(z).slice().reverse(), pr(XW, 0, z)];
    const ar = 1.7, ay = 2.6;
    const inner = [pr(ar, 0, z)];
    for (let i = 0; i <= 12; i++) { const t = Math.PI * i / 12; inner.push(pr(ar * Math.cos(t), ay + ar * Math.sin(t), z)); }
    inner.push(pr(-ar, 0, z));
    const ia = pr(-ar, ay + ar, z), ib = pr(ar, 0, z);
    // the view through the gate
    S.add(`<rect x="${r0(ia[0] - 4)}" y="${r0(ia[1] - 4)}" width="${r0(ib[0] - ia[0] + 8)}" height="${r0(ib[1] - ia[1] + 8)}" fill="${S.lin([[0, '#cfe0ec'], [0.7, '#f2efe2'], [1, '#e8dcc4']])}"/>`);
    const cx = (ia[0] + ib[0]) / 2 - 12, gy = ib[1];
    S.add(`<path d="M${r0(cx - 22)},${r0(gy - 26)}L${r0(cx - 16)},${r0(ia[1] - 6)}H${r0(cx + 16)}L${r0(cx + 22)},${r0(gy - 26)}Z" fill="${S.lin([[0, '#e8ecf2'], [0.5, '#fbfbf8'], [1, '#c8ccd6']], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    let bands = '';
    for (let y = ia[1] + 10; y < gy - 30; y += 14) bands += `M${r0(cx - 20)},${r0(y)}H${r0(cx + 20)}`;
    S.add(`<path d="${bands}" stroke="#b8bcc8" stroke-width="1.2"/>`);
    let roofs = `M${r0(ia[0] - 4)},${r0(gy + 4)}`;
    for (let x = ia[0] - 4, i = 0; x < ib[0] + 8; x += 18, i++) { const h = 22 + (i % 3) * 7; roofs += `L${r0(x)},${r0(gy - h)}L${r0(x + 9)},${r0(gy - h - 8)}L${r0(x + 18)},${r0(gy - h)}`; }
    roofs += `L${r0(ib[0] + 8)},${r0(gy + 4)}Z`;
    S.add(`<path d="${roofs}" fill="#c8bca4"/>`);
    let birds = '';
    for (const [dx, dy, s, fl] of [[-30, 26, 0.7, 0.2], [-14, 18, 0.55, 0.8], [36, 40, 0.6, 0.4]]) birds += bird(cx + dx, ia[1] + dy, s, fl);
    S.add(`<path d="${birds}" fill="#6a6058" opacity=".8"/>`);
    // the end wall with the gate cut out
    S.add(`<path d="${pz(outer)}${pz(inner)}" fill-rule="evenodd" fill="${S.lin([[0, C.stoneLit], [1, C.stone]])}"/>`);
    S.add(`<path d="${pl(inner)}" fill="none" stroke="${C.stoneShade}" stroke-width="3"/>`);
  }

  // ---- the two walls of shopfronts --------------------------------------------------------------------------------------
  const AWN = ['#4a5a7a', '#8a4a46', '#b08a4a', '#6a7a5a', '#7a5a7a'];
  for (const side of [-1, 1]) {
    const X = side * XW, lit = side > 0;
    const o = [];
    o.push(`<path d="${q([[X, 0, ZN], [X, 0, ZE], [X, YS, ZE], [X, YS, ZN]])}" fill="${lit ? C.stone : C.stoneShade}"/>`);
    // cornice band and the upper storey
    o.push(`<path d="${q([[X, 3.12, ZN], [X, 3.12, ZE], [X, 3.36, ZE], [X, 3.36, ZN]])}" fill="${lit ? C.stoneLit : C.stone}"/>`);
    o.push(`<path d="${pl([pr(X, 3.12, ZN), pr(X, 3.12, ZE)])}" stroke="${C.stoneDeep}" stroke-width="2" opacity=".6"/>`);
    // bays
    for (let b = 0; b < PIERS.length - 1; b++) {
      const za = PIERS[b] + 0.32, zb = PIERS[b + 1] - 0.32, zm = (za + zb) / 2;
      // upper window
      o.push(`<path d="${q([[X, 3.6, zm - 0.45], [X, 3.6, zm + 0.45], [X, 4.15, zm + 0.45], [X, 4.15, zm - 0.45]])}" fill="${lit ? '#8a7a64' : '#6a5c4a'}"/>`);
      // the arched shopfront
      const front = [[X, 0.12, za], [X, 2.5, za]];
      for (let i = 1; i < 8; i++) { const t = i / 8; front.push([X, 2.5 + 0.42 * Math.sin(Math.PI * t), za + (zb - za) * t]); }
      front.push([X, 2.5, zb], [X, 0.12, zb]);
      const shopFront = pz(pr.poly(front));
      const dress = side > 0 && b === 1;
      o.push(`<path d="${shopFront}" fill="${dress ? S.lin([[0, '#f6f0e2'], [1, '#d8cdb8']]) : S.lin(C.win)}" stroke="${dress ? C.gold : C.wood}" stroke-width="${f1(Math.max(1.5, 0.07 * F / zm))}"/>`);
      if (dress) {
        // the dress shop's window: white gauze, drawn in swags and two side drapes
        const k = F / zm;
        const tl = pr(X, 2.6, za + 0.15), tr = pr(X, 2.6, zb - 0.15), bl = pr(X, 0.5, za + 0.15), br = pr(X, 0.5, zb - 0.15);
        o.push(`<path d="M${r0(tl[0])},${r0(tl[1])}Q${r0((tl[0] + tr[0]) / 2)},${r0((tl[1] + tr[1]) / 2 + 0.5 * k)} ${r0(tr[0])},${r0(tr[1])}L${r0(tr[0])},${r0(tr[1] - 0.12 * k)}L${r0(tl[0])},${r0(tl[1] - 0.12 * k)}Z" fill="${C.gauze}" stroke="#d8cdb8" stroke-width="1.5"/>`);
        for (const [a, c, dir] of [[tl, bl, 1], [tr, br, -1]]) {
          o.push(`<path d="M${r0(a[0])},${r0(a[1])}Q${r0(a[0] + dir * 0.35 * k)},${r0((a[1] + c[1]) / 2)} ${r0(c[0] + dir * 0.12 * k)},${r0(c[1])}L${r0(c[0])},${r0(c[1])}Z" fill="${C.gauze}" opacity=".9"/>`);
        }
        // a pale dais glimpsed between the drapes
        const d0 = pr(X, 0.5, zm);
        o.push(`<path d="${ell(d0[0] - 0.05 * k, d0[1], 0.18 * k, 0.4 * k)}" fill="#e8dcc4" opacity=".8"/>`);
      } else {
        // mullion, transom and a few dim goods behind the glass
        const m0 = pr(X, 0.12, zm), m1 = pr(X, 2.9, zm), t0 = pr(X, 2.0, za), t1 = pr(X, 2.0, zb);
        o.push(`<path d="M${r0(m0[0])},${r0(m0[1])}L${r0(m1[0])},${r0(m1[1])}M${r0(t0[0])},${r0(t0[1])}L${r0(t1[0])},${r0(t1[1])}" stroke="${C.wood}" stroke-width="${f1(Math.max(1, 0.05 * F / zm))}"/>`);
        const k = F / zm;
        let goods = '';
        for (let g = 0; g < 4; g++) {
          const gz = za + 0.25 + g * (zb - za - 0.5) / 3, p = pr(X, 0.75, gz);
          const h = (0.25 + ((b + g) % 3) * 0.12) * k;
          goods += `M${r0(p[0] - 0.03 * k)},${r0(p[1])}h${f1(0.06 * k)}v${f1(-h)}h${f1(-0.06 * k)}z`;
        }
        o.push(`<path d="${goods}" fill="${R() < 0.5 ? '#d8b878' : '#c8a080'}" opacity=".55"/>`);
        o.push(`<path d="${q([[X, 0.12, za], [X, 0.12, zb], [X, 0.62, zb], [X, 0.62, za]])}" fill="${C.woodDark}" opacity=".85"/>`);
        // glint on the glass from the sun
        if (lit && zm > 5) o.push(`<path d="${q([[X, 0.9, za + 0.3], [X, 0.9, za + 0.45], [X, 2.3, za + 0.85], [X, 2.3, za + 0.7]])}" fill="#fff" opacity=".1"/>`);
      }
      // awning over every other shopfront (not over the dress shop)
      if (!dress && (b + (side > 0 ? 1 : 0)) % 2 === 0 && zm < 26) {
        const col = AWN[(b + (side > 0 ? 2 : 0)) % AWN.length];
        const xo = side * (XW - 0.55);
        const a1 = [X, 2.95, za + 0.05], a2 = [X, 2.95, zb - 0.05], a3 = [xo, 2.5, zb - 0.05], a4 = [xo, 2.5, za + 0.05];
        o.push(`<path d="${q([a1, a2, a3, a4])}" fill="${lit ? col : mix(col, '#2a2420', 0.3)}"/>`);
        let stripes = '';
        for (let s = 1; s < 6; s++) { const z = za + 0.05 + (zb - za - 0.1) * s / 6; stripes += pl([pr(X, 2.95, z), pr(xo, 2.5, z)]); }
        o.push(`<path d="${stripes}" stroke="#f0e6d0" stroke-width="${f1(Math.max(1, 0.05 * F / zm))}" opacity=".35"/>`);
        // scalloped valance along the outer edge
        let val = `M${r0(pr(...a4)[0])},${r0(pr(...a4)[1])}`;
        const n = 6;
        for (let s = 0; s < n; s++) {
          const z0 = za + 0.05 + (zb - za - 0.1) * s / n, z1 = za + 0.05 + (zb - za - 0.1) * (s + 1) / n;
          const m = pr(xo, 2.32, (z0 + z1) / 2), e = pr(xo, 2.5, z1);
          val += `Q${r0(m[0])},${r0(m[1])} ${r0(e[0])},${r0(e[1])}`;
        }
        o.push(`<path d="${val}Z" fill="${mix(col, '#000000', 0.15)}"/>`);
      }
    }
    // piers: a pilaster face at each bay division, with a capital band and a hanging sign on some
    for (const zp of PIERS) {
      const xi = side * (XW - 0.16);
      o.push(`<path d="${q([[X, 0, zp - 0.22], [xi, 0, zp - 0.22], [xi, YS, zp - 0.22], [X, YS, zp - 0.22]])}" fill="${lit ? C.stoneLit : C.stone}"/>`);
      o.push(`<path d="${q([[xi, 0, zp - 0.22], [xi, 0, zp + 0.22], [xi, YS, zp + 0.22], [xi, YS, zp - 0.22]])}" fill="${lit ? C.stone : C.stoneShade}"/>`);
      o.push(`<path d="${q([[X, YS - 0.22, zp - 0.3], [xi, YS - 0.22, zp - 0.3], [xi, YS - 0.06, zp - 0.3], [X, YS - 0.06, zp - 0.3]])}" fill="${C.stoneLit}"/>`);
      if (zp > 3 && zp < 22 && Math.round(zp * 10) % 2 === 0) {
        const xs = side * (XW - 0.62), k = F / zp;
        const a = pr(xi, 3.0, zp - 0.22), b = pr(xs, 3.0, zp - 0.22), c = pr(xs, 2.92, zp - 0.22);
        o.push(`<path d="M${r0(a[0])},${r0(a[1])}L${r0(b[0])},${r0(b[1])}" stroke="${C.iron}" stroke-width="${f1(Math.max(1, 0.035 * k))}"/>`);
        const sx = c[0], sy = c[1] + 0.22 * k;
        o.push(`<path d="${ell(sx, sy, 0.2 * k, 0.17 * k)}" fill="${AWN[Math.round(zp) % AWN.length]}" stroke="${C.gold}" stroke-width="${f1(Math.max(1, 0.025 * k))}"/>`);
        o.push(`<path d="M${f1(sx)},${f1(sy - 0.09 * k)}l${f1(0.06 * k)},${f1(0.09 * k)}l${f1(-0.06 * k)},${f1(0.09 * k)}l${f1(-0.06 * k)},${f1(-0.09 * k)}Z" fill="${C.gold}" opacity=".85"/>`);
      }
    }
    S.add(o.join(''));
  }

  // ---- the stone floor ----------------------------------------------------------------------------------------------------
  {
    S.add(`<path d="${q([[-XW, 0, ZN], [XW, 0, ZN], [XW, 0, ZE], [-XW, 0, ZE]])}" fill="${S.lin(C.floor, `gradientUnits="userSpaceOnUse" x1="0" y1="${VP[1]}" x2="0" y2="${H}"`)}"/>`);
    let d = '';
    for (let x = -XW + 0.5; x < XW - 0.01; x += 0.5) d += pl([pr(x, 0, ZN), pr(x, 0, ZE)]);
    for (let z = 1.1, s = 0.55; z < 22; z += s, s *= 1.08) d += pl([pr(-XW, 0, z), pr(XW, 0, z)]);
    S.add(`<path d="${d}" stroke="${C.joint}" stroke-width="1.2" opacity=".55"/>`);
    // a darker run of setts down the middle
    S.add(`<path d="${q([[-0.25, 0.002, ZN], [0.25, 0.002, ZN], [0.25, 0.002, ZE], [-0.25, 0.002, ZE]])}" fill="#8a7c64" opacity=".25"/>`);
  }

  // ---- sunlight: shafts from the upper-left glass, bright panes on the floor, a warm haze -----------------------------------
  {
    const o = [];
    for (const [za, zb] of [[5.2, 7.6], [8.4, 10.8], [11.6, 14.0], [15.0, 17.2]]) {
      const top = [pr(-1.6, YS + 1.8, za), pr(-1.6, YS + 1.8, zb)];
      const fl = [pr(2.4, 0.004, zb + 0.4), pr(0.1, 0.004, zb + 0.4), pr(0.1, 0.004, za + 0.4), pr(2.4, 0.004, za + 0.4)];
      o.push(`<path d="${pz([top[0], top[1], fl[0], fl[3]])}" fill="${C.sun}" opacity=".12" filter="${S.blur(2)}"/>`);
      o.push(`<path d="${pz(fl)}" fill="${C.sun}" opacity=".3"/>`);
    }
    S.add(o.join(''));
    S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#fff8e4', 0.35], [0.6, '#fff8e4', 0.06], [1, '#fff8e4', 0]], 'cx="0.5" cy="0.42" r="0.5"')}"/>`);
  }

  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.7, '#000', 0.06], [1, '#000', 0.45]], 'cx="0.5" cy="0.5" r="0.78"')}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 拱廊街·铸金商会礼服店店内
// ---------------------------------------------------------------------------------------------
function dressShop() {
  const S = new Scene('sbEx003Shop', '拱廊街·铸金商会礼服店店内：象牙白与淡金；头顶的铁肋玻璃天窗开着一扇气窗；后墙是临街的大橱窗，挂着白纱，旁边是店门，窗前一座圆台；左墙一排落地镜框，镜面空白只有反光；近处一道试衣帘，帘外立着几卷布料；右墙的架子上布料卷堆到架顶；几个没有头的人台披着纱；右前方小桌上一篮小花、一卷软尺；不画人', 30041);
  const R = rng(30042);
  const VP = [760, 430], F = 700, EYE = 1.55;
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const XL = -3.4, XR = 3.4, YC = 3.6, ZN = 0.9, ZB = 7.2;
  const C = {
    plaster: '#efe4cf', plasterLit: '#f7eedc', plasterShade: '#cdbd9f', wain: '#e2d2b4', wainLine: '#bca87e',
    gold: '#c8a46a', goldLit: '#e8cc8e', goldDark: '#8e6e3e', iron: '#6a5640',
    floor: [[0, '#e0d4bc'], [0.6, '#cbbc9e'], [1, '#9a8a70']], joint: '#b4a486',
    glass: [[0, '#fbfaf2'], [1, '#e2ece8']], mirror: [[0, '#d6dcdc'], [0.45, '#a8b2b6'], [1, '#c4cccc']],
    curtain: '#d8b4a8', curtainLit: '#ecccc0', curtainDark: '#a8847a', gauze: '#fbf8f0', dais: '#f2e8d4', daisSide: '#c8b48e',
    form: '#e8dcc6', formShade: '#bfae90', pole: '#6a5a46', deep: '#5a4a3e', sun: '#fff6dc',
  };
  S.add(`<rect width="${W}" height="${H}" fill="${C.deep}"/>`);

  // ---- shell: ceiling with the skylight, side walls, wainscot, floor ---------------------------------------------------------
  {
    const o = [];
    o.push(`<path d="${q([[XL, YC, 2.6], [XR, YC, 2.6], [XR, YC, ZB], [XL, YC, ZB]])}" fill="${C.plasterShade}"/>`);
    o.push(`<path d="${q([[XL, 0.9, ZN], [XL, YC, ZN], [XL, YC, ZB], [XL, 0.9, ZB]])}" fill="${S.lin([[0, C.plasterShade], [1, C.plaster]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    o.push(`<path d="${q([[XL, 0, ZN], [XL, 0.9, ZN], [XL, 0.9, ZB], [XL, 0, ZB]])}" fill="${S.lin([[0, '#bfae8c'], [1, C.wain]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
    o.push(`<path d="${q([[XR, 0.9, ZN], [XR, YC, ZN], [XR, YC, ZB], [XR, 0.9, ZB]])}" fill="${S.lin([[0, C.plasterLit], [1, C.plaster]], 'x1="1" y1="0" x2="0" y2="0"')}"/>`);
    o.push(`<path d="${q([[XR, 0, ZN], [XR, 0.9, ZN], [XR, 0.9, ZB], [XR, 0, ZB]])}" fill="${C.wain}"/>`);
    o.push(`<path d="${pl(pr.poly([[XL, 0.9, ZN], [XL, 0.9, ZB], [XR, 0.9, ZB], [XR, 0.9, ZN]]))}" fill="none" stroke="${C.gold}" stroke-width="2.5"/>`);
    o.push(`<path d="${pl(pr.poly([[XL, YC - 0.08, ZN], [XL, YC - 0.08, ZB], [XR, YC - 0.08, ZB], [XR, YC - 0.08, ZN]]))}" fill="none" stroke="${C.gold}" stroke-width="3" opacity=".8"/>`);
    // floor: pale stone slabs
    o.push(`<path d="${q([[XL, 0, 0.5], [XR, 0, 0.5], [XR, 0, ZB], [XL, 0, ZB]])}" fill="${S.lin(C.floor, `gradientUnits="userSpaceOnUse" x1="0" y1="${VP[1]}" x2="0" y2="${H}"`)}"/>`);
    let d = '';
    for (let x = XL + 0.85; x < XR; x += 0.85) d += pl([pr(x, 0, 0.5), pr(x, 0, ZB)]);
    for (const z of [1.2, 1.7, 2.3, 3.0, 3.8, 4.7, 5.7, 6.5]) d += pl([pr(XL, 0, z), pr(XR, 0, z)]);
    o.push(`<path d="${d}" stroke="${C.joint}" stroke-width="1.3" opacity=".6"/>`);
    S.add(o.join(''));
  }

  // ---- the skylight: an iron-ribbed glass lantern over the middle of the room, one vent pane open at the far end ---------------
  {
    const xr = 2.0, rise = 1.1, za = 3.0, zb = 6.9;
    const arcL = (z, n = 12) => Array.from({ length: n + 1 }, (_, i) => { const t = Math.PI * i / n; return pr(xr * Math.cos(t), YC + rise * Math.sin(t), z); });
    const o = [];
    o.push(`<path d="${q([[-xr - 0.15, YC, za - 0.15], [xr + 0.15, YC, za - 0.15], [xr + 0.15, YC, zb + 0.15], [-xr - 0.15, YC, zb + 0.15]])}" fill="${C.goldDark}" opacity=".5"/>`);
    o.push(`<path d="${pz([...arcL(za), ...arcL(zb).reverse()])}" fill="${S.lin(C.glass)}"/>`);
    // the far gable is glass too
    o.push(`<path d="${pz(arcL(zb))}" fill="${S.lin([[0, '#fdfcf6'], [1, '#e8f0ec']])}"/>`);
    let ribs = '';
    for (let z = za; z <= zb + 0.01; z += (zb - za) / 4) ribs += pl(arcL(z));
    for (let k = 1; k < 6; k++) { const t = Math.PI * k / 6; ribs += pl([pr(xr * Math.cos(t), YC + rise * Math.sin(t), za), pr(xr * Math.cos(t), YC + rise * Math.sin(t), zb)]); }
    for (const xg of [-1.0, 0, 1.0]) ribs += pl([pr(xg, YC, zb), pr(xg, YC + rise * Math.sqrt(1 - (xg / xr) ** 2), zb)]);
    o.push(`<path d="${ribs}" fill="none" stroke="${C.iron}" stroke-width="2.4" stroke-linejoin="round"/>`);
    // the open vent: a pane in the gable hinged at its top, tilted out — a dark gap and the tilted frame
    const v0 = pr(-0.45, YC + 0.55, zb), v1 = pr(0.45, YC + 0.95, zb);
    o.push(`<path d="M${r0(v0[0])},${r0(v1[1])}H${r0(v1[0])}V${r0(v0[1])}H${r0(v0[0])}Z" fill="#c8d8e0"/>`);
    o.push(`<path d="M${r0(v0[0])},${r0(v1[1])}H${r0(v1[0])}L${r0(v1[0] + 6)},${r0(v0[1] - 8)}H${r0(v0[0] + 6)}Z" fill="${C.gauze}" opacity=".85" stroke="${C.iron}" stroke-width="2"/>`);
    S.add(o.join(''));
  }

  // ---- the back wall: the big shop window onto the arcade, the shop door, gauze -----------------------------------------------
  {
    const z = ZB, o = [];
    o.push(`<path d="${q([[XL, 0.9, z], [XL, YC, z], [XR, YC, z], [XR, 0.9, z]])}" fill="${C.plaster}"/><path d="${q([[XL, 0, z], [XL, 0.9, z], [XR, 0.9, z], [XR, 0, z]])}" fill="${C.wain}"/>`);
    let pn = '';
    for (let x = XL + 0.35; x < XR; x += 0.7) pn += pl([pr(x, 0.1, z), pr(x, 0.8, z)]);
    o.push(`<path d="${pn}" stroke="${C.wainLine}" stroke-width="1.4" opacity=".7"/>`);
    // window outline: segmental arch
    const wx = 1.75, wy0 = 0.5, wy1 = 2.7, rise = 0.55;
    const win = [[-wx, wy0, z], [-wx, wy1, z]];
    for (let i = 1; i < 12; i++) { const t = i / 12; win.push([-wx + 2 * wx * t, wy1 + rise * Math.sin(Math.PI * t), z]); }
    win.push([wx, wy1, z], [wx, wy0, z]);
    const wpath = pz(pr.poly(win));
    const clip = S.clip(wpath);
    const tl = pr(-wx, wy1 + rise, z), br = pr(wx, wy0, z);
    const ww = br[0] - tl[0], wh = br[1] - tl[1];
    const v = [];
    v.push(`<rect x="${r0(tl[0])}" y="${r0(tl[1])}" width="${r0(ww)}" height="${r0(wh)}" fill="${S.lin([[0, '#f4f4ec'], [0.5, '#fbf6e8'], [1, '#e6d8bc']])}"/>`);
    // across the street: pale shopfront arches and the arcade's ribs, washed out by the light
    let opp = '';
    for (let i = 0; i < 3; i++) { const x = tl[0] + ww * (0.08 + i * 0.32); opp += `M${r0(x)},${r0(br[1])}V${r0(tl[1] + wh * 0.5)}Q${r0(x + ww * 0.12)},${r0(tl[1] + wh * 0.36)} ${r0(x + ww * 0.24)},${r0(tl[1] + wh * 0.5)}V${r0(br[1])}Z`; }
    v.push(`<path d="${opp}" fill="#d8ccb4" opacity=".55"/>`);
    let rib = '';
    for (let i = 0; i < 5; i++) { const x = tl[0] + ww * (0.1 + i * 0.2); rib += `M${r0(x)},${r0(tl[1])}Q${r0(x + ww * 0.05)},${r0(tl[1] + wh * 0.18)} ${r0(x + ww * 0.1)},${r0(tl[1] + wh * 0.3)}`; }
    v.push(`<path d="${rib}" fill="none" stroke="#b8ac98" stroke-width="2" opacity=".45"/>`);
    v.push(`<rect x="${r0(tl[0])}" y="${r0(br[1] - wh * 0.12)}" width="${r0(ww)}" height="${r0(wh * 0.12)}" fill="#cfc2a6" opacity=".6"/>`);
    o.push(`<g clip-path="${clip}">${v.join('')}</g>`);
    // mullions and frame
    let mu = '';
    for (const xm of [-wx / 2, 0, wx / 2]) mu += pl([pr(xm, wy0, z), pr(xm, wy1 + rise * Math.sin(Math.PI * (xm + wx) / (2 * wx)), z)]);
    mu += pl([pr(-wx, 2.05, z), pr(wx, 2.05, z)]);
    o.push(`<path d="${mu}" stroke="${C.gold}" stroke-width="3"/>`);
    o.push(`<path d="${wpath}" fill="none" stroke="${C.gold}" stroke-width="7" stroke-linejoin="round"/><path d="${wpath}" fill="none" stroke="${C.goldLit}" stroke-width="2"/>`);
    // gauze: a swag across the top and two side drapes gathered at the sill
    const k = F / z;
    const g0 = pr(-wx + 0.05, wy1 + 0.35, z), g1 = pr(wx - 0.05, wy1 + 0.35, z);
    o.push(`<path d="M${r0(g0[0])},${r0(g0[1] - 0.25 * k)}H${r0(g1[0])}V${r0(g1[1])}Q${r0((g0[0] + g1[0]) / 2)},${r0(g0[1] + 0.55 * k)} ${r0(g0[0])},${r0(g0[1])}Z" fill="${C.gauze}" opacity=".92"/>`);
    o.push(`<path d="M${r0(g0[0] + ww * 0.2)},${r0(g0[1] + 0.12 * k)}Q${r0((g0[0] + g1[0]) / 2)},${r0(g0[1] + 0.42 * k)} ${r0(g1[0] - ww * 0.2)},${r0(g1[1] + 0.12 * k)}" fill="none" stroke="#e2d6c0" stroke-width="2"/>`);
    for (const dir of [1, -1]) {
      const a = pr(dir * -wx + dir * 0.05, wy1 + 0.2, z), b = pr(dir * -wx + dir * 0.05, wy0, z);
      o.push(`<path d="M${r0(a[0])},${r0(a[1])}C${r0(a[0] + dir * 0.55 * k)},${r0(a[1] + 0.6 * k)} ${r0(b[0] + dir * 0.1 * k)},${r0(b[1] - 0.7 * k)} ${r0(b[0] + dir * 0.32 * k)},${r0(b[1])}L${r0(b[0])},${r0(b[1])}Z" fill="${C.gauze}" opacity=".95"/>`);
      o.push(`<path d="M${r0(a[0] + dir * 0.12 * k)},${r0(a[1] + 0.3 * k)}Q${r0(a[0] + dir * 0.3 * k)},${r0(a[1] + 1.0 * k)} ${r0(b[0] + dir * 0.22 * k)},${r0(b[1])}" fill="none" stroke="#e0d4be" stroke-width="1.6"/>`);
    }
    // the shop door to the right, glazed above, and the little bell over it
    const d0 = 2.1, d1 = 3.0, dh = 2.45;
    o.push(`<path d="${q([[d0, 0, z], [d0, dh, z], [d1, dh, z], [d1, 0, z]])}" fill="#a8865a" stroke="${C.goldDark}" stroke-width="3"/>`);
    o.push(`<path d="${q([[d0 + 0.1, 1.2, z], [d0 + 0.1, dh - 0.12, z], [d1 - 0.1, dh - 0.12, z], [d1 - 0.1, 1.2, z]])}" fill="${S.lin([[0, '#f6f2e6'], [1, '#e0d6c0']])}"/>`);
    o.push(`<path d="${q([[d0 + 0.12, 0.2, z], [d0 + 0.12, 1.05, z], [d1 - 0.12, 1.05, z], [d1 - 0.12, 0.2, z]])}" fill="none" stroke="${C.goldDark}" stroke-width="2"/>`);
    const kn = pr(d0 + 0.14, 1.05, z), bl = pr((d0 + d1) / 2, dh + 0.22, z), bb = pr((d0 + d1) / 2 + 0.25, dh + 0.3, z);
    o.push(`<path d="${ell(kn[0], kn[1], 4, 4)}" fill="${C.goldLit}"/>`);
    o.push(`<path d="M${r0(bb[0])},${r0(bb[1])}H${r0(bl[0])}" stroke="${C.iron}" stroke-width="2"/><path d="M${r0(bl[0] - 7)},${r0(bl[1] + 12)}Q${r0(bl[0] - 7)},${r0(bl[1] - 2)} ${r0(bl[0])},${r0(bl[1] - 2)}Q${r0(bl[0] + 7)},${r0(bl[1] - 2)} ${r0(bl[0] + 7)},${r0(bl[1] + 12)}Z" fill="${C.gold}"/>`);
    // a wall sconce left of the window
    const sc = pr(-2.6, 2.3, z);
    o.push(`<path d="M${r0(sc[0])},${r0(sc[1] + 18)}v-18" stroke="${C.goldDark}" stroke-width="3"/><path d="M${r0(sc[0] - 9)},${r0(sc[1])}h18l-4,-16h-10z" fill="#fbf2dc" stroke="${C.gold}" stroke-width="2"/>`);
    S.add(o.join(''));
  }

  // ---- left wall: three floor-length mirror frames (blank sheen) and, nearer, the fitting curtain -----------------------------
  {
    const X = XL + 0.01, o = [];
    for (const [zc, hw] of [[4.75, 0.38], [5.7, 0.38], [6.6, 0.34]]) {
      const y0 = 0.12, y1 = 2.45;
      const fr = [[X, y0, zc - hw], [X, y1, zc - hw]];
      for (let i = 1; i < 10; i++) { const t = Math.PI * i / 10; fr.push([X, y1 + hw * Math.sin(t), zc - hw * Math.cos(t)]); }
      fr.push([X, y1, zc + hw], [X, y0, zc + hw]);
      const inset = 0.06, hi = hw - inset;
      const gl = [[X, y0 + inset, zc - hi], [X, y1, zc - hi]];
      for (let i = 1; i < 10; i++) { const t = Math.PI * i / 10; gl.push([X, y1 + hi * Math.sin(t), zc - hi * Math.cos(t)]); }
      gl.push([X, y1, zc + hi], [X, y0 + inset, zc + hi]);
      o.push(`<path d="${pz(pr.poly(fr))}" fill="${C.gold}" stroke="${C.goldDark}" stroke-width="2"/>`);
      const gp = pz(pr.poly(gl));
      o.push(`<path d="${gp}" fill="${S.lin(C.mirror)}"/>`);
      // two diagonal streaks of sheen — nothing reflected
      const c = S.clip(gp);
      const a = pr(X, 2.6, zc - hi), b = pr(X, 0.4, zc + hi);
      const k = F / zc;
      o.push(`<g clip-path="${c}"><path d="M${r0(a[0] - 0.05 * k)},${r0(a[1])}l${f1(0.16 * k)},0L${r0(b[0] + 0.02 * k)},${r0(b[1])}l${f1(-0.16 * k)},0Z" fill="#fff" opacity=".35"/><path d="M${r0(a[0] + 0.1 * k)},${r0(a[1] + 0.3 * k)}l${f1(0.05 * k)},0L${r0(b[0] + 0.12 * k)},${r0(b[1] + 0.2 * k)}l${f1(-0.05 * k)},0Z" fill="#fff" opacity=".25"/></g>`);
    }
    // fitting curtain: rod with rings, two heavy drapes nearly closed, a dark gap between them
    const za = 2.85, zb = 4.15, yr = 2.75;
    o.push(`<path d="${q([[X, 0, za], [X, yr, za], [X, yr, zb], [X, 0, zb]])}" fill="#3a2e28"/>`);
    const drape = (z0, z1, gather) => {
      const pts = [];
      const n = 7;
      for (let i = 0; i <= n; i++) pts.push(pr(X + 0.04, yr - 0.05, z0 + (z1 - z0) * i / n));
      const bot = [];
      for (let i = n; i >= 0; i--) { const t = i / n; bot.push(pr(X + 0.08, 0.02, z0 + (z1 - z0) * (gather < 0 ? t * 0.9 + 0.1 : t * 0.9))); }
      return [pts, bot];
    };
    for (const [z0, z1, g] of [[za, (za + zb) / 2 - 0.04, 1], [(za + zb) / 2 + 0.04, zb, -1]]) {
      const [top, bot] = drape(z0, z1, g);
      o.push(`<path d="${pz([...top, ...bot])}" fill="${S.lin([[0, C.curtainDark], [0.5, C.curtainLit], [1, C.curtain]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
      let folds = '';
      for (let i = 1; i < 6; i++) { const z = z0 + (z1 - z0) * i / 6; folds += pl([pr(X + 0.04, yr - 0.1, z), pr(X + 0.08, 0.05, z + g * 0.02)]); }
      o.push(`<path d="${folds}" fill="none" stroke="${C.curtainDark}" stroke-width="2.2" opacity=".55"/>`);
    }
    o.push(`<path d="${pl([pr(X + 0.06, yr, za - 0.15), pr(X + 0.06, yr, zb + 0.15)])}" stroke="${C.gold}" stroke-width="5" stroke-linecap="round"/>`);
    let rings = '';
    for (let i = 0; i <= 8; i++) { const p = pr(X + 0.06, yr - 0.02, za + (zb - za) * i / 8), k = F / (za + (zb - za) * i / 8); rings += ell(p[0], p[1] + 0.03 * k, 0.03 * k, 0.04 * k); }
    o.push(`<path d="${rings}" fill="none" stroke="${C.goldDark}" stroke-width="1.5"/>`);
    S.add(o.join(''));
  }

  // ---- right wall: shelves of fabric bolts stacked to the top ----------------------------------------------------------------
  {
    const X = XR, xf = XR - 0.32, za = 3.5, zb = 6.95, o = [];
    o.push(`<path d="${q([[X, 0, za], [X, 3.56, za], [X, 3.56, zb], [X, 0, zb]])}" fill="#8a7458"/>`);
    let wood = '';
    for (const y of [0.32, 1.0, 1.68, 2.36, 3.04, 3.52]) wood += q([[X, y, za], [xf, y, za], [xf, y, zb], [X, y, zb]]);
    o.push(`<path d="${wood}" fill="#b89a70"/>`);
    let up = '';
    for (const z of [za, (za + zb) / 2, zb]) up += q([[X, 0, z], [xf, 0, z], [xf, 3.56, z], [X, 3.56, z]]);
    o.push(`<path d="${up}" fill="#a0835c" stroke="#7a6244" stroke-width="1.5"/>`);
    const COLS = ['#f6efe0', '#ecd2c8', '#d4dce8', '#e8d8b0', '#cdd8c4', '#ddd0e4', '#f0e6d0', '#c8a46a'];
    let bolts = '';
    const byCol = new Map();
    for (const y of [0.32, 1.0, 1.68, 2.36, 3.04]) {
      const rows = 2;
      for (let r = 0; r < rows; r++) {
        for (let z = za + 0.18 + (r % 2) * 0.12; z < zb - 0.1; z += 0.26) {
          if (y > 3 && R() < 0.2) continue;
          const p = pr(xf + 0.03, y + 0.13 + r * 0.24, z), k = F / z;
          const col = COLS[Math.floor(R() * COLS.length)];
          const d = ell(p[0], p[1], 0.055 * k, 0.12 * k);
          byCol.set(col, (byCol.get(col) || '') + d);
          bolts += ell(p[0], p[1], 0.018 * k, 0.04 * k);
        }
      }
    }
    for (const [col, d] of byCol) o.push(`<path d="${d}" fill="${col}" stroke="${mix(col, '#5a4a3e', 0.35)}" stroke-width="1.2"/>`);
    o.push(`<path d="${bolts}" fill="#7a6650" opacity=".7"/>`);
    S.add(o.join(''));
  }

  // ---- the bolts he carried, standing on end outside the curtain ---------------------------------------------------------------
  {
    const o = [];
    for (const [x, z, h, col] of [[-2.75, 4.55, 1.25, '#f6efe0'], [-2.5, 4.8, 1.05, '#ecd2c8'], [-2.85, 5.05, 1.35, '#e8d8b0'], [-2.55, 5.3, 0.95, '#d4dce8']]) {
      const k = F / z, b = pr(x, 0, z), t = pr(x, h, z), rx = 0.11 * k, ry = 0.035 * k;
      o.push(`<path d="M${r0(b[0] - rx)},${r0(t[1])}V${r0(b[1])}A${r0(rx)},${r0(ry)} 0 0 0 ${r0(b[0] + rx)},${r0(b[1])}V${r0(t[1])}Z" fill="${S.lin([[0, mix(col, '#8a7a64', 0.35)], [0.4, col], [1, mix(col, '#8a7a64', 0.25)]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
      o.push(`<path d="${ell(t[0], t[1], rx, ry)}" fill="${mix(col, '#ffffff', 0.3)}" stroke="${mix(col, '#5a4a3e', 0.3)}" stroke-width="1"/><path d="${ell(t[0], t[1], rx * 0.3, ry * 0.3)}" fill="#7a6650"/>`);
    }
    S.add(o.join(''));
  }

  // ---- the round dais before the window, with the light from the skylight on it ------------------------------------------------
  {
    const cz = 6.05, rr = 1.3, hh = 0.22, o = [];
    const ring = (y) => Array.from({ length: 33 }, (_, i) => { const t = Math.PI * 2 * i / 32; return pr(rr * Math.cos(t), y, cz + rr * 0.55 * Math.sin(t)); });
    const top = ring(hh), base = ring(0);
    const front = [...top.slice(16, 33), ...base.slice(16, 33).reverse()];
    o.push(`<path d="${pz(front)}" fill="${C.daisSide}"/>`);
    o.push(`<path d="${pz(top)}" fill="${S.lin([[0, '#fbf4e4'], [1, C.dais]])}" stroke="${C.gold}" stroke-width="2.5"/>`);
    o.push(`<path d="${pl(base.slice(16, 33))}" fill="none" stroke="${C.goldDark}" stroke-width="2" opacity=".7"/>`);
    S.add(o.join(''));
    // a shaft from the skylight down onto the dais, and the window's glow on the floor
    const s0 = pr(-1.2, YC + 0.3, 5.0), s1 = pr(1.0, YC + 0.3, 5.6), s2 = pr(1.1, hh, 6.6), s3 = pr(-0.9, hh, 5.6);
    S.add(`<path d="${pz([s0, s1, s2, s3])}" fill="${C.sun}" opacity=".22" filter="${S.blur(2)}"/>`);
    S.add(`<path d="${q([[-1.9, 0.004, ZB], [1.9, 0.004, ZB], [2.4, 0.004, 4.6], [-2.2, 0.004, 4.6]])}" fill="${C.sun}" opacity=".18" filter="${S.blur(2)}"/>`);
    const wc = pr(0, 2.0, ZB);
    S.add(`<ellipse cx="${r0(wc[0])}" cy="${r0(wc[1])}" rx="320" ry="210" fill="${S.rad([[0, '#fffaf0', 0.45], [0.6, '#fffaf0', 0.1], [1, '#fffaf0', 0]])}"/>`);
  }

  // ---- dress forms: headless torsos on tripod stands, draped with gauze --------------------------------------------------------
  function form(X, Z, s = 1, drapeSide = 1) {
    const k = F / Z, o = [];
    const base = pr(X, 0, Z), c = (y) => pr(X, y * s, Z);
    const u = (v) => v * s * k;
    // tripod
    o.push(`<path d="M${r0(base[0])},${r0(base[1] - u(0.12))}l${f1(-u(0.28))},${f1(u(0.12))}M${r0(base[0])},${r0(base[1] - u(0.12))}l${f1(u(0.28))},${f1(u(0.12))}M${r0(base[0])},${r0(base[1] - u(0.12))}l0,${f1(u(0.1))}" stroke="${C.pole}" stroke-width="${f1(Math.max(2, u(0.035)))}" stroke-linecap="round"/>`);
    const p0 = c(0.12), p1 = c(0.98);
    o.push(`<path d="M${r0(p0[0])},${r0(p0[1])}L${r0(p1[0])},${r0(p1[1])}" stroke="${C.pole}" stroke-width="${f1(Math.max(2, u(0.04)))}"/>`);
    // torso: hips at 1.0, waist 1.18, bust 1.34, shoulders 1.48, neck 1.56
    const hip = c(1.0), wst = c(1.18), bst = c(1.34), sh = c(1.48), nk = c(1.56);
    const cx = hip[0];
    const torso = `M${r0(cx - u(0.17))},${r0(hip[1])}C${r0(cx - u(0.19))},${r0(hip[1] - u(0.08))} ${r0(cx - u(0.11))},${r0(wst[1] + u(0.04))} ${r0(cx - u(0.115))},${r0(wst[1])}C${r0(cx - u(0.12))},${r0(wst[1] - u(0.06))} ${r0(cx - u(0.17))},${r0(bst[1] + u(0.03))} ${r0(cx - u(0.17))},${r0(bst[1])}C${r0(cx - u(0.17))},${r0(sh[1] + u(0.04))} ${r0(cx - u(0.2))},${r0(sh[1] + u(0.02))} ${r0(cx - u(0.18))},${r0(sh[1])}Q${r0(cx - u(0.1))},${r0(nk[1] + u(0.01))} ${r0(cx - u(0.05))},${r0(nk[1])}H${r0(cx + u(0.05))}Q${r0(cx + u(0.1))},${r0(nk[1] + u(0.01))} ${r0(cx + u(0.18))},${r0(sh[1])}C${r0(cx + u(0.2))},${r0(sh[1] + u(0.02))} ${r0(cx + u(0.17))},${r0(sh[1] + u(0.04))} ${r0(cx + u(0.17))},${r0(bst[1])}C${r0(cx + u(0.17))},${r0(bst[1] + u(0.03))} ${r0(cx + u(0.12))},${r0(wst[1] - u(0.06))} ${r0(cx + u(0.115))},${r0(wst[1])}C${r0(cx + u(0.11))},${r0(wst[1] + u(0.04))} ${r0(cx + u(0.19))},${r0(hip[1] - u(0.08))} ${r0(cx + u(0.17))},${r0(hip[1])}Q${r0(cx)},${r0(hip[1] + u(0.04))} ${r0(cx - u(0.17))},${r0(hip[1])}Z`;
    o.push(`<path d="${torso}" fill="${S.lin([[0, C.form], [0.65, C.form], [1, C.formShade]], 'x1="0" y1="0" x2="1" y2="0"')}" stroke="${C.formShade}" stroke-width="1.5"/>`);
    // seam lines and the neck cap
    o.push(`<path d="M${r0(cx)},${r0(nk[1])}V${r0(hip[1] + u(0.02))}M${r0(cx - u(0.12))},${r0(wst[1])}Q${r0(cx)},${r0(wst[1] + u(0.02))} ${r0(cx + u(0.12))},${r0(wst[1])}" fill="none" stroke="${C.formShade}" stroke-width="1.2" opacity=".7"/>`);
    o.push(`<path d="M${r0(cx - u(0.045))},${r0(nk[1])}v${f1(-u(0.05))}h${f1(u(0.09))}v${f1(u(0.05))}Z" fill="${C.pole}"/><path d="${ell(cx, nk[1] - u(0.06), u(0.05), u(0.018))}" fill="${C.goldDark}"/>`);
    // gauze over one shoulder, falling to below the hip
    const d = drapeSide;
    o.push(`<path d="M${r0(cx + d * u(0.16))},${r0(sh[1] - u(0.01))}C${r0(cx + d * u(0.02))},${r0(bst[1] + u(0.02))} ${r0(cx - d * u(0.2))},${r0(wst[1] + u(0.02))} ${r0(cx - d * u(0.26))},${r0(hip[1] + u(0.22))}L${r0(cx - d * u(0.12))},${r0(hip[1] + u(0.26))}C${r0(cx - d * u(0.06))},${r0(wst[1] + u(0.1))} ${r0(cx + d * u(0.1))},${r0(bst[1] + u(0.08))} ${r0(cx + d * u(0.2))},${r0(sh[1] + u(0.05))}Z" fill="${C.gauze}" opacity=".78"/>`);
    S.add(o.join(''));
  }
  form(-1.55, 5.5, 1, 1);
  form(1.75, 5.75, 1, -1);

  // ---- the small worktable at the front right: a basket of little flowers, a coiled measuring tape, a pincushion ---------------
  {
    const x0 = 1.55, x1 = 2.85, z0 = 2.25, z1 = 2.95, y = 0.78, o = [];
    o.push(`<path d="${q([[x0, 0, z0], [x0, y, z0], [x1, y, z0], [x1, 0, z0]])}" fill="none"/>`);
    for (const [lx, lz] of [[x0 + 0.06, z0 + 0.04], [x1 - 0.06, z0 + 0.04]]) o.push(`<path d="${q([[lx - 0.03, 0, lz], [lx - 0.03, y, lz], [lx + 0.03, y, lz], [lx + 0.03, 0, lz]])}" fill="#7a5a3a"/>`);
    o.push(`<path d="${q([[x0, y - 0.08, z0], [x1, y - 0.08, z0], [x1, y, z0], [x0, y, z0]])}" fill="#8e6c48"/>`);
    o.push(`<path d="${q([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]])}" fill="#b08a5e"/>`);
    // basket
    const bk = pr(1.95, y, 2.6), k = F / 2.6;
    o.push(`<path d="M${r0(bk[0] - 0.2 * k)},${r0(bk[1] - 0.12 * k)}L${r0(bk[0] - 0.16 * k)},${r0(bk[1])}H${r0(bk[0] + 0.16 * k)}L${r0(bk[0] + 0.2 * k)},${r0(bk[1] - 0.12 * k)}Z" fill="#c89a5a" stroke="#8a6a3a" stroke-width="1.5"/>`);
    o.push(`<path d="M${r0(bk[0] - 0.16 * k)},${r0(bk[1] - 0.12 * k)}Q${r0(bk[0])},${r0(bk[1] - 0.38 * k)} ${r0(bk[0] + 0.16 * k)},${r0(bk[1] - 0.12 * k)}" fill="none" stroke="#8a6a3a" stroke-width="2.5"/>`);
    let fl = '', fl2 = '';
    for (let i = 0; i < 14; i++) {
      const fx = bk[0] + R.range(-0.17, 0.17) * k, fy = bk[1] - (0.13 + R.range(0, 0.07)) * k, rr = R.range(0.015, 0.024) * k;
      if (i % 3 === 0) fl2 += ell(fx, fy, rr, rr); else fl += ell(fx, fy, rr, rr);
    }
    o.push(`<path d="${fl}" fill="#8aa8d8"/><path d="${fl2}" fill="#fbf8f0"/>`);
    // measuring tape coil with a trailing end, and a red pincushion
    const mt = pr(2.45, y, 2.7), k2 = F / 2.7;
    o.push(`<path d="${ell(mt[0], mt[1] - 0.025 * k2, 0.08 * k2, 0.03 * k2)}" fill="#e8c860" stroke="#a88a30" stroke-width="1.5"/><path d="M${r0(mt[0] + 0.07 * k2)},${r0(mt[1] - 0.02 * k2)}q${f1(0.12 * k2)},${f1(0.04 * k2)} ${f1(0.2 * k2)},${f1(0.02 * k2)}" fill="none" stroke="#e8c860" stroke-width="${f1(0.02 * k2)}"/>`);
    const pc = pr(2.2, y, 2.4), k3 = F / 2.4;
    o.push(`<path d="M${r0(pc[0] - 0.06 * k3)},${r0(pc[1])}a${f1(0.06 * k3)},${f1(0.05 * k3)} 0 0 1 ${f1(0.12 * k3)},0Z" fill="#b84a4a"/>`);
    S.add(o.join(''));
  }

  // the nearest dress form, large at the front left, partly framing the room
  form(-2.15, 2.45, 1, -1);

  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.72, '#000', 0.05], [1, '#000', 0.4]], 'cx="0.5" cy="0.48" r="0.78"')}"/>`);
  return S.out();
}

export const ex003Bgs = {
  'white-tower-arcade-street': () => arcadeStreet(),
  'white-tower-arcade-dress-shop': () => dressShop(),
};
