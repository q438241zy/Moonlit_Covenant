// Mia for camp-fire.svg — hunched over the table in her oversized jacket, screwdriver in the open
// hatch of her sphere drone Zero, peeking up at the captain with a guilty grin
// ("你也不会告诉她的对吧？"). Sleeves swallow her hands to the knuckles.
// Head drawn in local units (origin = between the eyes), placed by HEAD_T.
import { smooth, taper, path, line, linear, radial, eye } from './polish-lib.mjs';

const S = (P) => smooth(P, true);
const C = { mia: '#5ed7ff', orange: '#ff9a3c', lamp: '#ffc670' };
const SKIN = { base: '#f8dccc', lit: '#fff2e6', sh: '#d6a49c', deep: '#9a6a78', line: '#6a3440', blush: '#f2908e' };
const H = { base: '#2c9ad2', sh: '#175f92', deep: '#0c3a62', hi: '#8ce8ff', tip: '#7ff4ff' };
const J = { base: '#383c48', sh: '#1e2028', deep: '#121318', lit: '#5a6070', warm: '#6a5a50' };
const T = { base: '#9aa4b6', sh: '#566074', hi: '#e2e8f4', in: '#1a2434' };
const HEAD_T = 'translate(1210 456) scale(.52) rotate(-17)';

export function mia(c) {
  const { p, def, U } = c;
  // ---------------------------------------------------------------- shapes
  def('mHair', S([[-96, 10], [-104, -60], [-80, -124], [-20, -156], [44, -150], [92, -112], [108, -44], [106, 30], [96, 84, 1], [88, 44], [80, 70, 1], [74, 30], [64, 52, 1], [62, 10], [50, -26, 1], [44, 0], [34, 22, 1], [28, -20], [16, -40, 1], [8, -14], [-4, 14, 1], [-8, -24], [-20, -44, 1], [-28, -16], [-40, 10, 1], [-44, -20], [-56, -34, 1], [-66, 0], [-76, 40, 1], [-84, 10], [-92, 60, 1]]));
  def('mFace', S([[-64, -50], [-70, -12], [-66, 22], [-56, 52], [-40, 78], [-20, 96], [-2, 106], [12, 104], [32, 92], [52, 70], [64, 42], [70, 10], [70, -24], [64, -60], [10, -90], [-40, -86]]));
  // oversized hoodie, hunched forward-left over the drone; hood bunched behind the neck
  def('mJacket', S([[1170, 482], [1236, 482], [1300, 480], [1350, 504], [1380, 552], [1394, 640, 1], [1096, 640, 1], [1102, 580], [1118, 528], [1142, 498]]));
  def('mHood', S([[1172, 470], [1222, 452], [1286, 456], [1324, 482], [1306, 504], [1240, 496], [1182, 494], [1160, 482]]));
  def('mArmF', S([[1150, 498], [1124, 522], [1104, 556], [1086, 588], [1064, 602], [1048, 616], [1060, 632], [1092, 626], [1118, 606], [1142, 574], [1172, 530]]));
  def('mArmN', S([[1324, 506], [1352, 548], [1358, 600], [1344, 640], [1300, 660], [1230, 672], [1158, 676], [1124, 666], [1128, 640], [1196, 628], [1256, 616], [1288, 594], [1294, 552], [1300, 520]]));
  def('mEarN', S([[-26, -132, 1], [-8, -214, 1], [40, -150, 1]]));
  def('mEarF', S([[56, -124, 1], [96, -196, 1], [104, -104, 1]]));
  c.sil('miaSil', [['mHood'], ['mJacket'], ['mArmF'], ['mEarF', HEAD_T], ['mHair', HEAD_T], ['mEarN', HEAD_T], ['mFace', HEAD_T]]);
  c.add(linear(`${p}-mShade`, [[0, '#ffb070', 0.18], [0.35, '#ffb070', 0], [0.55, '#06080e', 0], [1, '#06080e', 0.6]], 'gradientUnits="userSpaceOnUse" x1="1080" y1="0" x2="1390" y2="0"')
    + radial(`${p}-mCyan`, [[0, C.mia, 0.6], [0.4, C.mia, 0.22], [1, C.mia, 0]]));

  let s = '';
  // ---------------------------------------------------------------- glow + rims (cyan on the right/back, warm on the left)
  s += U('miaSil', C.mia, ` opacity=".55" filter="url(#${p}-b2)"`);
  s += U('miaSil', C.mia, ' transform="translate(4 -2)"');
  s += U('miaSil', '#ffc890', ' opacity=".7" transform="translate(-2.5 1)"');
  // ---------------------------------------------------------------- hoodie body
  s += U('mJacket', J.base);
  s += path(S([[1300, 480], [1350, 504], [1380, 552], [1394, 640, 1], [1316, 640, 1], [1322, 566], [1306, 512]]), J.sh);
  s += path(S([[1142, 498], [1170, 484], [1196, 488], [1166, 540], [1146, 640, 1], [1096, 640, 1], [1102, 580], [1118, 528]]), J.lit, ' opacity=".75"');
  // seams + cyan piping + chest pocket with a pen
  s += line('M1350,506Q1380,556 1390,636', C.mia, 2.4, ' opacity=".9"') + line('M1196,504Q1214,560 1214,640', C.mia, 1.6, ' opacity=".55"');
  s += line('M1252,500L1256,640', '#14151a', 2.2) + line('M1255,500L1259,640', '#7a8090', 1, ' opacity=".6"');
  s += path('M1268,548h40l-2,34h-36z', J.sh) + line('M1268,548h40', C.mia, 1.4, ' opacity=".6"') + line('M1278,550l4,-22', C.orange, 3);
  s += line('M1158,560Q1176,566 1196,560M1150,600Q1172,608 1196,600', J.deep, 1.6, ' opacity=".5"');
  s += U('mHood', J.sh) + line('M1178,466Q1230,446 1294,460', J.lit, 2, ' opacity=".8"') + line('M1190,480Q1240,470 1300,484', J.deep, 2, ' opacity=".7"');
  // high open collar + drawstrings
  s += path(S([[1188, 474], [1234, 478], [1258, 494], [1244, 524], [1214, 516], [1190, 502]]), J.lit);
  s += path(S([[1210, 488], [1234, 490], [1230, 516], [1214, 512]]), '#101116');
  s += line('M1216,504V536M1232,506V530', '#c8ccd6', 1.4) + `<rect x="1213" y="534" width="6" height="9" rx="2" fill="${C.orange}"/><rect x="1229" y="528" width="6" height="9" rx="2" fill="${C.orange}"/>`;
  // neck (head-local) peeking from the collar
  s += `<g transform="${HEAD_T}">${path(S([[-30, 76], [-26, 130], [26, 136], [30, 84]]), SKIN.sh)}</g>`;
  // ---------------------------------------------------------------- head
  s += `<g transform="${HEAD_T}">${head(c)}</g>`;
  // ---------------------------------------------------------------- light wash
  s += `<g clip-path="url(#${p}-miaSilC)"><rect x="1070" y="300" width="330" height="360" fill="url(#${p}-mShade)"/></g>`;
  return s;
}

function head(c) {
  const { p, U } = c;
  let s = '';
  // far cat-ear receiver (behind the hair)
  s += U('mEarF', T.sh) + path(S([[66, -122, 1], [92, -178, 1], [97, -110, 1]]), T.in) + line('M74,-126L88,-162M86,-122L92,-148', C.mia, 2.4) + line('M56,-124L96,-196L104,-104', '#2a3240', 2.5);
  s += line('M96,-194L110,-234', '#a9b3c4', 3) + `<circle cx="111" cy="-238" r="6" fill="${C.orange}"/><circle cx="111" cy="-238" r="13" fill="${C.orange}" opacity=".3"/>`;
  // face, lit from the lamp (screen left) and the drone below
  s += U('mFace', SKIN.base, ` stroke="${SKIN.line}" stroke-width="2"`);
  s += path(S([[70, -30], [70, 10], [64, 42], [52, 70], [32, 92], [14, 102], [30, 76], [44, 48], [52, 14], [54, -24]]), SKIN.sh);
  s += path(S([[-64, -44], [-30, -30], [0, -40], [36, -30], [68, -40], [64, -64], [0, -80], [-58, -70]]), SKIN.sh, ' opacity=".7"');
  s += path(S([[-60, 20], [-66, 26], [-56, 52], [-40, 76], [-24, 90], [-34, 66], [-48, 44]]), SKIN.lit);
  s += `<ellipse cx="-36" cy="42" rx="15" ry="7" fill="${SKIN.blush}" opacity=".45"/><ellipse cx="40" cy="42" rx="14" ry="7" fill="${SKIN.blush}" opacity=".45"/>`;
  s += line('M-44,38l-4,8M-36,38l-4,8M32,38l-4,8M40,38l-4,8', '#d0707a', 1.4, ' opacity=".5"');
  // big cyan eyes peeking up at the captain
  s += `<g transform="translate(-28 2)">${eye({ w: 44, h: 33, gaze: [-0.2, -0.75], iris: ['#0c5a86', '#4fd6ff'], ink: '#14223a', skinSh: SKIN.sh, clip: `${p}-eM1`, irisK: 1.05 })}</g>`;
  s += `<g transform="translate(32 2)">${eye({ w: 40, h: 32, flip: true, gaze: [-0.35, -0.75], iris: ['#0c5a86', '#4fd6ff'], ink: '#14223a', skinSh: SKIN.sh, clip: `${p}-eM2`, irisK: 1.05 })}</g>`;
  // raised, guilty brows
  s += path(taper([[-50, -30], [-32, -38], [-12, -36]], 3.8, 0.3, 0.2, 0.5) + taper([[12, -36], [32, -38], [50, -30]], 3.6, 0.3, 0.2, 0.5), '#0e3f66', ' opacity=".85"');
  // nose + guilty grin (one corner up)
  s += path('M-8,34Q-14,42-11,47Q-6,49-2,48Q-9,43-8,34Z', SKIN.sh) + path(taper([[-11, 43], [-12, 47], [-5, 49]], 2, 0.3, 0.2, 0.5, 1), SKIN.line, ' opacity=".8"');
  s += path(S([[-24, 66, 1], [-6, 70], [14, 64, 1], [6, 76], [-8, 78], [-18, 74]]), '#7a2c38');
  s += path(S([[-20, 67, 1], [-6, 70.5], [10, 65.5, 1], [4, 69], [-14, 69.5]]), '#ffffff');
  s += path(taper([[-26, 65], [-6, 70], [16, 62]], 2.2, 0.4, 0.4, 0.5, 1), SKIN.line);
  // choppy bob with neon tips + ahoge
  s += U('mHair', H.base);
  const tips = [[96, 84, 88, 44], [80, 70, 74, 30], [64, 52, 50, -26], [34, 22, 16, -40], [-4, 14, -20, -44], [-40, 10, -56, -34], [-76, 40, -84, 10], [-92, 60, -96, 10]];
  let sh = '', tp = '';
  for (const [tx, ty, nx, ny] of tips) {
    sh += taper([[nx, ny], [(nx + tx) / 2 + 3, (ny + ty) / 2], [tx - 2, ty - 6]], 7, 0.9, 0, 0.3);
    tp += taper([[(nx + tx * 3) / 4, (ny + ty * 3) / 4], [tx, ty]], 5, 0.6, 0, 0.3);
  }
  s += path(sh, H.sh, ' opacity=".6"') + path(tp, H.tip, ' opacity=".7"');
  s += path(taper([[-74, -100], [-30, -130], [20, -132], [70, -106]], 10, 0, 0, 0.5), H.hi, ' opacity=".8"');
  s += line('M-60,-80Q-50,-50-44,-20M40,-100Q48,-60 50,-26M-10,-120Q-14,-80-20,-44', H.deep, 1.8, ' opacity=".55"');
  s += path(taper([[10, -152], [0, -186], [24, -204], [42, -196]], 9, 0.9, 0, 0.3), H.base);
  // wrench hairclip (her right side)
  s += `<g transform="translate(-62 -46) rotate(-58)"><rect x="-4" y="-22" width="8" height="40" rx="3" fill="#c8cfdb"/><rect x="-4" y="4" width="8" height="14" rx="2" fill="${C.orange}"/><path d="M-9,-30a9,9 0 1 0 18,0l-4,0l0,6h-10l0,-6z" fill="#c8cfdb"/></g>`;
  // near cat-ear receiver on the crown
  s += U('mEarN', T.base) + path(S([[-14, -138, 1], [-4, -192, 1], [26, -148, 1]]), T.in);
  s += line('M-8,-146L-2,-180M2,-144L6,-168M12,-146L20,-156', C.mia, 2.6) + line('M-26,-132L-8,-214L40,-150', C.mia, 2.4, ' opacity=".9"');
  s += line('M-8,-214L-18,-254', '#a9b3c4', 3) + `<circle cx="-19" cy="-258" r="6.5" fill="${C.orange}"/><circle cx="-19" cy="-258" r="14" fill="${C.orange}" opacity=".3"/>`;
  s += line('M-28,-134Q8,-124 42,-150', T.hi, 3);
  return s;
}

// forearm on the table, the drone, the tools (drawn after the table top)
export function miaFront(c) {
  const { p, U } = c;
  c.add(radial(`${p}-zero`, [[0, '#ffffff'], [0.55, '#e2e8f0'], [1, '#8a98ac']], 'cx="0.36" cy="0.3" r="0.78"'));
  let s = '';
  // far arm (her right): sleeve reaching forward, hand hidden behind the drone
  s += U('mArmF', J.base);
  s += path(S([[1124, 522], [1104, 556], [1086, 588], [1064, 602], [1070, 606], [1094, 594], [1116, 560], [1140, 520]]), J.lit, ' opacity=".8"');
  s += line('M1128,556l14,10M1110,584l14,8', J.deep, 1.8, ' opacity=".6"');
  // Zero's cyan glow on the cloth + her face
  s += `<circle cx="1060" cy="606" r="160" fill="url(#${p}-mCyan)"/>`;
  // the drone: white shell, big cyan eye, rotor ring, top hatch hinged open showing the lit core
  s += `<ellipse cx="1060" cy="652" rx="44" ry="9" fill="#0e1820" opacity=".5"/>`;
  s += `<ellipse cx="1060" cy="618" rx="62" ry="11" fill="none" stroke="#8a9cb0" stroke-width="3"/>`;
  s += `<circle cx="1060" cy="614" r="38" fill="url(#${p}-zero)"/>`;
  s += path('M1030,594Q1060,572 1090,594Q1060,588 1030,594Z', '#0e1a28') + path('M1040,592Q1060,582 1080,592Q1060,590 1040,592Z', C.mia);
  s += path('M1088,592Q1094,574 1084,562Q1066,556 1052,568Q1068,568 1078,578Q1086,584 1088,592Z', '#e6ebf2', ' stroke="#7a8aa0" stroke-width="1.4"') + path('M1078,578Q1068,568 1052,568Q1064,572 1072,582Z', '#9aa8bc');
  s += line('M1050,590q4,-10 10,-6M1066,590q2,-10 8,-8', '#ffe2a0', 1.4);
  s += `<circle cx="1050" cy="620" r="14" fill="#0c2a40"/><circle cx="1050" cy="620" r="10" fill="${C.mia}"/><circle cx="1050" cy="620" r="4.5" fill="#063048"/><circle cx="1046" cy="616" r="3" fill="#fff"/>`;
  s += path('M1078,610l12,4l-2,8l-12,-3z', C.orange) + path('M1066,636l14,-2l1,6l-14,2z', '#e8c89a');
  s += line('M1032,628Q1036,640 1048,646', '#ffffff', 2, ' opacity=".7"');
  // near forearm lying across the cloth: thick sleeve, folds at the elbow, cuff over the hand
  s += U('mArmN', J.base);
  s += path(S([[1324, 506], [1352, 548], [1358, 600], [1344, 640], [1322, 650], [1336, 600], [1330, 552]]), J.sh);
  s += path(S([[1288, 594], [1256, 616], [1196, 628], [1128, 640], [1140, 648], [1204, 642], [1262, 630], [1300, 606]]), J.lit, ' opacity=".7"');
  s += line('M1300,648Q1306,630 1324,624M1280,656Q1290,636 1306,632M1262,662Q1266,646 1282,640', J.deep, 2, ' opacity=".8"');
  s += line('M1350,560Q1362,610 1340,644', C.mia, 2.2, ' opacity=".85"') + line('M1124,664Q1180,674 1236,670', C.mia, 1.4, ' opacity=".55"');
  s += path(S([[1124, 640], [1150, 634], [1158, 664], [1128, 670]]), J.sh) + line('M1148,636L1156,666', C.mia, 1.6, ' opacity=".8"');
  // her hand out of the cuff, screwdriver pinched in the fingertips, tip in the open hatch
  s += line('M1072,592L1114,616', '#d9dee8', 2.6) + line('M1072,592L1114,616', '#ffffff', 1, ' opacity=".7"');
  s += path('M1110,610l20,11l-5,8l-20,-11z', C.orange) + line('M1112,614l16,9', '#ffd0a0', 1.4);
  s += path(S([[1122, 630], [1128, 620], [1144, 618], [1156, 628], [1152, 644], [1136, 648], [1124, 642]]), SKIN.base);
  s += path(taper([[1128, 632], [1120, 634], [1114, 632]], 6.5, 0.9, 0.7, 0.3, 1) + taper([[1130, 640], [1122, 642], [1117, 639]], 6, 0.9, 0.7, 0.3, 1), SKIN.base);
  s += path(taper([[1140, 620], [1128, 616], [1118, 614]], 6, 0.9, 0.5, 0.3, 1), SKIN.base) + line('M1120,614l-4,-1', '#f0b8a8', 2.4);
  s += path(S([[1126, 642], [1142, 644], [1152, 638], [1150, 646], [1134, 650]]), SKIN.sh) + line('M1128,630q-5,1 -9,3M1130,638q-5,1 -9,2M1138,622q-6,-2 -12,-4', SKIN.line, 1, ' opacity=".55"');
  // spare parts on the cloth
  s += `<g fill="#c9cfdb"><circle cx="1150" cy="700" r="3"/><circle cx="1166" cy="694" r="2.5"/><rect x="1176" y="704" width="18" height="4" rx="2"/></g>`;
  s += path('M1006,690l26,-4l2,10l-26,4z', '#2a6a4a') + line('M1010,692l20,-3M1012,697l18,-3', '#a8e0b0', 1);
  return s;
}
