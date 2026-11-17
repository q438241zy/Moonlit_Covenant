// 番外 ex001–ex010（剧本规格§七、提案 4.7）：目录、变量沙箱、开局快照、首通奖励、换衣间入口、判定上下文、HTTP 与播放器。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { validateChapter, startExtraRun, createRun, isExtraId, EXTRA_VAR } from '../public/story/engine.js';
import { recordExtraClear, recordChapterClear, REWARD_RULES, ensureRewards } from '../game/rewards.mjs';
import { branchScenesView, BRANCH_SCENES } from '../game/costume.mjs';
import { COSTUME_CATALOG, COSTUME_TYPE_META } from '../game/gacha.mjs';
import { wearingFacts, extraMemoryFacts, loadStoryChapter, buildPrompt } from '../game/story-judge.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const readJson = (rel) => JSON.parse(read(rel));
const index = readJson('public/story/extras/index.json');
const speakers = readJson('public/story/speakers.json');
const locations = readJson('public/story/locations.json');
const live = index.filter((e) => e.file && fs.existsSync(path.join(root, 'public', e.file)));

test('番外目录：ex001–ex010 十篇番外＋ex011–ex021 十一条成长支线，解锁章不晚于正式25，赠品只有★3 或非卖品', () => {
  assert.deepEqual(index.map((e) => e.id), Array.from({ length: 21 }, (_, i) => `ex${String(i + 1).padStart(3, '0')}`));
  for (const [i, e] of index.entries()) {
    assert.equal(e.number, i + 1);
    const quest = i >= 10;
    assert.equal(e.kind === 'sidequest', quest, `${e.id}.kind`);
    assert.match(e.title, new RegExp(`^${quest ? '支线' : '番外'}[一二三四五六七八九十]+｜`));
    if (quest) assert.deepEqual([e.costumeTypes, e.gifts.costumes], [[], []], `${e.id}: side quests have no costumes`);
    assert.match(e.unlockAfter, /^ch\d{3}$/);
    assert.ok(Number(e.unlockAfter.slice(2)) <= 25, `${e.id} unlocks by ch025`);
    for (const type of e.costumeTypes) assert.ok(COSTUME_TYPE_META[type], `${e.id}: ${type}`);
    for (const id of e.gifts.costumes) {
      const c = COSTUME_CATALOG.find((x) => x.id === id);
      assert.ok(c && (c.rarity === 3 || c.status === 'gift'), `${e.id}: gift ${id} must be ★3 or non-sale`);
    }
  }
  // 两篇海边番外送齐八人的度假装（提案 4.7）
  const resorts = index.flatMap((e) => e.gifts.costumes).filter((id) => id.endsWith('_resort'));
  assert.equal(new Set(resorts).size, 8);
  assert.ok(live.some((e) => e.id === 'ex001'), 'ex001 is live');
});

test('已上线的番外：照章节格式校验，end.next 为空，只写 EX_* 变量，目录与文件一致', () => {
  for (const entry of live) {
    const extra = readJson(`public${entry.file}`);
    assert.deepEqual(validateChapter(extra, { speakers, locations }), [], entry.id);
    assert.equal(extra.end.next, null);
    for (const k of ['title', 'number', 'unlockAfter']) assert.equal(extra[k], entry[k], `${entry.id}.${k}`);
    assert.deepEqual(extra.costumeTypes, entry.costumeTypes);
    assert.ok(EXTRA_VAR.test(extra.end.memory.key));
    assert.ok(extra.end.memory.text.length <= 60);
    if (entry.estimatedMinutes !== undefined) {
      assert.equal(extra.estimatedMinutes, entry.estimatedMinutes, `${entry.id}.estimatedMinutes`);
      assert.ok(extra.estimatedMinutes >= 8 && extra.estimatedMinutes <= 12, `${entry.id}: 8–12 minutes`);
    }
  }
});

function tinyExtra(patch = {}) {
  return {
    id: 'ex099', number: 99, title: '番外｜测试', unlockAfter: 'ch010', canon: { vars: { LEAH_TRUST: 5 } },
    shots: [{ id: 'a', bg: 'black', beats: [{ t: 'narr', text: '早上。' }] }],
    end: { next: null, memory: { key: 'EX099_MEMORY', text: '测试的一天。' }, set: { flags: { EX099_DONE: true } } },
    ...patch,
  };
}

test('变量沙箱：番外写主线变量、接下一章、缺记忆都会被 validateChapter 拦下', () => {
  assert.deepEqual(validateChapter(tinyExtra()), []);
  assert.ok(isExtraId('ex001') && !isExtraId('ch001'));
  const bad = (patch, re) => assert.ok(validateChapter(tinyExtra(patch)).some((e) => re.test(e)), JSON.stringify(patch).slice(0, 80));
  bad({ end: { next: 'ch011', memory: { key: 'EX099_MEMORY', text: 'x' } } }, /end\.next 必须为 null/);
  bad({ end: { next: null } }, /记忆/);
  bad({ end: { next: null, memory: { key: 'EX099_MEMORY', text: 'x' }, set: { vars: { LEAH_TRUST: 9 } } } }, /只能写 EX_\* 变量/);
  bad({ shots: [{ id: 'a', bg: 'black', beats: [{ t: 'set', vars: { promise_leah_team_001: 'kept' } }] }] }, /promise_leah_team_001/);
  bad({ shots: [{ id: 'a', bg: 'black', beats: [{ t: 'set', add: { MONARCH_TERROR: 1 } }] }] }, /MONARCH_TERROR/);
  const input = {
    t: 'input', id: 'FI_X', kind: 'dialogue', prompt: '{PLAYER_NAME}？', silent: 'q', fallback: 'q',
    intents: [{ id: 'a', label: 'a', keywords: ['好'], set: { vars: { MIA_TRUST: 1 } } }, { id: 'b', label: 'b', keywords: ['不'] }, { id: 'q', label: 'q', keywords: [] }],
  };
  bad({ shots: [{ id: 'a', bg: 'black', beats: [input] }] }, /MIA_TRUST/);
  // canon 是没有存档时的默认正史快照：只读，不算写入
  assert.deepEqual(validateChapter(tinyExtra({ canon: { vars: { LEAH_TRUST: 3 }, flags: { FLAG_CH010_MIA_JOINED: true } } })), []);
});

test('开局快照：有解锁章的章末存档就接它（不改动原存档），没有就用番外自带的默认正史', () => {
  const extra = tinyExtra();
  const snap = createRun({ playerName: '亚克', chapter: { id: 'ch010', canon: { vars: { LEAH_TRUST: 21, LEAH_RELATIONSHIP_STAGE: 'COMPANION' } } } });
  snap.done = true;
  const before = JSON.stringify(snap);
  const run = startExtraRun({ extra, snapshot: snap, playerName: '阿克', mode: '15+' });
  assert.equal(run.chapterId, 'ex099');
  assert.equal(run.vars.LEAH_TRUST, 21);
  assert.equal(run.playerName, '阿克');
  assert.equal(run.mode, '15+');
  assert.equal(JSON.stringify(snap), before, 'the main-line save is not touched');
  const fresh = startExtraRun({ extra, playerName: '亚克' });
  assert.equal(fresh.vars.LEAH_TRUST, 5);
  assert.equal(fresh.mode, '12+');
});

test('首通奖励：80 钻、赠品外观、技能材料只发一次；★4/★5 永不赠送；已有的★3 折成钻石；不碰主线进度', () => {
  const account = { id: 'p', diamonds: 0, ownedCostumes: [], ownedCharacters: ['lia', 'mia'] };
  const r1 = recordExtraClear(account, { id: 'ex001', gifts: { costumes: ['lia_maid', 'lia_swimsuit'] } });
  assert.equal(r1.granted, true);
  assert.equal(r1.extraReward, REWARD_RULES.extraFirstClear);
  assert.deepEqual(r1.costumesGranted, ['lia_maid'], '★5 swimsuit is never a gift');
  assert.deepEqual(r1.skillMaterials, { white: 10, green: 5, blue: 2 });
  assert.equal(account.diamonds, 80);
  assert.deepEqual(ensureRewards(account).chaptersCleared, []);
  const r2 = recordExtraClear(account, { id: 'ex001', gifts: { costumes: ['lia_maid'] } });
  assert.equal(r2.alreadyCleared, true);
  assert.equal(r2.granted, false);
  assert.equal(account.diamonds, 80);
  const r3 = recordExtraClear(account, { id: 'ex004', gifts: { costumes: ['lia_maid'] } });
  assert.deepEqual(r3.costumesCompensated, [{ id: 'lia_maid', diamonds: 8 }]);
  assert.equal(account.diamonds, 80 + 80 + 8);
  assert.deepEqual(r3.extrasCleared, ['ex001', 'ex004']);
  assert.throws(() => recordExtraClear(account, { id: 'ch010' }), /番外 ID 无效/);
});

test('换衣间入口：对应番外上线才 available，解锁看主线首通，读过记 cleared', () => {
  const view = branchScenesView(index, [], []);
  assert.equal(view.maid.available, live.some((e) => e.id === 'ex001'));
  assert.equal(view.maid.extrasStatus[0].unlocked, false);
  const after = branchScenesView(index, ['ch010'], ['ex001']);
  assert.deepEqual({ ...after.maid.extrasStatus[0], title: undefined }, { id: 'ex001', title: undefined, live: true, unlocked: true, cleared: true, unlockAfter: 'ch010' });
  assert.equal(branchScenesView([], [], []).maid.available, false, 'no live extras → 敬请期待');
  assert.deepEqual(Object.keys(after).sort(), Object.keys(BRANCH_SCENES).sort());
});

test('判定上下文：类型相符的番外才带「她穿着X」（不计分）；主线只在解锁章之后提番外记忆', () => {
  const ex001 = loadStoryChapter('ex001');
  assert.equal(ex001.id, 'ex001');
  assert.deepEqual(wearingFacts(ex001, { lia: 'maid', mia: 'swimsuit', evil: 'maid', lia_cell: 'maid' }, speakers), ['外观（只用于描写，不计分，不要细写衣服的样子）：', '莉亚穿着女仆装（她自己挑的）。']);
  assert.deepEqual(wearingFacts(loadStoryChapter('ch011'), { lia: 'maid' }), [], 'the main line never mentions costumes');
  const ch011 = loadStoryChapter('ch011');
  const memory = extraMemoryFacts(ch011, ['ex001', 'ex001', 'bogus']);
  assert.equal(memory.length, 2);
  assert.equal(memory[1], ex001.end.memory.text);
  assert.deepEqual(extraMemoryFacts(loadStoryChapter('ch010'), ['ex001']), [], 'not before the unlock chapter is behind');
  const node = ch011.shots.flatMap((s) => s.beats).find((b) => b.t === 'input');
  if (node) assert.ok(buildPrompt(ch011, node, '亚克', [], '15+', { extraMemories: ['ex001'] }).includes(ex001.end.memory.text));
});

// ─── HTTP ───
async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => { const { port } = server.address(); server.close((e) => (e ? reject(e) : resolve(port))); });
  });
}
async function startServer(t) {
  const port = await freePort();
  const env = { ...process.env, AI_MODE: 'demo', HOST: '127.0.0.1', PORT: String(port), NODE_ENV: 'test', DEMO_TOOLS: '1', PERSIST: '0' };
  delete env.ADMIN_KEY;
  const child = spawn(process.execPath, ['server.mjs'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  child.stdout.on('data', (c) => { logs += c; });
  child.stderr.on('data', (c) => { logs += c; });
  t.after(() => { if (child.exitCode === null) child.kill('SIGKILL'); });
  const base = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 8000;
  for (;;) {
    if (child.exitCode !== null) throw new Error(`server exited early:\n${logs}`);
    try { if ((await fetch(`${base}/api/health`)).ok) break; } catch { /* starting */ }
    if (Date.now() > deadline) throw new Error(`server did not start:\n${logs}`);
    await new Promise((r) => setTimeout(r, 60));
  }
  return base;
}
const api = async (base, p, body) => {
  const res = await fetch(`${base}${p}`, { method: body === undefined ? 'GET' : 'POST', headers: { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: res.status, json: await res.json() };
};

test('HTTP: POST /api/story/extra — 未解锁 403、首通发奖、重复幂等、未知番外 400；换衣间入口随之更新', { timeout: 30000 }, async (t) => {
  const base = await startServer(t);
  const playerId = (await api(base, '/api/account/create', { playerName: '番外' })).json.account.id;
  const locked = await api(base, '/api/story/extra', { playerId, extraId: 'ex001' });
  assert.equal(locked.status, 403);
  assert.equal(locked.json.error.code, 'EXTRA_LOCKED');
  assert.equal((await api(base, '/api/story/extra', { playerId, extraId: 'ex999' })).json.error.code, 'UNKNOWN_EXTRA');
  assert.equal((await api(base, '/api/story/extra', { playerId, extraId: 'ch010' })).status, 400);
  assert.equal((await api(base, '/api/story/progress', { playerId, chapterId: 'ch010' })).status, 200);
  const first = await api(base, '/api/story/extra', { playerId, extraId: 'ex001' });
  assert.equal(first.status, 200);
  assert.equal(first.json.extraReward, 80);
  assert.deepEqual(first.json.costumesGranted, ['lia_maid']);
  assert.ok(first.json.account.ownedCostumes.includes('lia_maid'));
  const again = await api(base, '/api/story/extra', { playerId, extraId: 'ex001' });
  assert.equal(again.json.alreadyCleared, true);
  assert.equal(again.json.balance, first.json.balance);
  const wardrobe = (await api(base, `/api/costume?playerId=${playerId}`)).json;
  assert.deepEqual(wardrobe.branches.maid.extrasStatus.map((x) => [x.id, x.live, x.unlocked, x.cleared]), [['ex001', true, true, true]]);
  assert.ok(!(await api(base, `/api/rewards/status?playerId=${playerId}`)).json.chaptersCleared.includes('ex001'));
});

test('播放器：「番外・休息日」分页、番外存档键与主线分开、胸像按 costumeTypes 换装', () => {
  const player = read('public/story/player.js');
  assert.match(player, /番外・休息日/);
  for (const key of ["exAuto: 'moonlit:story:ex:autosave'", "exProgress: 'moonlit:story:ex:progress'", "exSave: (key) => `moonlit:story:ex:save:${key}`"]) assert.ok(player.includes(key), key);
  assert.match(player, /const autoKey = \(\) => \(inExtra\(\) \? KEYS\.exAuto : KEYS\.auto\);/);
  assert.match(player, /startExtraRun\(\{ extra, snapshot: snap\?\.run \|\| null/);
  assert.match(player, /\/assets\/costumes\/bust\/\$\{soft \? 'soft\/' : ''\}\$\{id\}\.svg/);
  assert.match(player, /apiJson\('\/api\/story\/extra', \{ playerId, extraId: ch\.id \}\)/);
  const css = read('public/story/story.css');
  assert.match(css, /\.ch-tab\[aria-selected="true"\]/);
});
