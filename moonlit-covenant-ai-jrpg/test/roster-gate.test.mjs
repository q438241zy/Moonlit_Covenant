// 核#14（剧本/README_30章重構提案.md 第八节#43、#44，§4.5 入队表；服装稿 1.2「封存卡」）：
//   - 卡池的登场闸门：女主从一开始就在池里、照常能抽到，但在玩家通关她的登场章之前只给剪影——
//     名字、称号、立绘、介绍都不出现，只留稀有度与「第N章登场」；她的服装同样封存；
//   - 莉莉丝、艾拉的姓到正式20通关才显示（莉莉丝的故国也是）；
//   - 召唤只收钻石（Credit 留给 AI 对话）；
//   - 进度来自服务器已经记录的主线首通（POST /api/story/progress），/api/gacha/pools、/api/gacha/pull、/api/costume 都按它给视图。
import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  CHARACTER_POOL, COSTUME_POOL, COSTUME_PULL_TABLE, SEALED_TEXT, clearedChaptersOf, debutLabel, highestClearedChapter, isHeroineRevealed,
  publicPools, pullGacha, viewCharacter, viewCostume
} from '../game/gacha.mjs';
import { recordChapterClear } from '../game/rewards.mjs';
import { createPlayerAccount } from '../game/membership.mjs';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const byId = Object.fromEntries(CHARACTER_POOL.map((c) => [c.id, c]));
const upTo = (n) => Array.from({ length: n + 1 }, (_, i) => `ch${String(i).padStart(3, '0')}`);
const givenName = (c) => c.name.split('·')[0];
const SEALED_KEYS = ['debutLabel', 'id', 'joinChapter', 'name', 'rarity', 'sealed', 'title', 'unlockChapter'];

// ─── 视图 ───

test('zero progress: every heroine is a sealed card — rarity and 「第N章登场」 only, no name / portrait / text', () => {
  const { characters, costumes } = publicPools([]);
  assert.equal(characters.length, 8);
  for (const view of characters) {
    assert.equal(view.sealed, true, view.id);
    assert.deepEqual(Object.keys(view).sort(), SEALED_KEYS, view.id);
    assert.equal(view.name, SEALED_TEXT);
    assert.equal(view.title, SEALED_TEXT);
    assert.equal(view.rarity, byId[view.id].rarity, 'rarity stays visible (rates are published per rarity)');
    assert.match(view.debutLabel, /^第\d+章登场$/);
  }
  assert.equal(costumes.length, COSTUME_PULL_TABLE.length, 'the published costume pool is the standing pull table');
  for (const view of costumes) {
    assert.equal(view.sealed, true, view.id);
    assert.equal(view.file, undefined, `${view.id} must not point at the costume art`);
    assert.equal(view.description, undefined);
    assert.match(view.name, /^？？？·/);
  }
  const json = JSON.stringify({ characters, costumes });
  for (const c of CHARACTER_POOL) {
    assert.ok(!json.includes(givenName(c)), `${givenName(c)} leaked before her debut`);
    assert.ok(!json.includes(c.title) && !json.includes(c.nation), `${c.id}: title / nation leaked`);
  }
  assert.ok(!json.includes('/assets/'), 'no portrait or costume art path before a debut');
});

test('each heroine is revealed by clearing her debut chapter (or any later one), not before', () => {
  for (const heroine of CHARACTER_POOL) {
    const debut = Number(heroine.unlockChapter.slice(2));
    assert.equal(viewCharacter(heroine, upTo(debut - 1)).sealed, true, `${heroine.id} before ch${debut}`);
    const revealed = viewCharacter(heroine, upTo(debut));
    assert.equal(revealed.sealed, false, `${heroine.id} after ch${debut}`);
    assert.equal(revealed.portrait, heroine.portrait);
    assert.equal(revealed.veils, undefined, 'veil data never leaves the server');
    assert.equal(revealed.debutLabel, `第${debut}章登场`);
    assert.equal(isHeroineRevealed(heroine.id, [heroine.joinChapter]), true, 'a later chapter counts too');
    // 她的服装跟着她揭开
    const maid = COSTUME_POOL.find((c) => c.id === `${heroine.id}_maid`);
    assert.equal(viewCostume(maid, upTo(debut - 1)).sealed, true);
    assert.deepEqual(viewCostume(maid, upTo(debut)), { ...maid, sealed: false });
  }
  assert.equal(isHeroineRevealed('nobody', upTo(30)), false);
});

test('莉莉丝 shows her given name from ch013 but her surname and homeland only after ch020; 艾拉 likewise', () => {
  const lilith = byId.lilith;
  for (const highest of [13, 16, 19]) {
    const view = viewCharacter(lilith, upTo(highest));
    assert.equal(view.name, '莉莉丝', `after ch0${highest}`);
    assert.equal(view.nation, SEALED_TEXT);
    const json = JSON.stringify(view);
    for (const w of ['瓦尔哈拉', '翠影']) assert.ok(!json.includes(w), `「${w}」 before ch020`);
    assert.ok(view.desc.includes('昼盲') && view.portrait, 'the rest of her card is shown');
  }
  const named = viewCharacter(lilith, upTo(20));
  assert.equal(named.name, '莉莉丝·瓦尔哈拉');
  assert.equal(named.nation, '翠影公国');
  assert.equal(named.desc, lilith.desc);

  assert.equal(viewCharacter(byId.aila, upTo(17)).name, '艾拉');
  assert.equal(viewCharacter(byId.aila, upTo(19)).name, '艾拉');
  assert.equal(viewCharacter(byId.aila, upTo(20)).name, '艾拉·瓦尔哈拉');
  // 服装名本来就只用名
  for (const c of COSTUME_POOL) assert.ok(!c.name.includes('瓦尔哈拉'), c.id);
});

test('progress helpers tolerate old or tampered saves', () => {
  assert.deepEqual(clearedChaptersOf(null), []);
  assert.deepEqual(clearedChaptersOf({ rewards: { chaptersCleared: 'ch005' } }), []);
  assert.deepEqual(clearedChaptersOf({ rewards: { chaptersCleared: ['ch004', 7, '../ch020', 'ch020x', 'ch010'] } }), ['ch004', 'ch010']);
  assert.equal(highestClearedChapter([]), -1);
  assert.equal(highestClearedChapter(['ch004', 'ch010', 'ch002']), 10);
  assert.equal(debutLabel('ch000'), '序章登场');
  assert.equal(debutLabel('ch013'), '第13章登场');
  assert.equal(debutLabel('nope'), '尚未登场');
});

test('pull results use the same gate as the pool: a sealed heroine is pulled and owned, but shown as a sealed card', (t) => {
  t.mock.method(Math, 'random', () => 0.5); // 角色池 0.5 → 4★，候选（米娅、伊芙琳、艾拉）里取中间的伊芙琳
  const account = createPlayerAccount('封存');
  account.diamonds = 80;
  const pulled = pullGacha(account, 'character', 1);
  assert.equal(pulled.ok, true);
  const [card] = pulled.results;
  assert.equal(card.id, 'evelyn');
  assert.equal(card.sealed, true);
  assert.equal(card.name, SEALED_TEXT);
  assert.equal(card.portrait, undefined);
  assert.equal(card.isNew, true);
  assert.deepEqual(account.ownedCharacters, ['evelyn'], 'owned all the same');

  // 通关她的登场章（正式16）以后，同一位女主就以真名出现
  account.rewards = { chaptersCleared: upTo(16) };
  account.diamonds = 80;
  const again = pullGacha(account, 'character', 1).results[0];
  assert.deepEqual([again.id, again.sealed, again.name, again.duplicate], ['evelyn', false, '伊芙琳·星歌', true]);
});

test('joining always happens after the debut, so an auto-joined heroine is never a sealed card', () => {
  const account = createPlayerAccount('入队');
  for (const id of upTo(10)) recordChapterClear(account, id);
  assert.deepEqual(account.ownedCharacters, ['lia', 'mia']);
  const views = publicPools(clearedChaptersOf(account)).characters;
  for (const id of account.ownedCharacters) assert.equal(views.find((v) => v.id === id).sealed, false, id);
  assert.deepEqual(views.filter((v) => v.sealed).map((v) => v.id).sort(), ['aila', 'evelyn', 'freya', 'lilith', 'ophelia', 'serena']);
});

// ─── HTTP ───

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

async function startServer(t) {
  const port = await freePort();
  const env = { ...process.env, AI_MODE: 'demo', HOST: '127.0.0.1', PORT: String(port), NODE_ENV: 'test', PERSIST: '0' };
  delete env.SAVE_FILE;
  delete env.ADMIN_KEY;
  delete env.DEMO_TOOLS;
  const child = spawn(process.execPath, ['server.mjs'], { cwd: projectDir, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  child.stdout.on('data', (chunk) => { logs += chunk; });
  child.stderr.on('data', (chunk) => { logs += chunk; });
  t.after(async () => {
    if (child.exitCode !== null || child.signalCode !== null) return;
    child.kill('SIGTERM');
    await new Promise((resolve) => { const timer = setTimeout(resolve, 3000); child.once('exit', () => { clearTimeout(timer); resolve(); }); });
  });
  const base = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 8000;
  for (;;) {
    if (child.exitCode !== null) throw new Error(`server exited early:\n${logs}`);
    try { if ((await fetch(`${base}/api/health`)).ok) break; } catch { /* starting */ }
    if (Date.now() > deadline) throw new Error(`server did not start:\n${logs}`);
    await new Promise((resolve) => setTimeout(resolve, 60));
  }
  return base;
}

async function api(base, pathname, body) {
  const response = await fetch(`${base}${pathname}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  return { status: response.status, json: JSON.parse(text), text };
}

test('HTTP: pools / costume / pull follow the player\'s recorded main-line progress; summons take diamonds only', { timeout: 20000 }, async (t) => {
  const base = await startServer(t);

  // 没有 playerId：零进度，所有人都是封存卡
  const anonymous = await api(base, '/api/gacha/pools');
  assert.equal(anonymous.status, 200);
  assert.ok(anonymous.json.characters.every((c) => c.sealed));
  assert.ok(anonymous.json.costumes.every((c) => c.sealed));
  assert.equal(anonymous.json.currency, 'diamonds');
  assert.deepEqual(anonymous.json.costs, { diamonds: { single: 80, ten: 720 } });
  assert.deepEqual(anonymous.json.progress, { highestCleared: -1 });
  for (const c of CHARACTER_POOL) assert.ok(!anonymous.text.includes(givenName(c)), `${c.id} leaked`);
  assert.ok(!anonymous.text.includes('/assets/'));
  assert.equal((await api(base, '/api/gacha/pools?playerId=not-an-id')).status, 400);

  const { json: created } = await api(base, '/api/account/create', { playerName: '闸门' });
  const playerId = created.account.id;
  const pools = (query) => api(base, `/api/gacha/pools?playerId=${playerId}${query || ''}`).then((r) => r.json);
  const revealed = (view) => view.characters.filter((c) => !c.sealed).map((c) => c.id).sort();
  assert.deepEqual(revealed(await pools()), []);

  // 通关第四章：莉亚登场；她的服装一起揭开（换衣间的数据同一个闸门）
  assert.equal((await api(base, '/api/story/progress', { playerId, chapterId: 'ch004' })).status, 200);
  let view = await pools();
  assert.deepEqual(revealed(view), ['lia']);
  assert.deepEqual(view.progress, { highestCleared: 4 });
  const lia = view.characters.find((c) => c.id === 'lia');
  assert.equal(lia.name, '莉亚·赫斯特');
  assert.equal(lia.portrait, '/assets/portraits/lia.svg');
  const wardrobe = (await api(base, `/api/costume?playerId=${playerId}`)).json;
  assert.ok(wardrobe.costumePool.filter((c) => c.characterId === 'lia').every((c) => !c.sealed && c.file));
  assert.ok(wardrobe.costumePool.filter((c) => c.characterId !== 'lia').every((c) => c.sealed && !c.file));
  assert.ok(!JSON.stringify(wardrobe).includes('米娅'));

  // 第七章：米娅登场；其余仍是剪影
  await api(base, '/api/story/progress', { playerId, chapterId: 'ch007' });
  view = await pools();
  assert.deepEqual(revealed(view), ['lia', 'mia']);
  assert.equal(view.characters.find((c) => c.id === 'serena').name, SEALED_TEXT);
  assert.equal(view.characters.find((c) => c.id === 'lilith').debutLabel, '第13章登场');

  // 召唤只收钻石：旧前端的 currency: 'credit' 被拒绝、什么都不扣；不带 currency 就是钻石
  const before = (await api(base, `/api/account?playerId=${playerId}`)).json.account;
  const legacy = await api(base, '/api/gacha/pull', { playerId, pool: 'character', count: 1, currency: 'credit' });
  assert.equal(legacy.status, 400);
  assert.equal(legacy.json.code, 'DIAMONDS_ONLY');
  const pull = await api(base, '/api/gacha/pull', { playerId, pool: 'costume', count: 1 });
  assert.equal(pull.status, 200, pull.text);
  assert.equal(pull.json.currency, 'diamonds');
  assert.equal(pull.json.cost, 80);
  assert.equal(pull.json.account.diamonds, before.diamonds - 80 + pull.json.compensation.diamonds);
  assert.equal(pull.json.account.credits, before.credits, 'Credit untouched');
  assert.deepEqual(Object.keys(pull.json.balance), ['diamonds']);
  for (const item of pull.json.results) {
    const shown = ['lia', 'mia'].includes(item.characterId);
    assert.equal(item.sealed, !shown, item.id);
    if (!shown) assert.ok(item.file === undefined && item.name.startsWith(SEALED_TEXT), item.id);
  }

  // 畸形的池名（对象 / 数组 / 数字）按角色池处理，不能撞上 pullGacha 的旧签名检查变成 500
  for (const pool of [{}, ['costume'], 42]) {
    const odd = await api(base, '/api/gacha/pull', { playerId, pool, count: 1 });
    assert.equal(odd.status, 200, `${JSON.stringify(pool)}: ${odd.text}`);
    assert.equal(odd.json.pool, 'character');
  }
});
