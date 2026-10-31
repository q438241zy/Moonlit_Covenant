// 冊廳底下的地下档案库 — chapter 20 (script 20 美術需求):
//   white-tower-underground-archive — a stone archive under the registry hall: two parallel corridors of shelves running
//                                     away to a round chamber where they meet; an iron-banded door at the end of the left
//                                     corridor with an oval bronze plate set in it; a thin wire running from the plate up
//                                     into the dark ceiling (the alarm); candle sconces. Cold grey and candle yellow. No figures.
// No text anywhere: the spines and the plate are strokes, never letters.
import { Scene, W, H, f, persp, mix, rng } from './lib.mjs';

const f1 = (v) => f(v, 1);
const pz1 = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L') + 'Z';
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;

function archive() {
  const S = new Scene('sbArchive', '册厅底下的地下档案库：石造的地下室，两条平行的长廊，架子一层一层排到看不见的地方，在尽头交会成一个圆形的空间；左边长廊的尽头一道包铁的门，门上嵌着一块椭圆的铜板，铜板上一条细线往上连进黑暗的天花板；墙上点着烛台；冷灰和烛黄，不画人', 20101);
  const R = rng(20102);
  // the eye stands in the left corridor (x = -2.5), so the middle row of shelves is on the right and the right corridor
  // shows only past its end, in the round chamber
  const P0 = persp({ vp: [800, 440], F: 700, eye: 1.6 });
  const P = (X, Y, Z) => P0(X + 2.5, Y, Z);
  P.quad = (pts) => pz1(pts.map(([X, Y, Z]) => P(X, Y, Z)));
  const C = { stone: '#5a5a62', stoneLit: '#7a7880', stoneDeep: '#2e2e36', floor: '#4a4850', shelf: '#4a3a2e', shelfLit: '#6a5240', candle: '#ffcf80' };
  S.add(`<rect width="${W}" height="${H}" fill="#18181e"/>`);
  // the vault ceiling and floor of the whole room
  S.add(`<path d="${P.quad([[-6, 3.6, 1.2], [6, 3.6, 1.2], [6, 3.6, 22], [-6, 3.6, 22]])}" fill="#202028"/>`);
  S.add(`<path d="${P.quad([[-6, 0, 1.2], [6, 0, 1.2], [6, 0, 22], [-6, 0, 22]])}" fill="${S.lin([[0, '#26262c'], [1, C.floor]])}"/>`);
  {
    let d = '';
    for (let z = 1.6; z < 22; z *= 1.22) d += 'M' + P(-6, 0, z).map(f1).join(',') + 'L' + P(6, 0, z).map(f1).join(',');
    for (let x = -6; x <= 6; x += 1) d += 'M' + P(x, 0, 1.2).map(f1).join(',') + 'L' + P(x, 0, 22).map(f1).join(',');
    S.add(`<path d="${d}" stroke="#2a2a32" stroke-width="1.6" opacity=".6"/>`);
  }
  // the round chamber at the far end where the corridors meet: a lighter circle of floor and a curved wall
  const rc = P(0, 0, 18), rcTop = P(0, 3.4, 18);
  S.add(`<path d="${ell(rc[0], rc[1] - 2, 150, 16)}" fill="#5e5a58"/><path d="M${f1(rc[0] - 150)},${f1(rc[1])}V${f1(rcTop[1])}q150,-40 300,0V${f1(rc[1])}Z" fill="${S.lin([[0, '#3a3638'], [1, '#6a645e']])}"/>`);
  S.add(`<ellipse cx="${f1(rc[0])}" cy="${f1(rc[1] - 30)}" rx="190" ry="90" fill="${S.rad([[0, C.candle, 0.35], [1, C.candle, 0]])}"/>`);
  // shelves: two outer rows (along the walls) and one middle row dividing the two corridors, each a run of bays
  function shelfRow(x0, x1, z0, z1, faceSide) {
    // faceSide: +1 face toward +x, -1 toward -x (the side the corridor sees)
    const xf = faceSide > 0 ? x1 : x0;
    for (let z = z0; z < z1 - 0.01; z += 1.2) {
      const za = z, zb = Math.min(z + 1.2, z1);
      const face = [[xf, 0, za], [xf, 0, zb], [xf, 3.0, zb], [xf, 3.0, za]];
      const shade = Math.min(0.75, 0.2 + za / 30);
      S.add(`<path d="${P.quad(face)}" fill="${mix(C.shelfLit, C.stoneDeep, shade)}"/>`);
      // shelf boards and spines (only near bays get spines)
      let boards = '', spines = '';
      for (let y = 0.15; y < 3.0; y += 0.55) boards += 'M' + P(xf, y, za).map(f1).join(',') + 'L' + P(xf, y, zb).map(f1).join(',');
      if (za < 9) {
        const n = za < 4 ? 7 : 4;
        for (let y = 0.15; y < 2.6; y += 0.55) for (let k = 0; k < n; k++) {
          const zz = za + (k + 0.5) * (zb - za) / n;
          const h = R.range(0.3, 0.46);
          spines += 'M' + P(xf, y, zz).map(f1).join(',') + 'L' + P(xf, y + h, zz).map(f1).join(',');
        }
      }
      S.add(`<path d="${boards}" stroke="#20160e" stroke-width="2"/>`);
      if (spines) S.add(`<path d="${spines}" stroke="${mix('#c8b48a', C.stoneDeep, shade)}" stroke-width="${za < 4 ? 4 : 2}" opacity=".85"/>`);
      // upright between bays
      S.add(`<path d="M${P(xf, 0, za).map(f1).join(',')}L${P(xf, 3.0, za).map(f1).join(',')}" stroke="#20160e" stroke-width="${za < 4 ? 5 : 3}"/>`);
    }
  }
  // left wall row faces +x; middle row: its left face faces -x (left corridor), its right face faces +x (right corridor)
  shelfRow(-5.6, -4.6, 1.2, 16, 1);
  shelfRow(4.6, 5.6, 15, 18, -1);
  shelfRow(-0.5, 0.5, 2.0, 15, -1);
  // the far end of the middle row: its end panel, where the corridors meet
  S.add(`<path d="${P.quad([[-0.5, 0, 15], [0.5, 0, 15], [0.5, 3.0, 15], [-0.5, 3.0, 15]])}" fill="${C.shelf}" stroke="#20160e" stroke-width="3"/>`);
  // the door at the end of the left corridor, set in a stone frame, with the oval bronze plate and the alarm wire
  {
    const z = 13, x0 = -4.4, x1 = -0.7;
    S.add(`<path d="${P.quad([[x0, 0, z], [x1, 0, z], [x1, 2.8, z], [x0, 2.8, z]])}" fill="${C.stone}"/>`);
    const d0 = P(x0 + 0.7, 0, z), d1 = P(x1 - 0.7, 2.3, z);
    S.add(`<path d="M${f1(d0[0])},${f1(d0[1])}V${f1(d1[1] + 10)}q${f1((d1[0] - d0[0]) / 2)},-24 ${f1(d1[0] - d0[0])},0V${f1(d0[1])}Z" fill="#3a2a20" stroke="#1a1410" stroke-width="2"/>`);
    S.add(`<path d="M${f1(d0[0])},${f1(d0[1] - 20)}H${f1(d1[0])}M${f1(d0[0])},${f1(d0[1] - 46)}H${f1(d1[0])}" stroke="#5a5a62" stroke-width="3"/>`);
    const pc = [(d0[0] + d1[0]) / 2, d1[1] + 26];
    S.add(`<path d="${ell(pc[0], pc[1], 13, 9)}" fill="${S.rad([[0, '#f0c070'], [1, '#8a5a2a']])}" stroke="#4a3018" stroke-width="1.5"/>`);
    const top = P((x0 + x1) / 2, 3.6, z);
    S.add(`<path d="M${f1(pc[0])},${f1(pc[1] - 9)}L${f1(top[0] + 6)},${f1(top[1])}" stroke="#c8a060" stroke-width="1.2" opacity=".8"/>`);
  }
  // the right corridor end: a second plate on the round chamber's wall, its wire running up too
  {
    const pc = P(2.4, 1.8, 16.5), top = P(2.4, 3.6, 16.5);
    S.add(`<path d="${ell(pc[0], pc[1], 9, 6)}" fill="#c89048"/><path d="M${f1(pc[0])},${f1(pc[1] - 6)}L${f1(top[0])},${f1(top[1])}" stroke="#c8a060" stroke-width="1" opacity=".7"/>`);
  }
  // candle sconces on the outer rows' near uprights and their pools of light
  for (const [x, z] of [[-4.6, 3.6], [4.6, 3.6], [-4.6, 8.4], [4.6, 8.4]]) {
    const c = P(x, 2.2, z);
    const s = 1 / z * 4;
    S.add(`<ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="${f1(160 * s)}" ry="${f1(220 * s)}" fill="${S.rad([[0, C.candle, 0.45], [1, C.candle, 0]])}"/>`);
    S.add(`<path d="M${f1(c[0] - 6 * s)},${f1(c[1] + 10 * s)}h${f1(12 * s)}v${f1(-18 * s)}h${f1(-12 * s)}z" fill="#e8dcc0"/><path d="M${f1(c[0])},${f1(c[1] - 8 * s)}q${f1(-4 * s)},${f1(-8 * s)} 0,${f1(-16 * s)}q${f1(4 * s)},${f1(8 * s)} 0,${f1(16 * s)}z" fill="#fff0c0"/>`);
  }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', 0.2], [1, '#000', 0.7]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}

export const archiveBgs = { 'white-tower-underground-archive': () => archive() };
