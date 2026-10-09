#!/usr/bin/env node
// Card art generator - NEUTRAL + LIA classes (base art, 300x300, no frame / no text).
//   node tools/art/cards/neutral-lia.mjs [--only n_wisp,lia_hero]
// Output: public/assets/cards/<cardId>.svg for every card whose class is neutral or lia.
// Zero dependencies. Every id is prefixed with the card id. <= 1 filter per card, <= 14KB.
//
// Layering per card:  class background -> rarity ornament -> back particles -> SUBJECT
//                     -> front particles -> moonlight wash -> vignette + bottom fade.
// Lighting canon (docs/ART-DIRECTION.md): moonlight from the upper-left (#e8ddff),
// class-coloured rim light on the right edge, cel shading (base + 1 shade + 1 light).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARDS } from '../../../cards/database.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const OUT = path.join(root, 'public/assets/cards');
const BUDGET = 14 * 1024;

// ------------------------------------------------------------------ numbers & paths
const r = (v) => {
  const x = Math.round(v * 10) / 10;
  return Object.is(x, -0) ? 0 : x;
};
const pt = (p) => `${Math.round(p[0])} ${Math.round(p[1])}`;

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
    // S reflects the previous control point (smooth joint) or, after M/L, starts at the current point (sharp joint)
    d += (prevC && !p1[2]) || (!prevC && p1[2]) ? `S${pt(c2)} ${pt(p2)}` : `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
    prevC = true;
  }
  return closed ? d + 'Z' : d;
}
/** straight polygon */
const poly = (pts, closed = true) => 'M' + pts.map(pt).join('L') + (closed ? 'Z' : '');

/** map every point of an absolute path (M L C Q S T H V Z only). */
function mapPath(d, fn) {
  if (/[a-z]/.test(d)) throw new Error(`mapPath: relative commands are not supported: ${d.slice(0, 40)}`);
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
  const c = Math.cos((rot * Math.PI) / 180), sn = Math.sin((rot * Math.PI) / 180);
  return mapPath(d, (x, y) => {
    const X = (x - ox) * sx, Y = (y - oy) * sy;
    return [ox + X * c - Y * sn + tx, oy + X * sn + Y * c + ty];
  });
}
const BIG = 'M-60 -60H360V360H-60Z';

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
const PAL = {
  night: '#070614', night2: '#0c0b1b', panel: '#17132e', moon: '#e8ddff', oath: '#ffd091', warm: '#ffb38a', abyss: '#0e1a3a',
  liaMain: '#ff6b7c', liaGold: '#ffd091', liaRed: '#c13b4c',
};
// material ramps: [base, shade, light, line]
const M = {
  steel: ['#9aa6bd', '#5a6680', '#e6edf8', '#151b2e'],
  darkSteel: ['#5d6884', '#373f57', '#a9b6d0', '#0f1424'],
  silver: ['#cfd5e2', '#8b93a8', '#ffffff', '#262a3c'],
  gold: ['#f2c06a', '#b07a2e', '#fff1c9', '#4a2a0c'],
  crimson: ['#c13b4c', '#7c1f33', '#ff8a96', '#2c0814'],
  wine: ['#7a1f33', '#4a1022', '#b8475c', '#22060f'],
  leather: ['#7a4e36', '#4f3022', '#b07a54', '#24130c'],
  wood: ['#8a5a36', '#5a3820', '#c08a5a', '#2a170b'],
  skin: ['#f6d4c0', '#d9a294', '#fff1e8', '#5a2c2a'],
  stone: ['#737d92', '#454e63', '#a9b4c8', '#161b2b'],
  cloth: ['#3d4a6e', '#252e4a', '#6b7ca8', '#0e1224'],
};

// ------------------------------------------------------------------ class themes
const THEME = {
  neutral: {
    bg: ['#34405c', '#18203a', '#080a16'], halo: '#c9d6f0', ring: '#aebbd6', rim: '#b9cdf2', mote: '#e6eeff',
    line: '#121829', ground: '#0d1222',
  },
  lia: {
    bg: ['#5a1526', '#250914', '#090410'], halo: '#ffb36b', ring: '#ffd091', rim: '#ff6b7c', mote: '#ffc27a',
    line: '#2a0812', ground: '#14060c',
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
    /** linear gradient: stops = [[offset, color, opacity?], ...] */
    lg(name, x1, y1, x2, y2, stops) {
      defs.push(`<linearGradient id="${id}-${name}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stopsXml(stops)}</linearGradient>`);
      return `url(#${id}-${name})`;
    },
    rg(name, cx, cy, rr, stops, fx, fy) {
      const f = fx != null ? ` fx="${fx}" fy="${fy}"` : '';
      defs.push(`<radialGradient id="${id}-${name}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${rr}"${f}>${stopsXml(stops)}</radialGradient>`);
      return `url(#${id}-${name})`;
    },
    /** gradients in objectBoundingBox units (fractions of the filled shape's box; defaults omitted) */
    rgb(name, stops, cx = 0.5, cy = 0.5, rr = 0.5) {
      const at = (k, v, d) => (v === d ? '' : ` ${k}="${r(v * 1000) / 1000}"`);
      defs.push(`<radialGradient id="${id}-${name}"${at('cx', cx, 0.5)}${at('cy', cy, 0.5)}${at('r', rr, 0.5)}>${stopsXml(stops)}</radialGradient>`);
      return `url(#${id}-${name})`;
    },
    lgb(name, x2, y2, stops) {
      defs.push(`<linearGradient id="${id}-${name}" x2="${x2}" y2="${y2}">${stopsXml(stops)}</linearGradient>`);
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
     * Cel-shaded shape. m = material ramp [base, shade, light, line] or {base,shade,light,line}.
     * o.ss   = [dx,dy] shift for the automatic form shadow (lower-right crescent)
     * o.hl   = width of the moonlight edge on upper-left (0 = none)
     * o.rim  = rim light colour on right edge (default class rim), o.rw = rim width (0 = none)
     * o.inner= extra markup drawn inside the clip (after the shadow)
     * o.sw   = outline width (0 = none)
     */
    cel(d, m, o = {}) {
      const [base, shade, light, line] = Array.isArray(m) ? m : [m.base, m.shade, m.light, m.line];
      const ss = o.ss ?? [-10, -8];
      const hl = o.hl ?? (o.lite ? 0 : 2.2);
      const rw = o.rw ?? (o.lite ? 0 : 2.4);
      const rim = o.rim ?? ctx.T.rim;
      const sw = o.sw ?? 2.4;
      const ln = o.line ?? line;
      if (!rw && !hl && !ss && !o.inner) return `<path d="${d}" fill="${base}"${sw ? ` stroke="${ln}" stroke-width="${sw}"` : ''}/>`;
      const pid = ctx.def(d);
      ctx.lastClip = `url(#${pid}a)`;
      const use = (a = '') => `<use href="#${pid}"${a}/>`;
      const clip = (suf, tr) => {
        defs.push(`<clipPath id="${pid}${suf}">${use(tr ? ` transform="translate(${tr})"` : '')}</clipPath>`);
        return `<g clip-path="url(#${pid}${suf})">`;
      };
      // bottom layer carries the outline (doubled: only the outer half stays visible)
      const fills = [rw && rim, hl && light, ss ? shade : base].filter(Boolean);
      let s = use(` fill="${fills[0]}"${sw ? ` stroke="${ln}" stroke-width="${2 * sw}"` : ''}`), close = '', f = 1;
      if (rw) { s += clip('b', `${-rw} ${r(rw * 0.3)}`) + (fills[f] ? use(` fill="${fills[f++]}"`) : ''); close += '</g>'; }
      if (hl) { s += clip('c', `${hl} ${hl}`) + (fills[f] ? use(` fill="${fills[f++]}"`) : ''); close += '</g>'; }
      if (ss || o.inner) { s += clip('a'); close += '</g>'; }
      if (ss) s += use(` fill="${base}" transform="translate(${ss[0]} ${ss[1]})"`);
      if (o.inner) s += o.inner;
      return s + close;
    },
    /** register a reusable path in <defs>, return its id */
    def(d) {
      const pid = `${id}-${k++}`;
      defs.push(`<path id="${pid}" d="${d}"/>`);
      return pid;
    },
    /** <use> of a defined path, optionally scaled by k about (ox, oy) */
    use(pid, fill, k = 1, ox = 150, oy = 150, extra = '', vert = false) {
      const kx = vert ? 1 : k;
      const tr = k === 1 ? '' : ` transform="matrix(${r(kx)} 0 0 ${r(k)} ${r(ox * (1 - kx))} ${r(oy * (1 - k))})"`;
      return `<use href="#${pid}" fill="${fill}"${tr}${extra}/>`;
    },
    /** flat shape with optional outline */
    flat(d, fill, o = {}) {
      const st = o.sw ? ` stroke="${o.line}" stroke-width="${o.sw}"` : '';
      const op = o.op != null ? ` opacity="${o.op}"` : '';
      return `<path d="${d}" fill="${fill}"${st}${op}${o.attr || ''}/>`;
    },
    line(d, color, w = 1.6, op = 1, cap = 'round') {
      return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}"${cap !== 'round' ? ` stroke-linecap="${cap}"` : ''}${op < 1 ? ` opacity="${op}"` : ''}/>`;
    },
  };
  return ctx;
}
function stopsXml(stops) {
  return stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null && a !== 1 ? ` stop-opacity="${a}"` : ''}/>`).join('');
}

// ------------------------------------------------------------------ shared drawing bits
/** 4-point sparkle star (compact relative path) */
function sparkle(x, y, s, color, op = 1) {
  const a = r(s), b = r(s * 0.22), c = r(a - b);
  return `<path d="M${r(x)} ${r(y - a)}q${b} ${c} ${a} ${a}q${-c} ${b} ${-a} ${a}q${-b} ${-c} ${-a} ${-a}q${c} ${-b} ${a} ${-a}z" fill="${color}"${op < 1 ? ` opacity="${r(op)}"` : ''}/>`;
}
/** rhombus (oath crystal) */
function rhomb(x, y, w, h) {
  return `M${r(x)} ${r(y - h)}L${r(x + w)} ${r(y)}L${r(x)} ${r(y + h)}L${r(x - w)} ${r(y)}Z`;
}
/** star dots: zero-length round-capped strokes, bucketed by size/opacity (cheap) */
function stars(ctx, n, color, box = [0, 0, 300, 200], maxR = 1.3) {
  const b = [[], [], []];
  for (let i = 0; i < n; i++) {
    const x = box[0] + ctx.rand() * (box[2] - box[0]);
    const y = box[1] + ctx.rand() * (box[3] - box[1]);
    b[Math.floor(ctx.rand() * 3)].push(`M${Math.round(x)} ${Math.round(y)}h0`);
  }
  return b.map((d, i) => (d.length ? `<path d="${d.join('')}" stroke="${color}" stroke-width="${r(1 + i * maxR * 0.7)}" stroke-linecap="round" opacity="${[0.35, 0.55, 0.8][i]}"/>` : '')).join('');
}
/** rising embers (small slanted diamonds), one path per colour */
function embers(ctx, n, colors, box = [20, 60, 280, 290], size = 3) {
  const b = colors.map(() => []);
  for (let i = 0; i < n; i++) {
    const x = box[0] + ctx.rand() * (box[2] - box[0]);
    const y = box[1] + ctx.rand() * (box[3] - box[1]);
    const w = (0.5 + ctx.rand()) * size * 0.45, h = w * (1.6 + ctx.rand());
    const t = (ctx.rand() - 0.5) * 0.7; // slant
    const q = (v) => Math.round(v * 2) / 2;
    b[i % colors.length].push(`M${q(x + h * t)} ${q(y - h)}l${q(w - h * t)} ${q(h)} ${q(-w - h * t)} ${q(h)} ${q(h * t - w)} ${q(-h)}z`);
  }
  return b.map((d, i) => `<path d="${d.join('')}" fill="${colors[i]}" opacity="${[0.85, 0.6, 0.45][i % 3]}"/>`).join('');
}
/** wedge rays from a centre */
function rays(cx, cy, n, r0, r1, spread, color, op, rot = 0) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = rot + (i * 360) / n;
    const w = spread * (i % 2 ? 0.55 : 1);
    const p = (ang, rr) => [cx + Math.cos((ang * Math.PI) / 180) * rr, cy + Math.sin((ang * Math.PI) / 180) * rr];
    const rr = r1 * (i % 2 ? 0.75 : 1);
    d += poly([p(a - w, rr), p(a, r0), p(a + w, rr)]);
  }
  return `<path d="${d}" fill="${color}" opacity="${op}"/>`;
}
const circle = (cx, cy, rr, attrs) => `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(rr)}" ${attrs}/>`;

// ------------------------------------------------------------------ backgrounds
function background(ctx, o) {
  const { T, rank } = ctx;
  const [fx, fy] = o.focus || [150, 130];
  let s = `<rect width="300" height="300" fill="${ctx.rgb('bg', [[0, T.bg[0]], [0.5, T.bg[1]], [1, T.bg[2]]], fx / 300, fy / 300, 230 / 300)}"/>`;
  if (ctx.card.class === 'neutral') {
    // moon disc + halo, thin cloud bands, far ridge
    const [mx, my, mr] = o.moon || [fx, fy - 18, 70];
    s += circle(mx, my, mr * 1.9, `fill="${ctx.rgb('halo', [[0, T.halo, 0.32], [0.45, T.halo, 0.1], [1, T.halo, 0]])}"`);
    s += circle(mx, my, mr, `fill="${ctx.rgb('moon', [[0, '#eef2ff', 0.5], [0.7, '#b8c6e6', 0.32], [1, '#8796bd', 0.26]], 0.35, 0.35, 0.65)}"`);
    // craters (very low contrast)
    s += circle(mx + mr * 0.3, my + mr * 0.2, mr * 0.18, 'fill="#6f7ea6" opacity=".14"') + circle(mx - mr * 0.35, my + mr * 0.35, mr * 0.11, 'fill="#6f7ea6" opacity=".12"') + circle(mx + mr * 0.05, my - mr * 0.45, mr * 0.09, 'fill="#6f7ea6" opacity=".1"');
    s += stars(ctx, 18 + rank * 10, T.mote, [6, 6, 294, 190]);
    const cy = o.cloudY ?? fy + 40;
    s += `<path d="M-10 ${cy}C40 ${cy - 10} 70 ${cy + 4} 120 ${cy - 4}S220 ${cy - 14} 310 ${cy - 2}V${cy + 10}C240 ${cy + 4} 180 ${cy + 14} 120 ${cy + 8}S30 ${cy + 4} -10 ${cy + 14}Z" fill="#9fb0d4" opacity=".08"/>`;
    s += `<path d="M-10 ${cy + 26}C60 ${cy + 18} 110 ${cy + 30} 170 ${cy + 22}S260 ${cy + 14} 310 ${cy + 22}V${cy + 30}C250 ${cy + 26} 200 ${cy + 36} 150 ${cy + 32}S40 ${cy + 30} -10 ${cy + 36}Z" fill="#9fb0d4" opacity=".06"/>`;
    if (o.ground !== false) s += `<path d="M-10 236C40 222 80 230 120 220S200 214 240 224S290 220 310 226V310H-10Z" fill="${T.ground}" opacity=".85"/>`;
  } else {
    // lia: warm core glow, oath-crystal lozenge, ember field, flame tongues at the bottom
    s += circle(fx, fy, 150, `fill="${ctx.rgb('halo', [[0, T.halo, 0.42], [0.35, '#ff6b5e', 0.16], [1, '#ff6b5e', 0]])}"`);
    if ((rank >= 1 && rank < 3) || o.lozenge) {
      s += `<path d="${rhomb(fx, fy, 96, 128)}${rhomb(fx, fy, 86, 116)}" fill="${T.ring}" fill-rule="evenodd" opacity=".12"/>`;
    }
    if (o.bgFlames !== false) s += `<path d="M-10 300V250C10 262 18 236 30 222C34 244 46 250 56 238C60 226 58 212 66 200C74 222 86 236 98 240C108 230 106 214 116 204C122 222 134 238 150 244C164 236 168 220 178 206C188 222 192 238 204 242C214 230 216 212 226 200C234 216 240 232 252 238C262 226 262 212 272 204C278 222 290 234 310 236V300Z" fill="#3a0c18" opacity=".7"/>`;
  }
  // rarity ornament
  if (rank >= 1) {
    const rr = o.ringR || 108;
    s += circle(fx, fy, rr, `fill="none" stroke="${T.ring}" stroke-width="1" opacity="${rank >= 2 ? 0.34 : 0.22}"`);
    let dm = '';
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      dm += rhomb(Math.round(fx + Math.cos(a) * rr), Math.round(fy + Math.sin(a) * rr), 3, 5);
    }
    s += `<path d="${dm}" fill="${T.ring}" opacity="${rank >= 2 ? 0.6 : 0.4}"/>`;
  }
  if (rank >= 2) {
    s += rays(fx, fy, 14, 30, 160, 3.6, T.ring, rank >= 3 ? 0.13 : 0.08, 7);
    s += circle(fx, fy, (o.ringR || 108) + 9, `fill="none" stroke="${T.ring}" stroke-width=".7" stroke-dasharray="2 5" opacity=".35"`);
  }
  if (rank >= 3) {
    const ir = ctx.lgb('iri', 1, 1, [[0, '#ffd091'], [0.3, '#ff8ab0'], [0.55, '#c9a0ff'], [0.8, '#8fd4f5'], [1, '#ffd091']]);
    s += circle(fx, fy, (o.ringR || 108) - 8, `fill="none" stroke="${ir}" stroke-width="2.2" opacity=".55"`);
  }
  return s;
}

function overlays(ctx, o) {
  const { T, rank } = ctx;
  const [fx, fy] = o.focus || [150, 130];
  let s = '';
  // front particles
  if (ctx.card.class === 'lia') s += embers(ctx, 10 + rank * 2, ['#ffd091', '#ff8a5c', '#ff6b7c'], [14, 40, 286, 290], 3.2);
  else s += embers(ctx, 4 + rank * 3, ['#dfe8ff', '#b9cdf2'], [14, 30, 286, 280], 2.2);
  if (rank >= 2) {
    for (let i = 0; i < rank + 1; i++) s += sparkle(30 + ctx.rand() * 240, 24 + ctx.rand() * 200, 3 + ctx.rand() * 4, rank >= 3 ? '#fff4dc' : T.mote, 0.7);
  }
  // moonlight wash from upper-left
  s += `<path d="M0 0H130L0 150Z" fill="${ctx.lgb('wash', 0.7, 0.6, [[0, PAL.moon, 0.16], [1, PAL.moon, 0]])}"/>`;
  // vignette + bottom fade
  s += `<rect width="300" height="300" fill="${ctx.rgb('vig', [[0.5, PAL.night, 0], [0.82, PAL.night, 0.45], [1, PAL.night, 0.9]], fx / 300, (fy + 10) / 300, 215 / 300)}"/>`;
  s += `<rect y="240" width="300" height="60" fill="${ctx.lgb('fade', 0, 1, [[0, PAL.night, 0], [1, PAL.night, 0.6]])}"/>`;
  return s;
}

// ------------------------------------------------------------------ faces
/**
 * Adult anime face. (cx, ey) = centre between the eyes, s = scale (1 = ~54px wide face).
 * o.look: -1..1, positive = turned toward viewer-right (far side compresses, chin shifts).
 * o.eye iris colour, o.angry, o.closed, o.mouth ('open'|'smile'|'shout'|undefined), o.brow lift.
 */
function face(ctx, cx, ey, s, o = {}) {
  const look = o.look ?? 0;
  const skin = o.skin || M.skin;
  const eye = o.eye || '#c98a2e';
  const ln = o.line || '#4a1e22';
  const F = (x) => cx + (x * (x * look > 0 ? 1 - 0.24 * Math.abs(look) : 1) + look * 5) * s;
  const P = (x, y) => [F(x), ey + y * s];
  const jaw = sm([P(-27, -32), P(-26.5, -5), P(-22.5, 12), P(-13, 25), [F(look * 3.5), ey + 32 * s], P(13, 25), P(22.5, 12), P(26.5, -5), P(27, -32), P(12, -44), P(-12, -44)]);
  let f = ctx.cel(jaw, skin, { ss: [r(-6 * s - look * 3), r(-3 * s)], hl: 1.4, rw: 1.4, rim: o.rimC || '#ffc2ae', sw: r(2 * s), line: ln });
  const eh = 5.8 * s;
  const eyeAt = (x, flip) => {
    const ex = F(x);
    const w = 9.6 * s * (x * look > 0 ? 1 - 0.28 * Math.abs(look) : 1);
    const x0 = ex - w, x1 = ex + w, y = ey;
    let e = '';
    const by = y - eh * 2.2 - (o.brow || 0) * s;
    const bin = o.angry ? 2.4 * s : 0;
    e += `<path d="M${r(x0 - 0.5 * s)} ${r(by + (flip ? bin : 0.4 * s))}Q${r(ex)} ${r(by - 2.6 * s)} ${r(x1 + 0.5 * s)} ${r(by + (flip ? 0.4 * s : bin))}" fill="none" stroke="${o.browC || '#5a1c22'}" stroke-width="${r(1.9 * s)}"/>`;
    if (o.closed) {
      const dy = o.closed === 'happy' ? -eh * 1.1 : eh * 0.9;
      e += `<path d="M${r(x0)} ${r(y - 0.5 * s)}Q${r(ex)} ${r(y + dy)} ${r(x1)} ${r(y - 0.5 * s)}" fill="none" stroke="#2a1014" stroke-width="${r(2.1 * s)}"/>`;
      e += `<path d="M${r(flip ? x0 : x1)} ${r(y - 0.5 * s)}l${r((flip ? -2.6 : 2.6) * s)} ${r(1.2 * s)}" stroke="#2a1014" stroke-width="${r(1.3 * s)}"/>`;
      return e;
    }
    const lidY = o.angry ? 1.78 : 2.02;
    const wd = `M${r(x0)} ${r(y)}C${r(x0 + w * 0.3)} ${r(y - eh * 1.45)} ${r(x1 - w * 0.4)} ${r(y - eh * 1.45)} ${r(x1)} ${r(y - 0.6 * s)}C${r(x1 - w * 0.3)} ${r(y + eh * 1.05)} ${r(x0 + w * 0.4)} ${r(y + eh * 1.05)} ${r(x0)} ${r(y)}Z`;
    const eid = ctx.p(`e${ctx.eyeN = (ctx.eyeN || 0) + 1}`);
    e += `<clipPath id="${eid}"><path d="${wd}"/></clipPath><path d="${wd}" fill="#fff8f4"/><g clip-path="url(#${eid})">`;
    const ix = ex + look * 1.8 * s, irx = 4.3 * s * (w / (9.6 * s));
    e += `<ellipse cx="${r(ix)}" cy="${r(y - 0.3 * s)}" rx="${r(irx)}" ry="${r(5.6 * s)}" fill="${eye}"/>`;
    e += `<ellipse cx="${r(ix)}" cy="${r(y + 0.2 * s)}" rx="${r(irx * 0.45)}" ry="${r(2.6 * s)}" fill="#24100c"/>`;
    e += circle(ix - irx * 0.4, y - 2.2 * s, 1.1 * s, 'fill="#fff"') + '</g>';
    // upper lid (thick, extends outward) + lower lash hint
    const ox = flip ? x0 - 1.4 * s : x1 + 1.4 * s, ix0 = flip ? x1 : x0;
    e += `<path d="M${r(ix0)} ${r(y - 0.4 * s)}Q${r(ex)} ${r(y - eh * lidY * 1.05)} ${r(ox)} ${r(y - (o.angry ? 0 : 0.9) * s)}" fill="none" stroke="#2a1014" stroke-width="${r(2.4 * s)}"/>`;
    e += `<path d="M${r(x0 + w * 0.3)} ${r(y + eh * 0.72)}Q${r(ex)} ${r(y + eh * 0.86)} ${r(x1 - w * 0.25)} ${r(y + eh * 0.6)}" fill="none" stroke="${ln}" stroke-width="${r(0.9 * s)}" opacity=".5"/>`;
    return e;
  };
  f += eyeAt(-12, true) + eyeAt(12, false);
  const nx = F(look * 2);
  f += `<path d="M${r(nx + 0.6 * s + look * s)} ${r(ey + 8 * s)}L${r(nx - 0.8 * s + look * 1.5 * s)} ${r(ey + 13 * s)}L${r(nx + 1.4 * s)} ${r(ey + 13.6 * s)}" fill="none" stroke="${skin[1]}" stroke-width="${r(1.3 * s)}" />`;
  const mx = F(look * 3), mw = (o.mouthW || 5) * s, my = ey + 21 * s;
  if (o.mouth === 'shout' || o.mouth === 'open') {
    const h = o.mouth === 'shout' ? 8 : 4.5;
    f += `<path d="M${r(mx - mw)} ${r(my - 1 * s)}Q${r(mx)} ${r(my - 2.4 * s)} ${r(mx + mw)} ${r(my - 1 * s)}Q${r(mx + mw * 0.6)} ${r(my + h * s)} ${r(mx)} ${r(my + h * s)}Q${r(mx - mw * 0.6)} ${r(my + h * s)} ${r(mx - mw)} ${r(my - 1 * s)}Z" fill="#6e1e2a" stroke="${ln}" stroke-width="${r(1.2 * s)}"/>`;
    f += `<path d="M${r(mx - mw * 0.75)} ${r(my - 0.6 * s)}Q${r(mx)} ${r(my - 1.4 * s)} ${r(mx + mw * 0.75)} ${r(my - 0.6 * s)}V${r(my + 0.8 * s)}H${r(mx - mw * 0.75)}Z" fill="#fff4ee"/>`;
  } else if (o.mouth === 'smile') {
    f += `<path d="M${r(mx - mw)} ${r(my - 1 * s)}Q${r(mx)} ${r(my + 2.6 * s)} ${r(mx + mw)} ${r(my - 1.4 * s)}" fill="none" stroke="${ln}" stroke-width="${r(1.4 * s)}"/>`;
  } else {
    f += `<path d="M${r(mx - mw)} ${r(my)}Q${r(mx)} ${r(my - 0.8 * s)} ${r(mx + mw)} ${r(my + 0.2 * s)}" fill="none" stroke="${ln}" stroke-width="${r(1.4 * s)}"/>`;
  }
  return f;
}

// ------------------------------------------------------------------ SUBJECTS
const SUBJECTS = {};

// ======================= NEUTRAL =======================

// 微光精灵 - a small lantern-flame spirit with moth wings, hovering over moon-lilies in dark grass.
SUBJECTS.n_wisp = {
  focus: [150, 128], moon: [150, 112, 66], cloudY: 182,
  draw(ctx) {
    let s = '';
    const rnd = ctx.rand;
    // grass silhouettes
    let g = '';
    for (let i = 0; i < 24; i++) {
      const x = 4 + i * 12.6 + rnd() * 6, h = 26 + rnd() * 40, lean = (rnd() - 0.5) * 22;
      g += `M${Math.round(x - 4)} 300Q${Math.round(x - 1)} ${Math.round(300 - h * 0.6)} ${Math.round(x + lean)} ${Math.round(300 - h)}Q${Math.round(x + 2)} ${Math.round(300 - h * 0.5)} ${Math.round(x + 5)} 300Z`;
    }
    s += `<path d="${g}" fill="#0a0f1e"/>`;
    // light pool
    s += `<ellipse cx="150" cy="258" rx="100" ry="26" fill="${ctx.rg('pool', 150, 258, 100, [[0, '#d6e6ff', 0.4], [1, '#d6e6ff', 0]])}"/>`;
    // moon-lilies (what the light protects)
    const lily = (x, y, sc, rot) => {
      const cup = xf(sm([[0, 0, 1], [7, 4], [9, 14], [4, 12], [0, 18, 1], [-4, 12], [-9, 14], [-7, 4]]), { tx: x, ty: y, s: sc, rot, ox: 0, oy: 0 });
      return ctx.line(`M${x} ${y}Q${x + 6} ${y + 20} ${x + 2} 300`, '#24304a', 2) + `<path d="${cup}" fill="#eef3ff" stroke="#8fa6d6" stroke-width="1"/>`;
    };
    s += lily(104, 246, 1.1, 160) + lily(198, 240, 1.2, 200) + lily(232, 262, 0.9, 175) + lily(70, 268, 0.85, 185);
    // outer glow
    s += circle(150, 146, 50, `fill="#bcd8ff" opacity=".6"${ctx.blur(10)}`);
    // wings
    const wingU = sm([[144, 138, 1], [124, 108], [96, 86], [66, 82], [56, 98], [70, 120], [102, 136], [140, 146, 1]]);
    const wingL = sm([[142, 154, 1], [118, 160], [92, 176], [84, 194], [100, 198], [122, 184], [142, 160, 1]]);
    const wf = ctx.lg('wing', 56, 82, 150, 160, [[0, '#efe8ff', 0.6], [1, '#9fd2ff', 0.2]]);
    s += `<path d="${wingU}${wingL}${mir(wingU)}${mir(wingL)}" fill="${wf}" stroke="#eef4ff" stroke-width="1.3" stroke-opacity=".8"/>`;
    const veins = 'M140 142Q110 116 66 92M136 144Q108 130 72 116M140 158Q114 170 90 192';
    s += ctx.line(veins + mir(veins), '#eef4ff', 0.8, 0.5);
    s += circle(76, 98, 4, 'fill="#e8ddff" opacity=".55"') + circle(224, 98, 4, 'fill="#e8ddff" opacity=".55"');
    // trailing ribbon tail (tapered)
    s += `<path d="M142 178C136 202 124 214 132 232C138 246 158 246 156 266C162 248 146 238 146 226C146 212 156 200 158 180Z" fill="#cfe4ff" opacity=".55"/>`;
    // flame body (three licks)
    const body = sm([[150, 80, 1], [157, 98], [166, 106], [174, 94, 1], [177, 116], [182, 140], [179, 162], [166, 178], [150, 184], [134, 178], [121, 162], [119, 138], [125, 116], [128, 102, 1], [137, 110], [144, 96]]);
    s += ctx.cel(body, ['#a9ccff', '#7096e0', '#ffffff', '#38589a'], { ss: [-9, -7], hl: 3, rw: 2.6, rim: '#d9c8ff', sw: 2 });
    // warm inner core
    s += `<path d="${sm([[149, 112, 1], [158, 132], [164, 152], [157, 170], [143, 170], [136, 154], [141, 132]])}" fill="#f2f8ff"/>`;
    s += `<ellipse cx="148" cy="154" rx="11" ry="12" fill="${ctx.rg('core', 147, 152, 12, [[0, '#fffbe8'], [1, '#fff1c6']])}"/>`;
    // tiny face
    s += `<ellipse cx="142" cy="151" rx="2.2" ry="3" fill="#2f4a86"/><ellipse cx="156" cy="151" rx="2.2" ry="3" fill="#2f4a86"/>`;
    s += circle(141.3, 149.8, 0.9, 'fill="#fff"') + circle(155.3, 149.8, 0.9, 'fill="#fff"');
    s += sparkle(150, 76, 6, '#ffffff') + sparkle(116, 112, 3.5, '#e8ddff', 0.8) + sparkle(190, 128, 3, '#e8ddff', 0.7) + sparkle(98, 214, 2.6, '#cfe6ff', 0.7) + sparkle(210, 206, 3, '#cfe6ff', 0.8);
    return s;
  },
};

// 重装骑士 - full-plate knight saluting with an upright sword.
SUBJECTS.n_knight = {
  focus: [150, 118], moon: [150, 94, 62], cloudY: 150,
  draw(ctx) {
    const st = M.steel, ds = M.darkSteel;
    let s = '';
    // cape behind shoulders
    s += ctx.cel(sm([[70, 186], [52, 240], [44, 300, 1], [256, 300, 1], [248, 240], [230, 186]]), ['#2f4778', '#1d2c52', '#4f6aa6', '#0e1428'], { ss: [-14, 0], lite: true, sw: 2 });
    // plume
    const plume = sm([[150, 52, 1], [156, 34], [176, 20], [206, 16], [236, 26], [214, 30], [200, 40], [222, 46], [196, 52], [176, 54], [160, 60, 1]]);
    s += ctx.cel(plume, ['#3e5a96', '#283d6c', '#7d9be0', '#0e1428'], { ss: [-6, -8], rw: 0, sw: 2 });
    s += ctx.line('M162 46Q186 30 222 28M166 52Q190 44 214 46', '#7d9be0', 1, 0.7);
    // breastplate
    const chest = sm([[96, 182], [150, 168], [204, 182], [214, 240], [210, 300, 1], [90, 300, 1], [86, 240]]);
    s += ctx.cel(chest, st, { ss: [-26, -4], hl: 2.4 });
    s += ctx.line('M150 172V300', st[3], 1.6, 0.8);
    s += ctx.line('M100 248Q150 236 200 248M96 270Q150 258 204 270', st[3], 1.4, 0.7);
    s += ctx.line('M124 186Q132 216 128 246', st[2], 2.2, 0.6);
    // gorget
    s += ctx.cel(poly([[124, 146], [176, 146], [188, 176], [150, 184], [112, 176]]), ds, { ss: [-14, -2], lite: true });
    s += ctx.line('M118 162Q150 170 182 162', ds[3], 1.4, 0.8);
    // pauldrons (both sides in one shape: shared light direction)
    const pauL = sm([[122, 166], [104, 152], [76, 152], [52, 170], [42, 196], [50, 214], [66, 204], [92, 198], [116, 196], [126, 182]]);
    const pauL2 = sm([[50, 210], [70, 202], [96, 200], [102, 214], [80, 222], [58, 230], [46, 226]]);
    s += ctx.cel(pauL2 + mir(pauL2), ds, { ss: [-10, -6], lite: true });
    s += ctx.cel(pauL + mir(pauL), st, { ss: [-16, -12], hl: 2.6 });
    s += ctx.line('M58 182Q84 166 112 170' + mir('M58 182Q84 166 112 170'), st[3], 1.3, 0.7);
    let rv = '';
    for (const [x, y] of [[64, 196], [84, 190], [104, 188]]) rv += `M${x} ${y}h0M${300 - x} ${y}h0`;
    s += `<path d="${rv}" stroke="${st[2]}" stroke-width="3.6"/>`;
    // great helm
    const helm = sm([[150, 50], [172, 54], [184, 70], [186, 104], [186, 132, 1], [170, 148], [150, 154, 1], [130, 148], [114, 132, 1], [114, 104], [116, 70], [128, 54]]);
    s += ctx.cel(helm, st, { ss: [-22, -6], hl: 2.8, inner: `<path d="M150 50V160" stroke="${st[1]}" stroke-width="4" opacity=".5"/>` });
    s += `<path d="M118 92H182V101H118Z" fill="#0b0f1d"/>` + ctx.line('M120 103H180', st[2], 1, 0.6);
    s += ctx.line('M164 116V128M169 116V128M174 116V128M179 116V128', '#0b0f1d', 2.2);
    s += ctx.line('M126 60Q120 80 122 120', st[2], 2.4, 0.7);
    // sword up the helm's centre
    const blade = poly([[144, 214], [144, 52], [150, 36], [156, 52], [156, 214]]);
    s += ctx.cel(blade, ['#dfe6f2', '#8e9ab3', '#ffffff', '#1a2034'], { ss: [-6, 0], lite: true, sw: 1.8, inner: `<path d="M150 40V214" stroke="#ffffff" stroke-width="2" opacity=".8"/>` });
    s += sparkle(150, 40, 9, '#ffffff', 0.95);
    s += ctx.cel(sm([[112, 214], [124, 208], [150, 212], [176, 208], [188, 214], [176, 222], [150, 220], [124, 222]]), M.gold, { ss: [-8, -3], lite: true });
    s += circle(150, 215, 5, `fill="#7fb2ff" stroke="${M.gold[3]}" stroke-width="1.4"`);
    // gauntlets: two stacked armoured fists
    const fist = sm([[130, 222], [170, 222], [176, 232], [172, 244], [128, 244], [124, 232]]);
    s += ctx.cel(fist + xf(fist, { ty: 20, sx: 1.04, ox: 150, oy: 232 }), ds, { ss: [-12, -6], hl: 2, rw: 0 });
    s += ctx.line('M138 226V242M148 226V242M158 226V242M136 246V262M148 246V262M160 246V262', ds[3], 1.1, 0.7);
    return s;
  },
};

// 哥布林 - a hooded goblin grinning over a stolen coin; the rest of its pack lurks behind, eyes glinting.
SUBJECTS.n_goblin = {
  focus: [150, 126], moon: [150, 98, 60], cloudY: 150,
  draw(ctx) {
    let s = '';
    const skin = ['#7ea24e', '#4e7034', '#b0d27a', '#1a2810'];
    const cloth = ['#4c4139', '#2d251f', '#7b6858', '#140e0a'];
    // the pack: hooded silhouettes with long ears and glowing eyes
    let pk = '', ey = '';
    for (const [x, y, k] of [[34, 206, 1.15], [266, 200, 1.2], [76, 252, 0.95], [226, 254, 1], [18, 160, 0.75], [286, 150, 0.7]]) {
      pk += xf(sm([[0, -24, 1], [11, -10], [15, 6], [12, 20], [-12, 20], [-15, 6], [-11, -10]]) + poly([[-10, 2], [-36, -2], [-12, 10]]) + poly([[10, 2], [36, -2], [12, 10]]), { tx: x, ty: y, s: k, ox: 0, oy: 0 });
      ey += `M${r(x - 8 * k)} ${r(y + 2 * k)}L${r(x - 3 * k)} ${r(y + 4 * k)}M${r(x + 8 * k)} ${r(y + 2 * k)}L${r(x + 3 * k)} ${r(y + 4 * k)}`;
    }
    s += `<path d="${pk}" fill="#070912" stroke="#2a3350" stroke-width="1.2"/><path d="${ey}" stroke="#ffd23a" stroke-width="2.4"/>`;
    // hood + cloak
    const hood = [[150, 46], [190, 54], [216, 86], [224, 128], [216, 166], [150, 182], [84, 166], [76, 128], [84, 86], [110, 54]];
    s += ctx.cel(sm(hood), cloth, { ss: [-16, -6], hl: 0 });
    s += `<path d="${sm([[150, 70], [180, 78], [198, 104], [200, 140], [150, 176], [100, 140], [102, 104], [120, 78]])}" fill="#120d0a"/>`;
    s += ctx.cel(sm([[150, 160, 1], [196, 168], [232, 190], [252, 236], [258, 300, 1], [42, 300, 1], [48, 236], [68, 190], [104, 168]]), cloth, { ss: [-24, -4], inner: ctx.line('M104 176Q112 230 100 300M196 176Q190 230 202 300', cloth[1], 2) });
    // ears + brass ring
    const ear = sm([[112, 116, 1], [92, 102], [62, 88], [26, 76, 1], [46, 98], [70, 120], [92, 136], [112, 140, 1]]);
    const earIn = sm([[106, 120], [86, 110], [50, 90], [72, 114], [92, 128], [106, 132]]);
    s += ctx.cel(ear + mir(ear), skin, { ss: [-6, -8], hl: 2, inner: `<path d="${earIn}${mir(earIn)}" fill="${skin[1]}"/>` });
    s += circle(238, 112, 5.5, `fill="none" stroke="${M.gold[0]}" stroke-width="2.2"`);
    // head
    s += ctx.cel(sm([[150, 80], [178, 84], [196, 102], [200, 126], [194, 148], [180, 164], [162, 176], [150, 180, 1], [138, 176], [120, 164], [106, 148], [100, 126], [104, 102], [122, 84]]), skin, { ss: [-12, -6], hl: 2.2 });
    // hood brim over the brow (same crown as the hood: one clean silhouette)
    s += ctx.cel(sm([[93, 122], ...hood.slice(7), ...hood.slice(0, 3), [207, 122], [194, 104], [176, 94], [150, 90], [124, 94], [106, 104]]), cloth, { ss: [-10, -4], hl: 2, rw: 0 });
    // brow ridges, slit-pupil eyes, wrinkles
    const eye = 'M118 122Q132 114 146 126Q132 132 118 122Z';
    s += `<path d="${eye}${mir(eye)}" fill="#ffd23a" stroke="#3a2a06" stroke-width="1.4"/><path d="M133 119V131M167 119V131" stroke="#1a0f00" stroke-width="3"/>`;
    s += circle(129, 121, 1.4, 'fill="#fff"') + circle(163, 121, 1.4, 'fill="#fff"');
    s += ctx.line('M114 112L148 122' + mir('M114 112L148 122'), '#2a4418', 5);
    s += ctx.line('M110 134Q118 140 126 138M190 134Q182 140 174 138', skin[1], 1.6);
    // hooked nose
    s += ctx.cel(sm([[148, 118, 1], [156, 132], [164, 150], [160, 160], [150, 158], [146, 150]]), skin, { ss: [-5, -4], lite: true, sw: 1.8 });
    // toothy grin
    s += `<path d="M114 148Q150 186 188 146Q172 172 150 175Q128 172 114 148Z" fill="#2a0c10" stroke="${skin[3]}" stroke-width="2"/>`;
    s += `<path d="M120 154L126 163 131 157 137 166 143 160 149 168 155 160 161 166 167 158 172 164 178 155 184 150Q150 170 120 154ZM134 172L138 166 142 173ZM158 173L162 166 166 172Z" fill="#efe2bc"/>`;
    // sleeve, glowing coin, clawed hand clutching it
    s += ctx.cel(sm([[184, 300, 1], [188, 252], [200, 232], [230, 234], [238, 260], [232, 300, 1]]), cloth, { ss: [-8, 0], lite: true });
    s += circle(214, 174, 30, `fill="#ffd36b" opacity=".45"${ctx.blur(7)}`);
    s += ctx.cel('M214 154C226 154 235 163 235 175C235 187 226 196 214 196C202 196 193 187 193 175C193 163 202 154 214 154Z', M.gold, { ss: [-5, -5], hl: 2, rw: 0, sw: 2.2, inner: `<path d="M214 162C221 164 226 169 226 175C226 182 221 187 214 189C219 184 219 167 214 162Z" fill="${M.gold[1]}"/><path d="M214 161C208 163 203 168 203 175" fill="none" stroke="${M.gold[2]}" stroke-width="2"/>` });
    s += ctx.cel(sm([[200, 236], [196, 214], [198, 196], [208, 190], [222, 190], [232, 198], [234, 216], [228, 236]]), skin, { ss: [-6, -6], lite: true });
    s += ctx.cel(sm([[200, 198], [198, 186], [206, 182], [210, 194]]) + sm([[211, 194], [211, 182], [219, 182], [220, 194]]) + sm([[221, 196], [223, 184], [231, 186], [230, 198]]), skin, { ss: 0, lite: true, sw: 1.6 });
    s += `<path d="M201 184L203 178 206 183ZM213 181L215 175 218 181ZM224 183L227 177 229 184Z" fill="#f2ead2"/>`;
    s += ctx.line('M204 214Q214 208 226 214', skin[3], 1.4);
    s += sparkle(204, 166, 7, '#fff6d8');
    return s;
  },
};

// 旅行商人 - a cheerful pack-laden merchant under a wide hat, offering a glowing card; warm lantern behind.
SUBJECTS.n_merchant = {
  focus: [150, 124], moon: [150, 92, 58], cloudY: 152,
  draw(ctx) {
    let s = '';
    const coat = ['#6a5546', '#45362b', '#9c836d', '#1c140e'];
    const hatC = ['#5a3f2e', '#3a281c', '#8c6a50', '#1a100a'];
    const teal = ['#3f6f7c', '#284a54', '#72a6b4', '#0e1c22'];
    // lantern pole + lantern (warm counter-light)
    s += circle(246, 104, 40, `fill="#ffb36b" opacity=".5"${ctx.blur(9)}`);
    s += ctx.line('M206 70L250 44V78', '#3a281c', 3.4);
    s += `<path d="M238 82H254L258 92 256 118H236L234 92Z" fill="#ffd9a0" stroke="#3a1e0a" stroke-width="2"/><path d="M238 76H254L250 82H242Z" fill="#3a281c"/>`;
    s += ctx.line('M240 84V116M252 84V116M236 100H256', '#4a2a10', 1.6) + circle(246, 100, 4, 'fill="#fff"');
    // backpack + bedroll + scroll bundle
    s += ctx.cel(sm([[94, 76], [206, 76], [214, 98], [216, 188, 1], [84, 188, 1], [86, 98]]), M.leather, { ss: [-14, -6], hl: 0, rw: 1.8, rim: '#ffb36b' });
    s += ctx.cel(sm([[80, 56, 1], [220, 56, 1], [228, 66], [220, 78, 1], [80, 78, 1], [72, 66]]), teal, { ss: [-6, -6], hl: 0, rw: 2, rim: '#ffb36b', inner: ctx.line('M112 56V78M188 56V78', M.leather[3], 3) });
    s += `<path d="M212 120L234 112 238 120 216 130ZM212 134L236 128 238 136 214 144Z" fill="#efe2c4" stroke="#3a2a14" stroke-width="1.6"/>`;
    // coat, straps, scarf
    s += ctx.cel(sm([[150, 150, 1], [194, 160], [226, 182], [244, 230], [250, 300, 1], [50, 300, 1], [56, 230], [74, 182], [106, 160]]), coat, { ss: [-26, -6] });
    s += ctx.line('M114 164L102 300M186 164L198 300', M.leather[3], 11) + ctx.line('M114 164L102 300M186 164L198 300', M.leather[0], 7);
    s += ctx.cel(sm([[118, 150], [150, 162], [182, 150], [190, 168], [170, 182], [150, 178], [128, 182], [110, 168]]), teal, { ss: [-8, -6], lite: true });
    // coin pouch
    s += `<path d="${sm([[170, 238], [190, 236], [198, 254], [190, 270], [170, 270], [164, 254]])}" fill="${M.leather[0]}" stroke="${M.leather[3]}" stroke-width="2"/>`;
    s += circle(180, 236, 4, `fill="${M.gold[0]}" stroke="${M.gold[3]}"`) + circle(188, 234, 3.4, `fill="${M.gold[0]}" stroke="${M.gold[3]}"`);
    // neck + face (happy closed eyes), side hair, moustache
    s += `<path d="M138 142H162L164 162H136Z" fill="${M.skin[0]}" stroke="${M.skin[3]}" stroke-width="2"/>`;
    s += `<path d="${sm([[118, 112], [122, 136], [128, 146], [118, 146], [112, 130]]) + sm([[182, 112], [178, 136], [172, 146], [182, 146], [188, 130]])}" fill="#4a2e1e" stroke="#1a0e08" stroke-width="1.6"/>`;
    s += face(ctx, 150, 127, 0.86, { closed: 'happy', mouth: 'smile', mouthW: 6, browC: '#4a2e1e', line: '#4a2418' });
    s += `<path d="M150 141C144 139 136 141 132 147C138 145 144 147 150 144C156 147 162 145 168 147C164 141 156 139 150 141Z" fill="#4a2e1e"/>`;
    // hat: feather, crown, band, brim
    s += `<path d="${sm([[150, 60, 1], [188, 52], [244, 30, 1], [196, 62], [160, 72, 1]])}" fill="#e8e4dc" stroke="#2a2620" stroke-width="1.6"/><path d="M160 62Q200 46 236 34" stroke="#a8a296" stroke-width="1.2"/>`;
    s += ctx.cel(sm([[108, 102], [110, 74], [126, 56], [150, 50], [174, 56], [190, 74], [192, 102]]), hatC, { ss: [-12, -4], rw: 0, inner: `<path d="M100 88H200V100H100Z" fill="#b4323f"/>` });
    s += ctx.cel(sm([[58, 110], [86, 98], [150, 92], [214, 98], [242, 110], [216, 119], [150, 117], [84, 119]]), hatC, { ss: [-10, -4], hl: 2 });
    s += `<path d="M98 114Q150 122 202 114Q150 132 98 114Z" fill="#000" opacity=".22"/>`;
    // sleeve, hand + offered card (glowing)
    s += circle(88, 150, 34, `fill="#cfe0ff" opacity=".55"${ctx.blur(9)}`);
    s += ctx.cel(sm([[62, 300, 1], [64, 240], [72, 204], [96, 196], [104, 214], [96, 250], [96, 300, 1]]), coat, { ss: [-10, 0], lite: true });
    const card = xf(poly([[70, 124], [104, 124], [104, 172], [70, 172]]), { rot: -12, ox: 87, oy: 148 });
    s += `<path d="${card}" fill="#22305e" stroke="#e8c47a" stroke-width="2.4"/><path d="${xf(rhomb(87, 148, 9, 14), { rot: -12, ox: 87, oy: 148 })}" fill="#ffd091"/>`;
    s += `<path d="${xf(poly([[75, 129], [99, 129], [99, 167], [75, 167]]), { rot: -12, ox: 87, oy: 148 })}" fill="none" stroke="#e8c47a" stroke-width=".8" opacity=".7"/>`;
    s += ctx.cel(sm([[76, 196], [74, 184], [80, 172], [92, 170], [100, 178], [102, 194], [94, 202]]), M.skin, { ss: [-5, -5], lite: true });
    s += sparkle(108, 122, 7, '#ffffff') + sparkle(64, 170, 4, '#e8ddff', 0.8);
    return s;
  },
};

// 岩石魔像 - a faceted rock colossus with a moonstone heart, fists planted like a wall.
SUBJECTS.n_golem = {
  focus: [150, 130], moon: [150, 92, 66], cloudY: 156,
  draw(ctx) {
    let s = '';
    const st = ['#6a7389', '#3f475c', '#a0abc0', '#121624'];
    const rune = '#bfe6ff';
    // arms + fists (rock segments overlap so they read as one limb)
    const arm = poly([[48, 150], [26, 196], [30, 236], [60, 246], [80, 214], [84, 170]]);
    const fist = poly([[28, 226], [14, 258], [22, 294], [64, 300], [84, 272], [74, 236]]);
    s += ctx.cel(arm + mir(arm), st, { ss: [-12, -8], hl: 2.2 });
    s += ctx.cel(fist + mir(fist), st, { ss: [-12, -10], hl: 2.6, inner: ctx.line('M24 262L44 268 52 290M276 262L256 268 248 290M40 236L62 246M260 236L238 246', st[3], 1.6) });
    // torso
    s += ctx.cel(poly([[96, 118], [204, 118], [224, 176], [212, 252], [150, 272], [88, 252], [76, 176]]), st, { ss: [-30, -14], hl: 2.6, inner: `<path d="M96 118L150 150 204 118M76 176L150 212 224 176M150 150V272" fill="none" stroke="${st[1]}" stroke-width="2"/>` });
    // shoulders + moss + runes
    const sh = poly([[102, 104], [70, 90], [38, 108], [28, 144], [44, 172], [80, 178], [104, 150]]);
    s += ctx.cel(sh + mir(sh), st, { ss: [-16, -12], hl: 2.8, inner: ctx.line('M40 120L70 134 100 122M70 134L62 170' + mir('M40 120L70 134 100 122M70 134L62 170'), st[1], 1.8) });
    const moss = sm([[52, 102], [66, 92], [86, 96], [96, 104], [82, 108], [70, 104], [58, 110]]);
    s += `<path d="${moss}${mir(moss)}" fill="#506e4c" stroke="#16200f" stroke-width="1.4"/>`;
    s += ctx.line('M56 140Q70 128 86 140M60 150Q72 142 84 150' + mir('M56 140Q70 128 86 140M60 150Q72 142 84 150'), rune, 1.6, 0.75);
    // head (sunk between shoulders) with glowing visor
    s += ctx.cel(poly([[128, 78], [172, 78], [184, 94], [180, 122], [150, 132], [120, 122], [116, 94]]), st, { ss: [-14, -8], hl: 2.6 });
    s += circle(150, 104, 26, `fill="${rune}" opacity=".5"${ctx.blur(6)}`);
    s += `<path d="M128 100L172 100 166 110 134 110Z" fill="#eaf7ff" stroke="#1a3a5a" stroke-width="1.4"/>`;
    // moonstone heart + glowing cracks
    s += circle(150, 186, 30, `fill="${rune}" opacity=".7"${ctx.blur(6)}`);
    s += ctx.line('M150 186L118 156 104 160M150 186L186 152 198 156M150 186L126 228 132 252M150 186L178 230 172 254M150 186L96 196M150 186L206 198', rune, 2.4, 0.9);
    s += `<path d="${rhomb(150, 186, 16, 22)}" fill="${ctx.rg('core', 146, 180, 22, [[0, '#ffffff'], [0.5, '#dff3ff'], [1, '#7fc2f0']])}" stroke="#1a3a5a" stroke-width="2"/>`;
    s += sparkle(146, 178, 6, '#ffffff');
    s += `<path d="M100 290L112 280 124 288 120 300 98 300ZM180 292L192 284 204 292 200 300 178 300Z" fill="${st[1]}" stroke="${st[3]}" stroke-width="1.6"/>`;
    return s;
  },
};

// 巨魔战士 - a hulking tusked troll in a fur mantle, a nail-studded club slung over its shoulder.
SUBJECTS.n_troll = {
  focus: [150, 128], moon: [112, 90, 56], cloudY: 152,
  draw(ctx) {
    let s = '';
    const skin = ['#6c8d86', '#45605c', '#9cbcb2', '#152220'];
    const fur = ['#6a4a34', '#432e20', '#9a7454', '#1c120a'];
    // club (behind head, over the right shoulder)
    const shaft = poly([[206, 238], [218, 242], [256, 92], [244, 88]]);
    s += ctx.cel(shaft, M.wood, { ss: [-5, 0], lite: true, sw: 2 });
    const head = sm([[236, 104], [228, 70], [234, 40], [252, 22], [274, 26], [284, 50], [278, 86], [262, 108]]);
    s += ctx.cel(head, M.wood, { ss: [-10, -6], hl: 2.2, rw: 2 });
    s += ctx.line('M242 50Q256 44 270 52M240 78Q258 72 274 80', M.wood[1], 2);
    let nails = '';
    for (const [x, y, dx, dy] of [[232, 54, -9, -3], [230, 84, -9, 2], [252, 22, 0, -9], [282, 40, 8, -4], [282, 72, 9, 1], [264, 104, 5, 7]]) nails += `M${x} ${y}l${dx} ${dy}`;
    s += ctx.line(nails, '#c9d0dc', 3) + ctx.line(nails, '#2a2e38', 1);
    // body + arm
    s += ctx.cel(sm([[150, 140, 1], [204, 150], [244, 176], [266, 230], [272, 300, 1], [28, 300, 1], [34, 230], [56, 176], [96, 150]]), skin, { ss: [-28, -6] });
    s += ctx.line('M120 236Q150 250 180 236M150 250V300', skin[1], 2, 0.8);
    // fur mantle
    s += ctx.cel(sm([[56, 176], [92, 150], [150, 146], [208, 150], [244, 176], [252, 200, 1], [232, 192], [220, 208, 1], [202, 196], [184, 212, 1], [166, 198], [150, 212, 1], [134, 198], [116, 212, 1], [98, 196], [80, 208, 1], [68, 192], [48, 200, 1]]), fur, { ss: [-14, -8] });
    // bone + tooth necklace
    let teeth = '';
    for (let i = 0; i < 7; i++) {
      const x = 114 + i * 12, y = 214 + Math.sin((i / 6) * Math.PI) * 10;
      teeth += `M${x - 3} ${Math.round(y)}L${x} ${Math.round(y + 11)}L${x + 3} ${Math.round(y)}Z`;
    }
    s += ctx.line('M108 212Q150 232 192 212', '#2a1a10', 1.8) + `<path d="${teeth}" fill="#efe6cc" stroke="#3a2e1c" stroke-width="1.2"/>`;
    // gripping fist + forearm on the club
    s += ctx.cel(sm([[244, 300, 1], [236, 262], [222, 238], [204, 232], [196, 246], [210, 270], [214, 300, 1]]), skin, { ss: [-10, -4], lite: true });
    s += ctx.cel(sm([[196, 226], [214, 218], [230, 226], [232, 246], [216, 256], [198, 250]]), skin, { ss: [-6, -6], hl: 2, rw: 0 });
    s += ctx.line('M204 234L224 228M202 242L226 236', skin[3], 1.4, 0.8);
    // ears
    const ear = sm([[104, 108, 1], [86, 96], [74, 92, 1], [80, 108], [100, 126, 1]]);
    s += ctx.cel(ear + mir(ear), skin, { ss: [-4, -4], lite: true, sw: 2 });
    // topknot
    s += ctx.cel(sm([[140, 76], [146, 56], [154, 40], [168, 30, 1], [164, 46], [160, 62], [162, 78]]), ['#2e3a3a', '#1a2222', '#56685f', '#0a0e0e'], { ss: [-4, 0], lite: true, sw: 1.8 });
    s += `<path d="M144 64L162 66 160 72 142 70Z" fill="#efe6cc" stroke="#3a2e1c" stroke-width="1.2"/>`;
    // head
    const hd = sm([[150, 72], [180, 78], [198, 100], [202, 130], [194, 156], [172, 172], [150, 176], [128, 172], [106, 156], [98, 130], [102, 100], [120, 78]]);
    s += ctx.cel(hd, skin, { ss: [-14, -8], hl: 2.4 });
    // war paint
    s += `<path d="M110 128L128 132 112 136ZM190 128L172 132 188 136Z" fill="#c8643c" opacity=".85"/>`;
    // brow ridge + small fierce eyes
    s += ctx.cel(sm([[106, 108], [130, 98], [150, 106], [170, 98], [194, 108], [190, 118], [170, 112], [150, 118], [130, 112], [110, 118]]), skin, { ss: [-4, -5], lite: true, sw: 2 });
    s += `<path d="M126 118Q134 114 142 120Q134 124 126 118ZM174 118Q166 114 158 120Q166 124 174 118Z" fill="#ffcf5a" stroke="#2a1606" stroke-width="1.2"/>` + circle(136, 119, 2, 'fill="#2a1606"') + circle(164, 119, 2, 'fill="#2a1606"');
    // bulbous nose
    s += ctx.cel(sm([[150, 116], [160, 128], [164, 142], [156, 148], [144, 148], [136, 142], [140, 128]]), skin, { ss: [-6, -5], lite: true, sw: 1.8 });
    // underbite grin + tusks
    s += `<path d="M120 152Q150 160 180 150Q178 164 150 168Q124 166 120 152Z" fill="#2a1414" stroke="${skin[3]}" stroke-width="1.8"/>`;
    s += ctx.cel('M128 158L126 138 136 154ZM172 158L174 138 164 154Z', ['#f2ead2', '#bdb08c', '#fff', '#2a2414'], { ss: [-2, -2], lite: true, sw: 1.6 });
    return s;
  },
};

// 守护天使 - a serene armoured angel, great wings opened as a shield, cradling a healing light.
SUBJECTS.n_angel = {
  focus: [150, 118], moon: [150, 100, 62], cloudY: 170, ringR: 116,
  draw(ctx) {
    let s = '';
    const fea = ['#eef1fa', '#a6b2cf', '#ffffff', '#2a3352'];
    const robe = ['#c4cfe8', '#8392b8', '#eef2ff', '#232c4a'];
    const hair = ['#e8ebf6', '#aab1ca', '#ffffff', '#3a3f5a'];
    // wings: rounded feather scallops
    const wing = sm([[124, 150, 1], [104, 118], [78, 88], [48, 66], [16, 56], [12, 70, 1], [26, 82], [12, 96, 1], [28, 110], [14, 126, 1], [32, 140], [20, 158, 1], [40, 168], [32, 188, 1], [54, 190], [52, 212, 1], [72, 202], [80, 222, 1], [96, 202], [118, 188]]);
    s += ctx.cel(wing + mir(wing), fea, { ss: [-12, -10], hl: 2.4, rw: 2.4, rim: '#cfe0ff', inner: ctx.line('M110 140Q70 110 26 84M100 156Q66 140 28 124M104 170Q78 172 42 182' + mir('M110 140Q70 110 26 84M100 156Q66 140 28 124M104 170Q78 172 42 182'), fea[1], 1.3) });
    const cov = sm([[124, 152, 1], [104, 124], [80, 100], [54, 86], [44, 94], [50, 104, 1], [46, 116], [60, 122, 1], [58, 136], [76, 140, 1], [78, 154], [96, 156, 1], [104, 170], [122, 166]]);
    s += ctx.cel(cov + mir(cov), ['#dfe5f4', '#98a6c6', '#ffffff', '#2a3352'], { ss: [-8, -8], lite: true });
    // halo
    s += `<ellipse cx="150" cy="54" rx="34" ry="9" fill="none" stroke="#fff1c9" stroke-width="7" opacity=".7"${ctx.blur(4)}/><ellipse cx="150" cy="54" rx="32" ry="8" fill="none" stroke="${M.gold[0]}" stroke-width="3.2"/>`;
    // hair back
    s += ctx.cel(sm([[112, 92], [118, 64], [150, 54], [182, 64], [188, 92], [194, 140], [204, 196], [180, 204], [150, 186], [120, 204], [96, 196], [106, 140]]), hair, { ss: [-10, -4], lite: true, sw: 2 });
    // robe (pale blue) + silver breastplate with gold trim
    s += ctx.cel(sm([[150, 150, 1], [186, 158], [212, 176], [226, 220], [232, 300, 1], [68, 300, 1], [74, 220], [88, 176], [114, 158]]), robe, { ss: [-24, -6], inner: ctx.line('M122 236Q130 270 124 300M178 236Q170 270 176 300', robe[1], 1.6) });
    s += ctx.cel(sm([[116, 170], [150, 162], [184, 170], [188, 212], [150, 228], [112, 212]]), M.silver, { ss: [-14, -8], hl: 2.2, rw: 0, inner: ctx.line('M114 172Q150 160 186 172M150 166V226', M.gold[1], 2.4) });
    // neck + face (serene, closed eyes)
    s += `<path d="M140 128H160L162 158H138Z" fill="${M.skin[0]}" stroke="${M.skin[3]}" stroke-width="2"/>`;
    s += face(ctx, 150, 106, 0.82, { closed: true, browC: '#9aa0b8', line: '#5a3a44' });
    // fringe (centre part) + circlet
    s += ctx.cel(sm([[150, 64, 1], [138, 76], [126, 92], [118, 116], [112, 96], [116, 74], [134, 60], [166, 60], [184, 74], [188, 96], [182, 116], [174, 92], [162, 76]]), hair, { ss: [-6, -6], lite: true, sw: 2 });
    s += ctx.line('M120 82Q150 70 180 82', M.gold[0], 2.4) + `<path d="${rhomb(150, 74, 4, 6)}" fill="#7fb2ff" stroke="${M.gold[3]}" stroke-width="1"/>`;
    // cradled healing light
    s += circle(150, 236, 40, `fill="#fff1c9" opacity=".8"${ctx.blur(4)}`);
    s += ctx.cel(sm([[124, 256], [130, 246], [142, 250], [150, 258], [158, 250], [170, 246], [176, 256], [168, 268], [150, 272], [132, 268]]), M.skin, { ss: [-5, -5], lite: true, sw: 1.8 });
    s += circle(150, 234, 18, `fill="${ctx.rg('orb', 146, 229, 19, [[0, '#ffffff'], [0.55, '#fff6d8'], [1, '#ffd98c']])}" stroke="#fff" stroke-width="1.2"`);
    s += sparkle(150, 232, 13, '#ffffff') + sparkle(114, 212, 4, '#fff6d8', 0.8) + sparkle(188, 218, 5, '#fff6d8', 0.8);
    // falling feathers
    let ft = '';
    for (const [x, y, a] of [[40, 246, 30], [258, 238, -40], [232, 280, 70]]) ft += xf('M0 -9Q5 0 0 9Q-5 0 0 -9Z', { tx: x, ty: y, rot: a, ox: 0, oy: 0 });
    s += `<path d="${ft}" fill="#eef1fa" opacity=".8"/>`;
    return s;
  },
};

// 远古巨龙 - an ancient horned dragon rearing out of the dark, sweeping a cone of pale moonfire across the field.
SUBJECTS.n_dragon = {
  focus: [168, 118], moon: [196, 86, 60], cloudY: 160, ground: false,
  draw(ctx) {
    let s = '';
    const sc = ['#3e5a76', '#26394e', '#7fa0c2', '#0a1220'];
    const memb = ['#2a3b52', '#1a2638', '#4e6a8c', '#0a111c'];
    const ivory = ['#e6dcc4', '#a69a80', '#fffaf0', '#2a2418'];
    const belly = ['#c7b78a', '#8a7a52', '#efe3bc', '#2a2010'];
    // wing behind
    s += ctx.cel(sm([[214, 132], [236, 84], [270, 30, 1], [286, 62], [304, 82, 1], [304, 174, 1], [282, 152], [264, 168], [246, 146]]), memb, { ss: [-10, -8], hl: 0, inner: ctx.line('M226 120L270 32M240 132L300 84M246 146L300 150', memb[3], 2) });
    // neck with scale rows
    let scl = '';
    for (let row = 0; row < 7; row++) for (let c = 0; c < 3; c++) {
      const x = 206 + c * 18 + row * 4, y = 160 + row * 20;
      scl += `M${x - 8} ${y}Q${x} ${y + 9} ${x + 8} ${y}`;
    }
    s += ctx.cel(sm([[176, 138], [206, 122], [234, 138], [250, 178], [264, 228], [288, 300, 1], [178, 300, 1], [188, 250], [186, 200], [170, 166]]), sc, { ss: [-26, -6], hl: 2.4, inner: ctx.line(scl, sc[1], 1.6, 0.8) });
    // belly plates
    s += ctx.cel(sm([[172, 168, 1], [186, 200], [190, 250], [180, 300, 1], [206, 300, 1], [212, 250], [206, 200], [190, 160, 1]]), belly, { ss: [-8, 0], lite: true, sw: 2, inner: ctx.line('M180 190L204 186M186 214L208 212M190 240L212 240M190 266L212 268M188 290L210 292', belly[1], 1.6) });
    // back spines
    let sp = '';
    for (const [x, y, a] of [[226, 116, 0], [242, 146, 10], [252, 178, 15], [260, 210, 20], [268, 244, 25]]) sp += xf('M0 0L16 -8 4 8Z', { tx: x, ty: y, rot: a, ox: 0, oy: 0 });
    s += `<path d="${sp}" fill="${ivory[1]}" stroke="${ivory[3]}" stroke-width="1.4"/>`;
    // horns
    s += `<path d="${sm([[212, 102], [236, 92], [270, 96, 1], [240, 106], [220, 114]])}" fill="${ivory[0]}" stroke="${ivory[3]}" stroke-width="2"/>`;
    s += ctx.cel(sm([[194, 84], [214, 58], [242, 38], [276, 24, 1], [250, 46], [228, 72], [214, 94]]), ivory, { ss: [-6, -6], hl: 2, rw: 0, inner: ctx.line('M210 76L226 70M222 62L238 56M236 50L250 44', ivory[1], 1.6) });
    // mouth interior, teeth, lower jaw
    s += `<path d="M92 130L172 136 176 150 96 170Z" fill="#3a0a16"/><path d="M102 132L106 142 110 133 116 143 120 134 126 144 130 135 136 144 140 136 146 144 150 137 156 144 160 137Z" fill="#f2ead2"/>`;
    s += ctx.cel(sm([[172, 140, 1], [146, 148], [118, 158], [96, 166], [84, 172, 1], [94, 180], [124, 176], [156, 168], [186, 160], [198, 152]]), sc, { ss: [-8, -6], hl: 2, rw: 0 });
    s += `<path d="M100 166L104 158 108 165 114 156 118 163 124 154 128 161 134 152 138 159Z" fill="#f2ead2"/>`;
    // skull / upper jaw
    s += ctx.cel(sm([[208, 80], [186, 74], [164, 80], [140, 94], [112, 106], [90, 112], [78, 118, 1], [82, 130], [96, 134], [124, 134], [150, 132], [172, 136, 1], [190, 150], [210, 148], [224, 128], [224, 98]]), sc, { ss: [-14, -8], hl: 2.6, inner: ctx.line('M96 120Q120 114 150 116M200 132Q210 120 214 106', sc[1], 1.8) });
    s += `<path d="M86 118L94 116" stroke="#0a1220" stroke-width="3"/>`;
    // brow plate + eye
    s += `<path d="${sm([[146, 92], [174, 82], [198, 86], [186, 96], [160, 100]])}" fill="${sc[1]}" stroke="${sc[3]}" stroke-width="2"/>`;
    s += circle(172, 104, 12, `fill="#ffb340" opacity=".55"${ctx.blur(5)}`);
    s += `<path d="M160 104Q172 96 184 102Q172 110 160 104Z" fill="#ffc34a" stroke="#2a1404" stroke-width="1.4"/><path d="M172 98V109" stroke="#2a1404" stroke-width="2.2"/>`;
    // the breath: a widening cone of moonfire with ragged flame ends, hottest at the jaws
    const cone = sm([[98, 146, 1], [78, 148], [56, 158], [36, 172], [14, 188], [-14, 196, 1], [4, 212], [-16, 232, 1], [8, 242], [-8, 266, 1], [20, 268], [10, 300, 1], [40, 282], [48, 308, 1], [66, 284], [84, 304, 1], [88, 270], [106, 240], [110, 200], [110, 168]]);
    s += `<path d="${cone}" fill="#7fd4ff" opacity=".5"${ctx.blur(6)}/>`;
    s += flame(ctx, cone, { ox: 100, oy: 152, outer: '#7cc8f0', mid: '#c4ecff', core: '#ffffff', op: 0.8, k1: 0.72, k2: 0.36 });
    s += ctx.line('M96 156Q60 180 24 214M98 160Q72 210 40 262M102 164Q94 220 74 276', '#ffffff', 2, 0.6);
    s += sparkle(56, 210, 7, '#ffffff') + sparkle(100, 262, 6, '#e8f8ff') + sparkle(20, 246, 5, '#e8f8ff');
    return s;
  },
};

// ======================= LIA =======================

// 盾卫学徒 - a young adult recruit braced behind an oversized crested round shield.
SUBJECTS.lia_recruit = {
  focus: [150, 140],
  draw(ctx) {
    let s = '';
    const skin = M.skin, gam = ['#d9cfc0', '#9a8e80', '#fff6ea', '#2c1c18'];
    const hair = ['#d4a258', '#9a6a34', '#f6d79a', '#3a220e'];
    // short spear behind (over right shoulder)
    s += ctx.cel(poly([[206, 300], [212, 300], [236, 66], [230, 66]]), M.wood, { ss: [-3, 0], lite: true, sw: 1.6 });
    s += ctx.cel(poly([[233, 24], [242, 58], [233, 72], [224, 58]]), M.silver, { ss: [-4, -4], lite: true, sw: 1.8 });
    s += `<path d="M222 72H244L242 78H224Z" fill="${M.crimson[0]}" stroke="${M.crimson[3]}" stroke-width="1.2"/>`;
    // shoulders: padded gambeson + leather pads
    const torso = sm([[150, 148, 1], [196, 158], [228, 176], [246, 214], [252, 300, 1], [48, 300, 1], [54, 214], [72, 176], [104, 158]]);
    s += ctx.cel(torso, gam, { ss: [-24, -6], hl: 0 });
    const pad = sm([[60, 196], [76, 170], [104, 162], [112, 186], [92, 204], [68, 214]]);
    s += ctx.cel(pad + mir(pad), M.leather, { ss: [-8, -8], lite: true });
    // neck + crimson scarf
    s += ctx.cel(poly([[138, 128], [162, 128], [164, 156], [136, 156]]), skin, { ss: [-8, 10], lite: true, sw: 2 });
    s += ctx.cel(sm([[124, 150], [150, 160], [176, 150], [184, 164], [150, 176], [116, 164]]), M.crimson, { ss: [-8, -6], rw: 0 });
    // hair back
    s += ctx.cel(sm([[104, 104], [108, 66], [130, 44], [160, 40], [188, 54], [198, 82], [198, 112], [200, 142, 1], [188, 132], [180, 146, 1], [172, 132], [128, 132], [120, 146, 1], [112, 132], [100, 142, 1], [102, 116]]), hair, { ss: [-10, 0], sw: 2.2, rw: 0 });
    // face
    s += face(ctx, 151, 102, 0.98, { look: 0.15, eye: '#5f8a3a', brow: 0.6, angry: true, browC: '#7a4a1e' });
    // fringe + headband
    const fringe = sm([[110, 98, 1], [112, 70], [128, 52], [152, 46], [178, 52], [194, 72], [194, 100, 1], [186, 86], [178, 76], [170, 88, 1], [160, 76], [148, 86, 1], [138, 76], [124, 94, 1], [118, 86]]);
    s += ctx.cel(fringe, hair, { ss: [-8, -6], sw: 2 });
    s += ctx.cel(sm([[110, 76], [130, 62], [170, 60], [192, 74], [194, 82], [170, 70], [130, 70], [112, 84]]), M.crimson, { ss: [-6, -3], lite: true, sw: 1.6 });
    // the shield
    const sh = 'M150 152C196 152 230 186 230 230C230 274 196 306 150 306C104 306 70 274 70 230C70 186 104 152 150 152Z';
    s += ctx.cel(sh, M.gold, { ss: [-10, -10], hl: 2.6, sw: 2.6 });
    const face2 = xf(sh, { s: 0.875, ox: 150, oy: 229 });
    s += ctx.cel(face2, ['#a8303f', '#6e1a2a', '#e0566a', '#2c0814'], { ss: [-22, -18], hl: 2, rw: 0, sw: 1.6, inner: `<path d="M150 162V300M80 230H220" stroke="#6e1a2a" stroke-width="3" opacity=".35"/>` });
    // crest: flame inside an oath lozenge
    s += ctx.cel(rhomb(150, 226, 30, 42), M.gold, { ss: [-6, -6], lite: true, sw: 1.8 });
    s += ctx.cel(sm([[150, 196, 1], [160, 214], [164, 232], [156, 248], [150, 252, 1], [144, 248], [136, 232], [140, 214]]), ['#ff6b5e', '#c13b4c', '#ffd8a0', '#4a0c14'], { ss: [-5, -5], lite: true, sw: 1.4 });
    let rv = '';
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      rv += `M${Math.round(150 + Math.cos(a) * 75)} ${Math.round(230 + Math.sin(a) * 74)}h0`;
    }
    s += `<path d="${rv}" stroke="${M.gold[3]}" stroke-width="5.4" stroke-linecap="round"/><path d="${rv}" stroke="${M.gold[2]}" stroke-width="3.4"/>`;
    // gripping glove at the left rim
    s += ctx.cel(sm([[66, 214], [76, 204], [86, 210], [84, 230], [74, 238], [64, 230]]), M.leather, { ss: [-5, -4], lite: true, sw: 1.6 });
    return s;
  },
};

// 盾击 - a crested shield driven straight at the viewer, shock rings and shards bursting out.
SUBJECTS.lia_shieldbash = {
  focus: [150, 146],
  draw(ctx) {
    let s = '';
    let sl = '';
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2 + 0.1;
      const r0 = 100 + (i % 3) * 14, r1 = 190, w = 0.03;
      sl += poly([[150 + Math.cos(a - w) * r1, 146 + Math.sin(a - w) * r1], [150 + Math.cos(a) * r0, 146 + Math.sin(a) * r0], [150 + Math.cos(a + w) * r1, 146 + Math.sin(a + w) * r1]]);
    }
    s += `<path d="${sl}" fill="#ffd091" opacity=".28"/>`;
    s += `<ellipse cx="150" cy="146" rx="122" ry="112" fill="none" stroke="#ffe2b0" stroke-width="3" opacity=".35"/>`;
    s += `<ellipse cx="150" cy="146" rx="104" ry="96" fill="none" stroke="#fff3dc" stroke-width="6" opacity=".55"${ctx.blur(3)}/>`;
    const star = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const rr = i % 2 ? 62 : 104 + (i % 4) * 6;
      star.push([150 + Math.cos(a) * rr, 146 + Math.sin(a) * rr * 0.95, 1]);
    }
    s += `<path d="${poly(star)}" fill="#ffd091" opacity=".9"/>`;
    s += `<path d="${xf(poly(star), { s: 0.78, ox: 150, oy: 146 })}" fill="#fff6e2"/>`;
    // heater shield, tilted for momentum
    const T = (d) => xf(d, { rot: -8, ox: 150, oy: 150 });
    const shield = sm([[150, 62, 1], [190, 66], [222, 78, 1], [220, 140], [200, 194], [150, 240, 1], [100, 194], [80, 140], [78, 78, 1], [110, 66]]);
    s += ctx.cel(T(shield), M.gold, { ss: [-10, -10], hl: 3, sw: 3 });
    s += ctx.cel(T(xf(shield, { s: 0.86, ox: 150, oy: 140 })), ['#b4323f', '#741a2a', '#ff7080', '#2c0814'], { ss: [-24, -22], hl: 2, rw: 0, sw: 1.6 });
    s += ctx.cel(T('M96 112L150 150 204 112 204 128 150 168 96 128Z'), M.gold, { ss: [-6, -6], rw: 0, sw: 1.6 });
    s += ctx.cel(T(rhomb(150, 110, 13, 22)), ['#ffd091', '#d9a441', '#ffffff', '#4a2a0c'], { ss: [-5, -6], rw: 0, sw: 1.4 });
    s += sparkle(142, 100, 7, '#ffffff');
    // shards flying outward
    let sh = '';
    const shards = [[60, 70, 10, -30], [238, 64, 9, 25], [48, 196, 8, 50], [252, 200, 11, -40], [92, 262, 7, 10], [214, 266, 8, -20], [30, 132, 6, 0], [272, 130, 7, 0]];
    for (const [x, y, z, rot] of shards) sh += xf(poly([[x, y - z], [x + z * 0.6, y], [x, y + z * 0.5], [x - z * 0.5, y + z * 0.1]]), { rot, ox: x, oy: y });
    s += `<path d="${sh}" fill="#ffe6b8" stroke="#ff8a5c" stroke-width="1.2"/>`;
    // armour sheen: a bright arc hugging the shield rim (+1 armour)
    s += ctx.line(T('M212 82C214 130 200 176 160 220'), '#fff8e6', 3, 0.8);
    return s;
  },
};

/**
 * A row of flame tongues standing on a baseline y = base(x), from x0 to x1.
 * h(i) = height of tongue i, lean = horizontal tip drift. Closed down to y = bottom.
 */
function fireRow(x0, x1, base, n, h, lean = 0, bottom = 310, band = 0) {
  const pts = [];
  const w = (x1 - x0) / n;
  for (let i = 0; i <= n; i++) {
    const x = x0 + w * i;
    pts.push([x, base(x), i === 0 || i === n ? 1 : 0]);
    if (i < n) {
      // S-curved tongue: edges bow sideways, the tip flicks alternately left / right
      const xc = x + w / 2, by = base(xc), hh = h(i), sway = (i % 2 ? 1 : -1) * w * 0.22;
      pts.push([xc - w * 0.26 - sway * 0.4, by - hh * 0.42], [xc + lean + sway, by - hh, 1], [xc + w * 0.2 - sway * 0.2, by - hh * 0.5]);
    }
  }
  // close either as a band following the baseline, or rounded down to `bottom`
  if (band) for (let i = n; i >= 0; i -= 2) pts.push([x0 + w * i, base(x0 + w * i) + band]);
  else pts.push([x1 - w * 0.3, bottom], [x0 + w * 0.3, bottom]);
  return sm(pts);
}
/** a tapered hair lock / leaf along a quadratic centreline root -> ctrl -> tip; w = max width */
function lock(root, ctrl, tip, w, taper = [0.8, 1, 0.6]) {
  const q = (t, i) => (1 - t) ** 2 * root[i] + 2 * (1 - t) * t * ctrl[i] + t * t * tip[i];
  const dq = (t, i) => 2 * (1 - t) * (ctrl[i] - root[i]) + 2 * t * (tip[i] - ctrl[i]);
  const up = [], lo = [];
  [0.25, 0.5, 0.75].forEach((t, i) => {
    const dx = dq(t, 0), dy = dq(t, 1), L = Math.hypot(dx, dy) || 1, h = (w * taper[i]) / 2;
    up.push([q(t, 0) - (dy / L) * h, q(t, 1) + (dx / L) * h]);
    lo.push([q(t, 0) + (dy / L) * h, q(t, 1) - (dx / L) * h]);
  });
  return sm([[root[0], root[1], 1], ...up, [tip[0], tip[1], 1], ...lo.reverse()]);
}
/** y on an ellipse (upper half when sign = -1, lower half when sign = 1) */
const ellY = (cx, cy, rx, ry, sign) => (x) => cy + sign * ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));

/**
 * Layered flame row: a continuous outer row (fireRow) plus one inner tongue (mid) and one
 * white-hot core per tongue, each a narrower/shorter leaf centred on its tongue.
 */
function fireLayers(x0, x1, base, n, h, lean = 0, bottom = 310, o = {}, band = 0) {
  const w = (x1 - x0) / n;
  let mid = '', core = '';
  const leaf = (xc, by, hw, hh, ln) => `M${Math.round(xc - hw)} ${Math.round(by + 4)}Q${Math.round(xc - hw)} ${Math.round(by - hh * 0.45)} ${Math.round(xc + ln)} ${Math.round(by - hh)}Q${Math.round(xc + hw)} ${Math.round(by - hh * 0.4)} ${Math.round(xc + hw)} ${Math.round(by + 4)}Z`;
  for (let i = 0; i < n; i++) {
    const xc = x0 + w * (i + 0.5), by = base(xc), hh = h(i), sway = (i % 2 ? 1 : -1) * w * 0.22;
    mid += leaf(xc, by, w * 0.3, hh * 0.64, lean * 0.7 + sway * 0.6);
    core += leaf(xc, by, w * 0.16, hh * 0.34, lean * 0.4 + sway * 0.3);
  }
  const op = o.op != null && o.op < 1 ? ` opacity="${o.op}"` : '';
  return `<path d="${fireRow(x0, x1, base, n, h, lean, bottom, band)}" fill="${o.outer || '#e8432e'}"${op}/><path d="${mid}" fill="${o.mid || '#ff9a3c'}"/><path d="${core}" fill="${o.core || '#ffe7a6'}"/>`;
}

/** layered flame: outer / mid / core copies of one silhouette, scaled toward (ox, oy) */
function flame(ctx, d, o = {}) {
  const ox = o.ox ?? 150, oy = o.oy ?? 300;
  const pid = ctx.def(d);
  const v = !!o.vert;
  return ctx.use(pid, o.outer || '#e8432e', 1, ox, oy, o.op != null && o.op < 1 ? ` opacity="${o.op}"` : '') + ctx.use(pid, o.mid || '#ff9a3c', o.k1 || (v ? 0.62 : 0.74), ox, oy, '', v) + ctx.use(pid, o.core || '#ffe7a6', o.k2 || (v ? 0.3 : 0.46), ox, oy, '', v);
}

// 烈焰守卫 - a closed-helm guard behind a tower shield forged in fire: molten seams, a wall of flame rising behind.
SUBJECTS.lia_flameguard = {
  focus: [150, 130],
  draw(ctx) {
    let s = '';
    const iron = ['#3c3238', '#241d22', '#6e5e66', '#120b0f'];
    // wall of flame behind
    s += circle(150, 130, 100, `fill="#ff8a3c" opacity=".35"${ctx.blur(12)}`);
    const kh = [120, 176, 150, 206, 160, 196, 170, 126];
    s += fireLayers(24, 276, () => 236, 8, (i) => kh[i], 4, 0, {}, 60);
    // shoulders
    const pau = sm([[104, 142], [84, 132], [56, 138], [42, 160], [46, 180], [80, 176], [106, 164]]);
    s += ctx.cel(pau + mir(pau), M.steel, { ss: [-10, -8], hl: 2.2, rw: 0, inner: ctx.line('M50 158Q74 146 100 152' + mir('M50 158Q74 146 100 152'), M.steel[3], 1.4) });
    // closed helm with ember eyes + crest
    s += `<path d="${sm([[150, 30, 1], [158, 40], [160, 70], [140, 70], [142, 40]])}" fill="${M.crimson[0]}" stroke="${M.crimson[3]}" stroke-width="1.8"/>`;
    const helm = sm([[150, 50], [176, 56], [190, 80], [190, 116], [178, 136], [150, 142], [122, 136], [110, 116], [110, 80], [124, 56]]);
    s += ctx.cel(helm, M.steel, { ss: [-20, -6], hl: 2.6 });
    s += `<path d="M118 92H182V102H156V132H144V102H118Z" fill="#14080a"/>`;
    s += circle(134, 97, 6, `fill="#ff9a3c" opacity=".8"${ctx.blur()}`) + circle(166, 97, 6, `fill="#ff9a3c" opacity=".8"${ctx.blur()}`);
    s += `<path d="M128 97h10M162 97h10" stroke="#ffe7a6" stroke-width="2.6"/>`;
    s += ctx.line('M124 64Q116 84 118 118', M.steel[2], 2.2, 0.7);
    // tower shield of black iron with molten seams
    const sh = sm([[150, 128, 1], [204, 132], [222, 140, 1], [220, 232], [204, 270], [150, 304, 1], [96, 270], [80, 232], [78, 140, 1], [96, 132]]);
    s += ctx.cel(sh, iron, { ss: [-20, -16], hl: 2.4, sw: 3, inner: `<path d="${xf(sh, { s: 0.86, ox: 150, oy: 214 })}" fill="none" stroke="${M.gold[1]}" stroke-width="5"/>` });
    const seams = 'M150 150L132 182 146 200 124 236 138 262M150 150L170 178 158 204 180 236 166 268M96 160L118 186M206 160L184 190M100 236L124 236M200 236L180 236';
    s += ctx.line(seams, '#ff7a2e', 5, 0.55) + ctx.line(seams, '#ffd36b', 1.8);
    // molten flame emblem
    s += circle(150, 214, 30, `fill="#ff9a3c" opacity=".55"${ctx.blur()}`);
    s += flame(ctx, sm([[150, 176, 1], [160, 196], [170, 186], [174, 214], [166, 236], [150, 244], [134, 236], [126, 214], [130, 186], [140, 196]]), { ox: 150, oy: 244, outer: '#ff5a3c', op: 1 });
    // flame tongues licking over the rim
    s += fireLayers(78, 112, () => 148, 2, (i) => [30, 18][i], -2, 150) + fireLayers(190, 222, () => 146, 2, (i) => [20, 32][i], 2, 150);
    return s;
  },
};

// 战吼鼓舞 - the Hearst war banner thrust high over a cheering host; golden war-cry waves and rising chevrons.
SUBJECTS.lia_rally = {
  focus: [150, 120],
  draw(ctx) {
    let s = '';
    // war-cry waves rising from the host
    for (const [rr, op, w] of [[110, 0.5, 4], [150, 0.34, 3], [190, 0.2, 2.4]]) s += `<path d="M${150 - rr} 300A${rr} ${rr} 0 0 1 ${150 + rr} 300" fill="none" stroke="#ffd091" stroke-width="${w}" opacity="${op}"/>`;
    // rising chevrons (buff)
    const chev = (x, y, k) => xf('M0 0L14 -12 28 0 28 9 14 -3 0 9Z', { tx: x - 14 * k, ty: y, s: k, ox: 0, oy: 0 });
    s += `<path d="${chev(46, 186, 1.3)}${chev(46, 150, 1.05)}${chev(46, 120, 0.8)}${chev(46, 96, 0.6)}" fill="#ffd091" opacity=".9"/>`;
    s += `<path d="${chev(46, 186, 1.3)}" fill="#fff4dc"${ctx.blur(2)}/>`;
    // the host: helmets and raised blades, rim-lit
    let host = '';
    for (const [x, y, h, a] of [[30, 262, 70, -16], [70, 254, 86, -8], [196, 256, 84, 8], [240, 260, 76, 14], [278, 266, 60, 20]]) host += xf(`M${x - 3} ${y}V${y - h}L${x} ${y - h - 16}L${x + 3} ${y - h}V${y}Z`, { rot: a, ox: x, oy: y });
    s += `<path d="${host}" fill="#2a0a14" stroke="#ffb36b" stroke-width="1.4"/>`;
    const crowd = [[-10, 310, 1]];
    for (const [x, y] of [[10, 272], [50, 264], [90, 276], [176, 270], [216, 262], [258, 272], [298, 266]]) crowd.push([x - 22, y + 26, 1], [x - 10, y + 14], [x - 11, y], [x, y - 10], [x + 11, y], [x + 10, y + 14], [x + 22, y + 26, 1]);
    crowd.push([310, 310, 1]);
    s += `<path d="${sm(crowd)}" fill="#1c070e" stroke="#ff8a5c" stroke-width="1.6"/>`;
    // pole + finial
    s += `<path d="M104 300L112 300 126 40 118 40Z" fill="${M.wood[0]}" stroke="${M.wood[3]}" stroke-width="1.8"/>`;
    s += circle(122, 30, 24, `fill="#ffd091" opacity=".7"${ctx.blur(6)}`);
    s += `<path d="${rhomb(122, 24, 9, 18)}" fill="#ffd091" stroke="#4a2a0c" stroke-width="1.6"/><path d="M122 6L131 24 122 42Z" fill="#d9a441"/><path d="M108 40H136L132 48H112Z" fill="${M.gold[0]}" stroke="${M.gold[3]}" stroke-width="1.4"/>`;
    // the banner: big swallowtail, waving out to the right
    const ban = sm([[124, 46, 1], [168, 36], [218, 48], [272, 40, 1], [256, 92], [276, 150, 1], [232, 136], [198, 164, 1], [182, 132], [152, 144], [122, 152, 1]]);
    s += ctx.cel(ban, M.crimson, { ss: [-16, -14], hl: 2.6, rim: '#ffd091', inner: `<path d="M170 40Q164 90 176 140M226 46Q216 96 232 136" fill="none" stroke="${M.crimson[1]}" stroke-width="9" opacity=".6"/>` });
    s += ctx.line('M126 54Q170 44 216 56 262 50', M.gold[0], 3) + ctx.line('M126 142Q154 136 182 140', M.gold[0], 2.4);
    // emblem: flame in the oath lozenge
    s += ctx.cel(rhomb(196, 96, 24, 34), M.gold, { ss: [-5, -5], lite: true, sw: 1.8 });
    s += `<path d="${sm([[196, 70, 1], [205, 88], [207, 104], [196, 120, 1], [185, 104], [187, 88]])}" fill="#ff6b5e" stroke="#4a0c14" stroke-width="1.4"/><path d="${sm([[196, 86, 1], [201, 98], [196, 112, 1], [191, 98]])}" fill="#ffd8a0"/>`;
    s += sparkle(122, 20, 11, '#ffffff');
    return s;
  },
};

// 赤焰冲锋者 - a knight sprinting into the charge, flaming blade levelled forward, a wake of fire behind.
SUBJECTS.lia_charger = {
  focus: [160, 140],
  draw(ctx) {
    let s = '';
    const sv = M.silver;
    // speed streaks + fire wake
    s += ctx.line('M10 92H110M0 132H80M30 238H120M220 250H296M230 52H290', '#ffd091', 1.6, 0.45);
    s += `<path d="${sm([[150, 130, 1], [100, 104], [40, 96], [-10, 104, 1], [-10, 260, 1], [50, 250], [110, 240], [150, 226, 1]])}" fill="#ff5a3c" opacity=".45"${ctx.blur(8)}/>`;
    s += flame(ctx, sm([[150, 150, 1], [114, 120], [80, 130], [44, 108], [4, 116, 1], [36, 140], [-4, 164, 1], [40, 180], [4, 212, 1], [52, 212], [26, 244, 1], [80, 230], [120, 222], [150, 206, 1]]), { ox: 160, oy: 170 });
    // cape streaming back
    s += ctx.cel(sm([[152, 120, 1], [122, 106], [86, 96], [42, 90, 1], [66, 114], [38, 136, 1], [74, 144], [56, 172, 1], [98, 166], [134, 172, 1]]), M.crimson, { ss: [-10, -10], lite: true });
    // legs: back leg trailing, front leg driving forward
    s += ctx.cel(sm([[128, 192], [154, 206], [140, 232], [116, 250], [86, 262], [56, 264, 1], [50, 282, 1], [92, 280], [124, 264], [150, 238], [160, 214]]), ['#a9b0c2', '#6c7389', '#e2e6ef', '#1e2234'], { ss: [-6, -8], lite: true, sw: 2.2 });
    s += circle(136, 240, 7, `fill="#a9b0c2" stroke="#1e2234" stroke-width="2"`);
    s += ctx.cel(sm([[150, 196], [180, 202], [204, 218], [208, 248], [212, 276], [226, 282, 1], [226, 292, 1], [194, 292, 1], [196, 272], [192, 236], [178, 226], [146, 216]]), sv, { ss: [-10, -6], lite: true });
    s += circle(198, 224, 8, `fill="${sv[0]}" stroke="${sv[3]}" stroke-width="2"`);
    // torso leaning into the run + tabard
    s += ctx.cel(sm([[150, 116], [182, 114], [200, 134], [194, 170], [172, 200], [136, 206], [120, 186], [128, 148]]), sv, { ss: [-16, -10], hl: 2.6 });
    s += `<path d="M124 182L180 184 190 214 152 226 116 214Z" fill="${M.crimson[0]}" stroke="${M.crimson[3]}" stroke-width="2"/><path d="M152 186V224" stroke="${M.crimson[1]}" stroke-width="3"/>`;
    s += `<path d="${rhomb(162, 150, 8, 12)}" fill="#ffd091" stroke="#4a2a0c" stroke-width="1.4"/>`;
    // helm with streaming crest
    s += `<path d="${sm([[196, 70, 1], [170, 58], [138, 58], [100, 52, 1], [130, 72], [114, 82, 1], [150, 82], [186, 84, 1]])}" fill="${M.crimson[0]}" stroke="${M.crimson[3]}" stroke-width="2"/>`;
    s += ctx.cel(sm([[178, 72], [204, 72], [220, 88], [222, 106], [208, 118], [184, 116], [172, 104], [160, 98, 1], [170, 88]]), sv, { ss: [-10, -6], hl: 2.4 });
    s += `<path d="M198 92L224 94 222 102 198 100Z" fill="#14080a"/><path d="M208 97h10" stroke="#ff9a3c" stroke-width="2.6"/>`;
    // arms forward, both hands on the hilt
    s += ctx.cel(sm([[170, 120], [196, 112], [214, 124], [212, 142], [192, 148], [172, 138]]) + sm([[186, 132], [210, 140], [228, 150], [222, 166], [200, 160], [182, 150]]), sv, { ss: [-8, -8], lite: true });
    s += ctx.line(sm([[170, 120], [196, 112], [214, 124], [212, 142], [192, 148], [172, 138]]), sv[3], 2);
    // flaming blade levelled up-forward
    s += flame(ctx, sm([[226, 150, 1], [222, 128], [236, 132], [238, 108], [252, 116], [258, 88], [272, 96], [282, 62, 1], [286, 92], [278, 120], [258, 146], [240, 160, 1]]), { ox: 236, oy: 150, op: 0.85 });
    s += `<path d="M226 150L284 68 291 73 233 155Z" fill="#f4f0ea" stroke="#3a1a1a" stroke-width="1.8"/><path d="M287 71L230 152" stroke="#b7aeb0" stroke-width="2"/>`;
    s += `<path d="M216 140L240 160 236 165 212 145Z" fill="${M.gold[0]}" stroke="${M.gold[3]}" stroke-width="1.6"/>`;
    s += `<path d="M214 150C218 144 228 144 232 150S234 162 228 164 214 162 212 158 212 154 214 150Z" fill="${M.darkSteel[0]}" stroke="${M.darkSteel[3]}" stroke-width="1.8"/>`;
    s += sparkle(286, 66, 8, '#ffffff');
    return s;
  },
};

// 铁壁守护者 - a giant guardian behind a planted tower shield; a hexagonal ward of armour shimmers around it.
SUBJECTS.lia_bulwark = {
  focus: [150, 140],
  draw(ctx) {
    let s = '';
    // hex ward
    let hex = '';
    const H = (x, y, k) => poly([0, 1, 2, 3, 4, 5].map((i) => [x + Math.cos((i * Math.PI) / 3) * k, y + Math.sin((i * Math.PI) / 3) * k]));
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (1.02 + (i / 12) * 0.96);
      hex += H(150 + Math.cos(a) * 128, 168 + Math.sin(a) * 140, 13);
      if (i % 2 && i > 1 && i < 11) hex += H(150 + Math.cos(a) * 104, 168 + Math.sin(a) * 114, 11);
    }
    s += `<path d="${hex}" fill="#ffd091" fill-opacity=".1" stroke="#ffd091" stroke-width="1.6" opacity=".75"/>`;
    s += `<path d="M22 300A128 140 0 0 1 278 300" fill="none" stroke="#fff1c9" stroke-width="5" opacity=".4"${ctx.blur(4)}/>`;
    // shoulders + helm of the giant
    const pau = sm([[96, 88], [70, 74], [40, 80], [24, 104], [30, 128], [70, 120], [96, 110]]);
    s += ctx.cel(pau + mir(pau), M.darkSteel, { ss: [-10, -8] });
    const helm = sm([[150, 22], [178, 28], [192, 52], [192, 92, 1], [108, 92, 1], [108, 52], [122, 28]]);
    s += ctx.cel(helm, M.steel, { ss: [-18, -4], hl: 2.6, inner: `<path d="M150 22V92" stroke="${M.steel[1]}" stroke-width="4" opacity=".5"/>` });
    s += `<path d="M116 58H184V68H116Z" fill="#14080a"/>` + `<path d="M128 63h12M160 63h12" stroke="#ffb36b" stroke-width="3"/>`;
    s += ctx.cel(sm([[150, 4, 1], [160, 14], [158, 30], [142, 30], [140, 14]]), M.crimson, { ss: [-4, -2], lite: true, sw: 1.8 });
    // tower shield
    const sh = sm([[84, 92, 1], [150, 80], [216, 92, 1], [220, 250], [150, 292, 1], [80, 250]]);
    s += ctx.cel(sh, M.steel, { ss: [-16, -14], hl: 3, sw: 3 });
    const face2 = xf(sh, { s: 0.86, ox: 150, oy: 190 });
    s += ctx.cel(face2, ['#a8303f', '#6e1a2a', '#e0566a', '#2c0814'], { ss: [-26, -22], hl: 2, rw: 0, sw: 1.8, inner: `<path d="${xf(sh, { s: 0.78, ox: 150, oy: 190 })}" fill="none" stroke="${M.gold[1]}" stroke-width="2.4"/>` });
    s += ctx.cel('M98 140H202V152H98ZM98 216H202V228H98Z', M.darkSteel, { ss: [0, -4], lite: true, sw: 1.4 });
    let rv = '';
    for (let x = 106; x <= 196; x += 18) rv += `M${x} 146h0M${x} 222h0`;
    s += `<path d="${rv}" stroke="${M.steel[2]}" stroke-width="3.4"/>`;
    // boss + oath crystal
    s += ctx.cel('M150 160C164 160 174 170 174 184C174 198 164 208 150 208C136 208 126 198 126 184C126 170 136 160 150 160Z', M.gold, { ss: [-6, -6], hl: 2, rw: 0, sw: 2 });
    s += ctx.cel(rhomb(150, 184, 10, 16), ['#ffd091', '#d9a441', '#ffffff', '#4a2a0c'], { ss: [-3, -4], lite: true, sw: 1.4 });
    s += sparkle(146, 176, 6, '#ffffff');
    // gauntlets gripping the top corners
    const g = sm([[78, 92], [90, 84], [102, 90], [102, 108], [90, 116], [78, 110]]);
    s += ctx.cel(g + mir(g), M.darkSteel, { ss: [-5, -5], hl: 1.8, rw: 0 });
    s += ctx.line('M82 98H100M82 104H100' + mir('M82 98H100M82 104H100'), M.darkSteel[3], 1.2);
    // ground cracks
    s += ctx.line('M110 282L84 292 60 290M190 282L214 294 246 292M150 292V300', '#ffb36b', 2, 0.7);
    return s;
  },
};

// 骑士队长 - a veteran captain with cropped silver hair, sword thrust forward-up ("跟我上！"), the company's spears and banners behind.
SUBJECTS.lia_captain = {
  focus: [150, 120],
  draw(ctx) {
    let s = '';
    const sv = M.silver;
    const hair = ['#d6d8e2', '#9a9cae', '#ffffff', '#2e3040'];
    // the company: spears and two banners
    let sp = '';
    for (const [x, h] of [[22, 150], [44, 128], [256, 132], [280, 152], [64, 110], [238, 112]]) sp += `M${x} 300V${300 - h}h-4l4-16 4 16z`;
    s += `<path d="${sp}" fill="#2a0a14" stroke="#ffb36b" stroke-width="1.2"/>`;
    const banL = 'M30 150H70V214L50 202 30 214Z';
    s += `<path d="${banL}${mir(banL)}" fill="#7c1f33" stroke="#ffd091" stroke-width="1.4"/><path d="${rhomb(50, 176, 7, 11)}${rhomb(250, 176, 7, 11)}" fill="#ffd091"/>`;
    s += `<path d="M-10 300C30 250 70 244 100 254S170 240 200 252 270 240 310 256V310H-10Z" fill="#14050a"/>`;
    // cape + breastplate
    s += ctx.cel(sm([[96, 172], [70, 210], [56, 300, 1], [244, 300, 1], [232, 210], [206, 172]]), M.crimson, { ss: [-16, 0], lite: true, sw: 2 });
    s += ctx.cel(sm([[104, 172], [150, 160], [196, 172], [204, 230], [200, 300, 1], [100, 300, 1], [96, 230]]), sv, { ss: [-24, -6], hl: 2.4, inner: `<path d="M150 166V300M108 234Q150 222 192 234M104 262Q150 250 196 262" fill="none" stroke="${sv[1]}" stroke-width="2"/>` });
    s += circle(150, 200, 10, `fill="${M.gold[0]}" stroke="${M.gold[3]}" stroke-width="1.8"`) + `<path d="${rhomb(150, 200, 4, 7)}" fill="#c13b4c"/>`;
    // sword arm thrust forward-up + near pauldron
    s += ctx.cel(sm([[184, 168], [212, 152], [238, 132], [252, 144], [226, 168], [196, 188]]) + sm([[178, 162], [204, 154], [226, 166], [230, 188], [206, 196], [184, 186]]), sv, { ss: [-8, -8], lite: true, inner: `<path d="M184 170Q206 160 226 172" stroke="${M.gold[1]}" stroke-width="2.2" fill="none"/>` });
    s += `<path d="M252 128L286 62 294 66 260 132Z" fill="#fff1c9" opacity=".8"${ctx.blur(4)}/>`;
    s += `<path d="M250 126L286 58 294 62 258 130Z" fill="#f4f0ea" stroke="#3a1a1a" stroke-width="1.8"/><path d="M290 62L256 128" stroke="#b7aeb0" stroke-width="2"/>`;
    s += `<path d="M240 118L268 134 264 140 236 124Z" fill="${M.gold[0]}" stroke="${M.gold[3]}" stroke-width="1.6"/>`;
    s += `<path d="M236 132C240 126 250 124 256 128S262 142 258 146 244 150 238 146 232 138 236 132Z" fill="${M.darkSteel[0]}" stroke="${M.darkSteel[3]}" stroke-width="1.8"/>`;
    s += sparkle(290, 62, 10, '#ffffff');
    // kite shield on the far arm, crest of Hearst
    const kite = sm([[50, 188, 1], [92, 180], [116, 192, 1], [110, 246], [80, 292, 1], [50, 244]]);
    s += ctx.cel(kite, M.gold, { ss: [-8, -8], hl: 2.2, rw: 0, sw: 2.4 });
    s += `<path d="${xf(kite, { s: 0.8, ox: 82, oy: 226 })}" fill="${M.crimson[0]}" stroke="${M.crimson[3]}" stroke-width="1.4"/><path d="${rhomb(82, 224, 10, 15)}" fill="${M.gold[0]}" stroke="${M.gold[3]}" stroke-width="1.2"/>`;
    // neck + face (shouting), cropped silver hair, scar
    s += `<path d="M136 132H160L162 162H134Z" fill="${M.skin[0]}" stroke="${M.skin[3]}" stroke-width="2"/><path d="M136 136Q150 146 160 138V144Q148 150 136 142Z" fill="${M.skin[1]}"/>`;
    s += ctx.cel(sm([[112, 104], [114, 74], [134, 56], [162, 54], [186, 68], [192, 98], [186, 118], [180, 98], [116, 100]]), hair, { ss: 0, lite: true, sw: 2 });
    s += face(ctx, 152, 106, 0.95, { look: 0.3, eye: '#6f8fb8', angry: true, mouth: 'shout', mouthW: 6, browC: '#8a8ca0' });
    s += ctx.cel(sm([[112, 98, 1], [116, 72], [136, 58], [164, 56], [186, 70], [190, 96, 1], [180, 84], [170, 76], [162, 86, 1], [150, 74], [138, 84, 1], [128, 76], [120, 90]]), hair, { ss: [-6, -5], lite: true, sw: 1.8 });
    s += ctx.line('M170 112L178 124', '#b0646a', 1.6);
    return s;
  },
};

// 烈焰冲击 - a colossal sword of fire driven down from the sky; the ground erupts in a ring of flame.
SUBJECTS.lia_flamestrike = {
  focus: [160, 190],
  draw(ctx) {
    let s = '';
    // ground + burning sigil
    s += `<path d="M-10 236C40 228 100 238 160 232S260 226 310 234V310H-10Z" fill="#14050a"/>`;
    s += `<ellipse cx="166" cy="244" rx="122" ry="30" fill="none" stroke="#ffd091" stroke-width="2.4" opacity=".75"/><ellipse cx="166" cy="244" rx="98" ry="22" fill="none" stroke="#ffd091" stroke-width="1.2" stroke-dasharray="6 5" opacity=".7"/>`;
    s += ctx.line('M166 246L120 268 90 266M166 246L212 274 246 270M166 246L156 292M166 246L52 252M166 246L276 254', '#ff9a3c', 2.4, 0.9);
    // heat column + the sword of fire (blade core, guard, hilt)
    s += `<path d="M10 -10L90 -10 190 236 150 240Z" fill="#ff6b3c" opacity=".5"${ctx.blur(9)}/>`;
    s += flame(ctx, sm([[30, -14, 1], [84, -14, 1], [92, 30], [112, 48], [104, 64], [128, 92], [150, 140], [176, 236, 1], [140, 150], [110, 112], [86, 96], [86, 76], [62, 58], [62, 36]]), { ox: 150, oy: 220, op: 1 });
    s += `<path d="M58 40L74 32 170 228 164 232Z" fill="#fffbe8"/>`;
    s += `<path d="M38 52L84 26 88 32 42 58Z" fill="${M.gold[0]}" stroke="${M.gold[3]}" stroke-width="1.6"/><path d="M58 30L46 6 54 2 66 28Z" fill="${M.wood[1]}" stroke="${M.gold[3]}" stroke-width="1.4"/>`;
    s += `<path d="${rhomb(62, 40, 6, 9)}" fill="#ffd091" stroke="#4a2a0c" stroke-width="1.2"/>`;
    // eruption ring at impact: back flames, white-hot core, front flames
    s += circle(166, 226, 70, `fill="#ffb347" opacity=".55"${ctx.blur(9)}`);
    const kb = [30, 70, 56, 92, 64, 84, 36];
    s += fireLayers(70, 262, ellY(166, 236, 96, 20, -1), 7, (i) => kb[i], -2, 250);
    s += `<ellipse cx="166" cy="232" rx="34" ry="14" fill="#fffbe8"/>`;
    const kf = [22, 44, 36, 52, 34, 26];
    s += fireLayers(66, 266, ellY(166, 236, 100, 22, 1), 6, (i) => kf[i], 3, 0, {}, 12);
    // debris
    let deb = '';
    for (const [x, y, k] of [[60, 176, 6], [262, 140, 7], [36, 222, 5], [280, 216, 6], [236, 104, 4], [110, 150, 4]]) deb += rhomb(x, y, k * 0.5, k);
    s += `<path d="${deb}" fill="#ffd091"/>`;
    s += sparkle(166, 224, 14, '#ffffff') + sparkle(206, 178, 6, '#fff4dc');
    return s;
  },
};

// 赫斯特堡垒 - the Hearst fortress on its crag under the eclipse: crimson banners, gold-lit windows, a burning gate.
SUBJECTS.lia_fortress = {
  focus: [150, 110],
  draw(ctx) {
    let s = '';
    const stone = ['#8a7d86', '#574a56', '#c8b8be', '#1a1218'];
    const roof = ['#7a1f33', '#4a1022', '#b8475c', '#22060f'];
    const lit = '#ffd36b';
    // eclipse behind the keep
    s += circle(150, 64, 54, 'fill="#ffd091" opacity=".55"' + ctx.blur(6)) + circle(150, 64, 46, 'fill="#1a0610" stroke="#ffd091" stroke-width="2.4"');
    // crag
    s += ctx.cel(sm([[-10, 236, 1], [24, 222], [62, 230], [96, 220], [150, 226], [204, 218], [238, 228], [276, 220], [310, 232, 1], [310, 310, 1], [-10, 310, 1]]), ['#2a1a22', '#1a0e14', '#4a3240', '#0a0408'], { ss: [-20, -6], hl: 2, rw: 2 });
    // outer + inner towers
    const tw2 = 'M16 236V146H46V236Z', tr2 = 'M10 148L31 98 52 148Z';
    const tw = 'M48 236V108H92V236Z', tr = 'M42 110L70 40 98 110Z';
    s += ctx.cel(tw2 + mir(tw2) + tw + mir(tw), stone, { ss: [-12, 0], hl: 2.2 });
    s += ctx.cel(tr2 + mir(tr2) + tr + mir(tr), roof, { ss: [-12, 0], lite: true, sw: 2.2 });
    // curtain walls with crenellations
    let cren = 'M92 236V168';
    for (let x = 92; x < 116; x += 8) cren += `H${x}V161H${x + 4}V168`;
    cren += 'H116V236Z';
    s += ctx.cel(cren + mir(cren), stone, { ss: [-6, 0], lite: true, sw: 2 });
    // keep
    s += ctx.cel('M114 236V84H186V236Z', stone, { ss: [-20, 0], hl: 2.4 });
    s += ctx.cel('M106 86L150 6 194 86Z', roof, { ss: [-14, 0], hl: 1.8, sw: 2.2 });
    s += ctx.line('M114 118H186M114 160H186M114 202H186M48 150H92M208 150H252M16 190H46M254 190H284', stone[1], 1.4, 0.7);
    // masonry texture
    let brick = '';
    for (const [x0, x1, y0, y1] of [[116, 184, 126, 154], [116, 184, 168, 196], [50, 90, 116, 146], [210, 250, 116, 146], [50, 90, 160, 228], [210, 250, 160, 228]]) {
      for (let y = y0, k = 0; y < y1; y += 9, k++) brick += `M${x0 + (k % 2) * 8} ${y}h10M${x0 + 22 + (k % 2) * 8} ${y}h12M${Math.min(x1 - 12, x0 + 44 + (k % 2) * 6)} ${y}h10`;
    }
    s += ctx.line(brick, stone[1], 1.2, 0.45);
    // banners: pennants on spires + long banners down the keep
    s += ctx.line('M150 6V-8M70 40V22M230 40V22', '#2a1a10', 2);
    const fl = (x, y, w) => `M${x} ${y}L${x + w} ${y + 3}L${x + w - 5} ${y + 7}L${x + w} ${y + 11}L${x} ${y + 12}Z`;
    s += `<path d="${fl(150, -8, 26)}${fl(70, 22, 20)}${fl(230, 22, 20)}" fill="#c13b4c" stroke="#ffd091" stroke-width="1"/>`;
    const lb = 'M118 92H134V156L126 148 118 156Z';
    s += `<path d="${lb}${mir(lb)}" fill="#c13b4c" stroke="#ffd091" stroke-width="1.4"/><path d="${rhomb(126, 112, 4, 7)}${rhomb(174, 112, 4, 7)}" fill="#ffd091"/>`;
    // lit windows
    s += circle(150, 150, 64, `fill="${lit}" opacity=".16"${ctx.blur(10)}`);
    let win = '';
    for (const [x, y] of [[147, 96], [130, 170], [164, 170], [64, 124], [230, 124], [64, 176], [230, 176], [28, 166], [266, 166]]) win += `M${x} ${y + 13}V${y + 4}Q${x + 3} ${y} ${x + 6} ${y + 4}V${y + 13}Z`;
    s += `<path d="${win}" fill="${lit}" stroke="#3a1608" stroke-width="1.2"/>`;
    // oath crystal + glowing gate
    s += circle(150, 136, 18, 'fill="#ffd091" opacity=".55"');
    s += `<path d="${rhomb(150, 136, 10, 17)}" fill="#ffd091" stroke="#4a2a0c" stroke-width="1.6"/><path d="M150 119L160 136 150 153Z" fill="#d9a441"/>`;
    s += `<path d="M130 236V204Q150 182 170 204V236Z" fill="${ctx.lgb('gate', 0, 1, [[0, '#fff1c9'], [1, '#ff9a3c']])}" stroke="#2a0a0a" stroke-width="2"/>`;
    s += ctx.line('M137 202V236M144 196V236M150 194V236M156 196V236M163 202V236M132 212H168M131 224H169', '#5a1a0a', 1.6, 0.8);
    s += `<path d="M126 236L174 236 194 272 106 272Z" fill="#3a2028" opacity=".8"/><ellipse cx="150" cy="244" rx="46" ry="12" fill="#ffb347" opacity=".45"${ctx.blur(6)}/>`;
    s += `<path d="M-10 246C40 236 80 250 130 242S220 236 310 248V262C230 252 170 262 120 256S30 252 -10 262Z" fill="#c8a0b0" opacity=".12"/>`;
    s += sparkle(146, 128, 6, '#ffffff');
    return s;
  },
};

// 莉亚·赫斯特 - Lia standing in a ring of fire she just unleashed: crimson high ponytail streaming, sword raised, oath crystal blazing.
SUBJECTS.lia_hero = {
  focus: [150, 130], ringR: 122, bgFlames: false,
  draw(ctx) {
    let s = '';
    const sv = M.silver;
    const hair = ['#d23a4a', '#8a1c2e', '#ff7a86', '#3a0812'];
    // fire ring, back half (behind her)
    const k = [46, 60, 52, 62, 44];
    s += fireLayers(-6, 306, ellY(150, 254, 156, 30, -1), 5, (i) => k[i], -3, 300);
    // cape
    s += ctx.cel(sm([[112, 164], [74, 176], [36, 210], [10, 252, 1], [42, 244], [26, 290, 1], [140, 300, 1], [118, 230]]), M.crimson, { ss: [-12, -6], lite: true });
    // ponytail (four tapered locks from the high tie) + the hair behind the face
    const tail = lock([124, 50], [62, 2], [6, 80], 30) + lock([122, 58], [66, 44], [22, 128], 30) + lock([120, 66], [96, 86], [64, 148], 24) + lock([126, 46], [92, 14], [42, 26], 12);
    s += ctx.cel(tail + sm([[112, 92], [116, 64], [140, 50], [168, 54], [184, 74], [186, 108], [180, 140], [118, 134], [108, 120]]), hair, { ss: [-7, -9], hl: 2.2, rw: 0 });
    s += ctx.line('M116 52Q66 24 22 70M114 62Q72 60 40 112M114 70Q92 92 74 132', hair[1], 1.6, 0.85);
    // armour: breastplate, far pauldron, sword arm (bent), near pauldron
    const chest = sm([[104, 162], [146, 152], [186, 160], [200, 196], [196, 248], [182, 300, 1], [96, 300, 1], [90, 246], [94, 196]]);
    s += ctx.cel(chest, sv, { ss: [-22, -6], hl: 2.6, rim: '#ffd091', inner: `<path d="M106 238Q146 228 192 238" fill="none" stroke="${sv[1]}" stroke-width="2"/>` });
    s += `<path d="M124 150C129 149 141 158 150 158S171 149 176 150 184 162 180 166 160 176 150 176 124 170 120 166 119 151 124 150Z" fill="${M.wine[0]}" stroke="${M.wine[3]}" stroke-width="1.8"/>`;
    const pauF = sm([[118, 164], [98, 154], [76, 160], [64, 180], [70, 196], [100, 188], [120, 178]]);
    const arm = sm([[192, 160], [214, 144], [232, 128], [248, 140], [230, 160], [204, 180]]) + sm([[230, 140], [226, 118], [228, 98], [246, 96], [248, 118], [252, 138]]);
    const pauN = sm([[176, 160], [202, 152], [226, 164], [230, 186], [206, 194], [182, 184]]);
    s += ctx.cel(pauF + arm + pauN, sv, { ss: [-8, -8], lite: true, inner: ctx.line(`${pauN}M72 180Q92 168 114 172M182 168Q204 158 226 170`, M.liaRed, 2.2) });
    s += ctx.line(pauN, sv[3], 2.2) + circle(240, 138, 8, `fill="${sv[0]}" stroke="${sv[3]}" stroke-width="2"`);
    // oath crystal
    s += circle(148, 202, 24, `fill="#ffd091" opacity=".8"${ctx.blur()}`);
    s += `<path d="${rhomb(148, 202, 11, 19)}" fill="#ffd091" stroke="#4a2a0c" stroke-width="1.8"/><path d="M148 183L159 202 148 221Z" fill="#d9a441"/>` + sparkle(144, 194, 7, '#ffffff');
    // blade wreathed in flame, ring guard, gauntlet
    s += `<path d="M236 86L256 0 272 6 254 90Z" fill="#ffb347" opacity=".9"${ctx.blur()}/>`;
    s += `<path d="M240 84L258 6 266 8 250 86Z" fill="#f4f0ea" stroke="#3a1a1a" stroke-width="1.8"/><path d="M254 10L246 84" stroke="#b7aeb0" stroke-width="2"/>`;
    s += `<path d="M234 88a11 7 -15 1 1 22 -6" fill="none" stroke="${M.gold[3]}" stroke-width="5.4"/><path d="M234 88a11 7 -15 1 1 22 -6" fill="none" stroke="${M.gold[0]}" stroke-width="2.8"/>`;
    s += `<path d="M226 92C230 89 242 88 246 90S253 100 252 104 245 112 240 112 226 109 224 106 222 95 226 92Z" fill="${M.darkSteel[0]}" stroke="${M.darkSteel[3]}" stroke-width="1.8"/>`;
    s += sparkle(262, 6, 9, '#ffffff');
    // neck + face
    s += `<path d="M134 128H158L160 156H132Z" fill="${M.skin[0]}" stroke="${M.skin[3]}" stroke-width="2"/><path d="M134 132Q148 142 158 134V140Q146 146 134 138Z" fill="${M.skin[1]}"/>`;
    s += face(ctx, 148, 104, 0.98, { look: 0.35, eye: '#e0a02a', angry: true, mouth: 'open', mouthW: 4.6 });
    s += ctx.line('M170 112L176 124', '#b0646a', 1.4);
    // fringe + side lock, the dark-red streak, gold hair ring
    s += ctx.cel(sm([[110, 108, 1], [112, 76], [128, 56], [154, 50], [178, 58], [190, 80], [192, 112, 1], [182, 90], [174, 80], [168, 94, 1], [158, 78], [148, 92, 1], [138, 80], [126, 100, 1], [120, 92]]) + lock([186, 86], [194, 106], [186, 138], 10), hair, { ss: [-8, -6], lite: true, sw: 2 });
    s += `<path d="${lock([114, 88], [122, 112], [110, 146], 12)}" fill="#5e1020" stroke="#24040e" stroke-width="1.6"/>`;
    s += `<path d="M118 50L130 60" stroke="${M.gold[3]}" stroke-width="8"/><path d="M118 50L130 60" stroke="${M.gold[0]}" stroke-width="5"/>`;
    // fire ring, front: low glowing rim + flames at both flanks
    s += `<path d="M-6 262Q150 318 306 262" fill="none" stroke="#ffd091" stroke-width="3" opacity=".8"/>`;
    s += fireLayers(-6, 80, ellY(150, 256, 156, 30, 1), 2, (i) => [50, 30][i], 5, 330) + fireLayers(220, 306, ellY(150, 256, 156, 30, 1), 2, (i) => [30, 52][i], -5, 330);
    return s;
  },
};

// ------------------------------------------------------------------ build
function build(card) {
  const subj = SUBJECTS[card.id];
  if (!subj) return null;
  const ctx = makeCtx(card);
  const o = subj;
  const bg = background(ctx, o);
  const body = subj.draw(ctx);
  const ov = overlays(ctx, o);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs>${ctx.defs.join('')}</defs>${bg}<g stroke-linejoin="round" stroke-linecap="round">${body}</g>${ov}</svg>\n`;
  return svg;
}

const FORBIDDEN = [/<script/i, /<foreignObject/i, /<text[\s>]/i, /<image[\s>]/i, /\son[a-z]+\s*=/i, /href\s*=\s*"(?!#)/i, /@import|@font-face/i];
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
let n = 0;
for (const card of CARDS.filter((c) => c.class === 'neutral' || c.class === 'lia')) {
  if (only && !only.includes(card.id)) continue;
  const svg = build(card);
  if (!svg) { console.warn(`[todo] ${card.id} has no subject yet`); continue; }
  const { bytes, issues } = check(svg, card.id);
  fs.writeFileSync(path.join(OUT, `${card.id}.svg`), svg);
  n++;
  console.log(`${issues.length ? '!' : ' '} ${card.id.padEnd(18)} ${(bytes / 1024).toFixed(1)}KB ${issues.join('; ')}`);
}
console.log(`wrote ${n} card(s) -> ${path.relative(root, OUT)}`);
