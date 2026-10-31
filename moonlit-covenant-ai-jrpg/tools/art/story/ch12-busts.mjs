// Chapter 12 variants of the heroine story busts (script 12 美術需求), both built by portraitBust() like lia / serena:
//   lia_mirror           — the mirror double that walks out of the fog in 镜巷 (speaker lia_mirror, nameplate 莉亚, so the
//                          puzzle holds): Lia's own bust (shield included) under a cold mirror sheen — a cool glassy wash,
//                          two diagonal glints and fine hairline cracks on the pauldron, breastplate, cape and shield, none
//                          across the face. Masked to the figure, so the transparent surround stays clear; no shadow of any kind is
//                          added (the double 'has no shadow'), no blood.
//   serena_staff_wrapped — Serena's bust from 12-03 on: the same figure, the head of her staff bound in plain dark cloth
//                          (the portrait's `staffWrapped` extra instead of `staff`).
import lia from '../portrait/heroines/lia.mjs';
import serena from '../portrait/heroines/serena.mjs';
import { portraitBust } from './portrait-bust.mjs';

const PW = 832, PH = 1216, BW = 600, BH = 800;

export function liaMirrorBust() {
  const p = 'sbNpcLiaMirror';
  const svg = portraitBust(lia, { prefix: p, extras: ['shield'], label: '莉亚（镜中分身）：与莉亚一模一样的赤红高马尾、银甲、披风与塔盾，整个人蒙着一层冷色的镜面光，盔甲、披风和盾上有细细的裂纹，脸上没有；没有影子，不画血' });
  const k = BH / PH, dx = (BW - PW * k) / 2;
  const n = (v) => String(Math.round(v * 10000) / 10000);
  // the figure group compose() emits, reused as an alpha mask so the sheen stays on her
  const mask = `<mask id="${p}-glass" mask-type="alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="${BW}" height="${BH}"><g transform="matrix(${n(k)} 0 0 ${n(k)} ${n(dx)} 0)"><use href="#${p}-t-figure"/></g></mask>`
    + `<linearGradient id="${p}-coolG" x1="0" y1="0" x2=".5" y2="1"><stop offset="0" stop-color="#d6e4ff"/><stop offset=".5" stop-color="#9aaee0"/><stop offset="1" stop-color="#5a6aa0"/></linearGradient>`;
  // hairline cracks (bust coordinates): from a point on the breastplate, the right pauldron, the cape hem and the shield
  const crack = (x, y, arms) => arms.map(([a, b, c, d]) => `M${x},${y}L${x + a},${y + b}L${x + a + c},${y + b + d}`).join('');
  const cracks = crack(372, 690, [[26, -18, 18, 6], [-22, 24, -12, 26], [20, 30, 6, 26], [-28, -8, -16, -14]])
    + crack(186, 578, [[22, 10, 14, -8], [8, 26, 14, 16], [-14, 18, -6, 22]])
    + crack(132, 708, [[18, 26, 6, 28], [-12, 32, 4, 24], [22, -12, 16, 4]])
    + crack(500, 452, [[16, 18, 6, 22], [-10, 22, 12, 18], [18, -14, 10, -16]]);
  const overlay = `<g mask="url(#${p}-glass)">`
    + `<rect width="${BW}" height="${BH}" fill="url(#${p}-coolG)" opacity=".34"/>`
    + `<path d="M40,520L300,120L346,120L86,520ZM220,640L520,180L540,180L240,640Z" fill="#f4f8ff" opacity=".16"/>`
    + `<path d="${cracks}" fill="none" stroke="#1a2036" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".45" transform="translate(1.5 1.5)"/>`
    + `<path d="${cracks}" fill="none" stroke="#f0f6ff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`
    + `</g>`;
  const out = svg.replace('</defs>', `${mask}</defs>`).replace(/<\/g>\n<\/svg>\n$/, `${overlay}</g>\n</svg>\n`);
  if (out === svg || !out.includes(overlay)) throw new Error('liaMirrorBust: unexpected portraitBust() output');
  return out;
}

export function serenaStaffWrappedBust() {
  return portraitBust(serena, { prefix: 'sbNpcSerenaWrapped', extras: ['staffWrapped'], label: '塞雷娜（杖头包着布）：紫黑长直发、发尾月白，左侧细辫串着银色月相盘，淡紫星轨纹的眼，紫黑丝绒长袍与银线封印纹，领口下闭眼形银吊坠，右手半截白手套；右肩后的黑曜法杖，杖头用一块暗色的布包着、拿绳子扎紧' });
}

export const ch12Busts = { lia_mirror: liaMirrorBust, serena_staff_wrapped: serenaStaffWrappedBust };
