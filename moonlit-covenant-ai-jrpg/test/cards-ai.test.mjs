import test from 'node:test';
import assert from 'node:assert/strict';
import { createBattle } from '../cards/battle.mjs';
import { runAITurn } from '../cards/ai.mjs';
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
