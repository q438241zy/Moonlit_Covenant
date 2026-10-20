# 技术架构与本地模型方案

## 1. 设计原则

这个项目不让语言模型直接控制游戏世界。

```text
玩家输入
  ↓
角色模型：提议台词、情绪、关系变化、记忆摘要、战术提示
  ↓
边界验证：长度、枚举、禁说秘密、数值范围、越权文本
  ↓
确定性引擎：提交羁绊、信任、战斗动作、剧情状态与结局
  ↓
前端渲染
```

因此模型即使声称“Boss 已死亡”或“我给你十瓶药”，也不会改变任何游戏状态。

## 2. 当前模块

### `game/content.mjs`

保存作者可控的内容资产：

- 角色身份、说话风格、价值观；
- 已知事实与尚未解锁的秘密；
- 禁说词；
- 战术、敌人、开场事件和最终选择。

### `game/engine.mjs`

确定性状态机：

- 创建与清洗玩家存档；
- 场景推进；
- 对话结果提交；
- 羁绊、信任、记忆和承诺标记；
- 回合战斗、伤害、焦点、药水、羁绊技能；
- 战败回卷；
- 结局条件与 S 级路线判定。

### `game/ai.mjs`

角色即兴层：

- `AI_MODE=demo`：规则分类 + 手写角色台词；
- `AI_MODE=openai`：调用 OpenAI 兼容 `/chat/completions`；
- JSON Schema → JSON Object → 普通请求三档兼容：只有上游明确拒绝 `response_format`（HTTP 400/422）时才降一级重试；
- 超时、接口错误、内容不是合法 JSON 或命中禁区时，不再重试，直接退回角色保底台词；
- API Key 仅在服务端使用；`.env` 从项目根读取（找不到才退回当前目录），已有环境变量优先。

### `game/story-judge.mjs`

主线（亚克篇）自由输入的服务端判定：节点定义一律从 `public/story/chapters/` 读取，不信任客户端；`openai` 模式下由模型归类意图，失败时回退到与浏览器相同的 `demoJudge`。章节文件按 mtime 缓存，改了章节不用重启。

### 经济与外围系统（`game/gacha.mjs`、`membership.mjs`、`credit.mjs`、`costume.mjs`、`settings.mjs`、`analytics.mjs`）

- 召唤卡池（角色池 / 服饰池、概率、保底）、会员与钻石（演示用，无真实支付）、Credit 计量、换衣、AI 设置预览、运营统计；
- 只有一本 Credit 账：会员每日 Credit 同时记入计量器；
- 演示工具（免费会员、钻石、一键发放服装）受 `DEMO_TOOLS` 开关控制，`NODE_ENV=production` 时默认关闭。

### `game/persist.mjs`

- 把外传会话、账户（召唤 / 换衣 / 会员 / 卡牌收藏）、卡牌对局和 AI 设置写进 `data/saves.json`（路径按模块位置定位，不依赖 cwd；`SAVE_FILE` 可改）；
- 状态变化后防抖约 1 秒，先写临时文件再 rename；进程收到 SIGINT / SIGTERM / SIGHUP 时先同步落盘再退出；
- 文件损坏时改名为 `.corrupt-<时间戳>` 后以空状态启动；`PERSIST=0` 关闭，`node --test` 下默认关闭。

### `cards/`（卡牌对战《暗影对决》）

纯函数规则引擎：`database.mjs`（卡牌数据）、`battle.mjs`（对局、进化、攻击、回合）、`ai.mjs`（对手 AI，动作附带日志区间供前端回放）、`deck.mjs`（组牌校验、起始牌组）、`cardpack.mjs`（开包、碎片与合成）。服务端只把对手手牌下发为 `{uid, hidden}`。

### `scenario/`

银轨号外传的 15 章剧本草稿（`chapter-01.json` … `chapter-15.json`）与读取器 `index.mjs`，供游戏内「章节」阅读器使用（只读）。

### `server.mjs`

- Node 原生 HTTP 服务，无运行时第三方包；
- 静态网页与 JSON API；未知的 `/api/*` 返回 404 JSON，不存在的静态文件返回真正的 404；`/story`、`/cards` 这类单段路径 301 到同名 `.html`；
- 静态资源带 `ETag` / `Last-Modified`，`cache-control: no-cache`，未修改时返回 304；文本类资源按需 gzip，下载中断时释放文件句柄；
- 请求体 64 KiB 限制；playerId / sessionId 先做格式校验；会话与账户总量有上限（`MAX_SESSIONS`、`MAX_ACCOUNTS`，超出返回 503）；
- CSP（`script-src 'self'`、`img-src 'self' data:`）、nosniff、deny frame、权限策略等响应头；
- 每个存档串行锁，防止连续点击导致状态竞争；
- 存档持久化见 `game/persist.mjs`；过期清理：外传会话与卡牌对局 24 小时无操作过期，账户闲置 90 天过期；
- `openai` 模式下按 IP 令牌桶（每分钟 20 次）+ 全局 3 个并发限流，超出时立即走保底台词；
- 后台 `GET /api/admin/dashboard` 只认请求头 `x-admin-key`（`crypto.timingSafeEqual` 比较）；口令读 `ADMIN_KEY`，未设置时为默认口令 `123456`，设为空字符串则关闭后台；
- 畸形请求（如非法 Host 头）只影响该请求；未捕获异常只记日志不退出；端口被占用时打印中文提示后退出；
- 业务规则错误（中文提示）返回 400 原文，程序错误返回 500 通用文案，细节只写服务端日志。

### `public/`

- 多个页面，均无远程 CDN、无内联脚本：
  - `index.html` + `app.js`：银轨号外传、地图、章节阅读器、召唤、换衣、商店（演示）、设置；
  - `story.html` + `story/`：主线 · 亚克篇播放器（`story/engine.js` 为浏览器与 Node 通用的纯函数引擎，章节数据在 `story/chapters/`）；
  - `cards.html` + `cards.js`：卡牌对战（实验模式）；
  - `gacha-system.html`、`character-manager.html`：独立原型页，自带 localStorage 数据，与正式游戏数据不互通；
- 外传、召唤、换衣、卡牌等进度以服务端返回为准，`localStorage` 只保存 session id / player id 与本机便利设置（声音、称呼、已看过的提示）；
- 主线进度（逐拍自动存档、草稿）保存在浏览器 `localStorage`，服务端只做判定，不保存主线存档。

## 3. 角色模型输出协议

```json
{
  "utterance": "台词，不含旁白",
  "emotion": "认真",
  "intent": "promise",
  "bond_delta": 1,
  "trust_delta": 1,
  "memory": "玩家承诺不会抛下队友",
  "tactical_hint": "先防御积累焦点"
}
```

限制：

- `utterance` 1–180 字；
- 情绪与意图必须来自枚举；
- 单轮关系变化 -2 到 2；
- 记忆最多 80 字；
- 每个角色只保留最近 8 条有效记忆；
- 禁说秘密或出现提示词泄露特征时整轮回退。

生产版还应增加：

- 输出内容安全分类；
- Canon 事实 ID 引用；
- 动作提案单独 Schema；
- 角色间信息传播权限；
- 模型/提示词版本号；
- 对话哈希与审核日志。

## 4. 本地化模型路线

### 路线 A：服务端本地 Ollama（当前已接入）

```text
浏览器 → Node 游戏服务 → Ollama → Qwen3 8B
```

优点：

- 接入简单；
- API Key 不进入浏览器；
- 可在玩家电脑、展会机器或单机服务器运行；
- 与云端 OpenAI 兼容供应商可共用一套适配器。

缺点：

- 玩家需要下载模型；
- 低配机器延迟与显存不稳定；
- Web 公开版不能直接访问每位玩家的 `localhost`，除非安装本地 companion service。

适合：开发、封测、Steam “完全本地模式”。

### 路线 B：云端 vLLM/SGLang

```text
浏览器 → API Gateway → 会话编排 → vLLM/SGLang → Qwen3
```

优点：统一质量、连续批处理、易做监控和模型路由。

生产建议：

- 根据场景路由 4B/8B/更大模型；
- 对常见台词和安全拒答缓存；
- 按 session 设置硬轮数和 token 预算；
- SSE/流式输出改善体感；
- Redis 存短状态，PostgreSQL 存账号和结构化进度；
- 不把完整原始对话永久保存为默认行为。

### 路线 C：浏览器 WebLLM/WebGPU

```text
浏览器下载量化模型 → Web Worker/WebGPU 推理 → 本机生成
```

优点：没有推理服务器、隐私强、离线潜力高。

限制：

- 首次模型下载大；
- WebGPU、显存、浏览器和移动端差异明显；
- 页面刷新、缓存配额、后台休眠会影响模型生命周期；
- 适合 1.5B–4B 等较轻模型，角色质量需严格评测。

建议放在正式版第二阶段，作为“隐私实验模式”，不要作为首发唯一方案。

## 5. 模型选择

Qwen3 官方提供 0.6B、1.7B、4B、8B、14B、32B 及 MoE 等开源权重，并推荐 Ollama、LM Studio、llama.cpp 用于本地运行，SGLang/vLLM 用于部署。当前仓库默认 `qwen3:8b`，原因是中文角色表现与消费级硬件之间相对均衡。

工程估算应以实测为准，尤其要测：

- 模型权重 + KV cache + 运行时的总内存；
- 4K、8K 上下文的首字和完整响应延迟；
- 4-bit 量化对角色口吻、JSON 稳定性和秘密泄露的影响；
- 多语言切换；
- 同一角色 50–100 轮后的漂移。

不要在第一阶段微调世界事实。事实应存在内容层，LoRA 只用于角色语气、JSON 协议、离题恢复和工具调用习惯。

## 6. 扩展为完整队伍系统

当前每次只和一名角色对话。正式版可加入 Narrative Director：

```text
玩家话语
  ├─ 意图/实体/提及角色
  ├─ 当前章节允许事实
  ├─ 在场角色与偷听范围
  ├─ 谁先回应
  └─ 是否产生确定性游戏事件
```

角色间记忆建议分为：

- `canon_facts`：客观真相，只能由作者或游戏事件写入；
- `beliefs`：角色相信的事实，可以错误；
- `relationship_memories`：玩家承诺、冒犯、共同经历；
- `observed_actions`：玩家真实战斗行为；
- `private_secrets`：不可跨角色传播，除非触发明确事件。

## 7. 生产安全与可靠性

当前已有（单进程范围内）：JSON 文件存档与原子写入、会话 / 账户总量上限、`openai` 模式下的按 IP 限流与全局并发上限、后台口令走请求头、演示工具在 production 下默认关闭、静态资源 304 校验。

上线前增加：

1. IP、账号和 session 三层限流（当前只有 AI 端点的 IP 限流）；
2. CSRF/Origin 检查（若使用 cookie 登录）；
3. Redis 分布式锁替代进程内 Map；
4. PostgreSQL 存档和迁移版本（替代当前的 `data/saves.json`）；
5. 内容过滤与玩家举报；
6. AI 服务熔断、并发队列和预算上限；
7. 全链路日志但默认脱敏；
8. 自动回归测试：越狱、剧透、色情、自伤、辱骂、极长输入、中日英混合；
9. 关键剧情人工台词和完全离线保底；
10. 模型、提示词、内容包均可回滚。

## 8. 推荐部署形态

### 免费网页试玩

- CDN/静态站点 + 一个 Node API；
- 云端小模型或保底模式；
- 匿名 session，15–20 分钟内容；
- 结局页引导 Steam 愿望单。

### Steam 正式版

- Tauri/Electron 包装当前前端；
- 内置 Node/Rust sidecar；
- 可选 Ollama/llama.cpp 本地模型包；
- 云端增强作为选择，不影响基础通关；
- Steam Cloud 保存结构化状态，而不是保存模型隐藏上下文。
