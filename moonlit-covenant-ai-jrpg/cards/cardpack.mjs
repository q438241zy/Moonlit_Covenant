// ═══════════════════════════════════════════════════════════════
// 卡包抽取系统 —— 概率 / 保底 / 图鉴收录 / 碎片合成
// 概率（每张卡）：铜50% 银25% 金20% 虹5%
// 保底：
//   · 每包至少 1 张银或以上
//   · 每 10 包至少 1 张虹（出虹后计数清零）
// 碎片：超过3张上限的重复卡自动转化为碎片，碎片可合成指定卡牌
// ═══════════════════════════════════════════════════════════════

import { CARDS, getCard, cardsByRarity, RARITIES } from './database.mjs';

export const PACK = {
  cardsPerPack: 8,
  costSingle: 80,    // 单包钻石
  costTen: 800,      // 十连钻石
  rates: { bronze: 0.50, silver: 0.25, gold: 0.20, legendary: 0.05 },
  legendaryPity: 10, // N 包保底虹
  minSilverPerPack: 1
};

export const MAX_COPIES_KEEP = 3; // 超过此数量的重复卡转碎片

// 重复卡转化碎片 / 合成消耗
export const SHARD_GAIN = { bronze: 10, silver: 30, gold: 100, legendary: 500 };
export const SHARD_COST = { bronze: 50, silver: 120, gold: 350, legendary: 1000 };

function ensureAccount(account) {
  if (!account.collection) account.collection = {};
  if (typeof account.shards !== 'number') account.shards = 0;
  if (typeof account.packPity !== 'number') account.packPity = 0;
  if (typeof account.totalPacks !== 'number') account.totalPacks = 0;
  return account;
}

// 按概率抽取一个稀有度
function rollRarity(rng, forceRarity = null) {
  if (forceRarity) return forceRarity;
  const r = rng();
  const { bronze, silver, gold } = PACK.rates;
  if (r < bronze) return 'bronze';
  if (r < bronze + silver) return 'silver';
  if (r < bronze + silver + gold) return 'gold';
  return 'legendary';
}

// 从某稀有度中随机选一张卡
function pickCardOfRarity(rarity, rng) {
  const pool = cardsByRarity(rarity);
  return pool[Math.floor(rng() * pool.length)];
}

// 开一包（8张）
function openOnePack(account, rng) {
  const cards = [];
  let gotLegendary = false;
  let gotSilverPlus = false;

  for (let i = 0; i < PACK.cardsPerPack; i++) {
    let rarity = rollRarity(rng);
    // 保底虹：最后一张若仍未出虹且计数到顶，强制虹
    if (i === PACK.cardsPerPack - 1 && !gotLegendary && account.packPity + 1 >= PACK.legendaryPity) {
      rarity = 'legendary';
    }
    // 保底银+：最后一张若全是铜，提升到银
    if (i === PACK.cardsPerPack - 1 && !gotSilverPlus && rarity === 'bronze') {
      rarity = 'silver';
    }
    const card = pickCardOfRarity(rarity, rng);
    if (rarity !== 'bronze') gotSilverPlus = true;
    if (rarity === 'legendary') gotLegendary = true;
    cards.push(card);
  }

  // 更新保底计数
  account.packPity = gotLegendary ? 0 : account.packPity + 1;
  account.totalPacks += 1;
  return cards;
}

// 收录卡牌到图鉴，处理重复转碎片
function collectCard(account, card) {
  const owned = account.collection[card.id] || 0;
  account.collection[card.id] = owned + 1;
  const isNew = owned === 0;
  let converted = false;
  let shardsGained = 0;
  if (owned + 1 > MAX_COPIES_KEEP) {
    converted = true;
    shardsGained = SHARD_GAIN[card.rarity];
    account.shards += shardsGained;
  }
  return { card, rarity: card.rarity, isNew, converted, shardsGained, count: account.collection[card.id] };
}

// 开卡包（packCount = 1 或 10）
export function openPacks(account, packCount = 1, rng = Math.random) {
  ensureAccount(account);
  const cost = packCount >= 10 ? PACK.costTen : PACK.costSingle * packCount;
  if ((account.diamonds || 0) < cost) {
    return { ok: false, error: { code: 'NO_DIAMONDS', message: `钻石不足，需要 ${cost}。` } };
  }
  account.diamonds -= cost;

  const results = [];
  for (let p = 0; p < packCount; p++) {
    const packCards = openOnePack(account, rng);
    const collected = packCards.map((c) => collectCard(account, c));
    results.push(collected);
  }

  return {
    ok: true,
    packs: results,
    allCards: results.flat(),
    pity: account.packPity,
    shards: account.shards,
    diamonds: account.diamonds,
    totalPacks: account.totalPacks
  };
}

// 碎片合成卡牌
export function craftCard(account, cardId, rng = Math.random) {
  ensureAccount(account);
  const card = getCard(cardId);
  if (!card) return { ok: false, error: { code: 'NO_CARD', message: '卡牌不存在。' } };
  const cost = SHARD_COST[card.rarity];
  if (account.shards < cost) {
    return { ok: false, error: { code: 'NO_SHARDS', message: `碎片不足，需要 ${cost}。` } };
  }
  account.shards -= cost;
  const result = collectCard(account, card);
  return { ok: true, result, shards: account.shards, collection: account.collection[card.id] };
}

// 图鉴：返回全部卡牌及收录状态
export function getCollection(account) {
  ensureAccount(account);
  const list = CARDS.map((card) => {
    const count = account.collection[card.id] || 0;
    return {
      id: card.id, name: card.name, class: card.class, type: card.type,
      cost: card.cost, rarity: card.rarity, attack: card.attack, health: card.health,
      desc: card.desc, art: card.art,
      owned: count > 0, count,
      craftCost: SHARD_COST[card.rarity]
    };
  });
  const ownedCount = list.filter((c) => c.owned).length;
  return {
    cards: list,
    owned: ownedCount,
    total: list.length,
    completion: +(ownedCount / list.length * 100).toFixed(1),
    shards: account.shards
  };
}

// 账户卡系统摘要
export function getCardAccountSummary(account) {
  ensureAccount(account);
  const ownedCount = Object.keys(account.collection).length;
  return {
    shards: account.shards,
    packPity: account.packPity,
    totalPacks: account.totalPacks,
    ownedCards: ownedCount,
    totalCards: CARDS.length,
    diamonds: account.diamonds || 0
  };
}

export { RARITIES };
