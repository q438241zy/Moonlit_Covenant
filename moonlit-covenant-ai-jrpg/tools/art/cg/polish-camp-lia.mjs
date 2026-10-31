// Lia for camp-fire.svg — standing at the far end of the table, body turned toward the lamp, head
// turned to the captain. Her left fist is wrapped around the scabbard: the ring-guard pommel of the
// rapier cracks down on the cloth. Right gauntlet planted on her hip.
// Head drawn in local units (origin = between the eyes), placed by HEAD_T.
import { smooth, taper, path, line, linear, eye } from './polish-lib.mjs';

const S = (P) => smooth(P, true);
const C = { lia: '#ff6b7c', oath: '#ffd091', brass: '#b88a4a', brassHi: '#ffd091', lamp: '#ffc670' };
const SKIN = { base: '#f7d8c8', lit: '#fff1e4', sh: '#d6a09a', deep: '#a06878', line: '#6a2f3a', blush: '#f08a8a' };
const H = { base: '#c42a40', sh: '#80162a', deep: '#4a0a1a', hi: '#ff8a96', lit: '#ff9e8c', streak: '#5a0e20' };
const AR = { base: '#aeb2cc', lit: '#f4dcc4', mid: '#7e7ea2', sh: '#4c4a6c', deep: '#272540', hi: '#ffffff', red: '#a32840', redSh: '#561020', redLit: '#e4566a' };
const HEAD_T = 'translate(420 238) scale(.58) rotate(-3)';

export function lia(c) {
  const { p, def, U } = c;
  // ---------------------------------------------------------------- shapes (defs)
  // head, local units
  def('lHair', S([[-102, -20], [-110, -84], [-82, -138], [-20, -168], [46, -158], [90, -120], [106, -60], [100, 0], [74, 16, 1], [70, -18], [60, -44, 1], [52, -20], [48, -4, 1], [40, -32], [28, -48, 1], [14, -12], [4, 20, 1], [-2, -12], [-6, -42, 1], [-10, -24], [-14, -6, 1], [-18, -28], [-22, -46, 1], [-28, -20], [-31, 4, 1], [-38, -24], [-44, -48, 1], [-52, -18], [-58, 12, 1], [-62, -16], [-70, -42, 1], [-86, -12], [-98, 24, 1]]));
  def('lBack', S([[-98, -40], [-104, 40], [-94, 130], [-50, 150], [40, 150], [84, 118], [96, 30], [94, -40]]));
  def('lSideN', taper([[-84, -76], [-96, 10], [-92, 100], [-100, 190], [-92, 262]], 38, 0.9, 0, 0.22));
  def('lSideF', taper([[78, -64], [88, 10], [86, 96], [94, 184]], 30, 0.9, 0, 0.22));
  def('lFace', S([[-70, -56], [-75, -14], [-73, 22], [-66, 52], [-52, 78], [-31, 98], [-10, 110], [6, 114], [22, 107], [42, 90], [58, 64], [66, 34], [64, 6], [69, -24], [66, -60], [20, -92], [-40, -88]]));
  // body, canvas units
  def('lPonyA', taper([[402, 146], [370, 116], [320, 108], [278, 132], [252, 184], [244, 264], [250, 350], [264, 430], [254, 508]], 54, 0.6, 0, 0.2));
  def('lPonyB', taper([[396, 140], [352, 104], [298, 110], [258, 148], [232, 214], [226, 300], [234, 380], [222, 452]], 30, 0.6, 0, 0.22));
  def('lPonyC', taper([[404, 152], [372, 140], [326, 154], [300, 206], [294, 290], [304, 380], [296, 444]], 26, 0.6, 0, 0.2));
  def('lCape', S([[352, 344], [312, 362], [282, 430], [258, 520], [246, 620, 1], [384, 620, 1], [382, 470], [370, 390]]));
  def('lTorso', S([[372, 340], [428, 330], [474, 340], [490, 372], [494, 420], [482, 462], [472, 494], [484, 540], [488, 610, 1], [370, 610, 1], [374, 540], [386, 494], [372, 450], [360, 400], [360, 360]]));
  def('lArmN', S([[352, 396], [326, 414], [304, 446], [282, 474], [288, 500], [318, 520], [352, 542], [374, 554], [394, 540], [378, 520], [346, 494], [326, 478], [336, 452], [360, 424]]));
  def('lArmF', S([[476, 368], [502, 378], [514, 420], [520, 452], [550, 468], [592, 478], [606, 496], [596, 516], [552, 514], [510, 500], [488, 478], [478, 430], [468, 398]]));
  def('lPaulN', S([[364, 342], [334, 346], [312, 368], [304, 400], [314, 428], [340, 432], [370, 414], [390, 384], [392, 354]]));
  c.sil('liaSilW', [['lArmF'], ['lTorso'], ['lArmN'], ['lPaulN'], ['lHair', HEAD_T], ['lSideF', HEAD_T], ['lFace', HEAD_T]]);
  c.sil('liaSil', [['lPonyA'], ['lPonyB'], ['lPonyC'], ['lCape'], ['lArmF'], ['lTorso'], ['lArmN'], ['lPaulN'], ['lBack', HEAD_T], ['lHair', HEAD_T], ['lSideN', HEAD_T], ['lSideF', HEAD_T], ['lFace', HEAD_T]]);
  c.add(linear(`${p}-lPlate`, [[0, '#33314f'], [0.36, '#7e7ca4'], [0.6, '#cfc8de'], [0.85, '#f2d2b4'], [1, '#ffbf8a']], 'x1="0" y1="0" x2="1" y2="0"')
    + linear(`${p}-lShade`, [[0, '#120e26', 0.7], [0.45, '#120e26', 0.3], [0.7, '#120e26', 0]], 'gradientUnits="userSpaceOnUse" x1="226" y1="0" x2="470" y2="0"')
    + linear(`${p}-lWarm`, [[0, '#ff9a4a', 0], [1, '#ffb060', 0.32]], 'gradientUnits="userSpaceOnUse" x1="420" y1="300" x2="620" y2="560"'));

  let s = '';
  // ---------------------------------------------------------------- glow + rims
  s += U('liaSil', C.lia, ` opacity=".5" filter="url(#${p}-b2)"`);
  s += U('liaSil', C.lia, ' transform="translate(-4 -2)"');
  s += U('liaSilW', '#ffc890', ' opacity=".8" transform="translate(2.5 1.5)"');
  // ---------------------------------------------------------------- ponytail (gold tie at the crown)
  s += U('lPonyB', H.sh) + U('lPonyA', H.base) + U('lPonyC', H.sh);
  s += path(taper([[352, 120], [304, 126], [276, 170], [266, 250], [268, 340], [280, 420]], 24, 0.3, 0, 0.4), H.sh, ' opacity=".9"');
  s += path(taper([[370, 108], [320, 100], [282, 122]], 14, 0.2, 0, 0.5) + taper([[256, 200], [248, 262], [250, 330]], 8, 0.2, 0, 0.5) + taper([[290, 150], [272, 190]], 6, 0.2, 0, 0.5), H.hi, ' opacity=".85"');
  s += line('M304,236Q298,320 306,400M284,300Q282,380 290,456M250,300Q244,370 248,430M232,260Q228,330 232,380', H.deep, 2, ' opacity=".7"');
  s += path(taper([[392, 160], [388, 140], [400, 128]], 15, 1, 1, 0.5), C.oath) + line('M392,152L398,136', '#fff4d0', 1.6);
  // back hair + neck (head-local), behind the collar
  s += `<g transform="${HEAD_T}">${U('lBack', H.deep)}`;
  s += path(S([[-38, 70], [-34, 150], [-42, 196, 1], [46, 196, 1], [38, 150], [36, 84]]), SKIN.base);
  s += path(S([[-38, 70], [36, 84], [34, 132], [0, 142], [-36, 124]]), SKIN.sh);
  s += path(S([[-38, 100], [-34, 150], [-42, 196, 1], [-16, 196, 1], [-14, 140]]), SKIN.deep, ' opacity=".5"');
  s += '</g>';
  // ---------------------------------------------------------------- cape
  s += U('lCape', AR.redSh);
  s += path(S([[352, 344], [316, 366], [292, 436], [272, 530], [264, 620, 1], [316, 620, 1], [318, 520], [330, 440], [358, 384]]), AR.red);
  s += line('M314,392Q298,470 290,580M338,410Q330,500 330,600', '#2e0812', 3, ' opacity=".7"');
  // ---------------------------------------------------------------- far arm: rerebrace, couter, vambrace (fist drawn with the sword)
  s += U('lArmF', AR.sh);
  s += path(S([[488, 376], [504, 384], [514, 424], [518, 452], [504, 456], [494, 420]]), AR.mid);
  s += path(S([[518, 462], [552, 472], [594, 480], [606, 496], [598, 512], [552, 510], [516, 494]]), AR.base);
  s += path(S([[522, 494], [552, 504], [598, 508], [606, 498], [600, 516], [552, 516], [516, 500]]), AR.lit);
  s += line('M524,468Q560,476 596,482', AR.hi, 2, ' opacity=".8"') + line('M552,472L550,510M576,478L574,512', AR.sh, 1.6);
  s += path(S([[494, 458], [508, 446], [528, 452], [532, 474], [518, 490], [500, 484]]), AR.base) + path(S([[500, 484], [518, 490], [532, 474], [520, 476]]), AR.lit);
  s += line('M498,456Q510,446 526,452', AR.hi, 2.4);
  // ---------------------------------------------------------------- cuirass
  s += U('lTorso', `url(#${p}-lPlate)`);
  // breastplate ridge + the shadowed near half
  s += path(S([[372, 340], [420, 332], [428, 400], [426, 470], [416, 494], [386, 494], [372, 450], [360, 400], [360, 360]]), AR.mid, ' opacity=".55"');
  s += line('M432,336Q446,410 436,494', AR.hi, 2.4, ' opacity=".85"') + line('M428,338Q440,410 430,494', AR.sh, 1.6, ' opacity=".7"');
  s += path(S([[454, 356], [480, 368], [486, 404], [474, 436], [464, 402]]), '#fff6ee', ' opacity=".5"');
  // plate edges: crimson trim + gold rivets (as in her portrait)
  s += line('M366,346Q420,330 474,342', '#b8344a', 3) + line('M362,360Q356,420 372,470', AR.deep, 2, ' opacity=".7"');
  s += `<g fill="${C.oath}"><circle cx="380" cy="352" r="2.4"/><circle cx="462" cy="344" r="2.4"/><circle cx="396" cy="486" r="2.2"/><circle cx="464" cy="486" r="2.2"/></g>`;
  s += path(S([[468, 360], [486, 372], [492, 420], [482, 462], [474, 440], [480, 404]]), '#ffd2a0', ' opacity=".45"');
  // waist: red sash + faulds
  s += path('M384,494Q430,486 474,494L478,520Q430,512 380,520Z', AR.red) + line('M384,494Q430,486 474,494', C.oath, 2.2);
  s += path('M380,520Q430,512 478,520L484,556Q430,548 376,556Z', AR.mid) + path('M376,556Q430,548 484,556L488,600Q430,592 372,600Z', AR.sh);
  s += line('M380,522Q430,514 478,522M376,558Q430,550 484,558', AR.hi, 1.6, ' opacity=".7"') + line('M440,520L442,556M442,558L444,600', AR.deep, 1.6);
  // gold crystal on the sternum
  s += `<circle cx="444" cy="414" r="30" fill="${C.oath}" opacity=".3" filter="url(#${p}-b1)"/>`;
  s += path('M444,392L458,414L444,440L430,414Z', C.oath) + path('M444,392L458,414L444,440Z', '#e09038') + line('M444,398L440,414L448,424', '#fff8e0', 1.6);
  // gorget: dark-red high collar
  s += path(S([[392, 318], [438, 312], [460, 322], [458, 344], [424, 352], [390, 344], [384, 328]]), '#4a0e1c');
  s += path(S([[438, 313], [460, 322], [458, 344], [444, 348], [448, 326]]), '#7a1a2e');
  s += line('M388,326Q422,316 458,322', '#d04a5e', 2, ' opacity=".8"');
  // ---------------------------------------------------------------- near arm: elbow out, gauntlet on the hip
  s += U('lArmN', AR.sh);
  s += path(S([[344, 408], [324, 426], [304, 454], [296, 470], [312, 470], [330, 446], [352, 424]]), AR.mid);
  s += path(S([[298, 492], [330, 514], [366, 540], [390, 538], [350, 504], [316, 484]]), AR.base);
  s += line('M306,494Q336,512 370,538', AR.hi, 1.8, ' opacity=".8"') + line('M326,500L318,514M350,516L342,530', AR.deep, 1.6);
  s += path(S([[276, 470], [292, 452], [314, 460], [318, 484], [302, 502], [282, 494]]), AR.base) + path(S([[282, 494], [302, 502], [318, 484], [306, 486]]), AR.sh);
  s += line('M282,466Q294,454 310,460', AR.hi, 2.4);
  // gauntlet: back of the fist on the hip, knuckle plates
  s += path(S([[362, 528], [380, 520], [396, 528], [398, 548], [384, 558], [366, 552]]), AR.mid);
  s += path(S([[380, 520], [396, 528], [398, 548], [388, 540]]), AR.base);
  s += line('M368,534L392,532M368,544L392,544', AR.deep, 1.5);
  // near pauldron: domed cop + two lames
  s += U('lPaulN', AR.mid);
  s += path(S([[364, 342], [334, 346], [314, 366], [310, 386], [336, 378], [366, 370], [388, 368], [392, 354]]), AR.base);
  s += line('M322,360Q344,346 380,348', AR.hi, 3) + line('M308,396Q330,388 362,376', '#b8344a', 2.6) + `<g fill="${C.oath}"><circle cx="322" cy="392" r="2.2"/><circle cx="346" cy="384" r="2.2"/></g>`;
  s += path(S([[308, 408], [304, 424], [318, 440], [346, 438], [370, 420], [346, 424], [322, 422]]), AR.sh);
  s += line('M310,404Q336,412 372,396M306,424Q330,432 362,418', AR.deep, 2);
  // far pauldron
  s += path(S([[460, 334], [490, 336], [508, 356], [510, 388], [494, 396], [480, 368]]), AR.base);
  s += path(S([[488, 340], [506, 356], [510, 388], [498, 380]]), AR.lit);
  s += line('M464,338Q490,334 504,350', AR.hi, 2.4);
  // ---------------------------------------------------------------- head (front)
  s += `<g transform="${HEAD_T}">${head(c)}</g>`;
  // ---------------------------------------------------------------- light: cool shade on the back half, warm lamp spill on the front
  s += `<g clip-path="url(#${p}-liaSilC)"><rect x="200" y="100" width="440" height="520" fill="url(#${p}-lShade)"/><rect x="200" y="100" width="440" height="520" fill="url(#${p}-lWarm)"/></g>`;
  return s;
}

function head(c) {
  const { p, U } = c;
  let s = '';
  // face + cel shadows
  s += U('lFace', SKIN.base, ` stroke="${SKIN.line}" stroke-width="2"`);
  s += path(S([[-72, -44], [-75, -10], [-73, 22], [-66, 52], [-52, 78], [-31, 98], [-12, 108], [-32, 84], [-46, 58], [-54, 28], [-54, -6], [-60, -40]]), SKIN.sh);
  s += path(S([[-70, -50], [-40, -32], [-6, -38], [30, -32], [66, -40], [66, -62], [0, -74], [-62, -66]]), SKIN.sh, ' opacity=".75"');
  s += path(S([[44, 34], [62, 38], [56, 64], [40, 86], [22, 102], [32, 78], [40, 58]]), SKIN.lit, ' opacity=".7"');
  s += `<ellipse cx="-42" cy="44" rx="16" ry="7" fill="${SKIN.blush}" opacity=".3"/><ellipse cx="44" cy="46" rx="12" ry="6" fill="${SKIN.blush}" opacity=".3"/>`;
  s += line('M-62,18L-53,31M-58,15L-50,27', '#b0606a', 1.6, ' opacity=".8"');
  // eyes on the captain
  s += `<g transform="translate(-28 2)">${eye({ w: 43, h: 30, gaze: [-0.3, 0.2], iris: ['#6a2a0c', '#f2aa3c'], ink: '#2a0e18', skinSh: SKIN.sh, clip: `${p}-eL1` })}</g>`;
  s += `<g transform="translate(32 2)">${eye({ w: 35, h: 29, flip: true, gaze: [-0.42, 0.2], iris: ['#6a2a0c', '#f2aa3c'], ink: '#2a0e18', skinSh: SKIN.sh, clip: `${p}-eL2` })}</g>`;
  const brows = path(taper([[-54, -25], [-36, -31], [-13, -22]], 4.6, 0.4, 0.2, 0.4), '#5a0e1e') + path(taper([[13, -22], [32, -31], [50, -26]], 4.2, 0.4, 0.2, 0.6), '#5a0e1e');
  s += brows;
  // nose + speaking mouth
  s += path('M18,30Q25,40 22,47Q17,49 13,47Q21,43 18,30Z', SKIN.sh) + path(taper([[22, 41], [24, 46], [16, 49]], 2.2, 0.3, 0.2, 0.5, 1), SKIN.line);
  s += path(S([[-2, 71, 1], [14, 69], [29, 71, 1], [22, 77], [13, 78], [4, 76]]), '#6a1e2a');
  s += path(S([[8, 76], [14, 74], [21, 76], [14, 77.5]]), '#c85a66');
  s += path(taper([[-5, 72], [14, 68.5], [31, 71]], 2.6, 0.3, 0.3, 0.5, 1), SKIN.line);
  // hair cap + fringe
  s += U('lHair', H.base);
  // lock shading: darker left edge of every fringe lock + separation strokes up into the crown
  const tips = [[74, 16, 60, -44], [48, -4, 28, -48], [4, 20, -6, -42], [-14, -6, -22, -46], [-31, 4, -44, -48], [-58, 12, -70, -42], [-98, 24, -102, -20]];
  let sh = '', sep = '';
  for (const [tx, ty, nx, ny] of tips) {
    sh += taper([[nx, ny], [(nx + tx) / 2 - 2, (ny + ty) / 2], [tx, ty]], 9, 0.9, 0, 0.3);
    sep += taper([[nx * 0.7, -112], [nx * 0.9, (ny - 112) / 2 + 4], [nx, ny]], 3.4, 0.1, 0.2, 0.7);
  }
  s += path(sh, H.sh, ' opacity=".85"') + path(sep, H.deep, ' opacity=".6"');
  s += path(taper([[-30, -100], [-28, -40], [-22, 14]], 7, 0.8, 0, 0.3) + taper([[56, -100], [60, -40], [58, 22]], 6, 0.8, 0, 0.3), H.base);
  s += path(taper([[58, -128], [68, -84], [66, -40], [56, -8]], 12, 0.1, 0, 0.4), H.streak);
  s += path(taper([[-78, -112], [-36, -136], [16, -138], [62, -118]], 11, 0, 0, 0.5), H.hi, ' opacity=".85"');
  // side locks
  s += U('lSideN', H.base) + path(taper([[-78, -50], [-84, 30], [-80, 110], [-88, 190], [-86, 246]], 13, 0.8, 0, 0.3), H.sh);
  s += U('lSideF', H.base) + path(taper([[84, -30], [92, 40], [90, 110], [94, 160]], 7, 0.1, 0, 0.4), H.lit, ' opacity=".8"');
  s += `<g opacity=".45">${brows}</g>`;
  return s;
}

// sword + left fist: drawn after the table top (the pommel strikes it)
export function liaSword(c) {
  const { p } = c;
  c.add(linear(`${p}-lScab`, [[0, '#2a141c'], [0.5, '#5a2c3a'], [1, '#1a0a10']], 'x1="0" y1="0" x2="1" y2="0"'));
  let s = '';
  s += path('M602,176L612,176L618,486L596,486Z', `url(#${p}-lScab)`);
  s += line('M605,184L607,480', '#b06a7a', 1.4, ' opacity=".6"');
  s += path('M599,168h16l-3,12h-10z', C.brass) + path('M597,300h20v8h-20zM596,420h22v8h-22z', C.brass);
  // ring guard, grip, pommel
  s += path('M598,532h13v52h-13z', '#2a1418') + line('M599,540h11M599,550h11M599,560h11M599,570h11', '#6a4a30', 1.4);
  s += `<circle cx="604" cy="528" r="15" fill="none" stroke="${C.brassHi}" stroke-width="4"/><path d="M588,528H620" stroke="${C.brass}" stroke-width="4"/>`;
  s += `<circle cx="604" cy="594" r="10" fill="${C.brass}"/><circle cx="601" cy="591" r="3.5" fill="#fff4d6"/>`;
  // gauntleted fist around the scabbard (thumb wrapped over the fingers)
  s += path(S([[586, 486], [606, 480], [624, 486], [628, 510], [620, 522], [594, 524], [584, 512]]), AR.base);
  s += path(S([[608, 482], [624, 486], [628, 510], [620, 520], [616, 500]]), AR.lit);
  s += line('M590,496Q608,492 624,496M588,507Q608,503 626,507M590,517Q606,514 622,517', AR.sh, 1.7);
  s += path(S([[584, 488], [576, 498], [580, 514], [594, 512], [596, 496]]), AR.mid) + line('M580,500Q590,494 598,498', AR.hi, 1.4);
  // impact on the cloth
  s += `<ellipse cx="604" cy="606" rx="30" ry="6" fill="#3a2414" opacity=".35"/>`;
  s += line('M572,602l-22,-6M570,610l-26,4M584,616l-10,14M636,600l24,-8M638,610l24,8M624,618l10,14', '#fff3d6', 2.6, ' opacity=".9"');
  // her black coffee jumping from the knock
  s += `<g transform="translate(528 632) rotate(-14)"><path d="M-14,0H14L11,22H-11Z" fill="#f4ede4"/><path d="M14,5Q22,8 18,16" fill="none" stroke="#f4ede4" stroke-width="2.5"/><ellipse rx="14" ry="3.4" fill="#3a1e10"/></g>`;
  s += path('M520,616q-4,-14 4,-22q2,10 -4,22zM536,612q2,-12 10,-16q-2,10 -10,16z', '#4a2a16') + `<circle cx="516" cy="590" r="3" fill="#4a2a16"/><circle cx="548" cy="592" r="2.4" fill="#4a2a16"/>`;
  return s;
}
