// 内容分级（剧本/README_30章重構提案.md 第七节；作者核#13 第8条、核#14）：主线播放器的模式设置。
// 纯函数，不碰 DOM 与 localStorage：player.js 与 test/rating.test.mjs 共用。
//
// - 默认 15+（戏剧模式）；12+（柔和模式）随时可在设置里切换。两种模式的剧情、选择、数值与结局完全相同，
//   只换节拍文本（15+ 显示 text15，缺了退回 text，见 engine.js 的 present）。
// - 首次启动（浏览器里没有存过设置）：标题页弹出一次模式选择，预选 15+。
// - 已经存过设置的老玩家：沿用存档里的模式（不强制切换），标题页提示一次「默认已改为 15+」。
// - 设置里的 ratingAck 记下玩家已经看过哪一版分级说明；以后分级说明再改，把 RATING_VERSION 加一即可再提示一次。

export const DEFAULT_MODE = '15+';
// 存档里的模式缺失或不认识时的保底：老版本的默认值，也是 engine.js createRun 在呼叫端没传 mode 时的保底
export const FALLBACK_MODE = '12+';
export const RATING_VERSION = 1;

export const MODES = {
  '15+': { label: '15+', name: '戏剧模式', blurb: '擦边与流血可以出现，但不露骨。' },
  '12+': { label: '12+', name: '柔和模式', blurb: '以剪影、遮挡与结果带过。' },
};

export const SETTINGS_NOTE = '15+（默认）：擦边与血腥，但不露骨／12+：柔和演出。两种模式剧情与结局相同。';
export const CHOICE_NOTE = '两种模式的剧情、选择与结局完全相同，之后随时可以在「设置」里更改。';
export const NOTICE_TEXT = '本作默认15+：有擦边与血腥描写，但不露骨。也可以改用12+柔和模式，剧情与结局完全相同。';

export function normalizeMode(mode, fallback = FALLBACK_MODE) {
  return mode === '15+' || mode === '12+' ? mode : fallback;
}

export function otherMode(mode) {
  return normalizeMode(mode) === '15+' ? '12+' : '15+';
}

/**
 * 启动时合并设置。
 * @param {unknown} saved localStorage 里读出的设置（从没存过为 null）
 * @param {object} [defaults] 其余设置项的默认值（文字速度等）
 * @returns {{ settings: object, prompt: 'choose'|'notice'|null }}
 *   prompt：'choose' = 首次启动，请玩家选模式；'notice' = 老玩家，提示一次默认已改；null = 都看过了。
 */
export function initSettings(saved, defaults = {}) {
  const fresh = !saved || typeof saved !== 'object' || Array.isArray(saved);
  if (fresh) return { settings: { ...defaults, mode: DEFAULT_MODE }, prompt: 'choose' };
  const settings = { ...defaults, ...saved, mode: normalizeMode(saved.mode) };
  return { settings, prompt: Number(saved.ratingAck) >= RATING_VERSION ? null : 'notice' };
}

/** 玩家在首次选择或老玩家提示里做了决定（mode 省略 = 保持当前模式）：返回要存下的新设置。 */
export function acknowledgeRating(settings, mode) {
  const current = normalizeMode(settings?.mode, DEFAULT_MODE);
  return { ...settings, mode: normalizeMode(mode, current), ratingAck: RATING_VERSION };
}
