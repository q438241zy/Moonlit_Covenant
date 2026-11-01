/**
 * 技能书（剧本/README_技能五色與強化設計.md，下称技能稿；核#14 核可，设06 v0.4 §19–§23）
 *
 * 五色：白 < 绿 < 蓝（剧情给）< 暮紫 < 赤月（只从「秘技召唤」抽到）。每张技能绑定一个角色，+0 到 +10，
 * 效值 I 按颜色的效值带直线成长（白+10 的 1.30 永远低于绿+0 的 1.40）。数据在 game/skills.json（只在服务器读，
 * 对外一律经过 publicSkillbook / publicSkill 按主线进度遮挡：还没入队的角色的技能是剪影）。
 *
 * account.skillbook（技能稿 8.2）：
 *   levels      技能 id → 强化等级（剧情技能由 rewards.chaptersCleared 推出是否拥有，这里只存等级）
 *   owned       转蛋技能 id → { at }（抽到才有）
 *   materials   五色材料：白「练习手记」、绿「实战手记」、蓝「源律残章」只靠玩；暮紫、赤月秘页只来自秘技召唤
 *   tickets     秘技召唤券（幕界 08/15/21/25 各 5 张、正式 30 通关 10 张，首通时发；旧存档按已通关章节补发）
 *   loadout     角色 → [①本命格, ②战技格, ③绝技格]；①只装剧情技能，②剧情或暮紫，③任何颜色（唯一能装赤月的格）
 *   party       技能战上场的两位女主（亚克固定在场）；oath 亚克誓约槽里的女主（她的个人章通关后才能装）
 *   gacha       秘技召唤的保底计数与定轨（game/skill-gacha.mjs）
 *   granted     已经发过剧情材料与召唤券的章节（首通发一次；补发也只发一次）
 *   commissions 委托板的每日 / 每周胜场（game/skill-battle.mjs）
 * 所有函数只改传入的 account，不做 I/O；旧存档没有 skillbook 时 ensureSkillbook 会建一份并补发。
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { clearedChaptersOf, highestClearedChapter, SEALED_TEXT } from './gacha.mjs';

export const SKILL_DATA = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'skills.json'), 'utf8'));
export const TIERS = SKILL_DATA.tiers;
export const TIER_ORDER = ['white', 'green', 'blue', 'purple', 'red'];
export const STORY_TIERS = ['white', 'green', 'blue'];
export const GACHA_TIERS = ['purple', 'red'];
export const SKILLS = SKILL_DATA.skills;
export const OWNERS = SKILL_DATA.owners;
export const OWNER_IDS = Object.keys(OWNERS);
export const HEROINE_IDS = OWNER_IDS.filter((id) => id !== 'hero');
const SKILL_BY_ID = new Map(SKILLS.map((s) => [s.id, s]));
const MAX_LEVEL = SKILL_DATA.enhance.maxLevel;
const MAX_LOG = 30;

const chapterNo = (id) => {
  const m = /^ch(\d{3})$/.exec(String(id ?? ''));
  return m ? Number(m[1]) : Infinity;
};
/** 这一章（或主线更后面的任何一章）已经通关；ch000 视为一开始就开放（亚克从序章就在）。 */
export const reached = (chapterId, highest) => chapterNo(chapterId) === 0 || highest >= chapterNo(chapterId);

export function skillById(id) { return SKILL_BY_ID.get(id) || null; }
export function skillsOf(owner) { return SKILLS.filter((s) => s.owner === owner); }

/** 效值 I：颜色的起点 + 每级增量 × 等级（技能稿 2.2）。 */
export function effectiveIndex(skillOrTier, level = 0) {
  const tier = typeof skillOrTier === 'string' ? skillOrTier : skillOrTier.tier;
  const [base, step] = TIERS[tier].index;
  return Math.round((base + step * clampLevel(level)) * 100) / 100;
}
export const clampLevel = (level) => Math.max(0, Math.min(MAX_LEVEL, Math.floor(Number(level) || 0)));
/** MP、冷却与共鸣消耗（+5 里程碑：白 MP 归零、绿 MP 8、蓝冷却 1、紫冷却 2、红共鸣 40）。 */
export function skillCosts(skill, level = 0) {
  const tier = TIERS[skill.tier];
  const m5 = clampLevel(level) >= 5 ? SKILL_DATA.enhance.milestone5[skill.tier] : {};
  return {
    mp: m5.mp ?? tier.mp,
    cd: m5.cd ?? tier.cd,
    resonance: skill.tier === 'red' ? (m5.resonance ?? tier.resonance) : 0,
  };
}
/** 升到下一级要多少该色材料（已满级为 null）。 */
export function enhanceCost(level) {
  const lv = clampLevel(level);
  return lv >= MAX_LEVEL ? null : SKILL_DATA.enhance.cost[lv];
}

/** 角色是否已经入队（亚克一开始就在；女主看 skills.json 的 join，与卡池的 joinChapter 一致）。 */
export function ownerJoined(owner, cleared) {
  const o = OWNERS[owner];
  return Boolean(o) && reached(o.join, highestClearedChapter(cleared));
}
/** 她的个人章（或个人段）已经通关：合击与誓约技的条件。 */
export function personalCleared(owner, cleared) {
  const o = OWNERS[owner];
  return Boolean(o?.personal) && reached(o.personal, highestClearedChapter(cleared));
}

function blankBook() {
  return {
    version: 1, levels: {}, owned: {}, materials: { white: 0, green: 0, blue: 0, purple: 0, red: 0 }, tickets: 0,
    loadout: {}, party: [], oath: null,
    gacha: { sinceRed: 0, sinceEpic: 0, target: null, guaranteed: false, pulls: 0 },
    granted: [], commissions: { day: null, dailyWins: 0, week: null, challengeWins: 0, total: 0 }, log: [],
  };
}
const nonNeg = (v) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);

/** 规整 account.skillbook（新账户、旧存档、被改坏的数据都能用），并补发已通关章节的剧情材料与召唤券。 */
export function ensureSkillbook(account, now = Date.now()) {
  const raw = account.skillbook && typeof account.skillbook === 'object' && !Array.isArray(account.skillbook) ? account.skillbook : {};
  const book = blankBook();
  for (const [id, lv] of Object.entries(raw.levels || {})) if (SKILL_BY_ID.has(id)) book.levels[id] = clampLevel(lv);
  for (const [id, v] of Object.entries(raw.owned || {})) if (SKILL_BY_ID.get(id)?.source === 'gacha') book.owned[id] = { at: Number.isFinite(v?.at) ? v.at : now };
  for (const tier of TIER_ORDER) book.materials[tier] = nonNeg(raw.materials?.[tier]);
  book.tickets = nonNeg(raw.tickets);
  if (raw.loadout && typeof raw.loadout === 'object') {
    for (const owner of OWNER_IDS) if (Array.isArray(raw.loadout[owner])) book.loadout[owner] = raw.loadout[owner].slice(0, 3).map((x) => (typeof x === 'string' ? x : null));
  }
  book.party = Array.isArray(raw.party) ? raw.party.filter((id) => HEROINE_IDS.includes(id)).slice(0, 2) : [];
  book.oath = HEROINE_IDS.includes(raw.oath) ? raw.oath : null;
  const g = raw.gacha || {};
  book.gacha = { sinceRed: nonNeg(g.sinceRed), sinceEpic: nonNeg(g.sinceEpic), target: SKILL_BY_ID.get(g.target)?.tier === 'red' ? g.target : null, guaranteed: g.guaranteed === true, pulls: nonNeg(g.pulls) };
  book.granted = Array.isArray(raw.granted) ? [...new Set(raw.granted.filter((id) => /^ch\d{3}$/.test(id)))] : [];
  const c = raw.commissions || {};
  book.commissions = { day: typeof c.day === 'string' ? c.day : null, dailyWins: nonNeg(c.dailyWins), week: typeof c.week === 'string' ? c.week : null, challengeWins: nonNeg(c.challengeWins), total: nonNeg(c.total) };
  book.log = Array.isArray(raw.log) ? raw.log.filter((e) => e && typeof e.type === 'string').slice(-MAX_LOG) : [];
  account.skillbook = book;
  syncSkillRewards(account, now);
  fixLoadouts(account);
  return book;
}

export function logSkill(book, entry, now = Date.now()) {
  book.log.push({ ...entry, at: now });
  if (book.log.length > MAX_LOG) book.log.splice(0, book.log.length - MAX_LOG);
}

/**
 * 首通发的剧情材料与召唤券（技能稿 3.1、3.2）：每一章首通白 6、绿 3、蓝 1；幕界章（08/15/21/25/30）蓝另 +5；
 * 个人章（20、21、23–29）蓝另 +5；召唤券：幕界 08/15/21/25 各 5 张、30 通关 10 张。按 rewards.chaptersCleared 补发，
 * 每章只发一次（记在 skillbook.granted）。返回这一次新发的合计。
 */
export function syncSkillRewards(account, now = Date.now()) {
  const book = account.skillbook;
  const cleared = clearedChaptersOf(account);
  const sm = SKILL_DATA.storyMaterials;
  const total = { white: 0, green: 0, blue: 0, tickets: 0, chapters: [] };
  for (const ch of cleared) {
    if (book.granted.includes(ch)) continue;
    book.granted.push(ch);
    const add = { ...sm.chapterFirstClear };
    if (sm.actBonus.chapters.includes(ch)) add.blue += sm.actBonus.blue;
    if (sm.personalBonus.chapters.includes(ch)) add.blue += sm.personalBonus.blue;
    for (const tier of STORY_TIERS) { book.materials[tier] += add[tier] || 0; total[tier] += add[tier] || 0; }
    const tickets = SKILL_DATA.tickets[ch] || 0;
    book.tickets += tickets;
    total.tickets += tickets;
    total.chapters.push(ch);
  }
  if (total.chapters.length) {
    logSkill(book, { type: 'story_grant', chapters: total.chapters, white: total.white, green: total.green, blue: total.blue, tickets: total.tickets }, now);
    fixLoadouts(account); // 新入队的女主、新解锁的技能：补上编成与委托板人选
  }
  return total;
}

/** 这个账户拥有的技能：已解锁的剧情技能（看首通记录）+ 抽到的转蛋技能。 */
export function ownsSkill(account, skill) {
  if (!skill) return false;
  if (skill.source === 'story') return reached(skill.unlock, highestClearedChapter(clearedChaptersOf(account)));
  return Boolean(account.skillbook?.owned?.[skill.id]);
}
export const levelOf = (account, id) => clampLevel(account.skillbook?.levels?.[id]);

/** 默认编成：①第一张剧情技能，②下一张剧情技能，③剩下最高的一张（红优先，其次紫、蓝）。 */
function defaultLoadout(account, owner) {
  const mine = skillsOf(owner).filter((s) => ownsSkill(account, s));
  const story = mine.filter((s) => s.source === 'story');
  if (!story.length) return null;
  const used = new Set();
  const pick = (list) => { const s = list.find((x) => !used.has(x.id)); if (s) used.add(s.id); return s?.id || null; };
  const s1 = pick(story);
  const s2 = pick([...mine.filter((s) => s.tier === 'purple'), ...story]);
  const rank = (s) => TIERS[s.tier].rank;
  const s3 = pick([...mine].sort((a, b) => rank(b) - rank(a)));
  return [s1, s2, s3];
}

/** 编成校验（技能稿 5.1）：返回错误信息或 null。 */
export function loadoutError(account, owner, slots) {
  if (!OWNERS[owner]) return '没有这个角色。';
  if (!Array.isArray(slots) || slots.length !== 3) return '要排满三个格子（可以留空②③）。';
  const seen = new Set();
  for (let i = 0; i < 3; i += 1) {
    const id = slots[i];
    if (id == null || id === '') { if (i === 0) return '①本命格不能空着。'; continue; }
    const s = skillById(id);
    if (!s || s.owner !== owner) return `「${s?.name || id}」不是这个角色的技能。`;
    if (!ownsSkill(account, s)) return `还没有「${s.name}」。`;
    if (seen.has(id)) return '同一张技能不能同时装在两格。';
    seen.add(id);
    if (!TIERS[s.tier].slots.includes(i + 1)) {
      return i === 0 ? '①本命格只能装剧情技能（白、绿、蓝）。' : '赤月只能装在③绝技格。';
    }
  }
  return null;
}

/** 把编成里失效的格子修好（抽到前的空格、入队后第一次编成）。 */
function fixLoadouts(account) {
  const book = account.skillbook;
  const cleared = clearedChaptersOf(account);
  for (const owner of OWNER_IDS) {
    if (!ownerJoined(owner, cleared)) continue;
    const cur = book.loadout[owner];
    if (!cur || loadoutError(account, owner, cur)) {
      const fixed = defaultLoadout(account, owner);
      if (fixed) book.loadout[owner] = fixed;
      else delete book.loadout[owner];
    } else if (cur.includes(null)) {
      // 空着的②③格：新解锁或新抽到的技能自动补上（不动玩家已经排好的格子）
      const used = new Set(cur.filter(Boolean));
      const spare = skillsOf(owner).filter((sk) => ownsSkill(account, sk) && !used.has(sk.id)).sort((a, b) => TIERS[b.tier].rank - TIERS[a.tier].rank);
      for (let i = 1; i < 3; i += 1) {
        if (cur[i]) continue;
        const pick = spare.find((sk) => TIERS[sk.tier].slots.includes(i + 1) && !used.has(sk.id));
        if (pick) { cur[i] = pick.id; used.add(pick.id); }
      }
    }
  }
  const joined = HEROINE_IDS.filter((id) => ownerJoined(id, cleared));
  const size = partySize(cleared);
  book.party = book.party.filter((id) => joined.includes(id)).slice(0, size);
  for (const id of joined) if (book.party.length < size && !book.party.includes(id)) book.party.push(id);
  if (book.oath && !personalCleared(book.oath, cleared)) book.oath = null;
}

/** 上场人数：正式05通关后两人委托（亚克＋一位），正式10通关后三人委托（技能稿 6.1）。 */
export function partySize(cleared) {
  const highest = highestClearedChapter(cleared);
  return highest >= 10 ? 2 : highest >= 5 ? 1 : 0;
}

export function equipSkills(account, owner, slots) {
  const book = ensureSkillbook(account);
  if (!ownerJoined(owner, clearedChaptersOf(account))) return { ok: false, code: 'NOT_JOINED', message: '她还没有入队，技能可以先抽、先强化，入队后再编成。' };
  const clean = (slots || []).slice(0, 3).map((x) => (typeof x === 'string' && x ? x : null));
  while (clean.length < 3) clean.push(null);
  const err = loadoutError(account, owner, clean);
  if (err) return { ok: false, code: 'BAD_LOADOUT', message: err };
  book.loadout[owner] = clean;
  return { ok: true, loadout: clean };
}

export function setParty(account, party, oath) {
  const book = ensureSkillbook(account);
  const cleared = clearedChaptersOf(account);
  const size = partySize(cleared);
  if (!size) return { ok: false, code: 'LOCKED', message: '通关正式第五章后开放委托板。' };
  const list = [...new Set((Array.isArray(party) ? party : []).filter((id) => HEROINE_IDS.includes(id)))];
  if (list.length !== Math.min(size, HEROINE_IDS.filter((id) => ownerJoined(id, cleared)).length)) return { ok: false, code: 'BAD_PARTY', message: `要选 ${size} 位已入队的女主。` };
  if (list.some((id) => !ownerJoined(id, cleared))) return { ok: false, code: 'NOT_JOINED', message: '只能选已经入队的女主。' };
  book.party = list;
  if (oath !== undefined) {
    if (oath === null || oath === '') book.oath = null;
    else if (!HEROINE_IDS.includes(oath) || !personalCleared(oath, cleared)) return { ok: false, code: 'OATH_LOCKED', message: '誓约槽要等她的个人章通关后才能装。' };
    else book.oath = oath;
  }
  return { ok: true, party: book.party, oath: book.oath };
}

/** 强化（技能稿 4.2）：花该色材料升一级，+1～+10。 */
export function enhanceSkill(account, skillId, now = Date.now()) {
  const book = ensureSkillbook(account, now);
  const s = skillById(skillId);
  if (!s) return { ok: false, code: 'UNKNOWN_SKILL', message: '没有这张技能。' };
  if (!ownsSkill(account, s)) return { ok: false, code: 'NOT_OWNED', message: `还没有「${s.name}」。` };
  const level = levelOf(account, s.id);
  const cost = enhanceCost(level);
  if (cost == null) return { ok: false, code: 'MAX_LEVEL', message: '已经是 +10。' };
  if (book.materials[s.tier] < cost) return { ok: false, code: 'NO_MATERIAL', message: `${SKILL_DATA.materials[s.tier].name}不足：+${level + 1} 需要 ${cost}（现有 ${book.materials[s.tier]}）。` };
  book.materials[s.tier] -= cost;
  book.levels[s.id] = level + 1;
  logSkill(book, { type: 'enhance', skill: s.id, level: level + 1, cost }, now);
  return { ok: true, skill: s.id, level: level + 1, cost, index: effectiveIndex(s, level + 1), materials: { ...book.materials } };
}

/** 上转（技能稿 4.3）：3 白→1 绿、3 绿→1 蓝、6 暮紫→1 赤月；没有任何向下转换。 */
export function convertMaterials(account, from, to, times = 1, now = Date.now()) {
  const book = ensureSkillbook(account, now);
  const rate = SKILL_DATA.convert[`${from}>${to}`];
  if (!rate) return { ok: false, code: 'NO_CONVERSION', message: '只能上转：白→绿、绿→蓝、暮紫→赤月。' };
  const n = Math.max(1, Math.min(999, Math.floor(Number(times) || 1)));
  if (book.materials[from] < rate * n) return { ok: false, code: 'NO_MATERIAL', message: `${SKILL_DATA.materials[from].name}不足：需要 ${rate * n}。` };
  book.materials[from] -= rate * n;
  book.materials[to] += n;
  logSkill(book, { type: 'convert', from, to, times: n }, now);
  return { ok: true, materials: { ...book.materials } };
}

/** 兑换（技能稿 4.3）：40 暮紫换一张自选紫（池内、还没拥有）；50 暮紫或 10 赤月换一张召唤券。不提供自选红。 */
export function exchangeSkill(account, kind, skillId, now = Date.now()) {
  const book = ensureSkillbook(account, now);
  const ex = SKILL_DATA.exchange;
  if (kind === 'pickPurple') {
    const s = skillById(skillId);
    if (!s || s.tier !== 'purple') return { ok: false, code: 'BAD_PICK', message: '只能换暮紫技能。' };
    if (!ownerJoined(s.owner, clearedChaptersOf(account))) return { ok: false, code: 'NOT_IN_POOL', message: '她还没有入队，这张技能还不在池里。' };
    if (book.owned[s.id]) return { ok: false, code: 'OWNED', message: '已经拥有。' };
    if (book.materials.purple < ex.pickPurple.purple) return { ok: false, code: 'NO_MATERIAL', message: `暮紫秘页不足：需要 ${ex.pickPurple.purple}。` };
    book.materials.purple -= ex.pickPurple.purple;
    book.owned[s.id] = { at: now };
    logSkill(book, { type: 'exchange', kind, skill: s.id }, now);
    fixLoadouts(account);
    return { ok: true, skill: s.id, materials: { ...book.materials } };
  }
  if (kind === 'ticketFromPurple' || kind === 'ticketFromRed') {
    const [tier, cost] = Object.entries(ex[kind])[0];
    if (book.materials[tier] < cost) return { ok: false, code: 'NO_MATERIAL', message: `${SKILL_DATA.materials[tier].name}不足：需要 ${cost}。` };
    book.materials[tier] -= cost;
    book.tickets += 1;
    logSkill(book, { type: 'exchange', kind }, now);
    return { ok: true, tickets: book.tickets, materials: { ...book.materials } };
  }
  return { ok: false, code: 'BAD_EXCHANGE', message: '没有这种兑换。' };
}

/** 合击与誓约技名里的签名武器名，在主线揭示以前先显示暂名（技能稿 5.2）。 */
function veiledName(entry, highest) {
  let name = entry.name;
  for (const v of entry.veils || []) if (!reached(v.until, highest)) name = v.name;
  return name;
}

/** 单张技能的对外视图；owner 还没入队时是剪影（只有颜色与「第N章入队」，没有名字与文案）。 */
export function publicSkill(skill, cleared, account = null) {
  const highest = highestClearedChapter(cleared);
  const joined = reached(OWNERS[skill.owner].join, highest);
  const base = { id: skill.id, owner: skill.owner, tier: skill.tier, source: skill.source };
  if (!joined) return { ...base, sealed: true, name: SEALED_TEXT, joinChapter: OWNERS[skill.owner].join };
  const level = account ? levelOf(account, skill.id) : 0;
  const costs = skillCosts(skill, level);
  return {
    ...base, sealed: false, name: skill.name, unlock: skill.unlock, element: skill.element, target: skill.target, ruleBend: skill.ruleBend || null,
    text: skill.text, level, index: effectiveIndex(skill, level), nextIndex: level < MAX_LEVEL ? effectiveIndex(skill, level + 1) : null,
    nextCost: enhanceCost(level), mp: costs.mp, cd: costs.cd, resonance: costs.resonance,
    owned: account ? ownsSkill(account, skill) : false,
    unlocked: skill.source === 'story' ? reached(skill.unlock, highest) : undefined,
  };
}

function publicOwner(id, cleared) {
  const o = OWNERS[id];
  const highest = highestClearedChapter(cleared);
  if (!reached(o.join, highest)) return { id, sealed: true, name: SEALED_TEXT, role: SEALED_TEXT, join: o.join };
  return { id, sealed: false, name: o.name, role: o.role, join: o.join, personal: o.personal, personalCleared: id !== 'hero' && personalCleared(id, cleared) };
}

/** 技能书的对外视图（GET /api/skills）。 */
export function publicSkillbook(account) {
  const book = ensureSkillbook(account);
  const cleared = clearedChaptersOf(account);
  const highest = highestClearedChapter(cleared);
  const combos = {};
  const oaths = {};
  for (const id of HEROINE_IDS) {
    if (!reached(OWNERS[id].join, highest)) continue;
    const c = SKILL_DATA.combos[id];
    combos[id] = { name: veiledName(c, highest), unlock: c.unlock, unlocked: reached(c.unlock, highest), desc: c.desc };
    const o = SKILL_DATA.oaths[id];
    oaths[id] = personalCleared(id, cleared) ? { name: o.name, line: o.line, desc: o.desc, available: true } : { available: false, personal: OWNERS[id].personal };
  }
  const passives = Object.fromEntries(HEROINE_IDS.filter((id) => reached(OWNERS[id].join, highest)).map((id) => [id, SKILL_DATA.passives[id]]));
  return {
    owners: OWNER_IDS.map((id) => publicOwner(id, cleared)),
    skills: SKILLS.map((s) => publicSkill(s, cleared, account)),
    materials: { ...book.materials },
    materialNames: Object.fromEntries(TIER_ORDER.map((t) => [t, SKILL_DATA.materials[t].name])),
    tickets: book.tickets,
    loadout: { ...book.loadout },
    party: [...book.party],
    partySize: partySize(cleared),
    oath: book.oath,
    combos, oaths, passives,
    passiveRule: SKILL_DATA.passiveRule,
    tiers: TIERS,
    enhance: SKILL_DATA.enhance,
    convert: SKILL_DATA.convert,
    exchange: SKILL_DATA.exchange,
    fixed: SKILL_DATA.fixed,
    ruleBends: SKILL_DATA.ruleBends,
    commissionsOpen: partySize(cleared) > 0,
    log: book.log.slice(-10).reverse(),
  };
}

/**
 * 外传银轨号（技能稿 6.2）：技能书里莉亚、米娅或塞雷娜的③绝技格装了暮紫或赤月，而外传的主导战术正好是她时，
 * 外传 `skill` 指令的伤害：暮紫 +5%、赤月 +10%，每级强化再 +1%，上限 +20%。结局、回卷与聊天计分都不动。
 */
export function gaidenSkillBonus(account, strategyId) {
  if (!account || !['lia', 'mia', 'serena'].includes(strategyId)) return 0;
  const book = ensureSkillbook(account);
  const id = book.loadout[strategyId]?.[2];
  const s = id && skillById(id);
  if (!s || !['purple', 'red'].includes(s.tier) || !ownsSkill(account, s)) return 0;
  return Math.min(0.2, (s.tier === 'red' ? 0.10 : 0.05) + 0.01 * levelOf(account, s.id));
}

/**
 * 主线自由输入战（技能稿 6.3）：本场在场角色已解锁的剧情技能的世界内描述，每人最多 3 句。
 * 只读 source=story、mainline 不为空、解锁章不晚于本章的条目；不读颜色、等级、编成、转蛋、服装——所以
 * 「所有红紫都+10」和「什么都没抽」的账户拿到的句子逐字相同（这里根本不接收账户）。
 */
export function mainlineSkillLines(chapterId, present) {
  const n = chapterNo(chapterId);
  const lines = [];
  for (const owner of present) {
    const mine = SKILLS.filter((s) => s.owner === owner && s.source === 'story' && s.mainline && chapterNo(s.unlock) <= n).slice(0, 3);
    for (const s of mine) lines.push(s.mainline);
  }
  return lines;
}
