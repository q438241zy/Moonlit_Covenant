# 厚涂位图管线

画风统一参照 `public/assets/lia.png`（赤红高马尾那张）。用 AI 绘图接口批量生成约 107 张图：5 位女主立绘、48 套服装、10 张 CG、3 阶段 Boss、3 张舞台背景、38 张卡面。

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
