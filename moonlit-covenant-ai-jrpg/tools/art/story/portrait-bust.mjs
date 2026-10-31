// Story-mode busts made from a heroine's gacha portrait (tools/art/portrait/heroines/<id>.mjs): the same face,
// hair and clothes, composed with { background: false } — no backdrop, no full-frame lighting, only the figure
// and its rim light — so the bust sits on day and night scenes like the NPC busts. The 832×1216 portrait is
// scaled to the 600×800 bust frame (fit to height, centred) and faded out at the bottom like the NPC busts.
import { compose } from '../portrait/base.mjs';

const PW = 832, PH = 1216, BW = 600, BH = 800;

export function portraitBust(heroine, { prefix, label, extras = [] }) {
  const svg = compose(heroine, { background: false, extras, prefix });
  const open = svg.match(/^<svg[^>]*>/);
  if (!open || !svg.endsWith('</svg>')) throw new Error(`${prefix}: unexpected compose() output`);
  const inner = svg.slice(open[0].length, -'</svg>'.length);
  const k = BH / PH;
  const dx = (BW - PW * k) / 2;
  const f = (v) => String(Math.round(v * 10000) / 10000);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BW} ${BH}" role="img" aria-label="${label}">\n`
    + `<defs><linearGradient id="${prefix}-fadeG" x1="0" y1="0" x2="0" y2="1"><stop offset=".84" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
    + `<mask id="${prefix}-fade" maskUnits="userSpaceOnUse" x="0" y="0" width="${BW}" height="${BH}"><rect width="${BW}" height="${BH}" fill="url(#${prefix}-fadeG)"/></mask></defs>\n`
    + `<g mask="url(#${prefix}-fade)"><g transform="matrix(${f(k)} 0 0 ${f(k)} ${f(dx)} 0)">${inner}</g></g>\n`
    + `</svg>\n`;
}
