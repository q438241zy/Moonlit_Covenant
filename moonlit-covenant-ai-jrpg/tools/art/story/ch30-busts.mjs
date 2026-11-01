// Chapter 30 heroine story busts (script 30 美術需求: 八位女主的三年後差分——伴／分／離；天牢／冊妃宮裝), forty files built by
// portraitBust() from the heroine portraits like the chapter 16–20 busts, each wearing one of five story outfits that live
// here and not in tools/art/portrait/outfits (so the gacha costume build never picks them up):
//   <id>_y3_beside / _y3_apart / _y3_away — 〔仁〕三年後 (30-14's roll call, by where she went): see the 伴／分／離 section below;
//                  her own bust's extras stay (Lia's shield, Serena's staff).
//   <id>_consort — 冊妃宮裝 (speakers <id>_consort, nameplate = her name): the court robe of a forced consort, the story's own
//                  canon dress and nothing like a gacha costume (no white-and-gold gala, no maid, no bridal white). A high standing
//                  collar, a long-sleeved velvet robe in the colour of her nation's consort title (赤焰妃 crimson, 鑄金妃 bronze,
//                  夜鴉妃 violet-black, 霜潮妃 frost blue, 翠影妃 jade, 聖輝妃 ash ivory, 龍脊妃 wine, 晨門妃 navy), a centre panel
//                  with a column of iron studs, and a short iron-grey shoulder mantle edged in dark gold, fastened at the collar
//                  with a small iron-crown clasp; a thin iron crown pin in the hair (the 鐵冕's), except Ophelia, who never wears
//                  the ornaments he gives her (30-13). Also worn in the 〔色〕 version's court from 30-05 on. Fully covered, no tease.
//   <id>_cell    — 天牢 (speakers <id>_cell): a coarse undyed linen prison tunic, drawstring round neck, rough stitched seams,
//                  two patches and a little grime on the cloth (never on the face). Her own hair ornaments stay (Mia's hairpin
//                  picks the lock, 30-13); weapons, staffs and capes are gone. No shackles in frame, no injury, nothing degrading.
import lia from '../portrait/heroines/lia.mjs';
import mia from '../portrait/heroines/mia.mjs';
import serena from '../portrait/heroines/serena.mjs';
import freya from '../portrait/heroines/freya.mjs';
import lilith from '../portrait/heroines/lilith.mjs';
import evelyn from '../portrait/heroines/evelyn.mjs';
import ophelia from '../portrait/heroines/ophelia.mjs';
import aila from '../portrait/heroines/aila.mjs';
import { mix } from '../portrait/base.mjs';
import { portraitBust } from './portrait-bust.mjs';

const MIR = 'matrix(-1 0 0 1 832 0)';
const ip = (q) => `${Math.round(q[0])},${Math.round(q[1])}`;

// ---------------------------------------------------------------- 冊妃宮裝
// robe colour per consort title (30-13 table); the gem follows the heroine's own accent
const ROBE = { lia: '#7a1626', mia: '#6a4a22', serena: '#33244e', freya: '#1f4c66', lilith: '#1d5040', evelyn: '#b4aa94', ophelia: '#5c1f3c', aila: '#1f305f' };
const G = { gold: '#d2ac62', goldMid: '#a8823e', goldDeep: '#6e5122', goldLine: '#2e1f0a', iron: '#45444f', ironLit: '#7c7b8c', ironShade: '#2c2b34', ironLine: '#121118' };

function consortRobe(p) {
  const { smooth: sm, taper } = p.helpers;
  const base = ROBE[p.heroine.id] || mix(p.palette.accent, '#160d1e', 0.6);
  const pale = p.heroine.id === 'evelyn';
  const R = { base, lit: mix(base, '#ffffff', pale ? 0.3 : 0.16), shade: mix(base, '#08050c', pale ? 0.3 : 0.42), deep: mix(base, '#08050c', pale ? 0.5 : 0.64), line: mix(base, '#050308', 0.8) };
  const gem = p.palette.accent;
  let s = '';

  // ---- the robe: long sleeves and body in one velvet piece, shaded on her left (viewer's right)
  const robe = sm([[60, 700, 1], [356, 660, 1], [416, 676], [476, 660, 1], [772, 700, 1], [772, 1216, 1], [60, 1216, 1]], { closed: true });
  const velvet = p.lin('robe', [[0, R.lit], [0.4, R.base], [1, R.shade]], [0, 700, 0, 1180]);
  const shadeR = sm([[480, 790], [548, 770], [612, 800], [664, 860], [700, 960], [704, 1216, 1], [530, 1216, 1], [516, 1040], [500, 900]], { closed: true });
  s += `<g clip-path="${p.refs.bodyClip}"><path d="${robe}" fill="${velvet}"/>`
    + `<path d="${shadeR}" fill="${R.shade}" opacity=".8"/>`
    + `<path d="M612,900Q660,940 690,1010L704,1216H648Q640,1040 612,900Z" fill="${R.deep}" opacity=".7"/>`
    + `<path d="${p.shapes.armSeamL}${p.shapes.armSeamR}" fill="none" stroke="${R.line}" stroke-width="2.8" opacity=".75"/>`
    // velvet sheen on the lit sleeve and a soft fold on the shaded one
    + `<path d="${taper([[176, 930], [170, 1030], [176, 1140]], { w: 9, start: 0.2, end: 0, peak: 0.45 })}" fill="${R.lit}" opacity=".8"/>`
    + `<path d="${taper([[660, 990], [652, 1070], [658, 1160]], { w: 6, start: 0.2, end: 0, peak: 0.4 })}" fill="${R.deep}"/>`
    // centre panel, piped in dark gold, with a column of iron studs
    + `<path d="M382,700L376,1216H456L450,700Z" fill="${R.shade}" opacity=".55"/>`
    + `<path d="M382,700L376,1216M450,700L456,1216" fill="none" stroke="${G.goldLine}" stroke-width="5"/>`
    + `<path d="M382,700L376,1216M450,700L456,1216" fill="none" stroke="${G.goldMid}" stroke-width="2.4"/>`
    + [930, 990, 1050, 1110, 1170].map((y) => `<circle cx="416" cy="${y}" r="7" fill="${G.iron}" stroke="${G.ironLine}" stroke-width="2"/><circle cx="414" cy="${y - 2}" r="2.4" fill="${G.ironLit}"/>`).join('')
    + `</g>`;

  // ---- short shoulder mantle in iron-grey velvet, dark-gold border (left half drawn, mirrored)
  const mantle = sm([[416, 690, 1], [364, 694], [300, 712], [228, 742], [176, 784], [146, 846], [140, 902], [196, 916], [266, 906], [340, 892], [416, 888, 1]], { closed: true });
  const hem = sm([[140, 902], [196, 916], [266, 906], [340, 892], [416, 888]]);
  const mantleFill = p.lin('mantle', [[0, G.ironLit], [0.35, G.iron], [1, G.ironShade]], [0, 690, 0, 910]);
  p.def(`<g id="${p.id('mantleG')}" stroke-linejoin="round"><path d="${mantle}" fill="${mantleFill}" stroke="${G.ironLine}" stroke-width="3"/>`
    + `<path d="${taper([[352, 706], [278, 730], [214, 766], [174, 820], [158, 870]], { w: 13, start: 0.3, end: 0, peak: 0.4 })}" fill="${G.ironLit}" opacity=".5"/>`
    + `<path d="${taper([[300, 760], [272, 820], [262, 880]], { w: 5, start: 0.2, end: 0, peak: 0.4 })}" fill="${G.ironShade}" opacity=".8"/>`
    + `<path d="${hem}" fill="none" stroke="${G.goldLine}" stroke-width="8" stroke-linecap="round"/>`
    + `<path d="${hem}" fill="none" stroke="${G.goldMid}" stroke-width="4.4" stroke-linecap="round"/>`
    + `<path d="${hem}" fill="none" stroke="${G.gold}" stroke-width="1.4" stroke-dasharray="2 7" stroke-linecap="round" transform="translate(0 -1)"/>`
    + `</g>`);
  s += `<use href="#${p.id('mantleG')}"/><use href="#${p.id('mantleG')}" transform="${MIR}"/>`
    + `<g transform="${MIR}"><path d="${mantle}" fill="${G.ironShade}" opacity=".35"/></g>`;

  // ---- high standing collar of the robe, dark-gold edge
  const collar = sm([[366, 632, 1], [416, 644], [466, 632, 1], [470, 700, 1], [416, 712], [362, 700, 1]], { closed: true });
  s += `<path d="${collar}" fill="${p.lin('collar', [[0, R.lit], [0.6, R.base], [1, R.shade]], [366, 0, 470, 0])}" stroke="${R.line}" stroke-width="2.6" stroke-linejoin="round"/>`
    + `<path d="M440,640Q456,638 466,632L470,700Q456,706 440,708Z" fill="${R.deep}" opacity=".55"/>`
    + `<path d="M368,636Q416,650 464,636" fill="none" stroke="${G.goldMid}" stroke-width="3" stroke-linecap="round"/>`
    + `<path d="M370,690Q416,704 466,690" fill="none" stroke="${G.goldDeep}" stroke-width="2.2" opacity=".8"/>`;

  // ---- iron-crown clasp where the mantle meets at the collar, her own colour in the gem
  const cx = 416, cy = 716;
  const crown = `M${cx - 22},${cy + 10}L${cx - 24},${cy - 10}L${cx - 12},${cy}L${cx},${cy - 16}L${cx + 12},${cy}L${cx + 24},${cy - 10}L${cx + 22},${cy + 10}Z`;
  s += `<path d="${crown}" fill="${G.iron}" stroke="${G.ironLine}" stroke-width="2.4" stroke-linejoin="round"/>`
    + `<path d="M${cx - 20},${cy + 4}H${cx + 20}" stroke="${G.goldMid}" stroke-width="2.6"/>`
    + `<circle cx="${cx}" cy="${cy + 2}" r="4.6" fill="${gem}" stroke="${G.ironLine}" stroke-width="1.4"/><circle cx="${cx - 1.6}" cy="${cy}" r="1.4" fill="#fff"/>`;
  return s;
}

// the iron crown pin: a thin iron band with low spikes on the crown of the head (Evelyn keeps her circlet and gets a pin)
const PIN = { default: [416, 232, 66], lia: [416, 226, 66], mia: [416, 238, 60], lilith: [416, 222, 66], aila: [416, 228, 66], serena: [416, 228, 64], freya: [416, 230, 64] };
function consortPin(p) {
  if (p.heroine.id === 'ophelia') return '';
  const { taper } = p.helpers;
  if (p.heroine.id === 'evelyn') {
    const x = 286, y = 404;
    return `<path d="M${x - 14},${y + 8}L${x - 15},${y - 6}L${x - 7},${y + 1}L${x},${y - 11}L${x + 7},${y + 1}L${x + 15},${y - 6}L${x + 14},${y + 8}Z" fill="${G.iron}" stroke="${G.ironLine}" stroke-width="2" stroke-linejoin="round"/>`
      + `<path d="M${x - 12},${y + 4}H${x + 12}" stroke="${G.goldMid}" stroke-width="2"/>`;
  }
  const [cx, by, hw] = PIN[p.heroine.id] || PIN.default;
  const yAt = (x) => by + 2 - 14 * ((x - cx) / hw) ** 2;
  const band = taper([[cx - hw, by - 12], [cx - hw * 0.5, by - 2], [cx, by + 2], [cx + hw * 0.5, by - 2], [cx + hw, by - 12]], { w: 7, start: 0.6, end: 0.6, peak: 0.5 });
  const spikes = [-0.7, -0.35, 0, 0.35, 0.7].map((t) => {
    const x = cx + t * hw, y = yAt(x), h = 20 * (1 - Math.abs(t) * 0.6);
    return `M${ip([x - 6, y - 2])}L${ip([x, y - h])}L${ip([x + 6, y - 2])}Z`;
  }).join('');
  return `<g stroke-linejoin="round"><path d="${band}" fill="${p.palette.hairDeep}" opacity=".45" transform="translate(3 6)"/>`
    + `<path d="${spikes}" fill="${G.iron}" stroke="${G.ironLine}" stroke-width="1.8"/>`
    + `<path d="${band}" fill="${p.lin('pinBand', [[0, G.ironLit], [1, G.iron]], [0, by - 14, 0, by + 6])}" stroke="${G.ironLine}" stroke-width="2"/>`
    + `<path d="M${cx - hw * 0.7},${by - 7}Q${cx - hw * 0.35},${by} ${cx},${by + 1}" fill="none" stroke="${G.goldMid}" stroke-width="1.6" stroke-linecap="round"/>`
    + `</g>`;
}

const CONSORT = { type: 'consort', label: '册妃宫装', hide: ['foreground'], render: consortRobe, hairOrnament: consortPin };

// ---------------------------------------------------------------- 天牢
const L = { base: '#8c8170', lit: '#a89d88', shade: '#675d4f', deep: '#4c4439', line: '#2c261e', patch: '#776c5a', grime: '#3e362c' };

function cellTunic(p) {
  const { smooth: sm, taper } = p.helpers;
  let s = '';
  // coarse weave: faint crossed threads over the whole tunic
  p.def(`<pattern id="${p.id('weave')}" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0,3H12M0,9H12M3,0V12M9,0V12" stroke="${L.deep}" stroke-width="1" opacity=".22"/></pattern>`);
  const tunic = sm([[60, 700, 1], [350, 672, 1], [380, 700], [416, 716], [452, 700], [482, 672, 1], [772, 700, 1], [772, 1216, 1], [60, 1216, 1]], { closed: true });
  const linen = p.lin('linen', [[0, L.lit], [0.45, L.base], [1, L.shade]], [0, 680, 0, 1180]);
  const shadeR = sm([[478, 780], [546, 764], [610, 792], [662, 852], [700, 950], [704, 1216, 1], [528, 1216, 1], [514, 1040], [498, 890]], { closed: true });
  s += `<g clip-path="${p.refs.bodyClip}"><path d="${tunic}" fill="${linen}"/><path d="${tunic}" fill="url(#${p.id('weave')})"/>`
    + `<path d="${shadeR}" fill="${L.shade}" opacity=".85"/>`
    + `<path d="M608,890Q656,930 688,1000L704,1216H646Q638,1040 608,890Z" fill="${L.deep}" opacity=".6"/>`
    // rough seams: sleeve seams and shoulder seams, with crude running stitches
    + `<path d="${p.shapes.armSeamL}${p.shapes.armSeamR}" fill="none" stroke="${L.line}" stroke-width="2.6" opacity=".7"/>`
    + `<path d="${p.shapes.armSeamL}${p.shapes.armSeamR}" fill="none" stroke="${L.lit}" stroke-width="1.6" stroke-dasharray="6 7" transform="translate(5 0)" opacity=".8"/>`
    + `<path d="M352,690L230,752M480,690L602,752" fill="none" stroke="${L.line}" stroke-width="2.2" opacity=".55"/>`
    // two patches, cross-stitched on
    + `<path d="M538,800L606,810L600,872L532,862Z" fill="${L.patch}" stroke="${L.line}" stroke-width="2.2" stroke-linejoin="round"/>`
    + `<path d="M544,812l8,8m0,-8l-8,8M588,818l8,8m0,-8l-8,8M540,846l8,8m0,-8l-8,8M584,852l8,8m0,-8l-8,8" stroke="${L.lit}" stroke-width="1.6" stroke-linecap="round"/>`
    + `<path d="M270,1010L330,1004L334,1060L274,1066Z" fill="${L.patch}" stroke="${L.line}" stroke-width="2.2" stroke-linejoin="round"/>`
    + `<path d="M276,1018l7,7m0,-7l-7,7M320,1014l7,7m0,-7l-7,7M280,1050l7,7m0,-7l-7,7M322,1046l7,7m0,-7l-7,7" stroke="${L.lit}" stroke-width="1.5" stroke-linecap="round"/>`
    // loose folds and a little grime on the cloth (never on her)
    + `<path d="${taper([[300, 860], [292, 960], [298, 1060]], { w: 6, start: 0.2, end: 0, peak: 0.4 })}${taper([[520, 940], [510, 1040], [516, 1150]], { w: 6, start: 0.2, end: 0, peak: 0.4 })}" fill="${L.deep}" opacity=".7"/>`
    + `<path d="${taper([[188, 920], [182, 1020], [188, 1120]], { w: 8, start: 0.2, end: 0, peak: 0.45 })}" fill="${L.lit}" opacity=".7"/>`
    + `<g filter="${p.refs.soft}" fill="${L.grime}" opacity=".3"><ellipse cx="236" cy="1150" rx="46" ry="22"/><ellipse cx="590" cy="1120" rx="40" ry="20"/><ellipse cx="430" cy="1180" rx="30" ry="14"/></g>`
    + `</g>`;
  // drawstring round neck: a frayed hem, the cord threaded through it, a knot and two loose ends
  const neck = sm([[350, 672], [380, 700], [416, 716], [452, 700], [482, 672]]);
  let fray = '';
  for (let i = 0; i <= 12; i++) {
    const t = i / 12, x = 352 + t * 128, y = 672 + Math.sin(t * Math.PI) * 44;
    fray += `M${ip([x, y])}l${i % 2 ? 2 : -2},${5 + (i % 3)}`;
  }
  s += `<path d="${neck}" fill="none" stroke="${L.line}" stroke-width="5" stroke-linecap="round"/>`
    + `<path d="${neck}" fill="none" stroke="${L.shade}" stroke-width="2.6" stroke-linecap="round"/>`
    + `<path d="${fray}" stroke="${L.line}" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>`
    + `<path d="M356,684Q386,710 416,722Q446,710 476,684" fill="none" stroke="#c9b892" stroke-width="2.4" stroke-dasharray="10 8" stroke-linecap="round"/>`
    + `<circle cx="416" cy="724" r="5" fill="#c9b892" stroke="${L.line}" stroke-width="1.6"/>`
    + `<path d="M413,728Q406,756 410,782M419,728Q428,752 426,772" fill="none" stroke="${L.line}" stroke-width="4.2" stroke-linecap="round"/>`
    + `<path d="M413,728Q406,756 410,782M419,728Q428,752 426,772" fill="none" stroke="#c9b892" stroke-width="2.4" stroke-linecap="round"/>`;
  return s;
}

const CELL = { type: 'cell', label: '天牢', hide: ['foreground'], render: cellTunic };

// ---------------------------------------------------------------- 〔仁〕三年後：伴／分／離
// One everyday coat for the new city (open lapels over a plain high-collared shirt, her own colour, and the pin every
// citizen wears since the 總冊 was taken apart: her own page, a small folded leaf with the moon ring on it), plus one mark
// for where she went (30-13 table): 伴 a sprig of wheat from the 赫麥 field on the lapel, 分 a narrow slate office sash with
// a silver seal (marshal, minister, supervisor, judge...), 離 a dusty travel mantle with the hood down behind her neck.
const COAT = { lia: '#a3313e', mia: '#2e7d8c', serena: '#5a4a80', freya: '#4f88a4', lilith: '#3a3446', evelyn: '#d8ccb0', ophelia: '#33507e', aila: '#3c5ea6' };
const SH = { base: '#f3eee6', shade: '#d6cfc4', line: '#6a6258' };
const PAGE = { base: '#efe6cf', line: '#6e5f3e', ring: '#9a8656' };
const BTN = { base: '#d2b06a', line: '#4a3a18' };

function coat(p) {
  const { smooth: sm, taper } = p.helpers;
  const base = COAT[p.heroine.id] || mix(p.palette.accent, '#3a3040', 0.45);
  const pale = p.heroine.id === 'evelyn';
  const C = { base, lit: mix(base, '#ffffff', pale ? 0.35 : 0.22), shade: mix(base, '#0a0810', pale ? 0.28 : 0.38), deep: mix(base, '#0a0810', pale ? 0.45 : 0.58), line: mix(base, '#050308', 0.78) };
  let s = '';
  // the shirt in the V of the coat, with its own low stand collar and three buttons
  s += `<g clip-path="${p.refs.bodyClip}"><path d="M352,664L480,664L416,872Z" fill="${SH.base}"/><path d="M440,700L470,676L424,850Z" fill="${SH.shade}" opacity=".8"/>`
    + [740, 790, 836].map((y) => `<circle cx="416" cy="${y}" r="4.4" fill="${SH.base}" stroke="${SH.line}" stroke-width="1.6"/>`).join('') + `</g>`;
  // the coat: V opening, closed below it, long sleeves; shaded on her left (viewer's right)
  const body = sm([[60, 700, 1], [352, 664, 1], [416, 862, 1], [480, 664, 1], [772, 700, 1], [772, 1216, 1], [60, 1216, 1]], { closed: true });
  const shadeR = sm([[480, 790], [548, 770], [612, 800], [664, 860], [700, 960], [704, 1216, 1], [530, 1216, 1], [516, 1040], [500, 900]], { closed: true });
  s += `<g clip-path="${p.refs.bodyClip}"><path d="${body}" fill="${p.lin('coat', [[0, C.lit], [0.4, C.base], [1, C.shade]], [0, 700, 0, 1180])}"/>`
    + `<path d="${shadeR}" fill="${C.shade}" opacity=".8"/>`
    + `<path d="M612,900Q660,940 690,1010L704,1216H648Q640,1040 612,900Z" fill="${C.deep}" opacity=".6"/>`
    + `<path d="${p.shapes.armSeamL}${p.shapes.armSeamR}" fill="none" stroke="${C.line}" stroke-width="2.6" opacity=".75"/>`
    + `<path d="${taper([[176, 930], [170, 1030], [176, 1140]], { w: 9, start: 0.2, end: 0, peak: 0.45 })}" fill="${C.lit}" opacity=".8"/>`
    // front edge, buttons, a pocket flap
    + `<path d="M420,862L424,1216" fill="none" stroke="${C.line}" stroke-width="3"/>`
    + [916, 996, 1076, 1156].map((y) => `<circle cx="404" cy="${y}" r="7" fill="${BTN.base}" stroke="${BTN.line}" stroke-width="2"/><circle cx="402" cy="${y - 2}" r="2.2" fill="#fff6dc"/>`).join('')
    + `<path d="M258,1090L334,1084L336,1110Q296,1118 260,1116Z" fill="${C.shade}" stroke="${C.line}" stroke-width="2.2" stroke-linejoin="round"/>`
    + `</g>`;
  // lapels: folded back, lit on the left one, the right one in shade
  const lapel = sm([[352, 664, 1], [416, 862, 1], [398, 868, 1], [330, 772, 1], [312, 760, 1], [300, 706, 1]], { closed: true });
  s += `<path d="${lapel}" fill="${C.lit}" stroke="${C.line}" stroke-width="2.6" stroke-linejoin="round"/>`
    + `<path d="M330,772L346,756" stroke="${C.line}" stroke-width="2.2"/>`
    + `<g transform="${MIR}"><path d="${lapel}" fill="${C.base}" stroke="${C.line}" stroke-width="2.6" stroke-linejoin="round"/><path d="M330,772L346,756" stroke="${C.line}" stroke-width="2.2"/></g>`;
  // the shirt's stand collar
  s += `<path d="${sm([[368, 662, 1], [416, 672], [464, 662, 1], [466, 698, 1], [416, 706], [366, 698, 1]], { closed: true })}" fill="${SH.base}" stroke="${SH.line}" stroke-width="2" stroke-linejoin="round"/>`
    + `<path d="M442,668Q456,666 464,662L466,698Q456,702 442,704Z" fill="${SH.shade}"/>`;
  // her own page: a small folded leaf with the moon ring, pinned on her left breast (viewer's right)
  s += `<g transform="rotate(-8 528 812)"><path d="M508,790H546L552,798V834H508Z" fill="${PAGE.base}" stroke="${PAGE.line}" stroke-width="2" stroke-linejoin="round"/>`
    + `<path d="M546,790V798H552" fill="none" stroke="${PAGE.line}" stroke-width="1.6"/>`
    + `<circle cx="530" cy="814" r="8" fill="none" stroke="${PAGE.ring}" stroke-width="2.4"/><path d="M516,826H544" stroke="${PAGE.ring}" stroke-width="1.4"/></g>`;
  return s;
}

// 伴: a sprig of wheat tucked into the left lapel
function wheat(p) {
  const { taper } = p.helpers;
  const stem = [[318, 840], [326, 800], [334, 760], [338, 724]];
  let grains = '';
  for (let i = 0; i < 6; i++) {
    const y = 730 + i * 9, x = 337 - i * 1.2;
    grains += `M${x - 1},${y}q-9,-3 -10,-12q8,2 10,12zM${x + 1},${y}q9,-3 10,-12q-8,2 -10,12z`;
  }
  return `<path d="${taper(stem, { w: 3, start: 0.6, end: 0.3, peak: 0.5 })}" fill="#b8913e"/>`
    + `<path d="${grains}" fill="#e2bd62" stroke="#7a5a1e" stroke-width="1.2" stroke-linejoin="round"/>`
    + `<path d="M338,724l-3,-16M338,724l4,-15" stroke="#c9a24c" stroke-width="1.2" stroke-linecap="round"/>`;
}

// 分: a narrow slate office sash from her left shoulder to her right hip, with a silver seal
function officeSash(p) {
  const { taper } = p.helpers;
  const pts = [[612, 716], [570, 790], [520, 870], [466, 950], [410, 1030], [354, 1110], [300, 1190]];
  const d = taper(pts, { w: 30, start: 1, end: 1, peak: 0.5 });
  const sx = 352, sy = 1112;
  return `<g clip-path="${p.refs.bodyClip}"><path d="${d}" transform="translate(4 8)" fill="#0a0810" opacity=".25"/>`
    + `<path d="${d}" fill="${p.lin('sash', [[0, '#6c7284'], [0.4, '#4a5062'], [1, '#2e3240']], [600, 720, 300, 1180])}" stroke="#181a22" stroke-width="2.4" stroke-linejoin="round"/>`
    + `<path d="${taper(pts, { w: 22, start: 1, end: 1, peak: 0.5 })}" fill="none" stroke="#b9c0cc" stroke-width="1.4" opacity=".8"/></g>`
    + `<circle cx="${sx}" cy="${sy}" r="22" fill="#c9cfd9" stroke="#3a3e4a" stroke-width="2.6"/><circle cx="${sx}" cy="${sy}" r="15" fill="none" stroke="#7d8494" stroke-width="2"/>`
    + `<path d="M${sx - 7},${sy - 8}H${sx + 5}L${sx + 8},${sy - 5}V${sy + 8}H${sx - 7}Z" fill="#e6eaf0" stroke="#5a6070" stroke-width="1.4"/><circle cx="${sx}" cy="${sy}" r="3.4" fill="none" stroke="#5a6070" stroke-width="1.4"/>`;
}

// 離: a dusty travel mantle over the coat, open down the front; the hood lies bunched behind her neck
const M = { base: '#7a6248', lit: '#9a8064', shade: '#574431', line: '#2a2016' };
function travelMantle(p) {
  const { smooth: sm, taper } = p.helpers;
  const half = sm([[364, 694, 1], [300, 712], [222, 744], [168, 790], [142, 860], [132, 1000], [128, 1216, 1], [262, 1216, 1], [300, 1060], [326, 920], [352, 800], [372, 730]], { closed: true });
  p.def(`<g id="${p.id('cloakHalf')}" stroke-linejoin="round"><path d="${half}" fill="${p.lin('cloak', [[0, M.lit], [0.45, M.base], [1, M.shade]], [0, 690, 0, 1200])}" stroke="${M.line}" stroke-width="3"/>`
    + `<path d="${taper([[340, 720], [262, 748], [196, 800], [162, 880], [150, 980]], { w: 12, start: 0.3, end: 0, peak: 0.4 })}" fill="${M.lit}" opacity=".6"/>`
    + `<path d="${taper([[290, 820], [262, 940], [240, 1080], [226, 1200]], { w: 7, start: 0.2, end: 0.2, peak: 0.4 })}${taper([[212, 860], [192, 980], [180, 1100]], { w: 6, start: 0.2, end: 0.2, peak: 0.4 })}" fill="${M.shade}" opacity=".85"/>`
    + `<path d="M262,1216L300,1060L326,920L352,800" fill="none" stroke="${M.lit}" stroke-width="2" opacity=".5" transform="translate(-4 0)"/>`
    + `</g>`);
  return `<use href="#${p.id('cloakHalf')}"/><use href="#${p.id('cloakHalf')}" transform="${MIR}"/>`
    + `<g transform="${MIR}"><path d="${half}" fill="${M.shade}" opacity=".35"/></g>`
    // cord and two wooden toggles across the collar
    + `<path d="M374,728Q416,744 458,728" fill="none" stroke="${M.line}" stroke-width="4.4" stroke-linecap="round"/>`
    + `<path d="M374,728Q416,744 458,728" fill="none" stroke="#c4a77a" stroke-width="2.2" stroke-linecap="round"/>`
    + `<rect x="362" y="722" width="18" height="8" rx="4" fill="#8a6a3e" stroke="${M.line}" stroke-width="1.6"/><rect x="452" y="722" width="18" height="8" rx="4" fill="#8a6a3e" stroke="${M.line}" stroke-width="1.6"/>`;
}
function hoodDown(p) {
  const { smooth: sm } = p.helpers;
  return `<path d="${sm([[318, 720], [330, 664], [372, 630], [416, 622], [460, 630], [502, 664], [514, 720], [470, 712], [416, 708], [362, 712]], { closed: true })}" fill="${M.shade}" stroke="${M.line}" stroke-width="3" stroke-linejoin="round"/>`
    + `<path d="M336,700Q360,656 416,646Q472,656 496,700" fill="none" stroke="${M.base}" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
}

const Y3 = {
  beside: { type: 'y3_beside', label: '三年后·伴', hide: ['foreground'], render: (p) => coat(p) + wheat(p) },
  apart: { type: 'y3_apart', label: '三年后·分', hide: ['foreground'], render: (p) => coat(p) + officeSash(p) },
  away: { type: 'y3_away', label: '三年后·离', hide: ['foreground'], render: (p) => coat(p) + travelMantle(p), bodyBack: hoodDown },
};
const Y3_LABEL = { beside: '伴：翻领下的衬衫立领，左领别一束赫麦的麦穗', apart: '分：一条窄窄的石板灰官带，腰侧一枚银印', away: '离：外罩一件沾了尘的旅行斗篷，兜帽垂在颈后' };

// ---------------------------------------------------------------- the forty busts
// [id, portrait, prefix stem, name, look, consort robe, the extras her own bust carries (三年後 keeps them; court and cell do not)]
const HEROINES = [
  ['lia', lia, 'Lia', '莉亚', '赤红高马尾', '赤焰妃的深红', ['shield']],
  ['mia', mia, 'Mia', '米娅', '青色短发与猫耳、扳手发夹', '铸金妃的青铜色', []],
  ['serena', serena, 'Serena', '塞雷娜', '紫黑长直发、发尾月白', '夜鸦妃的紫黑', ['staff']],
  ['freya', freya, 'Freya', '芙蕾娅', '青蓝波浪长发、冰晶发梳', '霜潮妃的霜蓝', []],
  ['lilith', lilith, 'Lilith', '莉莉丝', '金色长发高束', '翠影妃的深翠', []],
  ['evelyn', evelyn, 'Evelyn', '伊芙琳', '浅金侧辫、羽翼圣冠', '圣辉妃的灰象牙色', []],
  ['ophelia', ophelia, 'Ophelia', '奥菲莉亚', '铜红长发、额侧小龙角', '龙脊妃的酒红', []],
  ['aila', aila, 'Aila', '艾拉', '金色齐肩短发、星形发夹', '晨门妃的深蓝', []],
];
const cap = (w) => w[0].toUpperCase() + w.slice(1);

export const ch30Busts = Object.fromEntries(HEROINES.flatMap(([id, heroine, Pre, name, look, robe, extras]) => [
  [`${id}_consort`, () => portraitBust(heroine, { prefix: `sbNpc${Pre}Consort`, outfit: CONSORT,
    label: `${name}（册妃）：${look}；${robe}高立领长袍，前襟一列铁扣，铁灰短披肩镶暗金边，领口一枚铁冠扣${id === 'ophelia' ? '；不戴冠饰' : '，发上一枚细铁冠'}` })],
  [`${id}_cell`, () => portraitBust(heroine, { prefix: `sbNpc${Pre}Cell`, outfit: CELL,
    label: `${name}（天牢）：${look}；粗麻本色囚衣，抽绳圆领，粗针缝线与两块补丁，衣上有些污渍` })],
  ...Object.keys(Y3).map((k) => [`${id}_y3_${k}`, () => portraitBust(heroine, { prefix: `sbNpc${Pre}Y3${cap(k)}`, outfit: Y3[k], extras,
    label: `${name}（三年后·${Y3[k].label.slice(-1)}）：${look}；自己颜色的翻领外套，左胸别着自己那一页的小页徽（月环）；${Y3_LABEL[k]}` })]),
]));
