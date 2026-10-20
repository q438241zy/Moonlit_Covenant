/**
 * 抽卡系统
 * 角色池 8 位女主（只有 4★ 和 5★），服饰池每角色 6 套（3★～5★）
 * 保底机制：连续 89 次未出 5★ 时，第 90 次必出 5★（出 5★ 后计数重置）
 *
 * GACHA_RATES 就是实际抽取用的概率表，/api/gacha/pools 原样公示（契约 K-11）：
 * rates[池][稀有度] 是该稀有度的总概率，同一稀有度内的条目等概率。
 */

import { CREDIT_COSTS, consumeCredit, canAfford, syncAccountCredits } from './credit.mjs';

// 保底阈值
export const PITY_THRESHOLD = 90;

// 角色池：8 位女主从一开始就都在池中（unlockChapter: 0），需抽取获得（portrait 统一使用原创矢量立绘，召唤/换衣画风一致）
// 文本不得出现外传角色的结局前禁用词（见 content.mjs 的 forbiddenTermsUntilEnding，test/economy.test.mjs 守护）
export const CHARACTER_POOL = [
  { id: 'lia', name: '莉亚·赫斯特', title: '盾战士', rarity: 5, element: '火', portrait: '/assets/portraits/lia.svg', unlockChapter: 0, age: 19, desc: '赤红高马尾的赤誓骑士，队伍前锋。嘴硬心软，把承诺看得比命还重；喜欢草莓蛋糕，被夸奖时会别过脸整理肩甲。' },
  { id: 'mia', name: '米娅·玲', title: '魔具发明师', rarity: 4, element: '雷', portrait: '/assets/portraits/mia.svg', unlockChapter: 0, age: 18, desc: '青蓝短发、戴机械猫耳的魔具发明师，工具包里总塞着半成品，把爆炸叫作“非计划拆解”。语速飞快、点子不断，最怕安静下来。' },
  { id: 'serena', name: '塞雷娜·诺克斯', title: '暗系魔法师', rarity: 5, element: '暗', portrait: '/assets/portraits/serena.svg', unlockChapter: 0, age: 19, desc: '紫黑长发的月蚀观测者，冷静克制，开口总是“观测结果显示”。格外在意你是否对她诚实，右手的白手套从不摘下。' },
  { id: 'freya', name: '芙蕾娅·霜华', title: '冰系魔法师', rarity: 5, element: '冰', portrait: '/assets/portraits/freya.svg', unlockChapter: 0, age: 19, desc: '青蓝长发的北境冰术师，温柔可靠、习惯默默照顾所有人；战斗时眼神却冷静得像冻结的湖面。' },
  { id: 'lilith', name: '莉莉丝·瓦尔哈拉', title: '暗影刺客', rarity: 5, element: '木', portrait: '/assets/portraits/lilith.svg', unlockChapter: 0, age: 19, desc: '金发高束的暗影刺客，好胜又冲动，动作像猫科动物一样敏捷。嘴上从不服输，被认可时会偷偷高兴。' },
  { id: 'evelyn', name: '伊芙琳·星歌', title: '圣教圣女', rarity: 4, element: '光', portrait: '/assets/portraits/evelyn.svg', unlockChapter: 0, age: 18, desc: '浅金长发的圣教圣女，胆小爱哭却从不放弃。喜欢草莓蛋糕，总在远处注视那个敢为平民发声的冒险者。' },
  { id: 'ophelia', name: '奥菲利亚·使诺德', title: '龙族圣女', rarity: 5, element: '土', portrait: '/assets/portraits/ophelia.svg', unlockChapter: 0, age: 19, desc: '远古龙族后裔，铜红长发、额侧小角，可化为龙形。爽朗爱闹，表达亲近的方式带着一点龙族特色。' },
  { id: 'aila', name: '艾拉·瓦尔哈拉', title: '光明骑士', rarity: 4, element: '光', portrait: '/assets/portraits/aila.svg', unlockChapter: 0, age: 18, desc: '莉莉丝的妹妹，金色齐肩发的光明骑士。开朗大胆、爱挑战强者，一心想证明自己不输给姐姐。' }
];

// 服装类型定义
const COSTUME_TYPE_NAMES = {
  newyear: '新年服',
  maid: '女仆服',
  christmas: '圣诞服',
  duanwu: '端午服',
  anniversary: '周年庆服',
  swimsuit: '夏日度假服'
};

// 服装池：每角色6套
export const COSTUME_POOL = [];
for (const char of CHARACTER_POOL) {
  for (const [type, name] of Object.entries(COSTUME_TYPE_NAMES)) {
    const rarity = type === 'swimsuit' || type === 'anniversary' ? 5 : type === 'christmas' || type === 'newyear' ? 4 : 3;
    COSTUME_POOL.push({
      id: `${char.id}_${type}`,
      characterId: char.id,
      name: `${char.name.split('·')[0]}·${name}`,
      type,
      rarity,
      description: `${char.title}的${name}造型`,
      file: `/assets/costumes/${char.id}_${type}.svg`,
      branchScene: `branch_${char.id}_${type}`
    });
  }
}

// 抽卡概率（与实际抽取完全一致；角色池没有 3★，所以表里也没有 3★）
export const GACHA_RATES = {
  character: { 5: 0.02, 4: 0.98 },
  costume: { 5: 0.03, 4: 0.17, 3: 0.80 }
};

export const GACHA_POOLS = ['character', 'costume'];

/** 把任意输入归一成合法的池名：只有 'costume' 是服饰池，其余一律按角色池处理（与服务器记录拥有物的规则一致）。 */
export function normalizePool(pool) {
  return pool === 'costume' ? 'costume' : 'character';
}

/**
 * 执行抽卡
 * @param {object} account - 玩家账户（抽到的条目会记入 ownedCharacters / ownedCostumes）
 * @param {object} meter - Credit计量器（余额以它为准，扣费后 account.credits 同步为计量器余额）
 * @param {string} pool - 'character' | 'costume'（其他值按 'character' 处理）
 * @param {number} count - 10 为十连，其余按单抽
 * @returns {{ok: true, pool: string, results: Array, cost: number, pity: number}|{ok: false, message: string}}
 *   results[i].isNew：这一抽之前是否未拥有该条目（同一次十连里第二次抽到同一条目时为 false）
 */
export function pullGacha(account, meter, pool, count) {
  const poolKey = normalizePool(pool);
  const pullCount = Number(count) === 10 ? 10 : 1;
  const costKey = pullCount === 10 ? 'gacha_ten' : 'gacha_single';
  const cost = CREDIT_COSTS[costKey];

  // 检查Credit是否足够
  if (!canAfford(meter, costKey)) {
    return { ok: false, message: `Credit不足，${pullCount === 10 ? '十连' : '单抽'}需要${cost}Credit。` };
  }

  // 扣除Credit
  const deduction = consumeCredit(meter, costKey);
  if (!deduction.ok) {
    return { ok: false, message: 'Credit扣除失败。' };
  }
  syncAccountCredits(account, meter);

  // 初始化保底计数器
  if (!account.pityCounters || typeof account.pityCounters !== 'object') account.pityCounters = {};
  if (!Number.isFinite(account.pityCounters[poolKey])) account.pityCounters[poolKey] = 0;

  // 已拥有列表：isNew 以「这一抽之前」为准
  const ownedKey = poolKey === 'costume' ? 'ownedCostumes' : 'ownedCharacters';
  if (!Array.isArray(account[ownedKey])) account[ownedKey] = [];
  const owned = new Set(account[ownedKey]);

  const rates = GACHA_RATES[poolKey];
  const sourcePool = poolKey === 'costume' ? COSTUME_POOL : CHARACTER_POOL;
  const results = [];

  for (let i = 0; i < pullCount; i++) {
    account.pityCounters[poolKey] += 1;
    let rarity;

    // 保底机制：达到阈值必出5星
    if (account.pityCounters[poolKey] >= PITY_THRESHOLD) {
      rarity = 5;
      account.pityCounters[poolKey] = 0;
    } else {
      rarity = rollRarity(rates);
      if (rarity === 5) {
        account.pityCounters[poolKey] = 0; // 出5星重置保底
      }
    }

    // 从对应稀有度的池中随机选取。
    // 概率表只列池内存在的稀有度；万一不一致，降到池内最低稀有度，不能退回整池随机（否则概率与保底都会失真）。
    let candidates = sourcePool.filter((item) => item.rarity === rarity);
    if (candidates.length === 0) {
      const lowest = Math.min(...sourcePool.map((item) => item.rarity));
      candidates = sourcePool.filter((item) => item.rarity === lowest);
    }
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    const isNew = !owned.has(picked.id);
    if (isNew) {
      owned.add(picked.id);
      account[ownedKey].push(picked.id);
    }

    results.push({
      ...picked,
      pullIndex: i + 1,
      isNew
    });
  }

  return {
    ok: true,
    pool: poolKey,
    results,
    cost,
    pity: account.pityCounters[poolKey]
  };
}

/**
 * 获取保底计数
 * @param {object} account - 玩家账户
 * @param {string} pool - 'character' | 'costume'
 * @returns {number} 当前保底计数
 */
export function getPityCounter(account, pool) {
  if (!account.pityCounters) return 0;
  return account.pityCounters[normalizePool(pool)] || 0;
}

// 内部工具：根据概率表抽取稀有度（从高到低累加；表里只列池内存在的稀有度）
function rollRarity(rates) {
  const tiers = Object.keys(rates).map(Number).sort((a, b) => b - a);
  const roll = Math.random();
  let cumulative = 0;
  for (const rarity of tiers) {
    cumulative += rates[rarity];
    if (roll < cumulative) return rarity;
  }
  // 浮点误差兜底：落到表里最低的稀有度
  return tiers[tiers.length - 1];
}
