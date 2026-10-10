# 厚涂位图预留位

把厚涂图（JPEG）按下列文件名放进对应子目录，并在 `manifest.json` 里登记文件名（不含扩展名），游戏就会优先显示它；没登记的继续显示矢量 SVG。

用 `tools/art/raster/` 出图时，`npm run art:paint:finalize` 会自动完成压缩、放置和登记。手动放图时尺寸见各组标题，清单示例：

```json
{ "portraits": ["freya"], "costumes": ["freya_maid"], "cards": ["n_goblin"] }
```

莉亚、米娅、塞蕾娜的剧情立绘已有 `public/assets/{lia,mia,serena}.png`，召唤/换衣页的立绘预留位同样适用于她们。

## portraits/ · 女主立绘（832×1216） · 8 张

`lia.jpg` · `mia.jpg` · `serena.jpg` · `freya.jpg` · `lilith.jpg` · `evelyn.jpg` · `ophelia.jpg` · `aila.jpg`

## costumes/ · 服装立绘（832×1216） · 48 张

`lia_newyear.jpg` · `lia_maid.jpg` · `lia_christmas.jpg` · `lia_duanwu.jpg` · `lia_anniversary.jpg` · `lia_swimsuit.jpg` · `mia_newyear.jpg` · `mia_maid.jpg` · `mia_christmas.jpg` · `mia_duanwu.jpg` · `mia_anniversary.jpg` · `mia_swimsuit.jpg` · `serena_newyear.jpg` · `serena_maid.jpg` · `serena_christmas.jpg` · `serena_duanwu.jpg` · `serena_anniversary.jpg` · `serena_swimsuit.jpg` · `freya_newyear.jpg` · `freya_maid.jpg` · `freya_christmas.jpg` · `freya_duanwu.jpg` · `freya_anniversary.jpg` · `freya_swimsuit.jpg` · `lilith_newyear.jpg` · `lilith_maid.jpg` · `lilith_christmas.jpg` · `lilith_duanwu.jpg` · `lilith_anniversary.jpg` · `lilith_swimsuit.jpg` · `evelyn_newyear.jpg` · `evelyn_maid.jpg` · `evelyn_christmas.jpg` · `evelyn_duanwu.jpg` · `evelyn_anniversary.jpg` · `evelyn_swimsuit.jpg` · `ophelia_newyear.jpg` · `ophelia_maid.jpg` · `ophelia_christmas.jpg` · `ophelia_duanwu.jpg` · `ophelia_anniversary.jpg` · `ophelia_swimsuit.jpg` · `aila_newyear.jpg` · `aila_maid.jpg` · `aila_christmas.jpg` · `aila_duanwu.jpg` · `aila_anniversary.jpg` · `aila_swimsuit.jpg`

## cg/ · 剧情 CG（1600×900） · 10 张

`intro-eye.jpg` · `camp-fire.jpg` · `corridor-frost.jpg` · `battle-descend.jpg` · `battle-phase2.jpg` · `battle-phase3.jpg` · `aftermath-snow.jpg` · `ending-seal.jpg` · `ending-share.jpg` · `ending-destroy.jpg`

## boss/ · 食梦兽三阶段（1000×1000，深色底即可，游戏内自动羽化边缘） · 3 张

`dream-eater-1.jpg` · `dream-eater-2.jpg` · `dream-eater-3.jpg`

## scenes/ · 舞台背景（1600×900） · 3 张

`battle-bg.jpg` · `camp-bg.jpg` · `ending-bg.jpg`

## cards/ · 卡面（512×512，进化版沿用同一张） · 38 张

`n_wisp.jpg` · `n_goblin.jpg` · `n_merchant.jpg` · `n_knight.jpg` · `n_golem.jpg` · `n_troll.jpg` · `n_angel.jpg` · `n_dragon.jpg` · `lia_recruit.jpg` · `lia_shieldbash.jpg` · `lia_flameguard.jpg` · `lia_rally.jpg` · `lia_charger.jpg` · `lia_bulwark.jpg` · `lia_captain.jpg` · `lia_flamestrike.jpg` · `lia_fortress.jpg` · `lia_hero.jpg` · `lilith_dagger.jpg` · `lilith_strike.jpg` · `lilith_apprentice.jpg` · `lilith_poison.jpg` · `lilith_shadowdance.jpg` · `lilith_assassin.jpg` · `lilith_shadowarrow.jpg` · `lilith_nightblade.jpg` · `lilith_shadowlord.jpg` · `lilith_hero.jpg` · `serena_acolyte.jpg` · `serena_darkbolt.jpg` · `serena_observer.jpg` · `serena_drain.jpg` · `serena_oracle.jpg` · `serena_void.jpg` · `serena_nova.jpg` · `serena_devourer.jpg` · `serena_seal.jpg` · `serena_hero.jpg`
