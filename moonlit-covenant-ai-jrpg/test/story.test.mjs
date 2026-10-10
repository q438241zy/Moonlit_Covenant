import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  createRun, continueRun, next, resolveInput, demoJudge, validateChapter, findNode, evalCond, eachBeat
} from '../public/story/engine.js';
import { normalizeModelJudgement, judgeStoryInput } from '../game/story-judge.mjs';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(projectDir, rel), 'utf8'));
const speakers = readJson('public/story/speakers.json');
const locations = readJson('public/story/locations.json');
const index = readJson('public/story/chapters/index.json');

const FIXTURE = {
  id: 'ch900', number: 900, title: '测试章', end: { save: 'SAVE_T', next: null, set: { flags: { F_END: true } }, summary: [] },
  canon: { flags: { F_CANON: true } },
  shots: [
    { id: 'T-01', title: '开场', bg: 'pasture', beats: [
      { t: 'say', who: 'erin', text: '{PLAYER_NAME}，喂羊了。', text15: '{PLAYER_NAME}，喂羊了！（15+）' },
      { t: 'input', id: 'FI_T_1', kind: 'dialogue', prompt: '艾琳等你回答。', focus: ['erin'], silent: 'silent', fallback: 'warm',
        intents: [
          { id: 'warm', label: '温和', keywords: ['好'], voice: 'warm', morality: 1, reaction: [{ t: 'say', who: 'erin', text: '乖。' }], set: { flags: { F_WARM: true }, add: { GUILT: 0 } } },
          { id: 'harsh', label: '刻薄', keywords: ['烦'], voice: 'harsh', morality: -1, reaction: [{ t: 'say', who: 'erin', text: '注意态度。' }], set: { add: { GUILT: 1 } } },
          { id: 'silent', label: '沉默', reaction: [{ t: 'say', who: 'erin', text: '慢一点。' }] },
        ] },
      { t: 'if', when: { intent: 'FI_T_1', is: 'warm' }, then: [{ t: 'narr', text: '她笑了。' }], else: [{ t: 'narr', text: '她叹气。' }] },
      { t: 'input', id: 'FI_T_VOW', kind: 'vow', prompt: '立誓。', focus: [], silent: 'none', fallback: 'none', multi: true, storeAs: 'PLAYER_VOW',
        intents: [
          { id: 'revenge', label: '复仇', keywords: ['偿还'], set: { flags: { V_REV: true } } },
          { id: 'protect', label: '守护', keywords: ['保护'], set: { flags: { V_PRO: true } } },
          { id: 'none', label: '无明确誓言' },
        ] },
    ] },
    { id: 'T-02', title: '战斗', bg: 'barrel-alley', beats: [
      { t: 'battle', id: 'B_T', title: '测试战', player: { hp: 10 }, enemies: [{ id: 'a', name: '甲', hp: 3 }], untilDefeated: true,
        rounds: [
          { t: 'input', id: 'FI_B1', kind: 'tactic', prompt: '怎么打？', focus: [], silent: 'wait', fallback: 'hit',
            intents: [
              { id: 'smart', label: '巧打', keywords: ['酒桶'], effect: { enemy: { a: -3 } } },
              { id: 'hit', label: '硬砍', keywords: ['砍'], effect: { enemy: { a: -1 }, player: -6 } },
              { id: 'fire', label: '放火', keywords: ['烧'], effect: { collateral: 1 } },
              { id: 'wait', label: '观望' },
            ] },
          { t: 'input', id: 'FI_B2', kind: 'tactic', prompt: '再来？', focus: [], silent: 'wait', fallback: 'hit',
            intents: [{ id: 'smart', label: '巧打', keywords: ['酒桶'], effect: { enemy: { a: -3 } } }, { id: 'hit', label: '硬砍', keywords: ['砍'] }, { id: 'wait', label: '观望' }] },
        ],
        after: [{ t: 'narr', text: '盾击收场。' }] },
    ] },
  ],
};

function playThrough(chapter, texts, run = createRun({ chapter, playerName: '小克' })) {
  const shown = [];
  let k = 0;
  for (let i = 0; i < 5000; i += 1) {
    const item = next(run, chapter);
    if (item.kind === 'end') return { run, shown, done: true };
    if (item.kind === 'input') {
      const node = findNode(chapter, item.node.id);
      const text = typeof texts === 'function' ? texts(node, k) : (texts[k] ?? '');
      k += 1;
      resolveInput(run, chapter, demoJudge(node, text), text);
      shown.push(`[${node.id}]`);
      continue;
    }
    if (item.kind === 'beat') shown.push(item.beat.text);
  }
  return { run, shown, done: false };
}

test('engine: fixture validates, interpolates the player name and applies canon', () => {
  assert.deepEqual(validateChapter(FIXTURE, { speakers, locations }), []);
  const { run, shown, done } = playThrough(FIXTURE, ['好', '我要保护托比，也要让它偿还', '酒桶']);
  assert.ok(done);
  assert.equal(shown[0], '小克，喂羊了。');
  assert.equal(run.flags.F_CANON, true);
  assert.equal(run.flags.F_END, true);
});

test('engine: intents drive reactions, conditions, voice and morality', () => {
  const warm = playThrough(FIXTURE, ['好的妈', '', '']);
  assert.ok(warm.shown.includes('乖。') && warm.shown.includes('她笑了。'));
  assert.equal(warm.run.voice.warm, 1);
  assert.equal(warm.run.morality, 1);
  const harsh = playThrough(FIXTURE, ['烦死了', '', '']);
  assert.ok(harsh.shown.includes('注意态度。') && harsh.shown.includes('她叹气。'));
  assert.equal(harsh.run.vars.GUILT, 1);
  assert.equal(harsh.run.morality, -1);
  const silent = playThrough(FIXTURE, ['……', '', '']);
  assert.equal(silent.run.inputs.FI_T_1.intent, 'silent');
  assert.ok(silent.shown.includes('慢一点。'));
});

test('engine: multi-intent vow stores primary and secondary', () => {
  const { run } = playThrough(FIXTURE, ['好', '我要保护托比，也要让它偿还', '酒桶']);
  assert.equal(run.vars.PLAYER_VOW_PRIMARY, 'revenge');
  assert.equal(run.vars.PLAYER_VOW_SECONDARY, 'protect');
  assert.ok(run.flags.V_REV && run.flags.V_PRO);
  assert.ok(evalCond(run, { intent: 'FI_T_VOW', is: 'protect' }));
});

test('engine: battle rounds apply effects, skip when enemies are down, and grade the result', () => {
  const clean = playThrough(FIXTURE, ['好', '', '踢翻酒桶']);
  assert.equal(clean.run.vars.B_T_RESULT, 'clean');
  assert.equal(clean.run.inputs.FI_B2, undefined, 'second round skipped once the enemy is down');
  assert.ok(clean.shown.includes('盾击收场。'));
  const hurt = playThrough(FIXTURE, ['好', '', '砍他', '砍']);
  assert.equal(hurt.run.vars.B_T_RESULT, 'hurt');
  const collateral = playThrough(FIXTURE, ['好', '', '烧掉巷子', '']);
  assert.equal(collateral.run.vars.B_T_RESULT, 'collateral');
});

test('engine: 15+ text variant, continueRun carries state and runs stay serialisable', () => {
  const run = createRun({ chapter: FIXTURE, playerName: '小克', mode: '15+' });
  next(run, FIXTURE);
  assert.equal(next(run, FIXTURE).beat.text, '小克，喂羊了！（15+）');
  const first = playThrough(FIXTURE, ['好', '', '酒桶']).run;
  const copy = JSON.parse(JSON.stringify(first));
  const cont = continueRun(copy, FIXTURE);
  assert.equal(cont.flags.F_WARM, true);
  assert.deepEqual(cont.completed, ['ch900']);
  assert.ok(playThrough(FIXTURE, ['好'], cont).done);
});

test('engine: validator catches broken references', () => {
  const broken = JSON.parse(JSON.stringify(FIXTURE));
  broken.shots[0].beats[0].who = 'nobody';
  broken.shots[0].beats[2].when = { intent: 'FI_T_1', is: 'ghost' };
  broken.shots[0].bg = 'nowhere';
  const errors = validateChapter(broken, { speakers, locations }).join('\n');
  assert.match(errors, /未知说话人 nobody/);
  assert.match(errors, /不存在的意图 ghost/);
  assert.match(errors, /未知背景 nowhere/);
});

// ── 正式章节：全部存在、校验通过、每种玩法都能走到章末，并能连续继承 ──
for (const entry of index) {
  test(`chapter ${entry.id}: validates and every play style reaches the end`, () => {
    const chapter = readJson(`public/story/chapters/${entry.id}.json`);
    assert.equal(chapter.id, entry.id);
    assert.deepEqual(validateChapter(chapter, { speakers, locations }), []);
    const intentCount = [];
    eachBeat(chapter, (beat) => { if (beat.t === 'input') intentCount.push(beat.intents.length); });
    assert.ok(intentCount.length >= 3, 'chapter has at least three free-input nodes');
    const styles = [
      () => '',
      () => '我挠了挠头',
      (node, k) => { const xs = node.intents.filter((x) => x.id !== node.silent); return xs[k % xs.length].keywords[0]; },
      (node) => { const xs = node.intents.filter((x) => x.id !== node.silent); return xs[xs.length - 1].keywords[0]; },
    ];
    for (const style of styles) {
      const { done, run } = playThrough(chapter, style, createRun({ chapter, playerName: '亚克' }));
      assert.ok(done, 'reaches the chapter end');
      assert.ok(run.completed.includes(chapter.id));
      for (const text of JSON.stringify(run).match(/\{PLAYER_NAME\}/g) || []) assert.fail(`uninterpolated ${text}`);
    }
  });
}

test('chapters chain: ch000 → ch001 → ch002 with inherited state', () => {
  let run = null;
  for (const entry of index) {
    const chapter = readJson(`public/story/chapters/${entry.id}.json`);
    run = run ? continueRun(run, chapter) : createRun({ chapter, playerName: '亚克' });
    const result = playThrough(chapter, (node, k) => node.intents.filter((x) => x.id !== node.silent)[k % 2].keywords[0], run);
    assert.ok(result.done, `${entry.id} reached the end`);
    if (chapter.end?.next) assert.equal(chapter.end.next, index[index.indexOf(entry) + 1]?.id);
  }
  assert.deepEqual(run.completed.sort(), index.map((e) => e.id).sort());
});

// ── 判定服务 ──
test('story judge: demo judgement uses node intents; unknown chapter/node are 404', async () => {
  const chapter = readJson('public/story/chapters/ch000.json');
  let firstNode = null;
  eachBeat(chapter, (beat) => { if (!firstNode && beat.t === 'input') firstNode = beat; });
  const judged = await judgeStoryInput({ chapterId: 'ch000', nodeId: firstNode.id, text: '', context: {} });
  assert.equal(judged.intent, firstNode.silent);
  assert.equal(judged.source, 'demo');
  await assert.rejects(judgeStoryInput({ chapterId: 'ch999x', nodeId: 'x', text: 'hi' }), /章节不存在/);
  await assert.rejects(judgeStoryInput({ chapterId: 'ch000', nodeId: 'FI_NOPE', text: 'hi' }), /输入节点不存在/);
});

test('story judge: model output is validated strictly', () => {
  const node = findNode(FIXTURE, 'FI_T_1');
  assert.equal(normalizeModelJudgement({ intent: 'ghost' }, node), null, 'unknown intent rejected');
  assert.equal(normalizeModelJudgement({ intent: 'warm', reaction: [{ who: 'lia', text: '我来了' }] }, node), null, 'speaker outside focus rejected');
  const ok = normalizeModelJudgement({ intent: 'warm', secondary: 'harsh', quality: 9, morality: -7, reaction: [{ who: 'erin', text: '好孩子。' }, { who: 'narr', text: '她递来木桶。' }], memory: '答应得很快' }, node);
  assert.equal(ok.intent, 'warm');
  assert.equal(ok.secondary, null, 'secondary only for multi nodes');
  assert.equal(ok.quality, 3);
  assert.equal(ok.morality, -2);
  assert.deepEqual(ok.reaction, [{ who: 'erin', text: '好孩子。' }, { who: 'narr', text: '她递来木桶。' }]);
  // 模型台词替换作者反应，非法台词则保留作者反应
  const run = createRun({ chapter: FIXTURE, playerName: '小克' });
  next(run, FIXTURE); next(run, FIXTURE); next(run, FIXTURE);
  resolveInput(run, FIXTURE, ok, '好');
  assert.equal(next(run, FIXTURE).beat.text, '好孩子。');
});

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

test('API: POST /api/story/judge returns a judgement and serves chapter files', async () => {
  const port = await freePort();
  const child = spawn(process.execPath, ['server.mjs'], { cwd: projectDir, env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', AI_MODE: 'demo' }, stdio: 'ignore' });
  const base = `http://127.0.0.1:${port}`;
  try {
    const deadline = Date.now() + 6000;
    while (Date.now() < deadline) {
      try { if ((await fetch(`${base}/api/health`)).ok) break; } catch { /* starting */ }
      await new Promise((r) => setTimeout(r, 80));
    }
    const chapter = await (await fetch(`${base}/story/chapters/ch000.json`)).json();
    let node = null;
    eachBeat(chapter, (beat) => { if (!node && beat.t === 'input') node = beat; });
    const res = await fetch(`${base}/api/story/judge`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chapterId: 'ch000', nodeId: node.id, text: node.intents.find((x) => x.id !== node.silent).keywords[0] }) });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(node.intents.some((x) => x.id === body.judgement.intent));
    const missing = await fetch(`${base}/api/story/judge`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chapterId: 'ch000', nodeId: 'FI_NOPE', text: 'x' }) });
    assert.equal(missing.status, 404);
  } finally {
    child.kill();
  }
});

test('API: openai mode uses the model judgement and falls back when the model output is invalid', async () => {
  const http = await import('node:http');
  const chapter = readJson('public/story/chapters/ch000.json');
  let node = null;
  eachBeat(chapter, (beat) => { if (!node && beat.t === 'input' && beat.focus?.length) node = beat; });
  let reply = null;
  const mock = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      const parsed = JSON.parse(body);
      assert.ok(parsed.messages[0].content.includes(node.id), 'prompt names the node');
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify(reply) } }] }));
    });
  });
  await new Promise((r) => mock.listen(0, '127.0.0.1', r));
  const port = await freePort();
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: projectDir,
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', AI_MODE: 'openai', AI_BASE_URL: `http://127.0.0.1:${mock.address().port}/v1`, AI_API_KEY: 'test', AI_TIMEOUT_MS: '4000' },
    stdio: 'ignore',
  });
  const base = `http://127.0.0.1:${port}`;
  const judge = async () => (await (await fetch(`${base}/api/story/judge`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chapterId: 'ch000', nodeId: node.id, text: '我来帮忙', context: { playerName: '小克' } }) })).json()).judgement;
  try {
    const deadline = Date.now() + 6000;
    while (Date.now() < deadline) {
      try { if ((await fetch(`${base}/api/health`)).ok) break; } catch { /* starting */ }
      await new Promise((r) => setTimeout(r, 80));
    }
    const intent = node.intents[0].id;
    reply = { intent, secondary: '', quality: 2, morality: 1, feasible: true, reaction: [{ who: node.focus[0], text: '模型写的台词。' }], memory: '帮了忙' };
    const good = await judge();
    assert.equal(good.source, 'model');
    assert.equal(good.intent, intent);
    assert.equal(good.reaction[0].text, '模型写的台词。');
    reply = { intent: 'NOT_AN_INTENT', quality: 2, morality: 0, feasible: true, reaction: [], memory: '' };
    const bad = await judge();
    assert.equal(bad.source, 'fallback');
    assert.ok(node.intents.some((x) => x.id === bad.intent));
  } finally {
    child.kill();
    mock.close();
  }
});
