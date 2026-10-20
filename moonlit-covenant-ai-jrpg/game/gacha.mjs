/**
 * 抽卡系统
 * 角色池 8 位女主（只有 4★ 和 5★），服饰池每角色 6 套（3★～5★）
 * 保底机制：连续 89 次未出 5★ 时，第 90 次必出 5★（出 5★ 后计数重置）
 *
 * GACHA_RATES 就是实际抽取用的概率表，/api/gacha/pools 原样公示（契约 K-11）：
 * rates[池][稀有度] 是该稀有度的总概率，同一稀有度内的条目等概率。
 *
 * 支付（作者核#12：保留钻石与召唤，钻石要能靠玩获得，见 game/rewards.mjs）：
 *   - Credit：单抽 10、十连 90（CREDIT_COSTS，默认）；
 *   - 钻石：单抽 80、十连 720（GACHA_DIAMOND_COSTS；与卡牌对战的单包 80 钻石同价，十连同样九折）。
 * 重复补偿：抽到已拥有的条目（含同一次十连里的第二份）按稀有度折成钻石，见 DUPLICATE_COMPENSATION。
 */

import { CREDIT_COSTS, consumeCredit, canAfford, syncAccountCredits } from './credit.mjs';

// 保底阈值
export const PITY_THRESHOLD = 90;

// 角色池：8 位女主从一开始就都在池中（unlockChapter: 0）；portrait 统一使用原创矢量立绘，召唤/换衣画风一致。
// 文本以正典为准（设定集/03 的基本资料与第一印象；银轨号是 IF 外传，外传身份不进卡池），只写到正式章节已经揭示的程度：
// 不写身世秘密、罪律弧线与组织名。也不得出现外传角色的结局前禁用词（content.mjs 的 forbiddenTermsUntilEnding，测试守护）。
// element 为正典「源律」的主律；joinChapter 是她在主线「正式成为长期伙伴」的章节（设定集/03 §10）：
// 通关该章时自动获得（game/rewards.mjs），还没写出来的章节先登记在这里，章节上线后自动生效。
export const CHARACTER_POOL = [
  { id: 'lia', name: '莉亚·赫斯特', title: '盾战士', rarity: 5, element: '火', nation: '赤焰王国', weapon: '塔盾“赤誓”、细身长剑“断章”', portrait: '/assets/portraits/lia.svg', unlockChapter: 0, joinChapter: 'ch005', age: 19, desc: '赤焰王国出身的盾战士，左肩甲带着战损缺口，持塔盾“赤誓”与细身长剑“断章”。说话像下命令，战前必定检查药剂、护具与撤退路线，看到有人冲出阵型会直接用盾把人拍回去。极爱草莓蛋糕，却坚持称之为“高效率糖分补给”。' },
  { id: 'mia', name: '米娅·玲', title: '魔具发明师', rarity: 4, element: '金', nation: '铸金联邦', weapon: '多功能魔导棍“叮当三号”', portrait: '/assets/portraits/mia.svg', unlockChapter: 0, joinChapter: 'ch010', age: 18, desc: '铸金联邦工匠家庭出身的魔具发明师，挥着多功能魔导棍“叮当三号”，身边漂浮着球形小无人机“零号”。语速快、点子跳跃，看到新素材就会忘记危险，把爆炸称作“非计划拆解”；可她真能用废料造出奇迹，一心想做出普通人也负担得起的魔具。' },
  { id: 'serena', name: '塞雷娜·诺克斯', title: '暗系魔法师', rarity: 5, element: '暗', nation: '夜鸦公国', weapon: '黑曜法杖“无眠镜”', portrait: '/assets/portraits/serena.svg', unlockChapter: 0, joinChapter: 'ch014', age: 19, desc: '夜鸦公国诺克斯家族的暗系魔法师，执黑曜法杖“无眠镜”，左侧细辫上串着银色月相盘发饰，右手戴半截白手套。冷静、机敏、嘴上不饶人，习惯先从镜面与影子里掌握情报再开口；说出危险的话时，表情反而格外认真。' },
  { id: 'freya', name: '芙蕾娅·霜华', title: '冰系魔法师', rarity: 5, element: '水', nation: '霜潮王国', weapon: '长法杖“春眠”', portrait: '/assets/portraits/freya.svg', unlockChapter: 0, joinChapter: 'ch028', age: 19, desc: '霜潮王国的冰系魔法师兼守墓人，手持顶端嵌着雪花宝珠的长杖“春眠”。说话轻柔，像可靠的大姐姐，会自然地递上热饮、替人整理围巾；战斗时眼神却冷静得像冻结的湖面。' },
  { id: 'lilith', name: '莉莉丝·瓦尔哈拉', title: '暗影刺客', rarity: 5, element: '木', nation: '翠影公国', weapon: '双匕首“昼盲”“夜醒”', portrait: '/assets/portraits/lilith.svg', unlockChapter: 0, joinChapter: 'ch030', age: 19, desc: '翠影公国出身的暗影刺客，金色长发高束，鼻梁贴着一块小创可贴，双肩后露出双匕首“昼盲”“夜醒”的刀柄。警惕、尖锐、行动先于思考，身手像猫科动物一样敏捷。' },
  { id: 'evelyn', name: '伊芙琳·星歌', title: '圣教圣女', rarity: 4, element: '光', nation: '圣辉教国', weapon: '圣歌弓“微光”、祈祷铃', portrait: '/assets/portraits/evelyn.svg', unlockChapter: 0, joinChapter: 'ch024', age: 18, desc: '圣辉教国的圣教圣女，背着圣歌弓“微光”，侧辫尾端系着祈祷铃。胆小、容易哭、说话很轻；可只要有人受伤，她会一边掉眼泪一边坚持施法。' },
  { id: 'ophelia', name: '奥菲利亚·使诺德', title: '龙族圣女', rarity: 5, element: '土', nation: '龙脊古国', weapon: '龙纹法杖“祖语”', portrait: '/assets/portraits/ophelia.svg', unlockChapter: 0, joinChapter: 'ch030', age: 19, desc: '龙脊古国使诺德氏族的龙族圣女，额侧一对小龙角、金紫异色瞳，能在人形与龙形之间切换，人形时使用龙纹法杖“祖语”。外表端庄，其实对人类的日常充满好奇，笑起来会露出一颗小虎牙。' },
  { id: 'aila', name: '艾拉·瓦尔哈拉', title: '光明骑士', rarity: 4, element: '光', nation: '圣辉教国', weapon: '光剑“晨罚”、圆盾', portrait: '/assets/portraits/aila.svg', unlockChapter: 0, joinChapter: 'ch030', age: 18, desc: '圣辉教国的光明骑士，金色齐肩短发，光剑“晨罚”斜挎在肩后，另配一面圆盾。开朗自信、爱挑衅，最喜欢挑战强者，逼对手拿出真本事。' }
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

// 用钻石召唤的价格：单抽与卡牌对战单包同价（80），十连九折（720），和 Credit 的 10 / 90 同一折扣
export const GACHA_DIAMOND_COSTS = { single: 80, ten: 720 };

/** 两种货币的召唤价格（/api/gacha/pools 公示）。 */
export const GACHA_COSTS = {
  credit: { single: CREDIT_COSTS.gacha_single, ten: CREDIT_COSTS.gacha_ten },
  diamonds: { ...GACHA_DIAMOND_COSTS }
};

/**
 * 重复补偿（钻石）：以钻石单抽价 80 为基准——
 *   3★ 8（单抽的 10%）、4★ 16（20%）、5★ 160（两次单抽）。
 * 全部拥有后每抽的期望返还：角色池约 19（0.976×16 + 0.024×160，5★ 概率按含保底的综合 2.4% 计），
 * 服饰池约 14（0.80×8 + 0.17×16 + 0.032×160），都远低于单抽 80，不会形成刷钻循环。
 * 主线自动入队的女主若已经抽到，也按同一张表补偿（game/rewards.mjs）。
 */
export const DUPLICATE_COMPENSATION = { 3: 8, 4: 16, 5: 160 };

/** 某稀有度重复一次补偿多少钻石（未知稀有度为 0）。 */
export function duplicateCompensation(rarity) {
  return DUPLICATE_COMPENSATION[Number(rarity)] || 0;
}

/** 把任意输入归一成合法的货币：只有 'diamonds' 是钻石，其余一律按 Credit 处理（兼容旧前端）。 */
export function normalizeCurrency(currency) {
  return currency === 'diamonds' ? 'diamonds' : 'credit';
}

/** 把任意输入归一成合法的池名：只有 'costume' 是服饰池，其余一律按角色池处理（与服务器记录拥有物的规则一致）。 */
export function normalizePool(pool) {
  return pool === 'costume' ? 'costume' : 'character';
}

/**
 * 执行抽卡
 * @param {object} account - 玩家账户（抽到的条目会记入 ownedCharacters / ownedCostumes；重复补偿记入 account.diamonds）
 * @param {object} meter - Credit计量器（用 Credit 支付时余额以它为准，扣费后 account.credits 同步为计量器余额）
 * @param {string} pool - 'character' | 'costume'（其他值按 'character' 处理）
 * @param {number} count - 10 为十连，其余按单抽
 * @param {{currency?: 'credit'|'diamonds'}} [options] - 支付货币，默认 Credit
 * @returns {{ok: true, pool: string, currency: string, results: Array, cost: number, pity: number,
 *   compensation: {diamonds: number}, balance: {credits: number, diamonds: number}}|{ok: false, code: string, message: string}}
 *   results[i].isNew：这一抽之前是否未拥有该条目（同一次十连里第二次抽到同一条目时为 false）；
 *   results[i].duplicate / compensation：重复时为 true / 折成的钻石数（不重复为 false / 0）。
 */
export function pullGacha(account, meter, pool, count, options = {}) {
  const poolKey = normalizePool(pool);
  const currency = normalizeCurrency(options?.currency);
  const pullCount = Number(count) === 10 ? 10 : 1;
  const label = pullCount === 10 ? '十连' : '单抽';
  let cost;

  if (currency === 'diamonds') {
    cost = pullCount === 10 ? GACHA_DIAMOND_COSTS.ten : GACHA_DIAMOND_COSTS.single;
    const balance = Number.isFinite(account.diamonds) ? account.diamonds : 0;
    if (balance < cost) {
      return { ok: false, code: 'INSUFFICIENT_DIAMONDS', message: `钻石不足，${label}需要${cost}钻石（当前${balance}）。` };
    }
    account.diamonds = balance - cost;
  } else {
    const costKey = pullCount === 10 ? 'gacha_ten' : 'gacha_single';
    cost = CREDIT_COSTS[costKey];
    // 检查Credit是否足够
    if (!canAfford(meter, costKey)) {
      return { ok: false, code: 'INSUFFICIENT_CREDIT', message: `Credit不足，${label}需要${cost}Credit。` };
    }
    // 扣除Credit
    const deduction = consumeCredit(meter, costKey);
    if (!deduction.ok) {
      return { ok: false, code: 'INSUFFICIENT_CREDIT', message: 'Credit扣除失败。' };
    }
    syncAccountCredits(account, meter);
  }

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
  let compensationTotal = 0;

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
    let compensation = 0;
    if (isNew) {
      owned.add(picked.id);
      account[ownedKey].push(picked.id);
    } else {
      compensation = duplicateCompensation(picked.rarity);
      compensationTotal += compensation;
    }

    results.push({
      ...picked,
      pullIndex: i + 1,
      isNew,
      duplicate: !isNew,
      compensation
    });
  }

  if (compensationTotal > 0) {
    account.diamonds = (Number.isFinite(account.diamonds) ? account.diamonds : 0) + compensationTotal;
  }

  return {
    ok: true,
    pool: poolKey,
    currency,
    results,
    cost,
    pity: account.pityCounters[poolKey],
    compensation: { diamonds: compensationTotal },
    balance: {
      credits: Number.isFinite(account.credits) ? account.credits : 0,
      diamonds: Number.isFinite(account.diamonds) ? account.diamonds : 0
    }
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
