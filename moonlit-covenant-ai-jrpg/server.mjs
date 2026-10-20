import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { pipeline } from 'node:stream';
import { fileURLToPath } from 'node:url';
import {
  createInitialState,
  sanitizeState,
  advanceScene,
  chooseStrategy,
  applyChatOutcome,
  assertChatAllowed,
  battleAction,
  chooseEnding,
  resetBattle
} from './game/engine.mjs';
import { generateCharacterReply, fallbackReply, AI_CONFIG } from './game/ai.mjs';
import { CHARACTERS, STRATEGIES, DECISIONS, GAME_TITLE, GAME_SUBTITLE, CG_GALLERY } from './game/content.mjs';
import { MEMBERSHIP_TIERS, DIAMOND_PACKS, createPlayerAccount, purchaseMembership, purchaseDiamonds, grantDailyCredits, getMembershipInfo } from './game/membership.mjs';
import { CREDIT_COSTS, createCreditMeter, addCredit, getMeterStatus } from './game/credit.mjs';
import { CHARACTER_POOL, COSTUME_POOL, GACHA_RATES, GACHA_COSTS, DUPLICATE_COMPENSATION, pullGacha, PITY_THRESHOLD } from './game/gacha.mjs';
import { COSTUME_LABELS, equipCostume, getEquippedCostumes, BRANCH_SCENES } from './game/costume.mjs';
import { createAnalyticsStore, trackSession, trackDailyActive, getDashboardData, getRealtimeStats, pruneAnalytics } from './game/analytics.mjs';
import { AI_MODELS, PER_PLAYER_ROUTING, getActiveModel, switchModel, createDefaultSettings } from './game/settings.mjs';
import { REWARD_RULES, HEROINE_JOIN_CHAPTERS, CHAPTER_ID_PATTERN, claimDaily, getRewardStatus, recordChapterClear, grantCardWin } from './game/rewards.mjs';
import { loadChapterIndex, loadChapter, getTotalChapters } from './scenario/index.mjs';
import { judgeStoryInput, readJsonCached } from './game/story-judge.mjs';
import { SAVE_VERSION, createSaveStore, rekeyBattleUids, resolvePersistConfig } from './game/persist.mjs';
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
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const SESSION_TTL_MS = DAY_MS;           // 外传存档：24 小时无操作过期
const BATTLE_TTL_MS = DAY_MS;            // 卡牌对局：24 小时无操作过期
const ACCOUNT_IDLE_MS = 90 * DAY_MS;     // 账户：闲置 90 天过期（有了持久化，不能太短）
const MAX_BODY_BYTES = 64 * 1024;
const positiveInt = (value, fallback) => (Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : fallback);
// 总量上限：超出时先清理过期数据，仍然满就返回 503（防止刷请求把内存和存档文件撑爆）
const MAX_SESSIONS = positiveInt(process.env.MAX_SESSIONS, 2000);
const MAX_ACCOUNTS = positiveInt(process.env.MAX_ACCOUNTS, 2000);
const MAX_PURCHASE_HISTORY = 100;
const ID_PATTERN = /^[0-9a-f-]{36}$/;

// ─── 后台口令：只认请求头 x-admin-key ───
// 未设置 ADMIN_KEY 时沿用默认口令 123456（作者要求后台开箱即用）；显式设为空字符串则关闭后台（返回 404 ADMIN_DISABLED）。
const ADMIN_KEY = process.env.ADMIN_KEY === undefined ? '123456' : String(process.env.ADMIN_KEY);
const ADMIN_ENABLED = ADMIN_KEY.length > 0;

// ─── 演示工具（一键发放、免费开通会员、免费领取钻石）───
// 默认开启；NODE_ENV=production 时默认关闭；DEMO_TOOLS=1 / 0 强制开关（契约 K-3）。
function resolveDemoTools(env = process.env) {
  const flag = String(env.DEMO_TOOLS ?? '').trim().toLowerCase();
  if (['1', 'true', 'on', 'yes'].includes(flag)) return true;
  if (['0', 'false', 'off', 'no'].includes(flag)) return false;
  return env.NODE_ENV !== 'production';
}
const DEMO_TOOLS = resolveDemoTools();

// ─── AI 限流（只在 openai 模式下生效）───
// 每个 IP 令牌桶每分钟 20 次，全局最多 3 个并发上游调用；超出时立刻改用演示保底（source:'demo'），不排队。
const AI_RATE_PER_MINUTE = 20;
const AI_MAX_CONCURRENT = 3;
const AI_MAX_BUCKETS = 10000;
const aiBuckets = new Map(); // ip -> { tokens, at }
let aiInflight = 0;

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

// 文本类静态资源按需 gzip：矢量立绘 / 服装 / CG 每张 40–90KB，压缩后约为 1/3（换衣间、服饰池一次会请求几十张）
const COMPRESSIBLE_EXT = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg']);

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

// 内部字段（_meter 计量器、_rng 随机数函数、_cardInit 标记）一律不出现在任何响应里（契约 K-6）
const INTERNAL_KEYS = new Set(['_meter', '_rng', '_cardInit']);
const hideInternal = (key, value) => (INTERNAL_KEYS.has(key) ? undefined : value);

function sendJson(res, status, payload) {
  res.writeHead(status, securityHeaders());
  res.end(JSON.stringify(payload, hideInternal));
}

function sendError(res, status, message, code = 'REQUEST_ERROR') {
  sendJson(res, status, { ok: false, error: { code, message } });
}

const httpError = (status, message, code) => Object.assign(new Error(message), { status, code });

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw httpError(413, '请求内容过大。', 'PAYLOAD_TOO_LARGE');
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  let parsed;
  try {
    parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw httpError(400, 'JSON格式无效。', 'BAD_JSON');
  }
  // null、数组、数字、字符串等非对象请求体一律当作空对象，由各接口按缺字段处理
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
}

/** 校验客户端传来的 id：空值返回 ''（由调用方按「不存在」处理），格式不对直接 400。 */
function checkId(value, label = '玩家') {
  if (value === undefined || value === null || value === '') return '';
  const id = String(value);
  if (!ID_PATTERN.test(id)) throw httpError(400, `${label} ID 格式无效。`, 'BAD_ID');
  return id;
}

function getAccount(rawId) {
  const id = checkId(rawId);
  const account = id ? playerAccounts.get(id) : null;
  if (!account) return null;
  account.updatedAt = Date.now();
  return account;
}

/** 对外返回的账户：去掉 _meter 等内部字段（契约 K-6）。 */
function publicAccount(account) {
  if (!account || typeof account !== 'object') return account;
  return Object.fromEntries(Object.entries(account).filter(([key]) => !INTERNAL_KEYS.has(key)));
}

function withPublicAccount(result) {
  return result && result.account ? { ...result, account: publicAccount(result.account) } : result;
}

function trimPurchaseHistory(account) {
  if (Array.isArray(account?.purchaseHistory) && account.purchaseHistory.length > MAX_PURCHASE_HISTORY) {
    account.purchaseHistory.splice(0, account.purchaseHistory.length - MAX_PURCHASE_HISTORY);
  }
}

function getSession(id) {
  const sessionId = checkId(id, '存档');
  const session = sessionId ? sessions.get(sessionId) : null;
  if (!session) throw httpError(404, '存档不存在或服务器已重启。', 'NO_SESSION');
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
    // 契约 K-1：前端据此决定是否显示后台入口与演示商店工具
    admin: { enabled: ADMIN_ENABLED },
    demoTools: DEMO_TOOLS,
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

function adminKeyMatches(provided) {
  if (!ADMIN_ENABLED || typeof provided !== 'string' || !provided) return false;
  const given = Buffer.from(provided, 'utf8');
  const expected = Buffer.from(ADMIN_KEY, 'utf8');
  if (given.length !== expected.length) return false;
  return crypto.timingSafeEqual(given, expected);
}

function clientIp(req) {
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * 申请一次上游模型调用名额：成功返回释放函数，失败（并发已满或该 IP 令牌用完）返回 null。
 * 并发已满时不消耗令牌。
 */
function acquireAiSlot(ip) {
  const now = Date.now();
  let bucket = aiBuckets.get(ip);
  if (!bucket) {
    bucket = { tokens: AI_RATE_PER_MINUTE, at: now };
    aiBuckets.set(ip, bucket);
    while (aiBuckets.size > AI_MAX_BUCKETS) aiBuckets.delete(aiBuckets.keys().next().value);
  }
  bucket.tokens = Math.min(AI_RATE_PER_MINUTE, bucket.tokens + ((now - bucket.at) * AI_RATE_PER_MINUTE) / 60000);
  bucket.at = now;
  if (aiInflight >= AI_MAX_CONCURRENT || bucket.tokens < 1) return null;
  bucket.tokens -= 1;
  aiInflight += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    aiInflight -= 1;
  };
}

async function generateReplyWithLimit(req, state, characterId, message) {
  if (AI_CONFIG.mode !== 'openai') return generateCharacterReply(state, characterId, message);
  const safeMessage = String(message || '').trim().slice(0, 500);
  if (!safeMessage) throw new Error('请输入想说的话。');
  const release = acquireAiSlot(clientIp(req));
  if (!release) return { ...fallbackReply(state, characterId, safeMessage), source: 'demo' };
  try {
    return await generateCharacterReply(state, characterId, message);
  } finally {
    release();
  }
}

// ─── 存档持久化（V5）───
const persistConfig = resolvePersistConfig();
const saveStore = createSaveStore({ ...persistConfig, snapshot: snapshotState });
const markDirty = () => saveStore.schedule();

function snapshotState() {
  // JSON.stringify 会自动丢掉函数（对局里的 _rng），其余都是纯数据
  return {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    sessions: Object.fromEntries(sessions),
    playerAccounts: Object.fromEntries(playerAccounts),
    battles: Object.fromEntries(battles),
    playerSettings: Object.fromEntries(playerSettings)
  };
}

function restoreState(data) {
  if (!data) return;
  const now = Date.now();
  const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  const entries = (value) => (isObject(value) ? Object.entries(value) : []);
  const fresh = (value, ttl) => Number.isFinite(value) && now - value < ttl;
  // 账户按最近活跃排序，超出上限时保留最近的
  const accounts = entries(data.playerAccounts)
    .filter(([id, account]) => ID_PATTERN.test(id) && isObject(account) && account.id === id)
    .map(([id, account]) => {
      if (!Number.isFinite(account.updatedAt)) account.updatedAt = Number.isFinite(account.createdAt) ? account.createdAt : now;
      return [id, account];
    })
    .filter(([, account]) => fresh(account.updatedAt, ACCOUNT_IDLE_MS))
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
    .slice(0, MAX_ACCOUNTS);
  for (const [id, account] of accounts) {
    if (!isObject(account._meter)) account._meter = createCreditMeter(account);
    playerAccounts.set(id, account);
  }

  const restoredSessions = entries(data.sessions)
    .filter(([id, state]) => ID_PATTERN.test(id) && isObject(state) && state.id === id && fresh(state.updatedAt, SESSION_TTL_MS))
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
    .slice(0, MAX_SESSIONS);
  for (const [id, state] of restoredSessions) sessions.set(id, state);

  const uidPrefix = `r${now.toString(36)}`;
  for (const [id, state] of entries(data.battles)) {
    if (!playerAccounts.has(id) || !isObject(state) || !isObject(state.players)) continue;
    if (!isObject(state.players.player) || !isObject(state.players.opponent)) continue;
    if (!Number.isFinite(state.updatedAt)) state.updatedAt = now;
    if (!fresh(state.updatedAt, BATTLE_TTL_MS)) continue;
    rekeyBattleUids(state, uidPrefix);
    state._rng = Math.random;
    battles.set(id, state);
  }

  for (const [id, settings] of entries(data.playerSettings)) {
    if (playerAccounts.has(id) && isObject(settings)) playerSettings.set(id, settings);
  }
}

/** 清理过期数据；返回是否删除了任何持久化数据。 */
function pruneExpired(now = Date.now()) {
  let changed = false;
  for (const [id, state] of sessions) {
    if (!(now - state.updatedAt < SESSION_TTL_MS)) { sessions.delete(id); changed = true; }
  }
  for (const [id, account] of playerAccounts) {
    const last = Number.isFinite(account.updatedAt) ? account.updatedAt : account.createdAt;
    if (!(now - last < ACCOUNT_IDLE_MS)) {
      playerAccounts.delete(id);
      battles.delete(id);
      playerSettings.delete(id);
      changed = true;
    }
  }
  for (const [id, state] of battles) {
    if (!playerAccounts.has(id) || !(now - state.updatedAt < BATTLE_TTL_MS)) { battles.delete(id); changed = true; }
  }
  for (const id of playerSettings.keys()) {
    if (!playerAccounts.has(id)) { playerSettings.delete(id); changed = true; }
  }
  pruneAnalytics(analyticsStore, now);
  for (const [ip, bucket] of aiBuckets) {
    if (now - bucket.at > 2 * 60 * 1000) aiBuckets.delete(ip);
  }
  if (changed) markDirty();
  return changed;
}

function ensureCapacity(map, max) {
  if (map.size < max) return;
  pruneExpired();
  if (map.size >= max) throw httpError(503, '服务器存档已满，请稍后再试。', 'SERVER_FULL');
}

// ─── 卡牌系统辅助 ───
function getCardAccount(playerId) {
  const account = getAccount(playerId);
  if (!account) return null;
  if (!account._cardInit) {
    account._cardInit = true;
    account.collection = account.collection || {};
    account.shards = account.shards || 0;
    account.packPity = account.packPity || 0;
    account.totalPacks = account.totalPacks || 0;
    account.decks = account.decks && Object.keys(account.decks).length ? account.decks : getStarterDecks();
    // 卡牌对战（实验模式）首次进入发放起始资源：一次十连开包的钻石 + 合成碎片（REWARD_RULES.cardStarter）。
    // 账户和主游戏共用（契约 R-4），所以不再一次发 1500：钻石主要靠签到、主线首通和对战胜利获得。
    account.diamonds = (Number.isFinite(account.diamonds) ? account.diamonds : 0) + REWARD_RULES.cardStarter.diamonds;
    account.shards += REWARD_RULES.cardStarter.shards;
    markDirty();
  }
  if (!account.collection) account.collection = {};
  if (typeof account.shards !== 'number') account.shards = 0;
  if (typeof account.packPity !== 'number') account.packPity = 0;
  if (typeof account.totalPacks !== 'number') account.totalPacks = 0;
  if (!account.decks) account.decks = {};
  return account;
}

function getBattle(playerId) {
  const id = checkId(playerId);
  const state = id ? battles.get(id) : null;
  if (state) state.updatedAt = Date.now();
  return state || null;
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

/**
 * 对局以玩家获胜结束时发放一次胜利奖励（契约 R-3），结果记在对局状态的 reward 上：
 * 同一局不会发第二次，GET /api/battle/state 也能读到。输了、平局、投降都没有奖励（reward 为 null）。
 */
function settleBattleReward(playerId, state) {
  if (!state || state.phase !== 'gameover') return null;
  if (state.winner === 'player' && !state.reward) {
    const account = getAccount(playerId);
    if (account) state.reward = grantCardWin(account);
  }
  return state.reward || null;
}

/** 响应里的 reward：只在对局结束时出现（契约 R-3）。 */
const battleReward = (state) => (state?.phase === 'gameover' ? state.reward || null : null);

// ─── 主线章节目录（public/story/chapters/index.json，文件改动后自动重读；06 章以后上线时无需重启）───
const STORY_INDEX_FILE = path.join(PUBLIC_DIR, 'story', 'chapters', 'index.json');
function storyChapterIds() {
  const index = readJsonCached(STORY_INDEX_FILE);
  return new Set((Array.isArray(index) ? index : []).map((entry) => entry?.id).filter((id) => typeof id === 'string'));
}

const INTERNAL_ERROR_TYPES = [TypeError, RangeError, SyntaxError, ReferenceError];

/**
 * 把异常翻译成 HTTP 响应：
 * - 带 status 的（readJson、判定接口等）原样使用；
 * - TypeError / RangeError / SyntaxError / ReferenceError 和系统错误（ENOENT 等，消息里可能有绝对路径）是程序缺陷，返回 500「服务器错误。」，细节只写服务端日志；
 * - 其余普通 Error 是引擎面向玩家的规则提示（如「战前交流次数已用完」），返回 400 和原文。
 */
function describeError(error) {
  const status = Number(error?.status);
  if (Number.isInteger(status) && status >= 400 && status < 600) {
    return { status, message: error.message || '请求无效。', code: error.code || (status >= 500 ? 'SERVER_ERROR' : 'REQUEST_ERROR') };
  }
  const internal = !(error instanceof Error)
    || INTERNAL_ERROR_TYPES.some((Type) => error instanceof Type)
    || Boolean(error.syscall)
    || /^(E[A-Z]+|ERR_[A-Z0-9_]+)$/.test(String(error.code || ''));
  if (internal) return { status: 500, message: '服务器错误。', code: 'SERVER_ERROR' };
  return { status: 400, message: error.message || '请求无效。', code: 'REQUEST_ERROR' };
}

// 所有已知 API 路径：方法不对返回 405，完全不认识的返回 404
const API_ROUTES = new Set([
  '/api/health', '/api/meta', '/api/gallery', '/api/membership/tiers', '/api/account', '/api/account/create',
  '/api/membership/purchase', '/api/diamonds/purchase', '/api/credit', '/api/gacha/pools', '/api/gacha/pull',
  '/api/costume', '/api/costume/equip', '/api/costume/grant-all', '/api/settings/ai', '/api/admin/dashboard',
  '/api/scenario/index', '/api/story/judge', '/api/cards/meta', '/api/cards/all', '/api/cards/collection',
  '/api/cards/summary', '/api/cards/pack', '/api/cards/craft', '/api/cards/decks', '/api/cards/deck/starter',
  '/api/cards/deck/save', '/api/battle/start', '/api/battle/state', '/api/battle/action', '/api/battle/end-turn',
  '/api/battle/concede', '/api/session', '/api/rewards/daily', '/api/rewards/status', '/api/story/progress'
]);
// 需要 sessionId 的外传动作（POST）
const SESSION_ACTIONS = new Set([
  '/api/advance', '/api/strategy', '/api/mode', '/api/chat', '/api/battle', '/api/ending', '/api/reset-battle', '/api/restart'
]);
// 不改变任何持久化状态的 POST
const READ_ONLY_POSTS = new Set(['/api/story/judge']);

const demoToolsDisabled = (res) => sendError(res, 403, '演示工具已关闭。', 'DEMO_TOOLS_DISABLED');

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
    const sid = checkId(url.searchParams.get('sessionId'), '存档');
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
    const account = getAccount(url.searchParams.get('playerId'));
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    const grant = grantDailyCredits(account);
    if (grant?.granted > 0) markDirty();
    return sendJson(res, 200, { ok: true, account: publicAccount(account), membership: getMembershipInfo(account) });
  }

  if (req.method === 'POST' && url.pathname === '/api/account/create') {
    const body = await readJson(req);
    ensureCapacity(playerAccounts, MAX_ACCOUNTS);
    const account = createPlayerAccount(body.playerName || '旅行者');
    // demo 模式：发放起始资源，确保进入即可体验召唤（无需真实支付）
    if (process.env.AI_MODE !== 'openai') {
      account.credits += 600;
      account.diamonds += 300;
    }
    account.updatedAt = Date.now();
    playerAccounts.set(account.id, account);
    account._meter = createCreditMeter(account);
    return sendJson(res, 201, { ok: true, account: publicAccount(account), message: '账户创建成功' });
  }

  if (req.method === 'POST' && url.pathname === '/api/membership/purchase') {
    if (!DEMO_TOOLS) return demoToolsDisabled(res);
    const body = await readJson(req);
    const account = getAccount(body.playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    const result = purchaseMembership(account, body.tierId);
    if (result.ok && account._meter) {
      // 契约 K-4：只把本次实际发放的 Credit 记进 meter（会员仍有效、当天已发过时为 0）
      const tier = MEMBERSHIP_TIERS.find((t) => t.id === body.tierId);
      addCredit(account._meter, result.granted ?? tier?.dailyCredit ?? 0, 'membership_daily');
    }
    trimPurchaseHistory(account);
    trackSession(analyticsStore, account.id, 'membership_purchase');
    return sendJson(res, result.ok ? 200 : 400, withPublicAccount(result));
  }

  if (req.method === 'POST' && url.pathname === '/api/diamonds/purchase') {
    if (!DEMO_TOOLS) return demoToolsDisabled(res);
    const body = await readJson(req);
    const account = getAccount(body.playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    const result = purchaseDiamonds(account, body.packId);
    trimPurchaseHistory(account);
    trackSession(analyticsStore, account.id, 'diamond_purchase');
    return sendJson(res, result.ok ? 200 : 400, withPublicAccount(result));
  }

  // ═══ Credit 计量 ═══
  if (req.method === 'GET' && url.pathname === '/api/credit') {
    const account = getAccount(url.searchParams.get('playerId'));
    if (!account || !account._meter) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    return sendJson(res, 200, { ok: true, meter: getMeterStatus(account._meter), costs: CREDIT_COSTS });
  }

  // ═══ 抽卡系统 ═══
  if (req.method === 'GET' && url.pathname === '/api/gacha/pools') {
    return sendJson(res, 200, {
      ok: true,
      characters: CHARACTER_POOL,
      costumes: COSTUME_POOL,
      rates: GACHA_RATES,
      pity: PITY_THRESHOLD,
      // 召唤价格（Credit 或钻石）与重复补偿（按稀有度折成钻石）
      costs: GACHA_COSTS,
      duplicateCompensation: DUPLICATE_COMPENSATION,
      // 主线正式入队的章节：通关该章自动获得这位女主（POST /api/story/progress）
      heroineJoins: HEROINE_JOIN_CHAPTERS
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/gacha/pull') {
    const body = await readJson(req);
    const account = getAccount(body.playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    if (!account._meter) account._meter = createCreditMeter(account);
    // pullGacha 自己把抽到的条目记入 ownedCharacters / ownedCostumes（isNew 以这一抽之前为准），重复的折成钻石；
    // currency: 'diamonds' 用钻石支付，其余（含缺省）用 Credit
    const result = pullGacha(account, account._meter, body.pool || 'character', body.count || 1, { currency: body.currency });
    if (!result.ok) return sendJson(res, 400, result);
    trackSession(analyticsStore, account.id, 'gacha_pull');
    return sendJson(res, 200, { ...result, account: publicAccount(account) });
  }

  // ═══ 换衣系统 ═══
  if (req.method === 'GET' && url.pathname === '/api/costume') {
    const account = getAccount(url.searchParams.get('playerId'));
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
    const account = getAccount(body.playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    // equipCostume 自己处理 'default'/空值（恢复默认服装），并校验角色与服装归属
    const result = equipCostume(account, body.characterId, String(body.costumeId ?? ''));
    if (result.ok && result.equipped?.costumeId) {
      const parts = String(body.costumeId).split('_');
      const costumeType = parts[parts.length - 1];
      const branch = BRANCH_SCENES[costumeType] || null;
      result.branchScene = branch;
      trackSession(analyticsStore, account.id, 'costume_equip');
    }
    return sendJson(res, result.ok ? 200 : 400, withPublicAccount(result));
  }

  // 测试专用：一键发放全部角色与服装
  if (req.method === 'POST' && url.pathname === '/api/costume/grant-all') {
    if (!DEMO_TOOLS) return demoToolsDisabled(res);
    const body = await readJson(req);
    const account = getAccount(body.playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    account.ownedCharacters = CHARACTER_POOL.map((c) => c.id);
    account.ownedCostumes = COSTUME_POOL.map((c) => c.id);
    return sendJson(res, 200, { ok: true, characters: account.ownedCharacters.length, costumes: account.ownedCostumes.length });
  }

  // ═══ 玩出来的钻石（game/rewards.mjs；契约 R-1、R-2）═══
  if (req.method === 'GET' && url.pathname === '/api/rewards/status') {
    const account = getAccount(url.searchParams.get('playerId'));
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    return sendJson(res, 200, { ok: true, ...getRewardStatus(account), rules: REWARD_RULES });
  }

  if (req.method === 'POST' && url.pathname === '/api/rewards/daily') {
    const body = await readJson(req);
    const account = getAccount(body.playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    const result = claimDaily(account);
    if (result.granted) trackSession(analyticsStore, account.id, 'daily_reward');
    return sendJson(res, 200, {
      ok: true,
      ...result,
      message: result.granted ? `签到成功：+${result.diamonds} 钻石（连续 ${result.streak} 天）。` : '今天已经签到过了，明天再来。',
      account: publicAccount(account)
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/story/progress') {
    const body = await readJson(req);
    const account = getAccount(body.playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    const chapterId = typeof body.chapterId === 'string' ? body.chapterId : '';
    if (!CHAPTER_ID_PATTERN.test(chapterId) || !storyChapterIds().has(chapterId)) {
      return sendError(res, 400, '没有这一章。', 'UNKNOWN_CHAPTER');
    }
    const result = recordChapterClear(account, chapterId);
    if (!result.alreadyCleared) trackSession(analyticsStore, account.id, 'story_chapter_clear');
    return sendJson(res, 200, { ok: true, chapterId, ...result, account: publicAccount(account) });
  }

  // ═══ AI 设置 ═══
  if (req.method === 'GET' && url.pathname === '/api/settings/ai') {
    // 只读：没有账户（或尚未建号）时返回默认设置，不写入任何状态。
    // B19：按玩家路由实现之前不下发模型预设（models 为空）；current 是所有玩家实际共用的 AI（与 /api/meta 的 ai 相同）。
    const playerId = checkId(url.searchParams.get('playerId'));
    const settings = (playerId && playerSettings.get(playerId)) || createDefaultSettings();
    return sendJson(res, 200, {
      ok: true,
      perPlayerRouting: PER_PLAYER_ROUTING,
      current: publicMeta().ai,
      settings,
      models: PER_PLAYER_ROUTING ? AI_MODELS : [],
      active: PER_PLAYER_ROUTING ? getActiveModel(settings) : null
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/settings/ai') {
    const body = await readJson(req);
    const account = getAccount(body.playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    if (!PER_PLAYER_ROUTING) {
      return sendError(res, 409, '按玩家切换模型尚未开放：所有玩家共用服务器配置的 AI。', 'PER_PLAYER_ROUTING_UNAVAILABLE');
    }
    const settings = playerSettings.get(account.id) || createDefaultSettings();
    const result = switchModel(settings, body.modelId);
    if (result.ok) playerSettings.set(account.id, settings);
    return sendJson(res, result.ok ? 200 : 400, { ...result, settings });
  }

  // ═══ 后台管理仪表板 ═══
  if (req.method === 'GET' && url.pathname === '/api/admin/dashboard') {
    // 契约 K-2：口令只认请求头 x-admin-key（?key= 不再生效）
    if (!ADMIN_ENABLED) return sendError(res, 404, '后台未启用。', 'ADMIN_DISABLED');
    if (!adminKeyMatches(req.headers['x-admin-key'])) return sendError(res, 403, '管理密码错误。', 'FORBIDDEN');
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

  // ═══ 主线 · 亚克篇：自由输入判定（docs/STORY-ENGINE.md §8） ═══
  if (req.method === 'POST' && url.pathname === '/api/story/judge') {
    const body = await readJson(req);
    const judgement = await judgeStoryInput(body, { acquire: () => acquireAiSlot(clientIp(req)) });
    return sendJson(res, 200, { ok: true, judgement });
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
    const account = getCardAccount(url.searchParams.get('playerId'));
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    return sendJson(res, 200, { ok: true, ...getCollection(account) });
  }

  if (req.method === 'GET' && url.pathname === '/api/cards/summary') {
    const account = getCardAccount(url.searchParams.get('playerId'));
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    return sendJson(res, 200, { ok: true, summary: getCardAccountSummary(account) });
  }

  if (req.method === 'POST' && url.pathname === '/api/cards/pack') {
    const body = await readJson(req);
    const account = getCardAccount(body.playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    const count = body.count >= 10 ? 10 : 1;
    const result = openPacks(account, count);
    trackSession(analyticsStore, account.id, 'card_pack_open');
    return sendJson(res, result.ok ? 200 : 400, withPublicAccount(result));
  }

  if (req.method === 'POST' && url.pathname === '/api/cards/craft') {
    const body = await readJson(req);
    const account = getCardAccount(body.playerId);
    if (!account) return sendError(res, 404, '账户不存在。', 'NO_ACCOUNT');
    const result = craftCard(account, body.cardId);
    return sendJson(res, result.ok ? 200 : 400, withPublicAccount(result));
  }

  if (req.method === 'GET' && url.pathname === '/api/cards/decks') {
    const account = getCardAccount(url.searchParams.get('playerId'));
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
    const account = getCardAccount(body.playerId);
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
    const account = getCardAccount(body.playerId);
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
    // 先后手由引擎抛硬币决定（B12）：对手先手时先跑完它的第一回合，玩家拿到的总是自己的回合
    let aiActions = [];
    if (state.activePlayer === 'opponent' && state.phase !== 'gameover') {
      runAITurn(state);
      aiActions = state.aiActions || [];
    }
    state.updatedAt = Date.now();
    battles.set(account.id, state);
    trackSession(analyticsStore, account.id, 'battle_start');
    return sendJson(res, 201, { ok: true, state: sanitizeBattle(state), aiActions, reward: battleReward(state) });
  }

  if (req.method === 'GET' && url.pathname === '/api/battle/state') {
    const state = getBattle(url.searchParams.get('playerId'));
    if (!state) return sendError(res, 404, '没有进行中的对局。', 'NO_BATTLE');
    return sendJson(res, 200, { ok: true, state: sanitizeBattle(state), reward: battleReward(state) });
  }

  if (req.method === 'POST' && url.pathname === '/api/battle/action') {
    const body = await readJson(req);
    const state = getBattle(body.playerId);
    if (!state) return sendError(res, 404, '没有进行中的对局。', 'NO_BATTLE');
    const a = body.action && typeof body.action === 'object' ? body.action : {};
    try {
      if (a.type === 'play') playCard(state, 'player', a.handUid, a.target ?? null);
      else if (a.type === 'attack') attack(state, 'player', a.attackerUid, a.targetUid);
      else if (a.type === 'evolve') evolve(state, 'player', a.uid);
      else if (a.type === 'cancel') cancelTarget(state);
      else return sendError(res, 400, '未知动作。', 'BAD_ACTION');
    } catch (err) {
      const described = describeError(err);
      if (described.status >= 500) console.error('[POST] /api/battle/action:', err);
      return sendError(res, 400, described.status >= 500 ? '非法动作。' : (err.message || '非法动作。'), 'ILLEGAL_ACTION');
    }
    const reward = settleBattleReward(body.playerId, state);
    if (state.phase === 'gameover' && reward) trackSession(analyticsStore, String(body.playerId), 'battle_win');
    return sendJson(res, 200, { ok: true, state: sanitizeBattle(state), reward });
  }

  if (req.method === 'POST' && url.pathname === '/api/battle/end-turn') {
    const body = await readJson(req);
    const state = getBattle(body.playerId);
    if (!state) return sendError(res, 404, '没有进行中的对局。', 'NO_BATTLE');
    if (state.phase === 'gameover') return sendJson(res, 200, { ok: true, state: sanitizeBattle(state), aiActions: [], reward: battleReward(state) });
    if (state.phase === 'awaitingTarget') cancelTarget(state);
    endTurn(state);                 // 玩家 → 对手回合
    runAITurn(state);               // AI 行动并结束回合 → 回到玩家
    const aiActions = state.aiActions || [];
    const reward = settleBattleReward(body.playerId, state);
    if (state.phase === 'gameover') trackSession(analyticsStore, String(body.playerId), state.winner === 'player' ? 'battle_win' : 'battle_lose');
    return sendJson(res, 200, { ok: true, state: sanitizeBattle(state), aiActions, reward });
  }

  if (req.method === 'POST' && url.pathname === '/api/battle/concede') {
    const body = await readJson(req);
    const state = getBattle(body.playerId);
    if (!state) return sendError(res, 404, '没有进行中的对局。', 'NO_BATTLE');
    if (state.phase !== 'gameover') {
      // 契约 K-8：投降写明结束原因，并在日志末尾追加一行
      state.phase = 'gameover';
      state.winner = 'opponent';
      state.endReason = 'concede';
      state.pending = null;
      if (!Array.isArray(state.log)) state.log = [];
      state.log.push({ turn: state.turn, msg: '玩家投降。' });
      if (state.log.length > 200) state.log.splice(0, state.log.length - 200);
      trackSession(analyticsStore, String(body.playerId), 'battle_concede');
    }
    return sendJson(res, 200, { ok: true, state: sanitizeBattle(state), reward: battleReward(state) });
  }

  if (req.method === 'POST' && url.pathname === '/api/session') {
    const body = await readJson(req);
    ensureCapacity(sessions, MAX_SESSIONS);
    const state = createInitialState(body.playerName);
    sessions.set(state.id, state);
    trackDailyActive(analyticsStore, state.playerName);
    trackSession(analyticsStore, state.id, 'new_session');
    return sendJson(res, 201, { ok: true, state: sanitizeState(state), meta: publicMeta() });
  }

  const sessionMatch = url.pathname.match(/^\/api\/session\/([^/]+)$/);
  if (sessionMatch) {
    if (req.method !== 'GET') return sendError(res, 405, '不支持的请求方法。', 'METHOD_NOT_ALLOWED');
    const state = getSession(sessionMatch[1]);
    return sendJson(res, 200, { ok: true, state: sanitizeState(state), meta: publicMeta() });
  }

  if (!SESSION_ACTIONS.has(url.pathname)) {
    if (API_ROUTES.has(url.pathname) || url.pathname.startsWith('/api/scenario/chapter/')) {
      return sendError(res, 405, '不支持的请求方法。', 'METHOD_NOT_ALLOWED');
    }
    return sendError(res, 404, 'API不存在。', 'NOT_FOUND');
  }

  if (req.method !== 'POST') {
    return sendError(res, 405, '不支持的请求方法。', 'METHOD_NOT_ALLOWED');
  }

  const body = await readJson(req);
  const sessionId = checkId(body.sessionId, '存档');
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
      if (!CHARACTERS[characterId]) throw new Error('未知角色。');
      // 先查场景与次数上限（B4：战后 3 次），超过上限直接 400，不去请求模型
      assertChatAllowed(state, characterId, message);
      let outcome;
      if (state.dialogueMode === 'story') {
        outcome = { ...fallbackReply(state, characterId, message), source: 'story' };
      } else {
        outcome = await generateReplyWithLimit(req, state, characterId, message);
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

    // 余下只有 /api/restart（SESSION_ACTIONS 已过滤）
    const replacement = createInitialState(state.playerName);
    sessions.delete(sessionId);
    sessions.set(replacement.id, replacement);
    return sendJson(res, 200, { ok: true, state: sanitizeState(replacement), meta: publicMeta() });
  });
}

// ─── 静态文件 ───

/** URL 路径 → public/ 下的绝对路径；解码失败、含 NUL、越界时返回 null。 */
function safeStaticPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const requested = decoded === '/' ? '/index.html' : decoded;
  const normalized = path.normalize(requested).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = path.resolve(PUBLIC_DIR, `.${path.sep}${normalized}`);
  if (fullPath !== PUBLIC_DIR && !fullPath.startsWith(PUBLIC_DIR + path.sep)) return null;
  return fullPath;
}

async function statFile(filePath) {
  try {
    const stats = await fs.promises.stat(filePath);
    return stats.isFile() ? stats : null;
  } catch {
    return null;
  }
}

const NOT_FOUND_HTML = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>页面不存在 · ${GAME_TITLE}</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px 16px;
    background: radial-gradient(circle at 50% 20%, #1b1440 0%, #06050f 70%); color: #f7f2ff;
    font-family: system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; }
  main { width: 100%; max-width: 440px; text-align: center; padding: 32px 24px; border-radius: 20px;
    background: rgba(14, 12, 30, 0.86); border: 1px solid rgba(215, 200, 245, 0.16); }
  .code { margin: 0; font-size: .8rem; letter-spacing: .3em; padding-left: .3em; color: #c096ff; }
  h1 { margin: 12px 0 8px; font-size: 1.5rem; }
  p { margin: 0 0 24px; color: #b0a8c8; line-height: 1.6; }
  a { display: inline-block; min-height: 44px; padding: 12px 24px; border-radius: 999px; color: #06050f;
    background: #c096ff; font-weight: 600; text-decoration: none; }
  a:focus-visible { outline: 3px solid #6edcff; outline-offset: 3px; }
</style>
</head>
<body>
<main>
  <p class="code">404</p>
  <h1>这条轨道上没有站台</h1>
  <p>页面不存在，可能是链接写错了或文件已经移走。</p>
  <a href="/">返回标题页</a>
</main>
</body>
</html>
`;

function sendNotFound(req, res) {
  const wantsHtml = /text\/html/i.test(String(req.headers.accept || ''));
  if (!wantsHtml) return sendError(res, 404, '文件不存在。', 'NOT_FOUND');
  res.writeHead(404, securityHeaders('text/html; charset=utf-8'));
  res.end(req.method === 'HEAD' ? undefined : NOT_FOUND_HTML);
}

function isNotModified(req, etag, mtimeMs) {
  const ifNoneMatch = req.headers['if-none-match'];
  if (ifNoneMatch) {
    const bare = etag.replace(/^W\//, '');
    return String(ifNoneMatch).split(',').some((tag) => {
      const t = tag.trim();
      return t === '*' || t.replace(/^W\//, '') === bare;
    });
  }
  const since = Date.parse(String(req.headers['if-modified-since'] || ''));
  if (Number.isNaN(since)) return false;
  return Math.floor(mtimeMs / 1000) * 1000 <= since;
}

// /story、/cards 这类无扩展名的单段路径，若存在同名 .html 页面就 301 过去（只允许单段，避免 //host 之类的开放跳转）
const PAGE_ALIAS = /^\/([A-Za-z0-9_-]+)\/?$/;

async function serveStatic(req, res, url) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    return sendError(res, 405, '不支持的请求方法。', 'METHOD_NOT_ALLOWED');
  }
  const filePath = safeStaticPath(url.pathname);
  if (!filePath) return sendError(res, 400, '路径无效。', 'BAD_PATH');
  const stats = await statFile(filePath);
  if (!stats) {
    const alias = url.pathname.match(PAGE_ALIAS);
    if (alias && await statFile(path.join(PUBLIC_DIR, `${alias[1]}.html`))) {
      res.writeHead(301, { ...securityHeaders('text/plain; charset=utf-8'), location: `/${alias[1]}.html${url.search}` });
      return res.end();
    }
    return sendNotFound(req, res);
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  const headers = securityHeaders(contentType);
  // URL 没有版本号，所以不给 max-age：每次都带 ETag 向服务器校验，未修改时只回 304
  headers['cache-control'] = 'no-cache';
  headers.etag = `W/"${stats.size}-${Math.floor(stats.mtimeMs)}"`;
  headers['last-modified'] = stats.mtime.toUTCString();
  const compressible = COMPRESSIBLE_EXT.has(ext);
  if (compressible) headers.vary = 'Accept-Encoding';

  if (isNotModified(req, headers.etag, stats.mtimeMs)) {
    res.writeHead(304, headers);
    return res.end();
  }

  const gzip = compressible && /\bgzip\b/i.test(String(req.headers['accept-encoding'] || ''));
  if (gzip) headers['content-encoding'] = 'gzip';
  else headers['content-length'] = stats.size;
  res.writeHead(200, headers);
  if (req.method === 'HEAD') return res.end();
  // pipeline：客户端中途断开时会销毁读流并关闭文件句柄（原来的 .pipe() 会泄漏句柄）
  const done = (error) => { if (error) res.destroy(); };
  if (gzip) pipeline(fs.createReadStream(filePath), zlib.createGzip(), res, done);
  else pipeline(fs.createReadStream(filePath), res, done);
}

const server = http.createServer(async (req, res) => {
  let pathname = '';
  try {
    // 不再用 Host 头拼基准 URL：畸形 Host（如「[」）曾让 new URL 抛错并打崩整个进程
    const url = new URL(req.url || '/', 'http://localhost');
    pathname = url.pathname;
    if (pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
      // 成功的写操作（以及读档刷新了 updatedAt）才排队存盘；被拒绝的请求（坏 id、404、503…）不触发写盘
      const mutating = req.method === 'POST' ? !READ_ONLY_POSTS.has(pathname) : pathname.startsWith('/api/session/');
      if (mutating && res.statusCode < 400) markDirty();
    } else {
      await serveStatic(req, res, url);
    }
  } catch (error) {
    const { status, message, code } = describeError(error);
    if (status >= 500) console.error(`[${req.method}] ${pathname || req.url}:`, error);
    if (!res.headersSent) sendError(res, status, message, code);
    else res.destroy();
    // 引擎的规则错误（REQUEST_ERROR）抛出前可能已经改动了部分状态，一并存盘
    if (code === 'REQUEST_ERROR' && pathname.startsWith('/api/') && req.method === 'POST' && !READ_ONLY_POSTS.has(pathname)) markDirty();
  }
});

restoreState(saveStore.load());
pruneExpired();

const cleanup = setInterval(() => pruneExpired(), 30 * 60 * 1000);
cleanup.unref();

// 只记日志、不退出：单个请求里的意外错误不应带走全部在线玩家的状态
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (error) => {
  console.error('[uncaughtException]', error);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n端口 ${PORT} 被占用，可用 PORT=xxxx 换端口（例如 PORT=4174 npm start）。\n`);
  } else if (error.code === 'EACCES') {
    console.error(`\n没有权限监听端口 ${PORT}，可用 PORT=xxxx 换一个大于 1024 的端口。\n`);
  } else {
    console.error('[server error]', error);
  }
  // 启动阶段监听失败才退出；运行中的偶发错误（如 accept 失败）只记日志
  if (!server.listening) process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`\n${GAME_TITLE}`);
  console.log(`Web: http://${HOST}:${PORT}`);
  console.log(`AI mode: ${AI_CONFIG.mode} (${AI_CONFIG.model})`);
  if (saveStore.enabled) {
    const where = path.relative(__dirname, saveStore.file) || saveStore.file;
    console.log(`存档：${where.startsWith('..') ? saveStore.file : where}（外传 ${sessions.size} 个、账户 ${playerAccounts.size} 个、对局 ${battles.size} 个；PERSIST=0 可关闭）`);
  } else {
    console.log(`存档：未开启（${persistConfig.reason}），重启后所有进度都会清空`);
  }
  console.log(`后台：${ADMIN_ENABLED ? (process.env.ADMIN_KEY === undefined ? '已开启（默认口令，可用 ADMIN_KEY 修改）' : '已开启（ADMIN_KEY）') : '已关闭（ADMIN_KEY 为空）'}；演示工具：${DEMO_TOOLS ? '开启' : '关闭'}\n`);
});

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n${signal}: shutting down...`);
  // 先同步写盘，再关服务器：即使后面被强制结束，存档也已经落地
  saveStore.flushSync();
  server.close(() => process.exit(0));
  server.closeIdleConnections?.();
  setTimeout(() => process.exit(0), 3000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
// Windows 上直接关闭控制台窗口会收到 SIGHUP
process.on('SIGHUP', () => shutdown('SIGHUP'));
