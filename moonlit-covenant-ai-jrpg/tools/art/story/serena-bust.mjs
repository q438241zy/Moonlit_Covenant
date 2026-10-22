// Story-mode bust of Serena (speakers serena / serena_unknown, from chapter 11): her heroine portrait
// (tools/art/portrait/heroines/serena.mjs) composed transparent by portraitBust(), exactly as Lia's and Mia's —
// very long straight purple-black hair fading to moon-white, the thin braid on her left (viewer's right) with the
// silver moon-phase disc, pale violet eyes with the star-orbit iris, the matte velvet robe with silver seal lines,
// the closed-eyelid silver pendant below the collar and the white half-glove on her right hand, plus the head of her obsidian staff behind her right shoulder (the
// portrait's optional `staff` extra, as Lia's shield). No eclipse
// backdrop, no full-frame lighting. Bust only, calm expression, nothing sexualised (script 11 美術需求).
import serena from '../portrait/heroines/serena.mjs';
import { portraitBust } from './portrait-bust.mjs';

export function serenaBust() {
  return portraitBust(serena, { prefix: 'sbNpcSerena', extras: ['staff'], label: '塞雷娜：紫黑长直发、发尾月白，左侧细辫串着银色月相盘，淡紫星轨纹的眼，紫黑丝绒长袍与银线封印纹，领口下闭眼形银吊坠，右手半截白手套，右肩后露出黑曜法杖的杖头' });
}
