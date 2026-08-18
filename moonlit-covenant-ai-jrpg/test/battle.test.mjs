import test from 'node:test';
import assert from 'node:assert/strict';
import { getCard } from '../cards/database.mjs';
import {
  createBattle, playCard, attack, evolve, endTurn,
  getLegalAttackTargets, getLegalPlays, getEvolvableFollowers, getTargetOptions,
  RULES
} from '../cards/battle.mjs';

// 构造手牌/场上实例（绕过抽牌随机性，做确定性测试）
let n = 0;
function inst(cardId, opts = {}) {
  const c = getCard(cardId);
  return {
    uid: `t${++n}`,
    cardId,
    name: c.name,
    type: c.type,
    cost: c.cost,
    keywords: [...(c.keywords || [])],
    evolved: false,
    canAttack: opts.canAttack ?? false,
    canAttackLeader: opts.canAttackLeader ?? true,
    attack: c.attack,
    health: c.health,
    maxHealth: c.health,
    baseAttack: c.attack,
    baseHealth: c.health,
    ...opts
  };
}

const fillerDeck = () => Array(30).fill('n_goblin');

test('对局初始化：20生命、起手3张、先手第1回合PP=1', () => {
  const s = createBattle({ playerClass: 'lia', playerDeck: fillerDeck(), opponentClass: 'serena', opponentDeck: fillerDeck(), seed: 1 });
  assert.equal(s.players.player.leader.hp, RULES.LEADER_HP);
  assert.equal(s.players.opponent.leader.hp, RULES.LEADER_HP);
  assert.equal(s.players.player.hand.length, 3);
  assert.equal(s.players.opponent.hand.length, 3);
  assert.equal(s.players.player.pp.max, 1);
  assert.equal(s.players.player.pp.current, 1);
  assert.equal(s.activePlayer, 'player');
});

test('出随从：扣PP并上场，召唤失调当回合不可攻击', () => {
  const s = createBattle({ playerClass: 'lia', playerDeck: fillerDeck(), opponentClass: 'serena', opponentDeck: fillerDeck(), seed: 2 });
  s.players.player.pp = { current: 5, max: 5 };
  s.players.player.hand = [inst('lia_recruit')]; // 1费 1/2 守护
  playCard(s, 'player', 't1');
  assert.equal(s.players.player.pp.current, 4);
  assert.equal(s.players.player.field.length, 1);
  assert.equal(s.players.player.field[0].canAttack, false);
  assert.deepEqual(getLegalAttackTargets(s, 'player', s.players.player.field[0].uid), []);
});

test('疾驰随从入场当回合可打脸', () => {
  const s = createBattle({ playerClass: 'lilith', playerDeck: fillerDeck(), opponentClass: 'serena', opponentDeck: fillerDeck(), seed: 3 });
  s.players.player.pp = { current: 5, max: 5 };
  s.players.player.hand = [inst('lilith_hero')]; // 5费 疾驰
  playCard(s, 'player', 't2');
  const f = s.players.player.field[0];
  assert.equal(f.canAttack, true);
  const targets = getLegalAttackTargets(s, 'player', f.uid);
  assert.ok(targets.some((t) => t.uid === 'leader'));
});

test('进化：+2/+2 且可立即攻击，消耗1EP', () => {
  const s = createBattle({ playerClass: 'lia', playerDeck: fillerDeck(), opponentClass: 'serena', opponentDeck: fillerDeck(), seed: 4 });
  const f = inst('n_knight', { canAttack: false }); // 3/3
  s.players.player.field = [f];
  s.players.player.canEvolve = true;
  s.players.player.ep = 2;
  assert.deepEqual(getEvolvableFollowers(s, 'player'), [f.uid]);
  evolve(s, 'player', f.uid);
  assert.equal(f.attack, 5);
  assert.equal(f.health, 5);
  assert.equal(f.evolved, true);
  assert.equal(f.canAttack, true);
  assert.equal(s.players.player.ep, 1);
});

test('攻击随从：双方互伤', () => {
  const s = createBattle({ playerClass: 'lia', playerDeck: fillerDeck(), opponentClass: 'serena', opponentDeck: fillerDeck(), seed: 5 });
  const atk = inst('n_troll', { canAttack: true }); // 5/5
  const def = inst('n_knight'); // 3/3
  s.players.player.field = [atk];
  s.players.opponent.field = [def];
  attack(s, 'player', atk.uid, def.uid);
  assert.ok(def.health <= 0);    // 3-5 致死
  assert.equal(atk.health, 2);   // 5-3
  assert.equal(s.players.opponent.field.length, 0); // 死亡清理
});

test('守护：敌方有守护随从时不能打脸', () => {
  const s = createBattle({ playerClass: 'lia', playerDeck: fillerDeck(), opponentClass: 'serena', opponentDeck: fillerDeck(), seed: 6 });
  const atk = inst('n_troll', { canAttack: true });
  const guard = inst('n_golem'); // 守护
  s.players.player.field = [atk];
  s.players.opponent.field = [guard];
  assert.throws(() => attack(s, 'player', atk.uid, 'leader'), /守护/);
  const targets = getLegalAttackTargets(s, 'player', atk.uid);
  assert.ok(targets.every((t) => t.uid === guard.uid));
});

test('法术：暗蚀术对随从造成3点伤害', () => {
  const s = createBattle({ playerClass: 'serena', playerDeck: fillerDeck(), opponentClass: 'lia', opponentDeck: fillerDeck(), seed: 7 });
  s.players.player.pp = { current: 5, max: 5 };
  const enemy = inst('n_troll'); // 5/5
  s.players.opponent.field = [enemy];
  s.players.player.hand = [inst('serena_darkbolt')]; // 2费 打3
  const opts = getTargetOptions(s, 'player', 'serena_darkbolt');
  assert.ok(opts.some((o) => o.uid === enemy.uid));
  playCard(s, 'player', s.players.player.hand[0].uid, enemy.uid);
  assert.equal(enemy.health, 2);
});

test('直伤打脸致死：玩家胜利', () => {
  const s = createBattle({ playerClass: 'lilith', playerDeck: fillerDeck(), opponentClass: 'serena', opponentDeck: fillerDeck(), seed: 8 });
  s.players.opponent.leader.hp = 3;
  const atk = inst('n_troll', { canAttack: true }); // 5攻
  s.players.player.field = [atk];
  attack(s, 'player', atk.uid, 'leader');
  assert.equal(s.phase, 'gameover');
  assert.equal(s.winner, 'player');
});

test('结束回合：切换行动方并补满PP、抽牌', () => {
  const s = createBattle({ playerClass: 'lia', playerDeck: fillerDeck(), opponentClass: 'serena', opponentDeck: fillerDeck(), seed: 9 });
  const opHandBefore = s.players.opponent.hand.length;
  endTurn(s);
  assert.equal(s.activePlayer, 'opponent');
  assert.equal(s.players.opponent.pp.max, 1);
  assert.equal(s.players.opponent.pp.current, 1);
  assert.equal(s.players.opponent.hand.length, opHandBefore + 1); // 后手第1回合抽1
});

test('疲劳：牌库抽空后抽牌受伤害', () => {
  const s = createBattle({ playerClass: 'lia', playerDeck: fillerDeck(), opponentClass: 'serena', opponentDeck: fillerDeck(), seed: 10 });
  s.players.player.deck = [];
  const hpBefore = s.players.player.leader.hp;
  endTurn(s); // → opponent
  endTurn(s); // → player 第2回合，抽牌但牌库空
  assert.ok(s.players.player.leader.hp < hpBefore);
  assert.equal(s.players.player.fatigue, 1);
});

test('getLegalPlays 受PP与场上上限约束', () => {
  const s = createBattle({ playerClass: 'lia', playerDeck: fillerDeck(), opponentClass: 'serena', opponentDeck: fillerDeck(), seed: 11 });
  s.players.player.pp = { current: 1, max: 1 };
  s.players.player.hand = [inst('lia_recruit'), inst('n_dragon')]; // 1费 与 7费
  const plays = getLegalPlays(s, 'player');
  assert.equal(plays.length, 1);
  assert.equal(plays[0].cardId, 'lia_recruit');
});
