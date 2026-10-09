// 月蚀契约 · 星轨召唤（独立原型页 gacha-system.html 的脚本）
//
// 页面受 CSP 保护（script-src 'self'）：不能有内联 <script> 与 on*= 事件属性。
// 所有可交互元素（包括模板字符串里动态生成的）只写 data-action（+ data-* 参数），
// 由文件末尾按事件类型（click / change / input）委托监听，查 ACTIONS 动作表分发。
// 本模块不向 window 暴露任何全局变量。
import { icon } from '/icons.js';

// ============ 美术资源（原创矢量美术，见 docs/ART-DIRECTION.md） ============
// 本页沿用旧角色 id 'ayla'，美术资源统一使用 'aila'
const ART_ID = { ayla: 'aila' };
const artId = (id) => ART_ID[id] || id;
const ART = {
  portrait: (id) => `/assets/portraits/${artId(id)}.svg`,
  costume: (owner, type) => `/assets/costumes/${artId(owner)}_${type}.svg`
};

// ============ 完整 RPG 物品池（icon = /icons.js 中的图标名） ============
const CHARACTERS = [
  {id:'lia',name:'莉亚·赫斯特',type:'character',rarity:'legendary',icon:'sword',title:'赤誓骑士'},
  {id:'mia',name:'米娅·铃',type:'character',rarity:'legendary',icon:'wrench',title:'猫耳机关师'},
  {id:'serena',name:'塞蕾娜·诺克斯',type:'character',rarity:'legendary',icon:'moon',title:'月蚀观测者'},
  {id:'freya',name:'芙蕾娅·霜华',type:'character',rarity:'legendary',icon:'snowflake',title:'霜华术师'},
  {id:'lilith',name:'莉莉丝·瓦尔哈拉',type:'character',rarity:'legendary',icon:'lily',title:'战乙女审判者'},
  {id:'evelyn',name:'伊芙琳·星歌',type:'character',rarity:'legendary',icon:'star',title:'星咏者'},
  {id:'ophelia',name:'奥菲利亚·使诺德',type:'character',rarity:'legendary',icon:'fang',title:'诺德使徒'},
  {id:'ayla',name:'艾拉·瓦尔哈拉',type:'character',rarity:'legendary',icon:'dove',title:'圣疗骑士'}
];

// ===== 武器池 =====
const WEAPONS = [
  // 传说（8件角色专武）
  {id:'w_lia',name:'月蚀圣剑',type:'weapon',rarity:'legendary',icon:'sword',owner:'lia',stats:'攻击力+45 暴击+12%'},
  {id:'w_mia',name:'九命回路核心',type:'weapon',rarity:'legendary',icon:'orb',owner:'mia',stats:'攻击力+38 技能冷却-20%'},
  {id:'w_serena',name:'静月封界仪',type:'weapon',rarity:'legendary',icon:'eclipse',owner:'serena',stats:'攻击力+42 封印强度+30%'},
  {id:'w_freya',name:'霜华星杖',type:'weapon',rarity:'legendary',icon:'wand',owner:'freya',stats:'攻击力+40 冻结时间+2s'},
  {id:'w_lilith',name:'瓦尔哈拉双刃',type:'weapon',rarity:'legendary',icon:'battle',owner:'lilith',stats:'攻击力+48 审判伤害+25%'},
  {id:'w_evelyn',name:'星咏竖琴',type:'weapon',rarity:'legendary',icon:'harp',owner:'evelyn',stats:'攻击力+35 预知回合+1'},
  {id:'w_ophelia',name:'诺德之眼',type:'weapon',rarity:'legendary',icon:'eye',owner:'ophelia',stats:'攻击力+44 认知污染+15%'},
  {id:'w_ayla',name:'圣光羽盾',type:'weapon',rarity:'legendary',icon:'guard',owner:'ayla',stats:'防御力+35 治疗量+40%'},
  // 史诗
  {id:'w_e1',name:'赤焰之刃',type:'weapon',rarity:'epic',icon:'flame',stats:'攻击力+32 灼烧附加'},
  {id:'w_e2',name:'霜月弯刀',type:'weapon',rarity:'epic',icon:'moon',stats:'攻击力+30 攻速+15%'},
  {id:'w_e3',name:'雷霆回路枪',type:'weapon',rarity:'epic',icon:'bolt',stats:'攻击力+28 感电触发'},
  {id:'w_e4',name:'暗影长镰',type:'weapon',rarity:'epic',icon:'bane',stats:'攻击力+34 暗蚀叠加'},
  {id:'w_e5',name:'圣歌法典',type:'weapon',rarity:'epic',icon:'book',stats:'攻击力+26 法力回复+20%'},
  {id:'w_e6',name:'破晓巨剑',type:'weapon',rarity:'epic',icon:'sword',stats:'攻击力+36 击退效果'},
  {id:'w_e7',name:'月痕短匕',type:'weapon',rarity:'epic',icon:'dagger',stats:'攻击力+27 背刺+30%'},
  {id:'w_e8',name:'深渊法球',type:'weapon',rarity:'epic',icon:'moon-orb',stats:'攻击力+29 召唤深渊触手'},
  // 精良
  {id:'w_r1',name:'精钢长剑',type:'weapon',rarity:'rare',icon:'sword',stats:'攻击力+22 耐久+15%'},
  {id:'w_r2',name:'机关弩',type:'weapon',rarity:'rare',icon:'bow',stats:'攻击力+20 连射+1'},
  {id:'w_r3',name:'术士短杖',type:'weapon',rarity:'rare',icon:'wand',stats:'攻击力+18 咏唱-10%'},
  {id:'w_r4',name:'骑士长枪',type:'weapon',rarity:'rare',icon:'spear',stats:'攻击力+24 突刺+20%'},
  {id:'w_r5',name:'猎人弓',type:'weapon',rarity:'rare',icon:'bow',stats:'攻击力+19 射程+25%'},
  {id:'w_r6',name:'双刃匕首',type:'weapon',rarity:'rare',icon:'dagger',stats:'攻击力+21 流血+15%'},
  {id:'w_r7',name:'元素法杖',type:'weapon',rarity:'rare',icon:'wand',stats:'攻击力+17 元素伤害+20%'},
  {id:'w_r8',name:'月刃',type:'weapon',rarity:'rare',icon:'moon',stats:'攻击力+23 夜战加成'},
  {id:'w_r9',name:'破甲战锤',type:'weapon',rarity:'rare',icon:'hammer',stats:'攻击力+25 破防+20%'},
  {id:'w_r10',name:'咒术长鞭',type:'weapon',rarity:'rare',icon:'whip',stats:'攻击力+16 诅咒附加'},
  // 优良
  {id:'w_u1',name:'铁剑',type:'weapon',rarity:'uncommon',icon:'sword',stats:'攻击力+14'},
  {id:'w_u2',name:'短弓',type:'weapon',rarity:'uncommon',icon:'bow',stats:'攻击力+12 命中率+5%'},
  {id:'w_u3',name:'学徒法杖',type:'weapon',rarity:'uncommon',icon:'wand',stats:'攻击力+11 魔力+8'},
  {id:'w_u4',name:'训练枪',type:'weapon',rarity:'uncommon',icon:'spear',stats:'攻击力+13 突刺+10%'},
  {id:'w_u5',name:'皮质护腕',type:'weapon',rarity:'uncommon',icon:'bracer',stats:'攻击力+10 格挡+5%'},
  {id:'w_u6',name:'铜指虎',type:'weapon',rarity:'uncommon',icon:'fist',stats:'攻击力+15 击退+10%'},
  {id:'w_u7',name:'木制法杖',type:'weapon',rarity:'uncommon',icon:'wand',stats:'攻击力+9 咏唱-5%'},
  {id:'w_u8',name:'旅人短刀',type:'weapon',rarity:'uncommon',icon:'dagger',stats:'攻击力+11 便携+20%'},
  // 普通
  {id:'w_c1',name:'木剑',type:'weapon',rarity:'common',icon:'sword',stats:'攻击力+6'},
  {id:'w_c2',name:'训练弓',type:'weapon',rarity:'common',icon:'bow',stats:'攻击力+5'},
  {id:'w_c3',name:'基础魔杖',type:'weapon',rarity:'common',icon:'wand',stats:'攻击力+4 魔力+3'},
  {id:'w_c4',name:'旧匕首',type:'weapon',rarity:'common',icon:'dagger',stats:'攻击力+7'},
  {id:'w_c5',name:'见习骑士剑',type:'weapon',rarity:'common',icon:'sword',stats:'攻击力+8'},
  {id:'w_c6',name:'猎人小刀',type:'weapon',rarity:'common',icon:'dagger',stats:'攻击力+5 剥皮+10%'},
  {id:'w_c7',name:'流浪者手杖',type:'weapon',rarity:'common',icon:'wand',stats:'攻击力+4'},
  {id:'w_c8',name:'农用手斧',type:'weapon',rarity:'common',icon:'axe',stats:'攻击力+7 伐木+20%'},
];

// ===== 防具/装备池 =====
const EQUIPMENTS = [
  // 传说
  {id:'eq_l1',name:'月蚀守护铠',type:'equipment',rarity:'legendary',icon:'guard',stats:'防御+42 全抗性+15%'},
  {id:'eq_l2',name:'星轨披风',type:'equipment',rarity:'legendary',icon:'cloak',stats:'防御+38 闪避+20%'},
  {id:'eq_l3',name:'契约胸甲',type:'equipment',rarity:'legendary',icon:'armor',stats:'防御+45 契约之力+10%'},
  {id:'eq_l4',name:'瓦尔哈拉战裙',type:'equipment',rarity:'legendary',icon:'dress',stats:'防御+40 战意+25%'},
  {id:'eq_l5',name:'诺德行者斗篷',type:'equipment',rarity:'legendary',icon:'cloak',stats:'防御+36 隐匿+30%'},
  // 史诗
  {id:'eq_e1',name:'回路护腕',type:'equipment',rarity:'epic',icon:'bracer',stats:'防御+28 技能急速+12%'},
  {id:'eq_e2',name:'深渊护符',type:'equipment',rarity:'epic',icon:'amulet',stats:'防御+26 暗抗+25%'},
  {id:'eq_e3',name:'极光长靴',type:'equipment',rarity:'epic',icon:'boot',stats:'防御+24 移速+15%'},
  {id:'eq_e4',name:'赤誓肩甲',type:'equipment',rarity:'epic',icon:'armor',stats:'防御+30 火抗+20%'},
  {id:'eq_e5',name:'星尘腰带',type:'equipment',rarity:'epic',icon:'belt',stats:'防御+25 法力+40'},
  {id:'eq_e6',name:'暗月面纱',type:'equipment',rarity:'epic',icon:'mask',stats:'防御+22 暴击+8%'},
  {id:'eq_e7',name:'誓约护手',type:'equipment',rarity:'epic',icon:'gauntlet',stats:'防御+27 攻速+10%'},
  {id:'eq_e8',name:'雷霆胫甲',type:'equipment',rarity:'epic',icon:'greaves',stats:'防御+29 雷抗+22%'},
  // 精良
  {id:'eq_r1',name:'银鳞甲',type:'equipment',rarity:'rare',icon:'armor',stats:'防御+20 光抗+10%'},
  {id:'eq_r2',name:'机关靴',type:'equipment',rarity:'rare',icon:'boot',stats:'防御+16 弹跳+15%'},
  {id:'eq_r3',name:'月痕指环',type:'equipment',rarity:'rare',icon:'ring',stats:'防御+14 魔力+20'},
  {id:'eq_r4',name:'巡逻者披风',type:'equipment',rarity:'rare',icon:'cloak',stats:'防御+17 侦察+20%'},
  {id:'eq_r5',name:'术士长袍',type:'equipment',rarity:'rare',icon:'cloak',stats:'防御+15 咏唱-8%'},
  {id:'eq_r6',name:'猎人护胸',type:'equipment',rarity:'rare',icon:'armor',stats:'防御+18 暴击+5%'},
  {id:'eq_r7',name:'守卫者头盔',type:'equipment',rarity:'rare',icon:'helmet',stats:'防御+19 生命+50'},
  {id:'eq_r8',name:'符文护腿',type:'equipment',rarity:'rare',icon:'greaves',stats:'防御+17 土抗+15%'},
  // 优良
  {id:'eq_u1',name:'铁护腕',type:'equipment',rarity:'uncommon',icon:'bracer',stats:'防御+12'},
  {id:'eq_u2',name:'皮质护甲',type:'equipment',rarity:'uncommon',icon:'armor',stats:'防御+10 闪避+5%'},
  {id:'eq_u3',name:'学徒勋章',type:'equipment',rarity:'uncommon',icon:'medal',stats:'防御+8 经验+5%'},
  {id:'eq_u4',name:'旅行者斗篷',type:'equipment',rarity:'uncommon',icon:'cloak',stats:'防御+9 耐寒+15%'},
  {id:'eq_u5',name:'铜腰带',type:'equipment',rarity:'uncommon',icon:'belt',stats:'防御+7 负重+20%'},
  {id:'eq_u6',name:'步兵头盔',type:'equipment',rarity:'uncommon',icon:'helmet',stats:'防御+11 生命+30'},
  {id:'eq_u7',name:'侦察兵靴',type:'equipment',rarity:'uncommon',icon:'boot',stats:'防御+9 移速+8%'},
  // 普通
  {id:'eq_c1',name:'布衣',type:'equipment',rarity:'common',icon:'tunic',stats:'防御+5'},
  {id:'eq_c2',name:'木盾',type:'equipment',rarity:'common',icon:'buckler',stats:'防御+7 格挡+3%'},
  {id:'eq_c3',name:'草鞋',type:'equipment',rarity:'common',icon:'boot',stats:'防御+4 移速+3%'},
  {id:'eq_c4',name:'旅人披风',type:'equipment',rarity:'common',icon:'cloak',stats:'防御+5 风抗+8%'},
  {id:'eq_c5',name:'皮手套',type:'equipment',rarity:'common',icon:'gauntlet',stats:'防御+6'},
  {id:'eq_c6',name:'布帽',type:'equipment',rarity:'common',icon:'hat',stats:'防御+4 中暑-10%'},
  {id:'eq_c7',name:'旧腰带',type:'equipment',rarity:'common',icon:'belt',stats:'防御+5 口袋+2'},
];

// ===== 药品/消耗品池 =====
const CONSUMABLES = [
  // 传说
  {id:'con_l1',name:'月露仙药',type:'consumable',rarity:'legendary',icon:'potion',stats:'全队完全恢复+清除异常'},
  {id:'con_l2',name:'星轨秘药',type:'consumable',rarity:'legendary',icon:'pill',stats:'永久攻击力+3（唯一）'},
  {id:'con_l3',name:'诺德圣水',type:'consumable',rarity:'legendary',icon:'flask',stats:'免疫死亡1次（持续3回合）'},
  // 史诗
  {id:'con_e1',name:'凤凰之血',type:'consumable',rarity:'epic',icon:'blood',stats:'复活+50%生命'},
  {id:'con_e2',name:'全恢复药水',type:'consumable',rarity:'epic',icon:'potion',stats:'生命完全恢复'},
  {id:'con_e3',name:'魔力涌泉剂',type:'consumable',rarity:'epic',icon:'drop',stats:'法力完全恢复'},
  {id:'con_e4',name:'战斗兴奋剂',type:'consumable',rarity:'epic',icon:'elixir',stats:'攻击+30%持续3回合'},
  {id:'con_e5',name:'万能解毒剂',type:'consumable',rarity:'epic',icon:'pill',stats:'清除所有异常状态'},
  {id:'con_e6',name:'隐身药水',type:'consumable',rarity:'epic',icon:'ghost',stats:'回避2回合'},
  // 精良
  {id:'con_r1',name:'高级恢复药水',type:'consumable',rarity:'rare',icon:'potion',stats:'恢复60%生命'},
  {id:'con_r2',name:'高级魔力药水',type:'consumable',rarity:'rare',icon:'drop',stats:'恢复60%法力'},
  {id:'con_r3',name:'攻击药水',type:'consumable',rarity:'rare',icon:'elixir',stats:'攻击+15%持续5回合'},
  {id:'con_r4',name:'防御药水',type:'consumable',rarity:'rare',icon:'potion',stats:'防御+20%持续5回合'},
  {id:'con_r5',name:'速度药水',type:'consumable',rarity:'rare',icon:'pill',stats:'速度+25%持续3回合'},
  {id:'con_r6',name:'解毒剂',type:'consumable',rarity:'rare',icon:'pill',stats:'清除中毒'},
  {id:'con_r7',name:'清醒剂',type:'consumable',rarity:'rare',icon:'pill',stats:'清除混乱/睡眠'},
  {id:'con_r8',name:'耐火药剂',type:'consumable',rarity:'rare',icon:'flask',stats:'火抗+40%持续5回合'},
  {id:'con_r9',name:'耐寒药剂',type:'consumable',rarity:'rare',icon:'flask',stats:'冰抗+40%持续5回合'},
  // 优良
  {id:'con_u1',name:'恢复药水',type:'consumable',rarity:'uncommon',icon:'potion',stats:'恢复30%生命'},
  {id:'con_u2',name:'魔力药水',type:'consumable',rarity:'uncommon',icon:'drop',stats:'恢复30%法力'},
  {id:'con_u3',name:'绷带',type:'consumable',rarity:'uncommon',icon:'bandage',stats:'每回合恢复5%生命持续3回合'},
  {id:'con_u4',name:'提神饮料',type:'consumable',rarity:'uncommon',icon:'cup',stats:'恢复15%生命+法力'},
  {id:'con_u5',name:'解毒草',type:'consumable',rarity:'uncommon',icon:'herb',stats:'解除轻度中毒'},
  {id:'con_u6',name:'暖身汤',type:'consumable',rarity:'uncommon',icon:'bowl',stats:'解冻+恢复10%生命'},
  // 普通
  {id:'con_c1',name:'小恢复药水',type:'consumable',rarity:'common',icon:'potion',stats:'恢复10%生命'},
  {id:'con_c2',name:'小魔力药水',type:'consumable',rarity:'common',icon:'drop',stats:'恢复10%法力'},
  {id:'con_c3',name:'干粮',type:'consumable',rarity:'common',icon:'bread',stats:'恢复5%生命'},
  {id:'con_c4',name:'水壶',type:'consumable',rarity:'common',icon:'canteen',stats:'恢复5%法力'},
  {id:'con_c5',name:'急救喷雾',type:'consumable',rarity:'common',icon:'wind',stats:'恢复8%生命'},
];

// ===== 服装池（16件）=====
// art：对应 /assets/costumes/<角色>_<art>.svg 中最接近的服装立绘主题
const COSTUMES = [
  {id:'c_lia_1',name:'血色骑士服',type:'costume',rarity:'legendary',icon:'kimono',owner:'lia',art:'newyear',desc:'莉亚专属'},
  {id:'c_lia_2',name:'夏日清凉装',type:'costume',rarity:'epic',icon:'summer',owner:'lia',art:'swimsuit',desc:'莉亚专属'},
  {id:'c_mia_1',name:'机械猫娘装',type:'costume',rarity:'legendary',icon:'mech',owner:'mia',art:'maid',desc:'米娅专属'},
  {id:'c_mia_2',name:'睡衣派对',type:'costume',rarity:'epic',icon:'sleep',owner:'mia',art:'swimsuit',desc:'米娅专属'},
  {id:'c_serena_1',name:'月蚀礼服',type:'costume',rarity:'legendary',icon:'galaxy',owner:'serena',art:'anniversary',desc:'塞蕾娜专属'},
  {id:'c_serena_2',name:'观测者制服',type:'costume',rarity:'epic',icon:'telescope',owner:'serena',art:'maid',desc:'塞蕾娜专属'},
  {id:'c_freya_1',name:'冰雪女王裙',type:'costume',rarity:'legendary',icon:'snowflake',owner:'freya',art:'anniversary',desc:'芙蕾娅专属'},
  {id:'c_freya_2',name:'暖冬便服',type:'costume',rarity:'epic',icon:'scarf',owner:'freya',art:'christmas',desc:'芙蕾娅专属'},
  {id:'c_lilith_1',name:'瓦尔哈拉战袍',type:'costume',rarity:'legendary',icon:'battle',owner:'lilith',art:'newyear',desc:'莉莉丝专属'},
  {id:'c_lilith_2',name:'暗夜便装',type:'costume',rarity:'epic',icon:'heart',owner:'lilith',art:'maid',desc:'莉莉丝专属'},
  {id:'c_evelyn_1',name:'星尘舞台装',type:'costume',rarity:'legendary',icon:'sparkle',owner:'evelyn',art:'anniversary',desc:'伊芙琳专属'},
  {id:'c_evelyn_2',name:'睡衣星图',type:'costume',rarity:'epic',icon:'sleep',owner:'evelyn',art:'swimsuit',desc:'伊芙琳专属'},
  {id:'c_ophelia_1',name:'使徒礼装',type:'costume',rarity:'legendary',icon:'eclipse',owner:'ophelia',art:'anniversary',desc:'奥菲利亚专属'},
  {id:'c_ophelia_2',name:'日常咬人服',type:'costume',rarity:'epic',icon:'fang',owner:'ophelia',art:'duanwu',desc:'奥菲利亚专属'},
  {id:'c_ayla_1',name:'圣光礼裙',type:'costume',rarity:'legendary',icon:'angel',owner:'ayla',art:'anniversary',desc:'艾拉专属'},
  {id:'c_ayla_2',name:'野餐便服',type:'costume',rarity:'epic',icon:'basket',owner:'ayla',art:'swimsuit',desc:'艾拉专属'},
];

const ALL_ITEMS = [...WEAPONS, ...EQUIPMENTS, ...CONSUMABLES];
const TYPE_LABEL = { weapon:'武器', equipment:'防具', consumable:'药品' };
const RARITY_TEXT = { character:'角色', legendary:'传说', epic:'史诗', rare:'精良', uncommon:'优良', common:'普通', costume:'服装', essence:'精魄', pink:'粉晶' };
const CURRENCY_LABEL = { diamonds:'钻石', pinkCrystals:'粉晶', essence:'精魄' };

// ============ 会员档位（顶栏徽章、会员页、召唤折扣共用） ============
const dia = (n) => `${n}${icon('diamond', { size: 14 })}`;
const MEMBERSHIP = [
  {id:'bronze',label:'青铜',name:'青铜会员',price:'免费',discount:0,icon:'medal',color:'#9ca3af',badgeBg:'rgba(156,163,175,.2)',bg:'linear-gradient(135deg,#9ca3af,#6b7280)',perks:['标准概率','基础每日奖励']},
  {id:'silver',label:'白银',name:'白银会员',price:'测试免费',discount:0,icon:'medal',color:'#c0c0c0',badgeBg:'rgba(192,192,192,.2)',bg:'linear-gradient(135deg,#94a3b8,#64748b)',perks:['+5%粉晶加成',`每日+${dia(5)}`,'专属头像框']},
  {id:'gold',label:'黄金',name:'黄金会员',price:'测试免费',discount:5,icon:'crown',color:'#fbbf24',badgeBg:'rgba(251,191,36,.2)',bg:'linear-gradient(135deg,#fbbf24,#d97706)',perks:['+10%粉晶',`每日+${dia(10)}`,'召唤折扣5%','专属称号']},
  {id:'diamond',label:'钻石',name:'钻石会员',price:'测试免费',discount:10,icon:'diamond',color:'#5ee4ff',badgeBg:'rgba(94,228,255,.2)',bg:'linear-gradient(135deg,#0ea5e9,#0891b2)',perks:['+20%粉晶',`每日+${dia(20)}`,'召唤折扣10%','全套专属']},
];
const tierOf = (id) => MEMBERSHIP.find(t => t.id === id) || MEMBERSHIP[0];

// ============ PLAYER STATE ============
const STORAGE_KEY = 'moonlit_gacha_player';
const DEFAULT_PLAYER = {
  diamonds: 200, pinkCrystals: 0, essence: 0, membership: 'bronze',
  ownedCharacters: {}, ownedItems: {}, ownedCostumes: {},
  charMaxLevel: 6, pullHistory: [],
};
const freshPlayer = () => JSON.parse(JSON.stringify(DEFAULT_PLAYER));
let player = freshPlayer();
const rates = { charRate:1, legRate:2, epiRate:8, rarRate:20, uncRate:30, costumeDenom:30 };
let isAnimating = false;
let pendingResults = [];
let animTimers = [];        // 召唤动画的所有定时器；跳过 / 关闭时统一清除
let singleFlipReady = false; // 单抽卡片已落下、可点击翻转

const $ = (id) => document.getElementById(id);

function loadPlayer() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { saved = null; }
  player = { ...freshPlayer(), ...(saved && typeof saved === 'object' ? saved : {}) };
  for (const key of ['ownedCharacters', 'ownedItems', 'ownedCostumes']) {
    if (!player[key] || typeof player[key] !== 'object') player[key] = {};
  }
  if (!Array.isArray(player.pullHistory)) player.pullHistory = [];
  for (const key of Object.keys(CURRENCY_LABEL)) player[key] = Number(player[key]) || 0;
  player.membership = tierOf(player.membership).id;
}
function savePlayer() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(player)); } catch { /* 存储不可用时只保留内存状态 */ }
}
function resetAll() { player = freshPlayer(); savePlayer(); }
function diamondCost(count) {
  const discount = tierOf(player.membership).discount;
  return Math.max(1, Math.floor(count * 6 * (100 - discount) / 100));
}
let toastTimer = 0;
function showToast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}
const fmt = (n) => String(Math.round(n * 100) / 100);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ============ GACHA ENGINE ============
// 一次掷点按顺序扣减各档概率（角色池先判定角色），剩余概率为普通
function rollRarity(isCharBanner) {
  if (!isCharBanner && Math.random() < 1 / rates.costumeDenom) return 'costume';
  const tiers = [['legendary', rates.legRate], ['epic', rates.epiRate], ['rare', rates.rarRate], ['uncommon', rates.uncRate]];
  if (isCharBanner) tiers.unshift(['character', rates.charRate]);
  let r = Math.random() * 100;
  for (const [rarity, pct] of tiers) {
    if (r < pct) return rarity;
    r -= pct;
  }
  return 'common';
}

function pickFromPool(rarity) {
  if (rarity === 'character') {
    const available = CHARACTERS.filter(c => (player.ownedCharacters[c.id] || 0) < player.charMaxLevel);
    if (available.length > 0) {
      const c = pick(available);
      player.ownedCharacters[c.id] = (player.ownedCharacters[c.id] || 0) + 1;
      const copies = player.ownedCharacters[c.id];
      return { ...c, isNew: copies === 1, copies, isDuplicate: copies > 1 };
    }
    player.essence += 3;
    return { id:'essence', name:'武器精魄', type:'essence', rarity:'essence', icon:'essence', amount:3, isEssence:true };
  }
  if (rarity === 'costume') {
    const available = COSTUMES.filter(c => !player.ownedCostumes[c.id]);
    if (available.length > 0) {
      const c = pick(available);
      player.ownedCostumes[c.id] = true;
      return { ...c, isNew: true };
    }
    const pink = 8 + Math.floor(Math.random() * 3);
    player.pinkCrystals += pink;
    return { id:'pink_dup', name:`粉晶 x${pink}`, type:'pink', rarity:'pink', icon:'pink-crystal', amount:pink, isPink:true };
  }
  const pool = ALL_ITEMS.filter(i => i.rarity === rarity);
  const item = pool.length ? pick(pool) : pick(ALL_ITEMS);
  player.ownedItems[item.id] = (player.ownedItems[item.id] || 0) + 1;
  const qty = player.ownedItems[item.id];
  return { ...item, isNew: qty === 1, quantity: qty, isDuplicate: qty > 1 };
}

function executeSinglePull(isCharBanner) {
  const result = pickFromPool(rollRarity(isCharBanner));
  if (result.isDuplicate && result.type !== 'character' && result.type !== 'costume' && !result.isEssence && !result.isPink) {
    const pink = 5 + Math.floor(Math.random() * 6);
    player.pinkCrystals += pink;
    result.pinkReward = pink;
  }
  if (result.isDuplicate && result.type === 'character' && result.copies <= player.charMaxLevel) {
    const pink = 4 + Math.floor(Math.random() * 7);
    player.pinkCrystals += pink;
    result.pinkReward = pink;
  }
  player.pullHistory.push({ timestamp: Date.now(), ...result, banner: isCharBanner ? 'character' : 'costume' });
  if (player.pullHistory.length > 200) player.pullHistory = player.pullHistory.slice(-200);
  return result;
}

function doPull(bannerType, count) {
  if (isAnimating) return;
  if (!['character', 'costume'].includes(bannerType) || !(count >= 1 && count <= 10)) return;
  const cost = diamondCost(count);
  if (player.diamonds < cost) { showToast('钻石不足！'); return; }
  player.diamonds -= cost;
  const results = [];
  for (let i = 0; i < count; i++) results.push(executeSinglePull(bannerType === 'character'));
  savePlayer();
  refreshUI();
  pendingResults = results;
  if (count === 1) showPullAnimation(results[0]);
  else showMultiResult(results);
}

// ============ 物品美术 ============
// 角色 → 半身立绘；服装 → 服装立绘；其余 → 图标
function artSrc(item) {
  if (item.type === 'character') return ART.portrait(item.id);
  if (item.type === 'costume') return ART.costume(item.owner, item.art);
  return '';
}
const itemIcon = (item, size) => icon(item.icon, { size }) || icon('gem', { size });
// 圆形头像（裁立绘脸部）；无立绘时退回图标
function thumbHTML(item, size = 30) {
  const src = artSrc(item);
  return src ? `<span class="avatar"><img src="${src}" alt="" loading="lazy"></span>` : itemIcon(item, size);
}
function portraitHTML(item, cls = '') {
  return `<div class="item-portrait${item.type === 'costume' ? ' is-costume' : ''}${cls ? ' ' + cls : ''}"><img src="${artSrc(item)}" alt="${item.name}" loading="lazy"><span class="item-emblem">${icon(item.icon, { size: 14 })}</span></div>`;
}

// ============ 动画 v2 ============
const RARITY_CONFIG = {
  character:{color:'#c084fc',glow:'glow-legendary',label:'角色获得！',icon:'crown'},
  legendary:{color:'#c084fc',glow:'glow-legendary',label:'传说获得！',icon:'star'},
  epic:{color:'#f87171',glow:'glow-epic',label:'史诗获得！',icon:'flame'},
  rare:{color:'#fbbf24',glow:'glow-rare',label:'精良',icon:'gem'},
  uncommon:{color:'#60a5fa',glow:'glow-uncommon',label:'优良',icon:'gem'},
  common:{color:'#9ca3af',glow:'',label:'普通',icon:'gem'},
  costume:{color:'#f472b6',glow:'glow-epic',label:'服装获得！',icon:'dress'},
  essence:{color:'#fbbf24',glow:'glow-rare',label:'精魄',icon:'essence'},
  pink:{color:'#f472b6',glow:'glow-epic',label:'粉晶',icon:'pink-crystal'},
};
// 召唤结果的展示档位：角色本身是传说稀有度，但按「角色」档展示（角色获得！/ 角色徽标）
const rarityKey = (r) => (r.type === 'character' ? 'character' : r.rarity);
const configOf = (r) => RARITY_CONFIG[rarityKey(r)] || RARITY_CONFIG.common;

function later(fn, ms) { animTimers.push(setTimeout(fn, ms)); }
function clearAnimTimers() { animTimers.forEach(clearTimeout); animTimers = []; }

function showPullAnimation(result) {
  isAnimating = true;
  singleFlipReady = false;
  clearAnimTimers();
  const circle = $('summonCircle');
  const meteor = $('animMeteor');
  const flipCard = $('flipCard');
  const flipBack = $('flipBack');
  const resultEl = $('animResultV2');
  const cfg = configOf(result);

  // Reset
  $('animOverlay').classList.add('active');
  circle.style.display = 'block';
  circle.style.color = cfg.color;
  meteor.style.display = 'none';
  flipCard.style.display = 'none';
  $('flipInner').classList.remove('flipped');
  resultEl.classList.remove('show');
  resultEl.innerHTML = '';
  $('revealAllBtn').style.display = 'none';
  $('animSkipV2').style.display = 'flex';
  flipBack.innerHTML = '';
  flipBack.className = 'flip-back';
  $('multiCardsGrid').style.display = 'none';

  // Phase 1: 召唤阵旋转 (0.8s)
  later(() => {
    // Phase 2: 流星坠落 (0.7s)
    meteor.style.display = 'block';
    meteor.style.background = `linear-gradient(to bottom, transparent, ${cfg.color})`;
    meteor.style.boxShadow = `0 0 20px ${cfg.color}, 0 0 40px ${cfg.color}`;

    later(() => {
      // Phase 3: 撞击闪光+冲击波
      meteor.style.display = 'none';
      const flash = $('impactFlash');
      const ring = $('impactRing');
      flash.className = 'impact-flash flash';
      ring.style.color = cfg.color;
      ring.className = 'impact-ring expand';
      later(() => { flash.className = 'impact-flash'; ring.className = 'impact-ring'; }, 600);

      // Phase 4: 显示翻转卡片，等待点击（data-action="flip-single"）
      circle.style.display = 'none';
      flipCard.style.display = 'block';
      renderFlipBack(result, cfg);
      singleFlipReady = true;
    }, 700);
  }, 800);
}

function renderFlipBack(r, cfg) {
  const flipBack = $('flipBack');
  const src = artSrc(r);
  flipBack.className = `flip-back ${cfg.glow}${src ? ' has-art' : ''}`;
  const badge = `<div class="rarity-badge" style="background:${cfg.color};color:${r.rarity === 'rare' || r.rarity === 'essence' ? '#000' : '#fff'}">${RARITY_TEXT[rarityKey(r)] || ''}</div>`;
  flipBack.innerHTML = src ? `
    <img class="flip-art" src="${src}" alt="${r.name}">
    <div class="flip-caption">
      <div class="flip-name" style="color:${cfg.color}">${r.name}</div>
      <div class="flip-sub">${r.type === 'character' ? r.title : r.desc}</div>
    </div>${badge}` : `${badge}
    <div class="flip-icon" style="color:${cfg.color}">${itemIcon(r, 72)}</div>
    <div style="font-size:1.1rem;font-weight:700;color:${cfg.color}">${r.name}</div>
    ${r.stats ? `<div style="font-size:.72rem;color:var(--muted);margin-top:6px;font-style:italic">${r.stats}</div>` : ''}`;
}

function buildResultDetailHTML(r, cfg) {
  let extra = '';
  if (r.isNew) extra += `<div style="color:#4ade80;font-size:.95rem;margin-top:6px;font-weight:700">${icon('sparkle', { size: 16 })} NEW!</div>`;
  if (r.isDuplicate) extra += `<div style="color:var(--muted);font-size:.8rem;margin-top:4px">+${r.pinkReward || 0} 粉晶</div>`;
  if (r.type === 'character') extra += `<div style="color:var(--muted);font-size:.8rem;margin-top:4px">突破: ${r.copies}/${player.charMaxLevel}</div>`;
  return `
    <div class="result-label" style="font-size:1.2rem;font-weight:700;color:${cfg.color};margin-top:8px">${icon(cfg.icon, { size: 22 })}${cfg.label}</div>
    ${extra}
    <div><button class="pull-btn primary" type="button" style="margin-top:16px" data-action="end-anim">确认</button></div>
  `;
}

// 单抽：点击卡片翻转
function revealSingleCard() {
  const flipInner = $('flipInner');
  if (!singleFlipReady || flipInner.classList.contains('flipped')) return;
  const result = pendingResults[0];
  if (!result) return;
  singleFlipReady = false;
  flipInner.classList.add('flipped');
  later(() => {
    const resultEl = $('animResultV2');
    resultEl.classList.add('show');
    resultEl.innerHTML = buildResultDetailHTML(result, configOf(result));
    $('animSkipV2').style.display = 'none';
  }, 400);
}

// 十连：卡片网格翻转
function showMultiResult(results) {
  isAnimating = true;
  clearAnimTimers();
  const grid = $('multiCardsGrid');
  const resultEl = $('animResultV2');

  $('animOverlay').classList.add('active');
  $('summonCircle').style.display = 'none';
  $('flipCard').style.display = 'none';
  resultEl.classList.remove('show');
  resultEl.innerHTML = '';
  $('animSkipV2').style.display = 'flex';
  grid.style.display = 'flex';

  // 生成卡片（全部背面朝上）
  grid.innerHTML = results.map((r, i) => {
    const cfg = configOf(r);
    const src = artSrc(r);
    const isNew = r.isNew ? '<div class="mini-new">NEW</div>' : '';
    const back = src
      ? `<div class="mini-flip-back has-art" style="background:${cfg.color}">
          <img class="mini-art" src="${src}" alt="">
          <div class="mini-caption"><div class="mini-name">${r.name}</div><div class="mini-rarity">${RARITY_TEXT[rarityKey(r)]}</div>${isNew}</div>
        </div>`
      : `<div class="mini-flip-back" style="background:linear-gradient(135deg,${cfg.color}dd,${cfg.color}88)">
          <div class="mini-icon">${itemIcon(r, 34)}</div>
          <div class="mini-name">${r.name}</div>
          <div class="mini-rarity">${RARITY_TEXT[rarityKey(r)] || '普通'}</div>${isNew}
        </div>`;
    return `<div class="mini-flip-card" data-action="flip-mini">
      <div class="mini-flip-inner" data-idx="${i}">
        <div class="mini-flip-front"><img class="card-back-art" src="/assets/ui/card-back.svg" alt=""></div>
        ${back}
      </div>
    </div>`;
  }).join('');

  $('revealAllBtn').style.display = 'flex';

  // 自动逐张翻转（0.3s 间隔），全部翻完后显示确认按钮
  [...grid.children].forEach((card, i) => later(() => flipMiniCard(card), 800 + i * 300));
  later(() => showMultiConfirm(results), 800 + results.length * 300 + 500);
}

function flipMiniCard(cardEl) {
  const inner = cardEl.querySelector('.mini-flip-inner');
  if (inner) inner.classList.add('flipped');
}

function revealAllCards() {
  clearAnimTimers();
  const cards = $('multiCardsGrid').querySelectorAll('.mini-flip-inner');
  cards.forEach((inner, i) => later(() => inner.classList.add('flipped'), i * 80));
  later(() => showMultiConfirm(pendingResults), cards.length * 80 + 500);
}

function showMultiConfirm(results) {
  if (!results.length) return;
  const resultEl = $('animResultV2');
  $('revealAllBtn').style.display = 'none';
  $('animSkipV2').style.display = 'none';
  resultEl.classList.add('show');
  const order = {character:0,legendary:1,costume:1,epic:2,pink:2,rare:3,essence:3,uncommon:4,common:5};
  const rank = (r) => order[rarityKey(r)] ?? 5;
  const best = results.reduce((a, b) => (rank(a) <= rank(b) ? a : b));
  const cfg = configOf(best);
  resultEl.innerHTML = `
    <div class="best-line" style="font-size:1.1rem;color:${cfg.color};margin-top:12px;font-weight:700">最佳: ${thumbHTML(best, 26)} ${best.name}</div>
    <div><button class="pull-btn primary" type="button" style="margin-top:14px" data-action="end-anim">确认</button></div>
  `;
}

function skipAnimationV2() {
  if (!isAnimating) return;
  clearAnimTimers();
  const grid = $('multiCardsGrid');

  if (grid.style.display !== 'none') {
    // 十连：全部翻开
    grid.querySelectorAll('.mini-flip-inner').forEach(inner => inner.classList.add('flipped'));
    $('revealAllBtn').style.display = 'none';
    showMultiConfirm(pendingResults);
    return;
  }
  // 单抽：直接显示结果
  const result = pendingResults[0];
  if (!result) { endAnimationV2(); return; }
  const cfg = configOf(result);
  singleFlipReady = false;
  $('summonCircle').style.display = 'none';
  $('animMeteor').style.display = 'none';
  $('impactFlash').className = 'impact-flash';
  $('impactRing').className = 'impact-ring';
  $('flipCard').style.display = 'block';
  $('flipInner').classList.add('flipped');
  renderFlipBack(result, cfg);
  const resultEl = $('animResultV2');
  resultEl.classList.add('show');
  resultEl.innerHTML = buildResultDetailHTML(result, cfg);
  $('animSkipV2').style.display = 'none';
}

function endAnimationV2() {
  clearAnimTimers();
  $('animOverlay').classList.remove('active');
  $('summonCircle').style.display = 'block';
  $('animMeteor').style.display = 'none';
  $('flipCard').style.display = 'none';
  $('multiCardsGrid').style.display = 'none';
  $('multiCardsGrid').innerHTML = '';
  $('animResultV2').classList.remove('show');
  $('animResultV2').innerHTML = '';
  $('revealAllBtn').style.display = 'none';
  isAnimating = false;
  singleFlipReady = false;
  pendingResults = [];
  refreshAll();
}

function closeResultModal() {
  $('resultModal').classList.remove('active');
  $('resultList').innerHTML = '';
}

// ============ UI ============
function refreshUI() {
  $('diamondDisplay').textContent = player.diamonds;
  $('pinkDisplay').textContent = player.pinkCrystals;
  $('essenceDisplay').textContent = player.essence;
  const t = tierOf(player.membership);
  const mb = $('memberBadge');
  mb.textContent = t.label; mb.style.color = t.color; mb.style.background = t.badgeBg;
  $('memberSelect').value = t.id;
  const price = (n) => `${diamondCost(n)}${icon('diamond', { size: 18 })}`;
  $('btnSingle').innerHTML = `${icon('sparkle', { size: 18 })}单抽 · ${price(1)}`;
  $('btnTen').innerHTML = `${icon('star4', { size: 18 })}十连 · ${price(10)}`;
  $('btnCostSingle').innerHTML = `${icon('sparkle', { size: 18 })}单抽 · ${price(1)}`;
  $('btnCost5').innerHTML = `${icon('star4', { size: 18 })}五连 · ${price(5)}`;
}

function renderRateInfo() {
  const tiers = `
    <span style="color:var(--legendary)">传说</span> ${fmt(rates.legRate)}% &nbsp;
    <span style="color:var(--epic)">史诗</span> ${fmt(rates.epiRate)}% &nbsp;
    <span style="color:var(--rare)">精良</span> ${fmt(rates.rarRate)}% &nbsp;
    <span style="color:var(--uncommon)">优良</span> ${fmt(rates.uncRate)}% &nbsp;`;
  const base = rates.legRate + rates.epiRate + rates.rarRate + rates.uncRate;
  const common = (rest) => `<span style="color:var(--common)">普通</span> ${fmt(Math.max(0, rest))}%`;
  $('charRateInfo').innerHTML = `${icon('star', { size: 14 })} 角色 <b>${fmt(rates.charRate)}%</b> &nbsp;|&nbsp; ${tiers} ${common(100 - rates.charRate - base)}`;
  $('costumeRateInfo').innerHTML = `${icon('dress', { size: 14 })} 服装 <b>1/${rates.costumeDenom} (${fmt(100 / rates.costumeDenom)}%)</b> &nbsp;|&nbsp; 其余：${tiers} ${common(100 - base)}`;
}

function renderCharPool() {
  $('charPoolPreview').innerHTML = CHARACTERS.map(c => {
    const owned = player.ownedCharacters[c.id] || 0;
    const maxed = owned >= player.charMaxLevel;
    return `<div class="item-card r-legendary ${owned ? (maxed ? 'maxed' : 'owned') : ''}">
      ${portraitHTML(c)}
      <div class="item-name" style="color:var(--legendary)">${c.name}</div>
      <div class="item-type">${c.title} ${owned ? `(${owned}/${player.charMaxLevel})` : ''}</div>
    </div>`;
  }).join('');
}

function renderCostumePool() {
  $('costumePoolPreview').innerHTML = COSTUMES.map(c => {
    const owned = !!player.ownedCostumes[c.id];
    return `<div class="item-card r-${c.rarity} ${owned ? 'owned' : ''}">
      ${portraitHTML(c)}
      <div class="item-name" style="color:${c.rarity === 'legendary' ? 'var(--legendary)' : 'var(--epic)'}">${c.name}</div>
      <div class="item-type">${c.desc}</div>
    </div>`;
  }).join('');
}

const DIAMOND_PACKS = [
  { amount: 60, label: '小份钻石', size: 34, btn: 'primary small', style: '' },
  { amount: 300, label: '钻石包', size: 42, btn: 'primary small', style: 'background:linear-gradient(135deg,#f87171,#dc2626)' },
  { amount: 980, label: '豪华钻石包', size: 50, btn: 'ten', style: 'font-size:.8rem;padding:8px 20px' },
];

function renderShop() {
  $('shop-diamond').innerHTML = DIAMOND_PACKS.map(p => `
    <div class="shop-item">
      <div class="shop-icon" style="height:54px;align-items:center">${icon('diamond', { size: p.size })}</div>
      <h4>${p.amount} ${icon('diamond', { size: 18 })}</h4>
      <p style="color:var(--muted);font-size:.8rem;margin-bottom:10px">${p.label}</p>
      <button class="pull-btn ${p.btn}" type="button" style="${p.style}" data-action="buy-diamonds" data-amount="${p.amount}">测试获取</button>
    </div>`).join('');
  $('shop-pink').innerHTML = COSTUMES.map(c => {
    const owned = !!player.ownedCostumes[c.id];
    return `
    <div class="shop-item r-${c.rarity}">
      ${portraitHTML(c, 'shop-portrait')}
      <div style="font-weight:700;margin:6px 0">${c.name}</div>
      <div style="color:var(--muted);font-size:.78rem">${c.desc}</div>
      <div class="shop-price">${icon('pink-crystal', { size: 16 })} 100 粉晶</div>
      <button class="pull-btn primary small" type="button" style="background:var(--pink)" ${player.pinkCrystals >= 100 && !owned ? '' : 'disabled'} data-action="buy-costume" data-id="${c.id}">
        ${owned ? '已拥有' : '兑换'}
      </button>
    </div>`;
  }).join('');
  $('shop-essence').innerHTML = `
    <div class="shop-item">
      <div class="shop-icon" style="color:var(--legendary)">${icon('sword', { size: 40 })}</div>
      <h4>随机传说武器</h4><p style="color:var(--muted);font-size:.8rem;margin-bottom:10px">含8件专武</p>
      <button class="pull-btn primary small" type="button" style="background:linear-gradient(135deg,#c084fc,#9333ea)" data-action="buy-legend-weapon">${icon('essence', { size: 16 })} 8精魄</button>
    </div>
    <div class="shop-item">
      <div class="shop-icon" style="color:var(--legendary)">${icon('armor', { size: 40 })}</div>
      <h4>传说装备箱</h4><p style="color:var(--muted);font-size:.8rem;margin-bottom:10px">随机传说防具</p>
      <button class="pull-btn primary small" type="button" style="background:linear-gradient(135deg,#c084fc,#9333ea)" data-action="buy-legend-equip">${icon('essence', { size: 16 })} 5精魄</button>
    </div>
  `;
}

function grantDiamonds(amount) {
  if (!(amount > 0)) return;
  player.diamonds += amount;
  savePlayer(); refreshUI(); showToast(`+${amount} 钻石`);
}
function buyCostume(id) {
  const costume = COSTUMES.find(c => c.id === id);
  if (!costume) return;
  if (player.ownedCostumes[id]) return showToast('已拥有');
  if (player.pinkCrystals < 100) return showToast('粉晶不足！');
  player.pinkCrystals -= 100; player.ownedCostumes[id] = true;
  savePlayer(); refreshAll(); showToast(`兑换成功：${costume.name}`);
}
function buyRandomLegendary(pool, price) {
  if (player.essence < price) return showToast('精魄不足！');
  player.essence -= price;
  const item = pick(pool.filter(w => w.rarity === 'legendary'));
  player.ownedItems[item.id] = (player.ownedItems[item.id] || 0) + 1;
  savePlayer(); refreshAll(); showToast(`获得 ${item.name}！`);
}
const buyRandomLegendWeapon = () => buyRandomLegendary(WEAPONS, 8);
const buyRandomLegendEquip = () => buyRandomLegendary(EQUIPMENTS, 5);

function switchShopTab(name, btn) {
  if (!$('shop-' + name)) return;
  document.querySelectorAll('#tab-shop .shop-grid').forEach(d => { d.style.display = 'none'; });
  $('shop-' + name).style.display = 'grid';
  document.querySelectorAll('#tab-shop .filter-bar .tab-btn').forEach(b => b.classList.toggle('active', b === btn));
}

function renderInventory() {
  const filter = $('invFilter').value || 'all';
  const search = $('invSearch').value.trim().toLowerCase();
  let items = [];
  if (filter === 'all' || filter === 'character') {
    CHARACTERS.forEach(c => {
      const copies = player.ownedCharacters[c.id] || 0;
      if (copies > 0) items.push({ ...c, quantity: copies });
    });
  }
  if (filter === 'all' || TYPE_LABEL[filter]) {
    ALL_ITEMS.filter(i => filter === 'all' || i.type === filter).forEach(i => {
      const qty = player.ownedItems[i.id] || 0;
      if (qty > 0) items.push({ ...i, quantity: qty });
    });
  }
  if (filter === 'all' || filter === 'costume') {
    COSTUMES.filter(c => player.ownedCostumes[c.id]).forEach(c => items.push({ ...c, quantity: 1 }));
  }
  if (search) items = items.filter(i => i.name.toLowerCase().includes(search));
  const rOrder = { legendary:0, epic:1, rare:2, uncommon:3, common:4 };
  items.sort((a, b) => rOrder[a.rarity] - rOrder[b.rarity]);

  $('invGrid').innerHTML = items.map(i => `
    <div class="inv-card r-${i.rarity}">
      <div class="inv-thumb">${thumbHTML(i, 30)}</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:.88rem">${i.name}</div>
        <div style="font-size:.7rem;color:var(--muted)">${i.type === 'character' ? i.title : i.type === 'costume' ? i.desc : TYPE_LABEL[i.type]}</div>
        ${i.stats ? `<div style="font-size:.62rem;color:var(--faint);font-style:italic">${i.stats}</div>` : ''}
      </div>
      <div class="quant">x${i.quantity}</div>
    </div>
  `).join('') || '<div style="color:var(--faint);text-align:center;padding:40px;grid-column:1/-1">暂无物品</div>';
}

function addAllCharacters() {
  CHARACTERS.forEach(c => { player.ownedCharacters[c.id] = Math.max(1, player.ownedCharacters[c.id] || 0); });
  savePlayer(); refreshAll();
  showToast('已解锁全部角色');
}

function renderMembership() {
  $('memberGrid').innerHTML = MEMBERSHIP.map(t => {
    const current = player.membership === t.id;
    return `
    <div class="member-card" style="${current ? `border:2px solid ${t.color};box-shadow:0 0 20px ${t.color}44` : ''}">
      <div class="tier-icon" style="color:${t.color}">${icon(t.icon, { size: 40 })}</div>
      <div class="tier-name" style="color:${t.color}">${t.name}</div>
      <div class="tier-price">${t.price}</div>
      <div class="tier-perks">${t.perks.map(p => `<div>${icon('check', { size: 14 })}${p}</div>`).join('')}</div>
      <button class="pull-btn primary small" type="button" style="background:${t.bg}" ${current ? 'disabled' : ''} data-action="switch-membership" data-tier="${t.id}">
        ${current ? '当前' : '切换（测试）'}
      </button>
    </div>`;
  }).join('');
}

function switchMembership(tierId) {
  const tier = MEMBERSHIP.find(t => t.id === tierId);
  if (!tier) return;
  player.membership = tier.id;
  savePlayer(); refreshAll();
  showToast(`已切换为${tier.name}`);
}

// ===== 后台调试 =====
function addCurrency(key, amount) {
  if (!CURRENCY_LABEL[key] || !Number.isFinite(amount)) return;
  player[key] += amount;
  savePlayer(); refreshAll();
  showToast(`+${amount} ${CURRENCY_LABEL[key]}`);
}
function confirmResetAll() {
  if (!confirm('确定重置所有数据？')) return;
  resetAll(); refreshAll();
  showToast('已重置全部数据');
}
// 概率滑条：同步标签文字并更新概率表
function onRateSlider(slider) {
  const label = $(slider.dataset.label);
  if (label) label.textContent = slider.value;
  updateRates();
}
function updateRates() {
  rates.charRate = parseFloat($('sCharRate').value);
  rates.legRate = parseFloat($('sLegRate').value);
  rates.epiRate = parseFloat($('sEpiRate').value);
  rates.rarRate = parseFloat($('sRarRate').value);
  rates.uncRate = parseFloat($('sUncRate').value);
  rates.costumeDenom = parseInt($('sCosRate').value, 10);
  renderRateInfo();
}

const TABS = ['charBanner', 'costumeBanner', 'shop', 'inventory', 'membership', 'admin'];
const TAB_RENDER = { charBanner: renderCharPool, costumeBanner: renderCostumePool, shop: renderShop, inventory: renderInventory, membership: renderMembership };

function switchTab(tab) {
  if (!TABS.includes(tab)) tab = TABS[0];
  document.querySelectorAll('#mainTabs > .tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'tab-' + tab));
  TAB_RENDER[tab]?.();
}

function renderAll() { renderCharPool(); renderCostumePool(); renderShop(); renderInventory(); renderMembership(); }
function refreshAll() { refreshUI(); renderAll(); }

// 静态 HTML 中的 <span data-icon="名称" data-size="18"> 占位 → 内联 SVG 图标
function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => {
    el.innerHTML = icon(el.dataset.icon, { size: Number(el.dataset.size) || 18 });
  });
}

// ============ 事件动作表（data-action → 处理函数） ============
const ACTIONS = {
  click: {
    'switch-tab': (el) => switchTab(el.dataset.tab),
    'pull': (el) => doPull(el.dataset.banner, Number(el.dataset.count)),
    'shop-tab': (el) => switchShopTab(el.dataset.shop, el),
    'buy-diamonds': (el) => grantDiamonds(Number(el.dataset.amount)),
    'buy-costume': (el) => buyCostume(el.dataset.id),
    'buy-legend-weapon': buyRandomLegendWeapon,
    'buy-legend-equip': buyRandomLegendEquip,
    'switch-membership': (el) => switchMembership(el.dataset.tier),
    'add-currency': (el) => addCurrency(el.dataset.currency, Number(el.dataset.amount)),
    'unlock-all': addAllCharacters,
    'reset-all': confirmResetAll,
    'flip-single': revealSingleCard,
    'flip-mini': (el) => flipMiniCard(el),
    'reveal-all': revealAllCards,
    'skip-anim': skipAnimationV2,
    'end-anim': endAnimationV2,
    'close-result-modal': closeResultModal,
  },
  change: {
    'filter-inventory': renderInventory,
    'set-membership': (el) => switchMembership(el.value),
  },
  input: {
    'search-inventory': renderInventory,
    'rate-slider': onRateSlider,
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
  if (e.key !== 'Escape') return;
  closeResultModal();
  if (!isAnimating) return;
  if ($('animResultV2').classList.contains('show')) endAnimationV2();
  else skipAnimationV2();
});

// ============ INIT ============
hydrateIcons();
loadPlayer();
updateRates();
refreshAll();
