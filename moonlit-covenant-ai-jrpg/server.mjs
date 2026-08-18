import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createInitialState,
  sanitizeState,
  advanceScene,
  chooseStrategy,
  applyChatOutcome,
  battleAction,
  chooseEnding,
  resetBattle
} from './game/engine.mjs';
import { generateCharacterReply, fallbackReply, AI_CONFIG } from './game/ai.mjs';
import { CHARACTERS, STRATEGIES, DECISIONS, GAME_TITLE, GAME_SUBTITLE, CG_GALLERY } from './game/content.mjs';
import { MEMBERSHIP_TIERS, DIAMOND_PACKS, createPlayerAccount, purchaseMembership, purchaseDiamonds, grantDailyCredits, getMembershipInfo } from './game/membership.mjs';
import { CREDIT_COSTS, createCreditMeter, consumeCredit, addCredit, getMeterStatus, canAfford } from './game/credit.mjs';
import { CHARACTER_POOL, COSTUME_POOL, GACHA_RATES, pullGacha, getPityCounter, PITY_THRESHOLD } from './game/gacha.mjs';
import { COSTUME_TYPES, COSTUME_LABELS, equipCostume, getEquippedCostumes, getCostumeBranchScene, BRANCH_SCENES } from './game/costume.mjs';
import { createAnalyticsStore, trackSession, trackDailyActive, getDashboardData, getRealtimeStats } from './game/analytics.mjs';
import { AI_MODELS, getActiveModel, switchModel, createDefaultSettings } from './game/settings.mjs';
import { loadChapterIndex, loadChapter, getChapterScene, getChapterEvents, getTotalChapters } from './scenario/index.mjs';
// ─── 卡牌对战系统（暗影诗章式）───
import { CARDS, CLASSES, RARITIES, KEYWORD_LABELS } from './cards/database.mjs';
import {
  createBattle, playCard, attack, evolve, endTurn, cancelTarget,
  getLegalPlays, getLegalAttackTargets, getEvolvableFollowers, getTargetOptions, RULES
} from './cards/battle.mjs';
import { runAITurn } from './cards/ai.mjs';
import { buildStarterDeck, validateDeck, getDeckCurve, getDeckStats, getStarterDecks, DECK_SIZE, MAX_COPIES } from './cards/deck.mjs';
import { openPacks, craftCard, getCollection, getCardAccountSummary, PACK, SHARD_COST, SHARD_GAIN } from './cards/cardpack.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 4173);
const sessions = new Map();
const sessionLocks = new Map();
const analyticsStore = createAnalyticsStore();
const playerAccounts = new Map();
const playerSettings = new Map();
const battles = new Map(); // playerId -> 对局状态
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_BODY_BYTES = 64 * 1024;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function securityHeaders(contentType = 'application/json; charset=utf-8') {
  return {
    'content-type': contentType,
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'no-referrer',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    'cross-origin-resource-policy': 'same-origin',
    'cache-control': contentType.startsWith('text/html') ? 'no-cache' : 'no-store',
    'content-security-policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"
  };
}

function sendJson(res, status, payload) {
  res.writeHead(status, securityHeaders());
  res.end(JSON.stringify(payload));
}

function sendError(res, status, message, code = 'REQUEST_ERROR') {
  sendJson(res, status, { ok: false, error: { code, message } });
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw Object.assign(new Error('请求内容过大。'), { status: 413 });
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('JSON格式无效。'), { status: 400 });
  }
}

function getSession(id) {
  const session = sessions.get(id);
  if (!session) throw Object.assign(new Error('存档不存在或服务器已重启。'), { status: 404 });
  session.updatedAt = Date.now();
  return session;
}

async function withSessionLock(sessionId, task) {
  const previous = sessionLocks.get(sessionId) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => { release = resolve; });
  const queued = previous.then(() => current);
  sessionLocks.set(sessionId, queued);
  await previous;
  try {
    return await task();
  } finally {
    release();
    if (sessionLocks.get(sessionId) === queued) sessionLocks.delete(sessionId);
  }
}

function safePublicUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : '';
  } catch {
    return '';
  }
}

function publicMeta() {
  return {
    title: GAME_TITLE,
    subtitle: GAME_SUBTITLE,
    ai: {
      mode: AI_CONFIG.mode,
      model: AI_CONFIG.mode === 'openai' ? AI_CONFIG.model : '剧情保底引擎',
      localReady: true
    },
    marketing: {
      wishlistUrl: safePublicUrl(process.env.WISHLIST_URL),
      communityUrl: safePublicUrl(process.env.COMMUNITY_URL)
    },
    characters: Object.values(CHARACTERS).map(({ id, name, shortName, title, role, portrait, accent, quickPrompts }) => ({
      id, name, shortName, title, role, portrait, accent, quickPrompts
    })),
    strategies: Object.values(STRATEGIES),
    decisions: Object.values(DECISIONS)
  };
}

// ─── 卡牌系统辅助 ───
function getCardAccount(playerId) {
  const account = playerAccounts.get(playerId);
  if (!account) return null;
  if (!account._cardInit) {
    account._cardInit = true;
    account.collection = account.collection || {};
    account.shards = account.shards || 0;
    account.packPity = account.packPity || 0;
    account.totalPacks = account.totalPacks || 0;
    account.decks = account.decks && Object.keys(account.decks).length ? account.decks : getStarterDecks();
    // 卡牌对战为自包含免费 demo：首次进入无条件发放起始资源
    account.diamonds = (account.diamonds || 0) + 1500;
    account.shards += 500;
  }
  if (!account.collection) account.collection = {};
  if (typeof account.shards !== 'number') account.shards = 0;
  if (typeof account.packPity !== 'number') account.packPity = 0;
  if (typeof account.totalPacks !== 'number') account.totalPacks = 0;
  if (!account.decks) account.decks = {};
  return account;
}

function sanitizeBattle(state) {
  if (!state) return null;
  const clone = JSON.parse(JSON.stringify(state, (k, v) => (k === '_rng' ? undefined : v)));
  // 隐藏对手手牌与牌库内容
  const op = clone.players.opponent;
  op.hand = op.hand.map((c) => ({ uid: c.uid, hidden: true }));
  op.deckCount = op.deck.length;
  delete op.deck;
  clone.players.player.deckCount = clone.players.player.deck.length;
  delete clone.players.player.deck;
  delete clone._rng;
  // 玩家回合时附带合法动作，便于前端高亮
  if (state.activePlayer === 'player' && state.phase === 'main') {
    clone.legalPlays = getLegalPlays(state, 'player');
    clone.evolvable = getEvolvableFollowers(state, 'player');
    clone.attackTargets = {};
    for (const f of state.players.player.field) {
      if (f.canAttack) clone.attackTargets[f.uid] = getLegalAttackTargets(state, 'player', f.uid);
    }
  }
  if (state.phase === 'awaitingTarget' && state.pending) {
    clone.targetOptions = getTargetOptions(state, 'player', state.pending.cardId);
    clone.pendingCardId = state.pending.cardId;
  }
  return clone;
}

async function handleApi(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, {
      ok: true,
      service: 'moonlit-covenant',
      aiMode: AI_CONFIG.mode,
      model: AI_CONFIG.model,
      sessions: sessions.size,
      now: new Date().toISOString()
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/meta') {
    return sendJson(res, 200, { ok: true, meta: publicMeta() });
  }

  if (req.method === 'GET' && url.pathname === '/api/gallery') {
    const sid = url.searchParams.get('sessionId') || '';
    const session = sid ? sessions.get(sid) : null;
    const unlocked = session?.unlockedCgs || [];
    const gallery = CG_GALLERY.map((cg) => ({
      ...cg,
      unlocked: unlocked.includes(cg.id)
    }));
    return sendJson(res, 200, { ok: true, gallery, total: CG_GALLERY.length, unlocked: unlocked.length });
  }

  // ═══ 会员与钻石系统 ═══
  if (req.method === 'GET' && url.pathname === '/api/membership/tiers') {
    return sendJson(res, 200, { ok: true, tiers: MEMBERSHIP_TIERS, packs: DIAMOND_PACKS });
  }

  if (req.method === 'GET' && url.pathname === '/api/account') {
    const playerId = url.searchParams.get('playerId') || '';
    const account = playerAccounts.get(playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    grantDailyCredits(account);
    return sendJson(res, 200, { ok: true, account, membership: getMembershipInfo(account) });
  }

  if (req.method === 'POST' && url.pathname === '/api/account/create') {
    const body = await readJson(req);
    const account = createPlayerAccount(body.playerName || '旅行者');
    // demo 模式：发放起始资源，确保进入即可体验召唤（无需真实支付）
    if (process.env.AI_MODE !== 'openai') {
      account.credits += 600;
      account.diamonds += 300;
    }
    playerAccounts.set(account.id, account);
    const meter = createCreditMeter(account);
    account._meter = meter;
    return sendJson(res, 201, { ok: true, account, message: '账户创建成功' });
  }

  if (req.method === 'POST' && url.pathname === '/api/membership/purchase') {
    const body = await readJson(req);
    const account = playerAccounts.get(body.playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    const result = purchaseMembership(account, body.tierId);
    if (result.ok && account._meter) addCredit(account._meter, MEMBERSHIP_TIERS.find(t => t.id === body.tierId)?.dailyCredit || 0, 'membership_daily');
    trackSession(analyticsStore, body.playerId, 'membership_purchase');
    return sendJson(res, result.ok ? 200 : 400, result);
  }

  if (req.method === 'POST' && url.pathname === '/api/diamonds/purchase') {
    const body = await readJson(req);
    const account = playerAccounts.get(body.playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    const result = purchaseDiamonds(account, body.packId);
    trackSession(analyticsStore, body.playerId, 'diamond_purchase');
    return sendJson(res, result.ok ? 200 : 400, result);
  }

  // ═══ Credit 计量 ═══
  if (req.method === 'GET' && url.pathname === '/api/credit') {
    const playerId = url.searchParams.get('playerId') || '';
    const account = playerAccounts.get(playerId);
    if (!account || !account._meter) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    return sendJson(res, 200, { ok: true, meter: getMeterStatus(account._meter), costs: CREDIT_COSTS });
  }

  // ═══ 抽卡系统 ═══
  if (req.method === 'GET' && url.pathname === '/api/gacha/pools') {
    return sendJson(res, 200, { ok: true, characters: CHARACTER_POOL, costumes: COSTUME_POOL, rates: GACHA_RATES, pity: PITY_THRESHOLD });
  }

  if (req.method === 'POST' && url.pathname === '/api/gacha/pull') {
    const body = await readJson(req);
    const account = playerAccounts.get(body.playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    if (!account._meter) account._meter = createCreditMeter(account);
    const result = pullGacha(account, account._meter, body.pool || 'character', body.count || 1);
    if (result.ok && result.results) {
      if (!account.ownedCostumes) account.ownedCostumes = [];
      if (!account.ownedCharacters) account.ownedCharacters = [];
      for (const item of result.results) {
        if (body.pool === 'costume') {
          if (!account.ownedCostumes.includes(item.id)) account.ownedCostumes.push(item.id);
        } else {
          if (!account.ownedCharacters.includes(item.id)) account.ownedCharacters.push(item.id);
        }
      }
    }
    trackSession(analyticsStore, body.playerId, 'gacha_pull');
    return sendJson(res, result.ok ? 200 : 400, result);
  }

  // ═══ 换衣系统 ═══
  if (req.method === 'GET' && url.pathname === '/api/costume') {
    const playerId = url.searchParams.get('playerId') || '';
    const account = playerAccounts.get(playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    return sendJson(res, 200, {
      ok: true,
      equipped: getEquippedCostumes(account),
      ownedCostumes: account.ownedCostumes || [],
      ownedCharacters: account.ownedCharacters || [],
      types: COSTUME_LABELS,
      branches: BRANCH_SCENES,
      costumePool: COSTUME_POOL
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/costume/equip') {
    const body = await readJson(req);
    const account = playerAccounts.get(body.playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    // 脱下（恢复默认服装）
    if (body.costumeId === 'default' || body.costumeId === null || body.costumeId === '') {
      if (!account.equippedCostumes) account.equippedCostumes = {};
      delete account.equippedCostumes[body.characterId];
      return sendJson(res, 200, { ok: true, equipped: { characterId: body.characterId, costumeId: null }, message: '已恢复默认服装。' });
    }
    const result = equipCostume(account, body.characterId, body.costumeId);
    if (result.ok) {
      const parts = String(body.costumeId).split('_');
      const costumeType = parts[parts.length - 1];
      const branch = BRANCH_SCENES[costumeType] || null;
      result.branchScene = branch;
      trackSession(analyticsStore, body.playerId, 'costume_equip');
    }
    return sendJson(res, result.ok ? 200 : 400, result);
  }

  // 测试专用：一键发放全部角色与服装
  if (req.method === 'POST' && url.pathname === '/api/costume/grant-all') {
    const body = await readJson(req);
    const account = playerAccounts.get(body.playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    account.ownedCharacters = CHARACTER_POOL.map((c) => c.id);
    account.ownedCostumes = COSTUME_POOL.map((c) => c.id);
    return sendJson(res, 200, { ok: true, characters: account.ownedCharacters.length, costumes: account.ownedCostumes.length });
  }

  // ═══ AI 设置 ═══
  if (req.method === 'GET' && url.pathname === '/api/settings/ai') {
    const playerId = url.searchParams.get('playerId') || '';
    const settings = playerSettings.get(playerId) || createDefaultSettings();
    return sendJson(res, 200, { ok: true, settings, models: AI_MODELS, active: getActiveModel(settings) });
  }

  if (req.method === 'POST' && url.pathname === '/api/settings/ai') {
    const body = await readJson(req);
    const playerId = body.playerId || '';
    let settings = playerSettings.get(playerId) || createDefaultSettings();
    const result = switchModel(settings, body.modelId);
    if (result.ok) playerSettings.set(playerId, settings);
    return sendJson(res, result.ok ? 200 : 400, { ...result, settings });
  }

  // ═══ 后台管理仪表板 ═══
  if (req.method === 'GET' && url.pathname === '/api/admin/dashboard') {
    const adminKey = req.headers['x-admin-key'] || url.searchParams.get('key') || '';
    if (adminKey !== '123456') return sendError(res, 403, '管理密码错误。', 'FORBIDDEN');
    const dashboard = getDashboardData(analyticsStore);
    const realtime = getRealtimeStats(analyticsStore);
    return sendJson(res, 200, { ok: true, dashboard, realtime, totalAccounts: playerAccounts.size, totalSessions: sessions.size });
  }

  // ═══ 剧本系统 ═══
  if (req.method === 'GET' && url.pathname === '/api/scenario/index') {
    const index = loadChapterIndex();
    return sendJson(res, 200, { ok: true, chapters: index, total: getTotalChapters() });
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/scenario/chapter/')) {
    const chapterId = url.pathname.split('/').pop();
    const chapter = loadChapter(chapterId);
    if (!chapter) return sendError(res, 404, '章节不存在。', 'NO_CHAPTER');
    return sendJson(res, 200, { ok: true, chapter });
  }

  // ═══ 卡牌对战系统 ═══
  if (req.method === 'GET' && url.pathname === '/api/cards/meta') {
    return sendJson(res, 200, {
      ok: true,
      classes: CLASSES,
      rarities: RARITIES,
      keywords: KEYWORD_LABELS,
      rules: RULES,
      pack: PACK,
      shardCost: SHARD_COST,
      shardGain: SHARD_GAIN,
      deckSize: DECK_SIZE,
      maxCopies: MAX_COPIES
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/cards/all') {
    return sendJson(res, 200, { ok: true, cards: CARDS, total: CARDS.length });
  }

  if (req.method === 'GET' && url.pathname === '/api/cards/collection') {
    const account = getCardAccount(url.searchParams.get('playerId') || '');
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    return sendJson(res, 200, { ok: true, ...getCollection(account) });
  }

  if (req.method === 'GET' && url.pathname === '/api/cards/summary') {
    const account = getCardAccount(url.searchParams.get('playerId') || '');
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    return sendJson(res, 200, { ok: true, summary: getCardAccountSummary(account) });
  }

  if (req.method === 'POST' && url.pathname === '/api/cards/pack') {
    const body = await readJson(req);
    const account = getCardAccount(body.playerId || '');
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    const count = body.count >= 10 ? 10 : 1;
    const result = openPacks(account, count);
    trackSession(analyticsStore, body.playerId, 'card_pack_open');
    return sendJson(res, result.ok ? 200 : 400, result);
  }

  if (req.method === 'POST' && url.pathname === '/api/cards/craft') {
    const body = await readJson(req);
    const account = getCardAccount(body.playerId || '');
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    const result = craftCard(account, body.cardId);
    return sendJson(res, result.ok ? 200 : 400, result);
  }

  if (req.method === 'GET' && url.pathname === '/api/cards/decks') {
    const account = getCardAccount(url.searchParams.get('playerId') || '');
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    const decks = {};
    for (const [cls, deck] of Object.entries(account.decks)) {
      decks[cls] = { deck, curve: getDeckCurve(deck), stats: getDeckStats(deck), validation: validateDeck(deck, cls) };
    }
    return sendJson(res, 200, { ok: true, decks });
  }

  if (req.method === 'GET' && url.pathname === '/api/cards/deck/starter') {
    return sendJson(res, 200, { ok: true, decks: getStarterDecks() });
  }

  if (req.method === 'POST' && url.pathname === '/api/cards/deck/save') {
    const body = await readJson(req);
    const account = getCardAccount(body.playerId || '');
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    const classId = body.classId;
    if (!CLASSES[classId] || classId === 'neutral') return sendError(res, 400, '无效职业。', 'BAD_CLASS');
    const deck = Array.isArray(body.deck) ? body.deck : [];
    const validation = validateDeck(deck, classId);
    if (!validation.ok) return sendJson(res, 400, { ok: false, error: { code: 'INVALID_DECK', message: validation.errors[0] }, errors: validation.errors });
    account.decks[classId] = deck;
    return sendJson(res, 200, { ok: true, classId, curve: getDeckCurve(deck), stats: getDeckStats(deck), message: '牌组已保存。' });
  }

  // ─── 对局 ───
  if (req.method === 'POST' && url.pathname === '/api/battle/start') {
    const body = await readJson(req);
    const account = getCardAccount(body.playerId || '');
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    const playerClass = CLASSES[body.playerClass] && body.playerClass !== 'neutral' ? body.playerClass : 'lia';
    let playerDeck = Array.isArray(body.playerDeck) && body.playerDeck.length ? body.playerDeck : (account.decks[playerClass] || buildStarterDeck(playerClass));
    const pv = validateDeck(playerDeck, playerClass);
    if (!pv.ok) playerDeck = buildStarterDeck(playerClass); // 非法则回退预组
    const classKeys = Object.keys(CLASSES).filter((c) => c !== 'neutral');
    const opponentClass = CLASSES[body.opponentClass] && body.opponentClass !== 'neutral'
      ? body.opponentClass
      : classKeys[Math.floor(Math.random() * classKeys.length)];
    const opponentDeck = buildStarterDeck(opponentClass);
    const state = createBattle({ playerClass, playerDeck, opponentClass, opponentDeck });
    state.playerClass = playerClass;
    state.opponentClass = opponentClass;
    battles.set(body.playerId, state);
    trackSession(analyticsStore, body.playerId, 'battle_start');
    return sendJson(res, 201, { ok: true, state: sanitizeBattle(state) });
  }

  if (req.method === 'GET' && url.pathname === '/api/battle/state') {
    const state = battles.get(url.searchParams.get('playerId') || '');
    if (!state) return sendError(res, 404, '没有进行中的对局。', 'NO_BATTLE');
    return sendJson(res, 200, { ok: true, state: sanitizeBattle(state) });
  }

  if (req.method === 'POST' && url.pathname === '/api/battle/action') {
    const body = await readJson(req);
    const state = battles.get(body.playerId || '');
    if (!state) return sendError(res, 404, '没有进行中的对局。', 'NO_BATTLE');
    const a = body.action || {};
    try {
      if (a.type === 'play') playCard(state, 'player', a.handUid, a.target ?? null);
      else if (a.type === 'attack') attack(state, 'player', a.attackerUid, a.targetUid);
      else if (a.type === 'evolve') evolve(state, 'player', a.uid);
      else if (a.type === 'cancel') cancelTarget(state);
      else return sendError(res, 400, '未知动作。', 'BAD_ACTION');
    } catch (err) {
      return sendError(res, 400, err.message || '非法动作。', 'ILLEGAL_ACTION');
    }
    return sendJson(res, 200, { ok: true, state: sanitizeBattle(state) });
  }

  if (req.method === 'POST' && url.pathname === '/api/battle/end-turn') {
    const body = await readJson(req);
    const state = battles.get(body.playerId || '');
    if (!state) return sendError(res, 404, '没有进行中的对局。', 'NO_BATTLE');
    if (state.phase === 'gameover') return sendJson(res, 200, { ok: true, state: sanitizeBattle(state), aiActions: [] });
    if (state.phase === 'awaitingTarget') cancelTarget(state);
    endTurn(state);                 // 玩家 → 对手回合
    runAITurn(state);               // AI 行动并结束回合 → 回到玩家
    const aiActions = state.aiActions || [];
    if (state.phase === 'gameover') trackSession(analyticsStore, body.playerId, state.winner === 'player' ? 'battle_win' : 'battle_lose');
    return sendJson(res, 200, { ok: true, state: sanitizeBattle(state), aiActions });
  }

  if (req.method === 'POST' && url.pathname === '/api/battle/concede') {
    const body = await readJson(req);
    const state = battles.get(body.playerId || '');
    if (!state) return sendError(res, 404, '没有进行中的对局。', 'NO_BATTLE');
    state.phase = 'gameover';
    state.winner = 'opponent';
    return sendJson(res, 200, { ok: true, state: sanitizeBattle(state) });
  }

  if (req.method === 'POST' && url.pathname === '/api/session') {
    const body = await readJson(req);
    const state = createInitialState(body.playerName);
    sessions.set(state.id, state);
    trackDailyActive(analyticsStore, state.playerName);
    trackSession(analyticsStore, state.id, 'new_session');
    return sendJson(res, 201, { ok: true, state: sanitizeState(state), meta: publicMeta() });
  }

  const sessionMatch = url.pathname.match(/^\/api\/session\/([0-9a-f-]+)$/i);
  if (req.method === 'GET' && sessionMatch) {
    const state = getSession(sessionMatch[1]);
    return sendJson(res, 200, { ok: true, state: sanitizeState(state), meta: publicMeta() });
  }

  if (req.method !== 'POST') {
    return sendError(res, 405, '不支持的请求方法。', 'METHOD_NOT_ALLOWED');
  }

  const body = await readJson(req);
  const sessionId = String(body.sessionId || '');
  if (!sessionId) return sendError(res, 400, '缺少sessionId。', 'MISSING_SESSION');

  return withSessionLock(sessionId, async () => {
    const state = getSession(sessionId);

    if (url.pathname === '/api/advance') {
      advanceScene(state, body.action);
      return sendJson(res, 200, { ok: true, state: sanitizeState(state) });
    }

    if (url.pathname === '/api/strategy') {
      chooseStrategy(state, body.strategyId);
      return sendJson(res, 200, { ok: true, state: sanitizeState(state) });
    }

    if (url.pathname === '/api/mode') {
      const mode = body.mode === 'story' ? 'story' : 'ai';
      state.dialogueMode = mode;
      state.updatedAt = Date.now();
      return sendJson(res, 200, { ok: true, state: sanitizeState(state) });
    }

    if (url.pathname === '/api/chat') {
      const characterId = String(body.characterId || '');
      const message = String(body.message || '');
      let outcome;
      if (state.dialogueMode === 'story') {
        outcome = { ...fallbackReply(state, characterId, message), source: 'story' };
      } else {
        outcome = await generateCharacterReply(state, characterId, message);
      }
      applyChatOutcome(state, characterId, message, outcome);
      return sendJson(res, 200, {
        ok: true,
        state: sanitizeState(state),
        ai: { source: outcome.source || 'unknown' }
      });
    }

    if (url.pathname === '/api/battle') {
      battleAction(state, body.actionId);
      return sendJson(res, 200, { ok: true, state: sanitizeState(state) });
    }

    if (url.pathname === '/api/ending') {
      chooseEnding(state, body.decisionId);
      return sendJson(res, 200, { ok: true, state: sanitizeState(state) });
    }

    if (url.pathname === '/api/reset-battle') {
      resetBattle(state);
      return sendJson(res, 200, { ok: true, state: sanitizeState(state) });
    }

    if (url.pathname === '/api/restart') {
      const replacement = createInitialState(state.playerName);
      sessions.delete(sessionId);
      sessions.set(replacement.id, replacement);
      return sendJson(res, 200, { ok: true, state: sanitizeState(replacement), meta: publicMeta() });
    }

    return sendError(res, 404, 'API不存在。', 'NOT_FOUND');
  });
}

function safeStaticPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const requested = decoded === '/' ? '/index.html' : decoded;
  const normalized = path.normalize(requested).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = path.join(PUBLIC_DIR, normalized);
  if (!fullPath.startsWith(PUBLIC_DIR)) return null;
  return fullPath;
}

function serveStatic(req, res, url) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    return sendError(res, 405, '不支持的请求方法。', 'METHOD_NOT_ALLOWED');
  }
  const filePath = safeStaticPath(url.pathname);
  if (!filePath) return sendError(res, 403, '禁止访问。', 'FORBIDDEN');
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      const fallback = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(fallback, (fallbackError, data) => {
        if (fallbackError) return sendError(res, 404, '页面不存在。', 'NOT_FOUND');
        res.writeHead(200, securityHeaders('text/html; charset=utf-8'));
        if (req.method === 'HEAD') return res.end();
        res.end(data);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const headers = securityHeaders(contentType);
    headers['cache-control'] = process.env.NODE_ENV === 'production' && ext !== '.html'
      ? 'public, max-age=3600'
      : 'no-cache';
    res.writeHead(200, headers);
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
    } else {
      serveStatic(req, res, url);
    }
  } catch (error) {
    const status = Number(error.status || 400);
    console.error(`[${req.method}] ${url.pathname}:`, error);
    if (!res.headersSent) sendError(res, status, error.message || '服务器错误。', status >= 500 ? 'SERVER_ERROR' : 'REQUEST_ERROR');
  }
});

const cleanup = setInterval(() => {
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const [id, state] of sessions) {
    if (state.updatedAt < cutoff) sessions.delete(id);
  }
}, 30 * 60 * 1000);
cleanup.unref();

server.listen(PORT, HOST, () => {
  console.log(`\n${GAME_TITLE}`);
  console.log(`Web: http://${HOST}:${PORT}`);
  console.log(`AI mode: ${AI_CONFIG.mode} (${AI_CONFIG.model})\n`);
});

function shutdown(signal) {
  console.log(`\n${signal}: shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 3000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
