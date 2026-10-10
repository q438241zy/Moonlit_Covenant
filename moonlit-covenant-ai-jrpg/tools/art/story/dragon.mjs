// The nameless black dragon (无名黑龙): non-reflective black scales, torn wing membranes trailing smoke,
// dark-red furnace glow between the belly scales, black chains with violet runes around the neck,
// a crown-shaped crack around the left eye. Local frame: facing left, body centre at (0,0), wingspan ≈ 1000.
import { rng, f, shape, pz, pl, noise1 } from './lib.mjs';
import { spine } from '../stage/lib.mjs';

const r0 = (v) => f(v, 0);
const rad = (d) => d * Math.PI / 180;
const at = (p, a, l) => [p[0] + Math.cos(rad(a)) * l, p[1] + Math.sin(rad(a)) * l];

const POSES = {
  // gliding across the moon, wings raised and swept back (seen from below / side)
  glide: {
    spine: [[-300, -70, 17, 15], [-240, -40, 23, 21], [-170, -6, 34, 34], [-90, 14, 62, 68], [10, 22, 60, 58], [120, 14, 44, 40], [230, 24, 26, 22], [350, 56, 14, 12], [470, 52, 7, 6], [570, 20, 1.5, 1.5]],
    head: { a: -164, s: 1.25 },
    near: { sh: [-90, -40], armA: -150, armL: 160, foreA: -58, foreL: 150, fingers: [[-26, 420], [-2, 370], [22, 310], [46, 250]], attach: [150, -10] },
    far: { sh: [-40, -46], armA: -80, armL: 140, foreA: -36, foreL: 140, fingers: [[-46, 330], [-24, 305], [-2, 270], [20, 215]], attach: [170, -14] },
    fore: [[-60, 70], [-30, 120], [-80, 140]], hind: [[110, 50], [80, 110], [150, 130]],
  },
  // banking turn over the village, near wing high, far wing dipping below the body
  bank: {
    spine: [[-290, -110, 17, 15], [-230, -70, 23, 21], [-170, -24, 34, 34], [-90, 6, 62, 68], [10, 20, 60, 58], [120, 22, 44, 40], [220, 50, 26, 22], [320, 100, 14, 12], [420, 122, 7, 6], [500, 104, 1.5, 1.5]],
    head: { a: -146, s: 1.25 },
    near: { sh: [-90, -40], armA: -140, armL: 170, foreA: -70, foreL: 160, fingers: [[-30, 450], [-8, 400], [16, 350], [40, 280]], attach: [150, -4] },
    far: { sh: [-40, 30], armA: 130, armL: 120, foreA: 175, foreL: 110, fingers: [[150, 260], [128, 240], [106, 210], [84, 170]], attach: [120, 50] },
    fore: [[-60, 70], [-20, 110], [-70, 128]], hind: [[110, 60], [90, 120], [160, 136]],
  },
  // struck in the belly: body jack-knifed, head thrown back, wings flung up
  recoil: {
    spine: [[-230, -190, 17, 15], [-190, -130, 23, 21], [-150, -66, 34, 34], [-80, -4, 62, 68], [20, 30, 62, 60], [120, 4, 44, 40], [200, -34, 26, 22], [290, -44, 14, 12], [390, -14, 7, 6], [460, 34, 1.5, 1.5]],
    head: { a: -110, s: 1.25 },
    near: { sh: [-80, -50], armA: -150, armL: 150, foreA: -95, foreL: 140, fingers: [[-50, 360], [-26, 330], [-4, 290], [18, 240]], attach: [130, -26] },
    far: { sh: [-20, -52], armA: -70, armL: 130, foreA: -30, foreL: 120, fingers: [[-6, 300], [16, 270], [38, 230], [60, 180]], attach: [150, -26] },
    fore: [[-40, 80], [10, 120], [-30, 150]], hind: [[120, 60], [150, 120], [100, 150]],
  },
};

// One wing: membrane (with ragged trailing edge + holes, even-odd), bones, and smoke anchor points.
function wing(R, w, seed) {
  const elbow = at(w.sh, w.armA, w.armL), wrist = at(elbow, w.foreA, w.foreL);
  const tips = w.fingers.map(([a, l]) => at(wrist, a, l));
  const nz = noise1(seed, 30);
  const pts = [w.sh, elbow, wrist, tips[0]];
  const edge = [tips[0]];
  const holes = [], smokeAt = [];
  const span = [...tips, w.attach];
  for (let i = 0; i < span.length - 1; i++) {
    const a = span[i], b = span[i + 1];
    // scallop pulled toward the wrist; torn notches on some cells
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const pull = 0.5;
    const c = [mid[0] + (wrist[0] - mid[0]) * pull, mid[1] + (wrist[1] - mid[1]) * pull];
    const torn = i % 2 === 0 || R() < 0.4;
    const N = 9;
    for (let k = 1; k <= N; k++) {
      const t = k / N;
      // quadratic Bézier point
      let x = (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0];
      let y = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1];
      if (torn && k < N) {
        const j = nz(i * 100 + k * 13) * 22 + (k % 3 === 1 ? -26 : 0);
        x += (wrist[0] - x) * j / 400; y += (wrist[1] - y) * j / 400;
        // a deep tear slit
        if (k === 4 && i % 2 === 0) {
          pts.push([x, y]);
          const dx = wrist[0] - x, dy = wrist[1] - y;
          pts.push([x + dx * 0.22 + 6, y + dy * 0.22]);
          x += 10; y += 6;
        }
      }
      pts.push([x, y]); edge.push([x, y]);
      if (torn && k % 3 === 2) smokeAt.push([x, y]);
    }
    // holes inside the cell
    if (i < tips.length - 1 && R() < 0.85) {
      const n = R() < 0.5 ? 1 : 2;
      for (let h = 0; h < n; h++) {
        const u = R.range(0.55, 0.82), v = R.range(0.3, 0.7);
        const e = [a[0] + (b[0] - a[0]) * v, a[1] + (b[1] - a[1]) * v];
        const cx = wrist[0] + (e[0] - wrist[0]) * u, cy = wrist[1] + (e[1] - wrist[1]) * u;
        const rr = R.range(8, 22), hp = [];
        for (let q = 0; q < 6; q++) { const ang = q / 6 * Math.PI * 2 + R.range(-0.3, 0.3); hp.push([cx + Math.cos(ang) * rr * R.range(0.6, 1.3), cy + Math.sin(ang) * rr * R.range(0.5, 1)]); }
        holes.push(hp);
      }
    }
  }
  const membrane = pz(pts) + holes.map((h) => pz(h)).join('');
  const taper = (a, b, w0, w1) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; return pz([[a[0] + nx * w0, a[1] + ny * w0], [b[0] + nx * w1, b[1] + ny * w1], [b[0] - nx * w1 * 0.4, b[1] - ny * w1 * 0.4], [a[0] - nx * w0, a[1] - ny * w0]]); };
  let bones = taper(w.sh, elbow, 9, 7) + taper(elbow, wrist, 7, 5.5);
  for (const t of tips) bones += taper(wrist, t, 5, 1);
  const leading = pl([w.sh, elbow, wrist, tips[0]]);
  return { membrane, bones, leading, smokeAt, wrist, elbow, tips };
}

function head(cx, cy, a, s) {
  // drawn pointing along +x then rotated; jaw slightly open, swept horns
  const flipY = Math.cos(rad(a)) < 0 ? -1 : 1; // keep horns on top when the head points left
  const P = (x, y0) => { const y = y0 * flipY, c = Math.cos(rad(a)), sn = Math.sin(rad(a)); return [cx + (x * c - y * sn) * s, cy + (x * sn + y * c) * s]; };
  const skull = [P(-10, -18), P(30, -26), P(70, -18), P(104, -8), P(112, 0), P(100, 4), P(64, 6), P(40, 14), P(0, 20)];
  const jaw = [P(30, 12), P(64, 12), P(98, 20), P(86, 26), P(50, 26), P(10, 22)];
  const hornA = [P(10, -18), P(-40, -44), P(-90, -52), P(-50, -34), P(-6, -10)];
  const hornB = [P(24, -22), P(-14, -60), P(-56, -82), P(-30, -54), P(8, -16)];
  const spikes = [P(0, 18), P(-24, 34), P(-6, 20), P(-30, 22), P(-10, 12)];
  const eye = P(46, -10);
  const crown = [P(36, -14), P(40, -24), P(44, -16), P(48, -26), P(52, -16), P(56, -24), P(58, -12)];
  return {
    fill: pz(skull) + pz(jaw) + pz(hornA) + pz(hornB) + pz(spikes),
    rim: pl([P(-10, -18), P(30, -26), P(70, -18), P(104, -8)]) + pl([P(-90, -52), P(-40, -44), P(10, -18)]) + pl([P(-56, -82), P(-14, -60), P(24, -22)]),
    mouth: pz([P(64, 7), P(100, 6), P(96, 17), P(62, 12)]),
    eye, crown: pl(crown),
  };
}

// Render the dragon. o: { x, y, s, rot, flip, pose, ink, rim, glow (0..1), smoke (svg colour), blurSmall, blurBig, wound }
export function dragon(S, o) {
  const { x, y, s = 1, rot = 0, flip = false, pose = 'glide', seed = 7, rimCol = '#7a7aa8', rimOp = 0.7, glow = 1, wound = false } = o;
  const R = rng(seed);
  const PZ = POSES[pose];
  const ink = o.ink || '#07060c', memb = o.memb || '#110d18';
  const sp = spine(PZ.spine);
  const N = 44;
  const up = [], lo = [];
  for (let i = 0; i <= N; i++) { const t = i / N; up.push(sp.at(t, 1)); lo.push(sp.at(t, -1)); }
  const body = shape([...up, ...lo.reverse()], true, 0);
  // dorsal spikes along the upper outline
  let spikes = '';
  for (let i = 3; i < N - 4; i += 2) {
    const F = sp(i / N), b = sp.at(i / N, 1), len = (F.wu * 0.55 + 6) * (i < N * 0.4 ? 1.1 : 0.8);
    spikes += pz([[b[0] - F.tx * 6, b[1] - F.ty * 6], [b[0] + F.nx * len + F.tx * 8, b[1] + F.ny * len + F.ty * 8], [b[0] + F.tx * 6, b[1] + F.ty * 6]]);
  }
  // tucked limbs: thigh -> shin -> claws (stroked so the joints stay readable)
  const limb = (base, pts, w) => {
    const P0 = [base[0], base[1]], J = [base[0] + pts[0][0] * 0.4, base[1] + pts[0][1] * 0.4], K = [base[0] + pts[1][0] * 0.5, base[1] + pts[1][1] * 0.5], Ft = [base[0] + pts[2][0] * 0.5, base[1] + pts[2][1] * 0.5];
    let claws = '';
    for (let k = -1; k <= 1; k++) claws += `M${r0(Ft[0])},${r0(Ft[1])}q${r0(-10 + k * 4)},${r0(6 + k * 5)} ${r0(-14 + k * 6)},${r0(16 + k * 3)}`;
    return { bone: `M${r0(P0[0])},${r0(P0[1])}L${r0(J[0])},${r0(J[1])}L${r0(K[0])},${r0(K[1])}L${r0(Ft[0])},${r0(Ft[1])}`, claws, w };
  };
  const ch = sp.at(0.36, -0.7), hp = sp.at(0.6, -0.6);
  const fl = limb(ch, PZ.fore.map(([a, b]) => [a - (-60), b]).map(([a, b], i) => [PZ.fore[i][0] - PZ.fore[0][0] + 10, b]), 20);
  const hl = limb(hp, PZ.hind.map(([a, b], i) => [a - PZ.hind[0][0] + 10, b]), 28);
  const legs = '';
  // head
  const F0 = sp(0), hpnt = sp.at(0, 0);
  const H = head(hpnt[0] - F0.tx * 4, hpnt[1] - F0.ty * 4, PZ.head.a, PZ.head.s * 1.05);
  const wn = wing(R, PZ.near, seed + 1), wf = wing(R, PZ.far, seed + 2);
  const g = [];
  const tf = `translate(${r0(x)} ${r0(y)}) rotate(${f(rot, 1)}) scale(${flip ? -s : s} ${s})`;
  // smoke trailing from the torn membranes (behind everything, blurred)
  if (o.smoke !== false) {
    let sm = '';
    const nz = noise1(seed + 9, 40);
    for (const [px, py] of [...wn.smokeAt, ...wf.smokeAt]) {
      if (R() < 0.45) continue;
      const L = R.range(140, 300), dir = o.smokeDir ?? 10;
      const pts = [], pts2 = [];
      for (let k = 0; k <= 6; k++) {
        const t = k / 6, a = rad(dir + nz(px + k * 30) * 30);
        const cx = px + Math.cos(a) * L * t, cy = py + Math.sin(a) * L * t + nz(py + k * 20) * 14 * t;
        const w = 8 + t * 46;
        pts.push([cx, cy - w / 2]); pts2.unshift([cx, cy + w / 2]);
      }
      sm += shape([...pts, ...pts2], true, 0);
    }
    g.push(`<path d="${sm}" fill="${o.smokeCol || '#16141e'}" opacity="${o.smokeOp ?? 0.6}" filter="${S.blur(3)}"/>`);
  }
  // far wing (behind the body)
  g.push(`<path d="${wf.membrane}" fill="${memb}" fill-rule="evenodd" opacity="${o.membOp ?? 0.94}"/>`);
  g.push(`<path d="${wf.bones}" fill="${ink}"/>`);
  g.push(`<path d="${wf.leading}" fill="none" stroke="${rimCol}" stroke-width="2" opacity="${rimOp * 0.6}"/>`);
  // body, legs, spikes, head
  g.push(`<path d="${hl.bone}" fill="none" stroke="${ink}" stroke-width="${hl.w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${fl.bone}" fill="none" stroke="${ink}" stroke-width="${fl.w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${hl.claws}${fl.claws}" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`);
  g.push(`<path d="${body}${spikes}${H.fill}" fill="${ink}"/>`);
  // cool moon rim along the back + head
  let rimD = shape(up.slice(2, N - 2), false, 0) + H.rim;
  g.push(`<path d="${rimD}" fill="none" stroke="${rimCol}" stroke-width="2.4" stroke-linecap="round" opacity="${rimOp}"/>`);
  // furnace glow seeping between belly scales
  if (glow > 0) {
    let seams = '';
    for (let i = 0; i < 9; i++) {
      const t = 0.24 + i * 0.045;
      const a = sp.at(t, -0.95), b = sp.at(t + 0.02, -0.25), c = sp.at(t - 0.005, -0.55);
      seams += `M${r0(a[0])},${r0(a[1])}Q${r0(c[0] - 6)},${r0(c[1])} ${r0(b[0])},${r0(b[1])}`;
    }
    const mid = sp.at(0.38, -0.6);
    g.push(`<ellipse cx="${r0(mid[0])}" cy="${r0(mid[1])}" rx="150" ry="60" fill="#a33b3b" opacity="${f(0.45 * glow, 2)}" filter="${S.blur(3)}"/>`);
    g.push(`<path d="${seams}" fill="none" stroke="#c0302a" stroke-width="7" opacity="${f(0.7 * glow, 2)}" filter="${S.blur(1)}"/>`);
    g.push(`<path d="${seams}" fill="none" stroke="#ff5a3a" stroke-width="2.4" opacity="${f(0.95 * glow, 2)}"/>`);
    // mouth glow + eye
    g.push(`<path d="${H.mouth}" fill="#ff4a2a" opacity="${f(0.8 * glow, 2)}"/>`);
  }
  g.push(`<circle cx="${r0(H.eye[0])}" cy="${r0(H.eye[1])}" r="4.5" fill="#ff5a3a"/><path d="${H.crown}" fill="none" stroke="#c0302a" stroke-width="2" opacity=".85"/>`);
  // black chains with violet runes around the neck (ends sink into the scales)
  let chain = '', runes = '';
  for (const t of [0.1, 0.16, 0.22]) {
    const a = sp.at(t, 1.15), b = sp.at(t + 0.03, -1.15), c1 = sp.at(t - 0.03, 0);
    chain += `M${r0(a[0])},${r0(a[1])}Q${r0(c1[0] - 14)},${r0(c1[1])} ${r0(b[0])},${r0(b[1])}`;
    for (let k = 2; k < 3; k++) {
      const u = k / 4, p = [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * (c1[0] - 14) + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c1[1] + u * u * b[1]];
      runes += `M${r0(p[0] - 4)},${r0(p[1] - 3)}l4,6l4,-6M${r0(p[0])},${r0(p[1] - 6)}v12`;
    }
  }
  // a slack chain run along the shoulder
  const s0 = sp.at(0.22, 1.1), s1 = sp.at(0.36, 0.9);
  chain += `M${r0(s0[0])},${r0(s0[1])}Q${r0((s0[0] + s1[0]) / 2)},${r0((s0[1] + s1[1]) / 2 + 30)} ${r0(s1[0])},${r0(s1[1])}`;
  g.push(`<path d="${chain}" fill="none" stroke="#020203" stroke-width="10" stroke-dasharray="11 4" stroke-linecap="round"/>`);
  g.push(`<path d="${chain}" fill="none" stroke="#3a3650" stroke-width="2" stroke-dasharray="7 8" opacity=".8"/>`);
  g.push(`<path d="${runes}" fill="none" stroke="#b58cff" stroke-width="5" opacity=".45" filter="${S.blur(1)}"/><path d="${runes}" fill="none" stroke="#d8c0ff" stroke-width="1.6"/>`);
  // belly wound (hemai-sky-dawn): white-gold puncture with grey smoke
  if (wound) {
    const wp = sp.at(0.46, -0.7);
    g.push(`<ellipse cx="${r0(wp[0])}" cy="${r0(wp[1])}" rx="60" ry="40" fill="#fff0c8" opacity=".55" filter="${S.blur(2)}"/><path d="${pz([[wp[0] - 18, wp[1] - 6], [wp[0] - 4, wp[1] - 16], [wp[0] + 16, wp[1] - 8], [wp[0] + 12, wp[1] + 10], [wp[0] - 10, wp[1] + 12]])}" fill="#fffaf0"/><path d="${pz([[wp[0] - 10, wp[1] - 3], [wp[0] + 8, wp[1] - 6], [wp[0] + 5, wp[1] + 5], [wp[0] - 6, wp[1] + 6]])}" fill="#1a1010"/>`);
  }
  // near wing (in front)
  g.push(`<path d="${wn.membrane}" fill="${memb}" fill-rule="evenodd" opacity="${o.membOp ?? 0.94}"/>`);
  g.push(`<path d="${wn.bones}" fill="${ink}"/>`);
  g.push(`<path d="${wn.leading}" fill="none" stroke="${rimCol}" stroke-width="2.6" stroke-linecap="round" opacity="${rimOp}"/>`);
  g.push(`<path d="${wn.bones}" fill="none" stroke="${rimCol}" stroke-width="1" opacity="${f(rimOp * 0.3, 2)}"/>`);
  // wing claws at the wrists
  for (const wr of [wn.wrist, wf.wrist]) g.push(`<path d="M${r0(wr[0])},${r0(wr[1])}l-14,-26l10,4z" fill="${ink}"/>`);
  return `<g transform="${tf}">${g.join('')}</g>`;
}
