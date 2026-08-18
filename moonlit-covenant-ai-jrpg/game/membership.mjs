/**
 * 骑士联盟会员系统
 * 三个等级：银骑士(68元)、金骑士(198元)、钻石骑士(398元)
 * 每日赠送Credit：20、50、120
 * 钻石充值档位：6/30/68/128/328/648钻石对应6/30/68/128/328/648元
 */

import crypto from 'node:crypto';

// 会员等级定义
export const MEMBERSHIP_TIERS = [
  {
    id: 'silver',
    name: '银骑士',
    price: 68,
    dailyCredit: 20,
    perks: ['每日20Credit', '专属银框头像', '优先客服'],
    badge: '🥈',
    color: '#c0c0c0'
  },
  {
    id: 'gold',
    name: '金骑士',
    price: 198,
    dailyCredit: 50,
    perks: ['每日50Credit', '金框头像+称号', '专属表情包', '优先客服'],
    badge: '🥇',
    color: '#ffd700'
  },
  {
    id: 'diamond',
    name: '钻石骑士',
    price: 398,
    dailyCredit: 120,
    perks: ['每日120Credit', '钻石框+动态称号', '全部表情包', '1v1客服', '内测资格'],
    badge: '💎',
    color: '#b9f2ff'
  }
];

// 钻石充值档位
export const DIAMOND_PACKS = [
  { id: 'pack_6', diamonds: 6, price: 6, bonus: 0, label: '6钻石' },
  { id: 'pack_30', diamonds: 30, price: 30, bonus: 3, label: '30钻石(+3)' },
  { id: 'pack_68', diamonds: 68, price: 68, bonus: 8, label: '68钻石(+8)' },
  { id: 'pack_128', diamonds: 128, price: 128, bonus: 18, label: '128钻石(+18)' },
  { id: 'pack_328', diamonds: 328, price: 328, bonus: 58, label: '328钻石(+58)' },
  { id: 'pack_648', diamonds: 648, price: 648, bonus: 128, label: '648钻石(+128)' }
];

/**
 * 创建玩家账户
 */
export function createPlayerAccount(name) {
  const cleanName = String(name || '队长').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 16) || '队长';
  return {
    id: crypto.randomUUID(),
    name: cleanName,
    diamonds: 0,
    credits: 0,
    membership: null,
    membershipExpiry: null,
    purchaseHistory: [],
    lastGrantDate: null,
    createdAt: Date.now()
  };
}

/**
 * 购买会员
 * @returns {{ok: boolean, account: object, message: string}}
 */
export function purchaseMembership(account, tierId) {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  if (!tier) {
    return { ok: false, account, message: '未知会员等级。' };
  }

  // 设置会员状态，有效期30天
  account.membership = tier.id;
  account.membershipExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;

  // 首次购买立即发放当日Credit
  account.credits += tier.dailyCredit;
  account.lastGrantDate = todayKey();

  // 记录购买历史
  account.purchaseHistory.push({
    id: crypto.randomUUID(),
    type: 'membership',
    tierId: tier.id,
    tierName: tier.name,
    price: tier.price,
    at: Date.now()
  });

  return {
    ok: true,
    account,
    message: `恭喜成为${tier.name}！已发放${tier.dailyCredit}Credit，有效期30天。`
  };
}

/**
 * 购买钻石
 * @returns {{ok: boolean, account: object, message: string}}
 */
export function purchaseDiamonds(account, packId) {
  const pack = DIAMOND_PACKS.find((p) => p.id === packId);
  if (!pack) {
    return { ok: false, account, message: '未知充值档位。' };
  }

  const total = pack.diamonds + pack.bonus;
  account.diamonds += total;

  account.purchaseHistory.push({
    id: crypto.randomUUID(),
    type: 'diamond',
    packId: pack.id,
    diamonds: pack.diamonds,
    bonus: pack.bonus,
    price: pack.price,
    at: Date.now()
  });

  const bonusText = pack.bonus > 0 ? `（含赠送${pack.bonus}）` : '';
  return {
    ok: true,
    account,
    message: `充值成功！获得${total}钻石${bonusText}，当前余额${account.diamonds}钻石。`
  };
}

/**
 * 每日Credit发放（需每天调用一次）
 * 检查会员是否有效，若有效且今日未领取则发放
 */
export function grantDailyCredits(account) {
  const today = todayKey();

  // 检查是否有有效会员
  if (!account.membership || !account.membershipExpiry) {
    return { ok: false, granted: 0, message: '暂无有效会员。' };
  }

  if (Date.now() > account.membershipExpiry) {
    // 会员已过期
    account.membership = null;
    account.membershipExpiry = null;
    return { ok: false, granted: 0, message: '会员已过期，请续费。' };
  }

  // 今日已领取
  if (account.lastGrantDate === today) {
    return { ok: false, granted: 0, message: '今日Credit已领取。' };
  }

  const tier = MEMBERSHIP_TIERS.find((t) => t.id === account.membership);
  if (!tier) {
    return { ok: false, granted: 0, message: '会员数据异常。' };
  }

  account.credits += tier.dailyCredit;
  account.lastGrantDate = today;

  return {
    ok: true,
    granted: tier.dailyCredit,
    message: `${tier.name}每日福利：+${tier.dailyCredit}Credit！`
  };
}

/**
 * 获取当前会员信息
 * @returns {object|null} 当前等级信息或null
 */
export function getMembershipInfo(account) {
  if (!account.membership) return null;

  // 检查是否过期
  if (account.membershipExpiry && Date.now() > account.membershipExpiry) {
    return null;
  }

  const tier = MEMBERSHIP_TIERS.find((t) => t.id === account.membership);
  if (!tier) return null;

  return {
    ...tier,
    expiry: account.membershipExpiry,
    daysRemaining: Math.max(0, Math.ceil((account.membershipExpiry - Date.now()) / (24 * 60 * 60 * 1000))),
    todayGranted: account.lastGrantDate === todayKey()
  };
}

// 内部工具：生成今日日期键 (YYYY-MM-DD)
function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
