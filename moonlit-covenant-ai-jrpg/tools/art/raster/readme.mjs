#!/usr/bin/env node
// Regenerates public/assets/paint/README.md from the raster job list (manifest.mjs), so the list of
// paint-over slots always matches what generate.mjs / finalize.mjs produce (incl. the story groups
// derived from public/story/locations.json and speakers.json). Deterministic; last step of npm run art.
//   node tools/art/raster/readme.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JOBS, SIZE, GROUPS } from './manifest.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const out = path.join(root, 'public/assets/paint/README.md');

const byGroup = new Map(Object.keys(GROUPS).map((g) => [g, []]));
for (const job of JOBS) {
  if (!byGroup.has(job.group)) throw new Error(`readme: group ${job.group} has no description in GROUPS`);
  byGroup.get(job.group).push(job);
}

const lines = [
  '# 厚涂位图预留位',
  '',
  '<!-- 本文件由 tools/art/raster/readme.mjs 根据 tools/art/raster/manifest.mjs 生成（npm run art 的最后一步），请勿手改。 -->',
  '',
  '把厚涂图（JPEG）按下列文件名放进对应子目录，并在 `manifest.json` 里登记文件名（不含扩展名），游戏就会优先显示它；没登记的继续显示矢量 SVG。',
  '',
  '用 `tools/art/raster/` 出图时，`npm run art:paint:finalize` 会自动完成压缩、放置和登记，并把原图里的 AIGC 隐式标识写进 JPEG（原图没有时补一段最小标识）；`test/art-assets.test.mjs` 会检查这里的每张 JPEG 都带 AIGC 信息。手动放图时也必须保留这些元数据。尺寸见各组标题，清单示例：',
  '',
  '```json',
  '{ "portraits": ["freya"], "costumes": ["freya_maid"], "cards": ["n_goblin"], "story-bg": ["hemai-day"] }',
  '```',
  '',
  '游戏画面里的女主一律用矢量立绘，位图只能经这里的预留位替换（audit B9）。换上之后，可见标识由页面统一显示的「AI 生成」角标负责（`public/paint.js` 的 `aiBadge()`，audit B17）；隐式标识（元数据）仍然必须保留。',
  '',
  '旧的莉亚、米娅、塞雷娜厚涂图（`public/assets/{lia,mia,serena}.jpg`，由 `tools/art/raster/compress-legacy.mjs` 压缩）是外传时期的造型，莉亚没有正典的塔盾「赤誓」，**不要**放进立绘预留位；请按 `tools/art/raster/manifest.mjs` 的正典描述重出。',
];
for (const [group, jobs] of byGroup) {
  if (!jobs.length) continue;
  const size = SIZE[group].replace('x', '×');
  lines.push('', `## ${group}/ · ${GROUPS[group].title}（${size}） · ${jobs.length} 张`, '');
  if (GROUPS[group].note) lines.push(GROUPS[group].note, '');
  lines.push(jobs.map((j) => `\`${path.basename(j.out, path.extname(j.out))}.jpg\`${j.label ? `（${j.label}）` : ''}`).join(' · '));
}
const text = lines.join('\n') + '\n';
fs.writeFileSync(out, text);
console.log(`wrote public/assets/paint/README.md (${JOBS.length} slots in ${[...byGroup.values()].filter((j) => j.length).length} groups)`);
