import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState,
  advanceScene,
  chooseStrategy,
  applyChatOutcome,
  battleAction,
  chooseEnding,
  resetBattle,
  sanitizeState
} from '../game/engine.mjs';
import { CAMP_CHAT_TURNS, cnNumber } from '../game/content.mjs';

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

test('time rewind keeps the boss phase in sync with its restored HP', () => {
  const state = createInitialState('测试队长');
  advanceScene(state, 'begin_camp');
  chooseStrategy(state, 'lia');
  advanceScene(state, 'begin_battle');
  state.battlePhase = 3;
  state.enemy.hp = 40;
  state.partyHp = 1;
  state.rngSeed = 7;
  battleAction(state, 'guard');
  assert.equal(state.flags.battleLostOnce, true);
  assert.equal(state.enemy.hp, 80);
  assert.equal(state.battlePhase, 2);

  resetBattle(state);
  assert.equal(state.enemy.hp, state.enemy.maxHp);
  assert.equal(state.battlePhase, 1);
});

test('D3: camp dialogue states the same chat limit the engine enforces', () => {
  const state = createInitialState('测试队长');
  assert.equal(state.maxChatTurns, CAMP_CHAT_TURNS);
  assert.equal(state.maxChatTurns, 10);
  advanceScene(state, 'begin_camp');
  const line = state.events.find((ev) => ev.speakerId === 'serena' && ev.text.includes('次对话的机会'));
  assert.ok(line, 'camp line about chat turns is missing');
  assert.ok(line.text.includes(`你有${cnNumber(state.maxChatTurns)}次对话的机会`), line.text);
  assert.ok(line.text.includes('十次'));
  assert.ok(!line.text.includes('六次'));

  const outcome = { utterance: '嗯。', emotion: '平静', intent: 'other', bondDelta: 0, trustDelta: 0, memory: '', tacticalHint: '' };
  for (let i = 0; i < state.maxChatTurns; i += 1) applyChatOutcome(state, 'serena', `第${i + 1}句`, outcome);
  assert.equal(state.chatTurns, 10);
  assert.throws(() => applyChatOutcome(state, 'serena', '再说一句', outcome), /战前交流次数已用完/);
});

test('D3: Chinese numerals used in rule text', () => {
  assert.deepEqual([0, 4, 10, 12, 20, 35].map(cnNumber), ['零', '四', '十', '十二', '二十', '三十五']);
});
