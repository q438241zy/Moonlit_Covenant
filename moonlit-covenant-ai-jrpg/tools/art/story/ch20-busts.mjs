// Chapter 20 heroine story bust (script 20 美術需求), built by portraitBust() like Ophelia's:
//   lilith — 莉莉丝 (speaker lilith, after the hood falls and she gives her name in 20-07; before that the hooded figure is
//            lilith_unknown on the chapter 13 golden_assassin bust): her heroine portrait (tools/art/portrait/heroines/lilith.mjs)
//            composed transparent — gold long hair tied high, gold eyes, a small plaster across the bridge of her nose, black-and-
//            gold light armour. No close-up of the twin daggers, no gacha outfit, no body-gaze framing.
import lilith from '../portrait/heroines/lilith.mjs';
import { portraitBust } from './portrait-bust.mjs';

export function lilithBust() {
  return portraitBust(lilith, { prefix: 'sbNpcLilith', label: '莉莉丝：金色长发高高束起，金色的眼睛，鼻梁上一块小创可贴，黑金色的轻甲' });
}

export const ch20Busts = { lilith: lilithBust };
