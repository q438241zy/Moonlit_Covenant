/**
 * 骑士联盟会员系统
 * 三个等级：银骑士(68元)、金骑士(198元)、钻石骑士(398元)（演示版：支付未接入，标价仅作展示）
 * 每日赠送Credit：20、50、120
 * 钻石充值档位：6/30/68/128/328/648钻石对应6/30/68/128/328/648元
 *
 * Credit 只有一本账：余额以 account._meter（Credit计量器）为准，account.credits 是它的镜像。
 * - 每日发放（grantDailyCredits）在计量器存在时直接入账计量器（契约 K-5）。
 * - 购买会员（purchaseMembership）只改 account.credits，并在返回值里给出本次实际发放的 granted，
 *   由服务器把 granted 加进计量器（契约 K-4）；会员仍有效且当天已发过时 granted 为 0。
 */

import crypto from 'node:crypto';
import { addCredit, syncAccountCredits } from './credit.mjs';

const DAY_MS = 24 * 60 * 60 * 1000;
// 每次购买（或续购）增加的有效期
export const MEMBERSHIP_DAYS = 30;

// 会员等级定义（perks 只列真正生效的权益；头像框、称号、表情包、客服、内测资格等尚未实现，不再展示）
export const MEMBERSHIP_TIERS = [
  {
    id: 'silver',
    name: '银骑士',
    price: 68,
    dailyCredit: 20,
    perks: ['每日20Credit', '有效期30天，期内续购顺延'],
    badge: '🥈',
    color: '#c0c0c0'
  },
  {
    id: 'gold',
    name: '金骑士',
    price: 198,
    dailyCredit: 50,
    perks: ['每日50Credit', '有效期30天，期内续购顺延'],
    badge: '🥇',
    color: '#ffd700'
  },
  {
    id: 'diamond',
    name: '钻石骑士',
    price: 398,
    dailyCredit: 120,
    perks: ['每日120Credit', '有效期30天，期内续购顺延'],
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
 * 购买会员（演示版：不扣款）
 *
 * - 会员无效（从未开通或已过期）时：开通该等级，有效期从现在起 30 天。
 * - 会员仍有效时重复购买：只把有效期顺延 30 天（并切换为本次购买的等级），不会重复发放。
 * - 当天的 Credit 只发一次：lastGrantDate 已是今天时 granted 为 0。
 *
 * 不直接改计量器：服务器按契约 K-4 把返回的 granted 加进 account._meter。
 * 这里先把 account.credits 对齐到计量器余额，再加上 granted，所以服务器入账后两者仍然一致。
 *
 * @param {object} account - 玩家账户
 * @param {string} tierId - 会员等级ID
 * @param {number} [now] - 当前时间戳（测试用）
 * @returns {{ok: boolean, account: object, granted: number, message: string, renewed?: boolean, expiry?: number}}
 */
export function purchaseMembership(account, tierId, now = Date.now()) {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  if (!tier) {
    return { ok: false, account, granted: 0, message: '未知会员等级。' };
  }
  if (!Array.isArray(account.purchaseHistory)) account.purchaseHistory = [];
  syncAccountCredits(account);

  const today = todayKey(now);
  const active = isMembershipActive(account, now);
  const previousTier = active ? account.membership : null;

  // 有效期：仍有效时在原到期日上顺延，否则从现在起算
  const base = active ? account.membershipExpiry : now;
  account.membership = tier.id;
  account.membershipExpiry = base + MEMBERSHIP_DAYS * DAY_MS;

  // 当天只发一次 Credit
  let granted = 0;
  if (account.lastGrantDate !== today) {
    granted = tier.dailyCredit;
    account.credits += granted;
    account.lastGrantDate = today;
  }

  // 记录购买历史（服务器负责裁剪长度）
  account.purchaseHistory.push({
    id: crypto.randomUUID(),
    type: 'membership',
    tierId: tier.id,
    tierName: tier.name,
    price: tier.price,
    renewed: active,
    granted,
    at: now
  });

  const expiryText = formatDate(account.membershipExpiry);
  const grantText = granted > 0 ? `已发放${granted}Credit` : '今日Credit已发放过，明天进入游戏时自动发放';
  let message;
  if (!active) {
    message = `恭喜成为${tier.name}！${grantText}，有效期${MEMBERSHIP_DAYS}天（至${expiryText}）。`;
  } else if (previousTier === tier.id) {
    message = `${tier.name}已续期${MEMBERSHIP_DAYS}天（至${expiryText}）。${grantText}。`;
  } else {
    message = `已切换为${tier.name}，有效期顺延${MEMBERSHIP_DAYS}天（至${expiryText}）。${grantText}。`;
  }

  return {
    ok: true,
    account,
    granted,
    renewed: active,
    expiry: account.membershipExpiry,
    message
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
  if (!Array.isArray(account.purchaseHistory)) account.purchaseHistory = [];

  const total = pack.diamonds + pack.bonus;
  account.diamonds = (Number.isFinite(account.diamonds) ? account.diamonds : 0) + total;

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
 * 每日Credit发放（每次读取账户时调用，同一天只发一次）
 * 检查会员是否有效，若有效且今日未领取则发放。
 * 计量器（account._meter）存在时直接入账计量器，并让 account.credits 与计量器余额一致（契约 K-5）。
 * @param {object} account - 玩家账户
 * @param {number} [now] - 当前时间戳（测试用）
 * @returns {{ok: boolean, granted: number, message: string}}
 */
export function grantDailyCredits(account, now = Date.now()) {
  const today = todayKey(now);

  // 检查是否有有效会员
  if (!account.membership || !account.membershipExpiry) {
    return { ok: false, granted: 0, message: '暂无有效会员。' };
  }

  if (!isMembershipActive(account, now)) {
    // 会员已过期（或到期时间数据异常）
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

  const meter = account._meter;
  if (meter && typeof meter === 'object' && Number.isFinite(meter.balance)) {
    addCredit(meter, tier.dailyCredit, 'membership_daily');
    syncAccountCredits(account, meter);
  } else {
    account.credits = (Number.isFinite(account.credits) ? account.credits : 0) + tier.dailyCredit;
  }
  account.lastGrantDate = today;

  return {
    ok: true,
    granted: tier.dailyCredit,
    message: `${tier.name}每日福利：+${tier.dailyCredit}Credit！`
  };
}

/**
 * 获取当前会员信息
 * @param {object} account - 玩家账户
 * @param {number} [now] - 当前时间戳（测试用）
 * @returns {object|null} 当前等级信息或null
 */
export function getMembershipInfo(account, now = Date.now()) {
  if (!isMembershipActive(account, now)) return null;

  const tier = MEMBERSHIP_TIERS.find((t) => t.id === account.membership);
  if (!tier) return null;

  return {
    ...tier,
    expiry: account.membershipExpiry,
    daysRemaining: Math.max(0, Math.ceil((account.membershipExpiry - now) / DAY_MS)),
    todayGranted: account.lastGrantDate === todayKey(now)
  };
}

/** 会员当前是否有效（已开通且未过期）。 */
export function isMembershipActive(account, now = Date.now()) {
  return Boolean(account?.membership) && Number.isFinite(account?.membershipExpiry) && now <= account.membershipExpiry;
}

// 内部工具：生成日期键 (YYYY-MM-DD，服务器本地时区)
function todayKey(now = Date.now()) {
  const date = new Date(now);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 内部工具：到期日的可读形式（YYYY-MM-DD）
function formatDate(timestamp) {
  return todayKey(timestamp);
}
