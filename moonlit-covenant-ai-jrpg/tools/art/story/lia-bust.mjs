// Story-mode bust of Lia (speakers lia / lia_unknown): the same face and armour as the heroine portrait
// (tools/art/portrait/heroines/lia.mjs), but transparent — no gothic window, blood moon or night lighting —
// so she sits on day scenes like the NPC busts, plus her canon tower shield "Chishi" behind the left shoulder.
// Built by portraitBust() (portrait-bust.mjs). The gacha / side-story portrait (public/assets/portraits/lia.svg)
// is unchanged.
import lia from '../portrait/heroines/lia.mjs';
import { portraitBust } from './portrait-bust.mjs';

export function liaBust() {
  return portraitBust(lia, { prefix: 'sbNpcLia', extras: ['shield'], label: '莉亚：赤红高马尾的盾战士，银甲、烧焦内衬的披风，左肩后露出塔盾「赤誓」的一角' });
}
