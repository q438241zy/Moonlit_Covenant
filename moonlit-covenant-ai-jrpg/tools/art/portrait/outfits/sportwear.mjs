// 运动短袖 (type 'sportwear', ★3; 服装稿 §2.4 / §3.4) - the knights' / guild training tee for ex004 (圣都骑士团演武场的操练日):
// a cotton crew-neck SHORT-sleeved tee for all eight (no sleeveless, no crop, nothing see-through), a race bib with her
// emblem instead of a number (no <text>), her motif along the sleeve cuffs, one bead of sweat at the temple and nowhere
// else. Hair never changes - only a headband or a towel is added. The weapon's place takes a training prop: Lia's
// team flag, Zero's score bar, Serena's scoring board, Freya's flask, Lilith's relay baton, Evelyn's bell streamers,
// Ophelia's stone ball, Aila's old-style racquet on her back. Background: the training ground at night.
import { mix, smooth, taper, mirrorPts, mirrorPath } from '../base.mjs';
import { MIR, ip, f1, cloth, garment, fold, drop, circ, star, placer } from '../garment.mjs';

// body / sleeve colours, details
const TEE = {
  lia: { body: '#cf3044', sleeve: '#fff0d6', raglan: true },
  mia: { body: '#2aa6d6', roll: true, hem: 1012 },
  serena: { body: '#3a2a58' },
  freya: { body: '#cfe9f7' },
  lilith: { body: '#1e1c24', sleeve: '#2c5a3c' },
  evelyn: { body: '#fbf8f0', print: '#6f9ee8' },
  ophelia: { body: '#24427e', print: '#c8643c', roll: true },
  aila: { body: '#f3c443', collar: '#6fb3ff' },
};
const NECK = [[352, 690], [372, 704], [393, 716], [416, 720]];

function render(p) {
  const T = TEE[p.heroine.id] || TEE.lia;
  const C = cloth(T.body), SC = T.sleeve ? cloth(T.sleeve) : C;
  const A = p.accent;
  const hem = T.hem || 1000;
  let s = garment(p, { C, SC: T.raglan ? C : SC, neck: NECK, sleeve: 'short', hem });
  // raglan shoulders in the second colour (Lia)
  if (T.raglan) {
    const rag = smooth([[374, 704, 1], [330, 708], [270, 728], [200, 752], [150, 800], [120, 900], [120, 1010, 1], [238, 1006, 1], [238, 912, 1], [290, 812], [340, 744]], { closed: true });
    s += `<g clip-path="${p.refs.bodyClip}"><path d="${rag}" fill="${SC.base}" stroke="${SC.line}" stroke-width="2.4"/><path d="${mirrorPath(rag)}" fill="${SC.shade}" stroke="${SC.line}" stroke-width="2.4"/></g>`;
  }
  // printed pattern on the body (Evelyn's stars, Ophelia's scale rows)
  if (T.print) {
    const pat = p.heroine.id === 'evelyn'
      ? `<path d="${star(14, 14, 7)}${star(44, 42, 5)}" fill="${T.print}" opacity=".8"/>`
      : `<path d="M0,20A10,10 0 0 1 20,20M20,20A10,10 0 0 1 40,20M10,40A10,10 0 0 1 30,40" fill="none" stroke="${T.print}" stroke-width="2.4" opacity=".7"/>`;
    p.def(`<pattern id="${p.id('print')}" width="${p.heroine.id === 'evelyn' ? 60 : 40}" height="${p.heroine.id === 'evelyn' ? 56 : 40}" patternUnits="userSpaceOnUse">${pat}</pattern>`);
    s += `<g clip-path="${p.refs.torsoClip}"><path d="M236,740H600V1216H236Z" fill="url(#${p.id('print')})"/></g>`;
  }
  // rolled cuffs: two folds of the hem (Mia, Ophelia)
  if (T.roll) {
    const roll = `M124,${hem - 22}Q182,${hem - 6} 238,${hem - 14}L238,${hem + 2}Q182,${hem + 10} 126,${hem - 6}Z`;
    s += `<g clip-path="${p.refs.bodyClip}"><path d="${roll}" fill="${C.lit}" stroke="${C.line}" stroke-width="2"/><path d="${mirrorPath(roll)}" fill="${C.base}" stroke="${C.line}" stroke-width="2"/></g>`;
  }
  // her motif along both sleeve cuffs
  if (A) {
    const cuffs = [150, 186, 222].map((x) => A.glyph(x, hem + 8 + (x - 150) * 0.08, 6)).join('');
    s += `<path d="${cuffs}${mirrorPath(cuffs)}" fill="${A.main}" fill-rule="evenodd" opacity=".9"/>`;
  }
  // rib collar
  const rib = smooth([[352, 690], [372, 704], [393, 716], [416, 720], [439, 716], [460, 704], [480, 690], [482, 702], [462, 718], [440, 730], [416, 734], [392, 730], [370, 718], [350, 702]], { closed: true });
  s += `<path d="${rib}" fill="${T.collar || C.lit}" stroke="${C.line}" stroke-width="2.4"/>`
    + `<path d="M358,700Q390,726 416,728Q442,726 474,700" fill="none" stroke="${mix(T.collar || C.lit, '#000000', 0.25)}" stroke-width="1.4" stroke-dasharray="3 3"/>`;
  // the race bib with her emblem in place of a number, four safety pins
  s += `<g stroke-linejoin="round"><path d="M344,930L488,926L492,1036L346,1040Z" fill="#fbfaf4" stroke="#55506a" stroke-width="2.4"/>`
    + `<path d="M420,928L488,926L492,1036L428,1038Z" fill="#e2deea" opacity=".7"/>`
    + `<path d="M352,946h132M352,1024h134" stroke="${T.raglan ? '#cf3044' : mix(T.body, '#000000', 0.1)}" stroke-width="4"/>`
    + [[354, 938], [480, 935], [356, 1030], [482, 1027]].map(([x, y]) => `<path d="M${x - 6},${y}h12" stroke="#a8a8b8" stroke-width="2.4" stroke-linecap="round"/>`).join('')
    + (A ? A.emblem(418, 984, 0.92) : '')
    + `</g>`;
  return s;
}

// ---------------------------------------------------------------- head: sweatbands, Serena's towel hood, Evelyn's ribbon band
const BAND = 'M266,330Q300,262 416,250Q532,262 566,330';
function hairOrnament(p) {
  const id = p.heroine.id;
  const sweat = `<path d="${drop(558, 404, 0.9)}" fill="#e9f8ff" stroke="#6a8aa0" stroke-width="1.2" opacity=".9"/>`;
  if (id === 'lia' || id === 'lilith') {
    const c = id === 'lia' ? '#fbfaf4' : '#1a1820';
    return `<path d="${BAND}" fill="none" stroke="${mix(c, '#000000', 0.5)}" stroke-width="20" stroke-linecap="round"/><path d="${BAND}" fill="none" stroke="${c}" stroke-width="15" stroke-linecap="round"/>`
      + `<path d="M280,318Q310,272 400,262" fill="none" stroke="${id === 'lia' ? '#cf3044' : '#2c5a3c'}" stroke-width="3" stroke-linecap="round"/>${sweat}`;
  }
  if (id === 'evelyn') {
    return `<path d="${BAND}" fill="none" stroke="#2a4a8a" stroke-width="14" stroke-linecap="round"/><path d="${BAND}" fill="none" stroke="#6f9ee8" stroke-width="10" stroke-linecap="round"/>`
      + `<path d="M548,300l30,-24l6,30zM548,300l36,10l-14,24z" fill="#6f9ee8" stroke="#2a4a8a" stroke-width="2" stroke-linejoin="round"/><circle cx="550" cy="300" r="6" fill="#9fc0f4" stroke="#2a4a8a" stroke-width="1.6"/>${sweat}`;
  }
  if (id === 'serena') {
    // a moon-white towel thrown over her head like a hood; the ends fall beside her face, never over it
    const towel = smooth([[244, 520, 1], [236, 380], [260, 250], [330, 186], [416, 170], [502, 186], [572, 250], [596, 380], [590, 520, 1], [560, 520, 1], [556, 380], [534, 290], [480, 246], [416, 236], [352, 246], [298, 290], [276, 380], [272, 520, 1]], { closed: true });
    return `<path d="${towel}" fill="#f2eefa" stroke="#4a4470" stroke-width="2.6" stroke-linejoin="round"/>`
      + `<path d="M572,250Q596,380 590,520L560,520Q556,380 534,290Z" fill="#d0c8e4"/>`
      + `<path d="M252,500h22M564,500h24" stroke="#b58cff" stroke-width="5"/>`;
  }
  return sweat;
}
function neckAccessory(p) {
  const id = p.heroine.id;
  if (id === 'lia') {
    // whistle and a little hourglass on a cord
    return `<path d="M384,708Q394,770 418,800M448,708Q446,764 432,798" fill="none" stroke="#fbfaf4" stroke-width="3" stroke-linecap="round"/>`
      + `<path d="M414,800h22a9,9 0 0 1 0,18h-8l-5,8h-5z" fill="#d6d9e4" stroke="#2a2a38" stroke-width="2" stroke-linejoin="round"/>`
      + `<path d="M440,800h14v4l-5,7l5,7v4h-14v-4l5,-7l-5,-7z" fill="#ffd27a" stroke="#6a4a10" stroke-width="1.8" stroke-linejoin="round"/>`;
  }
  if (id === 'freya') {
    // a white towel round her neck, both ends down the front
    const end = smooth([[374, 700, 1], [348, 720], [338, 800], [342, 900, 1], [384, 904, 1], [384, 800], [394, 730]], { closed: true });
    const ring = 'M360,690Q416,746 472,690Q478,712 470,722Q416,770 362,722Q354,712 360,690Z';
    return `<g stroke-linejoin="round"><path d="${ring}" fill="#f8fcff" stroke="#3f6e8e" stroke-width="2.4"/>`
      + `<path d="${end}" fill="#f8fcff" stroke="#3f6e8e" stroke-width="2.4"/><path d="${mirrorPath(end)}" fill="#d8e6f0" stroke="#3f6e8e" stroke-width="2.4"/>`
      + `<path d="M344,880h38M450,880h38" stroke="#8fd4f5" stroke-width="5"/></g>`;
  }
  return '';
}

// ---------------------------------------------------------------- props
const PROP = {
  // a crimson team flag on a pole slanting across her from the lower left
  lia(p) {
    // the pole crosses her from the lower right; the flag flies out to the left of her shoulder
    const at = placer(600, 1236, -128);
    const top = at([560, 0]);
    const flag = smooth([[top[0] + 4, top[1] + 6, 1], [top[0] - 90, top[1] + 30], [top[0] - 150, top[1] + 70, 1], [top[0] - 86, top[1] + 100], [top[0] - 4, top[1] + 96, 1]], { closed: true });
    return `<g stroke-linejoin="round"><path d="M${ip(at([0, 0]))}L${ip(top)}" stroke="#3a2010" stroke-width="12" stroke-linecap="round"/><path d="M${ip(at([0, 0]))}L${ip(top)}" stroke="#a87a4a" stroke-width="7" stroke-linecap="round"/>`
      + `<path d="${flag}" fill="${p.lin('flag', [[0, '#ff5a6a'], [0.5, '#cf3044'], [1, '#8e1a2c']], [top[0] - 150, 0, top[0], 0])}" stroke="#470918" stroke-width="3"/>`
      + `<path d="M${f1(top[0] - 6)},${f1(top[1] + 50)}Q${f1(top[0] - 66)},${f1(top[1] + 60)} ${f1(top[0] - 130)},${f1(top[1] + 74)}" fill="none" stroke="#fff0d6" stroke-width="6"/>`
      + (p.accent ? p.accent.emblem(top[0] - 60, top[1] + 54, 0.6) : '')
      + `<circle cx="${f1(top[0])}" cy="${f1(top[1])}" r="8" fill="#ffc864" stroke="#5a3510" stroke-width="2"/></g>`;
  },
  // Zero carries a little score bar of lit segments
  mia() {
    const x = 640, y = 606;
    const segs = [0, 1, 2, 3, 4].map((k) => `<rect x="${x + 6 + k * 18}" y="${y + 6}" width="14" height="16" rx="3" fill="${k < 3 ? '#8ff4ff' : '#2a4a5c'}"/>`).join('');
    return `<g stroke-linejoin="round"><path d="M688,626L688,${y + 28}" stroke="#2a3346" stroke-width="4"/>`
      + `<rect x="${x}" y="${y}" width="98" height="28" rx="6" fill="#1c2232" stroke="#0a0e18" stroke-width="2.4"/>${segs}</g>`;
  },
  // a scoring board with a flowchart of boxes and arrows (graphics only)
  serena(p) {
    const at = placer(250, 1080, -14);
    const q = (u, v) => ip(at([u, v]));
    const board = `M${q(-110, -120)}L${q(110, -120)}L${q(110, 160)}L${q(-110, 160)}Z`;
    const boxes = [[-70, -60], [30, -60], [-20, 20], [-70, 90], [30, 90]].map(([u, v]) => `M${q(u, v)}L${q(u + 44, v)}L${q(u + 44, v + 28)}L${q(u, v + 28)}Z`).join('');
    const arrows = `M${q(-26, -46)}L${q(30, -46)}M${q(2, -32)}L${q(2, 20)}M${q(-10, 48)}L${q(-48, 90)}M${q(14, 48)}L${q(52, 90)}`;
    return `<g stroke-linejoin="round"><path d="${board}" fill="#e9e2c8" stroke="#3a2a20" stroke-width="3"/>`
      + `<path d="M${q(-40, -130)}L${q(40, -130)}L${q(40, -108)}L${q(-40, -108)}Z" fill="#9aa0b4" stroke="#2a2a38" stroke-width="2.4"/>`
      + `<path d="${boxes}" fill="none" stroke="#2c2766" stroke-width="2.6"/><path d="${arrows}" fill="none" stroke="#8a68d8" stroke-width="2.6" stroke-linecap="round"/></g>`;
  },
  // an insulated flask from the lower right
  freya(p) {
    return `<g stroke-linejoin="round"><path d="M612,1216V1040Q612,1018 634,1014H690Q712,1018 712,1040V1216Z" fill="${p.lin('flask', [[0, '#f2fbff'], [0.5, '#9fd0ea'], [1, '#3f8fc4']], [612, 0, 712, 0])}" stroke="#1d4a6e" stroke-width="3"/>`
      + `<path d="M620,1014H704V990Q704,980 690,980H634Q620,980 620,990Z" fill="#3f8fc4" stroke="#1d4a6e" stroke-width="2.6"/><path d="M632,1060V1190" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/>`
      + (p.accent ? p.accent.emblem(662, 1110, 0.7) : '') + `</g>`;
  },
  // a relay baton held reverse-grip, slanting across her
  lilith(p) {
    const at = placer(96, 1150, -24);
    return `<g stroke-linejoin="round"><path d="M${ip(at([0, -18]))}L${ip(at([360, -18]))}L${ip(at([360, 18]))}L${ip(at([0, 18]))}Z" fill="${p.lin('baton', [[0, '#f0d27a'], [0.5, '#d9a441'], [1, '#8a6420']], [150, 1100, 200, 1200])}" stroke="#4a3210" stroke-width="3"/>`
      + `<path d="M${ip(at([110, -18]))}L${ip(at([110, 18]))}M${ip(at([250, -18]))}L${ip(at([250, 18]))}" stroke="#2c5a3c" stroke-width="10"/>`
      + `<path d="M${ip(at([20, -10]))}L${ip(at([340, -10]))}" stroke="#fff3c8" stroke-width="3" stroke-linecap="round" opacity=".8"/></g>`;
  },
  // two streamers with little bells curling up from the bottom on both sides
  evelyn(p) {
    const streamer = (x, dir) => {
      const d = `M${x},1216C${x + dir * 30},1150 ${x - dir * 40},1090 ${x + dir * 10},1030C${x + dir * 50},980 ${x},930 ${x - dir * 20},900`;
      return `<path d="${d}" fill="none" stroke="#2a4a8a" stroke-width="15" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#9fc0f4" stroke-width="10" stroke-linecap="round"/>`
        + `<path d="${d}" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="10 14" stroke-linecap="round"/>`
        + `<path d="M${x - dir * 30},894q8,-16 16,0z" fill="#ffd98c" stroke="#7a5a1e" stroke-width="1.8"/>`;
    };
    return `<g stroke-linejoin="round">${streamer(150, 1)}${streamer(682, -1)}</g>`;
  },
  // a round stone ball resting on her palm-height at the right ("像龙蛋")
  ophelia(p) {
    return `<g stroke-linejoin="round"><circle cx="604" cy="1060" r="88" fill="${p.rad('stone', [[0, '#c8c0b4'], [0.6, '#8a8276'], [1, '#4a443c']], { cx: 574, cy: 1028, r: 120 })}" stroke="#2a2620" stroke-width="3.4"/>`
      + `<path d="M548,1012q20,14 18,40M630,992q-10,30 10,54M580,1102q30,-8 52,10" fill="none" stroke="#5a544a" stroke-width="2.4" opacity=".8"/>`
      + `<path d="M560,1002A70,70 0 0 1 610,978" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5"/></g>`;
  },
};

// behind the body: Aila's old-style racquet in the sword's place (viewer's left shoulder)
function bodyBack(p) {
  if (p.heroine.id !== 'aila') return '';
  const at = placer(206, 760, -26);
  const head = `M${ip(at([0, -200]))}`;
  const c = at([0, -250]);
  return `<g stroke-linejoin="round"><path d="M${ip(at([-12, 60]))}L${ip(at([-12, -170]))}L${ip(at([12, -170]))}L${ip(at([12, 60]))}Z" fill="#a87a4a" stroke="#3a2010" stroke-width="3"/>`
    + `<path d="M${ip(at([-12, -10]))}L${ip(at([12, -10]))}M${ip(at([-12, 10]))}L${ip(at([12, 10]))}M${ip(at([-12, 30]))}L${ip(at([12, 30]))}" stroke="#4f7dff" stroke-width="6"/>`
    + `<ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="66" ry="86" transform="rotate(-26 ${f1(c[0])} ${f1(c[1])})" fill="#f8f4e8" fill-opacity=".25" stroke="#3a2010" stroke-width="12"/>`
    + `<ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="66" ry="86" transform="rotate(-26 ${f1(c[0])} ${f1(c[1])})" fill="none" stroke="#c8965a" stroke-width="7"/>`
    + `<g transform="rotate(-26 ${f1(c[0])} ${f1(c[1])})" stroke="#e8e0cc" stroke-width="1.6" opacity=".8">${[-44, -22, 0, 22, 44].map((u) => `<path d="M${f1(c[0] + u)},${f1(c[1] - 80)}V${f1(c[1] + 80)}"/>`).join('')}${[-60, -30, 0, 30, 60].map((v) => `<path d="M${f1(c[0] - 62)},${f1(c[1] + v)}H${f1(c[0] + 62)}"/>`).join('')}</g>`
    + `</g>`;
}
function foreground(p) {
  return PROP[p.heroine.id] ? PROP[p.heroine.id](p) : '';
}
// Lia's shield keeps its place and gets a little team pennant (B10: never taken off)
function extrasOverlay(p, name) {
  if (name !== 'shield') return '';
  return `<g transform="translate(590 560) rotate(18)" stroke-linejoin="round"><path d="M20,-6L170,4" stroke="#fbfaf4" stroke-width="3"/>`
    + `<path d="M40,-4L76,-2L58,60Z" fill="#cf3044" stroke="#470918" stroke-width="2.4"/><path d="M84,-2L120,0L102,62Z" fill="#fff0d6" stroke="#470918" stroke-width="2.4"/><path d="M128,0L164,4L146,64Z" fill="#cf3044" stroke="#470918" stroke-width="2.4"/></g>`;
}

// ---------------------------------------------------------------- background: the training ground at night
function bgMotif(p) {
  const { n, rng } = p.helpers;
  const rand = rng(`${p.heroine.id}-arena`);
  const wall = p.lin('arenaWall', [[0, '#221c40'], [1, '#141024']], [0, 560, 0, 900]);
  let arches = '';
  for (let i = 0; i < 6; i++) {
    const x = 20 + i * 150;
    arches += `M${x},900V700A60,60 0 0 1 ${x + 120},700V900Z`;
  }
  let flags = '';
  for (let i = 0; i < 9; i++) {
    const x = 40 + i * 92, y = 520 + Math.sin(i * 0.7) * 10;
    flags += `M${x},${n(y)}l18,0l-9,26z`;
  }
  const torch = (x) => `<rect x="${x - 5}" y="610" width="10" height="56" fill="#3a2a20"/><circle cx="${x}" cy="604" r="40" fill="${p.rad(`torch${x}`, [[0, '#ffb05a', 0.5], [1, '#ffb05a', 0]], { cx: x, cy: 604, r: 40 })}"/><path d="M${x - 8},612q8,-30 16,0z" fill="#ffd27a"/>`;
  return `<rect y="560" width="832" height="400" fill="${wall}"/>`
    + `<path d="${arches}" fill="#0c0a18" opacity=".8"/>`
    + `<path d="M0,520Q416,560 832,520" fill="none" stroke="#c8c0e0" stroke-width="2" opacity=".5"/>`
    + `<path d="${flags}" fill="#c13b4c" opacity=".7"/>`
    + torch(110) + torch(722)
    + `<path d="M0,900H832V1216H0Z" fill="#100c1e"/>`
    + `<path d="M120,960V900M120,930H90M120,930H150" stroke="#2a2440" stroke-width="10" stroke-linecap="round"/><circle cx="120" cy="884" r="18" fill="#2a2440"/>`
    + `<circle cx="150" cy="140" r="40" fill="#efe9ff" opacity=".9"/><circle cx="150" cy="140" r="120" fill="${p.rad('arenaMoon', [[0, '#e8ddff', 0.3], [1, '#e8ddff', 0]], { cx: 150, cy: 140, r: 120 })}"/>`;
}

const expression = {
  lia: { browAngle: 1.1, mouth: 'pressed' },
  mia: { gaze: [0.7, -0.35] },
  serena: { mouth: 'neutral', browAngle: -0.2, lidDrop: 0.6 },
  lilith: { mouth: 'smirk', browAsym: 0.4 },
  evelyn: { mouth: 'open', blush: 0.6, browAngle: -0.5, mouthWidth: 0.7 },
  ophelia: { mouth: 'grin' },
  aila: { mouth: 'grin', browAsym: 0.6, gaze: [0, 0] },
};

export default {
  type: 'sportwear',
  label: '运动短袖',
  render,
  bgMotif,
  bodyBack,
  neckAccessory,
  hairOrnament,
  foreground,
  extrasOverlay,
  expression,
  hideFor: { evelyn: ['headFront'] },
};
