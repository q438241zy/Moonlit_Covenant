// 轨道 D / SIDE：外传离线保底台词、快捷提问与改名的回归测试（D1、D2、D4、D5、B4、B5、B8）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALLOWED_EMOTIONS,
  ALLOWED_INTENTS,
  CHARACTERS,
  INTRO_EVENTS,
  CAMP_EVENTS,
  CORRIDOR_EVENTS,
  BATTLE_INTRO_EVENTS,
  BATTLE_PHASE_EVENTS,
  AFTERMATH_EVENTS
} from '../game/content.mjs';
import {
  FALLBACK_LINES,
  FALLBACK_TACTICAL_HINTS,
  PROMISE_AGAIN_LINES,
  QUICK_PROMPT_REPLIES,
  REPEAT_LINES,
  classifyMessage,
  fallbackReply
} from '../game/ai.mjs';
import { advanceScene, applyChatOutcome, createInitialState } from '../game/engine.mjs';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ALL_FORBIDDEN = Object.values(CHARACTERS).flatMap((c) => c.forbiddenTermsUntilEnding.map((term) => ({ owner: c.id, term })));

function assertNoForbidden(text, where) {
  for (const { owner, term } of ALL_FORBIDDEN) {
    assert.ok(!text.includes(term), `${where} 含 ${owner} 的结局前禁用词「${term}」：${text}`);
  }
}

test('D1: 每个角色的保底台词池都不含任何角色的结局前禁用词', () => {
  for (const id of Object.keys(CHARACTERS)) {
    const pools = FALLBACK_LINES[id];
    assert.ok(pools, `${id} 没有保底台词池`);
    for (const intent of ALLOWED_INTENTS) {
      assert.ok(Array.isArray(pools[intent]) && pools[intent].length > 0, `${id}.${intent} 台词池为空`);
      for (const line of pools[intent]) {
        assert.ok(line.length > 0 && line.length <= 180, `${id}.${intent} 台词长度越界：${line}`);
        assertNoForbidden(line, `${id}.${intent}`);
      }
    }
    assertNoForbidden(FALLBACK_TACTICAL_HINTS[id], `${id} 战术提示`);
  }
});

test('D1: 「你好笨」不会让莉亚说出「第七码头」', () => {
  for (const message of ['你好笨', '蠢货', '废物', '闭嘴']) {
    const reply = fallbackReply({}, 'lia', message);
    assert.equal(reply.intent, 'insult');
    assert.ok(!reply.utterance.includes('第七码头'), reply.utterance);
  }
});

test('D1: 结局前的固定剧情与快捷提问也不含禁用词', () => {
  const scripted = [
    ...INTRO_EVENTS,
    ...CAMP_EVENTS,
    ...CORRIDOR_EVENTS,
    ...BATTLE_INTRO_EVENTS,
    ...BATTLE_PHASE_EVENTS.phase2,
    ...BATTLE_PHASE_EVENTS.phase3,
    ...AFTERMATH_EVENTS
  ];
  scripted.forEach((ev, i) => assertNoForbidden(ev.text, `固定剧情 #${i}`));
  for (const c of Object.values(CHARACTERS)) c.quickPrompts.forEach((p) => assertNoForbidden(p, `${c.id} 快捷提问`));
});

test('D2: 15 条快捷提问没有一条落到 other；原先的 4 条至少 +1 羁绊或信任', () => {
  const prompts = Object.values(CHARACTERS).flatMap((c) => c.quickPrompts.map((p) => [c.id, p]));
  assert.equal(prompts.length, 15);
  for (const [id, prompt] of prompts) {
    assert.notEqual(classifyMessage(prompt), 'other', `${id}「${prompt}」判成 other`);
  }
  const fixed = [
    ['lia', '你不用一个人扛所有事。', 'encourage'],
    ['mia', '你不用一直说话，安静也没关系。', 'encourage'],
    ['serena', '我宁愿听难听的真话。', 'encourage'],
    ['serena', '牺牲记忆不是唯一解。', 'strategy']
  ];
  for (const [id, prompt, intent] of fixed) {
    assert.ok(CHARACTERS[id].quickPrompts.includes(prompt), `${id} 的快捷提问里没有「${prompt}」`);
    const reply = fallbackReply({}, id, prompt);
    assert.equal(reply.intent, intent, `${id}「${prompt}」`);
    assert.ok(reply.bondDelta >= 1 || reply.trustDelta >= 1, `${id}「${prompt}」没有任何关系变化`);
  }
});

test('B5: 5 条提问类快捷提问有专属回复，仍判为 question，并给 +1 信任', () => {
  const questions = [
    ['lia', '你以前的队伍……发生了什么？'],
    ['mia', '零号对你来说意味着什么？'],
    ['serena', '你真正害怕的是什么？'],
    ['serena', '你手套下面藏着什么？'],
    ['serena', '如果一切都能预见，你还想活着吗？']
  ];
  const keys = Object.entries(QUICK_PROMPT_REPLIES).flatMap(([id, map]) => Object.keys(map).map((prompt) => [id, prompt]));
  assert.deepEqual(keys.sort(), [...questions].sort(), '专属回复只覆盖这 5 条提问');
  for (const [id, prompt] of questions) {
    assert.ok(CHARACTERS[id].quickPrompts.includes(prompt), `${id} 的快捷提问里没有「${prompt}」`);
    const special = QUICK_PROMPT_REPLIES[id][prompt];
    const reply = fallbackReply({}, id, prompt);
    assert.equal(reply.intent, 'question', prompt);
    assert.equal(reply.utterance, special.utterance, prompt);
    assert.equal(reply.trustDelta, 1, `${prompt} 应 +1 信任`);
    assert.ok(reply.bondDelta >= 0 && reply.bondDelta <= 1);
    assert.ok(ALLOWED_EMOTIONS.includes(reply.emotion), reply.emotion);
    assert.ok(reply.utterance.length <= 180 && reply.memory.length <= 80);
    assertNoForbidden(reply.utterance, `${id} 专属回复`);
    assertNoForbidden(reply.memory, `${id} 专属回复的记忆`);
    // 标点、空格不同也命中同一条专属回复
    assert.equal(fallbackReply({}, id, ` ${prompt.replace(/[？。…]/g, '')} `).utterance, special.utterance);
  }
  // 自由输入的普通提问仍走通用提问池
  assert.ok(!Object.values(QUICK_PROMPT_REPLIES.lia).some((r) => r.utterance === fallbackReply({}, 'lia', '你吃过晚饭了吗？').utterance));
});

test('B5 + D2: 15 条快捷提问第一次说都至少 +1 羁绊或信任', () => {
  for (const c of Object.values(CHARACTERS)) {
    for (const prompt of c.quickPrompts) {
      const reply = fallbackReply({}, c.id, prompt);
      assert.ok(reply.bondDelta >= 1 || reply.trustDelta >= 1, `${c.id}「${prompt}」没有任何关系变化`);
    }
  }
});

test('B4: 重复的话与第二次承诺换成「说过了」的台词（分数由引擎裁掉）', () => {
  for (const id of Object.keys(CHARACTERS)) {
    for (const line of [REPEAT_LINES[id], PROMISE_AGAIN_LINES[id]]) {
      assert.ok(line && line.length <= 180, `${id} 缺台词`);
      assertNoForbidden(line, `${id} 重复/承诺台词`);
    }
    const state = createInitialState('测试队长');
    advanceScene(state, 'begin_camp');
    const first = fallbackReply(state, id, '谢谢你，辛苦了。');
    applyChatOutcome(state, id, '谢谢你，辛苦了。', first);
    const again = fallbackReply(state, id, '谢谢你！辛苦了！');
    assert.equal(again.utterance, REPEAT_LINES[id]);
    // 别的角色没听过这句，照常回应
    const otherId = Object.keys(CHARACTERS).find((other) => other !== id);
    assert.notEqual(fallbackReply(state, otherId, '谢谢你，辛苦了。').utterance, REPEAT_LINES[otherId]);

    applyChatOutcome(state, id, '我保证不会丢下你。', fallbackReply(state, id, '我保证不会丢下你。'));
    const promiseAgain = fallbackReply(state, id, '我答应你，一定会活着回来。');
    assert.equal(promiseAgain.intent, 'promise');
    assert.equal(promiseAgain.utterance, PROMISE_AGAIN_LINES[id]);

    // 重复辱骂照常回应、照常扣分
    applyChatOutcome(state, id, '你好笨', fallbackReply(state, id, '你好笨'));
    const insultAgain = fallbackReply(state, id, '你好笨');
    assert.equal(insultAgain.intent, 'insult');
    assert.notEqual(insultAgain.utterance, REPEAT_LINES[id]);
    assert.equal(insultAgain.bondDelta, -2);
  }
});

test('B8: 外传配角改名，旧名不再出现；新名字不与正典（设定集 / 剧本，简繁）撞名', () => {
  const files = ['game/ai.mjs', 'game/content.mjs', 'game/engine.mjs', 'docs/CHARACTER-DESIGN.md',
    ...fs.readdirSync(path.join(projectDir, 'scenario')).filter((f) => f.endsWith('.json')).map((f) => `scenario/${f}`)];
  const scenarioText = files.filter((f) => f.startsWith('scenario/')).map((f) => fs.readFileSync(path.join(projectDir, f), 'utf8')).join('\n');
  for (const file of files) {
    if (file.startsWith('docs/')) continue; // 文档里的改名对照表会写到旧名
    const text = fs.readFileSync(path.join(projectDir, file), 'utf8');
    for (const old of ['艾琳', '莉莉安']) assert.ok(!text.includes(old), `${file} 仍含旧名「${old}」`);
  }
  for (const name of ['希尔达', '佩特拉', '欧若拉·诺克斯', '卡尔']) assert.ok(scenarioText.includes(name), `scenario 里没有「${name}」`);

  const canonRoot = path.resolve(projectDir, '..');
  const canonFiles = ['设定集', '剧本'].flatMap((dir) => {
    const full = path.join(canonRoot, dir);
    return fs.existsSync(full) ? fs.readdirSync(full).filter((f) => f.endsWith('.md')).map((f) => path.join(full, f)) : [];
  });
  if (!canonFiles.length) return; // 只拷了游戏目录（例如 Docker 镜像）时，正典目录不在，跳过撞名检查
  const canon = canonFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  for (const name of ['希尔达', '希爾達', '佩特拉', '欧若拉', '歐若拉', '卡尔', '卡爾']) {
    assert.ok(!canon.includes(name), `外传名「${name}」与正典撞名`);
  }
});

test('D2: 新关键词不会盖过辱骂与提问', () => {
  for (const id of Object.keys(CHARACTERS)) {
    for (const message of ['你好笨', '蠢货', '你一个人去送死吧，蠢货', '牺牲你这个废物', '说真话啊，没用的东西']) {
      const reply = fallbackReply({}, id, message);
      assert.equal(reply.intent, 'insult', `${id}「${message}」`);
      assert.equal(reply.bondDelta, -2);
    }
  }
  assert.equal(classifyMessage('你是一个人来的吗？'), 'question');
  assert.equal(classifyMessage('你扛得住吗？'), 'question');
  assert.equal(classifyMessage('我不会让你一个人面对它。'), 'encourage');
});

test('外传反讽：「我保证才怪」之类不算承诺，夹带辱骂的仍算辱骂', () => {
  for (const message of ['我保证才怪', '我会保护你才怪！', '鬼才答应你', '对不起才怪']) {
    assert.equal(classifyMessage(message), 'other', message);
  }
  assert.equal(classifyMessage('我保证才怪，蠢货'), 'insult');
  assert.equal(classifyMessage('我保证会保护你们'), 'promise');
});

test('D4: 外传文案的中文引号成对（不再出现 ”…”）', () => {
  const files = ['game/ai.mjs', 'game/content.mjs', 'game/engine.mjs',
    ...fs.readdirSync(path.join(projectDir, 'scenario')).filter((f) => f.endsWith('.json')).map((f) => `scenario/${f}`)];
  for (const file of files) {
    const lines = fs.readFileSync(path.join(projectDir, file), 'utf8').split('\n');
    lines.forEach((line, i) => {
      assert.doesNotMatch(line, /”[^“]*”/, `${file}:${i + 1}`);
    });
  }
  // 运行时字符串也检查一遍：每个 ” 前面都必须有尚未闭合的 “
  const strings = [
    ...Object.values(FALLBACK_LINES).flatMap((pools) => Object.values(pools).flat()),
    ...Object.values(CHARACTERS).flatMap((c) => [c.speech, c.archetype, ...c.knownFacts]),
    ...[INTRO_EVENTS, CAMP_EVENTS, CORRIDOR_EVENTS, AFTERMATH_EVENTS].flat().map((ev) => ev.text)
  ];
  for (const text of strings) {
    let open = false;
    for (const ch of text) {
      if (ch === '“') { assert.ok(!open, `引号嵌套：${text}`); open = true; }
      if (ch === '”') { assert.ok(open, `孤立的右引号：${text}`); open = false; }
    }
    assert.ok(!open, `引号未闭合：${text}`);
  }
});

test('D5: 外传数据按正典写法（塞雷娜、米娅·玲）', () => {
  assert.equal(CHARACTERS.serena.name, '塞雷娜·诺克斯');
  assert.equal(CHARACTERS.serena.shortName, '塞雷娜');
  assert.equal(CHARACTERS.mia.name, '米娅·玲');
  const files = ['game/ai.mjs', 'game/content.mjs', 'game/engine.mjs', 'scenario/index.mjs',
    ...fs.readdirSync(path.join(projectDir, 'scenario')).filter((f) => f.endsWith('.json')).map((f) => `scenario/${f}`)];
  for (const file of files) {
    const text = fs.readFileSync(path.join(projectDir, file), 'utf8');
    assert.ok(!text.includes('塞蕾娜'), `${file} 含「塞蕾娜」`);
    assert.ok(!text.includes('米娅·铃'), `${file} 含「米娅·铃」`);
  }
  // 只做整串替换：「起床铃」「风铃」之类的词保持原样
  assert.ok(FALLBACK_LINES.mia.promise.some((line) => line.includes('起床铃')));
});

test('B9: 外传角色的 portrait 指向 tools/art 生成的 SVG（游戏内不放位图女主）', () => {
  for (const c of Object.values(CHARACTERS)) {
    assert.match(c.portrait, /^\/assets\/portraits\/[a-z]+\.svg$/, `${c.id}: ${c.portrait}`);
    assert.ok(fs.existsSync(path.join(projectDir, 'public', c.portrait)), `${c.portrait} 不存在`);
  }
});
