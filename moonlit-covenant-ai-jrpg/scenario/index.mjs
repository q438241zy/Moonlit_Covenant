/**
 * 剧本系统 — 独立模块
 * 从 scenario/ 目录加载章节 JSON 数据，供游戏引擎调用。
 * 每个章节文件为 chapter-XX.json，包含场景、事件、选项、转场。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {Map<number, object>} */
const chapterCache = new Map();

/** 章节元数据索引 */
let chapterIndex = null;

export function loadChapterIndex() {
  if (chapterIndex) return chapterIndex;
  const files = readdirSync(__dirname)
    .filter((f) => /^chapter-\d{2}\.json$/.test(f))
    .sort();
  chapterIndex = files.map((f) => {
    const data = JSON.parse(readFileSync(join(__dirname, f), 'utf-8'));
    return {
      id: data.id,
      title: data.title,
      subtitle: data.subtitle || '',
      unlockCondition: data.unlockCondition || null,
      sceneCount: (data.scenes || []).length,
      estimatedMinutes: data.estimatedMinutes || 3
    };
  });
  return chapterIndex;
}

export function loadChapter(chapterId) {
  const num = Number(chapterId);
  if (chapterCache.has(num)) return chapterCache.get(num);
  const file = join(__dirname, `chapter-${String(num).padStart(2, '0')}.json`);
  try {
    const data = JSON.parse(readFileSync(file, 'utf-8'));
    chapterCache.set(num, data);
    return data;
  } catch {
    return null;
  }
}

export function getChapterScene(chapterId, sceneId) {
  const chapter = loadChapter(chapterId);
  if (!chapter) return null;
  return (chapter.scenes || []).find((s) => s.id === sceneId) || null;
}

export function getChapterEvents(chapterId, sceneId) {
  const scene = getChapterScene(chapterId, sceneId);
  return scene ? scene.events || [] : [];
}

export function getChapterChoices(chapterId, sceneId) {
  const scene = getChapterScene(chapterId, sceneId);
  return scene ? scene.choices || [] : [];
}

/** 获取章节内所有可解锁CG */
export function getChapterCGs(chapterId) {
  const chapter = loadChapter(chapterId);
  if (!chapter) return [];
  const cgs = [];
  for (const scene of chapter.scenes || []) {
    for (const ev of scene.events || []) {
      if (ev.unlockCg) cgs.push(ev.unlockCg);
    }
  }
  return cgs;
}

/** 获取总章节数 */
export function getTotalChapters() {
  return loadChapterIndex().length;
}

/** 清除缓存（热重载用） */
export function clearCache() {
  chapterCache.clear();
  chapterIndex = null;
}
