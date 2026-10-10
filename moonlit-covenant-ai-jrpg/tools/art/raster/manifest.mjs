// 厚涂位图出图清单：画风统一参照 public/assets/lia.png（赤红高马尾那张）。
// 每个任务 = { id, group, out, size, seed, prompt, refs }
//   refs：参考图（相对项目根目录）。第一张通常是画风参考，其余用于保持角色长相一致。
//   out：原始输出路径（tools/art/raster/out/ 下，finalize.mjs 再压缩进 public/assets/paint/）。
// 只要改这里的描述再重跑 generate.mjs 就能重出某一张（--only <id> --force）。

import { CARDS } from '../../../cards/database.mjs';

export const STYLE = [
  'semi-realistic anime illustration, painterly thick-paint (impasto) digital painting with visible brush strokes',
  'Japanese dark-fantasy JRPG key art, refined mature facial features, sharp expressive eyes',
  'detailed material rendering of metal, leather and cloth with wear and scratches',
  'dramatic side moonlight, colored rim light, deep shadows, muted desaturated palette with rich accent colors',
  'same art style, brushwork, lighting and color grading as the reference image',
  'high detail, masterpiece, no text, no watermark, no signature, no logo',
].join(', ');

export const NEGATIVE = 'text, watermark, signature, logo, chibi, child, loli, nsfw, cleavage, revealing clothes, swimsuit, lingerie, lowres, blurry, extra fingers, deformed hands, bad anatomy';

const STYLE_REF = 'public/assets/lia.png';

// 外观与 设定集/03 及 game/gacha.mjs 一致；全部为成年女性（18–19 岁）
export const HEROINES = {
  lia: { ref: 'public/assets/lia.png', look: '19-year-old young adult woman knight, high tight crimson ponytail with a near-black dark red streak on the left, amber-gold eyes, thin scar under the right eye through the brow tail, restrained determined expression, matte silver and dark crimson light armor with worn edges, battle notch on the left pauldron, cracked glowing gold oath crystal on the chest, scorched cape lining, slender longsword with a ring guard', bg: 'gothic arched window with a blood-red moon, drifting embers', rim: 'warm crimson rim light' },
  mia: { ref: 'public/assets/mia.png', look: '18-year-old young adult woman engineer, petite, short choppy self-cut cyan-blue hair with neon gradient tips, wrench-shaped hair clip on the right, mechanical cat-ear receivers made of matte titanium with circuit traces, a glowing cyan indicator ring and tiny antennae, bright cyan eyes with a faint circuit glint, tiny mole on the nose tip, bright curious grin, oversized dark grey ripstop work jacket with glowing cyan circuit seams, sleeves past the hands, tool belt pouches, small spherical drone with label stickers hovering by her shoulder', bg: 'workshop with blueprint grid glow and circuit traces', rim: 'cool cyan rim light' },
  serena: { ref: 'public/assets/serena.png', look: '19-year-old young adult woman astronomer mage, very long silky straight purple-black hair fading to moon-white at the tips, thin braid on the left threaded with a tiny silver moon-phase disc ornament, pale violet eyes with fine star-track lines in the iris, calm half-lidded scrutinizing look, matte velvet purple-black robe with silver geometric seal embroidery on shoulders and cuffs, pendant shaped like a closed silver eyelid, white half-glove on the right hand', bg: 'eclipse moon and faint star-chart rings', rim: 'violet rim light' },
  freya: { ref: null, look: '19-year-old young adult woman ice mage, tall and graceful, long flowing wavy cyan-blue hair with an ice-crystal hair comb, warm amber eyes, gentle warm smile with calm eyes, layered northern robes with a white fur-collar shawl, ice-crystal accessories, crystalline staff topped with a snowflake orb', bg: 'aurora over a snowfield, light snowfall', rim: 'pale ice-blue rim light' },
  lilith: { ref: null, look: '19-year-old young adult woman assassin, long golden hair tied in a high ponytail, sharp golden eyes, competitive confident smirk, small bandage across the nose bridge, sleek black and gold light armor with a one-sided short cape, hood down behind the neck, twin dagger hilts visible behind the shoulders, feline agile posture', bg: 'moonlit rooftops of a gothic city with purple shadow wisps', rim: 'violet rim light' },
  evelyn: { ref: null, look: '18-year-old young adult woman priestess, pale gold almost white long hair in a loose side braid with a small prayer bell, star-blue eyes, gentle shy expression with a tentative small smile, winged silver circlet, white and gold priestess dress adapted into light travel dress-armor, star-shaped pendant', bg: 'cathedral interior with stained-glass light rays', rim: 'soft golden rim light' },
  ophelia: { ref: null, look: '19-year-old young adult woman dragon priestess, long wild copper-red hair, a pair of small dragon horns at the temples, heterochromia with a gold left eye and a violet right eye, playful grin showing one small fang, ancient priestess attire with deep blue dragon-scale armor pieces and silver trims, dragon-claw ornaments', bg: 'volcanic ancient dragon ruins with drifting embers', rim: 'pink-magenta rim light' },
  aila: { ref: null, look: '18-year-old young adult woman holy knight, golden shoulder-length bob hair, bright blue eyes, open confident cheerful smile, blue and gold light knight armor, short cape lined with a black-gold family crest, radiant longsword hilt over the shoulder, facial resemblance to her older sister Lilith', bg: 'golden holy light rays in a white stone hall', rim: 'warm golden rim light' },
};

const OUTFITS = {
  newyear: 'wearing a red and gold qipao-inspired jacket with mandarin collar, frog buttons, gold cloud embroidery and a small fur collar, plum-blossom hairpin, red lanterns and fireworks in the background',
  maid: 'wearing a modest classic black dress with a white high collar, white apron with lace edge and puff shoulders, frilled headband, warm café interior background',
  christmas: 'wearing a red velvet hooded capelet with white fur trim and a gold clasp over a dark dress, holly sprig in the hair, snowy night with bokeh lights background',
  duanwu: 'wearing a hanfu-inspired cross-collar outfit in jade green and white with dragon-boat wave pattern trim and a five-colour silk cord bracelet, riverside with dragon boats background',
  anniversary: 'wearing an elegant white and gold gala gown with a modest high neckline, gold embroidery, star sash and a small tiara, grand ballroom with chandeliers background',
  swimsuit: 'wearing a light summer sundress with a thin cardigan and a small straw-hat pin, seaside train window and bright summer light background',
};

const portraitRef = (id) => HEROINES[id].ref || `tools/art/raster/out/portraits/${id}.png`;

const jobs = [];

// 1) 五位缺少厚涂立绘的女主（莉亚/米娅/塞蕾娜已有 PNG，可用 --include-existing 一并重出）
for (const [id, h] of Object.entries(HEROINES)) {
  jobs.push({
    id: `portrait-${id}`, group: 'portraits', existing: Boolean(h.ref),
    out: `tools/art/raster/out/portraits/${id}.png`, size: '1024x1536', seed: 1000 + jobs.length,
    prompt: `${STYLE}. Upper body portrait in 3/4 view of ${h.look}. Background: ${h.bg}, dark and atmospheric. ${h.rim}.`,
    refs: [STYLE_REF],
  });
}

// 2) 48 套服装立绘：参考该女主的立绘保持同一张脸
for (const id of Object.keys(HEROINES)) {
  for (const [type, outfit] of Object.entries(OUTFITS)) {
    jobs.push({
      id: `costume-${id}-${type}`, group: 'costumes', after: [`portrait-${id}`],
      out: `tools/art/raster/out/costumes/${id}_${type}.png`, size: '1024x1536', seed: 2000 + jobs.length,
      prompt: `${STYLE}. The same character as the second reference image (same face, eyes, hair and head accessories), upper body portrait in 3/4 view, ${outfit}. ${HEROINES[id].rim}.`,
      refs: [STYLE_REF, portraitRef(id)],
    });
  }
}

// 3) 10 张剧情 CG（与 game/content.mjs CG_GALLERY 对应）
const PARTY = ['public/assets/lia.png', 'public/assets/mia.png', 'public/assets/serena.png'];
const BOSS = 'public/assets/dream-eater.png';
const TRAIN = 'aboard the armoured sleeper train "Silver Rail" during a lunar eclipse: dark teal-grey riveted metal walls, brass fixtures, arched windows, warm amber wall lamps, red emergency lights';
const CG = [
  // [文件名, 画面描述, 参考图, 是否在列车内]
  ['intro-eye', 'A train compartment; three young women seen from behind in silhouette with colored rim light (crimson-haired knight, cyan-haired girl with mechanical cat ears, long purple-black-haired mage) face a huge window completely filled by a giant single eye with a nebula iris; frost creeping from the window frame', [...PARTY, BOSS], true],
  ['camp-fire', 'Warm dim dining car, lamplight on a small table: the crimson-haired knight knocks the table with her sword pommel, the cyan-haired cat-ear engineer tinkers with a small spherical drone, the calm purple-haired mage holds a cup of tea; the eclipse visible through the windows', PARTY, true],
  ['corridor-frost', 'A long tilted train corridor coated in pale lilac memory frost whose crystal facets show tiny warm vignettes of strangers\' lives, flickering emergency lights, a gloved hand touching the frost releasing a warm glowing memory', [], true],
  ['battle-descend', 'The carriage roof torn open; a colossal whale-like creature with moth-like feathery antennae, deep-sea lure lights, one giant eye and translucent memory-shard scales descends from a black rift in the eclipse sky; the three heroines brace below', [...PARTY, BOSS], true],
  ['battle-phase2', 'The whale-like memory devourer wails as its translucent scales shatter into thousands of firefly-like warm memory fragments swirling over the train', [BOSS], false],
  ['battle-phase3', 'Close-up of the creature\'s fully opened giant eye with a frozen nebula iris; at the tip of one feathery antenna a tiny warm glowing vignette of a child reaching out for its mother', [BOSS], false],
  ['aftermath-snow', 'Quiet aftermath in the ruined carriage, glowing memory fragments falling like snow; the crimson-haired knight catches one fragment in her gauntlet, melancholic', ['public/assets/lia.png'], true],
  ['ending-seal', 'Four threads of light (crimson, cyan, violet and silver) weave into a key that closes a seal around the Dawn Seed, a glowing pearl-gold seed crystal inside tilted orbit rings; four silhouettes raise their hands', PARTY, false],
  ['ending-share', 'The Dawn Seed bursts with dawn light over a vast valley with silver rails and the stopped train; countless memory lights rise from distant towns; four small silhouettes on a hill', [], false],
  ['ending-destroy', 'A gloved hand lets the Dawn Seed crumble into ash and embers under an endless eclipse night, melancholic', [], false],
];
for (const [name, scene, refs, onTrain] of CG) {
  jobs.push({
    id: `cg-${name}`, group: 'cg', out: `tools/art/raster/out/cg/${name}.png`, size: '1920x1080', seed: 3000 + jobs.length,
    prompt: `${STYLE}. Cinematic wide 16:9 story illustration. ${onTrain ? `Setting: ${TRAIN}. ` : ''}${scene}.`,
    refs: [STYLE_REF, ...refs.filter((r) => r !== STYLE_REF)],
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
  refs: [STYLE_REF, BOSS],
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
  refs: [STYLE_REF],
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
const HERO_REF = { lia_hero: 'public/assets/lia.png', serena_hero: 'public/assets/serena.png', lilith_hero: 'tools/art/raster/out/portraits/lilith.png' };
for (const card of CARDS) {
  const subject = CARD_SUBJECT[card.id];
  if (!subject) throw new Error(`manifest: missing card subject for ${card.id}`);
  jobs.push({
    id: `card-${card.id}`, group: 'cards', after: card.id === 'lilith_hero' ? ['portrait-lilith'] : undefined,
    out: `tools/art/raster/out/cards/${card.id}.png`, size: '1024x1024', seed: 6000 + jobs.length,
    prompt: `${STYLE}. Square trading-card illustration, centered dramatic composition with a soft dark vignette, no card frame, ${CLASS_TONE[card.class]}: ${subject}.`,
    refs: [STYLE_REF, ...(HERO_REF[card.id] ? [HERO_REF[card.id]] : [])],
  });
}

export const JOBS = jobs;
