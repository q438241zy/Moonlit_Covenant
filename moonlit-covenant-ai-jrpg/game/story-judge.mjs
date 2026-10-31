/**
 * 主线自由输入判定（docs/STORY-ENGINE.md §8）
 * 节点定义一律从 public/story/chapters/ 读取，不信任客户端；模型只负责归类与角色台词，硬事件由章节数据决定。
 */
import { readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AI_CONFIG, contentRatingRules, normalizeContentMode } from './ai.mjs';
import { demoJudge, findNode, sanitizeLines, cleanName } from '../public/story/engine.js';

const withName = (text, playerName) => String(text ?? '').replaceAll('{PLAYER_NAME}', playerName);

const storyDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'story');
// 文件路径 → { mtimeMs, size, data }：每次读取前先 stat，文件改过（mtime 或大小变化）就重新读，改章节不用重启服务器
const fileCache = new Map();

function readJsonFile(file) {
  return JSON.parse(readFileSync(file, 'utf-8'));
}

export function readJsonCached(file) {
  let stat;
  try {
    stat = statSync(file);
  } catch (error) {
    fileCache.delete(file);
    throw error;
  }
  const hit = fileCache.get(file);
  if (hit && hit.mtimeMs === stat.mtimeMs && hit.size === stat.size) return hit.data;
  const data = readJsonFile(file);
  fileCache.set(file, { mtimeMs: stat.mtimeMs, size: stat.size, data });
  return data;
}

export function loadStoryChapter(chapterId) {
  if (!/^ch\d{3}$/.test(String(chapterId))) return null;
  try {
    return readJsonCached(join(storyDir, 'chapters', `${chapterId}.json`));
  } catch {
    return null;
  }
}

function speakers(chapter) {
  let shared = {};
  try {
    shared = readJsonCached(join(storyDir, 'speakers.json'));
  } catch (error) {
    console.warn('[story judge] 读取 speakers.json 失败：', error.message);
  }
  return { ...shared, ...(chapter.speakers || {}) };
}

export function clearStoryCache() {
  fileCache.clear();
}

const JUDGE_SCHEMA = (node) => ({
  type: 'object',
  additionalProperties: false,
  required: ['intent', 'secondary', 'quality', 'morality', 'feasible', 'reaction', 'memory'],
  properties: {
    intent: { type: 'string', enum: node.intents.map((x) => x.id) },
    secondary: { type: 'string', enum: ['', ...node.intents.map((x) => x.id)] },
    quality: { type: 'integer', minimum: 0, maximum: 3 },
    morality: { type: 'integer', minimum: -2, maximum: 2 },
    feasible: { type: 'boolean' },
    reaction: {
      type: 'array',
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['who', 'text'],
        properties: { who: { type: 'string', enum: [...(node.focus || []), 'narr'] }, text: { type: 'string', maxLength: 90 } },
      },
    },
    memory: { type: 'string', maxLength: 60 },
  },
});

// 内容分级的未成年硬名单（剧本/README_30章重構提案.md 7.3；核#14）：托比8岁、波莉6岁、妮拉15岁、派克15岁、幼龙豆鳞比照儿童
export const STORY_MINORS = ['托比', '波莉', '妮拉', '派克', '幼龙豆鳞'];
const RATING_VIOLATION = 'intent 按越界意图归类（节点没有对应意图时取最接近的负面意图），morality 取 -2';

/** 判定器的系统提示词。mode 是客户端 context.mode（'15+' | '12+'），没传或不认识时按 12+。 */
export function buildPrompt(chapter, node, playerName, recent = [], mode) {
  const names = speakers(chapter);
  const who = (node.focus || []).map((id) => `${id}=${String(names[id]?.name || id).replace('{PLAYER_NAME}', playerName)}`).join('，') || '（无，只能用 narr 叙述）';
  const intents = node.intents.map((x) => `- ${x.id}：${withName(x.label, playerName)}${x.desc ? `——${withName(x.desc, playerName)}` : ''}`).join('\n');
  const history = recent.map((r) => `- ${r.id}：「${r.text}」→ ${r.intent}`).join('\n') || '（无）';
  return [
    `你是《月蚀契约》主线剧情的判定器。主角名叫${playerName}，玩家用自由文字描述${playerName}的台词或行动。`,
    `章节：${chapter.title}。当前节点：${node.id}（${node.kind}）。界面提示：${withName(node.prompt, playerName)}`,
    `场景事实：\n${(node.context || []).map((s) => `- ${withName(s, playerName)}`).join('\n') || '（无）'}`,
    `演出原则：\n${(node.principles || []).map((s) => `- ${withName(s, playerName)}`).join('\n') || '（无）'}`,
    `可选意图（intent 必须取其一${node.multi ? '；secondary 可给出同时成立的第二个意图，没有则为空字符串' : '；secondary 填空字符串'}）：\n${intents}`,
    `玩家最近的输入：\n${history}`,
    '判定要求：',
    '1. 按玩家真实意图归类，表达质量 quality(0-3) 与道德方向 morality(-2..2) 分开判定；说得漂亮不等于正面，说得狠不等于低质量，长度不加分。',
    '2. 超出主角当前能力（七属性都极其微弱）的行动不会成功，世界不配合生成奇迹，feasible 置 false。',
    `3. reaction 写 1–4 行在场角色的即时反应（简体中文，符合角色性格，每行不超过 60 字）；who 只能是：${who}，或 narr（叙述动作）。不要替${playerName}说话，不要改变剧情的既定结果，不要提前揭示秘密。`,
    '4. memory 用一句话（不超过 30 字）记下这次选择值得被角色记住的地方，没有就留空。',
    `5. reaction 与 memory 遵守内容分级。${contentRatingRules(mode, { minors: STORY_MINORS, onViolation: RATING_VIOLATION })}`,
    '只输出 JSON。',
  ].join('\n\n');
}

function extractJson(text) {
  const raw = String(text || '').trim();
  try { return JSON.parse(raw); } catch { /* 继续尝试截取 */ }
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
  throw new Error('模型没有返回 JSON。');
}

async function callModel(chapter, node, text, playerName, recent, mode) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs);
  const base = {
    model: AI_CONFIG.model,
    temperature: 0.5,
    max_tokens: 420,
    messages: [
      { role: 'system', content: buildPrompt(chapter, node, playerName, recent, mode) },
      { role: 'user', content: text || '（沉默，不说话也不行动）' },
    ],
  };
  const attempts = [
    { ...base, response_format: { type: 'json_schema', json_schema: { name: 'story_judgement', strict: true, schema: JUDGE_SCHEMA(node) } } },
    { ...base, response_format: { type: 'json_object' } },
    base,
  ];
  // 只有上游明确拒绝 response_format（HTTP 400 / 422）时才降一级重试；
  // 网络错误、超时、5xx、429 或内容不是 JSON 都直接抛出，由调用方回退演示判定，每个请求最多 1 次「无效」上游调用。
  try {
    for (let i = 0; i < attempts.length; i += 1) {
      const res = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${AI_CONFIG.apiKey}` },
        body: JSON.stringify(attempts[i]),
        signal: controller.signal,
      });
      if (!res.ok) {
        const detail = (await res.text().catch(() => '')).slice(0, 200);
        if ((res.status === 400 || res.status === 422) && i < attempts.length - 1) continue;
        throw new Error(`AI endpoint ${res.status}: ${detail}`);
      }
      const payload = await res.json();
      return extractJson(payload?.choices?.[0]?.message?.content);
    }
    throw new Error('AI 调用失败。');
  } finally {
    clearTimeout(timeout);
  }
}

// 严格校验模型输出；任何一项不合格都返回 null，由调用方回退演示判定
export function normalizeModelJudgement(raw, node) {
  if (!raw || typeof raw !== 'object') return null;
  const ids = new Set(node.intents.map((x) => x.id));
  if (!ids.has(raw.intent)) return null;
  const secondary = node.multi && ids.has(raw.secondary) && raw.secondary !== raw.intent ? raw.secondary : null;
  const reaction = raw.reaction === undefined || (Array.isArray(raw.reaction) && raw.reaction.length === 0)
    ? null
    : sanitizeLines(raw.reaction, node);
  if (raw.reaction?.length && !reaction) return null;
  const int = (v, lo, hi, d) => Math.max(lo, Math.min(hi, Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : d));
  return {
    intent: raw.intent,
    secondary,
    quality: int(raw.quality, 0, 3, 1),
    morality: int(raw.morality, -2, 2, 0),
    feasible: raw.feasible !== false,
    reaction: reaction ? reaction.map((l) => ({ who: l.t === 'narr' ? 'narr' : l.who, text: l.text })) : undefined,
    memory: String(raw.memory || '').replace(/[<>]/g, '').trim().slice(0, 60),
    source: 'model',
  };
}

/**
 * @param {object} input 客户端请求体：{ chapterId, nodeId, text, context }；context = { playerName, recent, mode }
 * @param {object} [options]
 * @param {() => (Function|null|false)} [options.acquire] 调用模型前申请名额（服务器的限流与并发上限）；
 *   返回释放函数表示可以调用，返回假值表示名额已满，直接使用演示判定（source:'demo'）。
 */
export async function judgeStoryInput(input = {}, { acquire } = {}) {
  const { chapterId, nodeId, text, context } = input && typeof input === 'object' ? input : {};
  const chapter = loadStoryChapter(chapterId);
  if (!chapter) throw Object.assign(new Error('章节不存在。'), { status: 404, code: 'NO_CHAPTER' });
  const node = findNode(chapter, String(nodeId || ''));
  if (!node) throw Object.assign(new Error('输入节点不存在。'), { status: 404, code: 'NO_NODE' });
  const clean = String(text ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 500);
  const demo = demoJudge(node, clean);
  if (AI_CONFIG.mode !== 'openai') return demo;
  const release = acquire ? acquire() : () => {};
  if (!release) return { ...demo, source: 'demo' };
  try {
    return await judgeWithModel(chapter, node, clean, context, demo);
  } finally {
    release();
  }
}

async function judgeWithModel(chapter, node, clean, context, demo) {
  const playerName = cleanName(context?.playerName);
  const recent = (Array.isArray(context?.recent) ? context.recent : []).slice(-3).map((r) => ({
    id: String(r?.id || '').slice(0, 60),
    text: String(r?.text || '').replace(/[\u0000-\u001f<>]/g, ' ').slice(0, 120),
    intent: String(r?.intent || '').slice(0, 40),
  }));
  try {
    const mode = normalizeContentMode(context?.mode); // 内容模式只影响提示词里的分级规则，判定与校验照旧
    const judged = normalizeModelJudgement(await callModel(chapter, node, clean, playerName, recent, mode), node);
    if (judged) return judged;
    console.warn('[story judge] 模型输出未通过校验，使用演示判定');
  } catch (error) {
    console.warn('[story judge fallback]', error.message);
  }
  return { ...demo, source: 'fallback' };
}
