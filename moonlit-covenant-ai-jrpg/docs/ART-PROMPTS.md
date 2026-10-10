# 月蚀契约 — 位图立绘出图 Prompt（v2）

> 用途：在矢量版资产（见 `docs/ART-DIRECTION.md`）之上，为正式版生成/外包**高完成度位图立绘**时使用。
> 外观以 `docs/CHARACTER-DESIGN.md`（主三人）和 `设定集/03_主角与八位女主角.md`（其余五人）为准。
> **硬性尺度**：所有女主均为成年女性（18–19 岁），非性化；服装变体中不含泳装/内衣感服装。v1 版本中低龄+挑逗向的描述已全部移除——这类内容会直接触发平台审核（Steam、国内应用商店、版号）与法律风险，也不符合本项目自己的商业美术 Brief。

## 0. 出图管线建议（比单条 Prompt 更重要）

1. **先定角色设定图，再出立绘**：每个角色先出一张三视图 + 表情表（turnaround sheet），确认后作为后续所有图的参考（IP-Adapter / Reference / 角色一致性功能）。
2. **一致性**：同一角色固定 seed 区间与参考图；条件允许时用**自有设定图**训练角色 LoRA（不要用来源不明的风格 LoRA）。
3. **矢量版即构图稿**：`public/assets/portraits/<id>.svg` 已给出统一的半身构图、配色与标准色边缘光，可直接作为 img2img / ControlNet（lineart / depth）的底稿，保证八人并排时比例一致。
4. **合规标识**：按《人工智能生成合成内容标识办法》对 AI 生成图保留显式标识（当前 PNG 右下角“图片由AI生成”即属此类，不要裁掉），并在元数据中保留隐式标识；Steam 商店页需填写 AI 生成内容披露。
5. **权利链**：记录模型、版本、参考图来源；商用前确认模型许可允许商业用途。

## 1. 统一前缀 / 负面词

正向前缀（每张都加）：

```
masterpiece, high-quality Japanese fantasy JRPG character art, semi-realistic cel and painterly rendering, adult woman, mature facial proportions, upper body portrait, 3/4 view, dark navy-violet background with faint stars, moonlight from upper left, colored rim light, detailed costume materials, no text, no watermark, no signature
```

负面词：

```
child, loli, teen, young-looking, chibi, nsfw, cleavage, revealing clothes, swimsuit, lingerie, suggestive pose, extra fingers, deformed hands, text, logo, watermark, signature, blurry, lowres
```

## 2. 角色 Prompt

### 莉亚·赫斯特 · 赤誓骑士（标准色 `#ff6b7c`）
```
adult woman knight, 19 years old, high tight crimson ponytail with a near-black dark red streak on the left, amber-gold eyes, thin scar under the right eye through the brow tail, restrained determined expression, lips pressed, matte silver and dark crimson light armor with worn edges, damaged notch on the left pauldron, cracked gold oath crystal on the chest, scorched cape lining, slim longsword with a re-riveted ring guard, gothic arched window with a blood-red moon behind, embers, warm crimson rim light
```
表情差分：别过脸整理肩甲（害羞）、咬牙但眼神坚定（愤怒）、难看的笑（真正悲伤）。

### 米娅·铃 · 猫耳机关师（`#5ed7ff`）
```
adult woman engineer, 18 years old, petite, short choppy self-cut cyan-blue hair with neon gradient tips, wrench-shaped hair clip on the right, mechanical cat-ear receivers made of matte titanium with circuit traces and a glowing cyan indicator ring and tiny antenna, big bright cyan eyes with faint circuit glint, tiny mole on the nose tip, bright curious grin, oversized ripstop work jacket with glowing cyan circuit seams, sleeves past the hands, tool belt, small spherical drone covered in label stickers hovering by her shoulder, blueprint grid glow background
```

### 塞蕾娜·诺克斯 · 月蚀观测者（`#b58cff`）
```
adult woman astronomer mage, 19 years old, very long silky straight purple-black hair fading to moon-white at the tips, thin braid on the left with a tiny silver moon-phase disc ornament, pale violet eyes with fine star-track lines in the iris, calm half-lidded scrutinizing look, matte velvet purple-black robe with silver geometric seal embroidery, pendant shaped like a closed silver eyelid, white half-glove on the right hand, star-chart rings in the background, cold moonlit lighting
```

### 芙蕾娅·霜华 · 冰系魔法师（`#8fd4f5`）
```
adult woman ice mage, 19 years old, tall and graceful, long flowing wavy cyan-blue hair, warm amber eyes, gentle mature smile, layered northern robes with a white fur-collar shawl, ice crystal accessories, crystalline staff with a snowflake orb, aurora over a snowfield, light snowfall
```

### 莉莉丝·瓦尔哈拉 · 暗影刺客（`#c084fc`）
```
adult woman assassin, 19 years old, long golden hair tied high, sharp golden eyes, competitive confident smirk, small bandage across the nose bridge, sleek black and gold light armor with short cape, hood down, twin daggers, moonlit rooftops with purple shadow wisps
```

### 伊芙琳·星歌 · 圣教圣女（`#ffd98c`）
```
adult woman priestess, 18 years old, pale gold almost white long hair in a loose side braid, star-blue eyes, gentle shy expression, white and gold priestess dress adapted into light travel dress-armor, star-shaped pendant, cathedral stained-glass light rays
```

### 奥菲利亚·使诺德 · 龙族圣女（`#f472b6`）
```
adult woman dragon priestess, 19 years old, long wild copper-red hair, small dragon horns at the temples, heterochromia gold left eye and violet right eye, playful grin with a small fang, ancient priestess attire with deep blue scale-pattern armor pieces and silver trim, dragon claw ornaments, volcanic dragon ruins with drifting embers
```

### 艾拉·瓦尔哈拉 · 光明骑士（`#f5c84c`）
```
adult woman holy knight, 18 years old, golden shoulder-length hair, bright blue eyes, open confident cheerful smile, blue and gold light knight armor, short cape lined with a black-gold family crest, radiant longsword over the shoulder, golden light rays, facial resemblance to her older sister Lilith
```

## 3. 服装变体（追加在角色 Prompt 之后）

| 服装 | 追加描述 |
|---|---|
| 新年服 | `red and gold qipao-inspired jacket with mandarin collar, frog buttons, gold cloud embroidery, small fur collar, plum blossom hairpin, lanterns in background` |
| 女仆服 | `modest classic black dress with white high collar, white apron with lace edge, frilled headband, café interior background` |
| 圣诞服 | `red velvet hooded capelet with white fur trim and gold clasp over a dark dress, holly sprig, snowy night with bokeh lights` |
| 端午服 | `hanfu-inspired cross-collar outfit in jade green and white, dragon-boat wave pattern trim, five-colour silk cord bracelet, riverside background` |
| 周年庆服 | `elegant white and gold gala gown with modest high neckline, gold embroidery, star sash, small tiara, grand ballroom background` |
| 夏日度假服 | `light summer sundress with a thin cardigan, straw-hat pin, seaside train window background, bright summer light` |

## 4. 规格与命名

- 尺寸：1024×1536（2:3 竖构图），游戏内按 `object-fit: cover` 显示，头部请落在画面上 1/3–1/2。
- 文件：`public/assets/<id>.png`（基础立绘）、`public/assets/costumes/<id>_<type>.png`（服装）。位图到位后，把 `game/gacha.mjs` 与 `game/content.mjs` 中对应 `portrait` 指向 PNG 即可；矢量版保留作为回退与缩略图。
