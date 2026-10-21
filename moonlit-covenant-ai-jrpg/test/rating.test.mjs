// 内容分级（作者核#13 第8条、核#14；剧本/README_30章重構提案.md 第七节，决策 #27–#29）：
//   - 主线默认 15+；首次启动选一次模式并存下；已存过设置的老玩家不强制切换，只提示一次；
//   - 设置说明改为新措辞，界面 CSP 安全（不用内联事件）；
//   - 主线判定器与外传聊天的模型提示词带同一份分级规则（按模式区分可写与禁写），判定本身不受影响。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_MODE, FALLBACK_MODE, RATING_VERSION, MODES, SETTINGS_NOTE, NOTICE_TEXT, normalizeMode, otherMode, initSettings, acknowledgeRating,
} from '../public/story/rating.js';
import { createRun, next, eachBeat } from '../public/story/engine.js';
import { AI_CONFIG, buildSystemPrompt, contentRatingRules, generateCharacterReply, normalizeContentMode } from '../game/ai.mjs';
import { buildPrompt, judgeStoryInput, loadStoryChapter, STORY_MINORS } from '../game/story-judge.mjs';
import { createInitialState, advanceScene } from '../game/engine.mjs';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(projectDir, rel), 'utf8');
const DEFAULTS = { speed: 'normal', pace: 'normal' };

// 模拟 localStorage：只存 JSON 字符串，和 player.js 的 load / store 一样
function fakeStorage() {
  const map = new Map();
  return {
    load: (key) => (map.has(key) ? JSON.parse(map.get(key)) : null),
    store: (key, value) => map.set(key, JSON.stringify(value)),
  };
}
const KEY = 'moonlit:story:settings';

// ─── 默认模式与首次启动 ───

test('rating: the default content mode is 15+, and a first launch asks for a choice', () => {
  assert.equal(DEFAULT_MODE, '15+');
  assert.equal(FALLBACK_MODE, '12+');
  const boot = initSettings(null, DEFAULTS);
  assert.equal(boot.prompt, 'choose');
  assert.deepEqual(boot.settings, { speed: 'normal', pace: 'normal', mode: '15+' });
  // 存坏了的设置（数组、字符串）当作没存过
  for (const junk of [[], 'x', 0, undefined]) assert.equal(initSettings(junk, DEFAULTS).prompt, 'choose');
});

test('rating: a fresh run uses the default mode and shows the 15+ text', () => {
  const chapter = { id: 'ch900', shots: [{ id: 'T-01', bg: 'pasture', beats: [{ t: 'narr', text: '他倒下了。', text15: '他倒在血泊里。' }] }] };
  const { settings } = initSettings(null, DEFAULTS);
  const run = createRun({ chapter, playerName: '小克', mode: settings.mode });
  assert.equal(run.mode, '15+');
  let beat = null;
  for (let i = 0; i < 5 && !beat; i += 1) { const item = next(run, chapter); if (item.kind === 'beat') beat = item.beat; }
  assert.equal(beat.text, '他倒在血泊里。');
});

test('rating: the first-launch choice is persisted and not asked again', () => {
  for (const pick of ['12+', '15+']) {
    const ls = fakeStorage();
    const first = initSettings(ls.load(KEY), DEFAULTS);
    assert.equal(first.prompt, 'choose');
    ls.store(KEY, acknowledgeRating(first.settings, pick));
    const second = initSettings(ls.load(KEY), DEFAULTS);
    assert.equal(second.prompt, null, `no prompt after choosing ${pick}`);
    assert.equal(second.settings.mode, pick);
    assert.equal(second.settings.ratingAck, RATING_VERSION);
  }
  // Esc（没有给出模式）= 用默认的 15+
  assert.equal(acknowledgeRating(initSettings(null, DEFAULTS).settings).mode, '15+');
  // 一个不认识的值不会把模式改坏
  assert.equal(acknowledgeRating({ mode: '12+' }, '18+').mode, '12+');
});

test('rating: players with saved settings keep their mode and get the notice exactly once', () => {
  const ls = fakeStorage();
  ls.store(KEY, { mode: '12+', speed: 'fast', pace: 'brisk' }); // 旧版播放器存下的设置（没有 ratingAck）
  const boot = initSettings(ls.load(KEY), DEFAULTS);
  assert.equal(boot.prompt, 'notice');
  assert.deepEqual(boot.settings, { speed: 'fast', pace: 'brisk', mode: '12+' }, 'no forced switch to 15+');
  ls.store(KEY, acknowledgeRating(boot.settings)); // 提示显示出来就记下，模式不变
  const again = initSettings(ls.load(KEY), DEFAULTS);
  assert.equal(again.prompt, null);
  assert.equal(again.settings.mode, '12+');
  // 老存档里缺模式或模式不认识：按旧版的 12+，同样只提示
  assert.equal(initSettings({ speed: 'slow' }, DEFAULTS).settings.mode, '12+');
  assert.equal(initSettings({ mode: 'R18' }, DEFAULTS).settings.mode, '12+');
  assert.equal(initSettings({ mode: '15+' }, DEFAULTS).settings.mode, '15+');
  assert.equal(initSettings({ mode: '15+' }, DEFAULTS).prompt, 'notice');
  // 分级说明再改一版时，看过旧版的玩家会再看到一次
  assert.equal(initSettings({ mode: '12+', ratingAck: RATING_VERSION - 1 }, DEFAULTS).prompt, 'notice');
  assert.equal(initSettings({ mode: '12+', ratingAck: RATING_VERSION }, DEFAULTS).prompt, null);
});

test('rating: mode helpers and the player-facing wording', () => {
  assert.equal(normalizeMode('15+'), '15+');
  assert.equal(normalizeMode('nope'), '12+');
  assert.equal(normalizeMode(undefined, '15+'), '15+');
  assert.equal(otherMode('12+'), '15+');
  assert.equal(otherMode('15+'), '12+');
  assert.equal(MODES['15+'].name, '戏剧模式');
  assert.equal(MODES['12+'].name, '柔和模式');
  assert.equal(MODES['15+'].blurb, '擦边与流血可以出现，但不露骨。');
  assert.equal(MODES['12+'].blurb, '以剪影、遮挡与结果带过。');
  assert.equal(SETTINGS_NOTE, '15+（默认）：擦边与血腥，但不露骨／12+：柔和演出。两种模式剧情与结局相同。');
  assert.equal(NOTICE_TEXT, '本作默认15+：有擦边与血腥描写，但不露骨。也可以改用12+柔和模式，剧情与结局完全相同。');
});

test('rating: player.js boots settings through rating.js, sends the mode to the judge, and stays CSP-safe', () => {
  const player = read('public/story/player.js');
  assert.match(player, /from '\.\/rating\.js'/);
  assert.match(player, /initSettings\(load\(KEYS\.settings, null\)/, 'settings are merged by initSettings (no saved settings = null)');
  assert.doesNotMatch(player, /mode: '12\+', speed: 'normal'/, 'the old 12+ default is gone');
  assert.ok(!player.includes('15+ 会显示更直接的伤亡描写，主线剧情相同。'), 'the old settings note is gone');
  assert.match(player, /esc\(SETTINGS_NOTE\)/);
  assert.match(player, /function ratingChoice\(\)/);
  assert.match(player, /function ratingNotice\(\)/);
  assert.match(player, /context: \{ \.\.\.publicSummary\(S\.run\), mode: normalizeMode\(S\.run\.mode\) \}/, 'the judge request carries the content mode');
  // 严格 CSP：模板里不写内联事件属性，也不用 javascript: 链接
  for (const file of ['public/story/player.js', 'public/story/rating.js', 'public/story.html']) {
    const src = read(file);
    assert.doesNotMatch(src, /\son[a-z]+\s*=\s*["']/i, `${file} has no inline event handler attribute`);
    assert.doesNotMatch(src, /javascript:/i, `${file} has no javascript: URL`);
  }
  const html = read('public/story.html');
  assert.match(html, /<link rel="modulepreload" href="\/story\/rating\.js" \/>/);
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/, 'story.html has no inline script');
  const css = read('public/story/story.css');
  for (const cls of ['.rating-card', '.rating-opt', '.rating-notice']) assert.ok(css.includes(cls), `story.css styles ${cls}`);
});

// ─── 模型提示词里的分级规则 ───

test('rating rules: allowed vs banned per mode, shared hard limits, 12+ fallback', () => {
  const r15 = contentRatingRules('15+');
  const r12 = contentRatingRules('12+');
  assert.match(r15, /内容模式：15\+（戏剧模式）/);
  assert.match(r15, /伤口、血迹/);
  assert.match(r15, /擦边反应/);
  assert.match(r15, /不露骨/);
  assert.match(r12, /内容模式：12\+（柔和模式）/);
  assert.match(r12, /不写血/);
  assert.match(r12, /剪影、遮挡与结果带过/);
  assert.doesNotMatch(r12, /血迹|擦边反应/);
  for (const rules of [r15, r12]) {
    for (const banned of ['裸露', '性行为', '性暴力', '肢解', '不评论身体', '同一句里不同时写血与擦边', '未满18岁的角色', '永远不出现在擦边或血腥的描写里', '在场角色拒绝或制止']) {
      assert.ok(rules.includes(banned), `rules mention ${banned}`);
    }
  }
  assert.equal(contentRatingRules(undefined), r12, 'no mode → 12+');
  assert.equal(contentRatingRules('R18'), r12, 'unknown mode → 12+');
  assert.equal(normalizeContentMode('15+'), '15+');
  assert.equal(normalizeContentMode(''), '12+');
  assert.match(contentRatingRules('15+', { minors: ['托比'] }), /未满18岁的角色（托比）与任何孩子/);
});

function firstFocusedNode(chapterId) {
  const chapter = loadStoryChapter(chapterId);
  let node = null;
  eachBeat(chapter, (beat) => { if (!node && beat.t === 'input' && beat.focus?.length) node = beat; });
  return { chapter, node };
}

test('story judge prompt: rule 5 carries the rating rules for the requested mode and the minors list', () => {
  const { chapter, node } = firstFocusedNode('ch000');
  const p15 = buildPrompt(chapter, node, '亚克', [], '15+');
  const p12 = buildPrompt(chapter, node, '亚克', [], '12+');
  const pNone = buildPrompt(chapter, node, '亚克', []);
  assert.match(p15, /5\. reaction 与 memory 遵守内容分级。内容模式：15\+（戏剧模式）/);
  assert.match(p12, /内容模式：12\+（柔和模式）/);
  assert.equal(pNone, p12, 'no mode → the 12+ rules');
  assert.deepEqual(STORY_MINORS, ['托比', '波莉', '妮拉', '派克', '幼龙豆鳞']);
  for (const name of STORY_MINORS) assert.ok(p15.includes(name), `minors list names ${name}`);
  assert.match(p15, /morality 取 -2/);
  assert.ok(p15.indexOf('5. reaction 与 memory') < p15.indexOf('只输出 JSON。'), 'rule 5 comes before the output instruction');
  // 其余判定要求原样保留
  for (const rule of ['1. 按玩家真实意图归类', '2. 超出主角当前能力', '3. reaction 写 1–4 行', '4. memory 用一句话']) assert.ok(p15.includes(rule));
});

test('side-story chat prompt: the PG-13 line is replaced by the shared rating rules (12+ until the page has a setting)', () => {
  const state = createInitialState('测试队长');
  advanceScene(state, 'begin_camp');
  const plain = buildSystemPrompt(state, 'lia', '你好');
  assert.doesNotMatch(plain, /PG-13/);
  assert.ok(plain.includes(`6. ${contentRatingRules('12+')}也不生成仇恨、违法指导或鼓励自伤内容。`));
  assert.match(plain, /7\. 台词控制在60个汉字左右/, 'the other rules keep their numbers');
  assert.doesNotMatch(plain, /托比|波莉/, 'main-line minors are not named in the side story');
  assert.match(buildSystemPrompt(state, 'lia', '你好', { contentMode: '15+' }), /内容模式：15\+（戏剧模式）/);
  assert.match(buildSystemPrompt({ ...state, contentMode: '15+' }, 'lia', '你好'), /内容模式：15\+（戏剧模式）/);
  assert.match(buildSystemPrompt({ ...state, contentMode: '15+' }, 'lia', '你好', { contentMode: '12+' }), /内容模式：12\+（柔和模式）/, 'the caller wins');
});

// 模拟模型：记下每次请求的系统提示词，回同一份 JSON
async function mockModel(t, content) {
  const prompts = [];
  const mock = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      prompts.push(JSON.parse(raw).messages[0].content);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] }));
    });
  });
  await new Promise((resolve) => mock.listen(0, '127.0.0.1', resolve));
  const saved = { ...AI_CONFIG };
  Object.assign(AI_CONFIG, { mode: 'openai', baseUrl: `http://127.0.0.1:${mock.address().port}/v1`, apiKey: 'test', timeoutMs: 5000 });
  t.after(() => { Object.assign(AI_CONFIG, saved); mock.close(); });
  return prompts;
}

test('story judge (openai): context.mode reaches the prompt and the judgement itself is unchanged', async (t) => {
  const { node } = firstFocusedNode('ch000');
  const intent = node.intents.find((x) => x.id !== node.silent).id;
  const prompts = await mockModel(t, { intent, secondary: '', quality: 2, morality: 1, feasible: true, reaction: [{ who: 'narr', text: '风停了一下。' }], memory: '' });
  const ask = (context) => judgeStoryInput({ chapterId: 'ch000', nodeId: node.id, text: '我来帮忙', context });
  const j15 = await ask({ playerName: '小克', mode: '15+' });
  const j12 = await ask({ playerName: '小克', mode: '12+' });
  const jNone = await ask({ playerName: '小克' });
  assert.match(prompts[0], /内容模式：15\+（戏剧模式）/);
  assert.match(prompts[1], /内容模式：12\+（柔和模式）/);
  assert.match(prompts[2], /内容模式：12\+（柔和模式）/, 'old clients without a mode get the 12+ rules');
  assert.equal(j15.source, 'model');
  assert.deepEqual(j15, j12);
  assert.deepEqual(j15, jNone);
});

test('side-story chat (openai): generateCharacterReply passes the content mode to the prompt', async (t) => {
  const prompts = await mockModel(t, { utterance: '收到。', emotion: '认真', intent: 'other', bond_delta: 0, trust_delta: 0, memory: '', tactical_hint: '' });
  const state = createInitialState('测试队长');
  advanceScene(state, 'begin_camp');
  const a = await generateCharacterReply(state, 'lia', '正面突破的风险是什么？');
  const b = await generateCharacterReply(state, 'lia', '正面突破的风险是什么？', { contentMode: '15+' });
  assert.equal(a.source, 'model');
  assert.equal(b.source, 'model');
  assert.match(prompts[0], /内容模式：12\+（柔和模式）/);
  assert.match(prompts[1], /内容模式：15\+（戏剧模式）/);
  assert.doesNotMatch(prompts.join('\n'), /PG-13/);
});
