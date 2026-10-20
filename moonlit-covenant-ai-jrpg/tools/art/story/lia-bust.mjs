// Story-mode bust of Lia (speakers lia / lia_unknown): the same face and armour as the heroine portrait
// (tools/art/portrait/heroines/lia.mjs), but transparent — no gothic window, blood moon or night lighting —
// so she sits on day scenes like the NPC busts, plus her canon tower shield "Chishi" behind the left shoulder.
// The 832×1216 portrait is scaled to the 600×800 bust frame (fit to height, centred) and faded out at the
// bottom like the NPC busts. The gacha / side-story portrait (public/assets/portraits/lia.svg) is unchanged.
import { compose } from '../portrait/base.mjs';
import lia from '../portrait/heroines/lia.mjs';

const PW = 832, PH = 1216, BW = 600, BH = 800;
const PREFIX = 'sbNpcLia';

export function liaBust() {
  const svg = compose(lia, { background: false, extras: ['shield'], prefix: PREFIX });
  const open = svg.match(/^<svg[^>]*>/);
  if (!open || !svg.endsWith('</svg>')) throw new Error('lia bust: unexpected compose() output');
  const inner = svg.slice(open[0].length, -'</svg>'.length);
  const k = BH / PH;
  const dx = (BW - PW * k) / 2;
  const f = (v) => String(Math.round(v * 10000) / 10000);
  const label = '莉亚：赤红高马尾的盾战士，银甲、烧焦内衬的披风，左肩后露出塔盾「赤誓」的一角';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BW} ${BH}" role="img" aria-label="${label}">\n`
    + `<defs><linearGradient id="${PREFIX}-fadeG" x1="0" y1="0" x2="0" y2="1"><stop offset=".84" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
    + `<mask id="${PREFIX}-fade" maskUnits="userSpaceOnUse" x="0" y="0" width="${BW}" height="${BH}"><rect width="${BW}" height="${BH}" fill="url(#${PREFIX}-fadeG)"/></mask></defs>\n`
    + `<g mask="url(#${PREFIX}-fade)"><g transform="matrix(${f(k)} 0 0 ${f(k)} ${f(dx)} 0)">${inner}</g></g>\n`
    + `</svg>\n`;
}
