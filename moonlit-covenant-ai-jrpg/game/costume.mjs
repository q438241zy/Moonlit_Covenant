/**
 * 换衣系统
 * 管理角色服装的装备、查询。服装类型、稀有度与「常驻 / 典藏」状态的唯一来源是 game/gacha.mjs 的 COSTUME_TYPE_META（决定#31）：
 * 典藏（冬灯节服、新历祭服、纪念日礼服、龙舟祭服）退出了常驻抽取表，但 id 不变、已拥有的照样能穿。
 * BRANCH_SCENES 是每类服装将来对应的番外入口（番外系统还没上线：每条都是 available:false，界面标注「敬请期待」）。
 */

import { CHARACTER_POOL, COSTUME_CATALOG, COSTUME_TYPE_META } from './gacha.mjs';

// 服装类型列表（先常驻、后典藏，就是换衣间的排列顺序）
export const COSTUME_TYPES = Object.keys(COSTUME_TYPE_META);

// 服装类型中文标签（/api/costume 的 types）
export const COSTUME_LABELS = Object.fromEntries(COSTUME_TYPES.map((type) => [type, COSTUME_TYPE_META[type].label]));

/**
 * 每类服装对应的番外入口（服装稿 §5.2；番外排表以 30章重构提案 4.7 为准）。还没制作，全部 available:false。
 *   extras：对应的番外 id（ex001–ex010）；unlockAfter：番外在主线这一章通关后开放。
 * 服装不是番外的解锁条件，番外也不要求穿服装；文案只写「换上节日的衣服」这类泛称，不描写服装细节。
 * /api/costume 会把整张表原样发给所有玩家，所以这里不写女主的名字、姓、故国或任何主线剧透。
 */
export const BRANCH_SCENES = {
  swimsuit: {
    sceneId: 'branch_swimsuit',
    extras: ['ex002', 'ex009'],
    unlockAfter: 'ch015',
    title: '退潮的沙洲',
    description: '雾港外海的沙洲退潮了。难得的休息日，换上泳装去拾贝、游泳——记得涂翠影药草防晒膏。',
    available: false
  },
  maid: {
    sceneId: 'branch_maid',
    extras: ['ex001'],
    unlockAfter: 'ch010',
    title: '桥头旅店的帮工日',
    description: '雾港桥头旅店人手不够，大家换上女侍制服帮一天忙。',
    available: false
  },
  christmas: {
    sceneId: 'branch_christmas',
    extras: ['ex005'],
    unlockAfter: 'ch020',
    title: '冬灯夜',
    description: '冬灯节的夜里，窗前一盏盏点起冬灯。大家换上节日的衣服，交换小礼物，在灯下说几句平时说不出口的话。',
    available: false
  },
  newyear: {
    sceneId: 'branch_newyear',
    extras: ['ex006'],
    unlockAfter: 'ch022',
    title: '新历祭',
    description: '新历的第一天，营地挂起彩旗、摆开长桌。全员换上节日的衣服，围着篝火许下新一年的愿望。',
    available: false
  },
  anniversary: {
    sceneId: 'branch_anniversary',
    extras: ['ex008'],
    unlockAfter: 'ch023',
    title: '一路走来的纪念日',
    description: '最早结伴上路的几个人翻出旧地图，一站一站地回想一路走来的日子。换上礼服，为相遇的那一天干一杯。',
    available: false
  },
  duanwu: {
    sceneId: 'branch_duanwu',
    extras: ['ex009'],
    unlockAfter: 'ch025',
    title: '龙舟祭',
    description: '南岸的河口办起了龙舟祭。大家换上节日的衣服，有人上船划桨，有人在岸边擂鼓助威。',
    available: false
  }
};

/** 表示「脱下 / 恢复默认服装」的 costumeId。 */
export const DEFAULT_COSTUME_IDS = new Set(['default', '', null, undefined]);

/**
 * 装备服装
 * 规则：
 * - costumeId 为 'default'（或空）时恢复默认服装，总是允许（角色必须存在）；
 * - 服装必须已拥有、必须在服装目录里（常驻和典藏都算：典藏退出了抽取表，已拥有的照样能穿）、必须属于该角色；
 * - 必须先拥有该角色才能穿戴（换衣间里未拥有角色的服装放在「待解锁角色」分组，获得角色后可穿戴）。
 * @param {object} account - 玩家账户（需包含ownedCostumes数组和equippedCostumes对象）
 * @param {string} characterId - 角色ID
 * @param {string} costumeId - 服装ID，或 'default'
 * @returns {{ok: boolean, equipped: object|null, message?: string}}
 */
export function equipCostume(account, characterId, costumeId) {
  // 初始化装备表
  if (!account.equippedCostumes || typeof account.equippedCostumes !== 'object') account.equippedCostumes = {};
  if (!Array.isArray(account.ownedCostumes)) account.ownedCostumes = [];
  const ownedCharacters = Array.isArray(account.ownedCharacters) ? account.ownedCharacters : [];

  if (typeof characterId !== 'string' || !CHARACTER_POOL.some((c) => c.id === characterId)) {
    return { ok: false, equipped: null, message: '未知角色。' };
  }

  // 恢复默认服装
  if (DEFAULT_COSTUME_IDS.has(costumeId)) {
    delete account.equippedCostumes[characterId];
    return { ok: true, equipped: { characterId, costumeId: null }, message: '已恢复默认服装。' };
  }

  // 检查是否拥有该服装
  if (typeof costumeId !== 'string' || !account.ownedCostumes.includes(costumeId)) {
    return { ok: false, equipped: null, message: '尚未拥有该服装。' };
  }

  // 验证服装存在且属于该角色
  const costume = COSTUME_CATALOG.find((c) => c.id === costumeId);
  if (!costume) {
    return { ok: false, equipped: null, message: '未知服装。' };
  }
  if (costume.characterId !== characterId) {
    return { ok: false, equipped: null, message: '该服装不属于此角色。' };
  }

  // 获得角色后才能穿戴
  if (!ownedCharacters.includes(characterId)) {
    return { ok: false, equipped: null, message: '需先拥有该角色，才能穿戴她的服装。' };
  }

  // 装备（同一角色同时只能穿一套）
  account.equippedCostumes[characterId] = costumeId;

  return {
    ok: true,
    equipped: { characterId, costumeId }
  };
}

/**
 * 获取所有角色的装备服装映射
 * @param {object} account - 玩家账户
 * @returns {object} characterId → costumeId 的映射
 */
export function getEquippedCostumes(account) {
  return account.equippedCostumes || {};
}

/**
 * 获取服装触发的分支剧情ID
 * @param {string} costumeId - 服装ID（如 "lia_newyear"——典藏的新历祭服）
 * @returns {string|null} 分支剧情场景ID
 */
export function getCostumeBranchScene(costumeId) {
  // 从costumeId中提取服装类型（最后一段）
  const parts = String(costumeId ?? '').split('_');
  const type = parts[parts.length - 1];

  const scene = BRANCH_SCENES[type];
  return scene ? scene.sceneId : null;
}
