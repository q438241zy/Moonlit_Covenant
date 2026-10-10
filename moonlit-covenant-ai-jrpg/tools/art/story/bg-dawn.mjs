// The morning after: cave-dawn, hemai-sky-dawn, hemai-ruins-dawn, north-slope-camp.
import { Scene, W, H, f, pz, pl, shape, cloud, ridge, rays, stars, smoke, band, house, bellTower, skeleton, star7, rock, pine, tree, billows } from './lib.mjs';
import { village, VILLAGE_PAL } from './village.mjs';
import { caveView, farVillage, blackFire } from './bg-night.mjs';
import { dragon } from './dragon.mjs';

const r0 = (v) => f(v, 0);

// ---------------------------------------------------------------------------------------------
// 守羊洞·黎明前 — grey light before dawn; Hemai smouldering below; the lamp guttering
// ---------------------------------------------------------------------------------------------
function caveDawn() {
  const S = new Scene('sbCaveDawn', '守羊洞·黎明前：灰白天色下仍在冒烟的赫麦村', 3101);
  S.add(caveView(S, S.R, 'dawn'));
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 赫麦村上空·破晓 — the light-bolt has punched through the dragon's belly: it jack-knifes over the
// broken bell tower, a white trail still burning in the air; thunderheads wait in the south.
// ---------------------------------------------------------------------------------------------
function hemaiSkyDawn() {
  const S = new Scene('sbSkyDawn', '赫麦村上空·破晓：被光明弹贯穿的黑龙', 3202);
  const R = S.R;
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#3e3858'], [0.3, '#7a6a90'], [0.55, '#c4949a'], [0.68, '#e8b494'], [0.8, '#8a7488'], [1, '#2a2440']])}"/>`);
  // first light on the left horizon
  S.add(`<circle cx="160" cy="600" r="760" fill="${S.rad([[0, '#ffe2b0', 0.75], [0.25, '#ffc09a', 0.35], [0.6, '#d08a9a', 0.1], [1, '#d08a9a', 0]])}"/>`);
  S.add(stars(R, 30, [700, 0, W, 200], { maxR: 1.1, op: [0.15, 0.5] }));
  // southern thunderheads (right), lit pink on their left flanks
  const tc = { lit: '#a8849c', shade: '#4a3a5a', rim: '#ffd0c0' };
  S.add(cloud(R, 1180, 300, 480, 170, tc, { bumps: 6 }) + cloud(R, 1320, 400, 360, 120, { lit: '#7a6080', shade: '#3a2c48', rim: '#f0b0b0' }, { bumps: 5 }));
  S.add(`<path d="M1300,330l-26,60l20,-4l-30,70" fill="none" stroke="#f4e6ff" stroke-width="3" opacity=".7"/>`);
  const cc = { lit: '#f0c4b0', shade: '#9a7a96', rim: '#fff0e0' };
  S.add(`<g opacity=".85">${cloud(R, 120, 230, 300, 50, cc, { bumps: 5 })}${cloud(R, 520, 150, 220, 36, cc, { bumps: 5 })}</g>`);
  S.add(`<path d="${band(-40, 900, 380, 14, R)}" fill="#ffd8b8" opacity=".5"/>`);
  // the white trail of the light-bolt, still burning in the air (from the north slope, lower left)
  S.add(`<path d="M60,840L842,454" stroke="#fff6e0" stroke-width="26" opacity=".25" filter="${S.blur(2)}"/><path d="M60,840L842,454" stroke="#ffd98a" stroke-width="11" opacity=".45"/><path d="M60,840L842,454" stroke="#fffaf0" stroke-width="5" stroke-linecap="round"/>`);
  // far hills + the ruined village below (smoke grey now that the black fire has weakened)
  S.add(ridge(S, { step: 16, base: 640, amp: 28, period: 260, seed: 321, fill: '#5a4e6a', shade: '#463c58', shadeOp: 0.5, rim: '#ffd8c0', rimOp: 0.5, peaks: [[300, 40, 260], [1300, 50, 300]] }).svg);
  const V = village(S, 860, 760, 0.78, 'ruins', { seed: 93 });
  S.add(`<path d="M-20,700C400,680,1200,680,1640,700V900H-20Z" fill="#3a3248"/>`);
  S.add(V.svg);
  let sm = '';
  for (let i = 0; i < 7; i++) sm += smoke(R, 560 + i * 90 + R.range(-30, 30), 740, R.range(200, 340), 40, 160, 3300 + i);
  S.add(`<path d="${sm}" fill="#7a7088" opacity=".45" filter="${S.blur(3)}"/>`);
  // the dragon, struck: body folded, wound flaring, ash spilling from the hole
  S.add(dragon(S, { x: 930, y: 380, s: 0.74, rot: -8, pose: 'recoil', seed: 31, rimCol: '#ffe0d0', rimOp: 0.8, glow: 0.7, wound: true, smokeCol: '#2a2234', smokeOp: 0.5, smokeDir: 30 }));
  let ash = '';
  for (let i = 0; i < 40; i++) ash += `<circle cx="${r0(R.range(860, 1100))}" cy="${r0(R.range(380, 700))}" r="${f(R.range(1, 3))}"/>`;
  S.add(`<g fill="#2a2430" opacity=".7">${ash}</g>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.5, '#1a1428', 0], [1, '#1a1428', 0.55]], 'cx="0.5" cy="0.4" r="0.75"')}"/>`);
  S.add(`<rect y="620" width="${W}" height="280" fill="${S.lin([[0, '#140f20', 0], [1, '#140f20', 0.65]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 赫麦村废墟·黎明 — grey-white skeletons of houses, the bell-tower stump, the morning-star statue
// fallen in the plaza; thin smoke, cold dawn light.
// ---------------------------------------------------------------------------------------------
// a burnt-out cottage: jagged wall chunks (ash-white plaster, charred crowns), empty openings, a lone
// stone chimney, fallen roof beams, a long morning shadow to the right
function ruinHouse(R, x, y, w, h, pal) {
  const out = [];
  const jag = (x0, x1, top) => { const pts = [[x0, y]]; const n = 6; for (let i = 0; i <= n; i++) pts.push([x0 + (x1 - x0) * i / n, y - top * R.range(0.35, 1)]); pts.push([x1, y]); return pts; };
  out.push(`<path d="${pz([[x, y], [x + w * 1.9, y + h * 0.12], [x + w * 1.6, y + h * 0.3], [x + w * 0.2, y + h * 0.2]])}" fill="#1a1820" opacity=".3"/>`);
  const front = jag(x, x + w, h), side = [[x + w, y], [x + w, y - h * 0.6], [x + w * 1.35, y - h * 0.75], [x + w * 1.35, y - h * 0.15]];
  out.push(`<path d="${pz(side)}" fill="${pal.shade}"/>`);
  out.push(`<path d="${pz(front)}" fill="${pal.lit}"/>`);
  // charred crown along the broken top
  const crown = front.slice(1, -1);
  out.push(`<path d="${pl(crown)}" fill="none" stroke="#2a2630" stroke-width="${f(h * 0.12)}" stroke-linejoin="round" opacity=".8"/>`);
  out.push(`<path d="${pl(crown.slice(0, 4))}" fill="none" stroke="#fff0e0" stroke-width="2" opacity=".55" transform="translate(-2 -3)"/>`);
  // openings
  out.push(`<path d="M${r0(x + w * 0.15)},${r0(y - h * 0.5)}h${r0(w * 0.18)}v${r0(h * 0.22)}h${r0(-w * 0.18)}zM${r0(x + w * 0.45)},${r0(y)}v${r0(-h * 0.5)}h${r0(w * 0.2)}v${r0(h * 0.5)}zM${r0(x + w * 0.75)},${r0(y - h * 0.5)}h${r0(w * 0.14)}v${r0(h * 0.2)}h${r0(-w * 0.14)}z" fill="#2a2630"/>`);
  // lone chimney + fallen beams
  if (R() < 0.7) { const cx = x + w * R.range(0.1, 0.8); out.push(`<path d="M${r0(cx)},${r0(y)}V${r0(y - h * 1.5)}h${r0(w * 0.13)}V${r0(y)}z" fill="${pal.mid}"/><path d="M${r0(cx + w * 0.13)},${r0(y)}V${r0(y - h * 1.5)}h${r0(w * 0.05)}V${r0(y)}z" fill="${pal.shade}"/><path d="M${r0(cx)},${r0(y - h * 1.5)}h${r0(w * 0.18)}" stroke="#2a2630" stroke-width="5"/>`); }
  out.push(`<path d="M${r0(x - w * 0.1)},${r0(y - h * 0.2)}L${r0(x + w * 0.6)},${r0(y - h * 1.1)}M${r0(x + w * 0.4)},${r0(y)}L${r0(x + w * 1.1)},${r0(y - h * 0.7)}" stroke="#1e1a22" stroke-width="${f(Math.max(4, w * 0.05))}" stroke-linecap="round"/>`);
  return out.join('');
}

// ---------------------------------------------------------------------------------------------
// 赫麦村废墟·黎明 — grey-white shells of houses, lone chimneys, the bell-tower stump with its bell in
// the rubble, the morning-star statue fallen in the plaza; thin smoke, cold dawn light.
// ---------------------------------------------------------------------------------------------
function hemaiRuins() {
  const S = new Scene('sbRuins', '赫麦村废墟·黎明：灰白的房屋残骸与倒下的七角晨星', 3303);
  const R = S.R;
  const GY = 600;
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#5e6280'], [0.35, '#9a96a6'], [0.55, '#d4bfb0'], [0.68, '#9a9098'], [1, '#2a2632']])}"/>`);
  S.add(`<circle cx="200" cy="500" r="680" fill="${S.rad([[0, '#fff0d8', 0.65], [0.3, '#f4d0b0', 0.25], [1, '#f4d0b0', 0]])}"/><circle cx="200" cy="470" r="30" fill="#fff8ec" opacity=".9"/>`);
  S.add(`<path d="${band(-40, 1100, 250, 16, R)}" fill="#c8bcc4" opacity=".6"/><path d="${band(500, 1640, 190, 12, R)}" fill="#a8a0b4" opacity=".55"/>`);
  // the north slope beyond, the refugee camp a scatter of pale tents on it
  S.add(ridge(S, { step: 16, base: 430, amp: 40, period: 280, seed: 331, fill: '#726c82', shade: '#5e5872', shadeOp: 0.5, rim: '#f4e4d8', rimOp: 0.6, peaks: [[1200, 80, 360], [500, 50, 280]] }).svg);
  let tents = '';
  for (let i = 0; i < 12; i++) { const x = 1040 + i * 26 + R.range(-8, 8), y = 412 + R.range(-6, 10); tents += `M${r0(x - 7)},${r0(y)}l7,-9l7,9z`; }
  S.add(`<path d="${tents}" fill="#e0d4c8"/>`);
  S.add(`<path d="M-20,470C400,456,1200,452,1640,466V900H-20Z" fill="${S.lin([[0, '#7a7282'], [0.3, '#56505e'], [1, '#2a2630']])}"/>`);
  // smoke still threading up from the ruins
  let sm = '';
  for (const [x, h] of [[300, 380], [640, 440], [1000, 400], [1320, 340], [820, 320]]) sm += smoke(R, x, GY - 60, h, 50, 130, 3400 + x);
  S.add(`<path d="${sm}" fill="#a8a2b0" opacity=".5" filter="${S.blur(3)}"/>`);
  const ash = { lit: '#cfc4ba', mid: '#a49aa0', shade: '#5e5866' };
  // back row of shells
  for (const [x, w, h] of [[10, 110, 60], [170, 96, 54], [1150, 100, 58], [1300, 120, 64], [1470, 100, 56]]) S.add(ruinHouse(R, x, 520, w, h, { lit: '#a49aa2', mid: '#8a8290', shade: '#4e4a58' }));
  // the prayer hall shell, the bell-tower stump, the rubble cone with the fallen bell
  S.add(`<path d="M500,${GY}V420L540,380L580,430L640,330L690,396L750,360L790,440V${GY}Z" fill="${ash.lit}"/><path d="M790,${GY}V440L850,416V${GY}Z" fill="${ash.shade}"/>`);
  S.add(`<path d="M540,380L580,430L640,330L690,396L750,360" fill="none" stroke="#2a2630" stroke-width="12" stroke-linejoin="round" opacity=".75"/><path d="M500,420L540,380L580,430L640,330" fill="none" stroke="#fff4e6" stroke-width="2.5" opacity=".7" transform="translate(-2 -3)"/>`);
  S.add(`<path d="M590,${GY}V500A44,44 0 0 1 678,500V${GY}Z" fill="#2e2a34"/><circle cx="645" cy="428" r="22" fill="#2e2a34"/>`);
  S.add(`<path d="M520,470L760,380M560,${GY}L700,400" stroke="#1e1a22" stroke-width="9" stroke-linecap="round"/>`);
  S.add(`<path d="M890,${GY}V320L912,292L940,316L962,284L984,318V${GY}Z" fill="${ash.lit}"/><path d="M984,${GY}V318L1020,302V${GY - 16}Z" fill="${ash.shade}"/><path d="M890,320L912,292L940,316L962,284L984,318" fill="none" stroke="#2a2630" stroke-width="10" stroke-linejoin="round" opacity=".7"/>`);
  S.add(`<path d="M830,${GY}C870,556,950,534,1020,552C1070,570,1090,590,1110,${GY}Z" fill="#6a6270"/><path d="M870,566C910,548,960,540,1010,552" fill="none" stroke="#e8dcd0" stroke-width="2" opacity=".5"/>`);
  S.add(`<g transform="rotate(-28 1000 566)"><path d="M970,580Q972,540 1000,536Q1028,540 1030,580Z" fill="#6a5a50"/><path d="M970,580Q972,540 1000,536Q988,546 984,580Z" fill="#9a8a7a"/><ellipse cx="1000" cy="582" rx="32" ry="7" fill="#3a3238"/></g>`);
  // the seven-pointed morning-star statue, snapped off its pedestal, lying in the plaza
  S.add(`<path d="M320,${GY}L330,548H380L390,${GY}Z" fill="${ash.mid}"/><path d="M356,${GY}L360,548H380L390,${GY}Z" fill="${ash.shade}"/><path d="M332,548l12,-10l10,8l14,-12l12,14" fill="none" stroke="#4a4450" stroke-width="3"/>`);
  S.add(`<g transform="rotate(64 450 596)"><circle cx="450" cy="596" r="46" fill="none" stroke="#bcb0a6" stroke-width="7"/><path d="${star7(450, 596, 42)}" fill="#d0c4b8"/><path d="${star7(450, 596, 42)}" fill="none" stroke="#5e5866" stroke-width="2.5"/></g>`);
  S.add(`<ellipse cx="470" cy="${GY + 6}" rx="70" ry="10" fill="#1a1820" opacity=".35"/>`);
  // front row: burnt-out cottages on both sides
  S.add(ruinHouse(R, -40, GY + 10, 230, 170, ash));
  S.add(ruinHouse(R, 1230, GY + 14, 230, 180, ash));
  S.add(ruinHouse(R, 1470, GY + 6, 180, 140, ash));
  // the ground: ash, rubble, a puddle holding the pale sky, blackened beams
  S.add(`<path d="M-20,${GY + 10}H1620V900H-20Z" fill="${S.lin([[0, '#5e5864'], [0.35, '#3a3440'], [1, '#141218']])}"/>`);
  S.add(`<ellipse cx="760" cy="680" rx="140" ry="14" fill="#b8b0c0" opacity=".45"/>`);
  let rub = '';
  for (let i = 0; i < 46; i++) { const x = R.range(-20, 1620), y = R.range(GY + 14, 780), w = R.range(10, 44) * (y / 640); rub += `M${r0(x)},${r0(y)}l${r0(w * 0.4)},${r0(-w * 0.3)}l${r0(w * 0.6)},${r0(w * 0.2)}z`; }
  S.add(`<path d="${rub}" fill="#4a4450"/>`);
  S.add(`<path d="M140,720L430,676M980,700L1250,734M560,760L740,748" stroke="#1a161e" stroke-width="13" stroke-linecap="round"/>`);
  S.add(`<path d="M0,${GY + 10}L1600,${GY - 10}L1600,${GY + 50}L0,${GY + 80}Z" fill="#fff0d8" opacity=".12" filter="${S.blur(2)}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.5, '#14121a', 0], [1, '#14121a', 0.5]], 'cx="0.45" cy="0.42" r="0.78"')}"/>`);
  S.add(`<rect y="620" width="${W}" height="280" fill="${S.lin([[0, '#14121a', 0], [1, '#14121a', 0.65]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 北山缓坡·灾民营地 — makeshift tents on the gentle north slope; small honest cooking fires;
// a fallen boundary stone; Hemai's ruins smoking in the valley below; morning over the mountain.
// ---------------------------------------------------------------------------------------------
function northSlopeCamp() {
  const S = new Scene('sbCamp', '北山缓坡·灾民营地：临时帐篷、篝火与倒下的界碑', 3404);
  const R = S.R;
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#7a8094'], [0.3, '#b0aeb0'], [0.48, '#e2d0b8'], [0.6, '#a8a49c'], [1, '#2e2e34']])}"/>`);
  // the sun just over the north mountain (upper left)
  S.add(`<circle cx="300" cy="290" r="620" fill="${S.rad([[0, '#fff2d0', 0.8], [0.15, '#ffe0b0', 0.45], [0.5, '#f0c8a0', 0.12], [1, '#f0c8a0', 0]])}"/><circle cx="300" cy="300" r="40" fill="#fffaf0"/>`);
  S.add(`<g filter="${S.blur(3)}">${rays(300, 300, [[20, 5, 1400], [34, 4, 1400], [48, 6, 1300], [8, 3, 1400]], '#fff0d0', 0.18)}</g>`);
  const cc = { lit: '#f4e4d0', shade: '#a8a0a8', rim: '#ffffff' };
  S.add(`<g opacity=".8">${cloud(R, 700, 200, 360, 60, cc, { bumps: 6 })}${cloud(R, 1200, 160, 300, 50, cc, { bumps: 5 })}</g>`);
  S.add(`<path d="${band(900, 1640, 260, 14, R)}" fill="#8a8a98" opacity=".5"/>`);
  // the mountain behind the sun + the far valley with Hemai's ruins smoking
  S.add(ridge(S, { step: 16, base: 330, amp: 40, period: 300, seed: 441, fill: '#8a8898', shade: '#706e82', shadeOp: 0.5, rim: '#fff0d8', rimOp: 0.7, peaks: [[220, 60, 300], [1500, 40, 260]], bottom: 520 }).svg);
  S.add(`<path d="M600,500C800,480,1200,476,1640,486V700H600Z" fill="#7a7480"/>`);
  S.add(village(S, 1200, 540, 0.34, 'ruins', { seed: 94 }).svg);
  let sm = '';
  for (let i = 0; i < 5; i++) sm += smoke(R, 1080 + i * 60, 536, R.range(140, 240), 22, 100, 3500 + i);
  S.add(`<path d="${sm}" fill="#8a8494" opacity=".5" filter="${S.blur(2)}"/>`);
  // the gentle slope of the camp
  S.add(`<path d="M-20,470C300,480,560,500,800,540C1000,574,1300,600,1640,640V900H-20Z" fill="${S.lin([[0, '#8e8c72'], [0.4, '#6a6a58'], [1, '#2a2a26']])}"/>`);
  S.add(`<path d="M-20,470C300,480,560,500,800,540C1000,574,1300,600,1640,640" fill="none" stroke="#fff0d0" stroke-width="2.5" opacity=".5"/>`);
  for (const [x, y, h] of [[60, 478, 120], [120, 484, 90], [1560, 640, 100], [1500, 636, 70]]) S.add(pine(x, y, h, '#3a3e36'));
  // tents: cloth thrown over poles and ropes, each with its lit and shaded panel
  const tent = (x, y, w, h, c, cs) => `<path d="M${x - w / 2},${y}L${x},${y - h}L${x + w * 0.1},${y}Z" fill="${c}"/><path d="M${x},${y - h}L${x + w / 2},${y}L${x + w * 0.1},${y}Z" fill="${cs}"/><path d="M${x},${y - h - 8}V${y}" stroke="#3a3228" stroke-width="3"/><path d="M${x - w / 2},${y}L${x - w * 0.75},${y + 6}M${x + w / 2},${y}L${x + w * 0.75},${y + 6}" stroke="#5a5040" stroke-width="1.5"/>`;
  for (const [x, y, w, h, c, cs] of [[260, 520, 110, 70, '#d8ccb4', '#968a7a'], [420, 532, 90, 58, '#c8bca8', '#8a7e70'], [560, 548, 120, 76, '#e0d4c0', '#9e9282'], [760, 572, 100, 64, '#cfc2ae', '#8e8274'], [930, 592, 130, 80, '#d8cab4', '#968878'], [1120, 616, 96, 60, '#c4b8a4', '#867a6c']]) S.add(tent(x, y, w, h, c, cs));
  // a cloth awning strung between poles
  S.add(`<path d="M640,600L840,590L830,620L650,628Z" fill="#b8ac98"/><path d="M640,600V660M840,590V650" stroke="#3a3228" stroke-width="4"/>`);
  // small cooking fires with thin smoke — ordinary warm fire again
  for (const [x, y] of [[350, 580], [700, 640], [1020, 660]]) {
    S.add(`<circle cx="${x}" cy="${y - 6}" r="60" fill="${S.rad([[0, '#ffb060', 0.5], [1, '#ffb060', 0]])}"/><path d="M${x - 10},${y}q2,-16 10,-24q6,10 10,24z" fill="#ff9a3a"/><path d="M${x - 4},${y}q2,-8 4,-12q3,6 4,12z" fill="#ffe08a"/><path d="M${x - 16},${y + 2}l32,-4M${x - 14},${y - 2}l30,6" stroke="#3a2a20" stroke-width="4"/>`);
    S.add(`<path d="${smoke(R, x + 4, y - 26, 120, 10, 40, x)}" fill="#c8c0c0" opacity=".4" filter="${S.blur(1)}"/>`);
  }
  // tiny distant figures moving between the tents (no faces, just people)
  let ppl = '';
  for (const [x, y, s] of [[480, 560, 1], [620, 586, 1.1], [880, 612, 1.1], [1060, 636, 1.2], [300, 548, 0.9], [990, 640, 1.15]]) ppl += `M${x - 5 * s},${y}l${r0(2 * s)},${r0(-18 * s)}h${r0(6 * s)}l${r0(2 * s)},${r0(18 * s)}zM${x + 3 * s},${y - 23 * s}a${f(4 * s)},${f(4 * s)} 0 1 0 0.1,0z`;
  S.add(`<path d="${ppl}" fill="#2e2a2a"/>`);
  // the fallen boundary stone in the foreground-left (where the village chief sits)
  S.add(`<g transform="rotate(-62 250 690)"><path d="M190,700V560Q190,520 250,516Q310,520 310,560V700Z" fill="#8a8478"/><path d="M190,700V560Q190,520 250,516Q262,517 272,520Q216,528 214,566V700Z" fill="#c4bcac"/><path d="M290,700V566Q290,540 300,548Q310,556 310,566V700Z" fill="#5e5a52"/><path d="M226,580h48M232,604h36M236,628h28" stroke="#6a665c" stroke-width="4" opacity=".7"/></g><ellipse cx="300" cy="704" rx="150" ry="16" fill="#26241e" opacity=".35"/>`);
  // foreground grass (calm)
  let g = '';
  for (let i = 0; i < 90; i++) { const x = R.range(-20, 1620), y = R.range(700, 920), h = R.range(10, 26); g += `M${r0(x - 4)},${r0(y)}q2,${r0(-h * 0.6)} ${r0(R.range(-6, 6))},${r0(-h)}q2,${r0(h * 0.5)} 5,${r0(h)}z`; }
  S.add(`<path d="${g}" fill="#262620" opacity=".55"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.5, '#16161a', 0], [1, '#16161a', 0.5]], 'cx="0.45" cy="0.42" r="0.78"')}"/>`);
  S.add(`<rect y="620" width="${W}" height="280" fill="${S.lin([[0, '#16161a', 0], [1, '#16161a', 0.6]])}"/>`);
  return S.out();
}

export const dawnBgs = {
  'cave-dawn': caveDawn,
  'hemai-sky-dawn': hemaiSkyDawn,
  'hemai-ruins-dawn': hemaiRuins,
  'north-slope-camp': northSlopeCamp,
};
