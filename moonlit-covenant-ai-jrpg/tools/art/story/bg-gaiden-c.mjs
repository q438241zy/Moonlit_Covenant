// 外传《银轨号》正篇第5、6章的场景背景：silver-rail-camp（银轨号旁的临时营地·篝火夜）、frost-corridor-entrance（霜冻回廊·入口）。
//   silver-rail-camp         — 夜。停驶的银轨号斜着停在荒原上，从左边近处一直退到右边远处：深石板蓝的车厢、两道金色腰线、
//                              几扇亮着琥珀灯的车窗，车顶边缘一条月光；车头前面还有一小段铁轨，在雾墙前断掉。雾里隐约立着
//                              一道巨大的拱廊（第六章的回廊）。近处是临时营地：石圈里的篝火、火边的铁壶、一截当长凳的圆木、
//                              铺开的毯子、一摞装零件的木箱、车门边挂着的提灯。荒原上有残雪和枯草；左上是缺了一角的月亮和星空。
//   frost-corridor-entrance  — 霜冻回廊入口：站在拱口往里看，一条冰晶砌成的拱形通道一节一节退向深处，尽头透着冷白的光；
//                              冰壁半透明，冻着看不清形状的暗影与裂纹，霜里嵌着一点一点碎片似的暖光（被吃掉的记忆）；
//                              两侧立着冰柱，地上一层薄霜，拱顶垂着冰凌。冷蓝色调。
// 两张都不画人、不画字；冰里的暗影只是不成形的暗块，不画人形。
import { Scene, W, H, f, pz, pl, persp, stars, ridge, flameMass, shape, fbm } from './lib.mjs';

const r0 = (v) => f(v, 0);
const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;

// ═══════════════════════════════════════════════════════════════════════════════════════
// silver-rail-camp
// ═══════════════════════════════════════════════════════════════════════════════════════
const HZ = 470;
const pr = persp({ vp: [800, HZ], F: 900, eye: 1.7 });
// the track runs from the near left (behind the frame) to the far right: centre (X0 + 0.55 t, Z0 + t); n = the side facing the camera
const TX = -9, TZ = 6, DX = 0.55, NX = 0.876, NZ = -0.482;
const onTrack = (t, off, Y) => pr(TX + DX * t + off * NX, Y, TZ + t + off * NZ);
const quadT = (t0, t1, off, y0, y1) => pz([onTrack(t0, off, y0), onTrack(t1, off, y0), onTrack(t1, off, y1), onTrack(t0, off, y1)]);

const CARS = [[-1.5, 12], [13.2, 31.2], [32.4, 50.4]];
const LOCO = [51.6, 66];
const RAIL_END = 94;

function campSky(S) {
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#070818'], [0.42, '#141a3a'], [0.5, '#1e2244'], [0.53, '#2a2440'], [1, '#2a2440']], 'gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900"')}"/>`);
  // a faint band of stars across the sky
  S.add(`<path d="M-40,300C300,170 700,90 1640,40L1640,150C900,180 420,260 -40,380Z" fill="#5a5c9a" opacity=".10" filter="${S.blur(3)}"/>`);
  S.add(stars(S.R, 230, [0, 0, W, HZ - 40], { maxR: 1.5, fill: '#e6e2ff', avoid: [300, 130, 120, 120] }));
  S.add(stars(S.R, 60, [-40, 160, 1640, 360], { maxR: 1.1, fill: '#cfd4ff', avoid: [1320, 380, 360, 140], op: [0.2, 0.6] }));
  // the moon, with a bite out of it (the eclipse is coming), and its violet halo
  const [mx, my, mr] = [300, 130, 44];
  S.add(`<circle cx="${mx}" cy="${my}" r="${mr * 5}" fill="${S.rad([[0, '#c8b6ff', 0.32], [0.3, '#8f6be0', 0.12], [1, '#8f6be0', 0]])}"/>`);
  S.add(`<circle cx="${mx}" cy="${my}" r="${mr + 6}" fill="#efe8ff" opacity=".25" filter="${S.blur(2)}"/>`);
  // the bite: a shadow disc clipped to the moon, so only the missing corner shows (dim, not black)
  const disc = S.clip(ell(mx, my, mr, mr));
  S.add(`<circle cx="${mx}" cy="${my}" r="${mr}" fill="#f4efff"/>`
    + `<path d="${ell(mx - 14, my - 4, 9, 7)}${ell(mx - 2, my + 18, 12, 8)}${ell(mx - 24, my + 18, 6, 5)}" fill="#d8d0f0" opacity=".7"/>`
    + `<g clip-path="${disc}"><circle cx="${mx + 38}" cy="${my - 30}" r="${mr * 0.8}" fill="#1a1636"/><circle cx="${mx + 38}" cy="${my - 30}" r="${mr * 0.8}" fill="none" stroke="#b9a2ff" stroke-width="2.2" opacity=".55"/></g>`);
}

function campFar(S) {
  // low ridges on the far left horizon
  const far = ridge(S, { base: HZ - 6, amp: 18, period: 300, seed: 5051, x0: -20, x1: 1120, bottom: HZ + 4, fill: '#1c2040', rim: '#4a4c80', rimOp: 0.35, rimW: 1.5 });
  S.add(far.svg);
  const near = ridge(S, { base: HZ + 2, amp: 8, period: 180, seed: 5052, x0: -20, x1: 900, bottom: HZ + 8, fill: '#171a32' });
  S.add(near.svg);
  // the fog wall where the rails end, and the great arcade standing in it
  S.add(`<path d="M1000,478C1040,380 1120,300 1260,282C1400,266 1520,300 1640,280V490H1000Z" fill="#7c88b4" opacity=".28" filter="${S.blur(3)}"/>`);
  // a pointed arch with buttress-like piers, much taller than anything should be; cold glints of frost on its ribs
  const arch = (cx, base, w, h, op) => {
    const top = base - h, spring = base - h * 0.5, iw = w * 0.36, itop = top + h * 0.16, ispring = spring + h * 0.06;
    const outer = `M${r0(cx - w / 2)},${r0(base)}V${r0(spring)}Q${r0(cx - w / 2)},${r0(top + h * 0.12)} ${r0(cx)},${r0(top)}Q${r0(cx + w / 2)},${r0(top + h * 0.12)} ${r0(cx + w / 2)},${r0(spring)}V${r0(base)}Z`;
    const hole = `M${r0(cx - iw)},${r0(base)}V${r0(ispring)}Q${r0(cx - iw)},${r0(itop + h * 0.1)} ${r0(cx)},${r0(itop)}Q${r0(cx + iw)},${r0(itop + h * 0.1)} ${r0(cx + iw)},${r0(ispring)}V${r0(base)}Z`;
    const rib = `M${r0(cx - iw - w * 0.05)},${r0(base)}V${r0(ispring)}Q${r0(cx - iw - w * 0.05)},${r0(itop + h * 0.07)} ${r0(cx)},${r0(itop - h * 0.03)}`;
    return `<path d="${outer}${hole}" fill="#4a5684" fill-rule="evenodd" opacity="${op}"/><path d="${hole}" fill="#b8c6e6" opacity="${f(op * 0.45, 2)}"/>`
      + `<path d="${rib}" fill="none" stroke="#c8dcf4" stroke-width="1.5" opacity="${f(op * 0.9, 2)}"/>`;
  };
  S.add(arch(1500, 478, 120, 150, 0.22));
  S.add(arch(1395, 479, 150, 196, 0.3));
  S.add(arch(1268, 480, 196, 250, 0.42));
  // fog bands drifting in front of it
  S.add(`<path d="M1000,478C1140,446 1300,456 1640,436V500H1000Z" fill="#9aa6cc" opacity=".45" filter="${S.blur(2)}"/>`);
  S.add(`<path d="M1080,400C1240,372 1420,390 1640,362V410C1440,430 1240,424 1080,430Z" fill="#a8b2d6" opacity=".22" filter="${S.blur(2)}"/>`);
  S.add(`<path d="M1140,318C1260,300 1380,314 1520,300V330C1380,344 1260,338 1140,344Z" fill="#a8b2d6" opacity=".14" filter="${S.blur(2)}"/>`);
}

function campGround(S) {
  const R = S.R;
  S.add(`<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="${S.lin([[0, '#1c1c30'], [0.25, '#1a1626'], [0.7, '#1a120e'], [1, '#120a08']])}"/>`);
  // patches of old snow, flattened by perspective; the near ones pick up the fire
  let snowFar = '', snowNear = '';
  for (let i = 0; i < 46; i++) {
    const Z = 6 + Math.pow(R(), 1.6) * 150, X = R.range(-30, 60);
    const [x, y] = pr(X, 0, Z);
    if (x < -80 || x > 1680 || y > 900) continue;
    const s = 900 / Z;
    const d = ell(x, y, s * R.range(0.8, 2.6), s * R.range(0.12, 0.3));
    if (Z < 18) snowNear += d; else snowFar += d;
  }
  S.add(`<path d="${snowFar}" fill="#8a96b8" opacity=".38"/><path d="${snowNear}" fill="#a89490" opacity=".38"/>`);
  // a few low rocks, lit on the moon side
  let rocks = '', rocksLit = '';
  for (let i = 0; i < 14; i++) {
    const Z = 9 + Math.pow(R(), 1.4) * 70, X = R.range(-6, 40);
    const [x, y] = pr(X, 0, Z);
    if (x < 0 || x > 1600 || (x > 600 && x < 1100 && Z < 14)) continue;
    const s = 900 / Z * R.range(0.25, 0.6);
    rocks += shape([[x - s, y, 1], [x - s * 0.7, y - s * 0.55], [x - s * 0.1, y - s * 0.75], [x + s * 0.6, y - s * 0.45], [x + s, y, 1]], true, 0);
    rocksLit += shape([[x - s * 0.9, y - s * 0.1, 1], [x - s * 0.65, y - s * 0.55], [x - s * 0.1, y - s * 0.75], [x - s * 0.25, y - s * 0.35, 1]], true, 0);
  }
  S.add(`<path d="${rocks}" fill="#26222c"/><path d="${rocksLit}" fill="#5a5878" opacity=".55"/>`);
  // an old signal post beside the last stretch of track, leaning, its lamp dark
  {
    const [bx, by] = onTrack(80, 3.4, 0), [tx, ty] = onTrack(80.6, 3.4, 4.2);
    const s = 900 / (TZ + 80 + 3.4 * NZ);
    S.add(`<path d="M${f1(bx)},${f1(by)}L${f1(tx)},${f1(ty)}" stroke="#2a2a38" stroke-width="${f1(Math.max(2, s * 0.12))}"/>`
      + `<path d="M${f1(tx - s * 0.3)},${f1(ty + s * 0.2)}h${f1(s * 0.6)}v${f1(s * 0.5)}h${f1(-s * 0.6)}Z" fill="#2a2a38"/><circle cx="${f1(tx)}" cy="${f1(ty + s * 0.45)}" r="${f1(s * 0.14)}" fill="#4a3a3a"/>`);
  }
  // dry grass tufts
  let grass = '';
  for (let i = 0; i < 120; i++) {
    const Z = 5 + Math.pow(R(), 1.3) * 60, X = R.range(-14, 30);
    const [x, y] = pr(X, 0, Z);
    if (x < -10 || x > 1610 || y > 905) continue;
    const s = 900 / Z * 0.22;
    for (let k = -1; k <= 1; k++) grass += `M${f1(x + k * s * 0.3)},${f1(y)}l${f1(k * s * 0.35 + R.range(-0.15, 0.15) * s)},${f1(-s * R.range(0.7, 1.2))}`;
  }
  S.add(`<path d="${grass}" stroke="#3a3028" stroke-width="1.6" stroke-linecap="round" fill="none"/>`);
}

function campTrack(S) {
  const R = S.R;
  // ballast bed
  S.add(`<path d="${pz([onTrack(-1.5, 1.6, 0), onTrack(RAIL_END + 3, 1.4, 0), onTrack(RAIL_END + 3, -1.4, 0), onTrack(-1.5, -1.6, 0)])}" fill="#221e26"/>`);
  // sleepers (askew near the broken end)
  let sl = '';
  for (let t = -1.2; t < RAIL_END + 2; t += 0.75) {
    const j = t > RAIL_END - 6 ? R.range(-0.35, 0.35) : 0;
    sl += pz([onTrack(t + j, 1.25, 0.05), onTrack(t + 0.28 - j, 1.25, 0.05), onTrack(t + 0.28 + j, -1.25, 0.05), onTrack(t - j, -1.25, 0.05)]);
  }
  S.add(`<path d="${sl}" fill="#3a2e2a"/>`);
  // rails: steel with a moonlit top edge; the right rail bends up where it breaks
  for (const off of [0.72, -0.72]) {
    const end = off > 0 ? RAIL_END : RAIL_END - 1.6;
    const pts = [];
    for (let t = -1.5; t <= end; t += 4) pts.push(onTrack(t, off, 0.18));
    pts.push(onTrack(end, off, 0.18));
    const bent = off > 0 ? onTrack(end + 1.4, off - 0.25, 0.55) : onTrack(end + 1.2, off + 0.3, 0.22);
    S.add(`<path d="${pl([...pts, bent])}" fill="none" stroke="#4e4c5a" stroke-width="3" stroke-linecap="round"/>`);
    S.add(`<path d="${pl([...pts, bent])}" fill="none" stroke="#b8c0e0" stroke-width="1" stroke-linecap="round" opacity=".55"/>`);
  }
}

function wheel(t, off, cy, rad) {
  const pts = [];
  for (let i = 0; i < 14; i++) {
    const a = Math.PI * 2 * i / 14;
    pts.push(onTrack(t + Math.cos(a) * rad, off, cy + Math.sin(a) * rad));
  }
  return pz(pts);
}

function campTrain(S) {
  const R = S.R;
  const bodyCol = S.lin([[0, '#3a3e58'], [0.55, '#2c3046'], [1, '#1e2132']]);
  let skirts = '', wheels = '', hubs = '', bellows = '', ends = '';
  let bodies = '', trimGold = '', trimDark = '', rim = '', glass = '', lit = '', glints = '', spill = '';
  const carBody = (t0, t1, nose = false) => {
    // under-frame and bogies
    skirts += quadT(t0 + 0.6, t1 - 0.6, 1.45, 0.42, 1.05);
    for (const bt of [t0 + 3, t1 - 3]) for (const dt of [-1.1, 1.1]) {
      if (bt + dt < 4) continue; // too close to the frame edge: the bogie would sprawl out of the picture

      wheels += wheel(bt + dt, 1.5, 0.46, 0.44);
      hubs += wheel(bt + dt, 1.52, 0.46, 0.12);
    }
    // the body: a box with a rounded nose on the locomotive
    if (nose) {
      bodies += pz([onTrack(t0, 1.55, 1.0), onTrack(t1 - 1.2, 1.55, 1.0), onTrack(t1, 1.4, 1.4), onTrack(t1 + 0.4, 1.2, 2.4), onTrack(t1 - 0.6, 1.4, 3.6), onTrack(t1 - 3.5, 1.55, 4.15), onTrack(t0, 1.55, 4.15)]);
    } else bodies += quadT(t0, t1, 1.55, 1.0, 4.1);
    trimGold += quadT(t0, nose ? t1 - 0.4 : t1, 1.56, 1.62, 1.72) + quadT(t0, nose ? t1 - 2.8 : t1, 1.56, 3.42, 3.5);
    trimDark += quadT(t0, nose ? t1 - 3.4 : t1, 1.57, 3.85, 4.12);
    rim += `M${pl([onTrack(t0, 1.56, 4.12), onTrack(nose ? t1 - 3.5 : t1, 1.56, nose ? 4.15 : 4.12)]).slice(1)}`;
  };
  const tracks = [...CARS.map((c) => [...c, false]), [...LOCO, true]];
  // draw far to near so nearer cars overlap
  for (const [t0, t1, nose] of [...tracks].reverse()) {
    carBody(t0, t1, nose);
  }
  // connectors between cars: the near end face of the farther car shows in the gap
  for (let i = 0; i < tracks.length - 1; i++) {
    const a = tracks[i][1], b = tracks[i + 1][0];
    ends += pz([onTrack(b, 1.55, 1.0), onTrack(b, -1.55, 1.0), onTrack(b, -1.55, 4.1), onTrack(b, 1.55, 4.1)]);
    bellows += quadT(a - 0.05, b + 0.05, 1.1, 1.3, 3.7);
  }
  S.add(`<path d="${ends}" fill="#15172a"/><path d="${bellows}" fill="#22232e"/>`);
  S.add(`<path d="${skirts}" fill="#14151f"/><path d="${wheels}" fill="#1c1c26" stroke="#4a4858" stroke-width="1.5"/><path d="${hubs}" fill="#5a5666"/>`);
  S.add(`<path d="${bodies}" fill="${bodyCol}"/>`);
  // windows: a few still glow amber; the dark ones catch a little moonlight
  const lampOn = new Set(['0:3', '0:4', '1:1', '1:5', '1:6', '2:2']);
  CARS.forEach(([t0, t1], ci) => {
    let k = 0;
    for (let t = t0 + 1.4; t + 1.15 < t1 - 0.8; t += 2.05, k++) {
      if (ci === 0 && k === 1) { // the door, with a lantern hung beside it
        continue;
      }
      const q = quadT(t, t + 1.15, 1.57, 2.05, 3.2);
      if (lampOn.has(`${ci}:${k}`)) {
        lit += q;
        const [gx, gy] = onTrack(t + 0.55, 3.2, 0);
        const s = 900 / (TZ + t + 3.2 * NZ);
        spill += ell(gx, gy, s * 1.1, s * 0.22);
      } else {
        glass += q;
        glints += pl([onTrack(t + 0.2, 1.58, 3.1), onTrack(t + 0.55, 1.58, 2.25)]);
      }
    }
  });
  // locomotive cab window
  lit += quadT(LOCO[1] - 4.2, LOCO[1] - 2.8, 1.57, 2.4, 3.25);
  S.add(`<path d="${spill}" fill="#ffb45e" opacity=".14"/>`);
  S.add(`<path d="${glass}" fill="#121626" stroke="#7a6844" stroke-width="1.2"/><path d="${glints}" stroke="#8c94c4" stroke-width="1.4" opacity=".45" fill="none"/>`);
  S.add(`<path d="${lit}" fill="#ffc777" stroke="#a07a3a" stroke-width="1.2"/>`);
  S.add(`<path d="${lit}" fill="#ffb45e" opacity=".55" filter="${S.blur(2)}"/>`);
  S.add(`<path d="${trimDark}" fill="#191b2a"/><path d="${trimGold}" fill="#b88a4a" opacity=".9"/>`);
  S.add(`<path d="${rim}" fill="none" stroke="#c8d0f0" stroke-width="1.8" opacity=".6"/>`);
  // panel seams
  let seams = '';
  for (const [t0, t1] of CARS) for (let t = t0 + 1.2; t < t1; t += 4.1) seams += pl([onTrack(t, 1.57, 1.05), onTrack(t, 1.57, 1.6)]) + pl([onTrack(t, 1.57, 3.52), onTrack(t, 1.57, 3.84)]);
  S.add(`<path d="${seams}" stroke="#151726" stroke-width="1.2" fill="none"/>`);
  // the locomotive's chimney and a dark headlamp
  const [cx0, cy0] = onTrack(LOCO[0] + 3, 1.0, 4.15), [cx1] = onTrack(LOCO[0] + 4.2, 1.0, 4.15), [, cyt] = onTrack(LOCO[0] + 3.6, 1.0, 5.1);
  S.add(`<path d="M${r0(cx0)},${r0(cy0)}L${r0(cx0 + 1)},${r0(cyt)}H${r0(cx1 + 1)}L${r0(cx1)},${r0(cy0)}Z" fill="#23263a"/><path d="M${r0(cx0 - 2)},${r0(cyt)}H${r0(cx1 + 3)}" stroke="#b88a4a" stroke-width="2"/>`);
  const [hx, hy] = onTrack(LOCO[1] + 0.25, 1.25, 2.2);
  S.add(`<circle cx="${r0(hx)}" cy="${r0(hy)}" r="3.5" fill="#3a3a4a" stroke="#8a8aa0" stroke-width="1"/>`);
  // the near car's door, steps, and the lantern
  const dt = CARS[0][0] + 1.4 + 2.05;
  S.add(`<path d="${quadT(dt, dt + 1.15, 1.57, 1.05, 3.55)}" fill="#24273a" stroke="#7a6844" stroke-width="1.5"/>`);
  S.add(`<path d="${quadT(dt + 0.3, dt + 0.85, 1.58, 2.55, 3.3)}" fill="#ffc777" opacity=".8"/>`);
  S.add(`<path d="${pl([onTrack(dt - 0.12, 1.66, 1.2), onTrack(dt - 0.12, 1.66, 3.1)])}${pl([onTrack(dt + 1.27, 1.66, 1.2), onTrack(dt + 1.27, 1.66, 3.1)])}" stroke="#b88a4a" stroke-width="3" stroke-linecap="round"/>`);
  S.add(`<path d="${quadT(dt - 0.05, dt + 1.2, 1.9, 0.62, 0.72)}${quadT(dt - 0.05, dt + 1.2, 2.2, 0.28, 0.38)}" fill="#3a3640"/>`);
  const [lx, ly] = onTrack(dt + 1.45, 1.75, 2.9), [, lyt] = onTrack(dt + 1.45, 1.75, 3.4);
  const ls = (ly - lyt);
  S.add(`<circle cx="${r0(lx)}" cy="${r0(ly)}" r="${r0(ls * 3.2)}" fill="${S.rad([[0, '#ffd890', 0.55], [0.4, '#ffb45e', 0.18], [1, '#ffb45e', 0]])}"/>`);
  S.add(`<path d="M${r0(lx)},${r0(lyt - ls * 0.4)}V${r0(ly - ls * 0.55)}" stroke="#2a2420" stroke-width="2"/>`
    + `<path d="${pz([[lx - ls * 0.32, ly - ls * 0.55], [lx + ls * 0.32, ly - ls * 0.55], [lx + ls * 0.38, ly + ls * 0.45], [lx - ls * 0.38, ly + ls * 0.45]])}" fill="#ffe2a8" stroke="#3a2c20" stroke-width="2"/>`);
  // moon shadow: the face of the train turned away from the moon is darker at the far end
  S.add(`<path d="${bodies}" fill="${S.lin([[0, '#0c0e1a', 0], [0.6, '#0c0e1a', 0.15], [1, '#0c0e1a', 0.45]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  return { bodies };
}

function campFire(S, bodies) {
  const L = S.R;
  const FX = 0.8, FZ = 8;
  const [fx, fy] = pr(FX, 0, FZ);
  const ps = 900 / FZ;
  // warm light on the ground and on the side of the train
  S.add(`<ellipse cx="${r0(fx)}" cy="${r0(fy)}" rx="${r0(ps * 7.5)}" ry="${r0(ps * 2.4)}" fill="${S.rad([[0, '#ffb050', 0.5], [0.45, '#e07a30', 0.18], [1, '#e07a30', 0]])}"/>`);
  const warm = S.clip(bodies);
  S.add(`<g clip-path="${warm}"><ellipse cx="${r0(fx - 160)}" cy="${r0(fy - 220)}" rx="560" ry="300" fill="${S.rad([[0, '#ff9a48', 0.32], [0.6, '#ff9a48', 0.08], [1, '#ff9a48', 0]])}"/></g>`);
  // a fallen log for a bench, a bedroll, the crates of parts
  const prs = (X, Y, Z) => pr(X, Y, Z);
  {
    const [ax, ay] = prs(-2.6, 0.22, 9.4), [bx, by] = prs(-0.9, 0.22, 10.6);
    const th = 900 / 10 * 0.42;
    S.add(`<path d="M${r0(ax)},${r0(ay)}L${r0(bx)},${r0(by)}" stroke="#2a1c16" stroke-width="${r0(th)}" stroke-linecap="round"/>`
      + `<path d="M${r0(ax)},${r0(ay - th * 0.32)}L${r0(bx)},${r0(by - th * 0.32)}" stroke="#a8643a" stroke-width="${r0(th * 0.22)}" stroke-linecap="round" opacity=".7"/>`
      + `<ellipse cx="${r0(ax)}" cy="${r0(ay)}" rx="${r0(th * 0.42)}" ry="${r0(th * 0.5)}" fill="#6a4630"/><ellipse cx="${r0(ax)}" cy="${r0(ay)}" rx="${r0(th * 0.22)}" ry="${r0(th * 0.28)}" fill="#8a5c3a"/>`);
  }
  {
    // bedroll: a flat blanket with a rolled end
    const c = [prs(2.0, 0.03, 9.2), prs(3.6, 0.03, 9.6), prs(3.9, 0.03, 11.4), prs(2.3, 0.03, 11.0)];
    const [rx, ry] = prs(2.2, 0.18, 10.8), [qx, qy] = prs(3.8, 0.18, 11.2);
    S.add(`<path d="${pz(c)}" fill="#5a2a30"/><path d="${pl([c[0], c[1]])}" stroke="#c8a070" stroke-width="2" opacity=".6"/>`
      + `<path d="M${r0(rx)},${r0(ry)}L${r0(qx)},${r0(qy)}" stroke="#6e343a" stroke-width="16" stroke-linecap="round"/><path d="M${r0(rx)},${r0(ry - 4)}L${r0(qx)},${r0(qy - 4)}" stroke="#a85a50" stroke-width="4" stroke-linecap="round" opacity=".6"/>`);
  }
  {
    // two wooden crates near the train, a gear and a coil spring on top
    const crate = (X, Z, s, Y0 = 0) => {
      const A = prs(X, Y0, Z), B = prs(X + s, Y0, Z - s * 0.2), C = prs(X + s, Y0 + s * 0.8, Z - s * 0.2), D = prs(X, Y0 + s * 0.8, Z);
      const E = prs(X + s + 0.25, Y0, Z + s * 0.75), F = prs(X + s + 0.25, Y0 + s * 0.8, Z + s * 0.75);
      return `<path d="${pz([A, B, C, D])}" fill="#5a3e2a"/><path d="${pz([B, E, F, C])}" fill="#3a281c"/>`
        + `<path d="${pl([A, C])}${pl([B, D])}" stroke="#2a1c14" stroke-width="2" opacity=".7"/><path d="${pl([D, C])}" stroke="#c89060" stroke-width="2" opacity=".6"/>`;
    };
    S.add(crate(-4.6, 11.2, 0.9));
    S.add(crate(-4.4, 11.0, 0.62, 0.72));
    const [gx, gy] = prs(-4.05, 1.25, 10.9);
    const gr = 900 / 10.9 * 0.16;
    let teeth = '';
    for (let i = 0; i < 10; i++) {
      const a = Math.PI * 2 * i / 10;
      teeth += pz([[gx + Math.cos(a - 0.14) * gr, gy + Math.sin(a - 0.14) * gr * 0.5], [gx + Math.cos(a - 0.1) * gr * 1.3, gy + Math.sin(a - 0.1) * gr * 0.65], [gx + Math.cos(a + 0.1) * gr * 1.3, gy + Math.sin(a + 0.1) * gr * 0.65], [gx + Math.cos(a + 0.14) * gr, gy + Math.sin(a + 0.14) * gr * 0.5]]);
    }
    S.add(`<path d="${teeth}${ell(gx, gy, gr, gr * 0.5)}" fill="#a88a50"/><path d="${ell(gx, gy, gr * 0.35, gr * 0.18)}" fill="#3a2c1c"/>`);
    let coil = '';
    const [sx, sy] = prs(-3.7, 1.25, 11.3);
    for (let i = 0; i < 5; i++) coil += ell(sx, sy - i * 3.2, 5, 2);
    S.add(`<path d="${coil}" fill="none" stroke="#9ab0c0" stroke-width="1.4"/>`);
  }
  // stone ring
  {
    let st = '';
    for (let i = 0; i < 12; i++) { const a = Math.PI * 2 * i / 12; st += ell(fx + Math.cos(a) * ps * 0.8, fy + Math.sin(a) * ps * 0.26, ps * 0.17, ps * 0.1); }
    S.add(`<path d="${st}" fill="#3e3438"/>`);
    let stl = '';
    for (let i = 0; i < 12; i++) { const a = Math.PI * 2 * i / 12; if (Math.sin(a) < 0.2) stl += ell(fx + Math.cos(a) * ps * 0.8, fy + Math.sin(a) * ps * 0.26 - ps * 0.04, ps * 0.12, ps * 0.05); }
    S.add(`<path d="${stl}" fill="#b0705a" opacity=".55"/>`);
  }
  // logs and flame
  {
    let logs = '', lit = '';
    for (let i = 0; i < 7; i++) {
      const a = -0.9 + i * 0.3, bx = fx + Math.sin(a) * ps * 0.65, by = fy + Math.cos(a) * ps * 0.05;
      const tx = fx + Math.sin(a) * ps * 0.08, ty = fy - ps * 0.62;
      logs += `M${r0(bx)},${r0(by)}L${r0(tx)},${r0(ty)}`;
      if (i % 2) lit += `M${r0(bx - 2)},${r0(by)}L${r0(tx - 2)},${r0(ty)}`;
    }
    S.add(`<path d="${logs}" stroke="#2a1a12" stroke-width="${f1(ps * 0.12)}" stroke-linecap="round"/><path d="${lit}" stroke="#ff9a4a" stroke-width="${f1(ps * 0.035)}" stroke-linecap="round" opacity=".8"/>`);
    const fm = flameMass(L, fx - ps * 0.62, fy - ps * 0.08, fx + ps * 0.62, fy - ps * 0.08, ps * 1.7, { n: 7, wind: 0.06 });
    S.add(`<path d="${fm.body}" fill="#ff8a30"/><path d="${fm.licks}" fill="#ffb050"/><path d="${fm.core}" fill="#ffe08a"/><path d="${fm.edge}" fill="none" stroke="#ffd070" stroke-width="2" opacity=".8"/>`);
    S.add(`<ellipse cx="${r0(fx)}" cy="${r0(fy - ps * 0.3)}" rx="${r0(ps * 0.55)}" ry="${r0(ps * 0.32)}" fill="${S.rad([[0, '#fff2c0', 0.95], [0.6, '#ffd070', 0.55], [1, '#ffb050', 0]])}"/>`);
    S.add(`<ellipse cx="${r0(fx)}" cy="${r0(fy - ps * 0.7)}" rx="${r0(ps * 1.6)}" ry="${r0(ps * 1.3)}" fill="#ff9a40" opacity=".22" filter="${S.blur(3)}"/>`);
    let sparks = '';
    for (let i = 0; i < 26; i++) sparks += ell(fx + L.range(-ps * 0.9, ps * 1.3), fy - L.range(ps * 1.6, ps * 4.6), L.range(0.8, 2), L.range(0.8, 2));
    S.add(`<path d="${sparks}" fill="#ffd890"/>`);
  }
  // the kettle on a flat stone at the edge of the ring
  {
    const [kx, ky] = pr(FX - 1.05, 0.1, FZ - 0.3);
    const k = ps * 0.24;
    S.add(`<path d="${ell(kx, ky + k * 0.55, k * 1.05, k * 0.3)}" fill="#4a4044"/>`
      + `<path d="M${f1(kx - k * 0.8)},${f1(ky + k * 0.4)}C${f1(kx - k * 0.95)},${f1(ky - k * 0.5)} ${f1(kx - k * 0.4)},${f1(ky - k * 0.8)} ${f1(kx)},${f1(ky - k * 0.8)}C${f1(kx + k * 0.4)},${f1(ky - k * 0.8)} ${f1(kx + k * 0.95)},${f1(ky - k * 0.5)} ${f1(kx + k * 0.8)},${f1(ky + k * 0.4)}Z" fill="#26222a"/>`
      + `<path d="M${f1(kx + k * 0.7)},${f1(ky - k * 0.1)}L${f1(kx + k * 1.35)},${f1(ky - k * 0.55)}" stroke="#26222a" stroke-width="${f1(k * 0.22)}" stroke-linecap="round"/>`
      + `<path d="M${f1(kx - k * 0.45)},${f1(ky - k * 0.75)}Q${f1(kx)},${f1(ky - k * 1.5)} ${f1(kx + k * 0.45)},${f1(ky - k * 0.75)}" fill="none" stroke="#3a343c" stroke-width="2.2"/>`
      + `<path d="M${f1(kx + k * 0.75)},${f1(ky + k * 0.3)}C${f1(kx + k * 0.85)},${f1(ky - k * 0.3)} ${f1(kx + k * 0.6)},${f1(ky - k * 0.6)} ${f1(kx + k * 0.2)},${f1(ky - k * 0.75)}" fill="none" stroke="#ff9a50" stroke-width="2" opacity=".7"/>`
      + `<path d="M${f1(kx + k * 1.35)},${f1(ky - k * 0.7)}q${f1(k * 0.3)},${f1(-k * 0.5)} 0,${f1(-k)}q${f1(-k * 0.3)},${f1(-k * 0.5)} 0,${f1(-k)}" fill="none" stroke="#c8c0d0" stroke-width="2" opacity=".25"/>`);
  }
}

function silverRailCamp() {
  const S = new Scene('sbGdCCamp', '银轨号旁的临时营地·篝火夜：停驶的银轨号斜停在荒原上，几扇车窗亮着琥珀灯，车顶边缘一条月光；车头前的铁轨在雾墙前断掉，雾里隐约立着巨大的拱廊；近处是石圈篝火、火边的铁壶、圆木长凳、毯子、装零件的木箱和车门边的提灯；荒原上有残雪与枯草，左上是缺了一角的月亮和星空；不画人', 5050);
  campSky(S);
  campFar(S);
  campGround(S);
  campTrack(S);
  const { bodies } = campTrain(S);
  campFire(S, bodies);
  // grade, the dialogue band, vignette
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#08060a', 0], [1, '#08060a', 0.42]])}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.55, '#06060e', 0], [1, '#06060e', 0.55]], 'cx="0.5" cy="0.45" r="0.8"')}"/>`);
  return S.out();
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// frost-corridor-entrance
// ═══════════════════════════════════════════════════════════════════════════════════════
const VP = [800, 440];
const fp = persp({ vp: VP, F: 820, eye: 1.7 });
const HALF = 4.2, WALL = 4.0, ARCH = 4.2; // tunnel half-width, wall height, arch rise (a round vault)
// a point on the tunnel's cross-section: u in [0, 1] runs left floor → left wall → vault → right wall → right floor
function section(u) {
  const arcLen = Math.PI * HALF, total = WALL * 2 + arcLen;
  let s = u * total;
  if (s <= WALL) return [-HALF, s];
  s -= WALL;
  if (s <= arcLen) {
    const a = Math.PI * (1 - s / arcLen);
    return [Math.cos(a) * HALF, WALL + Math.sin(a) * ARCH];
  }
  s -= arcLen;
  return [HALF, WALL - s];
}
const ringPts = (Z, n = 28, scale = 1) => Array.from({ length: n + 1 }, (_, i) => { const [X, Y] = section(i / n); return fp(X * scale, Y * scale, Z); });
const lerpC = (a, b, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) + (parseInt(b.slice(i, i + 2), 16) - parseInt(a.slice(i, i + 2), 16)) * t).toString(16).padStart(2, '0')).join('');

function frostCorridor() {
  const S = new Scene('sbGdCFrost', '霜冻回廊·入口：站在冰晶拱口往里看，拱形通道一节一节退向深处，尽头透着冷白的光；冰壁半透明，冻着不成形的暗影与裂纹，霜里嵌着点点碎片似的暖光；两侧立着冰柱，地上一层薄霜，拱口垂着冰凌；冷蓝色调；不画人', 6060);
  const R = S.R;
  const Zs = [4.6, 6.4, 8.8, 12, 16.5, 22.5, 30, 40, 54, 72, 96, 130];
  const shade = (Z) => Math.min(1, Math.log(Z / 4.6) / Math.log(130 / 4.6));
  S.add(`<rect width="${W}" height="${H}" fill="#0c1a2a"/>`);
  // walls and vault: one band between each pair of rings, darker near, glowing toward the far end
  for (let i = Zs.length - 1; i > 0; i--) {
    const far = ringPts(Zs[i]), near = ringPts(Zs[i - 1]);
    const k = shade(Zs[i]);
    S.add(`<path d="${pz([...near, ...[...far].reverse()])}" fill="${lerpC('#163252', '#9ccbe6', Math.pow(k, 1.5))}"/>`);
  }
  // the floor: one smooth frost sheet from the threshold to the far light
  const fl = [fp(-HALF, 0, Zs[0]), fp(-HALF, 0, 130), fp(HALF, 0, 130), fp(HALF, 0, Zs[0])];
  S.add(`<path d="${pz([[fl[0][0] - 400, 900], fl[0], fl[1], fl[2], fl[3], [fl[3][0] + 400, 900]])}" fill="${S.lin([[0, '#d6ecf6'], [0.12, '#8ab8d4'], [0.45, '#3a6688'], [1, '#183452']], 'gradientUnits="userSpaceOnUse" x1="0" y1="440" x2="0" y2="900"')}"/>`);
  // light pooling down the middle of the floor
  S.add(`<path d="${pz([fp(-1.6, 0, 130), fp(1.6, 0, 130), fp(3.2, 0, 4), fp(-3.2, 0, 4)])}" fill="${S.lin([[0, '#f0faff', 0.5], [0.4, '#bfe0f0', 0.14], [1, '#bfe0f0', 0]], 'gradientUnits="userSpaceOnUse" x1="0" y1="440" x2="0" y2="860"')}"/>`);
  // the far opening and its cold light
  S.add(`<path d="${pz(ringPts(130))}" fill="#eef8fc"/>`);
  S.add(`<circle cx="${VP[0]}" cy="${VP[1] - 6}" r="260" fill="${S.rad([[0, '#f6fcff', 0.85], [0.3, '#c4e4f4', 0.38], [1, '#8ab4cc', 0]])}"/>`);

  // ice texture on the walls: facets, cracks, and dark unformed shapes frozen deep inside
  const wallPt = (side, Z, Y) => fp(side * HALF, Y, Z);
  let facets = '', facetsLit = '', cracks = '', inclusions = '';
  for (let i = 0; i < 60; i++) {
    const side = R() < 0.5 ? -1 : 1, Z = 5 + Math.pow(R(), 1.6) * 55, Y = R.range(0.3, WALL - 0.2);
    const near = Math.min(1, Z / 12); // keep the facets on the nearest panels small, so they read as ice grain rather than shapes
    const dz = R.range(0.6, 2) * (Z / 10 + 0.4) * near, dy = R.range(0.4, 1.3) * near;
    const tri = pz([wallPt(side, Z, Y), wallPt(side, Z + dz, Y + dy * R.range(-0.6, 0.6)), wallPt(side, Z + dz * R.range(0.2, 0.8), Y + dy)]);
    if (R() < 0.5) facets += tri; else facetsLit += tri;
  }
  for (let i = 0; i < 16; i++) {
    const side = R() < 0.5 ? -1 : 1;
    let z = 5.5 + Math.pow(R(), 1.5) * 26, y = R.range(0.4, 3.6);
    const pts = [wallPt(side, z, y)];
    for (let k = 0; k < 4; k++) { z += R.range(0.3, 1.1) * (z / 8 + 0.3); y = Math.max(0.2, Math.min(WALL, y + R.range(-1.1, 1.1))); pts.push(wallPt(side, z, y)); }
    cracks += pl(pts);
  }
  for (let i = 0; i < 18; i++) {
    const side = R() < 0.5 ? -1 : 1, Z = 5.5 + Math.pow(R(), 1.3) * 30, Y = R.range(0.6, 3.4);
    const [x, y] = wallPt(side, Z, Y);
    const s = 820 / Z;
    const pts = [];
    for (let k = 0; k < 7; k++) { const a = Math.PI * 2 * k / 7; pts.push([x + Math.cos(a) * s * R.range(0.12, 0.3), y + Math.sin(a) * s * R.range(0.25, 0.7)]); }
    inclusions += shape(pts, true, 0);
  }
  S.add(`<path d="${inclusions}" fill="#08182a" opacity=".45" filter="${S.blur(2)}"/>`);
  S.add(`<path d="${facets}" fill="#0e2840" opacity=".3"/><path d="${facetsLit}" fill="#dcf2fc" opacity=".12"/>`);
  S.add(`<path d="${cracks}" fill="none" stroke="#e4f4fc" stroke-width="1.2" opacity=".3"/>`);

  // arch ribs at each ring: thick bands of clear ice, a bright inner edge toward the far light, icicles hanging off the vault
  for (let i = Zs.length - 2; i >= 1; i--) {
    const Z = Zs[i];
    const outer = ringPts(Z), inner = ringPts(Z + 0.35 + Z * 0.035, 28, 0.92);
    const k = shade(Z);
    S.add(`<path d="${pz([...outer, ...[...inner].reverse()])}" fill="${lerpC('#12304e', '#86b8d6', Math.pow(k, 1.2))}"/>`);
    S.add(`<path d="${pl(inner)}" fill="none" stroke="${lerpC('#9ccfea', '#f2fbff', k)}" stroke-width="${f1(Math.max(1, 16 / Z))}" opacity=".75"/>`);
    let ic = '';
    for (let j = 7; j <= 21; j++) {
      if (R() < 0.4) continue;
      const [x, y] = inner[j];
      const len = (820 / Z) * R.range(0.2, 0.75), w = (820 / Z) * R.range(0.05, 0.1);
      ic += `M${f1(x - w)},${f1(y - 1)}L${f1(x + R.range(-0.2, 0.2) * w)},${f1(y + len)}L${f1(x + w)},${f1(y - 1)}Z`;
    }
    S.add(`<path d="${ic}" fill="${lerpC('#4a7c9e', '#d8eef8', k)}" opacity=".85"/>`);
  }

  // freestanding ice columns along both walls (the third on the right is the one in the fight)
  const column = (X, Z) => {
    const s = 820 / Z;
    const [bx, by] = fp(X, 0, Z), [, ty] = fp(X, WALL + 0.9, Z);
    const w = s * 0.5, hgt = by - ty;
    const body = shape([[bx - w * 0.8, by, 1], [bx - w * 0.55, by - hgt * 0.25], [bx - w * 0.42, by - hgt * 0.7], [bx - w * 0.75, ty, 1], [bx + w * 0.75, ty, 1], [bx + w * 0.42, by - hgt * 0.7], [bx + w * 0.55, by - hgt * 0.25], [bx + w * 0.8, by, 1]], true, 0);
    const k = shade(Z);
    const face = shape([[bx - w * 0.1, by, 1], [bx - w * 0.05, by - hgt * 0.5], [bx - w * 0.2, ty + 2, 1], [bx + w * 0.7, ty + 2, 1], [bx + w * 0.4, by - hgt * 0.7], [bx + w * 0.5, by - hgt * 0.25], [bx + w * 0.75, by, 1]], true, 0);
    return `<path d="${body}" fill="${lerpC('#1e4262', '#a0c8e0', Math.pow(k, 1.3))}" opacity=".92"/>`
      + `<path d="${face}" fill="${lerpC('#3a6a8c', '#c8e4f2', Math.pow(k, 1.3))}" opacity=".55"/>`
      + `<path d="M${f1(bx + w * 0.25)},${f1(by - 4)}L${f1(bx + w * 0.16)},${f1(ty + 6)}" stroke="#eefaff" stroke-width="${f1(Math.max(1.2, s * 0.05))}" opacity=".6"/>`;
  };
  for (const Z of [44, 30, 20.5, 14]) { S.add(column(-HALF + 0.75, Z)); S.add(column(HALF - 0.75, Z + 1.5)); }

  // the frost floor: crazed lines running toward the light, a few cracks near the threshold
  let lines = '';
  for (let i = 0; i < 20; i++) {
    const X = R.range(-3.9, 3.9), Z0 = R.range(4.2, 8), Z1 = Z0 + R.range(6, 40);
    lines += pl([fp(X, 0, Z0), fp(X * R.range(0.8, 1.1), 0, Z1)]);
  }
  S.add(`<path d="${lines}" stroke="#d8eef8" stroke-width="1" opacity=".16" fill="none"/>`);
  let floorCracks = '';
  for (let i = 0; i < 6; i++) {
    let X = R.range(-3, 3), Z = R.range(4, 7);
    const pts = [fp(X, 0, Z)];
    for (let k = 0; k < 5; k++) { X += R.range(-0.45, 0.45); Z += R.range(0.3, 1.1); pts.push(fp(X, 0, Z)); }
    floorCracks += pl(pts);
  }
  S.add(`<path d="${floorCracks}" stroke="#f0faff" stroke-width="1.4" opacity=".3" fill="none"/>`);

  // memory shards: little diamonds of warm light held in the frost, thicker along the walls
  let shardW = '', shardC = '', glow = '';
  for (let i = 0; i < 70; i++) {
    let x, y, s;
    if (R() < 0.7) {
      const side = R() < 0.5 ? -1 : 1, Z = 5 + Math.pow(R(), 1.4) * 45, Y = R.range(0.2, WALL - 0.1);
      [x, y] = fp(side * HALF, Y, Z); s = 820 / Z;
    } else {
      const Z = 4.4 + Math.pow(R(), 1.3) * 30, X = R.range(-4, 4);
      [x, y] = fp(X, 0.02, Z); s = 820 / Z;
    }
    const d = Math.max(2, s * R.range(0.04, 0.09));
    const dia = `M${f1(x)},${f1(y - d * 1.5)}L${f1(x + d)},${f1(y)}L${f1(x)},${f1(y + d * 1.5)}L${f1(x - d)},${f1(y)}Z`;
    if (R() < 0.62) { shardW += dia; if (R() < 0.55) glow += ell(x, y, d * 3.2, d * 3.2); } else shardC += dia;
  }
  S.add(`<path d="${glow}" fill="#ffb878" opacity=".26" filter="${S.blur(2)}"/>`);
  S.add(`<path d="${shardW}" fill="#ffd8a0" opacity=".9"/><path d="${shardC}" fill="#e8f6ff" opacity=".7"/>`);
  let motes = '';
  for (let i = 0; i < 70; i++) motes += ell(R.range(160, 1440), R.range(100, 800), R.range(0.8, 2.1), R.range(0.8, 2.1));
  S.add(`<path d="${motes}" fill="#e8f6ff" opacity=".45"/>`);
  // cold mist low along the floor
  S.add(`<path d="M-40,780C300,720 600,740 820,712C1060,684 1300,740 1640,720V900H-40Z" fill="#bcd8ea" opacity=".12" filter="${S.blur(3)}"/>`);

  // the entrance arch in the foreground: a narrower opening of heavy rime, so the arch frames the view
  const fr = [];
  for (let i = 0; i <= 34; i++) {
    const [X, Y] = section(i / 34);
    const [x, y] = fp(X * 0.86, Y * 0.9, Zs[0]);
    fr.push([x + R.range(-7, 7), Math.min(y, 905) + R.range(-5, 5)]);
  }
  fr[0][1] = 905; fr[fr.length - 1][1] = 905;
  const frame = `M-20,-20H1620V920H-20Z${pz(fr)}`;
  S.add(`<path d="${frame}" fill="${S.lin([[0, '#0a1626'], [0.5, '#12263a'], [1, '#08121e']], 'x1="0" y1="0" x2="1" y2="0"')}" fill-rule="evenodd"/>`);
  // rime facets on the frame's face
  let rime = '';
  for (let i = 0; i < 40; i++) {
    const left = R() < 0.5, y = R.range(0, 900);
    const xEdge = left ? fr[2][0] : fr[fr.length - 3][0];
    const x = left ? R.range(0, xEdge - 10) : R.range(xEdge + 10, 1600);
    const s = R.range(14, 46);
    rime += `M${f1(x)},${f1(y)}l${f1(s * 0.6)},${f1(s * 0.3)}l${f1(-s * 0.2)},${f1(s * 0.7)}Z`;
  }
  S.add(`<path d="${rime}" fill="#3a6684" opacity=".35"/>`);
  S.add(`<path d="${pl(fr)}" fill="none" stroke="#7ab0d0" stroke-width="7" opacity=".45"/>`);
  S.add(`<path d="${pl(fr)}" fill="none" stroke="#eaf8ff" stroke-width="1.8" opacity=".65"/>`);
  // big icicles hanging from the lintel across the top of the picture
  let big = '', bigLit = '';
  for (let x = -10; x < 1620;) {
    const w = R.range(10, 26), len = R.range(26, 110) * (x > 300 && x < 1300 ? 0.75 : 1.2);
    big += `M${f1(x - w)},-4L${f1(x + R.range(-4, 4))},${f1(len)}L${f1(x + w)},-4Z`;
    bigLit += `M${f1(x - w * 0.45)},0L${f1(x)},${f1(len * 0.8)}`;
    x += w * R.range(1.2, 2.2);
  }
  S.add(`<path d="M-20,-20H1620V14C1200,30 400,30 -20,14Z" fill="#0c1a2c"/>`);
  S.add(`<path d="${big}" fill="#2e5878"/><path d="${bigLit}" stroke="#d8f0ff" stroke-width="1.6" opacity=".5" fill="none"/>`);
  // feathery frost creeping over the frame
  const fb = fbm(6061, 120, 3);
  let feather = '';
  for (let i = 0; i < 110; i++) {
    const left = R() < 0.5, y = R.range(40, 890);
    const xEdge = left ? fr[2][0] : fr[fr.length - 3][0];
    const x = left ? xEdge - R.range(0, 110) - fb(y) * 20 : xEdge + R.range(0, 110) + fb(y) * 20;
    const a = (left ? 0 : Math.PI) + R.range(-1, 1), l = R.range(10, 30);
    feather += `M${f1(x)},${f1(y)}l${f1(Math.cos(a) * l)},${f1(Math.sin(a) * l)}`;
  }
  S.add(`<path d="${feather}" stroke="#bfe0f2" stroke-width="1.3" opacity=".32" fill="none"/>`);

  // the dialogue band and vignette
  S.add(`<rect y="620" width="${W}" height="280" fill="${S.lin([[0, '#06101a', 0], [1, '#06101a', 0.42]])}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.5, '#040a12', 0], [1, '#040a12', 0.5]], 'cx="0.5" cy="0.48" r="0.78"')}"/>`);
  return S.out();
}

export const gaidenCBgs = {
  'silver-rail-camp': () => silverRailCamp(),
  'frost-corridor-entrance': () => frostCorridor(),
};
