// 技能系统（剧本/README_技能五色與強化設計.md，技能稿；game/skills.mjs、game/skill-gacha.mjs、game/skill-battle.mjs）
import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS, TIERS, TIER_ORDER, effectiveIndex, skillCosts, enhanceCost, ensureSkillbook, enhanceSkill, equipSkills, convertMaterials, exchangeSkill, publicSkillbook, mainlineSkillLines, setParty, gaidenSkillBonus } from '../game/skills.mjs';
import { pullSkills, redChance, setSkillTarget, publicSkillPool, SKILL_GACHA } from '../game/skill-gacha.mjs';
import { recordChapterClear } from '../game/rewards.mjs';
import { startCommission, actCommission, availableActions, autoPlay, listCommissions, COMMISSIONS } from '../game/skill-battle.mjs';
import { buildPrompt, loadStoryChapter, battleSkillFacts } from '../game/story-judge.mjs';
import { findNode } from '../public/story/engine.js';

const chapterIds = (upTo) => Array.from({ length: upTo + 1 }, (_, i) => `ch${String(i).padStart(3, '0')}`);
function accountUpTo(upTo, extra = {}) {
  const acc = { id: 't', diamonds: 0, rewards: {}, ...extra };
  for (const ch of chapterIds(upTo)) recordChapterClear(acc, ch);
  return acc;
}
// 可重复的随机数（mulberry32）
function seeded(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

test('技能稿 4.4: every colour band sits strictly above the one below (+10 of a colour < +0 of the next)', () => {
  for (let i = 0; i + 1 < TIER_ORDER.length; i += 1) {
    assert.ok(effectiveIndex(TIER_ORDER[i], 10) < effectiveIndex(TIER_ORDER[i + 1], 0), `${TIER_ORDER[i]}+10 < ${TIER_ORDER[i + 1]}+0`);
  }
  assert.equal(effectiveIndex('white', 0), 1.0);
  assert.equal(effectiveIndex('red', 10), 4.2);
});

test('技能稿 4.2: the enhance curve is 2,3,4,5,6,7,8,10,12,15 (72 in all) and +5 milestones apply', () => {
  const costs = Array.from({ length: 10 }, (_, lv) => enhanceCost(lv));
  assert.deepEqual(costs, [2, 3, 4, 5, 6, 7, 8, 10, 12, 15]);
  assert.equal(costs.reduce((a, b) => a + b, 0), 72);
  assert.equal(enhanceCost(10), null);
  const white = SKILLS.find((s) => s.tier === 'white');
  const red = SKILLS.find((s) => s.tier === 'red');
  assert.equal(skillCosts(white, 4).mp, 5);
  assert.equal(skillCosts(white, 5).mp, 0);
  assert.equal(skillCosts(red, 4).resonance, 50);
  assert.equal(skillCosts(red, 5).resonance, 40);
});

test('55 first-phase skills: 28 story (hero 4, each heroine 3), 18 purple, 9 red; one owner each', () => {
  assert.equal(SKILLS.length, 55);
  assert.equal(SKILLS.filter((s) => s.source === 'story').length, 28);
  assert.equal(SKILLS.filter((s) => s.tier === 'purple').length, 18);
  assert.equal(SKILLS.filter((s) => s.tier === 'red').length, 9);
  for (const s of SKILLS) assert.ok(TIERS[s.tier].source === s.source, s.id);
});

test('技能稿 3.1/3.2: first clears grant story materials and summon tickets (08/15/21/25 ×5, 30 ×10), once each, retroactively for old saves', () => {
  const acc = accountUpTo(30);
  const b = acc.skillbook;
  assert.equal(b.tickets, 30);
  // 31 章 × 白 6 / 绿 3 / 蓝 1；蓝另加幕界 5 章 ×5、个人章 9 章 ×5
  assert.deepEqual({ white: b.materials.white, green: b.materials.green, blue: b.materials.blue }, { white: 186, green: 93, blue: 31 + 25 + 45 });
  // 重复通关不再发
  recordChapterClear(acc, 'ch030');
  assert.equal(acc.skillbook.tickets, 30);
  // 旧存档（没有 skillbook）：按已通关章节补发
  const old = { id: 'o', diamonds: 0, rewards: { chaptersCleared: chapterIds(15) } };
  ensureSkillbook(old);
  assert.equal(old.skillbook.tickets, 10);
});

test('技能稿 3.2: soft pity from the 70th pull, hard pity at 80', () => {
  assert.equal(redChance(1), 0.008);
  assert.equal(redChance(69), 0.008);
  assert.ok(Math.abs(redChance(70) - 0.088) < 1e-9);
  assert.ok(Math.abs(redChance(79) - 0.808) < 1e-9);
  assert.equal(redChance(80), 1);
});

test('秘技召唤 Monte Carlo: about 1.8% red and 13.4% purple, a red at least every 80 pulls, an epic at least every 10', () => {
  const acc = accountUpTo(30, { diamonds: 10 ** 9 });
  const rng = seeded(7);
  let reds = 0, purples = 0, sinceRed = 0, sinceEpic = 0, maxSinceRed = 0, maxSinceEpic = 0;
  const N = 20000;
  for (let i = 0; i < N / 10; i += 1) {
    const r = pullSkills(acc, 10, { rng });
    for (const x of r.results) {
      sinceRed += 1; sinceEpic += 1;
      if (x.kind === 'skill' && x.tier === 'red') { reds += 1; maxSinceRed = Math.max(maxSinceRed, sinceRed); sinceRed = 0; sinceEpic = 0; }
      else if (x.kind === 'skill' && x.tier === 'purple') { purples += 1; maxSinceEpic = Math.max(maxSinceEpic, sinceEpic); sinceEpic = 0; }
    }
  }
  assert.ok(reds / N > 0.014 && reds / N < 0.022, `red ${reds / N}`);
  assert.ok(purples / N > 0.115 && purples / N < 0.155, `purple ${purples / N}`);
  assert.ok(maxSinceRed <= 80);
  assert.ok(maxSinceEpic <= 10);
});

test('秘技召唤: the target red comes within 160 pulls; duplicates turn into pages; tickets pay one pull each', () => {
  const acc = accountUpTo(30, { diamonds: 10 ** 9 });
  assert.equal(setSkillTarget(acc, 'lia_ember_rampart').ok, true);
  assert.equal(setSkillTarget(acc, 'lia_shield_stop').ok, false); // 只能选赤月
  const rng = seeded(11);
  let n = 0;
  while (!acc.skillbook.owned.lia_ember_rampart) { pullSkills(acc, 1, { rng }); n += 1; assert.ok(n <= 160, 'target within 160'); }
  // 重复：暮紫×10、赤月×15
  let dupSeen = false;
  for (let i = 0; i < 300 && !dupSeen; i += 1) {
    const r = pullSkills(acc, 10, { rng });
    for (const x of r.results) if (x.kind === 'skill' && x.duplicate) { dupSeen = true; assert.equal(x.converted.qty, SKILL_GACHA.duplicate[x.tier]); }
  }
  assert.ok(dupSeen);
  const t = accountUpTo(8);
  assert.equal(t.skillbook.tickets, 5);
  assert.equal(pullSkills(t, 10, { payWith: 'tickets' }).ok, false);
  assert.equal(pullSkills(t, 1, { payWith: 'tickets' }).ok, true);
  assert.equal(t.skillbook.tickets, 4);
});

test('技能稿 3.2: the pool only holds skills of heroines who have joined (no spoilers, nothing unusable)', () => {
  const at5 = publicSkillPool(accountUpTo(5));
  const names = at5.rates.flatMap((r) => (r.items || []).map((i) => i.owner));
  assert.deepEqual([...new Set(names)].sort(), ['hero', 'lia']);
  const pool30 = publicSkillPool(accountUpTo(30));
  assert.equal(pool30.rates[0].items.length, 9);
  assert.equal(pool30.rates[1].items.length, 18);
});

test('技能稿 5.1: slot rules — ① story only, red only in ③, no duplicates; enhance spends the right material', () => {
  const acc = accountUpTo(30, { diamonds: 10 ** 9 });
  acc.skillbook.owned.lia_ember_rampart = { at: 0 };
  acc.skillbook.owned.lia_shield_stop = { at: 0 };
  assert.equal(equipSkills(acc, 'lia', ['lia_shield_stop', null, null]).ok, false);
  assert.equal(equipSkills(acc, 'lia', ['lia_shield_bash', 'lia_ember_rampart', null]).ok, false);
  assert.equal(equipSkills(acc, 'lia', ['lia_shield_bash', 'lia_shield_bash', null]).ok, false);
  assert.equal(equipSkills(acc, 'lia', ['lia_shield_bash', 'lia_shield_stop', 'lia_ember_rampart']).ok, true);
  assert.equal(equipSkills(acc, 'lia', ['lia_shield_bash', 'mia_weak_scan', null]).ok, false); // 技能绑定角色
  acc.skillbook.materials.red = 2;
  const r = enhanceSkill(acc, 'lia_ember_rampart');
  assert.equal(r.ok, true);
  assert.equal(acc.skillbook.materials.red, 0);
  assert.equal(enhanceSkill(acc, 'lia_ember_rampart').ok, false);
});

test('技能稿 4.3: conversions only go up; 40 暮紫 buys a chosen purple; tickets from pages; no chosen red', () => {
  const acc = accountUpTo(10);
  acc.skillbook.materials = { white: 9, green: 0, blue: 0, purple: 100, red: 10 };
  assert.equal(convertMaterials(acc, 'white', 'green', 3).ok, true);
  assert.deepEqual([acc.skillbook.materials.white, acc.skillbook.materials.green], [0, 3]);
  for (const [from, to] of [['green', 'white'], ['blue', 'green'], ['red', 'purple'], ['purple', 'blue']]) assert.equal(convertMaterials(acc, from, to).ok, false, `${from}>${to}`);
  assert.equal(exchangeSkill(acc, 'pickPurple', 'lia_shield_stop').ok, true);
  assert.equal(exchangeSkill(acc, 'pickPurple', 'lia_ember_rampart').ok, false);
  assert.equal(exchangeSkill(acc, 'pickPurple', 'freya_hibernation').ok, false); // 还没入队
  assert.equal(exchangeSkill(acc, 'ticketFromRed').ok, true);
  assert.equal(acc.skillbook.tickets, 5 + 1);
});

test('public skillbook: skills of heroines not yet joined are silhouettes (no name, no text)', () => {
  for (const upTo of [5, 12, 20, 30]) {
    const view = publicSkillbook(accountUpTo(upTo));
    for (const s of view.skills) {
      if (s.sealed) { assert.equal(s.name, '？？？'); assert.equal(s.text, undefined); }
    }
    const json = JSON.stringify(view);
    if (upTo < 21) assert.ok(!json.includes('影标') && !json.includes('莉莉丝'), `ch${upTo}`);
  }
});

test('技能稿 2.2: 「报数」moves a teammate up without giving anyone an extra action', () => {
  const acc = accountUpTo(12);
  startCommission(acc, 'marsh_ogre', { seed: 3 });
  const B = acc.skillBattle;
  // 记录每回合每个我方单位的行动次数
  const counts = {};
  for (let step = 0; step < 200 && !B.result; step += 1) {
    const acts = availableActions(B);
    const key = `${B.round}:${acts.actor}`;
    counts[key] = (counts[key] || 0) + 1;
    const count = acts.skills.find((s) => s && s.id === 'hero_count_off' && s.usable);
    actCommission(acc, count ? { type: 'skill', slot: count.slot } : { type: 'attack' });
  }
  for (const [k, n] of Object.entries(counts)) assert.equal(n, 1, `${k} acted ${n} times`);
});

test('委托板: every normal commission is clearable with story skills at +3; rewards follow the daily/weekly table', () => {
  const plan = { goblin_road: 5, scrap_picker: 9, tide_bugs: 10, marsh_ogre: 12, chief_hollow: 14, court_puppet: 16, frost_spirits: 18, supply_escort: 22, dream_griffin: 28 };
  for (const [id, upTo] of Object.entries(plan)) {
    let wins = 0;
    for (let seed = 1; seed <= 8; seed += 1) {
      const acc = accountUpTo(upTo);
      for (const s of SKILLS) if (s.source === 'story') acc.skillbook.levels[s.id] = 3;
      if (autoPlay(acc, id, { seed }).result === 'won') wins += 1;
    }
    assert.ok(wins >= 7, `${id}: ${wins}/8`);
  }
  const acc = accountUpTo(10);
  const now = Date.UTC(2026, 10, 2, 12);
  const got = [];
  for (let i = 0; i < 4; i += 1) {
    startCommission(acc, 'tide_bugs', { seed: i + 1, now });
    for (let k = 0; k < 300 && !acc.skillBattle.result; k += 1) actCommission(acc, { type: 'attack' }, now);
    got.push(acc.skillBattle.reward);
  }
  assert.ok(got.every((r) => r.result === 'won'));
  assert.deepEqual(got.map((r) => r.materials.white), [4, 4, 4, 1]);
  assert.equal(listCommissions(acc, now).daily.wins, 3);
  assert.ok(COMMISSIONS.every((c) => !/皇朝|叛军|反抗军/.test(c.desc) || Number(c.unlock.slice(2)) >= 16));
});

test('技能稿 6.3: the judge prompt for a skills:auto battle is the same whatever the account owns; ch000–ch010 unchanged', () => {
  const ch = loadStoryChapter('ch015');
  let node = null;
  const walk = (x) => { if (node || !x || typeof x !== 'object') return; if (Array.isArray(x)) { x.forEach(walk); return; } if (x.t === 'battle') node = findNode(ch, x.rounds[0].id); for (const v of Object.values(x)) walk(v); };
  walk(ch.shots);
  const facts = battleSkillFacts(ch, node.id);
  assert.ok(facts.length > 0);
  // 亚克最多 3 句（「一毫米」并进七闪附律）
  const heroLines = mainlineSkillLines('ch030', ['hero']);
  assert.equal(heroLines.length, 3);
  assert.ok(heroLines[0].includes('一毫米'));
  // 提示词只取决于章节与节点（buildPrompt 根本不接收账户）
  assert.equal(buildPrompt(ch, node, '亚克', [], '15+'), buildPrompt(ch, node, '亚克', [], '15+'));
  assert.ok(buildPrompt(ch, node, '亚克', [], '15+').includes(facts[0].replace('{PLAYER_NAME}', '亚克')));
  // ch000–ch010 的战斗没有 skills 字段：不注入任何东西
  for (const id of chapterIds(10)) {
    const c = loadStoryChapter(id);
    walk.done = false;
    const battles = [];
    const w2 = (x) => { if (!x || typeof x !== 'object') return; if (Array.isArray(x)) { x.forEach(w2); return; } if (x.t === 'battle') battles.push(x); for (const v of Object.values(x)) w2(v); };
    w2(c.shots);
    for (const b of battles) { assert.equal(b.skills, undefined, id); assert.deepEqual(battleSkillFacts(c, b.rounds[0].id), []); }
  }
});

test('委托板 party: hero is always in; one heroine after ch005, two after ch010', () => {
  assert.equal(setParty(accountUpTo(3), ['lia']).ok, false);
  const a5 = accountUpTo(5);
  assert.deepEqual(a5.skillbook.party, ['lia']);
  const a12 = accountUpTo(12);
  assert.equal(setParty(a12, ['lia']).ok, false);
  assert.equal(setParty(a12, ['mia', 'serena']).ok, true);
  assert.equal(setParty(a12, ['mia', 'freya']).ok, false);
});

test('技能稿 6.2: the side-story bonus needs a purple/red in her ③ slot and caps at +20%', () => {
  const acc = accountUpTo(12);
  assert.equal(gaidenSkillBonus(acc, 'lia'), 0);
  acc.skillbook.owned.lia_ember_rampart = { at: 0 };
  assert.equal(equipSkills(acc, 'lia', ['lia_shield_bash', 'lia_red_line_guard', 'lia_ember_rampart']).ok, true);
  assert.equal(gaidenSkillBonus(acc, 'lia'), 0.1);
  acc.skillbook.levels.lia_ember_rampart = 10;
  assert.equal(gaidenSkillBonus(acc, 'lia'), 0.2);
  assert.equal(gaidenSkillBonus(acc, 'mia'), 0);
  assert.equal(gaidenSkillBonus(null, 'lia'), 0);
});

test('誓约技: 春回霜华 freezes damage without freezing turns; 零号机·无限工坊 waits for a skill to copy', () => {
  const acc = accountUpTo(30);
  acc.skillbook.party = ['freya', 'mia'];
  acc.skillbook.oath = 'freya';
  startCommission(acc, 'chief_hollow', { seed: 4 });
  const B = acc.skillBattle;
  while (availableActions(B).actor !== 'hero') actCommission(acc, { type: 'defend' });
  B.resonance = 100;
  assert.equal(actCommission(acc, { type: 'oath' }).ok, true);
  assert.ok(!B.log.some((l) => /芙蕾娅在冰里|米娅在冰里/.test(l.text)), 'nobody skips a turn');
  const acc2 = accountUpTo(30);
  acc2.skillbook.party = ['mia', 'lia'];
  acc2.skillbook.oath = 'mia';
  startCommission(acc2, 'chief_hollow', { seed: 4 });
  const B2 = acc2.skillBattle;
  while (availableActions(B2).actor !== 'hero') actCommission(acc2, { type: 'defend' });
  B2.resonance = 100;
  assert.equal(availableActions(B2).oath.usable, false);
  assert.equal(actCommission(acc2, { type: 'oath' }).ok, false);
  assert.equal(B2.resonance, 100);
});
