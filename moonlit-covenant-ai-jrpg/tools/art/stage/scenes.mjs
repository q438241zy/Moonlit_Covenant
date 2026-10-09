// Stage backgrounds (1600x900): battle carriage, ending dawn, camp dining car.
import { PAL, rng, f, P, poly, line, shape, radial, linear, blur, svgDoc, mix } from './lib.mjs';

const W = 1600, H = 900;

function stars(R, n, box, maxR = 1.6, fill = '#e8ddff') {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = R.range(box[0], box[2]), y = R.range(box[1], box[3]);
    s += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(R.range(0.4, maxR))}" opacity="${f(R.range(0.3, 1), 2)}"/>`;
  }
  return `<g fill="${fill}">${s}</g>`;
}

// =================================================================================================
// BATTLE: carriage interior, roof torn open to the eclipse sky
// =================================================================================================
export function battleBg() {
  const p = 'bbg';
  const R = rng(311);
  const VP = [800, 468];
  // far-plane cross-section: walls x 680..920, wall top y 404, floor y 560, roof crown y 352
  const FX0 = 680, FX1 = 920, FT = 404, FF = 560, FC = 350;
  const proj = (x, y, s) => [VP[0] + (x - VP[0]) * s, VP[1] + (y - VP[1]) * s];
  const roofPt = (u, s) => { // u 0..1 across the arch from left wall top to right wall top
    const a = Math.PI * (1 - u);
    const x = 800 + Math.cos(a) * (FX1 - FX0) / 2, y = FT - Math.sin(a) * (FT - FC);
    return proj(x, y, s);
  };
  const defs = [];
  defs.push(blur(`${p}-b1`, 3));
  defs.push(blur(`${p}-b2`, 14));
  defs.push(linear(`${p}-sky`, [[0, '#06051a'], [0.45, '#120d33'], [1, '#2a1a4e']]));
  defs.push(radial(`${p}-corona`, [[0.3, '#fff6ff', 0.95], [0.38, '#d9c6ff', 0.7], [0.6, '#8f6be0', 0.25], [1, '#5a3fb0', 0]]));
  defs.push(linear(`${p}-wallL`, [[0, '#2a2c48'], [1, '#141327']], 'x1="0" y1="0" x2="1" y2="0"'));
  defs.push(linear(`${p}-wallR`, [[0, '#1a1024'], [1, '#3a1a2a']], 'x1="0" y1="0" x2="1" y2="0"'));
  defs.push(linear(`${p}-floor`, [[0, '#1a1428'], [1, '#0a0814']]));
  defs.push(linear(`${p}-carpet`, [[0, '#3a1426'], [1, '#170812']]));
  defs.push(radial(`${p}-red`, [[0, '#ff3d55', 0.75], [0.35, '#c2183a', 0.32], [1, '#5a0a1e', 0]]));
  defs.push(radial(`${p}-moonPool`, [[0, '#e8ddff', 0.32], [1, '#e8ddff', 0]]));
  defs.push(linear(`${p}-beam`, [[0, '#e8ddff', 0.22], [1, '#e8ddff', 0]]));
  defs.push(linear(`${p}-fade`, [[0, '#070614', 0], [0.55, '#070614', 0.25], [1, '#070614', 0.95]]));
  defs.push(radial(`${p}-vig`, [[0.55, '#070614', 0], [1, '#070614', 0.75]], 'cx="0.5" cy="0.45" r="0.75"'));
  defs.push(linear(`${p}-win`, [[0, '#1e1748'], [1, '#3d2a6a']]));
  defs.push(radial(`${p}-centerDark`, [[0, '#070614', 0.55], [1, '#070614', 0]]));

  const b = [];
  // ---- sky (seen through the torn roof) ----
  b.push(`<rect width="${W}" height="${H}" fill="url(#${p}-sky)"/>`);
  b.push(stars(R, 140, [0, 0, W, 360], 1.5));
  // eclipse, upper right inside the opening
  const E = [566, 100];
  b.push(`<circle cx="${E[0]}" cy="${E[1]}" r="190" fill="url(#${p}-corona)" opacity=".55"/>`);
  let rays = '';
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2 + R.range(-0.1, 0.1), l = R.range(90, 170);
    rays += `M${P(E[0] + Math.cos(a) * 62, E[1] + Math.sin(a) * 62, 0)}L${P(E[0] + Math.cos(a) * l, E[1] + Math.sin(a) * l, 0)}`;
  }
  b.push(`<path d="${rays}" stroke="#d9c6ff" stroke-width="3" opacity=".35" filter="url(#${p}-b1)"/>`);
  b.push(`<circle cx="${E[0]}" cy="${E[1]}" r="64" fill="#f3ecff" filter="url(#${p}-b1)"/>`);
  b.push(`<circle cx="${E[0]}" cy="${E[1]}" r="60" fill="#05040c"/>`);
  b.push(`<path d="M${E[0] - 60},${E[1] + 6}A60,60 0 0 1 ${E[0] + 34},${E[1] - 50}" fill="none" stroke="#fffaf0" stroke-width="2.4" opacity=".9"/>`);
  // thin cloud bands across the sky
  b.push(`<path d="M0,250C300,226,520,262,820,240S1300,210,1600,236V280C1300,262,1100,290,800,280S300,270,0,292Z" fill="#3a2a66" opacity=".3" filter="url(#${p}-b2)"/>`);

  // ---- ceiling remains (left, right, far band) with a jagged tear in the middle ----
  const tearL = [[286, -10], [318, 36], [300, 76], [356, 110], [344, 150], [410, 184], [452, 226], [506, 246], [548, 282], [612, 296], [664, 330]];
  const tearR = [[1314, -10], [1276, 48], [1298, 90], [1236, 126], [1250, 166], [1184, 192], [1136, 232], [1090, 248], [1046, 284], [986, 302], [936, 330]];
  const lwTop = (s) => proj(FX0, FT, s), rwTop = (s) => proj(FX1, FT, s);
  const leftCeil = [proj(FX0, FT, 1), ...[...tearL].reverse(), [-10, -10], lwTop(7)];
  const rightCeil = [proj(FX1, FT, 1), rwTop(7), [W + 10, -10], ...tearR];
  defs.push(linear(`${p}-ceilL`, [[0, '#121026'], [1, '#3a3462']], 'x1="0" y1="0.6" x2="1" y2="0.2"'));
  defs.push(linear(`${p}-ceilR`, [[0, '#3a2a4e'], [1, '#160f22']], 'x1="0" y1="0.2" x2="1" y2="0.6"'));
  defs.push(`<clipPath id="${p}-cl"><path d="${poly(leftCeil, 0)}"/><path d="${poly(rightCeil, 0)}"/></clipPath>`);
  b.push(`<path d="${poly(leftCeil, 0)}" fill="url(#${p}-ceilL)"/>`);
  b.push(`<path d="${poly(rightCeil, 0)}" fill="url(#${p}-ceilR)"/>`);
  // far intact ceiling band above the end wall
  const farBand = [];
  for (let i = 0; i <= 12; i++) farBand.push(roofPt(i / 12, 1));
  for (let i = 12; i >= 0; i--) farBand.push(roofPt(i / 12, 1.5));
  b.push(`<path d="${poly(farBand, 0)}" fill="#24203e"/>`);
  b.push(`<path d="M${P(...tearL[tearL.length - 1], 0)}L700,346L736,322L772,340L812,318L850,338L890,320L${P(...tearR[tearR.length - 1], 0)}L${P(...roofPt(1, 1.5), 0)}L${P(...roofPt(0, 1.5), 0)}Z" fill="#24203e"/>`);
  // panel seams + cross ribs on the remnants (clipped)
  let seams = '';
  for (const u of [0.07, 0.15, 0.24, 0.76, 0.85, 0.93]) seams += `M${P(...roofPt(u, 1.2), 0)}L${P(...roofPt(u, 8), 0)}`;
  let cross = '';
  for (const s of [1.5, 1.9, 2.4, 3.1, 4, 5.3, 7]) {
    const pts = [];
    for (let i = 0; i <= 20; i++) pts.push(roofPt(i / 20, s));
    cross += shape(pts, false, 0);
  }
  b.push(`<g clip-path="url(#${p}-cl)"><path d="${seams}" stroke="#0e0c1e" stroke-width="3" opacity=".8"/><path d="${cross}" fill="none" stroke="#0e0c1e" stroke-width="5"/><path d="${cross}" fill="none" stroke="#6d64a8" stroke-width="1.5" opacity=".5" transform="translate(0 -4)"/></g>`);
  // peeled-back roof skin: flaps curling up into the sky along the tear, moonlit rims
  let flaps = '', flapRim = '';
  const flap = (pa, pb, dir, len) => {
    // a torn sheet of roof skin bent up and outward: base on the tear edge, ragged tip in the sky
    const mx = (pa[0] + pb[0]) / 2, my = (pa[1] + pb[1]) / 2;
    const ax = mx + dir * len * 0.35, ay = my - len * 0.75;
    const t1 = [ax - dir * len * 0.12, ay + len * 0.08], t2 = [ax + dir * len * 0.1, ay - len * 0.06];
    flaps += `M${P(...pa, 0)}L${P(t1[0], t1[1], 0)}L${P(ax, ay, 0)}L${P(t2[0], t2[1], 0)}L${P(...pb, 0)}Z`;
    flapRim += `M${P(...pa, 0)}L${P(t1[0], t1[1], 0)}L${P(ax, ay, 0)}`;
  };
  for (let i = 0; i < tearL.length - 2; i += 2) flap(tearL[i], tearL[i + 2], 1, 46 + (tearL.length - i) * 6);
  for (let i = 0; i < tearR.length - 2; i += 2) flap(tearR[i + 2], tearR[i], -1, 46 + (tearR.length - i) * 6);
  b.push(`<path d="${flaps}" fill="#0d0b1c"/>`);
  b.push(`<path d="${flapRim}" fill="none" stroke="#c9bdf5" stroke-width="2.5" opacity=".75"/>`);
  b.push(`<path d="${line(tearL, 0)}M${line(tearR, 0).slice(1)}" fill="none" stroke="#c9bdf5" stroke-width="3" opacity=".75"/>`);
  // structural ribs: follow the arch to the tear, then snap and bend up into the sky
  const inPoly = (pt, poly_) => {
    let c = false;
    for (let i = 0, j = poly_.length - 1; i < poly_.length; j = i++) {
      const [xi, yi] = poly_[i], [xj, yj] = poly_[j];
      if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  let ribs = '', ribHi = '';
  for (const s of [2.1, 3.2, 4.8]) {
    for (const side of [0, 1]) {
      const pts = [];
      for (let u = 0; u <= 0.5; u += 0.02) {
        const q = roofPt(side ? 1 - u : u, s);
        if (!inPoly(q, side ? rightCeil : leftCeil) && pts.length > 2) break;
        pts.push(q);
      }
      const e = pts[pts.length - 1], k = s * 16;
      const d = shape(pts, false, 0) + `L${P(e[0] + (side ? -1 : 1) * k * 0.9, e[1] - k * 1.3, 0)}`;
      ribs += `<path d="${d}" stroke-width="${f(s * 4.5)}" stroke-linejoin="bevel"/>`;
      ribHi += shape(pts.map(([x, y]) => [x + (side ? 2 : -2), y - s * 1.6]), false, 0);
    }
  }
  b.push(`<g fill="none" stroke="#0b0a18" stroke-linecap="round">${ribs}</g>`);
  b.push(`<path d="${ribHi}" fill="none" stroke="#a99ce0" stroke-width="2.4" opacity=".7"/>`);
  // dangling cables and a broken lamp hanging from the tear
  b.push(`<path d="M452,226C462,286,440,330,470,380M1136,232C1126,292,1156,330,1136,396M548,282C556,312,544,336,558,362" fill="none" stroke="#0b0a18" stroke-width="4"/>`);
  b.push(`<circle cx="470" cy="382" r="4" fill="#ff8a5a"/><circle cx="1136" cy="398" r="3" fill="#7fd0ff"/>`);
  // ---- walls ----
  const leftWall = [proj(FX0, FT, 1), proj(FX0, FF, 1), proj(FX0, FF, 9), proj(FX0, FT, 9)];
  const rightWall = [proj(FX1, FT, 1), proj(FX1, FF, 1), proj(FX1, FF, 9), proj(FX1, FT, 9)];
  b.push(`<path d="${poly(leftWall, 0)}" fill="url(#${p}-wallL)"/>`);
  b.push(`<path d="${poly(rightWall, 0)}" fill="url(#${p}-wallR)"/>`);
  // dado rail + baseboard lines
  const railL = `M${P(...proj(FX0, 500, 1), 0)}L${P(...proj(FX0, 500, 9), 0)}`, railR = `M${P(...proj(FX1, 500, 1), 0)}L${P(...proj(FX1, 500, 9), 0)}`;
  b.push(`<path d="${railL}${railR}" stroke="#b88a4a" stroke-width="5" opacity=".55"/>`);
  b.push(`<path d="M${P(...proj(FX0, 416, 1), 0)}L${P(...proj(FX0, 416, 9), 0)}M${P(...proj(FX1, 416, 1), 0)}L${P(...proj(FX1, 416, 9), 0)}" stroke="#b88a4a" stroke-width="4" opacity=".4"/>`);
  // panel verticals and luggage racks above the windows
  let pv = '', rack = '';
  for (const sv of [1.15, 1.65, 2.37, 3.6, 5.7]) for (const X of [FX0, FX1]) pv += `M${P(...proj(X, 418, sv), 0)}L${P(...proj(X, FF, sv), 0)}`;
  for (const X of [FX0, FX1]) rack += `M${P(...proj(X + (X === FX0 ? 14 : -14), 410, 1.1), 0)}L${P(...proj(X + (X === FX0 ? 14 : -14), 410, 9), 0)}`;
  b.push(`<path d="${pv}" stroke="#0e0c1c" stroke-width="3" opacity=".6"/>`);
  b.push(`<path d="${rack}" stroke="#0b0a16" stroke-width="7"/><path d="${rack}" stroke="#b88a4a" stroke-width="1.6" opacity=".5"/>`);
  // windows (arched) on both walls, showing the night outside, frosted at the corners
  const win = (X, s0, s1) => {
    const pts = [];
    const top = 424, sill = 488;
    pts.push(proj(X, sill, s0), proj(X, top + 10, s0));
    for (let i = 1; i < 8; i++) {
      const u = i / 8;
      const s = s0 + (s1 - s0) * u;
      pts.push(proj(X, top + 10 - Math.sin(u * Math.PI) * 10, s));
    }
    pts.push(proj(X, top + 10, s1), proj(X, sill, s1));
    return pts;
  };
  let wins = '', frames = '', frost = '';
  for (const [s0, s1] of [[1.25, 1.55], [1.75, 2.2], [2.55, 3.3], [3.9, 5.2], [6.2, 8.4]]) {
    for (const X of [FX0, FX1]) {
      const w = win(X, s0, s1);
      wins += `<path d="${poly(w, 0)}"/>`;
      frames += poly(w, 0);
      // frost crystals at the lower corners of each window
      const c0 = w[0], c1 = w[w.length - 1];
      const sz = (s1 - s0) * 26;
      for (const c of [c0, c1]) {
        for (let k = 0; k < 4; k++) {
          const a = R.range(0, Math.PI * 2), l = sz * R.range(0.4, 1);
          frost += `M${P(c[0], c[1], 0)}l${f(Math.cos(a) * l, 0)},${f(Math.sin(a) * l - l * 0.4, 0)}`;
        }
      }
    }
  }
  b.push(`<g fill="url(#${p}-win)">${wins}</g>`);
  b.push(`<path d="${frames}" fill="none" stroke="#0a0916" stroke-width="7"/>`);
  b.push(`<path d="${frames}" fill="none" stroke="#8a6a3e" stroke-width="2" opacity=".6"/>`);
  b.push(`<path d="${frost}" stroke="#e9e1ff" stroke-width="2" stroke-linecap="round" opacity=".55"/>`);
  // far end wall + door + emergency lamp
  const endWall = [proj(FX0, FT, 1), roofPt(0.5, 1), proj(FX1, FT, 1), proj(FX1, FF, 1), proj(FX0, FF, 1)];
  b.push(`<path d="${poly([proj(FX0, FT, 1), proj(FX1, FT, 1), proj(FX1, FF, 1), proj(FX0, FF, 1)], 0)}" fill="#120e22"/>`);
  b.push(`<rect x="770" y="452" width="60" height="108" fill="#0a0814" stroke="#3a2a40" stroke-width="2"/>`);
  b.push(`<rect x="786" y="470" width="28" height="30" fill="#2a0e1a"/>`);
  b.push(`<circle cx="800" cy="424" r="60" fill="url(#${p}-red)" opacity=".85"/>`);
  b.push(`<rect x="788" y="418" width="24" height="10" rx="3" fill="#ff5a6e"/>`);
  // red emergency strobe on the right wall, near foreground, washing the right side
  const lampR = proj(FX1, 420, 3.1);
  b.push(`<circle cx="${f(lampR[0], 0)}" cy="${f(lampR[1], 0)}" r="360" fill="url(#${p}-red)" opacity=".75"/>`);
  b.push(`<path d="M${f(lampR[0] - 14, 0)},${f(lampR[1] - 22, 0)}h30v26h-30z" fill="#ff6a7a"/>`);
  b.push(`<path d="M${f(lampR[0] - 18, 0)},${f(lampR[1] - 26, 0)}h38v6h-38z" fill="#2a1420"/>`);

  // ---- floor ----
  const floor = [proj(FX0, FF, 1), proj(FX1, FF, 1), proj(FX1, FF, 9), proj(FX0, FF, 9)];
  b.push(`<path d="${poly(floor, 0)}" fill="url(#${p}-floor)"/>`);
  const carpet = [proj(752, FF, 1), proj(848, FF, 1), proj(848, FF, 9), proj(752, FF, 9)];
  b.push(`<path d="${poly(carpet, 0)}" fill="url(#${p}-carpet)"/>`);
  b.push(`<path d="M${P(...proj(756, FF, 1), 0)}L${P(...proj(756, FF, 9), 0)}M${P(...proj(844, FF, 1), 0)}L${P(...proj(844, FF, 9), 0)}" stroke="#b88a4a" stroke-width="3" opacity=".45"/>`);
  // seat rows along both walls: wine velvet backs (rounded tops), moonlit left / red-lit right, some toppled
  let seatsL = '', seatsR = '', hiL = '', hiR = '', tuft = '';
  for (const s of [1.35, 1.75, 2.3, 3.2]) {
    for (const side of [0, 1]) {
      const X = side ? FX1 : FX0, inX = side ? FX1 - 46 : FX0 + 46;
      const toppled = (s === 2.3 && side === 0) || (s === 3.2 && side === 1);
      let d, h;
      if (toppled) {
        d = poly([proj(X, FF, s), proj(inX + (side ? -30 : 30), FF, s), proj(inX + (side ? -34 : 34), FF - 14, s * 1.05), proj(X, FF - 18, s * 1.04)], 0);
        h = `M${P(...proj(inX + (side ? -34 : 34), FF - 14, s * 1.05), 0)}L${P(...proj(X, FF - 18, s * 1.04), 0)}`;
      } else {
        const a0 = proj(X, 492, s), a1 = proj(inX, 492, s), top = proj((X + inX) / 2, 482, s);
        d = `M${P(...proj(X, FF, s), 0)}L${P(...a0, 0)}Q${P(a0[0], top[1], 0)} ${P(...top, 0)}Q${P(a1[0], top[1], 0)} ${P(...a1, 0)}L${P(...proj(inX, FF, s), 0)}Z`
          + poly([proj(X, 526, s), proj(inX, 526, s), proj(inX, 530, s * 1.12), proj(X, 530, s * 1.12)], 0);
        h = `M${P(...a0, 0)}Q${P(a0[0], top[1], 0)} ${P(...top, 0)}Q${P(a1[0], top[1], 0)} ${P(...a1, 0)}`;
        const c = proj((X + inX) / 2, 506, s);
        tuft += `M${P(c[0] - 4 * s, c[1], 0)}h${f(8 * s, 0)}`;
      }
      if (side) { seatsR += d; hiR += h; } else { seatsL += d; hiL += h; }
    }
  }
  b.push(`<path d="${seatsL}" fill="#1e0e1c"/><path d="${seatsR}" fill="#260c1a"/>`);
  b.push(`<path d="${tuft}" stroke="#0a0410" stroke-width="2.5" opacity=".8"/>`);
  b.push(`<path d="${hiL}" fill="none" stroke="#b3a6ea" stroke-width="2.5" opacity=".6"/><path d="${hiR}" fill="none" stroke="#ff6a7a" stroke-width="2.5" opacity=".55"/>`);

  // ---- moonlight: a soft shaft through the tear onto the left floor ----
  b.push(`<path d="M352,110L640,140L790,900L110,900Z" fill="url(#${p}-beam)" opacity=".55" filter="url(#${p}-b2)"/>`);
  b.push(`<ellipse cx="440" cy="810" rx="340" ry="80" fill="url(#${p}-moonPool)"/>`);
  // memory frost creeping along the floor edges + walls (crystal spikes)
  let fr = '', frHi = '';
  for (let i = 0; i < 70; i++) {
    const side = i % 2;
    const s = 1.2 + R() ** 1.4 * 7.5;
    const X = side ? FX1 : FX0;
    const base = proj(X + (side ? -6 : 6), FF - R.range(0, 12), s);
    const len = s * R.range(5, 12);
    const a = (side ? Math.PI * 1.25 : Math.PI * 1.75) + R.range(-0.5, 0.5);
    const tip = [base[0] + Math.cos(a) * len, base[1] + Math.sin(a) * len];
    const wdt = len * 0.18;
    fr += `M${P(base[0] - wdt, base[1], 0)}L${P(...tip, 0)}L${P(base[0] + wdt, base[1], 0)}Z`;
    if (R() < 0.5) frHi += `M${P(base[0], base[1], 0)}L${P(...tip, 0)}`;
  }
  b.push(`<path d="${fr}" fill="#cdbff5" opacity=".38"/>`);
  b.push(`<path d="${frHi}" stroke="#ffffff" stroke-width="1.4" opacity=".55"/>`);

  // ---- debris: broken panels, shards, papers, a suitcase in the foreground ----
  let deb = '', debHi = '';
  const pieces = [[180, 820, 120, 26, -12], [1420, 830, 150, 30, 10], [330, 868, 90, 18, 6], [1250, 870, 110, 20, -8], [560, 760, 50, 10, -20], [1060, 770, 60, 12, 16]];
  for (const [x, y, w, h, a] of pieces) {
    deb += `<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${w}" height="${h}" transform="translate(${x} ${y}) rotate(${a})"/>`;
    debHi += `<path d="M${f(-w / 2)},${f(-h / 2)}h${w}" transform="translate(${x} ${y}) rotate(${a})"/>`;
  }
  b.push(`<g fill="#0c0a18">${deb}</g><g stroke="#8f84cc" stroke-width="2" opacity=".55">${debHi}</g>`);
  // suitcase (foreground left), lamp shade (foreground right)
  b.push(`<g transform="translate(96 770) rotate(-8)"><rect x="-60" y="-40" width="120" height="80" rx="8" fill="#1e1424"/><rect x="-60" y="-40" width="120" height="80" rx="8" fill="none" stroke="#b88a4a" stroke-width="3" opacity=".6"/><path d="M-18,-40v-12h36v12" fill="none" stroke="#b88a4a" stroke-width="4" opacity=".6"/></g>`);
  b.push(`<g transform="translate(1500 780) rotate(24)"><path d="M-40,20L-26,-30H26L40,20Z" fill="#2a1420"/><path d="M-40,20H40" stroke="#ff8a7a" stroke-width="3" opacity=".6"/></g>`);
  // glass/memory shards glittering on the floor
  let glit = '';
  for (let i = 0; i < 46; i++) {
    const x = R.range(80, 1520), y = R.range(640, 880);
    if (Math.abs(x - 800) < 140 && y < 760) continue;
    const sz = R.range(3, 9) * (y / 700);
    glit += `M${P(x, y - sz, 0)}l${f(sz * 0.5)},${f(sz)}l${f(-sz * 0.5)},${f(sz * 0.6)}l${f(-sz * 0.5)},${f(-sz)}z`;
  }
  b.push(`<path d="${glit}" fill="#e2d6ff" opacity=".55"/>`);

  // ---- air: frost motes drifting down through the opening, memory embers ----
  let motes = '';
  for (let i = 0; i < 90; i++) {
    const x = R.range(200, 1400), y = R.range(40, 820);
    if (Math.hypot((x - 800) / 1.4, y - 360) < 230) continue; // keep the boss zone clean
    motes += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(R.range(0.8, 2.6))}" opacity="${f(R.range(0.3, 0.9), 2)}"/>`;
  }
  b.push(`<g fill="#f1ecff">${motes}</g>`);
  let embers = '';
  for (let i = 0; i < 16; i++) {
    const x = R.range(900, 1550), y = R.range(300, 800);
    embers += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(R.range(1.4, 3))}"/>`;
  }
  b.push(`<g fill="#ffb38a" opacity=".8">${embers}</g>`);

  // ---- keep the centre (boss zone) darker and simpler ----
  b.push(`<ellipse cx="800" cy="380" rx="430" ry="300" fill="url(#${p}-centerDark)"/>`);
  b.push(`<rect width="${W}" height="${H}" fill="url(#${p}-vig)"/>`);
  b.push(`<rect y="${H * 0.62}" width="${W}" height="${H * 0.38}" fill="url(#${p}-fade)"/>`);
  return svgDoc(W, H, '列车车厢战场：车顶撕裂、月蚀天空', defs.join(''), b.join(''));
}

// =================================================================================================
// ENDING: dawn over silver rails and the stopped train
// =================================================================================================
export function endingBg() {
  const p = 'ebg';
  const R = rng(512);
  const defs = [];
  defs.push(blur(`${p}-b1`, 3));
  defs.push(blur(`${p}-b2`, 18));
  defs.push(linear(`${p}-sky`, [[0, '#0a0a24'], [0.38, '#22194a'], [0.58, '#5a3a72'], [0.7, '#b0607a'], [0.8, '#f0a080']]));
  defs.push(linear(`${p}-skyL`, [[0, '#070614', 0.85], [0.5, '#070614', 0.45], [1, '#070614', 0]], 'x1="0" y1="0" x2="1" y2="0"'));
  defs.push(radial(`${p}-dawn`, [[0, '#fff3d6', 1], [0.12, '#ffd091', 0.9], [0.35, '#ff9f7a', 0.45], [0.7, '#b05a8a', 0.15], [1, '#b05a8a', 0]]));
  defs.push(radial(`${p}-corona`, [[0.42, '#f6f0ff', 0.5], [0.55, '#c8b6ff', 0.22], [1, '#8f6be0', 0]]));
  defs.push(linear(`${p}-mtnFar`, [[0, '#6a4a86'], [1, '#3a2c5e']]));
  defs.push(linear(`${p}-mtnNear`, [[0, '#2a2048'], [1, '#17132e']]));
  defs.push(linear(`${p}-ground`, [[0, '#2a2246'], [0.4, '#17132e'], [1, '#070614']]));
  defs.push(linear(`${p}-rail`, [[0, '#ffe6c4'], [0.5, '#e8ddff'], [1, '#8a86b0']], 'x1="1" y1="0" x2="0" y2="1"'));
  defs.push(linear(`${p}-train`, [[0, '#1a1530'], [1, '#0c0a1c']]));
  defs.push(linear(`${p}-fade`, [[0, '#070614', 0], [1, '#070614', 0.9]]));
  const b = [];
  const HZ = 520; // horizon
  const SUN = [1150, HZ];
  b.push(`<rect width="${W}" height="${H}" fill="url(#${p}-sky)"/>`);
  b.push(stars(R, 90, [0, 0, 900, 330], 1.4));
  b.push(stars(R, 20, [900, 0, W, 200], 1.0));
  // fading eclipse, upper left: the moon slipping off, a widening sliver of light
  const E = [430, 210];
  b.push(`<circle cx="${E[0]}" cy="${E[1]}" r="150" fill="url(#${p}-corona)"/>`);
  b.push(`<circle cx="${E[0]}" cy="${E[1]}" r="56" fill="#fff8ec" filter="url(#${p}-b1)" opacity=".9"/>`);
  b.push(`<circle cx="${E[0] - 12}" cy="${E[1] - 4}" r="55" fill="#120e2c"/>`);
  b.push(`<circle cx="${E[0] + 46}" cy="${E[1] + 18}" r="5" fill="#ffffff" filter="url(#${p}-b1)"/>`);
  // dawn glow behind the horizon (right of centre, will backlight the partner portrait)
  b.push(`<ellipse cx="${SUN[0]}" cy="${HZ}" rx="760" ry="420" fill="url(#${p}-dawn)"/>`);
  // sun rays
  let rays = '';
  for (let i = 0; i < 8; i++) {
    const a = Math.PI * 1.12 + R.range(0, 0.76) * Math.PI, w = R.range(0.01, 0.03), l = R.range(280, 560);
    rays += `M${SUN[0]},${HZ}L${P(SUN[0] + Math.cos(a - w) * l, HZ + Math.sin(a - w) * l, 0)}L${P(SUN[0] + Math.cos(a + w) * l, HZ + Math.sin(a + w) * l, 0)}Z`;
  }
  b.push(`<path d="${rays}" fill="#ffe6c4" opacity=".05" filter="url(#${p}-b1)"/>`);
  // left half darker / calm
  b.push(`<rect width="900" height="${H}" fill="url(#${p}-skyL)"/>`);
  // soft cloud streaks lit from below
  b.push(`<g filter="url(#${p}-b2)" opacity=".6"><path d="M700,380C900,360,1100,372,1500,350L1500,372C1150,392,950,388,700,398Z" fill="#ffb38a"/><path d="M820,440C1000,428,1240,436,1600,420V438C1250,452,1000,450,820,458Z" fill="#ffd091"/><path d="M200,330C400,316,560,326,760,318V332C560,344,400,340,200,348Z" fill="#8a6ab0"/></g>`);
  // sun disc just cresting
  b.push(`<circle cx="${SUN[0]}" cy="${HZ + 6}" r="40" fill="#fff6e0"/>`);
  // mountains
  const ridge = (y0, amp, seed, step) => {
    const r = rng(seed);
    const pts = [[-20, H]];
    for (let x = -20; x <= W + 20; x += step) pts.push([x, y0 - Math.abs(Math.sin(x / 210 + seed)) * amp - r.range(0, amp * 0.35)]);
    pts.push([W + 20, H]);
    return poly(pts, 0);
  };
  b.push(`<path d="${ridge(HZ, 70, 3, 40)}" fill="url(#${p}-mtnFar)" opacity=".85"/>`);
  b.push(`<path d="${ridge(HZ + 14, 40, 7, 30)}" fill="url(#${p}-mtnNear)"/>`);
  // rim light on the far ridge near the sun
  b.push(`<path d="M820,${HZ - 30}C960,${HZ - 52},1060,${HZ - 40},1150,${HZ - 30}S1360,${HZ - 50},1500,${HZ - 36}" fill="none" stroke="#ffd091" stroke-width="2" opacity=".45"/>`);
  b.push(`<ellipse cx="${SUN[0]}" cy="${HZ}" rx="420" ry="120" fill="url(#${p}-dawn)" opacity=".55"/>`);
  b.push(`<path d="M${SUN[0] - 34},${HZ + 16}A34,34 0 0 1 ${SUN[0] + 34},${HZ + 16}Z" fill="#fff6e0"/>`);
  // ground plain (frosted)
  b.push(`<path d="M0,${HZ + 18}C400,${HZ + 10},1100,${HZ + 14},1600,${HZ + 8}V${H}H0Z" fill="url(#${p}-ground)"/>`);
  // dawn sheen on the frost plain near the horizon
  b.push(`<ellipse cx="${SUN[0]}" cy="${HZ + 40}" rx="520" ry="40" fill="#ffc890" opacity=".12" filter="url(#${p}-b2)"/>`);
  // silver rails: run under the stopped train, then curve away into the dawn
  const TY = 646; // rail height under the train
  const railA = `M-20,${TY}L700,${TY}C860,${TY} 980,${TY - 40} ${SUN[0] - 20},${HZ + 20}`;
  const railB = `M-20,${TY + 9}L700,${TY + 9}C880,${TY + 9} 1010,${TY - 34} ${SUN[0] - 6},${HZ + 20}`;
  let ties = '';
  for (let x = -10; x < 700; x += 22) ties += `M${x},${TY + 1}l-6,12`;
  for (let i = 0; i < 12; i++) {
    const u = i / 12, x = 710 + u * 400, y = TY - u * u * (TY - HZ - 24) - u * 10;
    ties += `M${f(x, 0)},${f(y + 2, 0)}l${f(-5 * (1 - u), 1)},${f(12 * (1 - u) + 2, 1)}`;
  }
  b.push(`<path d="M-20,${TY + 12}H700C860,${TY + 12} 990,${TY - 26} ${SUN[0] - 10},${HZ + 22}" fill="none" stroke="#0e0b1c" stroke-width="10" opacity=".8"/>`);
  b.push(`<path d="${ties}" stroke="#120e22" stroke-width="5"/>`);
  b.push(`<path d="${railA}${railB}" fill="none" stroke="url(#${p}-rail)" stroke-width="3.2"/>`);
  b.push(`<path d="M700,${TY}C860,${TY} 980,${TY - 40} ${SUN[0] - 20},${HZ + 20}" fill="none" stroke="#fff4e0" stroke-width="1.6" opacity=".9"/>`);
  // the stopped train in profile, locomotive facing the dawn
  const tb = TY - 2; // wheel line
  const car = (x0, x1) => `M${x0},${tb - 14}V${tb - 92}Q${x0},${tb - 108} ${x0 + 18},${tb - 110}H${x1 - 18}Q${x1},${tb - 108} ${x1},${tb - 92}V${tb - 14}Z`;
  const carsX = [[60, 250], [262, 452], [464, 654]];
  let trainD = '', winD = '', roofHi = '', rim = '', wheels = '';
  for (const [x0, x1] of carsX) {
    trainD += car(x0, x1);
    roofHi += `M${x0 + 18},${tb - 110}H${x1 - 18}Q${x1},${tb - 108} ${x1},${tb - 92}`;
    rim += `M${x1},${tb - 92}V${tb - 14}`;
    for (let x = x0 + 16; x < x1 - 24; x += 30) winD += `M${x},${tb - 80}h20v24h-20z`;
    for (const wx of [x0 + 30, x0 + 52, x1 - 52, x1 - 30]) wheels += `<circle cx="${wx}" cy="${tb - 8}" r="9"/>`;
  }
  // couplers
  trainD += `M250,${tb - 30}h12v6h-12zM452,${tb - 30}h12v6h-12zM654,${tb - 30}h12v6h-12z`;
  // locomotive: boiler, cab, chimney, cowcatcher
  const L0 = 666;
  trainD += `M${L0},${tb - 14}V${tb - 112}H${L0 + 54}V${tb - 76}H${L0 + 140}Q${L0 + 160},${tb - 74} ${L0 + 162},${tb - 54}V${tb - 22}L${L0 + 184},${tb - 6}H${L0 + 120}V${tb - 14}Z`;
  trainD += `M${L0 - 4},${tb - 118}H${L0 + 60}V${tb - 110}H${L0 - 4}Z`;
  trainD += `M${L0 + 100},${tb - 76}V${tb - 112}h18l4,-8h-30l4,8z`;
  winD += `M${L0 + 12},${tb - 100}h30v24h-30z`;
  roofHi += `M${L0 + 54},${tb - 76}H${L0 + 140}Q${L0 + 160},${tb - 74} ${L0 + 162},${tb - 54}V${tb - 22}L${L0 + 184},${tb - 6}`;
  for (const wx of [L0 + 30, L0 + 74, L0 + 112]) wheels += `<circle cx="${wx}" cy="${tb - 10}" r="${wx === L0 + 74 ? 14 : 11}"/>`;
  b.push(`<path d="${trainD}" fill="url(#${p}-train)"/>`);
  b.push(`<g fill="#07060f">${wheels}</g>`);
  b.push(`<path d="${winD}" fill="#ffc98a"/>`);
  b.push(`<path d="${roofHi}${rim}" fill="none" stroke="#ffd091" stroke-width="2.4" opacity=".75"/>`);
  // headlight beam toward the dawn, warm window spill on the frost
  const HL = [L0 + 160, tb - 46];
  defs.push(linear(`${p}-hl`, [[0, '#fff0c8', 0.3], [1, '#fff0c8', 0]], 'x1="0" y1="0" x2="1" y2="0"'));
  b.push(`<path d="M${HL[0]},${HL[1] - 4}L${HL[0] + 300},${HL[1] - 46}L${HL[0] + 300},${HL[1] + 34}Z" fill="url(#${p}-hl)" filter="url(#${p}-b1)"/>`);
  b.push(`<circle cx="${HL[0]}" cy="${HL[1]}" r="18" fill="#fff0c8" opacity=".4" filter="url(#${p}-b1)"/><circle cx="${HL[0]}" cy="${HL[1]}" r="5" fill="#fffaf0"/>`);
  // soft steam drifting back from the chimney
  b.push(`<g filter="url(#${p}-b2)" opacity=".38"><ellipse cx="${L0 + 90}" cy="${tb - 140}" rx="36" ry="16" fill="#e0d4f6"/><ellipse cx="${L0 + 10}" cy="${tb - 164}" rx="80" ry="24" fill="#c4b6e6"/><ellipse cx="${L0 - 140}" cy="${tb - 182}" rx="140" ry="30" fill="#a596cc"/></g>`);
  // foreground grass tufts (dark) for depth
  let tufts = '';
  for (let i = 0; i < 40; i++) {
    const x = i < 22 ? R.range(-20, 560) : R.range(1300, 1620), y = R.range(840, 905);
    const hgt = R.range(18, 46);
    tufts += `M${P(x, y, 0)}q${f(R.range(-8, 8), 0)},${f(-hgt * 0.6, 0)} ${f(R.range(-14, 14), 0)},${f(-hgt, 0)}`;
  }
  b.push(`<path d="${tufts}" fill="none" stroke="#0d0a1c" stroke-width="3" stroke-linecap="round"/>`);
  // frost glints on the plain
  let gl = '';
  for (let i = 0; i < 34; i++) {
    const x = R.range(0, W), y = R.range(HZ + 40, H - 40);
    const s = R.range(0.6, 2) * (y - HZ) / 300;
    gl += `M${P(x - s * 2, y, 0)}h${f(s * 4)}M${P(x, y - s * 2, 0)}v${f(s * 4)}`;
  }
  b.push(`<path d="${gl}" stroke="#fff1dc" stroke-width="1.2" opacity=".55"/>`);
  // rising memory motes (warm), sparse
  let motes = '';
  for (let i = 0; i < 26; i++) {
    const x = R.range(700, 1550), y = R.range(120, 620);
    motes += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(R.range(1, 3))}" opacity="${f(R.range(0.3, 0.8), 2)}"/>`;
  }
  b.push(`<g fill="#ffd8a8">${motes}</g>`);
  b.push(`<rect y="${H * 0.78}" width="${W}" height="${H * 0.22}" fill="url(#${p}-fade)"/>`);
  return svgDoc(W, H, '黎明：银色铁轨与停驻的列车', defs.join(''), b.join(''));
}

// =================================================================================================
// CAMP: warm dim dining car of the Silver Rail (soft focus, low contrast)
// =================================================================================================
export function campBg() {
  const p = 'cbg';
  const R = rng(733);
  const defs = [];
  defs.push(blur(`${p}-soft`, 2.6, 10));
  defs.push(linear(`${p}-wall`, [[0, '#2a1a22'], [0.6, '#3a2228'], [1, '#22141a']]));
  defs.push(linear(`${p}-panel`, [[0, '#4a2c2c'], [1, '#2e1a1e']]));
  defs.push(linear(`${p}-ceil`, [[0, '#120c16'], [1, '#2a1a20']]));
  defs.push(linear(`${p}-night`, [[0, '#0c0a24'], [0.7, '#241a4a'], [1, '#3a2860']]));
  defs.push(linear(`${p}-curtain`, [[0, '#4a1424'], [0.5, '#7a2436'], [1, '#3a0e1c']], 'x1="0" y1="0" x2="1" y2="0"'));
  defs.push(radial(`${p}-lamp`, [[0, '#ffe2a8', 0.95], [0.25, '#ffb45e', 0.5], [1, '#ff9a3c', 0]]));
  defs.push(radial(`${p}-corona`, [[0.35, '#f6f0ff', 0.8], [0.5, '#c8b6ff', 0.35], [1, '#8f6be0', 0]]));
  defs.push(linear(`${p}-fade`, [[0, '#0c0b1b', 0], [1, '#0c0b1b', 0.85]]));
  defs.push(radial(`${p}-haze`, [[0, '#ffb45e', 0.16], [1, '#ffb45e', 0]]));
  defs.push(radial(`${p}-vig`, [[0.5, '#0c0b1b', 0], [1, '#0c0b1b', 0.7]], 'cx="0.5" cy="0.45" r="0.8"'));
  const b = [];
  // back wall
  b.push(`<rect width="${W}" height="${H}" fill="url(#${p}-wall)"/>`);
  // ceiling with a gentle curve + brass ribs + pendant lamps
  b.push(`<path d="M0,0H${W}V120C1200,150,400,150,0,120Z" fill="url(#${p}-ceil)"/>`);
  b.push(`<path d="M0,120C400,150,1200,150,${W},120" fill="none" stroke="#b88a4a" stroke-width="5" opacity=".55"/>`);
  let ribs = '';
  for (let x = 0; x <= W; x += 400) ribs += `M${x - 30},${f(122 + 30 * Math.sin(Math.PI * x / W), 0)}Q${x},${f(90 + 30 * Math.sin(Math.PI * x / W), 0)} ${x + 30},${f(122 + 30 * Math.sin(Math.PI * x / W), 0)}`;
  b.push(`<path d="${ribs}" fill="none" stroke="#8a6a3e" stroke-width="5" opacity=".6"/>`);
  b.push(`<path d="M0,60C400,84,1200,84,${W},60" fill="none" stroke="#3a2618" stroke-width="3" opacity=".7"/>`);
  // windows: four tall arched windows with the eclipse night outside
  const wins = [200, 600, 1000, 1400];
  const wTop = 200, wBot = 560, ww = 250;
  const arch = (cx) => `M${cx - ww / 2},${wBot}V${wTop + 60}Q${cx - ww / 2},${wTop} ${cx},${wTop}Q${cx + ww / 2},${wTop} ${cx + ww / 2},${wTop + 60}V${wBot}Z`;
  let winD = '';
  for (const cx of wins) winD += arch(cx);
  b.push(`<path d="${winD}" fill="url(#${p}-night)"/>`);
  // outside: stars, distant hills sliding by, the eclipse in the left window
  b.push(`<g clip-path="url(#${p}-wclip)">${stars(R, 120, [0, wTop, W, wBot], 1.4)}`
    + `<path d="M0,500C200,470,320,490,520,460S900,480,1100,450S1400,470,1600,455V560H0Z" fill="#1a1436"/>`
    + `<path d="M0,530C260,512,500,526,800,506S1300,520,1600,500V560H0Z" fill="#120e28"/>`
    + `<circle cx="214" cy="300" r="110" fill="url(#${p}-corona)"/><circle cx="214" cy="300" r="38" fill="#0a0818" stroke="#f6f0ff" stroke-width="2"/></g>`);
  defs.push(`<clipPath id="${p}-wclip"><path d="${winD}"/></clipPath>`);
  // window frames, glazing bars, reflection streaks
  let bars = '';
  for (const cx of wins) bars += `M${cx},${wTop}V${wBot}M${cx - ww / 2},${wTop + 150}H${cx + ww / 2}`;
  b.push(`<path d="${winD}" fill="none" stroke="#5e4223" stroke-width="14"/>`);
  b.push(`<path d="${winD}" fill="none" stroke="#d6a868" stroke-width="2.5" opacity=".6"/>`);
  b.push(`<path d="${bars}" stroke="#3a2618" stroke-width="6"/>`);
  let refl = '';
  for (const cx of wins) refl += `M${cx - 90},${wBot - 40}L${cx - 30},${wTop + 70}M${cx - 60},${wBot - 20}L${cx - 14},${wTop + 120}`;
  b.push(`<path d="${refl}" stroke="#ffd8a8" stroke-width="6" opacity=".08"/>`);
  // curtains at each window, tied back with gold cords
  let cur = '', curFold = '';
  for (const cx of wins) {
    for (const side of [-1, 1]) {
      const x0 = cx + side * (ww / 2 + 26), x1 = cx + side * (ww / 2 - 34);
      cur += `M${x0},${wTop - 30}C${x0},${wTop + 120} ${x1},${wTop + 180} ${x1 + side * 6},${wTop + 250}C${x1 + side * 20},${wTop + 300} ${x0 - side * 6},${wBot - 40} ${x0 - side * 4},${wBot + 30}L${x0 + side * 34},${wBot + 30}L${x0 + side * 30},${wTop - 30}Z`;
      curFold += `M${x0 + side * 10},${wTop - 20}C${x0 + side * 6},${wTop + 120} ${x1 + side * 22},${wTop + 200} ${x1 + side * 20},${wTop + 250}M${x0 + side * 20},${wTop + 280}C${x0 + side * 16},${wBot - 40} ${x0 + side * 14},${wBot} ${x0 + side * 14},${wBot + 30}`;
    }
  }
  b.push(`<path d="${cur}" fill="url(#${p}-curtain)"/>`);
  b.push(`<path d="${curFold}" fill="none" stroke="#2a0812" stroke-width="4" opacity=".6"/>`);
  let ties = '';
  for (const cx of wins) for (const side of [-1, 1]) ties += `<circle cx="${cx + side * (ww / 2 - 22)}" cy="${wTop + 250}" r="8"/>`;
  b.push(`<g fill="#e0b060">${ties}</g>`);
  // wainscot panels below the windows
  let pan = '';
  for (let x = 20; x < W; x += 200) pan += `<rect x="${x}" y="610" width="160" height="150" rx="6"/>`;
  b.push(`<rect y="590" width="${W}" height="310" fill="#2a181c"/>`);
  b.push(`<g fill="url(#${p}-panel)" stroke="#6a4a2e" stroke-width="2">${pan}</g>`);
  b.push(`<path d="M0,592H${W}" stroke="#d6a868" stroke-width="4" opacity=".55"/>`);
  // wall sconces between the windows
  let sc = '', glow = '';
  for (const x of [0, 400, 800, 1200, 1600]) {
    glow += `<circle cx="${x}" cy="300" r="170" fill="url(#${p}-lamp)" opacity=".75"/>`;
    sc += `<path d="M${x - 6},340h12v-24h-12z" fill="#8a6a3e"/><path d="M${x - 16},316C${x - 18},296 ${x - 10},276 ${x},270C${x + 10},276 ${x + 18},296 ${x + 16},316Z" fill="#ffd9a0"/>`;
  }
  b.push(glow + sc);
  // pendant lamps from the ceiling
  let pend = '';
  for (const x of [300, 800, 1300]) {
    pend += `<path d="M${x},130V176" stroke="#5e4223" stroke-width="3"/><circle cx="${x}" cy="200" r="110" fill="url(#${p}-lamp)" opacity=".6"/><path d="M${x - 26},196C${x - 22},178 ${x + 22},178 ${x + 26},196Z" fill="#c89048"/><ellipse cx="${x}" cy="198" rx="14" ry="5" fill="#fff0c8"/>`;
  }
  b.push(pend);
  // tables in the foreground with lamps (left and right, away from the portrait)
  // two dining tables (left/right, clear of the portrait): lit cloth top + hanging drape with folds
  defs.push(linear(`${p}-cloth`, [[0, '#f2dcc0'], [1, '#c9a888']]));
  defs.push(linear(`${p}-drape`, [[0, '#8a5a4a'], [1, '#3a2024']]));
  b.push(`<path d="M-20,768L404,752L420,786L-20,804Z" fill="url(#${p}-cloth)"/><path d="M1196,752L1620,768V804L1180,786Z" fill="url(#${p}-cloth)"/>`);
  b.push(`<path d="M-20,804L420,786L428,900H-20Z" fill="url(#${p}-drape)"/><path d="M1180,786L1620,804V900H1172Z" fill="url(#${p}-drape)"/>`);
  let folds = '';
  for (let x = 30; x < 420; x += 52) folds += `M${x},${f(803 - x * 0.04, 0)}q6,50 -2,97`;
  for (let x = 1220; x < 1610; x += 52) folds += `M${x},${f(787 + (x - 1180) * 0.04, 0)}q-6,50 2,113`;
  b.push(`<path d="${folds}" fill="none" stroke="#2a1418" stroke-width="5" opacity=".5"/>`);
  b.push(`<path d="M-20,768L404,752L420,786M1196,752L1620,768M1180,786L1196,752" fill="none" stroke="#fff0d8" stroke-width="2.5" opacity=".6"/>`);
  for (const x of [190, 1410]) {
    b.push(`<circle cx="${x}" cy="660" r="190" fill="url(#${p}-lamp)" opacity=".8"/>`);
    b.push(`<path d="M${x - 4},758V690h8v68z" fill="#8a6a3e"/><path d="M${x - 40},690L${x - 24},640H${x + 24}L${x + 40},690Z" fill="#ffcf8a"/><path d="M${x - 40},690H${x + 40}" stroke="#c89048" stroke-width="3"/><ellipse cx="${x}" cy="764" rx="30" ry="6" fill="#8a6a3e"/>`);
  }
  // cups / glasses glints
  b.push(`<g fill="none" stroke="#fff4dc" stroke-width="2" opacity=".6"><path d="M300,764v-22h20v22M1290,764v-22h20v22"/><ellipse cx="350" cy="774" rx="22" ry="5"/><ellipse cx="1250" cy="774" rx="22" ry="5"/></g>`);
  // warm haze + soft focus overlay
  const all = b.join('');
  const out = [`<g filter="url(#${p}-soft)">${all}</g>`];
  out.push(`<ellipse cx="800" cy="420" rx="900" ry="520" fill="url(#${p}-haze)"/>`);
  out.push(`<rect width="${W}" height="${H}" fill="#1a0e1a" opacity=".18"/>`);
  out.push(`<rect width="${W}" height="${H}" fill="url(#${p}-vig)"/>`);
  out.push(`<rect y="${H * 0.8}" width="${W}" height="${H * 0.2}" fill="url(#${p}-fade)"/>`);
  return svgDoc(W, H, '银辉列车餐车：琥珀灯光', defs.join(''), out.join(''));
}
