// aftermath-snow.svg 「记忆之雪」
// The Dream Eater has come apart. Through the torn roof of the carriage the eclipse looks in, and
// the memories it swallowed fall like snow. Lia, in the foreground, has caught one in her gauntlet.
export default function aftermathSnow(L) {
  const p = 'aftermathSnow';
  const { PAL, f, shape } = L;
  const R = L.rng(7711);
  // camera at chest height inside the dining car; X right, Y down (units ~2.7 mm), depth z
  const VP = [620, 450];
  const P = (X, Y, z) => [VP[0] + X / z, VP[1] + Y / z];
  const HW = 560, FL = 463, WT = -340, CT = -530, Z0 = 0.5, ZB = 4.6;
  const sec = (z, n = 10) => Array.from({ length: n + 1 }, (_, i) => { const a = Math.PI * (1 - i / n); return P(Math.cos(a) * HW, WT + Math.sin(a) * (CT - WT), z); });
  const pp = (arr) => arr.map(([x, y]) => `${f(x, 0)},${f(y, 0)}`).join(' ');
  const quad = (A, B, C, D) => `M${pp([A, B, C, D])}Z`;

  let defs = L.filters(p) + L.vignetteDefs(p) + L.shardDefs(p, 63) + L.warmDef(p)
    + L.linear(`${p}-sky`, [[0, '#0a0820'], [0.6, '#1f1a46'], [1, '#3a2a62']])
    + L.linear(`${p}-wallL`, [[0, '#0b1215'], [0.6, '#1a2a2f'], [1, '#22343a']], 'x1="0" y1="0" x2="1" y2="0"')
    + L.linear(`${p}-wallR`, [[0, '#22343a'], [0.4, '#1a2a2f'], [1, '#0b1215']], 'x1="0" y1="0" x2="1" y2="0"')
    + L.linear(`${p}-ceil`, [[0, '#0b1114'], [1, '#1a282d']])
    + L.linear(`${p}-floor`, [[0, '#1d2230'], [1, '#08090f']])
    + L.linear(`${p}-carpet`, [[0, '#5a1e2c'], [1, '#1c0a10']])
    + L.linear(`${p}-night`, [[0, '#0d0b26'], [1, '#2a2052']])
    + L.linear(`${p}-shaft`, [[0, '#e8ddff', 0.45], [0.7, '#cbbcff', 0.12], [1, '#cbbcff', 0]], 'x1="0" y1="0" x2="0.3" y2="1"')
    + L.radial(`${p}-pool`, [[0, '#efe9ff', 0.5], [0.5, '#cbbcff', 0.2], [1, '#cbbcff', 0]])
    + L.radial(`${p}-amber`, [[0, '#fff0d0'], [0.12, PAL.amber, 0.8], [0.4, '#ff8a3c', 0.22], [1, '#ff8a3c', 0]])
    + L.radial(`${p}-red`, [[0, PAL.emergency, 0.7], [0.35, '#c41f3a', 0.25], [1, '#c41f3a', 0]])
    + L.radial(`${p}-vig`, [[0.55, '#000', 0], [1, '#000', 0.7]], 'r="0.75"')
    + L.linear(`${p}-bot`, [[0, '#070614', 0], [1, '#070614', 0.85]])
    + L.linear(`${p}-drift`, [[0, '#f1ecff'], [0.5, '#c9bdf0'], [1, '#7d70b8', 0]]);

  let s = '';
  // ---------------------------------------------------------------- shell
  s += `<rect width="1600" height="900" fill="#0a0e12"/>`;
  const cN = sec(Z0), cB = sec(ZB);
  s += `<polygon points="${pp(cN.concat(cB.slice().reverse()))}" fill="url(#${p}-ceil)"/>`;
  s += `<path d="${quad(P(-HW, WT, Z0), P(-HW, WT, ZB), P(-HW, FL, ZB), P(-HW, FL, Z0))}" fill="url(#${p}-wallL)"/>`;
  s += `<path d="${quad(P(HW, WT, Z0), P(HW, WT, ZB), P(HW, FL, ZB), P(HW, FL, Z0))}" fill="url(#${p}-wallR)"/>`;
  s += `<path d="${quad(P(-HW, FL, Z0), P(-HW, FL, ZB), P(HW, FL, ZB), P(HW, FL, Z0))}" fill="url(#${p}-floor)"/>`;
  s += `<path d="${quad(P(-200, FL, Z0), P(-200, FL, ZB), P(200, FL, ZB), P(200, FL, Z0))}" fill="url(#${p}-carpet)"/>`;
  s += `<path d="M${pp([P(-200, FL, Z0), P(-200, FL, ZB)])}M${pp([P(200, FL, Z0), P(200, FL, ZB)])}" stroke="#b88a4a" stroke-width="2" opacity=".4" fill="none"/>`;
  // back wall + connecting door with the red emergency light beyond
  s += `<polygon points="${pp([P(-HW, WT, ZB), ...cB.slice(1, -1), P(HW, WT, ZB), P(HW, FL, ZB), P(-HW, FL, ZB)])}" fill="#17252b"/>`;
  const d0 = P(-150, -150, ZB), d1 = P(150, FL, ZB);
  s += `<rect x="${f(d0[0], 0)}" y="${f(d0[1], 0)}" width="${f(d1[0] - d0[0], 0)}" height="${f(d1[1] - d0[1], 0)}" fill="#3a1220"/>`;
  s += `<circle cx="${f((d0[0] + d1[0]) / 2, 0)}" cy="${f(d0[1] + 24, 0)}" r="80" fill="url(#${p}-red)"/>`;
  s += `<rect x="${f(d0[0], 0)}" y="${f(d0[1], 0)}" width="${f(d1[0] - d0[0], 0)}" height="${f(d1[1] - d0[1], 0)}" fill="none" stroke="#b88a4a" stroke-width="2.5" opacity=".7"/>`;

  // ---------------------------------------------------------------- windows, sconces, tables on both walls
  const wz = [0.62, 1.29, 1.96, 2.63, 3.3, 3.97];
  let curt = '', folds = '', winL = '', winR = '', frm = '', lamps = '', glows = '', tables = '', tableTop = '', snowTop = '';
  wz.forEach((z, i) => {
    const z2 = z + 0.37, zm = z + 0.185;
    for (const side of [-1, 1]) {
      const X = side * HW;
      const a = P(X, 230, z), b = P(X, -110, z), c = P(X, -200, zm), d = P(X, -110, z2), e = P(X, 230, z2);
      const path = `M${pp([a, b])}Q${f(c[0], 0)},${f(c[1] - 34 / zm, 0)} ${pp([d, e])}Z`;
      if (side < 0) winL += `<path d="${path}"/>`; else winR += `<path d="${path}"/>`;
      frm += `<path d="${path}"/>`;
      // torn crimson curtains on both sides of the window (same dining car as camp-fire)
      for (const [za, zb, torn] of [[z - 0.07, z + 0.03, (i + side) % 2], [z2 - 0.03, z2 + 0.07, (i + side + 1) % 2]]) {
        if (side > 0 && za < 1.1) continue; // keep Lia's silhouette clean
        const yb = torn ? 120 + (i * 37 % 60) : 300;
        const A = P(X, -230, za), B = P(X, -230, zb), C2 = P(X, yb, zb), D = P(X, yb + (torn ? 40 : 0), (za + zb) / 2), E2 = P(X, yb - (torn ? 30 : 0), za);
        curt += `<path d="M${pp([A, B, C2, D, E2])}Z"/>`;
        const mz = (za + zb) / 2;
        folds += `M${pp([P(X, -220, mz), P(X, yb - 10, mz)])}`;
      }
      // sconce on the pier between windows
      const zl = z2 + 0.15, lp = P(X - side * 8, -40, zl);
      const lit = (i + (side > 0 ? 1 : 0)) % 3 !== 1;
      if (lit) glows += `<circle cx="${f(lp[0], 0)}" cy="${f(lp[1], 0)}" r="${f(150 / zl, 0)}" fill="url(#${p}-amber)" opacity=".75"/>`;
      lamps += `<path d="M${f(lp[0], 0)},${f(lp[1] - 18 / zl, 0)}l${f(-side * 9 / zl, 0)},${f(6 / zl, 0)}v${f(26 / zl, 0)}l${f(side * 9 / zl, 0)},${f(6 / zl, 0)}z" fill="${lit ? '#ffd9a0' : '#3a3026'}"/>`;
      // table under the window (left side only — the right side is hidden behind Lia)
      if (side < 0 && z > 1) {
        const t1 = P(-HW, 200, z + 0.04), t2 = P(-300, 200, z + 0.04), t3 = P(-300, 200, z2 - 0.04), t4 = P(-HW, 200, z2 - 0.04);
        const over = i === 3;
        if (!over) {
          tables += `<path d="M${pp([t2, t3, P(-300, 222, z2 - 0.04), P(-300, 222, z + 0.04)])}Z" fill="#22160e"/>`;
          tables += `<path d="M${pp([P(-420, 222, zm), P(-420, FL, zm)])}" stroke="#140d08" stroke-width="${f(14 / zm, 0)}"/>`;
          tableTop += `<path d="M${pp([t1, t2, t3, t4])}Z"/>`;
          snowTop += `<path d="M${pp([P(-500, 200, zm - 0.1), P(-330, 196, zm - 0.05), P(-340, 200, zm + 0.12), P(-520, 200, zm + 0.1)])}Z"/>`;
          const lmp = P(-470, 160, zm);
          if (i !== 4) glows += `<circle cx="${f(lmp[0], 0)}" cy="${f(lmp[1], 0)}" r="${f(110 / zm, 0)}" fill="url(#${p}-amber)" opacity=".55"/>`;
          lamps += `<path d="M${f(lmp[0] - 10 / zm, 0)},${f(lmp[1] + 6 / zm, 0)}h${f(20 / zm, 0)}l${f(-5 / zm, 0)},${f(-14 / zm, 0)}h${f(-10 / zm, 0)}z" fill="${i !== 4 ? '#ffd9a0' : '#3a3026'}"/><path d="M${f(lmp[0], 0)},${f(lmp[1] + 6 / zm, 0)}v${f(34 / zm, 0)}" stroke="#b88a4a" stroke-width="${f(3 / zm, 1)}"/>`;
        }
      }
    }
  });
  s += `<g fill="url(#${p}-night)">${winL}${winR}</g>`;
  // frost creeping on the window panes + a few stars outside
  s += L.stars(R, 40, 0, 120, 520, 600, '#cfc6ff', (x, y) => x > 470) ;
  defs += `<clipPath id="${p}-wins">${winL}${winR}</clipPath>`;
  let refl = '';
  for (let x = -200; x < 1700; x += 150) refl += `<path d="M${x},900L${x + 260},0h${f(30 + (x % 7) * 6, 0)}L${x + 50},900Z"/>`;
  s += `<g clip-path="url(#${p}-wins)"><g fill="#cbbcff" opacity=".07">${refl}</g></g>`;
  s += `<g fill="none" stroke="#b88a4a" stroke-width="5" opacity=".8">${frm}</g>`;
  s += `<g fill="#46101c">${curt}</g><path d="${folds}" stroke="#2a0810" stroke-width="3" opacity=".7" fill="none"/>`;
  s += `<path d="M${pp([P(-HW, 260, Z0), P(-HW, 260, ZB)])}M${pp([P(HW, 260, Z0), P(HW, 260, ZB)])}" stroke="#b88a4a" stroke-width="4" opacity=".55" fill="none"/>`;
  s += tables + `<g fill="#3a2616">${tableTop}</g><g fill="#d9cff5" opacity=".55">${snowTop}</g>`;
  s += glows + lamps;
  // overturned table in the aisle
  const o1 = P(-330, 380, 2.7), o2 = P(-120, 330, 2.9), o3 = P(-110, 420, 2.95), o4 = P(-320, 460, 2.75);
  s += `<path d="M${pp([o1, o2, o3, o4])}Z" fill="#2a1a10"/><path d="M${pp([o1, o2])}" stroke="#b88a4a" stroke-width="2" opacity=".6"/>`;
  // ceiling ribs between the windows
  let ribs = '';
  for (const z of [0.58, 1.25, 1.92, 2.59, 3.26, 3.93]) ribs += `<polyline points="${pp([P(-HW, FL, z), P(-HW, WT, z), ...sec(z, 12), P(HW, WT, z), P(HW, FL, z)])}"/>`;
  s += `<g fill="none" stroke="#1c2b30" stroke-width="7" stroke-linejoin="round">${ribs}</g>`;
  s += `<g fill="none" stroke="#3d5a62" stroke-width="1.5" stroke-linejoin="round" opacity=".7" transform="translate(-2 -3)">${ribs}</g>`;

  // ---------------------------------------------------------------- the hole in the roof + eclipse
  const hole = [[120, -10, 1], [200, 60, 1], [270, 30, 1], [350, 120, 1], [450, 92, 1], [530, 176, 1], [610, 150, 1], [690, 210, 1], [770, 168, 1], [840, 214, 1], [920, 150, 1], [990, 170, 1], [1060, 90, 1], [1130, 112, 1], [1200, 30, 1], [1260, 44, 1], [1320, -10, 1]];
  defs += `<clipPath id="${p}-hole"><path d="${shape(hole)}"/></clipPath>`;
  const ecl = L.eclipse(p, 450, 56, 46, { bead: 150, halo: 3.4 });
  defs += ecl.defs;
  s += `<g clip-path="url(#${p}-hole)"><rect x="100" y="-20" width="1240" height="250" fill="url(#${p}-sky)"/>${L.stars(R, 50, 120, 0, 1320, 220)}${ecl.body}</g>`;
  s += `<path d="${shape(hole, false)}" fill="none" stroke="#0a1114" stroke-width="14" stroke-linejoin="round"/>`;
  s += `<path d="${shape(hole, false)}" fill="none" stroke="#7d9aa3" stroke-width="2.5" stroke-linejoin="round" opacity=".7" transform="translate(0 6)"/>`;
  s += `<path d="M530,176L540,236L552,184M920,150L906,226L938,166M350,120L340,178L364,128M1060,90L1070,150L1082,100" fill="#0a1114" stroke="#5d7a80" stroke-width="2"/>`;
  s += `<path d="M690,210C700,290 676,340 690,400" fill="none" stroke="#06090b" stroke-width="4"/><path d="M690,400l-6,10l12,0z" fill="#ffd091"/>`;

  // ---------------------------------------------------------------- moonlight shaft + pool
  s += `<g filter="url(#${p}-b2)"><polygon points="260,40 760,40 900,690 330,730" fill="url(#${p}-shaft)" opacity=".7"/>`
    + `<polygon points="410,60 600,60 720,680 470,700" fill="url(#${p}-shaft)" opacity=".55"/></g>`;
  s += `<ellipse cx="610" cy="690" rx="320" ry="62" fill="url(#${p}-pool)"/>`;

  // ---------------------------------------------------------------- drifts of memory snow on the floor
  let drifts = '', driftTop = '';
  for (const [x, y, w, h] of [[150, 860, 560, 70], [430, 720, 360, 30], [720, 650, 200, 14], [540, 600, 130, 8], [880, 800, 300, 40]]) {
    const pts2 = [];
    for (let i = 0; i <= 8; i++) pts2.push([x - w / 2 + w * i / 8, y - (i === 0 || i === 8 ? 0 : h * (0.55 + 0.45 * Math.sin(i * 1.7 + x)) * Math.sin(Math.PI * i / 8))]);
    drifts += `<path d="${shape(pts2.concat([[x + w / 2, y + h * 0.6, 1], [x - w / 2, y + h * 0.6, 1]]))}"/>`;
    driftTop += shape(pts2.slice(1, -1), false);
  }
  s += `<g fill="url(#${p}-drift)" opacity=".55">${drifts}</g>`;
  s += `<path d="${driftTop}" fill="none" stroke="#f6f2ff" stroke-width="2" stroke-linecap="round" opacity=".45"/>`;
  let specks = '';
  for (let i = 0; i < 80; i++) specks += `<circle cx="${f(R.range(60, 1100), 0)}" cy="${f(R.range(590, 890), 0)}" r="${f(R.range(0.8, 2.4))}"/>`;
  s += `<g fill="${PAL.memory}" opacity=".8">${specks}</g>`;

  // ---------------------------------------------------------------- background party: Serena in the light, Mia by the tables
  defs += L.inkDef(p);
  const ser = L.silhouette(p, 'serena', L.BODY.serena(), 690, 590, 0.19, { rim: PAL.serena, rimW: 2.5, moonW: 2, glow: 0.55 });
  const mia = L.silhouette(p, 'mia', L.BODY.mia(), 512, 612, 0.215, { rim: PAL.mia, rimW: 2.5, moonW: 1.5, glow: 0.55 });
  defs += ser.defs + mia.defs;
  s += ser.body + mia.body;

  // ---------------------------------------------------------------- falling memory snow (far / mid)
  let far = '', glint = '';
  for (let i = 0; i < 260; i++) {
    const x = R.range(0, 1600), y = R.range(0, 880);
    const r = R() < 0.8 ? R.range(0.8, 2) : R.range(2, 3.4);
    far += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(r)}" opacity="${f(R.range(0.4, 1), 2)}"/>`;
  }
  s += `<g fill="#efe9ff">${far}</g>`;
  for (let i = 0; i < 34; i++) {
    const x = R.range(80, 1300), y = R.range(80, 860), r = R.range(2, 3.6);
    glint += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(r * 6, 0)}" fill="url(#${p}-warm)" opacity=".45"/><circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(r)}" fill="#fff1e2"/>`;
  }
  s += glint;
  let mid = '';
  for (let i = 0; i < 60; i++) {
    const x = R.range(60, 1400), y = R.range(60, 840);
    mid += L.shard(p, R, x, y, R.range(12, 26), R.range(0, 360), { vig: 0.3, op: R.range(0.6, 1), glow: R() < 0.2 });
  }
  s += mid;

  // ---------------------------------------------------------------- Lia (foreground)
  s += lia(L, p, R, defs, (d) => { defs += d; });

  // ---------------------------------------------------------------- near snow: big out-of-focus flakes
  let near = '';
  for (const [x, y, len, a] of [[80, 160, 90, 20], [1500, 140, 70, 60], [1440, 640, 100, -30], [60, 560, 80, 80], [820, 860, 90, 10]]) {
    near += `<use href="#${p}-sh${Math.floor(R() * 5)}" transform="translate(${x} ${y}) rotate(${a}) scale(${f(len / 100, 2)})" opacity=".45"/>`;
  }
  s += `<g filter="url(#${p}-b1)">${near}</g>`;
  s += `<rect width="1600" height="900" fill="url(#${p}-vig)"/>`;
  s += `<rect y="740" width="1600" height="160" fill="url(#${p}-bot)"/>`;
  return L.svgDoc('记忆之雪：食梦兽崩解，记忆碎片像雪一样落满车厢，莉亚接住一片', defs, s);
}

// Lia in near profile, facing left toward the moonlight, a fragment of someone's memory resting in
// her raised left gauntlet. Cel-shaded: dark base, moonlit planes (upper left), warm planes facing
// the fragment, crimson rim on the back edges.
function lia(L, p, R, _defs, addDefs) {
  const { PAL, f, shape } = L;
  const S = (P) => shape(P);
  const HEAD_T = 'rotate(-9 1138 342)';
  const head = {
    pony: S([[1168, 206], [1184, 184], [1214, 172], [1246, 184], [1266, 220], [1274, 290], [1270, 360], [1260, 420], [1246, 474], [1230, 522, 1], [1234, 480], [1220, 506, 1], [1224, 462], [1210, 488, 1], [1222, 420], [1232, 340], [1232, 280], [1224, 240], [1204, 214], [1186, 206]]),
    skull: S([[1108, 212], [1098, 230], [1092, 250], [1094, 260], [1088, 270], [1076, 290, 1], [1086, 296], [1086, 303], [1082, 308, 1], [1088, 313, 1], [1085, 318, 1], [1090, 325], [1088, 334], [1098, 344], [1124, 342], [1142, 334], [1158, 318], [1180, 322], [1196, 282], [1196, 236], [1172, 200], [1138, 190], [1114, 198]]),
    hair: S([[1106, 210, 1], [1112, 228], [1122, 250], [1134, 266], [1146, 268, 1], [1160, 282], [1166, 304], [1172, 326, 1], [1184, 324], [1202, 282], [1200, 232], [1176, 196], [1138, 186], [1110, 194]]),
  };
  const body = {
    cape: S([[1176, 384], [1214, 380], [1240, 396], [1262, 470], [1290, 580], [1318, 700], [1342, 820], [1356, 920, 1], [1214, 920, 1], [1208, 800], [1204, 680], [1204, 600], [1214, 500], [1196, 430]]),
    legB: S([[1150, 610], [1206, 606], [1210, 680], [1204, 760], [1198, 840], [1200, 920, 1], [1146, 920, 1], [1148, 840], [1150, 760], [1146, 680]]),
    legF: S([[1096, 612], [1154, 616], [1150, 690], [1140, 770], [1136, 850], [1138, 920, 1], [1080, 920, 1], [1084, 850], [1088, 770], [1092, 690]]),
    tasset: S([[1094, 588, 1], [1208, 586, 1], [1214, 636, 1], [1182, 646, 1], [1150, 638, 1], [1120, 648, 1], [1092, 638, 1]]),
    torso: S([[1108, 386], [1172, 382], [1210, 400], [1222, 450], [1212, 510], [1200, 556], [1204, 592, 1], [1096, 594, 1], [1100, 556], [1090, 500], [1084, 450], [1092, 410]]),
    neck: S([[1110, 340], [1166, 318], [1174, 388, 1], [1108, 392, 1]]),
    upper: S([[1088, 410], [1132, 414], [1120, 470], [1100, 530], [1094, 552], [1070, 560], [1054, 542], [1062, 480]]),
    fore: S([[1060, 548], [1070, 530], [1088, 528], [1092, 548], [1078, 562], [1060, 562], [1048, 556], [1004, 512], [962, 470], [944, 458, 1], [958, 428, 1], [972, 438], [1020, 484]]),
    hand: S([[964, 432, 1], [950, 428], [936, 426], [920, 414], [906, 410], [908, 420], [920, 432], [902, 434], [886, 430], [872, 426], [864, 418], [858, 424], [866, 440], [884, 450], [906, 456], [930, 460], [946, 462, 1]]),
    pauld: S([[1080, 404], [1096, 384], [1130, 378], [1154, 392], [1152, 420], [1140, 446, 1], [1124, 438, 1], [1116, 454, 1], [1084, 452], [1074, 428]]),
  };
  const use = (o) => Object.values(o).map((d) => `<path d="${d}"/>`).join('');
  addDefs(`<g id="${p}-lia">${use({ cape: body.cape, legB: body.legB, legF: body.legF, tasset: body.tasset, torso: body.torso, neck: body.neck })}<g transform="${HEAD_T}">${use(head)}</g>${use({ upper: body.upper, fore: body.fore, hand: body.hand, pauld: body.pauld })}</g>`
    + L.radial(`${p}-frag`, [[0, '#fff6ea'], [0.2, '#ffe2b8', 0.9], [0.45, '#ffb38a', 0.4], [1, '#ff8a6a', 0]])
    + L.linear(`${p}-steelL`, [[0, '#cfcaf0'], [0.5, '#5a5680'], [1, '#262439']], 'x1="0" y1="0" x2="1" y2="1"')
    + L.linear(`${p}-plate`, [[0, '#d9c2c8'], [0.35, '#8f88b0'], [1, '#4a4768']], 'x1="0" y1="0" x2="0" y2="1"'));
  let s = '';
  s += `<use href="#${p}-lia" fill="${PAL.lia}" opacity=".35" filter="url(#${p}-b2)"/>`;
  s += `<use href="#${p}-lia" fill="${PAL.lia}" transform="translate(5 -2)"/>`;
  s += `<use href="#${p}-lia" fill="${PAL.moon}" opacity=".5" transform="translate(-3 -3)"/>`;
  const F = (d, c, extra = '') => `<path d="${d}" fill="${c}"${extra}/>`;
  // ---- cape (behind): near-black crimson, lining fold, rim
  s += F(body.cape, '#220a12');
  s += `<path d="M1240,396C1262,470 1290,580 1318,700C1330,760 1342,820 1356,920L1334,920C1320,820 1302,720 1280,620C1264,540 1248,460 1232,400Z" fill="#43121f"/>`;
  s += `<path d="M1262,470C1290,580 1318,700 1356,920" fill="none" stroke="${PAL.lia}" stroke-width="3" opacity=".85"/>`;
  // ---- legs + tassets
  s += F(body.legB, '#14111d') + F(body.legF, '#1e1a2c');
  s += `<path d="M1096,614C1094,690 1090,770 1086,850L1098,850C1100,770 1106,690 1110,616Z" fill="#3c3858" opacity=".8"/>`;
  s += `<path d="M1088,786L1140,780L1138,800L1088,806Z" fill="#4a4768"/><path d="M1088,786L1140,780" stroke="#9f9bc6" stroke-width="2"/>`;
  s += F(body.tasset, '#2c2a44');
  s += `<path d="M1094,592L1124,592L1120,648L1092,638Z" fill="#8f88b0" opacity=".6"/><path d="M1122,594L1120,646M1152,592L1150,638M1182,592L1182,644" stroke="#14121f" stroke-width="2.5"/>`;
  s += `<path d="M1094,588L1208,586" stroke="#6a6690" stroke-width="3"/>`;
  // ---- torso: lit front plate (facing the fragment), mid side plane, dark back
  s += F(body.torso, '#262439');
  s += `<path d="M1108,386L1140,384C1128,440 1124,500 1128,556L1100,556C1090,500 1084,450 1092,410Z" fill="url(#${p}-plate)"/>`;
  s += `<path d="M1140,384L1172,382C1164,440 1160,500 1162,556L1128,556C1124,500 1128,440 1140,384Z" fill="#3c3a58"/>`;
  s += `<path d="M1210,402C1222,440 1220,480 1206,520" fill="none" stroke="${PAL.lia}" stroke-width="3" opacity=".75"/>`;
  s += `<path d="M1118,470l11,-15l11,15l-11,17z" fill="${PAL.oath}"/><path d="M1129,455l-3,15l5,4" fill="none" stroke="#8a5a2a" stroke-width="1.5"/>`;
  s += `<circle cx="1129" cy="471" r="24" fill="url(#${p}-frag)" opacity=".5"/>`;
  s += `<path d="M1100,556L1200,556L1204,592L1096,594Z" fill="#3a2430"/><path d="M1100,563H1201" stroke="#b88a4a" stroke-width="4"/>`;
  // ---- neck
  s += F(body.neck, '#4a3040');
  s += `<path d="M1110,346C1112,362 1112,376 1108,392L1124,392C1124,374 1124,358 1122,344Z" fill="#c98a74" opacity=".8"/>`;
  s += `<path d="M1106,388L1176,384L1178,396L1104,400Z" fill="#4a4768"/><path d="M1106,388L1176,384" stroke="#cfcaf0" stroke-width="2"/>`;
  // ---- head (tilted toward the fragment)
  let h = '';
  h += F(head.pony, '#5c1424');
  h += `<path d="M1186,190C1214,174 1246,184 1264,222C1272,262 1272,320 1266,380C1260,330 1254,270 1238,238C1224,214 1204,204 1186,204Z" fill="#9a2a3c"/>`;
  h += `<path d="M1246,188C1264,222 1274,290 1270,362" fill="none" stroke="${PAL.lia}" stroke-width="4"/>`;
  h += `<path d="M1224,462C1230,420 1234,380 1234,330M1212,486C1220,450 1226,410 1226,360" fill="none" stroke="#2a0810" stroke-width="3" opacity=".8"/>`;
  h += F(head.skull, '#5a3a48');
  // warm under-light along the profile and the jaw
  h += `<ellipse cx="1100" cy="330" rx="26" ry="18" fill="#e09478" opacity=".35" filter="url(#${p}-b1)"/>`;
  h += `<path d="M1076,290L1086,296L1086,303L1082,308L1088,313L1085,318L1090,325L1088,334L1098,344L1124,342L1130,338L1116,337L1100,337L1095,327L1094,319L1093,311L1092,303L1089,296L1083,290Z" fill="#f0a882"/>`;
  h += `<path d="M1088,272L1080,288" stroke="#f0a882" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
  // moonlit brow and forehead
  h += `<path d="M1108,212C1098,230 1092,248 1094,260C1090,266 1088,270 1088,270" fill="none" stroke="#e2d6f6" stroke-width="3.5" stroke-linecap="round"/>`;
  // ear
  h += `<path d="M1146,270C1158,268 1164,280 1162,292C1160,302 1152,306 1146,302C1150,292 1150,280 1146,270Z" fill="#7a4a56"/><path d="M1150,278C1156,282 1156,292 1152,296" fill="none" stroke="#3a1c26" stroke-width="2"/>`;
  // eye (lowered lid), brow, mouth
  h += `<path d="M1096,262Q1106,268 1116,264" fill="none" stroke="#1a0c14" stroke-width="3.2" stroke-linecap="round"/>`;
  h += `<path d="M1097,262l-6,3" stroke="#1a0c14" stroke-width="2.2" stroke-linecap="round"/>`;
  h += `<path d="M1101,266q5,3 11,0" fill="none" stroke="${PAL.oath}" stroke-width="1.8"/>`;
  h += `<path d="M1096,250Q1108,246 1120,250" fill="none" stroke="#3a0e1a" stroke-width="3.2" stroke-linecap="round"/>`;
  h += `<path d="M1088,313L1096,314" stroke="#7a3a40" stroke-width="2" stroke-linecap="round"/>`;
  // hair, pulled back hard into the ponytail; dark-red streak on the left side, loose strands
  h += F(head.hair, '#7a1c2e');
  h += `<path d="M1112,200C1140,186 1176,190 1194,220C1172,206 1146,202 1116,210Z" fill="#d0435a"/>`;
  h += `<path d="M1118,226C1140,232 1160,250 1176,276M1126,248C1146,256 1162,276 1170,300M1112,206C1140,200 1170,206 1190,230" fill="none" stroke="#4a0e1c" stroke-width="2.5" opacity=".8"/>`;
  h += `<path d="M1140,212C1158,222 1172,244 1184,270" fill="none" stroke="#c13b4c" stroke-width="3" opacity=".7"/>`;
  h += `<path d="M1122,222C1118,246 1120,272 1126,296C1129,310 1131,322 1132,334" fill="none" stroke="#9a2a3c" stroke-width="5" stroke-linecap="round"/>`;
  h += `<path d="M1124,240C1124,262 1128,286 1134,306" fill="none" stroke="#3a0a16" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`;
  h += `<path d="M1114,214C1108,226 1104,240 1104,252" fill="none" stroke="#c13b4c" stroke-width="4" stroke-linecap="round"/>`;
  h += `<path d="M1168,206L1184,190" stroke="${PAL.oath}" stroke-width="10" stroke-linecap="round"/>`;
  h += `<path d="M1196,236C1202,256 1202,282 1190,310" fill="none" stroke="${PAL.lia}" stroke-width="3"/>`;
  s += `<g transform="${HEAD_T}">${h}</g>`;
  // ---- the raised arm
  s += F(body.upper, '#2c2a44');
  s += `<path d="M1088,410L1104,410C1094,450 1084,500 1078,548L1060,548C1064,500 1076,450 1088,410Z" fill="#6a6690" opacity=".7"/>`;
  s += F(body.fore, '#34324e');
  s += `<path d="M1072,530C1040,512 1000,480 966,446L958,430L972,438C1006,468 1040,496 1088,528Z" fill="url(#${p}-plate)"/>`;
  s += `<path d="M1048,556C1020,532 990,500 956,466" fill="none" stroke="#14121f" stroke-width="2.5"/>`;
  s += `<path d="M988,450L976,474M1030,486L1018,510" stroke="${PAL.oath}" stroke-width="4"/>`;
  s += F(body.hand, '#3a3854');
  s += `<path d="M964,432L950,428L936,426L920,414L906,410L908,420L920,432L902,434L886,430L872,426L864,418L866,426L884,436L906,440L930,440L950,438Z" fill="#f2b28c"/>`;
  s += `<path d="M930,446C910,448 890,444 872,436" fill="none" stroke="#14121f" stroke-width="2"/>`;
  s += `<path d="M904,412L912,424" stroke="#a0604a" stroke-width="1.5"/>`;
  // ---- pauldron: layered plates, notch, moon edge, warm underside
  s += F(body.pauld, '#34324e');
  s += `<path d="M1080,404C1088,390 1104,382 1130,380C1144,382 1150,388 1154,392C1126,388 1100,396 1084,414Z" fill="#b8b2dc"/>`;
  s += `<path d="M1076,428C1094,420 1122,418 1150,424" fill="none" stroke="#14121f" stroke-width="3"/>`;
  s += `<path d="M1076,432C1082,444 1094,450 1114,452" fill="none" stroke="#e7a37f" stroke-width="3" opacity=".85"/>`;
  s += `<path d="M1096,382C1112,378 1132,378 1152,390" fill="none" stroke="#f4f0ff" stroke-width="2.5"/>`;
  // ---- the sword, held low in the far hand; blade crossing in front of the near leg
  s += `<path d="M1170,640L1182,632L1196,650L1184,658Z" fill="#3b2430"/>`;
  s += `<circle cx="1166" cy="652" r="14" fill="none" stroke="${PAL.oath}" stroke-width="4" stroke-dasharray="36 5 40 6"/>`;
  s += `<path d="M1158,662L1166,670L996,920L982,920Z" fill="url(#${p}-steelL)"/>`;
  s += `<path d="M1160,664L986,920" stroke="#efe9ff" stroke-width="1.6" opacity=".8"/>`;
  // ---- the fragment: warm light resting in the cupped gauntlet
  s += `<circle cx="902" cy="414" r="130" fill="url(#${p}-frag)" opacity=".8"/>`;
  s += `<use href="#${p}-sh1" transform="translate(900 412) rotate(-30) scale(.3)"/>`;
  s += L.vignette(p, R, 900, 412, 10, -10, 1, 4);
  s += `<circle cx="900" cy="412" r="5" fill="#fff6ea"/>`;
  return s;
}
