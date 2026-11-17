// 番外 ex009 的场景背景（剧本/番外/ex009南岸的龍舟祭.md〈美術需求〉）：verdant-south-beach（翠影南岸·海滩）、verdant-river-mouth-dragonboat（翠影南岸·河口·龙舟祭）。
//   verdant-south-beach            — 翠影南岸的沙滩，晴天：左边一棵往右斜的椰子树和一丛沼林的矮灌木（露根的红树），右边画框外
//                                    探进来半棵椰子树；中间是一层一层退下去的浪、湿沙带和干沙上的波纹、几枚贝壳；
//                                    右边天边一道长长的岬角（崖面朝左受光，顶上是林），脚下一圈白浪；沙上搁着一条小渔船。
//   verdant-river-mouth-dragonboat — 翠影南岸的河口，龙舟祭：宽阔的绿色河口，远处开向海；对岸是沼林和一排高脚木屋；
//                                    水上停着两条龙舟（近的一条红金、远的一条青白，船头是木雕龙头，桨搁在舷边，船上没有人）；
//                                    右边水里两根终点的木桩系着红布；近岸是木栈台，右下一面架在木架上的大鼓和两根鼓槌；
//                                    两边的旗杆挂着长幡，头顶拉着一串三角彩旗。
// 两张都不画人、不画字（彩旗与长幡只用色块和几何纹）；水一律平涂加水流线，不画倒影（coast.mjs 的规矩）。光从左上来。
import { Scene, W, H, f, pz, pl, cloud, bird, rng } from './lib.mjs';
import { currents, circ, treeLine, taper, sag } from './coast.mjs';

const r0 = (v) => f(v, 0);
const ell = (cx, cy, rx, ry) => `M${r0(cx - rx)},${r0(cy)}a${r0(rx)},${r0(ry)} 0 1 0 ${r0(rx * 2)},0a${r0(rx)},${r0(ry)} 0 1 0 ${r0(-rx * 2)},0Z`;
const quad = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
// point on a quadratic Bézier p0 -> p2 with control p1
const bez = (p0, p1, p2, t) => [(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]];

// ─── palm ───────────────────────────────────────────────────────────────────────────────────────
// One frond: a drooping spine from the crown with saw-toothed leaflets on both sides. Returns path data.
function frond(c, ang, len, droop, wid) {
  const a = ang * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a);
  const p2 = [c[0] + ux * len, c[1] + uy * len + droop], p1 = [c[0] + ux * len * 0.55, c[1] + uy * len * 0.55 - len * 0.18];
  const up = [], dn = [];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = bez(c, p1, p2, t), q = bez(c, p1, p2, Math.min(1, t + 0.01));
    let tx = q[0] - p[0], ty = q[1] - p[1];
    const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
    const nx = ty, ny = -tx, w = wid * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.6) * (i % 2 ? 1 : 0.42);
    const back = i % 2 ? -len * 0.05 : 0; // leaflet tips sweep back toward the crown
    up.push([p[0] + nx * w + tx * back, p[1] + ny * w + ty * back]);
    dn.unshift([p[0] - nx * w * 0.9 + tx * back, p[1] - ny * w * 0.9 + ty * back]);
  }
  return { leaf: pz([c, ...up, p2, ...dn]), rib: `M${r0(c[0])},${r0(c[1])}Q${r0(p1[0])},${r0(p1[1])} ${r0(p2[0])},${r0(p2[1])}` };
}
function palm(S, base, crown, ctrl, s, pal, fronds) {
  const out = [];
  out.push(`<path d="${taper(base, ctrl, crown, 30 * s, 15 * s, 14)}" fill="${pal.trunk}"/>`);
  out.push(`<path d="${taper([base[0] - 8 * s, base[1]], [ctrl[0] - 8 * s, ctrl[1]], [crown[0] - 4 * s, crown[1]], 9 * s, 4 * s, 14)}" fill="${pal.trunkLit}" opacity=".8"/>`);
  let rings = '';
  for (let t = 0.06; t < 0.97; t += 0.055) {
    const p = bez(base, ctrl, crown, t), q = bez(base, ctrl, crown, t + 0.01);
    let tx = q[0] - p[0], ty = q[1] - p[1];
    const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
    const w = (15 - 7.5 * t) * s;
    rings += `M${r0(p[0] + ty * w)},${r0(p[1] - tx * w)}L${r0(p[0] - ty * w)},${r0(p[1] + tx * w)}`;
  }
  out.push(`<path d="${rings}" stroke="${pal.ring}" stroke-width="${f(2.2 * s)}" opacity=".7"/>`);
  let back = '', front = '', ribs = '';
  for (const [ang, len, droop, wid, isFront] of fronds) {
    const fr = frond(crown, ang, len * s, droop * s, wid * s);
    if (isFront) front += fr.leaf; else back += fr.leaf;
    ribs += fr.rib;
  }
  out.push(`<path d="${back}" fill="${pal.shade}"/>`);
  out.push(`<path d="${front}" fill="${pal.lit}"/>`);
  out.push(`<path d="${ribs}" stroke="${pal.rib}" stroke-width="${f(2 * s)}" fill="none" opacity=".75"/>`);
  out.push(`<path d="${circ(crown[0] - 6 * s, crown[1] + 8 * s, 9 * s)}${circ(crown[0] + 8 * s, crown[1] + 10 * s, 8 * s)}${circ(crown[0] + 1 * s, crown[1] + 18 * s, 8 * s)}" fill="${pal.nut}"/>`);
  return out.join('');
}

// ─── verdant-south-beach ─────────────────────────────────────────────────────────────────────────
function southBeach() {
  const S = new Scene('sbEx009Beach', '翠影南岸·海滩：晴天的沙滩，左边一棵斜椰子树和露根的沼林灌木，层层退下的浪，右边天边一道长长的岬角，沙上一条小渔船，不画人', 9101);
  const R = rng(9102);
  const HZ = 420;
  // sky and sun glow (upper left)
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#7fbcd8'], [0.32, '#b4dbe8'], [0.47, '#e8f2ec']])}"/>`);
  S.add(`<circle cx="230" cy="90" r="520" fill="${S.rad([[0, '#fffbe4', 0.9], [0.22, '#fff6d6', 0.4], [1, '#fff6d6', 0]])}"/>`);
  const cc = { shade: '#cfe0ea', lit: '#ffffff', rim: '#fffdf0' };
  S.add(cloud(R, 560, 205, 300, 78, cc, { bumps: 7 }), cloud(R, 470, 230, 140, 40, cc, { bumps: 4 }), cloud(R, 980, 140, 220, 50, cc), cloud(R, 1290, 250, 170, 38, cc, { bumps: 5 }), cloud(R, 60, 330, 210, 36, cc, { bumps: 5 }));
  S.add(`<path d="${bird(820, 120, 1.1, 0.3)}${bird(860, 100, 0.8, 0.6)}${bird(1150, 175, 0.7, 0.2)}" fill="#5a7080" opacity=".7"/>`);
  // the headland on the right: hazy cliff lit from the left, forest on top, surf at its foot
  const head = [[760, HZ + 2], [830, 392], [900, 356], [990, 330], [1100, 312], [1230, 300], [1360, 304], [1480, 318], [1620, 326], [1620, HZ + 2]];
  S.add(`<path d="${pz(head)}" fill="#7f9a8a"/>`);
  S.add(`<path d="${pz([[760, HZ + 2], [830, 392], [900, 356], [990, 330], [1004, 352], [940, 392], [880, HZ + 2]])}" fill="#c8c2a4"/><path d="M760,${HZ + 1}L830,392L900,356L990,330" stroke="#f4eed4" stroke-width="3" fill="none" opacity=".85"/>`);
  S.add(`<path d="M880,${HZ + 2}L940,392L1004,352L1030,362L980,400L960,${HZ + 2}Z" fill="#a8a68e"/>`);
  { const top = [[990, 330], [1100, 312], [1230, 300], [1360, 304], [1480, 318], [1620, 326]];
    const yAt = (x) => { for (let i = 1; i < top.length; i++) if (x <= top[i][0]) { const t = (x - top[i - 1][0]) / (top[i][0] - top[i - 1][0]); return top[i - 1][1] + (top[i][1] - top[i - 1][1]) * t; } return top[top.length - 1][1]; };
    let cr = '';
    for (let x = 1000; x < 1640; x += R.range(12, 22)) { const r = R.range(7, 15) * Math.min(1, (x - 990) / 80); cr += circ(x, yAt(x) - r * 0.5 + 3, r); }
    S.add(`<path d="${cr}" fill="#5c7e6a"/>`); }
  S.add(`<path d="${pz([[1004, 352], [1100, 340], [1230, 330], [1360, 334], [1480, 344], [1620, 350], [1620, HZ + 2], [960, HZ + 2], [980, 400]])}" fill="#748f7e"/>`);
  S.add(`<path d="M750,${HZ + 1}Q840,${HZ - 5} 980,${HZ + 1}" stroke="#ffffff" stroke-width="4" fill="none" opacity=".85"/>`);
  S.add(`<rect x="740" y="280" width="880" height="${HZ - 278}" fill="${S.lin([[0, '#e6f0ec', 0], [1, '#e6f0ec', 0.5]])}"/>`);
  // sea: far band to the shallows
  S.add(`<path d="M0,${HZ}H${W}V700H0Z" fill="${S.lin([[0, '#4b97b0'], [0.35, '#5fb0bf'], [0.75, '#86cfc8'], [1, '#a8e0d0']])}"/>`);
  { let d = ''; for (let k = 0; k < 70; k++) { const t = R() ** 1.6, y = HZ + 6 + t * 150, x = R.range(0, 900) * (1 - t * 0.2), L = (8 + 50 * t) * R.range(0.5, 1.3); d += `M${r0(x)},${r0(y)}h${r0(L)}`; } S.add(`<path d="${d}" stroke="#f6fff8" stroke-width="2" stroke-linecap="round" opacity=".55"/>`); }
  S.add(currents(R, 0, W, HZ + 20, 600, 60, '#3d849c', 0.35));
  // shoreline (left lower than right): the wet band, then foam lines at three depths
  const shore = (x) => 640 + (x / W) * 18 + Math.sin(x / 210) * 8;
  const shoreLine = (dy, amp = 6, ph = 0) => { const pts = []; for (let x = -20; x <= W + 20; x += 40) pts.push([x, shore(x) + dy + Math.sin(x / 90 + ph) * amp]); return pts; };
  S.add(`<path d="${pz([...shoreLine(-70, 7, 1.3), [W + 20, H], [-20, H]])}" fill="#bfe8dc" opacity=".55"/>`);
  for (const [dy, op, sw] of [[-110, 0.5, 3], [-70, 0.7, 4], [-24, 0.95, 6]]) S.add(`<path d="${pl(shoreLine(dy, 7, dy / 30))}" stroke="#ffffff" stroke-width="${sw}" fill="none" stroke-linecap="round" opacity="${op}"/>`);
  // sand: wet band (darker), dry sand, ripple lines, shells
  S.add(`<path d="${pz([...shoreLine(-20, 6, 0.7), [W + 20, H], [-20, H]])}" fill="#cdb98e"/>`);
  S.add(`<path d="${pz([...shoreLine(14, 10, 2.1), [W + 20, H], [-20, H]])}" fill="${S.lin([[0, '#ead7a8'], [1, '#d8bd88']])}"/>`);
  S.add(`<path d="${pl(shoreLine(14, 10, 2.1))}" stroke="#f4e8c6" stroke-width="3" fill="none" opacity=".8"/>`);
  { let d = ''; for (let k = 0; k < 34; k++) { const y = R.range(700, 890), x = R.range(-40, W), L = R.range(60, 200) * (0.6 + (y - 700) / 300); d += `M${r0(x)},${r0(y)}q${r0(L / 2)},${r0(-R.range(3, 7))} ${r0(L)},0`; } S.add(`<path d="${d}" stroke="#bfa274" stroke-width="2" fill="none" opacity=".45"/>`); }
  { let sh = '', sl = ''; for (let k = 0; k < 14; k++) { const x = R.range(380, 1500), y = R.range(705, 880), s = 0.6 + (y - 700) / 220; sh += `M${r0(x - 7 * s)},${r0(y)}q${r0(7 * s)},${r0(-14 * s)} ${r0(14 * s)},0z`; sl += `M${r0(x)},${r0(y - 1)}l${r0(-4 * s)},${r0(-8 * s)}M${r0(x)},${r0(y - 1)}l${r0(4 * s)},${r0(-8 * s)}`; } S.add(`<path d="${sh}" fill="#f6e2d6"/><path d="${sl}" stroke="#c89a8a" stroke-width="1.2" opacity=".8"/>`); }
  // the fishing boat drawn up on the sand (right, mid-distance) and its shadow
  { const bx = 1120, by = 702, bw = 230;
    S.add(`<path d="${ell(bx + bw * 0.52, by + 8, bw * 0.58, 12)}" fill="#a88a5e" opacity=".55"/>`);
    S.add(`<path d="M${bx},${by - 34}Q${bx + bw * 0.5},${by - 26} ${bx + bw},${by - 44}L${bx + bw - 22},${by - 2}Q${bx + bw * 0.5},${by + 10} ${bx + 18},${by - 4}Z" fill="#7a5a3e"/>`);
    S.add(`<path d="M${bx + 6},${by - 30}Q${bx + bw * 0.5},${by - 22} ${bx + bw - 6},${by - 40}" stroke="#c89a62" stroke-width="5" fill="none"/><path d="M${bx + 12},${by - 16}Q${bx + bw * 0.5},${by - 6} ${bx + bw - 16},${by - 22}" stroke="#5a3e2a" stroke-width="3" fill="none" opacity=".6"/>`);
    S.add(`<path d="M${bx + 30},${by - 36}L${bx + 196},${by - 50}" stroke="#5a3e28" stroke-width="5" stroke-linecap="round"/><path d="M${bx + 190},${by - 56}l34,-4l1,10l-34,4z" fill="#5a3e28"/>`); }
  // a few stakes in the shallows (fish weirs), far right
  S.add(`<path d="M1380,${HZ + 70}v-26M1404,${HZ + 74}v-30M1430,${HZ + 72}v-24M1456,${HZ + 76}v-28" stroke="#5a5a48" stroke-width="4" stroke-linecap="round" opacity=".7"/>`);
  // marsh scrub at the left: low round bushes with stilt roots into the sand
  { let roots = ''; for (let k = 0; k < 9; k++) { const x0 = R.range(10, 320), y0 = 742; const dx = R.range(-26, 26); roots += `M${r0(x0)},${y0}q${r0(dx * 0.4)},${r0(R.range(14, 22))} ${r0(dx)},${r0(R.range(34, 56))}`; } S.add(`<path d="${roots}" stroke="#5a4632" stroke-width="4" fill="none" stroke-linecap="round"/>`); }
  { let dk = '', lt = '';
    for (const [x, r] of [[-10, 70], [60, 58], [130, 66], [200, 52], [262, 40], [312, 28], [30, 44], [170, 40]]) {
      const y = 736 - r * 0.62;
      dk += circ(x, y, r);
      lt += circ(x - r * 0.22, y - r * 0.28, r * 0.62);
    }
    S.add(`<path d="${dk}" fill="#36643f"/><path d="${lt}" fill="#5a9262"/><path d="M-20,732Q160,744 330,734L330,746Q160,758 -20,748Z" fill="#2c5034"/>`); }
  // the big palm on the left (leans right) and a second one cut by the right edge (leans left)
  const palmPal = { trunk: '#8a6a4a', trunkLit: '#b8946a', ring: '#5e4430', shade: '#2f6a3c', lit: '#4f9a52', rib: '#24502c', nut: '#6a5a2a' };
  S.add(palm(S, [150, 910], [380, 250], [200, 520], 1.25, palmPal, [
    [-170, 210, 120, 28, 0], [-145, 200, 70, 28, 1], [-118, 170, 30, 24, 0], [-92, 150, 10, 22, 1], [-66, 170, 30, 24, 0], [-40, 210, 80, 28, 1],
    [-12, 230, 140, 30, 0], [12, 220, 170, 28, 1], [165, 200, 150, 26, 1], [192, 170, 150, 24, 0],
  ]));
  S.add(palm(S, [1700, 900], [1570, 100], [1660, 470], 1.05, palmPal, [
    [-178, 230, 130, 28, 1], [-152, 200, 80, 26, 0], [-126, 160, 30, 24, 1], [-98, 140, 10, 22, 0], [160, 210, 160, 26, 1], [134, 170, 170, 24, 0], [-30, 160, 90, 24, 0], [8, 150, 120, 22, 1],
  ]));
  // foreground beach grass tufts
  { let g = ''; for (const [x, y] of [[470, 880], [520, 870], [1300, 880], [1340, 890], [900, 895]]) for (let k = 0; k < 7; k++) { const a = -90 + R.range(-40, 40), L = R.range(30, 60); g += `M${x + R.range(-10, 10)},${y}q${r0(Math.cos(a * Math.PI / 180) * L * 0.3)},${r0(-L * 0.6)} ${r0(Math.cos(a * Math.PI / 180) * L)},${r0(Math.sin(a * Math.PI / 180) * L)}`; } S.add(`<path d="${g}" stroke="#7a8a4a" stroke-width="3" fill="none" stroke-linecap="round"/>`); }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.7, '#000', 0.04], [1, '#3a2a10', 0.28]], 'cx="0.45" cy="0.4" r="0.8"')}"/>`);
  return S.out();
}

// ─── verdant-river-mouth-dragonboat ──────────────────────────────────────────────────────────────
// A dragon boat in side view, prow to the right. x0..x1 along the waterline y; s = scale. No people on board.
function dragonBoat(x0, x1, y, s, pal) {
  const out = [];
  const L = x1 - x0, gun = y - 16 * s;
  // oars shipped: pulled in and lying along the gunwale, blades tilted up toward the stern; wooden oarlock pegs
  let oars = '', blades = '', pegs = '';
  const nOar = Math.round(L / (56 * s));
  for (let i = 1; i < nOar; i++) {
    const x = x0 + L * 0.16 + L * 0.66 * (i / nOar);
    pegs += `M${r0(x)},${r0(gun)}v${r0(-7 * s)}`;
    oars += `M${r0(x + 14 * s)},${r0(gun - 3 * s)}L${r0(x - 34 * s)},${r0(gun - 12 * s)}`;
    blades += `M${r0(x - 32 * s)},${r0(gun - 11 * s)}l${r0(-16 * s)},${r0(-7 * s)}l${r0(-2 * s)},${r0(6 * s)}l${r0(16 * s)},${r0(5 * s)}z`;
  }
  // hull: long and low, ends lifting; stern rises into a curled tail
  const hull = `M${r0(x0 - 10 * s)},${r0(gun - 14 * s)}Q${r0(x0 + L * 0.08)},${r0(gun + 2 * s)} ${r0(x0 + L * 0.2)},${r0(gun)}L${r0(x0 + L * 0.84)},${r0(gun)}Q${r0(x1 - 6 * s)},${r0(gun)} ${r0(x1 + 10 * s)},${r0(gun - 14 * s)}L${r0(x1 - 8 * s)},${r0(y + 4 * s)}Q${r0(x0 + L * 0.5)},${r0(y + 14 * s)} ${r0(x0 + 8 * s)},${r0(y + 2 * s)}Z`;
  out.push(`<path d="${hull}" fill="${pal.hull}"/>`);
  out.push(`<path d="M${r0(x0 + L * 0.06)},${r0(y + 3 * s)}Q${r0(x0 + L * 0.5)},${r0(y + 13 * s)} ${r0(x1 - 14 * s)},${r0(y + 3 * s)}" stroke="${pal.hullShade}" stroke-width="${f(6 * s)}" fill="none"/>`);
  // painted scales along the side: a row of arcs in two colours
  let sc1 = '', sc2 = '';
  const nS = Math.round(L / (16 * s));
  for (let i = 1; i < nS - 1; i++) {
    const x = x0 + L * (i / nS), yy = gun + 7 * s + Math.sin(i / nS * Math.PI) * 2 * s;
    const d = `M${r0(x - 7 * s)},${r0(yy)}a${f(7 * s)},${f(6 * s)} 0 0 0 ${f(14 * s)},0z`;
    if (i % 2) sc1 += d; else sc2 += d;
  }
  out.push(`<path d="${sc1}" fill="${pal.scale1}"/><path d="${sc2}" fill="${pal.scale2}"/>`);
  out.push(`<path d="M${r0(x0 + L * 0.2)},${r0(gun)}L${r0(x0 + L * 0.84)},${r0(gun)}" stroke="${pal.trim}" stroke-width="${f(3 * s)}"/>`);
  out.push(`<path d="${pegs}" stroke="${pal.oar}" stroke-width="${f(3 * s)}"/><path d="${oars}" stroke="${pal.oar}" stroke-width="${f(3 * s)}" stroke-linecap="round"/><path d="${blades}" fill="${pal.oar}"/>`);
  // stern tail: a curl with a fin
  const tx = x0 - 10 * s, ty = gun - 14 * s;
  out.push(`<path d="M${r0(tx)},${r0(ty)}q${r0(-22 * s)},${r0(-30 * s)} ${r0(-6 * s)},${r0(-58 * s)}q${r0(18 * s)},${r0(-10 * s)} ${r0(14 * s)},${r0(12 * s)}q${r0(-14 * s)},${r0(4 * s)} ${r0(-4 * s)},${r0(20 * s)}q${r0(10 * s)},${r0(12 * s)} ${r0(24 * s)},${r0(22 * s)}z" fill="${pal.head}"/>`);
  out.push(`<path d="M${r0(tx - 4 * s)},${r0(ty - 40 * s)}l${r0(-14 * s)},${r0(-10 * s)}l${r0(4 * s)},${r0(16 * s)}l${r0(-12 * s)},${r0(2 * s)}l${r0(14 * s)},${r0(10 * s)}z" fill="${pal.fin}"/>`);
  // prow: neck rising, carved head looking right with open jaw, horns swept back, mane
  const nx = x1 + 10 * s, ny = gun - 14 * s;
  out.push(`<path d="M${r0(nx - 18 * s)},${r0(ny + 10 * s)}Q${r0(nx - 4 * s)},${r0(ny - 30 * s)} ${r0(nx + 6 * s)},${r0(ny - 66 * s)}L${r0(nx + 24 * s)},${r0(ny - 62 * s)}Q${r0(nx + 16 * s)},${r0(ny - 26 * s)} ${r0(nx + 10 * s)},${r0(ny + 2 * s)}Z" fill="${pal.head}"/>`);
  const hx = nx + 8 * s, hy = ny - 74 * s;
  // mane (behind)
  out.push(`<path d="M${r0(hx - 6 * s)},${r0(hy - 6 * s)}l${r0(-22 * s)},${r0(-4 * s)}l${r0(14 * s)},${r0(14 * s)}l${r0(-20 * s)},${r0(8 * s)}l${r0(20 * s)},${r0(8 * s)}l${r0(-16 * s)},${r0(14 * s)}l${r0(24 * s)},${r0(2 * s)}z" fill="${pal.fin}"/>`);
  // head + snout + lower jaw
  out.push(`<path d="M${r0(hx - 8 * s)},${r0(hy - 10 * s)}Q${r0(hx + 10 * s)},${r0(hy - 22 * s)} ${r0(hx + 30 * s)},${r0(hy - 10 * s)}L${r0(hx + 52 * s)},${r0(hy - 6 * s)}L${r0(hx + 50 * s)},${r0(hy + 4 * s)}L${r0(hx + 26 * s)},${r0(hy + 4 * s)}L${r0(hx + 46 * s)},${r0(hy + 14 * s)}L${r0(hx + 22 * s)},${r0(hy + 18 * s)}Q${r0(hx + 4 * s)},${r0(hy + 18 * s)} ${r0(hx - 6 * s)},${r0(hy + 10 * s)}Z" fill="${pal.head}"/>`);
  out.push(`<path d="M${r0(hx + 26 * s)},${r0(hy + 4 * s)}L${r0(hx + 46 * s)},${r0(hy + 14 * s)}" stroke="${pal.mouth}" stroke-width="${f(2 * s)}"/>`);
  out.push(`<path d="M${r0(hx - 6 * s)},${r0(hy - 12 * s)}Q${r0(hx + 10 * s)},${r0(hy - 22 * s)} ${r0(hx + 30 * s)},${r0(hy - 10 * s)}" stroke="${pal.trim}" stroke-width="${f(2.4 * s)}" fill="none"/>`);
  // horns swept back, eye, whisker
  out.push(`<path d="M${r0(hx + 4 * s)},${r0(hy - 16 * s)}q${r0(-10 * s)},${r0(-14 * s)} ${r0(-26 * s)},${r0(-20 * s)}q${r0(14 * s)},${r0(10 * s)} ${r0(20 * s)},${r0(22 * s)}zM${r0(hx + 14 * s)},${r0(hy - 18 * s)}q${r0(-6 * s)},${r0(-16 * s)} ${r0(-18 * s)},${r0(-26 * s)}q${r0(12 * s)},${r0(12 * s)} ${r0(12 * s)},${r0(26 * s)}z" fill="${pal.horn}"/>`);
  out.push(`<path d="${circ(hx + 18 * s, hy - 6 * s, 4.5 * s)}" fill="${pal.eye}"/><path d="${circ(hx + 19 * s, hy - 6 * s, 2 * s)}" fill="#1a1410"/>`);
  out.push(`<path d="M${r0(hx + 48 * s)},${r0(hy - 4 * s)}q${r0(14 * s)},${r0(6 * s)} ${r0(18 * s)},${r0(22 * s)}" stroke="${pal.trim}" stroke-width="${f(2 * s)}" fill="none" stroke-linecap="round"/>`);
  // the bow drum on deck, just behind the neck
  const dx = x1 - 44 * s, dy = gun - 2 * s;
  out.push(`<path d="M${r0(dx - 14 * s)},${r0(dy)}v${r0(-18 * s)}h${r0(28 * s)}v${r0(18 * s)}z" fill="${pal.drum}"/><path d="${ell(dx, dy - 18 * s, 14 * s, 4 * s)}" fill="${pal.hide}"/>`);
  return out.join('');
}

// One long vertical streamer on a pole: swallow-tailed, gently waving. Colour bands only, no writing.
function banner(x, top, h, w, c1, c2, wave) {
  const pts = (side) => { const p = []; for (let i = 0; i <= 8; i++) { const t = i / 8; p.push([x + side * w + Math.sin(t * 3 + wave) * w * 0.35 * t, top + t * h]); } return p; };
  const L = pts(0), Rr = pts(1).reverse();
  const tail = [[x + w + Math.sin(3 + wave) * w * 0.35, top + h], [x + w * 0.5 + Math.sin(3 + wave) * w * 0.35, top + h - w * 0.7], [x + Math.sin(3 + wave) * w * 0.35, top + h]];
  const body = pz([...L.slice(0, 8), tail[2], tail[1], tail[0], ...Rr.slice(1)]);
  const band = pz([[x, top + h * 0.12], [x + w, top + h * 0.12], [x + w + Math.sin(0.6 + wave) * w * 0.07, top + h * 0.2], [x + Math.sin(0.6 + wave) * w * 0.07, top + h * 0.2]]);
  return `<path d="${body}" fill="${c1}"/><path d="${band}" fill="${c2}"/><path d="${pl(L)}" stroke="#ffffff" stroke-width="2" opacity=".35" fill="none"/>`;
}

function riverMouth() {
  const S = new Scene('sbEx009River', '翠影南岸·河口·龙舟祭：宽阔的绿色河口开向海，对岸是沼林和高脚木屋，水上两条没有人的龙舟，终点的两根木桩系着红布，近岸木栈台、架上的大鼓、长幡和三角彩旗，不画人', 9201);
  const R = rng(9202);
  const HZ = 360;
  // warm high-afternoon sky
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#8cbfd8'], [0.25, '#c6dde0'], [0.4, '#f2e6c4']])}"/>`);
  S.add(`<circle cx="300" cy="110" r="460" fill="${S.rad([[0, '#fff8dc', 0.85], [0.3, '#ffefc4', 0.35], [1, '#ffefc4', 0]])}"/>`);
  const cc = { shade: '#e2dccc', lit: '#fffaf0', rim: '#fff6e0' };
  S.add(cloud(R, 700, 150, 260, 60, cc, { bumps: 6 }), cloud(R, 1150, 210, 200, 44, cc), cloud(R, 60, 240, 240, 46, cc, { bumps: 6 }), cloud(R, 1400, 120, 150, 34, cc, { bumps: 4 }));
  S.add(`<path d="${bird(980, 140, 1, 0.4)}${bird(1020, 160, 0.8, 0.1)}" fill="#5a6a70" opacity=".6"/>`);
  // the sea beyond the river mouth (centre right), far banks closing in from both sides
  S.add(`<path d="M0,${HZ}H${W}V420H0Z" fill="#9ccad0"/><path d="M820,${HZ + 4}H1400" stroke="#f8f4e0" stroke-width="3" opacity=".7"/>`);
  // left far bank: marsh forest with stilt houses and tiny flags
  S.add(`<path d="${treeLine(R, -20, 860, HZ + 30, 26, 70, HZ + 70, { step: 30, spireP: 0.25 })}" fill="#6f9480"/>`);
  { let sp = ''; for (let x = 850; x < 1070; x += 16) { const k = 1 - (x - 850) / 230, r = 8 + 26 * k; sp += circ(x, HZ + 34 - r * 0.6 + (1 - k) * 8, r); } S.add(`<path d="${sp}M840,${HZ + 30}L1080,${HZ + 44}L840,${HZ + 70}Z" fill="#6f9480"/>`); }
  { let hs = '', rf = '', st = '';
    for (const [x, w] of [[120, 54], [210, 46], [300, 60], [420, 50], [530, 44], [640, 56]]) {
      const y = HZ + 46;
      st += `M${x + 6},${y + 16}v-16M${x + w - 6},${y + 16}v-16`;
      hs += `M${x},${y}v-24h${w}v24z`;
      rf += `M${x - 6},${y - 22}L${x + w / 2},${y - 44}L${x + w + 6},${y - 22}z`;
    }
    S.add(`<path d="${st}" stroke="#4a4a3a" stroke-width="3"/><path d="${hs}" fill="#b8a888"/><path d="${rf}" fill="#8a6a50"/>`);
    let fl = ''; const cols = ['#d84a3a', '#e8b83a', '#3a8a5a', '#3a6ab8'];
    for (let k = 0; k < 14; k++) { const x = 100 + k * 44, y = HZ + 10 + (k % 3) * 6; fl += `<path d="M${x},${y + 26}v-30" stroke="#5a4a3a" stroke-width="2"/><path d="M${x},${y - 4}l14,5l-14,5z" fill="${cols[k % 4]}"/>`; }
    S.add(fl); }
  S.add(`<path d="M-20,${HZ + 70}Q500,${HZ + 50} 1000,${HZ + 52}" stroke="#d8d0a8" stroke-width="5" fill="none" opacity=".7"/>`);
  // right far spit: low, a few palms in silhouette
  S.add(`<path d="M1240,${HZ + 30}Q1400,${HZ + 8} 1620,${HZ + 4}V${HZ + 40}H1240Z" fill="#7e9a86"/>`);
  { let p = ''; for (const [x, h] of [[1330, 60], [1380, 76], [1470, 66], [1540, 84]]) { const y = HZ + 20; p += `M${x},${y}q4,${-h / 2} ${10},${-h}`; } S.add(`<path d="${p}" stroke="#5e7a68" stroke-width="5" fill="none"/>`);
    let lv = ''; for (const [x, h] of [[1340, 60], [1390, 76], [1480, 66], [1550, 84]]) { const y = HZ + 20 - h; for (let a = -150; a <= -30; a += 30) lv += `M${x},${y}q${r0(Math.cos(a * Math.PI / 180) * 16)},${r0(Math.sin(a * Math.PI / 180) * 16 - 4)} ${r0(Math.cos(a * Math.PI / 180) * 30)},${r0(Math.sin(a * Math.PI / 180) * 20 + 10)}`; } S.add(`<path d="${lv}" stroke="#5e7a68" stroke-width="4" fill="none" stroke-linecap="round"/>`); }
  S.add(`<rect x="0" y="${HZ - 40}" width="${W}" height="120" fill="${S.lin([[0, '#f2e8cc', 0], [0.6, '#f2e8cc', 0.35], [1, '#f2e8cc', 0]])}"/>`);
  // river-mouth water
  S.add(`<path d="M0,${HZ + 66}Q600,${HZ + 50} 1240,${HZ + 36}L${W},${HZ + 36}V${H}H0Z" fill="${S.lin([[0, '#a6cdbf'], [0.3, '#6fa894'], [1, '#356e60']])}"/>`);
  S.add(currents(R, 0, W, HZ + 70, 800, 90, '#d8f0e2', 0.35));
  S.add(currents(R, 0, W, HZ + 120, 820, 40, '#245a4c', 0.35, -1));
  // finish posts on the right with red cloth
  for (const [x, top, h] of [[1300, 420, 190], [1440, 400, 240]]) {
    S.add(`<path d="M${x - 6},${top}h12v${h}h-12z" fill="#6a5038"/><path d="M${x - 6},${top}h4v${h}h-4z" fill="#a8845a"/>`);
    S.add(`<path d="M${x + 6},${top + 18}q30,6 46,30q-24,-6 -46,-8z" fill="#d83a30"/><path d="M${x - 8},${top + 14}h16v8h-16z" fill="#b82a24"/>`);
    S.add(`<path d="${ell(x, top + h, 26, 5)}" fill="none" stroke="#e0f4ea" stroke-width="2" opacity=".7"/>`);
  }
  // the far dragon boat (blue-white, green head) and the near one (red-gold)
  S.add(dragonBoat(700, 1150, 500, 0.62, { oar: '#5a4630', hull: '#e8e2d0', hullShade: '#b8b2a0', scale1: '#3a7ab0', scale2: '#e8e2d0', trim: '#3a6a9a', head: '#3a8a6a', fin: '#2a6a8a', horn: '#e8d8a0', mouth: '#1a3a30', eye: '#f8f0d0', drum: '#3a6a9a', hide: '#efe4c8' }));
  S.add(`<path d="M650,522Q930,532 1180,520" stroke="#e8f8ee" stroke-width="3" fill="none" opacity=".55"/>`);
  S.add(dragonBoat(230, 1080, 640, 1.05, { oar: '#6a4a2e', hull: '#b8342a', hullShade: '#7e2018', scale1: '#e8b83a', scale2: '#2a7a4a', trim: '#f2cc5a', head: '#c8402e', fin: '#e8a83a', horn: '#f6e2a0', mouth: '#4a1a10', eye: '#fff4c8', drum: '#8a2a20', hide: '#f2e6c8' }));
  S.add(`<path d="M180,664Q650,682 1110,662" stroke="#e8f8ee" stroke-width="4" fill="none" opacity=".6"/>`);
  // near bank: sand and grass, a plank landing on the left
  S.add(`<path d="M0,770Q520,752 1000,770T${W},760V${H}H0Z" fill="${S.lin([[0, '#cdbb8a'], [1, '#a8935e']])}"/>`);
  S.add(`<path d="M0,770Q520,752 1000,770T${W},760" stroke="#e8dcb0" stroke-width="4" fill="none" opacity=".8"/>`);
  { const P = [[0, 742], [430, 730], [470, 790], [0, 812]];
    S.add(`<path d="${pz(P)}" fill="#8a6a48"/>`);
    let pk = ''; for (let k = 1; k < 9; k++) { const a = quad(P[0], P[1], k / 9), b = quad(P[3], P[2], k / 9); pk += `M${r0(a[0])},${r0(a[1])}L${r0(b[0])},${r0(b[1])}`; }
    S.add(`<path d="${pk}" stroke="#5e4630" stroke-width="2.5"/><path d="M0,742L430,730" stroke="#c4a070" stroke-width="3"/>`);
    S.add(`<path d="M40,812v40M200,806v44M380,796v40" stroke="#4a3626" stroke-width="10"/>`); }
  { let g = ''; for (let k = 0; k < 60; k++) { const x = R.range(480, W), y = R.range(775, 900), L = R.range(14, 34), a = R.range(-30, 30); g += `M${r0(x)},${r0(y)}q${r0(a * 0.3)},${r0(-L * 0.6)} ${r0(a)},${r0(-L)}`; } S.add(`<path d="${g}" stroke="#7a8a4a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/>`); }
  // the big shore drum on its X-stand (lower right) with two sticks
  { const cx = 1270, top = 690, rx = 92, ry = 24, h = 110;
    S.add(`<path d="${ell(cx, top + h + 70, 140, 16)}" fill="#6a5a3a" opacity=".35"/>`);
    S.add(`<path d="M${cx - 110},${top + h + 72}L${cx + 70},${top + 40}M${cx + 110},${top + h + 72}L${cx - 70},${top + 40}" stroke="#5a3e28" stroke-width="12" stroke-linecap="round"/>`);
    S.add(`<path d="M${cx - rx},${top}v${h}a${rx},${ry} 0 0 0 ${rx * 2},0v${-h}z" fill="#b8302a"/>`);
    S.add(`<path d="M${cx + rx * 0.35},${top + 10}v${h}a${rx},${ry} 0 0 0 ${rx * 0.65},${-ry * 0.5}v${-h}z" fill="#7e1e18" opacity=".7"/><path d="M${cx - rx + 10},${top + 14}v${h - 6}" stroke="#e8705a" stroke-width="8" opacity=".6"/>`);
    let studs = ''; for (let k = 0; k <= 12; k++) { const a = Math.PI * k / 12, x = cx - Math.cos(a) * rx * 0.98, yy = top + 10 + Math.sin(a) * ry * 0.9; studs += circ(x, yy, 3.5) + circ(x, yy + h - 18, 3.5); }
    S.add(`<path d="${studs}" fill="#f2cc5a"/>`);
    S.add(`<path d="${ell(cx, top, rx, ry)}" fill="#f2e4c4"/><path d="${ell(cx, top, rx * 0.55, ry * 0.5)}" fill="none" stroke="#d8442e" stroke-width="5" opacity=".7"/>`);
    S.add(`<path d="M${cx - 40},${top - 4}L${cx + 130},${top + 60}M${cx - 10},${top + 2}L${cx + 150},${top + 30}" stroke="#7a4a2a" stroke-width="9" stroke-linecap="round"/><path d="${circ(cx - 40, top - 4, 9)}${circ(cx - 10, top + 2, 9)}" fill="#d8402e"/>`); }
  // banner poles at both sides with long swallow-tailed streamers
  for (const [x, c1, c2, wave] of [[70, '#d8402e', '#f2cc5a', 0], [180, '#2a8a5a', '#f2e6c8', 1.3], [1520, '#e8b83a', '#c8402e', 0.7], [1420, '#3a6ab8', '#f2e6c8', 2]]) {
    const foot = x < 800 ? 750 : 780;
    S.add(`<path d="M${x - 4},${foot}V0h8V${foot}z" fill="#6a4a30"/><path d="M${x - 4},${foot}V0h3V${foot}z" fill="#a88058"/>`);
    S.add(banner(x + 4, 40, 300, 46, c1, c2, wave));
  }
  // bunting strung across the top between the poles
  { const strings = [[[74, 30], [1424, 50], 120], [[184, 90], [1516, 70], 90]];
    const cols = ['#d8402e', '#f2cc5a', '#2a8a5a', '#3a6ab8', '#f2e6c8'];
    for (const [a, b, sg] of strings) {
      S.add(`<path d="${sag(a, b, sg)}" stroke="#4a3a2a" stroke-width="2" fill="none"/>`);
      const ctrl = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sg];
      let tri = ['', '', '', '', ''];
      for (let k = 1; k < 30; k++) { const t = k / 30, p = bez(a, ctrl, b, t), q = bez(a, ctrl, b, t + 0.02); tri[k % 5] += `M${r0(p[0])},${r0(p[1])}L${r0(q[0])},${r0(q[1])}L${r0((p[0] + q[0]) / 2)},${r0((p[1] + q[1]) / 2 + 26)}z`; }
      S.add(tri.map((d, i) => `<path d="${d}" fill="${cols[i]}"/>`).join(''));
    } }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.7, '#000', 0.04], [1, '#3a2a10', 0.3]], 'cx="0.45" cy="0.45" r="0.8"')}"/>`);
  return S.out();
}

export const ex009Bgs = {
  'verdant-south-beach': () => southBeach(),
  'verdant-river-mouth-dragonboat': () => riverMouth(),
};
