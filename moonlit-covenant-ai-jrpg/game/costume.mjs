/**
 * 换衣系统
 * 管理角色服装的装备、查询及分支剧情触发
 */

// 服装类型列表
export const COSTUME_TYPES = ['newyear', 'maid', 'christmas', 'duanwu', 'anniversary', 'swimsuit'];

// 服装类型中文标签
export const COSTUME_LABELS = {
  newyear: '新年服',
  maid: '女仆服',
  christmas: '圣诞服',
  duanwu: '端午服',
  anniversary: '周年庆服',
  swimsuit: '夏日泳装服'
};

// 每种服装类型对应的分支剧情
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
    description: '夏日特别篇，列车驶过海岸线，换上泳装享受短暂假期。'
  }
};

/**
 * 装备服装
 * @param {object} account - 玩家账户（需包含ownedCostumes数组和equippedCostumes对象）
 * @param {string} characterId - 角色ID
 * @param {string} costumeId - 服装ID
 * @returns {{ok: boolean, equipped: object|null, message?: string}}
 */
export function equipCostume(account, characterId, costumeId) {
  // 初始化装备表
  if (!account.equippedCostumes) account.equippedCostumes = {};
  if (!account.ownedCostumes) account.ownedCostumes = [];

  // 检查是否拥有该服装
  if (!account.ownedCostumes.includes(costumeId)) {
    return { ok: false, equipped: null, message: '尚未拥有该服装。' };
  }

  // 验证服装属于该角色
  const [costumeCharId] = costumeId.split('_');
  if (costumeCharId !== characterId) {
    return { ok: false, equipped: null, message: '该服装不属于此角色。' };
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
  const parts = costumeId.split('_');
  const type = parts[parts.length - 1];

  const scene = BRANCH_SCENES[type];
  return scene ? scene.sceneId : null;
}
