# 美术规范 v1 · 月蚀琉璃矢量风

> 适用范围：仓库内所有**代码生成的矢量美术**（SVG 立绘、服装、CG、卡面、地图、图标、场景）。
> 目标：在拿到商业级手绘/厚涂资产之前，让整款游戏**没有一张缺图、没有一个 emoji 充当美术**，且所有画面看起来出自同一套美术方向。
> 角色外观以 `docs/CHARACTER-DESIGN.md`（主三人）与 `设定集/03_主角与八位女主角.md`（其余五人）为准；与本文件冲突时，**年龄观感与尺度以本文件为准**。

## 1. 画风

- **赛璐璐矢量插画**：每个色块 = 底色 + 1 层阴影色 + 1 层高光色；阴影边缘干净（硬边为主，少量柔边渐变）。不做写实厚涂模拟。
- **线稿**：有色线（同色系加深，不用纯黑 `#000`），立绘外轮廓 3–4px、内部细节 1.5–2px（以 832 宽画布计）。
- **卡面描边**（300 宽画布）：主体外轮廓描边约 2.2–2.4px（中立/莉亚卡画在填色下方、只露出外侧一半，莉莉丝/塞雷娜卡居中描边）；颜色用**加深的职业主题色**（中立 `#2e3b5c`、莉亚 `#5c1a2a`、莉莉丝 `#3c2160`、塞雷娜 `#2c2766`，见 `tools/art/cards/*.mjs` 的 `THEME.outline`），不用近黑色。
- **主线背景与胸像**另有一套平涂规则，见 §5.1。
- **光照**：统一**月光从左上方**照入（冷白偏紫 `#e8ddff`），右侧/背光边缘加**角色标准色边缘光**。暗部带蓝紫环境反射。
- **背景**：深蓝黑到深紫渐变，低对比的主题纹样 + 极淡星点；底部 15–20% 渐隐到暗色，方便 UI 叠字。
- **气质**：轻哥特 + 月蚀奇幻。克制、精致，不走廉价手游大厅感。

## 2. 全局色板

| 用途 | 色值 |
|---|---|
| 最深背景 | `#070614` / `#0c0b1b` |
| 面板/中景 | `#17132e` / `#221c45` |
| 月光 | `#e8ddff` |
| 誓约金 | `#ffd091` |
| 记忆暖噪点 | `#ffb38a` |
| 深渊蓝 | `#0e1a3a` |

### 角色标准色（必须作为边缘光/主题色出现）

| 角色 | 主色 | 辅色 | 发色 | 瞳色 |
|---|---|---|---|---|
| 莉亚 lia | `#ff6b7c` | 金 `#ffd091`、暗红 `#c13b4c` | 赤红，左侧一缕暗红挑染 | 琥珀金 |
| 米娅 mia | `#5ed7ff` | 霓虹橙 `#ff9a3c`、深灰工装 | 青蓝短发，发尾霓虹渐变 | 青色 |
| 塞雷娜 serena | `#b58cff` | 月白 `#efe9ff`、星轨银 | 紫黑长直，发尾渐变月白 | 淡紫 |
| 芙蕾娅 freya | `#8fd4f5` | 霜白 `#f2fbff`、冰蓝 `#3f8fc4` | 青蓝长波浪 | 暖琥珀 |
| 莉莉丝 lilith | `#c084fc` | 黑金 `#d9a441` | 金色长发高束 | 金色 |
| 伊芙琳 evelyn | `#ffd98c` | 圣白 `#fffaf0`、星蓝 `#7fb2ff` | 浅金偏白长发 | 星蓝 |
| 奥菲利亚 ophelia | `#f472b6` | 铜红 `#c8643c`、龙鳞深蓝 `#1f3a7a` | 铜红长发，额侧小角 | 金紫异色瞳 |
| 艾拉 aila | `#f5c84c` | 蓝 `#4f7dff`、黑金家纹 | 金色齐肩 | 蓝色 |

## 3. 内容尺度（硬性）

- 所有女主均为**成年女性（18–19 岁）**：按年轻成年人的脸部比例与身形绘制，不做幼态化。
- **非性化**：不强调胸部/臀部，不做挑逗姿势、湿身、内衣感服装；"夏日"服装为度假便装（连衣裙/亚麻衫/草帽），不是泳装。
- 原创设计：不得临摹现有动漫/游戏角色，不使用《勇者斗恶龙》等商标性元素（如史莱姆造型、官方纹章）。

## 4. 技术约束

- 纯手写/代码生成的**自包含 SVG**：禁止 `<script>`、事件属性、外部 `href`/`xlink:href`、`<foreignObject>`、嵌入位图、Web 字体。**不使用 `<text>`**（文字由 UI 渲染）。
- 资产经 `<img>` 加载（SVG-as-image 模式，外部资源不会加载），因此每个文件必须完全独立。
- 所有 `id` 以资产前缀命名（如 `lia-`, `cgIntro-`），避免日后内联时冲突。
- 必须带 `viewBox`，不写死 `width/height`；`preserveAspectRatio` 默认即可。
- 滤镜克制：立绘/CG 每张 ≤ 4 个 `filter`；卡面 ≤ 1 个；图标 0 个。避免大面积 `feTurbulence`（低端机渲染慢）。
- 体积预算（与各 build 脚本的校验一致）：立绘 ≤ 70KB、服装立绘 ≤ 80KB（`portrait/build.mjs`）、CG ≤ 90KB（`cg/*-set.mjs`）、主线背景 ≤ 90KB、主线胸像 ≤ 70KB（`story/build.mjs`）、卡面 ≤ 14KB（`cards/*.mjs`）、进化卡面 ≤ 24KB（`build-cards.mjs`）、Boss 每阶段 ≤ 60KB。

## 5. 画布与构图

| 资产 | viewBox | 构图要点 |
|---|---|---|
| 女主立绘 / 服装立绘 | `0 0 832 1216` | 半身胸像，正面微侧；头顶约 y≈170，眼线约 y≈440，下巴约 y≈600；八人共用同一身体/头部模板，保证并排一致 |
| CG | `0 0 1600 900` | 16:9 电影构图；人物可用剪影/中远景，但轮廓须可辨（莉亚高马尾+塔盾、米娅机械猫耳、塞雷娜长发+月相发饰） |
| 卡面 | `0 0 300 300` | 主体居中偏上，四周留暗角；同职业共享背景语言 |
| 世界地图 | `0 0 1000 560` | 与 `app.js` 中城镇坐标一致（百分比坐标 × 1000/560） |
| Boss | `0 0 1000 1000` | 透明背景，主体居中 |
| 战斗/结局场景 | `0 0 1600 900` | 作为舞台背景，中央留出主体位 |
| 主线背景 | `0 0 1600 900` | 见 §5.1 |
| 主线胸像 | `0 0 600 800`，透明底 | 见 §5.1 |

### 5.1 主线背景与胸像（`tools/art/story/`，`npm run art` 产出）

- **背景**（`public/assets/story/bg/<id>.svg`，每个 `public/story/locations.json` 场景一张）：1600×900，平涂色块、**不勾墨线**（细节线用同色系加深色或受光边）；光从左上方来，远景用大气透视减淡；**按时段配色**（午后暖金、黄昏橙紫、夜晚靛蓝、黎明灰粉、黑焰之夜去色灰紫）；底部渐暗方便字幕。共用部件在 `story/lib.mjs`（房屋 `house()`、焦黑骨架 `skeleton()`、钟楼 `bellTower()`、岩石、云、烟）与 `bg-night.mjs` 的 `blackFire()`。
- **NPC 胸像**（`public/assets/story/npc/<id>.svg`）：600×800、**透明底**，逆光剪影：深色墨块 + 角色色（`speakers.json` 的 `color`）边缘光 + 少量亮部标志物，**不勾墨线**；底部 16% 渐隐。
- **莉亚胸像**（`public/assets/story/npc/lia.svg`，`lia` 与 `lia_unknown` 共用）：由立绘模板 `compose(lia, { background: false, extras: ['shield'] })` 生成，去掉夜景底板与整幅光照，只保留人物与轮廓光，背后加塔盾「赤誓」（从左肩后露出一角）；外传/召唤用的 `portraits/lia.svg` 不受影响。
- 预算以 `story/build.mjs` 为准：背景 ≤ 90KB、胸像 ≤ 70KB，每张 ≤ 4 个 `filter`，id 带文件前缀。

## 6. 资产清单与路径

- 立绘生成器：`tools/art/portrait/`（`npm run art:portraits` 产出）
  - `public/assets/portraits/<id>.svg` × 8
  - `public/assets/costumes/<id>_<type>.svg` × 48（type：newyear / maid / christmas / duanwu / anniversary / swimsuit）
- CG：`public/assets/cg/<name>.svg` × 10
- 卡面：`public/assets/cards/<cardId>.svg` × 38；进化版 `<cardId>_e.svg` × 27 由 `tools/art/build-cards.mjs` 从基础卡面派生
- 地图：`public/assets/map/world-map.svg`
- UI 图标：`public/icons.js`（内联 SVG，继承 `currentColor`）
- Boss：`public/assets/boss/dream-eater-{1,2,3}.svg`（完整 / 破甲 / 封印）
- 场景与 UI：`public/assets/scenes/*.svg`、`public/assets/ui/*.svg`
- 主线：`public/assets/story/bg/*.svg` × 29、`public/assets/story/npc/*.svg` × 16（`tools/art/story/build.mjs`）
- 厚涂位图：`tools/art/raster/`（出图清单 `manifest.mjs`，预留位清单 `public/assets/paint/README.md` 由 `readme.mjs` 生成）；旧的四张厚涂 PNG 的压缩版 `public/assets/{lia,mia,serena,key-visual}.jpg` 由 `raster/compress-legacy.mjs` 生成。所有位图都必须保留 AIGC 隐式标识（EXIF/XMP），可见的「图片由AI生成」不得裁切或遮挡。
- 旧资产：不再引用的早期 SVG 在 `tools/art/legacy/`，旧 Boss 厚涂图在 `tools/art/raster/ref/`（只作出图参考，不随站点发布）。
- 一键重建：`npm run art`（两次运行结果逐字节一致）。

## 7. 验收

每张资产交付前必须：渲染为 PNG 目检（构图、比例、脸部、手部、留白、可读性）、XML 解析无错、体积在预算内、缩到实际 UI 尺寸（头像 64px、卡面 100px、CG 缩略 240px）仍可辨认。
