// UI art: dawn seed, S-rank eclipse crest, card back, booster pack. No filters (glows are gradients).
import { PAL, rng, f, P, poly, line, shape, radial, linear, svgDoc, eclipseSigil } from './lib.mjs';

function ellipsePts(cx, cy, rx, ry, rot, a0, a1, n = 40) {
  const r = rot * Math.PI / 180, out = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * i / n;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    out.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return out;
}

// =================================================================================================
// 黎明种 Dawn Seed — glowing seed-crystal in tilted orbit rings (600x600, transparent)
// =================================================================================================
export function dawnSeed() {
  const p = 'ds';
  const C = [300, 304];
  const defs = [];
  defs.push(radial(`${p}-halo`, [[0, '#fff3d6', 0.55], [0.3, '#ffd091', 0.22], [0.65, '#b58cff', 0.08], [1, '#b58cff', 0]]));
  defs.push(radial(`${p}-core`, [[0, '#ffffff'], [0.25, '#fff4dc'], [0.55, '#ffd091', 0.85], [1, '#ff9a5a', 0]]));
  defs.push(linear(`${p}-ring`, [[0, '#ffe6b8'], [0.5, '#e8ddff'], [1, '#b58cff']], 'x1="0" y1="0" x2="1" y2="1"'));
  defs.push(linear(`${p}-edge`, [[0, '#ffffff', 0.9], [1, '#d9c6ff', 0.3]], 'x1="0" y1="0" x2="1" y2="1"'));
  const back = [], front = [];
  back.push(`<circle cx="${C[0]}" cy="${C[1]}" r="290" fill="url(#${p}-halo)"/>`);
  // three tilted orbit rings: back halves behind the crystal, front halves in front
  const rings = [[250, 74, -18, 2.6], [214, 58, 32, 2], [268, 40, 8, 1.6]];
  const rnd = rng(17);
  rings.forEach(([rx, ry, rot, w], k) => {
    const bk = ellipsePts(C[0], C[1], rx, ry, rot, Math.PI, Math.PI * 2);
    const fr = ellipsePts(C[0], C[1], rx, ry, rot, 0, Math.PI);
    back.push(`<path d="${line(bk)}" fill="none" stroke="url(#${p}-ring)" stroke-width="${w}" opacity=".45"/>`);
    front.push(`<path d="${line(fr)}" fill="none" stroke="url(#${p}-ring)" stroke-width="${w + 0.6}" opacity=".95"/>`);
    // rune marks: dots, ticks and tiny lozenges riding the ring (no text)
    let marks = '', dots = '';
    const n = 30 - k * 6;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + k * 0.3;
      const [x, y] = ellipsePts(C[0], C[1], rx, ry, rot, a, a, 1)[0];
      const isFront = Math.sin(a) > 0;
      const op = isFront ? 1 : 0.4;
      const t = i % 5;
      if (t === 0) marks += `<path d="M${P(x, y - 5)}l4,5l-4,5l-4,-5z" opacity="${op}"/>`;
      else if (t === 2) dots += `<circle cx="${f(x)}" cy="${f(y)}" r="2.2" opacity="${op}"/>`;
      else if (t === 3) marks += `<path d="M${P(x - 4, y)}h8" stroke="#ffe6b8" stroke-width="1.6" opacity="${op}"/>`;
      else if (t === 4 && rnd() < 0.6) marks += `<path d="M${P(x, y - 4)}v8" stroke="#e8ddff" stroke-width="1.6" opacity="${op}"/>`;
    }
    front.push(`<g fill="#ffe6b8">${marks}${dots}</g>`);
    // an orbiting bead on each ring
    const a = [0.6, 2.2, 1.2][k];
    const [bx, by] = ellipsePts(C[0], C[1], rx, ry, rot, a, a, 1)[0];
    front.push(`<circle cx="${f(bx)}" cy="${f(by)}" r="13" fill="url(#${p}-core)" opacity=".8"/><circle cx="${f(bx)}" cy="${f(by)}" r="4.5" fill="#fff8ea"/>`);
  });
  // the seed crystal: faceted almond, violet shell, pearl-gold heart
  const seed = [];
  const H = 132, Wd = 86; // half-height, half-width
  const outer = [], mid = [];
  const N = 12;
  for (let i = 0; i < N; i++) {
    const a = -Math.PI / 2 + i / N * Math.PI * 2;
    const tip = Math.max(0, -Math.sin(a)); // sharpen the top
    const rx = Wd * (1 - tip * 0.55), ry = H;
    outer.push([C[0] + Math.cos(a) * rx, C[1] + 14 + Math.sin(a) * ry * (Math.sin(a) < 0 ? 1.08 : 0.86)]);
    const b = a + Math.PI / N;
    const tip2 = Math.max(0, -Math.sin(b));
    mid.push([C[0] + Math.cos(b) * Wd * 0.56 * (1 - tip2 * 0.4), C[1] + 18 + Math.sin(b) * H * 0.56 * (Math.sin(b) < 0 ? 1.06 : 0.84)]);
  }
  defs.push(`<clipPath id="${p}-seedclip"><path d="${poly(outer)}"/></clipPath>`);
  seed.push(`<path d="${poly(outer)}" fill="#2a1a5a"/>`);
  // inner glow showing through the shell
  seed.push(`<g clip-path="url(#${p}-seedclip)"><circle cx="${C[0]}" cy="${C[1] + 22}" r="120" fill="url(#${p}-core)"/></g>`);
  // facets: lit from the upper left
  const L = [-0.6, -0.8];
  const shade = (pts) => {
    const cx = pts.reduce((s, q) => s + q[0], 0) / pts.length - C[0], cy = pts.reduce((s, q) => s + q[1], 0) / pts.length - C[1];
    const d = Math.hypot(cx, cy) || 1;
    return (cx / d) * L[0] + (cy / d) * L[1]; // -1..1
  };
  const violet = ['#3b2478', '#5a3aa6', '#7d5cd6', '#a98af0', '#d6c4ff'];
  let facets = '';
  for (let i = 0; i < N; i++) {
    const o0 = outer[i], o1 = outer[(i + 1) % N], m0 = mid[i], mPrev = mid[(i - 1 + N) % N];
    for (const tri of [[o0, o1, m0], [mPrev, o0, m0]]) {
      const v = shade(tri);
      const idx = Math.max(0, Math.min(4, Math.round((v + 1) * 2)));
      facets += `<path d="${poly(tri)}" fill="${violet[idx]}" opacity="${f(0.62 + v * 0.18, 2)}"/>`;
    }
  }
  seed.push(facets);
  // inner (core) facets: translucent gold
  let core = '';
  for (let i = 0; i < N; i++) {
    const tri = [mid[i], mid[(i + 1) % N], [C[0] + 4, C[1] + 26]];
    const v = shade(tri);
    core += `<path d="${poly(tri)}" fill="${v > 0 ? '#fff1d0' : '#ffc070'}" opacity="${f(0.35 + v * 0.2, 2)}"/>`;
  }
  seed.push(core);
  seed.push(`<circle cx="${C[0] + 4}" cy="${C[1] + 26}" r="44" fill="url(#${p}-core)"/>`);
  // facet edges + outline
  let edges = '';
  for (let i = 0; i < N; i++) edges += `M${P(...outer[i])}L${P(...mid[i])}L${P(...outer[(i + 1) % N])}M${P(...mid[i])}L${P(...mid[(i + 1) % N])}`;
  seed.push(`<path d="${edges}" fill="none" stroke="url(#${p}-edge)" stroke-width="1.4" opacity=".7"/>`);
  seed.push(`<path d="${poly(outer)}" fill="none" stroke="#f3e8ff" stroke-width="2.4" stroke-linejoin="round"/>`);
  seed.push(`<path d="${poly(outer)}" fill="none" stroke="#1a0f3a" stroke-width="1" transform="translate(1.5 2)" opacity=".5"/>`);
  // specular glints on the upper-left facets
  seed.push(`<path d="M${P(outer[10][0] + 10, outer[10][1] + 6)}L${P(mid[10][0] - 2, mid[10][1] + 2)}" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".85"/>`);
  seed.push(`<path d="M${P(outer[11][0] + 4, outer[11][1] + 12)}l8,26" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>`);
  // heart sparkle
  const sx = C[0] + 4, sy = C[1] + 26;
  seed.push(`<path d="M${sx},${sy - 34}L${sx + 5},${sy - 5}L${sx + 34},${sy}L${sx + 5},${sy + 5}L${sx},${sy + 34}L${sx - 5},${sy + 5}L${sx - 34},${sy}L${sx - 5},${sy - 5}Z" fill="#ffffff"/>`);
  seed.push(`<circle cx="${sx}" cy="${sy}" r="6" fill="#ffffff"/>`);
  // a first thread of light sprouting from the tip (dawn)
  const tip = outer[0];
  seed.push(`<path d="M${P(...tip)}C${P(tip[0] + 2, tip[1] - 24)} ${P(tip[0] + 26, tip[1] - 34)} ${P(tip[0] + 22, tip[1] - 58)}" fill="none" stroke="#ffd091" stroke-width="3" stroke-linecap="round"/>`);
  seed.push(`<path d="M${P(tip[0] + 14, tip[1] - 38)}c10,-10,24,-8,28,-2c-10,8,-22,8,-28,2z" fill="#ffe6b0"/>`);
  seed.push(`<circle cx="${f(tip[0] + 22)}" cy="${f(tip[1] - 60)}" r="9" fill="url(#${p}-core)"/>`);
  // motes
  const R = rng(44);
  let motes = '';
  for (let i = 0; i < 24; i++) {
    const a = R.range(0, Math.PI * 2), d = R.range(150, 280);
    motes += `<circle cx="${f(C[0] + Math.cos(a) * d)}" cy="${f(C[1] + Math.sin(a) * d * 0.8)}" r="${f(R.range(1, 2.6))}" opacity="${f(R.range(0.4, 0.9), 2)}"/>`;
  }
  return svgDoc(600, 600, '黎明种', defs.join(''), back.join('') + seed.join('') + front.join('') + `<g fill="#fff1d6">${motes}</g>`);
}

// =================================================================================================
// S-rank hidden ending emblem: eclipse inside a silver-gold covenant crest, four woven threads
// =================================================================================================
export function eclipseCrest() {
  const p = 'ec';
  const C = [300, 300];
  const defs = [];
  defs.push(linear(`${p}-gold`, [[0, '#fff0c8'], [0.45, '#ffd091'], [1, '#a8702e']], 'x1="0" y1="0" x2="1" y2="1"'));
  defs.push(linear(`${p}-silver`, [[0, '#ffffff'], [0.5, '#d6d0ee'], [1, '#7c789c']], 'x1="0" y1="0" x2="1" y2="1"'));
  defs.push(radial(`${p}-corona`, [[0.45, '#ffffff', 1], [0.56, '#efe6ff', 0.75], [0.75, '#b58cff', 0.3], [1, '#b58cff', 0]]));
  defs.push(radial(`${p}-halo`, [[0, '#b58cff', 0.28], [0.7, '#5a3fb0', 0.08], [1, '#5a3fb0', 0]]));
  defs.push(radial(`${p}-disc`, [[0, '#1a1438'], [1, '#060410']]));
  const s = [];
  s.push(`<circle cx="300" cy="300" r="296" fill="url(#${p}-halo)"/>`);
  // eight-point star: long cardinal blades (gold), short diagonal blades (silver)
  const blade = (ang, len, wid, fill, stroke) => {
    const a = ang * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
    const pt = (u, v) => [C[0] + u * c - v * sn, C[1] + u * sn + v * c];
    const outer = [pt(0, -wid), pt(len, 0), pt(0, wid)];
    const half = [pt(0, 0), pt(len, 0), pt(0, wid)];
    return `<path d="${poly(outer)}" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/><path d="${poly(half)}" fill="#000" opacity=".22"/>`;
  };
  for (let i = 0; i < 4; i++) s.push(blade(45 + i * 90, 238, 30, `url(#${p}-silver)`, '#4a4668'));
  for (let i = 0; i < 4; i++) s.push(blade(-90 + i * 90, 286, 44, `url(#${p}-gold)`, '#6a4620'));
  // medallion rings
  s.push(`<circle cx="300" cy="300" r="176" fill="#0b0920" stroke="url(#${p}-gold)" stroke-width="10"/>`);
  s.push(`<circle cx="300" cy="300" r="164" fill="none" stroke="url(#${p}-silver)" stroke-width="3"/>`);
  s.push(`<circle cx="300" cy="300" r="186" fill="none" stroke="#6a4620" stroke-width="2"/>`);
  let ticks = '';
  for (let i = 0; i < 72; i++) {
    const a = i / 72 * Math.PI * 2, r1 = i % 6 === 0 ? 146 : 154, r2 = 160;
    ticks += `M${P(300 + Math.cos(a) * r1, 300 + Math.sin(a) * r1)}L${P(300 + Math.cos(a) * r2, 300 + Math.sin(a) * r2)}`;
  }
  s.push(`<path d="${ticks}" stroke="#d6d0ee" stroke-width="1.6" opacity=".8"/>`);
  // studs around the inner rim
  let studs = '';
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI / 2 + i / 16 * Math.PI * 2, x = 300 + Math.cos(a) * 168, y = 300 + Math.sin(a) * 168;
    studs += `<circle cx="${f(x)}" cy="${f(y)}" r="${i % 4 === 0 ? 3.6 : 2}"/>`;
  }
  s.push(`<g fill="#fff0c8">${studs}</g>`);
  // eclipse at the heart
  s.push(`<circle cx="300" cy="300" r="118" fill="url(#${p}-corona)"/>`);
  let rays = '';
  for (let i = 0; i < 36; i++) {
    const a = i / 36 * Math.PI * 2, l = i % 2 ? 96 : 112;
    rays += `M${P(300 + Math.cos(a) * 66, 300 + Math.sin(a) * 66)}L${P(300 + Math.cos(a) * l, 300 + Math.sin(a) * l)}`;
  }
  s.push(`<path d="${rays}" stroke="#ffffff" stroke-width="1.6" opacity=".55"/>`);
  s.push(`<circle cx="300" cy="300" r="62" fill="url(#${p}-disc)" stroke="#fff6e4" stroke-width="2.5"/>`);
  s.push(`<path d="M244,326A62,62 0 0 1 344,256" fill="none" stroke="#fffaf0" stroke-width="3.5" stroke-linecap="round" opacity=".9"/>`);
  s.push(`<circle cx="344" cy="256" r="7" fill="#ffffff"/><path d="M344,236v40M324,256h40" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>`);
  // four woven threads: circles offset N/E/S/W, alternating over/under at every crossing
  const cols = ['#ff6b7c', '#5ed7ff', '#b58cff', '#e6e2f6'];
  const off = 24, rr = 114;
  const centres = [[0, -off], [off, 0], [0, off], [-off, 0]].map(([x, y]) => [C[0] + x, C[1] + y]);
  const thread = (i, a0, a1) => {
    const [cx, cy] = centres[i];
    const pts = [];
    const n = Math.max(2, Math.round(Math.abs(a1 - a0) / 0.08));
    for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    const d = line(pts);
    return `<path d="${d}" stroke="#120c24" stroke-width="12" stroke-linecap="butt"/><path d="${d}" stroke="${cols[i]}" stroke-width="7"/><path d="${d}" stroke="#ffffff" stroke-width="1.6" opacity=".55"/>`;
  };
  const all = [];
  for (let i = 0; i < 4; i++) all.push(thread(i, 0, Math.PI * 2 + 0.01));
  s.push(`<g fill="none">${all.join('')}</g>`);
  // crossings: re-draw the "over" thread locally, alternating
  const over = [];
  let parity = 0;
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    const [x1, y1] = centres[i], [x2, y2] = centres[j];
    const d = Math.hypot(x2 - x1, y2 - y1);
    const a = d / 2, h = Math.sqrt(rr * rr - a * a);
    const mx = x1 + (x2 - x1) / 2, my = y1 + (y2 - y1) / 2;
    for (const sg of [1, -1]) {
      const px = mx + sg * h * (y2 - y1) / d * -1, py = my + sg * h * (x2 - x1) / d;
      const top = (parity++ % 2) ? i : j;
      const [cx, cy] = centres[top];
      const ang = Math.atan2(py - cy, px - cx);
      over.push(thread(top, ang - 0.26, ang + 0.26));
    }
  }
  s.push(`<g fill="none">${over.join('')}</g>`);
  // gems at the blade tips' bases (thread colours) + crescents on the diagonals
  const gems = [[300, 96, cols[0]], [504, 300, cols[1]], [300, 504, cols[2]], [96, 300, cols[3]]];
  for (const [x, y, c] of gems) s.push(`<path d="M${x},${y - 14}l11,14l-11,14l-11,-14z" fill="${c}" stroke="#fff6e4" stroke-width="2"/><path d="M${x - 4},${y - 6}l4,-5l3,4z" fill="#ffffff" opacity=".8"/>`);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2, x = 300 + Math.cos(a) * 222, y = 300 + Math.sin(a) * 222;
    s.push(`<circle cx="${f(x)}" cy="${f(y)}" r="12" fill="#ffd091"/><circle cx="${f(x + Math.cos(a) * 5)}" cy="${f(y + Math.sin(a) * 5)}" r="10.5" fill="#0b0920"/>`);
  }
  return svgDoc(600, 600, 'S级隐藏结局：月蚀契约纹章', defs.join(''), s.join(''));
}

// =================================================================================================
// Card back (300x420): navy, silver eclipse sigil, fine filigree
// =================================================================================================
function filigreeCorner() {
  // top-left corner ornament: bracket with curled ends, a leaf spray and dots; caller mirrors it
  return '<path d="M16,78V34Q16,16 34,16H78"/>'
    + '<path d="M24,64V40Q24,24 40,24H64" stroke-width="1"/>'
    + '<path d="M78,16c10,0 15,6 12,12c-2,5 -9,4 -9,-1M16,78c0,10 6,15 12,12c5,-2 4,-9 -1,-9"/>'
    + '<path d="M34,34C44,44 52,46 64,44M34,34C44,44 46,52 44,64M34,34l-6,-6"/>'
    + '<path d="M50,44c4,-6 10,-6 12,-2c-4,4 -9,4 -12,2zM44,50c-6,4 -6,10 -2,12c4,-4 4,-9 2,-12z"/>';
}
export function cardBack() {
  const p = 'cb';
  const defs = [];
  defs.push(linear(`${p}-bg`, [[0, '#141a46'], [0.55, '#0b0f2c'], [1, '#070818']]));
  defs.push(linear(`${p}-silver`, [[0, '#ffffff'], [0.5, '#d6d0ee'], [1, '#8a86aa']], 'x1="0" y1="0" x2="1" y2="1"'));
  defs.push(radial(`${p}-corona`, [[0.5, '#ffffff', 0.9], [0.7, '#c8b6ff', 0.4], [1, '#8f6be0', 0]]));
  defs.push(radial(`${p}-glow`, [[0, '#5a46d0', 0.35], [1, '#5a46d0', 0]]));
  defs.push(`<pattern id="${p}-lat" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0,0H20M0,0V20" stroke="#8f86d6" stroke-width=".6" opacity=".22"/></pattern>`);
  const s = [];
  s.push(`<rect width="300" height="420" rx="16" fill="url(#${p}-bg)"/>`);
  s.push(`<rect x="14" y="14" width="272" height="392" rx="10" fill="url(#${p}-lat)"/>`);
  s.push(`<ellipse cx="150" cy="210" rx="140" ry="150" fill="url(#${p}-glow)"/>`);
  // borders
  s.push(`<rect x="7" y="7" width="286" height="406" rx="12" fill="none" stroke="url(#${p}-silver)" stroke-width="2.4"/>`);
  s.push(`<rect x="14" y="14" width="272" height="392" rx="9" fill="none" stroke="#d6d0ee" stroke-width="1" opacity=".7"/>`);
  s.push(`<rect x="22" y="22" width="256" height="376" rx="6" fill="none" stroke="#d6d0ee" stroke-width=".8" stroke-dasharray="2 4" opacity=".55"/>`);
  // corner filigree (mirrored)
  const corner = filigreeCorner();
  s.push(`<g fill="none" stroke="url(#${p}-silver)" stroke-width="1.6" stroke-linecap="round">${corner}<g transform="matrix(-1 0 0 1 300 0)">${corner}</g><g transform="matrix(1 0 0 -1 0 420)">${corner}</g><g transform="matrix(-1 0 0 -1 300 420)">${corner}</g></g>`);
  // vertical axis filigree with lozenges and crescents
  s.push(`<g fill="none" stroke="#d6d0ee" stroke-width="1.2" opacity=".85"><path d="M150,40V100M150,320V380"/><path d="M150,58l8,10l-8,10l-8,-10zM150,342l8,10l-8,10l-8,-10z"/><path d="M118,96C130,104,170,104,182,96M118,324C130,316,170,316,182,324"/><path d="M100,92c-8,0,-12,-6,-8,-10M200,92c8,0,12,-6,8,-10M100,328c-8,0,-12,6,-8,10M200,328c8,0,12,6,8,10"/></g>`);
  s.push(`<g fill="#ffd091"><circle cx="150" cy="40" r="3"/><circle cx="150" cy="380" r="3"/></g>`);
  s.push(`<path d="M40,130V186M40,234V290M260,130V186M260,234V290" stroke="#d6d0ee" stroke-width="1" opacity=".5"/>`);
  // ornamental ring + side crescents around the sigil
  s.push(`<circle cx="150" cy="210" r="100" fill="none" stroke="#d6d0ee" stroke-width=".9" stroke-dasharray="1 5" stroke-linecap="round" opacity=".9"/>`);
  s.push(`<g fill="#ffd091"><path d="M40,210a16,16 0 1 0 0.1,0zM46,210a13,13 0 1 0 0.1,0z" fill-rule="evenodd"/><path d="M260,210a16,16 0 1 1 -0.1,0zM254,210a13,13 0 1 1 -0.1,0z" fill-rule="evenodd"/></g>`);
  s.push(`<g transform="translate(150 210)">${eclipseSigil(p, 82, { metal: `url(#${p}-silver)`, corona: `url(#${p}-corona)` })}</g>`);
  return svgDoc(300, 420, '卡背：月蚀印', defs.join(''), s.join(''));
}

// =================================================================================================
// Booster pack (300x420): sealed foil pack, crimped ends, holo sheen, eclipse sigil
// =================================================================================================
export function cardPack() {
  const p = 'cp';
  const defs = [];
  defs.push(linear(`${p}-foil`, [[0, '#2a1d5e'], [0.5, '#141039'], [1, '#0a0820']]));
  defs.push(linear(`${p}-holo`, [[0, '#ffffff', 0], [0.18, '#b58cff', 0.28], [0.3, '#5ed7ff', 0.22], [0.42, '#ffffff', 0], [0.6, '#ffd091', 0.2], [0.72, '#ff6b7c', 0.14], [0.85, '#ffffff', 0]], 'x1="0" y1="0" x2="1" y2="1"'));
  defs.push(linear(`${p}-crimp`, [[0, '#d6d0ee'], [0.5, '#8a86aa'], [1, '#4a4668']]));
  defs.push(linear(`${p}-silver`, [[0, '#ffffff'], [0.5, '#e6dcff'], [1, '#9a90c0']], 'x1="0" y1="0" x2="1" y2="1"'));
  defs.push(linear(`${p}-gold`, [[0, '#fff0c8'], [0.5, '#ffd091'], [1, '#b07a36']], 'x1="0" y1="0" x2="1" y2="1"'));
  defs.push(linear(`${p}-side`, [[0, '#000', 0.5], [0.12, '#000', 0], [0.88, '#000', 0], [1, '#000', 0.55]], 'x1="0" y1="0" x2="1" y2="0"'));
  defs.push(radial(`${p}-corona`, [[0.5, '#ffffff', 0.95], [0.7, '#ffd9a0', 0.45], [1, '#ff9a5a', 0]]));
  defs.push(radial(`${p}-burst`, [[0, '#b58cff', 0.5], [1, '#b58cff', 0]]));
  const s = [];
  // pack body with a slight pinch toward the crimped ends
  const body = 'M22,44C30,60,28,120,26,210C24,300,30,360,22,376H278C270,360,276,300,274,210C272,120,270,60,278,44Z';
  defs.push(`<clipPath id="${p}-clip"><path d="${body}"/></clipPath>`);
  s.push(`<path d="${body}" fill="url(#${p}-foil)"/>`);
  s.push(`<g clip-path="url(#${p}-clip)">`
    + `<circle cx="150" cy="200" r="150" fill="url(#${p}-burst)"/>`
    + raysBurst(150, 200, 28, 60, 230)
    + `<rect width="300" height="420" fill="url(#${p}-holo)"/>`
    + `<path d="M-40,140L340,20V60L-40,180Z" fill="#ffffff" opacity=".06"/><path d="M-40,330L340,210V226L-40,346Z" fill="#ffffff" opacity=".07"/>`
    + `<rect width="300" height="420" fill="url(#${p}-side)"/>`
    + `</g>`);
  // frame lines + small stars
  s.push(`<path d="M44,74H256M44,346H256" stroke="url(#${p}-gold)" stroke-width="1.6" opacity=".8"/>`);
  s.push(`<path d="M44,80H256M44,340H256" stroke="#d6d0ee" stroke-width=".8" opacity=".6"/>`);
  let st = '';
  for (const [x, y, r] of [[70, 110, 5], [232, 120, 4], [62, 300, 4], [240, 292, 6], [200, 96, 3], [96, 322, 3]]) st += `<path d="M${x},${y - r}L${x + r * 0.3},${y - r * 0.3}L${x + r},${y}L${x + r * 0.3},${y + r * 0.3}L${x},${y + r}L${x - r * 0.3},${y + r * 0.3}L${x - r},${y}L${x - r * 0.3},${y - r * 0.3}Z"/>`;
  s.push(`<g fill="#fff4dc" opacity=".85">${st}</g>`);
  // central sigil (gold-silver)
  s.push(`<g transform="translate(150 206)">${eclipseSigil(p, 92, { metal: `url(#${p}-silver)`, corona: `url(#${p}-corona)`, starFill: '#1a1240' })}</g>`);
  // rarity pips below the sigil
  s.push(`<g fill="url(#${p}-gold)"><path d="M126,322l6,-7l6,7l-6,7zM144,322l6,-7l6,7l-6,7zM162,322l6,-7l6,7l-6,7z"/></g>`);
  // crimped seals top + bottom with serrated cut edges
  const crimp = (y0, y1, top) => {
    let edge = '';
    const ye = top ? y0 : y1;
    for (let x = 20, i = 0; x <= 280; x += 8, i++) edge += `${i ? 'L' : 'M'}${x},${ye + (i % 2 ? (top ? 5 : -5) : 0)}`;
    const d = top ? `${edge}L280,${y1}L20,${y1}Z` : `M20,${y0}L280,${y0}${edge.replace('M', 'L').split('L').reverse().join('L').replace(/^L/, 'L')}Z`;
    let ridges = '';
    for (let x = 26; x < 278; x += 6) ridges += `M${x},${y0 + 4}V${y1 - 4}`;
    return `<path d="${top ? d : `M20,${y0}H280V${y1}` + edgeBottom(y1) + 'Z'}" fill="url(#${p}-crimp)"/><path d="${ridges}" stroke="#4a4668" stroke-width="1.2" opacity=".55"/><path d="M20,${top ? y1 : y0}H280" stroke="#2a2648" stroke-width="2"/>`;
  };
  const edgeBottom = (y) => { let e = ''; for (let x = 280, i = 0; x >= 20; x -= 8, i++) e += `L${x},${y + (i % 2 ? 5 : 0)}`; return e; };
  s.push(crimp(14, 46, true));
  s.push(crimp(374, 406, false));
  // tear notch (top right)
  s.push(`<path d="M268,20l6,6l-6,6z" fill="#0b0920"/>`);
  // outer edge highlight
  s.push(`<path d="${body}" fill="none" stroke="#e6dcff" stroke-width="1.6" opacity=".5"/>`);
  return svgDoc(300, 420, '卡包：月蚀补充包', defs.join(''), s.join(''));
}

function raysBurst(cx, cy, n, r0, r1) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, w = 0.035;
    d += `M${P(cx + Math.cos(a - w) * r0, cy + Math.sin(a - w) * r0)}L${P(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1)}L${P(cx + Math.cos(a + w) * r0, cy + Math.sin(a + w) * r0)}Z`;
  }
  return `<path d="${d}" fill="#d6c4ff" opacity=".12"/>`;
}
