/**
 * Everything the Netlify mail functions need from the engine, bundled by
 * scripts/gen-engine.mjs into netlify/functions/_shared/engine.mjs. One
 * source of truth: the mail and the app cannot disagree about today's plan.
 * Nothing imported here may touch the DOM, React or localStorage.
 */

export { parseState } from '@/lib/parse';
export { defaultState, DEFAULT_SETTINGS, DATA_EPOCH, isStaleEpoch, freshForNewEpoch } from '@/lib/schema';
export {
  todayISO,
  istClock,
  istMinutes,
  addDays,
  daysBetween,
  configureMission,
  missionTotalDays,
  formatShort,
  formatLong,
  formatWeekday,
  weekdayOf,
  DAY_START_HOUR,
  TARGET_DATE,
} from '@/engine/dates';
export { programInfo } from '@/engine/program';
export { buildAmazonDay, dailyBudget } from '@/engine/amazon-plan';
export { amazonSummary, amazonLoggedOn } from '@/engine/amazon-stats';
export { AMAZON_ITEMS, amazonItem, revisionsDue } from '@/engine/amazon';
export { AMAZON_DAYS, AMAZON_DAYOF, lcUrl } from '@/data/amazon';
export { buildSchedule, daySlots, studyCapacity, dayTypeOf, formatHM, weekdaySleepHours } from '@/engine/schedule';
export { sessionFor, exerciseSlotFor, fitnessWeek, fitnessStreak } from '@/engine/fitness';
export { FAT_LOSS_NOTE } from '@/data/fitness';
export { quoteForDay, EVENING_LINES } from '@/data/quotes';
export { buildPlan } from '@/engine/planner';
export { todayWork, amazonSlotItems, generalSlotItems } from '@/engine/today-items';
export { dayScore, plannedHits, dayExtras, executionStreak } from '@/engine/scoring';
export { buildPraise } from '@/engine/praise';
export { dsaTotals, dsaStreak } from '@/engine/dsa';
export { taskById } from '@/data/tasks';
export { FOUNDATION_SUBJECTS, coachFor } from '@/data/foundation';
export { DAY_TYPE_LABEL } from '@/data/routine';
