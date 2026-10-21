/**
 * Credit计量系统
 * 管理玩家Credit余额、消耗、赠送及历史记录
 *
 * Credit 只用于 AI 对话。召唤只收钻石（核#14，剧本/README_30章重構提案.md 第八节#44；见 game/gacha.mjs），
 * 所以这里不再有召唤的价格。
 */

// 各行为Credit消耗定义
export const CREDIT_COSTS = {
  chat: 1,           // 普通聊天
  battle_action: 0,  // 战斗行动（免费）
  costume_preview: 0,// 服装预览（免费）
  ai_dialogue: 2     // AI深度对话
};

/**
 * 创建Credit计量器
 * @param {object} account - 玩家账户
 * @returns {{balance: number, todayUsed: number, todayGranted: number, history: Array}}
 */
export function createCreditMeter(account) {
  return {
    balance: account?.credits || 0,
    todayUsed: 0,
    todayGranted: 0,
    history: []
  };
}

/**
 * 消耗Credit
 * @param {object} meter - Credit计量器
 * @param {string} action - 行为类型（对应CREDIT_COSTS的key）
 * @param {number} [amount] - 自定义消耗量（不传则使用CREDIT_COSTS默认值）
 * @returns {{ok: boolean, remaining: number, consumed: number}}
 */
export function consumeCredit(meter, action, amount) {
  const cost = amount !== undefined ? amount : (CREDIT_COSTS[action] ?? 0);

  if (cost <= 0) {
    // 免费行为，记录但不扣费
    logHistory(meter, action, 0, 'consume');
    return { ok: true, remaining: meter.balance, consumed: 0 };
  }

  if (meter.balance < cost) {
    return { ok: false, remaining: meter.balance, consumed: 0 };
  }

  meter.balance -= cost;
  meter.todayUsed += cost;
  logHistory(meter, action, cost, 'consume');

  return { ok: true, remaining: meter.balance, consumed: cost };
}

/**
 * 增加Credit
 * @param {object} meter - Credit计量器
 * @param {number} amount - 增加数量
 * @param {string} source - 来源说明（如 "会员每日赠送"、"活动奖励"）
 */
export function addCredit(meter, amount, source) {
  const value = Math.max(0, Math.floor(Number(amount) || 0));
  if (value <= 0) return;

  meter.balance += value;
  meter.todayGranted += value;
  logHistory(meter, source || 'system', value, 'grant');
}

/**
 * 获取计量器状态（含最近20条历史）
 */
export function getMeterStatus(meter) {
  return {
    balance: meter.balance,
    todayUsed: meter.todayUsed,
    todayGranted: meter.todayGranted,
    history: meter.history.slice(-20)
  };
}

/**
 * 只有一本账：Credit 余额以计量器为准，account.credits 只是它的镜像（供账户接口、管理后台显示）。
 * 计量器存在时把 account.credits 对齐到计量器余额；没有计量器时保持原值（只清理非法数值）。
 * @param {object} account - 玩家账户
 * @param {object} [meter] - Credit计量器，默认取 account._meter
 * @returns {number} 对齐后的 account.credits
 */
export function syncAccountCredits(account, meter = account?._meter) {
  if (!account || typeof account !== 'object') return 0;
  if (meter && typeof meter === 'object' && Number.isFinite(meter.balance)) {
    account.credits = meter.balance;
  } else if (!Number.isFinite(account.credits)) {
    account.credits = 0;
  }
  return account.credits;
}

/**
 * 检查是否负担得起某行为
 * @param {object} meter - Credit计量器
 * @param {string} action - 行为类型
 * @returns {boolean}
 */
export function canAfford(meter, action) {
  const cost = CREDIT_COSTS[action] ?? 0;
  return meter.balance >= cost;
}

// 内部工具：记录历史
function logHistory(meter, action, amount, type) {
  meter.history.push({
    action,
    amount,
    type, // 'consume' | 'grant'
    at: Date.now()
  });

  // 保留最近200条，防止无限增长
  if (meter.history.length > 200) {
    meter.history.splice(0, meter.history.length - 200);
  }
}
