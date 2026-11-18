# 美术清单（交给 GPT 出图）

<!-- 本文件由 tools/art/raster/list.mjs 根据 tools/art/raster/manifest.mjs 生成（npm run art:list），请勿手改。 -->

游戏原有的美术为原创矢量图（SVG），已导入的条目可在游戏里显示厚涂位图。这份清单列出要交给 GPT 重新绘制的全部 **630 张**位图：女主立绘、服装、胸像、主线 / 番外 / 外传的场景背景、剧情胸像、道具特写、外传 CG 与卡面。出好的图按下面的规则放进去，游戏会自动用位图替换对应的矢量图，没出的继续显示矢量图，可以分批上线。

- 逐张的完整提示词、参考图与尺寸：[`docs/art-list/gpt-art-list.csv`](art-list/gpt-art-list.csv)（Excel 可直接打开）。用 API 批量出图时脚本直接读 `manifest.mjs`，不读 CSV。
- 提示词的源头是 `tools/art/raster/manifest.mjs`：改描述就改那里，再跑 `npm run art:list` 重新导出本清单。

## 画风（全套统一）

**日本动画画师画的欧洲奇幻**：日式动漫的人物画法——大而有神的眼睛、干净利落的线稿、赛璐璐与厚涂结合的上色、成熟的五官；舞台、服饰与器物是欧洲中世纪奇幻（哥特教堂、石砌城镇、骑士盔甲、长袍、木桥与港口）。光影偏电影感：月光、彩色轮廓光，色调略收、点缀色鲜明。

- **以女主角立绘为基准**：第 1 批先出八位女主立绘（参考 `tools/art/raster/ref/lia.png` 的画风与正典外观描述），**定稿后**，其余每一张都把新出的莉亚立绘当第一张参考图，保证线稿、上色、光影一致；服装与胸像另外附上该女主自己的立绘，保证同一张脸。
- **服装定设计，场景定表演**：80 套常规换装的朝向、眼神、手势与发型逐套写在 `tools/art/raster/costume-staging.json`，同一人的十张并排检查。避免用整图翻转换方向；伤痕、异色瞳、发夹和塔盾要留在人物本人的正确侧。透明服装胸像沿用对应立绘的表情和动作；泳装罩衫版只增加罩衫，保证切换自然。
- 每条提示词的开头都是同一段画风描述（`manifest.mjs` 的 `STYLE`），结尾附「Avoid:」（GPT 没有单独的负面提示词）。
- 例外：番外十是平行现代（IF），它的办公室、商场背景和 OL 装画现代都市。

## 硬性规定

1. **不出现任何文字**：招牌、纸张、账本、屏幕一律留白或使用纯图形；不要字母、数字、伪文字、水印、签名或 logo。
2. **女主全部是成年人**（18–19 岁），外观以正典为准（`设定集/03_主角与八位女主角.md`，提示词里已写好）。莉亚一律背着塔盾「赤誓」。外传（银轨号）的称号不写进画面说明。
3. **尺度**：泳装是不透明的正常泳装，脸是画面重点，不做身体局部特写、不摆暗示性姿势（提示词与 Avoid 已写明）；12+ 罩衫版是同一件泳装外加她自己的罩衫。孩子（托比、波莉等）只出现在普通场景，永远不和泳装或任何擦边的画面同框。婚礼礼服是礼服店试穿：不画戒指、不画新郎、不画祭坛，头纱不遮脸。
4. **背景不画人物**（场景背景、舞台背景、道具特写里没有人；人物用胸像另外叠上去）。
5. **透明底**：剧情胸像与服装胸像要透明背景（PNG），只画人物本身，不要地面与背景。
6. **AI 生成标识**：GPT 写在原图里的 AI 生成元数据（C2PA / EXIF）要保留；导入脚本压缩时会把 AIGC 标识写回成品，游戏里换成位图的位置会自动显示「AI 生成」角标。

## 怎么出图与导入

按 CSV 的「GPT 尺寸」交原图，「游戏尺寸」由导入脚本裁切。宽屏场景交 1536×1024 原图，把人物、地标和剧情线索放在画面高度中央约 83% 内，避免游戏裁掉上下边缘。

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
| 3 | `story-bg` | 剧情场景背景（主线、番外、外传正篇） | 208 | 1536×1024 → 1600×900 |
| 3 | `story-npc` | 剧情胸像（透明底） | 128 | 1024×1536 → 600×800 |
| 3 | `story-insert` | 道具特写叠图 | 54 | 1536×1024 → 800×600 |
| 4 | `costumes-bust` | 服装透明胸像（透明底） | 80 | 1024×1536 → 600×800 |
| 4 | `costumes-bust-soft` | 泳装 12+ 罩衫版透明胸像（透明底） | 8 | 1024×1536 → 600×800 |
| 5 | `cg` | 剧情 CG | 10 | 1536×1024 → 1600×900 |
| 5 | `boss` | 食梦兽三阶段 | 3 | 1024×1024 → 1000×1000 |
| 5 | `scenes` | 舞台背景 | 3 | 1536×1024 → 1600×900 |
| 5 | `cards` | 卡面 | 38 | 1024×1024 → 512×512 |
| 6 | `ui` | 标题背景与世界地图 | 2 | 1536×1024 → 1600×900 / 1000×560 |
| | | **合计** | **630** | |

「出现章节」里 `chNNN` 是主线、`exNNN` 是番外、`gNNN` 是外传正篇；没有章节的场景、胸像暂时没有地方用到，可以排到最后。

## 第 1 批 · 女主立绘（全套画风基准，必须先定稿）

### 女主立绘（`portraits`，8 张）

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `portrait-lia` | 莉亚·赫斯特 | `lia.png` | 召唤、换衣间、委托板绝技切入；后面所有图的画风参考 |
| `portrait-mia` | 米娅·玲 | `mia.png` | 召唤、换衣间、委托板绝技切入；后面所有图的画风参考 |
| `portrait-serena` | 塞雷娜·诺克斯 | `serena.png` | 召唤、换衣间、委托板绝技切入；后面所有图的画风参考 |
| `portrait-freya` | 芙蕾娅·霜华 | `freya.png` | 召唤、换衣间、委托板绝技切入；后面所有图的画风参考 |
| `portrait-lilith` | 莉莉丝·瓦尔哈拉 | `lilith.png` | 召唤、换衣间、委托板绝技切入；后面所有图的画风参考 |
| `portrait-evelyn` | 伊芙琳·星歌 | `evelyn.png` | 召唤、换衣间、委托板绝技切入；后面所有图的画风参考 |
| `portrait-ophelia` | 奥菲利亚·使诺德 | `ophelia.png` | 召唤、换衣间、委托板绝技切入；后面所有图的画风参考 |
| `portrait-aila` | 艾拉·瓦尔哈拉 | `aila.png` | 召唤、换衣间、委托板绝技切入；后面所有图的画风参考 |

## 第 2 批 · 服装立绘与 12+ 罩衫版（以该女主立绘为参考）

### 服装立绘（`costumes`，80 张）

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `costume-lia-swimsuit` | 莉亚·泳装 | `lia_swimsuit.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-wedding` | 莉亚·婚礼礼服 | `lia_wedding.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-office` | 莉亚·OL装 | `lia_office.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-maid` | 莉亚·女仆装 | `lia_maid.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-sportwear` | 莉亚·运动短袖 | `lia_sportwear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-newyear` | 莉亚·新历祭服 | `lia_newyear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-christmas` | 莉亚·冬灯节服 | `lia_christmas.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-duanwu` | 莉亚·龙舟祭服 | `lia_duanwu.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-anniversary` | 莉亚·纪念日礼服 | `lia_anniversary.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lia-resort` | 莉亚·度假装 | `lia_resort.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-swimsuit` | 米娅·泳装 | `mia_swimsuit.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-wedding` | 米娅·婚礼礼服 | `mia_wedding.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-office` | 米娅·OL装 | `mia_office.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-maid` | 米娅·女仆装 | `mia_maid.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-sportwear` | 米娅·运动短袖 | `mia_sportwear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-newyear` | 米娅·新历祭服 | `mia_newyear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-christmas` | 米娅·冬灯节服 | `mia_christmas.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-duanwu` | 米娅·龙舟祭服 | `mia_duanwu.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-anniversary` | 米娅·纪念日礼服 | `mia_anniversary.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-mia-resort` | 米娅·度假装 | `mia_resort.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-swimsuit` | 塞雷娜·泳装 | `serena_swimsuit.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-wedding` | 塞雷娜·婚礼礼服 | `serena_wedding.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-office` | 塞雷娜·OL装 | `serena_office.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-maid` | 塞雷娜·女仆装 | `serena_maid.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-sportwear` | 塞雷娜·运动短袖 | `serena_sportwear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-newyear` | 塞雷娜·新历祭服 | `serena_newyear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-christmas` | 塞雷娜·冬灯节服 | `serena_christmas.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-duanwu` | 塞雷娜·龙舟祭服 | `serena_duanwu.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-anniversary` | 塞雷娜·纪念日礼服 | `serena_anniversary.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-serena-resort` | 塞雷娜·度假装 | `serena_resort.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-swimsuit` | 芙蕾娅·泳装 | `freya_swimsuit.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-wedding` | 芙蕾娅·婚礼礼服 | `freya_wedding.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-office` | 芙蕾娅·OL装 | `freya_office.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-maid` | 芙蕾娅·女仆装 | `freya_maid.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-sportwear` | 芙蕾娅·运动短袖 | `freya_sportwear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-newyear` | 芙蕾娅·新历祭服 | `freya_newyear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-christmas` | 芙蕾娅·冬灯节服 | `freya_christmas.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-duanwu` | 芙蕾娅·龙舟祭服 | `freya_duanwu.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-anniversary` | 芙蕾娅·纪念日礼服 | `freya_anniversary.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-freya-resort` | 芙蕾娅·度假装 | `freya_resort.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-swimsuit` | 莉莉丝·泳装 | `lilith_swimsuit.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-wedding` | 莉莉丝·婚礼礼服 | `lilith_wedding.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-office` | 莉莉丝·OL装 | `lilith_office.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-maid` | 莉莉丝·女仆装 | `lilith_maid.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-sportwear` | 莉莉丝·运动短袖 | `lilith_sportwear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-newyear` | 莉莉丝·新历祭服 | `lilith_newyear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-christmas` | 莉莉丝·冬灯节服 | `lilith_christmas.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-duanwu` | 莉莉丝·龙舟祭服 | `lilith_duanwu.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-anniversary` | 莉莉丝·纪念日礼服 | `lilith_anniversary.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-lilith-resort` | 莉莉丝·度假装 | `lilith_resort.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-swimsuit` | 伊芙琳·泳装 | `evelyn_swimsuit.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-wedding` | 伊芙琳·婚礼礼服 | `evelyn_wedding.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-office` | 伊芙琳·OL装 | `evelyn_office.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-maid` | 伊芙琳·女仆装 | `evelyn_maid.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-sportwear` | 伊芙琳·运动短袖 | `evelyn_sportwear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-newyear` | 伊芙琳·新历祭服 | `evelyn_newyear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-christmas` | 伊芙琳·冬灯节服 | `evelyn_christmas.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-duanwu` | 伊芙琳·龙舟祭服 | `evelyn_duanwu.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-anniversary` | 伊芙琳·纪念日礼服 | `evelyn_anniversary.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-evelyn-resort` | 伊芙琳·度假装 | `evelyn_resort.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-swimsuit` | 奥菲利亚·泳装 | `ophelia_swimsuit.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-wedding` | 奥菲利亚·婚礼礼服 | `ophelia_wedding.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-office` | 奥菲利亚·OL装 | `ophelia_office.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-maid` | 奥菲利亚·女仆装 | `ophelia_maid.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-sportwear` | 奥菲利亚·运动短袖 | `ophelia_sportwear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-newyear` | 奥菲利亚·新历祭服 | `ophelia_newyear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-christmas` | 奥菲利亚·冬灯节服 | `ophelia_christmas.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-duanwu` | 奥菲利亚·龙舟祭服 | `ophelia_duanwu.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-anniversary` | 奥菲利亚·纪念日礼服 | `ophelia_anniversary.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-ophelia-resort` | 奥菲利亚·度假装 | `ophelia_resort.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-swimsuit` | 艾拉·泳装 | `aila_swimsuit.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-wedding` | 艾拉·婚礼礼服 | `aila_wedding.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-office` | 艾拉·OL装 | `aila_office.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-maid` | 艾拉·女仆装 | `aila_maid.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-sportwear` | 艾拉·运动短袖 | `aila_sportwear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-newyear` | 艾拉·新历祭服 | `aila_newyear.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-christmas` | 艾拉·冬灯节服 | `aila_christmas.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-duanwu` | 艾拉·龙舟祭服 | `aila_duanwu.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-anniversary` | 艾拉·纪念日礼服 | `aila_anniversary.png` | 召唤结果、换衣间、服饰池卡面 |
| `costume-aila-resort` | 艾拉·度假装 | `aila_resort.png` | 召唤结果、换衣间、服饰池卡面 |

### 泳装 12+ 罩衫版立绘（`costumes-soft`，8 张）

同一件泳装外面加她自己的罩衫；内容模式 12+ 时显示。

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `costume-soft-lia` | 莉亚·泳装（罩衫版） | `lia_swimsuit.png` | 内容模式 12+ 时替换泳装立绘 |
| `costume-soft-mia` | 米娅·泳装（罩衫版） | `mia_swimsuit.png` | 内容模式 12+ 时替换泳装立绘 |
| `costume-soft-serena` | 塞雷娜·泳装（罩衫版） | `serena_swimsuit.png` | 内容模式 12+ 时替换泳装立绘 |
| `costume-soft-freya` | 芙蕾娅·泳装（罩衫版） | `freya_swimsuit.png` | 内容模式 12+ 时替换泳装立绘 |
| `costume-soft-lilith` | 莉莉丝·泳装（罩衫版） | `lilith_swimsuit.png` | 内容模式 12+ 时替换泳装立绘 |
| `costume-soft-evelyn` | 伊芙琳·泳装（罩衫版） | `evelyn_swimsuit.png` | 内容模式 12+ 时替换泳装立绘 |
| `costume-soft-ophelia` | 奥菲利亚·泳装（罩衫版） | `ophelia_swimsuit.png` | 内容模式 12+ 时替换泳装立绘 |
| `costume-soft-aila` | 艾拉·泳装（罩衫版） | `aila_swimsuit.png` | 内容模式 12+ 时替换泳装立绘 |

## 第 3 批 · 剧情：场景背景、胸像、道具叠图（以莉亚立绘为画风参考）

### 剧情场景背景（主线、番外、外传正篇）（`story-bg`，208 张）

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
| `story-bg-north-slope-camp` | 北山缓坡·灾民营地 | `north-slope-camp.png` | ch001 ch022 ex018 ex021 ex022 ex023 ex024 |
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
| `story-bg-salt-marsh-bridge` | 盐沼桥·午后涨潮 | `salt-marsh-bridge.png` | ch006 ex023 |
| `story-bg-forest-edge-inn` | 林边旅店·黄昏 | `forest-edge-inn.png` | ch006 ch007 ch008 ex023 |
| `story-bg-forest-edge-channel-night` | 林边水道泥滩·夜 | `forest-edge-channel-night.png` | ch007 ch008 |
| `story-bg-tide-station-dawn` | 量潮老站·站顶·天亮 | `tide-station-dawn.png` | ch008 |
| `story-bg-tide-station-predawn` | 量潮老站·站顶·天亮前 | `tide-station-predawn.png` | ch008 |
| `story-bg-tide-station-room` | 量潮老站·潮室·拂晓 | `tide-station-room.png` | ch008 |
| `story-bg-fog-harbor-bridge-noon` | 雾港·第一座木桥·近午退潮 | `fog-harbor-bridge-noon.png` | ch009 ch023 ex011 ex013 |
| `story-bg-fog-harbor-guild` | 冒险者公会雾港分会 | `fog-harbor-guild.png` | ch009 ch010 ch012 ch023 ex011 ex013 |
| `story-bg-fog-harbor-drain-dusk` | 旧浴场后沟与排水区东口·黄昏 | `fog-harbor-drain-dusk.png` | ch009 ch012 ch014 ex012 |
| `story-bg-fog-harbor-drain-night` | 旧浴场后沟与排水区东口·入夜 | `fog-harbor-drain-night.png` | ch009 ch014 |
| `story-bg-fog-harbor-sewer-pump` | 雾港·东口以下·砖拱水道与三号泵房 | `fog-harbor-sewer-pump.png` | ch010 |
| `story-bg-fog-harbor-tide-cavity` | 雾港·潮腔·旧蓄水池 | `fog-harbor-tide-cavity.png` | ch010 |
| `story-bg-fog-harbor-tide-cavity-ebb` | 雾港·潮腔·排水后 | `fog-harbor-tide-cavity-ebb.png` | ch010 ch014 |
| `story-bg-fog-harbor-drain-dawn` | 旧浴场后沟与排水区东口·破晓 | `fog-harbor-drain-dawn.png` | ch010 ch015 ex012 |
| `story-bg-fog-harbor-bridge-dusk` | 雾港·第一座木桥·黄昏 | `fog-harbor-bridge-dusk.png` | ch010 ex011 ex013 |
| `story-bg-fog-harbor-bridge-inn-night` | 雾港·桥头旅店·入夜 | `fog-harbor-bridge-inn-night.png` | ch010 ch011 |
| `story-bg-fog-harbor-bridge-inn-eyes` | 雾港·桥头旅店·镜中紫眼 | `fog-harbor-bridge-inn-eyes.png` | ch010 ch011 |
| `story-bg-fog-harbor-bridge-inn-room` | 雾港·桥头旅店·亚克的房间 | `fog-harbor-bridge-inn-room.png` | ch011 ex017 |
| `story-bg-fog-harbor-bridge-inn-mirror` | 雾港·桥头旅店·镜子的那一边 | `fog-harbor-bridge-inn-mirror.png` | ch011 |
| `story-bg-fog-harbor-bridge-inn-covered` | 雾港·桥头旅店·镜子蒙上毛巾 | `fog-harbor-bridge-inn-covered.png` | ch011 ch012 ex017 |
| `story-bg-fog-harbor-old-lighthouse` | 雾港·旧灯塔 | `fog-harbor-old-lighthouse.png` | ch012 ex017 |
| `story-bg-fog-harbor-old-lighthouse-rain` | 雾港·旧灯塔·雨夜灯室 | `fog-harbor-old-lighthouse-rain.png` | ch012 |
| `story-bg-fog-harbor-old-lighthouse-night` | 雾港·旧灯塔·塔底夜雨 | `fog-harbor-old-lighthouse-night.png` | ch013 |
| `story-bg-fog-harbor-old-lighthouse-night-broken` | 雾港·旧灯塔·塔底夜雨·破窗 | `fog-harbor-old-lighthouse-night-broken.png` | ch013 |
| `story-bg-fog-harbor-old-lighthouse-dawn` | 雾港·旧灯塔·清晨 | `fog-harbor-old-lighthouse-dawn.png` | ch013 ex012 |
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
| `story-bg-fog-harbor-guild-shed` | 雾港·分会的仓内 | `fog-harbor-guild-shed.png` | ch015 ex011 |
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
| `story-bg-holy-city-pilgrim-hostel-day` | 白塔圣都·朝圣者旅舍·白天 | `holy-city-pilgrim-hostel-day.png` | ch018 ex015 |
| `story-bg-white-tower-outer-court-thawed` | 白塔·外庭·正午 | `white-tower-outer-court-thawed.png` | ch018 |
| `story-bg-white-tower-seven-angle-hall` | 白塔·七角殿 | `white-tower-seven-angle-hall.png` | ch019 ch029 |
| `story-bg-white-tower-outer-court-dusk` | 白塔·外庭·黄昏 | `white-tower-outer-court-dusk.png` | ch019 ch020 ex005 ex019 |
| `story-bg-white-tower-outer-court-night` | 白塔·外庭·夜 | `white-tower-outer-court-night.png` | ch019 ch020 ex019 |
| `story-bg-white-tower-underground-archive` | 册厅底下·地下档案库 | `white-tower-underground-archive.png` | ch020 |
| `story-bg-white-tower-outer-court-day` | 白塔·外庭·白天 | `white-tower-outer-court-day.png` | ch021 ex004 ex016 ex019 |
| `story-bg-arch-tide-gate-sanctuary` | 拱潮门下·护界院 | `arch-tide-gate-sanctuary.png` | ch021 |
| `story-bg-arch-tide-gate-channel` | 拱潮门·水道 | `arch-tide-gate-channel.png` | ch021 |
| `story-bg-canal-bank-dawn` | 城外运河的堤岸·黎明 | `canal-bank-dawn.png` | ch021 |
| `story-bg-north-slope-camp-night` | 北山缓坡·营地·夜 | `north-slope-camp-night.png` | ch022 ex018 ex021 ex023 |
| `story-bg-north-hill-cave` | 守羊洞里·北山营地 | `north-hill-cave.png` | ch022 |
| `story-bg-verdant-waterway-night` | 往绿镜城的水路·夜 | `verdant-waterway-night.png` | ch023 |
| `story-bg-verdant-mirror-vine-gate` | 绿镜城水门·镜藤 | `verdant-mirror-vine-gate.png` | ch023 |
| `story-bg-verdant-council-hall` | 绿镜城议会厅 | `verdant-council-hall.png` | ch023 |
| `story-bg-fog-marsh-edge` | 沼林边·石台 | `fog-marsh-edge.png` | ch023 |
| `story-bg-verdant-camp-night` | 绿镜城外的营地·夜 | `verdant-camp-night.png` | ch023 ex014 ex025 |
| `story-bg-ash-pass-far` | 灰烬关·远景 | `ash-pass-far.png` | ch024 |
| `story-bg-ash-pass-camp-night` | 灰烬关下·营地·夜 | `ash-pass-camp-night.png` | ch024 |
| `story-bg-ash-pass-camp-day` | 灰烬关下·营地·白天 | `ash-pass-camp-day.png` | ch024 |
| `story-bg-ash-pass-gate-dawn` | 灰烬关·旧营关门前·黎明 | `ash-pass-gate-dawn.png` | ch024 |
| `story-bg-ash-pass-throat` | 灰烬关·山口里 | `ash-pass-throat.png` | ch024 |
| `story-bg-frostbell-far` | 霜铃城·远景 | `frostbell-far.png` | ch025 |
| `story-bg-frostbell-gate` | 霜铃城·城门 | `frostbell-gate.png` | ch025 |
| `story-bg-frostbell-camp-night` | 霜铃城外·营地·夜 | `frostbell-camp-night.png` | ch025 ex020 |
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
| `story-bg-fog-harbor-bridge-inn-hall` | 雾港·桥头旅店·一楼食堂 | `fog-harbor-bridge-inn-hall.png` | ex001 ex017 |
| `story-bg-fog-harbor-bridge-inn-hall-night` | 雾港·桥头旅店·一楼食堂·打烊 | `fog-harbor-bridge-inn-hall-night.png` | ex001 ex017 |
| `story-bg-fog-harbor-sandbar` | 雾港外海·沙洲·退潮 | `fog-harbor-sandbar.png` | ex002 |
| `story-bg-fog-harbor-sandbar-dusk` | 雾港外海·沙洲·黄昏涨潮 | `fog-harbor-sandbar-dusk.png` | ex002 |
| `story-bg-white-tower-arcade-street` | 白塔圣都·朝圣者拱廊街 | `white-tower-arcade-street.png` | ex003 ex015 |
| `story-bg-white-tower-arcade-dress-shop` | 白塔·拱廊街·铸金商会礼服店 | `white-tower-arcade-dress-shop.png` | ex003 |
| `story-bg-holy-city-knights-drill-ground` | 白塔圣都·骑士团演武场·白天 | `holy-city-knights-drill-ground.png` | ex004 |
| `story-bg-holy-city-knights-drill-ground-dusk` | 白塔圣都·骑士团演武场·黄昏 | `holy-city-knights-drill-ground-dusk.png` | ex004 |
| `story-bg-white-tower-outer-court-winter-lights` | 白塔·外庭·冬灯夜 | `white-tower-outer-court-winter-lights.png` | ex005 |
| `story-bg-white-tower-outer-court-bathhouse` | 白塔·外庭浴场·蒸汽 | `white-tower-outer-court-bathhouse.png` | ex005 |
| `story-bg-north-slope-camp-festival` | 北山缓坡·营地·新历祭 | `north-slope-camp-festival.png` | ex006 |
| `story-bg-north-slope-camp-festival-night` | 北山缓坡·营地·新历祭之夜 | `north-slope-camp-festival-night.png` | ex006 |
| `story-bg-fog-harbor-market-day` | 雾港·市集·白天 | `fog-harbor-market-day.png` | ex007 ex013 |
| `story-bg-fog-harbor-shadow-market` | 雾港·影市 | `fog-harbor-shadow-market.png` | ex007 ex013 |
| `story-bg-north-slope-camp-anniversary-dusk` | 北山缓坡·营地·黄昏的长桌 | `north-slope-camp-anniversary-dusk.png` | ex008 |
| `story-bg-north-slope-camp-anniversary-night` | 北山缓坡·营地·灯下的长桌 | `north-slope-camp-anniversary-night.png` | ex008 ex021 |
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
| `story-bg-fog-harbor-old-bathhouse` | 雾港·旧浴场·镜厅 | `fog-harbor-old-bathhouse.png` | ex012 |
| `story-bg-fog-harbor-backstreet-day` | 雾港·排水区的后街·白天 | `fog-harbor-backstreet-day.png` | ex011 |
| `story-bg-holy-city-morning-market` | 白塔圣都·晨市 | `holy-city-morning-market.png` | ex015 |
| `story-bg-white-tower-nameless-ward` | 白塔·无名病房 | `white-tower-nameless-ward.png` | ex016 |
| `story-bg-verdant-mirror-street-day` | 绿镜城·活藤街·白天 | `verdant-mirror-street-day.png` | ex014 ex025 ex026 |
| `story-bg-frostbell-camp-day` | 霜铃城外·营地·白天 | `frostbell-camp-day.png` | ex020 |
| `story-bg-north-creek-goblin-camp` | 北山·溪谷里的哥布林营地 | `north-creek-goblin-camp.png` | ex022 |
| `story-bg-north-slope-registry-tent` | 北山营地·登记帐篷 | `north-slope-registry-tent.png` | ex024 |
| `story-bg-verdant-registry-hall` | 绿镜城·身份登记所 | `verdant-registry-hall.png` | ex025 |
| `story-bg-verdant-vine-clinic` | 绿镜城·藤院诊疗所 | `verdant-vine-clinic.png` | ex026 |

### 剧情胸像（`story-npc`，128 张）

清单来自 public/story/speakers.json（同一文件只列一次）。透明底 PNG。

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `story-npc-aku` | 亚克 | `aku.png` | ch000 ch001 ch002 ch003 ch004 ch005 ch006 ch012 ch015 ch016 ch017 ch029 ch030 ex001 ex003 ex005 ex006 ex007 ex009 ex011 g001 g006 |
| `story-npc-erin` | 艾琳 | `erin.png` | ch000 |
| `story-npc-toby` | 托比 | `toby.png` | ch000 ch001 ch022 ex006 ex023 |
| `story-npc-mara` | 玛拉 | `mara.png` | ch000 ch004 ch005 ch022 ch030 ex006 ex008 |
| `story-npc-borin` | 伯伦 | `borin.png` | ch000 ch003 |
| `story-npc-horn` | 霍恩 | `horn.png` | ch000 ch001 ch022 ch030 ex006 ex018 ex022 ex023 ex024 |
| `story-npc-kern` | 白·可恩 | `kern.png` | ch001 ch022 ch023 ch024 ch025 ch026 ch027 ch028 ch029 ch030 ex006 |
| `story-npc-maeve` | 梅芙 | `maeve.png` | ch002 ch003 ch004 ch005 |
| `story-npc-lia` | 莉亚 | `lia.png` | ch002 ch003 ch004 ch005 ch006 ch007 ch008 ch009 ch010 ch011 ch012 ch013 ch014 ch015 ch016 ch017 ch018 ch019 ch020 ch021 ch022 ch023 ch024 ch025 ch026 ch027 ch028 ch029 ch030 ex001 ex002 ex003 ex006 ex008 ex009 ex010 ex011 ex012 ex015 ex017 ex018 ex020 ex021 ex022 ex024 g001 g002 g003 g004 g005 g006 g007 g008 g009 g010 g011 g012 g013 g014 g015 |
| `story-npc-rocky` | 罗奇 | `rocky.png` | ch002 ch003 |
| `story-npc-blackrobe` | 黑袍人 | `blackrobe.png` | ch000 |
| `story-npc-dragon` | 黑龙 | `dragon.png` | （暂无章节使用） |
| `story-npc-finn` | 芬恩 | `finn.png` | ch003 ch004 |
| `story-npc-goblin` | 哥布林 | `goblin.png` | ch003 ex022 |
| `story-npc-polly` | 波莉 | `polly.png` | ch004 ch005 ex006 |
| `story-npc-acolyte` | 念祷文的人 | `acolyte.png` | ch004 ch005 ch014 |
| `story-npc-goblin_chief` | 哥布林咒徒长 | `goblin_chief.png` | ch005 |
| `story-npc-marsh_ogre` | 沼地食人魔 | `marsh_ogre.png` | ch006 |
| `story-npc-caravan_leader` | 领队 | `caravan_leader.png` | ch006 ch007 ch008 |
| `story-npc-mia` | 米娅 | `mia.png` | ch007 ch008 ch009 ch010 ch011 ch012 ch013 ch014 ch015 ch016 ch017 ch018 ch019 ch020 ch021 ch022 ch023 ch024 ch025 ch026 ch027 ch028 ch029 ch030 ex001 ex002 ex003 ex004 ex006 ex008 ex009 ex010 ex011 ex012 ex013 ex017 ex018 ex019 ex021 ex022 ex026 g001 g002 g003 g004 g005 g006 g007 g008 g009 g010 g011 g012 g013 g014 g015 |
| `story-npc-scrap_picker` | 拾铁机 | `scrap_picker.png` | ch007 |
| `story-npc-ines` | 伊涅丝 | `ines.png` | ch009 ch010 ch012 ch013 ch014 ch015 ch023 ch027 ex007 ex011 ex013 |
| `story-npc-tide_cavity_mother` | 潮腔母虫 | `tide_cavity_mother.png` | ch010 |
| `story-npc-serena` | 塞雷娜 | `serena.png` | ch011 ch012 ch028 ch029 ch030 ex002 ex003 ex006 ex007 ex008 ex009 ex010 ex011 ex012 ex013 ex017 ex021 ex023 ex025 g001 g002 g003 g004 g005 g006 g007 g008 g009 g010 g011 g012 g013 g014 g015 |
| `story-npc-scar_echo` | 蚀痕残响 | `scar_echo.png` | ch011 |
| `story-npc-scar_echo_15` | 蚀痕残响 | `scar_echo_15.png` | ch011 |
| `story-npc-mirror_apprentice` | 镜咒学徒 | `mirror_apprentice.png` | ch012 |
| `story-npc-mirror_apprentice_blanket` | 镜咒学徒 | `mirror_apprentice_blanket.png` | ch012 ch013 |
| `story-npc-lia_mirror` | 莉亚 | `lia_mirror.png` | ch012 ch015 |
| `story-npc-serena_staff_wrapped` | 塞雷娜 | `serena_staff_wrapped.png` | ch012 ch013 ch014 ch015 ch016 ch017 ch018 ch019 ch020 ch021 ch022 ch023 ch024 ch025 ch026 ch027 ch028 ch029 |
| `story-npc-golden_assassin` | 金发刺客 | `golden_assassin.png` | ch013 ch015 ch020 |
| `story-npc-plains_woman` | 晨祷平原来的女人 | `plains_woman.png` | ch014 |
| `story-npc-oda` | 欧妲 | `oda.png` | ch014 ch015 ex011 |
| `story-npc-tide_king` | 潮虫王 | `tide_king.png` | ch015 |
| `story-npc-tide_king_split` | 潮虫王 | `tide_king_split.png` | （暂无章节使用） |
| `story-npc-serena_copy` | 塞雷娜 | `serena_copy.png` | ch015 |
| `story-npc-relief_officer` | 赈灾司的官 | `relief_officer.png` | ch015 |
| `story-npc-evelyn` | 伊芙琳 | `evelyn.png` | ch017 ch018 ch019 ch020 ch021 ch022 ch023 ch024 ch025 ch027 ch028 ch029 ch030 ex003 ex004 ex005 ex006 ex009 ex010 ex014 ex015 ex016 ex021 ex024 ex026 |
| `story-npc-emperor` | 皇帝 | `emperor.png` | ch016 ch019 ch021 ch029 |
| `story-npc-rowena` | 洛温娜 | `rowena.png` | ch016 ch019 ch029 |
| `story-npc-celestine` | 塞莱斯汀 | `celestine.png` | ch016 ch019 ch021 ch029 ch030 |
| `story-npc-severin` | 塞弗林 | `severin.png` | ch016 ch019 ch021 ch029 ch030 |
| `story-npc-ceremony_officer` | 白面的礼仪官 | `ceremony_officer.png` | ch016 ch017 ch021 |
| `story-npc-archivist` | 典册官 | `archivist.png` | ch016 ch019 ch020 |
| `story-npc-aila` | 艾拉 | `aila.png` | ch017 ch018 ch019 ch020 ch021 ch023 ch027 ch029 ch030 ex004 ex006 ex009 ex010 ex015 ex016 ex021 ex023 ex026 |
| `story-npc-freya` | 芙蕾娅 | `freya.png` | ch018 ch019 ch020 ch021 ch023 ch024 ch025 ch027 ch028 ch029 ch030 ex004 ex005 ex006 ex009 ex010 ex019 ex020 ex021 ex023 |
| `story-npc-nila` | 妮拉 | `nila.png` | ex019 |
| `story-npc-envoy_chief` | 使团长 | `envoy_chief.png` | ch018 ex005 ex019 |
| `story-npc-ophelia` | 奥菲莉亚 | `ophelia.png` | ch019 ch020 ch021 ch023 ch024 ch026 ch027 ch028 ch029 ch030 ex005 ex006 ex007 ex009 ex010 ex016 ex021 ex022 ex025 |
| `story-npc-raymond` | 雷蒙德 | `raymond.png` | ch019 ch029 |
| `story-npc-lilith` | 莉莉丝 | `lilith.png` | ch020 ch021 ch022 ch023 ch025 ch027 ch028 ch029 ch030 ex006 ex007 ex009 ex010 ex013 ex014 ex021 ex025 |
| `story-npc-inge` | 茵格 | `inge.png` | ch021 ch022 |
| `story-npc-grave` | 格雷夫 | `grave.png` | ch022 ch024 ch028 ch029 ch030 |
| `story-npc-pike` | 派克 | `pike.png` | ch022 ex023 |
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
| `insert-ch10_purple_eyes` | 一面暗着的镜子里，一双紫色的眼睛，没有脸 | `ch10_purple_eyes.png` | ch010 |
| `insert-ch12_inverted_star` | 旧镜面里，一只黑手套松开一根线，手套背面一颗倒过来的七角星亮了一下 | `ch12_inverted_star.png` | ch012 |
| `insert-ch12_roof_watcher` | 雨夜，对岸的屋顶上，一个蹲着的人影，看不见脸 | `ch12_roof_watcher.png` | ch012 |
| `insert-ch12_shadow_bind` | 暗紫色的影子贴着石板缠上去，只缠到靴子 | `ch12_shadow_bind.png` | ch012 |
| `insert-ch13_half_crest` | 檐沟里，断成一半的黑金家纹扣子 | `ch13_half_crest.png` | ch013 |
| `insert-ch13_pilgrim_pass` | 半湿的巡礼通行证 | `ch13_pilgrim_pass.png` | ch013 |
| `insert-ch14_tag_board` | 手腕上绑着的木牌，背面烧着那个像拱又像浪的记号 | `ch14_tag_board.png` | ch014 |
| `insert-ch15_dark_shard` | 焦黑的龙骨上，一块黑绿色的碎片，还在很慢地跳 | `ch15_dark_shard.png` | ch015 |
| `insert-ch15_dragon_eye` | 闪回 | `ch15_dragon_eye.png` | ch015 |
| `insert-ch15_seven_ring_plate` | 木环底下压着的一片铜，刻着七个同心的环 | `ch15_seven_ring_plate.png` | ch015 |
| `insert-ch15_summons_seal` | 白纸的信，金色火漆压成一顶冠，冠缘一道裂 | `ch15_summons_seal.png` | ch015 |
| `insert-ch16_saint_draft` | 圣女的稿子 | `ch16_saint_draft.png` | ch016 |
| `insert-ch16_seals` | 册厅桌上 | `ch16_seals.png` | ch016 |
| `insert-ch16_silver_hand` | 一只戴银甲的手伸进灯光里，接过那张纸 | `ch16_silver_hand.png` | ch016 |
| `insert-ch16_weapons_table` | 晨门长桌上 | `ch16_weapons_table.png` | ch016 |
| `insert-ch17_full_crest` | 披风内侧，一枚完整的黑金家纹 | `ch17_full_crest.png` | ch017 |
| `insert-ch17_rubbing` | 石凳上的一张拓本 | `ch17_rubbing.png` | ch017 |
| `insert-ch17_window_hand` | 白石墙上二楼的窗，黑烟里一只手在拍玻璃 | `ch17_window_hand.png` | ch017 |
| `insert-ch18_frost_rings` | 霜上的刻纹 | `ch18_frost_rings.png` | ch018 |
| `insert-ch18_frost_spirit` | 霜灵 | `ch18_frost_spirit.png` | ch018 |
| `insert-ch18_ice_letter` | 一只手握着一块冰，冰里封着一封折好的信 | `ch18_ice_letter.png` | ch018 |
| `insert-ch18_ice_person` | 冰里的人，只到胸口 | `ch18_ice_person.png` | ch018 |
| `insert-ch19_alphabet` | 七环拓本旁边，一张古七锁文的字母表 | `ch19_alphabet.png` | ch019 |
| `insert-ch19_frost_circle` | 一圈霜从杖尖长出去，停在戟尖和她的脚之间 | `ch19_frost_circle.png` | ch019 |
| `insert-ch20_white_gown` | 远远地，一件白色的礼服被捧着穿过外庭 | `ch20_white_gown.png` | ch020 |
| `insert-ch21_dragon_well` | 很深的井底 | `ch21_dragon_well.png` | ch021 |
| `insert-ch22_lena_letter` | 一封信，七角晨星的封蜡已经裂开了 | `ch22_lena_letter.png` | ch022 |
| `insert-ch23_deeds` | 一叠地契，每一张背面都盖着三家的章，还有拱浪的记号 | `ch23_deeds.png` | ch023 |
| `insert-ch23_vine_faces` | 藤的尖端长出一张张脸，没有影子 | `ch23_vine_faces.png` | ch023 |
| `insert-ch23_wood_ring` | 石台上的木环 | `ch23_wood_ring.png` | ch023 |
| `insert-ch24_barga` | 一只巨大的熔岩蜥蜴，从熔岩里爬出来 | `ch24_barga.png` | ch024 |
| `insert-ch24_barga_cracked` | 巴尔加 | `ch24_barga_cracked.png` | ch024 |
| `insert-ch25_frost_words` | 营帐窗上的霜，一个字一个字长出来 | `ch25_frost_words.png` | ch025 |
| `insert-ch25_ice_heart` | 冰之心 | `ch25_ice_heart.png` | ch025 |
| `insert-ch25_mother_book` | 石台上摊开的母本，旁边一块很老的冰 | `ch25_mother_book.png` | ch025 |
| `insert-ch26_contract_lamp` | 契约上画着一盏灯 | `ch26_contract_lamp.png` | ch026 |
| `insert-ch26_deeds_burning` | 债契烧了一整夜 | `ch26_deeds_burning.png` | ch026 |
| `insert-ch27_chain_blade` | 黎月的刃口对着锁链的一环，很轻，一毫米 | `ch27_chain_blade.png` | ch027 |
| `insert-ch27_dragon_free` | 那一环断了 | `ch27_dragon_free.png` | ch027 |
| `insert-ch27_erased_scale` | 黑龙颈上掉下的一片鳞，刻着龙文，有几行被刮掉了 | `ch27_erased_scale.png` | ch027 |
| `insert-ch27_ophelia_dragon` | 奥菲莉亚的龙形 | `ch27_ophelia_dragon.png` | ch027 |
| `insert-ch27_sea_rope` | 海面上，一条绳子漂着 | `ch27_sea_rope.png` | ch027 |
| `insert-ch27_seven_chairs` | 镜子里是一张议桌，七张椅子 | `ch27_seven_chairs.png` | ch027 |
| `insert-ch27_young_dragon` | 营火边，小小的幼龙形，停在他头顶上方一寸 | `ch27_young_dragon.png` | ch027 |
| `insert-ch28_mirror_tables` | 每一面镜子里，都有一张议桌 | `ch28_mirror_tables.png` | ch028 |
| `insert-ch28_shackles` | 压律镣铐 | `ch28_shackles.png` | ch028 |
| `insert-ch28_tracking_mirror` | 永久追踪镜 | `ch28_tracking_mirror.png` | ch028 |
| `insert-ch29_arkan_heart` | 石巨人跪下，石头的胸口打开，里面一团光 | `ch29_arkan_heart.png` | ch029 |
| `insert-ch29_eclipse_cloth` | 桌布上绣着一个黑色的月亮，吞着一个白色的月亮 | `ch29_eclipse_cloth.png` | ch029 |
| `insert-ch29_heart_back` | 光的背面刻着字，很旧的字 | `ch29_heart_back.png` | ch029 |
| `insert-ch30_code_first` | 《帝国法典》翻在第一条 | `ch30_code_first.png` | ch030 |
| `insert-ch30_crown_crack` | 帝冠的内侧，第一道细细的裂 | `ch30_crown_crack.png` | ch030 |
| `insert-ch30_ledger_last` | 帐的最后一页 | `ch30_ledger_last.png` | ch030 |
| `insert-ch30_whistle` | 一枚牧羊的铜哨，系在绳子上 | `ch30_whistle.png` | ch030 |

## 第 4 批 · 服装透明胸像（以对应服装立绘为参考）

### 服装透明胸像（`costumes-bust`，80 张）

委托板单位卡与类型相符的番外用；透明底 PNG。

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `bust-lia-swimsuit` | 莉亚·泳装 · 胸像 | `lia_swimsuit.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-wedding` | 莉亚·婚礼礼服 · 胸像 | `lia_wedding.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-office` | 莉亚·OL装 · 胸像 | `lia_office.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-maid` | 莉亚·女仆装 · 胸像 | `lia_maid.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-sportwear` | 莉亚·运动短袖 · 胸像 | `lia_sportwear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-newyear` | 莉亚·新历祭服 · 胸像 | `lia_newyear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-christmas` | 莉亚·冬灯节服 · 胸像 | `lia_christmas.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-duanwu` | 莉亚·龙舟祭服 · 胸像 | `lia_duanwu.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-anniversary` | 莉亚·纪念日礼服 · 胸像 | `lia_anniversary.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lia-resort` | 莉亚·度假装 · 胸像 | `lia_resort.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-swimsuit` | 米娅·泳装 · 胸像 | `mia_swimsuit.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-wedding` | 米娅·婚礼礼服 · 胸像 | `mia_wedding.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-office` | 米娅·OL装 · 胸像 | `mia_office.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-maid` | 米娅·女仆装 · 胸像 | `mia_maid.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-sportwear` | 米娅·运动短袖 · 胸像 | `mia_sportwear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-newyear` | 米娅·新历祭服 · 胸像 | `mia_newyear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-christmas` | 米娅·冬灯节服 · 胸像 | `mia_christmas.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-duanwu` | 米娅·龙舟祭服 · 胸像 | `mia_duanwu.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-anniversary` | 米娅·纪念日礼服 · 胸像 | `mia_anniversary.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-mia-resort` | 米娅·度假装 · 胸像 | `mia_resort.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-swimsuit` | 塞雷娜·泳装 · 胸像 | `serena_swimsuit.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-wedding` | 塞雷娜·婚礼礼服 · 胸像 | `serena_wedding.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-office` | 塞雷娜·OL装 · 胸像 | `serena_office.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-maid` | 塞雷娜·女仆装 · 胸像 | `serena_maid.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-sportwear` | 塞雷娜·运动短袖 · 胸像 | `serena_sportwear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-newyear` | 塞雷娜·新历祭服 · 胸像 | `serena_newyear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-christmas` | 塞雷娜·冬灯节服 · 胸像 | `serena_christmas.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-duanwu` | 塞雷娜·龙舟祭服 · 胸像 | `serena_duanwu.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-anniversary` | 塞雷娜·纪念日礼服 · 胸像 | `serena_anniversary.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-serena-resort` | 塞雷娜·度假装 · 胸像 | `serena_resort.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-swimsuit` | 芙蕾娅·泳装 · 胸像 | `freya_swimsuit.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-wedding` | 芙蕾娅·婚礼礼服 · 胸像 | `freya_wedding.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-office` | 芙蕾娅·OL装 · 胸像 | `freya_office.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-maid` | 芙蕾娅·女仆装 · 胸像 | `freya_maid.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-sportwear` | 芙蕾娅·运动短袖 · 胸像 | `freya_sportwear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-newyear` | 芙蕾娅·新历祭服 · 胸像 | `freya_newyear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-christmas` | 芙蕾娅·冬灯节服 · 胸像 | `freya_christmas.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-duanwu` | 芙蕾娅·龙舟祭服 · 胸像 | `freya_duanwu.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-anniversary` | 芙蕾娅·纪念日礼服 · 胸像 | `freya_anniversary.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-freya-resort` | 芙蕾娅·度假装 · 胸像 | `freya_resort.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-swimsuit` | 莉莉丝·泳装 · 胸像 | `lilith_swimsuit.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-wedding` | 莉莉丝·婚礼礼服 · 胸像 | `lilith_wedding.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-office` | 莉莉丝·OL装 · 胸像 | `lilith_office.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-maid` | 莉莉丝·女仆装 · 胸像 | `lilith_maid.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-sportwear` | 莉莉丝·运动短袖 · 胸像 | `lilith_sportwear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-newyear` | 莉莉丝·新历祭服 · 胸像 | `lilith_newyear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-christmas` | 莉莉丝·冬灯节服 · 胸像 | `lilith_christmas.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-duanwu` | 莉莉丝·龙舟祭服 · 胸像 | `lilith_duanwu.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-anniversary` | 莉莉丝·纪念日礼服 · 胸像 | `lilith_anniversary.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-lilith-resort` | 莉莉丝·度假装 · 胸像 | `lilith_resort.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-swimsuit` | 伊芙琳·泳装 · 胸像 | `evelyn_swimsuit.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-wedding` | 伊芙琳·婚礼礼服 · 胸像 | `evelyn_wedding.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-office` | 伊芙琳·OL装 · 胸像 | `evelyn_office.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-maid` | 伊芙琳·女仆装 · 胸像 | `evelyn_maid.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-sportwear` | 伊芙琳·运动短袖 · 胸像 | `evelyn_sportwear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-newyear` | 伊芙琳·新历祭服 · 胸像 | `evelyn_newyear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-christmas` | 伊芙琳·冬灯节服 · 胸像 | `evelyn_christmas.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-duanwu` | 伊芙琳·龙舟祭服 · 胸像 | `evelyn_duanwu.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-anniversary` | 伊芙琳·纪念日礼服 · 胸像 | `evelyn_anniversary.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-evelyn-resort` | 伊芙琳·度假装 · 胸像 | `evelyn_resort.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-swimsuit` | 奥菲利亚·泳装 · 胸像 | `ophelia_swimsuit.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-wedding` | 奥菲利亚·婚礼礼服 · 胸像 | `ophelia_wedding.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-office` | 奥菲利亚·OL装 · 胸像 | `ophelia_office.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-maid` | 奥菲利亚·女仆装 · 胸像 | `ophelia_maid.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-sportwear` | 奥菲利亚·运动短袖 · 胸像 | `ophelia_sportwear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-newyear` | 奥菲利亚·新历祭服 · 胸像 | `ophelia_newyear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-christmas` | 奥菲利亚·冬灯节服 · 胸像 | `ophelia_christmas.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-duanwu` | 奥菲利亚·龙舟祭服 · 胸像 | `ophelia_duanwu.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-anniversary` | 奥菲利亚·纪念日礼服 · 胸像 | `ophelia_anniversary.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-ophelia-resort` | 奥菲利亚·度假装 · 胸像 | `ophelia_resort.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-swimsuit` | 艾拉·泳装 · 胸像 | `aila_swimsuit.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-wedding` | 艾拉·婚礼礼服 · 胸像 | `aila_wedding.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-office` | 艾拉·OL装 · 胸像 | `aila_office.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-maid` | 艾拉·女仆装 · 胸像 | `aila_maid.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-sportwear` | 艾拉·运动短袖 · 胸像 | `aila_sportwear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-newyear` | 艾拉·新历祭服 · 胸像 | `aila_newyear.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-christmas` | 艾拉·冬灯节服 · 胸像 | `aila_christmas.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-duanwu` | 艾拉·龙舟祭服 · 胸像 | `aila_duanwu.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-anniversary` | 艾拉·纪念日礼服 · 胸像 | `aila_anniversary.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |
| `bust-aila-resort` | 艾拉·度假装 · 胸像 | `aila_resort.png` | 委托板单位卡；类型相符的番外里她说话时的胸像 |

### 泳装 12+ 罩衫版透明胸像（`costumes-bust-soft`，8 张）

透明底 PNG。

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `bust-lia-swimsuit-soft` | 莉亚·泳装（罩衫版） · 胸像 | `lia_swimsuit.png` | 12+ 时委托板与海边番外的泳装胸像 |
| `bust-mia-swimsuit-soft` | 米娅·泳装（罩衫版） · 胸像 | `mia_swimsuit.png` | 12+ 时委托板与海边番外的泳装胸像 |
| `bust-serena-swimsuit-soft` | 塞雷娜·泳装（罩衫版） · 胸像 | `serena_swimsuit.png` | 12+ 时委托板与海边番外的泳装胸像 |
| `bust-freya-swimsuit-soft` | 芙蕾娅·泳装（罩衫版） · 胸像 | `freya_swimsuit.png` | 12+ 时委托板与海边番外的泳装胸像 |
| `bust-lilith-swimsuit-soft` | 莉莉丝·泳装（罩衫版） · 胸像 | `lilith_swimsuit.png` | 12+ 时委托板与海边番外的泳装胸像 |
| `bust-evelyn-swimsuit-soft` | 伊芙琳·泳装（罩衫版） · 胸像 | `evelyn_swimsuit.png` | 12+ 时委托板与海边番外的泳装胸像 |
| `bust-ophelia-swimsuit-soft` | 奥菲利亚·泳装（罩衫版） · 胸像 | `ophelia_swimsuit.png` | 12+ 时委托板与海边番外的泳装胸像 |
| `bust-aila-swimsuit-soft` | 艾拉·泳装（罩衫版） · 胸像 | `aila_swimsuit.png` | 12+ 时委托板与海边番外的泳装胸像 |

## 第 5 批 · 外传 CG、Boss、舞台背景与卡面

### 剧情 CG（`cg`，10 张）

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `cg-intro-eye` | 窗外的眼睛 | `intro-eye.png` | 外传 CG 图库与序章演出 |
| `cg-camp-fire` | 战前餐车 | `camp-fire.png` | 外传 CG 图库与序章演出 |
| `cg-corridor-frost` | 记忆之霜 | `corridor-frost.png` | 外传 CG 图库与序章演出 |
| `cg-battle-descend` | 食梦兽降临 | `battle-descend.png` | 外传 CG 图库与序章演出 |
| `cg-battle-phase2` | 记忆崩塌 | `battle-phase2.png` | 外传 CG 图库与序章演出 |
| `cg-battle-phase3` | 它想起了什么 | `battle-phase3.png` | 外传 CG 图库与序章演出 |
| `cg-aftermath-snow` | 记忆之雪 | `aftermath-snow.png` | 外传 CG 图库与序章演出 |
| `cg-ending-seal` | 静默契约 | `ending-seal.png` | 外传 CG 图库与序章演出 |
| `cg-ending-share` | 黎明公开 | `ending-share.png` | 外传 CG 图库与序章演出 |
| `cg-ending-destroy` | 永夜终章 | `ending-destroy.png` | 外传 CG 图库与序章演出 |

### 食梦兽三阶段（`boss`，3 张）

深色底即可，游戏内自动羽化边缘。

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `boss-1` | 食梦兽·阿涅摩伊（完整形态） | `dream-eater-1.png` | 外传序章 Boss 战（按血量换三阶段） |
| `boss-2` | 食梦兽·阿涅摩伊（破甲形态） | `dream-eater-2.png` | 外传序章 Boss 战（按血量换三阶段） |
| `boss-3` | 食梦兽·阿涅摩伊（封印形态） | `dream-eater-3.png` | 外传序章 Boss 战（按血量换三阶段） |

### 舞台背景（`scenes`，3 张）

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `scene-battle-bg` | 列车车厢战场 | `battle-bg.png` | 外传序章舞台；外传正篇也复用（餐车、撕裂的车顶、黎明的铁轨） |
| `scene-camp-bg` | 银辉列车餐车 | `camp-bg.png` | 外传序章舞台；外传正篇也复用（餐车、撕裂的车顶、黎明的铁轨） |
| `scene-ending-bg` | 黎明 | `ending-bg.png` | 外传序章舞台；外传正篇也复用（餐车、撕裂的车顶、黎明的铁轨） |

### 卡面（`cards`，38 张）

进化版沿用同一张。

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `card-n_wisp` | 微光精灵 | `n_wisp.png` | 卡牌对战（实验模式）卡面 |
| `card-n_goblin` | 哥布林 | `n_goblin.png` | 卡牌对战（实验模式）卡面 |
| `card-n_merchant` | 旅行商人 | `n_merchant.png` | 卡牌对战（实验模式）卡面 |
| `card-n_knight` | 重装骑士 | `n_knight.png` | 卡牌对战（实验模式）卡面 |
| `card-n_golem` | 岩石魔像 | `n_golem.png` | 卡牌对战（实验模式）卡面 |
| `card-n_troll` | 巨魔战士 | `n_troll.png` | 卡牌对战（实验模式）卡面 |
| `card-n_angel` | 守护天使 | `n_angel.png` | 卡牌对战（实验模式）卡面 |
| `card-n_dragon` | 远古巨龙 | `n_dragon.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_recruit` | 盾卫学徒 | `lia_recruit.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_shieldbash` | 盾击 | `lia_shieldbash.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_flameguard` | 烈焰守卫 | `lia_flameguard.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_rally` | 战吼鼓舞 | `lia_rally.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_charger` | 赤焰冲锋者 | `lia_charger.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_bulwark` | 铁壁守护者 | `lia_bulwark.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_captain` | 骑士队长 | `lia_captain.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_flamestrike` | 烈焰冲击 | `lia_flamestrike.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_fortress` | 赫斯特堡垒 | `lia_fortress.png` | 卡牌对战（实验模式）卡面 |
| `card-lia_hero` | 莉亚·赫斯特 | `lia_hero.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_dagger` | 暗影匕首 | `lilith_dagger.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_strike` | 影袭 | `lilith_strike.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_apprentice` | 刺客学徒 | `lilith_apprentice.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_poison` | 淬毒短刃 | `lilith_poison.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_shadowdance` | 影舞 | `lilith_shadowdance.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_assassin` | 暗巷刺客 | `lilith_assassin.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_shadowarrow` | 暗影箭 | `lilith_shadowarrow.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_nightblade` | 夜刃游侠 | `lilith_nightblade.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_shadowlord` | 暗影领主 | `lilith_shadowlord.png` | 卡牌对战（实验模式）卡面 |
| `card-lilith_hero` | 莉莉丝 | `lilith_hero.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_acolyte` | 月蚀学徒 | `serena_acolyte.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_darkbolt` | 暗蚀术 | `serena_darkbolt.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_observer` | 虚空观测者 | `serena_observer.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_drain` | 生命汲取 | `serena_drain.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_oracle` | 月蚀先知 | `serena_oracle.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_void` | 虚空吞噬 | `serena_void.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_nova` | 暗月新星 | `serena_nova.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_devourer` | 深渊吞噬者 | `serena_devourer.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_seal` | 静月封界 | `serena_seal.png` | 卡牌对战（实验模式）卡面 |
| `card-serena_hero` | 塞雷娜·诺克斯 | `serena_hero.png` | 卡牌对战（实验模式）卡面 |

## 第 6 批 · 标题背景与世界地图（保留界面布局）

### 标题背景与世界地图（`ui`，2 张）

构图要和现在的矢量版一致（参考图 tools/art/raster/ref/layout-*.png）：标题页右侧要留给角色卡，地图上的铁路站点位置不能动。

| 任务ID | 名称 | 交付文件 | 用途 / 出现章节 |
|---|---|---|---|
| `ui-title-bg` | 月蚀契约标题背景 | `title-bg.png` | 主菜单标题页的全屏背景 |
| `ui-world-map` | 外传世界地图 | `world-map.png` | 外传路线图（城镇标记叠在上面，站点位置必须对齐） |
