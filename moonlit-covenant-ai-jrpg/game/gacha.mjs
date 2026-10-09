/**
 * 抽卡系统
 * 8个角色（3主角 + 5剧情解锁），每角色6套服装
 * 保底机制：90抽必出5星
 */

import crypto from 'node:crypto';
import { CREDIT_COSTS, consumeCredit, canAfford } from './credit.mjs';

// 保底阈值
export const PITY_THRESHOLD = 90;

// 角色池：8位主角全部初始可用（portrait 统一使用原创矢量立绘，召唤/换衣画风一致）
export const CHARACTER_POOL = [
  { id: 'lia', name: '莉亚·赫斯特', title: '盾战士', rarity: 5, element: '火', portrait: '/assets/portraits/lia.svg', unlockChapter: 0, age: 17, desc: '赤红高马尾的赤誓骑士，队伍前锋。嘴硬心软，把承诺看得比命还重；喜欢草莓蛋糕，被夸奖时会别过脸整理肩甲。' },
  { id: 'mia', name: '米娅·玲', title: '魔具发明狂魔', rarity: 4, element: '雷', portrait: '/assets/portraits/mia.svg', unlockChapter: 0, age: 16, desc: '青蓝短发的猫耳机关师，猫耳其实是接收失踪姐姐讯号的改造天线。语速飞快、点子不断，最怕安静下来。' },
  { id: 'serena', name: '塞雷娜·诺克斯', title: '暗系魔法师', rarity: 5, element: '暗', portrait: '/assets/portraits/serena.svg', unlockChapter: 0, age: 18, desc: '紫黑长发的月蚀观测者，冷静克制，开口总是“观测结果显示”。格外在意你是否对她诚实，右手的白手套从不摘下。' },
  { id: 'freya', name: '芙蕾娅·霜华', title: '冰系魔法师', rarity: 5, element: '冰', portrait: '/assets/portraits/freya.svg', unlockChapter: 0, age: 20, desc: '青蓝长发的北境冰术师，温柔可靠、习惯默默照顾所有人；战斗时眼神却冷静得像冻结的湖面。' },
  { id: 'lilith', name: '莉莉丝·瓦尔哈拉', title: '暗影刺客', rarity: 5, element: '暗', portrait: '/assets/portraits/lilith.svg', unlockChapter: 0, age: 17, desc: '金发高束的暗影刺客，好胜又冲动，动作像猫科动物一样敏捷。嘴上从不服输，被认可时会偷偷高兴。' },
  { id: 'evelyn', name: '伊芙琳·星歌', title: '圣教圣女', rarity: 4, element: '光', portrait: '/assets/portraits/evelyn.svg', unlockChapter: 0, age: 16, desc: '浅金长发的圣教圣女，胆小爱哭却从不放弃。喜欢草莓蛋糕，总在远处注视那个敢为平民发声的冒险者。' },
  { id: 'ophelia', name: '奥菲利亚·使诺德', title: '龙族圣女', rarity: 5, element: '火', portrait: '/assets/portraits/ophelia.svg', unlockChapter: 0, age: 19, desc: '远古龙族后裔，铜红长发、额侧小角，可化为龙形。爽朗爱闹，表达亲近的方式带着一点龙族特色。' },
  { id: 'aila', name: '艾拉·瓦尔哈拉', title: '光明骑士', rarity: 4, element: '光', portrait: '/assets/portraits/aila.svg', unlockChapter: 0, age: 16, desc: '莉莉丝的妹妹，金色齐肩发的光明骑士。开朗大胆、爱挑战强者，一心想证明自己不输给姐姐。' }
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

// 抽卡概率
export const GACHA_RATES = {
  character: { 5: 0.02, 4: 0.13, 3: 0.85 },
  costume: { 5: 0.03, 4: 0.17, 3: 0.80 }
};

/**
 * 执行抽卡
 * @param {object} account - 玩家账户（需包含credits字段）
 * @param {object} meter - Credit计量器
 * @param {string} pool - 'character' | 'costume'
 * @param {number} count - 1（单抽）或 10（十连）
 * @returns {{results: Array, cost: number, pity: number}|{ok: false, message: string}}
 */
export function pullGacha(account, meter, pool, count) {
  const pullCount = count === 10 ? 10 : 1;
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

  // 初始化保底计数器
  if (!account.pityCounters) account.pityCounters = {};
  if (!account.pityCounters[pool]) account.pityCounters[pool] = 0;

  const rates = GACHA_RATES[pool] || GACHA_RATES.character;
  const sourcePool = pool === 'costume' ? COSTUME_POOL : CHARACTER_POOL;
  const results = [];

  for (let i = 0; i < pullCount; i++) {
    account.pityCounters[pool] += 1;
    let rarity;

    // 保底机制：达到阈值必出5星
    if (account.pityCounters[pool] >= PITY_THRESHOLD) {
      rarity = 5;
      account.pityCounters[pool] = 0;
    } else {
      rarity = rollRarity(rates);
      if (rarity === 5) {
        account.pityCounters[pool] = 0; // 出5星重置保底
      }
    }

    // 从对应稀有度的池中随机选取。
    // 池内没有该稀有度时（角色池没有3星）降到池内最低稀有度，
    // 不能退回整池随机，否则85%的3星概率会变成大量5星，概率表与保底都失真。
    let candidates = sourcePool.filter((item) => item.rarity === rarity);
    if (candidates.length === 0) {
      const lowest = Math.min(...sourcePool.map((item) => item.rarity));
      candidates = sourcePool.filter((item) => item.rarity === lowest);
    }
    const picked = candidates[Math.floor(Math.random() * candidates.length)];

    results.push({
      ...picked,
      pullIndex: i + 1,
      isNew: true // 实际项目中需对比已拥有列表
    });
  }

  return {
    ok: true,
    results,
    cost,
    pity: account.pityCounters[pool]
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
  return account.pityCounters[pool] || 0;
}

// 内部工具：根据概率表抽取稀有度
function rollRarity(rates) {
  const roll = Math.random();
  if (roll < rates[5]) return 5;
  if (roll < rates[5] + rates[4]) return 4;
  return 3;
}
