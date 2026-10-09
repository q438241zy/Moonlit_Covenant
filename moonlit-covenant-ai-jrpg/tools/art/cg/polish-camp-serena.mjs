// Serena for camp-fire.svg — seated behind the table under the eclipse window, elbows on the cloth,
// a teacup lifted in front of her chest (right hand in the white half-glove on the handle, left hand
// under the saucer). Eyes closed, the faintest smile: the observer is calm because she has seen it.
// Head drawn in local units (origin = between the eyes), placed by HEAD_T.
import { smooth, taper, path, line, linear, eye } from './polish-lib.mjs';

const S = (P) => smooth(P, true);
const C = { serena: '#b58cff', white: '#efe9ff', oath: '#ffd091', lamp: '#ffc670' };
const SKIN = { base: '#f6dcd2', lit: '#fff2e6', sh: '#cfa0a8', deep: '#8e6488', line: '#5e3a5a', blush: '#f0a0aa' };
const H = { base: '#2c2150', sh: '#17102e', deep: '#0d0820', hi: '#6c5cae', sheen: '#9484d0' };
const RB = { base: '#2a2048', sh: '#150f2a', lit: '#4e3e78', trim: '#cfc6ee', warm: '#6a4a6a' };
const HEAD_T = 'translate(930 352) scale(.54) rotate(3)';

export function serena(c) {
  const { p, def, U } = c;
  // ---------------------------------------------------------------- shapes
  def('sBack', S([[-108, -50], [-120, 90], [-132, 300], [-140, 480, 1], [140, 480, 1], [132, 300], [122, 90], [110, -50]]));
  def('sHair', S([[-100, -10], [-106, -80], [-74, -138], [-10, -162], [56, -150], [96, -108], [106, -40], [100, 20], [84, 46, 1], [72, 0], [62, -30, 1], [54, 4], [50, 10, 1], [42, -30], [32, -60, 1], [22, -34], [10, -8, 1], [4, -50], [-2, -94, 1], [-8, -50], [-14, -10, 1], [-24, -36], [-34, -60, 1], [-44, -28], [-52, 10, 1], [-58, 4], [-62, -28, 1], [-72, 0], [-86, 46, 1]]));
  def('sSideN', taper([[88, -40], [100, 60], [104, 200], [110, 340], [112, 470]], 56, 0.9, 0.6, 0.2));
  def('sSideF', taper([[-86, -40], [-96, 60], [-98, 200], [-102, 340], [-104, 470]], 52, 0.9, 0.6, 0.2));
  def('sFace', S([[66, -58], [71, -16], [69, 20], [62, 52], [46, 80], [26, 99], [6, 110], [-8, 113], [-24, 105], [-42, 88], [-56, 62], [-63, 32], [-62, 4], [-66, -26], [-62, -60], [-16, -92], [40, -88]]));
  // robe: sloped shoulders, torso down behind the table
  def('sRobe', S([[912, 418], [950, 418], [990, 438], [1030, 456], [1046, 500], [1050, 600, 1], [812, 600, 1], [816, 500], [832, 458], [872, 438]]));
  // sleeves: upper arm hangs to the elbow on the cloth, forearm rises to the cup; wide bell cuffs
  def('sArmL', S([[836, 462], [818, 520], [814, 580], [836, 606], [872, 604], [896, 566], [902, 540], [884, 530], [864, 560], [856, 520], [858, 476]]));
  def('sArmR', S([[1026, 462], [1044, 520], [1048, 580], [1026, 606], [990, 606], [962, 572], [952, 548], [972, 540], [996, 566], [1006, 520], [1004, 476]]));
  c.sil('serSil', [['sBack', HEAD_T], ['sRobe'], ['sArmL'], ['sArmR'], ['sSideN', HEAD_T], ['sSideF', HEAD_T], ['sHair', HEAD_T], ['sFace', HEAD_T]]);
  c.add(linear(`${p}-sFade`, [[0, H.base], [0.55, H.base], [0.8, '#5a4a92'], [1, '#d8cff6']], 'gradientUnits="userSpaceOnUse" x1="0" y1="-60" x2="0" y2="470"')
    + linear(`${p}-sShade`, [[0, '#ffb070', 0.22], [0.4, '#ffb070', 0], [0.6, '#0a0618', 0], [1, '#0a0618', 0.55]], 'gradientUnits="userSpaceOnUse" x1="800" y1="0" x2="1060" y2="0"'));

  let s = '';
  // ---------------------------------------------------------------- glow + rims (lavender on the right, warm lamp on the left, moon-white on top)
  s += U('serSil', C.serena, ` opacity=".55" filter="url(#${p}-b2)"`);
  s += U('serSil', C.serena, ' transform="translate(4 -1)"');
  s += U('serSil', C.white, ' opacity=".6" transform="translate(0 -3)"');
  s += U('serSil', '#ffc890', ' opacity=".75" transform="translate(-2.5 1)"');
  // ---------------------------------------------------------------- back hair + neck
  s += `<g transform="${HEAD_T}">${U('sBack', `url(#${p}-sFade)`)}`;
  s += path(S([[-90, 0], [-100, 200], [-108, 470, 1], [-60, 470, 1], [-64, 200], [-56, 40]]), H.deep, ' opacity=".6"');
  s += path(S([[-34, 70], [-32, 150], [-40, 196, 1], [38, 196, 1], [32, 150], [34, 80]]), SKIN.base);
  s += path(S([[-34, 70], [34, 80], [32, 130], [0, 140], [-32, 126]]), SKIN.sh);
  s += path(S([[14, 100], [32, 96], [34, 150], [38, 196, 1], [18, 196, 1]]), SKIN.deep, ' opacity=".45"');
  s += '</g>';
  // ---------------------------------------------------------------- robe
  s += U('sRobe', RB.base);
  s += path(S([[832, 458], [872, 438], [900, 432], [880, 480], [860, 600, 1], [812, 600, 1], [816, 500]]), RB.lit, ' opacity=".8"');
  s += path(S([[990, 438], [1030, 456], [1046, 500], [1050, 600, 1], [1000, 600, 1], [1004, 500]]), RB.sh);
  // seal embroidery on the shoulders (magic circles) + front placket
  s += `<g fill="none" stroke="${RB.trim}" opacity=".5"><circle cx="852" cy="470" r="15" stroke-width="1.4"/><circle cx="852" cy="470" r="9" stroke-width="1"/><circle cx="1012" cy="470" r="15" stroke-width="1.4"/><circle cx="1012" cy="470" r="9" stroke-width="1"/><path d="M842,462L862,478M862,462L842,478M1002,462L1022,478M1022,462L1002,478" stroke-width="1"/></g>`;
  s += line('M930,452V600', RB.trim, 1.6, ' opacity=".45"') + line('M890,456Q930,480 970,456', RB.trim, 1.4, ' opacity=".55"');
  // observer pendant: closed silver eyelid on a fine chain
  s += line('M906,440Q930,470 954,440', '#cfc6ee', 1.2, ' opacity=".8"');
  s += path('M914,476Q930,464 946,476Q930,486 914,476Z', '#e6e0fa') + line('M917,477Q930,484 943,477', '#6a5a94', 1.4) + line('M920,480l-2,4M926,482l-1,4M932,482l0,4M938,481l1,4', '#6a5a94', 1);
  // high collar with silver trim + diamond
  s += path(S([[902, 402], [958, 402], [966, 420], [962, 446], [930, 452], [898, 446], [894, 420]]), RB.sh);
  s += path(S([[902, 402], [930, 404], [930, 452], [898, 446], [894, 420]]), RB.warm, ' opacity=".7"');
  s += line('M896,420Q930,428 964,420', RB.trim, 1.8) + line('M898,444Q930,452 962,444', RB.trim, 1.4, ' opacity=".7"');
  s += path('M930,428l5,7l-5,7l-5,-7z', RB.trim);
  // ---------------------------------------------------------------- head
  s += `<g transform="${HEAD_T}">${head(c)}</g>`;
  // ---------------------------------------------------------------- light wash over the whole figure
  s += `<g clip-path="url(#${p}-serSilC)"><rect x="790" y="200" width="290" height="400" fill="url(#${p}-sShade)"/></g>`;
  return s;
}

function head(c) {
  const { p, U } = c;
  let s = '';
  s += U('sFace', SKIN.base, ` stroke="${SKIN.line}" stroke-width="2"`);
  // shadow on the near (screen-right, away from the lamp) side, under the fringe
  s += path(S([[68, -40], [71, -10], [69, 20], [62, 52], [46, 80], [26, 99], [10, 108], [30, 84], [44, 58], [50, 28], [52, -6], [56, -40]]), SKIN.sh);
  s += path(S([[-64, -50], [-30, -34], [-2, -60], [30, -34], [66, -46], [66, -64], [0, -96], [-60, -66]]), SKIN.sh, ' opacity=".7"');
  s += path(S([[-54, 30], [-60, 40], [-52, 64], [-38, 84], [-22, 98], [-30, 76], [-40, 54]]), SKIN.lit);
  s += `<ellipse cx="-38" cy="44" rx="14" ry="6" fill="${SKIN.blush}" opacity=".35"/><ellipse cx="38" cy="44" rx="15" ry="6" fill="${SKIN.blush}" opacity=".35"/>`;
  // closed eyes, gentle brows, small nose, soft smile
  s += `<g transform="translate(-29 6)">${eye({ w: 36, h: 26, lid: 1, smile: 0.3, ink: '#24163a', skinSh: SKIN.sh })}</g>`;
  s += `<g transform="translate(29 6)">${eye({ w: 40, h: 26, lid: 1, flip: true, smile: 0.3, ink: '#24163a', skinSh: SKIN.sh })}</g>`;
  s += path(taper([[-50, -24], [-32, -30], [-12, -25]], 3.4, 0.4, 0.2, 0.5) + taper([[12, -25], [32, -30], [52, -25]], 3.4, 0.4, 0.2, 0.5), '#3a2a5a', ' opacity=".85"');
  s += path('M-7,32Q-12,40-10,46Q-6,48-2,47Q-8,42-7,32Z', SKIN.sh) + path(taper([[-10, 42], [-11, 46], [-4, 48]], 2, 0.3, 0.2, 0.5, 1), SKIN.line, ' opacity=".8"');
  s += path(taper([[-20, 69], [-8, 73], [6, 69]], 2.4, 0.2, 0.2, 0.5, 1), '#8a4a5e');
  s += path('M-12,77Q-6,80 0,77Q-6,78.5-12,77Z', SKIN.sh, ' stroke="' + SKIN.sh + '" stroke-width="1.5"');
  // centre-parted fringe
  s += U('sHair', H.base);
  const notches = [[62, -30, 84, 46], [32, -60, 50, 10], [-34, -60, -52, 10], [-62, -28, -86, 46]];
  let sh = '', sep = '';
  for (const [nx, ny, tx, ty] of notches) {
    sh += taper([[nx, ny], [(nx + tx) / 2 + (tx > nx ? -3 : 3), (ny + ty) / 2], [tx, ty]], 9, 0.9, 0, 0.3);
    sep += taper([[nx * 0.6, -128], [nx * 0.85, (ny - 128) / 2], [nx, ny]], 3, 0.1, 0.2, 0.7);
  }
  s += path(sh, H.sh, ' opacity=".85"') + path(sep, H.deep, ' opacity=".6"');
  // violet sheen band (moonlit) on the crown
  s += path(taper([[-80, -108], [-40, -138], [0, -146]], 10, 0, 0, 0.5) + taper([[14, -146], [52, -136], [84, -106]], 10, 0, 0, 0.5), H.sheen, ' opacity=".75"');
  s += path(taper([[-2, -92], [8, -60], [12, -10]], 5, 0.6, 0, 0.3) + taper([[-2, -92], [-12, -60], [-16, -12]], 5, 0.6, 0, 0.3), H.sh, ' opacity=".8"');
  s += path(taper([[2, -70], [-2, -30], [4, 18]], 5, 0.6, 0, 0.3), H.base);
  // long side curtains of hair (front), fading to moon-white at the ends
  s += U('sSideF', `url(#${p}-sFade)`) + U('sSideN', `url(#${p}-sFade)`);
  s += path(taper([[-82, -20], [-90, 80], [-92, 220], [-96, 360], [-96, 460]], 12, 0.4, 0, 0.3), H.sh, ' opacity=".8"');
  s += path(taper([[96, -10], [104, 100], [108, 240], [112, 380]], 10, 0.4, 0, 0.3), H.hi, ' opacity=".55"');
  s += path(taper([[-70, 40], [-78, 160], [-80, 300]], 5, 0.4, 0, 0.3), H.hi, ' opacity=".6"');
  // braid with the moon-phase ornament (her left)
  let br = '';
  for (let i = 0; i < 9; i++) {
    const y = 14 + i * 26, x = 96 + i * 1.6, k = i % 2 ? 1 : -1;
    br += `<ellipse cx="${x + k * 4}" cy="${y}" rx="11" ry="15" transform="rotate(${k * 24} ${x + k * 4} ${y})"/>`;
  }
  s += `<g fill="#3e3070" stroke="${H.deep}" stroke-width="1.4">${br}</g>`;
  s += line(Array.from({ length: 9 }, (_, i) => { const y = 14 + i * 26, x = 96 + i * 1.6, k = i % 2 ? 1 : -1; return `M${x + k * 9},${y - 8}q${-k * 4},6 ${-k * 3},14`; }).join(''), '#8a7ac8', 2.2, ' opacity=".8"');
  s += path(taper([[100, 10], [104, 120], [108, 230]], 4, 0.4, 0, 0.4), H.sheen, ' opacity=".6"');
  s += `<circle cx="96" cy="-6" r="17" fill="#1b1533" stroke="${C.white}" stroke-width="3"/><path d="M96,-20A14,14 0 1 1 96,8A8,14 0 1 0 96,-20Z" fill="${C.white}"/>`;
  s += `<circle cx="96" cy="-6" r="22" fill="none" stroke="#cfc6ee" stroke-width="2" stroke-dasharray="2 4" opacity=".8"/>`;
  return s;
}

// forearms, hands and the cup (drawn after the table top: the elbows rest on the cloth)
export function serenaFront(c) {
  const { p, U } = c;
  c.add(linear(`${p}-sCup`, [[0, '#fff8ee'], [0.6, '#efe4d6'], [1, '#b8a48e']], 'x1="0" y1="0" x2="1" y2="0"'));
  let s = '';
  // sleeves resting on the cloth
  s += U('sArmL', RB.base) + U('sArmR', RB.base);
  s += path(S([[836, 462], [818, 520], [814, 580], [836, 606], [850, 600], [838, 560], [842, 500]]), RB.lit, ' opacity=".8"');
  s += path(S([[1026, 462], [1044, 520], [1048, 580], [1026, 606], [1006, 600], [1020, 560], [1018, 500]]), RB.sh);
  s += line('M872,604Q890,580 900,544M990,606Q970,584 956,550', RB.trim, 1.6, ' opacity=".7"');
  s += path('M818,598Q850,614 876,602L872,612Q846,622 816,608Z', RB.sh) + path('M1046,598Q1014,616 988,604L992,614Q1018,624 1048,608Z', RB.sh);
  // saucer + cup with gold rim, steam
  s += `<ellipse cx="930" cy="552" rx="40" ry="9" fill="#e8dccc"/><ellipse cx="930" cy="550" rx="34" ry="6.5" fill="none" stroke="${C.oath}" stroke-width="1.6"/>`;
  s += path('M906,516H954L949,544Q930,556 911,544Z', `url(#${p}-sCup)`);
  s += `<ellipse cx="930" cy="516" rx="24" ry="5" fill="#a8603a"/><ellipse cx="930" cy="516" rx="24" ry="5" fill="none" stroke="${C.oath}" stroke-width="1.8"/>`;
  s += path('M946,524Q962,524 960,534Q958,542 948,540', 'none', ` stroke="#efe4d6" stroke-width="3.5"`);
  s += line('M922,506C914,492 930,486 922,470M936,504C944,490 930,482 940,466', '#fff6ea', 2, ' opacity=".35"');
  // left hand under the saucer: only the fingertips show past the rim
  s += path(S([[952, 556], [968, 552], [984, 556], [990, 562], [980, 566], [960, 566]]), SKIN.base);
  s += path(S([[966, 562], [984, 560], [988, 563], [980, 566], [964, 566]]), SKIN.sh);
  s += line('M970,557l12,1M968,561l14,1', SKIN.line, 1, ' opacity=".55"');
  // right hand (white half-glove): fingers lightly round the cup, thumb on the handle side
  s += path(S([[880, 526], [898, 516], [912, 520], [914, 534], [908, 546], [892, 548], [880, 540]]), '#f4f0ff');
  s += path(S([[880, 536], [892, 540], [908, 538], [906, 548], [890, 550], [880, 544]]), '#c8c0e4');
  s += path(taper([[906, 522], [918, 520], [926, 524]], 6.5, 0.9, 0.5, 0.4, 1), SKIN.base) + path(taper([[906, 530], [918, 529], [927, 533]], 6.5, 0.9, 0.5, 0.4, 1), SKIN.base) + path(taper([[905, 538], [916, 538], [924, 541]], 6, 0.9, 0.5, 0.4, 1), SKIN.base);
  s += line('M918,520l8,3M918,529l9,3.5M916,538l8,2.5', SKIN.sh, 1.2, ' opacity=".7"');
  s += line('M884,528Q896,520 910,522', '#ffffff', 1.4, ' opacity=".9"');
  return s;
}
