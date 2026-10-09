// aftermath-snow.svg 「记忆之雪」 — Lia refinement pass.
// The scene itself is still painted by finale-aftermath-snow.mjs (unchanged); this module renders
// it, lifts out the old flat Lia and splices in a repainted one: near-profile, head bowed over the
// memory fragment cupped in her raised left gauntlet, rapier lowered in the right hand, ponytail and
// cape falling down her back. Lit like the camp-fire repaint: cool moonlight from the torn roof
// (upper left), warm fragment light from below-front, crimson rim on the back edges.
import * as FL from './finale-lib.mjs';
import aftermathSnow from './finale-aftermath-snow.mjs';
import { smooth, taper, path, line, linear, radial, eye, context } from './polish-lib.mjs';

const p = 'aftermathSnow';
const S = (P) => smooth(P, true);

export function aftermathSnowPolished({ withLia = true } = {}) {
  const src = aftermathSnow(FL);
  // ---- lift out the old Lia: her silhouette group in <defs> and her body markup
  const g0 = src.indexOf(`<g id="${p}-lia">`), g1 = src.indexOf(`<radialGradient id="${p}-frag"`);
  const b0 = src.indexOf(`<use href="#${p}-lia"`), b1 = src.indexOf(`<g filter="url(#${p}-b1)">`, b0);
  if (g0 < 0 || g1 < g0 || b0 < 0 || b1 < b0) throw new Error('aftermath-snow: Lia markers not found — finale-aftermath-snow.mjs changed, update polish-aftermath-lia.mjs');
  const c = context(p);
  const body = withLia ? lia(c) : '';
  const d1 = src.indexOf('</defs>');
  return src.slice(0, g0) + src.slice(g1, d1) + c.defs + src.slice(d1, b0) + body + src.slice(b1);
}


const C = { lia: '#ff6b7c', oath: '#ffd091', moon: '#e8ddff', frag: '#ffd8a8' };
const SK = { base: '#e6beb2', warm: '#ffd6b6', sh: '#9c6c7e', deep: '#5c3a50', line: '#4a2232', blush: '#e0808a' };
const H = { base: '#a82438', sh: '#5c1426', deep: '#340a14', moon: '#e0a4bc', hi: '#ff8a98' };
const AR = { base: '#4c4a70', moon: '#c6c0e6', hi: '#f4f0ff', warm: '#f2b48e', sh: '#2c2a42', deep: '#16141f', red: '#7a1a2c', redSh: '#3a0a14' };
const HEAD_T = 'translate(1122 298) scale(.58) rotate(-12)';

function lia(c) {
  const { def, U } = c;
  // ---------------------------------------------------------------- shapes
  def('lHair', S([[-68, 10], [-78, -60], [-52, -132], [8, -168], [70, -156], [106, -112], [114, -40], [106, 30], [80, 44], [70, 6, 1], [62, -30], [50, -50, 1], [42, -26], [34, -12, 1], [24, -32], [14, -52, 1], [6, -30], [-2, -14, 1], [-8, -30], [-14, -50, 1], [-22, -30], [-30, -10, 1], [-36, -30], [-44, -46, 1], [-52, -20], [-58, 10, 1], [-64, -8]]));
  def('lFace', S([[-62, -62], [-64, -30], [-58, -6], [-62, 18], [-56, 46], [-44, 74], [-30, 96], [-16, 110], [-4, 114], [14, 110], [34, 96], [56, 72], [70, 40], [76, 0], [74, -40], [60, -80], [10, -96], [-40, -90]]));
  def('lSideN', taper([[72, -50], [84, 30], [82, 120], [90, 210]], 30, 0.9, 0, 0.22));
  def('lSideF', taper([[-62, -40], [-70, 30], [-68, 110], [-76, 180]], 22, 0.9, 0, 0.22));
  def('lPony', taper([[1137, 192], [1172, 158], [1218, 166], [1244, 210], [1254, 300], [1250, 400], [1262, 500], [1252, 604]], 58, 0.6, 0, 0.18));
  def('lPony2', taper([[1140, 186], [1186, 150], [1236, 164], [1266, 214], [1276, 300], [1272, 390], [1286, 470]], 30, 0.5, 0, 0.25));
  def('lCape', S([[1150, 398], [1196, 404], [1226, 430], [1250, 500], [1280, 600], [1310, 720], [1336, 840], [1350, 920, 1], [1176, 920, 1], [1194, 800], [1204, 680], [1208, 560], [1198, 460], [1174, 420]]));
  def('lTorso', S([[1104, 392], [1150, 396], [1190, 414], [1206, 470], [1200, 530], [1192, 566], [1206, 640, 1], [1078, 640, 1], [1090, 566], [1080, 520], [1068, 474], [1078, 428]]));
  def('lLegs', S([[1088, 636], [1206, 636], [1208, 720], [1204, 800], [1206, 920, 1], [1090, 920, 1], [1096, 800], [1092, 720]]));
  def('lArmF', S([[1090, 410], [1102, 450], [1096, 520], [1084, 580], [1076, 610], [1056, 606], [1062, 560], [1068, 500], [1070, 440]]));
  def('lArmN', S([[1178, 416], [1186, 456], [1150, 506], [1112, 528], [1060, 496], [1010, 466], [978, 452], [986, 428], [1018, 436], [1068, 462], [1110, 476], [1138, 444], [1150, 418]]));
  def('lPaul', S([[1144, 402], [1176, 400], [1200, 420], [1206, 452], [1188, 470], [1158, 466], [1140, 440]]));
  c.sil('liaSil', [['lPony2'], ['lPony'], ['lCape'], ['lLegs'], ['lTorso'], ['lArmF'], ['lHair', HEAD_T], ['lSideN', HEAD_T], ['lSideF', HEAD_T], ['lFace', HEAD_T], ['lArmN'], ['lPaul']]);
  c.add(linear(`${p}-lMoon`, [[0, '#d8d0f4', 0.4], [0.5, '#a89ed8', 0.1], [1, '#a89ed8', 0]], 'gradientUnits="userSpaceOnUse" x1="1000" y1="330" x2="1240" y2="640"')
    + linear(`${p}-lDark`, [[0, '#0a0814', 0], [0.5, '#0a0814', 0.25], [1, '#0a0814', 0.7]], 'gradientUnits="userSpaceOnUse" x1="1060" y1="0" x2="1360" y2="0"')
    + radial(`${p}-lWarm`, [[0, '#ffc890', 0.55], [0.4, '#ffa868', 0.18], [1, '#ff9050', 0]], 'gradientUnits="userSpaceOnUse" cx="955" cy="420" r="300"')
    + linear(`${p}-lLow`, [[0, '#08060f', 0], [1, '#08060f', 0.62]], 'gradientUnits="userSpaceOnUse" x1="0" y1="600" x2="0" y2="900"')
    + linear(`${p}-lPlate`, [[0, '#e2dcf6'], [0.35, '#8e88b8'], [0.7, '#4a4868'], [1, '#2a283e']], 'x1="0" y1="0" x2="1" y2="0.4"'));

  let s = '';
  // ---------------------------------------------------------------- glow + rims: crimson on the back edges, moonlight on the top/front
  s += U('liaSil', C.lia, ` opacity=".4" filter="url(#${p}-b2)"`);
  s += U('liaSil', C.lia, ' transform="translate(5 -1)"');
  s += U('liaSil', C.moon, ' opacity=".55" transform="translate(-3 -3)"');
  // ---------------------------------------------------------------- ponytail + cape (behind)
  s += U('lPony2', H.sh) + U('lPony', H.base);
  s += path(taper([[1180, 162], [1226, 176], [1246, 230], [1252, 320], [1248, 420], [1258, 520]], 22, 0.3, 0, 0.4), H.sh);
  s += path(taper([[1150, 180], [1186, 156], [1222, 162]], 12, 0.2, 0, 0.5) + taper([[1240, 230], [1244, 300]], 7, 0.2, 0, 0.5), H.moon, ' opacity=".8"');
  s += line('M1226,250Q1232,340 1228,430M1236,300Q1244,400 1240,500M1264,260Q1272,340 1268,420', H.deep, 2, ' opacity=".7"');
  s += U('lCape', AR.redSh);
  s += path(S([[1196, 404], [1226, 430], [1250, 500], [1280, 600], [1310, 720], [1336, 840], [1350, 920, 1], [1300, 920, 1], [1284, 800], [1258, 680], [1236, 560], [1216, 470]]), AR.red);
  s += line('M1232,520Q1252,640 1276,760M1214,560Q1226,700 1236,860M1260,480Q1290,600 1318,740', '#1e050a', 3, ' opacity=".7"');
  s += line('M1252,500Q1284,610 1314,730Q1332,820 1348,918', C.lia, 3, ' opacity=".8"');
  // ---------------------------------------------------------------- legs: cuisses, poleyns, greaves
  s += U('lLegs', AR.sh);
  s += path(S([[1090, 640], [1150, 640], [1146, 740], [1134, 840], [1128, 920, 1], [1070, 920, 1], [1080, 840], [1088, 740]]), AR.base);
  s += path(S([[1090, 640], [1106, 640], [1102, 740], [1092, 840], [1084, 920, 1], [1070, 920, 1], [1080, 840], [1088, 740]]), AR.moon, ' opacity=".55"');
  s += line('M1090,700Q1120,692 1148,700M1086,770Q1114,762 1142,770', AR.deep, 2.2) + line('M1090,704Q1120,696 1148,704M1086,774Q1114,766 1142,774', AR.moon, 1.4, ' opacity=".6"');
  s += line('M1150,644Q1146,780 1130,920', AR.deep, 2) + line('M1172,650Q1180,780 1176,920', AR.base, 2, ' opacity=".5"');
  // ---------------------------------------------------------------- far arm: hangs at her side, rapier lowered
  s += U('lArmF', AR.sh) + path(S([[1076, 440], [1088, 444], [1084, 520], [1072, 600], [1062, 598], [1068, 520]]), AR.moon, ' opacity=".5"');
  // ---------------------------------------------------------------- cuirass
  s += U('lTorso', `url(#${p}-lPlate)`);
  s += path(S([[1150, 396], [1190, 414], [1206, 470], [1200, 530], [1192, 566], [1206, 640, 1], [1150, 640, 1], [1160, 566], [1170, 500], [1166, 440]]), AR.sh, ' opacity=".8"');
  s += line('M1098,404Q1080,450 1084,520Q1088,560 1094,566', AR.hi, 2, ' opacity=".7"');
  s += path('M1088,560Q1140,552 1194,562L1198,586Q1140,576 1086,584Z', '#3a2430') + line('M1088,566H1194', C.oath, 3, ' opacity=".8"');
  s += path('M1084,590Q1140,582 1200,592L1206,640H1078Z', AR.base) + line('M1110,592L1108,640M1140,588L1140,640M1170,590L1172,640', AR.deep, 2.4) + line('M1084,594Q1140,586 1200,596', AR.moon, 1.6, ' opacity=".7"');
  s += path('M1108,470l11,-16l11,16l-11,18z', C.oath) + `<circle cx="1119" cy="471" r="22" fill="url(#${p}-frag)" opacity=".5"/>`;
  // gorget
  s += path(S([[1100, 380], [1144, 380], [1158, 396], [1150, 414], [1104, 414], [1094, 398]]), '#3a0c18') + line('M1098,392Q1126,386 1156,394', '#c03a50', 2, ' opacity=".8"');
  // ---------------------------------------------------------------- head
  s += `<g transform="${HEAD_T}">${head(c)}</g>`;
  // ---------------------------------------------------------------- near arm raised: rerebrace, couter, vambrace, cupped gauntlet
  s += U('lArmN', AR.base);
  s += path(S([[1112, 528], [1060, 496], [1010, 466], [978, 452], [984, 442], [1016, 452], [1064, 478], [1112, 504], [1144, 494]]), AR.warm, ' opacity=".5"') + line('M988,448Q1040,470 1100,506', '#ffe2c8', 1.6, ' opacity=".7"');
  s += line('M1018,436Q1060,456 1108,476', AR.hi, 2, ' opacity=".7"') + line('M1040,446L1030,476M1074,466L1064,494', AR.deep, 2);
  s += path(S([[1100, 500], [1118, 482], [1142, 488], [1150, 512], [1132, 530], [1108, 526]]), AR.base) + path(S([[1108, 526], [1132, 530], [1150, 512], [1132, 518]]), AR.warm, ' opacity=".45"') + line('M1104,494Q1120,482 1140,488', AR.moon, 2);
  // gauntlet: palm up, fingers curling toward the fragment (about to close)
  s += path(S([[990, 430], [976, 424], [958, 428], [940, 426], [926, 418], [918, 422], [926, 434], [944, 442], [966, 448], [986, 452]]), AR.base);
  s += path(S([[986, 452], [966, 448], [944, 442], [926, 434], [930, 446], [948, 454], [972, 458]]), AR.warm);
  s += path(taper([[944, 428], [930, 420], [922, 408], [926, 398]], 10, 0.9, 0.5, 0.3), AR.base) + path(taper([[960, 430], [952, 418], [952, 406]], 9, 0.9, 0.5, 0.3), AR.base);
  s += line('M930,422l-6,-12M952,418l-1,-10M940,428l6,-2M960,432l8,2', AR.deep, 1.5);
  s += path(taper([[984, 432], [972, 418], [976, 404]], 10, 0.9, 0.6, 0.3), AR.base) + line('M976,418l2,-12', AR.hi, 1.5);
  s += line('M920,424Q944,438 984,446', AR.hi, 1.4, ' opacity=".6"');
  // near pauldron (moonlit top, crimson trim)
  s += U('lPaul', AR.base) + path(S([[1144, 402], [1176, 400], [1200, 420], [1172, 418], [1148, 426]]), AR.moon) + line('M1146,440Q1170,452 1204,450', '#b8344a', 2.6) + line('M1150,404Q1176,398 1198,416', AR.hi, 2.2);
  // ---------------------------------------------------------------- the rapier, point down, ring guard in her right fist
  s += path('M1060,616L1068,620L962,920L950,920Z', '#a8a2c8') + line('M1064,618L956,920', '#f4f0ff', 1.4, ' opacity=".8"');
  s += `<circle cx="1066" cy="606" r="13" fill="none" stroke="${C.oath}" stroke-width="3.5"/>`;
  s += path(S([[1056, 590], [1072, 586], [1082, 598], [1078, 614], [1062, 616], [1054, 606]]), AR.base) + line('M1058,596L1078,598M1056,606L1076,608', AR.deep, 1.4);
  s += `<circle cx="1072" cy="582" r="5" fill="${C.oath}"/>`;
  // ---------------------------------------------------------------- light: moon from the roof hole, warm from the fragment, dark on the back
  s += `<g clip-path="url(#${p}-liaSilC)"><rect x="900" y="372" width="480" height="560" fill="url(#${p}-lMoon)"/><rect x="900" y="150" width="480" height="780" fill="url(#${p}-lDark)"/><rect x="900" y="150" width="480" height="780" fill="url(#${p}-lWarm)"/><rect x="900" y="600" width="480" height="330" fill="url(#${p}-lLow)"/></g>`;
  // ---------------------------------------------------------------- the fragment of someone's memory, resting in the gauntlet
  s += `<circle cx="950" cy="414" r="120" fill="url(#${p}-frag)" opacity=".85"/>`;
  s += `<use href="#${p}-sh1" transform="translate(950 412) rotate(-30) scale(.3)"/>`;
  s += `<use href="#${p}-v4" transform="translate(945 406) scale(.5)"/>`;
  s += `<circle cx="950" cy="412" r="5" fill="#fff6ea"/>`;
  return s;
}

function head(c) {
  const { U } = c;
  let s = '';
  // far side lock (behind the face) + face
  s += U('lSideF', H.sh);
  s += U('lFace', SK.base, ` stroke="${SK.line}" stroke-width="2"`);
  // shading: moonlit brow/nose bridge, warm under-light from the fragment, shadow on the near (back) side
  s += path(S([[76, -20], [76, 0], [70, 40], [56, 72], [34, 96], [14, 110], [26, 84], [42, 54], [50, 20], [52, -16]]), SK.sh);
  s += path(S([[-64, -50], [-30, -40], [0, -48], [40, -40], [72, -48], [70, -74], [10, -86], [-56, -74]]), SK.sh, ' opacity=".75"');
  s += path(S([[-60, 30], [-56, 48], [-44, 74], [-30, 96], [-16, 108], [-4, 112], [-10, 96], [-24, 80], [-38, 58], [-50, 36]]), SK.warm);
  s += `<ellipse cx="-34" cy="42" rx="10" ry="6" fill="${SK.blush}" opacity=".35"/><ellipse cx="30" cy="44" rx="15" ry="7" fill="${SK.blush}" opacity=".3"/>`;
  s += line('M44,16L52,28M47,13L54,24', '#9a5060', 1.6, ' opacity=".8"');
  // eyes lowered to the fragment
  s += `<g transform="translate(-38 4)">${eye({ w: 24, h: 24, lid: 0.5, gaze: [-0.4, 0.7], iris: ['#5a2408', '#f0a440'], ink: '#24080e', skinSh: SK.sh, clip: `${p}-eA1`, lash: 0.8 })}</g>`;
  s += `<g transform="translate(14 4)">${eye({ w: 40, h: 28, flip: true, lid: 0.5, gaze: [-0.45, 0.7], iris: ['#5a2408', '#f0a440'], ink: '#24080e', skinSh: SK.sh, clip: `${p}-eA2` })}</g>`;
  // sorrowful brows (inner ends raised)
  s += path(taper([[-58, -20], [-46, -27], [-30, -33]], 4, 0.4, 0.2, 0.5) + taper([[-8, -34], [14, -30], [40, -22]], 4.4, 0.4, 0.2, 0.4), '#4a0c1a');
  // nose + pressed lips
  s += path('M-40,26Q-46,38-47,44Q-43,47-37,46Q-42,40-40,26Z', SK.sh, ' opacity=".45"') + path(taper([[-46, 40], [-49, 45], [-40, 48]], 2.2, 0.3, 0.2, 0.5, 1), SK.line);
  s += path(taper([[-38, 74], [-26, 72], [-12, 75]], 2.6, 0.3, 0.3, 0.5, 1), SK.line) + path('M-32,80Q-24,84-16,80Q-24,82-32,80Z', SK.sh, ` stroke="${SK.sh}" stroke-width="2"`);
  // hair cap + fringe
  s += U('lHair', H.base);
  const tips = [[70, 6, 50, -50], [34, -12, 14, -52], [-2, -14, -14, -50], [-30, -10, -44, -46], [-58, 10, -68, -20]];
  let sh = '', sep = '';
  for (const [tx, ty, nx, ny] of tips) {
    sh += taper([[nx, ny], [(nx + tx) / 2 + 3, (ny + ty) / 2], [tx, ty]], 9, 0.9, 0, 0.3);
    sep += taper([[nx * 0.6 + 20, -124], [nx * 0.85 + 6, (ny - 124) / 2], [nx, ny]], 3.4, 0.1, 0.2, 0.7);
  }
  s += path(sh, H.sh, ' opacity=".85"') + path(sep, H.deep, ' opacity=".6"');
  s += path(taper([[-6, -40], [-10, -8], [-6, 18]], 6, 0.6, 0, 0.3), H.base);
  s += path(taper([[-60, -110], [-16, -146], [40, -150], [90, -124]], 11, 0, 0, 0.5), H.moon, ' opacity=".8"');
  s += path(taper([[60, -130], [76, -80], [74, -30]], 11, 0.1, 0, 0.4), '#4a0c1a');
  // near side lock over the ear
  s += U('lSideN', H.base) + path(taper([[78, -30], [88, 50], [86, 130], [90, 190]], 9, 0.4, 0, 0.3), H.sh);
  s += path(taper([[-56, -20], [-64, 40], [-62, 110]], 6, 0.4, 0, 0.3), H.moon, ' opacity=".6"');
  return s;
}
