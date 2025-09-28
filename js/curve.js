// HanziItem 结构说明:
// {
//   id: string,          // 唯一ID
//   char: string,        // 汉字
//   lesson: number,      // 所属课次
//   last_ts?: number,    // 上次测试时间 ms
//   stability_days?: number, // 记忆稳定度，默认1
//   ease?: number,       // 易度，默认2.0
//   history?: Array<{ts:number, correct:boolean}>
// }

// ---- 参数可按需微调 ----
const FORGET_THRESHOLD = 0.35;     // 遗忘概率阈值：>= 0.35 列为“应复习”
const MAX_TOTAL_QUESTIONS = 15;    // 本次总题量上限
const NEAR_DUE_PICK = 10;          // 不足时“临近遗忘”补充数量

function daysBetween(ms1, ms2) {
  return Math.max(0, (ms2 - ms1) / (1000 * 60 * 60 * 24));
}

function ensureDefaults(item) {
  if (item.stability_days == null) item.stability_days = 1.0;
  if (item.ease == null) item.ease = 2.0;
  if (!item.history) item.history = [];
  return item;
}

// 计算遗忘概率 P_forget = 1 - exp(-t/S)
function forgettingProb(item, nowMs) {
  ensureDefaults(item);
  const last = item.last_ts ?? (nowMs - 24*3600*1000); // 没历史则视为一天前学过
  const t = daysBetween(last, nowMs);
  const S = Math.max(0.25, item.stability_days); // 稍作下限保护
  const R = Math.exp(-t / S);
  return 1 - R;
}

// 在一次测试后更新记忆参数
function updateAfterAnswer(item, correct, nowMs) {
  ensureDefaults(item);
  if (correct) {
    item.ease += 0.1;
    item.stability_days *= (1 + 0.15 * item.ease); // 正确显著拉长间隔
  } else {
    item.ease = Math.max(1.3, item.ease - 0.2);
    item.stability_days = Math.max(0.5, item.stability_days * 0.5);
  }
  item.last_ts = nowMs;
  item.history.push({ ts: nowMs, correct });
  return item;
}

/**
 * 选出本次测试的题目
 * @param {HanziItem[]} allItems      全部字
 * @param {number} currentLesson      当前课次
 * @param {number} nowMs              当前时间戳
 * @returns {HanziItem[]}             本次测试列表
 */
function selectForSession(allItems, currentLesson, nowMs = Date.now()) {
  const items = allItems.map(ensureDefaults);

  // 1) 当前课 5 个必出
  const current = items
    .filter(x => x.lesson === currentLesson)
    .slice(0, 5); // 保护一下，防止数据异常

  // 2) 旧课项：计算遗忘概率
  const prev = items.filter(x => x.lesson < currentLesson);
  const scored = prev.map(x => ({
    item: x,
    p: forgettingProb(x, nowMs)
  }));

  // 2a) 必复习：p >= 阈值
  const must = scored
    .filter(s => s.p >= FORGET_THRESHOLD)
    .sort((a,b) => b.p - a.p)
    .map(s => s.item);

  // 2b) 若不足，上补“临近遗忘”的（按 p 高到低）
  const picked = [...must];
  if (picked.length + current.length < MAX_TOTAL_QUESTIONS) {
    const remain = MAX_TOTAL_QUESTIONS - current.length - picked.length;
    const near = scored
      .filter(s => s.p < FORGET_THRESHOLD)
      .sort((a,b) => b.p - a.p)
      .slice(0, Math.min(NEAR_DUE_PICK, remain))
      .map(s => s.item);
    picked.push(...near);
  }

  // 3) 合并并去重（防止同字重复）
  const seen = new Set();
  const result = [...current, ...picked].filter(it => {
    if (seen.has(it.id)) return false;
    seen.add(it.id);
    return true;
  });

  // 4) 最终截断到上限
  return result.slice(0, MAX_TOTAL_QUESTIONS);
}

// 将函数暴露到全局作用域，以便在 HTML 中使用
if (typeof window !== 'undefined') {
  window.forgettingProb = forgettingProb;
  window.updateAfterAnswer = updateAfterAnswer;
  window.selectForSession = selectForSession;
  window.ensureDefaults = ensureDefaults;
  window.daysBetween = daysBetween;
}
