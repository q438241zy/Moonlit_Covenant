// Story inserts (道具特写叠图) for chapters 20–30; chapters 10–19 and the shared rules are in inserts.mjs.
import { card, ground, vignette, paper, writing, ledgerRules, archWave, crown, crownCrack, seal, glow, chain, ell, rect, pts, ptz, f1, mix, star7, IW, IH } from './insert-kit.mjs';

// 20 — a white gown carried across the outer court, seen from far off; no figure drawn
function whiteGown() {
  const S = card('siCh20Gown', '远远地，一件白色的礼服被捧着穿过外庭', 20001);
  ground(S, 'mist', { grain: false, light: [0.5, 0.4] });
  S.add(`<path d="M0,420H800V600H0Z" fill="#8a8478"/><path d="M0,420H800" stroke="#c8c0b0" stroke-width="3"/>`);
  { let d = ''; for (let x = 40; x < 800; x += 120) d += `M${x},420v-300h30v300`; S.add(`<path d="${d}" fill="none" stroke="#b8b0a4" stroke-width="18" opacity=".5"/>`); }
  S.add(`<path d="M380,200C392,190 408,190 420,200L436,250C470,300 492,360 500,420C460,432 340,432 300,420C308,360 330,300 364,250Z" fill="#f6f4f0"/><path d="M364,250C390,262 410,262 436,250" fill="none" stroke="#d8d0c4" stroke-width="3"/>`);
  S.add(`<path d="M340,320C370,360 360,400 350,424M440,310C430,360 440,400 452,426" fill="none" stroke="#d8d0c8" stroke-width="3"/>`);
  vignette(S, 0.45);
  return S.out();
}

// 21 — the dragon well: far down the shaft, an iron wheel, glowing chains, a white-faced woman seen from behind
function dragonWell() {
  const S = card('siCh21Well', '很深的井底：一个铁轮，发亮的锁链，一个白面的女人的背影', 21001);
  ground(S, 'night', { grain: false });
  for (let k = 0; k < 8; k++) { const r = 380 - k * 42; S.add(`<path d="${ell(400, 300, r, r * 0.75)}" fill="${mix('#3a3640', '#08070c', k / 8)}"/>`); }
  glow(S, 400, 330, 110, '#c8b0ff', 0.5);
  S.add(`<path d="${ell(400, 330, 60, 44)}" fill="none" stroke="#5a5460" stroke-width="10"/><path d="M340,330H460M400,286V374M358,300L442,360M358,360L442,300" stroke="#5a5460" stroke-width="5"/>`);
  S.add(chain([[400, 330], [470, 220], [560, 90]], { rx: 12, ry: 7, col: '#e8d8ff', sw: 4 }) + chain([[400, 330], [300, 240], [200, 120]], { rx: 12, ry: 7, col: '#e8d8ff', sw: 4 }));
  S.add(`<path d="M380,400C380,380 392,372 400,372C408,372 420,380 420,400L428,460H372Z" fill="#ece8f0"/>`);
  vignette(S, 0.6);
  return S.out();
}

// 22 — Lena's letter: the morning-star wax, already cracked open
function lenaLetter() {
  const S = card('siCh22Letter', '一封信，七角晨星的封蜡已经裂开了', 22001);
  ground(S, 'wood');
  paper(S, [[150, 110], [650, 120], [640, 480], [140, 470]], { tint: '#ece2c8' });
  S.add(`<path d="M150,110L400,300L650,120" fill="none" stroke="#b8a888" stroke-width="3"/>`);
  seal(S, 400, 300, 66, '#e0d8c8', { emblem: 'star', broken: true });
  vignette(S, 0.5);
  return S.out();
}

// 23 — on the tip of every vine, a face (and the faces cast no shadow)
function vineFaces() {
  const S = card('siCh23Vines', '藤的尖端长出一张张脸，没有影子', 23001);
  ground(S, 'night', { grain: false, light: [0.5, 0.35] });
  S.add(`<path d="M0,0H800V600H0Z" fill="#14201a"/>`);
  const R = S.R;
  const tips = [[180, 200], [330, 140], [480, 180], [620, 230], [260, 330], [540, 340]];
  let d = '';
  for (const [x, y] of tips) d += `M${f1(x + R.range(-80, 80))},600C${f1(x - 60)},${f1(y + 200)} ${f1(x + 60)},${f1(y + 120)} ${f1(x)},${f1(y + 30)}`;
  S.add(`<path d="${d}" fill="none" stroke="#2a4a2a" stroke-width="14" stroke-linecap="round"/>`);
  for (const [x, y] of tips) {
    S.add(`<path d="${ell(x, y, 34, 42)}" fill="#a8b4a0" opacity=".85"/><path d="M${x - 14},${y - 6}h8M${x + 6},${y - 6}h8M${x - 6},${y + 16}q6,3 12,0" stroke="#1a2a1a" stroke-width="3" stroke-linecap="round"/>`);
  }
  vignette(S, 0.6);
  return S.out();
}

// 23 — a stack of land deeds; on the back of every one, the seals of the three houses and the arch on a wave
function deeds() {
  const S = card('siCh23Deeds', '一叠地契，每一张背面都盖着三家的章，还有拱浪的记号', 23011);
  ground(S, 'wood');
  for (let k = 3; k >= 0; k--) paper(S, [[170 + k * 14, 100 + k * 10], [620 + k * 14, 96 + k * 10], [630 + k * 14, 490 + k * 10], [160 + k * 14, 494 + k * 10]], { tint: mix('#efe6cc', '#c8b890', k * 0.15), shadow: k === 3 });
  S.add(`<path d="${ell(270, 220, 44, 44)}" fill="none" stroke="#2a6a3a" stroke-width="7"/><path d="${rect(360, 180, 84, 84)}" fill="none" stroke="#7a2a6a" stroke-width="7"/><path d="M520,176l44,44l-44,44l-44,-44z" fill="none" stroke="#2a3a7a" stroke-width="7"/>`);
  S.add(`<path d="${archWave(400, 380, 54)}" fill="none" stroke="#3a2a1e" stroke-width="6" stroke-linecap="round"/>`);
  vignette(S, 0.5);
  return S.out();
}

// 23 — the wooden ring on the stone platform, the one whose roots shrink back from a reaching hand; leaves of seven colours
function woodRing() {
  const S = card('siCh23Ring', '石台上的木环：根往回缩，叶子很细，七种颜色', 23021);
  ground(S, 'stone', { grain: false });
  S.add(`<path d="M120,360L680,360L720,460H80Z" fill="#5a5a5e"/><path d="M80,460H720V520H80Z" fill="#3a3a3e"/>`);
  S.add(`<path d="${ell(400, 320, 110, 60)}" fill="none" stroke="#5a7a3a" stroke-width="22"/><path d="${ell(400, 316, 110, 60)}" fill="none" stroke="#8aaa5a" stroke-width="6"/>`);
  S.add(`<path d="M300,350C260,380 220,370 200,400M500,350C540,380 580,372 600,400M340,372C330,400 300,410 290,430M460,372C470,400 500,410 510,430" fill="none" stroke="#4a3a20" stroke-width="7" stroke-linecap="round"/>`);
  const cols = ['#e05050', '#e09040', '#e0d050', '#50b060', '#4a8ae0', '#8a5ae0', '#e8e8f0'];
  cols.forEach((c, k) => { const a = Math.PI + (k / 6) * Math.PI, x = 400 + Math.cos(a) * 110, y = 316 + Math.sin(a) * 60; S.add(`<path d="${ell(x, y - 14, 8, 14)}" fill="${c}"/>`); });
  vignette(S, 0.55);
  return S.out();
}

// 24 — Barga, the great lava lizard, climbing out of the lava; cracked = its back scales split to the spine
function barga(cracked) {
  const S = card(cracked ? 'siCh24BargaCracked' : 'siCh24Barga', cracked ? '巴尔加：熔岩蜥蜴背上的鳞裂到了背脊，缝里透出红光' : '一只巨大的熔岩蜥蜴，从熔岩里爬出来', cracked ? 24011 : 24001);
  ground(S, 'ember', { grain: false, light: [0.5, 0.8] });
  S.add(`<path d="M0,430C200,400 600,410 800,440V600H0Z" fill="${S.lin([[0, '#ff8a2a'], [1, '#8a1a0a']])}"/>`);
  // the body rising out of the lava toward the left, the head raised, one front claw gripping the bank
  S.add(`<path d="M800,600C760,470 700,400 610,360C540,330 470,330 400,350C350,300 300,250 230,236C170,224 110,240 80,270C60,292 70,316 100,318C140,322 170,330 200,350C220,370 240,400 260,430L300,600Z" fill="#2a1410"/>`);
  S.add(`<path d="M80,270C60,292 70,316 100,318C140,322 170,330 200,350" fill="none" stroke="#ff8a3a" stroke-width="3" opacity=".6"/><path d="M96,300h40" stroke="#ff6a2a" stroke-width="3"/>`);
  S.add(`<path d="${ell(150, 262, 12, 9)}" fill="#ffd060"/><path d="${ell(152, 262, 3, 8)}" fill="#2a0a04"/>`);
  S.add(`<path d="M250,430C240,470 220,490 190,500L170,520L210,516L200,540L236,524L240,548L262,520C280,500 290,470 296,440Z" fill="#2a1410"/>`);
  { const R = S.R; let d = ''; for (let k = 0; k < 50; k++) { const x = R.range(260, 760), y = R.range(360, 520); d += `M${f1(x)},${f1(y)}q12,-10 24,0`; } S.add(`<path d="${d}" fill="none" stroke="#6a2a1a" stroke-width="3"/>`); }
  S.add(`<path d="M230,236C300,250 350,300 400,350C470,330 540,330 610,360C700,400 760,470 800,600" fill="none" stroke="#ff7a2a" stroke-width="4" opacity=".5"/>`);
  if (cracked) {
    S.add(`<path d="M250,250L320,290L400,350L480,340L560,345L640,380L720,450L780,560" fill="none" stroke="#ff6a1a" stroke-width="8" filter="${S.blur(1)}"/><path d="M320,290l-6,40M400,350l10,46M480,340l-12,50M560,345l14,44M640,380l-10,44M720,450l16,36" fill="none" stroke="#ffb060" stroke-width="4"/>`);
  }
  glow(S, 400, 520, 260, '#ffb040', 0.35);
  vignette(S, 0.55);
  return S.out();
}

// 25 — window frost: on the frosted pane, line after line grows, character by character (drawn as frost strokes)
function frostWords() {
  const S = card('siCh25FrostWords', '营帐窗上的霜，一个字一个字长出来', 25001);
  ground(S, 'ice', { grain: false });
  S.add(`<path d="M120,60h560v480H120z" fill="#3a5060"/><path d="M140,80h520v440H140z" fill="${S.lin([[0, '#c8dce8'], [1, '#8aa8bc']])}" opacity=".85"/>`);
  { const R = S.R; let d = ''; for (let k = 0; k < 50; k++) { const x = R.range(140, 660), y = R.range(80, 520); d += `M${f1(x)},${f1(y)}l${f1(R.range(-20, 20))},${f1(R.range(-20, 20))}`; } S.add(`<path d="${d}" stroke="#ffffff" stroke-width="2" opacity=".4"/>`); }
  S.add(writing(S.R, 200, 190, 400, 5, 52, { col: '#ffffff', sw: 4, op: 0.9, last: 0.4 }));
  S.add(`<path d="M400,80V520M140,300H660" stroke="#3a5060" stroke-width="10"/>`);
  vignette(S, 0.5);
  return S.out();
}

// 25 — the mother register open on the stone table, and beside it a block of very old ice
function motherBook() {
  const S = card('siCh25MotherBook', '石台上摊开的母本，旁边一块很老的冰', 25011);
  ground(S, 'ice', { grain: false });
  S.add(`<path d="M60,380L740,380L780,470H20Z" fill="#5a6470"/>`);
  S.add(`<path d="M150,180C240,160 330,170 400,200C470,170 560,160 650,180L640,400C560,384 470,390 400,414C330,390 240,384 160,400Z" fill="#e6dcc0"/><path d="M400,200V414" stroke="#8a7a5a" stroke-width="4"/>`);
  S.add(writing(S.R, 180, 220, 190, 6, 28, { op: 0.6, sw: 2 }) + writing(S.R, 420, 220, 200, 6, 28, { op: 0.6, sw: 2 }));
  S.add(`<path d="M660,300L760,280L780,400L670,410Z" fill="${S.lin([[0, '#c8e4f0'], [1, '#6a8ca0']], 'x1="0" y1="0" x2="1" y2="1"')}" opacity=".9"/><path d="M690,320L740,390" stroke="#ffffff" stroke-width="2" opacity=".6"/>`);
  vignette(S, 0.55);
  return S.out();
}

// 25 — the Heart of Ice, asleep: a pale crystal core with a faint slow light inside
function iceHeart() {
  const S = card('siCh25IceHeart', '冰之心：一块苍白的晶核，里面有一点很慢的光，睡着', 25021);
  ground(S, 'ice', { grain: false });
  glow(S, 400, 300, 220, '#bfe8ff', 0.45);
  S.add(`<path d="M400,120L500,220L470,400L400,470L330,400L300,220Z" fill="${S.lin([[0, '#f0faff'], [1, '#6aa0c0']], 'x1="0" y1="0" x2="1" y2="1"')}" opacity=".9"/><path d="M400,120L400,470M300,220L500,220M330,400L470,400" fill="none" stroke="#ffffff" stroke-width="2" opacity=".55"/>`);
  glow(S, 400, 300, 40, '#ffffff', 0.7);
  vignette(S, 0.55);
  return S.out();
}

// 26 — the contract with a lamp drawn on it: the public lamp, for those without money
function contractLamp() {
  const S = card('siCh26Lamp', '契约上画着一盏灯', 26001);
  ground(S, 'wood');
  paper(S, [[150, 70], [650, 80], [640, 530], [140, 520]], { tint: '#efe6cc' });
  S.add(`<path d="M400,140v40M370,180h60l20,40v120l-20,30h-60l-20,-30V220z" fill="none" stroke="#3a2a1e" stroke-width="4"/><path d="M400,250l-14,40h28z" fill="#d8a040"/><path d="M360,370h80M380,400h40" stroke="#3a2a1e" stroke-width="4"/>`);
  S.add(writing(S.R, 190, 440, 420, 2, 30, { op: 0.6 }));
  seal(S, 560, 470, 30, '#c8a040', { emblem: 'none' });
  vignette(S, 0.5);
  return S.out();
}

// 26 — the debt bonds burning all night
function deedsBurning() {
  const S = card('siCh26Burn', '债契烧了一整夜', 26011);
  ground(S, 'ember', { grain: false, light: [0.5, 0.7] });
  for (let k = 0; k < 6; k++) { const x = 200 + k * 70, y = 440 - (k % 3) * 20; paper(S, [[x, y], [x + 140, y - 20], [x + 150, y + 60], [x + 10, y + 80]], { tint: '#e8d8b0', burnt: true, shadow: false }); }
  S.add(`<path d="M220,460C240,360 300,340 290,240C340,300 360,260 380,180C410,260 440,280 470,220C480,300 540,320 560,250C600,330 600,400 590,460Z" fill="#ff8a2a" opacity=".85" filter="${S.blur(1)}"/><path d="M300,460C320,400 350,380 360,320C390,370 420,360 440,300C460,380 500,390 510,460Z" fill="#ffd070"/>`);
  { const R = S.R; let d = ''; for (let k = 0; k < 40; k++) d += `M${f1(R.range(200, 600))},${f1(R.range(40, 300))}h3`; S.add(`<path d="${d}" stroke="#ffb060" stroke-width="3"/>`); }
  vignette(S, 0.55);
  return S.out();
}

// 27 — the edge of Lí-yuè set against one link of the chain: very light, one millimetre
function chainBlade() {
  const S = card('siCh27ChainBlade', '黎月的刃口对着锁链的一环，很轻，一毫米', 27001);
  ground(S, 'night', { grain: false });
  S.add(chain([[0, 330], [260, 320]], { rx: 40, ry: 26, col: '#8a8490', sw: 14 }));
  S.add(`<ellipse cx="380" cy="318" rx="60" ry="38" fill="none" stroke="#c8c0d0" stroke-width="16"/>`);
  S.add(chain([[500, 316], [800, 300]], { rx: 40, ry: 26, col: '#8a8490', sw: 14 }));
  S.add(`<path d="M470,0L392,268L404,272L494,0Z" fill="${S.lin([[0, '#e8ecf8'], [1, '#9aa4c0']], 'x1="0" y1="0" x2="1" y2="0"')}"/><path d="M392,268L404,272" stroke="#ffffff" stroke-width="2"/>`);
  glow(S, 398, 278, 30, '#ffffff', 0.8);
  vignette(S, 0.6);
  return S.out();
}

// 27 — the link gives: the black dragon's head swings free, the broken chain falling away from its neck
function dragonFree() {
  const S = card('siCh27DragonFree', '那一环断了：黑龙的头甩开，断掉的锁链从颈上落下去', 27061);
  ground(S, 'sea', { grain: false, light: [0.6, 0.3] });
  S.add(`<path d="M0,600C80,480 160,400 260,360C330,330 400,300 470,240C530,190 610,170 690,180L760,200L800,240L740,250L790,280L700,290C640,300 590,330 540,380C480,440 420,520 400,600Z" fill="#141018"/>`);
  S.add(`<path d="M600,160L560,90L600,130ZM660,150L650,70L680,140Z" fill="#2a2430"/>`);
  S.add(`<path d="${ell(650, 214, 12, 9)}" fill="#e8e0f0"/><path d="${ell(652, 214, 4, 8)}" fill="#141018"/><path d="${crownCrack(640, 190, 70)}" fill="none" stroke="#c84a5a" stroke-width="3"/>`);
  S.add(chain([[300, 360], [250, 470], [230, 600]], { rx: 18, ry: 11, col: '#8a8490', sw: 7 }) + chain([[430, 300], [470, 400], [500, 520]], { rx: 18, ry: 11, col: '#8a8490', sw: 7 }));
  S.add(`<path d="M360,330l14,-22M380,340l20,-10" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>`);
  glow(S, 368, 320, 40, '#ffffff', 0.6);
  vignette(S, 0.55);
  return S.out();
}

// 27 — a scale from the black dragon's neck, cut with dragon script, some of it scratched away
function erasedScale() {
  const S = card('siCh27Scale', '黑龙颈上掉下的一片鳞，刻着龙文，有几行被刮掉了', 27011);
  ground(S, 'night', { grain: false });
  S.add(`<path d="M400,90C520,120 600,220 590,340C580,450 490,520 400,520C310,520 220,450 210,340C200,220 280,120 400,90Z" fill="${S.lin([[0, '#3a3248'], [1, '#0e0a14']], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  const R = S.R;
  let d = '';
  for (let r = 0; r < 7; r++) for (let c = 0; c < 6; c++) { const x = 290 + c * 40, y = 190 + r * 42; d += `M${x},${y}l${R.int(-10, 10)},${R.int(10, 22)}l${R.int(6, 16)},${R.int(-8, 8)}`; }
  S.add(`<path d="${d}" fill="none" stroke="#c8b8e0" stroke-width="3" opacity=".75"/>`);
  S.add(`<path d="M280,276h250M280,286h250M280,360h250M280,370h250" stroke="#0e0a14" stroke-width="10" opacity=".9"/>`);
  S.add(`<path d="M140,600C170,520 230,480 280,500L300,560Z" fill="#c09a7a"/>`);
  vignette(S, 0.55);
  return S.out();
}

// 27 — on the sea, a rope drifting
function seaRope() {
  const S = card('siCh27Rope', '海面上，一条绳子漂着', 27021);
  ground(S, 'sea', { grain: false, light: [0.5, 0.3] });
  { let d = ''; for (let y = 80; y < 600; y += 34) { d += `M0,${y}`; for (let x = 0; x <= 800; x += 40) d += `q20,${(y / 34) % 2 ? -8 : 8} 40,0`; } S.add(`<path d="${d}" fill="none" stroke="#5a7a90" stroke-width="2" opacity=".4"/>`); }
  S.add(`<path d="M80,360C200,320 260,400 380,350S560,300 620,360S700,420 760,380" fill="none" stroke="#c8b080" stroke-width="12" stroke-linecap="round"/><path d="M80,360C200,320 260,400 380,350S560,300 620,360S700,420 760,380" fill="none" stroke="#6a5030" stroke-width="3" stroke-dasharray="10 8"/>`);
  vignette(S, 0.6);
  return S.out();
}

// 27 / 28 — in the mirror, a council table with seven chairs; many = every mirror holds the table (28)
function mirrorTable(many) {
  const S = card(many ? 'siCh28MirrorTables' : 'siCh27Chairs', many ? '每一面镜子里，都有一张议桌' : '镜子里是一张议桌，七张椅子', many ? 28001 : 27031);
  ground(S, 'night', { grain: false });
  const table = (cx, cy, k) => {
    let s = `<path d="${ell(cx, cy, 70 * k, 30 * k)}" fill="#5a4630"/>`;
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 - Math.PI / 2, x = cx + Math.cos(a) * 96 * k, y = cy + Math.sin(a) * 44 * k; s += `<path d="${rect(x - 12 * k, y - 30 * k, 24 * k, 34 * k)}" fill="#2a2018"/>`; }
    return s;
  };
  const frames = many ? [[160, 180, 0.5], [400, 160, 0.55], [640, 180, 0.5], [260, 420, 0.5], [540, 420, 0.5]] : [[400, 300, 1]];
  for (const [cx, cy, k] of frames) {
    S.add(`<path d="${ell(cx, cy, 200 * k, 230 * k)}" fill="#6a5a4a"/><path d="${ell(cx, cy, 184 * k, 214 * k)}" fill="${S.lin([[0, '#3a4048'], [1, '#14181e']])}"/>`);
    S.add(table(cx, cy + 20 * k, k * 1.6));
  }
  vignette(S, 0.55);
  return S.out();
}

// 27 — Ophelia's dragon form: deep blue scales, silver wing membranes
function opheliaDragon() {
  const S = card('siCh27OpheliaDragon', '奥菲莉亚的龙形：深蓝的鳞，银色的翼膜', 27041);
  ground(S, 'sea', { grain: false, light: [0.5, 0.35] });
  S.add(`<path d="M380,300C300,180 160,120 40,140C120,190 160,240 170,300C220,280 300,290 380,320Z" fill="#c8d0e0" opacity=".85"/><path d="M420,300C500,180 640,120 760,140C680,190 640,240 630,300C580,280 500,290 420,320Z" fill="#c8d0e0" opacity=".85"/>`);
  S.add(`<path d="M80,150L170,300M200,150L250,290M300,170L320,300M720,150L630,300M600,150L550,290M500,170L480,300" stroke="#8a94a8" stroke-width="3"/>`);
  S.add(`<path d="M400,230C440,230 460,270 460,320C460,380 440,430 420,480L400,560L380,480C360,430 340,380 340,320C340,270 360,230 400,230Z" fill="${S.lin([[0, '#2a4a8a'], [1, '#0c1a3a']])}"/>`);
  S.add(`<path d="M400,150C430,150 448,180 446,214C444,240 424,250 400,250C376,250 356,240 354,214C352,180 370,150 400,150Z" fill="#1e3a74"/><path d="M372,160l-20,-40l30,30M428,160l20,-40l-30,30" fill="#e8d8b0"/>`);
  S.add(`<path d="M380,206l10,4M410,210l10,-4" stroke="#ffd060" stroke-width="4" stroke-linecap="round"/>`);
  vignette(S, 0.5);
  return S.out();
}

// 27 — the small fledgling-dragon form, hovering an inch above his head by the campfire
function youngDragon() {
  const S = card('siCh27YoungDragon', '营火边，小小的幼龙形，停在他头顶上方一寸', 27051);
  ground(S, 'ember', { grain: false, light: [0.5, 0.8] });
  glow(S, 400, 560, 240, '#ffb060', 0.4);
  S.add(`<path d="M300,330C260,270 200,250 160,260C200,290 210,320 214,350ZM500,330C540,270 600,250 640,260C600,290 590,320 586,350Z" fill="#c8d0e0" opacity=".9"/>`);
  S.add(`<path d="${ell(400, 340, 90, 70)}" fill="#2a4a8a"/><path d="${ell(400, 260, 62, 54)}" fill="#2e5296"/><path d="M370,220l-14,-34l26,22M430,220l14,-34l-26,22" fill="#e8d8b0"/>`);
  S.add(`<path d="${ell(378, 258, 9, 11)}${ell(422, 258, 9, 11)}" fill="#ffffff"/><path d="${ell(380, 260, 4, 6)}" fill="#ffc040"/><path d="${ell(420, 260, 4, 6)}" fill="#a060e0"/>`);
  S.add(`<path d="M480,380C540,410 560,450 520,470" fill="none" stroke="#2a4a8a" stroke-width="14" stroke-linecap="round"/>`);
  vignette(S, 0.5);
  return S.out();
}

// 28 — the permanent tracking mirror: a small hand mirror with an eye cut into its back, glowing
function trackingMirror() {
  const S = card('siCh28Tracking', '永久追踪镜：一面小手镜，背面刻着一只眼，在发光', 28011);
  ground(S, 'cloth', { grain: false });
  S.add(`<path d="M430,360L620,560" stroke="#2a2030" stroke-width="40" stroke-linecap="round"/><path d="M430,360L620,560" stroke="#6a5a7a" stroke-width="12" stroke-linecap="round"/>`);
  S.add(`<path d="${ell(360, 260, 170, 170)}" fill="#3a2e44"/><path d="${ell(360, 260, 150, 150)}" fill="${S.lin([[0, '#5a4a6a'], [1, '#1a1220']], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  glow(S, 360, 260, 120, '#c08aff', 0.5);
  S.add(`<path d="M260,260q100,-80 200,0q-100,80 -200,0z" fill="none" stroke="#e8d0ff" stroke-width="6"/><path d="${ell(360, 260, 26, 26)}" fill="#e8d0ff"/><path d="${ell(360, 260, 10, 10)}" fill="#2a1a3a"/>`);
  vignette(S, 0.55);
  return S.out();
}

// 28 — the law-suppressing shackles: heavy iron cuffs, cut with runes, closed on a pair of wrists
function shackles() {
  const S = card('siCh28Shackles', '压律镣铐：刻着符纹的沉重铁铐，扣在一双手腕上', 28021);
  ground(S, 'stone', { grain: false });
  S.add(`<path d="M0,300C120,280 220,290 290,300L300,360C220,356 120,360 0,380ZM800,300C680,280 580,290 510,300L500,360C580,356 680,360 800,380Z" fill="#c8a890"/>`);
  for (const x of [300, 500]) {
    S.add(`<path d="${rect(x - 50, 260, 100, 140)}" fill="${S.lin([[0, '#6a6870'], [1, '#2a2830']])}"/><path d="${rect(x - 50, 260, 100, 140)}" fill="none" stroke="#1a181e" stroke-width="5"/>`);
    S.add(`<path d="M${x - 30},290l10,20l10,-20l10,20l10,-20M${x - 30},350h60M${x},320v60" fill="none" stroke="#a8a0c8" stroke-width="3" opacity=".8"/>`);
  }
  S.add(chain([[350, 330], [450, 330]], { rx: 16, ry: 10, col: '#5a5860', sw: 7 }));
  vignette(S, 0.55);
  return S.out();
}

// 29 — the back of the light (the Holy Heart): old words cut into it (strokes, unreadable)
function heartBack() {
  const S = card('siCh29HeartBack', '光的背面刻着字，很旧的字', 29001);
  ground(S, 'gold', { grain: false });
  glow(S, 400, 300, 260, '#ffe8a0', 0.4);
  S.add(`<path d="M400,90L540,180L560,380L400,500L240,380L260,180Z" fill="${S.lin([[0, '#f8ecc8'], [1, '#b89a5a']], 'x1="0" y1="0" x2="1" y2="1"')}"/>`);
  const R = S.R;
  let d = '';
  for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) { const x = 318 + c * 38, y = 190 + r * 40; d += `M${x},${y}l${R.int(-8, 8)},${R.int(10, 20)}M${x + 8},${y + 4}h${R.int(8, 14)}`; }
  S.add(`<path d="${d}" fill="none" stroke="#6a4a1a" stroke-width="3" opacity=".7"/>`);
  vignette(S, 0.55);
  return S.out();
}

// 29 — the eclipse feast's tablecloth: a black moon swallowing a white moon, embroidered
function eclipseCloth() {
  const S = card('siCh29Cloth', '桌布上绣着一个黑色的月亮，吞着一个白色的月亮', 29011);
  ground(S, 'cloth', { grain: false });
  S.add(`<rect width="${IW}" height="${IH}" fill="#5a1420"/>`);
  { let d = ''; for (let k = 0; k < 40; k++) d += `M0,${k * 16}H800`; S.add(`<path d="${d}" stroke="#3a0a12" stroke-width="2" opacity=".4"/>`); }
  S.add(`<path d="${ell(400, 300, 150, 150)}" fill="#ece6dc"/><path d="${ell(460, 280, 150, 150)}" fill="#0c0a0e"/>`);
  S.add(`<path d="${ell(400, 300, 150, 150)}" fill="none" stroke="#d8b050" stroke-width="5" stroke-dasharray="8 6"/><path d="${ell(460, 280, 150, 150)}" fill="none" stroke="#d8b050" stroke-width="4" stroke-dasharray="4 6"/>`);
  S.add(`<path d="M0,40H800M0,560H800" stroke="#d8b050" stroke-width="8"/>`);
  vignette(S, 0.5);
  return S.out();
}

// 29 — the stone giant kneels; the stone chest opens; inside, a ball of light
function arkanHeart() {
  const S = card('siCh29Arkan', '石巨人跪下，石头的胸口打开，里面一团光', 29021);
  ground(S, 'stone', { grain: false, light: [0.5, 0.5] });
  S.add(`<path d="M120,600C130,450 180,340 260,300L300,160C320,110 480,110 500,160L540,300C620,340 670,450 680,600Z" fill="#4a4846"/>`);
  S.add(`<path d="M330,160h140l-10,70H340z" fill="#3a3836"/><path d="M360,190h20M420,190h20" stroke="#ffe8a0" stroke-width="6"/>`);
  S.add(`<path d="M320,330L400,300L480,330L470,470L400,500L330,470Z" fill="#141210"/><path d="M320,330L260,360L280,480L330,470ZM480,330L540,360L520,480L470,470Z" fill="#5a5856"/>`);
  glow(S, 400, 400, 140, '#fff0c0', 0.7);
  S.add(`<path d="${ell(400, 400, 34, 34)}" fill="#fffaf0"/>`);
  vignette(S, 0.55);
  return S.out();
}

// 30 — the last page of the ledger: the header rule 来处｜件｜往 (drawn as three ruled columns) and the entries under it
function ledgerLast() {
  const S = card('siCh30Ledger', '帐的最后一页：表头三栏，底下一行一行的记录', 30001);
  ground(S, 'wood');
  paper(S, [[170, 50], [630, 56], [624, 560], [164, 554]], { tint: '#ece0c0' });
  S.add(ledgerRules(200, 90, 400, 430, 3));
  S.add(writing(S.R, 210, 104, 110, 1, 30, { sw: 3 }) + writing(S.R, 345, 104, 110, 1, 30, { sw: 3 }) + writing(S.R, 478, 104, 110, 1, 30, { sw: 3 }));
  for (let r = 0; r < 11; r++) S.add(writing(S.R, 210, 160 + r * 32, 380, 1, 30, { sw: 2, op: 0.7, last: r === 10 ? 0.3 : 1 }));
  vignette(S, 0.5);
  return S.out();
}

// 30 — the Imperial Code opened at its first article: one line of print alone on the page, the seal under it
function codeFirst() {
  const S = card('siCh30Code', '《帝国法典》翻在第一条：整页只有一行字，底下一枚印', 30011);
  ground(S, 'stone', { grain: false });
  S.add(`<path d="M100,110C220,90 320,100 400,130C480,100 580,90 700,110L690,500C580,484 480,490 400,520C320,490 220,484 110,500Z" fill="#3a2a1a"/>`);
  S.add(`<path d="M120,120C230,104 320,112 400,140C480,112 570,104 680,120L670,486C570,472 480,478 400,506C320,478 230,472 130,486Z" fill="#f2ead6"/><path d="M400,140V506" stroke="#b8a888" stroke-width="3"/>`);
  S.add(`<path d="M450,200h180" stroke="#2a2018" stroke-width="10" stroke-linecap="round"/>`);
  seal(S, 540, 380, 50, '#b8302a', { emblem: 'none' });
  S.add(`<path d="M520,370h40M540,350v40" stroke="#5a1410" stroke-width="5"/>`);
  vignette(S, 0.5);
  return S.out();
}

// 30 — a shepherd's brass whistle on a cord
function whistle() {
  const S = card('siCh30Whistle', '一枚牧羊的铜哨，系在绳子上', 30021);
  ground(S, 'wood', { light: [0.5, 0.5] });
  S.add(`<path d="M80,80C200,200 260,240 330,280" fill="none" stroke="#8a6a40" stroke-width="8" stroke-linecap="round"/>`);
  S.add(`<path d="M320,270L560,330C600,340 610,400 570,410L330,360C300,350 296,280 320,270Z" fill="${S.lin([[0, '#f0c860'], [0.5, '#b8862a'], [1, '#6a4a14']])}"/>`);
  S.add(`<path d="${ell(330, 314, 16, 40)}" fill="#5a3a10"/><path d="M450,320h50v18h-50z" fill="#3a2408"/><path d="M360,290L540,334" stroke="#fff4c0" stroke-width="4" opacity=".7"/>`);
  vignette(S, 0.5);
  return S.out();
}

// 30 — the last frame: inside the imperial crown, the first hairline crack
function crownCrackInside() {
  const S = card('siCh30CrownCrack', '帝冠的内侧，第一道细细的裂', 30031);
  ground(S, 'night', { grain: false });
  S.add(`<path d="${ell(400, 330, 300, 170)}" fill="${S.lin([[0, '#e8e4f0'], [1, '#8a84a0']])}"/><path d="${ell(400, 350, 260, 130)}" fill="#141220"/>`);
  S.add(`<path d="M120,330L150,170L210,280L280,140L340,270L400,120L460,270L520,140L590,280L650,170L680,330" fill="none" stroke="#e8e4f0" stroke-width="14" stroke-linejoin="round"/>`);
  S.add(`<path d="M400,220L408,260L396,290L410,330L402,360" fill="none" stroke="#ffffff" stroke-width="2.4"/>`);
  glow(S, 404, 290, 30, '#ffffff', 0.5);
  vignette(S, 0.6);
  return S.out();
}

export const insertsB = {
  ch20_white_gown: whiteGown,
  ch21_dragon_well: dragonWell,
  ch22_lena_letter: lenaLetter,
  ch23_vine_faces: vineFaces,
  ch23_deeds: deeds,
  ch23_wood_ring: woodRing,
  ch24_barga: () => barga(false),
  ch24_barga_cracked: () => barga(true),
  ch25_frost_words: frostWords,
  ch25_mother_book: motherBook,
  ch25_ice_heart: iceHeart,
  ch26_contract_lamp: contractLamp,
  ch26_deeds_burning: deedsBurning,
  ch27_chain_blade: chainBlade,
  ch27_dragon_free: dragonFree,
  ch27_erased_scale: erasedScale,
  ch27_sea_rope: seaRope,
  ch27_seven_chairs: () => mirrorTable(false),
  ch27_ophelia_dragon: opheliaDragon,
  ch27_young_dragon: youngDragon,
  ch28_mirror_tables: () => mirrorTable(true),
  ch28_tracking_mirror: trackingMirror,
  ch28_shackles: shackles,
  ch29_heart_back: heartBack,
  ch29_eclipse_cloth: eclipseCloth,
  ch29_arkan_heart: arkanHeart,
  ch30_ledger_last: ledgerLast,
  ch30_code_first: codeFirst,
  ch30_whistle: whistle,
  ch30_crown_crack: crownCrackInside,
};
