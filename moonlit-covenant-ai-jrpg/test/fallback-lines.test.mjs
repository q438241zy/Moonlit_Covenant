// 轨道 D：外传离线保底台词与快捷提问的回归测试（D1、D2、D4、D5）。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALLOWED_INTENTS,
  CHARACTERS,
  INTRO_EVENTS,
  CAMP_EVENTS,
  CORRIDOR_EVENTS,
  BATTLE_INTRO_EVENTS,
  BATTLE_PHASE_EVENTS,
  AFTERMATH_EVENTS
} from '../game/content.mjs';
import { FALLBACK_LINES, FALLBACK_TACTICAL_HINTS, classifyMessage, fallbackReply } from '../game/ai.mjs';

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

test('D2: 5 条提问类快捷提问保持 question（专属回复待作者定稿，见 B5）', () => {
  const questions = [
    ['lia', '你以前的队伍……发生了什么？'],
    ['mia', '零号对你来说意味着什么？'],
    ['serena', '你真正害怕的是什么？'],
    ['serena', '你手套下面藏着什么？'],
    ['serena', '如果一切都能预见，你还想活着吗？']
  ];
  for (const [id, prompt] of questions) assert.equal(fallbackReply({}, id, prompt).intent, 'question', prompt);
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
