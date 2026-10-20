import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

async function waitForHealth(baseUrl, child) {
  const deadline = Date.now() + 6000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`server exited with ${child.exitCode}`);
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return response;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  throw new Error('server did not become healthy');
}

async function post(baseUrl, pathname, payload) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const body = await response.json();
  assert.equal(response.ok, true, body?.error?.message || `${pathname} failed`);
  return { response, body };
}

test('HTTP API supports a complete playable prologue', { timeout: 12000 }, async (t) => {
  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: projectDir,
    env: {
      ...process.env,
      AI_MODE: 'demo',
      HOST: '127.0.0.1',
      PORT: String(port),
      NODE_ENV: 'test',
      PERSIST: '0'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let diagnostics = '';
  child.stdout.on('data', (chunk) => { diagnostics += chunk.toString(); });
  child.stderr.on('data', (chunk) => { diagnostics += chunk.toString(); });

  t.after(async () => {
    if (child.exitCode === null) {
      child.kill('SIGTERM');
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 1500);
        child.once('exit', () => {
          clearTimeout(timer);
          resolve();
        });
      });
    }
  });

  const health = await waitForHealth(baseUrl, child).catch((error) => {
    throw new Error(`${error.message}\n${diagnostics}`);
  });
  assert.equal(health.headers.get('x-content-type-options'), 'nosniff');

  let result = await post(baseUrl, '/api/session', { playerName: '<测试队长>' });
  let state = result.body.state;
  const sessionId = state.id;
  assert.equal(state.scene, 'intro');
  assert.equal('rngSeed' in state, false);

  result = await post(baseUrl, '/api/advance', { sessionId, action: 'begin_camp' });
  state = result.body.state;
  assert.equal(state.scene, 'camp');

  result = await post(baseUrl, '/api/chat', {
    sessionId,
    characterId: 'lia',
    message: '我保证不会丢下任何队友。'
  });
  state = result.body.state;
  assert.equal(result.body.ai.source, 'demo');
  assert.equal(state.flags.madePromise, true);

  result = await post(baseUrl, '/api/strategy', { sessionId, strategyId: 'lia' });
  state = result.body.state;
  assert.equal(state.chosenStrategyId, 'lia');

  result = await post(baseUrl, '/api/advance', { sessionId, action: 'begin_battle' });
  state = result.body.state;
  assert.equal(state.scene, 'battle');

  for (let turns = 0; state.scene === 'battle' && turns < 12; turns += 1) {
    const actionId = state.focus >= 30 ? 'skill' : 'attack';
    result = await post(baseUrl, '/api/battle', { sessionId, actionId });
    state = result.body.state;
  }
  assert.equal(state.scene, 'aftermath');
  assert.equal(state.flags.battleWon, true);

  result = await post(baseUrl, '/api/ending', { sessionId, decisionId: 'seal' });
  state = result.body.state;
  assert.equal(state.scene, 'ending');
  assert.ok(['A', 'B', 'S'].includes(state.ending.rank));
  assert.match(state.ending.title, /结局|契约/);
});

// 集成：/api/gacha/pull 只靠 pullGacha 记录拥有（服务端那段重复的循环已删）；/api/costume/equip 的「恢复默认」走 equipCostume 的校验
async function startServer(t, extraEnv = {}) {
  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: projectDir,
    env: { ...process.env, AI_MODE: 'demo', HOST: '127.0.0.1', PORT: String(port), NODE_ENV: 'test', PERSIST: '0', ...extraEnv },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let diagnostics = '';
  child.stdout.on('data', (chunk) => { diagnostics += chunk.toString(); });
  child.stderr.on('data', (chunk) => { diagnostics += chunk.toString(); });
  t.after(async () => {
    if (child.exitCode !== null) return;
    child.kill('SIGTERM');
    await new Promise((resolve) => { const timer = setTimeout(resolve, 1500); child.once('exit', () => { clearTimeout(timer); resolve(); }); });
  });
  await waitForHealth(baseUrl, child).catch((error) => { throw new Error(`${error.message}\n${diagnostics}`); });
  return baseUrl;
}

test('HTTP gacha + wardrobe: pulls are recorded once, isNew is honest, equip validates the default outfit too', { timeout: 12000 }, async (t) => {
  const baseUrl = await startServer(t);
  const playerId = (await post(baseUrl, '/api/account/create', { playerName: '测试' })).body.account.id;
  const first = (await post(baseUrl, '/api/gacha/pull', { playerId, pool: 'costume', count: 10 })).body;
  const owned = await (await fetch(`${baseUrl}/api/costume?playerId=${playerId}`)).json();
  const ids = first.results.map((r) => r.id);
  assert.deepEqual([...new Set(owned.ownedCostumes)].sort(), [...new Set(ids)].sort(), 'every pulled costume is owned, nothing else');
  assert.equal(owned.ownedCostumes.length, new Set(owned.ownedCostumes).size, 'no duplicates in ownedCostumes');
  // a copy already owned before this pull is never NEW
  const second = (await post(baseUrl, '/api/gacha/pull', { playerId, pool: 'costume', count: 10 })).body;
  for (const r of second.results) if (ids.includes(r.id)) assert.equal(r.isNew, false, `${r.id} was owned already`);

  const equip = (payload) => fetch(`${baseUrl}/api/costume/equip`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ playerId, ...payload }) });
  let r = await equip({ characterId: 'lia', costumeId: 'default' });
  assert.equal(r.status, 200);
  assert.equal((await r.json()).equipped.costumeId, null);
  r = await equip({ characterId: 'nobody', costumeId: 'default' });
  assert.equal(r.status, 400, 'restoring the default outfit of an unknown character is rejected');
  r = await equip({ characterId: 'lia', costumeId: 'lia_newyear' });
  assert.equal(r.status, ids.includes('lia_newyear') && owned.ownedCharacters?.includes('lia') ? 200 : 400);
});
