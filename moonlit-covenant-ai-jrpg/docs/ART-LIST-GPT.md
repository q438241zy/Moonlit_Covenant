# 美术清单（交给 GPT 出图）

<!-- 本文件由 tools/art/raster/list.mjs 根据 tools/art/raster/manifest.mjs 生成（npm run art:list），请勿手改。 -->

游戏里现在所有画面都是原创矢量美术（SVG）。这份清单列出要交给 GPT 重新绘制的全部 **618 张**位图：女主立绘、服装、胸像、主线 / 番外 / 外传的场景背景、剧情胸像、道具特写、外传 CG 与卡面。出好的图按下面的规则放进去，游戏会自动用位图替换对应的矢量图，没出的继续显示矢量图，可以分批上线。

- 逐张的完整提示词、参考图与尺寸：[`docs/art-list/gpt-art-list.csv`](art-list/gpt-art-list.csv)（Excel 可直接打开）。用 API 批量出图时脚本直接读 `manifest.mjs`，不读 CSV。
- 提示词的源头是 `tools/art/raster/manifest.mjs`：改描述就改那里，再跑 `npm run art:list` 重新导出本清单。

## 画风（全套统一）

**日本动画画师画的欧洲奇幻**：日式动漫的人物画法——大而有神的眼睛、干净利落的线稿、赛璐璐与厚涂结合的上色、成熟的五官；舞台、服饰与器物是欧洲中世纪奇幻（哥特教堂、石砌城镇、骑士盔甲、长袍、木桥与港口）。光影偏电影感：月光、彩色轮廓光，色调略收、点缀色鲜明。

- **以女主角立绘为基准**：第 1 批先出八位女主立绘（参考 `tools/art/raster/ref/lia.png` 的画风与正典外观描述），**定稿后**，其余每一张都把新出的莉亚立绘当第一张参考图，保证线稿、上色、光影一致；服装与胸像另外附上该女主自己的立绘，保证同一张脸。
- 每条提示词的开头都是同一段画风描述（`manifest.mjs` 的 `STYLE`），结尾附「Avoid:」（GPT 没有单独的负面提示词）。
- 例外：番外十是平行现代（IF），它的办公室、商场背景和 OL 装画现代都市。

## 硬性规定

1. **不出现任何文字**：招牌、纸张、帐本、屏幕上的字一律画成看不清的笔画；不要水印、签名、logo。
2. **女主全部是成年人**（18–19 岁），外观以正典为准（`设定集/03_主角与八位女主角.md`，提示词里已写好）。莉亚一律背着塔盾「赤誓」。外传（银轨号）的称号不写进画面说明。
3. **尺度**：泳装是不透明的正常泳装，脸是画面重点，不做身体局部特写、不摆暗示性姿势（提示词与 Avoid 已写明）；12+ 罩衫版是同一件泳装外加她自己的罩衫。孩子（托比、波莉等）只出现在普通场景，永远不和泳装或任何擦边的画面同框。婚礼礼服是礼服店试穿：不画戒指、不画新郎、不画祭坛，头纱不遮脸。
4. **背景不画人物**（场景背景、舞台背景、道具特写里没有人；人物用胸像另外叠上去）。
5. **透明底**：剧情胸像与服装胸像要透明背景（PNG），只画人物本身，不要地面与背景。
6. **AI 生成标识**：GPT 写在原图里的 AI 生成元数据（C2PA / EXIF）要保留；导入脚本压缩时会把 AIGC 标识写回成品，游戏里换成位图的位置会自动显示「AI 生成」角标。

## 怎么出图与导入

**用 API 批量出（推荐）**：

```bash
OPENAI_API_KEY=… npm run art:paint -- --provider openai --only group:portraits   # 第 1 批：先出立绘，确认画风
OPENAI_API_KEY=… npm run art:paint -- --provider openai                          # 其余全部（按依赖自动分批，可中断续传）
npm run art:paint:finalize                                                        # 裁成游戏尺寸、写回 AIGC 标识、登记到 public/assets/paint/manifest.json
```

- 默认模型 `gpt-image-1`（可用 `OPENAI_IMAGE_MODEL` 换成更新的版本），质量 `high`（`OPENAI_IMAGE_QUALITY` 可调）。有参考图的任务走图片编辑接口，一次附上全部参考图；胸像自动要透明底。
- 某张不满意：改 `manifest.mjs` 里那条描述，`npm run art:paint -- --provider openai --only <任务ID> --force` 重出。
- 先看提示词不调用接口：`npm run art:paint -- --provider openai --dry-run`。

**在 ChatGPT 里手动出**：打开 CSV，按「批次」从小到大，一行一张——把「参考图」那几张图按顺序上传，贴上「提示词」，尺寸选「GPT 尺寸」（竖 1024×1536 / 横 1536×1024 / 方 1024×1024），透明底的那几行要求透明背景；下载后存成「交付文件」那一栏的路径，最后跑 `npm run art:paint:finalize`。

## 总览

| 批次 | 分组 | 内容 | 张数 | GPT 尺寸 → 游戏尺寸 |
|---|---|---|---:|---|
| 1 | `portraits` | 女主立绘 | 8 | 1024×1536 → 832×1216 |
| 2 | `costumes` | 服装立绘 | 80 | 1024×1536 → 832×1216 |
| 2 | `costumes-soft` | 泳装 12+ 罩衫版立绘 | 8 | 1024×1536 → 832×1216 |
| 3 | `story-bg` | 剧情场景背景（主线、番外、外传正篇） | 198 | 1536×1024 → 1600×900 |
| 3 | `story-npc` | 剧情胸像（透明底） | 128 | 1024×1536 → 600×800 |
| 3 | `story-insert` | 道具特写叠图 | 54 | 1536×1024 → 800×600 |
| 4 | `costumes-bust` | 服装透明胸像（透明底） | 80 | 1024×1536 → 600×800 |
| 4 | `costumes-bust-soft` | 泳装 12+ 罩衫版透明胸像（透明底） | 8 | 1024×1536 → 600×800 |
| 5 | `cg` | 剧情 CG | 10 | 1536×1024 → 1600×900 |
| 5 | `boss` | 食梦兽三阶段 | 3 | 1024×1024 → 1000×1000 |
| 5 | `scenes` | 舞台背景 | 3 | 1536×1024 → 1600×900 |
| 5 | `cards` | 卡面 | 38 | 1024×1024 → 512×512 |
| | | **合计** | **618** | |

「出现章节」里 `chNNN` 是主线、`exNNN` 是番外、`gNNN` 是外传正篇；没有章节的场景、胸像暂时没有地方用到，可以排到最后。

## 第 1 批 · 女主立绘（全套画风基准，必须先定稿）

### 女主立绘（`portraits`，8 张）

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `portrait-lia` |  | `lia.png` | 召唤、换衣间、委托板绝技切入；后面所有图的画风参考 |
| `portrait-mia` |  | `mia.png` | 召唤、换衣间、委托板绝技切入；后面所有图的画风参考 |
| `portrait-serena` |  | `serena.png` | 召唤、换衣间、委托板绝技切入；后面所有图的画风参考 |
| `portrait-freya` |  | `freya.png` | 召唤、换衣间、委托板绝技切入；后面所有图的画风参考 |
| `portrait-lilith` |  | `lilith.png` | 召唤、换衣间、委托板绝技切入；后面所有图的画风参考 |
| `portrait-evelyn` |  | `evelyn.png` | 召唤、换衣间、委托板绝技切入；后面所有图的画风参考 |
| `portrait-ophelia` |  | `ophelia.png` | 召唤、换衣间、委托板绝技切入；后面所有图的画风参考 |
| `portrait-aila` |  | `aila.png` | 召唤、换衣间、委托板绝技切入；后面所有图的画风参考 |

## 第 2 批 · 服装立绘与 12+ 罩衫版（以该女主立绘为参考）

### 服装立绘（`costumes`，80 张）

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `costume-lia-swimsuit` |  | `lia_swimsuit.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-wedding` |  | `lia_wedding.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-office` |  | `lia_office.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-maid` |  | `lia_maid.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-sportwear` |  | `lia_sportwear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-newyear` |  | `lia_newyear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-christmas` |  | `lia_christmas.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-duanwu` |  | `lia_duanwu.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-anniversary` |  | `lia_anniversary.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-resort` |  | `lia_resort.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-swimsuit` |  | `mia_swimsuit.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-wedding` |  | `mia_wedding.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-office` |  | `mia_office.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-maid` |  | `mia_maid.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-sportwear` |  | `mia_sportwear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-newyear` |  | `mia_newyear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-christmas` |  | `mia_christmas.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-duanwu` |  | `mia_duanwu.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-anniversary` |  | `mia_anniversary.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-resort` |  | `mia_resort.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-swimsuit` |  | `serena_swimsuit.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-wedding` |  | `serena_wedding.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-office` |  | `serena_office.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-maid` |  | `serena_maid.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-sportwear` |  | `serena_sportwear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-newyear` |  | `serena_newyear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-christmas` |  | `serena_christmas.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-duanwu` |  | `serena_duanwu.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-anniversary` |  | `serena_anniversary.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-resort` |  | `serena_resort.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-swimsuit` |  | `freya_swimsuit.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-wedding` |  | `freya_wedding.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-office` |  | `freya_office.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-maid` |  | `freya_maid.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-sportwear` |  | `freya_sportwear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-newyear` |  | `freya_newyear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-christmas` |  | `freya_christmas.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-duanwu` |  | `freya_duanwu.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-anniversary` |  | `freya_anniversary.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-resort` |  | `freya_resort.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-swimsuit` |  | `lilith_swimsuit.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-wedding` |  | `lilith_wedding.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-office` |  | `lilith_office.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-maid` |  | `lilith_maid.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-sportwear` |  | `lilith_sportwear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-newyear` |  | `lilith_newyear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-christmas` |  | `lilith_christmas.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-duanwu` |  | `lilith_duanwu.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-anniversary` |  | `lilith_anniversary.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-resort` |  | `lilith_resort.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-swimsuit` |  | `evelyn_swimsuit.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-wedding` |  | `evelyn_wedding.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-office` |  | `evelyn_office.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-maid` |  | `evelyn_maid.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-sportwear` |  | `evelyn_sportwear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-newyear` |  | `evelyn_newyear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-christmas` |  | `evelyn_christmas.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-duanwu` |  | `evelyn_duanwu.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-anniversary` |  | `evelyn_anniversary.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-resort` |  | `evelyn_resort.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-swimsuit` |  | `ophelia_swimsuit.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-wedding` |  | `ophelia_wedding.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-office` |  | `ophelia_office.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-maid` |  | `ophelia_maid.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-sportwear` |  | `ophelia_sportwear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-newyear` |  | `ophelia_newyear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-christmas` |  | `ophelia_christmas.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-duanwu` |  | `ophelia_duanwu.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-anniversary` |  | `ophelia_anniversary.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-resort` |  | `ophelia_resort.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-swimsuit` |  | `aila_swimsuit.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-wedding` |  | `aila_wedding.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-office` |  | `aila_office.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-maid` |  | `aila_maid.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-sportwear` |  | `aila_sportwear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-newyear` |  | `aila_newyear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-christmas` |  | `aila_christmas.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-duanwu` |  | `aila_duanwu.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-anniversary` |  | `aila_anniversary.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-resort` |  | `aila_resort.png` | 召唤结果、换衣间、服饰池卡面 |

### 泳装 12+ 罩衫版立绘（`costumes-soft`，8 张）

同一件泳装外面加她自己的罩衫；内容模式 12+ 时显示。

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `costume-soft-lia` |  | `lia_swimsuit.png` | 内容模式 12+ 时替换泳装立绘 |
| `costume-soft-mia` |  | `mia_swimsuit.png` | 内容模式 12+ 时替换泳装立绘 |
| `costume-soft-serena` |  | `serena_swimsuit.png` | 内容模式 12+ 时替换泳装立绘 |
| `costume-soft-freya` |  | `freya_swimsuit.png` | 内容模式 12+ 时替换泳装立绘 |
| `costume-soft-lilith` |  | `lilith_swimsuit.png` | 内容模式 12+ 时替换泳装立绘 |
| `costume-soft-evelyn` |  | `evelyn_swimsuit.png` | 内容模式 12+ 时替换泳装立绘 |
| `costume-soft-ophelia` |  | `ophelia_swimsuit.png` | 内容模式 12+ 时替换泳装立绘 |
| `costume-soft-aila` |  | `aila_swimsuit.png` | 内容模式 12+ 时替换泳装立绘 |

## 第 3 批 · 剧情：场景背景、胸像、道具叠图（以莉亚立绘为画风参考）

### 剧情场景背景（主线、番外、外传正篇）（`story-bg`，198 张）

清单来自 public/story/locations.json；外传正篇复用的序章场景图在 scenes / cg 组。

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `story-bg-hemai-day` | 赫麦村·午后 | `hemai-day.png` | ch000 |
| `story-bg-pasture` | 牧场羊圈 | `pasture.png` | ch000 |
| `story-bg-village-road` | 赫麦村村道·傍晚 | `village-road.png` | ch000 |
| `story-bg-kitchen-night` | 亚克家厨房·油灯 | `kitchen-night.png` | ch000 |
| `story-bg-dragon-sky` | 黑翼遮月 | `dragon-sky.png` | ch000 |
| `story-bg-village-burning` | 黑焰中的赫麦村 | `village-burning.png` | ch000 |
| `story-bg-north-trail-night` | 北山旧牧道·夜 | `north-trail-night.png` | ch000 ch001 |
| `story-bg-shepherd-cave-night` | 守羊洞·俯瞰故乡 | `shepherd-cave-night.png` | ch000 |
| `story-bg-south-ridge` | 南侧山脊 | `south-ridge.png` | ch000 |
| `story-bg-cave-dawn` | 守羊洞·黎明前 | `cave-dawn.png` | ch000 ch001 |
| `story-bg-hemai-sky-dawn` | 赫麦村上空·破晓 | `hemai-sky-dawn.png` | ch001 |
| `story-bg-hemai-ruins-dawn` | 赫麦村废墟·黎明 | `hemai-ruins-dawn.png` | ch001 |
| `story-bg-north-slope-camp` | 北山缓坡·灾民营地 | `north-slope-camp.png` | ch001 ch022 |
| `story-bg-chime-town-gate` | 晨钟镇东门·清晨 | `chime-town-gate.png` | ch002 ch006 |
| `story-bg-guild-hall` | 晨钟镇冒险者公会 | `guild-hall.png` | ch002 ch003 ch004 ch005 |
| `story-bg-market` | 晨钟镇中央市集 | `market.png` | ch002 ch003 |
| `story-bg-dye-alley` | 染布巷 | `dye-alley.png` | ch002 |
| `story-bg-barrel-alley` | 旧酒桶巷 | `barrel-alley.png` | ch002 |
| `story-bg-guard-square` | 治安所前·公会广场 | `guard-square.png` | ch002 ch003 ch004 |
| `story-bg-mill-road-milestone` | 旧磨坊路·第二座里程石 | `mill-road-milestone.png` | ch003 ch004 ch005 |
| `story-bg-mill-road-dusk` | 旧磨坊路·黄昏 | `mill-road-dusk.png` | ch003 |
| `story-bg-training-ground-dawn` | 晨钟镇训练场·日出 | `training-ground-dawn.png` | ch004 ch006 |
| `story-bg-old-mill-dusk` | 旧磨坊·黄昏芦苇 | `old-mill-dusk.png` | ch004 ch005 |
| `story-bg-old-mill-floor` | 旧磨坊·磨盘间 | `old-mill-floor.png` | ch004 ch005 |
| `story-bg-old-mill-floor-cart` | 旧磨坊·磨盘间·大车之夜 | `old-mill-floor-cart.png` | ch005 |
| `story-bg-west-gate-day` | 晨钟镇西门·上午 | `west-gate-day.png` | ch003 ch004 |
| `story-bg-west-gate-dusk` | 晨钟镇西门·黄昏 | `west-gate-dusk.png` | ch005 |
| `story-bg-west-gate-night` | 晨钟镇西门·入夜 | `west-gate-night.png` | ch004 ch005 |
| `story-bg-mill-road-night` | 旧磨坊路·夜 | `mill-road-night.png` | ch004 ch005 |
| `story-bg-salt-marsh-bridge` | 盐沼桥·午后涨潮 | `salt-marsh-bridge.png` | ch006 |
| `story-bg-forest-edge-inn` | 林边旅店·黄昏 | `forest-edge-inn.png` | ch006 ch007 ch008 |
| `story-bg-forest-edge-channel-night` | 林边水道泥滩·夜 | `forest-edge-channel-night.png` | ch007 ch008 |
| `story-bg-tide-station-dawn` | 量潮老站·站顶·天亮 | `tide-station-dawn.png` | ch008 |
| `story-bg-tide-station-predawn` | 量潮老站·站顶·天亮前 | `tide-station-predawn.png` | ch008 |
| `story-bg-tide-station-room` | 量潮老站·潮室·拂晓 | `tide-station-room.png` | ch008 |
| `story-bg-fog-harbor-bridge-noon` | 雾港·第一座木桥·近午退潮 | `fog-harbor-bridge-noon.png` | ch009 ch023 |
| `story-bg-fog-harbor-guild` | 冒险者公会雾港分会 | `fog-harbor-guild.png` | ch009 ch010 ch012 ch023 |
| `story-bg-fog-harbor-drain-dusk` | 旧浴场后沟与排水区东口·黄昏 | `fog-harbor-drain-dusk.png` | ch009 ch012 ch014 |
| `story-bg-fog-harbor-drain-night` | 旧浴场后沟与排水区东口·入夜 | `fog-harbor-drain-night.png` | ch009 ch014 |
| `story-bg-fog-harbor-sewer-pump` | 雾港·东口以下·砖拱水道与三号泵房 | `fog-harbor-sewer-pump.png` | ch010 |
| `story-bg-fog-harbor-tide-cavity` | 雾港·潮腔·旧蓄水池 | `fog-harbor-tide-cavity.png` | ch010 |
| `story-bg-fog-harbor-tide-cavity-ebb` | 雾港·潮腔·排水后 | `fog-harbor-tide-cavity-ebb.png` | ch010 ch014 |
| `story-bg-fog-harbor-drain-dawn` | 旧浴场后沟与排水区东口·破晓 | `fog-harbor-drain-dawn.png` | ch010 ch015 |
| `story-bg-fog-harbor-bridge-dusk` | 雾港·第一座木桥·黄昏 | `fog-harbor-bridge-dusk.png` | ch010 |
| `story-bg-fog-harbor-bridge-inn-night` | 雾港·桥头旅店·入夜 | `fog-harbor-bridge-inn-night.png` | ch010 ch011 |
| `story-bg-fog-harbor-bridge-inn-eyes` | 雾港·桥头旅店·镜中紫眼 | `fog-harbor-bridge-inn-eyes.png` | ch010 ch011 |
| `story-bg-fog-harbor-bridge-inn-room` | 雾港·桥头旅店·亚克的房间 | `fog-harbor-bridge-inn-room.png` | ch011 |
| `story-bg-fog-harbor-bridge-inn-mirror` | 雾港·桥头旅店·镜子的那一边 | `fog-harbor-bridge-inn-mirror.png` | ch011 |
| `story-bg-fog-harbor-bridge-inn-covered` | 雾港·桥头旅店·镜子蒙上毛巾 | `fog-harbor-bridge-inn-covered.png` | ch011 ch012 |
| `story-bg-fog-harbor-old-lighthouse` | 雾港·旧灯塔 | `fog-harbor-old-lighthouse.png` | ch012 |
| `story-bg-fog-harbor-old-lighthouse-rain` | 雾港·旧灯塔·雨夜灯室 | `fog-harbor-old-lighthouse-rain.png` | ch012 |
| `story-bg-fog-harbor-old-lighthouse-night` | 雾港·旧灯塔·塔底夜雨 | `fog-harbor-old-lighthouse-night.png` | ch013 |
| `story-bg-fog-harbor-old-lighthouse-night-broken` | 雾港·旧灯塔·塔底夜雨·破窗 | `fog-harbor-old-lighthouse-night-broken.png` | ch013 |
| `story-bg-fog-harbor-old-lighthouse-dawn` | 雾港·旧灯塔·清晨 | `fog-harbor-old-lighthouse-dawn.png` | ch013 |
| `story-bg-fog-harbor-mirror-alley` | 雾港·镜巷 | `fog-harbor-mirror-alley.png` | ch012 |
| `story-bg-fog-harbor-fish-market-roofs-rain` | 雾港·鱼市屋顶·雨夜 | `fog-harbor-fish-market-roofs-rain.png` | ch013 |
| `story-bg-fog-harbor-tide-cave-sluice` | 雾港·老涵洞尽头·潮穴老闸 | `fog-harbor-tide-cave-sluice.png` | ch014 |
| `story-bg-fog-harbor-tide-cave-sluice-shut` | 雾港·潮穴老闸·闸落 | `fog-harbor-tide-cave-sluice-shut.png` | ch014 |
| `story-bg-fog-harbor-tide-cave` | 雾港·潮穴·茧壁 | `fog-harbor-tide-cave.png` | ch014 |
| `story-bg-fog-harbor-tide-cave-flood` | 雾港·潮穴·涨水 | `fog-harbor-tide-cave-flood.png` | ch014 |
| `story-bg-fog-harbor-tide-nest` | 雾港·石门后·沉船残巢 | `fog-harbor-tide-nest.png` | ch015 |
| `story-bg-fog-harbor-tide-nest-ruin` | 雾港·沉船残巢·战后 | `fog-harbor-tide-nest-ruin.png` | ch015 |
| `story-bg-fog-harbor-tide-nest-burned` | 雾港·沉船残巢·烧巢 | `fog-harbor-tide-nest-burned.png` | ch015 |
| `story-bg-fog-harbor-guild-dock` | 雾港·分会门前的码头·午后 | `fog-harbor-guild-dock.png` | ch015 ch023 ex007 |
| `story-bg-fog-harbor-guild-shed` | 雾港·分会的仓内 | `fog-harbor-guild-shed.png` | ch015 |
| `story-bg-white-tower-morning-gate` | 白塔圣都·晨门·上午 | `white-tower-morning-gate.png` | ch016 |
| `story-bg-white-tower-morning-gate-dusk` | 白塔圣都·晨门·黄昏 | `white-tower-morning-gate-dusk.png` | ch016 |
| `story-bg-white-tower-registry-hall` | 白塔·册厅 | `white-tower-registry-hall.png` | ch016 ch029 |
| `story-bg-white-tower-registry-hall-court` | 白塔·册厅·御前列席 | `white-tower-registry-hall-court.png` | ch016 |
| `story-bg-white-tower-registry-hall-night` | 白塔·册厅·入夜 | `white-tower-registry-hall-night.png` | ch016 ch020 |
| `story-bg-holy-city-pilgrim-hostel-night` | 白塔圣都·朝圣者旅舍·夜 | `holy-city-pilgrim-hostel-night.png` | ch017 |
| `story-bg-saint-residence-smoke-night` | 圣女居所·夜·烟 | `saint-residence-smoke-night.png` | ch017 |
| `story-bg-starsong-garden-predawn` | 星歌花园·天未亮 | `starsong-garden-predawn.png` | ch017 |
| `story-bg-starsong-garden-dawn` | 星歌花园·黎明 | `starsong-garden-dawn.png` | ch017 |
| `story-bg-white-tower-outer-court-frost` | 白塔·外庭·霜 | `white-tower-outer-court-frost.png` | ch017 ch018 |
| `story-bg-holy-city-pilgrim-hostel-day` | 白塔圣都·朝圣者旅舍·白天 | `holy-city-pilgrim-hostel-day.png` | ch018 |
| `story-bg-white-tower-outer-court-thawed` | 白塔·外庭·正午 | `white-tower-outer-court-thawed.png` | ch018 |
| `story-bg-white-tower-seven-angle-hall` | 白塔·七角殿 | `white-tower-seven-angle-hall.png` | ch019 ch029 |
| `story-bg-white-tower-outer-court-dusk` | 白塔·外庭·黄昏 | `white-tower-outer-court-dusk.png` | ch019 ch020 ex005 |
| `story-bg-white-tower-outer-court-night` | 白塔·外庭·夜 | `white-tower-outer-court-night.png` | ch019 ch020 |
| `story-bg-white-tower-underground-archive` | 册厅底下·地下档案库 | `white-tower-underground-archive.png` | ch020 |
| `story-bg-white-tower-outer-court-day` | 白塔·外庭·白天 | `white-tower-outer-court-day.png` | ch021 ex004 |
| `story-bg-arch-tide-gate-sanctuary` | 拱潮门下·护界院 | `arch-tide-gate-sanctuary.png` | ch021 |
| `story-bg-arch-tide-gate-channel` | 拱潮门·水道 | `arch-tide-gate-channel.png` | ch021 |
| `story-bg-canal-bank-dawn` | 城外运河的堤岸·黎明 | `canal-bank-dawn.png` | ch021 |
| `story-bg-north-slope-camp-night` | 北山缓坡·营地·夜 | `north-slope-camp-night.png` | ch022 |
| `story-bg-north-hill-cave` | 守羊洞里·北山营地 | `north-hill-cave.png` | ch022 |
| `story-bg-verdant-waterway-night` | 往绿镜城的水路·夜 | `verdant-waterway-night.png` | ch023 |
| `story-bg-verdant-mirror-vine-gate` | 绿镜城水门·镜藤 | `verdant-mirror-vine-gate.png` | ch023 |
| `story-bg-verdant-council-hall` | 绿镜城议会厅 | `verdant-council-hall.png` | ch023 |
| `story-bg-fog-marsh-edge` | 沼林边·石台 | `fog-marsh-edge.png` | ch023 |
| `story-bg-verdant-camp-night` | 绿镜城外的营地·夜 | `verdant-camp-night.png` | ch023 |
| `story-bg-ash-pass-far` | 灰烬关·远景 | `ash-pass-far.png` | ch024 |
| `story-bg-ash-pass-camp-night` | 灰烬关下·营地·夜 | `ash-pass-camp-night.png` | ch024 |
| `story-bg-ash-pass-camp-day` | 灰烬关下·营地·白天 | `ash-pass-camp-day.png` | ch024 |
| `story-bg-ash-pass-gate-dawn` | 灰烬关·旧营关门前·黎明 | `ash-pass-gate-dawn.png` | ch024 |
| `story-bg-ash-pass-throat` | 灰烬关·山口里 | `ash-pass-throat.png` | ch024 |
| `story-bg-frostbell-far` | 霜铃城·远景 | `frostbell-far.png` | ch025 |
| `story-bg-frostbell-gate` | 霜铃城·城门 | `frostbell-gate.png` | ch025 |
| `story-bg-frostbell-camp-night` | 霜铃城外·营地·夜 | `frostbell-camp-night.png` | ch025 |
| `story-bg-ice-archive` | 冰库 | `ice-archive.png` | ch025 |
| `story-bg-ice-archive-deep` | 冰库·最深处 | `ice-archive-deep.png` | ch025 |
| `story-bg-furnace-city-far` | 衡炉城·远景 | `furnace-city-far.png` | ch026 |
| `story-bg-furnace-council` | 衡炉城·议会 | `furnace-council.png` | ch026 |
| `story-bg-furnace-camp-night` | 衡炉城外·营地·夜 | `furnace-camp-night.png` | ch026 |
| `story-bg-furnace-zero` | 零号衡炉 | `furnace-zero.png` | ch026 |
| `story-bg-furnace-secret-workshop` | 零号衡炉底下·秘密工坊 | `furnace-secret-workshop.png` | ch026 |
| `story-bg-furnace-debt-vault` | 衡炉城·债库前 | `furnace-debt-vault.png` | ch026 |
| `story-bg-furnace-workshop-night` | 衡炉城·米娅的临时工坊·夜 | `furnace-workshop-night.png` | ch026 |
| `story-bg-furnace-street-night` | 衡炉城·工人区的街口·夜 | `furnace-street-night.png` | ch026 |
| `story-bg-furnace-rail-night` | 魔轨的车头·夜 | `furnace-rail-night.png` | ch026 |
| `story-bg-dragonsleep-harbor-far` | 龙眠港·远景 | `dragonsleep-harbor-far.png` | ch027 |
| `story-bg-dragonsleep-council` | 龙眠港·记忆议会 | `dragonsleep-council.png` | ch027 |
| `story-bg-dragonsleep-camp-night` | 龙眠港·港口的营地·夜 | `dragonsleep-camp-night.png` | ch027 |
| `story-bg-dragonsleep-sea-sky` | 龙眠港的外海与天空 | `dragonsleep-sea-sky.png` | ch027 |
| `story-bg-dragonsleep-reef` | 龙眠港外海的礁石 | `dragonsleep-reef.png` | ch027 |
| `story-bg-dragonsleep-graves` | 龙眠港·海边的墓地 | `dragonsleep-graves.png` | ch027 |
| `story-bg-dragonsleep-memory-hall` | 龙眠港·记忆馆前 | `dragonsleep-memory-hall.png` | ch027 |
| `story-bg-ravenfeather-city-far` | 鸦羽城·远景 | `ravenfeather-city-far.png` | ch028 |
| `story-bg-ravenfeather-gate` | 鸦羽城·城门 | `ravenfeather-gate.png` | ch028 |
| `story-bg-ravenfeather-camp-night` | 鸦羽城外·营地·夜 | `ravenfeather-camp-night.png` | ch028 |
| `story-bg-sleepless-mirror-palace` | 无眠镜宫 | `sleepless-mirror-palace.png` | ch028 |
| `story-bg-heras-nest` | 镜网深处·赫拉斯的巢 | `heras-nest.png` | ch028 |
| `story-bg-ravenfeather-council-hall` | 鸦羽城·七议席的议厅 | `ravenfeather-council-hall.png` | ch028 |
| `story-bg-sleepless-mirror-last` | 无眠镜宫·最深处 | `sleepless-mirror-last.png` | ch028 |
| `story-bg-ravenfeather-belltower-night` | 鸦羽城·钟楼下·夜 | `ravenfeather-belltower-night.png` | ch028 |
| `story-bg-road-to-white-tower-dawn` | 往白塔的大道·黎明 | `road-to-white-tower-dawn.png` | ch028 |
| `story-bg-white-tower-city-siege-far` | 白塔城·远景 | `white-tower-city-siege-far.png` | ch029 |
| `story-bg-white-tower-walls-predawn` | 白塔城外·天亮前 | `white-tower-walls-predawn.png` | ch029 |
| `story-bg-white-tower-walls-dawn` | 白塔城外城墙下·黎明 | `white-tower-walls-dawn.png` | ch029 |
| `story-bg-white-tower-camp-predawn` | 白塔城外·营地·天亮前 | `white-tower-camp-predawn.png` | ch029 |
| `story-bg-white-tower-camp-night` | 白塔城外·营地·夜 | `white-tower-camp-night.png` | ch029 |
| `story-bg-white-tower-belltower` | 白塔城·钟楼 | `white-tower-belltower.png` | ch029 |
| `story-bg-morning-gate` | 晨门·门洞 | `morning-gate.png` | ch029 |
| `story-bg-coronation-hall-exterior` | 冠礼院大殿外 | `coronation-hall-exterior.png` | ch029 |
| `story-bg-coronation-hall-ruin` | 冠礼院·废墟 | `coronation-hall-ruin.png` | ch029 |
| `story-bg-coronation-hall-feast` | 冠礼院大殿·宴 | `coronation-hall-feast.png` | ch029 |
| `story-bg-white-stair-dusk` | 白石阶·黄昏 | `white-stair-dusk.png` | ch029 |
| `story-bg-register-hall-night` | 册厅·夜 | `register-hall-night.png` | ch029 |
| `story-bg-dawn-stair-scaffold` | 晨阶刑台 | `dawn-stair-scaffold.png` | ch029 |
| `story-bg-dawn-stair-scaffold-empty` | 晨阶刑台·空场 | `dawn-stair-scaffold-empty.png` | ch029 |
| `story-bg-hemai-ruin-camp-night` | 赫麦·祷堂废墟外的营地·夜 | `hemai-ruin-camp-night.png` | ch029 |
| `story-bg-hemai-prayer-ruin-eclipse` | 赫麦·祷堂废墟·蚀 | `hemai-prayer-ruin-eclipse.png` | ch030 |
| `story-bg-moonring-sanctum` | 月环圣所·全蚀 | `moonring-sanctum.png` | ch030 |
| `story-bg-moonring-sanctum-dawn` | 月环圣所·晨光 | `moonring-sanctum-dawn.png` | ch030 |
| `story-bg-moonring-inner-stair` | 月环圣所·内阶 | `moonring-inner-stair.png` | ch030 |
| `story-bg-moonring-roof-open` | 掀开的环顶 | `moonring-roof-open.png` | ch030 |
| `story-bg-moonring-new-city` | 月环新城 | `moonring-new-city.png` | ch030 |
| `story-bg-hemai-rebuilt-dawn` | 赫麦·重建·黎明 | `hemai-rebuilt-dawn.png` | ch030 |
| `story-bg-hemai-half-built` | 赫麦·重建到一半 | `hemai-half-built.png` | ch030 |
| `story-bg-white-tower-iron` | 白塔·铁冕 | `white-tower-iron.png` | ch030 |
| `story-bg-white-tower-throne` | 白塔·王座 | `white-tower-throne.png` | ch030 |
| `story-bg-gilded-cage` | 冠礼院上层的金笼 | `gilded-cage.png` | ch030 |
| `story-bg-seven-sins-feast` | 月环圣所·七罪宴 | `seven-sins-feast.png` | ch030 |
| `story-bg-silent-empire` | 无声帝国 | `silent-empire.png` | ch030 |
| `story-bg-fog-harbor-tide-cave-empty` | 雾港·潮穴·退潮 | `fog-harbor-tide-cave-empty.png` | ch015 |
| `story-bg-arch-tide-gate-sanctuary-cells` | 天牢·拱潮门下的护界院 | `arch-tide-gate-sanctuary-cells.png` | ch029 ch030 |
| `story-bg-arch-tide-waterway-mouth` | 拱潮门·水道口 | `arch-tide-waterway-mouth.png` | ch029 |
| `story-bg-fog-harbor-bridge-inn-hall` | 雾港·桥头旅店·一楼食堂 | `fog-harbor-bridge-inn-hall.png` | ex001 |
| `story-bg-fog-harbor-bridge-inn-hall-night` | 雾港·桥头旅店·一楼食堂·打烊 | `fog-harbor-bridge-inn-hall-night.png` | ex001 |
| `story-bg-fog-harbor-sandbar` | 雾港外海·沙洲·退潮 | `fog-harbor-sandbar.png` | ex002 |
| `story-bg-fog-harbor-sandbar-dusk` | 雾港外海·沙洲·黄昏涨潮 | `fog-harbor-sandbar-dusk.png` | ex002 |
| `story-bg-white-tower-arcade-street` | 白塔圣都·朝圣者拱廊街 | `white-tower-arcade-street.png` | ex003 |
| `story-bg-white-tower-arcade-dress-shop` | 白塔·拱廊街·铸金商会礼服店 | `white-tower-arcade-dress-shop.png` | ex003 |
| `story-bg-holy-city-knights-drill-ground` | 白塔圣都·骑士团演武场·白天 | `holy-city-knights-drill-ground.png` | ex004 |
| `story-bg-holy-city-knights-drill-ground-dusk` | 白塔圣都·骑士团演武场·黄昏 | `holy-city-knights-drill-ground-dusk.png` | ex004 |
| `story-bg-white-tower-outer-court-winter-lights` | 白塔·外庭·冬灯夜 | `white-tower-outer-court-winter-lights.png` | ex005 |
| `story-bg-white-tower-outer-court-bathhouse` | 白塔·外庭浴场·蒸汽 | `white-tower-outer-court-bathhouse.png` | ex005 |
| `story-bg-north-slope-camp-festival` | 北山缓坡·营地·新历祭 | `north-slope-camp-festival.png` | ex006 |
| `story-bg-north-slope-camp-festival-night` | 北山缓坡·营地·新历祭之夜 | `north-slope-camp-festival-night.png` | ex006 |
| `story-bg-fog-harbor-market-day` | 雾港·市集·白天 | `fog-harbor-market-day.png` | ex007 |
| `story-bg-fog-harbor-shadow-market` | 雾港·影市 | `fog-harbor-shadow-market.png` | ex007 |
| `story-bg-north-slope-camp-anniversary-dusk` | 北山缓坡·营地·黄昏的长桌 | `north-slope-camp-anniversary-dusk.png` | ex008 |
| `story-bg-north-slope-camp-anniversary-night` | 北山缓坡·营地·灯下的长桌 | `north-slope-camp-anniversary-night.png` | ex008 |
| `story-bg-verdant-south-beach` | 翠影南岸·海滩 | `verdant-south-beach.png` | ex009 |
| `story-bg-verdant-river-mouth-dragonboat` | 翠影南岸·河口·龙舟祭 | `verdant-river-mouth-dragonboat.png` | ex009 |
| `story-bg-if-modern-office` | IF·平行现代·办公室 | `if-modern-office.png` | ex010 |
| `story-bg-if-modern-mall` | IF·平行现代·商场 | `if-modern-mall.png` | ex010 |
| `story-bg-silver-rail-observation-car` | 银轨号·观景车厢·夜 | `silver-rail-observation-car.png` | g001 g015 |
| `story-bg-silver-rail-observation-car-day` | 银轨号·观景车厢·白天 | `silver-rail-observation-car-day.png` | g014 g015 |
| `story-bg-silver-rail-dark-car` | 银轨号·熄灯的车厢 | `silver-rail-dark-car.png` | g001 |
| `story-bg-north-snowfield-memory` | 回忆·北境雪原 | `north-snowfield-memory.png` | g002 |
| `story-bg-silver-rail-corridor` | 银轨号·列车走廊·夜 | `silver-rail-corridor.png` | g002 g003 |
| `story-bg-silver-rail-luggage-workshop` | 银轨号·行李车厢·米娅的工作室 | `silver-rail-luggage-workshop.png` | g003 |
| `story-bg-silver-rail-roof-night` | 银轨号·车顶·月夜 | `silver-rail-roof-night.png` | g004 |
| `story-bg-silver-rail-camp` | 银轨号旁的临时营地·篝火夜 | `silver-rail-camp.png` | g005 |
| `story-bg-frost-corridor-entrance` | 霜冻回廊·入口 | `frost-corridor-entrance.png` | g006 |
| `story-bg-memory-labyrinth-hall` | 记忆迷宫·入口大厅 | `memory-labyrinth-hall.png` | g007 |
| `story-bg-memory-labyrinth-ruin` | 记忆迷宫·废墟 | `memory-labyrinth-ruin.png` | g007 g008 |
| `story-bg-rift-depths` | 裂隙深处·数据残骸 | `rift-depths.png` | g008 |
| `story-bg-nox-observatory-lab` | 诺克斯观测所·地下实验室 | `nox-observatory-lab.png` | g009 g014 |
| `story-bg-nox-observatory-core` | 诺克斯观测所·核心室 | `nox-observatory-core.png` | g010 g013 |
| `story-bg-nox-observatory-core-eclipse` | 诺克斯观测所·核心室·月蚀 | `nox-observatory-core-eclipse.png` | g012 |
| `story-bg-nox-observatory-restroom` | 诺克斯观测所·休整室 | `nox-observatory-restroom.png` | g011 |
| `story-bg-nox-observatory-eclipse-void` | 月蚀完成·虚空 | `nox-observatory-eclipse-void.png` | g012 |
| `story-bg-memory-space` | 记忆空间·共鸣 | `memory-space.png` | g013 |
| `story-bg-nox-observatory-dawn` | 诺克斯观测所·黎明 | `nox-observatory-dawn.png` | g014 |
| `story-bg-silver-rail-window-dusk` | 银轨号·车窗旁·黄昏 | `silver-rail-window-dusk.png` | g015 |

### 剧情胸像（`story-npc`，128 张）

清单来自 public/story/speakers.json（同一文件只列一次）。透明底 PNG。

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `story-npc-aku` | 亚克 | `aku.png` | ch000 ch001 ch002 ch003 ch004 ch005 ch006 ch012 ch015 ch016 ch017 ch029 ch030 ex001 ex003 ex005 ex006 ex007 ex009 g001 g006 |
| `story-npc-erin` | 艾琳 | `erin.png` | ch000 |
| `story-npc-toby` | 托比 | `toby.png` | ch000 ch001 ch022 ex006 |
| `story-npc-mara` | 玛拉 | `mara.png` | ch000 ch004 ch005 ch022 ch030 ex006 ex008 |
| `story-npc-borin` | 伯伦 | `borin.png` | ch000 ch003 |
| `story-npc-horn` | 霍恩 | `horn.png` | ch000 ch001 ch022 ch030 ex006 |
| `story-npc-kern` | 白·可恩 | `kern.png` | ch001 ch022 ch023 ch024 ch025 ch026 ch027 ch028 ch029 ch030 ex006 |
| `story-npc-maeve` | 梅芙 | `maeve.png` | ch002 ch003 ch004 ch005 |
| `story-npc-lia` | 莉亚 | `lia.png` | ch002 ch003 ch004 ch005 ch006 ch007 ch008 ch009 ch010 ch011 ch012 ch013 ch014 ch015 ch016 ch017 ch018 ch019 ch020 ch021 ch022 ch023 ch024 ch025 ch026 ch027 ch028 ch029 ch030 ex001 ex002 ex003 ex006 ex008 ex009 ex010 g001 g002 g003 g004 g005 g006 g007 g008 g009 g010 g011 g012 g013 g014 g015 |
| `story-npc-rocky` | 罗奇 | `rocky.png` | ch002 ch003 |
| `story-npc-blackrobe` | 黑袍人 | `blackrobe.png` | ch000 |
| `story-npc-dragon` | 黑龙 | `dragon.png` | （暂无章节使用） |
| `story-npc-finn` | 芬恩 | `finn.png` | ch003 ch004 |
| `story-npc-goblin` | 哥布林 | `goblin.png` | ch003 |
| `story-npc-polly` | 波莉 | `polly.png` | ch004 ch005 ex006 |
| `story-npc-acolyte` | 念祷文的人 | `acolyte.png` | ch004 ch005 ch014 |
| `story-npc-goblin_chief` | 哥布林咒徒长 | `goblin_chief.png` | ch005 |
| `story-npc-marsh_ogre` | 沼地食人魔 | `marsh_ogre.png` | ch006 |
| `story-npc-caravan_leader` | 领队 | `caravan_leader.png` | ch006 ch007 ch008 |
| `story-npc-mia` | 米娅 | `mia.png` | ch007 ch008 ch009 ch010 ch011 ch012 ch013 ch014 ch015 ch016 ch017 ch018 ch019 ch020 ch021 ch022 ch023 ch024 ch025 ch026 ch027 ch028 ch029 ch030 ex001 ex002 ex003 ex004 ex006 ex008 ex009 ex010 g001 g002 g003 g004 g005 g006 g007 g008 g009 g010 g011 g012 g013 g014 g015 |
| `story-npc-scrap_picker` | 拾铁机 | `scrap_picker.png` | ch007 |
| `story-npc-ines` | 伊涅丝 | `ines.png` | ch009 ch010 ch012 ch013 ch014 ch015 ch023 ch027 ex007 |
| `story-npc-tide_cavity_mother` | 潮腔母虫 | `tide_cavity_mother.png` | ch010 |
| `story-npc-serena` | 塞雷娜 | `serena.png` | ch011 ch012 ch028 ch029 ch030 ex002 ex003 ex006 ex007 ex008 ex009 ex010 g001 g002 g003 g004 g005 g006 g007 g008 g009 g010 g011 g012 g013 g014 g015 |
| `story-npc-scar_echo` | 蚀痕残响 | `scar_echo.png` | ch011 |
| `story-npc-scar_echo_15` | 蚀痕残响 | `scar_echo_15.png` | ch011 |
| `story-npc-mirror_apprentice` | 镜咒学徒 | `mirror_apprentice.png` | ch012 |
| `story-npc-mirror_apprentice_blanket` | 镜咒学徒 | `mirror_apprentice_blanket.png` | ch012 ch013 |
| `story-npc-lia_mirror` | 莉亚 | `lia_mirror.png` | ch012 ch015 |
| `story-npc-serena_staff_wrapped` | 塞雷娜 | `serena_staff_wrapped.png` | ch012 ch013 ch014 ch015 ch016 ch017 ch018 ch019 ch020 ch021 ch022 ch023 ch024 ch025 ch026 ch027 ch028 ch029 |
| `story-npc-golden_assassin` | 金发刺客 | `golden_assassin.png` | ch013 ch015 ch020 |
| `story-npc-plains_woman` | 晨祷平原来的女人 | `plains_woman.png` | ch014 |
| `story-npc-oda` | 欧妲 | `oda.png` | ch014 ch015 |
| `story-npc-tide_king` | 潮虫王 | `tide_king.png` | ch015 |
| `story-npc-tide_king_split` | 潮虫王 | `tide_king_split.png` | （暂无章节使用） |
| `story-npc-serena_copy` | 塞雷娜 | `serena_copy.png` | ch015 |
| `story-npc-relief_officer` | 赈灾司的官 | `relief_officer.png` | ch015 |
| `story-npc-evelyn` | 伊芙琳 | `evelyn.png` | ch017 ch018 ch019 ch020 ch021 ch022 ch023 ch024 ch025 ch027 ch028 ch029 ch030 ex003 ex004 ex005 ex006 ex009 ex010 |
| `story-npc-emperor` | 皇帝 | `emperor.png` | ch016 ch019 ch021 ch029 |
| `story-npc-rowena` | 洛温娜 | `rowena.png` | ch016 ch019 ch029 |
| `story-npc-celestine` | 塞莱斯汀 | `celestine.png` | ch016 ch019 ch021 ch029 ch030 |
| `story-npc-severin` | 塞弗林 | `severin.png` | ch016 ch019 ch021 ch029 ch030 |
| `story-npc-ceremony_officer` | 白面的礼仪官 | `ceremony_officer.png` | ch016 ch017 ch021 |
| `story-npc-archivist` | 典册官 | `archivist.png` | ch016 ch019 ch020 |
| `story-npc-aila` | 艾拉 | `aila.png` | ch017 ch018 ch019 ch020 ch021 ch023 ch027 ch029 ch030 ex004 ex006 ex009 ex010 |
| `story-npc-freya` | 芙蕾娅 | `freya.png` | ch018 ch019 ch020 ch021 ch023 ch024 ch025 ch027 ch028 ch029 ch030 ex004 ex005 ex006 ex009 ex010 |
| `story-npc-nila` | 妮拉 | `nila.png` | （暂无章节使用） |
| `story-npc-envoy_chief` | 使团长 | `envoy_chief.png` | ch018 ex005 |
| `story-npc-ophelia` | 奥菲莉亚 | `ophelia.png` | ch019 ch020 ch021 ch023 ch024 ch026 ch027 ch028 ch029 ch030 ex005 ex006 ex007 ex009 ex010 |
| `story-npc-raymond` | 雷蒙德 | `raymond.png` | ch019 ch029 |
| `story-npc-lilith` | 莉莉丝 | `lilith.png` | ch020 ch021 ch022 ch023 ch025 ch027 ch028 ch029 ch030 ex006 ex007 ex009 ex010 |
| `story-npc-inge` | 茵格 | `inge.png` | ch021 ch022 |
| `story-npc-grave` | 格雷夫 | `grave.png` | ch022 ch024 ch028 ch029 ch030 |
| `story-npc-pike` | 派克 | `pike.png` | ch022 |
| `story-npc-veldra` | 维尔德拉 | `veldra.png` | ch023 |
| `story-npc-veldra_young` | 七席的使者 | `veldra_young.png` | ch023 |
| `story-npc-bram` | 布拉姆 | `bram.png` | ch023 |
| `story-npc-house_head` | 三家的家主 | `house_head.png` | ch023 |
| `story-npc-cassia` | 卡西娅 | `cassia.png` | ch024 ch025 ch026 ch027 ch028 ch029 ch030 |
| `story-npc-hector` | 赫克托 | `hector.png` | ch024 |
| `story-npc-red_shield_veteran` | 红盾的老兵 | `red_shield_veteran.png` | ch024 |
| `story-npc-holger` | 霍尔格 | `holger.png` | ch025 |
| `story-npc-ilvo` | 伊尔沃 | `ilvo.png` | ch025 |
| `story-npc-lena` | 女声 | `lena.png` | ch025 |
| `story-npc-grantz` | 格兰茨 | `grantz.png` | ch026 |
| `story-npc-cora` | 柯拉 | `cora.png` | ch026 |
| `story-npc-lindor` | 林铎 | `lindor.png` | ch026 |
| `story-npc-mammongo` | 玛门戈 | `mammongo.png` | ch026 |
| `story-npc-gold_scale` | 金衡圣印 | `gold_scale.png` | ch026 |
| `story-npc-veslra` | 维斯拉 | `veslra.png` | ch027 |
| `story-npc-cassandra` | 卡珊德拉 | `cassandra.png` | ch028 |
| `story-npc-edwin` | 艾德温 | `edwin.png` | ch028 |
| `story-npc-heras` | 赫拉斯 | `heras.png` | ch028 |
| `story-npc-moira` | 莫伊拉 | `moira.png` | ch028 |
| `story-npc-arkan` | 阿尔坎 | `arkan.png` | ch029 |
| `story-npc-morcan` | 莫尔坎 | `morcan.png` | ch029 ch030 |
| `story-npc-bell_ringer` | 敲钟人 | `bell_ringer.png` | ch029 |
| `story-npc-executioner` | 刽子手 | `executioner.png` | （暂无章节使用） |
| `story-npc-morcan_crowned` | 神帝 | `morcan_crowned.png` | ch030 |
| `story-npc-toby_11` | 托比 | `toby_11.png` | ch030 |
| `story-npc-lia_consort` | 莉亚 | `lia_consort.png` | ch030 |
| `story-npc-lia_cell` | 莉亚 | `lia_cell.png` | ch030 |
| `story-npc-mia_consort` | 米娅 | `mia_consort.png` | ch030 |
| `story-npc-mia_cell` | 米娅 | `mia_cell.png` | ch030 |
| `story-npc-serena_consort` | 塞雷娜 | `serena_consort.png` | ch030 |
| `story-npc-serena_cell` | 塞雷娜 | `serena_cell.png` | ch030 |
| `story-npc-freya_consort` | 芙蕾娅 | `freya_consort.png` | ch030 |
| `story-npc-freya_cell` | 芙蕾娅 | `freya_cell.png` | ch030 |
| `story-npc-lilith_consort` | 莉莉丝 | `lilith_consort.png` | ch030 |
| `story-npc-lilith_cell` | 莉莉丝 | `lilith_cell.png` | ch030 |
| `story-npc-evelyn_consort` | 伊芙琳 | `evelyn_consort.png` | ch030 |
| `story-npc-evelyn_cell` | 伊芙琳 | `evelyn_cell.png` | ch030 |
| `story-npc-ophelia_consort` | 奥菲莉亚 | `ophelia_consort.png` | ch030 |
| `story-npc-ophelia_cell` | 奥菲莉亚 | `ophelia_cell.png` | ch030 |
| `story-npc-aila_consort` | 艾拉 | `aila_consort.png` | ch030 |
| `story-npc-aila_cell` | 艾拉 | `aila_cell.png` | ch030 |
| `story-npc-lia_y3_beside` | 莉亚 | `lia_y3_beside.png` | ch030 |
| `story-npc-lia_y3_apart` | 莉亚 | `lia_y3_apart.png` | ch030 |
| `story-npc-lia_y3_away` | 莉亚 | `lia_y3_away.png` | ch030 |
| `story-npc-mia_y3_beside` | 米娅 | `mia_y3_beside.png` | ch030 |
| `story-npc-mia_y3_apart` | 米娅 | `mia_y3_apart.png` | ch030 |
| `story-npc-mia_y3_away` | 米娅 | `mia_y3_away.png` | ch030 |
| `story-npc-serena_y3_beside` | 塞雷娜 | `serena_y3_beside.png` | ch030 |
| `story-npc-serena_y3_apart` | 塞雷娜 | `serena_y3_apart.png` | ch030 |
| `story-npc-serena_y3_away` | 塞雷娜 | `serena_y3_away.png` | ch030 |
| `story-npc-freya_y3_beside` | 芙蕾娅 | `freya_y3_beside.png` | ch030 |
| `story-npc-freya_y3_apart` | 芙蕾娅 | `freya_y3_apart.png` | ch030 |
| `story-npc-freya_y3_away` | 芙蕾娅 | `freya_y3_away.png` | ch030 |
| `story-npc-lilith_y3_beside` | 莉莉丝 | `lilith_y3_beside.png` | ch030 |
| `story-npc-lilith_y3_apart` | 莉莉丝 | `lilith_y3_apart.png` | ch030 |
| `story-npc-lilith_y3_away` | 莉莉丝 | `lilith_y3_away.png` | ch030 |
| `story-npc-evelyn_y3_beside` | 伊芙琳 | `evelyn_y3_beside.png` | ch030 |
| `story-npc-evelyn_y3_apart` | 伊芙琳 | `evelyn_y3_apart.png` | ch030 |
| `story-npc-evelyn_y3_away` | 伊芙琳 | `evelyn_y3_away.png` | ch030 |
| `story-npc-ophelia_y3_beside` | 奥菲莉亚 | `ophelia_y3_beside.png` | ch030 |
| `story-npc-ophelia_y3_apart` | 奥菲莉亚 | `ophelia_y3_apart.png` | ch030 |
| `story-npc-ophelia_y3_away` | 奥菲莉亚 | `ophelia_y3_away.png` | ch030 |
| `story-npc-aila_y3_beside` | 艾拉 | `aila_y3_beside.png` | ch030 |
| `story-npc-aila_y3_apart` | 艾拉 | `aila_y3_apart.png` | ch030 |
| `story-npc-aila_y3_away` | 艾拉 | `aila_y3_away.png` | ch030 |
| `story-npc-raymond_disarmed` | 雷蒙德 | `raymond_disarmed.png` | ch029 |
| `story-npc-rowena_plain` | 洛温娜 | `rowena_plain.png` | ch029 |
| `story-npc-celestine_keys` | 塞莱斯汀 | `celestine_keys.png` | ch029 |
| `story-npc-veldra_plain` | 维尔德拉 | `veldra_plain.png` | ch023 |
| `story-npc-heras_white` | 赫拉斯 | `heras_white.png` | ch028 |
| `story-npc-ilvo_open` | 伊尔沃 | `ilvo_open.png` | ch025 |
| `story-npc-evelyn_ceremony` | 伊芙琳 | `evelyn_ceremony.png` | ch016 |
| `story-npc-morcan_closed` | 莫尔坎 | `morcan_closed.png` | ch030 |

### 道具特写叠图（`story-insert`，54 张）

台词或叙述出现某件道具时浮在场景上的卡片；不画任何文字。

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `insert-ch10_purple_eyes` |  | `ch10_purple_eyes.png` | ch010 |
| `insert-ch12_inverted_star` |  | `ch12_inverted_star.png` | ch012 |
| `insert-ch12_roof_watcher` |  | `ch12_roof_watcher.png` | ch012 |
| `insert-ch12_shadow_bind` |  | `ch12_shadow_bind.png` | ch012 |
| `insert-ch13_half_crest` |  | `ch13_half_crest.png` | ch013 |
| `insert-ch13_pilgrim_pass` |  | `ch13_pilgrim_pass.png` | ch013 |
| `insert-ch14_tag_board` |  | `ch14_tag_board.png` | ch014 |
| `insert-ch15_dark_shard` |  | `ch15_dark_shard.png` | ch015 |
| `insert-ch15_dragon_eye` |  | `ch15_dragon_eye.png` | ch015 |
| `insert-ch15_seven_ring_plate` |  | `ch15_seven_ring_plate.png` | ch015 |
| `insert-ch15_summons_seal` |  | `ch15_summons_seal.png` | ch015 |
| `insert-ch16_saint_draft` |  | `ch16_saint_draft.png` | ch016 |
| `insert-ch16_seals` |  | `ch16_seals.png` | ch016 |
| `insert-ch16_silver_hand` |  | `ch16_silver_hand.png` | ch016 |
| `insert-ch16_weapons_table` |  | `ch16_weapons_table.png` | ch016 |
| `insert-ch17_full_crest` |  | `ch17_full_crest.png` | ch017 |
| `insert-ch17_rubbing` |  | `ch17_rubbing.png` | ch017 |
| `insert-ch17_window_hand` |  | `ch17_window_hand.png` | ch017 |
| `insert-ch18_frost_rings` |  | `ch18_frost_rings.png` | ch018 |
| `insert-ch18_frost_spirit` |  | `ch18_frost_spirit.png` | ch018 |
| `insert-ch18_ice_letter` |  | `ch18_ice_letter.png` | ch018 |
| `insert-ch18_ice_person` |  | `ch18_ice_person.png` | ch018 |
| `insert-ch19_alphabet` |  | `ch19_alphabet.png` | ch019 |
| `insert-ch19_frost_circle` |  | `ch19_frost_circle.png` | ch019 |
| `insert-ch20_white_gown` |  | `ch20_white_gown.png` | ch020 |
| `insert-ch21_dragon_well` |  | `ch21_dragon_well.png` | ch021 |
| `insert-ch22_lena_letter` |  | `ch22_lena_letter.png` | ch022 |
| `insert-ch23_deeds` |  | `ch23_deeds.png` | ch023 |
| `insert-ch23_vine_faces` |  | `ch23_vine_faces.png` | ch023 |
| `insert-ch23_wood_ring` |  | `ch23_wood_ring.png` | ch023 |
| `insert-ch24_barga` |  | `ch24_barga.png` | ch024 |
| `insert-ch24_barga_cracked` |  | `ch24_barga_cracked.png` | ch024 |
| `insert-ch25_frost_words` |  | `ch25_frost_words.png` | ch025 |
| `insert-ch25_ice_heart` |  | `ch25_ice_heart.png` | ch025 |
| `insert-ch25_mother_book` |  | `ch25_mother_book.png` | ch025 |
| `insert-ch26_contract_lamp` |  | `ch26_contract_lamp.png` | ch026 |
| `insert-ch26_deeds_burning` |  | `ch26_deeds_burning.png` | ch026 |
| `insert-ch27_chain_blade` |  | `ch27_chain_blade.png` | ch027 |
| `insert-ch27_dragon_free` |  | `ch27_dragon_free.png` | ch027 |
| `insert-ch27_erased_scale` |  | `ch27_erased_scale.png` | ch027 |
| `insert-ch27_ophelia_dragon` |  | `ch27_ophelia_dragon.png` | ch027 |
| `insert-ch27_sea_rope` |  | `ch27_sea_rope.png` | ch027 |
| `insert-ch27_seven_chairs` |  | `ch27_seven_chairs.png` | ch027 |
| `insert-ch27_young_dragon` |  | `ch27_young_dragon.png` | ch027 |
| `insert-ch28_mirror_tables` |  | `ch28_mirror_tables.png` | ch028 |
| `insert-ch28_shackles` |  | `ch28_shackles.png` | ch028 |
| `insert-ch28_tracking_mirror` |  | `ch28_tracking_mirror.png` | ch028 |
| `insert-ch29_arkan_heart` |  | `ch29_arkan_heart.png` | ch029 |
| `insert-ch29_eclipse_cloth` |  | `ch29_eclipse_cloth.png` | ch029 |
| `insert-ch29_heart_back` |  | `ch29_heart_back.png` | ch029 |
| `insert-ch30_code_first` |  | `ch30_code_first.png` | ch030 |
| `insert-ch30_crown_crack` |  | `ch30_crown_crack.png` | ch030 |
| `insert-ch30_ledger_last` |  | `ch30_ledger_last.png` | ch030 |
| `insert-ch30_whistle` |  | `ch30_whistle.png` | ch030 |

## 第 4 批 · 服装透明胸像（以对应服装立绘为参考）

### 服装透明胸像（`costumes-bust`，80 张）

委托板单位卡与类型相符的番外用；透明底 PNG。

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `bust-lia-swimsuit` |  | `lia_swimsuit.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-wedding` |  | `lia_wedding.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-office` |  | `lia_office.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-maid` |  | `lia_maid.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-sportwear` |  | `lia_sportwear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-newyear` |  | `lia_newyear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-christmas` |  | `lia_christmas.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-duanwu` |  | `lia_duanwu.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-anniversary` |  | `lia_anniversary.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-resort` |  | `lia_resort.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-swimsuit` |  | `mia_swimsuit.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-wedding` |  | `mia_wedding.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-office` |  | `mia_office.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-maid` |  | `mia_maid.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-sportwear` |  | `mia_sportwear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-newyear` |  | `mia_newyear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-christmas` |  | `mia_christmas.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-duanwu` |  | `mia_duanwu.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-anniversary` |  | `mia_anniversary.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-resort` |  | `mia_resort.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-swimsuit` |  | `serena_swimsuit.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-wedding` |  | `serena_wedding.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-office` |  | `serena_office.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-maid` |  | `serena_maid.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-sportwear` |  | `serena_sportwear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-newyear` |  | `serena_newyear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-christmas` |  | `serena_christmas.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-duanwu` |  | `serena_duanwu.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-anniversary` |  | `serena_anniversary.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-resort` |  | `serena_resort.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-swimsuit` |  | `freya_swimsuit.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-wedding` |  | `freya_wedding.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-office` |  | `freya_office.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-maid` |  | `freya_maid.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-sportwear` |  | `freya_sportwear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-newyear` |  | `freya_newyear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-christmas` |  | `freya_christmas.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-duanwu` |  | `freya_duanwu.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-anniversary` |  | `freya_anniversary.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-resort` |  | `freya_resort.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-swimsuit` |  | `lilith_swimsuit.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-wedding` |  | `lilith_wedding.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-office` |  | `lilith_office.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-maid` |  | `lilith_maid.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-sportwear` |  | `lilith_sportwear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-newyear` |  | `lilith_newyear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-christmas` |  | `lilith_christmas.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-duanwu` |  | `lilith_duanwu.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-anniversary` |  | `lilith_anniversary.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-resort` |  | `lilith_resort.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-swimsuit` |  | `evelyn_swimsuit.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-wedding` |  | `evelyn_wedding.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-office` |  | `evelyn_office.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-maid` |  | `evelyn_maid.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-sportwear` |  | `evelyn_sportwear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-newyear` |  | `evelyn_newyear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-christmas` |  | `evelyn_christmas.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-duanwu` |  | `evelyn_duanwu.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-anniversary` |  | `evelyn_anniversary.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-resort` |  | `evelyn_resort.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-swimsuit` |  | `ophelia_swimsuit.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-wedding` |  | `ophelia_wedding.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-office` |  | `ophelia_office.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-maid` |  | `ophelia_maid.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-sportwear` |  | `ophelia_sportwear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-newyear` |  | `ophelia_newyear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-christmas` |  | `ophelia_christmas.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-duanwu` |  | `ophelia_duanwu.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-anniversary` |  | `ophelia_anniversary.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-resort` |  | `ophelia_resort.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-swimsuit` |  | `aila_swimsuit.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-wedding` |  | `aila_wedding.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-office` |  | `aila_office.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-maid` |  | `aila_maid.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-sportwear` |  | `aila_sportwear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-newyear` |  | `aila_newyear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-christmas` |  | `aila_christmas.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-duanwu` |  | `aila_duanwu.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-anniversary` |  | `aila_anniversary.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-resort` |  | `aila_resort.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |

### 泳装 12+ 罩衫版透明胸像（`costumes-bust-soft`，8 张）

透明底 PNG。

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `bust-lia-swimsuit-soft` |  | `lia_swimsuit.png` | 12+ 时委托板与海边番外的泳装胸像 |
| `bust-mia-swimsuit-soft` |  | `mia_swimsuit.png` | 12+ 时委托板与海边番外的泳装胸像 |
| `bust-serena-swimsuit-soft` |  | `serena_swimsuit.png` | 12+ 时委托板与海边番外的泳装胸像 |
| `bust-freya-swimsuit-soft` |  | `freya_swimsuit.png` | 12+ 时委托板与海边番外的泳装胸像 |
| `bust-lilith-swimsuit-soft` |  | `lilith_swimsuit.png` | 12+ 时委托板与海边番外的泳装胸像 |
| `bust-evelyn-swimsuit-soft` |  | `evelyn_swimsuit.png` | 12+ 时委托板与海边番外的泳装胸像 |
| `bust-ophelia-swimsuit-soft` |  | `ophelia_swimsuit.png` | 12+ 时委托板与海边番外的泳装胸像 |
| `bust-aila-swimsuit-soft` |  | `aila_swimsuit.png` | 12+ 时委托板与海边番外的泳装胸像 |

## 第 5 批 · 外传 CG、Boss、舞台背景与卡面

### 剧情 CG（`cg`，10 张）

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `cg-intro-eye` |  | `intro-eye.png` | 外传 CG 图库与序章演出 |
| `cg-camp-fire` |  | `camp-fire.png` | 外传 CG 图库与序章演出 |
| `cg-corridor-frost` |  | `corridor-frost.png` | 外传 CG 图库与序章演出 |
| `cg-battle-descend` |  | `battle-descend.png` | 外传 CG 图库与序章演出 |
| `cg-battle-phase2` |  | `battle-phase2.png` | 外传 CG 图库与序章演出 |
| `cg-battle-phase3` |  | `battle-phase3.png` | 外传 CG 图库与序章演出 |
| `cg-aftermath-snow` |  | `aftermath-snow.png` | 外传 CG 图库与序章演出 |
| `cg-ending-seal` |  | `ending-seal.png` | 外传 CG 图库与序章演出 |
| `cg-ending-share` |  | `ending-share.png` | 外传 CG 图库与序章演出 |
| `cg-ending-destroy` |  | `ending-destroy.png` | 外传 CG 图库与序章演出 |

### 食梦兽三阶段（`boss`，3 张）

深色底即可，游戏内自动羽化边缘。

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `boss-1` |  | `dream-eater-1.png` | 外传序章 Boss 战（按血量换三阶段） |
| `boss-2` |  | `dream-eater-2.png` | 外传序章 Boss 战（按血量换三阶段） |
| `boss-3` |  | `dream-eater-3.png` | 外传序章 Boss 战（按血量换三阶段） |

### 舞台背景（`scenes`，3 张）

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `scene-battle-bg` |  | `battle-bg.png` | 外传序章舞台；外传正篇也复用（餐车、撕裂的车顶、黎明的铁轨） |
| `scene-camp-bg` |  | `camp-bg.png` | 外传序章舞台；外传正篇也复用（餐车、撕裂的车顶、黎明的铁轨） |
| `scene-ending-bg` |  | `ending-bg.png` | 外传序章舞台；外传正篇也复用（餐车、撕裂的车顶、黎明的铁轨） |

### 卡面（`cards`，38 张）

进化版沿用同一张。

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `card-n_wisp` |  | `n_wisp.png` | 卡牌对战（实验模式）卡面 |
| `card-n_goblin` |  | `n_goblin.png` | 卡牌对战（实验模式）卡面 |
| `card-n_merchant` |  | `n_merchant.png` | 卡牌对战（实验模式）卡面 |
| `card-n_knight` |  | `n_knight.png` | 卡牌对战（实验模式）卡面 |
| `card-n_golem` |  | `n_golem.png` | 卡牌对战（实验模式）卡面 |
| `card-n_troll` |  | `n_troll.png` | 卡牌对战（实验模式）卡面 |
| `card-n_angel` |  | `n_angel.png` | 卡牌对战（实验模式）卡面 |
| `card-n_dragon` |  | `n_dragon.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_recruit` |  | `lia_recruit.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_shieldbash` |  | `lia_shieldbash.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_flameguard` |  | `lia_flameguard.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_rally` |  | `lia_rally.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_charger` |  | `lia_charger.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_bulwark` |  | `lia_bulwark.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_captain` |  | `lia_captain.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_flamestrike` |  | `lia_flamestrike.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_fortress` |  | `lia_fortress.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_hero` |  | `lia_hero.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_dagger` |  | `lilith_dagger.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_strike` |  | `lilith_strike.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_apprentice` |  | `lilith_apprentice.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_poison` |  | `lilith_poison.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_shadowdance` |  | `lilith_shadowdance.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_assassin` |  | `lilith_assassin.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_shadowarrow` |  | `lilith_shadowarrow.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_nightblade` |  | `lilith_nightblade.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_shadowlord` |  | `lilith_shadowlord.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_hero` |  | `lilith_hero.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_acolyte` |  | `serena_acolyte.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_darkbolt` |  | `serena_darkbolt.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_observer` |  | `serena_observer.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_drain` |  | `serena_drain.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_oracle` |  | `serena_oracle.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_void` |  | `serena_void.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_nova` |  | `serena_nova.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_devourer` |  | `serena_devourer.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_seal` |  | `serena_seal.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_hero` |  | `serena_hero.png` | 卡牌对战（实验模式）卡面 |
