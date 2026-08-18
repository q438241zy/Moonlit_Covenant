/**
 * 后台数据分析
 * 纯内存实现，追踪DAU/WAU/MAU、留存、事件统计等
 */

/**
 * 创建分析数据存储
 * @returns {object} 内存分析存储
 */
export function createAnalyticsStore() {
  return {
    // 事件日志：[{sessionId, event, userId, at}]
    events: [],
    // 每日活跃用户：Map<dateKey, Set<userId>>
    dailyActive: new Map(),
    // 用户首次出现日期：Map<userId, dateKey>
    firstSeen: new Map(),
    // 会话记录：Map<sessionId, {userId, startAt, lastAt, events[]}>
    sessions: new Map(),
    // 实时在线：Map<sessionId, lastActiveAt>
    onlineSessions: new Map()
  };
}

/**
 * 追踪会话事件
 * @param {object} store - 分析存储
 * @param {string} sessionId - 会话ID
 * @param {string} event - 事件类型（login, chat, battle, gacha, purchase等）
 * @param {string} [userId] - 用户ID（可选）
 */
export function trackSession(store, sessionId, event, userId) {
  const now = Date.now();
  const dateKey = toDateKey(now);

  // 记录事件
  store.events.push({ sessionId, event, userId: userId || null, at: now });

  // 限制事件日志大小（保留最近10000条）
  if (store.events.length > 10000) {
    store.events.splice(0, store.events.length - 10000);
  }

  // 更新会话信息
  if (!store.sessions.has(sessionId)) {
    store.sessions.set(sessionId, {
      userId: userId || null,
      startAt: now,
      lastAt: now,
      events: [event]
    });
  } else {
    const session = store.sessions.get(sessionId);
    session.lastAt = now;
    session.events.push(event);
    if (userId) session.userId = userId;
  }

  // 更新在线状态
  store.onlineSessions.set(sessionId, now);

  // 清理超时在线会话（30分钟无活动视为离线）
  const timeout = 30 * 60 * 1000;
  for (const [sid, lastAt] of store.onlineSessions) {
    if (now - lastAt > timeout) {
      store.onlineSessions.delete(sid);
    }
  }
}

/**
 * 标记用户今日活跃
 * @param {object} store - 分析存储
 * @param {string} userId - 用户ID
 */
export function trackDailyActive(store, userId) {
  const now = Date.now();
  const dateKey = toDateKey(now);

  if (!store.dailyActive.has(dateKey)) {
    store.dailyActive.set(dateKey, new Set());
  }
  store.dailyActive.get(dateKey).add(userId);

  // 记录首次出现
  if (!store.firstSeen.has(userId)) {
    store.firstSeen.set(userId, dateKey);
  }
}

/**
 * 获取仪表盘数据
 * @param {object} store - 分析存储
 * @returns {object} 完整仪表盘数据
 */
export function getDashboardData(store) {
  const now = Date.now();
  const todayKey = toDateKey(now);

  // DAU / WAU / MAU
  const dau = countActiveInRange(store, now, 1);
  const wau = countActiveInRange(store, now, 7);
  const mau = countActiveInRange(store, now, 30);

  // 留存率
  const retention = {
    d1: calcRetention(store, 1),
    d7: calcRetention(store, 7),
    d30: calcRetention(store, 30)
  };

  // 平均会话时长（分钟）
  let totalMinutes = 0;
  let sessionCount = 0;
  for (const session of store.sessions.values()) {
    const duration = (session.lastAt - session.startAt) / 60000;
    totalMinutes += Math.max(0, duration);
    sessionCount++;
  }
  const avgSessionMinutes = sessionCount > 0 ? Math.round((totalMinutes / sessionCount) * 10) / 10 : 0;

  // 峰值小时
  const peakHour = calcPeakHour(store);

  // 按类型统计事件
  const eventsByType = {};
  for (const evt of store.events) {
    eventsByType[evt.event] = (eventsByType[evt.event] || 0) + 1;
  }

  // 最近7天趋势
  const last7days = [];
  for (let i = 6; i >= 0; i--) {
    const dayTime = now - i * 24 * 60 * 60 * 1000;
    const dayKey = toDateKey(dayTime);
    const activeSet = store.dailyActive.get(dayKey);
    const active = activeSet ? activeSet.size : 0;

    // 当日新用户数
    let newUsers = 0;
    for (const [, firstDate] of store.firstSeen) {
      if (firstDate === dayKey) newUsers++;
    }

    // 当日会话数
    const dayStart = new Date(dayKey + 'T00:00:00').getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    let sessions = 0;
    for (const session of store.sessions.values()) {
      if (session.startAt >= dayStart && session.startAt < dayEnd) sessions++;
    }

    last7days.push({ date: dayKey, active, newUsers, sessions });
  }

  return {
    dau,
    wau,
    mau,
    retention,
    avgSessionMinutes,
    totalSessions: store.sessions.size,
    peakHour,
    eventsByType,
    last7days
  };
}

/**
 * 获取实时统计
 * @param {object} store - 分析存储
 * @returns {{onlineNow: number, todayActive: number, todayNew: number, todaySessions: number}}
 */
export function getRealtimeStats(store) {
  const now = Date.now();
  const todayKey = toDateKey(now);

  // 清理超时在线
  const timeout = 30 * 60 * 1000;
  for (const [sid, lastAt] of store.onlineSessions) {
    if (now - lastAt > timeout) {
      store.onlineSessions.delete(sid);
    }
  }

  const todayActiveSet = store.dailyActive.get(todayKey);
  const todayActive = todayActiveSet ? todayActiveSet.size : 0;

  // 今日新用户
  let todayNew = 0;
  for (const [, firstDate] of store.firstSeen) {
    if (firstDate === todayKey) todayNew++;
  }

  // 今日会话数
  const dayStart = new Date(todayKey + 'T00:00:00').getTime();
  let todaySessions = 0;
  for (const session of store.sessions.values()) {
    if (session.startAt >= dayStart) todaySessions++;
  }

  return {
    onlineNow: store.onlineSessions.size,
    todayActive,
    todayNew,
    todaySessions
  };
}

// ===== 内部工具函数 =====

function toDateKey(timestamp) {
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 统计N天内的独立活跃用户数
function countActiveInRange(store, now, days) {
  const users = new Set();
  for (let i = 0; i < days; i++) {
    const key = toDateKey(now - i * 24 * 60 * 60 * 1000);
    const activeSet = store.dailyActive.get(key);
    if (activeSet) {
      for (const uid of activeSet) users.add(uid);
    }
  }
  return users.size;
}

// 计算N日留存率：N天前注册的用户中，今天仍活跃的比例
function calcRetention(store, days) {
  const now = Date.now();
  const targetKey = toDateKey(now - days * 24 * 60 * 60 * 1000);
  const todayKey = toDateKey(now);

  // 找到targetDay注册的用户
  const cohort = [];
  for (const [userId, firstDate] of store.firstSeen) {
    if (firstDate === targetKey) cohort.push(userId);
  }

  if (cohort.length === 0) return 0;

  // 检查今天是否活跃
  const todayActive = store.dailyActive.get(todayKey);
  if (!todayActive) return 0;

  const retained = cohort.filter((uid) => todayActive.has(uid)).length;
  return Math.round((retained / cohort.length) * 1000) / 10; // 百分比，保留一位小数
}

// 计算峰值小时（0-23）
function calcPeakHour(store) {
  const hourCounts = new Array(24).fill(0);
  for (const evt of store.events) {
    const hour = new Date(evt.at).getHours();
    hourCounts[hour]++;
  }

  let peak = 0;
  let maxCount = 0;
  for (let h = 0; h < 24; h++) {
    if (hourCounts[h] > maxCount) {
      maxCount = hourCounts[h];
      peak = h;
    }
  }
  return peak;
}
