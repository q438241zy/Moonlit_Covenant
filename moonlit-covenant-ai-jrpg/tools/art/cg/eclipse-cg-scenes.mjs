// Scene compositions for the five prologue CGs. Each scene is (L) => svg string, where L is
// ./eclipse-cg-lib.mjs. Ids are prefixed with the camelCase file name.

const VPX = 800;

// rivets along a line: a dotted stroke (round caps on zero-length dashes) + offset highlight dots
function rivets(L, x0, y0, x1, y1, n, r, fill = '#3c555c', hi = '#5d7a80') {
  const len = Math.hypot(x1 - x0, y1 - y0), gap = len / n;
  const d = `M${L.f(x0)},${L.f(y0)}L${L.f(x1)},${L.f(y1)}`;
  return `<path d="${d}" stroke="${fill}" stroke-width="${L.f(r * 2)}" stroke-linecap="round" stroke-dasharray="0 ${L.f(gap, 2)}"/>`
    + `<path d="${d}" transform="translate(${L.f(-r * 0.3)} ${L.f(-r * 0.3)})" stroke="${hi}" stroke-width="${L.f(r * 0.8)}" stroke-linecap="round" stroke-dasharray="0 ${L.f(gap, 2)}"/>`;
}

// =============================================================================================
// 1. intro-eye 「窗外的眼睛」
// =============================================================================================
function introEye(L) {
  const p = 'introEye';
  const { PAL, f } = L;
  const R = L.rng(2401);
  const VP = [800, 460];
  // back wall & window geometry
  const BW = { x0: 290, x1: 1310, y0: 100, y1: 790 };
  const W = { x0: 430, x1: 1170, y0: 150, y1: 690, r: 90 };
  const winPath = (o = 0) => `M${W.x0 - o},${W.y1 + o}V${W.y0 + W.r - o}Q${W.x0 - o},${W.y0 - o} ${W.x0 + W.r},${W.y0 - o}H${W.x1 - W.r}Q${W.x1 + o},${W.y0 - o} ${W.x1 + o},${W.y0 + W.r - o}V${W.y1 + o}Z`;
  const EYE = { x: 800, y: 430, R: 285 };

  const eye = L.eyeOnly(p, 0.5, { R: EYE.R, spin: 0.4 });
  const lia = L.figure(p, 'lia', 470, 1140, 0.8, { rimW: 4.5, glow: 0.5, topRim: '#ff3d55', topRimOp: 0.5 });
  const mia = L.figure(p, 'mia', 845, 1205, 0.7, { rimW: 4, glow: 0.55, topRim: '#ff3d55', topRimOp: 0.4 });
  const ser = L.figure(p, 'serenaCalm', 1150, 1140, 0.79, { rimW: 4.5, glow: 0.5, topRim: '#ff3d55', topRimOp: 0.5 });

  let defs = L.filters(p) + L.figureDefs(p) + L.dreamEaterDefs(p) + L.vignetteDefs(p) + L.frostDefs(p) + L.shardDefs(p) + eye.defs + lia.defs + mia.defs + ser.defs
    + L.linear(`${p}-ceil`, [[0, '#0b1014'], [1, '#18252a']])
    + L.linear(`${p}-wallL`, [[0, '#0d1418'], [1, '#1f3036']], 'x1="0" y1="0" x2="1" y2="0"')
    + L.linear(`${p}-wallR`, [[0, '#1f3036'], [1, '#0d1418']], 'x1="0" y1="0" x2="1" y2="0"')
    + L.linear(`${p}-floor`, [[0, '#141a22'], [1, '#07080d']])
    + L.radial(`${p}-red`, [[0, PAL.emergency, 0.75], [0.35, '#c41f3a', 0.3], [1, '#c41f3a', 0]])
    + L.radial(`${p}-amber`, [[0, '#fff0d0'], [0.12, PAL.amber, 0.8], [0.4, '#ff8a3c', 0.22], [1, '#ff8a3c', 0]])
    + L.radial(`${p}-bloom`, [[0, '#d9ccff', 0.5], [0.5, '#8f7ae0', 0.18], [1, '#5a46b0', 0]])
    + L.linear(`${p}-pool`, [[0, '#cbbcff', 0.42], [1, '#cbbcff', 0]])
    + L.linear(`${p}-brass`, [[0, '#d8b57a'], [0.3, '#8a6538'], [1, '#2e2010']])
    + L.radial(`${p}-vig`, [[0.55, '#000', 0], [1, '#000', 0.75]], 'r="0.75"')
    + L.linear(`${p}-fog`, [[0, '#e8ddff', 0], [1, '#e8ddff', 0.28]])
    + `<clipPath id="${p}-win"><path d="${winPath()}"/></clipPath>`;

  let s = '';
  // ---- room shell
  s += `<rect width="1600" height="900" fill="#0a0e12"/>`;
  s += `<path d="M0,0H1600L${BW.x1},${BW.y0}H${BW.x0}Z" fill="url(#${p}-ceil)"/>`;
  s += `<path d="M0,-105L${BW.x0},${BW.y0}V${BW.y1}L0,978Z" fill="url(#${p}-wallL)"/>`;
  s += `<path d="M1600,-105L${BW.x1},${BW.y0}V${BW.y1}L1600,978Z" fill="url(#${p}-wallR)"/>`;
  s += `<path d="M${BW.x0},${BW.y1}H${BW.x1}L1600,978H0Z" fill="url(#${p}-floor)"/>`;
  s += `<rect x="${BW.x0}" y="${BW.y0}" width="${BW.x1 - BW.x0}" height="${BW.y1 - BW.y0}" fill="#1a282d"/>`;
  // ceiling ribs (arched frames receding)
  for (const t of [0.25, 0.5, 0.72, 0.88]) {
    const xl = t * BW.x0, xr = 1600 - t * (1600 - BW.x1), y = t * BW.y0;
    s += `<path d="M${f(xl)},${f(y - 105 * (1 - t))}Q800,${f(y + 24 * t - 30 * (1 - t))} ${f(xr)},${f(y - 105 * (1 - t))}" fill="none" stroke="#24363c" stroke-width="${f(18 * (1 - t) + 4)}"/>`;
    s += `<path d="M${f(xl)},${f(y - 105 * (1 - t) + 9 * (1 - t) + 2)}Q800,${f(y + 24 * t - 30 * (1 - t) + 9 * (1 - t) + 2)} ${f(xr)},${f(y - 105 * (1 - t) + 9 * (1 - t) + 2)}" fill="none" stroke="#0a1013" stroke-width="2"/>`;
  }
  // side wall panels + rivets (left & right, mirrored)
  const sideWall = (mirror) => {
    let w = '';
    for (const x of [40, 130, 205, 255]) {
      const top = 100 - (290 - x) * 0.706, bot = 790 + (290 - x) * 0.647;
      const X = mirror ? 1600 - x : x;
      w += `<path d="M${X},${f(top)}V${f(bot)}" stroke="#0b1316" stroke-width="${f(3 + (290 - x) * 0.012)}"/>`;
      w += `<path d="M${X + (mirror ? -3 : 3)},${f(top)}V${f(bot)}" stroke="#2c4248" stroke-width="1.5"/>`;
      w += rivets(L, X + (mirror ? -9 : 9), top + 30, X + (mirror ? -9 : 9), Math.min(bot, 900), 14, 1.6 + (290 - x) * 0.01);
    }
    // brass dado rail
    const y0 = 470, y1 = 470 + (y0 - VP[1]) / (BW.x0 - VP[0]) * (0 - BW.x0);
    w += `<path d="M${mirror ? 1600 - BW.x0 : BW.x0},${y0}L${mirror ? 1600 : 0},${f(y1 + 6)}" stroke="url(#${p}-brass)" stroke-width="9"/>`;
    // luggage rack: two brass rails + net shadow
    const rack = (yb, w0) => { const yy = yb + (yb - VP[1]) / (BW.x0 - VP[0]) * (0 - BW.x0); return `<path d="M${mirror ? 1600 - BW.x0 - w0 : BW.x0 + w0},${yb}L${mirror ? 1600 - w0 * 2.2 : w0 * 2.2},${f(yy)}" stroke="${PAL.brass}" stroke-width="${f(3 + w0 * 0.05)}" opacity=".9"/>`; };
    w += rack(230, 18) + rack(262, 40);
    w += `<path d="M${mirror ? 1600 - 308 : 308},230L${mirror ? 1600 - 330 : 330},262L${mirror ? 1600 - 88 : 88},${f(262 + (262 - 460) / (-510) * (-290))}L${mirror ? 1600 - 40 : 40},${f(230 + (230 - 460) / (-510) * (-290))}Z" fill="#05090b" opacity=".55"/>`;
    // sconce lamp
    const lx = mirror ? 1600 - 150 : 150, ly = 380;
    w += `<circle cx="${lx}" cy="${ly}" r="${mirror ? 150 : 170}" fill="url(#${p}-amber)" opacity="${mirror ? 0.55 : 0.85}"/>`;
    w += `<path d="M${lx - 14},${ly + 40}h28l-6,14h-16Z" fill="${PAL.brassSh}"/><path d="M${lx - 20},${ly - 22}Q${lx},${ly - 44} ${lx + 20},${ly - 22}L${lx + 14},${ly + 30}H${lx - 14}Z" fill="#ffcf8a" opacity="${mirror ? 0.6 : 1}"/><path d="M${lx - 20},${ly - 22}Q${lx},${ly - 44} ${lx + 20},${ly - 22}" fill="none" stroke="${PAL.brass}" stroke-width="4"/>`;
    return w;
  };
  s += sideWall(false) + sideWall(true);

  // ---- back wall: riveted plates around the window
  s += `<path d="M${BW.x0},${BW.y0 + 230}H${W.x0 - 30}M${W.x1 + 30},${BW.y0 + 230}H${BW.x1}M${BW.x0},${BW.y1 - 60}H${BW.x1}" stroke="#0e171a" stroke-width="3"/>`;
  s += rivets(L, BW.x0 + 20, BW.y0 + 20, BW.x1 - 20, BW.y0 + 20, 40, 2.2) + rivets(L, BW.x0 + 20, BW.y0 + 20, BW.x0 + 20, BW.y1 - 20, 26, 2.2) + rivets(L, BW.x1 - 20, BW.y0 + 20, BW.x1 - 20, BW.y1 - 20, 26, 2.2);
  s += `<path d="M${BW.x0},${BW.y0}H${BW.x1}V${BW.y1}H${BW.x0}Z" fill="none" stroke="#0a1013" stroke-width="6"/>`;
  // window bloom on wall
  s += `<ellipse cx="800" cy="420" rx="680" ry="520" fill="url(#${p}-bloom)"/>`;

  // ---- outside: the Dream Eater pressed against the glass
  let out = `<rect x="${W.x0}" y="${W.y0}" width="${W.x1 - W.x0}" height="${W.y1 - W.y0}" fill="#060818"/>`;
  out += `<ellipse cx="${EYE.x}" cy="${EYE.y + 40}" rx="520" ry="460" fill="url(#${p}-skin)"/>`;
  // skin shards around the socket
  for (let i = 0; i < 70; i++) {
    const a = R() * Math.PI * 2, rr = R.range(EYE.R * 1.12, EYE.R * 1.7);
    const x = EYE.x + Math.cos(a) * rr, y = EYE.y + Math.sin(a) * rr;
    if (x < W.x0 - 30 || x > W.x1 + 30 || y < W.y0 - 30 || y > W.y1 + 30) continue;
    out += L.shard(p, R, x, y, R.range(26, 54), a * 180 / Math.PI + 90 + R.range(-30, 30), { vig: 0.45, glow: R() < 0.25 });
  }
  out += `<g transform="translate(${EYE.x} ${EYE.y})">${eye.body}</g>`;
  // shards on the heavy upper lid
  for (const [rr, n, op] of [[0.93, 15, 0.45], [0.8, 12, 0.7], [0.68, 9, 0.9]]) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI + (i + 0.5 + R.range(-0.2, 0.2)) / n * Math.PI;
      const x = EYE.x + Math.cos(a) * rr * EYE.R, y = EYE.y + Math.sin(a) * rr * EYE.R;
      if (y > EYE.y - EYE.R * 0.5 * Math.sqrt(Math.max(0, 1 - ((x - EYE.x) / EYE.R) ** 2)) - 16) continue;
      out += L.shard(p, R, x, y, R.range(40, 56) * rr, a * 180 / Math.PI + R.range(-12, 12), { vig: 0.45, op });
    }
  }
  // a lure dangling across the upper-left pane
  out += L.lure(p, 380, 120, 520, 140, 512, 300, 9);
  // breath fog on the lower glass
  out += `<rect x="${W.x0}" y="480" width="${W.x1 - W.x0}" height="210" fill="url(#${p}-fog)"/>`;
  // glass reflection streaks
  out += `<path d="M520,690L760,150M580,690L800,150M1010,690L1150,380" stroke="#ffffff" stroke-width="10" opacity=".05"/><path d="M640,690L860,150" stroke="#ffffff" stroke-width="3" opacity=".08"/>`;
  // memory frost creeping in from the frame
  const fr = L.rng(77);
  // frost: heaviest in the upper corners (visible above the party), creeping along every edge
  out += L.frost(p, fr, [[W.x0, W.y0 + 40], [W.x0, W.y1]], 0, 150, { density: 1.2, vig: 0.7, cornerBoost: 0.9 });
  out += L.frost(p, fr, [[W.x0 + 20, W.y0], [W.x0 + 380, W.y0]], 90, 130, { density: 1.2, vig: 0.7, cornerBoost: 0.9 });
  out += L.frost(p, fr, [[W.x1, W.y0 + 40], [W.x1, W.y1]], 180, 130, { density: 1.1, vig: 0.7, cornerBoost: 0.8 });
  out += L.frost(p, fr, [[W.x1 - 20, W.y0], [W.x1 - 330, W.y0]], 90, 110, { density: 1.1, vig: 0.7, cornerBoost: 0.8 });
  out += L.frost(p, fr, [[W.x0 + 330, W.y1], [W.x1 - 330, W.y1]], -90, 90, { density: 0.7, vig: 0.4, cornerBoost: 0 });
  s += `<g clip-path="url(#${p}-win)">${out}</g>`;
  // window frame (brass), transom bar and rivets
  s += `<path d="${winPath(22)}" fill="none" stroke="#0a0f12" stroke-width="10"/>`;
  s += `<path d="${winPath(10)}" fill="none" stroke="url(#${p}-brass)" stroke-width="18"/>`;
  s += `<path d="${winPath(1)}" fill="none" stroke="${PAL.brassSh}" stroke-width="3"/>`;
  s += `<path d="${winPath(20)}" fill="none" stroke="${PAL.brassHi}" stroke-width="2" opacity=".6"/>`;
  s += rivets(L, W.x0 - 11, W.y0 + 110, W.x0 - 11, W.y1, 10, 3, PAL.brassSh, PAL.brassHi) + rivets(L, W.x1 + 11, W.y0 + 110, W.x1 + 11, W.y1, 10, 3, PAL.brassSh, PAL.brassHi);
  // frost spilling over the frame onto the wall
  s += L.frost(p, fr, [[W.x0 - 22, W.y1 + 20], [W.x0 - 22, W.y1 - 300]], 180, 70, { density: 0.9, vig: 0.5, haze: 0.4 });
  s += L.frost(p, fr, [[W.x1 + 22, W.y1 + 20], [W.x1 + 22, W.y1 - 220]], 0, 60, { density: 0.8, vig: 0.5, haze: 0.4 });
  // fold-out table under the window: tipped teacup with frozen tea
  s += `<path d="M560,706H1040L1080,740H520Z" fill="#3a2a22"/><path d="M520,740H1080V752H520Z" fill="#1d1410"/><path d="M560,706H1040" stroke="${PAL.brassHi}" stroke-width="2" opacity=".6"/>`;
  s += `<g transform="translate(905 716) rotate(78)"><path d="M-16,-14H16L12,12H-12Z" fill="#e9e1ff"/><path d="M16,-8Q28,-6 22,6" fill="none" stroke="#e9e1ff" stroke-width="3"/></g><path d="M890,738Q860,746 812,742Q840,734 880,732Z" fill="#c9b8ff" opacity=".7"/>`;
  s += `<path d="M640,704L700,700L706,712L646,716Z" fill="#6b2a36"/><path d="M646,716L706,712" stroke="#ffd091" stroke-width="1.5" opacity=".6"/>`;
  // ---- emergency light on the ceiling
  s += `<ellipse cx="800" cy="60" rx="640" ry="260" fill="url(#${p}-red)"/>`;
  s += `<path d="M770,96H830L822,112H778Z" fill="#2b0a10"/><ellipse cx="800" cy="98" rx="24" ry="9" fill="#ff5b6e"/><ellipse cx="800" cy="98" rx="10" ry="4" fill="#ffd1d6"/>`;
  s += `<path d="M300,104H1300" stroke="#ff3d55" stroke-width="2" opacity=".35"/>`;
  // light pool on the floor + cold spill on the near walls
  s += `<path d="M${W.x0},${BW.y1}H${W.x1}L1420,960H180Z" fill="url(#${p}-pool)"/>`;
  s += `<path d="M560,790L640,790L470,960H330ZM960,790H1040L1270,960H1130Z" fill="#05060c" opacity=".5"/>`;
  // volumetric shafts from the window
  s += `<path d="M470,160L640,160L560,900H120ZM700,150H820L900,900H700ZM980,170L1120,170L1500,900H1180Z" fill="#d9ccff" opacity=".07"/>`;
  // ---- party
  s += lia.body + ser.body + mia.body;
  // frost particles drifting in the cold air
  let dust = '';
  for (let i = 0; i < 70; i++) dust += `<circle cx="${f(R.range(300, 1300))}" cy="${f(R.range(140, 860))}" r="${f(R.range(0.8, 2.6))}" opacity="${f(R.range(0.25, 0.8), 2)}"/>`;
  s += `<g fill="#efe9ff">${dust}</g>`;
  // vignette + bottom fade
  s += `<rect width="1600" height="900" fill="url(#${p}-vig)"/>`;
  s += `<rect y="720" width="1600" height="180" fill="url(#${p}-bot)"/>`;
  defs += L.linear(`${p}-bot`, [[0, '#070614', 0], [1, '#070614', 0.7]]);
  return L.svgDoc(p, '窗外的眼睛', defs, s);
}


// jagged torn edge between two points: returns array of points with teeth on the left side of a->b
function torn(R, a, b, n, amp) {
  const out = [];
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const ph = R() * 6.28, ph2 = R() * 6.28;
  for (let i = 0; i <= n; i++) {
    const t = (i + (i && i < n ? R.range(-0.35, 0.35) : 0)) / n;
    const env = Math.sin(Math.PI * t);
    const big = (Math.sin(t * 5 + ph) * 1.6 + Math.sin(t * 13 + ph2) * 0.6) * env;
    const spike = R() < 0.22 ? R.range(0.8, 2) : R.range(-0.25, 0.25);
    const k = i === 0 || i === n ? 0 : (big + spike) * amp;
    out.push([a[0] + dx * t + nx * k, a[1] + dy * t + ny * k]);
  }
  return out;
}
const P = (L, arr) => arr.map(([x, y]) => `${L.f(x, 0)},${L.f(y, 0)}`).join('L');

// =============================================================================================
// 4. battle-descend 「食梦兽降临」
// =============================================================================================
function battleDescend(L) {
  const p = 'battleDescend';
  const { PAL, f } = L;
  const R = L.rng(4404);
  const VP = [800, 690];
  const FW = { x0: 664, x1: 936, y0: 548, y1: 762 };
  // hole in the roof (jagged)
  const holeL = torn(R, [190, -10], [676, 520], 30, 24);
  const holeFar = torn(R, [676, 520], [924, 520], 10, 8);
  const holeR = torn(R, [924, 520], [1410, -10], 30, 24);
  const hole = [...holeL, ...holeFar.slice(1), ...holeR.slice(1)];
  const holeD = `M${P(L, hole)}Z`;

  const DE = L.dreamEaterFront(p, { phase: 0.8, noChin: true, noMouth: true, veil: true, seed: 21, bodyShards: 22, words: 26, spin: 1.1, fibres: 72, ruff: 0.9 });
  const lia = L.figure(p, 'liaRaise', 520, 935, 0.3, { rimW: 3, moonW: 2.5, glow: 0.6, topRim: PAL.moon, topRimOp: 0.8 });
  const ply = L.figure(p, 'player', 760, 945, 0.31, { rimW: 3, moonW: 2.5, glow: 0.5, topRim: PAL.moon, topRimOp: 0.8 });
  const mia = L.figure(p, 'mia', 960, 940, 0.29, { rimW: 3, moonW: 2.5, glow: 0.6, topRim: PAL.moon, topRimOp: 0.8 });
  const ser = L.figure(p, 'serena', 1170, 935, 0.31, { rimW: 3, moonW: 2.5, glow: 0.6, flip: true, topRim: PAL.moon, topRimOp: 0.8 });

  let defs = L.filters(p) + L.figureDefs(p) + L.dreamEaterDefs(p) + L.dreamEaterFrontDefs(p) + L.vignetteDefs(p) + L.shardDefs(p) + DE.defs
    + lia.defs + ply.defs + mia.defs + ser.defs
    + `<clipPath id="${p}-hole"><path d="${holeD}"/></clipPath>`
    + L.linear(`${p}-sky`, [[0, '#06051a'], [0.6, '#17123c'], [1, '#2a1f5a']])
    + L.radial(`${p}-riftGlow`, [[0, '#b58cff', 0.0], [0.55, '#b58cff', 0.0], [0.7, '#c9b0ff', 0.55], [1, '#6d4fc4', 0]])
    + L.linear(`${p}-wallL`, [[0, '#0a1013'], [1, '#1b2a30']], 'x1="0" y1="0" x2="1" y2="0"')
    + L.linear(`${p}-wallR`, [[0, '#1b2a30'], [1, '#0a1013']], 'x1="0" y1="0" x2="1" y2="0"')
    + L.linear(`${p}-ceil`, [[0, '#05080a'], [1, '#14201f']])
    + L.radial(`${p}-red`, [[0, PAL.emergency, 0.8], [0.3, '#c41f3a', 0.35], [1, '#c41f3a', 0]])
    + L.radial(`${p}-down`, [[0, '#e8ddff', 0.42], [0.5, '#b58cff', 0.14], [1, '#b58cff', 0]])
    + L.radial(`${p}-vig`, [[0.55, '#000', 0], [1, '#000', 0.8]], 'r="0.75"')
    + L.linear(`${p}-bot`, [[0, '#070614', 0], [1, '#070614', 0.85]])
    + L.linear(`${p}-glass`, [[0, '#2a2556'], [0.35, '#121630'], [0.5, '#1d2148'], [0.56, '#0e1226'], [1, '#090c1a']], 'x1="0" y1="0" x2="1" y2="1"');
  const eclipse = L.eclipse(p, 452, 92, 40, { bead: -35 });
  defs += eclipse.defs;

  let s = '';
  // ---- carriage interior (far end)
  s += `<rect width="1600" height="900" fill="#0b1114"/>`;
  s += `<path d="M0,280L${FW.x0},${FW.y0}V${FW.y1}L0,1180Z" fill="url(#${p}-wallL)"/>`;
  s += `<path d="M1600,280L${FW.x1},${FW.y0}V${FW.y1}L1600,1180Z" fill="url(#${p}-wallR)"/>`;
  s += `<path d="M${FW.x0},${FW.y1}H${FW.x1}L1600,1180H0Z" fill="#0c0f14"/>`;
  s += `<rect x="${FW.x0}" y="${FW.y0}" width="${FW.x1 - FW.x0}" height="${FW.y1 - FW.y0}" fill="#16232a"/>`;
  s += `<rect x="762" y="600" width="76" height="162" fill="#070a0c"/><rect x="772" y="612" width="56" height="60" rx="8" fill="#2b1418"/>`;
  s += `<circle cx="800" cy="584" r="150" fill="url(#${p}-red)"/><rect x="784" y="578" width="32" height="10" rx="3" fill="#ff6f80"/>`;
  // side windows in perspective (left & right), lit lilac from outside
  for (const side of [-1, 1]) {
    for (const [x0, w, y0, h] of [[60, 150, 360, 260], [300, 92, 440, 168], [470, 56, 494, 112], [574, 34, 524, 74]]) {
      const X0 = side < 0 ? x0 : 1600 - x0 - w;
      s += `<path d="M${X0},${y0 + h}V${y0 + w * 0.3}Q${X0 + w / 2},${y0 - w * 0.1} ${X0 + w},${y0 + w * 0.3 + (side < 0 ? w * 0.12 : -w * 0.12)}V${y0 + h + (side < 0 ? w * 0.25 : -w * 0.25)}Z" fill="url(#${p}-glass)" stroke="#5e4628" stroke-width="${f(w * 0.05)}"/>`;
    }
  }
  // brass rails along the walls
  s += `<path d="M0,620L${FW.x0},690M1600,620L${FW.x1},690" stroke="#8a6538" stroke-width="6"/>`;
  // light falling through the hole onto the interior
  s += `<ellipse cx="800" cy="700" rx="700" ry="300" fill="url(#${p}-down)"/>`;

  // ---- sky through the torn roof
  let sky = `<rect width="1600" height="600" fill="url(#${p}-sky)"/>`;
  sky += L.stars(R, 40, 180, 0, 1420, 520);
  sky += eclipse.body;
  // the rift: a black tear in the sky that the body squeezes out of
  const riftL = torn(R, [330, -20], [600, 96], 14, 10), riftR = torn(R, [1290, -20], [1010, 96], 14, 10);
  const riftD = `M${P(L, riftL)}L${P(L, riftR.slice().reverse())}Z`;
  sky += `<path d="${riftD}" fill="#9b7cf0" opacity=".6" filter="url(#${p}-b2)"/>`;
  sky += `<path d="${riftD}" fill="#010005"/>`;
  // the Dream Eater pouring out of the rift
  const T = 'translate(806 328) rotate(-5) scale(0.98)';
  sky += `<g transform="${T}">${DE.back}</g>`;
  sky += `<path d="M${P(L, riftL)}M${P(L, riftR)}" fill="none" stroke="#c9b0ff" stroke-width="7" opacity=".55" filter="url(#${p}-b1)"/><path d="M${P(L, riftL)}M${P(L, riftR)}" fill="none" stroke="#f3eeff" stroke-width="2.2"/>`;
  s += `<g clip-path="url(#${p}-hole)">${sky}</g>`;
  s += `<path d="M${P(L, [[664, 548], ...holeFar, [936, 548]])}Z" fill="url(#${p}-ceil)"/>`;
  s += `<g transform="${T}">${DE.body}</g>`;

  // ---- torn roof remnants (ceiling seen from below) + peeled edges
  const ceilL = [[0, -10], ...holeL, [664, 548], [0, 280]];
  const ceilR = [[1600, -10], ...holeR.slice().reverse(), [936, 548], [1600, 280]];
  const ceilF = [[664, 548], ...holeFar, [936, 548]];
  for (const c of [ceilL, ceilR]) s += `<path d="M${P(L, c)}Z" fill="url(#${p}-ceil)"/>`;
  // ribs: broken arched frames sticking into the hole
  for (const [x, y, len, a] of [[120, 120, 150, 40], [270, 250, 120, 36], [420, 372, 80, 32], [1480, 120, 150, 140], [1330, 250, 120, 144], [1180, 372, 80, 148]]) {
    const r = a * Math.PI / 180, ex = x + Math.cos(r) * len, ey = y + Math.sin(r) * len;
    s += `<path d="M${f(x - Math.cos(r) * 200, 0)},${f(y - Math.sin(r) * 200, 0)}L${f(ex, 0)},${f(ey, 0)}l${f(Math.cos(r + 0.9) * 26, 0)},${f(Math.sin(r + 0.9) * 26 - 18, 0)}" fill="none" stroke="#1d2b30" stroke-width="16" stroke-linejoin="bevel"/>`;
    s += `<path d="M${f(x - Math.cos(r) * 200, 0)},${f(y - Math.sin(r) * 200 - 7, 0)}L${f(ex, 0)},${f(ey - 7, 0)}" stroke="#7d8fb8" stroke-width="2" opacity=".6"/>`;
  }
  // lit torn lips (metal thickness catching the glow) + peeled teeth
  s += `<path d="M${P(L, holeL)}" fill="none" stroke="#c9bdf5" stroke-width="3" opacity=".8"/><path d="M${P(L, holeR)}" fill="none" stroke="#c9bdf5" stroke-width="3" opacity=".8"/><path d="M${P(L, holeFar)}" fill="none" stroke="#c9bdf5" stroke-width="2" opacity=".7"/>`;
  for (const pts of [holeL, holeR, holeFar]) {
    s += `<path d="M${P(L, pts)}" fill="none" stroke="#22343a" stroke-width="10" stroke-linejoin="round"/>`;
    s += `<path d="M${P(L, pts)}" fill="none" stroke="#d6cbff" stroke-width="2" opacity=".8" stroke-linejoin="round" transform="translate(0 -4)"/>`;
  }
  s += rivets(L, 20, 30, 640, 520, 30, 2.5, '#26363b', '#46606a') + rivets(L, 1580, 30, 960, 520, 30, 2.5, '#26363b', '#46606a');
  // dangling cables with sparks
  s += `<path d="M300,190C310,260,280,320,300,380M1290,180C1270,250,1310,300,1295,360" fill="none" stroke="#0a0d10" stroke-width="5"/>`;
  s += `<g fill="#ffe2b0"><circle cx="300" cy="382" r="4"/><circle cx="1295" cy="362" r="3"/></g><path d="M300,382l-14,22M300,382l12,18M300,382l2,26M1295,362l-10,16M1295,362l14,10" stroke="#ffd091" stroke-width="2"/>`;

  // ---- falling debris: metal fragments and loosened memory shards
  let deb = '';
  for (let i = 0; i < 14; i++) {
    const side = i % 2 ? 1 : -1, x = 800 + side * R.range(380, 640), y = R.range(120, 720), sz = R.range(7, 16) * (0.6 + y / 900);
    const pts2 = [0, 1, 2, 3].map((k) => { const a = k * 1.57 + R.range(-0.5, 0.5), r = sz * R.range(0.5, 1); return [x + Math.cos(a) * r * 1.4, y + Math.sin(a) * r * 0.7]; });
    deb += `<path d="M${P(L, pts2)}Z" fill="#0d1417" stroke="#b8acea" stroke-width="1" stroke-opacity=".6"/>`;
  }
  s += deb;
  let fall = '';
  for (let i = 0; i < 16; i++) fall += L.shard(p, R, R.range(380, 1220), R.range(420, 780), R.range(12, 24), R.range(0, 180), { vig: 0.3, glow: R() < 0.5 });
  s += fall;
  // streaks of descent
  s += `<path d="M300,120L320,260M1300,110L1280,250M380,300L392,380M1222,290L1210,370" stroke="#e8ddff" stroke-width="1.5" opacity=".22"/>`;

  // ---- party braced below
  s += lia.body + ply.body + mia.body + ser.body;
  // memory shards glowing on the floor
  let fl = '';
  for (let i = 0; i < 6; i++) fl += L.shard(p, R, R.range(300, 1300), R.range(800, 890), R.range(14, 26), R.range(-20, 20), { vig: 0.2, glow: true, op: 0.9 });
  s += fl;
  s += `<rect width="1600" height="900" fill="url(#${p}-vig)"/>`;
  s += `<rect y="760" width="1600" height="140" fill="url(#${p}-bot)"/>`;
  return L.svgDoc(p, '食梦兽降临', defs, s);
}

// dotted log-spiral arms (one path each): cheap "thousands of fireflies"
function spiralArms(L, cx, cy, arms, r0, r1, turns, R, opts = {}) {
  const { jitter = 18, rot = 0, squash = 1 } = opts;
  const out = [];
  for (let k = 0; k < arms; k++) {
    const a0 = rot + k / arms * Math.PI * 2 + R.range(-0.3, 0.3);
    const pts2 = [];
    const N = 20;
    for (let i = 0; i <= N; i++) {
      const t = i / N, r = r0 * Math.pow(r1 / r0, t), a = a0 + t * turns * Math.PI * 2;
      pts2.push([cx + Math.cos(a) * r + R.range(-jitter, jitter) * t, cy + Math.sin(a) * r * squash + R.range(-jitter, jitter) * t]);
    }
    out.push(L.smoothPath(pts2, false).replace(/(\d+\.\d)\d*/g, '$1'));
  }
  return out;
}

// =============================================================================================
// 5. battle-phase2 「记忆崩塌」
// =============================================================================================
function battlePhase2(L) {
  const p = 'battlePhase2';
  const { PAL, f } = L;
  const R = L.rng(5505);
  const C = [1000, 318];
  const DE = L.dreamEaterFront(p, { phase: 0.12, mouth: 0, noMouth: true, seed: 8, bodyShards: 0, words: 0, spin: 2.2, fibres: 56, ruff: 1, burst: 0.42, fins: false, lures: false, rimColor: '#ffc59a', barbs: 30, softBody: true });
  const lia = L.figure(p, 'liaRaise', 236, 742, 0.15, { rimW: 2.4, moonW: 1.5, glow: 0.7, topRim: PAL.oath, topRimOp: 0.9 });
  const ply = L.figure(p, 'player', 330, 744, 0.155, { rimW: 2.4, moonW: 1.5, glow: 0.6, topRim: PAL.oath, topRimOp: 0.9 });
  const mia = L.figure(p, 'mia', 412, 738, 0.145, { rimW: 2.4, moonW: 1.5, glow: 0.7, topRim: PAL.oath, topRimOp: 0.9 });
  const ser = L.figure(p, 'serena', 496, 734, 0.155, { rimW: 2.4, moonW: 1.5, glow: 0.7, topRim: PAL.oath, topRimOp: 0.9 });
  const ecl = L.eclipse(p, 190, 128, 46, { bead: 140 });
  let defs = L.filters(p) + L.figureDefs(p) + L.dreamEaterDefs(p) + L.dreamEaterFrontDefs(p) + L.vignetteDefs(p) + L.shardDefs(p) + DE.defs + ecl.defs
    + lia.defs + ply.defs + mia.defs + ser.defs
    + L.linear(`${p}-sky`, [[0, '#05041a'], [0.55, '#1a1440'], [0.8, '#3a2550'], [1, '#4a2a40']])
    + L.radial(`${p}-burst`, [[0, '#fff1e2', 0.75], [0.15, '#ffd091', 0.45], [0.45, '#ffb38a', 0.18], [1, '#ff8a6a', 0]])
    + L.radial(`${p}-core`, [[0, '#fff6ea', 0.95], [0.3, '#ffd091', 0.6], [0.65, '#ff9a6a', 0.22], [1, '#ff8a6a', 0]])
    + L.linear(`${p}-finDark`, [[0, '#ffd091', 0.25], [0.3, '#1a1838', 0.85], [1, '#0a0a1c', 0.95]], 'x1="0" y1="0" x2="0" y2="1"')
    + L.linear(`${p}-mtn1`, [[0, '#2a2350'], [1, '#14122c']])
    + L.linear(`${p}-mtn2`, [[0, '#15132e'], [1, '#0a0918']])
    + L.linear(`${p}-car`, [[0, '#2f454b'], [0.25, '#1d2c31'], [1, '#0d1417']])
    + L.linear(`${p}-roof`, [[0, '#ffd8b0'], [0.3, '#4b5e66'], [1, '#1c2a2f']])
    + L.radial(`${p}-vig`, [[0.6, '#000', 0], [1, '#000', 0.7]], 'r="0.75"')
    + L.linear(`${p}-bot`, [[0, '#070614', 0], [1, '#070614', 0.8]]);
  let s = '';
  // ---- sky, eclipse, warm bloom of the burst
  s += `<rect width="1600" height="900" fill="url(#${p}-sky)"/>`;
  s += L.stars(R, 14, 0, 0, 700, 500);
  s += ecl.body;
  s += `<circle cx="${C[0]}" cy="${C[1]}" r="900" fill="url(#${p}-burst)"/>`;
  s += `<circle cx="${C[0] - 20}" cy="${C[1] + 10}" r="420" fill="url(#${p}-core)"/>`;
  // ---- the wailing Dream Eater (head thrown back)
  const T = `translate(${C[0]} ${C[1]}) rotate(-10) scale(1.08 1.02)`;
  s += `<g transform="${T}">${DE.back}${DE.body}`;
  // tears of light falling from the squeezed crescent eye
  let tears = '';
  for (const [x0, dir] of [[-92, -1], [90, 1]]) for (let i = 0; i < 8; i++) tears += `<ellipse cx="${f(x0 + dir * i * 5 + R.range(-3, 3), 0)}" cy="${f(30 + i * 30 + R.range(-5, 5), 0)}" rx="${f(5.5 - i * 0.45)}" ry="${f(10 - i * 0.7)}"/>`;
  s += `<g fill="#f3eeff" opacity=".85">${tears}</g></g>`;
  // torrent of word fragments escaping the howling mouth
  let wd = '';
  for (let i = 0; i < 28; i++) {
    const t = R(), side = R() < 0.5 ? -1 : 1;
    const x = C[0] - 40 + side * (40 + t * 420) + R.range(-30, 30), y = C[1] + 290 - t * 260 + R.range(-40, 40) - Math.sin(t * 3) * 60;
    wd += L.glyph(R, x, y, 18 - t * 7);
  }
  s += `<path d="${wd}" fill="none" stroke="#c8f1ff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
  // ---- thousands of fireflies: dotted spiral arms + bloom
  const armsA = spiralArms(L, C[0], C[1] + 40, 9, 120, 1250, 0.62, R, { rot: 0.3, squash: 0.82, jitter: 30 });
  const armsB = spiralArms(L, C[0], C[1] + 40, 7, 200, 1150, 0.55, R, { rot: 1.1, squash: 0.85, jitter: 40 });
  defs += `<path id="${p}-armA" d="${armsA.join('')}"/><path id="${p}-armB" d="${armsB.join('')}"/>`;
  s += `<g fill="none" stroke-linecap="round">`;
  s += `<use href="#${p}-armA" stroke="#ffb38a" stroke-width="16" opacity=".22" filter="url(#${p}-b2)"/>`;
  s += `<use href="#${p}-armA" stroke="#ffd091" stroke-width="5" stroke-dasharray="0 17 0 9 0 31 0 13" opacity=".95"/>`;
  s += `<use href="#${p}-armA" stroke="#fff4e6" stroke-width="2.5" stroke-dasharray="0 23 0 41 0 7" stroke-dashoffset="9"/>`;
  s += `<use href="#${p}-armB" stroke="#ffb38a" stroke-width="4" stroke-dasharray="0 21 0 12 0 37" opacity=".8"/>`;
  s += `<use href="#${p}-armB" stroke="#ffe7c8" stroke-width="7" stroke-dasharray="0 59 0 83" opacity=".55"/>`;
  s += `</g>`;
  // larger fireflies with halos + loose shards carrying life fragments
  let ff = '';
  for (let i = 0; i < 18; i++) {
    const a = R() * Math.PI * 2, r = Math.pow(R(), 0.7) * 760 + 120;
    const x = C[0] + Math.cos(a) * r * 1.1, y = C[1] + 40 + Math.sin(a) * r * 0.75;
    if (y > 860 || x < -20 || x > 1620) continue;
    const rr = R.range(2, 4.5);
    ff += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(rr * 6, 0)}" fill="url(#${p}-warm)" opacity=".5"/><circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(rr)}" fill="#fff4e6"/>`;
  }
  s += ff;
  for (let i = 0; i < 8; i++) {
    const a = R() * Math.PI * 2, r = R.range(380, 760);
    const x = C[0] + Math.cos(a) * r, y = C[1] + Math.sin(a) * r * 0.7;
    if (y > 820) continue;
    s += L.shard(p, R, x, y, R.range(18, 34), a * 180 / Math.PI + R.range(-60, 60), { vig: 0.6, glow: true, op: 0.9 });
  }
  for (let i = 0; i < 12; i++) {
    const a = -Math.PI * R.range(-0.1, 1.1), r = R.range(420, 620);
    const x = C[0] + Math.cos(a) * r, y = C[1] + Math.sin(a) * r * 0.8;
    if (y > 600) continue;
    s += `<path d="M${f(C[0] + Math.cos(a) * (r - 60), 0)},${f(C[1] + Math.sin(a) * (r - 60) * 0.8, 0)}L${f(x, 0)},${f(y, 0)}" stroke="#ffd091" stroke-width="1.5" opacity=".28"/>`;
    s += L.shard(p, R, x, y, R.range(26, 46), a * 180 / Math.PI + R.range(-50, 50), { vig: 0.7, glow: true });
  }
  // ---- landscape: far ridges with mist
  s += `<path d="M0,640L120,590L230,620L360,560L480,610L620,575L760,620L900,585L1040,630L1180,590L1330,632L1460,600L1600,628V900H0Z" fill="url(#${p}-mtn1)"/>`;
  s += `<path d="M0,690L160,650L300,680L470,640L640,690L820,664L1000,700L1180,672L1380,706L1600,676V900H0Z" fill="url(#${p}-mtn2)"/>`;
  s += `<rect y="630" width="1600" height="90" fill="#d9a8c8" opacity=".07"/><rect y="668" width="1600" height="40" fill="#d9a8c8" opacity=".06"/>`;
  // ---- the Silver Rail train receding to the right; the lead carriage torn open
  const top = (x) => 708 - x * 0.052, bot = (x) => 838 - x * 0.118;
  let train = '';
  const cars = [[60, 600], [618, 1040], [1056, 1330], [1342, 1520]];
  cars.forEach(([x0, x1], ci) => {
    const t0 = top(x0), t1 = top(x1), b0 = bot(x0), b1 = bot(x1), h0 = b0 - t0, h1 = b1 - t1;
    const Y = (x, k) => top(x) + (bot(x) - top(x)) * k;
    // body with rounded roof shoulder, skirt and bogies
    train += `<path d="M${x0},${f(Y(x0, 0.14), 0)}Q${x0},${f(t0, 0)} ${x0 + 16},${f(t0 - 3, 0)}L${x1 - 12},${f(t1 - 3, 0)}Q${x1},${f(t1, 0)} ${x1},${f(Y(x1, 0.14), 0)}L${x1},${f(b1, 0)}L${x0},${f(b0, 0)}Z" fill="url(#${p}-car)"/>`;
    train += `<path d="M${x0},${f(Y(x0, 0.8), 0)}L${x1},${f(Y(x1, 0.8), 0)}L${x1},${f(b1, 0)}L${x0},${f(b0, 0)}Z" fill="#0b1114"/>`;
    train += `<path d="M${x0},${f(Y(x0, 0.64), 0)}L${x1},${f(Y(x1, 0.64), 0)}M${x0},${f(Y(x0, 0.17), 0)}L${x1},${f(Y(x1, 0.17), 0)}" stroke="${PAL.brass}" stroke-width="${f(3 - ci * 0.6)}" opacity=".9"/>`;
    for (const xb of [x0 + (x1 - x0) * 0.12, x0 + (x1 - x0) * 0.2, x1 - (x1 - x0) * 0.2, x1 - (x1 - x0) * 0.12]) train += `<circle cx="${f(xb, 0)}" cy="${f(bot(xb) - h0 * 0.04, 0)}" r="${f(h0 * 0.1 * (1 - ci * 0.22), 0)}" fill="#05070a" stroke="#3a4248" stroke-width="1.5"/>`;
    const nW = Math.round((x1 - x0) / 54);
    let lit = '', dark = '';
    for (let w = 0; w < nW; w++) {
      const xa = x0 + (x1 - x0) * (w + 0.22) / nW, xb = x0 + (x1 - x0) * (w + 0.78) / nW;
      const d = `M${f(xa, 0)},${f(Y(xa, 0.28), 0)}L${f(xb, 0)},${f(Y(xb, 0.28), 0)}L${f(xb, 0)},${f(Y(xb, 0.56), 0)}L${f(xa, 0)},${f(Y(xa, 0.56), 0)}Z`;
      if (R() < 0.72) lit += d; else dark += d;
    }
    train += `<path d="${lit}" fill="#ffb45e" stroke="#6b4a26" stroke-width="1.5"/><path d="${dark}" fill="#141b2c" stroke="#3a4248" stroke-width="1.5"/>`;
    if (ci < 3) train += `<path d="M${x1},${f(Y(x1, 0.2), 0)}L${cars[ci + 1][0]},${f(Y(cars[ci + 1][0], 0.2), 0)}L${cars[ci + 1][0]},${f(Y(cars[ci + 1][0], 0.78), 0)}L${x1},${f(Y(x1, 0.78), 0)}Z" fill="#0a0f12"/>`;
  });
  s += train;
  s += `<path d="M640,674L1040,652M1072,650L1330,637M1352,636L1520,627" stroke="#ffd8b0" stroke-width="2.5" opacity=".8"/>`;
  // torn lead carriage: jagged opening, lilac interior glow
  const tear = [[90, 704], [140, 690], [170, 712], [210, 694], [260, 716], [300, 690], [350, 713], [400, 692], [450, 712], [500, 688], [560, 705], [590, 700]];
  s += `<path d="M${tear.map(([x, y]) => `${x},${y}`).join('L')}L590,722L90,728Z" fill="#c8b8ff" opacity=".35"/>`;
  s += `<path d="M${tear.map(([x, y]) => `${x},${y}`).join('L')}" fill="none" stroke="#ffd8b0" stroke-width="3"/>`;
  s += `<path d="M150,690L132,656L168,676M330,690L344,650L360,684M500,688L520,654L532,690" fill="#1d2c31" stroke="#ffd8b0" stroke-width="1.5"/>`;
  // rails + embankment
  s += `<path d="M0,862L1600,690M0,890L1600,702" stroke="#6b5a7a" stroke-width="2" opacity=".6"/>`;
  s += `<path d="M0,900V870L1600,704V900Z" fill="#07060f" opacity=".6"/>`;
  // ---- the party on the torn carriage, braced against the shockwave
  s += lia.body + ply.body + mia.body + ser.body;
  // shockwave ring
  s += `<rect width="1600" height="900" fill="url(#${p}-vig)"/>`;
  s += `<rect y="780" width="1600" height="120" fill="url(#${p}-bot)"/>`;
  return L.svgDoc(p, '记忆崩塌', defs, s);
}

// =============================================================================================
// 3. corridor-frost 「记忆之霜」
// =============================================================================================
function corridorFrost(L) {
  const p = 'corridorFrost';
  const { PAL, f } = L;
  const R = L.rng(3303);
  const VP = [640, 420], K = 0.06;
  const NR = { x0: -140, x1: 1660, y0: -600, y1: 1480 }; // near cross-section: a tall, narrow corridor
  const s = (d) => 1 / (1 + d * (1 / K - 1));
  const at = (nx, ny, d) => [VP[0] + s(d) * (nx - VP[0]), VP[1] + s(d) * (ny - VP[1])];
  const lerp = (a, b, t) => a + (b - a) * t;
  // wall points: h = 0 floor .. 1 ceiling; u = 0 left .. 1 right across ceiling/floor
  const LW = (d, h) => at(NR.x0, lerp(NR.y1, NR.y0, h), d);
  const RW = (d, h) => at(NR.x1, lerp(NR.y1, NR.y0, h), d);
  const CE = (d, u) => at(lerp(NR.x0, NR.x1, u), NR.y0, d);
  const FL = (d, u) => at(lerp(NR.x0, NR.x1, u), NR.y1, d);
  const q = (pts) => `M${pts.map(([x, y]) => `${f(x, 0)},${f(y, 0)}`).join('L')}Z`;
  const quad = (F, d0, d1, a0, a1) => q([F(d0, a0), F(d1, a0), F(d1, a1), F(d0, a1)]);
  const HAND = [1150, 500];

  let defs = L.filters(p) + L.dreamEaterDefs(p) + L.vignetteDefs(p) + L.frostDefs(p, 515) + L.shardDefs(p) + L.frostTile(p, 240)
    + [[1, 'a'], [0.62, 'b'], [0.36, 'c'], [0.2, 'd']].map(([k, n]) => `<pattern id="${p}-ft${n}" width="240" height="240" patternUnits="userSpaceOnUse" patternTransform="translate(${VP[0]} ${VP[1]}) scale(${k})"><use href="#${p}-ftile"/></pattern>`).join('')
    + L.linear(`${p}-wallL`, [[0, '#0c1316'], [1, '#22343a']], 'x1="0" y1="0" x2="1" y2="0"')
    + L.linear(`${p}-wallR`, [[0, '#24383e'], [1, '#0b1215']], 'x1="0" y1="0" x2="1" y2="0"')
    + L.linear(`${p}-ceil`, [[0, '#06090b'], [1, '#18252a']])
    + L.linear(`${p}-floor`, [[0, '#1a1418'], [1, '#060507']])
    + L.radial(`${p}-red`, [[0, PAL.emergency, 0.85], [0.3, '#c41f3a', 0.32], [1, '#c41f3a', 0]])
    + L.radial(`${p}-memGlow`, [[0, '#fff3e2', 0.95], [0.18, '#ffd091', 0.7], [0.45, '#ffb38a', 0.28], [1, '#ff8a6a', 0]])
    + L.radial(`${p}-memDisc`, [[0, '#ffe9c8'], [0.55, '#ffc27a'], [0.85, '#e8865a'], [1, '#b85a48']], 'cx="0.5" cy="0.35" r="0.65"')
    + L.linear(`${p}-glass`, [[0, '#1d2550'], [1, '#0a0d1e']])
    + L.linear(`${p}-glove`, [[0, '#2a2236'], [1, '#100c18']], 'x1="0" y1="0" x2="0" y2="1"')
    + L.radial(`${p}-vig`, [[0.5, '#000', 0], [1, '#000', 0.8]], 'r="0.75"')
    + L.radial(`${p}-cold`, [[0, '#d9ccff', 0.3], [1, '#d9ccff', 0]])
    + L.radial(`${p}-focus`, [[0.22, '#0a1014', 0], [0.6, '#0a1014', 0.45], [1, '#0a1014', 0.72]], `gradientUnits="userSpaceOnUse" cx="${HAND[0]}" cy="${HAND[1]}" r="700"`)
    + L.linear(`${p}-hazeR`, [[0, '#d9ccff', 0.0], [0.5, '#d9ccff', 0.12], [1, '#d9ccff', 0.3]], 'x1="0" y1="0" x2="1" y2="0"')
    + L.linear(`${p}-hazeL`, [[0, '#d9ccff', 0.26], [1, '#d9ccff', 0]], 'x1="0" y1="0" x2="1" y2="0"')
    + `<clipPath id="${p}-mem"><circle cx="0" cy="0" r="92"/></clipPath>`;

  let g = '';
  // ---- shell
  g += `<rect x="-400" y="-400" width="2400" height="1700" fill="#090d10"/>`;
  g += q([CE(0, 0), CE(0, 1), CE(1, 1), CE(1, 0)]).replace(/^/, '<path d="') + `" fill="url(#${p}-ceil)"/>`;
  g += `<path d="${q([LW(0, 0), LW(0, 1), LW(1, 1), LW(1, 0)])}" fill="url(#${p}-wallL)"/>`;
  g += `<path d="${q([RW(0, 0), RW(0, 1), RW(1, 1), RW(1, 0)])}" fill="url(#${p}-wallR)"/>`;
  g += `<path d="${q([FL(0, 0), FL(0, 1), FL(1, 1), FL(1, 0)])}" fill="url(#${p}-floor)"/>`;
  // far end door with a red lamp
  const [fx0, fy0] = at(NR.x0, NR.y0, 1), [fx1, fy1] = at(NR.x1, NR.y1, 1);
  g += `<rect x="${f(fx0, 0)}" y="${f(fy0, 0)}" width="${f(fx1 - fx0, 0)}" height="${f(fy1 - fy0, 0)}" fill="#141e22"/>`;
  g += `<rect x="${f(lerp(fx0, fx1, 0.3), 0)}" y="${f(lerp(fy0, fy1, 0.2), 0)}" width="${f((fx1 - fx0) * 0.4, 0)}" height="${f((fy1 - fy0) * 0.8, 0)}" fill="#070b0d"/>`;
  g += `<circle cx="${f((fx0 + fx1) / 2, 0)}" cy="${f(lerp(fy0, fy1, 0.12), 0)}" r="40" fill="url(#${p}-red)"/>`;
  // carpet runner
  g += `<path d="${q([FL(0, 0.3), FL(0, 0.7), FL(1, 0.7), FL(1, 0.3)])}" fill="#3a1820"/>`;
  g += `<path d="M${FL(0, 0.33).map((v) => f(v, 0)).join(',')}L${FL(1, 0.33).map((v) => f(v, 0)).join(',')}M${FL(0, 0.67).map((v) => f(v, 0)).join(',')}L${FL(1, 0.67).map((v) => f(v, 0)).join(',')}" stroke="${PAL.brass}" stroke-width="3" opacity=".5"/>`;
  // wall structure: dado rail, panel seams, windows (left), compartment doors (right)
  const line = (F, d0, d1, a) => `M${F(d0, a).map((v) => f(v, 0)).join(',')}L${F(d1, a).map((v) => f(v, 0)).join(',')}`;
  g += `<path d="${line(LW, 0, 1, 0.4)}${line(RW, 0, 1, 0.4)}" stroke="#8a6538" stroke-width="6"/>`;
  g += `<path d="${line(LW, 0, 1, 0.97)}${line(RW, 0, 1, 0.97)}${line(LW, 0, 1, 0.04)}${line(RW, 0, 1, 0.04)}" stroke="#05090b" stroke-width="5"/>`;
  const depths = [0.0, 0.18, 0.36, 0.52, 0.66, 0.78, 0.88, 0.95];
  for (let i = 0; i < depths.length - 1; i++) {
    const d0 = depths[i] + 0.03, d1 = depths[i + 1] - 0.03;
    // windows
    g += `<path d="${quad(LW, d0, d1, 0.5, 0.86)}" fill="url(#${p}-glass)" stroke="#5e4628" stroke-width="${f(10 * s(d0), 1)}"/>`;
    // doors
    g += `<path d="${quad(RW, d0 + 0.02, d1 - 0.02, 0.05, 0.84)}" fill="#1a1612" stroke="#3a2c1c" stroke-width="${f(8 * s(d0), 1)}"/>`;
    g += `<path d="${quad(RW, d0 + 0.05, d1 - 0.05, 0.5, 0.78)}" fill="#26304a"/>`;
    const [hx, hy] = RW(d1 - 0.06, 0.42);
    g += `<circle cx="${f(hx, 0)}" cy="${f(hy, 0)}" r="${f(7 * s(d1), 1)}" fill="${PAL.brassHi}"/>`;
    // seams
    g += `<path d="${line((d, h) => LW(depths[i], h), 0, 0, 0)}M${LW(depths[i], 0).map((v) => f(v, 0)).join(',')}L${LW(depths[i], 1).map((v) => f(v, 0)).join(',')}M${RW(depths[i], 0).map((v) => f(v, 0)).join(',')}L${RW(depths[i], 1).map((v) => f(v, 0)).join(',')}" stroke="#070c0e" stroke-width="${f(6 * s(depths[i]), 1)}"/>`;
  }
  // ceiling emergency lights (flickering: uneven intensity)
  const flick = [1, 0.25, 0.9, 0.5, 0.95, 0.3, 0.8];
  for (let i = 0; i < depths.length - 1; i++) {
    const d = (depths[i] + depths[i + 1]) / 2, [cx, cy] = CE(d, 0.5), sc = s(d);
    g += `<ellipse cx="${f(cx, 0)}" cy="${f(cy + 40 * sc, 0)}" rx="${f(520 * sc, 0)}" ry="${f(300 * sc, 0)}" fill="url(#${p}-red)" opacity="${flick[i]}"/>`;
    g += `<rect x="${f(cx - 40 * sc, 0)}" y="${f(cy - 4 * sc, 0)}" width="${f(80 * sc, 0)}" height="${f(16 * sc, 0)}" rx="${f(4 * sc, 0)}" fill="${flick[i] > 0.6 ? '#ff7a8a' : '#4a1820'}"/>`;
  }
  // cold frost light wash
  g += `<ellipse cx="1150" cy="420" rx="700" ry="600" fill="url(#${p}-cold)"/>`;

  // ---- memory frost: walls coated by a crystalline texture (perspective bands), haze, junction crust
  const fr = L.rng(66);
  const along = (F, a, d0 = 0, d1 = 0.9, n = 10) => Array.from({ length: n + 1 }, (_, i) => F(d0 + (d1 - d0) * i / n, a));
  const FO = { color: '#d8ccff', fernOp: 0.5 };
  const bands = [[0, 0.08, 'a'], [0.08, 0.2, 'b'], [0.2, 0.4, 'c'], [0.4, 0.7, 'd']];
  for (const [d0, d1, n] of bands) {
    // right wall: coat everything but a ragged clear stripe at mid-height that thins with distance
    g += `<path d="${quad(RW, d0, d1, 0, 1)}" fill="url(#${p}-ft${n})" opacity="${f(0.68 - d0 * 0.8, 2)}"/>`;
    g += `<path d="${quad(LW, d0, d1, 0, 0.42)}${quad(LW, d0, d1, 0.84, 1)}" fill="url(#${p}-ft${n})" opacity="${f(0.75 - d0, 2)}"/>`;
  }
  for (let i = 0; i < 2; i++) {
    const d0 = depths[i] + 0.03, d1 = depths[i + 1] - 0.03, sc = s(d0);
    g += L.frost(p, fr, [LW(d0, 0.5), LW(d1, 0.5)], -80, 140 * sc, { ...FO, density: 0.9, vig: 0.5, cornerBoost: 0.6, scale: sc * 1.4, haze: 0.4 });
    g += L.frost(p, fr, [LW(d0, 0.86), LW(d0, 0.5)], 0, 120 * sc, { ...FO, density: 0.8, vig: 0.3, cornerBoost: 0.8, scale: sc * 1.2, haze: 0.35 });
  }
  // frost haze, heavier near the camera and around the hand
  g += `<path d="${quad(RW, 0, 0.5, 0, 1)}" fill="url(#${p}-hazeR)"/>`;
  g += `<path d="${quad(LW, 0, 0.6, 0, 1)}" fill="url(#${p}-hazeL)"/>`;
  g += L.frost(p, fr, along(RW, 0.02, 0, 0.8), -100, 170, { ...FO, density: 0.6, vig: 0.3, cornerBoost: 0.8, scale: 1 });
  g += L.frost(p, fr, along(RW, 0.98, 0, 0.8), 95, 160, { ...FO, density: 0.6, vig: 0.3, cornerBoost: 0.8, scale: 1 });
  g += L.frost(p, fr, along(LW, 0.5, 0.03, 0.7), 85, 70, { ...FO, density: 0.6, vig: 0.3, cornerBoost: 0.3, scale: 0.7, haze: 0.3 });
  // memory facets: translucent crystal plates holding tiny lives (warmer near the hand)
  for (let i = 0; i < 26; i++) {
    const d = Math.pow(fr(), 1.6) * 0.5, h = fr.range(0.08, 0.92);
    const [x, y] = RW(d, h);
    const near = Math.hypot(x - HAND[0], y - HAND[1]) < 260;
    g += L.shard(p, fr, x, y, fr.range(26, 60) * s(d) * 2.2, fr.range(-120, -60), { vig: near ? 0.9 : 0.5, op: near ? 1 : 0.55, glow: near });
  }
  // bloom of frost radiating from the touch point
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * Math.PI * 2 + 0.4, r0 = 50;
    const b0 = [HAND[0] + Math.cos(a - 0.7) * r0, HAND[1] + Math.sin(a - 0.7) * r0], b1 = [HAND[0] + Math.cos(a + 0.7) * r0, HAND[1] + Math.sin(a + 0.7) * r0];
    g += L.frost(p, fr, [b0, b1], a * 180 / Math.PI, 130, { ...FO, density: 1.1, vig: 1.4, cornerBoost: 0, scale: 0.9, haze: 0.45 });
  }

  g += `<path d="${quad(RW, 0, 0.7, 0, 1)}" fill="url(#${p}-focus)"/>`;
  // ---- the released memory: warm disc showing a stranger's life
  const [mx, my] = [HAND[0] + 10, HAND[1] - 6];
  g += `<circle cx="${mx}" cy="${my}" r="330" fill="url(#${p}-memGlow)"/>`;
  let mem = `<circle r="92" fill="url(#${p}-memDisc)"/>`;
  mem += `<path d="M-92,40Q-40,22 0,30T92,26V92H-92Z" fill="#8a4a3c"/>`;           // hill
  mem += `<path d="M18,30V-6L40,-24L62,-6V30Z" fill="#5a2e2c"/><rect x="33" y="2" width="12" height="11" fill="#fff0c0"/>`; // house + lit window
  mem += `<path d="M-60,32V4" stroke="#5a2e2c" stroke-width="5"/><circle cx="-60" cy="-8" r="20" fill="#6a3430"/>`;         // tree
  mem += `<circle cx="-22" cy="4" r="6" fill="#4a2426"/><path d="M-30,34L-22,10L-14,34Z" fill="#4a2426"/><circle cx="-6" cy="14" r="4.5" fill="#4a2426"/><path d="M-12,34L-6,19L0,34Z" fill="#4a2426"/><path d="M-17,20L-9,24" stroke="#4a2426" stroke-width="2.5"/>`; // parent + child
  mem += `<path d="M-6,14Q10,-30 20,-50" stroke="#4a2426" stroke-width="1" fill="none"/><path d="M20,-50l9,-8l6,10l-9,7Z" fill="#c8503c"/>`; // kite
  let grain = '';
  for (let i = 0; i < 44; i++) grain += `<circle cx="${f(R.range(-92, 92), 0)}" cy="${f(R.range(-92, 92), 0)}" r="${f(R.range(0.6, 1.6))}"/>`;
  mem += `<g fill="#fff6e8" opacity=".55">${grain}</g>`;
  mem += `<circle r="92" fill="none" stroke="#ffe2bf" stroke-width="5" opacity=".8"/><circle r="100" fill="none" stroke="#ffb38a" stroke-width="2" stroke-dasharray="3 7" opacity=".7"/>`;
  g += `<g transform="translate(${mx - 120} ${my - 150}) rotate(8)"><g clip-path="url(#${p}-mem)">${mem}</g></g>`;
  // light threads from fingertip to the vignette, other life-fragments drifting out
  g += `<path d="M${mx},${my}Q${mx - 40},${my - 80} ${mx - 100},${my - 120}M${mx},${my}Q${mx - 80},${my - 30} ${mx - 190},${my - 90}" fill="none" stroke="#ffe2bf" stroke-width="2" opacity=".6"/>`;
  for (let i = 0; i < 12; i++) {
    const a = R.range(-2.9, -0.2), r = R.range(120, 300);
    g += L.shard(p, R, mx + Math.cos(a) * r * 1.2, my + Math.sin(a) * r, R.range(18, 34), R.range(0, 180), { vig: 0.9, glow: true });
  }
  let sp = '';
  for (let i = 0; i < 40; i++) { const a = R() * Math.PI * 2, r = Math.pow(R(), 0.6) * 260; sp += `<circle cx="${f(mx + Math.cos(a) * r, 0)}" cy="${f(my + Math.sin(a) * r * 0.8, 0)}" r="${f(R.range(1, 3))}"/>`; }
  g += `<g fill="#fff1dc">${sp}</g>`;

  // ---- the hand (dark glove, warm rim from the memory light)
  const hand = [
    // sleeve
    'M10,-70C80,-90,200,-100,320,-110L400,240C280,230,140,200,30,120Z',
    // cuff
    'M-10,-58C10,-66,30,-66,44,-60L52,62C30,70,8,68-8,58Z',
    // back of hand with knuckles of the curled fingers
    'M-6,-50C-36,-58-80,-58-108,-48C-122,-44-130,-34-128,-24C-136,-18-138,-6-130,0C-136,6-136,18-126,24C-130,32-124,42-112,44C-80,50-40,52-6,48Z',
    // extended index finger: three gently tapering phalanges
    'M-110,10C-130,6-150,6-168,9C-182,11-196,13-208,17C-218,20-219,31-208,34C-196,37-182,38-168,38C-150,39-130,40-110,40Z',
    // thumb tucked beneath
    'M-26,42C-46,54-72,62-96,60C-106,59-106,49-96,47C-76,43-54,36-34,28Z',
  ].map((d) => `<path d="${d}"/>`).join('');
  defs += `<g id="${p}-hand">${hand}</g>`;
  const HT = `translate(${HAND[0] + 250} ${HAND[1] + 132}) rotate(33) scale(1.28)`;
  g += `<g transform="${HT}">`
    + `<use href="#${p}-hand" fill="#ffd091" transform="translate(-3 -4)"/>`
    + `<use href="#${p}-hand" fill="url(#${p}-glove)"/>`
    + `<path d="M-206,18C-176,12-140,10-112,14M-118,-50C-90,-64-40,-62-6,-52" fill="none" stroke="#ffe2bf" stroke-width="2.5" opacity=".9"/>`
    + `<path d="M-128,-24C-118,-22-112,-16-114,-8M-130,0C-120,2-116,8-118,16M-168,10C-166,20-166,30-168,38M-140,8C-138,20-138,30-140,40M-70,-50C-72,-14-70,18-66,48" fill="none" stroke="#3a3048" stroke-width="2"/>`
    + `<path d="M-8,-56L-4,56M44,-60L52,62" stroke="#5e4628" stroke-width="3"/>`
    + `</g>`;
  // fingertip contact flare
  g += `<circle cx="${HAND[0]}" cy="${HAND[1]}" r="26" fill="#fff6ea" opacity=".9" filter="url(#${p}-b1)"/>`;

  let out = `<rect width="1600" height="900" fill="#090d10"/>`;
  out += `<g transform="rotate(-8 800 450)">${g}</g>`;
  // floating frost motes
  let mote = '';
  for (let i = 0; i < 30; i++) mote += `<circle cx="${f(R.range(0, 1600), 0)}" cy="${f(R.range(0, 900), 0)}" r="${f(R.range(0.8, 2.4))}" opacity="${f(R.range(0.3, 0.8), 2)}"/>`;
  out += `<g fill="#efe9ff">${mote}</g>`;
  out += `<rect width="1600" height="900" fill="url(#${p}-vig)"/>`;
  return L.svgDoc(p, '记忆之霜', defs, out);
}

export const scenes = {
  'intro-eye': introEye,
  'battle-descend': battleDescend,
  'battle-phase2': battlePhase2,
  'corridor-frost': corridorFrost,
};
