import { icon } from './icons.js';
import { loadPaint, paint, aiBadge as paintBadge, aiPaintedClass } from './paint.js';

const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
const settingsDialog = document.querySelector('#settingsDialog');
const helpDialog = document.querySelector('#helpDialog');
const settingsContent = document.querySelector('#settingsContent');
const soundToggle = document.querySelector('#soundToggle');

/* localStorage 只存本机便利数据（声音、称呼、已看过的提示等）；隐私模式或禁用站点数据时读写会抛错，
   所有访问都经过这里，失败时按「没有存过」处理，页面照常运行。 */
const store = {
  get(key, fallback = null) {
    try { const value = localStorage.getItem(key); return value === null ? fallback : value; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage optional */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* storage optional */ }
  },
  json(key, fallback) {
    try { const value = JSON.parse(localStorage.getItem(key) ?? 'null'); return value ?? fallback; } catch { return fallback; }
  }
};

let meta = null;
let state = null;
let screen = 'title';
let selectedCharacterId = 'lia';
let busy = false;
let lastAiSource = null;
let toastTimer = null;
let audioContext = null;
let soundEnabled = store.get('moonlit:sound') !== 'off';
let playerId = store.get('moonlit:playerId') || null;
let playerAccount = null;
let creditMeter = null;
let lastBossPhase = null;
// 调试入口只在 ?dev=1 时出现（B6：地图「解锁下一章（测试）」）
const devMode = (() => {
  try { return new URLSearchParams(window.location.search).get('dev') === '1'; } catch { return false; }
})();
// 玩出来的钻石（契约 R-1）：/api/rewards/status 的最近一次结果；没有账户时为 null
let rewardStatus = null;
// 后台口令只留在本页内存里（不写 localStorage、不进 URL），随请求头 x-admin-key 发送
let adminKey = null;
let dashboardData = null;
// 对话输入框草稿：整页重绘会重建 #chatInput，这里保存内容，重绘后写回（发送成功才清空）
let chatDraft = '';
let chatFocusPending = false;

// 演示工具（商店、测试发放）是否开放：/api/meta 的 demoTools，缺省视为开放（契约 K-1 / K-3）
function demoToolsEnabled() {
  return meta?.demoTools !== false;
}

/* ═══ 大地图城镇数据（坐标为百分比，与 /assets/map/world-map.svg 的铁路站点一致） ═══
   B6：这张地图属于 IF 外传「银轨号」。
   - 银轨站（entry:'gaiden'）进入外传，与标题页的外传卡片是同一个外传会话，所以从一开始就开放（unlockChapter:0）；
   - 赫麦村（entry:'mainline'）是通往主线「亚克的旅程」（正史）的入口，不属于外传进度；
   - 其余城镇是外传后续章节的舞台，还没有内容：一律显示「敬请期待」。unlockChapter 是外传章节号，
     「是否已抵达」由外传进度推导（gaidenChaptersCleared），不再由调试按钮写入。描述是外传（IF）的设定，不是正史。 */
const MAP_TOWNS = [
  { id:'hemai',    name:'赫麦村 · 亚克的故乡（主线）', label:'赫麦村 · 亚克的故乡', sub:'主线', icon:'village', x:12, y:72, unlockChapter:0, entry:'mainline', desc:'晨祷平原上的麦田小村，亚克长大的地方。主线「亚克的旅程」（正史）从这里开始；它不属于银轨号外传，两边的进度互不影响。', color:'#ffd27d' },
  { id:'station',  name:'银轨站',       icon:'station',    x:25, y:58, unlockChapter:0, entry:'gaiden', desc:'IF 外传「银轨号」的起点：月蚀列车在此停靠。外传序章从这里开始。', color:'#6edcff' },
  { id:'mooncity', name:'月蚀城',       icon:'moon-city',  x:40, y:42, unlockChapter:3,  desc:'外传设定：观测者的圣城，外传中塞雷娜的故乡。', color:'#b996ff' },
  { id:'frosttown',name:'霜华镇',       icon:'frost',      x:55, y:25, unlockChapter:5,  desc:'外传设定：永冬之地，芙蕾娅守护的边镇。', color:'#8fd4f5' },
  { id:'valhalla', name:'瓦尔哈拉要塞', icon:'fortress',   x:70, y:38, unlockChapter:7,  desc:'外传设定：瓦尔哈拉家族的钢铁旧要塞。', color:'#c084fc' },
  { id:'startower',name:'星咏塔',       icon:'star-tower', x:62, y:58, unlockChapter:9,  desc:'外传设定：圣教的观星高塔。', color:'#ffd98c' },
  { id:'nodgate',  name:'诺德之门',     icon:'gate',       x:80, y:50, unlockChapter:11, desc:'外传设定：通往龙脊古国的古老石门。', color:'#f472b6' },
  { id:'terminal', name:'终点站',       icon:'terminal',   x:90, y:68, unlockChapter:13, desc:'外传设定：银轨的尽头，一切结束与开始的地方。', color:'#ff8fb8' },
];
// 目前能玩的外传章节数（银轨号 · 序章）；通关后记在本机，存档失效也不会让地图倒退
const GAIDEN_PLAYABLE_CHAPTERS = 1;
const GAIDEN_CLEARED_KEY = 'moonlit:gaiden:cleared';
const DEV_GAIDEN_KEY = 'moonlit:dev:gaidenChapters';
// 玩家标记停在城镇徽章的右上方，避免盖住徽章；默认停在银轨站（外传起点）
const MARKER_OFFSET = { x: 2.4, y: -4.5 };
const START_TOWN = MAP_TOWNS.find((town) => town.id === 'station');
let playerPos = { x: START_TOWN.x + MARKER_OFFSET.x, y: START_TOWN.y + MARKER_OFFSET.y };

/* ═══ 美术资源路径（原创矢量美术，见 docs/ART-DIRECTION.md） ═══ */
const ART = {
  portrait: (id) => `/assets/portraits/${id}.svg`,
  costume: (id, type) => `/assets/costumes/${id}_${type}.svg`,
  boss: (phase) => `/assets/boss/dream-eater-${phase}.svg`,
  cg: (name) => `/assets/cg/${name}.svg`,
  scene: (name) => `/assets/scenes/${name}.svg`,
  ui: (name) => `/assets/ui/${name}.svg`,
  map: '/assets/map/world-map.svg',
  fallbackPortrait: '/assets/portraits/lia.svg'
};

// 主线章节目录（public/story/chapters/index.json）：章节页、召唤页（女主入队章节）、钻石页共用，只取一次
let mainlineIndexPromise = null;
function loadMainlineIndex() {
  mainlineIndexPromise ||= fetch('/story/chapters/index.json', { headers: { accept: 'application/json' } })
    .then((res) => (res.ok ? res.json() : []))
    .then((list) => (Array.isArray(list) ? list.filter((ch) => /^ch\d{3}$/.test(ch?.id || '')) : []))
    .catch(() => { mainlineIndexPromise = null; return []; });
  return mainlineIndexPromise;
}

// ch005 -> 「第五章」（取章节标题「第五章｜大车之夜」的前半；目录里还没有的章节写成「第 5 章」）
function mainlineChapterLabel(chapterId, index = []) {
  const entry = index.find((ch) => ch.id === chapterId);
  if (entry) return String(entry.title || chapterId).split('｜')[0];
  const number = Number(String(chapterId).replace(/^ch/, ''));
  return Number.isFinite(number) ? (number === 0 ? '序章' : `第 ${number} 章`) : chapterId;
}

// 与 game/engine.mjs finishBattleIfNeeded 相同的阈值：HP ≤ 100 进入第二阶段（battle_p2），HP ≤ 50 进入第三阶段（battle_p3）
const BOSS_PHASES = [
  { phase: 1, label: '完整形态' },
  { phase: 2, label: '外壳破碎', maxHp: 100 },
  { phase: 3, label: '封印临界', maxHp: 50 }
];

// 结局抉择 -> 结局 CG
const ENDING_CG = { seal: 'ending-seal', share: 'ending-share', destroy: 'ending-destroy' };

const COSTUME_TYPE_META = {
  newyear: { icon: 'newyear', frame: 'frame-newyear' },
  maid: { icon: 'maid', frame: 'frame-maid' },
  christmas: { icon: 'christmas', frame: 'frame-christmas' },
  duanwu: { icon: 'duanwu', frame: 'frame-duanwu' },
  anniversary: { icon: 'anniversary', frame: 'frame-anniversary' },
  swimsuit: { icon: 'summer', frame: 'frame-swimsuit' }
};

const TIER_ICON = { silver: 'medal', gold: 'crown', diamond: 'diamond' };

/* 图片加载失败兜底：CSP 禁止内联 onerror，统一用一个捕获阶段监听器。
   <img data-fallback="/path.svg"> 失败时换成备用图；<img data-fallback-icon="film"> 失败时换成图标占位。 */
document.addEventListener('error', (event) => {
  const img = event.target;
  if (!(img instanceof HTMLImageElement)) return;
  const fallback = img.dataset.fallback;
  if (fallback && img.getAttribute('src') !== fallback) {
    delete img.dataset.fallback;
    img.src = fallback;
    return;
  }
  const iconName = img.dataset.fallbackIcon;
  if (iconName) {
    const placeholder = document.createElement('span');
    placeholder.className = 'img-placeholder';
    placeholder.innerHTML = icon(iconName, { size: 32 });
    img.replaceWith(placeholder);
  } else if ('fallbackHide' in img.dataset) {
    img.hidden = true;
  }
}, true);

/* 图片懒加载：原生 loading="lazy" 在 Chromium 里会提前 1250–2500px 开始加载，服饰池 / 换衣间首屏就会拉满
   48 张服装立绘（约 3MB SVG）。这里改用 IntersectionObserver：<img data-lazy-src> 先放 1×1 透明占位，
   进入视口 300px 范围内才换成真实地址。新插入的节点由 MutationObserver 自动登记，渲染函数无需手动调用。 */
/* 签到按钮与导航栏钻石徽章会被局部重绘（refreshRewardWidgets），所以用事件委托，不逐个绑定 */
document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest('[data-daily-claim]')) {
    claimDailyReward();
  } else if (target?.closest('[data-goto="shop"]')) {
    screen = 'shop';
    beep('click');
    render();
  }
});

const LAZY_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const lazyObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) loadLazyImage(entry.target); });
  }, { rootMargin: '300px 0px' })
  : null;
// 已经换成真实地址的图：换装后整块重绘时直接输出 src，避免缩略图闪一下空白
const lazyLoadedSrc = new Set();

function loadLazyImage(img) {
  lazyObserver?.unobserve(img);
  const src = img.dataset.lazySrc;
  if (!src) return;
  delete img.dataset.lazySrc;
  lazyLoadedSrc.add(src);
  img.src = src;
}

function observeLazyImages(node) {
  const images = node.matches?.('img[data-lazy-src]') ? [node] : node.querySelectorAll?.('img[data-lazy-src]') || [];
  images.forEach((img) => (lazyObserver ? lazyObserver.observe(img) : loadLazyImage(img)));
}

new MutationObserver((records) => {
  records.forEach((record) => record.addedNodes.forEach((node) => { if (node.nodeType === 1) observeLazyImages(node); }));
}).observe(document.body, { childList: true, subtree: true });

// <img> 的 src 属性：lazy 时输出占位 + data-lazy-src
function imgSrcAttrs(src, lazy) {
  return lazy && !lazyLoadedSrc.has(src)
    ? `src="${LAZY_PLACEHOLDER}" data-lazy-src="${escapeHtml(src)}" decoding="async"`
    : `src="${escapeHtml(src)}"`;
}

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

// 服务端错误有两种形状：sendError 的 { error: { message } }，以及抽卡/会员/换装等业务函数直接返回的 { ok:false, message }
function apiErrorMessage(payload, status) {
  return payload?.error?.message || payload?.message || `请求失败 (${status})`;
}

function apiHeaders() {
  return { 'content-type': 'application/json' };
}

// 失败时抛出的 Error 带上 HTTP 状态与服务端错误码（NO_SESSION / NO_ACCOUNT / FORBIDDEN …），调用方据此区分处理
async function apiRequest(path, init = {}) {
  const response = await fetch(path, init);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) {
    const error = new Error(apiErrorMessage(payload, response.status));
    error.status = response.status;
    error.code = payload?.error?.code || payload?.code || '';
    throw error;
  }
  return payload;
}

function apiGet(path, headers = {}) {
  return apiRequest(path, { headers: { accept: 'application/json', ...headers } });
}

function apiPost(path, body) {
  return apiRequest(path, { method: 'POST', headers: apiHeaders(), body: JSON.stringify(body) });
}

function showToast(message, type = 'info') {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast show ${type === 'error' ? 'error' : ''}`;
  toastTimer = setTimeout(() => {
    toast.className = 'toast';
  }, 3200);
}

function beep(kind = 'click') {
  if (!soundEnabled) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    const presets = {
      click: [520, 0.055, 'sine', 0.035],
      chat: [690, 0.08, 'triangle', 0.025],
      hit: [135, 0.12, 'sawtooth', 0.04],
      skill: [330, 0.22, 'triangle', 0.045],
      win: [880, 0.42, 'sine', 0.045],
      error: [110, 0.15, 'square', 0.025]
    };
    const [frequency, duration, wave, volume] = presets[kind] || presets.click;
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (kind === 'win') oscillator.frequency.exponentialRampToValueAtTime(1320, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch {
    // Audio is optional.
  }
}

function characterMeta(id) {
  return meta?.characters?.find((character) => character.id === id);
}

function characterState(id) {
  return state?.characters?.[id];
}

// /api/meta 不含 battleSkill；存档里的角色状态带有该字段
function battleSkillOf(id) {
  return characterMeta(id)?.battleSkill || characterState(id)?.battleSkill || '羁绊技能';
}

function strategyMeta(id) {
  return meta?.strategies?.find((strategy) => strategy.id === id);
}

function percentage(value, max) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
}

function starsHtml(count, max = count) {
  const filled = Math.max(0, Math.min(max, Number(count) || 0));
  return `<span class="stars-row" aria-label="${filled} 星">${icon('star', { size: 12 }).repeat(filled)}${icon('star-empty', { size: 12, cls: 'star-off' }).repeat(max - filled)}</span>`;
}

// 头像徽章：832×1216 胸像立绘裁出脸部（立绘/服装立绘同构图，眼线约 y≈440）
// B17：paint() 换成厚涂位图（AI 生成）时，容器带 .ai-painted，里面放统一的「AI 生成」角标（见 paint.js）
function faceThumb(src, { cls = '', alt = '', fallback = ART.fallbackPortrait, lazy = false } = {}) {
  return `<span class="face-crop ${cls} ${aiPaintedClass(src)}"><img ${imgSrcAttrs(paint(src), lazy)} alt="${escapeHtml(alt)}" data-fallback="${escapeHtml(fallback)}">${paintBadge(src)}</span>`;
}

// 场景背景：铺满舞台、压暗，不参与交互
function stageBackdrop(src, cls = '') {
  return `<div class="stage-backdrop ${cls}" aria-hidden="true"><img src="${escapeHtml(paint(src))}" alt="" data-fallback-hide></div>${paintBadge(src)}`;
}

function bossPhase(enemy = state?.enemy) {
  const hp = Number(enemy?.hp ?? Infinity);
  return [...BOSS_PHASES].reverse().find((p) => p.maxHp === undefined || hp <= p.maxHp) || BOSS_PHASES[0];
}

function externalCta(url, label, className = 'secondary') {
  if (!url) return '';
  return `<a class="button ${className}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}

// 「AI对话 ↔ 故事模式」只在真的接了模型时才有区别；离线保底引擎下两种模式用的是同一套台词，不显示切换
function modeToggleAvailable() {
  return meta?.ai?.mode === 'openai' && Boolean(state);
}

function aiBadge() {
  const isDemo = meta?.ai?.mode !== 'openai';
  const sourceLabel = lastAiSource === 'fallback'
    ? '模型超时 · 已保底'
    : lastAiSource === 'model'
      ? meta.ai.model
      : isDemo ? '零成本剧情保底' : meta.ai.model;
  return `<span class="pill ${isDemo ? 'demo' : ''}" title="角色台词运行方式"><span class="pill-dot"></span>${escapeHtml(sourceLabel)}</span>`;
}

// 网格列数：尽量不让最后一行只剩一个按钮（余数为 1 时换一个列数）
function gridColumnsFor(count, candidates = [4, 3, 5]) {
  return candidates.find((cols) => count <= cols || count % cols !== 1) || candidates[0];
}

/* 标题页（B7 / B20 / B12）：两张带说明的入口卡片——「主线：亚克的旅程」（正史，独立播放页 story.html）与
   「外传：银轨号」（IF 外传，名字输入框只属于外传）；下面是「实验模式：卡牌对战」入口与每日签到。
   背景是矢量拼成的 /assets/title-bg.svg（不再用 AI 主视觉照片）；右侧三张厚涂立绘是标题页唯一的 AI 位图（B9）。 */
function titleScreen() {
  const hasSave = Boolean(state);
  const currentScene = state ? sceneName(state.scene) : '';
  // 标题页英雄卡：桌面在首屏，≤1120px 时排到文案下方，那时才懒加载
  const heroBelowFold = window.matchMedia?.('(max-width: 1120px)').matches;
  const heroImg = (src, alt) => `<img src="${src}" alt="${alt}" width="832" height="1216" decoding="async"${heroBelowFold ? ' loading="lazy"' : ''}>`;
  // 外传卡片的按钮：有存档时「继续外传」为主、「新开外传」为次
  const sideActions = hasSave
    ? `<button id="continueGame" class="button primary">${icon('station', { size: 17 })}继续外传 · ${escapeHtml(currentScene)}</button>
       <button id="newGame" class="button ghost">${icon('refresh', { size: 16 })}新开外传</button>`
    : `<button id="newGame" class="button primary">${icon('station', { size: 17 })}进入银轨号外传</button>`;
  const secondaryActions = [
    externalCta(meta?.marketing?.wishlistUrl, '加入 Steam 愿望单', 'ghost'),
    `<button id="titleHelp" class="button ghost">${icon('help', { size: 16 })}外传玩法</button>`,
    `<button id="galleryButton" class="button ghost">${icon('collection', { size: 16 })}CG图库</button>`,
    ...visibleNavItems().filter((item) => item.id !== 'title').map((item) => `<button class="button ghost" data-nav="${item.id}">${icon(item.icon, { size: 16 })}${item.label}</button>`)
  ].filter(Boolean);
  return `
    <main class="title-screen">
      <div class="title-layout">
        <section class="title-copy">
          <div class="eyebrow">AI-NATIVE JRPG · 月蚀契约</div>
          <img class="title-logo" src="/assets/logo.svg" alt="月蚀契约：她们会记得你">
          <p class="title-tagline">用自己的话回应世界，<strong>每一句承诺都会被记住</strong>。</p>
          <div class="mode-cards">
            <article class="mode-card mode-main" aria-labelledby="modeMainTitle">
              <div class="mode-kicker">${icon('moon', { size: 14 })}正史 · 主线</div>
              <h2 id="modeMainTitle">主线：亚克的旅程</h2>
              <p>黑翼焚麦之夜之后，牧羊青年亚克立下屠龙之誓。没有固定选项，用自己的话替他回应世界。</p>
              <div class="mode-mainline" id="titleMainline" aria-live="polite"></div>
              <div class="mode-meta"><span class="pill">自由输入 · 视觉小说</span><span class="pill">每章首通得钻石</span></div>
              <a class="button primary story-main-cta mode-cta" href="/story.html">${icon('play', { size: 15 })}开始 / 继续主线</a>
            </article>
            <article class="mode-card mode-side" aria-labelledby="modeSideTitle">
              <div class="mode-kicker is-if">${icon('station', { size: 14 })}IF 外传</div>
              <h2 id="modeSideTitle">外传：银轨号</h2>
              <p>平行世界的一夜：月蚀列车上，三名队友与吞噬记忆的怪物。人物身份与主线不同，不影响正史。</p>
              <label class="name-label" for="playerName">你在外传里的名字（队友称你「队长」）</label>
              <input id="playerName" class="name-field" maxlength="16" autocomplete="nickname" value="${escapeHtml(state?.playerName || store.get('moonlit:name') || '队长')}" placeholder="例如：队长">
              <div class="mode-actions">${sideActions}</div>
              <div class="mode-meta">${aiBadge()}<span class="pill">约 15–25 分钟</span><span class="pill">3 名可交流队友</span><span class="pill">确定性回合战斗</span></div>
            </article>
          </div>
          <a class="mode-lab" href="/cards.html">
            <span class="mode-lab-icon">${icon('deck', { size: 22 })}</span>
            <span class="mode-lab-text"><span class="mode-kicker is-lab">实验模式</span><strong>卡牌对战</strong><small>规则仍在调整的试验玩法；胜利可得钻石（每天有上限）。</small></span>
            ${icon('chevron-right', { size: 18, cls: 'mode-lab-go' })}
          </a>
          <div class="title-daily" id="titleDaily">${dailyStripHtml()}</div>
          <nav class="title-grid" aria-label="更多入口" style="--cols:${gridColumnsFor(secondaryActions.length)}">${secondaryActions.join('')}</nav>
          <p class="title-studio">阳之亮面出品</p>
          <p class="title-footnote">「银轨号」是 IF 外传，人物身份与主线正史不同；正史以主线为准。标题页的三张厚涂角色卡由 AI 生成（画面含「图片由AI生成」标识）；标题背景与游戏内的立绘、服装、CG、地图、怪物和图标都是原创矢量美术，游戏内若出现 AI 生成的厚涂图，会在角落标注「AI 生成」。AI 只生成受约束的角色台词，不直接修改数值、战斗结果或世界事实。</p>
        </section>
        <section class="title-art" aria-label="三名主要角色">
          <div class="hero-moon"></div>
          <div class="hero-card">${heroImg('/assets/lia.jpg', '莉亚·赫斯特')}</div>
          <div class="hero-card">${heroImg('/assets/mia.jpg', '米娅·玲')}</div>
          <div class="hero-card">${heroImg('/assets/serena.jpg', '塞雷娜·诺克斯')}</div>
        </section>
      </div>
    </main>`;
}

// 主线卡片里的进度：每章一格，写出下一章（章节目录 + 主线播放器记在本机的通关记录）
async function loadTitleMainline() {
  const index = await loadMainlineIndex();
  const box = document.querySelector('#titleMainline');
  if (!box || !index.length) return;
  const done = store.json('moonlit:story:progress', {}) || {};
  const doneCount = index.filter((ch) => done[ch.id]).length;
  const next = index.find((ch) => !done[ch.id]);
  box.innerHTML = `
    <div class="mode-progress" role="img" aria-label="主线进度：已完成 ${doneCount} / ${index.length} 章">${index.map((ch) => `<span class="${done[ch.id] ? 'done' : ''}"></span>`).join('')}</div>
    <p class="mode-next">${next ? `${doneCount ? '下一章' : '从这里开始'}：${escapeHtml(next.title)}` : '已上线的章节全部完成，新章节制作中'}<span> · 已上线 ${index.length} 章</span></p>`;
}

/* ═══ 每日签到（契约 R-1）═══
   标题页一条、钻石页一张卡。没有账户时不主动建号：点「签到」时才建（与召唤/换衣同一个本机账户）。 */
function dailyStripHtml() {
  const s = rewardStatus;
  const ready = s ? s.dailyAvailable : true;
  const amount = s?.dailyAmount;
  const streak = s?.streak || 0;
  const text = !s
    ? '每日签到领钻石，连续签到每天多一点。'
    : ready
      ? `今日可领 <b>+${amount}</b> 钻石${streak ? ` · 已连续 ${streak} 天` : ''}`
      : `今日已签到 · 连续 ${streak} 天 · 明天 <b>+${amount}</b>`;
  return `
    <span class="daily-icon">${icon('gift', { size: 20 })}</span>
    <span class="daily-text"><strong>每日签到</strong><span>${text}</span></span>
    <button class="button ${ready ? 'primary' : 'ghost'} small daily-claim" type="button" data-daily-claim ${ready ? '' : 'disabled'}>${ready ? '签到' : '已签到'}</button>`;
}

function sceneName(scene) {
  return {
    intro: '月蚀列车',
    camp: '战前餐车',
    corridor: '霜之回廊',
    battle: '记忆侵袭战',
    aftermath: '黎明种苏醒',
    ending: '序章结局'
  }[scene] || scene;
}

function renderHeader() {
  return `
    <header class="game-header">
      <div class="brand-mini">
        <span class="brand-mark" aria-hidden="true"></span>
        <div><strong>月蚀契约</strong><span>IF 外传 · 银轨号</span></div>
      </div>
      <div class="objective"><strong>当前目标</strong>${escapeHtml(state.objective)}</div>
      <div class="header-actions">
        ${modeToggleAvailable() ? `<button id="modeToggle" class="pill mode-pill ${state.dialogueMode === 'ai' ? 'ai' : 'story'}" title="切换对话模式">${state.dialogueMode === 'ai' ? 'AI对话' : '故事模式'}</button>` : ''}
        ${aiBadge()}
        <button id="helpButton" class="icon-button" title="玩法说明" aria-label="玩法说明">${icon('help')}</button>
        <button id="settingsButton" class="icon-button" title="设置" aria-label="设置">${icon('settings')}</button>
        <button id="backToTitle" class="icon-button" title="返回标题" aria-label="返回标题">${icon('home')}</button>
      </div>
    </header>`;
}

function rosterHtml({ selectable = true, showBars = true } = {}) {
  return `
    <h3 class="panel-heading">Party / 队伍</h3>
    <div class="roster">
      ${meta.characters.map((character) => {
        const relationship = characterState(character.id);
        const active = selectedCharacterId === character.id;
        return `
          <button class="roster-card ${active ? 'active' : ''}" data-character="${character.id}" ${selectable ? '' : 'disabled'} style="--char-accent:${character.accent}">
            ${faceThumb(ART.portrait(character.id), { cls: 'roster-avatar' })}
            <div>
              <div class="roster-name">${escapeHtml(character.shortName)}</div>
              <div class="roster-role">${escapeHtml(character.role)}</div>
              ${showBars ? `<div class="mini-bars">
                <div class="mini-bar"><span>羁绊</span><div class="bar-track"><div class="bar-fill" style="--value:${relationship.bond * 10}%;--char-accent:${character.accent}"></div></div><b>${relationship.bond}</b></div>
                <div class="mini-bar"><span>信任</span><div class="bar-track"><div class="bar-fill" style="--value:${relationship.trust * 10}%;--char-accent:${character.accent}"></div></div><b>${relationship.trust}</b></div>
              </div>
              <div class="roster-stats" aria-label="羁绊 ${relationship.bond} · 信任 ${relationship.trust}"><span aria-hidden="true">♥${relationship.bond} · ✦${relationship.trust}</span></div>` : ''}
            </div>
          </button>`;
      }).join('')}
    </div>`;
}

function questHtml() {
  const strategyChosen = Boolean(state.chosenStrategyId);
  // chatTurns 在进入回廊/战后会清零，所以用事件记录判断是否交流过
  const talked = state.chatTurns > 0 || state.events.some((item) => item.type === 'player');
  return `
    <h3 class="panel-heading">Chapter Goals</h3>
    <div class="quest-list">
      <div class="quest-item"><span class="quest-check ${talked ? 'done' : ''}">${talked ? icon('check', { size: 13 }) : ''}</span><span>与至少一名队友自由交流</span></div>
      <div class="quest-item"><span class="quest-check ${strategyChosen ? 'done' : ''}">${strategyChosen ? icon('check', { size: 13 }) : ''}</span><span>选择一套主导战术</span></div>
      <div class="quest-item"><span class="quest-check ${state.flags.battleWon ? 'done' : ''}">${state.flags.battleWon ? icon('check', { size: 13 }) : ''}</span><span>击败食梦兽</span></div>
      <div class="quest-item"><span class="quest-check ${state.ending ? 'done' : ''}">${state.ending ? icon('check', { size: 13 }) : ''}</span><span>决定黎明种的命运</span></div>
    </div>`;
}

function recentEvents(limit = 12) {
  return state.events.slice(-limit);
}

function eventLogHtml(limit = 12) {
  return `<div class="event-log" id="eventLog">
    ${recentEvents(limit).map((item) => {
      const char = item.speakerId && characterMeta(item.speakerId);
      const speaker = item.type === 'player' ? state.playerName
        : char ? char.shortName
          : item.type === 'narration' ? '旁白'
            : item.type === 'battle' ? '战斗'
              : item.type === 'hint' ? '提示'
                : '系统';
      const deltaBond = Number(item.meta?.bondDelta || 0);
      const deltaTrust = Number(item.meta?.trustDelta || 0);
      const deltas = deltaBond || deltaTrust
        ? `<span class="delta ${(deltaBond + deltaTrust) >= 0 ? 'positive' : 'negative'}">${deltaBond ? `羁绊${deltaBond > 0 ? '+' : ''}${deltaBond}` : ''}${deltaBond && deltaTrust ? ' · ' : ''}${deltaTrust ? `信任${deltaTrust > 0 ? '+' : ''}${deltaTrust}` : ''}</span>`
        : '';
      // B4：引擎去掉了重复的正分时（meta.unscored），提示玩家原因
      const unscored = item.meta?.unscored === 'repeat' ? '说过的话不再加分'
        : item.meta?.unscored === 'promise' ? '承诺每人只计一次' : '';
      const unscoredTag = unscored ? `<span class="delta muted unscored">${unscored}</span>` : '';
      return `<div class="event ${escapeHtml(item.type)}" style="--event-accent:${char?.accent || '#b996ff'}">
        <div class="event-speaker">${escapeHtml(speaker)}</div>
        <div class="event-text">${escapeHtml(item.text)}${deltas}${unscoredTag}</div>
      </div>`;
    }).join('')}
  </div>`;
}

// 各场景的交流上限以引擎的 state.chatLimits 为准（旧存档没有这个字段时用下面的默认值）。
// B4：战后交流最多 3 次，按整局累计（state.aftermathChatTurns，重置战斗再赢也不清零）；
// 同一句话对同一角色只计一次分，承诺每人只计一次（引擎计分，前端只显示规则）。
const DEFAULT_CHAT_LIMITS = { corridor: 4, aftermath: 3 };

function chatLimitFor(scene) {
  const limit = Number(state.chatLimits?.[scene]);
  if (Number.isInteger(limit) && limit >= 0) return limit;
  return scene === 'camp' ? state.maxChatTurns : DEFAULT_CHAT_LIMITS[scene] ?? state.maxChatTurns;
}

function chatTurnsUsed(scene) {
  if (scene === 'aftermath' && Number.isInteger(state.aftermathChatTurns)) return state.aftermathChatTurns;
  return state.chatTurns;
}

function chatPanelHtml({ actionButton = '' } = {}) {
  const character = characterMeta(selectedCharacterId);
  const isCamp = state.scene === 'camp';
  const isCorridor = state.scene === 'corridor';
  const isAftermath = state.scene === 'aftermath';
  const limited = isCamp || isCorridor || isAftermath;
  const maxTurns = chatLimitFor(state.scene);
  const used = chatTurnsUsed(state.scene);
  const canChat = !limited || used < maxTurns;
  const remaining = Math.max(0, maxTurns - used);
  const sceneLabel = isCorridor ? '回廊交流剩余' : isCamp ? '战前交流剩余' : '战后交流剩余';
  const placeholder = canChat
    ? `对${character.shortName}说点什么……`
    : isAftermath ? '战后交流已用完，请做出最终抉择。' : '交流次数已用完。';
  const ruleNote = isAftermath ? '同一句话只计一次 · 承诺每人只计一次' : 'AI 只能提议，规则引擎才可改状态';
  return `
    <div class="dialogue-inner">
      ${eventLogHtml(14)}
      <div class="chat-box">
        ${actionButton || `
          <div class="quick-prompts">
            ${character.quickPrompts.map((prompt) => `<button class="chip" data-quick="${escapeHtml(prompt)}" ${canChat ? '' : 'disabled'}>${escapeHtml(prompt)}</button>`).join('')}
          </div>
          <form id="chatForm" class="chat-form">
            <input id="chatInput" class="chat-input" maxlength="500" autocomplete="off" aria-label="对${escapeHtml(character.shortName)}说的话" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(chatDraft)}" ${canChat ? '' : 'disabled'}>
            <button class="button primary" type="submit" ${canChat ? '' : 'disabled'}>${busy ? '思考中…' : '发送'}</button>
          </form>
          <div class="chat-meta"><span>${limited ? `${sceneLabel} ${remaining} 次` : ''}</span><span>${ruleNote}</span></div>`}
      </div>
    </div>`;
}

// B9：外传画面里的女主一律用矢量立绘（/assets/portraits/*.svg），厚涂位图只经 paint 清单替换，并带「AI 生成」角标
function characterStageHtml() {
  const character = characterMeta(selectedCharacterId);
  const relationship = characterState(selectedCharacterId);
  const isCorridor = state.scene === 'corridor';
  const portrait = ART.portrait(character.id);
  return `
    <div class="character-stage ${isCorridor ? 'is-corridor' : 'is-camp'}" style="--char-accent:${character.accent}">
      ${stageBackdrop(isCorridor ? ART.cg('corridor-frost') : ART.scene('camp-bg'), isCorridor ? 'backdrop-corridor' : 'backdrop-camp')}
      <div class="character-backdrop"></div>
      <img class="character-portrait" src="${escapeHtml(paint(portrait))}" alt="${escapeHtml(character.name)}" data-fallback="${escapeHtml(portrait)}">
      ${paintBadge(portrait)}
      <div class="character-label">
        <h2>${escapeHtml(character.name)}</h2>
        <p>${escapeHtml(character.title)} · ${escapeHtml(character.role)} · 羁绊技能「${escapeHtml(battleSkillOf(character.id))}」</p>
      </div>
      <span class="pill character-mood"><span class="pill-dot" style="background:${character.accent}"></span>${escapeHtml(relationship.mood)}</span>
      ${busy ? '<div class="loading-overlay"><div class="loader"></div></div>' : ''}
    </div>`;
}

// locked：回廊阶段战术已部署，只展示不可再改（服务端也只允许在营地选择战术）；
// actionButton：面板底部的主按钮，默认是营地的「部署战术」，回廊传入「开始战斗」，两个场景主按钮位置一致
function strategyPanelHtml({ locked = false, actionButton = null } = {}) {
  return `
    <h3 class="panel-heading">Tactical Anchor</h3>
    <div class="strategy-list">
      ${meta.strategies.map((strategy) => {
        const owner = characterMeta(strategy.owner);
        const selected = state.chosenStrategyId === strategy.id;
        return `<button class="strategy-card ${selected ? 'selected' : ''}" ${locked ? 'disabled' : `data-strategy="${strategy.id}"`} style="--strategy-accent:${owner.accent}">
          <div class="strategy-title"><span>${escapeHtml(strategy.name)}</span><span class="strategy-owner">${escapeHtml(owner.shortName)}</span></div>
          <p>${escapeHtml(strategy.description)}</p>
          <div class="strategy-bonus">${escapeHtml(strategy.bonus)}</div>
        </button>`;
      }).join('')}
    </div>
    <div class="stat-card">
      <div class="spread"><span class="muted">${locked ? '回廊交流' : '交流次数'}</span><strong>${state.chatTurns}/${chatLimitFor(locked ? 'corridor' : 'camp')}</strong></div>
      <div class="spread" style="margin-top:8px"><span class="muted">承诺记录</span><strong>${state.flags.madePromise ? '已建立' : '未建立'}</strong></div>
    </div>
    ${actionButton ?? `<button id="beginCorridor" class="button primary full" style="margin-top:12px" ${state.chosenStrategyId && !busy ? '' : 'disabled'}>部署战术，穿过回廊</button>`}`;
}

// 序章画面的三名队友（矢量立绘，B9）
const INTRO_TRIO = [['lia', '莉亚'], ['mia', '米娅'], ['serena', '塞雷娜']];

function introLayout() {
  return `
    <div class="game-content">
      <aside class="left-panel">${questHtml()}</aside>
      <section class="center-stage">
        <div class="intro-stage">
          ${stageBackdrop(ART.cg('intro-eye'), 'backdrop-intro')}
          <div class="intro-panel">
            <div class="eyebrow">PROLOGUE · THE EYE OUTSIDE THE WINDOW</div>
            <div class="intro-orbit ${aiPaintedClass(...INTRO_TRIO.map(([id]) => ART.portrait(id)))}">
              ${INTRO_TRIO.map(([id, name]) => `<img class="intro-avatar" src="${escapeHtml(paint(ART.portrait(id)))}" alt="${name}" width="832" height="1216" decoding="async" data-fallback="${ART.portrait(id)}">`).join('')}
              ${paintBadge(...INTRO_TRIO.map(([id]) => ART.portrait(id)))}
            </div>
            <h1>醒来时，她们都记得你。</h1>
            <p>只有你不记得她们。</p>
          </div>
          ${busy ? '<div class="loading-overlay"><div class="loader"></div></div>' : ''}
        </div>
      </section>
      <aside class="right-panel">
        <h3 class="panel-heading">Situation</h3>
        <div class="stat-card"><div class="eyebrow">TIME LEFT</div><div class="big-stat">12:00</div><div class="muted">食梦兽抵达核心前</div></div>
        <div class="stat-card"><strong>黎明种</strong><p class="muted">一段能够改写群体记忆的古代指令。三人对它有不同使命。</p></div>
      </aside>
      <section class="dialogue-panel">
        ${chatPanelHtml({ actionButton: `<div class="stack"><p class="muted">三个人都在等你的命令。先去战前餐车听听她们真正的想法。</p><button id="beginCamp" class="button primary full" ${busy ? 'disabled' : ''}>进入战前餐车</button></div>` })}
      </section>
    </div>`;
}

function campLayout() {
  return `
    <div class="game-content">
      <aside class="left-panel">${rosterHtml()}<div style="height:18px"></div>${questHtml()}</aside>
      <section class="center-stage">${characterStageHtml()}</section>
      <aside class="right-panel">${strategyPanelHtml()}</aside>
      <section class="dialogue-panel">${chatPanelHtml()}</section>
    </div>`;
}

function corridorLayout() {
  const remaining = Math.max(0, chatLimitFor('corridor') - state.chatTurns);
  return `
    <div class="game-content">
      <aside class="left-panel">${rosterHtml()}<div style="height:18px"></div>
        <div class="stat-card"><h3 class="panel-heading">回廊 · 战前最后时刻</h3><p class="muted">走廊里的霜越来越厚。食梦兽就在前方。这是最后交流的机会。</p>
        <div class="spread" style="margin-top:8px"><span class="muted">剩余交流</span><strong>${remaining} 次</strong></div></div>
      </aside>
      <section class="center-stage">${characterStageHtml()}</section>
      <aside class="right-panel">${strategyPanelHtml({ locked: true, actionButton: `<button id="beginBattle" class="button primary full" style="margin-top:12px" ${!busy ? '' : 'disabled'}>冲出去，开始战斗</button>` })}</aside>
      <section class="dialogue-panel">${chatPanelHtml()}</section>
    </div>`;
}

function battleLayout() {
  const partyHp = percentage(state.partyHp, state.partyMaxHp);
  const enemyHp = percentage(state.enemy.hp, state.enemy.maxHp);
  const focus = percentage(state.focus, state.focusMax);
  const selectedStrategy = strategyMeta(state.chosenStrategyId);
  const leader = characterMeta(selectedStrategy.owner);
  const phase = bossPhase();
  const phaseChanged = lastBossPhase !== null && lastBossPhase !== phase.phase;
  lastBossPhase = phase.phase;
  return `
    <div class="game-content is-battle">
      <aside class="left-panel">
        <h3 class="panel-heading">Party Status</h3>
        <div class="party-status">
          <div class="party-hp-card"><div class="spread"><strong>队伍生命</strong><span>${state.partyHp}/${state.partyMaxHp}</span></div><div class="hp-bar" style="margin-top:9px"><div class="hp-fill" style="--value:${partyHp}%"></div></div></div>
          <div class="party-hp-card"><div class="spread"><strong>羁绊焦点</strong><span>${state.focus}/${state.focusMax}</span></div><div class="hp-bar" style="margin-top:9px"><div class="focus-fill" style="--value:${focus}%"></div></div></div>
          ${rosterHtml({ selectable: false, showBars: false })}
        </div>
      </aside>
      <section class="center-stage">
        <div class="battle-stage boss-phase-${phase.phase}">
          ${stageBackdrop(ART.scene('battle-bg'), 'backdrop-battle')}
          <div class="battle-top"><div class="enemy-nameplate"><div class="eyebrow">MEMORY DEVOURER · TURN ${state.turn}</div><h2>${escapeHtml(state.enemy.name)} <span class="phase-pill">PHASE ${phase.phase} · ${escapeHtml(phase.label)}</span></h2><div class="hp-bar"><div class="hp-fill" style="--value:${enemyHp}%"></div></div><div class="muted" style="margin-top:7px">${state.enemy.hp}/${state.enemy.maxHp} · 压制 ${state.enemy.sealed}</div></div></div>
          <div class="enemy-zone ${phaseChanged ? 'phase-enter' : ''}"><img class="enemy-art" src="${paint(ART.boss(phase.phase))}" alt="${escapeHtml(state.enemy.name)} · ${escapeHtml(phase.label)}" data-fallback="${ART.boss(phase.phase)}">${paintBadge(ART.boss(phase.phase))}</div>
          <div class="battle-bottom"><span>主导战术：${escapeHtml(selectedStrategy.name)}</span><span>·</span><span>羁绊角色：${escapeHtml(leader.shortName)}</span></div>
        </div>
        ${busy ? '<div class="loading-overlay"><div class="loader"></div></div>' : ''}
      </section>
      <aside class="right-panel">
        <h3 class="panel-heading">Battle Command</h3>
        <div class="command-list">
          <button class="command" data-battle="attack" ${busy ? 'disabled' : ''}><strong>连携攻击</strong><span>造成伤害 · 焦点 +8</span></button>
          <button class="command" data-battle="skill" ${state.focus >= 30 && !busy ? '' : 'disabled'}><strong>${escapeHtml(battleSkillOf(leader.id))}</strong><span>消耗 30 焦点</span></button>
          <button class="command" data-battle="guard" ${busy ? 'disabled' : ''}><strong>稳住阵型</strong><span>减伤 · 焦点 +16</span></button>
          <button class="command" data-battle="item" ${state.potions > 0 && !busy ? '' : 'disabled'}><strong>星露药 ×${state.potions}</strong><span>恢复最多 30 生命</span></button>
        </div>
        <div class="stat-card"><strong>${escapeHtml(selectedStrategy.name)}</strong><p class="muted">${escapeHtml(selectedStrategy.description)}</p><div class="strategy-bonus">${escapeHtml(selectedStrategy.bonus)}</div></div>
        ${state.flags.battleLostOnce ? '<div class="stat-card"><strong>时间回卷已触发</strong><p class="muted">队友仍隐约记得失败，信任下降了。</p></div>' : ''}
      </aside>
      <section class="dialogue-panel"><div class="dialogue-inner">${eventLogHtml(16)}<div class="chat-box"><div class="stack"><strong>规则提示</strong><p class="muted">先用普通攻击或防御积累焦点，再发动羁绊技能。AI 不参与伤害结算。</p></div></div></div></section>
    </div>`;
}

function aftermathLayout() {
  return `
    <div class="game-content">
      <aside class="left-panel">${rosterHtml()}<div style="height:18px"></div>${questHtml()}</aside>
      <section class="center-stage">
        <div class="aftermath-stage">
          ${stageBackdrop(ART.cg('aftermath-snow'), 'backdrop-aftermath')}
          <div class="artifact-wrap">
            <div class="eyebrow">THE DAWN SEED IS AWAKE</div>
            <div class="dawn-seed" aria-hidden="true"><img src="${ART.ui('dawn-seed')}" alt="" data-fallback-hide></div>
            <h1>世界应该记住什么？</h1>
            <p class="muted">三名队友不会替你决定，但她们会根据你此前的态度，记住你为什么这样选择。</p>
            <div class="decision-grid">
              ${meta.decisions.map((decision) => `<button class="decision-card" data-decision="${decision.id}" ${busy ? 'disabled' : ''}><h3>${escapeHtml(decision.name)}</h3><p>${escapeHtml(decision.description)}</p></button>`).join('')}
            </div>
          </div>
          ${busy ? '<div class="loading-overlay"><div class="loader"></div></div>' : ''}
        </div>
      </section>
      <aside class="right-panel">
        <h3 class="panel-heading">Relationship Summary</h3>
        ${meta.characters.map((character) => {
          const rel = characterState(character.id);
          return `<div class="stat-card" style="border-left:3px solid ${character.accent}"><div class="spread"><strong>${escapeHtml(character.shortName)}</strong><span>${escapeHtml(rel.mood)}</span></div><div class="spread" style="margin-top:7px"><span class="muted">羁绊 / 信任</span><b>${rel.bond} / ${rel.trust}</b></div><div class="faint" style="font-size:.7rem;margin-top:7px">记住了 ${rel.memories.length} 件与你有关的事</div></div>`;
        }).join('')}
        <div class="stat-card"><div class="spread"><span class="muted">守诺标记</span><strong>${state.flags.madePromise && !state.flags.insultedSomeone ? '稳定' : '不完整'}</strong></div><div class="spread" style="margin-top:8px"><span class="muted">羁绊协作</span><strong>${state.flags.usedBondSkill ? '已发生' : '未发生'}</strong></div></div>
      </aside>
      <section class="dialogue-panel">${chatPanelHtml()}</section>
    </div>`;
}

function endingScreen() {
  const ending = state.ending;
  const partner = characterMeta(ending.partnerId);
  const hiddenRoute = Boolean(state.flags.fourthPath || ending.rank === 'S');
  const endingCg = ENDING_CG[state.decisionId] || ENDING_CG.seal;
  return `
    <main class="game-page">
      <section class="ending-screen">
        <article class="ending-card ${hiddenRoute ? 'is-hidden-route' : ''}">
          <div class="ending-visual">
            <img class="ending-bg" src="${paint(ART.scene('ending-bg'))}" alt="" aria-hidden="true" data-fallback-hide>
            <img class="ending-cg" src="${paint(ART.cg(endingCg))}" alt="${escapeHtml(ending.title)}" data-fallback-hide>
            ${paintBadge(ART.scene('ending-bg'), ART.cg(endingCg))}
            <div class="ending-rank-wrap">
              <div class="ending-rank">${escapeHtml(ending.rank)}</div>
              ${hiddenRoute ? `<img class="ending-crest" src="${ART.ui('eclipse-crest')}" alt="隐藏路线徽记" title="隐藏路线达成">` : ''}
            </div>
            <figure class="ending-partner"><img src="${escapeHtml(paint(ART.portrait(partner.id)))}" alt="${escapeHtml(partner.name)}" data-fallback="${ART.portrait(partner.id)}">${paintBadge(ART.portrait(partner.id))}</figure>
          </div>
          <div class="ending-body">
            <div class="eyebrow">IF 外传 · 银轨号 · 序章完 · ${escapeHtml(partner.title)}</div>
            <h1>${escapeHtml(ending.title)}</h1>
            <p>${escapeHtml(ending.text)}</p>
            <p><strong>${escapeHtml(ending.epilogue)}</strong></p>
            <div class="title-notes">
              <span class="pill">搭档：${escapeHtml(partner.shortName)}</span>
              <span class="pill">羁绊 ${state.characters[partner.id].bond}/10</span>
              <span class="pill">信任 ${state.characters[partner.id].trust}/10</span>
              ${state.flags.fourthPath ? '<span class="pill"><span class="pill-dot"></span>隐藏路线解锁</span>' : ''}
            </div>
            <div class="ending-actions">
              ${externalCta(meta?.marketing?.wishlistUrl, '加入 Steam 愿望单', 'primary')}
              ${externalCta(meta?.marketing?.communityUrl, '加入玩家社群', 'secondary')}
              <button id="copyEnding" class="button ${meta?.marketing?.wishlistUrl ? 'secondary' : 'primary'}">复制结局卡片</button>
              <button id="restartGame" class="button secondary">重新开始</button>
              <button id="endingTitle" class="button ghost">返回标题</button>
            </div>
          </div>
        </article>
      </section>
    </main>`;
}

// 切换页面或剧情场景时回到顶部（同一场景内的重绘保留滚动位置，例如手机战斗连续点指令）
let lastViewKey = '';
function render() {
  // 整页重绘会重建对话输入框：记下它是否有焦点，重绘后还回去（发送后也要回到输入框，见 sendChat）
  const chatInput = document.querySelector('#chatInput');
  const wantChatFocus = Boolean(chatInput && document.activeElement === chatInput) || chatFocusPending;
  if (!busy) chatFocusPending = false;
  renderView();
  restoreChatFocus(wantChatFocus);
  // 顶部导航的 Credit 计量：creditMeter 只在召唤页拉取过，其余页面首次进入会显示 0；已有账户时顺手刷新
  // 先确认账户仍在（服务器重启且未持久化时会重建并提示），再读余额，避免拿失效的 id 去查
  if (playerId && !creditMeter && document.querySelector('.nav-credit')) ensureAccount().then(refreshCredit).catch(() => {});
  // 钻石余额与签到状态（导航栏、标题页、钻石页共用）：已有账户时读一次，之后由签到/召唤等操作刷新
  if (playerId && !rewardStatus && document.querySelector('.nav-credit, #titleDaily, #rewardsPanel')) loadRewardStatus().catch(() => {});
  const viewKey = `${screen}:${screen === 'title' || !state ? '' : state.scene}`;
  if (viewKey !== lastViewKey) {
    lastViewKey = viewKey;
    window.scrollTo(0, 0);
  }
  // 在标题页 / 地图等页面解锁的 CG 先排队，进入外传画面后再弹出提示
  if (isGameScreen()) flushCgQueue();
}

function isGameScreen() {
  return screen === 'game' && Boolean(state);
}

function restoreChatFocus(wantFocus) {
  const input = document.querySelector('#chatInput');
  if (!wantFocus || !input || input.disabled) return;
  input.focus({ preventScroll: true });
  const end = input.value.length;
  try { input.setSelectionRange(end, end); } catch { /* 某些输入类型不支持 */ }
}

function renderView() {
  if (screen === 'map') {
    app.innerHTML = mapPage();
    bindNavEvents();
    bindMapEvents();
    return;
  }
  if (screen === 'shop') {
    app.innerHTML = shopPage();
    bindNavEvents();
    loadShop();
    // 钻石页一进来就要显示签到与奖励进度：没有账户时在这里建号（与召唤/换衣相同）
    ensureAccount().then(() => Promise.all([refreshCredit(), loadRewardStatus()])).catch(() => {});
    return;
  }
  if (screen === 'gacha') {
    app.innerHTML = gachaPage();
    bindNavEvents();
    bindGachaEvents();
    loadGachaPool();
    ensureAccount().then(refreshCredit).catch(() => {});
    return;
  }
  if (screen === 'skills') {
    app.innerHTML = skillsPage();
    bindNavEvents();
    bindSkillsEvents();
    ensureAccount().then(() => Promise.all([refreshCredit(), loadSkillsView()])).catch((e) => showToast(e.message, 'error'));
    return;
  }
  if (screen === 'costume') {
    app.innerHTML = costumePage();
    bindNavEvents();
    loadCostumes();
    ensureAccount().then(refreshCredit).catch(() => {});
    return;
  }
  if (screen === 'settings') {
    app.innerHTML = settingsPage();
    bindNavEvents();
    bindSettingsPageEvents();
    return;
  }
  if (screen === 'dashboard') {
    app.innerHTML = dashboardPage();
    bindNavEvents();
    loadDashboard();
    return;
  }
  if (screen === 'chapters') {
    app.innerHTML = chaptersPage();
    bindNavEvents();
    loadChapters();
    return;
  }
  if (screen === 'title' || !state || state.scene !== 'battle') lastBossPhase = null;
  if (screen === 'title' || !state) {
    app.innerHTML = titleScreen();
    loadTitleMainline();
  } else if (state.scene === 'ending') {
    app.innerHTML = endingScreen();
  } else {
    const sceneLayout = state.scene === 'intro' ? introLayout()
      : state.scene === 'camp' ? campLayout()
        : state.scene === 'corridor' ? corridorLayout()
          : state.scene === 'battle' ? battleLayout()
            : aftermathLayout();
    app.innerHTML = `<main class="game-page"><section class="game-frame">${renderHeader()}${sceneLayout}</section></main>`;
  }
  bindEvents();
  requestAnimationFrame(() => {
    const log = document.querySelector('#eventLog');
    if (log) log.scrollTop = log.scrollHeight;
  });
}

function bindNavEvents() {
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      screen = btn.dataset.nav;
      beep('click');
      render();
    });
  });
}

function bindGachaEvents() {
  document.querySelectorAll('.gacha-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      currentGachaPool = tab.dataset.pool;
      document.querySelectorAll('.gacha-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const tickets = document.querySelector('#gachaTicketActions');
      if (tickets) tickets.hidden = currentGachaPool !== 'skill';
      // 切换卡池时清掉上一个卡池的召唤结果，避免角色结果显示在服饰池下面
      const result = document.querySelector('#gachaResult');
      if (result) { result.style.display = 'none'; result.innerHTML = ''; }
      loadGachaPool();
    });
  });
  document.querySelector('#gachaSingle')?.addEventListener('click', () => doGachaPull(1));
  document.querySelector('#gachaTen')?.addEventListener('click', () => doGachaPull(10));
  document.querySelector('#gachaTicket1')?.addEventListener('click', () => doGachaPull(1, 'tickets'));
  document.querySelector('#gachaTicket10')?.addEventListener('click', () => doGachaPull(10, 'tickets'));
  document.querySelector('#gachaRatesJump')?.addEventListener('click', () => {
    document.querySelector('#gachaRates')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function bindSettingsPageEvents() {
  document.querySelector('#settingsSoundToggle')?.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    store.set('moonlit:sound', soundEnabled ? 'on' : 'off');
    if (soundEnabled) beep('click');
    render();
  });
  document.querySelector('#adminForm')?.addEventListener('submit', unlockAdmin);
}

// 后台口令由服务器校验（请求头 x-admin-key）；前端不保存、不比对任何口令
async function fetchDashboard(key) {
  return apiGet('/api/admin/dashboard', { 'x-admin-key': key });
}

async function unlockAdmin(event) {
  event.preventDefault();
  const input = document.querySelector('#adminPassword');
  const button = document.querySelector('#adminUnlock');
  const errorBox = document.querySelector('#adminError');
  const key = input?.value || '';
  const showError = (message) => {
    if (errorBox) { errorBox.textContent = message; errorBox.hidden = false; }
    beep('error');
  };
  if (!key) { showError('请输入管理口令。'); input?.focus(); return; }
  // 口令放在请求头里发送：请求头只能装 Latin-1 字符，中文等字符会让 fetch 直接抛出浏览器的英文报错
  if (/[^\x20-\xff]/.test(key)) { showError('口令只能包含英文字母、数字和常见符号。'); input?.focus(); return; }
  if (button) button.disabled = true;
  try {
    dashboardData = await fetchDashboard(key);
    adminKey = key;
    screen = 'dashboard';
    beep('skill');
    render();
  } catch (error) {
    showError(error.status === 403 ? '口令错误。' : error.status === 404 ? '后台未启用。' : error.message);
    if (input) { input.value = ''; input.focus(); }
  } finally {
    if (button?.isConnected) button.disabled = false;
  }
}

function bindEvents() {
  bindNavEvents();
  // 「银轨号外传」一次点击直接进入外传开场（不再先落到大地图）
  document.querySelector('#newGame')?.addEventListener('click', () => startNewGame('game'));
  document.querySelector('#continueGame')?.addEventListener('click', () => {
    screen = 'game';
    selectedCharacterId = state.selectedCharacterId || 'lia';
    beep('click');
    render();
  });
  document.querySelector('#titleHelp')?.addEventListener('click', () => helpDialog.showModal());
  document.querySelector('#galleryButton')?.addEventListener('click', async () => {
    try {
      const r = await apiGet(`/api/gallery${state?.id ? `?sessionId=${encodeURIComponent(state.id)}` : ''}`);
      // 本机记录过的解锁与当前存档的解锁取并集：存档失效后图库也不会清空
      if (state) rememberCgUnlocks(state);
      const gallery = (r.gallery || []).map((cg) => ({ ...cg, unlocked: Boolean(cg.unlocked || cgUnlockedLocal.has(cg.id)) }));
      showGallery(gallery, gallery.filter((cg) => cg.unlocked).length, r.total ?? gallery.length);
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
  document.querySelector('#helpButton')?.addEventListener('click', () => helpDialog.showModal());
  document.querySelector('#modeToggle')?.addEventListener('click', toggleDialogueMode);
  document.querySelector('#settingsButton')?.addEventListener('click', openSettings);
  document.querySelector('#backToTitle')?.addEventListener('click', () => { screen = 'title'; render(); });
  document.querySelector('#endingTitle')?.addEventListener('click', () => { screen = 'title'; render(); });

  document.querySelectorAll('[data-character]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedCharacterId = button.dataset.character;
      beep('click');
      render();
    });
  });

  document.querySelectorAll('[data-quick]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.querySelector('#chatInput');
      if (!input) return;
      input.value = button.dataset.quick;
      chatDraft = input.value;
      input.focus();
      beep('click');
    });
  });
  document.querySelector('#chatInput')?.addEventListener('input', (event) => { chatDraft = event.target.value; });

  document.querySelector('#chatForm')?.addEventListener('submit', sendChat);
  document.querySelector('#beginCamp')?.addEventListener('click', () => runMutation('/api/advance', { action: 'begin_camp' }, 'click'));
  document.querySelector('#beginCorridor')?.addEventListener('click', () => runMutation('/api/advance', { action: 'begin_corridor' }, 'click'));
  document.querySelector('#beginBattle')?.addEventListener('click', () => runMutation('/api/advance', { action: 'begin_battle' }, 'skill'));

  document.querySelectorAll('[data-strategy]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedCharacterId = button.dataset.strategy;
      runMutation('/api/strategy', { strategyId: button.dataset.strategy }, 'click');
    });
  });

  document.querySelectorAll('[data-battle]').forEach((button) => {
    button.addEventListener('click', async () => {
      const actionId = button.dataset.battle;
      const beforeScene = state.scene;
      // 带上 playerId：技能书③绝技格里她的暮紫／赤月给外传的「技能」一点封顶加成（技能稿 6.2）
      await runMutation('/api/battle', { actionId, playerId }, actionId === 'skill' ? 'skill' : actionId === 'attack' ? 'hit' : 'click');
      if (beforeScene === 'battle' && state.scene === 'aftermath') beep('win');
    });
  });

  document.querySelectorAll('[data-decision]').forEach((button) => {
    button.addEventListener('click', async () => {
      await runMutation('/api/ending', { decisionId: button.dataset.decision }, 'win');
    });
  });

  document.querySelector('#copyEnding')?.addEventListener('click', copyEnding);
  document.querySelector('#restartGame')?.addEventListener('click', restartGame);
}

// 新建外传存档并进入外传开场（标题页「银轨号外传」/「新开外传」、地图银轨站在没有存档时都走这里）
async function startNewGame(nextScreen = 'game') {
  if (busy) return;
  const nameInput = document.querySelector('#playerName');
  const playerName = nameInput?.value.trim() || store.get('moonlit:name') || '队长';
  busy = true;
  render();
  try {
    const payload = await apiPost('/api/session', { playerName });
    state = payload.state;
    meta = payload.meta || meta;
    selectedCharacterId = state.selectedCharacterId || 'lia';
    screen = nextScreen;
    chatDraft = '';
    store.set('moonlit:session', state.id);
    store.set('moonlit:name', state.playerName);
    beep('skill');
  } catch (error) {
    showToast(error.message, 'error');
    beep('error');
  } finally {
    busy = false;
    render();
    announceCgUnlocks();
  }
}

async function sendChat(event) {
  event.preventDefault();
  if (busy) return;
  const input = document.querySelector('#chatInput');
  const message = input?.value.trim();
  if (!message) {
    showToast('先说点什么。', 'error');
    return;
  }
  // 无论按回车还是点「发送」，回复回来后焦点都回到输入框，可以直接接着打第二句
  chatFocusPending = true;
  await runMutation('/api/chat', { characterId: selectedCharacterId, message }, 'chat', (payload) => {
    lastAiSource = payload.ai?.source || null;
    chatDraft = '';
  });
}

async function runMutation(path, body, sound = 'click', after) {
  if (busy || !state) return;
  busy = true;
  render();
  try {
    const payload = await apiPost(path, { sessionId: state.id, ...body });
    state = payload.state;
    rememberGaidenProgress(state); // 地图的外传进度：到达结局就记下序章已通关（B6）
    selectedCharacterId = state.selectedCharacterId || selectedCharacterId;
    store.set('moonlit:session', state.id);
    after?.(payload);
    beep(sound);
  } catch (error) {
    beep('error');
    if (error.code === 'NO_SESSION' || /存档不存在|服务器已重启/.test(error.message)) {
      store.remove('moonlit:session');
      state = null;
      screen = 'title';
      showToast('服务器重启后旧存档已失效，请重新开始外传。', 'error');
    } else {
      showToast(error.message, 'error');
    }
  } finally {
    busy = false;
    render();
    announceCgUnlocks();
  }
}

async function restartGame() {
  if (!state || busy) return;
  busy = true;
  try {
    const payload = await apiPost('/api/restart', { sessionId: state.id });
    state = payload.state;
    meta = payload.meta || meta;
    selectedCharacterId = 'lia';
    screen = 'game';
    chatDraft = '';
    store.set('moonlit:session', state.id);
    beep('skill');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    busy = false;
    render();
    announceCgUnlocks();
  }
}

async function copyEnding() {
  if (!state?.ending) return;
  const partner = characterMeta(state.ending.partnerId);
  const text = `《月蚀契约：她们会记得你》\n${state.ending.rank}级结局：${state.ending.title}\n搭档：${partner.shortName}\n${state.ending.epilogue}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast('结局卡片已复制。');
    beep('click');
  } catch {
    showToast('浏览器不允许自动复制，请手动截图。', 'error');
  }
}

/* ═══ CG 解锁提示 ═══
   引擎在 state.unlockedCgs 记录解锁，并写一条「CG解锁：「标题」」系统事件。
   每个存档的每张 CG 只提示一次（记在 localStorage，刷新页面也不会重复）。 */
const CG_SEEN_KEY = 'moonlit:cgSeen';
const cgSeen = new Set((() => {
  const saved = store.json(CG_SEEN_KEY, []);
  return Array.isArray(saved) ? saved : [];
})());
// 本机解锁过的 CG（跨存档取并集）：服务器重启、存档失效后 CG 图库也不会被清空
const CG_UNLOCKED_KEY = 'moonlit:cgUnlocked';
const cgUnlockedLocal = new Set((() => {
  const saved = store.json(CG_UNLOCKED_KEY, []);
  return Array.isArray(saved) ? saved.filter((id) => typeof id === 'string') : [];
})());
let cgCatalog = null;
// 不在外传画面（标题页 / 地图等）时解锁的 CG：先排队，进入外传画面后再弹提示
const cgQueue = [];

function cgSeenKey(snapshot, cgId) {
  return `${snapshot.id}:${cgId}`;
}

function rememberCgUnlocks(snapshot) {
  if (!snapshot?.unlockedCgs) return;
  const before = cgUnlockedLocal.size;
  snapshot.unlockedCgs.forEach((cgId) => {
    cgSeen.add(cgSeenKey(snapshot, cgId));
    cgUnlockedLocal.add(cgId);
  });
  store.set(CG_SEEN_KEY, JSON.stringify([...cgSeen].slice(-300)));
  if (cgUnlockedLocal.size !== before) store.set(CG_UNLOCKED_KEY, JSON.stringify([...cgUnlockedLocal]));
}

async function loadCgCatalog() {
  if (cgCatalog) return cgCatalog;
  try {
    const r = await apiGet('/api/gallery');
    cgCatalog = r.gallery || [];
  } catch {
    cgCatalog = [];
  }
  return cgCatalog;
}

async function announceCgUnlocks() {
  const snapshot = state;
  const fresh = (snapshot?.unlockedCgs || []).filter((cgId) => !cgSeen.has(cgSeenKey(snapshot, cgId)));
  if (!fresh.length) return;
  rememberCgUnlocks(snapshot);
  const catalog = await loadCgCatalog();
  fresh.forEach((cgId) => cgQueue.push(catalog.find((item) => item.id === cgId) || { id: cgId, title: '新的事件回忆', file: '' }));
  if (isGameScreen()) flushCgQueue();
}

function flushCgQueue() {
  cgQueue.splice(0).forEach((cg, index) => setTimeout(() => showCgUnlock(cg), index * 450));
}

function showCgUnlock(cg) {
  let stack = document.querySelector('#cgUnlockStack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'cgUnlockStack';
    stack.className = 'cg-unlock-stack';
    stack.setAttribute('aria-live', 'polite');
    document.body.appendChild(stack);
  }
  positionCgStack(stack);
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'cg-unlock';
  card.title = '点击关闭';
  card.innerHTML = `
    <span class="cg-unlock-thumb ${cg.file ? aiPaintedClass(cg.file) : ''}">${cg.file ? `<img src="${escapeHtml(paint(cg.file))}" alt="" data-fallback-icon="film">${paintBadge(cg.file)}` : `<span class="img-placeholder">${icon('film', { size: 28 })}</span>`}</span>
    <span class="cg-unlock-text"><span class="eyebrow">${icon('sparkle', { size: 12 })} CG 解锁</span><strong>${escapeHtml(cg.title)}</strong><small>已收录至 CG 图库</small></span>`;
  let timer = null;
  const dismiss = () => {
    clearTimeout(timer);
    card.classList.remove('show');
    card.classList.add('leaving');
    setTimeout(() => card.remove(), 320);
  };
  card.addEventListener('click', dismiss);
  stack.appendChild(card);
  requestAnimationFrame(() => card.classList.add('show'));
  timer = setTimeout(dismiss, 3200);
}

// 手机：提示贴在导航栏 / 外传页头的下沿，不盖住导航；结局页没有页头，由 CSS 放到屏幕底部，不挡结局评级。
// 战斗中例外：页头下方就是 Boss 名牌、血条和阶段标签，提示留在页头上（与桌面一致）
function positionCgStack(stack) {
  stack.style.top = '';
  if (!window.matchMedia?.('(max-width: 880px)').matches || document.querySelector('.is-battle')) return;
  const header = document.querySelector('.top-nav, .game-header');
  const bottom = header ? header.getBoundingClientRect().bottom : 0;
  if (bottom > 0) stack.style.top = `${Math.round(bottom + 8)}px`;
}

// 当前 AI 的如实描述：只有 AI_MODE=openai 时才有真实模型名，否则是离线保底引擎
function aiRuntimeLabel() {
  return meta?.ai?.mode === 'openai' ? (meta.ai.model || 'OpenAI 兼容模型') : '剧情保底引擎（离线）';
}

function dialogueModeRowHtml() {
  if (!modeToggleAvailable()) return '';
  const isAi = state.dialogueMode === 'ai';
  return `<div class="stat-card"><div class="spread"><span class="muted">对话模式</span>
      <button id="dialogModeToggle" type="button" class="pill mode-pill ${isAi ? 'ai' : 'story'}" aria-label="切换对话模式（当前：${isAi ? 'AI对话' : '故事模式'}）">${isAi ? 'AI对话' : '故事模式'}</button></div>
      <p class="faint" style="margin:8px 0 0;font-size:.76rem">AI对话：由模型即兴回应；故事模式：使用固定的角色台词。</p></div>`;
}

async function toggleDialogueMode() {
  if (!state) return;
  const next = state.dialogueMode === 'ai' ? 'story' : 'ai';
  try {
    const r = await apiPost('/api/mode', { sessionId: state.id, mode: next });
    state = r.state;
    render();
    if (settingsDialog.open) openSettings();
    showToast(next === 'ai' ? '已切换：AI自由对话' : '已切换：固定故事模式');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function openSettings() {
  const isOpenAi = meta?.ai?.mode === 'openai';
  settingsContent.innerHTML = `
    <div class="stack">
      <div class="stat-card"><div class="spread"><span class="muted">当前运行方式</span><strong>${isOpenAi ? 'OpenAI 兼容模型' : '剧情保底引擎（离线）'}</strong></div>${isOpenAi ? `<div class="spread" style="margin-top:8px"><span class="muted">模型</span><strong>${escapeHtml(aiRuntimeLabel())}</strong></div>` : ''}</div>
      ${dialogueModeRowHtml()}
      <p class="muted">${isOpenAi ? '' : '当前没有接入大模型，角色台词来自离线保底引擎。'}本地模型由服务器代理，API Key 永远不会发到浏览器。使用 Ollama 时，把项目根目录的 <code>.env.example</code> 复制为 <code>.env</code>，并设置：</p>
      <div class="code-block">AI_MODE=openai\nAI_BASE_URL=http://127.0.0.1:11434/v1\nAI_API_KEY=ollama\nAI_MODEL=qwen3:8b</div>
      <p class="faint">模型不可用、超时或输出越权时，游戏会自动切回角色专属保底台词，主线不会卡死。</p>
    </div>`;
  settingsContent.querySelector('#dialogModeToggle')?.addEventListener('click', toggleDialogueMode);
  soundToggle.textContent = `声音：${soundEnabled ? '开' : '关'}`;
  if (!settingsDialog.open) settingsDialog.showModal();
}

soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  store.set('moonlit:sound', soundEnabled ? 'on' : 'off');
  soundToggle.textContent = `声音：${soundEnabled ? '开' : '关'}`;
  if (soundEnabled) beep('click');
});

/* ═══ 导航栏 ═══ */
// 商店（钻石页）一直显示：作者核#12 对 B2/B3 的修改——保留钻石、商店与召唤的互动感；
// 钻石页的「玩出来的钻石」在任何模式下都可用，演示充值区只在 demoTools 开启时出现（契约 K-1 / K-3）。
const NAV_ITEMS = [
  { id: 'title', label: '首页', icon: 'home' },
  { id: 'map', label: '地图', icon: 'map' },
  { id: 'chapters', label: '章节', icon: 'book' },
  { id: 'gacha', label: '召唤', icon: 'sparkle' },
  { id: 'skills', label: '技能', icon: 'scroll' },
  { id: 'costume', label: '换衣', icon: 'dress' },
  { id: 'shop', label: '商店', icon: 'cart' },
  { id: 'settings', label: '设置', icon: 'settings' }
];

function visibleNavItems() {
  return NAV_ITEMS;
}

function navBar() {
  const items = visibleNavItems();
  return `
    <nav class="top-nav">
      <div class="nav-brand"><span class="brand-mark"></span><strong>月蚀契约</strong><span class="nav-studio">阳之亮面出品</span></div>
      <div class="nav-links" style="--nav-count:${items.length}">
        ${items.map((item) => `<button class="nav-btn ${screen === item.id ? 'active' : ''}" data-nav="${item.id}" ${screen === item.id ? 'aria-current="page"' : ''}>${icon(item.icon, { size: 16 })}<span>${item.label}</span></button>`).join('')}
      </div>
      <div class="nav-credit"><span class="nav-credit-meter">${creditMeterHtml()}</span><span class="nav-diamond">${diamondChipHtml()}</span></div>
    </nav>`;
}

function creditMeterHtml() {
  // 还没有账户（只在召唤 / 换衣 / 商店里创建）时显示「—」，不显示一个假的 0
  const balance = creditMeter?.balance ?? playerAccount?.credits ?? '—';
  const todayUsed = creditMeter?.todayUsed ?? 0;
  return `<div class="credit-meter" title="Credit余额 / 今日消耗">
    <span class="credit-icon">${icon('credit', { size: 18, title: 'Credit' })}</span>
    <span class="credit-value">${balance}</span>
    <span class="credit-used">今日 -${todayUsed}</span>
  </div>`;
}

// 钻石徽章：余额 + 今日可签到的小红点；点开是钻石页（签到与奖励）
function diamondBalance() {
  const value = rewardStatus?.diamonds ?? playerAccount?.diamonds;
  return Number.isFinite(value) ? value : null;
}

function diamondChipHtml() {
  const balance = diamondBalance();
  const dailyReady = rewardStatus ? rewardStatus.dailyAvailable : !playerId;
  const label = `钻石 ${balance ?? '—'}${dailyReady ? '，今日可签到' : ''}`;
  return `<button class="diamond-chip ${dailyReady ? 'has-daily' : ''}" type="button" data-goto="shop" title="钻石 · 每日签到与奖励" aria-label="${label}">
    <span class="diamond-icon">${icon('diamond', { size: 16 })}</span><span class="diamond-value">${balance ?? '—'}</span>${dailyReady ? '<span class="daily-dot" aria-hidden="true"></span>' : ''}
  </button>`;
}

/* ═══ 大地图页面（B6：IF 外传「银轨号」专用）═══ */
const MAP_W = 1000;
const MAP_H = 560;
const GAIDEN_SCENES = ['intro', 'camp', 'corridor', 'battle', 'aftermath', 'ending'];

function gaidenClearedLocally() {
  return store.get(GAIDEN_CLEARED_KEY) === '1';
}

function rememberGaidenProgress(snapshot = state) {
  if (snapshot?.ending && !gaidenClearedLocally()) store.set(GAIDEN_CLEARED_KEY, '1');
}

// 只有 ?dev=1 才读调试进度；正常游玩时地图完全由外传进度推导
function devGaidenChapters() {
  if (!devMode) return 0;
  const value = Number(store.get(DEV_GAIDEN_KEY, '0'));
  return Number.isInteger(value) && value > 0 ? value : 0;
}

// 已通关的外传章节数：目前只有序章可玩（通关 = 本机记录过结局，或当前存档已到结局）
function gaidenChaptersCleared() {
  const real = gaidenClearedLocally() || Boolean(state?.ending) ? GAIDEN_PLAYABLE_CHAPTERS : 0;
  return real + devGaidenChapters();
}

// 'mainline'：通往主线；'gaiden'：外传入口；'reached'：外传已推进到这里但还没有内容；'locked'：还没推进到
function townStatus(town) {
  if (town.entry) return town.entry;
  return town.unlockChapter <= gaidenChaptersCleared() ? 'reached' : 'locked';
}

function townNodeSvg(town) {
  const status = townStatus(town);
  const open = status === 'mainline' || status === 'gaiden';
  const glyph = status === 'locked' ? 'lock' : town.icon;
  const sub = town.sub || (open ? '' : '敬请期待');
  return `<g class="town-node ${open ? 'unlocked' : 'locked'} town-${status}" data-town="${town.id}" transform="translate(${town.x * MAP_W / 100},${town.y * MAP_H / 100})" style="--town:${town.color}" role="button" tabindex="0" aria-label="${escapeHtml(town.name)}${open ? '' : '（敬请期待）'}">
    <circle class="town-halo" r="30"/>
    <circle class="town-ring" r="21"/>
    <circle class="town-core" r="16.5"/>
    <g class="town-glyph" transform="translate(-11,-11)">${icon(glyph, { size: 22 })}</g>
    <text class="town-label" text-anchor="middle" y="40">${escapeHtml(town.label || town.name)}</text>
    ${sub ? `<text class="town-sub" text-anchor="middle" y="54">${escapeHtml(sub)}</text>` : ''}
  </g>`;
}

function playerMarkerTransform() {
  return `transform:translate(${(playerPos.x * MAP_W / 100).toFixed(1)}px,${(playerPos.y * MAP_H / 100).toFixed(1)}px)`;
}

// 外传进度条：序章内按场景推进；通关后显示「后续章节敬请期待」
function gaidenProgressInfo() {
  const cleared = gaidenClearedLocally() || Boolean(state?.ending);
  if (cleared && (!state || state.ending)) return { percent: 100, text: '银轨号 · 序章：已通关 · 后续章节敬请期待' };
  if (state) {
    const step = Math.max(0, GAIDEN_SCENES.indexOf(state.scene));
    return { percent: Math.round(step / (GAIDEN_SCENES.length - 1) * 100), text: `银轨号 · 序章：进行中（${sceneName(state.scene)}）${cleared ? ' · 曾通关' : ''}` };
  }
  return { percent: 0, text: '银轨号 · 序章：未开始' };
}

function mapPage() {
  const progress = gaidenProgressInfo();
  return `${navBar()}
    <main class="page-content map-page">
      <div class="page-header">
        <div class="eyebrow">IF 外传 · 银轨号 · 路线图</div>
        <h1>银轨号路线图</h1>
        <p class="muted">这张地图属于 IF 外传「银轨号」：银轨站进入外传序章；赫麦村通往主线「亚克的旅程」（正史）；其余城镇是外传后续章节，敬请期待。</p>
      </div>
      <div class="map-container" id="mapContainer">
        <svg id="worldMap" viewBox="0 0 ${MAP_W} ${MAP_H}" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="银轨号外传路线图">
          <defs>
            <radialGradient id="markerGlow">
              <stop offset="0%" stop-color="#5ee4ff" stop-opacity=".55"/><stop offset="100%" stop-color="#5ee4ff" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <image href="${ART.map}" x="0" y="0" width="${MAP_W}" height="${MAP_H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"/>
          ${MAP_TOWNS.map(townNodeSvg).join('')}
          <g id="playerMarker" style="${playerMarkerTransform()}" role="img" aria-label="你的位置">
            <circle class="marker-glow" r="22" fill="url(#markerGlow)"/>
            <circle class="marker-ring" r="13"/>
            <g class="marker-glyph" transform="translate(-9,-9)">${icon('traveler', { size: 18 })}</g>
          </g>
        </svg>
      </div>
      <!-- 城镇信息面板 -->
      <div class="map-info-panel" id="mapInfoPanel" hidden>
        <div class="map-info-header">
          <span id="infoIcon" class="map-info-icon"></span>
          <h3 id="infoName"></h3>
          <button class="icon-button" id="mapInfoClose" type="button" aria-label="关闭">${icon('close', { size: 18 })}</button>
        </div>
        <p id="infoDesc" class="muted"></p>
        <div class="map-info-actions" id="infoActions"></div>
      </div>
      <!-- 外传进度 -->
      <div class="map-progress">
        <span class="muted">外传进度 · ${escapeHtml(progress.text)}</span>
        <div class="progress-track" style="flex:1;margin:0 12px;height:6px">
          <div class="progress-fill" style="width:${progress.percent}%"></div>
        </div>
        ${devMode ? `<button class="button small" id="debugUnlockNext" type="button">${icon('unlock', { size: 16 })}解锁下一章（测试）</button>` : ''}
      </div>
    </main>`;
}

function bindMapEvents() {
  // 点击地图移动玩家
  document.getElementById('worldMap')?.addEventListener('click', (e) => {
    const svg = document.getElementById('worldMap');
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    movePlayer(x, y);
  });

  // 点击城镇：移动过去并打开信息面板（没有内容的城镇面板里写「敬请期待」）
  document.querySelectorAll('.town-node').forEach((node) => {
    const activate = (e) => {
      e.stopPropagation();
      const town = MAP_TOWNS.find((t) => t.id === node.dataset.town);
      if (!town) return;
      if (townStatus(town) !== 'locked') movePlayer(town.x + MARKER_OFFSET.x, town.y + MARKER_OFFSET.y);
      else beep('click');
      showTownInfo(town);
    };
    node.addEventListener('click', activate);
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(e); }
    });
  });

  document.getElementById('mapInfoClose')?.addEventListener('click', hideTownInfo);
  document.getElementById('debugUnlockNext')?.addEventListener('click', debugUnlockNext);
}

function hideTownInfo() {
  const panel = document.getElementById('mapInfoPanel');
  if (panel) panel.hidden = true;
}

function movePlayer(x, y) {
  playerPos = { x: Math.max(3, Math.min(97, x)), y: Math.max(3, Math.min(97, y)) };
  const marker = document.getElementById('playerMarker');
  if (marker) marker.setAttribute('style', playerMarkerTransform());
  beep('click');
}

function showTownInfo(town) {
  const panel = document.getElementById('mapInfoPanel');
  if (!panel) return;
  const status = townStatus(town);
  const iconEl = document.getElementById('infoIcon');
  iconEl.innerHTML = icon(status === 'locked' ? 'lock' : town.icon, { size: 28 });
  iconEl.style.setProperty('--town', town.color);
  document.getElementById('infoName').textContent = town.name;
  document.getElementById('infoDesc').textContent = town.desc;

  const actions = document.getElementById('infoActions');
  // 银轨站：没有存档时先建档（否则 screen='game' 会因 state 为空落回标题页）
  const enterGaiden = () => {
    if (!state) startNewGame('game');
    else { screen = 'game'; render(); }
  };
  const scene = status === 'mainline'
    ? { label: '进入主线 · 亚克的旅程', action: () => { window.location.href = '/story.html'; } }
    : status === 'gaiden'
      ? { label: state ? `继续外传 · ${sceneName(state.scene)}` : '开始银轨号外传', action: enterGaiden }
      : null;

  actions.innerHTML = scene
    ? `<button class="button primary" id="enterTownBtn" type="button">${escapeHtml(scene.label)}</button>
       <button class="button secondary" id="leaveTownBtn" type="button">离开</button>`
    : `<button class="button secondary" type="button" disabled>${icon('lock', { size: 15 })}敬请期待</button>
       <button class="button ghost" id="leaveTownBtn" type="button">离开</button>
       <p class="faint map-info-note">外传后续章节还在制作中${status === 'reached' ? '' : '，推进外传后会在地图上点亮'}。</p>`;
  document.getElementById('enterTownBtn')?.addEventListener('click', () => {
    hideTownInfo();
    scene.action();
  });
  document.getElementById('leaveTownBtn')?.addEventListener('click', hideTownInfo);
  panel.hidden = false;
}

// 仅 ?dev=1：模拟外传进度，预览后续城镇在地图上点亮的样子（城镇本身仍是「敬请期待」）
function debugUnlockNext() {
  const cleared = gaidenChaptersCleared();
  const nextChapter = [...new Set(MAP_TOWNS.map((t) => t.unlockChapter))].sort((a, b) => a - b).find((c) => c > cleared);
  if (nextChapter === undefined) {
    showToast('全部章节已点亮（测试）');
    return;
  }
  store.set(DEV_GAIDEN_KEY, String(devGaidenChapters() + (nextChapter - cleared)));
  showToast(`已模拟外传进度到第 ${nextChapter} 章（测试，仅 ?dev=1）`);
  render();
}

/* ═══ 钻石与商店页面 ═══
   作者核#12 对 B2/B3 的修改：游戏不公开，但保留钻石、商店与召唤；钻石靠游玩获得（契约 R-1 / R-2 / R-3）：
   每日签到、主线章节首通、卡牌对战胜利（每天有上限）。演示充值仍在，明确标成「免费补充」——支付没有接入。 */
function shopPage() {
  return `${navBar()}
    <main class="page-content">
      <div class="page-header"><div class="eyebrow">DIAMONDS · 钻石与商店</div><h1>钻石与商店</h1>
        <p class="muted">钻石靠游玩获得：每日签到、主线首通、卡牌对战胜利。召唤和卡牌开包都可以用钻石。</p>
      </div>
      <section class="shop-section" aria-labelledby="earnTitle">
        <h2 class="section-title" id="earnTitle">玩出来的钻石</h2>
        <div class="rewards-grid" id="rewardsPanel">${rewardsPanelHtml()}</div>
      </section>
      ${demoToolsEnabled() ? `
      <div class="demo-banner" role="note">${icon('info', { size: 18 })}<div><strong>演示版 · 支付未接入，不会真实扣款</strong><span>下面是免费补充：标价仅作展示，点击按钮直接免费发放，用于体验召唤与换衣。</span></div></div>
      <section class="shop-section">
        <h2 class="section-title">会员等级 · 演示免费开通</h2>
        <div class="membership-grid" id="membershipGrid">
          <div class="loader">加载中…</div>
        </div>
      </section>
      <section class="shop-section">
        <h2 class="section-title">钻石免费补充 · 演示</h2>
        <div class="diamond-grid" id="diamondGrid">
          <div class="loader">加载中…</div>
        </div>
      </section>` : `
      <p class="muted shop-closed">${icon('info', { size: 16 })}演示充值已关闭（本服务器未开启演示工具），钻石只能靠游玩获得。</p>`}
    </main>`;
}

// 钻石页用到的公开规则：召唤价格与重复补偿（/api/gacha/pools）、卡牌开包价格（/api/cards/meta）、主线章节目录
let shopContext = { pools: null, cardsMeta: null, index: [] };

async function loadShopContext() {
  const [pools, cardsMeta, index] = await Promise.all([
    cachedGachaPools().catch(() => null),
    shopContext.cardsMeta ? Promise.resolve(shopContext.cardsMeta) : apiGet('/api/cards/meta').catch(() => null),
    loadMainlineIndex()
  ]);
  shopContext = { pools, cardsMeta, index };
  refreshRewardWidgets();
}

const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);

function rewardsPanelHtml() {
  const s = rewardStatus;
  const rules = s?.rules || {};
  const daily = rules.daily || {};
  const { pools, cardsMeta, index } = shopContext;
  const base = num(daily.base);
  const step = num(daily.streakStep);
  const cap = num(daily.streakBonusCap);
  const ladderDays = base !== null && step && cap !== null ? Math.floor(cap / step) + 1 : 5;
  const amountOn = (day) => (base === null ? '—' : base + Math.min(cap ?? 0, (day - 1) * (step ?? 0)));
  const streak = s?.streak || 0;
  const ready = s ? s.dailyAvailable : true;
  // 今天这一格：还没签就是 streak+1，已经签过就是 streak
  const todayDay = ready ? streak + 1 : streak;
  const ladder = Array.from({ length: ladderDays }, (_, i) => {
    const day = i + 1;
    const last = day === ladderDays;
    const isToday = last ? todayDay >= day : todayDay === day;
    const done = last ? !ready && todayDay >= day : day <= streak && !(isToday && ready);
    return `<li class="${done ? 'done' : ''} ${isToday ? 'today' : ''}"><span>第${day}天${last ? '起' : ''}</span><b>+${amountOn(day)}</b></li>`;
  }).join('');
  const dailyRule = base === null ? '每天签到一次；连续签到每天多一点。'
    : `第 1 天 +${base}，连续签到每天多 ${step}，第 ${ladderDays} 天起每天 +${base + cap}；断签从第 1 天重新算。`;

  const chapterReward = num(s?.chapterReward ?? rules.chapterFirstClear);
  const cleared = new Set(s?.chaptersCleared || []);
  const chapterItems = index.length
    ? index.map((ch) => `<li class="${cleared.has(ch.id) ? 'done' : ''}">${cleared.has(ch.id) ? icon('check', { size: 12 }) : icon('book', { size: 12 })}${escapeHtml(mainlineChapterLabel(ch.id, index))}</li>`).join('')
    : '';
  const characters = pools?.characters || [];
  const joins = s?.heroineJoins || pools?.heroineJoins || {};
  const joined = new Set(s?.heroinesJoined || []);
  const released = new Set(index.map((ch) => ch.id));
  // 还没登场的女主（封存卡）只写「？？？ · 第N章登场」，不写名字（登场闸门，核#14）
  const joinRows = characters.filter((c) => joins[c.id] && (released.has(joins[c.id]) || joined.has(c.id)))
    .map((c) => `<li class="${joined.has(c.id) ? 'done' : ''}">${joined.has(c.id) ? icon('check', { size: 12 }) : icon('lock', { size: 12 })}${escapeHtml(c.sealed ? `${SEALED_NAME} · ${debutText(c, index)}` : c.name.split('·')[0])} · 通关${escapeHtml(mainlineChapterLabel(joins[c.id], index))}入队${joined.has(c.id) ? ' · 已加入' : ''}</li>`).join('');
  const futureJoins = characters.filter((c) => joins[c.id] && !released.has(joins[c.id]) && !joined.has(c.id)).length;

  const winCap = num(s?.cardWinCap ?? rules.cardWin?.dailyCap);
  const winReward = num(s?.cardWinReward ?? rules.cardWin?.diamonds);
  const winsToday = s?.cardWinsToday || 0;
  const pips = winCap ? Array.from({ length: winCap }, (_, i) => `<span class="win-pip ${i < winsToday ? 'done' : ''}"></span>`).join('') : '';

  const costs = pools?.costs?.diamonds;
  const dup = pools?.duplicateCompensation || {};
  const pack = cardsMeta?.pack;
  const dupText = Object.keys(dup).length ? Object.entries(dup).sort(([a], [b]) => a - b).map(([rarity, value]) => `${rarity}★ +${value}`).join(' · ') : '—';

  return `
    <article class="reward-card reward-daily">
      <header><span class="reward-icon">${icon('gift', { size: 20 })}</span><h3>每日签到</h3><span class="reward-amount">${s ? `+${s.dailyAmount}` : ''}</span></header>
      <p class="reward-rule">${dailyRule}</p>
      <ol class="streak-ladder" aria-label="连续签到奖励">${ladder}</ol>
      <div class="reward-foot"><span class="muted">${s ? `已连续 ${streak} 天` : '签到后开始计算连续天数'}</span>
        <button class="button ${ready ? 'primary' : 'ghost'} small" type="button" data-daily-claim ${ready ? '' : 'disabled'}>${ready ? `签到${s ? ` +${s.dailyAmount}` : ''}` : '今日已签到'}</button></div>
    </article>
    <article class="reward-card">
      <header><span class="reward-icon">${icon('book', { size: 20 })}</span><h3>主线首通</h3><span class="reward-amount">${chapterReward !== null ? `+${chapterReward}/章` : ''}</span></header>
      <p class="reward-rule">主线每章第一次通关得钻石，每章只发一次。女主在主线正式入队时自动加入你的角色；如果已经抽到，就折成钻石。</p>
      ${chapterItems ? `<ul class="reward-list">${chapterItems}</ul>` : ''}
      ${joinRows || futureJoins ? `<ul class="reward-list joins">${joinRows}${futureJoins ? `<li class="faint">${icon('sparkle', { size: 12 })}其余 ${futureJoins} 位女主：入队章节上线后自动生效</li>` : ''}</ul>` : ''}
      <div class="reward-foot"><span class="muted">已首通 ${cleared.size} 章</span><a class="button secondary small" href="/story.html">${icon('moon', { size: 14 })}前往主线</a></div>
    </article>
    <article class="reward-card">
      <header><span class="reward-icon">${icon('deck', { size: 20 })}</span><h3>卡牌对战</h3><span class="reward-amount">${winReward !== null ? `+${winReward}/胜` : ''}</span></header>
      <p class="reward-rule">实验模式。${winCap ? `每天前 ${winCap} 场胜利各得 ${winReward} 钻石；之后照常可以对战，只是不再发钻石。` : '卡牌对战胜利可得钻石，每天有上限。'}</p>
      ${pips ? `<div class="win-meter" aria-label="今日奖励胜场 ${winsToday}/${winCap}">${pips}<span class="muted">今日 ${winsToday}/${winCap}</span></div>` : ''}
      <div class="reward-foot"><span class="muted">规则仍在调整</span><a class="button secondary small" href="/cards.html">${icon('battle', { size: 14 })}进入卡牌对战</a></div>
    </article>
    <article class="reward-card reward-uses">
      <header><span class="reward-icon">${icon('diamond', { size: 20 })}</span><h3>钻石用途</h3><span class="reward-amount">${diamondBalance() ?? '—'}</span></header>
      <ul class="reward-list plain">
        <li>${icon('sparkle', { size: 12 })}召唤：单抽 ${costs?.single ?? '—'} · 十连 ${costs?.ten ?? '—'}（召唤只收钻石）</li>
        <li>${icon('pack', { size: 12 })}卡牌开包：单包 ${pack?.costSingle ?? '—'} · 十连 ${pack?.costTen ?? '—'}</li>
        <li>${icon('refresh', { size: 12 })}召唤重复补偿：${dupText}</li>
      </ul>
      <div class="reward-foot"><span class="muted">当前余额</span><button class="button secondary small" type="button" data-nav="gacha">${icon('sparkle', { size: 14 })}去召唤</button></div>
    </article>`;
}

// 签到状态 / 余额变化后，局部刷新导航栏钻石、标题页签到条和钻石页奖励卡（按钮靠事件委托，不用重新绑定）
function refreshRewardWidgets() {
  const chip = document.querySelector('.nav-diamond');
  if (chip) chip.innerHTML = diamondChipHtml();
  const strip = document.querySelector('#titleDaily');
  if (strip) strip.innerHTML = dailyStripHtml();
  const wallet = document.querySelector('#gachaWallet');
  if (wallet) wallet.innerHTML = gachaWalletHtml();
  const panel = document.querySelector('#rewardsPanel');
  if (panel) {
    panel.innerHTML = rewardsPanelHtml();
    panel.querySelectorAll('[data-nav]').forEach((btn) => btn.addEventListener('click', () => { screen = btn.dataset.nav; beep('click'); render(); }));
  }
}

// 账户在服务器上已不存在（重启且未持久化）时，丢掉本地缓存的账户再走一次 ensureAccount（会重建并提示）
async function withAccountRetry(fn) {
  await ensureAccount();
  try {
    return await fn();
  } catch (error) {
    if (error.status !== 404 || error.code !== 'NO_ACCOUNT') throw error;
    playerAccount = null;
    await ensureAccount();
    return fn();
  }
}

async function loadRewardStatus() {
  if (!playerId) return null;
  const r = await withAccountRetry(() => apiGet(`/api/rewards/status?playerId=${encodeURIComponent(playerId)}`));
  rewardStatus = r;
  if (playerAccount && Number.isFinite(r.diamonds)) playerAccount.diamonds = r.diamonds;
  refreshRewardWidgets();
  return r;
}

let dailyClaiming = false;

async function claimDailyReward() {
  if (dailyClaiming) return;
  dailyClaiming = true;
  try {
    const r = await withAccountRetry(() => apiPost('/api/rewards/daily', { playerId }));
    playerAccount = r.account || playerAccount;
    showToast(r.message || (r.granted ? `签到成功：+${r.diamonds} 钻石` : '今天已经签到过了。'));
    beep(r.granted ? 'win' : 'click');
    await loadRewardStatus();
  } catch (e) {
    showToast(e.message, 'error');
    beep('error');
  } finally {
    dailyClaiming = false;
  }
}

async function loadShop() {
  loadShopContext();
  if (!demoToolsEnabled()) return;
  try {
    const data = await apiGet('/api/membership/tiers');
    const grid = document.querySelector('#membershipGrid');
    const dGrid = document.querySelector('#diamondGrid');
    if (grid) {
      grid.innerHTML = data.tiers.map((t) => `
        <div class="membership-card tier-${t.id}">
          <div class="tier-badge">${icon(TIER_ICON[t.id] || 'shield', { size: 40 })}</div>
          <h3>${escapeHtml(t.name)}</h3>
          <div class="tier-price">¥${t.price}<span>/月 · 标价</span></div>
          <div class="tier-credit">每日 ${t.dailyCredit} Credit</div>
          <ul class="tier-perks">${t.perks.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>
          <button class="button primary full" data-tier="${t.id}">演示：免费开通</button>
        </div>`).join('');
      grid.querySelectorAll('[data-tier]').forEach((btn) => {
        btn.addEventListener('click', () => purchaseMembershipTier(btn.dataset.tier));
      });
    }
    if (dGrid) {
      dGrid.innerHTML = data.packs.map((p) => `
        <div class="diamond-card">
          <div class="diamond-amount">${icon('diamond', { size: 22, title: '钻石' })} ${p.diamonds}</div>
          ${p.bonus ? `<div class="diamond-bonus">+${p.bonus} 赠送</div>` : ''}
          <div class="diamond-price">标价 ¥${p.price}</div>
          <button class="button secondary full" data-pack="${p.id}">演示：免费领取</button>
        </div>`).join('');
      dGrid.querySelectorAll('[data-pack]').forEach((btn) => {
        btn.addEventListener('click', () => purchaseDiamondPack(btn.dataset.pack));
      });
    }
  } catch (e) { showToast(e.message, 'error'); }
}

async function purchaseMembershipTier(tierId) {
  try {
    await ensureAccount();
    const r = await apiPost('/api/membership/purchase', { playerId, tierId });
    playerAccount = r.account || playerAccount;
    showToast(`演示发放（未扣款）：${r.message || '会员已开通。'}`);
    beep('win');
    refreshCredit();
  } catch (e) { showToast(e.message, 'error'); }
}

async function purchaseDiamondPack(packId) {
  try {
    await ensureAccount();
    const r = await apiPost('/api/diamonds/purchase', { playerId, packId });
    playerAccount = r.account || playerAccount;
    showToast(`演示发放（未扣款）：${r.message || '钻石已到账。'}`);
    beep('win');
    loadRewardStatus().catch(() => refreshRewardWidgets());
  } catch (e) { showToast(e.message, 'error'); }
}

/* ═══ 抽卡页面 ═══ */
// 召唤只收钻石（核#14，提案第八节#44）：Credit 只用于 AI 对话；价格以 /api/gacha/pools 的 costs.diamonds 为准
const GACHA_FALLBACK_COSTS = { single: 80, ten: 720 };
// 封存卡统一的名字（与服务器 game/gacha.mjs 的 SEALED_TEXT 相同）
const SEALED_NAME = '？？？';

function gachaCostText(count) {
  const costs = gachaPoolsCache?.costs?.diamonds || GACHA_FALLBACK_COSTS;
  return `${count === 10 ? '十连' : '单抽'} · ${costs[count === 10 ? 'ten' : 'single']} 钻石`;
}

function gachaWalletHtml() {
  const diamonds = diamondBalance();
  return `<span>${icon('diamond', { size: 15 })}钻石 ${diamonds ?? '—'}</span>`;
}

function gachaPage() {
  return `${navBar()}
    <main class="page-content">
      <div class="page-header"><div class="eyebrow">SUMMON · 星轨召唤</div><h1>召唤系统</h1>
        <p class="muted">角色池：8 位女主 · 服饰池：常驻服饰 × 8 位女主（四类节庆服装已转为典藏，不在池中）· 第 90 抽必出 5★。召唤只收钻石。还没在主线登场的女主和她的服装显示为剪影，通关她登场的那一章后揭晓；女主在主线正式入队时会自动加入，重复抽到的会折成钻石。</p>
      </div>
      <div class="gacha-tabs">
        <button class="gacha-tab ${currentGachaPool === 'character' ? 'active' : ''}" data-pool="character">角色池</button>
        <button class="gacha-tab ${currentGachaPool === 'costume' ? 'active' : ''}" data-pool="costume">服饰池</button>
        <button class="gacha-tab ${currentGachaPool === 'skill' ? 'active' : ''}" data-pool="skill">秘技召唤</button>
      </div>
      <section class="gacha-pool" id="gachaPool"><div class="loader">加载中…</div></section>
      <div class="gacha-pay">
        <div class="gacha-wallet" id="gachaWallet">${gachaWalletHtml()}</div>
      </div>
      <section class="gacha-actions">
        <button class="button primary large" id="gachaSingle">${gachaCostText(1)}</button>
        <button class="button secondary large" id="gachaTen">${gachaCostText(10)}</button>
      </section>
      <section class="gacha-actions gacha-ticket-actions" id="gachaTicketActions" ${currentGachaPool === 'skill' ? '' : 'hidden'}>
        <button class="button secondary" id="gachaTicket1" type="button">${icon('scroll', { size: 15 })}用券单抽</button>
        <button class="button secondary" id="gachaTicket10" type="button">${icon('scroll', { size: 15 })}用券十连</button>
      </section>
      <p class="gacha-rates-link"><button class="button ghost small" id="gachaRatesJump" type="button">${icon('chart', { size: 15 })}查看概率公示</button></p>
      <section class="gacha-result" id="gachaResult" style="display:none"></section>
      <section class="gacha-rates" id="gachaRates" aria-labelledby="gachaRatesTitle"><div class="loader">加载中…</div></section>
    </main>`;
}

/* 概率公示（契约 K-11）：rates[池][稀有度] 是该稀有度的总概率，同稀有度的条目等概率，
   所以单个条目的概率 = rates[池][稀有度] ÷ 该稀有度条目数。
   池里没有某个稀有度时，服务端会落到池内最低稀有度，这里同样把那部分概率并进最低稀有度，保证公示与实际一致。 */
function gachaRateRows(items, rates = {}) {
  const byRarity = new Map();
  items.forEach((item) => {
    const rarity = Number(item.rarity) || 3;
    if (!byRarity.has(rarity)) byRarity.set(rarity, []);
    byRarity.get(rarity).push(item);
  });
  const present = [...byRarity.keys()].sort((a, b) => b - a);
  if (!present.length) return [];
  const lowest = present[present.length - 1];
  const totals = new Map(present.map((rarity) => [rarity, 0]));
  Object.entries(rates).forEach(([rarity, rate]) => {
    const key = totals.has(Number(rarity)) ? Number(rarity) : lowest;
    totals.set(key, totals.get(key) + (Number(rate) || 0));
  });
  return present.map((rarity) => {
    const list = byRarity.get(rarity);
    const total = totals.get(rarity) || 0;
    return { rarity, items: list, total, each: list.length ? total / list.length : 0 };
  });
}

function formatRate(value) {
  const percent = value * 100;
  const digits = percent >= 10 ? 1 : percent >= 1 ? 2 : 3;
  return `${Number(percent.toFixed(digits))}%`;
}

function gachaRatesHtml(poolId, data) {
  const isCostume = poolId === 'costume';
  const items = isCostume ? data.costumes || [] : data.characters || [];
  const rows = gachaRateRows(items, data.rates?.[poolId] || {});
  const pity = Number(data.pity) || 90;
  return `
    <h2 class="section-title" id="gachaRatesTitle">概率公示 · ${isCostume ? '服饰池' : '角色池'}</h2>
    <p class="muted gacha-rates-note">以下为每次召唤的基础概率，同一稀有度内各条目概率相同。保底：本池连续 ${pity - 1} 次未出 5★ 时，第 ${pity} 次必出 5★（出 5★ 后计数重置）。概率按四舍五入显示。尚未登场的女主（及她的服装）同样在池中，名称以「？？？」显示。</p>
    <div class="rates-table" role="table" aria-label="${isCostume ? '服饰池' : '角色池'}概率">
      <div class="rates-row rates-head" role="row"><span role="columnheader">稀有度</span><span role="columnheader">合计</span><span role="columnheader">单个条目</span><span role="columnheader">条目</span></div>
      ${rows.map((row) => `<div class="rates-row rarity-${row.rarity}" role="row">
        <span role="cell" class="rates-rarity">${starsHtml(row.rarity, 5)}<b>${row.rarity}★</b></span>
        <span role="cell" class="rates-total">${formatRate(row.total)}</span>
        <span role="cell" class="rates-each">${formatRate(row.each)} <small>× ${row.items.length}</small></span>
        <span role="cell" class="rates-items">${row.items.map((item) => `<span${item.sealed ? ` title="${escapeHtml(item.debutLabel || '尚未登场')}"` : ''}>${escapeHtml(item.name || item.id)}</span>`).join('')}</span>
      </div>`).join('')}
    </div>
    ${duplicateNoteHtml(data)}`;
}

// 重复补偿公示：抽到已拥有的条目按稀有度折成钻石（/api/gacha/pools 的 duplicateCompensation）
function duplicateNoteHtml(data) {
  const dup = data.duplicateCompensation || {};
  const entries = Object.entries(dup).sort(([a], [b]) => b - a);
  if (!entries.length) return '';
  return `<p class="muted gacha-rates-note gacha-dup-note">${icon('diamond', { size: 14 })}重复补偿：抽到已经拥有的角色或服装（包括同一次十连里的第二份），按稀有度折成钻石：${entries.map(([rarity, value]) => `${rarity}★ +${value}`).join(' · ')}。主线入队时已经拥有的女主也按这张表补偿。</p>`;
}

let currentGachaPool = 'character';

const GACHA_RARITY_LABEL = { 5: 'SSR', 4: 'SR', 3: 'R' };

function costumeTypeOf(item) {
  return item.type || String(item.id || '').split('_').pop();
}

let gachaPoolsCache = null;

/* 卡池的对外视图跟着玩家的主线进度走（登场闸门，核#14 提案第八节#43）：带上 playerId，服务器才按本账户
   已首通的章节揭开女主；缓存只给同一个账户用（没有账户时是零进度：所有人都是剪影）。 */
async function fetchGachaPools() {
  const forPlayer = playerId || null;
  const data = await apiGet(`/api/gacha/pools${forPlayer ? `?playerId=${encodeURIComponent(forPlayer)}` : ''}`);
  gachaPoolsCache = { ...data, forPlayer };
  return gachaPoolsCache;
}

function cachedGachaPools() {
  return gachaPoolsCache && gachaPoolsCache.forPlayer === (playerId || null) ? Promise.resolve(gachaPoolsCache) : fetchGachaPools();
}

/* 封存卡：还没登场的女主（和她的服装）只给剪影与「第N章登场」——不加载立绘，名字写成「？？？」。
   剪影是纯 CSS 画的通用人形（styles.css 的 .is-silhouette），不带任何角色特征。 */
function silhouetteThumb(cls, label = '尚未登场') {
  return `<span class="face-crop ${cls} is-silhouette" role="img" aria-label="${escapeHtml(label)}"><span class="silhouette-figure" aria-hidden="true"></span><span class="silhouette-mark" aria-hidden="true">?</span></span>`;
}

// 「第四章登场」：章节已上线时用目录里的章名，否则用服务器给的「第13章登场」
function debutText(item, index = []) {
  const chapterId = item?.unlockChapter;
  if (chapterId && index.some((ch) => ch.id === chapterId)) return `${mainlineChapterLabel(chapterId, index)}登场`;
  return item?.debutLabel || '尚未登场';
}

// 召唤按钮上的价格与钱包（只有钻石）
function updateGachaButtons() {
  const single = document.querySelector('#gachaSingle');
  const ten = document.querySelector('#gachaTen');
  if (single) single.textContent = gachaCostText(1);
  if (ten) ten.textContent = gachaCostText(10);
  const wallet = document.querySelector('#gachaWallet');
  if (wallet) wallet.innerHTML = gachaWalletHtml();
}

// 角色卡片下方的获得方式：未登场 / 已拥有 / 主线某章入队自动获得（章节已上线时写出章节）/ 召唤获得
function heroineSourceHtml(c, data, index) {
  const owned = (playerAccount?.ownedCharacters || []).includes(c.id);
  if (c.sealed) return `<div class="gacha-free is-sealed">${icon('lock', { size: 12 })}${escapeHtml(debutText(c, index))}${owned ? ' · 已收入收藏' : ''}</div>`;
  if (owned) return `<div class="gacha-free is-owned">${icon('check', { size: 12 })}已拥有 · 重复折钻石</div>`;
  const joinChapter = data.heroineJoins?.[c.id] || c.joinChapter;
  if (joinChapter && index.some((ch) => ch.id === joinChapter)) {
    return `<div class="gacha-free">${icon('book', { size: 12 })}主线${escapeHtml(mainlineChapterLabel(joinChapter, index))}入队自动获得</div>`;
  }
  return `<div class="gacha-free">${icon('sparkle', { size: 12 })}召唤或主线入队获得</div>`;
}

async function loadGachaPool() {
  try {
    const [data, index] = await Promise.all([fetchGachaPools(), loadMainlineIndex()]);
    updateGachaButtons();
    const pool = document.querySelector('#gachaPool');
    if (!pool) return;
    const ratesBox = document.querySelector('#gachaRates');
    if (currentGachaPool === 'skill') {
      if (ratesBox) ratesBox.innerHTML = skillRatesHtml(data.skill);
      pool.innerHTML = skillPoolHtml(data.skill);
      bindSkillPoolEvents();
      return;
    }
    if (ratesBox) ratesBox.innerHTML = gachaRatesHtml(currentGachaPool, data);
    if (currentGachaPool === 'character') {
      pool.innerHTML = `<div class="gacha-grid">${data.characters.map((c) => `
        <div class="gacha-char-card rarity-${c.rarity}${c.sealed ? ' is-sealed' : ''}">
          ${c.sealed
            ? silhouetteThumb('gacha-char-avatar', `尚未登场的女主 · ${debutText(c, index)}`)
            : faceThumb(c.portrait || ART.portrait(c.id), { cls: 'gacha-char-avatar', alt: c.name })}
          <div class="gacha-char-name">${escapeHtml(c.name)}</div>
          <div class="gacha-char-title">${c.sealed ? '尚未登场' : `${escapeHtml(c.title)} · ${escapeHtml(c.element || '')}`}</div>
          <div class="gacha-stars">${starsHtml(c.rarity, 5)}</div>
          ${heroineSourceHtml(c, data, index)}
        </div>`).join('')}</div>`;
    } else {
      const characters = Object.fromEntries(data.characters.map((c) => [c.id, c]));
      const types = [...new Set(data.costumes.map(costumeTypeOf))];
      pool.innerHTML = types.map((type) => {
        const items = data.costumes.filter((c) => costumeTypeOf(c) === type);
        const typeLabel = items[0]?.name?.split('·')[1] || type;
        return `<div class="costume-type-group"><h3>${icon(COSTUME_TYPE_META[type]?.icon || 'dress', { size: 18 })}${escapeHtml(typeLabel)}<span class="gacha-stars">${starsHtml(items[0]?.rarity || 3)}</span></h3>
          <div class="gacha-grid small">${items.map((c) => c.sealed ? `
            <div class="gacha-costume-card rarity-${c.rarity} is-sealed" title="${escapeHtml(`${c.name}（${debutText(c, index)}）`)}">
              ${silhouetteThumb('costume-thumb', `${c.name} · ${debutText(c, index)}`)}
              <div class="gacha-char-name">${escapeHtml(SEALED_NAME)}</div>
              <div class="gacha-char-title">${escapeHtml(debutText(c, index))}</div>
            </div>` : `
            <div class="gacha-costume-card rarity-${c.rarity}" title="${escapeHtml(c.description || c.name)}">
              ${faceThumb(c.file || ART.costume(c.characterId, type), { cls: 'costume-thumb', alt: c.name, fallback: ART.portrait(c.characterId), lazy: true })}
              <div class="gacha-char-name">${escapeHtml(String(characters[c.characterId]?.name || c.characterId).split('·')[0])}</div>
              <div class="gacha-char-title">${escapeHtml(typeLabel)}</div>
            </div>`).join('')}</div></div>`;
      }).join('');
    }
  } catch (e) { showToast(e.message, 'error'); }
}

// 抽卡后重新读取账户（拥有的角色），用来标注「需先拥有角色」的服装
async function reloadAccount() {
  if (!playerId) return;
  try {
    const r = await apiGet(`/api/account?playerId=${encodeURIComponent(playerId)}`);
    playerAccount = r.account;
  } catch { /* 标注是辅助信息，读取失败就不标 */ }
}

let gachaPulling = false;

async function doGachaPull(count, payWith = 'diamonds') {
  if (gachaPulling) return;
  gachaPulling = true;
  try {
    await ensureAccount();
    // 秘技召唤可以用券（payWith: 'tickets'）；角色池、服饰池只收钻石
    const r = currentGachaPool === 'skill'
      ? await apiPost('/api/gacha/pull', { playerId, pool: 'skill', count, payWith })
      : await apiPost('/api/gacha/pull', { playerId, pool: currentGachaPool, count });
    if (r.pool === 'skill') {
      if (rewardStatus && Number.isFinite(r.balance?.diamonds)) rewardStatus.diamonds = r.balance.diamonds;
      showSkillPullResult(r);
      refreshRewardWidgets();
      updateGachaButtons();
      loadGachaPool();
      return;
    }
    const [chapters] = await Promise.all([loadMainlineIndex(), reloadAccount()]);
    if (rewardStatus && Number.isFinite(r.balance?.diamonds)) rewardStatus.diamonds = r.balance.diamonds;
    const ownedCharacters = new Set(playerAccount?.ownedCharacters || []);
    const resultEl = document.querySelector('#gachaResult');
    if (resultEl && r.results) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `<h3>召唤结果</h3><div class="gacha-results-grid">${r.results.map((item, index) => {
        const rarity = item.rarity || 3;
        const isCostume = Boolean(item.characterId);
        const src = isCostume ? (item.file || ART.costume(item.characterId, costumeTypeOf(item))) : (item.portrait || ART.portrait(item.id));
        const needsCharacter = isCostume && !item.sealed && !ownedCharacters.has(item.characterId);
        return `
        <div class="gacha-result-card rarity-${rarity}${item.sealed ? ' is-sealed' : ''}" style="--delay:${index * 70}ms">
          <span class="result-rarity">${GACHA_RARITY_LABEL[rarity] || 'R'}</span>
          ${item.isNew === true ? '<span class="result-new">NEW</span>' : ''}
          ${item.sealed
            ? silhouetteThumb('result-thumb', `${item.name || SEALED_NAME} · ${debutText(item, chapters)}`)
            : faceThumb(src, { cls: 'result-thumb', alt: item.name || item.id, fallback: ART.portrait(isCostume ? item.characterId : item.id) })}
          <div class="result-name">${escapeHtml(item.name || item.id)}</div>
          <div class="gacha-stars">${starsHtml(rarity)}</div>
          ${item.duplicate ? `<div class="result-dup">${icon('diamond', { size: 11 })}重复 · +${Number(item.compensation) || 0} 钻石</div>` : ''}
          ${item.sealed ? `<div class="result-note">${icon('lock', { size: 11 })}${escapeHtml(debutText(item, chapters))}</div>` : ''}
          ${needsCharacter ? `<div class="result-note">${icon('lock', { size: 11 })}需先拥有角色</div>` : ''}
        </div>`;
      }).join('')}</div>
        <p class="muted">消耗 ${r.cost} 钻石${r.compensation?.diamonds ? ` · 重复补偿 +${r.compensation.diamonds} 钻石` : ''} · 保底计数 ${r.pity || 0}/${Number(gachaPoolsCache?.pity) || 90}${r.results.some((item) => item.characterId && !ownedCharacters.has(item.characterId)) ? ' · 未拥有角色的服装已收入换衣间「待解锁角色」' : ''}${r.results.some((item) => item.sealed) ? ' · 尚未登场的女主已收入收藏，通关她登场的那一章后揭晓' : ''}</p>`;
      // 结果区在卡池和按钮下方，桌面/手机都在首屏以外：滚到结果，避免「点了没反应」
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      beep(r.results.some((i) => (i.rarity || 3) >= 5) ? 'win' : 'skill');
    }
    refreshRewardWidgets();
    updateGachaButtons();
    // 角色卡片上的「已拥有」随这次召唤更新（只重绘卡池，不动结果区）
    if (currentGachaPool === 'character') loadGachaPool();
  } catch (e) {
    showToast(e.message, 'error');
    beep('error');
  } finally {
    gachaPulling = false;
  }
}

/* ═══ 换衣页面 ═══ */
function costumePage() {
  return `${navBar()}
    <main class="page-content">
      <div class="page-header"><div class="eyebrow">WARDROBE · 换衣间</div><h1>服饰更换</h1>
        <p class="muted">为已拥有的女主更换皮肤（主线入队或召唤获得）。服装通过「召唤 · 服饰池」获取；抽到了服装但还没有该角色时，服装会先收进「待解锁角色」；还没在主线登场的女主先收在「尚未登场」里，以剪影显示。「典藏」是已退出常驻服饰池的节庆服装：已经拥有的照样能穿，对应番外上线时会限时复刻。服装对应的番外 · 敬请期待。</p>
      </div>
      <section class="costume-section" id="costumeSection"><div class="loader">加载中…</div></section>
    </main>`;
}

// 服装 id 形如 lia_maid：前段是角色，末段是服装类型
function costumeCharacterOf(costumeId) {
  return String(costumeId).split('_')[0];
}

function costumeTypeOfId(costumeId) {
  return String(costumeId).split('_').pop();
}

/* 典藏（决定#31）：退出常驻抽取表的服装类型——已经拥有的照样能穿，对应番外上线时限时复刻。
   /api/costume 的 types 是完整目录，costumePool 是常驻服饰池（抽得到的条目，按登场闸门给视图，sealed 的也带 type）：
   在 types 里、却不在常驻池里的类型就是典藏。服务器没给常驻池时不分组。 */
function archiveCostumeTypes(types, costumePool) {
  const standing = new Set((costumePool || []).filter((c) => c.status !== 'archive').map(costumeTypeOf));
  if (!standing.size) return new Set();
  return new Set(Object.keys(types).filter((type) => !standing.has(type)));
}

function archiveTagHtml(type, archived) {
  return archived.has(type) ? '<span class="costume-archive-tag">典藏</span>' : '';
}

// 「待解锁角色」：已经抽到服装、但还没有这名角色（不能穿戴，只展示）
function pendingCostumesHtml(pendingByChar, charInfoMap, types, archived) {
  if (!pendingByChar.size) return '';
  return `<section class="costume-pending" aria-labelledby="pendingCostumesTitle">
    <h2 class="section-title" id="pendingCostumesTitle">待解锁角色</h2>
    <p class="muted">这些服装已经收进衣柜，获得该角色后可穿戴。</p>
    <div class="pending-grid">${[...pendingByChar].map(([charId, costumeIds]) => {
      const ch = charInfoMap[charId];
      const name = ch?.name || charId;
      return `<div class="pending-char">
        <div class="pending-head">
          ${faceThumb(ch?.portrait || ART.portrait(charId), { cls: 'pending-avatar', alt: `${name}（未拥有）`, lazy: true })}
          <div class="pending-name"><strong>${escapeHtml(name)}</strong><span>${icon('lock', { size: 12 })}获得该角色后可穿戴</span></div>
        </div>
        <div class="pending-costumes">${costumeIds.map((costumeId) => {
          const type = costumeTypeOfId(costumeId);
          const label = types[type] || type;
          return `<div class="pending-costume" title="${escapeHtml(`${name} · ${label}（获得该角色后可穿戴）`)}">
            ${faceThumb(ART.costume(charId, type), { cls: 'slot-thumb', alt: `${name} · ${label}`, fallback: ART.portrait(charId), lazy: true })}
            <span class="slot-label">${icon(COSTUME_TYPE_META[type]?.icon || 'dress', { size: 14 })}${escapeHtml(label)}</span>${archiveTagHtml(type, archived)}
          </div>`;
        }).join('')}</div>
      </div>`;
    }).join('')}</div>
  </section>`;
}

// 「尚未登场」：已经收进收藏、但她还没在主线登场的女主与服装（封存卡：剪影 + 「第N章登场」，通关那一章后才能换装）
function sealedCollectionHtml(sealedByChar, charInfoMap, types, index, archived) {
  if (!sealedByChar.size) return '';
  // 按登场章先后排（ch011 在 ch013 之前）
  const debutOrder = (charId) => String(charInfoMap[charId]?.unlockChapter || '');
  const groups = [...sealedByChar].sort(([a], [b]) => debutOrder(a).localeCompare(debutOrder(b)));
  return `<section class="costume-pending costume-sealed" aria-labelledby="sealedCollectionTitle">
    <h2 class="section-title" id="sealedCollectionTitle">尚未登场</h2>
    <p class="muted">已经收进收藏：通关她在主线登场的那一章后，名字和立绘才会揭晓，到时就能在这里换装。</p>
    <div class="pending-grid">${groups.map(([charId, entry]) => {
      const debut = debutText(charInfoMap[charId], index);
      return `<div class="pending-char is-sealed">
        <div class="pending-head">
          ${silhouetteThumb('pending-avatar', `尚未登场的女主 · ${debut}`)}
          <div class="pending-name"><strong>${escapeHtml(SEALED_NAME)}</strong><span>${icon('lock', { size: 12 })}${escapeHtml(debut)}${entry.owned ? ' · 角色已收藏' : ''}</span></div>
        </div>
        ${entry.costumes.length ? `<div class="pending-costumes">${entry.costumes.map((costumeId) => {
          const type = costumeTypeOfId(costumeId);
          const label = types[type] || type;
          return `<div class="pending-costume" title="${escapeHtml(`${SEALED_NAME} · ${label}（${debut}）`)}">
            ${silhouetteThumb('slot-thumb', `${SEALED_NAME} · ${label}`)}
            <span class="slot-label">${icon(COSTUME_TYPE_META[type]?.icon || 'dress', { size: 14 })}${escapeHtml(label)}</span>${archiveTagHtml(type, archived)}
          </div>`;
        }).join('')}</div>` : ''}
      </div>`;
    }).join('')}</div>
  </section>`;
}

async function loadCostumes() {
  try {
    await ensureAccount();
    const [data, pools, index] = await Promise.all([
      apiGet(`/api/costume?playerId=${encodeURIComponent(playerId)}`),
      cachedGachaPools(),
      loadMainlineIndex()
    ]);
    const section = document.querySelector('#costumeSection');
    if (!section) return;

    const ownedCostumes = [...new Set(data.ownedCostumes || [])];
    const equipped = data.equipped || {};
    const types = data.types || {};
    const branches = data.branches || {};
    const archived = archiveCostumeTypes(types, data.costumePool);
    const charInfoMap = Object.fromEntries((pools.characters || []).map((c) => [c.id, c]));
    const isSealed = (charId) => Boolean(charInfoMap[charId]?.sealed);
    // 拥有的角色（有角色资料的）；能在这里换装的只有已经登场的
    const ownedKnown = (data.ownedCharacters || []).filter((charId) => charInfoMap[charId]);
    const ownedChars = ownedKnown.filter((charId) => !isSealed(charId));
    const ownedCharSet = new Set(ownedChars);
    // 每一套已拥有的服装要么出现在角色的插槽里，要么在「待解锁角色」或「尚未登场」里，总数与顶部「服装 N 套」一致
    const pendingByChar = new Map();
    const sealedByChar = new Map();
    for (const charId of ownedKnown.filter(isSealed)) sealedByChar.set(charId, { owned: true, costumes: [] });
    ownedCostumes.forEach((costumeId) => {
      const charId = costumeCharacterOf(costumeId);
      if (isSealed(charId)) {
        if (!sealedByChar.has(charId)) sealedByChar.set(charId, { owned: false, costumes: [] });
        sealedByChar.get(charId).costumes.push(costumeId);
        return;
      }
      if (ownedCharSet.has(charId) && types[costumeTypeOfId(costumeId)]) return;
      if (!pendingByChar.has(charId)) pendingByChar.set(charId, []);
      pendingByChar.get(charId).push(costumeId);
    });
    const pendingCount = [...pendingByChar.values()].reduce((sum, list) => sum + list.length, 0);
    const sealedCostumeCount = [...sealedByChar.values()].reduce((sum, entry) => sum + entry.costumes.length, 0);
    const sealedCharCount = ownedKnown.length - ownedChars.length;
    const notes = [
      pendingCount ? `${pendingCount} 套待解锁角色` : '',
      sealedCostumeCount ? `${sealedCostumeCount} 套尚未登场` : ''
    ].filter(Boolean).join('、');

    // 顶部工具栏（「一键解锁」是演示工具，关闭时不显示）
    let html = `<div class="wardrobe-toolbar">
      <span class="muted" id="wardrobeSummary">已拥有角色 ${ownedKnown.length} 名${sealedCharCount ? `（其中 ${sealedCharCount} 名尚未登场）` : ''} · 服装 ${ownedCostumes.length} 套${notes ? `（其中 ${notes}）` : ''}</span>
      ${demoToolsEnabled() ? '<button class="button small" id="grantAllCostumes" type="button">演示：一键解锁全部服装</button>' : ''}
    </div>`;

    if (ownedChars.length === 0) {
      html += `<div class="wardrobe-empty">
        <div class="wardrobe-empty-icon">${icon('dress', { size: 44 })}</div>
        <h3>还没有可以换装的角色</h3>
        <p class="muted">女主在主线正式入队时会自动加入（例如通关主线第五章，第一位同伴入队）；也可以在「召唤 · 角色池」抽取。还没在主线登场的女主要等通关她登场的那一章，才能在这里换装。</p>
        <div class="wardrobe-empty-actions">
          <button class="button primary" type="button" data-wardrobe-nav="gacha">去召唤</button>
          <a class="button secondary" href="/story.html">${icon('moon', { size: 15 })}前往主线</a>
        </div>
      </div>`;
    }

    // 每个已拥有角色的换装区块
    html += ownedChars.map((charId) => {
      const ch = charInfoMap[charId];
      const equippedId = equipped[charId] || null;
      const equippedType = equippedId ? costumeTypeOfId(equippedId) : null;
      const equippedLabel = equippedType ? (types[equippedType] || equippedType) : null;
      const frameClass = equippedType ? (COSTUME_TYPE_META[equippedType]?.frame || '') : '';

      const slot = (type) => {
        if (type === 'default') {
          const isActive = !equippedId;
          return `<button class="costume-slot ${isActive ? 'active' : ''}" type="button" data-char="${charId}" data-costume="default" title="默认服装">
            ${faceThumb(ART.portrait(charId), { cls: 'slot-thumb', lazy: true })}
            <span class="slot-label">${icon('outfit-default', { size: 14 })}默认服装</span>${isActive ? '<span class="slot-wearing">穿着中</span>' : ''}
          </button>`;
        }
        const costumeId = `${charId}_${type}`;
        const owned = ownedCostumes.includes(costumeId);
        const isActive = equippedId === costumeId;
        const typeIcon = COSTUME_TYPE_META[type]?.icon || 'dress';
        return `<button class="costume-slot ${isActive ? 'active' : ''} ${owned ? '' : 'locked'}" type="button" data-char="${charId}" data-costume="${costumeId}" ${owned ? '' : 'disabled'}
          title="${owned ? '点击装备' : '未拥有 · 通过服饰召唤获取'}">
          ${owned
            ? faceThumb(ART.costume(charId, type), { cls: 'slot-thumb', fallback: ART.portrait(charId), lazy: true })
            : `<span class="slot-thumb slot-thumb-locked">${icon('lock', { size: 20 })}</span>`}
          <span class="slot-label">${icon(typeIcon, { size: 14 })}${escapeHtml(types[type])}</span>
          ${isActive ? '<span class="slot-wearing">穿着中</span>' : ''}
        </button>`;
      };
      // 常驻：默认服装 + 抽得到的类型（没拥有的显示锁）；典藏只列已经拥有的（抽不到，不摆锁着的空位），一套都没有就不显示这一组
      const typeIds = Object.keys(types);
      const slots = ['default', ...typeIds.filter((type) => !archived.has(type))].map(slot).join('');
      const archiveOwned = typeIds.filter((type) => archived.has(type) && ownedCostumes.includes(`${charId}_${type}`));
      const archiveGroup = archiveOwned.length ? `<div class="costume-archive" role="group" aria-label="典藏">
          <h4 class="costume-group-title">${icon('box', { size: 15 })}典藏<small>已退出常驻服饰池 · 已经拥有的照样能穿</small></h4>
          <div class="costume-grid">${archiveOwned.map(slot).join('')}</div>
        </div>` : '';

      const portraitSrc = equippedType ? ART.costume(charId, equippedType) : (ch.portrait || ART.portrait(charId));
      return `<div class="costume-char-block">
        <div class="wardrobe-main">
          <div class="wardrobe-portrait ${frameClass} ${aiPaintedClass(portraitSrc)}">
            <img ${imgSrcAttrs(paint(portraitSrc), true)} alt="${escapeHtml(ch.name)}${equippedLabel ? ` · ${escapeHtml(equippedLabel)}` : ''}" data-fallback="${ART.portrait(charId)}">
            ${paintBadge(portraitSrc)}
            ${equippedType ? `<span class="skin-badge" title="${escapeHtml(equippedLabel)}">${icon(COSTUME_TYPE_META[equippedType]?.icon || 'dress', { size: 18 })}</span>` : ''}
          </div>
          <div class="wardrobe-info">
            <h3>${escapeHtml(ch.name)}</h3>
            <p class="muted">${escapeHtml(ch.title || '')}</p>
            <p class="wardrobe-current">${equippedLabel ? `当前皮肤：<strong>${icon(COSTUME_TYPE_META[equippedType]?.icon || 'dress', { size: 16 })} ${escapeHtml(equippedLabel)}</strong>${archiveTagHtml(equippedType, archived)}` : `当前皮肤：<strong class="is-default">${icon('outfit-default', { size: 16 })} 默认服装</strong>`}</p>
            ${equippedType && branches[equippedType] ? `<p class="wardrobe-branch muted">${icon('scroll', { size: 14 })}<span>番外「${escapeHtml(branches[equippedType].title)}」· 敬请期待</span></p>` : ''}
          </div>
        </div>
        <div class="costume-grid">${slots}</div>
        ${archiveGroup}
      </div>`;
    }).join('');

    html += pendingCostumesHtml(pendingByChar, charInfoMap, types, archived);
    html += sealedCollectionHtml(sealedByChar, charInfoMap, types, index, archived);
    section.innerHTML = html;

    section.querySelectorAll('.costume-slot:not(.locked)').forEach((btn) => {
      btn.addEventListener('click', () => equipCostumeAction(btn.dataset.char, btn.dataset.costume));
    });
    section.querySelector('[data-wardrobe-nav]')?.addEventListener('click', (e) => { screen = e.currentTarget.dataset.wardrobeNav; render(); });
    section.querySelector('#grantAllCostumes')?.addEventListener('click', grantAllCostumesAction);
  } catch (e) { showToast(e.message, 'error'); }
}

async function grantAllCostumesAction() {
  try {
    await ensureAccount();
    const r = await apiPost('/api/costume/grant-all', { playerId });
    showToast(`已解锁 ${r.characters} 名角色与 ${r.costumes} 套服装（演示工具）`);
    beep('win');
    loadCostumes();
  } catch (e) { showToast(e.message, 'error'); }
}

async function equipCostumeAction(characterId, costumeId) {
  try {
    await ensureAccount();
    await apiPost('/api/costume/equip', { playerId, characterId, costumeId });
    showToast(costumeId === 'default' ? '已恢复默认服装' : '已换装');
    beep('skill');
    loadCostumes();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ═══ 设置页面 ═══ */
function settingsPage() {
  const isOpenAi = meta?.ai?.mode === 'openai';
  const adminEnabled = Boolean(meta?.admin?.enabled);
  return `${navBar()}
    <main class="page-content">
      <div class="page-header"><div class="eyebrow">SETTINGS · 系统设置</div><h1>AI 与偏好</h1></div>
      <section class="settings-section" aria-labelledby="aiRuntimeTitle">
        <h2 class="section-title" id="aiRuntimeTitle">当前 AI</h2>
        <div class="ai-runtime-card ${isOpenAi ? 'is-model' : 'is-offline'}">
          <div class="spread"><span class="muted">角色台词运行方式</span><strong id="aiRuntimeLabel">${escapeHtml(aiRuntimeLabel())}</strong></div>
          <p class="muted">${isOpenAi
            ? '由服务器代理的 OpenAI 兼容模型生成角色台词；模型超时、不可用或输出越权时，自动切回角色专属保底台词。'
            : '当前没有接入大模型：角色台词来自离线剧情保底引擎，零成本、可完整通关。接入本地模型的方法见游戏内「设置」对话框或 README。'}</p>
          <p class="muted">所有玩家共用服务器配置的 AI；按玩家切换模型尚未开放，所以这里不提供模型预设。</p>
        </div>
      </section>
      <section class="settings-section">
        <h2 class="section-title">声音</h2>
        <div class="settings-row"><span>音效反馈</span><button class="button ${soundEnabled ? 'primary' : 'secondary'}" id="settingsSoundToggle" type="button">${soundEnabled ? '开启' : '关闭'}</button></div>
      </section>
      ${adminEnabled ? `<section class="settings-section">
        <h2 class="section-title">后台管理</h2>
        <form class="admin-gate" id="adminForm" autocomplete="off">
          <p class="muted">运营仪表板需要管理口令（由服务器校验）。</p>
          <div class="admin-password-row">
            <input type="password" id="adminPassword" class="chat-input" placeholder="输入管理口令" maxlength="128" aria-label="管理口令" autocomplete="off">
            <button class="button secondary" id="adminUnlock" type="submit">进入后台</button>
          </div>
          <p class="admin-error" id="adminError" role="alert" hidden></p>
        </form>
      </section>` : ''}
    </main>`;
}

// B19：模型预设在按玩家路由实现之前不出现在设置页（/api/settings/ai 也不再下发预设）

/* ═══ 后台仪表板 ═══ */
function dashboardPage() {
  return `${navBar()}
    <main class="page-content">
      <div class="page-header"><div class="eyebrow">ADMIN · 运营仪表板</div><h1>数据监控</h1></div>
      <section class="dashboard-section" id="dashboardSection"><div class="loader">加载中…</div></section>
    </main>`;
}

async function loadDashboard() {
  // 没有在设置页输入过口令（或口令已失效）就回到设置页
  if (!adminKey) {
    screen = 'settings';
    render();
    return;
  }
  try {
    const data = dashboardData || await fetchDashboard(adminKey);
    dashboardData = null; // 解锁时预取的数据只用一次，之后每次进入都重新拉取
    const section = document.querySelector('#dashboardSection');
    if (!section) return;
    const d = data.dashboard;
    const rt = data.realtime;
    section.innerHTML = `
      <div class="dash-cards">
        <div class="dash-card"><div class="dash-value">${rt.onlineNow}</div><div class="dash-label">当前在线</div></div>
        <div class="dash-card"><div class="dash-value">${rt.todayActive}</div><div class="dash-label">今日活跃</div></div>
        <div class="dash-card"><div class="dash-value">${rt.todayNew}</div><div class="dash-label">今日新增</div></div>
        <div class="dash-card"><div class="dash-value">${rt.todaySessions}</div><div class="dash-label">今日会话</div></div>
        <div class="dash-card"><div class="dash-value">${data.totalAccounts}</div><div class="dash-label">总账户</div></div>
        <div class="dash-card"><div class="dash-value">${data.totalSessions}</div><div class="dash-label">活跃存档</div></div>
      </div>
      <h2 class="section-title" style="margin-top:24px">留存率</h2>
      <div class="dash-cards">
        <div class="dash-card accent"><div class="dash-value">${(d.retention?.d1 ?? 0)}%</div><div class="dash-label">次日留存</div></div>
        <div class="dash-card accent"><div class="dash-value">${(d.retention?.d7 ?? 0)}%</div><div class="dash-label">7日留存</div></div>
        <div class="dash-card accent"><div class="dash-value">${(d.retention?.d30 ?? 0)}%</div><div class="dash-label">30日留存</div></div>
      </div>
      <h2 class="section-title" style="margin-top:24px">近7日趋势</h2>
      <div class="dash-chart">${(d.last7days || []).map((day) => `
        <div class="chart-bar-wrap">
          <div class="chart-bar" style="height:${Math.max(4, (day.active / Math.max(1, d.dau)) * 100)}%"></div>
          <div class="chart-label">${escapeHtml(day.date?.slice(5) || '')}</div>
          <div class="chart-num">${day.active}</div>
        </div>`).join('')}
      </div>
      <h2 class="section-title" style="margin-top:24px">事件分布</h2>
      <div class="dash-events">${Object.entries(d.eventsByType || {}).map(([k, v]) => `<span class="pill">${escapeHtml(k)}: ${escapeHtml(v)}</span>`).join('')}</div>`;
  } catch (e) {
    if (e.status === 403 || e.status === 404) {
      adminKey = null;
      screen = 'settings';
      render();
    }
    showToast(e.status === 403 ? '管理口令已失效，请重新输入。' : e.message, 'error');
  }
}

/* ═══ 章节选择页面 ═══ */
function chaptersPage() {
  return `${navBar()}
    <main class="page-content">
      <div class="page-header"><div class="eyebrow">STORY · 剧本系统</div><h1>章节选择</h1>
        <p class="muted">主线「亚克的旅程」是正史，自由输入的视觉小说；「银轨号」是 IF 外传，人物身份与主线不同，不影响正史。</p>
      </div>
      <section class="chapters-section story-mainline" aria-labelledby="mainlineTitle">
        <h2 class="section-title" id="mainlineTitle">主线：亚克的旅程（正史）</h2>
        <div class="chapter-grid" id="mainlineChapters"><div class="loader">加载中…</div></div>
      </section>
      <h2 class="section-title chapters-side-title" id="sideTitle">外传：银轨号（IF 外传 · 剧本草稿）</h2>
      <div class="if-note" role="note">${icon('info', { size: 16 })}<p>以下是 IF 外传「银轨号」的剧本草稿，只能阅读，不能游玩；其中的人物身份、称号与经历只属于这个平行世界，正史以主线为准。可游玩的外传序章在标题页的「外传：银轨号」。</p></div>
      <section class="chapters-section" id="chaptersSection" aria-labelledby="sideTitle"><div class="loader">加载中…</div></section>
    </main>`;
}

// 主线 · 亚克篇章节目录（public/story/chapters/index.json），点开进入独立播放页 /story.html
async function loadMainlineChapters() {
  const box = document.querySelector('#mainlineChapters');
  if (!box) return;
  try {
    const items = await loadMainlineIndex();
    const done = store.json('moonlit:story:progress', {});
    box.innerHTML = items.length ? items.map((ch) => {
      const [label, name] = String(ch.title || ch.id).split('｜');
      return `
      <a class="chapter-card mainline-card" href="/story.html?chapter=${encodeURIComponent(ch.id)}">
        <div class="chapter-num">${String(ch.number ?? '').padStart(2, '0')}</div>
        <div class="chapter-info">
          <h3>${escapeHtml(name ? `${label}｜${name}` : label)}</h3>
          <span class="pill">${done[ch.id] ? `${icon('check', { size: 13 })}已完成` : `${icon('feather', { size: 13 })}自由输入 · 视觉小说`}</span>
        </div>
        ${icon('chevron-right', { size: 18, cls: 'mainline-go' })}
      </a>`;
    }).join('') : '<p class="muted">主线章节目录暂不可用。</p>';
  } catch {
    box.innerHTML = '<p class="muted">主线章节目录暂不可用。</p>';
  }
}

async function loadChapters() {
  loadMainlineChapters();
  try {
    const data = await apiGet('/api/scenario/index');
    const section = document.querySelector('#chaptersSection');
    if (!section) return;
    section.innerHTML = `<div class="chapter-grid">${data.chapters.map((ch) => `
      <button class="chapter-card" data-chapter="${ch.id}">
        <div class="chapter-num">${String(ch.id).padStart(2, '0')}</div>
        <div class="chapter-info">
          <h3>${escapeHtml(ch.title)}</h3>
          <p class="muted">${escapeHtml(ch.subtitle)}</p>
          <span class="pill">${icon('scroll', { size: 13 })}剧本草稿（只读） · ${ch.sceneCount} 场景</span>
        </div>
      </button>`).join('')}</div>`;
    section.querySelectorAll('[data-chapter]').forEach((btn) => {
      btn.addEventListener('click', () => openChapter(Number(btn.dataset.chapter)));
    });
  } catch (e) { showToast(e.message, 'error'); }
}

// 剧本 JSON 里的说话人是角色 id（lia / mia / serena / narrator），阅读器显示中文名
function speakerName(id) {
  if (id === 'narrator') return '旁白';
  return characterMeta(id)?.shortName || id;
}

async function openChapter(id) {
  try {
    const data = await apiGet(`/api/scenario/chapter/${id}`);
    const ch = data.chapter;
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = `
      <div class="gallery-card chapter-reader" role="dialog" aria-modal="true" aria-label="${escapeHtml(ch.title)}">
        <div class="gallery-header">
          <div class="eyebrow">IF 外传 · 银轨号 · CHAPTER ${String(id).padStart(2, '0')}</div>
          <h2>${escapeHtml(ch.title)}</h2>
          <span class="draft-tag">${icon('scroll', { size: 13 })}剧本草稿（只读）</span>
          <button class="icon-button modal-close" id="chapterClose" type="button" aria-label="关闭">${icon('close', { size: 18 })}</button>
        </div>
        <p class="reader-note">这是 IF 外传「银轨号」的剧本草稿，只能阅读；人物身份与主线正史不同。</p>
        <div class="chapter-scenes">
          ${(ch.scenes || []).map((scene) => `
            <div class="scene-block">
              <h4 class="scene-name">${escapeHtml(scene.name || scene.id)}</h4>
              <p class="scene-bg muted">${escapeHtml(scene.background || '')}</p>
              <div class="scene-events">${(scene.events || []).map((ev) => {
                if (ev.type === 'narration') return `<p class="ev-narration">${escapeHtml(ev.text)}</p>`;
                if (ev.type === 'dialogue') return `<p class="ev-dialogue"><strong>${escapeHtml(speakerName(ev.speaker))}：</strong>${escapeHtml(ev.text)}</p>`;
                // 阅读器只读：列出提示和全部选项，不能选择
                if (ev.type === 'choice') return `<div class="ev-choice-block">
                  <div class="ev-choice">${icon('chevron-right', { size: 14 })}${escapeHtml(ev.prompt || '选择')}</div>
                  ${(ev.options || []).length ? `<ol class="ev-options" aria-label="选项（只读）">${ev.options.map((option) => `<li>${escapeHtml(option.text || option.id)}</li>`).join('')}</ol>` : ''}
                </div>`;
                // 剧本里的描述本身常以「CG：」开头，显示时去掉重复前缀
                if (ev.type === 'cg') return `<p class="ev-cg">${icon('film', { size: 14 })}CG：${escapeHtml(String(ev.description || ev.unlockCg || '').replace(/^CG\s*[:：]\s*/, ''))}</p>`;
                return '';
              }).join('')}</div>
            </div>`).join('')}
        </div>
      </div>`;
    mountOverlay(overlay, '#chapterClose');
  } catch (e) { showToast(e.message, 'error'); }
}

// 叠层（CG 图库 / 章节阅读器）：点遮罩、关闭按钮或按 Esc 关闭；打开时焦点移到关闭按钮，关闭后还给原按钮
function mountOverlay(overlay, closeSelector) {
  const previousFocus = document.activeElement;
  const closeButton = overlay.querySelector(closeSelector);
  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKeydown);
    if (previousFocus?.isConnected) previousFocus.focus();
  };
  const onKeydown = (e) => { if (e.key === 'Escape') close(); };
  document.body.appendChild(overlay);
  closeButton?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKeydown);
  closeButton?.focus();
}

/* ═══ 账户工具 ═══ */
// 召唤 / 换衣 / 商店共用的玩家账户。同一时刻只建一次号（页面里常有两处同时调用）
let accountPromise = null;

function ensureAccount() {
  if (playerId && playerAccount) return Promise.resolve();
  accountPromise ||= loadOrCreateAccount().finally(() => { accountPromise = null; });
  return accountPromise;
}

async function loadOrCreateAccount() {
  const previousId = playerId;
  if (previousId) {
    try {
      const r = await apiGet(`/api/account?playerId=${encodeURIComponent(previousId)}`);
      playerAccount = r.account;
      afterAccountReady();
      return;
    } catch (error) {
      // 只有「账户不存在 / id 无效」才重建；网络或服务器错误照常抛出，避免误建新号
      if (error.status !== 404 && error.status !== 400) throw error;
    }
  }
  const name = state?.playerName || store.get('moonlit:name') || '旅行者';
  const r = await apiPost('/api/account/create', { playerName: name });
  playerAccount = r.account;
  playerId = r.account.id;
  creditMeter = null;
  rewardStatus = null;
  store.set('moonlit:playerId', playerId);
  if (previousId) showToast('账户已重置：服务器重启后旧账户已失效，已为你新建账户。', 'error');
  afterAccountReady();
}

// 账户就绪（读到或新建）后：导航栏钻石先显示账户余额，再异步读签到状态
function afterAccountReady() {
  refreshRewardWidgets();
  if (!rewardStatus) setTimeout(() => loadRewardStatus().catch(() => {}), 0);
}

async function refreshCredit() {
  if (!playerId) return;
  try {
    const r = await apiGet(`/api/credit?playerId=${encodeURIComponent(playerId)}`);
    creditMeter = r.meter;
    const navCredit = document.querySelector('.nav-credit-meter');
    if (navCredit) navCredit.innerHTML = creditMeterHtml();
    const wallet = document.querySelector('#gachaWallet');
    if (wallet) wallet.innerHTML = gachaWalletHtml();
  } catch { /* ignore */ }
}

async function boot() {
  app.innerHTML = '<main class="title-screen"><div class="loader" aria-label="加载中"></div></main>';
  let sessionLost = false;
  try {
    const [metaPayload] = await Promise.all([apiGet('/api/meta'), loadPaint()]);
    meta = metaPayload.meta;
    const sessionId = store.get('moonlit:session');
    if (sessionId) {
      try {
        const sessionPayload = await apiGet(`/api/session/${encodeURIComponent(sessionId)}`);
        state = sessionPayload.state;
        meta = sessionPayload.meta || meta;
        selectedCharacterId = state.selectedCharacterId || 'lia';
        rememberCgUnlocks(state); // 读档时已有的解锁不再弹提示
        rememberGaidenProgress(state);
      } catch (error) {
        // 404：服务器上已没有这个存档（服务器重启且未持久化）；400：本地记录的 id 已损坏。其他错误保留本地记录，下次再试
        if (error.status === 404 || error.status === 400) {
          store.remove('moonlit:session');
          sessionLost = true;
        }
      }
    }
  } catch (error) {
    app.innerHTML = `<main class="title-screen"><section class="modal-card" style="max-width:620px;margin:auto"><div class="eyebrow">SERVER OFFLINE</div><h1>列车没有连上轨道</h1><p class="muted">${escapeHtml(error.message)}</p><p>请在项目目录运行 <code>npm start</code>，再打开终端显示的网址。</p></section></main>`;
    return;
  }
  render();
  if (sessionLost) showToast('服务器重启后旧存档已失效，请重新开始外传。', 'error');
}

/* ═══ 秘技召唤（池 skill；game/skill-gacha.mjs，技能稿 3.2）═══ */
const TIER_META = { white: { label: '白', color: '#dfe3ec' }, green: { label: '绿', color: '#5fcf8f' }, blue: { label: '蓝', color: '#5b8cff' }, purple: { label: '暮紫', color: '#a46bff' }, red: { label: '赤月', color: '#e23a4e' } };
const TIER_PIPS = { white: 1, green: 2, blue: 3, purple: 4, red: 5 };
const MATERIAL_NAMES = { white: '练习手记', green: '实战手记', blue: '源律残章', purple: '暮紫秘页', red: '赤月秘页' };
const OWNER_ICON = { hero: 'sword', lia: 'shield', mia: 'wrench', serena: 'moon', evelyn: 'feather', aila: 'bolt', freya: 'frost', ophelia: 'dragon', lilith: 'dagger' };

function tierBadge(tier) {
  const m = TIER_META[tier] || TIER_META.white;
  return `<span class="sk-tier tier-${tier}" style="--tier:${m.color}">${'◆'.repeat(TIER_PIPS[tier] || 1)}<b>${m.label}</b></span>`;
}
function skillCardHtml(s, { compact = false, extra = '' } = {}) {
  if (s.sealed) return `<div class="skill-card tier-${s.tier} is-sealed" style="--tier:${TIER_META[s.tier].color}">${tierBadge(s.tier)}<div class="skill-name">${escapeHtml(SEALED_NAME)}</div><div class="skill-desc muted">${icon('lock', { size: 12 })}她入队后揭晓</div></div>`;
  return `<div class="skill-card tier-${s.tier}${s.owned === false ? ' is-locked' : ''}" style="--tier:${TIER_META[s.tier].color}">
    <div class="skill-head">${tierBadge(s.tier)}<span class="skill-owner">${icon(OWNER_ICON[s.owner] || 'star4', { size: 13 })}</span>${s.level ? `<span class="skill-level">+${s.level}</span>` : ''}</div>
    <div class="skill-name">${escapeHtml(s.name)}</div>
    ${compact ? '' : `<div class="skill-meta">I ${s.index}${s.nextIndex ? ` → ${s.nextIndex}` : ''} · MP ${s.mp}${s.cd === 'battle' ? ' · 一场一次' : s.cd ? ` · 冷却 ${s.cd}` : ''}${s.resonance ? ` · 共鸣 ${s.resonance}` : ''}${s.ruleBend ? ` · 规则改写 ${escapeHtml(s.ruleBend)}` : ''}</div>
    <div class="skill-desc">${escapeHtml(s.text?.desc || '')}</div>
    <div class="skill-plus10"><b>+10</b> ${escapeHtml(s.text?.plus10 || '')}</div>`}
    ${extra}
  </div>`;
}

function skillRatesHtml(sk) {
  if (!sk) return '';
  const rows = sk.rates.map((r) => `<div class="rates-row" role="row"><span role="cell"><b>${escapeHtml(r.label)}</b></span><span role="cell">${formatRate(r.p)}</span><span role="cell">${r.items ? `${r.items.length ? formatRate(r.p / r.items.length) : '—'} <small>× ${r.items.length}</small>` : '—'}</span><span role="cell" class="rates-items">${(r.items || []).map((i) => `<span>${escapeHtml(i.name)}</span>`).join('')}</span></div>`).join('');
  return `<h2 class="section-title" id="gachaRatesTitle">概率公示 · 秘技召唤</h2>
    <p class="muted gacha-rates-note">只出已经入队的角色的暮紫、赤月技能（还没入队的角色不在池里）。赤月：基础 ${formatRate(sk.rates[0].p)}；距上一张赤月的第 ${sk.pity.softFrom} 抽起每抽 +${formatRate(sk.pity.softStep)}，第 ${sk.pity.hard} 抽必出。每 ${sk.pity.epicEvery} 抽至少一个暮紫或赤月。定轨：出赤月时 ${formatRate(sk.pity.targetShare)} 是目标，没中则下一张赤月必为目标。抽到已经拥有的技能当场转成秘页：暮紫×${sk.duplicate.purple}、赤月×${sk.duplicate.red}。</p>
    <div class="rates-table" role="table" aria-label="秘技召唤概率"><div class="rates-row rates-head" role="row"><span role="columnheader">结果</span><span role="columnheader">合计</span><span role="columnheader">单个条目</span><span role="columnheader">条目</span></div>${rows}</div>`;
}

function skillPoolHtml(sk) {
  if (!sk) return '<div class="loader">加载中…</div>';
  const st = sk.state || {};
  const reds = sk.rates[0].items || [];
  const purples = sk.rates[1].items || [];
  return `<div class="skill-pool-state">
      <span>${icon('scroll', { size: 15 })}秘技召唤券 <b>${st.tickets ?? 0}</b></span>
      <span>距保底 <b>${Math.max(0, sk.pity.hard - (st.sinceRed || 0))}</b> 抽</span>
      <span>十抽保底 <b>${st.sinceEpic || 0}/${sk.pity.epicEvery}</b></span>
      <span>${st.guaranteed ? '下一张赤月必为目标' : '定轨 50%'}</span>
    </div>
    <h3 class="skill-pool-title">${tierBadge('red')} 定轨目标</h3>
    <div class="skill-grid">${reds.map((s) => skillCardHtml(s, { compact: true, extra: `<button class="button small ${st.target === s.id ? 'primary' : 'ghost'}" data-target-skill="${escapeHtml(s.id)}" type="button">${st.target === s.id ? '已定轨' : '设为目标'}</button>${s.owned ? '<div class="skill-owned">已拥有</div>' : ''}` })).join('') || '<p class="muted">还没有赤月。</p>'}</div>
    <h3 class="skill-pool-title">${tierBadge('purple')} 暮紫</h3>
    <div class="skill-grid">${purples.map((s) => skillCardHtml(s, { compact: true, extra: s.owned ? '<div class="skill-owned">已拥有</div>' : '' })).join('')}</div>`;
}

function bindSkillPoolEvents() {
  document.querySelectorAll('[data-target-skill]').forEach((btn) => btn.addEventListener('click', async () => {
    try {
      await ensureAccount();
      const id = btn.dataset.targetSkill;
      const r = await apiPost('/api/gacha/target', { playerId, skillId: gachaPoolsCache?.skill?.state?.target === id ? null : id });
      showToast(r.target ? '定轨目标已设定。' : '已取消定轨。', 'success');
      await fetchGachaPools();
      loadGachaPool();
    } catch (e) { showToast(e.message, 'error'); }
  }));
}

function showSkillPullResult(r) {
  const el = document.querySelector('#gachaResult');
  if (!el) return;
  el.style.display = 'block';
  el.innerHTML = `<h3>召唤结果</h3><div class="skill-grid result">${r.results.map((x, i) => (x.kind === 'skill'
    ? `<div class="skill-result" style="--delay:${i * 70}ms">${skillCardHtml(x, { compact: true, extra: `${x.isNew ? '<span class="result-new">NEW</span>' : ''}${x.converted ? `<div class="skill-owned">已拥有：转为${MATERIAL_NAMES[x.converted.tier]}×${x.converted.qty}</div>` : ''}` })}</div>`
    : `<div class="skill-result material tier-${x.tier}" style="--delay:${i * 70}ms;--tier:${TIER_META[x.tier].color}">${icon('scroll', { size: 22 })}<b>${MATERIAL_NAMES[x.tier]}</b><span>×${x.qty}</span></div>`)).join('')}</div>
    <p class="muted">${r.payWith === 'tickets' ? `用了 ${r.results.length} 张秘技召唤券` : `消耗 ${r.cost} 钻石`} · 距赤月保底 ${Math.max(0, 80 - (r.state?.sinceRed || 0))} 抽${r.converted?.purple || r.converted?.red ? ` · 重复转秘页：暮紫+${r.converted.purple} 赤月+${r.converted.red}` : ''}</p>`;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  beep(r.results.some((x) => x.kind === 'skill' && x.tier === 'red') ? 'win' : 'skill');
}

/* ═══ 技能页：技能书 + 委托板（game/skills.mjs、game/skill-battle.mjs，技能稿第五、六节）═══ */
let skillsTab = 'book';
let skillsOwner = 'hero';
let skillsData = null;
let commissionsData = null;
let battleView = null;
let battleTarget = null;
let battleBusy = false;

function skillsPage() {
  return `${navBar()}
    <main class="page-content skills-page">
      <div class="page-header"><div class="eyebrow">SKILLS · 技能书与委托板</div><h1>技能</h1>
        <p class="muted">白、绿、蓝随主线解锁，暮紫、赤月从「秘技召唤」抽到；每张都能强化到 +10。①本命格只装剧情技能，②战技格可装暮紫，③绝技格什么颜色都能装（赤月只能装这里）。委托板是时间不定的公会委托：结果不写回主线，奖励是强化材料。</p>
      </div>
      <div class="gacha-tabs" role="tablist">
        <button class="gacha-tab skills-tab ${skillsTab === 'book' ? 'active' : ''}" data-skills-tab="book" type="button">${icon('book', { size: 15 })}技能书</button>
        <button class="gacha-tab skills-tab ${skillsTab === 'board' ? 'active' : ''}" data-skills-tab="board" type="button">${icon('flag', { size: 15 })}委托板</button>
      </div>
      <section id="skillsBody"><div class="loader">加载中…</div></section>
    </main>`;
}

function bindSkillsEvents() {
  document.querySelectorAll('[data-skills-tab]').forEach((btn) => btn.addEventListener('click', () => {
    skillsTab = btn.dataset.skillsTab;
    document.querySelectorAll('[data-skills-tab]').forEach((b) => b.classList.toggle('active', b === btn));
    loadSkillsView();
  }));
}

async function loadSkillsView() {
  const body = document.querySelector('#skillsBody');
  if (!body || !playerId) return;
  try {
    if (skillsTab === 'book') {
      skillsData = await apiGet(`/api/skills?playerId=${encodeURIComponent(playerId)}`);
      renderSkillBook();
    } else {
      commissionsData = await apiGet(`/api/commissions?playerId=${encodeURIComponent(playerId)}`);
      battleView = commissionsData.active || (battleView?.result ? battleView : null);
      renderBoard();
    }
  } catch (e) { body.innerHTML = `<p class="muted">${escapeHtml(e.message)}</p>`; }
}

function materialBarHtml(d) {
  return `<div class="material-bar">${Object.keys(TIER_META).map((t) => `<span class="material-chip tier-${t}" style="--tier:${TIER_META[t].color}" title="${MATERIAL_NAMES[t]}">${'◆'.repeat(TIER_PIPS[t])}<b>${MATERIAL_NAMES[t]}</b>${d.materials[t]}</span>`).join('')}<span class="material-chip">${icon('scroll', { size: 13 })}<b>召唤券</b>${d.tickets}</span></div>`;
}

function renderSkillBook() {
  const body = document.querySelector('#skillsBody');
  const d = skillsData;
  if (!body || !d) return;
  const owners = d.owners;
  if (!owners.find((o) => o.id === skillsOwner && !o.sealed)) skillsOwner = 'hero';
  const mine = d.skills.filter((s) => s.owner === skillsOwner);
  const slots = d.loadout[skillsOwner] || [null, null, null];
  const owned = mine.filter((s) => !s.sealed && s.owned);
  const slotRule = (i, s) => (i === 0 ? s.source === 'story' : i === 1 ? s.tier !== 'red' : true);
  const owner = owners.find((o) => o.id === skillsOwner);
  const combo = d.combos[skillsOwner];
  const oath = d.oaths[skillsOwner];
  const passive = d.passives[skillsOwner];
  const joined = owners.filter((o) => !o.sealed && o.id !== 'hero');
  body.innerHTML = `${materialBarHtml(d)}
    <div class="owner-tabs" role="tablist">${owners.map((o) => `<button type="button" class="owner-tab ${o.id === skillsOwner ? 'active' : ''}" data-owner="${o.id}" ${o.sealed ? 'disabled' : ''}>${icon(o.sealed ? 'lock' : OWNER_ICON[o.id], { size: 15 })}<span>${escapeHtml(o.sealed ? SEALED_NAME : o.name)}</span></button>`).join('')}</div>
    <section class="loadout-box">
      <h3>${escapeHtml(owner.name)} · ${escapeHtml(owner.role)} · 编成</h3>
      <div class="loadout-slots">${[0, 1, 2].map((i) => `<label class="loadout-slot"><span>${['①本命格', '②战技格', '③绝技格'][i]}</span>
        <select data-slot="${i}">${i ? '<option value="">（空）</option>' : ''}${owned.filter((s) => slotRule(i, s)).map((s) => `<option value="${escapeHtml(s.id)}" ${slots[i] === s.id ? 'selected' : ''}>[${TIER_META[s.tier].label}] ${escapeHtml(s.name)}${s.level ? ` +${s.level}` : ''}</option>`).join('')}</select></label>`).join('')}
        <button class="button primary small" id="saveLoadout" type="button">${icon('save', { size: 14 })}保存编成</button></div>
      ${passive ? `<p class="muted">信赖被动「${escapeHtml(passive.name)}」：${escapeHtml(passive.desc)}（技能战里固定 ${Math.round(d.passiveRule.chance * 100)}% 触发，冷却 ${d.passiveRule.cooldownActions} 个行动）</p>` : ''}
      ${combo ? `<p class="muted">合击「${escapeHtml(combo.name)}」${combo.unlocked ? '' : `（${escapeHtml(combo.unlock)} 通关后解锁）`}：${escapeHtml(combo.desc)}（I＝${d.fixed.combo.index}，共鸣 ${d.fixed.combo.resonance}）</p>` : ''}
      ${oath ? `<p class="muted">誓约技${oath.available ? `「${escapeHtml(oath.name)}」——「${escapeHtml(oath.line)}」：${escapeHtml(oath.desc)}（I＝${d.fixed.oath.index}，共鸣 ${d.fixed.oath.resonance}，一场一次）` : `：她的个人章（${escapeHtml(oath.personal)}）通关后解锁`}</p>` : ''}
    </section>
    <div class="skill-grid book">${mine.map((s) => skillCardHtml(s, { extra: s.sealed ? '' : skillCardActions(s, d) })).join('')}</div>
    <section class="party-box">
      <h3>委托板编成 · 亚克固定在场${d.partySize ? `，另选 ${d.partySize} 位` : ''}</h3>
      ${d.partySize ? `<div class="party-picks">${joined.map((o) => `<label class="party-pick"><input type="checkbox" value="${o.id}" ${d.party.includes(o.id) ? 'checked' : ''}>${icon(OWNER_ICON[o.id], { size: 14 })}${escapeHtml(o.name)}</label>`).join('')}</div>
        <label class="party-oath">誓约槽 <select id="oathPick"><option value="">（空）</option>${joined.filter((o) => o.personalCleared).map((o) => `<option value="${o.id}" ${d.oath === o.id ? 'selected' : ''}>${escapeHtml(o.name)}</option>`).join('')}</select></label>
        <button class="button secondary small" id="saveParty" type="button">${icon('users', { size: 14 })}保存</button>` : '<p class="muted">通关正式第五章后开放委托板。</p>'}
    </section>
    <section class="convert-box">
      <h3>转换与兑换（只能上转，没有向下转换）</h3>
      <div class="convert-actions">
        <button class="button ghost small" data-convert="white>green" type="button">${d.convert['white>green']} 练习手记 → 1 实战手记</button>
        <button class="button ghost small" data-convert="green>blue" type="button">${d.convert['green>blue']} 实战手记 → 1 源律残章</button>
        <button class="button ghost small" data-convert="purple>red" type="button">${d.convert['purple>red']} 暮紫秘页 → 1 赤月秘页</button>
        <button class="button ghost small" data-exchange="ticketFromPurple" type="button">${d.exchange.ticketFromPurple.purple} 暮紫秘页 → 1 召唤券</button>
        <button class="button ghost small" data-exchange="ticketFromRed" type="button">${d.exchange.ticketFromRed.red} 赤月秘页 → 1 召唤券</button>
      </div>
    </section>`;
  bindSkillBook();
}

function skillCardActions(s, d) {
  if (s.source === 'story' && !s.unlocked) return `<div class="skill-owned">${icon('lock', { size: 12 })}主线 ${escapeHtml(s.unlock)} 解锁</div>`;
  if (!s.owned) {
    if (s.tier === 'purple') return `<button class="button ghost small" data-pick="${escapeHtml(s.id)}" type="button">${d.exchange.pickPurple.purple} 暮紫秘页兑换</button>`;
    return `<div class="skill-owned">${icon('sparkle', { size: 12 })}秘技召唤获得</div>`;
  }
  if (s.nextCost == null) return '<div class="skill-owned">已满级</div>';
  const enough = d.materials[s.tier] >= s.nextCost;
  return `<button class="button ${enough ? 'primary' : 'ghost'} small" data-enhance="${escapeHtml(s.id)}" type="button" ${enough ? '' : 'disabled'}>强化 +${s.level + 1}（${MATERIAL_NAMES[s.tier]} ${s.nextCost}）</button>`;
}

async function skillPost(path, body, okText) {
  try {
    const r = await apiPost(path, { playerId, ...body });
    skillsData = { ok: true, ...r.skillbook };
    if (okText) showToast(okText, 'success');
    beep('click');
    renderSkillBook();
  } catch (e) { showToast(e.message, 'error'); beep('error'); }
}

function bindSkillBook() {
  document.querySelectorAll('[data-owner]').forEach((b) => b.addEventListener('click', () => { skillsOwner = b.dataset.owner; renderSkillBook(); }));
  document.querySelector('#saveLoadout')?.addEventListener('click', () => {
    const slots = [...document.querySelectorAll('[data-slot]')].map((sel) => sel.value || null);
    skillPost('/api/skills/equip', { owner: skillsOwner, slots }, '编成已保存。');
  });
  document.querySelectorAll('[data-enhance]').forEach((b) => b.addEventListener('click', () => skillPost('/api/skills/enhance', { skillId: b.dataset.enhance }, '强化成功。')));
  document.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => skillPost('/api/skills/exchange', { kind: 'pickPurple', skillId: b.dataset.pick }, '已兑换。')));
  document.querySelectorAll('[data-convert]').forEach((b) => b.addEventListener('click', () => { const [from, to] = b.dataset.convert.split('>'); skillPost('/api/skills/convert', { from, to, times: 1 }, '已转换。'); }));
  document.querySelectorAll('[data-exchange]').forEach((b) => b.addEventListener('click', () => skillPost('/api/skills/exchange', { kind: b.dataset.exchange }, '换到一张召唤券。')));
  document.querySelector('#saveParty')?.addEventListener('click', () => {
    const party = [...document.querySelectorAll('.party-pick input:checked')].map((i) => i.value);
    skillPost('/api/skills/party', { party, oath: document.querySelector('#oathPick')?.value || null }, '委托板编成已保存。');
  });
}

// ─── 委托板 ───
function contentMode() { return store.json('moonlit:story:settings', {})?.mode === '12+' ? '12+' : '15+'; }

function renderBoard() {
  const body = document.querySelector('#skillsBody');
  const d = commissionsData;
  if (!body || !d) return;
  if (battleView) { renderBattle(); return; }
  if (!d.open) { body.innerHTML = '<p class="muted">通关正式第五章后开放委托板。</p>'; return; }
  body.innerHTML = `<div class="board-head">
      <span>${icon('calendar', { size: 15 })}今日有奖胜场 <b>${Math.min(d.daily.wins, d.daily.rewarded)}/${d.daily.rewarded}</b>（每胜 练习手记×${d.daily.reward.white}、实战手记×${d.daily.reward.green}；之后每胜 练习手记×${d.daily.repeat.white}）</span>
      <span>${icon('trophy', { size: 15 })}本周挑战 <b>${Math.min(d.weekly.wins, d.weekly.rewarded)}/${d.weekly.rewarded}</b>（每场 实战手记×${d.weekly.reward.green}、源律残章×${d.weekly.reward.blue}）</span>
    </div>
    <div class="commission-grid">${d.list.map((c) => `<article class="commission-card${c.challenge ? ' is-challenge' : ''}">
      <h3>${c.challenge ? icon('trophy', { size: 15 }) : icon('flag', { size: 15 })}${escapeHtml(c.title)}</h3>
      <p class="muted">${escapeHtml(c.desc)}</p>
      <p class="commission-enemies">${c.enemies.map((n) => `<span>${escapeHtml(n)}</span>`).join('')}</p>
      <button class="button primary small" data-commission="${escapeHtml(c.id)}" type="button">${icon('battle', { size: 14 })}出发</button>
    </article>`).join('')}</div>`;
  body.querySelectorAll('[data-commission]').forEach((b) => b.addEventListener('click', async () => {
    try {
      const r = await apiPost('/api/commission/start', { playerId, commissionId: b.dataset.commission });
      battleView = r.battle; battleTarget = null; beep('skill');
      renderBattle();
    } catch (e) { showToast(e.message, 'error'); }
  }));
}

function unitCardHtml(u, b) {
  const isCur = b.current === u.id;
  const pct = Math.max(0, Math.round((u.hp / u.maxHp) * 100));
  return `<button type="button" class="unit-card side-${u.side}${u.down ? ' is-down' : ''}${isCur ? ' is-current' : ''}${battleTarget === u.id ? ' is-target' : ''}${u.broken ? ' is-broken' : ''}" data-unit="${u.id}" ${u.down ? 'disabled' : ''}>
    <div class="unit-name">${u.side === 'ally' ? icon(OWNER_ICON[u.owner] || 'user', { size: 14 }) : ''}${escapeHtml(u.name)}${u.charging ? `<span class="unit-charge">蓄力：${escapeHtml(u.charging)}</span>` : ''}${u.broken ? '<span class="unit-charge">破防</span>' : ''}</div>
    <div class="bar hp"><i style="width:${pct}%"></i><span>${u.hp}/${u.maxHp}</span></div>
    ${u.side === 'ally' ? `<div class="bar mp"><i style="width:${Math.round((u.mp / u.maxMp) * 100)}%"></i><span>MP ${u.mp}</span></div>` : `<div class="bar brk"><i style="width:${u.brk}%"></i><span>破防 ${u.brk}</span></div>`}
    ${u.weak ? `<div class="unit-weak">弱点：${u.weak.map(escapeHtml).join('、')}</div>` : ''}
    <div class="unit-st">${u.st.slice(0, 6).map((s) => `<span>${escapeHtml(s.name)}${s.t ? s.t : ''}</span>`).join('')}</div>
  </button>`;
}

function renderBattle() {
  const body = document.querySelector('#skillsBody');
  const b = battleView;
  if (!body || !b) return;
  const units = Object.fromEntries(b.units.map((u) => [u.id, u]));
  const a = b.actions;
  const cur = units[b.current];
  body.innerHTML = `<section class="battle-board mode-${contentMode() === '12+' ? 'spark' : 'blood'}">
    <div class="battle-top"><h3>${b.challenge ? icon('trophy', { size: 16 }) : icon('flag', { size: 16 })}${escapeHtml(b.title)} · 第 ${b.round} 回合</h3>
      <div class="bar res"><i style="width:${b.resonance}%"></i><span>共鸣 ${b.resonance}</span></div>
      <span>${icon('potion', { size: 14 })}药剂 ${b.potions}</span>${b.turret ? `<span>${icon('mech', { size: 14 })}零号炮台 ${b.turret.t}</span>` : ''}${b.field.map((f) => `<span>${escapeHtml(f.kind)} ${f.t}</span>`).join('')}
      ${b.result ? '' : '<button class="button ghost small" id="battleFlee" type="button">撤退</button>'}</div>
    <div class="turn-order">${icon('clock', { size: 14 })}${b.order.map((id) => `<span class="side-${units[id]?.side}">${escapeHtml(units[id]?.name || id)}</span>`).join('')}</div>
    <div class="unit-row enemies">${b.enemies.map((id) => unitCardHtml(units[id], b)).join('')}</div>
    <div class="unit-row allies">${b.allies.map((id) => unitCardHtml(units[id], b)).join('')}</div>
    ${b.result ? `<div class="battle-result ${b.result}"><h3>${b.result === 'won' ? '委托完成' : '撤退了'}</h3>${b.reward ? `<p>${Object.entries(b.reward.materials).filter(([, n]) => n).map(([t, n]) => `${MATERIAL_NAMES[t]}×${n}`).join('、') || '这一场没有材料奖励'}</p>` : ''}<button class="button primary" id="battleBack" type="button">回委托板</button></div>`
      : a ? `<div class="action-menu"><p class="muted">轮到 <b>${escapeHtml(cur?.name || '')}</b>${battleTarget ? ` · 目标：${escapeHtml(units[battleTarget]?.name || '')}` : ' · 点一张卡选目标（不选就自动）'}</p>
        <div class="action-buttons">
          <button class="button secondary" data-act="attack" type="button" ${a.canAttack ? '' : 'disabled'}>${icon('sword', { size: 14 })}普攻</button>
          ${a.skills.map((s) => (s ? `<button class="button skill-btn tier-${s.tier}" style="--tier:${TIER_META[s.tier].color}" data-act="skill" data-slot="${s.slot}" type="button" ${s.usable ? '' : 'disabled'} title="${escapeHtml(s.why || '')}">${['①', '②', '③'][s.slot - 1]}${escapeHtml(s.name)}${s.level ? ` +${s.level}` : ''}<small>${s.usable ? `MP ${s.mp}${s.resonance ? ` · 共鸣 ${s.resonance}` : ''}` : escapeHtml(s.why)}</small></button>` : '')).join('')}
          <button class="button ghost" data-act="defend" type="button">${icon('shield', { size: 14 })}防御</button>
          <button class="button ghost" data-act="item" type="button" ${a.potions > 0 ? '' : 'disabled'}>${icon('potion', { size: 14 })}药剂</button>
          ${a.combos.map((c) => `<button class="button combo-btn" data-act="combo" data-with="${c.with}" type="button" ${c.usable ? '' : 'disabled'} title="${escapeHtml(c.why)}">${icon('star4', { size: 14 })}合击·${escapeHtml(c.name)}</button>`).join('')}
          ${a.oath ? `<button class="button oath-btn" data-act="oath" type="button" ${a.oath.usable ? '' : 'disabled'} title="${escapeHtml(a.oath.why)}">${icon('ring', { size: 14 })}誓约·${escapeHtml(a.oath.name)}</button>` : ''}
        </div></div>` : ''}
    <ol class="battle-log">${b.log.slice(-14).map((l) => `<li class="log-${l.kind}">${escapeHtml(l.text)}</li>`).join('')}</ol>
  </section>`;
  body.querySelectorAll('[data-unit]').forEach((el) => el.addEventListener('click', () => { battleTarget = battleTarget === el.dataset.unit ? null : el.dataset.unit; renderBattle(); }));
  body.querySelectorAll('[data-act]').forEach((el) => el.addEventListener('click', () => battleAct({ type: el.dataset.act, slot: Number(el.dataset.slot) || 0, with: el.dataset.with, target: battleTarget || undefined })));
  document.querySelector('#battleFlee')?.addEventListener('click', async () => { try { await apiPost('/api/commission/flee', { playerId }); battleView = null; loadSkillsView(); } catch (e) { showToast(e.message, 'error'); } });
  document.querySelector('#battleBack')?.addEventListener('click', () => { battleView = null; loadSkillsView(); });
  const log = body.querySelector('.battle-log');
  if (log) log.scrollTop = log.scrollHeight;
}

function showCutIn(unit, text) {
  if (!unit) return;
  const costume = playerAccount?.equippedCostumes?.[unit.owner];
  const src = unit.owner === 'hero' ? '/assets/story/npc/aku.svg' : costume ? `/assets/costumes/${costume}.svg` : ART.portrait(unit.owner);
  const el = document.createElement('div');
  el.className = 'skill-cutin';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<div class="cutin-band"><img src="${escapeHtml(paint(src))}" alt=""><p>${escapeHtml(text)}</p></div>`;
  document.body.append(el);
  setTimeout(() => el.remove(), 1600);
}

async function battleAct(action) {
  if (battleBusy) return;
  battleBusy = true;
  try {
    const before = Object.fromEntries((battleView?.units || []).map((u) => [u.id, u.hp]));
    const seenLog = new Set((battleView?.log || []).map((l) => `${l.round}|${l.text}`));
    const r = await apiPost('/api/commission/act', { playerId, action });
    battleView = r.battle;
    // 赤月：全屏 cut-in，显示她当前的服装（技能稿 2.2、6.1）
    const red = battleView.log.find((l) => l.kind === 'red' && !seenLog.has(`${l.round}|${l.text}`));
    if (red) showCutIn(battleView.units.find((u) => u.side === 'ally' && red.text.startsWith(u.name)), red.text);
    if (battleTarget && battleView.units.find((u) => u.id === battleTarget)?.down) battleTarget = null;
    renderBattle();
    // 受击的单位闪一下：15+ 是血花，12+ 换成火花（技能稿 6.1；女主胸像永不带伤，这里只是卡片泛红）
    for (const u of battleView.units) if (before[u.id] != null && u.hp < before[u.id]) document.querySelector(`[data-unit="${u.id}"]`)?.classList.add('was-hit');
    if (battleView.result) beep(battleView.result === 'won' ? 'win' : 'error');
    else beep('click');
  } catch (e) { showToast(e.message, 'error'); beep('error'); }
  finally { battleBusy = false; }
}

function showGallery(gallery, unlockedCount, total) {
  const overlay = document.createElement('div');
  overlay.className = 'gallery-overlay';
  overlay.innerHTML = `
    <div class="gallery-card" role="dialog" aria-modal="true" aria-label="CG 图库">
      <div class="gallery-header">
        <div class="eyebrow">CG GALLERY · IF 外传 · 银轨号</div>
        <h2>事件回忆 · ${unlockedCount}/${total}</h2>
        <button class="icon-button modal-close" id="galleryClose" type="button" aria-label="关闭">${icon('close', { size: 18 })}</button>
      </div>
      <div class="gallery-grid">
        ${gallery.map((cg) => `
          <div class="cg-item ${cg.unlocked ? 'unlocked' : 'locked'}">
            <div class="cg-thumb ${cg.unlocked ? aiPaintedClass(cg.file) : ''}">${cg.unlocked ? `<img src="${escapeHtml(paint(cg.file))}" alt="${escapeHtml(cg.title)}" loading="lazy" data-fallback-icon="film">${paintBadge(cg.file)}` : `<span class="cg-placeholder">${icon('lock', { size: 28 })}</span>`}</div>
            <div class="cg-info"><strong>${cg.unlocked ? escapeHtml(cg.title) : '???'}</strong><p>${cg.unlocked ? escapeHtml(cg.description) : '尚未解锁'}</p></div>
          </div>`).join('')}
      </div>
    </div>`;
  mountOverlay(overlay, '#galleryClose');
}

boot();
