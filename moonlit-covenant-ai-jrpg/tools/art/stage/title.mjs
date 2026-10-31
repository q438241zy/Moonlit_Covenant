// Title background (audit B7 / contract R-5): public/assets/title-bg.svg, 1600x900, original vector art
// composed from the pieces the game already uses - no AI key-visual photo, no heroine in canon-wrong
// costume. One dusk under the eclipse that the title is named after, holding both ways into the game:
//   left  - 赫麦村 at dusk on its hill (tools/art/story/village.mjs, the same layout as the main-line
//           backgrounds), a road leaving it: 主线 · 亚克的旅程
//   right - the Silver Rail train crossing the plain (trainProfile() from the ending background,
//           tools/art/stage/scenes.mjs): 外传 · 银轨号 (IF)
//   sky   - the eclipse ringed by the faint eclipse sigil of the card back / crest (stage/lib.mjs)
// The centre column (what a 390px-wide phone keeps with background-size: cover) holds the eclipse;
// the lower 40% darkens so the title cards stay readable. No <text>, filters <= 4, ids prefixed "tbg-".
import { Scene, ridge, tree, pz, f } from '../story/lib.mjs';
import { village, VILLAGE_PAL } from '../story/village.mjs';
import { eclipseSigil, linear } from './lib.mjs';
import { trainProfile } from './scenes.mjs';

const r0 = (v) => f(v, 0);

export function titleBg() {
  const S = new Scene('tbg', '月蚀契约 标题背景：月蚀下的黄昏，左边山坡上的赫麦村，右边原野上驶过的银轨号列车', 2610);
  const R = S.R;
  const W = S.w, H = S.h, HZ = 560;

  // ---- sky: night overhead, dusk violet, a warm band on the horizon
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#06061a'], [0.3, '#141033'], [0.5, '#2e1f50'], [0.6, '#5a3466'], [0.66, '#a5566e'], [0.7, '#e08a72'], [1, '#2a1a30']])}"/>`);
  // stars, kept off the eclipse halo
  let st = '';
  for (let i = 0; i < 150; i++) {
    const x = R.range(0, W), y = R.range(0, 420);
    if (Math.hypot(x - 800, y - 200) < 250) continue;
    const r = R.range(0.5, 1.7);
    st += `<circle cx="${r0(x)}" cy="${r0(y)}" r="${f(r)}" opacity="${f(R.range(0.25, 0.9), 2)}"/>`;
  }
  S.add(`<g fill="#e8ddff">${st}</g>`);
  // the eclipse, top centre, inside a faint ring of the eclipse sigil
  const E = [800, 200];
  const corona = S.rad([[0.42, '#f6f0ff', 0.5], [0.55, '#c8b6ff', 0.22], [1, '#8f6be0', 0]]);
  S.add(`<g transform="translate(${E[0]} ${E[1]})" opacity=".1">${eclipseSigil('tbg', 214, { metal: '#e8ddff', gold: '#ffd091', corona: 'none', disc: '#100c26' })}</g>`);
  S.add(`<circle cx="${E[0]}" cy="${E[1]}" r="190" fill="${corona}"/>`);
  S.add(`<circle cx="${E[0]}" cy="${E[1]}" r="66" fill="#fff8ec" filter="${S.blur(1)}" opacity=".9"/>`);
  S.add(`<circle cx="${E[0] - 9}" cy="${E[1] - 5}" r="65" fill="#120e2c"/>`);
  S.add(`<circle cx="${E[0] + 50}" cy="${E[1] + 26}" r="6" fill="#ffffff" filter="${S.blur(1)}"/>`);
  // long cloud streaks lit from below by the last of the sun
  S.add(`<g filter="${S.blur(3)}" opacity=".55"><path d="M60,430C300,410,560,420,760,404V420C560,436,300,440,60,450Z" fill="#c07a9a"/><path d="M900,450C1100,436,1350,446,1600,430V448C1350,464,1100,462,900,470Z" fill="#ffb38a"/><path d="M420,350C620,338,860,346,1060,336V348C860,360,620,360,420,366Z" fill="#7a5aa8"/></g>`);
  // warm glow on the horizon behind both halves
  S.add(`<ellipse cx="800" cy="${HZ}" rx="980" ry="170" fill="${S.rad([[0, '#ffd091', 0.55], [0.4, '#ff9f7a', 0.25], [1, '#b05a8a', 0]])}"/>`);

  // ---- far mountains (one range across both halves)
  S.add(ridge(S, { base: HZ - 22, amp: 46, period: 300, seed: 61, fill: '#4c3a6e', shade: '#2e2450', shadeOp: 0.5, rim: '#ffc89a', rimOp: 0.35, bottom: HZ + 60 }).svg);
  S.add(ridge(S, { base: HZ + 6, amp: 22, period: 180, seed: 67, fill: '#2a2046', bottom: HZ + 80 }).svg);

  // ---- ground: the plain under the whole width (the hill and the rails sit on it, same gradient = no seam)
  const ground = S.lin([[0, '#3a2a4c'], [0.3, '#211833'], [1, '#0b0918']], 'x1="0" y1="540" x2="0" y2="900" gradientUnits="userSpaceOnUse"');
  S.add(`<path d="M-20,${HZ + 30}C400,${HZ + 22},1000,${HZ + 12},1620,${HZ + 8}V${H}H-20Z" fill="${ground}"/>`);

  // ---- left: 赫麦村 at nightfall on its hill
  const hill = [];
  for (let x = -20; x <= 820; x += 20) {
    const t = x / 800;
    hill.push([x, 540 + 70 * t * t + 10 * Math.sin(x / 90)]);
  }
  S.add(`<path d="${pz([...hill, [820, H], [-20, H]])}" fill="${ground}"/>`);
  S.add(`<path d="${hill.slice(0, 26).map(([x, y], i) => `${i ? 'L' : 'M'}${r0(x)},${r0(y)}`).join('')}" fill="none" stroke="#ffb38a" stroke-width="2" opacity=".35"/>`);
  const tpFar = { lit: '#5a5070', shade: '#2e2640', trunk: '#241c2c' };
  for (const [x, y, s] of [[86, 556, 0.5], [120, 552, 0.44], [520, 580, 0.46], [556, 590, 0.4]]) S.add(tree(R, x, y, s, tpFar));
  const V = village(S, 330, 600, 0.5, 'nightfall', { seed: 2611 });
  S.add(`<path d="${V.shadows}" fill="#0b0918" opacity=".35"/>`);
  S.add(V.svg);
  S.add(`<path d="${V.smokes}" fill="${VILLAGE_PAL.nightfall.smoke}" opacity=".3" filter="${S.blur(2)}"/>`);
  // window glow over the village
  S.add(`<ellipse cx="330" cy="590" rx="210" ry="60" fill="${S.rad([[0, '#ffc070', 0.22], [1, '#ffc070', 0]])}"/>`);
  // the road out of the village, down the hill toward the plain
  S.add(`<path d="M400,628C452,690,526,780,576,900H476C454,800,424,702,382,640Z" fill="#4a3650" opacity=".9"/>`);
  S.add(`<path d="M391,634C442,700,494,800,526,900" fill="none" stroke="#ffc89a" stroke-width="2.4" stroke-linecap="round" opacity=".3"/>`);

  // ---- right: the plain, the silver rails and the train
  S.add(`<ellipse cx="1200" cy="${HZ + 30}" rx="420" ry="34" fill="#ffc890" opacity=".1" filter="${S.blur(2)}"/>`);
  const TY = 650; // rail height under the train (train local coordinates, before scaling)
  const k = 0.66, tx = 950, ty = 214; // train placement: local (x, y) -> (tx + x*k, ty + y*k)
  // the rails come in from the bottom centre (beside the road) and swing right under the train
  const y0 = ty + (TY + 3) * k;
  const cub = (a, b, c, d, t) => a * (1 - t) ** 3 + 3 * b * t * (1 - t) ** 2 + 3 * c * t * t * (1 - t) + d * t ** 3;
  const A = [[722, 900], [786, 772], [900, y0 + 4], [1080, y0]], B = [[808, 900], [862, 780], [966, y0 + 9], [1080, y0 + 6]];
  const at = (C, t) => [cub(C[0][0], C[1][0], C[2][0], C[3][0], t), cub(C[0][1], C[1][1], C[2][1], C[3][1], t)];
  const railD = (C, dy) => `M${C[0][0]},${C[0][1]}C${C[1][0]},${C[1][1]} ${C[2][0]},${C[2][1]} ${C[3][0]},${r0(C[3][1])}L1620,${r0(y0 + dy - 6)}`;
  let ties = '';
  for (let i = 0; i < 16; i++) {
    const t = (i + 0.3) / 16, a = at(A, t), b = at(B, t);
    ties += `M${r0(a[0] - 4)},${r0(a[1] + 2)}L${r0(b[0] + 4)},${r0(b[1] + 2)}`;
  }
  for (let x = 1096; x < 1620; x += 15) ties += `M${x},${r0(y0 - 1 - (x - 1080) / 90)}l-3,${r0(9 - (x - 1080) / 180)}`;
  S.add(`<path d="${ties}" stroke="#120e22" stroke-width="4" stroke-linecap="round"/>`);
  S.add(`<path d="${railD(A, 0)}${railD(B, 6)}" fill="none" stroke="${S.lin([[0, '#ffe6c4'], [0.45, '#e8ddff'], [1, '#6a6690']], 'x1="1" y1="0" x2="0" y2="1"')}" stroke-width="2.8"/>`);
  // trainProfile() needs its own body gradient and the small blur at the shared ids
  S.def(linear('tbg-train', [[0, '#1a1530'], [1, '#0c0a1c']]));
  S.blur(1);
  const defs = [];
  const train = trainProfile('tbg', defs, TY - 2).join('');
  defs.forEach((d) => S.def(d));
  S.add(`<g transform="matrix(${k} 0 0 ${k} ${tx} ${ty})">${train}</g>`);
  // steam drifting back from the chimney, lit warm from the horizon
  S.add(`<g filter="${S.blur(2)}" opacity=".35"><ellipse cx="${r0(tx + 756 * k)}" cy="${r0(ty + 508 * k)}" rx="26" ry="11" fill="#e0d4f6"/><ellipse cx="${r0(tx + 676 * k)}" cy="${r0(ty + 484 * k)}" rx="56" ry="16" fill="#c4b6e6"/><ellipse cx="${r0(tx + 520 * k)}" cy="${r0(ty + 466 * k)}" rx="96" ry="20" fill="#a596cc"/></g>`);

  // ---- foreground: dark grass, a few frost glints, warm motes rising toward the eclipse
  let tufts = '';
  for (let i = 0; i < 46; i++) {
    const x = i < 24 ? R.range(-20, 520) : R.range(1080, 1620), y = R.range(842, 905), hgt = R.range(18, 50);
    tufts += `M${r0(x)},${r0(y)}q${r0(R.range(-8, 8))},${r0(-hgt * 0.6)} ${r0(R.range(-14, 14))},${r0(-hgt)}`;
  }
  S.add(`<path d="${tufts}" fill="none" stroke="#0d0a1c" stroke-width="3" stroke-linecap="round"/>`);
  let gl = '';
  for (let i = 0; i < 24; i++) {
    const x = R.range(820, W), y = R.range(HZ + 50, H - 60), s = R.range(0.6, 1.8) * (y - HZ) / 300;
    gl += `M${r0(x - s * 2)},${r0(y)}h${f(s * 4)}M${r0(x)},${r0(y - s * 2)}v${f(s * 4)}`;
  }
  S.add(`<path d="${gl}" stroke="#fff1dc" stroke-width="1.2" opacity=".45"/>`);
  let motes = '';
  for (let i = 0; i < 28; i++) {
    const x = R.range(200, 1400), y = R.range(260, 640);
    if (x > 940 && y > 550) continue; // not on the train
    motes += `<circle cx="${r0(x)}" cy="${r0(y)}" r="${f(R.range(1, 2.8))}" opacity="${f(R.range(0.25, 0.7), 2)}"/>`;
  }
  S.add(`<g fill="#ffd8a8">${motes}</g>`);
  // calm the lower 40% for the title cards, and a soft vignette
  S.add(`<rect y="520" width="${W}" height="380" fill="${S.lin([[0, '#070614', 0], [0.45, '#070614', 0.55], [1, '#070614', 0.9]])}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.6, '#070614', 0], [1, '#070614', 0.5]], 'cx="0.5" cy="0.4" r="0.75"')}"/>`);
  return S.out();
}
