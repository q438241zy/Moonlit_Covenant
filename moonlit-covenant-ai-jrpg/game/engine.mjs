import crypto from 'node:crypto';
import {
  CHARACTERS,
  STRATEGIES,
  INTRO_EVENTS,
  CAMP_EVENTS,
  CORRIDOR_EVENTS,
  BATTLE_INTRO_EVENTS,
  BATTLE_PHASE_EVENTS,
  AFTERMATH_EVENTS,
  DECISIONS,
  ENEMY,
  CG_GALLERY,
  CAMP_CHAT_TURNS,
  CORRIDOR_CHAT_TURNS,
  AFTERMATH_CHAT_TURNS,
  chatKey,
  publicCharacter
} from './content.mjs';

const MAX_EVENT_LOG = 120;
const MAX_MEMORIES_PER_CHARACTER = 8;
// 每名角色记住的「说过的话」条数上限；各场景都有交流上限，正常一局远到不了，只防异常存档膨胀。
const MAX_SAID_PER_CHARACTER = 64;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function cleanPlayerName(name) {
  const cleaned = String(name || '队长').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 16);
  return cleaned || '队长';
}

function event(type, text, extra = {}) {
  return {
    id: crypto.randomUUID(),
    at: Date.now(),
    type,
    text,
    ...extra
  };
}

function pushEvent(state, nextEvent) {
  state.events.push(nextEvent);
  if (state.events.length > MAX_EVENT_LOG) {
    state.events.splice(0, state.events.length - MAX_EVENT_LOG);
  }
}

function unlockCg(state, sceneName) {
  const cg = CG_GALLERY.find((c) => c.scene === sceneName);
  if (cg && !state.unlockedCgs.includes(cg.id)) {
    state.unlockedCgs.push(cg.id);
    pushEvent(state, event('system', `CG解锁：「${cg.title}」`));
  }
}

function seededRoll(state, min, max, salt = 0) {
  let x = (state.rngSeed ^ (state.turn * 0x9e3779b9) ^ salt) >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  state.rngSeed = x >>> 0;
  const normalized = (state.rngSeed % 10000) / 10000;
  return Math.floor(min + normalized * (max - min + 1));
}

function chatLimitsDefault() {
  return { camp: CAMP_CHAT_TURNS, corridor: CORRIDOR_CHAT_TURNS, aftermath: AFTERMATH_CHAT_TURNS };
}

/**
 * B4 的计分记录。旧存档（重启前存下的会话）没有这些字段，这里补齐：
 * - chatLimits：各场景的交流上限，前端按 state.chatLimits[state.scene] 显示剩余次数；
 * - aftermathChatTurns：整局累计的战后交流次数，重置战斗再赢也不清零；
 * - chatScoring.said[角色] 存说过的话（chatKey），chatScoring.promised[角色] 记是否已许过承诺。
 */
function ensureChatRules(state) {
  state.chatLimits = { ...chatLimitsDefault(), ...(state.chatLimits || {}) };
  if (!Number.isInteger(state.aftermathChatTurns)) {
    state.aftermathChatTurns = state.scene === 'aftermath' ? Math.max(0, Number(state.chatTurns) || 0) : 0;
  }
  if (!state.chatScoring || typeof state.chatScoring !== 'object') state.chatScoring = {};
  if (!state.chatScoring.said || typeof state.chatScoring.said !== 'object') state.chatScoring.said = {};
  if (!state.chatScoring.promised || typeof state.chatScoring.promised !== 'object') state.chatScoring.promised = {};
  return state;
}

function hydrateEvent(raw) {
  return event(raw.type, raw.text, {
    speakerId: raw.speakerId,
    meta: raw.meta
  });
}

export function createInitialState(playerName = '队长') {
  const name = cleanPlayerName(playerName);
  const characterState = Object.fromEntries(
    Object.values(CHARACTERS).map((character) => [
      character.id,
      {
        ...publicCharacter(character),
        bond: character.initialBond,
        trust: character.initialTrust,
        mood: character.defaultMood,
        memories: [],
        hp: 100,
        mp: 50
      }
    ])
  );

  const state = {
    id: crypto.randomUUID(),
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    playerName: name,
    chapter: 1,
    scene: 'intro',
    dialogueMode: 'ai',
    objective: '听完三名队友的说明。',
    selectedCharacterId: 'lia',
    chosenStrategyId: null,
    chatTurns: 0,
    maxChatTurns: CAMP_CHAT_TURNS,
    chatLimits: chatLimitsDefault(),
    aftermathChatTurns: 0,
    chatScoring: { said: {}, promised: {} },
    partyHp: 100,
    partyMaxHp: 100,
    focus: 55,
    focusMax: 100,
    potions: 2,
    turn: 0,
    enemy: {
      id: ENEMY.id,
      name: ENEMY.name,
      description: ENEMY.description,
      portrait: ENEMY.portrait,
      hp: ENEMY.maxHp,
      maxHp: ENEMY.maxHp,
      sealed: 0,
      broken: 0
    },
    characters: characterState,
    flags: {
      madePromise: false,
      insultedSomeone: false,
      battleWon: false,
      battleLostOnce: false,
      usedBondSkill: false,
      fourthPath: false
    },
    unlockedCgs: [],
    decisionId: null,
    ending: null,
    rngSeed: crypto.randomBytes(4).readUInt32LE(0),
    events: INTRO_EVENTS.map(hydrateEvent)
  };
  unlockCg(state, 'intro');
  return state;
}

export function sanitizeState(state) {
  const safe = ensureChatRules(structuredClone(state));
  delete safe.rngSeed;
  return safe;
}

export function advanceScene(state, action) {
  if (action === 'begin_camp' && state.scene === 'intro') {
    state.scene = 'camp';
    state.objective = '与队友交流，并选择一套主导战术。';
    CAMP_EVENTS.forEach((raw) => pushEvent(state, hydrateEvent(raw)));
    unlockCg(state, 'camp');
  } else if (action === 'begin_corridor' && state.scene === 'camp') {
    if (!state.chosenStrategyId) {
      throw new Error('请先选择一套主导战术。');
    }
    state.scene = 'corridor';
    state.objective = '穿过回廊，在战前与队友做最后的交流。';
    state.chatTurns = 0;
    CORRIDOR_EVENTS.forEach((raw) => pushEvent(state, hydrateEvent(raw)));
    unlockCg(state, 'corridor');
  } else if (action === 'begin_battle' && (state.scene === 'corridor' || state.scene === 'camp')) {
    if (!state.chosenStrategyId) {
      throw new Error('请先选择一套主导战术。');
    }
    state.scene = 'battle';
    state.objective = `击败${state.enemy.name}。`;
    state.battlePhase = 1;
    BATTLE_INTRO_EVENTS.forEach((raw) => pushEvent(state, hydrateEvent(raw)));
    const strategy = STRATEGIES[state.chosenStrategyId];
    pushEvent(state, event('system', `${strategy.name}已部署：${strategy.bonus}`));
    unlockCg(state, 'battle');
  } else {
    throw new Error('当前剧情状态不允许执行该操作。');
  }
  state.updatedAt = Date.now();
  return state;
}

export function chooseStrategy(state, strategyId) {
  if (state.scene !== 'camp') {
    throw new Error('只能在战前营地选择战术。');
  }
  if (!STRATEGIES[strategyId]) {
    throw new Error('未知战术。');
  }
  state.chosenStrategyId = strategyId;
  state.selectedCharacterId = STRATEGIES[strategyId].owner;
  const strategy = STRATEGIES[strategyId];
  pushEvent(state, event('system', `${state.playerName}选择了「${strategy.name}」。${strategy.description}`));
  state.updatedAt = Date.now();
  return state;
}

/**
 * 自由交流的前置检查（场景、各场景次数上限、角色、空消息），返回清理后的消息。
 * applyChatOutcome 自己会调用它；/api/chat 在请求模型之前也先调一次，超过上限的请求不会白白花掉一次 AI 调用。
 */
export function assertChatAllowed(state, characterId, message) {
  if (!['camp', 'corridor', 'aftermath'].includes(state.scene)) {
    throw new Error('现在不是自由交流时间。');
  }
  ensureChatRules(state);
  if (state.scene === 'camp' && state.chatTurns >= state.maxChatTurns) {
    throw new Error('战前交流次数已用完，请选择战术进入战斗。');
  }
  if (state.scene === 'corridor' && state.chatTurns >= state.chatLimits.corridor) {
    throw new Error('回廊交流次数已用完，请进入战斗。');
  }
  if (state.scene === 'aftermath' && state.aftermathChatTurns >= state.chatLimits.aftermath) {
    throw new Error('战后交流次数已用完，请做出最终决定。');
  }
  if (!state.characters?.[characterId] || !CHARACTERS[characterId]) {
    throw new Error('未知角色。');
  }
  const cleanMessage = String(message || '').trim().slice(0, 500);
  if (!cleanMessage) {
    throw new Error('请输入想说的话。');
  }
  return cleanMessage;
}

export function applyChatOutcome(state, characterId, message, outcome) {
  const cleanMessage = assertChatAllowed(state, characterId, message);
  const character = state.characters[characterId];

  state.selectedCharacterId = characterId;
  pushEvent(state, event('player', cleanMessage, { speakerId: 'player' }));

  // B4：同一句话对同一名角色只加一次分；承诺对每名角色只计一次。扣分照常（重复辱骂不会因此免罚）。
  const key = chatKey(cleanMessage);
  const said = state.chatScoring.said[characterId] || (state.chatScoring.said[characterId] = []);
  const repeated = Boolean(key) && said.includes(key);
  const promiseAgain = outcome.intent === 'promise' && Boolean(state.chatScoring.promised[characterId]);
  let bondDelta = clamp(outcome.bondDelta, -2, 2);
  let trustDelta = clamp(outcome.trustDelta, -2, 2);
  // unscored 只在真的扣掉了正分时标注，前端据此提示「说过的话不再加分」
  let unscored = null;
  if ((repeated || promiseAgain) && (bondDelta > 0 || trustDelta > 0)) {
    unscored = repeated ? 'repeat' : 'promise';
    bondDelta = Math.min(0, bondDelta);
    trustDelta = Math.min(0, trustDelta);
  }
  if (key && !repeated) {
    said.push(key);
    if (said.length > MAX_SAID_PER_CHARACTER) said.shift();
  }
  // 只有真正计了分的承诺才占用「每名角色一次」：模型判为敷衍（0 分）的承诺不算数
  if (outcome.intent === 'promise' && (bondDelta > 0 || trustDelta > 0)) state.chatScoring.promised[characterId] = true;
  character.bond = clamp(character.bond + bondDelta, 0, 10);
  character.trust = clamp(character.trust + trustDelta, 0, 10);
  character.mood = String(outcome.emotion || character.mood).slice(0, 8);

  const utterance = String(outcome.utterance || '……').trim().slice(0, 180);
  pushEvent(state, event('character', utterance, {
    speakerId: characterId,
    meta: {
      intent: outcome.intent,
      emotion: character.mood,
      bondDelta,
      trustDelta,
      ...(unscored ? { unscored } : {})
    }
  }));

  const memory = String(outcome.memory || '').replace(/[<>]/g, '').trim().slice(0, 80);
  if (memory && !character.memories.includes(memory)) {
    character.memories.push(memory);
    if (character.memories.length > MAX_MEMORIES_PER_CHARACTER) {
      character.memories.shift();
    }
  }

  const hint = String(outcome.tacticalHint || '').trim().slice(0, 100);
  if (hint) {
    pushEvent(state, event('hint', `${character.shortName}的战术提示：${hint}`, { speakerId: characterId }));
  }

  if (outcome.intent === 'promise') {
    state.flags.madePromise = true;
  }
  if (outcome.intent === 'insult') {
    state.flags.insultedSomeone = true;
  }

  state.chatTurns += 1;
  if (state.scene === 'aftermath') state.aftermathChatTurns += 1;
  state.updatedAt = Date.now();
  return state;
}

function selectedBond(state) {
  if (!state.chosenStrategyId) return 0;
  return state.characters[state.chosenStrategyId]?.bond || 0;
}

function companionAssist(state) {
  const ids = Object.keys(state.characters);
  const index = (state.turn + state.rngSeed) % ids.length;
  const id = ids[index];
  const character = state.characters[id];
  const roll = seededRoll(state, 1, 100, 77 + state.turn);
  const threshold = 18 + character.bond * 4;
  if (roll > threshold) return null;

  if (id === 'lia') {
    const damage = 8 + Math.floor(character.bond / 2);
    state.enemy.hp = clamp(state.enemy.hp - damage, 0, state.enemy.maxHp);
    return `${character.shortName}追击造成 ${damage} 点伤害。`;
  }
  if (id === 'mia') {
    const restore = 6 + Math.floor(character.bond / 2);
    state.focus = clamp(state.focus + restore, 0, state.focusMax);
    return `${character.shortName}回收逸散魔力，焦点 +${restore}。`;
  }
  const shield = 4 + Math.floor(character.trust / 2);
  state.enemy.sealed = clamp(state.enemy.sealed + shield, 0, 20);
  return `${character.shortName}叠加月纹，敌方压制值 +${shield}。`;
}

function enemyTurn(state, guarded) {
  if (state.enemy.hp <= 0) return;
  let damage = seededRoll(state, 10, 18, 131 + state.turn);
  if (state.enemy.hp < state.enemy.maxHp * 0.45) damage += 3;
  if (state.chosenStrategyId === 'serena') damage -= 4;
  damage -= Math.floor(state.enemy.sealed / 5);
  if (guarded) damage = Math.ceil(damage * 0.45);
  damage = Math.max(2, damage);
  state.partyHp = clamp(state.partyHp - damage, 0, state.partyMaxHp);
  pushEvent(state, event('battle', `${state.enemy.name}撕扯记忆，队伍受到 ${damage} 点伤害。`));
}

function finishBattleIfNeeded(state) {
  if (state.enemy.hp <= 0) {
    state.enemy.hp = 0;
    state.scene = 'aftermath';
    state.objective = '决定如何处置“黎明种”。';
    state.flags.battleWon = true;
    // 战后交流整局只有 AFTERMATH_CHAT_TURNS 次：重置战斗后再赢，沿用已用掉的次数
    ensureChatRules(state);
    state.chatTurns = state.aftermathChatTurns;
    AFTERMATH_EVENTS.forEach((raw) => pushEvent(state, hydrateEvent(raw)));
    unlockCg(state, 'aftermath');
    return true;
  }

  if (!state.battlePhase) state.battlePhase = 1;
  if (state.battlePhase === 1 && state.enemy.hp <= 100) {
    state.battlePhase = 2;
    BATTLE_PHASE_EVENTS.phase2.forEach((raw) => pushEvent(state, hydrateEvent(raw)));
    unlockCg(state, 'battle_p2');
  } else if (state.battlePhase === 2 && state.enemy.hp <= 50) {
    state.battlePhase = 3;
    BATTLE_PHASE_EVENTS.phase3.forEach((raw) => pushEvent(state, hydrateEvent(raw)));
    unlockCg(state, 'battle_p3');
  }

  if (state.partyHp <= 0) {
    state.flags.battleLostOnce = true;
    state.partyHp = 70;
    state.focus = 65;
    state.enemy.hp = Math.max(80, state.enemy.hp);
    state.battlePhase = battlePhaseForHp(state.enemy.hp);
    state.turn = 0;
    pushEvent(state, event('system', '黎明种触发局部时间回卷。战斗重置，但队友仍隐约记得你的失败。'));
    Object.values(state.characters).forEach((character) => {
      character.trust = clamp(character.trust - 1, 0, 10);
    });
  }
  return false;
}

export function battleAction(state, actionId, { skillBonus = 0 } = {}) {
  if (state.scene !== 'battle') {
    throw new Error('当前不在战斗中。');
  }
  const allowed = ['attack', 'skill', 'guard', 'item'];
  if (!allowed.includes(actionId)) {
    throw new Error('未知战斗指令。');
  }

  state.turn += 1;
  let guarded = false;

  if (actionId === 'attack') {
    let damage = seededRoll(state, 14, 21, 11 + state.turn);
    if (state.chosenStrategyId === 'lia') damage += 4;
    if (state.enemy.broken > 0) damage += 5;
    state.enemy.hp = clamp(state.enemy.hp - damage, 0, state.enemy.maxHp);
    state.focus = clamp(state.focus + 8, 0, state.focusMax);
    pushEvent(state, event('battle', `${state.playerName}发动连携斩击，造成 ${damage} 点伤害。`));
  }

  if (actionId === 'skill') {
    const cost = 30;
    if (state.focus < cost) {
      state.turn -= 1;
      throw new Error(`焦点不足，需要 ${cost}。`);
    }
    state.focus -= cost;
    state.flags.usedBondSkill = true;
    const bond = selectedBond(state);
    let damage = 24 + bond * 2 + seededRoll(state, 0, 6, 23 + state.turn);
    if (state.chosenStrategyId === 'lia') {
      state.enemy.broken = 2;
      damage += 4;
      pushEvent(state, event('battle', `莉亚与你共同发动「赤誓断章」，外壳破裂并造成 ${damage} 点伤害。`, { speakerId: 'lia' }));
    } else if (state.chosenStrategyId === 'mia') {
      damage += 10;
      pushEvent(state, event('battle', `米娅将炉心推至红线，「九命过载」造成 ${damage} 点伤害。`, { speakerId: 'mia' }));
    } else {
      state.enemy.sealed = clamp(state.enemy.sealed + 10, 0, 20);
      state.partyHp = clamp(state.partyHp + 8, 0, state.partyMaxHp);
      damage -= 5;
      pushEvent(state, event('battle', `塞雷娜展开「静月封界」，造成 ${damage} 点伤害并形成护盾。`, { speakerId: 'serena' }));
    }
    // 技能书的封顶加成（技能稿 6.2：最多 +20%，只加伤害，不碰结局与回卷）
    const bonus = Math.max(0, Math.min(0.2, Number(skillBonus) || 0));
    if (bonus > 0) {
      const extra = Math.round(damage * bonus);
      damage += extra;
      pushEvent(state, event('battle', `技能书加成：多造成 ${extra} 点伤害（+${Math.round(bonus * 100)}%）。`));
    }
    state.enemy.hp = clamp(state.enemy.hp - damage, 0, state.enemy.maxHp);
  }

  if (actionId === 'guard') {
    guarded = true;
    state.focus = clamp(state.focus + 16, 0, state.focusMax);
    pushEvent(state, event('battle', `${state.playerName}稳住阵型，准备承受冲击。焦点 +16。`));
  }

  if (actionId === 'item') {
    if (state.potions <= 0) {
      state.turn -= 1;
      throw new Error('回复药已经用完。');
    }
    state.potions -= 1;
    const healed = Math.min(30, state.partyMaxHp - state.partyHp);
    state.partyHp += healed;
    pushEvent(state, event('battle', `使用星露回复药，队伍恢复 ${healed} 点生命。`));
  }

  if (state.enemy.broken > 0) state.enemy.broken -= 1;
  const assist = companionAssist(state);
  if (assist) pushEvent(state, event('battle', assist));

  if (!finishBattleIfNeeded(state)) {
    enemyTurn(state, guarded);
    finishBattleIfNeeded(state);
  }

  const focusRegen = state.chosenStrategyId === 'mia' ? 3 : 5;
  state.focus = clamp(state.focus + focusRegen, 0, state.focusMax);
  state.updatedAt = Date.now();
  return state;
}

function highestBondCharacterId(state) {
  return Object.values(state.characters)
    .sort((a, b) => (b.bond + b.trust) - (a.bond + a.trust))[0].id;
}

function endingFor(state, decisionId) {
  const partnerId = highestBondCharacterId(state);
  const partner = state.characters[partnerId];
  const strongBond = partner.bond >= 7 && partner.trust >= 6;
  const keptPromise = state.flags.madePromise && !state.flags.insultedSomeone;
  const fourthPath = decisionId === 'seal' && strongBond && keptPromise && state.flags.usedBondSkill;

  if (fourthPath) {
    state.flags.fourthPath = true;
    return {
      rank: 'S',
      title: '第四结局：记忆属于愿意共同承担的人',
      partnerId,
      text: `你拒绝让任何一个人独自成为封印。${partner.shortName}先把手覆在黎明种上，另外两人也随之加入。四份记忆互相校验，古代指令第一次无法决定谁该被遗忘。`,
      epilogue: `列车抵达终点时，你仍没有找回全部过去，却拥有了新的共同记忆。${partner.shortName}记得你说过的话，而且打算让你兑现很久。`
    };
  }

  if (decisionId === 'share') {
    return {
      rank: strongBond ? 'A' : 'B',
      title: strongBond ? '公开审判：月光下没有无主的真相' : '开放协议：世界开始争论',
      partnerId,
      text: `你公开了黎明种的结构与罪证。王国、教会与反抗军同时伸手，而${partner.shortName}站在你身边，要求每一次使用都留下不可删除的见证。`,
      epilogue: strongBond
        ? `真相没有立刻拯救世界，却让谎言第一次变得昂贵。`
        : `世界因此更加混乱，但至少再也不能假装它从未存在。`
    };
  }

  if (decisionId === 'destroy') {
    return {
      rank: keptPromise ? 'A' : 'B',
      title: '无返乡之路：把过去留在火里',
      partnerId,
      text: `你亲手击碎黎明种。被封印的旧记忆化作一场无人能保存的极光，${partner.shortName}没有阻止你，只问你是否愿意从今天重新认识她。`,
      epilogue: keptPromise
        ? `你答应了。她说，这次不准忘。`
        : `你没有回答。列车继续前进，像一条拒绝回头的时间线。`
    };
  }

  return {
    rank: strongBond ? 'A' : 'B',
    title: '静默契约：四把钥匙，一座牢笼',
    partnerId,
    text: `你选择封印黎明种。${partner.shortName}成为第一把钥匙，而其余人的记忆构成互相制衡的锁。没有人能够独自改写世界。`,
    epilogue: strongBond
      ? `每逢月蚀，你们都会短暂听见彼此最珍贵的回忆。她从未抱怨。`
      : `封印稳定了，但你知道信任仍需要比术式更漫长的维护。`
  };
}

export function chooseEnding(state, decisionId) {
  if (state.scene !== 'aftermath') {
    throw new Error('还没到做最终决定的时候。');
  }
  if (!DECISIONS[decisionId]) {
    throw new Error('未知决定。');
  }
  state.decisionId = decisionId;
  state.ending = endingFor(state, decisionId);
  state.scene = 'ending';
  state.objective = '序章完成。';
  pushEvent(state, event('system', `最终决定：「${DECISIONS[decisionId].name}」`));
  pushEvent(state, event('narration', state.ending.text));
  unlockCg(state, `ending_${decisionId}`);
  state.updatedAt = Date.now();
  return state;
}

// 回卷会把食梦兽血量抬回去，阶段要跟着回退，阶段剧情与立绘才能重新触发且保持一致
function battlePhaseForHp(hp) {
  if (hp <= 50) return 3;
  if (hp <= 100) return 2;
  return 1;
}

export function resetBattle(state) {
  if (!['battle', 'aftermath'].includes(state.scene)) {
    throw new Error('当前无法重置战斗。');
  }
  state.scene = 'battle';
  state.partyHp = state.partyMaxHp;
  state.focus = 55;
  state.potions = 2;
  state.turn = 0;
  state.enemy.hp = state.enemy.maxHp;
  state.battlePhase = 1;
  state.enemy.sealed = 0;
  state.enemy.broken = 0;
  state.flags.battleWon = false;
  state.ending = null;
  state.decisionId = null;
  pushEvent(state, event('system', '战斗数据已由黎明种回卷。'));
  state.updatedAt = Date.now();
  return state;
}
