// ═══════════════════════════════════════════════════════════════
// AI 对手决策 —— 启发式（贪心 + 局面评估）
// runAITurn(state) 直接在真实状态上行动，并把动作序列写入
// state.aiActions，供前端逐步回放动画。
// 决策风格：按费铺场、优先解掉高威胁随从、有利交换、伺机抢脸斩杀、合理使用进化。
// ═══════════════════════════════════════════════════════════════

import { getCard } from './database.mjs';
import {
  playCard, attack, evolve, endTurn,
  getLegalPlays, getLegalAttackTargets, getEvolvableFollowers, getTargetOptions
} from './battle.mjs';

const enemyOf = (key) => (key === 'player' ? 'opponent' : 'player');
const findFollower = (state, key, uid) => state.players[key].field.find((f) => f.uid === uid) || null;

// 主入口：执行 AI 的整个回合并结束回合
export function runAITurn(state, key = state.activePlayer) {
  state.aiActions = [];
  if (state.phase === 'gameover') return state;

  aiPlayPhase(state, key);
  if (state.phase !== 'gameover') aiCombatPhase(state, key);
  if (state.phase !== 'gameover') {
    endTurn(state);
    state.aiActions.push({ type: 'endTurn' });
  }
  return state;
}

// ─── 出牌阶段 ───
function aiPlayPhase(state, key) {
  let guard = 0;
  while (guard++ < 40 && state.phase !== 'gameover') {
    const play = chooseBestPlay(state, key);
    if (!play) break;
    try {
      playCard(state, key, play.handUid, play.target ?? null);
      state.aiActions.push({ type: 'play', handUid: play.handUid, cardId: play.cardId, target: play.target ?? null });
    } catch {
      break; // 安全阀：任何非法即停止
    }
  }
}

function chooseBestPlay(state, key) {
  const plays = getLegalPlays(state, key);
  let best = null;
  let bestScore = 0.6; // 阈值，避免无意义出牌
  for (const play of plays) {
    const card = getCard(play.cardId);
    let target = null;
    let score;
    if (play.needsTarget) {
      const opts = getTargetOptions(state, key, play.cardId);
      if (!opts.length) continue;
      const chosen = pickBestTarget(state, key, card, opts);
      target = chosen.uid;
      score = scoreTargetedPlay(state, key, card, chosen);
    } else {
      score = scorePlay(state, key, card);
    }
    if (score > bestScore) { bestScore = score; best = { ...play, target }; }
  }
  return best;
}

// 无需目标的卡牌评分
function scorePlay(state, key, card) {
  const enemyKey = enemyOf(key);
  const enemyField = state.players[enemyKey].field;
  if (card.type === 'follower') {
    let s = 3 + card.cost * 0.6; // 按费铺场
    if (card.keywords.includes('storm')) s += 3;
    if (card.keywords.includes('rush')) s += 1.5;
    if (card.keywords.includes('guard')) s += 1;
    return s;
  }
  // 法术
  let s = 1;
  for (const eff of card.effects || []) {
    if (eff.type === 'damage' && eff.targeting === 'allEnemyFollowers') {
      const kills = enemyField.filter((f) => f.health <= eff.amount).length;
      s += 1.5 + kills * 2 + enemyField.length * 0.5;
    }
    if (eff.type === 'draw') s += eff.amount * 1.2;
    if (eff.type === 'heal') {
      const hurt = state.players[key].leader.maxHp - state.players[key].leader.hp;
      s += Math.min(eff.amount, hurt) * 0.4;
    }
    if (eff.type === 'gainArmor') s += eff.amount * 0.3;
  }
  return s;
}

// 需目标的卡牌评分
function scoreTargetedPlay(state, key, card, chosen) {
  const enemyKey = enemyOf(key);
  const dmgEff = (card.effects || []).find((e) => e.type === 'damage');
  const destroyEff = (card.effects || []).find((e) => e.type === 'destroy');
  const buffEff = (card.effects || []).find((e) => e.type === 'buff');

  if (chosen.uid === 'leader') {
    const enemy = state.players[enemyKey].leader;
    const total = enemy.hp + enemy.armor;
    if (dmgEff && dmgEff.amount >= total) return 10000; // 法术斩杀
    return 2 + (dmgEff?.amount || 0) * 0.8;
  }
  const target = findFollower(state, enemyKey, chosen.uid) || findFollower(state, key, chosen.uid);
  if (!target) return 0;

  if (destroyEff) {
    return target.attack >= 4 ? 6 + target.cost * 0.4 : 2.5;
  }
  if (dmgEff) {
    const kills = target.health <= dmgEff.amount;
    if (kills) return 5 + target.attack * 0.5 + target.cost * 0.3;
    return target.attack >= 4 ? 3 : 1.2;
  }
  if (buffEff) {
    return 2 + target.attack * 0.3;
  }
  return 1;
}

// 为目标卡牌挑选最佳目标
function pickBestTarget(state, key, card, opts) {
  const enemyKey = enemyOf(key);
  const dmgEff = (card.effects || []).find((e) => e.type === 'damage');
  const destroyEff = (card.effects || []).find((e) => e.type === 'destroy');
  const buffEff = (card.effects || []).find((e) => e.type === 'buff');

  if (buffEff) {
    // 增益己方：选攻击力最高的己方随从
    return opts.reduce((a, b) => {
      const fa = findFollower(state, key, a.uid); const fb = findFollower(state, key, b.uid);
      return (fb?.attack || 0) > (fa?.attack || 0) ? b : a;
    });
  }
  // 伤害/消灭：先看能否斩杀主战者
  if (dmgEff && opts.some((o) => o.uid === 'leader')) {
    const enemy = state.players[enemyKey].leader;
    if (dmgEff.amount >= enemy.hp + enemy.armor) return { uid: 'leader' };
  }
  // 否则选威胁最大的敌方随从（优先能击杀的高攻随从）
  const followers = opts.filter((o) => o.uid !== 'leader');
  if (!followers.length) return opts[0];
  return followers.reduce((best, o) => {
    const f = findFollower(state, enemyKey, o.uid);
    const bf = findFollower(state, enemyKey, best.uid);
    const val = (x) => (x ? x.attack * 2 + x.cost : -1);
    return val(f) > val(bf) ? o : best;
  });
}

// ─── 战斗阶段（含进化）───
function aiCombatPhase(state, key) {
  let guard = 0;
  while (guard++ < 60 && state.phase !== 'gameover') {
    const action = chooseBestCombatAction(state, key);
    if (!action) break;
    try {
      if (action.type === 'evolve') {
        evolve(state, key, action.uid);
      } else {
        attack(state, key, action.attackerUid, action.targetUid);
      }
      state.aiActions.push(action);
    } catch {
      break;
    }
  }
}

function chooseBestCombatAction(state, key) {
  const enemyKey = enemyOf(key);
  let best = null;
  let bestScore = 30; // 阈值：低于此宁可不动（保留资源）

  // 1) 评估每个可攻击随从的最佳攻击
  for (const f of state.players[key].field) {
    if (!f.canAttack) continue;
    const targets = getLegalAttackTargets(state, key, f.uid);
    for (const t of targets) {
      const score = scoreAttack(state, key, f, t.uid);
      if (score > bestScore) {
        bestScore = score;
        best = { type: 'attack', attackerUid: f.uid, targetUid: t.uid };
      }
    }
  }

  // 2) 评估进化：进化某随从后能达成的最佳攻击
  const evolvable = getEvolvableFollowers(state, key);
  for (const uid of evolvable) {
    const f = findFollower(state, key, uid);
    const evolved = { ...f, attack: f.attack + 2, health: f.health + 2, canAttack: true, canAttackLeader: true };
    // 进化后能打的目标（简化：所有敌方随从 + 主战者）
    const enemyField = state.players[enemyKey].field;
    const guards = enemyField.filter((x) => x.keywords.includes('guard'));
    const candidateTargets = guards.length ? guards.map((g) => g.uid) : [...enemyField.map((x) => x.uid), 'leader'];
    for (const tuid of candidateTargets) {
      const score = scoreAttack(state, key, evolved, tuid) + 2; // 进化略有加成
      if (score > bestScore && score > 120) { // 进化要带来明显收益才用
        bestScore = score;
        best = { type: 'evolve', uid };
      }
    }
  }

  return best;
}

function scoreAttack(state, key, attacker, targetUid) {
  const enemyKey = enemyOf(key);
  const enemy = state.players[enemyKey].leader;
  if (targetUid === 'leader') {
    const total = enemy.hp + enemy.armor;
    if (attacker.attack >= total) return 100000; // 斩杀
    return 50 + attacker.attack; // 抢脸倾向
  }
  const t = findFollower(state, enemyKey, targetUid);
  if (!t) return 0;
  const weKill = t.health <= attacker.attack;
  const weDie = attacker.health <= t.attack;
  let score;
  if (weKill && !weDie) score = 200 + t.attack * 5 + t.cost * 3;      // 白吃
  else if (weKill && weDie) score = 120 + (t.cost - attacker.cost) * 5; // 一换一，换到大赚
  else if (!weKill && !weDie) score = 25 + attacker.attack;            // 蹭血
  else score = 5;                                                       // 送死亏
  if (t.keywords.includes('guard')) score += 8;                         // 必须处理守护
  return score;
}
