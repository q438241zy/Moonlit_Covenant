#!/usr/bin/env node
// 美术清单（交给 GPT 出图）：从 manifest.mjs 导出
//   docs/ART-LIST-GPT.md            给人看：画风、出图顺序、交付与导入规则、每一组逐张列出（文件、尺寸、用途/出现章节）
//   docs/art-list/gpt-art-list.csv  给 GPT 用：一行一张，含完整提示词（已并入「避免」）、参考图、尺寸、透明底（UTF-8 BOM，Excel 可直接打开）
// 确定性输出；改了 manifest.mjs、场景、说话人或叠图以后重跑：npm run art:list
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JOBS, SIZE, GROUPS, ALPHA_GROUPS, gptSize, gptPrompt } from './manifest.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

// 出图批次：后面的批次要拿前面的成品当参考图
const BATCH = {
  portraits: 1,
  costumes: 2, 'costumes-soft': 2,
  'story-bg': 3, 'story-npc': 3, 'story-insert': 3,
  'costumes-bust': 4, 'costumes-bust-soft': 4,
  cg: 5, boss: 5, scenes: 5, cards: 5,
};
const BATCH_TITLE = {
  1: '第 1 批 · 女主立绘（全套画风基准，必须先定稿）',
  2: '第 2 批 · 服装立绘与 12+ 罩衫版（以该女主立绘为参考）',
  3: '第 3 批 · 剧情：场景背景、胸像、道具叠图（以莉亚立绘为画风参考）',
  4: '第 4 批 · 服装透明胸像（以对应服装立绘为参考）',
  5: '第 5 批 · 外传 CG、Boss、舞台背景与卡面',
};
// 游戏里替换的那张矢量图（paint() 按它找厚涂图）
const gameFile = (j) => {
  const name = path.basename(j.out, '.png');
  const dir = { portraits: 'portraits', costumes: 'costumes', 'costumes-soft': 'costumes/soft', 'costumes-bust': 'costumes/bust', 'costumes-bust-soft': 'costumes/bust/soft', cg: 'cg', boss: 'boss', scenes: 'scenes', cards: 'cards', 'story-bg': 'story/bg', 'story-npc': 'story/npc', 'story-insert': 'story/insert' }[j.group];
  return `public/assets/${dir}/${name}.svg`;
};
const paintFile = (j) => `public/assets/paint/${j.group}/${path.basename(j.out, '.png')}.${ALPHA_GROUPS.has(j.group) ? 'png' : 'jpg'}`;

const rows = JOBS.map((j) => ({
  batch: BATCH[j.group],
  group: j.group,
  id: j.id,
  label: j.label || '',
  deliver: j.out,
  replaces: gameFile(j),
  final: paintFile(j),
  gptSize: gptSize(j.size),
  gameSize: j.target || SIZE[j.group],
  transparent: Boolean(j.alpha),
  refs: j.refs,
  after: j.after || [],
  usage: j.usage || '',
  prompt: gptPrompt(j),
}));
rows.sort((a, b) => a.batch - b.batch || JOBS.findIndex((j) => j.id === a.id) - JOBS.findIndex((j) => j.id === b.id));

// CSV
const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
const header = ['序号', '批次', '分组', '任务ID', '中文名', '交付文件（GPT 出图存到这里）', 'GPT 尺寸', '游戏尺寸', '透明底', '参考图（按顺序附上）', '依赖任务', '用途 / 出现章节', '替换的矢量图', '提示词（含「避免」）'];
const csv = [header.map(esc).join(',')].concat(rows.map((r, i) => [i + 1, r.batch, r.group, r.id, r.label, r.deliver, r.gptSize, r.gameSize.replace('x', '×'), r.transparent ? '是' : '', r.refs.join(' ; '), r.after.join(' ; '), r.usage, r.replaces, r.prompt].map(esc).join(','))).join('\r\n');
const listDir = path.join(root, 'docs/art-list');
fs.mkdirSync(listDir, { recursive: true });
fs.writeFileSync(path.join(listDir, 'gpt-art-list.csv'), `﻿${csv}\r\n`);

// Markdown
const counts = {};
for (const r of rows) counts[r.group] = (counts[r.group] || 0) + 1;
const cell = (s) => String(s).replace(/\|/g, '／').replace(/\n/g, ' ');
const md = [
  '# 美术清单（交给 GPT 出图）',
  '',
  '<!-- 本文件由 tools/art/raster/list.mjs 根据 tools/art/raster/manifest.mjs 生成（npm run art:list），请勿手改。 -->',
  '',
  `游戏里现在所有画面都是原创矢量美术（SVG）。这份清单列出要交给 GPT 重新绘制的全部 **${rows.length} 张**位图：女主立绘、服装、胸像、主线 / 番外 / 外传的场景背景、剧情胸像、道具特写、外传 CG 与卡面。出好的图按下面的规则放进去，游戏会自动用位图替换对应的矢量图，没出的继续显示矢量图，可以分批上线。`,
  '',
  '- 逐张的完整提示词、参考图与尺寸：[`docs/art-list/gpt-art-list.csv`](art-list/gpt-art-list.csv)（Excel 可直接打开）。用 API 批量出图时脚本直接读 `manifest.mjs`，不读 CSV。',
  '- 提示词的源头是 `tools/art/raster/manifest.mjs`：改描述就改那里，再跑 `npm run art:list` 重新导出本清单。',
  '',
  '## 画风（全套统一）',
  '',
  '**日本动画画师画的欧洲奇幻**：日式动漫的人物画法——大而有神的眼睛、干净利落的线稿、赛璐璐与厚涂结合的上色、成熟的五官；舞台、服饰与器物是欧洲中世纪奇幻（哥特教堂、石砌城镇、骑士盔甲、长袍、木桥与港口）。光影偏电影感：月光、彩色轮廓光，色调略收、点缀色鲜明。',
  '',
  '- **以女主角立绘为基准**：第 1 批先出八位女主立绘（参考 `tools/art/raster/ref/lia.png` 的画风与正典外观描述），**定稿后**，其余每一张都把新出的莉亚立绘当第一张参考图，保证线稿、上色、光影一致；服装与胸像另外附上该女主自己的立绘，保证同一张脸。',
  '- 每条提示词的开头都是同一段画风描述（`manifest.mjs` 的 `STYLE`），结尾附「Avoid:」（GPT 没有单独的负面提示词）。',
  '- 例外：番外十是平行现代（IF），它的办公室、商场背景和 OL 装画现代都市。',
  '',
  '## 硬性规定',
  '',
  '1. **不出现任何文字**：招牌、纸张、帐本、屏幕上的字一律画成看不清的笔画；不要水印、签名、logo。',
  '2. **女主全部是成年人**（18–19 岁），外观以正典为准（`设定集/03_主角与八位女主角.md`，提示词里已写好）。莉亚一律背着塔盾「赤誓」。外传（银轨号）的称号不写进画面说明。',
  '3. **尺度**：泳装是不透明的正常泳装，脸是画面重点，不做身体局部特写、不摆暗示性姿势（提示词与 Avoid 已写明）；12+ 罩衫版是同一件泳装外加她自己的罩衫。孩子（托比、波莉等）只出现在普通场景，永远不和泳装或任何擦边的画面同框。婚礼礼服是礼服店试穿：不画戒指、不画新郎、不画祭坛，头纱不遮脸。',
  '4. **背景不画人物**（场景背景、舞台背景、道具特写里没有人；人物用胸像另外叠上去）。',
  '5. **透明底**：剧情胸像与服装胸像要透明背景（PNG），只画人物本身，不要地面与背景。',
  '6. **AI 生成标识**：GPT 写在原图里的 AI 生成元数据（C2PA / EXIF）要保留；导入脚本压缩时会把 AIGC 标识写回成品，游戏里换成位图的位置会自动显示「AI 生成」角标。',
  '',
  '## 怎么出图与导入',
  '',
  '**用 API 批量出（推荐）**：',
  '',
  '```bash',
  'OPENAI_API_KEY=… npm run art:paint -- --provider openai --only group:portraits   # 第 1 批：先出立绘，确认画风',
  'OPENAI_API_KEY=… npm run art:paint -- --provider openai                          # 其余全部（按依赖自动分批，可中断续传）',
  'npm run art:paint:finalize                                                        # 裁成游戏尺寸、写回 AIGC 标识、登记到 public/assets/paint/manifest.json',
  '```',
  '',
  '- 默认模型 `gpt-image-1`（可用 `OPENAI_IMAGE_MODEL` 换成更新的版本），质量 `high`（`OPENAI_IMAGE_QUALITY` 可调）。有参考图的任务走图片编辑接口，一次附上全部参考图；胸像自动要透明底。',
  '- 某张不满意：改 `manifest.mjs` 里那条描述，`npm run art:paint -- --provider openai --only <任务ID> --force` 重出。',
  '- 先看提示词不调用接口：`npm run art:paint -- --provider openai --dry-run`。',
  '',
  '**在 ChatGPT 里手动出**：打开 CSV，按「批次」从小到大，一行一张——把「参考图」那几张图按顺序上传，贴上「提示词」，尺寸选「GPT 尺寸」（竖 1024×1536 / 横 1536×1024 / 方 1024×1024），透明底的那几行要求透明背景；下载后存成「交付文件」那一栏的路径，最后跑 `npm run art:paint:finalize`。',
  '',
  '## 总览',
  '',
  '| 批次 | 分组 | 内容 | 张数 | GPT 尺寸 → 游戏尺寸 |',
  '|---|---|---|---:|---|',
  ...Object.keys(BATCH).filter((g) => counts[g]).sort((a, b) => BATCH[a] - BATCH[b]).map((g) => `| ${BATCH[g]} | \`${g}\` | ${GROUPS[g].title}${ALPHA_GROUPS.has(g) ? '（透明底）' : ''} | ${counts[g]} | ${rows.find((r) => r.group === g).gptSize.replace('x', '×')} → ${SIZE[g].replace('x', '×')} |`),
  `| | | **合计** | **${rows.length}** | |`,
  '',
  '「出现章节」里 `chNNN` 是主线、`exNNN` 是番外、`gNNN` 是外传正篇；没有章节的场景、胸像暂时没有地方用到，可以排到最后。',
];
for (const batch of [1, 2, 3, 4, 5]) {
  md.push('', `## ${BATCH_TITLE[batch]}`);
  for (const g of Object.keys(BATCH).filter((x) => BATCH[x] === batch && counts[x])) {
    const list = rows.filter((r) => r.group === g);
    md.push('', `### ${GROUPS[g].title}（\`${g}\`，${list.length} 张）`, '');
    if (GROUPS[g].note) md.push(GROUPS[g].note, '');
    md.push('| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |', '|---|---|---|---|');
    for (const r of list) md.push(`| \`${r.id}\` | ${cell(r.label || '')} | \`${path.basename(r.deliver)}\` | ${cell(r.usage)} |`);
  }
}
fs.writeFileSync(path.join(root, 'docs/ART-LIST-GPT.md'), md.join('\n') + '\n');
console.log(`wrote docs/ART-LIST-GPT.md and docs/art-list/gpt-art-list.csv (${rows.length} images)`);
