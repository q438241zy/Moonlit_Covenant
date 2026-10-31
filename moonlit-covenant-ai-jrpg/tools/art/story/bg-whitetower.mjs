// 白塔圣都 (chapter 16; script 16 美術需求):
//   white-tower-morning-gate      — 晨门·上午 (16-01, 16-02): the high white-stone gate seen square on; through the arch,
//                                   the city street, the pilgrims' queue as small silhouettes, and the lower half of the
//                                   white tower in the middle of the city, whose top disappears into the cloud above the
//                                   parapet. Under the gate, the long wooden table where every weapon is left — a red
//                                   tower shield with a short sword laid on it, a staff with its head bound in cloth, an
//                                   old sword, a small round machine, plus the pilgrims' sticks and a spear; on the
//                                   inner wall to the right a wooden notice board with one notice under a seven-pointed
//                                   star. White, grey and pale gold, flat light. No faces.
//   white-tower-morning-gate-dusk — the same at dusk (16-11): fewer things on the table, the light slanting in through the
//                                   arch, a man with a hat sitting on the step (silhouette, no face).
//   white-tower-registry-hall     — 白塔·册厅 (16-03, 16-04): a very long stone hall in the tower's base, shelves of
//                                   identically bound registers on both sides running to the vanishing point, white
//                                   columns and dark high windows; in the middle a long table with an open register
//                                   (a header of four unreadable columns), three seals — the upright seven-pointed star,
//                                   an arch pressing on a wave, a dish of seven-star sealing wax — and a letter box; a
//                                   tall reading lectern. Cold white and old-paper yellow. No figures.
//   white-tower-registry-hall-court — the same hall with the court present (16-05 … 16-10): two rows of Morningstar
//                                   guards (white armour, halberds, silhouettes) along the shelves, a plain chair by a
//                                   shelf with no canopy (the emperor's place, empty), white cloth on the lectern, a
//                                   silver knight's silhouette in the door.
//   white-tower-registry-hall-night — the same hall at night (16-12): only one lamp on the long table, a sheet of paper and
//                                   the arch-and-wave seal under it, and a hand in silver armour reaching into the light
//                                   from the edge of the frame.
// No text anywhere: the notice, the header and the order are strokes, never letters.
import { Scene, W, H, f, pz, pl, persp, mix, rng, star7, person } from './lib.mjs';

const f1 = (v) => f(v, 1);
const pz1 = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L') + 'Z';
const pl1 = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L');
const circ = (cx, cy, r) => `M${f1(cx - r)},${f1(cy)}a${f1(r)},${f1(r)} 0 1 0 ${f1(r * 2)},0a${f1(r)},${f1(r)} 0 1 0 ${f1(-r * 2)},0Z`;

// the arch-and-wave seal of the registry office (掌簿处): an arch over a wave, as path data centred at cx,cy
const archWave = (cx, cy, r) => `M${f1(cx - r)},${f1(cy + r * 0.2)}V${f1(cy - r * 0.15)}A${f1(r)},${f1(r)} 0 0 1 ${f1(cx + r)},${f1(cy - r * 0.15)}V${f1(cy + r * 0.2)}`
  + `M${f1(cx - r)},${f1(cy + r * 0.55)}q${f1(r * 0.25)},${f1(-r * 0.3)} ${f1(r * 0.5)},0t${f1(r * 0.5)},0t${f1(r * 0.5)},0t${f1(r * 0.5)},0`;

// ---------------------------------------------------------------------------------------------
// 晨门
// ---------------------------------------------------------------------------------------------
const GATE = {
  day: {
    sky: [[0, '#dcdcd6'], [0.6, '#ebe6da'], [1, '#f2ecdc']], cloud: '#f4f2ec', cloudShade: '#d2d0ca',
    stone: { lit: '#e6e2d8', mid: '#d2cec4', shade: '#aeaaa2', deep: '#8a877f', joint: '#b8b4aa' },
    city: '#cfcabe', cityFar: '#dedad0', tower: '#f2f0ea', towerShade: '#d4d1c8', ground: '#cdc6b4', groundFar: '#ddd8ca',
    wood: { lit: '#9a8466', mid: '#7a6650', shade: '#55473a', deep: '#3a3028' }, pilgrim: '#8e8a84', gold: '#c8a85a',
    paper: '#efe8d4', light: null,
  },
  dusk: {
    sky: [[0, '#8a7c8a'], [0.55, '#d09a72'], [1, '#e8b880']], cloud: '#e8b48a', cloudShade: '#9a7e86',
    stone: { lit: '#e2c0a0', mid: '#c0a08c', shade: '#8a7472', deep: '#5e5058', joint: '#a08880' },
    city: '#a88a80', cityFar: '#c49e86', tower: '#f0cca4', towerShade: '#a8888a', ground: '#a88e7c', groundFar: '#c8a488',
    wood: { lit: '#8a6a52', mid: '#6a5244', shade: '#463830', deep: '#2e2622' }, pilgrim: '#6e5c5e', gold: '#e0b060',
    paper: '#e8cca8', light: '#ffc888',
  },
};
const ARCH = { x0: 640, x1: 960, spring: 480, ground: 760 };
const AR = (ARCH.x1 - ARCH.x0) / 2, ACX = (ARCH.x0 + ARCH.x1) / 2;

function gate(dusk) {
  const C = dusk ? GATE.dusk : GATE.day;
  const S = new Scene(dusk ? 'sbWtGateDusk' : 'sbWtGate', dusk
    ? '白塔圣都·晨门·黄昏：同一座白石城门，光从门洞斜斜照进来；长桌上的兵器少了，只剩红色塔盾与盾上的短剑、包着布的杖、旧剑和圆形的小机械；台阶上坐着一个戴帽子的男人的剪影，看不见脸；门洞里远处的白塔染成橙色，塔顶没入云里'
    : '白塔圣都·晨门·上午：高大的白石城门正面，门洞里看得见城里的街道、排队的朝圣者小小的剪影和城中央白塔的下半段，塔顶从城墙上方没入云里；门洞底下一张长木桌，桌上整齐摆着入塔者留下的兵器——赤红塔盾与盾上的短剑、杖头包着布的杖、一把旧剑、一个圆形的小机械，还有朝圣者的手杖与一支长矛；门内右侧墙上一面木框通报牌，贴着一张顶上画着七角星的告示；白、灰、淡金，光很平，不画人脸', dusk ? 16211 : 16201);
  const R = rng(dusk ? 16212 : 16202);
  const { stone, wood } = C;
  const top = 214; // the parapet line

  // sky and the cloud the tower's top disappears into
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin(C.sky)}"/>`);
  // the tower: a tapering white shaft centred on the arch, behind the wall; its lower half shows through the arch
  const tw = (y) => 40 + y * 0.012; // half-width at screen y (it is far, so almost straight)
  const towerBase = 624;
  S.add(`<path d="${pz1([[ACX - tw(-40), -40], [ACX + tw(-40), -40], [ACX + tw(towerBase), towerBase], [ACX - tw(towerBase), towerBase]])}" fill="${S.lin([[0, C.towerShade], [0.32, C.tower], [0.7, C.tower], [1, C.towerShade]], 'x1="0" y1="0" x2="1" y2="0"')}"/>`);
  {
    // band courses and tall slit windows on the shaft
    let bands = '', slits = '';
    for (let y = 40; y < towerBase; y += 74) bands += `M${f1(ACX - tw(y))},${f1(y)}H${f1(ACX + tw(y))}`;
    for (let y = 70; y < towerBase - 40; y += 148) slits += `M${f1(ACX - 6)},${f1(y)}h12v34h-12z`;
    S.add(`<path d="${bands}" stroke="${C.towerShade}" stroke-width="3"/><path d="${slits}" fill="${stone.deep}" opacity=".55"/>`);
  }
  // the cloud bank swallowing the tower's top
  {
    let d = '';
    for (let x = -60; x < W + 80; x += R.range(80, 130)) { const r = R.range(40, 70); d += circ(x, R.range(-24, 18), r); }
    S.add(`<path d="${d}" fill="${C.cloudShade}" opacity=".7" transform="translate(0 18)"/><path d="${d}" fill="${C.cloud}"/>`);
    S.add(`<rect x="0" y="0" width="${W}" height="24" fill="${C.cloud}"/>`);
  }

  // through the arch: the city — ground, two rows of low pale houses, the street and the pilgrims' queue
  {
    const gy = towerBase;
    S.add(`<rect x="${ARCH.x0 - 40}" y="${gy}" width="${AR * 2 + 80}" height="${ARCH.ground - gy}" fill="${S.lin([[0, C.groundFar], [1, C.ground]])}"/>`);
    for (const [y0, h, col, seed] of [[gy, 70, C.cityFar, 16203], [gy + 6, 104, C.city, 16204]]) {
      const Rc = rng(seed);
      let d = '';
      for (let x = ARCH.x0 - 40; x < ARCH.x1 + 40;) {
        const w = Rc.range(36, 70), hh = Rc.range(h * 0.5, h);
        if (Math.abs(x + w / 2 - ACX) > 70) d += `M${f1(x)},${f1(y0 + 6)}V${f1(y0 - hh + 18)}l${f1(w / 2)},${f1(-18)}l${f1(w / 2)},18V${f1(y0 + 6)}Z`;
        x += w + Rc.range(2, 10);
      }
      S.add(`<path d="${d}" fill="${col}"/>`);
    }
    // the street running to the tower's foot
    S.add(`<path d="${pz1([[ACX - 30, gy + 4], [ACX + 30, gy + 4], [ACX + 150, ARCH.ground], [ACX - 150, ARCH.ground]])}" fill="${mix(C.ground, C.paper, 0.35)}"/>`);
    // pilgrims queueing toward the tower: small silhouettes shrinking with distance
    let q = '';
    for (let k = 0; k < 16; k++) {
      const t = k / 15, y = ARCH.ground - 18 - (ARCH.ground - gy - 30) * Math.pow(t, 0.7), s = 2.2 - t * 1.7;
      q += person(ACX - 40 + t * 28 + R.range(-6, 6), y, s, C.pilgrim, R);
    }
    S.add(`<path d="${q}" fill="${mix(C.pilgrim, '#000000', 0.2)}" opacity=".8"/>`);
  }

  // the gate wall with the arch cut out (even-odd), its stone courses and the arch's voussoirs
  const archOpen = `M${ARCH.x0},${ARCH.ground}V${ARCH.spring}A${AR},${AR} 0 0 1 ${ARCH.x1},${ARCH.spring}V${ARCH.ground}Z`;
  const wall = `M0,${top}H${W}V${ARCH.ground}H0Z${archOpen}`;
  S.add(`<path d="${wall}" fill-rule="evenodd" fill="${S.lin([[0, stone.lit], [0.7, stone.mid], [1, stone.shade]])}"/>`);
  {
    // the parapet's crenels
    let cr = '';
    for (let x = 0; x < W; x += 80) cr += `M${x},${top}v-34h46v34z`;
    S.add(`<path d="${cr}" fill="${stone.lit}"/><path d="M0,${top}H${W}" stroke="${stone.shade}" stroke-width="4"/>`);
    // ashlar courses, offset every other row, skipping the arch
    let j = '';
    for (let y = top + 44, row = 0; y < ARCH.ground; y += 44, row++) {
      const inArch = (x) => x > ARCH.x0 - 2 && x < ARCH.x1 + 2 && (y > ARCH.spring || Math.hypot(x - ACX, y - ARCH.spring) < AR + 2);
      let x0 = null;
      for (let x = 0; x <= W; x += 4) { const ok = !inArch(x); if (ok && x0 === null) x0 = x; if ((!ok || x === W) && x0 !== null) { j += `M${x0},${y}H${x}`; x0 = null; } }
      for (let x = (row % 2) * 60; x < W; x += 120) { if (!inArch(x) && !inArch(x + 1) && !(x > ARCH.x0 - 2 && x < ARCH.x1 + 2 && y - 44 > ARCH.spring - AR)) j += `M${x},${y - 44}V${y}`; }
    }
    S.add(`<path d="${j}" stroke="${stone.joint}" stroke-width="2" opacity=".8"/>`);
    // voussoirs around the arch and the soffit's shadowed depth inside it
    let v = '';
    for (let k = 0; k <= 12; k++) { const a = Math.PI + k * Math.PI / 12, c = Math.cos(a), s = Math.sin(a); v += `M${f1(ACX + c * AR)},${f1(ARCH.spring + s * AR)}L${f1(ACX + c * (AR + 46))},${f1(ARCH.spring + s * (AR + 46))}`; }
    S.add(`<path d="M${ARCH.x0 - 46},${ARCH.spring}A${AR + 46},${AR + 46} 0 0 1 ${ARCH.x1 + 46},${ARCH.spring}" fill="none" stroke="${stone.lit}" stroke-width="3"/><path d="${v}" stroke="${stone.joint}" stroke-width="2.4"/>`);
    S.add(`<path d="M${ARCH.x0},${ARCH.ground}V${ARCH.spring}A${AR},${AR} 0 0 1 ${ARCH.x1},${ARCH.spring}V${ARCH.ground}H${ARCH.x1 - 26}V${ARCH.spring + 8}A${AR - 26},${AR - 18} 0 0 0 ${ARCH.x0 + 26},${ARCH.spring + 8}V${ARCH.ground}Z" fill="${stone.shade}" opacity=".85"/>`);
    // a seven-pointed star carved on the keystone
    S.add(`<path d="${star7(ACX, ARCH.spring - AR - 22, 16)}" fill="${C.gold}" opacity=".85"/>`);
  }
  // pavement and the low step in front of the gate
  S.add(`<rect x="0" y="${ARCH.ground}" width="${W}" height="${H - ARCH.ground}" fill="${S.lin([[0, stone.mid], [1, stone.shade]])}"/>`);
  {
    let pv = '';
    for (let y = ARCH.ground + 26; y < H; y += 30 + (y - ARCH.ground) * 0.25) pv += `M0,${f1(y)}H${W}`;
    for (let x = -800; x < W + 800; x += 110) pv += `M${f1(800 + (x - 800) * 0.7)},${ARCH.ground}L${f1(800 + (x - 800) * 1.6)},${H}`;
    S.add(`<path d="${pv}" stroke="${stone.joint}" stroke-width="1.6" opacity=".7"/><rect x="0" y="${ARCH.ground}" width="${W}" height="14" fill="${stone.lit}" opacity=".8"/>`);
  }
  if (C.light) {
    // the low sun slanting in through the arch onto the pavement
    S.add(`<path d="${pz1([[ARCH.x0 + 10, ARCH.spring - 60], [ARCH.x1 - 30, ARCH.spring - 160], [ARCH.x1 + 380, H], [ARCH.x0 + 140, H]])}" fill="${S.lin([[0, C.light, 0.35], [1, C.light, 0.05]])}"/>`);
  }

  // the notice board on the inner wall, right of the arch
  {
    const x = 1150, y = 440, w = 230, h = 200;
    S.add(`<rect x="${x - 12}" y="${y - 12}" width="${w + 24}" height="${h + 24}" fill="${wood.shade}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${wood.mid}"/>`);
    S.add(`<path d="M${x - 12},${y - 12}h${w + 24}v8h-${w + 24}z" fill="${wood.lit}"/><path d="M${x + 20},${y + h + 12}v${ARCH.ground - y - h - 12}M${x + w - 20},${y + h + 12}v${ARCH.ground - y - h - 12}" stroke="${wood.deep}" stroke-width="10"/>`);
    // the one notice: a sheet with a seven-pointed star at its head and lines that are not letters
    const nx = x + 40, ny = y + 22, nw = 150, nh = 158;
    let lines = '';
    for (let k = 0; k < 7; k++) lines += `M${nx + 18},${ny + 62 + k * 13}h${f1(nw - 36 - (k % 3) * 14)}`;
    S.add(`<rect x="${nx}" y="${ny}" width="${nw}" height="${nh}" fill="${C.paper}"/><path d="${star7(nx + nw / 2, ny + 30, 15)}" fill="${C.gold}"/><path d="${lines}" stroke="${wood.shade}" stroke-width="3" opacity=".55"/>`);
    S.add(`<path d="${circ(nx + 8, ny + 8, 3) + circ(nx + nw - 8, ny + 8, 3)}" fill="${wood.deep}"/>`);
    // an older, half-torn notice beside it
    S.add(`<path d="M${x + w - 34},${y + 30}h26v70l-8,-6l-6,10l-12,-8z" fill="${mix(C.paper, wood.mid, 0.4)}"/>`);
  }

  // the long table under the gate, foreground left, with everything left on it
  {
    const tx0 = 40, tx1 = 640, ty = 730, depth = 74, th = 22;
    // legs, top face (seen slightly from above), front edge
    S.add(`<path d="M${tx0 + 30},${ty + th}v${H - ty}M${tx1 - 30},${ty + th}v${H - ty}M${tx0 + 60},${ty - depth}v${depth + 60}M${tx1 - 60},${ty - depth}v${depth + 60}" stroke="${wood.deep}" stroke-width="16"/>`);
    S.add(`<path d="${pz1([[tx0 + 20, ty - depth], [tx1 - 20, ty - depth], [tx1, ty], [tx0, ty]])}" fill="${S.lin([[0, wood.lit], [1, wood.mid]])}"/><rect x="${tx0}" y="${ty}" width="${tx1 - tx0}" height="${th}" fill="${wood.shade}"/>`);
    let grain = '';
    for (let k = 1; k < 5; k++) grain += `M${tx0 + 20 - k * 4},${ty - depth + k * 9}H${tx1 - 20 + k * 4}`;
    S.add(`<path d="${grain}" stroke="${wood.shade}" stroke-width="1.4" opacity=".5"/>`);
    // the red tower shield lying flat, the short sword laid on it
    const sx = 230, sy = ty - 30;
    S.add(`<g transform="matrix(1.4 0 0 1.4 ${-0.4 * sx} ${-0.4 * sy})">`);
    S.add(`<path d="M${sx - 118},${sy - 14}Q${sx - 120},${sy - 26} ${sx - 96},${sy - 26}H${sx + 96}Q${sx + 120},${sy - 26} ${sx + 118},${sy - 14}L${sx + 92},${sy + 16}Q${sx},${sy + 30} ${sx - 92},${sy + 16}Z" fill="#7a2228"/>`);
    S.add(`<path d="M${sx - 104},${sy - 18}H${sx + 104}L${sx + 84},${sy + 8}Q${sx},${sy + 20} ${sx - 84},${sy + 8}Z" fill="#a8323a"/><path d="M${sx - 104},${sy - 18}H${sx + 104}" stroke="#d8a060" stroke-width="3"/>`);
    S.add(`<path d="M${sx - 70},${sy - 4}L${sx + 50},${sy - 12}" stroke="#c8ccd2" stroke-width="7" stroke-linecap="round"/><path d="M${sx + 50},${sy - 12}l26,-2M${sx + 52},${sy - 22}l2,20" stroke="${wood.deep}" stroke-width="6" stroke-linecap="round"/>`);
    S.add('</g>');
    // the staff, its head bound in cloth
    S.add(`<path d="M${tx0 + 40},${ty - 8}L${tx1 - 260},${ty - 40}" stroke="#2a2430" stroke-width="9" stroke-linecap="round"/><path d="M${tx1 - 300},${ty - 50}q20,-10 44,0q8,10 -4,20q-24,8 -42,-2z" fill="${mix(C.paper, wood.mid, 0.3)}"/><path d="M${tx1 - 292},${ty - 44}l30,6M${tx1 - 290},${ty - 34}l28,2" stroke="${wood.shade}" stroke-width="1.6" opacity=".7"/>`);
    // the old sword
    S.add(`<path d="M${tx0 + 260},${ty - 30}L${tx1 - 120},${ty - 40}" stroke="#b8bcc2" stroke-width="6" stroke-linecap="round"/><path d="M${tx0 + 250},${ty - 44}v28M${tx0 + 200},${ty - 30}h50" stroke="${wood.deep}" stroke-width="7" stroke-linecap="round"/>`);
    // the small round machine (零号): a brass ball with a little lens and an antenna
    const zx = tx1 - 110, zy = ty - 34;
    S.add(`<g transform="matrix(1.5 0 0 1.5 ${-0.5 * zx} ${-0.5 * zy})">`);
    S.add(`<path d="${circ(zx, zy, 20)}" fill="#a88a4a"/><path d="${circ(zx - 6, zy - 6, 8)}" fill="#e8d498" opacity=".6"/><path d="${circ(zx + 6, zy + 2, 6)}" fill="#2a3a4a"/><path d="M${zx},${zy - 20}v-16" stroke="#6a5a3a" stroke-width="3"/><path d="${circ(zx, zy - 38, 3.5)}" fill="#e05a4a"/>`);
    S.add('</g>');
    if (!dusk) {
      // the pilgrims' sticks and a guard's spear leaning across the far end
      S.add(`<path d="M${tx1 - 60},${ty - 36}L${tx1 + 40},${ty - 260}M${tx1 - 34},${ty - 34}L${tx1 + 60},${ty - 230}" stroke="${wood.shade}" stroke-width="7" stroke-linecap="round"/><path d="M${tx1 - 10},${ty - 30}L${tx1 + 110},${ty - 330}" stroke="${wood.mid}" stroke-width="6" stroke-linecap="round"/><path d="M${tx1 + 106},${ty - 322}l14,-40l4,44z" fill="#b8bcc2"/>`);
      // the clerk's open book at the near end
      S.add(`<path d="${pz1([[tx0 + 60, ty - 26], [tx0 + 140, ty - 30], [tx0 + 150, ty - 8], [tx0 + 64, ty - 4]])}" fill="${C.paper}"/><path d="M${tx0 + 102},${ty - 28}L${tx0 + 106},${ty - 6}" stroke="${wood.shade}" stroke-width="1.6"/>`);
    }
  }

  if (dusk) {
    // a man with a hat sitting on the step right of the arch, a silhouette against the warm stone
    const mx = 1120, my = ARCH.ground + 8;
    S.add(`<path d="M${mx - 34},${my}Q${mx - 40},${my - 60} ${mx - 20},${my - 92}Q${mx},${my - 104} ${mx + 18},${my - 92}Q${mx + 30},${my - 60} ${mx + 40},${my - 30}L${mx + 70},${my - 24}L${mx + 74},${my + 26}L${mx + 56},${my + 28}L${mx + 50},${my}Z" fill="#3a2e30"/>`);
    S.add(`<path d="${circ(mx, my - 112, 16)}" fill="#3a2e30"/><path d="M${mx - 30},${my - 120}h60v-6h-12v-20h-36v20h-12z" fill="#2a2024"/>`);
  }
  return S.out();
}

// ---------------------------------------------------------------------------------------------
// 册厅
// ---------------------------------------------------------------------------------------------
const VP = [800, 400], F = 860, EYE = 1.7;
const pr = persp({ vp: VP, F, eye: EYE });
const HW = 5.2, SHELF_X = 4.6, SHELF_H = 5.4, WALL_H = 9.6, VAULT = 3.2, Z0 = 2.2, ZE = 86;
const BOOKS = ['#6a5848', '#7a6650', '#5a4c40', '#8a7458', '#4e443a', '#76604a'];

function hall(mode) {
  const night = mode === 'night', court = mode === 'court';
  const ids = { plain: ['sbWtHall', 16301], court: ['sbWtCourt', 16311], night: ['sbWtNight', 16321] }[mode];
  const label = {
    plain: '白塔·册厅：塔基里一间极长的石厅，两侧木册架一排一排排到消失点，架上是同一种装订的厚册；白石柱与暗着的高窗；正中一张长桌，桌上一本摊开的册（表头四栏看不清的字）、三枚章——正着的七角星印、一道拱压着一道浪的印、一盘七角晨星的封蜡——和一个信匣；一座高脚读册台；冷白与旧纸的黄，不画人',
    court: '白塔·册厅·御前列席：同一间长厅，两排白甲长戟的晨星卫沿册架站开（剪影）；册架旁一张没有华盖的椅子空着；读册台上铺了白布；门口一个银甲骑士的剪影；长桌上摊开的册与三枚章',
    night: '白塔·册厅·入夜：同一间长厅暗下来，只剩长桌上一盏灯；灯下一张纸和那枚拱压着浪的印；画面边缘一只戴银甲的手伸进光里；册架隐在黑暗中',
  }[mode];
  const S = new Scene(ids[0], label, ids[1]);
  const R = rng(ids[1] + 1);
  const P = (x, y, z) => pr(x, y, z);
  const C = {
    wall: '#e4e0d6', wallShade: '#b8b4aa', ceil: '#cfcac0', ceilDeep: '#a8a49a', floor: '#d8d2c4', floorFar: '#e6e2d8', joint: '#b2ac9e',
    col: '#f2f0ea', colShade: '#c4c0b6', shelf: '#6e5a46', shelfLit: '#8e765c', shelfDeep: '#3e3228', win: '#3a4250', winFrame: '#c8c4ba',
    paper: '#efe6cc', paperShade: '#d6caa8', ink: '#5a4a3a', wood: '#7a5e44', woodLit: '#9a7a5a', woodDeep: '#4a3828',
  };
  // fog of distance: far things fade into the pale end of the hall
  const fade = (c, z) => mix(c, C.floorFar, Math.min(0.8, Math.max(0, (z - 8) / 90)));

  // ceiling vault and the end wall
  const vaultPt = (t, z) => { const a = Math.PI * t; return P(-HW * Math.cos(a), WALL_H + VAULT * Math.sin(a), z); };
  S.add(`<rect width="${W}" height="${H}" fill="${C.ceilDeep}"/>`);
  {
    const far = Array.from({ length: 13 }, (_, k) => vaultPt(k / 12, ZE));
    const near = Array.from({ length: 13 }, (_, k) => vaultPt(k / 12, Z0)).reverse();
    S.add(`<path d="${pz1([...far, ...near])}" fill="${S.lin([[0, C.ceilDeep], [0.6, C.ceil], [1, C.ceil]], `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${VP[1]}"`)}"/>`);
    // the end wall with a tall pale door
    const ew = [P(-HW, 0, ZE), P(HW, 0, ZE), ...Array.from({ length: 13 }, (_, k) => vaultPt(1 - k / 12, ZE))];
    S.add(`<path d="${pz1(ew)}" fill="${C.floorFar}"/>`);
    const d0 = P(-0.9, 0, ZE), d1 = P(0.9, 3.4, ZE);
    S.add(`<path d="${pz1([[d0[0], d0[1]], [d1[0], d0[1]], [d1[0], d1[1]], [d0[0], d1[1]]])}" fill="${night ? '#2a2e3a' : '#fbf8f0'}"/>`);
  }
  // side walls above the shelves with the dark high windows
  for (const side of [-1, 1]) {
    S.add(`<path d="${pz1([P(side * HW, SHELF_H, Z0), P(side * HW, SHELF_H, ZE), P(side * HW, WALL_H, ZE), P(side * HW, WALL_H, Z0)])}" fill="${S.lin([[0, C.wallShade], [1, C.wall]], `gradientUnits="userSpaceOnUse" x1="${side < 0 ? 0 : W}" y1="0" x2="${VP[0]}" y2="0"`)}"/>`);
    let win = '', frame = '';
    for (let z = 5; z < ZE - 6; z += 8) {
      const q = [P(side * HW, SHELF_H + 1.2, z + 2.2), P(side * HW, SHELF_H + 1.2, z + 5.2), P(side * HW, WALL_H - 0.6, z + 5.2), P(side * HW, WALL_H - 0.6, z + 2.2)];
      win += pz1(q);
      const m0 = P(side * HW, SHELF_H + 1.2, z + 3.7), m1 = P(side * HW, WALL_H - 0.6, z + 3.7);
      frame += pz1(q) + pl1([m0, m1]);
    }
    S.add(`<path d="${win}" fill="${C.win}"/><path d="${frame}" fill="none" stroke="${C.winFrame}" stroke-width="3"/>`);
  }
  // floor with its converging joints
  {
    S.add(`<path d="${pz1([P(-HW, 0, Z0), P(-HW, 0, ZE), P(HW, 0, ZE), P(HW, 0, Z0)])}" fill="${S.lin([[0, C.floorFar], [1, C.floor]], `gradientUnits="userSpaceOnUse" x1="0" y1="${VP[1]}" x2="0" y2="${H}"`)}"/>`);
    let j = '';
    for (let x = -HW; x <= HW + 0.01; x += 1.3) j += pl1([P(x, 0, Z0), P(x, 0, ZE)]);
    for (let z = Z0; z < ZE; z *= 1.16) j += pl1([P(-HW, 0, z), P(HW, 0, z)]);
    S.add(`<path d="${j}" stroke="${C.joint}" stroke-width="1.4" opacity=".7"/>`);
    // a long pale runner down the middle
    S.add(`<path d="${pz1([P(-0.8, 0.002, Z0), P(-0.8, 0.002, ZE), P(0.8, 0.002, ZE), P(0.8, 0.002, Z0)])}" fill="${mix(C.floor, '#ffffff', 0.35)}" opacity=".7"/>`);
  }
  // the shelves on both sides: bays of identical registers running to the vanishing point
  for (const side of [-1, 1]) {
    const x = side * SHELF_X;
    let frame = '', boards = '', books = BOOKS.map(() => '');
    S.add(`<path d="${pz1([P(x, 0, Z0), P(x, 0, ZE), P(x, SHELF_H, ZE), P(x, SHELF_H, Z0)])}" fill="${C.shelfDeep}"/>`);
    for (let z = Z0; z < ZE; z += 2.4) {
      const z1 = Math.min(ZE, z + 2.4);
      frame += pl1([P(x, 0, z), P(x, SHELF_H, z)]);
      for (let k = 0; k <= 6; k++) boards += pl1([P(x, k * SHELF_H / 6, z), P(x, k * SHELF_H / 6, z1)]);
      // the spines: thin vertical quads on each board, fewer far away
      const n = z < 12 ? 9 : z < 26 ? 5 : z < 44 ? 2 : 0;
      for (let k = 0; k < 6; k++) {
        const y0 = k * SHELF_H / 6 + 0.06, y1 = y0 + SHELF_H / 6 * 0.78;
        for (let b = 0; b < n; b++) {
          const za = z + 0.1 + (2.2 / n) * b, zb = za + (2.2 / n) * 0.82;
          const hgt = y1 - R.range(0, 0.08);
          books[R.int(0, BOOKS.length - 1)] += pz([P(x, y0, za), P(x, y0, zb), P(x, hgt, zb), P(x, hgt, za)]);
        }
      }
    }
    books.forEach((d, i) => d && S.add(`<path d="${d}" fill="${BOOKS[i]}"/>`));
    S.add(`<path d="${boards}" stroke="${C.shelfLit}" stroke-width="2.4"/><path d="${frame}" stroke="${C.shelf}" stroke-width="4"/>`);
    // the shelves' cornice
    S.add(`<path d="${pz1([P(x, SHELF_H, Z0), P(x, SHELF_H, ZE), P(x, SHELF_H + 0.3, ZE), P(x, SHELF_H + 0.3, Z0)])}" fill="${C.shelfLit}"/>`);
    // the fading of distance over the far shelves
    S.add(`<path d="${pz1([P(x, 0, 20), P(x, 0, ZE), P(x, SHELF_H + 0.3, ZE), P(x, SHELF_H + 0.3, 20)])}" fill="${S.lin([[0, C.floorFar, 0], [1, C.floorFar, 0.75]], `gradientUnits="userSpaceOnUse" x1="${f1(P(x, 0, 20)[0])}" y1="0" x2="${VP[0]}" y2="0"`)}"/>`);
  }
  // white columns in front of the shelves, with vault ribs between each pair
  {
    let ribs = '';
    for (let z = 6; z < ZE; z += 9.6) {
      ribs += pl1(Array.from({ length: 13 }, (_, k) => vaultPt(k / 12, z)));
    }
    S.add(`<path d="${ribs}" fill="none" stroke="${C.col}" stroke-width="6" opacity=".85"/>`);
    for (let z = ZE - 3.6; z >= 6; z -= 9.6) {
      for (const side of [-1, 1]) {
        const cw = 0.42, x = side * (SHELF_X - 0.5);
        const a = P(x - cw, 0, z), b = P(x + cw, 0, z), c = P(x + cw, WALL_H, z), d = P(x - cw, WALL_H, z);
        S.add(`<path d="${pz1([a, b, c, d])}" fill="${fade(side < 0 ? C.col : C.colShade, z)}"/><path d="${pz1([[a[0], a[1]], [b[0], a[1]], [b[0], a[1] - (a[1] - d[1]) * 0.05], [a[0], a[1] - (a[1] - d[1]) * 0.05]])}" fill="${fade(C.colShade, z)}"/>`);
        S.add(`<path d="${pl1([[(a[0] + b[0]) / 2 + (side < 0 ? 4 : -4) * 8 / z, a[1]], [(c[0] + d[0]) / 2 + (side < 0 ? 4 : -4) * 8 / z, d[1]]])}" stroke="${fade(C.colShade, z)}" stroke-width="${f1(Math.max(1, 24 / z))}" opacity=".6"/>`);
      }
    }
  }

  // court: the two rows of Morningstar guards along the shelves, the empty chair, the knight in the door
  if (court) {
    let g = '', hal = '', heads = '';
    for (const z of [7.5, 11, 15, 20, 26, 33, 42, 54]) {
      for (const side of [-1, 1]) {
        const x = side * 3.3, base = P(x, 0, z), s = 1.86 / z * F / 30;
        g += person(base[0], base[1], s, '#d8dce4');
        const hx = base[0] + side * 9 * s, h0 = P(x, 0, z)[1], h1 = P(x, 2.7, z)[1];
        hal += `M${f1(hx)},${f1(h0)}V${f1(h1)}`;
        heads += `M${f1(hx)},${f1(h1)}l${f1(-2.6 * s)},${f1(6 * s)}h${f1(5.2 * s)}z`;
      }
    }
    S.add(`<path d="${g}" fill="#e4e8ee"/><path d="${g}" fill="none" stroke="#7a8090" stroke-width="1.6"/><path d="${hal}" stroke="#4e525c" stroke-width="3"/><path d="${heads}" fill="#9aa0aa"/>`);
    // the plain chair beside the left shelves, nobody in it
    const c0 = P(-3.4, 0, 6.2), c1 = P(-2.8, 0, 6.2), cs = P(-3.4, 0.5, 6.2), cb = P(-3.4, 1.2, 6.2);
    S.add(`<path d="M${f1(c0[0])},${f1(c0[1])}V${f1(cb[1])}M${f1(c1[0])},${f1(c1[1])}V${f1(cs[1])}" stroke="${C.woodDeep}" stroke-width="6"/><path d="${pz1([[c0[0] - 4, cs[1]], [c1[0] + 6, cs[1]], [c1[0], cs[1] + 8], [c0[0], cs[1] + 8]])}" fill="${C.wood}"/><path d="${pz1([[c0[0] - 4, cb[1]], [c0[0] + 22, cb[1] + 4], [c0[0] + 22, cs[1]], [c0[0] - 4, cs[1]]])}" fill="${C.woodLit}"/>`);
    // a small table beside it with a register lying open
    const t0 = P(-3.9, 0.75, 7.6);
    S.add(`<path d="M${f1(t0[0] + 6)},${f1(t0[1])}V${f1(P(-3.9, 0, 7.6)[1])}" stroke="${C.woodDeep}" stroke-width="5"/><path d="${pz1([[t0[0] - 18, t0[1]], [t0[0] + 40, t0[1] - 4], [t0[0] + 44, t0[1] + 6], [t0[0] - 14, t0[1] + 10]])}" fill="${C.wood}"/><path d="${pz1([[t0[0] - 6, t0[1] - 2], [t0[0] + 30, t0[1] - 5], [t0[0] + 32, t0[1] + 2], [t0[0] - 4, t0[1] + 5]])}" fill="${C.paper}"/>`);
    // the knight in the door at the far end: silver, hand on the hilt
    const k = P(0, 0, ZE - 0.5), ks = 1.9 / (ZE - 0.5) * F / 30;
    S.add(`<path d="${person(k[0], k[1], ks)}" fill="#9aa2b0"/><path d="M${f1(k[0] + 4 * ks)},${f1(k[1] - 10 * ks)}l${f1(3 * ks)},${f1(8 * ks)}" stroke="#e8ecf2" stroke-width="1.6"/>`);
  }

  // the long table in the middle, the open register, the three seals, the letter box; the reading lectern
  {
    const tz0 = 3.4, tz1 = 9.5, tx = 1.25, ty = 0.82;
    const top4 = [P(-tx, ty, tz0), P(-tx, ty, tz1), P(tx, ty, tz1), P(tx, ty, tz0)];
    const legs = [[-tx + 0.12, tz0 + 0.2], [tx - 0.12, tz0 + 0.2], [-tx + 0.12, tz1 - 0.2], [tx - 0.12, tz1 - 0.2]];
    let lg = '';
    for (const [x, z] of legs) { const a = P(x, 0, z), b = P(x, ty, z); lg += `M${f1(a[0])},${f1(a[1])}V${f1(b[1])}`; }
    S.add(`<path d="${lg}" stroke="${C.woodDeep}" stroke-width="12"/>`);
    S.add(`<path d="${pz1(top4)}" fill="${S.lin([[0, C.woodLit], [1, C.wood]], `gradientUnits="userSpaceOnUse" x1="0" y1="${f1(top4[1][1])}" x2="0" y2="${f1(top4[0][1])}"`)}"/>`);
    S.add(`<path d="${pz1([P(-tx, ty, tz0), P(tx, ty, tz0), P(tx, ty - 0.1, tz0), P(-tx, ty - 0.1, tz0)])}" fill="${C.woodDeep}"/>`);
    // the open register near the front: two pale pages, a header row of four columns (strokes, not letters), a red cord
    const pg = (x0, x1, z0, z1) => pz1([P(x0, ty + 0.01, z0), P(x0, ty + 0.01, z1), P(x1, ty + 0.01, z1), P(x1, ty + 0.01, z0)]);
    S.add(`<path d="${pg(-0.75, 0, 3.9, 5.1)}" fill="${C.paper}"/><path d="${pg(0, 0.75, 3.9, 5.1)}" fill="${mix(C.paper, C.paperShade, 0.3)}"/>`);
    let hdr = '', rows = '';
    for (const sx of [-0.7, 0.05]) {
      for (let c = 0; c < 4; c++) { const x0 = sx + c * 0.17, a = P(x0 + 0.02, ty + 0.01, 5.0), b = P(x0 + 0.13, ty + 0.01, 5.0); hdr += pl1([a, b]); }
      for (let c = 1; c < 4; c++) { const x0 = sx + c * 0.17, a = P(x0, ty + 0.01, 3.95), b = P(x0, ty + 0.01, 5.05); rows += pl1([a, b]); }
      for (let r = 0; r < 5; r++) { const z = 4.85 - r * 0.18, a = P(sx, ty + 0.01, z), b = P(sx + 0.66, ty + 0.01, z); rows += pl1([a, b]); }
    }
    S.add(`<path d="${rows}" stroke="${C.paperShade}" stroke-width="1.2"/><path d="${hdr}" stroke="${C.ink}" stroke-width="3"/>`);
    const cord0 = P(0.02, ty + 0.012, 5.1), cord1 = P(0.1, ty, 3.6);
    S.add(`<path d="M${f1(cord0[0])},${f1(cord0[1])}Q${f1(cord0[0] + 10)},${f1((cord0[1] + cord1[1]) / 2)} ${f1(cord1[0])},${f1(cord1[1] + 18)}" fill="none" stroke="#a83030" stroke-width="2.4"/>`);
    // the three seals in a row further up the table: the upright star, the arch over the wave, the dish of star wax
    const s1 = P(-0.65, ty, 6.6), s2 = P(0, ty, 6.6), s3 = P(0.65, ty, 6.6), sr = 0.16 / 6.6 * F;
    S.add(`<path d="${circ(s1[0], s1[1] - sr * 0.4, sr)}" fill="#c8b070"/><path d="${star7(s1[0], s1[1] - sr * 0.4, sr * 0.7)}" fill="#8a6a2a"/>`);
    S.add(`<path d="${circ(s2[0], s2[1] - sr * 0.4, sr)}" fill="#8a8e96"/><path d="${archWave(s2[0], s2[1] - sr * 0.5, sr * 0.6)}" fill="none" stroke="#2e323a" stroke-width="2.4"/>`);
    S.add(`<ellipse cx="${f1(s3[0])}" cy="${f1(s3[1] - sr * 0.2)}" rx="${f1(sr * 1.3)}" ry="${f1(sr * 0.6)}" fill="#9aa0a8"/><path d="${circ(s3[0], s3[1] - sr * 0.3, sr * 0.75)}" fill="#a83a3a"/><path d="${star7(s3[0], s3[1] - sr * 0.3, sr * 0.5)}" fill="#d87060"/>`);
    // the letter box beside the wax, a letter sticking out of it
    const lb = P(0.95, ty, 7.6), lbw = 0.5 / 7.6 * F, lbh = 0.28 / 7.6 * F;
    S.add(`<rect x="${f1(lb[0] - lbw / 2)}" y="${f1(lb[1] - lbh)}" width="${f1(lbw)}" height="${f1(lbh)}" fill="${C.woodDeep}"/><path d="M${f1(lb[0] - lbw / 2 + 4)},${f1(lb[1] - lbh)}l6,-14h${f1(lbw * 0.5)}l-4,14z" fill="${C.paper}"/>`);
    // the tall reading lectern to the right of the table (white cloth on it at court)
    const l0 = P(2.4, 0, 6.4), l1 = P(2.4, 1.35, 6.4), lw = 0.36 / 6.4 * F;
    S.add(`<path d="M${f1(l0[0])},${f1(l0[1])}V${f1(l1[1])}" stroke="${C.woodDeep}" stroke-width="10"/><path d="M${f1(l0[0] - lw)},${f1(l0[1])}h${f1(lw * 2)}" stroke="${C.woodDeep}" stroke-width="8"/>`);
    S.add(`<path d="${pz1([[l1[0] - lw * 1.3, l1[1] + 10], [l1[0] + lw * 1.3, l1[1] - 6], [l1[0] + lw * 1.3, l1[1] + 8], [l1[0] - lw * 1.3, l1[1] + 24]])}" fill="${C.wood}"/>`);
    if (court) S.add(`<path d="${pz1([[l1[0] - lw * 1.4, l1[1] + 8], [l1[0] + lw * 1.4, l1[1] - 8], [l1[0] + lw * 1.5, l1[1] + 30], [l1[0] - lw * 1.3, l1[1] + 52]])}" fill="#f6f4ee"/>`);
  }

  // night: the hall goes dark; one lamp on the table, a sheet and the arch-and-wave seal, a silver hand reaching in
  if (night) {
    const lamp = P(-0.2, 0.82, 4.6);
    S.add(`<rect width="${W}" height="${H}" fill="#0c0e16" opacity=".86"/>`);
    S.add(`<ellipse cx="${f1(lamp[0])}" cy="${f1(lamp[1])}" rx="420" ry="260" fill="${S.rad([[0, '#ffd8a0', 0.42], [0.45, '#e8a860', 0.16], [1, '#e8a860', 0]])}"/>`);
    // the sheet with the stamped arch: lines that are not letters
    const pa = P(0.1, 0.83, 3.7), pb = P(0.9, 0.83, 3.7), pc = P(0.9, 0.83, 4.6), pd = P(0.1, 0.83, 4.6);
    S.add(`<path d="${pz1([pa, pb, pc, pd])}" fill="#f0dcb0"/>`);
    let ln = '';
    for (let k = 1; k < 4; k++) { const t = k / 5; ln += pl1([[pd[0] + (pa[0] - pd[0]) * t + 12, pd[1] + (pa[1] - pd[1]) * t], [pc[0] + (pb[0] - pc[0]) * t - 50, pc[1] + (pb[1] - pc[1]) * t]]); }
    S.add(`<path d="${ln}" stroke="#7a5a3a" stroke-width="2.6" opacity=".6"/><path d="${archWave((pb[0] + pc[0]) / 2 - 30, (pb[1] + pc[1]) / 2 - 2, 16)}" fill="none" stroke="#8a2a2a" stroke-width="3"/>`);
    // the lamp: a brass base, glass chimney, the flame
    S.add(`<path d="M${f1(lamp[0] - 22)},${f1(lamp[1])}h44l-8,-12h-28z" fill="#8a6a3a"/><path d="M${f1(lamp[0] - 12)},${f1(lamp[1] - 12)}q-4,-40 12,-58q16,18 12,58z" fill="#f8e4b8" opacity=".55"/><path d="M${f1(lamp[0])},${f1(lamp[1] - 22)}q-7,-12 0,-26q7,14 0,26z" fill="#fff4d0"/>`);
    // the seal standing beside the sheet
    const sl = P(1.05, 0.83, 4.2);
    S.add(`<path d="M${f1(sl[0] - 10)},${f1(sl[1])}h20v-30h-20z" fill="#5a4a3a"/><path d="M${f1(sl[0] - 16)},${f1(sl[1] - 30)}h32v-10h-32z" fill="#6e5e4a"/>`);
    // the hand in silver armour reaching in from the right edge toward the sheet
    const hx = (pb[0] + pc[0]) / 2 + 40, hy = (pb[1] + pc[1]) / 2 - 20;
    S.add(`<path d="M${W + 20},${f1(hy - 70)}L${f1(hx + 120)},${f1(hy - 38)}Q${f1(hx + 70)},${f1(hy - 34)} ${f1(hx + 40)},${f1(hy - 20)}L${f1(hx)},${f1(hy - 6)}Q${f1(hx - 14)},${f1(hy + 6)} ${f1(hx)},${f1(hy + 14)}L${f1(hx + 50)},${f1(hy + 16)}L${f1(hx + 130)},${f1(hy + 24)}L${W + 20},${f1(hy + 60)}Z" fill="#8a929e"/>`);
    S.add(`<path d="M${W + 20},${f1(hy - 70)}L${f1(hx + 120)},${f1(hy - 38)}Q${f1(hx + 70)},${f1(hy - 34)} ${f1(hx + 40)},${f1(hy - 20)}" fill="none" stroke="#e8ecf4" stroke-width="3"/><path d="M${f1(hx + 120)},${f1(hy - 38)}L${f1(hx + 130)},${f1(hy + 24)}M${f1(hx + 160)},${f1(hy - 44)}L${f1(hx + 170)},${f1(hy + 32)}M${f1(hx + 40)},${f1(hy - 20)}L${f1(hx + 50)},${f1(hy + 16)}" stroke="#4a5260" stroke-width="2.4"/>`);
  }
  return S.out();
}

export const whiteTowerBgs = {
  'white-tower-morning-gate': () => gate(false),
  'white-tower-morning-gate-dusk': () => gate(true),
  'white-tower-registry-hall': () => hall('plain'),
  'white-tower-registry-hall-court': () => hall('court'),
  'white-tower-registry-hall-night': () => hall('night'),
};
