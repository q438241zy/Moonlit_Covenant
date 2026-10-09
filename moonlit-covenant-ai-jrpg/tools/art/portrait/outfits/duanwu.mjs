// 端午服 - hanfu-inspired cross-collar top (交领右衽) in jade green over a white inner robe:
// deep-jade collar bands with a white dragon-boat wave pattern, wide drapey sleeves, white
// high-waist sash wound with a five-colour silk cord (五彩绳) tied in a knot with tasselled tails.
// Ornament: mugwort sprig with a small embroidered sachet (香囊).
// Identity colours (jade / white / five-colour cord) stay; p.palette.accent colours the collar
// piping, the cord bead and the sachet.
import { sampleSpline, mix } from '../base.mjs';

const K = {
  jade: '#3d9a7c', jadeShade: '#2a735f', jadeDeep: '#1b4f45', jadeLit: '#6cc4a2', jadeSheen: '#a6e6c8', jadeLine: '#0e3029',
  band: '#1d5a55', bandShade: '#123d3b', bandLine: '#082220',
  white: '#f6f4ef', whiteShade: '#d4d6d8', whiteDeep: '#a8b4b6', whiteLine: '#536a6a',
  c5: ['#2f7fd0', '#e0313f', '#f4f2ee', '#2a2532', '#f2c230'], // 青 赤 白 黑 黄
  gold: '#ffd28a', goldLine: '#5a3410',
  mug: '#7f9f78', mugShade: '#5a7a58', mugLit: '#c4d8bc', mugLine: '#2a3e2a',
};
const ip = (q) => `${Math.round(q[0])},${Math.round(q[1])}`;

/** sample a centre line and return points + unit tangents */
function along(pts, count) {
  const c = sampleSpline(pts, count);
  return c.map((q, i) => {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(count - 1, i + 1)];
    return { q, ang: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI };
  });
}
/** five-colour twisted cord along a path: banded dashes in the five colours */
function cord(d, w, pitch = 5) {
  const L = pitch * 5;
  return `<path d="${d}" fill="none" stroke="#2a2532" stroke-width="${w + 2.6}" stroke-linecap="round"/>`
    + K.c5.map((c, i) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-dasharray="${pitch} ${L - pitch}" stroke-dashoffset="${-i * pitch}"/>`).join('');
}

function bodyBack(p) {
  // back of the standing cross collar, seen either side of the neck
  const d = p.helpers.smooth([[346, 724], [356, 670], [384, 646], [416, 640], [448, 646], [476, 670], [486, 724]]);
  return `<path d="${d}" fill="none" stroke="${K.bandLine}" stroke-width="38"/><path d="${d}" fill="none" stroke="${K.bandShade}" stroke-width="32"/>`
    + `<path d="${d}" fill="none" stroke="${K.whiteShade}" stroke-width="8" transform="translate(0 14)"/>`;
}

function render(p) {
  const { smooth: sm, taper } = p.helpers;
  const pal = p.palette;
  const MIR = 'matrix(-1 0 0 1 832 0)';
  let s = '';

  // ---- outer top: everything below the neckline V
  const top = sm([[60, 700, 1], [350, 652, 1], [378, 664], [392, 704], [416, 732, 1], [440, 704], [454, 664], [482, 652, 1], [772, 700, 1], [772, 1216, 1], [60, 1216, 1]], { closed: true });
  const silk = p.lin('silk', [[0, K.jadeLit], [0.32, K.jade], [1, K.jadeShade]], [0, 690, 0, 1150]);
  p.def(`<pattern id="${p.id('ripple')}" width="90" height="64" patternUnits="userSpaceOnUse"><path d="M8,20C10,12 18,8 24,12C28,15 26,21 21,20C18,19 19,15 22,15M24,20C28,21 31,19 32,16M53,52C55,44 63,40 69,44C73,47 71,53 66,52C63,51 64,47 67,47M69,52C73,53 76,51 77,48" fill="none" stroke="${K.jadeLit}" stroke-width="2" stroke-linecap="round" opacity=".55"/></pattern>`);
  s += `<g clip-path="${p.refs.bodyClip}"><path d="${top}" fill="${silk}"/><path d="${top}" fill="url(#${p.id('ripple')})"/>`
    + `<path d="M494,766Q566,756 640,800L640,1216H540Q526,1000 494,766Z" fill="${K.jadeShade}" opacity=".75"/>`
    + `<path d="${taper([[330, 860], [342, 940], [338, 1000]], { w: 5, start: 0.1, end: 0, peak: 0.4 })}" fill="${K.jadeLit}" opacity=".8"/>`
    + `<path d="${taper([[500, 860], [492, 940], [496, 990]], { w: 5, start: 0.1, end: 0, peak: 0.4 })}" fill="${K.jadeDeep}" opacity=".8"/>`
    + `</g>`;

  // ---- white inner robe collar (inside the green bands), right over left
  const innerL = [[378, 662], [374, 694], [394, 718], [424, 738]];
  const innerR = [[454, 662], [458, 694], [438, 718], [408, 738]];
  const iw = (pts) => taper(pts, { w: 30, start: 1, end: 1, peak: 0.5 });
  s += `<g stroke-linejoin="round"><path d="${iw(innerL)}" fill="${K.whiteShade}" stroke="${K.whiteLine}" stroke-width="2.2"/>`
    + `<path d="${iw(innerR)}" fill="${K.white}" stroke="${K.whiteLine}" stroke-width="2.2"/></g>`;

  // ---- collar bands (领缘): under band (viewer's left) then the over band sweeping to the left armpit
  const underPts = [[360, 664], [350, 704], [372, 742], [400, 768], [424, 786]];
  const overPts = [[472, 664], [482, 704], [458, 746], [422, 788], [380, 832], [338, 880], [300, 932], [270, 990], [252, 1060], [240, 1216]];
  const bandD = (pts) => taper(pts, { w: 34, start: 1, end: 1, peak: 0.5 });
  const waves = (pts, count, flip) => along(pts, count).slice(1, -1).map(({ q, ang }) => `<use href="#${p.id('wave')}" transform="translate(${ip(q)}) rotate(${Math.round(ang + (flip ? 180 : 0))})"/>`).join('');
  // dragon-boat wave: a curling crest with a trailing swell, in white thread
  p.def(`<path id="${p.id('wave')}" d="M-11,5C-9,-3 -1,-7 5,-3C9,0 7,6 2,5C-1,4 0,0 3,0M5,5C9,6 12,4 13,1" fill="none" stroke="${K.white}" stroke-width="2.2" stroke-linecap="round"/>`);
  const pipe = mix(pal.accent, K.white, 0.25);
  const band = (pts, fill, count, flip) => `<path d="${bandD(pts)}" fill="${fill}" stroke="${K.bandLine}" stroke-width="2.6" stroke-linejoin="round"/>`
    + `<g opacity=".9">${waves(pts, count, flip)}</g>`
    + `<path d="${taper(pts, { w: 26, start: 1, end: 1, peak: 0.5 })}" fill="none" stroke="${pipe}" stroke-width="1.6" opacity=".9"/>`;
  s += band(underPts, K.bandShade, 6, 0)
    // shadow the over band casts on the under band and the robe
    + `<path d="${bandD(overPts.slice(0, 6))}" transform="translate(-5 7)" fill="${K.jadeDeep}" opacity=".55"/>`
    + band(overPts, K.band, 18, 1)
    + `<path d="${taper(overPts.slice(1, 5), { w: 6, start: 0.2, end: 0.2, peak: 0.4 })}" transform="translate(-10 -7)" fill="${K.jadeSheen}" opacity=".35"/>`;

  // ---- wide sleeves (cut in one with the body), drapey folds
  const sleeve = sm([[226, 756], [184, 772], [150, 812], [130, 880], [116, 980], [98, 1100], [84, 1216, 1], [244, 1216, 1], [240, 1060], [236, 930], [232, 860]], { closed: true });
  const sFolds = [[[200, 830], [176, 940], [160, 1060], [150, 1216]], [[226, 880], [214, 1000], [210, 1216]], [[160, 860], [140, 960], [124, 1080], [112, 1200]]]
    .map((f) => taper(f, { w: 10, start: 0.05, end: 0.8, peak: 0.85 })).join('');
  const sLit = [[[188, 800], [162, 900], [146, 1000]], [[214, 860], [200, 960], [194, 1060]]].map((f) => taper(f, { w: 6, start: 0.1, end: 0, peak: 0.4 })).join('');
  p.def(`<path id="${p.id('sleeve')}" d="${sleeve}"/>`);
  const sl = `#${p.id('sleeve')}`;
  s += `<use href="${sl}" fill="${silk}" stroke="${K.jadeLine}" stroke-width="3.2"/><use href="${sl}" fill="url(#${p.id('ripple')})"/>`
    + `<path d="${sFolds}" fill="${K.jadeShade}" opacity=".9"/><path d="${sLit}" fill="${K.jadeSheen}" opacity=".55"/>`
    + `<path d="${taper([[232, 758], [196, 770], [164, 800], [144, 846]], { w: 9, start: 0.2, end: 0, peak: 0.5 })}" fill="${K.jadeSheen}" opacity=".7"/>`
    + `<use href="${sl}" transform="${MIR}" fill="${K.jadeShade}" stroke="${K.jadeLine}" stroke-width="3.2"/>`
    + `<path d="${sFolds}" transform="${MIR}" fill="${K.jadeDeep}" opacity=".9"/><path d="${sLit}" transform="${MIR}" fill="${K.jade}" opacity=".7"/>`;

  // ---- white high-waist sash wound with the five-colour cord, knot + tasselled tails
  const sash = sm([[238, 978, 1], [330, 990], [416, 996], [502, 990], [594, 978, 1], [596, 1030, 1], [502, 1042], [416, 1048], [330, 1042], [236, 1030, 1]], { closed: true });
  s += `<path d="${sash}" fill="${K.white}" stroke="${K.whiteLine}" stroke-width="2.6"/>`
    + `<path d="M480,993Q540,990 594,978L596,1030Q540,1040 480,1044Z" fill="${K.whiteShade}"/>`
    + `<path d="M244,986Q416,1012 588,986M244,1024Q416,1050 588,1024" fill="none" stroke="${K.jade}" stroke-width="2.4"/>`
    + cord('M240,1004Q416,1030 592,1004', 5.4, 5)
    + cord('M352,1016C340,1042 334,1070 340,1110', 5.4, 5.5)
    + cord('M372,1016C384,1046 392,1072 386,1112', 5.4, 5.5)
    // butterfly knot: two cord loops either side of an accent bead
    + cord('M356,1012C336,990 314,1000 320,1016C326,1032 346,1024 356,1014M368,1012C388,990 410,1000 404,1016C398,1032 378,1024 368,1014', 5, 5)
    + `<circle cx="362" cy="1013" r="10" fill="${pal.accent}" stroke="${mix(pal.accent, '#000000', 0.6)}" stroke-width="2.2"/><circle cx="358.6" cy="1009.4" r="3" fill="#fff" opacity=".85"/>`
    + [[340, 1110], [386, 1112]].map(([x, y]) => `<path d="M${x - 5},${y}h10l3,22h-16z" fill="${K.c5[1]}" stroke="#5a0612" stroke-width="1.6"/><path d="M${x - 6},${y - 2}h12v5h-12z" fill="${K.c5[4]}" stroke="${K.goldLine}" stroke-width="1.4"/>`).join('');
  return s;
}

// ---------------------------------------------------------------- background: willow, river, far dragon boats
function bgMotif(p) {
  const { smooth: sm, n } = p.helpers;
  // willow branches hanging from both top corners: a twig line + leaves as round-capped dashes
  const twigs = [
    [[0, 30], [60, 60], [96, 160], [110, 300], [104, 420]],
    [[30, 0], [120, 40], [170, 150], [186, 280]],
    [[0, 120], [36, 200], [50, 330], [40, 470]],
    [[832, 20], [770, 70], [740, 180], [730, 320], [736, 440]],
    [[800, 0], [700, 50], [660, 160], [650, 260]],
  ].map((t) => sm(t)).join('');
  // river: rows of wave scallops, a moon path, two dragon-boat silhouettes
  const row = (y, k, a) => {
    let d = `M0,${y}`;
    for (let i = 0; i < k; i++) d += `q${n(416 / k)},${-a} ${n(832 / k)},0`;
    return d;
  };
  const boat = (x, y, s, f) => {
    const hull = `M-90,0Q-40,14 50,10Q86,6 96,-6Q100,-16 92,-22Q96,-10 84,-4Q30,2 -80,-6Z`;
    const head = `M-80,-6Q-96,-12 -98,-30Q-96,-46 -84,-50Q-76,-58 -66,-52Q-74,-46 -76,-38Q-72,-30 -64,-30L-70,-22Q-80,-20 -84,-12Z`;
    const crew = Array.from({ length: 7 }, (_, i) => `M${-56 + i * 18},-4l-10,22M${-58 + i * 18},-6a4,4 0 1 1 0.1,0`).join('');
    return `<g transform="translate(${x} ${y}) scale(${s * f} ${s})"><path d="${hull}${head}" fill="#0b1c20"/><path d="${crew}" fill="#0b1c20" stroke="#0b1c20" stroke-width="3" stroke-linecap="round"/>`
      + `<path d="M-78,-6Q20,0 84,-4" fill="none" stroke="#3d9a7c" stroke-width="2" opacity=".5"/><circle cx="-86" cy="-42" r="2.2" fill="#ffd28a" opacity=".7"/></g>`;
  };
  return `<g fill="none" stroke-linecap="round">`
    + `<path d="${twigs}" stroke="#1d3e38" stroke-width="2.4" opacity=".75"/>`
    + `<path d="${twigs}" stroke="#2f6e5c" stroke-width="6" stroke-dasharray="9 11" opacity=".55"/>`
    + `<path d="${row(640, 9, 10)}${row(676, 11, 9)}${row(716, 13, 8)}${row(760, 15, 7)}" stroke="#2f6e5c" stroke-width="2.4" opacity=".4"/>`
    + `<path d="M150,656h46M120,690h70M168,724h40M640,650h50M660,686h64M630,720h40" stroke="#e8ddff" stroke-width="2.4" opacity=".22"/>`
    + `</g>`
    + `<rect y="560" width="832" height="90" fill="${p.lin('horizon', [[0, '#3d9a7c', 0], [0.75, '#6cc4a2', 0.22], [1, '#3d9a7c', 0]], [0, 560, 0, 650])}"/>`
    + `<path d="M0,630Q416,610 832,630V1216H0Z" fill="#0c2226" opacity=".35"/>`
    + boat(132, 622, 0.9, 1) + boat(716, 600, 0.6, -1);
}

// ---------------------------------------------------------------- mugwort sprig + small sachet
const SPOT = {
  default: [552, 292, 0], lia: [550, 288, 0], freya: [554, 296, 0], serena: [552, 296, 0],
  aila: [280, 292, 1], lilith: [282, 290, 1], mia: [560, 324, 0], ophelia: [560, 354, 0], evelyn: [568, 404, 0],
};
// pinnately lobed mugwort leaf, base 0,0, tip 0,-44
const LEAF = 'M0,0C-4,-8 -10,-10 -9,-16C-14,-18 -15,-24 -9,-27C-12,-32 -8,-38 -3,-38C-3,-42 -1,-44 0,-46C1,-44 3,-42 3,-38C8,-38 12,-32 9,-27C15,-24 14,-18 9,-16C10,-10 4,-8 0,0Z';
function hairOrnament(p) {
  const [x, y, m] = SPOT[p.heroine.id] || SPOT.default;
  // mirror for left-side spots, and scale up a touch around the spot so it reads on 240px cards
  const tf = `${m ? `translate(${2 * x} 0) scale(-1 1) ` : ''}translate(${x} ${y}) scale(1.15) translate(${-x} ${-y})`;
  const acc = p.palette.accent;
  const leaf = (a, sc, sh) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${sc})"><path d="${LEAF}" fill="${sh ? K.mugShade : K.mug}" stroke="${K.mugLine}" stroke-width="2" stroke-linejoin="round"/>`
    + `<path d="M0,-3V-40M0,-14L-6,-18M0,-26L6,-30" fill="none" stroke="${K.mugLit}" stroke-width="1.6" stroke-linecap="round" opacity="${sh ? 0.5 : 0.9}"/></g>`;
  // sachet: a small rounded pouch (accent silk, gold-stitched rim) hanging on a five-colour cord
  const sx = x + 10, sy = y + 46;
  const pouch = `M${sx},${sy - 12}C${sx + 14},${sy - 14} ${sx + 16},${sy + 4} ${sx + 6},${sy + 14}L${sx},${sy + 19}L${sx - 6},${sy + 14}C${sx - 16},${sy + 4} ${sx - 14},${sy - 14} ${sx},${sy - 12}Z`;
  return `<g transform="${tf}" stroke-linejoin="round">`
    + leaf(-58, 0.8, 1) + leaf(40, 0.78, 1) + leaf(-14, 0.95)
    + cord(`M${x + 2},${y + 4}Q${sx + 4},${y + 20} ${sx},${sy - 12}`, 2.6, 3)
    + `<path d="${pouch}" fill="${acc}" stroke="${mix(acc, '#000000', 0.6)}" stroke-width="2"/>`
    + `<path d="M${sx - 9},${sy - 4}Q${sx},${sy - 8} ${sx + 9},${sy - 4}" fill="none" stroke="${K.gold}" stroke-width="1.8" stroke-dasharray="2.4 2"/>`
    + `<path d="M${sx - 5},${sy + 2}l5,6l5,-6" fill="none" stroke="${K.gold}" stroke-width="1.6"/>`
    + `<circle cx="${sx - 5}" cy="${sy - 7}" r="2.2" fill="#fff" opacity=".6"/>`
    + `<path d="M${sx},${sy + 19}v6" stroke="${K.c5[1]}" stroke-width="2.4"/><path d="M${sx - 4},${sy + 25}h8l2,16h-12z" fill="${K.c5[1]}" stroke="#5a0612" stroke-width="1.4"/>`
    + `</g>`;
}

export default {
  type: 'duanwu',
  label: '端午服',
  render,
  bgMotif,
  bodyBack,
  hairOrnament,
};
