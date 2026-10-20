// 轨道 V：HTTP 层加固与存档持久化的回归测试（V1–V10）
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import net from 'node:net';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createSaveStore, isValidSave, rekeyBattleUids, resolvePersistConfig, DEFAULT_SAVE_FILE } from '../game/persist.mjs';
import { readJsonCached } from '../game/story-judge.mjs';
import { createAnalyticsStore, trackSession, trackDailyActive, pruneAnalytics } from '../game/analytics.mjs';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'moonlit-v-'));
test.after(() => fs.rmSync(tmpRoot, { recursive: true, force: true }));

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

/** 启动一个独立的 server.mjs；默认 PERSIST=0、AI_MODE=demo、NODE_ENV=test。 */
async function startServer(env = {}, { port: fixedPort } = {}) {
  const port = fixedPort || await freePort();
  const fullEnv = { ...process.env, AI_MODE: 'demo', HOST: '127.0.0.1', PORT: String(port), NODE_ENV: 'test', PERSIST: '0' };
  delete fullEnv.ADMIN_KEY;
  delete fullEnv.DEMO_TOOLS;
  delete fullEnv.SAVE_FILE;
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete fullEnv[key];
    else fullEnv[key] = value;
  }
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
    port,
    child,
    logs: () => logs,
    async stop(signal = 'SIGTERM') {
      if (child.exitCode === null && child.signalCode === null) child.kill(signal);
      await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 4000))]);
      children.delete(child);
    }
  };
}

async function api(base, pathname, { method, body, headers = {} } = {}) {
  const response = await fetch(`${base}${pathname}`, {
    method: method || (body === undefined ? 'GET' : 'POST'),
    headers: { 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : (typeof body === 'string' ? body : JSON.stringify(body))
  });
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* 非 JSON */ }
  return { status: response.status, headers: response.headers, json, text };
}

/** 原样发送请求行（不经过 URL 规范化），用于路径穿越与畸形请求测试。 */
function rawRequest(port, payload) {
  return new Promise((resolve, reject) => {
    // 只写不半关：请求都带 Connection: close，由服务器响应后关闭连接
    const socket = net.connect(port, '127.0.0.1', () => socket.write(payload));
    let data = '';
    socket.setEncoding('utf8');
    socket.on('data', (chunk) => { data += chunk; });
    socket.on('end', () => resolve(data));
    socket.on('error', reject);
    socket.setTimeout(3000, () => { socket.destroy(); resolve(data); });
  });
}

function rawGet(port, rawPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path: rawPath, method: 'GET' }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

const statusLine = (raw) => Number(String(raw).split(' ')[1]);

// ─── 单个默认服务器上的一组 HTTP 层测试 ───

test('HTTP hardening on a default server', { timeout: 30000 }, async (t) => {
  const srv = await startServer();
  t.after(() => srv.stop());

  await t.test('V1: malformed Host header or request target does not crash the process', async () => {
    const res = await rawRequest(srv.port, 'GET / HTTP/1.1\r\nHost: [\r\nConnection: close\r\n\r\n');
    assert.ok(statusLine(res) < 500, res.slice(0, 80));
    const res2 = await rawRequest(srv.port, 'GET http://[/ HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n');
    assert.ok(res2 === '' || statusLine(res2) >= 400, res2.slice(0, 80));
    const health = await api(srv.base, '/api/health');
    assert.equal(health.status, 200);
    assert.equal(srv.child.exitCode, null);
  });

  await t.test('V10: CSP header is identical on /, /story.html, /api/meta and 404 pages', async () => {
    const csp = [];
    for (const p of ['/', '/story.html', '/api/meta', '/assets/nope.svg', '/api/nope']) {
      const res = await fetch(`${srv.base}${p}`);
      await res.arrayBuffer();
      csp.push(res.headers.get('content-security-policy'));
    }
    assert.ok(csp[0] && csp[0].includes("script-src 'self'") && csp[0].includes("img-src 'self' data:"));
    for (const value of csp) assert.equal(value, csp[0]);
  });

  await t.test('V4/V10: ETag + Last-Modified, 304 on revalidation, no-cache', async () => {
    for (const p of ['/', '/story/locations.json', '/assets/portraits/lia.svg']) {
      const first = await fetch(`${srv.base}${p}`, { headers: { 'accept-encoding': 'gzip' } });
      await first.arrayBuffer();
      assert.equal(first.status, 200, p);
      const etag = first.headers.get('etag');
      const lastModified = first.headers.get('last-modified');
      assert.match(etag, /^W\/"\d+-\d+"$/, p);
      assert.ok(lastModified, p);
      assert.equal(first.headers.get('cache-control'), 'no-cache', p);
      const second = await fetch(`${srv.base}${p}`, { headers: { 'if-none-match': etag, 'accept-encoding': 'gzip' } });
      assert.equal(second.status, 304, p);
      assert.equal((await second.arrayBuffer()).byteLength, 0);
      assert.equal(second.headers.get('etag'), etag);
      const third = await fetch(`${srv.base}${p}`, { headers: { 'if-modified-since': lastModified } });
      assert.equal(third.status, 304, p);
      const stale = await fetch(`${srv.base}${p}`, { headers: { 'if-none-match': 'W/"0-0"' } });
      assert.equal(stale.status, 200, p);
      await stale.arrayBuffer();
    }
  });

  await t.test('V4: missing files are real 404s, pages without .html redirect, unknown APIs are 404 JSON', async () => {
    const asset = await api(srv.base, '/assets/nope.svg');
    assert.equal(asset.status, 404);
    assert.equal(asset.json?.error?.code, 'NOT_FOUND');
    const page = await fetch(`${srv.base}/no-such-page.html`, { headers: { accept: 'text/html' } });
    assert.equal(page.status, 404);
    assert.match(page.headers.get('content-type'), /text\/html/);
    assert.match(await page.text(), /返回标题页/);
    const redirect = await fetch(`${srv.base}/story`, { redirect: 'manual' });
    assert.equal(redirect.status, 301);
    assert.equal(redirect.headers.get('location'), '/story.html');
    const unknownGet = await api(srv.base, '/api/nope');
    assert.equal(unknownGet.status, 404);
    assert.equal(unknownGet.json.error.code, 'NOT_FOUND');
    const unknownPost = await api(srv.base, '/api/nope', { body: {} });
    assert.equal(unknownPost.status, 404);
    const wrongMethod = await api(srv.base, '/api/account/create');
    assert.equal(wrongMethod.status, 405);
  });

  await t.test('V10: path traversal never serves source files; %00 does not leak absolute paths', async () => {
    for (const raw of ['/..%2fserver.mjs', '/%2e%2e/server.mjs', '/assets/..%2f..%2fserver.mjs', '/..%5cserver.mjs', '/../server.mjs', '/%2e%2e%2fgame/ai.mjs']) {
      const res = await rawGet(srv.port, raw);
      assert.notEqual(res.status, 200, raw);
      assert.ok(!res.body.includes('import '), `${raw} leaked source`);
    }
    for (const raw of ['/%00', '/%E0%A4%A', '/a%00.js']) {
      const res = await rawGet(srv.port, raw);
      assert.equal(res.status, 400, raw);
      assert.ok(!res.body.includes(projectDir), `${raw} leaked ${projectDir}`);
    }
  });

  await t.test('V4: non-object JSON bodies are handled; rule errors keep their message', async () => {
    for (const body of ['null', '[1,2]', '42', '"x"']) {
      const res = await api(srv.base, '/api/advance', { body });
      assert.equal(res.status, 400, body);
      assert.ok(!/Cannot read|undefined|null/.test(res.json.error.message), res.json.error.message);
      const purchase = await api(srv.base, '/api/membership/purchase', { body });
      assert.ok(purchase.status === 400 || purchase.status === 404, body);
      assert.ok(!/Cannot read/.test(purchase.text));
    }
    const bad = await api(srv.base, '/api/advance', { body: '{"sessionId":' });
    assert.equal(bad.status, 400);
    assert.equal(bad.json.error.code, 'BAD_JSON');

    const { json: created } = await api(srv.base, '/api/session', { body: { playerName: '规则测试' } });
    const sessionId = created.state.id;
    await api(srv.base, '/api/advance', { body: { sessionId, action: 'begin_camp' } });
    let last;
    for (let i = 0; i <= created.state.maxChatTurns; i += 1) {
      last = await api(srv.base, '/api/chat', { body: { sessionId, characterId: 'lia', message: `第${i}句` } });
    }
    assert.equal(last.status, 400);
    assert.match(last.json.error.message, /战前交流次数已用完/);
    const unknownCharacter = await api(srv.base, '/api/chat', { body: { sessionId, characterId: 'nobody', message: 'hi' } });
    assert.equal(unknownCharacter.status, 400);
    assert.equal(unknownCharacter.json.error.message, '未知角色。');
  });

  await t.test('V6: malformed ids are rejected with 400, unknown accounts cannot store settings', async () => {
    const huge = 'x'.repeat(60000);
    const probes = [
      ['/api/settings/ai', { playerId: huge, modelId: 'deepseek-flash' }],
      ['/api/membership/purchase', { playerId: huge, tierId: 'gold' }],
      ['/api/cards/pack', { playerId: huge }],
      ['/api/battle/end-turn', { playerId: huge }],
      ['/api/rewards/daily', { playerId: huge }],
      ['/api/story/progress', { playerId: huge, chapterId: 'ch000' }],
      ['/api/advance', { sessionId: huge, action: 'begin_camp' }]
    ];
    for (const [p, body] of probes) {
      const res = await api(srv.base, p, { body });
      assert.equal(res.status, 400, p);
      assert.equal(res.json.error.code, 'BAD_ID', p);
    }
    for (const p of [`/api/account?playerId=${'y'.repeat(4000)}`, `/api/rewards/status?playerId=${'y'.repeat(4000)}`, `/api/session/${'a'.repeat(4000)}`, '/api/gallery?sessionId=zzz']) {
      assert.equal((await api(srv.base, p)).status, 400, p);
    }
    const ghost = await api(srv.base, '/api/settings/ai', { body: { playerId: '00000000-0000-4000-8000-000000000000', modelId: 'deepseek-flash' } });
    assert.equal(ghost.status, 404);
    const defaults = await api(srv.base, '/api/settings/ai?playerId=');
    assert.equal(defaults.status, 200);
  });

  await t.test('V3/K-6: account payloads never expose _meter', async () => {
    const { status, json } = await api(srv.base, '/api/account/create', { body: { playerName: '计量' } });
    assert.equal(status, 201);
    const playerId = json.account.id;
    const responses = [
      json,
      (await api(srv.base, `/api/account?playerId=${playerId}`)).json,
      (await api(srv.base, '/api/membership/purchase', { body: { playerId, tierId: 'silver' } })).json,
      (await api(srv.base, '/api/diamonds/purchase', { body: { playerId, packId: 'pack_6' } })).json,
      (await api(srv.base, '/api/gacha/pull', { body: { playerId, pool: 'character', count: 1 } })).json,
      (await api(srv.base, '/api/gacha/pull', { body: { playerId, pool: 'costume', count: 1, currency: 'diamonds' } })).json,
      (await api(srv.base, '/api/cards/pack', { body: { playerId, count: 1 } })).json,
      (await api(srv.base, '/api/rewards/daily', { body: { playerId } })).json,
      (await api(srv.base, `/api/rewards/status?playerId=${playerId}`)).json,
      (await api(srv.base, '/api/story/progress', { body: { playerId, chapterId: 'ch000' } })).json
    ];
    for (const payload of responses) {
      assert.ok(payload);
      assert.ok(!JSON.stringify(payload).includes('_meter'), JSON.stringify(payload).slice(0, 120));
      assert.ok(!JSON.stringify(payload).includes('_cardInit'));
    }
    const credit = await api(srv.base, `/api/credit?playerId=${playerId}`);
    assert.equal(credit.status, 200);
    assert.equal(typeof credit.json.meter.balance, 'number');
  });

  await t.test('V10/V9: battle HTTP layer hides the opponent hand and decks; concede is logged', async () => {
    const { json: created } = await api(srv.base, '/api/account/create', { body: { playerName: '牌手' } });
    const playerId = created.account.id;
    const assertHidden = (state, label) => {
      assert.ok(Array.isArray(state.players.opponent.hand), label);
      for (const card of state.players.opponent.hand) {
        assert.deepEqual(Object.keys(card).sort(), ['hidden', 'uid'], label);
        assert.equal(card.hidden, true, label);
      }
      assert.equal('deck' in state.players.opponent, false, label);
      assert.equal('deck' in state.players.player, false, label);
      assert.equal(typeof state.players.opponent.deckCount, 'number', label);
      assert.equal('_rng' in state, false, label);
    };
    let res = await api(srv.base, '/api/battle/start', { body: { playerId, playerClass: 'lia', opponentClass: 'serena' } });
    assert.equal(res.status, 201);
    assertHidden(res.json.state, 'start');
    for (let round = 0; round < 3 && res.json.state.phase !== 'gameover'; round += 1) {
      const play = (res.json.state.legalPlays || []).find((p) => !p.needsTarget);
      if (play) {
        const acted = await api(srv.base, '/api/battle/action', { body: { playerId, action: { type: 'play', handUid: play.uid } } });
        assert.equal(acted.status, 200, acted.text);
        assertHidden(acted.json.state, 'action');
      }
      res = await api(srv.base, '/api/battle/end-turn', { body: { playerId } });
      assert.equal(res.status, 200);
      assertHidden(res.json.state, 'end-turn');
      assert.ok(Array.isArray(res.json.aiActions));
    }
    const illegal = await api(srv.base, '/api/battle/action', { body: { playerId, action: { type: 'play', handUid: 'nope' } } });
    assert.equal(illegal.status, 400);
    const state = await api(srv.base, `/api/battle/state?playerId=${playerId}`);
    assertHidden(state.json.state, 'state');
    if (state.json.state.phase !== 'gameover') {
      const conceded = await api(srv.base, '/api/battle/concede', { body: { playerId } });
      assert.equal(conceded.status, 200);
      assert.equal(conceded.json.state.phase, 'gameover');
      assert.equal(conceded.json.state.winner, 'opponent');
      assert.equal(conceded.json.state.endReason, 'concede');
      assert.equal(conceded.json.state.log.at(-1).msg, '玩家投降。');
      const again = await api(srv.base, '/api/battle/concede', { body: { playerId } });
      assert.equal(again.json.state.log.filter((line) => line.msg === '玩家投降。').length, 1);
    }
  });

  await t.test('V2: default admin key works only via the x-admin-key header', async () => {
    const meta = await api(srv.base, '/api/meta');
    assert.deepEqual(meta.json.meta.admin, { enabled: true });
    assert.equal((await api(srv.base, '/api/admin/dashboard', { headers: { 'x-admin-key': '123456' } })).status, 200);
    const viaQuery = await api(srv.base, '/api/admin/dashboard?key=123456');
    assert.equal(viaQuery.status, 403);
    assert.equal(viaQuery.json.error.code, 'FORBIDDEN');
    assert.equal((await api(srv.base, '/api/admin/dashboard', { headers: { 'x-admin-key': '1234567' } })).status, 403);
    assert.equal((await api(srv.base, '/api/admin/dashboard', { headers: { 'x-admin-key': '12345' } })).status, 403);
    assert.equal((await api(srv.base, '/api/admin/dashboard')).status, 403);
  });

  await t.test('V3: demo tools are enabled by default', async () => {
    const meta = await api(srv.base, '/api/meta');
    assert.equal(meta.json.meta.demoTools, true);
    const { json } = await api(srv.base, '/api/account/create', { body: { playerName: '演示' } });
    const playerId = json.account.id;
    assert.equal((await api(srv.base, '/api/costume/grant-all', { body: { playerId } })).status, 200);
    assert.equal((await api(srv.base, '/api/membership/purchase', { body: { playerId, tierId: 'gold' } })).status, 200);
    assert.equal((await api(srv.base, '/api/diamonds/purchase', { body: { playerId, packId: 'pack_30' } })).status, 200);
  });
});

// ─── 不同环境变量下的开关 ───

test('V2/V3: ADMIN_KEY and DEMO_TOOLS / NODE_ENV switches', { timeout: 30000 }, async (t) => {
  const [production, productionForced, demoOff, adminOff, adminCustom] = await Promise.all([
    startServer({ NODE_ENV: 'production' }),
    startServer({ NODE_ENV: 'production', DEMO_TOOLS: '1' }),
    startServer({ DEMO_TOOLS: '0' }),
    startServer({ ADMIN_KEY: '' }),
    startServer({ ADMIN_KEY: 's3cret-key' })
  ]);
  t.after(() => Promise.all([production, productionForced, demoOff, adminOff, adminCustom].map((s) => s.stop())));

  const demoEndpoints = async (srv) => {
    const { json } = await api(srv.base, '/api/account/create', { body: { playerName: '开关' } });
    const playerId = json.account.id;
    return Promise.all([
      api(srv.base, '/api/costume/grant-all', { body: { playerId } }),
      api(srv.base, '/api/membership/purchase', { body: { playerId, tierId: 'gold' } }),
      api(srv.base, '/api/diamonds/purchase', { body: { playerId, packId: 'pack_30' } })
    ]);
  };

  for (const srv of [production, demoOff]) {
    assert.equal((await api(srv.base, '/api/meta')).json.meta.demoTools, false);
    for (const res of await demoEndpoints(srv)) {
      assert.equal(res.status, 403);
      assert.equal(res.json.error.code, 'DEMO_TOOLS_DISABLED');
    }
  }
  assert.equal((await api(productionForced.base, '/api/meta')).json.meta.demoTools, true);
  for (const res of await demoEndpoints(productionForced)) assert.equal(res.status, 200);

  const offMeta = await api(adminOff.base, '/api/meta');
  assert.deepEqual(offMeta.json.meta.admin, { enabled: false });
  const disabled = await api(adminOff.base, '/api/admin/dashboard', { headers: { 'x-admin-key': '123456' } });
  assert.equal(disabled.status, 404);
  assert.equal(disabled.json.error.code, 'ADMIN_DISABLED');

  assert.deepEqual((await api(adminCustom.base, '/api/meta')).json.meta.admin, { enabled: true });
  assert.equal((await api(adminCustom.base, '/api/admin/dashboard', { headers: { 'x-admin-key': 's3cret-key' } })).status, 200);
  assert.equal((await api(adminCustom.base, '/api/admin/dashboard', { headers: { 'x-admin-key': '123456' } })).status, 403);
  assert.equal((await api(adminCustom.base, '/api/admin/dashboard?key=s3cret-key')).status, 403);
});

test('V6: total sessions and accounts are capped with 503 SERVER_FULL', { timeout: 20000 }, async (t) => {
  const srv = await startServer({ MAX_ACCOUNTS: '2', MAX_SESSIONS: '2' });
  t.after(() => srv.stop());
  for (let i = 0; i < 2; i += 1) assert.equal((await api(srv.base, '/api/account/create', { body: {} })).status, 201);
  const fullAccounts = await api(srv.base, '/api/account/create', { body: {} });
  assert.equal(fullAccounts.status, 503);
  assert.equal(fullAccounts.json.error.code, 'SERVER_FULL');
  const first = await api(srv.base, '/api/session', { body: {} });
  assert.equal(first.status, 201);
  assert.equal((await api(srv.base, '/api/session', { body: {} })).status, 201);
  assert.equal((await api(srv.base, '/api/session', { body: {} })).status, 503);
  // 重开（替换）不增加总数，仍然可用
  const restarted = await api(srv.base, '/api/restart', { body: { sessionId: first.json.state.id } });
  assert.equal(restarted.status, 200);
  assert.equal((await api(srv.base, '/api/health')).json.sessions, 2);
});

// ─── 存档持久化 ───

async function waitFor(predicate, timeoutMs = 4000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return predicate();
}

const readSave = (file) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
};

test('V5: saves survive a crash and a restart', { timeout: 30000 }, async (t) => {
  const dir = fs.mkdtempSync(path.join(tmpRoot, 'save-'));
  const saveFile = path.join(dir, 'saves.json');
  const env = { PERSIST: '1', SAVE_FILE: saveFile };
  let srv = await startServer(env);
  t.after(() => srv.stop('SIGKILL'));

  const { json: session } = await api(srv.base, '/api/session', { body: { playerName: '存档队长' } });
  const sessionId = session.state.id;
  await api(srv.base, '/api/advance', { body: { sessionId, action: 'begin_camp' } });
  await api(srv.base, '/api/chat', { body: { sessionId, characterId: 'lia', message: '我保证不会丢下任何队友。' } });
  const { json: account } = await api(srv.base, '/api/account/create', { body: { playerName: '存档' } });
  const playerId = account.account.id;
  await api(srv.base, '/api/costume/grant-all', { body: { playerId } });
  const owned = (await api(srv.base, `/api/costume?playerId=${playerId}`)).json;
  const liaCostume = owned.ownedCostumes.find((id) => id.startsWith('lia_'));
  assert.equal((await api(srv.base, '/api/costume/equip', { body: { playerId, characterId: 'lia', costumeId: liaCostume } })).status, 200);
  assert.equal((await api(srv.base, '/api/cards/pack', { body: { playerId, count: 10 } })).status, 200);
  assert.equal((await api(srv.base, '/api/battle/start', { body: { playerId, playerClass: 'lia', opponentClass: 'lilith' } })).status, 201);
  await api(srv.base, '/api/battle/end-turn', { body: { playerId } });

  const before = {
    session: (await api(srv.base, `/api/session/${sessionId}`)).json.state,
    costume: (await api(srv.base, `/api/costume?playerId=${playerId}`)).json,
    collection: (await api(srv.base, `/api/cards/collection?playerId=${playerId}`)).json,
    summary: (await api(srv.base, `/api/cards/summary?playerId=${playerId}`)).json.summary,
    battle: (await api(srv.base, `/api/battle/state?playerId=${playerId}`)).json.state
  };

  // 防抖写盘（≤1 秒）后直接 SIGKILL，模拟崩溃：不能依赖退出时的 flush
  const written = await waitFor(() => {
    const data = readSave(saveFile);
    return Boolean(data?.playerAccounts?.[playerId]?.collection && data.battles?.[playerId] && data.sessions?.[sessionId]?.scene === 'camp');
  });
  assert.ok(written, 'save file written within the debounce window');
  assert.ok(!fs.readdirSync(dir).some((name) => name.endsWith('.tmp')), 'no temp files left behind');
  await srv.stop('SIGKILL');

  srv = await startServer(env);
  const session2 = await api(srv.base, `/api/session/${sessionId}`);
  assert.equal(session2.status, 200);
  const { updatedAt: _a, ...sessionAfter } = session2.json.state;
  const { updatedAt: _b, ...sessionBefore } = before.session;
  assert.deepEqual(sessionAfter, sessionBefore);
  const costume2 = (await api(srv.base, `/api/costume?playerId=${playerId}`)).json;
  assert.equal(costume2.ownedCostumes.length, before.costume.ownedCostumes.length);
  assert.deepEqual(costume2.equipped, before.costume.equipped);
  assert.deepEqual((await api(srv.base, `/api/cards/collection?playerId=${playerId}`)).json, before.collection);
  assert.deepEqual((await api(srv.base, `/api/cards/summary?playerId=${playerId}`)).json.summary, before.summary);
  const battle2 = (await api(srv.base, `/api/battle/state?playerId=${playerId}`)).json.state;
  assert.equal(battle2.turn, before.battle.turn);
  assert.equal(battle2.players.player.leader.hp, before.battle.players.player.leader.hp);
  assert.equal(battle2.players.player.hand.length, before.battle.players.player.hand.length);

  // 恢复后的对局可以继续打，且新抽到的牌不会和旧 uid 撞号
  let state = battle2;
  for (let i = 0; i < 4 && state.phase !== 'gameover'; i += 1) {
    const res = await api(srv.base, '/api/battle/end-turn', { body: { playerId } });
    assert.equal(res.status, 200, res.text);
    state = res.json.state;
    const uids = ['hand', 'field'].flatMap((zone) => [...state.players.player[zone], ...state.players.opponent[zone]]).map((c) => c.uid);
    assert.equal(new Set(uids).size, uids.length, `duplicate uid: ${uids.join(',')}`);
    const play = (state.legalPlays || []).find((p) => !p.needsTarget);
    if (play) {
      const acted = await api(srv.base, '/api/battle/action', { body: { playerId, action: { type: 'play', handUid: play.uid } } });
      assert.equal(acted.status, 200, acted.text);
      state = acted.json.state;
    }
  }

  // SIGTERM 时同步写盘：刚创建的账户也不会丢
  const { json: late } = await api(srv.base, '/api/account/create', { body: { playerName: '最后一刻' } });
  await srv.stop('SIGTERM');
  assert.ok(readSave(saveFile)?.playerAccounts?.[late.account.id], 'flushed on SIGTERM');
  srv = await startServer(env);
  assert.equal((await api(srv.base, `/api/account?playerId=${late.account.id}`)).status, 200);
});

test('V5: a corrupt save file is quarantined and the server starts empty', { timeout: 20000 }, async (t) => {
  const dir = fs.mkdtempSync(path.join(tmpRoot, 'corrupt-'));
  const saveFile = path.join(dir, 'saves.json');
  fs.writeFileSync(saveFile, '{"version":1,"sessions":');
  const srv = await startServer({ PERSIST: '1', SAVE_FILE: saveFile });
  t.after(() => srv.stop());
  assert.equal((await api(srv.base, '/api/health')).status, 200);
  const corrupt = fs.readdirSync(dir).filter((name) => name.startsWith('saves.json.corrupt-'));
  assert.equal(corrupt.length, 1);
  assert.equal(fs.readFileSync(path.join(dir, corrupt[0]), 'utf8'), '{"version":1,"sessions":');
  const { json } = await api(srv.base, '/api/account/create', { body: { playerName: '新档' } });
  assert.ok(await waitFor(() => Boolean(readSave(saveFile)?.playerAccounts?.[json.account.id])));
});

test('V5: persistence is off with PERSIST=0 and by default under the test runner', { timeout: 20000 }, async (t) => {
  const dir = fs.mkdtempSync(path.join(tmpRoot, 'off-'));
  const explicitOff = path.join(dir, 'off.json');
  const implicitOff = path.join(dir, 'implicit.json');
  const [a, b] = await Promise.all([
    startServer({ PERSIST: '0', SAVE_FILE: explicitOff }),
    // 不设 PERSIST：node --test 的子进程带 NODE_TEST_CONTEXT，NODE_ENV=test，默认不写盘
    startServer({ PERSIST: undefined, SAVE_FILE: implicitOff })
  ]);
  t.after(() => Promise.all([a.stop(), b.stop()]));
  for (const srv of [a, b]) {
    await api(srv.base, '/api/account/create', { body: { playerName: '不存' } });
    await api(srv.base, '/api/session', { body: {} });
  }
  await new Promise((resolve) => setTimeout(resolve, 1400));
  await Promise.all([a.stop(), b.stop()]);
  assert.equal(fs.existsSync(explicitOff), false);
  assert.equal(fs.existsSync(implicitOff), false);
  assert.match(a.logs(), /存档：未开启/);
});

test('V5: persist module unit behaviour', async () => {
  assert.equal(resolvePersistConfig({}).enabled, true);
  assert.equal(resolvePersistConfig({}).file, DEFAULT_SAVE_FILE);
  assert.ok(DEFAULT_SAVE_FILE.startsWith(projectDir) && DEFAULT_SAVE_FILE.endsWith(path.join('data', 'saves.json')));
  assert.equal(resolvePersistConfig({ PERSIST: '0' }).enabled, false);
  assert.equal(resolvePersistConfig({ NODE_TEST_CONTEXT: 'child-v8' }).enabled, false);
  assert.equal(resolvePersistConfig({ NODE_TEST_CONTEXT: 'child-v8', PERSIST: '1' }).enabled, true);
  assert.equal(resolvePersistConfig({ SAVE_FILE: 'tmp/x.json' }).file, path.join(projectDir, 'tmp', 'x.json'));
  assert.equal(isValidSave({ version: 1, sessions: {} }), true);
  assert.equal(isValidSave({ version: 1, sessions: [] }), false);
  assert.equal(isValidSave(null), false);
  assert.equal(isValidSave({ version: 99 }), false);

  const dir = fs.mkdtempSync(path.join(tmpRoot, 'unit-'));
  const file = path.join(dir, 'nested', 'saves.json');
  let counter = 0;
  const quiet = { warn() {}, error() {} };
  const store = createSaveStore({ enabled: true, file, debounceMs: 20, logger: quiet, snapshot: () => ({ version: 1, sessions: {}, counter: (counter += 1) }) });
  assert.equal(store.load(), null);
  for (let i = 0; i < 50; i += 1) store.schedule();
  assert.ok(await waitFor(() => fs.existsSync(file), 2000));
  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(counter, 1, 'many schedule() calls collapse into one write');
  await store.flush();
  assert.equal(readSave(file).counter, 2);
  assert.equal(store.flushSync(), true);
  assert.equal(readSave(file).counter, 3);
  store.schedule();
  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(counter, 3, 'no writes after flushSync');

  const reloaded = createSaveStore({ enabled: true, file, logger: quiet, snapshot: () => ({}) });
  assert.equal(reloaded.load().counter, 3);
  const disabled = createSaveStore({ enabled: false, file: path.join(dir, 'never.json'), snapshot: () => ({ version: 1 }) });
  disabled.schedule();
  disabled.flushSync();
  assert.equal(fs.existsSync(path.join(dir, 'never.json')), false);

  const battle = { id: 'u1', players: { player: { hand: [{ uid: 'u12', cardId: 'lia_hero' }] } }, pending: { handUid: 'u12' }, log: [{ msg: 'u12 不是 uid' }], aiActions: [{ target: 'leader' }] };
  rekeyBattleUids(battle, 'rX');
  assert.equal(battle.id, 'rXu1');
  assert.equal(battle.players.player.hand[0].uid, 'rXu12');
  assert.equal(battle.players.player.hand[0].cardId, 'lia_hero');
  assert.equal(battle.pending.handUid, 'rXu12');
  assert.equal(battle.log[0].msg, 'u12 不是 uid');
  assert.equal(battle.aiActions[0].target, 'leader');
});

// ─── AI 限流（openai 模式，mock 上游）───

test('V7: AI endpoints are rate limited and never fan out to more than 3 concurrent upstream calls', { timeout: 30000 }, async (t) => {
  let inflight = 0;
  let peak = 0;
  let calls = 0;
  let behaviour = 'slow-invalid';
  const formats = [];
  const mock = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      calls += 1;
      inflight += 1;
      peak = Math.max(peak, inflight);
      const body = JSON.parse(raw);
      formats.push(body.response_format?.type || 'none');
      const reply = (status, content) => {
        inflight -= 1;
        res.writeHead(status, { 'content-type': 'application/json' });
        res.end(status === 200 ? JSON.stringify({ choices: [{ message: { content } }] }) : JSON.stringify({ error: 'bad format' }));
      };
      if (behaviour === 'slow-invalid') setTimeout(() => reply(200, 'not json'), 400);
      else if (behaviour === 'reject-schema' && body.response_format?.type === 'json_schema') reply(400);
      else reply(200, 'still not json');
    });
  });
  await new Promise((resolve) => mock.listen(0, '127.0.0.1', resolve));
  t.after(() => mock.close());
  const srv = await startServer({ AI_MODE: 'openai', AI_BASE_URL: `http://127.0.0.1:${mock.address().port}/v1`, AI_API_KEY: 'test', AI_TIMEOUT_MS: '5000' });
  t.after(() => srv.stop());

  const chapter = JSON.parse(fs.readFileSync(path.join(projectDir, 'public/story/chapters/ch000.json'), 'utf8'));
  let nodeId = null;
  JSON.stringify(chapter, (key, value) => {
    if (!nodeId && value && typeof value === 'object' && value.t === 'input' && Array.isArray(value.intents)) nodeId = value.id;
    return value;
  });
  assert.ok(nodeId);
  const judge = () => api(srv.base, '/api/story/judge', { body: { chapterId: 'ch000', nodeId, text: '我来帮忙' } });

  // 40 个并发请求：最多 3 个同时打到上游，其余立刻走演示判定；内容不是 JSON 时每个请求只调用 1 次上游
  const burst = await Promise.all(Array.from({ length: 40 }, judge));
  for (const res of burst) assert.equal(res.status, 200);
  const sources = burst.map((res) => res.json.judgement.source);
  assert.ok(peak <= 3, `peak ${peak}`);
  assert.ok(calls <= 40, `calls ${calls}`);
  assert.equal(calls, sources.filter((s) => s === 'fallback').length, 'one upstream call per non-demo request');
  assert.ok(sources.filter((s) => s === 'demo').length >= 37);

  // 只有 HTTP 400/422 才降一级 response_format
  behaviour = 'reject-schema';
  calls = 0;
  formats.length = 0;
  const downgraded = await judge();
  assert.equal(downgraded.status, 200);
  assert.deepEqual(formats, ['json_schema', 'json_object']);
  assert.equal(downgraded.json.judgement.source, 'fallback');

  // 同一 IP 每分钟 20 次：顺序请求很快会被令牌桶挡下改用演示判定
  behaviour = 'fast-invalid';
  calls = 0;
  const sequential = [];
  for (let i = 0; i < 25; i += 1) sequential.push((await judge()).json.judgement.source);
  assert.ok(calls <= 20, `calls ${calls}`);
  assert.ok(sequential.includes('demo'));
  assert.ok(peak <= 3);
});

test('B4 (integration): /api/chat checks the scene cap before calling the model, so an over-cap chat costs no AI call', { timeout: 30000 }, async (t) => {
  let calls = 0;
  const mock = http.createServer((req, res) => {
    req.resume();
    req.on('end', () => {
      calls += 1;
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ choices: [{ message: { content: 'not json' } }] }));
    });
  });
  await new Promise((resolve) => mock.listen(0, '127.0.0.1', resolve));
  t.after(() => mock.close());
  const srv = await startServer({ AI_MODE: 'openai', AI_BASE_URL: `http://127.0.0.1:${mock.address().port}/v1`, AI_API_KEY: 'test', AI_TIMEOUT_MS: '5000' });
  t.after(() => srv.stop());

  const { json: created } = await api(srv.base, '/api/session', { body: { playerName: '上限测试' } });
  const sessionId = created.state.id;
  assert.equal((await api(srv.base, '/api/advance', { body: { sessionId, action: 'begin_camp' } })).status, 200);
  const limit = created.state.chatLimits.camp;
  assert.ok(limit > 0 && limit < 20, 'camp limit stays under the per-IP AI rate limit, so every allowed chat reaches the mock');
  for (let i = 0; i < limit; i += 1) {
    const res = await api(srv.base, '/api/chat', { body: { sessionId, characterId: 'lia', message: `营地第${i + 1}句` } });
    assert.equal(res.status, 200);
  }
  assert.equal(calls, limit, 'one upstream call per allowed chat');
  const over = await api(srv.base, '/api/chat', { body: { sessionId, characterId: 'lia', message: '再说一句' } });
  assert.equal(over.status, 400);
  assert.match(over.json.error.message, /交流次数已用完/);
  assert.equal(calls, limit, 'the over-cap chat must not reach the model');
});

// ─── 其他模块级回归 ───

test('V8: story judge file cache is invalidated when the file changes', () => {
  const dir = fs.mkdtempSync(path.join(tmpRoot, 'cache-'));
  const file = path.join(dir, 'ch999.json');
  fs.writeFileSync(file, JSON.stringify({ intent: 'old' }));
  const first = readJsonCached(file);
  assert.equal(first.intent, 'old');
  assert.equal(readJsonCached(file), first, 'unchanged file is served from cache');
  fs.writeFileSync(file, JSON.stringify({ intent: 'renamed' }));
  assert.equal(readJsonCached(file).intent, 'renamed');
  // 同样大小但 mtime 变了也要重新读
  fs.writeFileSync(file, JSON.stringify({ intent: 'abcdefg' }));
  const future = new Date(Date.now() + 5000);
  fs.utimesSync(file, future, future);
  assert.equal(readJsonCached(file).intent, 'abcdefg');
  fs.unlinkSync(file);
  assert.throws(() => readJsonCached(file));
});

test('V6: analytics store stays bounded and prunes old data', () => {
  const store = createAnalyticsStore();
  for (let i = 0; i < 300; i += 1) trackSession(store, 'same-player', 'gacha_pull');
  assert.ok(store.sessions.get('same-player').events.length <= 50);
  trackDailyActive(store, 'old-user');
  const old = Date.now() - 60 * 24 * 60 * 60 * 1000;
  store.sessions.get('same-player').lastAt = old;
  const oldKey = new Date(old).toISOString().slice(0, 10);
  store.dailyActive.set(oldKey, new Set(['ancient']));
  store.firstSeen.set('ancient', oldKey);
  pruneAnalytics(store);
  assert.equal(store.sessions.has('same-player'), false);
  assert.equal(store.dailyActive.has(oldKey), false);
  assert.equal(store.firstSeen.has('ancient'), false);
  assert.equal(store.firstSeen.has('old-user'), true);
});

test('V1: a port already in use prints a Chinese hint and exits with code 1', { timeout: 15000 }, async () => {
  const blocker = net.createServer();
  await new Promise((resolve) => blocker.listen(0, '127.0.0.1', resolve));
  const { port } = blocker.address();
  try {
    const child = spawn(process.execPath, ['server.mjs'], { cwd: projectDir, env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', PERSIST: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { output += chunk; });
    const code = await new Promise((resolve) => {
      const timer = setTimeout(() => { child.kill('SIGKILL'); resolve('timeout'); }, 8000);
      child.once('exit', (exitCode) => { clearTimeout(timer); resolve(exitCode); });
    });
    assert.equal(code, 1);
    assert.match(output, new RegExp(`端口 ${port} 被占用，可用 PORT=xxxx 换端口`));
  } finally {
    blocker.close();
  }
});
