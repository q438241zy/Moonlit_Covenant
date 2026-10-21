/**
 * 抽卡系统
 * 角色池 8 位女主（只有 4★ 和 5★）；服装目录每角色 6 套（3★～5★），其中常驻服饰池抽得到的是泳装、女仆两类，
 * 另外四类是「典藏」（决定#31：退出常驻抽取表，已拥有的照样能穿，见 COSTUME_TYPE_META）
 * 保底机制：连续 89 次未出 5★ 时，第 90 次必出 5★（出 5★ 后计数重置）
 *
 * GACHA_RATES 就是实际抽取用的概率表，/api/gacha/pools 原样公示（契约 K-11）：
 * rates[池][稀有度] 是该稀有度的总概率，同一稀有度内的条目等概率。
 *
 * 支付（核#14，剧本/README_30章重構提案.md 第八节#44）：召唤只收钻石——单抽 80、十连 720（GACHA_DIAMOND_COSTS；
 * 与卡牌对战的单包 80 钻石同价，十连九折）。Credit 只用于 AI 对话，不再能召唤（game/credit.mjs）。
 * 钻石靠玩获得（作者核#12，见 game/rewards.mjs）。
 * 重复补偿：抽到已拥有的条目（含同一次十连里的第二份）按稀有度折成钻石，见 DUPLICATE_COMPENSATION。
 *
 * 登场闸门（核#14，提案第八节#43、§4.5；服装稿 1.2「封存卡」）：女主从一开始就都在池里、照常能抽到，
 * 但在玩家通关她的登场章（unlockChapter）之前，对外只给剪影——名字、称号、立绘、介绍一律隐藏，
 * 只留稀有度和「第N章登场」；她的服装同样封存。莉莉丝与艾拉的姓到正式20通关才显示（veils）。
 * 对外的数据一律经过 viewCharacter / viewCostume（/api/gacha/pools、/api/gacha/pull、/api/costume），
 * CHARACTER_POOL / COSTUME_CATALOG 本身是完整的正典数据，只给服务器内部用，不能原样发给客户端。
 */

// 保底阈值
export const PITY_THRESHOLD = 90;

/** 封存卡与未揭晓栏目统一显示的占位文字。 */
export const SEALED_TEXT = '？？？';

// 角色池：8 位女主从一开始就都在池中；portrait 统一使用原创矢量立绘，召唤/换衣画风一致。
// 文本以正典为准（设定集/03 的基本资料与第一印象；银轨号是 IF 外传，外传身份不进卡池），只写到她登场时已经揭示的程度：
// 不写身世秘密、罪律弧线与组织名，也不得出现外传角色的结局前禁用词（content.mjs 的 forbiddenTermsUntilEnding）
// 和主线剧透词（test/canon-guard.test.mjs 的 MAIN_LINE_SPOILERS，按登场后的公开视图检查）。
// element 为正典「源律」的主律。章节都是主线正式章（30章结构，提案 §4.5 入队表）：
//   unlockChapter：她在主线第一次登场的章节——通关这一章（或主线更后面的任何一章）之后才揭开封存卡；
//   joinChapter：她正式成为长期伙伴的章节——通关该章时自动获得（game/rewards.mjs），还没写出来的章节先登记在这里，章节上线后自动生效；
//   veils：登场以后、某一章通关以前仍要遮住的栏目（until 那一章通关后显示完整资料）。
export const CHARACTER_POOL = [
  { id: 'lia', name: '莉亚·赫斯特', title: '盾战士', rarity: 5, element: '火', nation: '赤焰王国', weapon: '塔盾“赤誓”、细身长剑“断章”', portrait: '/assets/portraits/lia.svg', unlockChapter: 'ch004', joinChapter: 'ch005', age: 19, desc: '赤焰王国出身的盾战士，左肩甲带着战损缺口，持塔盾“赤誓”与细身长剑“断章”。说话像下命令，战前必定检查药剂、护具与撤退路线，看到有人冲出阵型会直接用盾把人拍回去。极爱草莓蛋糕，却坚持称之为“高效率糖分补给”。' },
  { id: 'mia', name: '米娅·玲', title: '魔具发明师', rarity: 4, element: '金', nation: '铸金联邦', weapon: '多功能魔导棍“叮当三号”', portrait: '/assets/portraits/mia.svg', unlockChapter: 'ch007', joinChapter: 'ch010', age: 18, desc: '铸金联邦工匠家庭出身的魔具发明师，挥着多功能魔导棍“叮当三号”，身边漂浮着球形小无人机“零号”。语速快、点子跳跃，看到新素材就会忘记危险，把爆炸称作“非计划拆解”；可她真能用废料造出奇迹，一心想做出普通人也负担得起的魔具。' },
  { id: 'serena', name: '塞雷娜·诺克斯', title: '暗系魔法师', rarity: 5, element: '暗', nation: '夜鸦公国', weapon: '黑曜法杖“无眠镜”', portrait: '/assets/portraits/serena.svg', unlockChapter: 'ch011', joinChapter: 'ch012', age: 19, desc: '夜鸦公国诺克斯家族的暗系魔法师，执黑曜法杖“无眠镜”，左侧细辫上串着银色月相盘发饰，右手戴半截白手套。冷静、机敏、嘴上不饶人，习惯先从镜面与影子里掌握情报再开口；说出危险的话时，表情反而格外认真。' },
  { id: 'freya', name: '芙蕾娅·霜华', title: '冰系魔法师', rarity: 5, element: '水', nation: '霜潮王国', weapon: '长法杖“春眠”', portrait: '/assets/portraits/freya.svg', unlockChapter: 'ch018', joinChapter: 'ch019', age: 19, desc: '霜潮王国的冰系魔法师兼守墓人，手持顶端嵌着雪花宝珠的长杖“春眠”。说话轻柔，像可靠的大姐姐，会自然地递上热饮、替人整理围巾；战斗时眼神却冷静得像冻结的湖面。' },
  // 正式13以敌对身份登场、不报名；正式20报上姓名——在那之前只显示名，不显示姓与故国
  { id: 'lilith', name: '莉莉丝·瓦尔哈拉', title: '暗影刺客', rarity: 5, element: '木', nation: '翠影公国', weapon: '双匕首“昼盲”“夜醒”', portrait: '/assets/portraits/lilith.svg', unlockChapter: 'ch013', joinChapter: 'ch021', age: 19, desc: '翠影公国出身的暗影刺客，金色长发高束，鼻梁贴着一块小创可贴，双肩后露出双匕首“昼盲”“夜醒”的刀柄。警惕、尖锐、行动先于思考，身手像猫科动物一样敏捷。',
    veils: [{ until: 'ch020', name: '莉莉丝', nation: SEALED_TEXT, desc: '金发的暗影刺客，长发高束，鼻梁贴着一块小创可贴，双肩后露出双匕首“昼盲”“夜醒”的刀柄。警惕、尖锐、行动先于思考，身手像猫科动物一样敏捷。' }] },
  { id: 'evelyn', name: '伊芙琳·星歌', title: '圣教圣女', rarity: 4, element: '光', nation: '圣辉教国', weapon: '圣歌弓“微光”、祈祷铃', portrait: '/assets/portraits/evelyn.svg', unlockChapter: 'ch016', joinChapter: 'ch017', age: 18, desc: '圣辉教国的圣教圣女，背着圣歌弓“微光”，侧辫尾端系着祈祷铃。胆小、容易哭、说话很轻；可只要有人受伤，她会一边掉眼泪一边坚持施法。' },
  { id: 'ophelia', name: '奥菲利亚·使诺德', title: '龙族圣女', rarity: 5, element: '土', nation: '龙脊古国', weapon: '龙纹法杖“祖语”', portrait: '/assets/portraits/ophelia.svg', unlockChapter: 'ch019', joinChapter: 'ch020', age: 19, desc: '龙脊古国使诺德氏族的龙族圣女，额侧一对小龙角、金紫异色瞳，能在人形与龙形之间切换，人形时使用龙纹法杖“祖语”。外表端庄，其实对人类的日常充满好奇，笑起来会露出一颗小虎牙。' },
  // 姓氏和莉莉丝一起在正式20揭晓（姐妹关系同样留到那一章）
  { id: 'aila', name: '艾拉·瓦尔哈拉', title: '光明骑士', rarity: 4, element: '光', nation: '圣辉教国', weapon: '光剑“晨罚”、圆盾', portrait: '/assets/portraits/aila.svg', unlockChapter: 'ch017', joinChapter: 'ch018', age: 18, desc: '圣辉教国的光明骑士，金色齐肩短发，光剑“晨罚”斜挎在肩后，另配一面圆盾。开朗自信、爱挑衅，最喜欢挑战强者，逼对手拿出真本事。',
    veils: [{ until: 'ch020', name: '艾拉' }] }
];

const CHARACTER_BY_ID = new Map(CHARACTER_POOL.map((c) => [c.id, c]));

// 服装类型（决定#31，剧本/README_轉蛋服裝設計.md §4、§5.1）。稀有度由类型决定，status 决定它在不在常驻抽取表里：
//   current：常驻服饰池（泳装、女仆暂时原样保留——真泳装重画、女仆改版，以及新增的婚礼 / 运动短袖 / OL 三类，都随美术阶段一起做）；
//   archive：「典藏」——退出常驻抽取表，id 不变，已拥有的照样能穿；显示名改成世界内的节庆；对应番外上线时以限时池复刻。
// 顺序就是换衣间的排列：先常驻，后典藏（典藏按对应番外的时间先后）。
export const COSTUME_TYPE_META = {
  swimsuit: { label: '夏日度假服', rarity: 5, status: 'current' },
  maid: { label: '女仆服', rarity: 3, status: 'current' },
  christmas: { label: '冬灯节服', rarity: 4, status: 'archive' },
  newyear: { label: '新历祭服', rarity: 4, status: 'archive' },
  anniversary: { label: '纪念日礼服', rarity: 5, status: 'archive' },
  duanwu: { label: '龙舟祭服', rarity: 3, status: 'archive' }
};

/**
 * 服装目录：8 位女主 × 全部类型（常驻 + 典藏）。拥有、穿戴校验（game/costume.mjs）和演示发放都查这份完整目录，
 * 所以存档里的旧 id（<女主>_<类型>）全都继续有效，不需要迁移。名称只用名、不带姓，所以登场后不必再遮。
 */
export const COSTUME_CATALOG = [];
for (const char of CHARACTER_POOL) {
  for (const [type, meta] of Object.entries(COSTUME_TYPE_META)) {
    COSTUME_CATALOG.push({
      id: `${char.id}_${type}`,
      characterId: char.id,
      name: `${char.name.split('·')[0]}·${meta.label}`,
      type,
      rarity: meta.rarity,
      status: meta.status,
      description: `${char.title}的${meta.label}造型`,
      file: `/assets/costumes/${char.id}_${type}.svg`,
      branchScene: `branch_${char.id}_${type}`
    });
  }
}

/** 旧名，等同 COSTUME_CATALOG（server.mjs 的演示发放「一键解锁全部服装」还用这个名字）。抽取请用 COSTUME_PULL_TABLE。 */
export const COSTUME_POOL = COSTUME_CATALOG;

/** 常驻服饰池的抽取表：只有 status 为 current 的条目。pullGacha、概率公示（/api/gacha/pools）都只看这张表。 */
export const COSTUME_PULL_TABLE = COSTUME_CATALOG.filter((c) => c.status === 'current');

// ─── 登场闸门（封存卡）───

const CHAPTER_ID = /^ch(\d{3})$/;
const chapterNumber = (chapterId) => {
  const match = CHAPTER_ID.exec(String(chapterId ?? ''));
  return match ? Number(match[1]) : NaN;
};

/**
 * 账户的主线进度：已首通的主线章节 id（POST /api/story/progress 记在 account.rewards.chaptersCleared）。
 * 没有账户或旧存档时为空数组。
 */
export function clearedChaptersOf(account) {
  const list = account?.rewards?.chaptersCleared;
  return Array.isArray(list) ? list.filter((id) => typeof id === 'string' && CHAPTER_ID.test(id)) : [];
}

/** 已首通章节里编号最大的一章（主线是一条链，通关后面的章节就意味着前面的都看过了）；一章都没有为 -1。 */
export function highestClearedChapter(cleared) {
  let highest = -1;
  for (const id of cleared || []) {
    const n = chapterNumber(id);
    if (n > highest) highest = n;
  }
  return highest;
}

/** 'ch013' → 「第13章登场」（ch000 是序章）。 */
export function debutLabel(chapterId) {
  const n = chapterNumber(chapterId);
  if (!Number.isFinite(n)) return '尚未登场';
  return n === 0 ? '序章登场' : `第${n}章登场`;
}

/** 这一章（或主线更后面的任何一章）已经通关。 */
const passed = (chapterId, highest) => highest >= chapterNumber(chapterId);

/** 女主是否已经登场（通关她的登场章或之后的任何一章）。未知 id 视为没有登场。 */
export function isHeroineRevealed(heroineOrId, cleared) {
  const heroine = typeof heroineOrId === 'string' ? CHARACTER_BY_ID.get(heroineOrId) : heroineOrId;
  return Boolean(heroine) && passed(heroine.unlockChapter, highestClearedChapter(cleared));
}

/**
 * 角色池条目的对外视图。
 *   - 还没登场：{ id, rarity, sealed: true, name/title: '？？？', unlockChapter, joinChapter, debutLabel }——没有立绘、介绍、国家、武器；
 *   - 已登场：完整资料（sealed: false），veils 里 until 那一章还没通关的栏目换成遮挡后的值。
 * @param {object} heroine - CHARACTER_POOL 的条目
 * @param {Iterable<string>} cleared - 已首通的主线章节 id
 */
export function viewCharacter(heroine, cleared) {
  const highest = highestClearedChapter(cleared);
  const label = debutLabel(heroine.unlockChapter);
  if (!passed(heroine.unlockChapter, highest)) {
    return {
      id: heroine.id, rarity: heroine.rarity, sealed: true, name: SEALED_TEXT, title: SEALED_TEXT,
      unlockChapter: heroine.unlockChapter, joinChapter: heroine.joinChapter, debutLabel: label
    };
  }
  const { veils, ...base } = heroine;
  let view = { ...base, sealed: false, debutLabel: label };
  for (const veil of veils || []) {
    if (passed(veil.until, highest)) continue;
    const { until, ...fields } = veil;
    view = { ...view, ...fields };
  }
  return view;
}

/**
 * 服饰池条目的对外视图：主人还没登场时是封存卡——「？？？·女仆服」、没有立绘与介绍；登场后原样。
 */
export function viewCostume(costume, cleared) {
  const owner = CHARACTER_BY_ID.get(costume.characterId);
  if (!owner || isHeroineRevealed(owner, cleared)) return { ...costume, sealed: false };
  return {
    id: costume.id, characterId: costume.characterId, type: costume.type, rarity: costume.rarity, status: costume.status, sealed: true,
    name: `${SEALED_TEXT}·${COSTUME_TYPE_META[costume.type]?.label || costume.type}`,
    unlockChapter: owner.unlockChapter, debutLabel: debutLabel(owner.unlockChapter)
  };
}

/**
 * 两个池按玩家进度的对外视图（/api/gacha/pools、/api/costume）。服饰池只列常驻抽取表（COSTUME_PULL_TABLE）：
 * 前端按「该稀有度总概率 ÷ 条目数」公示单个条目的概率（契约 K-11），典藏抽不到，不能算进去。
 */
export function publicPools(cleared) {
  const list = [...(cleared || [])];
  return {
    characters: CHARACTER_POOL.map((c) => viewCharacter(c, list)),
    costumes: COSTUME_PULL_TABLE.map((c) => viewCostume(c, list))
  };
}

// 抽卡概率（与实际抽取完全一致；表里只列池内存在的稀有度——角色池没有 3★，所以表里也没有 3★）。
// 服饰池的标准是 5★ 3% / 4★ 17% / 3★ 80%（服装稿 1.2，不改）。典藏退出后常驻表暂时没有 4★（4★ 的冬灯节服、新历祭服都进了典藏），
// 4★ 那 17% 暂时并进 3★；5★ 仍是 3%，保底不变。4★ 的 OL 装随美术阶段上线时恢复 3/17/80。
export const GACHA_RATES = {
  character: { 5: 0.02, 4: 0.98 },
  costume: { 5: 0.03, 3: 0.97 }
};

export const GACHA_POOLS = ['character', 'costume'];

/** 召唤唯一的货币。 */
export const GACHA_CURRENCY = 'diamonds';

// 用钻石召唤的价格：单抽与卡牌对战单包同价（80），十连九折（720）
export const GACHA_DIAMOND_COSTS = { single: 80, ten: 720 };

/** 召唤价格（/api/gacha/pools 公示）：只有钻石一种。 */
export const GACHA_COSTS = {
  diamonds: { ...GACHA_DIAMOND_COSTS }
};

/**
 * 重复补偿（钻石）：以钻石单抽价 80 为基准——
 *   3★ 8（单抽的 10%）、4★ 16（20%）、5★ 160（两次单抽）。
 * 全部拥有后每抽的期望返还：角色池约 19（0.976×16 + 0.024×160，5★ 概率按含保底的综合 2.4% 计），
 * 服饰池约 13（0.97×8 + 0.032×160；4★ 回到常驻表后约 14：0.80×8 + 0.17×16 + 0.032×160），都远低于单抽 80，不会形成刷钻循环。
 * 主线自动入队的女主若已经抽到，也按同一张表补偿（game/rewards.mjs）。
 */
export const DUPLICATE_COMPENSATION = { 3: 8, 4: 16, 5: 160 };

/** 某稀有度重复一次补偿多少钻石（未知稀有度为 0）。 */
export function duplicateCompensation(rarity) {
  return DUPLICATE_COMPENSATION[Number(rarity)] || 0;
}

/** 把任意输入归一成合法的池名：只有 'costume' 是服饰池，其余一律按角色池处理（与服务器记录拥有物的规则一致）。 */
export function normalizePool(pool) {
  return pool === 'costume' ? 'costume' : 'character';
}

/**
 * 执行抽卡（只收钻石）
 * @param {object} account - 玩家账户（扣 account.diamonds；抽到的条目记入 ownedCharacters / ownedCostumes；重复补偿记入 account.diamonds）
 * @param {string} pool - 'character' | 'costume'（其他值按 'character' 处理）
 * @param {number} count - 10 为十连，其余按单抽
 * @param {{currency?: string}} [options] - currency 只能省略或为 'diamonds'；旧前端传来的 'credit' 一律拒绝（DIAMONDS_ONLY），
 *   不会悄悄改扣钻石
 * @returns {{ok: true, pool: string, currency: 'diamonds', results: Array, cost: number, pity: number,
 *   compensation: {diamonds: number}, balance: {diamonds: number}}|{ok: false, code: string, message: string}}
 *   results[i] 是条目的对外视图（viewCharacter / viewCostume，按这个账户的主线进度：未登场的女主是封存卡），另带
 *   pullIndex、isNew（这一抽之前是否未拥有该条目；同一次十连里第二次抽到同一条目时为 false）、
 *   duplicate / compensation（重复时为 true / 折成的钻石数，不重复为 false / 0）。
 */
export function pullGacha(account, pool, count, options = {}) {
  if (pool !== null && typeof pool === 'object') {
    // 旧签名 pullGacha(account, meter, pool, count)：召唤已经不用 Credit 计量器，宁可报错也不要把计量器当成池名
    throw new TypeError('pullGacha(account, pool, count)：召唤只收钻石，不再传 Credit 计量器。');
  }
  const requested = options?.currency;
  if (requested !== undefined && requested !== null && requested !== '' && requested !== GACHA_CURRENCY) {
    return { ok: false, code: 'DIAMONDS_ONLY', message: '召唤只收钻石；Credit 只用于 AI 对话。' };
  }
  const poolKey = normalizePool(pool);
  const pullCount = Number(count) === 10 ? 10 : 1;
  const label = pullCount === 10 ? '十连' : '单抽';
  const cost = pullCount === 10 ? GACHA_DIAMOND_COSTS.ten : GACHA_DIAMOND_COSTS.single;
  const balance = Number.isFinite(account.diamonds) ? account.diamonds : 0;
  if (balance < cost) {
    return { ok: false, code: 'INSUFFICIENT_DIAMONDS', message: `钻石不足，${label}需要${cost}钻石（当前${balance}）。` };
  }
  account.diamonds = balance - cost;

  // 初始化保底计数器
  if (!account.pityCounters || typeof account.pityCounters !== 'object') account.pityCounters = {};
  if (!Number.isFinite(account.pityCounters[poolKey])) account.pityCounters[poolKey] = 0;

  // 已拥有列表：isNew 以「这一抽之前」为准
  const ownedKey = poolKey === 'costume' ? 'ownedCostumes' : 'ownedCharacters';
  if (!Array.isArray(account[ownedKey])) account[ownedKey] = [];
  const owned = new Set(account[ownedKey]);

  const rates = GACHA_RATES[poolKey];
  const sourcePool = poolKey === 'costume' ? COSTUME_PULL_TABLE : CHARACTER_POOL;
  const view = poolKey === 'costume' ? viewCostume : viewCharacter;
  const cleared = clearedChaptersOf(account);
  const results = [];
  let compensationTotal = 0;

  for (let i = 0; i < pullCount; i++) {
    account.pityCounters[poolKey] += 1;
    let rarity;

    // 保底机制：达到阈值必出5星
    if (account.pityCounters[poolKey] >= PITY_THRESHOLD) {
      rarity = 5;
      account.pityCounters[poolKey] = 0;
    } else {
      rarity = rollRarity(rates);
      if (rarity === 5) {
        account.pityCounters[poolKey] = 0; // 出5星重置保底
      }
    }

    // 从对应稀有度的池中随机选取。
    // 概率表只列池内存在的稀有度；万一不一致，降到池内最低稀有度，不能退回整池随机（否则概率与保底都会失真）。
    let candidates = sourcePool.filter((item) => item.rarity === rarity);
    if (candidates.length === 0) {
      const lowest = Math.min(...sourcePool.map((item) => item.rarity));
      candidates = sourcePool.filter((item) => item.rarity === lowest);
    }
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    const isNew = !owned.has(picked.id);
    let compensation = 0;
    if (isNew) {
      owned.add(picked.id);
      account[ownedKey].push(picked.id);
    } else {
      compensation = duplicateCompensation(picked.rarity);
      compensationTotal += compensation;
    }

    results.push({
      ...view(picked, cleared),
      pullIndex: i + 1,
      isNew,
      duplicate: !isNew,
      compensation
    });
  }

  if (compensationTotal > 0) {
    account.diamonds = (Number.isFinite(account.diamonds) ? account.diamonds : 0) + compensationTotal;
  }

  return {
    ok: true,
    pool: poolKey,
    currency: GACHA_CURRENCY,
    results,
    cost,
    pity: account.pityCounters[poolKey],
    compensation: { diamonds: compensationTotal },
    balance: { diamonds: Number.isFinite(account.diamonds) ? account.diamonds : 0 }
  };
}

/**
 * 获取保底计数
 * @param {object} account - 玩家账户
 * @param {string} pool - 'character' | 'costume'
 * @returns {number} 当前保底计数
 */
export function getPityCounter(account, pool) {
  if (!account.pityCounters) return 0;
  return account.pityCounters[normalizePool(pool)] || 0;
}

// 内部工具：根据概率表抽取稀有度（从高到低累加；表里只列池内存在的稀有度）
function rollRarity(rates) {
  const tiers = Object.keys(rates).map(Number).sort((a, b) => b - a);
  const roll = Math.random();
  let cumulative = 0;
  for (const rarity of tiers) {
    cumulative += rates[rarity];
    if (roll < cumulative) return rarity;
  }
  // 浮点误差兜底：落到表里最低的稀有度
  return tiers[tiers.length - 1];
}
