/**
 * 玩出来的钻石（作者核#12 对 B2/B3 的修改：游戏不公开，但保留钻石、商店与召唤；钻石要能靠玩获得）
 *
 * 三个来源（数字全部在 REWARD_RULES，README「钻石与奖励」一节有同一张表）：
 *   1. 每日签到：基础 50 钻石，连续签到每天多 10，最多多 40（第 1 天 50 … 第 5 天起每天 90）；断签从第 1 天重新算。
 *   2. 主线章节首次通关：每章 160 钻石（两次钻石单抽），每章只发一次；同时按 CHARACTER_POOL[].joinChapter
 *      自动获得在该章正式入队的女主（30章入队表，核#14／提案 §4.5：莉亚 ch005、米娅 ch010、塞雷娜 ch012、
 *      伊芙琳 ch017、艾拉 ch018、芙蕾娅 ch019、奥菲利亚 ch020、莉莉丝 ch021），已经抽到的按重复补偿表折成钻石。
 *      入队章一定晚于她的登场章（unlockChapter），所以自动入队的女主在卡池里已经揭开封存卡。
 *   3. 卡牌对战（实验模式）获胜：每胜 40 钻石，每天前 5 胜有奖励，之后照常可以打，只是不再发钻石。
 * 价格参照：召唤（只收钻石）单抽 80 / 十连 720，卡牌单包 80 / 十连 800；商店的演示充值仍是免费补充，不受影响。
 *
 * 「一天」按服务器本地日期计算（和会员每日 Credit 相同），nextAt 是下一个本地零点的时间戳（毫秒）。
 * 所有函数只改传入的 account 对象，不做 I/O；account.rewards 来自旧存档时会先被规整。
 */

import { CHARACTER_POOL, duplicateCompensation } from './gacha.mjs';

export const REWARD_RULES = Object.freeze({
  daily: Object.freeze({ base: 50, streakStep: 10, streakBonusCap: 40 }),
  chapterFirstClear: 160,
  cardWin: Object.freeze({ diamonds: 40, dailyCap: 5 }),
  // 第一次进入卡牌对战时的实验模式起始资源：正好一次十连开包（800）+ 500 合成碎片
  cardStarter: Object.freeze({ diamonds: 800, shards: 500 })
});

/** 女主 id → 她在主线正式成为长期伙伴的章节 id（来自 CHARACTER_POOL 的 joinChapter，30章入队表：提案 §4.5）。 */
export const HEROINE_JOIN_CHAPTERS = Object.freeze(Object.fromEntries(
  CHARACTER_POOL.filter((c) => typeof c.joinChapter === 'string').map((c) => [c.id, c.joinChapter])
));

export const CHAPTER_ID_PATTERN = /^ch\d{3}$/;
const MAX_LOG = 30;
const MAX_CHAPTERS = 500;

// ─── 日期工具（服务器本地日期）───
function localParts(now) {
  const date = new Date(now);
  return [date.getFullYear(), date.getMonth(), date.getDate()];
}

/** YYYY-MM-DD（本地日期）。 */
export function dayKey(now = Date.now()) {
  const [y, m, d] = localParts(now);
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** 本地日期的连续天数编号（不受夏令时影响）；无法解析返回 NaN。 */
function dayNumber(key) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key || ''));
  if (!match) return NaN;
  return Math.round(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86400000);
}

/** 下一个本地零点的时间戳（毫秒）。 */
export function nextDayStart(now = Date.now()) {
  const [y, m, d] = localParts(now);
  return new Date(y, m, d + 1).getTime();
}

const count = (value) => (Number.isInteger(value) && value > 0 ? value : 0);
const diamondsOf = (account) => (Number.isFinite(account.diamonds) ? account.diamonds : 0);

/** 规整 account.rewards（新账户、旧存档、被改坏的数据都能用）。返回规整后的对象。 */
export function ensureRewards(account) {
  const raw = account.rewards && typeof account.rewards === 'object' && !Array.isArray(account.rewards) ? account.rewards : {};
  const daily = raw.daily && typeof raw.daily === 'object' ? raw.daily : {};
  const cardWins = raw.cardWins && typeof raw.cardWins === 'object' ? raw.cardWins : {};
  const strings = (list, pattern) => (Array.isArray(list) ? [...new Set(list.filter((x) => typeof x === 'string' && pattern.test(x)))] : []);
  const rewards = {
    daily: {
      last: Number.isFinite(dayNumber(daily.last)) ? daily.last : null,
      streak: count(daily.streak),
      claims: count(daily.claims)
    },
    chaptersCleared: strings(raw.chaptersCleared, CHAPTER_ID_PATTERN).slice(0, MAX_CHAPTERS),
    heroinesJoined: strings(raw.heroinesJoined, /^[a-z]+$/),
    cardWins: {
      day: Number.isFinite(dayNumber(cardWins.day)) ? cardWins.day : null,
      count: count(cardWins.count),
      total: count(cardWins.total)
    },
    log: Array.isArray(raw.log)
      ? raw.log.filter((e) => e && typeof e === 'object' && typeof e.type === 'string' && Number.isFinite(e.diamonds)).slice(-MAX_LOG)
      : []
  };
  account.rewards = rewards;
  if (!Number.isFinite(account.diamonds)) account.diamonds = 0;
  return rewards;
}

function addDiamonds(account, rewards, amount, type, ref, now) {
  if (!(amount > 0)) return 0;
  account.diamonds = diamondsOf(account) + amount;
  rewards.log.push({ type, ref: ref ?? null, diamonds: amount, at: now });
  if (rewards.log.length > MAX_LOG) rewards.log.splice(0, rewards.log.length - MAX_LOG);
  return amount;
}

/** 签到后连续天数仍有效时的连签天数（今天或昨天签过），否则 0。 */
function liveStreak(rewards, now) {
  const gap = dayNumber(dayKey(now)) - dayNumber(rewards.daily.last);
  return gap === 0 || gap === 1 ? rewards.daily.streak : 0;
}

/** 连签第 n 天能领多少钻石。 */
export function dailyAmount(streakDay) {
  const { base, streakStep, streakBonusCap } = REWARD_RULES.daily;
  const day = Math.max(1, Math.floor(Number(streakDay) || 1));
  return base + Math.min(streakBonusCap, (day - 1) * streakStep);
}

function cardWinsToday(rewards, now) {
  return rewards.cardWins.day === dayKey(now) ? rewards.cardWins.count : 0;
}

/**
 * 奖励概况（GET /api/rewards/status，契约 R-1）。不修改账户之外的任何东西；会规整 account.rewards。
 */
export function getRewardStatus(account, now = Date.now()) {
  const rewards = ensureRewards(account);
  const today = dayKey(now);
  const dailyAvailable = rewards.daily.last !== today;
  const streak = liveStreak(rewards, now);
  const winsToday = cardWinsToday(rewards, now);
  return {
    dailyAvailable,
    streak,
    nextAt: nextDayStart(now),
    // 下一次签到能拿到的数量：今天还没签就是今天的，已经签过就是明天的（明天继续签时连签 +1）
    dailyAmount: dailyAmount(streak + 1),
    chaptersCleared: [...rewards.chaptersCleared],
    chapterReward: REWARD_RULES.chapterFirstClear,
    cardWinsToday: winsToday,
    cardWinCap: REWARD_RULES.cardWin.dailyCap,
    cardWinReward: REWARD_RULES.cardWin.diamonds,
    heroineJoins: { ...HEROINE_JOIN_CHAPTERS },
    heroinesJoined: [...rewards.heroinesJoined],
    diamonds: diamondsOf(account),
    recent: rewards.log.slice(-10).reverse()
  };
}

/**
 * 每日签到（POST /api/rewards/daily，契约 R-1）。同一天重复调用不再发放。
 * @returns {{granted: boolean, diamonds: number, streak: number, nextAt: number, balance: number}}
 *   granted 本次是否发放；diamonds 本次发放的钻石数（没发为 0）；balance 发放后的钻石余额。
 */
export function claimDaily(account, now = Date.now()) {
  const rewards = ensureRewards(account);
  const today = dayKey(now);
  if (rewards.daily.last === today) {
    return { granted: false, diamonds: 0, streak: rewards.daily.streak, nextAt: nextDayStart(now), balance: diamondsOf(account) };
  }
  const streak = liveStreak(rewards, now) + 1;
  const amount = dailyAmount(streak);
  rewards.daily = { last: today, streak, claims: rewards.daily.claims + 1 };
  addDiamonds(account, rewards, amount, 'daily', `streak:${streak}`, now);
  return { granted: true, diamonds: amount, streak, nextAt: nextDayStart(now), balance: diamondsOf(account) };
}

/**
 * 按已通关章节补发女主：joinChapter 已通关、还没由主线发放过的女主，未拥有就加入 ownedCharacters，
 * 已经抽到的按重复补偿表折成钻石。每位女主只处理一次（记在 rewards.heroinesJoined）。
 */
function syncHeroineJoins(account, rewards, now) {
  const cleared = new Set(rewards.chaptersCleared);
  if (!Array.isArray(account.ownedCharacters)) account.ownedCharacters = [];
  const granted = [];
  const compensated = [];
  for (const heroine of CHARACTER_POOL) {
    if (!heroine.joinChapter || !cleared.has(heroine.joinChapter) || rewards.heroinesJoined.includes(heroine.id)) continue;
    rewards.heroinesJoined.push(heroine.id);
    if (account.ownedCharacters.includes(heroine.id)) {
      const amount = duplicateCompensation(heroine.rarity);
      addDiamonds(account, rewards, amount, 'heroine_duplicate', heroine.id, now);
      compensated.push({ id: heroine.id, diamonds: amount });
    } else {
      account.ownedCharacters.push(heroine.id);
      granted.push(heroine.id);
    }
  }
  return { granted, compensated };
}

/**
 * 主线章节通关（POST /api/story/progress，契约 R-2）。章节 id 是否存在由调用方对照 chapters/index.json 校验。
 * 首次通关发 REWARD_RULES.chapterFirstClear；重复调用幂等（只会补发后来才登记的女主）。
 * @returns {{granted: boolean, diamonds: number, chapterReward: number, heroinesGranted: string[],
 *   heroinesCompensated: Array<{id: string, diamonds: number}>, alreadyCleared: boolean, chaptersCleared: string[], balance: number}}
 *   granted：本次是否发放了任何东西；diamonds：本次发放的钻石总数（章节奖励 + 已拥有女主的补偿）。
 */
export function recordChapterClear(account, chapterId, now = Date.now()) {
  const id = String(chapterId || '');
  if (!CHAPTER_ID_PATTERN.test(id)) throw Object.assign(new Error('章节 ID 无效。'), { status: 400, code: 'UNKNOWN_CHAPTER' });
  const rewards = ensureRewards(account);
  const alreadyCleared = rewards.chaptersCleared.includes(id);
  let chapterReward = 0;
  if (!alreadyCleared) {
    rewards.chaptersCleared.push(id);
    chapterReward = addDiamonds(account, rewards, REWARD_RULES.chapterFirstClear, 'chapter_first_clear', id, now);
  }
  const heroines = syncHeroineJoins(account, rewards, now);
  const compensation = heroines.compensated.reduce((sum, item) => sum + item.diamonds, 0);
  const diamonds = chapterReward + compensation;
  return {
    granted: diamonds > 0 || heroines.granted.length > 0,
    diamonds,
    chapterReward,
    heroinesGranted: heroines.granted,
    heroinesCompensated: heroines.compensated,
    alreadyCleared,
    chaptersCleared: [...rewards.chaptersCleared],
    balance: diamondsOf(account)
  };
}

/**
 * 卡牌对战获胜（契约 R-3）。每天前 REWARD_RULES.cardWin.dailyCap 胜发放；之后 capped=true、diamonds=0。
 * 同一局只能调用一次（由服务器在对局状态上记 reward 保证）。winsToday 是今天已经拿到奖励的胜场数（最多等于 cap）。
 * @returns {{diamonds: number, capped: boolean, winsToday: number, cap: number, balance: number}}
 */
export function grantCardWin(account, now = Date.now()) {
  const rewards = ensureRewards(account);
  const today = dayKey(now);
  if (rewards.cardWins.day !== today) rewards.cardWins = { day: today, count: 0, total: rewards.cardWins.total };
  const cap = REWARD_RULES.cardWin.dailyCap;
  rewards.cardWins.total += 1;
  if (rewards.cardWins.count >= cap) {
    return { diamonds: 0, capped: true, winsToday: rewards.cardWins.count, cap, balance: diamondsOf(account) };
  }
  rewards.cardWins.count += 1;
  const diamonds = addDiamonds(account, rewards, REWARD_RULES.cardWin.diamonds, 'card_win', null, now);
  return { diamonds, capped: false, winsToday: rewards.cardWins.count, cap, balance: diamondsOf(account) };
}
