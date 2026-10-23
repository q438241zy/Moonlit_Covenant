# 厚涂位图预留位

<!-- 本文件由 tools/art/raster/readme.mjs 根据 tools/art/raster/manifest.mjs 生成（npm run art 的最后一步），请勿手改。 -->

把厚涂图（JPEG）按下列文件名放进对应子目录，并在 `manifest.json` 里登记文件名（不含扩展名），游戏就会优先显示它；没登记的继续显示矢量 SVG。

用 `tools/art/raster/` 出图时，`npm run art:paint:finalize` 会自动完成压缩、放置和登记，并把原图里的 AIGC 隐式标识写进 JPEG（原图没有时补一段最小标识）；`test/art-assets.test.mjs` 会检查这里的每张 JPEG 都带 AIGC 信息。手动放图时也必须保留这些元数据。尺寸见各组标题，清单示例：

```json
{ "portraits": ["freya"], "costumes": ["freya_maid"], "cards": ["n_goblin"], "story-bg": ["hemai-day"] }
```

游戏画面里的女主一律用矢量立绘，位图只能经这里的预留位替换（audit B9）。换上之后，可见标识由页面统一显示的「AI 生成」角标负责（`public/paint.js` 的 `aiBadge()`，audit B17）；隐式标识（元数据）仍然必须保留。

旧的莉亚、米娅、塞雷娜厚涂图（`public/assets/{lia,mia,serena}.jpg`，由 `tools/art/raster/compress-legacy.mjs` 压缩）是外传时期的造型，莉亚没有正典的塔盾「赤誓」，**不要**放进立绘预留位；请按 `tools/art/raster/manifest.mjs` 的正典描述重出。

## portraits/ · 女主立绘（832×1216） · 8 张

`lia.jpg` · `mia.jpg` · `serena.jpg` · `freya.jpg` · `lilith.jpg` · `evelyn.jpg` · `ophelia.jpg` · `aila.jpg`

## costumes/ · 服装立绘（832×1216） · 48 张

`lia_newyear.jpg` · `lia_maid.jpg` · `lia_christmas.jpg` · `lia_duanwu.jpg` · `lia_anniversary.jpg` · `lia_swimsuit.jpg` · `mia_newyear.jpg` · `mia_maid.jpg` · `mia_christmas.jpg` · `mia_duanwu.jpg` · `mia_anniversary.jpg` · `mia_swimsuit.jpg` · `serena_newyear.jpg` · `serena_maid.jpg` · `serena_christmas.jpg` · `serena_duanwu.jpg` · `serena_anniversary.jpg` · `serena_swimsuit.jpg` · `freya_newyear.jpg` · `freya_maid.jpg` · `freya_christmas.jpg` · `freya_duanwu.jpg` · `freya_anniversary.jpg` · `freya_swimsuit.jpg` · `lilith_newyear.jpg` · `lilith_maid.jpg` · `lilith_christmas.jpg` · `lilith_duanwu.jpg` · `lilith_anniversary.jpg` · `lilith_swimsuit.jpg` · `evelyn_newyear.jpg` · `evelyn_maid.jpg` · `evelyn_christmas.jpg` · `evelyn_duanwu.jpg` · `evelyn_anniversary.jpg` · `evelyn_swimsuit.jpg` · `ophelia_newyear.jpg` · `ophelia_maid.jpg` · `ophelia_christmas.jpg` · `ophelia_duanwu.jpg` · `ophelia_anniversary.jpg` · `ophelia_swimsuit.jpg` · `aila_newyear.jpg` · `aila_maid.jpg` · `aila_christmas.jpg` · `aila_duanwu.jpg` · `aila_anniversary.jpg` · `aila_swimsuit.jpg`

## cg/ · 剧情 CG（1600×900） · 10 张

`intro-eye.jpg` · `camp-fire.jpg` · `corridor-frost.jpg` · `battle-descend.jpg` · `battle-phase2.jpg` · `battle-phase3.jpg` · `aftermath-snow.jpg` · `ending-seal.jpg` · `ending-share.jpg` · `ending-destroy.jpg`

## boss/ · 食梦兽三阶段（1000×1000） · 3 张

深色底即可，游戏内自动羽化边缘。

`dream-eater-1.jpg` · `dream-eater-2.jpg` · `dream-eater-3.jpg`

## scenes/ · 舞台背景（1600×900） · 3 张

`battle-bg.jpg` · `camp-bg.jpg` · `ending-bg.jpg`

## cards/ · 卡面（512×512） · 38 张

进化版沿用同一张。

`n_wisp.jpg` · `n_goblin.jpg` · `n_merchant.jpg` · `n_knight.jpg` · `n_golem.jpg` · `n_troll.jpg` · `n_angel.jpg` · `n_dragon.jpg` · `lia_recruit.jpg` · `lia_shieldbash.jpg` · `lia_flameguard.jpg` · `lia_rally.jpg` · `lia_charger.jpg` · `lia_bulwark.jpg` · `lia_captain.jpg` · `lia_flamestrike.jpg` · `lia_fortress.jpg` · `lia_hero.jpg` · `lilith_dagger.jpg` · `lilith_strike.jpg` · `lilith_apprentice.jpg` · `lilith_poison.jpg` · `lilith_shadowdance.jpg` · `lilith_assassin.jpg` · `lilith_shadowarrow.jpg` · `lilith_nightblade.jpg` · `lilith_shadowlord.jpg` · `lilith_hero.jpg` · `serena_acolyte.jpg` · `serena_darkbolt.jpg` · `serena_observer.jpg` · `serena_drain.jpg` · `serena_oracle.jpg` · `serena_void.jpg` · `serena_nova.jpg` · `serena_devourer.jpg` · `serena_seal.jpg` · `serena_hero.jpg`

## story-bg/ · 主线场景背景（1600×900） · 56 张

清单来自 public/story/locations.json。

`hemai-day.jpg`（赫麦村·午后） · `pasture.jpg`（牧场羊圈） · `village-road.jpg`（赫麦村村道·傍晚） · `kitchen-night.jpg`（亚克家厨房·油灯） · `dragon-sky.jpg`（黑翼遮月） · `village-burning.jpg`（黑焰中的赫麦村） · `north-trail-night.jpg`（北山旧牧道·夜） · `shepherd-cave-night.jpg`（守羊洞·俯瞰故乡） · `south-ridge.jpg`（南侧山脊） · `cave-dawn.jpg`（守羊洞·黎明前） · `hemai-sky-dawn.jpg`（赫麦村上空·破晓） · `hemai-ruins-dawn.jpg`（赫麦村废墟·黎明） · `north-slope-camp.jpg`（北山缓坡·灾民营地） · `chime-town-gate.jpg`（晨钟镇东门·清晨） · `guild-hall.jpg`（晨钟镇冒险者公会） · `market.jpg`（晨钟镇中央市集） · `dye-alley.jpg`（染布巷） · `barrel-alley.jpg`（旧酒桶巷） · `guard-square.jpg`（治安所前·公会广场） · `mill-road-milestone.jpg`（旧磨坊路·第二座里程石） · `mill-road-dusk.jpg`（旧磨坊路·黄昏） · `training-ground-dawn.jpg`（晨钟镇训练场·日出） · `old-mill-dusk.jpg`（旧磨坊·黄昏芦苇） · `old-mill-floor.jpg`（旧磨坊·磨盘间） · `old-mill-floor-cart.jpg`（旧磨坊·磨盘间·大车之夜） · `west-gate-day.jpg`（晨钟镇西门·上午） · `west-gate-dusk.jpg`（晨钟镇西门·黄昏） · `west-gate-night.jpg`（晨钟镇西门·入夜） · `mill-road-night.jpg`（旧磨坊路·夜） · `salt-marsh-bridge.jpg`（盐沼桥·午后涨潮） · `forest-edge-inn.jpg`（林边旅店·黄昏） · `forest-edge-channel-night.jpg`（林边水道泥滩·夜） · `tide-station-dawn.jpg`（量潮老站·站顶·天亮） · `tide-station-predawn.jpg`（量潮老站·站顶·天亮前） · `tide-station-room.jpg`（量潮老站·潮室·拂晓） · `fog-harbor-bridge-noon.jpg`（雾港·第一座木桥·近午退潮） · `fog-harbor-guild.jpg`（冒险者公会雾港分会） · `fog-harbor-drain-dusk.jpg`（旧浴场后沟与排水区东口·黄昏） · `fog-harbor-drain-night.jpg`（旧浴场后沟与排水区东口·入夜） · `fog-harbor-sewer-pump.jpg`（雾港·东口以下·砖拱水道与三号泵房） · `fog-harbor-tide-cavity.jpg`（雾港·潮腔·旧蓄水池） · `fog-harbor-tide-cavity-ebb.jpg`（雾港·潮腔·排水后） · `fog-harbor-drain-dawn.jpg`（旧浴场后沟与排水区东口·破晓） · `fog-harbor-bridge-dusk.jpg`（雾港·第一座木桥·黄昏） · `fog-harbor-bridge-inn-night.jpg`（雾港·桥头旅店·入夜） · `fog-harbor-bridge-inn-eyes.jpg`（雾港·桥头旅店·镜中紫眼） · `fog-harbor-bridge-inn-room.jpg`（雾港·桥头旅店·亚克的房间） · `fog-harbor-bridge-inn-mirror.jpg`（雾港·桥头旅店·镜子的那一边） · `fog-harbor-bridge-inn-covered.jpg`（雾港·桥头旅店·镜子蒙上毛巾） · `fog-harbor-old-lighthouse.jpg`（雾港·旧灯塔） · `fog-harbor-old-lighthouse-rain.jpg`（雾港·旧灯塔·雨夜灯室） · `fog-harbor-old-lighthouse-night.jpg`（雾港·旧灯塔·塔底夜雨） · `fog-harbor-old-lighthouse-night-broken.jpg`（雾港·旧灯塔·塔底夜雨·破窗） · `fog-harbor-old-lighthouse-dawn.jpg`（雾港·旧灯塔·清晨） · `fog-harbor-mirror-alley.jpg`（雾港·镜巷） · `fog-harbor-fish-market-roofs-rain.jpg`（雾港·鱼市屋顶·雨夜）

## story-npc/ · 主线胸像（600×800） · 30 张

清单来自 public/story/speakers.json（同一文件只列一次）。矢量版是透明底；JPEG 没有透明通道，换上前先确认在白天场景上不会出现底色方框。

`aku.jpg`（亚克） · `erin.jpg`（艾琳） · `toby.jpg`（托比） · `mara.jpg`（玛拉） · `borin.jpg`（伯伦） · `horn.jpg`（霍恩） · `kern.jpg`（白·可恩） · `maeve.jpg`（梅芙） · `lia.jpg`（莉亚） · `rocky.jpg`（罗奇） · `blackrobe.jpg`（黑袍人） · `finn.jpg`（芬恩） · `goblin.jpg`（哥布林） · `polly.jpg`（波莉） · `acolyte.jpg`（念祷文的人） · `goblin_chief.jpg`（哥布林咒徒长） · `marsh_ogre.jpg`（沼地食人魔） · `caravan_leader.jpg`（领队） · `mia.jpg`（米娅） · `scrap_picker.jpg`（拾铁机） · `ines.jpg`（伊涅丝） · `tide_cavity_mother.jpg`（潮腔母虫） · `serena.jpg`（塞雷娜） · `scar_echo.jpg`（蚀痕残响） · `scar_echo_15.jpg`（蚀痕残响） · `mirror_apprentice.jpg`（镜咒学徒） · `mirror_apprentice_blanket.jpg`（镜咒学徒） · `lia_mirror.jpg`（莉亚） · `serena_staff_wrapped.jpg`（塞雷娜） · `golden_assassin.jpg`（金发刺客）
