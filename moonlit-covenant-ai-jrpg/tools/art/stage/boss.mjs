// 食梦兽·阿涅摩伊 — three battle phases (1 complete / 2 armour-broken / 3 sealed).
// One creature design re-dressed per phase: a long whale body arching in a slow S, a crest of
// translucent memory-shard scales, feathery moth antennae, deep-sea lures, and one giant eye with
// moon-phase lids and a nebula iris. viewBox 0 0 1000 1000, transparent background.
import { PAL, rng, f, P, poly, line, shape, spine, radial, linear, blur, svgDoc } from './lib.mjs';

// ------------------------------------------------------------------------------------------------
// Shared geometry
// ------------------------------------------------------------------------------------------------
const SP = spine([
  [118, 374, 50, 46],
  [222, 352, 128, 124],
  [345, 340, 150, 142],
  [478, 356, 152, 138],
  [598, 404, 150, 132],
  [694, 478, 140, 120],
  [762, 568, 124, 104],
  [804, 664, 104, 86],
  [822, 752, 78, 64],
  [818, 822, 58, 47],
  [800, 876, 38, 31],
]);
const EYE = { x: 334, y: 326, r: 108 };

function bodyOutline() {
  const up = [], lo = [];
  const N = 26;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    up.push(SP.at(t, 1));
    lo.push(SP.at(t, -1));
  }
  // rounded snout cap
  const F0 = SP(0);
  const cap = [];
  for (let k = 1; k < 6; k++) {
    const a = Math.PI * k / 6;
    const w = (F0.wu + F0.wl) / 2;
    const off = (F0.wu - F0.wl) / 2;
    const cv = -Math.cos(a) * w + off;
    const ca = -Math.sin(a) * w * 0.7;
    cap.push([F0.x + F0.nx * cv + F0.tx * ca, F0.y + F0.ny * cv + F0.ty * ca]);
  }
  return [...up, ...lo.reverse(), ...cap];
}

// ------------------------------------------------------------------------------------------------
// Glyph fragments (digested language): stroke sets in a 20x20 box centred on 0,0
// ------------------------------------------------------------------------------------------------
const GLYPHS = [
  'M-8,-8H8V8H-8Z', 'M-9,0H9M0,-9V9', 'M-8,-7H8L2,9', 'M6,-9C2,0-2,5-8,9', 'M5,-9L-6,0L5,9',
  'M-9,-6H9M-6,-6V8M6,-6V8M-6,8H6', 'M0,-9V-4M-9,-3H9M-5,2L-8,9M5,2L8,9', 'M-8,-8H8M0,-8V9M-8,9H8',
  'M-7,-9C-9,0-4,8,6,8M4,-6L8,-2', 'M-9,-2H9M-3,-9L-6,9M4,-9L6,9', 'M-6,-9V9M-6,0C2,-4,8,0,6,8', 'M-8,4C-4,-10,4,-10,8,4M-4,0H4',
];

// Tiny memory vignettes shown inside the larger shards (unit box ~[-10,10])
const VIGNETTES = [
  'M-6,-7a2.6,2.6 0 1 1 0.1,0zM-8.5,-4h5l1,9h-2l-1,5h-1.6l-0.4-5h-1l-0.4,5h-1.6l-1-5h-2zM4.5,0a2,2 0 1 1 0.1,0zM3,2h3.2l0.8,5h-1.2l-0.4,3h-1.6l-0.4-3h-1.2z',
  'M-9,1L0,-8L9,1H7V9H-7V1ZM-2,9V4H2V9Z',
  'M-1,9V-1C-6,-1-9,-4-8,-7C-7,-10-2,-10,0,-8C3,-11,9,-9,8,-5C8,-2,4,-1,1,-1V9ZM4,-1V6H8V-1',
  'M-9,-3C-7,-9,7,-9,9,-3ZM0,-3V2M-4,0a2,2 0 1 1 0.1,0zM-5.5,2h3l0.6,7h-4.2zM4,0a2,2 0 1 1 0.1,0zM2.5,2h3l0.6,7h-4.2z',
  'M-8,9V2H8V9ZM-6,2V-2H6V2ZM-0.6,-2V-6H0.6V-2ZM0,-7.5a1.2,1.6 0 1 1 0.1,0z',
];

// child silhouette reaching up (calling for its mother)
const CHILD = 'M0,-11a3.6,3.6 0 1 1 0.1,0zM-3.6,-6.2C-5,-6-6.6,-9-8.6,-12.4L-10,-11.6C-8.6,-8.2-7.4,-4.6-5,-3.4L-4.6,2.6L-6.4,11.6H-3.6L-1.4,4.6H1.4L3.6,11.6H6.4L4.6,2.6L5,-2.6C6.2,-2,8,-1,9,2L10.4,1.2C9,-2.6,6.4,-5.6,3.6,-6.2Z';

// ------------------------------------------------------------------------------------------------
// Phase palettes
// ------------------------------------------------------------------------------------------------
const PHASE = {
  1: {
    body: ['#1d2958', '#0f1638', '#060920'], shadow: '#03051a', hi: '#2c3c80', rimHi: '#e8ddff', rimLo: '#7c86f0',
    belly: '#3a4486', bellyHi: '#6f7cc8', pleat: '#161c4c', lidEdge: '#04061a',
    fin: ['#252e6a', '#8c86cc'], finVein: '#c9c0f2', antenna: '#d3c9ef', antennaDim: '#857cae',
    lure: '#c8f6ff', lureGlow: '#5ed7ff', shardA: '#f4f0ff', shardB: '#7f8fe0', shardEdge: '#ffb38a',
    sclera: ['#f2edff', '#c2b5ea', '#6f62ad'], iris: ['#fff7ff', '#d2b6ff', '#8a66f2', '#3b2ea6', '#120d40'],
    limbus: '#ffd091', lid: ['#2b3a80', '#0f1642'], glyph: '#dff6ff', glyph2: '#ffd091', aura: '#5a46d0',
    stud: '#f1ebff', studDark: '#2c3170', studGlow: '#b9a8ff', mem: ['#fff1d6', '#ffb38a', '#c4566a'],
  },
  2: {
    body: ['#18245a', '#0c1236', '#05071c'], shadow: '#020414', hi: '#283a8e', rimHi: '#dbe6ff', rimLo: '#3f8cff',
    belly: '#2c3574', bellyHi: '#4a58a8', pleat: '#121846', lidEdge: '#030414',
    fin: ['#1f2a66', '#6f7cc4'], finVein: '#8fc4ff', antenna: '#bdb4e0', antennaDim: '#6e6698',
    lure: '#d6fbff', lureGlow: '#3fb4ff', shardA: '#f6eeff', shardB: '#7466d0', shardEdge: '#ffb38a',
    sclera: ['#f2dcf2', '#c487d0', '#5e2470'], iris: ['#fff0fb', '#ff8ad8', '#c043d6', '#5d1c96', '#1c0734'],
    limbus: '#ff9ab0', lid: ['#26347a', '#0d133e'], glyph: '#e2f6ff', glyph2: '#ffcf8a', aura: '#3a5ae0',
    stud: '#e6d8ff', studDark: '#2a2058', studGlow: '#c78cff', mem: ['#fff1d6', '#ffb38a', '#c4566a'],
  },
  3: {
    body: ['#a3a8cf', '#6d72a2', '#40446f'], shadow: '#2c2f56', hi: '#cdd0ec', rimHi: '#ffffff', rimLo: '#dcd4ff',
    belly: '#7e83ad', bellyHi: '#b0b3d6', pleat: '#50547d', lidEdge: '#3a3d66',
    fin: ['#6f74a4', '#e4e2f6'], finVein: '#ffffff', antenna: '#f5f2ff', antennaDim: '#b8b3d6',
    lure: '#f4f2ff', lureGlow: '#cfc8f0', shardA: '#ffffff', shardB: '#c4c1e4', shardEdge: '#f4f0ff',
    sclera: ['#ffffff', '#dcd8f0', '#9a95c0'], iris: ['#ffffff', '#e8e2fc', '#b3abdc', '#7e78ac', '#45416c'],
    limbus: '#f4f0ff', lid: ['#c3c5e6', '#8f93c0'], glyph: '#f4f2ff', glyph2: '#f4f2ff', aura: '#cfc6ff',
    stud: '#ffffff', studDark: '#6d7099', studGlow: '#ffffff', mem: ['#ffffff', '#e2ddf6', '#a9a4cc'],
  },
};

// ------------------------------------------------------------------------------------------------
export function boss(phase) {
  const p = `de${phase}`;
  const C = PHASE[phase];
  const R = rng(9100 + phase * 7);
  const RS = rng(4243); // shared shard layout across phases (same creature)
  const defs = [];
  const back = [];
  const body = [];
  const front = [];

  defs.push(blur(`${p}-gs`, 4, 60));
  if (phase === 2) defs.push(blur(`${p}-gl`, 14, 60));
  defs.push(linear(`${p}-body`, [[0, C.body[0]], [0.45, C.body[1]], [1, C.body[2]]], 'x1="0.15" y1="0" x2="0.85" y2="1"'));
  defs.push(linear(`${p}-shard`, [[0, C.shardA, phase === 3 ? 0.9 : 0.8], [0.55, C.shardB, phase === 3 ? 0.45 : 0.3], [1, C.shardB, 0.06]], 'x1="0" y1="0" x2="1" y2="1"'));
  defs.push(radial(`${p}-mem`, [[0, C.mem[0], 0.95], [0.55, C.mem[1], 0.75], [1, C.mem[2], 0.35]]));
  defs.push(radial(`${p}-orbit`, [[0.78, C.lidEdge, 1], [0.9, C.lidEdge, 0.55], [1, C.lidEdge, 0]]));
  defs.push(linear(`${p}-lid`, [[0, C.lid[0]], [1, C.lid[1]]]));
  defs.push(radial(`${p}-stud`, [[0, C.studGlow, 0.7], [1, C.studGlow, 0]]));
  defs.push(linear(`${p}-depth`, [[0, C.shadow, 0], [0.5, C.shadow, 0], [1, C.shadow, phase === 3 ? 0.3 : 0.62]], 'x1="0.25" y1="0.1" x2="0.8" y2="1"'));
  defs.push(linear(`${p}-fin`, [[0, C.fin[0]], [0.35, C.fin[0]], [1, C.fin[1]]], 'x1="0.85" y1="0" x2="0.15" y2="1"'));
  defs.push(linear(`${p}-fluke`, [[0, C.body[1]], [1, C.fin[1], 0.9]], 'x1="0" y1="0" x2="1" y2="1"'));
  defs.push(radial(`${p}-sclera`, [[0, C.sclera[0]], [0.7, C.sclera[1]], [1, C.sclera[2]]], 'cx="0.4" cy="0.36" r="0.7"'));
  defs.push(radial(`${p}-iris`, [[0.24, C.iris[0]], [0.38, C.iris[1]], [0.6, C.iris[2]], [0.86, C.iris[3]], [1, C.iris[4]]]));
  defs.push(radial(`${p}-lure`, [[0, '#ffffff'], [0.18, C.lure], [0.42, C.lureGlow, 0.45], [1, C.lureGlow, 0]]));
  defs.push(radial(`${p}-aura`, [[0, C.aura, phase === 3 ? 0.3 : 0.24], [0.6, C.aura, 0.07], [1, C.aura, 0]]));
  defs.push(radial(`${p}-eyeglow`, [[0.62, C.aura, 0.5], [1, C.aura, 0]]));
  defs.push(radial(`${p}-orb`, [[0, '#fff6e2'], [0.45, '#ffcf96'], [0.8, PAL.memory, 0.85], [1, '#ff8a6a', 0]]));
  defs.push(linear(`${p}-membrane`, [[0, C.fin[1], 0.1], [1, C.finVein, 0.45]], 'x1="0" y1="0" x2="1" y2="0.4"'));

  const bodyD = shape(bodyOutline(), true, 0);
  const BD = `${p}-bd`;
  const use = (attrs) => `<use href="#${BD}" ${attrs}/>`;
  defs.push(`<path id="${BD}" d="${bodyD}"/>`);
  defs.push(`<clipPath id="${p}-clip">${use('')}</clipPath>`);
  // cel bands: highlight = body minus body shifted away from the light; shadow = body minus body shifted toward it
  defs.push(`<mask id="${p}-mh">${use('fill="#fff"')}${use('transform="translate(9 12)" fill="#000"')}</mask>`);
  defs.push(`<mask id="${p}-ms">${use('fill="#fff"')}${use('transform="translate(-24 -32)" fill="#000"')}</mask>`);
  defs.push(`<mask id="${p}-mr">${use('fill="#fff"')}${use('transform="translate(-3 -4)" fill="#000"')}</mask>`);

  back.push(`<ellipse cx="500" cy="480" rx="480" ry="440" fill="url(#${p}-aura)"/>`);
  const seal = phase === 3 ? sealRings(p) : null;
  if (seal) back.push(seal.back);

  const a0 = SP.at(0.25, 0.99), b0 = SP.at(0.29, 0.98);
  const antA = [a0, [a0[0] + 10, a0[1] - 74], [a0[0] + 66, a0[1] - 128], [a0[0] + 156, a0[1] - 150], [a0[0] + 244, a0[1] - 136]];
  const antB = [b0, [b0[0] + 56, b0[1] - 50], [b0[0] + 156, b0[1] - 74], [b0[0] + 262, b0[1] - 64], [b0[0] + 344, b0[1] - 30]];
  back.push(antenna(antB, C, true));
  back.push(farFin(p, C));
  back.push(fluke(p, C));

  body.push(use(`fill="url(#${p}-body)"`));
  const bel = belly(C);
  body.push(`<g clip-path="url(#${p}-clip)">${bel.band}<rect width="1000" height="1000" fill="url(#${p}-depth)"/></g>`);
  body.push(use(`fill="${C.shadow}" opacity="${phase === 3 ? 0.5 : 0.78}" mask="url(#${p}-ms)"`));
  body.push(`<g clip-path="url(#${p}-clip)">${bel.lines}</g>`);
  let streak = '';
  for (const [v, t0, t1] of [[0.62, 0.28, 0.86], [0.4, 0.34, 0.95], [0.18, 0.5, 0.9]]) {
    const pts = [];
    for (let i = 0; i <= 8; i++) pts.push(SP.at(t0 + (t1 - t0) * i / 8, v));
    streak += shape(pts, false, 0);
  }
  body.push(`<path d="${streak}" fill="none" stroke="${C.hi}" stroke-width="3" stroke-linecap="round" opacity=".45"/>`);
  body.push(use(`fill="${C.hi}" mask="url(#${p}-mh)"`));
  body.push(use(`fill="${C.rimHi}" opacity="${phase === 3 ? 0.9 : 0.7}" mask="url(#${p}-mr)"`));
  body.push(use(`fill="none" stroke="${C.rimLo}" stroke-width="2.5" opacity=".5"`));

  body.push(photophores(p, C, phase));
  const shards = layoutShards(RS);
  if (phase === 2) body.push(brokenArmour(p, C, shards, R));
  else body.push(drawShards(p, C, shards, phase));
  if (phase !== 2) body.push(drawShards(p, C, floatingShards(rng(77), phase === 3 ? 8 : 10, phase === 3 ? 120 : 150), phase));

  front.push(antenna(antA, C, false));
  front.push(lures(p, C, phase));
  front.push(eye(p, C, phase, R));
  front.push(mouth(p, C, phase));
  front.push(pecFin(p, C, phase));
  front.push(barbels(C, phase));
  front.push(words(p, C, phase, R));
  if (phase === 2) front.push(fireflies(p, R));
  else {
    // drifting moon motes: keep the creature ethereal
    const RM = rng(5150 + phase);
    let mm = '';
    for (let i = 0; i < 28; i++) {
      const t = RM.range(0.05, 1), [x0, y0] = SP.at(t, RM.range(-1.6, 1.8));
      const x = Math.min(975, Math.max(25, x0 + RM.range(-60, 60))), y = Math.min(975, Math.max(25, y0 + RM.range(-60, 60)));
      mm += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(RM.range(1, 2.8))}" opacity="${f(RM.range(0.35, 0.9), 2)}"/>`;
    }
    front.push(`<g fill="${phase === 3 ? '#ffffff' : '#e8ddff'}">${mm}</g>`);
  }
  if (seal) front.push(seal.front);
  front.push(childOrb(p, phase, antA[antA.length - 1]));

  const label = ['', '食梦兽·阿涅摩伊（完整形态）', '食梦兽·阿涅摩伊（破甲形态）', '食梦兽·阿涅摩伊（封印形态）'][phase];
  let creature = back.join('') + body.join('') + front.join('');
  if (phase === 3) creature = `<g transform="translate(-8 -22) rotate(5 500 500)">${creature}</g>`;
  if (phase === 2) creature = `<g transform="rotate(-3 500 500)">${creature}</g>`;
  return svgDoc(1000, 1000, label, defs.join(''), creature);
}

// ------------------------------------------------------------------------------------------------
function belly(C) {
  // pale throat band below the mouth, running back along the belly; rorqual pleats
  const topV = (t) => (t < 0.2 ? -0.78 : t < 0.34 ? -0.78 + (t - 0.2) / 0.14 * 0.3 : -0.48 - (t - 0.34) / 0.24 * 0.5);
  const up = [], lo = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12 * 0.58;
    up.push(SP.at(t, Math.max(-1, topV(t))));
    lo.push(SP.at(t, -1.1));
  }
  const band = `<path d="${shape([...up, ...lo.reverse()], true, 0)}" fill="${C.belly}"/>`;
  let pl = '', ph = '';
  for (let k = 0; k < 6; k++) {
    const v = -0.84 - k * 0.03;
    const t0 = 0.02 + k * 0.01, t1 = 0.46 + (k % 3) * 0.03;
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      const t = t0 + (t1 - t0) * i / 6;
      pts.push(SP.at(t, Math.min(v, topV(t) - 0.06 - k * 0.04)));
    }
    pl += shape(pts, false, 0);
    ph += shape(pts.map(([x, y]) => [x - 1, y - 3]), false, 0);
  }
  return { band, lines: `<path d="${ph}" fill="none" stroke="${C.bellyHi}" stroke-width="2" opacity=".8"/><path d="${pl}" fill="none" stroke="${C.pleat}" stroke-width="2.6"/>` };
}

// ------------------------------------------------------------------------------------------------
function layoutShards(R) {
  const out = [];
  const ok = (x, y, t, v) => {
    if (Math.hypot(x - EYE.x, y - EYE.y) < EYE.r + 50) return false;
    if (t < 0.56 && v < -0.3) return false;
    if (t < 0.24 && v < 0.55) return false;
    return true;
  };
  const push = (t, v, scale, kind) => {
    const F = SP(t);
    const [x, y] = SP.at(t, v);
    if (kind !== 'crest' && !ok(x, y, t, v)) return false;
    const w = (F.wu + F.wl) * 0.5;
    const L = Math.max(24, Math.min(76, w * 0.44)) * scale;
    for (const o of out) if (Math.hypot(o.x - x, o.y - y) < (o.L + L) * (kind === 'crest' ? 0.2 : 0.3)) return false;
    const crest = kind === 'crest';
    const W = L * (crest ? R.range(0.32, 0.42) : R.range(0.3, 0.46));
    const tang = Math.atan2(F.ty, F.tx) * 180 / Math.PI;
    const ang = crest ? tang - 38 + R.range(-8, 8) : tang + R.range(-24, 24);
    const pts = [[-0.55, R.range(-0.08, 0.08)], [R.range(-0.16, 0.12), 0.42 + R.range(0, 0.12)], [0.6 + R.range(0, 0.16), R.range(-0.14, 0.14)], [R.range(-0.05, 0.2), -0.42 - R.range(0, 0.12)]];
    if (R() < 0.4) pts.splice(2, 0, [0.36, 0.34]);
    const lit = Math.max(0.25, Math.min(1, 0.74 + v * 0.3 - (t - 0.42) * 0.8));
    out.push({ x, y, t, v, L, W, ang, pts, lit, vig: !crest && R() < 0.22 ? R.int(0, VIGNETTES.length - 1) : -1, dash: R() < 0.45, crest });
    return true;
  };
  // dorsal crest: a mane of glass shards standing out of the back line, raked toward the tail
  for (let t = 0.29, i = 0; t < 0.92; t += 0.034, i++) push(t, i % 2 ? 1.05 : 0.97, (0.55 + 0.85 * Math.exp(-(((t - 0.44) / 0.17) ** 2))) * (i % 2 ? 0.82 : 1), 'crest');
  // flank shards in loose clusters, leaving the smooth hide visible between them
  const clusters = [[0.33, 0.6, 5], [0.44, 0.28, 5], [0.53, 0.66, 5], [0.62, 0.12, 4], [0.7, 0.55, 5], [0.79, 0.1, 4], [0.86, 0.5, 4], [0.94, 0.15, 3]];
  for (const [ct, cv, n] of clusters) {
    let placed = 0;
    for (let i = 0; i < 200 && placed < n; i++) {
      if (push(ct + R.range(-0.035, 0.035), cv + R.range(-0.28, 0.28), R.range(0.75, 1.1), 'flank')) placed++;
    }
  }
  out.sort((a, b) => (a.crest - b.crest) || (b.t - a.t));
  return out;
}

// shards that have drifted off the hide and hang in the air around the creature
function floatingShards(R, n, reach) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = R.range(0.22, 0.96);
    const [x, y] = SP.at(t, 1);
    const F = SP(t);
    const dist = R.range(40, reach);
    const L = R.range(14, 34);
    const fx = Math.min(950, Math.max(50, x + F.nx * dist + R.range(-24, 24))), fy = Math.min(950, Math.max(50, y + F.ny * dist + R.range(-24, 24)));
    out.push({ x: fx, y: fy, L, W: L * R.range(0.32, 0.45), ang: R.range(0, 360), pts: [[-0.55, 0], [0.05, 0.45], [0.6, 0], [0, -0.42]], lit: 0.8, vig: -1, dash: R() < 0.5, t });
  }
  return out;
}

// photophores along the lateral line (deep-sea)
function photophores(p, C, phase) {
  let dots = '', glow = '';
  for (let t = 0.3; t < 0.97; t += 0.028) {
    const [x, y] = SP.at(t, -0.12 + Math.sin(t * 9) * 0.04);
    const r = 2.4 + (1 - t) * 1.6;
    dots += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(r)}"/>`;
    glow += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(r * 3)}"/>`;
  }
  return `<g fill="${C.lureGlow}" opacity="${phase === 3 ? 0.35 : 0.5}" filter="url(#${p}-gs)">${glow}</g><g fill="${C.lure}" opacity="${phase === 2 ? 0.6 : 0.9}">${dots}</g>`;
}

function shardPath(s, scale = 1) {
  const a = s.ang * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
  return poly(s.pts.map(([u, w]) => {
    const lx = u * s.L * scale, ly = w * s.W * scale * 2;
    return [s.x + lx * c - ly * sn, s.y + lx * sn + ly * c];
  }), 0);
}

function drawShards(p, C, shards, phase) {
  let fill = '', vig = '', edges = '', dashed = '', hi = '';
  for (const s of shards) {
    const d = shardPath(s);
    const op = f(phase === 3 ? 0.5 + s.lit * 0.45 : 0.28 + s.lit * 0.62, 2);
    if (s.vig >= 0 && s.L > 30) {
      vig += `<path d="${d}" fill="url(#${p}-mem)" opacity="${op}"/>`;
      vig += `<path d="${VIGNETTES[s.vig]}" transform="translate(${f(s.x, 0)} ${f(s.y, 0)}) rotate(${f(s.ang - (s.ang > 90 || s.ang < -90 ? 180 : 0), 0)}) scale(${f(s.L / 34, 2)})" opacity=".7"/>`;
    } else {
      fill += `<path d="${d}" opacity="${op}"/>`;
    }
    if (s.dash) dashed += d; else edges += d;
    const a = s.ang * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
    const q = (u, w) => [s.x + u * s.L * c - w * s.W * 2 * sn, s.y + u * s.L * sn + w * s.W * 2 * c];
    const p0 = q(s.pts[0][0] + 0.12, s.pts[0][1] + 0.05), p1 = q(s.pts[1][0] - 0.02, s.pts[1][1] - 0.1);
    hi += `M${P(p0[0], p0[1], 0)}L${P(p1[0], p1[1], 0)}`;
  }
  return `<g fill="url(#${p}-shard)">${fill}</g><g fill="${phase === 3 ? '#8d89b4' : '#3a1d36'}">${vig}</g>`
    + `<path d="${edges}" fill="none" stroke="${C.shardEdge}" stroke-width="1.5" stroke-linejoin="round" opacity="${phase === 3 ? 0.75 : 0.55}"/>`
    + `<path d="${dashed}" fill="none" stroke="${C.shardEdge}" stroke-width="2" stroke-dasharray="3 2.4" opacity="${phase === 3 ? 0.65 : 0.72}"/>`
    + `<path d="${hi}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity=".75"/>`;
}

// ------------------------------------------------------------------------------------------------
function brokenArmour(p, C, shards, R) {
  // ~40% of shards remain (cracked, knocked askew); the rest leave raw glowing sockets
  const kept = [], gone = [];
  for (const s of shards) (R() < 0.42 ? kept : gone).push(s);
  let sockets = '', socketsGlow = '';
  for (const s of gone) {
    const d = shardPath(s, 0.8);
    sockets += d;
    if (R() < 0.6) socketsGlow += d;
  }
  let out = `<g clip-path="url(#${p}-clip)"><path d="${socketsGlow}" fill="#2f7dff" opacity=".6" filter="url(#${p}-gs)"/>`
    + `<path d="${sockets}" fill="#0a1f5c" stroke="#4fb6ff" stroke-width="1.6" opacity=".9"/></g>`;
  let cracks = '';
  const seeds = [[0.4, 0.55], [0.48, -0.1], [0.56, 0.45], [0.64, -0.2], [0.7, 0.6], [0.78, 0.1], [0.86, -0.3], [0.34, 0.82], [0.6, 0.85], [0.92, 0.3], [0.3, -0.55], [0.44, -0.62], [0.2, 0.9]];
  for (const [t0, v0] of seeds) {
    let t = t0, v = v0;
    const pts = [SP.at(t, v)];
    const dir = R() < 0.5 ? 1 : -1;
    for (let k = 0; k < 6; k++) {
      t += R.range(0.006, 0.02) * dir;
      v = Math.max(-0.95, Math.min(0.95, v + R.range(-0.22, 0.22)));
      const q = SP.at(Math.min(0.99, Math.max(0.16, t)), v);
      if (Math.hypot(q[0] - EYE.x, q[1] - EYE.y) < EYE.r + 30) break;
      pts.push(q);
    }
    if (pts.length < 2) continue;
    cracks += line(pts, 0);
    const b = pts[Math.min(pts.length - 1, R.int(1, 4))];
    cracks += `M${P(b[0], b[1], 0)}l${f(R.range(-26, 26), 0)},${f(R.range(-26, 26), 0)}`;
  }
  out += `<g clip-path="url(#${p}-clip)"><path d="${cracks}" fill="none" stroke="#2a7dff" stroke-width="14" opacity=".75" filter="url(#${p}-gl)"/>`
    + `<path d="${cracks}" fill="none" stroke="#7fd0ff" stroke-width="4" stroke-linejoin="bevel"/>`
    + `<path d="${cracks}" fill="none" stroke="#f2fbff" stroke-width="1.4" stroke-linejoin="bevel"/></g>`;
  for (const s of kept) if (R() < 0.3) { s.ang += R.range(-30, 30); s.x += R.range(-10, 10); s.y += R.range(-8, 8); }
  out += drawShards(p, C, kept, 2);
  let crk = '';
  for (const s of kept) {
    if (R() < 0.5) {
      const a = R.range(0, Math.PI * 2);
      crk += `M${P(s.x, s.y, 0)}l${f(Math.cos(a) * s.L * 0.4, 0)},${f(Math.sin(a) * s.L * 0.4, 0)}M${P(s.x, s.y, 0)}l${f(-Math.cos(a + 0.6) * s.L * 0.3, 0)},${f(-Math.sin(a + 0.6) * s.L * 0.3, 0)}`;
    }
  }
  out += `<path d="${crk}" stroke="#ffffff" stroke-width="1.3" opacity=".85"/>`;
  // shards breaking away from the back, drifting up and out
  let loose = '';
  for (let i = 0; i < 16; i++) {
    const t = R.range(0.3, 0.95);
    const [x, y] = SP.at(t, 1);
    const F = SP(t);
    const dist = R.range(30, 140);
    const s = { x: Math.min(950, x + F.nx * dist + R.range(-20, 20)), y: Math.max(40, y + F.ny * dist - R.range(0, 30)), L: R.range(14, 34), W: 0, ang: R.range(0, 360), pts: [[-0.55, 0], [0.05, 0.45], [0.6, 0], [0, -0.42]] };
    s.W = s.L * 0.6;
    loose += `<path d="${shardPath(s)}" opacity="${f(R.range(0.5, 0.95), 2)}"/>`;
  }
  return out + `<g fill="url(#${p}-shard)" stroke="${C.shardEdge}" stroke-width="1.4">${loose}</g>`;
}

// ------------------------------------------------------------------------------------------------
function crPoint(ctrl, t) {
  const n = ctrl.length - 1;
  const x = Math.min(n - 1e-9, t * n);
  const i = Math.floor(x), u = x - i;
  const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(n, i + 2)];
  const c = (k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u * u + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u * u * u);
  return [c(0), c(1)];
}

function antenna(ctrl, C, far) {
  // bipectinate (feathery) moth antenna: dusty vane silhouette + fine barbs on both sides
  const col = far ? C.antennaDim : C.antenna;
  const N = 28;
  const pts = [];
  for (let i = 0; i <= N; i++) pts.push(crPoint(ctrl, i / N));
  const vaneL = [], vaneR = [];
  let barbs = '';
  for (let i = 1; i < N; i++) {
    const [x, y] = pts[i];
    const [x2, y2] = pts[i + 1];
    let tx = x2 - x, ty = y2 - y;
    const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
    const t = i / N;
    const len = (far ? 34 : 44) * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.1)) * (1 - t * 0.3) + 4;
    const ca = 0.6;
    const lx = x + (-ty * Math.cos(ca) + tx * Math.sin(ca)) * len, ly = y + (tx * Math.cos(ca) + ty * Math.sin(ca)) * len;
    const rx = x + (ty * Math.cos(ca) + tx * Math.sin(ca)) * len, ry = y + (-tx * Math.cos(ca) + ty * Math.sin(ca)) * len;
    barbs += `M${P(x, y, 0)}L${P(lx, ly, 0)}M${P(x, y, 0)}L${P(rx, ry, 0)}`;
    vaneL.push([lx, ly]); vaneR.push([rx, ry]);
  }
  const vane = shape([pts[0], ...vaneL, pts[N], ...vaneR.reverse()], true, 0);
  const shaft = shape(pts.filter((_, i) => i % 4 === 0 || i === N), false, 0);
  return `<g opacity="${far ? 0.8 : 1}"><path d="${vane}" fill="${col}" opacity="${far ? 0.16 : 0.22}"/>`
    + `<path d="${barbs}" stroke="${col}" stroke-width="${far ? 1.6 : 2}" stroke-linecap="round" opacity=".85"/>`
    + `<path d="${shaft}" fill="none" stroke="${far ? C.antennaDim : C.rimHi}" stroke-width="${far ? 4 : 5}" stroke-linecap="round"/>`
    + `<path d="${shaft}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" opacity=".9"/></g>`;
}

// ------------------------------------------------------------------------------------------------
function lures(p, C, phase) {
  const b1 = SP.at(0.1, 0.92), b2 = SP.at(0.165, 0.985);
  const L = [
    { base: b1, c1: [b1[0] - 26, b1[1] - 100], c2: [b1[0] - 112, b1[1] - 136], tip: [b1[0] - 146, b1[1] - 76], r: 16 },
    { base: b2, c1: [b2[0] + 4, b2[1] - 92], c2: [b2[0] - 54, b2[1] - 144], tip: [b2[0] - 108, b2[1] - 128], r: 12 },
  ];
  let s = '';
  for (const [i, l] of L.entries()) {
    const d = `M${P(...l.base)}C${P(...l.c1)} ${P(...l.c2)} ${P(...l.tip)}`;
    s += `<path d="${d}" fill="none" stroke="${C.body[2]}" stroke-width="7" stroke-linecap="round"/>`;
    s += `<path d="${d}" fill="none" stroke="${C.rimHi}" stroke-width="2.2" stroke-linecap="round" opacity=".8" transform="translate(-1.5 -2)"/>`;
    const dim = phase === 3 ? 0.55 : phase === 2 && i === 1 ? 0.6 : 1;
    const cx = l.tip[0], cy = l.tip[1] + l.r * 0.9;
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(l.r * 4.4)}" fill="url(#${p}-lure)" opacity="${dim}"/>`;
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(l.r)}" fill="${C.lure}" stroke="${C.body[1]}" stroke-width="2" opacity="${phase === 3 ? 0.8 : 1}"/>`;
    s += `<circle cx="${f(cx - l.r * 0.3)}" cy="${f(cy - l.r * 0.35)}" r="${f(l.r * 0.38)}" fill="#ffffff"/>`;
  }
  return s;
}

// ------------------------------------------------------------------------------------------------
function eye(p, C, phase, R) {
  const { x, y } = EYE;
  const r = phase === 2 ? EYE.r * 1.06 : EYE.r;
  const tilt = phase === 3 ? 18 : 12; // lid axis tilted: the rear corner droops (melancholy, not menace)
  // moon-phase lids: terminator height y0 (fraction of r, negative = above centre) and bulge b
  const U = { 1: [-0.34, 0.3], 2: [-0.8, 0.1], 3: [0.3, 0.2] }[phase];
  const D = { 1: [0.8, 0.12], 2: [0.9, 0.06], 3: [0.74, 0.14] }[phase];
  const s = [];
  s.push(`<circle r="${f(r + 90)}" fill="url(#${p}-eyeglow)"/>`);
  s.push(`<circle r="${f(r + 16)}" fill="url(#${p}-orbit)"/>`);
  const fold = (r1, r2, a0, a1) => {
    const A = (rr, a) => P(Math.cos(a) * rr, Math.sin(a) * rr);
    return `M${A(r1, a0)}A${f(r1)},${f(r1)} 0 0 1 ${A(r1, a1)}L${A(r2, a1)}A${f(r2)},${f(r2)} 0 0 0 ${A(r2, a0)}Z`;
  };
  // heavy brow ridge: a crescent thick over the top, tapering to nothing at the corners
  const brow = (rIn, thick, a0, a1, n = 12) => {
    const o = [], q = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * i / n;
      const th = Math.sin(Math.PI * i / n) ** 0.8 * thick;
      o.push([Math.cos(a) * (rIn + th), Math.sin(a) * (rIn + th)]);
      q.push([Math.cos(a) * rIn, Math.sin(a) * rIn]);
    }
    return shape([...o, ...q.reverse()], true, 0);
  };
  s.push(`<path d="${brow(r + 2, 40, Math.PI * 0.98, Math.PI * 2.02)}" fill="${C.hi}"/>`);
  s.push(`<path d="${brow(r + 28, 12, Math.PI * 1.06, Math.PI * 1.72)}" fill="${C.rimHi}" opacity=".55"/>`);
  s.push(`<path d="${brow(r + 1, 7, Math.PI * 0.94, Math.PI * 2.06)}" fill="${C.lidEdge}" opacity=".8"/>`);
  // cheek fold under the eye
  s.push(`<path d="${brow(r + 4, 14, Math.PI * 0.16, Math.PI * 0.84)}" fill="${C.lidEdge}" opacity=".5"/>`);
  const clip = `${p}-eyeclip`;
  s.push(`<clipPath id="${clip}"><circle r="${f(r)}"/></clipPath>`);
  const ball = [];
  ball.push(`<circle r="${f(r)}" fill="url(#${p}-sclera)"/>`);
  if (phase === 2) {
    let v = '';
    for (let i = 0; i < 18; i++) {
      const a = R.range(0, Math.PI * 2);
      let px = Math.cos(a) * r, py = Math.sin(a) * r;
      v += `M${P(px, py, 0)}`;
      for (let k = 0; k < 3; k++) {
        const aa = a + Math.PI + R.range(-0.8, 0.8);
        px += Math.cos(aa) * r * 0.06; py += Math.sin(aa) * r * 0.06;
        v += `L${P(px, py, 0)}`;
      }
    }
    ball.push(`<path d="${v}" fill="none" stroke="#c0307a" stroke-width="2" opacity=".85"/>`);
  }
  // the iris looks down-left, toward the party (world offset -> local, undo tilt)
  const look = phase === 3 ? [-6, 22] : [-10, 10];
  const la = -tilt * Math.PI / 180;
  const ix = look[0] * Math.cos(la) - look[1] * Math.sin(la), iy = look[0] * Math.sin(la) + look[1] * Math.cos(la);
  const ir = r * (phase === 2 ? 0.74 : 0.8);
  ball.push(`<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir + 7)}" fill="${C.iris[4]}" opacity=".85"/>`);
  ball.push(`<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir)}" fill="url(#${p}-iris)"/>`);
  let fib = '';
  for (let i = 0; i < 64; i++) {
    const a = i / 64 * Math.PI * 2 + R.range(-0.02, 0.02);
    const r1 = ir * R.range(0.36, 0.46), r2 = ir * R.range(0.76, 0.97);
    fib += `M${P(ix + Math.cos(a) * r1, iy + Math.sin(a) * r1, 0)}L${P(ix + Math.cos(a + 0.09) * r2, iy + Math.sin(a + 0.09) * r2, 0)}`;
  }
  ball.push(`<path d="${fib}" stroke="${phase === 3 ? '#ffffff' : C.iris[1]}" stroke-width="1" opacity=".45"/>`);
  const armCols = phase === 1 ? ['#ffd2f2', '#8fd0ff', '#ffb38a'] : phase === 2 ? ['#ffb3e6', '#ff6fb0', '#ffcf8a'] : ['#ffffff', '#e6e0ff', '#ffffff'];
  for (let k = 0; k < 3; k++) {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const u = i / 12;
      const a = k * 2.094 + u * 3.4;
      const rr = ir * (0.42 + u * 0.5);
      pts.push([ix + Math.cos(a) * rr, iy + Math.sin(a) * rr]);
    }
    ball.push(`<path d="${shape(pts, false, 0)}" fill="none" stroke="${armCols[k]}" stroke-width="${f(4.4 - k)}" stroke-linecap="round" opacity=".42"/>`);
  }
  let stars = '';
  for (let i = 0; i < 20; i++) {
    const a = R.range(0, Math.PI * 2), rr = ir * R.range(0.45, 0.92);
    stars += `<circle cx="${f(ix + Math.cos(a) * rr, 0)}" cy="${f(iy + Math.sin(a) * rr, 0)}" r="${f(R.range(0.8, 2))}"/>`;
  }
  ball.push(`<g fill="#ffffff" opacity=".85">${stars}</g>`);
  ball.push(`<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir)}" fill="none" stroke="${C.limbus}" stroke-width="2.6" opacity=".85"/>`);
  const pr = ir * (phase === 2 ? 0.18 : phase === 3 ? 0.3 : 0.25);
  let rays = '';
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2, l = pr * (i % 2 ? 1.5 : 1.9);
    rays += `M${P(ix + Math.cos(a) * pr, iy + Math.sin(a) * pr)}L${P(ix + Math.cos(a) * l, iy + Math.sin(a) * l)}`;
  }
  ball.push(`<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(pr * 1.45)}" fill="#ffffff" opacity=".35"/>`);
  ball.push(`<path d="${rays}" stroke="#fff8ec" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`);
  ball.push(`<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(pr)}" fill="#05040d"/>`);
  ball.push(`<path d="M${P(ix - pr * 0.95, iy + pr * 0.3)}A${f(pr)},${f(pr)} 0 0 1 ${P(ix + pr * 0.4, iy - pr * 0.92)}" fill="none" stroke="#fff6e8" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>`);
  const up = (y0, b) => {
    const Y = y0 * r, a = Math.sqrt(Math.max(1, r * r - Y * Y)), B = Math.max(0.5, b * r);
    return { d: `M${P(-a, Y)}A${f(r)},${f(r)} 0 ${Y > 0 ? 1 : 0} 1 ${P(a, Y)}A${f(a)},${f(B)} 0 0 0 ${P(-a, Y)}Z`, edge: `M${P(a, Y)}A${f(a)},${f(B)} 0 0 0 ${P(-a, Y)}`, Y };
  };
  const dn = (y0, b) => {
    const Y = y0 * r, a = Math.sqrt(Math.max(1, r * r - Y * Y)), B = Math.max(0.5, b * r);
    return { d: `M${P(-a, Y)}A${f(r)},${f(r)} 0 ${Y < 0 ? 1 : 0} 0 ${P(a, Y)}A${f(a)},${f(B)} 0 0 1 ${P(-a, Y)}Z`, edge: `M${P(a, Y)}A${f(a)},${f(B)} 0 0 1 ${P(-a, Y)}` };
  };
  const lidU = up(U[0], U[1]);
  const lidS = up(U[0] + 0.16, U[1] * 0.9);
  const lidD = dn(D[0], D[1]);
  ball.push(`<path d="${lidS.d}" fill="${C.sclera[2]}" opacity=".55"/>`);
  // soft window reflection on the cornea (world top-left)
  const hx = -r * 0.34, hy = Math.max(lidU.Y + r * 0.26, -r * 0.24);
  ball.push(`<path d="M${P(hx - r * 0.16, hy + r * 0.1)}Q${P(hx - r * 0.1, hy - r * 0.12)} ${P(hx + r * 0.14, hy - r * 0.16)}" fill="none" stroke="#ffffff" stroke-width="${f(r * 0.07)}" stroke-linecap="round" opacity=".6"/>`);
  ball.push(`<path d="${lidU.d}" fill="url(#${p}-lid)"/>`);
  ball.push(`<path d="${lidD.d}" fill="url(#${p}-lid)"/>`);
  s.push(`<g clip-path="url(#${clip})">${ball.join('')}</g>`);
  s.push(`<path d="${lidU.edge}" fill="none" stroke="${C.lidEdge}" stroke-width="7" stroke-linecap="round"/>`);
  s.push(`<path d="${lidU.edge}" fill="none" stroke="${C.rimHi}" stroke-width="1.8" stroke-linecap="round" opacity=".75" transform="translate(0 -6)"/>`);
  s.push(`<path d="${lidD.edge}" fill="none" stroke="${C.lidEdge}" stroke-width="4.5" stroke-linecap="round"/>`);
  s.push(`<path d="${lidD.edge}" fill="none" stroke="${C.rimLo}" stroke-width="1.5" opacity=".7" transform="translate(0 4)"/>`);
  // dusty lashes (moth fringe): at the rear corner, and along the lowered lid when sealed
  let lash = '';
  for (let i = 0; i < 6; i++) {
    const a = -0.3 + i * 0.11;
    const bx = Math.cos(a) * (r + 2), by = Math.sin(a) * (r + 2);
    lash += `M${P(bx, by, 0)}l${f(12 + i, 0)},${f(-3 + i * 3, 0)}`;
  }
  if (phase === 3) {
    const Y = U[0] * r, a = Math.sqrt(r * r - Y * Y), B = U[1] * r;
    for (let i = 1; i < 12; i++) {
      const th = Math.PI * i / 12;
      const lx = Math.cos(th) * a, ly = Y - Math.sin(th) * B;
      lash += `M${P(lx, ly + 3, 0)}l${f(Math.cos(th) * 4 - 3, 0)},${f(10 + Math.sin(th) * 6, 0)}`;
    }
  }
  s.push(`<path d="${lash}" stroke="${C.antenna}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`);
  // moon-phase studs along the brow ridge: new -> full -> new
  const n = 5;
  let studs = '';
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (1.22 + i * 0.56 / (n - 1));
    const rr = r + 22;
    const cx = Math.cos(a) * rr, cy = Math.sin(a) * rr;
    const k = i / (n - 1);
    const ph = 1 - Math.abs(k - 0.5) * 2;
    const sz = 5 + ph * 1.8;
    studs += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(sz * 2.6)}" fill="url(#${p}-stud)"/>`;
    studs += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(sz)}" fill="${C.studDark}" opacity=".6"/>`;
    if (ph > 0.99) studs += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(sz)}" fill="${C.stud}"/>`;
    else {
      const side = k < 0.5 ? 1 : -1;
      const e = Math.abs(1 - 2 * ph) * sz;
      const sweepT = ph > 0.5 ? (side > 0 ? 0 : 1) : (side > 0 ? 1 : 0);
      studs += `<path d="M${P(cx, cy - sz)}A${f(sz)},${f(sz)} 0 0 ${side > 0 ? 1 : 0} ${P(cx, cy + sz)}A${f(Math.max(0.3, e))},${f(sz)} 0 0 ${sweepT} ${P(cx, cy - sz)}Z" fill="${C.stud}"/>`;
    }
  }
  s.push(studs);
  if (phase === 3) {
    // moonlight tear + the seal mark pressed onto the lowered lid
    s.push(`<path d="M${P(-r * 0.9, r * 0.46)}c-5,12-7,22-2,28c5-6,5-16,2-28z" fill="#ffffff" opacity=".9"/>`);
    const sy = U[0] * r - r * 0.5;
    s.push(`<g transform="translate(0 ${f(sy)})" fill="none" stroke="#ffffff" stroke-linecap="round"><circle r="22" stroke-width="2.4" opacity=".9"/><circle r="15" stroke-width="1.2" stroke-dasharray="3 4" opacity=".8"/><path d="M-9,-8A11,11 0 1 0 9,-8A8,8 0 1 1 -9,-8Z" fill="#ffffff" stroke="none" opacity=".9"/><path d="M0,-30V-24M0,24V30M-30,0H-24M24,0H30" stroke-width="2"/></g>`);
  }
  return `<g transform="translate(${x} ${y}) rotate(${tilt})">${s.join('')}</g>`;
}

// ------------------------------------------------------------------------------------------------
function mouth(p, C, phase) {
  const vs = [[0.0, -0.3], [0.05, -0.6], [0.12, -0.74], [0.2, -0.79], [0.27, -0.76], [0.31, -0.66]];
  const F0 = SP(0);
  const pts = [[F0.x - F0.tx * 36 - F0.nx * 14, F0.y - F0.ty * 36 - F0.ny * 14]];
  for (const [t, v] of vs) pts.push(SP.at(t, v));
  const d = shape(pts, false);
  const end = pts[pts.length - 1];
  const glow = phase === 2 ? `<path d="${d}" fill="none" stroke="#3f9cff" stroke-width="10" opacity=".6" filter="url(#${p}-gs)"/>` : '';
  return glow + `<path d="${d}" fill="none" stroke="${C.lidEdge}" stroke-width="5" stroke-linecap="round"/>`
    + `<path d="${d}" fill="none" stroke="${C.bellyHi}" stroke-width="1.8" stroke-linecap="round" transform="translate(0 4)" opacity=".7"/>`
    + `<path d="M${P(end[0], end[1])}c8,-4,13,-11,13,-20" fill="none" stroke="${C.lidEdge}" stroke-width="3.5" stroke-linecap="round"/>`;
}

// ------------------------------------------------------------------------------------------------
function pecFin(p, C, phase) {
  // long humpback flipper: gently knobbed leading edge, moth-dusted membrane on the trailing half
  const A = SP.at(0.27, -0.8), Bt = [168, 780], A2 = SP.at(0.35, -0.92);
  const lead = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    const bow = Math.sin(u * Math.PI) * 40;
    const knob = i % 2 ? 6 : 0;
    lead.push([A[0] + (Bt[0] - A[0]) * u - bow * 0.7 - knob * 0.8, A[1] + (Bt[1] - A[1]) * u - bow * 0.6 - knob * 0.6]);
  }
  const trail = [];
  for (let i = 0; i <= 7; i++) {
    const u = i / 7;
    const sag = Math.sin(u * Math.PI) * 30;
    trail.push([Bt[0] + 18 + (A2[0] - Bt[0] - 18) * u + sag * 0.6, Bt[1] - 6 + (A2[1] - Bt[1] + 6) * u + sag * 0.5]);
  }
  const d = shape([...lead, ...trail], true);
  const s = [];
  s.push(`<path d="${d}" fill="url(#${p}-fin)"/>`);
  const inner = trail.map(([x, y], i) => {
    const u = i / 7;
    const L = lead[Math.round(12 - u * 12)];
    return [x + (L[0] - x) * 0.32, y + (L[1] - y) * 0.32];
  });
  s.push(`<path d="${shape([...trail, ...inner.reverse()], true)}" fill="url(#${p}-membrane)"/>`);
  let veins = '';
  for (let i = 1; i < 7; i++) {
    const a = lead[12 - Math.round(i / 7 * 12)];
    const b = trail[i];
    veins += `M${P(a[0] * 0.8 + b[0] * 0.2, a[1] * 0.8 + b[1] * 0.2, 0)}Q${P((a[0] + b[0]) / 2 + 8, (a[1] + b[1]) / 2 - 6, 0)} ${P(b[0], b[1], 0)}`;
  }
  s.push(`<path d="${veins}" fill="none" stroke="${C.finVein}" stroke-width="1.5" opacity=".45"/>`);
  const es = [lead[6][0] * 0.55 + trail[3][0] * 0.45, lead[6][1] * 0.55 + trail[3][1] * 0.45];
  s.push(`<circle cx="${f(es[0])}" cy="${f(es[1])}" r="17" fill="${C.body[2]}" opacity=".55"/><circle cx="${f(es[0])}" cy="${f(es[1])}" r="11" fill="none" stroke="${C.finVein}" stroke-width="3" opacity=".8"/><circle cx="${f(es[0])}" cy="${f(es[1])}" r="4.5" fill="${C.rimHi}"/>`);
  let dust = '';
  for (let i = 0; i < 26; i++) {
    const u = (i * 0.618) % 1, w = (i * 0.37) % 1;
    const a = lead[Math.min(12, 3 + Math.round(u * 9))], b = trail[Math.max(0, 4 - Math.round(u * 4))];
    dust += `<circle cx="${f(a[0] + (b[0] - a[0]) * w * 0.8, 0)}" cy="${f(a[1] + (b[1] - a[1]) * w * 0.8, 0)}" r="${f(0.8 + (i % 3) * 0.5)}"/>`;
  }
  s.push(`<g fill="${C.finVein}" opacity=".5">${dust}</g>`);
  s.push(`<path d="${shape(lead, false)}" fill="none" stroke="${C.rimHi}" stroke-width="2.6" opacity=".7"/>`);
  s.push(`<path d="${shape(trail, false)}" fill="none" stroke="${C.rimLo}" stroke-width="2" opacity=".55"/>`);
  if (phase === 2) s.push(`<path d="M${P(lead[5][0] + 6, lead[5][1] + 4)}l24,20l-8,28l18,24" fill="none" stroke="#7fd0ff" stroke-width="3"/>`);
  return s.join('');
}

function farFin(p, C) {
  const A = SP.at(0.42, -0.86), B = SP.at(0.5, -0.9);
  const tip = [A[0] - 70, A[1] + 250];
  const d = shape([A, [A[0] - 26, A[1] + 90], [A[0] - 52, A[1] + 180], [tip[0], tip[1], 1], [tip[0] + 40, tip[1] - 40], [B[0] - 14, B[1] + 120], B], true);
  return `<path d="${d}" fill="url(#${p}-fin)" opacity=".7"/><path d="${d}" fill="none" stroke="${C.rimLo}" stroke-width="2" opacity=".45"/>`;
}

function fluke(p, C) {
  const F = SP(1);
  const loc = (a, b, c) => { const q = [F.x + F.tx * a + F.nx * b, F.y + F.ty * a + F.ny * b]; if (c) q.push(1); return q; };
  const pts = [
    loc(-24, 22), loc(6, 60), loc(26, 104), loc(44, 136, 1), loc(64, 112), loc(70, 80), loc(70, 44), loc(64, 16), loc(80, 0, 1),
    loc(64, -16), loc(70, -44), loc(70, -80), loc(64, -112), loc(44, -136, 1), loc(26, -104), loc(6, -60), loc(-24, -22),
  ];
  const d = shape(pts, true);
  return `<path d="${d}" fill="url(#${p}-fluke)"/><path d="${d}" fill="none" stroke="${C.rimLo}" stroke-width="2.2" opacity=".55"/>`
    + `<path d="${shape([loc(-6, -26), loc(16, -70), loc(40, -128)], false)}" fill="none" stroke="${C.rimHi}" stroke-width="2.4" opacity=".6"/>`
    + `<path d="${shape([loc(-10, 0), loc(70, 0)], false)}" stroke="${C.body[2]}" stroke-width="3" opacity=".6"/>`;
}

function barbels(C, phase) {
  const s = [];
  [[0.06, -0.76, -60, 120], [0.13, -0.92, -24, 150]].forEach(([t, v, dx, dy], i) => {
    const b = SP.at(t, v), e = [b[0] + dx, b[1] + dy];
    const d = `M${P(...b)}C${P(b[0] - 16, b[1] + 50)} ${P(e[0] + 28, e[1] - 60)} ${P(...e)}`;
    s.push(`<path d="${d}" fill="none" stroke="${C.antenna}" stroke-width="${f(2.4 - i * 0.4)}" stroke-linecap="round" opacity="${phase === 3 ? 0.8 : 0.6}"/>`);
    s.push(`<circle cx="${f(e[0])}" cy="${f(e[1])}" r="3.2" fill="${C.lure}"/>`);
  });
  return s.join('');
}

// ------------------------------------------------------------------------------------------------
function words(p, C, phase, R) {
  // digested language drifting from the mouth along loose ribbons
  const m = SP.at(0.02, -0.5);
  const streams = phase === 3
    ? [[m, [m[0] - 50, m[1] - 40], [m[0] - 70, m[1] - 140]]]
    : phase === 2
      ? [[m, [m[0] - 60, m[1] - 30], [m[0] - 80, m[1] - 170]], [m, [m[0] - 50, m[1] + 80], [m[0] - 70, m[1] + 200]], [m, [m[0] - 10, m[1] - 110], [m[0] + 40, m[1] - 240]]]
      : [[m, [m[0] - 60, m[1] - 30], [m[0] - 80, m[1] - 170]], [m, [m[0] - 50, m[1] + 80], [m[0] - 70, m[1] + 190]]];
  const count = phase === 3 ? 7 : phase === 2 ? 26 : 18;
  let crisp = '', glow = '';
  for (let i = 0; i < count; i++) {
    const st = streams[i % streams.length];
    const u = (Math.floor(i / streams.length) + R.range(0.2, 0.9)) / Math.ceil(count / streams.length);
    const q = bez(st, u);
    const x = q[0] + R.range(-18, 18), y = q[1] + R.range(-14, 14);
    const sc = (1.25 - u * 0.6) * R.range(0.7, 1.05);
    const g = GLYPHS[R.int(0, GLYPHS.length - 1)];
    const col = R() < 0.35 ? C.glyph2 : C.glyph;
    const op = f(Math.max(0.25, 1 - u * 0.7), 2);
    const tr = `translate(${f(x, 0)} ${f(y, 0)}) rotate(${f(R.range(-25, 25), 0)}) scale(${f(sc, 2)})`;
    crisp += `<path d="${g}" transform="${tr}" stroke="${col}" opacity="${op}"/>`;
    glow += `<path d="${g}" transform="${tr}"/>`;
  }
  return `<g fill="none" stroke="${phase === 2 ? '#5ab8ff' : C.lureGlow}" stroke-width="5" stroke-linecap="round" opacity=".5" filter="url(#${p}-gs)">${glow}</g>`
    + `<g fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${crisp}</g>`;
}
function bez([a, b, c], u) {
  return [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * b[0] + u * u * c[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * b[1] + u * u * c[1]];
}

// ------------------------------------------------------------------------------------------------
function fireflies(p, R) {
  // memory fragments pouring out of the cracks like fireflies
  let dots = '', glow = '', shards = '';
  for (let i = 0; i < 70; i++) {
    const t = R.range(0.28, 0.98), v = R.range(-0.4, 1);
    const [x0, y0] = SP.at(t, v);
    const F = SP(t);
    const out = R.range(0, 1) ** 1.6 * 220;
    const x = x0 + F.nx * out + R.range(-30, 30) - out * 0.3, y = y0 + F.ny * out - out * 0.5 + R.range(-30, 30);
    if (x < 10 || x > 990 || y < 10 || y > 990) continue;
    const r = R.range(1.4, 4.4);
    const warm = R() < 0.75;
    dots += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(r)}" fill="${warm ? '#ffe2b8' : '#bfe8ff'}"/>`;
    glow += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(r * 2.6)}" fill="${warm ? PAL.memory : '#5ab8ff'}"/>`;
    if (i % 9 === 0) shards += `<path d="M${P(x + 8, y, 0)}l6,-9l7,9l-7,8z" fill="url(#${p}-mem)" opacity=".85"/>`;
  }
  return `<g opacity=".7" filter="url(#${p}-gs)">${glow}</g><g>${dots}</g>${shards}`;
}

// ------------------------------------------------------------------------------------------------
function ringPath(cx, cy, rx, ry, rotDeg, a0, a1, n = 28) {
  const pts = [];
  const rr = rotDeg * Math.PI / 180;
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * i / n;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    pts.push([cx + x * Math.cos(rr) - y * Math.sin(rr), cy + x * Math.sin(rr) + y * Math.cos(rr)]);
  }
  return pts;
}

function sealRings(p) {
  const back = [], front = [];
  const glowS = (d, w) => `<path d="${d}" fill="none" stroke="#bfb2ff" stroke-width="${f(w * 3)}" opacity=".5" filter="url(#${p}-gs)"/>`
    + `<path d="${d}" fill="none" stroke="#f6f2ff" stroke-width="${f(w)}" stroke-linecap="round"/>`;
  // great seal circle behind the creature (tilted ellipse) with rune ticks
  const ell = (rx, ry, attrs) => `<ellipse cx="500" cy="520" rx="${rx}" ry="${ry}" transform="rotate(-12 500 520)" fill="none" ${attrs}/>`;
  back.push(ell(466, 150, `stroke="#bfb2ff" stroke-width="9" opacity=".5" filter="url(#${p}-gs)"`) + ell(466, 150, 'stroke="#f6f2ff" stroke-width="3"'));
  back.push(ell(436, 132, 'stroke="#e8ddff" stroke-width="1.6" stroke-dasharray="2 9" opacity=".8"'));
  let runes = '';
  for (let i = 0; i < 36; i++) {
    const a = i / 36 * Math.PI * 2;
    const [ax, ay] = ringPath(500, 520, 451, 141, -12, a, a, 1)[0];
    runes += i % 3 === 0 ? `M${P(ax - 5, ay, 0)}h10M${P(ax, ay - 5, 0)}v10` : `M${P(ax - 3, ay, 0)}h6`;
  }
  back.push(`<path d="${runes}" stroke="#f6f2ff" stroke-width="2" opacity=".85"/>`);
  // body rings: perpendicular to the spine, split into back/front halves
  const anchors = [];
  for (const [t, extra, w] of [[0.42, 64, 6], [0.78, 50, 5]]) {
    const F = SP(t);
    const ang = Math.atan2(F.ny, F.nx) * 180 / Math.PI;
    const rx = (F.wu + F.wl) / 2 + extra, ry = rx * 0.28;
    const off = (F.wu - F.wl) / 2;
    const cx = F.x + F.nx * off, cy = F.y + F.ny * off;
    back.push(glowS(shape(ringPath(cx, cy, rx, ry, ang, Math.PI, Math.PI * 2), false), w * 0.7));
    front.push(glowS(shape(ringPath(cx, cy, rx, ry, ang, 0, Math.PI), false), w));
    let rn = '';
    for (let i = 1; i < 9; i++) {
      const [qx, qy] = ringPath(cx, cy, rx, ry, ang, i / 9 * Math.PI, i / 9 * Math.PI, 1)[0];
      rn += `<circle cx="${f(qx)}" cy="${f(qy)}" r="${i % 2 ? 4 : 2.5}"/>`;
    }
    front.push(`<g fill="#ffffff">${rn}</g>`);
    anchors.push([cx + F.nx * rx, cy + F.ny * rx], [cx - F.nx * rx, cy - F.ny * rx]);
  }
  // chains of light from beyond the frame, locked onto the rings
  const chain = (a, b, n) => {
    let s = '';
    const dx = (b[0] - a[0]) / n, dy = (b[1] - a[1]) / n;
    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    const L = Math.hypot(dx, dy);
    for (let i = 0; i < n; i++) {
      const cx = a[0] + dx * (i + 0.5), cy = a[1] + dy * (i + 0.5);
      if (i % 2 === 0) s += `<rect x="${f(-L * 0.62)}" y="-6" width="${f(L * 1.24)}" height="12" rx="6" transform="translate(${f(cx)} ${f(cy)}) rotate(${f(ang)})"/>`;
      else s += `<path d="M${f(-L * 0.6)},0H${f(L * 0.6)}" transform="translate(${f(cx)} ${f(cy)}) rotate(${f(ang)})" stroke-width="5"/>`;
    }
    return s;
  };
  // anchor points on the great seal circle (left and right extremes)
  const gl = ringPath(500, 520, 466, 150, -12, Math.PI * 0.94, Math.PI * 0.94, 1)[0];
  const gr = ringPath(500, 520, 466, 150, -12, Math.PI * 1.97, Math.PI * 1.97, 1)[0];
  const ch = chain(gl, anchors[1], 8) + chain(gr, anchors[2], 4);
  front.push(`<g fill="none" stroke="#bfb2ff" stroke-width="8" opacity=".45" filter="url(#${p}-gs)">${ch}</g>`);
  front.push(`<g fill="none" stroke="#f8f5ff" stroke-width="2.6">${ch}</g>`);
  return { back: back.join(''), front: front.join('') };
}

// ------------------------------------------------------------------------------------------------
function childOrb(p, phase, tip) {
  const [x, y] = tip;
  if (phase !== 3) return `<circle cx="${f(x + 4)}" cy="${f(y + 3)}" r="${phase === 2 ? 14 : 10}" fill="url(#${p}-orb)" opacity="${phase === 2 ? 0.75 : 0.55}"/>`;
  const cy = y + 52;
  return `<path d="M${P(x, y)}C${P(x + 4, y + 10)} ${P(x + 2, y + 6)} ${P(x, cy - 34)}" fill="none" stroke="#fff3df" stroke-width="2"/>`
    + `<circle cx="${f(x)}" cy="${f(cy)}" r="84" fill="url(#${p}-orb)" opacity=".5"/>`
    + `<circle cx="${f(x)}" cy="${f(cy)}" r="40" fill="url(#${p}-orb)"/>`
    + `<circle cx="${f(x)}" cy="${f(cy)}" r="40" fill="none" stroke="#fff3df" stroke-width="2.2"/>`
    + `<path d="${CHILD}" transform="translate(${f(x + 2)} ${f(cy + 5)}) scale(2.05)" fill="#6b2a3a"/>`;
}
