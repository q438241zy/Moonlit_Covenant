# 主线剧情引擎 · 亚克篇（v1）

> 把 `剧本/` 的正式分镜稿做成可玩的主线：视觉小说式演出 + **无固定选项的自由输入**。
> 规则来源：`剧本/README_劇本編寫規格.md`。本文件是数据格式与引擎行为的唯一约定，章节 JSON、引擎、判定服务、播放界面都以此为准。

## 1. 文件布局

| 路径 | 作用 |
|---|---|
| `public/story/engine.js` | 纯函数剧情引擎（浏览器与 Node 通用）：游标推进、条件、变量、判定落地、离线演示判定、章节校验 |
| `public/story/chapters/index.json` | 章节目录（id、序号、标题、`estimatedMinutes`、`file`、解锁前置）。标题页只读这个文件，不预载任何章节；`estimatedMinutes`、`title`、`number` 必须与章节文件一致，`file` 写了就必须存在（还没转写的章节不写 `file`，标题页显示「尚未开放」），由 `tools/story/check.mjs` 校验 |
| `public/story/chapters/ch000.json` … | 每章一个文件，从 `剧本/` 转写，**简体中文** |
| `public/story/speakers.json` | 全局说话人表（名字、颜色、立绘） |
| `public/story/locations.json` | 场景背景表（id → 名称、SVG 路径、兜底渐变） |
| `public/assets/story/bg/<id>.svg` | 场景背景（1600×900）；厚涂预留位 `paint/story/<id>.jpg` |
| `public/assets/story/npc/<id>.svg` | NPC 剪影胸像（600×800，透明底） |
| `game/story-judge.mjs` | 服务端自由输入判定：演示模式用关键词，openai 模式调模型并校验 |
| `public/story.html` + `public/story/player.js` + `public/story/story.css` | 主线播放界面 |

## 2. 章节 JSON

```jsonc
{
  "id": "ch000",                       // ch + 三位章号
  "number": 0,
  "scriptId": "CH000_ORIGIN_BLACK_WING_NIGHT",
  "title": "序章｜黑翼焚麦之夜",
  "shortTitle": "黑翼焚麦之夜",
  "estimatedMinutes": 16,             // 同步写进 index.json（标题页「约 N 分钟」只读目录）
  "source": "剧本/00起源.md",
  "canon": { "flags": {}, "items": {}, "vars": {}, "memories": {} },   // 直接从本章开始时补齐的前情正史（ch000 为空）
  "speakers": { },                     // 可选：本章临时说话人，格式同 speakers.json
  "shots": [
    {
      "id": "00-01",                   // 分镜号，对应剧本「分镜00-01」
      "title": "风从麦穗上经过",
      "bg": "hemai-day",               // locations.json 的 id，或 "black"
      "music": "woodflute_pastoral",   // 音乐/环境音标签（暂不播放，供后续音频接入）
      "ambience": ["wind", "sheep_bell"],
      "beats": [ /* 见第 3 节 */ ]
    }
  ],
  "end": {
    "save": "SAVE_CH000_END_ORIGIN",
    "next": "ch001",                   // 下一章 id；尚无下一章时为 null
    "nextLabel": "CH001_MENTOR_WHITE_ROBE",
    "set": { "flags": { "FLAG_CH000_DRAGON_VOW": true } },   // 章末正史变量（剧本「变量写入」）
    "summary": [ { "when": { "flag": "FLAG_CH000_DRAGON_VOW" }, "text": "你在燃烧的赫麦村前立下了誓言。" } ]
  }
}
```

## 3. 节拍（beat）类型

所有文本里的主角名写成 `{PLAYER_NAME}`（剧本里的「亚克」），引擎替换为玩家自取名。

| t | 字段 | 说明 |
|---|---|---|
| `narr` | `text`, `text15?`, `style?`, `intel?` | 叙述。`style`：`picture`（画面描写，默认）/ `voice`（旁白引用）/ `caption`（系统字幕，如「遭遇战开始」）。`text15` 为 15+ 模式替换文本。`intel: true`：照常演出，但轮到玩家输入时一并列进输入框上方的「情报」栏（如 00-14 的三件紧急情况） |
| `say` | `who`, `text`, `note?`, `text15?` | 对白。`who` 为说话人 id；`note` 如「画外」「更大声」 |
| `think` | `text` | 主角内心独白 |
| `bg` | `bg`, `fx?` | 切换背景（`fx`: `fade` / `cut`） |
| `fx` | `fx`, `ms?` | 演出：`shake` `flash` `fade-black` `fade-in` `desaturate`（黑焰「吞色」）`restore` `blackout` |
| `title` | `lines[]`, `title`, `subtitle` | 片名演出 |
| `set` | `flags?` `items?` `vars?` `memories?` `add?` | 静默写入变量；`add` 为数值累加（如 `PLAYER_GUILT_TOTAL`） |
| `if` | `when`, `then[]`, `else?[]` | 条件分支（条件见第 5 节） |
| `input` | 见第 4 节 | 自由输入节点：引擎停下等待玩家输入 |
| `battle` | 见第 6 节 | 自由战术战斗 |

## 4. 自由输入节点

```jsonc
{
  "t": "input",
  "id": "FI_CH000_SC02_MOTHER_CALL_001",     // 沿用剧本节点 id，章内唯一
  "kind": "dialogue",                         // dialogue | action | tactic | vow | free
  "prompt": "艾琳正等着{PLAYER_NAME}的回答。他可以说话、行动，或者保持沉默。",
  "placeholder": "说点什么，或写下{PLAYER_NAME}的动作……",
  "optional": false,                          // true 时显示「跳过」
  "focus": ["erin"],                          // 判定模型生成反应时允许发言的角色
  "context": ["场景事实……"],                  // 给判定器的场景信息（剧本【场景可用信息】）
  "principles": ["玩家温和回应，艾琳会……"],   // 剧本【AI演出原则】【AI判定重点】原文要点
  "intents": [
    {
      "id": "warm", "label": "温和回应",
      "desc": "语气温和、答应或道歉",          // 给模型看的判定说明
      "keywords": ["好", "知道了", "马上", "妈"],
      "voice": "warm",                        // 计入 PLAYER_VOICE_PROFILE
      "morality": 1,                          // -2..2
      "reaction": [ { "t": "narr", "text": "艾琳把木桶递给他……" } ],
      "reactionFixed": false,                 // true：始终演出本反应（模型生成的台词不替换它）
      "set": { "flags": {} },
      "effect": { }                           // 仅战斗回合使用，见第 6 节
    }
  ],
  "silent": "silent",                         // 空输入/沉默时的意图 id（必须存在）
  "fallback": "warm",                         // 无法归类时的意图 id（必须存在）
  "multi": false,                             // true（誓言）：可同时成立主/次两个意图
  "storeAs": "PLAYER_VOW"                     // 可选：写入 vars.PLAYER_VOW_PRIMARY / _SECONDARY
}
```

**判定结果**（服务端 `/api/story/judge` 或离线 `demoJudge` 返回）：

```jsonc
{ "intent": "warm", "secondary": null, "quality": 2, "morality": 1, "feasible": true,
  "reaction": [ { "who": "erin", "text": "……" }, { "who": "narr", "text": "……" } ],   // 可选：模型生成
  "memory": "……",                                                                      // 可选：一句记忆
  "source": "demo" | "model" | "fallback" }
```

落地规则（`resolveInput`）：记录到 `run.inputs[id]`；累计 `voice` 与 `morality`；应用意图的 `set`（multi 时主次都应用）；战斗中应用 `effect`；然后演出反应——模型给了合格台词且意图不是 `reactionFixed` 时演出模型台词，否则演出作者写的 `reaction`。**之后继续演出节点后面的节拍**（剧本的「默认承接」写在节点之后，所有意图共用）。

写作要点：
- **提示文字不用「你」称呼玩家**（作者核#12 / B14）：`prompt`、`placeholder`、系统字幕（`style: caption`）、战斗 `intel`、「自由输入：」分镜标题一律写 `{PLAYER_NAME}`（剧本里写「亚克」），同一句里第二次提到可以用「他」。引号里的台词照常（角色对亚克说「你」没问题）。`tools/story/check.mjs` 与 `test/story.test.mjs` 会拦下违规。
- **镜头指示不上屏**：剧本里给演出看的「镜头掠过……」「画面缓慢亮起」要转写成世界内的叙述（「风掠过麦穗……」「然后是光。……」）；叙述里出现「镜头」二字会被 `check.mjs` 拦下。
- **兜底回应不引用玩家没说过的话**：承诺类节点的「含糊／无法归类」意图同时接住提问、犹豫和任何没归类的话，反应写成叙述「她等着一个明确的答复。」，不要写成「‘看情况’不是答案。」这类引用。
- 剧本的硬事件（必定发生的结果）写在节点后的公共节拍里，不放进某个意图的反应。
- 每个节点至少 3 个意图，必须包含 `silent` 与一个能接住任意输入的 `fallback`；剧本列出的每条「AI演出原则」都应有对应意图。
- 关键词用简体中文短词，覆盖口语、动作描写（「拍拍他」「点头」）。
- 离线判定（`demoJudge`）按命中的关键词数计分，平分时排在前面的意图胜出。关键词有三种写法：
  - `"答应"`：普通关键词，输入里含有这几个字就计 1 分（不分大小写）。
  - `"=对"`：**整句关键词**。玩家整句回答就是这个词时才计 1 分——比较前去掉标点空白、句首「嗯/哦/噢/喔/唔/啊」、句末「了/啦/吧/啊/呀/哦/的/嘛/呢/哈/嘞/咧/呗」，并把叠字归一（「嗯，对对对！」「是啊」「好的好的」「OK!」都算）。用来接住「对」「是的」「明白」「当然」「OK」这类一两个字的答复，又不会误中「不对」「当然不」「我不太明白」「我不知道」。
  - `"!去死"`：**排除词**。输入里含有这几个字时，这个意图本次得 0 分（00-14「你们都去死吧」不能算作号召村民）。排除词不能排在第一个（`check.mjs` 自动试玩拿第一个关键词当示例输入）。
- 承诺类节点（第三章临时契约、第四章绳讯、第五章入队登记的「明确答应」「签」系列意图）都带上同一组常用肯定答复：普通关键词「我会的」「嗯好」，加上整句关键词「明白」「是的」「对」「当然」「OK」「yes」「听你的」「放心」等。`test/story.test.mjs` 有正反两组回归用例（「不明白」「我不知道」「看情况」「不对」「当然不」保持原判定）。
- 反讽不算答应：这些答应 / 签名意图都带排除词 `!才怪` `!鬼才`，拒绝意图带普通关键词「才怪」「鬼才」——「我会的才怪」「鬼才答应你」判为拒绝。
- 动作关键词别太宽：单独的「身后」会把「我躲在莉亚身后」也判成「绕到敌人身后」，要写成「绕到他身后」这样的完整动作（05-04 `law_dark_first`）。
- 「说得漂亮不等于正面」：恶意意图的 `morality` 为负，与表达质量无关。

## 5. 条件

```jsonc
{ "flag": "FLAG_X" }                     // 真值（flags/vars/items 依次查找）
{ "flag": "FLAG_X", "eq": "TOBY" }
{ "item": "ITEM_BASIC_BANDAGE", "gte": 1 }
{ "var": "PLAYER_GUILT_TOTAL", "gte": 2 }
{ "intent": "FI_CH000_SC26_TOBY_AFTER_001", "is": "promise" }        // 主或次意图命中
{ "intent": "FI_…", "in": ["promise", "hope"] }
{ "voice": "warm", "gte": 2 }
{ "mode": "15+" }
{ "battle": "BATTLE_CH002_STREET_AMBUSH", "is": "clean" }            // clean | hurt | collateral
{ "all": [ … ] }  { "any": [ … ] }  { "not": { … } }
```

## 6. 自由战术战斗

```jsonc
{
  "t": "battle",
  "id": "BATTLE_CH002_STREET_AMBUSH",
  "title": "街巷伏击",
  "objective": "制服或迫使敌人投降",
  "bonus": "避免波及住宅与路人",
  "player": { "hp": 10 },
  "enemies": [ { "id": "rocky", "name": "窃贼罗奇", "hp": 4 }, { "id": "bowman", "name": "弩手同伙", "hp": 2 } ],
  "intel": ["罗奇右脚在前，匕首藏于肘后。", "屋檐弩手正在重新上弦。"],
  "untilDefeated": true,               // 敌人全倒后跳过剩余回合
  "rounds": [ { "t": "input", "kind": "tactic", "id": "FI_CH002_SC10_STREET_BATTLE_001", "...": "同第 4 节",
                "intents": [ { "id": "environment", "effect": { "enemy": { "rocky": -3 }, "player": 0, "collateral": 0 }, "reaction": [] } ] } ],
  "after": [ /* 回合结束后的固定演出，如莉亚以盾收束战斗 */ ]
}
```

- 不显示「攻击/防御/道具」菜单，界面只显示情报、双方状态与输入框。
- 战斗结束写入 `vars[<id>_RESULT]`：`collateral`（波及路人/住宅）> `hurt`（主角 HP ≤ 一半）> `clean`。教学战不会失败。

## 7. 引擎 API（`public/story/engine.js`）

```js
createRun({ playerName, chapter, mode })      // 新存档（应用 chapter.canon）
continueRun(prevRun, nextChapter)             // 继承变量进入下一章
next(run, chapter)                            // -> { kind: 'shot'|'beat'|'input'|'battle-start'|'battle-end'|'end', … }
resolveInput(run, chapter, judgement, text)   // 落地判定，返回 { intent, label }
demoJudge(node, text)                         // 离线关键词判定（服务端演示模式同用；关键词写法见第 4 节）
replyCore(text)                               // 整句关键词的比较形式（去标点、首尾语气词、叠字）
findNode(chapter, nodeId)                     // 查找输入节点（含战斗回合）
validateChapter(chapter, { speakers, locations })  // -> 错误列表（[] 为通过）
evalCond(run, cond)  interpolate(text, run)  publicSummary(run)
```

`run` 可 JSON 序列化，播放器存入 localStorage（自动存档 + 每章章末存档），服务器重启不丢进度。

## 8. 判定服务

`POST /api/story/judge { chapterId, nodeId, text, context: { playerName, recent: [{ id, text, intent }] } }`

- 服务端从 `public/story/chapters/` 读取节点定义（不信任客户端传来的节点）。
- `AI_MODE=demo`：`demoJudge`。`AI_MODE=openai`：用 `game/ai.mjs` 的同一套配置调用模型，JSON Schema → JSON Object → 纯文本三级兜底；意图必须在节点枚举内、台词说话人必须在 `focus` 或 `narr`、最多 4 行、每行 ≤ 90 字，不合格即回退演示判定（`source: "fallback"`）。
- 模型只负责「归类 + 给角色台词」，不能改变硬事件、不能凭空让主角获得超出当前能力的结果。

## 9. 播放界面

- 标题页只读 `index.json`：章节卡片、「约 N 分钟」、解锁状态都不需要下载章节文件，点「开始」时才读那一章。主按钮：有进行中的自动存档时是「继续」；自动存档停在章末（已读完）时是「开始<下一章>」（与章节完成页的「下一章」同一条路：`continueRun(这一章的结局存档, 下一章)`），最后一章读完时是「重温本章」。
- 背景层（`locations.json`，厚涂预留位优先）+ 演出特效 + 底部对话框（说话人名牌、打字机效果）。换分镜时等新背景淡入结束（`transitionend`，最多 1 秒；减少动态、快进时不等）再开始打第一句字。
- 点击 / 空格 / 回车推进；「自动」「快进（已读）」「回看」；分镜标题以小字淡入（显示时去掉剧本分类前缀「自由输入：」，源数据不动）。
- 输入节点：显示提示语与多行输入框，回车提交，`Shift+Enter` 换行；「保持沉默」按钮提交空输入；`optional` 节点有「跳过」。不显示判定分数，只在记忆写入时给轻提示。
- 「情报」折叠栏：收集上一次回应之后出现过的系统字幕（`style: caption`）和标了 `intel` 的叙述。只有一句、又夹在别的叙述中间的零散字幕不算情报；紧挨着输入框的那一句字幕照样列出（05-08「笼锁要钥匙……」）。
- 战斗：情报面板 + HP 条 + 战术输入框。
- 章末：章节完成页（正史记录摘要、下一章、重玩），自动存档。
- 首通奖励（契约 R-2 / R-4）：完成页弹出后，播放器在后台调用 `POST /api/story/progress { playerId, chapterId }`（服务端对照 `chapters/index.json` 校验章节，幂等）。账户与主游戏共用：`localStorage` 的 `moonlit:playerId`（原样字符串，不是 JSON）；没有或已失效（`GET /api/account` 返回 404 / 400）时像主游戏一样 `POST /api/account/create` 建号并写回；网络或服务器错误、离线都静默跳过，不影响完成页。返回 `chapterReward > 0` 时显示「首次通关奖励：钻石 +N」，`heroinesGranted` 里的女主显示「正式成为同伴：已加入角色收藏」（莉亚 = ch005、米娅 = ch010，表在 `game/gacha.mjs` 的 `joinChapter`），`heroinesCompensated` 显示折算的钻石；重玩已通关的章节只显示「本章首通奖励已领取」。数额见 README「钻石与奖励」。
- 厚涂位图的「AI 生成」标（B17）：`paint()` 把背景或立绘换成位图（`.jpg/.png/.webp`）时，播放栏章节名旁亮出统一的「AI 生成」小标（`.ai-badge`，纯 CSS，不碰 CSP）；全是矢量 SVG 时不显示。
- 标题页注明「这里是正史主线」，主菜单里的「银轨号」是 IF 外传（B1）；左上角「返回主菜单」。
- 设置：内容模式 12+ / 15+、文字速度。
