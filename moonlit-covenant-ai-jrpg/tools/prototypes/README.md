# tools/prototypes — 不随站点提供的原型存档

按作者核#12 · B13，独立抽卡页 `gacha-system.html` / `gacha-system.js` 从 `public/` 移到这里：

- 它自成一套经济（钻石、粉晶、精魄、会员都只存在浏览器的 localStorage 里），与正式游戏的召唤、商店、存档**不互通**；
- 游戏服务器只提供 `public/`，所以 `/gacha-system.html` 现在是 404，游戏内也没有任何链接指向它；
- 正式游戏的召唤以 `game/gacha.mjs` + `public/app.js` 为准，这份原型不再跟进玩法改动，只保留作参考。
  其中的角色称号、专武名已按 `设定集/03` 改成正典写法（盾战士、魔具发明师、暗系魔法师；塔盾·赤誓、魔导棍·叮当三号、黑曜法杖·无眠镜等）。

## 本机预览

```
node tools/prototypes/preview.mjs        # 默认端口 4890，只监听 127.0.0.1
node tools/prototypes/preview.mjs 4891   # 换端口
```

打开 `http://127.0.0.1:4890/`；加 `?dev=1` 才显示后台标签。预览服务器只提供这两份原型文件，以及页面引用的 `/icons.js` 和 `/assets/**`（从 `public/` 读取），响应头沿用游戏的 CSP。

回归测试见 `test/prototype-pages.test.mjs`。
