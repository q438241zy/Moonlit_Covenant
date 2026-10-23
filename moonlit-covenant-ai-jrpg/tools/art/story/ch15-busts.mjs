// Chapter 15 variant of a heroine story bust (script 15 美術需求), built by portraitBust() like lia_mirror:
//   serena_copy — 学人的塞雷娜, the thing in the sunk nest that copies her (speaker serena_copy, nameplate 塞雷娜, so the
//                 puzzle holds; the copied Lia keeps using lia_mirror): the same figure as serena_staff_wrapped (staff
//                 head bound in cloth), but wrong in two quiet ways —
//                   - along the edge of the whole silhouette a very faint rim of fine white worm-like squiggles (a band
//                     about ten pixels deep: a worm-patterned stroke along the traced outline, masked to the figure),
//                     plus the cool glassy wash that lia_mirror wears;
//                   - the eyes have no catch-lights (both white highlights in each eye removed).
//                 No crawling bugs on the face, no wound, no blood, nothing suggestive. Masked to the figure, so the
//                 transparent surround stays clear.
import serena from '../portrait/heroines/serena.mjs';
import { portraitBust } from './portrait-bust.mjs';
import { rng } from './lib.mjs';

const PW = 832, PH = 1216, BW = 600, BH = 800;
// the outline of serena_staff_wrapped's figure in bust coordinates (left side bottom → staff head → crown of the head →
// right side bottom), traced once from the bust; a broad worm-patterned stroke along it is masked to the figure, so only
// its inner half shows — a rim a few pixels deep without spending a filter (the portrait already uses all four)
const OUTLINE = [[98, 800], [98, 772], [99, 748], [99, 724], [100, 700], [100, 676], [101, 652], [102, 628], [103, 604], [106, 580], [106, 556], [114, 532], [135, 508], [137, 484], [134, 460], [107, 436], [112, 412], [83, 388], [79, 364], [72, 340], [70, 316], [61, 292], [74, 268], [83, 244], [84, 242], [96, 229], [108, 220], [120, 229], [132, 235], [144, 249], [156, 273], [168, 309], [180, 242], [192, 187], [204, 163], [216, 149], [228, 138], [240, 131], [252, 126], [264, 124], [276, 121], [288, 119], [300, 118], [312, 119], [324, 121], [336, 124], [348, 127], [360, 132], [372, 139], [384, 150], [396, 165], [408, 190], [415, 220], [419, 244], [422, 268], [423, 292], [427, 316], [430, 340], [432, 364], [435, 388], [437, 412], [439, 436], [442, 460], [444, 484], [464, 508], [485, 532], [493, 556], [493, 580], [496, 604], [497, 628], [498, 652], [499, 676], [499, 700], [500, 724], [500, 748], [501, 772], [501, 800]];

export function serenaCopyBust() {
  const p = 'sbNpcSerenaCopy';
  let svg = portraitBust(serena, { prefix: p, extras: ['staffWrapped'], label: '塞雷娜（学人的那个）：和杖头包着布的塞雷娜一模一样——紫黑长直发、发尾月白，左侧细辫与银色月相盘，紫黑丝绒长袍，右肩后包着布的法杖——只是整个人蒙着一层冷色的镜面光，轮廓边缘有一圈极淡的白色细虫纹理，眼睛里没有高光' });
  // the eyes' catch-lights (drawEye() in portrait/base.mjs: a white ellipse and a small white circle per eye)
  const catchlights = /<ellipse cx="[\d.]+" cy="[\d.]+" rx="[\d.]+" ry="[\d.]+" fill="#fff"\/><circle cx="[\d.]+" cy="[\d.]+" r="[\d.]+" fill="#fff" opacity=".92"\/>/g;
  const found = (svg.match(catchlights) || []).length;
  if (found !== 2) throw new Error(`serenaCopyBust: expected 2 catch-light pairs, found ${found}`);
  svg = svg.replace(catchlights, '');
  const k = BH / PH, dx = (BW - PW * k) / 2;
  const n = (v) => String(Math.round(v * 10000) / 10000);
  const fig = `<g transform="matrix(${n(k)} 0 0 ${n(k)} ${n(dx)} 0)"><use href="#${p}-t-figure"/></g>`;
  // fine worm squiggles on a small repeating tile, used as the paint of the stroke along the outline
  const R = rng(15301), T = 74;
  let worms = '';
  for (let i = 0; i < 22; i++) {
    const x = R.range(0, T - 8), y = R.range(0, T - 8), a = R.range(0, Math.PI * 2), L = R.range(5, 9), c = Math.cos(a), s = Math.sin(a), b = R.range(1.6, 2.8) * (R() < 0.5 ? -1 : 1);
    const p1 = [x + c * L * 0.5 - s * b, y + s * L * 0.5 + c * b], p2 = [x + c * L, y + s * L];
    worms += `M${x.toFixed(1)},${y.toFixed(1)}Q${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  const defs = `<mask id="${p}-glass" mask-type="alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="${BW}" height="${BH}">${fig}</mask>`
    + `<pattern id="${p}-worms" patternUnits="userSpaceOnUse" width="${T}" height="${T}"><path d="${worms}" fill="none" stroke="#f2f6f0" stroke-width="1.3" stroke-linecap="round"/></pattern>`
    + `<linearGradient id="${p}-coolG" x1="0" y1="0" x2=".5" y2="1"><stop offset="0" stop-color="#e2ecff"/><stop offset=".5" stop-color="#aab8e0"/><stop offset="1" stop-color="#6a76a8"/></linearGradient>`;
  const overlay = `<g mask="url(#${p}-glass)">`
    + `<rect width="${BW}" height="${BH}" fill="url(#${p}-coolG)" opacity=".22"/>`
    + `<path d="M60,500L300,130L336,130L96,500ZM240,660L520,220L536,220L256,660Z" fill="#f4f8ff" opacity=".1"/>`
    + `</g>`
    + `<g mask="url(#${p}-glass)"><path d="M${OUTLINE.map(([x, y]) => `${x},${y}`).join('L')}" fill="none" stroke="url(#${p}-worms)" stroke-width="20" stroke-linejoin="round" opacity=".62"/></g>`;
  const out = svg.replace('</defs>', `${defs}</defs>`).replace(/<\/g>\n<\/svg>\n$/, `${overlay}</g>\n</svg>\n`);
  if (out === svg || !out.includes(overlay)) throw new Error('serenaCopyBust: unexpected portraitBust() output');
  return out;
}

export const ch15Busts = { serena_copy: serenaCopyBust };
