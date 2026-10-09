// 圣诞服 - red velvet capelet with white fur trim and a gold twin-disc clasp, worn over a dark
// pine-green velvet dress with gold buttons. Ornament: holly sprig.
// Identity colours (velvet red / fur white / pine green / gold) stay; p.palette.accent colours
// the clasp gems, the dress piping and the holly ribbon.
import { sampleSpline, mix } from '../base.mjs';

const K = {
  red: '#b3172e', redShade: '#7c0c21', redDeep: '#4c0615', redLit: '#e03a4d', redSheen: '#ff7d84', redLine: '#2e030c',
  pine: '#1c3c31', pineShade: '#11271f', pineLit: '#2d5747', pineLine: '#07130e',
  gold: '#ffd28a', goldMid: '#e6a94f', goldDeep: '#9a6224', goldLine: '#5a3410',
  fur: '#fbf8f8', furShade: '#d8d0e0', furDeep: '#b2a6c4', furLine: '#6e6482',
  holly: '#2f7a4c', hollyShade: '#1c5434', hollyLit: '#6fbf7e', hollyLine: '#0c2a19',
  berry: '#d8263a', berryLine: '#5a0612',
};
const ip = (q) => `${Math.round(q[0])},${Math.round(q[1])}`;

function frame(pts, count) {
  const c = sampleSpline(pts, count);
  return c.map((q, i) => {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(count - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
    return { q, nx: dy / m, ny: -dx / m };
  });
}
/** fluffy fur band along a centre line (soft tufts on both edges); w(t) = half thickness */
function fluff(pts, count, w, rand) {
  const F = frame(pts, count);
  const side = (sgn) => F.map(({ q, nx, ny }, i) => {
    const k = w(i / (count - 1)) * (1 + (rand() - 0.5) * 0.25);
    return [q[0] + nx * k * sgn, q[1] + ny * k * sgn];
  });
  const A = side(1), B = side(-1).reverse();
  const tufts = (E) => {
    let d = '';
    for (let i = 1; i < E.length; i++) {
      const a = E[i - 1], b = E[i];
      const bulge = 0.42 + rand() * 0.2;
      d += `Q${ip([(a[0] + b[0]) / 2 + (b[1] - a[1]) * bulge, (a[1] + b[1]) / 2 - (b[0] - a[0]) * bulge])} ${ip(b)}`;
    }
    return d;
  };
  return `M${ip(A[0])}${tufts(A)}L${ip(B[0])}${tufts(B)}Z`;
}

function render(p) {
  const { smooth: sm, taper } = p.helpers;
  const pal = p.palette;
  const rand = p.rand;
  const MIR = 'matrix(-1 0 0 1 832 0)';
  let s = '';

  // ---- dark pine-green velvet dress (visible in the cape opening and below the hem)
  const dress = p.lin('dress', [[0, K.pineLit], [0.4, K.pine], [1, K.pineShade]], [0, 700, 0, 1150]);
  s += `<g clip-path="${p.refs.bodyClip}"><rect y="660" width="832" height="560" fill="${dress}"/>`
    + `<path d="M440,760L520,760L560,1216H452Z" fill="${K.pineShade}"/>`
    + `<path d="${p.shapes.armSeamL}${p.shapes.armSeamR}" fill="none" stroke="${K.pineLine}" stroke-width="3"/>`
    + `<path d="M416,790V1216" stroke="${K.pineLine}" stroke-width="2.4"/>`
    + `<path d="M410,790V1216" stroke="${mix(pal.accent, K.pine, 0.35)}" stroke-width="1.6" opacity=".9"/>`
    + `<path d="${taper([[388, 860], [380, 940], [384, 1010]], { w: 6, start: 0.1, end: 0.1, peak: 0.5 })}" fill="${K.pineLit}" opacity=".9"/>`
    + `</g>`
    // standing collar of the dress (gold piped)
    + `<path d="${sm([[366, 664, 1], [390, 674], [416, 678], [442, 674], [466, 664, 1], [480, 730, 1], [352, 730, 1]], { closed: true })}" fill="${K.pine}" stroke="${K.pineLine}" stroke-width="3"/>`
    + `<path d="M442,674L466,664L480,730H446Z" fill="${K.pineShade}"/>`
    + `<path d="M368,668Q416,690 464,668" fill="none" stroke="${K.goldMid}" stroke-width="2.6"/>`
    + `<path d="M372,680Q370,700 364,716" fill="none" stroke="${K.pineLit}" stroke-width="3" stroke-linecap="round"/>`
    + `<g>` + [830, 880, 930, 980].map((y) => `<circle cx="426" cy="${y}" r="5.4" fill="${K.goldMid}" stroke="${K.goldLine}" stroke-width="1.8"/><circle cx="424.4" cy="${y - 1.6}" r="1.7" fill="${K.gold}"/>`).join('')
    + `</g>`;

  // ---- velvet capelet: flares over the shoulders, open at the front below the clasp
  // hem: lower at each fold ridge, tucked up at each valley
  const hem = [[352, 986], [326, 996], [298, 984], [268, 996], [236, 980], [204, 990], [174, 970], [144, 974], [118, 952], [104, 936]];
  const capeL = sm([[404, 770], [394, 820], [380, 880], [366, 940], [352, 986, 1], ...hem.slice(1, -1), [104, 936, 1], [104, 884], [122, 832], [150, 792], [192, 762], [242, 742], [292, 728], [344, 718], [392, 736]], { closed: true });
  const velvetL = p.lin('velvetL', [[0, K.redLit], [0.35, K.red], [1, K.redShade]], [180, 730, 300, 1000]);
  const velvetR = p.lin('velvetR', [[0, K.redShade], [0.5, mix(K.redShade, K.redDeep, 0.4)], [1, K.redDeep]], [650, 730, 530, 1000]);
  // folds hanging from the shoulder: dark valleys widening toward the tucked-up hem points
  const valleyLines = [
    [[312, 770], [306, 860], [300, 940], [298, 982]],
    [[254, 786], [246, 880], [240, 940], [236, 978]],
    [[196, 806], [186, 880], [178, 930], [174, 968]],
    [[146, 840], [132, 900], [120, 948]],
  ];
  const valleys = valleyLines.map((f) => taper(f, { w: 22, start: 0.05, end: 0.7, peak: 0.9 })).join('');
  const ridges = valleyLines.map((f) => taper(f.map(([x, y]) => [x - 13, y + 6]), { w: 6, start: 0.1, end: 0.1, peak: 0.6 })).join('');
  p.def(`<path id="${p.id('cape')}" d="${capeL}"/><clipPath id="${p.id('capeClip')}"><use href="#${p.id('cape')}"/></clipPath>`);
  const cape = `#${p.id('cape')}`;
  const sheen = taper([[336, 724], [280, 736], [220, 756], [168, 788], [132, 832], [114, 880]], { w: 14, start: 0.2, end: 0, peak: 0.45 });
  s += `<g stroke-linejoin="round">`
    + `<use href="${cape}" fill="${velvetL}"/>`
    + `<g clip-path="url(#${p.id('capeClip')})"><path d="${valleys}" fill="${K.redShade}" opacity=".9"/><path d="${ridges}" fill="${K.redSheen}" opacity=".45"/>`
    + `<path d="${sheen}" fill="${K.redSheen}" opacity=".75"/></g>`
    + `<use href="${cape}" fill="none" stroke="${K.redLine}" stroke-width="3.4"/>`
    + `<use href="${cape}" transform="${MIR}" fill="${velvetR}"/>`
    + `<g transform="${MIR}" clip-path="url(#${p.id('capeClip')})"><path d="${valleys}" fill="${K.redDeep}" opacity=".85"/><path d="${ridges}" fill="${K.redLit}" opacity=".35"/><path d="${sheen}" fill="${K.redLit}" opacity=".35"/></g>`
    + `<use href="${cape}" transform="${MIR}" fill="none" stroke="${K.redLine}" stroke-width="3.4"/>`
    + `</g>`;

  // ---- fur trim down the front edges and along the hem
  const trimPts = [[404, 784], [394, 830], [380, 890], [366, 944], [356, 976], [330, 990], ...hem.slice(2, -1).map(([x, y]) => [x, y + 2]), [110, 940]];
  const trim = fluff(trimPts, 34, (t) => (t < 0.18 ? 11 + t * 30 : t > 0.94 ? 16 - (t - 0.94) * 120 : 16), rand);
  p.def(`<path id="${p.id('trim')}" d="${trim}"/>`);
  const trimFill = p.lin('trimFill', [[0, '#ffffff'], [0.5, K.fur], [1, K.furShade]], [0, 900, 0, 1010]);
  const furTicks = hem.slice(1, -1).map(([x, y]) => `M${Math.round(x - 6)},${Math.round(y - 4)}q5,6 12,4`).join('') + 'M392,840q6,4 4,12M378,900q6,4 4,12M366,950q6,4 4,12';
  s += `<use href="#${p.id('trim')}" fill="${trimFill}" stroke="${K.furLine}" stroke-width="2.4"/>`
    + `<path d="${furTicks}" fill="none" stroke="${K.furDeep}" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`
    + `<use href="#${p.id('trim')}" transform="${MIR}" fill="${K.furShade}" stroke="${K.furLine}" stroke-width="2.4"/>`
    + `<path d="${furTicks}" transform="${MIR}" fill="none" stroke="${K.furDeep}" stroke-width="1.6" stroke-linecap="round"/>`;

  // ---- big fur collar around the neck
  const collar = fluff([[286, 744], [326, 726], [370, 736], [416, 758], [462, 736], [506, 726], [546, 744]], 28, (t) => 24 + 12 * Math.sin(t * Math.PI), rand);
  p.def(`<path id="${p.id('collar')}" d="${collar}"/><clipPath id="${p.id('collarClip')}"><use href="#${p.id('collar')}"/></clipPath>`);
  const collarFill = p.lin('collarFill', [[0, '#ffffff'], [0.5, K.fur], [1, K.furShade]], [0, 712, 0, 796]);
  const collarTicks = Array.from({ length: 18 }, (_, i) => {
    const t = (i + 0.5) / 18, x = 298 + t * 236, y = 742 + Math.sin(t * Math.PI) * 20 + Math.round((rand() - 0.5) * 10);
    return `M${Math.round(x - 5)},${y}q${Math.round(4 + rand() * 4)},-6 ${Math.round(9 + rand() * 4)},0`;
  }).join('');
  s += `<use href="#${p.id('collar')}" fill="${K.redDeep}" opacity=".5" transform="translate(4 14)"/>`
    + `<use href="#${p.id('collar')}" fill="${collarFill}"/>`
    + `<g clip-path="url(#${p.id('collarClip')})"><path d="M444,690Q486,716 496,744Q502,772 474,812H600V690Z" fill="${K.furShade}" opacity=".85"/></g>`
    + `<use href="#${p.id('collar')}" fill="none" stroke="${K.furLine}" stroke-width="2.4" stroke-linejoin="round"/>`
    + `<path d="${collarTicks}" fill="none" stroke="${K.furDeep}" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`
    + `<path d="M302,732Q336,714 380,726" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>`;

  // ---- gold twin-disc clasp with a draped chain
  const disc = (x, y) => `<circle cx="${x}" cy="${y}" r="15" fill="${K.goldMid}" stroke="${K.goldLine}" stroke-width="2.4"/>`
    + `<circle cx="${x}" cy="${y}" r="11" fill="none" stroke="${K.gold}" stroke-width="1.6" stroke-dasharray="2.4 2.2"/>`
    + `<circle cx="${x}" cy="${y}" r="7" fill="${pal.accent}" stroke="${K.goldLine}" stroke-width="1.8"/>`
    + `<circle cx="${x - 2.4}" cy="${y - 2.6}" r="2.4" fill="#fff" opacity=".9"/>`;
  s += `<path d="M398,792Q416,812 434,792" fill="none" stroke="${K.goldLine}" stroke-width="5" stroke-linecap="round"/>`
    + `<path d="M398,792Q416,812 434,792" fill="none" stroke="${K.gold}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="4 2"/>`
    + `<path d="M400,786Q416,798 432,786" fill="none" stroke="${K.goldLine}" stroke-width="4" stroke-linecap="round"/>`
    + `<path d="M400,786Q416,798 432,786" fill="none" stroke="${K.goldMid}" stroke-width="2" stroke-linecap="round"/>`
    + disc(394, 784) + disc(438, 784);
  return s;
}

// ---------------------------------------------------------------- background: snowy pines, falling snow
function bgMotif(p) {
  const { n, rng } = p.helpers;
  const rand = rng(`${p.heroine.id}-xmas-snow`);
  // layered fir silhouettes along both sides (far = lighter & smaller)
  const fir = (x, base, h, w) => {
    let d = `M${x},${base - h}`;
    const tiers = 4;
    for (let i = 1; i <= tiers; i++) {
      const y = base - h + (h * i) / tiers, ww = (w * i) / tiers;
      d += `L${n(x + ww * 0.55)},${n(y - h * 0.06)}L${n(x + ww)},${n(y)}`;
    }
    d += `L${x + 5},${base}V${base + 30}H${x - 5}V${base}`;
    for (let i = tiers; i >= 1; i--) {
      const y = base - h + (h * i) / tiers, ww = (w * i) / tiers;
      d += `L${n(x - ww)},${n(y)}L${n(x - ww * 0.55)},${n(y - h * 0.06)}`;
    }
    return `${d}Z`;
  };
  const far = fir(60, 760, 220, 70) + fir(190, 800, 180, 56) + fir(780, 740, 240, 76) + fir(650, 790, 170, 52);
  const near = fir(110, 900, 300, 96) + fir(740, 880, 320, 100);
  // snow: soft flakes, denser and bigger toward the sides
  const flakes = [[], [], []];
  for (let i = 0; i < 70; i++) {
    const side = rand() < 0.5 ? rand() * 260 : 572 + rand() * 260;
    const x = rand() < 0.25 ? rand() * 832 : side, y = rand() * 1000, k = Math.floor(rand() * 3);
    flakes[k].push(`M${n(x)},${n(y)}h0`);
  }
  const snow = flakes.map((f, k) => `<path d="${f.join('')}" stroke-width="${[3, 5, 8][k]}" opacity="${[0.62, 0.44, 0.26][k]}"/>`).join('');
  const crystal = (x, y, r) => {
    let d = '';
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3, cx = Math.cos(a), sy = Math.sin(a);
      d += `M${x},${y}l${n(cx * r)},${n(sy * r)}M${n(x + cx * r * 0.55)},${n(y + sy * r * 0.55)}l${n(Math.cos(a + 0.7) * r * 0.3)},${n(Math.sin(a + 0.7) * r * 0.3)}M${n(x + cx * r * 0.55)},${n(y + sy * r * 0.55)}l${n(Math.cos(a - 0.7) * r * 0.3)},${n(Math.sin(a - 0.7) * r * 0.3)}`;
    }
    return d;
  };
  return `<path d="${far}" fill="#1a2a3a" opacity=".55"/>`
    + `<path d="${far}" fill="none" stroke="#e8ddff" stroke-width="1.6" opacity=".12"/>`
    + `<path d="${near}" fill="#0f1c26" opacity=".85"/>`
    + `<path d="M0,780Q200,740 416,770Q640,740 832,770V1216H0Z" fill="#1c2236" opacity=".6"/>`
    + `<g stroke="#f4f0ff" stroke-linecap="round" fill="none">${snow}</g>`
    + `<path d="${crystal(150, 150, 22)}${crystal(700, 210, 18)}${crystal(90, 560, 14)}${crystal(760, 620, 16)}" stroke="#e8ddff" stroke-width="2" stroke-linecap="round" opacity=".4"/>`;
}

// ---------------------------------------------------------------- holly sprig
const SPOT = {
  default: [552, 292, 0], lia: [550, 288, 0], freya: [554, 296, 0], serena: [552, 296, 0],
  aila: [280, 292, 1], lilith: [282, 290, 1], mia: [560, 324, 0], ophelia: [560, 354, 0], evelyn: [568, 404, 0],
};
// holly leaf in local units: base at 0,0, tip at 0,-46, spiky margin
const LEAF = 'M0,0C-6,-4 -14,-6 -12,-12C-18,-14 -20,-20 -14,-24C-20,-28 -18,-36 -11,-36C-12,-42 -6,-46 0,-50C6,-46 12,-42 11,-36C18,-36 20,-28 14,-24C20,-20 18,-14 12,-12C14,-6 6,-4 0,0Z';
function hairOrnament(p) {
  const [x, y, m] = SPOT[p.heroine.id] || SPOT.default;
  // mirror for left-side spots, and scale up a touch around the spot so it reads on 240px cards
  const tf = `${m ? `translate(${2 * x} 0) scale(-1 1) ` : ''}translate(${x} ${y}) scale(1.15) translate(${-x} ${-y})`;
  const leaf = (a, sc, shade) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${sc})">`
    + `<path d="${LEAF}" fill="${shade ? K.hollyShade : K.holly}" stroke="${K.hollyLine}" stroke-width="2.2" stroke-linejoin="round"/>`
    + `<path d="M0,-4L0,-44" stroke="${K.hollyLine}" stroke-width="1.6" opacity=".7"/>`
    + `<path d="M-3,-10C-8,-16 -9,-26 -5,-34" fill="none" stroke="${K.hollyLit}" stroke-width="3" stroke-linecap="round" opacity="${shade ? 0.4 : 0.85}"/></g>`;
  const berry = (bx, by, r) => `<circle cx="${bx}" cy="${by}" r="${r}" fill="${K.berry}" stroke="${K.berryLine}" stroke-width="1.8"/><circle cx="${bx - r * 0.35}" cy="${by - r * 0.38}" r="${(r * 0.34).toFixed(1)}" fill="#ffd3d6"/>`;
  const rib = mix(p.palette.accent, K.red, 0.25);
  return `<g transform="${tf}">`
    // small ribbon tails behind the sprig
    + `<path d="M${x},${y + 4}l-10,30l7,-3l4,8zM${x + 2},${y + 4}l16,26l-8,0l-2,8z" fill="${rib}" stroke="${mix(rib, '#000000', 0.6)}" stroke-width="1.8" stroke-linejoin="round"/>`
    + leaf(-62, 0.9, 1) + leaf(48, 0.85, 1) + leaf(-12, 1)
    + berry(x - 6, y - 4, 7.5) + berry(x + 8, y - 2, 7) + berry(x + 1, y + 9, 7.5)
    + `</g>`;
}

export default {
  type: 'christmas',
  label: '圣诞服',
  render,
  bgMotif,
  hairOrnament,
};
