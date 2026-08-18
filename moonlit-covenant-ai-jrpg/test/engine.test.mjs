import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState,
  advanceScene,
  chooseStrategy,
  applyChatOutcome,
  battleAction,
  chooseEnding,
  sanitizeState
} from '../game/engine.mjs';

test('new game starts in intro with three party members', () => {
  const state = createInitialState('<队长>');
  assert.equal(state.scene, 'intro');
  assert.equal(Object.keys(state.characters).length, 3);
  assert.equal(state.playerName, '队长');
  assert.ok(state.events.length >= 4);
});

test('chat outcome is bounded and stores a memory', () => {
  const state = createInitialState('测试队长');
  advanceScene(state, 'begin_camp');
  applyChatOutcome(state, 'lia', '我保证不会丢下你。', {
    utterance: '那就用行动证明。',
    emotion: '认真',
    intent: 'promise',
    bondDelta: 999,
    trustDelta: 999,
    memory: '玩家承诺不会丢下莉亚。',
    tacticalHint: ''
  });
  assert.equal(state.characters.lia.bond, 5);
  assert.equal(state.characters.lia.trust, 4);
  assert.equal(state.flags.madePromise, true);
  assert.deepEqual(state.characters.lia.memories, ['玩家承诺不会丢下莉亚。']);
});

test('battle damage and victory are deterministic game rules', () => {
  const state = createInitialState('测试队长');
  advanceScene(state, 'begin_camp');
  chooseStrategy(state, 'lia');
  advanceScene(state, 'begin_battle');
  state.enemy.hp = 1;
  state.rngSeed = 123;
  battleAction(state, 'attack');
  assert.equal(state.scene, 'aftermath');
  assert.equal(state.enemy.hp, 0);
  assert.equal(state.flags.battleWon, true);
});

test('fourth ending requires bond, trust, promise and actual cooperation', () => {
  const state = createInitialState('测试队长');
  state.scene = 'aftermath';
  state.characters.mia.bond = 9;
  state.characters.mia.trust = 8;
  state.flags.madePromise = true;
  state.flags.insultedSomeone = false;
  state.flags.usedBondSkill = true;
  chooseEnding(state, 'seal');
  assert.equal(state.scene, 'ending');
  assert.equal(state.ending.rank, 'S');
  assert.equal(state.ending.partnerId, 'mia');
  assert.equal(state.flags.fourthPath, true);
});

test('public state never exposes the RNG seed', () => {
  const state = createInitialState('测试队长');
  const safe = sanitizeState(state);
  assert.equal('rngSeed' in safe, false);
  assert.equal('rngSeed' in state, true);
});
