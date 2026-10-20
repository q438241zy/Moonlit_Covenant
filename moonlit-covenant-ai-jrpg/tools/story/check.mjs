#!/usr/bin/env node
// 主线章节校验与自动试玩。
//   node tools/story/check.mjs                         校验全部章节并自动试玩
//   node tools/story/check.mjs ch000 --transcript      导出逐字稿（默认玩法）到 stdout，便于与剧本对照
//   node tools/story/check.mjs ch000 --play intent=0   每个节点都选第 N 个非沉默意图试玩
// 试玩策略：silent（全部沉默）、fallback（无法归类的输入）、每个意图各跑一遍（逐节点轮换），确保所有分支都能走到章末。
// 意图覆盖同时统计「从本章开始」和「接续上一章各策略的存档」两种开局：只在特定前章结果下才出现的节点也算进覆盖。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRun, continueRun, next, resolveInput, demoJudge, validateChapter, eachBeat } from '../../public/story/engine.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const speakers = readJson('public/story/speakers.json');
const locations = readJson('public/story/locations.json');
const index = readJson('public/story/chapters/index.json');

const args = process.argv.slice(2);
const only = args.filter((a) => /^ch\d{3}$/.test(a));
const transcript = args.includes('--transcript');
const playArg = (args.find((a) => a.startsWith('intent=')) || '').split('=')[1];

function loadChapter(id) {
  const file = path.join(root, 'public/story/chapters', `${id}.json`);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
}

// 按策略给出输入文本：使用目标意图的第一个关键词，保证 demoJudge 能命中
// （整句关键词「=对」原样输入也能命中——判定时会去掉标点；排除词「!…」不能当示例，校验器要求它不排第一）
const sample = (intent) => (intent?.keywords || []).find((k) => k && k[0] !== '!') || '';
function inputFor(node, strategy, counter) {
  const choices = (node.intents || []).filter((x) => x.id !== node.silent);
  if (strategy && typeof strategy === 'object') {
    // 定点策略：目标节点选目标意图，其余节点选第 j 个意图（用于触达只在特定前置选择后出现的追问节点）
    const target = strategy.fixed[node.id] ? choices.find((x) => x.id === strategy.fixed[node.id]) : choices[strategy.j % choices.length];
    return sample(target);
  }
  if (strategy === 'silent') return '';
  if (strategy === 'fallback') return '我挠了挠头，想了一下这件事到底意味着什么';
  const pick = choices[(strategy === 'rotate' ? counter : Number(strategy)) % choices.length];
  return sample(pick);
}

function play(chapter, strategy, run = createRun({ chapter, playerName: '亚克' }), log = null) {
  let chars = 0, inputs = 0, beats = 0, counter = 0;
  const hit = new Set();
  for (let guard = 0; guard < 20000; guard += 1) {
    const item = next(run, chapter);
    if (item.kind === 'end') return { run, chars, inputs, beats, hit, ok: true };
    if (item.kind === 'shot') { log?.push(`\n## ${item.shot.id}｜${item.shot.title}  [${item.shot.bg}]`); continue; }
    if (item.kind === 'battle-start') { log?.push(`【战斗开始：${item.battle.title}】敌人：${item.battle.enemies.map((e) => `${e.name}(${e.hp})`).join('、')}`); continue; }
    if (item.kind === 'battle-end') { log?.push(`【战斗结束：${item.battle.result}】`); continue; }
    if (item.kind === 'input') {
      const nodeDef = findDef(chapter, item.node.id);
      const text = inputFor(nodeDef, strategy, counter++);
      const j = demoJudge(nodeDef, text);
      hit.add(`${nodeDef.id}:${j.intent}`);
      log?.push(`【自由输入 ${nodeDef.id}】${item.node.prompt}\n  > ${text || '（沉默）'}  → ${j.intent}`);
      resolveInput(run, chapter, j, text);
      inputs += 1;
      continue;
    }
    const b = item.beat;
    beats += 1;
    chars += (b.text || '').length + (b.lines || []).join('').length;
    if (log) {
      const who = b.t === 'say' ? (speakers[b.who] || chapter.speakers?.[b.who] || { name: b.who }).name.replace('{PLAYER_NAME}', run.playerName) : null;
      if (b.t === 'say') log.push(`**${who}**${b.note ? `（${b.note}）` : ''}：「${b.text}」`);
      else if (b.t === 'think') log.push(`（${b.text}）`);
      else if (b.t === 'narr') log.push(b.style === 'voice' ? `> ${b.text}` : b.text);
      else if (b.t === 'title') log.push(`【片名】${(b.lines || []).join(' / ')} ${b.title} ${b.subtitle || ''}`);
      else if (b.t === 'bg') log.push(`[背景 → ${b.bg}]`);
      else if (b.t === 'fx') log.push(`[特效 ${b.fx}]`);
    }
  }
  return { run, chars, inputs, beats, hit, ok: false };
}

function findDef(chapter, id) {
  let def = null;
  eachBeat(chapter, (beat) => { if (!def && beat.t === 'input' && beat.id === id) def = beat; });
  return def;
}

// 玩家看得见的提示文字（核#12 / B14）：
//   · 输入提示、占位文字、系统字幕、战斗情报、「自由输入：」分镜标题、章末「正史记录」（end.summary）不用「你」称呼玩家，一律写 {PLAYER_NAME}（剧本里的「亚克」）——
//     引号里的台词照常（角色对亚克说「你」没问题）；
//   · 剧本里的镜头指示（「镜头掠过……」）要转写成世界内的叙述，不能原样出现在叙述里。
const QUOTED = /“[^”]*”|「[^」]*」|‘[^’]*’|『[^』]*』/g;
const addressesPlayer = (s) => typeof s === 'string' && /你/.test(s.replace(QUOTED, ''));
function wordingErrors(chapter) {
  const errs = [];
  const say = (where, text, why) => errs.push(`${where}「${String(text).slice(0, 40)}」${why}`);
  for (const shot of chapter.shots || []) {
    if (/^自由输入[：:]/.test(shot.title || '') && addressesPlayer(shot.title)) say(`${shot.id} 分镜标题`, shot.title, '用了「你」，改用 {PLAYER_NAME}');
  }
  for (const s of chapter.end?.summary || []) if (addressesPlayer(s?.text)) say('章末正史记录', s.text, '用了「你」，改用 {PLAYER_NAME}');
  eachBeat(chapter, (beat) => {
    if (beat.t === 'input') {
      if (addressesPlayer(beat.prompt)) say(`${beat.id} prompt`, beat.prompt, '用了「你」，改用 {PLAYER_NAME}');
      if (addressesPlayer(beat.placeholder)) say(`${beat.id} placeholder`, beat.placeholder, '用了「你」，改用 {PLAYER_NAME}');
    } else if (beat.t === 'battle') {
      (beat.intel || []).forEach((s) => { if (addressesPlayer(s)) say(`${beat.id} 战斗情报`, s, '用了「你」，改用 {PLAYER_NAME}'); });
    } else if (beat.t === 'narr') {
      for (const s of [beat.text, beat.text15]) {
        if (beat.style === 'caption' && addressesPlayer(s)) say('系统字幕', s, '用了「你」，改用 {PLAYER_NAME}');
        if (typeof s === 'string' && s.includes('镜头')) say('叙述', s, '是镜头指示，改写成世界内的叙述');
      }
    }
  });
  return errs;
}

let failed = false;
let prevRuns = [];
for (const entry of index) {
  if (only.length && !only.includes(entry.id)) continue;
  const chapter = loadChapter(entry.id);
  if (!chapter) {
    // 标题页只读目录、不预载章节：目录里写了 file 就必须真有这个文件（还没转写的章节不要写 file，标题页会显示「制作中」）
    if (entry.file) { failed = true; console.log(`✗ ${entry.id} 目录写了 file ${entry.file}，但章节文件不存在`); } else console.log(`- ${entry.id}: （尚未转写）`);
    continue;
  }
  // 契约 K-9：标题页的「约 N 分钟」和章节名直接读 index.json，必须和章节文件一致
  const indexErrors = [];
  if (entry.file !== `/story/chapters/${entry.id}.json`) indexErrors.push(`file 应为 /story/chapters/${entry.id}.json（实际 ${entry.file}）`);
  if (entry.estimatedMinutes !== chapter.estimatedMinutes) indexErrors.push(`estimatedMinutes ${entry.estimatedMinutes} ≠ 章节文件 ${chapter.estimatedMinutes}`);
  if (entry.title !== chapter.title) indexErrors.push(`title「${entry.title}」≠ 章节文件「${chapter.title}」`);
  if (entry.number !== chapter.number) indexErrors.push(`number ${entry.number} ≠ 章节文件 ${chapter.number}`);
  if ((chapter.end?.next ?? null) !== (index[index.indexOf(entry) + 1]?.id ?? null)) indexErrors.push(`end.next ${chapter.end?.next} 与目录里的下一章 ${index[index.indexOf(entry) + 1]?.id ?? null} 不一致`);
  if (indexErrors.length) {
    failed = true;
    console.log(`✗ ${entry.id} 与 index.json 不一致：`);
    indexErrors.forEach((e) => console.log('   ' + e));
  }
  const errors = [...validateChapter(chapter, { speakers, locations }), ...wordingErrors(chapter)];
  if (errors.length) {
    failed = true;
    console.log(`✗ ${entry.id} 校验失败 ${errors.length} 处：`);
    errors.slice(0, 60).forEach((e) => console.log('   ' + e));
    continue;
  }
  if (transcript || playArg !== undefined) {
    const log = [`# ${chapter.title}`];
    play(chapter, playArg ?? 'rotate', undefined, log);
    console.log(log.join('\n'));
    continue;
  }
  const allIntents = new Set();
  eachBeat(chapter, (beat) => { if (beat.t === 'input') beat.intents.forEach((x) => allIntents.add(`${beat.id}:${x.id}`)); });
  const covered = new Set();
  let maxChoices = 1;
  eachBeat(chapter, (beat) => { if (beat.t === 'input') maxChoices = Math.max(maxChoices, beat.intents.filter((x) => x.id !== beat.silent).length); });
  const strategies = ['silent', 'fallback', 'rotate', ...Array.from({ length: maxChoices }, (_, i) => String(i))];
  let main = null;
  const runs = [];
  for (const s of strategies) {
    const r = play(chapter, s);
    if (!r.ok) { failed = true; console.log(`✗ ${entry.id} 策略 ${s} 未能走到章末`); break; }
    r.hit.forEach((h) => covered.add(h));
    runs.push(r.run);
    if (s === 'rotate') main = r;
  }
  // 跨章继承：上一章每种策略的章末存档接进本章，再按各策略试玩
  let carried = 0;
  for (const prev of prevRuns) {
    for (const s of strategies) {
      const r = play(chapter, s, continueRun(prev, chapter));
      if (!r.ok) { failed = true; console.log(`✗ ${entry.id} 从上一章存档继续（策略 ${s}）时未能走到章末`); break; }
      r.hit.forEach((h) => covered.add(h));
      carried += 1;
    }
  }
  // 补触达：对仍未覆盖的意图，固定该节点的选择，其余节点逐一尝试第 j 个意图
  for (const pair of [...allIntents].filter((h) => !covered.has(h))) {
    if (covered.has(pair)) continue;
    const [nodeId, intentId] = pair.split(':');
    for (let j = 0; j < maxChoices && !covered.has(pair); j += 1) {
      const r = play(chapter, { fixed: { [nodeId]: intentId }, j });
      if (!r.ok) { failed = true; console.log(`✗ ${entry.id} 定点策略 ${pair}/${j} 未能走到章末`); break; }
      r.hit.forEach((h) => covered.add(h));
    }
  }
  const minutes = main ? (main.chars / 320 + main.inputs * 0.4).toFixed(1) : '?';
  const unreached = [...allIntents].filter((h) => !covered.has(h));
  console.log(`✓ ${entry.id} ${chapter.title}：${chapter.shots.length} 分镜 · ${main?.beats} 节拍 · ${main?.inputs} 次输入 · ${main?.chars} 字 · 估算 ${minutes} 分钟 · 意图覆盖 ${covered.size}/${allIntents.size}${carried ? ` · 接续存档试玩 ${carried} 局` : ''}`);
  if (unreached.length) console.log(`   演示判定无法触达的意图（关键词与其他意图冲突？）：${unreached.slice(0, 12).join('，')}${unreached.length > 12 ? '…' : ''}`);
  prevRuns = runs;
}
process.exitCode = failed ? 1 : 0;
