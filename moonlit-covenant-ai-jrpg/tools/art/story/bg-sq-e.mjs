// 成长支线的场景背景：frostbell-camp-day（霜铃城外·营地·白天）。
//   frostbell-camp-day — the camp outside Frostbell by day (the daytime twin of bg-frostbell.mjs frostbell-camp-night):
//                        a snowfield under a pale winter sky, the frosted city wall and towers far off, rows of tents with
//                        snow on their roofs, thin smoke from a cook fire, and in the foreground one tent with its flap let
//                        down and a blank wooden board hanging from a post at the door. No text, no figures.
import { Scene, W, H, f, pz, pl, rng } from './lib.mjs';

const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;

// a ridge tent: front triangle, side roof, snow cap; flap: 'open' | 'down'
function tent(S, x, y, w, h, { depth = 0.5, side = 1, cloth = '#8a7a64', shade = '#6a5c4a', flap = 'open' } = {}) {
  const apex = [x + w / 2, y - h], dx = side * w * depth, dy = -h * 0.12;
  // side roof (receding)
  S.add(`<path d="${pz([apex, [apex[0] + dx, apex[1] + dy], [x + (side > 0 ? w : 0) + dx, y + dy], [x + (side > 0 ? w : 0), y]])}" fill="${shade}"/>`);
  // front
  S.add(`<path d="${pz([[x, y], apex, [x + w, y]])}" fill="${cloth}"/>`);
  // door
  const dw = w * 0.32, dh = h * 0.62, cx = x + w / 2;
  if (flap === 'open') {
    S.add(`<path d="${pz([[cx - dw / 2, y], [cx, y - dh], [cx + dw / 2, y]])}" fill="#2a2620"/>`);
    S.add(`<path d="${pz([[cx - dw / 2, y], [cx, y - dh], [cx - dw * 0.62, y]])}" fill="${shade}" opacity=".9"/>`);
  } else {
    // flap let down: a closed seam with toggles
    S.add(`<path d="M${f1(cx)},${f1(y - dh)}V${f1(y)}" stroke="${shade}" stroke-width="3"/>`);
    let tg = '';
    for (let k = 1; k < 4; k++) tg += ell(cx, y - dh * (k / 4), 4, 3);
    S.add(`<path d="${tg}" fill="#3a2e22"/>`);
  }
  // snow along the ridge and on the side roof
  S.add(`<path d="${pl([[x + w * 0.12, y - h * 0.76], apex, [x + w * 0.88, y - h * 0.76]])}" fill="none" stroke="#f4f8fc" stroke-width="${f1(Math.max(6, w * 0.05))}" stroke-linejoin="round" opacity=".95"/>`);
  S.add(`<path d="${pz([apex, [apex[0] + dx, apex[1] + dy], [apex[0] + dx * 0.97, apex[1] + dy + h * 0.09], [apex[0] + side * w * 0.04, apex[1] + h * 0.1]])}" fill="#eef4f9" opacity=".92"/>`);
  S.add(`<path d="${pl([[apex[0] + dx, apex[1] + dy], [x + (side > 0 ? w : 0) + dx, y + dy]])}" stroke="${cloth}" stroke-width="2" opacity=".5"/>`);
  // snow drift at the foot
  S.add(`<path d="M${f1(x - w * 0.08)},${f1(y + 4)}Q${f1(x + w / 2)},${f1(y - 14)} ${f1(x + w * 1.08 + Math.max(0, dx))},${f1(y + 4)}Z" fill="#f2f6fa"/>`);
}

function campDay() {
  const S = new Scene('sbSqeCamp', '霜铃城外的营地·白天：淡色的冬日天空，远处结霜的城墙与尖塔，雪地上一排排压着雪的帐篷，伙房升起细烟；近处一顶帐篷的门帘放下了，门口木桩上挂着一块没有字的木牌；不画人', 26901);
  const R = rng(26902);
  // sky
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#b4c4d8'], [0.45, '#d6e0ea'], [0.62, '#e8eef4'], [1, '#f2f5f8']])}"/>`);
  S.add(`<ellipse cx="1180" cy="150" rx="260" ry="160" fill="${S.rad([[0, '#fffaf0', 0.75], [1, '#fffaf0', 0]])}"/>`);
  S.add(`<path d="${ell(1180, 150, 34, 34)}" fill="#fffdf6" opacity=".9"/>`);
  // far hills
  S.add(`<path d="${pz([[0, 430], [180, 380], [380, 410], [560, 360], [760, 400], [980, 350], [1220, 395], [1420, 360], [W, 400], [W, 470], [0, 470]])}" fill="#c4d0de"/>`);
  // the city on its rise: frosted wall and towers
  S.add(`<path d="M300,470V402H1240V470Z" fill="#a8b4c4"/>`);
  { let m = ''; for (let x = 300; x < 1240; x += 34) m += `M${x},402v-14h20v14`; S.add(`<path d="${m}" fill="#a8b4c4"/>`); }
  let tw = '';
  for (const [x, w, h] of [[360, 34, 90], [470, 28, 70], [600, 44, 150], [700, 30, 96], [820, 52, 190], [940, 34, 120], [1050, 40, 140], [1170, 30, 80]]) tw += `M${x},402V${402 - h}l${w / 2},-34l${w / 2},34V402Z`;
  S.add(`<path d="${tw}" fill="#98a6b8"/>`);
  // frost glaze on the wall top and tower caps
  S.add(`<path d="M300,402H1240" stroke="#f2f8fd" stroke-width="5" opacity=".9"/>`);
  // the gate and a few arrow slits
  S.add(`<path d="M738,470V438q32,-30 64,0V470Z" fill="#7a8698"/><path d="M738,438q32,-30 64,0" fill="none" stroke="#eef4fa" stroke-width="3"/>`);
  { let sl = ''; for (const x of [380, 470, 560, 650, 890, 980, 1070, 1160]) sl += `M${x},420h4v14h-4z`; S.add(`<path d="${sl}" fill="#8592a4"/>`); }
  let caps = '';
  for (const [x, w, h] of [[360, 34, 90], [470, 28, 70], [600, 44, 150], [700, 30, 96], [820, 52, 190], [940, 34, 120], [1050, 40, 140], [1170, 30, 80]]) caps += `M${x - 2},${402 - h}l${w / 2 + 2},-36l${w / 2 + 2},36l-6,0l-${w / 2 - 4},-26l-${w / 2 - 4},26Z`;
  S.add(`<path d="${caps}" fill="#f4f9fd" opacity=".9"/>`);
  // a haze between the city and the camp
  S.add(`<rect x="0" y="400" width="${W}" height="110" fill="${S.lin([[0, '#eef3f8', 0], [0.6, '#eef3f8', 0.75], [1, '#eef3f8', 0.2]])}"/>`);
  // the snowfield
  S.add(`<path d="M0,480Q400,462 800,476T${W},470V${H}H0Z" fill="${S.lin([[0, '#e6edf4'], [0.5, '#f0f4f8'], [1, '#e2e9f0']])}"/>`);
  // snow shading bands
  S.add(`<path d="M0,640Q360,610 720,650T1600,630V660Q1200,690 800,676T0,668Z" fill="#d6e0ea" opacity=".55"/>`);
  S.add(`<path d="M0,800Q500,770 960,806T1600,790V820Q1100,840 600,826T0,830Z" fill="#d2dce8" opacity=".5"/>`);
  // far row of tents
  for (const [x, w, h, s] of [[90, 90, 60, 1], [220, 80, 54, -1], [380, 96, 62, 1], [1020, 84, 56, -1], [1160, 92, 60, 1], [1320, 80, 52, -1], [1450, 96, 62, 1]]) {
    tent(S, x, 520, w, h, { depth: 0.35, side: s, cloth: '#9a8e7c', shade: '#7e7262' });
  }
  // cook fire smoke behind the middle row
  {
    let st = '';
    for (let k = 0; k < 8; k++) st += ell(560 + k * 9 + Math.sin(k) * 10, 520 - k * 34, 14 + k * 5, 10 + k * 4);
    S.add(`<path d="${st}" fill="#ffffff" opacity=".6" filter="${S.blur(3)}"/>`);
    S.add(`<path d="${ell(536, 586, 9, 6)}${ell(556, 590, 10, 6)}${ell(578, 589, 9, 6)}${ell(596, 585, 8, 5)}" fill="#6a6a70"/>`);
    S.add(`<path d="M546,584q6,-26 12,-40q4,18 10,10q6,16 4,30z" fill="#e8963a"/><path d="M556,584q3,-14 6,-22q4,12 6,22z" fill="#ffd27a"/>`);
  }
  // middle row of tents
  tent(S, 160, 610, 180, 120, { side: 1, depth: 0.4 });
  tent(S, 420, 620, 150, 104, { side: -1, depth: 0.4, cloth: '#857664', shade: '#665a4a' });
  tent(S, 1240, 615, 170, 116, { side: 1, depth: 0.4, cloth: '#8e8068', shade: '#6e6250' });
  // a stack of crates and a barrel half-buried in snow (the cook tent's store)
  S.add(`<path d="M660,640h70v-52h-70zM736,640h60v-44h-60zM690,588h60v-40h-60z" fill="#8a6a44"/><path d="M660,614h70M736,618h60M690,568h60" stroke="#6a4e30" stroke-width="3"/>`);
  S.add(`<path d="M660,588h70v-8h-70zM736,596h60v-8h-60zM690,548h60v-8h-60z" fill="#f4f8fc"/>`);
  S.add(`<path d="M820,642v-58q26,-8 52,0v58z" fill="#7a5a3a"/><path d="M820,600q26,8 52,0M820,626q26,8 52,0" stroke="#5a4028" stroke-width="3" fill="none"/><path d="M816,646q30,-22 62,0z" fill="#f2f6fa"/>`);
  // trampled path through the camp
  S.add(`<path d="M640,${H}Q720,790 780,720T860,650" fill="none" stroke="#d0dae6" stroke-width="64" stroke-linecap="round" opacity=".6"/>`);
  { let fp = ''; for (let k = 0; k < 14; k++) { const t = k / 13, x = 650 + t * 200 + (k % 2 ? 12 : -12), y = 880 - t * 230; fp += ell(x, y, 7 - t * 3, 3.6 - t * 1.6); } S.add(`<path d="${fp}" fill="#b8c6d6" opacity=".8"/>`); }
  // pines at the edges
  const pineAt = (x, y, h) => {
    let d = '';
    for (let k = 0; k < 4; k++) { const ty = y - h + k * h * 0.22, hw = h * (0.14 + k * 0.07); d += `M${f1(x)},${f1(ty)}L${f1(x + hw)},${f1(ty + h * 0.3)}L${f1(x - hw)},${f1(ty + h * 0.3)}Z`; }
    S.add(`<path d="${d}" fill="#4a5e5a"/><path d="M${f1(x - 6)},${f1(y)}h12v-${f1(h * 0.12)}h-12z" fill="#4a3a2a"/>`);
    let sn = '';
    for (let k = 0; k < 4; k++) { const ty = y - h + k * h * 0.22, hw = h * (0.14 + k * 0.07); sn += `M${f1(x)},${f1(ty)}L${f1(x + hw * 0.7)},${f1(ty + h * 0.2)}L${f1(x - hw * 0.7)},${f1(ty + h * 0.2)}Z`; }
    S.add(`<path d="${sn}" fill="#f2f6fa" opacity=".85"/>`);
  };
  pineAt(40, 640, 230); pineAt(1560, 650, 250); pineAt(1500, 600, 150);

  // ── the foreground tent with its flap let down, and the blank board on its post ──
  tent(S, 860, 800, 400, 300, { side: 1, depth: 0.42, cloth: '#a8987e', shade: '#86775f', flap: 'down' });
  // guy ropes and pegs
  S.add(`<path d="M860,800L790,860M1260,800L1340,850M1060,500L1400,830" stroke="#5a4a38" stroke-width="2.5" opacity=".7"/><path d="M786,858l8,12M1336,848l8,12M1396,828l8,12" stroke="#4a3a2a" stroke-width="5"/>`);
  // the post
  S.add(`<path d="M790,${H}V600h22V${H}Z" fill="#6a4e32"/><path d="M790,600h22v-10h-22z" fill="#f4f8fc"/><path d="M796,620v260" stroke="#82623e" stroke-width="3"/>`);
  // the blank wooden board hanging from the post on two cords
  S.add(`<path d="M812,640L760,668M812,640L860,668" stroke="#3a2e22" stroke-width="2.5" fill="none"/>`);
  S.add(`<path d="M730,668h160v96h-160z" fill="${S.lin([[0, '#c8a070'], [1, '#a8804e']])}" stroke="#6a4a2a" stroke-width="4"/>`);
  S.add(`<path d="M738,690q70,-6 144,2M738,722q60,6 144,-2M738,746q80,-4 144,2" stroke="#9a7444" stroke-width="2" fill="none" opacity=".6"/>`);
  S.add(`<path d="M730,668h160v6h-160z" fill="#f4f8fc" opacity=".9"/>`);
  // snow at the foot of the post and tent
  S.add(`<path d="M700,${H}Q800,868 900,880T1300,872Q1450,868 ${W},880V${H}Z" fill="#f4f7fa"/>`);
  // fine falling flakes
  { let fl = ''; for (let k = 0; k < 70; k++) { const x = R.range(0, W), y = R.range(0, 860), r = R.range(1, 2.6); fl += ell(x, y, r, r); } S.add(`<path d="${fl}" fill="#ffffff" opacity=".8"/>`); }
  // vignette
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.7, '#000', 0.05], [1, '#000', 0.28]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}

export const sqEBgs = {
  'frostbell-camp-day': () => campDay(),
};
