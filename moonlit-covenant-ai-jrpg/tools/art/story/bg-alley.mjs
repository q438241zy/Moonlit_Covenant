// 雾港·镜巷 (chapter 12): the old mirror-makers' lane behind the old bathhouse, at dusk (script 12 美術需求).
//   fog-harbor-mirror-alley — a narrow lane between the wooden walls of houses (bg-town's one-point alley() with a
//                             weathered harbour palette); along both walls lean dozens of discarded old mirrors of every
//                             size and frame — the glass painted only as a dull dark sheen, never a figure; a lamp at
//                             the mouth of the lane, puddles on the flagstones holding the dusk sky; at the far end the
//                             wall above the canal, one mirror leaning against it, and in the corner a stack of old
//                             mirrors turned with their backs out. No figures, no reflections of anyone.
import { Scene, W, H, f, pz, pl, persp, mix } from './lib.mjs';
import { alley } from './bg-town.mjs';

const r0 = (v) => f(v, 0);

const AL = {
  sky: [[0, '#3a3456'], [0.45, '#8a5a72'], [0.8, '#d8866a'], [1, '#f0b07a']],
  far: '#4a3a4e', farLit: '#7a5a5e', water: '#5a4a5e', wall: '#6a6064', wallTop: '#8a7e7a',
  frames: ['#6a4a2a', '#3a2a22', '#8a6a3a', '#2a2426', '#5a3a32', '#7a6a5a', '#4a3a2a'],
  gild: '#b08a4a', back: '#5a4432', backDark: '#3a2a20', backLine: '#2a1e16',
  glass: [[0, '#2e2c3a'], [0.5, '#1a1824'], [1, '#100e16']], sheen: '#c89a8a', sheenCool: '#7a7a96', crack: '#d8d0d8',
  lamp: '#ffc878', lampGlow: '#ffb860',
};

function mirrorAlley() {
  const S = new Scene('sbMirrorAlley', '雾港·镜巷·黄昏：旧浴场后面的窄巷，两侧住家木墙，墙边斜靠着几十面大小不一、被丢掉的旧镜子，镜面只有暗色的反光、照不出任何人；巷口一盏灯，石板地上的积水映着黄昏的天；巷子尽头是水道边的矮墙，墙上靠着一面镜子，墙角堆着几面背朝外的旧镜子；没有人', 7521);
  const R = S.R;
  const pr = persp({ vp: [800, 430], F: 820, eye: 1.6 });
  const HW = 2.0, Z1 = 16, P = AL;

  // ---- the dusk sky, the far side of the canal --------------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(P.sky, 'gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="440"')}"/>`);
  {
    // far houses across the canal: a low, hazy row of roofs
    let d = '';
    for (let x = 660, i = 0; x < 950; i++) {
      const w = R.range(26, 48), h = R.range(18, 40);
      d += `M${r0(x)},432V${r0(432 - h)}L${r0(x + w / 2)},${r0(432 - h - w * 0.3)}L${r0(x + w)},${r0(432 - h)}V432Z`;
      x += w + R.range(-4, 6);
    }
    S.add(`<path d="${d}" fill="${P.far}" opacity=".85"/>`);
    S.add(`<rect x="600" y="430" width="400" height="30" fill="${P.water}"/>`);
  }

  // ---- the lane: wooden house walls, eaves, flagstones (shared alley painter) -----------------------------
  S.add(alley(S, R, pr, { hw: HW, z0: 1.2, z1: Z1, hgt: 6.2, pal: { wall: '#4e4044', wallR: '#6a5048', wallFar: '#5a4650', stone: '#3e3638', timber: '#241a1a', glass: '#1e1a24', eave: '#261c20', ground: '#3a3236', cobble: '#1e1a20' } }));

  // ---- the end: the low wall above the canal ------------------------------------------------------------
  {
    const q = (pts) => pr.quad(pts);
    S.add(`<path d="${q([[-HW, 0, Z1], [-HW, 1.1, Z1], [HW, 1.1, Z1], [HW, 0, Z1]])}" fill="${P.wall}"/><path d="${q([[-HW, 1.1, Z1], [HW, 1.1, Z1], [HW, 1.1, Z1 + 0.4], [-HW, 1.1, Z1 + 0.4]])}" fill="${P.wallTop}"/>`);
    let jn = '';
    for (const y of [0.37, 0.74]) jn += pl(pr.poly([[-HW, y, Z1 - 0.01], [HW, y, Z1 - 0.01]]));
    for (let x = -HW + 0.3, k = 0; x < HW; x += 0.5, k++) for (const [y0, y1, o] of [[0, 0.37, 0], [0.37, 0.74, 0.25], [0.74, 1.1, 0]]) jn += pl(pr.poly([[x + o, y0, Z1 - 0.01], [x + o, y1, Z1 - 0.01]]));
    S.add(`<path d="${jn}" stroke="#3a3236" stroke-width="1.5" opacity=".6"/>`);
  }

  // ---- mirrors ----------------------------------------------------------------------------------------
  // a mirror leaning against a wall plane. side = -1 / 1 for the left / right walls (plane along Z), 0 for the end wall
  // (plane along X). u0..u1 is its extent along the wall, h its height; shape 'rect' | 'oval' | 'arch'; back = turned round
  const mirrors = [];
  const mirror = ({ side, u0, u1, h, shape = 'rect', frame, back = false, crack = false, base = 0 }) => {
    const lean = Math.min(0.32, h * 0.2);
    const pt = (u, v) => {
      const t = v / h;
      if (side === 0) return [u, base + v, Z1 - 0.04 - lean * (1 - t)];
      return [side * (HW - 0.05 - lean * (1 - t)), base + v, u];
    };
    const outline = (inset) => {
      const a = u0 + inset, b = u1 - inset, lo = inset, hi = h - inset;
      const pts = [];
      if (shape === 'oval') { for (let k = 0; k < 28; k++) { const th = k / 28 * Math.PI * 2; pts.push(pt((a + b) / 2 + Math.cos(th) * (b - a) / 2, (lo + hi) / 2 + Math.sin(th) * (hi - lo) / 2)); } }
      else if (shape === 'arch') {
        const r = (b - a) / 2, yc = hi - r;
        pts.push(pt(a, lo));
        for (let k = 0; k <= 12; k++) { const th = Math.PI - k / 12 * Math.PI; pts.push(pt((a + b) / 2 + Math.cos(th) * r, yc + Math.sin(th) * r)); }
        pts.push(pt(b, lo));
      } else pts.push(pt(a, lo), pt(a, hi), pt(b, hi), pt(b, lo));
      return pr.poly(pts);
    };
    const fw = Math.min(0.09, (u1 - u0) * 0.1);
    const ctr = pt((u0 + u1) / 2, h / 2);
    const sh = R.range(0.3, 0.65), sw = R.range(0.06, 0.2), lit = R() < 0.5; // per-mirror sheen
    mirrors.push({ d: side === 0 ? ctr[2] : (u0 + u1) / 2, draw: () => {
      let s = `<path d="${pz(outline(0))}" fill="${back ? P.back : frame}"/>`;
      if (back) {
        // the wooden backing: boards and a batten, a hanging cord
        s += `<path d="${pz(outline(fw * 0.6))}" fill="${P.backDark}"/>`;
        let bd = '';
        for (let k = 1; k < 4; k++) { const u = u0 + (u1 - u0) * k / 4; bd += pl([pr(...pt(u, 0.05)), pr(...pt(u, h - 0.05))]); }
        bd += pl([pr(...pt(u0 + 0.05, h * 0.5)), pr(...pt(u1 - 0.05, h * 0.5))]);
        s += `<path d="${bd}" stroke="${P.backLine}" stroke-width="${f(Math.max(1, 18 / ctr[2]))}"/>`;
        s += `<path d="${pl(outline(0).slice(0, 2))}" stroke="#8a6a4a" stroke-width="${f(Math.max(1, 20 / ctr[2]))}" opacity=".8"/>`;
        return s;
      }
      // the glass: dark, a dull sheen of the dusk across it, nothing in it
      const g = outline(fw);
      s += `<path d="${pz(g)}" fill="${S.lin(P.glass, 'x1="0" y1="0" x2=".5" y2="1"')}"/>`;
      const band = (t0, t1, c, op) => {
        const p0 = pr(...pt(u0 + (u1 - u0) * t0, h - fw)), p1 = pr(...pt(u0 + (u1 - u0) * t1, h - fw));
        const p2 = pr(...pt(u0 + (u1 - u0) * (t1 - 0.3), fw)), p3 = pr(...pt(u0 + (u1 - u0) * (t0 - 0.3), fw));
        return `<path d="${pz([p0, p1, p2, p3])}" fill="${c}" opacity="${op}"/>`;
      };
      const clip = S.clip(pz(g));
      s += `<g clip-path="${clip}">${band(sh, sh + sw, P.sheen, 0.12 + sw * 0.4)}${band(sh + sw + 0.1, sh + sw + 0.15, P.sheenCool, 0.14)}</g>`;
      if (crack) {
        const c0 = pt(u0 + (u1 - u0) * 0.35, h * 0.6);
        let cr = '';
        for (const [du, dv] of [[0.4, 0.3], [-0.3, 0.35], [0.2, -0.5], [-0.35, -0.3]]) cr += pl([pr(...c0), pr(...pt(c0[side === 0 ? 0 : 2] + du * (u1 - u0) * 0.6, h * 0.6 + dv * h * 0.5))]);
        s += `<g clip-path="${clip}"><path d="${cr}" stroke="${P.crack}" stroke-width="1.2" opacity=".55"/></g>`;
      }
      // the frame's lit edge
      if (frame === P.gild || lit) s += `<path d="${pl(outline(0).slice(0, Math.ceil(outline(0).length / 2)))}" fill="none" stroke="${mix(frame, '#ffe0b0', 0.4)}" stroke-width="${f(Math.max(1, 14 / ctr[2]))}" opacity=".6"/>`;
      return s;
    } });
  };

  // dozens along both walls, in loose leaning groups; a few turned to the wall
  for (const side of [-1, 1]) {
    let z = side < 0 ? 2.6 : 3.2;
    while (z < Z1 - 0.6) {
      const n = R() < 0.4 ? 2 : R() < 0.5 ? 3 : 1;
      for (let k = 0; k < n; k++) {
        const w = R.range(0.35, 1.0), h = R.range(0.5, 1.7);
        const shape = R() < 0.18 ? 'oval' : R() < 0.22 ? 'arch' : 'rect';
        const frame = R() < 0.2 ? P.gild : P.frames[Math.floor(R() * P.frames.length)];
        const u0 = z + k * w * 0.35;
        mirror({ side, u0, u1: u0 + w, h: h * (1 - k * 0.12), shape, frame, back: R() < 0.16, crack: R() < 0.22 });
      }
      z += R.range(0.7, 1.5);
    }
  }
  // the end wall: one mirror leaning against it, and a stack turned with their backs out in the left corner
  mirror({ side: 0, u0: 0.05, u1: 0.95, h: 1.6, shape: 'arch', frame: P.gild, crack: false });
  for (const [a, b, h, base] of [[-1.98, -0.98, 1.5, 0], [-1.9, -1.0, 1.25, 0], [-1.86, -0.8, 1.0, 0], [-1.7, -0.75, 0.7, 0]]) mirror({ side: 0, u0: a, u1: b, h, back: true, base });
  mirrors.sort((u, v) => v.d - u.d);
  S.add(mirrors.map((m) => m.draw()).join(''));

  // ---- puddles holding the dusk, and the lamp at the mouth of the lane -------------------------------------
  {
    let s = '';
    for (const [x, z, w] of [[-0.4, 4.2, 1.5], [0.7, 6.5, 1.1], [-0.6, 9, 0.9], [0.3, 12, 0.8], [1.0, 3.2, 0.7]]) {
      const p = pr(x, 0, z), k = 820 / z;
      s += `<ellipse cx="${r0(p[0])}" cy="${r0(p[1])}" rx="${r0(w * k / 2)}" ry="${r0(w * k * 0.09)}" fill="${S.lin([[0, '#d8866a'], [1, '#5a4060']], 'x1="0" y1="0" x2="0" y2="1"')}" opacity=".6"/>`;
      s += `<ellipse cx="${r0(p[0] - w * k * 0.12)}" cy="${r0(p[1] - 1)}" rx="${r0(w * k * 0.18)}" ry="${f(Math.max(1, w * k * 0.015))}" fill="#ffe0c0" opacity=".45"/>`;
    }
    S.add(s);
    // lamp on an iron bracket from the right-hand wall near us
    const b0 = pr(HW, 2.7, 2.4), b1 = pr(HW - 0.55, 2.7, 2.4), lp = pr(HW - 0.55, 2.35, 2.4), k = 820 / 2.4;
    S.add(`<circle cx="${r0(lp[0])}" cy="${r0(lp[1])}" r="${r0(k * 0.9)}" fill="${S.rad([[0, P.lampGlow, 0.35], [1, P.lampGlow, 0]])}"/>`);
    S.add(`<path d="M${r0(b0[0])},${r0(b0[1])}L${r0(b1[0])},${r0(b1[1])}M${r0(b0[0])},${r0(b0[1] + k * 0.25)}L${r0(b1[0] + k * 0.15)},${r0(b1[1])}" stroke="#16100e" stroke-width="${r0(k * 0.04)}" fill="none"/>`);
    const lw = k * 0.13, lh = k * 0.24;
    S.add(`<path d="M${r0(lp[0] - lw)},${r0(lp[1] - lh / 2)}h${r0(lw * 2)}l${r0(-lw * 0.2)},${r0(lh)}h${r0(-lw * 1.6)}z" fill="${P.lamp}"/><path d="M${r0(lp[0] - lw * 1.3)},${r0(lp[1] - lh / 2)}l${r0(lw * 1.3)},${r0(-lh * 0.4)}l${r0(lw * 1.3)},${r0(lh * 0.4)}z" fill="#16100e"/><path d="M${r0(lp[0])},${r0(lp[1] - lh * 0.9)}V${r0(b1[1])}" stroke="#16100e" stroke-width="3"/><path d="M${r0(lp[0] - lw * 0.9)},${r0(lp[1] + lh / 2)}h${r0(lw * 1.8)}" stroke="#16100e" stroke-width="${r0(k * 0.025)}"/>`);
    // warm pool of light on the stones under it
    const g = pr(HW - 0.8, 0, 3.0);
    S.add(`<ellipse cx="${r0(g[0])}" cy="${r0(g[1])}" rx="320" ry="70" fill="${P.lampGlow}" opacity=".14" filter="${S.blur(3)}"/>`);
  }

  // ---- grade: dusk going cold in the lane, darker corners --------------------------------------------------
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0.4, '#140e18', 0], [1, '#140e18', 0.7]], 'cx="0.5" cy="0.45" r="0.75"')}"/>`);
  S.add(`<rect y="600" width="${W}" height="300" fill="${S.lin([[0, '#140e18', 0], [1, '#140e18', 0.55]])}"/>`);
  return S.out();
}

export const alleyBgs = {
  'fog-harbor-mirror-alley': () => mirrorAlley(),
};
