/**
 * AI模型预设
 * 管理可用的AI模型配置及切换逻辑
 */

// 可用AI模型列表
export const AI_MODELS = [
  {
    id: 'deepseek-flash',
    name: 'DeepSeek Flash',
    provider: 'deepseek',
    model: 'deepseek-chat',
    baseUrl: 'https://api.deepseek.com/v1',
    description: '快速响应，适合日常对话',
    available: true
  },
  {
    id: 'deepseek-reason',
    name: 'DeepSeek Reasoner',
    provider: 'deepseek',
    model: 'deepseek-reasoner',
    baseUrl: 'https://api.deepseek.com/v1',
    description: '深度推理，适合复杂剧情',
    available: false // coming soon
  },
  {
    id: 'ollama-local',
    name: '本地模型',
    provider: 'ollama',
    model: 'llama3',
    baseUrl: 'http://127.0.0.1:11434/v1',
    description: '离线运行，无需API Key',
    available: false
  },
  {
    id: 'custom',
    name: '自定义',
    provider: 'custom',
    model: '',
    baseUrl: '',
    description: '接入任意OpenAI兼容API',
    available: false
  }
];

/**
 * 创建默认设置
 * @returns {object} 默认AI设置
 */
export function createDefaultSettings() {
  return {
    activeModel: 'deepseek-flash',
    customConfig: null,
    temperature: 0.8,
    maxTokens: 300
  };
}

/**
 * 获取当前激活的模型配置
 * @param {object} settings - 用户设置
 * @returns {object} 当前模型配置（含settings中的temperature/maxTokens）
 */
export function getActiveModel(settings) {
  const modelId = settings?.activeModel || 'deepseek-flash';
  const model = AI_MODELS.find((m) => m.id === modelId);

  if (!model) {
    // 回退到默认模型
    const fallback = AI_MODELS[0];
    return {
      ...fallback,
      temperature: settings?.temperature ?? 0.8,
      maxTokens: settings?.maxTokens ?? 300
    };
  }

  // 自定义模型使用用户配置
  if (model.id === 'custom' && settings?.customConfig) {
    return {
      ...model,
      model: settings.customConfig.model || '',
      baseUrl: settings.customConfig.baseUrl || '',
      temperature: settings.temperature ?? 0.8,
      maxTokens: settings.maxTokens ?? 300
    };
  }

  return {
    ...model,
    temperature: settings?.temperature ?? 0.8,
    maxTokens: settings?.maxTokens ?? 300
  };
}

/**
 * 切换激活模型
 * @param {object} settings - 用户设置
 * @param {string} modelId - 目标模型ID
 * @returns {{ok: boolean, model: object|null, message?: string}}
 */
export function switchModel(settings, modelId) {
  const model = AI_MODELS.find((m) => m.id === modelId);

  if (!model) {
    return { ok: false, model: null, message: '未知模型。' };
  }

  if (!model.available) {
    return { ok: false, model: null, message: `${model.name}暂不可用（即将开放）。` };
  }

  settings.activeModel = modelId;

  return {
    ok: true,
    model: getActiveModel(settings)
  };
}
