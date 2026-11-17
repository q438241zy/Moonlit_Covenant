// IF 外传《银轨号》正篇 g001–g015（docs/STORY-ENGINE.md §12）：目录、章节格式、与正典隔离、播放器的外传轨道、主菜单的进度。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateChapter, isGaidenId, createRun, next, resolveInput, demoJudge, findNode } from '../public/story/engine.js';
import { loadStoryChapter, buildPrompt } from '../game/story-judge.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const readJson = (rel) => JSON.parse(read(rel));
const index = readJson('public/gaiden/index.json');
const speakers = readJson('public/story/speakers.json');
const locations = readJson('public/story/locations.json');
const live = index.filter((e) => fs.existsSync(path.join(root, 'public', e.file)));

test('外传目录：g001–g015 十五章一条链，对应 scenario 原稿', () => {
  assert.equal(index.length, 15);
  index.forEach((e, i) => {
    assert.equal(e.id, `g${String(i + 1).padStart(3, '0')}`);
    assert.ok(isGaidenId(e.id));
    assert.equal(e.number, i + 1);
    assert.equal(e.requires, i ? index[i - 1].id : null);
    assert.equal(e.file, `/gaiden/${e.id}.json`);
    assert.equal(e.source, `scenario/chapter-${String(i + 1).padStart(2, '0')}.json`);
    assert.ok(fs.existsSync(path.join(root, e.source)), e.source);
    const draft = readJson(e.source);
    assert.ok(e.title.endsWith(`｜${draft.title}`), `${e.id} keeps the draft title「${draft.title}」`);
  });
});

test('外传章节：照章节格式校验，接上下一章，跨章只用 GD_ 变量', () => {
  for (const entry of live) {
    const ch = readJson(`public${entry.file}`);
    assert.deepEqual(validateChapter(ch, { speakers, locations }), [], entry.id);
    assert.equal(ch.title, entry.title);
    assert.equal(ch.number, entry.number);
    const nextEntry = index[index.indexOf(entry) + 1];
    assert.equal(ch.end.next, nextEntry ? nextEntry.id : null, `${entry.id}.end.next`);
    if (entry.estimatedMinutes !== undefined) assert.equal(ch.estimatedMinutes, entry.estimatedMinutes);
    for (const key of Object.keys(ch.canon?.vars || {})) assert.match(key, /^GD_/, `${entry.id} canon.${key}`);
  }
});

test('外传与正典隔离：外传称号不进 public/story/；外传里不出现改掉的旧名和主线剧透词', () => {
  // 外传章节放在 public/gaiden/，不在 public/story/ 这个正典目录（canon-guard B1/B15 扫的是 public/story/）
  assert.ok(!fs.existsSync(path.join(root, 'public/story/gaiden')));
  const banned = ['艾琳', '莉莉安', '蚀宴会', '莫尔坎', '晨星皇朝', '索拉恩', '黯冠', '瓦尔哈拉'];
  for (const entry of live) {
    const text = read(`public${entry.file}`);
    for (const word of banned) assert.ok(!text.includes(word), `${entry.id}: 「${word}」`);
  }
  const player = read('public/story/player.js');
  for (const title of ['赤誓骑士', '猫耳机关师', '月蚀观测者']) assert.ok(!player.includes(title), `player.js: 「${title}」`);
});

test('判定器：外传章节从 public/gaiden/ 读，提示词写明 IF 外传', () => {
  if (!live.length) return;
  const ch = loadStoryChapter(live[0].id);
  assert.equal(ch.id, live[0].id);
  const node = ch.shots.flatMap((s) => s.beats).find((b) => b.t === 'input');
  if (node) assert.match(buildPrompt(ch, node, '队长', [], '12+'), /IF 外传《银轨号》/);
  assert.equal(loadStoryChapter('g999'), null);
});

test('引擎：外传第一章用沉默可以走到章末', () => {
  if (!live.length) return;
  const ch = readJson(`public${live[0].file}`);
  const run = createRun({ chapter: ch, playerName: '队长' });
  for (let i = 0; i < 5000; i += 1) {
    const item = next(run, ch);
    if (item.kind === 'end') return;
    if (item.kind === 'input') resolveInput(run, ch, demoJudge(findNode(ch, item.node.id), ''), '');
  }
  assert.fail('g001 did not reach its end');
});

test('播放器：?track=gaiden 读 /gaiden/、存档键另用一组、不领主线奖励、没有番外与委托板', () => {
  const player = read('public/story/player.js');
  assert.match(player, /get\('track'\) === 'gaiden'/);
  assert.ok(player.includes("index: '/gaiden/index.json', dir: '/gaiden/'"));
  assert.ok(player.includes("keyPrefix: 'moonlit:story:gd:'"));
  assert.match(player, /auto: `\$\{TRACK\.keyPrefix\}autosave`/);
  assert.match(player, /if \(!GAIDEN\) showChapterReward\(/);
  assert.match(player, /\$\{!GAIDEN && isCompleted\(BOARD_OPENS\)/);
});

test('主菜单：地图按正篇进度点亮城镇，城镇面板直达那一章；标题页外传卡片有正篇入口', () => {
  const app = read('public/app.js');
  assert.ok(app.includes("const GAIDEN_MAIN_PROGRESS_KEY = 'moonlit:story:gd:progress';"));
  assert.match(app, /return Math\.max\(prologue, gaidenMainCleared\(\)\) \+ devGaidenChapters\(\);/);
  assert.match(app, /重温外传第\$\{town\.unlockChapter\}章/);
  assert.match(app, /继续外传正篇（第\$\{next\}章）/);
  assert.match(app, /const sideMainLink = /);
  assert.ok(!app.includes('后续章节敬请期待'));
});
