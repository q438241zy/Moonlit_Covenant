import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState,
  advanceScene,
  chooseStrategy,
  applyChatOutcome,
  assertChatAllowed,
  battleAction,
  chooseEnding,
  resetBattle,
  sanitizeState
} from '../game/engine.mjs';
import { AFTERMATH_CHAT_TURNS, CAMP_CHAT_TURNS, CORRIDOR_CHAT_TURNS, cnNumber } from '../game/content.mjs';

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

// ─── B4：战后对话上限 3 次；同一句话对同一角色只加一次分；承诺每名角色只计一次 ───

const scoring = (intent, bondDelta, trustDelta) => ({ utterance: '嗯。', emotion: '认真', intent, bondDelta, trustDelta, memory: '', tacticalHint: '' });

function wonBattle() {
  const state = createInitialState('测试队长');
  advanceScene(state, 'begin_camp');
  chooseStrategy(state, 'lia');
  advanceScene(state, 'begin_battle');
  state.enemy.hp = 1;
  state.rngSeed = 123;
  battleAction(state, 'attack');
  assert.equal(state.scene, 'aftermath');
  return state;
}

test('B4: aftermath chat is capped at 3 for the whole run, battle resets do not refill it', () => {
  const state = wonBattle();
  assert.equal(AFTERMATH_CHAT_TURNS, 3);
  assert.deepEqual(state.chatLimits, { camp: 10, corridor: 4, aftermath: 3 });
  assert.ok(state.events.some((ev) => ev.type === 'system' && ev.text.includes('最多三次对话')));
  for (let i = 0; i < 3; i += 1) applyChatOutcome(state, 'mia', `战后第${i + 1}句`, scoring('other', 0, 0));
  assert.equal(state.chatTurns, 3);
  assert.equal(state.aftermathChatTurns, 3);
  assert.throws(() => applyChatOutcome(state, 'mia', '再说一句', scoring('other', 0, 0)), /战后交流次数已用完/);

  // 重置战斗、再赢一次：战后交流不会补回
  resetBattle(state);
  state.enemy.hp = 1;
  battleAction(state, 'attack');
  assert.equal(state.scene, 'aftermath');
  assert.equal(state.chatTurns, 3);
  assert.throws(() => applyChatOutcome(state, 'lia', '换个人说', scoring('encourage', 1, 0)), /战后交流次数已用完/);
  // 上限到了也照样能做最终决定
  chooseEnding(state, 'seal');
  assert.equal(state.scene, 'ending');
});

test('B4: assertChatAllowed is the same gate applyChatOutcome uses and does not record anything', () => {
  const state = wonBattle();
  const events = state.events.length;
  assert.equal(assertChatAllowed(state, 'mia', '  你好  '), '你好');
  assert.equal(state.events.length, events, 'the pre-check must not push events');
  assert.equal(state.aftermathChatTurns, 0);
  assert.throws(() => assertChatAllowed(state, 'nobody', '你好'), /未知角色/);
  assert.throws(() => assertChatAllowed(state, 'mia', '   '), /请输入/);
  for (let i = 0; i < 3; i += 1) applyChatOutcome(state, 'mia', `战后第${i + 1}句`, scoring('other', 0, 0));
  assert.throws(() => assertChatAllowed(state, 'lia', '还有一句'), /战后交流次数已用完/);
});

test('B4: the corridor keeps its own limit of 4', () => {
  const state = createInitialState('测试队长');
  advanceScene(state, 'begin_camp');
  chooseStrategy(state, 'serena');
  advanceScene(state, 'begin_corridor');
  for (let i = 0; i < CORRIDOR_CHAT_TURNS; i += 1) applyChatOutcome(state, 'serena', `回廊第${i + 1}句`, scoring('other', 0, 0));
  assert.throws(() => applyChatOutcome(state, 'serena', '多一句', scoring('other', 0, 0)), /回廊交流次数已用完/);
});

test('B4: the same sentence to the same heroine scores only once (punctuation and spacing ignored)', () => {
  const state = createInitialState('测试队长');
  advanceScene(state, 'begin_camp');
  const before = { ...state.characters.lia };
  applyChatOutcome(state, 'lia', '刚才谢谢你挡在前面。', scoring('encourage', 1, 1));
  assert.equal(state.characters.lia.bond, before.bond + 1);
  assert.equal(state.characters.lia.trust, before.trust + 1);

  applyChatOutcome(state, 'lia', ' 刚才谢谢你挡在前面！ ', scoring('encourage', 1, 1));
  assert.equal(state.characters.lia.bond, before.bond + 1, '重复的话不再加羁绊');
  assert.equal(state.characters.lia.trust, before.trust + 1, '重复的话不再加信任');
  const repeatEvent = state.events.at(-1);
  assert.equal(repeatEvent.meta.unscored, 'repeat');
  assert.equal(repeatEvent.meta.bondDelta, 0);
  assert.equal(repeatEvent.meta.trustDelta, 0);
  assert.equal(state.chatTurns, 2, '重复的话仍然消耗交流次数');

  // 对另一名女主说同一句话照常计分
  const miaBond = state.characters.mia.bond;
  applyChatOutcome(state, 'mia', '刚才谢谢你挡在前面。', scoring('encourage', 1, 0));
  assert.equal(state.characters.mia.bond, miaBond + 1);
  assert.equal(state.events.at(-1).meta.unscored, undefined);

  // 扣分不受影响：重复的辱骂照扣
  const trust = state.characters.lia.trust;
  applyChatOutcome(state, 'lia', '你好笨', scoring('insult', -2, -2));
  applyChatOutcome(state, 'lia', '你好笨。', scoring('insult', -2, -2));
  assert.equal(state.characters.lia.trust, Math.max(0, trust - 4));
  assert.equal(state.events.at(-1).meta.unscored, undefined);
});

test('B4: a promise counts once per heroine', () => {
  const state = createInitialState('测试队长');
  advanceScene(state, 'begin_camp');
  const lia = { ...state.characters.lia };
  applyChatOutcome(state, 'lia', '我保证不会丢下任何队友。', scoring('promise', 1, 1));
  applyChatOutcome(state, 'lia', '我答应你，一定会活着回来。', scoring('promise', 2, 2));
  assert.equal(state.characters.lia.bond, lia.bond + 1);
  assert.equal(state.characters.lia.trust, lia.trust + 1);
  assert.equal(state.events.at(-1).meta.unscored, 'promise');
  assert.equal(state.flags.madePromise, true);
  // 不是承诺的好话照常计分
  applyChatOutcome(state, 'lia', '你不用一个人扛所有事。', scoring('encourage', 1, 0));
  assert.equal(state.characters.lia.bond, lia.bond + 2);
  // 对另一名女主的第一次承诺照常计分
  const serena = { ...state.characters.serena };
  applyChatOutcome(state, 'serena', '我保证会说真话。', scoring('promise', 1, 1));
  assert.equal(state.characters.serena.trust, serena.trust + 1);
  assert.deepEqual(state.chatScoring.promised, { lia: true, serena: true });

  // 模型判为 0 分的「承诺」不占用这一次机会
  const mia = { ...state.characters.mia };
  applyChatOutcome(state, 'mia', '嗯嗯我保证。', scoring('promise', 0, 0));
  applyChatOutcome(state, 'mia', '我答应你，战后一起修零号。', scoring('promise', 1, 1));
  assert.equal(state.characters.mia.trust, mia.trust + 1);
});

test('B4: saves from before the rule (no chat-scoring fields) keep working', () => {
  const state = wonBattle();
  delete state.chatLimits;
  delete state.aftermathChatTurns;
  delete state.chatScoring;
  state.chatTurns = 2; // 旧规则下战后已经聊了 2 句
  const safe = sanitizeState(state);
  assert.deepEqual(safe.chatLimits, { camp: 10, corridor: 4, aftermath: 3 });
  applyChatOutcome(state, 'serena', '谢谢你。', scoring('encourage', 1, 0));
  assert.equal(state.aftermathChatTurns, 3);
  assert.throws(() => applyChatOutcome(state, 'serena', '还有一句', scoring('other', 0, 0)), /战后交流次数已用完/);
});

test('B4: the fourth ending is still reachable by honest play, not by repeating one line', () => {
  // 只靠同一句话刷：羁绊停在 +1
  const farm = wonBattle();
  for (let i = 0; i < 3; i += 1) applyChatOutcome(farm, 'mia', '我相信你的计算。', scoring('encourage', 2, 2));
  assert.equal(farm.characters.mia.bond, 4 + 2);
  assert.equal(farm.characters.mia.trust, 3 + 2);

  // 正常玩：营地里对米娅说不同的话、许一次承诺、打出羁绊技
  const state = createInitialState('测试队长');
  advanceScene(state, 'begin_camp');
  const lines = [
    ['我相信你的计算。', 'encourage', 1, 0],
    ['给我一个最离谱但可行的战术。', 'strategy', 1, 1],
    ['零号对你来说意味着什么？', 'question', 1, 1],
    ['我答应你，战后一起修零号。', 'promise', 1, 1],
    ['你不用一直说话，安静也没关系。', 'encourage', 1, 0]
  ];
  for (const [line, intent, b, t] of lines) applyChatOutcome(state, 'mia', line, scoring(intent, b, t));
  assert.ok(state.characters.mia.bond >= 7 && state.characters.mia.trust >= 6, JSON.stringify(state.characters.mia));
  chooseStrategy(state, 'mia');
  advanceScene(state, 'begin_battle');
  state.focus = 100;
  state.enemy.hp = 1;
  battleAction(state, 'skill');
  assert.equal(state.scene, 'aftermath');
  chooseEnding(state, 'seal');
  assert.equal(state.ending.rank, 'S');
  assert.equal(state.ending.partnerId, 'mia');
});
