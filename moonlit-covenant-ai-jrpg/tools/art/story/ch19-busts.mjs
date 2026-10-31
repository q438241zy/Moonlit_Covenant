// Chapter 19 heroine story bust (script 19 美術需求), built by portraitBust() like Freya's:
//   ophelia — 奥菲莉亚 (speakers ophelia_unknown, nameplate 龙脊的使节, before she gives her name in 19-02, and ophelia; one bust):
//             her heroine portrait (tools/art/portrait/heroines/ophelia.mjs) composed transparent — wild copper-red long hair,
//             small horns at the temples, heterochromatic eyes (left gold, right violet), dark-blue dragon-scale plates with
//             silver trim; a composed, upright stance. No gacha outfit, no body-gaze framing.
import ophelia from '../portrait/heroines/ophelia.mjs';
import { portraitBust } from './portrait-bust.mjs';

export function opheliaBust() {
  return portraitBust(ophelia, { prefix: 'sbNpcOphelia', label: '奥菲莉亚：铜红色的长发，额侧一对小龙角，左金右紫的异色瞳，深蓝龙鳞纹甲片配银色镶边，端庄的站姿' });
}

export const ch19Busts = { ophelia: opheliaBust };
