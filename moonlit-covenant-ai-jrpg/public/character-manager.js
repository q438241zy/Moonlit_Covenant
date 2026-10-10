// 月蚀契约 · 角色管理系统（独立原型页 character-manager.html 的脚本）
//
// 页面受 CSP 保护（script-src 'self'）：不能有内联 <script> 与 on*= 事件属性。
// 所有可交互元素（包括模板字符串里动态生成的）只写 data-action（+ data-* 参数），
// 由文件末尾按事件类型（click / change / input）委托监听，查 ACTIONS 动作表分发。
// 本模块不向 window 暴露任何全局变量。
import { icon } from '/icons.js';

// ============ DATA STORE ============
const STORAGE_KEY = 'moonlit_char_manager';
// 默认人设变更时递增：旧存档中的默认角色会被替换为新版本，自建角色保留
const PROFILE_VERSION = 2;

const DEFAULT_CHARACTERS = [
  {
    id: 'lia', name: '莉亚·赫斯特', nameEn: 'Lia Hest', age: 19, height: '172cm',
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
    id: 'mia', name: '米娅·铃', nameEn: 'Mia Lin', age: 18, height: '158cm',
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
    id: 'serena', name: '塞蕾娜·诺克斯', nameEn: 'Serena Nox', age: 19, height: '169cm',
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
    id: 'freya', name: '芙蕾娅·霜华', nameEn: 'Freya Frostbloom', age: 19, height: '170cm',
    hair: '青蓝色波浪长发，发间别冰晶发梳', eyes: '暖琥珀色',
    profession: '冰系魔法师 / 守墓人 · 冻结控制', element: '水·冰',
    personality: '像可靠的大姐姐，说话轻柔，善于照顾伤员和调停争执。擅长察觉别人的需要，却从不表达自己的需要。数年前为阻止魔力瘟疫冻结了整座地下祭堂，把生死未卜的同伴也封在冰里——她害怕解冻之后，必须承认自己没能救下所有人。',
    quirks: ['自然地递热饮、替人整理围巾', '用笑容避开别人对她状况的关心', '酒量差却热衷研究热酒，冷笑话只有米娅会认真分析'],
    playerInteraction: '偶尔叫玩家“小弟弟”，但玩家做出成熟判断时会认真改口叫“队长”；喜欢并肩安静做事，也喜欢偶尔被别人照顾。逼她立刻放下过去、或把自我牺牲称作成熟，会让她把心门重新冻上。',
    likes: ['热饮', '并肩安静做事', '偶尔被照顾'],
    dislikes: ['被逼着立刻放下过去', '把自我牺牲称作成熟', '用世界危机否定休息'],
    relations: [
      { target: 'mia', type: 'bond', desc: '米娅是唯一会认真分析她冷笑话的人' },
      { target: 'serena', type: 'bond', desc: '两个习惯把情绪藏起来的人，彼此心照不宣' }
    ]
  },
  {
    id: 'lilith', name: '莉莉丝·瓦尔哈拉', nameEn: 'Lilith Valhalla', age: 19, height: '168cm',
    hair: '金色长发高束成马尾，鼻梁贴一块小创可贴', eyes: '金色',
    profession: '暗影刺客 / 高速单体输出', element: '木·暗',
    personality: '警惕、尖锐、行动先于思考。七年前瓦尔哈拉家族被蚀宴会屠杀，罪名却被安在家族头上，她逃入翠影影市成为刺客。对街头孩子和流浪动物异常温柔；害怕亲近的人再次被夺走，所以习惯先离开或先攻击。',
    quirks: ['很喜欢被摸头却嘴硬，真被摸会僵住几秒', '黑金轻甲、单侧短披风，双匕首“昼盲”“夜醒”从不离身', '动作像猫科动物，落地没有声音'],
    playerInteraction: '对玩家的安危容易冲动；训练后递水、给她明确而不带怜悯的肯定最有效。从背后突然抓住她、拿她和艾拉比较、说她只是“可怜的幸存者”，都是雷区。',
    likes: ['安静的陪伴', '被认可', '街头的流浪猫'],
    dislikes: ['被同情', '被拿来和妹妹比较', '有人从背后靠近'],
    relations: [
      { target: 'ayla', type: 'sister', desc: '妹妹艾拉被圣教收养，长大后被教导“姐姐背叛了家族”' },
      { target: 'serena', type: 'rival', desc: '一度把亚克当成被塞雷娜迷惑的教团棋子' }
    ]
  },
  {
    id: 'evelyn', name: '伊芙琳·星歌', nameEn: 'Evelyn Starsong', age: 18, height: '160cm',
    hair: '浅金偏白长发，编成松散侧辫，额前戴羽翼形圣冠', eyes: '星蓝色',
    profession: '圣教圣女 / 纯结持有者 · 治疗净化', element: '光·纯结',
    personality: '胆小、爱哭、说话很轻，常从柱子、窗边或人群后远远看着亚克。但她并不无能——有人受伤时会一边流泪一边坚持施法。从小在白塔长大，发言、服装、朋友甚至喜欢的花都被规定；她害怕自己真实的愿望会让所有信徒失望。',
    quirks: ['一聊到草莓蛋糕就会突然非常坚定', '偷偷练习普通人打招呼的方式', '记得每个普通人的名字和伤势'],
    playerInteraction: '需要不被催促的陪伴：远远挥手、写着具体内容的小纸条都会让她开心很久。称她“完美圣女”、替她回答问题、把哭泣当成无能、要求她为团队牺牲，都是雷区。',
    likes: ['草莓蛋糕', '小纸条', '不被催促的陪伴'],
    dislikes: ['被称作“完美圣女”', '被替自己做决定', '被要求牺牲'],
    relations: [
      { target: 'lia', type: 'bond', desc: '因为草莓蛋糕和莉亚结成了意外的同盟' },
      { target: 'ayla', type: 'bond', desc: '同在圣辉教国长大，艾拉总想保护她' }
    ]
  },
  {
    id: 'ophelia', name: '奥菲利亚·使诺德', nameEn: 'Ophelia Shinod', age: 19, height: '172cm',
    hair: '铜红色狂野长发，额侧一对小龙角', eyes: '金紫异色瞳（左金右紫）',
    profession: '龙族圣女 / 变形者 · 爆发压制', element: '土·龙术',
    personality: '外表端庄自信，带着古老的礼仪感，实际非常好奇，对人类日常缺乏常识，爱收集人类的小物件。她能读取历代龙王的记忆，也因此被要求放弃个人偏好，成为“所有祖先共同的声音”——她害怕拒绝祖先之后，自己就不再算龙族。',
    quirks: ['幼龙形态会轻咬人的头顶确认气味、叼走餐具、睡在金币堆上', '恢复人形后假装什么都没发生', '笑起来露出一颗小虎牙'],
    playerInteraction: '用轻咬头顶表达亲近，玩家可以接受、制止，或改成碰拳——她都会记住。交换名字、分享食物、触碰角或鳞片前先询问，都会让她高兴。把龙族当坐骑、要求她代表所有龙，是雷区。',
    likes: ['人类的小物件', '分享食物', '交换名字'],
    dislikes: ['被当成坐骑', '被要求代表所有龙', '被鼓励吞下全部祖忆'],
    relations: [
      { target: 'evelyn', type: 'bond', desc: '对伊芙琳的“纯结”充满好奇' },
      { target: 'lilith', type: 'rival', desc: '莉莉丝是少数能察觉她悄悄靠近的人' }
    ]
  },
  {
    id: 'ayla', name: '艾拉·瓦尔哈拉', nameEn: 'Ayla Valhalla', age: 18, height: '165cm',
    hair: '金色齐肩短发', eyes: '明亮的蓝色',
    profession: '光明骑士 / 快速坦克 · 反击', element: '光·圣雷',
    personality: '开朗、好胜、行动大胆，擅长用轻佻的挑衅逼对手认真。家族灭门时被圣教骑士救走，被教导姐姐背叛了家族，于是把服从当成偿还救命之恩，把“光明骑士”的身份当成自己仍有价值的证明。观察细致，能察觉别人不敢说出口的犹豫。',
    quirks: ['挑衅成功后若被认真反击，会短暂慌乱，再装作一切都在计划内', '蓝金轻甲的披风内侧，偷偷保留着瓦尔哈拉黑金家纹', '光剑“晨罚”总斜挎在肩后'],
    playerInteraction: '喜欢公平决斗和明确的规则，爱用“这点力气也想保护别人？”挑战玩家；被坚定地说“不”反而会认真对待你。把她当成莉莉丝的附属、或用“服从命令”替她开脱，是雷区。',
    likes: ['公平决斗', '明确的规则', '被认真对待'],
    dislikes: ['被当成姐姐的附属', '无条件的赞美', '没有命令时的空白'],
    relations: [
      { target: 'lilith', type: 'sister', desc: '奉命追捕姐姐莉莉丝，第27章才与她正式相认' },
      { target: 'evelyn', type: 'bond', desc: '一起在圣辉教国长大，习惯挡在她前面' }
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
    if ((data.profileVersion || 1) < PROFILE_VERSION) {
      const defaults = new Map(DEFAULT_CHARACTERS.map((c) => [c.id, c]));
      characters = characters.map((c) => (defaults.has(c.id) ? clone(defaults.get(c.id)) : c));
      saveData();
    }
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
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ profileVersion: PROFILE_VERSION, characters, artStatus, milestones })); } catch { /* 存储不可用时只保留内存状态 */ }
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
