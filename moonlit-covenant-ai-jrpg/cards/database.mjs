// ═══════════════════════════════════════════════════════════════
// 卡牌数据库 —— 月蚀契约·暗影对决（Shadowverse-like）
// 数据模型说明：
//   id          唯一标识
//   name        卡牌名
//   class       所属职业: lia / lilith / serena / neutral
//   type        卡牌类型: follower(随从) / spell(法术) / amulet(护符)
//   cost        PP 费用 (0-10)
//   rarity      稀有度: bronze(铜) / silver(银) / gold(金) / legendary(虹)
//   attack/health        随从基础攻防
//   evolveAttack/evolveHealth  进化后攻防（默认 +2/+2）
//   keywords    关键词数组: guard(守护) rush(突进) storm(疾驰) bane(剧毒) drain(吸血)
//   effects     入场/法术效果数组，每项 { type, targeting, ...params }
//   trigger     效果触发时机: fanfare(入场) / lastWords(谢幕曲) / spell(法术)
//   art / artEvolve   立绘路径（进化前/后）
//   desc        卡牌描述文本
//   flavor      背景风味文本
//
// targeting 取值：
//   none / self / enemyLeader / allEnemyFollowers / randomEnemyFollower
//   enemyFollower(需选目标) / enemyAny(需选目标) / friendlyFollower(需选目标)
//   otherFriendlyFollowers / allFriendlyFollowers
// ═══════════════════════════════════════════════════════════════

export const CLASSES = {
  lia: { id: 'lia', name: '莉亚·赫斯特', title: '盾战士', element: '火', style: '守护 / 中速', accent: '#ff6b5e', portrait: '/assets/lia.png' },
  lilith: { id: 'lilith', name: '莉莉丝·瓦尔哈拉', title: '暗影刺客', element: '暗', style: '快攻', accent: '#b58cff', portrait: '/assets/lilith.svg' },
  serena: { id: 'serena', name: '塞雷娜·诺克斯', title: '暗系魔法师', element: '暗', style: '控制', accent: '#7c6bff', portrait: '/assets/serena.png' },
  neutral: { id: 'neutral', name: '中立', title: '中立随从', element: '无', style: '通用', accent: '#9aa7b5', portrait: '' }
};

export const RARITIES = {
  bronze: { id: 'bronze', name: '铜', color: '#c08a5a', order: 1 },
  silver: { id: 'silver', name: '银', color: '#aeb9c6', order: 2 },
  gold: { id: 'gold', name: '金', color: '#e8c05a', order: 3 },
  legendary: { id: 'legendary', name: '虹', color: '#d98cff', order: 4 }
};

// 进化默认 +2/+2
const ev = (a, h) => ({ evolveAttack: a + 2, evolveHealth: h + 2 });

export const CARDS = [
  // ─────────────── 中立 NEUTRAL (8) ───────────────
  { id: 'n_wisp', name: '微光精灵', class: 'neutral', type: 'follower', cost: 1, rarity: 'bronze', attack: 1, health: 1, ...ev(1, 1), keywords: [], effects: [], desc: '朴素的小精灵。', flavor: '月蚀之下，最微弱的光也值得守护。', art: '/assets/cards/n_wisp.png', artEvolve: '/assets/cards/n_wisp_e.png' },
  { id: 'n_goblin', name: '哥布林', class: 'neutral', type: 'follower', cost: 2, rarity: 'bronze', attack: 2, health: 2, ...ev(2, 2), keywords: [], effects: [], desc: '常见的绿皮小怪。', flavor: '成群结队，贪小便宜。', art: '/assets/cards/n_goblin.png', artEvolve: '/assets/cards/n_goblin_e.png' },
  { id: 'n_merchant', name: '旅行商人', class: 'neutral', type: 'follower', cost: 2, rarity: 'silver', attack: 1, health: 3, ...ev(1, 3), keywords: [], trigger: 'fanfare', effects: [{ type: 'draw', amount: 1, targeting: 'none' }], desc: '入场曲：抽1张牌。', flavor: '走遍大陆，只卖真货。', art: '/assets/cards/n_merchant.png', artEvolve: '/assets/cards/n_merchant_e.png' },
  { id: 'n_knight', name: '重装骑士', class: 'neutral', type: 'follower', cost: 3, rarity: 'bronze', attack: 3, health: 3, ...ev(3, 3), keywords: [], effects: [], desc: '攻守均衡的骑士。', flavor: '为荣耀而战。', art: '/assets/cards/n_knight.png', artEvolve: '/assets/cards/n_knight_e.png' },
  { id: 'n_golem', name: '岩石魔像', class: 'neutral', type: 'follower', cost: 4, rarity: 'silver', attack: 3, health: 5, ...ev(3, 5), keywords: ['guard'], effects: [], desc: '守护：敌方必须先攻击它。', flavor: '沉默的城墙。', art: '/assets/cards/n_golem.png', artEvolve: '/assets/cards/n_golem_e.png' },
  { id: 'n_troll', name: '巨魔战士', class: 'neutral', type: 'follower', cost: 5, rarity: 'bronze', attack: 5, health: 5, ...ev(5, 5), keywords: [], effects: [], desc: '强壮的巨魔。', flavor: '一棒一个小朋友。', art: '/assets/cards/n_troll.png', artEvolve: '/assets/cards/n_troll_e.png' },
  { id: 'n_angel', name: '守护天使', class: 'neutral', type: 'follower', cost: 6, rarity: 'gold', attack: 5, health: 6, ...ev(5, 6), keywords: ['guard'], trigger: 'fanfare', effects: [{ type: 'heal', amount: 3, targeting: 'self' }], desc: '守护。入场曲：回复主战者3点生命。', flavor: '圣光庇佑着你。', art: '/assets/cards/n_angel.png', artEvolve: '/assets/cards/n_angel_e.png' },
  { id: 'n_dragon', name: '远古巨龙', class: 'neutral', type: 'follower', cost: 7, rarity: 'gold', attack: 7, health: 7, ...ev(7, 7), keywords: [], trigger: 'fanfare', effects: [{ type: 'damage', amount: 2, targeting: 'allEnemyFollowers' }], desc: '入场曲：对所有敌方随从造成2点伤害。', flavor: '苏醒的传说。', art: '/assets/cards/n_dragon.png', artEvolve: '/assets/cards/n_dragon_e.png' },

  // ─────────────── 莉亚 LIA · 守护/中速 (10) ───────────────
  { id: 'lia_recruit', name: '盾卫学徒', class: 'lia', type: 'follower', cost: 1, rarity: 'bronze', attack: 1, health: 2, ...ev(1, 2), keywords: ['guard'], effects: [], desc: '守护：敌方必须先攻击它。', flavor: '莉亚亲手带出的新兵。', art: '/assets/cards/lia_recruit.png', artEvolve: '/assets/cards/lia_recruit_e.png' },
  { id: 'lia_shieldbash', name: '盾击', class: 'lia', type: 'spell', cost: 1, rarity: 'bronze', trigger: 'spell', effects: [{ type: 'damage', amount: 2, targeting: 'enemyFollower' }, { type: 'gainArmor', amount: 1, targeting: 'self' }], desc: '对一个敌方随从造成2点伤害。获得1点护甲。', flavor: '攻守一体。', art: '/assets/cards/lia_shieldbash.png', artEvolve: '' },
  { id: 'lia_flameguard', name: '烈焰守卫', class: 'lia', type: 'follower', cost: 2, rarity: 'bronze', attack: 2, health: 3, ...ev(2, 3), keywords: ['guard'], effects: [], desc: '守护：敌方必须先攻击它。', flavor: '以火铸盾。', art: '/assets/cards/lia_flameguard.png', artEvolve: '/assets/cards/lia_flameguard_e.png' },
  { id: 'lia_rally', name: '战吼鼓舞', class: 'lia', type: 'spell', cost: 2, rarity: 'silver', trigger: 'spell', effects: [{ type: 'buff', attack: 1, health: 2, targeting: 'friendlyFollower' }], desc: '使一个友方随从获得+1/+2。', flavor: '士气就是力量。', art: '/assets/cards/lia_rally.png', artEvolve: '' },
  { id: 'lia_charger', name: '赤焰冲锋者', class: 'lia', type: 'follower', cost: 3, rarity: 'silver', attack: 3, health: 2, ...ev(3, 2), keywords: ['rush'], effects: [], desc: '突进：入场当回合即可攻击随从。', flavor: '一往无前。', art: '/assets/cards/lia_charger.png', artEvolve: '/assets/cards/lia_charger_e.png' },
  { id: 'lia_bulwark', name: '铁壁守护者', class: 'lia', type: 'follower', cost: 4, rarity: 'silver', attack: 2, health: 6, ...ev(2, 6), keywords: ['guard'], trigger: 'fanfare', effects: [{ type: 'gainArmor', amount: 2, targeting: 'self' }], desc: '守护。入场曲：获得2点护甲。', flavor: '不可逾越的壁垒。', art: '/assets/cards/lia_bulwark.png', artEvolve: '/assets/cards/lia_bulwark_e.png' },
  { id: 'lia_captain', name: '骑士队长', class: 'lia', type: 'follower', cost: 5, rarity: 'gold', attack: 4, health: 5, ...ev(4, 5), keywords: ['guard'], trigger: 'fanfare', effects: [{ type: 'buff', attack: 1, health: 1, targeting: 'otherFriendlyFollowers' }], desc: '守护。入场曲：使其他友方随从获得+1/+1。', flavor: '跟我上！', art: '/assets/cards/lia_captain.png', artEvolve: '/assets/cards/lia_captain_e.png' },
  { id: 'lia_flamestrike', name: '烈焰冲击', class: 'lia', type: 'spell', cost: 5, rarity: 'gold', trigger: 'spell', effects: [{ type: 'damage', amount: 4, targeting: 'enemyFollower' }], desc: '对一个敌方随从造成4点伤害。', flavor: '焚尽来犯之敌。', art: '/assets/cards/lia_flamestrike.png', artEvolve: '' },
  { id: 'lia_fortress', name: '赫斯特堡垒', class: 'lia', type: 'follower', cost: 6, rarity: 'gold', attack: 5, health: 7, ...ev(5, 7), keywords: ['guard'], effects: [], desc: '守护：敌方必须先攻击它。', flavor: '赫斯特家的骄傲。', art: '/assets/cards/lia_fortress.png', artEvolve: '/assets/cards/lia_fortress_e.png' },
  { id: 'lia_hero', name: '莉亚·赫斯特', class: 'lia', type: 'follower', cost: 7, rarity: 'legendary', attack: 5, health: 6, evolveAttack: 7, evolveHealth: 8, keywords: ['guard'], trigger: 'fanfare', effects: [{ type: 'damage', amount: 3, targeting: 'allEnemyFollowers' }, { type: 'gainArmor', amount: 3, targeting: 'self' }], desc: '守护。入场曲：对所有敌方随从造成3点伤害，并获得3点护甲。', flavor: '「我不会丢下任何队友。」', art: '/assets/cards/lia_hero.png', artEvolve: '/assets/cards/lia_hero_e.png' },

  // ─────────────── 莉莉丝 LILITH · 快攻 (10) ───────────────
  { id: 'lilith_dagger', name: '暗影匕首', class: 'lilith', type: 'follower', cost: 1, rarity: 'bronze', attack: 1, health: 1, ...ev(1, 1), keywords: ['rush'], effects: [], desc: '突进：入场当回合即可攻击随从。', flavor: '淬毒的利刃。', art: '/assets/cards/lilith_dagger.png', artEvolve: '/assets/cards/lilith_dagger_e.png' },
  { id: 'lilith_strike', name: '影袭', class: 'lilith', type: 'spell', cost: 1, rarity: 'bronze', trigger: 'spell', effects: [{ type: 'damage', amount: 2, targeting: 'enemyFollower' }], desc: '对一个敌方随从造成2点伤害。', flavor: '无声无息。', art: '/assets/cards/lilith_strike.png', artEvolve: '' },
  { id: 'lilith_apprentice', name: '刺客学徒', class: 'lilith', type: 'follower', cost: 2, rarity: 'bronze', attack: 2, health: 1, ...ev(2, 1), keywords: [], effects: [], desc: '脆弱但凶狠。', flavor: '莉莉丝的影子。', art: '/assets/cards/lilith_apprentice.png', artEvolve: '/assets/cards/lilith_apprentice_e.png' },
  { id: 'lilith_poison', name: '淬毒短刃', class: 'lilith', type: 'follower', cost: 2, rarity: 'silver', attack: 2, health: 2, ...ev(2, 2), keywords: ['bane'], effects: [], desc: '剧毒：它造成伤害的随从直接被消灭。', flavor: '见血封喉。', art: '/assets/cards/lilith_poison.png', artEvolve: '/assets/cards/lilith_poison_e.png' },
  { id: 'lilith_shadowdance', name: '影舞', class: 'lilith', type: 'spell', cost: 2, rarity: 'silver', trigger: 'spell', effects: [{ type: 'damage', amount: 1, targeting: 'allEnemyFollowers' }, { type: 'draw', amount: 1, targeting: 'none' }], desc: '对所有敌方随从造成1点伤害。抽1张牌。', flavor: '刀锋上的舞蹈。', art: '/assets/cards/lilith_shadowdance.png', artEvolve: '' },
  { id: 'lilith_assassin', name: '瓦尔哈拉刺客', class: 'lilith', type: 'follower', cost: 3, rarity: 'silver', attack: 3, health: 2, ...ev(3, 2), keywords: ['rush'], effects: [], desc: '突进：入场当回合即可攻击随从。', flavor: '来自瓦尔哈拉的杀意。', art: '/assets/cards/lilith_assassin.png', artEvolve: '/assets/cards/lilith_assassin_e.png' },
  { id: 'lilith_shadowarrow', name: '暗影箭', class: 'lilith', type: 'spell', cost: 3, rarity: 'gold', trigger: 'spell', effects: [{ type: 'damage', amount: 3, targeting: 'enemyAny' }], desc: '对一个敌方随从或主战者造成3点伤害。', flavor: '直指要害。', art: '/assets/cards/lilith_shadowarrow.png', artEvolve: '' },
  { id: 'lilith_nightblade', name: '夜刃游侠', class: 'lilith', type: 'follower', cost: 4, rarity: 'gold', attack: 4, health: 3, ...ev(4, 3), keywords: ['rush'], trigger: 'fanfare', effects: [{ type: 'damage', amount: 1, targeting: 'enemyLeader' }], desc: '突进。入场曲：对敌方主战者造成1点伤害。', flavor: '夜色是我的盟友。', art: '/assets/cards/lilith_nightblade.png', artEvolve: '/assets/cards/lilith_nightblade_e.png' },
  { id: 'lilith_shadowlord', name: '暗影领主', class: 'lilith', type: 'follower', cost: 5, rarity: 'gold', attack: 5, health: 4, ...ev(5, 4), keywords: ['rush'], effects: [], desc: '突进：入场当回合即可攻击随从。', flavor: '统御群影。', art: '/assets/cards/lilith_shadowlord.png', artEvolve: '/assets/cards/lilith_shadowlord_e.png' },
  { id: 'lilith_hero', name: '莉莉丝·瓦尔哈拉', class: 'lilith', type: 'follower', cost: 5, rarity: 'legendary', attack: 4, health: 3, evolveAttack: 6, evolveHealth: 5, keywords: ['storm'], trigger: 'fanfare', effects: [{ type: 'damage', amount: 2, targeting: 'enemyLeader' }], desc: '疾驰：入场当回合即可攻击。入场曲：对敌方主战者造成2点伤害。', flavor: '「你的首级，我收下了。」', art: '/assets/cards/lilith_hero.png', artEvolve: '/assets/cards/lilith_hero_e.png' },

  // ─────────────── 塞雷娜 SERENA · 控制 (10) ───────────────
  { id: 'serena_acolyte', name: '月蚀学徒', class: 'serena', type: 'follower', cost: 2, rarity: 'bronze', attack: 1, health: 3, ...ev(1, 3), keywords: [], trigger: 'fanfare', effects: [{ type: 'draw', amount: 1, targeting: 'none' }], desc: '入场曲：抽1张牌。', flavor: '追随月蚀之人。', art: '/assets/cards/serena_acolyte.png', artEvolve: '/assets/cards/serena_acolyte_e.png' },
  { id: 'serena_darkbolt', name: '暗蚀术', class: 'serena', type: 'spell', cost: 2, rarity: 'bronze', trigger: 'spell', effects: [{ type: 'damage', amount: 3, targeting: 'enemyFollower' }], desc: '对一个敌方随从造成3点伤害。', flavor: '侵蚀一切的暗。', art: '/assets/cards/serena_darkbolt.png', artEvolve: '' },
  { id: 'serena_observer', name: '虚空观测者', class: 'serena', type: 'follower', cost: 3, rarity: 'silver', attack: 2, health: 4, ...ev(2, 4), keywords: [], trigger: 'fanfare', effects: [{ type: 'draw', amount: 1, targeting: 'none' }], desc: '入场曲：抽1张牌。', flavor: '凝视深渊者。', art: '/assets/cards/serena_observer.png', artEvolve: '/assets/cards/serena_observer_e.png' },
  { id: 'serena_drain', name: '生命汲取', class: 'serena', type: 'spell', cost: 3, rarity: 'silver', trigger: 'spell', effects: [{ type: 'damage', amount: 2, targeting: 'enemyAny' }, { type: 'heal', amount: 2, targeting: 'self' }], desc: '对一个敌方随从或主战者造成2点伤害，并回复主战者2点生命。', flavor: '以彼之血，养我之身。', art: '/assets/cards/serena_drain.png', artEvolve: '' },
  { id: 'serena_oracle', name: '月蚀先知', class: 'serena', type: 'follower', cost: 4, rarity: 'silver', attack: 3, health: 4, ...ev(3, 4), keywords: [], trigger: 'fanfare', effects: [{ type: 'draw', amount: 1, targeting: 'none' }], desc: '入场曲：抽1张牌。', flavor: '预见三种结局之人。', art: '/assets/cards/serena_oracle.png', artEvolve: '/assets/cards/serena_oracle_e.png' },
  { id: 'serena_void', name: '虚空吞噬', class: 'serena', type: 'spell', cost: 4, rarity: 'gold', trigger: 'spell', effects: [{ type: 'destroy', targeting: 'enemyFollower' }], desc: '消灭一个敌方随从。', flavor: '归于虚无。', art: '/assets/cards/serena_void.png', artEvolve: '' },
  { id: 'serena_nova', name: '暗月新星', class: 'serena', type: 'spell', cost: 5, rarity: 'gold', trigger: 'spell', effects: [{ type: 'damage', amount: 3, targeting: 'allEnemyFollowers' }], desc: '对所有敌方随从造成3点伤害。', flavor: '月蚀降临。', art: '/assets/cards/serena_nova.png', artEvolve: '' },
  { id: 'serena_devourer', name: '深渊吞噬者', class: 'serena', type: 'follower', cost: 6, rarity: 'gold', attack: 5, health: 6, ...ev(5, 6), keywords: [], trigger: 'fanfare', effects: [{ type: 'damage', amount: 4, targeting: 'enemyFollower' }], desc: '入场曲：对一个敌方随从造成4点伤害。', flavor: '深渊在凝视你。', art: '/assets/cards/serena_devourer.png', artEvolve: '/assets/cards/serena_devourer_e.png' },
  { id: 'serena_seal', name: '静月封界', class: 'serena', type: 'spell', cost: 7, rarity: 'gold', trigger: 'spell', effects: [{ type: 'damage', amount: 5, targeting: 'enemyAny' }, { type: 'draw', amount: 2, targeting: 'none' }], desc: '对一个敌方随从或主战者造成5点伤害。抽2张牌。', flavor: '封印一切观测。', art: '/assets/cards/serena_seal.png', artEvolve: '' },
  { id: 'serena_hero', name: '塞雷娜·诺克斯', class: 'serena', type: 'follower', cost: 8, rarity: 'legendary', attack: 6, health: 6, evolveAttack: 8, evolveHealth: 8, keywords: [], trigger: 'fanfare', effects: [{ type: 'damage', amount: 3, targeting: 'allEnemyFollowers' }, { type: 'draw', amount: 2, targeting: 'none' }], desc: '入场曲：对所有敌方随从造成3点伤害，并抽2张牌。', flavor: '「观测结果显示——你输了。」', art: '/assets/cards/serena_hero.png', artEvolve: '/assets/cards/serena_hero_e.png' }
];

// ─── 索引与查询工具 ───
const CARD_INDEX = new Map(CARDS.map((c) => [c.id, c]));

export function getCard(id) {
  return CARD_INDEX.get(id) || null;
}

export function cardsByClass(cls) {
  return CARDS.filter((c) => c.class === cls);
}

export function cardsByRarity(rarity) {
  return CARDS.filter((c) => c.rarity === rarity);
}

// 某职业可用的全部卡（本职业 + 中立）
export function availableCardsForClass(cls) {
  return CARDS.filter((c) => c.class === cls || c.class === 'neutral');
}

// 需要玩家选择目标的卡牌（含需选目标的效果）
const NEED_TARGET = new Set(['enemyFollower', 'enemyAny', 'friendlyFollower']);
export function cardNeedsTarget(card) {
  return (card.effects || []).some((e) => NEED_TARGET.has(e.targeting));
}

export const KEYWORD_LABELS = {
  guard: '守护',
  rush: '突进',
  storm: '疾驰',
  bane: '剧毒',
  drain: '吸血'
};
