// Chapter 18 heroine story bust (script 18 美術需求), built by portraitBust() like Aila's:
//   freya — 芙蕾娅 (speakers freya_unknown, nameplate 北境的女人, before she gives her name in 18-02, and freya; one bust):
//           her heroine portrait (tools/art/portrait/heroines/freya.mjs) composed transparent — blue-teal wavy long hair,
//           warm amber eyes, the ice-crystal comb, layered northern robes with the white fur-collared shawl; a gentle smile.
//           No gacha outfit, no body-gaze framing.
import freya from '../portrait/heroines/freya.mjs';
import { portraitBust } from './portrait-bust.mjs';

export function freyaBust() {
  return portraitBust(freya, { prefix: 'sbNpcFreya', label: '芙蕾娅：青蓝色的波浪长发，暖琥珀色的眼睛，冰晶发梳，层叠的北境长袍和白毛领披肩，温柔的笑' });
}

export const ch18Busts = { freya: freyaBust };
