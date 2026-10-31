// 厚涂位图预留位：public/assets/paint/manifest.json 里登记的图优先显示，其余继续用矢量 SVG。
// 出图后运行 tools/art/raster/finalize.mjs 会写入 JPEG 并更新清单，无需改代码。
// 清单格式：{ "portraits": ["freya"], "costumes": ["freya_maid"], "cg": [], "boss": [], "scenes": [], "cards": [], "story-bg": [], "story-npc": [] }
//
// 「AI 生成」角标（B17）：厚涂位图由 AI 生成，矢量 SVG 是原创美术。paint() 换成位图时，渲染器给图片的容器
// 加上 aiPaintedClass(url)，并把 aiBadge(url) 放进容器——各页面（主游戏、主线播放器、卡牌对战）用同一个角标。
// 角标的基础样式由本模块以可构造样式表（document.adoptedStyleSheets）注入，不需要内联 <style>，符合 CSP；
// 选择器包在 :where() 里（特异性为 0），页面样式表可以按场景微调位置与字号。

const SVG_PATH = /^\/assets\/(portraits|costumes|cg|boss|scenes|cards|story\/bg|story\/npc)\/([\w-]+?)(?:_e)?\.svg$/;
let ready = new Map();

export async function loadPaint() {
  try {
    const res = await fetch('/assets/paint/manifest.json', { cache: 'no-cache' });
    if (!res.ok) return;
    const data = await res.json();
    ready = new Map(Object.entries(data).filter(([, list]) => Array.isArray(list)).map(([group, list]) => [group, new Set(list)]));
  } catch { /* 没有清单就全部用矢量 */ }
}

// 矢量路径 -> 已就绪的厚涂路径（进化卡面沿用基础卡面的厚涂图）；其他路径原样返回
export function paint(url) {
  const m = typeof url === 'string' ? url.match(SVG_PATH) : null;
  if (!m) return url;
  const group = m[1].replace('/', '-'); // story/bg -> story-bg
  const name = m[2];
  return ready.get(group)?.has(name) ? `/assets/paint/${group}/${name}.jpg` : url;
}

/** paint(url) 是否换成了厚涂位图（AI 生成）。 */
export function isPainted(url) {
  return paint(url) !== url;
}

export const AI_BADGE_CLASS = 'ai-badge';
export const AI_PAINTED_CLASS = 'ai-painted';
export const AI_BADGE_TEXT = 'AI 生成';

const BADGE_CSS = `
:where(.ai-painted) { position: relative; }
:where(.ai-badge) {
  position: absolute; right: 8px; bottom: 8px; z-index: 6;
  display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 7px; border-radius: 99px;
  font: 700 10px/1.4 "Noto Sans SC", ui-sans-serif, system-ui, sans-serif; letter-spacing: .04em; white-space: nowrap;
  color: #fff4d6; background: rgba(10, 8, 24, .78); border: 1px solid rgba(255, 210, 125, .55);
  box-shadow: 0 2px 8px rgba(0, 0, 0, .45); pointer-events: none; user-select: none;
}`;
let badgeStyled = false;

function ensureBadgeStyle() {
  if (badgeStyled || typeof document === 'undefined') return;
  badgeStyled = true;
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(BADGE_CSS);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  } catch { /* 不支持可构造样式表的浏览器：页面样式表里的 .ai-badge 规则照样生效 */ }
}

/** 任一 url 被换成厚涂位图时返回容器要加的 class（'ai-painted'），否则返回空串。 */
export function aiPaintedClass(...urls) {
  return urls.some(isPainted) ? AI_PAINTED_CLASS : '';
}

/** 任一 url 被换成厚涂位图时返回统一的「AI 生成」角标 HTML，否则返回空串。放进图片的容器里。 */
export function aiBadge(...urls) {
  if (!urls.some(isPainted)) return '';
  ensureBadgeStyle();
  return `<span class="${AI_BADGE_CLASS}" role="note" title="图片由 AI 生成" aria-label="图片由 AI 生成">${AI_BADGE_TEXT}</span>`;
}
