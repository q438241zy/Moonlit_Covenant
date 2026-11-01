// Chapter 16 heroine story bust (script 16 美術需求), built by portraitBust() like Lia's, Mia's and Serena's:
//   evelyn — 圣女伊芙琳 (speakers evelyn_unknown, nameplate 圣女, and evelyn after she gives her name in 16-10; one bust):
//            her heroine portrait (tools/art/portrait/heroines/evelyn.mjs) composed transparent — pale gold, almost white
//            hair in a loose side braid ending in a tiny prayer bell, star-blue eyes, the feathered circlet, the star
//            pendant; shy, a little nervous. No gacha outfit, no body-gaze framing.
//   evelyn_ceremony — the same face in her reading-desk dress for 16's ceremony (speakers evelyn_ceremony_unknown /
//            evelyn_ceremony): a long ivory ceremonial robe with a high collar, a gold-edged white stole falling straight
//            down the front with a seven-pointed star near each end, and the rolled draft held in both hands at her chest.
//            The story outfit lives here, not in tools/art/portrait/outfits, so the gacha build never picks it up.
import evelyn from '../portrait/heroines/evelyn.mjs';
import { mix, star7 } from './lib.mjs';
import { portraitBust } from './portrait-bust.mjs';

export function evelynBust() {
  return portraitBust(evelyn, { prefix: 'sbNpcEvelyn', label: '伊芙琳：浅金偏白的长发编成松散的侧辫、辫尾系着小祈祷铃，星蓝色的眼睛，额前羽翼形的圣冠，白金色的长衣，胸前星形吊坠；神情温柔、羞怯，有一点紧张' });
}

const IV = { base: '#ece6d6', lit: '#fbf8f0', shade: '#c4baa4', deep: '#a09478', line: '#6e6450' };
const GD = { gold: '#d8b464', mid: '#a8843e', line: '#3a2a10' };
function ceremonyRobe(p) {
  const { smooth: sm, taper } = p.helpers;
  let s = '';
  const robe = sm([[60, 700, 1], [356, 656, 1], [416, 672], [476, 656, 1], [772, 700, 1], [772, 1216, 1], [60, 1216, 1]], { closed: true });
  s += `<g clip-path="${p.refs.bodyClip}"><path d="${robe}" fill="${p.lin('robe', [[0, IV.lit], [0.45, IV.base], [1, IV.shade]], [0, 690, 0, 1200])}"/>`
    + `<path d="M500,800Q610,820 680,900L704,1216H540Q530,1000 500,800Z" fill="${IV.shade}" opacity=".55"/>`
    + `<path d="${p.shapes.armSeamL}${p.shapes.armSeamR}" fill="none" stroke="${IV.line}" stroke-width="2.4" opacity=".5"/>`
    + `<path d="${taper([[190, 920], [184, 1040], [190, 1160]], { w: 8, start: 0.2, end: 0, peak: 0.45 })}" fill="#ffffff" opacity=".7"/>`;
  // the stole: two straight gold-edged white bands from the collar down, a seven-pointed star near each lower end
  for (const x of [352, 480]) {
    s += `<path d="M${x - 22},700L${x - 26},1216H${x + 26}L${x + 22},700Z" fill="#fffdf6"/>`
      + `<path d="M${x - 22},700L${x - 26},1216M${x + 22},700L${x + 26},1216" fill="none" stroke="${GD.line}" stroke-width="4.4"/>`
      + `<path d="M${x - 22},700L${x - 26},1216M${x + 22},700L${x + 26},1216" fill="none" stroke="${GD.gold}" stroke-width="2.2"/>`
      + `<path d="${star7(x, 1150, 15)}" fill="${GD.gold}" stroke="${GD.line}" stroke-width="1.4"/>`;
  }
  s += `</g>`;
  // high collar
  const collar = sm([[366, 630, 1], [416, 642], [466, 630, 1], [470, 698, 1], [416, 710], [362, 698, 1]], { closed: true });
  s += `<path d="${collar}" fill="${p.lin('collar', [[0, IV.lit], [1, IV.shade]], [366, 0, 470, 0])}" stroke="${IV.line}" stroke-width="2.4" stroke-linejoin="round"/>`
    + `<path d="M368,636Q416,650 464,636" fill="none" stroke="${GD.mid}" stroke-width="3" stroke-linecap="round"/>`;
  // the rolled draft held in both hands at her chest
  const skin = p.palette.skin || '#f3dccb', skinLine = p.palette.skinLine || '#9a6a5a';
  s += `<path d="M236,968L604,940L610,1000L242,1030Z" fill="${p.lin('scroll', [[0, '#fbf6e8'], [1, '#d8ccb0']], [0, 940, 0, 1030])}" stroke="${IV.line}" stroke-width="2.4" stroke-linejoin="round"/>`
    + `<ellipse cx="239" cy="999" rx="13" ry="31" fill="#e8dcc0" stroke="${IV.line}" stroke-width="2.4"/><ellipse cx="607" cy="970" rx="13" ry="31" fill="#d8ccb0" stroke="${IV.line}" stroke-width="2.4"/>`
    + `<path d="M300,960L306,1022M330,958L336,1020" stroke="${mix(IV.line, '#ffffff', 0.4)}" stroke-width="1.6" opacity=".6"/>`
    + `<path d="M318,950q-30,4 -34,34q0,40 34,46q28,2 34,-30q4,-40 -34,-50z" fill="${skin}" stroke="${skinLine}" stroke-width="2.4"/>`
    + `<path d="M520,940q-30,4 -32,34q0,40 32,46q28,2 34,-30q4,-40 -34,-50z" fill="${skin}" stroke="${skinLine}" stroke-width="2.4"/>`
    + `<path d="M294,980q14,-4 26,2M296,1000q14,-4 26,2M498,970q14,-4 26,2M500,990q14,-4 26,2" fill="none" stroke="${skinLine}" stroke-width="1.6" opacity=".7"/>`;
  return s;
}
const CEREMONY = { type: 'ceremony', label: '读册礼服', hide: ['foreground'], render: ceremonyRobe };

export function evelynCeremonyBust() {
  return portraitBust(evelyn, { prefix: 'sbNpcEvelynCeremony', outfit: CEREMONY, label: '伊芙琳·读册礼服：浅金偏白的侧辫与羽翼形圣冠，象牙白的长礼袍与高领，胸前垂下两道金边白圣带，双手在胸前握着卷起的稿子；神情紧张' });
}

export const ch16Busts = { evelyn: evelynBust, evelyn_ceremony: evelynCeremonyBust };
