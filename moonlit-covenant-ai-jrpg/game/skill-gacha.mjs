/**
 * 秘技召唤（池 ID `skill`；技能稿 3.2、8.3）——只出已入队角色的暮紫、赤月技能，和秘页。
 *
 * 价格与角色池、服饰池相同：单抽 80、十连 720，只收钻石；也可以用秘技召唤券（一张券一抽，十连要 10 张）。
 * 概率表就是实际抽取用的表，/api/gacha/pools 原样公示（契约 K-11）：
 *   赤月技能 0.8%：距上一张赤月的第 70 抽起每抽 +8%（第 70 抽 8.8% … 第 79 抽 80.8%），第 80 抽必出；
 *   暮紫技能 8.0%：每 10 抽至少一个暮紫或赤月（单抽也计数）；
 *   赤月秘页×1 2.0%、暮紫秘页×3 20.0%、暮紫秘页×1 69.2%。
 * 软保底抬高赤月的那一抽，其余各项按原比例分剩下的概率。
 * 定轨：可以从池内的赤月里选一张当目标；出赤月时 50% 是目标，不是的话记下「下一张赤月必为目标」（最多 160 抽）。
 * 换目标不清空保底计数，「下一张必为目标」也保留。没设目标时池内的赤月等概率。
 * 重复：抽到已经拥有的技能当场转成秘页——暮紫×10、赤月×15（结果里写 converted），所以没有「满级后卡住的重复」。
 * 池子按入队章筛选（技能稿 3.2）：还没入队的角色不出现，不会剧透，也不会抽到暂时不能用的技能。
 */
import { GACHA_DIAMOND_COSTS, GACHA_CURRENCY, clearedChaptersOf } from './gacha.mjs';
import { SKILLS, ensureSkillbook, ownerJoined, publicSkill, logSkill, skillById } from './skills.mjs';

export const SKILL_GACHA = Object.freeze({
  costs: { single: GACHA_DIAMOND_COSTS.single, ten: GACHA_DIAMOND_COSTS.ten },
  red: { base: 0.008, softFrom: 70, softStep: 0.08, hard: 80, targetShare: 0.5 },
  epic: { base: 0.08, floorEvery: 10 },
  filler: [
    { tier: 'red', qty: 1, p: 0.02 },
    { tier: 'purple', qty: 3, p: 0.20 },
    { tier: 'purple', qty: 1, p: 0.692 },
  ],
  duplicate: { purple: 10, red: 15 },
});

/** 第 n 抽（距上一张赤月）出赤月的概率。 */
export function redChance(n) {
  const { base, softFrom, softStep, hard } = SKILL_GACHA.red;
  if (n >= hard) return 1;
  if (n >= softFrom) return Math.min(1, base + (n - softFrom + 1) * softStep);
  return base;
}

/** 池内候选：已入队角色的暮紫、赤月。 */
export function skillPoolCandidates(cleared) {
  const list = SKILLS.filter((s) => s.source === 'gacha' && ownerJoined(s.owner, cleared));
  return { purple: list.filter((s) => s.tier === 'purple'), red: list.filter((s) => s.tier === 'red') };
}

/** 秘技池的对外视图与概率公示（/api/gacha/pools 的 skill 段）。 */
export function publicSkillPool(account) {
  const cleared = clearedChaptersOf(account);
  const pool = skillPoolCandidates(cleared);
  const book = account ? ensureSkillbook(account) : null;
  return {
    id: 'skill',
    label: '秘技召唤',
    costs: { ...SKILL_GACHA.costs },
    currency: GACHA_CURRENCY,
    rates: [
      { kind: 'red', label: '赤月技能', p: SKILL_GACHA.red.base, items: pool.red.map((s) => publicSkill(s, cleared, account)) },
      { kind: 'purple', label: '暮紫技能', p: SKILL_GACHA.epic.base, items: pool.purple.map((s) => publicSkill(s, cleared, account)) },
      { kind: 'mat_red', label: '赤月秘页×1', p: 0.02 },
      { kind: 'mat_purple3', label: '暮紫秘页×3', p: 0.20 },
      { kind: 'mat_purple', label: '暮紫秘页×1', p: 0.692 },
    ],
    pity: { softFrom: SKILL_GACHA.red.softFrom, softStep: SKILL_GACHA.red.softStep, hard: SKILL_GACHA.red.hard, epicEvery: SKILL_GACHA.epic.floorEvery, targetShare: SKILL_GACHA.red.targetShare },
    duplicate: { ...SKILL_GACHA.duplicate },
    state: book ? { ...book.gacha, tickets: book.tickets } : null,
  };
}

/** 定轨：从池内的赤月里选一张当目标（null 取消）。 */
export function setSkillTarget(account, skillId) {
  const book = ensureSkillbook(account);
  if (skillId === null || skillId === '') { book.gacha.target = null; return { ok: true, target: null }; }
  const s = skillById(skillId);
  if (!s || s.tier !== 'red') return { ok: false, code: 'BAD_TARGET', message: '只能选赤月技能当目标。' };
  if (!ownerJoined(s.owner, clearedChaptersOf(account))) return { ok: false, code: 'NOT_IN_POOL', message: '她还没有入队，这张技能还不在池里。' };
  book.gacha.target = s.id;
  return { ok: true, target: s.id, guaranteed: book.gacha.guaranteed };
}

const pickOne = (list, rng) => list[Math.floor(rng() * list.length)];

/**
 * 执行秘技召唤。
 * @param {object} account
 * @param {number} count 10 为十连，其余单抽
 * @param {{payWith?: 'diamonds'|'tickets', rng?: () => number}} [options] payWith 'tickets' 时一抽扣一张券（十连 10 张）
 */
export function pullSkills(account, count, options = {}) {
  const rng = typeof options.rng === 'function' ? options.rng : Math.random;
  const book = ensureSkillbook(account);
  const n = Number(count) === 10 ? 10 : 1;
  const label = n === 10 ? '十连' : '单抽';
  const payWith = options.payWith === 'tickets' ? 'tickets' : 'diamonds';
  let cost = 0;
  if (payWith === 'tickets') {
    if (book.tickets < n) return { ok: false, code: 'INSUFFICIENT_TICKETS', message: `秘技召唤券不足，${label}需要 ${n} 张（现有 ${book.tickets}）。` };
    book.tickets -= n;
  } else {
    cost = n === 10 ? SKILL_GACHA.costs.ten : SKILL_GACHA.costs.single;
    const balance = Number.isFinite(account.diamonds) ? account.diamonds : 0;
    if (balance < cost) return { ok: false, code: 'INSUFFICIENT_DIAMONDS', message: `钻石不足，${label}需要${cost}钻石（当前${balance}）。` };
    account.diamonds = balance - cost;
  }
  const cleared = clearedChaptersOf(account);
  const pool = skillPoolCandidates(cleared);
  const g = book.gacha;
  const results = [];
  const converted = { purple: 0, red: 0 };
  const fillerTotal = SKILL_GACHA.filler.reduce((a, f) => a + f.p, 0) + SKILL_GACHA.epic.base;
  for (let i = 0; i < n; i += 1) {
    g.pulls += 1;
    g.sinceRed += 1;
    g.sinceEpic += 1;
    let skill = null;
    let material = null;
    if (pool.red.length && rng() < redChance(g.sinceRed)) {
      // 定轨：有目标时 50% 是它；没中就记下「下一张必为目标」
      const target = g.target && pool.red.some((s) => s.id === g.target) ? skillById(g.target) : null;
      if (target && (g.guaranteed || rng() < SKILL_GACHA.red.targetShare)) { skill = target; g.guaranteed = false; }
      else if (target) { skill = pickOne(pool.red.filter((s) => s.id !== target.id), rng) || target; g.guaranteed = skill.id !== target.id; }
      else skill = pickOne(pool.red, rng);
      g.sinceRed = 0;
      g.sinceEpic = 0;
    } else if (g.sinceEpic >= SKILL_GACHA.epic.floorEvery && pool.purple.length) {
      skill = pickOne(pool.purple, rng);
      g.sinceEpic = 0;
    } else {
      // 其余各项按原比例分：暮紫技能 8%，秘页 2% / 20% / 69.2%
      let roll = rng() * fillerTotal;
      if (roll < SKILL_GACHA.epic.base && pool.purple.length) { skill = pickOne(pool.purple, rng); g.sinceEpic = 0; }
      else {
        roll -= SKILL_GACHA.epic.base;
        const f = SKILL_GACHA.filler.find((x) => { roll -= x.p; return roll < 0; }) || SKILL_GACHA.filler[SKILL_GACHA.filler.length - 1];
        material = { tier: f.tier, qty: f.qty };
      }
    }
    if (skill) {
      const isNew = !book.owned[skill.id];
      let conv = null;
      if (isNew) book.owned[skill.id] = { at: Date.now() };
      else { conv = { tier: skill.tier, qty: SKILL_GACHA.duplicate[skill.tier] }; book.materials[skill.tier] += conv.qty; converted[skill.tier] += conv.qty; }
      results.push({ kind: 'skill', pullIndex: i + 1, ...publicSkill(skill, cleared, account), isNew, duplicate: !isNew, converted: conv });
    } else {
      book.materials[material.tier] += material.qty;
      results.push({ kind: 'material', pullIndex: i + 1, tier: material.tier, qty: material.qty });
    }
  }
  logSkill(book, { type: 'pull', count: n, payWith, cost, reds: results.filter((r) => r.kind === 'skill' && r.tier === 'red').map((r) => r.id) });
  return {
    ok: true, pool: 'skill', payWith, currency: GACHA_CURRENCY, cost, results, converted,
    state: { ...g, tickets: book.tickets },
    materials: { ...book.materials },
    balance: { diamonds: Number.isFinite(account.diamonds) ? account.diamonds : 0 },
  };
}
