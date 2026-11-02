// 委托板（技能战）：主菜单「技能」页与主线播放页（story.html 的章节选择页）共用（game/skill-battle.mjs，技能稿第六节）。
// 规则与随机数都在服务器；这里只画编成、委托列表、单位卡、指令选单与战斗记录，赤月放全屏 cut-in。
// 两个页面的按钮样式、轻提示、音效、内容模式各不相同，由调用方传进来；样式在 /skill-board.css，全部挂在 .cboard 下。
import { icon } from './icons.js';
import { paint } from './paint.js';

// 五色（技能稿 2.2：白 绿 蓝 暮紫 赤月，点数 1–5）
export const TIER_META = { white: { label: '白', color: '#dfe3ec' }, green: { label: '绿', color: '#5fcf8f' }, blue: { label: '蓝', color: '#5b8cff' }, purple: { label: '暮紫', color: '#a46bff' }, red: { label: '赤月', color: '#e23a4e' } };
export const TIER_PIPS = { white: 1, green: 2, blue: 3, purple: 4, red: 5 };
export const MATERIAL_NAMES = { white: '练习手记', green: '实战手记', blue: '源律残章', purple: '暮紫秘页', red: '赤月秘页' };
export const OWNER_ICON = { hero: 'sword', lia: 'shield', mia: 'wrench', serena: 'moon', evelyn: 'feather', aila: 'bolt', freya: 'frost', ophelia: 'dragon', lilith: 'dagger' };
const SLOT_MARK = ['①', '②', '③'];

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * 在 host 里挂一块委托板，返回 { load }：打开这一页时调用 load()（重读委托与编成；有进行中的战斗就接着画战斗）。
 * opts.playerId()            账户 id（可以返回 Promise）；没有账户就提示先读主线
 * opts.get(path) / opts.post(path, body)   请求 API，失败时抛出带 message 的 Error
 * opts.btn(variant, size)    按钮的 class（主菜单是 .button，主线播放页是 .btn）
 * opts.toast(message, kind)  kind：'success' | 'error'
 * opts.beep(kind)、opts.mode() → '12+' | '15+'、opts.costumes() → 已穿的服装 { 角色: costumeId }
 */
export function mountCommissionBoard(host, opts) {
  const { get, post } = opts;
  const btn = opts.btn || ((variant, size) => `button ${variant}${size ? ` ${size}` : ''}`);
  const toast = opts.toast || (() => {});
  const beep = opts.beep || (() => {});
  const mode = opts.mode || (() => '15+');
  const costumes = opts.costumes || (() => ({}));
  host.classList.add('cboard');
  let pid = null;
  let board = null; // GET /api/commissions
  let book = null; // GET /api/skills：编成、誓约槽、各人装着的技能
  let battle = null; // 进行中或刚结束的一场
  let target = null;
  let busy = false;
  let seq = 0;

  async function load() {
    const my = (seq += 1);
    if (!board) host.innerHTML = '<p class="cb-loading muted">加载中…</p>';
    try {
      pid = await opts.playerId();
      if (my !== seq) return;
      if (!pid) { host.innerHTML = '<p class="muted">还没有账户：读完一章主线后再来。</p>'; return; }
      const q = `playerId=${encodeURIComponent(pid)}`;
      const [b, k] = await Promise.all([get(`/api/commissions?${q}`), get(`/api/skills?${q}`)]);
      if (my !== seq) return;
      board = b;
      book = k;
      battle = b.active || (battle?.result ? battle : null);
      render();
    } catch (e) {
      if (my === seq) host.innerHTML = `<p class="muted">${esc(e.message)}</p>`;
    }
  }

  function render() {
    if (battle) { renderBattle(); return; }
    if (!board.open) { host.innerHTML = '<p class="muted">通关正式第五章后开放委托板。</p>'; return; }
    host.innerHTML = `${partyHtml()}
      <div class="board-head">
        <span>${icon('calendar', { size: 15 })}今日有奖胜场 <b>${Math.min(board.daily.wins, board.daily.rewarded)}/${board.daily.rewarded}</b>（每胜 练习手记×${board.daily.reward.white}、实战手记×${board.daily.reward.green}；之后每胜 练习手记×${board.daily.repeat.white}）</span>
        <span>${icon('trophy', { size: 15 })}本周挑战 <b>${Math.min(board.weekly.wins, board.weekly.rewarded)}/${board.weekly.rewarded}</b>（每场 实战手记×${board.weekly.reward.green}、源律残章×${board.weekly.reward.blue}）</span>
      </div>
      <div class="commission-grid">${board.list.map((c) => `<article class="commission-card${c.challenge ? ' is-challenge' : ''}">
        <h3>${c.challenge ? icon('trophy', { size: 15 }) : icon('flag', { size: 15 })}${esc(c.title)}</h3>
        <p class="muted">${esc(c.desc)}</p>
        <p class="commission-enemies">${c.enemies.map((n) => `<span>${esc(n)}</span>`).join('')}</p>
        <button class="${btn('primary', 'small')}" data-commission="${esc(c.id)}" type="button">${icon('battle', { size: 14 })}出发</button>
      </article>`).join('')}</div>`;
    bindParty();
    host.querySelectorAll('[data-commission]').forEach((b) => b.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      try {
        const r = await post('/api/commission/start', { playerId: pid, commissionId: b.dataset.commission });
        battle = r.battle;
        target = null;
        beep('skill');
        renderBattle();
        if (host.getBoundingClientRect().top < 0) host.scrollIntoView({ block: 'start' });
      } catch (e) { toast(e.message, 'error'); } finally { busy = false; }
    }));
  }

  // 编成：亚克固定在场，另选 1–2 位（正式05 / 正式10 起）；誓约槽只放个人章已通关的她。下面列出每个人装着的三格
  function partyHtml() {
    const owners = Object.fromEntries(book.owners.map((o) => [o.id, o]));
    const joined = book.owners.filter((o) => !o.sealed && o.id !== 'hero');
    const skillOf = Object.fromEntries(book.skills.filter((s) => !s.sealed).map((s) => [s.id, s]));
    const lineup = ['hero', ...book.party];
    return `<section class="party-box">
      <h3>编成 · 亚克固定在场，另选 ${book.partySize} 位</h3>
      <div class="party-picks">${joined.map((o) => `<label class="party-pick"><input type="checkbox" value="${esc(o.id)}" ${book.party.includes(o.id) ? 'checked' : ''}>${icon(OWNER_ICON[o.id], { size: 14 })}${esc(o.name)}</label>`).join('')}</div>
      <div class="party-row">
        <label class="party-oath">誓约槽 <select data-oath><option value="">（空）</option>${joined.filter((o) => o.personalCleared).map((o) => `<option value="${esc(o.id)}" ${book.oath === o.id ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}</select></label>
        <button class="${btn('secondary', 'small')}" data-save-party type="button">${icon('users', { size: 14 })}保存编成</button>
      </div>
      <ul class="party-lineup">${lineup.map((id) => `<li><b>${icon(OWNER_ICON[id] || 'user', { size: 13 })}${esc(owners[id]?.name || id)}</b>${(book.loadout[id] || []).map((sid, i) => {
        const s = skillOf[sid];
        return s ? `<span class="lineup-skill" style="--tier:${TIER_META[s.tier].color}">${SLOT_MARK[i]}${esc(s.name)}${s.level ? ` +${s.level}` : ''}</span>` : '';
      }).join('')}</li>`).join('')}</ul>
    </section>`;
  }

  function bindParty() {
    host.querySelector('[data-save-party]')?.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      try {
        const party = [...host.querySelectorAll('.party-pick input:checked')].map((i) => i.value);
        const r = await post('/api/skills/party', { playerId: pid, party, oath: host.querySelector('[data-oath]')?.value || null });
        book = { ok: true, ...r.skillbook };
        toast('编成已保存。', 'success');
        beep('click');
        render();
      } catch (e) { toast(e.message, 'error'); beep('error'); } finally { busy = false; }
    });
  }

  function unitCardHtml(u, b) {
    const pct = Math.max(0, Math.round((u.hp / u.maxHp) * 100));
    return `<button type="button" class="unit-card side-${u.side}${u.down ? ' is-down' : ''}${b.current === u.id ? ' is-current' : ''}${target === u.id ? ' is-target' : ''}${u.broken ? ' is-broken' : ''}" data-unit="${esc(u.id)}" ${u.down ? 'disabled' : ''}>
      <div class="unit-name">${u.side === 'ally' ? icon(OWNER_ICON[u.owner] || 'user', { size: 14 }) : ''}${esc(u.name)}${u.charging ? `<span class="unit-charge">蓄力：${esc(u.charging)}</span>` : ''}${u.broken ? '<span class="unit-charge">破防</span>' : ''}</div>
      <div class="bar hp"><i style="width:${pct}%"></i><span>${u.hp}/${u.maxHp}</span></div>
      ${u.side === 'ally' ? `<div class="bar mp"><i style="width:${Math.round((u.mp / u.maxMp) * 100)}%"></i><span>MP ${u.mp}</span></div>` : `<div class="bar brk"><i style="width:${u.brk}%"></i><span>破防 ${u.brk}</span></div>`}
      ${u.weak ? `<div class="unit-weak">弱点：${u.weak.map(esc).join('、')}</div>` : ''}
      <div class="unit-st">${u.st.slice(0, 6).map((s) => `<span>${esc(s.name)}${s.t ? s.t : ''}</span>`).join('')}</div>
    </button>`;
  }

  function renderBattle() {
    const b = battle;
    const units = Object.fromEntries(b.units.map((u) => [u.id, u]));
    const a = b.actions;
    const cur = units[b.current];
    host.innerHTML = `<section class="battle-board mode-${mode() === '12+' ? 'spark' : 'blood'}">
      <div class="battle-top"><h3>${b.challenge ? icon('trophy', { size: 16 }) : icon('flag', { size: 16 })}${esc(b.title)} · 第 ${b.round} 回合</h3>
        <div class="bar res"><i style="width:${b.resonance}%"></i><span>共鸣 ${b.resonance}</span></div>
        <span>${icon('potion', { size: 14 })}药剂 ${b.potions}</span>${b.turret ? `<span>${icon('mech', { size: 14 })}零号炮台 ${b.turret.t}</span>` : ''}${b.field.map((f) => `<span>${esc(f.kind)} ${f.t}</span>`).join('')}
        ${b.result ? '' : `<button class="${btn('ghost', 'small')}" data-flee type="button">撤退</button>`}</div>
      <div class="turn-order">${icon('clock', { size: 14 })}${b.order.map((id) => `<span class="side-${units[id]?.side}">${esc(units[id]?.name || id)}</span>`).join('')}</div>
      <div class="unit-row enemies">${b.enemies.map((id) => unitCardHtml(units[id], b)).join('')}</div>
      <div class="unit-row allies">${b.allies.map((id) => unitCardHtml(units[id], b)).join('')}</div>
      ${b.result ? `<div class="battle-result ${b.result}"><h3>${b.result === 'won' ? '委托完成' : '撤退了'}</h3>${b.reward ? `<p>${Object.entries(b.reward.materials).filter(([, n]) => n).map(([t, n]) => `${MATERIAL_NAMES[t]}×${n}`).join('、') || '这一场没有材料奖励'}</p>` : ''}<button class="${btn('primary')}" data-back type="button">回委托板</button></div>`
        : a ? `<div class="action-menu"><p class="muted">轮到 <b>${esc(cur?.name || '')}</b>${target ? ` · 目标：${esc(units[target]?.name || '')}` : ' · 点一张卡选目标（不选就自动）'}</p>
          <div class="action-buttons">
            <button class="${btn('secondary')}" data-cmd="attack" type="button" ${a.canAttack ? '' : 'disabled'}>${icon('sword', { size: 14 })}普攻</button>
            ${a.skills.map((s) => (s ? `<button class="${btn(`skill-btn tier-${s.tier}`)}" style="--tier:${TIER_META[s.tier].color}" data-cmd="skill" data-slot="${s.slot}" type="button" ${s.usable ? '' : 'disabled'} title="${esc(s.why || '')}"><span>${SLOT_MARK[s.slot - 1]}${esc(s.name)}${s.level ? ` +${s.level}` : ''}</span><small>${s.usable ? `MP ${s.mp}${s.resonance ? ` · 共鸣 ${s.resonance}` : ''}` : esc(s.why)}</small></button>` : '')).join('')}
            <button class="${btn('ghost')}" data-cmd="defend" type="button">${icon('shield', { size: 14 })}防御</button>
            <button class="${btn('ghost')}" data-cmd="item" type="button" ${a.potions > 0 ? '' : 'disabled'}>${icon('potion', { size: 14 })}药剂</button>
            ${a.combos.map((c) => `<button class="${btn('combo-btn')}" data-cmd="combo" data-with="${esc(c.with)}" type="button" ${c.usable ? '' : 'disabled'} title="${esc(c.why)}">${icon('star4', { size: 14 })}合击·${esc(c.name)}</button>`).join('')}
            ${a.oath ? `<button class="${btn('oath-btn')}" data-cmd="oath" type="button" ${a.oath.usable ? '' : 'disabled'} title="${esc(a.oath.why)}">${icon('ring', { size: 14 })}誓约·${esc(a.oath.name)}</button>` : ''}
          </div></div>` : ''}
      <ol class="battle-log">${b.log.slice(-14).map((l) => `<li class="log-${l.kind}">${esc(l.text)}</li>`).join('')}</ol>
    </section>`;
    host.querySelectorAll('[data-unit]').forEach((el) => el.addEventListener('click', () => { target = target === el.dataset.unit ? null : el.dataset.unit; renderBattle(); }));
    host.querySelectorAll('[data-cmd]').forEach((el) => el.addEventListener('click', () => act({ type: el.dataset.cmd, slot: Number(el.dataset.slot) || 0, with: el.dataset.with, target: target || undefined })));
    host.querySelector('[data-flee]')?.addEventListener('click', async () => {
      try { await post('/api/commission/flee', { playerId: pid }); battle = null; load(); } catch (e) { toast(e.message, 'error'); }
    });
    host.querySelector('[data-back]')?.addEventListener('click', () => { battle = null; load(); });
    const log = host.querySelector('.battle-log');
    if (log) log.scrollTop = log.scrollHeight;
  }

  // 赤月：全屏 cut-in，用她当前穿的服装立绘（技能稿 2.2、6.1）
  function showCutIn(unit, text) {
    if (!unit) return;
    const costume = costumes()?.[unit.owner];
    const src = unit.owner === 'hero' ? '/assets/story/npc/aku.svg' : costume ? `/assets/costumes/${costume}.svg` : `/assets/portraits/${unit.owner}.svg`;
    const el = document.createElement('div');
    el.className = 'skill-cutin';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div class="cutin-band"><img src="${esc(paint(src))}" alt=""><p>${esc(text)}</p></div>`;
    document.body.append(el);
    setTimeout(() => el.remove(), 1600);
  }

  async function act(action) {
    if (busy) return;
    busy = true;
    try {
      const before = Object.fromEntries((battle?.units || []).map((u) => [u.id, u.hp]));
      const seenLog = new Set((battle?.log || []).map((l) => `${l.round}|${l.text}`));
      const r = await post('/api/commission/act', { playerId: pid, action });
      battle = r.battle;
      const red = battle.log.find((l) => l.kind === 'red' && !seenLog.has(`${l.round}|${l.text}`));
      if (red) showCutIn(battle.units.find((u) => u.side === 'ally' && red.text.startsWith(u.name)), red.text);
      if (target && battle.units.find((u) => u.id === target)?.down) target = null;
      renderBattle();
      // 受击的单位闪一下：15+ 是血花，12+ 换成火花（技能稿 6.1；女主卡片只泛红、不带伤）
      for (const u of battle.units) if (before[u.id] != null && u.hp < before[u.id]) host.querySelector(`[data-unit="${u.id}"]`)?.classList.add('was-hit');
      beep(battle.result ? (battle.result === 'won' ? 'win' : 'error') : 'click');
    } catch (e) { toast(e.message, 'error'); beep('error'); } finally { busy = false; }
  }

  return { load };
}
