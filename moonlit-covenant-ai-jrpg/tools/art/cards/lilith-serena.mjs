#!/usr/bin/env node
// Card art generator - LILITH + SERENA classes (base art, 300x300, no frame / no text).
//   node tools/art/cards/lilith-serena.mjs [--only lilith_dagger,serena_hero]
// Output: public/assets/cards/<cardId>.svg for every card whose class is lilith or serena.
// Zero dependencies. Every id is prefixed with the card id. <= 1 filter per card, <= 14KB.
//
// Shares the visual grammar of tools/art/cards/neutral-lia.mjs so the four classes read as
// one set: class background -> rarity ornament -> back particles -> SUBJECT -> front
// particles -> moonlight wash -> vignette + bottom fade. Cel shading (base + 1 shade + 1
// light), coloured line, moonlight from the upper-left (#e8ddff), class rim light on the right.
//   lilith : violet / black-gold - shadows, daggers, assassins, smoke (+ ink-green poison)
//   serena : indigo / purple     - void, moons, stars, observation eyes
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARDS } from '../../../cards/database.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const OUT = path.join(root, 'public/assets/cards');
const BUDGET = 14 * 1024;
const CLASSES = ['lilith', 'serena'];

// ------------------------------------------------------------------ numbers & paths
const r = (v) => {
  const x = Math.round(v * 10) / 10;
  return Object.is(x, -0) ? 0 : x;
};
const pt = (p) => `${Math.round(p[0])} ${Math.round(p[1])}`;
const D2R = Math.PI / 180;

/** Catmull-Rom spline through points; [x,y,1] = sharp corner. */
function sm(pts, closed = true, k = 1 / 6) {
  const N = pts.length;
  const g = (i) => (closed ? pts[(i + N) % N] : pts[Math.max(0, Math.min(N - 1, i))]);
  let d = `M${pt(pts[0])}`;
  const segs = closed ? N : N - 1;
  let prevC = false;
  for (let i = 0; i < segs; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    if (p1[2] && p2[2]) { d += `L${pt(p2)}`; prevC = false; continue; }
    const c1 = p1[2] ? p1 : [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2 = p2[2] ? p2 : [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    // smooth joins reuse the reflected control point (S) - Catmull-Rom is C1 there; after M/L
    // the implicit S control point is the current point, which is exactly a sharp-corner start
    d += (prevC && !p1[2]) || (!prevC && p1[2]) ? `S${pt(c2)} ${pt(p2)}` : `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
    prevC = true;
  }
  return closed ? d + 'Z' : d;
}
const poly = (pts, closed = true) => 'M' + pts.map(pt).join('L') + (closed ? 'Z' : '');

/** map every point of an absolute path (M L C Q S T H V Z only). */
function mapPath(d, fn) {
  const toks = d.match(/[MLCQSTHVZ]|-?\d*\.?\d+/g);
  const out = [];
  let cmd = '', cx = 0, cy = 0, i = 0;
  const N = { M: 1, L: 1, T: 1, Q: 2, S: 2, C: 3 };
  while (i < toks.length) {
    const t = toks[i];
    if (/[A-Z]/.test(t)) { cmd = t; i++; if (t === 'Z') out.push('Z'); continue; }
    if (cmd === 'H' || cmd === 'V') {
      const v = +toks[i++];
      if (cmd === 'H') cx = v; else cy = v;
      out.push('L' + pt(fn(cx, cy)));
      continue;
    }
    const ps = [];
    for (let k = 0; k < N[cmd]; k++) { cx = +toks[i++]; cy = +toks[i++]; ps.push(pt(fn(cx, cy))); }
    out.push(cmd + ps.join(' '));
    if (cmd === 'M') cmd = 'L';
  }
  return out.join('');
}
const mir = (d, ax = 150) => mapPath(d, (x, y) => [2 * ax - x, y]);
/** translate / scale / rotate(deg) about (ox,oy) */
function xf(d, { tx = 0, ty = 0, s = 1, sx = s, sy = s, rot = 0, ox = 150, oy = 150 } = {}) {
  const c = Math.cos(rot * D2R), sn = Math.sin(rot * D2R);
  return mapPath(d, (x, y) => {
    const X = (x - ox) * sx, Y = (y - oy) * sy;
    return [ox + X * c - Y * sn + tx, oy + X * sn + Y * c + ty];
  });
}
/** first point of a (transformed) path as [x, y] */
const P0 = (d) => d.match(/-?\d*\.?\d+/g).slice(0, 2).map(Number);
/** point on a rotated ellipse */
const ePt = (cx, cy, rx, ry, rot, t) => {
  const c = Math.cos(rot * D2R), s = Math.sin(rot * D2R), x = Math.cos(t) * rx, y = Math.sin(t) * ry;
  return [cx + x * c - y * s, cy + x * s + y * c];
};
/** elliptical arc path from parameter t0 to t1 (radians, increasing = sweep 1) */
function eArc(cx, cy, rx, ry, rot, t0, t1) {
  const a = ePt(cx, cy, rx, ry, rot, t0), b = ePt(cx, cy, rx, ry, rot, t1);
  const large = Math.abs(t1 - t0) > Math.PI ? 1 : 0;
  return `M${r(a[0])} ${r(a[1])}A${r(rx)} ${r(ry)} ${r(rot)} ${large} 1 ${r(b[0])} ${r(b[1])}`;
}
/** polar helper */
const pol = (cx, cy, rr, deg) => [cx + Math.cos(deg * D2R) * rr, cy + Math.sin(deg * D2R) * rr];

// ------------------------------------------------------------------ deterministic rng
function rng(str) {
  let a = [...str].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619), 2166136261) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ palette
const PAL = { night: '#070614', night2: '#0c0b1b', panel: '#17132e', moon: '#e8ddff', oath: '#ffd091', abyss: '#0e1a3a' };
// material ramps: [base, shade, light, line]
const M = {
  steel: ['#b4b8d0', '#6a6f92', '#f2f3fc', '#171a30'],
  dkSteel: ['#5e5a82', '#3a3658', '#a29cc8', '#100e22'],
  black: ['#2e2540', '#1a1426', '#5a4a7c', '#08050e'],
  shadow: ['#3d2d5c', '#251a3c', '#7258a6', '#0d0718'],
  leather: ['#4a3448', '#2e1f2e', '#7a5a72', '#140a12'],
  gold: ['#e6b452', '#a0701f', '#fff0bf', '#3d2508'],
  violet: ['#9a64e0', '#5f379c', '#d4b0ff', '#240c44'],
  poison: ['#8fd15a', '#4f8a2a', '#e0ffad', '#163008'],
  skin: ['#f6d4c0', '#d9a294', '#fff1e8', '#5a2c2a'],
  silver: ['#d8dbee', '#8e93b4', '#ffffff', '#262a46'],
  robe: ['#3e3178', '#251c4e', '#7461bc', '#0d0a26'],
  moon: ['#efe9ff', '#b5a8dc', '#ffffff', '#3a3262'],
  lilHair: ['#f2c65c', '#b8852c', '#fff2bd', '#5a360c'],
  serHair: ['#3c2c62', '#221842', '#806abc', '#0f0922'],
};

// ------------------------------------------------------------------ class themes
const THEME = {
  lilith: {
    bg: ['#43206a', '#1d0d36', '#07040f'], halo: '#c084fc', ring: '#d9a441', rim: '#c084fc', mote: '#ead2ff',
    line: '#1a0a2a', smoke: '#7c4fc0', smokeDk: '#100620',
  },
  serena: {
    bg: ['#2f2c84', '#141145', '#06051a'], halo: '#b58cff', ring: '#efe9ff', rim: '#b58cff', mote: '#efe9ff',
    line: '#0e0b2a', smoke: '#5a4ec8', smokeDk: '#07061c',
  },
};
const RANK = { bronze: 0, silver: 1, gold: 2, legendary: 3 };

// ------------------------------------------------------------------ per-card context
function makeCtx(card) {
  const id = card.id;
  const defs = [];
  let k = 0, filt = null;
  const ctx = {
    id, card, T: THEME[card.class], rank: RANK[card.rarity], rand: rng(id), defs,
    p: (name) => `${id}-${name}`,
    lg(name, x1, y1, x2, y2, stops) {
      defs.push(`<linearGradient id="${id}-${name}" gradientUnits="userSpaceOnUse" x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}">${stopsXml(stops)}</linearGradient>`);
      return `url(#${id}-${name})`;
    },
    rg(name, cx, cy, rr, stops, fx, fy) {
      const f = fx != null ? ` fx="${r(fx)}" fy="${r(fy)}"` : '';
      defs.push(`<radialGradient id="${id}-${name}" gradientUnits="userSpaceOnUse" cx="${r(cx)}" cy="${r(cy)}" r="${r(rr)}"${f}>${stopsXml(stops)}</radialGradient>`);
      return `url(#${id}-${name})`;
    },
    /** gradient in the element's bounding-box units (a = attribute string, e.g. 'cx=".5"') */
    gb(name, kind, a, stops) {
      const tag = kind === 'r' ? 'radialGradient' : 'linearGradient';
      defs.push(`<${tag} id="${id}-${name}"${a ? ' ' + a : ''}>${stopsXml(stops)}</${tag}>`);
      return `url(#${id}-${name})`;
    },
    /** the card's single blur filter (registered on first use) */
    blur(sd = 4) {
      if (!filt) {
        filt = `${id}-f`;
        defs.push(`<filter id="${filt}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`);
      }
      return ` filter="url(#${filt})"`;
    },
    /**
     * Cel-shaded shape. m = ramp [base, shade, light, line].
     * o.ss = [dx,dy] offset of the lit base inside the shade (shadow crescent lower-right)
     * o.hl = moonlight edge width (upper-left), o.rw = rim width (right), o.rim = rim colour
     * o.inner = markup drawn inside the clip, o.sw = outline width, o.lite = no hl/rim,
     * o.eo = even-odd fill (shapes with holes)
     */
    cel(d, m, o = {}) {
      // single clip: shade fill -> lit base offset by ss -> rim band (right) -> moonlight band
      // (upper-left). Bands are strokes of the outline shifted so only one side stays inside
      // the clip: shift (-a,a) with width 2a leaves a 2a band on right edges, none on left/bottom.
      const [base, shade, light, line] = m;
      const ss = o.ss ?? [-10, -8];
      const hl = o.hl ?? (o.lite ? 0 : 2.2);
      const rw = o.rw ?? (o.lite ? 0 : 2.4);
      const rim = o.rim ?? ctx.T.rim;
      const sw = o.sw ?? 2.2;
      const pid = `${id}-${(k++).toString(36)}`;
      defs.push(`<path id="${pid}" d="${d}"${o.eo ? ' fill-rule="evenodd" clip-rule="evenodd"' : ''}/>`);
      const use = (a = '') => `<use href="#${pid}"${a}/>`;
      let s = o.under && sw ? use(` fill="none" stroke="${o.line ?? line}" stroke-width="${r(sw * 2)}"`) : '';
      if (ss || rw || hl || o.inner) {
        defs.push(`<clipPath id="${pid}c">${use()}</clipPath>`);
        s += `<g clip-path="url(#${pid}c)"><rect width="300" height="300" fill="${ss ? shade : base}"/>`;
        if (ss) s += use(` fill="${base}" transform="translate(${ss[0]} ${ss[1]})"`);
        if (o.inner) s += o.inner;
        if (rw) s += use(` fill="none" stroke="${rim}" stroke-width="${r(rw)}" transform="translate(${r(-rw / 2)} ${r(rw / 2)})"`);
        if (hl) s += use(` fill="none" stroke="${light}" stroke-width="${r(hl)}" transform="translate(${r(hl / 2)} ${r(hl / 2)})"`);
        s += '</g>';
      } else s += use(` fill="${base}"`);
      if (sw && !o.under) s += use(` fill="none" stroke="${o.line ?? line}" stroke-width="${sw}"`);
      return s;
    },
    flat(d, fill, o = {}) {
      const st = o.sw ? ` stroke="${o.line}" stroke-width="${o.sw}"` : '';
      const op = o.op != null ? ` opacity="${o.op}"` : '';
      return `<path d="${d}" fill="${fill}"${st}${op}${o.attr || ''}/>`;
    },
    line(d, color, w = 1.6, op = 1) {
      return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
    },
  };
  return ctx;
}
function stopsXml(stops) {
  return stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null && a !== 1 ? ` stop-opacity="${a}"` : ''}/>`).join('');
}

// ------------------------------------------------------------------ shared drawing bits
function sparkle(x, y, s, color, op = 1) {
  const a = s, b = s * 0.22;
  return `<path d="M${r(x)} ${r(y - a)}Q${r(x + b)} ${r(y - b)} ${r(x + a)} ${r(y)}Q${r(x + b)} ${r(y + b)} ${r(x)} ${r(y + a)}Q${r(x - b)} ${r(y + b)} ${r(x - a)} ${r(y)}Q${r(x - b)} ${r(y - b)} ${r(x)} ${r(y - a)}Z" fill="${color}"${op < 1 ? ` opacity="${r(op)}"` : ''}/>`;
}
function rhomb(x, y, w, h) {
  return `M${r(x)} ${r(y - h)}L${r(x + w)} ${r(y)}L${r(x)} ${r(y + h)}L${r(x - w)} ${r(y)}Z`;
}
const circle = (cx, cy, rr, attrs) => `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(rr)}" ${attrs}/>`;
/** star dots: zero-length round-capped strokes, bucketed by size */
function stars(ctx, n, color, box = [0, 0, 300, 200], maxR = 1.3) {
  const b = [[], [], []];
  for (let i = 0; i < n; i++) {
    const x = box[0] + ctx.rand() * (box[2] - box[0]);
    const y = box[1] + ctx.rand() * (box[3] - box[1]);
    b[Math.floor(ctx.rand() * 3)].push(`M${Math.round(x)} ${Math.round(y)}h0`);
  }
  return b.map((d, i) => (d.length ? `<path d="${d.join('')}" stroke="${color}" stroke-width="${r(1 + i * maxR * 0.7)}" stroke-linecap="round" opacity="${[0.35, 0.55, 0.8][i]}"/>` : '')).join('');
}
/** drifting motes (slanted diamonds), one path per colour */
function motes(ctx, n, colors, box = [20, 60, 280, 290], size = 3) {
  const b = colors.map(() => []);
  for (let i = 0; i < n; i++) {
    const x = box[0] + ctx.rand() * (box[2] - box[0]);
    const y = box[1] + ctx.rand() * (box[3] - box[1]);
    const w = (0.5 + ctx.rand()) * size * 0.45, h = w * (1.6 + ctx.rand());
    const t = (ctx.rand() - 0.5) * 0.7;
    b[i % colors.length].push('M' + [[x + h * t, y - h], [x + w, y], [x - h * t, y + h], [x - w, y]].map(pt).join('L') + 'Z');
  }
  return b.map((d, i) => `<path d="${d.join('')}" fill="${colors[i]}" opacity="${[0.85, 0.6, 0.45][i % 3]}"/>`).join('');
}
function rays(cx, cy, n, r0, r1, spread, color, op, rot = 0) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = rot + (i * 360) / n;
    const w = spread * (i % 2 ? 0.55 : 1);
    d += poly([pol(cx, cy, r0, a - w), pol(cx, cy, r1 * (i % 2 ? 0.75 : 1), a), pol(cx, cy, r0, a + w)]);
  }
  return `<path d="${d}" fill="${color}" opacity="${op}"/>`;
}
/** a soft smoke ribbon: wavy band across the card around baseline y */
function smokeBand(ctx, y, amp, th, color, op, phase = 0) {
  const top = [], bot = [];
  for (let i = 0; i <= 8; i++) {
    const x = -20 + i * 42.5;
    const w = Math.sin(i * 1.3 + phase) * amp;
    top.push([x, y + w - th * (0.6 + 0.4 * Math.sin(i * 2.1 + phase))]);
    bot.push([x, y + w + th * 0.5]);
  }
  return `<path d="${sm([...top, ...bot.reverse()])}" fill="${color}" opacity="${op}"/>`;
}
/** smoke puffs (a row of overlapping lobes) used for the floor */
function puffs(ctx, n, box, rr, color, op) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = box[0] + ((i + 0.5) / n) * (box[2] - box[0]) + (ctx.rand() - 0.5) * 14;
    const y = box[1] + ctx.rand() * (box[3] - box[1]);
    const q = rr * (0.6 + ctx.rand() * 0.7);
    const Q = Math.round(q);
    d += `M${Math.round(x - Q)} ${Math.round(y)}a${Q} ${Q} 0 1 1 ${2 * Q} 0a${Q} ${Q} 0 1 1 ${-2 * Q} 0Z`;
  }
  return `<path d="${d}" fill="${color}" opacity="${op}"/>`;
}
/** small moon-phase disc (k: -1..1, 0 = new, ±1 = full) */
function phaseDisc(x, y, rr, k, lit, dark) {
  if (Math.abs(k) >= 0.98) return circle(x, y, rr, `fill="${lit}"`);
  const ex = Math.abs(1 - 2 * Math.abs(k)) * rr;
  const side = k > 0 ? 1 : 0;
  const bulge = Math.abs(k) > 0.5 ? 1 - side : side;
  return circle(x, y, rr, `fill="${dark}"`) + `<path d="M${r(x)} ${r(y - rr)}A${r(rr)} ${r(rr)} 0 0 ${side} ${r(x)} ${r(y + rr)}A${r(ex)} ${r(rr)} 0 0 ${bulge} ${r(x)} ${r(y - rr)}Z" fill="${lit}"/>`;
}

// ------------------------------------------------------------------ backgrounds
const f3 = (v) => Math.round(v * 1000) / 1000;
function background(ctx, o) {
  const { T, rank } = ctx;
  const cls = ctx.card.class;
  const [fx, fy] = o.focus || [150, 130];
  let s = `<rect width="300" height="300" fill="${ctx.gb('bg', 'r', `cx="${f3(fx / 300)}" cy="${f3(fy / 300)}" r="${f3(235 / 300)}"`, [[0, T.bg[0]], [0.5, T.bg[1]], [1, T.bg[2]]])}"/>`;
  s += circle(fx, fy, 150, `fill="${ctx.gb('halo', 'r', '', [[0, T.halo, 0.36], [0.4, T.halo, 0.12], [1, T.halo, 0]])}"`);
  if (cls === 'lilith') {
    // high thin crescent (black-gold), diagonal shadow cuts, drifting smoke bands, smoke floor
    if (o.crescent !== false) {
      const [cx, cy, cr] = o.crescent || [214, 62, 30];
      s += `<path d="M${r(cx - cr * 0.2)} ${r(cy - cr)}A${cr} ${cr} 0 1 0 ${r(cx + cr * 0.95)} ${r(cy + cr * 0.35)}A${r(cr * 0.82)} ${r(cr * 0.82)} 0 1 1 ${r(cx - cr * 0.2)} ${r(cy - cr)}Z" fill="#f3d79a" opacity=".5"/>`;
    }
    s += stars(ctx, Math.round((10 + rank * 5) * (o.bgLite ? 0.6 : 1)), T.mote, [6, 6, 294, 170], 1.1);
    let cuts = '';
    for (let i = 0; i < 3 + rank; i++) {
      const x = 20 + ctx.rand() * 260, y = 30 + ctx.rand() * 200, L = 50 + ctx.rand() * 70;
      const dx = Math.cos(-28 * D2R) * L, dy = Math.sin(-28 * D2R) * L;
      cuts += 'M' + [[x - dx, y - dy], [x + 1.5, y + 1.5], [x + dx, y + dy], [x - 1.5, y - 1.5]].map(pt).join('L') + 'Z';
    }
    if (!o.bgLite) {
      s += `<path d="${cuts}" fill="${T.ring}" opacity=".12"/>`;
      s += smokeBand(ctx, 196, 8, 16, T.smoke, 0.1, 0.4) + smokeBand(ctx, 226, 10, 18, T.smoke, 0.08, 2.2);
    }
    if (o.ground !== false && !o.bgLite) {
      s += puffs(ctx, 9, [-10, 262, 310, 286], 26, T.smokeDk, 0.85);
      s += `<path d="M-10 300V276H310V300Z" fill="${T.smokeDk}"/>`;
    }
  } else {
    // dense star field, constellation, tilted orbit ellipses, void mist floor
    s += stars(ctx, Math.round((20 + rank * 8) * (o.bgLite ? 0.6 : 1)), T.mote, [6, 6, 294, 240], 1.4);
    if (o.orbits !== false) {
      s += `<path d="${eArc(fx, fy, 128, 40, -16, 0, Math.PI * 1.999)}${eArc(fx, fy + 6, 110, 30, 22, 0, Math.PI * 1.999)}" fill="none" stroke="${T.halo}" stroke-width="1" opacity=".22"/>`;
    }
    let cons = '';
    const cpts = [[30, 52], [58, 34], [84, 58], [66, 88], [236, 40], [262, 66], [248, 98], [276, 112]];
    for (let i = 0; i < cpts.length; i++) if (i !== 3 && i !== 7) cons += `M${pt(cpts[i])}L${pt(cpts[i + 1])}`;
    s += ctx.line(cons, T.mote, 0.7, 0.18) + `<path d="${cpts.map((p) => `M${pt(p)}h0`).join('')}" stroke="${T.mote}" stroke-width="3" stroke-linecap="round" opacity=".6"/>`;
    if (o.ground !== false && !o.bgLite) {
      s += smokeBand(ctx, 250, 7, 16, T.smoke, 0.12, 1.1);
      s += puffs(ctx, 8, [-10, 270, 310, 290], 24, T.smokeDk, 0.8);
      s += `<path d="M-10 300V282H310V300Z" fill="${T.smokeDk}"/>`;
    }
  }
  // rarity ornament
  if (rank >= 1) {
    const rr = o.ringR || 108;
    s += circle(fx, fy, rr, `fill="none" stroke="${T.ring}" stroke-width="1" opacity="${rank >= 2 ? 0.34 : 0.22}"`);
    for (let i = 0; i < 4; i++) {
      const a = 45 + i * 90;
      const [x, y] = pol(fx, fy, rr, a);
      if (cls === 'lilith') {
        // tiny dagger pointing outward
        const tip = pol(fx, fy, rr + 8, a), b1 = pol(x, y, 3, a + 90), b2 = pol(x, y, 3, a - 90), h = pol(fx, fy, rr - 4, a);
        s += `<path d="M${pt(tip)}L${pt(b1)}L${pt(h)}L${pt(b2)}Z" fill="${T.ring}" opacity="${rank >= 2 ? 0.65 : 0.45}"/>`;
      } else {
        s += phaseDisc(x, y, 4, [0.3, 0.6, -0.6, -0.3][i], T.ring, T.bg[1]);
      }
    }
  }
  if (rank >= 2) {
    if (o.rays !== false) s += rays(fx, fy, 18, 30, 175, 3, cls === 'lilith' ? T.halo : T.ring, rank >= 3 ? 0.12 : 0.07, 7);
    s += circle(fx, fy, (o.ringR || 108) + 9, `fill="none" stroke="${T.ring}" stroke-width=".7" stroke-dasharray="2 5" opacity=".35"`);
  }
  if (rank >= 3) {
    const ir = ctx.lg('iri', fx - 120, fy - 120, fx + 120, fy + 120, [[0, '#ffd091'], [0.3, '#ff8ab0'], [0.55, '#c9a0ff'], [0.8, '#8fd4f5'], [1, '#ffd091']]);
    s += circle(fx, fy, (o.ringR || 108) - 8, `fill="none" stroke="${ir}" stroke-width="2.2" opacity=".55"`);
  }
  return s;
}

function overlays(ctx, o) {
  const { T, rank } = ctx;
  const [fx, fy] = o.focus || [150, 130];
  let s = '';
  const nm = o.bgLite ? 8 : 0;
  if (ctx.card.class === 'lilith') s += motes(ctx, 6 + rank * 3 - nm, ['#d9a441', '#c084fc', '#f3e2ff'], [14, 40, 286, 280], 3.4);
  else s += motes(ctx, 5 + rank * 3 - nm, ['#efe9ff', '#b58cff'], [14, 30, 286, 280], 2.4);
  if (rank >= 2) {
    for (let i = 0; i < rank; i++) s += sparkle(Math.round(30 + ctx.rand() * 240), Math.round(24 + ctx.rand() * 200), Math.round(3 + ctx.rand() * 4), rank >= 3 ? '#fff4dc' : T.mote, 0.7);
  }
  s += `<path d="M0 0H130L0 150Z" fill="${ctx.gb('wash', 'l', 'x2=".7" y2=".6"', [[0, PAL.moon, 0.16], [1, PAL.moon, 0]])}"/>`;
  s += `<rect width="300" height="300" fill="${ctx.gb('vig', 'r', `cx="${f3(fx / 300)}" cy="${f3((fy + 10) / 300)}" r="${f3(215 / 300)}"`, [[0.5, PAL.night, 0], [0.82, PAL.night, 0.45], [1, PAL.night, 0.9]])}"/>`;
  s += `<rect y="240" width="300" height="60" fill="${ctx.gb('fade', 'l', 'x2="0" y2="1"', [[0, PAL.night, 0], [1, PAL.night, 0.6]])}"/>`;
  return s;
}

// ------------------------------------------------------------------ faces
/** ellipse as a path subpath (lets many same-coloured ellipses share one element) */
const ell = (cx, cy, rx, ry) => `M${r(cx - rx)} ${r(cy)}a${r(rx)} ${r(ry)} 0 1 0 ${r(2 * rx)} 0a${r(rx)} ${r(ry)} 0 1 0 ${r(-2 * rx)} 0Z`;
/**
 * Adult anime face. (cx, ey) = centre between the eyes, s = scale (1 = ~54px wide face).
 * o.look: -1..1 (positive = turned toward viewer-right). o.eye iris colour. o.mask: lower
 * face covered (assassin cowl), colour ramp. o.veil: eyes covered by a veil band (ramp).
 * o.closed, o.lid (0..1 half-lidded), o.mouth ('smirk'|'open'|'calm'), o.angry, o.brow lift,
 * o.lash colour, o.gaze. Both eyes share elements (one clip, one path per colour).
 */
function face(ctx, cx, ey, s, o = {}) {
  const look = o.look ?? 0;
  const skin = o.skin || M.skin;
  const eye = o.eye || '#c98a2e';
  const ln = o.line || '#4a1e2e';
  const F = (x) => cx + (x * (x * look > 0 ? 1 - 0.24 * Math.abs(look) : 1) + look * 5) * s;
  const P = (x, y) => [F(x), ey + y * s];
  const jaw = sm([P(-27, -34), P(-26.5, -6), P(-23, 11), P(-13.5, 24), [F(look * 3.5), ey + 32 * s], P(13.5, 24), P(23, 11), P(26.5, -6), P(27, -34), P(12, -46), P(-12, -46)]);
  let f = ctx.cel(jaw, skin, { ss: [r(-6 * s - look * 3), r(-3 * s)], hl: 1.4, rw: 1.6, rim: o.rimC || '#e9c2ff', sw: r(2 * s), line: ln });
  const eh = 5.6 * s, lash = o.lash || '#2a1024', lid = o.lid || 0;
  const top = o.angry ? 1.2 : 1.4, up = (o.sharp ?? 1) * 1.1 * s;
  const E = { brow: '', wd: '', iris: '', shd: '', pup: '', hi: '', lid: '', lash: '', low: '', crease: '', closed: '' };
  for (const [x, flip] of [[-12, true], [12, false]]) {
    const ex = F(x);
    const w = 9.4 * s * (x * look > 0 ? 1 - 0.28 * Math.abs(look) : 1);
    const x0 = ex - w, x1 = ex + w, y = ey;
    const by = y - eh * 2.2 - (o.brow || 0) * s, bin = o.angry ? 2.6 * s : 0;
    if (!o.veil) E.brow += `M${r(x0 - 0.5 * s)} ${r(by + (flip ? bin : 0.4 * s))}Q${r(ex)} ${r(by - 2.4 * s)} ${r(x1 + 0.8 * s)} ${r(by + (flip ? 0.4 * s : bin))}`;
    if (o.veil) continue;
    if (o.closed) {
      E.closed += `M${r(x0)} ${r(y - 0.5 * s)}Q${r(ex)} ${r(y + eh * 0.8)} ${r(x1)} ${r(y - 0.5 * s)}M${r(flip ? x0 : x1)} ${r(y - 0.5 * s)}l${r((flip ? -2.6 : 2.6) * s)} ${r(1.4 * s)}`;
      continue;
    }
    const ya = flip ? y - up : y, yb = flip ? y : y - up;
    E.wd += `M${r(x0)} ${r(ya)}C${r(x0 + w * 0.3)} ${r(y - eh * top - up * 0.5)} ${r(x1 - w * 0.35)} ${r(y - eh * top - up * 0.5)} ${r(x1)} ${r(yb)}C${r(x1 - w * 0.3)} ${r(y + eh * 0.95)} ${r(x0 + w * 0.35)} ${r(y + eh * 0.95)} ${r(x0)} ${r(ya)}Z`;
    const ix = ex + (o.gaze ?? look * 1.8) * s, irx = 4.4 * s * (w / (9.4 * s));
    E.iris += ell(ix, y - 0.6 * s, irx, 5.4 * s);
    E.shd += ell(ix, y - 2.4 * s, irx * 0.92, 2.3 * s);
    E.pup += ell(ix, y, irx * (o.slit ? 0.22 : 0.45), 2.8 * s);
    E.hi += ell(ix - irx * 0.4, y - 2.4 * s, 1.1 * s, 1.1 * s);
    const ly = y - eh * top + lid * eh * 1.5;
    if (lid) {
      E.lid += `M${r(x0 - 3)} ${r(y - eh * 3)}H${r(x1 + 3)}V${r(ly)}Q${r(ex)} ${r(ly - eh * 0.5)} ${r(x0 - 3)} ${r(ly)}Z`;
      E.crease += `M${r(x0 + w * 0.2)} ${r(y - eh * top - 2 * s)}Q${r(ex)} ${r(y - eh * top * 1.5)} ${r(x1)} ${r(y - eh * top - 1.4 * s)}`;
    }
    const ox = flip ? x0 - 1.8 * s : x1 + 1.8 * s, ix0 = flip ? x1 : x0, oy = (flip ? ya : yb) - 0.6 * s;
    E.lash += `M${r(ix0)} ${r(y - 0.6 * s)}Q${r(ex)} ${r(y - eh * top * 1.12 * (1 - lid * 0.75) - up * 0.5)} ${r(ox)} ${r(oy)}`;
    E.low += `M${r(x0 + w * 0.3)} ${r(y + eh * 0.7)}Q${r(ex)} ${r(y + eh * 0.85)} ${r(x1 - w * 0.2)} ${r(y + eh * 0.55)}`;
  }
  const stroke = (d, c, w, op = 1) => (d ? `<path d="${d}" fill="none" stroke="${c}" stroke-width="${r(w)}"${op < 1 ? ` opacity="${op}"` : ''}/>` : '');
  f += stroke(E.brow, o.browC || '#4a2030', 1.7 * s);
  f += stroke(E.closed, lash, 2 * s);
  if (E.wd) {
    const eid = ctx.p('eye');
    ctx.defs.push(`<path id="${eid}" d="${E.wd}"/><clipPath id="${eid}c"><use href="#${eid}"/></clipPath>`);
    f += `<use href="#${eid}" fill="#fbf4ff"/><g clip-path="url(#${eid}c)"><path d="${E.iris}" fill="${eye}"/><path d="${E.shd}" opacity=".3"/><path d="${E.pup}" fill="#1c0c20"/><path d="${E.hi}" fill="#fff"/>${E.lid ? `<path d="${E.lid}" fill="${skin[0]}"/>` : ''}</g>`;
    f += stroke(E.lash, lash, 2.3 * s) + stroke(E.low, ln, 0.9 * s, 0.5) + stroke(E.crease, ln, 0.9 * s, 0.55);
  }
  if (o.veil) {
    // translucent veil band over the eyes with an embroidered eye sigil
    const vb = sm([P(-30, -8), P(0, -11), P(30, -8), P(30, 6), P(0, 3), P(-30, 6)]);
    f += ctx.flat(vb, o.veil[0], { sw: r(1.2 * s), line: o.veil[3], op: 0.95 });
    f += `<path d="M${r(F(-7))} ${r(ey - 3 * s)}Q${r(F(0))} ${r(ey - 8 * s)} ${r(F(7))} ${r(ey - 3 * s)}Q${r(F(0))} ${r(ey + 2 * s)} ${r(F(-7))} ${r(ey - 3 * s)}Z" fill="none" stroke="${o.veil[2]}" stroke-width="${r(1.1 * s)}"/>` + circle(F(0), ey - 3 * s, 1.6 * s, `fill="${o.veil[2]}"`);
  }
  if (o.mask) {
    const mk = sm([P(-28, 4), P(-14, 7), [F(look * 2), ey + 5 * s], P(14, 7), P(28, 4), P(26, 18), P(16, 30), [F(look * 3.5), ey + 38 * s], P(-16, 30), P(-26, 18)]);
    f += ctx.cel(mk, o.mask, { ss: [r(-7 * s), r(-3 * s)], hl: 0, rw: 1.4, sw: r(1.8 * s) });
    f += ctx.line(`M${r(F(-22))} ${r(ey + 14 * s)}Q${r(F(0))} ${r(ey + 19 * s)} ${r(F(22))} ${r(ey + 14 * s)}`, o.mask[1], r(1.2 * s), 0.8);
    return f;
  }
  const nx = F(look * 2);
  f += `<path d="M${r(nx + 0.6 * s + look * s)} ${r(ey + 8 * s)}L${r(nx - 0.8 * s + look * 1.5 * s)} ${r(ey + 13 * s)}L${r(nx + 1.4 * s)} ${r(ey + 13.6 * s)}" fill="none" stroke="${skin[1]}" stroke-width="${r(1.3 * s)}"/>`;
  const mx = F(look * 3), mw = (o.mouthW || 4.6) * s, my = ey + 21 * s;
  if (o.mouth === 'smirk') {
    f += stroke(`M${r(mx - mw)} ${r(my)}Q${r(mx)} ${r(my + 0.8 * s)} ${r(mx + mw)} ${r(my - 2.2 * s)}`, ln, 1.4 * s);
  } else if (o.mouth === 'open') {
    f += `<path d="M${r(mx - mw)} ${r(my - 1 * s)}Q${r(mx)} ${r(my - 2 * s)} ${r(mx + mw)} ${r(my - 1 * s)}Q${r(mx + mw * 0.5)} ${r(my + 4 * s)} ${r(mx)} ${r(my + 4 * s)}Q${r(mx - mw * 0.5)} ${r(my + 4 * s)} ${r(mx - mw)} ${r(my - 1 * s)}Z" fill="#6e2440" stroke="${ln}" stroke-width="${r(1.1 * s)}"/>`;
  } else {
    f += stroke(`M${r(mx - mw)} ${r(my)}Q${r(mx)} ${r(my - 0.6 * s)} ${r(mx + mw)} ${r(my)}`, ln, 1.3 * s);
  }
  return f;
}

// ------------------------------------------------------------------ SUBJECTS
const SUBJECTS = {};

// ======================= LILITH =======================

/** a dagger in local space: pommel at top (150, y0), tip at (150, y1) */
function dagger(ctx, o = {}) {
  const y0 = o.y0 ?? 40, y1 = o.y1 ?? 250, bw = o.bw ?? 12, gw = o.gw ?? 40;
  const gy = y0 + (y1 - y0) * 0.27;
  const blade = sm([[150 - bw, gy + 6, 1], [150 - bw * 0.9, gy + (y1 - gy) * 0.45], [150 - bw * 0.45, gy + (y1 - gy) * 0.85], [150, y1, 1], [150 + bw * 0.45, gy + (y1 - gy) * 0.85], [150 + bw * 0.9, gy + (y1 - gy) * 0.45], [150 + bw, gy + 6, 1]]);
  const grip = sm([[144, y0 + 12, 1], [156, y0 + 12, 1], [157, gy - 4, 1], [143, gy - 4, 1]]);
  const guard = sm([[150 - gw, gy - 10], [150 - gw * 0.55, gy - 2], [150, gy - 6, 1], [150 + gw * 0.55, gy - 2], [150 + gw, gy - 10], [150 + gw * 0.7, gy + 6], [150, gy + 9, 1], [150 - gw * 0.7, gy + 6]]);
  const pommel = rhomb(150, y0 + 6, 9, 11);
  const T = (d) => xf(d, o.tf || {});
  return { blade: T(blade), grip: T(grip), guard: T(guard), pommel: T(pommel), fuller: T(`M150 ${gy + 10}L150 ${gy + (y1 - gy) * 0.78}`), gy, edge: T(`M${150 - bw * 0.55} ${gy + 10}L${150 - bw * 0.3} ${gy + (y1 - gy) * 0.8}`) };
}

/** water/poison drop pointing up, centre (x,y), scale q */
const dropD = (x, y, q) => `M${r(x)} ${r(y - 7 * q)}C${r(x + 4 * q)} ${r(y - 1 * q)} ${r(x + 5 * q)} ${r(y + 3 * q)} ${r(x)} ${r(y + 5 * q)}C${r(x - 5 * q)} ${r(y + 3 * q)} ${r(x - 4 * q)} ${r(y - 1 * q)} ${r(x)} ${r(y - 7 * q)}Z`;
/** spiral curl stroke (smoke / cloud motif) */
function curl(x, y, rr, dir = 1, turns = 1.3, a0 = 0) {
  const pts = [];
  const n = 10;
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = (a0 + dir * t * turns * 360) * D2R, q = rr * (1 - t * 0.75);
    pts.push([x + Math.cos(a) * q, y + Math.sin(a) * q]);
  }
  return sm(pts, false);
}
/** stylised smoke cloud: lobed silhouette + curl strokes. lobes = [[x,y,r],...] */
function cloud(ctx, lobes, fill, curlC, o = {}) {
  let d = '';
  for (const [x, y, q] of lobes) d += `M${r(x - q)} ${r(y)}a${r(q)} ${r(q)} 0 1 1 ${r(2 * q)} 0a${r(q)} ${r(q)} 0 1 1 ${r(-2 * q)} 0Z`;
  let s = `<path d="${d}" fill="${fill}"${o.op ? ` opacity="${o.op}"` : ''}/>`;
  let c = '';
  for (const [x, y, q] of lobes.slice(0, o.curls ?? 2)) c += curl(x + q * 0.1, y + q * 0.05, q * 0.62, o.dir || 1, 1.2, 200);
  if (curlC) s += ctx.line(c, curlC, o.cw || 1.6, o.cop || 0.7);
  return s;
}

// 暗影匕首 - a living shadow dagger diving point-first: a gold slit eye watches from the
// crescent guard, smoke streams off the pommel, ink-green poison coats the edge and drips.
SUBJECTS.lilith_dagger = {
  focus: [150, 146], crescent: [74, 60, 24],
  draw(ctx) {
    let s = '';
    const tf = { rot: 35, ox: 150, oy: 150, s: 0.94, tx: 6, ty: -16 };
    const dg = dagger(ctx, { y0: 26, y1: 278, bw: 19, gw: 52, tf });
    // speed smoke streaming back to the upper-right
    const ribbon = (y, w, q) => xf(sm([[150, 70, 1], [142 - w, 40], [150 - w * 0.6, -10], [150 + q, -60, 1], [150 + w * 0.3, -6], [160 + w * 0.2, 40]]), { ...tf, tx: y });
    s += ctx.flat(ribbon(0, 26, 10) + ribbon(26, 14, 20), ctx.T.smokeDk, { op: 0.9, sw: 1.4, line: '#7c4fc0' });
    s += ctx.flat(ribbon(-22, 12, -8), '#2a1648', { op: 0.95 });
    s += cloud(ctx, [[232, 52, 18], [252, 72, 14], [214, 40, 12]], '#1a0c30', '#7c4fc0', { cop: 0.6 });
    // violet aura behind the blade
    s += `<path d="${dg.blade}" fill="#c084fc" stroke="#c084fc" stroke-width="16" opacity=".6"${ctx.blur(7)}/>`;
    // blade, with poison coating the lower half
    const T0 = (x, y) => P0(xf(`M${x} ${y}`, tf));
    const [px1, py1] = T0(150, 150), [px2, py2] = T0(150, 278);
    s += ctx.cel(dg.blade, M.steel, {
      ss: [-8, 2], hl: 2.2, rw: 2.6, sw: 2.2,
      inner: `<rect width="300" height="300" fill="${ctx.lg('pz', px1, py1, px2, py2, [[0, M.poison[0], 0], [0.45, M.poison[0], 0.8], [1, '#c8f590', 1]])}"/>`,
    });
    s += ctx.line(dg.fuller, M.steel[1], 3, 0.6) + ctx.line(dg.edge, '#ffffff', 1.8, 0.85);
    // grip, guard (with the eye), pommel gem
    s += ctx.cel(dg.grip, M.leather, { ss: [-5, 0], lite: true, sw: 1.8 });
    s += ctx.line(xf('M143 46L157 54M143 58L157 66M143 70L157 78M143 82L157 90', tf), M.gold[1], 1.6, 0.9);
    s += ctx.cel(dg.guard, M.gold, { ss: [-7, -6], hl: 1.8, sw: 2 });
    const eyeL = xf(`M132 ${dg.gy - 1}Q150 ${dg.gy - 14} 168 ${dg.gy - 1}Q150 ${dg.gy + 10} 132 ${dg.gy - 1}Z`, tf);
    s += ctx.flat(eyeL, '#1a0a12', { sw: 1.4, line: M.gold[3] });
    s += ctx.flat(xf(`M150 ${dg.gy - 8}Q154 ${dg.gy - 1} 150 ${dg.gy + 5}Q146 ${dg.gy - 1} 150 ${dg.gy - 8}Z`, tf), '#ffd96e');
    s += ctx.cel(dg.pommel, M.violet, { ss: [-4, -5], hl: 1.6, sw: 1.8 });
    // poison drips
    const [tx, ty] = T0(150, 278);
    s += ctx.flat(dropD(tx + 4, ty + 18, 1.5) + dropD(tx - 2, ty + 42, 1.1) + dropD(tx + 24, ty - 4, 0.9), M.poison[0], { sw: 1.3, line: M.poison[3] });
    s += circle(tx + 3, ty + 14, 1.8, `fill="${M.poison[2]}"`) + circle(tx - 3, ty + 39, 1.3, `fill="${M.poison[2]}"`);
    s += sparkle(tx + 2, ty + 2, 7, '#e9ffd0', 0.9);
    return s;
  },
};

// 影袭 - a silent strike: one huge crescent cut tears the dark, its trailing dagger still
// in flight at the end of the stroke; curling smoke marks where the assassin vanished.
SUBJECTS.lilith_strike = {
  focus: [150, 146], crescent: false,
  draw(ctx) {
    let s = '';
    // vanish smoke at the start of the stroke
    s += cloud(ctx, [[62, 84, 22], [42, 104, 18], [86, 70, 16], [30, 80, 14], [74, 108, 14]], '#1c0d33', '#8a5cd0', { curls: 3, cop: 0.75 });
    // the crescent cut (outer glow -> lilac -> white core), black-gold leading edge
    const cut = (w, dx = 0, dy = 0) => `M${36 + dx} ${86 + dy}C${84 + dx} ${150 + w * 1.4 + dy} ${170 + dx} ${208 + w * 1.2 + dy} ${258 + dx} ${208 + dy}C${180 + dx} ${196 - w * 0.2 + dy} ${104 + dx} ${150 - w * 0.6 + dy} ${36 + dx} ${86 + dy}Z`;
    s += rays(150, 170, 18, 20, 120, 1.6, '#e9d2ff', 0.22, 12);
    s += ctx.flat(cut(26, 10, 22), '#0d0618', { op: 0.85 });
    s += `<path d="${cut(28)}" fill="#c084fc" opacity=".75"${ctx.blur(9)}/>`;
    s += ctx.flat(cut(20), '#9a64e0', { op: 0.9 });
    s += ctx.flat(cut(12), '#d8c0ff');
    s += ctx.flat(cut(5), '#fdfaff');
    s += ctx.line('M36 86C84 178 170 232 258 208', '#d9a441', 2.2, 0.95);
    // echo cut
    s += ctx.flat('M62 60C120 92 190 118 268 118C190 108 124 88 62 60Z', '#e9d2ff', { op: 0.55 }) + ctx.flat('M70 196C116 230 170 248 230 252C170 240 120 226 70 196Z', '#e9d2ff', { op: 0.45 });
    // severed shadow fragments drifting off the cut
    let sh = '';
    const fr = [[96, 166, 6, 0.8], [130, 204, 5, 1], [168, 186, 4, -0.6], [204, 232, 6, 0.5], [118, 120, 4, -1], [210, 176, 5, 0.9], [150, 230, 3, -0.4]];
    for (const [x, y, q, k] of fr) sh += poly([[x - q, y - q * k], [x + q * 0.4, y - q * 1.3], [x + q, y + q * k * 0.6], [x - q * 0.3, y + q * 1.1]]);
    s += ctx.flat(sh, '#1a0c30', { sw: 1.2, line: '#c084fc' });
    // the dagger at the end of the stroke, flying along the tangent
    const dg = dagger(ctx, { y0: 108, y1: 196, bw: 9, gw: 20, tf: { rot: -78, ox: 150, oy: 150, tx: 88, ty: 64 } });
    s += ctx.cel(dg.blade, M.steel, { ss: [0, 4], hl: 1.6, rw: 2, sw: 1.8 });
    s += ctx.line(dg.edge, '#ffffff', 1.2, 0.8);
    s += ctx.cel(dg.grip, M.leather, { ss: [-3, 0], lite: true, sw: 1.4 });
    s += ctx.cel(dg.guard, M.gold, { ss: [-4, -3], lite: true, sw: 1.4 });
    s += ctx.cel(dg.pommel, M.violet, { ss: [-3, -3], lite: true, sw: 1.4 });
    s += sparkle(250, 206, 12, '#ffffff') + sparkle(40, 92, 6, '#f3e2ff', 0.9);
    return s;
  },
};

// ======================= SERENA =======================

// 暗蚀术 - a corroding dark bolt: a black sphere wrapped in violet fire dives from the upper-left,
// its flames swept back and flakes of the night peeling away behind it.
SUBJECTS.serena_darkbolt = {
  focus: [160, 150], orbits: false,
  draw(ctx) {
    let s = '';
    const cx = 176, cy = 170, R = 44;
    // comet trail toward the upper-left
    s += ctx.flat(`M${cx - 30} ${cy - 40}L8 6L${cx - 44} ${cy + 26}Z`, '#7c6bff', { op: 0.45 });
    s += ctx.flat(`M${cx - 28} ${cy - 26}L30 26L${cx - 32} ${cy + 14}Z`, '#c9a2ff', { op: 0.55 });
    s += circle(cx, cy, 74, `fill="${ctx.rg('co', cx, cy, 74, [[0.5, '#b58cff', 0.9], [0.75, '#7c6bff', 0.35], [1, '#7c6bff', 0]])}"`);
    // flames swept back off the trailing half
    let fl = '', fl2 = '';
    for (let i = 0; i < 9; i++) {
      const a = 120 + i * 24, b0 = pol(cx, cy, R - 2, a - 11), b1 = pol(cx, cy, R - 2, a + 11);
      const back = Math.max(0, Math.cos((a - 225) * D2R));
      const L = 22 + back * 70 + ctx.rand() * 14;
      const tip = [b0[0] + Math.cos(225 * D2R) * L + Math.cos(a * D2R) * 12, b0[1] + Math.sin(225 * D2R) * L + Math.sin(a * D2R) * 12];
      const mid = [(b0[0] + tip[0]) / 2 + Math.cos((a + 90) * D2R) * 8, (b0[1] + tip[1]) / 2 + Math.sin((a + 90) * D2R) * 8];
      const seg = `M${pt(b0)}Q${pt(mid)} ${pt(tip)}Q${pt([(b1[0] + tip[0]) / 2, (b1[1] + tip[1]) / 2])} ${pt(b1)}Z`;
      if (i % 2) fl2 += seg; else fl += seg;
    }
    s += `<path d="${fl}" fill="#9a7af0" opacity=".95"/><path d="${fl2}" fill="#e2d2ff"/>`;
    // erosion flakes peeling off backward
    let fk = '';
    for (const [x, y, q, a] of [[118, 120, 6, 20], [100, 150, 5, -30], [136, 98, 4, 60], [86, 118, 4, 10], [128, 210, 4, -10], [214, 110, 4, 40], [70, 92, 3, 0]]) fk += xf(rhomb(0, 0, q * 0.7, q * 1.3), { tx: x, ty: y, rot: a, ox: 0, oy: 0 });
    s += ctx.flat(fk, '#0a0618', { sw: 1.3, line: '#c9a2ff' });
    // black core with a bright bow-shock on the leading edge
    s += circle(cx, cy, R, `fill="${ctx.rg('core', cx + 12, cy + 12, 54, [[0, '#030208'], [0.75, '#100826'], [1, '#2e1c66']])}" stroke="#f4efff" stroke-width="2.6"`);
    s += `<path d="${eArc(cx, cy, R + 7, R + 7, 0, -0.35, 1.9)}" fill="none" stroke="#f6f0ff" stroke-width="3.4" opacity=".9"/>`;
    s += `<path d="${eArc(cx, cy, R + 14, R + 14, 0, -0.1, 1.6)}" fill="none" stroke="#c9a2ff" stroke-width="2" opacity=".7"/>`;
    s += ctx.line(`M${cx - 28} ${cy + 8}C${cx - 20} ${cy - 24} ${cx + 22} ${cy - 24} ${cx + 22} ${cy + 2}C${cx + 22} ${cy + 18} ${cx + 2} ${cy + 20} ${cx - 4} ${cy + 6}C${cx - 8} ${cy - 4} ${cx + 4} ${cy - 8} ${cx + 8} ${cy - 2}`, '#7458d8', 2.6, 0.85);
    s += sparkle(cx + 30, cy + 34, 8, '#ffffff', 0.95);
    return s;
  },
};

// 虚空观测者 - an armillary eye: silver lids crowned with fine silver lashes (like Serena's
// pendant), a star-track iris, two orbit bands strung with moon-phase beads, over a rift.
SUBJECTS.serena_observer = {
  focus: [150, 132], orbits: false,
  draw(ctx) {
    let s = '';
    const cx = 150, cy = 134;
    // void rift + beam
    s += `<path d="M118 252Q150 180 182 252Z" fill="${ctx.rg('rift', 150, 250, 54, [[0, '#b58cff', 0.55], [1, '#b58cff', 0]])}"/>`;
    s += `<ellipse cx="150" cy="252" rx="62" ry="10" fill="#04030c" stroke="#b58cff" stroke-width="1.8"/>`;
    // back halves of the rings
    const R1 = [cx, cy + 2, 126, 30, -15], R2 = [cx, cy + 6, 112, 26, 21];
    const band = (R, t0, t1, w) => ctx.line(eArc(...R, t0, t1), M.silver[3], w + 2.6) + ctx.line(eArc(...R, t0, t1), M.silver[1], w) + ctx.line(eArc(...R, t0 + 0.15, t1 - 0.15), M.silver[2], w * 0.35, 0.85);
    s += band(R1, Math.PI, Math.PI * 2, 4.4) + band(R2, Math.PI, Math.PI * 2, 3.4);
    // silver lash crown (long fine spikes) + short lower lashes
    let la = '';
    for (let i = 0; i < 11; i++) {
      const a = 196 + i * 14.8, L = [30, 40, 50, 58, 64, 66, 64, 58, 50, 40, 30][i];
      const b = pol(cx, cy + 40, 92, a), t = pol(cx, cy + 40, 92 + L * 0.62, a);
      la += `M${pt(pol(b[0], b[1], 2.8, a + 90))}L${pt(t)}L${pt(pol(b[0], b[1], 2.8, a - 90))}Z`;
    }
    for (let i = 0; i < 5; i++) {
      const a = 62 + i * 14, b = pol(cx, cy - 34, 90, a), t = pol(cx, cy - 34, 104, a);
      la += `M${pt(pol(b[0], b[1], 2.2, a + 90))}L${pt(t)}L${pt(pol(b[0], b[1], 2.2, a - 90))}Z`;
    }
    s += ctx.flat(la, '#e4e6f6', { sw: 1.2, line: M.silver[3] });
    s += `<ellipse cx="${cx}" cy="${cy}" rx="96" ry="70" fill="#b58cff" opacity=".45"${ctx.blur(14)}/>`;
    // eye opening (dark void sclera) with the iris
    const scl = `M${cx - 70} ${cy}Q${cx} ${cy - 66} ${cx + 70} ${cy}Q${cx} ${cy + 62} ${cx - 70} ${cy}Z`;
    ctx.defs.push(`<clipPath id="${ctx.p('scl')}"><path d="${scl}"/></clipPath>`);
    s += `<path d="${scl}" fill="#130e36"/><g clip-path="url(#${ctx.p('scl')})">`;
    s += circle(cx, cy, 34, `fill="${ctx.rg('iris', cx - 9, cy - 11, 42, [[0, '#f6eeff'], [0.38, '#b58cff'], [1, '#3e2690']])}"`);
    let ticks = '';
    for (let i = 0; i < 24; i++) ticks += `M${pt(pol(cx, cy, 27, i * 15))}L${pt(pol(cx, cy, 27 - (i % 3 ? 3 : 6), i * 15))}`;
    s += circle(cx, cy, 27, 'fill="none" stroke="#efe9ff" stroke-width="1.1" opacity=".85"') + ctx.line(ticks, '#efe9ff', 1, 0.85);
    s += `<ellipse cx="${cx}" cy="${cy}" rx="7.5" ry="16" fill="#08051a"/>` + sparkle(cx, cy, 5.5, '#efe9ff', 0.95);
    s += `<path d="M${cx - 80} ${cy - 34}Q${cx} ${cy - 6} ${cx + 80} ${cy - 34}V${cy - 70}H${cx - 80}Z" fill="#08051a" opacity=".45"/>`;
    s += circle(cx - 13, cy - 13, 5.5, 'fill="#fff" opacity=".9"') + '</g>';
    // silver lids: upper and lower crescents around the opening
    const up = `M${cx - 86} ${cy + 2}Q${cx} ${cy - 96} ${cx + 86} ${cy + 2}L${cx + 70} ${cy}Q${cx} ${cy - 66} ${cx - 70} ${cy}Z`;
    const lo = `M${cx - 86} ${cy + 2}Q${cx} ${cy + 86} ${cx + 86} ${cy + 2}L${cx + 70} ${cy}Q${cx} ${cy + 62} ${cx - 70} ${cy}Z`;
    s += ctx.cel(up, M.silver, { ss: [-8, 8], hl: 2.4, rw: 3, sw: 2.2 });
    s += ctx.cel(lo, M.silver, { ss: [-8, -6], hl: 1.6, rw: 3, sw: 2.2 });
    s += ctx.line(`M${cx - 62} ${cy - 16}Q${cx} ${cy - 66} ${cx + 62} ${cy - 16}`, M.silver[1], 1.2, 0.8);
    // front halves of the rings + moon beads
    s += band(R1, 0, Math.PI, 4.4) + band(R2, 0, Math.PI, 3.4);
    const beads = [[R1, 0.3, 1], [R1, 1.5, 0.5], [R1, 2.75, -0.5], [R2, 0.85, 0.25], [R2, 2.2, -0.25], [R1, 4.3, 0.75]];
    for (const [R, t, kph] of beads) {
      const [x, y] = ePt(...R, t);
      s += circle(x, y, 9, `fill="${M.silver[3]}"`) + phaseDisc(x, y, 7.4, kph, '#f4efff', '#2a2266');
    }
    s += sparkle(cx + 100, cy - 60, 6, '#efe9ff', 0.85) + sparkle(cx - 104, cy + 44, 4, '#efe9ff', 0.7);
    return s;
  },
};

// ------------------------------------------------------------------ people helpers
/** open hand, palm to the viewer, fingers up; fingerless glove over the palm. local scale q */
function palmHand(ctx, x, y, q, rot, skin, glove) {
  const T = (d) => xf(d, { tx: x, ty: y, s: q, rot, ox: 0, oy: 0 });
  let f = '';
  for (const [fx, len, a] of [[-8.4, 20, -9], [-2.8, 24, -3], [2.8, 23, 3], [8.4, 18, 10]]) f += `M${fx} -8L${r(fx + Math.sin(a * D2R) * len)} ${r(-8 - Math.cos(a * D2R) * len)}`;
  f += 'M10 4Q17 -2 20 -9';
  const fw = 5.8 * q;
  let s = ctx.line(T(f), skin[3], r(fw + 2.8)) + ctx.line(T(f), skin[0], r(fw)) + ctx.line(xf(f, { tx: x + 1.2, ty: y + 0.6, s: q, rot, ox: 0, oy: 0 }), skin[1], r(fw * 0.35), 0.7);
  s += ctx.cel(T(sm([[-12, -9], [-4, -11], [4, -11], [12, -8], [13, 4], [9, 15], [-9, 15], [-13, 4]])), glove, { ss: [-4, -3], hl: 1.2, rw: 1.6, sw: 1.6 });
  s += ctx.line(T('M-11 -8Q0 -11 11 -7M-12 10H12'), glove[1], 1.2, 0.9);
  return s;
}

/** gloved fist around a vertical grip, knuckles to the viewer; centre (x,y), scale q, rot deg */
function fist(ctx, x, y, q, rot, m, more = []) {
  const all = [[x, y, q, rot], ...more];
  const T = (d) => all.map(([X, Y, Q, R]) => xf(d, { tx: X, ty: Y, s: Q, rot: R, ox: 0, oy: 0 })).join('');
  let s = ctx.cel(T(sm([[-15, -10], [-5, -14], [7, -14], [16, -9], [17, 2], [14, 12], [2, 15], [-10, 14], [-16, 5]])), m, { ss: [-4, -4], hl: 1.4, rw: 1.6, sw: 1.8 });
  s += ctx.line(T('M-14 -2Q1 0 16 -1M-13 6Q1 8 15 7'), m[1], 1.2, 0.9);
  s += ctx.flat(T(sm([[-16, -7], [-4, -12], [9, -11], [13, -6], [2, -3], [-11, -1]])), m[0], { sw: 1.4, line: m[3] });
  return s;
}
/**
 * Hood + cloak as ONE shape with a cut-out: arch around the face that narrows at the chin
 * and opens down the chest. cx = centre, top = hood peak y, w = hood half width,
 * fo = [face half width, opening apex y, chin y], sh = shoulder half width.
 */
function mantle(cx, top, w, fo, sh = 100) {
  const [fw, oy, chin] = fo;
  const outer = sm([[cx - sh - 4, 300, 1], [cx - sh + 6, 226], [cx - sh * 0.7, 182], [cx - w, chin - 30], [cx - w * 1.02, top + 50], [cx - w * 0.72, top + 14], [cx - w * 0.15, top], [cx + w * 0.2, top - 1], [cx + w * 0.76, top + 16], [cx + w * 1.02, top + 52], [cx + w, chin - 30], [cx + sh * 0.7, 182], [cx + sh - 6, 226], [cx + sh + 4, 300, 1]]);
  const hole = sm([[cx - fw * 0.55, 302, 1], [cx - fw * 0.62, chin + 30], [cx - fw * 0.82, chin + 4], [cx - fw, chin - 30], [cx - fw * 0.92, oy + 26], [cx - fw * 0.5, oy + 3], [cx, oy], [cx + fw * 0.5, oy + 3], [cx + fw * 0.92, oy + 26], [cx + fw, chin - 30], [cx + fw * 0.82, chin + 4], [cx + fw * 0.62, chin + 30], [cx + fw * 0.55, 302, 1]]);
  const head = sm([[cx - w * 0.96, chin + 10], [cx - w, top + 50], [cx - w * 0.7, top + 14], [cx, top + 1], [cx + w * 0.74, top + 16], [cx + w, top + 52], [cx + w * 0.96, chin + 10]]);
  return { d: outer + hole, outer, hole, head };
}

// 刺客学徒 - a masked apprentice in a violet hood raising her first dagger; behind her, her
// shadow on the night has already taken Lilith's shape - high ponytail, golden eyes.
SUBJECTS.lilith_apprentice = {
  focus: [150, 130], crescent: [70, 54, 22],
  draw(ctx) {
    let s = '';
    // Lilith-shaped shadow looming behind (right): head, high tie, S-curved ponytail, shoulder
    const shp = sm([[198, 112], [196, 90], [206, 72], [224, 64], [242, 70], [252, 88], [250, 110], [242, 128], [226, 138], [210, 132]]) + sm([[176, 300, 1], [184, 196], [208, 172], [212, 130, 1], [234, 130, 1], [240, 172], [276, 186], [300, 196], [300, 300, 1]])
      + limb(bez([230, 80], [246, 40], [290, 44], [290, 96], 6).concat(bez([290, 96], [290, 140], [270, 160], [282, 210], 4).slice(1)), [7, 9, 11, 11, 11, 10, 9, 7, 4, 1.4]);
    s += ctx.cel(shp, ['#0b0517', '#0b0517', '#3a2460', '#9a64e0'], { ss: 0, hl: 0, rw: 2.6, sw: 2, under: 1 });
    s += ctx.flat(xf('M-8 -4H8V4H-8Z', { tx: 232, ty: 80, rot: -60, ox: 0, oy: 0 }), '#d9a441');
    s += `<path d="M212 108h0M234 108h0" stroke="#d9a441" stroke-width="13" stroke-linecap="round" opacity=".3"/><path d="M206 110L220 104L218 112ZM240 110L226 104L228 112Z" fill="#ffd27a"/>`;
    s += '<g transform="matrix(1.1 0 0 1.1 -14 -30)">';
    const cx = 138, ey = 128, sc = 0.9;
    const mt = mantle(cx, 52, 56, [33, 78, 158], 92);
    const hair = ['#2b3b3c', '#18232a', '#58706c', '#081014'];
    s += ctx.flat(mt.head, '#0f0820');
    // vest showing through the opening
    s += ctx.flat(poly([[cx - 11, 140], [cx + 11, 140], [cx + 12, 166], [cx - 12, 166]]), M.skin[1], { sw: 1.6, line: M.skin[3] });
    s += ctx.cel(sm([[cx - 40, 300, 1], [cx - 36, 170], [cx, 160, 1], [cx + 36, 170], [cx + 40, 300, 1]]), M.black, { ss: [-10, 0], lite: true, sw: 0 });
    s += ctx.line(`M${cx - 16} 176L${cx} 210L${cx + 16} 176M${cx} 210V300`, M.gold[1], 1.6, 0.85);
    s += ctx.flat(rhomb(cx, 218, 6, 8), M.gold[0], { sw: 1.4, line: M.gold[3] });
    s += ctx.flat(sm([[cx - 31, 150], [cx - 34, 110], [cx - 26, 84], [cx, 76], [cx + 26, 84], [cx + 34, 110], [cx + 31, 150]]), hair[1], { sw: 1.6, line: hair[3] });
    s += face(ctx, cx, ey, sc, { look: 0.22, eye: '#d9b04a', angry: true, mask: M.black, brow: 0.4 });
    const fringe = sm([[cx - 31, 118, 1], [cx - 30, 96], [cx - 16, 82], [cx + 6, 78], [cx + 26, 86], [cx + 33, 110, 1], [cx + 22, 98], [cx + 14, 106, 1], [cx + 6, 94], [cx - 6, 108, 1], [cx - 12, 96], [cx - 22, 114, 1]]);
    s += ctx.cel(fringe, hair, { ss: [-6, -5], hl: 1.6, rw: 1.6, sw: 1.8 });
    s += ctx.cel(mt.d, M.shadow, { ss: [-14, -6], hl: 2.2, rw: 2.6, eo: 1 });
    s += ctx.line(sm([[cx - 18, 300], [cx - 21, 190], [cx - 27, 162], [cx - 33, 128], [cx - 30, 100], [cx - 16, 81], [cx, 78], [cx + 16, 81], [cx + 30, 100], [cx + 33, 128], [cx + 27, 162], [cx + 21, 190], [cx + 18, 300]], false), '#d9a441', 1.4, 0.8);
    s += ctx.line(`M${cx - 52} 190Q${cx - 60} 240 ${cx - 56} 300M${cx + 54} 192Q${cx + 62} 240 ${cx + 60} 300`, M.shadow[1], 2, 0.8);
    // raised dagger + fist + sleeve
    s += ctx.cel(sm([[76, 300, 1], [72, 262], [82, 238], [106, 240], [114, 266], [122, 300, 1]]), M.shadow, { ss: [-8, 0], hl: 1.6, rw: 2 });
    const dg = dagger(ctx, { y0: 110, y1: 250, bw: 10, gw: 22, tf: { rot: 166, ox: 150, oy: 150, tx: -58, ty: 82 } });
    s += `<path d="${dg.blade}" fill="#c084fc" stroke="#c084fc" stroke-width="10" opacity=".5"${ctx.blur(5)}/>`;
    s += ctx.cel(dg.blade, M.steel, { ss: [6, 0], hl: 1.6, rw: 2.2, sw: 1.8 }) + ctx.line(dg.edge, '#fff', 1.4, 0.8);
    s += ctx.flat(dg.guard, M.gold[0], { sw: 1.6, line: M.gold[3] });
    s += fist(ctx, 93, 232, 1, -8, M.leather);
    return s + '</g>';
  },
};

// 月蚀学徒 - a hooded acolyte of the eclipse reading an open tome; a tiny eclipse rises from
// its pages and a loose page lifts away (draw a card).
SUBJECTS.serena_acolyte = {
  focus: [150, 128], orbits: false,
  draw(ctx) {
    let s = '';
    const cx = 150, ey = 120, sc = 0.92;
    const hair = ['#d8d0f2', '#9a8fc8', '#ffffff', '#3a3262'];
    const mt = mantle(cx, 48, 58, [35, 72, 152], 96);
    s += ctx.flat(mt.head, '#0d0a2a');
    s += ctx.flat(poly([[cx - 10, 140], [cx + 10, 140], [cx + 11, 164], [cx - 11, 164]]), M.skin[1], { sw: 1.6, line: M.skin[3] });
    s += ctx.flat(sm([[cx - 42, 300, 1], [cx - 38, 168], [cx, 158, 1], [cx + 38, 168], [cx + 42, 300, 1]]), '#2a2158');
    s += ctx.line(`M${cx - 20} 170Q${cx} 186 ${cx + 20} 170`, '#efe9ff', 1.6, 0.7);
    // long hair falling inside the hood
    s += ctx.cel(sm([[cx - 30, 196, 1], [cx - 36, 150], [cx - 36, 108], [cx - 26, 82], [cx, 74], [cx + 26, 82], [cx + 36, 108], [cx + 36, 150], [cx + 30, 196, 1], [cx + 18, 160], [cx - 18, 160]]), hair, { ss: [-8, 0], lite: true, sw: 1.6 });
    s += face(ctx, cx, ey, sc, { look: -0.12, eye: '#9d7ae0', gaze: 0.6, brow: -0.6, lash: '#2a1a40', browC: '#6a5a96', rimC: '#c9b0ff', mouth: 'calm' });
    const fringe = sm([[cx - 33, 124, 1], [cx - 30, 96], [cx - 14, 80], [cx + 8, 78], [cx + 28, 88], [cx + 34, 122, 1], [cx + 22, 100], [cx + 12, 106, 1], [cx + 2, 94], [cx - 10, 108, 1], [cx - 16, 96], [cx - 26, 118, 1]]);
    s += ctx.cel(fringe, hair, { ss: [-6, -5], hl: 1.6, rw: 1.6, sw: 1.8 });
    s += ctx.cel(mt.d, M.robe, { ss: [-14, -6], hl: 2.2, rw: 2.6, eo: 1 });
    s += ctx.line(sm([[cx - 20, 300], [cx - 23, 190], [cx - 29, 156], [cx - 35, 122], [cx - 32, 96], [cx - 18, 76], [cx, 72], [cx + 18, 76], [cx + 32, 96], [cx + 35, 122], [cx + 29, 156], [cx + 23, 190], [cx + 20, 300]], false), '#efe9ff', 1.8, 0.85);
    s += phaseDisc(cx, 60, 6, 0.3, '#efe9ff', '#251c4e');
    // sleeves + open tome
    const slv = sm([[44, 300, 1], [46, 262], [62, 238], [92, 244], [104, 270], [100, 300, 1]]);
    s += ctx.cel(slv + mir(slv), M.robe, { ss: [-8, -4], hl: 1.8, rw: 2.2 });
    s += ctx.flat(poly([[76, 266], [150, 254], [224, 266], [228, 280], [150, 270], [72, 280]]), '#3a2060', { sw: 1.8, line: '#120822' });
    const pages = sm([[80, 262, 1], [94, 234], [146, 230], [150, 256, 1], [154, 230], [206, 234], [220, 262, 1], [150, 266, 1]]);
    s += ctx.cel(pages, ['#efe7d6', '#c4b8a4', '#ffffff', '#3a2e3c'], { ss: [0, 6], hl: 1.4, rw: 1.6, sw: 1.8 });
    s += ctx.line('M104 242Q124 238 140 242M102 250Q122 246 140 250M160 242Q178 238 196 242M160 250Q180 246 198 250', '#8a7aa8', 1.4, 0.7);
    s += ctx.flat('M84 258a5 4 0 1 1 10 2a5 4 0 1 1-10-2ZM206 260a5 4 0 1 1 10-2a5 4 0 1 1-10 2Z', M.skin[0], { sw: 1.3, line: M.skin[3] });
    // rising eclipse + lifting page
    s += circle(150, 204, 32, `fill="${ctx.rg('ec', 150, 204, 32, [[0.4, '#e6d6ff', 0.9], [1, '#b58cff', 0]])}"`);
    s += circle(150, 204, 13, 'fill="#120a2a" stroke="#f4efff" stroke-width="2"');
    s += ctx.line('M150 226V250', '#e6d6ff', 2, 0.5);
    s += ctx.cel(xf('M0 0L26 -4L30 30L4 34Z', { tx: 196, ty: 178, rot: 18, ox: 0, oy: 0 }), ['#f4eee2', '#c8bca8', '#ffffff', '#3a2e3c'], { ss: [-3, 3], lite: true, sw: 1.6 });
    s += phaseDisc(207, 196, 5, 0.6, '#b58cff', '#f4eee2');
    s += sparkle(222, 176, 6, '#ffffff', 0.9) + sparkle(108, 196, 4, '#efe9ff', 0.8);
    return s;
  },
};

/** tapered limb / ribbon through points with per-point half widths -> closed smooth path */
function limb(pts, ws) {
  const L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1;
    const nx = -dy / n, ny = dx / n, w = ws[Math.min(i, ws.length - 1)];
    L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
    R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  return sm([...L, ...R.reverse()]);
}
/** sample a cubic bezier into points */
function bez(p0, p1, p2, p3, n = 8) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
  }
  return out;
}

// 淬毒短刃 - an ink-green viper coiled around a short blade driven into a glowing poison
// pool; it rears from the guard with jaws wide and venom dripping from a fang.
SUBJECTS.lilith_poison = {
  focus: [150, 136], crescent: [70, 56, 20],
  draw(ctx) {
    let s = '';
    const snake = ['#35553f', '#1d3326', '#6f9c78', '#0a140e'];
    s += `<ellipse cx="150" cy="258" rx="78" ry="14" fill="${ctx.rg('pool', 150, 258, 78, [[0, '#c8f590', 0.9], [0.5, '#6fb83c', 0.5], [1, '#2f5a1a', 0]])}"/>`;
    s += `<path d="M116 256q4-10 8 0M172 260q3-8 6 0" fill="none" stroke="#e0ffad" stroke-width="1.6" opacity=".8"/>`;
    // helix around the blade (back / front halves)
    const hx = (t) => [150 + 40 * Math.cos(t), 150 + t * 7 + 12 * Math.sin(t)];
    let back = '', front = '', cur = [], curF = null;
    const flush = () => { if (cur.length > 1) { const d = sm(cur, false); if (curF) front += d; else back += d; } cur = []; };
    for (let i = 0; i <= 44; i++) {
      const t = (i / 44) * Math.PI * 2 * 2.05, f = Math.sin(t) > 0;
      if (curF !== null && f !== curF) { cur.push(hx(t)); flush(); }
      curF = f; cur.push(hx(t));
    }
    flush();
    const body = (d, w) => ctx.line(d, snake[3], w + 3.6) + ctx.line(d, snake[0], w) + `<path d="${d}" fill="none" stroke="#0f1d14" stroke-width="${w}" stroke-dasharray="5 9" stroke-linecap="butt" opacity=".8"/>` + ctx.line(d, '#b9d46a', w * 0.2, 0.9);
    s += body(back, 15);
    const dg = dagger(ctx, { y0: 34, y1: 262, bw: 15, gw: 40 });
    s += ctx.cel(dg.blade, M.steel, {
      ss: [-7, 0], hl: 2, rw: 2.4, sw: 2,
      inner: `<rect y="150" width="300" height="150" fill="${ctx.lg('pz', 0, 150, 0, 262, [[0, M.poison[0], 0], [0.6, M.poison[0], 0.75], [1, '#c8f590', 0.95]])}"/>`,
    });
    s += ctx.line(dg.edge, '#fff', 1.6, 0.8);
    s += ctx.flat(dg.grip, M.leather[0], { sw: 1.6, line: M.leather[3] }) + ctx.line('M144 52L156 58M144 64L156 70M144 76L156 82', M.gold[1], 1.4, 0.9);
    s += ctx.cel(dg.guard, M.gold, { ss: [-6, -5], hl: 1.6, sw: 1.8 });
    s += ctx.flat(dg.pommel, M.violet[0], { sw: 1.6, line: M.violet[3] });
    s += body(front, 15);
    // neck rising from the top coil
    const neck = 'M190 150C222 138 228 110 208 92';
    s += ctx.line(neck, snake[3], 19.6) + ctx.line(neck, snake[0], 16) + ctx.line('M200 148C220 136 226 116 218 102', '#c9d98a', 5, 0.55);
    // head (local: snout to -x), jaws open toward the viewer-left
    const H = (d) => xf(d, { tx: 198, ty: 84, s: 1.35, rot: 12, ox: 0, oy: 0 });
    s += ctx.flat(H('M-26 -6L-10 -3L12 -2L30 4L10 7L-8 14L-20 26Z'), '#8a2a52', { sw: 1.4, line: snake[3] });
    s += ctx.flat(H('M-22 -5L-19 9L-16 -4ZM-10 -3L-8 6L-5 -3ZM-16 21L-13 13L-11 19Z'), '#fbf4ff', { sw: 0.9, line: snake[3] });
    s += ctx.cel(H(sm([[34, -4], [24, -18], [2, -22], [-18, -16], [-27, -7, 1], [-8, -3], [14, -2], [32, 4]])), snake, { ss: [-5, -5], hl: 1.6, rw: 2, sw: 2 });
    s += ctx.cel(H(sm([[32, 6], [14, 9], [-6, 18], [-21, 27, 1], [-8, 14], [12, 5]])), snake, { ss: [-3, -3], lite: true, sw: 1.8 });
    s += ctx.line(H('M-16 -16Q2 -24 22 -15'), '#c9d96a', 2, 0.85);
    s += ctx.flat(H('M2 -12Q9 -18 16 -12Q9 -7 2 -12Z'), '#ffd96e', { sw: 1, line: '#3a2a08' }) + ctx.line(H('M9 -17V-8'), '#1a0a0a', 1.5);
    s += circle(...H('M-18 -12').match(/-?\d+/g).map(Number), 1.6, `fill="${snake[3]}"`);
    const [fx, fy] = H('M-19 9').match(/-?\d+/g).map(Number);
    s += ctx.flat(dropD(fx, fy + 12, 1.3), M.poison[0], { sw: 1.2, line: M.poison[3] }) + circle(fx - 1, fy + 10, 1.5, `fill="${M.poison[2]}"`);
    s += sparkle(fx, fy + 2, 5, '#e9ffd0', 0.9);
    return s;
  },
};

// 影舞 - dance on the blade's edge: a shadow dancer mid-pirouette, twin daggers out, ringed by
// a whirl of crescent cuts that slice every way at once; a drawn card flips up in the wind.
SUBJECTS.lilith_shadowdance = {
  focus: [150, 146], crescent: false,
  draw(ctx) {
    let s = '';
    const cx = 150, cy = 152;
    // bright backlight so the dark dancer pops
    s += circle(cx, cy, 84, `fill="${ctx.rg('bl', cx, cy - 10, 84, [[0, '#f4e8ff', 0.95], [0.45, '#c084fc', 0.6], [1, '#7c4fc0', 0]])}"`);
    // whirl of crescent cuts
    let cuts = '';
    for (let i = 0; i < 6; i++) {
      const a0 = i * 60 + 10, R0 = 88 + (i % 2) * 12;
      cuts += `M${pt(pol(cx, cy, R0, a0))}Q${pt(pol(cx, cy, R0 + 22, a0 + 30))} ${pt(pol(cx, cy, R0, a0 + 62))}Q${pt(pol(cx, cy, R0 + 3, a0 + 36))} ${pt(pol(cx, cy, R0, a0))}Z`;
    }
    s += `<path d="${cuts}" fill="#c084fc" opacity=".8"${ctx.blur(4)}/>`;
    s += ctx.flat(cuts, '#f6eeff');
    s += circle(cx, cy, 72, 'fill="none" stroke="#d9a441" stroke-width="1.4" stroke-dasharray="16 10" opacity=".7"');
    // the dancer: one solid silhouette (head r11, torso 3 heads, limbs ~2 heads)
    const sil = ['#150b26', '#0c0618', '#3c2860', '#08040e'];
    s += ctx.cel(limb(bez([148, 150], [118, 166], [96, 146], [70, 172], 6), [5, 6.5, 7, 6, 5, 3, 1]), M.violet, { ss: [0, 4], lite: true, sw: 1.6 });
    const parts = [
      limb([[150, 104], [148, 124], [147, 144], [148, 158]], [10.5, 11.5, 8.5, 11]),
      limb([[137, 113], [115, 95], [95, 77]], [6, 5, 4]),
      limb([[163, 113], [189, 116], [213, 108]], [6, 5, 4]),
      limb([[145, 158], [147, 204], [150, 244], [151, 257]], [10, 6.5, 4, 2.4]),
      limb([[155, 160], [190, 180], [156, 202]], [10, 6.5, 4.2]),
      limb([[150, 108], [150, 98]], [4.5, 4.5]),
    ];
    s += ctx.cel(parts.join(''), sil, { ss: [-5, -3], hl: 1.6, rw: 2.8, sw: 1.8, line: '#08040e', under: 1 });
    // golden high ponytail whipping round + head
    s += ctx.cel(limb(bez([154, 82], [178, 60], [208, 68], [220, 96], 7), [4, 6, 6.4, 6, 5, 3.6, 2, 0.6]), M.lilHair, { ss: [-3, 3], lite: true, sw: 1.6 });
    s += ctx.cel('M139 92a11 12 0 1 1 22 0a11 12 0 1 1-22 0Z', sil, { ss: [-3, -2], hl: 1.4, rw: 2.4, sw: 1.8, line: '#08040e' });
    s += ctx.flat('M150 79L158 77L160 85L152 87Z', '#d9a441', { sw: 1, line: '#3d2508' });
    // twin daggers
    for (const [x, y, a] of [[96, 78, -138], [212, 108, -14]]) {
      const T = (d) => xf(d, { tx: x, ty: y, rot: a, ox: 0, oy: 0 });
      s += ctx.flat(T('M2 -3.4L32 -1.4L42 0L32 1.4L2 3.4Z'), '#eef0fb', { sw: 1.4, line: '#171a30' });
      s += ctx.flat(T('M-1 -7L3 -7L3 7L-1 7Z'), M.gold[0], { sw: 1, line: M.gold[3] });
    }
    // drawn card flipping up
    const C = (d) => xf(d, { tx: 222, ty: 34, rot: 16, ox: 0, oy: 0 });
    s += ctx.cel(C('M0 0L30 -5L36 36L6 41Z'), ['#2a1a44', '#1a1030', '#6a4aa0', '#0a0614'], { ss: [-3, 3], hl: 1.4, rw: 2, sw: 1.8, line: '#d9a441' });
    s += ctx.flat(C(rhomb(18, 18, 7, 10)), '#d9a441');
    s += sparkle(258, 44, 6, '#fff', 0.9) + sparkle(80, 118, 5, '#f1e4ff', 0.9) + sparkle(224, 222, 5, '#f1e4ff', 0.8);
    return s;
  },
};

// 瓦尔哈拉刺客 - a Valhalla house assassin behind a black lacquer mask with gold crescent eye
// slits and the winged house sigil; violet scarf streaming back as she rushes in, knife reversed.
SUBJECTS.lilith_assassin = {
  focus: [152, 132], crescent: [228, 52, 22],
  draw(ctx) {
    let s = '';
    const cx = 152;
    s += ctx.line('M10 120H90M20 150H80M4 196H70M230 70H296M244 120H296', '#e9d2ff', 1.6, 0.3);
    // scarf streaming back to the left
    s += ctx.cel(limb(bez([132, 168], [90, 150], [60, 190], [8, 160], 9), [10, 11, 12, 12, 11, 10, 9, 8, 7, 6]), M.violet, { ss: [0, 6], hl: 1.6, rw: 0, sw: 2 });
    s += ctx.cel(limb(bez([134, 176], [96, 196], [64, 222], [16, 214], 8), [8, 9, 9, 9, 8, 7, 6, 5, 4]), ['#7a4cc0', '#4d2a86', '#b08ae8', '#200a3c'], { ss: [0, 5], lite: true, sw: 2 });
    const mt = mantle(cx, 50, 56, [33, 76, 156], 92);
    s += circle(cx, 112, 74, `fill="${ctx.rg('gw', cx, 112, 74, [[0, '#c084fc', 0.75], [1, '#c084fc', 0]])}"`);
    s += ctx.flat(mt.head, '#0a0612');
    s += ctx.flat(sm([[cx - 40, 300, 1], [cx - 36, 170], [cx, 160, 1], [cx + 36, 170], [cx + 40, 300, 1]]), M.black[1]);
    s += ctx.line(`M${cx - 30} 186L${cx + 30} 214M${cx - 30} 204L${cx + 30} 232`, M.leather[2], 3, 0.8);
    // lacquer mask (turned slightly right)
    const mask = sm([[cx - 26, 92], [cx - 4, 82], [cx + 22, 86], [cx + 32, 108], [cx + 28, 134], [cx + 12, 154], [cx + 2, 160, 1], [cx - 12, 150], [cx - 24, 130], [cx - 30, 108]]);
    s += ctx.cel(mask, ['#242033', '#141220', '#6a6488', '#05040a'], { ss: [-7, -3], hl: 2, rw: 2.6, sw: 2.2 });
    s += ctx.line(`M${cx + 2} 84Q${cx + 4} 120 ${cx + 2} 158`, M.gold[0], 1.4, 0.9);
    s += ctx.flat(`M${cx - 22} 116Q${cx - 12} 106 ${cx - 2} 114Q${cx - 12} 112 ${cx - 22} 116ZM${cx + 26} 114Q${cx + 16} 105 ${cx + 6} 114Q${cx + 16} 111 ${cx + 26} 114Z`, '#ffd27a', { sw: 1.2, line: M.gold[3] });
    s += `<path d="M${cx - 12} 112h0M${cx + 16} 112h0" stroke="#ffd27a" stroke-width="12" stroke-linecap="round" opacity=".28"/>`;
    s += ctx.line(`M${cx - 20} 136Q${cx - 8} 142 ${cx} 140M${cx + 6} 140Q${cx + 14} 142 ${cx + 24} 134`, M.gold[1], 1.2, 0.8);
    s += ctx.flat(`M${cx + 2} 88L${cx + 6} 96L${cx + 2} 102L${cx - 2} 96Z`, M.gold[0], { sw: 1, line: M.gold[3] });
    s += ctx.flat(`M${cx - 2} 95Q${cx - 12} 88 ${cx - 20} 94Q${cx - 10} 94 ${cx - 2} 99ZM${cx + 6} 95Q${cx + 16} 88 ${cx + 24} 94Q${cx + 14} 94 ${cx + 6} 99Z`, M.gold[0], { sw: 1, line: M.gold[3] });
    s += ctx.cel(mt.d, M.black, { ss: [-14, -6], hl: 2.4, rw: 3.4, eo: 1 });
    s += ctx.line(sm([[cx - 18, 300], [cx - 21, 190], [cx - 27, 160], [cx - 33, 126], [cx - 30, 98], [cx - 16, 79], [cx, 76], [cx + 16, 79], [cx + 30, 98], [cx + 33, 126], [cx + 27, 160], [cx + 21, 190], [cx + 18, 300]], false), M.gold[0], 2, 0.9);
    s += ctx.line(`M${cx + 48} 176Q${cx + 74} 180 ${cx + 92} 204M${cx - 48} 176Q${cx - 74} 180 ${cx - 92} 204`, M.gold[1], 1.6, 0.7);
    // forearm from the lower right, reverse-grip knife pointing down-left across the body
    s += ctx.cel(limb([[cx + 104, 300], [cx + 82, 262], [cx + 58, 236]], [16, 13, 11]), M.black, { ss: [-6, -2], hl: 1.6, rw: 2.4 });
    s += ctx.line(`M${cx + 74} 262L${cx + 92} 248`, M.gold[0], 2, 0.9);
    const dg = dagger(ctx, { y0: 112, y1: 270, bw: 9, gw: 20, tf: { rot: 46, ox: 150, oy: 150, tx: 18, ty: 88 } });
    s += `<path d="${dg.blade}" fill="#c084fc" stroke="#c084fc" stroke-width="8" opacity=".5"${ctx.blur(5)}/>`;
    s += ctx.cel(dg.blade, M.steel, { ss: [0, 5], hl: 1.6, rw: 2, sw: 1.8 }) + ctx.line(dg.edge, '#fff', 1.4, 0.85);
    s += ctx.flat(dg.guard, M.gold[0], { sw: 1.4, line: M.gold[3] });
    s += fist(ctx, cx + 52, 230, 1, 46, M.leather);
    return s;
  },
};

// 暗影箭 - straight to the vital point: a black arrow with a gold broadhead and violet
// fletching, wreathed in shadow fire, punches through the centre of a gold target sigil.
SUBJECTS.lilith_shadowarrow = {
  focus: [156, 142], crescent: false, ringR: 106,
  draw(ctx) {
    let s = '';
    const tc = [206, 102];
    s += circle(tc[0], tc[1], 56, `fill="${ctx.rg('tg', tc[0], tc[1], 56, [[0, '#ffe2a0', 0.6], [1, '#d9a441', 0]])}"`);
    s += circle(tc[0], tc[1], 46, 'fill="none" stroke="#d9a441" stroke-width="2.6"') + circle(tc[0], tc[1], 33, 'fill="none" stroke="#d9a441" stroke-width="1.6" stroke-dasharray="7 4"') + circle(tc[0], tc[1], 18, 'fill="none" stroke="#ffe2a0" stroke-width="2.2"');
    let tk = '';
    for (let i = 0; i < 4; i++) { const a = i * 90 + 45; tk += `M${pt(pol(...tc, 40, a))}L${pt(pol(...tc, 60, a))}`; }
    s += ctx.line(tk, '#ffe2a0', 2.6);
    let ck = '';
    for (let i = 0; i < 7; i++) { const a = i * 51 + 10; ck += `M${pt(tc)}L${pt(pol(...tc, 16 + (i % 3) * 8, a + 8))}L${pt(pol(...tc, 30 + (i % 2) * 12, a))}`; }
    s += ctx.line(ck, '#fff6e0', 1.8, 0.9);
    // arrow along local +x from the tail (34,262) to the target centre
    const L = Math.hypot(tc[0] - 34, tc[1] - 262), ang = Math.atan2(tc[1] - 262, tc[0] - 34) / D2R;
    const P = (d) => xf(d, { tx: 34, ty: 262, rot: ang, ox: 0, oy: 0 });
    // shadow-fire tongues streaming back off the shaft
    let fl = '', fl2 = '';
    for (let i = 0; i < 9; i++) {
      const x = 30 + i * ((L - 70) / 8), side = i % 2 ? 1 : -1, len = 34 + (8 - i) * 3;
      const seg = `M${x + 12} 0Q${x - len * 0.3} ${side * 18} ${x - len} ${side * (14 + i)}Q${x - len * 0.4} ${side * 6} ${x - 6} 0Z`;
      if (i % 3 === 0) fl2 += seg; else fl += seg;
    }
    s += ctx.flat(P(fl), '#9a64e0', { op: 0.85 }) + ctx.flat(P(fl2), '#e2ccff', { op: 0.9 });
    s += ctx.flat(P(`M${L - 50} -6L-30 -20L-10 0L-30 20L${L - 50} 6Z`), '#c084fc', { op: 0.45 });
    // shaft, fletching, broadhead
    s += ctx.flat(P(`M8 -4H${L - 34}V4H8Z`), '#1d1430', { sw: 1.8, line: '#d4b0ff' });
    const fl3 = 'M8 -4L-10 -20L32 -18L44 -4Z';
    s += ctx.cel(P(fl3) + P(mapPath(fl3, (x, y) => [x, -y])), M.violet, { ss: [0, 2], hl: 1.4, rw: 0, sw: 1.8 });
    s += ctx.cel(P(`M${L - 40} -13L${L} 0L${L - 40} 13L${L - 30} 0Z`), M.gold, { ss: [-5, 4], hl: 1.8, rw: 2.2, sw: 2 });
    s += ctx.line(P(`M${L - 36} 0H${L - 6}`), M.gold[2], 1.4, 0.9);
    s += sparkle(tc[0], tc[1], 16, '#ffffff') + sparkle(tc[0] - 70, tc[1] + 40, 4, '#f3e2ff', 0.8);
    return s;
  },
};

// 夜刃游侠 - a hooded ranger leaps across a huge low moon above the spires, crescent blade
// drawn and cloak flaring - night is her ally.
SUBJECTS.lilith_nightblade = {
  focus: [150, 128], crescent: false, ringR: 114,
  draw(ctx) {
    let s = '';
    s += circle(150, 124, 120, `fill="${ctx.rg('mh', 150, 124, 120, [[0.6, '#f3d79a', 0.35], [1, '#f3d79a', 0]])}"`);
    s += circle(150, 124, 86, `fill="${ctx.rg('moon', 122, 96, 116, [[0, '#fff8e4'], [0.6, '#f6dca4'], [1, '#d3a560']])}"`);
    s += `<path d="M104 150a14 14 0 1 0 1 0ZM90 104a8 8 0 1 0 1 0ZM196 168a10 10 0 1 0 1 0ZM176 76a7 7 0 1 0 1 0Z" fill="#c99a52" opacity=".35"/>`;
    // spires
    s += ctx.flat('M-10 300V246L20 240V214L28 196L36 214V236L64 232V250L90 246V220L98 186L106 220V244L130 248V262L170 258V232L178 206L186 232V256L214 252V228L224 202L234 228V246L262 240V224L270 198L278 224V244L310 248V300Z', '#0b0616', { sw: 2, line: '#5a3a90' });
    s += ctx.flat('M96 228h4v6h-4zM176 240h4v6h-4zM222 236h4v6h-4z', '#ffd27a', { op: 0.8 });
    const sil = ['#1a0e2c', '#0e0718', '#4a3270', '#06030c'];
    // cloak trailing behind (behind the body)
    s += ctx.cel(sm([[178, 108], [146, 92], [108, 86], [74, 98], [56, 122], [80, 116], [72, 140], [100, 126], [104, 148], [128, 128], [152, 124]]), sil, { ss: [-5, -4], hl: 1.2, rw: 2.6, sw: 1.8 });
    // scarf tails
    s += ctx.cel(limb(bez([178, 104], [150, 98], [126, 72], [90, 66], 7), [4.5, 5, 5, 4.5, 4, 3, 2, 1]) + limb(bez([176, 108], [150, 112], [130, 96], [100, 98], 6), [3.5, 4, 4, 3.5, 3, 2, 1]), M.violet, { ss: [0, 3], lite: true, sw: 1.4 });
    // body in mid-leap (head r11, torso ~3 heads)
    const body = [
      limb([[180, 108], [166, 128], [150, 150]], [8.5, 10, 9]),
      limb([[152, 148], [186, 166], [176, 204], [186, 208]], [9, 6.5, 4, 3]),
      limb([[146, 152], [112, 170], [80, 164], [72, 170]], [9, 6.5, 4, 3]),
      limb([[184, 112], [206, 126], [228, 118]], [5.5, 4.6, 4]),
      limb([[174, 112], [154, 104], [136, 104]], [5.5, 4.6, 3.6]),
      // hooded head, point trailing back
      sm([[178, 86], [192, 86], [198, 98], [194, 108], [182, 112], [172, 104], [160, 98, 1], [170, 92]]),
    ];
    s += ctx.cel(body.join(''), sil, { ss: [-4, -3], hl: 1.4, rw: 2.8, sw: 1.8, under: 1 });
    s += ctx.flat('M190 96L197 94L196 99Z', '#ffd27a');
    s += ctx.line('M150 150L172 160M152 132L170 118', '#3c2860', 1.4, 0.9);
    // crescent blade
    const blade = 'M226 114C250 106 266 88 270 58C276 94 258 118 230 122Z';
    s += `<path d="${blade}" fill="#fff2cc" stroke="#fff2cc" stroke-width="6" opacity=".6"${ctx.blur(4)}/>`;
    s += ctx.cel(blade, M.steel, { ss: [3, 3], hl: 1.6, rw: 2, sw: 1.8 });
    s += ctx.flat('M220 106L230 104L234 122L224 124Z', M.gold[0], { sw: 1.2, line: M.gold[3] });
    s += sparkle(270, 60, 10, '#ffffff') + sparkle(132, 104, 4, '#ffe2a0', 0.9);
    return s;
  },
};

// 暗影领主 - lord of the gathered shadows: a towering crowned shade with a void face and twin
// violet eyes raises a taloned hand; lesser shadows with glowing eyes swarm at its feet.
SUBJECTS.lilith_shadowlord = {
  focus: [150, 128], crescent: false, ringR: 116,
  draw(ctx) {
    let s = '';
    const mant = sm([[150, 96, 1], [196, 120], [236, 150], [256, 196], [268, 252], [282, 300, 1], [248, 282], [228, 300, 1], [204, 278], [178, 300, 1], [150, 282], [122, 300, 1], [96, 278], [72, 300, 1], [52, 282], [18, 300, 1], [32, 252], [44, 196], [64, 150], [104, 120]]);
    s += ctx.cel(mant, M.shadow, { ss: [-20, -6], hl: 2, rw: 3 });
    s += ctx.flat('M150 200L172 282H128Z', '#120a22', { sw: 1.8, line: M.gold[0] });
    s += ctx.line('M120 150Q110 220 96 278M180 150Q192 220 204 278', M.shadow[1], 2.4, 0.9);
    s += `<path d="M140 236h0M160 236h0M136 256h0M164 256h0M150 270h0" stroke="#c084fc" stroke-width="4" stroke-linecap="round"/>`;
    // raised arm (behind the pauldron) with a taloned hand cradling violet fire
    s += ctx.cel(limb([[104, 172], [80, 140], [70, 112]], [13, 10, 8]), M.shadow, { ss: [-4, -4], hl: 1.6, rw: 2.4 });
    let tal = '';
    for (const [x, y, a] of [[58, 104, -150], [62, 96, -118], [72, 94, -78], [80, 100, -42]]) tal += xf('M-3 0Q-2 -14 4 -26Q3 -12 3 0Z', { tx: x, ty: y, rot: a + 90, ox: 0, oy: 0 });
    s += ctx.flat(tal, '#1a0e2c', { sw: 1.4, line: M.gold[0] });
    s += ctx.cel('M58 108a12 10 0 1 1 24 0a12 10 0 1 1-24 0Z', M.shadow, { ss: [-3, -3], lite: true, sw: 1.8 });
    s += circle(68, 72, 22, `fill="#c084fc" opacity=".6"${ctx.blur(6)}`);
    s += ctx.flat('M68 50C78 62 80 74 74 84C70 88 64 88 62 84C56 74 60 62 68 50Z', '#e9d2ff', { sw: 1.4, line: '#9a64e0' }) + sparkle(68, 76, 5, '#fff', 0.95);
    // spiked pauldrons
    const pau = sm([[112, 132], [80, 128], [58, 142], [40, 136, 1], [50, 156], [70, 172], [104, 166], [124, 150]]);
    s += ctx.cel(pau + mir(pau), M.black, { ss: [-8, -8], hl: 1.8, rw: 2.6 });
    s += ctx.line('M60 146Q86 136 116 142' + mir('M60 146Q86 136 116 142'), M.gold[0], 1.8, 0.9);
    s += ctx.flat(rhomb(150, 186, 13, 18), M.gold[0], { sw: 1.8, line: M.gold[3] });
    s += ctx.flat(rhomb(150, 186, 8, 12), '#c084fc', { sw: 1.2, line: '#2a0c44' }) + sparkle(147, 181, 3, '#fff', 0.9);
    // hood and void face
    const hood = sm([[150, 46], [178, 60], [194, 92], [196, 130], [178, 150], [150, 158], [122, 150], [104, 130], [106, 92], [122, 60]]);
    s += ctx.cel(hood, M.black, { ss: [-10, -6], hl: 2, rw: 2.8 });
    s += ctx.flat(sm([[150, 76], [172, 88], [180, 112], [172, 138], [150, 148], [128, 138], [120, 112], [128, 88]]), '#030108');
    s += `<path d="M136 112h0M164 112h0" stroke="#c084fc" stroke-width="16" stroke-linecap="round" opacity=".45"/>`;
    s += ctx.flat('M128 110L146 106L142 116ZM172 110L154 106L158 116Z', '#f0dcff', { sw: 1, line: '#c084fc' });
    const crown = 'M112 70L118 40L130 60L140 28L150 52L160 28L170 60L182 40L188 70Q150 58 112 70Z';
    s += ctx.cel(crown, M.gold, { ss: [-5, -4], hl: 1.6, rw: 2, sw: 1.8 });
    s += ctx.flat(rhomb(150, 60, 4, 6), '#c084fc');
    // lesser shadows: wisps with curling tails and eyes
    for (const [x, y, q, f] of [[46, 236, 1.05, 1], [250, 226, 1.15, -1], [196, 268, 0.8, -1], [92, 270, 0.75, 1], [150, 252, 0.6, 1]]) {
      const T = (d) => xf(d, { tx: x, ty: y, sx: q * f, sy: q, ox: 0, oy: 0 });
      s += ctx.flat(T('M0 -24C13 -20 18 -6 15 6C12 16 4 20 -4 26C-2 18 -10 18 -16 22C-12 14 -18 4 -16 -6C-13 -18 -8 -22 0 -24Z'), '#0d0618', { sw: 1.6, line: '#9a64e0' });
      s += ctx.flat(T('M-9 -2L-2 -4L-3 1ZM8 -2L1 -4L2 1Z'), '#e9d2ff');
    }
    return s;
  },
};

// 生命汲取 - "their blood, my strength": a crimson ribbon of life is wrung from a cracked
// heart-crystal and pours down into a moon-engraved silver chalice that glows with it.
SUBJECTS.serena_drain = {
  focus: [150, 140], orbits: false,
  draw(ctx) {
    let s = '';
    // cracked crimson crystal (the enemy's life) upper-left, shards breaking off
    s += circle(66, 62, 30, `fill="#ff5a7a" opacity=".45"${ctx.blur(8)}`);
    s += ctx.cel(rhomb(66, 62, 20, 28), ['#e0405e', '#9a1e3a', '#ff9aae', '#3a0614'], { ss: [-6, -6], hl: 1.8, rw: 2, sw: 2, rim: '#ffb3c2' });
    s += ctx.line('M60 42L68 58L62 66L72 80M68 58L78 56', '#3a0614', 1.6, 0.9);
    s += ctx.flat(rhomb(96, 42, 4, 6) + rhomb(40, 92, 3, 5), '#e0405e', { sw: 1, line: '#3a0614' });
    // the ribbon: arcs over and pours straight down into the cup
    const rib = bez([84, 70], [170, 30], [234, 70], [206, 112], 8).concat(bez([206, 112], [188, 136], [150, 116], [150, 150], 5).slice(1));
    const ws = rib.map((_, i) => 3 + Math.sin(((i + 1) / rib.length) * Math.PI * 0.9) * 10);
    s += ctx.flat(limb(rib, ws), '#ff5a7a', { op: 0.5, attr: ctx.blur(4) });
    s += ctx.flat(limb(rib, ws), '#e63e64', { sw: 1.2, line: '#ffb3c2' });
    s += ctx.flat(limb(rib, ws.map((w) => w * 0.35)), '#ffd2dc', { op: 0.9 });
    // chalice (bigger, centred)
    const sil = M.silver;
    const C = (d) => xf(d, { s: 1.18, ox: 150, oy: 200 });
    s += ctx.cel(C(sm([[112, 250, 1], [118, 238], [140, 232], [146, 214], [144, 200, 1], [156, 200, 1], [154, 214], [160, 232], [182, 238], [188, 250, 1]])), sil, { ss: [-6, -4], hl: 1.8, rw: 2.4, sw: 2 });
    s += ctx.flat(C(sm([[150, 196, 1], [164, 200], [170, 208], [164, 214], [150, 216, 1], [136, 214], [130, 208], [136, 200]])), sil[0], { sw: 1.8, line: sil[3] });
    s += ctx.cel(C(sm([[100, 150, 1], [200, 150, 1], [196, 172], [182, 190], [164, 198], [136, 198], [118, 190], [104, 172]])), sil, { ss: [-14, -6], hl: 2.2, rw: 2.8, sw: 2.2 });
    for (const [x, k] of [[121, 0.35], [150, 1], [179, -0.35]]) s += circle(x, 176, 8.6, `fill="${sil[3]}"`) + phaseDisc(x, 176, 7, k, '#b58cff', '#2a2266');
    s += ctx.line(C('M108 160Q150 166 192 160'), sil[1], 1.4, 0.9);
    s += `<ellipse cx="150" cy="141" rx="59" ry="12" fill="${ctx.rg('lq', 150, 141, 59, [[0, '#ffe2ea'], [0.5, '#ff6b8a'], [1, '#b8306a']])}" stroke="${sil[3]}" stroke-width="2.2"/>`;
    let hm = '';
    for (const [x, y, q] of [[124, 116, 4], [178, 104, 5], [196, 132, 3], [112, 96, 3]]) hm += `M${x - q} ${y}H${x + q}M${x} ${y - q}V${y + q}`;
    s += ctx.line(hm, '#ffe6f0', 2.2, 0.9);
    s += sparkle(150, 146, 7, '#fff', 0.95) + sparkle(84, 70, 5, '#ffe2ea', 0.9);
    return s;
  },
};

// 月蚀先知 - the seer of three endings: a veiled oracle with long moon-white hair under a
// crescent circlet; three moons - waxing, full, waning - hang over her like three futures.
SUBJECTS.serena_oracle = {
  focus: [150, 128], orbits: false,
  draw(ctx) {
    let s = '';
    const cx = 150, ey = 130, sc = 0.95;
    const hair = ['#e4ddf6', '#a69dcc', '#ffffff', '#3a3262'];
    // three moons on an arc
    s += `<path d="M66 70Q150 6 234 70" fill="none" stroke="#efe9ff" stroke-width="1" stroke-dasharray="3 5" opacity=".6"/>`;
    for (const [x, y, rr, k] of [[70, 66, 13, 0.35], [150, 40, 18, 1], [230, 66, 13, -0.35]]) {
      s += circle(x, y, rr * 2, `fill="${ctx.rg('m' + x, x, y, rr * 2, [[0.4, '#e6d6ff', 0.6], [1, '#b58cff', 0]])}"`);
      s += phaseDisc(x, y, rr, k, '#f6f2ff', '#2a2266');
    }
    // hair mass behind
    s += ctx.cel(sm([[cx - 46, 300, 1], [cx - 50, 220], [cx - 44, 150], [cx - 40, 104], [cx - 26, 78], [cx, 70], [cx + 26, 78], [cx + 40, 104], [cx + 44, 150], [cx + 50, 220], [cx + 46, 300, 1]]), hair, { ss: [-10, 0], hl: 0, rw: 2.4 });
    // robe with silver high collar
    s += ctx.flat(poly([[cx - 10, 146], [cx + 10, 146], [cx + 11, 166], [cx - 11, 166]]), M.skin[1], { sw: 1.6, line: M.skin[3] });
    s += ctx.cel(sm([[cx, 168, 1], [192, 178], [226, 198], [240, 240], [244, 300, 1], [56, 300, 1], [60, 240], [74, 198], [108, 178]]), M.robe, { ss: [-22, -4], hl: 2 });
    s += ctx.cel(sm([[cx - 26, 182], [cx - 20, 160, 1], [cx + 20, 160, 1], [cx + 26, 182], [cx, 190]]), M.robe, { ss: [-5, -3], lite: true, sw: 1.8 });
    s += ctx.line(`M${cx - 25} 180L${cx} 188L${cx + 25} 180`, '#efe9ff', 1.8, 0.95);
    s += ctx.line('M96 200Q120 214 128 250M204 200Q180 214 172 250', '#c9c0ef', 1.6, 0.8);
    s += ctx.flat(rhomb(cx, 214, 8, 12), '#b58cff', { sw: 1.6, line: M.silver[3] }) + circle(cx, 214, 3, 'fill="#fff"');
    s += face(ctx, cx, ey, sc, { look: 0, veil: ['#5a46a8', '#3a2c80', '#efe9ff', '#1a1240'], mouth: 'calm', mouthW: 4 });
    s += ctx.line(`M${cx - 4} ${ey + 20}Q${cx} ${ey + 22} ${cx + 4} ${ey + 20}`, '#c46a86', 1.2, 0.6);
    // fringe + long side locks over the shoulders
    const fringe = sm([[cx - 36, 132, 1], [cx - 32, 100], [cx - 16, 82], [cx + 6, 78], [cx + 26, 86], [cx + 36, 130, 1], [cx + 26, 106], [cx + 16, 110, 1], [cx + 6, 96], [cx - 6, 108, 1], [cx - 14, 96], [cx - 26, 114, 1]]);
    s += ctx.cel(fringe, hair, { ss: [-6, -5], hl: 1.6, rw: 1.6, sw: 1.8 });
    const lock = sm([[cx - 30, 108], [cx - 40, 150], [cx - 38, 200], [cx - 48, 250, 1], [cx - 30, 210], [cx - 28, 160], [cx - 24, 120]]);
    s += ctx.cel(lock + mir(lock), hair, { ss: [-4, -3], hl: 1.4, rw: 1.8, sw: 1.8 });
    s += ctx.line(`M${cx - 34} 140Q${cx - 36} 190 ${cx - 42} 236M${cx + 34} 140Q${cx + 36} 190 ${cx + 42} 236M${cx - 44} 170Q${cx - 46} 230 ${cx - 44} 290M${cx + 44} 170Q${cx + 46} 230 ${cx + 44} 290`, hair[1], 1.3, 0.8);
    // crescent circlet + sheer veil falling behind
    s += ctx.line(`M${cx - 34} 96Q${cx} 84 ${cx + 34} 96`, M.silver[0], 3, 1) + ctx.line(`M${cx - 34} 96Q${cx} 84 ${cx + 34} 96`, M.silver[3], 0.8, 0.8);
    s += `<path d="M${cx - 6} 72A12 12 0 1 0 ${cx + 10} 88A10 10 0 1 1 ${cx - 6} 72Z" fill="#f6f2ff" stroke="${M.silver[3]}" stroke-width="1.4"/>`;
    s += ctx.flat(`M${cx - 36} 98C${cx - 64} 140 ${cx - 70} 220 ${cx - 84} 300H${cx - 50}C${cx - 46} 220 ${cx - 40} 150 ${cx - 30} 104ZM${cx + 36} 98C${cx + 64} 140 ${cx + 70} 220 ${cx + 84} 300H${cx + 50}C${cx + 46} 220 ${cx + 40} 150 ${cx + 30} 104Z`, '#9d86e8', { op: 0.35 });
    s += sparkle(198, 30, 5, '#fff', 0.8) + sparkle(100, 30, 4, '#fff', 0.7);
    return s;
  },
};

// 虚空吞噬 - return to nothing: a black hole with a blazing tilted accretion disc swallows a
// broken sword and shield shards, stretching them into streaks as they fall in.
SUBJECTS.serena_void = {
  focus: [150, 138], orbits: false, ringR: 116,
  draw(ctx) {
    let s = '';
    const cx = 150, cy = 140, rot = -10;
    const disc = (t0, t1, rx, ry, w, c, op) => `<path d="${eArc(cx, cy, rx, ry, rot, t0, t1)}" fill="none" stroke="${c}" stroke-width="${w}" opacity="${op}"/>`;
    // back half of the disc + lensed arc above the hole
    s += disc(Math.PI, Math.PI * 2, 126, 30, 16, '#7c6bff', 0.5) + disc(Math.PI, Math.PI * 2, 120, 27, 8, '#d9c8ff', 0.9) + disc(Math.PI, Math.PI * 2, 112, 24, 2.4, '#ffffff', 0.9);
    s += `<path d="${eArc(cx, cy - 4, 62, 54, rot, Math.PI * 1.06, Math.PI * 1.94)}" fill="none" stroke="#e6d6ff" stroke-width="7" opacity=".85"/>`;
    s += circle(cx, cy, 60, `fill="#b58cff" opacity=".55"${ctx.blur(10)}`);
    // the hole + photon ring
    s += circle(cx, cy, 44, 'fill="#000" stroke="#fff6ff" stroke-width="2.6"') + circle(cx, cy, 48, 'fill="none" stroke="#b58cff" stroke-width="2" opacity=".8"');
    // front half of the disc
    s += disc(0, Math.PI, 126, 30, 16, '#7c6bff', 0.55) + disc(0, Math.PI, 120, 27, 8, '#efe4ff', 0.95) + disc(0.3, Math.PI - 0.3, 112, 24, 2.6, '#ffffff', 1);
    // debris falling in: broken sword (two pieces), shield shards, stones - each with a streak
    const piece = (d, x, y, a, sc, fill, line) => ctx.flat(xf(d, { tx: x, ty: y, rot: a, s: sc, ox: 0, oy: 0 }), fill, { sw: 1.4, line });
    s += ctx.line('M262 64Q232 74 214 92M44 210Q70 214 92 196M248 214Q226 200 208 184M60 74Q84 86 98 104', '#e6d6ff', 2, 0.5);
    s += piece('M-22 -4L14 -4L22 0L14 4L-22 4Z', 222, 86, 36, 1.2, '#dfe2f4', '#262a46');
    s += piece('M-14 -3L10 -3L10 3L-14 3ZM10 -9L14 -9L14 9L10 9Z', 252, 60, 30, 1.2, '#cfd3ea', '#262a46') + piece('M14 -2h8v4h-8Z', 252, 60, 30, 1.2, '#e6b452', '#3d2508');
    s += piece('M0 -12L14 -6L10 10L-6 8Z', 92, 198, -20, 1.1, '#c13b4c', '#3a0814') + piece('M0 -10L10 -2L4 10L-8 4Z', 66, 214, 10, 0.9, '#e6b452', '#3d2508');
    s += piece('M-6 -6L6 -4L4 6L-6 4Z', 204, 186, 20, 1, '#5e5a82', '#100e22') + piece('M-5 -5L5 -3L3 5L-5 3Z', 102, 104, 0, 1, '#5e5a82', '#100e22');
    s += sparkle(cx - 46, cy - 10, 7, '#fff', 0.9);
    return s;
  },
};

// 暗月新星 - the eclipse descends: a black moon flares a violet corona and rains shards of
// starlight; a shockwave ring races across the ground below.
SUBJECTS.serena_nova = {
  focus: [150, 100], orbits: false, ringR: 96,
  draw(ctx) {
    let s = '';
    const cx = 150, cy = 96;
    // shockwave rings on the ground
    for (const [rx, ry, w, op] of [[150, 30, 3, 0.35], [104, 20, 3, 0.55], [62, 12, 2.6, 0.8]]) s += `<ellipse cx="150" cy="238" rx="${rx}" ry="${ry}" fill="none" stroke="#d9c8ff" stroke-width="${w}" opacity="${op}"/>`;
    s += `<ellipse cx="150" cy="238" rx="48" ry="9" fill="#efe4ff" opacity=".55"/>`;
    // falling star shards fanning down to the ground
    let fs = '', heads = '';
    for (const [x1, y1] of [[54, 226], [92, 250], [130, 262], [172, 262], [210, 250], [248, 226], [150, 236]]) {
      const a = Math.atan2(y1 - cy, x1 - cx), n = [Math.cos(a + Math.PI / 2), Math.sin(a + Math.PI / 2)];
      const x0 = cx + Math.cos(a) * 62, y0 = cy + Math.sin(a) * 62;
      fs += `M${r(x0 - n[0] * 1.2)} ${r(y0 - n[1] * 1.2)}L${r(x1 - n[0] * 3.6)} ${r(y1 - n[1] * 3.6)}L${r(x1 + Math.cos(a) * 6)} ${r(y1 + Math.sin(a) * 6)}L${r(x1 + n[0] * 3.6)} ${r(y1 + n[1] * 3.6)}L${r(x0 + n[0] * 1.2)} ${r(y0 + n[1] * 1.2)}Z`;
      heads += sparkle(x1, y1, 6, '#ffffff', 0.95);
    }
    s += ctx.flat(fs, '#e6d6ff', { op: 0.85 }) + heads;
    // corona: blurred glow, long spikes, bright ring
    s += circle(cx, cy, 64, `fill="#c9a2ff"${ctx.blur(10)}`);
    s += rays(cx, cy, 16, 40, 96, 4, '#efe4ff', 0.85, 4);
    s += rays(cx, cy, 16, 40, 70, 6, '#b58cff', 0.9, 15);
    s += circle(cx, cy, 44, 'fill="#fbf8ff"');
    // the black moon (slightly offset for a diamond-ring flash)
    s += circle(cx + 3, cy + 2, 40, `fill="${ctx.rg('bm', cx - 6, cy - 8, 46, [[0, '#1a1240'], [1, '#04030c']])}"`);
    s += sparkle(cx - 32, cy - 26, 13, '#ffffff');
    s += `<path d="${eArc(cx, cy, 52, 52, 0, -2.4, -0.5)}" fill="none" stroke="#fff" stroke-width="1.4" opacity=".7"/>`;
    return s;
  },
};

// 深渊吞噬者 - the abyss stares back: a star-skinned leviathan rears out of a void rift, gulper
// jaws gaping over needle fangs, a moon-lure glowing before its row of violet eyes.
SUBJECTS.serena_devourer = {
  focus: [150, 128], orbits: false, ringR: 114,
  draw(ctx) {
    let s = '';
    const skin = ['#2c2670', '#171344', '#6a62c8', '#07061c'];
    // rift
    s += `<ellipse cx="176" cy="260" rx="92" ry="18" fill="#03020a" stroke="#b58cff" stroke-width="2.4"/>`;
    s += `<ellipse cx="176" cy="258" rx="80" ry="12" fill="none" stroke="#efe4ff" stroke-width="1" opacity=".6"/>`;
    // dorsal sail of fin-spines along neck and skull (behind)
    let sp = '';
    const back = bez([226, 252], [250, 190], [236, 120], [180, 76], 8);
    back.forEach(([x, y], i) => { if (i > 0 && i < 8) { const a = -60 - i * 9, L = 30 + Math.sin((i / 8) * Math.PI) * 18; sp += `M${pt(pol(x, y, 6, a - 90))}L${pt(pol(x, y, L, a + 8))}L${pt(pol(x, y, 6, a + 90))}Z`; } });
    s += ctx.flat(sp, '#8f86e0', { sw: 1.6, line: '#1a1446', op: 0.95 });
    // neck: starry skin, lighter belly line
    const neck = bez([180, 262], [236, 214], [232, 140], [176, 104], 8);
    let st = '';
    for (let i = 0; i < 20; i++) st += `M${Math.round(150 + ctx.rand() * 100)} ${Math.round(100 + ctx.rand() * 160)}h0`;
    s += ctx.cel(limb(neck, [30, 30, 29, 28, 27, 26, 26, 27, 28]), skin, { ss: [-12, -2], hl: 2, rw: 3, inner: `<path d="${st}" stroke="#efe9ff" stroke-width="2" stroke-linecap="round" opacity=".85"/>` });
    s += ctx.line(sm(neck.map(([x, y], i) => [x - 18 + i * 0.4, y + 4]), false), '#a39ae8', 3, 0.55);
    // head in profile facing left: upper skull, gaping lower jaw, glowing gullet
    s += ctx.flat(sm([[98, 100], [150, 96], [196, 104], [190, 132], [150, 150], [104, 158]]), '#05030f');
    s += `<ellipse cx="176" cy="122" rx="24" ry="18" fill="${ctx.rg('gl', 176, 122, 24, [[0, '#f4ecff'], [0.45, '#b58cff'], [1, '#2a1a6a', 0]])}"/>`;
    let fu = '', fl = '';
    for (let i = 0; i < 7; i++) { const x = 104 + i * 12, h = 14 - i * 0.8; fu += `M${x - 3.4} ${98 + i * 0.6}L${x + 1} ${r(98 + h)}L${x + 3.4} ${98 + i * 0.6}Z`; }
    for (let i = 0; i < 6; i++) { const x = 110 + i * 13, y = 154 - i * 2.4, h = 13 - i * 0.6; fl += `M${x - 3.4} ${r(y)}L${x - 1} ${r(y - h)}L${x + 3.4} ${r(y)}Z`; }
    s += ctx.flat(fu + fl, '#f6f2ff', { sw: 1.1, line: '#1a1446' });
    const jaw = sm([[200, 120], [190, 140], [160, 156], [126, 166], [96, 168, 1], [106, 158], [140, 152], [176, 138]]);
    const skull = sm([[92, 100, 1], [110, 84], [142, 70], [180, 66], [208, 78], [218, 100], [206, 118], [190, 108], [150, 98], [116, 98]]);
    s += ctx.cel(jaw + skull, skin, { ss: [-8, -6], hl: 2.2, rw: 3 });
    // row of eyes
    let ey = '';
    for (const [x, y, q] of [[150, 84, 5.6], [167, 80, 4.8], [182, 82, 4]]) ey += `M${r(x - q * 1.5)} ${y}Q${x} ${r(y - q)} ${r(x + q * 1.5)} ${y}Q${x} ${r(y + q)} ${r(x - q * 1.5)} ${y}Z`;
    s += `<path d="${ey}" fill="#c9a2ff" opacity=".7"${ctx.blur(3)}/>` + ctx.flat(ey, '#f4e8ff', { sw: 1, line: '#b58cff' });
    // moon-lure dangling before the jaws
    s += ctx.line('M138 72C120 40 84 34 70 58', '#8f86e0', 2.6) + ctx.line('M138 72C120 40 84 34 70 58', '#1a1446', 0.8, 0.6);
    s += circle(70, 70, 22, `fill="#e6d6ff" opacity=".7"${ctx.blur(3)}`);
    s += circle(70, 70, 11, 'fill="#fbf8ff" stroke="#b58cff" stroke-width="2"') + phaseDisc(70, 70, 7, 0.55, '#fbf8ff', '#c9b6ff');
    s += sparkle(56, 56, 5, '#fff', 0.9);
    return s;
  },
};

// 静月封界 - seal every observation: a still full moon locked behind a silver seal-circle,
// an eight-point star and a stitched-shut eye at its heart, bound by crossing chains of light.
SUBJECTS.serena_seal = {
  focus: [150, 138], orbits: false, ringR: 118,
  draw(ctx) {
    let s = '';
    const cx = 150, cy = 138;
    s += circle(cx, cy, 104, `fill="${ctx.rg('mh', cx, cy, 104, [[0.6, '#e6d6ff', 0.4], [1, '#b58cff', 0]])}"`);
    s += circle(cx, cy, 80, `fill="${ctx.rg('moon', cx - 24, cy - 26, 104, [[0, '#ffffff'], [0.55, '#ece6ff'], [1, '#b9addf']])}"`);
    s += `<path d="M118 112a12 12 0 1 0 1 0ZM178 166a9 9 0 1 0 1 0ZM186 104a7 7 0 1 0 1 0ZM124 176a6 6 0 1 0 1 0Z" fill="#a89cd6" opacity=".35"/>`;
    // seal circle
    const ln = '#3b2f8a';
    s += circle(cx, cy, 102, `fill="none" stroke="${ln}" stroke-width="5" opacity=".9"`) + circle(cx, cy, 102, 'fill="none" stroke="#efe9ff" stroke-width="2"');
    s += circle(cx, cy, 90, `fill="none" stroke="#efe9ff" stroke-width="1.4"`);
    let tk = '';
    for (let i = 0; i < 48; i++) { const a = i * 7.5; tk += `M${pt(pol(cx, cy, 92, a))}L${pt(pol(cx, cy, i % 2 ? 96 : 100, a))}`; }
    s += ctx.line(tk, '#efe9ff', 1.2, 0.85);
    // eight-point star (two squares) + inner ring
    const sq = (a0) => poly([0, 1, 2, 3].map((i) => pol(cx, cy, 88, a0 + i * 90)));
    s += ctx.flat(sq(0) + sq(45), 'none', { sw: 4.6, line: ln, attr: ' opacity=".55"' }) + ctx.flat(sq(0) + sq(45), 'none', { sw: 1.8, line: '#7a5ad8' });
    s += circle(cx, cy, 44, `fill="none" stroke="${ln}" stroke-width="2.2"`) + circle(cx, cy, 38, 'fill="none" stroke="#7a5ad8" stroke-width="1" stroke-dasharray="3 3"');
    for (let i = 0; i < 8; i++) { const [x, y] = pol(cx, cy, 88, i * 45); s += circle(x, y, 7, `fill="${ln}"`) + phaseDisc(x, y, 5.4, [1, 0.6, 0.3, 0.1, -0.1, -0.3, -0.6, -1][i], '#efe9ff', '#2a2266'); }
    // chains of light crossing
    const chain = (x0, y0, x1, y1) => {
      const n = 12, a = Math.atan2(y1 - y0, x1 - x0) / D2R;
      let d = '', d2 = '';
      for (let i = 0; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * i) / n;
        const e = `<ellipse cx="${r(x)}" cy="${r(y)}" rx="12" ry="${i % 2 ? 3 : 6}" transform="rotate(${r(a)} ${r(x)} ${r(y)})"/>`;
        if (i % 2) d2 += e; else d += e;
      }
      return `<g fill="none" stroke="#3b2f8a" stroke-width="5">${d}${d2}</g><g fill="none" stroke="#f6f2ff" stroke-width="2.2">${d}${d2}</g>`;
    };
    s += chain(14, 30, 286, 246) + chain(286, 30, 14, 246);
    // stitched-shut eye at the heart
    s += circle(cx, cy, 26, `fill="#efe9ff" stroke="${ln}" stroke-width="2.4"`);
    s += ctx.line(`M${cx - 18} ${cy}Q${cx} ${cy + 12} ${cx + 18} ${cy}`, ln, 3);
    s += ctx.line(`M${cx - 12} ${cy - 2}l-2 10M${cx - 4} ${cy + 1}l-1 10M${cx + 4} ${cy + 1}l1 10M${cx + 12} ${cy - 2}l2 10M${cx - 10} ${cy + 2}l4 6M${cx + 10} ${cy + 2}l-4 6`, ln, 1.6);
    s += ctx.line(`M${cx - 18} ${cy - 6}Q${cx} ${cy - 14} ${cx + 18} ${cy - 6}`, '#7a5ad8', 1.4, 0.8);
    s += sparkle(cx - 54, cy - 56, 8, '#fff', 0.95);
    return s;
  },
};

// 莉莉丝·瓦尔哈拉 - "your head is mine": Lilith in black-gold light armour, golden high
// ponytail whipping behind her, twin daggers crossed in an X before a burst of violet shadow.
SUBJECTS.lilith_hero = {
  focus: [150, 130], crescent: [242, 44, 18], ringR: 122, bgLite: 1, rays: false,
  draw(ctx) {
    let s = '';
    const cx = 154, ey = 110, sc = 1.1;
    const hair = M.lilHair;
    // shadow burst: curved flame tongues swirling out from behind her
    let bt = '';
    for (let i = 0; i < 9; i++) {
      const a = -100 + i * 40, L = 132 + (i % 3) * 14;
      const b0 = pol(150, 150, 60, a - 16), b1 = pol(150, 150, 60, a + 16), tip = pol(150, 150, L, a + 14);
      bt += `M${pt(b0)}Q${pt(pol(150, 150, L * 0.7, a - 6))} ${pt(tip)}Q${pt(pol(150, 150, L * 0.62, a + 16))} ${pt(b1)}Z`;
    }
    s += ctx.flat(bt, '#2b1250', { sw: 1.8, line: '#9a64e0', op: 0.95 }) + circle(150, 150, 66, 'fill="#2b1250"');
    // ponytail: tied at the crown, S-curve down the left with a split tip
    const tail = bez([140, 56], [112, 14], [50, 20], [40, 90], 6).concat(bez([40, 90], [30, 140], [62, 176], [32, 236], 5).slice(1));
    const tail2 = bez([46, 132], [40, 160], [74, 186], [66, 222], 4);
    s += ctx.cel(limb(tail, [6, 9, 12, 14, 14, 14, 14, 13, 11, 8, 5, 1.5]) + limb(tail2, [7, 7, 6, 4, 1.2]), hair, { ss: [7, -3], hl: 2, rw: 2.4, sw: 2 });
    s += ctx.line(sm(tail.slice(1, 9).map(([x, y], i) => [x + 4, y + 3 - i * 0.2]), false), hair[1], 1.4, 0.85);
    // body in one dark piece: cape (right) + torso + pauldron + high collar
    const body = sm([[cx, 156, 1], [194, 164], [226, 182], [240, 220], [244, 300, 1], [60, 300, 1], [64, 220], [80, 182], [114, 164]])
      + sm([[194, 166], [234, 170], [266, 206], [282, 258], [292, 300, 1], [224, 300, 1], [212, 236]])
      + sm([[cx - 18, 148, 1], [cx + 18, 148, 1], [cx + 22, 168], [cx, 176], [cx - 22, 168]]);
    s += ctx.flat(poly([[cx - 10, 136], [cx + 10, 136], [cx + 11, 160], [cx - 11, 160]]), M.skin[1], { sw: 1.6, line: M.skin[3] });
    s += ctx.cel(body, M.black, { ss: [-16, -4], hl: 1.8, rw: 2.6 });
    s += ctx.flat(sm([[188, 174], [214, 162], [238, 174], [250, 204], [226, 198], [198, 196]]), M.black[0], { sw: 2, line: M.gold[0] });
    s += ctx.line(`M234 170Q268 206 288 296M200 186Q222 176 244 194M${cx - 20} 166Q${cx} 174 ${cx + 20} 166`, M.gold[0], 1.8, 0.95);
    // flat angular chest plate (armour, not anatomy)
    s += ctx.flat(poly([[120, 186], [cx, 178], [188, 186], [184, 208], [cx, 216], [124, 208]]), M.dkSteel[0], { sw: 2, line: M.dkSteel[3] });
    s += ctx.flat(poly([[cx, 198], [184, 196], [184, 208], [cx, 216], [124, 208], [122, 196]]), M.dkSteel[1]);
    s += ctx.line(`M122 188L${cx} 180L186 188M${cx} 182V214`, M.gold[0], 1.6, 0.95);
    // hair behind the head, face, side locks, fringe, tie
    s += ctx.flat(sm([[cx - 36, 144], [cx - 40, 104], [cx - 32, 70], [cx - 6, 54], [cx + 24, 58], [cx + 40, 86], [cx + 40, 132], [cx + 32, 152]]), hair[1], { sw: 1.8, line: hair[3] });
    s += face(ctx, cx, ey, sc, { look: 0.16, eye: '#e2a72e', angry: true, mouth: 'smirk', brow: 0.2, lash: '#2a1408', browC: '#7a4a12', rimC: '#e2b4ff' });
    const lock = sm([[cx - 30, 88], [cx - 38, 128], [cx - 38, 160], [cx - 46, 186, 1], [cx - 30, 164], [cx - 26, 126]]) + sm([[cx + 30, 90], [cx + 36, 126], [cx + 34, 152, 1], [cx + 26, 124]]);
    const fringe = sm([[cx - 34, 118, 1], [cx - 36, 88], [cx - 24, 64], [cx + 2, 54], [cx + 28, 58], [cx + 42, 82], [cx + 40, 110, 1], [cx + 32, 94], [cx + 24, 102, 1], [cx + 17, 86], [cx + 3, 98, 1], [cx - 4, 84], [cx - 17, 104, 1], [cx - 22, 90]]);
    s += ctx.cel(lock + fringe, hair, { ss: [-7, -6], hl: 2, rw: 2, sw: 2 });
    s += ctx.line(`M${cx - 20} 68Q${cx - 4} 60 ${cx + 14} 64`, hair[2], 1.8, 0.8);
    s += ctx.flat(xf('M-9 -5L9 -5L9 5L-9 5Z', { tx: 141, ty: 57, rot: -40, ox: 0, oy: 0 }), M.black[0], { sw: 1.6, line: M.gold[0] }) + ctx.flat(rhomb(141, 57, 3.6, 5), '#c084fc');
    // twin daggers crossed: forearms from the lower corners, blades up, crossing over the chest
    const arm = limb([[60, 300], [80, 276], [94, 262]], [15, 13, 11]);
    s += ctx.flat(arm + mir(arm), M.black[1], { sw: 2, line: M.black[3] });
    s += ctx.line('M74 284L90 270' + mir('M74 284L90 270'), M.gold[0], 2.4, 0.95);
    const dg = dagger(ctx, { y0: 100, y1: 252, bw: 10, gw: 22, tf: { rot: -135, ox: 150, oy: 150, tx: -40, ty: 92 } });
    const both = (d) => d + mir(d);
    s += `<path d="${both(dg.blade)}" fill="#c084fc" stroke="#c084fc" stroke-width="10" opacity=".55"${ctx.blur(5)}/>`;
    s += ctx.cel(both(dg.blade), M.steel, { ss: [0, 5], hl: 1.8, rw: 2.2, sw: 1.8 }) + ctx.line(both(dg.edge), '#fff', 1.4, 0.85);
    s += ctx.flat(both(dg.guard), M.gold[0], { sw: 1.6, line: M.gold[3] }) + ctx.flat(both(dg.pommel), '#c084fc', { sw: 1.4, line: '#2a0c44' });
    s += fist(ctx, 96, 256, 1, 45, M.leather, [[204, 256, 1, -45]]);
    s += sparkle(150, 202, 10, '#ffffff');
    return s;
  },
};

// 塞雷娜·诺克斯 - "observation complete - you lose": Serena raises her white-gloved hand
// and a void sigil answers; behind her head an eclipsed void moon burns like a halo.
SUBJECTS.serena_hero = {
  focus: [156, 120], orbits: false, ringR: 122, bgLite: 1, rays: false,
  draw(ctx) {
    let s = '';
    const cx = 158, ey = 114, sc = 1.1;
    const hair = M.serHair, robe = ['#2e2456', '#1b1538', '#5e4c9c', '#0a0820'];
    // void moon halo
    s += circle(166, 90, 94, `fill="${ctx.rg('vh', 166, 90, 94, [[0.62, '#e6d6ff', 0.95], [0.72, '#b58cff', 0.6], [1, '#7c6bff', 0]])}"`);
    s += rays(166, 90, 12, 60, 124, 3.8, '#efe4ff', 0.5, 3);
    s += circle(166, 90, 63, `fill="${ctx.rg('vm', 152, 74, 70, [[0, '#1c1448'], [1, '#05040f']])}" stroke="#fbf8ff" stroke-width="2.6"`);
    // long hair mass with moon-white tips
    const tips = ctx.lg('tips', 0, 214, 0, 294, [[0, '#efe9ff', 0], [1, '#efe9ff', 0.95]]);
    s += ctx.cel(sm([[cx - 60, 300, 1], [cx - 64, 236], [cx - 54, 160], [cx - 48, 108], [cx - 36, 70], [cx - 4, 50], [cx + 30, 56], [cx + 48, 88], [cx + 54, 150], [cx + 62, 230], [cx + 60, 300, 1]]), hair, { ss: [-12, 0], hl: 0, rw: 3, inner: `<rect y="200" width="300" height="100" fill="${tips}"/>` });
    // robe + high collar (one piece), shoulder embroidery, eyelid pendant
    s += ctx.flat(poly([[cx - 10, 138], [cx + 10, 138], [cx + 11, 162], [cx - 11, 162]]), M.skin[1], { sw: 1.6, line: M.skin[3] });
    s += ctx.cel(sm([[cx, 160, 1], [198, 170], [230, 192], [244, 236], [248, 300, 1], [68, 300, 1], [72, 236], [86, 192], [118, 170]]) + sm([[cx - 20, 146, 1], [cx + 20, 146, 1], [cx + 24, 170], [cx, 178], [cx - 24, 170]]), robe, { ss: [-20, -4], hl: 2 });
    s += ctx.line(`M${cx - 22} 168Q${cx} 176 ${cx + 22} 168M${cx - 26} 176Q${cx - 50} 184 ${cx - 70} 204M${cx + 26} 176Q${cx + 50} 184 ${cx + 70} 204`, '#d8dbee', 1.6, 0.9);
    s += `<path d="M${cx - 44} 186h0M${cx - 60} 196h0M${cx + 44} 186h0M${cx + 60} 196h0" stroke="#d8dbee" stroke-width="5"/>`;
    s += ctx.flat(`M${cx - 14} 214Q${cx} 202 ${cx + 14} 214Q${cx} 222 ${cx - 14} 214Z`, '#d8dbee', { sw: 1.6, line: '#262a46' });
    s += ctx.line(`M${cx - 10} 210l-3-6M${cx - 4} 207l-1-7M${cx + 4} 207l1-7M${cx + 10} 210l3-6`, '#d8dbee', 1.2) + ctx.line(`M${cx - 12} 214Q${cx} 220 ${cx + 12} 214`, '#262a46', 1.2);
    s += face(ctx, cx, ey, sc, { look: -0.18, eye: '#b58cff', lid: 0.42, lash: '#1a1030', browC: '#3a2a5a', brow: 0.6, mouth: 'calm', mouthW: 4, rimC: '#c9b0ff' });
    // straight bangs + long front lock
    const fringe = sm([[cx - 40, 120, 1], [cx - 38, 88], [cx - 24, 64], [cx + 2, 52], [cx + 30, 58], [cx + 44, 84], [cx + 42, 118, 1], [cx + 32, 100, 1], [cx + 22, 104, 1], [cx + 11, 94, 1], [cx, 102, 1], [cx - 11, 94, 1], [cx - 22, 104, 1], [cx - 30, 98, 1]]);
    const lock = sm([[cx - 36, 98], [cx - 44, 150], [cx - 44, 210], [cx - 54, 262, 1], [cx - 34, 216], [cx - 30, 150], [cx - 28, 108]]);
    s += ctx.cel(fringe + lock, hair, { ss: [-7, -6], hl: 2, rw: 2.2, sw: 2, inner: `<rect y="200" width="300" height="100" fill="${tips}"/>` });
    s += ctx.line(`M${cx - 26} 68Q${cx - 4} 58 ${cx + 20} 64`, hair[2], 1.8, 0.8);
    // braid (left side of her head) with the moon-phase ornament
    const bp = bez([cx + 36, 104], [cx + 44, 130], [cx + 36, 160], [cx + 42, 186], 6);
    let br = '';
    bp.forEach(([x, y], i) => { const a = i % 2 ? 30 : -30; br += xf('M0 -7C5 -5 6 3 0 7C-6 3 -5 -5 0 -7Z', { tx: x, ty: y, rot: a, s: 1.15, ox: 0, oy: 0 }); });
    s += ctx.flat(br, hair[0], { sw: 1.4, line: hair[3] }) + ctx.line(sm(bp.map(([x, y]) => [x + 3, y]), false), '#b58cff', 1.2, 0.7);
    s += circle(cx + 42, 198, 9.5, 'fill="#262a46"') + phaseDisc(cx + 42, 198, 7.6, 0.7, '#efe9ff', '#3a3262');
    // raised gloved hand with a void sigil
    s += ctx.cel(limb([[48, 300], [68, 256], [88, 212]], [18, 15, 12]), robe, { ss: [-5, -2], hl: 1.6, rw: 2.4 });
    s += ctx.line('M74 222L102 228', '#d8dbee', 2, 0.9);
    s += palmHand(ctx, 90, 192, 1.25, -12, M.skin, ['#f4f0ff', '#c4bce6', '#ffffff', '#3a3262']);
    s += circle(82, 128, 24, `fill="#b58cff" opacity=".6"${ctx.blur(6)}`);
    s += circle(82, 128, 16, 'fill="#07051a" stroke="#efe9ff" stroke-width="2"');
    s += sparkle(82, 128, 7, '#efe9ff');
    // two drawn cards drifting at her shoulder
    const C = (d) => xf(d, { tx: 232, ty: 228, rot: 14, ox: 0, oy: 0 }) + xf(d, { tx: 252, ty: 200, rot: 28, ox: 0, oy: 0 });
    s += ctx.flat(C('M-13 -18H13V18H-13Z'), '#2a2266', { sw: 1.6, line: '#efe9ff' });
    s += ctx.flat(C('M0 -8A8 8 0 1 0 0 8A6 8 0 1 1 0 -8Z'), '#efe9ff');
    return s;
  },
};

// ------------------------------------------------------------------ assemble + checks
function build(card) {
  const subj = SUBJECTS[card.id];
  if (!subj) return null;
  const ctx = makeCtx(card);
  const bg = background(ctx, subj);
  const body = subj.draw(ctx);
  const ov = overlays(ctx, subj);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs>${ctx.defs.join('')}</defs>${bg}<g stroke-linejoin="round" stroke-linecap="round">${body}</g>${ov}</svg>\n`;
  return minify(svg);
}

/** lossless text squeeze: #aabbcc -> #abc, 0.5 -> .5 (only where a separator precedes) */
function minify(svg) {
  return svg
    .replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3(?![0-9a-f])/gi, '#$1$2$3')
    .replace(/([ ,"A-Za-z(])0\.(\d)/g, '$1.$2')
    .replace(/([ ,"A-Za-z(])-0\.(\d)/g, '$1-.$2');
}

const FORBIDDEN = [/<script/i, /<foreignObject/i, /<text[\s>]/i, /<image[\s>]/i, /\son[a-z]+\s*=/i, /href\s*=\s*"(?!#)/i, /@import|@font-face/i, /<svg[^>]*\s(width|height)=/i];
function check(svg, id) {
  const issues = [];
  for (const re of FORBIDDEN) if (re.test(svg)) issues.push(`forbidden ${re}`);
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const bad = ids.filter((x) => !x.startsWith(id + '-'));
  if (bad.length) issues.push(`unprefixed ids ${bad.slice(0, 3)}`);
  if (new Set(ids).size !== ids.length) issues.push('duplicate ids');
  const nf = (svg.match(/<filter\s/g) || []).length;
  if (nf > 1) issues.push(`${nf} filters`);
  const bytes = Buffer.byteLength(svg);
  if (bytes > BUDGET) issues.push(`${(bytes / 1024).toFixed(1)}KB > 14KB`);
  return { bytes, issues };
}

const args = process.argv.slice(2);
const oi = args.indexOf('--only');
const only = oi >= 0 ? args[oi + 1].split(',') : null;
fs.mkdirSync(OUT, { recursive: true });
let n = 0, bad = 0;
for (const card of CARDS.filter((c) => CLASSES.includes(c.class))) {
  if (only && !only.includes(card.id)) continue;
  const svg = build(card);
  if (!svg) { console.warn(`[todo] ${card.id} has no subject yet`); continue; }
  const { bytes, issues } = check(svg, card.id);
  if (issues.length) bad++;
  fs.writeFileSync(path.join(OUT, `${card.id}.svg`), svg);
  n++;
  console.log(`${issues.length ? '!' : ' '} ${card.id.padEnd(20)} ${(bytes / 1024).toFixed(1)}KB ${issues.join('; ')}`);
}
console.log(`wrote ${n} card(s) -> ${path.relative(root, OUT)}${bad ? `  (${bad} with issues)` : ''}`);
