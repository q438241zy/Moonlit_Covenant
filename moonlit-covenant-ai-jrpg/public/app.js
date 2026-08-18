const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
const settingsDialog = document.querySelector('#settingsDialog');
const helpDialog = document.querySelector('#helpDialog');
const settingsContent = document.querySelector('#settingsContent');
const soundToggle = document.querySelector('#soundToggle');

let meta = null;
let state = null;
let screen = 'title';
let selectedCharacterId = 'lia';
let busy = false;
let lastAiSource = null;
let toastTimer = null;
let audioContext = null;
let soundEnabled = localStorage.getItem('moonlit:sound') !== 'off';
let playerId = localStorage.getItem('moonlit:playerId') || null;
let playerAccount = null;
let creditMeter = null;
let playerPos = { x: 15, y: 75 };
let completedChapters = JSON.parse(localStorage.getItem('moonlit:chapters') || '[0]');

/* ═══ 大地图城镇数据 ═══ */
const MAP_TOWNS = [
  { id:'start',    name:'起点村',       icon:'🏠', x:12, y:72, unlockChapter:0,  desc:'旅程的起点，宁静的边境小村', color:'#8cf0c9' },
  { id:'station',  name:'银轨站',       icon:'🚂', x:25, y:58, unlockChapter:1,  desc:'月蚀列车停靠站，通往各地的枢纽', color:'#6edcff' },
  { id:'mooncity', name:'月蚀城',       icon:'🌙', x:40, y:42, unlockChapter:3,  desc:'观测者的圣城，塞蕾娜的故乡', color:'#b996ff' },
  { id:'frosttown',name:'霜华镇',       icon:'❄️', x:55, y:25, unlockChapter:5,  desc:'永冬之地，芙蕾娅守护的边镇', color:'#8fd4f5' },
  { id:'valhalla', name:'瓦尔哈拉要塞', icon:'⚔️', x:70, y:38, unlockChapter:7,  desc:'战乙女的钢铁要塞，莉莉丝与艾拉的家', color:'#c084fc' },
  { id:'startower',name:'星咏塔',       icon:'⭐', x:62, y:58, unlockChapter:9,  desc:'观星者的孤独高塔，伊芙琳在此守望', color:'#ffd98c' },
  { id:'nodgate',  name:'诺德之门',     icon:'🌀', x:80, y:50, unlockChapter:11, desc:'月之领域的入口，奥菲利亚的领地', color:'#f472b6' },
  { id:'terminal', name:'终点站',       icon:'🏁', x:90, y:68, unlockChapter:13, desc:'一切结束与开始的地方', color:'#ff8fb8' },
];

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function apiHeaders() {
  return { 'content-type': 'application/json' };
}

async function apiGet(path) {
  const response = await fetch(path, { headers: { accept: 'application/json' } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) {
    throw new Error(payload?.error?.message || `请求失败 (${response.status})`);
  }
  return payload;
}

async function apiPost(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) {
    throw new Error(payload?.error?.message || `请求失败 (${response.status})`);
  }
  return payload;
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

function strategyMeta(id) {
  return meta?.strategies?.find((strategy) => strategy.id === id);
}

function percentage(value, max) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
}

function externalCta(url, label, className = 'secondary') {
  if (!url) return '';
  return `<a class="button ${className}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
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

function titleScreen() {
  const hasSave = Boolean(state);
  const currentScene = state ? sceneName(state.scene) : '';
  return `
    <main class="title-screen">
      <div class="title-layout">
        <section class="title-copy">
          <div class="eyebrow">AI-NATIVE JRPG · WEB VERTICAL SLICE</div>
          <img class="title-logo" src="/assets/logo.svg" alt="月蚀契约：她们会记得你">
          <p class="title-tagline">你可以对队友说任何话，但<strong>每一句承诺都会被记住</strong>。三名各怀秘密的少女、一次月蚀列车危机，以及一个不在选项里的结局。</p>
          <input id="playerName" class="name-field" maxlength="16" autocomplete="nickname" value="${escapeHtml(state?.playerName || localStorage.getItem('moonlit:name') || '队长')}" aria-label="玩家称呼" placeholder="输入队长称呼">
          <div class="title-actions">
            <button id="newGame" class="button primary large">开始序章</button>
            ${hasSave ? `<button id="continueGame" class="button secondary large">继续 · ${escapeHtml(currentScene)}</button>` : ''}
            ${externalCta(meta?.marketing?.wishlistUrl, '加入 Steam 愿望单', 'secondary large')}
            <button id="titleHelp" class="button ghost large">玩法说明</button>
            <button id="galleryButton" class="button ghost large">CG图库</button>
          </div>
          <div class="title-nav-row">
            <button class="button ghost" data-nav="map">地图</button>
            <button class="button ghost" data-nav="chapters">章节</button>
            <button class="button ghost" data-nav="gacha">召唤</button>
            <button class="button ghost" data-nav="costume">换衣</button>
            <button class="button ghost" data-nav="shop">商店</button>
            <button class="button ghost" data-nav="settings">设置</button>
          </div>
          <div class="title-notes">
            ${aiBadge()}
            <span class="pill">约 15–25 分钟</span>
            <span class="pill">3 名可交流队友</span>
            <span class="pill">确定性回合战斗</span>
          </div>
          <p class="title-studio">阳之亮面出品</p>
          <p class="title-footnote">本切片角色立绘、怪物图与主视觉由 AI 生成（画面含生成水印），世界观、人设与游戏规则为原创内容。AI 只生成受约束的角色台词，不直接修改数值、战斗结果或世界事实。</p>
        </section>
        <section class="title-art" aria-label="三名主要角色">
          <div class="hero-moon"></div>
          <div class="hero-card"><img src="/assets/lia.png" alt="赤誓骑士莉亚"></div>
          <div class="hero-card"><img src="/assets/mia.png" alt="猫耳机关师米娅"></div>
          <div class="hero-card"><img src="/assets/serena.png" alt="月蚀观测者塞蕾娜"></div>
        </section>
      </div>
    </main>`;
}

function sceneName(scene) {
  return {
    intro: '月蚀列车',
    camp: '战前餐车',
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
        <div><strong>月蚀契约</strong><span>CHAPTER 01 · SILVER RAIL</span></div>
      </div>
      <div class="objective"><strong>当前目标</strong>${escapeHtml(state.objective)}</div>
      <div class="header-actions">
        <button id="modeToggle" class="pill mode-pill ${state.dialogueMode === 'ai' ? 'ai' : 'story'}" title="切换对话模式">${state.dialogueMode === 'ai' ? 'AI对话' : '故事模式'}</button>
        ${aiBadge()}
        <button id="helpButton" class="icon-button" title="玩法说明" aria-label="玩法说明">?</button>
        <button id="settingsButton" class="icon-button" title="设置" aria-label="设置">⚙</button>
        <button id="backToTitle" class="icon-button" title="返回标题" aria-label="返回标题">⌂</button>
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
            <img class="roster-avatar" src="${character.portrait}" alt="">
            <div>
              <div class="roster-name">${escapeHtml(character.shortName)}</div>
              <div class="roster-role">${escapeHtml(character.role)}</div>
              ${showBars ? `<div class="mini-bars">
                <div class="mini-bar"><span>羁绊</span><div class="bar-track"><div class="bar-fill" style="--value:${relationship.bond * 10}%;--char-accent:${character.accent}"></div></div><b>${relationship.bond}</b></div>
                <div class="mini-bar"><span>信任</span><div class="bar-track"><div class="bar-fill" style="--value:${relationship.trust * 10}%;--char-accent:${character.accent}"></div></div><b>${relationship.trust}</b></div>
              </div>` : ''}
            </div>
          </button>`;
      }).join('')}
    </div>`;
}

function questHtml() {
  const strategyChosen = Boolean(state.chosenStrategyId);
  const talked = state.chatTurns > 0;
  return `
    <h3 class="panel-heading">Chapter Goals</h3>
    <div class="quest-list">
      <div class="quest-item"><span class="quest-check">${talked ? '✓' : '·'}</span><span>与至少一名队友自由交流</span></div>
      <div class="quest-item"><span class="quest-check">${strategyChosen ? '✓' : '·'}</span><span>选择一套主导战术</span></div>
      <div class="quest-item"><span class="quest-check">${state.flags.battleWon ? '✓' : '·'}</span><span>击败食梦兽</span></div>
      <div class="quest-item"><span class="quest-check">${state.ending ? '✓' : '·'}</span><span>决定黎明种的命运</span></div>
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
      return `<div class="event ${escapeHtml(item.type)}" style="--event-accent:${char?.accent || '#b996ff'}">
        <div class="event-speaker">${escapeHtml(speaker)}</div>
        <div class="event-text">${escapeHtml(item.text)}${deltas}</div>
      </div>`;
    }).join('')}
  </div>`;
}

function chatPanelHtml({ actionButton = '' } = {}) {
  const character = characterMeta(selectedCharacterId);
  const isCamp = state.scene === 'camp';
  const isCorridor = state.scene === 'corridor';
  const maxTurns = isCorridor ? 4 : state.maxChatTurns;
  const canChat = (!isCamp && !isCorridor) || state.chatTurns < maxTurns;
  const remaining = Math.max(0, maxTurns - state.chatTurns);
  const sceneLabel = isCorridor ? '回廊交流剩余' : isCamp ? '战前交流剩余' : '战后交流';
  return `
    <div class="dialogue-inner">
      ${eventLogHtml(14)}
      <div class="chat-box">
        ${actionButton || `
          <div class="quick-prompts">
            ${character.quickPrompts.map((prompt) => `<button class="chip" data-quick="${escapeHtml(prompt)}" ${canChat ? '' : 'disabled'}>${escapeHtml(prompt)}</button>`).join('')}
          </div>
          <form id="chatForm" class="chat-form">
            <input id="chatInput" class="chat-input" maxlength="500" autocomplete="off" placeholder="对${escapeHtml(character.shortName)}说点什么……" ${canChat ? '' : 'disabled'}>
            <button class="button primary" type="submit" ${canChat ? '' : 'disabled'}>${busy ? '思考中…' : '发送'}</button>
          </form>
          <div class="chat-meta"><span>${(isCamp || isCorridor) ? `${sceneLabel} ${remaining} 次` : '战后交流不消耗次数'}</span><span>AI 只能提议，规则引擎才可改状态</span></div>`}
      </div>
    </div>`;
}

function characterStageHtml() {
  const character = characterMeta(selectedCharacterId);
  const relationship = characterState(selectedCharacterId);
  return `
    <div class="character-stage" style="--char-accent:${character.accent}">
      <div class="character-backdrop"></div>
      <img class="character-portrait" src="${character.portrait}" alt="${escapeHtml(character.name)}">
      <div class="character-label">
        <h2>${escapeHtml(character.name)}</h2>
        <p>${escapeHtml(character.title)} · ${escapeHtml(character.role)} · 羁绊技能「${escapeHtml(character.battleSkill)}」</p>
      </div>
      <span class="pill character-mood"><span class="pill-dot" style="background:${character.accent}"></span>${escapeHtml(relationship.mood)}</span>
      ${busy ? '<div class="loading-overlay"><div class="loader"></div></div>' : ''}
    </div>`;
}

function strategyPanelHtml() {
  return `
    <h3 class="panel-heading">Tactical Anchor</h3>
    <div class="strategy-list">
      ${meta.strategies.map((strategy) => {
        const owner = characterMeta(strategy.owner);
        const selected = state.chosenStrategyId === strategy.id;
        return `<button class="strategy-card ${selected ? 'selected' : ''}" data-strategy="${strategy.id}" style="--strategy-accent:${owner.accent}">
          <div class="strategy-title"><span>${escapeHtml(strategy.name)}</span><span class="strategy-owner">${escapeHtml(owner.shortName)}</span></div>
          <p>${escapeHtml(strategy.description)}</p>
          <div class="strategy-bonus">${escapeHtml(strategy.bonus)}</div>
        </button>`;
      }).join('')}
    </div>
    <div class="stat-card">
      <div class="spread"><span class="muted">交流次数</span><strong>${state.chatTurns}/${state.maxChatTurns}</strong></div>
      <div class="spread" style="margin-top:8px"><span class="muted">承诺记录</span><strong>${state.flags.madePromise ? '已建立' : '未建立'}</strong></div>
    </div>
    <button id="beginCorridor" class="button primary full" style="margin-top:12px" ${state.chosenStrategyId && !busy ? '' : 'disabled'}>部署战术，穿过回廊</button>`;
}

function introLayout() {
  return `
    <div class="game-content">
      <aside class="left-panel">${questHtml()}</aside>
      <section class="center-stage">
        <div class="intro-stage">
          <div class="intro-panel">
            <div class="eyebrow">PROLOGUE · THE EYE OUTSIDE THE WINDOW</div>
            <div class="intro-orbit">
              <img class="intro-avatar" src="/assets/lia.png" alt="莉亚">
              <img class="intro-avatar" src="/assets/mia.png" alt="米娅">
              <img class="intro-avatar" src="/assets/serena.png" alt="塞蕾娜">
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
  const remaining = Math.max(0, 4 - state.chatTurns);
  return `
    <div class="game-content">
      <aside class="left-panel">${rosterHtml()}<div style="height:18px"></div>
        <div class="stat-card"><h3 class="panel-heading">回廊 · 战前最后时刻</h3><p class="muted">走廊里的霜越来越厚。食梦兽就在前方。这是最后交流的机会。</p>
        <div class="spread" style="margin-top:8px"><span class="muted">剩余交流</span><strong>${remaining} 次</strong></div>
        <button id="beginBattle" class="button primary full" style="margin-top:12px" ${!busy ? '' : 'disabled'}>冲出去，开始战斗</button></div>
      </aside>
      <section class="center-stage">${characterStageHtml()}</section>
      <aside class="right-panel">${strategyPanelHtml()}</aside>
      <section class="dialogue-panel">${chatPanelHtml()}</section>
    </div>`;
}

function battleLayout() {
  const partyHp = percentage(state.partyHp, state.partyMaxHp);
  const enemyHp = percentage(state.enemy.hp, state.enemy.maxHp);
  const focus = percentage(state.focus, state.focusMax);
  const selectedStrategy = strategyMeta(state.chosenStrategyId);
  const leader = characterMeta(selectedStrategy.owner);
  return `
    <div class="game-content">
      <aside class="left-panel">
        <h3 class="panel-heading">Party Status</h3>
        <div class="party-status">
          <div class="party-hp-card"><div class="spread"><strong>队伍生命</strong><span>${state.partyHp}/${state.partyMaxHp}</span></div><div class="hp-bar" style="margin-top:9px"><div class="hp-fill" style="--value:${partyHp}%"></div></div></div>
          <div class="party-hp-card"><div class="spread"><strong>羁绊焦点</strong><span>${state.focus}/${state.focusMax}</span></div><div class="hp-bar" style="margin-top:9px"><div class="focus-fill" style="--value:${focus}%"></div></div></div>
          ${rosterHtml({ selectable: false, showBars: false })}
        </div>
      </aside>
      <section class="center-stage">
        <div class="battle-stage">
          <div class="battle-top"><div class="enemy-nameplate"><div class="eyebrow">MEMORY DEVOURER · TURN ${state.turn}</div><h2>${escapeHtml(state.enemy.name)}</h2><div class="hp-bar"><div class="hp-fill" style="--value:${enemyHp}%"></div></div><div class="muted" style="margin-top:7px">${state.enemy.hp}/${state.enemy.maxHp} · 压制 ${state.enemy.sealed}</div></div></div>
          <div class="enemy-zone"><img class="enemy-art" src="${state.enemy.portrait}" alt="${escapeHtml(state.enemy.name)}"></div>
          <div class="battle-bottom"><span>主导战术：${escapeHtml(selectedStrategy.name)}</span><span>·</span><span>羁绊角色：${escapeHtml(leader.shortName)}</span></div>
        </div>
        ${busy ? '<div class="loading-overlay"><div class="loader"></div></div>' : ''}
      </section>
      <aside class="right-panel">
        <h3 class="panel-heading">Battle Command</h3>
        <div class="command-list">
          <button class="command" data-battle="attack" ${busy ? 'disabled' : ''}><strong>连携攻击</strong><span>造成伤害 · 焦点 +8</span></button>
          <button class="command" data-battle="skill" ${state.focus >= 30 && !busy ? '' : 'disabled'}><strong>${escapeHtml(leader.battleSkill)}</strong><span>消耗 30 焦点</span></button>
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
          <div class="artifact-wrap">
            <div class="eyebrow">THE DAWN SEED IS AWAKE</div>
            <div class="artifact" aria-hidden="true"></div>
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
  return `
    <main class="game-page">
      <section class="ending-screen">
        <article class="ending-card">
          <div class="ending-visual">
            <div class="ending-rank">${escapeHtml(ending.rank)}</div>
            <img src="${partner.portrait}" alt="${escapeHtml(partner.name)}">
          </div>
          <div class="ending-body">
            <div class="eyebrow">PROLOGUE COMPLETE · ${escapeHtml(partner.title)}</div>
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

function render() {
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
    return;
  }
  if (screen === 'gacha') {
    app.innerHTML = gachaPage();
    bindNavEvents();
    bindGachaEvents();
    loadGachaPool();
    return;
  }
  if (screen === 'costume') {
    app.innerHTML = costumePage();
    bindNavEvents();
    loadCostumes();
    return;
  }
  if (screen === 'settings') {
    app.innerHTML = settingsPage();
    bindNavEvents();
    bindSettingsPageEvents();
    loadSettings();
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
  if (screen === 'title' || !state) {
    app.innerHTML = titleScreen();
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
      loadGachaPool();
    });
  });
  document.querySelector('#gachaSingle')?.addEventListener('click', () => doGachaPull(1));
  document.querySelector('#gachaTen')?.addEventListener('click', () => doGachaPull(10));
}

function bindSettingsPageEvents() {
  document.querySelector('#settingsSoundToggle')?.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('moonlit:sound', soundEnabled ? 'on' : 'off');
    if (soundEnabled) beep('click');
    render();
  });
  document.querySelector('#adminUnlock')?.addEventListener('click', () => {
    const pwd = document.querySelector('#adminPassword')?.value || '';
    if (pwd === '123456') {
      screen = 'dashboard';
      beep('skill');
      render();
    } else {
      const err = document.querySelector('#adminError');
      if (err) err.style.display = 'block';
      beep('error');
    }
  });
  document.querySelector('#adminPassword')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.querySelector('#adminUnlock')?.click();
  });
}

function bindEvents() {
  bindNavEvents();
  document.querySelector('#newGame')?.addEventListener('click', startNewGame);
  document.querySelector('#continueGame')?.addEventListener('click', () => {
    screen = 'game';
    selectedCharacterId = state.selectedCharacterId || 'lia';
    beep('click');
    render();
  });
  document.querySelector('#titleHelp')?.addEventListener('click', () => helpDialog.showModal());
  document.querySelector('#galleryButton')?.addEventListener('click', async () => {
    const sid = state?.id || '';
    const r = await fetch(`/api/gallery?sessionId=${sid}`).then(r => r.json());
    if (!r.ok) return;
    showGallery(r.gallery, r.unlocked, r.total);
  });
  document.querySelector('#helpButton')?.addEventListener('click', () => helpDialog.showModal());
  document.querySelector('#modeToggle')?.addEventListener('click', async () => {
    const next = state.dialogueMode === 'ai' ? 'story' : 'ai';
    const r = await api('/api/mode', { sessionId: state.id, mode: next });
    if (r.ok) { state = r.state; render(); toast(next === 'ai' ? '已切换：AI自由对话' : '已切换：固定故事模式'); }
  });
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
      input.focus();
      beep('click');
    });
  });

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
      await runMutation('/api/battle', { actionId }, actionId === 'skill' ? 'skill' : actionId === 'attack' ? 'hit' : 'click');
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

async function startNewGame() {
  if (busy) return;
  const nameInput = document.querySelector('#playerName');
  const playerName = nameInput?.value.trim() || '队长';
  busy = true;
  render();
  try {
    const payload = await apiPost('/api/session', { playerName });
    state = payload.state;
    meta = payload.meta || meta;
    selectedCharacterId = state.selectedCharacterId || 'lia';
    screen = 'map'; // 开始序章后进入大地图
    localStorage.setItem('moonlit:session', state.id);
    localStorage.setItem('moonlit:name', state.playerName);
    beep('skill');
  } catch (error) {
    showToast(error.message, 'error');
    beep('error');
  } finally {
    busy = false;
    render();
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
  await runMutation('/api/chat', { characterId: selectedCharacterId, message }, 'chat', (payload) => {
    lastAiSource = payload.ai?.source || null;
  });
}

async function runMutation(path, body, sound = 'click', after) {
  if (busy || !state) return;
  busy = true;
  render();
  try {
    const payload = await apiPost(path, { sessionId: state.id, ...body });
    state = payload.state;
    selectedCharacterId = state.selectedCharacterId || selectedCharacterId;
    localStorage.setItem('moonlit:session', state.id);
    after?.(payload);
    beep(sound);
  } catch (error) {
    showToast(error.message, 'error');
    beep('error');
    if (/存档不存在|服务器已重启/.test(error.message)) {
      localStorage.removeItem('moonlit:session');
      state = null;
      screen = 'title';
    }
  } finally {
    busy = false;
    render();
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
    localStorage.setItem('moonlit:session', state.id);
    beep('skill');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    busy = false;
    render();
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

function openSettings() {
  const isOpenAi = meta?.ai?.mode === 'openai';
  settingsContent.innerHTML = `
    <div class="stack">
      <div class="stat-card"><div class="spread"><span class="muted">当前运行方式</span><strong>${isOpenAi ? 'OpenAI 兼容模型' : '剧情保底引擎'}</strong></div><div class="spread" style="margin-top:8px"><span class="muted">模型</span><strong>${escapeHtml(meta?.ai?.model || 'unknown')}</strong></div></div>
      <p class="muted">本地模型由服务器代理，API Key 永远不会发到浏览器。使用 Ollama 时，把项目根目录的 <code>.env.example</code> 复制为 <code>.env</code>，并设置：</p>
      <div class="code-block">AI_MODE=openai\nAI_BASE_URL=http://127.0.0.1:11434/v1\nAI_API_KEY=ollama\nAI_MODEL=qwen3:8b</div>
      <p class="faint">模型不可用、超时或输出越权时，游戏会自动切回角色专属保底台词，主线不会卡死。</p>
    </div>`;
  soundToggle.textContent = `声音：${soundEnabled ? '开' : '关'}`;
  settingsDialog.showModal();
}

soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem('moonlit:sound', soundEnabled ? 'on' : 'off');
  soundToggle.textContent = `声音：${soundEnabled ? '开' : '关'}`;
  if (soundEnabled) beep('click');
});

/* ═══ 导航栏 ═══ */
function navBar() {
  return `
    <nav class="top-nav">
      <div class="nav-brand"><span class="brand-mark"></span><strong>月蚀契约</strong><span class="nav-studio">阳之亮面出品</span></div>
      <div class="nav-links">
        <button class="nav-btn ${screen === 'title' ? 'active' : ''}" data-nav="title">首页</button>
        <button class="nav-btn ${screen === 'map' ? 'active' : ''}" data-nav="map">地图</button>
        <button class="nav-btn ${screen === 'chapters' ? 'active' : ''}" data-nav="chapters">章节</button>
        <button class="nav-btn ${screen === 'gacha' ? 'active' : ''}" data-nav="gacha">召唤</button>
        <button class="nav-btn ${screen === 'costume' ? 'active' : ''}" data-nav="costume">换衣</button>
        <button class="nav-btn ${screen === 'shop' ? 'active' : ''}" data-nav="shop">商店</button>
        <button class="nav-btn ${screen === 'settings' ? 'active' : ''}" data-nav="settings">设置</button>
      </div>
      <div class="nav-credit">${creditMeterHtml()}</div>
    </nav>`;
}

function creditMeterHtml() {
  const balance = creditMeter?.balance ?? playerAccount?.credits ?? 0;
  const todayUsed = creditMeter?.todayUsed ?? 0;
  return `<div class="credit-meter" title="Credit余额 / 今日消耗">
    <span class="credit-icon">◈</span>
    <span class="credit-value">${balance}</span>
    <span class="credit-used">-${todayUsed}today</span>
  </div>`;
}

/* ═══ 大地图页面 ═══ */
function isTownUnlocked(town) {
  return completedChapters.includes(town.unlockChapter);
}

function mapPage() {
  const W = 1000, H = 560;
  const towns = MAP_TOWNS;
  return `${navBar()}
    <main class="page-content map-page">
      <div class="page-header">
        <div class="eyebrow">WORLD MAP · 月蚀大陆</div>
        <h1>自由探索</h1>
        <p class="muted">点击城镇进入对应场景 · 完成章节解锁新城镇</p>
      </div>
      <div class="map-container" id="mapContainer">
        <svg id="worldMap" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="mapBg" cx="50%" cy="40%" r="80%">
              <stop offset="0%" stop-color="#141230"/><stop offset="60%" stop-color="#0c0a20"/><stop offset="100%" stop-color="#060512"/>
            </radialGradient>
            <filter id="mapGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <!-- 背景 -->
          <rect width="${W}" height="${H}" fill="url(#mapBg)" rx="16"/>
          <!-- 装饰：月亮 -->
          <circle cx="${W*0.82}" cy="${H*0.15}" r="35" fill="#d8c6ff" opacity=".12"/>
          <circle cx="${W*0.82}" cy="${H*0.15}" r="28" fill="#e8ddff" opacity=".08"/>
          <!-- 装饰：山脉 -->
          <path d="M${W*0.3} ${H*0.35} L${W*0.35} ${H*0.2} L${W*0.4} ${H*0.35} Z" fill="#2a2650" opacity=".3"/>
          <path d="M${W*0.32} ${H*0.35} L${W*0.35} ${H*0.25} L${W*0.38} ${H*0.35} Z" fill="#3a3570" opacity=".2"/>
          <path d="M${W*0.55} ${H*0.45} L${W*0.6} ${H*0.3} L${W*0.65} ${H*0.45} Z" fill="#2a2650" opacity=".25"/>
          <path d="M${W*0.57} ${H*0.45} L${W*0.6} ${H*0.35} L${W*0.63} ${H*0.45} Z" fill="#3a3570" opacity=".15"/>
          <!-- 装饰：河流 -->
          <path d="M${W*0.15} ${H*0.8} Q${W*0.3} ${H*0.7} ${W*0.45} ${H*0.75} T${W*0.75} ${H*0.65} T${W*0.95} ${H*0.7}" stroke="#1a3a5c" stroke-width="3" fill="none" opacity=".3" stroke-linecap="round"/>
          <!-- 装饰：森林 -->
          <ellipse cx="${W*0.2}" cy="${H*0.5}" rx="40" ry="25" fill="#1a2a1a" opacity=".3"/>
          <ellipse cx="${W*0.5}" cy="${H*0.55}" rx="35" ry="20" fill="#1a2a1a" opacity=".25"/>
          <ellipse cx="${W*0.75}" cy="${H*0.6}" rx="30" ry="18" fill="#1a2a1a" opacity=".2"/>
          <!-- 铁路线（连接城镇） -->
          ${towns.slice(0, -1).map((t, i) => {
            const next = towns[i + 1];
            return `<line x1="${t.x*W/100}" y1="${t.y*H/100}" x2="${next.x*W/100}" y2="${next.y*H/100}" stroke="#4a4570" stroke-width="2" stroke-dasharray="6 4" opacity=".4"/>`;
          }).join('')}
          <!-- 城镇节点 -->
          ${towns.map(t => {
            const unlocked = isTownUnlocked(t);
            const tx = t.x * W / 100, ty = t.y * H / 100;
            return `<g class="town-node ${unlocked ? 'unlocked' : 'locked'}" data-town="${t.id}" transform="translate(${tx},${ty})" style="cursor:${unlocked ? 'pointer' : 'not-allowed'}">
              <circle r="22" fill="${unlocked ? t.color + '22' : '#1a1830'}" stroke="${unlocked ? t.color : '#3a3560'}" stroke-width="2" opacity="${unlocked ? 1 : 0.5}"/>
              <circle r="16" fill="${unlocked ? t.color + '44' : '#0d0b20'}"/>
              <text text-anchor="middle" dy="5" font-size="16" opacity="${unlocked ? 1 : 0.4}">${unlocked ? t.icon : '🔒'}</text>
              <text text-anchor="middle" dy="38" font-size="10" fill="${unlocked ? t.color : '#5c5880'}" font-weight="600">${t.name}</text>
              ${unlocked ? '' : `<text text-anchor="middle" dy="52" font-size="8" fill="#5c5880">第${t.unlockChapter}章解锁</text>`}
            </g>`;
          }).join('')}
          <!-- 玩家标记 -->
          <g id="playerMarker" transform="translate(${playerPos.x*W/100},${playerPos.y*H/100})" filter="url(#mapGlow)">
            <circle r="10" fill="#5ee4ff" opacity=".3"><animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite"/></circle>
            <circle r="6" fill="#5ee4ff"/>
            <text text-anchor="middle" dy="4" font-size="10">🏃</text>
          </g>
        </svg>
      </div>
      <!-- 城镇信息面板 -->
      <div class="map-info-panel" id="mapInfoPanel" style="display:none">
        <div class="map-info-header">
          <span id="infoIcon"></span>
          <h3 id="infoName"></h3>
          <button class="icon-button" onclick="document.getElementById('mapInfoPanel').style.display='none'">×</button>
        </div>
        <p id="infoDesc" class="muted"></p>
        <div class="map-info-actions" id="infoActions"></div>
      </div>
      <!-- 章节进度 -->
      <div class="map-progress">
        <span class="muted">已完成章节: ${completedChapters.length}/${Math.max(...MAP_TOWNS.map(t => t.unlockChapter)) + 1}</span>
        <div class="progress-track" style="flex:1;margin:0 12px;height:6px">
          <div class="progress-fill" style="width:${Math.round(completedChapters.length / (Math.max(...MAP_TOWNS.map(t => t.unlockChapter)) + 1) * 100)}%;background:var(--diamond)"></div>
        </div>
        <button class="button small" onclick="debugUnlockNext()">解锁下一章（测试）</button>
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

  // 点击城镇
  document.querySelectorAll('.town-node.unlocked').forEach(node => {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      const townId = node.dataset.town;
      const town = MAP_TOWNS.find(t => t.id === townId);
      if (town) showTownInfo(town);
    });
  });

  // 悬停城镇显示提示
  document.querySelectorAll('.town-node.locked').forEach(node => {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      const townId = node.dataset.town;
      const town = MAP_TOWNS.find(t => t.id === townId);
      if (town) showToast(`🔒 ${town.name} 需要完成第 ${town.unlockChapter} 章解锁`, 'error');
    });
  });
}

function movePlayer(x, y) {
  playerPos = { x: Math.max(3, Math.min(97, x)), y: Math.max(3, Math.min(97, y)) };
  const marker = document.getElementById('playerMarker');
  if (marker) {
    const W = 1000, H = 560;
    marker.setAttribute('transform', `translate(${playerPos.x*W/100},${playerPos.y*H/100})`);
  }
  beep('click');
}

function showTownInfo(town) {
  const panel = document.getElementById('mapInfoPanel');
  if (!panel) return;
  document.getElementById('infoIcon').textContent = town.icon;
  document.getElementById('infoName').textContent = town.name;
  document.getElementById('infoDesc').textContent = town.desc;

  const actions = document.getElementById('infoActions');
  // 根据城镇决定进入哪个场景
  const sceneMap = {
    start: { label: '开始剧情', screen: 'game', action: () => { if (!state) startNewGame(); else { screen = 'game'; render(); } } },
    station: { label: '进入营地', screen: 'game', action: () => { if (!state) startNewGame(); else { screen = 'game'; render(); } } },
    mooncity: { label: '探索城市', screen: 'game', action: () => { screen = 'game'; render(); } },
    frosttown: { label: '挑战Boss', screen: 'game', action: () => { screen = 'game'; render(); } },
    valhalla: { label: '进入要塞', screen: 'game', action: () => { screen = 'game'; render(); } },
    startower: { label: '登塔观星', screen: 'game', action: () => { screen = 'game'; render(); } },
    nodgate: { label: '穿越之门', screen: 'game', action: () => { screen = 'game'; render(); } },
    terminal: { label: '最终决战', screen: 'game', action: () => { screen = 'game'; render(); } },
  };
  const scene = sceneMap[town.id] || { label: '进入', screen: 'game', action: () => { screen = 'game'; render(); } };

  actions.innerHTML = `
    <button class="button primary" id="enterTownBtn">${scene.label}</button>
    <button class="button secondary" onclick="document.getElementById('mapInfoPanel').style.display='none'">离开</button>
  `;
  document.getElementById('enterTownBtn')?.addEventListener('click', () => {
    document.getElementById('mapInfoPanel').style.display = 'none';
    scene.action();
  });
  panel.style.display = 'block';
}

function debugUnlockNext() {
  const allChapters = [...new Set(MAP_TOWNS.map(t => t.unlockChapter))].sort((a,b) => a-b);
  const nextChapter = allChapters.find(c => !completedChapters.includes(c));
  if (nextChapter !== undefined) {
    completedChapters.push(nextChapter);
    localStorage.setItem('moonlit:chapters', JSON.stringify(completedChapters));
    showToast(`已解锁第 ${nextChapter} 章！新城镇已开放`);
    render();
  } else {
    showToast('全部章节已解锁！');
  }
}

/* ═══ 商店页面 ═══ */
function shopPage() {
  return `${navBar()}
    <main class="page-content">
      <div class="page-header"><div class="eyebrow">KNIGHT'S ALLIANCE · 骑士联盟</div><h1>会员与充值</h1></div>
      <section class="shop-section">
        <h2 class="section-title">会员等级</h2>
        <div class="membership-grid" id="membershipGrid">
          <div class="loader">加载中…</div>
        </div>
      </section>
      <section class="shop-section">
        <h2 class="section-title">钻石充值</h2>
        <div class="diamond-grid" id="diamondGrid">
          <div class="loader">加载中…</div>
        </div>
      </section>
    </main>`;
}

async function loadShop() {
  try {
    const data = await apiGet('/api/membership/tiers');
    const grid = document.querySelector('#membershipGrid');
    const dGrid = document.querySelector('#diamondGrid');
    if (grid) {
      grid.innerHTML = data.tiers.map((t) => `
        <div class="membership-card tier-${t.id}">
          <div class="tier-badge">${t.badge || '🛡'}</div>
          <h3>${escapeHtml(t.name)}</h3>
          <div class="tier-price">¥${t.price}<span>/月</span></div>
          <div class="tier-credit">每日 ${t.dailyCredit} Credit</div>
          <ul class="tier-perks">${t.perks.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>
          <button class="button primary full" data-tier="${t.id}">立即开通</button>
        </div>`).join('');
      grid.querySelectorAll('[data-tier]').forEach((btn) => {
        btn.addEventListener('click', () => purchaseMembershipTier(btn.dataset.tier));
      });
    }
    if (dGrid) {
      dGrid.innerHTML = data.packs.map((p) => `
        <div class="diamond-card">
          <div class="diamond-amount">💎 ${p.diamonds}</div>
          ${p.bonus ? `<div class="diamond-bonus">+${p.bonus} 赠送</div>` : ''}
          <div class="diamond-price">¥${p.price}</div>
          <button class="button secondary full" data-pack="${p.id}">购买</button>
        </div>`).join('');
      dGrid.querySelectorAll('[data-pack]').forEach((btn) => {
        btn.addEventListener('click', () => purchaseDiamondPack(btn.dataset.pack));
      });
    }
  } catch (e) { showToast(e.message, 'error'); }
}

async function purchaseMembershipTier(tierId) {
  await ensureAccount();
  try {
    const r = await apiPost('/api/membership/purchase', { playerId, tierId });
    playerAccount = r.account;
    showToast(r.message || '开通成功！');
    beep('win');
    refreshCredit();
  } catch (e) { showToast(e.message, 'error'); }
}

async function purchaseDiamondPack(packId) {
  await ensureAccount();
  try {
    const r = await apiPost('/api/diamonds/purchase', { playerId, packId });
    playerAccount = r.account;
    showToast(r.message || '购买成功！');
    beep('win');
    render();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ═══ 抽卡页面 ═══ */
function gachaPage() {
  return `${navBar()}
    <main class="page-content">
      <div class="page-header"><div class="eyebrow">SUMMON · 星轨召唤</div><h1>召唤系统</h1>
        <p class="muted">角色池：8位角色（5位主线解锁） · 服饰池：6套主题服饰 × 8角色 · 90抽保底5星</p>
      </div>
      <div class="gacha-tabs">
        <button class="gacha-tab active" data-pool="character">角色池</button>
        <button class="gacha-tab" data-pool="costume">服饰池</button>
      </div>
      <section class="gacha-pool" id="gachaPool"><div class="loader">加载中…</div></section>
      <section class="gacha-actions">
        <button class="button primary large" id="gachaSingle">单抽 · 10 Credit</button>
        <button class="button secondary large" id="gachaTen">十连 · 90 Credit</button>
      </section>
      <section class="gacha-result" id="gachaResult" style="display:none"></section>
    </main>`;
}

let currentGachaPool = 'character';

async function loadGachaPool() {
  try {
    const data = await apiGet('/api/gacha/pools');
    const pool = document.querySelector('#gachaPool');
    if (!pool) return;
    if (currentGachaPool === 'character') {
      pool.innerHTML = `<div class="gacha-grid">${data.characters.map((c) => `
        <div class="gacha-char-card rarity-${c.rarity}">
          <div class="gacha-char-avatar"><img src="${c.portrait || '/assets/lia.png'}" alt="" onerror="this.src='/assets/lia.png'"></div>
          <div class="gacha-char-name">${escapeHtml(c.name)}</div>
          <div class="gacha-char-title">${escapeHtml(c.title)}</div>
          <div class="gacha-stars">${'★'.repeat(c.rarity)}${'☆'.repeat(5 - c.rarity)}</div>
          ${c.unlockChapter ? `<div class="gacha-lock">Ch.${c.unlockChapter}解锁</div>` : '<div class="gacha-free">初始可用</div>'}
        </div>`).join('')}</div>`;
    } else {
      const types = [...new Set(data.costumes.map((c) => c.type))];
      pool.innerHTML = types.map((type) => {
        const items = data.costumes.filter((c) => c.type === type);
        return `<div class="costume-type-group"><h3>${escapeHtml(items[0]?.name?.split('·')[0] || type)}</h3>
          <div class="gacha-grid small">${items.map((c) => `
            <div class="gacha-costume-card rarity-${c.rarity}">
              <div class="costume-icon">👗</div>
              <div class="gacha-char-name">${escapeHtml(c.characterId)}</div>
              <div class="gacha-stars">${'★'.repeat(c.rarity)}</div>
            </div>`).join('')}</div></div>`;
      }).join('');
    }
  } catch (e) { showToast(e.message, 'error'); }
}

async function doGachaPull(count) {
  await ensureAccount();
  try {
    const r = await apiPost('/api/gacha/pull', { playerId, pool: currentGachaPool, count });
    const resultEl = document.querySelector('#gachaResult');
    if (resultEl && r.results) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `<h3>召唤结果</h3><div class="gacha-results-grid">${r.results.map((item) => `
        <div class="gacha-result-card rarity-${item.rarity || 3}">
          <div class="result-icon">${item.rarity >= 5 ? '✦' : item.rarity >= 4 ? '◆' : '●'}</div>
          <div class="result-name">${escapeHtml(item.name || item.id)}</div>
          <div class="gacha-stars">${'★'.repeat(item.rarity || 3)}</div>
        </div>`).join('')}</div>
        <p class="muted">消耗 ${r.cost} Credit · 保底计数 ${r.pity || 0}/90</p>`;
      beep(r.results.some((i) => (i.rarity || 3) >= 5) ? 'win' : 'skill');
    }
    refreshCredit();
  } catch (e) { showToast(e.message, 'error'); beep('error'); }
}

/* ═══ 换衣页面 ═══ */
function costumePage() {
  return `${navBar()}
    <main class="page-content">
      <div class="page-header"><div class="eyebrow">WARDROBE · 换衣间</div><h1>服饰更换</h1>
        <p class="muted">为已抽到的角色更换皮肤。服装通过「召唤 · 服饰池」获取，不同服饰将触发对应分支剧情。</p>
      </div>
      <section class="costume-section" id="costumeSection"><div class="loader">加载中…</div></section>
    </main>`;
}

const COSTUME_TYPE_META = {
  newyear: { emoji: '🧧', frame: 'frame-newyear' },
  maid: { emoji: '🎀', frame: 'frame-maid' },
  christmas: { emoji: '🎄', frame: 'frame-christmas' },
  duanwu: { emoji: '🐉', frame: 'frame-duanwu' },
  anniversary: { emoji: '🎂', frame: 'frame-anniversary' },
  swimsuit: { emoji: '👙', frame: 'frame-swimsuit' }
};

async function loadCostumes() {
  await ensureAccount();
  try {
    const data = await apiGet(`/api/costume?playerId=${playerId}`);
    const section = document.querySelector('#costumeSection');
    if (!section) return;

    const ownedChars = data.ownedCharacters || [];
    const ownedCostumes = data.ownedCostumes || [];
    const equipped = data.equipped || {};
    const types = data.types || {};
    const poolChars = (data.costumePool ? [...new Set(data.costumePool.map((c) => c.characterId))] : []);
    const charInfoMap = {};
    (await apiGet('/api/gacha/pools')).characters.forEach((c) => { charInfoMap[c.id] = c; });

    // 顶部工具栏
    let html = `<div class="wardrobe-toolbar">
      <span class="muted">已拥有角色 ${ownedChars.length} 名 · 服装 ${ownedCostumes.length} 套</span>
      <button class="button small" id="grantAllCostumes">测试：一键解锁全部服装</button>
    </div>`;

    if (ownedChars.length === 0) {
      html += `<div class="wardrobe-empty">
        <div style="font-size:3rem">👗</div>
        <h3>还没有抽到的角色</h3>
        <p class="muted">前往「召唤」抽取角色后，即可在这里为她们更换皮肤。</p>
        <button class="button primary" data-nav="gacha">去召唤</button>
      </div>`;
      section.innerHTML = html;
      section.querySelector('[data-nav]')?.addEventListener('click', (e) => { screen = e.target.dataset.nav; render(); });
      document.querySelector('#grantAllCostumes')?.addEventListener('click', grantAllCostumesAction);
      return;
    }

    // 每个已拥有角色的换装区块
    html += ownedChars.map((charId) => {
      const ch = charInfoMap[charId];
      if (!ch) return '';
      const equippedId = equipped[charId] || null;
      const equippedType = equippedId ? equippedId.split('_').pop() : null;
      const equippedLabel = equippedType ? (types[equippedType] || equippedType) : null;
      const frameClass = equippedType ? (COSTUME_TYPE_META[equippedType]?.frame || '') : '';

      const slots = ['default', ...Object.keys(types)].map((type) => {
        if (type === 'default') {
          const isActive = !equippedId;
          return `<button class="costume-slot ${isActive ? 'active' : ''}" data-char="${charId}" data-costume="default">
            <span class="costume-emoji">👤</span><span>默认服装</span>${isActive ? '<span class="slot-wearing">穿着中</span>' : ''}
          </button>`;
        }
        const costumeId = `${charId}_${type}`;
        const owned = ownedCostumes.includes(costumeId);
        const isActive = equippedId === costumeId;
        const meta = COSTUME_TYPE_META[type] || { emoji: '👗' };
        return `<button class="costume-slot ${isActive ? 'active' : ''} ${owned ? '' : 'locked'}" data-char="${charId}" data-costume="${costumeId}" ${owned ? '' : 'disabled'}
          title="${owned ? '点击装备' : '未拥有 · 通过服饰召唤获取'}">
          <span class="costume-emoji">${owned ? meta.emoji : '🔒'}</span>
          <span>${escapeHtml(types[type])}</span>
          ${isActive ? '<span class="slot-wearing">穿着中</span>' : ''}
        </button>`;
      }).join('');

      return `<div class="costume-char-block">
        <div class="wardrobe-main">
          <div class="wardrobe-portrait ${frameClass}">
            <img src="${ch.portrait}" alt="${escapeHtml(ch.name)}" onerror="this.src='/assets/lia.png'">
            ${equippedType ? `<span class="skin-badge">${COSTUME_TYPE_META[equippedType]?.emoji || '👗'}</span>` : ''}
          </div>
          <div class="wardrobe-info">
            <h3>${escapeHtml(ch.name)}</h3>
            <p class="muted">${escapeHtml(ch.title || '')}</p>
            <p class="wardrobe-current">${equippedLabel ? `当前皮肤：<strong>${COSTUME_TYPE_META[equippedType]?.emoji || ''} ${escapeHtml(equippedLabel)}</strong>` : '当前皮肤：默认服装'}</p>
          </div>
        </div>
        <div class="costume-grid">${slots}</div>
      </div>`;
    }).join('');

    section.innerHTML = html;

    section.querySelectorAll('.costume-slot:not(.locked)').forEach((btn) => {
      btn.addEventListener('click', () => equipCostumeAction(btn.dataset.char, btn.dataset.costume));
    });
    document.querySelector('#grantAllCostumes')?.addEventListener('click', grantAllCostumesAction);
  } catch (e) { showToast(e.message, 'error'); }
}

async function grantAllCostumesAction() {
  await ensureAccount();
  try {
    const r = await apiPost('/api/costume/grant-all', { playerId });
    showToast(`已解锁 ${r.characters} 名角色与 ${r.costumes} 套服装（测试）`);
    beep('win');
    loadCostumes();
  } catch (e) { showToast(e.message, 'error'); }
}

async function equipCostumeAction(characterId, costumeId) {
  await ensureAccount();
  try {
    const r = await apiPost('/api/costume/equip', { playerId, characterId, costumeId });
    if (costumeId === 'default') {
      showToast('已恢复默认服装');
    } else if (r.branchScene) {
      showToast(`已换装！触发分支剧情：${r.branchScene.title || costumeId}`);
    } else {
      showToast('换装成功！');
    }
    beep('skill');
    loadCostumes();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ═══ 设置页面 ═══ */
function settingsPage() {
  return `${navBar()}
    <main class="page-content">
      <div class="page-header"><div class="eyebrow">SETTINGS · 系统设置</div><h1>AI模型与偏好</h1></div>
      <section class="settings-section" id="aiSettingsSection"><div class="loader">加载中…</div></section>
      <section class="settings-section">
        <h2 class="section-title">声音</h2>
        <div class="settings-row"><span>音效反馈</span><button class="button ${soundEnabled ? 'primary' : 'secondary'}" id="settingsSoundToggle">${soundEnabled ? '开启' : '关闭'}</button></div>
      </section>
      <section class="settings-section">
        <h2 class="section-title">后台管理</h2>
        <div class="admin-gate" id="adminGate">
          <p class="muted">运营仪表板需要管理员密码。</p>
          <div class="admin-password-row">
            <input type="password" id="adminPassword" class="chat-input" placeholder="输入管理密码" maxlength="20" style="max-width:200px">
            <button class="button secondary" id="adminUnlock">进入后台</button>
          </div>
          <p class="admin-error" id="adminError" style="display:none;color:#ff6b7c;font-size:.75rem;margin-top:8px">密码错误。</p>
        </div>
      </section>
    </main>`;
}

async function loadSettings() {
  try {
    const data = await apiGet(`/api/settings/ai?playerId=${playerId || ''}`);
    const section = document.querySelector('#aiSettingsSection');
    if (!section) return;
    section.innerHTML = `
      <h2 class="section-title">AI模型预设</h2>
      <div class="model-grid">
        ${data.models.map((m) => `
          <div class="model-card ${m.available ? '' : 'locked'} ${data.active?.id === m.id ? 'active' : ''}">
            <div class="model-name">${escapeHtml(m.name)}</div>
            <div class="model-provider">${escapeHtml(m.provider)}</div>
            <p class="model-desc">${escapeHtml(m.description)}</p>
            ${m.available
              ? `<button class="button ${data.active?.id === m.id ? 'primary' : 'secondary'} full" data-model="${m.id}">${data.active?.id === m.id ? '当前使用' : '切换'}</button>`
              : '<div class="model-locked">即将开放</div>'}
          </div>`).join('')}
      </div>
      <div class="settings-row" style="margin-top:16px"><span class="muted">当前模型</span><strong>${escapeHtml(data.active?.name || 'DeepSeek Flash')}</strong></div>`;
    section.querySelectorAll('[data-model]').forEach((btn) => {
      btn.addEventListener('click', () => switchAiModel(btn.dataset.model));
    });
  } catch (e) { showToast(e.message, 'error'); }
}

async function switchAiModel(modelId) {
  try {
    const r = await apiPost('/api/settings/ai', { playerId: playerId || '', modelId });
    showToast(`已切换至：${r.model?.name || modelId}`);
    beep('click');
    loadSettings();
  } catch (e) { showToast(e.message, 'error'); }
}

/* ═══ 后台仪表板 ═══ */
function dashboardPage() {
  return `${navBar()}
    <main class="page-content">
      <div class="page-header"><div class="eyebrow">ADMIN · 运营仪表板</div><h1>数据监控</h1></div>
      <section class="dashboard-section" id="dashboardSection"><div class="loader">加载中…</div></section>
    </main>`;
}

async function loadDashboard() {
  try {
    const data = await apiGet('/api/admin/dashboard?key=123456');
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
          <div class="chart-label">${day.date?.slice(5) || ''}</div>
          <div class="chart-num">${day.active}</div>
        </div>`).join('')}
      </div>
      <h2 class="section-title" style="margin-top:24px">事件分布</h2>
      <div class="dash-events">${Object.entries(d.eventsByType || {}).map(([k, v]) => `<span class="pill">${escapeHtml(k)}: ${v}</span>`).join('')}</div>`;
  } catch (e) { showToast(e.message, 'error'); }
}

/* ═══ 章节选择页面 ═══ */
function chaptersPage() {
  return `${navBar()}
    <main class="page-content">
      <div class="page-header"><div class="eyebrow">STORY · 剧本系统</div><h1>章节选择</h1>
        <p class="muted">共15章 · 剧本数据独立存储，支持热更新</p>
      </div>
      <section class="chapters-section" id="chaptersSection"><div class="loader">加载中…</div></section>
    </main>`;
}

async function loadChapters() {
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
          <span class="pill">${ch.sceneCount} 场景 · 约${ch.estimatedMinutes}分钟</span>
        </div>
      </button>`).join('')}</div>`;
    section.querySelectorAll('[data-chapter]').forEach((btn) => {
      btn.addEventListener('click', () => openChapter(Number(btn.dataset.chapter)));
    });
  } catch (e) { showToast(e.message, 'error'); }
}

async function openChapter(id) {
  try {
    const data = await apiGet(`/api/scenario/chapter/${id}`);
    const ch = data.chapter;
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = `
      <div class="gallery-card chapter-reader">
        <div class="gallery-header">
          <div class="eyebrow">CHAPTER ${String(id).padStart(2, '0')}</div>
          <h2>${escapeHtml(ch.title)}</h2>
          <button class="icon-button modal-close" id="chapterClose">×</button>
        </div>
        <div class="chapter-scenes">
          ${(ch.scenes || []).map((scene) => `
            <div class="scene-block">
              <h4 class="scene-name">${escapeHtml(scene.name || scene.id)}</h4>
              <p class="scene-bg muted">${escapeHtml(scene.background || '')}</p>
              <div class="scene-events">${(scene.events || []).map((ev) => {
                if (ev.type === 'narration') return `<p class="ev-narration">${escapeHtml(ev.text)}</p>`;
                if (ev.type === 'dialogue') return `<p class="ev-dialogue"><strong>${escapeHtml(ev.speaker)}：</strong>${escapeHtml(ev.text)}</p>`;
                if (ev.type === 'choice') return `<div class="ev-choice">▸ ${escapeHtml(ev.prompt || '选择')}</div>`;
                if (ev.type === 'cg') return `<p class="ev-cg">🎬 CG: ${escapeHtml(ev.description || ev.unlockCg)}</p>`;
                return '';
              }).join('')}</div>
            </div>`).join('')}
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#chapterClose').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  } catch (e) { showToast(e.message, 'error'); }
}

/* ═══ 账户工具 ═══ */
async function ensureAccount() {
  if (playerId && playerAccount) return;
  if (playerId) {
    try {
      const r = await apiGet(`/api/account?playerId=${playerId}`);
      playerAccount = r.account;
      return;
    } catch { /* fall through to create */ }
  }
  const name = state?.playerName || localStorage.getItem('moonlit:name') || '旅行者';
  const r = await apiPost('/api/account/create', { playerName: name });
  playerAccount = r.account;
  playerId = r.account.id;
  localStorage.setItem('moonlit:playerId', playerId);
}

async function refreshCredit() {
  if (!playerId) return;
  try {
    const r = await apiGet(`/api/credit?playerId=${playerId}`);
    creditMeter = r.meter;
  } catch { /* ignore */ }
}

async function boot() {
  app.innerHTML = '<main class="title-screen"><div class="loader" aria-label="加载中"></div></main>';
  try {
    const metaPayload = await apiGet('/api/meta');
    meta = metaPayload.meta;
    const sessionId = localStorage.getItem('moonlit:session');
    if (sessionId) {
      try {
        const sessionPayload = await apiGet(`/api/session/${encodeURIComponent(sessionId)}`);
        state = sessionPayload.state;
        meta = sessionPayload.meta || meta;
        selectedCharacterId = state.selectedCharacterId || 'lia';
      } catch {
        localStorage.removeItem('moonlit:session');
      }
    }
  } catch (error) {
    app.innerHTML = `<main class="title-screen"><section class="modal-card" style="max-width:620px;margin:auto"><div class="eyebrow">SERVER OFFLINE</div><h1>列车没有连上轨道</h1><p class="muted">${escapeHtml(error.message)}</p><p>请在项目目录运行 <code>npm start</code>，再打开终端显示的网址。</p></section></main>`;
    return;
  }
  render();
}

function showGallery(gallery, unlockedCount, total) {
  const overlay = document.createElement('div');
  overlay.className = 'gallery-overlay';
  overlay.innerHTML = `
    <div class="gallery-card">
      <div class="gallery-header">
        <div class="eyebrow">CG GALLERY</div>
        <h2>事件回忆 · ${unlockedCount}/${total}</h2>
        <button class="icon-button modal-close" id="galleryClose">×</button>
      </div>
      <div class="gallery-grid">
        ${gallery.map((cg) => `
          <div class="cg-item ${cg.unlocked ? 'unlocked' : 'locked'}">
            <div class="cg-thumb">${cg.unlocked ? `<img src="${cg.file}" alt="${escapeHtml(cg.title)}" onerror="this.parentElement.innerHTML='<span class=\\'cg-placeholder\\'>🎬</span>'">` : '<span class="cg-placeholder">?</span>'}</div>
            <div class="cg-info"><strong>${cg.unlocked ? escapeHtml(cg.title) : '???'}</strong><p>${cg.unlocked ? escapeHtml(cg.description) : '尚未解锁'}</p></div>
          </div>`).join('')}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#galleryClose').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

boot();
