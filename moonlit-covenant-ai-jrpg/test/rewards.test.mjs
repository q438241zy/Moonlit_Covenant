// 玩出来的钻石（作者核#12 对 B2/B3 的修改）：每日签到、主线首通、卡牌胜利、女主自动入队、重复补偿，
// 以及契约 R-1 / R-2 / R-3 的 HTTP 层。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  REWARD_RULES, HEROINE_JOIN_CHAPTERS, claimDaily, dailyAmount, dayKey, ensureRewards, getRewardStatus,
  grantCardWin, nextDayStart, recordChapterClear
} from '../game/rewards.mjs';
import {
  CHARACTER_POOL, COSTUME_POOL, DUPLICATE_COMPENSATION, GACHA_COSTS, GACHA_DIAMOND_COSTS, GACHA_RATES, pullGacha
} from '../game/gacha.mjs';
import { createPlayerAccount } from '../game/membership.mjs';
import { createCreditMeter } from '../game/credit.mjs';
import { PACK } from '../cards/cardpack.mjs';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DAY = 24 * 60 * 60 * 1000;
// 本地时间正午：跨天推算不受时区 / 夏令时影响
const noon = (offsetDays = 0) => new Date(2026, 9, 20 + offsetDays, 12, 0, 0).getTime();

function newAccount({ credits = 600, diamonds = 0 } = {}) {
  const account = createPlayerAccount('奖励');
  account.credits = credits;
  account.diamonds = diamonds;
  account._meter = createCreditMeter(account);
  return account;
}

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

// ─── 数值表 ───

test('reward numbers are the documented ones and stay small next to the pull price', () => {
  assert.deepEqual(REWARD_RULES.daily, { base: 50, streakStep: 10, streakBonusCap: 40 });
  assert.equal(REWARD_RULES.chapterFirstClear, 160);
  assert.deepEqual(REWARD_RULES.cardWin, { diamonds: 40, dailyCap: 5 });
  assert.deepEqual(REWARD_RULES.cardStarter, { diamonds: PACK.costTen, shards: 500 });
  assert.deepEqual(GACHA_DIAMOND_COSTS, { single: 80, ten: 720 });
  // 核#14（提案第八节#44）：召唤只收钻石，公示的价格表里也只有钻石
  assert.deepEqual(GACHA_COSTS, { diamonds: { single: 80, ten: 720 } });
  assert.equal(GACHA_DIAMOND_COSTS.single, PACK.costSingle, 'one summon costs the same as one card pack');
  assert.deepEqual(DUPLICATE_COMPENSATION, { 3: 8, 4: 16, 5: 160 });
  // 每种稀有度的补偿都低于两次单抽，最常见的 3★/4★ 只是单抽的一小部分
  for (const [rarity, amount] of Object.entries(DUPLICATE_COMPENSATION)) {
    assert.ok(amount <= 2 * GACHA_DIAMOND_COSTS.single, `${rarity}★ ${amount}`);
  }
  assert.ok(DUPLICATE_COMPENSATION[4] / GACHA_DIAMOND_COSTS.single <= 0.2);
  // 一天全部拿满（签到第 5 天起 + 5 胜）也不到两次十连
  const fullDay = dailyAmount(5) + REWARD_RULES.cardWin.diamonds * REWARD_RULES.cardWin.dailyCap;
  assert.equal(fullDay, 290);
  assert.ok(fullDay < GACHA_DIAMOND_COSTS.ten);
});

test('heroines join on the 30-chapter roster (核#14, 提案 §4.5), stored as pool data', () => {
  assert.deepEqual(HEROINE_JOIN_CHAPTERS, {
    lia: 'ch005', mia: 'ch010', serena: 'ch012', freya: 'ch019', lilith: 'ch021', evelyn: 'ch017', ophelia: 'ch020', aila: 'ch018'
  });
  // 首次登场章（卡池的登场闸门 unlockChapter）：莉亚04、米娅07、塞雷娜11、莉莉丝13（敌对登场）、伊芙琳16、艾拉17、芙蕾娅18、奥菲利亚19
  assert.deepEqual(Object.fromEntries(CHARACTER_POOL.map((c) => [c.id, c.unlockChapter])), {
    lia: 'ch002', mia: 'ch007', serena: 'ch011', freya: 'ch018', lilith: 'ch013', evelyn: 'ch016', ophelia: 'ch019', aila: 'ch017'
  });
  const n = (id) => Number(id.slice(2));
  for (const heroine of CHARACTER_POOL) {
    assert.match(heroine.joinChapter, /^ch\d{3}$/, heroine.id);
    assert.match(heroine.unlockChapter, /^ch\d{3}$/, heroine.id);
    // 登场到入队至少隔一章；最后一位在正式21入队，入队后至少在队8章（算到30）
    assert.ok(n(heroine.joinChapter) > n(heroine.unlockChapter), `${heroine.id} joins after her debut`);
    assert.ok(n(heroine.joinChapter) <= 21 && 30 - n(heroine.joinChapter) + 1 >= 8, `${heroine.id} stays at least 8 chapters`);
  }
  // 每章最多一位女主登场
  const debuts = CHARACTER_POOL.map((c) => c.unlockChapter);
  assert.equal(new Set(debuts).size, debuts.length);
});

// ─── R-1 每日签到 ───

test('R-1: daily sign-in pays once per local day, with a small capped streak bonus', () => {
  const account = newAccount();
  const first = claimDaily(account, noon(0));
  assert.deepEqual(first, { granted: true, diamonds: 50, streak: 1, nextAt: nextDayStart(noon(0)), balance: 50 });
  assert.equal(new Date(first.nextAt).getHours(), 0);
  assert.ok(first.nextAt > noon(0) && first.nextAt - noon(0) <= 12 * 60 * 60 * 1000 + 1);

  const again = claimDaily(account, noon(0) + 3 * 60 * 60 * 1000);
  assert.equal(again.granted, false);
  assert.equal(again.diamonds, 0);
  assert.equal(again.balance, 50);

  const amounts = [50];
  for (let day = 1; day < 7; day += 1) amounts.push(claimDaily(account, noon(day)).diamonds);
  assert.deepEqual(amounts, [50, 60, 70, 80, 90, 90, 90]);
  assert.equal(account.diamonds, amounts.reduce((a, b) => a + b, 0));
  assert.equal(getRewardStatus(account, noon(6)).streak, 7);

  // 断一天：连签从 1 重新算
  const broken = claimDaily(account, noon(8));
  assert.equal(broken.streak, 1);
  assert.equal(broken.diamonds, 50);
});

test('R-1: status reports availability, the live streak and the next amount', () => {
  const account = newAccount();
  let status = getRewardStatus(account, noon(0));
  assert.equal(status.dailyAvailable, true);
  assert.equal(status.streak, 0);
  assert.equal(status.dailyAmount, 50);
  assert.equal(status.nextAt, nextDayStart(noon(0)));
  assert.deepEqual(status.chaptersCleared, []);
  assert.equal(status.cardWinsToday, 0);
  assert.equal(status.cardWinCap, 5);

  claimDaily(account, noon(0));
  status = getRewardStatus(account, noon(0));
  assert.equal(status.dailyAvailable, false);
  assert.equal(status.streak, 1);
  assert.equal(status.dailyAmount, 60, 'tomorrow pays 60');
  status = getRewardStatus(account, noon(1));
  assert.equal(status.dailyAvailable, true);
  assert.equal(status.streak, 1, 'yesterday still counts');
  status = getRewardStatus(account, noon(3));
  assert.equal(status.streak, 0, 'a missed day ends the streak');
  assert.equal(status.dailyAmount, 50);
  assert.equal(status.recent[0].type, 'daily');
});

// ─── R-2 主线首通 + 女主自动入队 ───

test('R-2: a chapter pays its first clear once; clearing ch005 grants Lia', () => {
  const account = newAccount();
  const first = recordChapterClear(account, 'ch000', noon(0));
  assert.equal(first.granted, true);
  assert.equal(first.diamonds, 160);
  assert.equal(first.alreadyCleared, false);
  assert.deepEqual(first.heroinesGranted, []);

  const repeat = recordChapterClear(account, 'ch000', noon(0));
  assert.equal(repeat.granted, false);
  assert.equal(repeat.diamonds, 0);
  assert.equal(repeat.alreadyCleared, true);
  assert.equal(account.diamonds, 160);

  const ch5 = recordChapterClear(account, 'ch005', noon(0));
  assert.deepEqual(ch5.heroinesGranted, ['lia']);
  assert.equal(ch5.diamonds, 160);
  assert.ok(account.ownedCharacters.includes('lia'));
  assert.deepEqual(recordChapterClear(account, 'ch005', noon(0)).heroinesGranted, [], 'Lia is granted only once');
  assert.deepEqual(account.ownedCharacters.filter((id) => id === 'lia'), ['lia']);
  assert.deepEqual(getRewardStatus(account, noon(0)).chaptersCleared, ['ch000', 'ch005']);

  assert.throws(() => recordChapterClear(account, '../ch001', noon(0)), /章节 ID 无效/);
});

test('R-2: a heroine already pulled from the pool is compensated like a duplicate, once', () => {
  const account = newAccount();
  account.ownedCharacters = ['lia', 'mia'];
  const ch5 = recordChapterClear(account, 'ch005', noon(0));
  assert.deepEqual(ch5.heroinesGranted, []);
  assert.deepEqual(ch5.heroinesCompensated, [{ id: 'lia', diamonds: DUPLICATE_COMPENSATION[5] }]);
  assert.equal(ch5.diamonds, 160 + 160);
  const ch10 = recordChapterClear(account, 'ch010', noon(0));
  assert.deepEqual(ch10.heroinesCompensated, [{ id: 'mia', diamonds: DUPLICATE_COMPENSATION[4] }]);
  assert.equal(account.diamonds, 160 + 160 + 160 + 16);
  // 再报一次不会再补偿
  assert.equal(recordChapterClear(account, 'ch010', noon(0)).diamonds, 0);
});

test('R-2: heroines registered after the chapter was cleared are granted on the next progress report', () => {
  const account = newAccount();
  // 旧存档：ch005 已经领过首通奖励，但那时还没有自动入队
  account.rewards = { chaptersCleared: ['ch005'] };
  const result = recordChapterClear(account, 'ch005', noon(0));
  assert.equal(result.alreadyCleared, true);
  assert.equal(result.granted, true);
  assert.equal(result.diamonds, 0);
  assert.deepEqual(result.heroinesGranted, ['lia']);
});

// ─── R-3 卡牌胜利 ───

test('R-3: card wins pay 40 diamonds for the first 5 wins of a day, then report capped', () => {
  const account = newAccount();
  const results = [];
  for (let i = 0; i < 7; i += 1) results.push(grantCardWin(account, noon(0) + i * 1000));
  assert.deepEqual(results.map((r) => r.diamonds), [40, 40, 40, 40, 40, 0, 0]);
  assert.deepEqual(results.map((r) => r.capped), [false, false, false, false, false, true, true]);
  assert.equal(results[6].winsToday, 5);
  assert.equal(account.diamonds, 200);
  assert.equal(getRewardStatus(account, noon(0)).cardWinsToday, 5);
  // 第二天重新计数
  assert.equal(getRewardStatus(account, noon(1)).cardWinsToday, 0);
  assert.deepEqual(grantCardWin(account, noon(1)), { diamonds: 40, capped: false, winsToday: 1, cap: 5, balance: 240 });
});

test('rewards state from an old or tampered save is normalized', () => {
  const account = newAccount();
  account.diamonds = 'lots';
  account.rewards = {
    daily: { last: 'yesterday', streak: -3, claims: 'x' },
    chaptersCleared: ['ch001', 'ch001', 42, '../etc'],
    heroinesJoined: 'lia',
    cardWins: { day: dayKey(noon(0)), count: 9.5 },
    log: [null, { type: 'daily', diamonds: 50 }, { type: 'x' }]
  };
  const rewards = ensureRewards(account);
  assert.equal(account.diamonds, 0);
  assert.deepEqual(rewards.daily, { last: null, streak: 0, claims: 0 });
  assert.deepEqual(rewards.chaptersCleared, ['ch001']);
  assert.deepEqual(rewards.heroinesJoined, []);
  assert.equal(rewards.cardWins.count, 0);
  assert.equal(rewards.log.length, 1);
  assert.equal(claimDaily(account, noon(0)).diamonds, 50);
});

// ─── 召唤：钻石支付与重复补偿 ───

test('gacha: diamonds pay 80 / 720 and nothing changes when the balance is short', (t) => {
  t.mock.method(Math, 'random', () => 0.5);
  const account = newAccount({ credits: 5000, diamonds: 100 });
  const short = pullGacha(account, 'character', 10);
  assert.equal(short.ok, false);
  assert.equal(short.code, 'INSUFFICIENT_DIAMONDS');
  assert.equal(account.diamonds, 100);
  assert.equal(account.pityCounters, undefined);
  assert.equal(account.ownedCharacters, undefined);

  const single = pullGacha(account, 'character', 1, { currency: 'diamonds' });
  assert.equal(single.ok, true);
  assert.equal(single.currency, 'diamonds');
  assert.equal(single.cost, 80);
  assert.deepEqual(single.balance, { diamonds: 20 });
  assert.equal(account._meter.balance, 5000, 'credit untouched');
  assert.equal(account.credits, 5000);

  // 核#14：召唤只收钻石。旧前端传 currency: 'credit' 时明确拒绝（不悄悄改扣钻石），什么都不变
  const legacy = pullGacha(account, 'character', 1, { currency: 'credit' });
  assert.deepEqual([legacy.ok, legacy.code], [false, 'DIAMONDS_ONLY']);
  assert.equal(account.diamonds, 20);
  assert.equal(account.pityCounters.character, 1);
  const broke = pullGacha(account, 'character', 1);
  assert.equal(broke.code, 'INSUFFICIENT_DIAMONDS');
  // 旧签名 pullGacha(account, meter, pool, count) 直接报错，不会把计量器当成池名
  assert.throws(() => pullGacha(account, account._meter, 'character', 1), TypeError);
});

test('gacha: duplicates (also inside one ten-pull) are compensated in diamonds by rarity', (t) => {
  t.mock.method(Math, 'random', () => 0.5); // 角色池 0.5 → 4★，候选里固定取中间那位
  const account = newAccount({ credits: 1000, diamonds: 720 + 720 });
  const ten = pullGacha(account, 'character', 10);
  assert.equal(ten.ok, true);
  assert.equal(ten.currency, 'diamonds');
  const ids = new Set(ten.results.map((r) => r.id));
  assert.equal(ids.size, 1, 'the mocked roll picks one 4★ every time');
  assert.deepEqual(ten.results.map((r) => r.duplicate), [false, true, true, true, true, true, true, true, true, true]);
  assert.deepEqual(ten.results.map((r) => r.compensation), [0, 16, 16, 16, 16, 16, 16, 16, 16, 16]);
  assert.deepEqual(ten.compensation, { diamonds: 144 });
  assert.equal(account.diamonds, 720 + 144);
  assert.equal(ten.balance.diamonds, 720 + 144);
  assert.equal(account.credits, 1000, 'Credit untouched');

  // 服饰池 3★ 重复补 8
  const costume = pullGacha(account, 'costume', 10);
  const firstId = costume.results[0].id;
  assert.equal(costume.results[0].rarity, 3);
  assert.equal(costume.results.filter((r) => r.id === firstId && r.duplicate).length, 9);
  assert.equal(costume.compensation.diamonds, 9 * 8);
});

test('gacha: compensation never turns pulling into a diamond loop (seeded 20,000 pulls, everything owned)', (t) => {
  const rng = mulberry32(20261020);
  t.mock.method(Math, 'random', rng);
  for (const pool of ['character', 'costume']) {
    const account = newAccount({ credits: 0, diamonds: 10_000_000 });
    account.ownedCharacters = CHARACTER_POOL.map((c) => c.id);
    account.ownedCostumes = COSTUME_POOL.map((c) => c.id);
    const before = account.diamonds;
    let spent = 0;
    for (let i = 0; i < 2000; i += 1) {
      const result = pullGacha(account, pool, 10);
      assert.equal(result.ok, true);
      spent += result.cost;
    }
    const refunded = account.diamonds - (before - spent);
    const perPull = refunded / 20000;
    // 期望值：角色池约 19、服饰池约 13（典藏退出后常驻表暂时没有 4★，见 gacha.mjs 注释）
    const expected = pool === 'character' ? 19.4 : 12.9;
    assert.ok(Math.abs(perPull - expected) < 1.5, `${pool}: ${perPull.toFixed(2)} per pull`);
    assert.ok(perPull < GACHA_DIAMOND_COSTS.single / 3);
  }
  assert.ok(GACHA_RATES.character[5] > 0);
});

// ─── HTTP（契约 R-1 / R-2 / R-3，B19）───

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

const children = new Set();
test.after(() => {
  for (const child of children) if (child.exitCode === null) child.kill('SIGKILL');
});

async function startServer(env = {}) {
  const port = await freePort();
  const fullEnv = { ...process.env, AI_MODE: 'demo', HOST: '127.0.0.1', PORT: String(port), NODE_ENV: 'test', PERSIST: '0', ...env };
  delete fullEnv.ADMIN_KEY;
  delete fullEnv.DEMO_TOOLS;
  if (!env.SAVE_FILE) delete fullEnv.SAVE_FILE;
  const child = spawn(process.execPath, ['server.mjs'], { cwd: projectDir, env: fullEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  children.add(child);
  let logs = '';
  child.stdout.on('data', (chunk) => { logs += chunk; });
  child.stderr.on('data', (chunk) => { logs += chunk; });
  const base = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 8000;
  for (;;) {
    if (child.exitCode !== null) throw new Error(`server exited early (${child.exitCode}):\n${logs}`);
    try {
      if ((await fetch(`${base}/api/health`)).ok) break;
    } catch { /* 仍在启动 */ }
    if (Date.now() > deadline) throw new Error(`server did not start:\n${logs}`);
    await new Promise((resolve) => setTimeout(resolve, 60));
  }
  const exited = new Promise((resolve) => child.once('exit', resolve));
  return {
    base,
    async stop(signal = 'SIGTERM') {
      if (child.exitCode === null && child.signalCode === null) child.kill(signal);
      await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 4000))]);
      children.delete(child);
    }
  };
}

async function api(base, pathname, { method, body } = {}) {
  const response = await fetch(`${base}${pathname}`, {
    method: method || (body === undefined ? 'GET' : 'POST'),
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* 非 JSON */ }
  return { status: response.status, json, text };
}

/** 简单的贪心打法：先出不需要目标的牌，能进化就进化，然后全部打脸（有守护先打守护）。返回结束时的响应。 */
async function playGreedyBattle(base, playerId) {
  let res = await api(base, '/api/battle/start', { body: { playerId, playerClass: 'lia' } });
  assert.equal(res.status, 201, res.text);
  let last = res;
  let state = res.json.state;
  for (let turn = 0; turn < 40 && state.phase !== 'gameover'; turn += 1) {
    assert.equal(state.activePlayer, 'player', 'the player always gets the state on their own turn');
    for (let k = 0; k < 12 && state.phase === 'main'; k += 1) {
      const play = (state.legalPlays || []).find((p) => !p.needsTarget);
      if (!play) break;
      res = await api(base, '/api/battle/action', { body: { playerId, action: { type: 'play', handUid: play.uid } } });
      if (res.status !== 200) break;
      last = res;
      state = res.json.state;
    }
    if (state.phase === 'main' && (state.evolvable || []).length) {
      res = await api(base, '/api/battle/action', { body: { playerId, action: { type: 'evolve', uid: state.evolvable[0] } } });
      if (res.status === 200) { last = res; state = res.json.state; }
    }
    for (let k = 0; k < 10 && state.phase === 'main'; k += 1) {
      const entry = Object.entries(state.attackTargets || {}).find(([, targets]) => targets?.length);
      if (!entry) break;
      const [uid, targets] = entry;
      const target = targets.find((x) => x.type === 'leader') ? 'leader' : targets[0].uid;
      res = await api(base, '/api/battle/action', { body: { playerId, action: { type: 'attack', attackerUid: uid, targetUid: target } } });
      if (res.status !== 200) break;
      last = res;
      state = res.json.state;
    }
    if (state.phase === 'gameover') break;
    res = await api(base, '/api/battle/end-turn', { body: { playerId } });
    assert.equal(res.status, 200, res.text);
    last = res;
    state = res.json.state;
  }
  return last;
}

test('HTTP: R-1 / R-2 rewards, heroine auto-grant and diamond summons', { timeout: 30000 }, async (t) => {
  const srv = await startServer();
  t.after(() => srv.stop());
  const { json: created } = await api(srv.base, '/api/account/create', { body: { playerName: '奖励' } });
  const playerId = created.account.id;
  const startDiamonds = created.account.diamonds;

  const status = await api(srv.base, `/api/rewards/status?playerId=${playerId}`);
  assert.equal(status.status, 200);
  for (const key of ['dailyAvailable', 'streak', 'nextAt', 'chaptersCleared', 'cardWinsToday', 'cardWinCap']) {
    assert.ok(key in status.json, `status has ${key}`);
  }
  assert.equal(status.json.dailyAvailable, true);
  assert.equal(status.json.cardWinCap, 5);

  const daily = await api(srv.base, '/api/rewards/daily', { body: { playerId } });
  assert.equal(daily.status, 200);
  assert.equal(daily.json.granted, true);
  assert.equal(daily.json.diamonds, 50);
  assert.equal(daily.json.streak, 1);
  assert.equal(typeof daily.json.nextAt, 'number');
  assert.equal(daily.json.account.diamonds, startDiamonds + 50);
  assert.ok(!daily.text.includes('_meter'));
  const dailyAgain = await api(srv.base, '/api/rewards/daily', { body: { playerId } });
  assert.equal(dailyAgain.json.granted, false);
  assert.equal(dailyAgain.json.diamonds, 0);
  assert.equal((await api(srv.base, `/api/rewards/status?playerId=${playerId}`)).json.dailyAvailable, false);

  // R-2：章节必须在 public/story/chapters/index.json 里
  const index = JSON.parse(fs.readFileSync(path.join(projectDir, 'public/story/chapters/index.json'), 'utf8'));
  assert.ok(index.some((c) => c.id === 'ch005'));
  for (const chapterId of ['ch999', '../index', '', 5]) {
    const bad = await api(srv.base, '/api/story/progress', { body: { playerId, chapterId } });
    assert.equal(bad.status, 400, String(chapterId));
    assert.equal(bad.json.error.code, 'UNKNOWN_CHAPTER');
  }
  const ghost = await api(srv.base, '/api/story/progress', { body: { playerId: '00000000-0000-4000-8000-000000000000', chapterId: 'ch000' } });
  assert.equal(ghost.status, 404);
  assert.equal((await api(srv.base, '/api/story/progress', { body: { playerId: 'nope', chapterId: 'ch000' } })).status, 400);
  assert.equal((await api(srv.base, '/api/story/progress')).status, 405);
  assert.equal((await api(srv.base, '/api/rewards/daily')).status, 405);

  const before = (await api(srv.base, `/api/costume?playerId=${playerId}`)).json.ownedCharacters;
  assert.ok(!before.includes('lia'));
  const clear = await api(srv.base, '/api/story/progress', { body: { playerId, chapterId: 'ch005' } });
  assert.equal(clear.status, 200);
  assert.equal(clear.json.granted, true);
  assert.equal(clear.json.alreadyCleared, false);
  assert.equal(clear.json.diamonds, 160);
  assert.deepEqual(clear.json.heroinesGranted, ['lia']);
  const again = await api(srv.base, '/api/story/progress', { body: { playerId, chapterId: 'ch005' } });
  assert.equal(again.json.alreadyCleared, true);
  assert.equal(again.json.granted, false);
  assert.equal(again.json.diamonds, 0);
  assert.deepEqual(again.json.heroinesGranted, []);
  const after = (await api(srv.base, `/api/costume?playerId=${playerId}`)).json.ownedCharacters;
  assert.ok(after.includes('lia'), 'Lia is owned after ch005');
  assert.deepEqual((await api(srv.base, `/api/rewards/status?playerId=${playerId}`)).json.chaptersCleared, ['ch005']);

  // 钻石召唤 + 公示的价格与补偿表
  const pools = (await api(srv.base, '/api/gacha/pools')).json;
  assert.deepEqual(pools.costs, GACHA_COSTS);
  assert.deepEqual(pools.duplicateCompensation, DUPLICATE_COMPENSATION);
  assert.equal(pools.heroineJoins.lia, 'ch005');
  const balance = startDiamonds + 50 + 160;
  const pull = await api(srv.base, '/api/gacha/pull', { body: { playerId, pool: 'character', count: 1, currency: 'diamonds' } });
  assert.equal(pull.status, 200, pull.text);
  assert.equal(pull.json.currency, 'diamonds');
  assert.equal(pull.json.cost, 80);
  assert.equal(pull.json.balance.diamonds, balance - 80 + pull.json.compensation.diamonds);
  assert.equal(pull.json.account.diamonds, pull.json.balance.diamonds);
  // 起始 1600 钻石（核#15）够十连：一直十连到余额不足，最后一次必须被拒
  let tooMuch;
  for (let i = 0; i < 6; i += 1) {
    tooMuch = await api(srv.base, '/api/gacha/pull', { body: { playerId, pool: 'character', count: 10, currency: 'diamonds' } });
    if (tooMuch.status !== 200) break;
  }
  assert.equal(tooMuch.status, 400);
  assert.equal(tooMuch.json.code, 'INSUFFICIENT_DIAMONDS');

  // B19：按玩家路由实现之前不提供模型预设
  const settings = await api(srv.base, `/api/settings/ai?playerId=${playerId}`);
  assert.equal(settings.json.perPlayerRouting, false);
  assert.deepEqual(settings.json.models, []);
  assert.equal(settings.json.current.mode, 'demo');
  const switched = await api(srv.base, '/api/settings/ai', { body: { playerId, modelId: 'deepseek-flash' } });
  assert.equal(switched.status, 409);
  assert.equal(switched.json.error.code, 'PER_PLAYER_ROUTING_UNAVAILABLE');
});

test('HTTP: R-3 a won card battle pays once and the reward is readable while gameover', { timeout: 60000 }, async (t) => {
  const srv = await startServer();
  t.after(() => srv.stop());
  const { json: created } = await api(srv.base, '/api/account/create', { body: { playerName: '牌手' } });
  const playerId = created.account.id;
  // 第一次进入卡牌对战：起始资源一次十连开包
  const summary = (await api(srv.base, `/api/cards/summary?playerId=${playerId}`)).json.summary;
  assert.equal(summary.diamonds, created.account.diamonds + REWARD_RULES.cardStarter.diamonds);

  let won = null;
  let sawLoss = false;
  for (let game = 0; game < 60 && !won; game += 1) {
    const last = await playGreedyBattle(srv.base, playerId);
    const { state, reward } = last.json;
    if (state.phase !== 'gameover') continue;
    if (state.winner === 'player') won = last.json;
    else {
      sawLoss = true;
      assert.equal(reward, null, 'no reward for a loss');
    }
  }
  assert.ok(won, 'the greedy bot won at least one of 60 games');
  assert.deepEqual({ diamonds: won.reward.diamonds, capped: won.reward.capped, winsToday: won.reward.winsToday }, { diamonds: 40, capped: false, winsToday: 1 });
  assert.deepEqual(won.state.reward, won.reward);
  const status = (await api(srv.base, `/api/rewards/status?playerId=${playerId}`)).json;
  assert.equal(status.cardWinsToday, 1);
  const diamonds = status.diamonds;

  // 对局结束后再读 / 再结束回合：同一个 reward，不会再发
  const read = await api(srv.base, `/api/battle/state?playerId=${playerId}`);
  assert.deepEqual(read.json.reward, won.reward);
  const endAgain = await api(srv.base, '/api/battle/end-turn', { body: { playerId } });
  assert.deepEqual(endAgain.json.reward, won.reward);
  assert.equal((await api(srv.base, `/api/rewards/status?playerId=${playerId}`)).json.diamonds, diamonds);

  // 新开一局：进行中没有 reward
  const fresh = await api(srv.base, '/api/battle/start', { body: { playerId, playerClass: 'mia' } });
  assert.equal(fresh.json.reward, null);
  assert.equal(fresh.json.state.activePlayer, 'player');
  assert.ok(Array.isArray(fresh.json.aiActions));
  assert.equal((await api(srv.base, `/api/battle/state?playerId=${playerId}`)).json.reward, null);
  // 投降没有奖励
  const conceded = await api(srv.base, '/api/battle/concede', { body: { playerId } });
  assert.equal(conceded.json.reward, null);
  t.diagnostic(`saw a loss before winning: ${sawLoss}`);
});

test('HTTP: rewards survive a restart (persisted with the account)', { timeout: 30000 }, async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'moonlit-rewards-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const env = { PERSIST: '1', SAVE_FILE: path.join(dir, 'saves.json') };
  let srv = await startServer(env);
  const { json: created } = await api(srv.base, '/api/account/create', { body: { playerName: '存档' } });
  const playerId = created.account.id;
  await api(srv.base, '/api/rewards/daily', { body: { playerId } });
  await api(srv.base, '/api/story/progress', { body: { playerId, chapterId: 'ch005' } });
  await srv.stop('SIGTERM');
  srv = await startServer(env);
  t.after(() => srv.stop());
  const status = (await api(srv.base, `/api/rewards/status?playerId=${playerId}`)).json;
  assert.equal(status.dailyAvailable, false);
  assert.equal(status.streak, 1);
  assert.deepEqual(status.chaptersCleared, ['ch005']);
  assert.deepEqual(status.heroinesJoined, ['lia']);
  assert.equal(status.diamonds, created.account.diamonds + 50 + 160);
  assert.equal((await api(srv.base, '/api/story/progress', { body: { playerId, chapterId: 'ch005' } })).json.alreadyCleared, true);
});

test('day helpers use the local calendar', () => {
  assert.equal(dayKey(noon(0)), '2026-10-20');
  assert.equal(dayKey(noon(12)), '2026-11-01');
  assert.equal(nextDayStart(noon(0)), new Date(2026, 9, 21).getTime());
  assert.ok(nextDayStart(noon(0)) - noon(0) <= DAY);
});
