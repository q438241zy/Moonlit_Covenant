/**
 * 主线自由输入判定（docs/STORY-ENGINE.md §8）
 * 节点定义一律从 public/story/chapters/ 读取，不信任客户端；模型只负责归类与角色台词，硬事件由章节数据决定。
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AI_CONFIG } from './ai.mjs';
import { demoJudge, findNode, sanitizeLines, cleanName } from '../public/story/engine.js';

const withName = (text, playerName) => String(text ?? '').replaceAll('{PLAYER_NAME}', playerName);

const storyDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'story');
const chapterCache = new Map();
let speakerCache = null;

function readJsonFile(file) {
  return JSON.parse(readFileSync(file, 'utf-8'));
}

export function loadStoryChapter(chapterId) {
  if (!/^ch\d{3}$/.test(String(chapterId))) return null;
  if (chapterCache.has(chapterId)) return chapterCache.get(chapterId);
  try {
    const chapter = readJsonFile(join(storyDir, 'chapters', `${chapterId}.json`));
    chapterCache.set(chapterId, chapter);
    return chapter;
  } catch {
    return null;
  }
}

function speakers(chapter) {
  speakerCache ||= readJsonFile(join(storyDir, 'speakers.json'));
  return { ...speakerCache, ...(chapter.speakers || {}) };
}

export function clearStoryCache() {
  chapterCache.clear();
  speakerCache = null;
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

function buildPrompt(chapter, node, playerName, recent) {
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

async function callModel(chapter, node, text, playerName, recent) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs);
  const base = {
    model: AI_CONFIG.model,
    temperature: 0.5,
    max_tokens: 420,
    messages: [
      { role: 'system', content: buildPrompt(chapter, node, playerName, recent) },
      { role: 'user', content: text || '（沉默，不说话也不行动）' },
    ],
  };
  const attempts = [
    { ...base, response_format: { type: 'json_schema', json_schema: { name: 'story_judgement', strict: true, schema: JUDGE_SCHEMA(node) } } },
    { ...base, response_format: { type: 'json_object' } },
    base,
  ];
  try {
    let lastError;
    for (const body of attempts) {
      try {
        const res = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${AI_CONFIG.apiKey}` },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`AI endpoint ${res.status}: ${(await res.text()).slice(0, 200)}`);
        const payload = await res.json();
        return extractJson(payload?.choices?.[0]?.message?.content);
      } catch (error) {
        lastError = error;
        if (error.name === 'AbortError') break;
      }
    }
    throw lastError || new Error('AI 调用失败。');
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

export async function judgeStoryInput({ chapterId, nodeId, text, context } = {}) {
  const chapter = loadStoryChapter(chapterId);
  if (!chapter) throw Object.assign(new Error('章节不存在。'), { status: 404, code: 'NO_CHAPTER' });
  const node = findNode(chapter, String(nodeId || ''));
  if (!node) throw Object.assign(new Error('输入节点不存在。'), { status: 404, code: 'NO_NODE' });
  const clean = String(text ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 500);
  const demo = demoJudge(node, clean);
  if (AI_CONFIG.mode !== 'openai') return demo;

  const playerName = cleanName(context?.playerName);
  const recent = (Array.isArray(context?.recent) ? context.recent : []).slice(-3).map((r) => ({
    id: String(r?.id || '').slice(0, 60),
    text: String(r?.text || '').replace(/[\u0000-\u001f<>]/g, ' ').slice(0, 120),
    intent: String(r?.intent || '').slice(0, 40),
  }));
  try {
    const judged = normalizeModelJudgement(await callModel(chapter, node, clean, playerName, recent), node);
    if (judged) return judged;
    console.warn('[story judge] 模型输出未通过校验，使用演示判定');
  } catch (error) {
    console.warn('[story judge fallback]', error.message);
  }
  return { ...demo, source: 'fallback' };
}
