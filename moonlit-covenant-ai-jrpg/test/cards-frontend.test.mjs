// 卡牌对战前端（public/cards.*）的静态守护：B12 实验模式标注与抛硬币、契约 R-3（胜利奖励）、R-4（共用账户）、B17（AI 角标）。
// 规则本身由 test/battle.test.mjs、test/cards-ai.test.mjs 覆盖；这里只防止前端把这些接线弄丢。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../public/${p}`, import.meta.url), 'utf8');
const html = read('cards.html');
const js = read('cards.js');
const css = read('cards.css');

test('B12 卡牌对战页标明「实验模式」，并保留返回主菜单', () => {
  assert.match(html, /<title>[^<]*实验模式[^<]*<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]*实验模式/);
  assert.match(html, /boot-sub">[^<]*实验模式/);
  assert.match(js, /class="lab-tag"[^>]*>实验模式</);
  assert.match(js, /<a class="home-link" href="\/">[\s\S]{0,80}返回主菜单/);
  assert.doesNotMatch(html, /\son[a-z]+=/i, 'CSP：不写内联事件处理器');
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)/, 'CSP：不写内联脚本');
});

test('B12 开局抛硬币展示给玩家；对手先手时先摆开局盘面再回放对手的第一回合', () => {
  assert.match(js, /coinToss/);
  assert.match(js, /function showCoinToss\(/);
  assert.match(js, /抛硬币决定先后手/);
  assert.match(js, /function openingBoard\(/);
  assert.match(js, /replayAiTurn\(before, after, actions\)/);
  assert.match(css, /\.coin\s*\{/);
  assert.match(css, /@keyframes coinflip-tails/);
  // 规则面板写明 Shadowverse 式进化
  assert.match(js, /每回合最多进化一次/);
  assert.match(js, /本回合刚入场的随从进化后获得突进/);
});

test('契约 R-4：与主游戏共用 localStorage「moonlit:playerId」，旧的卡牌专用账户只读取迁移、不再写入', () => {
  assert.match(js, /const ACCOUNT_KEY = 'moonlit:playerId'/);
  assert.match(js, /store\.set\(ACCOUNT_KEY, S\.playerId\)/);
  assert.doesNotMatch(js, /store\.set\(\s*(?:'moonlit:cardPlayerId'|LEGACY_CARD_ACCOUNT_KEY)/);
  assert.match(js, /\/api\/account\/create/);
});

test('契约 R-3：对局响应里的 reward 会被记下，胜利画面显示钻石奖励或今日已领满', () => {
  assert.match(js, /function noteReward\(/);
  assert.match(js, /'reward' in r/);
  assert.match(js, /胜利奖励/);
  assert.match(js, /场胜利奖励已领完/);
  assert.match(js, /\/api\/rewards\/status/);
});

test('B17：卡面与头像换成厚涂位图时加统一的「AI 生成」角标', () => {
  assert.match(js, /import \{[^}]*\baiBadge\b[^}]*\} from '\.\/paint\.js'/);
  assert.match(js, /aiPaintedClass\(artSrc\)/);
  assert.match(js, /aiBadge\(info\.portrait\)/);
  assert.match(css, /\.card \.art \.ai-badge/);
});
