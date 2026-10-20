/**
 * 换衣系统
 * 管理角色服装的装备、查询；BRANCH_SCENES 是规划中的换装分支剧情（尚未制作，界面标注「敬请期待」）
 */

import { CHARACTER_POOL, COSTUME_POOL } from './gacha.mjs';

// 服装类型列表
export const COSTUME_TYPES = ['newyear', 'maid', 'christmas', 'duanwu', 'anniversary', 'swimsuit'];

// 服装类型中文标签
export const COSTUME_LABELS = {
  newyear: '新年服',
  maid: '女仆服',
  christmas: '圣诞服',
  duanwu: '端午服',
  anniversary: '周年庆服',
  swimsuit: '夏日度假服'
};

// 每种服装类型对应的分支剧情（规划中，尚未制作）
export const BRANCH_SCENES = {
  newyear: {
    sceneId: 'branch_newyear',
    title: '新年祈愿',
    description: '穿上新年服，与队友一同前往月蚀神社许下新年愿望。'
  },
  maid: {
    sceneId: 'branch_maid',
    title: '列车咖啡厅',
    description: '女仆服日！在餐车开设限定咖啡厅，队友们轮流当服务员。'
  },
  christmas: {
    sceneId: 'branch_christmas',
    title: '雪夜礼物',
    description: '圣诞夜的列车上，交换礼物与秘密心事。'
  },
  duanwu: {
    sceneId: 'branch_duanwu',
    title: '粽叶飘香',
    description: '端午节特别篇章，在列车厨房包粽子，触发隐藏对话。'
  },
  anniversary: {
    sceneId: 'branch_anniversary',
    title: '周年庆典',
    description: '骑士联盟周年纪念，全员盛装出席，回顾冒险历程。'
  },
  swimsuit: {
    sceneId: 'branch_swimsuit',
    title: '海边列车',
    description: '夏日特别篇，列车驶过海岸线，换上夏日便装享受短暂假期。'
  }
};

/** 表示「脱下 / 恢复默认服装」的 costumeId。 */
export const DEFAULT_COSTUME_IDS = new Set(['default', '', null, undefined]);

/**
 * 装备服装
 * 规则：
 * - costumeId 为 'default'（或空）时恢复默认服装，总是允许（角色必须存在）；
 * - 服装必须已拥有、必须在服饰池里、必须属于该角色；
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
  const costume = COSTUME_POOL.find((c) => c.id === costumeId);
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
 * @param {string} costumeId - 服装ID（如 "lia_newyear"）
 * @returns {string|null} 分支剧情场景ID
 */
export function getCostumeBranchScene(costumeId) {
  // 从costumeId中提取服装类型（最后一段）
  const parts = String(costumeId ?? '').split('_');
  const type = parts[parts.length - 1];

  const scene = BRANCH_SCENES[type];
  return scene ? scene.sceneId : null;
}
