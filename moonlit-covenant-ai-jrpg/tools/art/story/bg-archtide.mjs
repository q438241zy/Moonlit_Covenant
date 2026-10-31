// 拱潮门 — chapter 21 (script 21 美術需求):
//   arch-tide-gate-sanctuary — 护界院: a long stone room under the arch-tide gate, two rows of plain beds running away, a
//                              reading lectern with a thick register in the middle aisle, on the far wall a relief of an arch
//                              pressing on a wave; cold grey and candle yellow. The people on the beds only as low outlines
//                              under blankets; the last bed covered with a cloth.
//   arch-tide-gate-channel   — the water channel: black and long, a narrow walkway along dark water, at the far end an iron
//                              grating with daylight beyond it.
//   canal-bank-dawn          — the canal bank outside the city at dawn: a long grassy embankment above a still canal, the sky
//                              grey turning gold, the white city and its tower far off behind, its top lost in cloud.
// No text anywhere.
import { Scene, W, H, f, persp, mix, rng } from './lib.mjs';

const f1 = (v) => f(v, 1);
const pz1 = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L') + 'Z';
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;
const circ = (cx, cy, r) => ell(cx, cy, r, r);
const archWave = (cx, cy, r) => `M${f1(cx - r)},${f1(cy + r * 0.2)}V${f1(cy - r * 0.15)}A${f1(r)},${f1(r)} 0 0 1 ${f1(cx + r)},${f1(cy - r * 0.15)}V${f1(cy + r * 0.2)}`
  + `M${f1(cx - r)},${f1(cy + r * 0.55)}q${f1(r * 0.25)},${f1(-r * 0.3)} ${f1(r * 0.5)},0t${f1(r * 0.5)},0t${f1(r * 0.5)},0t${f1(r * 0.5)},0`;

function sanctuary() {
  const S = new Scene('sbAtSanctuary', '拱潮门下·护界院：一间很长的石室，两排简单的床一直排到深处，中间走道上一座读经台，台上一本很厚的簿子；尽头的墙上一道拱压着浪的浮雕；冷灰和烛黄；床上的人只画盖着毯子的轮廓，最里面那张床盖着布', 21101);
  const R = rng(21102);
  const P = persp({ vp: [800, 400], F: 760, eye: 1.7 });
  const C = { stone: '#6a6a70', stoneDeep: '#3a3a42', floor: '#4e4c50', bed: '#6a5a4a', sheet: '#b8b0a2', blanket: '#5a5e6a', candle: '#ffcf80' };
  S.add(`<rect width="${W}" height="${H}" fill="#1c1c22"/>`);
  // vaulted ceiling, side walls, floor, far wall
  const X = 3.2, Y = 3.4, ZN = 1.4, ZF = 18;
  S.add(`<path d="${P.quad([[-X, Y, ZN], [X, Y, ZN], [X, Y, ZF], [-X, Y, ZF]])}" fill="#26262e"/>`);
  for (let z = 3; z < ZF; z += 2.4) {
    const a = P(-X, Y, z), b = P(X, Y, z), top = P(0, Y + 1.2, z);
    S.add(`<path d="M${f1(a[0])},${f1(a[1])}Q${f1(top[0])},${f1(top[1] - (b[0] - a[0]) * 0.1)} ${f1(b[0])},${f1(b[1])}" fill="none" stroke="#3a3a44" stroke-width="${f1(8 * 3 / z)}"/>`);
  }
  S.add(`<path d="${P.quad([[-X, 0, ZN], [-X, 0, ZF], [-X, Y, ZF], [-X, Y, ZN]])}" fill="${S.lin([[0, C.stoneDeep], [1, C.stone]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="${P.quad([[X, 0, ZN], [X, 0, ZF], [X, Y, ZF], [X, Y, ZN]])}" fill="${S.lin([[0, C.stone], [1, C.stoneDeep]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="${P.quad([[-X, 0, ZN], [X, 0, ZN], [X, 0, ZF], [-X, 0, ZF]])}" fill="${S.lin([[0, '#2a2a30'], [1, C.floor]])}"/>`);
  S.add(`<path d="${P.quad([[-X, 0, ZF], [X, 0, ZF], [X, Y, ZF], [-X, Y, ZF]])}" fill="#5a5856"/>`);
  { const c = P(0, 2.2, ZF); S.add(`<path d="${archWave(c[0], c[1], 34)}" fill="none" stroke="#8a8478" stroke-width="5"/>`); }
  // the two rows of beds, far to near
  const beds = [];
  for (let z = 16; z >= 2.4; z -= 1.6) for (const side of [-1, 1]) beds.push([side, z]);
  for (const [side, z] of beds) {
    const x0 = side < 0 ? -X + 0.2 : X - 1.3, x1 = x0 + 1.1, za = z, zb = z + 1.0, y = 0.5;
    const top = [[x0, y, za], [x1, y, za], [x1, y, zb], [x0, y, zb]];
    const front = [[x0, 0, za], [x1, 0, za], [x1, y, za], [x0, y, za]];
    const inner = side < 0 ? [[x1, 0, za], [x1, 0, zb], [x1, y, zb], [x1, y, za]] : [[x0, 0, za], [x0, 0, zb], [x0, y, zb], [x0, y, za]];
    const fog = Math.min(0.7, z / 22);
    S.add(`<path d="${P.quad(inner)}" fill="${mix(C.bed, '#1c1c22', fog)}"/><path d="${P.quad(front)}" fill="${mix('#8a7a66', '#1c1c22', fog)}"/>`);
    const last = side > 0 && z > 15;
    S.add(`<path d="${P.quad(top)}" fill="${mix(last ? '#d8d2c4' : C.sheet, '#1c1c22', fog)}"/>`);
    // a body under the blanket: a long low hump and the head at the far end (or the whole covered by the cloth)
    const hb = [[x0 + 0.2, y + 0.18, za + 0.1], [x1 - 0.2, y + 0.18, za + 0.1], [x1 - 0.2, y + 0.18, zb - 0.3], [x0 + 0.2, y + 0.18, zb - 0.3]];
    S.add(`<path d="${P.quad(hb)}" fill="${mix(last ? '#e8e2d4' : C.blanket, '#1c1c22', fog)}"/>`);
    if (!last) { const hd = P((x0 + x1) / 2, y + 0.2, zb - 0.15); S.add(`<path d="${ell(hd[0], hd[1], 22 * 3 / z, 14 * 3 / z)}" fill="${mix('#8a7a70', '#1c1c22', fog)}"/>`); }
  }
  // the reading lectern and the thick register in the aisle
  {
    const z = 6.5, b = P(0, 0, z), t = P(0, 1.2, z);
    S.add(`<path d="M${f1(b[0] - 14)},${f1(b[1])}h28l-6,${f1(t[1] - b[1])}h-16z" fill="#4a3a2e"/>`);
    S.add(`<path d="M${f1(t[0] - 60)},${f1(t[1] + 10)}l120,0l-14,-26l-92,0z" fill="#5a4636"/><path d="M${f1(t[0] - 48)},${f1(t[1] + 2)}l96,0l-10,-20l-76,0z" fill="#e8dcc0"/><path d="M${f1(t[0])},${f1(t[1] + 2)}l-4,-20" stroke="#8a7a5a" stroke-width="1.5"/>`);
    S.add(`<path d="${circ(t[0] + 30, t[1] - 10, 6)}" fill="none" stroke="#a83030" stroke-width="2"/>`);
  }
  // candles on the side walls and their glow
  for (const [x, z] of [[-X, 4.5], [X, 4.5], [-X, 9], [X, 9], [-X, 14], [X, 14]]) {
    const c = P(x, 2.2, z), s = 4 / z;
    S.add(`<ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="${f1(150 * s)}" ry="${f1(200 * s)}" fill="${S.rad([[0, C.candle, 0.4], [1, C.candle, 0]])}"/><path d="M${f1(c[0])},${f1(c[1] - 6 * s)}q${f1(-4 * s)},${f1(-8 * s)} 0,${f1(-16 * s)}q${f1(4 * s)},${f1(8 * s)} 0,${f1(16 * s)}z" fill="#fff0c0"/>`);
  }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', 0.2], [1, '#000', 0.7]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}

function channel() {
  const S = new Scene('sbAtChannel', '拱潮门水道：又黑又长的水道，一条窄窄的石砌走道沿着黑水往深处去，尽头一道铁栅，栅外透进天光；冷黑和一点灰白', 21201);
  const P = persp({ vp: [820, 420], F: 760, eye: 1.4 });
  S.add(`<rect width="${W}" height="${H}" fill="#0a0a0e"/>`);
  // the tunnel: a barrel vault of dark stone
  const ZF = 26;
  for (let z = 1.6; z < ZF; z *= 1.16) {
    const a = P(-3, 0, z), b = P(3, 0, z), r = (b[0] - a[0]) / 2, cy = P(0, 2.2, z)[1];
    const sh = Math.min(0.92, 0.25 + z / 30);
    S.add(`<path d="M${f1(a[0])},${f1(a[1] + 40)}V${f1(cy)}A${f1(r)},${f1(r * 0.9)} 0 0 1 ${f1(b[0])},${f1(cy)}V${f1(b[1] + 40)}" fill="none" stroke="${mix('#4a4a52', '#0a0a0e', sh)}" stroke-width="${f1(26 / z)}"/>`);
  }
  // the far end: the iron grating with daylight beyond
  {
    const a = P(-1.4, 0, ZF), b = P(1.4, 2.4, ZF);
    S.add(`<path d="M${f1(a[0])},${f1(a[1])}V${f1(b[1] + 10)}q${f1((b[0] - a[0]) / 2)},-16 ${f1(b[0] - a[0])},0V${f1(a[1])}Z" fill="${S.lin([[0, '#c8d0d8'], [1, '#f0e8d0']])}"/>`);
    let g = '';
    for (let x = a[0] + 6; x < b[0]; x += 8) g += `M${f1(x)},${f1(a[1])}V${f1(b[1])}`;
    g += `M${f1(a[0])},${f1((a[1] + b[1]) / 2)}H${f1(b[0])}`;
    S.add(`<path d="${g}" stroke="#1a1a20" stroke-width="2.6"/>`);
    S.add(`<ellipse cx="${f1((a[0] + b[0]) / 2)}" cy="${f1((a[1] + b[1]) / 2)}" rx="180" ry="120" fill="${S.rad([[0, '#f0e8d0', 0.35], [1, '#f0e8d0', 0]])}"/>`);
  }
  // the black water filling the floor, with a faint reflection of the far light
  S.add(`<path d="${P.quad([[-3, 0, 1.6], [1.0, 0, 1.6], [1.0, 0, ZF], [-3, 0, ZF]])}" fill="#08080c"/>`);
  { const a = P(-0.4, 0, ZF), b = P(0.4, 0, 3); S.add(`<path d="${pz1([[a[0] - 6, a[1]], [a[0] + 6, a[1]], [b[0] + 30, b[1]], [b[0] - 60, b[1]]])}" fill="#c8c0a8" opacity=".08"/>`); }
  // the stone walkway along the right
  S.add(`<path d="${P.quad([[1.0, 0.25, 1.6], [3, 0.25, 1.6], [3, 0.25, ZF], [1.0, 0.25, ZF]])}" fill="${S.lin([[0, '#2a2a30'], [1, '#4a4a52']])}"/>`);
  S.add(`<path d="${P.quad([[1.0, 0, 1.6], [1.0, 0.25, 1.6], [1.0, 0.25, ZF], [1.0, 0, ZF]])}" fill="#1a1a20"/>`);
  {
    let d = '';
    for (let z = 2; z < ZF; z *= 1.2) d += 'M' + P(1.0, 0.25, z).map(f1).join(',') + 'L' + P(3, 0.25, z).map(f1).join(',');
    S.add(`<path d="${d}" stroke="#1a1a20" stroke-width="1.6" opacity=".8"/>`);
  }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.5, '#000', 0.25], [1, '#000', 0.8]], 'cx="0.52" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}

function canalBank() {
  const S = new Scene('sbAtCanalBank', '城外运河的堤岸·黎明：一道长长的长草堤岸在平静的运河上方，天由灰转金；远处身后是白色的城和白塔，塔顶没进云里', 21301);
  const R = rng(21302);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#7a8094'], [0.45, '#c8bca8'], [0.7, '#f0d8a8'], [1, '#f6e4b8']])}"/>`);
  S.add(`<ellipse cx="1180" cy="430" rx="620" ry="170" fill="${S.rad([[0, '#fff2c8', 0.75], [1, '#fff2c8', 0]])}"/>`);
  // the white city far off on the left, its tower into cloud
  S.add(`<path d="M120,420V370l40,-20 30,16 40,-30 50,24V330l40,-18 40,18V350l60,-24 40,20V420Z" fill="#c8c4c0" opacity=".85"/>`);
  S.add(`<path d="M372,420L384,60H404L416,420Z" fill="${S.lin([[0, '#d8d4cc'], [0.5, '#f0ece4'], [1, '#c8c4bc']], 'x1="0" y1="0" x2="1" y2="0"')}" opacity=".9"/>`);
  S.add(`<path d="M260,90q60,-40 140,-10q60,-30 130,6q-40,30 -130,16q-80,14 -140,-12z" fill="#e8dcd0" opacity=".9"/>`);
  // the canal: a long still band of water reflecting the sky
  S.add(`<path d="M0,470Q800,450 ${W},464V560Q800,548 0,566Z" fill="${S.lin([[0, '#c8bca0'], [1, '#8a8a8a']])}"/>`);
  {
    let d = '';
    for (let k = 0; k < 18; k++) { const x = R.range(0, W), y = R.range(476, 552); d += `M${f1(x)},${f1(y)}h${f1(R.range(30, 120))}`; }
    S.add(`<path d="${d}" stroke="#fff0c8" stroke-width="1.6" opacity=".5"/>`);
  }
  // the embankment: grassy slope rising from the water to the foreground
  S.add(`<path d="M0,566Q800,548 ${W},560V${H}H0Z" fill="${S.lin([[0, '#7a8a5a'], [1, '#4a5a3a']])}"/>`);
  S.add(`<path d="M0,640Q800,610 ${W},630" fill="none" stroke="#9aa870" stroke-width="3" opacity=".6"/>`);
  {
    let d = '';
    for (let k = 0; k < 220; k++) { const x = R.range(0, W), y = R.range(580, H); d += `M${f1(x)},${f1(y)}l${f1(R.range(-5, 5))},${f1(-R.range(8, 20))}`; }
    S.add(`<path d="${d}" stroke="#3a4a2e" stroke-width="1.6" opacity=".7"/>`);
  }
  // a path along the top of the bank running north (right)
  S.add(`<path d="M0,700Q600,660 ${W},640L${W},670Q600,692 0,738Z" fill="#a89c80" opacity=".8"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.75, '#000', 0.05], [1, '#000', 0.3]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}

export const archTideBgs = {
  'arch-tide-gate-sanctuary': () => sanctuary(),
  'arch-tide-gate-channel': () => channel(),
  'canal-bank-dawn': () => canalBank(),
};
