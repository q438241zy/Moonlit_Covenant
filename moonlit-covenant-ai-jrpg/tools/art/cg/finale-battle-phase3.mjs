// battle-phase3.svg 「它想起了什么」
// Extreme close-up of the Dream Eater's fully opened eye. The nebula iris has stopped turning;
// the pupil has slid toward the tip of one moth antenna, where a warm fragment it never digested
// glows: a small child reaching up for her mother.
export default function battlePhase3(L) {
  const p = 'battlePhase3';
  const { PAL, f, shape } = L;
  const R = L.rng(3303);
  const E = { x: 600, y: 452, R: 292 };
  const IR = E.R * 0.8;
  const PUP = { dx: E.R * 0.1, dy: -E.R * 0.012 };
  const ORB = { x: 1328, y: 500, r: 92 };
  const cx = E.x + PUP.dx, cy = E.y + PUP.dy;
  const ex = (a, r, sq = 1) => [E.x + Math.cos(a) * r, E.y + Math.sin(a) * r * sq];

  let defs = L.filters(p) + L.vignetteDefs(p) + L.shardDefs(p, 47) + L.warmDef(p)
    + L.linear(`${p}-sky`, [[0, '#070816'], [0.6, '#141a3e'], [1, '#22204a']])
    + L.radial(`${p}-skin`, [[0, '#26326a'], [0.3, '#162050'], [0.62, '#0b112c'], [1, '#05070f']], `gradientUnits="userSpaceOnUse" cx="${E.x - 40}" cy="${E.y - 60}" r="860"`)
    + L.radial(`${p}-ball`, [[0, '#5d63ad'], [0.45, '#2b306e'], [0.8, '#12153a'], [1, '#05060f']], 'cx="0.4" cy="0.36" r="0.66"')
    + L.radial(`${p}-iris`, [[0, '#000000'], [0.34, '#0c0822'], [0.37, '#ffffff'], [0.45, '#e6dcff'], [0.6, '#a28cf4'], [0.75, '#5160c4'], [0.88, '#2a3a86'], [0.95, '#ffb38a', 0.65], [1, '#1a1440']], 'r="0.5"')
    + L.radial(`${p}-irisGlow`, [[0, '#e8ddff', 0.5], [0.35, '#b58cff', 0.25], [1, '#6d4fc4', 0]])
    + L.radial(`${p}-photo`, [[0, '#ffffff'], [0.25, '#e8ddff', 0.9], [0.5, '#b58cff', 0.25], [1, '#b58cff', 0]])
    + L.radial(`${p}-lure`, [[0, '#ffffff'], [0.15, '#eafcff'], [0.35, '#8fe6ff', 0.5], [1, '#5ed7ff', 0]])
    + L.radial(`${p}-orb`, [[0, '#fff8ec'], [0.35, '#ffe2b8'], [0.7, '#ffc08e'], [0.92, '#f2966e'], [1, '#c9604a']], 'cx="0.56" cy="0.38" r="0.62"')
    + L.radial(`${p}-orbGlow`, [[0, '#ffe7c8', 0.75], [0.25, '#ffd091', 0.4], [0.6, '#ffb38a', 0.12], [1, '#ff8a6a', 0]])
    + L.radial(`${p}-tear`, [[0, '#ffffff'], [0.45, '#efe9ff', 0.85], [1, '#b58cff', 0.25]], 'cx="0.4" cy="0.6" r="0.6"')
    + L.radial(`${p}-vig`, [[0.55, '#000', 0], [1, '#000', 0.78]], 'cx="0.45" cy="0.5" r="0.78"')
    + L.linear(`${p}-bot`, [[0, '#05060f', 0], [1, '#05060f', 0.85]])
    + L.radial(`${p}-lidU`, [[0, '#4a5aae'], [0.3, '#28337a'], [0.65, '#131a48'], [1, '#060920']], `gradientUnits="userSpaceOnUse" cx="${f(E.x - E.R * 0.45)}" cy="${f(E.y - E.R * 1.25)}" r="${f(E.R * 1.6)}"`)
    + L.linear(`${p}-lidU2`, [[0, '#26306c'], [1, '#090d26']], `gradientUnits="userSpaceOnUse" x1="0" y1="${f(E.y - E.R * 1.62)}" x2="0" y2="${f(E.y - E.R * 1.0)}"`)
    + L.linear(`${p}-lidL`, [[0, '#04061a'], [0.4, '#0e1438'], [1, '#1a2252']], `gradientUnits="userSpaceOnUse" x1="0" y1="${f(E.y + E.R * 0.7)}" x2="0" y2="${f(E.y + E.R * 1.2)}"`)
    + `<clipPath id="${p}-eyeClip"><circle cx="${E.x}" cy="${E.y}" r="${E.R}"/></clipPath>`
    + `<clipPath id="${p}-orbClip"><circle cx="${ORB.x}" cy="${ORB.y}" r="${ORB.r}"/></clipPath>`;

  let s = '';
  // ---------------------------------------------------------------- far plane: night sky through the torn roof
  s += `<rect width="1600" height="900" fill="url(#${p}-sky)"/>`;
  s += L.stars(R, 60, 1080, 0, 1600, 640, '#cfc6ff');
  // distant drifting shards in the open sky
  let far = '';
  for (let i = 0; i < 16; i++) far += L.shard(p, R, R.range(1180, 1600), R.range(20, 700), R.range(14, 30), R.range(0, 360), { vig: 0, op: R.range(0.25, 0.5) });
  s += far;
  // ---------------------------------------------------------------- the head: one vast dark mass
  const head = shape([[-200, -200, 1], [1040, -200, 1], [1120, 20], [1190, 240], [1214, 470], [1190, 690], [1136, 880], [1100, 1100, 1], [-200, 1100, 1]]);
  s += `<path d="${head}" fill="url(#${p}-skin)"/>`;
  s += `<path d="M1050,-30C1120,30 1190,240 1212,470S1150,800 1110,920" fill="none" stroke="${PAL.moon}" stroke-width="12" opacity=".3" filter="url(#${p}-b1)"/>`;
  s += `<path d="M1074,0C1140,90 1192,260 1210,470" fill="none" stroke="${PAL.moon}" stroke-width="2.5" opacity=".7"/>`;
  s += `<path d="M1212,480C1204,640 1162,780 1112,920" fill="none" stroke="${PAL.memory}" stroke-width="3" opacity=".45"/>`;
  // bioluminescent freckle rows following the skin grooves (deep-sea fish photophores)
  let fr = '';
  for (let row = 0; row < 5; row++) {
    const r = E.R * (2.15 + row * 0.38);
    for (let a = -2.5; a < 1.6; a += 0.09 + R() * 0.05) {
      if (R() < 0.3) continue;
      const [x, y] = ex(a, r + R.range(-8, 8), 0.94);
      if (x > 1180 || x < -10 || y < -10 || y > 910) continue;
      fr += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(R.range(1, 2.6))}"/>`;
    }
  }
  s += `<g fill="#8fa4ff" opacity=".35">${fr}</g>`;
  let grooves = '';
  for (let i = 0; i < 6; i++) {
    const r = E.R * (2.05 + i * 0.38);
    const [x0, y0] = ex(-2.4 + R.range(-0.15, 0.15), r, 0.94), [x1, y1] = ex(-0.05 + R.range(-0.2, 0.2), r, 0.94);
    const [x2, y2] = ex(0.9 + R.range(-0.2, 0.2), r, 0.94), [x3, y3] = ex(2.7 + R.range(-0.2, 0.2), r, 0.94);
    grooves += `M${f(x0, 0)},${f(y0, 0)}A${f(r, 0)},${f(r * 0.94, 0)} 0 0 1 ${f(x1, 0)},${f(y1, 0)}M${f(x2, 0)},${f(y2, 0)}A${f(r, 0)},${f(r * 0.94, 0)} 0 0 1 ${f(x3, 0)},${f(y3, 0)}`;
  }
  s += `<path d="${grooves}" fill="none" stroke="#04060f" stroke-width="6" opacity=".45"/>`;
  s += `<path d="${grooves}" fill="none" stroke="#3a4890" stroke-width="2" opacity=".3" transform="translate(-3 -4)"/>`;

  // ---------------------------------------------------------------- memory-shard ruff: overlapping scales, dense near the eye
  const placed = [];
  const RINGS = [[1.44, 30, 64, 1], [1.7, 32, 80, 0.85], [2.0, 34, 98, 0.7], [2.34, 34, 118, 0.52], [2.72, 34, 136, 0.36]];
  RINGS.forEach(([rad, n, len, op], ri) => {
    for (let i = 0; i < n; i++) {
      const a = (i + (ri % 2) * 0.5 + R.range(-0.18, 0.18)) / n * Math.PI * 2;
      const [x, y] = ex(a, E.R * (rad + R.range(-0.04, 0.04)), 0.95);
      if (x > 1150 || y > 960 || y < -80 || x < -80) continue;
      if (Math.hypot(x - ORB.x, y - ORB.y) < 250) continue;
      placed.push({ x, y, a, len: len * R.range(0.85, 1.12), op, rad });
    }
  });
  placed.sort((m, n) => n.rad - m.rad);
  let ruff = '';
  for (const q of placed) {
    const lit = 0.68 + 0.32 * Math.cos(q.a + 2.2);
    ruff += L.shard(p, R, q.x, q.y, q.len, q.a * 180 / Math.PI + R.range(-8, 8), { vig: 0.4, op: Math.min(1, q.op * lit), glow: R() < 0.07 });
  }
  s += ruff;

  // ---------------------------------------------------------------- moon-phase photophores on the brow
  let brow = '';
  for (let i = 0, n = 9; i < n; i++) {
    const t = i / (n - 1), a = (-158 + 136 * t) * Math.PI / 180;
    const [x, y] = ex(a, E.R * 1.86);
    const r = E.R * 0.05 * (0.75 + 0.45 * Math.sin(Math.PI * t));
    const k = Math.cos(Math.PI * t), sw = t < 0.5 ? 1 : 0;
    const lit = Math.abs(k) < 0.15 ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#f6f2ff"/>`
      : `<path d="M${f(x)},${f(y - r)}A${f(r)},${f(r)} 0 0 ${sw} ${f(x)},${f(y + r)}A${f(Math.abs(k) * r)},${f(r)} 0 0 ${k > 0 ? sw : 1 - sw} ${f(x)},${f(y - r)}Z" fill="#f6f2ff"/>`;
    brow += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 3.6)}" fill="url(#${p}-photo)" opacity=".65"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 1.2)}" fill="#0a0c24" stroke="#5a64b0" stroke-width="${f(r * 0.14)}"/>${lit}`;
  }
  s += brow;

  // ---------------------------------------------------------------- fleshy lids, fully retracted (a "full moon")
  s += `<circle cx="${E.x}" cy="${E.y}" r="${f(E.R * 2.0)}" fill="url(#${p}-irisGlow)" opacity=".5"/>`;
  const arcPts = (r, a0, a1, n, sq = 1) => Array.from({ length: n }, (_, i) => ex(a0 + (a1 - a0) * i / (n - 1), r, sq));
  // lids drawn as crescents hugging the eyeball, thickest just left of the top, tapering to the corners
  const band = (r0, maxT, a0, a1, bias = 0, n = 28) => {
    const outer = [], inner = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, a = a0 + (a1 - a0) * u;
      const k = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, u + bias * Math.sin(Math.PI * u)))), 0.75);
      outer.push(ex(a, E.R * (r0 + maxT * k)));
      inner.push(ex(a, E.R * r0));
    }
    return { outer, inner, d: `M${outer.map(([x, y]) => `${f(x, 0)},${f(y, 0)}`).join('L')}L${inner.reverse().map(([x, y]) => `${f(x, 0)},${f(y, 0)}`).join('L')}Z` };
  };
  const UA0 = Math.PI * 1.03, UA1 = Math.PI * 1.97;
  // upper crease: a second, softer fold behind
  const cr = band(1.18, 0.2, UA0 + 0.12, UA1 - 0.12, -0.08);
  s += `<path d="${cr.d}" fill="#16205a"/>`;
  s += `<path d="${L.polyline(cr.outer.slice(2, 16))}" fill="none" stroke="${PAL.moon}" stroke-width="2.5" opacity=".45"/>`;
  s += `<path d="${L.polyline(cr.outer.slice(16, -2))}" fill="none" stroke="#5a68bb" stroke-width="2" opacity=".35"/>`;
  // upper lid
  const lu = band(0.99, 0.26, UA0, UA1, -0.1);
  defs += L.linear(`${p}-lidG`, [[0, '#4656a8'], [0.4, '#26317a'], [1, '#121a4a']], `gradientUnits="userSpaceOnUse" x1="${f(E.x - E.R)}" y1="${f(E.y - E.R * 1.3)}" x2="${f(E.x + E.R * 0.9)}" y2="${f(E.y - E.R * 0.2)}"`);
  s += `<path d="${lu.d}" fill="url(#${p}-lidG)"/>`;
  s += `<path d="${L.polyline(lu.outer.slice(1, 15))}" fill="none" stroke="${PAL.moon}" stroke-width="2.5" opacity=".75"/>`;
  s += `<path d="${shape(arcPts(E.R * 1.045, UA0 + 0.06, UA1 - 0.06, 13), false)}" fill="none" stroke="#080b22" stroke-width="${f(E.R * 0.07)}" opacity=".75"/>`;
  // lower lid
  const ll = band(0.99, 0.13, Math.PI * 0.97, Math.PI * 0.03, 0.05);
  s += `<path d="${ll.d}" fill="#1a2360"/>`;
  s += `<path d="${L.polyline(ll.outer.slice(3, -3))}" fill="none" stroke="#6f7cc8" stroke-width="2" opacity=".4"/>`;
  s += `<path d="${shape(arcPts(E.R * 1.035, Math.PI * 0.9, Math.PI * 0.1, 11), false)}" fill="none" stroke="#070a1f" stroke-width="${f(E.R * 0.05)}" opacity=".7"/>`;
  // soft skin folds across the retracted lids (dark groove + moonlit ridge)
  let wD = '', wL = '';
  for (const [r, a0, a1] of [[1.11, -2.85, -0.4], [1.22, -2.6, -0.75], [1.3, -2.25, -1.15], [1.1, 0.55, 2.55]]) {
    const [x0, y0] = ex(a0, E.R * r), [x1, y1] = ex(a1, E.R * r);
    const arc = `M${f(x0, 0)},${f(y0, 0)}A${f(E.R * r, 0)},${f(E.R * r, 0)} 0 0 1 ${f(x1, 0)},${f(y1, 0)}`;
    wD += arc;
  }
  s += `<path d="${wD}" fill="none" stroke="#03040e" stroke-width="4" stroke-linecap="round" opacity=".55"/>`;
  s += `<path d="${wD}" fill="none" stroke="#6c7bd0" stroke-width="2" stroke-linecap="round" opacity=".35" transform="translate(-2 -4)"/>`;
  // the iris light spilling onto the lid margins
  s += `<circle cx="${E.x}" cy="${E.y}" r="${f(E.R * 1.05)}" fill="none" stroke="#b9a6ff" stroke-width="34" opacity=".28" filter="url(#${p}-b2)"/>`;

  // ---------------------------------------------------------------- the eye itself
  let eye = `<g clip-path="url(#${p}-eyeClip)">`;
  eye += `<circle cx="${E.x}" cy="${E.y}" r="${E.R}" fill="url(#${p}-ball)"/>`;
  eye += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(IR)}" fill="url(#${p}-iris)"/>`;
  let neb = '';
  for (let i = 0; i < 9; i++) {
    const a = 0.4 + i * 0.7 + R.range(-0.2, 0.2), rr = IR * R.range(0.55, 0.82);
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
    neb += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(IR * R.range(0.22, 0.34))}" ry="${f(IR * R.range(0.07, 0.12))}" transform="rotate(${f(a * 180 / Math.PI + 62)} ${f(x)} ${f(y)})" fill="${i % 3 === 0 ? PAL.memory : i % 3 === 1 ? '#7fd9ff' : '#c8a8ff'}" opacity="${i % 3 === 0 ? 0.42 : 0.3}"/>`;
  }
  eye += `<g filter="url(#${p}-b2)">${neb}</g>`;
  let fibL = '', fibD = '', fibW = '';
  for (let i = 0; i < 240; i++) {
    const a0 = i / 240 * Math.PI * 2 + R.range(-0.01, 0.01);
    const r0 = IR * R.range(0.38, 0.46), r1 = IR * R.range(0.74, 0.98), tw = 0.26 + R.range(-0.06, 0.06);
    const seg = `M${f(cx + Math.cos(a0) * r0, 0)},${f(cy + Math.sin(a0) * r0, 0)}Q${f(cx + Math.cos(a0 + tw * 0.35) * (r0 + r1) / 2, 0)},${f(cy + Math.sin(a0 + tw * 0.35) * (r0 + r1) / 2, 0)} ${f(cx + Math.cos(a0 + tw) * r1, 0)},${f(cy + Math.sin(a0 + tw) * r1, 0)}`;
    const k = R();
    if (k < 0.12) fibW += seg; else if (k < 0.62) fibL += seg; else fibD += seg;
  }
  eye += `<path d="${fibL}" fill="none" stroke="#dcd2ff" stroke-width="1.6" opacity=".42"/>`;
  eye += `<path d="${fibD}" fill="none" stroke="#120c33" stroke-width="2" opacity=".32"/>`;
  eye += `<path d="${fibW}" fill="none" stroke="${PAL.memory}" stroke-width="1.8" opacity=".6"/>`;
  let sp = '';
  for (let i = 0; i < 70; i++) {
    const a = R() * Math.PI * 2, rr = IR * R.range(0.46, 0.96);
    sp += `<circle cx="${f(cx + Math.cos(a) * rr, 0)}" cy="${f(cy + Math.sin(a) * rr, 0)}" r="${f(R.range(1.2, 3.4))}"/>`;
  }
  eye += `<g fill="#fff4ea" opacity=".85">${sp}</g>`;
  eye += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(IR)}" fill="none" stroke="#0b0820" stroke-width="10" opacity=".8"/>`;
  eye += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(IR * 0.99)}" fill="none" stroke="${PAL.memory}" stroke-width="2" opacity=".45"/>`;
  eye += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(IR * 0.42)}" fill="none" stroke="#f3edff" stroke-width="20" opacity=".8" filter="url(#${p}-b1)"/>`;
  let rays = '';
  for (let i = 0; i < 72; i++) {
    const a = i / 72 * Math.PI * 2 + R.range(-0.03, 0.03), r0 = IR * 0.36, r1 = IR * (0.42 + R() * R() * 0.2);
    rays += `M${f(cx + Math.cos(a) * r0, 0)},${f(cy + Math.sin(a) * r0, 0)}L${f(cx + Math.cos(a + 0.04) * r1, 0)},${f(cy + Math.sin(a + 0.04) * r1, 0)}`;
  }
  eye += `<path d="${rays}" fill="none" stroke="#f6f1ff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
  eye += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(IR * 0.36)}" fill="#020108"/>`;
  eye += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(IR * 0.365)}" fill="none" stroke="#ffffff" stroke-width="3"/>`;
  // reflection of the warm fragment on the wet cornea, on the side it is looking at
  const rx = cx + IR * 0.6, ry = cy + IR * 0.06;
  eye += `<circle cx="${f(rx)}" cy="${f(ry)}" r="42" fill="url(#${p}-orbGlow)"/>`;
  eye += `<circle cx="${f(rx)}" cy="${f(ry)}" r="12" fill="#ffe2b8" opacity=".95"/>`;
  eye += `<circle cx="${f(rx - 3)}" cy="${f(ry - 3)}" r="4" fill="#ffffff"/>`;
  // moonlight reflection (upper left) + rim gleams
  eye += `<path d="M${f(E.x - E.R * 0.62)},${f(E.y - E.R * 0.06)}C${f(E.x - E.R * 0.66)},${f(E.y - E.R * 0.42)} ${f(E.x - E.R * 0.44)},${f(E.y - E.R * 0.66)} ${f(E.x - E.R * 0.12)},${f(E.y - E.R * 0.7)}C${f(E.x - E.R * 0.38)},${f(E.y - E.R * 0.56)} ${f(E.x - E.R * 0.52)},${f(E.y - E.R * 0.36)} ${f(E.x - E.R * 0.62)},${f(E.y - E.R * 0.06)}Z" fill="#ffffff" opacity=".22"/>`;
  eye += `<circle cx="${f(E.x - E.R * 0.3)}" cy="${f(E.y - E.R * 0.34)}" r="9" fill="#ffffff" opacity=".9"/>`;
  eye += `<circle cx="${f(E.x - E.R * 0.22)}" cy="${f(E.y - E.R * 0.4)}" r="4" fill="#ffffff" opacity=".7"/>`;
  eye += `<path d="M${f(E.x + E.R * 0.2)},${f(E.y + E.R * 0.88)}A${f(E.R * 0.9)},${f(E.R * 0.9)} 0 0 0 ${f(E.x + E.R * 0.82)},${f(E.y + E.R * 0.3)}" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity=".25"/>`;
  eye += `<circle cx="${E.x}" cy="${E.y}" r="${E.R}" fill="none" stroke="#03030c" stroke-width="70" opacity=".6" filter="url(#${p}-b2)"/>`;
  eye += `<path d="M${f(E.x - E.R)},${f(E.y - E.R * 0.1)}A${E.R},${E.R} 0 0 1 ${f(E.x + E.R)},${f(E.y - E.R * 0.1)}" fill="none" stroke="#03030c" stroke-width="44" opacity=".5"/>`;
  eye += `</g>`;
  s += eye;
  // wet lid margins
  s += `<path d="M${f(E.x - E.R * 0.99)},${f(E.y - E.R * 0.1)}A${E.R},${E.R} 0 0 1 ${f(E.x + E.R * 0.99)},${f(E.y - E.R * 0.1)}" fill="none" stroke="${PAL.moon}" stroke-width="3" opacity=".8"/>`;
  s += `<path d="M${f(E.x - E.R * 0.8)},${f(E.y + E.R * 0.6)}A${E.R},${E.R} 0 0 0 ${f(E.x + E.R * 0.8)},${f(E.y + E.R * 0.6)}" fill="none" stroke="#a9b2ee" stroke-width="2.5" opacity=".5"/>`;
  let lash = '';
  for (let i = 1; i < 90; i++) {
    const t = i / 90 + R.range(-0.004, 0.004), ang = Math.PI * (1.05 + 0.9 * t);
    const [x, y] = ex(ang, E.R * 1.01);
    const l = E.R * (0.05 + 0.1 * Math.sin(Math.PI * t)) * R.range(0.5, 1.3);
    const nx = Math.cos(ang) * 0.7 + R.range(-0.25, 0.25), ny = Math.sin(ang) * 0.6 - 0.35;
    lash += `M${f(x, 0)},${f(y, 0)}q${f(nx * l * 0.3, 0)},${f(ny * l * 0.5 - l * 0.25, 0)} ${f(nx * l, 0)},${f(ny * l, 0)}`;
  }
  s += `<path d="${lash}" fill="none" stroke="#cfc6f0" stroke-width="1.6" stroke-linecap="round" opacity=".5"/>`;
  // a single bead of light gathering on the lower lid, holding a fragment
  const tx = E.x + E.R * 0.66, ty = E.y + E.R * 0.76;
  s += `<circle cx="${f(tx)}" cy="${f(ty + 24)}" r="64" fill="url(#${p}-warm)" opacity=".35"/>`;
  s += `<path d="M${f(tx - 6)},${f(ty - 2)}C${f(tx + 8)},${f(ty + 12)} ${f(tx + 17)},${f(ty + 26)} ${f(tx + 16)},${f(ty + 38)}A17,17 0 0 1 ${f(tx - 18)},${f(ty + 36)}C${f(tx - 19)},${f(ty + 22)} ${f(tx - 12)},${f(ty + 10)} ${f(tx - 6)},${f(ty - 2)}Z" fill="url(#${p}-tear)" opacity=".9"/>`;
  s += L.vignette(p, R, tx - 1, ty + 36, 18, 0, 0.85, 0);
  s += `<path d="M${f(tx - 11)},${f(ty + 22)}Q${f(tx - 14)},${f(ty + 34)} ${f(tx - 8)},${f(ty + 44)}" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity=".9"/>`;

  // ---------------------------------------------------------------- anglerfish lures + drifting word fragments
  const lure = (x0, y0, qx, qy, x1, y1, r) => `<path d="M${x0},${y0}Q${qx},${qy} ${x1},${y1}" fill="none" stroke="#8e9ad6" stroke-width="${f(r * 0.25)}" opacity=".55"/>`
    + `<circle cx="${x1}" cy="${y1 + r}" r="${f(r * 6)}" fill="url(#${p}-lure)" opacity=".55"/><circle cx="${x1}" cy="${y1 + r}" r="${r}" fill="#f4feff"/>`;
  s += lure(140, -20, 50, 220, 104, 352, 10) + lure(290, -20, 236, 130, 250, 186, 7);
  // word fragments: ribbons of half-digested glyphs rising from the mouth below the frame
  let wNear = '', wFar = '';
  for (const [x0, y0, x1, y1, bend, n] of [[520, 930, 120, 600, -120, 22], [640, 940, 260, 700, -60, 18], [420, 950, 30, 760, 40, 16]]) {
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const x = x0 + (x1 - x0) * t + Math.sin(t * Math.PI) * bend, y = y0 + (y1 - y0) * t + R.range(-8, 8);
      const g = L.glyph(R, x, y, 20 - t * 9);
      if (t < 0.5) wNear += g; else wFar += g;
    }
  }
  s += `<path d="${wNear}" fill="none" stroke="#c8f1ff" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>`;
  s += `<path d="${wFar}" fill="none" stroke="#c8f1ff" stroke-width="2" stroke-linecap="round" opacity=".38"/>`;

  // ---------------------------------------------------------------- the antenna and the fragment it kept
  const A0 = [990, -70], A1 = [1290, -110], A2 = [1480, 190], A3 = [ORB.x + 16, ORB.y - ORB.r - 70];
  s += L.antenna(p, A0, A1, A2, A3, 50, 64, '#ddd3f6', { op: 0.62, shaft: 4.5, width: 1.3 });
  s += `<path d="M${A3[0]},${A3[1]}Q${A3[0] - 8},${A3[1] + 38} ${ORB.x + 4},${ORB.y - ORB.r + 2}" fill="none" stroke="#ddd3f6" stroke-width="3.5" opacity=".85"/>`;
  s += `<path d="M1206,330C1222,420 1220,560 1196,660" fill="none" stroke="#ffc59a" stroke-width="5" opacity=".7" filter="url(#${p}-b1)"/>`;
  s += `<circle cx="${ORB.x}" cy="${ORB.y}" r="${f(ORB.r * 3.8)}" fill="url(#${p}-orbGlow)"/>`;
  s += `<circle cx="${ORB.x}" cy="${ORB.y}" r="${ORB.r}" fill="url(#${p}-orb)"/>`;
  const k = ORB.r / 100;
  let frag = `<g clip-path="url(#${p}-orbClip)"><g transform="translate(${f(ORB.x)} ${f(ORB.y)}) scale(${f(k, 3)})">`;
  frag += `<circle cx="16" cy="-34" r="40" fill="#ffffff" opacity=".7" filter="url(#${p}-b1)"/>`;
  frag += `<path d="M-110,48Q0,40 110,50L110,120L-110,120Z" fill="#d98a62" opacity=".55"/>`;
  // mother, bending down, already dissolving into grain
  frag += `<g fill="#8a4a36" opacity=".5"><circle cx="40" cy="-40" r="11"/><circle cx="48" cy="-47" r="6"/>`
    + `<path d="${shape([[30, -30], [44, -30], [56, -12], [60, 14], [68, 50, 1], [22, 50, 1], [28, 16], [30, -6]])}"/>`
    + `<path d="M33,-24Q18,-30 2,-24" stroke="#8a4a36" stroke-width="6.5" stroke-linecap="round" fill="none"/></g>`;
  let grain = '';
  for (let i = 0; i < 30; i++) grain += `<rect x="${f(R.range(20, 80), 0)}" y="${f(R.range(-58, 44), 0)}" width="${f(R.range(2, 5), 0)}" height="${f(R.range(2, 5), 0)}"/>`;
  frag += `<g fill="#fff3e2" opacity=".6">${grain}</g>`;
  // the child, crisp, reaching up with both arms
  frag += `<g fill="#6a3426"><circle cx="-30" cy="-2" r="10.5"/><path d="M-39,-8Q-45,-1 -40,5Z"/>`
    + `<path d="${shape([[-37, 9], [-24, 9], [-18, 38, 1], [-44, 38, 1]])}"/>`
    + `<path d="M-40,38h5v13h-5zM-30,38h5v13h-5z"/>`
    + `<path d="M-25,12L-14,-12L-8,-22M-34,12L-24,-14L-21,-26" stroke="#6a3426" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`;
  frag += `</g></g>`;
  s += frag;
  s += `<circle cx="${ORB.x}" cy="${ORB.y}" r="${f(ORB.r - 3)}" fill="none" stroke="#b5583e" stroke-width="6" opacity=".5"/>`;
  s += `<circle cx="${ORB.x}" cy="${ORB.y}" r="${f(ORB.r + 6)}" fill="none" stroke="${PAL.memory}" stroke-width="3" stroke-dasharray="2 7 5 9 1 6" opacity=".8"/>`;
  s += `<path d="M${f(ORB.x - ORB.r * 0.72)},${f(ORB.y - ORB.r * 0.3)}A${f(ORB.r * 0.8)},${f(ORB.r * 0.8)} 0 0 1 ${f(ORB.x - ORB.r * 0.1)},${f(ORB.y - ORB.r * 0.78)}" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".7"/>`;
  let motes = '';
  for (let i = 0; i < 28; i++) {
    const a = R.range(-2.6, 0.6), r = ORB.r * R.range(1.15, 2.6);
    motes += `<circle cx="${f(ORB.x + Math.cos(a) * r, 0)}" cy="${f(ORB.y + Math.sin(a) * r, 0)}" r="${f(R.range(1, 3.2))}"/>`;
  }
  s += `<g fill="#ffd9b5" opacity=".8">${motes}</g>`;

  // ---------------------------------------------------------------- near plane: out-of-focus shards, vignette, UI fade
  let fg = '';
  for (const [x, y, len, a] of [[40, 110, 280, 30], [1530, 850, 320, -20], [210, 850, 240, -40]]) {
    fg += `<use href="#${p}-sh${Math.floor(R() * 5)}" transform="translate(${x} ${y}) rotate(${a}) scale(${f(len / 100, 2)})" opacity=".5"/>`;
  }
  s += `<g filter="url(#${p}-b2)">${fg}</g>`;
  // red emergency light rising from the wrecked carriage below
  s += `<ellipse cx="1300" cy="935" rx="460" ry="110" fill="#ff3d55" opacity=".2" filter="url(#${p}-b3)"/>`;
  s += `<rect width="1600" height="900" fill="url(#${p}-vig)"/>`;
  s += `<rect y="720" width="1600" height="180" fill="url(#${p}-bot)"/>`;
  return L.svgDoc('它想起了什么：食梦兽的巨眼完全睁开，虹膜静止，触须末端闪过一个孩子喊妈妈的画面', defs, s);
}
