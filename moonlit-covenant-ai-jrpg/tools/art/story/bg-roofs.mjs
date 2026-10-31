// 雾港·鱼市屋顶·雨夜 (chapter 13, the rooftop chase 13-05 … 13-07; script 13 美術需求):
//   fog-harbor-fish-market-roofs-rain — standing on a ridge behind the fish market, looking along one roof after
//                            another: timber-framed gables, wet tiles with rain running down every tile channel, vines
//                            hanging from the eaves, alleys dropping away between the rows; the run ends at the last roof
//                            at the end of the stone embankment, whose eave hangs over the swollen tidal canal. Far off
//                            across the water, on the stone mole, the outline of the old lighthouse with one small light
//                            in its base window. A flash of lightning somewhere behind the clouds lights the ridges
//                            cold. No figures.
import { Scene, W, H, f, pz, pl, persp, mix } from './lib.mjs';

const r0 = (v) => f(v, 0);

const RF = {
  sky: [[0, '#06080e'], [0.45, '#141a26'], [0.8, '#26303e'], [1, '#323c4a']],
  flash: '#b8cce8', cloud: '#0e121a', cloudLit: '#3a4a62',
  sea: [[0, '#151c26'], [1, '#080b10']], water: [[0, '#141c26'], [1, '#06090e']], ring: '#5a6a80',
  mole: '#0c0f14', moleLit: '#3a4658', tower: '#0a0c12', towerLit: '#4a566a', lamp: '#ffc070',
  tile: '#2a3038', tileDark: '#161a20', tileLit: '#4c5868', tileLine: '#0c0e12', ridge: '#1a1e24', ridgeLit: '#8ea2c0',
  wall: '#2a2a2e', wallDark: '#18181c', beam: '#1c1612', beamLit: '#4a3e34', win: '#d89a58',
  vine: '#141a14', leaf: '#1e2a1c', rain: '#a8b8cc', sheen: '#7a90ac',
};

function fishMarketRoofs() {
  const S = new Scene('sbFishRoofs', '雾港·鱼市屋顶·雨夜：鱼市后面一片连着一片的木梁屋顶与湿瓦，瓦沟里流着雨水，屋檐垂着藤，屋与屋之间是黑下去的窄巷；屋顶一路接到石堤尽头的最后一个屋顶，檐边底下是涨潮的水道；远处石堤上是旧灯塔的轮廓，塔底那扇窗亮着一点灯；云后闪电的冷光照亮瓦脊；没有人', 7611);
  const R = S.R;
  const P = RF;
  const EYE = 8.9, VP = [800, 336]; // standing on the ridge
  const pr = persp({ vp: VP, F: 900, eye: EYE });
  const HZ = VP[1];
  const q = (pts) => pr.quad(pts);
  const px = (v) => f(v, 1);

  // ---- sky: low storm cloud, a lightning flash behind it on the left ----------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(P.sky, `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HZ}"`)}"/>`);
  S.add(`<ellipse cx="360" cy="150" rx="520" ry="230" fill="${S.rad([[0, P.flash, 0.55], [0.4, P.flash, 0.18], [1, P.flash, 0]])}"/>`);
  {
    // cloud banks: soft dark masses, the flash catching the edges of the ones on the left
    let d = '', lit = '';
    for (let i = 0; i < 16; i++) {
      const cx = R.range(-100, W + 100), cy = R.range(20, 300), rx = R.range(160, 340), ry = R.range(40, 80);
      d += `<ellipse cx="${r0(cx)}" cy="${r0(cy)}" rx="${r0(rx)}" ry="${r0(ry)}"/>`;
      if (cx < 900 && cy > 80) lit += `<ellipse cx="${r0(cx - rx * 0.1)}" cy="${r0(cy - ry * 0.55)}" rx="${r0(rx * 0.6)}" ry="${r0(ry * 0.3)}"/>`;
    }
    S.add(`<g fill="${P.cloud}" opacity=".7" filter="${S.blur(3)}">${d}</g>`);
    S.add(`<g fill="${P.cloudLit}" opacity=".45" filter="${S.blur(3)}">${lit}</g>`);
    // the bolt itself, far off and thin, half lost in the cloud
    const bolt = [[300, 150], [286, 206], [306, 236], [284, 290], [296, 314], [278, HZ - 2]];
    const fork = [[306, 236], [338, 270], [330, 304]];
    S.add(`<path d="${pl(bolt)}${pl(fork)}" fill="none" stroke="${P.flash}" stroke-width="6" opacity=".25" filter="${S.blur(1)}" stroke-linejoin="round"/>`);
    S.add(`<path d="${pl(bolt)}${pl(fork)}" fill="none" stroke="#eef4ff" stroke-width="1.6" opacity=".8" stroke-linejoin="round"/>`);
  }

  // ---- beyond: the open sea, the stone mole and the old lighthouse; the tidal canal in front of them -------------
  const ZM = 82; // the mole's depth
  S.add(`<rect y="${HZ - 1}" width="${W}" height="${H - HZ + 1}" fill="${S.lin(P.sea, `gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="560"`)}"/>`);
  {
    // the mole: a long low wall of stone running in from the right and ending at the tower
    const MY = 2.4, TX = 13;
    const front = [[TX - 3, MY, ZM], [80, MY, ZM - 6], [80, -0.6, ZM - 6], [TX - 3, -0.6, ZM]];
    S.add(`<path d="${q(front)}" fill="${P.mole}"/><path d="${pl(pr.poly([[TX - 3, MY, ZM], [80, MY, ZM - 6]]))}" stroke="${P.moleLit}" stroke-width="2" opacity=".7"/>`);
    // the tower: a tapering stone shaft, the gallery, the lamp room (dark), the cap
    const t = (x, y) => pr(TX + x, y, ZM + 2);
    const b0 = t(-2.6, MY), b1 = t(2.6, MY), u0 = t(-1.9, 17), u1 = t(1.9, 17);
    S.add(`<path d="${pz([b0, u0, u1, b1])}" fill="${P.tower}"/>`);
    S.add(`<path d="${pz([b0, u0, t(-1.4, 17), t(-1.9, MY)])}" fill="${P.towerLit}" opacity=".55"/>`);
    const g0 = t(-2.6, 17), g1 = t(2.6, 17), g2 = t(2.6, 17.6), g3 = t(-2.6, 17.6);
    S.add(`<path d="${pz([g0, g1, g2, g3])}" fill="${P.tower}"/>`);
    const l0 = t(-1.5, 17.6), l1 = t(1.5, 17.6), l2 = t(1.5, 20), l3 = t(-1.5, 20);
    S.add(`<path d="${pz([l0, l1, l2, l3])}" fill="#141a24"/><path d="${pl([t(-0.5, 17.6), t(-0.5, 20)])}${pl([t(0.5, 17.6), t(0.5, 20)])}" stroke="${P.tower}" stroke-width="2"/>`);
    S.add(`<path d="${pz([t(-1.8, 20), t(1.8, 20), t(0, 22.4)])}" fill="${P.tower}"/><path d="${pl([t(-1.8, 20), t(0, 22.4)])}" stroke="${P.towerLit}" stroke-width="1.6" opacity=".8"/>`);
    // the one lit window in its base, a warm point with a small halo, and its broken streak on the water
    const w = t(0.3, MY + 1.4);
    S.add(`<circle cx="${px(w[0])}" cy="${px(w[1])}" r="14" fill="${P.lamp}" opacity=".35" filter="${S.blur(1)}"/><rect x="${px(w[0] - 2.5)}" y="${px(w[1] - 3.5)}" width="5" height="7" fill="${P.lamp}"/>`);
    // a faint line of lamps far off on the left shore
    let lights = '';
    for (let i = 0; i < 9; i++) { const xx = R.range(40, 560), yy = HZ + R.range(4, 14); lights += `<rect x="${px(xx)}" y="${px(yy)}" width="3" height="3" fill="${P.lamp}" opacity="${f(R.range(0.25, 0.6), 2)}"/>`; }
    S.add(`<path d="M0,${HZ + 18}L640,${HZ + 14}L640,${HZ + 4}Q500,${HZ - 6} 360,${HZ}Q200,${HZ - 10} 0,${HZ - 2}Z" fill="${P.mole}" opacity=".8"/>${lights}`);
    // the canal: swollen with the tide, rain rings, the lamp's reflection broken into dashes
    const cy0 = pr(0, -0.6, ZM - 1)[1];
    S.add(`<rect y="${px(cy0)}" width="${W}" height="${px(H - cy0)}" fill="${S.lin(P.water, `gradientUnits="userSpaceOnUse" x1="0" y1="${r0(cy0)}" x2="0" y2="720"`)}"/>`);
    let rings = '';
    for (let i = 0; i < 70; i++) { const y = R.range(cy0 + 4, 700), k = (y - HZ) / (H - HZ); rings += `<ellipse cx="${px(R.range(0, W))}" cy="${px(y)}" rx="${px(3 + 26 * k)}" ry="${px(0.8 + 4 * k)}"/>`; }
    S.add(`<g fill="none" stroke="${P.ring}" stroke-width="1.1" opacity=".4">${rings}</g>`);
    let streak = '';
    for (let y = cy0 + 6, i = 0; y < 640; y += 9 + i * 1.5, i++) { const ww = 4 + i * 1.6; streak += `M${px(w[0] - ww / 2 + R.range(-3, 3))},${px(y)}h${px(ww)}`; }
    S.add(`<path d="${streak}" stroke="${P.lamp}" stroke-width="2.2" opacity=".35"/>`);
  }

  // ---- the town ground at the foot of the roofs (the alleys between them), and the quay where it ends at the canal ----
  {
    const ZQ = 31.5;
    S.add(`<path d="${q([[-60, 0, 0.6], [60, 0, 0.6], [60, 0, ZQ], [-60, 0, ZQ]])}" fill="#07080c"/>`);
    S.add(`<path d="${q([[-60, 0, ZQ], [60, 0, ZQ], [60, -0.6, ZQ], [-60, -0.6, ZQ]])}" fill="#141820"/><path d="${pl(pr.poly([[-60, 0, ZQ], [60, 0, ZQ]]))}" stroke="${P.moleLit}" stroke-width="1.6" opacity=".6"/>`);
    // a lamp or two burning in the alleys
    for (const [lx, lz] of [[-4.6, 12.6], [4.4, 17]]) { const c = pr(lx, 2.2, lz); S.add(`<circle cx="${px(c[0])}" cy="${px(c[1])}" r="10" fill="${P.lamp}" opacity=".3" filter="${S.blur(1)}"/><circle cx="${px(c[0])}" cy="${px(c[1])}" r="2.4" fill="${P.lamp}"/>`); }
  }

  // ---- the roofs -----------------------------------------------------------------------------------------
  // b = { x: centre, hw: half width, z0, z1, e: eave height, r: ridge height, along: 'z' (ridge runs away from us) | 'x' }
  const blds = [
    // the row we stand on: the end of our own roof, then one roof after another stepping down the embankment
    { x: 0, hw: 3.3, z0: 1.4, z1: 6.2, e: 6.0, r: 7.3, along: 'z', own: true },
    { x: 0.3, hw: 3.4, z0: 7.4, z1: 12.0, e: 4.7, r: 5.7, along: 'x', vines: true },
    { x: -0.4, hw: 3.1, z0: 13.2, z1: 19.0, e: 4.0, r: 4.9, along: 'z', vines: true },
    { x: 0.5, hw: 3.0, z0: 20.4, z1: 29.5, e: 3.2, r: 4.3, along: 'z', last: true, vines: true },
    // the next row on the left, ending sooner
    { x: -8.0, hw: 3.2, z0: 2.6, z1: 9.0, e: 4.8, r: 6.0, along: 'z', vines: true },
    { x: -8.4, hw: 3.4, z0: 10.0, z1: 15.4, e: 4.2, r: 5.5, along: 'x' },
    { x: -7.8, hw: 3.0, z0: 16.4, z1: 21.2, e: 3.7, r: 4.7, along: 'z', vines: true },
    // and on the right, a taller warehouse and two sheds
    { x: 8.2, hw: 3.4, z0: 2, z1: 10, e: 6.0, r: 7.6, along: 'z', vines: true },
    { x: 7.8, hw: 3.0, z0: 11, z1: 16.5, e: 4.6, r: 5.6, along: 'x', vines: true },
    { x: 8.4, hw: 3.2, z0: 17.5, z1: 24, e: 4.0, r: 5.0, along: 'z' },
  ];
  // the vertical faces first, far to near, then each roof on top of its own walls
  blds.sort((a, b) => b.z0 - a.z0 || Math.abs(b.x) - Math.abs(a.x));
  const lightningLit = (x) => 0.5 + 0.5 * Math.max(0, Math.min(1, (-x + 6) / 14)); // the flash is to the left
  for (const b of blds) {
    const { x, hw, z0, z1, e, r } = b;
    const ov = 0.35; // eave overhang
    const xl = x - hw, xr = x + hw;
    let s = '';
    // side walls facing the camera's side (the alleys), with a lit window now and then
    const sideX = x < -1 ? xr : x > 1 ? xl : null;
    if (sideX !== null && !b.own) {
      s += `<path d="${q([[sideX, 0, z0], [sideX, e, z0], [sideX, e, z1], [sideX, 0, z1]])}" fill="${P.wallDark}"/>`;
      if (z0 > 6 && R() < 0.7) { const wz = R.range(z0 + 1, z1 - 2), wy = e - 1.6; s += `<path d="${q([[sideX, wy, wz], [sideX, wy + 0.9, wz], [sideX, wy + 0.9, wz + 0.7], [sideX, wy, wz + 0.7]])}" fill="${P.win}" opacity=".55"/>`; }
    }
    if (b.along === 'z') {
      // front gable: timber frame, plaster infill (not for the roof we stand on)
      if (!b.own) {
        s += `<path d="${q([[xl, 0, z0], [xl, e, z0], [x, r, z0], [xr, e, z0], [xr, 0, z0]])}" fill="${P.wall}"/>`;
        s += `<path d="${pl(pr.poly([[xl, e, z0], [xr, e, z0]]))}${pl(pr.poly([[x, e, z0], [x, r, z0]]))}${pl(pr.poly([[xl + 0.4, e, z0], [x, r - 0.3, z0]]))}${pl(pr.poly([[xr - 0.4, e, z0], [x, r - 0.3, z0]]))}${pl(pr.poly([[xl, e - 1.6, z0], [xr, e - 1.6, z0]]))}" stroke="${P.beam}" stroke-width="${px(Math.max(2, 0.22 / z0 * 900))}" fill="none"/>`;
        s += `<path d="${pl(pr.poly([[xl, e + 0.02, z0], [xr, e + 0.02, z0]]))}" stroke="${P.beamLit}" stroke-width="1.5" opacity=".6"/>`;
        if (R() < 0.5) { const wx = x + R.range(-1.6, 0.8); s += `<path d="${q([[wx, e - 1.4, z0], [wx + 0.7, e - 1.4, z0], [wx + 0.7, e - 0.5, z0], [wx, e - 0.5, z0]])}" fill="${P.win}" opacity=".6"/>`; }
      }
      // two slopes; the far end of the last roof is a hip so its eave runs round the end above the canal
      const slope = (side) => {
        const xe = side < 0 ? xl - ov : xr + ov;
        const pts = [[xe, e - 0.1, z0 - (b.own ? 0 : ov)], [x, r, z0 - (b.own ? 0 : ov)], [x, r, z1 - (b.last ? 1.4 : 0)], [xe, e - 0.1, z1 + ov]];
        const facing = side < 0 ? x < 0.5 || x - hw > 0 : x > -0.5 || x + hw < 0; // roughly: the slope tilted toward us
        const lit = lightningLit(side < 0 ? xl : xr) * (side < 0 ? 1 : 0.7);
        const fill = mix(P.tileDark, P.tile, facing ? 0.6 + 0.4 * lit : 0.3);
        let o = `<path d="${q(pts)}" fill="${fill}"/>`;
        // tile channels running down the slope, every 30 cm; some carry a thread of rain water
        let ch = '', wet = '';
        const step = 0.3;
        for (let zz = z0 + 0.1; zz < z1 + ov - 0.05; zz += step) {
          const top = [x, r, Math.min(zz, z1 - (b.last ? 1.4 : 0))];
          const seg = pl([pr(...top), pr(xe, e - 0.1, zz)]);
          ch += seg;
          if (R() < 0.22) wet += seg;
        }
        // courses along the slope
        let co = '';
        for (let k = 1; k < 6; k++) { const t = k / 6; co += pl(pr.poly([[x + (xe - x) * t, r + (e - 0.1 - r) * t, z0 - (b.own ? 0 : ov) * t], [x + (xe - x) * t, r + (e - 0.1 - r) * t, z1 + ov * t - (b.last ? 1.4 * (1 - t) : 0)]])); }
        o += `<path d="${ch}" stroke="${P.tileLine}" stroke-width="${b.own ? 2.4 : 1.4}" opacity="${b.own ? '.45' : '.7'}"/>`;
        o += `<path d="${co}" fill="none" stroke="${P.tileLine}" stroke-width="${b.own ? 3 : 1.6}" opacity=".55"/>`;
        o += `<path d="${wet}" stroke="${P.sheen}" stroke-width="${b.own ? 2 : 1.1}" opacity="${b.own ? '.28' : '.4'}"/>`;
        // the eave: a dark fascia and its cold wet edge
        const eave = pl(pr.poly([[xe, e - 0.1, z0 - (b.own ? 0 : ov)], [xe, e - 0.1, z1 + ov]]));
        o += `<path d="${eave}" stroke="${P.beam}" stroke-width="${b.own ? 10 : 4}"/><path d="${eave}" stroke="${P.ridgeLit}" stroke-width="1.4" opacity="${f(0.25 + 0.35 * lit, 2)}"/>`;
        return { svg: o, facing };
      };
      const L = slope(-1), Rr = slope(1);
      // the slope turned away is drawn first
      s += (L.facing ? Rr.svg + L.svg : L.svg + Rr.svg);
      if (b.last) {
        // the hip at the far end: a triangle of tiles, its eave the very edge above the water
        const hip = [[xl - ov, e - 0.1, z1 + ov], [x, r, z1 - 1.4], [xr + ov, e - 0.1, z1 + ov]];
        // (the hip itself faces away; only its two hip lines show, ending at the eave corners above the water)
        s += `<path d="${pl(pr.poly([hip[0], hip[1], hip[2]]))}" fill="none" stroke="${P.ridge}" stroke-width="4"/><path d="${pl(pr.poly([hip[0], hip[1], hip[2]]))}" fill="none" stroke="${P.ridgeLit}" stroke-width="1.6" opacity=".75"/>`;
      }
      // ridge cap catching the flash
      const rg = pl(pr.poly([[x, r, z0 - (b.own ? 0 : ov)], [x, r, z1 - (b.last ? 1.4 : 0)]]));
      s += `<path d="${rg}" stroke="${P.ridge}" stroke-width="${b.own ? 16 : 5}" stroke-linecap="round"/><path d="${rg}" stroke="${P.ridgeLit}" stroke-width="${b.own ? 2.5 : 1.6}" opacity="${f(0.45 + 0.4 * lightningLit(x), 2)}"/>`;
    } else {
      // ridge across: we see the front slope rising from its eave, the back slope beyond the ridge, side gables
      const zm = (z0 + z1) / 2;
      s += `<path d="${q([[xl, 0, z0], [xl, e, z0], [xr, e, z0], [xr, 0, z0]])}" fill="${P.wall}"/>`;
      // exposed beam ends under the eave
      let be = '';
      for (let bx = xl + 0.3; bx < xr; bx += 0.8) be += pl(pr.poly([[bx, e - 0.25, z0 - 0.3], [bx, e - 0.25, z0]]));
      s += `<path d="${be}" stroke="${P.beamLit}" stroke-width="${px(Math.max(2, 0.18 / z0 * 900))}" opacity=".8"/>`;
      s += `<path d="${pl(pr.poly([[xl, e - 0.5, z0], [xr, e - 0.5, z0]]))}" stroke="${P.beam}" stroke-width="${px(Math.max(2, 0.2 / z0 * 900))}"/>`;
      if (R() < 0.6) { const wx = x + R.range(-1.4, 0.6); s += `<path d="${q([[wx, e - 1.7, z0], [wx + 0.8, e - 1.7, z0], [wx + 0.8, e - 0.8, z0], [wx, e - 0.8, z0]])}" fill="${P.win}" opacity=".5"/>`; }
      const gableX = x < -1 ? xr : x > 1 ? xl : null;
      if (gableX !== null) s += `<path d="${q([[gableX, e, z0], [gableX, r, zm], [gableX, e, z1]])}" fill="${P.wallDark}"/><path d="${pl(pr.poly([[gableX, e, z0], [gableX, r, zm], [gableX, e, z1]]))}" fill="none" stroke="${P.beam}" stroke-width="3"/>`;
      const back = [[xl - ov, r, zm], [xr + ov, r, zm], [xr + ov, e, z1 + ov], [xl - ov, e, z1 + ov]];
      if (pr(0, r, zm)[1] > pr(0, e, z1 + ov)[1]) s += `<path d="${q(back)}" fill="${mix(P.tileDark, P.tile, 0.25)}"/>`;
      const front = [[xl - ov, e - 0.1, z0 - ov], [xr + ov, e - 0.1, z0 - ov], [xr + ov, r, zm], [xl - ov, r, zm]];
      const lit = lightningLit(x);
      s += `<path d="${q(front)}" fill="${mix(P.tileDark, P.tile, 0.55 + 0.45 * lit)}"/>`;
      let ch = '', wet = '';
      for (let xx = xl - ov + 0.15; xx < xr + ov; xx += 0.3) { const seg = pl(pr.poly([[xx, e - 0.1, z0 - ov], [xx, r, zm]])); ch += seg; if (R() < 0.25) wet += seg; }
      let co = '';
      for (let k = 1; k < 6; k++) { const t = k / 6; co += pl(pr.poly([[xl - ov, e - 0.1 + (r - e + 0.1) * t, z0 - ov + (zm - z0 + ov) * t], [xr + ov, e - 0.1 + (r - e + 0.1) * t, z0 - ov + (zm - z0 + ov) * t]])); }
      s += `<path d="${ch}" stroke="${P.tileLine}" stroke-width="1.4" opacity=".7"/><path d="${co}" stroke="${P.tileLine}" stroke-width="1.6" opacity=".55"/><path d="${wet}" stroke="${P.sheen}" stroke-width="1.2" opacity=".42"/>`;
      const eave = pl(pr.poly([[xl - ov, e - 0.1, z0 - ov], [xr + ov, e - 0.1, z0 - ov]]));
      s += `<path d="${eave}" stroke="${P.beam}" stroke-width="5"/><path d="${eave}" stroke="${P.ridgeLit}" stroke-width="1.4" opacity=".5"/>`;
      const rg = pl(pr.poly([[xl - ov, r, zm], [xr + ov, r, zm]]));
      s += `<path d="${rg}" stroke="${P.ridge}" stroke-width="6" stroke-linecap="round"/><path d="${rg}" stroke="${P.ridgeLit}" stroke-width="1.8" opacity="${f(0.45 + 0.4 * lit, 2)}"/>`;
    }
    S.add(s);
    // vines hanging from the eave: a few dark strands with small leaves
    if (b.vines) {
      let vineD = '', leafD = '';
      const pts = [];
      if (b.along === 'z') { const xe = x < 0 ? xr + 0.35 : xl - 0.35; for (let i = 0; i < 4; i++) pts.push([xe, e - 0.1, R.range(z0 + 0.5, z1)]); }
      else for (let i = 0; i < 5; i++) pts.push([R.range(xl, xr), e - 0.1, z0 - 0.35]);
      if (b.last) for (let i = 0; i < 6; i++) pts.push([R.range(x - hw, x + hw), e - 0.1, z1 + 0.35]);
      for (const [vx, vy, vz] of pts) {
        const len = R.range(0.8, 2.2), top = pr(vx, vy, vz), bot = pr(vx + R.range(-0.15, 0.15), vy - len, vz);
        const sway = R.range(-6, 6) * 900 / vz / 60;
        vineD += `M${px(top[0])},${px(top[1])}Q${px(top[0] + sway)},${px((top[1] + bot[1]) / 2)} ${px(bot[0])},${px(bot[1])}`;
        const nL = Math.max(2, Math.round((bot[1] - top[1]) / 7));
        for (let k = 1; k < nL; k++) { const t = k / nL, lx = top[0] + (bot[0] - top[0]) * t + sway * 2 * t * (1 - t), ly = top[1] + (bot[1] - top[1]) * t, ls = Math.max(1.2, 0.09 * 900 / vz); leafD += `M${px(lx)},${px(ly)}q${px(ls * (k % 2 ? 1 : -1))},${px(-ls * 0.4)} ${px(ls * 1.6 * (k % 2 ? 1 : -1))},${px(ls * 0.3)}q${px(-ls * 0.6 * (k % 2 ? 1 : -1))},${px(ls * 0.6)} ${px(-ls * 1.6 * (k % 2 ? 1 : -1))},${px(-ls * 0.3)}Z`; }
      }
      S.add(`<path d="${vineD}" fill="none" stroke="${P.vine}" stroke-width="1.6"/><path d="${leafD}" fill="${P.leaf}"/>`);
    }
  }

  // ---- rain: long slanted streaks in two densities, spatter on the near ridge ------------------------------------
  {
    let d1 = '', d2 = '';
    for (let i = 0; i < 300; i++) { const x = R.range(-120, W), y = R.range(-40, H), L = R.range(26, 60); d1 += `M${r0(x)},${r0(y)}l${r0(L * 0.2)},${r0(L)}`; }
    for (let i = 0; i < 80; i++) { const x = R.range(-120, W), y = R.range(-40, H), L = R.range(80, 150); d2 += `M${r0(x)},${r0(y)}l${r0(L * 0.22)},${r0(L)}`; }
    S.add(`<path d="${d1}" stroke="${P.rain}" stroke-width="1" opacity=".22"/><path d="${d2}" stroke="${P.rain}" stroke-width="1.7" opacity=".17"/>`);
  }
  // ---- grade: the flash's cold wash from the upper left, dark corners; the dialogue band calmer -------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, P.flash, 0.1], [0.5, P.flash, 0], [1, P.flash, 0]], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.45, '#04060a', 0], [1, '#04060a', 0.65]], 'cx="0.5" cy="0.46" r="0.78"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#04060a', 0], [1, '#04060a', 0.5]])}"/>`);
  return S.out();
}

export const roofBgs = {
  'fog-harbor-fish-market-roofs-rain': () => fishMarketRoofs(),
};
