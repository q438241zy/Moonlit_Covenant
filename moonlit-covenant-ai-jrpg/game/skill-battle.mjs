/**
 * 委托板·技能战（技能稿 6.1；设06 v0.4 §1 B层、§23）——回合制、指令选单：普攻、技能①②③、防御、道具、合击、誓约。
 *
 * - 上场：亚克固定在场，另加 skillbook.party 里的女主（正式05通关后一位、正式10通关后两位）。
 * - 不设角色等级：强度只来自技能的颜色与强化（effectiveIndex）。数值起点照技能稿 6.1（女主生命100、攻击10……，
 *   这里生命与伤害都 ×10 方便阅读）；亚克自己造成的伤害一律按白色带（I ≤ 1.30）计算（技能稿 2.3）。
 * - 共鸣 0–100 全队共用：命中弱点 +5、破防 +15、救援 +10、「报数」+5，每回合结束 +5；赤月消耗 50（+5 起 40）、合击 30、誓约 100。
 * - 任何技能都不给额外行动（技能稿 2.2）：「报数」只把队友的行动提前，「全员报数」只重排本回合原有的行动。
 * - 结果不写回正史：不读也不写信赖、旗标、承诺与结局倾向（F7）；委托文案按通关进度分级，16 以前不出现皇朝与战争，
 *   22 以前不出现反抗军；没有平民、人质与儿童（F6）。被处决的女主在技能战里照常可用，也不显示任何结局内容。
 * - 确定性：同一个种子、同样的指令，结果完全相同（状态里存随机数种子）。
 * 奖励只发技能书材料（技能稿 3.1）：每天前 3 胜各「练习手记」×4、「实战手记」×1，之后每胜「练习手记」×1；
 * 每周 3 场挑战委托各「实战手记」×5、「源律残章」×2。
 */
import { clearedChaptersOf, highestClearedChapter } from './gacha.mjs';
import { SKILL_DATA, OWNERS, skillById, effectiveIndex, skillCosts, ensureSkillbook, ownerJoined, personalCleared, partySize, reached, logSkill } from './skills.mjs';
import { dayKey } from './rewards.mjs';

const SCALE = 10;           // 生命与回复的显示倍数
const DMG = 12;             // 伤害倍数（防御减伤：×25/(25+防)）
const MITIGATE = 25;
const ENEMY_HP = 0.45;      // 敌人生命的整体系数（普通委托以「劇情技能平均+3」稳定可过为准）
const HERO_CAP = 1.30;      // 亚克自己造成的伤害按白色带上限计算
const MAX_RES = 100;
const ROUND_RES = 5;        // 回合结束的共鸣（技能稿 6.1 只列了弱点、破防、救援、报数；实测不够，补这一项）
const BREAK_MAX = 100;
const POTIONS = 2;
const r2 = (v) => Math.round(v * 100) / 100;

// ─── 敌人 ───
// kind：beast 野兽 / construct 构造体或机关（「一毫米」破防 +50%、「万能扳机」+伤害）/ spirit 灵体 / boss
// moves：{ id, name, w 权重, type: 'hit'|'aoe'|'charge'|'debuff'|'buff'|'summon', coef, status?, sure?, skill? }
const ENEMIES = {
  goblin:      { name: '哥布林', hp: 520, atk: 9, mag: 6, def: 8, spd: 9, kind: 'beast', weak: ['fire', 'light'], moves: [{ id: 'stab', name: '短刀', w: 3, type: 'hit', coef: 1 }, { id: 'throw', name: '扔石头', w: 1, type: 'hit', coef: 0.8, back: true }] },
  goblin_chief:{ name: '哥布林咒徒长', hp: 1500, atk: 11, mag: 12, def: 10, spd: 8, kind: 'beast', weak: ['light'], moves: [{ id: 'curse', name: '咒言', w: 2, type: 'debuff', status: 'curse', skill: true }, { id: 'club', name: '骨棒', w: 3, type: 'hit', coef: 1.1 }, { id: 'howl', name: '咒嚎', w: 1, type: 'charge', coef: 1.6, aoe: true, skill: true }] },
  scrap_drone: { name: '拾铁机的小钳子', hp: 380, atk: 8, mag: 6, def: 12, spd: 11, kind: 'construct', device: true, weak: ['thunder', 'water'], moves: [{ id: 'pinch', name: '钳', w: 1, type: 'hit', coef: 0.9 }] },
  scrap_picker:{ name: '拾铁机', hp: 1400, atk: 11, mag: 8, def: 11, spd: 7, kind: 'construct', weak: ['thunder', 'water'], moves: [{ id: 'crush', name: '压碎', w: 3, type: 'hit', coef: 1.2 }, { id: 'sweep', name: '横扫', w: 1, type: 'aoe', coef: 0.6 }, { id: 'press', name: '液压蓄力', w: 1, type: 'charge', coef: 2.2, sure: true }] },
  tide_bug:    { name: '潮虫', hp: 300, atk: 7, mag: 5, def: 6, spd: 12, kind: 'beast', weak: ['fire', 'ice'], moves: [{ id: 'bite', name: '啃咬', w: 3, type: 'hit', coef: 0.9, status: 'poison' }] },
  marsh_ogre:  { name: '沼地食人魔', hp: 2600, atk: 15, mag: 6, def: 12, spd: 6, kind: 'beast', weak: ['fire', 'light'], moves: [{ id: 'smash', name: '巨木砸', w: 3, type: 'hit', coef: 1.2 }, { id: 'roar', name: '怒吼', w: 1, type: 'debuff', status: 'fear', aoe: true, skill: true }, { id: 'slam', name: '蓄力横扫', w: 1, type: 'charge', coef: 1.4, aoe: true }] },
  mirror_shade:{ name: '镜里的影', hp: 620, atk: 10, mag: 12, def: 7, spd: 13, kind: 'spirit', evade: 0.25, weak: ['light', 'metal'], moves: [{ id: 'mimic', name: '学来的一击', w: 2, type: 'hit', coef: 1 }, { id: 'glare', name: '镜光', w: 1, type: 'hit', coef: 1.1, magic: true, skill: true }] },
  frost_spirit:{ name: '霜灵', hp: 700, atk: 8, mag: 12, def: 9, spd: 10, kind: 'spirit', weak: ['fire'], moves: [{ id: 'chill', name: '寒息', w: 2, type: 'hit', coef: 1, magic: true }, { id: 'freeze', name: '冻住', w: 1, type: 'debuff', status: 'freeze', skill: true }] },
  puppet:      { name: '失控的礼仪傀儡', hp: 3000, atk: 12, mag: 12, def: 11, spd: 9, kind: 'boss', construct: true, weak: ['thunder'], phases: [{ at: 0.5, name: '齿轮全开', atk: 0.25 }], moves: [{ id: 'bow', name: '鞠躬一击', w: 3, type: 'hit', coef: 1.1 }, { id: 'silence', name: '肃静令', w: 1, type: 'debuff', status: 'silence', skill: true }, { id: 'toll', name: '整点报时', w: 1, type: 'charge', coef: 1.5, aoe: true, sure: true }] },
  seal_puppet: { name: '护印的小傀儡', hp: 500, atk: 7, mag: 7, def: 10, spd: 8, kind: 'construct', device: true, weak: ['thunder'], moves: [{ id: 'shield', name: '加护', w: 1, type: 'buff', status: 'guarded' }] },
  iron_sentinel:{ name: '压律构造体', hp: 1900, atk: 13, mag: 10, def: 16, spd: 8, kind: 'construct', weak: ['thunder', 'water'], moves: [{ id: 'bind', name: '压律钳', w: 2, type: 'debuff', status: 'silence', skill: true }, { id: 'ram', name: '冲撞', w: 3, type: 'hit', coef: 1.2 }, { id: 'pulse', name: '压律脉冲', w: 1, type: 'charge', coef: 1.4, aoe: true }] },
  scout_crow:  { name: '侦察鸦', hp: 420, atk: 9, mag: 6, def: 6, spd: 15, kind: 'beast', evade: 0.2, weak: ['thunder', 'wood'], moves: [{ id: 'peck', name: '啄', w: 1, type: 'hit', coef: 0.9, back: true }] },
  lava_lizard: { name: '熔岩蜥', hp: 3400, atk: 12, mag: 11, def: 10, spd: 8, kind: 'boss', weak: ['water', 'ice'], phases: [{ at: 0.5, name: '鳞片裂开', atk: 0.2 }], moves: [{ id: 'claw', name: '熔爪', w: 3, type: 'hit', coef: 1.2 }, { id: 'tail', name: '尾扫', w: 2, type: 'aoe', coef: 0.6 }, { id: 'erupt', name: '熔岩喷发', w: 1, type: 'charge', coef: 1.4, aoe: true, status: 'burn', skill: true }] },
  lava_whelp:  { name: '熔岩幼蜥', hp: 600, atk: 9, mag: 8, def: 9, spd: 10, kind: 'beast', weak: ['water', 'ice'], moves: [{ id: 'spit', name: '吐火', w: 1, type: 'hit', coef: 1, status: 'burn' }] },
  dream_griffin:{ name: '梦里的黑格里芬', hp: 4400, atk: 12, mag: 13, def: 11, spd: 12, kind: 'boss', evade: 0.15, weak: ['light'], phases: [{ at: 0.5, name: '羽毛散开', atk: 0.25 }], moves: [{ id: 'talon', name: '爪', w: 3, type: 'hit', coef: 1.2 }, { id: 'feathers', name: '秘密之羽', w: 2, type: 'aoe', coef: 0.7, magic: true, status: 'curse', skill: true }, { id: 'dive', name: '俯冲蓄势', w: 1, type: 'charge', coef: 1.8, sure: true }] },
};

// ─── 委托（技能稿 6.1：文案按通关进度分级）───
// unlock：通关这一章后出现；challenge：每周挑战（每周 3 场有奖励）
export const COMMISSIONS = [
  { id: 'goblin_road',   title: '清理商路上的哥布林',   desc: '公会日常：北门外的商路上又有哥布林拦车。',               unlock: 'ch005', enemies: ['goblin', 'goblin', 'goblin'] },
  { id: 'scrap_picker',  title: '拾铁机暴走',           desc: '公会日常：废料场的拾铁机带着小钳子乱跑，先把小钳子拆了。', unlock: 'ch007', enemies: ['scrap_drone', 'scrap_picker', 'scrap_drone'] },
  { id: 'tide_bugs',     title: '下水道的潮虫',         desc: '公会日常：雾港下水道的潮虫又爬上了码头。',               unlock: 'ch010', enemies: ['tide_bug', 'tide_bug', 'tide_bug', 'tide_bug'] },
  { id: 'marsh_ogre',    title: '沼地食人魔',           desc: '公会讨伐：沼地边的食人魔会蓄力横扫，记得打断。',         unlock: 'ch012', enemies: ['marsh_ogre'] },
  { id: 'mirror_shades', title: '镜子里的影',           desc: '公会日常：旧仓库的镜子里走出了会闪的影子。',             unlock: 'ch013', enemies: ['mirror_shade', 'mirror_shade', 'mirror_shade'] },
  { id: 'chief_hollow',  title: '哥布林咒徒长的巢',     desc: '公会讨伐：巢穴深处的咒徒长会念咒，带上能净化的人。',     unlock: 'ch014', enemies: ['goblin', 'goblin_chief', 'goblin'] },
  { id: 'court_puppet',  title: '冠礼院失控的礼仪傀儡', desc: '白塔的委托：一具礼仪傀儡在旧礼堂里不停报时。',           unlock: 'ch016', enemies: ['seal_puppet', 'puppet', 'seal_puppet'] },
  { id: 'frost_spirits', title: '外庭的霜灵',           desc: '白塔的委托：外庭夜里又结了霜，霜灵站了起来。',           unlock: 'ch018', enemies: ['frost_spirit', 'frost_spirit', 'frost_spirit'] },
  { id: 'supply_escort', title: '护送补给车',           desc: '反抗军的委托：补给车要过山口，压律构造体守在路上。',     unlock: 'ch022', enemies: ['scout_crow', 'iron_sentinel', 'scout_crow'] },
  { id: 'lava_lizard',   title: '灰烬关的熔岩蜥',       desc: '公会讨伐：关外的熔岩蜥会喷发，记得打断它的蓄力。',       unlock: 'ch024', enemies: ['lava_whelp', 'lava_lizard', 'lava_whelp'] },
  { id: 'dream_griffin', title: '梦里的黑格里芬',       desc: '公会讨伐：有人在梦里看见一只黑色的格里芬。只是梦。',     unlock: 'ch028', enemies: ['dream_griffin'] },
  // 每周挑战（以「暮紫 +5」为标准调强）
  { id: 'ch_scrap',      title: '挑战·拾铁机改',        desc: '挑战委托：拾铁机装上了第二个液压缸。',                 unlock: 'ch010', challenge: true, enemies: ['scrap_drone', 'scrap_picker', 'scrap_drone'] },
  { id: 'ch_ogre',       title: '挑战·双头食人魔',      desc: '挑战委托：这一只更大，也更会蓄力。',                   unlock: 'ch015', challenge: true, enemies: ['marsh_ogre', 'goblin_chief'] },
  { id: 'ch_puppet',     title: '挑战·不停的报时',      desc: '挑战委托：礼仪傀儡的齿轮换了新的。',                   unlock: 'ch016', challenge: true, enemies: ['seal_puppet', 'puppet', 'seal_puppet'] },
  { id: 'ch_lizard',     title: '挑战·灰烬巨蜥',        desc: '挑战委托：熔岩蜥背上的鳞一片一片裂开，喷发更快。',     unlock: 'ch024', challenge: true, enemies: ['lava_whelp', 'lava_lizard', 'lava_whelp'] },
  { id: 'ch_griffin',    title: '挑战·醒着的梦',        desc: '挑战委托：梦里的格里芬不再只是梦。',                   unlock: 'ch028', challenge: true, enemies: ['scout_crow', 'dream_griffin', 'scout_crow'] },
];
const CHALLENGE_SCALE = { hp: 1.5, atk: 1.2 };

// ─── 随机数（mulberry32，状态存在 battle.rng）───
function nextRand(B) {
  let t = (B.rng = (B.rng + 0x6d2b79f5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const chance = (B, p) => nextRand(B) < p;

// ─── 状态 ───
const CONTROL = ['stun', 'freeze', 'silence', 'fear', 'taunted'];
const FAMILY = { sin: ['curse', 'fear'], stasis: ['freeze', 'stun', 'sleep'] };
const DEBUFF_KINDS = ['burn', 'poison', 'curse', 'fear', 'freeze', 'stun', 'silence', 'armorBreak', 'atkDown', 'defDown', 'spdDown', 'dmgUp'];
const REFRESH = new Set([...DEBUFF_KINDS, 'taunted', 'mark', 'scanned', 'dmgDown', 'atkUp', 'defUp', 'spdUp', 'critUp', 'regen', 'counter', 'hitDown', 'resistUp', 'lightStep', 'countBonus', 'rollCall', 'backstab', 'form', 'guard', 'exposed', 'immune_sin', 'immune_stasis', 'immune_all3']);
const st = (u, k) => u.st.find((s) => s.k === k);
const has = (u, k) => Boolean(st(u, k));
const sum = (u, k) => u.st.filter((s) => s.k === k).reduce((a, s) => a + (s.v || 0), 0);
function addSt(B, u, k, v, t, extra = {}) {
  if (u.down) return null;
  if (u.side === 'ally' && DEBUFF_KINDS.includes(k)) {
    for (const [fam, kinds] of Object.entries(FAMILY)) if (kinds.includes(k) && has(u, `immune_${fam}`)) { say(B, `${u.name}免疫了${statusName(k)}。`); return null; }
    if (has(u, 'immune_all3') && ['burn', 'poison', 'curse'].includes(k)) return null;
    if (CONTROL.includes(k) && has(u, 'breakFree')) { removeSt(u, (s) => s.k === 'breakFree', 1); say(B, `${u.name}立刻挣脱了。`); return null; }
    if (CONTROL.includes(k) && passive(B, 'evelyn', u)) { say(B, `伊芙琳的「纯结回声」：${u.name}挣脱了。`); return null; }
    if (['silence', 'taunted'].includes(k) && passive(B, 'aila', u)) { say(B, `艾拉的「准许反驳」：${statusName(k)}被驳回。`); return null; }
    if (CONTROL.includes(k) && t > 1 && passive(B, 'freya', u)) t -= 1;
  }
  const s = { k, v, t, ...extra };
  if (['shield', 'dodge', 'lastStand', 'reflect'].includes(k)) {
    const old = st(u, k);
    if (old) { old.v = Math.max(old.v || 0, v || 0); old.t = Math.max(old.t, t); old.n = (old.n || 0) + (extra.n || 0); return old; }
  }
  // 同一种状态不叠层：刷新持续时间、取较大的数值（反击按来源区分）
  if (REFRESH.has(k)) {
    const old = u.st.find((x) => x.k === k && (k !== 'counter' || x.name === extra.name) && (k !== 'taunted' || x.by === extra.by));
    if (old) { old.v = Math.max(old.v || 0, v || 0); old.t = Math.max(old.t, t); Object.assign(old, { ...extra, v: old.v, t: old.t }); return old; }
  }
  u.st.push(s);
  return s;
}
function removeSt(u, pred, count = Infinity) {
  let n = 0;
  u.st = u.st.filter((s) => { if (n < count && pred(s)) { n += 1; return false; } return true; });
  return n;
}
const STATUS_NAMES = { atkUp: '攻击提升', atkDown: '攻击下降', defUp: '防御提升', defDown: '防御下降', armorBreak: '破甲', dmgDown: '减伤', dmgUp: '易伤', spdUp: '加速', spdDown: '减速', critUp: '暴击提升', taunt: '嘲讽', taunted: '被嘲讽', counter: '反击', guard: '护援', mark: '影标', scanned: '弱点', dodge: '闪避', lastStand: '保命', shield: '护盾', regen: '持续回复', invuln: '冰封', stun: '麻痹', freeze: '冻结', silence: '沉默', fear: '恐惧', curse: '诅咒', burn: '燃烧', poison: '中毒', overheat: '过热', duel: '决斗', form: '半龙化', seed: '噩梦种子', reflect: '反射', intercept: '截击', backstab: '背击', breakFree: '挣脱', immune_sin: '免疫罪律', immune_stasis: '免疫停滞', trueSight: '无视闪避', hitDown: '命中下降', resistUp: '抗性提升', guarded: '加护', countBonus: '报数', rollCall: '全员报数', negateSkill: '技能无效', negateSure: '必中无效', delayPhase: '阶段推迟', hard: '硬一瞬', lightStep: '轻步', palmLight: '掌心光', charging: '蓄力' };
const statusName = (k) => STATUS_NAMES[k] || k;

// ─── 战斗日志 ───
function say(B, text, kind = 'info') { B.log.push({ text, kind, round: B.round }); if (B.log.length > 120) B.log.splice(0, B.log.length - 120); }

// ─── 单位 ───
const living = (B, side) => (side === 'ally' ? B.allies : B.enemies).map((id) => B.units[id]).filter((u) => !u.down);
const allyUnits = (B) => living(B, 'ally');
const enemyUnits = (B) => living(B, 'enemy');
const ownerOf = (u) => u.owner;
function effStat(u, key, B = null) {
  const base = u.base[key];
  if (key === 'atk' || key === 'mag') return base * (1 + sum(u, 'atkUp') - sum(u, 'atkDown') - (has(u, 'curse') ? 0.2 : 0) - (has(u, 'fear') ? 0.15 : 0) + (u.phaseAtk || 0));
  if (key === 'def') return base * Math.max(0.2, 1 + sum(u, 'defUp') - sum(u, 'defDown') - (has(u, 'armorBreak') ? 0.3 : 0));
  if (key === 'spd') return base * Math.max(0.3, 1 + sum(u, 'spdUp') - sum(u, 'spdDown') - fieldSlow(B, u));
  return base;
}
const fieldSlow = (B, u) => (B?.field || []).filter((f) => f.slow && (f.side === 'all' || f.side === u.side)).reduce((a, f) => a + f.slow, 0);

// ─── 被动（技能稿 5.2：固定 20%，冷却 3 个行动）───
function passive(B, owner, ctxUnit) {
  const u = B.units[owner];
  if (!u || u.down || !B.passives?.[owner]) return false;
  const p = B.passives[owner];
  if (p.once && p.used) return false;
  if (B.actions - (p.last ?? -99) < SKILL_DATA.passiveRule.cooldownActions) return false;
  if (!chance(B, SKILL_DATA.passiveRule.chance)) return false;
  p.last = B.actions;
  if (p.once) p.used = true;
  return true;
}

// ─── 伤害与回复 ───
function hit(B, a, t, o = {}) {
  if (!t || t.down) return 0;
  // 镜子：映回技能（银月返照、明镜盾）
  if (t.side === 'ally' && a.side === 'enemy' && o.skill && t.st.some((s) => s.k === 'reflect' && s.all) ) {
    const r = st(t, 'reflect');
    r.n -= 1; if (r.n <= 0) removeSt(t, (s) => s === r);
    say(B, `镜子映回了「${o.name || '技能'}」。`, 'good');
    hit(B, t, a, { stat: 'mag', coef: 1, I: r.v, element: 'dark', from: 'reflect' });
    return 0;
  }
  if (t.side === 'ally' && a.side === 'enemy' && o.magic && has(t, 'reflect') && !st(t, 'reflect').all) {
    const r = st(t, 'reflect');
    r.n -= 1; if (r.n <= 0) removeSt(t, (s) => s === r);
    say(B, `${t.name}的明镜盾反射了这一击。`, 'good');
    hit(B, t, a, { stat: 'atk', coef: 1, I: r.v, element: 'light', from: 'reflect' });
    return 0;
  }
  // 闪避（敌方：天生闪避，「万影追猎」「镜后真名」无视；我方：闪避层数）
  if (t.side === 'enemy' && t.evade && !B.trueSight && !has(t, 'exposed') && !o.sureHit && chance(B, t.evade)) { say(B, `${t.name}闪开了。`); return 0; }
  if (t.side === 'ally' && a.side === 'enemy' && !o.aoe) {
    const d = st(t, 'dodge');
    if (d) { d.n = (d.n || 1) - 1; if (d.n <= 0) removeSt(t, (s) => s === d); say(B, `${t.name}闪开了这一下。`, 'good'); return 0; }
    if (sum(t, 'hitDown') && chance(B, Math.min(0.5, sum(t, 'hitDown')))) { say(B, `夜幕里，这一下落空了。`, 'good'); return 0; }
    if (passive(B, 'serena', t)) { say(B, '塞雷娜的「我一直看着」：识破了这一击，它落空了。', 'good'); return 0; }
  }
  if (has(t, 'invuln')) { say(B, `${t.name}在冰里，伤不到。`); return 0; }
  const I = a.owner === 'hero' && !o.noCap ? Math.min(o.I ?? 1, HERO_CAP) : (o.I ?? 1);
  let dmg = effStat(a, o.stat || 'atk') * I * (o.coef ?? 1) * DMG;
  let mult = 1;
  if (a.side === 'ally') {
    mult += sum(a, 'countBonus') + sum(a, 'rollCall');
    if (has(a, 'backstab')) { mult += st(a, 'backstab').v; removeSt(a, (s) => s.k === 'backstab', 1); }
    if (has(t, 'duel') && st(t, 'duel').with === a.id) mult += st(t, 'duel').v;
    if (o.construct && (t.kind === 'construct' || t.construct)) mult += o.construct;
  }
  mult += sum(t, 'mark') + sum(t, 'scanned') + sum(t, 'dmgUp') - sum(t, 'dmgDown');
  if (t.broken > 0) mult += 0.3;
  if (t.side === 'ally') mult -= (B.field || []).filter((f) => f.allyDr).reduce((s2, f) => s2 + f.allyDr, 0);
  if (a.side === 'enemy' && B.tauntCost) mult += 0.1;
  if (o.aoe && t.side === 'ally' && passive(B, 'ophelia', t)) { mult *= 0.5; say(B, '奥菲利亚的「别咬坏了」：吞下了一半。', 'good'); }
  const def = effStat(t, 'def');
  dmg = dmg * Math.max(0.1, mult) * (MITIGATE / (MITIGATE + def));
  const weak = t.side === 'enemy' && o.element && (t.weak || []).includes(o.element);
  if (weak) dmg *= 1.3;
  let crit = o.crit === true || chance(B, 0.05 + sum(a, 'critUp'));
  if (crit) dmg *= 1.5;
  dmg = Math.max(1, Math.round(dmg));
  // 护援：一部分伤害由护援者承受
  const g = t.side === 'ally' ? st(t, 'guard') : null;
  if (g && B.units[g.by] && !B.units[g.by].down && g.by !== t.id) {
    const share = Math.round(dmg * g.v);
    dmg -= share;
    const by = B.units[g.by];
    applyDamage(B, by, share, a);
    say(B, `${by.name}替${t.name}挡下了 ${share}。`, 'good');
    if (g.heal) heal(B, by, by, Math.round(by.maxHp * g.heal), { quiet: true });
  }
  if (t.side === 'ally' && st(t, 'echo')) st(t, 'echo').stored += Math.round(dmg * st(t, 'echo').v);
  const dealt = applyDamage(B, t, dmg, a, o);
  if (dealt > 0) say(B, `${a.name}${o.name ? `「${o.name}」` : ''}→${t.name} ${dealt}${crit ? '（暴击）' : ''}${weak ? '（弱点）' : ''}`, a.side === 'ally' ? 'hit' : 'hurt');
  if (t.side === 'enemy') {
    let brk = (o.isSkill ? 12 : 8) + (o.break || 0);
    if (weak) { brk += 10; gainRes(B, 5); }
    addBreak(B, t, brk);
  }
  // 反击（盾击、反逆架势、城垣、后退一步……）
  if (t.side === 'ally' && a.side === 'enemy' && !o.counter && !o.aoe && !t.down) {
    for (const c of t.st.filter((s) => s.k === 'counter')) {
      if (c.melee && o.ranged) continue;
      hit(B, t, a, { stat: 'atk', coef: c.v, I: c.I, element: c.element, counter: true, name: c.name || '反击', crit: c.crit });
      if (c.weaken) addSt(B, a, 'dmgUp', c.weaken, 1);
    }
  }
  return dealt;
}
function applyDamage(B, t, dmg, a, o = {}) {
  let left = dmg;
  const sh = st(t, 'shield');
  if (sh && !o.pierce) {
    const take = Math.min(sh.v, left);
    sh.v -= take; left -= take;
    if (sh.v <= 0) removeSt(t, (s) => s === sh);
  }
  if (left <= 0) return dmg;
  if (t.side === 'ally' && t.hp - left <= 0) {
    if (t.id === 'hero' && passive(B, 'lia', t) && B.units.lia && !B.units.lia.down) {
      say(B, '莉亚的「别逞强」：她挡在了亚克前面。', 'good');
      return applyDamage(B, B.units.lia, left, a, o);
    }
    const ls = st(t, 'lastStand') || (B.teamLastStand ? { team: true } : null);
    if (ls) {
      if (ls.team) B.teamLastStand = false; else removeSt(t, (s) => s === ls);
      t.hp = 1;
      say(B, `${t.name}撑住了，留下 1 点生命。`, 'good');
      return dmg;
    }
  }
  t.hp = Math.max(0, t.hp - left);
  if (t.hp <= 0) knockDown(B, t);
  else if (t.side === 'enemy') checkPhase(B, t);
  return dmg;
}
function knockDown(B, t) {
  t.down = true;
  t.st = [];
  t.charge = null;
  say(B, t.side === 'enemy' ? `${t.name}倒下了。` : `${t.name}倒地了。`, t.side === 'enemy' ? 'good' : 'bad');
}
function heal(B, a, t, amount, o = {}) {
  if (!t || t.down) return 0;
  const before = t.hp;
  t.hp = Math.min(t.maxHp, t.hp + Math.round(amount));
  const got = t.hp - before;
  const over = Math.round(amount) - got;
  if (o.overflowShield && over > 0) addSt(B, t, 'shield', Math.min(over, o.overflowShield), 2);
  if (!o.quiet) say(B, `${t.name}回复 ${got}`, 'heal');
  return got;
}
const healAmt = (a, I, coef = 1) => effStat(a, 'heal') * I * coef * SCALE;
function gainRes(B, n) { B.resonance = Math.max(0, Math.min(MAX_RES, B.resonance + n)); }
function addBreak(B, t, n) {
  if (t.down || t.broken > 0) return;
  t.brk = Math.min(BREAK_MAX, t.brk + n);
  if (t.brk >= BREAK_MAX) {
    t.brk = 0;
    t.broken = t.acted ? 2 : 1; // 跳过它的下一个行动（本回合已经动过就是下一回合）
    t.charge = null;
    removeSt(t, (s) => s.k === 'charging');
    gainRes(B, 15);
    say(B, `${t.name}破防了！`, 'good');
  }
}
function checkPhase(B, t) {
  for (const [i, ph] of (t.phases || []).entries()) {
    if (t.phase > i || t.hp > t.maxHp * ph.at) continue;
    if (B.delayPhase > 0 || has(t, 'delayPhase')) { if (!t.phaseHeld) say(B, `${t.name}想换阶段，被按住了。`, 'good'); t.phaseHeld = true; return; }
    t.phase = i + 1;
    t.phaseHeld = false;
    t.phaseAtk = (t.phaseAtk || 0) + (ph.atk || 0);
    say(B, `${t.name}：${ph.name}！`, 'bad');
  }
}

// ─── 建立战斗 ───
function makeAlly(id, loadout, levels) {
  const o = OWNERS[id];
  const s = o.stats;
  return {
    id, side: 'ally', owner: id, name: o.name, row: id === 'hero' || id === 'serena' || id === 'evelyn' || id === 'freya' ? 'back' : 'front',
    hp: s.hp * SCALE, maxHp: s.hp * SCALE, mp: s.mp, maxMp: s.mp, mpRegen: s.mpRegen,
    base: { atk: s.atk, mag: s.mag, heal: s.heal, def: s.def, spd: s.spd },
    st: [], cd: {}, redUsed: false, down: false, revived: false, formCd: 0,
    loadout: (loadout || []).map((sid) => (sid ? { id: sid, level: levels[sid] || 0 } : null)),
  };
}
function makeEnemy(key, i, challenge) {
  const e = ENEMIES[key];
  const k = { ...(challenge ? CHALLENGE_SCALE : { hp: 1, atk: 1 }) };
  k.hp *= ENEMY_HP;
  return {
    id: `e${i + 1}`, key, side: 'enemy', name: e.name, kind: e.kind, construct: e.construct || e.kind === 'construct', device: Boolean(e.device),
    hp: Math.round(e.hp * k.hp), maxHp: Math.round(e.hp * k.hp), base: { atk: e.atk * k.atk, mag: e.mag * k.atk, def: e.def, spd: e.spd, heal: 0 },
    weak: e.weak || [], evade: e.evade || 0, moves: e.moves, phases: e.phases || [], phase: 0, brk: 0, broken: 0, charge: null, st: [], down: false, row: 'front',
  };
}

/** 委托列表（GET /api/commissions）：按进度出现；每周挑战显示本周还剩几场有奖励。 */
export function listCommissions(account, now = Date.now()) {
  const book = ensureSkillbook(account, now);
  const cleared = clearedChaptersOf(account);
  const highest = highestClearedChapter(cleared);
  rollDay(book, now);
  const sm = SKILL_DATA.storyMaterials;
  return {
    open: partySize(cleared) > 0,
    daily: { wins: book.commissions.dailyWins, rewarded: sm.commissionDaily.wins, reward: { white: sm.commissionDaily.white, green: sm.commissionDaily.green }, repeat: { ...sm.commissionRepeat } },
    weekly: { wins: book.commissions.challengeWins, rewarded: sm.commissionChallenge.perWeek, reward: { green: sm.commissionChallenge.green, blue: sm.commissionChallenge.blue } },
    list: COMMISSIONS.filter((c) => reached(c.unlock, highest)).map((c) => ({
      id: c.id, title: c.title, desc: c.desc, challenge: Boolean(c.challenge), unlock: c.unlock,
      enemies: c.enemies.map((k) => ENEMIES[k].name),
    })),
    active: account.skillBattle && !account.skillBattle.result ? publicBattle(account.skillBattle) : null,
  };
}
function weekKey(now) {
  const d = new Date(now);
  const day = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000) + 3) ; // 1970-01-01 是周四
  return `w${Math.floor(day / 7)}`;
}
function rollDay(book, now) {
  const today = dayKey(now);
  if (book.commissions.day !== today) { book.commissions.day = today; book.commissions.dailyWins = 0; }
  const week = weekKey(now);
  if (book.commissions.week !== week) { book.commissions.week = week; book.commissions.challengeWins = 0; }
}

/** 开始一场委托（POST /api/commission/start）。 */
export function startCommission(account, commissionId, { seed, now = Date.now() } = {}) {
  const book = ensureSkillbook(account, now);
  const cleared = clearedChaptersOf(account);
  const highest = highestClearedChapter(cleared);
  const c = COMMISSIONS.find((x) => x.id === commissionId);
  if (!c || !reached(c.unlock, highest)) return { ok: false, code: 'UNKNOWN_COMMISSION', message: '没有这份委托。' };
  if (!partySize(cleared)) return { ok: false, code: 'LOCKED', message: '通关正式第五章后开放委托板。' };
  const party = ['hero', ...book.party.filter((id) => ownerJoined(id, cleared))];
  const B = {
    v: 1, commission: c.id, title: c.title, challenge: Boolean(c.challenge), rng: (Number.isInteger(seed) ? seed : Math.floor(Math.random() * 2 ** 31)) >>> 0,
    round: 0, order: [], cursor: 0, actions: 0, resonance: 0, potions: POTIONS, units: {}, allies: [], enemies: [], log: [],
    field: [], turret: null, trigger: 0, result: null, reward: null, oath: book.oath && party.includes(book.oath) && personalCleared(book.oath, cleared) ? book.oath : null,
    oathUsed: false, combos: {}, lastSkill: null, delayPhase: 0, trueSight: 0, teamLastStand: false, tauntCost: 0, negateSkill: 0, negateSure: 0,
    passives: {}, started: now,
  };
  for (const id of party) {
    B.units[id] = makeAlly(id, book.loadout[id], book.levels);
    B.allies.push(id);
    if (id !== 'hero') {
      B.passives[id] = { once: ['lia', 'mia', 'serena'].includes(id), used: false };
      const combo = SKILL_DATA.combos[id];
      if (combo && reached(combo.unlock, highest)) B.combos[id] = { name: combo.name, veils: combo.veils || [], unlocked: true };
    }
  }
  for (const [id, cb] of Object.entries(B.combos)) {
    let name = cb.name;
    for (const v of cb.veils) if (!reached(v.until, highest)) name = v.name;
    B.combos[id] = { name };
  }
  c.enemies.forEach((key, i) => { const e = makeEnemy(key, i, c.challenge); B.units[e.id] = e; B.enemies.push(e.id); });
  say(B, `委托开始：${c.title}。`, 'sys');
  newRound(B);
  runUntilPlayer(B);
  account.skillBattle = B;
  return { ok: true, battle: publicBattle(B) };
}

// ─── 回合 ───
function speedOf(B, u) { return effStat(u, 'spd', B); }
function newRound(B) {
  B.round += 1;
  const all = [...B.allies, ...B.enemies].map((id) => B.units[id]).filter((u) => !u.down);
  all.sort((x, y) => speedOf(B, y) - speedOf(B, x) || (x.side === y.side ? 0 : x.side === 'ally' ? -1 : 1));
  B.order = all.map((u) => u.id);
  B.cursor = 0;
  for (const u of all) u.acted = false;
  B.ignoreFirst = false;
}
function endRound(B) {
  // 回合结束：持续效果、领域、炮台、冷却、MP
  for (const u of [...allyUnits(B), ...enemyUnits(B)]) {
    for (const s of u.st) {
      if (s.k === 'burn' || s.k === 'poison') { const d = Math.round(u.maxHp * (s.k === 'burn' ? 0.05 : 0.04)); u.hp = Math.max(1, u.hp - d); say(B, `${u.name}受到${statusName(s.k)} ${d}`, u.side === 'ally' ? 'hurt' : 'hit'); }
      if (s.k === 'regen') heal(B, u, u, s.v, { quiet: true });
      if (s.k === 'seed') { s.left -= 1; if (s.left <= 0) { seedBurst(B, u, s); s.t = 0; } }
      if (s.t === 1) expire(B, u, s);
    }
    u.st = u.st.filter((s) => (s.t = s.t - 1) > 0 || s.t === Infinity || s.keep);
    if (u.side === 'ally') {
      u.mp = Math.min(u.maxMp, u.mp + u.mpRegen);
      for (const id of Object.keys(u.cd)) { u.cd[id] -= 1; if (u.cd[id] <= 0) delete u.cd[id]; }
      if (u.formCd > 0) u.formCd -= 1;
    }
    if (u.broken > 0) u.broken -= 1;
  }
  for (const f of B.field) {
    if (f.regen) for (const u of allyUnits(B)) heal(B, u, u, f.regen, { quiet: true });
    if (f.bells) {
      const low = allyUnits(B).sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp).slice(0, f.bells.n);
      for (const u of low) { heal(B, u, u, f.bells.amount); addSt(B, u, 'breakFree', 0, Infinity, { keep: true }); }
    }
    if (f.breaths) {
      f.breaths -= 1;
      if (f.breaths <= 0) { for (const u of allyUnits(B)) for (const [id, v] of Object.entries(u.cd)) if (skillById(id)?.tier !== 'red') { u.cd[id] = v - f.cdCut; if (u.cd[id] <= 0) delete u.cd[id]; } say(B, '三息数完：全队冷却缩短。', 'good'); f.t = 0; }
    }
  }
  for (const f of B.field) if (f.t === 1 && f.thaw) { for (const u of allyUnits(B)) addSt(B, u, 'shield', f.thaw, 2); say(B, '融雪地化开：全队得到护盾。', 'good'); }
  B.field = B.field.filter((f) => (f.t -= 1) > 0);
  if (B.hunt) { B.hunt.t -= 1; B.hunt.left = 3; if (B.hunt.t <= 0) B.hunt = null; }
  if (B.turret) {
    const target = enemyUnits(B).sort((x, y) => x.hp - y.hp)[0];
    if (target) hit(B, B.units[B.turret.by] || { name: '零号', side: 'ally', owner: 'mia', base: { atk: 0, mag: 12 }, st: [] }, target, { stat: 'mag', coef: 0.4, I: B.turret.I, name: '零号炮台', element: 'metal' });
    if (target && B.turret.pierce) addSt(B, target, 'armorBreak', 0, 1);
    B.turret.t -= 1;
    if (B.turret.t <= 0) { say(B, '零号炮台收起来了。'); B.turret = null; }
  }
  gainRes(B, ROUND_RES); // 每回合结束 +5：只靠弱点与破防，没有弱点可打的队伍几乎放不出赤月与合击
  if (B.delayPhase > 0) B.delayPhase -= 1;
  if (B.trueSight > 0) B.trueSight -= 1;
  if (B.tauntCost > 0) B.tauntCost -= 1;
  for (const e of enemyUnits(B)) if (e.phaseHeld && !(B.delayPhase > 0)) checkPhase(B, e);
}
// 到期时才发生的效果：炎盾回响爆炸、城垣崩落（+10）、决斗结束的圣雷斩（+10）、冰棺融化（+10）
function expire(B, u, s) {
  if (s.k === 'echo') {
    const n = s.stored || 0;
    if (n > 0) { for (const e of enemyUnits(B)) { applyDamage(B, e, n, u); if (e.st.some((x) => x.k === 'guarded' || x.k === 'shield')) addBreak(B, e, 10); if (s.extra) addSt(B, e, 'armorBreak', 0, 2); } say(B, `炎盾回响：护盾爆成火焰，全体敌人受到 ${n}。`, 'hit'); }
  }
  if (s.k === 'rampartFall') { for (const e of enemyUnits(B)) { hit(B, u, e, { stat: 'atk', coef: 1, I: s.I, element: 'fire', name: '城垣崩落', isSkill: true }); addSt(B, e, 'armorBreak', 0, 2); } }
  if (s.k === 'duelMark' && s.finisher && u.hp > u.maxHp * 0.5) { const t = B.units[s.with]; if (t && !t.down) hit(B, u, t, { stat: 'atk', coef: 1, I: s.finisher, element: 'thunder', name: '圣雷斩', isSkill: true }); }
  if (s.k === 'invuln' && s.melt) heal(B, u, u, s.melt);
}
function seedBurst(B, u, s) {
  const src = B.units[s.by];
  if (!src) return;
  say(B, `噩梦种子爆发。`, 'hit');
  hit(B, src, u, { stat: 'mag', coef: 1, I: s.I, element: 'dark', name: '噩梦种子', isSkill: true });
  if (s.spread) { const other = enemyUnits(B).find((x) => x !== u); if (other) hit(B, src, other, { stat: 'mag', coef: 0.5, I: s.I, element: 'dark', name: '噩梦种子' }); }
}

function current(B) { return B.units[B.order[B.cursor]]; }
function advanceCursor(B) {
  B.cursor += 1;
  while (B.cursor < B.order.length) {
    const u = B.units[B.order[B.cursor]];
    if (u && !u.down && !u.acted) return;
    B.cursor += 1;
  }
}
function checkEnd(B) {
  if (!enemyUnits(B).length) { B.result = 'won'; say(B, '委托完成。', 'sys'); return true; }
  if (!allyUnits(B).length) { B.result = 'lost'; say(B, '全员倒地，撤退了。', 'sys'); return true; }
  return false;
}
/** 跑敌方回合，直到轮到我方或分出结果。 */
function runUntilPlayer(B) {
  for (let guard = 0; guard < 200; guard += 1) {
    if (checkEnd(B)) return;
    if (B.cursor >= B.order.length) { endRound(B); if (checkEnd(B)) return; newRound(B); }
    const u = current(B);
    if (!u || u.down || u.acted) { advanceCursor(B); continue; }
    if (u.side === 'ally') {
      if (has(u, 'stun') || has(u, 'freeze') || has(u, 'invuln')) {
        say(B, `${u.name}${has(u, 'invuln') ? '在冰里' : '动不了'}，跳过这一回合。`);
        u.acted = true;
        B.actions += 1;
        advanceCursor(B);
        continue;
      }
      return;
    }
    enemyTurn(B, u);
    u.acted = true;
    B.actions += 1;
    advanceCursor(B);
  }
}

// ─── 敌方行动 ───
function pickAllyTarget(B, e, move) {
  const allies = allyUnits(B);
  if (!allies.length) return null;
  const taunt = e.st.find((s) => s.k === 'taunted');
  if (taunt && B.units[taunt.by] && !B.units[taunt.by].down) return B.units[taunt.by];
  const duel = e.st.find((s) => s.k === 'duel');
  if (duel && B.units[duel.with] && !B.units[duel.with].down) return B.units[duel.with];
  const rampart = allies.find((u) => has(u, 'rampart'));
  if (rampart) return rampart;
  const weights = allies.map((u) => {
    let w = u.row === 'front' ? 2 : 1;
    if (move.back && u.row === 'back') w += 1.5;
    if (has(u, 'lightStep')) w *= Math.max(0.2, 1 - st(u, 'lightStep').v);
    return w;
  });
  let roll = nextRand(B) * weights.reduce((a, b) => a + b, 0);
  let target = allies[allies.length - 1];
  for (let i = 0; i < allies.length; i += 1) { roll -= weights[i]; if (roll < 0) { target = allies[i]; break; } }
  // 截击：莉莉丝的「死角截击」与被动「死角归我」——瞄准后排或濒危的队友时
  const lil = B.units.lilith;
  if (lil && !lil.down && target !== lil && (target.row === 'back' || target.hp <= target.maxHp * 0.3)) {
    const ic = st(lil, 'intercept');
    if (ic && ic.n > 0) {
      ic.n -= 1;
      say(B, '莉莉丝瞬移截击。', 'good');
      hit(B, lil, e, { stat: 'atk', coef: 0.6, I: ic.I, element: 'wood', name: '死角截击', counter: true });
      addSt(B, e, 'dmgUp', ic.weaken, 1);
    } else if (passive(B, 'lilith', target)) {
      say(B, '莉莉丝的「死角归我」：她截在了前面。', 'good');
      hit(B, lil, e, { stat: 'atk', coef: 0.6, I: 1, element: 'wood', name: '截击', counter: true });
      return lil;
    }
  }
  return target;
}
function enemyTurn(B, e) {
  if (e.broken > 0) { say(B, `${e.name}还没从破防里缓过来。`); return; }
  if (has(e, 'stun') || has(e, 'freeze') || has(e, 'invuln')) { say(B, `${e.name}动不了。`); return; }
  let move;
  if (e.charge) {
    move = e.charge;
    e.charge = null;
    removeSt(e, (s) => s.k === 'charging');
    move = { ...move, type: move.aoe ? 'aoe' : 'hit', release: true };
  } else {
    const usable = e.moves.filter((m) => !(m.skill && has(e, 'silence')));
    let roll = nextRand(B) * usable.reduce((a, m) => a + m.w, 0);
    move = usable[usable.length - 1];
    for (const m of usable) { roll -= m.w; if (roll < 0) { move = m; break; } }
    if (move.type === 'charge') {
      const hib = (B.field || []).some((f) => f.hibernate);
      e.charge = { ...move, delay: hib ? 1 : 0 };
      addSt(B, e, 'charging', 0, Infinity, { keep: true });
      say(B, `${e.name}开始蓄力「${move.name}」！`, 'warn');
      return;
    }
  }
  if (e.charge?.delay) { e.charge.delay -= 1; say(B, `${e.name}的蓄力被冬眠拖慢了。`); return; }
  // 技能无效（银月返照、龙忆一页）与必中无效（烬火城垣）
  if ((move.skill || move.release) && B.negateSkill > 0) { B.negateSkill -= 1; say(B, `「${move.name}」被抵消了。`, 'good'); return; }
  if (move.sure && B.negateSure > 0) { B.negateSure -= 1; say(B, `「${move.name}」的必中被城垣挡掉了。`, 'good'); return; }
  const I = 1;
  if (move.type === 'buff') {
    for (const x of enemyUnits(B)) addSt(B, x, 'dmgDown', 0.1, 2);
    say(B, `${e.name}「${move.name}」：敌方受到的伤害降低。`, 'warn');
    return;
  }
  if (move.type === 'debuff') {
    const targets = move.aoe ? allyUnits(B) : [pickAllyTarget(B, e, move)];
    say(B, `${e.name}「${move.name}」。`, 'warn');
    for (const t of targets) if (t) addSt(B, t, move.status, move.status === 'curse' ? 0.2 : 0, move.status === 'freeze' || move.status === 'stun' ? 1 : 2);
    return;
  }
  if (move.type === 'aoe') {
    say(B, `${e.name}「${move.name}」！`, 'warn');
    let absorb = 0;
    const scale = allyUnits(B).find((u) => has(u, 'scaleGuard'));
    if (scale) { absorb = st(scale, 'scaleGuard').v; removeSt(scale, (s) => s.k === 'scaleGuard'); say(B, '鳞光替全队吸收了一部分。', 'good'); }
    for (const t of allyUnits(B)) {
      const before = t.hp;
      if (absorb > 0) addSt(B, t, 'shield', absorb, 1);
      hit(B, e, t, { stat: move.magic ? 'mag' : 'atk', coef: move.coef, I, aoe: true, skill: move.skill, magic: move.magic, name: move.name });
      if (move.status && t.hp < before) addSt(B, t, move.status, 0, 2);
    }
    return;
  }
  const t = pickAllyTarget(B, e, move);
  if (!t) return;
  if (B.turret && !move.aoe) { say(B, '零号炮台替队伍挡下了这一击，收起来了。', 'good'); B.turret = null; return; }
  const before = t.hp;
  hit(B, e, t, { stat: move.magic ? 'mag' : 'atk', coef: move.coef, I, skill: move.skill, magic: move.magic, name: move.name, ranged: move.back });
  if (move.status && t.hp < before) addSt(B, t, move.status, 0, 2);
}

// ─── 我方行动 ───
const isEnemy = (B, id) => B.enemies.includes(id) && !B.units[id]?.down;
const isAlly = (B, id) => B.allies.includes(id) && !B.units[id]?.down;
function defaultEnemy(B) { return enemyUnits(B).sort((x, y) => (has(y, 'charging') ? 1 : 0) - (has(x, 'charging') ? 1 : 0) || x.hp - y.hp)[0]; }
function defaultAlly(B) { return allyUnits(B).sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0]; }

/** 当前角色可用的指令（前端菜单；不可用的带理由）。 */
export function availableActions(B) {
  const u = current(B);
  if (!u || u.side !== 'ally' || B.result) return null;
  const skills = u.loadout.map((slot, i) => {
    if (!slot) return null;
    const s = skillById(slot.id);
    const c = skillCosts(s, slot.level);
    let why = '';
    if (has(u, 'overheat')) why = '过热中';
    else if (has(u, 'silence')) why = '被沉默';
    else if (u.cd[s.id]) why = `冷却 ${u.cd[s.id]}`;
    else if (s.tier === 'red' && u.redUsed) why = '一场一次';
    else if (u.mp < c.mp) why = 'MP 不足';
    else if (s.tier === 'red' && B.resonance < c.resonance) why = `共鸣 ${c.resonance}`;
    else if (B.field.some((f) => f.breaths && f.by === u.id) && s.id !== 'hero_count_off') why = '数息中';
    else if (s.id === 'ophelia_half_dragon' && (has(u, 'form') || u.formCd > 0)) why = '还不能变身';
    else if (s.id === 'hero_reverse_moon' && !enemyUnits(B).some((e) => e.broken > 0 || e.brk >= 70)) why = '没有破绽';
    return { slot: i + 1, id: s.id, name: s.name, tier: s.tier, level: slot.level, mp: c.mp, resonance: c.resonance, target: s.target, usable: !why, why };
  });
  const combos = u.id === 'hero'
    ? Object.entries(B.combos).filter(([h]) => isAlly(B, h)).map(([h, c]) => ({ with: h, name: c.name, usable: B.resonance >= SKILL_DATA.fixed.combo.resonance, why: B.resonance >= SKILL_DATA.fixed.combo.resonance ? '' : '共鸣 30' }))
    : (B.combos[u.id] && isAlly(B, 'hero') ? [{ with: u.id, name: B.combos[u.id].name, usable: B.resonance >= SKILL_DATA.fixed.combo.resonance, why: B.resonance >= SKILL_DATA.fixed.combo.resonance ? '' : '共鸣 30' }] : []);
  const oath = u.id === 'hero' && B.oath ? { with: B.oath, name: SKILL_DATA.oaths[B.oath].name, usable: !B.oathUsed && B.resonance >= MAX_RES && isAlly(B, B.oath), why: B.oathUsed ? '已用过' : B.resonance < MAX_RES ? '共鸣 100' : !isAlly(B, B.oath) ? '她倒地了' : '' } : null;
  return { actor: u.id, skills, combos, oath, potions: B.potions, canAttack: !(B.field.some((f) => f.breaths && f.by === u.id)) };
}

/** 执行一个指令（POST /api/commission/act）。action：{ type: 'attack'|'skill'|'defend'|'item'|'combo'|'oath', slot?, target?, with? } */
export function actCommission(account, action, now = Date.now()) {
  const B = account.skillBattle;
  if (!B) return { ok: false, code: 'NO_BATTLE', message: '没有进行中的委托。' };
  if (B.result) return { ok: false, code: 'BATTLE_OVER', message: '这场委托已经结束。' };
  const u = current(B);
  if (!u || u.side !== 'ally') return { ok: false, code: 'NOT_YOUR_TURN', message: '还没轮到我方。' };
  const err = doAction(B, u, action || {});
  if (err) return { ok: false, code: 'BAD_ACTION', message: err };
  u.acted = true;
  B.actions += 1;
  advanceCursor(B);
  runUntilPlayer(B);
  let reward = null;
  if (B.result && !B.reward) reward = settle(account, B, now);
  return { ok: true, battle: publicBattle(B), reward: reward || B.reward || null };
}

export function fleeCommission(account) {
  if (!account.skillBattle) return { ok: true };
  account.skillBattle = null;
  return { ok: true };
}

function doAction(B, u, a) {
  const breaths = B.field.find((f) => f.breaths && f.by === u.id);
  if (a.type === 'attack') {
    if (breaths) return '数息中只能用「报数」或防御。';
    const t = B.units[isEnemy(B, a.target) ? a.target : defaultEnemy(B)?.id];
    if (!t) return '没有目标。';
    const form = has(u, 'form');
    const el = { hero: 'none', lia: 'fire', mia: 'metal', serena: 'dark', evelyn: 'light', aila: 'light', freya: 'ice', ophelia: 'earth', lilith: 'wood' }[u.owner];
    hit(B, u, t, { stat: u.owner === 'serena' || u.owner === 'freya' || u.owner === 'evelyn' || u.owner === 'mia' ? 'mag' : 'atk', coef: 1, I: 1, element: el, name: form ? '爪尾横扫' : '' });
    if (form) { const other = enemyUnits(B).find((x) => x !== t); if (other) hit(B, u, other, { stat: 'atk', coef: 1, I: 1, element: 'earth', name: '爪尾横扫' }); }
    afterAllyHit(B, u, t);
    return null;
  }
  if (a.type === 'defend') {
    addSt(B, u, 'defUp', 0.5, 1);
    addSt(B, u, 'dmgDown', 0.3, 1);
    u.mp = Math.min(u.maxMp, u.mp + 10);
    say(B, `${u.name}防御。`);
    return null;
  }
  if (a.type === 'item') {
    if (breaths) return '数息中只能用「报数」或防御。';
    if (B.potions <= 0) return '药剂用完了。';
    const t = B.units[isAlly(B, a.target) ? a.target : defaultAlly(B).id];
    const boost = B.trigger > 0 ? 1 + B.triggerI * 0.2 : 1;
    heal(B, u, t, t.maxHp * 0.3 * boost);
    if (B.trigger > 0) { B.trigger -= 1; say(B, '万能扳机：这一瓶没有消耗。', 'good'); }
    else B.potions -= 1;
    if (B.turret) { const e = defaultEnemy(B); if (e) hit(B, B.units.mia || u, e, { stat: 'mag', coef: 0.4, I: B.turret.I, name: '零号炮台', element: 'metal' }); }
    if (B.potions === 0 && B.units.mia && passive(B, 'mia', B.units.mia)) { B.potions = 1; say(B, '米娅的「备用件当然有」：又摸出一瓶低阶药剂。', 'good'); }
    return null;
  }
  if (a.type === 'combo') {
    const h = u.id === 'hero' ? a.with : u.id;
    if (!B.combos[h] || !isAlly(B, h) || !isAlly(B, 'hero')) return '合击要两人都在场。';
    if (B.resonance < SKILL_DATA.fixed.combo.resonance) return '共鸣不足 30。';
    gainRes(B, -SKILL_DATA.fixed.combo.resonance);
    say(B, `合击「${B.combos[h].name}」！`, 'combo');
    COMBO_LOGIC[h](B, B.units.hero, B.units[h], SKILL_DATA.fixed.combo.index, a.target);
    return null;
  }
  if (a.type === 'oath') {
    if (u.id !== 'hero' || !B.oath) return '誓约只能由亚克发动。';
    if (B.oathUsed) return '誓约技一场一次。';
    if (B.resonance < MAX_RES) return '共鸣不足 100。';
    if (!isAlly(B, B.oath)) return '她倒地了。';
    B.oathUsed = true;
    gainRes(B, -MAX_RES);
    const o = SKILL_DATA.oaths[B.oath];
    say(B, `誓约：「${o.line}」——${o.name}！`, 'oath');
    OATH_LOGIC[B.oath](B, u, B.units[B.oath], SKILL_DATA.fixed.oath.index, a.target);
    return null;
  }
  if (a.type === 'skill') {
    const slot = u.loadout[(Number(a.slot) || 0) - 1];
    if (!slot) return '这一格没有技能。';
    const s = skillById(slot.id);
    const info = availableActions(B).skills[(Number(a.slot) || 0) - 1];
    if (!info?.usable) return `现在不能用「${s.name}」：${info?.why || ''}`;
    const c = skillCosts(s, slot.level);
    const free = has(u, 'countFree') && s.tier !== 'red';
    if (!free) u.mp -= c.mp;
    removeSt(u, (x) => x.k === 'countFree');
    if (c.cd === 'battle') u.redUsed = true; else if (c.cd > 0) u.cd[s.id] = c.cd + 1;
    if (s.tier === 'red') {
      const freeRes = has(u, 'redFree');
      removeSt(u, (x) => x.k === 'redFree');
      if (!freeRes) gainRes(B, -c.resonance);
    }
    const I = effectiveIndex(s, slot.level);
    say(B, `${u.name}「${s.name}」${s.tier === 'red' ? '——' + (s.text.line || '') : ''}`, s.tier === 'red' ? 'red' : s.tier === 'purple' ? 'purple' : 'skill');
    const ctx = { B, u, s, I, lv: slot.level, p10: slot.level >= 10, target: a.target };
    SKILL_LOGIC[s.id](ctx);
    if (s.id !== 'mia_any_trigger') B.lastSkill = { owner: u.id, id: s.id };
    if (B.trigger > 0 && s.id !== 'mia_any_trigger') { B.trigger -= 1; }
    return null;
  }
  return '不认识的指令。';
}
function afterAllyHit(B, u, t) {
  // 一毫米：本回合第一个出手的队友必中、额外破防
  const mm = t && st(t, 'oneMm');
  if (mm && mm.n > 0 && u.owner !== 'hero') { mm.n -= 1; addBreak(B, t, mm.v); say(B, '一毫米：这一下刚好卡进缝里。', 'good'); if (mm.n <= 0) removeSt(t, (s) => s === mm); }
  // 逆月破 +10：下一位攻击同一目标的队友伤害提升（一次）
  // 万影追猎：每位队友的攻击附影标并触发莉莉丝追击
  if (t && B.hunt && B.hunt.t > 0 && u.owner !== 'lilith' && B.hunt.left > 0 && B.units.lilith && !B.units.lilith.down) {
    B.hunt.left -= 1;
    addSt(B, t, 'mark', B.hunt.mark, 1);
    hit(B, B.units.lilith, t, { stat: 'atk', coef: 0.3, I: B.hunt.I, element: 'wood', name: '追猎', sureHit: true });
    if (B.hunt.pierce) addSt(B, t, 'armorBreak', 0, 1);
  }
}

// ─── 技能逻辑（技能稿 5.5；I 已按颜色与等级算好）───
const T_ENEMY = (c) => c.B.units[isEnemy(c.B, c.target) ? c.target : defaultEnemy(c.B)?.id];
const T_ALLY = (c, notSelf = false) => {
  if (isAlly(c.B, c.target) && !(notSelf && c.target === c.u.id)) return c.B.units[c.target];
  const list = allyUnits(c.B).filter((x) => !(notSelf && x === c.u)).sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp);
  return list[0] || c.u;
};
const pct = (I, k = 1) => r2(I * 0.1 * k);
const dot = (c, t, coef, extra = {}) => { const d = hit(c.B, c.u, t, { stat: 'atk', coef, I: c.I, element: c.s.element, name: c.s.name, isSkill: true, ...extra }); afterAllyHit(c.B, c.u, t); return d; };
const aoe = (c, coef, extra = {}) => { for (const t of enemyUnits(c.B)) { hit(c.B, c.u, t, { stat: 'mag', coef, I: c.I, element: c.s.element, name: c.s.name, isSkill: true, ...extra }); } };
const SKILL_LOGIC = {
  // 亚克
  hero_seven_flash(c) {
    const { B, u } = c;
    const t = T_ENEMY(c);
    const turns = c.p10 ? 2 : 1;
    // 自动选律：有蓄力的敌人 → 光（揭示）；有燃烧的队友 → 水；否则金（破防）
    const burning = allyUnits(B).find((x) => has(x, 'burn'));
    if (enemyUnits(B).some((e) => has(e, 'charging'))) { const e = enemyUnits(B).find((x) => has(x, 'charging')); addSt(B, e, 'scanned', 0, turns); say(B, `光律「掌心光」：看清了${e.name}的下一招——${e.charge?.name || '蓄力'}。`, 'good'); }
    else if (burning) { removeSt(burning, (s) => s.k === 'burn'); say(B, `水律「一缕」：${burning.name}身上的火灭了。`, 'good'); }
    else if (t) { addSt(B, t, 'oneMm', c.I * 5, turns, { n: 1, v: c.I * 5 }); say(B, `金律「硬一瞬」：${t.name}下一次被打中时多破一点防。`, 'good'); }
    addSt(B, u, 'lightStep', pct(c.I), turns);
  },
  hero_count_off(c) {
    const { B, u } = c;
    // 指定一名尚未行动的队友：她本回合的行动提前到亚克之后（不增加行动次数）
    const cand = allyUnits(B).filter((x) => x !== u && !x.acted);
    const t = cand.find((x) => x.id === c.target) || cand[0];
    gainRes(B, 5);
    if (!t) { say(B, '报数：大家都已经动过了。'); return; }
    const i = B.order.indexOf(t.id);
    if (i > B.cursor) { B.order.splice(i, 1); B.order.splice(B.cursor + 1, 0, t.id); }
    const bonus = pct(c.I) + (B.field.some((f) => f.breaths) ? r2(B.field.find((f) => f.breaths).bonus) : 0);
    addSt(B, t, 'countBonus', bonus, 1);
    if (c.p10) addSt(B, t, 'countFree', 0, 1);
    say(B, `报数：${t.name}应声，提前出手（效果 +${Math.round(bonus * 100)}%）。`, 'good');
  },
  hero_one_millimeter(c) {
    const t = T_ENEMY(c);
    if (!t) return;
    const v = c.I * 10 * (t.construct ? 1.5 : 1);
    addSt(c.B, t, 'oneMm', v, 1, { n: c.p10 ? 2 : 1, v });
    say(c.B, `一毫米：盯住了${t.name}。`, 'good');
  },
  hero_reverse_moon(c) {
    const { B } = c;
    const t = isEnemy(B, c.target) && (B.units[c.target].broken > 0 || B.units[c.target].brk >= 70) ? B.units[c.target] : enemyUnits(B).find((e) => e.broken > 0 || e.brk >= 70);
    if (!t) return;
    hit(B, c.u, t, { stat: 'atk', coef: 1, I: 1, name: c.s.name, isSkill: true, break: c.I * 15 });
    if (t.broken > 0) t.broken += 1;
    if (c.p10) addSt(B, t, 'dmgUp', pct(c.I), 1);
  },
  hero_shout_reach_throw(c) {
    const { B } = c;
    const n = c.p10 ? 2 : 1;
    const cand = B.allies.map((id) => B.units[id]).filter((x) => x.down || x.hp <= x.maxHp * 0.3).sort((x, y) => (y.down ? 1 : 0) - (x.down ? 1 : 0));
    if (!cand.length) { say(B, '喊·伸·抛：没有人需要拉。'); return; }
    for (const t of cand.slice(0, n)) {
      if (t.down && !t.revived) { t.down = false; t.revived = true; t.hp = Math.max(1, Math.round(t.maxHp * c.I * 0.05)); say(B, `${t.name}被拉了回来。`, 'good'); gainRes(B, 10); }
      else if (!t.down) { addSt(B, t, 'shield', Math.round(effStat(t, 'def') * c.I * SCALE), 2); removeSt(t, (s) => DEBUFF_KINDS.includes(s.k), 1); gainRes(B, 10); say(B, `${t.name}被拉到后排，套上了护盾。`, 'good'); }
      t.row = 'back';
    }
  },
  hero_three_breaths(c) {
    c.B.field.push({ breaths: 3, t: 4, by: c.u.id, bonus: pct(c.I, 0.5), cdCut: c.p10 ? 2 : 1 });
    say(c.B, '「给我三息——我数。」', 'good');
  },
  hero_full_roll_call(c) {
    const { B, u } = c;
    const waiting = B.order.slice(B.cursor + 1).filter((id) => isAlly(B, id) && !B.units[id].acted);
    B.order = [...B.order.slice(0, B.cursor + 1), ...waiting, ...B.order.slice(B.cursor + 1).filter((id) => !waiting.includes(id))];
    for (const id of waiting) addSt(B, B.units[id], 'rollCall', pct(c.I), 1);
    if (c.p10 && waiting[0]) addSt(B, B.units[waiting[0]], 'redFree', 0, 1);
    gainRes(B, 20);
    B.ignoreFirst = true;
    say(B, `全员报数：${waiting.map((id) => B.units[id].name).join('、') || '——'}依序出手。`, 'good');
  },
  // 莉亚
  lia_shield_bash(c) {
    const t = T_ENEMY(c);
    if (!t) return;
    dot(c, t, 1);
    addSt(c.B, c.u, 'defUp', pct(c.I), 1);
    addSt(c.B, t, 'taunted', 0, c.p10 ? 2 : 1, { by: c.u.id });
  },
  lia_red_line_guard(c) {
    const t = T_ALLY(c, true);
    addSt(c.B, t, 'guard', r2(c.I * 0.25), 2, { by: c.u.id, heal: c.p10 ? r2(c.I * 0.02) : 0 });
    say(c.B, `「人，我守。」莉亚护住了${t.name}。`, 'good');
  },
  lia_step_back(c) {
    for (const x of allyUnits(c.B)) { addSt(c.B, x, 'dmgDown', pct(c.I), 2); addSt(c.B, x, 'counter', 0.5, 2, { I: c.I, melee: true, name: '后退反击', element: 'fire' }); if (c.p10) removeSt(x, (s) => s.k === 'fear'); }
    say(c.B, '全队后退一步。', 'good');
  },
  lia_shield_stop(c) {
    const { B } = c;
    const charging = enemyUnits(B).find((e) => has(e, 'charging')) || T_ENEMY(c);
    if (charging?.charge) { charging.charge = null; removeSt(charging, (s) => s.k === 'charging'); say(B, `盾响——${charging.name}的蓄力被打断了。`, 'good'); if (c.p10) addSt(B, charging, 'spdDown', pct(c.I), 2); }
    for (const e of enemyUnits(B)) addSt(B, e, 'taunted', 0, 2, { by: c.u.id });
    for (const x of allyUnits(B)) addSt(B, x, 'defUp', pct(c.I), 2);
  },
  lia_flame_echo(c) {
    addSt(c.B, c.u, 'echo', r2(c.I * 0.15), 3, { stored: 0, extra: c.p10 ? 10 : 0 });
    say(c.B, '炎盾回响：挡下的伤害会烧回去。', 'good');
  },
  lia_ember_rampart(c) {
    const { B, u } = c;
    addSt(B, u, 'rampart', 0, 3);
    addSt(B, u, 'dmgDown', pct(c.I), 3);
    addSt(B, u, 'counter', 0.4, 3, { I: c.I, name: '城垣反击', element: 'fire' });
    B.negateSure += 1;
    if (c.p10) addSt(B, u, 'rampartFall', 0, 3, { I: c.I });
    say(B, '城垣立起：所有单体攻击都会指向莉亚。', 'good');
  },
  // 米娅
  mia_weak_scan(c) {
    const t = T_ENEMY(c);
    if (!t) return;
    addSt(c.B, t, 'scanned', pct(c.I), c.p10 ? 2 : 1);
    say(c.B, `扫描：${t.name}的弱点是${(t.weak || []).map(elName).join('、') || '——'}。`, 'good');
  },
  mia_quick_patch(c) {
    const t = T_ALLY(c);
    heal(c.B, c.u, t, healAmt(c.u, c.I));
    removeSt(t, (s) => s.k === 'armorBreak' || s.k === 'overheat', 1);
    if (c.p10) addSt(c.B, t, 'shield', Math.round(healAmt(c.u, c.I, 0.3)), 2);
  },
  mia_coil_bomb(c) {
    aoe(c, 0.7, { element: 'thunder' });
    for (const e of enemyUnits(c.B)) if (chance(c.B, Math.min(0.95, c.I * 0.25))) addSt(c.B, e, 'stun', 0, 1);
    if (!c.p10) addSt(c.B, c.u, 'overheat', 0, 2);
  },
  mia_turret_zero(c) {
    c.B.turret = { by: c.u.id, I: c.I, t: c.p10 ? 4 : 3, pierce: c.p10 };
    say(c.B, '零号炮台部署完毕。', 'good');
  },
  mia_any_trigger(c) {
    c.B.trigger = c.p10 ? 2 : 1;
    c.B.triggerI = c.I;
    say(c.B, '万能扳机：下一次用的道具不消耗，效果更好。', 'good');
  },
  mia_unplanned_disassembly(c) {
    const { B } = c;
    const device = enemyUnits(B).find((e) => e.device);
    if (device) { device.hp = 0; knockDown(B, device); say(B, `${device.name}被直接拆掉了。`, 'good'); }
    aoe(c, 1, { break: c.I * 10, element: 'metal' });
    addSt(B, c.u, 'overheat', 0, c.p10 ? 2 : 3);
    if (c.p10) B.turret = { by: c.u.id, I: c.I, t: 2 };
  },
  // 塞雷娜
  serena_shadow_bind(c) {
    const t = T_ENEMY(c);
    if (!t) return;
    addSt(c.B, t, 'spdDown', pct(c.I), c.p10 ? 3 : 2);
    say(c.B, `影子缠住了${t.name}。`, 'good');
  },
  serena_mirror_step(c) {
    const t = T_ALLY(c, true);
    const tr = t.row; t.row = c.u.row; c.u.row = tr;
    addSt(c.B, t, 'dodge', 0, 2, { n: c.p10 ? 2 : 1 });
    addSt(c.B, c.u, 'dmgDown', pct(c.I), 1);
    say(c.B, `镜步：塞雷娜和${t.name}换了一步。`, 'good');
  },
  serena_night_veil(c) {
    for (const x of allyUnits(c.B)) { addSt(c.B, x, 'dmgDown', pct(c.I), 2); addSt(c.B, x, 'hitDown', pct(c.I, 0.5), 2); }
    if (c.p10) { const e = defaultEnemy(c.B); if (e) addSt(c.B, e, 'scanned', 0, 1); }
    say(c.B, '夜幕盖住了全队。', 'good');
  },
  serena_nightmare_seed(c) {
    const t = T_ENEMY(c);
    if (!t) return;
    addSt(c.B, t, 'seed', 0, 4, { left: 2, by: c.u.id, I: c.I, spread: c.p10 });
    say(c.B, `${t.name}被种下了噩梦。`, 'good');
  },
  serena_secret_drain(c) {
    const t = T_ENEMY(c);
    if (!t) return;
    const n = removeSt(t, (s) => ['dmgDown', 'guarded', 'atkUp', 'defUp'].includes(s.k), c.p10 ? 2 : 1);
    if (n) { addSt(c.B, c.u, 'dmgDown', 0.15, 2); say(c.B, `夺走了${t.name}的 ${n} 个增益。`, 'good'); }
    for (const x of allyUnits(c.B)) x.mp = Math.min(x.maxMp, x.mp + Math.round(c.I * 5));
  },
  serena_silver_return(c) {
    for (const x of allyUnits(c.B)) { addSt(c.B, x, 'reflect', c.I, 2, { n: c.p10 ? 2 : 1, all: true }); addSt(c.B, x, 'dodge', 0, 2, { n: 1 }); }
    say(c.B, '每个人都点了头。镜子成形了。', 'good');
  },
  // 伊芙琳
  evelyn_star_heal(c) { const t = T_ALLY(c); heal(c.B, c.u, t, healAmt(c.u, c.I), { overflowShield: c.p10 ? Math.round(effStat(c.u, 'heal') * 0.3 * SCALE) : 0 }); },
  evelyn_tear_cleanse(c) {
    const t = T_ALLY(c);
    removeSt(t, (s) => ['curse', 'fear', 'silence'].includes(s.k), c.p10 ? 2 : 1);
    const low = 1 + Math.min(1, 1 - t.hp / t.maxHp);
    heal(c.B, c.u, t, healAmt(c.u, c.I, 0.5) * low);
  },
  evelyn_prayer_barrier(c) {
    const targets = [T_ALLY(c)];
    if (c.p10) { const other = allyUnits(c.B).filter((x) => x !== targets[0]).sort((x, y) => x.hp - y.hp)[0]; if (other) targets.push(other); }
    for (const t of targets) { addSt(c.B, t, 'lastStand', 0, Infinity, { keep: true }); addSt(c.B, t, 'shield', Math.round(healAmt(c.u, c.I)), 3); }
    say(c.B, `祈愿屏障护住了${targets.map((t) => t.name).join('、')}。`, 'good');
  },
  evelyn_courage_chorus(c) { for (const x of allyUnits(c.B)) { addSt(c.B, x, 'atkUp', pct(c.I), c.p10 ? 3 : 2); addSt(c.B, x, 'resistUp', pct(c.I), c.p10 ? 3 : 2); removeSt(x, (s) => s.k === 'fear'); } say(c.B, '大家一起唱。', 'good'); },
  evelyn_three_bells(c) { c.B.field.push({ bells: { n: c.p10 ? 2 : 1, amount: Math.round(healAmt(c.u, c.I, 0.5)) }, t: 3 }); say(c.B, '祈祷铃响了。', 'good'); },
  evelyn_myriad_names(c) {
    for (const x of allyUnits(c.B)) {
      heal(c.B, c.u, x, healAmt(c.u, c.I), { quiet: true });
      removeSt(x, (s) => DEBUFF_KINDS.includes(s.k));
      addSt(c.B, x, 'immune_sin', 0, 3);
      if (c.p10) addSt(c.B, x, 'shield', Math.round(healAmt(c.u, c.I, 0.5)), 2);
    }
    say(c.B, '她唱出了记得的每一个名字。全队回复并净化。', 'good');
  },
  // 艾拉
  aila_light_leap(c) { const t = T_ENEMY(c); if (!t) return; dot(c, t, 1, { pierce: c.p10 }); addSt(c.B, t, 'taunted', 0, 1, { by: c.u.id }); },
  aila_defiant_stance(c) { addSt(c.B, c.u, 'counter', 0.6, 2, { I: c.I, name: '反逆', element: 'light', weaken: c.p10 ? pct(c.I, 0.5) : 0 }); addSt(c.B, c.u, 'defUp', pct(c.I, 0.5), 2); say(c.B, '艾拉摆开了架势。', 'good'); },
  aila_thunder_duel(c) {
    const t = T_ENEMY(c);
    if (!t) return;
    addSt(c.B, t, 'duel', pct(c.I), 2, { with: c.u.id });
    addSt(c.B, c.u, 'duelMark', pct(c.I), 2, { with: t.id, finisher: c.p10 ? c.I : 0 });
    say(c.B, `艾拉和${t.name}进入决斗。`, 'good');
  },
  aila_mirror_shield(c) { addSt(c.B, c.u, 'reflect', c.I, 2, { n: c.p10 ? 2 : 1 }); addSt(c.B, c.u, 'defUp', pct(c.I), 2); say(c.B, '明镜盾举起来了。', 'good'); },
  aila_taunt_call(c) {
    for (const x of allyUnits(c.B)) addSt(c.B, x, 'critUp', pct(c.I), 2);
    for (const e of enemyUnits(c.B)) addSt(c.B, e, 'taunted', 0, 1, { by: c.u.id });
    if (!c.p10) c.B.tauntCost = 2;
  },
  aila_skylight_rider(c) {
    const { B, u } = c;
    for (const e of enemyUnits(B)) hit(B, u, e, { stat: 'atk', coef: 1, I: c.I, element: 'thunder', name: c.s.name, isSkill: true });
    const top = enemyUnits(B).sort((x, y) => y.maxHp - x.maxHp)[0];
    if (top) {
      const turns = c.p10 ? 3 : 2;
      addSt(B, top, 'duel', 0, turns, { with: u.id });
      addSt(B, u, 'counter', 1, turns, { I: c.I, name: '决斗圈反击', element: 'thunder', crit: true });
      B.delayPhase = Math.max(B.delayPhase, turns);
      say(B, `决斗圈：${top.name}只能攻击艾拉。`, 'good');
    }
  },
  // 芙蕾娅
  freya_frost_ring(c) { aoe(c, 0.5, { element: 'ice' }); if (c.p10) for (const e of enemyUnits(c.B)) addSt(c.B, e, 'spdDown', pct(c.I, 0.5), 1); },
  freya_still_snow(c) { for (const x of allyUnits(c.B)) addSt(c.B, x, 'regen', Math.round(healAmt(c.u, c.I, 0.3)), c.p10 ? 3 : 2); say(c.B, '静雪落下。', 'good'); },
  freya_ice_coffin(c) {
    const { B } = c;
    if (isEnemy(B, c.target) && B.units[c.target].kind !== 'boss') {
      const t = B.units[c.target];
      addSt(B, t, 'stun', 0, 2);
      addSt(B, t, 'dmgDown', 0.5, 2);
      say(B, `${t.name}被冰封了。`, 'good');
      return;
    }
    const t = T_ALLY(c);
    removeSt(t, (s) => s.k === 'burn' || s.k === 'poison');
    addSt(B, t, 'invuln', 0, 2, { melt: c.p10 ? Math.round(healAmt(c.u, c.I)) : 0 });
    say(B, `${t.name}被冰棺护住了。`, 'good');
  },
  freya_hibernation(c) { c.B.field.push({ hibernate: true, slow: pct(c.I), side: c.p10 ? 'enemy' : 'all', allyDr: pct(c.I, 0.5), t: 3 }); say(c.B, '冬眠领域展开。', 'good'); },
  freya_thaw_water(c) {
    for (const x of allyUnits(c.B)) {
      const n = removeSt(x, (s) => ['burn', 'poison', 'curse'].includes(s.k));
      if (n) heal(c.B, c.u, x, healAmt(c.u, c.I, 0.3) * n, { quiet: true });
      if (c.p10) addSt(c.B, x, 'immune_all3', 0, 2);
    }
    say(c.B, '融水洗掉了火、毒与诅咒。', 'good');
  },
  freya_first_thaw(c) {
    const { B } = c;
    B.field = B.field.filter((f) => !f.hazard);
    B.field.push({ regen: Math.round(healAmt(c.u, c.I, 0.3)), t: 3, thaw: c.p10 ? Math.round(healAmt(c.u, c.I, 0.5)) : 0 });
    for (const e of enemyUnits(B)) addSt(B, e, 'spdDown', pct(c.I), 3);
    for (const x of allyUnits(B)) addSt(B, x, 'immune_stasis', 0, 3);
    say(B, '第一场融雪：场地化成了融雪地。', 'good');
  },
  // 奥菲利亚
  ophelia_rock_breath(c) { aoe(c, 0.5, { element: 'earth' }); if (c.p10) { const e = enemyUnits(c.B)[0]; if (e) addSt(c.B, e, 'spdDown', 0.3, 1); } },
  ophelia_wing_guard(c) { for (const x of allyUnits(c.B)) addSt(c.B, x, 'dmgDown', pct(c.I), c.p10 ? 2 : 1); say(c.B, '双翼护住了全队。', 'good'); },
  ophelia_half_dragon(c) { const turns = c.p10 ? 4 : 3; addSt(c.B, c.u, 'form', 0, turns); addSt(c.B, c.u, 'atkUp', pct(c.I), turns); addSt(c.B, c.u, 'defUp', pct(c.I), turns); c.u.formCd = c.p10 ? 0 : turns + 1; say(c.B, '奥菲利亚半化成龙。', 'good'); },
  ophelia_dragon_tongue(c) {
    const { B } = c;
    for (const e of enemyUnits(B)) { addSt(B, e, 'spdDown', pct(c.I), 2); addSt(B, e, 'dmgUp', pct(c.I, 0.5), 2); }
    const ch = enemyUnits(B).find((e) => has(e, 'charging')) || T_ENEMY(c);
    if (ch?.charge) { ch.charge = null; removeSt(ch, (s) => s.k === 'charging'); say(B, `${ch.name}的咏唱被打断了。`, 'good'); }
    if (c.p10 && ch) addSt(B, ch, 'silence', 0, 1);
  },
  ophelia_scale_regen(c) { for (const x of allyUnits(c.B)) addSt(c.B, x, 'regen', Math.round(healAmt(c.u, c.I, 0.3)), c.p10 ? 4 : 3); addSt(c.B, c.u, 'scaleGuard', Math.round(effStat(c.u, 'def') * c.I * SCALE), c.p10 ? 4 : 3); say(c.B, '鳞光护住了大家。', 'good'); },
  ophelia_one_page(c) {
    const { B } = c;
    const top = enemyUnits(B).sort((x, y) => y.maxHp - x.maxHp)[0];
    if (top?.charge) { top.charge = null; removeSt(top, (s) => s.k === 'charging'); say(B, `读到了${top.name}的那一页：大招被抵消。`, 'good'); }
    else B.negateSkill += 1;
    const el = top?.weak?.[0] || 'earth';
    for (const e of enemyUnits(B)) hit(B, c.u, e, { stat: 'mag', coef: 1, I: c.I, element: el, name: c.s.name, isSkill: true });
    if (c.p10 && top) addSt(B, top, 'scanned', 0, 2);
  },
  // 莉莉丝
  lilith_shadow_mark(c) { const t = T_ENEMY(c); if (!t) return; addSt(c.B, t, 'mark', pct(c.I), c.p10 ? 4 : 3); say(c.B, `${t.name}被打上了影标。`, 'good'); },
  lilith_smoke_step(c) {
    addSt(c.B, c.u, 'dodge', 0, 2, { n: 1 });
    addSt(c.B, c.u, 'backstab', pct(c.I), 2);
    if (c.p10) { const t = T_ALLY(c, true); if (t !== c.u) addSt(c.B, t, 'dodge', 0, 2, { n: 1 }); }
    say(c.B, '一阵烟，莉莉丝不见了。', 'good');
  },
  lilith_twin_moon_stab(c) {
    const t = T_ENEMY(c);
    if (!t) return;
    const marked = has(t, 'mark');
    dot(c, t, 1, { crit: t.broken > 0 || marked });
    if (c.p10 && marked) { removeSt(t, (s) => s.k === 'mark', 1); dot(c, t, 0.4, { name: '第二刀' }); }
  },
  lilith_spell_cut(c) {
    const t = T_ENEMY(c);
    if (!t) return;
    dot(c, t, 0.6);
    addSt(c.B, t, 'silence', 0, c.p10 ? 4 : 3);
    if (t.charge) { t.charge = null; removeSt(t, (s) => s.k === 'charging'); say(c.B, `${t.name}的咏唱被切断了。`, 'good'); }
  },
  lilith_blind_spot(c) { addSt(c.B, c.u, 'intercept', 0, 2, { n: c.p10 ? 4 : 2, I: c.I, weaken: pct(c.I, 0.5) }); say(c.B, '死角，归她。', 'good'); },
  lilith_myriad_hunt(c) { c.B.hunt = { t: 3, left: 3, I: c.I, mark: pct(c.I), pierce: c.p10 }; c.B.trueSight = 3; say(c.B, '标记分给了所有人。', 'good'); },
};
const ELEMENT_NAMES = { fire: '火', metal: '金', thunder: '雷', water: '水', ice: '冰', earth: '土', light: '光', dark: '暗', wood: '木', none: '无' };
const elName = (e) => ELEMENT_NAMES[e] || e;

// ─── 合击（I＝2.20，共鸣 30；技能稿 5.2）───
const COMBO_LOGIC = {
  lia(B, hero, h, I, target) { const t = B.units[isEnemy(B, target) ? target : defaultEnemy(B)?.id]; if (!t) return; const a = effStat(h, 'atk') >= effStat(hero, 'atk') ? h : hero; hit(B, a, t, { stat: 'atk', coef: 1, I, noCap: true, element: 'fire', name: '合击', isSkill: true, break: I * 15 }); },
  aila(B, hero, h, I, target) { let n = 0; for (const x of allyUnits(B)) n += removeSt(x, (s) => s.k === 'taunted' || s.k === 'silence'); const t = B.units[isEnemy(B, target) ? target : defaultEnemy(B)?.id]; if (!t) return; hit(B, h, t, { stat: 'atk', coef: 1 + n * 0.2, I, element: 'light', name: '合击', isSkill: true }); },
  evelyn(B, hero, h, I) { for (const x of allyUnits(B)) { addSt(B, x, 'dmgDown', r2(I * 0.1), 2); heal(B, h, x, healAmt(h, I, 0.4), { quiet: true }); } say(B, '替伤改成了全队均摊。', 'good'); },
  lilith(B, hero, h, I, target) { const t = B.units[isEnemy(B, target) ? target : defaultEnemy(B)?.id]; if (!t) return; hit(B, h, t, { stat: 'atk', coef: 1, I, element: 'wood', name: '合击', isSkill: true }); addSt(B, t, 'mark', r2(I * 0.1), 2); },
  freya(B, hero, h, I, target) { const t = B.units[isEnemy(B, target) ? target : defaultEnemy(B)?.id]; if (!t) return; hit(B, h, t, { stat: 'mag', coef: 1, I, element: 'ice', name: '合击', isSkill: true, break: I * 20 }); },
  mia(B, hero, h, I, target) { const t = B.units[isEnemy(B, target) ? target : defaultEnemy(B)?.id]; if (!t) return; addSt(B, t, 'scanned', r2(I * 0.1), 2); say(B, `七律调试：${t.name}的弱点被调高了。`, 'good'); },
  ophelia(B, hero, h, I, target) { const t = B.units[isEnemy(B, target) ? target : defaultEnemy(B)?.id]; if (!t) return; hit(B, h, t, { stat: 'atk', coef: 1, I, element: 'earth', name: '合击', isSkill: true }); addSt(B, t, 'spdDown', r2(I * 0.1), 2); },
  serena(B, hero, h, I, target) { for (const e of enemyUnits(B)) addSt(B, e, 'exposed', 0, 1); const t = B.units[isEnemy(B, target) ? target : defaultEnemy(B)?.id]; if (t) hit(B, h, t, { stat: 'mag', coef: 1, I, element: 'dark', name: '合击', isSkill: true, sureHit: true }); },
};

// ─── 誓约技（I＝2.40，共鸣 100，一场一次；设11 §2.4 的效果定位）───
const OATH_LOGIC = {
  lia(B, hero, h, I) { B.teamLastStand = true; for (const e of enemyUnits(B)) addBreak(B, e, I * 20); },
  mia(B, hero, h, I) {
    const last = B.lastSkill && skillById(B.lastSkill.id);
    if (!last || !SKILL_LOGIC[last.id]) { say(B, '还没有可以复制的技能。'); return; }
    say(B, `零号复制了「${last.name}」。`, 'good');
    SKILL_LOGIC[last.id]({ B, u: B.units[B.lastSkill.owner] && !B.units[B.lastSkill.owner].down ? B.units[B.lastSkill.owner] : h, s: last, I, lv: 0, p10: false, target: null });
  },
  serena(B, hero, h) { for (const x of allyUnits(B)) removeSt(x, (s) => CONTROL.includes(s.k)); B.delayPhase = Math.max(B.delayPhase, 3); say(B, '暗域落下：控制解除，Boss 的下一次阶段转换被封住。', 'good'); },
  evelyn(B, hero, h, I) {
    for (const id of B.allies) {
      const x = B.units[id];
      if (x.down) { x.down = false; x.hp = Math.round(healAmt(h, I)); say(B, `${x.name}站了起来。`, 'good'); }
      else heal(B, h, x, healAmt(h, I, 0.5), { quiet: true });
      removeSt(x, (s) => DEBUFF_KINDS.includes(s.k));
    }
  },
  aila(B, hero, h, I) {
    let n = 0;
    for (const x of allyUnits(B)) n += removeSt(x, (s) => CONTROL.includes(s.k) || s.k === 'silence');
    for (let k = 0; k < Math.max(1, n); k += 1) for (const e of enemyUnits(B)) hit(B, h, e, { stat: 'atk', coef: 0.3, I, element: 'thunder', name: '光雷斩击', isSkill: true });
  },
  freya(B, hero, h) { for (const x of allyUnits(B)) { addSt(B, x, 'invuln', 0, 1); addSt(B, x, 'regen', Math.round(x.maxHp * 0.15), 2); } say(B, '这一回合的伤害都冻住了。', 'good'); },
  ophelia(B, hero, h, I) { for (const e of enemyUnits(B)) hit(B, h, e, { stat: 'mag', coef: 1, I, element: 'earth', name: '天穹俯冲', isSkill: true }); for (const [id] of Object.entries(hero.cd)) if (id === 'hero_seven_flash') delete hero.cd[id]; },
  lilith(B, hero, h, I) {
    const marked = enemyUnits(B).filter((e) => has(e, 'mark'));
    const list = marked.length ? marked : [defaultEnemy(B)].filter(Boolean);
    for (const e of list) hit(B, h, e, { stat: 'atk', coef: 0.6, I, element: 'wood', name: '无影', sureHit: true, isSkill: true });
    const last = list[list.length - 1];
    if (last && !last.down) hit(B, hero, last, { stat: 'atk', coef: 1, I: 1, name: '附律一击' });
  },
};

// ─── 结算 ───
function settle(account, B, now) {
  const book = ensureSkillbook(account, now);
  rollDay(book, now);
  const sm = SKILL_DATA.storyMaterials;
  const got = { white: 0, green: 0, blue: 0 };
  if (B.result === 'won') {
    book.commissions.total += 1;
    if (B.challenge) {
      if (book.commissions.challengeWins < sm.commissionChallenge.perWeek) { book.commissions.challengeWins += 1; got.green += sm.commissionChallenge.green; got.blue += sm.commissionChallenge.blue; }
    }
    if (book.commissions.dailyWins < sm.commissionDaily.wins) { book.commissions.dailyWins += 1; got.white += sm.commissionDaily.white; got.green += sm.commissionDaily.green; }
    else got.white += sm.commissionRepeat.white;
    for (const k of Object.keys(got)) book.materials[k] += got[k];
    logSkill(book, { type: 'commission', id: B.commission, ...got }, now);
  }
  B.reward = { result: B.result, materials: got, dailyWins: book.commissions.dailyWins, challengeWins: book.commissions.challengeWins };
  return B.reward;
}

// ─── 对外视图 ───
function publicUnit(u) {
  return {
    id: u.id, side: u.side, owner: u.owner || null, key: u.key || null, name: u.name, hp: u.hp, maxHp: u.maxHp, mp: u.mp ?? null, maxMp: u.maxMp ?? null,
    down: u.down, row: u.row, broken: u.broken || 0, brk: u.brk ?? null, charging: u.charge ? u.charge.name : null, kind: u.kind || null,
    weak: u.side === 'enemy' && u.st.some((s) => s.k === 'scanned') ? u.weak : undefined,
    st: u.st.filter((s) => s.k !== 'charging' && s.k !== 'oneMm').map((s) => ({ k: s.k, name: statusName(s.k), t: Number.isFinite(s.t) ? s.t : null })),
    loadout: u.side === 'ally' ? u.loadout.map((x) => (x ? { id: x.id, name: skillById(x.id).name, tier: skillById(x.id).tier, level: x.level } : null)) : undefined,
  };
}
/** 未来 6 个行动的顺序（设06:103）：本回合还没行动的，接着是下一回合按速度排的。 */
function previewOrder(B) {
  const rest = B.order.slice(B.cursor).filter((id) => !B.units[id].down && !B.units[id].acted);
  const next = [...B.allies, ...B.enemies].map((id) => B.units[id]).filter((u) => !u.down).sort((x, y) => speedOf(B, y) - speedOf(B, x)).map((u) => u.id);
  return [...rest, ...next].slice(0, 6);
}
export function publicBattle(B) {
  return {
    commission: B.commission, title: B.title, challenge: B.challenge, round: B.round, resonance: B.resonance, potions: B.potions,
    units: [...B.allies, ...B.enemies].map((id) => publicUnit(B.units[id])), allies: [...B.allies], enemies: [...B.enemies],
    current: B.result ? null : B.order[B.cursor] || null, order: previewOrder(B), field: B.field.map((f) => ({ t: f.t, kind: f.breaths ? '三息' : f.bells ? '铃响三声' : f.hibernate ? '冬眠领域' : f.regen ? '融雪地' : '领域' })),
    turret: B.turret ? { t: B.turret.t } : null, oath: B.oath ? { with: B.oath, name: SKILL_DATA.oaths[B.oath].name, used: B.oathUsed } : null,
    actions: availableActions(B), log: B.log.slice(-40), result: B.result, reward: B.reward,
  };
}

/** 测试与平衡用：用一个简单的策略把一场委托打完（每个角色按顺序用第一个能用的技能，否则普攻）。 */
/** 测试与平衡用的简单策略：有人危险先回复（技能或药剂），有蓄力先打断，否则用伤害技能，最后普攻。 */
export function simplePolicy(B, acts) {
  const u = B.units[acts.actor];
  const allies = allyUnits(B);
  const low = allies.filter((x) => x.hp < x.maxHp * 0.45).sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0];
  const usable = acts.skills.filter((x) => x && x.usable);
  const byTag = (tags) => usable.find((x) => (skillById(x.id).tags || []).some((t) => tags.includes(t)));
  if (acts.oath?.usable) return { type: 'oath' };
  if (low) {
    const h = byTag(['heal', 'regen', 'lastStand']);
    if (h) return { type: 'skill', slot: h.slot, target: low.id };
    if (low.hp < low.maxHp * 0.3 && acts.potions > 0) return { type: 'item', target: low.id };
  }
  const charging = enemyUnits(B).find((e) => has(e, 'charging'));
  if (charging) { const i = byTag(['interrupt', 'silence']); if (i) return { type: 'skill', slot: i.slot, target: charging.id }; }
  const combo = acts.combos.find((c) => c.usable);
  if (combo && B.resonance >= 60) return { type: 'combo', with: combo.with };
  const red = usable.find((x) => x.tier === 'red');
  if (red) return { type: 'skill', slot: red.slot };
  const dmg = byTag(['damage']);
  if (dmg) return { type: 'skill', slot: dmg.slot };
  // 辅助技能每三回合用一次，其余时间普攻（不重复刷同一个增益）
  const util = byTag(['mark', 'debuff', 'reveal', 'taunt', 'summon', 'buff', 'guard', 'advance', 'counter', 'dodge', 'form', 'duel', 'break', 'field']);
  if (util && B.round % 3 === 1 && !(skillById(util.id).tags || []).every((t) => ['heal', 'regen', 'cleanse', 'lastStand', 'shield'].includes(t))) return { type: 'skill', slot: util.slot };
  return acts.canAttack ? { type: 'attack' } : { type: 'defend' };
}

/** 测试与平衡用：用一个策略把一场委托打完（默认 simplePolicy）。 */
export function autoPlay(account, commissionId, { seed = 1, maxSteps = 600, policy = simplePolicy } = {}) {
  const start = startCommission(account, commissionId, { seed });
  if (!start.ok) return start;
  for (let i = 0; i < maxSteps && !account.skillBattle.result; i += 1) {
    const acts = availableActions(account.skillBattle);
    let res = actCommission(account, policy(account.skillBattle, acts));
    if (!res.ok) res = actCommission(account, { type: 'attack' });
    if (!res.ok) actCommission(account, { type: 'defend' });
  }
  return { ok: true, result: account.skillBattle.result, rounds: account.skillBattle.round, reward: account.skillBattle.reward };
}

export { ENEMIES };
