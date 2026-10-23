// 雾港·旧灯塔 (chapter 12): the round stone tower at the end of the outermost harbour mole — 塞雷娜's lodging and,
// from day 13, the party's camp. One generator, two variants (script 12 美術需求):
//   fog-harbor-old-lighthouse      — day. The bottom of the tower seen from just inside the door, the camera tilted a
//                                    little upward: a curved wall of cold grey stone, a spiral of cantilevered stone
//                                    steps climbing it, a canvas camp bed, a water jug on a plain wooden table; the
//                                    door and two deep window slits (open, unglazed) let in grey sea fog. High up, the
//                                    hatch in the timber ceiling shows the lamp room — its lens cradle standing empty.
//                                    No mirror and nothing that shines anywhere on the walls (the jug is clay).
//   fog-harbor-old-lighthouse-rain — night rain. At the top of the stair, in the lamp room: the last steps coming up
//                                    through the floor hatch, the empty iron lens cage, the lamp room's tall window
//                                    frames standing empty (no glass), rain beyond them, dark water, and across the
//                                    channel the low wooden rooftops of the opposite shore. No figure (the watcher on the
//                                    roof is a separate overlay), no face, no hair colour.
// Chapter 13 variants of the tower base (script 13 美術需求), one camera a metre further in so the window is near centre:
//   fog-harbor-old-lighthouse-night        — after midnight, lit only by a small lamp on the table; the glazed window low
//                                            in the back wall behind the table is black, and the glass shows the lamp, the
//                                            table edge and a few blurred figures (no faces); rain beads on it outside.
//   fog-harbor-old-lighthouse-night-broken — the same, the pane smashed (shards left in the frame, rain driving in), the
//                                            table stood on its end and pushed against the frame, water and glass on the
//                                            floor, the lamp moved to the stool.
//   fog-harbor-old-lighthouse-dawn         — morning after: rain stopped, day light, the table still bracing the window,
//                                            the glass swept into a heap, the lamp out.
// (The window is not in the chapter 12 day picture, which stays unchanged.)
import { Scene, W, H, f, pz, pl, mix } from './lib.mjs';

const r0 = (v) => f(v, 0);
const RAD = Math.PI / 180;

const LH = {
  stone: '#6c7076', stoneLit: '#8e9296', stoneShade: '#3a3e44', stoneDark: '#22262c', mortar: '#2c3036',
  step: '#7a7e82', stepLit: '#9a9ea0', stepEdge: '#4a4e54', wood: '#4a3a2e', woodDark: '#2a201a', woodLit: '#6a5442',
  canvas: '#8a8470', canvasShade: '#5e5a4c', blanket: '#4a5462', blanketShade: '#323a46', clay: '#8a5a3e', clayShade: '#5a3a28',
  fog: '#dfe3e4', fogShade: '#b4bcc0', iron: '#2a2c30', ironLit: '#7a8088',
  // night rain
  nSky: [[0, '#0a0e18'], [0.55, '#1a2232'], [1, '#2a3444']], nSea: [[0, '#1e2836'], [1, '#06080e']], nRoof: '#0a0c12', nRoofLit: '#2a3040',
  nWin: '#c89a5a', nStone: '#2a2e36', nStoneLit: '#4a5260', nIron: '#0c0e12', nRain: '#a8b8cc', nGlow: '#e8b878',
};

// pinhole camera with an optional upward tilt (pitch in degrees); Z forward, Y up, X right
// z0 moves the camera forward along Z (0 = at the origin)
function camera({ cx = 800, cy = 450, F = 600, eye = 1.6, pitch = 0, z0 = 0 }) {
  const c = Math.cos(pitch * RAD), s = Math.sin(pitch * RAD);
  const depth = (X, Y, Z) => (Z - z0) * c + (Y - eye) * s;
  const pr = (X, Y, Z) => {
    Z -= z0;
    const dy = Y - eye, zc = Math.max(0.08, Z * c + dy * s), yc = dy * c - Z * s;
    const clamp = (v) => Math.max(-6000, Math.min(7000, v));
    return [clamp(cx + X / zc * F), clamp(cy - yc / zc * F)];
  };
  pr.depth = depth;
  pr.poly = (pts) => pts.map(([X, Y, Z]) => pr(X, Y, Z));
  pr.quad = (pts) => pz(pr.poly(pts));
  pr.ok = (pts, min = 0.2) => pts.every(([X, Y, Z]) => depth(X, Y, Z) > min);
  return pr;
}

// the empty lens cage: a stone drum, an iron cradle of bars between rings, nothing inside
function lensCage(pr, { x, z, y0, r, h, bars = 12, iron, lit, drum, drumLit, back = true }) {
  const ring = (y, rr = r) => { const pts = []; for (let a = 0; a <= 360; a += 15) pts.push(pr(x + Math.sin(a * RAD) * rr, y, z + Math.cos(a * RAD) * rr)); return pts; };
  let s = '';
  // the drum it stands on
  if (drum) {
    const d0 = ring(y0 - 0.55, r * 1.25), d1 = ring(y0, r * 1.25);
    const L = [], Rr = [];
    for (let i = 0; i < d0.length; i++) if (Math.cos(i * 15 * RAD) <= 0.05) { L.push(d1[i]); Rr.unshift(d0[i]); }
    const xs = [...d0, ...d1].map((p) => p[0]);
    const lo = Math.min(...xs), hi = Math.max(...xs);
    const top = ring(y0, r * 1.25);
    s += `<path d="M${r0(lo)},${r0(pr(x - r * 1.25, y0, z)[1])}${top.slice(6, 19).map((p) => `L${r0(p[0])},${r0(p[1])}`).join('')}L${r0(hi)},${r0(pr(x + r * 1.25, y0 - 0.55, z)[1])}${ring(y0 - 0.55, r * 1.25).slice(18, 25).concat(ring(y0 - 0.55, r * 1.25).slice(0, 7)).map((p) => `L${r0(p[0])},${r0(p[1])}`).join('')}Z" fill="${drum}"/>`;
    s += `<path d="${pz(top)}" fill="${drumLit}"/>`;
  }
  // bars: the back half first (dimmer), then the rings, then the front half
  const bar = (a, op) => { const X = x + Math.sin(a * RAD) * r, Z = z + Math.cos(a * RAD) * r; return `<path d="${pl([pr(X, y0, Z), pr(X, y0 + h, Z)])}" stroke="${iron}" stroke-width="${f(Math.max(2, 24 / pr.depth(X, y0 + h / 2, Z)))}" opacity="${op}"/>`; };
  if (back) for (let i = 0; i < bars; i++) { const a = i * 360 / bars; if (Math.cos(a * RAD) > 0) s += bar(a, 0.75); }
  for (const [y, w] of [[y0, 1.4], [y0 + h * 0.5, 0.8], [y0 + h, 1.2]]) s += `<path d="${pz(ring(y))}" fill="none" stroke="${iron}" stroke-width="${f(Math.max(2.5, 36 * w / pr.depth(x, y, z)))}"/>`;
  for (let i = 0; i < bars; i++) { const a = i * 360 / bars; if (Math.cos(a * RAD) <= 0) s += bar(a, 1); }
  // a cold lit edge on the left-hand bars and the top ring
  let hi = '';
  for (let i = 0; i < bars; i++) { const a = i * 360 / bars; if (Math.cos(a * RAD) <= 0 && Math.sin(a * RAD) < -0.2) { const X = x + Math.sin(a * RAD) * r - 0.02, Z = z + Math.cos(a * RAD) * r; hi += pl([pr(X, y0 + 0.05, Z), pr(X, y0 + h - 0.05, Z)]); } }
  s += `<path d="${hi}" stroke="${lit}" stroke-width="2" opacity=".55"/>`;
  return s;
}

// ---------------------------------------------------------------------------------------------
// day: the bottom of the tower
// ---------------------------------------------------------------------------------------------
const TOWER = {
  day: ['sbLighthouse', '雾港·旧灯塔·塔底：港口最外面石堤上的圆形石塔内部，冷灰色的弧形石墙，沿墙盘旋而上的石阶，一张帆布行军床、一张木桌和桌上的陶水壶；敞开的门与两道没有玻璃的窄窗透进灰白的海雾；抬头可见木顶上的方口，口上是灯室，透镜架空着；墙上没有任何镜子或会反光的东西', 7412],
  night: ['sbLighthouseNight', '雾港·旧灯塔·塔底·后半夜：同一间圆形石塔的底层，只点着木桌上的一盏小灯，弧形石墙、盘旋的石阶和行军床都沉在暗里；木桌后面墙上那扇装着玻璃的窗是黑的，玻璃上照出屋里的那盏灯和几个模糊的人影，看不清脸；窗外在下雨，雨点挂在玻璃上', 7414],
  'night-broken': ['sbLighthouseBroken', '雾港·旧灯塔·塔底·破窗：同一间塔底，后半夜，那扇窗的玻璃碎了，窗框边上还挂着尖碎片，雨从破口灌进来；木桌被推过去竖着顶住窗框，桌腿朝着屋里；地上一摊水和碎玻璃，小灯挪到了凳子上', 7415],
  dawn: ['sbLighthouseDawn', '雾港·旧灯塔·塔底·清晨：同一间塔底，雨停了，灰白的晨光从门口和高处的窄窗进来；破了的窗用竖起来的木桌顶着，破口上方露出一角发白的天；地上的水还没干，墙角扫着一小堆碎玻璃，熄了的小灯放在凳子上', 7416],
};

function towerBase(mode = 'day') {
  const S = new Scene(...TOWER[mode]);
  const R = S.R;
  // variants (chapter 13) step a metre further in and look a little flatter, so the window on the back wall sits
  // near the centre of the frame; night = lit by one small lamp only; broken = the window smashed, the table braced against it
  const V = mode !== 'day', night = mode === 'night' || mode === 'night-broken', broken = mode === 'night-broken' || mode === 'dawn';
  const pr = V ? camera({ cx: 800, cy: 452, F: 600, eye: 1.6, pitch: 7, z0: 1.15 }) : camera({ cx: 800, cy: 492, F: 520, eye: 1.6, pitch: 10 });
  const TR = 3.4, CZ = 3.0, HC = 6.4; // tower radius, centre depth, ceiling height
  const cyl = (a, y, r = TR) => [Math.sin(a * RAD) * r, y, CZ + Math.cos(a * RAD) * r];
  const P = LH;
  const A0 = V ? -116 : -128, A1 = V ? 116 : 128;
  // brightness of the wall at angle a: lit by the fog through the door (left, near) and the slits
  const lum = (a) => Math.max(0, Math.cos((a - 38) * RAD)) * 0.75 + 0.1;

  S.add(`<rect width="${W}" height="${H}" fill="${P.stoneDark}"/>`);

  // ---- floor: flagstones inside the round base --------------------------------------------------
  {
    const base = [];
    for (let a = A0; a <= A1; a += 4) base.push(pr(...cyl(a, 0)));
    const fl = pz([...base, [W + 400, H + 400], [-400, H + 400]]);
    S.add(`<path d="${fl}" fill="${S.lin([[0, '#5a5e62'], [0.5, '#44484e'], [1, '#22262a']], `gradientUnits="userSpaceOnUse" x1="0" y1="560" x2="0" y2="${H}"`)}"/>`);
    const clip = S.clip(fl);
    let fg = '';
    const fz = V ? 1.96 : 3.2;
    for (let z = fz; z < CZ + TR; z += 0.62) fg += pl([pr(-TR, 0, z), pr(TR, 0, z)]);
    for (let k = -6; k <= 6; k++) {
      const x0 = k * 0.6;
      for (let z = fz; z < CZ + TR; z += 0.62) { const off = (Math.round((z - fz) / 0.62) % 2) * 0.3; fg += pl([pr(x0 + off, 0, z), pr(x0 + off, 0, z + 0.62)]); }
    }
    S.add(`<g clip-path="${clip}"><path d="${fg}" stroke="#2a2e32" stroke-width="2" opacity=".55"/></g>`);
  }

  // ---- the curved wall ---------------------------------------------------------------------------
  {
    let strips = '';
    for (let a = A0; a < A1; a += 4) {
      const b = a + 4;
      const q = [cyl(a, 0), cyl(a, HC), cyl(b, HC), cyl(b, 0)];
      strips += `<path d="${pr.quad(q)}" fill="${mix(P.stoneShade, P.stoneLit, lum(a + 2))}" stroke="${mix(P.stoneShade, P.stoneLit, lum(a + 2))}" stroke-width="1"/>`;
    }
    S.add(strips);
    // a dark vertical gradient over the wall: the top of the shaft is dimmer
    const top = [], bot = [];
    for (let a = A0; a <= A1; a += 4) { top.push(pr(...cyl(a, HC))); bot.unshift(pr(...cyl(a, 0))); }
    S.add(`<path d="${pz([...top, ...bot])}" fill="${S.lin([[0, '#14181e', 0.75], [0.45, '#14181e', 0.15], [1, '#14181e', 0.35]], 'gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="760"')}"/>`);
    // stone courses and staggered joints
    let crs = '', jn = '';
    const CH = 0.46;
    for (let y = CH, k = 0; y < HC; y += CH, k++) {
      const pts = [];
      for (let a = A0; a <= A1; a += 4) pts.push(pr(...cyl(a, y)));
      crs += pl(pts);
      for (let a = A0 + (k % 2) * 3.6 + R.range(0, 1.5); a < A1; a += 7.2 + R.range(-1.2, 1.2)) jn += pl([pr(...cyl(a, y - CH)), pr(...cyl(a, y))]);
    }
    S.add(`<path d="${crs}" fill="none" stroke="${P.mortar}" stroke-width="2.2" opacity=".55"/><path d="${jn}" stroke="${P.mortar}" stroke-width="1.8" opacity=".45"/>`);
    // a few weathered, salt-stained blocks
    let st = '';
    for (let i = 0; i < 26; i++) {
      const a = R.range(-110, 110), y = Math.floor(R.range(0, HC / CH - 1)) * CH;
      st += pr.quad([cyl(a, y + 0.04), cyl(a, y + CH - 0.04), cyl(a + 6, y + CH - 0.04), cyl(a + 6, y + 0.04)]);
    }
    S.add(`<path d="${st}" fill="#9aa2a6" opacity=".12"/>`);
  }

  // ---- openings: the door on the left (sea fog, the mole, the water) and two deep slits ---------------
  const opening = (a0, a1, y0, y1, arch, scene) => {
    const n = 8, front = [], ins = [];
    const am = (a0 + a1) / 2, hw = (a1 - a0) / 2;
    for (let i = 0; i <= n; i++) front.push(cyl(a0 + (a1 - a0) * i / n, i === 0 || i === n ? y1 : y1 + arch * Math.sin(Math.PI * i / n)));
    const outline = [cyl(a0, y0), ...front, cyl(a1, y0)];
    // reveal (wall thickness): the same outline pushed outward
    const deep = outline.map(([x, y, z]) => { const k = (TR + 0.9) / TR; return [x * k, y, CZ + (z - CZ) * k]; });
    let s = `<path d="${pz(pr.poly(outline))}" fill="${P.stoneShade}"/>`;
    s += `<path d="${pz(pr.poly(deep))}" fill="${scene}"/>`;
    // the lit side of the reveal
    s += `<path d="${pz(pr.poly([outline[0], outline[1], deep[1], deep[0]]))}" fill="${P.stone}"/>`;
    s += `<path d="${pz(pr.poly([...outline.slice(1, n + 2).map((p, i) => p), ...deep.slice(1, n + 2).reverse()]))}" fill="${P.stoneDark}" opacity=".55"/>`;
    return { svg: s, deep, am, hw };
  };
  {
    // the door is just out of frame on the left: its grey fog light falls in a long wedge across the floor
    if (!night) S.add(`<path d="${pz([[-200, 700], [-200, 960], pr(0.9, 0, 4.4), pr(-0.4, 0, 5.6)])}" fill="${P.fog}" opacity=".13" filter="${S.blur(3)}"/>`);
    if (!night) S.add(`<path d="M0,0H260L0,${H}Z" fill="${P.fog}" opacity=".06" filter="${S.blur(3)}"/>`);
    // the slits, high on the back wall, with a pale shaft of fog light each (at night: rain-dark sky, no shaft)
    for (const [a, y0, y1] of [[-36, 3.5, 4.9], [24, 4.6, 5.8]]) {
      S.add(opening(a - 2.2, a + 2.2, y0, y1, 0.12, night ? S.lin([[0, '#2a3242'], [1, '#141a26']]) : mode === 'dawn' ? S.lin([[0, '#e6e2e0'], [1, '#b4b6bc']]) : S.lin([[0, '#d4dadc'], [1, '#9aa4aa']])).svg);
      if (night) continue;
      const c = pr(...cyl(a, (y0 + y1) / 2, TR - 0.1));
      const g = pr(...cyl(a * 0.4, 0, TR * 0.25));
      S.add(`<path d="M${r0(c[0] - 14)},${r0(c[1] - 30)}L${r0(c[0] + 14)},${r0(c[1] - 30)}L${r0(g[0] + 80)},${r0(g[1])}L${r0(g[0] - 50)},${r0(g[1])}Z" fill="${P.fog}" opacity=".08" filter="${S.blur(2)}"/>`);
    }
  }

  // ---- the spiral stair: cantilevered slabs climbing the wall from the left round the back --------------
  {
    const N = 20, a0 = -122, a1 = 64, dA = (a1 - a0) / N, rise = HC / (N + 0.6), w = 0.95, th = 0.2;
    const steps = [];
    for (let k = 0; k < N; k++) {
      const sa = a0 + k * dA, sb = sa + dA + 0.6, yt = (k + 1) * rise;
      const mid = cyl(sa + dA / 2, yt, TR - w / 2);
      steps.push({ k, sa, sb, yt, d: pr.depth(...mid) });
    }
    steps.sort((u, v) => v.d - u.d);
    let s = '', rail = [];
    for (const { k, sa, sb, yt } of steps) {
      const yb = yt - th;
      const o = (a, y) => cyl(a, y, TR), i = (a, y) => cyl(a, y, TR - w);
      const shade = mix(P.stepEdge, P.stepLit, lum(sa) * 0.9);
      if (yb > 1.6) s += `<path d="${pr.quad([o(sa, yb), o(sb, yb), i(sb, yb), i(sa, yb)])}" fill="${P.stoneDark}"/>`;
      // the riser below each slab's leading edge (its shadow on the wall)
      s += `<path d="${pr.quad([o(sa, yb), o(sb, yb), o(sb, yb - 0.32), o(sa, yb - 0.5)])}" fill="#14181e" opacity=".35"/>`;
      if (yt < 1.6 + 2) s += `<path d="${pr.quad([o(sa, yt), o(sb, yt), i(sb, yt), i(sa, yt)])}" fill="${mix(P.step, P.stepLit, lum(sa))}"/>`;
      // the end face toward the centre, and the leading face
      s += `<path d="${pr.quad([i(sa, yb), i(sb, yb), i(sb, yt), i(sa, yt)])}" fill="${shade}"/>`;
      s += `<path d="${pr.quad([o(sa, yb), i(sa, yb), i(sa, yt), o(sa, yt)])}" fill="${mix(P.stepEdge, P.step, 0.4)}"/>`;
      s += `<path d="${pl(pr.poly([i(sa, yt), i(sb, yt)]))}" stroke="${P.stepLit}" stroke-width="1.6" opacity=".5"/>`;
      if (k % 2 === 0) rail.push(i(sa + dA / 2, yt + 0.95));
    }
    S.add(s);
    // a rope rail through iron eyes along the open edge
    let posts = '';
    for (const p of rail) posts += pl(pr.poly([[p[0], p[1] - 0.95, p[2]], p]));
    S.add(`<path d="${posts}" stroke="${P.iron}" stroke-width="3"/>`);
    S.add(`<path d="${pl(rail.sort((u, v) => u[1] - v[1]).map((p) => pr(...p)))}" fill="none" stroke="#8a7a5e" stroke-width="3" stroke-linejoin="round" opacity=".85"/>`);
  }

  // ---- the timber ceiling with its hatch; above it the lamp room and the empty lens cradle ----------------
  {
    const rim = [];
    for (let a = A0; a <= A1; a += 4) rim.push(pr(...cyl(a, HC)));
    const ceil = pz([...rim, [W + 400, -400], [-400, -400]]);
    S.add(`<path d="${ceil}" fill="${P.woodDark}"/>`);
    const cc = S.clip(ceil);
    let bm = '';
    for (let x = -TR; x <= TR; x += 0.42) bm += pl([pr(x, HC, 0.6), pr(x, HC, CZ + TR)]);
    S.add(`<g clip-path="${cc}"><path d="${bm}" stroke="#1a140f" stroke-width="2" opacity=".8"/>`
      + `<path d="${pr.quad([[-TR, HC - 0.01, 3.6], [TR, HC - 0.01, 3.6], [TR, HC - 0.3, 3.6], [-TR, HC - 0.3, 3.6]])}${pr.quad([[-TR, HC - 0.01, 5.2], [TR, HC - 0.01, 5.2], [TR, HC - 0.3, 5.2], [-TR, HC - 0.3, 5.2]])}" fill="${P.wood}"/></g>`);
    // the hatch: a square opening near the top of the stair
    const hx0 = 0.15, hx1 = 2.35, hz0 = 4.05, hz1 = 5.95;
    const hole = [[hx0, HC, hz0], [hx1, HC, hz0], [hx1, HC, hz1], [hx0, HC, hz1]];
    const hp = pr.quad(hole);
    S.add(`<path d="${hp}" fill="${night ? S.lin([[0, '#1e2432'], [1, '#10141c']], 'x1="0" y1="0" x2="0" y2="1"') : S.lin([[0, '#eef0f0'], [1, '#aab4ba']], 'x1="0" y1="0" x2="0" y2="1"')}"/>`);
    const hc = S.clip(hp);
    // inside the hatch: the lamp room's windows (bright fog), its mullions, the empty cradle
    let up = '';
    for (const x of [0.2, 0.9, 1.6, 2.3]) up += pl([pr(x, HC + 0.3, 7.2), pr(x, HC + 3.2, 7.2)]);
    up += pl([pr(-1, HC + 1.6, 7.2), pr(3.4, HC + 1.6, 7.2)]);
    S.add(`<g clip-path="${hc}"><path d="${pr.quad([[-1, HC + 0.25, 7.2], [3.4, HC + 0.25, 7.2], [3.4, HC + 0.75, 7.2], [-1, HC + 0.75, 7.2]])}" fill="#3e444a"/><path d="${up}" stroke="#3a4046" stroke-width="5"/>`
      + lensCage(pr, { x: 1.25, z: 6.3, y0: HC + 0.7, r: 0.55, h: 1.7, bars: 10, iron: '#262a30', lit: '#e8eef0', drum: '#4e5458', drumLit: '#6a7074' })
      + `</g>`);
    // the hatch's timber edge and the ladder-like last steps up into it
    S.add(`<path d="${pr.quad([[hx0, HC, hz0], [hx1, HC, hz0], [hx1, HC - 0.3, hz0], [hx0, HC - 0.3, hz0]])}" fill="${P.wood}"/><path d="${pl(pr.poly([[hx0, HC - 0.3, hz0], [hx1, HC - 0.3, hz0]]))}" stroke="${P.woodLit}" stroke-width="2" opacity=".6"/>`);
    S.add(`<path d="${pl(pr.poly([[hx0, HC, hz0], [hx0, HC, hz1]])) + pl(pr.poly([[hx1, HC, hz0], [hx1, HC, hz1]]))}" stroke="#1a140f" stroke-width="3"/>`);
  }

  // ---- night: everything so far sinks into the dark; the furniture and the window are drawn into it ------------
  const LAMP = broken ? [-1.55, 0.45, 4.0] : [-0.2, 0.78, 4.62]; // on the table, or on the stool once the table is at the window
  const lampXY = pr(...LAMP);
  if (night) {
    S.add(`<rect width="${W}" height="${H}" fill="#070910" opacity=".62"/>`);
    S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#070910', 0], [0.35, '#070910', 0.35], [1, '#070910', 0.8]], `gradientUnits="userSpaceOnUse" cx="${r0(lampXY[0])}" cy="${r0(lampXY[1] - 40)}" r="900"`)}"/>`);
  }
  if (V) towerWindow(S, pr, cyl, { mode, night, broken, lamp: LAMP });

  // ---- the furnishings: camp bed on the right, table with a clay jug -------------------------------------
  {
    const P = night ? NIGHT_FURN : LH;
    // behind the bed (drawn first): a coil of old rope on the floor and a crate against the wall
    const rp = pr(1.2, 0, 6.0);
    S.add(`<ellipse cx="${r0(rp[0])}" cy="${r0(rp[1])}" rx="42" ry="12" fill="${night ? nightTone('#5e5240') : '#5e5240'}"/><ellipse cx="${r0(rp[0])}" cy="${r0(rp[1] - 5)}" rx="30" ry="8" fill="none" stroke="#3a3226" stroke-width="3"/><ellipse cx="${r0(rp[0])}" cy="${r0(rp[1] - 9)}" rx="18" ry="5" fill="none" stroke="#3a3226" stroke-width="3"/>`);
    S.add(`<path d="${pr.quad([[2.2, 0, 5.9], [2.75, 0, 5.6], [2.75, 0.5, 5.6], [2.2, 0.5, 5.9]])}" fill="${P.wood}"/><path d="${pr.quad([[2.2, 0.5, 5.9], [2.75, 0.5, 5.6], [2.6, 0.5, 5.1], [2.05, 0.5, 5.4]])}" fill="${P.woodLit}"/>`);
    // camp bed: canvas on an X-frame, lying along the right wall, a folded grey blanket
    const bx0 = 1.75, bx1 = 2.55, bz0 = 3.3, bz1 = 5.2, by = 0.46;
    let s = '';
    for (const z of [bz0 + 0.08, bz1 - 0.08]) s += pl(pr.poly([[bx0, 0, z], [bx1, by, z]])) + pl(pr.poly([[bx1, 0, z], [bx0, by, z]]));
    s = `<path d="${s}" stroke="${P.woodDark}" stroke-width="5"/>`;
    s += `<path d="${pr.quad([[bx0, by, bz0], [bx1, by, bz0], [bx1, by, bz1], [bx0, by, bz1]])}" fill="${P.canvas}"/>`;
    s += `<path d="${pr.quad([[bx0, by, bz0], [bx1, by, bz0], [bx1, by - 0.08, bz0], [bx0, by - 0.08, bz0]])}" fill="${P.canvasShade}"/>`;
    s += `<path d="${pl(pr.poly([[bx0, by + 0.01, bz0], [bx0, by + 0.01, bz1]])) + pl(pr.poly([[bx1, by + 0.01, bz0], [bx1, by + 0.01, bz1]]))}" stroke="${P.woodLit}" stroke-width="4"/>`;
    // the blanket folded at the foot
    s += `<path d="${pr.quad([[bx0 + 0.04, by + 0.16, bz0 + 0.1], [bx1 - 0.04, by + 0.16, bz0 + 0.1], [bx1 - 0.04, by + 0.16, bz0 + 0.6], [bx0 + 0.04, by + 0.16, bz0 + 0.6]])}" fill="${P.blanket}"/>`;
    s += `<path d="${pr.quad([[bx0 + 0.04, by + 0.16, bz0 + 0.1], [bx1 - 0.04, by + 0.16, bz0 + 0.1], [bx1 - 0.04, by, bz0 + 0.1], [bx0 + 0.04, by, bz0 + 0.1]])}" fill="${P.blanketShade}"/>`;
    S.add(s);
    // table: plain planks on four legs, centre-left; the clay jug and a cup on it (matte, no shine)
    const tx0 = -1.15, tx1 = 0.05, tz0 = 4.0, tz1 = 4.8, ty = 0.78;
    if (broken) S.add(bracedTable(pr, P, { night }));
    else {
    let t = '';
    for (const [x, z] of [[tx0 + 0.06, tz1 - 0.06], [tx1 - 0.06, tz1 - 0.06], [tx0 + 0.06, tz0 + 0.06], [tx1 - 0.06, tz0 + 0.06]]) t += pl(pr.poly([[x, 0, z], [x, ty, z]]));
    S.add(`<path d="${t}" stroke="${P.woodDark}" stroke-width="7"/>`);
    S.add(`<path d="${pr.quad([[tx0, ty, tz0], [tx1, ty, tz0], [tx1, ty, tz1], [tx0, ty, tz1]])}" fill="${P.woodLit}"/><path d="${pr.quad([[tx0, ty, tz0], [tx1, ty, tz0], [tx1, ty - 0.07, tz0], [tx0, ty - 0.07, tz0]])}" fill="${P.wood}"/>`);
    S.add(`<path d="${pl(pr.poly([[tx0 + 0.4, ty + 0.002, tz0], [tx0 + 0.4, ty + 0.002, tz1]])) + pl(pr.poly([[tx0 + 0.8, ty + 0.002, tz0], [tx0 + 0.8, ty + 0.002, tz1]]))}" stroke="${P.wood}" stroke-width="1.5"/>`);
    const jx = V ? -0.98 : -0.62, jz = V ? 4.2 : 4.35;
    const jb = pr(jx, ty, jz), jt = pr(jx, ty + 0.36, jz), jw = (jb[1] - jt[1]) * 0.36;
    S.add(`<path d="M${r0(jb[0] - jw * 0.7)},${r0(jb[1])}C${r0(jb[0] - jw * 1.25)},${r0(jb[1] - jw * 1.1)} ${r0(jb[0] - jw * 0.9)},${r0(jt[1] + jw * 0.8)} ${r0(jb[0] - jw * 0.38)},${r0(jt[1] + jw * 0.3)}L${r0(jb[0] - jw * 0.42)},${r0(jt[1])}L${r0(jb[0] + jw * 0.42)},${r0(jt[1])}L${r0(jb[0] + jw * 0.38)},${r0(jt[1] + jw * 0.3)}C${r0(jb[0] + jw * 0.9)},${r0(jt[1] + jw * 0.8)} ${r0(jb[0] + jw * 1.25)},${r0(jb[1] - jw * 1.1)} ${r0(jb[0] + jw * 0.7)},${r0(jb[1])}Z" fill="${P.clay}"/>`
      + `<path d="M${r0(jb[0] + jw * 0.1)},${r0(jb[1])}C${r0(jb[0] + jw * 0.9)},${r0(jb[1] - jw * 0.9)} ${r0(jb[0] + jw * 0.6)},${r0(jt[1] + jw * 0.6)} ${r0(jb[0] + jw * 0.38)},${r0(jt[1] + jw * 0.3)}L${r0(jb[0] + jw * 0.42)},${r0(jt[1])}L${r0(jb[0] + jw * 0.38)},${r0(jt[1] + jw * 0.3)}C${r0(jb[0] + jw * 0.9)},${r0(jt[1] + jw * 0.8)} ${r0(jb[0] + jw * 1.25)},${r0(jb[1] - jw * 1.1)} ${r0(jb[0] + jw * 0.7)},${r0(jb[1])}Z" fill="${P.clayShade}"/>`
      + `<path d="M${r0(jb[0] + jw * 0.75)},${r0(jt[1] + jw * 0.5)}q${r0(jw * 0.7)},${r0(jw * 0.3)} ${r0(jw * 0.05)},${r0(jw * 1.6)}" fill="none" stroke="${P.clayShade}" stroke-width="${f(Math.max(2, jw * 0.18))}"/>`
      + `<ellipse cx="${r0(jt[0])}" cy="${r0(jt[1])}" rx="${r0(jw * 0.42)}" ry="${r0(jw * 0.12)}" fill="#2a1a12"/>`);
    const cp = pr(-0.25, ty, 4.25), cw = V ? 14 : 12;
    S.add(`<path d="M${r0(cp[0] - cw)},${r0(cp[1] - cw * 1.3)}h${cw * 2}l-2,${r0(cw * 1.3)}h${-(cw * 2 - 4)}z" fill="${P.clayShade}"/><ellipse cx="${r0(cp[0])}" cy="${r0(cp[1] - cw * 1.3)}" rx="${cw}" ry="3" fill="#2a1a12"/>`);
    }
    // a stool, a coil of old rope and a crate by the wall
    const st = pr(-1.5, 0, 4.0);
    S.add(`<path d="${pr.quad([[-1.75, 0.45, 3.8], [-1.35, 0.45, 3.8], [-1.35, 0.45, 4.2], [-1.75, 0.45, 4.2]])}" fill="${P.woodLit}"/><path d="${pl(pr.poly([[-1.7, 0, 3.85], [-1.7, 0.45, 3.85]])) + pl(pr.poly([[-1.4, 0, 3.85], [-1.4, 0.45, 3.85]]))}" stroke="${P.woodDark}" stroke-width="6"/>`);
    void st;
    if (V) S.add(lantern(pr, LAMP, { lit: night }));
  }
  if (V) towerFloorAfter(S, R, pr, { mode, night, broken, lamp: LAMP });
  if (V) return towerGrade(S, { mode, night, lampXY });

  // ---- grade: cool fog haze, darker corners -------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#c8d0d6', 0.08], [0.5, '#c8d0d6', 0], [1, '#0a0c10', 0.4]])}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.5, '#0a0c10', 0], [1, '#0a0c10', 0.55]], 'cx="0.52" cy="0.45" r="0.78"')}"/>`);
  // the dialogue band: the floor and the lowest steps sink a little further into shade
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#0a0c10', 0], [1, '#0a0c10', 0.45]])}"/>`);
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// chapter 13 variants of the tower base: the glazed window on the back wall, the braced table, the small lamp
// ---------------------------------------------------------------------------------------------
// the furniture at night: the day colours sunk into the dark and warmed a little by the lamp
const nightTone = (c) => mix(mix(c, '#06080e', 0.62), '#ffb060', 0.1);
const NIGHT_FURN = Object.fromEntries(Object.entries(LH).map(([k, v]) => [k, typeof v === 'string' ? nightTone(v) : v]));
// the window: a deep-set casement low in the back wall, behind the table (angles in degrees round the tower axis)
const WIN = { a0: -21, a1: 3, y0: 0.62, y1: 2.0, arch: 0.1, mid: 1.3 };
const GLASS_Z = 3.0 + 3.4 * Math.cos(9 * RAD); // (the window is centred at -9°) // the back wall's depth at the window centre: the mirror plane

function towerWindow(S, pr, cyl, { mode, night, broken, lamp }) {
  const R = S.R;
  const n = 10, top = [], bot = [];
  for (let i = 0; i <= n; i++) {
    const a = WIN.a0 + (WIN.a1 - WIN.a0) * i / n;
    bot.push(cyl(a, WIN.y0, 3.38));
    top.push(cyl(a, WIN.y1 + WIN.arch * Math.sin(Math.PI * i / n), 3.38));
  }
  const outline = [...bot, ...top.reverse()];
  const op = pz(pr.poly(outline));
  const zv = (z) => 2 * GLASS_Z - z; // mirror image depth
  const px = (v) => f(v, 1);
  // the reveal: a deep stone jamb round the casement, the sill catching the light
  const deep = outline.map(([x, y, z]) => { const k = 3.9 / 3.38; return [x * k, y, 3.0 + (z - 3.0) * k]; });
  let s = `<path d="${op}" fill="${night ? '#1a1d24' : LH.stoneShade}"/>`;
  s += `<path d="${pz(pr.poly([outline[0], outline[n], deep[n], deep[0]]))}" fill="${night ? '#3a3430' : LH.stoneLit}"/>`;
  const gp = pz(pr.poly(deep));
  const gc = S.clip(gp);
  let inner = '';
  if (!broken) {
    // black glass: the room's lamp, the table edge and two blurred figures in it; rain beading outside
    inner += `<path d="${gp}" fill="${S.lin([[0, '#0c111a'], [0.6, '#06080e'], [1, '#0a0c12']])}"/>`;
    const tq = [[-1.15, 0.78, zv(4.0)], [0.05, 0.78, zv(4.0)], [0.05, 0.78, zv(4.8)], [-1.15, 0.78, zv(4.8)]];
    inner += `<path d="${pr.quad(tq)}" fill="#6a4a30" opacity=".5"/>`;
    // figures in the room behind the viewer, mirrored: soft warm shapes, lit on the lamp side, no faces
    let fig = '';
    for (const [x, z, h, sit] of [[-0.95, 2.1, 1.74, false], [0.25, 2.6, 1.22, true], [-0.35, 1.7, 1.62, false]]) {
      const head = pr(x, h - 0.12, zv(z)), neck = pr(x, h - 0.27, zv(z)), sh = pr(x - 0.22, h - 0.36, zv(z)), sh2 = pr(x + 0.22, h - 0.36, zv(z));
      const foot = pr(x, sit ? 0.45 : 0.3, zv(z));
      const hr = Math.abs(neck[1] - head[1]) * 0.85;
      fig += `<ellipse cx="${px(head[0])}" cy="${px(head[1])}" rx="${px(hr * 0.82)}" ry="${px(hr)}"/>`;
      fig += `<path d="M${px(neck[0] - hr * 0.5)},${px(neck[1])}L${px(sh[0])},${px(sh[1])}L${px(sh[0] + hr * 0.2)},${px(foot[1])}L${px(sh2[0] - hr * 0.2)},${px(foot[1])}L${px(sh2[0])},${px(sh2[1])}L${px(neck[0] + hr * 0.5)},${px(neck[1])}Z"/>`;
    }
    inner += `<g fill="#8a6440" opacity=".55" filter="${S.blur(1)}">${fig}</g>`;
    // the lamp's reflection: a warm point with a halo, a little above the real one (it is twice as far away)
    const lv = pr(lamp[0], lamp[1] + 0.13, zv(lamp[2]));
    inner += `<circle cx="${px(lv[0])}" cy="${px(lv[1])}" r="26" fill="#ffb060" opacity=".28" filter="${S.blur(2)}"/>`;
    inner += `<circle cx="${px(lv[0])}" cy="${px(lv[1])}" r="9" fill="#ffc878" opacity=".55"/><ellipse cx="${px(lv[0])}" cy="${px(lv[1])}" rx="3" ry="4.5" fill="#fff0c8"/>`;
    // a faint sheen across the pane
    const b = pr.poly(deep);
    const xs = b.map((q) => q[0]), ys = b.map((q) => q[1]);
    const X0 = Math.min(...xs), X1 = Math.max(...xs), Y0 = Math.min(...ys), Y1 = Math.max(...ys);
    inner += `<path d="M${px(X0)},${px(Y0 + (Y1 - Y0) * 0.55)}L${px(X0 + (X1 - X0) * 0.55)},${px(Y0)}L${px(X0 + (X1 - X0) * 0.75)},${px(Y0)}L${px(X0)},${px(Y0 + (Y1 - Y0) * 0.85)}Z" fill="#8a9ab8" opacity=".06"/>`;
    // raindrops beading on the glass and a few runs
    let dots = '', runs = '';
    for (let i = 0; i < 46; i++) { const x = R.range(X0, X1), y = R.range(Y0, Y1); dots += `<ellipse cx="${px(x)}" cy="${px(y)}" rx="${px(R.range(0.9, 2))}" ry="${px(R.range(1.2, 2.6))}"/>`; }
    for (let i = 0; i < 7; i++) { const x = R.range(X0 + 4, X1 - 4), y = R.range(Y0, Y0 + (Y1 - Y0) * 0.5); runs += `M${px(x)},${px(y)}q${px(R.range(-3, 3))},${px((Y1 - Y0) * 0.25)} ${px(R.range(-2, 2))},${px(R.range(30, (Y1 - Y0) * 0.6))}`; }
    inner += `<g fill="#a8b8d0" opacity=".38">${dots}</g><path d="${runs}" fill="none" stroke="#a8b8d0" stroke-width="1.4" opacity=".3"/>`;
    // the lamp side of the frame catches the light
  } else {
    // the pane is gone: the night (or the dawn) outside, rain driving past; jagged shards left in the frame
    inner += `<path d="${gp}" fill="${night ? S.lin([[0, '#1c2434'], [1, '#0a0e16']]) : S.lin([[0, '#e8e0dc'], [0.6, '#cfcdd0'], [1, '#aab0b8']])}"/>`;
    const b = pr.poly(deep);
    const xs = b.map((q) => q[0]), ys = b.map((q) => q[1]);
    const X0 = Math.min(...xs), X1 = Math.max(...xs), Y0 = Math.min(...ys), Y1 = Math.max(...ys);
    if (night) {
      let rn = '';
      for (let i = 0; i < 40; i++) { const x = R.range(X0 - 30, X1), y = R.range(Y0 - 30, Y1); rn += `M${px(x)},${px(y)}l${px(8)},${px(R.range(24, 44))}`; }
      inner += `<path d="${rn}" stroke="#a8b8cc" stroke-width="1.3" opacity=".45"/>`;
    } else {
      inner += `<path d="M${px(X0)},${px(Y0 + (Y1 - Y0) * 0.62)}Q${px((X0 + X1) / 2)},${px(Y0 + (Y1 - Y0) * 0.56)} ${px(X1)},${px(Y0 + (Y1 - Y0) * 0.64)}V${px(Y1)}H${px(X0)}Z" fill="#8a9098" opacity=".45"/>`;
    }
    // shards: teeth of glass round the frame (in the frame's own coordinates u = 0..1 across, v = 0..1 up)
    const at = (u, v) => { const a = WIN.a0 + (WIN.a1 - WIN.a0) * u, y = WIN.y0 + (WIN.y1 - WIN.y0) * v; return pr(...cyl(a, y, 3.9)); };
    const shards = [[[0, 1], [0.32, 1], [0.12, 0.7]], [[0.3, 1], [0.6, 1], [0.48, 0.82]], [[0.6, 1], [1, 1], [0.86, 0.6]], [[1, 0.9], [1, 0.3], [0.8, 0.52]], [[0, 0.8], [0, 0.35], [0.22, 0.5]], [[0, 0.3], [0, 0], [0.3, 0]], [[0.7, 0], [1, 0], [1, 0.24]]];
    let sd = '', se = '';
    for (const sh of shards) { const q = sh.map(([u, v]) => at(u, v)); sd += pz(q); se += pl([q[1], q[2], q[0]]); }
    inner += `<path d="${sd}" fill="${night ? '#2a3040' : '#c0c6cc'}" opacity=".85"/><path d="${se}" fill="none" stroke="${night ? '#c8d4e8' : '#ffffff'}" stroke-width="1.6" opacity=".7"/>`;
  }
  s += `<g clip-path="${gc}">${inner}</g>`;
  // the casement frame: a wooden surround, one mullion, one transom (the broken one hangs from its upper joint)
  const fw = (k) => Math.max(3, 0.075 / pr.depth(...cyl(-9, 1.1, 3.9)) * 600 * k);
  const fr = (a, y) => cyl(a, y, 3.88);
  const mA = (WIN.a0 + WIN.a1) / 2;
  const frame = night ? '#3a2a1e' : '#4a3a2e', frameLit = night ? '#9a6a3e' : '#7a6450';
  let fd = pl(pr.poly(deep)) + 'Z';
  let md = '';
  const topY = WIN.y1 + WIN.arch;
  if (!broken) {
    md += pl([pr(...fr(mA, WIN.y0)), pr(...fr(mA, topY))]);
    const tr = [];
    for (let a = WIN.a0; a <= WIN.a1 + 0.01; a += (WIN.a1 - WIN.a0) / 6) tr.push(pr(...fr(a, WIN.mid)));
    md += pl(tr);
  } else {
    md += pl([pr(...fr(mA, topY)), pr(...fr(mA + 1.2, WIN.mid + 0.14))]);
    md += pl([pr(...fr(WIN.a0, WIN.mid)), pr(...fr(WIN.a0 + 4.5, WIN.mid - 0.05))]);
  }
  s += `<path d="${fd}" fill="none" stroke="${frame}" stroke-width="${f(fw(1.3))}" stroke-linejoin="round"/>`;
  s += `<path d="${md}" fill="none" stroke="${frame}" stroke-width="${f(fw(0.8))}" stroke-linecap="round"/>`;
  // the lit (right-hand, lamp-side) edge of the surround and the sill
  const lit = [];
  for (let i = 0; i <= n; i++) lit.push(pr(...fr(WIN.a0 + (WIN.a1 - WIN.a0) * i / n, WIN.y0 - 0.02)));
  s += `<path d="${pl(lit)}" fill="none" stroke="${frameLit}" stroke-width="2.5" opacity=".7"/>`;
  s += `<path d="${pl([pr(...fr(WIN.a1, WIN.y0)), pr(...fr(WIN.a1, topY))])}" fill="none" stroke="${frameLit}" stroke-width="2" opacity=".5"/>`;
  S.add(s);
}

// the table pushed over to the window and stood on its end, its top leaning into the frame, legs into the room
function bracedTable(pr, P, { night }) {
  const x0 = -1.0, x1 = -0.14, LEN = 1.22, L = 0.7, th = 18 * RAD;
  const zb = GLASS_Z - 0.62; // the foot of the board on the floor; it leans back until its top edge meets the frame
  const F = (x, s, out = 0) => [x, s * Math.cos(th) + out * Math.sin(th), zb + s * Math.sin(th) - out * Math.cos(th)];
  const q = (pts) => pr.quad(pts);
  let s = '';
  // its shadow on the floor
  s += `<path d="${q([[x0 - 0.05, 0.002, zb + 0.3], [x1 + 0.05, 0.002, zb + 0.3], [x1 + 0.12, 0.002, zb - 0.55], [x0, 0.002, zb - 0.55]])}" fill="#05060a" opacity="${night ? '.5' : '.3'}"/>`;
  // the underside of the top, facing the room: three planks running up, a cleat across
  s += `<path d="${q([F(x0, 0), F(x1, 0), F(x1, LEN), F(x0, LEN)])}" fill="${P.wood}"/>`;
  s += `<path d="${pl(pr.poly([F(x0 + 0.29, 0), F(x0 + 0.29, LEN)])) + pl(pr.poly([F(x0 + 0.58, 0), F(x0 + 0.58, LEN)]))}" stroke="${P.woodDark}" stroke-width="2"/>`;
  // its top edge (resting on the frame) and its lamp-side edge: the thickness of the board
  s += `<path d="${q([F(x0, LEN), F(x1, LEN), F(x1, LEN, -0.07), F(x0, LEN, -0.07)])}" fill="${P.woodLit}"/>`;
  s += `<path d="${q([F(x1, 0), F(x1, 0, -0.07), F(x1, LEN, -0.07), F(x1, LEN)])}" fill="${P.woodLit}"/>`;
  // the apron: rails standing off the board
  const ax0 = x0 + 0.08, ax1 = x1 - 0.08, as0 = 0.08, as1 = LEN - 0.08, ao = 0.1;
  const aw = (x, sv) => f(Math.max(3, 0.06 / pr.depth(...F(x, sv, ao)) * 600));
  s += `<path d="${pl(pr.poly([F(ax0, as0, ao), F(ax1, as0, ao), F(ax1, as1, ao), F(ax0, as1, ao)]))}Z" fill="none" stroke="${P.woodDark}" stroke-width="${aw(ax0, 0.6)}" stroke-linejoin="round"/>`;
  s += `<path d="${pl(pr.poly([F(ax0, as1, ao + 0.03), F(ax1, as1, ao + 0.03)]))}" stroke="${P.woodLit}" stroke-width="2" opacity=".7"/>`;
  // four legs sticking out into the room (and a little upward, as the board leans): dark core, lit upper face
  let legs = '', lit = '';
  const order = [[ax0, as0], [ax1, as0], [ax0, as1], [ax1, as1]];
  for (const [x, sv] of order) {
    const a = F(x, sv), b = F(x, sv, L);
    const w = f(Math.max(4, 0.075 / pr.depth(...F(x, sv, L / 2)) * 600));
    legs += `<path d="${pl(pr.poly([a, b]))}" stroke="${P.woodDark}" stroke-width="${w}" stroke-linecap="butt"/>`;
    lit += pl(pr.poly([[a[0] + 0.025, a[1] + 0.03, a[2]], [b[0] + 0.025, b[1] + 0.03, b[2]]]));
    // the leg's end grain, toward the room
    const e = pr(...b);
    legs += `<circle cx="${f(e[0])}" cy="${f(e[1])}" r="${f(Number(w) * 0.5)}" fill="${P.woodLit}"/>`;
  }
  s += legs + `<path d="${lit}" stroke="${P.woodLit}" stroke-width="2.2" opacity=".85"/>`;
  return s;
}

// a small tin lantern: base, glass chimney, cap, ring; lit = a flame and a halo
function lantern(pr, [x, y, z], { lit }) {
  const b = pr(x, y, z), t = pr(x, y + 0.24, z);
  const k = (b[1] - t[1]) / 0.24; // px per metre here
  const w = 0.055 * k, px = (v) => f(v, 1);
  let s = '';
  if (lit) s += `<ellipse cx="${px(b[0])}" cy="${px(b[1])}" rx="${px(w * 3)}" ry="${px(w * 0.8)}" fill="#ffb060" opacity=".22"/>`;
  s += `<rect x="${px(b[0] - w * 1.15)}" y="${px(b[1] - 0.04 * k)}" width="${px(w * 2.3)}" height="${px(0.04 * k)}" fill="#2a2620"/>`;
  s += `<rect x="${px(b[0] - w)}" y="${px(b[1] - 0.18 * k)}" width="${px(w * 2)}" height="${px(0.14 * k)}" fill="${lit ? '#ffcf8a' : '#5a6068'}" opacity="${lit ? '.9' : '.55'}"/>`;
  if (lit) s += `<path d="M${px(b[0])},${px(b[1] - 0.16 * k)}q${px(w * 0.55)},${px(0.06 * k)} 0,${px(0.1 * k)}q${px(-w * 0.55)},${px(-0.04 * k)} 0,${px(-0.1 * k)}Z" fill="#fff4d0"/>`;
  s += `<path d="M${px(b[0] - w)},${px(b[1] - 0.04 * k)}V${px(b[1] - 0.18 * k)}M${px(b[0] + w)},${px(b[1] - 0.04 * k)}V${px(b[1] - 0.18 * k)}" stroke="#1e1a16" stroke-width="2"/>`;
  s += `<path d="M${px(b[0] - w * 1.2)},${px(b[1] - 0.18 * k)}L${px(b[0])},${px(t[1] + 0.02 * k)}L${px(b[0] + w * 1.2)},${px(b[1] - 0.18 * k)}Z" fill="#2a2620"/>`;
  s += `<path d="M${px(b[0] - w * 0.5)},${px(t[1] + 0.03 * k)}a${px(w * 0.5)},${px(w * 0.5)} 0 1 1 ${px(w)},0" fill="none" stroke="#2a2620" stroke-width="2"/>`;
  return s;
}

// after the furniture: the lamp's pool of light, rain blowing in through the broken pane, water and glass on the floor
function towerFloorAfter(S, R, pr, { mode, night, broken, lamp }) {
  const lx = pr(...lamp);
  const px = (v) => f(v, 1);
  if (night) {
    S.add(`<ellipse cx="${px(lx[0])}" cy="${px(lx[1] - 18)}" rx="44" ry="44" fill="#ffb060" opacity=".3" filter="${S.blur(2)}"/>`);
    const fl = pr(lamp[0], 0, lamp[2]);
    S.add(`<ellipse cx="${px(fl[0])}" cy="${px(fl[1])}" rx="300" ry="70" fill="#ffa050" opacity=".08" filter="${S.blur(3)}"/>`);
  }
  if (!broken) return;
  // water spreading from under the window across the flagstones
  const pud = (x, z, rx, rz, seed) => {
    const pts = [];
    for (let a = 0; a < 360; a += 24) { const k = 0.75 + 0.25 * Math.sin(a * RAD * 3 + seed); pts.push(pr(x + Math.sin(a * RAD) * rx * k, 0.002, z + Math.cos(a * RAD) * rz * k)); }
    return pz(pts);
  };
  const wet = night ? pud(-0.5, 5.0, 1.0, 0.9, 1) + pud(0.35, 4.3, 0.55, 0.45, 2) + pud(-1.2, 4.2, 0.4, 0.3, 3) : pud(-0.55, 5.2, 0.8, 0.6, 1);
  S.add(`<path d="${wet}" fill="${night ? '#3a4a66' : '#aab2ba'}" opacity="${night ? '.28' : '.12'}"/><path d="${wet}" fill="none" stroke="${night ? '#6a7a96' : '#dfe3e6'}" stroke-width="1.5" opacity="${night ? '.25' : '.22'}"/>`);
  // shards of glass on the floor (at dawn swept into a little heap by the wall)
  let sh = '';
  const N = night ? 26 : 12;
  for (let i = 0; i < N; i++) {
    const x = night ? R.range(-1.4, 0.6) : R.range(0.35, 0.75), z = night ? R.range(4.4, 5.9) : R.range(5.6, 5.9);
    const c = pr(x, 0, z), s = R.range(3, 7) * 4 / (z - 1.15);
    sh += `M${px(c[0])},${px(c[1] - s)}l${px(s * 0.9)},${px(s * 1.2)}l${px(-s * 1.6)},${px(-s * 0.3)}Z`;
  }
  S.add(`<path d="${sh}" fill="${night ? '#b8c6dc' : '#f4f6f8'}" opacity="${night ? '.55' : '.75'}"/>`);
  if (night) {
    // rain driving in over the top of the table, spattering on the flagstones in front of it
    let rn = '';
    for (let i = 0; i < 40; i++) {
      const x = R.range(-1.0, -0.1), y = R.range(1.25, 1.8), z = GLASS_Z - R.range(0.2, 1.6);
      const p0 = pr(x, y, z), p1 = pr(x + 0.05, y - 0.35, z - 0.25);
      rn += `M${px(p0[0])},${px(p0[1])}L${px(p1[0])},${px(p1[1])}`;
    }
    S.add(`<path d="${rn}" stroke="#a8b8cc" stroke-width="1.3" opacity=".26"/>`);
    let sp = '';
    for (let i = 0; i < 30; i++) { const c = pr(R.range(-1.2, 0.2), 0, R.range(4.6, 5.7)); sp += `M${px(c[0] - 5)},${px(c[1])}l3,-5M${px(c[0] + 5)},${px(c[1])}l-3,-5`; }
    S.add(`<path d="${sp}" stroke="#a8b8cc" stroke-width="1.2" opacity=".4"/>`);
  }
}

function towerGrade(S, { mode, night, lampXY }) {
  if (night) {
    S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#ffb060', 0.14], [0.5, '#ffb060', 0.04], [1, '#ffb060', 0]], `gradientUnits="userSpaceOnUse" cx="${f(lampXY[0], 0)}" cy="${f(lampXY[1], 0)}" r="620"`)}"/>`);
    S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.5, '#040508', 0], [1, '#040508', 0.6]], 'cx="0.5" cy="0.45" r="0.78"')}"/>`);
    S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#040508', 0], [1, '#040508', 0.5]])}"/>`);
  } else {
    // dawn: the day grade with a touch of the pale morning in the haze
    S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#e8d8d4', 0.12], [0.5, '#c8d0d6', 0], [1, '#0a0c10', 0.4]])}"/>`);
    S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.5, '#0a0c10', 0], [1, '#0a0c10', 0.5]], 'cx="0.5" cy="0.45" r="0.78"')}"/>`);
    S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#0a0c10', 0], [1, '#0a0c10', 0.45]])}"/>`);
  }
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// night rain: the lamp room at the top of the stair
// ---------------------------------------------------------------------------------------------
function lampRoomRain() {
  const S = new Scene('sbLighthouseRain', '雾港·旧灯塔·灯室·夜雨：旧灯塔顶上的灯室，最后几级石阶从地板的方口升上来，口下透出一点暖光；中央的铁透镜架空着，没有透镜；一圈高窗只剩窗框、没有玻璃，窗外是夜雨与黑色的水面，对岸是一排低矮的木屋顶；没有人', 7413);
  const R = S.R;
  const P = LH;
  const pr = camera({ cx: 800, cy: 470, F: 640, eye: 1.6, pitch: -6 });
  const HZ = pr(0, 1.6, 4000)[1]; // the horizon
  const OR = 3.3, CZ = 2.9; // octagon circumradius, centre depth
  const Y0 = 1.0, Y1 = 2.9, Y2 = 3.25, APEX = 4.8;
  const oct = (i, y, r = OR) => { const a = (i * 45 + 22.5) * RAD; return [Math.sin(a) * r, y, CZ + Math.cos(a) * r]; };

  // ---- outside: rain sky, the opposite shore, the channel ------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(P.nSky, `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${r0(HZ)}"`)}"/>`);
  S.add(`<rect y="${r0(HZ - 2)}" width="${W}" height="${r0(H - HZ + 2)}" fill="${S.lin(P.nSea, `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(HZ)}" x2="0" y2="900"`)}"/>`);
  // low wooden rooftops of the opposite shore: a broken line of gables and lean-tos just above the water
  {
    let x = -40, d = '', lit = '', ridge = '';
    const base = r0(HZ + 14);
    while (x < 1180) {
      const w = R.range(60, 150), h = R.range(18, 46), kind = R();
      const x1 = x + w;
      if (kind < 0.55) { d += `M${r0(x)},${base}L${r0(x)},${r0(base - h)}L${r0(x + w / 2)},${r0(base - h - w * 0.28)}L${r0(x1)},${r0(base - h)}L${r0(x1)},${base}Z`; ridge += `M${r0(x - 3)},${r0(base - h + 2)}L${r0(x + w / 2)},${r0(base - h - w * 0.28)}L${r0(x1 + 3)},${r0(base - h + 2)}`; }
      else { d += `M${r0(x)},${base}L${r0(x)},${r0(base - h - 10)}L${r0(x1)},${r0(base - h)}L${r0(x1)},${base}Z`; ridge += `M${r0(x - 3)},${r0(base - h - 10)}L${r0(x1 + 3)},${r0(base - h)}`; }
      if (R() < 0.18) lit += `<rect x="${r0(x + w * 0.4)}" y="${r0(base - h * 0.7)}" width="7" height="8" fill="${P.nWin}" opacity="${f(R.range(0.35, 0.7), 2)}"/>`;
      // chimney stubs and stilts
      if (R() < 0.3) d += `M${r0(x + w * 0.7)},${r0(base - h - 4)}h8v-22h-8z`;
      x = x1 + R.range(-8, 14);
    }
    S.add(`<path d="${d}" fill="${P.nRoof}"/><path d="${ridge}" fill="none" stroke="${P.nRoofLit}" stroke-width="2" opacity=".8"/>${lit}`);
    let st = '';
    for (let xx = 0; xx < 1150; xx += R.range(18, 34)) st += `M${r0(xx)},${base}v${r0(R.range(8, 16))}`;
    S.add(`<path d="${st}" stroke="${P.nRoof}" stroke-width="3"/>`);
    // a lamp's reflection broken on the water, rain rings
    let rings = '';
    for (let i = 0; i < 40; i++) { const y = R.range(HZ + 30, 900), k = (y - HZ) / (H - HZ); rings += `<ellipse cx="${r0(R.range(0, W))}" cy="${r0(y)}" rx="${f(4 + 22 * k)}" ry="${f(1 + 4 * k)}"/>`; }
    S.add(`<g fill="none" stroke="#5a6a80" stroke-width="1.2" opacity=".45">${rings}</g>`);
    S.add(`<rect y="${r0(HZ + 16)}" width="1150" height="10" fill="${P.nWin}" opacity=".06"/>`);
  }
  // rain: long thin slanted streaks, two densities
  {
    let d1 = '', d2 = '';
    for (let i = 0; i < 260; i++) { const x = R.range(-100, W), y = R.range(-40, H), L = R.range(30, 70); d1 += `M${r0(x)},${r0(y)}l${r0(L * 0.22)},${r0(L)}`; }
    for (let i = 0; i < 90; i++) { const x = R.range(-100, W), y = R.range(-40, H), L = R.range(70, 130); d2 += `M${r0(x)},${r0(y)}l${r0(L * 0.24)},${r0(L)}`; }
    S.add(`<path d="${d1}" stroke="${P.nRain}" stroke-width="1" opacity=".22"/><path d="${d2}" stroke="${P.nRain}" stroke-width="1.6" opacity=".2"/>`);
  }

  // ---- the lamp room: parapet, empty window frames, header, the roof's underside ---------------------------
  {
    const faces = [];
    for (let i = 0; i < 8; i++) {
      const j = (i + 1) % 8;
      const a = oct(i, 0), b = oct(j, 0);
      const d = pr.depth((a[0] + b[0]) / 2, 1.6, (a[2] + b[2]) / 2);
      if (d < 0.3 || a[2] < 0.15 || b[2] < 0.15) continue;
      faces.push({ i, j, d });
    }
    faces.sort((u, v) => v.d - u.d);
    // the roof cone's underside first (behind everything above the header)
    let roof = '';
    for (const { i, j } of faces) roof += pr.quad([oct(i, Y2), oct(j, Y2), [0, APEX, CZ], [0, APEX, CZ]]);
    S.add(`<path d="${roof}" fill="#0e1016"/>`);
    let rafters = '';
    for (let i = 0; i < 8; i++) if (oct(i, Y2)[2] > 0.4) rafters += pl(pr.poly([oct(i, Y2), [0, APEX, CZ]]));
    S.add(`<path d="${rafters}" stroke="#1e222a" stroke-width="5"/>`);
    let s = '';
    for (const { i, j } of faces) {
      const lit = Math.max(0, -Math.sin((i * 45 + 45) * RAD)) * 0.5 + 0.12;
      const wall = mix(P.nStone, P.nStoneLit, lit);
      // parapet below the windows, header above
      s += `<path d="${pr.quad([oct(i, 0), oct(i, Y0), oct(j, Y0), oct(j, 0)])}" fill="${wall}"/>`;
      s += `<path d="${pr.quad([oct(i, Y1), oct(i, Y2), oct(j, Y2), oct(j, Y1)])}" fill="${mix(wall, '#000000', 0.25)}"/>`;
      // sill (inner ledge) and its wet lit edge
      const si = (k, y) => oct(k, y, OR - 0.16);
      s += `<path d="${pr.quad([oct(i, Y0), oct(j, Y0), si(j, Y0), si(i, Y0)])}" fill="${mix(wall, '#9aaccc', 0.18)}"/>`;
      s += `<path d="${pl(pr.poly([si(i, Y0), si(j, Y0)]))}" stroke="#7a8aa6" stroke-width="2" opacity=".55"/>`;
      // the empty frames: corner posts, a middle mullion, a transom — no glass
      const m = (y) => { const A = oct(i, y), B = oct(j, y); return [(A[0] + B[0]) / 2, y, (A[2] + B[2]) / 2]; };
      const w = (k) => Math.max(3, 70 / pr.depth(...oct(k, 2)));
      s += `<path d="${pl(pr.poly([oct(i, Y0), oct(i, Y1)]))}" stroke="${P.nIron}" stroke-width="${f(w(i) * 1.5)}"/>`;
      s += `<path d="${pl(pr.poly([m(Y0), m(Y1)]))}" stroke="${P.nIron}" stroke-width="${f(w(i) * 0.7)}"/>`;
      s += `<path d="${pl(pr.poly([oct(i, 2.05), oct(j, 2.05)]))}" stroke="${P.nIron}" stroke-width="${f(w(i) * 0.6)}"/>`;
      // a broken pane-stay hanging loose in one frame
      if (i === 7) s += `<path d="${pl(pr.poly([m(2.05), [m(2.05)[0] + 0.3, 1.5, m(2.05)[2]]]))}" stroke="${P.nIron}" stroke-width="${f(w(i) * 0.35)}"/>`;
    }
    S.add(s);
    // rain blowing in over the sills: short streaks just inside, wet sheen on the floor below the windows
    let wet = '';
    for (const { i, j } of faces) {
      for (let t = 0.1; t < 1; t += 0.2) {
        const A = oct(i, Y0, OR - 0.25), B = oct(j, Y0, OR - 0.25);
        const x = A[0] + (B[0] - A[0]) * t, z = A[2] + (B[2] - A[2]) * t;
        wet += pl(pr.poly([[x, Y0 + 0.5, z], [x + 0.06, Y0 + 0.1, z - 0.05]]));
      }
    }
    S.add(`<path d="${wet}" stroke="${P.nRain}" stroke-width="1.4" opacity=".3"/>`);
  }
  // ---- the floor: iron plates, wet; the warm glow from the hatch ---------------------------------------
  {
    const flr = [];
    for (let i = 0; i <= 8; i++) { const p = oct(i % 8, 0); if (p[2] > 0.2) flr.push(pr(...p)); }
    const fp = pz([...flr, [W + 300, H + 300], [-300, H + 300]]);
    S.add(`<path d="${fp}" fill="${S.lin([[0, '#262a32'], [1, '#0c0e12']], 'gradientUnits="userSpaceOnUse" x1="0" y1="560" x2="0" y2="900"')}"/>`);
    const fc = S.clip(fp);
    const puddle = (x, z, rx, rz) => { const pts = []; for (let a = 0; a < 360; a += 30) pts.push(pr(x + Math.sin(a * RAD) * rx, 0.001, z + Math.cos(a * RAD) * rz)); return `<path d="${pz(pts)}" fill="#4a5a76" opacity=".22"/><path d="${pl([pr(x - rx * 0.5, 0.002, z), pr(x + rx * 0.2, 0.002, z - rz * 0.3)])}" stroke="#8a9ab8" stroke-width="1.5" opacity=".4"/>`; };
    let plates = '';
    for (let x = -OR; x <= OR; x += 0.7) plates += pl([pr(x, 0, 0.9), pr(x, 0, CZ + OR)]);
    for (let z = 1.2; z < CZ + OR; z += 0.7) plates += pl([pr(-OR, 0, z), pr(OR, 0, z)]);
    S.add(`<g clip-path="${fc}"><path d="${plates}" stroke="#05060a" stroke-width="2" opacity=".6"/>`
      + puddle(-1.6, 5.0, 0.9, 0.4) + puddle(2.2, 3.6, 0.6, 0.35) + puddle(1.4, 5.4, 0.7, 0.3) + `</g>`);
  }
  // ---- the empty lens cage at the centre ----------------------------------------------------------------
  S.add(lensCage(pr, { x: 0.35, z: CZ + 0.4, y0: 0.62, r: 0.62, h: 1.75, bars: 12, iron: '#06070a', lit: '#8a9ab8', drum: '#1e2228', drumLit: '#323844' }));
  // ---- the stair hatch in the foreground: the last steps rising from below, warm light from the room under ------
  {
    const hx0 = -2.0, hx1 = -0.8, hz0 = 2.2, hz1 = 3.2;
    const hole = pr.quad([[hx0, 0, hz0], [hx1, 0, hz0], [hx1, 0, hz1], [hx0, 0, hz1]]);
    S.add(`<path d="${hole}" fill="#0e0907"/>`);
    const hc = S.clip(hole);
    // the spiral's last steps turning down out of sight, each lit warm from the lamp in the room below
    let st = '';
    const steps = [[-0.22, hx0, hx1, 2.75, 3.2], [-0.44, hx0, hx1 - 0.25, 2.4, 2.75], [-0.66, hx0, hx1 - 0.55, 2.2, 2.4]];
    for (const [y, x0, x1, z0, z1] of steps) {
      st += `<path d="${pr.quad([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]])}" fill="${mix('#8a6a48', '#2a1c12', -y * 0.9)}"/>`;
      st += `<path d="${pr.quad([[x0, y, z0], [x1, y, z0], [x1, y - 0.22, z0], [x0, y - 0.22, z0]])}" fill="${mix('#4a3626', '#120c08', -y * 0.9)}"/>`;
      st += `<path d="${pl(pr.poly([[x0, y, z0], [x1, y, z0]]))}" stroke="${P.nGlow}" stroke-width="2" opacity="${f(0.6 + y * 0.6, 2)}"/>`;
    }
    // the stone shaft wall of the stair well on the far side, warm at the bottom
    st += `<path d="${pr.quad([[hx0, 0, hz1], [hx1, 0, hz1], [hx1, -1.2, hz1], [hx0, -1.2, hz1]])}" fill="${S.lin([[0, '#2a1e16'], [1, '#6a4a30']])}"/>`;
    S.add(`<g clip-path="${hc}">${st.split('<path').slice(-1).map((x) => '<path' + x).join('')}${st.split('<path').slice(1, -1).map((x) => '<path' + x).join('')}</g>`);
    const gc = pr((hx0 + hx1) / 2, 0.3, (hz0 + hz1) / 2);
    S.add(`<ellipse cx="${r0(gc[0])}" cy="${r0(gc[1])}" rx="260" ry="120" fill="${P.nGlow}" opacity=".12" filter="${S.blur(3)}"/>`);
    // the iron rail round the hatch
    const rl = [[hx0, 0, hz1], [hx0, 0.95, hz1], [hx1, 0.95, hz1], [hx1, 0, hz1]];
    S.add(`<path d="${pl(pr.poly(rl)) + pl(pr.poly([[hx1, 0.95, hz1], [hx1, 0.95, hz0 + 0.3], [hx1, 0, hz0 + 0.3]]))}" fill="none" stroke="${P.nIron}" stroke-width="7" stroke-linejoin="round"/>`);
    S.add(`<path d="${pl(pr.poly([[hx0, 0.95, hz1], [hx1, 0.95, hz1], [hx1, 0.95, hz0 + 0.3]]))}" fill="none" stroke="${P.nGlow}" stroke-width="2" opacity=".35"/>`);
    // the hatch edge catching the warm light
    S.add(`<path d="${pl(pr.poly([[hx0, 0, hz1], [hx1, 0, hz1], [hx1, 0, hz0]]))}" fill="none" stroke="${P.nGlow}" stroke-width="2.5" opacity=".4"/>`);
  }
  // ---- grade: cold night, darker corners ----------------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.45, '#05060a', 0], [1, '#05060a', 0.65]], 'cx="0.5" cy="0.48" r="0.78"')}"/>`);
  return S.out();
}

export const lighthouseBgs = {
  'fog-harbor-old-lighthouse': () => towerBase(),
  'fog-harbor-old-lighthouse-rain': () => lampRoomRain(),
  'fog-harbor-old-lighthouse-night': () => towerBase('night'),
  'fog-harbor-old-lighthouse-night-broken': () => towerBase('night-broken'),
  'fog-harbor-old-lighthouse-dawn': () => towerBase('dawn'),
};
