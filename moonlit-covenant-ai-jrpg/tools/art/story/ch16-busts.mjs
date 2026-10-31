// Chapter 16 heroine story bust (script 16 美術需求), built by portraitBust() like Lia's, Mia's and Serena's:
//   evelyn — 圣女伊芙琳 (speakers evelyn_unknown, nameplate 圣女, and evelyn after she gives her name in 16-10; one bust):
//            her heroine portrait (tools/art/portrait/heroines/evelyn.mjs) composed transparent — pale gold, almost white
//            hair in a loose side braid ending in a tiny prayer bell, star-blue eyes, the feathered circlet, the star
//            pendant; shy, a little nervous. No gacha outfit, no body-gaze framing. (The script asks for her ceremonial
//            white-and-gold robe and a scroll in her hands; until a ceremonial outfit exists she wears the portrait's
//            white-and-gold dress.)
import evelyn from '../portrait/heroines/evelyn.mjs';
import { portraitBust } from './portrait-bust.mjs';

export function evelynBust() {
  return portraitBust(evelyn, { prefix: 'sbNpcEvelyn', label: '伊芙琳：浅金偏白的长发编成松散的侧辫、辫尾系着小祈祷铃，星蓝色的眼睛，额前羽翼形的圣冠，白金色的长衣，胸前星形吊坠；神情温柔、羞怯，有一点紧张' });
}

export const ch16Busts = { evelyn: evelynBust };
