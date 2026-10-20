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
