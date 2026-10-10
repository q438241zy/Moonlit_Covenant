// 厚涂位图预留位：public/assets/paint/manifest.json 里登记的图优先显示，其余继续用矢量 SVG。
// 出图后运行 tools/art/raster/finalize.mjs 会写入 JPEG 并更新清单，无需改代码。
// 清单格式：{ "portraits": ["freya"], "costumes": ["freya_maid"], "cg": [], "boss": [], "scenes": [], "cards": [], "story-bg": [], "story-npc": [] }

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
