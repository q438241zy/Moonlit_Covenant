// 灰烬关 — chapter 24 (script 24 美術需求):
//   ash-pass-far       — the Ash Pass from the plain below: dark-red mountains, the pass a split mouth between two peaks, an
//                        old fort with red banners on the saddle, smoke threads from the pass.
//   ash-pass-camp-night / ash-pass-camp-day — the camp below the pass: tents, a command tent with a table, the red mountains
//                        behind; night (fires, red glow in the pass) and day (hazy ash light).
//   ash-pass-gate-dawn — before the old fort's gate at dawn: a stone gatehouse in the pass, archers' slots along the wall,
//                        a single path of grey stone leading up to it, a pale dawn sky over the red rock.
//   ash-pass-throat    — inside the pass: a narrow gorge between red cliffs, the floor split with glowing cracks of the
//                        fire vein, heat shimmer and smoke.
// No text anywhere.
import { Scene, W, H, f, rng, mix } from './lib.mjs';

const f1 = (v) => f(v, 1);
const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)},${f1(cy)}a${f1(rx)},${f1(ry)} 0 1 0 ${f1(rx * 2)},0a${f1(rx)},${f1(ry)} 0 1 0 ${f1(-rx * 2)},0Z`;
const poly = (pts) => 'M' + pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join('L') + 'Z';

function mountains(S, R, sky, rock, rockShade, passX = 800, passY = 340) {
  // two massive peaks with the pass split between them
  S.add(`<path d="${poly([[0, 620], [0, 300], [180, 180], [380, 120], [560, 220], [passX - 60, passY - 40], [passX - 20, passY + 60], [passX, 620]])}" fill="${rock}"/>`);
  S.add(`<path d="${poly([[W, 620], [W, 260], [1420, 150], [1220, 110], [1040, 210], [passX + 60, passY - 30], [passX + 20, passY + 60], [passX, 620]])}" fill="${rockShade}"/>`);
  let ridges = '';
  for (let k = 0; k < 18; k++) { const x = R.range(40, W - 40), y = R.range(200, 560); ridges += `M${f1(x)},${f1(y)}l${f1(R.range(-60, 60))},${f1(R.range(30, 90))}`; }
  S.add(`<path d="${ridges}" stroke="${mix(rock, '#000000', 0.35)}" stroke-width="3" fill="none" opacity=".6"/>`);
}
function farPass() {
  const S = new Scene('sbApFar', '灰烬关远景：暗红色的山，山口像一道裂开的嘴夹在两座山峰之间，山口的鞍部上一座挂着红旗的旧营，山口里冒出几缕烟', 24101);
  const R = rng(24102);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#5a3a3a'], [0.5, '#a86a50'], [1, '#c89a70']])}"/>`);
  mountains(S, R, null, '#5a2a24', '#4a221e');
  // the old fort on the saddle with red banners
  S.add(`<path d="M720,340V280h40v-20h80v20h40V340Z" fill="#3a2a26"/><path d="M736,300h12v14h-12zM852,300h12v14h-12z" fill="#ffb060" opacity=".7"/>`);
  for (const x of [730, 870]) S.add(`<path d="M${x},280V230" stroke="#2a1a16" stroke-width="3"/><path d="M${x},232l30,8l-30,8z" fill="#c8302a"/>`);
  // smoke threads from the pass
  let sm = ''; for (let k = 0; k < 6; k++) sm += ell(800 + k * 18, 250 - k * 34, 14 + k * 8, 10 + k * 6);
  S.add(`<path d="${sm}" fill="#5a4a4a" opacity=".5" filter="${S.blur(2)}"/>`);
  // the plain in front
  S.add(`<path d="M0,620Q800,590 ${W},620V${H}H0Z" fill="${S.lin([[0, '#6a5240'], [1, '#3a2c22']])}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.75, '#000', 0.05], [1, '#000', 0.4]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}
function camp(day) {
  const S = new Scene(day ? 'sbApCampDay' : 'sbApCamp', day ? '灰烬关下的营地·白天：帐篷，一顶带桌子的军帐，后面是暗红的山，灰蒙蒙的灰烬光' : '灰烬关下的营地·夜：帐篷，一顶带桌子的军帐，营火，后面暗红的山，山口里透出红光', day ? 24211 : 24201);
  const R = rng(day ? 24212 : 24202);
  S.add(`<rect width="${W}" height="${H}" fill="${day ? S.lin([[0, '#8a7a72'], [0.6, '#b8a090'], [1, '#c8b098']]) : S.lin([[0, '#0c0808'], [0.6, '#1e1210'], [1, '#2a1a14']])}"/>`);
  mountains(S, R, null, day ? '#6a3a30' : '#2a1412', day ? '#5a302a' : '#22100e');
  if (!day) S.add(`<ellipse cx="800" cy="360" rx="120" ry="80" fill="${S.rad([[0, '#ff6a30', 0.6], [1, '#ff6a30', 0]])}"/>`);
  S.add(`<path d="M0,600H${W}V${H}H0Z" fill="${day ? S.lin([[0, '#8a7058'], [1, '#5a4636']]) : S.lin([[0, '#2a1c14'], [1, '#140c08']])}"/>`);
  const tent = day ? '#8a7a62' : '#3a2e24', door = day ? '#4a3c2e' : '#120c08';
  for (const [x, w, h] of [[80, 220, 170], [1260, 240, 180], [1440, 160, 120]]) S.add(`<path d="M${x},700L${x + w / 2},${700 - h}L${x + w},700Z" fill="${tent}"/><path d="M${x + w / 2},${700 - h}L${x + w / 2 + 14},700H${x + w / 2 - 14}Z" fill="${door}"/>`);
  // the command tent, open front, a table with a map inside
  S.add(`<path d="M420,760V520L800,430L1180,520V760Z" fill="${day ? '#9a8a70' : '#46382a'}"/><path d="M520,760V560H1080V760Z" fill="${day ? '#5a4c3c' : '#1a120c'}"/>`);
  S.add(`<path d="M600,700h400l30,-40h-460z" fill="#6a4a30"/><path d="M640,690l320,0l20,-28l-320,0z" fill="#d8c8a0"/><path d="M700,680l120,-14l60,8" stroke="#a83a2a" stroke-width="3" fill="none"/>`);
  if (!day) {
    S.add(`<ellipse cx="800" cy="680" rx="420" ry="220" fill="${S.rad([[0, '#ffb060', 0.35], [1, '#ffb060', 0]])}"/>`);
    S.add(`<path d="M260,800l30,-60l30,60zM272,800l18,-36l18,36z" fill="#ff9a40"/>`);
  }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', 0.15], [1, '#000', day ? 0.3 : 0.6]], 'cx="0.5" cy="0.55" r="0.75"')}"/>`);
  return S.out();
}
function gateDawn() {
  const S = new Scene('sbApGate', '灰烬关·旧营关门前·黎明：山口里一座石砌的关楼，城墙上一排箭孔，一条灰色的石路往上通到关门，红色岩石上方是苍白的黎明天空', 24301);
  const R = rng(24302);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#8a8aa0'], [0.5, '#d8c0b0'], [1, '#e8c8a0']])}"/>`);
  // red cliffs framing
  S.add(`<path d="${poly([[0, H], [0, 0], [360, 0], [420, 300], [380, 900]])}" fill="#5a2a24"/><path d="${poly([[W, H], [W, 0], [1240, 0], [1180, 300], [1220, 900]])}" fill="#4a221e"/>`);
  // the gatehouse
  S.add(`<path d="M480,560V220H1120V560Z" fill="#6a5a52"/><path d="M480,220h640v-30H480z" fill="#5a4a44"/>`);
  { let m = ''; for (let x = 480; x < 1120; x += 64) m += `M${x},190v-30h40v30`; S.add(`<path d="${m}" fill="#5a4a44"/>`); }
  { let s = ''; for (let x = 520; x < 1100; x += 70) s += `M${x},300h10v36h-10z`; S.add(`<path d="${s}" fill="#1a1210"/>`); }
  S.add(`<path d="M700,560V420q100,-80 200,0V560Z" fill="#2a1e1a"/><path d="M700,560V420q100,-80 200,0" fill="none" stroke="#3a2e2a" stroke-width="6"/>`);
  for (const x of [520, 1080]) S.add(`<path d="M${x},220V150" stroke="#2a1a16" stroke-width="3"/><path d="M${x},152l34,10l-34,10z" fill="#c8302a"/>`);
  // the stone path up
  S.add(`<path d="M600,${H}L740,560H860L1000,${H}Z" fill="#8a8078"/>`);
  { let st = ''; for (let k = 0; k < 9; k++) { const y = 580 + k * 36, w = 140 + k * 30; st += `M${f1(800 - w / 2)},${f1(y)}h${f1(w)}`; } S.add(`<path d="${st}" stroke="#6a6058" stroke-width="2"/>`); }
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.7, '#000', 0.1], [1, '#000', 0.45]], 'cx="0.5" cy="0.5" r="0.75"')}"/>`);
  return S.out();
}
function throat() {
  const S = new Scene('sbApThroat', '灰烬关·山口里：两面红色峭壁之间一条窄窄的峡谷，地上一道道裂缝发着炎脉的红光，热浪扭曲着空气，冒着烟', 24401);
  const R = rng(24402);
  S.add(`<rect width="${W}" height="${H}" fill="${S.lin([[0, '#3a1a14'], [0.4, '#6a2a1a'], [1, '#2a120c']])}"/>`);
  // cliffs converging to a narrow far opening
  S.add(`<path d="${poly([[0, 0], [700, 0], [740, 420], [600, H], [0, H]])}" fill="#4a1e18"/><path d="${poly([[W, 0], [900, 0], [860, 420], [1000, H], [W, H]])}" fill="#3e1a14"/>`);
  { let d = ''; for (let k = 0; k < 30; k++) { const left = k % 2 === 0; const x = left ? R.range(20, 640) : R.range(960, 1580), y = R.range(40, 860); d += `M${f1(x)},${f1(y)}l${f1(R.range(-40, 40))},${f1(R.range(20, 70))}`; } S.add(`<path d="${d}" stroke="#2a0e0a" stroke-width="4" fill="none" opacity=".7"/>`); }
  S.add(`<path d="M740,420H860L1000,${H}H600Z" fill="#3a1a12"/>`);
  // the glowing cracks of the fire vein across the floor
  let cracks = '';
  for (let k = 0; k < 14; k++) {
    const y = 460 + k * 30 + R.range(-8, 8), w = 120 + k * 40;
    cracks += `M${f1(800 - w / 2)},${f1(y)}l${f1(w * 0.3)},${f1(R.range(-10, 10))}l${f1(w * 0.2)},${f1(R.range(-8, 8))}l${f1(w * 0.5)},${f1(R.range(-10, 10))}`;
  }
  S.add(`<path d="${cracks}" stroke="#ff7a30" stroke-width="6" fill="none" filter="${S.blur(1)}"/><path d="${cracks}" stroke="#ffd080" stroke-width="2" fill="none"/>`);
  S.add(`<ellipse cx="800" cy="700" rx="360" ry="200" fill="${S.rad([[0, '#ff6a2a', 0.4], [1, '#ff6a2a', 0]])}"/>`);
  let sm = ''; for (let k = 0; k < 10; k++) sm += ell(R.range(620, 980), R.range(200, 460), R.range(40, 90), R.range(30, 60));
  S.add(`<path d="${sm}" fill="#2a1a18" opacity=".45" filter="${S.blur(2)}"/>`);
  S.add(`<rect width="${W}" height="${H}" fill="${S.rad([[0, '#000', 0], [0.6, '#000', 0.2], [1, '#000', 0.6]], 'cx="0.5" cy="0.6" r="0.75"')}"/>`);
  return S.out();
}

export const ashPassBgs = {
  'ash-pass-far': () => farPass(),
  'ash-pass-camp-night': () => camp(false),
  'ash-pass-camp-day': () => camp(true),
  'ash-pass-gate-dawn': () => gateDawn(),
  'ash-pass-throat': () => throat(),
};
