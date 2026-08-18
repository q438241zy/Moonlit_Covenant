import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, advanceScene } from '../game/engine.mjs';
import { generateCharacterReply } from '../game/ai.mjs';

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
