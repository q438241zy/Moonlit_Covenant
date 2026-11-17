// 典藏复刻池（服装稿 §5.1；game/gacha.mjs 的 REPRINT_RULES）：轮换、公示概率、与服饰池共用保底与衣橱券、HTTP。
import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { REPRINT_RULES, currentReprint, reprintTable, reprintRates, pullGacha, GACHA_RATES, COSTUME_TYPE_META, PITY_THRESHOLD } from '../game/gacha.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DAY = 86400000;

test('轮换：四类典藏每期 14 天，从 anchor 起依次轮换；只轮已上线的番外对应的典藏', () => {
  const at = (d) => currentReprint(REPRINT_RULES.types, REPRINT_RULES.anchor + d * DAY + 1);
  assert.equal(at(0).type, 'christmas');
  assert.equal(at(13).type, 'christmas');
  assert.equal(at(14).type, 'newyear');
  assert.equal(at(28).type, 'anniversary');
  assert.equal(at(42).type, 'duanwu');
  assert.equal(at(56).type, 'christmas', 'the rotation wraps around');
  assert.equal(at(-1).type, 'duanwu', 'before the anchor it still rotates');
  const r = at(15);
  assert.equal(r.endsAt - r.startsAt, REPRINT_RULES.days * DAY);
  assert.equal(r.next.type, 'anniversary');
  assert.equal(r.rarity, COSTUME_TYPE_META.newyear.rarity);
  assert.equal(currentReprint([]), null, 'no live archive extras → no reprint');
  assert.equal(currentReprint(['duanwu', 'swimsuit']).type, 'duanwu', 'standing types never rotate in');
});

test('公示概率：复刻 8 件＋常驻 40 件，合计 100%，复刻款的稀有度一半给复刻款', () => {
  for (const type of REPRINT_RULES.types) {
    const r = currentReprint([type]);
    const { featured, standing } = reprintTable(r);
    assert.equal(featured.length, 8);
    assert.equal(standing.length, 40);
    assert.ok(featured.every((c) => c.type === type));
    const rates = reprintRates(r);
    const total = rates.featured.total + Object.values(rates.byRarity).reduce((sum, v) => sum + v.standingTotal, 0);
    assert.ok(Math.abs(total - 1) < 1e-9, `${type}: ${total}`);
    assert.ok(Math.abs(rates.featured.total - GACHA_RATES.costume[r.rarity] * REPRINT_RULES.featuredShare) < 1e-12);
  }
});

test('抽取：复刻池与服饰池共用保底计数与衣橱券点数；第 90 抽必出 5★；没有复刻时不扣钻石', () => {
  const r = currentReprint(['anniversary']); // ★5 的纪念日礼服
  const account = { diamonds: 1e7, ownedCharacters: ['lia'], pityCounters: { costume: PITY_THRESHOLD - 1 } };
  const one = pullGacha(account, 'reprint', 1, { reprint: r });
  assert.equal(one.ok, true);
  assert.equal(one.results[0].rarity, 5, 'pity carried over from the costume pool');
  assert.equal(account.pityCounters.costume, 0);
  assert.equal(account.wardrobe.points, 1);
  pullGacha(account, 'costume', 10);
  assert.equal(account.wardrobe.points, 11, 'one counter for both pools');
  let featured = 0, n = 0;
  for (let i = 0; i < 400; i += 1) for (const item of pullGacha(account, 'reprint', 10, { reprint: r }).results) { n += 1; if (item.type === 'anniversary') featured += 1; }
  assert.ok(featured > 0, 'the featured archive costumes can be pulled');
  const before = account.diamonds;
  assert.equal(pullGacha(account, 'reprint', 10).code, 'NO_REPRINT');
  assert.equal(account.diamonds, before);
});

// ─── HTTP ───
async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => { const { port } = server.address(); server.close((e) => (e ? reject(e) : resolve(port))); });
  });
}
test('HTTP: /api/gacha/pools 公示本期复刻，pool: reprint 可以抽', { timeout: 30000 }, async (t) => {
  const port = await freePort();
  const env = { ...process.env, AI_MODE: 'demo', HOST: '127.0.0.1', PORT: String(port), NODE_ENV: 'test', DEMO_TOOLS: '1', PERSIST: '0' };
  delete env.ADMIN_KEY;
  const child = spawn(process.execPath, ['server.mjs'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => { if (child.exitCode === null) child.kill('SIGKILL'); });
  const base = `http://127.0.0.1:${port}`;
  for (const deadline = Date.now() + 8000; ;) {
    try { if ((await fetch(`${base}/api/health`)).ok) break; } catch { /* starting */ }
    if (Date.now() > deadline) throw new Error('server did not start');
    await new Promise((r) => setTimeout(r, 60));
  }
  const api = async (p, body) => (await fetch(`${base}${p}`, { method: body ? 'POST' : 'GET', headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })).json();
  const playerId = (await api('/api/account/create', { playerName: '复刻' })).account.id;
  const pools = await api(`/api/gacha/pools?playerId=${playerId}`);
  assert.ok(pools.reprint, 'all archive extras are live, so a reprint is open');
  assert.ok(REPRINT_RULES.types.includes(pools.reprint.type));
  assert.equal(pools.reprint.items.length, 8);
  assert.ok(pools.reprint.items.every((c) => c.sealed), 'zero progress: every heroine is still sealed');
  const pull = await api('/api/gacha/pull', { playerId, pool: 'reprint', count: 10 });
  assert.equal(pull.ok, true);
  assert.equal(pull.pool, 'reprint');
  assert.equal(pull.results.length, 10);
  assert.equal(pull.reprint.type, pools.reprint.type);
  assert.equal(pull.wardrobe.points, 10);
});
