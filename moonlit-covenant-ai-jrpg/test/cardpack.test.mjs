import test from 'node:test';
import assert from 'node:assert/strict';
import { openPacks, craftCard, getCollection, getCardAccountSummary, PACK, SHARD_COST, SHARD_GAIN, MAX_COPIES_KEEP } from '../cards/cardpack.mjs';
import { RARITIES, cardsByRarity } from '../cards/database.mjs';

const mkAccount = (diamonds = 5000) => ({ id: 'p1', diamonds, collection: {}, shards: 0, packPity: 0, totalPacks: 0 });

// 可控随机：constant 返回固定值；queue 按序列返回
const constRng = (v) => () => v;

test('开单包：扣钻石、返回8张、收录图鉴', () => {
  const acc = mkAccount(1000);
  const res = openPacks(acc, 1, constRng(0.99)); // 0.99 → legendary 区
  assert.ok(res.ok);
  assert.equal(res.allCards.length, PACK.cardsPerPack);
  assert.equal(acc.diamonds, 1000 - PACK.costSingle);
  assert.ok(Object.keys(acc.collection).length > 0);
});

test('钻石不足：拒绝开包', () => {
  const acc = mkAccount(10);
  const res = openPacks(acc, 1);
  assert.equal(res.ok, false);
  assert.equal(res.error.code, 'NO_DIAMONDS');
});

test('保底银+：全铜随机时最后一张提升为银', () => {
  const acc = mkAccount();
  const res = openPacks(acc, 1, constRng(0)); // 永远铜
  const rarities = res.allCards.map((c) => c.rarity);
  assert.ok(rarities.includes('silver'), '应至少有一张银');
});

test('保底虹：计数到顶时强制出虹并清零', () => {
  const acc = mkAccount();
  acc.packPity = 9; // 下一包到顶
  const res = openPacks(acc, 1, constRng(0)); // 正常都铜，但保底触发
  const hasLegendary = res.allCards.some((c) => c.rarity === 'legendary');
  assert.ok(hasLegendary, '应保底出虹');
  assert.equal(acc.packPity, 0, '出虹后计数清零');
});

test('十连：返回10包共80张', () => {
  const acc = mkAccount(10000);
  const res = openPacks(acc, 10, constRng(0.5));
  assert.ok(res.ok);
  assert.equal(res.packs.length, 10);
  assert.equal(res.allCards.length, 80);
  assert.equal(acc.diamonds, 10000 - PACK.costTen);
});

test('C3 重复卡转碎片：超过3张的卡转成碎片，收录数封顶为3', () => {
  const acc = mkAccount();
  // constRng(0)：前 7 张都是同一张铜卡，最后一张保底提升为银
  const bronze = cardsByRarity('bronze')[0];
  const res = openPacks(acc, 1, constRng(0));
  assert.ok(res.ok);
  const same = res.allCards.filter((c) => c.card.id === bronze.id);
  assert.equal(same.length, 7);
  assert.deepEqual(same.map((c) => c.count), [1, 2, 3, 3, 3, 3, 3]);
  assert.deepEqual(same.map((c) => c.converted), [false, false, false, true, true, true, true]);
  assert.deepEqual(same.map((c) => c.isNew), [true, false, false, false, false, false, false]);
  assert.equal(acc.collection[bronze.id], MAX_COPIES_KEEP);
  assert.equal(acc.shards, 4 * SHARD_GAIN.bronze);
  assert.ok(res.allCards.every((c) => c.count <= MAX_COPIES_KEEP));
  const col = getCollection(acc);
  assert.equal(col.cards.find((c) => c.id === bronze.id).count, MAX_COPIES_KEEP);
  // 再开十包：任何卡的收录数都不超过 3
  openPacks(acc, 10, constRng(0));
  assert.ok(Object.values(acc.collection).every((n) => n <= MAX_COPIES_KEEP));
});

test('C3 已有3张时合成第4张会被拒绝，碎片不变', () => {
  const acc = mkAccount();
  acc.collection['n_goblin'] = 3;
  acc.shards = SHARD_COST.bronze;
  const res = craftCard(acc, 'n_goblin');
  assert.equal(res.ok, false);
  assert.equal(res.error.code, 'MAX_COPIES');
  assert.equal(acc.shards, SHARD_COST.bronze);
  assert.equal(acc.collection['n_goblin'], 3);
  // 第 3 张仍然可以合成
  acc.collection['n_goblin'] = 2;
  const ok = craftCard(acc, 'n_goblin');
  assert.ok(ok.ok);
  assert.equal(ok.result.converted, false);
  assert.equal(acc.collection['n_goblin'], 3);
  assert.equal(acc.shards, 0);
});

test('C3 旧存档中超过3张的收录数读取时封顶为3', () => {
  const acc = mkAccount();
  acc.collection = { n_goblin: 7, n_wisp: 2 };
  const col = getCollection(acc);
  assert.equal(col.cards.find((c) => c.id === 'n_goblin').count, 3);
  assert.equal(col.cards.find((c) => c.id === 'n_wisp').count, 2);
  assert.equal(acc.collection.n_goblin, 3);
});

test('碎片合成：扣碎片、收录卡牌', () => {
  const acc = mkAccount();
  acc.shards = SHARD_COST.legendary;
  const res = craftCard(acc, 'lia_hero');
  assert.ok(res.ok);
  assert.equal(acc.shards, 0);
  assert.equal(acc.collection['lia_hero'], 1);
});

test('碎片不足：拒绝合成', () => {
  const acc = mkAccount();
  acc.shards = 1;
  const res = craftCard(acc, 'lia_hero');
  assert.equal(res.ok, false);
  assert.equal(res.error.code, 'NO_SHARDS');
});

test('图鉴：统计收录率与总数', () => {
  const acc = mkAccount(100000);
  openPacks(acc, 10, constRng(0.3));
  const col = getCollection(acc);
  assert.equal(col.total, 38);
  assert.ok(col.owned > 0);
  assert.ok(col.completion >= 0 && col.completion <= 100);
  const summary = getCardAccountSummary(acc);
  assert.equal(summary.totalCards, 38);
});
