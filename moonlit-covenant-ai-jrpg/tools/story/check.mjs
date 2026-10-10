#!/usr/bin/env node
// 主线章节校验与自动试玩。
//   node tools/story/check.mjs                         校验全部章节并自动试玩
//   node tools/story/check.mjs ch000 --transcript      导出逐字稿（默认玩法）到 stdout，便于与剧本对照
//   node tools/story/check.mjs ch000 --play intent=0   每个节点都选第 N 个非沉默意图试玩
// 试玩策略：silent（全部沉默）、fallback（无法归类的输入）、每个意图各跑一遍（逐节点轮换），确保所有分支都能走到章末。

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
function inputFor(node, strategy, counter) {
  const choices = (node.intents || []).filter((x) => x.id !== node.silent);
  if (strategy && typeof strategy === 'object') {
    // 定点策略：目标节点选目标意图，其余节点选第 j 个意图（用于触达只在特定前置选择后出现的追问节点）
    const target = strategy.fixed[node.id] ? choices.find((x) => x.id === strategy.fixed[node.id]) : choices[strategy.j % choices.length];
    return target?.keywords?.[0] || '';
  }
  if (strategy === 'silent') return '';
  if (strategy === 'fallback') return '我挠了挠头，想了一下这件事到底意味着什么';
  const pick = choices[(strategy === 'rotate' ? counter : Number(strategy)) % choices.length];
  return pick?.keywords?.[0] || '';
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

let failed = false;
let prevRun = null;
for (const entry of index) {
  if (only.length && !only.includes(entry.id)) continue;
  const chapter = loadChapter(entry.id);
  if (!chapter) { console.log(`- ${entry.id}: （尚未转写）`); continue; }
  const errors = validateChapter(chapter, { speakers, locations });
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
  for (const s of strategies) {
    const r = play(chapter, s);
    if (!r.ok) { failed = true; console.log(`✗ ${entry.id} 策略 ${s} 未能走到章末`); break; }
    r.hit.forEach((h) => covered.add(h));
    if (s === 'rotate') main = r;
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
  console.log(`✓ ${entry.id} ${chapter.title}：${chapter.shots.length} 分镜 · ${main?.beats} 节拍 · ${main?.inputs} 次输入 · ${main?.chars} 字 · 估算 ${minutes} 分钟 · 意图覆盖 ${covered.size}/${allIntents.size}`);
  if (unreached.length) console.log(`   演示判定无法触达的意图（关键词与其他意图冲突？）：${unreached.slice(0, 12).join('，')}${unreached.length > 12 ? '…' : ''}`);
  // 跨章继承检查
  if (prevRun && main) {
    const cont = continueRun(prevRun, chapter);
    const r = play(chapter, 'rotate', cont);
    if (!r.ok) { failed = true; console.log(`✗ ${entry.id} 从上一章存档继续时未能走到章末`); }
  }
  prevRun = main?.run || null;
}
process.exitCode = failed ? 1 : 0;
