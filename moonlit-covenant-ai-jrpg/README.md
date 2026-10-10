# 月蚀契约：她们会记得你

**Moonlit Covenant — AI JRPG Web Vertical Slice**

一个可以直接运行的网页 JRPG 序章：玩家能和三名队友自由交谈，AI 会记住承诺、道歉、夸奖与冒犯；这些关系会影响战术协同和最终评价。战斗、道具、剧情节点与结局由确定性游戏规则控制，不由语言模型擅自改写。

> 当前版本是用于验证玩法和商业方向的可玩垂直切片。游戏内的矢量美术（立绘、服装、CG、卡面、地图、Boss、场景与 UI 图标）均为本项目代码生成的**原创**资产；三张主角厚涂立绘与主视觉 PNG 为 AI 生成并带有「图片由AI生成」标识（见下方「资产说明」）。正式销售前应替换为商业级立绘、CG、音乐与授权语音。

## 已实现内容

- **主线 · 亚克篇（`/story.html`）**：按 `剧本/` 逐字实现序章《黑翼焚麦之夜》、第一章《导师》、第二章《红发女孩》。视觉小说式演出，所有选择都是**自由输入**（无固定选项），第二章街巷伏击为自由战术战斗；进度存于浏览器，可章末继承到下一章。格式与引擎见 [`docs/STORY-ENGINE.md`](docs/STORY-ENGINE.md)，校验与自动试玩：`npm run story:check`。
- **银轨号外传**：以下为原有的 AI 对话垂直切片。
- 完整序章：开场 → 战前自由对话 → 战术选择 → 回合制 Boss 战 → 战后对话 → 三种抉择 → 多档结局。
- 三名宅向队友：赤誓骑士莉亚、猫耳机关师米娅、月蚀观测者塞蕾娜。
- 每名角色拥有独立人设、知识边界、禁说秘密、说话风格、羁绊、信任、情绪与短期记忆。
- 战前最多六轮自由输入；不是固定选项，也不要求猜关键词。
- 三套主导战术与不同战斗收益。
- 普攻、防御、治疗、羁绊技能、敌方回合、失败回卷。
- 隐藏 S 级路线：需要关系、承诺、战斗行为与最终选择共同满足条件。
- `demo` 零成本保底对话引擎：无 API、无模型也能完整通关。
- `openai` 模式：接入任何 OpenAI 兼容端点，默认适配本地 Ollama + Qwen3。
- JSON Schema 优先、JSON Object 次选、普通响应最后兜底；模型故障时自动退回剧情保底台词。
- API Key 只保存在 Node 服务端，不暴露给浏览器。
- 请求体限制、安全响应头、剧情状态校验、单存档串行锁、24 小时过期清理。
- 自动化测试与完整 API 流程已通过。

## 本机启动

需要 Node.js 20 或更高版本。项目没有第三方 npm 运行依赖。

```bash
cd moonlit-covenant-ai-jrpg
cp .env.example .env
npm start
```

浏览器打开：

```text
http://127.0.0.1:4173
```

默认 `AI_MODE=demo`，立即可玩。

公开试玩时可在 `.env` 中设置转化链接，标题页与结局页会自动显示 CTA：

```dotenv
WISHLIST_URL=https://store.steampowered.com/app/你的AppID
COMMUNITY_URL=https://你的社群链接
```

## 接入本地 Qwen3 + Ollama

先准备 Ollama，并拉取模型：

```bash
ollama pull qwen3:8b
```

把 `.env` 改为：

```dotenv
AI_MODE=openai
AI_BASE_URL=http://127.0.0.1:11434/v1
AI_API_KEY=ollama
AI_MODEL=qwen3:8b
AI_TIMEOUT_MS=15000
PORT=4173
HOST=127.0.0.1
```

重新启动：

```bash
npm start
```

页面右上角会显示当前 AI 模式和模型名。模型超时、返回格式错误或说出禁区内容时，系统会自动使用角色保底台词，主线不会卡死。

### 模型档位建议

- 低配验证：Qwen3 4B 量化版。
- 标准本地体验：Qwen3 8B 量化版。
- 服务器增强：14B、30B-A3B 或其他 OpenAI 兼容模型。
- 正式产品应在目标显卡上实测首字延迟、上下文占用、并发与角色一致性，不要只看模型参数量。

## Docker

运行零成本演示模式：

```bash
docker build -t moonlit-covenant .
docker run --rm -p 4173:4173 -e AI_MODE=demo moonlit-covenant
```

也可使用：

```bash
docker compose up --build
```

容器调用宿主机 Ollama 时，macOS/Windows 通常使用 `http://host.docker.internal:11434/v1`；Linux 可配置 host gateway，或把 Ollama 与游戏服务部署在同一 Docker 网络。

## 测试

```bash
npm run check
npm test
```

健康检查：

```bash
curl http://127.0.0.1:4173/api/health
```

## 目录

```text
public/                 网页 UI、CSS、前端状态渲染
public/icons.js         原创线性 UI 图标库（ES module，内联 SVG，继承 currentColor）
public/assets/          美术资产（矢量 SVG 由 tools/art/ 生成，详见「资产说明」）
game/content.mjs        世界观、角色、战术、敌人、CG 图库与结局内容
game/engine.mjs         确定性剧情状态机、关系、战斗与结局判定
game/gacha.mjs          召唤卡池（角色池 / 服饰池、概率与保底）
game/costume.mjs        换衣系统与服装分支剧情
game/ai.mjs             本地/云端模型适配、结构化输出、验证与保底
server.mjs              零依赖 HTTP 服务、API、会话锁与静态文件服务（严格 CSP）
tools/art/              矢量美术生成器（立绘、服装、CG、卡面、地图、Boss、场景）
test/                   游戏规则与 AI 边界测试
docs/                   市场、架构、美术规范与发行清单
```

## 资产说明

### 原创矢量美术（代码生成）

全部按 [`docs/ART-DIRECTION.md`](docs/ART-DIRECTION.md)（月蚀琉璃矢量风）绘制，由 `tools/art/` 下的零依赖 Node 脚本生成为自包含 SVG：无脚本、无外部引用、无位图、无 `<text>`。这套矢量美术为本项目原创，不临摹现有作品、不含第三方角色或商标素材。

| 资产 | 路径 | 生成器 / 命令 |
|---|---|---|
| 8 位女主胸像立绘 | `public/assets/portraits/<id>.svg` | `tools/art/portrait/` · `npm run art:portraits` |
| 48 套服装立绘（8 人 × 6 套） | `public/assets/costumes/<id>_<type>.svg` | 同上（`npm run art:portraits` 一并产出） |
| 卡牌卡面（38 张基础 + 进化版 `_e`） | `public/assets/cards/<cardId>.svg` | `tools/art/cards/`、`tools/art/build-cards.mjs` · `npm run art:cards` |
| 10 张剧情 CG | `public/assets/cg/<name>.svg` | `tools/art/cg/` |
| 世界地图 | `public/assets/map/world-map.svg` | `tools/art/map/build-map.mjs` |
| 食梦兽三阶段（完整 / 破甲 / 封印） | `public/assets/boss/dream-eater-{1,2,3}.svg` | `tools/art/boss/` |
| 舞台背景与 UI 元素 | `public/assets/scenes/*.svg`、`public/assets/ui/*.svg` | `tools/art/stage/` |
| UI 图标 | `public/icons.js` | 手写，`import { icon } from './icons.js'` |

一键重建全部矢量资产：`npm run art`（按依赖顺序调用上述生成器，输出确定、可复现）。

厚涂位图预留位：`public/assets/paint/`（文件名清单见该目录 README）。登记在 `manifest.json` 里的厚涂图会自动替换对应矢量图，未登记的继续用矢量；出图管线见 `tools/art/raster/`（`npm run art:paint` / `art:paint:finalize`）。

游戏内的使用方式：召唤与换衣统一使用矢量立绘（换衣间会显示当前穿着的服装立绘）；大地图以 `world-map.svg` 为底图，城镇徽章使用 `icons.js` 图标；剧情舞台使用 CG / 场景作为背景；Boss 战按 HP 阶段切换三张食梦兽立绘；结局页叠加结局背景、对应抉择的 CG，隐藏路线显示月蚀纹章；解锁 CG 时会弹出一次非阻塞提示，并收录进 CG 图库。

### AI 生成的厚涂 PNG

`public/assets/{lia,mia,serena,key-visual,dream-eater}.png` 为 AI 生成图像，画面右下角带有依法标注的「图片由AI生成」。三张主角 PNG 用于标题页与剧情场景（保留更高的绘制精度），`key-visual.png` 为标题页主视觉；`dream-eater.png` 已由矢量三阶段 Boss 取代，仅作备用素材。任何显示位置都**不得裁切或遮挡该标识**——UI 按原图比例显示这些图片，小尺寸头像改用矢量立绘。

## API 摘要

- `GET /api/health`：服务和 AI 模式状态。
- `GET /api/meta`：公开角色、战术和结局选项。
- `POST /api/session`：创建新游戏。
- `GET /api/session/:id`：恢复当前服务器内存中的游戏。
- `POST /api/advance`：推进到营地或战斗。
- `POST /api/chat`：与指定角色交谈。
- `POST /api/strategy`：选择主导战术。
- `POST /api/battle`：提交战斗动作。
- `POST /api/reset-battle`：战败回卷。
- `POST /api/ending`：提交黎明种最终抉择。
- `POST /api/restart`：以同一玩家名重开。

## 从垂直切片到正式销售版

正式上线前至少需要补齐：

1. 商业级角色立绘、表情差分、战斗特效、音乐、音效与合法授权语音。
2. 2–3 小时的第一章、更多敌人与成长系统；当前序章主要验证“自由对话真的影响 JRPG”。
3. PostgreSQL/Redis 持久化、账号体系、限流、观测、备份和水平扩展。
4. 内容安全分类、玩家举报、模型/提示词版本记录、输出审计与隐私政策。
5. 简中、繁中、日文、英文的人工本地化与角色语气校对。
6. Steam 商店页、试玩版漏斗、愿望单 CTA、崩溃报告、成就与云存档。
7. 对实时生成 AI 内容进行准确披露，并说明防护措施。

更完整的商业规划见 [`docs/PRODUCT-MARKET-PLAN.md`](docs/PRODUCT-MARKET-PLAN.md)，技术方案见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)，商店文案与素材外包规范分别见 [`docs/STORE-PAGE-COPY.md`](docs/STORE-PAGE-COPY.md) 和 [`docs/ART-AUDIO-BRIEF.md`](docs/ART-AUDIO-BRIEF.md)。

## 权利与注意事项

- 仓库代码为本项目定制，`package.json` 标记为 `UNLICENSED`，不会自动授予第三方再分发权。
- `public/assets/` 下的矢量 SVG 与 `public/icons.js` 为本项目代码生成的原创美术，不含抓取的动漫角色或品牌素材。
- AI 生成的 PNG 必须保留「图片由AI生成」标识，不得裁切、遮挡或去除。
- 正式版不要使用未经授权的角色、配音演员声音、训练素材、音乐或商标。
- 本仓库没有支付、用户账号或公开托管配置；上线收款仍需绑定域名、托管、支付/Steamworks 账号，并完成相应审核。
