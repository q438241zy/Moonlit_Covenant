// 婚礼礼服 (type 'wedding', ★5; 服装稿 §2.2 / §3.2) - 「礼服商会新季的婚礼主题样衣——试穿日」 for ex003 (拱廊街礼服店).
// A sample fitting in a dress shop, never a wedding: no ring, no groom or male silhouette, no altar or chapel, no vows,
// no ribbon with two names, no oath glow; the veil never covers the face (pinned at the back). The shop is the
// background - glass arches, a floor mirror's frame, bolts of cloth - lit by the moon. Every neckline sits at the
// collarbones or higher, or across the upper chest off the shoulder; lace is drawn opaque. Evelyn's is deliberately
// worldly (star blue, a crown of flowers she picked, no stole or holy marks); Ophelia's only uses her own clan's
// colours. Her emblem goes on the sash knot or the collar brooch, her motif is woven into the lace.
import { mix, smooth, taper, mirrorPts, mirrorPath } from '../base.mjs';
import { MIR, ip, f1, cloth, garment, fold, circ, star, placer, button, ruffle } from '../garment.mjs';

const IVORY = '#fbf6ea';
// neckline (left half to the centre), sleeves, colours, details
const GOWN = {
  lia: { neck: [[262, 750], [320, 740], [372, 742], [416, 746]], sleeve: 'short', hem: 960, body: IVORY, sash: '#c13b4c' },
  mia: { neck: [[352, 690], [372, 704], [394, 716], [416, 720]], sleeve: 'short', hem: 940, body: '#fdfaf4', puff: true, lace: 'gear', buttons: '#c98a3f' },
  serena: { neck: [[364, 612], [370, 640], [392, 650], [416, 652]], sleeve: 'long', body: '#f3eefb', fade: '#4a3570', lace: 'crescent', collar: true },
  freya: { neck: [[364, 620], [370, 646], [392, 654], [416, 656]], sleeve: 'long', body: '#f8fcff', lace: 'snowflake', fur: true, collar: true },
  lilith: { neck: [[364, 626], [370, 650], [392, 658], [416, 660]], sleeve: 'none', body: '#f4f6f8', lace: 'leaf', piping: '#2a2420', collar: true },
  evelyn: { neck: [[300, 760], [344, 756], [380, 758], [416, 760]], sleeve: 'short', hem: 920, body: IVORY, chiffon: '#7fa8ee' },
  ophelia: { neck: [[132, 870], [180, 830], [250, 806], [330, 796], [416, 794]], sleeve: 'long', body: '#1f3a7a', lace: 'horn', edge: '#c8643c' },
  aila: { neck: [[364, 632], [370, 656], [392, 664], [416, 666]], sleeve: 'long', body: '#fbfaf6', uniform: true, collar: true },
};

function lace(p, id, kind, color) {
  const A = p.accent;
  const glyph = A ? A.glyph(20, 20, 9) + A.glyph(0, 0, 5) + A.glyph(40, 0, 5) + A.glyph(0, 40, 5) + A.glyph(40, 40, 5) : `M10,20a10,10 0 1 0 20,0a10,10 0 1 0 -20,0`;
  p.def(`<pattern id="${p.id(id)}" width="40" height="40" patternUnits="userSpaceOnUse"><path d="${glyph}" fill="${color}" fill-rule="evenodd"/></pattern>`);
  return `url(#${p.id(id)})`;
}

function render(p) {
  const id = p.heroine.id;
  const G = GOWN[id] || GOWN.lia;
  const C = cloth(G.body, { ink: id === 'ophelia' ? '#08102a' : '#3a3450', lit: 0.5, shade: 0.16, deep: 0.3, line: 0.62 });
  const A = p.accent;
  let s = garment(p, { C, neck: G.neck, sleeve: G.sleeve, hem: G.hem });
  // the moon-white-to-violet fade of Serena's gown; Evelyn's star-blue chiffon below the bodice
  if (G.fade) s += `<g clip-path="${p.refs.bodyClip}"><rect y="900" width="832" height="320" fill="${p.lin('fade', [[0, G.fade, 0], [1, G.fade, 0.95]], [0, 900, 0, 1216])}"/></g>`;
  if (G.chiffon) {
    const ch = cloth(G.chiffon);
    s += `<g clip-path="${p.refs.torsoClip}"><path d="M200,1040Q416,1060 640,1040V1230H200Z" fill="${ch.base}"/><path d="M200,1040Q416,1060 640,1040" fill="none" stroke="${ch.line}" stroke-width="2.4"/>`
      + `<path d="${[300, 360, 420, 480, 540].map((x) => fold([[x, 1056], [x + 8, 1140], [x + 4, 1216]], 6)).join('')}" fill="${ch.shade}"/></g>`;
  }
  // lace over the bodice (opaque threads, motif from her kit)
  if (G.lace) {
    const fill = lace(p, 'lace', G.lace, id === 'ophelia' ? '#9fb2e0' : mix(G.body, '#8a86a8', 0.45));
    s += `<g clip-path="${p.clip('laceNeck', smooth([[-20, G.neck[0][1], 1], ...G.neck, ...mirrorPts(G.neck.slice(0, -1)).reverse(), [852, G.neck[0][1], 1], [852, 1040, 1], [-20, 1040, 1]], { closed: true }))}"><g clip-path="${p.refs.bodyClip}"><rect y="600" width="832" height="440" fill="${fill}" opacity=".55"/></g></g>`;
  }
  // puff shoulders (Mia)
  if (G.puff) {
    const puff = smooth([[136, 840], [150, 784], [200, 756], [246, 770], [250, 840], [238, 930, 1], [130, 930, 1]], { closed: true });
    s += `<g clip-path="${p.refs.bodyClip}"><path d="${puff}" fill="${C.lit}" stroke="${C.line}" stroke-width="2.4"/><path d="${mirrorPath(puff)}" fill="${C.base}" stroke="${C.line}" stroke-width="2.4"/>`
      + `<path d="M160,800Q190,850 180,920M208,780Q224,850 214,926${mirrorPath('M160,800Q190,850 180,920M208,780Q224,850 214,926')}" fill="none" stroke="${C.shade}" stroke-width="2.4"/></g>`;
    s += [790, 850, 910, 970].map((y) => button(416, y, 6, G.buttons, '#4a2a0e')).join('');
    s += `<path d="M262,830Q300,900 300,1000M570,830Q532,900 532,1000" fill="none" stroke="#5ed7ff" stroke-width="2" opacity=".35"/>`;
  }
  // stand collar for the high necklines
  if (G.collar) {
    const top = G.neck[G.neck.length - 1][1];
    const col = smooth([[372, top - 6, 1], [416, top + 4], [460, top - 6, 1], [462, 700, 1], [416, 710], [370, 700, 1]], { closed: true });
    s += `<path d="${col}" fill="${p.lin('collar', [[0, C.lit], [0.6, C.base], [1, C.shade]], [370, 0, 462, 0])}" stroke="${C.line}" stroke-width="2.4"/>`
      + `<path d="M440,${top}Q456,${top - 2} 460,${top - 6}L462,700Q456,704 440,708Z" fill="${C.shade}" opacity=".7"/>`
      + (G.piping ? `<path d="M372,${top - 4}Q416,${top + 8} 460,${top - 4}M372,700Q416,712 462,700" fill="none" stroke="${G.piping}" stroke-width="3"/><path d="M372,${top - 4}Q416,${top + 8} 460,${top - 4}" fill="none" stroke="#d9a441" stroke-width="1.2"/>` : '');
  }
  // neckline trims
  const neckD = smooth(G.neck);
  if (!G.collar) s += `<path d="${neckD}${mirrorPath(neckD)}" fill="none" stroke="${G.edge || C.line}" stroke-width="${G.edge ? 5 : 2.6}"/>`;
  if (G.edge) s += `<path d="${neckD}${mirrorPath(neckD)}" fill="none" stroke="#f0a070" stroke-width="1.6" stroke-dasharray="3 4"/>`;
  s += (DETAIL[id] || (() => ''))(p, G, C);
  return s;
}

// per-heroine details: sashes, capelets, the fur stole, the uniform
const DETAIL = {
  // red satin sash with gold flames; a lace capelet on her left shoulder (viewer's right) with a deliberate notch;
  // a corsage of a red rose and one strawberry
  lia(p, G, C) {
    const A = p.accent;
    const R = cloth(G.sash);
    const sash = 'M236,1060Q416,1084 598,1060L598,1100Q416,1124 236,1100Z';
    let s = `<g clip-path="${p.refs.torsoClip}"><path d="${sash}" fill="${R.base}" stroke="${R.line}" stroke-width="2.4"/><path d="M470,1076Q540,1072 598,1060L598,1100Q540,1110 470,1116Z" fill="${R.shade}"/></g>`;
    if (A) s += `<path d="${[300, 360, 472, 532].map((x) => A.glyph(x, 1082 + Math.abs(x - 416) * 0.02, 9)).join('')}" fill="#ffd091"/>`;
    const cape = ruffle([[452, 742], [520, 748], [590, 766], [650, 800], [690, 850]], 14, (t) => 46 + 30 * Math.sin(t * Math.PI), 1);
    s += `<path d="${cape.d}" fill="#fffaf2" stroke="#8a7a72" stroke-width="2.2" stroke-linejoin="round"/><path d="${cape.gathers}" fill="none" stroke="#d8ccc0" stroke-width="1.6"/>`
      + `<path d="${cape.dots}" fill="none" stroke="#c8b8a8" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="0 8"/>`
      // the notch: a clean bite out of the outer edge, like her pauldron's battle notch
      + `<path d="M640,826L662,836L650,858Z" fill="${C.shade}"/>`;
    // corsage high on her right (viewer's left)
    s += rose(326, 784, 1, '#d62a40', '#6a0e1c') + `<path d="M344,800c-6,-3 -6,-10 0,-12c6,2 6,9 0,12z" fill="#ff5a6a" stroke="#6a0e1c" stroke-width="1.4"/><path d="M341,788l3,-3l3,3z" fill="#5aa868"/>`;
    return s;
  },
  mia() { return ''; },
  // Serena: a star-orbit seal stitched in silver below the collar
  serena(p) {
    return `<g fill="none" stroke="#c9cde0" stroke-width="1.8" opacity=".9"><circle cx="416" cy="760" r="26"/><ellipse cx="416" cy="760" rx="40" ry="14" transform="rotate(-20 416 760)"/><circle cx="416" cy="760" r="4" fill="#c9cde0"/></g>`;
  },
  // Freya: her white fur stole over both shoulders
  freya(p) {
    const stole = smooth([[120, 860], [150, 790], [220, 750], [300, 728], [372, 712], [416, 716], [460, 712], [532, 728], [612, 750], [682, 790], [712, 860], [690, 900], [600, 860], [520, 830], [416, 822], [312, 830], [232, 860], [142, 900]], { closed: true });
    let fluff = '';
    for (let i = 0; i < 22; i++) {
      const t = i / 21, x = 130 + t * 572, y = 870 - Math.sin(t * Math.PI) * 54;
      fluff += `M${f1(x - 12)},${f1(y)}q12,${i % 2 ? 16 : 12} 24,0`;
    }
    return `<g clip-path="${p.refs.bodyClip}"><path d="${stole}" fill="${p.lin('fur', [[0, '#ffffff'], [0.6, '#eef6fb'], [1, '#c8dce8']], [0, 700, 0, 900])}" stroke="#6f9cbc" stroke-width="2.6"/>`
      + `<path d="${fluff}" fill="none" stroke="#b8d0e0" stroke-width="2.4" stroke-linecap="round"/></g>`
      + (p.accent ? p.accent.emblem(416, 744, 0.62) : '');
  },
  // Lilith: a one-sided short lace capelet over her right shoulder (viewer's left), like her one-sided cape
  lilith(p, G, C) {
    const cape = ruffle([[372, 702], [300, 716], [230, 744], [176, 784], [140, 840]], 12, (t) => 42 + 34 * Math.sin(t * Math.PI), -1);
    return `<path d="${cape.d}" fill="#fbfcfd" stroke="#2a2420" stroke-width="2.4" stroke-linejoin="round"/><path d="${cape.gathers}" fill="none" stroke="#c8ccd4" stroke-width="1.6"/>`
      + `<path d="${cape.dots}" fill="none" stroke="#d9a441" stroke-width="2" stroke-linecap="round" stroke-dasharray="0 9"/>`
      + `<path d="M262,760Q300,900 300,1100M570,760Q532,900 532,1100" fill="none" stroke="#2a2420" stroke-width="3"/><path d="M262,760Q300,900 300,1100M570,760Q532,900 532,1100" fill="none" stroke="#d9a441" stroke-width="1.2"/>`;
  },
  // Evelyn: a soft bow of star-blue chiffon at the neckline; her braid's bell turned into a little ribbon bell under it
  evelyn(p, G) {
    return `<path d="M416,768C396,750 368,756 374,776C378,790 400,786 416,776ZM416,768C436,750 464,756 458,776C454,790 432,786 416,776Z" fill="${G.chiffon}" stroke="#2a4a8a" stroke-width="2" stroke-linejoin="round"/><circle cx="416" cy="772" r="6" fill="#bcd4f8" stroke="#2a4a8a" stroke-width="1.6"/>`
      + (p.accent ? `<path d="M416,778V792" stroke="#a87a28" stroke-width="1.6"/><path d="${p.accent.glyph(416, 802, 10)}" fill="#ffd98c" stroke="#7a5a1e" stroke-width="1.2"/>` : '');
  },
  // Ophelia: silver scale lace, copper embroidery - her own clan's colours only - and her claw brooch on the edge
  ophelia(p) {
    return p.accent ? p.accent.emblem(416, 818, 0.62) : '';
  },
  // Aila: a white dress-uniform jacket - gold frogging, small epaulettes, a sky-blue sash from her right shoulder,
  // a short white cape on one shoulder, no crest
  aila(p, G, C) {
    let s = '';
    for (const y of [780, 830, 880, 930]) s += `<path d="M364,${y}H468" stroke="#6a4a10" stroke-width="6" stroke-linecap="round"/><path d="M364,${y}H468" stroke="#f5c84c" stroke-width="3.4" stroke-linecap="round"/><circle cx="364" cy="${y}" r="5" fill="#f5c84c" stroke="#6a4a10" stroke-width="1.6"/><circle cx="468" cy="${y}" r="5" fill="#f5c84c" stroke="#6a4a10" stroke-width="1.6"/>`;
    const ep = 'M196,770Q232,752 270,762L262,790Q232,784 204,796Z';
    s += `<path d="${ep}" fill="#f5c84c" stroke="#6a4a10" stroke-width="2.2"/><path d="${mirrorPath(ep)}" fill="#d8a838" stroke="#6a4a10" stroke-width="2.2"/>`
      + `<path d="M204,796l-4,20M216,792l-3,22M228,790l-2,22M240,788l-1,22M252,788v22${mirrorPath('M204,796l-4,20M216,792l-3,22M228,790l-2,22M240,788l-1,22M252,788v22')}" stroke="#f5c84c" stroke-width="2.6" stroke-linecap="round"/>`;
    const sash = 'M250,770L300,750L590,1150L540,1180Z';
    s += `<g clip-path="${p.refs.torsoClip}"><path d="${sash}" fill="#6fb3ff" stroke="#1c2f78" stroke-width="2.4"/><path d="M260,768L590,1160" stroke="#bcdcff" stroke-width="3"/></g>`;
    s += p.accent ? p.accent.emblem(570, 1136, 0.6) : '';
    return s;
  },
};

/** a small rose: spiral petals */
function rose(x, y, k, base, line) {
  return `<g stroke-linejoin="round"><circle cx="${x}" cy="${y}" r="${f1(13 * k)}" fill="${base}" stroke="${line}" stroke-width="1.8"/>`
    + `<path d="M${f1(x - 6 * k)},${f1(y - 2 * k)}q${f1(6 * k)},${f1(-8 * k)} ${f1(12 * k)},0q${f1(-2 * k)},${f1(8 * k)} ${f1(-8 * k)},${f1(8 * k)}q${f1(-6 * k)},0 ${f1(-6 * k)},${f1(-6 * k)}" fill="none" stroke="${line}" stroke-width="1.6"/>`
    + `<path d="M${f1(x - 18 * k)},${f1(y + 6 * k)}q${f1(6 * k)},${f1(-10 * k)} ${f1(14 * k)},${f1(-4 * k)}q${f1(-4 * k)},${f1(8 * k)} ${f1(-14 * k)},${f1(4 * k)}z" fill="#4f9a5e" stroke="#173a1f" stroke-width="1.4"/></g>`;
}

// ---------------------------------------------------------------- veils (behind the body), shield garland
function bodyBack(p) {
  const id = p.heroine.id;
  const veil = (d) => `<path d="${d}" fill="#ffffff" fill-opacity=".5" stroke="#d8d4e8" stroke-width="2.4" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-dasharray="2 10" transform="translate(-4 6)" opacity=".8"/>`;
  if (id === 'lia') return veil(smooth([[440, 196], [520, 230], [600, 340], [660, 520], [700, 700], [700, 760, 1], [620, 700], [560, 520], [490, 330]], { closed: true }));
  if (id === 'serena' || id === 'ophelia') return veil(smooth([[300, 250], [216, 360], [170, 560], [140, 800], [110, 1216, 1], [722, 1216, 1], [692, 800], [662, 560], [616, 360], [532, 250], [416, 222]], { closed: true }));
  if (id === 'lilith') return veil(smooth([[300, 330], [250, 480], [210, 700], [170, 1000], [150, 1216, 1], [682, 1216, 1], [662, 1000], [622, 700], [582, 480], [532, 330], [416, 300]], { closed: true }));
  return '';
}
function extrasOverlay(p, name) {
  if (name !== 'shield') return '';
  // white satin ribbon round the shield's top and a garland of small roses (it stays on her back, B10)
  let roses = '';
  for (let i = 0; i < 6; i++) roses += rose(-150 + i * 60, 10 + Math.abs(i - 2.5) * 6, 0.9, i % 2 ? '#fffaf2' : '#e84a5c', '#6a0e1c');
  return `<g transform="translate(590 560) rotate(18)"><path d="M-170,30Q0,10 170,30" fill="none" stroke="#fffaf2" stroke-width="14"/><path d="M-170,30Q0,10 170,30" fill="none" stroke="#d8ccc0" stroke-width="2" stroke-dasharray="6 6"/>${roses}`
    + `<path d="M150,30l20,60l12,-10l14,6l-18,-58z" fill="#fffaf2" stroke="#8a7a72" stroke-width="2"/></g>`;
}

// ---------------------------------------------------------------- head pieces
function hairOrnament(p) {
  const id = p.heroine.id;
  if (id === 'lia') return rose(452, 196, 0.9, '#fffaf2', '#8a7a72') + rose(478, 206, 0.7, '#e84a5c', '#6a0e1c');
  if (id === 'mia') {
    // a little top hat tilted on her head, a wrench-shaped pin in its band
    return `<g transform="rotate(-14 470 200)" stroke-linejoin="round"><path d="M420,214Q470,226 520,214L516,226Q470,240 424,226Z" fill="#2a2a34" stroke="#0e0e14" stroke-width="2.4"/>`
      + `<path d="M438,218V150Q470,140 502,150V218Z" fill="#33333f" stroke="#0e0e14" stroke-width="2.4"/><path d="M438,200Q470,206 502,200V212Q470,218 438,212Z" fill="#fdfaf4"/>`
      + `<path d="M480,198l14,-20l6,4l-12,20z" fill="#d6dbe6" stroke="#2a3346" stroke-width="1.6"/></g>`;
  }
  if (id === 'freya') {
    // a fine ice-crystal tiara beside her comb
    return `<g stroke-linejoin="round"><path d="M352,232Q416,206 480,232" fill="none" stroke="#c9d8e8" stroke-width="5"/>`
      + [[380, 214, 22], [416, 206, 32], [452, 214, 22]].map(([x, y, h]) => `<path d="M${x - 7},${y + 2}L${x},${y - h}L${x + 7},${y + 2}Z" fill="#dff4ff" stroke="#3f8fc4" stroke-width="1.8"/>`).join('') + `</g>`;
  }
  if (id === 'evelyn') {
    // a crown of small white and blue flowers she chose herself
    let fl = '';
    for (let i = 0; i < 11; i++) {
      const t = i / 10, x = 276 + t * 280, y = 316 - Math.sin(t * Math.PI) * 78;
      fl += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${i % 2 ? 9 : 11}" fill="${i % 3 === 0 ? '#9fc0f4' : '#fffaf2'}" stroke="#5a6a90" stroke-width="1.6"/><circle cx="${f1(x)}" cy="${f1(y)}" r="3" fill="#ffd98c"/>`;
    }
    return `<g>${fl}</g>`;
  }
  if (id === 'ophelia') {
    // silver chains and pearls hung between her horns
    const ch = 'M222,292Q416,214 610,292';
    return `<path d="${ch}" fill="none" stroke="#c9d2ea" stroke-width="3"/><path d="M226,300Q416,240 606,300" fill="none" stroke="#c9d2ea" stroke-width="2"/>`
      + [0.2, 0.35, 0.5, 0.65, 0.8].map((t) => `<circle cx="${f1(222 + t * 388)}" cy="${f1(292 - Math.sin(t * Math.PI) * 62 + 14)}" r="5" fill="#fff8f0" stroke="#8a8aa8" stroke-width="1.2"/>`).join('');
  }
  return '';
}
function headBack(p) {
  if (p.heroine.id !== 'mia') return '';
  // white satin bows on the receiver ears
  const bow = (tf) => `<g transform="${tf}"><path d="M-10,-40l-22,-14l-2,26zM-10,-40l22,-12l2,26z" fill="#fdfaf4" stroke="#8a8aa0" stroke-width="2"/><circle cx="-10" cy="-38" r="5" fill="#e8e4f0" stroke="#8a8aa0" stroke-width="1.6"/></g>`;
  return bow('translate(314 232) rotate(-23) scale(1.06)') + bow('translate(518 232) rotate(23) scale(-1.06 1.06)');
}

// ---------------------------------------------------------------- props
const bouquet = (x, y, k, flowers, leaf = '#4f9a5e') => {
  let s = `<path d="M${x},${y + 40 * k}L${x - 12 * k},${y + 150 * k}M${x},${y + 40 * k}L${x + 10 * k},${y + 150 * k}M${x},${y + 40 * k}L${x},${y + 156 * k}" stroke="#3a6a40" stroke-width="${f1(5 * k)}" stroke-linecap="round"/>`
    + `<path d="M${x - 18 * k},${y + 96 * k}Q${x},${y + 108 * k} ${x + 18 * k},${y + 96 * k}L${x + 14 * k},${y + 118 * k}Q${x},${y + 124 * k} ${x - 14 * k},${y + 118 * k}Z" fill="#fffaf2" stroke="#8a7a72" stroke-width="1.8"/>`;
  flowers.forEach(([dx, dy, r, c], i) => {
    s += `<path d="M${f1(x + dx * k - r * k * 1.4)},${f1(y + dy * k + r * k * 0.8)}q${f1(r * k)},${f1(-r * k * 1.6)} ${f1(r * k * 2.6)},${f1(-r * k * 0.4)}" fill="none" stroke="${leaf}" stroke-width="${f1(4 * k)}" stroke-linecap="round"/>`
      + `<circle cx="${f1(x + dx * k)}" cy="${f1(y + dy * k)}" r="${f1(r * k)}" fill="${c}" stroke="${mix(c, '#000000', 0.55)}" stroke-width="1.6"/>`
      + `<circle cx="${f1(x + dx * k - r * k * 0.3)}" cy="${f1(y + dy * k - r * k * 0.3)}" r="${f1(r * k * 0.35)}" fill="#ffffff" opacity=".55"/>`;
  });
  return `<g stroke-linejoin="round">${s}</g>`;
};
const PROP = {
  // a small strawberry wedding cake rising from the lower left ("蛋糕才是重点")
  lia() {
    const tier = (x, y, w, h) => `<path d="M${x - w / 2},${y}H${x + w / 2}V${y + h}H${x - w / 2}Z" fill="#fffaf2" stroke="#8a7a72" stroke-width="2.4"/><path d="M${x - w / 2},${y + 6}q${w / 8},12 ${w / 4},0t${w / 4},0t${w / 4},0t${w / 4},0" fill="none" stroke="#ff8a96" stroke-width="3"/>`;
    let berries = '';
    for (const [x, y] of [[200, 1026], [222, 1020], [244, 1026], [168, 1100], [276, 1100]]) berries += `<path d="M${x},${y + 8}c-8,-4 -8,-14 0,-16c8,2 8,12 0,16z" fill="#e8344a" stroke="#6a0e1c" stroke-width="1.4"/><path d="M${x - 4},${y - 8}l4,-4l4,4z" fill="#5aa868"/>`;
    return `<g stroke-linejoin="round" transform="translate(0 -60)"><path d="M90,1276H350V1200H90Z" fill="#d8d4e8"/>${tier(220, 1110, 220, 160)}${tier(222, 1036, 140, 74)}${berries}</g>`;
  },
  // Zero in a bow tie with a camera lens: the fitting-day photographer
  mia() {
    return `<g stroke-linejoin="round"><path d="M688,730l-20,-12l-2,24zM688,730l20,-12l2,24z" fill="#2a2a34" stroke="#0e0e14" stroke-width="2"/><circle cx="688" cy="730" r="5" fill="#33333f"/>`
      + `<rect x="616" y="664" width="34" height="26" rx="5" fill="#2a2a34" stroke="#0e0e14" stroke-width="2"/><circle cx="616" cy="677" r="12" fill="#5ed7ff" stroke="#0e0e14" stroke-width="2.4"/><circle cx="612" cy="673" r="3.6" fill="#fff"/></g>`;
  },
  // a silver hand mirror floating beside her; its glass shows only a crescent moon, no one's face
  serena(p) {
    const x = 648, y = 960;
    return `<g stroke-linejoin="round"><path d="M${x},${y + 80}L${x + 10},${y + 200}" stroke="#8a90a8" stroke-width="16" stroke-linecap="round"/><path d="M${x},${y + 80}L${x + 10},${y + 200}" stroke="#d6dbf0" stroke-width="8" stroke-linecap="round"/>`
      + `<ellipse cx="${x}" cy="${y}" rx="70" ry="86" fill="#d6dbf0" stroke="#2c2766" stroke-width="3.4"/><ellipse cx="${x}" cy="${y}" rx="56" ry="72" fill="${p.rad('glass', [[0, '#3a3060'], [1, '#14102a']], { cx: x - 14, cy: y - 20, r: 90 })}"/>`
      + `<path d="M${x + 10},${y - 34}A34,34 0 1 0 ${x + 10},${y + 34}A26,26 0 1 1 ${x + 10},${y - 34}Z" fill="#efe9ff"/>`
      + `<path d="M${x - 40},${y - 40}Q${x - 30},${y - 62} ${x - 6},${y - 66}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/></g>`;
  },
  // snowdrops and ice-blue roses
  freya() { return bouquet(416, 930, 1.7, [[-36, 0, 16, '#fbfdff'], [0, -16, 18, '#9fd8f4'], [34, 2, 16, '#fbfdff'], [-16, 26, 14, '#c8ecfc'], [20, 28, 14, '#9fd8f4']]); },
  // a slender white-and-green bouquet held slanting, the angle of her reverse grip
  lilith() {
    return `<g transform="rotate(-38 300 1100)">${bouquet(300, 900, 1.7, [[-14, 0, 12, '#f4f6f8'], [10, -18, 10, '#d8ecd0'], [12, 12, 11, '#f4f6f8'], [-4, -34, 9, '#e8f4e0']], '#5f9a54')}</g>`;
  },
  // forget-me-nots she picked herself
  evelyn() { return bouquet(330, 950, 1.6, [[-20, 0, 10, '#7fa8ee'], [0, -14, 10, '#9fc0f4'], [18, 0, 10, '#7fa8ee'], [-8, 16, 9, '#bcd4f8'], [12, 18, 9, '#9fc0f4'], [-26, 20, 8, '#bcd4f8']]); },
  // a bouquet she leans in to smell
  ophelia() { return bouquet(416, 920, 1.7, [[-30, 0, 15, '#f9b8d8'], [0, -18, 17, '#f472b6'], [30, 0, 15, '#f9b8d8'], [-12, 24, 13, '#fbe0ee'], [16, 26, 13, '#f472b6']]); },
  // one long-stemmed white rose held up like a sword in salute
  aila() {
    return `<g stroke-linejoin="round"><path d="M530,1216L494,820" stroke="#3a6a40" stroke-width="8" stroke-linecap="round"/><path d="M508,980q-26,-12 -40,8q26,8 40,-8zM514,1060q26,-12 40,8q-26,8 -40,-8z" fill="#4f9a5e" stroke="#173a1f" stroke-width="1.6"/>`
      + rose(492, 806, 2.3, '#fffaf2', '#8a7a72') + `</g>`;
  },
};
function foreground(p) { return PROP[p.heroine.id] ? PROP[p.heroine.id](p) : ''; }

// ---------------------------------------------------------------- background: the dress shop by moonlight
function bgMotif(p) {
  const glass = p.lin('shopGlass', [[0, '#2a2a52'], [1, '#141230']], [0, 0, 0, 600]);
  let arch = '';
  for (let i = 0; i < 4; i++) {
    const x = i * 208;
    arch += `M${x + 14},600V230A90,90 0 0 1 ${x + 194},230V600Z`;
  }
  const mullions = [0, 1, 2, 3].map((i) => `M${i * 208 + 104},140V600M${i * 208 + 14},380H${i * 208 + 194}`).join('');
  const bolt = (x, y, c) => `<rect x="${x}" y="${y}" width="40" height="190" rx="18" fill="${c}" stroke="#141024" stroke-width="2"/><ellipse cx="${x + 20}" cy="${y}" rx="20" ry="8" fill="${mix(c, '#ffffff', 0.3)}" stroke="#141024" stroke-width="2"/>`;
  return `<path d="${arch}" fill="${glass}"/><path d="${mullions}" stroke="#4a4a70" stroke-width="5"/>`
    + `<path d="M0,600H832" stroke="#3a3660" stroke-width="10"/>`
    + `<circle cx="150" cy="200" r="40" fill="#efe9ff" opacity=".85"/>`
    + `<path d="M40,1216V700Q40,620 110,620Q180,620 180,700V1216" fill="none" stroke="#c8a868" stroke-width="10" opacity=".7"/>`
    + `<path d="M56,1216V704Q56,640 110,640Q164,640 164,704V1216Z" fill="#1c1a36" opacity=".8"/>`
    + bolt(660, 680, '#c8a8d8') + bolt(704, 700, '#f2e6d0') + bolt(748, 690, '#9fc0e8');
}

const expression = {
  lia: { blush: 0.45, gaze: [0.5, 0], mouth: 'pressed', browAngle: 0.4 },
  mia: { gaze: [0.1, 0.5] },
  serena: { mouth: 'smile', lidDrop: 0.5, browAngle: -0.2 },
  freya: { mouth: 'smile', browAngle: -0.3 },
  lilith: { gaze: [0.6, 0.1], blush: 0.55, mouth: 'pressed' },
  evelyn: { mouth: 'smile', blush: 0.55, gaze: [-0.2, 0.3] },
  ophelia: { mouth: 'grin', gaze: [0, 0.3] },
  aila: { mouth: 'grin', browAsym: 0.6, gaze: [0, 0] },
};

export default {
  type: 'wedding',
  label: '婚礼礼服',
  render,
  bgMotif,
  bodyBack,
  headBack,
  hairOrnament,
  foreground,
  extrasOverlay,
  expression,
  hideFor: { evelyn: ['headFront'] },
};
