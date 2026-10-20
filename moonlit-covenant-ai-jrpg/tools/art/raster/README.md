# 厚涂位图管线

画风统一参照 `public/assets/lia.png`（赤红高马尾那张）。用 AI 绘图接口批量生成约 155 张图：8 位女主立绘（莉亚/米娅/塞雷娜已有 PNG，默认跳过）、48 套服装、10 张 CG、3 阶段 Boss、3 张舞台背景、38 张卡面，以及主线剧情的 29 张场景背景（来自 `public/story/locations.json`）和 16 张胸像（来自 `public/story/speakers.json`，同一文件只出一次）。游戏内的分组与尺寸见 `manifest.mjs` 的 `SIZE`，预留位清单 `public/assets/paint/README.md` 由 `readme.mjs` 从同一份清单生成（`npm run art` 的最后一步）。

## 一次性准备（云端环境设置）

1. Network access 选 Limited，在 Allowed domains 加入 `ark.cn-beijing.volces.com`（保留 Allow package managers 勾选）。
2. 添加环境变量 `ARK_API_KEY`（火山方舟控制台创建的 API Key），并在方舟控制台开通 Seedream 图片生成模型。
3. 新开一个会话（环境变更只对新会话生效）。

想用硅基流动时改为放行 `api.siliconflow.cn`（以及它返回图片的 CDN 域名），变量名为 `SILICONFLOW_API_KEY`，运行时加 `--provider siliconflow`。

## 运行

```bash
npm run art:paint -- --dry-run          # 只看提示词
npm run art:paint -- --limit 1          # 先试一张，确认画风
npm run art:paint                       # 全量（可中断，重跑自动续传）
npm run art:paint:finalize              # 压缩进 public/assets/paint/ 并生成 manifest.json
```

- 改某张图的描述：编辑 `manifest.mjs`，然后 `npm run art:paint -- --only card-n_goblin --force`。
- 模型 id 可用 `ARK_IMAGE_MODEL` 或 `--model` 覆盖（例如换成更新的 Seedream 版本）。
- 参考图会先裁掉右下角「图片由AI生成」标识区域，避免模型把水印画进新图。
- 服装立绘以该女主的立绘为第二张参考图，保持同一张脸；所以要先出立绘、再出服装（脚本会自动排序）。

## AIGC 标识（必须保留）

- 显式标识：旧 PNG 右下角的「图片由AI生成」，任何显示位置都不得裁切或遮挡。
- 隐式标识：服务商写在原图元数据里（PNG `eXIf`、JPEG Exif/XMP）。`finalize.mjs` 压缩时先 `-strip` 保证输出稳定，再用 `aigc.mjs` 把原图的 AIGC 元数据写回 JPEG 的 APP1 段；原图里没有时写入一段最小 EXIF（`ImageDescription = {"AIGC":{"Label":"1",…}}`）。`test/art-assets.test.mjs` 检查 `public/assets/paint/` 下每张 JPEG 都带 AIGC 信息。
- 旧的四张厚涂 PNG 的压缩版：`node tools/art/raster/compress-legacy.mjs` 生成 `public/assets/{lia,mia,serena,key-visual}.jpg`（渐进式，q86，不缩放不裁切，合计约 0.63MB，PNG 的 eXIf 原样保留），输出逐字节稳定。
- `ref/` 存放只作参考、不随站点发布的旧厚涂图（目前是 `dream-eater.png`）；`generate.mjs` 把 `public/assets/` 与 `ref/` 下的参考图都当作带可见标识的图，送去出图前先裁掉右下角标识区域。
