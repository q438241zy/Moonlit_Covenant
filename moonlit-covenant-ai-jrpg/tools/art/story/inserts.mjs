// Story inserts (道具特写叠图) for chapters 10–19 — props the scripts list under 美術需求「疊圖」 that are pictures, not
// `text`. Each is an 800×600 card shown over the scene while the line that names the prop is on screen (docs/STORY-ENGINE.md §3).
// Chapters 20–30 are in inserts-b.mjs. No text anywhere: writing is scribble, the words stay in the line.
import { card, ground, vignette, paper, writing, archWave, crown, crownCrack, sevenRings, seal, glow, rain, crest, ell, rect, pts, ptz, f1, mix, star7, IW, IH } from './insert-kit.mjs';
import { insertsB } from './inserts-b.mjs';

// 10 — a pair of purple eyes in a dark mirror: no face, no hair, no figure
function purpleEyes() {
  const S = card('siCh10Eyes', '一面暗着的镜子里，一双紫色的眼睛，没有脸', 10001);
  ground(S, 'night', { grain: false });
  S.add(`<path d="${ell(400, 300, 230, 270)}" fill="#3a2e24"/><path d="${ell(400, 300, 208, 248)}" fill="${S.lin([[0, '#1e2230'], [1, '#080a12']], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<path d="M260,140q60,-50 150,-40" fill="none" stroke="#8a90b0" stroke-width="5" opacity=".18"/>`);
  for (const x of [342, 458]) {
    glow(S, x, 290, 60, '#a46bff', 0.55);
    S.add(`<path d="M${x - 30},290q30,-22 60,0q-30,20 -60,0z" fill="#d8b8ff"/><path d="${ell(x, 290, 11, 13)}" fill="#6a2ab8"/><path d="${ell(x, 290, 4, 9)}" fill="#120820"/>`);
  }
  vignette(S, 0.55);
  return S.out();
}

// 12 — the glove in the old mirror: a black glove lets go of a thread, an inverted seven-pointed star flares on its back
function invertedStar() {
  const S = card('siCh12Star', '旧镜面里，一只黑手套松开一根线，手套背面一颗倒过来的七角星亮了一下', 12001);
  ground(S, 'mist', { grain: false });
  S.add(`<rect x="60" y="40" width="680" height="520" rx="20" fill="${S.lin([[0, '#3a4a44'], [1, '#141c1a']], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  { const R = S.R; let d = ''; for (let k = 0; k < 40; k++) d += `M${f1(R.range(70, 730))},${f1(R.range(50, 550))}l${f1(R.range(-30, 30))},${f1(R.range(-4, 4))}`; S.add(`<path d="${d}" stroke="#8a9a90" stroke-width="2" opacity=".2"/>`); }
  // the gloved hand from the upper right, fingers opening
  S.add(`<path d="M760,90C690,120 600,170 520,230C480,260 450,300 440,330L470,350C500,320 520,300 560,290L600,330C610,346 630,340 626,322L596,280L640,300C656,306 668,292 656,278L610,250L650,250C668,248 668,228 650,226L590,220C640,190 700,170 780,150Z" fill="#0c0a10"/>`);
  S.add(`<path d="M548,256l-6,6" stroke="#2a2830" stroke-width="3"/>`);
  glow(S, 560, 205, 54, '#b8a8ff', 0.6);
  S.add(`<path d="${star7(560, 205, 24, 0.46, 180)}" fill="#e8e0ff"/>`);
  // the thread falling away
  S.add(`<path d="M452,340C420,400 470,450 420,520S380,580 360,600" fill="none" stroke="#c8c0d8" stroke-width="2" opacity=".8"/>`);
  vignette(S, 0.6);
  return S.out();
}

// 12 — on the far roof in the rain, a crouching figure: no face, no hair colour, man or woman not shown
function roofWatcher() {
  const S = card('siCh12Roof', '雨夜，对岸的屋顶上，一个蹲着的人影，看不见脸', 12011);
  ground(S, 'night', { grain: false, light: [0.6, 0.3] });
  S.add(`<path d="M0,380L120,300L260,380L330,330L470,250L640,360L720,320L800,350V600H0Z" fill="#0c0c16"/>`);
  S.add(`<path d="M120,300L260,380M470,250L640,360" stroke="#3a3e58" stroke-width="3" opacity=".7"/>`);
  S.add(`<path d="M150,420h40v40h-40zM560,420h36v44h-36z" fill="#e8c070" opacity=".5"/>`);
  // the crouching silhouette on the ridge
  S.add(`<path d="M478,250C474,232 480,214 494,210C508,206 516,220 512,236C524,240 532,252 530,266L540,280L520,282L516,272L500,274L494,286L474,286L480,270C470,266 468,256 478,250Z" fill="#050508"/>`);
  S.add(rain(S.R, 120, '#9aa8c8', 0.4));
  vignette(S, 0.55);
  return S.out();
}

// 12 — Serena's shadow-bind: a dark purple shadow sliding along the flagstones and winding up round a pair of boots (never above)
function shadowBind() {
  const S = card('siCh12Shadow', '暗紫色的影子贴着石板缠上去，只缠到靴子', 12021);
  ground(S, 'stone', { grain: false });
  { let d = ''; for (let y = 60; y < 600; y += 110) d += `M0,${y}H800`; for (let x = 0; x < 800; x += 160) for (let y = 60; y < 600; y += 110) d += `M${x + ((y / 110) % 2) * 80},${y}v110`; S.add(`<path d="${d}" stroke="#0e0e12" stroke-width="4" opacity=".6"/>`); }
  S.add(`<path d="M0,520C120,500 200,540 300,500S440,430 480,400" fill="none" stroke="#3a1a5a" stroke-width="60" stroke-linecap="round" opacity=".75" filter="${S.blur(2)}"/>`);
  // boots
  S.add(`<path d="M460,180h70v170l40,30v30H460zM570,170h66v180l40,30v30H570z" fill="#1a1612"/>`);
  S.add(`<path d="M470,400C440,360 560,350 540,320S460,290 480,260S560,240 560,220M580,410C550,370 670,360 650,330S570,300 590,270S660,250 650,230" fill="none" stroke="#5a2a8a" stroke-width="14" stroke-linecap="round" opacity=".8"/>`);
  S.add(`<path d="M470,400C440,360 560,350 540,320S460,290 480,260" fill="none" stroke="#b088ff" stroke-width="3" opacity=".5"/>`);
  vignette(S, 0.55);
  return S.out();
}

// 13 — the pilgrimage pass, half wet: an upright seven-pointed imperial seal at the top, the arch-on-a-wave mark under it
function pilgrimPass() {
  const S = card('siCh13Pass', '半湿的巡礼通行证：最上方一颗正着的七角星御印，底下一个像拱又像浪的记号', 13001);
  ground(S, 'wood');
  paper(S, [[230, 70], [570, 84], [560, 540], [222, 528]], { wet: true });
  seal(S, 396, 170, 58, '#b8302a', { emblem: 'star' });
  S.add(`<path d="${archWave(394, 330, 70)}" fill="none" stroke="#3a2a1e" stroke-width="7" stroke-linecap="round"/>`);
  S.add(writing(S.R, 270, 440, 250, 3, 30, { op: 0.55 }));
  vignette(S, 0.5);
  return S.out();
}

// 13 — half of the black-gold clasp in the rain gutter
function halfCrest() {
  const S = card('siCh13Crest', '檐沟里，断成一半的黑金家纹扣子', 13011);
  ground(S, 'stone', { grain: false });
  S.add(`<path d="M0,170C200,150 600,150 800,170V480C600,460 200,460 0,480Z" fill="#1a1c22"/><path d="M0,250C200,240 600,240 800,250" stroke="#5a6a80" stroke-width="3" opacity=".5"/>`);
  crest(S, 430, 320, 170, { half: true });
  S.add(rain(S.R, 70, '#a8b4d0', 0.3));
  vignette(S, 0.55);
  return S.out();
}

// 14 — the grade tag: a palm-sized wooden tag on a wrist cord, the arch-on-a-wave mark burnt into the back
function tagBoard() {
  const S = card('siCh14Tag', '手腕上绑着的木牌，背面烧着那个像拱又像浪的记号', 14001);
  ground(S, 'cloth', { grain: false });
  S.add(`<path d="M120,160C260,200 300,220 340,240M680,170C540,200 500,220 460,240" fill="none" stroke="#8a7050" stroke-width="10" stroke-linecap="round"/>`);
  S.add(`<path d="M300,220h200l20,30v240l-20,30H300l-20,-30V250z" fill="${S.lin([[0, '#b08858'], [1, '#6a4a2a']], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  { const R = S.R; let d = ''; for (let k = 0; k < 9; k++) { const x = 296 + k * 24 + R.range(-4, 4); d += `M${f1(x)},228C${f1(x + 6)},330 ${f1(x - 6)},420 ${f1(x + 2)},512`; } S.add(`<path d="${d}" fill="none" stroke="#4a3018" stroke-width="2" opacity=".4"/>`); }
  S.add(`<path d="${ell(400, 250, 12, 12)}" fill="#1a120c"/>`);
  S.add(`<path d="${archWave(400, 380, 66)}" fill="none" stroke="#1a0c04" stroke-width="10" stroke-linecap="round"/><path d="${archWave(400, 380, 66)}" fill="none" stroke="#c84a1a" stroke-width="3" opacity=".35" filter="${S.blur(1)}"/>`);
  vignette(S, 0.55);
  return S.out();
}

// 15 — the White Tower summons: a white letter, gold wax pressed into a crown with a crack along its rim
function summonsSeal() {
  const S = card('siCh15Summons', '白纸的信，金色火漆压成一顶冠，冠缘一道裂', 15001);
  ground(S, 'wood');
  paper(S, [[140, 130], [660, 130], [660, 470], [140, 470]], { tint: '#f4f0e6', edge: '#c8bca0' });
  S.add(`<path d="M140,130L400,320L660,130" fill="none" stroke="#c8bca0" stroke-width="3"/>`);
  seal(S, 400, 318, 72, '#d4a640', { emblem: 'crack' });
  vignette(S, 0.5);
  return S.out();
}

// 15 — flashback: in the fire of Hemai, beside the black dragon's left eye, the crack shaped like a crown
function dragonEye() {
  const S = card('siCh15DragonEye', '闪回：赫麦村的火里，黑龙的左眼旁边那道像王冠的裂痕', 15011);
  ground(S, 'ember', { grain: false });
  S.add(`<path d="M0,120C200,60 560,40 800,140V600H0Z" fill="#0c080a"/>`);
  { const R = S.R; let d = ''; for (let k = 0; k < 60; k++) { const x = R.range(0, 800), y = R.range(160, 600); d += `M${f1(x)},${f1(y)}q14,-10 28,0q-14,10 -28,0z`; } S.add(`<path d="${d}" fill="#1e161c"/>`); }
  S.add(`<path d="${ell(430, 300, 70, 44)}" fill="#e8e0f0"/><path d="${ell(436, 300, 14, 36)}" fill="#0c080a"/>`);
  S.add(`<path d="${crownCrack(430, 212, 220)}" fill="none" stroke="#ff6a3a" stroke-width="8" stroke-linejoin="round" filter="${S.blur(1)}"/><path d="${crownCrack(430, 212, 220)}" fill="none" stroke="#ffd0a0" stroke-width="3" stroke-linejoin="round"/>`);
  S.add(`<path d="M0,600C80,480 60,420 130,380C120,460 190,470 170,600ZM660,600C700,500 690,440 760,400C750,480 800,500 800,600Z" fill="#ff7a2a" opacity=".55" filter="${S.blur(2)}"/>`);
  S.add(`<rect width="${IW}" height="${IH}" fill="#a0401a" opacity=".18"/>`);
  vignette(S, 0.65);
  return S.out();
}

// 15 — the black-green shard that rolls out of the crack, still beating, slowly
function darkShard() {
  const S = card('siCh15Shard', '焦黑的龙骨上，一块黑绿色的碎片，还在很慢地跳', 15021);
  ground(S, 'night', { grain: false });
  S.add(`<path d="M0,420C200,380 600,380 800,430V600H0Z" fill="#1a120c"/><path d="M0,430C200,392 600,392 800,440" stroke="#3a2a1a" stroke-width="6"/>`);
  glow(S, 400, 360, 120, '#3aa060', 0.45);
  S.add(`<path d="M360,300L420,270L470,320L452,400L380,420L340,370Z" fill="${S.lin([[0, '#2a5a3a'], [1, '#0a140e']], 'x1="0" y1="0" x2="1" y2="1"')}"/><path d="M420,270L410,340L452,400M410,340L340,370" fill="none" stroke="#6ad08a" stroke-width="2" opacity=".6"/>`);
  vignette(S, 0.6);
  return S.out();
}

// 15 — under the green wooden ring, a palm-sized copper plate cut with seven rings
function sevenRingPlate() {
  const S = card('siCh15Plate', '木环底下压着的一片铜，刻着七个同心的环', 15031);
  ground(S, 'night', { grain: false });
  S.add(`<path d="M0,380C200,350 600,350 800,390V600H0Z" fill="#160e0a"/>`);
  S.add(`<path d="M240,250L560,240L580,470L230,480Z" fill="${S.lin([[0, '#c88a50'], [1, '#6a3a1a']], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(sevenRings(405, 360, 100, { col: '#3a1c0a', sw: 3 }));
  S.add(`<path d="M160,250C240,200 320,240 300,300M640,260C560,210 480,250 500,300" fill="none" stroke="#3a6a2a" stroke-width="8" stroke-linecap="round"/>`);
  { const cols = ['#e05050', '#e09040', '#e0d050', '#50b060', '#4a8ae0', '#8a5ae0', '#e8e8f0']; cols.forEach((c, k) => S.add(`<path d="${ell(180 + k * 70, 220 - (k % 2) * 14, 9, 5)}" fill="${c}"/>`)); }
  vignette(S, 0.55);
  return S.out();
}

// 16 — the registry hall desk: three stamps (an upright seven-pointed star, an arch on a wave) and a dish of morning-star wax
function registrySeals() {
  const S = card('siCh16Seals', '册厅桌上：一颗正着的七角星、一道拱压着一道浪的章印，和一盘七角晨星的封蜡', 16001);
  ground(S, 'wood');
  paper(S, [[90, 120], [470, 110], [480, 480], [96, 492]], { tint: '#f0e8d4' });
  S.add(`<path d="${star7(200, 230, 52)}" fill="none" stroke="#b02a2a" stroke-width="7" opacity=".85"/><path d="${archWave(360, 236, 52)}" fill="none" stroke="#b02a2a" stroke-width="7" stroke-linecap="round" opacity=".85"/>`);
  S.add(writing(S.R, 140, 360, 290, 3, 30, { op: 0.5 }));
  S.add(`<path d="${ell(620, 360, 130, 70)}" fill="#8a7a6a"/><path d="${ell(620, 350, 116, 58)}" fill="#3a2e24"/>`);
  for (const [x, y] of [[580, 340], [660, 330], [620, 372]]) seal(S, x, y, 30, '#e8e0d0', { emblem: 'star' });
  vignette(S, 0.5);
  return S.out();
}

// 16 — the weapons left on the long table under the Morning Gate: the shield, the short sword on it, the wrapped staff,
// the sword, and Zero (Mia's little round machine)
function weaponsTable() {
  const S = card('siCh16Weapons', '晨门长桌上：盾、搁在盾上的短剑、包着布的杖、剑，还有零号', 16011);
  ground(S, 'wood', { light: [0.5, 0.5] });
  S.add(`<path d="M0,250H800V600H0Z" fill="#2a1c12"/><path d="M0,250H800" stroke="#5a4028" stroke-width="5"/>`);
  // the tower shield lying flat
  S.add(`<path d="M120,300h220l20,30v170l-20,30H120l-20,-30V330z" fill="${S.lin([[0, '#9a3a3a'], [1, '#4a1616']])}"/><path d="M120,300h220l20,30v170l-20,30H120l-20,-30V330z" fill="none" stroke="#c8a060" stroke-width="6"/>`);
  S.add(`<path d="M140,410h180" stroke="#c8c0b0" stroke-width="10" stroke-linecap="round"/><path d="M300,398v24" stroke="#6a4a2a" stroke-width="12"/>`);
  // the staff with its head wrapped in cloth
  S.add(`<path d="M400,520L640,290" stroke="#3a2a3a" stroke-width="12" stroke-linecap="round"/><path d="M630,300C620,270 650,250 672,262C690,276 680,300 660,312Z" fill="#6a5a7a"/>`);
  // the sword
  S.add(`<path d="M420,470L760,420" stroke="#d8dce8" stroke-width="10" stroke-linecap="round"/><path d="M440,450l10,40" stroke="#c8a060" stroke-width="10" stroke-linecap="round"/>`);
  // Zero
  S.add(`<path d="${ell(560, 540, 46, 34)}" fill="#7a8a96"/><path d="${ell(560, 530, 18, 18)}" fill="#1a2028"/><path d="${ell(560, 530, 7, 7)}" fill="#7ad0ff"/><path d="M530,512l-14,-24M590,512l14,-24" stroke="#5a6a76" stroke-width="5" stroke-linecap="round"/>`);
  vignette(S, 0.5);
  return S.out();
}

// 16 — the saint's draft: rows of a careful hand, and the last line left empty; her thumb has creased the edge
function saintDraft() {
  const S = card('siCh16Draft', '圣女的稿子：工整的字一行一行，最后一行是空的，纸边被捏皱了', 16021);
  ground(S, 'cloth', { grain: false });
  paper(S, [[200, 50], [600, 60], [596, 560], [196, 552]], { tint: '#f6f1e4', edge: '#cabd9c' });
  S.add(writing(S.R, 240, 120, 310, 12, 30, { col: '#2a2440', sw: 2, op: 0.75 }));
  S.add(`<path d="M240,490h300" stroke="#c0b290" stroke-width="2" stroke-dasharray="6 8" opacity=".7"/>`);
  S.add(`<path d="M196,300q30,10 24,40q-10,30 -24,36M600,320q-26,8 -20,36q8,26 18,32" fill="none" stroke="#a8987a" stroke-width="3" opacity=".7"/>`);
  vignette(S, 0.5);
  return S.out();
}

// 16 — a silver-gauntleted hand reaching into the lamp light for the sheet of paper
function silverHand() {
  const S = card('siCh16Hand', '一只戴银甲的手伸进灯光里，接过那张纸', 16031);
  ground(S, 'wood', { light: [0.45, 0.55] });
  glow(S, 360, 330, 260, '#ffd890', 0.35);
  paper(S, [[260, 290], [470, 300], [460, 470], [250, 460]], { tint: '#efe6d0' });
  S.add(writing(S.R, 280, 330, 160, 4, 28, { op: 0.5 }));
  S.add(`<path d="M800,140C700,170 620,220 560,260L470,300L462,330L520,330L500,360L540,372L600,330C660,300 740,260 800,240Z" fill="${S.lin([[0, '#e8ecf4'], [0.5, '#9aa2b4'], [1, '#4a5060']], 'x1="0" y1="0" x2="0" y2="1"')}"/>`);
  S.add(`<path d="M640,212L668,280M700,190L728,258M580,250l20,52" stroke="#4a5060" stroke-width="3"/>`);
  vignette(S, 0.55);
  return S.out();
}

// 17 — the rubbing: seven rings brought up in charcoal on a sheet, lying on the stone bench
function rubbing() {
  const S = card('siCh17Rubbing', '石凳上的一张拓本：炭条拓出的七个环', 17001);
  ground(S, 'stone', { grain: false });
  paper(S, [[180, 70], [620, 80], [612, 530], [172, 520]], { tint: '#e8e2d4', edge: '#a8a090' });
  S.add(`<path d="${ell(396, 300, 200, 200)}" fill="${S.rad([[0, '#2a2a2e', 0.85], [0.8, '#3a3a3e', 0.7], [1, '#3a3a3e', 0]])}"/>`);
  { const R = S.R; let d = ''; for (let k = 0; k < 160; k++) { const a = R.range(0, Math.PI * 2), rr = R.range(0, 200), x = 396 + Math.cos(a) * rr, y = 300 + Math.sin(a) * rr; d += `M${f1(x)},${f1(y)}l${f1(R.range(10, 22))},${f1(R.range(-6, 6))}`; } S.add(`<path d="${d}" stroke="#141418" stroke-width="5" opacity=".35"/>`); }
  S.add(sevenRings(396, 300, 180, { col: '#e8e2d4', sw: 5 }));
  vignette(S, 0.5);
  return S.out();
}

// 17 — the black-gold crest inside Aila's short cape, whole
function fullCrest() {
  const S = card('siCh17Crest', '披风内侧，一枚完整的黑金家纹', 17011);
  ground(S, 'cloth', { grain: false });
  S.add(`<path d="M0,0H800V600H0Z" fill="${S.lin([[0, '#2a3a6a'], [1, '#141a34']], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  S.add(`<path d="M0,80C240,140 560,120 800,60" fill="none" stroke="#c8a860" stroke-width="10"/>`);
  crest(S, 400, 330, 170);
  vignette(S, 0.55);
  return S.out();
}

// 17 — at the first-floor window, black smoke, and a hand beating on the glass
function windowHand() {
  const S = card('siCh17Window', '白石墙上二楼的窗，黑烟里一只手在拍玻璃', 17021);
  ground(S, 'night', { grain: false });
  S.add(`<path d="M0,0H800V600H0Z" fill="#cac4b8"/><path d="M0,0H800V600H0Z" fill="#000" opacity=".45"/>`);
  S.add(`<path d="M240,100h320v400H240z" fill="#3a3430"/><path d="M260,120h280v360H260z" fill="#1a1414"/>`);
  S.add(`<path d="M270,300C300,240 360,260 380,200S480,150 530,180V470H270Z" fill="#0a0808" opacity=".9" filter="${S.blur(2)}"/>`);
  S.add(`<path d="M400,120V480M260,300H540" stroke="#3a3430" stroke-width="12"/>`);
  S.add(`<path d="M330,330c-6,-30 -2,-60 8,-62c10,-2 12,24 12,40c2,-26 6,-50 18,-50c12,0 10,30 8,50c4,-22 10,-40 22,-38c12,4 6,32 2,50c6,-14 14,-24 22,-18c8,8 -4,34 -16,54c-14,24 -40,32 -60,22c-12,-6 -14,-26 -16,-48z" fill="#e8d0c0" opacity=".85"/>`);
  S.add(`<path d="M440,110C470,60 520,80 540,30S620,10 650,0" fill="none" stroke="#0a0808" stroke-width="40" opacity=".6" filter="${S.blur(2)}"/>`);
  vignette(S, 0.55);
  return S.out();
}

// 18 — a person in the ice, up to the chest: eyes open, calm, not in pain
function icePerson() {
  const S = card('siCh18IcePerson', '冰里的人，只到胸口：眼睛睁着，很平静', 18001);
  ground(S, 'ice', { grain: false });
  S.add(`<path d="M140,40L680,60L700,560L120,580Z" fill="${S.lin([[0, '#a8d8ec'], [1, '#3a6a88']], 'x1="0" y1="0" x2="1" y2="1"')}" opacity=".85"/>`);
  S.add(`<path d="M400,160C450,160 480,200 480,250C480,300 450,330 400,330C350,330 320,300 320,250C320,200 350,160 400,160ZM260,580C260,450 320,390 400,390C480,390 540,450 540,580Z" fill="#2a4a5e" opacity=".55"/>`);
  S.add(`<path d="M360,250q14,-8 28,0M412,250q14,-8 28,0" fill="none" stroke="#e8f6ff" stroke-width="3"/><path d="${ell(374, 252, 5, 5)}${ell(426, 252, 5, 5)}" fill="#0c1822"/>`);
  S.add(`<path d="M160,120L300,300L250,520M600,90L520,260L640,460" fill="none" stroke="#e8f6ff" stroke-width="3" opacity=".5"/>`);
  S.add(`<path d="M140,40L680,60L700,560L120,580Z" fill="none" stroke="#e8f6ff" stroke-width="5" opacity=".6"/>`);
  vignette(S, 0.5);
  return S.out();
}

// 18 — a frost wraith: a figure made of frost, half transparent, no face
function frostSpirit() {
  const S = card('siCh18FrostSpirit', '霜灵：霜做的人形，半透明，没有脸', 18011);
  ground(S, 'ice', { grain: false, light: [0.5, 0.6] });
  S.add(`<path d="M0,470C200,440 600,440 800,470V600H0Z" fill="#c8e0ec" opacity=".5"/>`);
  glow(S, 400, 300, 220, '#d8f0ff', 0.4);
  S.add(`<path d="M400,90C440,90 462,120 460,160C458,196 436,214 420,220C470,240 500,290 504,360L520,470H280L296,360C300,290 330,240 380,220C364,214 342,196 340,160C338,120 360,90 400,90Z" fill="#e8f6ff" opacity=".45"/>`);
  { const R = S.R; let d = ''; for (let k = 0; k < 30; k++) { const x = R.range(300, 500), y = R.range(100, 460); d += `M${f1(x)},${f1(y)}l6,-10l6,10l-6,10z`; } S.add(`<path d="${d}" fill="#ffffff" opacity=".6"/>`); }
  vignette(S, 0.5);
  return S.out();
}

// 18 — frost with notches: ring after ring of cut marks in the rime
function frostRings() {
  const S = card('siCh18FrostRings', '霜上的刻纹：一圈一圈的刻号', 18021);
  ground(S, 'ice', { grain: false });
  S.add(`<rect width="${IW}" height="${IH}" fill="#b8d4e0" opacity=".35"/>`);
  for (let k = 1; k <= 5; k++) {
    const r = k * 48;
    S.add(`<path d="${ell(400, 300, r, r * 0.8)}" fill="none" stroke="#e8f6ff" stroke-width="3" opacity=".7"/>`);
    let d = ''; const n = 6 + k * 4;
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; d += `M${f1(400 + Math.cos(a) * (r - 7))},${f1(300 + Math.sin(a) * (r - 7) * 0.8)}L${f1(400 + Math.cos(a) * (r + 7))},${f1(300 + Math.sin(a) * (r + 7) * 0.8)}`; }
    S.add(`<path d="${d}" stroke="#ffffff" stroke-width="3"/>`);
  }
  vignette(S, 0.5);
  return S.out();
}

// 18 — a block of ice in a hand, a folded letter inside it
function iceLetter() {
  const S = card('siCh18IceLetter', '一只手握着一块冰，冰里封着一封折好的信', 18031);
  ground(S, 'ice', { grain: false });
  S.add(`<path d="M220,240L540,200L600,420L270,470Z" fill="${S.lin([[0, '#d8f0fa'], [1, '#6a9ab4']], 'x1="0" y1="0" x2="1" y2="1"')}" opacity=".85"/>`);
  S.add(`<path d="M320,280L480,262L500,380L336,398Z" fill="#efe6d0" opacity=".85"/><path d="M320,280L410,330L480,262" fill="none" stroke="#b8a888" stroke-width="2"/>`);
  S.add(`<path d="M220,240L540,200L600,420L270,470Z" fill="none" stroke="#ffffff" stroke-width="4" opacity=".6"/>`);
  S.add(`<path d="M150,600C170,500 200,440 250,430L300,470L270,500L330,520L320,600Z" fill="#8a6a5a"/><path d="M560,600C560,500 590,430 610,420C640,430 650,470 630,510L620,600Z" fill="#7a5a4a"/>`);
  vignette(S, 0.5);
  return S.out();
}

// 19 — a ring of frost grows out from the staff tip and stops between the halberd point and her feet
function frostCircle() {
  const S = card('siCh19FrostCircle', '一圈霜从杖尖长出去，停在戟尖和她的脚之间', 19001);
  ground(S, 'stone', { grain: false, light: [0.5, 0.55] });
  S.add(`<path d="${ell(400, 330, 230, 120)}" fill="none" stroke="#e8f6ff" stroke-width="14" opacity=".75"/><path d="${ell(400, 330, 230, 120)}" fill="none" stroke="#9ad0ec" stroke-width="30" opacity=".25" filter="${S.blur(2)}"/>`);
  { const R = S.R; let d = ''; for (let k = 0; k < 40; k++) { const a = R.range(0, Math.PI * 2), x = 400 + Math.cos(a) * 230, y = 330 + Math.sin(a) * 120; d += `M${f1(x)},${f1(y)}l${f1(R.range(-14, 14))},${f1(R.range(-16, 4))}`; } S.add(`<path d="${d}" stroke="#ffffff" stroke-width="3"/>`); }
  S.add(`<path d="M400,330L380,60" stroke="#e8f0f8" stroke-width="10" stroke-linecap="round"/><path d="${ell(400, 330, 14, 8)}" fill="#c8f0ff"/>`);
  S.add(`<path d="M800,240L660,300L640,286L800,200Z" fill="#c8ccd8"/><path d="M640,286l-16,10l20,6z" fill="#e8ecf4"/>`);
  S.add(`<path d="M150,470h60l20,30H140zM240,480h60l20,30H230z" fill="#3a3040"/>`);
  vignette(S, 0.55);
  return S.out();
}

// 19 — the seven-ring rubbing laid beside the ancient seven-lock alphabet he left (glyphs, not letters)
function sevenLockAlphabet() {
  const S = card('siCh19Alphabet', '七环拓本旁边，一张古七锁文的字母表', 19011);
  ground(S, 'wood');
  paper(S, [[60, 120], [360, 110], [370, 480], [70, 490]], { tint: '#e6e0d0' });
  S.add(sevenRings(215, 300, 130, { col: '#2a2a2e', sw: 3 }));
  paper(S, [[400, 90], [740, 100], [732, 510], [392, 500]], { tint: '#efe6cc' });
  const R = S.R;
  let d = '';
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
    const x = 440 + c * 48, y = 140 + r * 60;
    // a seven-lock glyph: a ring with 1–3 notches cut at different angles, and a dot or a tail — no letter shapes
    const gr = 11, n = R.int(1, 3), a0 = R.int(0, 6);
    d += `M${x + gr},${y + 14}a${gr},${gr} 0 1 0 ${-2 * gr},0a${gr},${gr} 0 1 0 ${2 * gr},0`;
    for (let k = 0; k < n; k++) { const a = ((a0 + k * 2) / 7) * Math.PI * 2; d += `M${f1(x + Math.cos(a) * (gr - 6))},${f1(y + 14 + Math.sin(a) * (gr - 6))}L${f1(x + Math.cos(a) * (gr + 6))},${f1(y + 14 + Math.sin(a) * (gr + 6))}`; }
    if (R() < 0.5) d += `M${x},${y + 14}h0.1`;
  }
  S.add(`<path d="${d}" fill="none" stroke="#3a2a1e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`);
  vignette(S, 0.5);
  return S.out();
}

export const inserts = {
  ch10_purple_eyes: purpleEyes,
  ch12_inverted_star: invertedStar,
  ch12_roof_watcher: roofWatcher,
  ch12_shadow_bind: shadowBind,
  ch13_pilgrim_pass: pilgrimPass,
  ch13_half_crest: halfCrest,
  ch14_tag_board: tagBoard,
  ch15_summons_seal: summonsSeal,
  ch15_dragon_eye: dragonEye,
  ch15_dark_shard: darkShard,
  ch15_seven_ring_plate: sevenRingPlate,
  ch16_seals: registrySeals,
  ch16_weapons_table: weaponsTable,
  ch16_saint_draft: saintDraft,
  ch16_silver_hand: silverHand,
  ch17_rubbing: rubbing,
  ch17_full_crest: fullCrest,
  ch17_window_hand: windowHand,
  ch18_ice_person: icePerson,
  ch18_frost_spirit: frostSpirit,
  ch18_frost_rings: frostRings,
  ch18_ice_letter: iceLetter,
  ch19_frost_circle: frostCircle,
  ch19_alphabet: sevenLockAlphabet,
  ...insertsB,
};
