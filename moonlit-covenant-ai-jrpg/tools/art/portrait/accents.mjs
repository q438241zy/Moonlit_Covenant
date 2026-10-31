// Per-heroine costume accents (audit B11): the six outfit templates are shared, so each heroine brings
// her own small signature into every costume - a full-colour emblem (pin / pendant / embroidered badge)
// and a one-colour motif glyph (sash charges, collar-band embroidery, dress print). The outfit decides
// WHERE they go (tools/art/portrait/outfits/*.mjs read p.accent); this file decides WHAT they look like.
// Motifs follow 设定集/03 (canon look of each heroine), never 外传-only details:
//   lia     emblem: tower-shield crest with the cracked gold oath crystal   motif: flame      print: strawberries
//   mia     emblem: copper gear with a cyan core and a tiny wrench          motif: gear
//   serena  emblem: closed-eyelid silver pendant (canon)                    motif: crescent moon
//   freya   emblem: ice-crystal snowflake                                    motif: snowflake
//   lilith  emblem: gold crescent cradling a dagger (her house sigil)        motif: leaf (翠影)
//   evelyn  emblem: star pendant with small wings (canon star pendant)       motif: prayer bell
//   ophelia emblem: silver dragon claw gripping a gem (canon 龙爪饰物)       motif: dragon horn
//   aila    emblem: blue-and-gold sun rosette                                motif: sun
// Every function is pure (no <defs>, no ids) so an outfit can call it any number of times.

const f1 = (v) => {
  const x = Math.round(v * 10) / 10;
  return String(x === 0 ? 0 : x);
};

/** map unit-space points through translate(x,y) rotate(rot deg) scale(r) */
function placer(x, y, r, rot = 0) {
  const a = (rot * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return ([u, v]) => `${f1(x + (u * c - v * s) * r)},${f1(y + (u * s + v * c) * r)}`;
}
/** unit-space path mini-language: [['M',[u,v]], ['C',[..],[..],[..]], ['L',[u,v]], ['Z']] -> d */
function unitPath(cmds, x, y, r, rot) {
  const P = placer(x, y, r, rot);
  return cmds.map(([op, ...pts]) => op + pts.map(P).join(' ')).join('');
}
/** closed polygon through unit points */
const poly = (pts, x, y, r, rot) => unitPath([['M', pts[0]], ...pts.slice(1).map((q) => ['L', q]), ['Z']], x, y, r, rot);
/** circle as two arcs (fill-rule friendly, one path) */
const circ = (x, y, r) => `M${f1(x - r)},${f1(y)}a${f1(r)},${f1(r)} 0 1 0 ${f1(2 * r)},0a${f1(r)},${f1(r)} 0 1 0 ${f1(-2 * r)},0`;
/** k-point star in unit space */
const starPts = (k, inner, rot0 = -90) => Array.from({ length: k * 2 }, (_, i) => {
  const a = ((rot0 + (i * 180) / k) * Math.PI) / 180, rr = i % 2 ? inner : 1;
  return [Math.cos(a) * rr, Math.sin(a) * rr];
});

// ---------------------------------------------------------------- motif glyphs (unit size: r = half height)
const GLYPH = {
  flame: (x, y, r, rot) => unitPath([
    ['M', [0.05, -1]], ['C', [0.3, -0.62], [0.78, -0.3], [0.68, 0.28]], ['C', [0.6, 0.76], [0.28, 1], [0, 1]],
    ['C', [-0.3, 1], [-0.66, 0.74], [-0.66, 0.3]], ['C', [-0.66, -0.06], [-0.42, -0.22], [-0.34, -0.56]],
    ['C', [-0.18, -0.32], [-0.06, -0.3], [0, -0.42]], ['C', [0.08, -0.6], [0.02, -0.82], [0.05, -1]], ['Z'],
  ], x, y, r, rot),
  gear: (x, y, r, rot) => {
    const teeth = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      for (const [da, rr] of [[-0.2, 0.74], [-0.13, 1], [0.13, 1], [0.2, 0.74]]) teeth.push([Math.cos(a + da) * rr, Math.sin(a + da) * rr]);
    }
    return poly(teeth, x, y, r, rot) + circ(x, y, r * 0.32);
  },
  crescent: (x, y, r, rot) => unitPath([
    ['M', [0.3, -0.95]], ['C', [-0.5, -0.95], [-1, -0.42], [-1, 0.06]], ['C', [-1, 0.6], [-0.48, 1], [0.24, 0.96]],
    ['C', [-0.24, 0.8], [-0.52, 0.42], [-0.52, 0.02]], ['C', [-0.52, -0.42], [-0.18, -0.82], [0.3, -0.95]], ['Z'],
  ], x, y, r, rot),
  snowflake: (x, y, r, rot) => {
    let d = poly(starPts(6, 0.3), x, y, r, rot);
    // little side branches on each arm
    for (let i = 0; i < 6; i++) {
      const a = -90 + i * 60;
      d += poly([[0.5, -0.05], [0.78, -0.28], [0.84, -0.2], [0.62, 0.02], [0.84, 0.2], [0.78, 0.28], [0.5, 0.05]], x, y, r, (rot || 0) + a);
    }
    return d;
  },
  leaf: (x, y, r, rot) => unitPath([
    ['M', [0, -1]], ['C', [0.6, -0.55], [0.62, 0.42], [0.04, 0.86]], ['L', [0.04, 1]], ['L', [-0.04, 1]], ['L', [-0.04, 0.86]],
    ['C', [-0.62, 0.42], [-0.6, -0.55], [0, -1]], ['Z'],
    // midrib cut (even-odd)
    ['M', [0.03, -0.62]], ['L', [0.05, 0.7]], ['L', [-0.05, 0.7]], ['L', [-0.03, -0.62]], ['Z'],
  ], x, y, r, rot),
  bell: (x, y, r, rot) => unitPath([
    ['M', [-0.64, 0.5]], ['C', [-0.6, -0.1], [-0.5, -0.72], [0, -0.74]], ['C', [0.5, -0.72], [0.6, -0.1], [0.64, 0.5]],
    ['L', [0.82, 0.66]], ['L', [-0.82, 0.66]], ['Z'],
  ], x, y, r, rot) + circ(x, y + 0.84 * r, 0.17 * r) + circ(x, y - 0.86 * r, 0.14 * r),
  horn: (x, y, r, rot) => unitPath([
    ['M', [-0.62, 1]], ['C', [-0.6, 0.2], [-0.2, -0.5], [0.46, -1]], ['C', [0.22, -0.4], [0.2, 0.3], [0.42, 1]], ['Z'],
  ], x, y, r, rot),
  sun: (x, y, r, rot) => poly(starPts(8, 0.56, -90 + (rot || 0)), x, y, r, 0) + circ(x, y, r * 0.3),
};

// ---------------------------------------------------------------- emblems (s = 1 -> about 48 px tall)
const T = (x, y, s) => `translate(${f1(x)} ${f1(y)}) scale(${Math.round(s * 1000) / 1000})`;

const EMBLEM = {
  // tower-shield crest: oxblood face, iron rim, the cracked gold oath crystal (canon: chest crystal + 塔盾“赤誓”)
  lia: (x, y, s) => `<g transform="${T(x, y, s)}" stroke-linejoin="round">`
    + `<path d="M-17,-22H17Q19,-22 19,-19V2Q19,15 0,24Q-19,15 -19,2V-19Q-19,-22 -17,-22Z" fill="#a3a7bb" stroke="#221e34" stroke-width="2.4"/>`
    + `<path d="M-14,-18H14V1Q14,12 0,19Q-14,12 -14,1Z" fill="#7a1d2c"/>`
    + `<path d="M-14,-18H0V19Q-14,12 -14,1Z" fill="#94283c"/>`
    + `<path d="M0,-11L7,0L0,12L-7,0Z" fill="#e3a95e" stroke="#5a3512" stroke-width="1.4"/><path d="M0,-11L-7,0L0,0Z" fill="#fff3cf"/>`
    + `<path d="M-2,-6L1,-1L-1,4" fill="none" stroke="#5a3512" stroke-width="1.1"/>`
    + `<path d="M-16,-19H16" stroke="#d9dcea" stroke-width="1.6" stroke-linecap="round"/>`
    + `</g>`,
  // copper gear, cyan core ring, a tiny wrench across it (canon: wrench clip, cyan circuit glow, 铸金 brass)
  mia: (x, y, s) => `<g transform="${T(x, y, s)}" stroke-linejoin="round">`
    + `<path d="${GLYPH.gear(0, 0, 21, 11)}" fill="#c98a3f" fill-rule="evenodd" stroke="#4a2a0e" stroke-width="2"/>`
    + `<circle r="11" fill="#2a3346" stroke="#4a2a0e" stroke-width="1.6"/><circle r="7.4" fill="none" stroke="#5ed7ff" stroke-width="3"/><circle r="2.6" fill="#d8f6ff"/>`
    + `<g transform="rotate(-38)"><path d="M-3,-27h6v14l3,3v6h-12v-6l3,-3z" fill="#d6dbe6" stroke="#2a3346" stroke-width="1.6"/><path d="M-4,-31a5,5 0 1 0 8,0l-2,4h-4z" fill="#d6dbe6" stroke="#2a3346" stroke-width="1.6"/></g>`
    + `<path d="M-13,-12A18,18 0 0 1 3,-18" fill="none" stroke="#f3c78a" stroke-width="2" stroke-linecap="round"/>`
    + `</g>`,
  // closed-eyelid silver pendant with a violet tear stone (canon: 胸前挂闭合眼睑形银吊坠)
  serena: (x, y, s) => `<g transform="${T(x, y, s)}" stroke-linejoin="round">`
    + `<circle cy="-20" r="3.6" fill="none" stroke="#c9cde0" stroke-width="2"/>`
    + `<path d="M-22,0Q0,-20 22,0Q0,17 -22,0Z" fill="#c9cde0" stroke="#2c2766" stroke-width="2.2"/>`
    + `<path d="M-16,-2Q0,-13 16,-2" fill="none" stroke="#ffffff" stroke-width="1.8" opacity=".8"/>`
    + `<path d="M-17,1Q0,11 17,1" fill="none" stroke="#2c2766" stroke-width="2.6" stroke-linecap="round"/>`
    + `<path d="M-10,6l-2,5M-3,8l-1,5M4,8l1,5M11,6l2,5" stroke="#2c2766" stroke-width="1.8" stroke-linecap="round"/>`
    + `<path d="M0,13Q5,20 0,25Q-5,20 0,13Z" fill="#b58cff" stroke="#2c2766" stroke-width="1.4"/>`
    + `</g>`,
  // ice-crystal snowflake brooch (canon: 冰晶发梳 / snowflake orb)
  freya: (x, y, s) => `<g transform="${T(x, y, s)}" stroke-linejoin="round">`
    + `<path d="${GLYPH.snowflake(0, 0, 23, 0)}" fill="#e6f7ff" stroke="#3f8fc4" stroke-width="1.8"/>`
    + `<path d="M0,-9L8,-4.5V4.5L0,9L-8,4.5V-4.5Z" fill="#8fd4f5" stroke="#2a6a98" stroke-width="1.6"/>`
    + `<path d="M0,-9L-8,-4.5L0,0Z" fill="#ffffff"/>`
    + `</g>`,
  // gold crescent cradling a dagger, violet gem (her house sigil from the default portrait)
  lilith: (x, y, s) => `<g transform="${T(x, y, s)}" stroke-linejoin="round">`
    + `<path d="M15.4,-12.4A24,24 0 1 0 20.8,18A18.5,18.5 0 1 1 15.4,-12.4Z" fill="#d9a441" stroke="#4a3210" stroke-width="2"/>`
    + `<path d="M0,-22L5,0L2,36L0,46L-2,36L-5,0Z" transform="scale(.7) translate(0 -2)" fill="#e8e6f2" stroke="#4a3210" stroke-width="2"/>`
    + `<path d="M-9,0H9" stroke="#4a3210" stroke-width="4.4" stroke-linecap="round"/><path d="M-9,0H9" stroke="#f0c869" stroke-width="2.2" stroke-linecap="round"/>`
    + `<circle cy="-18" r="4" fill="#8a4ad0" stroke="#4a3210" stroke-width="1.4"/>`
    + `</g>`,
  // star pendant with two small wings (canon: 星形吊坠 + 羽翼形圣冠)
  evelyn: (x, y, s) => `<g transform="${T(x, y, s)}" stroke-linejoin="round">`
    + `<path d="M-8,-4C-16,-12 -26,-10 -30,-4C-24,-4 -20,0 -22,4C-16,2 -12,4 -10,6ZM8,-4C16,-12 26,-10 30,-4C24,-4 20,0 22,4C16,2 12,4 10,6Z" fill="#fffaf0" stroke="#8a7a52" stroke-width="1.6"/>`
    + `<path d="${poly(starPts(5, 0.45), 0, 1, 17, 0)}" fill="#ffd98c" stroke="#7a5a1e" stroke-width="2"/>`
    + `<circle cy="1.6" r="5" fill="#7fb2ff" stroke="#7a5a1e" stroke-width="1.4"/><circle cx="-1.4" cy="0" r="1.6" fill="#fff"/>`
    + `</g>`,
  // silver dragon claw gripping a rose gem (canon: 龙爪饰物)
  ophelia: (x, y, s) => `<g transform="${T(x, y, s)}" stroke-linejoin="round">`
    + `<path d="M-8,13Q0,19 8,13L6,24H-6Z" fill="#9aa6c8" stroke="#1f3a7a" stroke-width="1.8"/>`
    + `<circle cy="-2" r="11" fill="#f472b6" stroke="#6a1a44" stroke-width="2"/><circle cx="-4" cy="-6" r="3.4" fill="#ffd6ea"/>`
    + `<path d="M-3,15C-15,13 -19,1 -16,-8C-14,-15 -8,-19 -1,-17C-7,-15 -10,-11 -11,-5C-12,2 -8,9 -1,11ZM3,15C15,13 19,1 16,-8C14,-15 8,-19 1,-17C7,-15 10,-11 11,-5C12,2 8,9 1,11ZM-3.4,17C-3.6,11 -2.4,6 0,1C2.4,6 3.6,11 3.4,17Z" fill="#c9d2ea" stroke="#1f3a7a" stroke-width="1.8"/>`
    + `<path d="M-13,-7Q-12,-13 -7,-15" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`
    + `</g>`,
  // blue-and-gold sun rosette (canon colours: 蓝金轻骑士甲, 光律)
  aila: (x, y, s) => `<g transform="${T(x, y, s)}" stroke-linejoin="round">`
    + `<path d="${poly(starPts(8, 0.58, -90), 0, 0, 24, 0)}" fill="#f5c84c" stroke="#6a4a10" stroke-width="2"/>`
    + `<path d="${poly(starPts(8, 0.6, -67.5), 0, 0, 17, 0)}" fill="#ffe7a0" stroke="#a87a20" stroke-width="1.2"/>`
    + `<circle r="9.4" fill="#4f7dff" stroke="#1c2f78" stroke-width="2"/><path d="M0,-6.4V4.6" stroke="#fff6d8" stroke-width="2.2" stroke-linecap="round"/><path d="M-4,1.4H4" stroke="#fff6d8" stroke-width="1.8" stroke-linecap="round"/><circle cy="6.4" r="1.4" fill="#fff6d8"/>`
    + `</g>`,
};

// ---------------------------------------------------------------- per-heroine kits
const KIT = {
  lia: { glyph: 'flame', main: '#c13b4c', deep: '#5c1a2a', lit: '#ffb08a', thread: '#ffd091',
    // summer print: little strawberries (canon: she loves strawberry cake)
    print: { a: (x, y, r) => unitPath([['M', [0, 1]], ['C', [-0.7, 0.6], [-0.8, -0.2], [-0.5, -0.5]], ['C', [-0.2, -0.7], [0.2, -0.7], [0.5, -0.5]], ['C', [0.8, -0.2], [0.7, 0.6], [0, 1]], ['Z']], x, y, r, 0),
      b: (x, y, r) => poly([[-0.55, -0.55], [-0.2, -0.62], [0, -0.95], [0.2, -0.62], [0.55, -0.55], [0.22, -0.4], [-0.22, -0.4]], x, y, r, 0),
      ca: '#ef5a6a', cb: '#5aa868' } },
  mia: { glyph: 'gear', main: '#2f9fc8', deep: '#16465c', lit: '#9eeaff', thread: '#5ed7ff' },
  serena: { glyph: 'crescent', main: '#8a68d8', deep: '#2c2766', lit: '#efe9ff', thread: '#efe9ff' },
  freya: { glyph: 'snowflake', main: '#4ea6d6', deep: '#1d4a6e', lit: '#f2fbff', thread: '#f2fbff' },
  lilith: { glyph: 'leaf', main: '#5f9a54', deep: '#2a3a1e', lit: '#d9a441', thread: '#d9a441' },
  evelyn: { glyph: 'bell', main: '#d8a948', deep: '#6a5220', lit: '#fffaf0', thread: '#fffaf0' },
  ophelia: { glyph: 'horn', main: '#3a5aa8', deep: '#1f3a7a', lit: '#f9b8d8', thread: '#f472b6' },
  aila: { glyph: 'sun', main: '#4f7dff', deep: '#1c2f78', lit: '#ffe7a0', thread: '#f5c84c' },
};

export const ACCENTS = Object.freeze(Object.fromEntries(Object.entries(KIT).map(([id, k]) => [id, Object.freeze({
  id,
  ...k,
  /** one-colour motif glyph as path data (fill it; even-odd is safe) */
  glyph: (x, y, r, rot = 0) => GLYPH[k.glyph](x, y, r, rot),
  /** full-colour emblem markup centred at (x, y); s = 1 is about 48 px tall */
  emblem: (x, y, s = 1) => EMBLEM[id](x, y, s),
})])));

export const GLYPHS = GLYPH;
