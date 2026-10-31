// 北山营地 — chapter 22 (script 22 美術需求):
//   north-slope-camp-night — the chapter 5 north-slope camp (bg-dawn.mjs north-slope-camp) at night: the same slope, tents and
//                            sheep-cave mouth under a night sky, the camp fires burning higher, a pale wash of moonlight.
//                            Built by darkening the day painting and adding the night on top, so the two always match.
//   north-hill-cave        — inside the shepherd's cave of chapter 0, now the camp's headquarters: rough rock walls, a plank
//                            table with a lamp and papers, blankets along the wall, the cave mouth a dark blue arch at the back.
//                            Lamp yellow against rock. No figures.
// No text anywhere.
import { Scene, W, H, f, rng } from './lib.mjs';
import { dawnBgs } from './bg-dawn.mjs';

const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;

function campNight() {
  const day = dawnBgs['north-slope-camp']();
  const pre = day.match(/id="(sb[A-Za-z0-9]+)-/)[1]; // ids must carry the file's own prefix
  const R = rng(22101);
  let stars = '';
  for (let k = 0; k < 70; k++) stars += ell(R.range(0, W), R.range(0, 300), R.range(0.6, 1.6), R.range(0.6, 1.6));
  // the fires of the day painting sit low on the slope; brighten the same places
  const glow = [[280, 452], [552, 496], [800, 512], [1000, 470]].map(([x, y]) =>
    `<ellipse cx="${x}" cy="${y}" rx="150" ry="70" fill="url(#${pre}-nfire)"/><path d="M${x - 8},${y}q8,-34 16,0z" fill="#ffd27a"/>`).join('');
  const night = `<defs><radialGradient id="${pre}-nfire"><stop offset="0" stop-color="#ffb860" stop-opacity=".55"/><stop offset="1" stop-color="#ffb860" stop-opacity="0"/></radialGradient>`
    + `<linearGradient id="${pre}-nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060a1a" stop-opacity=".92"/><stop offset=".55" stop-color="#0c1228" stop-opacity=".82"/><stop offset="1" stop-color="#05060c" stop-opacity=".78"/></linearGradient></defs>`
    + `<rect width="${W}" height="${H}" fill="url(#${pre}-nsky)"/><path d="${stars}" fill="#e8ecff" opacity=".75"/>`
    + `<ellipse cx="1260" cy="120" rx="46" ry="46" fill="#e8e4d4" opacity=".9"/>${glow}`;
  return day
    .replace(/aria-label="[^"]*"/, 'aria-label="北山缓坡·营地·夜：同一片坡地、帐篷和守羊洞口，夜空里有星星和一弯月，营火烧得更高，月光淡淡地洗在坡上"')
    .replace('</svg>', `${night}\n</svg>`);
}

function cave() {
  const S = new Scene('sbNhCave', '守羊洞里·北山营地的军帐：粗糙的岩壁，一张木板桌，桌上一盏灯和几张纸，墙边叠着毯子，洞口在深处是一道暗蓝色的拱；灯黄和岩石，不画人', 22201);
  const R = rng(22202);
  S.add(`<rect width="${W}" height="${H}" fill="#120e0c"/>`);
  // the cave mouth: a dark-blue arch far back, with a few stars
  S.add(`<path d="M640,520Q640,250 800,230Q960,250 960,520Z" fill="${S.lin([[0, '#0e1630'], [1, '#1c2440']])}"/>`);
  { let st = ''; for (let k = 0; k < 14; k++) st += ell(R.range(670, 930), R.range(270, 440), 1.2, 1.2); S.add(`<path d="${st}" fill="#e8ecff" opacity=".8"/>`); }
  // rock walls: layered lumpy masses closing in from the sides and the ceiling
  function rockMass(pts, c) { S.add(`<path d="M${pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L')}Z" fill="${c}"/>`); }
  rockMass([[0, 0], [W, 0], [W, 160], [1300, 240], [1080, 200], [900, 150], [700, 150], [500, 210], [300, 240], [0, 180]], '#2a221e');
  rockMass([[0, 0], [0, H], [420, H], [520, 700], [560, 520], [620, 380], [560, 260], [400, 200], [200, 160]], '#3a2e28');
  rockMass([[W, 0], [W, H], [1180, H], [1080, 700], [1040, 520], [980, 380], [1040, 260], [1200, 200], [1400, 160]], '#342a24');
  rockMass([[0, 260], [0, H], [260, H], [330, 620], [300, 420]], '#4a3c32');
  rockMass([[W, 300], [W, H], [1340, H], [1280, 640], [1320, 440]], '#44362e');
  // the floor
  S.add(`<path d="M0,${H}L420,700Q800,620 1180,700L${W},${H}Z" fill="${S.lin([[0, '#3a2e26'], [1, '#2a201a']])}"/>`);
  // blankets folded along the right wall
  for (const [x, y, w] of [[1180, 720, 200], [1210, 690, 170], [1160, 760, 240]]) S.add(`<path d="M${x},${y}h${w}q14,10 0,22h${-w}q-14,-10 0,-22z" fill="${['#6a5a7a', '#5a6a7a', '#7a6a5a'][Math.round(x) % 3]}"/>`);
  // the plank table and the lamp, centre-left foreground
  S.add(`<path d="M420,640h520l40,-60h-520z" fill="#7a5a3a"/><path d="M420,640h520v18h-520z" fill="#4a3424"/><path d="M450,658v120h20v-120zM900,658v120h20v-120z" fill="#3a2a1e"/>`);
  S.add(`<path d="M560,612l140,0l12,-24l-140,0z" fill="#efe4cc"/><path d="M720,606l100,4l10,-20l-100,-4z" fill="#e6dac0"/>`);
  S.add(`<ellipse cx="860" cy="560" rx="520" ry="360" fill="${S.rad([[0, '#ffcf80', 0.5], [0.5, '#e09040', 0.16], [1, '#e09040', 0]])}"/>`);
  S.add(`<path d="M842,600h36l-6,-12h-24z" fill="#8a6a3a"/><path d="M850,588q-4,-34 10,-48q14,14 10,48z" fill="#f8e4b8" opacity=".6"/><path d="M860,572q-6,-12 0,-24q6,12 0,24z" fill="#fff4d0"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', 0.2], [1, '#000', 0.7]], 'cx="0.52" cy="0.6" r="0.75"')}"/>`);
  return S.out();
}

export const northHillBgs = {
  'north-slope-camp-night': () => campNight(),
  'north-hill-cave': () => cave(),
};
