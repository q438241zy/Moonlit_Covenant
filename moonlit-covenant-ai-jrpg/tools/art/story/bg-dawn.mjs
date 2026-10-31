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
// 赫麦村废墟·黎明 — the shells of the village built from the same house / skeleton / bell-tower parts as
// the living village: walls still standing with their roofs burnt away to charred rafters, bitten gables,
// soot climbing from every opening, fallen roof wrecks, the bell-tower stump with its bell in the rubble,
// the morning-star statue fallen in the plaza, a few low black flames still clinging to the beams.
// ---------------------------------------------------------------------------------------------
const RUIN_PAL = {
  near: { lit: '#cfc4ba', mid: '#a49aa0', shade: '#5e5866', roof: '#4a4450', roofShade: '#24202a', trim: '#1e1b22', win: '#1e1b22', chimney: '#8a8290' },
  far: { lit: '#a49aa2', mid: '#8a8290', shade: '#4e4a58', roof: '#5a5462', roofShade: '#2e2a36', trim: '#2a2630', win: '#2a2630', chimney: '#7a7282' },
  stone: { lit: '#d6ccc2', mid: '#aca2a6', shade: '#625c6c', roof: '#4a4658', roofShade: '#2a2632', trim: '#2a2632', win: '#26222c', hole: '#1a1820', bell: '#6a6064' },
};
const CHAR = '#1e1a22';

// the gable triangle above a front wall, bitten down by the fire: jagged top polyline from (x, top) to (x + w, top)
function bittenGable(R, x, top, w, roofH, keep = 0.6) {
  const pts = [[x, top]];
  const n = 8;
  for (let i = 1; i < n; i++) {
    const u = i / n, full = roofH * (1 - Math.abs(2 * u - 1));
    const bite = R() < 0.3 ? R.range(0.08, 0.3) : R.range(keep * 0.6, Math.min(1, keep * 1.3));
    pts.push([x + w * u + R.range(-w * 0.02, w * 0.02), top - full * bite]);
  }
  pts.push([x + w, top]);
  return pts;
}

// soot smears climbing from an opening (x, y = top-left of the opening, w = its width)
const soot = (x, y, w, h) => `M${r0(x - w * 0.08)},${r0(y + 1)}L${r0(x)},${r0(y - h * 0.45)}L${r0(x + w * 0.22)},${r0(y - h * 0.3)}L${r0(x + w * 0.4)},${r0(y - h)}L${r0(x + w * 0.58)},${r0(y - h * 0.4)}L${r0(x + w * 0.8)},${r0(y - h * 0.62)}L${r0(x + w * 1.06)},${r0(y + 1)}Z`;

// The standing walls of a burnt building: lib's house() clipped to its walls (the roof is gone), the side
// wall's top broken off unevenly, and the gable above the front wall bitten down with a charred crown.
function shell(S, R, x, y, w, h, pal, { side = 'r', d = w * 0.8, roofH = w * 0.5, keep = 0.6, windows = 1, door = true } = {}) {
  const k = side === 'r' ? 1 : -1, dx = d * k, dy = -d * 0.32, top = y - h;
  const near = side === 'r' ? x : x + w, far = side === 'r' ? x + w : x; // front-wall corners: outer, shared with the side wall
  const sideTop = [];
  for (let i = 0; i <= 5; i++) {
    const t = i / 5, drop = i && i < 5 && R() < 0.6 ? R.range(0.05, 0.3) * h : 0;
    sideTop.push([far + dx * t + (i === 0 ? 2 * k : 0), top + dy * t - 2 + drop * t]);
  }
  const clip = S.clip(pz([[near - 2 * k, y + 4], [near - 2 * k, top - 2], ...sideTop, [far + dx + 2 * k, y + dy + 4]]));
  const g = bittenGable(R, x, top, w, roofH, keep);
  const crown = g.slice(1, -1);
  return `<g clip-path="${clip}">${house(x, y, w, h, { side, d, roofH, pal, windows, door }).svg}</g>`
    + `<path d="${pl(sideTop.slice(1))}" fill="none" stroke="${CHAR}" stroke-width="${f(Math.max(3, w * 0.03))}" stroke-linejoin="round" opacity=".7"/>`
    + `<path d="${pz(g)}" fill="${side === 'r' ? pal.lit : pal.mid}"/>`
    + `<path d="${pl(crown)}" fill="none" stroke="${CHAR}" stroke-width="${f(Math.max(4, w * 0.045))}" stroke-linejoin="round" opacity=".85"/>`
    + `<path d="${pl(crown.slice(0, 4))}" fill="none" stroke="#fff0e0" stroke-width="2" opacity=".5" transform="translate(-2 -3)"/>`;
}

// A burnt-out cottage: the shell of a house() with the charred frame (skeleton) rising inside it, soot
// above the door and windows, a scorched wall top and an optional lone chimney.
// Returns { svg, fire: [x0, y0, x1, y1, h] where low black flames still cling to the wall top }.
function guttedHouse(S, R, x, y, w, h, pal, { side = 'r', chimney = false, keep = 0.6 } = {}) {
  const d = w * 0.8, k = side === 'r' ? 1 : -1, dx = d * k, dy = -d * 0.32, top = y - h;
  const out = [];
  out.push(`<path d="${pz([[x - w * 0.05, y + 1], [x + w * 1.9, y + h * 0.16], [x + w * 1.7, y + h * 0.4], [x + w * 0.1, y + h * 0.28]])}" fill="#1a1820" opacity=".28"/>`);
  // the charred frame inside the shell: posts and leaning rafters rising above the walls
  out.push(skeleton(R, x + w * 0.1 + dx * 0.3, y + dy * 0.3, w * 0.8, h + w * 0.42, CHAR, f(Math.max(3, w * 0.03))));
  out.push(shell(S, R, x, y, w, h, pal, { side, d, keep }));
  // soot above the door and the two gable windows (house() puts them at fixed fractions of w / h)
  let s = soot(x + w * 0.38, y - h * 0.62, w * 0.24, h * 0.22);
  for (const wx of [x + w * 0.1, x + w * 0.74]) s += soot(wx, y - h * 0.68, w * 0.16, h * 0.16);
  out.push(`<path d="${s}" fill="${CHAR}" opacity=".5" filter="${S.blur(1)}"/>`);
  out.push(`<path d="${pz([[x, top], [x + w, top], [x + w, top + h * 0.12], [x, top + h * 0.06]])}" fill="${CHAR}" opacity=".3"/>`);
  if (chimney) {
    const cx = x + (side === 'r' ? w * 0.7 : w * 0.18), ch = h * 1.25;
    out.push(`<path d="M${r0(cx)},${r0(y)}V${r0(y - ch)}h${r0(w * 0.12)}V${r0(y)}z" fill="${pal.chimney}"/><path d="M${r0(cx + w * 0.12)},${r0(y)}V${r0(y - ch)}h${r0(w * 0.05)}V${r0(y)}z" fill="${pal.shade}"/><path d="M${r0(cx - 2)},${r0(y - ch)}h${r0(w * 0.17 + 4)}" stroke="${CHAR}" stroke-width="${f(Math.max(3, w * 0.03))}"/><path d="M${r0(cx)},${r0(y - ch * 0.7)}h${r0(w * 0.12)}M${r0(cx)},${r0(y - ch * 0.45)}h${r0(w * 0.12)}" stroke="${CHAR}" stroke-opacity=".25" stroke-width="2"/>`);
  }
  return { svg: out.join(''), fire: [x + w * 0.2, top + 2, x + w * 0.62, top + 2, Math.max(18, h * 0.3)] };
}

// a cottage that came down: low wall stumps around a heap of charred rafters
function collapsedHouse(R, x, y, w, h, pal) {
  const stump = [[x, y], [x, y - h * 0.45], [x + w * 0.22, y - h * 0.62], [x + w * 0.4, y - h * 0.3], [x + w * 0.62, y - h * 0.5], [x + w * 0.8, y - h * 0.28], [x + w, y - h * 0.4], [x + w, y]];
  return `<path d="${pz([[x + w, y], [x + w, y - h * 0.4], [x + w * 1.3, y - h * 0.52], [x + w * 1.3, y - h * 0.1]])}" fill="${pal.shade}"/>`
    + skeleton(R, x + w * 0.1, y - h * 0.2, w * 0.9, h * 1.2, CHAR, f(Math.max(2.5, w * 0.03)))
    + `<path d="${pz(stump)}" fill="${pal.lit}"/>`
    + `<path d="${pl(stump.slice(1, -1))}" fill="none" stroke="${CHAR}" stroke-width="${f(Math.max(3, h * 0.08))}" stroke-linejoin="round" opacity=".8"/>`
    + `<path d="M${r0(x + w * 0.42)},${r0(y)}v${r0(-h * 0.28)}h${r0(w * 0.16)}v${r0(h * 0.28)}z" fill="${pal.win}"/>`;
}

// a fallen roof: a slab of tiles lying aslant on the ground (lit tile face, dark broken underside), a ragged
// burnt top edge, scalloped tile rows, two charred rafters sticking out of it
function roofWreck(R, x, y, w, h, pal) {
  const top = [];
  for (let i = 0; i <= 6; i++) top.push([x + w * (0.1 + 0.8 * i / 6), y - h * (1 - 0.4 * i / 6) + (i && i < 6 ? R.range(-h * 0.14, h * 0.1) : 0)]);
  const face = [[x, y - h * 0.12], ...top, [x + w, y - h * 0.08]];
  const under = [[x, y - h * 0.12], [x + w, y - h * 0.08], [x + w * 0.96, y + h * 0.06], [x + w * 0.04, y + h * 0.02]];
  let rows = '';
  for (const t of [0.3, 0.55, 0.8]) {
    const y0 = y - h * 0.12 - (h * 0.88) * t, y1 = y - h * 0.08 - (h * 0.5) * t;
    const n = 5;
    rows += `M${r0(x + w * 0.04)},${r0(y0)}L${r0(x + w * 0.96)},${r0(y1)}`;
    for (let i = 1; i < n; i++) rows += `M${r0(x + w * (0.04 + 0.92 * i / n))},${r0(y0 + (y1 - y0) * i / n)}l${r0(-w * 0.02)},${r0(h * 0.2)}`;
  }
  const beams = `M${r0(x + w * 0.28)},${r0(y - h * 0.4)}L${r0(x + w * 0.02)},${r0(y - h * 1.5)}M${r0(x + w * 0.72)},${r0(y - h * 0.3)}L${r0(x + w * 1.2)},${r0(y - h * 1.05)}`;
  return `<path d="${pz([[x - w * 0.05, y + 4], [x + w * 1.25, y + 6], [x + w * 1.1, y + h * 0.3], [x, y + h * 0.24]])}" fill="#141218" opacity=".4"/>`
    + `<path d="${beams}" stroke="${CHAR}" stroke-width="${f(Math.max(5, w * 0.055))}" stroke-linecap="round"/>`
    + `<path d="${pz(under)}" fill="${CHAR}"/>`
    + `<path d="${pz(face)}" fill="${pal.roof}"/>`
    + `<path d="${rows}" fill="none" stroke="${pal.shade}" stroke-width="2.4" opacity=".9"/>`
    + `<path d="${pz([[x, y - h * 0.12], ...top.slice(0, 3), [x + w * 0.3, y - h * 0.5], [x + w * 0.05, y - h * 0.2]])}" fill="${CHAR}" opacity=".35"/>`
    + `<path d="${pl(top)}" fill="none" stroke="${CHAR}" stroke-width="${f(Math.max(3, h * 0.1))}" stroke-linejoin="round"/>`
    + `<path d="${pl(top.slice(0, 4))}" fill="none" stroke="#f0e4d8" stroke-width="1.8" opacity=".55" transform="translate(-1 -3)"/>`;
}

function hemaiRuins() {
  const S = new Scene('sbRuins', '赫麦村废墟·黎明：灰白的房屋残骸、烧断的屋梁与倒下的七角晨星', 3303);
  const R = S.R;
  const GY = 600;
  const P = RUIN_PAL;
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
  const fires = [];
  // back row: smaller shells across the plaza, hazed by the morning air
  S.add(collapsedHouse(R, 20, 522, 100, 56, P.far));
  const b1 = guttedHouse(S, R, 150, 524, 84, 50, P.far, { side: 'r', keep: 0.5 });
  S.add(b1.svg);
  S.add(collapsedHouse(R, 1150, 520, 96, 54, P.far));
  const b2 = guttedHouse(S, R, 1340, 522, 90, 54, P.far, { side: 'l', keep: 0.7, chimney: true });
  S.add(b2.svg);
  S.add(collapsedHouse(R, 1490, 518, 100, 50, P.far));
  fires.push([1162, 520, 1220, 520, 22]);
  S.add(`<rect y="440" width="${W}" height="100" fill="#b8b0bc" opacity=".22"/>`);
  // the prayer hall: stone walls standing, the roof burnt to a few rafters, the gable broken open
  {
    const x = 500, w = 260, h = 170, y = GY, d = 120, top = y - h;
    S.add(skeleton(R, x + 30 + d * 0.3, y - d * 0.1, w * 0.85, h + 120, CHAR, 7));
    let courses = '';
    for (let yy = y - 22; yy > top + 10; yy -= 24) courses += `M${x},${yy}H${x + w}`;
    S.add(shell(S, R, x, y, w, h, P.stone, { side: 'r', d, roofH: 150, keep: 0.75, windows: 0, door: false }));
    S.add(`<path d="${courses}" stroke="#000" stroke-opacity=".1" stroke-width="2"/>`);
    // arched doorway, a burst rose window, soot licking up from both
    S.add(`<path d="${soot(x + w * 0.37, y - 108, w * 0.26, 40)}${soot(x + w / 2 - 22, top - 34, 44, 34)}" fill="${CHAR}" opacity=".5" filter="${S.blur(1)}"/>`);
    S.add(`<path d="M${x + w * 0.37},${y}V${y - 76}A${w * 0.13},${w * 0.13} 0 0 1 ${x + w * 0.63},${y - 76}V${y}Z" fill="${P.stone.hole}"/><circle cx="${x + w / 2}" cy="${top - 22}" r="22" fill="${P.stone.hole}"/><path d="M${x + w / 2 - 22},${top - 22}h44M${x + w / 2},${top - 44}v44" stroke="${P.stone.mid}" stroke-width="3"/>`);
    S.add(`<path d="M${x + 40},${top + 30}l14,30l-8,22M${x + w - 50},${top + 10}l-10,26l12,18" fill="none" stroke="#3a3440" stroke-width="2.5" opacity=".7"/>`);
    fires.push([x + 40, top + 4, x + 120, top + 4, 34], [x + w + 20, top - 4, x + w + 90, top - 26, 26]);
  }
  // the bell-tower stump: the shaft snapped above the belfry, its bell fallen into the rubble
  {
    const x = 902, w = 84, h = 300;
    const top = GY - h, dx = w * 0.45, dy = -dx * 0.3;
    // the break: a jagged line across the front face and on round the side face
    const brk = [[x - w * 0.1, top + 6], [x + w * 0.15, top - 4], [x + w * 0.32, top + 40], [x + w * 0.55, top - 10], [x + w * 0.78, top + 30], [x + w, top + 12], [x + w + dx * 0.5, top + 46], [x + w + dx + 2, top + dy + 30]];
    const clip = S.clip(pz([[x - w * 0.1, GY + 4], ...brk, [x + w + dx + 2, GY + 4]]));
    S.add(`<g clip-path="${clip}">${bellTower(x, GY, w, h + 160, P.stone, { broken: 1, bell: false, side: 'r' }).svg}</g>`);
    S.add(`<path d="${pl(brk)}" fill="none" stroke="${CHAR}" stroke-width="7" stroke-linejoin="round" opacity=".8"/><path d="${pl(brk.slice(0, 4))}" fill="none" stroke="#fff4e6" stroke-width="2.2" opacity=".6" transform="translate(-2 -3)"/>`);
    S.add(`<path d="M${x + 24},${top + 70}l10,36l-12,36l14,48M${x + 60},${top + 170}l-8,34l10,30" fill="none" stroke="#3a3440" stroke-width="2.5" opacity=".7"/><path d="M${x},${top}h${w}v110h${-w}z" fill="${CHAR}" opacity=".22"/>`);
    // a broken beam of the belfry floor still jutting out
    S.add(`<path d="M${x + w * 0.2},${top + 60}L${x - 30},${top + 20}" stroke="${CHAR}" stroke-width="7" stroke-linecap="round"/>`);
  }
  // rubble cone at the tower foot with the fallen bell
  S.add(`<path d="M830,${GY}C870,556,950,534,1020,552C1070,570,1090,590,1110,${GY}Z" fill="#6a6270"/><path d="M870,566C910,548,960,540,1010,552" fill="none" stroke="#e8dcd0" stroke-width="2" opacity=".5"/>`);
  let blocks = '';
  for (let i = 0; i < 14; i++) { const bx = R.range(850, 1090), by = R.range(560, 598), bs = R.range(8, 18); blocks += `M${r0(bx)},${r0(by)}l${r0(bs)},${r0(-bs * 0.3)}l${r0(bs * 0.2)},${r0(bs * 0.6)}l${r0(-bs)},${r0(bs * 0.2)}z`; }
  S.add(`<path d="${blocks}" fill="#8e8690"/>`);
  S.add(`<g transform="rotate(-28 1000 566)"><path d="M970,580Q972,540 1000,536Q1028,540 1030,580Z" fill="#6a5a50"/><path d="M970,580Q972,540 1000,536Q988,546 984,580Z" fill="#9a8a7a"/><ellipse cx="1000" cy="582" rx="32" ry="7" fill="#3a3238"/></g>`);
  fires.push([870, GY - 8, 940, GY - 12, 30]);
  // the seven-pointed morning-star statue, snapped off its pedestal, lying in the plaza
  S.add(`<path d="M320,${GY}L330,548H380L390,${GY}Z" fill="${P.near.mid}"/><path d="M356,${GY}L360,548H380L390,${GY}Z" fill="${P.near.shade}"/><path d="M332,548l12,-10l10,8l14,-12l12,14" fill="none" stroke="#4a4450" stroke-width="3"/>`);
  S.add(`<g transform="rotate(64 450 596)"><circle cx="450" cy="596" r="46" fill="none" stroke="#bcb0a6" stroke-width="7"/><path d="${star7(450, 596, 42)}" fill="#d0c4b8"/><path d="${star7(450, 596, 42)}" fill="none" stroke="#5e5866" stroke-width="2.5"/></g>`);
  S.add(`<ellipse cx="470" cy="${GY + 6}" rx="70" ry="10" fill="#1a1820" opacity=".35"/>`);
  // the ground: ash and rubble, a puddle holding the pale sky
  S.add(`<path d="M-20,${GY + 4}H1620V900H-20Z" fill="${S.lin([[0, '#5e5864'], [0.35, '#3a3440'], [1, '#141218']])}"/>`);
  S.add(`<ellipse cx="760" cy="680" rx="140" ry="14" fill="#b8b0c0" opacity=".45"/><path d="M660,678Q760,670 860,680" fill="none" stroke="#fff0e0" stroke-width="1.5" opacity=".4"/>`);
  // front row: gutted cottages on both sides of the old road
  const f3 = guttedHouse(S, R, 1480, GY + 6, 170, 130, P.near, { side: 'l', keep: 0.5 });
  S.add(f3.svg);
  const f1 = guttedHouse(S, R, -40, GY + 10, 200, 150, P.near, { side: 'r', chimney: true, keep: 0.65 });
  S.add(f1.svg);
  const f2 = guttedHouse(S, R, 1236, GY + 14, 220, 170, P.near, { side: 'l', keep: 0.55 });
  S.add(f2.svg);
  fires.push(f1.fire, f2.fire, [1290, GY + 14, 1350, GY + 14, 30]);
  // fallen roofs in the street
  S.add(roofWreck(R, 190, 660, 170, 60, P.near));
  S.add(roofWreck(R, 1060, 676, 180, 66, P.near));
  // the last low black flames: no glow, an ashen rim, dark-red embers where they bite the wood
  S.add(blackFire(S, R, fires, { smoke: false, maxH: 56, edgeCol: '#d8d0dc', wind: 0.45 }));
  let rub = '';
  for (let i = 0; i < 46; i++) { const x = R.range(-20, 1620), y = R.range(GY + 14, 780), w = R.range(10, 44) * (y / 640); rub += `M${r0(x)},${r0(y)}l${r0(w * 0.4)},${r0(-w * 0.3)}l${r0(w * 0.6)},${r0(w * 0.2)}z`; }
  S.add(`<path d="${rub}" fill="#4a4450"/>`);
  S.add(`<path d="M140,760L430,716M980,800L1250,834M560,800L740,788" stroke="${CHAR}" stroke-width="13" stroke-linecap="round"/><path d="M140,754L430,710" stroke="#7a7080" stroke-width="2" opacity=".5"/>`);
  let ash = '';
  for (let i = 0; i < 30; i++) ash += `<circle cx="${r0(R.range(0, 1600))}" cy="${r0(R.range(300, 700))}" r="${f(R.range(1, 2.4))}"/>`;
  S.add(`<g fill="#e8e0e8" opacity=".5">${ash}</g>`);
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
