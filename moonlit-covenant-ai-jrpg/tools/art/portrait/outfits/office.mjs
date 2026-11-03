// OL装 (type 'office', ★4; 服装稿 §2.5 / §3.5) - 「异界IF·现代通勤」: if they lived in a modern city of another world. IF only:
// it appears in the wardrobe, the skill battles and the IF 番外 ex010, never in a canon 番外 (the card carries an IF badge,
// drawn by the UI). Blazer over a shirt, the lower half out of frame; the tease is attitude only, never cut (服装稿 §1.3).
// Her emblem becomes the staff ID card on a lanyard (graphics only, no words), her motif the print on the tie or scarf.
// 亚克 is the same-year new hire in this IF, never anyone's boss. The weapon's place takes office things: Lia's checklist
// board, Mia's laptop (Zero as a smart speaker), Serena's tablet, Freya's cocoa, Lilith's takeaway coffee, Evelyn's
// folders, Ophelia's bundle of old books, Aila's trophy. Background: a city at night, lit window grids, moonlight.
import { mix, smooth, taper, mirrorPts, mirrorPath } from '../base.mjs';
import { MIR, ip, f1, cloth, garment, fold, circ, star, placer, button } from '../garment.mjs';

// jacket / shirt / tie colours and the style of each
const LOOK = {
  lia: { jacket: '#3a3a46', piping: '#c13b4c', shirt: '#f6f4f0', tie: '#c13b4c', style: 'blazer' },
  mia: { jacket: '#8a8f9c', shirt: '#5ec3e8', style: 'cardigan', cable: true },
  serena: { jacket: '#1c1a24', shirt: '#4a3570', style: 'blazer', bow: '#4a3570', glasses: true },
  freya: { jacket: '#efe2c8', shirt: '#9fd0ea', style: 'cardigan' },
  lilith: { jacket: '#1a1820', shirt: '#2c5a3c', tie: '#1a1820', style: 'trench', loose: true },
  evelyn: { jacket: '#f6f0e2', shirt: '#6f9ee8', style: 'blazer' },
  ophelia: { jacket: '#1f3a7a', shirt: '#e9e1d0', style: 'blazer', copper: true },
  aila: { jacket: '#1f2f5f', shirt: '#f6f4f0', tie: '#6fb3ff', style: 'blazer', gold: true },
};
const SHIRT_NECK = [[350, 690], [372, 700], [394, 712], [416, 716]];

function render(p) {
  const id = p.heroine.id;
  const L = LOOK[id] || LOOK.lia;
  const J = cloth(L.jacket), S = cloth(L.shirt);
  const A = p.accent;
  let s = '';
  // the shirt underneath (only its front shows between the lapels)
  s += garment(p, { C: S, neck: SHIRT_NECK, sleeve: 'long', name: 'shirt' });
  // shirt collar points + placket
  const point = smooth([[372, 694, 1], [392, 720], [404, 760, 1], [384, 754], [360, 712]], { closed: true });
  s += `<path d="${point}" fill="${S.lit}" stroke="${S.line}" stroke-width="2.2"/><path d="${mirrorPath(point)}" fill="${S.base}" stroke="${S.line}" stroke-width="2.2"/>`;
  if (L.tie) {
    const knot = 'M406,722L426,722L422,746L410,746Z';
    const blade = `M410,746L422,746L${L.loose ? 436 : 434},${L.loose ? 1000 : 980}L416,${L.loose ? 1020 : 1004}L${L.loose ? 404 : 398},${L.loose ? 990 : 980}Z`;
    const T = cloth(L.tie);
    s += `<path d="${blade}" fill="${T.base}" stroke="${T.line}" stroke-width="2.2" stroke-linejoin="round"/><path d="${knot}" fill="${T.lit}" stroke="${T.line}" stroke-width="2.2"/>`;
    if (A) s += `<path d="${[800, 860, 920].map((y) => A.glyph(416 + (y - 746) * 0.03, y, 7)).join('')}" fill="${mix(L.tie, '#ffffff', 0.5)}" fill-rule="evenodd" opacity=".85"/>`;
  } else if (L.bow) {
    // Serena: a high silk bow at the throat
    const B = cloth(L.bow);
    s += `<path d="M416,730C396,712 370,716 376,736C380,750 400,746 416,736ZM416,730C436,712 462,716 456,736C452,750 432,746 416,736Z" fill="${B.lit}" stroke="${B.line}" stroke-width="2.2" stroke-linejoin="round"/>`
      + `<path d="M412,738L396,800L408,796L414,806L418,740ZM420,738L440,798L428,796L424,806L416,740Z" fill="${B.base}" stroke="${B.line}" stroke-width="2" stroke-linejoin="round"/><rect x="408" y="724" width="16" height="16" rx="5" fill="${B.base}" stroke="${B.line}" stroke-width="2"/>`;
  } else {
    s += [770, 840, 910, 980].map((y) => button(416, y, 5, S.lit, S.line)).join('');
  }

  // ---- the jacket: left half drawn, right half mirrored into shade
  const gap = L.style === 'cardigan' ? 70 : 60;
  const lapelEnd = L.style === 'cardigan' ? 900 : 940;
  const left = smooth([[372, 694, 1], [330, 706], [270, 728], [200, 756], [120, 800], [80, 900], [70, 1216, 1], [416 - gap * 0.5, 1216, 1], [416 - gap * 0.55, 1060], [416 - gap * 0.6, lapelEnd], [384, 790], [376, 730]], { closed: true });
  const jfill = p.lin('jacket', [[0, J.lit], [0.35, J.base], [1, J.shade]], [0, 700, 0, 1180]);
  s += `<g clip-path="${p.refs.bodyClip}">`
    + `<path d="${left}" fill="${jfill}" stroke="${J.line}" stroke-width="2.6"/>`
    + `<path d="${left}" transform="${MIR}" fill="${J.shade}" stroke="${J.line}" stroke-width="2.6"/>`
    + `<path d="${p.shapes.armSeamL}${p.shapes.armSeamR}" fill="none" stroke="${J.line}" stroke-width="2.8" opacity=".85"/>`
    + `<path d="${fold([[176, 940], [186, 1030], [180, 1120]], 6)}${fold([[300, 900], [312, 1000]], 5)}" fill="${J.shade}"/>`
    + `<path d="${fold([[656, 960], [648, 1050], [654, 1130]], 6)}" fill="${J.deep}"/>`;
  if (L.style === 'cardigan') {
    // knit ribbing on the cardigan + buttons on its band
    p.def(`<pattern id="${p.id('knit')}" width="10" height="40" patternUnits="userSpaceOnUse"><path d="M5,0V40" stroke="${J.deep}" stroke-width="1.6" opacity=".22"/></pattern>`);
    s += `<path d="${left}" fill="url(#${p.id('knit')})"/><path d="${left}" transform="${MIR}" fill="url(#${p.id('knit')})"/>`;
  }
  s += `</g>`;
  // lapels (blazers, trench) or the cardigan's front band
  if (L.style === 'cardigan') {
    const band = taper([[376, 700], [384, 790], [416 - gap * 0.6, 900], [416 - gap * 0.55, 1060], [416 - gap * 0.5, 1216]], { w: 18, start: 1, end: 1, peak: 0.5 });
    s += `<path d="${band}" fill="${J.lit}" stroke="${J.line}" stroke-width="2.2"/><path d="${mirrorPath(band)}" fill="${J.base}" stroke="${J.line}" stroke-width="2.2"/>`
      + [960, 1040, 1120].map((y) => button(416 - gap * 0.55 + (y - 960) * 0.06, y, 6, J.deep, J.line)).join('');
  } else {
    const lapel = smooth([[372, 694, 1], [340, 720], [318, 770], [334, 800, 1], [316, 830, 1], [386, lapelEnd - 20], [416 - gap * 0.6, lapelEnd, 1], [384, 790], [376, 730]], { closed: true });
    s += `<path d="${lapel}" fill="${J.lit}" stroke="${J.line}" stroke-width="2.4" stroke-linejoin="round"/><path d="${mirrorPath(lapel)}" fill="${J.base}" stroke="${J.line}" stroke-width="2.4" stroke-linejoin="round"/>`;
    if (L.piping) s += `<path d="${smooth([[318, 770], [334, 800], [316, 830], [386, lapelEnd - 20]])}" fill="none" stroke="${L.piping}" stroke-width="3"/><path d="${mirrorPath(smooth([[318, 770], [334, 800], [316, 830], [386, lapelEnd - 20]]))}" fill="none" stroke="${mix(L.piping, '#000000', 0.3)}" stroke-width="3"/>`;
    // buttons below the lapels (gold for Aila, copper for Ophelia)
    const bc = L.gold ? '#f5c84c' : L.copper ? '#c8643c' : J.deep;
    s += button(416 - gap * 0.55 + 14, 1000, 7, bc, J.line) + button(416 - gap * 0.55 + 14, 1080, 7, bc, J.line);
    if (L.style === 'trench') s += `<path d="M300,880H380V900H300Z" fill="${J.deep}" stroke="${J.line}" stroke-width="2"/><path d="M190,1000Q214,1012 236,1004" fill="none" stroke="${J.deep}" stroke-width="6"/>`;
  }
  // Mia: the lanyard tangled with a coil of data cable
  if (L.cable) s += `<path d="M380,700C386,780 360,820 380,860C400,900 440,880 430,840C420,800 380,820 392,880" fill="none" stroke="#2a3346" stroke-width="4"/>`;
  // ---- the staff ID card on a lanyard: her emblem, a photo block, a few lines - no words
  const cx = id === 'aila' || id === 'lia' ? 470 : 456, cy = 930;
  s += `<path d="M386,700Q400,820 ${cx - 10},${cy - 46}M446,700Q456,820 ${cx + 10},${cy - 46}" fill="none" stroke="${A ? A.main : '#4a5a80'}" stroke-width="5"/>`
    + `<g stroke-linejoin="round"><rect x="${cx - 40}" y="${cy - 50}" width="80" height="108" rx="8" fill="#f8f8fc" stroke="#3a3a4a" stroke-width="2.4"/>`
    + `<rect x="${cx - 30}" y="${cy - 38}" width="34" height="40" rx="4" fill="${A ? mix(A.main, '#ffffff', 0.55) : '#c8d0e0'}"/>`
    + `<path d="M${cx - 30},${cy + 18}h60M${cx - 30},${cy + 30}h44M${cx - 30},${cy + 42}h52" stroke="#9aa0b4" stroke-width="3" stroke-linecap="round"/>`
    + (A ? A.emblem(cx + 20, cy - 18, 0.42) : '') + `</g>`;
  return s;
}

// ---------------------------------------------------------------- head: Serena's glasses, Mia's headphone covers, Lilith's earpiece
function hairOrnament(p) {
  const id = p.heroine.id;
  const L = LOOK[id] || {};
  if (L.glasses) {
    // thin silver frames sitting below the eyes' lash line, never covering the eyes
    const ring = (x) => `<rect x="${x - 44}" y="414" width="88" height="56" rx="16" fill="none" stroke="#c9cde0" stroke-width="3"/>`;
    return `<g>${ring(350)}${ring(482)}<path d="M394,436Q416,428 438,436" fill="none" stroke="#c9cde0" stroke-width="3"/><path d="M306,430L270,424M526,430L562,424" stroke="#c9cde0" stroke-width="3"/></g>`;
  }
  if (id === 'lilith') return `<path d="M580,446Q600,470 592,500" fill="none" stroke="#1a1820" stroke-width="5" stroke-linecap="round"/><circle cx="578" cy="452" r="7" fill="#2c5a3c" stroke="#0e1a12" stroke-width="2"/>`;
  if (id === 'ophelia') return `<path d="M372,712Q360,760 380,790" fill="none" stroke="#c9d2ea" stroke-width="2" stroke-dasharray="3 2"/>`;
  return '';
}
function headBack(p) {
  if (p.heroine.id !== 'mia') return '';
  // headphone cups over the receiver ears
  const cup = (tf, lit) => `<g transform="${tf}"><path d="M-46,-60C-48,-92 -26,-112 0,-112C24,-110 40,-90 38,-62Q-4,-48 -46,-60Z" fill="${lit ? '#4a5060' : '#353a48'}" stroke="#141820" stroke-width="3"/><path d="M-30,-80Q-24,-100 -6,-104" fill="none" stroke="#9aa6b8" stroke-width="3" stroke-linecap="round"/><circle cx="-4" cy="-78" r="8" fill="#5ed7ff"/></g>`;
  return cup('translate(314 232) rotate(-23) scale(1.06)', true) + cup('translate(518 232) rotate(23) scale(-1.06 1.06)', false);
}

// ---------------------------------------------------------------- props
const PROP = {
  // a clipboard with a blank checklist (boxes and lines)
  lia(p) {
    const at = placer(256, 1090, -10);
    const q = (u, v) => ip(at([u, v]));
    const rows = [-50, -10, 30, 70].map((v) => `M${q(-60, v)}h18v18h-18zM${q(-30, v + 9)}L${q(70, v + 9)}`).join('');
    return `<g stroke-linejoin="round"><path d="M${q(-90, -110)}L${q(90, -110)}L${q(90, 150)}L${q(-90, 150)}Z" fill="#b8865a" stroke="#3a2010" stroke-width="3"/>`
      + `<path d="M${q(-74, -90)}L${q(74, -90)}L${q(74, 140)}L${q(-74, 140)}Z" fill="#fbfaf4" stroke="#55506a" stroke-width="2"/>`
      + `<path d="${rows}" fill="none" stroke="#c13b4c" stroke-width="2.4"/>`
      + `<path d="M${q(-34, -122)}L${q(34, -122)}L${q(34, -96)}L${q(-34, -96)}Z" fill="#c9cde0" stroke="#2a2a38" stroke-width="2.4"/></g>`;
  },
  // a laptop held in front; Zero floats as a little smart speaker (her drone stays, a cloth band round it)
  mia(p) {
    return `<g stroke-linejoin="round"><path d="M300,1216L330,1040L560,1040L586,1216Z" fill="#c9d0dc" stroke="#2a3346" stroke-width="3"/>`
      + `<path d="M340,1056L548,1056L570,1200L318,1200Z" fill="#2a3346"/><path d="${p.accent ? p.accent.glyph(444, 1128, 30) : ''}" fill="#5ed7ff" fill-rule="evenodd" opacity=".9"/>`
      + `<path d="M640,690A48,22 0 0 0 736,690" fill="none" stroke="#4a5060" stroke-width="20"/><path d="M646,694A44,18 0 0 0 730,694" fill="none" stroke="#5ed7ff" stroke-width="2" stroke-dasharray="4 4"/></g>`;
  },
  // a tablet whose screen holds only the light of a crescent moon
  serena(p) {
    const at = placer(270, 1110, -12);
    const q = (u, v) => ip(at([u, v]));
    const c = at([0, 0]);
    return `<g stroke-linejoin="round"><path d="M${q(-80, -110)}L${q(80, -110)}L${q(80, 110)}L${q(-80, 110)}Z" fill="#1a1626" stroke="#0a0812" stroke-width="3"/>`
      + `<path d="M${q(-68, -96)}L${q(68, -96)}L${q(68, 96)}L${q(-68, 96)}Z" fill="${p.rad('screen', [[0, '#3a3060'], [1, '#120e20']], { cx: c[0], cy: c[1], r: 110 })}"/>`
      + `<path d="M${f1(c[0] + 12)},${f1(c[1] - 34)}A36,36 0 1 0 ${f1(c[0] + 12)},${f1(c[1] + 34)}A28,28 0 1 1 ${f1(c[0] + 12)},${f1(c[1] - 34)}Z" fill="#efe9ff"/></g>`;
  },
  // a mug of hot cocoa
  freya(p) {
    return `<g stroke-linejoin="round"><path d="M560,1080H660L652,1190Q650,1206 634,1206H586Q570,1206 568,1190Z" fill="#f6fbff" stroke="#1d4a6e" stroke-width="3"/>`
      + `<path d="M562,1084Q610,1100 658,1084" fill="none" stroke="#7a4a2a" stroke-width="8"/><path d="M660,1100Q690,1104 686,1130Q682,1156 656,1154" fill="none" stroke="#1d4a6e" stroke-width="4"/>`
      + (p.accent ? p.accent.emblem(610, 1150, 0.5) : '')
      + `<path d="M590,1066Q580,1040 594,1020Q606,1000 596,980M620,1066Q630,1040 618,1016" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/></g>`;
  },
  // a takeaway coffee in a reverse grip
  lilith() {
    return `<g stroke-linejoin="round"><path d="M200,1060H272L262,1196H210Z" fill="#e8dcc4" stroke="#3a2a20" stroke-width="3"/>`
      + `<path d="M196,1046H276V1066H196Z" fill="#2a2420" stroke="#120e0c" stroke-width="2.4"/><path d="M204,1110H268L265,1150H207Z" fill="#2c5a3c"/></g>`;
  },
  // a stack of folders, a blank sticky note on top
  evelyn(p) {
    return `<g stroke-linejoin="round"><path d="M290,1100L520,1080L530,1216H296Z" fill="#6f9ee8" stroke="#2a4a8a" stroke-width="3"/>`
      + `<path d="M292,1088L518,1068L520,1084L294,1104Z" fill="#fbf8f0" stroke="#5a5070" stroke-width="2"/><path d="M296,1076L516,1056L518,1070L298,1090Z" fill="#ffd98c" stroke="#7a5a1e" stroke-width="2"/>`
      + `<path d="M440,1030L496,1026L500,1076L444,1080Z" fill="#fff6a8" stroke="#a8902a" stroke-width="2"/></g>`;
  },
  // old books tied with a leather strap
  ophelia(p) {
    const book = (y, w, c) => `<path d="M${416 - w / 2},${y}H${416 + w / 2}V${y + 34}H${416 - w / 2}Z" fill="${c}" stroke="#2a1a10" stroke-width="2.6"/><path d="M${416 - w / 2 + 6},${y + 6}H${416 + w / 2 - 6}" stroke="#e9d9a8" stroke-width="2"/>`;
    return `<g stroke-linejoin="round" transform="translate(150 0) rotate(-6 416 1150)">${book(1182, 210, '#6a3a2a')}${book(1148, 196, '#3a4a6a')}${book(1114, 214, '#5a2a40')}${book(1080, 186, '#7a5a2a')}`
      + `<path d="M416,1076V1216" stroke="#3a2010" stroke-width="10"/><path d="M416,1076V1216" stroke="#a8784a" stroke-width="5"/></g>`;
  },
  // a small trophy held up high
  aila(p) {
    return `<g stroke-linejoin="round"><path d="M240,980H330Q328,1040 300,1056V1090H270V1056Q242,1040 240,980Z" fill="${p.lin('trophy', [[0, '#fff2b0'], [0.5, '#f5c84c'], [1, '#a87a20']], [240, 0, 330, 0])}" stroke="#5a3a10" stroke-width="3"/>`
      + `<path d="M240,990Q216,994 218,1016Q222,1036 246,1032M330,990Q354,994 352,1016Q348,1036 324,1032" fill="none" stroke="#5a3a10" stroke-width="4"/>`
      + `<path d="M256,1090H314V1110H256Z" fill="#1f2f5f" stroke="#0a1230" stroke-width="2.4"/>`
      + (p.accent ? p.accent.emblem(285, 1010, 0.42) : '') + `</g>`;
  },
};
function foreground(p) {
  return PROP[p.heroine.id] ? PROP[p.heroine.id](p) : '';
}

// ---------------------------------------------------------------- background: a modern city at night (another world)
function bgMotif(p) {
  const { n, rng } = p.helpers;
  const rand = rng(`${p.heroine.id}-city`);
  let towers = '', lit = '';
  const ts = [[0, 420, 120], [110, 520, 90], [190, 360, 130], [610, 400, 120], [720, 300, 112], [540, 560, 80]];
  for (const [x, y, w] of ts) {
    towers += `M${x},1216V${y}H${x + w}V1216Z`;
    for (let yy = y + 24; yy < 1000; yy += 30) for (let xx = x + 12; xx < x + w - 10; xx += 22) if (rand() < 0.42) lit += `M${xx},${yy}h10v14h-10z`;
  }
  return `<circle cx="150" cy="140" r="44" fill="#efe9ff"/><circle cx="150" cy="140" r="140" fill="${p.rad('cityMoon', [[0, '#e8ddff', 0.3], [1, '#e8ddff', 0]], { cx: 150, cy: 140, r: 140 })}"/>`
    + `<path d="${towers}" fill="#141a30"/><path d="${towers}" fill="none" stroke="#2a3456" stroke-width="2"/>`
    + `<path d="${lit}" fill="#ffd98c" opacity=".55"/>`
    + `<path d="M0,960H832" stroke="#5ed7ff" stroke-width="2" opacity=".2"/>`;
}

const expression = {
  lia: { browAngle: 1.1, mouth: 'pressed' },
  mia: { gaze: [0.2, 0.3] },
  serena: { mouth: 'smirk', browAsym: 0.4 },
  freya: { mouth: 'smile' },
  lilith: { mouth: 'smirk', gaze: [0.4, 0] },
  evelyn: { mouth: 'open', blush: 0.55, browAngle: -0.5, mouthWidth: 0.7 },
  ophelia: { mouth: 'grin' },
  aila: { mouth: 'grin', browAsym: 0.6, gaze: [0, 0] },
};

export default {
  type: 'office',
  label: 'OL装',
  render,
  bgMotif,
  headBack,
  hairOrnament,
  foreground,
  expression,
  hideFor: { evelyn: ['headFront'] },
};
