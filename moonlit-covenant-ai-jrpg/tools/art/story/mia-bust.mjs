// Story-mode bust of Mia Ling (speakers mia / mia_unknown, from chapter 07): her heroine portrait
// (tools/art/portrait/heroines/mia.mjs) composed transparent by portraitBust(), exactly as Lia's — cyan-blue
// self-cut short hair with neon tips, the wrench hair clip on her right, the mechanical cat-ear receivers with
// their cyan rim rings and antenna tips, bright cyan eyes, the little mole on the nose, the oversized dark-grey
// work jacket with glowing cyan seams. Bust only, nothing sexualised. The drone 零号 (the portrait's
// `foreground` layer) is left out: in the story it is only beeps and points of light (script 07 美術需求), and it
// is often away from her (scanning boots, sniffing cream) while she talks. The gacha portrait keeps it.
import mia from '../portrait/heroines/mia.mjs';
import { portraitBust } from './portrait-bust.mjs';

export function miaBust() {
  const noDrone = { ...mia, layers: { ...mia.layers, foreground: undefined } };
  return portraitBust(noDrone, { prefix: 'sbNpcMia', label: '米娅：青蓝短发、发梢霓虹渐变，机械猫耳接收器，右侧扳手发卡，过大的深灰工装外套与青蓝发光缝线' });
}
