// 《月蚀契约》 UI icon library — original line icons, zero dependencies.
//
//   import { icon, ICONS, ICON_NAMES, COLORED, EMOJI_ICON } from './icons.js';
//   el.innerHTML = icon('sword', { size: 20, cls: 'muted', title: '攻击' });
//
// Grid: 24×24, live area ≈ 2.5–21.5. Stroke icons draw with stroke="currentColor",
// stroke-width 1.75, round caps/joins (all set on the root <svg> by icon()), so they inherit the
// surrounding text colour. A handful of premium currency/badge icons (COLORED) carry fixed fills.
// No ids, no <text>, no external references: safe to inline any number of times.

const dot = (x, y, r = 1.1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`;
const r2 = (n) => Math.round(n * 100) / 100;
// concave four-point sparkle
const spark = (cx, cy, r, fill = false) =>
  `<path d="M${cx} ${r2(cy - r)}Q${cx} ${cy} ${r2(cx + r)} ${cy}Q${cx} ${cy} ${cx} ${r2(cy + r)}Q${cx} ${cy} ${r2(cx - r)} ${cy}Q${cx} ${cy} ${cx} ${r2(cy - r)}Z"${fill ? ' fill="currentColor"' : ''}/>`;
// regular star polygon (points, outer, inner radius)
const starPath = (cx, cy, n, ro, ri, rot = -90) => {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = (rot + i * 180 / n) * Math.PI / 180, r = i % 2 ? ri : ro;
    d += `${i ? 'L' : 'M'}${r2(cx + Math.cos(a) * r)} ${r2(cy + Math.sin(a) * r)}`;
  }
  return d + 'Z';
};
// toothed gear outline
const gearPath = (cx, cy, ri, ro, n) => {
  let d = '';
  const step = 360 / n;
  for (let i = 0; i < n; i++) {
    const a0 = i * step - 90, pts = [[a0 - step * 0.22, ri], [a0 - step * 0.14, ro], [a0 + step * 0.14, ro], [a0 + step * 0.22, ri]];
    for (const [a, r] of pts) { const t = a * Math.PI / 180; d += `${d ? 'L' : 'M'}${r2(cx + Math.cos(t) * r)} ${r2(cy + Math.sin(t) * r)}`; }
  }
  return d + 'Z';
};
// rotate a path-data string's absolute coordinates around (12,12) — only for M/L/H-free simple paths
const rot = (pairs, deg) => {
  const t = deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
  return pairs.map(([x, y]) => [r2(12 + (x - 12) * c - (y - 12) * s), r2(12 + (x - 12) * s + (y - 12) * c)]);
};
const pl = (pairs) => 'M' + pairs.map(([x, y]) => `${x} ${y}`).join('L');

const snowflake = (() => {
  let d = '';
  for (const a of [0, 60, 120]) d += pl(rot([[12, 2.5], [12, 21.5]], a));
  for (let a = 0; a < 360; a += 60) d += pl(rot([[9.4, 4.4], [12, 7], [14.6, 4.4]], a));
  return `<path d="${d}"/>`;
})();

export const ICONS = {
  // ---------------------------------------------------------------- map towns
  village: '<path d="M2.5 11.5L10 5l7.5 6.5"/><path d="M4.5 10v10.5M15.5 10v10.5M2.5 20.5h19"/><path d="M8.5 20.5v-4h3v4"/><path d="M13.5 7.3V4h2v5"/><path d="M20 20.5v-3"/><circle cx="20" cy="14.5" r="2.25"/>',
  station: '<path d="M2.5 16h19"/><path d="M13 16V6.5h6.5V16M12 6.5h8.5"/><path d="M15 9h2.5v2.5H15z"/><path d="M13 9.5H6a2.5 2.5 0 0 0-2.5 2.5v4"/><path d="M6.5 9.5V6.5H9v3"/><circle cx="7" cy="18.5" r="2"/><circle cx="12.25" cy="18.5" r="2"/><circle cx="17.5" cy="18.5" r="2"/>',
  'moon-city': '<path d="M2 20.5h20"/><path d="M7.5 20.5V13h9v7.5"/><path d="M7.5 13a4.5 4.5 0 0 1 9 0"/><path d="M12 8.5V7"/><circle cx="12" cy="5.25" r="1.6"/><path d="M10.5 20.5v-2.5a1.5 1.5 0 0 1 3 0v2.5"/><path d="M3 20.5v-8l1.75-3.25 1.75 3.25v8M17.5 20.5v-8l1.75-3.25 1.75 3.25v8"/>',
  frost: '<path d="M2 20.5h20"/><path d="M3 20.5L10.5 7 18 20.5"/><path d="M7.2 13l1.65 1.2 1.65-1.2 1.65 1.2 1.65-1.2"/><path d="M8.75 20.5V17h3.5v3.5"/><path d="M19 3v5.5M16.6 4.4l4.8 2.7M16.6 7.1l4.8-2.7"/>',
  fortress: '<path d="M2 20.5h20"/><path d="M3.5 20.5v-13h2v2h2v-2h2v13M14.5 20.5v-13h2v2h2v-2h2v13"/><path d="M9.5 12.5h5"/><path d="M10.25 20.5v-3a1.75 1.75 0 0 1 3.5 0v3"/><path d="M6.5 13v2M17.5 13v2"/><path d="M17.5 7.5V3l3 1.25-3 1.25"/>',
  'star-tower': '<path d="M4.5 21h12"/><path d="M6.75 21L8 10h4l1.25 11"/><path d="M6.5 10h7"/><path d="M8 10a2 2 0 0 1 4 0"/><path d="M10 14v2"/>' + spark(17.75, 5.75, 3.75) + dot(13.5, 3.25, 0.9) + dot(20.5, 11, 0.9),
  gate: '<path d="M2.5 21h19"/><path d="M4.5 21V10.5a7.5 7.5 0 0 1 15 0V21"/><path d="M8.5 21v-9.5a3.5 3.5 0 0 1 7 0V21"/><path d="M12 3v2"/>' + spark(12, 15.75, 2.4),
  terminal: '<path d="M5 21.5V3"/><path d="M5 4h13l-2.5 4L18 12H5"/><path d="M8.5 4h3.25v4H8.5zM11.75 8H15v4h-3.25zM5 8h3.5v4H5z" fill="currentColor" stroke="none"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.25"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><path d="M12 14.5v2"/>',
  unlock: '<rect x="5" y="10.5" width="14" height="10" rx="2.25"/><path d="M8 10.5V7.5a4 4 0 0 1 7.75-1.4"/><path d="M12 14.5v2"/>',
  traveler: '<circle cx="10.5" cy="5" r="2"/><path d="M10.5 8.5c-2.6 0-4 2.2-4.4 5.2L5 20.5h9.5l-1-6.8c-.4-3-1.4-5.2-3-5.2z"/><path d="M17.5 3.5v17"/><path d="M12.5 12l5-1.5"/>',
  map: '<path d="M3.5 6.5l5.5-2.5 6 2.5 5.5-2.5v13.5l-5.5 2.5-6-2.5-5.5 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',

  // ---------------------------------------------------------------- costume themes
  newyear: '<path d="M12 1.75V4M9 4h6"/><path d="M9.5 4.5h5l.5 1.75c3 1.2 4.5 3.3 4.5 5.75s-1.5 4.55-4.5 5.75l-.5 1.75h-5l-.5-1.75C6 16.55 4.5 14.45 4.5 12S6 7.45 9 6.25z"/><path d="M12 6.25v11.5M9 6.5c-1.4 3.2-1.4 7.8 0 11M15 6.5c1.4 3.2 1.4 7.8 0 11"/><path d="M12 19.5v3"/>',
  maid: '<circle cx="12" cy="11.5" r="1.75"/><path d="M10.3 11C7.5 8 4 7 4 9.5v4c0 2.5 3.5 1.5 6.3-1.5M13.7 11C16.5 8 20 7 20 9.5v4c0 2.5-3.5 1.5-6.3-1.5"/><path d="M11 13.2l-2.4 6.5 2.1-.9.8 1.9M13 13.2l2.4 6.5-2.1-.9-.8 1.9"/>',
  christmas: '<path d="M12 3.5L6.5 11h3.25L5 18h14l-4.75-7h3.25z"/><path d="M12 18v3"/>' + dot(10.25, 14.5, 0.95) + dot(14, 12.75, 0.95) + dot(12, 8.75, 0.95),
  duanwu: '<path d="M2.5 12.5h15c.6 3-1.6 5-4.5 5H8c-3 0-5-2-5.5-5z"/><path d="M17.5 12.5V8.25c0-2 1.3-3.75 3.25-3.75l.75 2.5-2 .75"/><path d="M2.5 12.5L2 9l2.75 2.25"/><path d="M8.5 9.5l-2 10M12.5 9.5l-2 10"/>',
  anniversary: '<path d="M3.5 20.5h17"/><path d="M5 20.5v-6.25A1.75 1.75 0 0 1 6.75 12.5h10.5A1.75 1.75 0 0 1 19 14.25v6.25"/><path d="M5 16.25c1.2.9 2.3.9 3.5 0s2.3-.9 3.5 0 2.3.9 3.5 0 2.3-.9 3.5 0"/><path d="M9 12.5V9.5M15 12.5V9.5"/><path d="M9 5c.75.8.95 1.6 0 2.3-.95-.7-.75-1.5 0-2.3zM15 5c.75.8.95 1.6 0 2.3-.95-.7-.75-1.5 0-2.3z" fill="currentColor" stroke-width="1"/>',
  summer: '<g transform="rotate(-16 12 12)"><path d="M3.5 12a8.5 7.5 0 0 1 17 0"/><path d="M3.5 12c1.4-1 2.85-1 4.25 0 1.4-1 2.85-1 4.25 0 1.4-1 2.85-1 4.25 0 1.4-1 2.85-1 4.25 0"/><path d="M12 4.5v15a1.75 1.75 0 0 1-3.5 0"/></g><path d="M2.5 21.5h9"/>' + dot(19, 5, 1.6) + '<path d="M19 1.75v.3M22.25 5h-.3M19 8.25v-.3M15.75 5h-.3"/>',
  'outfit-default': '<circle cx="12" cy="8" r="3.75"/><path d="M4.5 20.5c.6-4.1 3.6-6.75 7.5-6.75s6.9 2.65 7.5 6.75"/>',
  dress: '<path d="M9.5 3.5L10 7l-1.5 4L5 20.5h14L15.5 11 14 7l.5-3.5"/><path d="M8.5 11h7"/><path d="M10 7c.9.8 3.1.8 4 0"/>',
  kimono: '<path d="M8 3.5L4 7l2 3 2-1.5V20.5h8V8.5l2 1.5 2-3-4-3.5"/><path d="M8 3.5l4 6 4-6"/><path d="M8 13h8"/><path d="M12 9.5v3.5"/>',
  cloak: '<path d="M12 3C9 3 7.5 5.5 7.5 8.5L4 20.5c2.7.7 5.3 1 8 1s5.3-.3 8-1L16.5 8.5C16.5 5.5 15 3 12 3z"/><path d="M9.5 9.25c0-2.1 1.1-3.75 2.5-3.75s2.5 1.65 2.5 3.75-1.1 2.75-2.5 2.75-2.5-.65-2.5-2.75z"/><path d="M12 12v9.5"/>',
  scarf: '<path d="M6 6.5c3.6 2 8.4 2 12 0v3.5c-3.6 2-8.4 2-12 0z"/><path d="M14 11l1.5 9.5 3-1L16.5 10.5"/><path d="M15.5 17.5l3-1"/>',
  hat: '<path d="M2.5 15.5c0 1.9 4.3 3.5 9.5 3.5s9.5-1.6 9.5-3.5c0-1.1-1.5-2-3.8-2.6"/><path d="M6.5 13.2C7 8.5 9 6 12 6s5 2.5 5.5 7.2c-3.6 1-7.4 1-11 0z"/><path d="M6.8 11.5c3.4.9 7 .9 10.4 0"/>',
  tunic: '<path d="M8.5 3.5L3.5 6.5l1.5 4.5 2.5-1v10.5h9V10l2.5 1 1.5-4.5-5-3"/><path d="M8.5 3.5c.5 1.6 1.8 2.5 3.5 2.5s3-.9 3.5-2.5"/>',
  sleep: '<path d="M14.5 15.5A6.5 6.5 0 1 1 8 5.5a5.2 5.2 0 0 0 6.5 10z"/><path d="M14 3.5h4l-4 4.5h4M18.5 10h3l-3 3.5h3"/>',
  galaxy: '<path d="M12 12.6a.6.6 0 1 1 .6-.6 1.9 1.9 0 0 1-3.4 1.2 3.6 3.6 0 0 1 5.6-4.3 5.6 5.6 0 0 1-4.9 8.8 7.9 7.9 0 0 1-6.4-10.6"/><path d="M14.8 3.8a8 8 0 0 1 5.4 8.6"/>' + dot(18.5, 18.5, 1),
  telescope: '<path d="M3.5 13.5l12-6.5 2 3.7-12 6.5z"/><path d="M15.5 7l1.5-.8 2.6 4.7-1.6.9"/><path d="M11 14.5l-3 6.5M12.5 14l3 7"/><path d="M3.5 13.5l-1 .6 1.9 3.4 1-.6"/>',
  basket: '<path d="M3 11h18l-2 9.5H5z"/><path d="M7.5 11a4.5 4.5 0 0 1 9 0"/><path d="M8.5 14v3.5M12 14v3.5M15.5 14v3.5"/>',
  mech: '<rect x="5" y="8" width="14" height="11.5" rx="3"/><path d="M6.5 8.5L6 3.5l4 4.5M17.5 8.5l.5-5-4 4.5"/><circle cx="9.5" cy="13" r="1.5"/><circle cx="14.5" cy="13" r="1.5"/><path d="M10.5 16.5h3"/><path d="M2.5 12.5H5M19 12.5h2.5"/>',

  // ---------------------------------------------------------------- card game / navigation
  battle: '<path d="M14.5 17L3.5 6V3.5H6L17 14.5"/><path d="M13 19l6-6M16.25 16.25L20 20M19 21.5l2.5-2.5"/><path d="M9.5 17L20.5 6V3.5H18L7 14.5"/><path d="M11 19l-6-6M7.75 16.25L4 20M5 21.5L2.5 19"/>',
  pack: '<path d="M5.5 5.5l1.625-2 1.625 2 1.625-2L12 5.5l1.625-2 1.625 2 1.625-2 1.625 2v13l-1.625 2-1.625-2-1.625 2L12 18.5l-1.625 2-1.625-2-1.625 2-1.625-2z"/>' + spark(12, 12, 3.6),
  deck: '<rect x="3.5" y="8" width="11" height="13" rx="1.75"/><path d="M7 8V6.25A1.75 1.75 0 0 1 8.75 4.5h7.5A1.75 1.75 0 0 1 18 6.25v10A1.75 1.75 0 0 1 16.25 18H14.5"/><path d="M10.5 4.5v-.25A1.75 1.75 0 0 1 12.25 2.5h6.5a1.75 1.75 0 0 1 1.75 1.75v9.5a1.75 1.75 0 0 1-1.75 1.75H18"/>',
  collection: '<rect x="3" y="4" width="18" height="16" rx="2.25"/><path d="M3 17l5-5 4 4 2.75-2.75L21 19.5"/><circle cx="15.5" cy="8.75" r="1.75"/>',
  gift: '<rect x="4.5" y="11" width="15" height="9.5" rx="1"/><rect x="3" y="7.5" width="18" height="3.5" rx="1"/><path d="M12 7.5v13"/><path d="M12 7.5C10.6 4.5 7 3.6 7 5.6S10 7.5 12 7.5zM12 7.5c1.4-3 5-3.9 5-1.9S14 7.5 12 7.5z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.25"/>' + dot(12, 12, 1.9),
  shield: '<path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z"/>',
  guard: '<path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z"/><path d="M12 7.5l3.75 1.5v2.75c0 2.25-1.6 4-3.75 4.75-2.15-.75-3.75-2.5-3.75-4.75V9z"/>',
  buckler: '<circle cx="12" cy="12" r="8.75"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3.25v6.25M12 14.5v6.25M3.25 12H9.5M14.5 12h6.25"/>',
  dagger: '<path d="M20.5 3.5L19 8.5l-6 6L9.5 11l6-6z"/><path d="M7.75 10.25l6 6"/><path d="M10.25 13.75L6 18"/><circle cx="4.9" cy="19.1" r="1.4"/>',
  sword: '<path d="M20.5 3.5V6L10.5 16 8 13.5 18 3.5z"/><path d="M5.5 12l6.5 6.5"/><path d="M8.75 15.25L5 19"/><path d="M3.25 20.75l1.5-1.5"/>',
  spear: '<path d="M4 20L15 9"/><path d="M15 9l-1-3.5 6.5-2-2 6.5z"/><path d="M5.5 15.5l3 3"/>',
  trident: '<path d="M12 21.5V9"/><path d="M6.5 3v4.5a5.5 5.5 0 0 0 11 0V3"/><path d="M12 3v6"/><path d="M10 17.5h4"/>',
  axe: '<g transform="rotate(32 12 12)"><path d="M15 4.5v17"/><path d="M15 6h-3c-1.75-1.4-4-2.6-6.75-3-1.3 2.1-1.75 4.15-1.75 6.1s.45 4 1.75 6.1c2.75-.4 5-1.6 6.75-3h3"/><path d="M15 6h2.25v6.2H15"/></g>',
  hammer: '<path d="M13.4 4.2l6.4 6.4-3.2 3.2-6.4-6.4z"/><path d="M13.4 10.6L4 20"/>',
  bow: '<path d="M10 3c5.5 3 5.5 15 0 18"/><path d="M10 3L6.5 12 10 21"/><path d="M6.5 12H21"/><path d="M18 9l3 3-3 3"/><path d="M6.5 12L4 9.5M6.5 12L4 14.5"/>',
  wand: '<path d="M4 20L14 10"/>' + spark(17, 7, 4) + '<path d="M20.5 13v3M19 14.5h3M10 3.5v2M9 4.5h2"/>',
  whip: '<path d="M4 20.5l3.5-3.5"/><path d="M7.5 17c2-2 3.5-3 6-3s4 1.5 4 3.5-1.6 3-3.2 3S11.5 19 11.5 17.2C11.5 13 21 11.5 20.5 4"/>',
  fist: '<path d="M7 11V7.5a1.5 1.5 0 0 1 3 0V10M10 9.5V6.5a1.5 1.5 0 0 1 3 0v3.5M13 10V7a1.5 1.5 0 0 1 3 0v4"/><path d="M16 10a1.5 1.5 0 0 1 3 0v3.5c0 3.9-2.7 7-6.5 7S6 18 6 14.5v-2.2c0-.9.7-1.6 1.6-1.6H10c1.1 0 2 .9 2 2s-.9 2-2 2H8.5"/>',
  'moon-orb': '<circle cx="12" cy="10.25" r="7"/><path d="M7.5 16.5L6 20.5h12l-1.5-4"/><path d="M13.6 6.6a3.9 3.9 0 1 0 1.9 6.7 3.1 3.1 0 0 1-1.9-6.7z"/>',
  orb: '<circle cx="12" cy="10.25" r="7"/><path d="M7.5 16.5L6 20.5h12l-1.5-4"/><path d="M9 8.25a3.5 3.5 0 0 1 3-2"/>',
  rush: '<path d="M9 3.5h5v8l4.7 2.4A2.4 2.4 0 0 1 20 16v4.5H9z"/><path d="M9 18h11"/><path d="M2.5 9h3.5M3.5 12.5h2.5M2.5 16h3.5"/>',
  boot: '<path d="M7 3.5h6v8.5l5.2 2.6A2.5 2.5 0 0 1 19.6 17v3.5H7z"/><path d="M7 18h12.6"/><path d="M7 7h6"/>',
  storm: '<path d="M7.5 15.5H7a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 8a3.75 3.75 0 0 1 .5 7.5"/><path d="M12.75 11.5L10 16h4l-2.25 5"/>',
  bolt: '<path d="M13.5 2.5L5.5 13.5h6l-1 8 8-11h-6z"/>',
  bane: '<path d="M12 3a5.75 5.75 0 0 0-5.75 5.75c0 1.85.9 3.3 2.25 4.25v2.5h7V13c1.35-.95 2.25-2.4 2.25-4.25A5.75 5.75 0 0 0 12 3z"/>' + dot(9.75, 9, 1.25) + dot(14.25, 9, 1.25) + '<path d="M4.5 16.5l15 4.5M19.5 16.5l-15 4.5"/>',
  skull: '<path d="M12 3a7.5 7.5 0 0 0-7.5 7.5c0 2.5 1.2 4.4 3 5.6v3.65a.75.75 0 0 0 .75.75h7.5a.75.75 0 0 0 .75-.75V16.1c1.8-1.2 3-3.1 3-5.6A7.5 7.5 0 0 0 12 3z"/>' + dot(9, 11, 1.7) + dot(15, 11, 1.7) + '<path d="M12 13.75l-.9 1.75h1.8z" fill="currentColor" stroke-width="1"/><path d="M10 20.5v-2.25M14 20.5v-2.25"/>',
  burst: '<path d="M12 2.5l1.8 5.3 5-2.6-2.6 5 5.3 1.8-5.3 1.8 2.6 5-5-2.6-1.8 5.3-1.8-5.3-5 2.6 2.6-5L2.5 12l5.3-1.8-2.6-5 5 2.6z"/>',
  sparkle: spark(10, 9.5, 6.5) + spark(18, 17, 3.25) + '<path d="M18.5 3v3M17 4.5h3"/>',
  star4: '<path d="M12 2.5l2.1 7.4 7.4 2.1-7.4 2.1-2.1 7.4-2.1-7.4L2.5 12l7.4-2.1z"/>',
  scroll: '<path d="M8 17V5.5A2.5 2.5 0 0 1 10.5 3H19a2.5 2.5 0 0 1 0 5h-2.5"/><path d="M16.5 5.5v13a2.5 2.5 0 0 1-2.5 2.5H5a2.5 2.5 0 0 1 0-5h8.5a1.5 1.5 0 0 1 0 3"/><path d="M11 8h3M11 11h3.5"/>',
  'up-arrow': '<path d="M12 20V4.5M5.5 11L12 4.5 18.5 11"/>',
  'down-arrow': '<path d="M12 4v15.5M5.5 13l6.5 6.5 6.5-6.5"/>',
  'arrow-left': '<path d="M19.5 12h-15M11 5.5L4.5 12l6.5 6.5"/>',
  'arrow-right': '<path d="M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5"/>',
  'chevron-left': '<path d="M15 5l-7 7 7 7"/>',
  'chevron-right': '<path d="M9 5l7 7-7 7"/>',
  play: '<path d="M7.5 4.75v14.5a.75.75 0 0 0 1.15.63l11-7.25a.75.75 0 0 0 0-1.26l-11-7.25a.75.75 0 0 0-1.15.63z" fill="currentColor"/>',
  check: '<path d="M4.5 12.5l5 5L19.5 6.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  star: `<path d="${starPath(12, 12.6, 5, 9.5, 4.1)}" fill="currentColor"/>`,
  'star-empty': `<path d="${starPath(12, 12.6, 5, 9.5, 4.1)}"/>`,
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
  crown: '<path d="M3.5 8l4.5 4 4-7 4 7 4.5-4-2 10h-13z"/><path d="M5.5 20.5h13"/>',
  gem: '<path d="M6.5 4h11L21 9l-9 11.5L3 9z"/><path d="M3 9h18M9.75 4L8.25 9 12 20.5 15.75 9l-1.5-5"/>',
  crystal: '<path d="M12 2.5l3.25 4v11L12 21.5l-3.25-4v-11z"/><path d="M8.75 10L5 12v5l3.75 2.5M15.25 10L19 12v5l-3.75 2.5"/>',
  medal: '<path d="M8 2.5l2.5 6.5M16 2.5L13.5 9"/><circle cx="12" cy="15" r="6"/>' + spark(12, 15, 2.75),
  trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5.5H4.5v1.25A3.25 3.25 0 0 0 7.5 10M17 5.5h2.5v1.25A3.25 3.25 0 0 1 16.5 10"/><path d="M12 14v3.5M8 20.5h8M9.5 20.5l.5-3h4l.5 3"/>',
  amulet: '<path d="M5 3.5c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5"/><path d="M12 12v1"/><path d="M12 13l4 4-4 4-4-4z"/>' + dot(12, 17, 1),
  ring: '<circle cx="12" cy="14.5" r="6.5"/><path d="M9.5 5.75l1.25-2.25h2.5l1.25 2.25L12 8z"/>',
  bracer: '<rect x="6.5" y="7" width="11" height="10" rx="2.5"/><path d="M8.75 7l.5-4.5h5.5l.5 4.5M8.75 17l.5 4.5h5.5l.5-4.5"/><path d="M12 9.5l2.5 2.5-2.5 2.5L9.5 12z"/><path d="M17.5 10.5h1.5v3h-1.5"/>',
  belt: '<path d="M2.5 9h19v6h-19z"/><rect x="9" y="7.5" width="6" height="9" rx="1"/><path d="M12 12h3"/>',
  armor: '<path d="M7 5.5c1.6 1.1 3.3 1.75 5 1.75s3.4-.65 5-1.75l1 3.5-1.25 1.75v8c-1.6 1.2-3.2 1.75-4.75 1.75s-3.15-.55-4.75-1.75v-8L6 9z"/><path d="M12 7.25V20.5"/><path d="M7.25 14c3.1 1 6.4 1 9.5 0"/><path d="M7 5.5C5 5.5 3.25 7 3 9.25l3 .75M17 5.5c2 0 3.75 1.5 4 3.75l-3 .75"/>',
  helmet: '<path d="M5 20.5V13a7 7 0 0 1 14 0v7.5"/><path d="M5 20.5h4.5V16M19 20.5h-4.5V16"/><path d="M7.75 12.5h8.5M12 12.5v6"/><path d="M12 6V2.5"/>',
  gauntlet: '<path d="M6.5 20.5V11.5l-2-3.5 2-1 2.5 3V4.5a1.25 1.25 0 0 1 2.5 0V9V3.75a1.25 1.25 0 0 1 2.5 0V9V4.75a1.25 1.25 0 0 1 2.5 0V10l1-1.5a1.25 1.25 0 0 1 2 1.5l-3 5v5.5z"/><path d="M6.5 16.5h10"/>',
  greaves: '<path d="M8 3h8l-.5 7.5L17 20.5h-4l-1-8-1 8H7l1.5-10z"/><path d="M8.25 7h7.5"/>',
  chain: '<path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-.9.9"/><path d="M13.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l.9-.9"/>',
  mask: '<path d="M2.5 8.5c3 0 6 .7 9.5 2.2 3.5-1.5 6.5-2.2 9.5-2.2 0 5-2.5 8-5.5 8-1.8 0-3.2-1-4-2.5-.8 1.5-2.2 2.5-4 2.5-3 0-5.5-3-5.5-8z"/><path d="M6 11.5c.8.6 1.8.8 2.8.5M18 11.5c-.8.6-1.8.8-2.8.5"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M4 4l16 16"/><path d="M10 5.7c.6-.1 1.3-.2 2-.2 6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M15.5 17.6c-1 .5-2.2.9-3.5.9-6 0-9.5-6.5-9.5-6.5a17 17 0 0 1 3.6-4.3"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  book: '<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5c-3.5-.5-6.5 0-8.5 1.5z"/><path d="M12 6.5v13"/>',
  music: '<path d="M9 17.5V5.5l10.5-2v12"/><path d="M9 9.5l10.5-2"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17" cy="15.5" r="2.5"/>',
  harp: '<path d="M6.5 21.5V4.25c0-.75.85-1.2 1.5-.75 4.6 3.1 7.9 6.6 11 11.25.5.8.15 1.85-.75 2.1L6.5 20"/><path d="M10.5 7.25V18.5M14.5 10.75v6.5"/>',
  feather: '<path d="M20 4c-7.5 0-13 5.5-13.5 13.5"/><path d="M20 4c0 7.5-5.5 13-13.5 13.5L4 20"/><path d="M8.5 15.5l5-5M13 11.5l3.5-.5M10.5 14l2.75-.25"/>',
  angel: '<ellipse cx="12" cy="4.5" rx="3.5" ry="1.5"/><circle cx="12" cy="10.5" r="2.5"/><path d="M8.5 20.5c0-3.5 1.5-6 3.5-6s3.5 2.5 3.5 6"/><path d="M9.5 13.5C6 13 3.5 10.5 3 7.5c2.5.3 4.5 1.3 6 3M14.5 13.5c3.5-.5 6-3 6.5-6-2.5.3-4.5 1.3-6 3"/>',
  dove: '<path d="M3 13.5c2.5 0 4.5-.5 6-2C10 7.5 12.5 4 16 4c2 0 3 1 3.5 2.5l2 .5-2 1.5c0 5-3.5 9.5-9.5 9.5L6 20.5l1-3.5c-2-.8-3.4-2-4-3.5z"/><path d="M12 9.5c-.5 2-1.5 4-3.5 5"/>' + dot(16.25, 6.5, 0.9),
  lily: '<path d="M12 2.5c-2 2.5-2.5 5-1 8.5h2c1.5-3.5 1-6-1-8.5z"/><path d="M11 11C9.5 8.5 6.5 7.5 4.5 9c-1.5 1.2-1 3.6.8 3.6 1.2 0 1.8-1 1.4-1.8"/><path d="M13 11c1.5-2.5 4.5-3.5 6.5-2 1.5 1.2 1 3.6-.8 3.6-1.2 0-1.8-1-1.4-1.8"/><path d="M6.5 14h11"/><path d="M12 14v7M9.5 21h5"/><path d="M9.5 14c-.5 2-1.5 3-3 3.5M14.5 14c.5 2 1.5 3 3 3.5"/>',
  fang: '<path d="M3 7.5c2.6 2.3 5.6 3.5 9 3.5s6.4-1.2 9-3.5"/><path d="M6.5 9.75l2 7 2-6.1M13.5 10.65l2 6.1 2-7"/><path d="M4.5 15.5c2 3 4.5 4.5 7.5 4.5s5.5-1.5 7.5-4.5"/>',
  dragon: '<path d="M5.5 20.5c-1.5-3.5-1.75-7.5.25-10.5L3 4l5.25 3.25C9.5 6.6 10.8 6.3 12 6.3l3.25 1.6 4.75 1.9 1.25 2.2-3 1.25h-4l4.5 2.25-4.25 1.75-1 3.25"/><path d="M5.75 10L9.5 8.5"/>' + dot(13.25, 9.5, 1.1) + '<path d="M3 13.25l2.25-.5M3 16.75l2.5-.25"/>',
  'moon': '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
  eclipse: '<circle cx="12" cy="12" r="6"/><path d="M3.6 10a8.6 8.6 0 0 1 6.4-6.4M20.4 14a8.6 8.6 0 0 1-6.4 6.4"/>' + spark(6.75, 17.25, 2.75, true),
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.75 1.75M16.95 16.95l1.75 1.75M5.3 18.7l1.75-1.75M16.95 7.05l1.75-1.75"/>',
  'pink-heart': '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>' + spark(16.5, 4.75, 2.25),

  // ---------------------------------------------------------------- consumables
  blood: '<path d="M10 3.5s-5.5 6.4-5.5 10.2a5.5 5.5 0 0 0 11 0C15.5 9.9 10 3.5 10 3.5z"/><path d="M7.75 14a2.25 2.25 0 0 0 2.25 2.25"/><path d="M18.5 3.5s-2 2.3-2 3.7a2 2 0 0 0 4 0c0-1.4-2-3.7-2-3.7z"/>',
  drop: '<path d="M12 3s-6.5 7.2-6.5 11.5a6.5 6.5 0 0 0 13 0C18.5 10.2 12 3 12 3z"/><path d="M9 14.75a3 3 0 0 0 3 3"/>',
  potion: '<path d="M10 3.5h4"/><path d="M10.5 3.5v4.8a6.5 6.5 0 1 0 3 0V3.5"/><path d="M6 14.75c2-1 4-1 6 0s4 1 6 0"/>' + dot(10, 17.5, 0.9) + dot(13.5, 18.5, 0.7),
  elixir: '<path d="M9 2.5h6"/><path d="M10 2.5v3.5L7.5 9.5v9.75A1.75 1.75 0 0 0 9.25 21h5.5a1.75 1.75 0 0 0 1.75-1.75V9.5L14 6V2.5"/><path d="M7.5 13h9"/>' + spark(12, 16.75, 2),
  flask: '<path d="M9.5 3h5M10 3v2.5c-2.6 1-4 3-4 5.75V19.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-8.25c0-2.75-1.4-4.75-4-5.75V3"/><path d="M12 11.5s-2.5 2.8-2.5 4.5a2.5 2.5 0 0 0 5 0c0-1.7-2.5-4.5-2.5-4.5z"/>',
  pill: '<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-40 12 12)"/><path d="M9.2 8.7l5.6 6.6"/>',
  bandage: '<rect x="2.5" y="8.25" width="19" height="7.5" rx="3.75" transform="rotate(-45 12 12)"/><path d="M9.5 9.5l5 5"/>' + dot(11, 12, 0.7) + dot(12, 11, 0.7) + dot(13, 12, 0.7) + dot(12, 13, 0.7),
  cup: '<path d="M6.5 7.5h11l-1.5 13h-8z"/><path d="M5.5 7.5h13"/><path d="M12.5 7.5l2-5 2.5.5"/><path d="M7 11.5h10"/>',
  herb: '<path d="M12 21v-9"/><path d="M12 12c0-4 2-7 6.5-8 .5 4.5-2 8-6.5 8z"/><path d="M12 15.5C12 12 10 9.5 5.5 9c-.3 4 2 6.5 6.5 6.5z"/>',
  bowl: '<path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M8.5 20h7"/><path d="M9 8.5c-.8-1 .8-2 0-3M12.25 8.5c-.8-1 .8-2 0-3M15.5 8.5c-.8-1 .8-2 0-3"/>',
  bread: '<path d="M4 11.5C4 7.5 7.5 5.5 12 5.5s8 2 8 6c0 1-.6 1.6-1.5 1.8V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19v-5.7C4.6 13.1 4 12.5 4 11.5z"/><path d="M9 9.5l1.5 1.5M12.5 8.5L14 10M16 9.5l.75.75"/>',
  canteen: '<circle cx="12" cy="14" r="7"/><path d="M10 7.3V4.5h4v2.8"/><path d="M9.5 3h5"/><path d="M8.5 14a3.5 3.5 0 0 1 3.5-3.5"/>',
  wind: '<path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 13h15a3 3 0 1 1-3 3"/><path d="M3 17h7"/>',
  ghost: '<path d="M5.5 20.5V11a6.5 6.5 0 0 1 13 0v9.5l-2.2-1.6-2.1 1.6-2.2-1.6-2.2 1.6-2.1-1.6z"/>' + dot(9.75, 11, 1.1) + dot(14.25, 11, 1.1),
  flame: '<path d="M12 21a6.5 6.5 0 0 0 6.5-6.5c0-4-3-6-4-10.5-2 2-3 4-3 6-1-1-1.5-2.5-1.5-4-2.5 2-4.5 5-4.5 8.5A6.5 6.5 0 0 0 12 21z"/><path d="M12 21a2.75 2.75 0 0 1-2.75-2.75c0-1.8 1.5-2.6 2.75-4.25 1.25 1.65 2.75 2.45 2.75 4.25A2.75 2.75 0 0 1 12 21z"/>',
  snowflake,

  // ---------------------------------------------------------------- system / shop
  settings: `<path d="${gearPath(12, 12, 7, 9.5, 8)}"/><circle cx="12" cy="12" r="3"/>`,
  home: '<path d="M3.5 11L12 3.5l8.5 7.5"/><path d="M5.5 9.5v11h13v-11"/><path d="M10 20.5v-5.5h4v5.5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6"/>' + dot(12, 17, 1.1),
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/>' + dot(12, 7.75, 1.1),
  film: '<rect x="3.5" y="9.5" width="17" height="11" rx="1.75"/><path d="M3.5 9.5L3 6.6a1 1 0 0 1 .8-1.2l14.7-2.6a1 1 0 0 1 1.2.8l.5 2.9z"/><path d="M8 4.6l2.4 3.6M13.2 3.7l2.4 3.6"/><path d="M3.5 13.5h17"/>',
  users: '<circle cx="9" cy="8" r="3.25"/><path d="M3 20c.5-3.6 3-5.75 6-5.75s5.5 2.15 6 5.75"/><path d="M15.25 4.9a3.25 3.25 0 0 1 0 6.2M17.5 14.7c2 .8 3.3 2.7 3.5 5.3"/>',
  user: '<circle cx="12" cy="8" r="3.75"/><path d="M4.5 20.5c.6-4.1 3.6-6.75 7.5-6.75s6.9 2.65 7.5 6.75"/>',
  cart: '<path d="M2.5 3.5H5l2.3 11h10.9l2.3-8H6"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
  box: '<path d="M12 2.8l8.5 4.3v9.8L12 21.2l-8.5-4.3V7.1z"/><path d="M3.5 7.1l8.5 4.3 8.5-4.3M12 11.4v9.8"/><path d="M7.75 4.95l8.5 4.3"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.4-3.4a5.5 5.5 0 0 1-7.3 7.3l-6.5 6.5a2.1 2.1 0 0 1-3-3l6.5-6.5a5.5 5.5 0 0 1 7.3-7.3z"/>',
  refresh: '<path d="M20 11.5a8 8 0 0 0-14.4-4.8L4 8.5"/><path d="M4 4v4.5h4.5"/><path d="M4 12.5a8 8 0 0 0 14.4 4.8L20 15.5"/><path d="M20 20v-4.5h-4.5"/>',
  chart: '<path d="M3.5 20.5h17"/><path d="M7 17v-5M12 17V7M17 17v-8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>' + dot(8, 14, 1) + dot(12, 14, 1) + dot(16, 14, 1) + dot(8, 17.25, 1),
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  key: '<circle cx="7.5" cy="15.5" r="4"/><path d="M10.5 12.5L20 3M16 7l3 3M18 5l2 2"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7l5 5-5 5-5-5z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.25 15.25L20.5 20.5"/>',
  menu: '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
  edit: '<path d="M15.5 4.5l4 4L9 19H5v-4z"/><path d="M13 7l4 4"/>',
  trash: '<path d="M4 6.5h16M9.5 6.5V4h5v2.5"/><path d="M6 6.5l1 14h10l1-14"/><path d="M10 10.5v6M14 10.5v6"/>',
  save: '<path d="M4.5 3.5h12l3 3v14h-15z"/><path d="M8 3.5v5h7v-5"/><rect x="7.5" y="13" width="9" height="7.5"/>',
  volume: '<path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  mute: '<path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  flag: '<path d="M5 21.5V3.5"/><path d="M5 4.5c4-2 7 2 13 0v8c-6 2-9-2-13 0"/>',
  filter: '<path d="M3.5 4.5h17l-6.5 8v6l-4 2v-8z"/>',
  sort: '<path d="M7 4v16M3.5 16.5L7 20l3.5-3.5M17 20V4M13.5 7.5L17 4l3.5 3.5"/>',

  // ---------------------------------------------------------------- premium (multi-colour, fixed fills)
  diamond: '<path d="M6.5 4h11L21 9l-9 11.5L3 9z" fill="#2a8fd6" stroke="#e6faff" stroke-width="1.25"/><path d="M3 9h18l-3.5-5h-11z" fill="#8eeaff" stroke="none"/><path d="M8.25 9L12 20.5 15.75 9z" fill="#5ee4ff" stroke="none"/><path d="M6.5 4l1.75 5L12 4l3.75 5 1.75-5" fill="none" stroke="#e6faff" stroke-width="1"/><path d="M3 9h18M8.25 9L12 20.5 15.75 9" fill="none" stroke="#e6faff" stroke-width="1"/><path d="M6.5 4L3 9l9 11.5L21 9l-3.5-5z" fill="none" stroke="#e6faff" stroke-width="1.25"/>',
  credit: '<circle cx="12" cy="12" r="9.25" fill="#c58a3a" stroke="none"/><circle cx="12" cy="12" r="7.5" fill="#ffd091" stroke="#fff3d6" stroke-width=".9"/><path d="M12 6.5l5.5 5.5-5.5 5.5L6.5 12z" fill="#fff3d6" stroke="#c58a3a" stroke-width="1.25"/><path d="M12 9.5l2.5 2.5-2.5 2.5-2.5-2.5z" fill="#e2a85a" stroke="none"/><path d="M6.6 8.4a6.4 6.4 0 0 1 3.6-3.4" fill="none" stroke="#fffaf0" stroke-width="1.25"/>',
  shard: '<path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#b58cff" stroke="#efe9ff" stroke-width="1.1"/><path d="M12 2l2.6 7.4L12 12zM2 12l7.4-2.6L12 12zM12 12l2.6 2.6L12 22zM12 12h10l-7.4 2.6z" fill="#e8ddff" stroke="none" opacity=".9"/><path d="M12 2v20M2 12h20" fill="none" stroke="#7a52d6" stroke-width=".8" opacity=".6"/>',
  'pink-crystal': '<path d="M12 2.5l3.5 4v10.5L12 21.5 8.5 17V6.5z" fill="#f472b6" stroke="#ffe0f0" stroke-width="1.1"/><path d="M12 2.5v19L8.5 17V6.5z" fill="#ffc2df" stroke="none"/><path d="M8.5 9.5L5 11v5.5l3.5 2.5zM15.5 9.5L19 11v5.5L15.5 19z" fill="#c94a8e" stroke="#ffe0f0" stroke-width="1"/><path d="M8.5 6.5L12 9l3.5-2.5" fill="none" stroke="#ffe0f0" stroke-width=".9"/>',
  essence: '<circle cx="12" cy="11" r="7.5" fill="#5a3ea8" stroke="#e8ddff" stroke-width="1.1"/><path d="M12 3.5a7.5 7.5 0 0 0 0 15 5.5 7.5 0 0 1 0-15z" fill="#8a64e6" stroke="none"/><path d="M8 8.2a4.6 4.6 0 0 1 3-2.4" fill="none" stroke="#f4eeff" stroke-width="1.4" stroke-linecap="round"/><path d="M14.5 10.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" fill="#ffd091" stroke="none"/><path d="M7 18.5h10l1.2 3H5.8z" fill="#ffd091" stroke="#c58a3a" stroke-width="1"/>',
};

// fixed-colour icons (keep their own fills; do not tint)
export const COLORED = new Set(['diamond', 'credit', 'shard', 'pink-crystal', 'essence']);
export const ICON_NAMES = Object.keys(ICONS);

// emoji currently used as UI art -> semantic icon (for the migration away from emoji)
export const EMOJI_ICON = {
  '🏠': 'village', '🚂': 'station', '🌙': 'moon', '❄️': 'snowflake', '⚔️': 'battle', '⭐': 'star', '🌀': 'gate', '🏁': 'terminal',
  '🔒': 'lock', '🏃': 'traveler', '🧧': 'newyear', '🎀': 'maid', '🎄': 'christmas', '🐉': 'dragon', '🎂': 'anniversary', '👙': 'summer',
  '👤': 'outfit-default', '👗': 'dress', '👘': 'kimono', '🎴': 'pack', '📚': 'deck', '🖼️': 'collection', '🎁': 'gift', '🎯': 'target',
  '🛡': 'shield', '🛡️': 'guard', '🗡️': 'dagger', '🔮': 'moon-orb', '👢': 'rush', '⚡': 'bolt', '☠️': 'bane', '🩸': 'blood',
  '💥': 'burst', '✨': 'sparkle', '📜': 'scroll', '⬆️': 'up-arrow', '✧': 'star4', '✦': 'shard', '💎': 'diamond', '◈': 'credit',
  '⚙': 'settings', '⌂': 'home', '✕': 'close', '🎬': 'film', '✓': 'check', '★': 'star', '☆': 'star-empty', '←': 'arrow-left',
  '▶': 'play', '▸': 'chevron-right', '🔥': 'flame', '🌑': 'eclipse', '👼️': 'angel', '👼': 'angel', '🌟': 'sparkle', '👑': 'crown',
  '💗': 'pink-crystal', '🧪': 'potion', '💊': 'pill', '💉': 'elixir', '🍶': 'flask', '🫥': 'ghost', '🥤': 'cup', '🌿': 'herb',
  '🍲': 'bowl', '🍞': 'bread', '🚰': 'canteen', '💨': 'wind', '🩹': 'bandage', '🪄': 'wand', '🔪': 'dagger', '🧥': 'cloak',
  '🏹': 'bow', '💧': 'drop', '🦺': 'armor', '🧤': 'gauntlet', '🪖': 'helmet', '🔱': 'trident', '👊': 'fist', '🐍': 'whip',
  '🪓': 'axe', '🔨': 'hammer', '📖': 'book', '👁️': 'eye', '🎵': 'music', '⌚': 'bracer', '📿': 'amulet', '🎭': 'mask',
  '👞': 'boot', '🥿': 'boot', '💍': 'ring', '👖': 'greaves', '⛓️': 'chain', '🏅': 'medal', '👕': 'tunic', '🪵': 'buckler', '👒': 'hat',
  '🤖': 'mech', '😴': 'sleep', '💤': 'sleep', '🌌': 'galaxy', '🔭': 'telescope', '🧣': 'scarf', '🖤': 'heart', '🧺': 'basket',
  '🦷': 'fang', '⚜️': 'lily', '🕊️': 'dove', '🔧': 'wrench', '🛒': 'cart', '📦': 'box', '🔄': 'refresh', '💛': 'gem', '💙': 'gem', '⬜': 'gem',
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * Inline SVG markup for an icon (empty string for unknown names).
 * @param {string} name
 * @param {{size?: number|string, cls?: string, title?: string}} [opts]
 */
export function icon(name, { size = 20, cls = '', title = '' } = {}) {
  const inner = Object.prototype.hasOwnProperty.call(ICONS, name) ? ICONS[name] : '';
  if (!inner) return '';
  const s = esc(size);
  const klass = `ico ico-${name}${COLORED.has(name) ? ' ico-colored' : ''}${cls ? ' ' + esc(cls) : ''}`;
  const a11y = title ? `role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>` : 'aria-hidden="true" focusable="false">';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${s}" height="${s}" class="${klass}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ${a11y}${inner}</svg>`;
}
