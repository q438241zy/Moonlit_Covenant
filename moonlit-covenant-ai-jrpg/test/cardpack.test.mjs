import test from 'node:test';
import assert from 'node:assert/strict';
import { openPacks, craftCard, getCollection, getCardAccountSummary, PACK, SHARD_COST, SHARD_GAIN } from '../cards/cardpack.mjs';
import { RARITIES } from '../cards/database.mjs';

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

test('重复卡转碎片：超过3张上限自动转化', () => {
  const acc = mkAccount();
  // 手动塞满某卡3张
  acc.collection['n_goblin'] = 3;
  // 用 craft 直接获得第4张（必然转化）
  acc.shards = SHARD_COST.bronze;
  const res = craftCard(acc, 'n_goblin');
  assert.ok(res.ok);
  assert.equal(acc.collection['n_goblin'], 4);
  assert.ok(res.result.converted);
  assert.equal(res.result.shardsGained, SHARD_GAIN.bronze);
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
