// camp-fire.svg 「战前餐车」 — repaint (cinematic pass).
// Over the captain's shoulder: the three heroines around the lamp-lit table of the blacked-out
// dining car, minutes before the battle. Lia stands and raps the table with the pommel of her
// sheathed rapier ("听着。现在，你是队长。"), Serena sits calm behind her tea under the eclipse,
// Mia hunches over her sphere drone Zero and peeks up at you ("你也不会告诉她的对吧？").
// Key light = the brass table lamp (warm, from the table), back light = the eclipse window
// (cool violet), rim light in each heroine's standard colour.
import { f, pt, smooth, taper, path, line, radial, linear, blurs, rng, context } from './polish-lib.mjs';
import { lia, liaSword } from './polish-camp-lia.mjs';

const p = 'campFire';
const C = {
  lia: '#ff6b7c', liaDeep: '#c13b4c', mia: '#5ed7ff', miaOrange: '#ff9a3c', serena: '#b58cff', serenaWhite: '#efe9ff',
  oath: '#ffd091', moon: '#e8ddff', brass: '#b88a4a', brassHi: '#ffd091', brassSh: '#5e4223', lamp: '#ffc670',
};
const S = (P) => smooth(P, true);
const O = (P) => smooth(P, false);
const use = (id, fill, extra = '') => `<use href="#${p}-${id}" fill="${fill}"${extra}/>`;

// ---------------------------------------------------------------------------------------------
// environment: back wall, eclipse windows, booth seats
// ---------------------------------------------------------------------------------------------
function room(R) {
  let d = '', s = '';
  d += linear(`${p}-wall`, [[0, '#0c1316'], [0.55, '#14211f'], [1, '#1c1712']]);
  d += linear(`${p}-sky`, [[0, '#0b0822'], [0.45, '#241a52'], [0.8, '#4a3478'], [1, '#6a4a86']]);
  d += radial(`${p}-corona`, [[0, '#000', 0], [0.3, '#b58cff', 0], [0.33, '#f4eeff', 0.95], [0.4, '#b58cff', 0.55], [0.62, '#6d4fc4', 0.2], [1, '#3a2a7a', 0]], 'r="0.5"');
  d += radial(`${p}-skyGlow`, [[0, '#8a6ad8', 0.55], [0.5, '#5a3ea8', 0.2], [1, '#3a2a7a', 0]]);
  d += linear(`${p}-curtain`, [[0, '#2a0a14'], [0.35, '#6a1a2c'], [0.6, '#4a1020'], [1, '#1e060e']], 'x1="0" y1="0" x2="1" y2="0"');
  d += linear(`${p}-wood`, [[0, '#2a1810'], [1, '#120a06']]);
  d += linear(`${p}-booth`, [[0, '#5a1626'], [0.5, '#3a0c18'], [1, '#1a050b']]);
  s += `<rect width="1600" height="900" fill="url(#${p}-wall)"/>`;
  // ceiling + luggage rack
  s += `<path d="M0,0H1600V64H0Z" fill="#090d10"/><path d="M0,64H1600" stroke="${C.brass}" stroke-width="3" opacity=".7"/>`;
  s += `<path d="M0,84H1600M0,98H1600" stroke="#3a2a1a" stroke-width="3"/>`;
  s += `<g fill="#2a1d12">${[180, 214, 248, 700, 734, 1180, 1214, 1500].map((x) => `<rect x="${x}" y="66" width="4" height="34"/>`).join('')}</g>`;
  // windows (arched); the centre one frames the eclipse behind Serena
  const wins = [[24, 318], [636, 1224], [1346, 1640]];
  const arch = ([x0, x1]) => {
    const rr = (x1 - x0) / 2, top = 128;
    return `M${x0},508V${top + rr * 0.42}Q${x0},${top} ${x0 + rr},${top}Q${x1},${top} ${x1},${top + rr * 0.42}V508Z`;
  };
  const winPaths = wins.map(arch).join('');
  d += `<clipPath id="${p}-win"><path d="${winPaths}"/></clipPath>`;
  let view = `<rect x="0" y="100" width="1600" height="420" fill="url(#${p}-sky)"/>`;
  view += `<circle cx="930" cy="214" r="340" fill="url(#${p}-skyGlow)"/>`;
  // stars
  let st = '';
  for (let i = 0; i < 70; i++) {
    const x = R.range(20, 1600), y = R.range(120, 420), rr = R() < 0.88 ? R.range(0.6, 1.4) : R.range(1.6, 2.3);
    st += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr, 1)}" opacity="${f(R.range(0.3, 0.9), 1)}"/>`;
  }
  view += `<g fill="${C.moon}">${st}</g>`;
  // the eclipse + diamond bead
  view += `<circle cx="930" cy="214" r="190" fill="url(#${p}-corona)"/>`;
  view += `<circle cx="930" cy="214" r="59" fill="none" stroke="${C.serenaWhite}" stroke-width="2.2" opacity=".9"/><circle cx="930" cy="214" r="57" fill="#05040c"/>`;
  view += `<circle cx="888" cy="174" r="11" fill="#fff" opacity=".55" filter="url(#${p}-b1)"/><circle cx="888" cy="174" r="3.2" fill="#fff"/>`;
  // distant ranges racing past + speed streaks
  view += path('M0,452L90,430L170,446L260,418L340,440L470,410L560,432L660,402L760,428L850,414L960,436L1060,404L1170,430L1260,412L1380,438L1480,416L1600,432V520H0Z', '#1d1440');
  view += path('M0,478L120,462L240,476L380,456L520,474L640,460L780,480L900,462L1040,478L1180,458L1320,476L1460,462L1600,474V520H0Z', '#120c2a');
  let streak = '';
  for (let i = 0; i < 16; i++) { const y = R.range(300, 470), x = R.range(0, 1500); streak += `M${f(x)},${f(y)}h${f(R.range(60, 220))}`; }
  view += line(streak, '#cbb8ff', 1.2, ' opacity=".18"');
  // glass: diagonal sheen + the lamp's reflection in the pane
  view += `<g fill="#cbbcff" opacity=".05"><path d="M640,508L860,128H930L710,508Z"/><path d="M1040,508L1220,180V260L1110,508Z"/><path d="M60,508L250,128H290L100,508Z"/></g>`;
  view += `<ellipse cx="1110" cy="420" rx="26" ry="16" fill="${C.lamp}" opacity=".22" filter="url(#${p}-b1)"/>`;
  s += `<g clip-path="url(#${p}-win)">${view}</g>`;
  // frames + mullions
  s += `<path d="${winPaths}" fill="none" stroke="#3a2614" stroke-width="12"/>`;
  s += `<path d="${winPaths}" fill="none" stroke="${C.brass}" stroke-width="3.5" opacity=".85"/>`;
  s += line('M930,128V508M636,330H1224M171,128V508M24,330H318M1493,128V508', '#2a1a0e', 6);
  s += line('M930,128V508M636,330H1224', C.brass, 1.6, ' opacity=".5"');
  // window sill
  s += `<path d="M0,508H1600V522H0Z" fill="#3a2414"/><path d="M0,508H1600" stroke="${C.brassHi}" stroke-width="2" opacity=".5"/>`;
  // tied-back curtains
  const curtain = (x, dir) => {
    const k = dir;
    return `<path d="M${x - 34 * k},100Q${x},128 ${x + 34 * k},100L${x + 30 * k},290Q${x + 46 * k},318 ${x + 22 * k},348Q${x + 6 * k},450 ${x + 18 * k},540H${x - 40 * k}Q${x - 30 * k},430 ${x - 40 * k},330Z" fill="url(#${p}-curtain)"/>`
      + `<path d="M${x + 24 * k},300Q${x - 4 * k},318 ${x - 30 * k},306" fill="none" stroke="${C.brass}" stroke-width="5"/>`;
  };
  s += curtain(616, 1) + curtain(1244, -1) + curtain(338, -1);
  // wainscot below the sills
  s += `<path d="M0,522H1600V900H0Z" fill="url(#${p}-wood)"/>`;
  s += `<g fill="none" stroke="#3e2618" stroke-width="3">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<rect x="${10 + i * 164}" y="540" width="136" height="120" rx="4"/>`).join('')}</g>`;
  // booth seat back behind Serena and Mia (velvet, brass studs)
  s += path('M760,600V470Q760,440 792,438H1418Q1450,440 1450,470V600Z', `url(#${p}-booth)`);
  s += line('M772,452Q790,444 812,444H1400Q1428,444 1440,456', '#a83a52', 3, ' opacity=".7"');
  s += `<g fill="${C.brass}" opacity=".7">${Array.from({ length: 17 }, (_, i) => `<circle cx="${800 + i * 38}" cy="462" r="2.4"/>`).join('')}</g>`;
  s += line('M1104,446V600', '#1a050b', 4, ' opacity=".8"');
  return { d, s };
}

// ---------------------------------------------------------------------------------------------
// table, lamp, props
// ---------------------------------------------------------------------------------------------
function table() {
  let d = '', s = '';
  d += radial(`${p}-cloth`, [[0, '#fff1dc'], [0.18, '#f0d6b0'], [0.45, '#b68e66'], [0.75, '#5e4430'], [1, '#2a1c14']], 'gradientUnits="userSpaceOnUse" cx="720" cy="640" r="820" gradientTransform="translate(720 640) scale(1 .42) translate(-720 -640)"');
  d += linear(`${p}-drape`, [[0, '#7a5c44'], [0.3, '#4a3424'], [1, '#160e0a']]);
  s += path('M206,588H1394L1560,806H40Z', `url(#${p}-cloth)`);
  s += path('M40,806H1560V900H40Z', `url(#${p}-drape)`);
  s += line('M40,806H1560', '#ffe9c8', 2.5, ' opacity=".55"');
  s += line('M206,588H1394', '#6a4c34', 2, ' opacity=".6"');
  s += line('M300,812Q306,860 298,900M620,812Q628,860 622,900M940,812Q946,860 944,900M1260,812Q1268,860 1272,900', '#2a1c14', 3, ' opacity=".5"');
  return { d, s };
}

function lamp() {
  let d = '', s = '';
  d += radial(`${p}-lampGlow`, [[0, '#fff4dc', 0.95], [0.1, '#ffd690', 0.75], [0.32, '#ff9e4a', 0.3], [0.65, '#ff8a3c', 0.08], [1, '#ff8a3c', 0]]);
  d += linear(`${p}-shade`, [[0, '#ffe4a8'], [0.6, '#ffb45e'], [1, '#e0782c']], 'x1="0" y1="0" x2="1" y2="0"');
  const x = 724, y = 650;
  s += `<ellipse cx="${x}" cy="${y + 2}" rx="46" ry="9" fill="#3a2414" opacity=".5"/>`;
  s += path(`M${x - 22},${y}h44l-6,-12h-32z`, C.brassSh) + path(`M${x - 16},${y - 12}h32l-4,-6h-24z`, C.brass);
  s += path(`M${x - 4},${y - 18}V${y - 92}h8V${y - 18}z`, C.brass) + line(`M${x - 1},${y - 20}V${y - 90}`, C.brassHi, 1.6);
  // pleated fabric shade, glowing from inside
  s += path(`M${x - 58},${y - 74}L${x - 36},${y - 128}H${x + 36}L${x + 58},${y - 74}Z`, `url(#${p}-shade)`);
  s += line(`M${x - 44},${y - 74}L${x - 27},${y - 128}M${x - 22},${y - 74}L${x - 13},${y - 128}M${x},${y - 74}V${y - 128}M${x + 22},${y - 74}L${x + 13},${y - 128}M${x + 44},${y - 74}L${x + 27},${y - 128}`, '#d0702a', 1.2, ' opacity=".55"');
  s += line(`M${x - 58},${y - 74}H${x + 58}`, '#fff6e2', 3) + line(`M${x - 36},${y - 128}H${x + 36}`, '#8a4a1c', 3);
  s += `<ellipse cx="${x}" cy="${y - 72}" rx="56" ry="7" fill="#fffaf0" opacity=".9"/>`;
  return { d, s, x, y };
}

function props() {
  let s = '';
  // map of the line with the rail route (centre front)
  s += `<g transform="translate(820 724) rotate(-4)"><path d="M-150,-34L146,-40L162,38L-160,44Z" fill="#e6cfa2" opacity=".92"/><path d="M-138,14Q-70,-26,-6,6T150,-6" fill="none" stroke="#6a2a1e" stroke-width="2.4" stroke-dasharray="8 5"/><circle cx="-6" cy="6" r="5" fill="${C.liaDeep}"/><path d="M-120,-20h30M60,24h40M-60,30h26" stroke="#a5835a" stroke-width="1.6"/></g>`;
  // plate of crescent pastries (left front)
  s += `<g transform="translate(420 734)"><ellipse rx="70" ry="16" fill="#3a2a1e" opacity=".35" transform="translate(4 6)"/><ellipse rx="68" ry="16" fill="#f3ece2"/><ellipse rx="52" ry="11" fill="none" stroke="${C.brass}" stroke-width="1.6"/><path d="M-34,-2a15,10 0 1 1 24,-6a11,8 0 1 0 -24,6z" fill="#d9944a"/><path d="M0,-4a15,10 0 1 1 24,-6a11,8 0 1 0 -24,6z" fill="#c47c36"/><path d="M-16,5a13,8 0 1 1 22,-5a10,7 0 1 0 -22,5z" fill="#e8a85e"/></g>`;
  // teapot (Serena's), porcelain + gold
  s += `<g transform="translate(1046 632)"><ellipse cx="2" cy="26" rx="44" ry="8" fill="#2a1c14" opacity=".4"/><path d="M-32,24Q-36,-8,0,-12Q36,-8,32,24Z" fill="#efe8de"/><path d="M-32,24Q-36,-8,0,-12Q-14,4-12,24Z" fill="#fffaf2"/><path d="M8,-10Q30,-4,32,24H12Q20,6,8,-10Z" fill="#b8a898"/><path d="M-32,2Q-56,-6-60,-22" fill="none" stroke="#efe8de" stroke-width="6" stroke-linecap="round"/><path d="M32,2Q48,0,46,18" fill="none" stroke="#a89888" stroke-width="5"/><circle cy="-13" r="5" fill="${C.brass}"/><path d="M-28,4H28" stroke="${C.brass}" stroke-width="2"/></g>`;
  return s;
}

// ---------------------------------------------------------------------------------------------
// the captain: back of the head and shoulder, out of focus in the foreground
// ---------------------------------------------------------------------------------------------
function player() {
  let s = '';
  const body = S([[-60, 900, 1], [-40, 800], [10, 742], [96, 712], [150, 690], [200, 700], [262, 736], [330, 790], [372, 850], [386, 900, 1]]);
  const head = S([[60, 720], [52, 650], [74, 596], [122, 566], [176, 566], [222, 596], [244, 650], [236, 716], [204, 756], [150, 770], [100, 760]]);
  s += `<g filter="url(#${p}-b1)">`;
  s += path(body, '#0c0a12') + path(head, '#0e0b16');
  s += line('M76,596Q122,560 176,564Q222,590 242,646', C.lamp, 5, ' opacity=".55"');
  s += line('M244,654Q240,712 206,754M262,738Q330,790 372,850', '#ffb45e', 4, ' opacity=".5"');
  s += line('M96,600Q130,578 170,580', C.moon, 3, ' opacity=".25"');
  // coat collar
  s += path('M150,770L196,756L240,800L210,840Z', '#16121e');
  s += '</g>';
  return s;
}


export function campFire() {
  const R = rng(1801);
  const c = context(p);
  let defs = blurs(p, [['b1', 3], ['b2', 12], ['b3', 34]]);
  let body = '';
  const rm = room(R); defs += rm.d; body += rm.s;
  const tb = table(); defs += tb.d;
  const lp = lamp(); defs += lp.d;
  defs += radial(`${p}-vig`, [[0.5, '#000', 0], [1, '#000', 0.78]], 'r="0.72"');
  defs += linear(`${p}-bot`, [[0, '#070614', 0], [1, '#070614', 0.7]]);
  // lamp light spilling over the back of the room
  body += `<ellipse cx="724" cy="560" rx="760" ry="520" fill="url(#${p}-lampGlow)" opacity=".5"/>`;
  body += lia(c);
  body += tb.s;
  body += `<ellipse cx="724" cy="660" rx="520" ry="120" fill="url(#${p}-lampGlow)" opacity=".7"/>`;
  body += props();
  body += liaSword(c);
  body += lp.s;
  body += `<circle cx="724" cy="580" r="150" fill="url(#${p}-lampGlow)" opacity=".8"/>`;
  body += player();
  body += `<rect width="1600" height="900" fill="url(#${p}-vig)"/>`;
  body += `<rect y="760" width="1600" height="140" fill="url(#${p}-bot)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-label="战前餐车：莉亚用剑柄敲桌子，塞蕾娜捧茶，米娅修理零号">\n<defs>${defs}${c.defs}</defs>\n${body}\n</svg>\n`;
}
