// HanziItem 结构说明:
// {
//   id: string,          // 唯一ID
//   char: string,        // 汉字
//   lesson: number,      // 所属课次
//   last_ts?: number,    // 上次测试时间 ms
//   nextReviewAt?: number, // 下次复习时间戳 ms
//   level?: number,      // 复习等级，0, 1, 2...
//   mistakeCount?: number, // 累计错误次数
//   isLeech?: boolean,   // 是否为难点词
//   history?: Array<{ts:number, correct:boolean}>
// }

// ---- SRS 参数 ----
// 刚学完，第二天第三天也要学习
const SRS_INTERVALS = [0, 1, 1, 3, 7, 15, 30, 60, 120, 180, 365];
const MAX_TOTAL_QUESTIONS = 20; // 本次总题量上限

/**
 * 确保数据项具有所有必要字段，用于迁移和兼容
 */
function ensureDefaults(item) {
  if (item.level === undefined || item.level === null) item.level = 0;
  if (item.mistakeCount === undefined || item.mistakeCount === null)
    item.mistakeCount = 0;
  if (item.isLeech === undefined || item.isLeech === null) item.isLeech = false;
  if (item.nextReviewAt === undefined || item.nextReviewAt === null) {
    // 迁移旧数据：如果没记录则设为现在，如果是很久以前学的也设为现在
    item.nextReviewAt = item.last_ts || Date.now();
  }
  if (!item.history) item.history = [];
  return item;
}

/**
 * 计算遗忘概率（兼容旧 UI）
 * 1.0 表示已到期或过期
 * 0.5 表示还有不到 24 小时到期
 * 0.0 表示还早
 */
function forgettingProb(item, nowMs) {
  ensureDefaults(item);
  const diff = item.nextReviewAt - nowMs;
  if (diff <= 0) return 1.0;

  const oneDay = 24 * 3600 * 1000;
  if (diff < oneDay) return 0.5;

  return 0.0;
}

/**
 * 在一次测试后更新 SRS 参数
 * @param {HanziItem} item
 * @param {string|boolean} result    'correct' (or true), 'wrong' (or false), 'blurry'
 * @param {number} nowMs
 */
function updateAfterAnswer(item, result, nowMs) {
  ensureDefaults(item);

  if (result === "correct" || result === true) {
    // 答对了
    // 特殊情况：如果是第一次测试（历史为空）且当前等级为 0，说明是熟词，直接跳级到 Level 3 (约 15 天)
    if (item.level === 0 && (!item.history || item.history.length === 0)) {
      item.level = 3;
    } else {
      item.level++;
    }

    item.mistakeCount = 0;
    item.isLeech = false;

    // 获取间隔，如果超出定义范围则使用最后一个间隔
    const intervalDays =
      item.level < SRS_INTERVALS.length
        ? SRS_INTERVALS[item.level]
        : SRS_INTERVALS[SRS_INTERVALS.length - 1];

    item.nextReviewAt = nowMs + intervalDays * 24 * 60 * 60 * 1000;
  } else if (result === "blurry") {
    // 模糊：Level 不变，下次学习 +1 天
    // 不重置错误次数，也不增加等级
    item.nextReviewAt = nowMs + 1 * 24 * 60 * 60 * 1000;
  } else {
    // 答错了
    item.level = 0;
    item.mistakeCount++;
    item.isLeech = item.mistakeCount >= 3;
    item.nextReviewAt = nowMs; // 答错后立即（今天）再次复习
  }
  item.last_ts = nowMs;
  item.history.push({ ts: nowMs, result: String(result) });
  return item;
}

/**
 * 选出本次测试的题目
 * @param {HanziItem[]} allItems      全部字
 * @param {number} currentLesson      当前课次（新逻辑主要参考 nextReviewAt，此参数保留兼容）
 * @param {number} nowMs              当前时间戳
 * @returns {HanziItem[]}             本次测试列表
 */
function selectForSession(allItems, currentLesson, nowMs = Date.now(), limit = MAX_TOTAL_QUESTIONS) {
  const items = allItems.map(ensureDefaults);

  // 1) 排序：优先选择没有历史记录的（从没测试过的），其次按 nextReviewAt 排序
  const sorted = [...items].sort((a, b) => {
    const aNew = !a.history || a.history.length === 0;
    const bNew = !b.history || b.history.length === 0;

    if (aNew !== bNew) {
      return aNew ? -1 : 1; // 新词排前面
    }

    // 都不是新词或都是新词，按复习时间排序
    return a.nextReviewAt - b.nextReviewAt;
  });

  // 2) 打印调试信息
  const newWords = sorted.filter(it => !it.history || it.history.length === 0);
  const reviewWords = sorted.filter(it => it.history && it.history.length > 0);
  const due = reviewWords.filter((it) => it.nextReviewAt <= nowMs);
  
  console.log(`[SRS] 候选池详情: 新词=${newWords.length}, 复习词=${reviewWords.length} (其中已到期=${due.length})`);
  console.log(`[SRS] 最终从候选池取出前 ${limit} 个作为备选`);

  // 3) 返回前 limit 个
  return sorted.slice(0, limit);
}

// 辅助函数
function daysBetween(ms1, ms2) {
  return Math.max(0, (ms2 - ms1) / (1000 * 60 * 60 * 24));
}

// 将函数暴露到全局作用域
if (typeof window !== "undefined") {
  window.forgettingProb = forgettingProb;
  window.updateAfterAnswer = updateAfterAnswer;
  window.selectForSession = selectForSession;
  window.ensureDefaults = ensureDefaults;
  window.daysBetween = daysBetween;
}
