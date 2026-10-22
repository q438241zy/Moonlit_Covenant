# 月蚀契约：她们会记得你

**Moonlit Covenant — AI JRPG Web Vertical Slice**

一个可以直接运行的网页 JRPG：主线「亚克的旅程」（正史）按剧本逐字实现，所有关键抉择都是自由输入；IF 外传《银轨号》里，玩家能和三名队友自由交谈，AI 会记住承诺、道歉、夸奖与冒犯，这些关系会影响战术协同和最终评价。战斗、道具、剧情节点与结局由确定性游戏规则控制，不由语言模型擅自改写。

> 当前版本是用于验证玩法的可玩垂直切片，**不对外公开**（作者核#12）。游戏画面内的美术（立绘、服装、CG、卡面、地图、Boss、场景、主线背景与胸像、标题背景、UI 图标）统一使用本项目代码生成的**原创**矢量资产；AI 生成的厚涂图只能经由厚涂预留位替换，并显示统一的「AI 生成」角标（见下方「资产说明」）。正式销售前应替换为商业级立绘、CG、音乐与授权语音。

> **正典以 `设定集/` 与 `剧本/` 为准。** 银轨号是与正典平行的 IF 外传：外传里的人物身份（例如「赤誓骑士」莉亚）只在外传内成立，[`docs/CHARACTER-DESIGN.md`](docs/CHARACTER-DESIGN.md) 是外传专用设定，不是全作的事实来源；召唤卡池、角色管理器等外传以外的地方一律使用正典身份。

## 已实现内容

### 主线：亚克的旅程（正史，`/story.html`）

按 `剧本/` 逐字实现的视觉小说式主线，所有选择都是**自由输入**（无固定选项），进度逐拍保存在浏览器里，章末可把结果继承到下一章。

| 章节 | 标题 |
|---|---|
| ch000 | 序章｜黑翼焚麦之夜 |
| ch001 | 第一章｜导师 |
| ch002 | 第二章｜红发女孩（含街巷伏击自由战术战斗） |
| ch003 | 第三章｜临时契约 |
| ch004 | 第四章｜旧磨坊 |
| ch005 | 第五章｜大车之夜 |

第五章已由审阅稿升为**正式稿**（核#11）。每章约 11–24 分钟，预计时长见章节选择页（`public/story/chapters/index.json` 的 `estimatedMinutes`）。章节数据在 `public/story/chapters/`，格式与引擎见 [`docs/STORY-ENGINE.md`](docs/STORY-ENGINE.md)；校验与自动试玩：`npm run story:check`。

内容分级（作者核#13 第8条、核#14）：主线默认 **15+ 戏剧模式**（擦边与流血可以出现，但不露骨），设置里可随时切换 **12+ 柔和模式**（以剪影、遮挡与结果带过），两种模式的剧情、选择与结局完全相同。第一次进入主线时选择一次；已经存过设置的玩家沿用原来的模式，只看到一次「默认已改为 15+」的提示。两档共同禁区：裸露与性行为、性暴力、虐杀与肢解特写，未满 18 岁的角色永远不进擦边或血腥描写；主线判定器与外传聊天的模型提示词带同一份规则（外传还没有模式设置，按 12+）。细则见 `docs/STORY-ENGINE.md` §10。

### 标题页（`/`）

三个入口各有一张说明卡片：「主线：亚克的旅程」（进入 `/story.html`）、「外传：银轨号」（IF 外传，名字输入框在这张卡片里）、「实验模式：卡牌对战」（进入 `/cards.html`）。

### 银轨号 · IF 外传（`/`，标题页「外传：银轨号」）

- 完整序章：开场 → 战前自由对话 → 战术选择 → 回合制 Boss 战 → 战后对话 → 三种抉择 → 多档结局。
- 三名队友使用外传设定（赤誓骑士莉亚、猫耳机关师米娅、月蚀观测者塞雷娜），与正典身份不同，见 `docs/CHARACTER-DESIGN.md`（外传专用）。
- 每名角色拥有独立人设、知识边界、禁说秘密、说话风格、羁绊、信任、情绪与短期记忆。
- 战前最多 10 次自由交流；不是固定选项，也不要求猜关键词。战后对话最多 3 次；同一句话对同一角色只计一次分，承诺对每位角色只计一次。
- 三套主导战术与不同战斗收益；普攻、防御、治疗、羁绊技能、敌方回合、失败回卷。
- 隐藏 S 级路线：需要关系、承诺、战斗行为与最终选择共同满足条件。
- 世界地图（外传专用：城镇进度由外传进度推导，还没有内容的城镇显示「敬请期待」；主线入口是「赫麦村 · 亚克的故乡（主线）」）、CG 图库，以及银轨号 15 章「剧本草稿（只读）」阅读器（「章节」）。

### 召唤、换衣、商店与设置（同在 `/`）

- 召唤：角色池 / 服饰池，游戏内公示概率与保底；**只收钻石**（核#14；Credit 留给 AI 对话），抽到已拥有的条目会按稀有度折成钻石（见「钻石与奖励」）。卡池里的女主介绍使用正典身份（`设定集/03` 的基本资料、正典武器名与第一印象），不写正式章节尚未揭示的身世秘密。
- **登场闸门（封存卡）**：8 位女主从一开始就都在池里、照常能抽到，但在玩家通关她的**登场章**之前，卡池、召唤结果、换衣间与钻石页只显示剪影和「第N章登场」——名字、称号、立绘、介绍都不出现，她的服装同样封存。登场章：莉亚 04、米娅 07、塞雷娜 11、莉莉丝 13（敌对登场）、伊芙琳 16、艾拉 17、芙蕾娅 18、奥菲利亚 19；莉莉丝与艾拉的姓（以及莉莉丝的故国）到通关第 20 章才显示。进度取服务器记录的主线首通（`POST /api/story/progress`），通关登场章或之后任何一章都算。
- 女主在主线**正式入队时自动获得**（30 章入队表，`剧本/README_30章重構提案.md` §4.5）：莉亚 05、米娅 10、塞雷娜 12、伊芙琳 17、艾拉 18、芙蕾娅 19、奥菲利亚 20、莉莉丝 21（登记在卡池数据的 `joinChapter`，还没写出来的章节上线后自动生效）；之前已经抽到的按重复补偿折成钻石。角色池照常保留。
- 换衣：8 位女主 × 6 类服装；抽到的服装都会出现在换衣间（还没拥有对应女主的，列在「待解锁角色」里；女主还没登场的，以剪影列在「尚未登场」里，通关她的登场章后才能换装）。
- **典藏**（决定#31，`剧本/README_轉蛋服裝設計.md` §5.1）：原来的新年、圣诞、端午、周年庆四类改为典藏，显示名换成世界内的节庆——新历祭服、冬灯节服、龙舟祭服、纪念日礼服（稀有度不变）。它们退出常驻服饰池（抽不到），但服装 id 不变，已经拥有的照样能穿，换衣间在每位女主下面单列「典藏」一组（只列已拥有的）；对应番外上线时以限时池复刻。常驻服饰池暂时只有夏日度假服（5★）和女仆服（3★）两类，原样保留——真泳装重画、女仆改版和新增的婚礼 / 运动短袖 / OL 三类随美术阶段一起做。存档不需要迁移。
- 每类服装对应一篇将来的番外（`game/costume.mjs` 的 `BRANCH_SCENES`：番外 id、开放章节与入口文案），番外系统还没上线，界面显示「番外 · 敬请期待」。服装不是番外的解锁条件。
- 商店：会员、钻石充值保留为**演示用的免费补充**（没有真实支付，标价仅作展示）；由「演示工具」开关控制（见下文），本地运行默认开启。
- 设置：AI 模式说明、音效开关、后台管理入口。按玩家切换模型尚未实现，设置页不再展示模型预设（所有玩家共用服务器配置的 AI）。

### 卡牌对战《暗影对决》（`/cards.html`，实验模式）

暗影诗章式卡牌对战，标题页「实验模式：卡牌对战」进入：职业牌组、组牌、开包与合成、进化、对手 AI 回合逐步回放与对战日志。进化规则按 Shadowverse：每回合最多进化一次，当回合登场就进化的随从只获得「突进」（可以攻击随从，不能攻击主战者）；先后手由抛硬币决定。与主游戏共用同一个账户：获胜有钻石奖励（每天前 5 胜，见下文）。

### 钻石与奖励（`game/rewards.mjs`）

游戏不公开，但保留钻石、商店与召唤；钻石可以**靠玩获得**，商店的演示充值只是免费补充。

| 来源 | 钻石 | 说明 |
|---|---:|---|
| 每日签到 | 50 起，连签每天 +10，最多 +40（第 5 天起每天 90） | 按服务器本地日期每天一次，断签从第 1 天重新算 |
| 主线章节首次通关 | 每章 160 | 每章只发一次；同时发放在该章正式入队的女主 |
| 卡牌对战获胜 | 每胜 40 | 每天前 5 胜（每天最多 200），之后照常可以打 |
| 第一次进入卡牌对战 | 800 + 500 碎片 | 正好一次十连开包 |
| 新建账户（demo 模式） | 1,600 钻石 + 600 Credit | 核#15：抽卡只收钻石后提高起始钻石；Credit 只用于 AI 聊天 |

| 花费 | 价格 |
|---|---|
| 召唤（角色池 / 服饰池） | 只收钻石：单抽 80；十连 720 |
| 卡牌开包 | 单包 80 钻石；十连 800 钻石 |

重复补偿（召唤抽到已拥有的条目，含同一次十连里的第二份；主线入队时已经抽到的女主同样适用）：3★ 8 钻石（单抽的 10%）、4★ 16（20%）、5★ 160（两次单抽）。全部拥有后每抽的期望返还约为角色池 19、服饰池 13 钻石，远低于单抽价格，不会形成刷钻循环。

服饰池的标准概率是 5★ 3% / 4★ 17% / 3★ 80%。典藏退出后常驻表暂时没有 4★，那 17% 并进 3★，所以现在公示的是 5★ 3% / 3★ 97%（保底不变）；4★ 的 OL 装随美术阶段上线时恢复。

签到、首通与胜场记录存在服务器账户里（`account.rewards`），随存档一起保存。主线（`/story.html`）和卡牌页与主游戏共用浏览器里的同一个账户（`localStorage` 的 `moonlit:playerId`）。

### 原型页

- `/character-manager.html`：角色设定管理原型（使用正典身份）。
- 独立抽卡原型 `gacha-system` 已移到 `tools/prototypes/`，不再由服务器提供：它自成一套经济，数据只存在浏览器里，与正式游戏数据不互通。

### 工程

- `demo` 零成本保底对话引擎：无 API、无模型也能完整通关；`openai` 模式接入任何 OpenAI 兼容端点，默认适配本地 Ollama + Qwen3。
- JSON Schema 优先，端点不支持时降级为 JSON Object、普通响应；模型故障或越界时自动退回剧情保底台词。
- API Key 只保存在 Node 服务端，不暴露给浏览器。
- 存档持久化（`data/saves.json`），服务器重启不丢档。
- 请求体限制、严格 CSP 等安全响应头、剧情状态校验、单存档串行锁、总量上限与过期清理、AI 端点限流。
- 静态资源支持 ETag / 304 缓存校验。
- 自动化测试覆盖规则、AI 边界、HTTP 层、存档、部署内容与启动脚本。

## 本机启动

需要 Node.js 20 或更高版本。项目没有任何第三方 npm 依赖，不需要 `npm install`。

### Windows 快速开始

- **最简单：** 双击项目目录里的 `start-demo.cmd`。它会切到脚本所在目录、检查是否装了 Node.js、以 demo 模式启动服务器，并在约 2 秒后自动打开浏览器；出错时窗口会停下来显示原因。
- **用 `.env` 配置（例如接模型）：** 在项目目录打开 PowerShell：

  ```powershell
  Copy-Item .env.example .env; npm start
  ```

  如果 PowerShell 提示「无法加载 npm.ps1，因为在此系统上禁止运行脚本」，把 `npm start` 换成 `npm.cmd start` 或 `node server.mjs` 即可（效果相同）。

### Linux / macOS

```bash
cd moonlit-covenant-ai-jrpg
cp .env.example .env
npm start
```

或者一键演示（可以从任何目录执行）：

```bash
sh moonlit-covenant-ai-jrpg/start-demo.sh
```

浏览器打开：

```text
http://127.0.0.1:4173
```

注意：

- `start-demo.cmd` / `start-demo.sh` **强制使用 demo 模式**（`AI_MODE=demo`），会忽略 `.env` 里的 `AI_MODE`；要接模型请用 `npm start`。
- `.env` 从项目根读取，从哪个目录启动都一样；命令行里已经设置的环境变量优先于 `.env`。
- 开发时可用 `npm run dev`（`node --watch`，改代码后自动重启）。
- 端口被占用时服务器会提示换端口：bash 用 `PORT=4174 npm start`，PowerShell 用 `$env:PORT=4174; npm start`，cmd 用 `set PORT=4174` 后再运行 `start-demo.cmd`。

公开试玩时可在 `.env` 中设置转化链接，标题页与结局页会自动显示 CTA：

```dotenv
WISHLIST_URL=https://store.steampowered.com/app/你的AppID
COMMUNITY_URL=https://你的社群链接
```

## 配置项

全部写在 `.env`（模板见 `.env.example`）或环境变量里：

| 变量 | 默认值 | 说明 |
|---|---|---|
| `AI_MODE` | `demo` | `demo`：确定性保底对话；`openai`：OpenAI 兼容端点 |
| `AI_BASE_URL` / `AI_API_KEY` / `AI_MODEL` | `http://127.0.0.1:11434/v1` / `ollama` / `qwen3:8b` | 模型端点（只在服务端使用） |
| `AI_TIMEOUT_MS` | `15000` | 单次模型调用超时 |
| `HOST` / `PORT` | `127.0.0.1` / `4173` | 监听地址与端口 |
| `WISHLIST_URL` / `COMMUNITY_URL` | 空 | 标题页、结局页的转化链接 |
| `ADMIN_KEY` | 不设置 = 默认口令 `123456` | 后台管理口令；设为空字符串（`ADMIN_KEY=`）则关闭后台 |
| `DEMO_TOOLS` | 空 = 开启（production 下关闭；Docker 镜像与 compose 已设为 `1`） | `1` 强制开启、`0` 强制关闭演示工具 |
| `NODE_ENV` | 空 | `production` 时演示工具默认关闭（Docker 镜像设置了 `NODE_ENV=production`，同时用 `DEMO_TOOLS=1` 保持开启） |
| `PERSIST` | 空 = 开启（`node --test` 下关闭） | `0` 关闭存档持久化 |
| `SAVE_FILE` | `data/saves.json` | 存档文件位置（相对路径以项目根为基准） |
| `MAX_SESSIONS` / `MAX_ACCOUNTS` | `2000` / `2000` | 外传会话、账户总量上限，满了先清理过期数据，仍满返回 503 |

### 存档与过期

- 外传进度、召唤 / 换衣 / 会员、钻石奖励记录（签到、主线首通、对战胜场）、卡牌收藏与对局都由服务器保存在 `data/saves.json`：状态变化后约 1 秒落盘（先写临时文件再改名），关闭服务器（Ctrl+C）时立即落盘，重启后自动恢复。
- 存档文件损坏时会被改名为 `saves.json.corrupt-<时间戳>` 留作排查，服务器以空存档启动。
- 过期规则：外传会话与卡牌对局 **24 小时无操作**后清理；账户（召唤、换衣、会员、卡牌收藏）**闲置 90 天**后清理。
- 主线「亚克的旅程」的阅读进度保存在浏览器的 localStorage 里，不在服务器上；只有「哪些章节已经首次通关」（用来发首通奖励和入队女主）记在服务器账户里。
- `data/` 已在 `.gitignore` 和 `.dockerignore` 里，不会进仓库或镜像。备份时复制 `data/saves.json` 即可。
- 临时试玩或测试时用 `PERSIST=0` 关闭持久化；`npm test` 会自动关闭，不会写脏 `data/`。

### 后台管理

- 入口：标题页 →「设置」→「后台管理」，输入管理口令。
- 口令由服务器校验，**只认请求头 `x-admin-key`**（URL 里的 `?key=` 不生效），前端不保存任何口令。
- 不设置 `ADMIN_KEY` 时使用默认口令 `123456`，开箱即用；**对外开放前务必在 `.env` 里设置自己的 `ADMIN_KEY`**。写成 `ADMIN_KEY=`（空值）表示关闭后台，接口返回 404。
- 命令行查看：

  ```bash
  curl -H "x-admin-key: 123456" http://127.0.0.1:4173/api/admin/dashboard
  ```

### 演示工具

商店里的免费开通会员、免费领取钻石，以及换衣间的「一键发放全部服装」都属于演示工具，没有真实支付。这个版本不公开，商店作为免费补充保留：本地运行默认开启；Docker 镜像与 compose 也设了 `DEMO_TOOLS=1`，保持开启（作者核#12：这个版本不公开）；其他 `NODE_ENV=production` 环境默认关闭，要保留商店请加 `DEMO_TOOLS=1`；`DEMO_TOOLS=0` 强制关闭。关闭时这三个接口返回 403 `DEMO_TOOLS_DISABLED`，前端也会隐藏对应入口。签到、首通、对战胜利这些「玩出来的钻石」不受这个开关影响。

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

页面上的 AI 标识和「设置」页会显示当前 AI 模式和模型名。模型超时、返回格式错误或说出禁区内容时，系统会自动使用角色保底台词，主线不会卡死。`openai` 模式下每个 IP 每分钟最多 20 次模型调用、全局最多 3 个并发，超出时直接使用保底台词。

### 模型档位建议

- 低配验证：Qwen3 4B 量化版。
- 标准本地体验：Qwen3 8B 量化版。
- 服务器增强：14B、30B-A3B 或其他 OpenAI 兼容模型。
- 正式产品应在目标显卡上实测首字延迟、上下文占用、并发与角色一致性，不要只看模型参数量。

## Docker

运行零成本演示模式（`moonlit-data` 卷用来保存存档，删掉 `-v ...` 则容器删除后存档随之消失）：

```bash
docker build -t moonlit-covenant .
docker run --rm -p 4173:4173 -e AI_MODE=demo -v moonlit-data:/app/data moonlit-covenant
```

也可使用（已配置好 `moonlit-data` 命名卷）：

```bash
docker compose up --build
```

- 镜像里 `NODE_ENV=production`，但同时设了 `DEMO_TOOLS=1`：这个版本不公开，商店的免费补充保持开启（作者核#12）；要关掉就 `-e DEMO_TOOLS=0`（compose 在 `.env` 里写 `DEMO_TOOLS=0`）。
- 后台口令：`-e ADMIN_KEY=你的口令`；用 compose 时在项目目录的 `.env` 里写 `ADMIN_KEY=...` 即可传进容器，不写则使用默认口令。
- 容器以非 root 的 `node` 用户运行，自带健康检查（`/api/health`）。
- 容器调用宿主机 Ollama 时，macOS/Windows 通常使用 `http://host.docker.internal:11434/v1`（compose 的默认值；如果 `.env` 里写的是 `127.0.0.1`，用 compose 前要改掉）；Linux 已在 compose 里配置 host gateway，也可以把 Ollama 与游戏服务部署在同一 Docker 网络。

## 测试与检查

```bash
npm test               # 全部自动化测试（node --test），含部署内容与启动脚本测试
npm run check          # 全量语法检查：public、game、cards、scenario、tools、test 下所有 .js/.mjs 逐个 node --check，并校验 JSON
npm run story:check    # 主线章节校验 + 自动试玩（意图覆盖）
npm run test:cards     # 只跑卡牌相关测试
npm run test:deploy    # 只跑部署内容测试（按 Dockerfile 的 COPY 拼出镜像内容并实际启动）
```

健康检查：

```bash
curl http://127.0.0.1:4173/api/health
```

## 目录

```text
server.mjs              零依赖 HTTP 服务：API、会话锁、存档、静态文件（严格 CSP、ETag/304）
game/
  content.mjs           银轨号外传的世界观、角色、战术、敌人、CG 图库与结局内容
  engine.mjs            外传确定性状态机：关系、战斗与结局判定
  ai.mjs                本地/云端模型适配、结构化输出、验证与保底台词
  story-judge.mjs       主线自由输入的服务端判定
  gacha.mjs             召唤卡池（角色池 / 服饰池、概率与保底、钻石价格、重复补偿、女主登场 / 入队章节与封存卡视图）
  rewards.mjs           玩出来的钻石：每日签到、主线首通、卡牌胜利、女主自动入队
  costume.mjs           换衣系统
  membership.mjs        会员与钻石充值（演示，无真实支付）
  credit.mjs            Credit 计量（只用于 AI 对话，不能召唤）
  settings.mjs          AI 模型预设目录（按玩家路由实现前不对玩家开放）
  analytics.mjs         运营统计（后台仪表板）
  persist.mjs           存档持久化（data/saves.json）
cards/                  卡牌对战引擎：卡牌数据、对局规则、对手 AI、组牌、开包与合成
scenario/               银轨号外传 15 章剧本草稿（chapter-01…15.json）与读取器
public/
  index.html, app.js    主游戏：标题页、IF 外传、地图、剧本草稿阅读器、召唤、换衣、商店、设置
  styles.css, icons.js, paint.js   主游戏样式、原创线性图标库、厚涂图替换清单读取
  story.html            主线「亚克的旅程」
  story/                主线播放器（player.js）、纯函数引擎（engine.js）、内容分级设置（rating.js）、章节数据（chapters/）、角色与场景表
  cards.html, cards.js, cards.css   卡牌对战（实验模式）
  character-manager.html 角色设定管理原型
  assets/               美术资产（矢量 SVG 由 tools/art/ 生成，详见「资产说明」）
tools/
  art/                  矢量美术生成器（立绘、服装、CG、卡面、地图、Boss、场景、主线背景与胸像）与厚涂出图管线（raster/）
  story/check.mjs       主线章节校验与自动试玩
  check-syntax.mjs      全量语法检查（npm run check）
  prototypes/           不随站点提供的原型（独立抽卡页 gacha-system）
test/                   规则、AI 边界、HTTP 层、存档、经济、卡牌、主线、美术与部署测试
docs/                   市场、架构、美术规范、剧情引擎与发行清单
data/                   运行时存档（自动生成，不进仓库）
start-demo.cmd / .sh    一键演示启动脚本（Windows / Linux、macOS）
Dockerfile, docker-compose.yml
```

## 资产说明

### 原创矢量美术（代码生成）

全部按 [`docs/ART-DIRECTION.md`](docs/ART-DIRECTION.md)（月蚀琉璃矢量风）绘制，由 `tools/art/` 下的零依赖 Node 脚本生成为自包含 SVG：无脚本、无外部引用、无位图、无 `<text>`。这套矢量美术为本项目原创，不临摹现有作品、不含第三方角色或商标素材。

| 资产 | 路径 | 生成器 / 命令 |
|---|---|---|
| 8 位女主胸像立绘 | `public/assets/portraits/<id>.svg` | `tools/art/portrait/` · `npm run art:portraits` |
| 48 套服装立绘（8 人 × 6 套） | `public/assets/costumes/<id>_<type>.svg` | 同上（`npm run art:portraits` 一并产出） |
| 卡牌卡面（基础 + 进化版 `_e`） | `public/assets/cards/<cardId>.svg` | `tools/art/cards/`、`tools/art/build-cards.mjs` · `npm run art:cards` |
| 剧情 CG | `public/assets/cg/<name>.svg` | `tools/art/cg/` |
| 世界地图 | `public/assets/map/world-map.svg` | `tools/art/map/build-map.mjs` |
| 食梦兽三阶段（完整 / 破甲 / 封印） | `public/assets/boss/dream-eater-{1,2,3}.svg` | `tools/art/boss/` |
| 舞台背景与 UI 元素 | `public/assets/scenes/*.svg`、`public/assets/ui/*.svg` | `tools/art/stage/` |
| 主线场景背景与角色胸像 | `public/assets/story/bg/*.svg`、`public/assets/story/npc/*.svg` | `tools/art/story/` |
| UI 图标 | `public/icons.js` | 手写，`import { icon } from './icons.js'` |

一键重建全部矢量资产：`npm run art`（按依赖顺序调用上述生成器，输出确定、可复现）。

厚涂位图预留位：`public/assets/paint/`（文件名清单见该目录 README）。登记在 `manifest.json` 里的厚涂图会自动替换对应矢量图，未登记的继续用矢量；出图管线见 [`tools/art/raster/README.md`](tools/art/raster/README.md)（`npm run art:paint` / `art:paint:finalize`）。

游戏内的使用方式：游戏画面统一使用矢量美术，同一位女主在同一屏只有一种画风；标题背景是由现有矢量组件拼成的 `public/assets/title-bg.svg`；召唤与换衣统一使用矢量立绘（换衣间会显示当前穿着的服装立绘；莉亚的立绘与服装都带正典的塔盾）；大地图以 `world-map.svg` 为底图，城镇徽章使用 `icons.js` 图标；剧情舞台使用 CG / 场景作为背景；Boss 战按 HP 阶段切换三张食梦兽立绘；结局页叠加结局背景、对应抉择的 CG，隐藏路线显示月蚀纹章；解锁 CG 时会弹出一次非阻塞提示，并收录进 CG 图库。

### AI 生成的厚涂图

游戏画面里不直接放位图女主：厚涂图只能通过 `public/assets/paint/` 的预留位整体替换矢量图，`paint()` 返回厚涂图时界面角落会显示统一的「AI 生成」角标。

莉亚、米娅、塞雷娜三张旧的主角厚涂立绘与旧主视觉 `key-visual` 为 AI 生成图像，画面右下角带有依法标注的「图片由AI生成」。这些 JPG 仍在 `public/assets/{lia,mia,serena,key-visual}.jpg`（压缩版，由 `npm run art:legacy-jpg`，即 `tools/art/raster/compress-legacy.mjs`，从 `tools/art/raster/ref/` 下的原图 PNG 生成，不缩放不裁切，保留 AIGC 元数据；原图 PNG 只作出图参考，不随站点发布）；旧的 Boss 厚涂图 `dream-eater.png` 已由矢量三阶段 Boss 取代，移到 `tools/art/raster/ref/` 只作出图参考。任何显示位置都**不得裁切或遮挡该标识**——如果用到这些图片，按原图比例显示，小尺寸头像改用矢量立绘。

## API 摘要

所有接口返回 JSON：成功为 `{ ok: true, ... }`，失败为 `{ ok: false, error: { code, message } }`。玩家相关接口以 `playerId`（账户）或 `sessionId`（外传存档）标识，格式不对返回 400；未知的 `/api/*` 返回 404。

**基础**

- `GET /api/health`：服务状态与 AI 模式。
- `GET /api/meta`：标题、AI 模式、`admin.enabled`、`demoTools`、转化链接、公开角色、战术和结局选项。
- `GET /api/gallery?sessionId=`：CG 图库与解锁情况。

**银轨号外传**

- `POST /api/session`：创建新游戏（`{ playerName }`）。
- `GET /api/session/:id`：恢复存档。
- `POST /api/advance`、`/api/strategy`、`/api/mode`、`/api/chat`、`/api/battle`、`/api/reset-battle`、`/api/ending`、`/api/restart`：推进场景、选择战术、切换对话模式、与角色交谈、战斗动作、战败回卷、最终抉择、重开；请求体都带 `sessionId`。
- `GET /api/scenario/index`、`GET /api/scenario/chapter/:id`：外传剧本草稿目录与章节（只读）。

**主线「亚克的旅程」**

- `POST /api/story/judge`：自由输入判定（节点定义由服务器从章节文件读取）；`context.mode`（`15+` / `12+`，缺省按 `12+`）只决定提示词里的内容分级规则。
- `POST /api/story/progress`：`{ playerId, chapterId }` 报告章节通关（契约 R-2）。章节必须在 `public/story/chapters/index.json` 里，否则 400 `UNKNOWN_CHAPTER`；幂等，首次通关才发奖励。返回 `{ granted, diamonds, chapterReward, heroinesGranted, heroinesCompensated, alreadyCleared, chaptersCleared, balance, account }`：`granted` 表示这次是否发了任何东西，`diamonds` 是这次发的钻石总数（首通奖励 + 已拥有女主的补偿），`heroinesGranted` 是这次加入 `ownedCharacters` 的女主 id，`balance` 是发放后的钻石余额。

**钻石奖励**

- `GET /api/rewards/status?playerId=`（契约 R-1）：`{ dailyAvailable, streak, nextAt, dailyAmount, chaptersCleared, chapterReward, cardWinsToday, cardWinCap, cardWinReward, heroineJoins, heroinesJoined, diamonds, recent, rules }`。`streak` 是仍然有效的连签天数（今天或昨天签过，否则 0），`dailyAmount` 是下一次签到的数量，`nextAt` 是下一个本地零点（毫秒时间戳），`cardWinsToday` 是今天已经拿到奖励的胜场数。
- `POST /api/rewards/daily`：`{ playerId }` 每日签到（契约 R-1），返回 `{ granted, diamonds, streak, nextAt, balance, message, account }`；当天重复签到 `granted: false`、`diamonds: 0`。

**账户、召唤、换衣与商店**

- `POST /api/account/create`、`GET /api/account?playerId=`：创建 / 读取账户。
- `GET /api/credit?playerId=`：Credit 余额。
- `GET /api/gacha/pools?playerId=`：卡池、概率与保底，以及 `currency: 'diamonds'`、`costs`（`{ diamonds: { single, ten } }`）、`duplicateCompensation`（`{ 3: 8, 4: 16, 5: 160 }`）、`heroineJoins`（女主 id → 入队章节）、`progress: { highestCleared }`。`characters` / `costumes` 是按这个玩家主线进度的对外视图：还没登场的女主是 `{ id, rarity, sealed: true, name: '？？？', title: '？？？', unlockChapter, joinChapter, debutLabel }`（`debutLabel` 形如「第13章登场」），她的服装是 `{ id, characterId, type, rarity, sealed: true, name: '？？？·女仆服', unlockChapter, debutLabel }`（没有立绘路径）；已登场的带完整资料与 `sealed: false`。不带 `playerId`（或账户不存在）按零进度。
- `POST /api/gacha/pull`：`{ playerId, pool, count }` 召唤，只收钻石；`currency` 可以省略或写 `'diamonds'`，旧前端传来的 `'credit'` 返回 400 `DIAMONDS_ONLY`、不扣任何东西。返回 `{ pool, currency: 'diamonds', results, cost, pity, compensation: { diamonds }, balance: { diamonds }, account }`，`results[i]` 是同一个登场闸门下的视图，另带 `isNew`、`duplicate`、`compensation`；钻石不足返回 400 `INSUFFICIENT_DIAMONDS`。
- `GET /api/costume?playerId=`、`POST /api/costume/equip`：服装列表（`costumePool` 同样按登场闸门给视图）、穿戴。
- `GET /api/membership/tiers`：会员档位与钻石包。
- 演示工具（`DEMO_TOOLS`，关闭时 403）：`POST /api/membership/purchase`、`POST /api/diamonds/purchase`、`POST /api/costume/grant-all`。
- `GET /api/settings/ai?playerId=`：`{ perPlayerRouting: false, current, models: [], settings }`，`current` 是所有玩家共用的 AI（同 `/api/meta` 的 `ai`）；按玩家路由实现前不下发模型预设。`POST /api/settings/ai` 对存在的账户返回 409 `PER_PLAYER_ROUTING_UNAVAILABLE`。

**卡牌对战**

- `GET /api/cards/meta`、`GET /api/cards/all`：职业、稀有度、关键词与全部卡牌。
- `GET /api/cards/collection`、`GET /api/cards/summary`、`POST /api/cards/pack`、`POST /api/cards/craft`：收藏、碎片 / 开包保底 / 钻石概况、开包、合成。
- `GET /api/cards/decks`、`GET /api/cards/deck/starter`、`POST /api/cards/deck/save`：牌组。
- `POST /api/battle/start`、`GET /api/battle/state`、`POST /api/battle/action`、`POST /api/battle/end-turn`、`POST /api/battle/concede`：对局（对手手牌只下发 `{ uid, hidden }`）。抛硬币由对手先手时，`/api/battle/start` 会先跑完对手的第一回合，并在 `aiActions` 里返回这些动作，玩家拿到的总是自己的回合。
- 胜利奖励（契约 R-3）：对局以玩家获胜结束时服务器发放一次（每天前 5 胜各 40 钻石），这几个对局接口在对局结束后都带 `reward: { diamonds, capped, winsToday, cap, balance }`（`capped: true` 表示今天的奖励胜场已满、这局 0 钻石）；进行中、输了、平局或投降时 `reward` 为 `null`。

**后台**

- `GET /api/admin/dashboard`：运营仪表板，请求头 `x-admin-key` 携带口令；口令错误 403，后台关闭时 404。

**静态文件**：`/` 返回 `index.html`；`/story`、`/cards` 这类路径 301 到同名 `.html`；不存在的文件返回 404；所有资源带 `ETag`，未修改时返回 304。

## 从垂直切片到正式销售版

正式上线前至少需要补齐：

1. 商业级角色立绘、表情差分、战斗特效、音乐、音效与合法授权语音。
2. 2–3 小时的第一章、更多敌人与成长系统；当前序章主要验证“自由对话真的影响 JRPG”。
3. 数据库持久化（当前为单机 JSON 文件）、账号体系、全面限流、观测、备份和水平扩展。
4. 内容安全分类、玩家举报、模型/提示词版本记录、输出审计与隐私政策。
5. 简中、繁中、日文、英文的人工本地化与角色语气校对。
6. Steam 商店页、试玩版漏斗、愿望单 CTA、崩溃报告、成就与云存档。
7. 对实时生成 AI 内容进行准确披露，并说明防护措施。

上线前的逐项检查见 [`docs/RELEASE-CHECKLIST.md`](docs/RELEASE-CHECKLIST.md)。更完整的商业规划见 [`docs/PRODUCT-MARKET-PLAN.md`](docs/PRODUCT-MARKET-PLAN.md)，技术方案见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)，商店文案与素材外包规范分别见 [`docs/STORE-PAGE-COPY.md`](docs/STORE-PAGE-COPY.md) 和 [`docs/ART-AUDIO-BRIEF.md`](docs/ART-AUDIO-BRIEF.md)。

## 权利与注意事项

- 仓库代码为本项目定制，`package.json` 标记为 `UNLICENSED`，不会自动授予第三方再分发权。
- `public/assets/` 下的矢量 SVG 与 `public/icons.js` 为本项目代码生成的原创美术，不含抓取的动漫角色或品牌素材。
- AI 生成的厚涂图必须保留「图片由AI生成」标识，不得裁切、遮挡或去除。
- 正式版不要使用未经授权的角色、配音演员声音、训练素材、音乐或商标。
- 本仓库没有真实支付和正式用户账号体系（商店为演示功能）；上线收款仍需绑定域名、托管、支付/Steamworks 账号，并完成相应审核。
