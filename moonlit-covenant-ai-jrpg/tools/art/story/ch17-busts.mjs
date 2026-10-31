// Chapter 17 heroine story bust (script 17 美術需求), built by portraitBust() like Evelyn's:
//   aila — 光明骑士艾拉 (speakers aila_unknown, nameplate 金发的骑士, before she gives her name in 17-03, and aila; one bust):
//          her heroine portrait (tools/art/portrait/heroines/aila.mjs) composed transparent — gold shoulder-length short
//          hair, bright blue eyes, an open, confident grin; blue-and-gold light knight's armour. No gacha outfit, no
//          body-gaze framing. (The script's silver gauntlet, the corner of the cloak and the round shield are left to the
//          portrait as drawn; the full crest is not on the bust.)
// Evelyn keeps the chapter 16 bust: her heroine portrait is already the 设03 white-and-gold travelling look of 17-11.
import aila from '../portrait/heroines/aila.mjs';
import { portraitBust } from './portrait-bust.mjs';

export function ailaBust() {
  return portraitBust(aila, { prefix: 'sbNpcAila', label: '艾拉：金色齐肩短发，明亮的蓝色眼睛，开朗自信的笑，蓝金色的轻骑士甲' });
}

export const ch17Busts = { aila: ailaBust };
