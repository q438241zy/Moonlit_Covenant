// 主游戏前端（public/app.js 等）的静态回归检查：审计轨道 M 修过的问题不再回来
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const app = read('public/app.js');
const frontFiles = ['public/app.js', 'public/styles.css', 'public/index.html', 'public/icons.js', 'public/paint.js'];

test('前端不含管理口令，后台只通过请求头 x-admin-key 访问', () => {
  for (const file of frontFiles) assert.ok(!read(file).includes('123456'), `${file} 不应包含硬编码口令`);
  assert.ok(!/admin\/dashboard\?key=/.test(app), '不应再用 ?key= 传口令');
  assert.match(app, /'x-admin-key'/);
  assert.match(app, /meta\?\.admin\?\.enabled/, '后台入口应由 /api/meta 的 admin.enabled 控制');
});

test('名称按正典写法（塞雷娜、米娅·玲）', () => {
  for (const file of frontFiles) {
    const text = read(file);
    assert.ok(!text.includes('塞蕾娜'), `${file} 含「塞蕾娜」`);
    assert.ok(!text.includes('米娅·铃'), `${file} 含「米娅·铃」`);
  }
});

test('「银轨号外传」一次点击进入外传，银轨站从一开始开放', () => {
  assert.match(app, /#newGame'\)\?\.addEventListener\('click', \(\) => startNewGame\('game'\)\)/);
  assert.match(app, /id:'station',[^}]*unlockChapter:0,/);
});

test('头像 alt 属性不再输出成坏掉的 alt=""…"', () => {
  assert.ok(!app.includes('alt=""${'), 'faceThumb 的 alt 属性被写坏');
});

test('演示工具开关控制商店与测试发放入口；页面如实标注演示与 AI 状态', () => {
  assert.match(app, /meta\?\.demoTools !== false/);
  assert.ok(app.includes('演示版 · 支付未接入，不会真实扣款'));
  assert.ok(app.includes('剧情保底引擎（离线）'));
  assert.ok(!app.includes("'DeepSeek Flash'"), '设置页不应再默认写成 DeepSeek Flash');
  assert.ok(!app.includes('初始可用'), '召唤页不应再写「初始可用」');
});

/* ═══ 作者核#12（B 类决策）· 轨道 MAIN ═══ */
const css = read('public/styles.css');
const html = read('public/index.html');
const paintSource = read('public/paint.js');

test('B7/B20/B12：标题页拆成主线与 IF 外传两张卡片，名字输入框在外传卡片里，另有实验模式卡牌对战入口', () => {
  assert.ok(app.includes('主线：亚克的旅程'));
  assert.ok(app.includes('外传：银轨号'));
  assert.ok(app.includes('IF 外传'));
  const side = app.indexOf('id="modeSideTitle"');
  const nameInput = app.indexOf('id="playerName"');
  assert.ok(side > 0 && nameInput > side, '名字输入框应在外传卡片之内（外传标题之后）');
  assert.ok(app.indexOf('id="modeMainTitle"') < side, '主线卡片在前');
  assert.match(app, /href="\/cards\.html"[\s\S]{0,400}实验模式[\s\S]{0,80}卡牌对战/);
  assert.match(app, /href="\/story\.html"/);
});

test('B7：标题背景用矢量拼成的 title-bg.svg，不再用 AI 主视觉照片；meta 描述写明主线与 IF 外传', () => {
  assert.ok(css.includes('/assets/title-bg.svg'));
  assert.ok(!css.includes('key-visual.jpg'), 'styles.css 不应再引用 key-visual.jpg');
  assert.ok(!app.includes('key-visual.jpg'));
  assert.match(html, /<meta name="description" content="[^"]*亚克的旅程[^"]*IF 外传[^"]*"/);
});

test('B9：外传画面里的女主用矢量立绘；位图立绘只留在标题页英雄卡', () => {
  assert.ok(!/character\.portrait|partner\.portrait/.test(app), '外传画面不应直接用 content.mjs 的位图立绘');
  for (const name of ['lia', 'mia', 'serena']) {
    const hits = app.split(`/assets/${name}.jpg`).length - 1;
    assert.equal(hits, 1, `/assets/${name}.jpg 只应出现在标题页英雄卡（实际 ${hits} 处）`);
  }
  assert.match(app, /ART\.portrait\(character\.id\)/);
});

test('B17：paint() 换成位图时统一显示「AI 生成」角标（paint.js 提供，渲染器加 class）', async () => {
  assert.ok(paintSource.includes('AI 生成'));
  assert.match(app, /aiBadge as paintBadge, aiPaintedClass/);
  for (const renderer of ['face-crop', 'enemy-zone', 'ending-visual', 'cg-thumb', 'wardrobe-portrait', 'cg-unlock-thumb']) {
    assert.ok(app.includes(renderer), renderer);
  }
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ portraits: ['lia'], cg: ['intro-eye'] }) });
  try {
    const mod = await import(new URL('../public/paint.js', import.meta.url));
    await mod.loadPaint();
    assert.equal(mod.paint('/assets/portraits/lia.svg'), '/assets/paint/portraits/lia.jpg');
    assert.equal(mod.isPainted('/assets/portraits/lia.svg'), true);
    assert.equal(mod.isPainted('/assets/portraits/mia.svg'), false);
    assert.match(mod.aiBadge('/assets/portraits/mia.svg', '/assets/cg/intro-eye.svg'), /class="ai-badge"[^>]*>AI 生成</);
    assert.equal(mod.aiBadge('/assets/portraits/mia.svg'), '');
    assert.equal(mod.aiPaintedClass('/assets/portraits/lia.svg'), 'ai-painted');
    assert.equal(mod.aiPaintedClass('/assets/portraits/mia.svg'), '');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('B6：地图是外传专用；赫麦村是主线入口；没内容的城镇写「敬请期待」；调试按钮只在 ?dev=1', () => {
  assert.ok(app.includes("赫麦村 · 亚克的故乡（主线）"));
  assert.ok(!app.includes("name:'起点村'"));
  assert.ok(app.includes('敬请期待'));
  assert.match(app, /\$\{devMode \? `<button class="button small" id="debugUnlockNext"/);
  assert.match(app, /get\('dev'\) === '1'/);
  assert.ok(!app.includes("'moonlit:chapters'"), '地图进度不再由调试按钮写入的 moonlit:chapters 决定');
  assert.match(app, /function gaidenChaptersCleared\(\)/);
});

test('B1：章节页与外传阅读器标明 IF 外传、剧本草稿（只读）', () => {
  assert.ok(app.includes('外传：银轨号（IF 外传 · 剧本草稿）'));
  assert.ok(app.includes('剧本草稿（只读）'));
  assert.ok(app.includes('主线：亚克的旅程（正史）'));
});

test('B4：战后交流按引擎的 chatLimits 显示剩余次数，并写明计分规则', () => {
  assert.ok(app.includes('战后交流剩余'));
  assert.ok(!app.includes('战后交流不消耗次数'));
  assert.match(app, /state\.chatLimits\?\.\[scene\]/);
  assert.match(app, /state\.aftermathChatTurns/);
  assert.ok(app.includes('同一句话只计一次'));
});

test('B19：设置页不再展示模型预设', () => {
  assert.ok(!app.includes('模型预设 <span'), '不应再渲染「模型预设」区块');
  assert.ok(!app.includes("apiGet('/api/settings/ai')"));
});

test('B2/B3（作者修改）与契约 R-1：钻石可玩出来——签到、主线首通、卡牌胜利；召唤可用钻石，重复补偿公示；商店保留', () => {
  assert.ok(app.includes("apiPost('/api/rewards/daily'"));
  assert.ok(app.includes('/api/rewards/status?playerId='));
  assert.match(app, /'\/api\/gacha\/pull', \{ playerId, pool: currentGachaPool, count \}/);
  assert.ok(app.includes('duplicateCompensation'));
  assert.ok(app.includes('玩出来的钻石'));
  assert.match(app, /\{ id: 'shop', label: '商店', icon: 'cart' \}/);
  assert.match(app, /function visibleNavItems\(\) \{\s*return NAV_ITEMS;/, '商店入口不再隐藏');
  assert.ok(app.includes("store.get('moonlit:playerId')"), '与主线播放器、卡牌页共用同一个本机账户 key（契约 R-4）');
});

test('B13：主游戏不再链接独立抽卡原型页', () => {
  for (const file of frontFiles) assert.ok(!read(file).includes('gacha-system'), `${file} 不应链接 gacha-system`);
});

test('核#14（提案第八节#44）：召唤只收钻石——没有支付方式切换，价格和钱包只写钻石', () => {
  for (const gone of ['data-currency', 'GACHA_CURRENCY_KEY', 'gachaCurrency', 'pay-toggle', '也可以用 Credit']) {
    assert.ok(!app.includes(gone), `app.js 不应再有「${gone}」`);
  }
  assert.match(app, /function gachaCostText\(count\) \{[\s\S]*?costs\?\.diamonds[\s\S]*?钻石`;/);
  const wallet = app.match(/function gachaWalletHtml\(\) \{[\s\S]*?\n\}/)[0];
  assert.ok(wallet.includes('钻石 ${diamonds') && !wallet.includes('Credit'), '钱包只显示钻石');
  assert.match(app, /消耗 \$\{r\.cost\} 钻石/);
  assert.ok(app.includes('召唤只收钻石'));
});

test('核#14（提案第八节#43）：未登场女主是封存卡——剪影 + 「第N章登场」，不加载立绘；卡池按本账户进度取', () => {
  // 卡池带 playerId 取（服务器按已首通章节揭开），缓存只给同一个账户
  assert.match(app, /\/api\/gacha\/pools\$\{forPlayer \? `\?playerId=\$\{encodeURIComponent\(forPlayer\)\}` : ''\}/);
  assert.match(app, /gachaPoolsCache\.forPlayer === \(playerId \|\| null\)/);
  assert.ok(!app.includes("apiGet('/api/gacha/pools')"), '不再取不带进度的卡池');
  // 角色卡、服装卡、召唤结果、换衣间「尚未登场」、钻石页的入队行都认 sealed
  assert.match(app, /c\.sealed\s*\?\s*silhouetteThumb\('gacha-char-avatar'/);
  assert.match(app, /c\.sealed \? `[\s\S]*?silhouetteThumb\('costume-thumb'/);
  assert.match(app, /item\.sealed\s*\?\s*silhouetteThumb\('result-thumb'/);
  assert.match(app, /function sealedCollectionHtml\(/);
  assert.match(app, /c\.sealed \? `\$\{SEALED_NAME\} · \$\{debutText\(c, index\)\}`/);
  // 剪影不带 <img>，所以不会去请求她的立绘
  const thumb = app.match(/function silhouetteThumb\([^)]*\) \{[\s\S]*?\n\}/)[0];
  assert.ok(!thumb.includes('<img'), 'silhouetteThumb 不能加载图片');
  assert.match(app, /登场`;/);
  const css = read('public/styles.css');
  assert.match(css, /\.face-crop\.is-silhouette \{/);
  assert.match(css, /\.silhouette-figure::before/);
});
