// 主线剧情引擎（纯函数，浏览器与 Node 通用）。数据格式见 docs/STORY-ENGINE.md。
// run 为可 JSON 序列化的存档：游标是一组「路径 + 下标」帧，路径指向章节 JSON 里的节拍数组。

export const ENGINE_VERSION = 1;
export const DEFAULT_PLAYER_NAME = '亚克';

const DISPLAY = new Set(['narr', 'say', 'think', 'bg', 'fx', 'title']);
const BEAT_TYPES = new Set([...DISPLAY, 'set', 'if', 'input', 'battle']);
const INPUT_KINDS = new Set(['dialogue', 'action', 'tactic', 'vow', 'free']);
const FX = new Set(['shake', 'flash', 'fade-black', 'fade-in', 'desaturate', 'restore', 'blackout']);
const SILENCE = /^[\s.。…、，,!！?？~～—\-]*$|^[（(]?\s*(沉默|不说话|不语|无言|保持沉默|……)\s*[)）]?$/;
// 没有命中任何意图时，这些描写按沉默处理（如「（把剑插进土里，一言不发）」「（愣住，说不出话）」）
const SILENT_HINT = /一言不发|沉默|不说话|没有说话|说不出话|不发一语|默不作声|愣住|呆住|僵住/;

const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export function cleanName(name) {
  const s = String(name ?? '').replace(/[<>{}\[\]"'`\\]/g, '').trim().slice(0, 12);
  return s || DEFAULT_PLAYER_NAME;
}

export function createRun({ playerName, chapter, mode = '12+' }) {
  const run = {
    v: ENGINE_VERSION,
    chapterId: chapter.id,
    playerName: cleanName(playerName),
    mode: mode === '15+' ? '15+' : '12+',
    shotIdx: -1,
    stack: [],
    pending: null,
    bg: 'black',
    flags: {}, items: {}, vars: {}, memories: {},
    inputs: {}, voice: {}, morality: 0,
    battle: null,
    done: false,
    completed: [],
  };
  applySet(run, chapter.canon);
  return run;
}

// 进入下一章：继承所有变量与记录；本章 canon 只补齐缺失项
export function continueRun(prev, chapter) {
  const run = createRun({ playerName: prev.playerName, chapter, mode: prev.mode });
  for (const key of ['flags', 'items', 'vars', 'memories']) run[key] = { ...run[key], ...clone(prev[key]) };
  run.inputs = clone(prev.inputs) || {};
  run.voice = clone(prev.voice) || {};
  run.morality = prev.morality || 0;
  run.completed = [...new Set([...(prev.completed || []), prev.chapterId])];
  return run;
}

export function interpolate(text, run) {
  return String(text ?? '').replaceAll('{PLAYER_NAME}', run?.playerName || DEFAULT_PLAYER_NAME);
}

function resolvePath(chapter, path) {
  let node = chapter;
  for (const key of path) {
    if (node == null) return undefined;
    node = node[key];
  }
  return node;
}

export function applySet(run, set) {
  if (!set) return;
  for (const key of ['flags', 'items', 'vars', 'memories']) {
    if (set[key]) Object.assign(run[key], clone(set[key]));
  }
  for (const [k, n] of Object.entries(set.add || {})) run.vars[k] = (Number(run.vars[k]) || 0) + Number(n || 0);
}

function lookup(run, key) {
  if (key in run.flags) return run.flags[key];
  if (key in run.vars) return run.vars[key];
  if (key in run.items) return run.items[key];
  return undefined;
}

function compare(value, c) {
  if ('eq' in c) return value === c.eq;
  if ('gte' in c) return (Number(value) || 0) >= c.gte;
  if ('lte' in c) return (Number(value) || 0) <= c.lte;
  return Boolean(value);
}

export function evalCond(run, c) {
  if (!c) return true;
  if (Array.isArray(c)) return c.every((x) => evalCond(run, x));
  if (c.all) return c.all.every((x) => evalCond(run, x));
  if (c.any) return c.any.some((x) => evalCond(run, x));
  if (c.not) return !evalCond(run, c.not);
  if (c.flag) return compare(lookup(run, c.flag), c);
  if (c.item) return compare(run.items[c.item], c);
  if (c.var) return compare(run.vars[c.var], c);
  if (c.voice) return compare(run.voice[c.voice], c);
  if (c.mode) return run.mode === c.mode;
  if (c.battle) return run.vars[`${c.battle}_RESULT`] === c.is;
  if (c.intent) {
    const rec = run.inputs[c.intent];
    if (!rec) return false;
    const hit = (id) => rec.intent === id || rec.secondary === id;
    if (c.is) return hit(c.is);
    if (c.in) return c.in.some(hit);
    return true;
  }
  return false;
}

function present(beat, run) {
  const out = { ...beat };
  const useAlt = run.mode === '15+';
  if ('text' in beat) out.text = interpolate(useAlt && beat.text15 ? beat.text15 : beat.text, run);
  delete out.text15;
  if (beat.lines) out.lines = beat.lines.map((l) => interpolate(l, run));
  if (beat.title) out.title = interpolate(beat.title, run);
  if (beat.subtitle) out.subtitle = interpolate(beat.subtitle, run);
  return out;
}

export function publicNode(node, run) {
  return {
    id: node.id,
    kind: node.kind || 'free',
    prompt: interpolate(node.prompt, run),
    placeholder: interpolate(node.placeholder || '说点什么，或写下你的动作……', run),
    optional: Boolean(node.optional),
    focus: node.focus || [],
  };
}

function battleView(run) {
  const b = run.battle;
  return b && { id: b.id, title: b.title, objective: b.objective, bonus: b.bonus, intel: b.intel, player: { ...b.player }, enemies: b.enemies.map((e) => ({ ...e })), collateral: b.collateral, round: b.round };
}

function finishBattle(run) {
  const b = run.battle;
  if (!b) return null;
  const result = b.collateral > 0 ? 'collateral' : b.player.hp <= b.player.maxHp / 2 ? 'hurt' : 'clean';
  run.vars[`${b.id}_RESULT`] = result;
  run.vars[`${b.id}_ENEMIES_DOWN`] = b.enemies.filter((e) => e.hp <= 0).length;
  const view = { ...battleView(run), result };
  run.battle = null;
  return view;
}

// 推进到下一个需要展示的项目
export function next(run, chapter) {
  for (let guard = 0; guard < 10000; guard += 1) {
    if (run.done) return { kind: 'end', end: chapter.end || null };
    if (run.pending) {
      const node = resolvePath(chapter, run.pending.path);
      return { kind: 'input', node: publicNode(node, run), battle: battleView(run) };
    }
    const top = run.stack[run.stack.length - 1];
    if (!top) {
      run.shotIdx += 1;
      const shot = chapter.shots[run.shotIdx];
      if (!shot) {
        run.done = true;
        applySet(run, chapter.end?.set);
        run.completed = [...new Set([...(run.completed || []), chapter.id])];
        return { kind: 'end', end: chapter.end || null };
      }
      run.stack.push({ path: ['shots', run.shotIdx, 'beats'], idx: 0 });
      if (shot.bg) run.bg = shot.bg;
      return { kind: 'shot', shot: { id: shot.id, title: interpolate(shot.title, run), bg: run.bg, music: shot.music || null, ambience: shot.ambience || [] } };
    }
    const list = top.lines || resolvePath(chapter, top.path) || [];
    if (top.battle && run.battle) {
      const battleBeat = resolvePath(chapter, top.battle);
      if (battleBeat?.untilDefeated && run.battle.enemies.every((e) => e.hp <= 0)) top.idx = list.length;
    }
    if (top.idx >= list.length) {
      run.stack.pop();
      if (top.battle) {
        const summary = finishBattle(run);
        const battleBeat = resolvePath(chapter, top.battle);
        if (battleBeat?.after?.length) run.stack.push({ path: [...top.battle, 'after'], idx: 0 });
        return { kind: 'battle-end', battle: summary };
      }
      continue;
    }
    const beat = list[top.idx];
    const beatPath = top.lines ? null : [...top.path, top.idx];
    top.idx += 1;
    if (!beat || typeof beat !== 'object') continue;
    switch (beat.t) {
      case 'set':
        applySet(run, beat);
        continue;
      case 'if': {
        const branch = evalCond(run, beat.when) ? 'then' : 'else';
        if (beatPath && Array.isArray(beat[branch]) && beat[branch].length) run.stack.push({ path: [...beatPath, branch], idx: 0 });
        continue;
      }
      case 'input':
        run.pending = { path: beatPath };
        return { kind: 'input', node: publicNode(beat, run), battle: battleView(run) };
      case 'battle':
        run.battle = {
          id: beat.id, title: beat.title, objective: beat.objective || '', bonus: beat.bonus || '', intel: (beat.intel || []).map((s) => interpolate(s, run)),
          player: { hp: beat.player?.hp ?? 10, maxHp: beat.player?.hp ?? 10 },
          enemies: (beat.enemies || []).map((e) => ({ id: e.id, name: e.name, hp: e.hp, maxHp: e.hp })),
          collateral: 0, round: 0,
        };
        run.stack.push({ path: [...beatPath, 'rounds'], idx: 0, battle: beatPath });
        return { kind: 'battle-start', battle: battleView(run) };
      case 'bg':
        run.bg = beat.bg;
        return { kind: 'beat', beat: present(beat, run) };
      default:
        if (DISPLAY.has(beat.t)) return { kind: 'beat', beat: present(beat, run) };
        if (beat.who || beat.text) return { kind: 'beat', beat: present({ t: beat.who ? 'say' : 'narr', ...beat }, run) };
    }
  }
  throw new Error('剧情推进失控（可能存在循环结构）。');
}

export function sanitizeLines(lines, node) {
  if (!Array.isArray(lines)) return null;
  const allowed = new Set([...(node.focus || []), 'narr']);
  const out = [];
  for (const l of lines.slice(0, 4)) {
    const who = String(l?.who || '').trim();
    const text = String(l?.text || '').replace(/[<>]/g, '').trim().slice(0, 90);
    if (!text || !allowed.has(who)) return null;
    out.push(who === 'narr' ? { t: 'narr', text } : { t: 'say', who, text });
  }
  return out.length ? out : null;
}

export function resolveInput(run, chapter, judgement = {}, text = '') {
  if (!run.pending) throw new Error('当前没有等待输入的节点。');
  const nodePath = run.pending.path;
  const node = resolvePath(chapter, nodePath);
  const intents = node.intents || [];
  const byId = (id) => intents.findIndex((x) => x.id === id);
  let idx = byId(judgement.intent);
  if (idx < 0) idx = byId(String(text).trim() ? node.fallback : node.silent);
  if (idx < 0) idx = 0;
  const intent = intents[idx];
  const secIdx = node.multi && judgement.secondary && judgement.secondary !== intent.id ? byId(judgement.secondary) : -1;
  const secondary = secIdx >= 0 ? intents[secIdx] : null;
  const morality = clamp(Math.trunc(Number(judgement.morality ?? intent.morality ?? 0)) || 0, -2, 2);

  run.inputs[node.id] = {
    text: String(text).slice(0, 500),
    intent: intent.id,
    secondary: secondary?.id || null,
    quality: clamp(Math.trunc(Number(judgement.quality) || 1), 0, 3),
    morality,
    source: judgement.source || 'demo',
  };
  if (intent.voice) run.voice[intent.voice] = (run.voice[intent.voice] || 0) + 1;
  run.morality += morality;
  applySet(run, intent.set);
  if (secondary) applySet(run, secondary.set);
  if (node.storeAs) {
    run.vars[`${node.storeAs}_PRIMARY`] = intent.id;
    if (secondary) run.vars[`${node.storeAs}_SECONDARY`] = secondary.id;
  }
  const memory = String(judgement.memory || '').replace(/[<>]/g, '').trim().slice(0, 80);
  if (memory) run.memories[`MEMORY_${node.id}`] = memory;

  if (run.battle) {
    run.battle.round += 1;
    const effect = intent.effect || {};
    for (const [enemyId, delta] of Object.entries(effect.enemy || {})) {
      const enemy = run.battle.enemies.find((e) => e.id === enemyId);
      if (enemy) enemy.hp = clamp(enemy.hp + Number(delta || 0), 0, enemy.maxHp);
    }
    if (effect.player) run.battle.player.hp = clamp(run.battle.player.hp + Number(effect.player), 1, run.battle.player.maxHp);
    if (effect.collateral) run.battle.collateral += Number(effect.collateral);
  }

  run.pending = null;
  const generated = intent.reactionFixed ? null : sanitizeLines(judgement.reaction, node);
  if (generated) run.stack.push({ lines: generated, idx: 0 });
  else if (intent.reaction?.length) run.stack.push({ path: [...nodePath, 'intents', idx, 'reaction'], idx: 0 });
  return { intent: intent.id, label: intent.label, secondary: secondary?.id || null, battle: battleView(run) };
}

// ── 离线 / 演示模式判定：关键词计分 ──
export function demoJudge(node, text) {
  const raw = String(text ?? '').trim();
  const intents = node.intents || [];
  const find = (id) => intents.find((x) => x.id === id);
  if (!raw || SILENCE.test(raw)) {
    const silent = find(node.silent) || find(node.fallback) || intents[0];
    return { intent: silent.id, secondary: null, quality: 1, morality: silent.morality || 0, feasible: true, source: 'demo' };
  }
  const t = raw.toLowerCase();
  const scored = intents
    .filter((x) => x.id !== node.silent)
    .map((x, order) => ({ x, order, hits: (x.keywords || []).reduce((n, k) => n + (k && t.includes(String(k).toLowerCase()) ? 1 : 0), 0) }))
    .sort((a, b) => b.hits - a.hits || a.order - b.order);
  if (!scored[0]?.hits && SILENT_HINT.test(raw) && find(node.silent)) {
    const silent = find(node.silent);
    return { intent: silent.id, secondary: null, quality: 1, morality: silent.morality || 0, feasible: true, source: 'demo' };
  }
  const best = scored[0]?.hits ? scored[0].x : find(node.fallback) || intents[0];
  const second = node.multi ? scored.find((s) => s.hits > 0 && s.x.id !== best.id)?.x : null;
  const hits = scored[0]?.hits || 0;
  const quality = clamp(1 + (raw.length >= 8 ? 1 : 0) + (hits >= 2 ? 1 : 0), 1, 3);
  return { intent: best.id, secondary: second?.id || null, quality, morality: best.morality || 0, feasible: best.feasible !== false, source: 'demo' };
}

// ── 查询与校验 ──
function walkBeats(beats, visit, path) {
  (beats || []).forEach((beat, i) => {
    const p = [...path, i];
    visit(beat, p);
    if (beat?.t === 'if') { walkBeats(beat.then, visit, [...p, 'then']); walkBeats(beat.else, visit, [...p, 'else']); }
    if (beat?.t === 'input') (beat.intents || []).forEach((x, j) => walkBeats(x.reaction, visit, [...p, 'intents', j, 'reaction']));
    if (beat?.t === 'battle') { walkBeats(beat.rounds, visit, [...p, 'rounds']); walkBeats(beat.after, visit, [...p, 'after']); }
  });
}

export function eachBeat(chapter, visit) {
  (chapter.shots || []).forEach((shot, s) => walkBeats(shot.beats, (beat, p) => visit(beat, p, shot), ['shots', s, 'beats']));
}

export function findNode(chapter, nodeId) {
  let found = null;
  eachBeat(chapter, (beat) => { if (!found && beat?.t === 'input' && beat.id === nodeId) found = beat; });
  return found;
}

export function validateChapter(chapter, { speakers = {}, locations = {} } = {}) {
  const errors = [];
  const err = (where, msg) => errors.push(`${chapter?.id || '?'} ${where}: ${msg}`);
  if (!chapter || typeof chapter !== 'object') return ['章节不是对象'];
  if (!/^ch\d{3}$/.test(chapter.id || '')) err('id', '格式应为 ch000');
  if (typeof chapter.title !== 'string' || !chapter.title) err('title', '缺少标题');
  if (!Array.isArray(chapter.shots) || !chapter.shots.length) err('shots', '没有分镜');
  if (!chapter.end || !('next' in chapter.end)) err('end', '缺少 end.next');
  const allSpeakers = { ...speakers, ...(chapter.speakers || {}) };
  const shotIds = new Set();
  const inputIds = new Map();
  const condRefs = [];
  const checkCond = (c, where) => {
    if (!c) return;
    if (Array.isArray(c)) return c.forEach((x) => checkCond(x, where));
    if (c.all) return c.all.forEach((x) => checkCond(x, where));
    if (c.any) return c.any.forEach((x) => checkCond(x, where));
    if (c.not) return checkCond(c.not, where);
    if (c.intent) condRefs.push({ c, where });
    if (!['flag', 'item', 'var', 'voice', 'mode', 'battle', 'intent'].some((k) => k in c)) err(where, `无法识别的条件 ${JSON.stringify(c)}`);
  };
  (chapter.shots || []).forEach((shot) => {
    if (!shot.id || shotIds.has(shot.id)) err(`shot ${shot.id}`, '分镜 id 缺失或重复');
    shotIds.add(shot.id);
    if (shot.bg && shot.bg !== 'black' && !locations[shot.bg]) err(`shot ${shot.id}`, `未知背景 ${shot.bg}`);
    if (!Array.isArray(shot.beats) || !shot.beats.length) err(`shot ${shot.id}`, '没有节拍');
  });
  eachBeat(chapter, (beat, path, shot) => {
    const where = `shot ${shot.id} @${path.slice(3).join('.')}`;
    if (!beat || !BEAT_TYPES.has(beat.t)) return err(where, `未知节拍类型 ${beat?.t}`);
    if (['narr', 'say', 'think'].includes(beat.t) && (typeof beat.text !== 'string' || !beat.text.trim())) err(where, '文本为空');
    if (beat.text && beat.text.length > 700) err(where, '单个节拍文本过长（>700 字），请拆分');
    if (beat.t === 'say' && !allSpeakers[beat.who]) err(where, `未知说话人 ${beat.who}`);
    if (beat.t === 'bg' && beat.bg !== 'black' && !locations[beat.bg]) err(where, `未知背景 ${beat.bg}`);
    if (beat.t === 'fx' && !FX.has(beat.fx)) err(where, `未知特效 ${beat.fx}`);
    if (beat.t === 'title' && !beat.title) err(where, '片名缺少 title');
    if (beat.t === 'if') { if (!beat.when) err(where, 'if 缺少 when'); checkCond(beat.when, where); }
    if (beat.t === 'battle') {
      if (!beat.id) err(where, '战斗缺少 id');
      if (!beat.enemies?.length) err(where, '战斗没有敌人');
      if (!beat.rounds?.length) err(where, '战斗没有回合');
      (beat.rounds || []).forEach((r) => { if (r.t !== 'input') err(where, '战斗回合必须是 input 节点'); });
    }
    if (beat.t === 'input') {
      if (!beat.id) return err(where, '输入节点缺少 id');
      if (inputIds.has(beat.id)) err(where, `输入节点 id 重复 ${beat.id}`);
      if (!INPUT_KINDS.has(beat.kind)) err(where, `${beat.id} kind 无效`);
      if (!beat.prompt) err(where, `${beat.id} 缺少 prompt`);
      const ids = (beat.intents || []).map((x) => x.id);
      inputIds.set(beat.id, new Set(ids));
      if (ids.length < 3) err(where, `${beat.id} 意图少于 3 个`);
      if (new Set(ids).size !== ids.length) err(where, `${beat.id} 意图 id 重复`);
      if (!ids.includes(beat.silent)) err(where, `${beat.id} silent 指向不存在的意图`);
      if (!ids.includes(beat.fallback)) err(where, `${beat.id} fallback 指向不存在的意图`);
      for (const who of beat.focus || []) if (!allSpeakers[who]) err(where, `${beat.id} focus 未知说话人 ${who}`);
      for (const x of beat.intents || []) {
        if (!x.label) err(where, `${beat.id}.${x.id} 缺少 label`);
        if (x.id !== beat.silent && !(x.keywords || []).length) err(where, `${beat.id}.${x.id} 缺少 keywords`);
        if (x.morality !== undefined && (x.morality < -2 || x.morality > 2)) err(where, `${beat.id}.${x.id} morality 超出 -2..2`);
      }
    }
  });
  for (const { c, where } of condRefs) {
    const ids = inputIds.get(c.intent);
    if (!ids) { err(where, `条件引用了不存在的输入节点 ${c.intent}`); continue; }
    for (const id of [c.is, ...(c.in || [])].filter(Boolean)) if (!ids.has(id)) err(where, `条件引用了 ${c.intent} 不存在的意图 ${id}`);
  }
  for (const s of chapter.end?.summary || []) checkCond(s.when, 'end.summary');
  return errors;
}

// 给判定服务的上下文摘要（不含完整存档）
export function publicSummary(run) {
  const recent = Object.entries(run.inputs || {}).slice(-3).map(([id, r]) => ({ id, text: r.text.slice(0, 120), intent: r.intent }));
  return { playerName: run.playerName, recent };
}
