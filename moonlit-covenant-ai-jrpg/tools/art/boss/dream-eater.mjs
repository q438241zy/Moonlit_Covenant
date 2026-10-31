// 食梦兽·阿涅摩伊 — three battle phases (1 complete / 2 armour-broken / 3 sealed).
// One creature re-dressed per phase. Pose: a whale-scale body arching like a crescent moon —
// the heavy head dives toward the lower left (toward the party), the back rises in a long sweep,
// and the tail falls away to a broad fluke at the lower right. Moth antennae, deep-sea lures,
// rorqual throat pleats, translucent memory-shard scales with warm film-grain edges, one huge
// ancient eye with moon-phase lids and a swirling nebula iris.
// viewBox 0 0 1000 1000, transparent background, ≤ 4 filters, ≤ 60KB per phase.
import { rng, f, P, line, shape, spine, radial, linear, blur, svgDoc } from '../stage/lib.mjs';

// ------------------------------------------------------------------------------------------------
// Shared geometry (identical in every phase: same creature)
// ------------------------------------------------------------------------------------------------
const SP = spine([
  [112, 640, 120, 66],
  [216, 600, 172, 178],
  [336, 540, 192, 212],
  [468, 458, 186, 196],
  [602, 396, 160, 150],
  [726, 394, 132, 112],
  [816, 454, 104, 84],
  [858, 552, 78, 62],
  [852, 654, 56, 44],
  [822, 734, 36, 28],
  [786, 782, 20, 16],
]);
const EYE = (() => { const [x, y] = SP.at(0.175, 0.13); return { x, y, r: 134 }; })();
const throat = (t) => -1 - 0.07 * Math.exp(-(((t - 0.16) / 0.09) ** 2));
// mouth line: long and low, corner turned down (melancholy, not menace)
const mouthV = (t) => (t < 0.05 ? -0.5 - t / 0.05 * 0.06 : t < 0.27 ? -0.56 - Math.sin((t - 0.05) / 0.22 * Math.PI) * 0.06 : -0.56 - (t - 0.27) * 3);
const MOUTH_END = 0.33;
// head front in the local frame of t=0 (a: forward along -tangent, b: toward the back):
// a tall blunt brow (sperm-whale mass) over a slimmer, underslung lower jaw
const SNOUT = [[26, 118], [52, 102], [68, 72], [74, 34], [70, 0], [58, -24], [42, -36, 1], [26, -44], [14, -56], [4, -64]];
const snoutPt = ([a, b, c]) => { const F = SP(0); const q = [F.x - F.tx * a + F.nx * b, F.y - F.ty * a + F.ny * b]; if (c) q.push(1); return q; };

function bodyOutline() {
  const up = [], lo = [];
  const N = 32;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    up.push(SP.at(t, 1));
    lo.push(SP.at(t, throat(t)));
  }
  return [...up, ...lo.reverse(), ...SNOUT.slice().reverse().map(snoutPt)];
}

// local frame helper: a point dt along the spine and dv across it, in absolute units
const at = (t, v, da = 0, db = 0) => { const F = SP(t); const [x, y] = SP.at(t, v); return [x + F.tx * da + F.nx * db, y + F.ty * da + F.ny * db]; };

// ------------------------------------------------------------------------------------------------
// Glyph fragments (digested language) — stroke sets in a ~16x16 box centred on 0,0. No real text.
// ------------------------------------------------------------------------------------------------
const GLYPHS = [
  'M-6,-5H5M-2,-5C-3,1-5,4-7,6M3,-1L6,5', 'M-5,-6V2C-5,6,0,7,5,4M1,-6L4,-2', 'M-6,0C-2,-6,2,-6,6,0M-3,4h1M3,3L5,7',
  'M-6,-6L-2,6M-4,0H5M4,-6V3', 'M-5,-4C0,-8,6,-2,0,1C-5,4,0,8,6,5', 'M-6,-3H2L-1,2H6M0,-7V-4M2,3L3,7',
  'M-6,4C-6,-4,6,-4,6,4M0,-6V1M-3,7H2', 'M-6,-5L6,-2M-4,1L5,4M-1,-7L-3,7', 'M-5,-5h1M0,-2C4,-2,6,2,4,6M-6,6H0',
  'M-6,0H-1M2,-6C6,-2,6,4,1,6M-4,-5L-2,5', 'M-4,-7C-7,-2-2,2-6,7M0,-3H6M3,-3C3,2,5,5,6,7', 'M-6,6C-4,0-1,-4,5,-6M-2,2L4,5M-5,-4h1',
];

// Tiny memory vignettes inside shards (unit box ~[-10,10]): childhood, home, tree, wedding arch, cake, first kiss
const VIGNETTES = [
  'M-6,-7a2.6,2.6 0 1 1 0.1,0zM-8.5,-4h5l1,9h-2l-1,5h-1.6l-0.4-5h-1l-0.4,5h-1.6l-1-5h-2zM4.5,0a2,2 0 1 1 0.1,0zM3,2h3.2l0.8,5h-1.2l-0.4,3h-1.6l-0.4-3h-1.2z',
  'M-9,1L0,-8L9,1H7V9H-7V1ZM-2,9V4H2V9Z',
  'M-1,9V-1C-6,-1-9,-4-8,-7C-7,-10-2,-10,0,-8C3,-11,9,-9,8,-5C8,-2,4,-1,1,-1V9Z',
  'M-9,-3C-7,-9,7,-9,9,-3ZM-4,0a2,2 0 1 1 0.1,0zM-5.5,2h3l0.6,7h-4.2zM4,0a2,2 0 1 1 0.1,0zM2.5,2h3l0.6,7h-4.2z',
  'M-8,9V2H8V9ZM-6,2V-2H6V2ZM-0.6,-2V-6H0.6V-2Z',
  'M-4,-6a2.4,2.4 0 1 1 0.1,0zM3,-6a2.4,2.4 0 1 1 0.1,0zM-6,-3h4l1,12h-6zM1,-3h4l1,12h-6z',
];

// child silhouette reaching up (calling for its mother)
const CHILD = 'M0,-11a3.6,3.6 0 1 1 0.1,0zM-3.6,-6.2C-5,-6-6.6,-9-8.6,-12.4L-10,-11.6C-8.6,-8.2-7.4,-4.6-5,-3.4L-4.6,2.6L-6.4,11.6H-3.6L-1.4,4.6H1.4L3.6,11.6H6.4L4.6,2.6L5,-2.6C6.2,-2,8,-1,9,2L10.4,1.2C9,-2.6,6.4,-5.6,3.6,-6.2Z';

// ------------------------------------------------------------------------------------------------
// Phase palettes
// ------------------------------------------------------------------------------------------------
const PHASE = {
  1: {
    body: ['#2c3a78', '#151c4c', '#070a24'], shadow: '#03051a', hi: '#4152a2', rimHi: '#e8ddff', rimLo: '#6f86f0',
    belly: '#3e478c', bellyHi: '#8d97d8', pleat: '#141a4a', lidEdge: '#04061a', scar: '#9aa4e6',
    fin: ['#1c245c', '#7d80c4'], finVein: '#c9c0f2', antenna: '#ece4ff', antennaDim: '#a49cd0',
    lure: '#d8fbff', lureGlow: '#5ed7ff', shardA: '#f4f0ff', shardB: '#8a9ae8', shardEdge: '#ffb38a',
    sclera: ['#33296e', '#140f3c'], iris: ['#ffe2b8', '#d98a6a', '#7a52c8', '#3a2c9c', '#18125a', '#080620'],
    arms: ['#ff9ad0', '#7fd0ff', '#ffcf9a'], pupil: '#04030c', limbus: '#ffd091', lid: ['#33438e', '#121946'], glyph: '#e4f8ff', glyph2: '#ffd091', aura: '#5246c8',
    mem: ['#f6e2c4', '#d99a7a', '#7a4a64'], vig: '#3a1d36', mote: '#e8ddff',
  },
  2: {
    body: ['#22327a', '#0f1748', '#04071e'], shadow: '#020414', hi: '#3550b0', rimHi: '#d6e8ff', rimLo: '#3f8cff',
    belly: '#2e3a80', bellyHi: '#6a7cd0', pleat: '#0d1444', lidEdge: '#020414', scar: '#7fa6ff',
    fin: ['#18225e', '#5e74c4'], finVein: '#8fc4ff', antenna: '#ddd4f6', antennaDim: '#948cc0',
    lure: '#e2fcff', lureGlow: '#3fb4ff', shardA: '#f6eeff', shardB: '#7466d0', shardEdge: '#ffb38a',
    sclera: ['#5a2470', '#200a36'], iris: ['#fff0f4', '#ff9ab8', '#ff5fae', '#8a2fc0', '#2c0f6a', '#0a0420'],
    arms: ['#ffd0f0', '#5ec8ff', '#ffb38a'], pupil: '#04030c', limbus: '#ff9ab0', lid: ['#2c3c8a', '#0e1442'], glyph: '#e2f6ff', glyph2: '#ffcf8a', aura: '#2f5ae0',
    mem: ['#f6e2c4', '#d99a7a', '#7a4a64'], vig: '#3a1d36', mote: '#bfe8ff',
  },
  3: {
    body: ['#f2f1fb', '#bcbddf', '#7f82b4'], shadow: '#56598c', hi: '#ffffff', rimHi: '#ffffff', rimLo: '#cfc8f6',
    belly: '#d2d2ec', bellyHi: '#ffffff', pleat: '#9a9cc6', lidEdge: '#5a5d8c', scar: '#ffffff',
    fin: ['#a3a6d0', '#f2f0fc'], finVein: '#ffffff', antenna: '#ffffff', antennaDim: '#d6d2ee',
    lure: '#ffffff', lureGlow: '#d8d0ff', shardA: '#ffffff', shardB: '#d2cdf0', shardEdge: '#f6f2ff',
    sclera: ['#b4b1da', '#8e8bbe'], iris: ['#ffffff', '#f4f0ff', '#d6d0f4', '#aba5d6', '#8d88bd', '#77729f'],
    arms: ['#ffffff', '#e6e0ff', '#ffffff'], pupil: '#3a3768', limbus: '#ffffff', lid: ['#dcdcf2', '#a7aad2'], glyph: '#ffffff', glyph2: '#f4f0ff', aura: '#d6ccff',
    mem: ['#ffffff', '#e8e4f8', '#b4b0d6'], vig: '#8d89b4', mote: '#ffffff',
  },
};

// ------------------------------------------------------------------------------------------------
export function dreamEater(phase) {
  const p = `de${phase}`;
  const C = PHASE[phase];
  SHARD_UID = 0;
  const R = rng(9100 + phase * 7);
  const RS = rng(4243); // shared shard layout across phases (same creature)
  const defs = [];
  const back = [], body = [], front = [], top = [];

  // filters: small glow, wide glow (2 total)
  defs.push(blur(`${p}-gs`, 4, 60));
  defs.push(blur(`${p}-gl`, 12, 60));
  defs.push(linear(`${p}-body`, [[0, C.body[0]], [0.42, C.body[1]], [1, C.body[2]]], 'x1="0.1" y1="0.1" x2="0.9" y2="0.9"'));
  defs.push(linear(`${p}-shard`, [[0, C.shardA, phase === 3 ? 0.85 : 0.6], [0.45, C.shardB, phase === 3 ? 0.4 : 0.16], [1, C.shardB, 0.02]], 'x1="0" y1="0" x2="1" y2="1"'));
  defs.push(radial(`${p}-mem`, [[0, C.mem[0], 0.95], [0.6, C.mem[1], 0.75], [1, C.mem[2], 0.4]]));
  defs.push(linear(`${p}-depth`, [[0, C.shadow, 0], [0.45, C.shadow, 0], [1, C.shadow, phase === 3 ? 0.35 : 0.7]], 'x1="0.2" y1="0.2" x2="0.85" y2="0.95"'));
  defs.push(linear(`${p}-fin`, [[0, C.fin[0]], [0.4, C.fin[0]], [1, C.fin[1]]], 'x1="1" y1="0" x2="0.2" y2="1"'));
  defs.push(linear(`${p}-fluke`, [[0, C.body[1]], [0.6, C.body[2]], [1, C.fin[1], 0.85]], 'x1="0.2" y1="0" x2="0.9" y2="1"'));
  defs.push(radial(`${p}-lure`, [[0, '#ffffff'], [0.16, C.lure], [0.4, C.lureGlow, 0.42], [1, C.lureGlow, 0]]));
  defs.push(radial(`${p}-aura`, [[0, C.aura, phase === 3 ? 0.3 : 0.22], [0.6, C.aura, 0.06], [1, C.aura, 0]]));
  defs.push(radial(`${p}-orb`, [[0, '#fff6e2'], [0.45, '#ffcf96'], [0.8, '#ffb38a', 0.85], [1, '#ff8a6a', 0]]));
  defs.push(linear(`${p}-membrane`, [[0, C.fin[1], 0.05], [1, C.finVein, 0.4]], 'x1="0" y1="0" x2="1" y2="0.3"'));
  defs.push(linear(`${p}-vane`, [[0, C.antenna, 0.42], [1, C.antenna, 0.1]], 'x1="0" y1="1" x2="0" y2="0"'));
  // warm film grain used as the paint of the shard edges (no filter needed)
  const RG = rng(31);
  let grain = '';
  const grainCols = ['#ffb38a', '#ffd091', '#fff1d6', '#ff8a6a'];
  for (let i = 0; i < 14; i++) grain += `<circle cx="${f(RG.range(0, 12))}" cy="${f(RG.range(0, 12))}" r="${f(RG.range(0.4, 1.1))}" fill="${phase === 3 ? '#ffffff' : grainCols[i % 4]}" opacity="${f(RG.range(0.4, 1), 2)}"/>`;
  defs.push(`<pattern id="${p}-grain" width="12" height="12" patternUnits="userSpaceOnUse">${grain}</pattern>`);

  const bodyD = shape(bodyOutline(), true, 0);
  const BD = `${p}-bd`;
  const use = (attrs) => `<use href="#${BD}" ${attrs}/>`;
  defs.push(`<path id="${BD}" d="${bodyD}"/>`);
  defs.push(`<clipPath id="${p}-clip">${use('')}</clipPath>`);
  // cel bands: highlight = body minus body shifted away from the light; shadow = minus shifted toward it
  defs.push(`<mask id="${p}-mh">${use('fill="#fff"')}${use('transform="translate(10 14)" fill="#000"')}</mask>`);
  defs.push(`<mask id="${p}-ms">${use('fill="#fff"')}${use('transform="translate(-30 -40)" fill="#000"')}</mask>`);
  defs.push(`<mask id="${p}-mr">${use('fill="#fff"')}${use('transform="translate(-4 -5)" fill="#000"')}</mask>`);

  back.push(`<ellipse cx="520" cy="560" rx="470" ry="420" fill="url(#${p}-aura)"/>`);
  const seal = phase === 3 ? sealRings(p) : null;
  if (seal) back.push(seal.back);

  // antennae: rooted on the crown behind the eye — the near one arcs up and back over the body,
  // the far one reaches forward into the dark above the face
  const a0 = at(0.215, 0.97), b0 = at(0.235, 0.99);
  const antA = [a0, [a0[0] + 22, a0[1] - 104], [a0[0] + 80, a0[1] - 196], [a0[0] + 164, a0[1] - 260], [a0[0] + 254, a0[1] - 290], [a0[0] + 318, a0[1] - 282]];
  const antB = [b0, [b0[0] - 18, b0[1] - 82], [b0[0] - 56, b0[1] - 160], [b0[0] - 112, b0[1] - 214], [b0[0] - 166, b0[1] - 230], [b0[0] - 196, b0[1] - 212]];
  back.push(antenna(p, antB, C, true));
  back.push(fluke(p, C, phase));

  body.push(use(`fill="url(#${p}-body)"`));
  const bel = belly(p, C);
  body.push(`<g clip-path="url(#${p}-clip)">${bel.band}<rect width="1000" height="1000" fill="url(#${p}-depth)"/></g>`);
  body.push(use(`fill="${C.shadow}" opacity="${phase === 3 ? 0.5 : 0.72}" mask="url(#${p}-ms)"`));
  body.push(`<g clip-path="url(#${p}-clip)">${bel.lines}${skin(p, C, phase)}</g>`);
  const sheen = [];
  for (let i = 0; i <= 8; i++) { const t = 0.03 + i / 8 * 0.6; sheen.push(SP.at(t, 0.62 - Math.sin(i / 8 * Math.PI) * 0.06)); }
  body.push(`<g clip-path="url(#${p}-clip)"><path d="${shape(sheen, false, 0)}" fill="none" stroke="${C.hi}" stroke-width="64" stroke-linecap="round" opacity="${phase === 3 ? 0.7 : 0.4}" filter="url(#${p}-gl)"/></g>`);
  body.push(use(`fill="${C.hi}" opacity=".9" mask="url(#${p}-mh)"`));
  body.push(use(`fill="${C.rimLo}" opacity="${phase === 3 ? 0.9 : 0.8}" mask="url(#${p}-mr)"`));

  body.push(photophores(p, C, phase));
  const shards = layoutShards(RS);
  if (phase === 2) body.push(brokenArmour(p, C, shards, R));
  else body.push(drawShards(p, C, shards, phase));

  front.push(mouth(p, C, phase));
  front.push(eye(p, C, phase, R, defs));
  front.push(pecFin(p, C, phase));
  front.push(lures(p, C, phase));
  front.push(antenna(p, antA, C, false));
  front.push(words(p, C, phase, R));
  front.push(phase === 2 ? fireflies(p, R) : motes(C, phase));
  if (seal) top.push(seal.front);
  top.push(childOrb(p, phase, antA[antA.length - 1]));

  const label = ['', '食梦兽·阿涅摩伊（完整形态）', '食梦兽·阿涅摩伊（破甲形态）', '食梦兽·阿涅摩伊（封印形态）'][phase];
  let creature = back.join('') + body.join('') + front.join('');
  if (phase === 3) {
    // colours draining: the tail end dissolves into moonlight
    defs.push(linear(`${p}-fade`, [[0, '#fff'], [0.55, '#fff'], [1, '#fff', 0.45]], 'x1="0.2" y1="0.2" x2="0.95" y2="0.95"'));
    defs.push(`<mask id="${p}-dissolve" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000"><rect width="1000" height="1000" fill="url(#${p}-fade)"/></mask>`);
    creature = `<g mask="url(#${p}-dissolve)">${creature}</g>`;
  }
  creature += top.join('');
  return svgDoc(1000, 1000, label, defs.join(''), creature);
}

// ------------------------------------------------------------------------------------------------
function belly(p, C) {
  // pale rorqual throat running from the chin back along the belly; long pleats converge at the chin
  const topV = (t) => (t < MOUTH_END ? mouthV(t) - 0.08 : Math.min(-0.5, mouthV(MOUTH_END) - 0.08 + (t - MOUTH_END) * 1.4));
  const up = [], lo = [];
  const T1 = 0.7;
  for (let i = 0; i <= 18; i++) {
    const t = 0.01 + i / 18 * (T1 - 0.01);
    up.push(SP.at(t, Math.max(-1.02, topV(t))));
    lo.push(SP.at(t, -1.2));
  }
  const band = `<path d="${shape([...up, ...lo.reverse()], true, 0)}" fill="${C.belly}"/>`;
  let pl = '';
  const NP = 11;
  for (let k = 0; k < NP; k++) {
    const pts = [];
    const t1 = 0.46 + (k / NP) * 0.22;
    for (let i = 0; i <= 6; i++) {
      const t = 0.03 + (t1 - 0.03) * i / 6;
      const lo2 = throat(t);
      const hi2 = Math.max(lo2, topV(t) - 0.04);
      const u = (k + 0.5) / NP;
      pts.push(SP.at(t, hi2 + (lo2 - hi2) * u * (0.5 + 0.5 * Math.min(1, t / 0.12))));
    }
    pl += shape(pts, false, 0);
  }
  return { band, lines: `<g fill="none"><use href="#${p}-pl" transform="translate(-2 -3)" stroke="${C.bellyHi}" stroke-width="2" opacity=".55"/><g stroke="${C.pleat}" stroke-width="2.8" opacity=".9"><path id="${p}-pl" d="${pl}"/></g></g>` };
}

// whale skin: moon-crater scars, humpback tubercles on the rostrum, long flank streaks
function skin(p, C, phase) {
  const R = rng(808);
  let scars = '';
  for (let i = 0; i < 22; i++) {
    const t = R.range(0.3, 0.97), v = R.range(-0.3, 0.9);
    const [x, y] = SP.at(t, v);
    if (Math.hypot(x - EYE.x, y - EYE.y) < EYE.r + 60) continue;
    const r = R.range(3, 9) * (1.1 - t * 0.5);
    R(); // keep the layout stream stable
    scars += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(r, 0)}"/>`;
  }
  let tub = '', tubHi = '';
  for (let i = 0; i < 9; i++) {
    const t = 0.012 + i * 0.022, v = 0.78 - Math.abs(i - 4) * 0.02 + (i % 2) * 0.1;
    const [x, y] = SP.at(t, v);
    if (Math.hypot(x - EYE.x, y - EYE.y) < EYE.r + 24) continue;
    const r = 5.5 + (i % 3);
    tub += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(r)}"/>`;
    tubHi += `M${P(x - r * 0.8, y, 0)}a${f(r * 0.8)},${f(r * 0.8)} 0 0 1 ${f(r * 0.9)},${f(-r * 0.75)}`;
  }
  let streak = '';
  for (const [v, t0, t1] of [[0.66, 0.3, 0.9], [0.44, 0.36, 0.97], [0.2, 0.46, 0.94], [-0.1, 0.5, 0.86]]) {
    const pts = [];
    for (let i = 0; i <= 8; i++) pts.push(SP.at(t0 + (t1 - t0) * i / 8, v + Math.sin(i * 1.3) * 0.03));
    streak += shape(pts, false, 0);
  }
  const bh = [at(0.272, 0.9), at(0.3, 0.86), at(0.328, 0.9)];
  const bh2 = [at(0.276, 0.83), at(0.3, 0.79), at(0.324, 0.83)];
  const blow = `<path d="M${P(...bh[0], 0)}Q${P(...bh[1], 0)} ${P(...bh[2], 0)}M${P(...bh2[0], 0)}Q${P(...bh2[1], 0)} ${P(...bh2[2], 0)}" fill="none" stroke="${C.lidEdge}" stroke-width="3.4" stroke-linecap="round" opacity=".75"/>`
    + `<path d="M${P(bh[0][0] - 3, bh[0][1] - 4, 0)}Q${P(bh[1][0] - 3, bh[1][1] - 8, 0)} ${P(bh[2][0] - 3, bh[2][1] - 4, 0)}" fill="none" stroke="${C.rimHi}" stroke-width="1.8" stroke-linecap="round" opacity=".55"/>`;
  return blow + `<path d="${streak}" fill="none" stroke="${C.hi}" stroke-width="2.6" stroke-linecap="round" opacity=".4"/>`
    + `<g fill="none" stroke="${C.scar}" stroke-width="2" opacity="${phase === 3 ? 0.5 : 0.32}">${scars}</g>`
    + `<g fill="${C.body[2]}" opacity=".55">${tub}</g><path d="${tubHi}" fill="none" stroke="${C.rimHi}" stroke-width="2" stroke-linecap="round" opacity=".55"/>`;
}

// ------------------------------------------------------------------------------------------------
function layoutShards(R) {
  const out = [];
  const ok = (x, y, t, v) => {
    if (Math.hypot(x - EYE.x, y - EYE.y) < EYE.r + 70) return false;
    if (t < 0.6 && v < -0.05) return false;
    if (t < 0.3) return false;
    return true;
  };
  const push = (t, v, scale, kind) => {
    const F = SP(t);
    const [x, y] = SP.at(t, v);
    if (kind !== 'crest' && !ok(x, y, t, v)) return false;
    const w = (F.wu + F.wl) * 0.5;
    const L = Math.max(22, Math.min(82, w * 0.46)) * scale;
    for (const o of out) if (Math.hypot(o.x - x, o.y - y) < (o.L + L) * (kind === 'crest' ? 0.2 : 0.32)) return false;
    const crest = kind === 'crest';
    const W = L * (crest ? R.range(0.3, 0.4) : R.range(0.3, 0.44));
    const tang = Math.atan2(F.ty, F.tx) * 180 / Math.PI;
    const ang = crest ? tang - 20 + R.range(-6, 6) : tang + R.range(-22, 22);
    const kind2 = R();
    const pts = kind2 < 0.35
      ? [[-0.6, R.range(-0.1, 0.1)], [R.range(-0.1, 0.2), 0.3 + R.range(0, 0.1)], [0.7 + R.range(0, 0.2), R.range(-0.05, 0.1)], [R.range(0, 0.3), -0.22 - R.range(0, 0.1)]]
      : kind2 < 0.65
        ? [[-0.5, 0.4], [0.62, R.range(0.1, 0.4)], [R.range(-0.1, 0.3), -0.5]]
        : [[-0.55, R.range(-0.08, 0.08)], [R.range(-0.16, 0.12), 0.42 + R.range(0, 0.12)], [0.62 + R.range(0, 0.16), R.range(-0.14, 0.14)], [R.range(-0.05, 0.2), -0.42 - R.range(0, 0.12)]];
    if (kind2 >= 0.65 && R() < 0.4) pts.splice(2, 0, [0.36, 0.34]);
    const lit = Math.max(0.25, Math.min(1, 0.8 + v * 0.25 - (t - 0.4) * 0.9));
    out.push({ x, y, t, v, L, W, ang, pts, lit, vig: !crest && R() < 0.3 ? R.int(0, VIGNETTES.length - 1) : -1, crest });
    return true;
  };
  // dorsal crest: a mane of glass slivers standing out of the back line, raked toward the tail
  for (let t = 0.31, i = 0; t < 0.95; t += 0.028, i++) push(t, i % 2 ? 0.98 : 0.92, (0.45 + 0.5 * Math.exp(-(((t - 0.46) / 0.17) ** 2))) * (i % 2 ? 0.8 : 1), 'crest');
  // flank shards in loose overlapping drifts, leaving smooth hide between them
  const clusters = [[0.36, 0.62, 5], [0.45, 0.3, 6], [0.52, 0.7, 5], [0.6, 0.18, 5], [0.68, 0.6, 5], [0.76, 0.12, 4], [0.84, 0.5, 4], [0.9, -0.2, 3], [0.95, 0.3, 3]];
  for (const [ct, cv, n] of clusters) {
    let placed = 0;
    for (let i = 0; i < 200 && placed < n; i++) {
      if (push(ct + R.range(-0.035, 0.035), cv + R.range(-0.28, 0.28), R.range(0.72, 1.08), 'flank')) placed++;
    }
  }
  out.sort((a, b) => (a.crest - b.crest) || (b.t - a.t));
  return out;
}

function shardPath(s, scale = 1) {
  const a = s.ang * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
  return 'M' + s.pts.map(([u, w]) => {
    const lx = u * s.L * scale, ly = w * s.W * scale * 2;
    return P(s.x + lx * c - ly * sn, s.y + lx * sn + ly * c, 0);
  }).join('L') + 'Z';
}

let SHARD_UID = 0;
function drawShards(p, C, shards, phase) {
  // every shard outline is written once; fill, film-grain edge and fine edge are <use> copies
  const id = `${p}-sh${SHARD_UID++}`;
  const buckets = [[], [], [], []];
  let vigBg = '', vig = '', hi = '';
  for (const s of shards) {
    const d = shardPath(s);
    if (s.vig >= 0 && s.L > 32) {
      vigBg += d;
      const flip = s.ang > 90 || s.ang < -90 ? 180 : 0;
      vig += `<path d="${VIGNETTES[s.vig]}" transform="translate(${f(s.x, 0)} ${f(s.y, 0)}) rotate(${f(s.ang - flip, 0)}) scale(${f(s.L / 36, 2)})"/>`;
    } else {
      buckets[Math.min(3, Math.floor(s.lit * 4))].push(d);
    }
    const a = s.ang * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
    const q = (u, w) => [s.x + u * s.L * c - w * s.W * 2 * sn, s.y + u * s.L * sn + w * s.W * 2 * c];
    const p0 = q(s.pts[0][0] + 0.12, s.pts[0][1] + 0.05), p1 = q(s.pts[1][0] - 0.02, s.pts[1][1] - 0.1);
    hi += `M${P(p0[0], p0[1], 0)}L${P(p1[0], p1[1], 0)}`;
  }
  const op = (k) => f(phase === 3 ? 0.6 + k * 0.12 : 0.42 + k * 0.16, 2);
  const g = buckets.map((b, k) => (b.length ? `<path d="${b.join('')}" opacity="${op(k)}"/>` : '')).join('');
  // (referenced elements carry no paint of their own, so each <use> copy can repaint them)
  return `<g fill="url(#${p}-shard)"><g id="${id}">${g}</g></g>`
    + (vigBg ? `<g fill="url(#${p}-mem)" opacity=".8"><path id="${id}v" d="${vigBg}"/></g><g fill="${C.vig}" opacity=".62">${vig}</g>` : '')
    + `<g fill="none" stroke-linejoin="round"><use href="#${id}" stroke="url(#${p}-grain)" stroke-width="5"/>${vigBg ? `<use href="#${id}v" stroke="url(#${p}-grain)" stroke-width="5"/>` : ''}`
    + `<use href="#${id}" stroke="${C.shardEdge}" stroke-width="1.1" opacity="${phase === 3 ? 0.8 : 0.65}"/>${vigBg ? `<use href="#${id}v" stroke="${C.shardEdge}" stroke-width="1.2"/>` : ''}</g>`
    + `<path d="${hi}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
}

// ------------------------------------------------------------------------------------------------
function brokenArmour(p, C, shards, R) {
  // ~40% of shards remain (cracked, knocked askew); the rest leave raw sockets glowing abyss-blue
  const kept = [], gone = [];
  for (const s of shards) (R() < 0.4 ? kept : gone).push(s);
  let sockets = '';
  for (const s of gone) sockets += shardPath(s, 0.82);
  let out = `<g clip-path="url(#${p}-clip)"><use href="#${p}-sock" fill="#2f7dff" stroke="#2f7dff" stroke-width="8" opacity=".6" filter="url(#${p}-gs)"/>`
    + `<g fill="#1c4ec8" stroke="#7fd6ff" stroke-width="1.8"><path id="${p}-sock" d="${sockets}"/></g><use href="#${p}-sock" fill="#8fdcff" transform="translate(2 3)" opacity=".3"/></g>`;
  // fracture web across the hide: a few long faults running with the body, each splitting into
  // finer branches; abyss light seeps through
  let cracks = '', fine = '';
  const faults = [[0.34, 0.7, 0.2], [0.42, -0.2, 0.22], [0.5, 0.5, 0.2], [0.6, -0.4, 0.18], [0.66, 0.75, 0.16], [0.74, 0.1, 0.16], [0.84, -0.3, 0.12], [0.88, 0.55, 0.1], [0.26, -0.6, 0.12]];
  for (const [t0, v0, len] of faults) {
    const pts = [];
    let v = v0;
    for (let k = 0; k <= 7; k++) {
      const t = Math.min(0.985, t0 + len * k / 7);
      v = Math.max(-0.92, Math.min(0.95, v + R.range(-0.12, 0.12)));
      const q = SP.at(t, v);
      if (Math.hypot(q[0] - EYE.x, q[1] - EYE.y) < EYE.r + 40) break;
      pts.push(q);
    }
    if (pts.length < 3) continue;
    cracks += line(pts, 0);
    for (let k = 1; k < pts.length - 1; k += 2) {
      const [x, y] = pts[k];
      const a = R.range(0, Math.PI * 2), L = R.range(18, 40);
      const m = [x + Math.cos(a) * L * 0.5 + R.range(-5, 5), y + Math.sin(a) * L * 0.5 + R.range(-5, 5)];
      fine += `M${P(x, y, 0)}L${P(m[0], m[1], 0)}L${P(x + Math.cos(a + 0.3) * L, y + Math.sin(a + 0.3) * L, 0)}`;
    }
  }
  cracks += fine;
  out += `<g clip-path="url(#${p}-clip)" fill="none" stroke-linejoin="bevel"><use href="#${p}-crk" stroke="#3f9cff" stroke-width="24" filter="url(#${p}-gl)"/>`
    + `<use href="#${p}-crk" stroke="#5ec8ff" stroke-width="5.5"/><g stroke="#eaf8ff" stroke-width="1.3"><path id="${p}-crk" d="${cracks}"/></g></g>`;
  for (const s of kept) if (R() < 0.35) { s.ang += R.range(-30, 30); s.x += R.range(-10, 10); s.y += R.range(-8, 8); }
  out += drawShards(p, C, kept, 2);
  let crk = '';
  for (const s of kept) {
    if (R() < 0.55) {
      const a = R.range(0, Math.PI * 2);
      crk += `M${P(s.x, s.y, 0)}l${f(Math.cos(a) * s.L * 0.42, 0)},${f(Math.sin(a) * s.L * 0.42, 0)}M${P(s.x, s.y, 0)}l${f(-Math.cos(a + 0.6) * s.L * 0.3, 0)},${f(-Math.sin(a + 0.6) * s.L * 0.3, 0)}`;
    }
  }
  out += `<path d="${crk}" stroke="#ffffff" stroke-width="1.3" opacity=".85"/>`;
  // shards breaking away from the back, tumbling up and out
  let loose = '';
  for (let i = 0; i < 18; i++) {
    const t = R.range(0.3, 0.95);
    const [x, y] = SP.at(t, 1);
    const F = SP(t);
    const dist = R.range(30, 150);
    const s = { x: Math.min(960, x + F.nx * dist + R.range(-20, 20)), y: Math.max(40, y + F.ny * dist - R.range(0, 30)), L: R.range(14, 34), W: 0, ang: R.range(0, 360), pts: [[-0.6, 0], [0.1, 0.32], [0.7, 0.04], [0.05, -0.26]] };
    s.W = s.L * 0.5;
    loose += `<path d="${shardPath(s)}" opacity="${f(R.range(0.6, 1), 2)}"/>`;
  }
  return out + `<g fill="url(#${p}-shard)" stroke="${C.shardEdge}" stroke-width="1.2" stroke-linejoin="round">${loose}</g>`;
}

// photophores: a lateral line and a row under the jaw (deep-sea)
function photophores(p, C, phase) {
  let dots = '';
  const add = (x, y, r) => { dots += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(r)}"/>`; };
  for (let t = 0.36; t < 0.97; t += 0.026) { const [x, y] = SP.at(t, -0.3 + Math.sin(t * 9) * 0.05); add(x, y, 2.2 + (1 - t) * 1.8); }
  for (let t = 0.06; t < 0.34; t += 0.03) { const [x, y] = SP.at(t, throat(t) + 0.1); add(x, y, 2.6); }
  return `<use href="#${p}-ph" fill="${C.lureGlow}" stroke="${C.lureGlow}" stroke-width="7" opacity="${phase === 3 ? 0.3 : 0.55}" filter="url(#${p}-gs)"/><g id="${p}-ph" opacity="${phase === 2 ? 0.6 : 0.9}"><g fill="${C.lure}">${dots}</g></g>`;
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

function antenna(p, ctrl, C, far) {
  // bipectinate moth antenna: a hair-fine shaft, many curved barbs, a dusty translucent vane
  const col = far ? C.antennaDim : C.antenna;
  const N = far ? 40 : 52;
  const pts = [];
  for (let i = 0; i <= N; i++) pts.push(crPoint(ctrl, i / N));
  const vaneL = [], vaneR = [];
  let barbs = '';
  for (let i = 2; i < N; i++) {
    const [x, y] = pts[i];
    const [x2, y2] = pts[i + 1];
    let tx = x2 - x, ty = y2 - y;
    const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
    const t = i / N;
    const len = (far ? 20 : 26) * Math.sin(Math.PI * Math.min(1, t * 1.05 + 0.04)) ** 0.8 + 2.5;
    const ca = 0.55;
    // barbs sweep toward the tip and curl slightly
    const lx = x + (-ty * Math.cos(ca) + tx * Math.sin(ca)) * len, ly = y + (tx * Math.cos(ca) + ty * Math.sin(ca)) * len;
    const rx = x + (ty * Math.cos(ca) + tx * Math.sin(ca)) * len, ry = y + (-tx * Math.cos(ca) + ty * Math.sin(ca)) * len;
    const mlx = (x + lx) / 2 + tx * len * 0.12, mly = (y + ly) / 2 + ty * len * 0.12;
    const mrx = (x + rx) / 2 + tx * len * 0.12, mry = (y + ry) / 2 + ty * len * 0.12;
    const X = Math.round(x), Y = Math.round(y), rel = (a, b) => `${f(a - X, 0)},${f(b - Y, 0)}`;
    barbs += `M${X},${Y}q${rel(mlx, mly)} ${rel(lx, ly)}M${X},${Y}q${rel(mrx, mry)} ${rel(rx, ry)}`;
    vaneL.push([lx, ly]); vaneR.push([rx, ry]);
  }
  const vane = shape([pts[1], ...vaneL.filter((_, i) => i % 2 === 0), pts[N], ...vaneR.filter((_, i) => i % 2 === 0).reverse()], true, 0);
  const shaft = shape(pts.filter((_, i) => i % 4 === 0 || i === N), false, 0);
  // dust motes shaken from the vane
  const RD = rng(far ? 61 : 67);
  let dust = '';
  for (let i = 0; i < (far ? 8 : 16); i++) {
    const q = pts[RD.int(4, N - 2)];
    dust += `<circle cx="${f(q[0] + RD.range(-40, 40), 0)}" cy="${f(q[1] + RD.range(-30, 50), 0)}" r="${f(RD.range(0.7, 1.8))}"/>`;
  }
  return `<g opacity="${far ? 0.85 : 1}"><path d="${vane}" fill="url(#${p}-vane)"/>`
    + `<path d="${barbs}" fill="none" stroke="${col}" stroke-width="${far ? 1.1 : 1.35}" stroke-linecap="round" opacity=".9"/>`
    + `<path d="${shaft}" fill="none" stroke="${C.body[2]}" stroke-width="${far ? 3.4 : 4.2}" stroke-linecap="round"/>`
    + `<path d="${shaft}" fill="none" stroke="${far ? col : C.rimHi}" stroke-width="${far ? 1.7 : 2.2}" stroke-linecap="round"/>`
    + `<g fill="${col}" opacity=".6">${dust}</g></g>`;
}

// ------------------------------------------------------------------------------------------------
function lures(p, C, phase) {
  // deep-sea esca: stalks from the brow arch forward and let their lights hang before the mouth
  // an illicium arching off the brow, and one luminous dragonfish barbel hanging from the chin
  const L = [
    { base: at(0.06, 0.98), c1: [-6, -110], c2: [-70, -150], tip: [-76, -86], r: 15 },
    { base: snoutPt([24, -46]), c1: [-34, 50], c2: [0, 120], tip: [16, 176], r: 11 },
  ];
  let s = '';
  for (const [i, l] of L.entries()) {
    const [bx, by] = l.base;
    const c1 = [bx + l.c1[0], by + l.c1[1]], c2 = [bx + l.c2[0], by + l.c2[1]], tip = [bx + l.tip[0], by + l.tip[1]];
    const d = `M${P(bx, by, 0)}C${P(c1[0], c1[1], 0)} ${P(c2[0], c2[1], 0)} ${P(tip[0], tip[1], 0)}`;
    s += `<path d="${d}" fill="none" stroke="${C.body[1]}" stroke-width="${i === 0 ? 6 : 4.5}" stroke-linecap="round"/>`;
    s += `<path d="${d}" fill="none" stroke="${C.rimHi}" stroke-width="1.6" stroke-linecap="round" opacity=".7" transform="translate(-1.5 -1.5)"/>`;
    const dim = phase === 3 ? 0.5 : phase === 2 && i === 1 ? 0.55 : 1;
    const cx = tip[0], cy = tip[1] + l.r * 0.9;
    s += `<circle cx="${f(cx, 0)}" cy="${f(cy, 0)}" r="${f(l.r * 5)}" fill="url(#${p}-lure)" opacity="${dim}"/>`;
    // translucent bell with a hot core and trailing filaments
    s += `<path d="M${P(cx - l.r, cy, 0)}a${l.r},${l.r} 0 1 1 ${l.r * 2},0c0,${f(l.r * 0.8)}-${f(l.r * 0.5)},${f(l.r * 1.1)}-${l.r},${f(l.r * 1.1)}s-${l.r},-${f(l.r * 0.3)}-${l.r},-${f(l.r * 1.1)}z" fill="${C.lure}" fill-opacity=".35" stroke="${C.lure}" stroke-width="1.6"/>`;
    s += `<circle cx="${f(cx, 0)}" cy="${f(cy + 1, 0)}" r="${f(l.r * 0.5)}" fill="#ffffff"/>`;
    s += `<path d="M${P(cx - l.r * 0.5, cy + l.r * 1.1, 0)}q-3,${l.r * 1.4} 4,${l.r * 2.6}M${P(cx + l.r * 0.4, cy + l.r * 1.1, 0)}q4,${l.r} 0,${l.r * 2}" fill="none" stroke="${C.lure}" stroke-width="1.2" opacity=".7"/>`;
  }
  return s;
}

// ------------------------------------------------------------------------------------------------
function eye(p, C, phase, R, defs) {
  // The eye is set INTO the skin: an almond aperture between heavy lids, ringed by old folds.
  // Local frame: x along the lid line (front corner at -x), y down; rotated so the rear corner droops.
  const r = EYE.r;
  const tilt = phase === 3 ? 13 : 9;
  // canthi + lid bulges (fractions of r). Upper-lid peak sits toward the FRONT corner: a lifted,
  // grieving lid line rather than a scowl. Phase 2 opens wide in pain; phase 3 sinks half-shut.
  const K = { 1: { hu: 0.34, hd: 0.6, f1: 1.55, f2: 0.78 }, 2: { hu: 0.92, hd: 0.72, f1: 1.3, f2: 1.05 }, 3: { hu: 0.1, hd: 0.5, f1: 1.6, f2: 0.5 } }[phase];
  const A = [-r * 0.98, -r * 0.08], B = [r * 0.98, r * 0.12];
  const lerp = (u) => [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u];
  const cub = (p0, c1, c2, p3, n = 14) => {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, v = 1 - u;
      out.push([v * v * v * p0[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p3[1]]);
    }
    return out;
  };
  const upE = (lift = 0) => { const a = lerp(0.26), b = lerp(0.74); return cub(A, [a[0], a[1] - (K.hu * r + lift) * K.f1], [b[0], b[1] - (K.hu * r + lift) * K.f2 - lift * 0.4], B); };
  const dnE = (drop = 0) => { const a = lerp(0.3), b = lerp(0.7); return cub(A, [a[0], a[1] + (K.hd * r + drop) * 1.25], [b[0], b[1] + (K.hd * r + drop) * 1.3], B); };
  const uE = upE(), dE = dnE();
  const aperture = shape([...uE, ...dE.slice(1, -1).reverse()], true, 0);
  const clip = `${p}-eyeclip`;
  defs.push(`<clipPath id="${clip}"><path d="${aperture}"/></clipPath>`);
  defs.push(radial(`${p}-sclera`, [[0, C.sclera[0]], [1, C.sclera[1]]], 'cx="0.4" cy="0.35" r="0.75"'));
  defs.push(radial(`${p}-iris`, [[0, C.iris[0]], [0.14, C.iris[1]], [0.36, C.iris[2]], [0.62, C.iris[3]], [0.86, C.iris[4]], [1, C.iris[5]]]));
  defs.push(radial(`${p}-socket`, [[0.45, C.shadow, phase === 3 ? 0.35 : 0.75], [1, C.shadow, 0]]));
  defs.push(radial(`${p}-eyeglow`, [[0.3, C.aura, 0.5], [1, C.aura, 0]]));
  const s = [];
  s.push(`<ellipse rx="${f(r * 1.9)}" ry="${f(r * 1.6)}" fill="url(#${p}-eyeglow)"/>`);
  s.push(`<ellipse cy="${f(r * 0.06)}" rx="${f(r * 1.42)}" ry="${f(r * 1.18)}" fill="url(#${p}-socket)"/>`);
  // brow bone catching the moon, then stacked crescent folds above the lid (moon phases)
  const crease = (lift, x0 = 0.04, x1 = 0.96) => shape(upE(lift).slice(Math.round(x0 * 14), Math.round(x1 * 14) + 1), false, 0);
  const band = (l0, l1, x0, x1) => { const a = upE(l0).slice(x0, x1 + 1), b = upE(l1).slice(x0, x1 + 1); return shape([...a, ...b.reverse()], true, 0); };
  s.push(`<path d="${band(66, 92, 2, 10)}" fill="${C.rimHi}" opacity="${phase === 3 ? 0.3 : 0.16}"/>`);
  s.push(`<path d="${band(0, 30, 0, 14)}" fill="${C.hi}" opacity=".75"/>`);
  s.push(`<path d="${band(6, 24, 1, 11)}" fill="${C.rimHi}" opacity="${phase === 3 ? 0.55 : 0.2}"/>`);
  s.push(`<path d="${crease(30)}" fill="none" stroke="${C.lidEdge}" stroke-width="3.6" stroke-linecap="round" opacity=".8"/>`);
  s.push(`<path d="${crease(48, 0.06, 0.62)}${crease(64, 0.1, 0.44)}${crease(58, 0.56, 0.9)}" fill="none" stroke="${C.lidEdge}" stroke-width="2.2" stroke-linecap="round" opacity=".5"/>`);
  s.push(`<path d="${crease(51, 0.08, 0.6)}${crease(67, 0.12, 0.42)}" fill="none" stroke="${C.hi}" stroke-width="1.6" stroke-linecap="round" opacity="${phase === 3 ? 0.45 : 0.7}"/>`);
  // lower lid roll and the bag of folds beneath it
  const dband = (l0, l1) => { const a = dnE(l0).slice(1, 14), b = dnE(l1).slice(1, 14); return shape([...a, ...b.reverse()], true, 0); };
  s.push(`<path d="${dband(0, 16)}" fill="${C.hi}" opacity=".55"/>`);
  s.push(`<path d="${shape(dnE(22).slice(2, 13), false, 0)}${shape(dnE(38).slice(3, 12), false, 0)}${shape(dnE(54).slice(5, 11), false, 0)}" fill="none" stroke="${C.lidEdge}" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>`);
  s.push(`<path d="${shape(dnE(25).slice(3, 12), false, 0)}${shape(dnE(41).slice(4, 11), false, 0)}" fill="none" stroke="${C.hi}" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>`);
  // crow's-feet at the drooping rear corner: very old skin
  let cf = '';
  for (let i = 0; i < 5; i++) {
    const a = -0.5 + i * 0.26;
    cf += `M${P(B[0] + 14, B[1] + i * 4 - 8, 0)}q${f(Math.cos(a) * 18, 0)},${f(Math.sin(a) * 18 - 4, 0)} ${f(Math.cos(a) * 36, 0)},${f(Math.sin(a) * 36, 0)}`;
    if (i > 0 && i < 4) cf += `M${P(A[0] - 12, A[1] + i * 6 - 12, 0)}q${f(-Math.cos(a) * 12, 0)},${f(Math.sin(a) * 10, 0)} ${f(-Math.cos(a) * 24, 0)},${f(Math.sin(a) * 22, 0)}`;
  }
  s.push(`<path d="${cf}" fill="none" stroke="${C.lidEdge}" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>`);
  // the ball itself, only seen through the aperture
  const ball = [];
  ball.push(`<rect x="${f(-r * 1.1)}" y="${f(-r * 1.1)}" width="${f(r * 2.2)}" height="${f(r * 2.2)}" fill="url(#${p}-sclera)"/>`);
  // the iris looks down-left, toward the party (world offset -> local, undo tilt)
  const look = phase === 3 ? [-6, 30] : phase === 2 ? [-4, 4] : [-6, 14];
  const la = -tilt * Math.PI / 180;
  const ix = look[0] * Math.cos(la) - look[1] * Math.sin(la), iy = look[0] * Math.sin(la) + look[1] * Math.cos(la);
  const ir = r * (phase === 2 ? 0.62 : 0.84);
  ball.push(`<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir + 6)}" fill="${C.iris[5]}" opacity=".9"/>`);
  ball.push(`<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir)}" fill="url(#${p}-iris)"/>`);
  // nebula: tapered spiral arms + dark dust lanes + scattered stars (a slow galaxy turning)
  const spiral = (k, w0, turns, r0, r1) => {
    const o = [], q = [];
    const n = 10;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const a = k + u * turns * Math.PI * 2;
      const rr = ir * (r0 + (r1 - r0) * u);
      const w = w0 * Math.sin(Math.PI * Math.min(1, u * 1.1)) * ir / 100;
      o.push([ix + Math.cos(a) * (rr + w), iy + Math.sin(a) * (rr + w)]);
      q.push([ix + Math.cos(a) * (rr - w), iy + Math.sin(a) * (rr - w)]);
    }
    return shape([...o, ...q.reverse()], true, 0);
  };
  for (let k = 0; k < 3; k++) ball.push(`<path d="${spiral(k * 2.094 + 0.4, 10 - k * 1.5, 0.75, 0.24, 0.96)}" fill="${C.arms[k]}" opacity="${phase === 3 ? 0.5 : phase === 2 ? 0.4 : 0.26}"/>`);
  let lanes = '';
  for (let k = 0; k < 3; k++) lanes += spiral(k * 2.094 + 1.45, 4.5, 0.62, 0.32, 0.92);
  ball.push(`<path d="${lanes}" fill="${C.iris[5]}" opacity="${phase === 3 ? 0.16 : 0.45}"/>`);
  let stars = '';
  for (let i = 0; i < 24; i++) {
    const a = R.range(0, Math.PI * 2), rr = ir * R.range(0.3, 0.92) ** 0.8;
    stars += `<circle cx="${f(ix + Math.cos(a) * rr, 0)}" cy="${f(iy + Math.sin(a) * rr, 0)}" r="${f(R.range(0.7, 2))}"/>`;
  }
  ball.push(`<g fill="#ffffff" opacity=".85">${stars}</g>`);
  ball.push(`<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(ir - 6)}" fill="none" stroke="${C.limbus}" stroke-width="1.6" opacity=".55"/>`);
  // pupil: an eclipsed moon with a thin corona
  const pr = ir * (phase === 2 ? 0.15 : phase === 3 ? 0.24 : 0.19);
  ball.push(`<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(pr * 1.7)}" fill="${C.iris[1]}" opacity=".22"/>`);
  ball.push(`<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(pr + 2.5)}" fill="none" stroke="${C.limbus}" stroke-width="1.6" opacity=".55"/>`);
  ball.push(`<circle cx="${f(ix)}" cy="${f(iy)}" r="${f(pr)}" fill="${C.pupil}"/>`);
  ball.push(`<path d="M${P(ix - pr * 0.96, iy + pr * 0.2)}A${f(pr)},${f(pr)} 0 0 1 ${P(ix + pr * 0.2, iy - pr * 0.96)}" fill="none" stroke="#fff6e8" stroke-width="2.6" stroke-linecap="round"/>`);
  if (phase === 2) {
    let v = '';
    for (let i = 0; i < 14; i++) {
      const a = R.range(0, Math.PI * 2);
      let px = Math.cos(a) * r, py = Math.sin(a) * r * 0.7;
      v += `M${P(px, py, 0)}`;
      for (let k = 0; k < 3; k++) { const aa = a + Math.PI + R.range(-0.7, 0.7); px += Math.cos(aa) * 10; py += Math.sin(aa) * 10; v += `L${P(px, py, 0)}`; }
    }
    ball.push(`<path d="${v}" fill="none" stroke="#e0407e" stroke-width="1.8" opacity=".8"/>`);
  }
  // shadow cast by the heavy upper lid onto the ball
  ball.push(`<path d="${shape([[-r * 1.1, -r * 1.2, 1], [r * 1.1, -r * 1.2, 1], ...uE.map(([x, y]) => [x, y + r * 0.22]).reverse()], true, 0)}" fill="${C.iris[5]}" opacity=".55"/>`);
  // wet cornea: broad window reflection, a sharp glint, a cool bounce light low on the far side
  const top0 = uE[4][1];
  const hy = top0 + r * 0.36;
  ball.push(`<path d="M${P(-r * 0.7, hy + r * 0.12)}C${P(-r * 0.66, hy - r * 0.08)} ${P(-r * 0.42, hy - r * 0.16)} ${P(-r * 0.26, hy - r * 0.13)}C${P(-r * 0.34, hy - r * 0.03)} ${P(-r * 0.52, hy + r * 0.04)} ${P(-r * 0.7, hy + r * 0.12)}Z" fill="#ffffff" opacity=".5"/>`);
  ball.push(`<circle cx="${f(-r * 0.5)}" cy="${f(hy + r * 0.2)}" r="${f(r * 0.04)}" fill="#ffffff"/>`);
  ball.push(`<path d="M${P(r * 0.12, dE[9][1] - r * 0.12)}Q${P(r * 0.45, dE[10][1] - r * 0.2)} ${P(r * 0.62, dE[11][1] - r * 0.34)}" fill="none" stroke="${C.lureGlow}" stroke-width="${f(r * 0.035)}" stroke-linecap="round" opacity=".5"/>`);
  // tear-film meniscus along the lower lid
  ball.push(`<path d="${shape(dE.slice(1, 14).map(([x, y]) => [x, y - 4]), false, 0)}" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity=".75"/>`);
  s.push(`<g clip-path="url(#${clip})">${ball.join('')}</g>`);
  // lash lines; the caruncle at the front corner keeps one warm, living note
  s.push(`<path d="${shape(uE, false, 0)}" fill="none" stroke="${C.lidEdge}" stroke-width="8" stroke-linecap="round"/>`);
  s.push(`<path d="${shape(dE, false, 0)}" fill="none" stroke="${C.lidEdge}" stroke-width="4" stroke-linecap="round"/>`);
  s.push(`<path d="${shape(dE.slice(1, 14).map(([x, y]) => [x, y + 5]), false, 0)}" fill="none" stroke="${C.rimHi}" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>`);
  s.push(`<ellipse cx="${f(A[0] + 8)}" cy="${f(A[1] + 3)}" rx="7" ry="4" fill="${phase === 3 ? '#efe6ff' : '#c87a8e'}" opacity=".55"/>`);
  // dusty moth lashes hanging from the upper lid
  let lash = '';
  for (let i = 5; i < uE.length - 1; i++) {
    const [x, y] = uE[i];
    const u = x / r;
    lash += `M${P(x, y - 4, 0)}q${f(4 + u * 4, 0)},-4 ${f(8 + u * 10, 0)},${f(-6 - u * 4, 0)}`;
  }
  s.push(`<path d="${lash}" fill="none" stroke="${C.antenna}" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>`);
  if (phase === 3) {
    // a moonlight tear welling at the drooping rear corner; the seal sigil pressed onto the lid
    const [tx, ty] = dE[11];
    s.push(`<path d="M${P(tx, ty + 4)}c-6,14-8,24-1,30c7-6,7-17,1-30z" fill="#ffffff" stroke="#9a9cc6" stroke-width="1"/>`);
    s.push(`<path d="M${P(tx - 1, ty + 38)}c-3,12-2,26,3,38" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity=".6"/>`);
    const [sx, sy] = upE(36)[6];
    s.push(`<g transform="translate(${f(sx)} ${f(sy)})" fill="none" stroke="#ffffff" stroke-linecap="round"><circle r="17" stroke-width="1.8" opacity=".9"/><circle r="11" stroke-width="1" stroke-dasharray="2.5 3" opacity=".8"/><path d="M-7,-6A9,9 0 1 0 7,-6A6,6 0 1 1 -7,-6Z" fill="#ffffff" stroke="none"/></g>`);
  }
  if (phase === 2) {
    // pain: hairline fractures radiating from the orbit, lit from inside
    let fr = '';
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * (1.05 + i * 0.15);
      let x = Math.cos(a) * r * 1.12, y = Math.sin(a) * r * 1.05 - 10;
      fr += `M${P(x, y, 0)}`;
      for (let k = 0; k < 3; k++) { x += Math.cos(a + R.range(-0.5, 0.5)) * 15; y += Math.sin(a + R.range(-0.5, 0.5)) * 15; fr += `L${P(x, y, 0)}`; }
    }
    s.push(`<path d="${fr}" fill="none" stroke="#5ec8ff" stroke-width="3.2" stroke-linejoin="bevel"/><path d="${fr}" fill="none" stroke="#ffffff" stroke-width="1"/>`);
  }
  return `<g transform="translate(${f(EYE.x)} ${f(EYE.y)}) rotate(${tilt})">${s.join('')}</g>`;
}

// ------------------------------------------------------------------------------------------------
function mouth(p, C, phase) {
  const pts = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14 * MOUTH_END;
    pts.push(SP.at(t, mouthV(t)));
  }
  pts.unshift(snoutPt([42, -36]));
  const d = shape(pts, false, 0);
  const id = `${p}-mo`;
  const glow = phase === 2 ? `<use href="#${id}" stroke="#3f9cff" stroke-width="12" opacity=".6" filter="url(#${p}-gs)"/>` : '';
  // dark lip line, the lit lower lip below it and a faint moonlit edge above
  return `<g fill="none" stroke-linecap="round">${glow}<g stroke="${C.lidEdge}" stroke-width="6"><path id="${id}" d="${d}"/></g>`
    + `<use href="#${id}" stroke="${C.bellyHi}" stroke-width="2" transform="translate(2 5)" opacity=".75"/>`
    + `<use href="#${id}" stroke="${C.hi}" stroke-width="1.6" transform="translate(-2 -5)" opacity=".5"/></g>`;
}

// ------------------------------------------------------------------------------------------------
function pecFin(p, C, phase) {
  // long humpback flipper reaching forward beneath the jaw, into the lower left; knobbed leading edge,
  // moth-dusted membrane with an eyespot on the trailing half
  const A = at(0.3, -0.9), A2 = at(0.4, -0.98), Bt = [276, 952];
  const lead = [];
  for (let i = 0; i <= 14; i++) {
    const u = i / 14;
    const bow = Math.sin(u * Math.PI) * 70;
    const knob = i % 2 ? 7 : 0;
    lead.push([A[0] + (Bt[0] - A[0]) * u - bow * 0.55 - knob * 0.6, A[1] + (Bt[1] - A[1]) * u + bow * 0.62 - knob * 0.5]);
  }
  const trail = [];
  for (let i = 0; i <= 8; i++) {
    const u = i / 8;
    const sag = Math.sin(u * Math.PI) * 96;
    trail.push([Bt[0] + 10 + (A2[0] - Bt[0] - 10) * u + sag * 0.7, Bt[1] - 2 + (A2[1] - Bt[1] + 2) * u + sag * 0.5]);
  }
  const d = shape([...lead, ...trail], true, 0);
  const s = [];
  s.push(`<path d="${d}" fill="url(#${p}-fin)"/>`);
  const inner = trail.map(([x, y], i) => {
    const u = i / 8;
    const L = lead[Math.round(14 - u * 14)];
    return [x + (L[0] - x) * 0.36, y + (L[1] - y) * 0.36];
  });
  s.push(`<path d="${shape([...trail, ...inner.reverse()], true, 0)}" fill="url(#${p}-membrane)"/>`);
  let veins = '';
  for (let i = 1; i < 8; i++) {
    const a = lead[14 - Math.round(i / 8 * 14)];
    const b = trail[i];
    veins += `M${P(a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25, 0)}Q${P((a[0] + b[0]) / 2 + 6, (a[1] + b[1]) / 2 - 8, 0)} ${P(b[0], b[1], 0)}`;
  }
  s.push(`<path d="${veins}" fill="none" stroke="${C.finVein}" stroke-width="1.3" opacity=".4"/>`);
  const es = [lead[8][0] * 0.5 + trail[3][0] * 0.5, lead[8][1] * 0.5 + trail[3][1] * 0.5];
  s.push(`<circle cx="${f(es[0], 0)}" cy="${f(es[1], 0)}" r="15" fill="${C.body[2]}" opacity=".5"/><circle cx="${f(es[0], 0)}" cy="${f(es[1], 0)}" r="9" fill="none" stroke="${C.finVein}" stroke-width="2.4" opacity=".75"/><circle cx="${f(es[0], 0)}" cy="${f(es[1], 0)}" r="3.6" fill="${C.rimHi}"/>`);
  let knobs = '';
  for (let i = 1; i < 13; i += 2) knobs += `<circle cx="${f(lead[i][0] + 7, 0)}" cy="${f(lead[i][1] + 2, 0)}" r="4"/>`;
  s.push(`<g fill="${C.fin[1]}" opacity=".45">${knobs}</g>`);
  s.push(`<path d="${shape(lead, false, 0)}" fill="none" stroke="${C.rimHi}" stroke-width="2.6" opacity=".7"/>`);
  s.push(`<path d="${shape(trail, false, 0)}" fill="none" stroke="${C.rimLo}" stroke-width="2" opacity=".55"/>`);
  if (phase === 2) s.push(`<path d="M${P(lead[5][0] + 8, lead[5][1], 0)}l26,14l-4,30l22,22" fill="none" stroke="#5ec8ff" stroke-width="3"/><path d="M${P(lead[5][0] + 8, lead[5][1], 0)}l26,14l-4,30l22,22" fill="none" stroke="#ffffff" stroke-width="1"/>`);
  return s.join('');
}

function fluke(p, C, phase) {
  // broad fluke, twisted a little toward the viewer so its full span reads; scalloped trailing edge
  const F0 = SP(1), tw = -12 * Math.PI / 180, cw = Math.cos(tw), sw = Math.sin(tw);
  const F = { x: F0.x, y: F0.y, tx: F0.tx * cw - F0.ty * sw, ty: F0.tx * sw + F0.ty * cw, nx: F0.nx * cw - F0.ny * sw, ny: F0.nx * sw + F0.ny * cw };
  const loc = (a, b, c) => { const q = [F.x + F.tx * a + F.nx * b, F.y + F.ty * a + F.ny * b]; if (c) q.push(1); return q; };
  const S = 194;
  const pts = [loc(-40, 15), loc(-4, S * 0.3), loc(24, S * 0.66), loc(56, S * 0.92), loc(96, S, 1), loc(76, S * 0.8), loc(70, S * 0.6), loc(76, S * 0.4), loc(70, S * 0.2), loc(76, S * 0.06), loc(62, 0, 1),
    loc(76, -S * 0.06), loc(70, -S * 0.2), loc(76, -S * 0.4), loc(70, -S * 0.58), loc(74, -S * 0.78), loc(92, -S * 0.98, 1), loc(52, -S * 0.9), loc(22, -S * 0.64), loc(-4, -S * 0.3), loc(-40, -15)];
  const d = shape(pts, true, 0);
  const vein = shape([loc(-20, 0), loc(30, 0), loc(60, 0)], false, 0);
  // pale pigment patches on the underside, like the markings that tell one whale from another
  let marks = '';
  for (const [a, b, rx, ry] of [[40, 70, 16, 30], [52, 120, 10, 20], [36, -60, 12, 26], [56, -112, 9, 16], [30, 20, 8, 12]]) {
    const [x, y] = loc(a, b * S / 172);
    marks += `<ellipse cx="${f(x, 0)}" cy="${f(y, 0)}" rx="${ry}" ry="${rx}" transform="rotate(${f(Math.atan2(F.ny, F.nx) * 180 / Math.PI, 0)} ${f(x, 0)} ${f(y, 0)})"/>`;
  }
  return `<path d="${d}" fill="url(#${p}-fluke)"/><g fill="${C.finVein}" opacity="${phase === 3 ? 0.5 : 0.22}">${marks}</g>`
    + `<path d="${d}" fill="none" stroke="${C.rimLo}" stroke-width="2.4" opacity=".6"/>`
    + `<path d="${shape([loc(-10, -24), loc(14, -S * 0.42), loc(50, -S * 0.92)], false, 0)}" fill="none" stroke="${C.rimHi}" stroke-width="2.4" opacity=".55"/>`
    + `<path d="${vein}" fill="none" stroke="${C.body[2]}" stroke-width="3" opacity=".6"/>`;
}

// ------------------------------------------------------------------------------------------------
function words(p, C, phase, R) {
  // digested language: tiny glowing glyph-marks breathed out of the mouth, drifting in loose ribbons
  const m = at(0.03, -0.3, 0, 0);
  const streams = phase === 3
    ? [[m, [m[0] - 70, m[1] - 30], [m[0] - 60, m[1] - 190]], [m, [m[0] - 30, m[1] + 30], [m[0] + 20, m[1] - 120]]]
    : phase === 2
      ? [[m, [m[0] - 80, m[1] + 10], [m[0] - 70, m[1] + 230]], [m, [m[0] - 70, m[1] - 60], [m[0] - 50, m[1] - 210]], [m, [m[0] + 10, m[1] + 120], [m[0] + 90, m[1] + 250]], [m, [m[0] - 90, m[1] + 80], [m[0] - 20, m[1] + 250]]]
      : [[m, [m[0] - 80, m[1] + 10], [m[0] - 70, m[1] + 230]], [m, [m[0] - 70, m[1] - 50], [m[0] - 40, m[1] - 190]], [m, [m[0] + 10, m[1] + 120], [m[0] + 80, m[1] + 240]]];
  const count = phase === 3 ? 12 : phase === 2 ? 34 : 32;
  let crisp = '';
  for (let i = 0; i < count; i++) {
    const st = streams[i % streams.length];
    const u = (Math.floor(i / streams.length) + R.range(0.2, 0.9)) / Math.ceil(count / streams.length);
    const q = bez(st, u);
    const x = q[0] + R.range(-16, 16) * (0.4 + u), y = q[1] + R.range(-12, 12) * (0.4 + u);
    if (x < 14 || x > 986 || y < 14 || y > 986) continue;
    const sc = (1.05 - u * 0.5) * R.range(0.7, 1.05);
    const g = GLYPHS[R.int(0, GLYPHS.length - 1)];
    const col = R() < 0.35 ? C.glyph2 : C.glyph;
    const op = f(Math.max(0.3, 1 - u * 0.65), 2);
    const tr = `translate(${f(x, 0)} ${f(y, 0)}) rotate(${f(R.range(-30, 30), 0)}) scale(${f(sc, 2)})`;
    crisp += `<path d="${g}" transform="${tr}" stroke="${col}" opacity="${op}"/>`;
  }
  return `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><use href="#${p}-wd" stroke-width="5" opacity=".5" filter="url(#${p}-gs)"/>`
    + `<g stroke-width="1.7"><g id="${p}-wd">${crisp}</g></g></g>`;
}
function bez([a, b, c], u) {
  return [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * b[0] + u * u * c[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * b[1] + u * u * c[1]];
}

// drifting moon motes keep the creature ethereal (phases 1 & 3)
function motes(C, phase) {
  const RM = rng(5150 + phase);
  let mm = '';
  for (let i = 0; i < 30; i++) {
    const t = RM.range(0.05, 1), [x0, y0] = SP.at(t, RM.range(-1.6, 1.8));
    const x = Math.min(975, Math.max(25, x0 + RM.range(-60, 60))), y = Math.min(975, Math.max(25, y0 + RM.range(-60, 60)));
    mm += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(RM.range(1, 2.8))}" opacity="${f(RM.range(0.35, 0.9), 2)}"/>`;
  }
  return `<g fill="${C.mote}">${mm}</g>`;
}

// ------------------------------------------------------------------------------------------------
function fireflies(p, R) {
  // memory fragments pouring out of the cracks like fireflies, rising in slow curling streams
  let dots = '', shards = '';
  for (let i = 0; i < 74; i++) {
    const t = R.range(0.3, 0.98), v = R.range(-0.5, 1);
    const [x0, y0] = SP.at(t, v);
    const F = SP(t);
    const out = R.range(0, 1) ** 1.5 * 240;
    const x = x0 + F.nx * out * 0.6 + Math.sin(out / 40 + i) * 26, y = y0 + F.ny * out * 0.4 - out * 0.7 + R.range(-20, 20);
    if (x < 10 || x > 990 || y < 10 || y > 990) continue;
    const r = R.range(1.4, 4.2);
    const warm = R() < 0.78;
    dots += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(r)}" fill="${warm ? '#ffe2b4' : '#c6ecff'}"/>`;
    if (i % 8 === 0) shards += `<path d="M${P(x + 8, y, 0)}l6,-9l7,9l-7,8z"/>`;
  }
  return `<use href="#${p}-ff" stroke="#ffb38a" stroke-width="7" opacity=".75" filter="url(#${p}-gs)"/><g id="${p}-ff">${dots}</g><g fill="url(#${p}-mem)" stroke="url(#${p}-grain)" stroke-width="3" opacity=".9">${shards}</g>`;
}

// ------------------------------------------------------------------------------------------------
function ringPt(cx, cy, rx, ry, rotDeg, a) {
  const rr = rotDeg * Math.PI / 180, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
  return [cx + x * Math.cos(rr) - y * Math.sin(rr), cy + x * Math.sin(rr) + y * Math.cos(rr)];
}
// elliptical arc a0 -> a1 (radians, increasing) as a compact SVG arc command
function ringArc(cx, cy, rx, ry, rotDeg, a0, a1) {
  const p0 = ringPt(cx, cy, rx, ry, rotDeg, a0), p1 = ringPt(cx, cy, rx, ry, rotDeg, a1);
  return `M${P(p0[0], p0[1])}A${f(rx)},${f(ry)} ${f(rotDeg)} ${a1 - a0 > Math.PI ? 1 : 0} 1 ${P(p1[0], p1[1])}`;
}

function sealRings(p) {
  // moonlight seal: a tilted armillary of fine silver arcs around the creature, and slim rings
  // closed round the body like bracelets. No chains — the seal is light, not iron.
  const back = [], front = [];
  let gB = '', gF = '', lB = '', lF = '', thinB = '', thinF = '', dots = '';
  // great orbits (far half behind, near half in front, with gaps like an unfinished sigil)
  for (const o of [{ cx: 520, cy: 560, rx: 474, ry: 150, rot: -16, near: [0.04, 1.5] }, { cx: 520, cy: 560, rx: 436, ry: 300, rot: 30, near: [0.04, 1.2] }]) {
    const arc = (a0, a1) => ringArc(o.cx, o.cy, o.rx, o.ry, o.rot, a0, a1);
    const far = arc(Math.PI + 0.1, Math.PI * 2 - 0.1);
    const near = arc(o.near[0], o.near[1]);
    if (o.ry < 200) { gB += far; lB += far; gF += near; lF += near; } else { thinB += far; thinF += near; }
    for (let i = 0; i < 24; i++) {
      const a = Math.PI + 0.22 + i / 23 * (Math.PI - 0.44);
      const [qx, qy] = ringPt(o.cx, o.cy, o.rx, o.ry, o.rot, a);
      dots += `<circle cx="${f(qx, 0)}" cy="${f(qy, 0)}" r="${i % 4 === 0 ? 3 : 1.4}"/>`;
    }
  }
  thinB += ringArc(520, 560, 448, 136, -16, 0, Math.PI * 2 - 0.001);
  // bracelet rings round the body: thin double lines with moon-phase beads
  let beads = '';
  for (const [t, extra, w] of [[0.5, 46, 3.2], [0.74, 38, 2.6], [0.92, 30, 2.2]]) {
    const F = SP(t);
    const ang = Math.atan2(F.ny, F.nx) * 180 / Math.PI;
    const rx = (F.wu + F.wl) / 2 + extra, ry = rx * 0.24;
    const off = (F.wu - F.wl) / 2;
    const cx = F.x + F.nx * off, cy = F.y + F.ny * off;
    gB += ringArc(cx, cy, rx, ry, ang, Math.PI, Math.PI * 2); gF += ringArc(cx, cy, rx, ry, ang, 0, Math.PI);
    lB += ringArc(cx, cy, rx, ry, ang, Math.PI, Math.PI * 2); lF += ringArc(cx, cy, rx, ry, ang, 0, Math.PI);
    thinB += ringArc(cx + F.tx * 9, cy + F.ty * 9, rx - 3, ry, ang, Math.PI, Math.PI * 2);
    thinF += ringArc(cx + F.tx * 9, cy + F.ty * 9, rx - 3, ry, ang, 0, Math.PI);
    for (let i = 1; i < 8; i++) {
      const [qx, qy] = ringPt(cx + F.tx * 4.5, cy + F.ty * 4.5, rx, ry, ang, i / 8 * Math.PI);
      beads += `<circle cx="${f(qx, 0)}" cy="${f(qy, 0)}" r="${i % 2 ? 3.6 : 2.2}"/>`;
    }
  }
  const glow = (d) => `<path d="${d}" fill="none" stroke="#c8bcff" stroke-width="10" opacity=".4" filter="url(#${p}-gs)"/>`;
  back.push(glow(gB) + `<path d="${lB}" fill="none" stroke="#f8f6ff" stroke-width="2"/><path d="${thinB}" fill="none" stroke="#e8ddff" stroke-width="1.2" opacity=".8"/><g fill="#f8f6ff" opacity=".8">${dots}</g>`);
  front.push(glow(gF) + `<path d="${lF}" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/><path d="${thinF}" fill="none" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" opacity=".85"/><g fill="#ffffff">${beads}</g>`);
  return { back: back.join(''), front: front.join('') };
}

// ------------------------------------------------------------------------------------------------
function childOrb(p, phase, tip) {
  // the one memory it never digested: a child reaching up, calling for its mother
  const [x, y] = tip;
  if (phase !== 3) return `<circle cx="${f(x, 0)}" cy="${f(y + 4, 0)}" r="${phase === 2 ? 16 : 11}" fill="url(#${p}-orb)" opacity="${phase === 2 ? 0.8 : 0.6}"/><circle cx="${f(x, 0)}" cy="${f(y + 4, 0)}" r="2.6" fill="#fff6e2"/>`;
  const cy = y + 40;
  return `<path d="M${P(x, y)}C${P(x + 6, y + 14)} ${P(x - 2, y + 20)} ${P(x, cy - 36)}" fill="none" stroke="#fff3df" stroke-width="2"/>`
    + `<circle cx="${f(x)}" cy="${f(cy)}" r="88" fill="url(#${p}-orb)" opacity=".45"/>`
    + `<circle cx="${f(x)}" cy="${f(cy)}" r="38" fill="url(#${p}-orb)"/>`
    + `<circle cx="${f(x)}" cy="${f(cy)}" r="38" fill="none" stroke="#fff3df" stroke-width="2"/>`
    + `<path d="${CHILD}" transform="translate(${f(x + 1)} ${f(cy + 5)}) scale(2)" fill="#7a2f3c"/>`;
}
