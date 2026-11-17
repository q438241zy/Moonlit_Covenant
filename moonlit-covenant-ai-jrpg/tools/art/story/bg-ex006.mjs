// 番外 ex006 的场景背景（剧本/番外/ex006新曆祭.md〈美術需求〉）：north-slope-camp-festival（北山缓坡·营地·新历祭）、north-slope-camp-festival-night（北山缓坡·营地·新历祭之夜）。
//   north-slope-camp-festival       — the north-slope camp on the first day of the new calendar: a pale winter sky, the north
//                                     mountain with old snow on its peaks, the shepherd's cave in the rock on the left, tents
//                                     across the slope with lines of patchwork pennants strung between poles, one long cloth-
//                                     covered table running from near the cave down to the left foreground (bread baskets,
//                                     jugs, cups), Mara's little bread cart, an unlit log pile under an empty rope, and far
//                                     below on the right Hemai's winter fields and a small windmill.
//   north-slope-camp-festival-night — the same camp that night: stars, the pennant lines now strung with small warm lights,
//                                     the bonfire burning under a rope hung with cloth wish strips, lamplight in the cave
//                                     mouth and inside some tents, the long table half cleared.
// One layout function paints both, so the two always match. No figures, no text.
import { Scene, W, H, f, pz, persp, cloud, ridge, stars, windmill, flameMass, rng } from './lib.mjs';

const r0 = (v) => f(v, 0);
const f1 = (v) => f(v, 1);
const P = persp({ vp: [800, 440], F: 900, eye: 1.7 });
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;
const lerp = (a, b, t) => a + (b - a) * t;

// the long table: from near the cave (far end) down to the left foreground (near end), in ground metres
const TA = [-11, 26], TB = [-1, 5.2];
const TU = (() => { const dx = TB[0] - TA[0], dz = TB[1] - TA[1], l = Math.hypot(dx, dz); return [dx / l, dz / l]; })();
const TN = [-TU[1], TU[0]]; // perpendicular, pointing to +X (the side that faces the viewer)
const tableAt = (t, off = 0) => [lerp(TA[0], TB[0], t) + TN[0] * off, lerp(TA[1], TB[1], t) + TN[1] * off];

const PAL = {
  day: {
    sky: [[0, '#aec4da'], [0.42, '#cfdce8'], [0.62, '#e6ebea'], [0.78, '#f2ebdc'], [1, '#f2ebdc']],
    far: '#a2aec4', farShade: '#8290aa', snow: '#f4f6fa', snowShade: '#cdd6e4', farRim: '#ffffff',
    hill: '#8e9a84', hillShade: '#728070', hillRim: '#f4eed8',
    fields: ['#c9b97c', '#a3ae70', '#bca576', '#b1b884', '#d0bf86'], hedge: '#6e7458', valley: '#b4b498',
    ground: [[0, '#b0ae80'], [0.35, '#949468'], [1, '#56553e']], groundRim: '#f6eed4', frost: '#eef2f2',
    rock: '#9a958a', rockLit: '#c8c2b2', rockShade: '#6e6a62', cave: '#262220',
    tent: [['#e6dcc6', '#a89c86'], ['#d8cbb2', '#9a8e7a'], ['#e0d4bc', '#a2967e'], ['#cfc4ae', '#928672']],
    pole: '#4a3a2a', rope: '#5a4a3a',
    pennant: ['#c4584a', '#e0b050', '#5a9a96', '#f2e8d2', '#8a6a9a', '#7aa05a', '#d88a5a', '#5a78ac'],
    cloth: '#f1e9d6', clothSide: '#d6caae', clothShade: '#b8ab8e', runner: '#b4493a', bench: '#7a5a3c', benchShade: '#4e3826',
    basket: '#9a6a3a', loaf: '#d9a352', loafLit: '#f2cc84', jug: '#cdbca2', jugShade: '#9a8a74', cup: '#e4dccc',
    cart: '#8a6440', cartShade: '#5a4028', wheel: '#3e2e20', awning: '#c4584a', steamer: '#c8a878',
    log: '#5a3e28', logLit: '#8a643e', stone: '#8a867c', strip: null,
    grass: '#4e4e36', vignette: '#20201a',
  },
  night: {
    sky: [[0, '#070b20'], [0.45, '#111a36'], [0.7, '#1e2442'], [0.86, '#2c2a42'], [1, '#2c2a42']],
    far: '#1e2438', farShade: '#161a2c', snow: '#5a6480', snowShade: '#3e4660', farRim: '#7a86a8',
    hill: '#1c2026', hillShade: '#14171c', hillRim: '#4a5268',
    fields: ['#23242a', '#1e2226', '#25242a', '#202428', '#26252a'], hedge: '#121416', valley: '#1c1e24',
    ground: [[0, '#2a2824'], [0.4, '#201e1a'], [1, '#100e0c']], groundRim: '#5a5a6a', frost: '#4e5466',
    rock: '#26241f', rockLit: '#363229', rockShade: '#181612', cave: '#120e0c',
    tent: [['#5a4e40', '#2e2822'], ['#524638', '#2a241e'], ['#584c3e', '#2c2620'], ['#4e4436', '#28221c']],
    pole: '#1c1610', rope: '#2a2218',
    pennant: ['#6a3430', '#7a6232', '#2e504e', '#7a7062', '#4a3a52', '#3e5232', '#784a32', '#2e3e5a'],
    cloth: '#8a7a62', clothSide: '#6a5c48', clothShade: '#4a4034', runner: '#6a2a24', bench: '#3a2a1e', benchShade: '#22180e',
    basket: '#4a3420', loaf: '#7a5a30', loafLit: '#a07a44', jug: '#6a5e4e', jugShade: '#3e362c', cup: '#7a7062',
    cart: '#3a2a1c', cartShade: '#22180e', wheel: '#160e08', awning: '#5a2a24', steamer: '#5a4a34',
    log: '#2a1a10', logLit: '#5a3a20', stone: '#3a3630', strip: ['#f4e2c0', '#f0d6b0', '#ecdcc8', '#f6e8d0', '#e8cca8'],
    grass: '#0e0c0a', vignette: '#04040a',
  },
};

function festival(night) {
  const C = night ? PAL.night : PAL.day;
  const S = new Scene(night ? 'sbEx006Nite' : 'sbEx006Fest', night
    ? '北山缓坡·营地·新历祭之夜：星空下同一片坡地，彩旗绳上挂满亮着的小灯，篝火上方的绳子系着一排愿布，守羊洞口和几顶帐篷里亮着灯，长桌收了一半；不画人'
    : '北山缓坡·营地·新历祭：淡淡的冬日晴空，山顶有残雪的北山，坡上的帐篷之间拉满拼布彩旗，一张铺着布的长桌从守羊洞口摆到坡下，桌上有面包篮和壶，远处低处是赫麦的冬日麦田；不画人', night ? 60062 : 60061);
  const L = rng(60060); // layout randomness, identical for day and night
  const add = (s) => S.add(s);

  // ── sky ──
  add(`<rect width="${W}" height="${H}" fill="${S.lin(C.sky)}"/>`);
  if (!night) {
    add(`<circle cx="230" cy="150" r="560" fill="${S.rad([[0, '#fffaf0', 0.85], [0.12, '#fff2dc', 0.45], [0.45, '#f4e6d0', 0.12], [1, '#f4e6d0', 0]])}"/><circle cx="230" cy="150" r="30" fill="#fffdf6"/>`);
    const cc = { lit: '#f8f6f2', shade: '#c8d0dc', rim: '#ffffff' };
    add(`<g opacity=".75">${cloud(S.R, 640, 150, 300, 46, cc, { bumps: 6 })}${cloud(S.R, 1120, 110, 260, 40, cc, { bumps: 5 })}${cloud(S.R, 1380, 230, 200, 30, cc, { bumps: 5 })}</g>`);
  } else {
    add(stars(S.R, 150, [0, 0, W, 380], { maxR: 1.5, fill: '#e8ecff', op: [0.25, 0.95] }));
    // a faint river of stars across the sky
    add(`<path d="M-40,250C300,170,700,110,1100,80S1500,40,1660,20L1660,90C1400,110,1100,150,700,190S200,300,-40,330Z" fill="#8a96c8" opacity=".08" filter="${S.blur(3)}"/>`);
    add(stars(S.R, 90, [0, 30, W, 300], { maxR: 0.9, fill: '#dfe6ff', op: [0.2, 0.6] }));
  }

  // ── the north mountain, snow on its peaks ──
  const far = ridge(S, { step: 12, base: 405, amp: 24, period: 280, seed: 6101, fill: C.far, shade: C.farShade, shadeOp: 0.55, rim: C.farRim, rimOp: night ? 0.35 : 0.7, peaks: [[300, 150, 300], [640, 190, 300], [1010, 120, 250], [1380, 90, 260]], bottom: 560 });
  add(far.svg);
  {
    const line = 318;
    let snow = '', shade = '';
    const pts = far.pts;
    for (let i = 0; i < pts.length; i++) {
      if (pts[i][1] >= line) continue;
      let j = i;
      while (j + 1 < pts.length && pts[j + 1][1] < line) j++;
      const run = pts.slice(i, j + 1);
      if (run.length >= 2) {
        const low = run.map(([x, y]) => [x, Math.max(y + 4, line + L.range(-14, 10))]).reverse();
        snow += pz([...run, ...low]);
        // the shaded right flank of each snow cap
        const top = run.reduce((a, b) => (b[1] < a[1] ? b : a));
        const right = run.filter(([x]) => x >= top[0]);
        if (right.length >= 2) shade += pz([...right, ...right.map(([x, y]) => [x, Math.max(y + 4, line + L.range(-10, 6))]).reverse()]);
      }
      i = j;
    }
    add(`<path d="${snow}" fill="${C.snow}"/><path d="${shade}" fill="${C.snowShade}"/>`);
  }

  // ── far valley on the right: Hemai's winter fields, hedgerows, a small windmill ──
  add(`<path d="M520,438C800,430,1200,432,1660,436V520H520Z" fill="${C.valley}"/>`);
  {
    let rowsY = [440, 448, 458, 471, 488];
    const fields = C.fields.map(() => '');
    let hedges = '';
    for (let k = 0; k < rowsY.length - 1; k++) {
      const y0 = rowsY[k], y1 = rowsY[k + 1];
      let x = 540 + L.range(-20, 20);
      while (x < 1640) {
        const w = L.range(60, 150) * (1 + k * 0.35);
        const skew = (x - 1000) * 0.03;
        const ci = L.int(0, C.fields.length - 1);
        fields[ci] += pz([[x + skew, y0], [x + w + skew, y0], [x + w + skew * 1.3, y1], [x + skew * 1.3, y1]]);
        hedges += `M${r0(x + skew)},${r0(y0)}L${r0(x + skew * 1.3)},${r0(y1)}`;
        x += w;
      }
      hedges += `M520,${r0(y1)}L1660,${r0(y1)}`;
    }
    add(fields.map((d, i) => (d ? `<path d="${d}" fill="${C.fields[i]}"/>` : '')).join(''));
    add(`<path d="${hedges}" stroke="${C.hedge}" stroke-width="1.6" opacity=".6"/>`);
    let trees = '';
    for (let i = 0; i < 26; i++) { const x = L.range(560, 1620), y = L.pick(rowsY.slice(1)); trees += ell(x, y - 2, L.range(3, 7), L.range(2.5, 4.5)); }
    add(`<path d="${trees}" fill="${C.hedge}" opacity=".8"/>`);
    add(windmill(1392, 452, 0.2, 18, night
      ? { lit: '#3a3a44', shade: '#24242c', door: '#141418', roof: '#2a2a34', sail: '#4a4a56', frame: '#1a1a20' }
      : { lit: '#ece2cc', shade: '#b4a68e', door: '#5a4636', roof: '#9a6a4a', sail: '#f4ecdc', frame: '#6a5440' }));
  }

  // ── the hill shoulder behind the camp (rises to the left, towards the cave rock) ──
  add(ridge(S, { x0: -20, x1: 760, step: 12, base: 432, amp: 12, period: 220, seed: 6102, fill: C.hill, shade: C.hillShade, shadeOp: 0.5, rim: C.hillRim, rimOp: night ? 0.3 : 0.55, peaks: [[60, 150, 420]], bottom: 600 }).svg);

  // ── the camp ground ──
  add(`<path d="M-20,398C260,420,560,452,860,468S1360,486,1660,492V${H}H-20Z" fill="${S.lin(C.ground)}"/>`);
  add(`<path d="M-20,398C260,420,560,452,860,468S1360,486,1660,492" fill="none" stroke="${C.groundRim}" stroke-width="2" opacity="${night ? 0.25 : 0.55}"/>`);
  {
    // old snow lying in the hollows of the far slope: ragged, thin, only in the distance
    let frost = '';
    for (const [x, y, w] of [[660, 484, 120], [1000, 497, 150], [1320, 504, 170], [1540, 520, 110], [440, 468, 90]]) {
      const pts = [];
      for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([x - w / 2 + w * t, y - Math.sin(Math.PI * t) * L.range(2, 6)]); }
      for (let i = 8; i >= 0; i--) { const t = i / 8; pts.push([x - w / 2 + w * t + L.range(-4, 4), y + Math.sin(Math.PI * t) * L.range(1, 4)]); }
      frost += pz(pts);
    }
    add(`<path d="${frost}" fill="${C.frost}" opacity="${night ? 0.3 : 0.55}"/>`);
  }
  // a trodden path: from the foreground up to the fire place and on to the tents
  add(`<path d="M820,${H}C860,800 980,700 1060,620S1150,560 1180,520L1215,520C1200,566 1150,640 1110,700S1040,820 1060,${H}Z" fill="${night ? '#2c261e' : '#a89a72'}" opacity="${night ? 0.8 : 0.55}"/>`);

  // ── the cave rock on the left, the shepherd's cave mouth ──
  add(`<path d="M-20,250Q40,232 110,250Q190,272 250,330Q300,384 330,452L340,488L-20,500Z" fill="${C.rock}"/>`);
  add(`<path d="M-20,250Q40,232 110,250Q160,264 196,296Q120,286 60,300Q20,310 -20,330Z" fill="${C.rockLit}"/>`);
  add(`<path d="M250,330Q300,384 330,452L340,488L270,492Q286,420 238,352Z" fill="${C.rockShade}"/>`);
  // cracks and ledges in the rock
  add(`<path d="M20,350Q60,340 96,352M200,320Q226,350 236,392M30,420Q50,404 70,410M240,420Q262,440 268,470M120,300Q150,296 170,306" fill="none" stroke="${C.rockShade}" stroke-width="3" stroke-linecap="round" opacity=".7"/>`);
  add(`<path d="M-20,330Q30,316 70,322L60,334Q20,330 -20,344Z" fill="${C.rockLit}" opacity=".6"/>`);
  add(`<path d="M86,486Q84,392 150,382Q216,392 214,486Z" fill="${C.cave}"/>`);
  add(`<path d="M74,488Q72,384 150,372Q228,384 226,488" fill="none" stroke="${C.rockShade}" stroke-width="6" opacity=".6"/>`);
  if (night) {
    add(`<ellipse cx="150" cy="470" rx="150" ry="90" fill="${S.rad([[0, '#ffc870', 0.55], [1, '#ffc870', 0]])}"/>`);
    add(`<path d="M104,486Q104,412 150,404Q196,412 196,486Z" fill="${S.rad([[0, '#ffd890', 0.9], [0.6, '#e09040', 0.55], [1, '#3a2010', 0.6]], 'cx="0.5" cy="0.85" r="0.75"')}"/>`);
  }

  // ── tents across the slope ──
  const tents = [[-14, 34, 3.4, 2.5, 0], [-6, 31, 3.0, 2.2, 1], [3.5, 37, 3.6, 2.6, 2], [9, 27, 3.2, 2.3, 3], [16, 35, 3.4, 2.4, 1], [14, 19, 3.4, 2.5, 0], [-9.6, 15, 3.0, 2.3, 2], [22, 24, 3.2, 2.4, 3]];
  tents.sort((a, b) => b[1] - a[1]);
  const tentSvg = {};
  const tentGlow = night ? S.rad([[0, '#ffb860', 0.4], [1, '#ffb860', 0]]) : null;
  for (const [X, Z, w, h, ci] of tents) {
    const [x, y] = P(X, 0, Z), [, yt] = P(X, h, Z), ww = w / Z * 900, hh = y - yt;
    const [c1, c2] = C.tent[ci];
    let s = `<path d="M${r0(x - ww / 2)},${r0(y)}L${r0(x)},${r0(yt)}L${r0(x + ww * 0.12)},${r0(y)}Z" fill="${c1}"/><path d="M${r0(x)},${r0(yt)}L${r0(x + ww / 2)},${r0(y)}L${r0(x + ww * 0.12)},${r0(y)}Z" fill="${c2}"/>`;
    // the door flap
    const door = `M${r0(x - ww * 0.02)},${r0(y)}L${r0(x + ww * 0.05)},${r0(yt + hh * 0.42)}L${r0(x + ww * 0.12)},${r0(y)}Z`;
    s += night && ci !== 3 ? `<path d="${door}" fill="#ffc878"/>` : `<path d="${door}" fill="${night ? '#120e0a' : '#5a4e40'}" opacity=".7"/>`;
    if (night && ci !== 3) s += `<ellipse cx="${r0(x + ww * 0.05)}" cy="${r0(y)}" rx="${r0(ww * 0.55)}" ry="${r0(hh * 0.28)}" fill="${tentGlow}"/>`;
    s += `<path d="M${r0(x)},${r0(yt - hh * 0.1)}V${r0(y)}" stroke="${C.pole}" stroke-width="${f1(Math.max(1.5, ww * 0.025))}"/>`;
    s += `<path d="M${r0(x - ww / 2)},${r0(y)}L${r0(x - ww * 0.72)},${r0(y + hh * 0.05)}M${r0(x + ww / 2)},${r0(y)}L${r0(x + ww * 0.72)},${r0(y + hh * 0.05)}" stroke="${C.rope}" stroke-width="1.2"/>`;
    tentSvg[`${X},${Z}`] = s;
  }
  const farTents = tents.filter(([, Z]) => Z > 20), nearTents = tents.filter(([, Z]) => Z <= 20);
  add(farTents.map(([X, Z]) => tentSvg[`${X},${Z}`]).join(''));

  // ── the bonfire place (right of the table): log pile / fire, two poles and the wish rope ──
  const FZ = 12.5, FX = 4.4;
  const [fx, fy] = P(FX, 0, FZ);
  const ps = 900 / FZ; // pixels per metre at the fire
  const poleA = [FX - 2.1, FZ], poleB = [FX + 2.1, FZ];
  const [pax, pay] = P(poleA[0], 0, FZ), [, pat] = P(poleA[0], 3.3, FZ);
  const [pbx, pby] = P(poleB[0], 0, FZ), [, pbt] = P(poleB[0], 3.3, FZ);
  if (night) add(`<ellipse cx="${r0(fx)}" cy="${r0(fy)}" rx="${r0(ps * 7)}" ry="${r0(ps * 2.2)}" fill="${S.rad([[0, '#ffb050', 0.55], [0.5, '#e07a30', 0.2], [1, '#e07a30', 0]])}"/>`);
  // stone ring
  {
    let st = '';
    for (let i = 0; i < 11; i++) { const a = Math.PI * 2 * i / 11; st += ell(fx + Math.cos(a) * ps * 0.85, fy + Math.sin(a) * ps * 0.28, ps * 0.2, ps * 0.12); }
    add(`<path d="${st}" fill="${C.stone}"/>`);
  }
  // logs: a teepee in the day; the same logs burning at night
  {
    let logs = '', lit = '';
    for (let i = 0; i < 7; i++) {
      const a = -0.9 + i * 0.3, bx = fx + Math.sin(a) * ps * 0.7, by = fy + Math.cos(a) * ps * 0.06;
      const tx = fx + Math.sin(a) * ps * 0.08, ty = fy - ps * (night ? 0.75 : 1.15);
      logs += `M${r0(bx)},${r0(by)}L${r0(tx)},${r0(ty)}`;
      if (i % 2) lit += `M${r0(bx - 2)},${r0(by)}L${r0(tx - 2)},${r0(ty)}`;
    }
    add(`<path d="${logs}" stroke="${C.log}" stroke-width="${f1(ps * 0.13)}" stroke-linecap="round"/><path d="${lit}" stroke="${C.logLit}" stroke-width="${f1(ps * 0.04)}" stroke-linecap="round" opacity=".8"/>`);
  }
  if (night) {
    const fm = flameMass(S.R, fx - ps * 0.7, fy - ps * 0.1, fx + ps * 0.7, fy - ps * 0.1, ps * 1.9, { n: 7, wind: 0.1 });
    add(`<path d="${fm.body}" fill="#ff8a30"/><path d="${fm.licks}" fill="#ffb050"/><path d="${fm.edge}" fill="none" stroke="#ffd070" stroke-width="2" opacity=".8"/>`);
    add(`<ellipse cx="${r0(fx)}" cy="${r0(fy - ps * 0.3)}" rx="${r0(ps * 0.6)}" ry="${r0(ps * 0.35)}" fill="${S.rad([[0, '#fff2c0', 0.95], [0.6, '#ffd070', 0.6], [1, '#ffb050', 0]])}"/>`);
    let sparks = '';
    for (let i = 0; i < 26; i++) sparks += ell(fx + L.range(-ps * 1.2, ps * 1.6), fy - L.range(ps * 1.4, ps * 4.4), L.range(0.8, 2), L.range(0.8, 2));
    add(`<path d="${sparks}" fill="#ffd890"/>`);
  }
  // the two poles and the rope over the fire
  const ropeMid = [(pax + pbx) / 2, (pat + pbt) / 2 + ps * 0.45];
  add(`<path d="M${r0(pax)},${r0(pay)}V${r0(pat)}M${r0(pbx)},${r0(pby)}V${r0(pbt)}" stroke="${C.pole}" stroke-width="${f1(ps * 0.1)}" stroke-linecap="round"/>`);
  add(`<path d="M${r0(pax)},${r0(pat)}Q${r0(ropeMid[0])},${r0(ropeMid[1] + ps * 0.45)} ${r0(pbx)},${r0(pbt)}" fill="none" stroke="${night ? '#6a5040' : C.rope}" stroke-width="1.6"/>`);
  if (night) {
    // the wish strips: cloth tied along the rope, lit warm from the fire below
    const strips = C.strip.map(() => '');
    for (let i = 1; i < 16; i++) {
      const t = i / 16, x = (1 - t) * (1 - t) * pax + 2 * t * (1 - t) * ropeMid[0] + t * t * pbx;
      const y = (1 - t) * (1 - t) * pat + 2 * t * (1 - t) * (ropeMid[1] + ps * 0.45) + t * t * pbt;
      const len = ps * L.range(0.45, 0.7), wd = ps * 0.11, lean = L.range(-0.12, 0.12) * len;
      strips[i % strips.length] += pz([[x - wd / 2, y], [x + wd / 2, y], [x + wd / 2 + lean, y + len], [x - wd / 2 + lean, y + len * 0.96]]);
    }
    add(strips.map((d, i) => `<path d="${d}" fill="${C.strip[i]}"/>`).join(''));
  }

  // ── pennant lines strung between poles over the camp ──
  const poles = [[-12.5, 28], [-5, 20], [2.5, 25], [10, 21], [17, 28], [-6.4, 10.5], [1.6, 8.6]];
  const ropes = [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [5, 6], [6, 3]];
  const tops = poles.map(([X, Z]) => ({ g: P(X, 0, Z), t: P(X, 3.6, Z), Z }));
  let poleD = '';
  for (const { g, t, Z } of tops) poleD += `M${r0(g[0])},${r0(g[1])}L${r0(t[0])},${r0(t[1])}`;
  const pen = C.pennant.map(() => '');
  let ropeD = '', lights = '';
  for (const [a, b] of ropes) {
    const A = tops[a], B = tops[b];
    const dist = Math.hypot(B.t[0] - A.t[0], B.t[1] - A.t[1]);
    const mid = [(A.t[0] + B.t[0]) / 2, (A.t[1] + B.t[1]) / 2 + dist * 0.1];
    ropeD += `M${r0(A.t[0])},${r0(A.t[1])}Q${r0(mid[0])},${r0(mid[1])} ${r0(B.t[0])},${r0(B.t[1])}`;
    const n = Math.max(6, Math.round(dist / 26));
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const x = (1 - t) * (1 - t) * A.t[0] + 2 * t * (1 - t) * mid[0] + t * t * B.t[0];
      const y = (1 - t) * (1 - t) * A.t[1] + 2 * t * (1 - t) * mid[1] + t * t * B.t[1];
      const z = lerp(A.Z, B.Z, t), s = 900 / z * 0.32;
      const dx = 2 * (1 - t) * (mid[0] - A.t[0]) + 2 * t * (B.t[0] - mid[0]), dy = 2 * (1 - t) * (mid[1] - A.t[1]) + 2 * t * (B.t[1] - mid[1]);
      const dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl;
      const ci = L.int(0, C.pennant.length - 1);
      pen[ci] += pz([[x - ux * s * 0.5, y - uy * s * 0.5], [x + ux * s * 0.5, y + uy * s * 0.5], [x + L.range(-0.1, 0.1) * s, y + s * 1.25]]);
      if (night) lights += ell(x + ux * s * 0.5, y + uy * s * 0.5 + 2, Math.max(1.4, s * 0.09), Math.max(1.4, s * 0.09));
    }
  }
  const lineSvg = `<path d="${poleD}" stroke="${C.pole}" stroke-width="3" stroke-linecap="round"/><path d="${ropeD}" fill="none" stroke="${C.rope}" stroke-width="1.4"/>`
    + pen.map((d, i) => (d ? `<path d="${d}" fill="${C.pennant[i]}"/>` : '')).join('')
    + (night ? `<path d="${lights}" fill="#ffd27a" opacity=".9" filter="${S.blur(2)}"/><path d="${lights}" fill="#fff4cc"/>` : '');

  // ── the long table with its benches ──
  const Y = 0.78;
  const q = (pts) => pz(pts.map(([X, y, Z]) => P(X, y, Z)));
  const tP = (t, off, y) => { const [X, Z] = tableAt(t, off); return [X, y, Z]; };
  {
    // the bench on the far side: its legs, its seat, the thin edge of the seat
    let legs = '';
    for (const t of [0.05, 0.5, 0.95]) { const a = P(...tP(t, -0.95, 0.4)), b = P(...tP(t, -0.95, 0)); legs += `M${r0(a[0])},${r0(a[1])}L${r0(b[0])},${r0(b[1])}`; }
    add(`<path d="${legs}" stroke="${C.benchShade}" stroke-width="4"/>`);
    add(`<path d="${q([tP(0, -1.1, 0.45), tP(1, -1.1, 0.45), tP(1, -0.8, 0.45), tP(0, -0.8, 0.45)])}" fill="${C.bench}"/>`);
    add(`<path d="${q([tP(0, -1.1, 0.45), tP(1, -1.1, 0.45), tP(1, -1.1, 0.4), tP(0, -1.1, 0.4)])}" fill="${C.benchShade}"/>`);
  }
  // the cloth top and the drape on the side that faces the viewer, and the near end
  add(`<path d="${q([tP(0, -0.5, Y), tP(1, -0.5, Y), tP(1, 0.5, Y), tP(0, 0.5, Y)])}" fill="${C.cloth}"/>`);
  add(`<path d="${q([tP(0, 0.5, Y), tP(1, 0.5, Y), tP(1, 0.5, 0.52), tP(0, 0.5, 0.52)])}" fill="${C.clothSide}"/>`);
  add(`<path d="${q([tP(1, -0.5, Y), tP(1, 0.5, Y), tP(1, 0.5, 0.52), tP(1, -0.5, 0.52)])}" fill="${C.clothShade}"/>`);
  add(`<path d="${q([tP(0, -0.12, Y + 0.002), tP(1, -0.12, Y + 0.002), tP(1, 0.12, Y + 0.002), tP(0, 0.12, Y + 0.002)])}" fill="${C.runner}" opacity=".85"/>`);
  // legs under the drape
  {
    let legs = '';
    for (const t of [0.02, 0.35, 0.68, 0.98]) for (const off of [0.42, -0.42]) {
      const a = P(...tP(t, off, 0.52)), b = P(...tP(t, off, 0));
      legs += `M${r0(a[0])},${r0(a[1])}L${r0(b[0])},${r0(b[1])}`;
    }
    add(`<path d="${legs}" stroke="${C.benchShade}" stroke-width="5"/>`);
  }
  // things on the table, far to near
  {
    let items = '';
    const n = night ? [0.14, 0.42, 0.7, 0.9] : [0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92];
    n.forEach((t, k) => {
      const [X, Z] = tableAt(t, ((k % 2) ? 0.2 : -0.18));
      const [x, y] = P(X, Y, Z), s = 900 / Z;
      const kind = night ? ['basket', 'lantern', 'jug', 'cups'][k % 4] : ['basket', 'jug', 'cups', 'basket'][k % 4];
      if (kind === 'basket') {
        items += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${f1(s * 0.24)}" ry="${f1(s * 0.07)}" fill="${C.basket}"/>`;
        for (const [ox, oy] of [[-0.09, -0.04], [0.08, -0.05], [0, -0.09]]) items += `<ellipse cx="${f1(x + ox * s)}" cy="${f1(y + oy * s)}" rx="${f1(s * 0.085)}" ry="${f1(s * 0.06)}" fill="${C.loaf}"/><ellipse cx="${f1(x + ox * s - s * 0.02)}" cy="${f1(y + oy * s - s * 0.02)}" rx="${f1(s * 0.04)}" ry="${f1(s * 0.025)}" fill="${C.loafLit}"/>`;
      } else if (kind === 'jug') {
        const w = s * 0.08, h = s * 0.22;
        items += `<path d="M${f1(x - w * 0.6)},${f1(y)}Q${f1(x - w * 1.1)},${f1(y - h * 0.5)} ${f1(x - w * 0.45)},${f1(y - h)}H${f1(x + w * 0.45)}Q${f1(x + w * 1.1)},${f1(y - h * 0.5)} ${f1(x + w * 0.6)},${f1(y)}Z" fill="${C.jug}"/><path d="M${f1(x + w * 0.2)},${f1(y)}Q${f1(x + w * 1.0)},${f1(y - h * 0.5)} ${f1(x + w * 0.45)},${f1(y - h)}Q${f1(x + w * 1.1)},${f1(y - h * 0.5)} ${f1(x + w * 0.6)},${f1(y)}Z" fill="${C.jugShade}"/>`;
      } else if (kind === 'cups') {
        for (const ox of [-0.12, 0, 0.12]) { const cx = x + ox * s, w = s * 0.035, h = s * 0.07; items += `<path d="M${f1(cx - w)},${f1(y)}V${f1(y - h)}H${f1(cx + w)}V${f1(y)}Z" fill="${C.cup}"/>`; }
      } else {
        const w = s * 0.06, h = s * 0.16;
        items += `<ellipse cx="${f1(x)}" cy="${f1(y - h * 0.5)}" rx="${f1(s * 0.5)}" ry="${f1(s * 0.3)}" fill="#ffc870" opacity=".22"/><path d="M${f1(x - w)},${f1(y)}V${f1(y - h)}H${f1(x + w)}V${f1(y)}Z" fill="#ffe2a0"/><path d="M${f1(x - w * 1.3)},${f1(y - h)}H${f1(x + w * 1.3)}L${f1(x)},${f1(y - h * 1.35)}Z" fill="${C.pole}"/>`;
      }
    });
    add(items);
  }
  add(`<path d="${q([tP(0, 0.85, 0.45), tP(1, 0.85, 0.45), tP(1, 1.15, 0.45), tP(0, 1.15, 0.45)])}" fill="${C.bench}"/><path d="${q([tP(0, 1.15, 0.45), tP(1, 1.15, 0.45), tP(1, 1.15, 0.38), tP(0, 1.15, 0.38)])}" fill="${C.benchShade}"/>`);
  {
    let legs = '';
    for (const t of [0.05, 0.5, 0.95]) { const a = P(...tP(t, 1.1, 0.38)), b = P(...tP(t, 1.1, 0)); legs += `M${r0(a[0])},${r0(a[1])}L${r0(b[0])},${r0(b[1])}`; }
    add(`<path d="${legs}" stroke="${C.benchShade}" stroke-width="4"/>`);
  }

  // ── near tents, Mara's bread cart, the pennant lines in front of everything ──
  add(nearTents.map(([X, Z]) => tentSvg[`${X},${Z}`]).join(''));
  {
    const CX = -4.6, CZ = 6.6, s = 900 / CZ;
    const [x, y] = P(CX, 0, CZ);
    const bw = s * 1.3, bh = s * 0.45, by = y - s * 0.55;
    let c = `<path d="M${f1(x - bw / 2)},${f1(by)}h${f1(bw)}v${f1(bh)}h${f1(-bw)}Z" fill="${C.cart}"/><path d="M${f1(x - bw / 2)},${f1(by + bh * 0.7)}h${f1(bw)}v${f1(bh * 0.3)}h${f1(-bw)}Z" fill="${C.cartShade}"/>`;
    // stacked steamer baskets
    for (let i = 0; i < 3; i++) { const sy = by - s * 0.12 * (i + 1); c += `<path d="M${f1(x - s * 0.34)},${f1(sy + s * 0.12)}v${f1(-s * 0.1)}h${f1(s * 0.68)}v${f1(s * 0.1)}Z" fill="${C.steamer}"/><path d="M${f1(x - s * 0.34)},${f1(sy + s * 0.02)}h${f1(s * 0.68)}" stroke="${C.cartShade}" stroke-width="1.5"/>`; }
    // awning on two posts
    c += `<path d="M${f1(x - bw * 0.48)},${f1(by)}V${f1(by - s * 0.75)}M${f1(x + bw * 0.48)},${f1(by)}V${f1(by - s * 0.75)}" stroke="${C.cartShade}" stroke-width="${f1(s * 0.03)}"/>`;
    c += `<path d="M${f1(x - bw * 0.58)},${f1(by - s * 0.72)}L${f1(x)},${f1(by - s * 0.92)}L${f1(x + bw * 0.58)},${f1(by - s * 0.72)}L${f1(x + bw * 0.5)},${f1(by - s * 0.62)}H${f1(x - bw * 0.5)}Z" fill="${C.awning}"/>`;
    // wheels and handles
    c += `<circle cx="${f1(x - bw * 0.3)}" cy="${f1(y - s * 0.18)}" r="${f1(s * 0.18)}" fill="none" stroke="${C.wheel}" stroke-width="${f1(s * 0.04)}"/><circle cx="${f1(x + bw * 0.3)}" cy="${f1(y - s * 0.18)}" r="${f1(s * 0.18)}" fill="none" stroke="${C.wheel}" stroke-width="${f1(s * 0.04)}"/>`;
    c += `<path d="M${f1(x + bw / 2)},${f1(by + bh * 0.3)}L${f1(x + bw * 0.95)},${f1(by + bh * 0.1)}" stroke="${C.cartShade}" stroke-width="${f1(s * 0.035)}" stroke-linecap="round"/>`;
    add(c);
  }
  {
    // right foreground: a crate of spare pennant cloth and a water barrel beside the path
    const s = 900 / 5.6, [x, y] = P(3.2, 0, 5.6);
    const cw = s * 0.7, ch = s * 0.45, cd = s * 0.22;
    let c = `<path d="M${f1(x - cw / 2)},${f1(y)}v${f1(-ch)}h${f1(cw)}v${f1(ch)}Z" fill="${C.cart}"/><path d="M${f1(x + cw / 2)},${f1(y)}v${f1(-ch)}l${f1(cd)},${f1(-cd * 0.6)}v${f1(ch)}Z" fill="${C.cartShade}"/>`;
    c += `<path d="M${f1(x - cw / 2)},${f1(y - ch)}l${f1(cd)},${f1(-cd * 0.6)}h${f1(cw)}l${f1(-cd)},${f1(cd * 0.6)}Z" fill="${C.benchShade}"/>`;
    c += `<path d="M${f1(x - cw / 2)},${f1(y - ch * 0.5)}h${f1(cw)}" stroke="${C.cartShade}" stroke-width="2"/>`;
    // folded cloth spilling over the rim
    c += `<path d="M${f1(x - cw * 0.4)},${f1(y - ch - cd * 0.3)}q${f1(cw * 0.2)},${f1(-s * 0.12)} ${f1(cw * 0.45)},${f1(-s * 0.04)}l${f1(-cw * 0.05)},${f1(s * 0.16)}z" fill="${C.pennant[0]}"/><path d="M${f1(x)},${f1(y - ch - cd * 0.4)}q${f1(cw * 0.25)},${f1(-s * 0.1)} ${f1(cw * 0.45)},${f1(0)}l${f1(-cw * 0.02)},${f1(s * 0.2)}z" fill="${C.pennant[1]}"/>`;
    const bx = x + cw * 1.05, bw = s * 0.42, bh = s * 0.62;
    c += `<path d="M${f1(bx - bw / 2)},${f1(y)}Q${f1(bx - bw * 0.62)},${f1(y - bh / 2)} ${f1(bx - bw / 2)},${f1(y - bh)}H${f1(bx + bw / 2)}Q${f1(bx + bw * 0.62)},${f1(y - bh / 2)} ${f1(bx + bw / 2)},${f1(y)}Z" fill="${C.basket}"/>`;
    c += `<path d="M${f1(bx + bw * 0.1)},${f1(y)}Q${f1(bx + bw * 0.3)},${f1(y - bh / 2)} ${f1(bx + bw * 0.1)},${f1(y - bh)}H${f1(bx + bw / 2)}Q${f1(bx + bw * 0.62)},${f1(y - bh / 2)} ${f1(bx + bw / 2)},${f1(y)}Z" fill="${C.cartShade}" opacity=".6"/>`;
    c += `<path d="M${f1(bx - bw * 0.56)},${f1(y - bh * 0.25)}H${f1(bx + bw * 0.56)}M${f1(bx - bw * 0.56)},${f1(y - bh * 0.75)}H${f1(bx + bw * 0.56)}" stroke="${C.wheel}" stroke-width="3"/>`;
    c += `<ellipse cx="${f1(bx)}" cy="${f1(y - bh)}" rx="${f1(bw / 2)}" ry="${f1(bw * 0.14)}" fill="${night ? '#1c2030' : '#6a8090'}"/>`;
    add(c);
  }
  add(lineSvg);

  // ── foreground grass, then the light ──
  {
    let g = '';
    for (let i = 0; i < 80; i++) {
      const x = L.range(-20, 1620), y = L.range(720, 905), h = L.range(10, 26);
      g += `M${r0(x - 4)},${r0(y)}q2,${r0(-h * 0.6)} ${r0(L.range(-6, 6))},${r0(-h)}q2,${r0(h * 0.5)} 5,${r0(h)}z`;
    }
    add(`<path d="${g}" fill="${C.grass}" opacity=".55"/>`);
  }
  if (night) {
    add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#ffb060', 0.16], [0.4, '#ffb060', 0.05], [1, '#ffb060', 0]], `cx="${f(fx / W, 3)}" cy="${f(fy / H, 3)}" r="0.55"`)}"/>`);
    add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.45, C.vignette, 0], [1, C.vignette, 0.6]], 'cx="0.55" cy="0.5" r="0.8"')}"/>`);
  } else {
    add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.55, C.vignette, 0], [1, C.vignette, 0.38]], 'cx="0.45" cy="0.42" r="0.8"')}"/>`);
    add(`<rect y="660" width="${W}" height="240" fill="${S.lin([[0, C.vignette, 0], [1, C.vignette, 0.35]])}"/>`);
  }
  return S.out();
}

export const ex006Bgs = {
  'north-slope-camp-festival': () => festival(false),
  'north-slope-camp-festival-night': () => festival(true),
};
