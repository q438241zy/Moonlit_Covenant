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

test('指向性卡牌：对手空场时法术不可用，指向入场曲的随从照常入场', () => {
  const s = createBattle({ playerClass: 'serena', playerDeck: fillerDeck(), opponentClass: 'lia', opponentDeck: fillerDeck(), seed: 9 });
  s.players.player.pp = { current: 10, max: 10 };
  s.players.opponent.field = [];
  s.players.player.field = [];
  const bolt = inst('serena_darkbolt');
  const devourer = inst('serena_devourer'); // 入场曲：对一个敌方随从造成4点伤害
  s.players.player.hand = [bolt, devourer];
  const plays = getLegalPlays(s, 'player');
  assert.ok(!plays.some((p) => p.uid === bolt.uid));
  assert.deepEqual(plays.find((p) => p.uid === devourer.uid)?.needsTarget, false);
  assert.throws(() => playCard(s, 'player', bolt.uid));
  playCard(s, 'player', devourer.uid);
  assert.equal(s.phase, 'main');
  assert.ok(s.players.player.field.some((f) => f.uid === devourer.uid));
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

// ─── C1：每个随从每回合最多攻击一次（进化不刷新攻击次数）───

test('C1 先攻击、再进化、再攻击：第二次攻击会抛错', () => {
  const s = createBattle({ playerClass: 'lia', playerDeck: fillerDeck(), opponentClass: 'serena', opponentDeck: fillerDeck(), seed: 21 });
  const f = inst('n_knight', { canAttack: true }); // 3/3
  s.players.player.field = [f];
  s.players.player.canEvolve = true;
  s.players.player.ep = 2;
  attack(s, 'player', f.uid, 'leader');
  assert.equal(s.players.opponent.leader.hp, RULES.LEADER_HP - 3);
  evolve(s, 'player', f.uid);
  assert.equal(f.attack, 5);
  assert.equal(f.evolved, true);
  assert.equal(f.canAttack, false, '已攻击过的随从进化后本回合不能再攻击');
  assert.deepEqual(getLegalAttackTargets(s, 'player', f.uid), []);
  assert.throws(() => attack(s, 'player', f.uid, 'leader'), /无法攻击/);
  assert.equal(s.players.opponent.leader.hp, RULES.LEADER_HP - 3, '对手生命不变');
});

test('C1 已攻击的随从在下个己方回合恢复攻击；未攻击的随从进化后仍可立即攻击', () => {
  const s = createBattle({ playerClass: 'lia', playerDeck: fillerDeck(), opponentClass: 'serena', opponentDeck: fillerDeck(), seed: 22 });
  const a = inst('n_knight', { canAttack: true });
  const b = inst('n_goblin', { canAttack: false }); // 刚上场（召唤失调）
  s.players.player.field = [a, b];
  s.players.player.canEvolve = true;
  s.players.player.ep = 2;
  attack(s, 'player', a.uid, 'leader');
  assert.equal(a.attackedThisTurn, true);
  evolve(s, 'player', b.uid);
  assert.equal(b.canAttack, true, '本回合没攻击过的随从进化后可以攻击');
  attack(s, 'player', b.uid, 'leader');
  assert.throws(() => attack(s, 'player', b.uid, 'leader'), /无法攻击/);
  endTurn(s); // → 对手
  endTurn(s); // → 玩家
  assert.equal(a.attackedThisTurn, false);
  assert.equal(a.canAttack, true);
  assert.equal(b.canAttack, true);
});

// ─── C2：先校验再修改状态 ───

const snapshot = (s) => JSON.stringify({
  hand: s.players.player.hand.map((c) => c.uid),
  pp: s.players.player.pp,
  field: s.players.player.field.map((f) => f.uid),
  graveyard: s.players.player.graveyard,
  enemy: s.players.opponent.leader,
  enemyField: s.players.opponent.field.map((f) => [f.uid, f.health]),
  phase: s.phase,
  pending: s.pending,
  logLength: s.log.length
});

test('C2 场上 5 个随从时出随从会抛错，手牌与 PP 不变', () => {
  const s = createBattle({ playerClass: 'serena', playerDeck: fillerDeck(), opponentClass: 'lia', opponentDeck: fillerDeck(), seed: 23 });
  s.players.player.pp = { current: 10, max: 10 };
  s.players.player.field = Array.from({ length: RULES.MAX_FIELD }, () => inst('n_wisp'));
  s.players.opponent.field = [inst('n_knight')];
  const goblin = inst('n_goblin');
  const devourer = inst('serena_devourer'); // 指向入场曲：不能因此进入选目标阶段
  const bolt = inst('serena_darkbolt');     // 法术不受场上上限影响
  s.players.player.hand = [goblin, devourer, bolt];
  const before = snapshot(s);
  assert.throws(() => playCard(s, 'player', goblin.uid), /场上随从已满/);
  assert.equal(snapshot(s), before);
  assert.throws(() => playCard(s, 'player', devourer.uid), /场上随从已满/);
  assert.throws(() => playCard(s, 'player', devourer.uid, s.players.opponent.field[0].uid), /场上随从已满/);
  assert.equal(snapshot(s), before);
  assert.equal(s.phase, 'main');
  playCard(s, 'player', bolt.uid, s.players.opponent.field[0].uid);
  assert.equal(s.players.player.pp.current, 8);
});

test('C2 暗蚀术（只能打随从）以主战者为目标会抛错，状态不变', () => {
  const s = createBattle({ playerClass: 'serena', playerDeck: fillerDeck(), opponentClass: 'lia', opponentDeck: fillerDeck(), seed: 24 });
  s.players.player.pp = { current: 5, max: 5 };
  const enemy = inst('n_troll');
  s.players.opponent.field = [enemy];
  const bolt = inst('serena_darkbolt');
  s.players.player.hand = [bolt];
  assert.ok(!getTargetOptions(s, 'player', 'serena_darkbolt').some((o) => o.uid === 'leader'));
  const before = snapshot(s);
  assert.throws(() => playCard(s, 'player', bolt.uid, 'leader'), /只能以随从为目标/);
  assert.equal(snapshot(s), before);
  assert.equal(s.players.opponent.leader.hp, RULES.LEADER_HP);
  // 选目标阶段提交非法目标同样被拒，而且保持在选目标阶段
  playCard(s, 'player', bolt.uid);
  assert.equal(s.phase, 'awaitingTarget');
  assert.throws(() => playCard(s, 'player', bolt.uid, 'leader'), /只能以随从为目标/);
  assert.equal(s.phase, 'awaitingTarget');
  assert.equal(s.players.player.hand.length, 1);
  playCard(s, 'player', bolt.uid, enemy.uid);
  assert.equal(enemy.health, 2);
  assert.equal(s.players.opponent.leader.hp, RULES.LEADER_HP);
});

test('C2 目标必须来自 getTargetOptions：己方随从、不存在的 uid 都会被拒', () => {
  const s = createBattle({ playerClass: 'lia', playerDeck: fillerDeck(), opponentClass: 'serena', opponentDeck: fillerDeck(), seed: 25 });
  s.players.player.pp = { current: 5, max: 5 };
  const mine = inst('n_knight');
  const theirs = inst('n_knight');
  s.players.player.field = [mine];
  s.players.opponent.field = [theirs];
  const bash = inst('lia_shieldbash'); // 对一个敌方随从造成2点伤害
  const rally = inst('lia_rally');     // 使一个友方随从获得+1/+2
  s.players.player.hand = [bash, rally];
  const before = snapshot(s);
  assert.throws(() => playCard(s, 'player', bash.uid, mine.uid), /目标无效/);
  assert.throws(() => playCard(s, 'player', bash.uid, 'u-nope'), /目标无效/);
  assert.throws(() => playCard(s, 'player', rally.uid, theirs.uid), /目标无效/);
  assert.throws(() => playCard(s, 'player', rally.uid, 'leader'), /只能以随从为目标/);
  assert.equal(snapshot(s), before);
  playCard(s, 'player', rally.uid, mine.uid);
  assert.equal(mine.attack, 4);
  assert.equal(mine.health, 5);
});

test('C2 指向效果落空时忽略客户端传来的目标；能打主战者的法术照常可以打脸', () => {
  const s = createBattle({ playerClass: 'serena', playerDeck: fillerDeck(), opponentClass: 'lilith', opponentDeck: fillerDeck(), seed: 26 });
  s.players.player.pp = { current: 10, max: 10 };
  s.players.opponent.field = [];
  const devourer = inst('serena_devourer'); // 入场曲：对一个敌方随从造成4点伤害
  s.players.player.hand = [devourer];
  playCard(s, 'player', devourer.uid, 'leader');
  assert.equal(s.players.opponent.leader.hp, RULES.LEADER_HP, '对手空场时入场曲落空，不能改打主战者');
  assert.ok(s.players.player.field.some((f) => f.uid === devourer.uid));

  const s2 = createBattle({ playerClass: 'lilith', playerDeck: fillerDeck(), opponentClass: 'serena', opponentDeck: fillerDeck(), seed: 27 });
  s2.players.player.pp = { current: 5, max: 5 };
  const arrow = inst('lilith_shadowarrow'); // 对一个敌方随从或主战者造成3点伤害
  s2.players.player.hand = [arrow];
  playCard(s2, 'player', arrow.uid, 'leader');
  assert.equal(s2.players.opponent.leader.hp, RULES.LEADER_HP - 3);
});

test('日志顺序：回合标题先于疲劳伤害；攻击行先于伤害与胜负行', () => {
  const s = createBattle({ playerClass: 'lia', playerDeck: fillerDeck(), opponentClass: 'serena', opponentDeck: fillerDeck(), seed: 28 });
  s.players.opponent.deck = [];
  endTurn(s); // → 对手，牌库空，受疲劳
  const turnLines = s.log.filter((l) => l.turn === s.turn).map((l) => l.msg);
  assert.match(turnLines[0], /第2回合：对手/);
  assert.ok(turnLines.slice(1).some((m) => /疲劳/.test(m)));

  const s2 = createBattle({ playerClass: 'lia', playerDeck: fillerDeck(), opponentClass: 'serena', opponentDeck: fillerDeck(), seed: 29 });
  s2.players.opponent.leader.hp = 2;
  const atk = inst('n_knight', { canAttack: true });
  s2.players.player.field = [atk];
  const from = s2.log.length;
  attack(s2, 'player', atk.uid, 'leader');
  const lines = s2.log.slice(from).map((l) => l.msg);
  assert.match(lines[0], /攻击了对手主战者/);
  assert.match(lines.at(-1), /玩家胜利/);
});
