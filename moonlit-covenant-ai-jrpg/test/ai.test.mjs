import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createInitialState, advanceScene, applyChatOutcome } from '../game/engine.mjs';
import { AI_CONFIG, generateCharacterReply, resolveDotEnvPath } from '../game/ai.mjs';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('demo dialogue returns bounded structured output', async () => {
  const state = createInitialState('测试队长');
  advanceScene(state, 'begin_camp');
  const reply = await generateCharacterReply(state, 'serena', '我宁愿听难听的真话。');
  assert.equal(typeof reply.utterance, 'string');
  assert.ok(reply.utterance.length > 0 && reply.utterance.length <= 180);
  assert.ok(Number.isInteger(reply.bondDelta));
  assert.ok(reply.bondDelta >= -2 && reply.bondDelta <= 2);
  assert.ok(['demo', 'model', 'fallback'].includes(reply.source));
});

// ─── D6：.env 路径与模型重试阶梯 ───

test('D6: .env resolves from the project root first, then the working directory', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-dotenv-'));
  try {
    const root = path.join(tmp, 'proj');
    const elsewhere = path.join(tmp, 'elsewhere');
    fs.mkdirSync(path.join(root, 'game'), { recursive: true });
    fs.mkdirSync(elsewhere);
    for (const file of ['ai.mjs', 'content.mjs']) fs.copyFileSync(path.join(projectDir, 'game', file), path.join(root, 'game', file));
    fs.writeFileSync(path.join(root, '.env'), 'AI_MODE=openai\nAI_MODEL=from-project-root\n');
    fs.writeFileSync(path.join(elsewhere, '.env'), 'AI_MODE=demo\nAI_MODEL=from-cwd\n');

    assert.equal(resolveDotEnvPath(root, elsewhere), path.join(root, '.env'));
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('AI_')));
    const probe = () => {
      const out = spawnSync(process.execPath, ['--input-type=module', '-e',
        `const m = await import(${JSON.stringify(pathToFileURL(path.join(root, 'game', 'ai.mjs')).href)}); console.log(JSON.stringify({ mode: m.AI_CONFIG.mode, model: m.AI_CONFIG.model }));`],
      { cwd: elsewhere, env, encoding: 'utf8' });
      assert.equal(out.status, 0, out.stderr);
      return JSON.parse(out.stdout.trim());
    };
    // 从别的目录启动：仍然读项目根的 .env
    assert.deepEqual(probe(), { mode: 'openai', model: 'from-project-root' });

    // 项目根没有 .env 时，才退回当前目录
    fs.unlinkSync(path.join(root, '.env'));
    assert.equal(resolveDotEnvPath(root, elsewhere), path.join(elsewhere, '.env'));
    assert.deepEqual(probe(), { mode: 'demo', model: 'from-cwd' });

    fs.unlinkSync(path.join(elsewhere, '.env'));
    assert.equal(resolveDotEnvPath(root, elsewhere), null);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('D6: model ladder only steps down on HTTP 400/422; bad content falls back after one call', async (t) => {
  t.mock.method(console, 'warn', () => {});
  let behaviour = 'invalid';
  const formats = [];
  const mock = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      const body = JSON.parse(raw);
      const format = body.response_format?.type || 'none';
      formats.push(format);
      const ok = (content) => {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ choices: [{ message: { content } }] }));
      };
      const fail = (status) => {
        res.writeHead(status, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: 'nope' }));
      };
      const good = JSON.stringify({ utterance: '收到，按计划行动。', emotion: '认真', intent: 'strategy', bond_delta: 1, trust_delta: 1, memory: '', tactical_hint: '' });
      if (behaviour === 'invalid') ok('not json at all');
      else if (behaviour === 'leak') ok(JSON.stringify({ utterance: '第七码头的事你别问。', emotion: '戒备', intent: 'other', bond_delta: 0, trust_delta: 0, memory: '', tactical_hint: '' }));
      else if (behaviour === 'server-error') fail(500);
      else if (behaviour === 'reject-schema') (format === 'json_schema' ? fail(400) : ok(good));
      else if (behaviour === 'reject-all') fail(422);
      else ok(good);
    });
  });
  await new Promise((resolve) => mock.listen(0, '127.0.0.1', resolve));
  const saved = { ...AI_CONFIG };
  Object.assign(AI_CONFIG, { mode: 'openai', baseUrl: `http://127.0.0.1:${mock.address().port}/v1`, apiKey: 'test', timeoutMs: 5000 });
  t.after(() => {
    Object.assign(AI_CONFIG, saved);
    mock.close();
  });

  const state = createInitialState('测试队长');
  advanceScene(state, 'begin_camp');
  const ask = async (mode) => {
    behaviour = mode;
    formats.length = 0;
    return generateCharacterReply(state, 'lia', '正面突破的风险是什么？');
  };

  let reply = await ask('invalid');
  assert.deepEqual(formats, ['json_schema'], 'non-JSON content must not retry');
  assert.equal(reply.source, 'fallback');

  reply = await ask('leak');
  assert.deepEqual(formats, ['json_schema']);
  assert.equal(reply.source, 'fallback');
  assert.ok(!reply.utterance.includes('第七码头'));

  reply = await ask('server-error');
  assert.deepEqual(formats, ['json_schema'], '5xx must not retry');
  assert.equal(reply.source, 'fallback');

  reply = await ask('reject-schema');
  assert.deepEqual(formats, ['json_schema', 'json_object']);
  assert.equal(reply.source, 'model');
  assert.equal(reply.utterance, '收到，按计划行动。');

  reply = await ask('reject-all');
  assert.deepEqual(formats, ['json_schema', 'json_object', 'none']);
  assert.equal(reply.source, 'fallback');

  reply = await ask('good');
  assert.deepEqual(formats, ['json_schema']);
  assert.equal(reply.source, 'model');
});

// ─── B4 / B5：专属回复与「说过了」的提示也传给模型 ───

test('B5: demo mode answers the question quick prompts with their dedicated replies', async () => {
  const state = createInitialState('测试队长');
  advanceScene(state, 'begin_camp');
  const reply = await generateCharacterReply(state, 'serena', '你手套下面藏着什么？');
  assert.equal(reply.source, 'demo');
  assert.equal(reply.intent, 'question');
  assert.equal(reply.trustDelta, 1);
  assert.match(reply.utterance, /手套下面确实有东西/);
});

test('B4: the model is told when a line was already said or a promise already made', async (t) => {
  const systemPrompts = [];
  const mock = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      systemPrompts.push(JSON.parse(raw).messages[0].content);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ utterance: '我记得。', emotion: '认真', intent: 'promise', bond_delta: 1, trust_delta: 1, memory: '', tactical_hint: '' }) } }] }));
    });
  });
  await new Promise((resolve) => mock.listen(0, '127.0.0.1', resolve));
  const saved = { ...AI_CONFIG };
  Object.assign(AI_CONFIG, { mode: 'openai', baseUrl: `http://127.0.0.1:${mock.address().port}/v1`, apiKey: 'test', timeoutMs: 5000 });
  t.after(() => {
    Object.assign(AI_CONFIG, saved);
    mock.close();
  });

  const state = createInitialState('测试队长');
  advanceScene(state, 'begin_camp');
  const first = await generateCharacterReply(state, 'lia', '我保证不会丢下任何队友。');
  assert.equal(first.source, 'model');
  assert.doesNotMatch(systemPrompts[0], /之前已经对你说过|已经对你许下过承诺/);
  applyChatOutcome(state, 'lia', '我保证不会丢下任何队友。', first);

  await generateCharacterReply(state, 'lia', '我保证不会丢下任何队友！');
  assert.match(systemPrompts[1], /之前已经对你说过一次/);
  assert.match(systemPrompts[1], /已经对你许下过承诺/);
  // 规则仍由引擎执行：模型照给 +1，重复的承诺也不加分
  const trust = state.characters.lia.trust;
  applyChatOutcome(state, 'lia', '我保证不会丢下任何队友！', { ...first });
  assert.equal(state.characters.lia.trust, trust);
});
