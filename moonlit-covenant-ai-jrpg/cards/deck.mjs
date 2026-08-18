// ═══════════════════════════════════════════════════════════════
// 组牌系统 —— 牌组构建 / 校验 / 费用曲线 / 预组牌组
// 规则（参考暗影诗章）：
//   · 牌组固定 40 张
//   · 同名卡最多 3 张
//   · 只能使用本职业卡 + 中立卡
// ═══════════════════════════════════════════════════════════════

import { getCard, availableCardsForClass, cardsByClass, CARDS } from './database.mjs';

export const DECK_SIZE = 40;
export const MAX_COPIES = 3;

// 校验牌组合法性
export function validateDeck(deck, classId) {
  const errors = [];
  if (!Array.isArray(deck)) return { ok: false, errors: ['牌组格式无效。'] };
  if (deck.length !== DECK_SIZE) errors.push(`牌组需恰好 ${DECK_SIZE} 张（当前 ${deck.length} 张）。`);

  const counts = new Map();
  for (const id of deck) {
    const card = getCard(id);
    if (!card) { errors.push(`未知卡牌: ${id}`); continue; }
    if (card.class !== classId && card.class !== 'neutral') {
      errors.push(`${card.name} 不属于${classId}职业可用范围。`);
    }
    counts.set(id, (counts.get(id) || 0) + 1);
  }
  for (const [id, n] of counts) {
    if (n > MAX_COPIES) errors.push(`${getCard(id)?.name || id} 超过 ${MAX_COPIES} 张上限（${n}）。`);
  }
  return { ok: errors.length === 0, errors, counts: Object.fromEntries(counts) };
}

// 费用曲线：返回 0..10+ 各费用的卡牌张数
export function getDeckCurve(deck) {
  const curve = {};
  for (let i = 0; i <= 7; i++) curve[i] = 0;
  for (const id of deck) {
    const card = getCard(id);
    if (!card) continue;
    const bucket = card.cost >= 7 ? 7 : card.cost;
    curve[bucket] += 1;
  }
  return curve; // {0:n,1:n,...,7:n}  其中7代表7费及以上
}

// 牌组统计：随从/法术/护符数量、平均费用、稀有度分布
export function getDeckStats(deck) {
  let followers = 0, spells = 0, amulets = 0, costSum = 0;
  const rarity = { bronze: 0, silver: 0, gold: 0, legendary: 0 };
  for (const id of deck) {
    const card = getCard(id);
    if (!card) continue;
    if (card.type === 'follower') followers++;
    else if (card.type === 'spell') spells++;
    else amulets++;
    costSum += card.cost;
    rarity[card.rarity]++;
  }
  return {
    total: deck.length,
    followers, spells, amulets,
    avgCost: deck.length ? +(costSum / deck.length).toFixed(2) : 0,
    rarity
  };
}

// 生成预组牌组（40张）：本职业 + 中立，兼顾曲线
export function buildStarterDeck(classId) {
  const pool = availableCardsForClass(classId);
  const deck = [];
  const counts = new Map();
  const add = (id) => {
    const n = counts.get(id) || 0;
    if (n >= MAX_COPIES) return false;
    deck.push(id);
    counts.set(id, n + 1);
    return true;
  };

  // 1) 每张本职业卡放2张
  for (const c of cardsByClass(classId)) add(c.id);
  for (const c of cardsByClass(classId)) add(c.id);
  // 2) 中立卡各2张
  const neutrals = pool.filter((c) => c.class === 'neutral');
  for (const c of neutrals) add(c.id);
  for (const c of neutrals) add(c.id);
  // 3) 补到40张：优先低费可用卡
  const sorted = [...pool].sort((a, b) => a.cost - b.cost);
  let guard = 0;
  while (deck.length < DECK_SIZE && guard++ < 500) {
    let added = false;
    for (const c of sorted) {
      if (deck.length >= DECK_SIZE) break;
      if (add(c.id)) { added = true; }
    }
    if (!added) break; // 全部满3张仍不足（理论上不会）
  }
  return deck.slice(0, DECK_SIZE);
}

// 三个职业的预组牌组（开局赠送 / AI 对手使用）
export function getStarterDecks() {
  return {
    lia: buildStarterDeck('lia'),
    lilith: buildStarterDeck('lilith'),
    serena: buildStarterDeck('serena')
  };
}

// 全部卡牌（图鉴用）
export function allCards() {
  return CARDS;
}
