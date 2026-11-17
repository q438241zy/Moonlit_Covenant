// 位图出图清单（全部交给 GPT 出图，docs/ART-LIST-GPT.md）：画风是「日本动画画师画的欧洲奇幻」——日式动漫的人物画法
// （大而有神的眼睛、干净的线稿、柔和的赛璐璐加厚涂上色），配欧洲中世纪奇幻的建筑、服饰与器物；以女主角立绘为基准：
// 先出八位女主立绘（参考旧的莉亚厚涂 PNG），其余所有图都拿女主立绘当画风参考，全套统一。
// 每个任务 = { id, group, out, size, seed, prompt, refs, label?, alpha?, target?, usage? }
//   alpha：要透明底（胸像），finalize 输出 PNG；target：游戏内尺寸（缺省按 SIZE[group]）；usage：出现在哪里（清单用）
//   refs：参考图（相对项目根目录）。第一张通常是画风参考，其余用于保持角色长相一致。
//   out：原始输出路径（tools/art/raster/out/ 下，finalize.mjs 再压缩进 public/assets/paint/）。
//   label：可选的中文说明（只用于 public/assets/paint/README.md 的清单）。
// 只要改这里的描述再重跑 generate.mjs 就能重出某一张（--only <id> --force）。
// 主线剧情的两组（story-bg / story-npc）直接由 public/story/locations.json 与 speakers.json 生成，
// public/assets/paint/README.md 的清单由 readme.mjs 从本文件生成（npm run art 的最后一步）。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARDS } from '../../../cards/database.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

// 游戏内尺寸（finalize.mjs 按此裁切压缩，与对应矢量资产同尺寸，CSS 无需改动比例）与分组说明
export const SIZE = {
  portraits: '832x1216', costumes: '832x1216', 'costumes-soft': '832x1216', 'costumes-bust': '600x800', 'costumes-bust-soft': '600x800',
  cg: '1600x900', scenes: '1600x900', cards: '512x512', boss: '1000x1000', 'story-bg': '1600x900', 'story-npc': '600x800', 'story-insert': '800x600',
};
// 要透明底的组（finalize 输出 PNG，public/paint.js 换图时用 .png）
export const ALPHA_GROUPS = new Set(['story-npc', 'costumes-bust', 'costumes-bust-soft']);
export const GROUPS = {
  portraits: { title: '女主立绘' },
  costumes: { title: '服装立绘' },
  'costumes-soft': { title: '泳装 12+ 罩衫版立绘', note: '同一件泳装外面加她自己的罩衫；内容模式 12+ 时显示。' },
  'costumes-bust': { title: '服装透明胸像', note: '委托板单位卡与类型相符的番外用；透明底 PNG。' },
  'costumes-bust-soft': { title: '泳装 12+ 罩衫版透明胸像', note: '透明底 PNG。' },
  cg: { title: '剧情 CG' },
  boss: { title: '食梦兽三阶段', note: '深色底即可，游戏内自动羽化边缘。' },
  scenes: { title: '舞台背景' },
  cards: { title: '卡面', note: '进化版沿用同一张。' },
  'story-bg': { title: '剧情场景背景（主线、番外、外传正篇）', note: '清单来自 public/story/locations.json；外传正篇复用的序章场景图在 scenes / cg 组。' },
  'story-npc': { title: '剧情胸像', note: '清单来自 public/story/speakers.json（同一文件只列一次）。透明底 PNG。' },
  'story-insert': { title: '道具特写叠图', note: '台词或叙述出现某件道具时浮在场景上的卡片；不画任何文字。' },
};

export const STYLE = [
  'Japanese anime art style drawn by a Japanese anime illustrator, set in a European medieval high-fantasy world (European architecture, armor, clothing and props)',
  'anime character design like a Japanese JRPG key visual: large expressive eyes, clean confident line art, soft cel shading blended with painterly thick-paint rendering',
  'refined adult facial features, detailed rendering of metal, leather and cloth with subtle wear',
  'cinematic moonlight, colored rim light, rich but slightly muted palette with vivid accent colors',
  'same art style, line weight, coloring and lighting as the reference images (the heroine portraits)',
  'high detail, no text, no letters, no watermark, no signature, no logo',
].join(', ');

export const NEGATIVE = 'text, watermark, signature, logo, chibi, child, loli, nsfw, cleavage, revealing clothes, swimsuit, lingerie, lowres, blurry, extra fingers, deformed hands, bad anatomy';
// 泳装（服装稿 §4.3）：只拿掉 swimsuit 与 revealing，裸露、透视、特写与低龄相关的词保留并加强
export const NEGATIVE_SWIMSUIT = 'text, watermark, signature, logo, chibi, child, loli, minor, teen, nsfw, nude, nipples, see-through, transparent fabric, wet see-through, cleavage, underboob, lingerie, close-up on chest, close-up on body, low angle, high angle, suggestive pose, lowres, blurry, extra fingers, deformed hands, bad anatomy';

// 旧的四张厚涂 PNG（带 AIGC 标识）：集成步骤 I1 已把它们从 public/assets/ 移到 tools/art/raster/ref/（只作出图参考，
// 不随站点发布；站点用 compress-legacy.mjs 压出的 public/assets/*.jpg）
export const legacyRef = (file) => `tools/art/raster/ref/${file}`;
const STYLE_REF = legacyRef('lia.png');

// 外观与 设定集/03（正典）及 game/gacha.mjs 一致；全部为成年女性（18–19 岁）。银轨号是 IF 外传，
// 外传专用的身份（赤誓骑士、月蚀观测者……）不进提示词（audit B1/B15）；莉亚一律带塔盾「赤誓」（B10）。
// ref 是旧厚涂 PNG：只作画风/长相参考——它们是外传时期的造型（莉亚没有塔盾），所以八张立绘都要按正典重出。
export const HEROINES = {
  lia: { ref: legacyRef('lia.png'), look: '19-year-old young adult woman shield fighter from the Crimson Flame kingdom, high tight crimson ponytail with a near-black dark red streak on the left, amber-gold eyes, thin scar under the right eye through the brow tail, restrained determined expression, matte silver and dark crimson light armor with worn edges, battle notch on the left pauldron, cracked glowing gold oath crystal on the chest, scorched cape lining, a large oxblood-red tower shield "Chishi" with an iron rim, a riveted repair plate and a stapled crack slung on her back so its top corner rises behind her left shoulder, slender longsword "Duanzhang" with a re-riveted ring guard', bg: 'gothic arched window with a blood-red moon, drifting embers', rim: 'warm crimson rim light' },
  mia: { ref: legacyRef('mia.png'), look: '18-year-old young adult woman magic-tool inventor from the Goldforge federation, petite, short choppy self-cut cyan-blue hair with neon gradient tips, wrench-shaped hair clip on the right, mechanical cat-ear receivers made of matte titanium with circuit traces, a glowing cyan indicator ring and tiny antennae, bright cyan eyes with a faint circuit glint, tiny mole on the nose tip, bright curious grin, oversized dark grey ripstop work jacket with glowing cyan circuit seams, sleeves past the hands, tool belt pouches, holding the multi-function magitech rod "Dingdang No.3", small spherical drone "Zero" with label stickers hovering by her shoulder', bg: 'workshop with blueprint grid glow and circuit traces', rim: 'cool cyan rim light' },
  serena: { ref: legacyRef('serena.png'), look: '19-year-old young adult woman dark mage of the Nox family of the Night Raven duchy, very long silky straight purple-black hair fading to moon-white at the tips, thin braid on the left threaded with a tiny silver moon-phase disc ornament, pale violet eyes with fine star-track lines in the iris, calm half-lidded scrutinizing look, matte velvet purple-black robe with silver geometric seal embroidery on shoulders and cuffs, pendant shaped like a closed silver eyelid, white half-glove on the right hand, obsidian staff "Sleepless Mirror" with a dark mirror-glass head', bg: 'eclipse moon and faint star-chart rings', rim: 'violet rim light' },
  freya: { ref: null, look: '19-year-old young adult woman ice mage, tall and graceful, long flowing wavy cyan-blue hair with an ice-crystal hair comb, warm amber eyes, gentle warm smile with calm eyes, layered northern robes with a white fur-collar shawl, ice-crystal accessories, crystalline staff topped with a snowflake orb', bg: 'aurora over a snowfield, light snowfall', rim: 'pale ice-blue rim light' },
  lilith: { ref: null, look: '19-year-old young adult woman assassin, long golden hair tied in a high ponytail, sharp golden eyes, competitive confident smirk, small bandage across the nose bridge, sleek black and gold light armor with a one-sided short cape, hood down behind the neck, twin dagger hilts visible behind the shoulders, feline agile posture', bg: 'moonlit rooftops of a gothic city with purple shadow wisps', rim: 'violet rim light' },
  evelyn: { ref: null, look: '18-year-old young adult woman priestess, pale gold almost white long hair in a loose side braid with a small prayer bell, star-blue eyes, gentle shy expression with a tentative small smile, winged silver circlet, white and gold priestess dress adapted into light travel dress-armor, star-shaped pendant', bg: 'cathedral interior with stained-glass light rays', rim: 'soft golden rim light' },
  ophelia: { ref: null, look: '19-year-old young adult woman dragon priestess, long wild copper-red hair, a pair of small dragon horns at the temples, heterochromia with a gold left eye and a violet right eye, playful grin showing one small fang, ancient priestess attire with deep blue dragon-scale armor pieces and silver trims, dragon-claw ornaments', bg: 'volcanic ancient dragon ruins with drifting embers', rim: 'pink-magenta rim light' },
  aila: { ref: null, look: '18-year-old young adult woman holy knight, golden shoulder-length bob hair, bright blue eyes, open confident cheerful smile, blue and gold light knight armor, short cape lined with a black-gold family crest, radiant longsword hilt over the shoulder, facial resemblance to her older sister Lilith', bg: 'golden holy light rays in a white stone hall', rim: 'warm golden rim light' },
};

// 服装稿第一套（剧本/README_轉蛋服裝設計.md §2–§3）+ 典藏四类 + 赠品度假装；每人的剪裁与道具见 tools/art/portrait/outfits/*.mjs
const OUTFITS = {
  swimsuit: 'wearing a tasteful opaque swimsuit in her own cut (one-piece racer, tankini, ruffled off-shoulder one-piece or a sporty high-neck bikini top with a modest high front), a few water drops on the hair tips and shoulders, holding her own beach prop, moonlit seaside with glowing surf and a far lighthouse, the face is the focus',
  wedding: 'wearing a sample wedding-themed gown at a fitting in a dress shop, modest high or bateau neckline, opaque lace, the veil pinned at the back and never over the face, a small bouquet, glass-arched dress shop with a floor mirror frame and bolts of cloth at night, no ring, no groom, no altar',
  office: 'parallel-world modern office look: blazer over a shirt with a tie or bow, a staff ID card on a lanyard (no readable text), holding an office item, city skyline at night with lit window grids',
  maid: 'wearing a stylised inn or café waitress uniform (long-sleeved classic, short puff-sleeved café or rolled-sleeve work cut), white apron, frilled headband, high collar, holding a tea-service item, warm inn interior at night',
  sportwear: 'wearing a cotton crew-neck short-sleeved training tee with a race bib showing her emblem instead of a number, a headband or towel, holding a training prop, a knights\' training ground at night with torches and pennants',
  newyear: 'wearing a red and gold qipao-inspired jacket with mandarin collar, frog buttons, gold cloud embroidery and a small fur collar, plum-blossom hairpin, red lanterns and fireworks in the background',
  christmas: 'wearing a red velvet hooded capelet with white fur trim and a gold clasp over a dark dress, holly sprig in the hair, snowy night with bokeh lights background',
  duanwu: 'wearing a hanfu-inspired cross-collar outfit in jade green and white with dragon-boat wave pattern trim and a five-colour silk cord bracelet, riverside with dragon boats background',
  anniversary: 'wearing an elegant white and gold gala gown with a modest high neckline, gold embroidery, star sash and a small tiara, grand ballroom with chandeliers background',
  resort: 'wearing a light summer sundress with a thin cardigan and a flower clip, palm fronds and a night sea in the background',
};

const HEROINE_IDS = new Set(Object.keys(HEROINES));
const portraitRef = (id) => `tools/art/raster/out/portraits/${id}.png`; // 新出的正典立绘（旧 PNG 只是立绘本身的参考）
// 除了八张立绘，其余所有图的第一张参考都是新出的莉亚立绘：画风、线稿与上色都以女主立绘为准
const HEROINE_STYLE = portraitRef('lia');

const jobs = [];

// 1) 八位女主的立绘（旧的莉亚/米娅/塞雷娜 PNG 是外传时期的造型，只作参考，同样要重出）
for (const [id, h] of Object.entries(HEROINES)) {
  jobs.push({
    id: `portrait-${id}`, group: 'portraits', existing: false,
    out: `tools/art/raster/out/portraits/${id}.png`, size: '1024x1536', seed: 1000 + jobs.length,
    prompt: `${STYLE}. Upper body portrait in 3/4 view of ${h.look}. Background: ${h.bg}, dark and atmospheric. ${h.rim}.`,
    refs: [STYLE_REF, ...(h.ref && h.ref !== STYLE_REF ? [h.ref] : [])],
    usage: '召唤、换衣间、委托板绝技切入；后面所有图的画风参考',
  });
}

// 2) 80 套服装立绘：参考该女主的立绘保持同一张脸（泳装另用 NEGATIVE_SWIMSUIT，并同时出 12+ 罩衫版）
for (const id of Object.keys(HEROINES)) {
  for (const [type, outfit] of Object.entries(OUTFITS)) {
    jobs.push({
      id: `costume-${id}-${type}`, group: 'costumes', after: [`portrait-${id}`],
      out: `tools/art/raster/out/costumes/${id}_${type}.png`, size: '1024x1536', seed: 2000 + jobs.length,
      prompt: `${STYLE}. The same character as the second reference image (same face, eyes, hair and head accessories), upper body portrait in 3/4 view, ${outfit}. ${HEROINES[id].rim}.`,
      refs: [portraitRef(id)],
      usage: '召唤结果、换衣间、服饰池卡面',
      ...(type === 'swimsuit' ? { negative: NEGATIVE_SWIMSUIT } : {}),
    });
  }
}

// 2b) 泳装的 12+ 罩衫版（服装稿 §1.3）：同一件泳装外面加她自己的罩衫，以泳装那张为参考
for (const id of Object.keys(HEROINES)) {
  jobs.push({
    id: `costume-soft-${id}`, group: 'costumes-soft', after: [`costume-${id}-swimsuit`],
    out: `tools/art/raster/out/costumes-soft/${id}_swimsuit.png`, size: '1024x1536', seed: 2600 + jobs.length,
    prompt: `${STYLE}. Exactly the same character, pose, swimsuit and seaside scene as the reference image, but she now wears her own light opaque cover-up over the swimsuit (an open beach shirt, a hooded rash-guard jacket or a long wrap skirt with a short cardigan, in her colors), covering the shoulders and hips, modest and cheerful. ${HEROINES[id].rim}.`,
    refs: [`tools/art/raster/out/costumes/${id}_swimsuit.png`, portraitRef(id)],
    usage: '内容模式 12+ 时替换泳装立绘',
  });
}

// 2c) 服装透明胸像（600×800；委托板单位卡、类型相符的番外）：以该服装立绘为参考，透明底
for (const id of Object.keys(HEROINES)) {
  for (const type of [...Object.keys(OUTFITS), 'swimsuit-soft']) {
    const soft = type === 'swimsuit-soft';
    const costume = soft ? `tools/art/raster/out/costumes-soft/${id}_swimsuit.png` : `tools/art/raster/out/costumes/${id}_${type}.png`;
    jobs.push({
      id: `bust-${id}-${type}`, group: soft ? 'costumes-bust-soft' : 'costumes-bust', alpha: true,
      after: [soft ? `costume-soft-${id}` : `costume-${id}-${type}`],
      out: `tools/art/raster/out/${soft ? 'costumes-bust-soft' : 'costumes-bust'}/${id}_${soft ? 'swimsuit' : type}.png`, size: '1024x1536', seed: 2800 + jobs.length,
      prompt: `${STYLE}. Bust portrait (head to chest, facing the viewer at 3/4) of exactly the same character in exactly the same outfit as the reference image, on a fully transparent background with no backdrop, no floor and no scenery, clean silhouette edges.`,
      refs: [costume],
      usage: soft ? '12+ 时委托板与海边番外的泳装胸像' : '委托板单位卡；类型相符的番外里她说话时的胸像',
      ...(type === 'swimsuit' ? { negative: NEGATIVE_SWIMSUIT } : {}),
    });
  }
}

// 3) 10 张剧情 CG（与 game/content.mjs CG_GALLERY 对应）
const PARTY = [legacyRef('lia.png'), legacyRef('mia.png'), legacyRef('serena.png')];
const BOSS = 'tools/art/raster/ref/dream-eater.png'; // 旧的厚涂 Boss 图，只作参考图，不再随站点发布
const TRAIN = 'aboard the armoured sleeper train "Silver Rail" during a lunar eclipse: dark teal-grey riveted metal walls, brass fixtures, arched windows, warm amber wall lamps, red emergency lights';
const CG = [
  // [文件名, 画面描述, 参考图, 是否在列车内]
  ['intro-eye', 'A train compartment; three young women seen from behind in silhouette with colored rim light (crimson-haired shield fighter with a tower shield on her back, cyan-haired girl with mechanical cat ears, long purple-black-haired mage) face a huge window completely filled by a giant single eye with a nebula iris; frost creeping from the window frame', [...PARTY, BOSS], true],
  ['camp-fire', 'Warm dim dining car, lamplight on a small table: the crimson-haired shield fighter (tower shield leaning by her chair) knocks the table with her sword pommel, the cyan-haired cat-ear engineer tinkers with a small spherical drone, the calm purple-haired mage holds a cup of tea; the eclipse visible through the windows', PARTY, true],
  ['corridor-frost', 'A long tilted train corridor coated in pale lilac memory frost whose crystal facets show tiny warm vignettes of strangers\' lives, flickering emergency lights, a gloved hand touching the frost releasing a warm glowing memory', [], true],
  ['battle-descend', 'The carriage roof torn open; a colossal whale-like creature with moth-like feathery antennae, deep-sea lure lights, one giant eye and translucent memory-shard scales descends from a black rift in the eclipse sky; the three heroines brace below', [...PARTY, BOSS], true],
  ['battle-phase2', 'The whale-like memory devourer wails as its translucent scales shatter into thousands of firefly-like warm memory fragments swirling over the train', [BOSS], false],
  ['battle-phase3', 'Close-up of the creature\'s fully opened giant eye with a frozen nebula iris; at the tip of one feathery antenna a tiny warm glowing vignette of a child reaching out for its mother', [BOSS], false],
  ['aftermath-snow', 'Quiet aftermath in the ruined carriage, glowing memory fragments falling like snow; the crimson-haired shield fighter, tower shield on her back, catches one fragment in her gauntlet, melancholic', [legacyRef('lia.png')], true],
  ['ending-seal', 'Four threads of light (crimson, cyan, violet and silver) weave into a key that closes a seal around the Dawn Seed, a glowing pearl-gold seed crystal inside tilted orbit rings; four silhouettes raise their hands', PARTY, false],
  ['ending-share', 'The Dawn Seed bursts with dawn light over a vast valley with silver rails and the stopped train; countless memory lights rise from distant towns; four small silhouettes on a hill', [], false],
  ['ending-destroy', 'A gloved hand lets the Dawn Seed crumble into ash and embers under an endless eclipse night, melancholic', [], false],
];
for (const [name, scene, refs, onTrain] of CG) {
  jobs.push({
    id: `cg-${name}`, group: 'cg', out: `tools/art/raster/out/cg/${name}.png`, size: '1920x1080', seed: 3000 + jobs.length,
    prompt: `${STYLE}. Cinematic wide 16:9 story illustration. ${onTrain ? `Setting: ${TRAIN}. ` : ''}${scene}.`,
    refs: [HEROINE_STYLE, ...refs.filter((r) => r !== STYLE_REF).map((r) => (r === legacyRef('lia.png') ? portraitRef('lia') : r === legacyRef('mia.png') ? portraitRef('mia') : r === legacyRef('serena.png') ? portraitRef('serena') : r))].filter((r, i, a) => a.indexOf(r) === i),
    after: ['portrait-lia', 'portrait-mia', 'portrait-serena'],
    usage: '外传 CG 图库与序章演出',
  });
}

// 4) Boss 三阶段（深色背景，游戏内用径向遮罩羽化边缘）
const BOSS_PHASES = [
  'complete form: colossal ancient whale-like creature arching like a crescent moon, moth-like dusty feathery antennae, deep-sea anglerfish lure lights, one huge sorrowful eye taking two thirds of the head with moon-phase eyelids and a swirling nebula iris, translucent memory-shard scales with warm film-grain edges, tiny glowing glyph fragments drifting near its mouth',
  'armor broken: the same creature with shattered and missing scales, abyss-blue light glowing through cracks, warm memory fragments pouring out like fireflies, eye wide and bloodshot violet',
  'sealed: the same creature bound by elegant silver moonlight seal rings, eyelid half-closed in a mournful way, colors draining to moon-white, a single warm fragment showing a child silhouette kept at an antenna tip',
];
BOSS_PHASES.forEach((desc, i) => jobs.push({
  id: `boss-${i + 1}`, group: 'boss', out: `tools/art/raster/out/boss/dream-eater-${i + 1}.png`, size: '1024x1024', seed: 4000 + i,
  prompt: `${STYLE}. Full-body creature design centered on a plain very dark navy background, tragic and sublime, ${desc}.`,
  refs: [HEROINE_STYLE, BOSS],
  after: ['portrait-lia'],
  usage: '外传序章 Boss 战（按血量换三阶段）',
}));

// 5) 舞台背景
const SCENES = [
  ['battle-bg', `${TRAIN}; a carriage interior with its roof torn open to the eclipse sky, debris and memory frost, red emergency light versus moon-white light, the center kept darker and empty for a monster to float in, no characters`],
  ['camp-bg', `${TRAIN}; the warm dim dining car with amber lamps and arched windows showing the eclipse outside, soft focus, low contrast, no characters`],
  ['ending-bg', 'Dawn breaking at the horizon over silver rails and a stopped armoured train in a wide plain, the eclipse corona fading in the sky, soft light, calm, no characters'],
];
SCENES.forEach(([name, desc], i) => jobs.push({
  id: `scene-${name}`, group: 'scenes', out: `tools/art/raster/out/scenes/${name}.png`, size: '1920x1080', seed: 5000 + i,
  prompt: `${STYLE}. Wide 16:9 background painting, ${desc}.`,
  refs: [HEROINE_STYLE],
  after: ['portrait-lia'],
  usage: '外传序章舞台；外传正篇也复用（餐车、撕裂的车顶、黎明的铁轨）',
}));

// 6) 38 张卡面：画面主体按卡名/效果描述
const CARD_SUBJECT = {
  n_wisp: 'a tiny glowing will-o-wisp spirit with translucent wings above moonlit flowers',
  n_goblin: 'a sly green goblin in a hood grinning and clutching a stolen gold coin, more goblin eyes glowing in the dark',
  n_merchant: 'a weathered travelling merchant with a wide hat, lantern and backpack, holding up a card with a knowing smile',
  n_knight: 'a heavily armoured knight in steel plate with a plumed helm, sword raised before him',
  n_golem: 'a massive stone golem with a glowing blue crystal core, standing like a wall',
  n_troll: 'a hulking troll warrior with a spiked wooden club and tusks',
  n_angel: 'a serene guardian angel with great white wings and a halo, hands holding a warm healing light',
  n_dragon: 'an ancient dragon breathing a torrent of pale fire across the night',
  lia_recruit: 'a young shield squire in red and silver holding a large round shield, determined',
  lia_shieldbash: 'a crimson-and-silver tower shield slamming forward with a burst of sparks and an impact shockwave',
  lia_flameguard: 'a knight in dark armor behind a shield wreathed in a wall of flames',
  lia_rally: 'a crimson war banner with a gold crest raised high above cheering soldiers',
  lia_charger: 'a crimson knight charging forward with a flaming sword, red cape streaming',
  lia_bulwark: 'a towering armored defender with a huge red tower shield bearing a gold crystal emblem',
  lia_captain: 'a silver-haired knight captain pointing his sword forward, crimson cape, leading the charge',
  lia_flamestrike: 'a sword plunging down in a pillar of crimson fire exploding on impact',
  lia_fortress: 'the Hest family fortress, a crimson-roofed castle on a cliff under a full moon',
  lia_hero: 'the crimson-haired knight Lia with her high ponytail, swinging her slender sword in a ring of fire, gold oath crystal glowing on her chest',
  lilith_dagger: 'a poisoned dagger dripping green venom, glinting in violet shadow',
  lilith_strike: 'a silent violet blade slash cutting through darkness',
  lilith_apprentice: 'a hooded young assassin apprentice with a masked face and a dagger, glowing eyes in the shadows',
  lilith_poison: 'a short blade with a green serpent coiled around it, venom glowing',
  lilith_shadowdance: 'a dancer-like assassin spinning with twin blades leaving violet arcs of shadow',
  lilith_assassin: 'a Valhalla assassin in black and gold leaping from a rooftop, dagger ready',
  lilith_shadowarrow: 'a violet arrow of pure shadow streaking toward a target with a starburst',
  lilith_nightblade: 'a ranger silhouetted against a huge moon, curved blade drawn, night wind in the cloak',
  lilith_shadowlord: 'a crowned lord made of living shadow with glowing violet eyes, commanding lesser shadows',
  lilith_hero: 'the blonde assassin Lilith with her high ponytail, twin daggers crossed, violet shadow magic swirling around her',
  serena_acolyte: 'a robed eclipse acolyte reading a glowing tome under crescent moons',
  serena_darkbolt: 'a bolt of corrosive dark energy spiraling into a black void',
  serena_observer: 'a giant floating eye inside silver orbital rings, gazing into the abyss',
  serena_drain: 'a silver chalice drawing a ribbon of crimson life energy through the air',
  serena_oracle: 'a veiled silver-haired oracle with moon phases floating above her open hands',
  serena_void: 'a black hole with a glowing ring swallowing light and debris',
  serena_nova: 'a dark moon eclipse exploding into a nova of violet light rays',
  serena_devourer: 'an abyssal serpentine creature with a gaping toothed maw rising from a dark portal',
  serena_seal: 'an intricate glowing silver seal circle with chains locking in a burst of moonlight',
  serena_hero: 'the purple-black-haired mage Serena with her moon-phase hair ornament, raising a gloved hand as a void moon forms behind her',
};
const CLASS_TONE = { neutral: 'moonlit silver and steel-blue night palette', lia: 'crimson and gold palette, flames and embers', lilith: 'violet and black-gold palette, smoke and shadows', serena: 'indigo and purple palette, void, moons and stars' };
const HERO_REF = { lia_hero: portraitRef('lia'), serena_hero: portraitRef('serena'), lilith_hero: portraitRef('lilith') };
for (const card of CARDS) {
  const subject = CARD_SUBJECT[card.id];
  if (!subject) throw new Error(`manifest: missing card subject for ${card.id}`);
  jobs.push({
    id: `card-${card.id}`, group: 'cards', after: ['portrait-lia', ...(HERO_REF[card.id] ? [`portrait-${card.id.split('_')[0]}`] : [])],
    out: `tools/art/raster/out/cards/${card.id}.png`, size: '1024x1024', seed: 6000 + jobs.length,
    prompt: `${STYLE}. Square trading-card illustration, centered dramatic composition with a soft dark vignette, no card frame, ${CLASS_TONE[card.class]}: ${subject}.`,
    refs: [HEROINE_STYLE, ...(HERO_REF[card.id] && HERO_REF[card.id] !== HEROINE_STYLE ? [HERO_REF[card.id]] : [])],
    usage: '卡牌对战（实验模式）卡面',
  });
}

// 7) 主线剧情：每个 locations.json 场景一张背景，speakers.json 里每个 /assets/story/npc/ 胸像一张（按文件去重，
//    lia 与 lia_unknown 共用 lia）。画面描述取矢量版的 aria-label，保持构图与内容一致。
const svgLabel = (rel) => {
  const file = path.join(root, 'public', rel);
  const m = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').match(/aria-label="([^"]*)"/) : null;
  return m ? m[1] : '';
};
const STORY_WORLD = 'European medieval low-fantasy world, no text';
// 每个场景、每个说话人出现在哪几章（主线 chNNN、番外 exNNN、外传正篇 gNNN），清单里按这个排优先级
const usageIndex = (() => {
  const bg = new Map(), who = new Map();
  const add = (map, key, ch) => { if (!map.has(key)) map.set(key, new Set()); map.get(key).add(ch); };
  const dirs = [['public/story/chapters', /^ch\d{3}\.json$/], ['public/story/extras', /^ex\d{3}\.json$/], ['public/gaiden', /^g\d{3}\.json$/]];
  for (const [dir, re] of dirs) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs).filter((n) => re.test(n)).sort()) {
      const id = f.replace('.json', '');
      const walk = (o) => {
        if (Array.isArray(o)) return o.forEach(walk);
        if (!o || typeof o !== 'object') return;
        if (typeof o.bg === 'string') add(bg, o.bg, id);
        if (o.t === 'say' && typeof o.who === 'string') add(who, o.who, id);
        if (typeof o.insert === 'string') add(bg, `insert:${o.insert}`, id);
        Object.values(o).forEach(walk);
      };
      walk(JSON.parse(fs.readFileSync(path.join(abs, f), 'utf8')).shots);
    }
  }
  return { bg, who };
})();
const usageText = (set) => (set && set.size ? [...set].join(' ') : '（暂无章节使用）');
for (const [id, loc] of Object.entries(readJson('public/story/locations.json'))) {
  // 外传正篇复用的旧场景图（public/assets/scenes、cg）已经在上面的 scenes / cg 组里，不再重复出
  if (!String(loc.svg || '').startsWith('/assets/story/bg/')) continue;
  jobs.push({
    id: `story-bg-${id}`, group: 'story-bg', label: loc.name, out: `tools/art/raster/out/story-bg/${id}.png`, size: '1920x1080', seed: 7000 + jobs.length,
    // 番外十（IF）的现代办公室与商场：平行现代，不套欧洲中世纪
    prompt: `${STYLE}. Wide 16:9 story background painting, ${id.startsWith('if-modern') ? 'parallel-world modern-day city (an IF side story), contemporary interior, no text, no logos' : STORY_WORLD}, no characters in focus. Scene: ${svgLabel(loc.svg) || loc.name}.`,
    refs: [HEROINE_STYLE], after: ['portrait-lia'],
    usage: usageText(usageIndex.bg.get(id)),
  });
}
const busts = new Map();
for (const [sid, sp] of Object.entries(readJson('public/story/speakers.json'))) {
  const m = typeof sp.art === 'string' && sp.art.match(/^\/assets\/story\/npc\/([\w-]+)\.svg$/);
  if (m && (!busts.has(m[1]) || sid === m[1])) busts.set(m[1], { sid, sp }); // the speaker named like the file wins (lia over lia_unknown)
}
for (const [name, { sp }] of busts) {
  jobs.push({
    id: `story-npc-${name}`, group: 'story-npc', label: sp.name.replace('{PLAYER_NAME}', '亚克'), out: `tools/art/raster/out/story-npc/${name}.png`, size: '1024x1365', seed: 8000 + jobs.length,
    prompt: `${STYLE}. Bust portrait (head and shoulders, facing the viewer at 3/4) on a fully transparent background with no backdrop, ${STORY_WORLD}: ${svgLabel(sp.art) || sp.name}.`,
    alpha: true,
    refs: [HEROINE_STYLE, ...(HEROINE_IDS.has(name.split('_')[0]) && name.split('_')[0] !== 'lia' ? [portraitRef(name.split('_')[0])] : [])],
    after: ['portrait-lia', ...(HEROINE_IDS.has(name.split('_')[0]) ? [`portrait-${name.split('_')[0]}`] : [])],
    usage: usageText(new Set(Object.entries(readJson('public/story/speakers.json')).filter(([, v]) => v.art === sp.art).flatMap(([k]) => [...(usageIndex.who.get(k) || [])]))),
  });
}

// 8) 道具特写叠图（800×600，tools/art/story/inserts.mjs 的矢量版）：不画任何文字，字由台词交代
const insertDir = path.join(root, 'public/assets/story/insert');
for (const f of fs.existsSync(insertDir) ? fs.readdirSync(insertDir).filter((n) => n.endsWith('.svg')).sort() : []) {
  const name = f.replace('.svg', '');
  jobs.push({
    id: `insert-${name}`, group: 'story-insert', out: `tools/art/raster/out/story-insert/${name}.png`, size: '1536x1024', seed: 9000 + jobs.length,
    prompt: `${STYLE}. Close-up still-life illustration of a single prop on a dark softly lit surface, centered, ${STORY_WORLD}, any writing on paper is shown only as illegible scribble lines, absolutely no readable letters: ${svgLabel(`/assets/story/insert/${f}`) || name}.`,
    refs: [HEROINE_STYLE], after: ['portrait-lia'],
    usage: usageText(usageIndex.bg.get(`insert:${name}`)),
  });
}

export const JOBS = jobs;

// GPT 出图（gpt-image）只给三种尺寸：竖图 1024x1536、横图 1536x1024、方图 1024x1024；finalize.mjs 再裁成游戏尺寸
export const gptSize = (size) => {
  const [w, h] = String(size).split('x').map(Number);
  return w > h ? '1536x1024' : w < h ? '1024x1536' : '1024x1024';
};
// GPT 没有单独的负面提示词：把「避免」并进提示词
export const gptPrompt = (job) => `${job.prompt} Avoid: ${job.negative || NEGATIVE}.`;
