// ending-share.svg 「黎明公开」
// The Dawn Seed breaks open over the horizon like a second sunrise; the eclipse slides away and a
// bright bead of day returns. In every town along the silver rails the rewritten memories wake at
// once and rise into the sky as lights. The four watch from a hill above the line.
export default function endingShare(L) {
  const p = 'endingShare';
  const { PAL, f, shape } = L;
  const R = L.rng(4242);
  const SEED = [1010, 470];
  const HZ = 548;

  let defs = L.filters(p) + L.inkDef(p, '#2a1d3e', '#170f26', '#0b0714') + L.warmDef(p)
    + L.linear(`${p}-sky`, [[0, '#0c0a24'], [0.28, '#26194a'], [0.5, '#5a3270'], [0.68, '#b0607a'], [0.82, '#f0a088'], [1, '#ffd9a8']], `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HZ + 20}"`)
    + L.radial(`${p}-burst`, [[0, '#ffffff'], [0.05, '#fff4dc'], [0.16, '#ffd091', 0.75], [0.38, '#ffb38a', 0.3], [0.7, '#ff8f9a', 0.08], [1, '#ff8f9a', 0]])
    + L.radial(`${p}-rayFade`, [[0, '#fff6e6', 0.6], [0.3, '#ffe2bf', 0.18], [1, '#ffd091', 0]], `gradientUnits="userSpaceOnUse" cx="${SEED[0]}" cy="${SEED[1]}" r="1000"`)
    + L.radial(`${p}-core`, [[0, '#ffffff'], [0.4, '#fff6e6', 0.9], [1, '#ffd091', 0]])
    + L.radial(`${p}-seed`, [[0, '#ffffff'], [0.45, '#fff4dc'], [0.8, '#ffd091'], [1, '#ffb38a']], 'cx="0.45" cy="0.4" r="0.65"')
    + L.linear(`${p}-m1`, [[0, '#e0a0aa'], [1, '#b47a9e']])
    + L.linear(`${p}-m2`, [[0, '#9a6496'], [1, '#6a4580']])
    + L.linear(`${p}-plain`, [[0, '#c98a96'], [0.25, '#8a5a88'], [0.6, '#4a2f60'], [1, '#22152f']])
    + L.linear(`${p}-m3`, [[0, '#5a3a70'], [1, '#2a1b3c']])
    + L.linear(`${p}-m3r`, [[0, '#4e3266'], [1, '#241733']])
    + L.linear(`${p}-river`, [[0, '#fff6e6'], [0.25, '#ffd2b0'], [0.6, '#c98aa6'], [1, '#5a3a76']], `gradientUnits="userSpaceOnUse" x1="0" y1="${HZ + 40}" x2="0" y2="900"`)
    + L.linear(`${p}-hill`, [[0, '#24182e'], [1, '#0b0711']])
    + L.radial(`${p}-vig`, [[0.6, '#000', 0], [1, '#000', 0.6]], 'r="0.75"')
    + L.linear(`${p}-bot`, [[0, '#0b0714', 0], [1, '#0b0714', 0.75]])
    + L.linear(`${p}-haze`, [[0, '#ffd8b8', 0], [0.6, '#ffd8b8', 0.4], [1, '#ffd8b8', 0]]);

  const ridge = (y0, amp, seed, step, fill, x0 = -20, x1 = 1620, smooth = true) => {
    const Rr = L.rng(seed); const P = [[x0, 900, 1]];
    for (let x = x0; x <= x1; x += step) P.push([x, y0 - Rr() * amp - Math.sin(x / 190 + seed) * amp * 0.6 - Math.sin(x / 63 + seed) * amp * 0.15].concat(smooth ? [] : [1]));
    P.push([x1, 900, 1]);
    return { d: shape(P), top: P.slice(1, -1) };
  };

  let s = '';
  // ---------------------------------------------------------------- sky: dawn breaking, the eclipse sliding off
  s += `<rect width="1600" height="900" fill="url(#${p}-sky)"/>`;
  s += L.stars(R, 120, 0, 0, 1600, 320, '#efe9ff', (x, y) => Math.hypot(x - SEED[0], (y - SEED[1]) * 1.4) < 560);
  const E = [320, 168], er = 60;
  defs += L.radial(`${p}-corona`, [[0, '#000', 0], [0.3, '#ffe2bf', 0], [0.33, '#fff6ea', 0.95], [0.42, '#ffd091', 0.45], [0.65, '#ff9f8a', 0.12], [1, '#ff8a6a', 0]], 'r="0.5"');
  s += `<circle cx="${E[0]}" cy="${E[1]}" r="${f(er * 3.4)}" fill="url(#${p}-corona)" opacity=".8"/>`;
  s += `<circle cx="${E[0] + 9}" cy="${E[1] + 6}" r="${er + 1}" fill="#fff6ea"/>`;
  s += `<circle cx="${E[0]}" cy="${E[1]}" r="${er}" fill="#17112c"/>`;
  s += `<circle cx="${E[0] + 50}" cy="${E[1] + 33}" r="26" fill="#ffffff" opacity=".6" filter="url(#${p}-b1)"/><circle cx="${E[0] + 50}" cy="${E[1] + 33}" r="6" fill="#ffffff"/>`;
  // soft crepuscular rays from the seed
  s += `<circle cx="${SEED[0]}" cy="${SEED[1]}" r="1000" fill="url(#${p}-burst)"/>`;
  let rays = '';
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI * 0.98 + (i + R.range(-0.35, 0.35)) / 13 * Math.PI * 0.96, len = 1200, w = R.range(0.012, 0.045);
    rays += `<path d="M${SEED[0]},${SEED[1]}L${f(SEED[0] + Math.cos(a - w) * len, 0)},${f(SEED[1] + Math.sin(a - w) * len, 0)}L${f(SEED[0] + Math.cos(a + w) * len, 0)},${f(SEED[1] + Math.sin(a + w) * len, 0)}Z"/>`;
  }
  s += `<g fill="url(#${p}-rayFade)" filter="url(#${p}-b1)">${rays}</g>`;

  // ---------------------------------------------------------------- far range + the seed rising over it
  const m1 = ridge(HZ - 6, 54, 2, 38, `url(#${p}-m1)`);
  s += `<path d="${m1.d}" fill="url(#${p}-m1)"/>`;
  s += `<circle cx="${SEED[0]}" cy="${SEED[1]}" r="210" fill="url(#${p}-core)"/>`;
  let g = '';
  const sd = [[SEED[0], SEED[1] - 58, 1], [SEED[0] + 25, SEED[1] - 22], [SEED[0] + 28, SEED[1] + 12], [SEED[0] + 12, SEED[1] + 46], [SEED[0], SEED[1] + 54, 1], [SEED[0] - 12, SEED[1] + 46], [SEED[0] - 28, SEED[1] + 12], [SEED[0] - 25, SEED[1] - 22]];
  g += `<path d="${shape(sd)}" fill="url(#${p}-seed)"/>`;
  g += `<path d="M${SEED[0]},${SEED[1] - 58}L${SEED[0] - 6},${SEED[1] + 4}L${SEED[0]},${SEED[1] + 54}M${SEED[0] - 6},${SEED[1] + 4}L${SEED[0] + 25},${SEED[1] + 14}M${SEED[0] - 6},${SEED[1] + 4}L${SEED[0] - 27},${SEED[1] - 6}" fill="none" stroke="#ffc58a" stroke-width="2" opacity=".75"/>`;
  g += `<ellipse cx="${SEED[0]}" cy="${SEED[1]}" rx="118" ry="24" transform="rotate(-14 ${SEED[0]} ${SEED[1]})" fill="none" stroke="#ffffff" stroke-width="3" opacity=".85"/>`;
  g += `<ellipse cx="${SEED[0]}" cy="${SEED[1]}" rx="168" ry="38" transform="rotate(9 ${SEED[0]} ${SEED[1]})" fill="none" stroke="#fff1d6" stroke-width="2" opacity=".6"/>`;
  g += `<circle cx="${SEED[0] + 110}" cy="${SEED[1] - 26}" r="5" fill="#ffffff"/><circle cx="${SEED[0] - 150}" cy="${SEED[1] - 20}" r="4" fill="#fff1d6"/>`;
  s += `<g transform="translate(${SEED[0]} ${SEED[1]}) scale(1.3) translate(${-SEED[0]} ${-SEED[1]})">${g}</g>`;
  s += `<rect y="${HZ - 60}" width="1600" height="110" fill="url(#${p}-haze)"/>`;
  const m2 = ridge(HZ + 18, 34, 5, 32, '');
  s += `<path d="${m2.d}" fill="url(#${p}-m2)"/>`;
  s += `<path d="${shape(m2.top, false)}" fill="none" stroke="#ffd2b0" stroke-width="2" opacity=".5"/>`;

  // ---------------------------------------------------------------- valley plain, river, rails
  s += `<path d="M-20,${HZ + 40}C400,${HZ + 30} 1200,${HZ + 30} 1620,${HZ + 44}V900H-20Z" fill="url(#${p}-plain)"/>`;
  // field strips catching light (receding)
  let fields = '';
  for (let i = 0; i < 9; i++) {
    const y = HZ + 52 + Math.pow(i / 8, 1.8) * 300;
    fields += `M-20,${f(y, 0)}C500,${f(y - 8 - i * 2, 0)} 1100,${f(y - 6 - i * 2, 0)} 1620,${f(y + 4, 0)}`;
  }
  s += `<path d="${fields}" fill="none" stroke="#ffd2b0" stroke-width="1.5" opacity=".18"/>`;
  // river winding from under the seed to the bottom of the frame, mirroring the light
  const RV = L.spline([[SEED[0] + 2, HZ + 40], [SEED[0] + 46, HZ + 64], [SEED[0] + 28, HZ + 100], [940, HZ + 136], [872, HZ + 190], [858, HZ + 262], [920, 920]], 60);
  const river = L.ribbon(RV, (t) => 6 + 150 * Math.pow(t, 1.7));
  s += `<path d="${river.d}" fill="url(#${p}-river)" opacity=".9"/>`;
  s += `<path d="${L.polyline(river.left)}${L.polyline(river.right)}" fill="none" stroke="#2a1a3a" stroke-width="3" opacity=".55"/>`;
  let glints = '';
  for (let i = 0; i < 40; i++) {
    const q = RV[Math.floor(R.range(2, 58))], w = 6 + 150 * Math.pow(q.t, 1.7);
    const off = R.range(-0.35, 0.35) * w, len = R.range(0.1, 0.35) * w;
    glints += `M${f(q.x + q.nx * off - len / 2, 0)},${f(q.y + q.ny * off, 0)}h${f(len, 0)}`;
  }
  s += `<path d="${glints}" stroke="#ffffff" stroke-width="2" opacity=".55"/>`;
  // side hills (left and right), leaving the valley open
  const hl = shape([[-20, 900, 1], [-20, 600], [140, 586], [300, 600], [460, 630], [600, 680], [700, 760], [740, 900, 1]]);
  const hr = shape([[1620, 900, 1], [1620, 590], [1480, 600], [1340, 624], [1220, 660], [1130, 720], [1100, 800], [1110, 900, 1]]);
  s += `<path d="${hl}" fill="url(#${p}-m3)"/><path d="${hr}" fill="url(#${p}-m3r)"/>`;
  s += `<path d="M-20,600C60,592 140,586 300,600S520,650 600,680" fill="none" stroke="#ffc59a" stroke-width="2" opacity=".45"/>`;
  s += `<path d="M1620,590C1540,594 1480,600 1340,624S1170,690 1130,720" fill="none" stroke="#ffc59a" stroke-width="2" opacity=".55"/>`;
  // towns on the slopes and in the valley
  const towns = [[230, 620, 1.3], [520, 668, 1.15], [1330, 650, 1.25], [1500, 626, 1.1]];
  towns.push([860, HZ + 74, 0.75], [1190, HZ + 56, 0.65], [640, HZ + 60, 0.6]);
  let houses = '', windows = '', glowT = '';
  const townTop = [];
  for (const [tx, ty, k] of towns) {
    glowT += `<ellipse cx="${tx}" cy="${f(ty - 4 * k, 0)}" rx="${f(110 * k, 0)}" ry="${f(34 * k, 0)}" fill="url(#${p}-warm)" opacity=".55"/>`;
    for (let i = 0; i < 12; i++) {
      const x = tx + R.range(-66, 66) * k, y = ty + R.range(-8, 14) * k, w = R.range(12, 20) * k, h = R.range(8, 14) * k;
      houses += `<path d="M${f(x - w / 2, 0)},${f(y, 0)}v${f(-h, 0)}l${f(w / 2, 0)},${f(-h * 0.7, 0)}l${f(w / 2, 0)},${f(h * 0.7, 0)}v${f(h, 0)}z"/>`;
      if (R() < 0.85) windows += `<rect x="${f(x - 1.5 * k, 0)}" y="${f(y - h * 0.65, 0)}" width="${f(3.2 * k, 1)}" height="${f(3.2 * k, 1)}"/>`;
    }
    houses += `<path d="M${f(tx - 6 * k, 0)},${f(ty - 8 * k, 0)}v${f(-28 * k, 0)}l${f(6 * k, 0)},${f(-16 * k, 0)}l${f(6 * k, 0)},${f(16 * k, 0)}v${f(28 * k, 0)}z"/>`;
    townTop.push([tx, ty - 24 * k, k]);
  }
  s += glowT + `<g fill="#2a1a38">${houses}</g><g fill="#ffd091">${windows}</g>`;
  // the silver rails sweeping from the foreground hill to the light, the Silver Rail riding them
  const RL = L.spline([[170, 920], [400, 800], [610, 712], [780, 650], [900, 608], [SEED[0] - 40, HZ + 36]], 90);
  const gauge = (t) => 4 + 74 * Math.pow(1 - t, 2.2);
  const bed = L.ribbon(RL, (t) => gauge(t) * 1.7);
  s += `<path d="${bed.d}" fill="#1e1428"/>`;
  let sleepers = '';
  for (let i = 0; i < 90; i += 2) {
    const q = RL[i], g = gauge(q.t) * 0.75;
    sleepers += `M${f(q.x + q.nx * g, 0)},${f(q.y + q.ny * g, 0)}L${f(q.x - q.nx * g, 0)},${f(q.y - q.ny * g, 0)}`;
  }
  s += `<path d="${sleepers}" stroke="#3a2a40" stroke-width="2"/>`;
  const rails = L.ribbon(RL, (t) => gauge(t));
  s += `<path d="${L.polyline(rails.left)}${L.polyline(rails.right)}" fill="none" stroke="#fff4ea" stroke-width="2.5" opacity=".9"/>`;
  // train: locomotive + four carriages riding the curve toward the light
  let train = '';
  [0.47, 0.425, 0.38, 0.335, 0.29].forEach((t, i) => {
    const q = RL[Math.round(t * 90)], sc = gauge(q.t) / 30;
    const ang = Math.atan2(q.ty, q.tx) * 180 / Math.PI + 180;
    const w = 40 * sc, h = 13 * sc;
    train += `<g transform="translate(${f(q.x)} ${f(q.y - h * 0.2)}) rotate(${f(ang)})">`;
    train += `<rect x="${f(-w / 2)}" y="${f(-h)}" width="${f(w * 0.96)}" height="${f(h)}" rx="${f(h * 0.3)}" fill="#1c2c33" stroke="#ffd8b0" stroke-width="1.2"/>`;
    if (i === 0) train += `<path d="M${f(-w / 2)},${f(-h)}l${f(-h * 0.6)},${f(h * 0.4)}v${f(h * 0.6)}h${f(h * 0.6)}z" fill="#1c2c33"/><rect x="${f(-w * 0.3)}" y="${f(-h * 1.45)}" width="${f(h * 0.4)}" height="${f(h * 0.5)}" fill="#1c2c33"/><circle cx="${f(-w / 2 - h * 0.4)}" cy="${f(-h * 0.4)}" r="${f(h * 0.2)}" fill="#fff6e6"/>`;
    else for (let j = 0; j < 4; j++) train += `<rect x="${f(-w / 2 + 4 * sc + j * (w - 8 * sc) / 4)}" y="${f(-h * 0.72)}" width="${f((w - 8 * sc) / 6)}" height="${f(h * 0.32)}" fill="#ffd091"/>`;
    train += `</g>`;
  });
  s += train;
  const qL = RL[Math.round(0.47 * 90)];
  s += `<path d="M${f(qL.x)},${f(qL.y - 18)}C${f(qL.x + 14)},${f(qL.y - 50)} ${f(qL.x - 10)},${f(qL.y - 80)} ${f(qL.x + 20)},${f(qL.y - 110)}C${f(qL.x + 40)},${f(qL.y - 130)} ${f(qL.x + 30)},${f(qL.y - 160)} ${f(qL.x + 60)},${f(qL.y - 180)}" fill="none" stroke="#fff1e2" stroke-width="12" stroke-linecap="round" opacity=".28" filter="url(#${p}-b1)"/>`;

  // ---------------------------------------------------------------- memory lights rising everywhere
  let mNear = '', mMid = '', mFar = '', halo = '';
  for (const [tx, ty, k] of townTop) {
    const n = Math.round(120 * k);
    for (let i = 0; i < n; i++) {
      const t = Math.pow(R(), 0.75);
      const y = ty - t * (ty - 30) * R.range(0.55, 1);
      const spread = 14 + 260 * t * t;
      const x = tx + Math.sin(t * 6 + tx) * 30 * t + R.range(-1, 1) * spread + (SEED[0] - tx) * t * 0.12;
      const r = (3 - t * 2.1) * Math.min(1.2, k) * R.range(0.7, 1.25);
      const c = `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(Math.max(0.6, r))}"/>`;
      if (t < 0.3) mNear += c; else if (t < 0.65) mMid += c; else mFar += c;
      if (R() < 0.1) halo += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(r * 7, 0)}" fill="url(#${p}-warm)" opacity=".5"/>`;
    }
  }
  // stray lights rising from the open plain
  for (let i = 0; i < 160; i++) {
    const x = R.range(0, 1600), y = R.range(60, 700), r = R.range(0.7, 2.2);
    mFar += `<circle cx="${f(x, 0)}" cy="${f(y, 0)}" r="${f(r)}"/>`;
  }
  s += halo + `<g fill="#fff4e6">${mNear}</g><g fill="#ffe7c8" opacity=".9">${mMid}</g><g fill="#ffd9b5" opacity=".7">${mFar}</g>`;

  // ---------------------------------------------------------------- foreground: the watchers' hill
  const hill = shape([[-20, 900, 1], [-20, 742], [110, 716], [290, 708], [450, 726], [580, 770], [660, 830], [700, 900, 1]]);
  s += `<path d="${hill}" fill="url(#${p}-hill)"/>`;
  s += `<path d="M-20,742C40,728 110,716 290,708S520,746 580,770" fill="none" stroke="#ffc59a" stroke-width="3" opacity=".75"/>`;
  let grass = '';
  for (let i = 0; i < 80; i++) {
    const x = R.range(0, 620), yb = 708 + Math.pow((x - 290) / 300, 2) * 30 + 8;
    grass += `M${f(x, 0)},${f(yb, 0)}q${f(R.range(-3, 3), 0)},${f(-R.range(5, 10), 0)} ${f(R.range(-7, 7), 0)},${f(-R.range(10, 22), 0)}`;
  }
  s += `<path d="${grass}" fill="none" stroke="#3a2840" stroke-width="2"/>`;
  // right foreground framing: dark grasses
  const fr = shape([[1620, 900, 1], [1620, 800], [1520, 820], [1440, 860], [1400, 900, 1]]);
  s += `<path d="${fr}" fill="#0d0912"/>`;
  const figs = [['lia', 156, 722, 0.19], ['player', 236, 716, 0.195], ['mia', 312, 716, 0.172], ['serena', 388, 720, 0.19]];
  const RIM = { lia: PAL.lia, player: PAL.oath, mia: PAL.mia, serena: PAL.serena };
  for (const [k, x, y, sc] of figs) {
    const fig = L.silhouette(p, k, L.BODY[k](), x, y, sc, { rim: RIM[k], rimW: 2.6, moonW: 0, glow: 0.6, topRim: '#ffd8b0', topRimOp: 0.9 });
    defs += fig.defs;
    s += fig.body;
  }
  s += `<rect width="1600" height="900" fill="url(#${p}-vig)"/>`;
  s += `<rect y="780" width="1600" height="120" fill="url(#${p}-bot)"/>`;
  return L.svgDoc('黎明公开：黎明种的光芒照向世界，所有被改写的记忆同时苏醒', defs, s);
}
