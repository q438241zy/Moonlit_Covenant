// 经济逻辑测试（轨道 G）：抽卡概率与保底、isNew、会员发放、Credit 单账、换装规则、抽卡池文本。
import test from 'node:test';
import assert from 'node:assert/strict';

import { CHARACTERS } from '../game/content.mjs';
import { CREDIT_COSTS, addCredit, createCreditMeter, getMeterStatus } from '../game/credit.mjs';
import { CHARACTER_POOL, COSTUME_POOL, GACHA_RATES, PITY_THRESHOLD, pullGacha } from '../game/gacha.mjs';
import { MEMBERSHIP_TIERS, createPlayerAccount, getMembershipInfo, grantDailyCredits, purchaseMembership } from '../game/membership.mjs';
import { equipCostume } from '../game/costume.mjs';

const DAY = 24 * 60 * 60 * 1000;
// 固定在本地时间正午，跨天推算不受时区 / 夏令时影响
const DAY0 = new Date(2026, 9, 20, 12, 0, 0).getTime();
const DAY1 = new Date(2026, 9, 21, 12, 0, 0).getTime();

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 模拟服务器建号：demo 起始 600 Credit，计量器按账户余额创建。 */
function newAccount(credits = 600) {
  const account = createPlayerAccount('测试');
  account.credits = credits;
  account._meter = createCreditMeter(account);
  return account;
}

/** 模拟服务器的会员购买路由：按契约 K-4 把 result.granted 记进计量器。 */
function serverPurchase(account, tierId, now) {
  const result = purchaseMembership(account, tierId, now);
  if (result.ok && account._meter) {
    const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
    addCredit(account._meter, result.granted ?? tier.dailyCredit, 'membership_daily');
  }
  return result;
}

// ─── G4 概率表与保底 ───

test('G4: published rates are the real rates; every listed rarity exists in its pool', () => {
  assert.deepEqual(GACHA_RATES.character, { 5: 0.02, 4: 0.98 });
  for (const [pool, rates] of Object.entries(GACHA_RATES)) {
    const items = pool === 'costume' ? COSTUME_POOL : CHARACTER_POOL;
    const sum = Object.values(rates).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `${pool} rates sum to ${sum}`);
    // 前端按 rates[池][稀有度] ÷ 该稀有度条目数 公示单个条目概率（契约 K-11），条目数不能为 0
    for (const rarity of Object.keys(rates)) {
      assert.ok(items.some((item) => item.rarity === Number(rarity)), `${pool} has no ${rarity}★ item`);
    }
    // 反过来，池里的每个稀有度都要在概率表里公示
    for (const item of items) assert.ok(rates[item.rarity] > 0, `${pool}:${item.id} rarity ${item.rarity} not in rates`);
  }
});

test('G6: the 90th pull without a 5★ is always 5★, then the counter resets', (t) => {
  t.mock.method(Math, 'random', () => 0.5); // 0.5 永远落在 4★ 区间：只有保底能出 5★
  const account = newAccount(100000);
  const rarities = [];
  for (let i = 0; i < 9; i += 1) {
    const result = pullGacha(account, account._meter, 'character', 10);
    assert.equal(result.ok, true);
    rarities.push(...result.results.map((item) => item.rarity));
  }
  assert.equal(rarities.length, PITY_THRESHOLD);
  assert.deepEqual(rarities.slice(0, PITY_THRESHOLD - 1).filter((r) => r === 5), []);
  assert.equal(rarities[PITY_THRESHOLD - 1], 5);
  assert.equal(account.pityCounters.character, 0);

  const next = pullGacha(account, account._meter, 'character', 1);
  assert.equal(next.results[0].rarity, 4);
  assert.equal(next.pity, 1);

  // 服饰池同样第 90 抽必出 5★（0.5 落在 3★ 区间）
  const costumeRarities = [];
  for (let i = 0; i < PITY_THRESHOLD; i += 1) costumeRarities.push(pullGacha(account, account._meter, 'costume', 1).results[0].rarity);
  assert.equal(costumeRarities.filter((r) => r === 5).length, 1);
  assert.equal(costumeRarities[PITY_THRESHOLD - 1], 5);
});

test('G4/G6: 20,000 character pulls give only 4★/5★ with ~2% base 5★ rate', (t) => {
  t.mock.method(Math, 'random', mulberry32(20261020));
  const account = newAccount(10 ** 9);
  const counts = { 3: 0, 4: 0, 5: 0 };
  for (let i = 0; i < 2000; i += 1) {
    for (const item of pullGacha(account, account._meter, 'character', 10).results) counts[item.rarity] += 1;
  }
  const total = counts[3] + counts[4] + counts[5];
  assert.equal(total, 20000);
  assert.equal(counts[3], 0, 'character pool must never yield 3★');
  // 基础 2%，加上 90 抽保底后的综合概率约 2.4%（1 / 41.9）
  const share = counts[5] / total;
  assert.ok(share > 0.018 && share < 0.03, `5★ share ${share}`);
});

test('G4: costume pool follows its published 3★/4★/5★ split', (t) => {
  t.mock.method(Math, 'random', mulberry32(7));
  const account = newAccount(10 ** 9);
  const counts = { 3: 0, 4: 0, 5: 0 };
  for (let i = 0; i < 2000; i += 1) {
    for (const item of pullGacha(account, account._meter, 'costume', 10).results) counts[item.rarity] += 1;
  }
  assert.ok(Math.abs(counts[3] / 20000 - 0.8) < 0.02, `3★ ${counts[3]}`);
  assert.ok(Math.abs(counts[4] / 20000 - 0.17) < 0.02, `4★ ${counts[4]}`);
  assert.ok(counts[5] / 20000 > 0.025 && counts[5] / 20000 < 0.045, `5★ ${counts[5]}`);
});

test('G4: isNew is true only the first time an item is obtained', (t) => {
  t.mock.method(Math, 'random', mulberry32(42));
  const account = newAccount(100000);
  const seen = new Set();
  for (let i = 0; i < 6; i += 1) {
    for (const item of pullGacha(account, account._meter, 'character', 10).results) {
      assert.equal(item.isNew, !seen.has(item.id), `${item.id} pull ${item.pullIndex}`);
      seen.add(item.id);
    }
  }
  // 60 抽里必然有重复，且拥有列表记录了每个抽到的角色（不重复）
  assert.ok(seen.size < 60);
  assert.deepEqual([...account.ownedCharacters].sort(), [...seen].sort());

  // 已拥有全部角色：之后的结果一律不是新的
  const veteran = newAccount(1000);
  veteran.ownedCharacters = CHARACTER_POOL.map((c) => c.id);
  const again = pullGacha(veteran, veteran._meter, 'character', 10);
  assert.ok(again.results.every((item) => item.isNew === false));
  assert.equal(veteran.ownedCharacters.length, CHARACTER_POOL.length);

  // 服饰池用的是服装拥有列表
  const dresser = newAccount(1000);
  dresser.ownedCostumes = COSTUME_POOL.map((c) => c.id);
  assert.ok(pullGacha(dresser, dresser._meter, 'costume', 10).results.every((item) => item.isNew === false));
});

test('G4: unknown pool names fall back to the character pool without corrupting pity', () => {
  const account = newAccount(1000);
  const result = pullGacha(account, account._meter, '__proto__', '10');
  assert.equal(result.ok, true);
  assert.equal(result.pool, 'character');
  assert.equal(result.results.length, 10);
  assert.ok(result.results.every((item) => item.rarity >= 4));
  assert.deepEqual(Object.keys(account.pityCounters), ['character']);
});

// ─── G1 一本账 ───

test('G1: gacha spending keeps account.credits equal to the meter balance', () => {
  const account = newAccount(600);
  const result = pullGacha(account, account._meter, 'character', 10);
  assert.equal(result.ok, true);
  assert.equal(account._meter.balance, 600 - CREDIT_COSTS.gacha_ten);
  assert.equal(account.credits, account._meter.balance);
  const broke = newAccount(5);
  const denied = pullGacha(broke, broke._meter, 'character', 1);
  assert.equal(denied.ok, false);
  assert.equal(broke.credits, 5);
});

test('G1/G6: the day-2 membership grant goes into the meter (one ledger)', () => {
  const account = newAccount(600);
  pullGacha(account, account._meter, 'character', 10); // 两本账分叉的原始场景：先花掉一部分
  const first = serverPurchase(account, 'silver', DAY0);
  assert.equal(first.granted, 20);
  assert.equal(account._meter.balance, 600 - 90 + 20);
  assert.equal(account.credits, account._meter.balance);

  // 同一天再读账户：不再发放
  assert.equal(grantDailyCredits(account, DAY0 + 60 * 1000).granted, 0);

  // 第 2 天：计量器余额增加 dailyCredit，两本账保持一致
  const before = account._meter.balance;
  const day2 = grantDailyCredits(account, DAY1);
  assert.equal(day2.ok, true);
  assert.equal(day2.granted, 20);
  assert.equal(account._meter.balance, before + 20);
  assert.equal(account.credits, account._meter.balance);
  assert.equal(getMeterStatus(account._meter).history.at(-1).action, 'membership_daily');
  // 第 2 天再次读取：不重复
  assert.equal(grantDailyCredits(account, DAY1 + 3600 * 1000).granted, 0);
  assert.equal(account._meter.balance, before + 20);
});

test('G1: without a meter the daily grant still credits the account', () => {
  const account = createPlayerAccount('无计量器');
  purchaseMembership(account, 'gold', DAY0);
  assert.equal(account.credits, 50);
  assert.equal(grantDailyCredits(account, DAY1).granted, 50);
  assert.equal(account.credits, 100);
});

// ─── G2 重复购买 ───

test('G2/G6: buying membership 3 times on the same day grants credit once and only extends validity', () => {
  const account = newAccount(600);
  const results = [1, 2, 3].map((i) => serverPurchase(account, 'gold', DAY0 + i * 1000));
  assert.deepEqual(results.map((r) => r.ok), [true, true, true]);
  assert.deepEqual(results.map((r) => r.granted), [50, 0, 0]);
  assert.deepEqual(results.map((r) => r.renewed), [false, true, true]);
  assert.equal(account._meter.balance, 650);
  assert.equal(account.credits, 650);
  // 有效期在原到期日上逐次顺延 30 天
  assert.equal(account.membershipExpiry, DAY0 + 1000 + 90 * DAY);
  assert.equal(account.purchaseHistory.length, 3);
  assert.match(results[1].message, /续期/);
  assert.match(results[1].message, /今日Credit已发放过/);
  const info = getMembershipInfo(account, DAY0 + 2000);
  assert.equal(info.daysRemaining, 90);
  assert.equal(info.todayGranted, true);
});

test('G2: switching tier while active extends validity without a second same-day grant', () => {
  const account = newAccount(0);
  serverPurchase(account, 'silver', DAY0);
  const upgrade = serverPurchase(account, 'diamond', DAY0 + 5000);
  assert.equal(upgrade.granted, 0);
  assert.equal(account.membership, 'diamond');
  assert.equal(account._meter.balance, 20);
  assert.match(upgrade.message, /已切换为钻石骑士/);
  // 第二天按新等级发放
  assert.equal(grantDailyCredits(account, DAY1).granted, 120);
  assert.equal(account._meter.balance, 140);
  assert.equal(account.credits, 140);
});

test('G2: a purchase after expiry starts a new term and grants again', () => {
  const account = newAccount(0);
  serverPurchase(account, 'silver', DAY0);
  const later = DAY0 + 40 * DAY;
  assert.equal(grantDailyCredits(account, later).ok, false); // 已过期，清除会员
  assert.equal(account.membership, null);
  const renewed = serverPurchase(account, 'silver', later);
  assert.equal(renewed.renewed, false);
  assert.equal(renewed.granted, 20);
  assert.equal(account.membershipExpiry, later + 30 * DAY);
  assert.equal(account._meter.balance, 40);
});

test('G2: unknown tiers are rejected without side effects', () => {
  const account = newAccount(600);
  const result = purchaseMembership(account, 'platinum', DAY0);
  assert.equal(result.ok, false);
  assert.equal(result.granted, 0);
  assert.equal(account.membership, null);
  assert.equal(account.purchaseHistory.length, 0);
});

// ─── G3 权益如实 ───

test('G3: membership perks only list what is implemented', () => {
  for (const tier of MEMBERSHIP_TIERS) {
    assert.ok(tier.perks.length > 0);
    assert.ok(tier.perks.includes(`每日${tier.dailyCredit}Credit`), tier.id);
    for (const perk of tier.perks) {
      assert.doesNotMatch(perk, /头像|框|称号|表情|客服|内测/, `${tier.id}: ${perk}`);
    }
  }
});

// ─── G6 换装规则 ───

test('G6: equipCostume rejects unowned / foreign costumes and accepts default', () => {
  const account = createPlayerAccount('换装');
  account.ownedCharacters = ['lia', 'mia'];
  account.ownedCostumes = ['lia_maid', 'mia_newyear', 'serena_swimsuit'];

  assert.equal(equipCostume(account, 'lia', 'lia_newyear').ok, false, 'not owned');
  assert.equal(equipCostume(account, 'lia', 'lia_newyear').message, '尚未拥有该服装。');
  const foreign = equipCostume(account, 'lia', 'mia_newyear');
  assert.equal(foreign.ok, false, 'belongs to mia');
  assert.equal(foreign.message, '该服装不属于此角色。');
  assert.equal(equipCostume(account, 'serena', 'serena_swimsuit').ok, false, 'character not owned yet');
  assert.equal(equipCostume(account, 'nobody', 'default').ok, false, 'unknown character');
  assert.deepEqual(account.equippedCostumes, {});

  const ok = equipCostume(account, 'lia', 'lia_maid');
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.equipped, { characterId: 'lia', costumeId: 'lia_maid' });
  assert.equal(account.equippedCostumes.lia, 'lia_maid');

  const reset = equipCostume(account, 'lia', 'default');
  assert.equal(reset.ok, true);
  assert.deepEqual(reset.equipped, { characterId: 'lia', costumeId: null });
  assert.equal(account.equippedCostumes.lia, undefined);

  // 获得角色后即可穿戴之前抽到的服装
  account.ownedCharacters.push('serena');
  assert.equal(equipCostume(account, 'serena', 'serena_swimsuit').ok, true);
});

// ─── G5 抽卡池文本 ───

test('G5: gacha pool text contains no pre-ending forbidden term of any character', () => {
  const forbidden = Object.values(CHARACTERS).flatMap((c) => c.forbiddenTermsUntilEnding || []);
  assert.ok(forbidden.length >= 9);
  const texts = [...CHARACTER_POOL, ...COSTUME_POOL].map((item) => JSON.stringify(item));
  for (const term of forbidden) {
    for (const text of texts) assert.ok(!text.includes(term), `「${term}」 leaked in ${text.slice(0, 60)}`);
  }
  const mia = CHARACTER_POOL.find((c) => c.id === 'mia');
  assert.doesNotMatch(mia.desc, /姐姐|改造|天线|讯号/);
  for (const text of texts) assert.doesNotMatch(text, /蚀宴会|第27章|塞蕾娜|米娅·铃/);
});

test('G5: pool facts match canon (设定集/03)', () => {
  const byId = Object.fromEntries(CHARACTER_POOL.map((c) => [c.id, c]));
  assert.equal(byId.mia.title, '魔具发明师');
  assert.equal(byId.mia.name, '米娅·玲');
  assert.equal(byId.serena.name, '塞雷娜·诺克斯');
  assert.equal(byId.ophelia.element, '土');
  assert.equal(byId.lilith.element, '木');
});
