// 雾港 (chapter 09): a harbour town of wooden bridges, stilt houses and piles over tidal channels.
//   fog-harbor-bridge-noon — 第一座木桥·近午退潮: the channel drained to its mud floor, fishing boats lying on the mud
//                            with their unlit tide lamps at the bow, the first wooden bridge across with missing-person
//                            notices pasted on its posts, the stone steps bared under its abutment, a row of iron grate
//                            mouths stuffed with reeds in the quay wall, and beyond, bridge after bridge, stilt houses and
//                            piles; the fog only a thin layer lying on the water.
//   fog-harbor-guild       — 冒险者公会雾港分会: see harborGuild().
//   fog-harbor-drain-dusk / fog-harbor-drain-night — see harborDrain().
// No reflections, no mirrors, no figures (script 09 美術需求).
import { Scene, W, H, f, pz, pl, shape, cloud, band, stars, bird, persp, mix, rng, star7 } from './lib.mjs';
import { piles, mudSheen, currents, patch, circ, sag, notice, tideLamp, taper } from './coast.mjs';
import { reedBank } from './bg-oldmill.mjs';
import { swordBell } from './bg-town.mjs';

const r0 = (v) => f(v, 0);

const NOON = {
  sky: [[0, '#b4c0c8'], [0.25, '#d0d6d6'], [0.45, '#e6e6de'], [1, '#d6d4c8']],
  stone: { lit: '#c4bcae', mid: '#a49c8e', shade: '#7a7468', course: '#5e584e' },
  wood: { lit: '#9a8a74', mid: '#76685a', shade: '#544a40', wet: '#3e4038', cap: '#b8aa92' },
  plaster: '#d8d0c0', plasterShade: '#a8a090', roof: '#6a6e78', roofShade: '#4e525c', roofRed: '#9a5a48',
  mud: [[0, '#8e887a'], [0.5, '#6e685c'], [1, '#4a463e']], water: '#7e8a88', sheen: '#eeece2',
  paper: '#f2ecdc', ink: '#3a3632', pin: '#8a3a2a', iron: '#2e3034', fog: '#eeeee8',
};

// a stilt house in elevation facing the channel: front wall on piles, pitched roof, a door to a little landing
function stiltHouse(o, x, base, w, floorY, h, pal, R, side = 1) {
  const s = [];
  // piles under the floor
  const pl0 = [];
  for (let i = 0; i <= 3; i++) pl0.push([x + w * i / 3 + (i === 0 ? 4 : i === 3 ? -4 : 0), floorY, base, Math.max(3, w * 0.06), base - (base - floorY) * 0.3]);
  s.push(piles(pl0, pal.wood));
  // wall, roof
  s.push(`<path d="M${r0(x)},${r0(floorY)}V${r0(floorY - h)}H${r0(x + w)}V${r0(floorY)}Z" fill="${pal.wall}"/>`);
  s.push(`<path d="M${r0(x + (side > 0 ? w * 0.7 : 0))},${r0(floorY)}V${r0(floorY - h)}H${r0(x + (side > 0 ? w : w * 0.3))}V${r0(floorY)}Z" fill="${pal.wallShade}" opacity=".6"/>`);
  const rh = w * R.range(0.3, 0.45);
  s.push(`<path d="M${r0(x - w * 0.08)},${r0(floorY - h)}L${r0(x + w / 2)},${r0(floorY - h - rh)}L${r0(x + w * 1.08)},${r0(floorY - h)}Z" fill="${pal.roof}"/><path d="M${r0(x + w / 2)},${r0(floorY - h - rh)}L${r0(x + w * 1.08)},${r0(floorY - h)}L${r0(x + w * 0.75)},${r0(floorY - h)}Z" fill="${pal.roofShade}" opacity=".7"/>`);
  s.push(`<path d="M${r0(x - w * 0.08)},${r0(floorY - h)}L${r0(x + w / 2)},${r0(floorY - h - rh)}" stroke="${pal.rim}" stroke-width="${f(Math.max(1, w * 0.02))}" opacity=".7"/>`);
  // window and door, a plank landing
  s.push(`<path d="M${r0(x + w * 0.15)},${r0(floorY - h * 0.7)}h${r0(w * 0.22)}v${r0(h * 0.32)}h${r0(-w * 0.22)}z" fill="${pal.win}"/><path d="M${r0(x + w * 0.6)},${r0(floorY)}v${r0(-h * 0.7)}h${r0(w * 0.22)}v${r0(h * 0.7)}z" fill="${pal.door}"/>`);
  s.push(`<path d="M${r0(x - w * 0.05)},${r0(floorY)}h${r0(w * 1.1)}v${f(Math.max(2, w * 0.03))}h${r0(-w * 1.1)}z" fill="${pal.wood.shade}"/>`);
  o.push(s.join(''));
}

// ---------------------------------------------------------------------------------------------
// 雾港·第一座木桥·近午退潮
// ---------------------------------------------------------------------------------------------
function harborBridgeNoon() {
  const S = new Scene('sbHarborNoon', '雾港·第一座木桥·近午退潮：退潮见底的水道与搁在泥上的渔船（船头挂着不亮的潮灯），桥柱上贴着寻人单的第一座木桥，桥墩下露出的石阶，石墙上一排塞着芦苇的铁栅口，远处一座接一座的木桥、高脚木屋与木桩', 6701);
  const R = S.R;
  const F = 820, VP = [800, 400], EYE = 1.7;
  const pr = persp({ vp: VP, F, eye: EYE });
  const q = (pts) => pr.quad(pts);
  const k = (z) => F / z;
  const CW = 5.2, QY = 2.6; // channel half-width, quay height above the mud
  const P = NOON;

  // --- sky: high hazy noon --------------------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(P.sky)}"/>`);
  S.add(`<circle cx="760" cy="40" r="620" fill="${S.rad([[0, '#fffef6', 0.75], [0.25, '#fbf8ea', 0.35], [1, '#fbf8ea', 0]])}"/>`);
  S.add(`<g filter="${S.blur(2)}"><path d="${band(-60, 700, 120, 20, R, 8)}" fill="#ffffff" opacity=".5"/><path d="${band(900, 1700, 170, 18, R, 8)}" fill="#c4ccd0" opacity=".5"/></g>`);
  let gulls = '';
  for (const [x, y, s, fl] of [[620, 170, 0.9, 0.3], [668, 150, 0.7, 0.8], [1060, 200, 0.6, 0.5]]) gulls += bird(x, y, s, fl);
  S.add(`<path d="${gulls}" fill="#6a7276"/>`);

  // --- the far reaches: bridge after bridge, stilt houses and piles fading into the haze ----------------
  const far = [90, 62, 44, 32, 22];
  for (const [i, z] of far.entries()) {
    const fade = Math.min(0.85, 0.15 + i * 0.17), haze = (c) => mix(c, '#dcdcd4', 1 - fade);
    const pal = { wall: haze(P.plaster), wallShade: haze(P.plasterShade), roof: haze(i % 2 ? P.roof : P.roofRed), roofShade: haze(P.roofShade), rim: haze('#ffffff'), win: haze('#4a4a50'), door: haze('#3a3634'), wood: { lit: haze(P.wood.lit), mid: haze(P.wood.mid), shade: haze(P.wood.shade), wet: haze(P.wood.wet) } };
    const o = [];
    // stilt houses lining both banks at this depth
    for (const side of [-1, 1]) {
      for (let j = 0; j < 2; j++) {
        const zz = z + j * z * 0.18, x0 = side * (CW + 0.6 + j * 0.2), wd = 4.2 + R.range(-0.6, 0.8);
        const a = pr(side > 0 ? x0 : x0 - wd, 0, zz), b = pr(side > 0 ? x0 + wd : x0, 0, zz);
        const floorY = pr(0, QY + 0.3, zz)[1], h = (3 + R.range(-0.4, 1)) * k(zz);
        stiltHouse(o, a[0], a[1], b[0] - a[0], floorY, h, pal, R, side);
      }
    }
    // the bridge across at this depth: deck, rail, posts
    const dl = pr(-CW - 0.5, QY + 0.2, z), dr = pr(CW + 0.5, QY + 0.2, z), kk = k(z);
    let posts = '';
    for (const x of [-3, -1, 1, 3]) { const t = pr(x, QY + 0.2, z), b = pr(x, 0, z); posts += `M${r0(t[0])},${r0(t[1])}V${r0(b[1])}`; }
    o.push(`<path d="${posts}" stroke="${pal.wood.shade}" stroke-width="${f(Math.max(1.5, 0.22 * kk))}"/>`);
    o.push(`<path d="M${r0(dl[0])},${r0(dl[1])}H${r0(dr[0])}v${f(0.25 * kk)}H${r0(dl[0])}Z" fill="${pal.wood.mid}"/><path d="M${r0(dl[0])},${r0(dl[1] - 1.0 * kk)}H${r0(dr[0])}" stroke="${pal.wood.shade}" stroke-width="${f(Math.max(1, 0.08 * kk))}"/>`);
    let rp = '';
    for (let x = -CW; x <= CW + 0.01; x += 1.3) { const t = pr(x, QY + 1.2, z), b = pr(x, QY + 0.2, z); rp += `M${r0(t[0])},${r0(t[1])}V${r0(b[1])}`; }
    o.push(`<path d="${rp}" stroke="${pal.wood.shade}" stroke-width="${f(Math.max(1, 0.07 * kk))}"/>`);
    S.add(o.join(''));
    // a veil of haze after each reach
    S.add(`<rect y="${r0(pr(0, 8, z)[1])}" width="${W}" height="${r0(pr(0, -0.5, z)[1] - pr(0, 8, z)[1])}" fill="#e2e2da" opacity=".16"/>`);
  }

  // --- the channel floor: mud to the walls, a thin stream down the middle, wet glints -----------------------
  S.add(`<path d="${q([[-CW - 6, 0, 1.3], [-CW - 6, 0, 120], [CW, 0, 120], [CW, 0, 1.3]])}" fill="${S.lin(P.mud, `gradientUnits="userSpaceOnUse" x1="0" y1="${VP[1]}" x2="0" y2="${H}"`)}"/>`);
  const stream = pz([...[[0.6, 120], [0.9, 40], [-0.2, 20], [-0.9, 12], [0.4, 7], [1.2, 2.4]].map(([x, z]) => pr(x, 0, z)), ...[[2.6, 2.4], [1.6, 7], [0.2, 12], [0.7, 20], [1.4, 40], [0.9, 120]].map(([x, z]) => pr(x, 0, z))]);
  S.add(`<path d="${stream}" fill="${P.water}"/>`);
  S.add(currents(R, 700, 1000, VP[1] + 20, 860, 30, P.sheen, 0.45, 1));
  S.add(mudSheen(R, 140, 1460, VP[1] + 10, 860, 60, P.sheen, 0.45));

  // --- right: the stone quay wall with its row of iron grate mouths stuffed with reeds; the street above ------
  {
    const o = [];
    o.push(`<path d="${q([[CW, 0, 2], [CW, QY, 2], [CW, QY, 120], [CW, 0, 120]])}" fill="${P.stone.mid}"/>`);
    o.push(`<path d="${q([[CW, QY, 2], [CW, QY + 0.25, 2], [CW, QY + 0.25, 120], [CW, QY, 120]])}" fill="${P.stone.lit}"/>`);
    o.push(`<path d="${q([[CW, QY + 0.25, 2], [CW + 8, QY + 0.25, 2], [CW + 8, QY + 0.25, 120], [CW, QY + 0.25, 120]])}" fill="${P.stone.lit}"/>`);
    let co = '';
    for (let y = 0.4; y < QY; y += 0.4) co += pl(pr.poly([[CW, y, 2], [CW, y, 60]]));
    for (let z = 2.5; z < 40; z += 0.9) co += pl(pr.poly([[CW, 0, z], [CW, QY, z]]));
    o.push(`<path d="${co}" stroke="${P.stone.course}" stroke-width="1.4" opacity=".45"/>`);
    // damp tide band on the wall foot
    o.push(`<path d="${q([[CW - 0.01, 0, 2], [CW - 0.01, 0.9, 2], [CW - 0.01, 0.9, 120], [CW - 0.01, 0, 120]])}" fill="#4e5248" opacity=".45"/>`);
    // grate mouths: arched openings with bars, reed bundles stuffed in, bristling out
    let holes = '', bars = '', reeds = '';
    for (const z of [3.2, 5.2, 7.2, 14.4, 17.4, 20.4, 26]) {
      const a = pr(CW - 0.01, 0.35, z), b = pr(CW - 0.01, 0.35, z + 0.9), t = pr(CW - 0.01, 1.25, z);
      const ww = b[0] - a[0], hh = a[1] - t[1];
      holes += `M${r0(a[0])},${r0(a[1])}V${r0(t[1] + hh * 0.3)}Q${r0(a[0] + ww / 2)},${r0(t[1] - hh * 0.15)} ${r0(b[0])},${r0(t[1] + hh * 0.3 + (b[1] - a[1]))}V${r0(b[1])}Z`;
      for (let i = 1; i < 4; i++) { const xx = a[0] + ww * i / 4; bars += `M${r0(xx)},${r0(a[1] + (b[1] - a[1]) * i / 4)}V${r0(t[1] + hh * 0.18)}`; }
      for (let i = 0; i < 7; i++) { const xx = a[0] + ww * R.range(0.05, 0.95), yy = a[1] - hh * R.range(0.1, 0.6), L = hh * R.range(0.3, 0.6); reeds += `M${r0(xx)},${r0(yy)}l${f(-L * R.range(0.2, 0.8))},${f(-L * R.range(0.2, 0.7))}`; }
    }
    o.push(`<path d="${holes}" fill="#2a2824"/><path d="${holes}" fill="#a89a6a" opacity=".55" transform="translate(0 2)"/>`);
    o.push(`<path d="${reeds}" stroke="#c8b880" stroke-width="2" stroke-linecap="round"/><path d="${bars}" stroke="${P.iron}" stroke-width="3"/>`);
    // houses along the quay street (fronts facing the channel, in the shade of the noon haze)
    for (const [z0, z1, h, rf] of [[17.8, 22, 6.8, P.roof], [13.4, 17.4, 5.6, P.roofRed], [6.6, 10.4, 6.4, P.roof], [1.6, 6.2, 5.2, P.roofRed]]) {
      const x = CW + 1.6, d = 4.4, rise = 2;
      // side wall facing the channel, roof slope rising away from it, the near gable end
      o.push(`<path d="${q([[x, QY + 0.25, z0], [x, QY + h, z0], [x, QY + h, z1], [x, QY + 0.25, z1]])}" fill="${P.plasterShade}"/>`);
      o.push(`<path d="${q([[x - 0.2, QY + h - 0.1, z0 - 0.2], [x + d / 2, QY + h + rise, z0 - 0.2], [x + d / 2, QY + h + rise, z1 + 0.2], [x - 0.2, QY + h - 0.1, z1 + 0.2]])}" fill="${rf}"/>`);
      o.push(`<path d="${pz([pr(x, QY + 0.25, z0), pr(x, QY + h, z0), pr(x + d / 2, QY + h + rise, z0), pr(x + d, QY + h, z0), pr(x + d, QY + 0.25, z0)])}" fill="${P.plaster}"/>`);
      o.push(`<path d="${pl([pr(x - 0.2, QY + h - 0.1, z0 - 0.2), pr(x + d / 2, QY + h + rise, z0 - 0.2), pr(x + d + 0.2, QY + h - 0.1, z0 - 0.2)])}" fill="none" stroke="${P.roofShade}" stroke-width="5" stroke-linejoin="round"/>`);
      o.push(`<path d="${q([[x - 0.01, QY + 0.25, z0 + 0.6], [x - 0.01, QY + 2.2, z0 + 0.6], [x - 0.01, QY + 2.2, z0 + 1.4], [x - 0.01, QY + 0.25, z0 + 1.4]])}" fill="#4a3e36"/><path d="${q([[x - 0.01, QY + 3, z0 + 2.2], [x - 0.01, QY + 4.2, z0 + 2.2], [x - 0.01, QY + 4.2, z0 + 3.1], [x - 0.01, QY + 3, z0 + 3.1]])}" fill="#4a4a52"/>`);
      o.push(`<path d="${pz([pr(x + 1.2, QY + 2.6, z0 - 0.01), pr(x + 1.2, QY + 3.8, z0 - 0.01), pr(x + 2.2, QY + 3.8, z0 - 0.01), pr(x + 2.2, QY + 2.6, z0 - 0.01)])}" fill="#4a4a52"/>`);
    }
    S.add(o.join(''));
  }

  // --- under the first bridge's right abutment: the stone steps bared by the ebb, running down to the mud --------
  const BZ = 10.5; // the first bridge
  {
    const o = [];
    // the abutment: a stone pier block jutting from the quay under the bridge end
    o.push(`<path d="${q([[CW - 1.3, 0, BZ - 0.6], [CW - 1.3, QY + 0.2, BZ - 0.6], [CW, QY + 0.2, BZ - 0.6], [CW, 0, BZ - 0.6]])}" fill="${P.stone.lit}"/><path d="${q([[CW - 1.3, 0, BZ - 0.6], [CW - 1.3, QY + 0.2, BZ - 0.6], [CW - 1.3, QY + 0.2, BZ + 0.6], [CW - 1.3, 0, BZ + 0.6]])}" fill="${P.stone.shade}"/>`);
    // steps descending along the quay wall toward us, from the abutment down to the mud
    let st = '', stL = '';
    const n = 9;
    for (let i = 0; i < n; i++) {
      const y = QY - (i + 1) * (QY / n), z0 = BZ - 0.6 - i * 0.42, z1 = z0 - 0.42;
      st += q([[CW - 1.1, y, z0], [CW - 1.1, y, z1], [CW, y, z1], [CW, y, z0]]) + q([[CW - 1.1, y, z1], [CW - 1.1, y - QY / n, z1], [CW, y - QY / n, z1], [CW, y, z1]]);
      stL += pl(pr.poly([[CW - 1.1, y, z1], [CW, y, z1]]));
    }
    o.push(`<path d="${st}" fill="${P.stone.mid}"/><path d="${stL}" stroke="${P.stone.lit}" stroke-width="2.4"/>`);
    // weed on the lower steps
    o.push(`<path d="${q([[CW - 1.1, 0.02, BZ - 4.2], [CW - 1.1, 0.75, BZ - 3.6], [CW, 0.75, BZ - 3.6], [CW, 0.02, BZ - 4.2]])}" fill="#4e5a3e" opacity=".55"/>`);
    S.add(o.join(''));
  }

  // --- left: stilt houses on piles standing in the mud, their landings and ladders ---------------------------------
  {
    const o = [];
    const pal = { wall: P.plaster, wallShade: P.plasterShade, roof: P.roof, roofShade: P.roofShade, rim: '#ffffff', win: '#4a4a52', door: '#3a3432', wood: P.wood };
    for (const [z0, z1, h, rf] of [[13.8, 18.6, 3.4, P.roofRed], [6.6, 11, 3.2, P.roof], [1.2, 6.0, 3.6, P.roofRed]]) {
      const x = -CW - 0.3, fy = QY + 0.4, d = 4.2, rise = 1.8;
      // piles in the mud
      let pp = [];
      for (let z = z0; z <= z1 + 0.01; z += (z1 - z0) / 3) { const t = pr(x + 0.2, fy, z), b = pr(x + 0.2, 0, z); pp.push([t[0], t[1], b[1], Math.max(4, 0.22 * k(z)), pr(x, 1, z)[1]]); }
      o.push(piles(pp, P.wood));
      o.push(`<path d="${q([[x, fy, z0], [x, fy + h, z0], [x, fy + h, z1], [x, fy, z1]])}" fill="${P.plaster}"/><path d="${q([[x + 0.2, fy + h - 0.1, z0 - 0.2], [x - d / 2, fy + h + rise, z0 - 0.2], [x - d / 2, fy + h + rise, z1 + 0.2], [x + 0.2, fy + h - 0.1, z1 + 0.2]])}" fill="${rf}"/>`);
      o.push(`<path d="${pz([pr(x, fy, z0), pr(x, fy + h, z0), pr(x - d / 2, fy + h + rise, z0), pr(x - d, fy + h, z0), pr(x - d, fy, z0)])}" fill="${P.plasterShade}"/><path d="${pl([pr(x + 0.2, fy + h - 0.1, z0 - 0.2), pr(x - d / 2, fy + h + rise, z0 - 0.2), pr(x - d - 0.2, fy + h - 0.1, z0 - 0.2)])}" fill="none" stroke="${P.roofShade}" stroke-width="5" stroke-linejoin="round"/>`);
      o.push(`<path d="${q([[x, fy - 0.15, z0 - 0.3], [x, fy, z0 - 0.3], [x, fy, z1 + 0.3], [x, fy - 0.15, z1 + 0.3]])}" fill="${P.wood.shade}"/>`);
      o.push(`<path d="${q([[x + 0.01, fy, z0 + 1], [x + 0.01, fy + 2, z0 + 1], [x + 0.01, fy + 2, z0 + 1.8], [x + 0.01, fy, z0 + 1.8]])}" fill="#3a3432"/><path d="${q([[x + 0.01, fy + 1.2, z1 - 1.8], [x + 0.01, fy + 2.3, z1 - 1.8], [x + 0.01, fy + 2.3, z1 - 0.9], [x + 0.01, fy + 1.2, z1 - 0.9]])}" fill="#4a4a52"/>`);
      // a ladder down to the mud
      const l0 = pr(x + 0.1, fy, z0 + 1.2), l1 = pr(x + 0.5, 0, z0 + 1.0), l2 = pr(x + 0.1, fy, z0 + 1.6), l3 = pr(x + 0.5, 0, z0 + 1.4);
      o.push(`<path d="M${r0(l0[0])},${r0(l0[1])}L${r0(l1[0])},${r0(l1[1])}M${r0(l2[0])},${r0(l2[1])}L${r0(l3[0])},${r0(l3[1])}" stroke="${P.wood.shade}" stroke-width="4"/>`);
    }
    S.add(o.join(''));
  }

  // --- the first bridge: posts in the mud with notices pasted on them, the deck, the railing --------------------
  {
    const o = [];
    const kk = k(BZ), DY = QY + 0.3;
    const postsX = [-3.4, -1.15, 1.15, 3.4];
    let posts = '', lit = '', wet = '';
    for (const x of postsX) {
      const t = pr(x, DY, BZ), b = pr(x, 0, BZ), w = 0.34 * kk;
      posts += `M${r0(t[0] - w / 2)},${r0(t[1])}h${f(w)}V${r0(b[1])}h${f(-w)}z`;
      lit += `M${r0(t[0] - w / 2)},${r0(t[1])}h${f(w * 0.3)}V${r0(b[1])}h${f(-w * 0.3)}z`;
      wet += `M${r0(t[0] - w / 2)},${r0(pr(x, 0.9, BZ)[1])}h${f(w)}V${r0(b[1])}h${f(-w)}z`;
    }
    o.push(`<path d="${posts}" fill="${P.wood.mid}"/><path d="${lit}" fill="${P.wood.lit}"/><path d="${wet}" fill="${P.wood.wet}"/>`);
    // cross braces between the middle posts
    const br = (xa, xb) => { const a = pr(xa, DY - 0.2, BZ), b = pr(xb, 0.9, BZ), c = pr(xb, DY - 0.2, BZ), d = pr(xa, 0.9, BZ); return `M${r0(a[0])},${r0(a[1])}L${r0(b[0])},${r0(b[1])}M${r0(c[0])},${r0(c[1])}L${r0(d[0])},${r0(d[1])}`; };
    o.push(`<path d="${br(-3.4, -1.15)}${br(1.15, 3.4)}" stroke="${P.wood.shade}" stroke-width="${f(0.12 * kk)}"/>`);
    // missing-person notices pasted on the posts (one still dark with wet glue), more on the rail
    const npal = { paper: P.paper, ink: P.ink, pin: P.pin };
    let notes = '';
    for (const [i, x] of postsX.entries()) {
      const t = pr(x, 2.05, BZ), w = 0.3 * kk, h = 0.4 * kk;
      notes += notice(t[0] - w / 2, t[1], w, h, [-3, 2, -2, 4][i], npal);
      if (i === 1 || i === 2) notes += notice(t[0] - w / 2 + 2, t[1] + h * 1.1, w * 0.95, h * 0.9, [3, -4][i - 1], npal);
    }
    o.push(notes);
    { const t = pr(-1.15, 1.6, BZ), w = 0.3 * kk; o.push(`<path d="M${r0(t[0] - w / 2 + 3)},${r0(t[1] + 4)}h${f(w * 0.9)}v${f(w * 1.2)}h${f(-w * 0.9)}z" fill="#d8ccb0"/><path d="M${r0(t[0] - w / 2 + 3)},${r0(t[1] + 4)}h${f(w * 0.9)}v${f(w * 0.3)}h${f(-w * 0.9)}z" fill="#b4a684" opacity=".8"/>`); }
    // the deck spanning quay to stilt landing, its fascia and the railing on top
    const dl = pr(-CW - 0.6, DY, BZ), dr = pr(CW + 0.2, DY, BZ);
    o.push(`<path d="M${r0(dl[0])},${r0(dl[1])}H${r0(dr[0])}v${f(0.3 * kk)}H${r0(dl[0])}Z" fill="${P.wood.mid}"/><path d="M${r0(dl[0])},${r0(dl[1])}H${r0(dr[0])}" stroke="${P.wood.cap}" stroke-width="3"/>`);
    let ends = '';
    for (let x = -CW - 0.4; x < CW; x += 0.36) { const p = pr(x, DY, BZ); ends += `M${r0(p[0])},${r0(p[1])}v${f(0.3 * kk)}`; }
    o.push(`<path d="${ends}" stroke="${P.wood.shade}" stroke-width="1.4" opacity=".6"/>`);
    let rail = '';
    for (let x = -CW - 0.4; x <= CW + 0.1; x += 1.3) { const t = pr(x, DY + 1.05, BZ), b = pr(x, DY, BZ); rail += `M${r0(t[0])},${r0(t[1])}V${r0(b[1])}`; }
    const r1 = pr(-CW - 0.6, DY + 1.0, BZ), r2 = pr(CW + 0.2, DY + 1.0, BZ), r3 = pr(-CW - 0.6, DY + 0.5, BZ), r4 = pr(CW + 0.2, DY + 0.5, BZ);
    rail += `M${r0(r1[0])},${r0(r1[1])}H${r0(r2[0])}M${r0(r3[0])},${r0(r3[1])}H${r0(r4[0])}`;
    o.push(`<path d="${rail}" stroke="${P.wood.shade}" stroke-width="${f(0.1 * kk)}" stroke-linecap="round"/><path d="M${r0(r1[0])},${r0(r1[1] - 2)}H${r0(r2[0])}" stroke="${P.wood.cap}" stroke-width="2" opacity=".8"/>`);
    // more notices along the rail
    let rn = '';
    for (const x of [-3.9, -2.4, 2.1, 3.0]) { const t = pr(x, DY + 0.95, BZ), w = 0.26 * kk; rn += notice(t[0], t[1], w, w * 1.3, R.range(-6, 6), npal); }
    o.push(rn);
    // a tide lamp hanging under the bridge middle (unlit at noon)
    const lp = pr(0, DY - 0.1, BZ);
    o.push(tideLamp(lp[0], lp[1] + 18, 1.3, { iron: P.iron, glass: '#5a6066', glow: '#ffd890', core: '#fff', glint: '#e8eef0' }, false));
    S.add(o.join(''));
  }

  // --- the fishing boats lying on the mud (left, near), bows with dark tide lamps on little posts ---------------
  {
    const boat = (x, z, len, tilt, rot) => {
      const kk = k(z), a = pr(x, 0, z), L = len * kk, Hh = 0.75 * kk, s = [];
      const g = `rotate(${rot} ${r0(a[0])} ${r0(a[1])})`;
      s.push(`<g transform="${g}">`);
      s.push(`<path d="M${r0(a[0] - L / 2)},${r0(a[1] - Hh)}C${r0(a[0] - L * 0.3)},${r0(a[1] + Hh * 0.1)} ${r0(a[0] + L * 0.3)},${r0(a[1] + Hh * 0.1)} ${r0(a[0] + L / 2)},${r0(a[1] - Hh * 1.3)}L${r0(a[0] + L * 0.44)},${r0(a[1] - Hh * 1.2)}C${r0(a[0] + L * 0.2)},${r0(a[1] - Hh * 0.5)} ${r0(a[0] - L * 0.3)},${r0(a[1] - Hh * 0.4)} ${r0(a[0] - L * 0.46)},${r0(a[1] - Hh * 0.95)}Z" fill="${P.wood.mid}"/>`);
      s.push(`<path d="M${r0(a[0] - L / 2)},${r0(a[1] - Hh)}C${r0(a[0] - L * 0.3)},${r0(a[1] - Hh * 0.6)} ${r0(a[0] + L * 0.3)},${r0(a[1] - Hh * 0.7)} ${r0(a[0] + L / 2)},${r0(a[1] - Hh * 1.3)}" fill="none" stroke="${P.wood.cap}" stroke-width="${f(0.05 * kk)}"/>`);
      s.push(`<path d="M${r0(a[0] - L * 0.4)},${r0(a[1] - Hh * 0.55)}C${r0(a[0] - L * 0.2)},${r0(a[1] - Hh * 0.1)} ${r0(a[0] + L * 0.2)},${r0(a[1] - Hh * 0.15)} ${r0(a[0] + L * 0.42)},${r0(a[1] - Hh * 0.8)}" fill="none" stroke="${P.wood.shade}" stroke-width="${f(0.04 * kk)}"/>`);
      // the bow post with its unlit tide lamp
      const bp = [a[0] + L * 0.47, a[1] - Hh * 1.25];
      s.push(`<path d="M${r0(bp[0])},${r0(bp[1] + Hh * 0.2)}v${f(-0.9 * kk - Hh * 0.2)}h${f(-0.25 * kk)}" fill="none" stroke="${P.wood.shade}" stroke-width="${f(0.09 * kk)}" stroke-linejoin="round"/>`);
      s.push(tideLamp(bp[0] - 0.25 * kk, bp[1] - 0.9 * kk + 0.12 * kk, 0.018 * kk, { iron: P.iron, glass: '#5a6066', glow: '#ffd890', core: '#fff', glint: '#e8eef0' }, false));
      // a coil of rope in the boat, an oar
      s.push(`<ellipse cx="${r0(a[0] - L * 0.1)}" cy="${r0(a[1] - Hh * 0.55)}" rx="${f(0.25 * kk)}" ry="${f(0.08 * kk)}" fill="none" stroke="#a8946a" stroke-width="${f(0.04 * kk)}"/><path d="M${r0(a[0] - L * 0.35)},${r0(a[1] - Hh * 0.8)}l${f(L * 0.5)},${f(-Hh * 0.2)}" stroke="${P.wood.lit}" stroke-width="${f(0.05 * kk)}"/>`);
      s.push(`</g>`);
      s.push(`<ellipse cx="${r0(a[0])}" cy="${r0(a[1] + 2)}" rx="${f(L * 0.5)}" ry="${f(0.12 * kk)}" fill="#2e2c28" opacity=".45"/>`);
      return s.join('');
    };
    S.add(boat(-3.2, 7.4, 3.6, 0, 4) + boat(-2.6, 13.4, 3.4, 0, -3));
    S.add(boat(3.4, 15.4, 3.2, 0, 6));
  }

  // --- the fog: only a thin layer lying on the water down the channel ---------------------------------------------
  S.add(`<g filter="${S.blur(3)}"><path d="${pz([pr(-CW, 0.4, 120), pr(CW, 0.4, 120), pr(CW, 0.4, 6), pr(-CW, 0.4, 6)])}" fill="${P.fog}" opacity=".35"/><path d="${band(500, 1100, VP[1] + 34, 10, R, 4)}" fill="${P.fog}" opacity=".8"/><path d="${band(300, 1300, VP[1] + 80, 14, R, 6)}" fill="${P.fog}" opacity=".55"/></g>`);

  // --- grading: noon haze, darker corners, the calm channel floor under the dialogue box --------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#fffbe8', 0.12], [0.5, '#fffbe8', 0], [1, '#2a2e2c', 0.2]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.5, '#2a2e2c', 0], [1, '#2a2e2c', 0.4]], 'cx="0.5" cy="0.45" r="0.78"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#2a2c28', 0], [1, '#2a2c28', 0.62]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 冒险者公会雾港分会 — the same guild furniture as 晨钟镇 (guild-hall: counter, notice board, ledger shelves,
// lantern rings, the sword-and-bell banner), recoloured and rebuilt for a harbour: silver-grey timber, the long
// counter set against a row of windows that open on the channel and its piles (flat grey water, no reflections),
// and the whole left wall papered with missing-person notices. Foggy daylight through the windows. No mirror.
// ---------------------------------------------------------------------------------------------
const GUILD = {
  wallBack: [[0, '#8a8e8e'], [1, '#5a6066']], wallL: [[0, '#4a5058'], [1, '#727a80']], wallR: [[0, '#6a7076'], [1, '#3e444a']],
  ceil: '#2a2e34', beam: '#3a3e44', floor: [[0, '#6a6e6c'], [1, '#22262a']], plank: '#1e2226',
  wood: '#5a5e62', woodLit: '#9aa0a4', woodDark: '#33373c', counterTop: '#a8aaa4',
  window: '#dfe2de', water: '#9aa6a8', pile: '#4e5254', fog: '#eef0ec', paper: '#ece6d6', paperOld: '#d6ccb4', ink: '#3a3632', pin: '#8a3a2a',
  lamp: '#ffd890', banner: '#4a6a8a',
};

function harborGuild() {
  const S = new Scene('sbHarborGuild', '冒险者公会雾港分会：临水的柜台与窗外的水道和木桩，贴满寻人单的一面墙，账册架与公会旗', 6801);
  const R = S.R;
  const pr = persp({ vp: [800, 400], F: 760, eye: 1.6 });
  const X0 = -5, X1 = 5, CEIL = 4.2, BACK = 12, NEAR = 1.2;
  const q = (pts) => pr.quad(pts);
  const P = GUILD;
  S.add(`<rect width="${W}" height="${H}" fill="#1e2226"/>`);
  S.add(`<path d="${q([[X0, 0, BACK], [X0, CEIL, BACK], [X1, CEIL, BACK], [X1, 0, BACK]])}" fill="${S.lin(P.wallBack)}"/>`);
  S.add(`<path d="${q([[X0, 0, NEAR], [X0, CEIL, NEAR], [X0, CEIL, BACK], [X0, 0, BACK]])}" fill="${S.lin(P.wallL, 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="${q([[X1, 0, NEAR], [X1, CEIL, NEAR], [X1, CEIL, BACK], [X1, 0, BACK]])}" fill="${S.lin(P.wallR, 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  S.add(`<path d="${q([[X0, CEIL, NEAR], [X0, CEIL, BACK], [X1, CEIL, BACK], [X1, CEIL, NEAR]])}" fill="${P.ceil}"/>`);
  S.add(`<path d="${q([[X0, 0, NEAR], [X0, 0, BACK], [X1, 0, BACK], [X1, 0, NEAR]])}" fill="${S.lin(P.floor, `gradientUnits="userSpaceOnUse" x1="0" y1="${pr(0, 0, BACK)[1]}" x2="0" y2="${H}"`)}"/>`);
  let pk = '';
  for (let x = X0 + 0.6; x < X1; x += 0.6) pk += pl(pr.poly([[x, 0, NEAR], [x, 0, BACK]]));
  for (let y = 0.4; y < CEIL; y += 0.4) pk += pl(pr.poly([[X1, y, NEAR], [X1, y, BACK]]));
  S.add(`<path d="${pk}" stroke="${P.plank}" stroke-width="2" opacity=".35"/>`);
  let beams = '';
  for (const z of [2.5, 5, 7.5, 10, 11.9]) beams += pz(pr.poly([[X0, CEIL, z], [X1, CEIL, z], [X1, CEIL - 0.3, z], [X0, CEIL - 0.3, z]]));
  S.add(`<path d="${beams}" fill="${P.beam}"/>`);

  // --- the back wall: a row of tall windows over the water — the channel, piles, a stilt house opposite in fog ----
  {
    const z = BACK - 0.01, wy0 = 1.25, wy1 = 3.55;
    const panes = [[-3.6, -1.4], [-1.1, 1.1], [1.4, 3.6]];
    for (const [a, b] of panes) {
      // the view: fog sky, a far stilt house, flat grey water, a row of piles (no reflections)
      S.add(`<path d="${q([[a, wy0, z], [a, wy1, z], [b, wy1, z], [b, wy0, z]])}" fill="${S.lin([[0, '#e6e8e4'], [0.6, P.fog], [1, '#c8ccc8']])}"/>`);
      const wl = pr(a, 1.75, z), wr = pr(b, 1.75, z), bl = pr(a, wy0, z);
      S.add(`<path d="M${r0(wl[0])},${r0(wl[1])}H${r0(wr[0])}V${r0(bl[1])}H${r0(wl[0])}Z" fill="${P.water}"/>`);
      S.add(`<path d="M${r0(wl[0] + 10)},${r0(wl[1] + 8)}h40M${r0(wl[0] + 70)},${r0(wl[1] + 16)}h30M${r0(wr[0] - 60)},${r0(wl[1] + 10)}h36" stroke="#d8e0e0" stroke-width="1.5" opacity=".7"/>`);
    }
    // the stilt house across the channel (behind the middle and right panes) and the piles in the water
    const hx0 = pr(-0.6, 2.0, z)[0], hx1 = pr(2.6, 2.0, z)[0], hTop = pr(0, 3.0, z)[1], hBase = pr(0, 2.0, z)[1], wl = pr(0, 1.75, z)[1];
    S.add(`<path d="M${r0(hx0)},${r0(hBase)}V${r0(hTop)}L${r0((hx0 + hx1) / 2)},${r0(hTop - 26)}L${r0(hx1)},${r0(hTop)}V${r0(hBase)}Z" fill="#b8bcbc"/><path d="M${r0(hx0 + 30)},${r0(hBase)}v-24h18v24z" fill="#8a9090"/>`);
    let stl = '';
    for (let x = hx0 + 6; x < hx1; x += 34) stl += `M${r0(x)},${r0(hBase)}V${r0(wl + 6)}`;
    S.add(`<path d="${stl}" stroke="#9aa0a0" stroke-width="4"/>`);
    let pp = '';
    for (const x of [-3.2, -2.2, -0.4, 0.8, 2.0, 3.2]) { const t = pr(x, 2.1, z), b = pr(x, 1.35, z); pp += `M${r0(t[0])},${r0(t[1])}V${r0(b[1])}`; }
    S.add(`<path d="${pp}" stroke="${P.pile}" stroke-width="9"/><path d="${pp}" stroke="#2e3234" stroke-width="9" stroke-dasharray="0 22 30 100" opacity=".6"/>`);
    // window frames and mullions
    let fr = '';
    for (const [a, b] of panes) {
      fr += pz(pr.poly([[a - 0.08, wy0 - 0.08, z], [a - 0.08, wy1 + 0.08, z], [b + 0.08, wy1 + 0.08, z], [b + 0.08, wy0 - 0.08, z]])) + pz(pr.poly([[a, wy0, z], [b, wy0, z], [b, wy1, z], [a, wy1, z]]));
    }
    S.add(`<path d="${fr}" fill="${P.woodDark}" fill-rule="evenodd"/>`);
    let mul = '';
    for (const [a, b] of panes) { mul += pl(pr.poly([[(a + b) / 2, wy0, z], [(a + b) / 2, wy1, z]])) + pl(pr.poly([[a, 2.4, z], [b, 2.4, z]])); }
    S.add(`<path d="${mul}" stroke="${P.woodDark}" stroke-width="5"/>`);
    // pale light falling in from the windows onto the counter and floor
    S.add(`<path d="${pz([pr(-3.6, wy1, z), pr(3.6, wy1, z), pr(3.2, 0, 7.4), pr(-3.2, 0, 7.4)])}" fill="#f2f4f0" opacity=".1" filter="${S.blur(2)}"/>`);
    // the guild banner between the windows (left), the sword-and-bell emblem
    const a = pr(-4.9, 3.9, z), b = pr(-3.8, 2.6, z);
    S.add(`<path d="M${r0(a[0])},${r0(a[1])}H${r0(b[0])}V${r0(b[1])}l${r0((a[0] - b[0]) / 2)},${r0(-16)}l${r0((a[0] - b[0]) / 2)},16z" fill="${P.banner}"/>${swordBell((a[0] + b[0]) / 2, a[1] + 36, 0.75)}`);
  }

  // --- the long counter along the windows, by the water: ledgers, inkwell, a brass hand bell, crates of crystal ----
  {
    const cz0 = 10.4, cz1 = 11.2, cx0 = -3.9, cx1 = 3.9, ch = 1.15;
    S.add(`<path d="${q([[cx0, 0, cz0], [cx0, ch, cz0], [cx1, ch, cz0], [cx1, 0, cz0]])}" fill="${P.wood}"/><path d="${q([[cx0, ch, cz0], [cx0, ch, cz1], [cx1, ch, cz1], [cx1, ch, cz0]])}" fill="${P.counterTop}"/>`);
    let pn = '';
    for (let x = cx0 + 0.9; x < cx1; x += 0.9) pn += pz(pr.poly([[x, 0.15, cz0 - 0.01], [x, ch - 0.15, cz0 - 0.01], [x + 0.7, ch - 0.15, cz0 - 0.01], [x + 0.7, 0.15, cz0 - 0.01]]));
    S.add(`<path d="${pn}" fill="${P.woodDark}" opacity=".7"/><path d="${pl(pr.poly([[cx0, ch, cz0], [cx1, ch, cz0]]))}" stroke="${P.woodLit}" stroke-width="3"/>`);
    const k = 760 / 10.8;
    { const p = pr(-2.6, ch, 10.8); S.add(`<path d="M${r0(p[0])},${r0(p[1])}h${r0(0.6 * k)}v${r0(-0.08 * k)}h${r0(-0.6 * k)}z" fill="#ece4d0"/><path d="M${r0(p[0] + 0.05 * k)},${r0(p[1] - 0.08 * k)}h${r0(0.5 * k)}v${r0(-0.1 * k)}h${r0(-0.5 * k)}z" fill="#3a4a5a"/>`); }
    { const p = pr(-1.3, ch, 10.7); S.add(`<path d="M${r0(p[0])},${r0(p[1])}v${r0(-0.08 * k)}h${r0(0.1 * k)}v${r0(0.08 * k)}z" fill="#1a1a2a"/><path d="M${r0(p[0] + 0.05 * k)},${r0(p[1] - 0.08 * k)}q${r0(0.1 * k)},${r0(-0.3 * k)} ${r0(0.25 * k)},${r0(-0.45 * k)}q${r0(-0.06 * k)},${r0(0.22 * k)} ${r0(-0.22 * k)},${r0(0.44 * k)}z" fill="#f4f0e8"/>`); }
    { const p = pr(0.4, ch, 10.8); S.add(`<path d="M${r0(p[0] - 0.12 * k)},${r0(p[1])}q0,${r0(-0.22 * k)} ${r0(0.12 * k)},${r0(-0.22 * k)}q${r0(0.12 * k)},0 ${r0(0.12 * k)},${r0(0.22 * k)}z" fill="#d8b860"/><path d="M${r0(p[0])},${r0(p[1] - 0.22 * k)}v${r0(-0.06 * k)}" stroke="#d8b860" stroke-width="3"/>`); }
    // a crate of tide crystals at the end of the counter (clear, a faint cyan glint)
    { const p = pr(2.4, ch, 10.8); S.add(`<path d="M${r0(p[0])},${r0(p[1])}h${r0(0.7 * k)}v${r0(-0.22 * k)}h${r0(-0.7 * k)}z" fill="#6a5a48"/>`); let c = ''; for (let i = 0; i < 6; i++) c += `M${r0(p[0] + (0.08 + i * 0.1) * k)},${r0(p[1] - 0.22 * k)}l${r0(0.03 * k)},${r0(-0.1 * k)}l${r0(0.03 * k)},${r0(0.1 * k)}z`; S.add(`<path d="${c}" fill="#e6f4f8"/>`); }
  }

  // --- the left wall: covered in missing-person notices, old and new, overlapping, a few names circled ---------
  {
    const o = [];
    let papers = '', marks = '', pins = '';
    const n = 120;
    for (let i = 0; i < n; i++) {
      const z = R.range(2.2, 10.8), y = R.range(0.7, 3.2), w = R.range(0.28, 0.42), h = w * R.range(1.15, 1.4), tilt = R.range(-0.06, 0.06);
      const pts = [[X0 + 0.02, y + h, z], [X0 + 0.02, y + h + tilt, z + w], [X0 + 0.02, y + tilt, z + w], [X0 + 0.02, y, z]];
      const old = R() < 0.45;
      papers += `<path d="${pr.quad(pts)}" fill="${old ? P.paperOld : P.paper}"/>`;
      // the "photo-less" sketch box and lines of writing (abstract strokes, never text)
      const kz = 760 / (z + w / 2);
      const c = pr(X0 + 0.02, y + h * 0.72, z + w * 0.5);
      marks += `M${r0(c[0] - 0.06 * kz)},${r0(c[1] - 0.06 * kz)}h${f(0.12 * kz)}v${f(0.1 * kz)}h${f(-0.12 * kz)}z`;
      for (const yy of [0.42, 0.3, 0.18]) { const a = pr(X0 + 0.02, y + h * yy, z + w * 0.15), b = pr(X0 + 0.02, y + h * yy, z + w * (0.7 + R.range(0, 0.15))); marks += `M${r0(a[0])},${r0(a[1])}L${r0(b[0])},${r0(b[1])}`; }
      const t = pr(X0 + 0.02, y + h * 0.95, z + w * 0.5);
      pins += circ(t[0], t[1], Math.max(1.2, 0.02 * kz));
    }
    o.push(papers, `<path d="${marks}" fill="none" stroke="${P.ink}" stroke-width="1.3" opacity=".5"/>`, `<path d="${pins}" fill="${P.pin}"/>`);
    // a wooden frame round the notice wall, a lantern ring near it
    o.push(`<path d="${pl(pr.poly([[X0 + 0.03, 3.35, 2.1], [X0 + 0.03, 3.35, 11.1]]))}${pl(pr.poly([[X0 + 0.03, 0.62, 2.1], [X0 + 0.03, 0.62, 11.1]]))}" stroke="${P.woodDark}" stroke-width="6"/>`);
    S.add(o.join(''));
    // a bench under the notices
    S.add(`<path d="${q([[X0 + 0.1, 0.48, 2.6], [X0 + 0.1, 0.48, 7.2], [X0 + 0.7, 0.48, 7.2], [X0 + 0.7, 0.48, 2.6]])}" fill="${P.wood}"/><path d="${q([[X0 + 0.7, 0.48, 2.6], [X0 + 0.7, 0.48, 7.2], [X0 + 0.7, 0.36, 7.2], [X0 + 0.7, 0.36, 2.6]])}" fill="${P.woodDark}"/>`);
  }

  // --- the right wall: shelves of ledgers and report folders, coils of rope and a boat hook, the stair up ------------
  {
    let shelf = '';
    for (const y of [1.2, 1.9, 2.6, 3.3]) shelf += pz(pr.poly([[X1 - 0.02, y, 3.4], [X1 - 0.02, y, 8.6], [X1 - 0.02, y - 0.06, 8.6], [X1 - 0.02, y - 0.06, 3.4]]));
    S.add(`<path d="${shelf}" fill="${P.woodDark}"/>`);
    let books = '';
    const bc = ['#5a6a7a', '#7a6a5a', '#4a5a4a', '#8a7a6a', '#6a5a6a'];
    for (let r = 0; r < 3; r++) for (let i = 0; i < 18; i++) {
      const z = 3.5 + i * 0.28, y = [1.2, 1.9, 2.6][r], p = pr(X1 - 0.05, y, z), p2 = pr(X1 - 0.05, y, z + 0.2), hh = R.range(0.38, 0.55) * (760 / z);
      books += `<path d="M${r0(p[0])},${r0(p[1])}L${r0(p2[0])},${r0(p2[1])}l0,${r0(-hh * z / (z + 0.2))}L${r0(p[0])},${r0(p[1] - hh)}z" fill="${bc[(i + r) % bc.length]}"/>`;
    }
    S.add(books);
    // rope coils and the boat hook on pegs by the door end
    for (const z of [2.2, 2.9]) { const p = pr(X1 - 0.05, 2.4, z), kk = 760 / z; S.add(`<ellipse cx="${r0(p[0])}" cy="${r0(p[1])}" rx="${r0(0.1 * kk)}" ry="${r0(0.18 * kk)}" fill="none" stroke="#b8a478" stroke-width="${f(0.05 * kk)}"/>`); }
    { const a = pr(X1 - 0.06, 0.2, 9.4), b = pr(X1 - 0.06, 3.4, 9.0); S.add(`<path d="M${r0(a[0])},${r0(a[1])}L${r0(b[0])},${r0(b[1])}" stroke="#7a6a52" stroke-width="5"/><path d="M${r0(b[0])},${r0(b[1])}q-12,-6 -14,6" fill="none" stroke="#5a5e66" stroke-width="5"/>`); }
    // the stair up at the back right
    let st = '';
    for (let i = 0; i < 9; i++) { const y = i * 0.4, z = 11.8 - i * 0.12; st += pz(pr.poly([[X1 - 1.6, y + 0.4, z], [X1 - 0.1, y + 0.4, z], [X1 - 0.1, y, z], [X1 - 1.6, y, z]])); }
    S.add(`<path d="${st}" fill="${P.wood}"/><path d="${pl(pr.poly([[X1 - 1.6, 0.9, 11.8], [X1 - 1.6, 4.1, 10.8]]))}" stroke="${P.woodDark}" stroke-width="6"/>`);
  }

  // --- a table with two stools in the middle, a lantern ring hanging over it ---------------------------------------
  {
    const x = 0.6, z = 6.4;
    S.add(`<path d="${q([[x - 0.8, 0.8, z - 0.5], [x - 0.8, 0.8, z + 0.5], [x + 0.8, 0.8, z + 0.5], [x + 0.8, 0.8, z - 0.5]])}" fill="${P.woodLit}"/><path d="${q([[x - 0.8, 0.8, z - 0.5], [x + 0.8, 0.8, z - 0.5], [x + 0.8, 0.72, z - 0.5], [x - 0.8, 0.72, z - 0.5]])}" fill="${P.woodDark}"/>`);
    S.add(`<path d="${q([[x - 0.1, 0, z], [x - 0.1, 0.72, z], [x + 0.1, 0.72, z], [x + 0.1, 0, z]])}" fill="${P.woodDark}"/>`);
    for (const dx of [-1.2, 1.2]) S.add(`<path d="${q([[x + dx - 0.2, 0.45, z - 0.2], [x + dx - 0.2, 0.45, z + 0.2], [x + dx + 0.2, 0.45, z + 0.2], [x + dx + 0.2, 0.45, z - 0.2]])}" fill="${P.wood}"/><path d="${q([[x + dx - 0.05, 0, z], [x + dx - 0.05, 0.45, z], [x + dx + 0.05, 0.45, z], [x + dx + 0.05, 0, z]])}" fill="${P.woodDark}"/>`);
    // a report folder and a covered dish on the table
    const p = pr(x - 0.4, 0.8, z), kk = 760 / z;
    S.add(`<path d="M${r0(p[0])},${r0(p[1])}h${r0(0.5 * kk)}l${r0(0.05 * kk)},${r0(-0.04 * kk)}h${r0(-0.5 * kk)}z" fill="#6a5a3a"/>`);
    for (const [lx, lz] of [[-1.2, 4.4], [1.8, 8.4]]) {
      const a = pr(lx, CEIL - 0.3, lz), b = pr(lx, 2.9, lz), kk2 = 760 / lz;
      S.add(`<path d="M${r0(a[0])},${r0(a[1])}V${r0(b[1])}" stroke="#14181c" stroke-width="2"/><ellipse cx="${r0(b[0])}" cy="${r0(b[1])}" rx="${r0(0.5 * kk2)}" ry="${r0(0.1 * kk2)}" fill="none" stroke="#14181c" stroke-width="4"/><circle cx="${r0(b[0])}" cy="${r0(b[1])}" r="${r0(0.6 * kk2)}" fill="${S.rad([[0, P.lamp, 0.4], [1, P.lamp, 0]])}"/>`);
      for (const dx of [-0.4, 0, 0.4]) { const c = pr(lx + dx, 2.95, lz); S.add(`<path d="M${r0(c[0])},${r0(c[1])}q-3,-8 0,-14q3,6 0,14z" fill="#ffe2a0"/>`); }
    }
  }

  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.4, '#0e1216', 0], [1, '#0e1216', 0.62]], 'cx="0.5" cy="0.42" r="0.75"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#0e1216', 0], [1, '#0e1216', 0.66]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 旧浴场后沟与排水区东口 — one wide view in two halves along the back ditch.
//   left:  the old bathhouse's back wall with its smoking brick chimney, the boiler-room door glowing and the
//          woodpile beside it, the narrow plank bridge over the ditch, the little iron grate in the ditch side,
//          ivy climbing the ditch wall;
//   right: the stone mouth of the east outfall in the embankment, its iron grate missing two bars and patched
//          with nailed boards, the boardwalk laid over the stone mouth with a coil of rope and two punt poles,
//          a post with a tide lamp, a length of loose railing, the fish stall shuttered for the night.
// night = true: the tide has come up over the grate, and the guild's lamps stand in a row along the boardwalk.
// No reflections, mirrors or figures, and nothing root-like (the roots only ever appear as animated props).
// ---------------------------------------------------------------------------------------------
const DRAIN = {
  dusk: { sky: [[0, '#3a3456'], [0.2, '#6a4a6a'], [0.36, '#b8686a'], [0.46, '#e8946a'], [0.52, '#f4b47a'], [1, '#2a2230']], glow: '#ffc88a', farTown: '#6a4a5a', rim: '#ffb07a' },
  night: { sky: [[0, '#0a0c1a'], [0.25, '#161a30'], [0.45, '#262c4a'], [0.52, '#2c3250'], [1, '#090a12']], glow: '#5a6a9a', farTown: '#1c2034', rim: '#8aa0d0' },
  brick: { lit: '#9a6252', mid: '#7a4a3e', shade: '#5a3630', course: '#3a2420' },
  plaster: '#b4a08e', plasterShade: '#86766a', stone: { lit: '#a8a094', mid: '#847c72', shade: '#5a544e', course: '#3e3a36' },
  wood: { lit: '#8a7462', mid: '#64544a', shade: '#463a34', dark: '#2a221e' },
  water: '#3a4450', waterHi: '#5a6a7c', ivy: '#3e5a3a', ivyLit: '#6a8a52', iron: '#26282c', fire: '#ffa850', lamp: '#ffd08a',
};

function harborDrain(night) {
  const S = new Scene(night ? 'sbDrainNight' : 'sbDrainDusk', night
    ? '旧浴场后沟与排水区东口·入夜：潮水淹过东口的铁栅，分会的灯沿着栈道排开；左边旧浴场后墙、烟囱、烧水间门口与柴堆、沟上的窄木桥'
    : '旧浴场后沟与排水区东口·黄昏：左边旧浴场后墙与冒烟的烟囱、烧水间门口与柴堆、沟上的窄木桥、沟边的小铁栅与爬藤的沟墙；右边石砌排水口、缺两根条以木板钉补的铁栅、石口上的木栈道、缆绳与撑篙、挂潮灯的柱子、松了的栏杆、收摊的鱼摊', 6901);
  const R = S.R, R2 = rng(6902);
  const T = night ? DRAIN.night : DRAIN.dusk;
  const dk = (c, k = 0.66) => (night ? mix(c, '#0c0e1a', k) : c);
  const RIM = 520, WTOP = 430, BW = 446, KERB = 650; // ditch's far rim, embankment top, boardwalk deck, near kerb
  const ATOP = 538, ASPR = 584, ABOT = 650, MX0 = 880, MX1 = 1120; // the outfall arch: crown, springing, foot
  const LVL = night ? 530 : 604; // water level on the far wall: the night tide stands over the whole grate

  // --- sky and the far harbour beyond the boardwalk --------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(T.sky)}"/>`);
  S.add(`<circle cx="1180" cy="400" r="760" fill="${S.rad([[0, T.glow, night ? 0.25 : 0.75], [0.15, T.glow, night ? 0.1 : 0.35], [1, T.glow, 0]])}"/>`);
  if (night) S.add(stars(R2, 70, [0, 0, W, 280], { maxR: 1.2, fill: '#dce4ff', op: [0.15, 0.7] }));
  const cc = night ? { lit: '#2a3050', shade: '#141828', rim: '#6a7aa8' } : { lit: '#c4787a', shade: '#5a3a56', rim: '#ffc090' };
  S.add(cloud(R, 820, 150, 360, 50, cc, { bumps: 7 }) + cloud(R, 1280, 100, 260, 38, cc, { bumps: 6 }) + cloud(R, 700, 260, 200, 26, cc, { bumps: 5 }));
  S.add(`<path d="${band(600, 1700, 300, 8, R)}" fill="${night ? '#3a4266' : '#ffc89a'}" opacity=".5"/>`);
  {
    let rf = '';
    for (let i = 0; i < 16; i++) { const x = 760 + i * 56 + R.range(-10, 10), w = R.range(36, 56), h = R.range(20, 46), y = 408 - R.range(0, 14); rf += `M${r0(x)},${r0(y)}v${r0(-h * 0.5)}l${r0(w / 2)},${r0(-h * 0.5)}l${r0(w / 2)},${r0(h * 0.5)}v${r0(h * 0.5)}z`; }
    S.add(`<path d="${rf}" fill="${T.farTown}"/><path d="M760,412H1620v20H760z" fill="${T.farTown}"/>`);
    if (night) { let wn = ''; for (let i = 0; i < 12; i++) { const x = R2.range(780, 1600), y = R2.range(380, 406); wn += `M${r0(x)},${r0(y)}h5v6h-5z`; } S.add(`<path d="${wn}" fill="${DRAIN.lamp}" opacity=".8"/>`); }
  }

  // --- right: the stone embankment with the outfall mouth -------------------------------------------------------
  {
    const st = Object.fromEntries(Object.entries(DRAIN.stone).map(([k, v]) => [k, dk(v, 0.55)]));
    const o = [];
    o.push(`<path d="M640,${ABOT + 10}V${WTOP}H1620V${ABOT + 10}Z" fill="${st.mid}"/><path d="M640,${ABOT + 10}V${WTOP}H700V${ABOT + 10}Z" fill="${st.lit}" opacity=".5"/>`);
    let co = '';
    for (let y = WTOP + 16, kk = 0; y < ABOT + 10; y += 16, kk++) { co += `M640,${y}H1620`; for (let x = 640 + (kk % 2) * 24; x < 1620; x += 48) co += `M${x},${y - 16}v16`; }
    o.push(`<path d="${co}" stroke="${st.course}" stroke-width="1.6" opacity=".45"/>`);
    // the mouth: a segmental arch of dressed voussoirs over a black throat
    const cx = (MX0 + MX1) / 2, rx = (MX1 - MX0) / 2, ry = ASPR - ATOP;
    o.push(`<path d="M${MX0 - 20},${ABOT}V${ASPR}A${rx + 20},${ry + 20} 0 0 1 ${MX1 + 20},${ASPR}V${ABOT}Z" fill="${st.lit}"/>`);
    let vs = '';
    for (let i = 0; i <= 10; i++) { const a = Math.PI + i * Math.PI / 10; vs += `M${r0(cx + Math.cos(a) * rx)},${r0(ASPR + Math.sin(a) * ry)}L${r0(cx + Math.cos(a) * (rx + 20))},${r0(ASPR + Math.sin(a) * (ry + 20))}`; }
    o.push(`<path d="${vs}" stroke="${st.course}" stroke-width="2" opacity=".6"/>`);
    o.push(`<path d="M${MX0},${ABOT}V${ASPR}A${rx},${ry} 0 0 1 ${MX1},${ASPR}V${ABOT}Z" fill="#0c0c10"/>`);
    // the grate: nine bars with two missing in the middle, two old boards nailed across the gap
    let bars = '';
    const nb = 9;
    for (let i = 1; i <= nb; i++) {
      if (i === 4 || i === 5) continue;
      const x = MX0 + (MX1 - MX0) * i / (nb + 1), yt = ASPR - ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
      bars += `M${r0(x)},${r0(yt + 2)}V${ABOT}`;
    }
    bars += `M${MX0},${ASPR + 6}H${MX1}M${MX0},${ABOT - 16}H${MX1}`;
    o.push(`<path d="${bars}" stroke="${DRAIN.iron}" stroke-width="7"/><path d="${bars}" stroke="${night ? '#4a5470' : '#a88a74'}" stroke-width="1.6" opacity=".6" transform="translate(-2 0)"/>`);
    const bx = MX0 + (MX1 - MX0) * 3.6 / 10, bw = (MX1 - MX0) * 2.0 / 10;
    o.push(`<path d="M${r0(bx - 10)},${ATOP + 20}l${r0(bw + 20)},-6v20l${r0(-bw - 20)},6zM${r0(bx - 12)},${ASPR + 22}l${r0(bw + 24)},5v20l${r0(-bw - 24)},-5z" fill="${dk(DRAIN.wood.lit, 0.55)}"/>`);
    let nl = '';
    for (const [x, y] of [[bx - 4, ATOP + 30], [bx + bw + 4, ATOP + 24], [bx - 6, ASPR + 32], [bx + bw + 6, ASPR + 36]]) nl += circ(x, y, 2.6);
    o.push(`<path d="${nl}" fill="#1a1a1e"/>`);
    S.add(o.join(''));
  }

  // --- the boardwalk laid over the stone mouth: deck, railing with one loose length, rope, punt poles, stall, lamp ---
  {
    const wd = Object.fromEntries(Object.entries(DRAIN.wood).map(([k, v]) => [k, dk(v, 0.55)]));
    const o = [];
    o.push(`<path d="M820,${BW}H1620v-16H820Z" fill="${wd.mid}"/><path d="M820,${BW}H1620v12H820Z" fill="${wd.shade}"/><path d="M820,${BW - 16}H1620" stroke="${T.rim}" stroke-width="2" opacity=".6"/>`);
    let ends = '';
    for (let x = 826; x < 1620; x += 14) ends += `M${x},${BW}v12`;
    o.push(`<path d="${ends}" stroke="${wd.dark}" stroke-width="1.4" opacity=".6"/>`);
    // brackets under the deck edge
    let brk = '';
    for (let x = 860; x < 1620; x += 100) brk += `M${x},${BW + 12}l24,30`;
    o.push(`<path d="${brk}" stroke="${wd.shade}" stroke-width="6"/>`);
    const posts = [840, 940, 1040, 1140, 1240, 1340, 1440, 1540];
    let pp = '', rails = '';
    for (const x of posts) pp += `M${x},${BW - 16}v-62`;
    rails += `M840,${BW - 72}H1040M1140,${BW - 72}H1600M840,${BW - 44}H1040M1140,${BW - 44}H1600`;
    o.push(`<path d="${pp}" stroke="${wd.shade}" stroke-width="8"/><path d="${rails}" stroke="${wd.shade}" stroke-width="6"/><path d="${rails}" stroke="${T.rim}" stroke-width="1.5" opacity=".5" transform="translate(0 -3)"/>`);
    // the loose length: come away from the 4th post, hanging down past the deck edge
    o.push(`<path d="M1040,${BW - 72}L1128,${BW - 18}M1040,${BW - 44}L1120,${BW + 10}" stroke="${wd.mid}" stroke-width="6" stroke-linecap="round"/><path d="M1040,${BW - 75}L1128,${BW - 21}" stroke="${T.rim}" stroke-width="1.5" opacity=".5"/><path d="M1084,${BW - 46}L1080,${BW - 4}" stroke="${wd.mid}" stroke-width="5"/>`);
    // the coil of rope and the two punt poles leaning on the rail
    o.push(`<ellipse cx="1205" cy="${BW - 24}" rx="30" ry="9" fill="${dk('#a88e66', 0.55)}"/><ellipse cx="1205" cy="${BW - 28}" rx="20" ry="6" fill="none" stroke="${dk('#7a6448', 0.55)}" stroke-width="3"/><ellipse cx="1205" cy="${BW - 20}" rx="30" ry="9" fill="none" stroke="${dk('#7a6448', 0.55)}" stroke-width="2.5"/><path d="M1180,${BW - 30}q10,-12 26,-10" fill="none" stroke="${dk('#c8ac80', 0.55)}" stroke-width="2"/>`);
    o.push(`<path d="M1160,${BW - 16}L1240,${BW - 220}M1178,${BW - 16}L1278,${BW - 206}" stroke="${wd.lit}" stroke-width="7" stroke-linecap="round"/><path d="M1158,${BW - 18}L1236,${BW - 218}" stroke="${T.rim}" stroke-width="1.5" opacity=".6"/><path d="M1240,${BW - 220}l-6,-14M1278,${BW - 206}l2,-14" stroke="${dk(DRAIN.iron, 0.3)}" stroke-width="4"/>`);
    // the shuttered fish stall
    const fx = 1380;
    o.push(`<path d="M${fx},${BW - 16}V${BW - 140}H${fx + 190}V${BW - 16}Z" fill="${wd.mid}"/><path d="M${fx - 14},${BW - 140}H${fx + 204}l-10,-30H${fx - 4}Z" fill="${dk('#5a6a7a', 0.55)}"/><path d="M${fx - 14},${BW - 140}H${fx + 204}" stroke="${T.rim}" stroke-width="2" opacity=".6"/>`);
    let sh = '';
    for (let x = fx + 14; x < fx + 180; x += 18) sh += `M${x},${BW - 120}v86`;
    o.push(`<path d="M${fx + 10},${BW - 124}h170v94h-170z" fill="${wd.lit}"/><path d="${sh}" stroke="${wd.shade}" stroke-width="2"/><path d="M${fx + 10},${BW - 80}h170" stroke="${wd.dark}" stroke-width="4"/>`);
    o.push(`<path d="M${fx + 30},${BW - 16}q14,-26 30,0zM${fx + 120},${BW - 16}q16,-30 34,0z" fill="${dk('#8a6a46', 0.55)}"/><path d="M${fx + 95},${BW - 140}v18" stroke="${dk(DRAIN.iron, 0.3)}" stroke-width="2"/><path d="M${fx + 95},${BW - 122}q-6,4 0,8" fill="none" stroke="${dk(DRAIN.iron, 0.3)}" stroke-width="2"/>`);
    // tide lamp post at the head of the boardwalk over the mouth
    const lx = 1000;
    o.push(`<path d="M${lx},${BW - 16}V${BW - 200}h44" fill="none" stroke="${wd.shade}" stroke-width="9"/><path d="M${lx - 3},${BW - 16}V${BW - 200}" stroke="${T.rim}" stroke-width="1.5" opacity=".6"/>`);
    if (night) o.push(`<circle cx="${lx + 40}" cy="${BW - 170}" r="90" fill="${S.rad([[0, DRAIN.lamp, 0.55], [0.3, '#ffa860', 0.18], [1, '#ffa860', 0]])}"/>`);
    o.push(tideLamp(lx + 40, BW - 186, 1.3, { iron: DRAIN.iron, glass: dk('#5a5258', 0.55), glow: DRAIN.lamp, core: '#fff6d8', glint: '#ffe8c8' }, night));
    S.add(o.join(''));
    if (night) {
      let g = '';
      for (const x of [880, 1100, 1300, 1480, 1590]) {
        g += `<circle cx="${x}" cy="${BW - 92}" r="70" fill="${S.rad([[0, DRAIN.lamp, 0.5], [0.3, '#ffa860', 0.16], [1, '#ffa860', 0]])}"/>`;
        g += `<path d="M${x},${BW - 16}V${BW - 96}" stroke="#14141a" stroke-width="5"/>` + tideLamp(x, BW - 104, 1, { iron: DRAIN.iron, glass: '#3a3a40', glow: DRAIN.lamp, core: '#fff6d8', glint: '#fff' }, true);
      }
      S.add(g);
    }
  }

  // --- left: the old bathhouse's back wall, chimney and smoke, the boiler-room door and woodpile ------------------
  {
    const o = [];
    const bx1 = 640, top = 210;
    const cx = 380, cTop = 84;
    let puffs = '', lit = '';
    for (let i = 0; i < 14; i++) { const t = i / 13, px = cx + 20 + 300 * t * t + Math.sin(t * 7) * 10, py = cTop - 6 - 150 * t, rr = 9 + 36 * t; puffs += circ(px, py, rr); lit += circ(px - rr * 0.3, py - rr * 0.3, rr * 0.55); }
    o.push(`<g filter="${S.blur(1)}"><path d="${puffs}" fill="${night ? '#2a2e40' : '#6a5068'}" opacity=".75"/><path d="${lit}" fill="${night ? '#4a5270' : '#d8a090'}" opacity=".4"/></g>`);
    o.push(`<path d="M-20,${RIM + 6}V${top}H${bx1}V${RIM + 6}Z" fill="${dk(DRAIN.plaster, 0.76)}"/><path d="M${bx1 - 140},${RIM + 6}V${top}H${bx1}V${RIM + 6}Z" fill="${dk(DRAIN.plasterShade, 0.76)}" opacity=".6"/>`);
    let patches = '';
    for (const [x, y, w, h] of [[60, 280, 90, 50], [250, 390, 70, 40], [470, 260, 60, 70], [120, 470, 80, 40]]) patches += patch(R, x, y, w / 2, h / 2, 9);
    o.push(`<path d="${patches}" fill="${dk(DRAIN.brick.mid)}"/>`);
    o.push(`<path d="M-20,${top}H${bx1 + 20}l-20,-40H-20Z" fill="${dk('#4a3a44')}"/><path d="M-20,${top}H${bx1 + 20}" stroke="${T.rim}" stroke-width="2.5" opacity=".6"/>`);
    o.push(`<path d="M80,260h70v90h-70zM230,260h70v90h-70z" fill="${dk('#3a3036')}"/><path d="M115,260v90M265,260v90M80,305h70M230,305h70" stroke="${dk(DRAIN.wood.mid)}" stroke-width="4"/>`);
    if (night) o.push(`<path d="M233,263h31v40h-31z" fill="#ffc070" opacity=".75"/>`);
    o.push(`<path d="M${cx - 26},${top}V${cTop}h52V${top}Z" fill="${dk(DRAIN.brick.mid)}"/><path d="M${cx - 26},${top}V${cTop}h14V${top}Z" fill="${dk(DRAIN.brick.lit)}"/><path d="M${cx - 32},${cTop}h64v12h-64z" fill="${dk(DRAIN.brick.shade)}"/>`);
    let bc = '';
    for (let y = cTop + 18; y < top; y += 12) bc += `M${cx - 26},${y}h52`;
    o.push(`<path d="${bc}" stroke="${dk(DRAIN.brick.course)}" stroke-width="1.4" opacity=".6"/>`);
    const dx = 470;
    o.push(`<circle cx="${dx + 30}" cy="${RIM - 50}" r="130" fill="${S.rad([[0, DRAIN.fire, night ? 0.55 : 0.35], [1, DRAIN.fire, 0]])}"/>`);
    o.push(`<path d="M${dx},${RIM}V${RIM - 110}h64V${RIM}Z" fill="#2a160e"/><path d="M${dx + 8},${RIM}V${RIM - 40}h48V${RIM}Z" fill="${DRAIN.fire}" opacity=".85"/><path d="M${dx + 16},${RIM}q8,-22 16,-10q8,-16 16,10z" fill="#fff0b0"/>`);
    o.push(`<path d="M${dx - 6},${RIM - 110}h76v8h-76z" fill="${dk(DRAIN.wood.shade)}"/>`);
    o.push(`<path d="M540,${RIM - 120}L${bx1 + 10},${RIM - 96}v8L540,${RIM - 112}z" fill="${dk('#4a3a44')}"/>`);
    let logs = '';
    for (let r = 0; r < 4; r++) for (let i = 0; i < 6 - (r % 2); i++) logs += circ(548 + i * 16 + (r % 2) * 8, RIM - 10 - r * 15, 7.5);
    o.push(`<path d="${logs}" fill="${dk('#8a6448')}"/><path d="${logs}" fill="none" stroke="${dk('#4a3426')}" stroke-width="2"/>`);
    S.add(o.join(''));
  }

  // --- the ditch: the far ditch wall with ivy and the small grate, the water, the near kerb, the lane ----------------
  {
    const o = [];
    o.push(`<path d="M-20,${RIM}H640V${KERB}H-20Z" fill="${dk(DRAIN.stone.shade, 0.55)}"/><path d="M-20,${RIM}H640" stroke="${dk(DRAIN.stone.lit, 0.55)}" stroke-width="5"/>`);
    let co = '';
    for (let y = RIM + 14; y < KERB; y += 14) co += `M-20,${y}H640`;
    o.push(`<path d="${co}" stroke="${dk(DRAIN.stone.course)}" stroke-width="1.4" opacity=".5"/>`);
    // ivy: dense leafy mats hanging over the ditch wall and climbing the bathhouse wall foot
    let leaves = '', shade = '';
    for (const [x0, x1, top, bot] of [[-20, 150, RIM - 70, RIM + 70], [250, 420, RIM - 40, RIM + 56], [530, 640, RIM + 6, RIM + 70]]) {
      for (let i = 0; i < 190; i++) {
        const x = R.range(x0, x1), u = R(), y = top + (bot - top) * u, edge = Math.min(x - x0, x1 - x) / ((x1 - x0) / 2);
        if (R() > 0.55 + edge * 0.45) continue;
        const sz = R.range(6, 10), d = R() < 0.5 ? 1 : -1;
        const leaf = `M${r0(x)},${r0(y)}q${r0(d * sz)},${r0(-sz * 0.7)} ${r0(d * sz * 1.7)},${r0(sz * 0.1)}q${r0(-d * sz * 0.8)},${r0(sz * 0.7)} ${r0(-d * sz * 1.7)},${r0(-sz * 0.1)}z`;
        if (u > 0.55) shade += leaf; else leaves += leaf;
      }
    }
    o.push(`<path d="${shade}" fill="${dk('#2e4430', 0.6)}"/><path d="${leaves}" fill="${dk(DRAIN.ivy, 0.6)}"/><path d="${leaves}" fill="${dk(DRAIN.ivyLit, 0.6)}" opacity=".45" transform="translate(-1.5 -1.5)"/>`);
    // the small iron grate in the ditch side
    o.push(`<path d="M190,${RIM + 22}h46v32h-46z" fill="#0c0c10"/><path d="M199,${RIM + 22}v32M208,${RIM + 22}v32M217,${RIM + 22}v32M226,${RIM + 22}v32M190,${RIM + 38}h46" stroke="${DRAIN.iron}" stroke-width="3"/><path d="M190,${RIM + 22}h46" stroke="${T.rim}" stroke-width="1.5" opacity=".5"/>`);
    // the water: flat colour with current streaks (no reflections), from the level on the far walls to the near kerb
    o.push(`<path d="M-20,${LVL}H1620V${KERB}H-20Z" fill="${dk(DRAIN.water, 0.4)}"/>`);
    o.push(currents(R, -20, 1600, LVL + 6, KERB - 6, 40, dk(DRAIN.waterHi, 0.25), 0.6, 1));
    o.push(`<path d="M-20,${LVL}H1620" stroke="${night ? '#8aa0c8' : '#e8b898'}" stroke-width="2" opacity=".5"/>`);
    if (night) o.push(`<path d="M${MX0 - 30},${LVL + 14}q20,-6 40,0t40,0t40,0t40,0t40,0t40,0t40,0" fill="none" stroke="#9ab0d0" stroke-width="2" opacity=".55"/>`);
    // the near kerb and the cobbled lane (calm, under the dialogue box)
    o.push(`<path d="M-20,${KERB}H1620v16H-20Z" fill="${dk(DRAIN.stone.lit, 0.55)}"/><path d="M-20,${KERB}H1620" stroke="${T.rim}" stroke-width="2" opacity=".5"/>`);
    o.push(`<path d="M-20,${KERB + 16}H1620V${H}H-20Z" fill="${S.lin([[0, dk('#5a4e4a', 0.55)], [1, '#141016']], `gradientUnits="userSpaceOnUse" x1="0" y1="${KERB + 16}" x2="0" y2="${H}"`)}"/>`);
    let cob = '';
    for (let i = 0; i < 160; i++) { const t = R() ** 1.4, y = KERB + 22 + (H - KERB - 22) * t, x = R.range(-20, 1620), sz = 0.6 + t * 1.6; cob += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${f(9 * sz)}" ry="${f(3.2 * sz)}"/>`; }
    o.push(`<g fill="${dk('#6a5e58', 0.55)}" opacity=".5">${cob}</g>`);
    S.add(o.join(''));
  }

  // --- the narrow plank bridge over the ditch, from the far rim to the near kerb, with a hand rope -------------------
  {
    const wd = Object.fromEntries(Object.entries(DRAIN.wood).map(([k, v]) => [k, dk(v, 0.55)]));
    const x0 = 700, x1 = 766, yF = RIM + 2, yN = KERB + 4;
    S.add(`<path d="M${x0 + 8},${yF + 14}V${yN}M${x1 - 8},${yF + 14}V${yN}" stroke="${wd.shade}" stroke-width="7"/>`);
    S.add(`<path d="M${x0},${yF}L${x1},${yF}L${x1 + 26},${yN}L${x0 - 26},${yN}Z" fill="${wd.lit}"/><path d="M${x0},${yF}L${x1},${yF}L${x1 + 26},${yN}L${x0 - 26},${yN}Z" fill="none" stroke="${wd.dark}" stroke-width="2"/>`);
    let pl2 = '';
    for (let i = 1; i < 8; i++) { const t = i / 8; pl2 += `M${r0(x0 - 26 * t)},${r0(yF + (yN - yF) * t)}H${r0(x1 + 26 * t)}`; }
    S.add(`<path d="${pl2}" stroke="${wd.shade}" stroke-width="1.6"/><path d="M${x0 - 26},${yN}H${x1 + 26}v8H${x0 - 26}z" fill="${wd.shade}"/>`);
    S.add(`<path d="M${x1 + 4},${yF}V${yF - 54}M${x1 + 30},${yN}V${yN - 74}" stroke="${wd.shade}" stroke-width="5"/><path d="${sag([x1 + 4, yF - 50], [x1 + 30, yN - 68], 12)}" fill="none" stroke="${dk('#b8a07a', 0.55)}" stroke-width="2.4"/>`);
  }

  // --- grading --------------------------------------------------------------------------------------------------------
  if (night) {
    S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.4, '#05060c', 0], [1, '#05060c', 0.66]], 'cx="0.55" cy="0.45" r="0.75"')}"/>`);
    S.add(`<rect y="610" width="${W}" height="290" fill="${S.lin([[0, '#05060c', 0], [1, '#05060c', 0.7]])}"/>`);
  } else {
    S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#ff9a60', 0.1], [0.5, '#ff9a60', 0], [1, '#1a1440', 0.3]], 'x1="1" y1="0" x2="0" y2="1"')}"/>`);
    S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.45, '#120c16', 0], [1, '#120c16', 0.56]], 'cx="0.5" cy="0.48" r="0.75"')}"/>`);
    S.add(`<rect y="610" width="${W}" height="290" fill="${S.lin([[0, '#100c12', 0], [1, '#100c12', 0.68]])}"/>`);
  }
  return S.out();
}

export const harborBgs = {
  'fog-harbor-bridge-noon': harborBridgeNoon,
  'fog-harbor-guild': harborGuild,
  'fog-harbor-drain-dusk': () => harborDrain(false),
  'fog-harbor-drain-night': () => harborDrain(true),
};
