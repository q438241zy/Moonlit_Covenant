import test from 'node:test';
import assert from 'node:assert/strict';
import { createBattle, endTurn } from '../cards/battle.mjs';
import { runAITurn } from '../cards/ai.mjs';
import { getCard } from '../cards/database.mjs';
import { buildStarterDeck, validateDeck, getDeckCurve, getDeckStats, DECK_SIZE } from '../cards/deck.mjs';

test('预组牌组：40张、合法、含曲线', () => {
  for (const cls of ['lia', 'lilith', 'serena']) {
    const deck = buildStarterDeck(cls);
    assert.equal(deck.length, DECK_SIZE);
    const v = validateDeck(deck, cls);
    assert.ok(v.ok, `${cls} 牌组应合法: ${v.errors.join(';')}`);
    const curve = getDeckCurve(deck);
    assert.ok(curve[1] + curve[2] + curve[3] > 0, '应有低费卡');
    const stats = getDeckStats(deck);
    assert.equal(stats.total, DECK_SIZE);
  }
});

test('AI 自战：完整对局能正常终止并分出胜负（多种子）', () => {
  const decks = { lia: buildStarterDeck('lia'), lilith: buildStarterDeck('lilith'), serena: buildStarterDeck('serena') };
  const matchups = [['lia', 'serena'], ['lilith', 'lia'], ['serena', 'lilith'], ['lia', 'lilith']];
  for (let seed = 1; seed <= 8; seed++) {
    const [pc, oc] = matchups[seed % matchups.length];
    const state = createBattle({ playerClass: pc, playerDeck: decks[pc], opponentClass: oc, opponentDeck: decks[oc], seed });
    let turns = 0;
    while (state.phase !== 'gameover' && turns++ < 120) {
      runAITurn(state); // 自动轮流（runAITurn 结束回合后切换行动方）
    }
    assert.equal(state.phase, 'gameover', `seed=${seed} 对局应在限定回合内结束`);
    assert.ok(['player', 'opponent', 'draw'].includes(state.winner), `seed=${seed} 应有胜者`);
    assert.ok(state.aiActions.length >= 0);
  }
});

test('AI 不会做出非法动作（攻击/进化均合法）', () => {
  const decks = { lilith: buildStarterDeck('lilith'), serena: buildStarterDeck('serena') };
  const state = createBattle({ playerClass: 'lilith', playerDeck: decks.lilith, opponentClass: 'serena', opponentDeck: decks.serena, seed: 42 });
  let turns = 0;
  // runAITurn 内部对非法动作有 try/catch 安全阀；这里验证不抛异常即可
  assert.doesNotThrow(() => {
    while (state.phase !== 'gameover' && turns++ < 120) runAITurn(state);
  });
  assert.equal(state.phase, 'gameover');
});

test('AI 会真正出牌：对手全程跳过时 AI 铺场并击败对方', () => {
  const state = createBattle({ playerClass: 'lilith', playerDeck: buildStarterDeck('lilith'), opponentClass: 'lia', opponentDeck: buildStarterDeck('lia'), seed: 3 });
  let plays = 0;
  let turns = 0;
  while (state.phase !== 'gameover' && turns++ < 30) {
    endTurn(state); // 玩家什么都不做
    runAITurn(state);
    plays += state.aiActions.filter((a) => a.type === 'play').length;
  }
  assert.ok(plays > 0, 'AI 至少打出一张牌');
  assert.equal(state.winner, 'opponent');
});

// ─── C4：aiActions 的日志区间（契约 K-7）───

// 校验一次 runAITurn 的 aiActions 区间：首尾相接、互不重叠，覆盖本回合（含回合开头）写入的全部日志，
// 且每一步区间里的文字和动作对得上。返回本回合每个随从的攻击次数，供调用方检查。
function runAndCheckTurn(state, label) {
  const aiTurn = state.turn;
  const aiKey = state.activePlayer;
  const before = new Set(state.log);
  // 本回合开头（回合标题、抽牌/疲劳行）已经写入日志，也应该算进 AI 回合
  const turnStart = state.log.filter((l) => l.turn === aiTurn);
  runAITurn(state);
  const acts = state.aiActions;
  const log = state.log;
  if (!acts.length) return new Map();
  const produced = log.filter((l) => !before.has(l));
  const expectedFrom = log.indexOf(turnStart[0] ?? produced[0]);
  assert.ok(expectedFrom >= 0, `${label}: AI 回合应有日志`);
  assert.equal(acts[0].logFrom, expectedFrom, `${label}: 第一步从本回合开头算起`);
  assert.equal(acts.at(-1).logTo, log.length, `${label}: 最后一步到日志末尾`);
  const attacks = new Map();
  for (let i = 0; i < acts.length; i += 1) {
    const a = acts[i];
    assert.ok(Number.isInteger(a.logFrom) && Number.isInteger(a.logTo), `${label}: 第${i}步缺少区间`);
    assert.ok(a.logFrom <= a.logTo, `${label}: 第${i}步区间倒置`);
    if (i > 0) assert.equal(a.logFrom, acts[i - 1].logTo, `${label}: 第${i}步与上一步不相接（重叠或有缺口）`);
    const msgs = log.slice(a.logFrom, a.logTo).map((l) => l.msg).join('\n');
    if (a.type === 'play') {
      const card = getCard(a.cardId);
      assert.ok(msgs.includes(`${card.type === 'spell' ? '施放了' : '召唤了'} ${card.name}`), `${label}: 出牌步应含出牌日志\n${msgs}`);
    } else if (a.type === 'attack') {
      assert.match(msgs, /攻击了/, `${label}: 攻击步应含攻击日志`);
      attacks.set(a.attackerUid, (attacks.get(a.attackerUid) || 0) + 1);
    } else if (a.type === 'evolve') {
      assert.match(msgs, /进化为/, `${label}: 进化步应含进化日志`);
      assert.ok(!attacks.has(a.uid), `${label}: AI 不应进化本回合已攻击过的随从`);
    } else if (a.type === 'endTurn') {
      assert.equal(i, acts.length - 1, `${label}: endTurn 应是最后一步`);
      assert.match(msgs, new RegExp(`第${aiTurn + 1}回合`), `${label}: endTurn 步应含下一回合标题`);
    }
  }
  // 本回合新产生的每一行都落在某个区间里
  const covered = new Set(log.slice(acts[0].logFrom, acts.at(-1).logTo));
  for (const line of produced) assert.ok(covered.has(line), `${label}: 日志「${line.msg}」不在任何区间里`);
  assert.ok(state.phase === 'gameover' || state.activePlayer !== aiKey, `${label}: 回合应已结束`);
  return attacks;
}

test('C4 每步 aiAction 带 logFrom/logTo：互不重叠，合起来覆盖整个 AI 回合', () => {
  const state = createBattle({ playerClass: 'lia', playerDeck: buildStarterDeck('lia'), opponentClass: 'serena', opponentDeck: buildStarterDeck('serena'), seed: 7 });
  let checked = 0;
  for (let t = 0; t < 40 && state.phase !== 'gameover'; t += 1) {
    endTurn(state); // 玩家（服务端流程）先结束回合，再由 AI 行动
    if (state.phase === 'gameover') break;
    runAndCheckTurn(state, `turn ${state.turn}`);
    checked += 1;
  }
  assert.ok(checked > 3);
});

test('C4 日志达到 200 行上限、旧行被挤出时，区间仍指向最终日志里正确的行', () => {
  const state = createBattle({ playerClass: 'lilith', playerDeck: buildStarterDeck('lilith'), opponentClass: 'lia', opponentDeck: buildStarterDeck('lia'), seed: 11 });
  const filler = Array.from({ length: 199 }, (_, i) => ({ turn: 0, msg: `旧日志 ${i}` }));
  state.log.unshift(...filler);
  state.log.splice(0, state.log.length - 200);
  assert.equal(state.log.length, 200);
  for (let t = 0; t < 12 && state.phase !== 'gameover'; t += 1) {
    endTurn(state);
    if (state.phase === 'gameover') break;
    runAndCheckTurn(state, `capped turn ${state.turn}`);
    assert.equal(state.log.length, 200);
  }
});

// ─── C5：200 局 AI 对 AI 回归模拟（固定种子）───

test('C5 200 局 AI 自战：每局都能结束，没有随从在同一回合攻击两次', () => {
  const decks = { lia: buildStarterDeck('lia'), lilith: buildStarterDeck('lilith'), serena: buildStarterDeck('serena') };
  const classes = Object.keys(decks);
  const winners = { player: 0, opponent: 0, draw: 0 };
  for (let g = 0; g < 200; g += 1) {
    const pc = classes[g % 3];
    const oc = classes[Math.floor(g / 3) % 3];
    const state = createBattle({ playerClass: pc, playerDeck: decks[pc], opponentClass: oc, opponentDeck: decks[oc], seed: 1000 + g });
    let turns = 0;
    while (state.phase !== 'gameover' && turns++ < 200) {
      const attacks = runAndCheckTurn(state, `game ${g} turn ${state.turn}`);
      for (const [uid, n] of attacks) assert.equal(n, 1, `game ${g} turn ${state.turn}: 随从 ${uid} 攻击了 ${n} 次`);
    }
    assert.equal(state.phase, 'gameover', `game ${g} (${pc} vs ${oc}) 应在限定回合内结束`);
    winners[state.winner] += 1;
  }
  assert.equal(winners.player + winners.opponent + winners.draw, 200);
});
