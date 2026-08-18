// ═══════════════════════════════════════════════════════════════
// 核心战斗引擎 —— Shadowverse-like 规则
// 纯逻辑模块：不依赖 DOM/网络，可单测、可被 AI 复用。
//
// 规则要点：
//   · 双方主战者 20 生命，护甲先于生命承伤
//   · PP：每回合上限+1（最高10），回合开始补满
//   · 进化点(EP)：先手2点/后手3点；先手第5回合、后手第4回合起可进化
//   · 进化：消耗1EP，随从 +2/+2，并可在当回合立即攻击（含打脸）
//   · 召唤失调：随从入场当回合不可攻击（突进可打随从、疾驰可打脸）
//   · 守护：敌方有守护随从时，必须先攻击守护随从
//   · 剧毒：造成伤害即消灭目标随从；吸血：造成伤害等额回血
//   · 牌库抽空后再抽会受到疲劳伤害（1,2,3...）
//   · 任一方主战者生命≤0 即分胜负
// ═══════════════════════════════════════════════════════════════

import { getCard } from './database.mjs';

const LEADER_HP = 20;
const MAX_PP = 10;
const MAX_FIELD = 5;      // 场上随从上限
const MAX_HAND = 9;       // 手牌上限
const INITIAL_HAND = 3;   // 起手手牌
const EVOLVE_BONUS = 2;   // 进化 +2/+2

let uidCounter = 1;
const nextUid = () => `u${uidCounter++}`;

function makePlayer(key, classId, deckIds, ep, rng) {
  return {
    key,
    classId,
    leader: { hp: LEADER_HP, maxHp: LEADER_HP, armor: 0 },
    pp: { current: 0, max: 0 },
    ep,
    canEvolve: false,
    turnCount: 0,
    fatigue: 0,
    deck: shuffle([...deckIds], rng),
    hand: [],
    field: [],
    graveyard: []
  };
}

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 由卡牌创建场上/手牌实例
function instantiate(cardId) {
  const card = getCard(cardId);
  if (!card) throw new Error(`未知卡牌: ${cardId}`);
  const inst = {
    uid: nextUid(),
    cardId,
    name: card.name,
    type: card.type,
    cost: card.cost,
    keywords: [...(card.keywords || [])],
    evolved: false,
    canAttack: false,
    canAttackLeader: true
  };
  if (card.type === 'follower') {
    inst.attack = card.attack;
    inst.health = card.health;
    inst.maxHealth = card.health;
    inst.baseAttack = card.attack;
    inst.baseHealth = card.health;
  }
  return inst;
}

// ─── 创建对局 ───
export function createBattle({ playerClass, playerDeck, opponentClass, opponentDeck, seed } = {}) {
  const rng = seed != null ? mulberry32(seed) : Math.random;
  const state = {
    id: nextUid(),
    turn: 0,                 // 总回合计数（每次有人开始回合 +1）
    activePlayer: 'player',
    firstPlayer: 'player',
    phase: 'main',           // main / awaitingTarget / gameover
    winner: null,
    pending: null,           // 等待选目标时暂存的出牌信息
    players: {
      player: makePlayer('player', playerClass, playerDeck, 2, rng),
      opponent: makePlayer('opponent', opponentClass, opponentDeck, 3, rng)
    },
    log: [],
    _rng: rng
  };
  // 起手抽牌
  drawCards(state, 'player', INITIAL_HAND, true);
  drawCards(state, 'opponent', INITIAL_HAND, true);
  // 先手第一回合开始（不抽牌）
  startTurn(state, 'player');
  return state;
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function log(state, msg) {
  state.log.push({ turn: state.turn, msg });
  if (state.log.length > 200) state.log.shift();
}

const enemyOf = (key) => (key === 'player' ? 'opponent' : 'player');

// ─── 抽牌 ───
function drawCards(state, key, count, silent = false) {
  const p = state.players[key];
  for (let i = 0; i < count; i++) {
    if (state.phase === 'gameover') return;
    if (p.deck.length === 0) {
      p.fatigue += 1;
      damageLeader(state, key, p.fatigue);
      if (!silent) log(state, `${sideName(key)}牌库已空，受到${p.fatigue}点疲劳伤害。`);
      continue;
    }
    const cardId = p.deck.shift();
    if (p.hand.length >= MAX_HAND) {
      p.graveyard.push(cardId);
      if (!silent) log(state, `${sideName(key)}手牌已满，${getCard(cardId).name}被烧毁。`);
      continue;
    }
    p.hand.push(instantiate(cardId));
  }
}

function sideName(key) {
  return key === 'player' ? '玩家' : '对手';
}

// ─── 回合开始 ───
function startTurn(state, key) {
  const p = state.players[key];
  state.turn += 1;
  state.activePlayer = key;
  state.phase = 'main';
  p.turnCount += 1;
  p.pp.max = Math.min(MAX_PP, p.turnCount);
  p.pp.current = p.pp.max;
  p.canEvolve = (key === state.firstPlayer) ? p.turnCount >= 5 : p.turnCount >= 4;
  // 重置场上随从攻击状态
  for (const f of p.field) {
    f.canAttack = true;
    f.canAttackLeader = true;
  }
  // 先手第一回合不抽牌
  const isFirstTurnOfGame = (key === state.firstPlayer && p.turnCount === 1);
  if (!isFirstTurnOfGame) drawCards(state, key, 1);
  log(state, `—— 第${state.turn}回合：${sideName(key)}（PP ${p.pp.current}/${p.pp.max}）——`);
}

// ─── 结束回合 ───
export function endTurn(state) {
  if (state.phase === 'gameover') return state;
  if (state.phase === 'awaitingTarget') state.pending = null;
  state.phase = 'main';
  const next = enemyOf(state.activePlayer);
  startTurn(state, next);
  return state;
}

// ─── 出牌 ───
// target: 目标 uid（随从）或 'leader'（打脸），仅当卡牌需要目标时提供
export function playCard(state, key, handUid, target = null) {
  if (state.phase === 'gameover') throw new Error('对局已结束。');
  if (key !== state.activePlayer) throw new Error('还没到你的回合。');
  const p = state.players[key];
  const idx = p.hand.findIndex((c) => c.uid === handUid);
  if (idx < 0) throw new Error('手牌中找不到该卡。');
  const inst = p.hand[idx];
  const card = getCard(inst.cardId);
  if (card.cost > p.pp.current) throw new Error('PP不足。');

  const needsTarget = (card.effects || []).some((e) => ['enemyFollower', 'enemyAny', 'friendlyFollower'].includes(e.targeting));
  if (needsTarget && target == null) {
    // 进入等待选目标状态
    state.phase = 'awaitingTarget';
    state.pending = { handUid, cardId: inst.cardId };
    return state;
  }

  // 扣费并移出手牌
  p.pp.current -= card.cost;
  p.hand.splice(idx, 1);
  state.phase = 'main';
  state.pending = null;

  if (card.type === 'follower') {
    if (p.field.length >= MAX_FIELD) throw new Error('场上随从已满（最多5个）。');
    // 召唤失调处理
    if (inst.keywords.includes('storm')) { inst.canAttack = true; inst.canAttackLeader = true; }
    else if (inst.keywords.includes('rush')) { inst.canAttack = true; inst.canAttackLeader = false; }
    else { inst.canAttack = false; inst.canAttackLeader = true; }
    p.field.push(inst);
    log(state, `${sideName(key)}召唤了 ${card.name}（${inst.attack}/${inst.health}）。`);
    if (card.trigger === 'fanfare' && card.effects?.length) {
      resolveEffects(state, key, card.effects, inst, target);
    }
  } else if (card.type === 'spell') {
    log(state, `${sideName(key)}施放了 ${card.name}。`);
    p.graveyard.push(inst.cardId);
    resolveEffects(state, key, card.effects, inst, target);
  }

  cleanupDead(state);
  checkWin(state);
  return state;
}

// 取消选目标（前端用）
export function cancelTarget(state) {
  if (state.phase === 'awaitingTarget') {
    state.phase = 'main';
    state.pending = null;
  }
  return state;
}

// ─── 效果结算 ───
function resolveEffects(state, ownerKey, effects, source, target) {
  const enemyKey = enemyOf(ownerKey);
  for (const eff of effects) {
    if (state.phase === 'gameover') return;
    switch (eff.type) {
      case 'draw':
        drawCards(state, ownerKey, eff.amount || 1);
        break;
      case 'heal': {
        const leader = state.players[ownerKey].leader;
        const healed = Math.min(eff.amount || 0, leader.maxHp - leader.hp);
        leader.hp += healed;
        if (healed > 0) log(state, `${sideName(ownerKey)}回复了${healed}点生命。`);
        break;
      }
      case 'gainArmor':
        state.players[ownerKey].leader.armor += eff.amount || 0;
        log(state, `${sideName(ownerKey)}获得${eff.amount}点护甲。`);
        break;
      case 'damage':
        applyDamageEffect(state, ownerKey, enemyKey, eff, target);
        break;
      case 'destroy':
        applyDestroyEffect(state, enemyKey, eff, target);
        break;
      case 'buff':
        applyBuffEffect(state, ownerKey, eff, source, target);
        break;
      default:
        break;
    }
  }
}

function applyDamageEffect(state, ownerKey, enemyKey, eff, target) {
  const amount = eff.amount || 0;
  switch (eff.targeting) {
    case 'enemyLeader':
      damageLeader(state, enemyKey, amount);
      break;
    case 'allEnemyFollowers':
      for (const f of [...state.players[enemyKey].field]) damageFollower(state, f, amount);
      break;
    case 'randomEnemyFollower': {
      const field = state.players[enemyKey].field;
      if (field.length) damageFollower(state, field[Math.floor(state._rng() * field.length)], amount);
      break;
    }
    case 'enemyFollower':
    case 'enemyAny': {
      if (target === 'leader') { damageLeader(state, enemyKey, amount); break; }
      const f = findFollower(state, enemyKey, target);
      if (f) damageFollower(state, f, amount);
      break;
    }
    default:
      break;
  }
}

function applyDestroyEffect(state, enemyKey, eff, target) {
  if (eff.targeting === 'enemyFollower') {
    const f = findFollower(state, enemyKey, target);
    if (f) { f.health = 0; log(state, `${f.name} 被消灭了。`); }
  }
}

function applyBuffEffect(state, ownerKey, eff, source, target) {
  const da = eff.attack || 0;
  const dh = eff.health || 0;
  const field = state.players[ownerKey].field;
  if (eff.targeting === 'friendlyFollower') {
    const f = findFollower(state, ownerKey, target);
    if (f) buffFollower(f, da, dh);
  } else if (eff.targeting === 'otherFriendlyFollowers') {
    for (const f of field) if (f.uid !== source?.uid) buffFollower(f, da, dh);
  } else if (eff.targeting === 'allFriendlyFollowers') {
    for (const f of field) buffFollower(f, da, dh);
  }
}

function buffFollower(f, da, dh) {
  f.attack += da;
  f.maxHealth += dh;
  f.health += dh;
}

// ─── 伤害处理 ───
function damageLeader(state, key, amount) {
  if (amount <= 0) return;
  const leader = state.players[key].leader;
  let dmg = amount;
  if (leader.armor > 0) {
    const absorbed = Math.min(leader.armor, dmg);
    leader.armor -= absorbed;
    dmg -= absorbed;
  }
  leader.hp -= dmg;
  log(state, `${sideName(key)}主战者受到${amount}点伤害（剩余${Math.max(0, leader.hp)}生命）。`);
  checkWin(state);
}

function damageFollower(state, follower, amount, { bane = false } = {}) {
  if (amount <= 0 && !bane) return;
  follower.health -= amount;
  if (bane && amount > 0) follower.health = 0; // 剧毒直接消灭
}

function findFollower(state, key, uid) {
  return state.players[key].field.find((f) => f.uid === uid) || null;
}

// 清理死亡随从
function cleanupDead(state) {
  for (const key of ['player', 'opponent']) {
    const p = state.players[key];
    const dead = p.field.filter((f) => f.health <= 0);
    if (dead.length) {
      p.field = p.field.filter((f) => f.health > 0);
      for (const f of dead) {
        p.graveyard.push(f.cardId);
        log(state, `${f.name} 被击破。`);
        const card = getCard(f.cardId);
        if (card?.trigger === 'lastWords' && card.effects?.length) {
          resolveEffects(state, key, card.effects, f, null);
        }
      }
    }
  }
}

// ─── 进化 ───
export function evolve(state, key, followerUid) {
  if (state.phase === 'gameover') throw new Error('对局已结束。');
  if (key !== state.activePlayer) throw new Error('还没到你的回合。');
  const p = state.players[key];
  if (!p.canEvolve) throw new Error('本回合还不能进化。');
  if (p.ep <= 0) throw new Error('进化点不足。');
  const f = findFollower(state, key, followerUid);
  if (!f) throw new Error('找不到该随从。');
  if (f.evolved) throw new Error('该随从已经进化过。');
  p.ep -= 1;
  f.evolved = true;
  f.attack += EVOLVE_BONUS;
  f.maxHealth += EVOLVE_BONUS;
  f.health += EVOLVE_BONUS;
  f.canAttack = true;        // 进化后可立即攻击
  f.canAttackLeader = true;  // 含打脸
  log(state, `${sideName(key)}的 ${f.name} 进化为 ${f.attack}/${f.health}！`);
  return state;
}

// ─── 攻击 ───
// targetUid: 敌方随从 uid 或 'leader'
export function attack(state, key, attackerUid, targetUid) {
  if (state.phase === 'gameover') throw new Error('对局已结束。');
  if (key !== state.activePlayer) throw new Error('还没到你的回合。');
  const enemyKey = enemyOf(key);
  const attacker = findFollower(state, key, attackerUid);
  if (!attacker) throw new Error('找不到攻击随从。');
  if (!attacker.canAttack) throw new Error('该随从本回合无法攻击。');

  const enemyField = state.players[enemyKey].field;
  const guards = enemyField.filter((f) => f.keywords.includes('guard'));
  const hasGuard = guards.length > 0;

  if (targetUid === 'leader') {
    if (hasGuard) throw new Error('必须先攻击守护随从。');
    if (!attacker.canAttackLeader) throw new Error('该随从本回合只能攻击随从。');
    const dealt = attacker.attack;
    damageLeader(state, enemyKey, dealt);
    if (attacker.keywords.includes('drain')) healLeaderBy(state, key, dealt);
    attacker.canAttack = false;
    log(state, `${attacker.name} 攻击了${sideName(enemyKey)}主战者（${dealt}点伤害）。`);
  } else {
    const target = findFollower(state, enemyKey, targetUid);
    if (!target) throw new Error('找不到目标随从。');
    if (hasGuard && !target.keywords.includes('guard')) throw new Error('必须先攻击守护随从。');
    // 互伤
    damageFollower(state, target, attacker.attack, { bane: attacker.keywords.includes('bane') });
    damageFollower(state, attacker, target.attack, { bane: target.keywords.includes('bane') });
    if (attacker.keywords.includes('drain') && attacker.attack > 0) healLeaderBy(state, key, attacker.attack);
    attacker.canAttack = false;
    log(state, `${attacker.name} 攻击了 ${target.name}。`);
  }

  cleanupDead(state);
  checkWin(state);
  return state;
}

function healLeaderBy(state, key, amount) {
  const leader = state.players[key].leader;
  const healed = Math.min(amount, leader.maxHp - leader.hp);
  leader.hp += healed;
  if (healed > 0) log(state, `${sideName(key)}吸血回复${healed}点生命。`);
}

// ─── 胜负判定 ───
function checkWin(state) {
  if (state.phase === 'gameover') return;
  const pHp = state.players.player.leader.hp;
  const oHp = state.players.opponent.leader.hp;
  if (pHp <= 0 && oHp <= 0) { state.phase = 'gameover'; state.winner = 'draw'; log(state, '双方同归于尽，平局！'); }
  else if (oHp <= 0) { state.phase = 'gameover'; state.winner = 'player'; log(state, '对手主战者倒下，玩家胜利！'); }
  else if (pHp <= 0) { state.phase = 'gameover'; state.winner = 'opponent'; log(state, '玩家主战者倒下，对手胜利。'); }
}

// ─── 合法动作查询（供前端高亮 / AI 决策）───
export function getLegalPlays(state, key) {
  const p = state.players[key];
  const result = [];
  for (const inst of p.hand) {
    const card = getCard(inst.cardId);
    if (card.cost > p.pp.current) continue;
    if (card.type === 'follower' && p.field.length >= MAX_FIELD) continue;
    const needsTarget = (card.effects || []).some((e) => ['enemyFollower', 'enemyAny', 'friendlyFollower'].includes(e.targeting));
    result.push({ uid: inst.uid, cardId: inst.cardId, needsTarget });
  }
  return result;
}

// 某随从可攻击的目标列表
export function getLegalAttackTargets(state, key, attackerUid) {
  const enemyKey = enemyOf(key);
  const attacker = findFollower(state, key, attackerUid);
  if (!attacker || !attacker.canAttack) return [];
  const enemyField = state.players[enemyKey].field;
  const guards = enemyField.filter((f) => f.keywords.includes('guard'));
  const targets = [];
  if (guards.length > 0) {
    for (const g of guards) targets.push({ type: 'follower', uid: g.uid, name: g.name });
  } else {
    for (const f of enemyField) targets.push({ type: 'follower', uid: f.uid, name: f.name });
    if (attacker.canAttackLeader) targets.push({ type: 'leader', uid: 'leader', name: '主战者' });
  }
  return targets;
}

// 可进化的随从
export function getEvolvableFollowers(state, key) {
  const p = state.players[key];
  if (!p.canEvolve || p.ep <= 0) return [];
  return p.field.filter((f) => !f.evolved).map((f) => f.uid);
}

// 某张待出卡牌的合法目标（选目标阶段用）
export function getTargetOptions(state, key, cardId) {
  const card = getCard(cardId);
  const enemyKey = enemyOf(key);
  const eff = (card.effects || []).find((e) => ['enemyFollower', 'enemyAny', 'friendlyFollower'].includes(e.targeting));
  if (!eff) return [];
  const opts = [];
  if (eff.targeting === 'enemyFollower' || eff.targeting === 'enemyAny') {
    for (const f of state.players[enemyKey].field) opts.push({ type: 'follower', uid: f.uid, name: f.name });
    if (eff.targeting === 'enemyAny') opts.push({ type: 'leader', uid: 'leader', name: '主战者' });
  } else if (eff.targeting === 'friendlyFollower') {
    for (const f of state.players[key].field) opts.push({ type: 'follower', uid: f.uid, name: f.name });
  }
  return opts;
}

// 深拷贝（AI 模拟用）
export function cloneState(state) {
  const rng = state._rng;
  const copy = JSON.parse(JSON.stringify(state, (k, v) => (k === '_rng' ? undefined : v)));
  copy._rng = rng;
  return copy;
}

export const RULES = { LEADER_HP, MAX_PP, MAX_FIELD, MAX_HAND, EVOLVE_BONUS };
