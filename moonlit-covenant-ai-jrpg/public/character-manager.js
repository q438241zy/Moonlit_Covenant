// 月蚀契约 · 角色管理系统（独立原型页 character-manager.html 的脚本）
//
// 页面受 CSP 保护（script-src 'self'）：不能有内联 <script> 与 on*= 事件属性。
// 所有可交互元素（包括模板字符串里动态生成的）只写 data-action（+ data-* 参数），
// 由文件末尾按事件类型（click / change / input）委托监听，查 ACTIONS 动作表分发。
// 本模块不向 window 暴露任何全局变量。
import { icon } from '/icons.js';

// ============ DATA STORE ============
const STORAGE_KEY = 'moonlit_char_manager';

const DEFAULT_CHARACTERS = [
  {
    id: 'lia', name: '莉亚·赫斯特', nameEn: 'Lia Hest', age: 24, height: '172cm',
    hair: '赤红高马尾，左侧一缕暗红挑染（旧王都火灾疤发色）', eyes: '琥珀金',
    profession: '赤誓骑士 / 前卫破甲', element: '火·契约',
    personality: '嘴硬心软、重视承诺、毒舌急性子。表面用命令口吻和挖苦遮掩温柔，最怕被别人安慰（因为安慰让她想起没能救下的人）。自称\"不会再让任何人死在我面前\"。',
    quirks: ['害羞时别过脸整理肩甲绝不承认', '被夸奖会说\"闭嘴\"但耳朵红', '独自巡逻时低声念已故同伴的名字'],
    playerInteraction: '尊重有担当的人，厌恶空洞承诺；被调戏会先瞪眼再别过头去（耳朵通红）；认真对她说\"我不会丢下你\"会获得她一分沉默，和以后的十倍卖命。',
    likes: ['守信用的人', '好剑', '月光下的火车车厢顶'],
    dislikes: ['被安慰', '不战而退', '甜食（但她抽屉里有半包糖）'],
    relations: [
      { target: 'mia', type: 'bond', desc: '总嫌她吵，但会默默帮她修工具' },
      { target: 'serena', type: 'rival', desc: '互不主动示弱的竞技场，其实互相欣赏' }
    ]
  },
  {
    id: 'mia', name: '米娅·铃', nameEn: 'Mia Lin', age: 21, height: '158cm',
    hair: '青蓝短发，发尾霓虹渐变，右边别扳手形发卡', eyes: '亮青色（瞳孔有淡淡电路反光）',
    profession: '猫耳机关师 / 支援过载', element: '雷·回路',
    personality: '聪明活泼、语速快、用玩笑给恐惧降噪的天才技师。机械猫耳是接收失踪姐姐讯号的改装天线（不是天然兽耳）。越紧张越修东西，被认真倾听反而会突然安静。',
    quirks: ['紧张时左耳（机械耳）无意识转向声源', '给每颗危险螺丝都取了名字', '用\"喵\"收句但绝对不滥用'],
    playerInteraction: '喜欢被问具体的技术问题；对她说\"我相信你的计算\"会让她呆住2秒然后飞速敲键盘；调戏她会用三倍语速的技术术语反杀。',
    likes: ['拆开又装回去的东西', '咖啡因', '被认真倾听'],
    dislikes: ['别人动她的螺丝刀', '被当成小孩子', '狗（\"它们总想咬我的耳朵！\"）'],
    relations: [
      { target: 'lia', type: 'bond', desc: '嘴上嫌弃骑士太死板，但改装炉心时第一个喊莉亚来看' },
      { target: 'serena', type: 'bond', desc: '唯一敢分析塞蕾娜观测仪数据的人' }
    ]
  },
  {
    id: 'serena', name: '塞蕾娜·诺克斯', nameEn: 'Serena Nox', age: 26, height: '169cm',
    hair: '紫黑长直发渐变为月白，左侧编细辫串微型月相盘发饰', eyes: '淡紫（虹膜有极细星轨刻线）',
    profession: '月蚀观测者 / 术式封印', element: '月·观测',
    personality: '冷静克制、观察敏锐的月术师。她用反问检验诚实，不需要讨好任何人。奉命销毁黎明种，已预见三种结局却看不见第四种——对\"看不见的东西\"怀有近乎虔诚的渴望。',
    quirks: ['情绪波动时发饰月相盘倒退一格（她自己不知道）', '从不眨眼超过必要的时间', '每句预言最后一个词总是轻声'],
    playerInteraction: '在意玩家是否诚实，胜过在意玩家对她好不好。突然说\"你在撒谎\"时不用害怕——她只是在测试。调戏她会被反问\"你确定你准备好了吗\"（然后她轻轻笑了）。',
    likes: ['真相（无论多残酷）', '新月之夜', '安静的人'],
    dislikes: ['谎言', '喧哗', '被问\"你在想什么\"'],
    relations: [
      { target: 'lia', type: 'rival', desc: '互相不先低头，但战时会为对方展开最强结界' },
      { target: 'mia', type: 'bond', desc: '米娅是唯一敢乱动她观测仪还活着的人' }
    ]
  },
  {
    id: 'freya', name: '芙蕾娅·霜华', nameEn: 'Freya Frostbloom', age: 23, height: '166cm',
    hair: '冰蓝长发，发梢渐变为纯白雪花状碎片', eyes: '浅冰蓝（极低温时会变深蓝）',
    profession: '霜华术师 / 冻结控制', element: '冰·记忆',
    personality: '表面如冰山般冷静，实则内心炽热如火。不善言辞但行动可靠，用\"冷\"表达关心（比如默默把队友的咖啡冰成合适温度）。对温暖事物（热饮、毛毯、拥抱）有隐秘而强烈的渴望。',
    quirks: ['紧张时周围自动结霜', '收集雪景球（已偷偷买了47个）', '说\"我不冷\"时其实冷得要死'],
    playerInteraction: '被夸奖会嘴角微微上扬然后瞬间板脸；送她热可可羁绊直接拉满；调戏她会把你冻在原地三秒，然后小声说\"……下次穿厚点\"。',
    likes: ['热可可', '雪景球', '暖炉边的夜晚'],
    dislikes: ['酷暑', '对冰的刻板印象', '说自己\"高冷\"的人'],
    relations: [
      { target: 'ayla', type: 'bond', desc: '艾拉的热便当让她防线崩溃' },
      { target: 'lilith', type: 'rival', desc: '两个\"冷面\"互为镜子，冰与暗的默契' }
    ]
  },
  {
    id: 'lilith', name: '莉莉丝·瓦尔哈拉', nameEn: 'Lilith Valhalla', age: 27, height: '174cm',
    hair: '深黑长发渐变为暗紫，两侧各有一条细编辫', eyes: '深紫红（战意升腾时会发亮）',
    profession: '战乙女·审判者 / 制裁输出', element: '暗·审判',
    personality: '严肃寡言的战乙女，对战斗有近乎偏执的完美主义。对妹妹艾拉极度保护但从不表现出来。不擅长接受他人好意——别人帮她包扎，她会说\"多事\"然后第二天默默把你的剑磨好。',
    quirks: ['收集武器但坚决否认是收藏癖', '独处时反复整理妹妹送的护身符', '叫艾拉全名但从不叫她\"小艾\"'],
    playerInteraction: '对她展示战术能力比说一万句好话有用；叫她\"莉莉\"会被沉默瞪视5秒（但下次战斗她冲得更快）；被调戏会面无表情地说\"你想死一次看看吗\"（但没拔刀）。',
    likes: ['好武器', '战斗后的寂静', '妹妹安全（永远不会承认）'],
    dislikes: ['无意义的战斗', '被同情', '妹控笑话'],
    relations: [
      { target: 'ayla', type: 'sister', desc: '双胞胎姐妹（年长3分钟），过度保护到窒息' }
    ]
  },
  {
    id: 'evelyn', name: '伊芙琳·星歌', nameEn: 'Evelyn Starsong', age: 20, height: '163cm',
    hair: '深蓝紫渐变长发，缠绕发光星尘丝线（夜间发光）', eyes: '金色（据说能看见星座轨迹）',
    profession: '星咏者 / 预知辅助', element: '星·命运',
    personality: '慵懒随性的占星术师，常常被误认为喝醉了（其实是严重缺觉——整夜看星星就是睡不着）。有一语道破真相的天赋，说重要预言前眼睛会突然睁圆像猫头鹰，平时却连自己鞋带散了都懒得系。',
    quirks: ['白天永远在打哈欠', '用星座比喻一切（\"你的运气像天蝎座尾巴——藏在看不见的地方\"）', '说梦话时会说出真正的预言'],
    playerInteraction: '半夜三点找她才能听到真心话（白天她只会用星星打哈哈）；调戏她会歪头说\"哦？你的星座今天宜调戏漂亮占星师吗\"然后继续打哈欠。',
    likes: ['星图', '半夜的咖啡', '被认真看待预言'],
    dislikes: ['被当成神棍', '闹钟', '\"天机不可泄露\"这种话'],
    relations: [
      { target: 'ophelia', type: 'bond', desc: '唯一能\"翻译\"奥菲利亚断片语言的人' },
      { target: 'serena', type: 'rival', desc: '星与月——两种不同的\"看见\"' }
    ]
  },
  {
    id: 'ophelia', name: '奥菲利亚·使诺德', nameEn: 'Ophelia Shinod', age: '16（外观）/ ？？（实际）', height: '151cm',
    hair: '银白短发，左侧一缕异常长的刘海遮住左眼', eyes: '左金右紫（异色瞳）',
    profession: '诺德使徒 / 月面行者', element: '月·深渊',
    personality: '天真与疯狂并存。来自月之领域的异界行者，行为完全不可预测。有时像幼童一样好奇地翻别人的口袋，有时突然安静下来说出让人毛骨悚然的真相。有轻微的认知偏差——认为\"咬人\"是表达好感的最高形式。',
    quirks: ['咬玩家的头（戴着头盔也咬）', '走路没声音突然出现在背后', '收集别人掉的纽扣（谁都不知道她拿来干嘛）'],
    playerInteraction: '被她咬是羁绊上升的标志（虽然真的很痛）；不要试图理解她的逻辑——她的逻辑里没有\"不\"字；调戏她会歪头问\"你喜欢被咬，对吗\"然后张开嘴（快跑）。',
    likes: ['纽扣', '咬', '没人发现的角落'],
    dislikes: ['被关在门外', '整齐的东西（会忍不住弄乱）', '\"正常\"这个词'],
    relations: [
      { target: 'evelyn', type: 'bond', desc: '伊芙琳能解读她的星象预言' },
      { target: 'lilith', type: 'rival', desc: '莉莉丝是唯一能防住她\"背后突袭\"的人' }
    ]
  },
  {
    id: 'ayla', name: '艾拉·瓦尔哈拉', nameEn: 'Ayla Valhalla', age: 27, height: '172cm',
    hair: '蜜金色长发，常扎低马尾，耳侧别两枚白色羽毛发饰', eyes: '温和的琥珀色',
    profession: '圣疗骑士 / 守护治疗', element: '光·守护',
    personality: '温柔包容的治愈系，与姐姐莉莉丝形成鲜明对比。试图在战斗中保护所有人——经常忘记保护自己。对姐姐的过度保护既感动又无奈，会用最温柔的方式表达最坚定的反对。',
    quirks: ['偷偷给全队准备便当（每份都不同）', '紧张会疯狂整理装备到发光', '说\"我没事\"时一定有事'],
    playerInteraction: '最容易对玩家敞开心扉；关心玩家健康多于自己；调戏她会脸红低头说\"队长又开玩笑\"但不会真的生气（她姐姐在远处已经拔刀了）。',
    likes: ['做便当', '阳光', '看到别人被自己治愈的表情'],
    dislikes: ['姐姐太保护她', '自己帮不上忙', '浪费食物'],
    relations: [
      { target: 'lilith', type: 'sister', desc: '双胞胎妹妹（晚3分钟出生），温柔对抗姐姐的过度保护' }
    ]
  }
];

// Art asset types
const ART_TYPES = ['立绘', '战斗姿态', '表情差分_害羞', '表情差分_愤怒', '表情差分_微笑', 'Q版立绘', '羁绊技能演出', '受击/负伤'];

// 已交付的原创矢量立绘（docs/ART-DIRECTION.md）：默认把 8 位女主的「立绘」标为已完成
const DEFAULT_ART_STATUS = Object.fromEntries(DEFAULT_CHARACTERS.map(c => [c.id, { '立绘': 'complete' }]));

// Default milestones
const DEFAULT_MILESTONES = [
  { id: 'm1', phase: 'design', phaseLabel: '角色设定确认', date: '2026-07-20', chars: ['lia','mia','serena'], note: '月蚀契约三人组设定已从CHARACTER-DESIGN.md确认' },
  { id: 'm2', phase: 'design', phaseLabel: '角色设定确认', date: '2026-07-22', chars: ['freya','lilith','evelyn','ophelia','ayla'], note: '新增五人组设定完成' },
  { id: 'm3', phase: 'lineart', phaseLabel: '线稿', date: null, chars: ['lia','mia','serena'], note: '三人立绘线稿待启动' },
  { id: 'm4', phase: 'final', phaseLabel: '最终定稿', date: '2026-07-22', chars: ['lia','mia','serena'], note: 'AI生成半身立绘已完成（含水印），待商业级替换' },
  { id: 'm5', phase: 'lineart', phaseLabel: '线稿', date: null, chars: ['freya','lilith','evelyn','ophelia','ayla'], note: '新角色线稿批次待启动' },
  { id: 'm6', phase: 'final', phaseLabel: '最终定稿', date: '2026-10-09', chars: ['lia','mia','serena','freya','lilith','evelyn','ophelia','ayla'], note: '原创矢量半身立绘 ×8 + 服装立绘 ×48 交付（docs/ART-DIRECTION.md）' },
];

const PHASE_LABELS = { design:'角色设定确认', lineart:'线稿', coloring:'上色', final:'最终定稿', vfx:'动作/特效', integration:'整合测试' };
const STATUS_LABELS = { 'complete': '已完成', 'in-progress': '进行中', 'not-started': '未开始' };
const RELATION_LABELS = { sister: '姐妹', rival: '竞争', bond: '羁绊' };

// ============ 美术资源（原创矢量立绘） ============
// 本页沿用旧角色 id 'ayla'，美术资源统一使用 'aila'；自定义角色没有立绘时退回首字头像
const ART_ID = { ayla: 'aila' };
const PORTRAIT_IDS = new Set(['lia', 'mia', 'serena', 'freya', 'lilith', 'evelyn', 'ophelia', 'aila']);
function portraitSrc(id) {
  const artId = ART_ID[id] || id;
  return PORTRAIT_IDS.has(artId) ? `/assets/portraits/${artId}.svg` : '';
}

// ============ STATE ============
let characters = [];
let artStatus = {};  // { charId: { artType: 'not-started'|'in-progress'|'complete' } }
let milestones = [];
let editingCharId = null;

const $ = (id) => document.getElementById(id);
const clone = (v) => JSON.parse(JSON.stringify(v));
const list = (v) => (Array.isArray(v) ? v : []);
const text = (v) => (v == null ? '' : String(v));
// 角色数据可来自表单与导入的 JSON：插入模板前一律转义
const esc = (v) => text(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function loadData() {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { data = null; }
  if (data && typeof data === 'object') {
    characters = Array.isArray(data.characters) ? data.characters : clone(DEFAULT_CHARACTERS);
    artStatus = data.artStatus && typeof data.artStatus === 'object' ? data.artStatus : clone(DEFAULT_ART_STATUS);
    milestones = Array.isArray(data.milestones) ? data.milestones : clone(DEFAULT_MILESTONES);
  } else {
    initDefaults();
  }
  ensureArtStatus();
}

// Ensure all characters and art types exist
function ensureArtStatus() {
  characters.forEach(c => {
    if (!artStatus[c.id] || typeof artStatus[c.id] !== 'object') artStatus[c.id] = {};
    ART_TYPES.forEach(t => {
      if (!STATUS_LABELS[artStatus[c.id][t]]) artStatus[c.id][t] = 'not-started';
    });
  });
}

function initDefaults() {
  characters = clone(DEFAULT_CHARACTERS);
  artStatus = clone(DEFAULT_ART_STATUS);
  milestones = clone(DEFAULT_MILESTONES);
  ensureArtStatus();
  saveData();
}

function saveData() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ characters, artStatus, milestones })); } catch { /* 存储不可用时只保留内存状态 */ }
}

let toastTimer = 0;
function showToast(msg) {
  const t = $('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

function getCharById(id) { return characters.find(c => c.id === id); }
function getCharAccent(id) {
  const map = { lia:'#ff6b7c', mia:'#5ed7ff', serena:'#b58cff', freya:'#8fd4f5', lilith:'#c084fc', evelyn:'#facc15', ophelia:'#f472b6', ayla:'#fbbf24' };
  return map[id] || '#8b87a8';
}
const initial = (c) => esc(Array.from(text(c.name || c.id))[0] || '?');

// 圆形头像（裁立绘脸部）
function avatarHTML(c) {
  const src = portraitSrc(c.id);
  const style = `style="--accent:${getCharAccent(c.id)}"`;
  return src
    ? `<span class="avatar" ${style}><img src="${src}" alt="" loading="lazy"></span>`
    : `<span class="avatar fallback" ${style}>${initial(c)}</span>`;
}
// 角色卡右侧头肩像
function cardPortraitHTML(c) {
  const src = portraitSrc(c.id);
  return src
    ? `<div class="char-portrait"><img src="${src}" alt="${esc(c.name)}" loading="lazy"></div>`
    : `<div class="char-portrait fallback">${initial(c)}</div>`;
}
function charTagHTML(cid) {
  const cc = getCharById(cid);
  return cc ? `<span class="ms-char-tag" style="border-left:2px solid ${getCharAccent(cid)}">${avatarHTML(cc)}${esc(cc.name)}</span>` : '';
}
function artProgress(id) {
  const total = ART_TYPES.length;
  const done = ART_TYPES.filter(t => artStatus[id]?.[t] === 'complete').length;
  return { done, total };
}

// ============ TAB SWITCHING ============
const TABS = ['overview', 'characters', 'art', 'milestones', 'relations'];
const TAB_RENDER = { overview: renderOverview, characters: renderCharacters, art: renderArtTable, milestones: renderMilestones, relations: renderRelationGraph };
let activeTab = 'overview';

function switchTab(tab) {
  if (!TABS.includes(tab)) tab = 'overview';
  activeTab = tab;
  document.querySelectorAll('#mainTabs .tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${tab}`));
  TAB_RENDER[tab]();
}

// ============ OVERVIEW ============
function renderOverview() {
  const total = characters.length;
  const statuses = characters.map(c => artStatus[c.id] || {});
  const completed = statuses.filter(a => ART_TYPES.every(t => a[t] === 'complete')).length;
  // 与角色卡状态一致：已有任一资源推进（进行中/已完成）但未全部完成
  const inProgress = statuses.filter(a => ART_TYPES.some(t => a[t] && a[t] !== 'not-started') && !ART_TYPES.every(t => a[t] === 'complete')).length;
  const completedMS = milestones.filter(m => m.date).length;
  const totalMS = milestones.length;

  $('tab-overview').innerHTML = `
    <div class="overview-grid">
      <div class="stat-card"><div class="stat-num">${total}</div><div class="stat-label">角色总数</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--success)">${completed}</div><div class="stat-label">美术全部完成</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--warn)">${inProgress}</div><div class="stat-label">美术进行中</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--accent-serena)">${completedMS}/${totalMS}</div><div class="stat-label">里程碑达成</div></div>
    </div>
    <div class="progress-section">
      <h2>角色美术进度</h2>
      ${characters.map(c => {
        const { done, total: n } = artProgress(c.id);
        const pct = Math.round(done / n * 100);
        return `<div class="progress-bar-row">
          ${avatarHTML(c)}
          <span class="name" style="color:${getCharAccent(c.id)}" title="${esc(c.name)}">${esc(c.name)}</span>
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${getCharAccent(c.id)}"></div></div>
          <span class="pct">${done}/${n}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="progress-section">
      <h2>最新里程碑</h2>
      <div class="milestone-timeline">
        ${milestones.filter(m => m.date).slice(-4).reverse().map(m => `
          <div class="milestone-item">
            <div class="ms-header"><span class="ms-phase ${esc(m.phase)}">${esc(m.phaseLabel)}</span><span class="ms-date">${esc(m.date)}</span></div>
            <div class="ms-chars">${list(m.chars).map(charTagHTML).join('')}</div>
            <div class="ms-note">${esc(m.note)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ============ CHARACTERS ============
// 重建下拉选项但保留当前选择
function fillCharSelect(select) {
  const value = select.value;
  select.innerHTML = '<option value="">全部角色</option>' + characters.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  select.value = characters.some(c => c.id === value) ? value : '';
}

function renderCharacters() {
  const search = $('charSearch').value.trim().toLowerCase();
  fillCharSelect($('charFilter'));
  const filter = $('charFilter').value;
  let filtered = characters;
  if (search) {
    filtered = filtered.filter(c => [c.name, c.nameEn, c.profession, c.element, c.personality, ...list(c.quirks)]
      .some(v => text(v).toLowerCase().includes(search)));
  }
  if (filter) filtered = filtered.filter(c => c.id === filter);

  $('charGrid').innerHTML = filtered.map(c => {
    const accent = getCharAccent(c.id);
    const { done, total } = artProgress(c.id);
    const status = done === total ? 'complete' : done > 0 ? 'in-progress' : 'not-started';
    const statusText = done === total ? '全部完成' : done > 0 ? `${done}/${total}` : '未开始';
    return `<div class="char-card ${esc(c.id)}" style="--accent:${accent}" data-action="show-char" data-id="${esc(c.id)}" tabindex="0" role="button" aria-label="查看 ${esc(c.name)}">
      <div class="char-card-body">
        <div class="char-card-main">
          <h3 style="color:${accent}">${esc(c.name)}</h3>
          <div class="title-badge" style="background:${accent}22;color:${accent}">${esc(c.profession)}</div>
          <div class="meta-row"><span>年龄 ${esc(c.age)}</span><span>${esc(c.height)}</span><span>${esc(c.element)}</span></div>
          <div class="tags">${list(c.quirks).slice(0, 2).map(q => `<span class="tag">${esc(text(q).slice(0, 16))}…</span>`).join('')}</div>
          <div class="bio">${esc(text(c.personality).slice(0, 90))}…</div>
        </div>
        ${cardPortraitHTML(c)}
      </div>
      <div class="card-footer">
        <span style="color:${accent};font-weight:600;">${esc(c.nameEn)}</span>
        <span><span class="status-dot ${status}"></span>${statusText}</span>
      </div>
    </div>`;
  }).join('') || '<div style="color:var(--faint);padding:30px;text-align:center;grid-column:1/-1">无匹配角色</div>';
  $('charDetail').style.display = 'none';
}

function showCharDetail(id) {
  const c = getCharById(id);
  if (!c) return;
  const accent = getCharAccent(id);
  const src = portraitSrc(id);
  const panel = $('charDetail');
  panel.style.display = 'block';
  panel.innerHTML = `
    <div class="detail-hero" style="--accent:${accent}">
      ${src ? `<div class="detail-portrait"><img src="${src}" alt="${esc(c.name)}立绘"></div>` : `<div class="detail-portrait fallback">${initial(c)}</div>`}
      <div>
        <div class="detail-head">
          <h2 style="color:${accent}">${esc(c.name)} · ${esc(c.nameEn)}</h2>
          <div style="display:flex;gap:6px;">
            <button class="button small" type="button" data-action="open-char-modal" data-id="${esc(id)}">${icon('edit', { size: 14 })}编辑</button>
            <button class="button danger small" type="button" data-action="delete-char" data-id="${esc(id)}">${icon('trash', { size: 14 })}删除</button>
          </div>
        </div>
        <div class="detail-grid">
          <div class="detail-item"><div class="label">职业</div><div class="value">${esc(c.profession)}（${esc(c.element)}）</div></div>
          <div class="detail-item"><div class="label">年龄 · 身高</div><div class="value">${esc(c.age)}岁 · ${esc(c.height)}</div></div>
          <div class="detail-item"><div class="label">发色发型</div><div class="value">${esc(c.hair)}</div></div>
          <div class="detail-item"><div class="label">瞳色</div><div class="value">${esc(c.eyes)}</div></div>
        </div>
        <div class="detail-grid" style="margin-top:14px;">
          <div class="detail-item"><div class="label">性格</div><div class="value">${esc(c.personality)}</div></div>
          <div class="detail-item"><div class="label">特殊癖好</div><div class="value">${list(c.quirks).map((q, i) => `${i + 1}. ${esc(q)}`).join('<br>')}</div></div>
        </div>
        <div class="detail-grid" style="margin-top:14px;">
          <div class="detail-item"><div class="label">喜欢的</div><div class="value">${list(c.likes).map(esc).join('、')}</div></div>
          <div class="detail-item"><div class="label">讨厌的</div><div class="value">${list(c.dislikes).map(esc).join('、')}</div></div>
        </div>
      </div>
    </div>
    <div style="margin-top:16px;padding:16px;background:var(--bg);border-radius:var(--radius);border:1px solid var(--line)">
      <div class="label" style="color:${accent};font-size:.78rem;margin-bottom:6px;">玩家互动模式</div>
      <div class="value">${esc(c.playerInteraction)}</div>
    </div>
    ${list(c.relations).length ? `
    <div style="margin-top:16px;">
      <div class="label" style="margin-bottom:8px;">角色关系</div>
      ${list(c.relations).map(r => {
        const target = getCharById(r.target);
        const type = RELATION_LABELS[r.type] ? r.type : 'bond';
        return `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line)">
          <span style="font-size:.7rem;padding:2px 8px;border-radius:99px;background:${type === 'sister' ? 'rgba(244,114,182,.15)' : type === 'rival' ? 'rgba(255,107,124,.15)' : 'rgba(181,140,255,.15)'};color:${type === 'sister' ? 'var(--accent-ophelia)' : type === 'rival' ? 'var(--accent-lia)' : 'var(--accent-serena)'}">${RELATION_LABELS[type]}</span>
          ${target ? avatarHTML(target) : ''}
          <span style="color:${target ? getCharAccent(r.target) : 'var(--muted)'}">${esc(target ? target.name : r.target)}</span>
          <span style="color:var(--muted);font-size:.82rem;">— ${esc(r.desc)}</span>
        </div>`;
      }).join('')}
    </div>` : ''}
  `;
  panel.scrollIntoView({ behavior: 'smooth' });
}

// 从任意标签页（含关系图）查看角色详情
function viewCharacter(id) {
  if (!getCharById(id)) return;
  if (activeTab !== 'characters') switchTab('characters');
  showCharDetail(id);
}

// ============ MODAL ============
function openCharModal(id) {
  const c = id ? getCharById(id) : null;
  editingCharId = c ? c.id : null;
  $('modalTitle').textContent = c ? '编辑角色' : '新增角色';
  $('modalDelete').style.display = c ? '' : 'none';
  const val = (k) => esc(c?.[k]);
  $('modalBody').innerHTML = `
    <div class="modal-row">
      <div><label for="f_id">角色 ID (英文)</label><input id="f_id" value="${val('id')}" ${c ? 'disabled' : ''} placeholder="如: freya"></div>
      <div><label for="f_name">姓名</label><input id="f_name" value="${val('name')}" placeholder="芙蕾娅·霜华"></div>
    </div>
    <div class="modal-row">
      <div><label for="f_nameEn">英文名</label><input id="f_nameEn" value="${val('nameEn')}" placeholder="Freya Frostbloom"></div>
      <div><label for="f_age">年龄</label><input id="f_age" value="${val('age')}" placeholder="23"></div>
    </div>
    <div class="modal-row">
      <div><label for="f_height">身高</label><input id="f_height" value="${val('height')}" placeholder="166cm"></div>
      <div><label for="f_element">元素</label><input id="f_element" value="${val('element')}" placeholder="冰·记忆"></div>
    </div>
    <label for="f_profession">职业</label><input id="f_profession" value="${val('profession')}" placeholder="霜华术师 / 冻结控制">
    <label for="f_hair">发色发型</label><input id="f_hair" value="${val('hair')}" placeholder="冰蓝长发...">
    <label for="f_eyes">瞳色</label><input id="f_eyes" value="${val('eyes')}" placeholder="浅冰蓝">
    <label for="f_personality">性格</label><textarea id="f_personality">${val('personality')}</textarea>
    <label for="f_quirks">癖好（每行一个）</label><textarea id="f_quirks">${esc(list(c?.quirks).join('\n'))}</textarea>
    <label for="f_playerInteraction">玩家互动模式</label><textarea id="f_playerInteraction">${val('playerInteraction')}</textarea>
    <label for="f_likes">喜欢的（用「、」或逗号分隔）</label><input id="f_likes" value="${esc(list(c?.likes).join('、'))}">
    <label for="f_dislikes">讨厌的（用「、」或逗号分隔）</label><input id="f_dislikes" value="${esc(list(c?.dislikes).join('、'))}">
  `;
  $('charModal').classList.add('open');
  (c ? $('f_name') : $('f_id')).focus();
}

function closeCharModal() {
  $('charModal').classList.remove('open');
  editingCharId = null;
}

const splitList = (s) => s.split(/[、,，]/).map(x => x.trim()).filter(Boolean);

function saveCharacter() {
  const editing = editingCharId;
  const id = editing || $('f_id').value.trim();
  if (!id) return showToast('角色ID不能为空');
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)) return showToast('角色ID需以英文字母开头，仅含英文、数字、- 或 _');
  if (!editing && getCharById(id)) return showToast(`角色ID「${id}」已存在`);
  const field = (k) => $(`f_${k}`).value.trim();
  const data = {
    id,
    name: field('name') || id,
    nameEn: field('nameEn'),
    age: field('age'),
    height: field('height'),
    element: field('element'),
    profession: field('profession'),
    hair: field('hair'),
    eyes: field('eyes'),
    personality: field('personality'),
    quirks: $('f_quirks').value.split('\n').map(x => x.trim()).filter(Boolean),
    playerInteraction: field('playerInteraction'),
    likes: splitList($('f_likes').value),
    dislikes: splitList($('f_dislikes').value),
    relations: editing ? list(getCharById(editing)?.relations) : []
  };
  if (editing) {
    const idx = characters.findIndex(c => c.id === editing);
    if (idx >= 0) characters[idx] = data;
  } else {
    characters.push(data);
  }
  ensureArtStatus();
  saveData();
  closeCharModal();
  refreshAll();
  if (activeTab === 'characters') showCharDetail(id);
  showToast(editing ? '已更新' : '已新增');
}

function deleteCharacter(id) {
  const c = getCharById(id);
  if (!c) return;
  if (!confirm(`确定删除 ${c.name} ？此操作不可撤销。`)) return;
  characters = characters.filter(x => x.id !== id);
  delete artStatus[id];
  saveData();
  if (editingCharId === id) closeCharModal();
  refreshAll();
  showToast('已删除');
}

// ============ ART TABLE ============
function renderArtTable() {
  fillCharSelect($('artFilterChar'));
  const filterChar = $('artFilterChar').value;
  const filterStatus = $('artFilterStatus').value;
  const filtered = filterChar ? characters.filter(c => c.id === filterChar) : characters;

  let rows = '';
  filtered.forEach(c => {
    ART_TYPES.forEach(t => {
      const s = artStatus[c.id]?.[t] || 'not-started';
      if (filterStatus && s !== filterStatus) return;
      rows += `<tr>
        <td><span class="char-cell" style="font-weight:600;color:${getCharAccent(c.id)}">${avatarHTML(c)}${esc(c.name)}</span></td>
        <td>${esc(t)}</td>
        <td><span class="status-badge ${s}">${STATUS_LABELS[s]}</span></td>
        <td><select data-action="set-art-status" data-char="${esc(c.id)}" data-type="${esc(t)}" aria-label="${esc(c.name)} ${esc(t)} 状态">
          ${Object.entries(STATUS_LABELS).reverse().map(([v, label]) => `<option value="${v}" ${s === v ? 'selected' : ''}>${label}</option>`).join('')}
        </select></td>
      </tr>`;
    });
  });

  $('artTable').innerHTML = `
    <thead><tr><th>角色</th><th>资源类型</th><th>状态</th><th>操作</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="4" style="text-align:center;color:var(--faint);padding:30px;">无匹配结果</td></tr>'}</tbody>
  `;
}

function updateArtStatus(charId, artType, value) {
  if (!getCharById(charId) || !ART_TYPES.includes(artType) || !STATUS_LABELS[value]) return;
  if (!artStatus[charId]) artStatus[charId] = {};
  artStatus[charId][artType] = value;
  saveData();
  renderArtTable();
  showToast(value === 'complete' ? '✓ 已标记完成' : value === 'in-progress' ? '● 进行中' : '○ 未开始');
}

// ============ MILESTONES ============
function renderMilestones() {
  $('milestoneList').innerHTML = milestones.map((m, i) => `
    <div class="milestone-item">
      <div class="ms-header">
        <span class="ms-phase ${esc(m.phase)}">${esc(m.phaseLabel)}</span>
        <span class="ms-date">${esc(m.date || '未排期')}</span>
        <button class="button small danger icon-only" type="button" style="margin-left:auto" data-action="delete-milestone" data-index="${i}" aria-label="删除里程碑">${icon('close', { size: 14 })}</button>
      </div>
      <div class="ms-chars">${list(m.chars).map(charTagHTML).join('')}</div>
      <div class="ms-note">${esc(m.note)}</div>
    </div>
  `).join('') || '<div style="color:var(--faint);padding:20px">暂无里程碑</div>';
}

function addMilestone() {
  const phase = (prompt('阶段 (design / lineart / coloring / final / vfx / integration):', 'lineart') || '').trim();
  if (!phase) return;
  const charList = prompt('关联角色ID（逗号分隔，如 lia,mia,serena）:', characters.map(c => c.id).join(','));
  if (!charList) return;
  const note = prompt('备注:', '');
  const date = (prompt('完成日期 (YYYY-MM-DD，留空=未排期):', '') || '').trim();
  milestones.push({
    id: 'm' + Date.now(),
    phase: PHASE_LABELS[phase] ? phase : 'design',
    phaseLabel: PHASE_LABELS[phase] || phase,
    date: date || null,
    chars: charList.split(/[,，]/).map(s => s.trim()).filter(Boolean),
    note: note || ''
  });
  saveData();
  renderMilestones();
  showToast('里程碑已添加');
}

function deleteMilestone(index) {
  const m = milestones[index];
  if (!m) return;
  if (!confirm(`确定删除里程碑「${m.phaseLabel}${m.date ? ' · ' + m.date : ''}」？`)) return;
  milestones.splice(index, 1);
  saveData();
  renderMilestones();
  showToast('已删除里程碑');
}

// ============ RELATION GRAPH ============
function renderRelationGraph() {
  const host = $('relationGraph');
  const W = host.clientWidth || 800;
  const H = 520;
  const cx = W / 2, cy = H / 2 - 10;
  // Positions: ellipse layout（宽屏横向铺开，减少连线标签与节点重叠）
  const rx = Math.max(110, Math.min(W * 0.36, 430)), ry = H * 0.34;
  const positions = {};
  characters.forEach((c, i) => {
    const angle = (i / characters.length) * Math.PI * 2 - Math.PI / 2;
    positions[c.id] = { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry };
  });

  // Collect all relations
  const allRelations = [];
  const seen = new Set();
  characters.forEach(c => {
    list(c.relations).forEach(r => {
      const key = [c.id, r.target].sort().join('-') + '-' + r.type;
      if (!seen.has(key)) {
        seen.add(key);
        allRelations.push({ from: c.id, to: r.target, type: RELATION_LABELS[r.type] ? r.type : 'bond', desc: text(r.desc) });
      }
    });
  });

  const typeColors = { sister: 'var(--accent-ophelia)', bond: 'var(--accent-serena)', rival: 'var(--accent-lia)' };
  const typeWidths = { sister: 2.5, bond: 1.8, rival: 1.5 };
  const typeDash = { sister: 'none', bond: 'none', rival: '6,4' };

  // 节点：立绘脸部圆形裁切（脸部中心约在 832×1216 画布的 (416, 400)，取 ~440px 宽）
  const R = 24, S = (R * 2) / 440;
  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="角色关系图">
      <defs>
        <filter id="rgGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <clipPath id="rgNodeClip"><circle r="${R - 1}"/></clipPath>
      </defs>
      <rect width="100%" height="100%" fill="transparent"/>
      ${allRelations.map(r => {
        const p1 = positions[r.from], p2 = positions[r.to];
        if (!p1 || !p2) return '';
        const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
          stroke="${typeColors[r.type]}" stroke-width="${typeWidths[r.type]}" stroke-dasharray="${typeDash[r.type]}" opacity=".6"/>
        <text x="${mx}" y="${my}" text-anchor="middle" font-size="10" fill="${typeColors[r.type]}" dy="-4" paint-order="stroke" stroke="#1a1838" stroke-width="3" stroke-linejoin="round">${esc(r.desc.slice(0, 12))}</text>`;
      }).join('')}
      ${characters.map(c => {
        const p = positions[c.id];
        const accent = getCharAccent(c.id);
        const src = portraitSrc(c.id);
        const face = src
          ? `<image href="${src}" x="${-416 * S}" y="${-400 * S}" width="${832 * S}" height="${1216 * S}" clip-path="url(#rgNodeClip)" preserveAspectRatio="xMidYMid meet"/>`
          : `<text y="5" text-anchor="middle" font-size="13" fill="${accent}" filter="url(#rgGlow)">${esc(text(c.name).slice(0, 2))}</text>`;
        return `<g class="node" transform="translate(${p.x},${p.y})" data-action="show-char" data-id="${esc(c.id)}" tabindex="0" role="button" aria-label="查看 ${esc(c.name)}">
          <circle r="${R + 7}" fill="${accent}" opacity=".18"/>
          <circle r="${R}" fill="var(--bg)"/>
          ${face}
          <circle class="node-ring" r="${R}" fill="none" stroke="${accent}" stroke-width="2.5"/>
          <text y="${R + 18}" text-anchor="middle" font-size="12" font-weight="600" fill="${accent}" paint-order="stroke" stroke="#1a1838" stroke-width="3" stroke-linejoin="round">${esc(c.name)}</text>
          <text y="${R + 32}" text-anchor="middle" font-size="10" fill="var(--muted)" paint-order="stroke" stroke="#1a1838" stroke-width="3" stroke-linejoin="round">${esc(c.nameEn)}</text>
        </g>`;
      }).join('')}
    </svg>
  `;
}

// ============ EXPORT / IMPORT ============
function exportData() {
  const data = { characters, artStatus, milestones, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `moonlit-characters-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('已导出 JSON');
}

function importData() {
  $('importFile').click();
}

function handleImport(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const valid = data && Array.isArray(data.characters) && data.artStatus && typeof data.artStatus === 'object' && Array.isArray(data.milestones)
        && data.characters.every(c => c && typeof c.id === 'string' && c.id);
      if (valid) {
        characters = data.characters;
        artStatus = data.artStatus;
        milestones = data.milestones;
        ensureArtStatus();
        saveData();
        refreshAll();
        showToast('导入成功！');
      } else {
        showToast('无效的导入文件格式');
      }
    } catch {
      showToast('JSON 解析失败');
    }
  };
  reader.onerror = () => showToast('读取文件失败');
  reader.readAsText(file);
  input.value = '';
}

function refreshAll() {
  renderOverview();
  renderCharacters();
  renderArtTable();
  renderMilestones();
  if (activeTab === 'relations') renderRelationGraph();
}

// 静态 HTML 中的 <span data-icon="名称" data-size="16"> 占位 → 内联 SVG 图标
function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => {
    el.innerHTML = icon(el.dataset.icon, { size: Number(el.dataset.size) || 16 });
  });
}

// ============ 事件动作表（data-action → 处理函数） ============
const ACTIONS = {
  click: {
    'switch-tab': (el) => switchTab(el.dataset.tab),
    'open-char-modal': (el) => openCharModal(el.dataset.id),
    'export': exportData,
    'import': importData,
    'show-char': (el) => viewCharacter(el.dataset.id),
    'delete-char': (el) => deleteCharacter(el.dataset.id),
    'close-modal': closeCharModal,
    'modal-backdrop': (el, e) => { if (e.target === el) closeCharModal(); },
    'modal-delete': () => deleteCharacter(editingCharId),
    'save-char': saveCharacter,
    'add-milestone': addMilestone,
    'delete-milestone': (el) => deleteMilestone(Number(el.dataset.index)),
  },
  change: {
    'import-file': (el) => handleImport(el),
    'filter-chars': renderCharacters,
    'filter-art': renderArtTable,
    'set-art-status': (el) => updateArtStatus(el.dataset.char, el.dataset.type, el.value),
  },
  input: {
    'search-chars': renderCharacters,
  },
};

for (const type of Object.keys(ACTIONS)) {
  document.addEventListener(type, (e) => {
    const el = e.target instanceof Element ? e.target.closest('[data-action]') : null;
    if (!el) return;
    const handler = ACTIONS[type][el.dataset.action];
    if (handler) handler(el, e);
  });
}

document.addEventListener('keydown', (e) => {
  // Escape closes modal
  if (e.key === 'Escape') { closeCharModal(); return; }
  // 角色卡 / 关系图节点（role="button"）支持键盘回车/空格打开
  if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof Element && e.target.matches('[role="button"][data-action="show-char"]')) {
    e.preventDefault();
    viewCharacter(e.target.dataset.id);
  }
});

let resizeTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { if (activeTab === 'relations') renderRelationGraph(); }, 120);
});

// ============ INIT ============
hydrateIcons();
loadData();
renderOverview();
