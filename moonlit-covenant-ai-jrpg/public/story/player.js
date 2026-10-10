// 主线播放界面 · 亚克篇（docs/STORY-ENGINE.md §9）
// 纯前端：章节 JSON + engine.js 推进剧情；自由输入优先请求 /api/story/judge，任何失败都退回本地 demoJudge。
// CSP：无内联脚本 / 内联事件，所有交互都在这里用 addEventListener 绑定。

import {
  ENGINE_VERSION, DEFAULT_PLAYER_NAME, cleanName, createRun, continueRun, next, resolveInput,
  demoJudge, findNode, evalCond, interpolate, publicSummary, eachBeat,
} from './engine.js';
import { icon } from '../icons.js';
import { loadPaint, paint } from '../paint.js';

const root = document.getElementById('story');
const toastRoot = document.getElementById('toasts');

const KEYS = {
  name: 'moonlit:name',
  settings: 'moonlit:story:settings',
  auto: 'moonlit:story:autosave',
  progress: 'moonlit:story:progress',
  read: 'moonlit:story:read',
  backlog: 'moonlit:story:backlog',
  draft: 'moonlit:story:draft',
  save: (key) => `moonlit:story:save:${key}`,
};
const SPEEDS = { slow: { cps: 20, label: '慢' }, normal: { cps: 38, label: '中' }, fast: { cps: 80, label: '快' }, instant: { cps: 0, label: '瞬间' } };
const PACES = { relaxed: { k: 1.35, label: '从容' }, normal: { k: 1, label: '标准' }, brisk: { k: 0.65, label: '紧凑' } };
// collateral 是「波及了不该波及的」：第二章是住户与路人，第三章是干芦苇起火——用不绑定具体对象的说法
const RESULT_LABEL = { clean: '干净利落', hurt: '负伤', collateral: '殃及周遭' };
const RESULT_ICON = { clean: 'sparkle', hurt: 'blood', collateral: 'flame' };
const KIND_LABEL = { dialogue: '对话', action: '行动', tactic: '战术', vow: '誓言', free: '自由' };
const KIND_ICON = { dialogue: 'mail', action: 'boot', tactic: 'target', vow: 'flame', free: 'feather' };
const NOT_A_NAME = new Set(['队长', '旅行者']);
const CANCEL = Symbol('cancel');
const SKIP = Symbol('skip');
const CN_DIGITS = '零一二三四五六七八九';

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── 小工具 ───
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (sel, el = root) => el.querySelector(sel);
const $$ = (sel, el = root) => [...el.querySelectorAll(sel)];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (v) => JSON.parse(JSON.stringify(v));

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}
function store(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
function loadStoredName() {
  let raw = '';
  try { raw = localStorage.getItem(KEYS.name) || ''; } catch { /* 隐私模式 */ }
  raw = raw.trim();
  return raw && !NOT_A_NAME.has(raw) ? cleanName(raw) : DEFAULT_PLAYER_NAME;
}
function storeName(name) {
  try { localStorage.setItem(KEYS.name, name); } catch { /* 隐私模式 */ }
}

function cnNum(n) {
  if (!Number.isInteger(n) || n < 0) return String(n);
  if (n < 10) return CN_DIGITS[n];
  if (n < 20) return `十${n % 10 ? CN_DIGITS[n % 10] : ''}`;
  if (n < 100) return `${CN_DIGITS[Math.floor(n / 10)]}十${n % 10 ? CN_DIGITS[n % 10] : ''}`;
  return String(n);
}
function splitTitle(title, number) {
  const [a, b] = String(title || '').split('｜');
  if (b) return { label: a, name: b };
  return { label: number === 0 ? '序章' : `第${cnNum(number)}章`, name: a };
}
function timeAgo(ts) {
  const s = Math.max(0, (Date.now() - Number(ts || 0)) / 1000);
  if (s < 60) return '刚刚';
  if (s < 3600) return `${Math.floor(s / 60)} 分钟前`;
  if (s < 86400) return `${Math.floor(s / 3600)} 小时前`;
  return `${Math.floor(s / 86400)} 天前`;
}
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

// 窄屏上战斗面板横跨整个屏幕顶部：轻提示改到面板下方，不压住战斗标题和回合数
function placeToasts() {
  let top = '';
  const hud = P.hud;
  if (S.view === 'play' && hud?.isConnected && !hud.hidden) {
    const r = hud.getBoundingClientRect();
    const cx = window.innerWidth / 2;
    if (r.left < cx && r.right > cx && r.bottom < window.innerHeight * 0.7) top = `${Math.round(r.bottom + 10)}px`;
  }
  toastRoot.style.top = top;
}

function toast(message, kind = '') {
  placeToasts();
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.innerHTML = `${kind === 'memory' ? icon('feather', { size: 15 }) : kind === 'warn' ? icon('info', { size: 15 }) : ''}<span>${esc(message)}</span>`;
  toastRoot.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 2200);
}

// ─── 全局状态 ───
const S = {
  index: [], speakers: {}, locations: {},
  chapters: new Map(),
  settings: { mode: '12+', speed: 'normal', pace: 'normal', ...load(KEYS.settings, {}) },
  focus: null,
  view: 'boot',
  chapter: null, run: null, startRun: null,
  token: 0,
  auto: false, skip: false,
  gate: null, gateTimer: 0, typing: null, titleAnim: null, ask: null,
  lineSeen: false,
  backlog: [],
  read: new Set(load(KEYS.read, [])),
  readDirty: false,
  bg: null, bgFront: 0,
  hudBattle: null,
  suppressClickUntil: 0,
  lastInputAt: 0, // 最近一次推进类操作（按键 / 点按）的时间，章节完成页据此判断玩家是否已停手
};
const P = {}; // 播放界面的 DOM 引用

function saveSettings() { store(KEYS.settings, S.settings); }
function flushRead() {
  if (!S.readDirty) return;
  S.readDirty = false;
  let list = [...S.read];
  if (list.length > 8000) { list = list.slice(-6000); S.read = new Set(list); }
  store(KEYS.read, list);
}

// ─── 数据 ───
async function fetchJson(url) {
  try {
    const res = await fetch(url, { cache: 'no-cache', headers: { accept: 'application/json' } });
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) return null;
    return await res.json();
  } catch { return null; }
}

async function loadChapter(id) {
  if (!/^ch\d{3}$/.test(String(id || ''))) return null;
  if (S.chapters.get(id)) return S.chapters.get(id);
  const entry = S.index.find((e) => e.id === id);
  const url = /^\/story\/chapters\/ch\d{3}\.json$/.test(entry?.file || '') ? entry.file : `/story/chapters/${id}.json`;
  const chapter = await fetchJson(url);
  if (!chapter || chapter.id !== id || !Array.isArray(chapter.shots) || !chapter.shots.length) return null;
  S.chapters.set(id, chapter);
  return chapter;
}

function entryFor(id, chapter = S.chapters.get(id)) {
  const e = S.index.find((x) => x.id === id);
  const number = e?.number ?? chapter?.number ?? Number(String(id).slice(2));
  const title = chapter?.title || e?.title || id;
  return { id, number, title, ...splitTitle(title, number), requires: e?.requires ?? null, minutes: chapter?.estimatedMinutes, inIndex: Boolean(e) };
}

function progress() { const p = load(KEYS.progress, {}); return p && typeof p === 'object' ? p : {}; }
function isCompleted(id) { return Boolean(progress()[id]); }
function isUnlocked(entry) { return !entry.requires || isCompleted(entry.requires); }
function endSaveOf(id) {
  const rec = progress()[id];
  const save = rec?.save ? load(KEYS.save(rec.save), null) : null;
  return save?.run ? save : null;
}
function speakerOf(who) { return S.chapter?.speakers?.[who] || S.speakers[who] || null; }

// ═══════════════════════════════════════════════════════════
// 标题 / 章节选择
// ═══════════════════════════════════════════════════════════
function currentName() {
  const field = $('#nameField');
  return cleanName(field ? field.value : loadStoredName());
}

async function renderStart() {
  cancelPlay();
  closeOverlays();
  S.view = 'start';
  S.chapter = null;
  S.run = null;
  const renderId = (S.renderId = (S.renderId || 0) + 1);
  const save = load(KEYS.auto, null);
  const hasSave = Boolean(save?.run && save.chapterId);
  const ids = S.index.map((e) => e.id);
  if (S.focus && !ids.includes(S.focus)) ids.push(S.focus);

  root.innerHTML = `
    <main class="start" id="start">
      <div class="start-bg" aria-hidden="true"><div class="start-moon"></div><div class="start-wings"></div></div>
      <header class="start-top">
        <a class="ghost-link" href="/">${icon('chevron-left', { size: 16 })}<span>返回主页</span></a>
        <div class="start-top-actions">
          <button class="icon-btn" type="button" data-act="settings" aria-haspopup="dialog" aria-expanded="false" aria-label="设置">${icon('settings', { size: 19 })}</button>
        </div>
        ${settingsHtml()}
      </header>
      <div class="start-grid">
        <section class="start-hero" aria-labelledby="startTitle">
          <img class="start-crest" src="/assets/ui/eclipse-crest.svg" alt="" />
          <p class="eyebrow">MAIN STORY · 主线</p>
          <h1 class="start-title" id="startTitle">月蚀契约<span>亚克篇</span></h1>
          <p class="start-tag">黑翼焚毁故乡的那一夜，牧羊青年立下了屠龙之誓。<br>这里没有固定选项——你说出口的每一句话、做出的每一个动作，世界都会记住。</p>
          <label class="name-field">
            <span class="name-label">${icon('user', { size: 16 })}主角名字</span>
            <input id="nameField" type="text" maxlength="12" autocomplete="nickname" spellcheck="false" value="${esc(loadStoredName())}" placeholder="${esc(DEFAULT_PLAYER_NAME)}" />
          </label>
          <div class="start-actions" id="startActions">
            ${hasSave ? `<button class="btn primary large" type="button" data-act="continue">${icon('play', { size: 18 })}<span>继续</span><small id="continueMeta">${esc(timeAgo(save.savedAt))}</small></button>` : ''}
            <button class="btn ${hasSave ? 'secondary' : 'primary'} large" type="button" data-act="begin" id="beginBtn" disabled>${icon('moon', { size: 18 })}<span>载入中…</span></button>
          </div>
          <p class="start-hint">${icon('feather', { size: 15 })}点击 / 空格推进 · 在输入框里用你自己的话回应</p>
        </section>
        <section class="start-chapters" aria-labelledby="chapterHeading">
          <div class="chapters-head">
            <h2 id="chapterHeading">章节</h2>
            <span class="muted">完成上一章即可解锁下一章</span>
          </div>
          <ol class="ch-list" id="chList">
            ${ids.map((id) => `<li class="ch-card loading" data-id="${esc(id)}"><div class="ch-num">${esc(entryFor(id).label)}</div><div class="ch-body"><h3>${esc(entryFor(id).name)}</h3><p class="ch-meta">读取中…</p></div></li>`).join('') || '<li class="ch-empty">章节目录读取失败，请刷新重试。</li>'}
          </ol>
        </section>
      </div>
    </main>`;

  $('#nameField').addEventListener('change', (e) => { const n = cleanName(e.target.value); e.target.value = n; storeName(n); });
  $('[data-act="continue"]')?.addEventListener('click', continueSave);
  bindSettings($('#start'));

  const [chapters] = await Promise.all([Promise.all(ids.map((id) => loadChapter(id))), hasSave ? loadChapter(save.chapterId) : null]);
  if (S.view !== 'start' || renderId !== S.renderId) return; // 期间又重绘过（连点返回标题等）
  if (hasSave) {
    const saveEntry = entryFor(save.chapterId);
    const meta = $('#continueMeta');
    if (meta) meta.textContent = `${saveEntry.label} · ${timeAgo(save.savedAt)}`;
  }
  const list = $('#chList');
  ids.forEach((id, i) => {
    const li = list.querySelector(`[data-id="${CSS.escape(id)}"]`);
    if (li) li.outerHTML = chapterCardHtml(id, chapters[i]);
  });
  list.querySelectorAll('[data-start]').forEach((btn) => btn.addEventListener('click', () => startChapter(btn.dataset.start, { canon: btn.dataset.canon === '1' })));

  // 主按钮：直达链接 > 第一个未完成且已解锁的章节 > 从序章重玩
  const begin = $('#beginBtn');
  const available = ids.filter((id, i) => chapters[i]);
  let target = S.focus && S.chapters.get(S.focus) ? S.focus : null;
  target ||= available.find((id) => isUnlocked(entryFor(id)) && !isCompleted(id)) || available[0] || null;
  if (target) {
    const e = entryFor(target);
    const replay = isCompleted(target);
    begin.innerHTML = `${icon(replay ? 'refresh' : 'moon', { size: 18 })}<span>${replay ? '重玩' : '开始'}${esc(e.label)}</span>${S.focus ? `<small>${esc(e.name)}</small>` : ''}`;
    begin.disabled = false;
    begin.addEventListener('click', () => startChapter(target, { canon: false }));
  } else {
    begin.innerHTML = `${icon('lock', { size: 18 })}<span>主线制作中</span>`;
  }
  if (S.focus && !S.chapters.get(S.focus)) toast(`「${entryFor(S.focus).label}」尚未开放`, 'warn');
}

function chapterCardHtml(id, chapter) {
  const e = entryFor(id, chapter);
  const done = isCompleted(id);
  const direct = S.focus === id;
  const unlocked = isUnlocked(e) || direct || done; // 用默认正史打通过的章节，前一章没完成也能直接重玩
  const reqEntry = e.requires ? entryFor(e.requires) : null;
  const cls = ['ch-card', !chapter ? 'unavailable' : unlocked ? 'open' : 'locked', done ? 'done' : '', direct ? 'focus' : ''].filter(Boolean).join(' ');
  const meta = [];
  if (!chapter) meta.push('尚未开放');
  else {
    if (e.minutes) meta.push(`约 ${e.minutes} 分钟`);
    if (!done && !unlocked) meta.push(`完成「${reqEntry?.label || e.requires}」后解锁`);
  }
  const canonLink = chapter && e.requires
    ? `<button class="link-btn" type="button" data-start="${esc(id)}" data-canon="1">从本章开始（使用默认正史）</button>` : '';
  const mainBtn = chapter && unlocked
    ? `<button class="btn ${done ? 'secondary' : 'primary'} small" type="button" data-start="${esc(id)}" aria-label="${done ? '重玩' : '开始'}${esc(e.label)}">${icon(done ? 'refresh' : 'play', { size: 15 })}${done ? '重玩' : '开始'}</button>` : '';
  const badge = !chapter ? `<span class="ch-badge">${icon('clock', { size: 14 })}制作中</span>`
    : done ? `<span class="ch-badge ok">${icon('check', { size: 14 })}已完成</span>`
      : !unlocked ? `<span class="ch-badge">${icon('lock', { size: 14 })}未解锁</span>` : '';
  return `<li class="${cls}" data-id="${esc(id)}">
    <div class="ch-num">${esc(e.label)}</div>
    <div class="ch-body">
      <h3>${esc(e.name)} ${badge}</h3>
      <p class="ch-meta">${esc(meta.join(' · '))}</p>
      ${canonLink}
    </div>
    <div class="ch-actions">${mainBtn}</div>
  </li>`;
}

async function startChapter(id, { canon = false } = {}) {
  const chapter = await loadChapter(id);
  if (!chapter) { toast('该章节尚未开放', 'warn'); return; }
  const save = load(KEYS.auto, null);
  if (save?.run && !save.run.done) {
    const ok = await confirmDialog('开始新的进度会覆盖当前的自动存档（章末存档不受影响）。', '开始新进度');
    if (!ok) return;
  }
  const name = currentName();
  storeName(name);
  const e = entryFor(id, chapter);
  const prev = !canon && e.requires ? endSaveOf(e.requires) : null;
  let run;
  if (prev) {
    run = continueRun(prev.run, chapter);
    run.playerName = name;
  } else {
    run = createRun({ playerName: name, chapter, mode: S.settings.mode });
  }
  run.mode = S.settings.mode;
  if (e.requires && !prev) toast('已按默认正史补齐前情');
  enterPlay(chapter, run, { fresh: true });
}

async function continueSave() {
  const save = load(KEYS.auto, null);
  if (!save?.run || !save.chapterId) { toast('没有可继续的存档', 'warn'); return; }
  const chapter = await loadChapter(save.chapterId);
  if (!chapter) { toast('存档所在的章节尚未开放', 'warn'); return; }
  const run = save.run;
  if (run.v !== ENGINE_VERSION || !Array.isArray(run.stack)) { toast('存档版本不兼容，请重新开始本章', 'warn'); return; }
  const name = currentName();
  storeName(name);
  run.playerName = name;
  run.mode = S.settings.mode;
  const log = load(KEYS.backlog, null);
  const backlog = log?.chapterId === save.chapterId && Array.isArray(log.lines) ? log.lines.filter((l) => l && typeof l.text === 'string') : [];
  enterPlay(chapter, run, { fresh: false, backlog, stage: save.stage });
}

function confirmDialog(message, okLabel = '确定') {
  return new Promise((resolve) => {
    const prev = document.activeElement;
    const wrap = document.createElement('div');
    wrap.className = 'modal';
    wrap.innerHTML = `<div class="modal-card" role="alertdialog" aria-modal="true" aria-labelledby="confirmMsg">
      <p id="confirmMsg">${esc(message)}</p>
      <div class="modal-actions">
        <button class="btn secondary" type="button" data-v="0">取消</button>
        <button class="btn primary" type="button" data-v="1">${esc(okLabel)}</button>
      </div></div>`;
    const done = (v) => { wrap.remove(); document.removeEventListener('keydown', onKey, true); prev?.focus?.(); resolve(v); };
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(false); } };
    wrap.addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]');
      if (b) done(b.dataset.v === '1');
      else if (e.target === wrap) done(false);
    });
    document.addEventListener('keydown', onKey, true);
    root.appendChild(wrap);
    wrap.querySelector('[data-v="1"]').focus();
  });
}

// ─── 设置浮层（标题页与播放页共用） ───
function settingsHtml() {
  const seg = (name, legend, options, value) => `
    <fieldset class="seg"><legend>${legend}</legend><div class="seg-row">
      ${Object.entries(options).map(([v, o]) => `<label><input type="radio" name="${name}" value="${esc(v)}" ${v === value ? 'checked' : ''} /><span>${esc(o.label)}</span></label>`).join('')}
    </div></fieldset>`;
  return `<div class="pop" id="settingsPop" role="dialog" aria-label="设置" hidden>
    <div class="pop-head"><strong>${icon('settings', { size: 16 })}设置</strong><button class="icon-btn sm" type="button" data-act="close-settings" aria-label="关闭设置">${icon('close', { size: 16 })}</button></div>
    ${seg('mode', '内容模式', { '12+': { label: '12+' }, '15+': { label: '15+' } }, S.settings.mode)}
    <p class="pop-note">15+ 会显示更直接的伤亡描写，主线剧情相同。</p>
    ${seg('speed', '文字速度', SPEEDS, S.settings.speed)}
    ${seg('pace', '自动播放', PACES, S.settings.pace)}
  </div>`;
}

function bindSettings(scope) {
  const pop = $('#settingsPop', scope);
  const btn = $('[data-act="settings"]', scope);
  if (!pop || !btn) return;
  // refocus：true 回到设置按钮（键盘关闭）；'stage' 回到对话框（鼠标关闭后空格继续推进剧情）；false 不动焦点
  const close = (refocus = true) => {
    if (pop.hidden) return;
    pop.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (refocus === 'stage' && S.view === 'play') focusStage();
    else if (refocus) btn.focus();
  };
  const open = () => {
    pop.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    pop.querySelector('input:checked')?.focus();
  };
  btn.addEventListener('click', (e) => { e.stopPropagation(); if (pop.hidden) open(); else close(e.detail > 0 ? 'stage' : true); });
  $('[data-act="close-settings"]', pop).addEventListener('click', (e) => close(e.detail > 0 ? 'stage' : true));
  pop.addEventListener('change', (e) => {
    const { name, value } = e.target;
    if (name === 'mode') { S.settings.mode = value === '15+' ? '15+' : '12+'; if (S.run) S.run.mode = S.settings.mode; }
    if (name === 'speed' && SPEEDS[value]) S.settings.speed = value;
    if (name === 'pace' && PACES[value]) S.settings.pace = value;
    saveSettings();
    scheduleGateTimers();
  });
  pop.closeSelf = close;
}

function closeOverlays() {
  const pop = $('#settingsPop');
  if (pop && !pop.hidden) { pop.closeSelf?.(); return true; }
  if (P.backlog && !P.backlog.hidden) { toggleBacklog(false); return true; }
  return false;
}

// ═══════════════════════════════════════════════════════════
// 播放界面
// ═══════════════════════════════════════════════════════════
function renderPlay() {
  S.view = 'play';
  const e = entryFor(S.chapter.id, S.chapter);
  root.innerHTML = `
    <main class="play" id="play" aria-label="${esc(S.chapter.title)}">
      <div class="scene" id="scene">
        <div class="bg" data-layer="0"></div><div class="bg" data-layer="1"></div>
        <div class="vignette" aria-hidden="true"></div>
        <div class="art art-left" data-side="left" aria-hidden="true"><img alt="" draggable="false" /></div>
        <div class="art art-right" data-side="right" aria-hidden="true"><img alt="" draggable="false" /></div>
      </div>
      <div class="veil" id="veil" aria-hidden="true"></div>
      <div class="flash" id="flash" aria-hidden="true"></div>

      <header class="play-bar">
        <button class="icon-btn" type="button" data-act="home" aria-label="返回标题（进度已自动保存）">${icon('home', { size: 19 })}</button>
        <div class="bar-title"><span class="bar-label">${esc(e.label)}</span><span class="bar-name">${esc(e.name)}</span></div>
        <div class="bar-actions">
          <button class="bar-btn" type="button" data-act="auto" aria-pressed="false" title="自动播放（A）">${icon('play', { size: 16 })}<span>自动</span></button>
          <button class="bar-btn" type="button" data-act="skip" aria-pressed="false" title="快进已读内容（S）">${icon('rush', { size: 16 })}<span>快进</span></button>
          <button class="bar-btn" type="button" data-act="log" aria-haspopup="dialog" title="回看（L）">${icon('scroll', { size: 16 })}<span>回看</span></button>
          <button class="bar-btn" type="button" data-act="settings" aria-haspopup="dialog" aria-expanded="false" title="设置">${icon('settings', { size: 16 })}<span>设置</span></button>
        </div>
        ${settingsHtml()}
      </header>

      <div class="shot-cap" id="shotCap" aria-hidden="true"></div>

      <aside class="hud" id="hud" aria-label="战斗状态" hidden>
        <div class="hud-head">
          <span class="hud-tag">${icon('battle', { size: 14 })}遭遇战</span>
          <strong class="hud-title"></strong>
          <span class="hud-round"></span>
          <button class="hud-toggle" type="button" aria-expanded="true" aria-label="收起情报">${icon('chevron-right', { size: 16 })}</button>
        </div>
        <div class="hud-detail">
          <p class="hud-goal"><b>${icon('target', { size: 14 })}目标</b><span class="hud-objective"></span></p>
          <p class="hud-goal bonus"><b>${icon('star4', { size: 14 })}加分</b><span class="hud-bonus"></span></p>
          <ul class="hud-intel"></ul>
        </div>
        <div class="hud-bars"></div>
        <div class="hud-result" hidden></div>
      </aside>

      <div class="banner" id="banner" hidden><span class="banner-text"></span></div>

      <div class="dock idle" id="dock">
        <div class="dlg" id="dlg" tabindex="0" role="button" aria-label="继续（点击、空格或回车）">
          <div class="dlg-plate"><span class="dlg-name"></span><span class="dlg-note"></span></div>
          <p class="dlg-text"><span class="dlg-shown"></span><span class="dlg-rest" aria-hidden="true"></span></p>
          <span class="dlg-more" aria-hidden="true"></span>
        </div>
        <form class="ask" id="ask" hidden autocomplete="off" tabindex="-1" aria-labelledby="askPrompt">
          <div class="ask-context" hidden><span class="ask-context-name"></span><span class="ask-context-text"></span></div>
          <div class="ask-head"><span class="ask-kind"></span><p class="ask-prompt" id="askPrompt"></p></div>
          <div class="ask-field">
            <textarea id="askInput" rows="2" maxlength="300" aria-labelledby="askPrompt" enterkeyhint="send"></textarea>
            <div class="ask-thinking" aria-hidden="true"><span class="ask-echo"></span><span class="dots"><i></i><i></i><i></i></span></div>
          </div>
          <div class="ask-actions">
            <span class="ask-hint">Enter 提交 · Shift+Enter 换行</span>
            <button class="btn ghost" type="button" data-ask="skip" hidden>跳过</button>
            <button class="btn secondary" type="button" data-ask="silent">${icon('eye-off', { size: 16 })}保持沉默</button>
            <button class="btn primary" type="submit">${icon('feather', { size: 16 })}行动</button>
          </div>
        </form>
      </div>

      <div class="title-card" id="titleCard" hidden></div>
      <div class="sr-only" id="live" aria-live="polite" aria-atomic="true"></div>

      <div class="backlog" id="backlog" role="dialog" aria-modal="true" aria-labelledby="backlogTitle" hidden>
        <div class="backlog-card">
          <div class="backlog-head"><h2 id="backlogTitle">${icon('scroll', { size: 18 })}回看</h2><button class="icon-btn" type="button" data-act="close-log" aria-label="关闭回看">${icon('close', { size: 18 })}</button></div>
          <ol class="backlog-list" tabindex="0"></ol>
        </div>
      </div>

      <div class="end-screen" id="endScreen" hidden></div>
      <div class="fatal" id="fatal" hidden></div>
    </main>`;

  Object.assign(P, {
    play: $('#play'), scene: $('#scene'), bgLayers: $$('.bg'), veil: $('#veil'), flash: $('#flash'),
    art: { left: $('.art-left'), right: $('.art-right') },
    shotCap: $('#shotCap'), hud: $('#hud'), banner: $('#banner'), dock: $('#dock'), dlg: $('#dlg'),
    name: $('.dlg-name'), note: $('.dlg-note'), shown: $('.dlg-shown'), rest: $('.dlg-rest'),
    ask: $('#ask'), askKind: $('.ask-kind'), askPrompt: $('#askPrompt'), askInput: $('#askInput'),
    askSkip: $('[data-ask="skip"]'), askSilent: $('[data-ask="silent"]'), askEcho: $('.ask-echo'),
    askContext: $('.ask-context'),
    titleCard: $('#titleCard'), live: $('#live'), backlog: $('#backlog'), backlogList: $('.backlog-list'),
    endScreen: $('#endScreen'), fatal: $('#fatal'),
    autoBtn: $('[data-act="auto"]'), skipBtn: $('[data-act="skip"]'),
  });
  S.bg = null;
  S.bgFront = 0;
  S.hudBattle = null;

  P.play.addEventListener('click', onStageClick);
  P.dlg.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); advance(); } });
  $('[data-act="home"]').addEventListener('click', () => { flushRead(); renderStart(); });
  P.autoBtn.addEventListener('click', () => setAuto(!S.auto));
  P.skipBtn.addEventListener('click', () => setSkip(!S.skip));
  // 鼠标点过的开关不留焦点，空格/回车继续用于推进剧情
  $$('.bar-btn[aria-pressed]').forEach((b) => b.addEventListener('click', (e) => { if (e.detail > 0) focusStage(); }));
  $('[data-act="log"]').addEventListener('click', () => toggleBacklog(true));
  $('[data-act="close-log"]').addEventListener('click', (e) => toggleBacklog(false, e.detail > 0));
  P.backlog.addEventListener('click', (e) => { if (e.target === P.backlog) toggleBacklog(false, true); });
  $('.hud-toggle').addEventListener('click', () => setHudCollapsed(!P.hud.classList.contains('collapsed')));
  bindAsk();
  bindSettings(P.play);
}

// 把焦点交还给「当前该操作的东西」：输入框打开时是输入框（触屏不主动弹键盘，交给表单本身），否则是对话框
function focusStage() {
  if (!P.play) return;
  if (S.ask && !P.ask.hidden) {
    if (finePointer && !P.askInput.disabled) P.askInput.focus({ preventScroll: true });
    else P.ask.focus({ preventScroll: true });
  } else if (!P.dlg.hidden) P.dlg.focus({ preventScroll: true });
}

// 叠层打开时让底下的播放界面不可聚焦（Tab 不会跑到遮罩后面）
function setBackdropInert(overlay, on) {
  if (!P.play) return;
  for (const el of P.play.children) if (el !== overlay && el !== P.live) el.inert = on;
}

function onStageClick(e) {
  if (e.target.closest('button, a, input, textarea, label, select, .hud, .ask, .backlog, .pop, .end-screen, .fatal, .modal, .play-bar')) return;
  if (performance.now() < S.suppressClickUntil) return; // 这一下点击是用来关掉设置浮层的
  advance();
}

function enterPlay(chapter, run, { fresh, backlog = [], stage = null }) {
  cancelPlay();
  S.chapter = chapter;
  S.run = run;
  S.startRun = fresh ? clone(run) : null;
  S.backlog = backlog.slice(-500);
  S.auto = false;
  S.skip = false;
  renderPlay();
  setBackground(run.bg || 'black', 'cut');
  if (!fresh) restoreStage(stage);
  P.dlg.focus({ preventScroll: true });
  const my = ++S.token;
  runLoop(my);
}

// 读档：恢复「吞色」「黑幕」这类跨节拍的画面状态，并重新亮出当前分镜标题
function restoreStage(stage) {
  if (stage?.desat) {
    P.scene.style.setProperty('--fx-ms', '0ms');
    P.scene.classList.add('desat');
  }
  if (stage?.veil) setVeil(true, 0);
  const shot = S.chapter.shots[S.run.shotIdx];
  // 地点用当前背景（分镜里可能已经换过场景），不是分镜开头的那个
  if (shot && S.run.stack.length && !S.run.done) showShotCaption({ ...shot, bg: S.run.bg || shot.bg });
}
function stageState() {
  return { desat: Boolean(P.scene?.classList.contains('desat')), veil: Boolean(P.veil?.classList.contains('on')) };
}

function cancelPlay() {
  S.token += 1;
  S.typing?.finish();
  S.titleAnim?.finish();
  const g = S.gate;
  S.gate = null;
  clearTimeout(S.gateTimer);
  g?.resolve();
  const a = S.ask;
  S.ask = null;
  a?.resolve(CANCEL);
}

async function runLoop(my) {
  while (my === S.token) {
    let item;
    let before;
    try {
      before = JSON.stringify(S.run);
      item = next(S.run, S.chapter);
    } catch (err) {
      showFatal(err);
      return;
    }
    // 自动存档记录「这一项之前」的存档：刷新后「继续」会重新演出当前这句 / 这个演出，而不是退回分镜开头
    if (['shot', 'beat', 'battle-start', 'battle-end'].includes(item.kind)) checkpoint(before, item.kind === 'shot');
    if (S.run.battle) renderHud(battleViewOf(S.run.battle), { pending: item.kind === 'input' });
    try {
      switch (item.kind) {
        case 'shot': await onShot(item.shot); break;
        case 'beat': await onBeat(item.beat, my); break;
        case 'input': await onInput(item, my); break;
        case 'battle-start': await onBattleStart(item.battle); break;
        case 'battle-end': await onBattleEnd(item.battle, my); break;
        case 'end': if (my === S.token) await onEnd(item.end); return;
        default: break;
      }
    } catch (err) {
      if (my === S.token) showFatal(err);
      return;
    }
  }
}

function autosave() {
  if (!S.run || !S.chapter) return;
  checkpoint(JSON.stringify(S.run), true);
}
function checkpoint(runJson, flush = false) {
  if (!S.chapter) return;
  try {
    localStorage.setItem(KEYS.auto, `{"run":${runJson},"chapterId":${JSON.stringify(S.chapter.id)},"savedAt":${Date.now()},"stage":${JSON.stringify(stageState())}}`);
  } catch { /* 隐私模式 / 配额已满：本次不存 */ }
  store(KEYS.backlog, { chapterId: S.chapter.id, lines: S.backlog.slice(-200) });
  if (flush) flushRead();
}

// ─── 推进控制 ───
function waitAdvance({ autoDelay = 1800, seen = false } = {}) {
  return new Promise((resolve) => {
    S.gate = { resolve, autoDelay, seen };
    P.dlg?.classList.add('waiting');
    scheduleGateTimers();
  });
}
function scheduleGateTimers() {
  clearTimeout(S.gateTimer);
  const g = S.gate;
  if (!g) return;
  if (S.skip && g.seen) S.gateTimer = setTimeout(openGate, 70);
  else if (S.auto) S.gateTimer = setTimeout(openGate, g.autoDelay * (PACES[S.settings.pace]?.k || 1));
}
function openGate() {
  const g = S.gate;
  if (!g) return;
  S.gate = null;
  clearTimeout(S.gateTimer);
  P.dlg?.classList.remove('waiting');
  g.resolve();
}
function advance() {
  if (S.view !== 'play' || S.ask) return;
  if (S.typing) { S.typing.finish(); return; }
  if (S.titleAnim) { S.titleAnim.finish(); return; }
  openGate();
}
function setAuto(on) {
  S.auto = Boolean(on);
  if (S.auto && S.skip) setSkip(false, true);
  P.autoBtn?.setAttribute('aria-pressed', String(S.auto));
  P.play?.classList.toggle('is-auto', S.auto);
  scheduleGateTimers();
}
function setSkip(on, quiet = false) {
  // 停在输入框或未读内容上时不进入快进（否则按钮亮着却什么都不跳）
  if (on && !quiet) {
    const blocked = S.ask ? '轮到你回应时无法快进' : ((S.gate && !S.gate.seen) || ((S.typing || S.titleAnim) && !S.lineSeen)) ? '快进只跳过已读内容' : '';
    if (blocked) { toast(blocked, 'warn'); on = false; }
  }
  S.skip = Boolean(on);
  if (S.skip && S.auto) setAuto(false);
  P.skipBtn?.setAttribute('aria-pressed', String(S.skip));
  P.play?.classList.toggle('is-skip', S.skip);
  if (S.skip && S.lineSeen) { S.typing?.finish(); S.titleAnim?.finish(); }
  scheduleGateTimers();
}
function autoDelayFor(text) {
  const n = Array.from(String(text || '')).length;
  return Math.min(9000, 1300 + n * 75);
}

// ─── 节拍处理 ───
async function onShot(shot) {
  hideBanner();
  clearArt();
  P.dock.classList.add('idle');
  liftVeilIfNeeded();
  showShotCaption(shot);
  if (shot.bg !== S.bg) await setBackground(shot.bg, 'fade');
}

function liftVeilIfNeeded() {
  if (!P.veil.classList.contains('on')) return;
  const beats = S.chapter.shots[S.run.shotIdx]?.beats || [];
  const handles = beats.slice(0, 4).some((b) => b?.t === 'fx' && ['fade-in', 'fade-black', 'blackout'].includes(b.fx));
  if (!handles) setVeil(false, 800);
}

function showShotCaption(shot) {
  const loc = S.locations[shot.bg];
  // 读档时传进来的是章节里的原始分镜（标题可能带 {PLAYER_NAME}），这里统一替换
  const title = interpolate(shot.title || '', S.run);
  P.shotCap.innerHTML = `<span class="shot-id">${esc(shot.id)}</span><span class="shot-title">${esc(title)}</span>${loc ? `<span class="shot-loc">${icon('compass', { size: 12 })}${esc(loc.name)}</span>` : ''}`;
  P.shotCap.classList.remove('show');
  void P.shotCap.offsetWidth;
  if (title || loc) P.shotCap.classList.add('show');
}

async function onBeat(beat, my) {
  switch (beat.t) {
    case 'narr': case 'say': case 'think': return showLine(beat, my);
    case 'bg': {
      const cut = beat.fx === 'cut';
      // 分镜内换场景：上一处的人不跟着过来，谁在新场景开口谁再登场
      clearArt();
      // 淡入的换场是「走到了另一个地方」：重新亮出分镜小字，地点跟着换（cut 多是一闪而过的画面，不打扰）
      if (!S.locations[beat.bg]) P.shotCap.classList.remove('show');
      else if (!cut) showShotCaption({ ...S.chapter.shots[S.run.shotIdx], bg: beat.bg });
      if (!cut) { hideBanner(); P.dock.classList.add('idle'); } // 上一处的台词不留在新场景上，和换分镜时一样先收起对话框
      await setBackground(beat.bg, cut ? 'cut' : 'fade');
      if (!cut) await sleep(S.skip ? 120 : 650);
      return undefined;
    }
    case 'fx': return runFx(beat.fx, beat.ms);
    case 'title': return showTitleCard(beat, my);
    default: return undefined;
  }
}

function describeLine(beat) {
  if (beat.t === 'say') {
    const sp = speakerOf(beat.who);
    return { kind: 'say', who: beat.who, name: interpolate(sp?.name ?? beat.who, S.run), color: sp?.color || '#d8cff0', note: beat.note || '', text: beat.text || '' };
  }
  if (beat.t === 'think') return { kind: 'think', who: 'aku', name: S.run.playerName, color: speakerOf('aku')?.color || '#e9c46a', note: '心声', text: beat.text || '' };
  const kind = beat.style === 'voice' || beat.style === 'caption' ? beat.style : 'picture';
  return { kind, name: '', text: beat.text || '' };
}

function readKey(beat) {
  return `${S.chapter.id}:${S.run.shotIdx}:${hash(`${beat.t}|${beat.who || ''}|${beat.text || beat.title || ''}`)}`;
}
function markRead(key) {
  if (S.read.has(key)) return true;
  S.read.add(key);
  S.readDirty = true;
  return false;
}

function pushLog(line) {
  S.backlog.push(line);
  if (S.backlog.length > 500) S.backlog.splice(0, S.backlog.length - 500);
  if (P.backlog && !P.backlog.hidden) renderBacklog();
}
function announce(text) {
  if (!P.live) return;
  P.live.textContent = '';
  requestAnimationFrame(() => { if (P.live) P.live.textContent = text; });
}

async function showLine(beat, my) {
  const line = describeLine(beat);
  const seen = markRead(readKey(beat));
  S.lineSeen = seen;
  if (S.skip && !seen) { setSkip(false, true); toast('遇到未读内容，快进已停止'); }
  pushLog(line);
  announce(line.name ? `${line.name}${line.note && line.kind === 'say' ? `（${line.note}）` : ''}：${line.text}` : line.text);

  if (line.kind === 'caption') {
    P.dock.classList.add('idle');
    setArtActive(null); // 系统字幕没有说话人：立绘退回暗态（手机上整个让开），字幕压在干净的画面上
    showBanner(line.text, 'caption');
    await waitAdvance({ autoDelay: 1700, seen });
    if (my === S.token) hideBanner();
    return;
  }
  hideBanner();
  updateArt(beat);
  const wasIdle = P.dock.classList.contains('idle');
  P.dock.classList.remove('idle');
  P.dlg.hidden = false;
  if (!P.hud.hidden) requestAnimationFrame(fitHud);
  P.dlg.dataset.kind = line.kind;
  P.dlg.style.setProperty('--who', line.color || 'var(--accent)');
  P.name.textContent = line.kind === 'say' || line.kind === 'think' ? line.name : '';
  P.note.textContent = line.note || '';
  P.dlg.classList.toggle('has-plate', line.kind === 'say' || line.kind === 'think');
  P.dlg.classList.toggle('has-note', Boolean(line.note));
  P.dlg.classList.remove('waiting', 'enter');
  if (wasIdle) { void P.dlg.offsetWidth; P.dlg.classList.add('enter'); }

  P.shown.parentElement.scrollTop = 0;
  await typeText(line.text, (S.skip && seen) || SPEEDS[S.settings.speed]?.cps === 0);
  if (my !== S.token) return;
  await waitAdvance({ autoDelay: autoDelayFor(line.text) + (line.kind === 'voice' ? 600 : 0), seen });
}

// 超长文本在对话框内滚动时，让正在打字的那一行保持可见
function followCaret() {
  const box = P.shown.parentElement;
  if (box.scrollHeight <= box.clientHeight + 1) return;
  const rects = P.shown.getClientRects();
  const last = rects[rects.length - 1];
  if (!last) return;
  const over = last.bottom - box.getBoundingClientRect().bottom;
  if (over > 0) box.scrollTop += over + 4;
}

function typeText(text, instant) {
  const chars = Array.from(String(text));
  const cps = SPEEDS[S.settings.speed]?.cps || 38;
  if (instant || chars.length === 0) {
    P.shown.textContent = text;
    P.rest.textContent = '';
    P.dlg.classList.add('done');
    return Promise.resolve();
  }
  P.dlg.classList.remove('done');
  // 标点处稍作停顿
  const times = [];
  let t = 0;
  for (const ch of chars) {
    times.push(t);
    t += 1 + ('，、；：'.includes(ch) ? 3 : '。！？…—'.includes(ch) ? 6 : 0);
  }
  return new Promise((resolve) => {
    const start = performance.now();
    let n = -1;
    let raf = 0;
    const finish = () => {
      cancelAnimationFrame(raf);
      if (S.typing?.finish === finish) S.typing = null;
      P.shown.textContent = text;
      P.rest.textContent = '';
      P.dlg.classList.add('done');
      resolve();
    };
    const tick = (now) => {
      const units = ((now - start) / 1000) * cps;
      let k = n < 0 ? 0 : n;
      while (k < chars.length && times[k] <= units) k += 1;
      if (k !== n) {
        n = k;
        P.shown.textContent = chars.slice(0, n).join('');
        P.rest.textContent = chars.slice(n).join('');
        followCaret();
      }
      if (n >= chars.length) { finish(); return; }
      raf = requestAnimationFrame(tick);
    };
    S.typing = { finish };
    raf = requestAnimationFrame(tick);
  });
}

// ─── 立绘 ───
const imgCache = new Map();
function preload(url) {
  if (!url) return Promise.resolve(false);
  if (!imgCache.has(url)) {
    imgCache.set(url, new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img.naturalWidth > 0);
      img.onerror = () => resolve(false);
      img.src = url;
    }));
  }
  return imgCache.get(url);
}

// 画外音、回忆里的声音不在场：只显示名牌，不上立绘
const OFFSTAGE_NOTE = /回忆|记忆|画外|远处|梦中|脑海|幻听/;
function updateArt(beat) {
  if (beat.t !== 'say' || OFFSTAGE_NOTE.test(beat.note || '')) { setArtActive(null); return; }
  const sp = speakerOf(beat.who);
  const side = beat.who === 'aku' ? 'left' : 'right';
  if (sp?.art) setSlot(side, paint(sp.art), beat.who);
  setArtActive(sp?.art ? side : null);
}
function setSlot(side, url, who = '') {
  const slot = P.art[side];
  slot.dataset.who = who;
  if (slot.dataset.url === url) return;
  slot.dataset.url = url;
  const wasOn = slot.classList.contains('on');
  slot.classList.remove('on');
  const my = S.token;
  preload(url).then((ok) => {
    if (my !== S.token || slot.dataset.url !== url) return;
    if (!ok) { slot.dataset.url = ''; return; }
    const img = slot.querySelector('img');
    setTimeout(() => {
      if (slot.dataset.url !== url) return;
      img.src = url;
      slot.classList.add('on');
    }, wasOn ? 180 : 0);
  });
}
function setArtActive(side) {
  for (const s of ['left', 'right']) P.art[s].classList.toggle('active', s === side);
  P.scene.classList.toggle('art-focus', Boolean(side));
}
function clearArt(keep = null) {
  for (const s of ['left', 'right']) {
    const slot = P.art[s];
    if (keep && slot.dataset.who && keep.has(slot.dataset.who)) { slot.classList.remove('active'); continue; }
    slot.classList.remove('on', 'active');
    slot.dataset.url = '';
    slot.dataset.who = '';
  }
  P.scene.classList.remove('art-focus');
}
// 输入框打开时舞台交给玩家：只留下本节点 focus 里的角色（在场、等你回应的人），以「倾听」的暗态陪着；
// 其余立绘（回忆里的人、已经不在场的人、主角自己）退场，背景保持不变。
function artForInput(node) {
  clearArt(new Set(node.focus || []));
}

// ─── 背景 ───
function gradientOf(loc) {
  return `linear-gradient(180deg, ${loc.top || '#2a2440'} 0%, ${loc.bottom || '#06050c'} 100%)`;
}
async function setBackground(id, mode = 'fade') {
  S.bg = id;
  const loc = id && id !== 'black' ? S.locations[id] : null;
  let image = '';
  if (loc?.svg) {
    const url = paint(loc.svg);
    const ok = await Promise.race([preload(url), sleep(1600).then(() => false)]);
    if (ok) image = `url("${String(url).replace(/["\\]/g, '')}")`;
  }
  if (S.bg !== id || !P.bgLayers) return;
  const nextIdx = S.bgFront ^ 1;
  const incoming = P.bgLayers[nextIdx];
  const outgoing = P.bgLayers[S.bgFront];
  incoming.style.backgroundColor = loc ? (loc.bottom || '#06050c') : '#000';
  incoming.style.backgroundImage = loc ? (image ? `${image}, ${gradientOf(loc)}` : gradientOf(loc)) : 'none';
  incoming.classList.toggle('fallback', Boolean(loc) && !image);
  P.scene.dataset.bg = id || 'black';
  P.scene.setAttribute('aria-label', loc ? `场景：${loc.name}` : '黑画面');
  if (mode === 'cut' || reducedMotion) {
    P.bgLayers.forEach((l) => l.classList.add('cut'));
    incoming.classList.add('show');
    outgoing.classList.remove('show');
    void incoming.offsetWidth;
    P.bgLayers.forEach((l) => l.classList.remove('cut'));
  } else {
    incoming.classList.add('show');
    outgoing.classList.remove('show');
  }
  S.bgFront = nextIdx;
}

// ─── 特效 ───
function setVeil(on, ms) {
  P.veil.style.transitionDuration = `${Math.max(0, ms)}ms`;
  P.veil.classList.toggle('on', on);
}
async function runFx(fx, ms) {
  const k = S.skip ? 0.25 : 1;
  const d = (fallback) => Math.round((Number(ms) > 0 ? Number(ms) : fallback) * k);
  switch (fx) {
    case 'shake': {
      const dur = d(560);
      if (reducedMotion) return;
      P.play.style.setProperty('--fx-ms', `${dur}ms`);
      P.play.classList.remove('shake');
      void P.play.offsetWidth;
      P.play.classList.add('shake');
      await sleep(dur * 0.6);
      setTimeout(() => P.play?.classList.remove('shake'), dur * 0.5);
      return;
    }
    case 'flash': {
      const dur = d(480);
      P.flash.style.setProperty('--fx-ms', `${dur}ms`);
      P.flash.classList.remove('go');
      void P.flash.offsetWidth;
      P.flash.classList.add('go');
      await sleep(dur * 0.55);
      return;
    }
    case 'fade-black': { const dur = d(900); setVeil(true, dur); await sleep(dur); return; }
    case 'fade-in': { const dur = d(900); setVeil(false, dur); await sleep(dur * 0.8); return; }
    case 'blackout': { setVeil(true, 0); await sleep(d(300)); return; }
    case 'desaturate': {
      const dur = d(1400);
      P.scene.style.setProperty('--fx-ms', `${dur}ms`);
      P.scene.classList.add('desat');
      await sleep(Math.min(dur, 700));
      return;
    }
    case 'restore': {
      const dur = d(1000);
      P.scene.style.setProperty('--fx-ms', `${dur}ms`);
      P.scene.classList.remove('desat');
      await sleep(Math.min(dur, 500));
      return;
    }
    default:
  }
}

// ─── 片名 ───
async function showTitleCard(beat, my) {
  const tc = P.titleCard;
  const lines = (beat.lines || []).filter(Boolean);
  tc.innerHTML = `<div class="tc-inner">
      ${lines.map((l) => `<p class="tc-line">${esc(l)}</p>`).join('')}
      <div class="tc-rule"></div>
      <h1 class="tc-title">${esc(beat.title || '')}</h1>
      ${beat.subtitle ? `<p class="tc-sub">${esc(beat.subtitle)}</p>` : ''}
    </div><span class="tc-hint">点击继续</span>`;
  const step = 650;
  $$('.tc-line', tc).forEach((el, i) => el.style.setProperty('--d', `${i * step}ms`));
  const base = lines.length * step;
  tc.style.setProperty('--base', `${base}ms`);
  tc.hidden = false;
  tc.classList.remove('instant', 'out', 'play');
  void tc.offsetWidth;
  tc.classList.add('play');
  P.dock.classList.add('idle');
  hideBanner();
  pushLog({ kind: 'caption', name: '', text: [...lines, beat.title, beat.subtitle].filter(Boolean).join(' · ') });
  announce([...lines, beat.title, beat.subtitle].filter(Boolean).join('，'));
  const seen = markRead(readKey(beat));
  S.lineSeen = seen;
  if (S.skip && !seen) setSkip(false, true);

  await new Promise((resolve) => {
    const timer = setTimeout(() => finish(), base + 2300);
    const finish = () => { clearTimeout(timer); tc.classList.add('instant'); if (S.titleAnim?.finish === finish) S.titleAnim = null; resolve(); };
    S.titleAnim = { finish };
    if (reducedMotion || (S.skip && seen)) finish();
  });
  if (my !== S.token) return;
  await waitAdvance({ autoDelay: 2400, seen });
  if (my !== S.token) return;
  tc.classList.add('out');
  await sleep(S.skip ? 120 : 520);
  if (my === S.token) { tc.hidden = true; tc.classList.remove('out', 'play', 'instant'); }
}

// ─── 横幅（系统字幕 / 战斗结果） ───
function showBanner(text, kind = 'caption') {
  P.banner.dataset.kind = kind;
  $('.banner-text', P.banner).textContent = text;
  P.banner.hidden = false;
  P.banner.classList.remove('show');
  void P.banner.offsetWidth;
  P.banner.classList.add('show');
}
function hideBanner() {
  if (P.banner) { P.banner.hidden = true; P.banner.classList.remove('show'); }
}

// ─── 自由输入 ───
function bindAsk() {
  P.ask.addEventListener('submit', (e) => { e.preventDefault(); submitAsk(P.askInput.value, { via: 'button' }); });
  P.askInput.addEventListener('keydown', (e) => {
    // 输入框刚弹出时，连按推进用的空格不要打进框里
    if (e.key === ' ' && !e.isComposing && !P.askInput.value && S.ask && performance.now() - S.ask.since < 450) e.preventDefault();
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) {
      e.preventDefault();
      submitAsk(P.askInput.value, { via: 'key' });
    }
    e.stopPropagation();
  });
  P.askInput.addEventListener('input', () => {
    if (S.ask && S.chapter) store(KEYS.draft, { chapterId: S.chapter.id, nodeId: S.ask.nodeId, text: P.askInput.value.slice(0, 300) });
  });
  P.askSilent.addEventListener('click', () => submitAsk('', { via: 'silent' }));
  P.askSkip.addEventListener('click', () => { const a = S.ask; if (a && !P.ask.classList.contains('thinking')) { S.ask = null; a.resolve(SKIP); } });
}
// 回车提交只接受非空内容，且忽略输入框刚出现时连按推进键带来的回车——沉默必须是玩家主动点「保持沉默」
function submitAsk(text, { via = 'button' } = {}) {
  const a = S.ask;
  if (!a || P.ask.classList.contains('thinking')) return;
  const value = String(text || '').trim();
  const age = performance.now() - a.since;
  if (via === 'key' && age < 450) return;
  if (via === 'silent') { if (age < 250) return; }
  else if (!value) { nudgeAsk(); return; }
  S.ask = null;
  a.resolve(value);
}
function clearDraft() {
  try { localStorage.removeItem(KEYS.draft); } catch { /* 隐私模式 */ }
}
function nudgeAsk() {
  P.ask.classList.remove('nudge');
  void P.ask.offsetWidth;
  P.ask.classList.add('nudge');
  const hint = $('.ask-hint', P.ask);
  if (hint) hint.textContent = '写点什么再提交；想沉默请点「保持沉默」';
}

function askPlayer(node) {
  hideBanner();
  artForInput(node);
  P.dock.classList.remove('idle');
  P.dlg.hidden = true;
  P.ask.hidden = false;
  P.ask.classList.remove('thinking', 'nudge');
  P.ask.dataset.kind = node.kind;
  P.askKind.innerHTML = `${icon(KIND_ICON[node.kind] || 'feather', { size: 14 })}${esc(KIND_LABEL[node.kind] || '自由')}`;
  P.askPrompt.textContent = node.prompt;
  const draft = load(KEYS.draft, null);
  P.askInput.value = draft?.chapterId === S.chapter.id && draft.nodeId === node.id && typeof draft.text === 'string' ? draft.text : '';
  P.askInput.placeholder = node.placeholder || '说点什么，或写下你的动作……';
  P.askInput.disabled = false;
  P.ask.querySelectorAll('button').forEach((b) => { b.disabled = false; });
  P.askSkip.hidden = !node.optional;
  const last = [...S.backlog].reverse().find((l) => ['say', 'think', 'picture', 'voice'].includes(l.kind));
  P.askContext.hidden = !last;
  if (last) {
    $('.ask-context-name', P.askContext).textContent = last.name || '';
    $('.ask-context-name', P.askContext).style.setProperty('--who', last.color || 'var(--muted)');
    $('.ask-context-text', P.askContext).textContent = last.text;
  }
  P.ask.classList.remove('enter');
  void P.ask.offsetWidth;
  P.ask.classList.add('enter');
  announce(`轮到你了：${node.prompt}`);
  if (finePointer) P.askInput.focus({ preventScroll: true });
  else if (P.dlg === document.activeElement) P.ask.focus?.({ preventScroll: true }); // 对话框被隐藏，焦点别丢到 body
  const hint = $('.ask-hint', P.ask);
  if (hint) hint.textContent = 'Enter 提交 · Shift+Enter 换行';
  requestAnimationFrame(fitHud);
  return new Promise((resolve) => { S.ask = { resolve, since: performance.now(), nodeId: node.id }; });
}

function setThinking(text) {
  // 禁用输入框会把焦点丢到 body：先把焦点挪到表单本身，判定结束后 hideAsk 再交还给对话框
  if (P.ask.contains(document.activeElement)) P.ask.focus({ preventScroll: true });
  P.ask.classList.add('thinking');
  P.askInput.disabled = true;
  P.ask.querySelectorAll('button').forEach((b) => { b.disabled = true; });
  P.askEcho.textContent = text ? `「${text}」` : '（沉默）';
}
function hideAsk() {
  if (!P.ask) return;
  const hadFocus = P.ask.contains(document.activeElement);
  P.ask.hidden = true;
  P.ask.classList.remove('thinking');
  P.dlg.hidden = false;
  P.dock.classList.add('idle');
  if (hadFocus) P.dlg.focus({ preventScroll: true });
}

async function judgeInput(nodeId, text, def) {
  const t0 = performance.now();
  let judgement = null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch('/api/story/judge', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ chapterId: S.chapter.id, nodeId, text, context: publicSummary(S.run) }),
      signal: ctrl.signal,
    });
    if (res.ok) {
      const data = await res.json();
      const j = data?.judgement ?? data;
      if (j && typeof j.intent === 'string') judgement = j;
    }
  } catch { /* 离线或服务未就绪：本地判定 */ }
  clearTimeout(timer);
  if (!judgement) judgement = def ? { ...demoJudge(def, text), source: 'demo' } : { intent: null, source: 'demo' };
  const wait = 700 - (performance.now() - t0);
  if (wait > 0) await sleep(wait);
  return judgement;
}

async function onInput(item, my) {
  if (S.skip) setSkip(false, true);
  autosave();
  const node = item.node;
  const def = findNode(S.chapter, node.id);
  const answer = await askPlayer(node);
  if (my !== S.token || answer === CANCEL) return;
  let judgement;
  let said = '';
  if (answer === SKIP) {
    judgement = def ? demoJudge(def, '') : { intent: null };
  } else {
    said = answer;
    setThinking(said);
    judgement = await judgeInput(node.id, said, def);
    if (my !== S.token) return;
  }
  const aku = speakerOf('aku');
  pushLog({ kind: 'input', name: S.run.playerName, color: aku?.color, text: said || (answer === SKIP ? '（跳过）' : '（保持沉默）') });
  const memBefore = JSON.stringify(S.run.memories);
  const flagsBefore = JSON.stringify(S.run.flags);
  const result = resolveInput(S.run, S.chapter, judgement, said);
  clearDraft(); // 判定落地后才清草稿：判定途中返回标题 / 刷新，回来时输入框里还是刚才那句话
  hideAsk();
  if (result.battle) renderHud(result.battle, { animate: true });
  if (JSON.stringify(S.run.memories) !== memBefore) toast('记住了', 'memory');
  else if (JSON.stringify(S.run.flags) !== flagsBefore) toast('这件事会被记住', 'memory');
  autosave();
}

// ─── 战斗 ───
function battleViewOf(b) {
  return { id: b.id, title: b.title, objective: b.objective, bonus: b.bonus, intel: b.intel, player: { ...b.player }, enemies: b.enemies.map((e) => ({ ...e })), collateral: b.collateral, round: b.round };
}
function battleDef(id) {
  let found = null;
  eachBeat(S.chapter, (beat) => { if (!found && beat?.t === 'battle' && beat.id === id) found = beat; });
  return found;
}

function hpRow(key, name, hp, maxHp, side) {
  const row = document.createElement('div');
  row.className = `hp ${side}`;
  row.dataset.key = key;
  row.innerHTML = `<span class="hp-name"></span><span class="hp-track"><i class="hp-ghost"></i><i class="hp-fill"></i></span><span class="hp-num"></span>`;
  $('.hp-name', row).textContent = name;
  row.dataset.hp = String(hp);
  updateHpRow(row, hp, maxHp, false);
  return row;
}
function updateHpRow(row, hp, maxHp, animate) {
  const prev = Number(row.dataset.hp);
  const ratio = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
  row.style.setProperty('--hp', ratio.toFixed(3));
  $('.hp-num', row).textContent = hp <= 0 && row.classList.contains('enemy') ? '倒下' : `${hp}/${maxHp}`;
  row.classList.toggle('down', hp <= 0);
  row.classList.toggle('low', hp > 0 && ratio <= 0.5);
  row.dataset.hp = String(hp);
  if (animate && hp !== prev) {
    const delta = hp - prev;
    row.classList.remove('hit', 'heal');
    void row.offsetWidth;
    row.classList.add(delta < 0 ? 'hit' : 'heal');
    const pop = document.createElement('span');
    pop.className = `hp-pop ${delta < 0 ? 'minus' : 'plus'}`;
    pop.textContent = `${delta > 0 ? '+' : ''}${delta}`;
    row.appendChild(pop);
    setTimeout(() => pop.remove(), 1200);
  }
}

// pending：正在等玩家写下一回合（显示「即将进行的回合」）；否则显示刚结算、正在演出反应的那一回合
function renderHud(view, { animate = false, pending = false } = {}) {
  if (!view || !P.hud) return;
  const hud = P.hud;
  const def = battleDef(view.id);
  const total = def?.rounds?.length || 0;
  if (S.hudBattle !== view.id) {
    S.hudBattle = view.id;
    $('.hud-title', hud).textContent = view.title || '战斗';
    $('.hud-objective', hud).textContent = view.objective || '—';
    $('.hud-bonus', hud).textContent = view.bonus || '—';
    $('.hud-bonus', hud).parentElement.hidden = !view.bonus;
    $('.hud-intel', hud).innerHTML = (view.intel || []).map((t) => `<li>${icon('eye', { size: 13 })}<span>${esc(t)}</span></li>`).join('');
    const bars = $('.hud-bars', hud);
    bars.innerHTML = '';
    // 名字列按最长的名字定宽（「小个子的晶链」这类六字敌人名不再被截成省略号），所有血条仍然左右对齐
    const longest = Math.max(...[S.run.playerName, ...view.enemies.map((e) => e.name)].map((n) => Array.from(String(n || '')).length));
    bars.style.setProperty('--hp-name', `${Math.min(7.2, Math.max(4.2, longest + 0.5))}em`);
    bars.appendChild(hpRow('player', S.run.playerName, view.player.hp, view.player.maxHp, 'ally'));
    for (const e of view.enemies) bars.appendChild(hpRow(`e:${e.id}`, e.name, e.hp, e.maxHp, 'enemy'));
    $('.hud-result', hud).hidden = true;
    hud.classList.remove('ended', 'leave');
    hud.hidden = false;
    P.play.classList.add('has-hud');
    hud.classList.remove('enter');
    void hud.offsetWidth;
    hud.classList.add('enter');
    // 竖屏手机先收起情报（横屏 / 矮窗口改为右侧栏布局，见 story.css）
    setHudCollapsed(!finePointer && window.innerHeight < 700 && window.innerWidth <= 640);
  }
  const round = view.round || 0;
  const shownRound = Math.min(total || Infinity, Math.max(1, pending ? round + 1 : round));
  $('.hud-round', hud).textContent = total ? `回合 ${shownRound}/${total}` : `回合 ${shownRound}`;
  const bars = $('.hud-bars', hud);
  const pRow = bars.querySelector('[data-key="player"]');
  if (pRow) updateHpRow(pRow, view.player.hp, view.player.maxHp, animate);
  for (const e of view.enemies) {
    const row = bars.querySelector(`[data-key="e:${CSS.escape(e.id)}"]`);
    if (row) updateHpRow(row, e.hp, e.maxHp, animate);
  }
  let chip = $('.hud-collateral', hud);
  if (view.collateral > 0) {
    if (!chip) { chip = document.createElement('div'); chip.className = 'hud-collateral'; bars.after(chip); }
    chip.innerHTML = `${icon('flame', { size: 13 })}${RESULT_LABEL.collateral} ×${view.collateral}`;
  } else chip?.remove();
}

function setHudCollapsed(on) {
  if (!P.hud) return;
  P.hud.classList.toggle('collapsed', on);
  const t = $('.hud-toggle', P.hud);
  t?.setAttribute('aria-expanded', String(!on));
  t?.setAttribute('aria-label', on ? '展开情报' : '收起情报');
}
// 视口变矮（手机弹出软键盘、横屏）时，展开的情报面板会盖住输入框 / 对话框：自动收起
function fitHud() {
  if (!P.hud || P.hud.hidden || P.hud.classList.contains('collapsed') || S.view !== 'play') return;
  const target = !P.ask.hidden ? P.ask : !P.dock.classList.contains('idle') ? P.dlg : null;
  if (!target) return;
  const h = P.hud.getBoundingClientRect();
  const d = target.getBoundingClientRect();
  if (h.left < d.right && h.right > d.left && h.bottom > d.top - 6) setHudCollapsed(true);
}

async function onBattleStart(view) {
  S.hudBattle = null;
  renderHud(view);
  announce(`战斗开始：${view.title}。目标：${view.objective}`);
  pushLog({ kind: 'caption', name: '', text: `战斗开始 · ${view.title}` });
  await sleep(S.skip ? 120 : 650);
}

async function onBattleEnd(view, my) {
  if (!view) return;
  renderHud(view, { animate: true });
  const label = RESULT_LABEL[view.result] || view.result;
  const res = $('.hud-result', P.hud);
  res.dataset.result = view.result;
  res.innerHTML = `${icon(RESULT_ICON[view.result] || 'check', { size: 16 })}<span>战斗结束 · ${esc(label)}</span>`;
  res.hidden = false;
  P.hud.classList.add('ended');
  // 仗打完了情报就没用了：收起情报，只留血条与结果，免得展开的面板压住屏幕中间的结果横幅（手机上尤其明显）
  setHudCollapsed(true);
  P.hud.scrollTop = P.hud.scrollHeight; // 矮屏右侧栏可滚动时，让结果条露出来
  P.dock.classList.add('idle');
  showBanner(`战斗结束 · ${label}`, `result-${view.result}`);
  announce(`战斗结束：${label}`);
  pushLog({ kind: 'caption', name: '', text: `战斗结束 · ${label}` });
  await waitAdvance({ autoDelay: 2000, seen: true });
  if (my !== S.token) return;
  hideBanner();
  P.hud.classList.add('leave');
  await sleep(S.skip ? 80 : 380);
  if (my !== S.token) return;
  P.hud.hidden = true;
  P.play.classList.remove('has-hud');
  P.hud.classList.remove('leave', 'ended');
  setHudCollapsed(false);
  S.hudBattle = null;
}

// ─── 章末 ───
async function onEnd(end) {
  autosave();
  const ch = S.chapter;
  const run = S.run;
  setAuto(false);
  setSkip(false, true);
  hideBanner();
  hideAsk();
  P.dock.classList.add('idle');
  P.hud.hidden = true;
  P.play.classList.remove('has-hud');
  const saveKey = end?.save || `SAVE_${ch.id.toUpperCase()}_END`;
  store(KEYS.save(saveKey), { run, chapterId: ch.id, savedAt: Date.now() });
  const prog = progress();
  prog[ch.id] = { save: saveKey, at: Date.now() };
  store(KEYS.progress, prog);
  flushRead();

  const e = entryFor(ch.id, ch);
  const lines = (end?.summary || []).filter((s) => s?.text && evalCond(run, s.when)).map((s) => interpolate(s.text, run));
  const inputs = Object.keys(run.inputs || {}).filter((id) => findNode(ch, id)).length; // 只算本章（run.inputs 会跨章继承）
  const scr = P.endScreen;
  scr.innerHTML = `<div class="end-card" role="dialog" aria-modal="true" aria-labelledby="endTitle">
      <img class="end-crest" src="/assets/ui/eclipse-crest.svg" alt="" />
      <p class="eyebrow">CHAPTER COMPLETE · 章节完成</p>
      <h2 id="endTitle"><span>${esc(e.label)}</span>${esc(e.name)}</h2>
      <div class="end-rule"></div>
      <h3 class="end-sub">${icon('book', { size: 15 })}正史记录</h3>
      <ul class="end-summary">${(lines.length ? lines : ['你的每一次回应都已记录在案。']).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <p class="end-save">${icon('save', { size: 14 })}已存档 · ${esc(run.playerName)} · 本章 ${inputs} 次自由回应</p>
      <div class="end-actions">
        <button class="btn primary large" type="button" data-end="next" disabled>${icon('arrow-right', { size: 18 })}<span>下一章</span></button>
        <button class="btn secondary" type="button" data-end="replay">${icon('refresh', { size: 16 })}重玩本章</button>
        <button class="btn ghost" type="button" data-end="title">${icon('home', { size: 16 })}返回标题</button>
      </div>
    </div>`;
  scr.hidden = false;
  setBackdropInert(scr, true);
  scr.classList.remove('show');
  void scr.offsetWidth;
  scr.classList.add('show');
  announce(`章节完成：${ch.title}`);
  const nextBtn = $('[data-end="next"]', scr);
  const replayBtn = $('[data-end="replay"]', scr);
  // 连按空格 / 回车 / 点击推进最后几句时，多出来的那一下会落在刚弹出的按钮上：直接跳进下一章或重玩，章节完成页一闪而过。
  // 所以完成页先「上锁」（不可聚焦、不响应）：至少等入场动画走完，并且玩家停手（最近一次按键 / 点按之后静默一会儿），
  // 解锁后再把焦点交给最合适的按钮——一直按着空格或连点不放，也不会替玩家按下按钮。
  const armAt = performance.now() + (reducedMotion ? 350 : 900);
  const QUIET_MS = 450;
  let armed = false;
  const guarded = (fn) => (e) => { if (armed) fn(e); };
  scr.inert = true;
  const focusBest = () => {
    if (!armed || !scr.isConnected || scr.hidden) return;
    (nextBtn.disabled ? replayBtn : nextBtn).focus({ preventScroll: true });
  };
  const tryArm = () => {
    if (!scr.isConnected || scr.hidden || S.chapter !== ch) return;
    const now = performance.now();
    const wait = Math.max(armAt - now, S.lastInputAt + QUIET_MS - now);
    if (wait > 0) { setTimeout(tryArm, wait + 16); return; }
    armed = true;
    scr.inert = false;
    focusBest();
  };
  setTimeout(tryArm, Math.max(0, armAt - performance.now()));
  replayBtn.addEventListener('click', guarded(replayChapter));
  $('[data-end="title"]', scr).addEventListener('click', guarded(() => renderStart()));

  const nextId = end?.next || null;
  const wireNext = async () => {
    const nextChapter = nextId ? await loadChapter(nextId) : null;
    if (S.view !== 'play' || S.chapter !== ch || !nextBtn.isConnected) return;
    if (nextChapter) {
      const ne = entryFor(nextId, nextChapter);
      nextBtn.disabled = false;
      nextBtn.innerHTML = `${icon('arrow-right', { size: 18 })}<span>下一章</span><small>${esc(ne.label)}｜${esc(ne.name)}</small>`;
      nextBtn.onclick = guarded(() => {
        const run2 = continueRun(S.run, nextChapter);
        run2.mode = S.settings.mode;
        enterPlay(nextChapter, run2, { fresh: true });
      });
      focusBest();
    } else if (nextId && S.index.some((x) => x.id === nextId)) {
      // 目录里有下一章但没读到（离线 / 服务重启中）：别说「制作中」，给重试
      nextBtn.disabled = false;
      nextBtn.innerHTML = `${icon('refresh', { size: 18 })}<span>下一章读取失败，点此重试</span>`;
      nextBtn.onclick = guarded(() => {
        nextBtn.onclick = null;
        nextBtn.disabled = true;
        nextBtn.innerHTML = `${icon('clock', { size: 18 })}<span>正在读取下一章…</span>`;
        replayBtn.focus({ preventScroll: true }); // 按钮被禁用前把焦点挪开，别掉到 body
        wireNext();
      });
      focusBest();
    } else {
      nextBtn.disabled = true;
      nextBtn.innerHTML = `${icon('clock', { size: 18 })}<span>下一章制作中</span>`;
    }
  };
  await wireNext();
}

function replayChapter() {
  if (S.startRun) {
    const run = clone(S.startRun);
    run.mode = S.settings.mode;
    enterPlay(S.chapter, run, { fresh: true });
    return;
  }
  const ch = S.chapter;
  const e = entryFor(ch.id, ch);
  const prev = e.requires ? endSaveOf(e.requires) : null;
  const run = prev ? continueRun(prev.run, ch) : createRun({ playerName: S.run.playerName, chapter: ch, mode: S.settings.mode });
  run.playerName = S.run.playerName;
  run.mode = S.settings.mode;
  enterPlay(ch, run, { fresh: true });
}

// ─── 回看 ───
function renderBacklog() {
  const list = P.backlogList;
  list.innerHTML = S.backlog.length ? S.backlog.map((l) => {
    const name = l.kind === 'say' || l.kind === 'think' || l.kind === 'input'
      ? `<span class="bl-name">${esc(l.kind === 'input' ? `${l.name}（你）` : l.name)}${l.note ? `<small>（${esc(l.note)}）</small>` : ''}</span>` : '';
    return `<li class="bl bl-${esc(l.kind)}"${l.color ? ` data-color="${esc(l.color)}"` : ''}>${name}<p>${esc(l.text)}</p></li>`;
  }).join('') : '<li class="bl-empty">还没有任何内容。</li>';
  list.querySelectorAll('[data-color]').forEach((li) => li.style.setProperty('--who', li.dataset.color));
}
// byPointer：用鼠标 / 触摸关闭时把焦点交还对话框（空格继续推进），键盘关闭时回到「回看」按钮
function toggleBacklog(open, byPointer = false) {
  if (!P.backlog) return;
  if (open) {
    if (!P.backlog.hidden) return;
    const opener = document.activeElement;
    closeOverlays();
    P.backlogOpener = opener && opener !== document.body && P.play.contains(opener) ? opener : null;
    renderBacklog();
    P.backlog.hidden = false;
    setBackdropInert(P.backlog, true);
    P.backlogList.scrollTop = P.backlogList.scrollHeight;
    $('[data-act="close-log"]', P.backlog).focus();
  } else {
    if (P.backlog.hidden) return;
    P.backlog.hidden = true;
    setBackdropInert(P.backlog, false);
    // 键盘关闭：回到打开它的地方（按 L 打开就回对话框，点「回看」按钮打开就回按钮）
    const opener = P.backlogOpener;
    P.backlogOpener = null;
    if (byPointer || S.ask) focusStage();
    else if (opener?.isConnected && !opener.closest('[hidden]') && opener.offsetParent !== null) opener.focus({ preventScroll: true });
    else focusStage();
  }
}

// ─── 错误 ───
function showFatal(err) {
  console.warn('[story]', err);
  if (!P.fatal) return;
  cancelPlay();
  P.fatal.innerHTML = `<div class="end-card"><p class="eyebrow">STORY ERROR</p><h2>剧情数据出错了</h2><p class="muted">${esc(err?.message || String(err))}</p>
    <div class="end-actions"><button class="btn primary" type="button" data-act="fatal-title">返回标题</button></div></div>`;
  P.fatal.hidden = false;
  setBackdropInert(P.fatal, true);
  $('[data-act="fatal-title"]', P.fatal).addEventListener('click', () => renderStart());
}

// ─── 键盘 ───
document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'Escape') { if (closeOverlays()) e.preventDefault(); return; }
  if (S.view !== 'play') return;
  if ((P.backlog && !P.backlog.hidden) || (P.endScreen && !P.endScreen.hidden) || (P.fatal && !P.fatal.hidden) || document.querySelector('.modal')) return;
  const target = e.target;
  if (target.closest?.('textarea, input, select, [contenteditable="true"], .pop')) return;
  const onControl = target.closest?.('button, a');
  if ((e.key === ' ' || e.key === 'Enter') && !onControl) { e.preventDefault(); advance(); return; }
  const k = e.key.toLowerCase();
  if (k === 'a') setAuto(!S.auto);
  else if (k === 's') setSkip(!S.skip);
  else if (k === 'l') toggleBacklog(true);
});
// 捕获阶段记录推进类操作的时间（含按住不放的自动重复），给章节完成页的「停手后再解锁」用
document.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') S.lastInputAt = performance.now(); }, true);
document.addEventListener('pointerdown', () => { S.lastInputAt = performance.now(); }, true);
window.addEventListener('pagehide', flushRead);
// 点击设置浮层之外的地方关闭它（全局只绑一次）
// 这一下点击只用来关浮层，不再同时推进剧情
document.addEventListener('pointerdown', (e) => {
  const pop = $('#settingsPop');
  if (pop && !pop.hidden && !pop.contains(e.target) && !e.target.closest?.('[data-act="settings"]')) {
    pop.closeSelf?.(S.view === 'play' ? 'stage' : false);
    S.suppressClickUntil = performance.now() + 700;
  }
});
window.addEventListener('resize', fitHud);
window.visualViewport?.addEventListener('resize', fitHud);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushRead(); });

// ─── 启动 ───
async function boot() {
  const params = new URLSearchParams(window.location.search);
  const want = params.get('chapter');
  S.focus = want && /^ch\d{3}$/.test(want) ? want : null;
  const [index, speakers, locations] = await Promise.all([
    fetchJson('/story/chapters/index.json'),
    fetchJson('/story/speakers.json'),
    fetchJson('/story/locations.json'),
    loadPaint(),
  ]);
  S.index = Array.isArray(index) ? index.filter((e) => /^ch\d{3}$/.test(e?.id || '')) : [];
  S.speakers = speakers && typeof speakers === 'object' ? speakers : {};
  S.locations = locations && typeof locations === 'object' ? locations : {};
  await renderStart();
}

boot();
