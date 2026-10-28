// GENERATED, DO NOT EDIT.
// Built by scripts/gen-engine.mjs from src/engine/server-entry.ts (one engine
// for the app and the mail functions). Regenerated on every build; edit the
// TypeScript sources under src/ and run `npm run gen:engine`.
// src/engine/dates.ts
var IST_OFFSET_MINUTES = 330;
var MS_PER_DAY = 864e5;
var DAY_START_HOUR = 4;
var TARGET_DATE = "2027-03-10";
var pad = (n) => String(n).padStart(2, "0");
function parseDay(iso2) {
  return /* @__PURE__ */ new Date(`${iso2}T12:00:00`);
}
function formatISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function todayISO(now = /* @__PURE__ */ new Date()) {
  const shifted = new Date(now.getTime() + IST_OFFSET_MINUTES * 6e4 - DAY_START_HOUR * 36e5);
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}
function istClock(now = /* @__PURE__ */ new Date()) {
  const shifted = new Date(now.getTime() + IST_OFFSET_MINUTES * 6e4);
  return `${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`;
}
function istMinutes(now = /* @__PURE__ */ new Date()) {
  const [h, m] = istClock(now).split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
function addDays(iso2, delta) {
  const d = parseDay(iso2);
  d.setDate(d.getDate() + delta);
  return formatISO(d);
}
function daysBetween(from, to) {
  return Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / MS_PER_DAY);
}
var generalStart = null;
function configureMission(start) {
  generalStart = start ?? null;
}
function missionStart() {
  return generalStart ?? todayISO();
}
function missionTotalDays() {
  return Math.max(60, daysBetween(missionStart(), TARGET_DATE) + 1);
}
function dateForDay(n) {
  return addDays(missionStart(), n - 1);
}
function dayForDate(iso2) {
  return daysBetween(missionStart(), iso2) + 1;
}
function clampDay(n) {
  const total = missionTotalDays();
  if (n < 1) return 1;
  if (n > total) return total;
  return n;
}
function currentDay() {
  return clampDay(dayForDate(todayISO()));
}
function weekdayOf(iso2) {
  return parseDay(iso2).getDay();
}
function isSunday(iso2) {
  return weekdayOf(iso2) === 0;
}
function weekOfDay(n) {
  return Math.ceil(n / 7);
}
function formatLong(iso2) {
  return parseDay(iso2).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}
function formatShort(iso2) {
  return parseDay(iso2).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function formatWeekday(iso2) {
  return parseDay(iso2).toLocaleDateString("en-IN", { weekday: "long" });
}

// src/lib/schema.ts
var STATE_VERSION = 3;
var DATA_EPOCH = 5;
var SETTINGS_VERSION = 2;
var DEFAULT_SETTINGS = {
  settingsVersion: SETTINGS_VERSION,
  name: "Ruturaj",
  wakeTime: "07:00",
  exerciseStart: "07:10",
  exerciseEnd: "08:00",
  officeStart: "08:45",
  officeEnd: "17:00",
  officeStudyHours: 0,
  studyBlock1Start: "18:00",
  studyBlock1End: "20:00",
  studyBlock2Start: "21:00",
  studyBlock2End: "23:00",
  walkEnd: "23:30",
  studyBlock3End: "01:00",
  studyBlock3Enabled: true,
  weekendWakeTime: "08:00",
  weekendSleepTime: "23:30",
  exerciseSlot: "morning",
  timezone: "Asia/Kolkata",
  morningEmailTime: "06:00",
  eveningEmailTime: "17:00",
  emailEnabled: true,
  deepWorkMinutes: 50,
  dsaTargetPerDay: 3
};
var DEFAULT_PROGRAM = {
  phase: "amazon",
  amazonWindowDays: 14,
  amazonExtendedDays: 0
};
var DEFAULT_AMAZON = {
  stage: "awaiting_invite",
  oaDate: "2026-10-19",
  items: {},
  extras: {},
  solidTopics: []
};
function defaultState() {
  return {
    version: STATE_VERSION,
    dataEpoch: DATA_EPOCH,
    // "Never written": a fresh device must lose to any real copy on the server.
    updatedAt: (/* @__PURE__ */ new Date(0)).toISOString(),
    program: { ...DEFAULT_PROGRAM },
    amazon: { ...DEFAULT_AMAZON, items: {}, extras: {}, solidTopics: [] },
    foundation: {},
    tasks: {},
    days: {},
    praiseSeen: {},
    habits: {},
    dsa: [],
    deepWork: [],
    runs: [],
    exerciseOverrides: {},
    work: [],
    applications: [],
    health: { supplements: [], labs: [], sleep: {}, adherence: {}, focus: [], weight: {} },
    settings: { ...DEFAULT_SETTINGS },
    weeklyReviews: {}
  };
}
function isStaleEpoch(state) {
  return state.dataEpoch < DATA_EPOCH;
}
var PREFERENCE_KEYS = ["emailEnabled", "dsaTargetPerDay", "deepWorkMinutes", "name"];
function freshForNewEpoch(from, today = todayISO()) {
  const fresh = defaultState();
  for (const key of PREFERENCE_KEYS) {
    fresh.settings[key] = from.settings[key];
  }
  fresh.amazon = structuredClone(from.amazon);
  fresh.program = {
    ...from.program,
    amazonExtendedDays: 0,
    ...from.program.startedOn ? { startedOn: today } : {},
    ...from.program.generalStartedOn ? { generalStartedOn: today } : {},
    ...from.program.amazonCompletedOn ? { amazonCompletedOn: today } : {}
  };
  fresh.health.supplements = from.health.supplements;
  fresh.health.labs = from.health.labs;
  fresh.health.nextTestDate = from.health.nextTestDate;
  fresh.health.focus = from.health.focus;
  fresh.health.weight = from.health.weight;
  fresh.work = from.work;
  fresh.applications = from.applications;
  return fresh;
}

// src/lib/parse.ts
var isObj = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
var arr = (v) => Array.isArray(v) ? v : [];
var objs = (v) => arr(v).filter(isObj);
var rec = (v) => isObj(v) ? v : {};
var str = (v) => typeof v === "string" ? v : void 0;
var num = (v) => typeof v === "number" && Number.isFinite(v) ? v : void 0;
var ISO = /^\d{4}-\d{2}-\d{2}$/;
var HHMM = /^\d{2}:\d{2}$/;
var iso = (v) => typeof v === "string" && ISO.test(v) ? v : void 0;
var strings = (v) => arr(v).filter((x) => typeof x === "string");
var numbers = (v) => Object.fromEntries(
  Object.entries(rec(v)).filter(
    (e) => typeof e[1] === "number" && Number.isFinite(e[1]) && e[1] > 0
  )
);
var STAGES = ["awaiting_invite", "interview_scheduled", "interview_done"];
var OUTCOMES = ["independent", "hint", "reviewed"];
var KINDS = ["run", "walk", "strength", "mobility", "rest"];
var TASK_STATUS = ["todo", "in_progress", "done", "skipped"];
function parseSettings(raw) {
  const s = isObj(raw) ? raw : {};
  const version = num(s.settingsVersion) ?? 1;
  const out = { ...DEFAULT_SETTINGS };
  const keys = version >= SETTINGS_VERSION ? Object.keys(DEFAULT_SETTINGS) : [...PREFERENCE_KEYS];
  for (const k of keys) {
    const v = s[k];
    const d = DEFAULT_SETTINGS[k];
    if (typeof v !== typeof d) continue;
    if (typeof d === "string" && HHMM.test(d) && !HHMM.test(v)) continue;
    if (typeof d === "number" && !Number.isFinite(v)) continue;
    if (k === "exerciseSlot" && v !== "morning" && v !== "evening") continue;
    out[k] = v;
  }
  out.officeStudyHours = Math.min(3, Math.max(0, out.officeStudyHours));
  out.dsaTargetPerDay = Math.min(10, Math.max(1, Math.round(out.dsaTargetPerDay)));
  out.deepWorkMinutes = Math.min(180, Math.max(10, Math.round(out.deepWorkMinutes)));
  if (!out.name.trim()) out.name = DEFAULT_SETTINGS.name;
  out.settingsVersion = SETTINGS_VERSION;
  return out;
}
function parseDays(raw) {
  const out = {};
  for (const [date, v] of Object.entries(rec(raw))) {
    if (!ISO.test(date) || !isObj(v)) continue;
    const closedAt = str(v.closedAt);
    const notes = str(v.notes);
    const blockers = str(v.blockers);
    const score = num(v.score);
    out[date] = {
      planned: strings(v.planned),
      completed: strings(v.completed),
      ...closedAt ? { closedAt } : {},
      ...notes ? { notes } : {},
      ...blockers ? { blockers } : {},
      ...score !== void 0 ? { score } : {}
    };
  }
  return out;
}
function parseTasks(raw) {
  const out = {};
  for (const [id, v] of Object.entries(rec(raw))) {
    if (!isObj(v)) continue;
    const status = TASK_STATUS.find((s) => s === v.status);
    if (!status) continue;
    out[id] = { ...v, status };
  }
  return out;
}
function parseAmazonItems(raw) {
  const out = {};
  for (const [key, v] of Object.entries(rec(raw))) {
    if (!isObj(v)) continue;
    const doneOn = iso(v.doneOn);
    if (!doneOn) continue;
    const outcome = OUTCOMES.find((o) => o === v.outcome);
    const note = str(v.note);
    const revisitOn = iso(v.revisitOn);
    const minutes = num(v.minutes);
    const history = objs(v.history).filter((h) => iso(h.on)).map((h) => {
      const o = OUTCOMES.find((x) => x === h.outcome);
      const r = iso(h.revisitOn);
      return { on: h.on, ...o ? { outcome: o } : {}, ...r ? { revisitOn: r } : {} };
    });
    out[key] = {
      doneOn,
      ...outcome ? { outcome } : {},
      ...minutes !== void 0 ? { minutes } : {},
      ...note ? { note } : {},
      ...revisitOn ? { revisitOn } : {},
      revisits: num(v.revisits) ?? 0,
      ...history.length ? { history } : {}
    };
  }
  return out;
}
function parseWorkouts(raw) {
  return objs(raw).filter((w) => typeof w.id === "string" && iso(w.date)).map((w) => ({
    id: w.id,
    date: w.date,
    slot: w.slot === "evening" ? "evening" : "morning",
    // Pre-redesign entries were runs only and carried no kind.
    kind: KINDS.find((k) => k === w.kind) ?? "run",
    minutes: num(w.minutes) ?? 0,
    ...typeof w.km === "number" && w.km > 0 ? { km: w.km } : {},
    ...Array.isArray(w.parts) ? { parts: strings(w.parts) } : {}
  }));
}
function parseState(raw) {
  const base = defaultState();
  if (!isObj(raw)) return base;
  const health = isObj(raw.health) ? raw.health : {};
  const program = isObj(raw.program) ? raw.program : {};
  const amazon = isObj(raw.amazon) ? raw.amazon : {};
  const startedOn = iso(program.startedOn);
  const amazonCompletedOn = iso(program.amazonCompletedOn);
  const generalStartedOn = iso(program.generalStartedOn);
  const interviewDate = iso(amazon.interviewDate);
  const interviewNote = str(amazon.interviewNote);
  const windowDays = num(program.amazonWindowDays);
  return {
    version: num(raw.version) ?? STATE_VERSION,
    dataEpoch: num(raw.dataEpoch) ?? 0,
    updatedAt: str(raw.updatedAt) ?? base.updatedAt,
    program: {
      ...DEFAULT_PROGRAM,
      ...startedOn ? { startedOn } : {},
      phase: program.phase === "general" ? "general" : "amazon",
      amazonWindowDays: windowDays !== void 0 && windowDays >= 1 ? Math.round(windowDays) : DEFAULT_PROGRAM.amazonWindowDays,
      amazonExtendedDays: Math.max(0, num(program.amazonExtendedDays) ?? 0),
      ...amazonCompletedOn ? { amazonCompletedOn } : {},
      ...generalStartedOn ? { generalStartedOn } : {}
    },
    amazon: {
      stage: STAGES.find((s) => s === amazon.stage) ?? DEFAULT_AMAZON.stage,
      oaDate: iso(amazon.oaDate) ?? DEFAULT_AMAZON.oaDate,
      ...interviewDate ? { interviewDate } : {},
      ...interviewNote ? { interviewNote } : {},
      items: parseAmazonItems(amazon.items),
      extras: Object.fromEntries(
        Object.entries(rec(amazon.extras)).filter((e) => Boolean(iso(e[1])))
      ),
      solidTopics: strings(amazon.solidTopics)
    },
    foundation: Object.fromEntries(Object.entries(rec(raw.foundation)).filter((e) => e[1] === true)),
    foundationUnlockedAt: str(raw.foundationUnlockedAt),
    foundationOverride: raw.foundationOverride === true,
    tasks: parseTasks(raw.tasks),
    days: parseDays(raw.days),
    praiseSeen: Object.fromEntries(Object.entries(rec(raw.praiseSeen)).filter((e) => e[1] === true)),
    habits: Object.fromEntries(Object.entries(rec(raw.habits)).map(([d, ids]) => [d, strings(ids)])),
    dsa: objs(raw.dsa).filter((a) => typeof a.problem === "string" && iso(a.date)),
    deepWork: objs(raw.deepWork).filter((d) => iso(d.date) && typeof d.actualMinutes === "number"),
    runs: parseWorkouts(raw.runs),
    exerciseOverrides: Object.fromEntries(
      Object.entries(rec(raw.exerciseOverrides)).filter(
        (e) => ISO.test(e[0]) && (e[1] === "morning" || e[1] === "evening" || e[1] === "rest")
      )
    ),
    work: objs(raw.work).filter((w) => typeof w.raw === "string"),
    applications: objs(raw.applications).filter((a) => typeof a.company === "string"),
    health: {
      supplements: objs(health.supplements),
      labs: objs(health.labs).filter((l) => typeof l.marker === "string"),
      nextTestDate: iso(health.nextTestDate),
      sleep: numbers(health.sleep),
      adherence: Object.fromEntries(Object.entries(rec(health.adherence)).map(([d, ids]) => [d, strings(ids)])),
      focus: strings(health.focus),
      weight: numbers(health.weight)
    },
    settings: parseSettings(raw.settings),
    weeklyReviews: Object.fromEntries(Object.entries(rec(raw.weeklyReviews)).filter((e) => isObj(e[1])))
  };
}

// src/engine/program.ts
function programInfo(state, today = todayISO()) {
  const p = state.program;
  const started = Boolean(p.startedOn);
  const startedOn = p.startedOn ?? today;
  const day = started ? Math.max(1, daysBetween(startedOn, today) + 1) : 0;
  const windowDays = p.amazonWindowDays + p.amazonExtendedDays;
  const endsOn = addDays(startedOn, windowDays - 1);
  const overrun = started && p.phase === "amazon" && today > endsOn;
  const generalStarted = p.phase === "general" && Boolean(p.generalStartedOn);
  const totalDays = missionTotalDays();
  const generalDay = generalStarted ? clampDay(dayForDate(today)) : 0;
  return {
    started,
    startedOn,
    day,
    phase: p.phase,
    amazon: {
      day: Math.max(1, daysBetween(startedOn, today) + 1),
      windowDays,
      endsOn,
      // Inclusive of today: on the last day of the window this reads 1.
      daysLeft: overrun ? 0 : Math.max(0, daysBetween(today, endsOn) + 1),
      overrun
    },
    general: {
      started: generalStarted,
      startedOn: p.generalStartedOn ?? null,
      day: generalDay,
      totalDays,
      daysLeft: generalStarted ? Math.max(0, totalDays - generalDay) : totalDays
    },
    daysToTarget: Math.max(0, daysBetween(today, TARGET_DATE))
  };
}

// src/data/amazon/plan.json
var plan_default = {
  start: [
    2026,
    9,
    22
  ],
  phases: [
    {
      n: 1,
      name: "Basics",
      range: "Days 1\u20137 \xB7 22\u201328 Oct",
      desc: "Learn each pattern\u2019s template on easy problems, so the harder versions later feel familiar."
    },
    {
      n: 2,
      name: "Core patterns",
      range: "Days 8\u201319 \xB7 29 Oct \u2013 9 Nov",
      desc: "The must-do medium problems for every pattern Amazon tests, with a 40-minute timer each."
    },
    {
      n: 3,
      name: "Asked questions and mocks",
      range: "Days 20\u201328 \xB7 10\u201318 Nov",
      desc: "The problems, or their closest matches, from real SDE-1 rounds, plus hard practice and full mocks. <b>If your interview call comes early, jump straight here</b> and fit the rest into the days before the interview."
    }
  ],
  days: [
    {
      n: 1,
      phase: 1,
      title: "Complexity, arrays and hashing",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "You cleared the OA with every test case passing. Bring that same focus for 28 more days.",
      items: [
        {
          t: "task",
          k: "Learn",
          text: "Big-O basics: loops, nested loops, recursion, and how to work out space complexity",
          key: "d1-bigo"
        },
        {
          t: "lc",
          slug: "two-sum",
          name: "Two Sum",
          d: "E",
          a: 1,
          src: [
            "rd1",
            "freq"
          ],
          key: "two-sum",
          n: 1,
          f3: 100,
          f30: 100
        },
        {
          t: "lc",
          slug: "contains-duplicate",
          name: "Contains Duplicate",
          d: "E",
          key: "contains-duplicate",
          n: 217,
          f3: 48.1
        },
        {
          t: "lc",
          slug: "valid-anagram",
          name: "Valid Anagram",
          d: "E",
          key: "valid-anagram",
          n: 242,
          f3: 59.5,
          f30: 61.7
        },
        {
          t: "lc",
          slug: "best-time-to-buy-and-sell-stock",
          name: "Best Time to Buy and Sell Stock",
          d: "E",
          key: "best-time-to-buy-and-sell-stock",
          n: 121,
          f3: 71.5,
          f30: 79.3
        },
        {
          t: "lc",
          slug: "majority-element",
          name: "Majority Element",
          d: "E",
          key: "majority-element",
          n: 169,
          f3: 59.5
        },
        {
          t: "task",
          k: "LP",
          text: "Write your <b>hard deadline</b> story, including how you handled changing requirements",
          src: [
            "lc7724048",
            "lc8542365"
          ],
          key: "d1-lp"
        },
        {
          t: "task",
          k: "Notes",
          text: "Start the mistakes notebook: pattern, key idea, the bug",
          key: "d1-notebook"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "longest-common-prefix",
          name: "Longest Common Prefix",
          d: "E",
          key: "longest-common-prefix",
          n: 14,
          f3: 69.3,
          f30: 61.7
        },
        {
          t: "lc",
          slug: "valid-sudoku",
          name: "Valid Sudoku",
          d: "M",
          key: "valid-sudoku",
          n: 36,
          f3: 61.2,
          f30: 75.9
        },
        {
          t: "lc",
          slug: "first-unique-character-in-a-string",
          name: "First Unique Character in a String",
          d: "E",
          key: "first-unique-character-in-a-string",
          n: 387,
          f3: 36.4
        }
      ]
    },
    {
      n: 2,
      phase: 1,
      title: "Two pointers and prefix sums",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "Two pointers, one goal. Showing up again tomorrow is the whole trick.",
      items: [
        {
          t: "task",
          k: "Learn",
          text: "Watch the two pointers and prefix sums concept video (videsiqna.in or NeetCode), then solve without hints",
          key: "d2-learn"
        },
        {
          t: "lc",
          slug: "valid-palindrome",
          name: "Valid Palindrome",
          d: "E",
          key: "valid-palindrome",
          n: 125,
          f3: 48.1
        },
        {
          t: "lc",
          slug: "merge-sorted-array",
          name: "Merge Sorted Array",
          d: "E",
          key: "merge-sorted-array",
          n: 88,
          f3: 55.7
        },
        {
          t: "lc",
          slug: "move-zeroes",
          name: "Move Zeroes",
          d: "E",
          a: 2,
          src: [
            "gfg2022",
            "freq"
          ],
          key: "move-zeroes",
          n: 283,
          f3: 71.5,
          f30: 72
        },
        {
          t: "lc",
          slug: "two-sum-ii-input-array-is-sorted",
          name: "Two Sum II",
          d: "M",
          a: 1,
          src: [
            "rd1"
          ],
          note: "Then your own version: the largest pair sum \u2264 X (the asked ladder)",
          key: "two-sum-ii-input-array-is-sorted",
          n: 167,
          f3: 44.9
        },
        {
          t: "lc",
          slug: "running-sum-of-1d-array",
          name: "Running Sum of 1d Array",
          d: "E",
          key: "running-sum-of-1d-array",
          n: 1480,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "find-pivot-index",
          name: "Find Pivot Index",
          d: "E",
          key: "find-pivot-index",
          n: 724,
          f3: 41
        },
        {
          t: "task",
          k: "LP",
          text: "<b>Going beyond your responsibility</b>",
          src: [
            "lc6393977",
            "lc7035289"
          ],
          key: "d2-lp"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "remove-duplicates-from-sorted-array",
          name: "Remove Duplicates from Sorted Array",
          d: "E",
          key: "remove-duplicates-from-sorted-array",
          n: 26,
          f3: 57.7,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "sort-colors",
          name: "Sort Colors",
          d: "M",
          key: "sort-colors",
          n: 75,
          f3: 36.4
        }
      ]
    },
    {
      n: 3,
      phase: 1,
      title: "Binary search and sliding window",
      hours: "Full day \xB7 ~11 h",
      weekend: true,
      coach: "Binary search your doubts: cut them in half every day until only the answer is left.",
      items: [
        {
          t: "task",
          k: "Learn",
          text: "Watch the binary search and sliding window concept video (videsiqna.in or NeetCode), then solve without hints",
          key: "d3-learn"
        },
        {
          t: "lc",
          slug: "binary-search",
          name: "Binary Search",
          d: "E",
          key: "binary-search",
          n: 704,
          f3: 50.9,
          f30: 67.4
        },
        {
          t: "lc",
          slug: "search-insert-position",
          name: "Search Insert Position",
          d: "E",
          key: "search-insert-position",
          n: 35,
          f3: 48.1
        },
        {
          t: "lc",
          slug: "first-bad-version",
          name: "First Bad Version",
          d: "E",
          key: "first-bad-version",
          n: 278
        },
        {
          t: "lc",
          slug: "sqrtx",
          name: "Sqrt(x)",
          d: "E",
          key: "sqrtx",
          n: 69,
          f3: 59.5,
          f30: 54.4
        },
        {
          t: "lc",
          slug: "maximum-average-subarray-i",
          name: "Maximum Average Subarray I",
          d: "E",
          key: "maximum-average-subarray-i",
          n: 643,
          f3: 50.9
        },
        {
          t: "lc",
          slug: "longest-substring-without-repeating-characters",
          name: "Longest Substring Without Repeating Characters",
          d: "M",
          a: 1,
          src: [
            "lc6393977",
            "freq"
          ],
          key: "longest-substring-without-repeating-characters",
          n: 3,
          f3: 79.8,
          f30: 89.7
        },
        {
          t: "task",
          k: "LP",
          text: "A <b>missed deadline</b>: how you told stakeholders and what you would do differently",
          src: [
            "lc6393977",
            "lc6738470"
          ],
          key: "d3-lp"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "find-first-and-last-position-of-element-in-sorted-array",
          name: "Find First and Last Position of Element in Sorted Array",
          d: "M",
          key: "find-first-and-last-position-of-element-in-sorted-array",
          n: 34,
          f3: 50.9,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "max-consecutive-ones-iii",
          name: "Max Consecutive Ones III",
          d: "M",
          key: "max-consecutive-ones-iii",
          n: 1004,
          f3: 55.7,
          f30: 67.4
        },
        {
          t: "lc",
          slug: "search-a-2d-matrix-ii",
          name: "Search a 2D Matrix II",
          d: "M",
          key: "search-a-2d-matrix-ii",
          n: 240,
          f3: 48.1,
          f30: 44.3
        }
      ]
    },
    {
      n: 4,
      phase: 1,
      title: "Recursion and binary trees + mock 0",
      hours: "Full day \xB7 ~11 h",
      weekend: true,
      coach: "First mock today. Talking through your approach feels awkward now and normal by Day 25.",
      items: [
        {
          t: "task",
          k: "Learn",
          text: "Watch the recursion and tree traversal concept video (videsiqna.in or NeetCode), then solve without hints",
          key: "d5-learn"
        },
        {
          t: "lc",
          slug: "binary-tree-inorder-traversal",
          name: "Binary Tree Inorder Traversal",
          d: "E",
          note: "Recursive and iterative",
          key: "binary-tree-inorder-traversal",
          n: 94
        },
        {
          t: "lc",
          slug: "binary-tree-preorder-traversal",
          name: "Binary Tree Preorder Traversal",
          d: "E",
          note: "Recursive and iterative",
          key: "binary-tree-preorder-traversal",
          n: 144,
          f3: 30.5
        },
        {
          t: "lc",
          slug: "binary-tree-postorder-traversal",
          name: "Binary Tree Postorder Traversal",
          d: "E",
          note: "Recursive and iterative",
          key: "binary-tree-postorder-traversal",
          n: 145
        },
        {
          t: "lc",
          slug: "maximum-depth-of-binary-tree",
          name: "Maximum Depth of Binary Tree",
          d: "E",
          key: "maximum-depth-of-binary-tree",
          n: 104,
          f3: 30.5
        },
        {
          t: "lc",
          slug: "invert-binary-tree",
          name: "Invert Binary Tree",
          d: "E",
          key: "invert-binary-tree",
          n: 226
        },
        {
          t: "lc",
          slug: "same-tree",
          name: "Same Tree",
          d: "E",
          key: "same-tree",
          n: 100,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "symmetric-tree",
          name: "Symmetric Tree",
          d: "E",
          key: "symmetric-tree",
          n: 101,
          f3: 30.5
        },
        {
          t: "lc",
          slug: "path-sum",
          name: "Path Sum",
          d: "E",
          note: "Sets up the path-sum questions asked later",
          key: "path-sum",
          n: 112
        },
        {
          t: "lc",
          slug: "binary-tree-level-order-traversal",
          name: "Binary Tree Level Order Traversal",
          d: "M",
          key: "binary-tree-level-order-traversal",
          n: 102,
          f3: 36.4,
          f30: 44.3
        },
        {
          t: "task",
          k: "Mock",
          text: "<b>Mock 0</b> (1 hour): two easy problems, explained out loud with complexity and a dry run",
          key: "d5-mock"
        },
        {
          t: "task",
          k: "Review",
          text: "Re-solve every miss in your notebook from days 1\u20133",
          key: "d5-review"
        },
        {
          t: "task",
          k: "LP",
          text: "A time you had to <b>dive deep</b> into a problem",
          src: [
            "lc7724048",
            "lc8014509"
          ],
          key: "d5-lp"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "balanced-binary-tree",
          name: "Balanced Binary Tree",
          d: "E",
          key: "balanced-binary-tree",
          n: 110,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "convert-sorted-array-to-binary-search-tree",
          name: "Convert Sorted Array to Binary Search Tree",
          d: "E",
          key: "convert-sorted-array-to-binary-search-tree",
          n: 108,
          f3: 36.4,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "generate-parentheses",
          name: "Generate Parentheses",
          d: "M",
          note: "Recursion warm-up for backtracking",
          key: "generate-parentheses",
          n: 22,
          f3: 65.7,
          f30: 72
        }
      ]
    },
    {
      n: 5,
      phase: 1,
      title: "Stacks, queues and linked lists",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "Every bug you log in the notebook is one you won\u2019t repeat in the interview.",
      items: [
        {
          t: "task",
          k: "Learn",
          text: "Watch the stack and linked list concept video (videsiqna.in or NeetCode), then solve without hints",
          key: "d4-learn"
        },
        {
          t: "lc",
          slug: "valid-parentheses",
          name: "Valid Parentheses",
          d: "E",
          key: "valid-parentheses",
          n: 20,
          f3: 65.7,
          f30: 67.4
        },
        {
          t: "lc",
          slug: "implement-queue-using-stacks",
          name: "Implement Queue using Stacks",
          d: "E",
          key: "implement-queue-using-stacks",
          n: 232
        },
        {
          t: "lc",
          slug: "reverse-linked-list",
          name: "Reverse Linked List",
          d: "E",
          key: "reverse-linked-list",
          n: 206,
          f3: 41
        },
        {
          t: "lc",
          slug: "merge-two-sorted-lists",
          name: "Merge Two Sorted Lists",
          d: "E",
          key: "merge-two-sorted-lists",
          n: 21,
          f3: 48.1,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "linked-list-cycle",
          name: "Linked List Cycle",
          d: "E",
          key: "linked-list-cycle",
          n: 141,
          f3: 57.7,
          f30: 61.7
        },
        {
          t: "lc",
          slug: "middle-of-the-linked-list",
          name: "Middle of the Linked List",
          d: "E",
          key: "middle-of-the-linked-list",
          n: 876,
          f3: 41
        },
        {
          t: "task",
          k: "LP",
          text: "<b>Something challenging you built</b>",
          src: [
            "lc6393977",
            "lc7035289"
          ],
          key: "d4-lp"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "asteroid-collision",
          name: "Asteroid Collision",
          d: "M",
          key: "asteroid-collision",
          n: 735,
          f3: 57.7
        },
        {
          t: "lc",
          slug: "palindrome-linked-list",
          name: "Palindrome Linked List",
          d: "E",
          key: "palindrome-linked-list",
          n: 234,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "odd-even-linked-list",
          name: "Odd Even Linked List",
          d: "M",
          key: "odd-even-linked-list",
          n: 328,
          f3: 41
        }
      ]
    },
    {
      n: 6,
      phase: 1,
      title: "BST, heaps and hashing",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "A heap keeps the best on top. So does consistency.",
      items: [
        {
          t: "task",
          k: "Learn",
          text: "Watch the BST and heap concept video (videsiqna.in or NeetCode), then solve without hints",
          key: "d6-learn"
        },
        {
          t: "lc",
          slug: "search-in-a-binary-search-tree",
          name: "Search in a Binary Search Tree",
          d: "E",
          key: "search-in-a-binary-search-tree",
          n: 700
        },
        {
          t: "lc",
          slug: "insert-into-a-binary-search-tree",
          name: "Insert into a Binary Search Tree",
          d: "M",
          a: 1,
          src: [
            "roundz"
          ],
          key: "insert-into-a-binary-search-tree",
          n: 701
        },
        {
          t: "lc",
          slug: "kth-largest-element-in-a-stream",
          name: "Kth Largest Element in a Stream",
          d: "E",
          key: "kth-largest-element-in-a-stream",
          n: 703,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "last-stone-weight",
          name: "Last Stone Weight",
          d: "E",
          key: "last-stone-weight",
          n: 1046
        },
        {
          t: "lc",
          slug: "top-k-frequent-elements",
          name: "Top K Frequent Elements",
          d: "M",
          key: "top-k-frequent-elements",
          n: 347,
          f3: 71.5,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "group-anagrams",
          name: "Group Anagrams",
          d: "M",
          key: "group-anagrams",
          n: 49,
          f3: 73.4,
          f30: 72
        },
        {
          t: "lc",
          slug: "longest-consecutive-sequence",
          name: "Longest Consecutive Sequence",
          d: "M",
          key: "longest-consecutive-sequence",
          n: 128,
          f3: 61.2,
          f30: 54.4
        },
        {
          t: "task",
          k: "Problem",
          text: "Find the households that submitted duplicate interest forms across member lists. Code the O(n\xB7m) brute force first, then the O(n+m) hash-set version.",
          a: 1,
          src: [
            "lc7621408"
          ],
          key: "d6-dupforms"
        },
        {
          t: "task",
          k: "LP",
          text: "<b>Convincing someone</b> of your approach, and <b>a conflict</b>",
          src: [
            "lc7724048",
            "roundz"
          ],
          key: "d6-lp"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "reorganize-string",
          name: "Reorganize String",
          d: "M",
          key: "reorganize-string",
          n: 767,
          f3: 68.2,
          f30: 54.4
        },
        {
          t: "lc",
          slug: "intersection-of-two-arrays",
          name: "Intersection of Two Arrays",
          d: "E",
          note: "Warm-up for the duplicate-forms question",
          key: "intersection-of-two-arrays",
          n: 349,
          f3: 36.4
        }
      ]
    },
    {
      n: 7,
      phase: 1,
      title: "Graphs, greedy and DP basics",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "One week done. Most people stop around now. You are building the habit that gets offers.",
      items: [
        {
          t: "task",
          k: "Learn",
          text: "Watch the BFS/DFS, greedy and DP concept video (videsiqna.in or NeetCode), then solve without hints",
          key: "d7-learn"
        },
        {
          t: "lc",
          slug: "flood-fill",
          name: "Flood Fill",
          d: "E",
          key: "flood-fill",
          n: 733,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "number-of-islands",
          name: "Number of Islands",
          d: "M",
          a: 1,
          src: [
            "lc8014509",
            "lc8029194",
            "freq"
          ],
          key: "number-of-islands",
          n: 200,
          f3: 69.3,
          f30: 79.3
        },
        {
          t: "lc",
          slug: "find-if-path-exists-in-graph",
          name: "Find if Path Exists in Graph",
          d: "E",
          key: "find-if-path-exists-in-graph",
          n: 1971,
          f3: 22.6,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "assign-cookies",
          name: "Assign Cookies",
          d: "E",
          key: "assign-cookies",
          n: 455
        },
        {
          t: "lc",
          slug: "lemonade-change",
          name: "Lemonade Change",
          d: "E",
          key: "lemonade-change",
          n: 860
        },
        {
          t: "lc",
          slug: "climbing-stairs",
          name: "Climbing Stairs",
          d: "E",
          a: 2,
          src: [
            "gfg2022"
          ],
          key: "climbing-stairs",
          n: 70,
          f3: 55.7
        },
        {
          t: "lc",
          slug: "min-cost-climbing-stairs",
          name: "Min Cost Climbing Stairs",
          d: "E",
          key: "min-cost-climbing-stairs",
          n: 746
        },
        {
          t: "lc",
          slug: "house-robber",
          name: "House Robber",
          d: "M",
          a: 1,
          src: [
            "lc8542365",
            "lc8029194",
            "lc7621408"
          ],
          key: "house-robber",
          n: 198,
          f3: 53.4,
          f30: 67.4
        },
        {
          t: "task",
          k: "LP",
          text: "<b>Critical feedback</b> you received and what you changed",
          src: [
            "lc6393977",
            "lc6738470",
            "lc8542365"
          ],
          key: "d7-lp"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "pascals-triangle",
          name: "Pascal's Triangle",
          d: "E",
          key: "pascals-triangle",
          n: 118,
          f3: 48.1
        },
        {
          t: "lc",
          slug: "best-time-to-buy-and-sell-stock-ii",
          name: "Best Time to Buy and Sell Stock II",
          d: "M",
          key: "best-time-to-buy-and-sell-stock-ii",
          n: 122,
          f3: 41,
          f30: 54.4
        }
      ]
    },
    {
      n: 8,
      phase: 2,
      title: "Arrays and prefix sums",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "Prefix sums: small totals add up. So do your nights.",
      items: [
        {
          t: "lc",
          slug: "3sum",
          name: "3Sum",
          d: "M",
          key: "3sum",
          n: 15,
          f3: 69.3,
          f30: 54.4
        },
        {
          t: "lc",
          slug: "container-with-most-water",
          name: "Container With Most Water",
          d: "M",
          key: "container-with-most-water",
          n: 11,
          f3: 71.5,
          f30: 67.4
        },
        {
          t: "lc",
          slug: "product-of-array-except-self",
          name: "Product of Array Except Self",
          d: "M",
          key: "product-of-array-except-self",
          n: 238,
          f3: 62.8,
          f30: 61.7
        },
        {
          t: "lc",
          slug: "subarray-sum-equals-k",
          name: "Subarray Sum Equals K",
          d: "M",
          key: "subarray-sum-equals-k",
          n: 560,
          f3: 69.3,
          f30: 72
        },
        {
          t: "lc",
          slug: "maximum-subarray",
          name: "Maximum Subarray",
          d: "M",
          note: "Kadane: the base for the circular and |a[i] \u2212 a[j]| = k versions asked in 2026",
          key: "maximum-subarray",
          n: 53,
          f3: 69.3,
          f30: 54.4
        },
        {
          t: "lc",
          slug: "continuous-subarray-sum",
          name: "Continuous Subarray Sum",
          d: "M",
          key: "continuous-subarray-sum",
          n: 523,
          f3: 36.4
        },
        {
          t: "task",
          k: "LP",
          text: "A <b>data-driven or intuition-based decision</b>",
          key: "d8-lp"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "next-permutation",
          name: "Next Permutation",
          d: "M",
          key: "next-permutation",
          n: 31,
          f3: 55.7
        },
        {
          t: "lc",
          slug: "contiguous-array",
          name: "Contiguous Array",
          d: "M",
          key: "contiguous-array",
          n: 525,
          f3: 44.9,
          f30: 44.3
        }
      ]
    },
    {
      n: 9,
      phase: 2,
      title: "Binary search",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "Stuck for 40 minutes? Read the solution, log it, re-solve it in 3 days. That is the system working.",
      items: [
        {
          t: "lc",
          slug: "search-in-rotated-sorted-array",
          name: "Search in Rotated Sorted Array",
          d: "M",
          a: 1,
          src: [
            "lc8014509",
            "freq"
          ],
          key: "search-in-rotated-sorted-array",
          n: 33,
          f3: 59.5,
          f30: 54.4
        },
        {
          t: "lc",
          slug: "find-minimum-in-rotated-sorted-array",
          name: "Find Minimum in Rotated Sorted Array",
          d: "M",
          key: "find-minimum-in-rotated-sorted-array",
          n: 153,
          f3: 48.1
        },
        {
          t: "lc",
          slug: "koko-eating-bananas",
          name: "Koko Eating Bananas",
          d: "M",
          note: "Binary search on the answer",
          key: "koko-eating-bananas",
          n: 875,
          f3: 71.5,
          f30: 54.4
        },
        {
          t: "lc",
          slug: "find-peak-element",
          name: "Find Peak Element",
          d: "M",
          key: "find-peak-element",
          n: 162,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "find-k-closest-elements",
          name: "Find K Closest Elements",
          d: "M",
          a: 2,
          src: [
            "med2022"
          ],
          key: "find-k-closest-elements",
          n: 658,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "heaters",
          name: "Heaters",
          d: "M",
          a: 1,
          src: [
            "lc7035289"
          ],
          key: "heaters",
          n: 475,
          f3: 30.5
        },
        {
          t: "task",
          k: "Resume",
          text: "2-minute walkthrough of the <b>RAG failure-triage service</b>",
          key: "d9-resume"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "capacity-to-ship-packages-within-d-days",
          name: "Capacity To Ship Packages Within D Days",
          d: "M",
          key: "capacity-to-ship-packages-within-d-days",
          n: 1011,
          f3: 59.5,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "split-array-largest-sum",
          name: "Split Array Largest Sum",
          d: "H",
          key: "split-array-largest-sum",
          n: 410,
          f3: 55.7,
          f30: 61.7
        }
      ]
    },
    {
      n: 10,
      phase: 2,
      title: "Stacks and string parsing",
      hours: "Full day \xB7 ~11 h",
      weekend: true,
      coach: "Parse Lisp was asked in a real 2026 loop. Hard problems are just stacks of easy steps.",
      items: [
        {
          t: "lc",
          slug: "min-stack",
          name: "Min Stack",
          d: "M",
          key: "min-stack",
          n: 155,
          f3: 41
        },
        {
          t: "lc",
          slug: "daily-temperatures",
          name: "Daily Temperatures",
          d: "M",
          key: "daily-temperatures",
          n: 739,
          f3: 50.9
        },
        {
          t: "lc",
          slug: "evaluate-reverse-polish-notation",
          name: "Evaluate Reverse Polish Notation",
          d: "M",
          key: "evaluate-reverse-polish-notation",
          n: 150,
          f3: 30.5
        },
        {
          t: "lc",
          slug: "decode-string",
          name: "Decode String",
          d: "M",
          key: "decode-string",
          n: 394,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "basic-calculator-ii",
          name: "Basic Calculator II",
          d: "M",
          key: "basic-calculator-ii",
          n: 227,
          f3: 36.4,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "remove-all-adjacent-duplicates-in-string-ii",
          name: "Remove All Adjacent Duplicates in String II",
          d: "M",
          a: 2,
          src: [
            "gfg2022"
          ],
          key: "remove-all-adjacent-duplicates-in-string-ii",
          n: 1209,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "largest-rectangle-in-histogram",
          name: "Largest Rectangle in Histogram",
          d: "H",
          a: 1,
          src: [
            "lc7621408"
          ],
          note: "A 2026 Bar Raiser asked a problem like this one",
          key: "largest-rectangle-in-histogram",
          n: 84,
          f3: 44.9,
          f30: 44.3
        },
        {
          t: "task",
          k: "LP",
          text: "<b>Owning something end to end</b> and delivering",
          src: [
            "lc8542365",
            "lc6738470"
          ],
          key: "d11-lp"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "remove-k-digits",
          name: "Remove K Digits",
          d: "M",
          key: "remove-k-digits",
          n: 402,
          f3: 53.4,
          f30: 54.4
        },
        {
          t: "lc",
          slug: "longest-valid-parentheses",
          name: "Longest Valid Parentheses",
          d: "H",
          key: "longest-valid-parentheses",
          n: 32,
          f3: 50.9,
          f30: 67.4
        },
        {
          t: "lc",
          slug: "basic-calculator",
          name: "Basic Calculator",
          d: "H",
          key: "basic-calculator",
          n: 224,
          f3: 41
        }
      ]
    },
    {
      n: 11,
      phase: 2,
      title: "Linked lists + mock 1",
      hours: "Full day \xB7 ~11 h",
      weekend: true,
      coach: "Mock 1: the goal is not perfect code, it is clear thinking out loud.",
      items: [
        {
          t: "lc",
          slug: "remove-nth-node-from-end-of-list",
          name: "Remove Nth Node From End of List",
          d: "M",
          key: "remove-nth-node-from-end-of-list",
          n: 19,
          f3: 30.5,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "reorder-list",
          name: "Reorder List",
          d: "M",
          key: "reorder-list",
          n: 143,
          f3: 41
        },
        {
          t: "lc",
          slug: "add-two-numbers",
          name: "Add Two Numbers",
          d: "M",
          key: "add-two-numbers",
          n: 2,
          f3: 69.3,
          f30: 67.4
        },
        {
          t: "lc",
          slug: "linked-list-cycle-ii",
          name: "Linked List Cycle II",
          d: "M",
          key: "linked-list-cycle-ii",
          n: 142,
          f3: 30.5
        },
        {
          t: "lc",
          slug: "copy-list-with-random-pointer",
          name: "Copy List with Random Pointer",
          d: "M",
          key: "copy-list-with-random-pointer",
          n: 138,
          f3: 59.5,
          f30: 54.4
        },
        {
          t: "lc",
          slug: "merge-k-sorted-lists",
          name: "Merge k Sorted Lists",
          d: "H",
          key: "merge-k-sorted-lists",
          n: 23,
          f3: 57.7,
          f30: 44.3
        },
        {
          t: "task",
          k: "Mock",
          text: "<b>Mock 1</b> (1 hour): two unseen mediums + 2 LP questions, recorded or with a friend",
          key: "d12-mock"
        },
        {
          t: "task",
          k: "Review",
          text: "Re-solve every miss in your notebook from days 4\u201310",
          key: "d12-review"
        },
        {
          t: "task",
          k: "LP",
          text: "<b>Customer obsession</b>",
          key: "d12-lp"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "reverse-linked-list-ii",
          name: "Reverse Linked List II",
          d: "M",
          key: "reverse-linked-list-ii",
          n: 92,
          f3: 36.4,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "rotate-list",
          name: "Rotate List",
          d: "M",
          key: "rotate-list",
          n: 61,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "find-the-duplicate-number",
          name: "Find the Duplicate Number",
          d: "M",
          note: "Floyd\u2019s cycle trick on an array",
          key: "find-the-duplicate-number",
          n: 287,
          f3: 44.9
        }
      ]
    },
    {
      n: 12,
      phase: 2,
      title: "Sliding window",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "Shrink the window and keep only what matters. Same with distractions tonight.",
      items: [
        {
          t: "lc",
          slug: "longest-repeating-character-replacement",
          name: "Longest Repeating Character Replacement",
          d: "M",
          key: "longest-repeating-character-replacement",
          n: 424,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "permutation-in-string",
          name: "Permutation in String",
          d: "M",
          key: "permutation-in-string",
          n: 567,
          f3: 41
        },
        {
          t: "lc",
          slug: "fruit-into-baskets",
          name: "Fruit Into Baskets",
          d: "M",
          key: "fruit-into-baskets",
          n: 904,
          f3: 57.7
        },
        {
          t: "lc",
          slug: "minimum-window-substring",
          name: "Minimum Window Substring",
          d: "H",
          key: "minimum-window-substring",
          n: 76,
          f3: 50.9
        },
        {
          t: "task",
          k: "LP",
          text: "<b>Simplifying a process</b>",
          key: "d10-lp"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "maximum-coins-from-k-consecutive-bags",
          name: "Maximum Coins From K Consecutive Bags",
          d: "M",
          note: "Number 2 on Amazon\u2019s list for the last 3 months",
          key: "maximum-coins-from-k-consecutive-bags",
          n: 3413,
          f3: 93.1,
          f30: 100
        },
        {
          t: "lc",
          slug: "find-all-anagrams-in-a-string",
          name: "Find All Anagrams in a String",
          d: "M",
          key: "find-all-anagrams-in-a-string",
          n: 438,
          f3: 36.4
        }
      ]
    },
    {
      n: 13,
      phase: 2,
      title: "Binary trees",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "Interviewers hire the person who explains clearly, not the one who types fastest.",
      items: [
        {
          t: "lc",
          slug: "binary-tree-right-side-view",
          name: "Binary Tree Right Side View",
          d: "M",
          key: "binary-tree-right-side-view",
          n: 199,
          f3: 36.4,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "binary-tree-zigzag-level-order-traversal",
          name: "Binary Tree Zigzag Level Order Traversal",
          d: "M",
          a: 2,
          src: [
            "gfg2022"
          ],
          key: "binary-tree-zigzag-level-order-traversal",
          n: 103
        },
        {
          t: "lc",
          slug: "validate-binary-search-tree",
          name: "Validate Binary Search Tree",
          d: "M",
          key: "validate-binary-search-tree",
          n: 98,
          f3: 44.9
        },
        {
          t: "lc",
          slug: "kth-smallest-element-in-a-bst",
          name: "Kth Smallest Element in a BST",
          d: "M",
          key: "kth-smallest-element-in-a-bst",
          n: 230
        },
        {
          t: "lc",
          slug: "construct-binary-tree-from-preorder-and-inorder-traversal",
          name: "Construct Binary Tree from Preorder and Inorder Traversal",
          d: "M",
          key: "construct-binary-tree-from-preorder-and-inorder-traversal",
          n: 105
        },
        {
          t: "lc",
          slug: "diameter-of-binary-tree",
          name: "Diameter of Binary Tree",
          d: "E",
          key: "diameter-of-binary-tree",
          n: 543,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "binary-tree-maximum-path-sum",
          name: "Binary Tree Maximum Path Sum",
          d: "H",
          a: 2,
          src: [
            "gfg2022"
          ],
          key: "binary-tree-maximum-path-sum",
          n: 124,
          f3: 53.4
        },
        {
          t: "lc",
          slug: "maximum-width-of-binary-tree",
          name: "Maximum Width of Binary Tree",
          d: "M",
          a: 1,
          src: [
            "lc7035289"
          ],
          key: "maximum-width-of-binary-tree",
          n: 662,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "serialize-and-deserialize-binary-tree",
          name: "Serialize and Deserialize Binary Tree",
          d: "H",
          key: "serialize-and-deserialize-binary-tree",
          n: 297,
          f3: 30.5
        },
        {
          t: "task",
          k: "LP",
          text: "<b>Handing over responsibilities</b> or helping a teammate",
          src: [
            "lc6393977",
            "lc6738470"
          ],
          key: "d13-lp"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "all-nodes-distance-k-in-binary-tree",
          name: "All Nodes Distance K in Binary Tree",
          d: "M",
          key: "all-nodes-distance-k-in-binary-tree",
          n: 863,
          f3: 41
        },
        {
          t: "lc",
          slug: "house-robber-iii",
          name: "House Robber III",
          d: "M",
          key: "house-robber-iii",
          n: 337,
          f3: 30.5
        }
      ]
    },
    {
      n: 14,
      phase: 2,
      title: "Tries, heaps and design",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "LRU Cache from scratch today, from memory on Day 21, timed on Day 24. That is how \u201Casked\u201D becomes \u201Ceasy\u201D.",
      items: [
        {
          t: "lc",
          slug: "implement-trie-prefix-tree",
          name: "Implement Trie (Prefix Tree)",
          d: "M",
          a: 1,
          src: [
            "roundz"
          ],
          key: "implement-trie-prefix-tree",
          n: 208,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "design-add-and-search-words-data-structure",
          name: "Design Add and Search Words Data Structure",
          d: "M",
          key: "design-add-and-search-words-data-structure",
          n: 211,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "word-search-ii",
          name: "Word Search II",
          d: "H",
          a: 2,
          src: [
            "med2022"
          ],
          note: "Asked as a variant: count a word\u2019s occurrences in a grid",
          key: "word-search-ii",
          n: 212,
          f3: 36.4,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "kth-largest-element-in-an-array",
          name: "Kth Largest Element in an Array",
          d: "M",
          key: "kth-largest-element-in-an-array",
          n: 215,
          f3: 50.9
        },
        {
          t: "lc",
          slug: "find-median-from-data-stream",
          name: "Find Median from Data Stream",
          d: "H",
          key: "find-median-from-data-stream",
          n: 295,
          f3: 55.7,
          f30: 54.4
        },
        {
          t: "lc",
          slug: "lru-cache",
          name: "LRU Cache",
          d: "M",
          a: 1,
          src: [
            "rd1",
            "lc7621408",
            "freq"
          ],
          note: "From scratch: hash map + doubly linked list",
          key: "lru-cache",
          n: 146,
          f3: 72.4,
          f30: 67.4
        },
        {
          t: "lc",
          slug: "insert-delete-getrandom-o1",
          name: "Insert Delete GetRandom O(1)",
          d: "M",
          key: "insert-delete-getrandom-o1",
          n: 380,
          f3: 44.9
        },
        {
          t: "lc",
          slug: "time-based-key-value-store",
          name: "Time Based Key-Value Store",
          d: "M",
          key: "time-based-key-value-store",
          n: 981,
          f3: 30.5
        },
        {
          t: "task",
          k: "Resume",
          text: "10-minute deep dive of the <b>RAG failure-triage service</b>",
          key: "d14-resume"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "search-suggestions-system",
          name: "Search Suggestions System",
          d: "M",
          key: "search-suggestions-system",
          n: 1268,
          f3: 22.6,
          f30: 44.3
        }
      ]
    },
    {
      n: 15,
      phase: 2,
      title: "Graphs I: BFS, DFS, topological sort",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "Rotting Oranges came up in 3 real interviews. By tonight you will know it cold.",
      items: [
        {
          t: "lc",
          slug: "max-area-of-island",
          name: "Max Area of Island",
          d: "M",
          key: "max-area-of-island",
          n: 695,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "clone-graph",
          name: "Clone Graph",
          d: "M",
          key: "clone-graph",
          n: 133,
          f3: 22.6,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "pacific-atlantic-water-flow",
          name: "Pacific Atlantic Water Flow",
          d: "M",
          key: "pacific-atlantic-water-flow",
          n: 417,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "course-schedule",
          name: "Course Schedule",
          d: "M",
          a: 1,
          src: [
            "lc7154883",
            "freq"
          ],
          key: "course-schedule",
          n: 207,
          f3: 64.3
        },
        {
          t: "lc",
          slug: "course-schedule-ii",
          name: "Course Schedule II",
          d: "M",
          a: 1,
          src: [
            "lc6393977",
            "lc7621408"
          ],
          key: "course-schedule-ii",
          n: 210,
          f3: 48.1,
          f30: 54.4
        },
        {
          t: "lc",
          slug: "rotting-oranges",
          name: "Rotting Oranges",
          d: "M",
          a: 1,
          src: [
            "lc8542365",
            "roundz",
            "med2022"
          ],
          note: "Reported in 3 interviews",
          key: "rotting-oranges",
          n: 994,
          f3: 69.3,
          f30: 44.3
        },
        {
          t: "task",
          k: "LP",
          text: "A <b>failure</b> or a blunder, and what you learned from it",
          src: [
            "gfg2022",
            "roundz"
          ],
          key: "d15-lp"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "evaluate-division",
          name: "Evaluate Division",
          d: "M",
          key: "evaluate-division",
          n: 399,
          f3: 44.9,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "bus-routes",
          name: "Bus Routes",
          d: "H",
          key: "bus-routes",
          n: 815,
          f3: 36.4,
          f30: 54.4
        }
      ]
    },
    {
      n: 16,
      phase: 2,
      title: "Graphs II: shortest paths and union-find",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "Your CI pipeline went from unstable to a Star Award one fix at a time. This plan works the same way.",
      items: [
        {
          t: "lc",
          slug: "word-ladder",
          name: "Word Ladder",
          d: "H",
          a: 1,
          src: [
            "lc7035289",
            "freq"
          ],
          key: "word-ladder",
          n: 127,
          f3: 50.9
        },
        {
          t: "lc",
          slug: "network-delay-time",
          name: "Network Delay Time",
          d: "M",
          note: "Dijkstra",
          key: "network-delay-time",
          n: 743
        },
        {
          t: "lc",
          slug: "cheapest-flights-within-k-stops",
          name: "Cheapest Flights Within K Stops",
          d: "M",
          key: "cheapest-flights-within-k-stops",
          n: 787,
          f3: 41
        },
        {
          t: "lc",
          slug: "number-of-provinces",
          name: "Number of Provinces",
          d: "M",
          note: "Union-find",
          key: "number-of-provinces",
          n: 547,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "redundant-connection",
          name: "Redundant Connection",
          d: "M",
          note: "Union-find",
          key: "redundant-connection",
          n: 684
        },
        {
          t: "lc",
          slug: "min-cost-to-connect-all-points",
          name: "Min Cost to Connect All Points",
          d: "M",
          note: "Minimum spanning tree",
          key: "min-cost-to-connect-all-points",
          n: 1584
        },
        {
          t: "task",
          k: "Resume",
          text: "Deep dives of <b>CRV</b> and the <b>Kubernetes KPI pod and ELK pipelines</b>",
          key: "d16-resume"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "satisfiability-of-equality-equations",
          name: "Satisfiability of Equality Equations",
          d: "M",
          key: "satisfiability-of-equality-equations",
          n: 990,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "single-threaded-cpu",
          name: "Single-Threaded CPU",
          d: "M",
          note: "Heap-based scheduling, useful for the \u201Cschedule processes\u201D design question",
          key: "single-threaded-cpu",
          n: 1834,
          f3: 36.4
        }
      ]
    },
    {
      n: 17,
      phase: 2,
      title: "Greedy and intervals + mock 2",
      hours: "Full day \xB7 ~11 h",
      weekend: true,
      coach: "Take the best step available. Greedy works for intervals and for Saturdays.",
      items: [
        {
          t: "lc",
          slug: "jump-game",
          name: "Jump Game",
          d: "M",
          a: 1,
          src: [
            "lc8029194"
          ],
          key: "jump-game",
          n: 55,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "jump-game-ii",
          name: "Jump Game II",
          d: "M",
          a: 1,
          src: [
            "lc8029194"
          ],
          key: "jump-game-ii",
          n: 45,
          f3: 41
        },
        {
          t: "lc",
          slug: "gas-station",
          name: "Gas Station",
          d: "M",
          key: "gas-station",
          n: 134,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "partition-labels",
          name: "Partition Labels",
          d: "M",
          key: "partition-labels",
          n: 763,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "task-scheduler",
          name: "Task Scheduler",
          d: "M",
          key: "task-scheduler",
          n: 621,
          f3: 59.5,
          f30: 61.7
        },
        {
          t: "lc",
          slug: "merge-intervals",
          name: "Merge Intervals",
          d: "M",
          key: "merge-intervals",
          n: 56,
          f3: 72.4,
          f30: 61.7
        },
        {
          t: "lc",
          slug: "non-overlapping-intervals",
          name: "Non-overlapping Intervals",
          d: "M",
          key: "non-overlapping-intervals",
          n: 435,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "meeting-rooms-ii",
          name: "Meeting Rooms II",
          d: "M",
          prem: true,
          key: "meeting-rooms-ii",
          n: 253,
          f3: 50.9
        },
        {
          t: "lc",
          slug: "maximum-length-of-pair-chain",
          name: "Maximum Length of Pair Chain",
          d: "M",
          a: 1,
          src: [
            "lc7621408"
          ],
          key: "maximum-length-of-pair-chain",
          n: 646
        },
        {
          t: "task",
          k: "GenAI",
          text: "Answers to \u201CHow do you use GenAI in your workflow?\u201D and \u201CWhich use cases?\u201D",
          src: [
            "lc8546875",
            "rd1"
          ],
          key: "d17-genai"
        },
        {
          t: "task",
          k: "Mock",
          text: "<b>Mock 2</b>, Round 1 format: a BFS or tree problem + a parsing or binary-search problem + a deadline LP question",
          key: "d18-mock"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "candy",
          name: "Candy",
          d: "H",
          key: "candy",
          n: 135,
          f3: 44.9
        },
        {
          t: "lc",
          slug: "car-pooling",
          name: "Car Pooling",
          d: "M",
          key: "car-pooling",
          n: 1094,
          f3: 36.4
        }
      ]
    },
    {
      n: 18,
      phase: 2,
      title: "Dynamic programming I + mock 3",
      hours: "Full day \xB7 ~11 h",
      weekend: true,
      coach: "DP is remembering what you already solved. So is your mistakes notebook.",
      items: [
        {
          t: "lc",
          slug: "coin-change",
          name: "Coin Change",
          d: "M",
          key: "coin-change",
          n: 322,
          f3: 48.1,
          f30: 61.7
        },
        {
          t: "lc",
          slug: "coin-change-ii",
          name: "Coin Change II",
          d: "M",
          key: "coin-change-ii",
          n: 518
        },
        {
          t: "lc",
          slug: "partition-equal-subset-sum",
          name: "Partition Equal Subset Sum",
          d: "M",
          a: 1,
          src: [
            "rd1"
          ],
          key: "partition-equal-subset-sum",
          n: 416,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "longest-increasing-subsequence",
          name: "Longest Increasing Subsequence",
          d: "M",
          key: "longest-increasing-subsequence",
          n: 300,
          f3: 30.5
        },
        {
          t: "lc",
          slug: "word-break",
          name: "Word Break",
          d: "M",
          key: "word-break",
          n: 139,
          f3: 44.9,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "decode-ways",
          name: "Decode Ways",
          d: "M",
          key: "decode-ways",
          n: 91
        },
        {
          t: "task",
          k: "Mock",
          text: "<b>Mock 3</b>, Round 2 format: binary search on the answer + 1-D DP + a project deep dive",
          key: "d19-mock"
        },
        {
          t: "task",
          k: "Review",
          text: "Re-solve every miss in your notebook from days 11\u201317",
          key: "d19-review"
        },
        {
          t: "task",
          k: "Resume",
          text: "Deep dives of <b>TC Executor</b>, the <b>Core-Stacks CI pipeline</b> and the <b>EventLogging fix</b>",
          key: "d18-resume"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "longest-palindromic-substring",
          name: "Longest Palindromic Substring",
          d: "M",
          note: "Number 9 on Amazon\u2019s list for the last 3 months",
          key: "longest-palindromic-substring",
          n: 5,
          f3: 71.5,
          f30: 54.4
        },
        {
          t: "lc",
          slug: "maximum-product-subarray",
          name: "Maximum Product Subarray",
          d: "M",
          key: "maximum-product-subarray",
          n: 152,
          f3: 41,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "interleaving-string",
          name: "Interleaving String",
          d: "M",
          key: "interleaving-string",
          n: 97,
          f3: 50.9,
          f30: 54.4
        }
      ]
    },
    {
      n: 19,
      phase: 2,
      title: "DP II and backtracking",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "Every recursion needs a base case. Yours is showing up every day.",
      items: [
        {
          t: "lc",
          slug: "unique-paths",
          name: "Unique Paths",
          d: "M",
          a: 1,
          src: [
            "lc7035289"
          ],
          note: "Then the asked variant: a robot moving only right or down collects points; return the maximum total (recursion \u2192 memo \u2192 table)",
          key: "unique-paths",
          n: 62,
          f3: 30.5
        },
        {
          t: "lc",
          slug: "longest-common-subsequence",
          name: "Longest Common Subsequence",
          d: "M",
          key: "longest-common-subsequence",
          n: 1143
        },
        {
          t: "lc",
          slug: "edit-distance",
          name: "Edit Distance",
          d: "M",
          key: "edit-distance",
          n: 72
        },
        {
          t: "lc",
          slug: "best-time-to-buy-and-sell-stock-with-cooldown",
          name: "Best Time to Buy and Sell Stock with Cooldown",
          d: "M",
          note: "State-machine DP",
          key: "best-time-to-buy-and-sell-stock-with-cooldown",
          n: 309,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "subsets",
          name: "Subsets",
          d: "M",
          key: "subsets",
          n: 78,
          f3: 53.4
        },
        {
          t: "lc",
          slug: "permutations",
          name: "Permutations",
          d: "M",
          key: "permutations",
          n: 46,
          f3: 44.9,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "combination-sum",
          name: "Combination Sum",
          d: "M",
          key: "combination-sum",
          n: 39,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "word-search",
          name: "Word Search",
          d: "M",
          key: "word-search",
          n: 79,
          f3: 30.5,
          f30: 44.3
        },
        {
          t: "task",
          k: "GenAI",
          text: "Answers on checking AI output and AI-written code, preferred models, and which tasks you give to GenAI",
          src: [
            "lc7724048",
            "lc8014509",
            "rd1"
          ],
          key: "d19-genai"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "letter-combinations-of-a-phone-number",
          name: "Letter Combinations of a Phone Number",
          d: "M",
          key: "letter-combinations-of-a-phone-number",
          n: 17,
          f3: 44.9
        },
        {
          t: "lc",
          slug: "palindrome-partitioning",
          name: "Palindrome Partitioning",
          d: "M",
          key: "palindrome-partitioning",
          n: 131,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "predict-the-winner",
          name: "Predict the Winner",
          d: "M",
          key: "predict-the-winner",
          n: 486,
          f3: 41
        }
      ]
    },
    {
      n: 20,
      phase: 3,
      title: "Asked set A",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "Phase 3: these are the problems from real loops. You are practising the actual interview now.",
      items: [
        {
          t: "lc",
          slug: "vertical-order-traversal-of-a-binary-tree",
          name: "Vertical Order Traversal of a Binary Tree",
          d: "H",
          a: 1,
          src: [
            "rd1"
          ],
          note: "Then code the vertical sum version that was asked",
          key: "vertical-order-traversal-of-a-binary-tree",
          n: 987
        },
        {
          t: "lc",
          slug: "path-sum-ii",
          name: "Path Sum II",
          d: "M",
          key: "path-sum-ii",
          n: 113,
          f3: 30.5
        },
        {
          t: "lc",
          slug: "path-sum-iii",
          name: "Path Sum III",
          d: "M",
          a: 1,
          src: [
            "lc8029194"
          ],
          note: "Closest match to a 2026 \u201Ctree path sum with conditions\u201D question",
          key: "path-sum-iii",
          n: 437,
          f3: 30.5
        },
        {
          t: "lc",
          slug: "random-pick-with-weight",
          name: "Random Pick with Weight",
          d: "M",
          a: 1,
          src: [
            "rd1"
          ],
          key: "random-pick-with-weight",
          n: 528,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "parse-lisp-expression",
          name: "Parse Lisp Expression",
          d: "H",
          a: 1,
          src: [
            "lc8542365"
          ],
          note: "Stack + hash maps",
          key: "parse-lisp-expression",
          n: 736
        },
        {
          t: "lc",
          slug: "detonate-the-maximum-bombs",
          name: "Detonate the Maximum Bombs",
          d: "M",
          a: 1,
          src: [
            "lc7724048"
          ],
          note: "Follow-up asked: the directed-graph version",
          key: "detonate-the-maximum-bombs",
          n: 2101
        },
        {
          t: "lc",
          slug: "sliding-window-maximum",
          name: "Sliding Window Maximum",
          d: "H",
          a: 1,
          src: [
            "lc7154883"
          ],
          note: "Asked wrapped in a story",
          key: "sliding-window-maximum",
          n: 239,
          f3: 55.7
        }
      ],
      night: [
        {
          t: "lc",
          slug: "rotate-image",
          name: "Rotate Image",
          d: "M",
          key: "rotate-image",
          n: 48,
          f3: 48.1
        },
        {
          t: "lc",
          slug: "spiral-matrix",
          name: "Spiral Matrix",
          d: "M",
          key: "spiral-matrix",
          n: 54,
          f3: 41,
          f30: 44.3
        }
      ]
    },
    {
      n: 21,
      phase: 3,
      title: "Asked set B",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "\u201CWork hard. Have fun. Make history.\u201D That was Amazon\u2019s early motto. Today is the work-hard part.",
      items: [
        {
          t: "lc",
          slug: "most-profitable-path-in-a-tree",
          name: "Most Profitable Path in a Tree",
          d: "M",
          a: 1,
          src: [
            "rd1"
          ],
          key: "most-profitable-path-in-a-tree",
          n: 2467,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "lowest-common-ancestor-of-a-binary-tree",
          name: "Lowest Common Ancestor of a Binary Tree",
          d: "M",
          a: 1,
          src: [
            "lc8014509",
            "freq"
          ],
          key: "lowest-common-ancestor-of-a-binary-tree",
          n: 236,
          f3: 68.2,
          f30: 75.9
        },
        {
          t: "lc",
          slug: "lowest-common-ancestor-of-a-binary-search-tree",
          name: "Lowest Common Ancestor of a Binary Search Tree",
          d: "M",
          a: 1,
          src: [
            "lc7981646",
            "med2022"
          ],
          key: "lowest-common-ancestor-of-a-binary-search-tree",
          n: 235,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "maximize-the-confusion-of-an-exam",
          name: "Maximize the Confusion of an Exam",
          d: "M",
          a: 1,
          src: [
            "lc8542365"
          ],
          key: "maximize-the-confusion-of-an-exam",
          n: 2024,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "magnetic-force-between-two-balls",
          name: "Magnetic Force Between Two Balls",
          d: "M",
          a: 1,
          src: [
            "lc7724048"
          ],
          note: "Asked as \u201CAggressive Cows\u201D",
          key: "magnetic-force-between-two-balls",
          n: 1552,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "house-robber-ii",
          name: "House Robber II",
          d: "M",
          a: 1,
          src: [
            "lc8029194"
          ],
          key: "house-robber-ii",
          n: 213,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "single-element-in-a-sorted-array",
          name: "Single Element in a Sorted Array",
          d: "M",
          a: 1,
          src: [
            "lc7154883",
            "freq"
          ],
          key: "single-element-in-a-sorted-array",
          n: 540,
          f3: 55.7,
          f30: 54.4
        },
        {
          t: "lc",
          slug: "lru-cache",
          name: "LRU Cache",
          d: "M",
          a: 1,
          src: [
            "rd1",
            "lc7621408",
            "freq"
          ],
          note: "Again, from memory",
          key: "lru-cache--2",
          n: 146,
          f3: 72.4,
          f30: 67.4
        },
        {
          t: "lc",
          slug: "lfu-cache",
          name: "LFU Cache",
          d: "H",
          key: "lfu-cache",
          n: 460,
          f3: 36.4,
          f30: 44.3
        }
      ],
      night: [
        {
          t: "lc",
          slug: "minimum-operations-to-reduce-x-to-zero",
          name: "Minimum Operations to Reduce X to Zero",
          d: "M",
          key: "minimum-operations-to-reduce-x-to-zero",
          n: 1658,
          f3: 30.5,
          f30: 54.4
        },
        {
          t: "lc",
          slug: "count-number-of-nice-subarrays",
          name: "Count Number of Nice Subarrays",
          d: "M",
          key: "count-number-of-nice-subarrays",
          n: 1248,
          f3: 41
        }
      ]
    },
    {
      n: 22,
      phase: 3,
      title: "Asked set C",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "Two weeks ago these looked hard. Notice how many feel familiar now.",
      items: [
        {
          t: "lc",
          slug: "maximum-sum-circular-subarray",
          name: "Maximum Sum Circular Subarray",
          d: "M",
          a: 1,
          src: [
            "lc8014509"
          ],
          key: "maximum-sum-circular-subarray",
          n: 918,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "maximum-good-subarray-sum",
          name: "Maximum Good Subarray Sum",
          d: "M",
          a: 1,
          src: [
            "lc8014509"
          ],
          note: "Asked as: the maximum subarray sum from i to j where |a[i] \u2212 a[j]| = k",
          key: "maximum-good-subarray-sum",
          n: 3026
        },
        {
          t: "lc",
          slug: "next-greater-element-i",
          name: "Next Greater Element I",
          d: "E",
          a: 1,
          src: [
            "lc7724048"
          ],
          key: "next-greater-element-i",
          n: 496,
          f3: 48.1
        },
        {
          t: "lc",
          slug: "next-greater-element-ii",
          name: "Next Greater Element II",
          d: "M",
          a: 1,
          src: [
            "lc7724048"
          ],
          key: "next-greater-element-ii",
          n: 503,
          f3: 48.1
        },
        {
          t: "lc",
          slug: "longest-substring-with-at-most-k-distinct-characters",
          name: "Longest Substring with At Most K Distinct Characters",
          d: "M",
          a: 1,
          prem: true,
          src: [
            "lc6393977"
          ],
          key: "longest-substring-with-at-most-k-distinct-characters",
          n: 340
        },
        {
          t: "lc",
          slug: "reverse-pairs",
          name: "Reverse Pairs",
          d: "H",
          a: 1,
          src: [
            "lc6393977"
          ],
          note: "Asked as \u201Ccount inversions\u201D: code the merge-sort count first",
          key: "reverse-pairs",
          n: 493,
          f3: 36.4
        }
      ],
      night: [
        {
          t: "lc",
          slug: "4sum",
          name: "4Sum",
          d: "M",
          key: "4sum",
          n: 18,
          f3: 48.1,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "3sum-closest",
          name: "3Sum Closest",
          d: "M",
          key: "3sum-closest",
          n: 16,
          f3: 36.4,
          f30: 44.3
        }
      ]
    },
    {
      n: 23,
      phase: 3,
      title: "Asked set D",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "Brute force first, then better, then best. True for problems, true for you.",
      items: [
        {
          t: "lc",
          slug: "best-time-to-buy-and-sell-stock-iii",
          name: "Best Time to Buy and Sell Stock III",
          d: "H",
          a: 1,
          src: [
            "lc8542365"
          ],
          key: "best-time-to-buy-and-sell-stock-iii",
          n: 123,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "best-time-to-buy-and-sell-stock-iv",
          name: "Best Time to Buy and Sell Stock IV",
          d: "H",
          a: 1,
          src: [
            "lc8542365"
          ],
          note: "The candidate gave the general K-transactions solution",
          key: "best-time-to-buy-and-sell-stock-iv",
          n: 188
        },
        {
          t: "task",
          k: "Ladder",
          text: "The asked ladder: Two Sum \u2192 pair sum \u2264 X \u2192 buy any items with total price \u2264 X (0/1 knapsack)",
          a: 1,
          src: [
            "rd1"
          ],
          key: "d23-ladder"
        },
        {
          t: "lc",
          slug: "reverse-nodes-in-k-group",
          name: "Reverse Nodes in k-Group",
          d: "H",
          key: "reverse-nodes-in-k-group",
          n: 25,
          f3: 44.9
        },
        {
          t: "lc",
          slug: "k-closest-points-to-origin",
          name: "K Closest Points to Origin",
          d: "M",
          a: 1,
          src: [
            "roundz"
          ],
          key: "k-closest-points-to-origin",
          n: 973,
          f3: 44.9
        },
        {
          t: "lc",
          slug: "minimum-cost-to-connect-sticks",
          name: "Minimum Cost to Connect Sticks",
          d: "M",
          prem: true,
          note: "Connect ropes at minimum cost",
          key: "minimum-cost-to-connect-sticks",
          n: 1167
        }
      ],
      night: [
        {
          t: "lc",
          slug: "separate-black-and-white-balls",
          name: "Separate Black and White Balls",
          d: "M",
          key: "separate-black-and-white-balls",
          n: 2938,
          f3: 53.4,
          f30: 54.4
        },
        {
          t: "lc",
          slug: "largest-number",
          name: "Largest Number",
          d: "M",
          key: "largest-number",
          n: 179,
          f3: 41
        }
      ]
    },
    {
      n: 24,
      phase: 3,
      title: "Implementations + Bar Raiser rehearsal",
      hours: "Full day \xB7 ~11 h",
      weekend: true,
      coach: "The Bar Raiser asks how you knew it would work. Your numbers answer that: 20%+ debuggability, same-day bug closure.",
      items: [
        {
          t: "lc",
          slug: "insert-into-a-binary-search-tree",
          name: "Insert into a Binary Search Tree",
          d: "M",
          a: 1,
          src: [
            "roundz"
          ],
          note: "Part of a BST from scratch: insert, delete and search",
          key: "insert-into-a-binary-search-tree--2",
          n: 701
        },
        {
          t: "lc",
          slug: "delete-node-in-a-bst",
          name: "Delete Node in a BST",
          d: "M",
          a: 1,
          src: [
            "roundz"
          ],
          key: "delete-node-in-a-bst",
          n: 450,
          f3: 30.5
        },
        {
          t: "lc",
          slug: "implement-trie-prefix-tree",
          name: "Implement Trie (Prefix Tree)",
          d: "M",
          a: 1,
          src: [
            "roundz"
          ],
          note: "From memory, timed",
          key: "implement-trie-prefix-tree--2",
          n: 208,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "lru-cache",
          name: "LRU Cache",
          d: "M",
          a: 1,
          src: [
            "rd1",
            "lc7621408",
            "freq"
          ],
          note: "From memory, timed",
          key: "lru-cache--3",
          n: 146,
          f3: 72.4,
          f30: 67.4
        },
        {
          t: "lc",
          slug: "design-circular-queue",
          name: "Design Circular Queue",
          d: "M",
          a: 2,
          src: [
            "med2022"
          ],
          key: "design-circular-queue",
          n: 622
        },
        {
          t: "task",
          k: "LLD",
          text: "Design a <b>process or job scheduler</b>: job class, priority queue, worker threads; follow-ups on locking, deadlock and synchronisation",
          a: 1,
          src: [
            "lc8014509",
            "lc6738470"
          ],
          key: "d24-lld"
        },
        {
          t: "task",
          k: "Mock",
          text: "Bar Raiser rehearsal: a friend grills you for 45 minutes on one project and your LP stories",
          src: [
            "lc8542365",
            "lc7724048"
          ],
          key: "d26-br"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "implement-rand10-using-rand7",
          name: "Implement Rand10() Using Rand7()",
          d: "M",
          key: "implement-rand10-using-rand7",
          n: 470,
          f3: 30.5,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "maximum-white-tiles-covered-by-a-carpet",
          name: "Maximum White Tiles Covered by a Carpet",
          d: "M",
          key: "maximum-white-tiles-covered-by-a-carpet",
          n: 2271,
          f3: 44.9,
          f30: 44.3
        }
      ]
    },
    {
      n: 25,
      phase: 3,
      title: "Full mock day + hard practice",
      hours: "Full day \xB7 ~11 h",
      weekend: true,
      coach: "Three mocks today. Pressure now makes the real loop feel like practice.",
      items: [
        {
          t: "task",
          k: "Mock",
          text: "<b>Mock 4</b>, Round 1 format: two DSA problems + LP questions",
          key: "d25-mock4"
        },
        {
          t: "task",
          k: "Mock",
          text: "<b>Mock 5</b>, Round 2 format: two DSA problems + a resume project deep dive",
          key: "d25-mock5"
        },
        {
          t: "task",
          k: "Mock",
          text: "<b>Mock 6</b>, hiring-manager format: one DSA ladder + GenAI questions + the one-hour production-incident scenario",
          src: [
            "lc8029194"
          ],
          key: "d25-mock6"
        },
        {
          t: "lc",
          slug: "trapping-rain-water",
          name: "Trapping Rain Water",
          d: "H",
          note: "Number 4 on Amazon\u2019s list for the last 3 months",
          key: "trapping-rain-water",
          n: 42,
          f3: 79.8,
          f30: 79.3
        },
        {
          t: "lc",
          slug: "median-of-two-sorted-arrays",
          name: "Median of Two Sorted Arrays",
          d: "H",
          a: 1,
          src: [
            "lc8029194",
            "freq"
          ],
          note: "A 2026 hiring-manager round asked a hard binary-search problem like this one",
          key: "median-of-two-sorted-arrays",
          n: 4,
          f3: 71.5,
          f30: 61.7
        },
        {
          t: "task",
          k: "Resume",
          text: "Rehearse the 10-minute version of every resume item",
          key: "d25-resume"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "first-missing-positive",
          name: "First Missing Positive",
          d: "H",
          key: "first-missing-positive",
          n: 41,
          f3: 30.5
        },
        {
          t: "lc",
          slug: "maximal-rectangle",
          name: "Maximal Rectangle",
          d: "H",
          key: "maximal-rectangle",
          n: 85,
          f3: 30.5
        },
        {
          t: "lc",
          slug: "sum-of-subarray-minimums",
          name: "Sum of Subarray Minimums",
          d: "M",
          key: "sum-of-subarray-minimums",
          n: 907,
          f3: 30.5
        }
      ]
    },
    {
      n: 26,
      phase: 3,
      title: "Hard practice and LLD",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "Hard problems don\u2019t care how you feel. Start with the brute force and keep moving.",
      items: [
        {
          t: "lc",
          slug: "n-queens",
          name: "N-Queens",
          d: "H",
          key: "n-queens",
          n: 51,
          f3: 44.9,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "minimum-window-substring",
          name: "Minimum Window Substring",
          d: "H",
          note: "Re-solve without looking",
          key: "minimum-window-substring--2",
          n: 76,
          f3: 50.9
        },
        {
          t: "lc",
          slug: "largest-rectangle-in-histogram",
          name: "Largest Rectangle in Histogram",
          d: "H",
          a: 1,
          src: [
            "lc7621408"
          ],
          note: "Re-solve without looking",
          key: "largest-rectangle-in-histogram--2",
          n: 84,
          f3: 44.9,
          f30: 44.3
        },
        {
          t: "task",
          k: "LLD",
          text: "Design a <b>board game</b> (Snake and Ladder or Tic-Tac-Toe): classes for the board, players and moves",
          a: 1,
          src: [
            "lc6813913"
          ],
          key: "d26-lld1"
        },
        {
          t: "task",
          k: "LLD",
          text: "Sketch a <b>parking lot</b> and a <b>rate limiter</b>: classes and key methods, 30 minutes each",
          key: "d26-lld2"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "integer-to-english-words",
          name: "Integer to English Words",
          d: "H",
          key: "integer-to-english-words",
          n: 273,
          f3: 41,
          f30: 61.7
        },
        {
          t: "lc",
          slug: "word-break-ii",
          name: "Word Break II",
          d: "H",
          key: "word-break-ii",
          n: 140,
          f3: 30.5,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "smallest-range-covering-elements-from-k-lists",
          name: "Smallest Range Covering Elements from K Lists",
          d: "H",
          key: "smallest-range-covering-elements-from-k-lists",
          n: 632,
          f3: 30.5,
          f30: 44.3
        }
      ]
    },
    {
      n: 27,
      phase: 3,
      title: "Bits and math",
      hours: "Evening + night \xB7 ~7 h",
      weekend: false,
      coach: "Small bits, big result. Two days left.",
      items: [
        {
          t: "lc",
          slug: "single-number",
          name: "Single Number",
          d: "E",
          key: "single-number",
          n: 136,
          f3: 44.9,
          f30: 44.3
        },
        {
          t: "lc",
          slug: "number-of-1-bits",
          name: "Number of 1 Bits",
          d: "E",
          key: "number-of-1-bits",
          n: 191,
          f3: 22.6
        },
        {
          t: "lc",
          slug: "counting-bits",
          name: "Counting Bits",
          d: "E",
          key: "counting-bits",
          n: 338
        },
        {
          t: "lc",
          slug: "powx-n",
          name: "Pow(x, n)",
          d: "M",
          key: "powx-n",
          n: 50,
          f3: 36.4
        },
        {
          t: "lc",
          slug: "count-beautiful-splits-in-an-array",
          name: "Count Beautiful Splits in an Array",
          d: "M",
          a: 1,
          src: [
            "lc7035289"
          ],
          key: "count-beautiful-splits-in-an-array",
          n: 3388
        },
        {
          t: "task",
          k: "LP",
          text: "Say every LP story out loud, each under 2 minutes",
          key: "d27-lp"
        }
      ],
      night: [
        {
          t: "lc",
          slug: "divide-two-integers",
          name: "Divide Two Integers",
          d: "M",
          key: "divide-two-integers",
          n: 29,
          f3: 44.9,
          f30: 54.4
        },
        {
          t: "lc",
          slug: "string-to-integer-atoi",
          name: "String to Integer (atoi)",
          d: "M",
          key: "string-to-integer-atoi",
          n: 8,
          f3: 44.9,
          f30: 44.3
        }
      ]
    },
    {
      n: 28,
      phase: 3,
      title: "Final revision",
      hours: "Light day \xB7 ~4 h, then sleep",
      weekend: false,
      coach: "You did the work. Sleep early tonight; rested you interviews better than tired you.",
      items: [
        {
          t: "task",
          k: "Review",
          text: "Re-solve every problem in the mistakes notebook without looking",
          key: "d28-review"
        },
        {
          t: "task",
          k: "Notes",
          text: "One-page revision sheet: pattern \u2192 code template \u2192 complexity",
          key: "d28-sheet"
        },
        {
          t: "task",
          k: "Review",
          text: "Interview-day checklist ready (near the bottom of this page)",
          key: "d28-checklist"
        },
        {
          t: "task",
          k: "Rest",
          text: "Sleep early tonight. Memory consolidates during sleep, and the call can come any day now.",
          key: "d28-sleep"
        }
      ],
      night: []
    }
  ]
};

// src/data/amazon/freq.json
var freq_default = [
  {
    rank: 1,
    slug: "two-sum",
    name: "Two Sum",
    n: 1,
    d: "E",
    f3: 100,
    f30: 100,
    keys: [
      "two-sum"
    ],
    days: [
      1
    ]
  },
  {
    rank: 2,
    slug: "maximum-coins-from-k-consecutive-bags",
    name: "Maximum Coins From K Consecutive Bags",
    n: 3413,
    d: "M",
    f3: 93.1,
    f30: 100,
    keys: [
      "maximum-coins-from-k-consecutive-bags"
    ],
    days: [
      12
    ]
  },
  {
    rank: 3,
    slug: "longest-substring-without-repeating-characters",
    name: "Longest Substring Without Repeating Characters",
    n: 3,
    d: "M",
    f3: 79.8,
    f30: 89.7,
    keys: [
      "longest-substring-without-repeating-characters"
    ],
    days: [
      3
    ]
  },
  {
    rank: 4,
    slug: "trapping-rain-water",
    name: "Trapping Rain Water",
    n: 42,
    d: "H",
    f3: 79.8,
    f30: 79.3,
    keys: [
      "trapping-rain-water"
    ],
    days: [
      25
    ]
  },
  {
    rank: 5,
    slug: "group-anagrams",
    name: "Group Anagrams",
    n: 49,
    d: "M",
    f3: 73.4,
    f30: 72,
    keys: [
      "group-anagrams"
    ],
    days: [
      6
    ]
  },
  {
    rank: 6,
    slug: "merge-intervals",
    name: "Merge Intervals",
    n: 56,
    d: "M",
    f3: 72.4,
    f30: 61.7,
    keys: [
      "merge-intervals"
    ],
    days: [
      17
    ]
  },
  {
    rank: 7,
    slug: "lru-cache",
    name: "LRU Cache",
    n: 146,
    d: "M",
    f3: 72.4,
    f30: 67.4,
    keys: [
      "lru-cache",
      "lru-cache--2",
      "lru-cache--3"
    ],
    days: [
      14,
      21,
      24
    ]
  },
  {
    rank: 8,
    slug: "median-of-two-sorted-arrays",
    name: "Median of Two Sorted Arrays",
    n: 4,
    d: "H",
    f3: 71.5,
    f30: 61.7,
    keys: [
      "median-of-two-sorted-arrays"
    ],
    days: [
      25
    ]
  },
  {
    rank: 9,
    slug: "longest-palindromic-substring",
    name: "Longest Palindromic Substring",
    n: 5,
    d: "M",
    f3: 71.5,
    f30: 54.4,
    keys: [
      "longest-palindromic-substring"
    ],
    days: [
      18
    ]
  },
  {
    rank: 10,
    slug: "container-with-most-water",
    name: "Container With Most Water",
    n: 11,
    d: "M",
    f3: 71.5,
    f30: 67.4,
    keys: [
      "container-with-most-water"
    ],
    days: [
      8
    ]
  },
  {
    rank: 11,
    slug: "best-time-to-buy-and-sell-stock",
    name: "Best Time to Buy and Sell Stock",
    n: 121,
    d: "E",
    f3: 71.5,
    f30: 79.3,
    keys: [
      "best-time-to-buy-and-sell-stock"
    ],
    days: [
      1
    ]
  },
  {
    rank: 12,
    slug: "move-zeroes",
    name: "Move Zeroes",
    n: 283,
    d: "E",
    f3: 71.5,
    f30: 72,
    keys: [
      "move-zeroes"
    ],
    days: [
      2
    ]
  },
  {
    rank: 13,
    slug: "top-k-frequent-elements",
    name: "Top K Frequent Elements",
    n: 347,
    d: "M",
    f3: 71.5,
    f30: 44.3,
    keys: [
      "top-k-frequent-elements"
    ],
    days: [
      6
    ]
  },
  {
    rank: 14,
    slug: "koko-eating-bananas",
    name: "Koko Eating Bananas",
    n: 875,
    d: "M",
    f3: 71.5,
    f30: 54.4,
    keys: [
      "koko-eating-bananas"
    ],
    days: [
      9
    ]
  },
  {
    rank: 15,
    slug: "add-two-numbers",
    name: "Add Two Numbers",
    n: 2,
    d: "M",
    f3: 69.3,
    f30: 67.4,
    keys: [
      "add-two-numbers"
    ],
    days: [
      11
    ]
  },
  {
    rank: 16,
    slug: "longest-common-prefix",
    name: "Longest Common Prefix",
    n: 14,
    d: "E",
    f3: 69.3,
    f30: 61.7,
    keys: [
      "longest-common-prefix"
    ],
    days: [
      1
    ]
  },
  {
    rank: 17,
    slug: "3sum",
    name: "3Sum",
    n: 15,
    d: "M",
    f3: 69.3,
    f30: 54.4,
    keys: [
      "3sum"
    ],
    days: [
      8
    ]
  },
  {
    rank: 18,
    slug: "maximum-subarray",
    name: "Maximum Subarray",
    n: 53,
    d: "M",
    f3: 69.3,
    f30: 54.4,
    keys: [
      "maximum-subarray"
    ],
    days: [
      8
    ]
  },
  {
    rank: 19,
    slug: "number-of-islands",
    name: "Number of Islands",
    n: 200,
    d: "M",
    f3: 69.3,
    f30: 79.3,
    keys: [
      "number-of-islands"
    ],
    days: [
      7
    ]
  },
  {
    rank: 20,
    slug: "subarray-sum-equals-k",
    name: "Subarray Sum Equals K",
    n: 560,
    d: "M",
    f3: 69.3,
    f30: 72,
    keys: [
      "subarray-sum-equals-k"
    ],
    days: [
      8
    ]
  },
  {
    rank: 21,
    slug: "rotting-oranges",
    name: "Rotting Oranges",
    n: 994,
    d: "M",
    f3: 69.3,
    f30: 44.3,
    keys: [
      "rotting-oranges"
    ],
    days: [
      15
    ]
  },
  {
    rank: 22,
    slug: "lowest-common-ancestor-of-a-binary-tree",
    name: "Lowest Common Ancestor of a Binary Tree",
    n: 236,
    d: "M",
    f3: 68.2,
    f30: 75.9,
    keys: [
      "lowest-common-ancestor-of-a-binary-tree"
    ],
    days: [
      21
    ]
  },
  {
    rank: 23,
    slug: "reorganize-string",
    name: "Reorganize String",
    n: 767,
    d: "M",
    f3: 68.2,
    f30: 54.4,
    keys: [
      "reorganize-string"
    ],
    days: [
      6
    ]
  },
  {
    rank: 24,
    slug: "valid-parentheses",
    name: "Valid Parentheses",
    n: 20,
    d: "E",
    f3: 65.7,
    f30: 67.4,
    keys: [
      "valid-parentheses"
    ],
    days: [
      5
    ]
  },
  {
    rank: 25,
    slug: "generate-parentheses",
    name: "Generate Parentheses",
    n: 22,
    d: "M",
    f3: 65.7,
    f30: 72,
    keys: [
      "generate-parentheses"
    ],
    days: [
      4
    ]
  },
  {
    rank: 26,
    slug: "course-schedule",
    name: "Course Schedule",
    n: 207,
    d: "M",
    f3: 64.3,
    f30: null,
    keys: [
      "course-schedule"
    ],
    days: [
      15
    ]
  },
  {
    rank: 27,
    slug: "product-of-array-except-self",
    name: "Product of Array Except Self",
    n: 238,
    d: "M",
    f3: 62.8,
    f30: 61.7,
    keys: [
      "product-of-array-except-self"
    ],
    days: [
      8
    ]
  },
  {
    rank: 28,
    slug: "palindrome-number",
    name: "Palindrome Number",
    n: 9,
    d: "E",
    f3: 61.2,
    f30: 44.3,
    xkey: "x-palindrome-number"
  },
  {
    rank: 29,
    slug: "valid-sudoku",
    name: "Valid Sudoku",
    n: 36,
    d: "M",
    f3: 61.2,
    f30: 75.9,
    keys: [
      "valid-sudoku"
    ],
    days: [
      1
    ]
  },
  {
    rank: 30,
    slug: "longest-consecutive-sequence",
    name: "Longest Consecutive Sequence",
    n: 128,
    d: "M",
    f3: 61.2,
    f30: 54.4,
    keys: [
      "longest-consecutive-sequence"
    ],
    days: [
      6
    ]
  },
  {
    rank: 31,
    slug: "search-in-rotated-sorted-array",
    name: "Search in Rotated Sorted Array",
    n: 33,
    d: "M",
    f3: 59.5,
    f30: 54.4,
    keys: [
      "search-in-rotated-sorted-array"
    ],
    days: [
      9
    ]
  },
  {
    rank: 32,
    slug: "sqrtx",
    name: "Sqrt(x)",
    n: 69,
    d: "E",
    f3: 59.5,
    f30: 54.4,
    keys: [
      "sqrtx"
    ],
    days: [
      3
    ]
  },
  {
    rank: 33,
    slug: "copy-list-with-random-pointer",
    name: "Copy List with Random Pointer",
    n: 138,
    d: "M",
    f3: 59.5,
    f30: 54.4,
    keys: [
      "copy-list-with-random-pointer"
    ],
    days: [
      11
    ]
  },
  {
    rank: 34,
    slug: "majority-element",
    name: "Majority Element",
    n: 169,
    d: "E",
    f3: 59.5,
    f30: null,
    keys: [
      "majority-element"
    ],
    days: [
      1
    ]
  },
  {
    rank: 35,
    slug: "valid-anagram",
    name: "Valid Anagram",
    n: 242,
    d: "E",
    f3: 59.5,
    f30: 61.7,
    keys: [
      "valid-anagram"
    ],
    days: [
      1
    ]
  },
  {
    rank: 36,
    slug: "reverse-integer",
    name: "Reverse Integer",
    n: 7,
    d: "M",
    f3: 59.5,
    f30: 54.4,
    xkey: "x-reverse-integer"
  },
  {
    rank: 37,
    slug: "capacity-to-ship-packages-within-d-days",
    name: "Capacity To Ship Packages Within D Days",
    n: 1011,
    d: "M",
    f3: 59.5,
    f30: 44.3,
    keys: [
      "capacity-to-ship-packages-within-d-days"
    ],
    days: [
      9
    ]
  },
  {
    rank: 38,
    slug: "task-scheduler",
    name: "Task Scheduler",
    n: 621,
    d: "M",
    f3: 59.5,
    f30: 61.7,
    keys: [
      "task-scheduler"
    ],
    days: [
      17
    ]
  },
  {
    rank: 39,
    slug: "merge-k-sorted-lists",
    name: "Merge k Sorted Lists",
    n: 23,
    d: "H",
    f3: 57.7,
    f30: 44.3,
    keys: [
      "merge-k-sorted-lists"
    ],
    days: [
      11
    ]
  },
  {
    rank: 40,
    slug: "remove-duplicates-from-sorted-array",
    name: "Remove Duplicates from Sorted Array",
    n: 26,
    d: "E",
    f3: 57.7,
    f30: 44.3,
    keys: [
      "remove-duplicates-from-sorted-array"
    ],
    days: [
      2
    ]
  },
  {
    rank: 41,
    slug: "fruit-into-baskets",
    name: "Fruit Into Baskets",
    n: 904,
    d: "M",
    f3: 57.7,
    f30: null,
    keys: [
      "fruit-into-baskets"
    ],
    days: [
      12
    ]
  },
  {
    rank: 42,
    slug: "asteroid-collision",
    name: "Asteroid Collision",
    n: 735,
    d: "M",
    f3: 57.7,
    f30: null,
    keys: [
      "asteroid-collision"
    ],
    days: [
      5
    ]
  },
  {
    rank: 43,
    slug: "linked-list-cycle",
    name: "Linked List Cycle",
    n: 141,
    d: "E",
    f3: 57.7,
    f30: 61.7,
    keys: [
      "linked-list-cycle"
    ],
    days: [
      5
    ]
  },
  {
    rank: 44,
    slug: "climbing-stairs",
    name: "Climbing Stairs",
    n: 70,
    d: "E",
    f3: 55.7,
    f30: null,
    keys: [
      "climbing-stairs"
    ],
    days: [
      7
    ]
  },
  {
    rank: 45,
    slug: "sliding-window-maximum",
    name: "Sliding Window Maximum",
    n: 239,
    d: "H",
    f3: 55.7,
    f30: null,
    keys: [
      "sliding-window-maximum"
    ],
    days: [
      20
    ]
  },
  {
    rank: 46,
    slug: "find-median-from-data-stream",
    name: "Find Median from Data Stream",
    n: 295,
    d: "H",
    f3: 55.7,
    f30: 54.4,
    keys: [
      "find-median-from-data-stream"
    ],
    days: [
      14
    ]
  },
  {
    rank: 47,
    slug: "single-element-in-a-sorted-array",
    name: "Single Element in a Sorted Array",
    n: 540,
    d: "M",
    f3: 55.7,
    f30: 54.4,
    keys: [
      "single-element-in-a-sorted-array"
    ],
    days: [
      21
    ]
  },
  {
    rank: 48,
    slug: "max-consecutive-ones-iii",
    name: "Max Consecutive Ones III",
    n: 1004,
    d: "M",
    f3: 55.7,
    f30: 67.4,
    keys: [
      "max-consecutive-ones-iii"
    ],
    days: [
      3
    ]
  },
  {
    rank: 49,
    slug: "next-permutation",
    name: "Next Permutation",
    n: 31,
    d: "M",
    f3: 55.7,
    f30: null,
    keys: [
      "next-permutation"
    ],
    days: [
      8
    ]
  },
  {
    rank: 50,
    slug: "split-array-largest-sum",
    name: "Split Array Largest Sum",
    n: 410,
    d: "H",
    f3: 55.7,
    f30: 61.7,
    keys: [
      "split-array-largest-sum"
    ],
    days: [
      9
    ]
  },
  {
    rank: 51,
    slug: "roman-to-integer",
    name: "Roman to Integer",
    n: 13,
    d: "E",
    f3: 55.7,
    f30: null,
    xkey: "x-roman-to-integer"
  },
  {
    rank: 52,
    slug: "merge-sorted-array",
    name: "Merge Sorted Array",
    n: 88,
    d: "E",
    f3: 55.7,
    f30: null,
    keys: [
      "merge-sorted-array"
    ],
    days: [
      2
    ]
  },
  {
    rank: 53,
    slug: "subsets",
    name: "Subsets",
    n: 78,
    d: "M",
    f3: 53.4,
    f30: null,
    keys: [
      "subsets"
    ],
    days: [
      19
    ]
  },
  {
    rank: 54,
    slug: "house-robber",
    name: "House Robber",
    n: 198,
    d: "M",
    f3: 53.4,
    f30: 67.4,
    keys: [
      "house-robber"
    ],
    days: [
      7
    ]
  },
  {
    rank: 55,
    slug: "concatenation-of-array",
    name: "Concatenation of Array",
    n: 1929,
    d: "E",
    f3: 53.4,
    f30: 54.4,
    xkey: "x-concatenation-of-array"
  },
  {
    rank: 56,
    slug: "minimum-operations-to-make-array-non-decreasing",
    name: "Minimum Operations to Make Array Non Decreasing",
    n: 3914,
    d: "M",
    f3: 53.4,
    f30: null,
    xkey: "x-minimum-operations-to-make-array-non-decreasing",
    contest: true
  },
  {
    rank: 57,
    slug: "binary-tree-maximum-path-sum",
    name: "Binary Tree Maximum Path Sum",
    n: 124,
    d: "H",
    f3: 53.4,
    f30: null,
    keys: [
      "binary-tree-maximum-path-sum"
    ],
    days: [
      13
    ]
  },
  {
    rank: 58,
    slug: "remove-k-digits",
    name: "Remove K Digits",
    n: 402,
    d: "M",
    f3: 53.4,
    f30: 54.4,
    keys: [
      "remove-k-digits"
    ],
    days: [
      10
    ]
  },
  {
    rank: 59,
    slug: "separate-black-and-white-balls",
    name: "Separate Black and White Balls",
    n: 2938,
    d: "M",
    f3: 53.4,
    f30: 54.4,
    keys: [
      "separate-black-and-white-balls"
    ],
    days: [
      23
    ]
  },
  {
    rank: 60,
    slug: "word-ladder",
    name: "Word Ladder",
    n: 127,
    d: "H",
    f3: 50.9,
    f30: null,
    keys: [
      "word-ladder"
    ],
    days: [
      16
    ]
  },
  {
    rank: 61,
    slug: "kth-largest-element-in-an-array",
    name: "Kth Largest Element in an Array",
    n: 215,
    d: "M",
    f3: 50.9,
    f30: null,
    keys: [
      "kth-largest-element-in-an-array"
    ],
    days: [
      14
    ]
  },
  {
    rank: 62,
    slug: "meeting-rooms-ii",
    name: "Meeting Rooms II",
    n: 253,
    d: "M",
    f3: 50.9,
    f30: null,
    keys: [
      "meeting-rooms-ii"
    ],
    days: [
      17
    ]
  },
  {
    rank: 63,
    slug: "daily-temperatures",
    name: "Daily Temperatures",
    n: 739,
    d: "M",
    f3: 50.9,
    f30: null,
    keys: [
      "daily-temperatures"
    ],
    days: [
      10
    ]
  },
  {
    rank: 64,
    slug: "minimum-window-substring",
    name: "Minimum Window Substring",
    n: 76,
    d: "H",
    f3: 50.9,
    f30: null,
    keys: [
      "minimum-window-substring",
      "minimum-window-substring--2"
    ],
    days: [
      12,
      26
    ]
  },
  {
    rank: 65,
    slug: "find-first-and-last-position-of-element-in-sorted-array",
    name: "Find First and Last Position of Element in Sorted Array",
    n: 34,
    d: "M",
    f3: 50.9,
    f30: 44.3,
    keys: [
      "find-first-and-last-position-of-element-in-sorted-array"
    ],
    days: [
      3
    ]
  },
  {
    rank: 66,
    slug: "find-the-index-of-the-first-occurrence-in-a-string",
    name: "Find the Index of the First Occurrence in a String",
    n: 28,
    d: "E",
    f3: 50.9,
    f30: null,
    xkey: "x-find-the-index-of-the-first-occurrence-in-a-string"
  },
  {
    rank: 67,
    slug: "longest-valid-parentheses",
    name: "Longest Valid Parentheses",
    n: 32,
    d: "H",
    f3: 50.9,
    f30: 67.4,
    keys: [
      "longest-valid-parentheses"
    ],
    days: [
      10
    ]
  },
  {
    rank: 68,
    slug: "interleaving-string",
    name: "Interleaving String",
    n: 97,
    d: "M",
    f3: 50.9,
    f30: 54.4,
    keys: [
      "interleaving-string"
    ],
    days: [
      18
    ]
  },
  {
    rank: 69,
    slug: "binary-search",
    name: "Binary Search",
    n: 704,
    d: "E",
    f3: 50.9,
    f30: 67.4,
    keys: [
      "binary-search"
    ],
    days: [
      3
    ]
  },
  {
    rank: 70,
    slug: "maximum-average-subarray-i",
    name: "Maximum Average Subarray I",
    n: 643,
    d: "E",
    f3: 50.9,
    f30: null,
    keys: [
      "maximum-average-subarray-i"
    ],
    days: [
      3
    ]
  },
  {
    rank: 71,
    slug: "4sum",
    name: "4Sum",
    n: 18,
    d: "M",
    f3: 48.1,
    f30: 44.3,
    keys: [
      "4sum"
    ],
    days: [
      22
    ]
  },
  {
    rank: 72,
    slug: "merge-two-sorted-lists",
    name: "Merge Two Sorted Lists",
    n: 21,
    d: "E",
    f3: 48.1,
    f30: 44.3,
    keys: [
      "merge-two-sorted-lists"
    ],
    days: [
      5
    ]
  },
  {
    rank: 73,
    slug: "rotate-image",
    name: "Rotate Image",
    n: 48,
    d: "M",
    f3: 48.1,
    f30: null,
    keys: [
      "rotate-image"
    ],
    days: [
      20
    ]
  },
  {
    rank: 74,
    slug: "pascals-triangle",
    name: "Pascal's Triangle",
    n: 118,
    d: "E",
    f3: 48.1,
    f30: null,
    keys: [
      "pascals-triangle"
    ],
    days: [
      7
    ]
  },
  {
    rank: 75,
    slug: "next-greater-element-ii",
    name: "Next Greater Element II",
    n: 503,
    d: "M",
    f3: 48.1,
    f30: null,
    keys: [
      "next-greater-element-ii"
    ],
    days: [
      22
    ]
  },
  {
    rank: 76,
    slug: "contains-duplicate",
    name: "Contains Duplicate",
    n: 217,
    d: "E",
    f3: 48.1,
    f30: null,
    keys: [
      "contains-duplicate"
    ],
    days: [
      1
    ]
  },
  {
    rank: 77,
    slug: "search-insert-position",
    name: "Search Insert Position",
    n: 35,
    d: "E",
    f3: 48.1,
    f30: null,
    keys: [
      "search-insert-position"
    ],
    days: [
      3
    ]
  },
  {
    rank: 78,
    slug: "next-greater-element-i",
    name: "Next Greater Element I",
    n: 496,
    d: "E",
    f3: 48.1,
    f30: null,
    keys: [
      "next-greater-element-i"
    ],
    days: [
      22
    ]
  },
  {
    rank: 79,
    slug: "search-a-2d-matrix-ii",
    name: "Search a 2D Matrix II",
    n: 240,
    d: "M",
    f3: 48.1,
    f30: 44.3,
    keys: [
      "search-a-2d-matrix-ii"
    ],
    days: [
      3
    ]
  },
  {
    rank: 80,
    slug: "valid-palindrome",
    name: "Valid Palindrome",
    n: 125,
    d: "E",
    f3: 48.1,
    f30: null,
    keys: [
      "valid-palindrome"
    ],
    days: [
      2
    ]
  },
  {
    rank: 81,
    slug: "coin-change",
    name: "Coin Change",
    n: 322,
    d: "M",
    f3: 48.1,
    f30: 61.7,
    keys: [
      "coin-change"
    ],
    days: [
      18
    ]
  },
  {
    rank: 82,
    slug: "course-schedule-ii",
    name: "Course Schedule II",
    n: 210,
    d: "M",
    f3: 48.1,
    f30: 54.4,
    keys: [
      "course-schedule-ii"
    ],
    days: [
      15
    ]
  },
  {
    rank: 83,
    slug: "find-minimum-in-rotated-sorted-array",
    name: "Find Minimum in Rotated Sorted Array",
    n: 153,
    d: "M",
    f3: 48.1,
    f30: null,
    keys: [
      "find-minimum-in-rotated-sorted-array"
    ],
    days: [
      9
    ]
  },
  {
    rank: 84,
    slug: "range-sum-query-immutable",
    name: "Range Sum Query - Immutable",
    n: 303,
    d: "E",
    f3: 48.1,
    f30: 44.3,
    xkey: "x-range-sum-query-immutable"
  },
  {
    rank: 85,
    slug: "maximum-bitwise-and-after-increment-operations",
    name: "Maximum Bitwise AND After Increment Operations",
    n: 3806,
    d: "H",
    f3: 48.1,
    f30: 75.9,
    xkey: "x-maximum-bitwise-and-after-increment-operations",
    contest: true
  },
  {
    rank: 86,
    slug: "maximum-nesting-depth-of-two-valid-parentheses-strings",
    name: "Maximum Nesting Depth of Two Valid Parentheses Strings",
    n: 1111,
    d: "M",
    f3: 48.1,
    f30: 61.7,
    xkey: "x-maximum-nesting-depth-of-two-valid-parentheses-strings"
  },
  {
    rank: 87,
    slug: "letter-combinations-of-a-phone-number",
    name: "Letter Combinations of a Phone Number",
    n: 17,
    d: "M",
    f3: 44.9,
    f30: null,
    keys: [
      "letter-combinations-of-a-phone-number"
    ],
    days: [
      19
    ]
  },
  {
    rank: 88,
    slug: "largest-rectangle-in-histogram",
    name: "Largest Rectangle in Histogram",
    n: 84,
    d: "H",
    f3: 44.9,
    f30: 44.3,
    keys: [
      "largest-rectangle-in-histogram",
      "largest-rectangle-in-histogram--2"
    ],
    days: [
      10,
      26
    ]
  },
  {
    rank: 89,
    slug: "single-number",
    name: "Single Number",
    n: 136,
    d: "E",
    f3: 44.9,
    f30: 44.3,
    keys: [
      "single-number"
    ],
    days: [
      27
    ]
  },
  {
    rank: 90,
    slug: "find-the-duplicate-number",
    name: "Find the Duplicate Number",
    n: 287,
    d: "M",
    f3: 44.9,
    f30: null,
    keys: [
      "find-the-duplicate-number"
    ],
    days: [
      11
    ]
  },
  {
    rank: 91,
    slug: "n-queens",
    name: "N-Queens",
    n: 51,
    d: "H",
    f3: 44.9,
    f30: 44.3,
    keys: [
      "n-queens"
    ],
    days: [
      26
    ]
  },
  {
    rank: 92,
    slug: "permutations",
    name: "Permutations",
    n: 46,
    d: "M",
    f3: 44.9,
    f30: 44.3,
    keys: [
      "permutations"
    ],
    days: [
      19
    ]
  },
  {
    rank: 93,
    slug: "word-break",
    name: "Word Break",
    n: 139,
    d: "M",
    f3: 44.9,
    f30: 44.3,
    keys: [
      "word-break"
    ],
    days: [
      18
    ]
  },
  {
    rank: 94,
    slug: "integer-to-roman",
    name: "Integer to Roman",
    n: 12,
    d: "M",
    f3: 44.9,
    f30: 44.3,
    xkey: "x-integer-to-roman"
  },
  {
    rank: 95,
    slug: "validate-binary-search-tree",
    name: "Validate Binary Search Tree",
    n: 98,
    d: "M",
    f3: 44.9,
    f30: null,
    keys: [
      "validate-binary-search-tree"
    ],
    days: [
      13
    ]
  },
  {
    rank: 96,
    slug: "string-to-integer-atoi",
    name: "String to Integer (atoi)",
    n: 8,
    d: "M",
    f3: 44.9,
    f30: 44.3,
    keys: [
      "string-to-integer-atoi"
    ],
    days: [
      27
    ]
  },
  {
    rank: 97,
    slug: "evaluate-division",
    name: "Evaluate Division",
    n: 399,
    d: "M",
    f3: 44.9,
    f30: 44.3,
    keys: [
      "evaluate-division"
    ],
    days: [
      15
    ]
  },
  {
    rank: 98,
    slug: "reverse-nodes-in-k-group",
    name: "Reverse Nodes in k-Group",
    n: 25,
    d: "H",
    f3: 44.9,
    f30: null,
    keys: [
      "reverse-nodes-in-k-group"
    ],
    days: [
      23
    ]
  },
  {
    rank: 99,
    slug: "two-sum-ii-input-array-is-sorted",
    name: "Two Sum II - Input Array Is Sorted",
    n: 167,
    d: "M",
    f3: 44.9,
    f30: null,
    keys: [
      "two-sum-ii-input-array-is-sorted"
    ],
    days: [
      2
    ]
  },
  {
    rank: 100,
    slug: "k-closest-points-to-origin",
    name: "K Closest Points to Origin",
    n: 973,
    d: "M",
    f3: 44.9,
    f30: null,
    keys: [
      "k-closest-points-to-origin"
    ],
    days: [
      23
    ]
  },
  {
    rank: 101,
    slug: "maximum-white-tiles-covered-by-a-carpet",
    name: "Maximum White Tiles Covered by a Carpet",
    n: 2271,
    d: "M",
    f3: 44.9,
    f30: 44.3,
    keys: [
      "maximum-white-tiles-covered-by-a-carpet"
    ],
    days: [
      24
    ]
  },
  {
    rank: 102,
    slug: "divide-two-integers",
    name: "Divide Two Integers",
    n: 29,
    d: "M",
    f3: 44.9,
    f30: 54.4,
    keys: [
      "divide-two-integers"
    ],
    days: [
      27
    ]
  },
  {
    rank: 103,
    slug: "contiguous-array",
    name: "Contiguous Array",
    n: 525,
    d: "M",
    f3: 44.9,
    f30: 44.3,
    keys: [
      "contiguous-array"
    ],
    days: [
      8
    ]
  },
  {
    rank: 104,
    slug: "insert-delete-getrandom-o1",
    name: "Insert Delete GetRandom O(1)",
    n: 380,
    d: "M",
    f3: 44.9,
    f30: null,
    keys: [
      "insert-delete-getrandom-o1"
    ],
    days: [
      14
    ]
  },
  {
    rank: 105,
    slug: "candy",
    name: "Candy",
    n: 135,
    d: "H",
    f3: 44.9,
    f30: null,
    keys: [
      "candy"
    ],
    days: [
      17
    ]
  },
  {
    rank: 106,
    slug: "length-of-last-word",
    name: "Length of Last Word",
    n: 58,
    d: "E",
    f3: 44.9,
    f30: 54.4,
    xkey: "x-length-of-last-word"
  },
  {
    rank: 107,
    slug: "lexicographically-smallest-permutation-greater-than-target",
    name: "Lexicographically Smallest Permutation Greater Than Target",
    n: 3720,
    d: "M",
    f3: 44.9,
    f30: null,
    xkey: "x-lexicographically-smallest-permutation-greater-than-target",
    contest: true
  },
  {
    rank: 108,
    slug: "jump-game-ii",
    name: "Jump Game II",
    n: 45,
    d: "M",
    f3: 41,
    f30: null,
    keys: [
      "jump-game-ii"
    ],
    days: [
      17
    ]
  },
  {
    rank: 109,
    slug: "spiral-matrix",
    name: "Spiral Matrix",
    n: 54,
    d: "M",
    f3: 41,
    f30: 44.3,
    keys: [
      "spiral-matrix"
    ],
    days: [
      20
    ]
  },
  {
    rank: 110,
    slug: "zigzag-conversion",
    name: "Zigzag Conversion",
    n: 6,
    d: "M",
    f3: 41,
    f30: null,
    xkey: "x-zigzag-conversion"
  },
  {
    rank: 111,
    slug: "odd-even-linked-list",
    name: "Odd Even Linked List",
    n: 328,
    d: "M",
    f3: 41,
    f30: null,
    keys: [
      "odd-even-linked-list"
    ],
    days: [
      5
    ]
  },
  {
    rank: 112,
    slug: "min-stack",
    name: "Min Stack",
    n: 155,
    d: "M",
    f3: 41,
    f30: null,
    keys: [
      "min-stack"
    ],
    days: [
      10
    ]
  },
  {
    rank: 113,
    slug: "largest-number",
    name: "Largest Number",
    n: 179,
    d: "M",
    f3: 41,
    f30: null,
    keys: [
      "largest-number"
    ],
    days: [
      23
    ]
  },
  {
    rank: 114,
    slug: "remove-element",
    name: "Remove Element",
    n: 27,
    d: "E",
    f3: 41,
    f30: null,
    xkey: "x-remove-element"
  },
  {
    rank: 115,
    slug: "permutation-in-string",
    name: "Permutation in String",
    n: 567,
    d: "M",
    f3: 41,
    f30: null,
    keys: [
      "permutation-in-string"
    ],
    days: [
      12
    ]
  },
  {
    rank: 116,
    slug: "reverse-string",
    name: "Reverse String",
    n: 344,
    d: "E",
    f3: 41,
    f30: 44.3,
    xkey: "x-reverse-string"
  },
  {
    rank: 117,
    slug: "reorder-list",
    name: "Reorder List",
    n: 143,
    d: "M",
    f3: 41,
    f30: null,
    keys: [
      "reorder-list"
    ],
    days: [
      11
    ]
  },
  {
    rank: 118,
    slug: "best-time-to-buy-and-sell-stock-ii",
    name: "Best Time to Buy and Sell Stock II",
    n: 122,
    d: "M",
    f3: 41,
    f30: 54.4,
    keys: [
      "best-time-to-buy-and-sell-stock-ii"
    ],
    days: [
      7
    ]
  },
  {
    rank: 119,
    slug: "valid-palindrome-ii",
    name: "Valid Palindrome II",
    n: 680,
    d: "E",
    f3: 41,
    f30: null,
    xkey: "x-valid-palindrome-ii"
  },
  {
    rank: 120,
    slug: "reverse-linked-list",
    name: "Reverse Linked List",
    n: 206,
    d: "E",
    f3: 41,
    f30: null,
    keys: [
      "reverse-linked-list"
    ],
    days: [
      5
    ]
  }
];

// src/data/amazon/lp.json
var lp_default = [
  {
    id: "lp-deadline",
    q: "A hard deadline, including one where requirements changed: the result, your manager\u2019s feedback, what you changed",
    s: "A real release or CI crunch at Parallel Wireless (your example)",
    p: [
      "Deliver Results",
      "Ownership"
    ],
    src: [
      "lc7724048",
      "lc8542365",
      "roundz"
    ],
    note: "Asked by two interviewers in one loop"
  },
  {
    id: "lp-missed",
    q: "A missed deadline: how you told stakeholders and what you would do differently",
    s: "Your example",
    p: [
      "Earn Trust",
      "Ownership"
    ],
    src: [
      "lc6393977",
      "lc7724048",
      "lc6738470"
    ],
    note: ""
  },
  {
    id: "lp-beyond",
    q: "Going beyond your role, or taking on something significant outside it",
    s: "The RAG triage service or TC Executor, if it started as your initiative; or debugging flaky test infrastructure",
    p: [
      "Ownership"
    ],
    src: [
      "lc6393977",
      "lc7035289",
      "roundz"
    ],
    note: ""
  },
  {
    id: "lp-challenge",
    q: "Your most challenging project, or something hard you built",
    s: "The EventLogging producer-consumer race, where a fast reader outran a slow writer and dropped data",
    p: [
      "Dive Deep",
      "Insist on the Highest Standards"
    ],
    src: [
      "lc6393977",
      "lc7035289"
    ],
    note: ""
  },
  {
    id: "lp-divedeep",
    q: "Diving deep into a problem (expect many follow-ups)",
    s: "Tracing flaky runs to silent SCP/SSH failures and cron race conditions",
    p: [
      "Dive Deep"
    ],
    src: [
      "lc7724048",
      "lc8014509",
      "lc6393977",
      "lc6738470"
    ],
    note: ""
  },
  {
    id: "lp-convince",
    q: "Convincing someone of your approach, or persuading a colleague who disagreed",
    s: "Getting QA and dev teams to adopt TC Executor",
    p: [
      "Earn Trust",
      "Have Backbone; Disagree and Commit"
    ],
    src: [
      "lc7724048",
      "lc8014509",
      "lc6738470"
    ],
    note: ""
  },
  {
    id: "lp-conflict",
    q: "A conflict, or disagreeing with a team decision, and how you resolved it",
    s: "Reviewing PRs as maintainer for teams in Pune, Bengaluru and Israel",
    p: [
      "Have Backbone; Disagree and Commit"
    ],
    src: [
      "roundz"
    ],
    note: ""
  },
  {
    id: "lp-manager",
    q: "Disagreeing with your manager",
    s: "Your example",
    p: [
      "Have Backbone; Disagree and Commit"
    ],
    src: [
      "roundz"
    ],
    note: ""
  },
  {
    id: "lp-feedback",
    q: "Critical feedback from your manager, and what changed afterwards",
    s: "Your example",
    p: [
      "Learn and Be Curious",
      "Earn Trust"
    ],
    src: [
      "lc6393977",
      "lc6738470",
      "lc8542365"
    ],
    note: ""
  },
  {
    id: "lp-right",
    q: "How you knew your approach would actually work (data, tests, metrics)",
    s: "The RAG service\u2019s 20%+ debuggability gain, or CI failure-rate data",
    p: [
      "Are Right, A Lot",
      "Dive Deep"
    ],
    src: [
      "lc6393977",
      "lc8542365"
    ],
    note: "A Bar Raiser asked: \u201CHow did you know multithreading would solve it?\u201D"
  },
  {
    id: "lp-stuck",
    q: "When you were stuck: how you decided what to do next",
    s: "Your example",
    p: [
      "Bias for Action",
      "Dive Deep"
    ],
    src: [
      "lc6393977"
    ],
    note: ""
  },
  {
    id: "lp-data",
    q: "A data-driven or intuition-based decision",
    s: "CRV\u2019s daily coverage reports driving new tests for low-coverage modules",
    p: [
      "Are Right, A Lot",
      "Dive Deep"
    ],
    src: [],
    note: ""
  },
  {
    id: "lp-simplify",
    q: "Simplifying a process",
    s: "Turning a recurring two-PR data-model change into a single-file edit",
    p: [
      "Invent and Simplify"
    ],
    src: [],
    note: ""
  },
  {
    id: "lp-ownership",
    q: "Owning something end to end and delivering",
    s: "Taking Core-Stacks CI from unstable to a very low failure rate (Star Award)",
    p: [
      "Ownership",
      "Deliver Results"
    ],
    src: [
      "lc8542365",
      "lc6738470"
    ],
    note: ""
  },
  {
    id: "lp-customer",
    q: "Customer obsession",
    s: "The RAG triage service giving engineers same-day bug closure",
    p: [
      "Customer Obsession"
    ],
    src: [],
    note: ""
  },
  {
    id: "lp-helping",
    q: "Helping a teammate, or handing over responsibilities",
    s: "Your example",
    p: [
      "Ownership",
      "Earn Trust"
    ],
    src: [
      "lc6738470",
      "lc6393977"
    ],
    note: ""
  },
  {
    id: "lp-mentor",
    q: "Mentoring someone",
    s: "Your example (a new joiner or intern you guided through CI or code review)",
    p: [
      "Hire and Develop the Best"
    ],
    src: [
      "roundz"
    ],
    note: ""
  },
  {
    id: "lp-failure",
    q: "A failure or a blunder, and what you learned",
    s: "Your example",
    p: [
      "Learn and Be Curious"
    ],
    src: [
      "gfg2022",
      "roundz"
    ],
    note: ""
  },
  {
    id: "lp-sme",
    q: "Becoming the expert on something so you could build a feature you needed",
    s: "Learning embeddings, vector databases and RAG to build the triage service",
    p: [
      "Learn and Be Curious",
      "Dive Deep"
    ],
    src: [
      "lc6738470"
    ],
    note: ""
  },
  {
    id: "lp-frugal",
    q: "Innovation and frugality in your GenAI project",
    s: "TC Executor or the RAG service: what you built with the tools and infrastructure you already had",
    p: [
      "Invent and Simplify",
      "Frugality"
    ],
    src: [
      "lc7981646"
    ],
    note: ""
  },
  {
    id: "lp-redo",
    q: "A feature you built in a week or two that later had to be redone",
    s: "Your example",
    p: [
      "Insist on the Highest Standards",
      "Bias for Action"
    ],
    src: [
      "lc6738470"
    ],
    note: ""
  },
  {
    id: "lp-ambiguity",
    q: "Handling ambiguity: a vague, one-line requirement",
    s: "Your example (TC Executor\u2019s early scope, if it fits)",
    p: [
      "Bias for Action",
      "Ownership"
    ],
    src: [
      "roundz"
    ],
    note: ""
  },
  {
    id: "lp-weakness",
    q: "Something you are not good at, how you are improving it, and how you learn a new technology",
    s: "Your example, plus how you picked up LLM and RAG tooling",
    p: [
      "Learn and Be Curious"
    ],
    src: [
      "lc7035289",
      "lc6393977"
    ],
    note: ""
  },
  {
    id: "lp-why",
    q: "Why Amazon, and why leave your current job?",
    s: "Your own answer, tied to the FinOps FP&amp;A team",
    p: [],
    src: [
      "gfg2022"
    ],
    note: ""
  }
];

// src/data/amazon/resume.json
var resume_default = [
  {
    id: "rd-rag",
    t: "RAG failure-triage service",
    q: "How logs and docs are chunked and embedded; which vector database and why; how a failure is labelled infra or product defect; how you measured \u201C20%+ better debuggability\u201D; what happens when it is wrong."
  },
  {
    id: "rd-tcx",
    t: "TC Executor",
    q: "How generated Pytest cases are checked before they run; prompt design; handling wrong or made-up tests; how runs are scheduled on private, develop and release branches (useful for the \u201Cschedule processes\u201D design question)."
  },
  {
    id: "rd-config",
    t: "Config automation",
    q: "How the two-PR data-model change became a one-file edit; what gets generated; how the REST API publish is validated and rolled back."
  },
  {
    id: "rd-ci",
    t: "Core-Stacks Jenkins CI",
    q: "What made it unstable; what you changed; how you measured the failure rate; how the Groovy pipeline is structured."
  },
  {
    id: "rd-eventlog",
    t: "EventLogging race fix",
    q: "Why the fast reader dropped data; the fix and why you chose it; how you proved it worked; the Coverity and Clang findings. A 2026 Bar Raiser asked: \u201CHow did you know multithreading would solve it?\u201D"
  },
  {
    id: "rd-flaky",
    t: "Flaky test infrastructure",
    q: "How you traced silent SCP/SSH failures and cron race conditions."
  },
  {
    id: "rd-crv",
    t: "CRV",
    q: "Django REST + React architecture, SSO, data model, coverage alerts, Docker setup."
  },
  {
    id: "rd-k8s",
    t: "Kubernetes KPI pod and ELK pipelines",
    q: "Log volume, how KPI failures are detected, the upload to the SMO cloud."
  },
  {
    id: "rd-voice",
    t: "AI Voice Caller",
    q: "Multi-tenant isolation; the streaming STT \u2192 LLM \u2192 TTS latency budget; how tenant documents feed the RAG knowledge base."
  },
  {
    id: "rd-realestate",
    t: "Real Estate Listing Portal",
    q: "The 48-table PostgreSQL schema, scoped RBAC, Redis workers, and how WhatsApp messages become leads."
  },
  {
    id: "rd-vision",
    t: "Real Vision AI",
    q: "Why YOLOv8; latency on edge NPU/GPU; handling many camera feeds; how the LLM search over recorded events works."
  },
  {
    id: "rd-systems",
    t: "Systems projects",
    q: "Virtual File System internals (incore inode table, file table, UAREA) and your Java projects."
  },
  {
    id: "rd-skills",
    t: "Skills your resume claims",
    q: "2-minute answers on Java collections and multithreading, JVM memory and GC, OS processes, threads and deadlocks, SQL joins and indexes, REST, Docker and Kubernetes basics."
  }
];

// src/data/amazon/genai.json
var genai_default = [
  {
    id: "ga-workflow",
    q: "How do you use GenAI in your daily work?",
    s: "",
    src: [
      "lc8546875",
      "tuf",
      "lc7621408",
      "rd1"
    ]
  },
  {
    id: "ga-best",
    q: "How do you make the best use of LLMs?",
    s: "",
    src: [
      "lc7724048"
    ]
  },
  {
    id: "ga-usecases",
    q: "Which GenAI use cases did you find in your projects?",
    s: "",
    src: [
      "rd1"
    ]
  },
  {
    id: "ga-verify",
    q: "How do you check GenAI output, and AI-written code, before you trust it?",
    s: "",
    src: [
      "lc7724048",
      "lc8014509",
      "rd1"
    ]
  },
  {
    id: "ga-models",
    q: "Which models do you prefer, and why?",
    s: "",
    src: [
      "rd1"
    ]
  },
  {
    id: "ga-tasks",
    q: "How do you decide which tasks to give to GenAI?",
    s: "",
    src: [
      "rd1"
    ]
  },
  {
    id: "ga-measure",
    q: "How do you measure a model\u2019s performance?",
    s: "",
    src: [
      "rd1"
    ]
  },
  {
    id: "ga-agents",
    q: "Tell me about agents and AI workflows you have built.",
    s: "TC Executor and the RAG triage service",
    src: [
      "lc8542365",
      "rd1"
    ]
  },
  {
    id: "ga-tips",
    q: "What are your tips for using LLMs efficiently?",
    s: "",
    src: [
      "lc7724048",
      "rd1"
    ]
  },
  {
    id: "ga-incident",
    q: "Scenario: a production incident must be fixed within one hour, and you may use AI tools. Walk through triage, logs and monitoring, what you ask the AI, and how you avoid relying on it too much.",
    s: "Your RAG failure-triage service is a strong example here",
    src: [
      "lc8029194"
    ]
  },
  {
    id: "ga-arch",
    q: "Walk through your GenAI project\u2019s architecture in 30 minutes, including where it shows Invent and Simplify and Frugality.",
    s: "TC Executor or the RAG service",
    src: [
      "lc7981646"
    ]
  },
  {
    id: "ga-br",
    q: "Bar Raiser rehearsal: a friend grills you for 45 minutes on one project: why this approach, the alternatives, how you knew it worked, the critical feedback, what changed.",
    s: "Expect 3\u20135 LP questions with follow-ups on your exact contribution, metrics and trade-offs",
    src: [
      "lc8542365",
      "lc7724048",
      "lc6393977"
    ]
  }
];

// src/data/amazon/dayof.json
var dayof_default = [
  {
    id: "do-room",
    q: "Quiet room, stable internet, laptop charged, camera and mic tested"
  },
  {
    id: "do-paper",
    q: "Pen and paper for dry runs, and water"
  },
  {
    id: "do-early",
    q: "Join 5 minutes early"
  },
  {
    id: "do-steps",
    q: "For every problem: clarify \u2192 brute force \u2192 optimal \u2192 code \u2192 dry run \u2192 complexity"
  },
  {
    id: "do-aloud",
    q: "Think out loud, unless the interviewer asks you to finish the code first"
  },
  {
    id: "do-sleep",
    q: "Seven hours of sleep the night before"
  },
  {
    id: "do-questions",
    q: "Two questions ready to ask each interviewer"
  }
];

// src/data/amazon/coverage.json
var coverage_default = [
  {
    id: "cov-bigo",
    t: "Complexity analysis (Big-O, space)",
    go: [
      1
    ]
  },
  {
    id: "cov-arrays",
    t: "Arrays, hashing, two pointers",
    go: [
      1,
      2,
      8
    ]
  },
  {
    id: "cov-prefix",
    t: "Prefix sums and Kadane",
    go: [
      2,
      8,
      22
    ]
  },
  {
    id: "cov-bsearch",
    t: "Binary search and binary search on the answer",
    go: [
      3,
      9,
      21,
      25
    ]
  },
  {
    id: "cov-window",
    t: "Sliding window",
    go: [
      3,
      12,
      22
    ]
  },
  {
    id: "cov-stack",
    t: "Stacks, monotonic stack, string parsing",
    go: [
      5,
      10,
      20,
      22
    ]
  },
  {
    id: "cov-lists",
    t: "Linked lists",
    go: [
      5,
      11,
      23
    ]
  },
  {
    id: "cov-trees",
    t: "Recursion and binary trees",
    go: [
      4,
      13,
      20,
      21
    ]
  },
  {
    id: "cov-bst",
    t: "BST, heaps and hashing",
    go: [
      6,
      14,
      24
    ]
  },
  {
    id: "cov-trie",
    t: "Trie and LRU/LFU design",
    go: [
      14,
      21,
      24
    ]
  },
  {
    id: "cov-matrix",
    t: "Matrix problems",
    go: [
      1,
      3,
      20
    ]
  },
  {
    id: "cov-graph1",
    t: "Graphs: BFS, DFS, topological sort",
    go: [
      7,
      15,
      20
    ]
  },
  {
    id: "cov-graph2",
    t: "Graphs: Dijkstra, union-find, minimum spanning tree",
    go: [
      16
    ]
  },
  {
    id: "cov-greedy",
    t: "Greedy and intervals",
    go: [
      7,
      17,
      23
    ]
  },
  {
    id: "cov-dp1",
    t: "DP: 1-D and knapsack",
    go: [
      7,
      18,
      21,
      23
    ]
  },
  {
    id: "cov-dp2",
    t: "DP: 2-D and state machine",
    go: [
      19,
      23
    ]
  },
  {
    id: "cov-backtrack",
    t: "Backtracking",
    go: [
      4,
      14,
      19,
      26
    ]
  },
  {
    id: "cov-bits",
    t: "Bit manipulation and math",
    go: [
      27
    ]
  },
  {
    id: "cov-lld",
    t: "Low-level design and OOP",
    go: [
      24,
      26
    ]
  },
  {
    id: "cov-asked",
    t: "Previously asked Amazon questions",
    go: [
      20,
      21,
      22,
      23,
      24
    ]
  },
  {
    id: "cov-freq",
    t: "Amazon\u2019s most frequent problems",
    go: [
      "freq"
    ]
  },
  {
    id: "cov-mocks",
    t: "Mock interviews",
    go: [
      4,
      11,
      17,
      18,
      24,
      25
    ]
  },
  {
    id: "cov-lp",
    t: "Leadership Principles story bank",
    go: [
      "stories"
    ]
  },
  {
    id: "cov-resume",
    t: "Resume deep dive",
    go: [
      9,
      14,
      16,
      18,
      25
    ]
  },
  {
    id: "cov-genai",
    t: "GenAI questions",
    go: [
      17,
      19,
      25
    ]
  }
];

// src/data/amazon/index.ts
var AMAZON_PHASES = plan_default.phases;
var AMAZON_DAYS = plan_default.days;
var AMAZON_FREQ = freq_default;
var AMAZON_LP = lp_default;
var AMAZON_RESUME = resume_default;
var AMAZON_GENAI = genai_default;
var AMAZON_DAYOF = dayof_default;
var AMAZON_COVERAGE = coverage_default;
var lcUrl = (slug) => `https://leetcode.com/problems/${slug}/`;
var ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };
function plainText(html) {
  return html.replace(/<\/?b>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m) => ENTITIES[m] ?? m);
}

// src/engine/amazon.ts
var LC_MINUTES = { E: 20, M: 40, H: 60 };
var TASK_MINUTES = {
  Learn: 45,
  LP: 30,
  Notes: 30,
  Review: 60,
  Mock: 60,
  Resume: 45,
  GenAI: 40,
  LLD: 60,
  Problem: 40,
  Ladder: 60,
  Rest: 0
};
var P0_TASKS = /* @__PURE__ */ new Set(["LP", "Mock", "Resume", "GenAI", "LLD", "Review", "Ladder", "Problem", "Rest"]);
var nextTier = (t) => t === "P0" ? "P1" : t === "P1" ? "P2" : "P3";
function tierFor(raw, day, phase, slot) {
  if (day === 28) return "P0";
  if (raw.t === "task") {
    if (raw.a === 1 || P0_TASKS.has(raw.k)) return "P0";
    return "P1";
  }
  const f3 = raw.f3 ?? 0;
  let tier;
  if (raw.a === 1) tier = "P0";
  else if (f3 >= 60) tier = "P1";
  else if (phase === 2 && slot === "core" && f3 >= 40) tier = "P1";
  else if (raw.a === 2) tier = "P2";
  else if (slot === "core") tier = "P2";
  else if (f3 >= 50) tier = "P2";
  else tier = "P3";
  if (raw.prem && raw.a !== 1) tier = nextTier(tier);
  return tier;
}
function flatten() {
  const out = [];
  for (const d of AMAZON_DAYS) {
    const phase = d.phase ?? 1;
    const push = (raw, slot, index) => {
      const base = {
        key: raw.key,
        day: d.n,
        phase,
        slot,
        index,
        asked: raw.a === 1 ? 1 : raw.a === 2 ? 2 : 0,
        src: (raw.src ?? []).filter((s) => s !== "freq"),
        tier: tierFor(raw, d.n, phase, slot),
        topic: d.title
      };
      if (raw.t === "lc") {
        out.push({
          ...base,
          type: "lc",
          title: raw.name,
          rich: raw.name,
          kind: "Problem",
          slug: raw.slug,
          n: raw.n,
          d: raw.d,
          f3: raw.f3,
          f30: raw.f30,
          prem: Boolean(raw.prem),
          note: raw.note,
          minutes: LC_MINUTES[raw.d],
          repeat: /--\d$/.test(raw.key)
        });
      } else {
        out.push({
          ...base,
          type: "task",
          title: plainText(raw.text),
          rich: raw.text,
          kind: raw.k,
          prem: false,
          minutes: TASK_MINUTES[raw.k] ?? 45,
          repeat: false
        });
      }
    };
    d.items.forEach((raw, i) => push(raw, "core", i));
    d.night.forEach((raw, i) => push(raw, "night", i));
  }
  return out;
}
var AMAZON_ITEMS = flatten();
var BY_KEY = new Map(AMAZON_ITEMS.map((i) => [i.key, i]));
function amazonItem(key) {
  return BY_KEY.get(key);
}
var AMAZON_PROBLEM_SLUGS = [
  ...new Set(AMAZON_ITEMS.filter((i) => i.type === "lc" && i.slug).map((i) => i.slug))
];
var AMAZON_ASKED_SLUGS = [
  ...new Set(AMAZON_ITEMS.filter((i) => i.type === "lc" && i.asked === 1 && i.slug).map((i) => i.slug))
];
function solidDays(solidTopics) {
  const days = /* @__PURE__ */ new Set();
  for (const id of solidTopics) {
    const topic = AMAZON_COVERAGE.find((t) => t.id === id);
    for (const go of topic?.go ?? []) if (typeof go === "number" && go <= 7) days.add(go);
  }
  return days;
}
function effectiveTier(item, solid) {
  if (item.phase === 1 && item.asked === 0 && solid.has(item.day)) return "P3";
  return item.tier;
}
function revisionsDue(state, today = todayISO()) {
  return Object.entries(state.amazon.items).filter(([, log]) => log.revisitOn && log.revisitOn <= today).sort(([, a], [, b]) => (a.revisitOn ?? "").localeCompare(b.revisitOn ?? "")).map(([key]) => amazonItem(key)).filter((i) => Boolean(i));
}

// src/data/routine.ts
var WEEKDAY = [
  { id: "wake", start: "wakeTime", end: "exerciseStart", label: "Wake \xB7 water \xB7 no phone", kind: "wake", note: "A glass of water, then shoes on. The first ten minutes decide whether the day is yours." },
  { id: "am-move", start: "exerciseStart", end: "exerciseEnd", label: "Morning run + core", kind: "move", when: "am-run", note: "Warm up, run easy, cool down, then the short strength set. Today\u2019s session is on the Fitness tab." },
  { id: "am-easy", start: "exerciseStart", end: "exerciseEnd", label: "Easy morning \xB7 10-minute walk \xB7 stretch", kind: "routine", when: "am-norun", note: "The run is in the evening today, so keep the morning light and get daylight on your face." },
  { id: "ready", start: "exerciseEnd", end: "officeStart", label: "Shower \xB7 breakfast \xB7 get ready", kind: "meal", note: "Protein first: eggs, paneer, dal or curd before anything sweet." },
  { id: "office", start: "officeStart", end: "officeEnd", label: "Office \xB7 commute both ways", kind: "work", study: "office", note: "The job comes first; the resume lines come from here. Spare minutes go to reading an LP story, nothing heavier." },
  { id: "settle", start: "officeEnd", end: "studyBlock1Start", label: "Home \xB7 freshen up \xB7 snack \xB7 your time", kind: "free", when: "pm-norun", note: "Change, eat something small, and take the hour. Study starts at the block, not before." },
  { id: "settle-short", start: "officeEnd", end: "officeEnd+15", label: "Home \xB7 change", kind: "free", when: "pm-run", note: "Shoes on within fifteen minutes, before the sofa wins." },
  { id: "pm-move", start: "officeEnd+15", end: "studyBlock1Start", label: "Evening run + core", kind: "move", when: "pm-run", note: "Same session as the morning plan. Shower and a quick snack before the block." },
  { id: "block1", start: "studyBlock1Start", end: "studyBlock1End", label: "Study block 1", kind: "study", study: "course", note: "Timer on. Clarify, brute force, optimal, code, dry run, complexity. Phone in another room." },
  { id: "dinner", start: "studyBlock1End", end: "studyBlock2Start", label: "Dinner \xB7 rest", kind: "meal", note: "Eat properly, then twenty minutes with no screen. The kitchen closes after this." },
  { id: "block2", start: "studyBlock2Start", end: "studyBlock2End", label: "Study block 2 \u2014 deep", kind: "study", study: "deep", note: "The hardest item of the day goes here, while you are still sharp." },
  { id: "walk", start: "studyBlock2End", end: "walkEnd", label: "Short walk in the society", kind: "walk", note: "No headphones needed. Let the last two hours settle." },
  { id: "block3", start: "walkEnd", end: "studyBlock3End", label: "Final block (optional)", kind: "study", study: "light", when: "block3", note: "Revision and lighter items only. If you are not fresh, sleep instead; tomorrow\u2019s blocks are worth more." },
  { id: "sleep", start: "studyBlock3End", end: "wakeTime", label: "Sleep", kind: "sleep", when: "block3", note: "Screens off. Six hours is the floor on weekdays; the weekend pays it back." },
  { id: "sleep-early", start: "walkEnd", end: "wakeTime", label: "Sleep", kind: "sleep", when: "noblock3", note: "Screens off. A longer night tonight is tomorrow\u2019s better block." }
];
var SATURDAY = [
  { id: "sat-wake", start: "weekendWakeTime", end: "weekendWakeTime+15", label: "Wake slow \xB7 water", kind: "wake", note: "Sleep in a little; five short nights are behind you." },
  { id: "sat-move", start: "weekendWakeTime+15", end: "weekendWakeTime+75", label: "Longer easy run", kind: "move", note: "Slower and longer than a weekday, at a pace where you could still talk." },
  { id: "sat-breakfast", start: "weekendWakeTime+75", end: "weekendWakeTime+120", label: "Shower \xB7 breakfast", kind: "meal", note: "A proper meal before the long block." },
  { id: "sat-a", start: "weekendWakeTime+120", end: "weekendWakeTime+300", label: "Study A \u2014 the week\u2019s hardest set", kind: "study", study: "deep", note: "Three uninterrupted hours, the longest block of your week." },
  { id: "sat-lunch", start: "weekendWakeTime+300", end: "weekendWakeTime+390", label: "Lunch \xB7 rest", kind: "meal", note: "Eat, walk ten minutes, lie down for twenty if you need it." },
  { id: "sat-b", start: "weekendWakeTime+390", end: "weekendWakeTime+570", label: "Study B", kind: "study", study: "course", note: "Mock or timed set if one is due; otherwise the next items in order." },
  { id: "sat-free", start: "weekendWakeTime+570", end: "20:00", label: "Free evening \u2014 ride, friends, rest", kind: "free", note: "Fully earned. No laptop." },
  { id: "sat-dinner", start: "20:00", end: "21:00", label: "Dinner", kind: "meal", note: "Eating out is fine: grilled over fried, no dessert, no cold drinks." },
  { id: "sat-c", start: "21:00", end: "23:00", label: "Study C \u2014 lighter", kind: "study", study: "light", note: "Revision, an LP story said out loud, the mistakes notebook." },
  { id: "sat-walk", start: "23:00", end: "weekendSleepTime", label: "Short walk \xB7 wind down", kind: "walk", note: "Then a full night. This is where the week\u2019s short sleep gets paid back." },
  { id: "sat-sleep", start: "weekendSleepTime", end: "weekendWakeTime", label: "Sleep", kind: "sleep", note: "A full night." }
];
var SUNDAY = [
  { id: "sun-wake", start: "weekendWakeTime", end: "weekendWakeTime+15", label: "Wake slow \xB7 water", kind: "wake", note: "Another full night behind you." },
  { id: "sun-move", start: "weekendWakeTime+15", end: "weekendWakeTime+60", label: "Walk or mobility \u2014 recovery", kind: "move", note: "Legs rest today. A brisk walk and twenty minutes of stretching keep the habit without the load." },
  { id: "sun-breakfast", start: "weekendWakeTime+60", end: "weekendWakeTime+120", label: "Shower \xB7 breakfast", kind: "meal", note: "Unhurried." },
  { id: "sun-a", start: "weekendWakeTime+120", end: "weekendWakeTime+300", label: "Study A \u2014 clear the carry-over", kind: "study", study: "deep", note: "Anything still open from the week goes first, so Monday starts clean." },
  { id: "sun-lunch", start: "weekendWakeTime+300", end: "weekendWakeTime+390", label: "Lunch \xB7 rest", kind: "meal", note: "Home food if you can. Cook extra for Monday." },
  { id: "sun-mock", start: "weekendWakeTime+390", end: "weekendWakeTime+510", label: "Mock or timed set", kind: "study", study: "dsa", note: "Two problems under time, out loud, no hints. Log the solve times." },
  { id: "sun-free", start: "weekendWakeTime+510", end: "19:30", label: "Free time", kind: "free", note: "Back by 19:30 so Sunday night resets the week." },
  { id: "sun-dinner", start: "19:30", end: "20:30", label: "Dinner", kind: "meal", note: "Light and early." },
  { id: "sun-review", start: "20:30", end: "21:15", label: "Weekly review \xB7 plan the week", kind: "study", study: "review", note: "Progress tab. Name one thing that slipped and the one change that fixes it." },
  { id: "sun-light", start: "21:15", end: "22:30", label: "Light block \u2014 preview Monday", kind: "study", study: "light", note: "Skim tomorrow\u2019s first items so Monday\u2019s block starts warm." },
  { id: "sun-prep", start: "22:30", end: "23:00", label: "Prep Monday \u2014 bag, clothes, office snacks", kind: "routine", note: "Pack nuts, fruit or chana so the 4 pm craving already has an answer." },
  { id: "sun-walk", start: "23:00", end: "weekendSleepTime", label: "Short walk \xB7 wind down", kind: "walk", note: "Earlier tonight so Monday morning is not a fight." },
  { id: "sun-sleep", start: "weekendSleepTime", end: "wakeTime", label: "Sleep \u2014 Monday starts at wake-up", kind: "sleep", note: "Screens off." }
];
var ROUTINES = {
  weekday: WEEKDAY,
  saturday: SATURDAY,
  sunday: SUNDAY
};
var DAY_TYPE_LABEL = {
  weekday: "Weekday",
  saturday: "Saturday",
  sunday: "Sunday"
};

// src/engine/schedule.ts
var HHMM2 = /^\d{1,2}:\d{2}$/;
var toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};
var toHHMM = (minutes) => {
  const m = (minutes % 1440 + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
function blockMinutes(start, end) {
  const a = toMinutes(start);
  const b = toMinutes(end);
  if (b === a) return 0;
  if (b > a) return b - a;
  const wrapped = 24 * 60 - a + b;
  return wrapped > 14 * 60 ? 0 : wrapped;
}
function resolveTime(ref, settings) {
  if (HHMM2.test(ref)) return ref;
  const match = /^([A-Za-z0-9]+)([+-]\d+)?$/.exec(ref);
  if (!match) return "00:00";
  const key = match[1];
  const isTime = (v) => typeof v === "string" && HHMM2.test(v);
  const raw = settings[key];
  const fallback = DEFAULT_SETTINGS[key];
  const base = isTime(raw) ? raw : isTime(fallback) ? fallback : "00:00";
  return toHHMM(toMinutes(base) + Number(match[2] ?? 0));
}
function dayTypeOf(iso2) {
  const dow = weekdayOf(iso2);
  return dow === 6 ? "saturday" : dow === 0 ? "sunday" : "weekday";
}
function conditionHolds(when, exercise, block3) {
  switch (when) {
    case void 0:
      return true;
    case "am-run":
      return exercise === "morning";
    case "am-norun":
      return exercise !== "morning";
    case "pm-run":
      return exercise === "evening";
    case "pm-norun":
      return exercise !== "evening";
    case "block3":
      return block3;
    case "noblock3":
      return !block3;
  }
}
function daySlots(settings, dayType, exercise = settings.exerciseSlot) {
  return ROUTINES[dayType].filter((e) => conditionHolds(e.when, exercise, settings.studyBlock3Enabled)).map((e) => {
    const start = resolveTime(e.start, settings);
    const end = resolveTime(e.end, settings);
    const capacity = e.study === "office" ? Math.round(settings.officeStudyHours * 60) : e.study && e.study !== "review" ? blockMinutes(start, end) : 0;
    return { id: e.id, label: e.label, kind: e.kind, study: e.study, start, end, capacity, items: [], used: 0, note: e.note };
  });
}
function studyCapacity(settings, dayType, exercise = settings.exerciseSlot) {
  return daySlots(settings, dayType, exercise).filter((s) => s.capacity > 0 && s.study !== "office").reduce((n, s) => n + s.capacity, 0);
}
var PLACEMENT = {
  amazon: ["course", "deep", "dsa", "light"],
  revision: ["course", "deep", "dsa", "light"],
  course: ["office", "course", "deep", "light"],
  build: ["deep", "course", "light"],
  dsa: ["dsa", "deep", "course"]
};
var MIN_PIECE_MINUTES = 20;
function buildSchedule(settings, items, dayType, exercise = settings.exerciseSlot) {
  const slots = daySlots(settings, dayType, exercise);
  const overflow = [];
  for (const item of items) {
    const order = PLACEMENT[item.kind].flatMap((role) => slots.filter((x) => x.study === role && x.capacity > 0));
    let remaining = item.minutes;
    const pieces = [];
    for (const slot of order) {
      if (remaining <= 0) break;
      const take = Math.min(slot.capacity - slot.used, remaining);
      if (take <= 0 || take < MIN_PIECE_MINUTES && take < remaining) continue;
      pieces.push({ slot, minutes: take });
      slot.used += take;
      remaining -= take;
    }
    const split = pieces.length > 1 || remaining > 0;
    for (const { slot, minutes } of pieces) slot.items.push({ ...item, minutes, totalMinutes: item.minutes, partial: split });
    if (remaining > 0) overflow.push({ ...item, minutes: remaining, totalMinutes: item.minutes, partial: true });
  }
  const study = slots.filter((x) => x.capacity > 0);
  return {
    dayType,
    slots,
    totalPlanned: study.reduce((n, x) => n + x.used, 0),
    totalCapacity: study.reduce((n, x) => n + x.capacity, 0),
    overflow
  };
}
function formatHM(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
function weekdaySleepHours(settings) {
  const end = settings.studyBlock3Enabled ? settings.studyBlock3End : settings.walkEnd;
  return Math.round(blockMinutes(end, settings.wakeTime) / 60 * 10) / 10;
}

// src/data/fitness.ts
var WARM_UP = {
  id: "warm",
  label: "Warm-up",
  minutes: 5,
  detail: "Brisk walk 2 min, then leg swings, hip circles, ankle rolls, 10 bodyweight squats."
};
var COOL_DOWN = {
  id: "cool",
  label: "Cool-down",
  minutes: 5,
  detail: "Walk 2 min, then 30 s each: calves, hamstrings, quads, hip flexors."
};
var STRENGTH = {
  id: "strength",
  label: "Strength set",
  minutes: 12,
  detail: "Squats 2\xD712 \xB7 push-ups 2\xD78 (incline if needed) \xB7 glute bridge 2\xD712 \xB7 plank 2\xD730 s \xB7 dead bug 2\xD710."
};
var CORE_SHORT = {
  id: "core",
  label: "Core",
  minutes: 8,
  detail: "Plank 3\xD730 s \xB7 side plank 2\xD720 s each \xB7 crunches 2\xD715 \xB7 bird dog 2\xD710."
};
var SESSIONS = [
  {
    id: "run-core",
    name: "Run + strength",
    kind: "run",
    minutes: 47,
    parts: [
      WARM_UP,
      { id: "run", label: "Easy run", minutes: 25, detail: "Conversational pace. New to running? Run 3 min, walk 1 min, six times." },
      COOL_DOWN,
      STRENGTH
    ],
    note: "Add 5 minutes to the run each week until it reaches 40. Never more than a 10% jump in a week."
  },
  {
    id: "run-easy",
    name: "Easy run + mobility",
    kind: "run",
    minutes: 38,
    parts: [
      WARM_UP,
      { id: "run", label: "Easy run or run-walk", minutes: 20, detail: "Shorter and lighter than yesterday. Legs heavy? Walk briskly instead." },
      COOL_DOWN,
      { id: "mobility", label: "Mobility", minutes: 8, detail: "Hip flexor stretch, couch stretch, calf wall stretch, thoracic rotations." }
    ],
    note: "The easy day is what lets the hard days happen. Do not turn it into a race."
  },
  {
    id: "long-run",
    name: "Long easy run",
    kind: "run",
    minutes: 60,
    parts: [
      WARM_UP,
      { id: "run", label: "Long run", minutes: 40, detail: "Slower than a weekday run. Could you talk in full sentences? That is the pace." },
      { id: "cool", label: "Cool-down", minutes: 7, detail: "Walk 3 min, then the same four stretches, 40 s each." },
      CORE_SHORT
    ],
    note: "Fuel first: a banana or two dates before you leave. Water after, not during, for runs under an hour."
  },
  {
    id: "recovery",
    name: "Recovery walk + stretch",
    kind: "walk",
    minutes: 35,
    parts: [
      { id: "walk", label: "Brisk walk", minutes: 25, detail: "Outside, daylight, no agenda." },
      { id: "stretch", label: "Full stretch", minutes: 10, detail: "Every stretch from the week, held a little longer." }
    ],
    note: "Rest is part of the plan. Sleep in, and let Monday\u2019s run feel fresh."
  }
];
var WEEKLY_SESSION = {
  0: "recovery",
  1: "run-core",
  2: "run-easy",
  3: "run-core",
  4: "run-easy",
  5: "run-core",
  6: "long-run"
};
var FAT_LOSS_NOTE = "Core work strengthens the muscles under the belly; it does not burn the fat on top of it. Fat comes off everywhere at once when you stay in a modest calorie deficit for weeks: the runs, the walk, enough sleep and not eating during the night block do more than any abdominal exercise.";
function sessionById(id) {
  return SESSIONS.find((s) => s.id === id);
}

// src/engine/fitness.ts
function exerciseSlotFor(state, date) {
  const dow = weekdayOf(date);
  if (dow === 0 || dow === 6) return state.exerciseOverrides[date] === "rest" ? "rest" : "morning";
  return state.exerciseOverrides[date] ?? state.settings.exerciseSlot;
}
function sessionFor(state, date = todayISO()) {
  const slot = exerciseSlotFor(state, date);
  const id = WEEKLY_SESSION[weekdayOf(date)] ?? "run-easy";
  const session = sessionById(id) ?? SESSIONS[0];
  const logged = state.runs.find((r) => r.date === date && r.kind !== "rest") ?? null;
  return { date, session, slot, logged, done: Boolean(logged) };
}
function fitnessWeek(state, today = todayISO()) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, -6 + i)).map((date) => ({
    date,
    logged: state.runs.find((r) => r.date === date && r.kind !== "rest") ?? null,
    planned: sessionById(WEEKLY_SESSION[weekdayOf(date)] ?? "run-easy") ?? SESSIONS[0]
  }));
  const logs = days.map((d) => d.logged).filter((l) => Boolean(l));
  return {
    days,
    sessions: logs.length,
    minutes: logs.reduce((n, l) => n + l.minutes, 0),
    km: Math.round(logs.reduce((n, l) => n + (l.km ?? 0), 0) * 10) / 10
  };
}
function fitnessStreak(state, today = todayISO()) {
  const dates = new Set(state.runs.filter((r) => r.kind !== "rest").map((r) => r.date));
  let streak = 0;
  let cursor = dates.has(today) ? today : addDays(today, -1);
  while (dates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

// src/engine/amazon-plan.ts
var TIERS = ["P0", "P1", "P2", "P3"];
var BREATHING_ROOM = 0.85;
var MAX_REVISIONS = 3;
var INTERVIEW_MODE_DAYS = 10;
var tierRank = (t) => TIERS.indexOf(t);
function tierList(xs) {
  if (xs.length <= 1) return xs.join("");
  return `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}
function reasonFor(item, tier) {
  if (item.asked === 1) return `${tier} \xB7 asked in ${item.src.length} report${item.src.length === 1 ? "" : "s"}`;
  if (item.type === "task") return `${tier} \xB7 ${item.kind} work from the tracker`;
  if (item.f3 && item.f3 >= 60) return `${tier} \xB7 Amazon frequency ${Math.round(item.f3)}`;
  if (item.asked === 2) return `${tier} \xB7 asked in 2022`;
  if (item.phase === 2) return `${tier} \xB7 core pattern`;
  if (item.phase === 1) return `${tier} \xB7 basics${tier === "P3" ? ", topic marked solid" : ""}`;
  return `${tier} \xB7 ${item.slot === "night" ? "night-block extra" : "curriculum"}`;
}
function dailyBudget(state, date) {
  const capacity = studyCapacity(state.settings, dayTypeOf(date), exerciseSlotFor(state, date));
  return Math.round(capacity * BREATHING_ROOM);
}
function buildAmazonDay(state, date = todayISO()) {
  const info = programInfo(state, date);
  const done = state.amazon.items;
  const solid = solidDays(state.amazon.solidTopics);
  const capacity = studyCapacity(state.settings, dayTypeOf(date), exerciseSlotFor(state, date));
  const budget = Math.round(capacity * BREATHING_ROOM);
  const interview = state.amazon.interviewDate ?? null;
  const daysToInterview = interview ? daysBetween(date, interview) : null;
  const interviewMode = daysToInterview !== null && daysToInterview >= 0 && daysToInterview <= INTERVIEW_MODE_DAYS;
  const pool = AMAZON_ITEMS.filter((i) => !done[i.key]).map((item) => ({
    item,
    tier: effectiveTier(item, solid)
  }));
  if (interviewMode) {
    pool.sort(
      (a, b) => b.item.phase - a.item.phase || a.item.day - b.item.day || (a.item.slot === b.item.slot ? 0 : a.item.slot === "core" ? -1 : 1) || a.item.index - b.item.index
    );
  }
  const baseEnd = info.amazon.overrun ? addDays(date, 6) : info.amazon.endsOn;
  const beforeInterview = interview && daysToInterview !== null && daysToInterview >= 1 ? addDays(interview, -1) : null;
  const windowEnd = beforeInterview && beforeInterview < baseEnd ? beforeInterview : baseEnd;
  const daysLeft = Math.max(1, daysBetween(date, windowEnd) + 1);
  let capacityLeft = 0;
  for (let i = 0; i < daysLeft; i += 1) capacityLeft += dailyBudget(state, addDays(date, i));
  const remainingByTier = { P0: 0, P1: 0, P2: 0, P3: 0 };
  for (const p of pool) remainingByTier[p.tier] += p.item.minutes;
  const fits = [];
  let cumulative = 0;
  for (const t of TIERS) {
    cumulative += remainingByTier[t];
    if (t === "P0" || cumulative <= capacityLeft) fits.push(t);
    else break;
  }
  const tierFloor = fits[fits.length - 1] ?? "P0";
  const neededMinutes = fits.reduce((n, t) => n + remainingByTier[t], 0);
  const hoursPerDayNeeded = Math.round(neededMinutes / daysLeft / 60 * 10) / 10;
  const shed = TIERS.filter((t) => !fits.includes(t));
  const hoursLeft = Math.round(capacityLeft / 60);
  const pace = {
    remainingByTier,
    capacityLeft,
    daysLeft,
    fits,
    hoursPerDayNeeded,
    note: remainingByTier.P0 > capacityLeft ? `The must-do set alone needs ${Math.round(remainingByTier.P0 / 60)}h and ${hoursLeft}h are left in the window. Extend the window or accept that some asked problems will be skipped.` : shed.length === 0 ? "Everything fits. Work in curriculum order; nothing is being shed." : `${tierList(fits)} ${fits.length === 1 ? "fits" : "fit"} in the ${hoursLeft}h left. ${tierList(shed)} ${shed.length === 1 ? "stays" : "stay"} visible as optional and ${shed.length === 1 ? "is" : "are"} added when you run ahead.`
  };
  if (daysToInterview === 0) {
    return {
      date,
      mode: "interview-day",
      capacity,
      budget,
      planned: [],
      plannedIds: [],
      totalMinutes: 0,
      tierFloor,
      pace,
      focus: "Interview day",
      nextUp: [],
      daysToInterview
    };
  }
  const planned = [];
  let used = 0;
  for (const item of revisionsDue(state, date).slice(0, MAX_REVISIONS)) {
    const log = done[item.key];
    const minutes = Math.max(15, Math.round(item.minutes * 0.6));
    planned.push({
      id: `rev:${item.key}`,
      item,
      minutes,
      revision: true,
      tier: "P0",
      reason: `Revision due \xB7 ${log?.outcome === "hint" ? "needed a hint" : log?.outcome === "reviewed" ? "read the solution" : "keep it warm"} on ${log?.doneOn ?? date}`
    });
    used += minutes;
  }
  for (const p of pool) {
    if (tierRank(p.tier) > tierRank(tierFloor)) continue;
    const fitsToday = used + p.item.minutes <= budget;
    const nothingYet = planned.every((x) => x.revision);
    if (!fitsToday && !nothingYet) break;
    planned.push({ id: p.item.key, item: p.item, minutes: p.item.minutes, revision: false, tier: p.tier, reason: reasonFor(p.item, p.tier) });
    used += p.item.minutes;
    if (used >= budget) break;
  }
  if (used < budget / 2) {
    const taken = new Set(planned.map((x) => x.item.key));
    for (const p of pool) {
      if (tierRank(p.tier) <= tierRank(tierFloor) || taken.has(p.item.key)) continue;
      if (used + p.item.minutes > budget) continue;
      planned.push({ id: p.item.key, item: p.item, minutes: p.item.minutes, revision: false, tier: p.tier, reason: `${p.tier} \xB7 below the floor, added because you are ahead` });
      taken.add(p.item.key);
      used += p.item.minutes;
    }
  }
  const plannedKeys = new Set(planned.map((x) => x.item.key));
  const aboveFloor = pool.filter((p) => tierRank(p.tier) <= tierRank(tierFloor) && !plannedKeys.has(p.item.key));
  const nextUp = (aboveFloor.length ? aboveFloor : pool.filter((p) => !plannedKeys.has(p.item.key))).slice(0, 3).map((p) => p.item);
  const lead = planned.find((x) => !x.revision)?.item ?? planned[0]?.item;
  const focus = pool.length === 0 ? "Curriculum complete" : lead ? `Day ${lead.day} \xB7 ${lead.topic}` : "Revision";
  return {
    date,
    mode: pool.length === 0 ? "done" : interviewMode ? "interview" : "curriculum",
    capacity,
    budget,
    planned,
    plannedIds: planned.map((x) => x.id),
    totalMinutes: used,
    tierFloor,
    pace,
    focus,
    nextUp,
    daysToInterview
  };
}

// src/engine/amazon-stats.ts
var count = (ids, done) => ({
  done: ids.filter((id) => done[id]).length,
  total: ids.length
});
function slugOutcome(state, slug) {
  const keys = AMAZON_ITEMS.filter((i) => i.slug === slug).map((i) => i.key);
  const outcomes = keys.map((k) => state.amazon.items[k]?.outcome).filter(Boolean);
  if (outcomes.length === 0) return null;
  if (outcomes.includes("independent")) return "independent";
  if (outcomes.includes("hint")) return "hint";
  return "reviewed";
}
function amazonSummary(state, today = todayISO()) {
  const done = state.amazon.items;
  const solid = solidDays(state.amazon.solidTopics);
  const outcomes = AMAZON_PROBLEM_SLUGS.map((s) => slugOutcome(state, s));
  const askedOutcomes = AMAZON_ASKED_SLUGS.map((s) => slugOutcome(state, s));
  const logs = Object.values(done);
  const passed = logs.filter((l) => l.revisits > 0 && l.outcome === "independent").length;
  const scheduled = logs.filter((l) => l.revisitOn && l.revisitOn > today).length;
  const byPhase = [1, 2, 3].map((phase) => {
    const items = AMAZON_ITEMS.filter((i) => i.phase === phase);
    const finished = items.filter((i) => done[i.key]);
    return {
      phase,
      done: finished.length,
      total: items.length,
      minutesDone: finished.reduce((n, i) => n + i.minutes, 0),
      minutesTotal: items.reduce((n, i) => n + i.minutes, 0)
    };
  });
  const byDay = AMAZON_DAYS.map((d) => {
    const items = AMAZON_ITEMS.filter((i) => i.day === d.n);
    const finished = items.filter((i) => done[i.key]).length;
    return { n: d.n, done: finished, total: items.length, pct: items.length ? Math.round(finished / items.length * 100) : 0 };
  });
  const dates = new Set(logs.map((l) => l.doneOn));
  for (const [date, log] of Object.entries(state.days)) {
    if (log.completed.some((id) => id.startsWith("rev:"))) dates.add(date);
  }
  let streak = 0;
  let cursor = dates.has(today) ? today : addDays(today, -1);
  while (dates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  const weak = /* @__PURE__ */ new Map();
  for (const i of AMAZON_ITEMS) {
    const o = done[i.key]?.outcome;
    if (o === "hint" || o === "reviewed") weak.set(i.topic, (weak.get(i.topic) ?? 0) + 1);
  }
  const weakTopics = [...weak.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).map(([t]) => t);
  const mockKeys = AMAZON_ITEMS.filter((i) => i.kind === "Mock").map((i) => i.key);
  const learnKeys = AMAZON_ITEMS.filter((i) => i.kind === "Learn").map((i) => i.key);
  const freqDone = AMAZON_FREQ.filter(
    (r) => r.keys ? r.keys.some((k) => done[k]) : r.xkey ? Boolean(state.amazon.extras[r.xkey]) : false
  ).length;
  const counted = AMAZON_ITEMS.filter((i) => effectiveTier(i, solid) !== "P3");
  const minutesTotal = counted.reduce((n, i) => n + i.minutes, 0);
  const minutesDone = counted.filter((i) => done[i.key]).reduce((n, i) => n + i.minutes, 0);
  return {
    problems: {
      total: AMAZON_PROBLEM_SLUGS.length,
      logged: outcomes.filter(Boolean).length,
      independent: outcomes.filter((o) => o === "independent").length,
      hint: outcomes.filter((o) => o === "hint").length,
      reviewed: outcomes.filter((o) => o === "reviewed").length
    },
    asked: {
      total: AMAZON_ASKED_SLUGS.length,
      logged: askedOutcomes.filter(Boolean).length,
      independent: askedOutcomes.filter((o) => o === "independent").length
    },
    revisions: { due: revisionsDue(state, today).length, passed, scheduled },
    lp: count(AMAZON_LP.map((x) => x.id), done),
    resume: count(AMAZON_RESUME.map((x) => x.id), done),
    genai: count(AMAZON_GENAI.map((x) => x.id), done),
    dayof: count(AMAZON_DAYOF.map((x) => x.id), done),
    mocks: count(mockKeys, done),
    learn: count(learnKeys, done),
    freq: { done: freqDone, total: AMAZON_FREQ.length },
    items: { done: AMAZON_ITEMS.filter((i) => done[i.key]).length, total: AMAZON_ITEMS.length },
    minutes: { done: minutesDone, total: minutesTotal },
    byPhase,
    byDay,
    todayCount: logs.filter((l) => l.doneOn === today).length + revisitsOn(state, today),
    streak,
    weakTopics
  };
}
function revisitsOn(state, date) {
  return (state.days[date]?.completed ?? []).filter((id) => id.startsWith("rev:")).length;
}
function amazonLoggedOn(state, date) {
  return Object.entries(state.amazon.items).filter(([, l]) => l.doneOn === date).map(([k]) => AMAZON_ITEMS.find((i) => i.key === k)).filter((i) => Boolean(i));
}

// src/data/quotes.ts
var QUOTES = [
  { line: "Day 2 is stasis. Followed by irrelevance. Followed by excruciating, painful decline. Followed by death. And that is why it is always Day 1.", by: "Jeff Bezos", source: "2016 letter to Amazon shareholders" },
  { line: "Nobody is watching the 18:00 block. That is exactly why it counts." },
  { line: "At dawn, when you have trouble getting out of bed, tell yourself: I have to go to work, as a human being.", by: "Marcus Aurelius", source: "Meditations, Book 5 (Hays translation)" },
  { line: "A problem you solved with the solution open is a problem you have read. Close the tab and do it again." },
  { line: "The first principle is that you must not fool yourself, and you are the easiest person to fool.", by: "Richard Feynman", source: "Caltech commencement address, 1974" },
  { line: "Three problems a night, five nights a week, is sixty problems a month. The interview is lost or won in that arithmetic." },
  { line: "You do not rise to the level of your goals. You fall to the level of your systems.", by: "James Clear", source: "Atomic Habits, 2018" },
  { line: "Run before the day can argue with you." },
  { line: "No great thing is created suddenly, any more than a bunch of grapes or a fig.", by: "Epictetus", source: "Discourses, Book 1, ch. 15" },
  { line: "The interviewer is not looking for the fastest typist. They are looking for someone they would want on call with them at 2 am." },
  { line: "Simple can be harder than complex: you have to work hard to get your thinking clean to make it simple.", by: "Steve Jobs", source: "BusinessWeek interview, 1998" },
  { line: "Brute force first. Say it out loud. Then make it better. That order is the whole method." },
  { line: "It is not that we have a short time to live, but that we waste a lot of it.", by: "Seneca", source: "On the Shortness of Life, ch. 1" },
  { line: "The night block is where the people who get the offer are, while everyone else is watching something." },
  { line: "Clarity about what matters provides clarity about what does not.", by: "Cal Newport", source: "Deep Work, 2016" },
  { line: "You already passed the assessment once. The loop is the same work with someone watching. Practise with someone watching." },
  { line: "Tired is not the same as done. Done is a logged outcome." },
  { line: 'Your STAR stories are already true. The work is saying them in two minutes without the word "we".' },
  { line: "Every pattern you skip now is forty minutes of silence in a room with a stranger later." },
  { line: "The walk at 23:00 is part of the plan, not a break from it." },
  { line: "One honest line in the mistakes notebook is worth more than another video." },
  { line: "The Bar Raiser will ask how you knew it would work. Have the number ready." },
  { line: "Consistency is boring from the inside. That is what it looks like when it is working." },
  { line: "Sleep is study. Memory consolidates while you are out; the 01:00 cut-off is there for a reason." },
  { line: "The person who gets the offer is not smarter than you. They finished the boring middle part." },
  { line: "Explain it to the wall before you explain it to the interviewer." },
  { line: "A weak topic is just an unvisited one. Visit it today." },
  { line: "Two weeks of this and the asked problems stop looking like a list and start looking like a set of six ideas." },
  { line: "The call can come any day. The only preparation that counts is the kind that is already done." },
  { line: "Ten minutes of warm-up, then the run decides itself." },
  { line: "You are not behind. You are at Day N, and Day N has a plan." },
  { line: "Write the brute force even when you see the trick. Interviewers want to see the road, not just the destination." },
  { line: "Do the hard problem at 21:00, not at 00:30. Energy is a resource; spend it where it buys the most." },
  { line: "The best mock is the one that went badly on a Saturday instead of a Tuesday with an offer on the line." }
];
function quoteForDay(n) {
  const i = (n % QUOTES.length + QUOTES.length) % QUOTES.length;
  return QUOTES[i] ?? QUOTES[0];
}
var EVENING_LINES = {
  strong: [
    "That is a day that moves the needle. Same thing tomorrow, nothing clever.",
    "You did what you said you would do this morning. That sentence is rarer than it sounds."
  ],
  partial: [
    "Not everything, but the direction was right. Carry the open item and start with it.",
    "Most days look like this one. The plan survives as long as two of these do not become five."
  ],
  empty: [
    "Nothing logged yet. Start with the smallest item on the list, not the biggest.",
    "The office took the day. The evening is yours; take it back one block at a time."
  ]
};

// src/engine/mission.ts
var SHAPE = [
  { id: "m1", label: "P1", title: "Foundation Gate", share: 0.26, focus: "FINISH WHAT YOU ALREADY STARTED", description: "Close out the courses already in flight \u2014 Apna College Prime AI/ML, the Five Minute Engineering core, PPA/C/C++, LSP and DSA basics. Nothing new gets added. Each subject is proven by an implementation, not a completion percentage." },
  { id: "m2", label: "P2", title: "SDE Fundamentals + AI Engineering", share: 0.3, focus: "DEPTH OVER COVERAGE", description: "DSA moves to daily patterns. OS, networking and DBMS get formal treatment. Docker, Kubernetes, Jenkins and CI/CD build on the pipelines you already own. The first real AI engineering work starts: embeddings, retrieval, evaluation." },
  { id: "m3", label: "P3", title: "Interview-Level Preparation", share: 0.26, focus: "MEDIUM-HEAVY DSA \xB7 LLD \xB7 SYSTEM DESIGN \xB7 SHIP A PROJECT", description: "DSA shifts medium-heavy with timed sets. Low-level and system design become a daily thread. The flagship project reaches a deployed, defensible state." },
  { id: "m4", label: "P4", title: "Interview Execution", share: 0.18, focus: "APPLY \xB7 MOCK \xB7 NEGOTIATE", description: "Company-specific preparation, mock interviews, behavioural stories, resume and portfolio polish, and applications going out in waves." }
];
function missionPhases() {
  const total = missionTotalDays();
  let start = 1;
  return SHAPE.map((s, i) => {
    const length = i === SHAPE.length - 1 ? total - start + 1 : Math.max(7, Math.round(total * s.share));
    const phase = {
      id: s.id,
      label: s.label,
      title: s.title,
      startDay: start,
      endDay: Math.min(total, start + length - 1),
      focus: s.focus,
      description: s.description
    };
    start = phase.endDay + 1;
    return phase;
  });
}
function phaseForDay(n) {
  const day = clampDay(n);
  const phases = missionPhases();
  return phases.find((p) => day >= p.startDay && day <= p.endDay) ?? phases[0];
}
function dayContext(n) {
  const day = clampDay(n);
  const date = dateForDay(day);
  const phase = phaseForDay(day);
  return {
    day,
    date,
    week: weekOfDay(day),
    phase,
    dayInPhase: day - phase.startDay + 1,
    isSunday: isSunday(date),
    isReviewDay: isSunday(date),
    daysLeft: Math.max(0, missionTotalDays() - day)
  };
}

// src/data/foundation/apna.ts
var part = (n, title, minutes = 90) => ({
  id: `ap-${String(n).padStart(2, "0")}`,
  title: `${title} (${n})`,
  mandatory: true,
  estMinutes: minutes
});
var APNA_SUBJECTS = [
  {
    id: "ap-python",
    tier: 1,
    name: "Python",
    source: "Apna Prime \xB7 modules 3\u20139",
    track: "backend",
    blurb: "You write Python professionally \u2014 run these fast and spend the saved time on the gaps.",
    milestones: [
      { ...part(3, "Course Introduction", 30), proof: "watch" },
      { ...part(4, "Python Fundamentals Part 1"), proof: "watch" },
      { ...part(5, "Python Fundamentals Part 2"), proof: "watch" },
      { ...part(6, "Python Fundamentals Part 3"), proof: "watch" },
      { ...part(7, "Python Fundamentals Part 4"), proof: "watch" },
      { ...part(8, "Python Fundamentals Part 5"), proof: "watch" },
      { ...part(9, "Installation", 30), proof: "watch" }
    ]
  },
  {
    id: "ap-data",
    tier: 1,
    name: "Data \u2014 NumPy, Pandas, SQL, Visualisation",
    source: "Apna Prime \xB7 modules 10\u201321",
    track: "ai",
    blurb: "The layer every model sits on. SQL here is separately interview-critical.",
    milestones: [
      { ...part(10, "Phase 2: Data", 30), proof: "watch" },
      { ...part(11, "NumPy (Numerical Python)"), proof: "implement" },
      { ...part(12, "Pandas Part 1"), proof: "implement" },
      { ...part(13, "Pandas Part 2"), proof: "implement" },
      { ...part(14, "Data Collection"), proof: "implement" },
      { ...part(15, "SQL Part 1"), proof: "exercise" },
      { ...part(16, "SQL Part 2"), proof: "exercise" },
      { ...part(17, "Data Collection (continuation)", 60), proof: "implement" },
      { ...part(19, "Web Scraping (Activity)"), proof: "implement" },
      { ...part(20, "Data Visualization Part 1"), proof: "implement" },
      { ...part(21, "Data Visualization Part 2"), proof: "implement" }
    ]
  },
  {
    id: "ap-math",
    tier: 1,
    name: "Math for AI",
    source: "Apna Prime \xB7 modules 22\u201324",
    track: "ai",
    blurb: "Enough probability, linear algebra and calculus that backprop and attention read as mechanics.",
    milestones: [
      { ...part(22, "Math for AI \u2014 Probability"), proof: "notes" },
      { ...part(23, "Math for AI \u2014 Linear Algebra"), proof: "notes" },
      { ...part(24, "Math for AI \u2014 Calculus"), proof: "notes" }
    ]
  },
  {
    id: "ap-ml",
    tier: 1,
    name: "Machine Learning",
    source: "Apna Prime \xB7 modules 25\u201336",
    track: "ai",
    blurb: "Supervised and unsupervised, including both minor projects \u2014 those are your first portfolio pieces.",
    milestones: [
      { ...part(25, "Starting with Machine Learning", 60), proof: "watch" },
      { ...part(26, "Supervised ML Part 1"), proof: "implement" },
      { ...part(27, "Supervised ML Part 2"), proof: "implement" },
      { ...part(28, "Supervised ML Part 3"), proof: "implement" },
      { ...part(29, "Scratch Implementations", 120), proof: "implement" },
      { ...part(30, "CreditWise Loan System \u2014 minor project", 180), proof: "project" },
      { ...part(31, "Supervised ML Part 4"), proof: "implement" },
      { ...part(32, "Supervised ML Part 5"), proof: "implement" },
      { ...part(33, "Supervised ML Part 6"), proof: "implement" },
      { ...part(34, "Unsupervised ML Part 1"), proof: "implement" },
      { ...part(35, "Unsupervised ML Part 2"), proof: "implement" },
      { ...part(36, "SmartCart Clustering System \u2014 minor project", 180), proof: "project" }
    ]
  },
  {
    id: "ap-tools",
    tier: 1,
    name: "Terminal & Git",
    source: "Apna Prime \xB7 modules 37\u201338",
    track: "devops",
    blurb: "Mostly familiar ground. Quick to clear.",
    milestones: [
      { ...part(37, "Terminal", 60), proof: "watch" },
      { ...part(38, "Git & GitHub"), proof: "implement" }
    ]
  },
  {
    id: "ap-dl",
    tier: 1,
    name: "Deep Learning",
    source: "Apna Prime \xB7 modules 39\u201355, 60",
    track: "ai",
    blurb: "The largest block in the course. Reinforcement learning is optional \u2014 low relevance for LLM roles.",
    milestones: [
      { ...part(39, "Deep Learning Part 1"), proof: "watch" },
      { ...part(40, "Deep Learning Part 2"), proof: "watch" },
      { ...part(41, "Deep Learning Part 3"), proof: "implement" },
      { ...part(42, "Deep Learning Part 4"), proof: "implement" },
      { ...part(43, "Deep Learning Part 5"), proof: "implement" },
      { ...part(44, "Deep Learning Part 6"), proof: "implement" },
      { ...part(45, "Reinforcement Learning Part 1"), proof: "watch", mandatory: false },
      { ...part(46, "Reinforcement Learning Part 2"), proof: "watch", mandatory: false },
      { ...part(47, "Reinforcement Learning Part 3"), proof: "watch", mandatory: false },
      { ...part(49, "Deep Learning Part 7"), proof: "implement" },
      { ...part(50, "Deep Learning Part 8"), proof: "implement" },
      { ...part(51, "Text Summarizer \u2014 minor project", 180), proof: "project" },
      { ...part(54, "Deep Learning Part 9"), proof: "implement" },
      { ...part(55, "Deep Learning Part 10"), proof: "implement" },
      { ...part(60, "Deep Learning Part 11"), proof: "implement" }
    ]
  },
  {
    id: "ap-apps",
    tier: 1,
    name: "OpenAI APIs, Flask & Agentic AI",
    source: "Apna Prime \xB7 modules 56, 59, 61",
    track: "ai",
    blurb: "Where a model stops being a notebook and gets a URL. Reuses your Flask background directly.",
    milestones: [
      { ...part(56, "OpenAI APIs", 120), proof: "implement" },
      { ...part(59, "Working with Flask", 120), proof: "implement" },
      { ...part(61, "Agentic AI", 150), proof: "implement" }
    ]
  },
  {
    id: "ap-projects",
    tier: 1,
    name: "AI Projects Module",
    source: "Apna Prime \xB7 AI Projects Module",
    track: "project",
    blurb: "Four two-phase builds. These are the most portfolio-ready work in the whole course \u2014 finish them properly.",
    milestones: [
      { id: "ap-p1a", title: "Intelligent AI Attendance \u2014 Face & Voice (Phase 1)", proof: "project", mandatory: true, estMinutes: 150 },
      { id: "ap-p1b", title: "Intelligent AI Attendance (Phase 2)", proof: "project", mandatory: true, estMinutes: 150 },
      { id: "ap-p2a", title: "Neural Style Transfer with AdaIN (Phase 1)", proof: "project", mandatory: true, estMinutes: 150 },
      { id: "ap-p2b", title: "Neural Style Transfer with AdaIN (Phase 2)", proof: "project", mandatory: true, estMinutes: 150 },
      { id: "ap-p3a", title: "Real-time AI Gym Trainer (Phase 1)", proof: "project", mandatory: true, estMinutes: 150 },
      { id: "ap-p3b", title: "Real-time AI Gym Trainer (Phase 2)", proof: "project", mandatory: true, estMinutes: 150 },
      { id: "ap-p4a", title: "AI Resume ATS System (Phase 1)", proof: "project", mandatory: true, estMinutes: 150 },
      { id: "ap-p4b", title: "AI Resume ATS System (Phase 2)", proof: "project", mandatory: true, estMinutes: 150 },
      { id: "ap-cicd", title: "CI/CD \u2014 Complete Tutorial", proof: "watch", mandatory: false, estMinutes: 120 },
      { id: "ap-k8s", title: "Kubernetes", proof: "watch", mandatory: false, estMinutes: 120 }
    ]
  }
];

// src/data/foundation/fiveme.ts
var FIVEME_SUBJECTS = [
  {
    id: "fm-nlp",
    tier: 2,
    name: "Natural Language Processing",
    source: "5ME \xB7 NLP",
    track: "ai",
    blurb: "The groundwork under every LLM: how text becomes tokens and vectors.",
    milestones: [
      { id: "fm-nlp-1", title: "NLP intro, NLTK/spaCy, core concepts, regex, text preprocessing", proof: "notes", mandatory: true, estMinutes: 120 },
      { id: "fm-nlp-2", title: "Tokenization (BPE, WordPiece), stemming vs lemmatization, POS, NER", proof: "implement", mandatory: true, estMinutes: 120 },
      { id: "fm-nlp-3", title: "Bag of Words, TF-IDF, Word2Vec, similarity metrics", proof: "implement", mandatory: true, estMinutes: 150 },
      { id: "fm-nlp-4", title: "Topic modelling, classical text classifiers, BLEU/ROUGE, deployment", proof: "watch", mandatory: false, estMinutes: 150 }
    ]
  },
  {
    id: "fm-transformers",
    tier: 2,
    name: "Transformers",
    source: "5ME \xB7 Transformers",
    track: "ai",
    blurb: "Goes much deeper than Apna \u2014 through the actual paper, ending with a Nano LLM you build yourself.",
    milestones: [
      { id: "fm-tf-1", title: "History \u2014 RNN/LSTM, Seq2Seq, BERT, GPT, instruction tuning", proof: "notes", mandatory: true, estMinutes: 120 },
      { id: "fm-tf-2", title: '"Attention Is All You Need" \u2014 encoder/decoder, BERT vs GPT vs T5', proof: "notes", mandatory: true, estMinutes: 150 },
      { id: "fm-tf-3", title: "Attention mechanism \u2014 Q/K/V, self-attention, multi-head, masked", proof: "notes", mandatory: true, estMinutes: 150 },
      { id: "fm-tf-4", title: "Build a Nano LLM \u2014 tokenizer, transformer blocks in PyTorch, training loop", proof: "project", mandatory: true, estMinutes: 240 }
    ]
  },
  {
    id: "fm-prompt",
    tier: 2,
    name: "Prompt Engineering",
    source: "5ME \xB7 Prompt Engineering",
    track: "ai",
    blurb: "Treated as an engineering discipline \u2014 versioned, evaluated \u2014 rather than a bag of tricks.",
    milestones: [
      { id: "fm-pe-1", title: "Prompt anatomy, system/user/assistant roles, core principles", proof: "notes", mandatory: true, estMinutes: 120 },
      { id: "fm-pe-2", title: "Zero/one/few-shot, role and persona, task and constraint prompting, output control", proof: "implement", mandatory: true, estMinutes: 150 },
      { id: "fm-pe-3", title: "CoT, self-consistency, ToT, ReAct, prompt chaining, templates, evaluating prompts", proof: "implement", mandatory: true, estMinutes: 150 }
    ]
  },
  {
    id: "fm-rag",
    tier: 2,
    name: "RAG \u2014 VectorDB & LlamaIndex",
    source: "5ME \xB7 VectorDB",
    track: "ai",
    blurb: "You have RAG exposure already. The bar here is measured retrieval quality, not another demo.",
    milestones: [
      { id: "fm-vdb-1", title: "Vectors, embedding models, similarity metrics, RDBMS vs VectorDB", proof: "notes", mandatory: true, estMinutes: 120 },
      { id: "fm-vdb-2", title: "ChromaDB and FAISS hands-on \u2014 index, persist, query your own PDFs", proof: "implement", mandatory: true, estMinutes: 150 },
      { id: "fm-vdb-3", title: "Pinecone and LlamaIndex \u2014 indexes, query engines, chunk size and overlap", proof: "implement", mandatory: true, estMinutes: 150 },
      { id: "fm-vdb-4", title: "RAG \u2014 chunking, advanced RAG, reranking, faithfulness and context recall", proof: "project", mandatory: true, estMinutes: 180 }
    ]
  },
  {
    id: "fm-langchain",
    tier: 2,
    name: "LangChain",
    source: "5ME \xB7 LangChain",
    track: "ai",
    blurb: "Enough to read and use it confidently \u2014 and to know when a direct API call is the better choice.",
    milestones: [
      { id: "fm-lc-1", title: "Setup, architecture, LLM vs chat models, output parsers", proof: "implement", mandatory: true, estMinutes: 120 },
      { id: "fm-lc-2", title: "Chains and memory types", proof: "implement", mandatory: true, estMinutes: 150 },
      { id: "fm-lc-3", title: "Loaders, splitters, embeddings, vector stores, retrievers, a basic RAG pipeline", proof: "project", mandatory: true, estMinutes: 180 },
      { id: "fm-lc-4", title: "Agents, tools and LCEL", proof: "implement", mandatory: true, estMinutes: 150 }
    ]
  },
  {
    id: "fm-agents",
    tier: 2,
    name: "Agentic AI",
    source: "5ME \xB7 Agentic AI",
    track: "ai",
    blurb: "The most job-relevant module in the bootcamp. Ends at multi-agent systems and MCP.",
    milestones: [
      { id: "fm-ag-1", title: "Landscape, agent types, perception, reasoning, ReAct, planning", proof: "notes", mandatory: true, estMinutes: 150 },
      { id: "fm-ag-2", title: "Tool use, prompting for agents, memory, RAG for agents", proof: "implement", mandatory: true, estMinutes: 150 },
      { id: "fm-ag-3", title: "File, code-execution and data-analysis agents", proof: "implement", mandatory: true, estMinutes: 150 },
      { id: "fm-ag-4", title: "Multi-agent systems \u2014 CrewAI, LangGraph, AutoGen, MCP", proof: "project", mandatory: true, estMinutes: 180 }
    ]
  }
];

// src/data/foundation/core.ts
var CORE_SUBJECTS = [
  {
    id: "cs-c",
    tier: 3,
    name: "PPA \u2014 C",
    source: "PPA course revision",
    track: "systems",
    blurb: "Your working language. Revision pace \u2014 interview-grade recall of pointers and memory.",
    milestones: [
      { id: "c-1", title: "Pointers, memory (stack vs heap), malloc/free", proof: "exercise", mandatory: true, estMinutes: 120 },
      { id: "c-2", title: "Arrays, strings, structs", proof: "exercise", mandatory: true, estMinutes: 90 },
      { id: "c-3", title: "File I/O, function pointers, recursion", proof: "implement", mandatory: true, estMinutes: 90 },
      { id: "c-4", title: "Five programs from scratch \u2014 reverse string, linked list, sort", proof: "exercise", mandatory: true, estMinutes: 150 }
    ]
  },
  {
    id: "cs-cpp",
    tier: 3,
    name: "PPA \u2014 C++",
    source: "PPA course revision",
    track: "systems",
    blurb: "Your fastest DSA language. Target STL fluency and modern idioms.",
    milestones: [
      { id: "cpp-1", title: "Classes, objects, constructors, destructors, copy semantics", proof: "notes", mandatory: true, estMinutes: 90 },
      { id: "cpp-2", title: "Inheritance, polymorphism, virtual functions, abstract classes", proof: "notes", mandatory: true, estMinutes: 120 },
      { id: "cpp-3", title: "STL \u2014 vector, map, set, queue, stack, priority_queue", proof: "exercise", mandatory: true, estMinutes: 120 },
      { id: "cpp-4", title: "Smart pointers and move semantics (unique_ptr, shared_ptr)", proof: "notes", mandatory: true, estMinutes: 90 }
    ]
  },
  {
    id: "cs-lb",
    tier: 3,
    name: "Logic Building (LB)",
    source: "LB problem set",
    track: "dsa",
    blurb: "Smaller to bigger problems. Three to five a day builds the problem-solving reflex.",
    milestones: [
      { id: "lb-1", title: "Level 1 \u2014 patterns, factorial/Fibonacci/GCD, prime, palindrome, digits (15 problems)", proof: "exercise", mandatory: true, estMinutes: 180 },
      { id: "lb-2", title: "Level 2 \u2014 arrays: rotate, sorting, two-pointer, sliding window (20 problems)", proof: "exercise", mandatory: true, estMinutes: 240 },
      { id: "lb-3", title: "Level 3 \u2014 strings: anagram, palindrome, prefix, roman, parentheses (15 problems)", proof: "exercise", mandatory: true, estMinutes: 180 },
      { id: "lb-4", title: "Level 4 \u2014 recursion: power, Hanoi, subsets, permutations, merge/quick sort (15 problems)", proof: "exercise", mandatory: true, estMinutes: 240 }
    ]
  },
  {
    id: "cs-dsa",
    tier: 3,
    name: "DSA Basics",
    source: "LB Level 5 \u2014 DS problems",
    track: "dsa",
    blurb: "The highest-weight item for Amazon, Google and Microsoft. The daily DSA block keeps running alongside all of this.",
    milestones: [
      { id: "dsa-1", title: "Linked list \u2014 reverse, detect cycle", proof: "exercise", mandatory: true, estMinutes: 120 },
      { id: "dsa-2", title: "Stack using array, queue using stack", proof: "implement", mandatory: true, estMinutes: 90 },
      { id: "dsa-3", title: "Binary tree \u2014 BFS, DFS, height", proof: "exercise", mandatory: true, estMinutes: 120 },
      { id: "dsa-4", title: "HashMap problems \u2014 two-sum, anagram groups", proof: "exercise", mandatory: true, estMinutes: 90 },
      { id: "dsa-5", title: "Basic DP \u2014 Fibonacci table, climbing stairs", proof: "exercise", mandatory: true, estMinutes: 90 }
    ]
  },
  {
    id: "cs-lsp",
    tier: 3,
    name: "Linux System Programming",
    source: "LSP course",
    track: "systems",
    blurb: "Direct leverage on your telecom work, and a differentiator almost no AI candidate has.",
    milestones: [
      { id: "lsp-1", title: "Processes \u2014 fork/exec/wait, process lifecycle", proof: "implement", mandatory: true, estMinutes: 150 },
      { id: "lsp-2", title: "File descriptors, I/O, pipes, redirection", proof: "implement", mandatory: true, estMinutes: 120 },
      { id: "lsp-3", title: "Threads and synchronisation \u2014 mutex, condition variables, races", proof: "implement", mandatory: true, estMinutes: 180 },
      { id: "lsp-4", title: "IPC \u2014 shared memory, message queues, semaphores", proof: "notes", mandatory: true, estMinutes: 120 },
      { id: "lsp-5", title: "Sockets \u2014 a working TCP client and server", proof: "project", mandatory: true, estMinutes: 180 },
      { id: "lsp-6", title: "Signals and the memory layout of a running process", proof: "notes", mandatory: false, estMinutes: 90 }
    ]
  }
];

// src/data/foundation/coach.ts
var COACH = {
  /* ---- Course 1 — Apna College Prime AI/ML ---- */
  "ap-python": {
    doThis: "Run these parts at 1.5x and type every example into one notebook per part. Push it to a public apna-ai-ml repo the same night.",
    why: "You already write Python at work, so the lectures alone add little. What they can add is speed \u2014 and a public commit trail is proof a recruiter can actually open.",
    harder: "After each part, solve two small problems in Python from memory: comprehensions, generators, *args/**kwargs, a decorator.",
    proof: "Notebook committed \xB7 two problems solved without looking anything up"
  },
  "ap-data": {
    doThis: "Pick one public dataset (Kaggle is fine \u2014 never company data) and use it in every module instead of the toy examples.",
    why: "AI-engineer screens often include SQL and Pandas, and GROUP BY, joins and window functions are where candidates stall.",
    harder: "For every Pandas operation, write the SQL that does the same thing. Close SQL Part 2 with ten LeetCode SQL 50 problems.",
    proof: "One notebook analysing one dataset end to end \xB7 ten SQL problems logged"
  },
  "ap-math": {
    doThis: "One page of notes per module: the formula, and one line on where it shows up in ML. Nothing more.",
    why: "Interviews ask you to explain gradient descent, softmax and dot-product attention in words, not to derive proofs. Intuition is the bar.",
    harder: "Implement gradient descent for linear regression in plain NumPy \u2014 no sklearn \u2014 and plot the loss going down.",
    proof: "Three one-page sheets \xB7 a NumPy gradient-descent notebook"
  },
  "ap-ml": {
    doThis: "For every algorithm, fit it with sklearn, then write the short version yourself \u2014 module 29 shows how. Treat CreditWise and SmartCart as portfolio projects, not exercises.",
    why: "Bias\u2013variance, overfitting and precision-versus-recall are standard ML-round questions, and the two minor projects are your first AI lines on a resume.",
    harder: "Give each minor project a README: problem, data, metric, result, what you would do next. Serve one behind a FastAPI endpoint.",
    proof: "Two project repos with READMEs \xB7 one model behind an endpoint"
  },
  "ap-tools": {
    doThis: "Clear this in one sitting \u2014 you use Git every day. Put the saved time into the next ML module.",
    why: "This is review for you. The only gaps worth closing are rebase, cherry-pick and resolving conflicts without fear.",
    harder: "Write a GitHub profile README that links your course repos. It is the first thing a recruiter clicks.",
    proof: "Profile README live"
  },
  "ap-dl": {
    doThis: "Write the training loop yourself every time \u2014 forward, loss, backward, step. Never run the course cell as-is.",
    why: "This is the largest block of Course 1 and the base for transformers in Course 2. Interview depth here is backprop, overfitting and choosing an architecture.",
    harder: "For the Text Summarizer, compare two approaches and report ROUGE for both. A number you measured beats an adjective.",
    proof: "Your own training-loop notebook \xB7 Text Summarizer repo with a metric"
  },
  "ap-apps": {
    doThis: "Build every example as an API, not a notebook. Start from your Flask background, then rewrite one in FastAPI.",
    why: "AI-engineer roles hire for shipping LLM features behind an API \u2014 structured output, retries, cost and latency. This is the most job-shaped module in Course 1.",
    harder: "Log token count and latency for every call, and add a retry with backoff. Mention both in the README.",
    proof: "One deployed LLM endpoint with a README"
  },
  "ap-projects": {
    doThis: "Finish all four, then polish one \u2014 the AI Resume ATS \u2014 into your flagship: deployed, README with screenshots, a two-minute demo video.",
    why: "One shipped project you can explain carries more weight in an interview than a list of courses, and the ATS project is the closest to AI-engineer work.",
    harder: "Write a five-minute explanation for each: problem, design, tradeoffs, what broke, what you would change. Say it out loud once.",
    proof: "Four repos \xB7 one deployed flagship \xB7 a written walkthrough for each"
  },
  /* ---- Course 2 — Five Minute Engineering ---- */
  "fm-nlp": {
    doThis: "Implement tokenisation, TF-IDF and cosine similarity by hand once, then switch to the libraries.",
    why: "Similarity search is the base of every RAG system later in this course. Doing it by hand once makes the libraries legible.",
    harder: "Build a tiny search over your own notes with TF-IDF, then swap in embeddings and compare results on the same ten queries.",
    proof: "A notebook comparing TF-IDF and embedding search side by side"
  },
  "fm-transformers": {
    doThis: "Read the actual paper alongside the videos, and build the Nano LLM yourself \u2014 every line typed.",
    why: '"Explain self-attention" and "why multi-head" are among the most common AI-engineer theory questions. Having built it is what makes the answer fluent.',
    harder: "Draw Q/K/V attention on paper from memory, then explain it out loud in two minutes.",
    proof: "A Nano LLM repo that trains and generates \xB7 a one-page attention sheet"
  },
  "fm-prompt": {
    doThis: "Keep every prompt in a versioned file next to the input and the output it produced.",
    why: "Prompting is judged as engineering now \u2014 reproducible, evaluated, versioned. That is the gap between a demo and a product.",
    harder: "Write a ten-case evaluation set for one prompt and score two versions of it.",
    proof: "A prompts folder with versions \xB7 an eval score comparing two of them"
  },
  "fm-rag": {
    doThis: "Build RAG over a real document set \u2014 the public 3GPP specs from your own domain are ideal \u2014 and measure retrieval, not just answers.",
    why: "RAG is a staple of AI system-design rounds, and interviewers push on chunking, retrieval quality and hallucination \u2014 exactly where demos stay vague.",
    harder: "Try three chunk sizes and report recall@5 for each. Add a reranker and show the difference.",
    proof: "A RAG repo with a results table \xB7 faithfulness checked on 20 questions"
  },
  "fm-langchain": {
    doThis: "Build one small pipeline twice \u2014 once with LangChain, once with direct API calls \u2014 and note what each costs you.",
    why: "Teams want someone who can use a framework and also knows when not to. Having done both is the honest answer.",
    harder: "Write LCEL chains with structured output and a fallback when parsing fails.",
    proof: "Two implementations of one pipeline \xB7 a short comparison in the README"
  },
  "fm-agents": {
    doThis: "Build one agent that does real work: read a log file, find the errors, write a summary. Tools first, then memory, then multiple agents.",
    why: "Agents and MCP are where AI-engineer work is moving. A working agent with clear tool boundaries is a strong portfolio piece \u2014 and log triage is your daily job.",
    harder: "Add guardrails \u2014 a step limit, tool-input validation, a cost cap \u2014 and log every tool call.",
    proof: "An agent repo with a demo run and its tool-call log"
  },
  /* ---- Practice — after both courses ---- */
  "cs-c": {
    doThis: "Write every program from a blank file, compile with -Wall -Wextra, and run it under valgrind.",
    why: "C is your working language at Parallel Wireless, and pointer and memory questions are where systems interviews start.",
    harder: "Implement your own strlen, memcpy and a dynamic array that grows.",
    proof: "Programs in a repo \xB7 valgrind clean"
  },
  "cs-cpp": {
    doThis: "Move your DSA solutions to C++ and the STL now \u2014 that is where fluency comes from.",
    why: "STL fluency saves minutes in every timed round, and the rule of three/five and virtual dispatch are standard C++ questions.",
    harder: "Implement a minimal unique_ptr and a vector with move semantics.",
    proof: "An STL cheat sheet written from memory \xB7 both implementations"
  },
  "cs-lb": {
    doThis: "Three to five problems a day, smallest first. Write the approach in one line before you write code.",
    why: "Logic building is the reflex DSA rounds test: turning a problem into steps, fast.",
    harder: "Time every problem. Anything over 20 minutes goes on the Sunday re-solve list.",
    proof: "Problems logged with time and pattern"
  },
  "cs-dsa": {
    doThis: "Log every problem in the DSA tab with its pattern, and re-solve one older problem cold each week.",
    why: "DSA is the highest-weight item in SDE loops at Amazon, Google and Microsoft, and recognising the pattern transfers further than raw problem count.",
    harder: "Explain each solution out loud as if to an interviewer: brute force, then optimised, then complexity.",
    proof: "Every pattern with at least three clean solves"
  },
  "cs-lsp": {
    doThis: "Write each system-call program yourself and trace it with strace.",
    why: "You work on telecom systems. Processes, threads, IPC and sockets set you apart from AI candidates who only know Python.",
    harder: "Build a multi-threaded TCP server that handles concurrent clients and shuts down cleanly.",
    proof: "A TCP server repo \xB7 strace notes"
  }
};
function coachFor(subjectId) {
  return COACH[subjectId];
}

// src/data/foundation/index.ts
var FOUNDATION_SUBJECTS = [
  ...APNA_SUBJECTS,
  ...FIVEME_SUBJECTS,
  ...CORE_SUBJECTS
];
var SEQUENTIAL_TIERS = /* @__PURE__ */ new Set([1, 2]);
var MANDATORY_MILESTONE_COUNT = FOUNDATION_SUBJECTS.reduce(
  (sum, s) => sum + s.milestones.filter((m) => m.mandatory).length,
  0
);
var TOTAL_MILESTONE_COUNT = FOUNDATION_SUBJECTS.reduce(
  (sum, s) => sum + s.milestones.length,
  0
);
var MANDATORY_HOURS = Math.round(
  FOUNDATION_SUBJECTS.reduce(
    (n, s) => n + s.milestones.filter((m) => m.mandatory).reduce((x, m) => x + m.estMinutes, 0),
    0
  ) / 60
);

// src/engine/foundation.ts
function subjectProgress(state, subject) {
  const total = subject.milestones.length;
  const done = subject.milestones.filter((m) => state.foundation[m.id]).length;
  const mandatory = subject.milestones.filter((m) => m.mandatory);
  const mandatoryDone = mandatory.filter((m) => state.foundation[m.id]).length;
  let status;
  if (done === 0) status = "not_started";
  else if (mandatoryDone < mandatory.length) status = "in_progress";
  else if (done < total) status = "completed";
  else status = "verified";
  return {
    subject,
    status,
    done,
    total,
    mandatoryDone,
    mandatoryTotal: mandatory.length,
    pct: total === 0 ? 0 : Math.round(done / total * 100)
  };
}
function allSubjectProgress(state) {
  return FOUNDATION_SUBJECTS.map((s) => subjectProgress(state, s));
}
function gateStatus(state) {
  const progress = allSubjectProgress(state);
  const mandatoryDone = progress.reduce((s, p) => s + p.mandatoryDone, 0);
  const earned = mandatoryDone >= MANDATORY_MILESTONE_COUNT;
  return {
    mandatoryDone,
    mandatoryTotal: MANDATORY_MILESTONE_COUNT,
    pct: Math.round(mandatoryDone / MANDATORY_MILESTONE_COUNT * 100),
    earned,
    unlocked: Boolean(state.foundationUnlockedAt),
    overridden: state.foundationOverride === true,
    unlockedAt: state.foundationUnlockedAt,
    blockingSubjects: progress.filter((p) => p.mandatoryDone < p.mandatoryTotal).map((p) => p.subject.name)
  };
}

// src/data/tasks/ai.ts
var AI_TASKS = [
  {
    id: "ai-embed-1",
    title: "Embeddings deep dive \u2014 dimensionality, similarity metrics, model choice",
    track: "ai",
    priority: "P0",
    estMinutes: 90,
    careerValue: 9,
    difficulty: "core",
    proof: "notes",
    targetRole: "ai-engineer",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Every RAG and semantic-search question starts here. Cosine vs dot product and when normalisation matters are standard screening questions."
  },
  {
    id: "ai-vector-1",
    title: "Vector database hands-on \u2014 pgvector, index types, recall vs latency",
    track: "ai",
    priority: "P0",
    estMinutes: 120,
    careerValue: 9,
    difficulty: "core",
    proof: "implement",
    targetRole: "ai-engineer",
    prereqs: ["ai-embed-1"],
    interviewCritical: true,
    portfolioCritical: true,
    optional: false,
    rationale: "pgvector keeps Postgres as the single datastore, which matches the backend track and avoids adding a service to explain in a design round."
  },
  {
    id: "ai-retrieval-1",
    title: "Hybrid retrieval \u2014 BM25 plus dense, and why pure vector search underperforms",
    track: "ai",
    priority: "P0",
    estMinutes: 120,
    careerValue: 9,
    difficulty: "advanced",
    proof: "implement",
    targetRole: "ai-engineer",
    prereqs: ["ai-vector-1"],
    interviewCritical: true,
    portfolioCritical: true,
    optional: false,
    rationale: "Naming the failure mode of pure dense retrieval on exact identifiers separates production experience from tutorial experience."
  },
  {
    id: "ai-rerank-1",
    title: "Reranking \u2014 cross-encoder stage and its latency and cost tradeoff",
    track: "ai",
    priority: "P1",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "advanced",
    proof: "implement",
    targetRole: "ai-engineer",
    prereqs: ["ai-retrieval-1"],
    interviewCritical: true,
    portfolioCritical: true,
    optional: false
  },
  {
    id: "ai-eval-1",
    title: "Retrieval evaluation harness \u2014 hit-rate, MRR, nDCG on a labelled set",
    track: "ai",
    priority: "P0",
    estMinutes: 150,
    careerValue: 10,
    difficulty: "advanced",
    proof: "implement",
    targetRole: "ai-engineer",
    prereqs: ["ai-retrieval-1"],
    interviewCritical: true,
    portfolioCritical: true,
    optional: false,
    rationale: "The highest-leverage item in this track. Being able to say how you knew your RAG system was good is the differentiator, and a measured number is what makes that answer land."
  },
  {
    id: "ai-eval-2",
    title: "Answer-quality evaluation \u2014 groundedness and faithfulness scoring",
    track: "ai",
    priority: "P1",
    estMinutes: 120,
    careerValue: 9,
    difficulty: "advanced",
    proof: "implement",
    targetRole: "ai-engineer",
    prereqs: ["ai-eval-1"],
    interviewCritical: true,
    portfolioCritical: true,
    optional: false
  },
  {
    id: "ai-serve-1",
    title: "FastAPI AI service \u2014 streaming responses, timeouts, backpressure",
    track: "ai",
    priority: "P0",
    estMinutes: 150,
    careerValue: 9,
    difficulty: "core",
    proof: "implement",
    targetRole: "both",
    interviewCritical: true,
    portfolioCritical: true,
    optional: false,
    rationale: "Directly reuses your Django and Flask background. FastAPI is the default serving layer in AI job descriptions."
  },
  {
    id: "ai-serve-2",
    title: "Caching and cost control \u2014 semantic cache, token budgets, model routing",
    track: "ai",
    priority: "P1",
    estMinutes: 120,
    careerValue: 8,
    difficulty: "advanced",
    proof: "implement",
    targetRole: "ai-engineer",
    prereqs: ["ai-serve-1"],
    interviewCritical: true,
    portfolioCritical: true,
    optional: false
  },
  {
    id: "ai-serve-3",
    title: "Observability for LLM systems \u2014 tracing, token accounting, latency budgets",
    track: "ai",
    priority: "P1",
    estMinutes: 100,
    careerValue: 8,
    difficulty: "advanced",
    proof: "implement",
    targetRole: "ai-engineer",
    prereqs: ["ai-serve-1"],
    interviewCritical: false,
    portfolioCritical: true,
    optional: false,
    rationale: "Builds directly on your existing Jenkins and CI/CD instincts \u2014 same discipline, applied to an inference path."
  },
  {
    id: "ai-agent-1",
    title: "Tool calling and agent loop \u2014 build one from scratch, no framework",
    track: "ai",
    priority: "P0",
    estMinutes: 150,
    careerValue: 9,
    difficulty: "advanced",
    proof: "implement",
    targetRole: "ai-engineer",
    interviewCritical: true,
    portfolioCritical: true,
    optional: false,
    rationale: "Writing the loop yourself once makes every agent framework legible and is a common live-coding prompt for AI roles."
  },
  {
    id: "ai-agent-2",
    title: "Agent memory, planning and guardrails",
    track: "ai",
    priority: "P1",
    estMinutes: 120,
    careerValue: 8,
    difficulty: "advanced",
    proof: "notes",
    targetRole: "ai-engineer",
    prereqs: ["ai-agent-1"],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  },
  {
    id: "ai-agent-3",
    title: "Agent evaluation \u2014 trajectory scoring and regression suite",
    track: "ai",
    priority: "P2",
    estMinutes: 120,
    careerValue: 7,
    difficulty: "advanced",
    proof: "implement",
    targetRole: "ai-engineer",
    prereqs: ["ai-agent-2"],
    interviewCritical: false,
    portfolioCritical: true,
    optional: false
  },
  {
    id: "ai-dl-1",
    title: "Transformer internals \u2014 attention maths worked through by hand",
    track: "ai",
    priority: "P1",
    estMinutes: 150,
    careerValue: 8,
    difficulty: "advanced",
    proof: "notes",
    targetRole: "ai-engineer",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Asked in depth at Google and at AI-first companies. Applied-only candidates get filtered here."
  },
  {
    id: "ai-dl-2",
    title: "Fine-tuning vs prompting vs RAG \u2014 decision framework with cost model",
    track: "ai",
    priority: "P1",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "core",
    proof: "notes",
    targetRole: "ai-engineer",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  },
  {
    id: "ai-dl-3",
    title: "LoRA and quantisation \u2014 read the papers, reproduce the intuition",
    track: "ai",
    priority: "P2",
    estMinutes: 150,
    careerValue: 6,
    difficulty: "advanced",
    proof: "notes",
    targetRole: "ai-engineer",
    prereqs: ["ai-dl-1"],
    interviewCritical: false,
    portfolioCritical: false,
    optional: true
  },
  {
    id: "ai-sd-1",
    title: "System design for AI \u2014 design a RAG platform at scale",
    track: "ai",
    priority: "P0",
    estMinutes: 120,
    careerValue: 10,
    difficulty: "advanced",
    proof: "exercise",
    targetRole: "ai-engineer",
    prereqs: ["ai-eval-1", "ai-serve-1"],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "The AI-role equivalent of a classic system design round: ingestion, indexing, serving, evaluation and cost, all defended out loud."
  }
];

// src/data/tasks/dsa.ts
var DSA_PATTERNS = [
  { id: "arrays", name: "Arrays & Hashing", weight: 10, priority: "P0", difficulty: "core", targetProblems: 12 },
  { id: "twopointers", name: "Two Pointers", weight: 9, priority: "P0", difficulty: "core", targetProblems: 8 },
  { id: "sliding", name: "Sliding Window", weight: 9, priority: "P0", difficulty: "core", targetProblems: 8 },
  { id: "binarysearch", name: "Binary Search", weight: 10, priority: "P0", difficulty: "core", targetProblems: 10, note: "Include binary-search-on-the-answer \u2014 the variant that is easy to miss." },
  { id: "stack", name: "Stack", weight: 8, priority: "P0", difficulty: "core", targetProblems: 8, note: "Monotonic stack is the high-value sub-pattern." },
  { id: "queue", name: "Queue & Deque", weight: 6, priority: "P1", difficulty: "core", targetProblems: 5 },
  { id: "linkedlist", name: "Linked List", weight: 8, priority: "P0", difficulty: "core", targetProblems: 8 },
  { id: "trees", name: "Trees", weight: 10, priority: "P0", difficulty: "core", targetProblems: 14 },
  { id: "bst", name: "Binary Search Tree", weight: 8, priority: "P0", difficulty: "core", targetProblems: 6 },
  { id: "heap", name: "Heap & Priority Queue", weight: 8, priority: "P0", difficulty: "core", targetProblems: 7, note: "Top-K and merge-K are the recurring shapes." },
  { id: "graphs", name: "Graphs", weight: 10, priority: "P0", difficulty: "advanced", targetProblems: 14, note: "BFS/DFS, topological sort, union-find. Several of the asked problems in the Amazon module are graph problems." },
  { id: "recursion", name: "Recursion", weight: 8, priority: "P0", difficulty: "core", targetProblems: 6 },
  { id: "backtracking", name: "Backtracking", weight: 8, priority: "P1", difficulty: "advanced", targetProblems: 8 },
  { id: "greedy", name: "Greedy", weight: 7, priority: "P1", difficulty: "advanced", targetProblems: 7 },
  { id: "dp1", name: "1-D Dynamic Programming", weight: 9, priority: "P0", difficulty: "advanced", targetProblems: 12 },
  { id: "dp2", name: "2-D Dynamic Programming", weight: 8, priority: "P1", difficulty: "advanced", targetProblems: 8 },
  { id: "intervals", name: "Intervals", weight: 7, priority: "P1", difficulty: "core", targetProblems: 6 },
  { id: "bits", name: "Bit Manipulation", weight: 6, priority: "P1", difficulty: "core", targetProblems: 6 },
  { id: "tries", name: "Tries", weight: 6, priority: "P2", difficulty: "advanced", targetProblems: 4 }
];
var DSA_PATTERN_IDS = DSA_PATTERNS.map((p) => p.id);
var DSA_TASKS = DSA_PATTERNS.flatMap((p) => [
  {
    id: `dsa-${p.id}-learn`,
    title: `${p.name} \u2014 learn the pattern and its invariants`,
    track: "dsa",
    priority: p.priority,
    estMinutes: 60,
    careerValue: p.weight,
    difficulty: p.difficulty,
    proof: "notes",
    targetRole: "both",
    source: "NeetCode",
    interviewCritical: true,
    portfolioCritical: false,
    optional: p.priority === "P2",
    rationale: p.note
  },
  {
    id: `dsa-${p.id}-drill`,
    title: `${p.name} \u2014 solve ${p.targetProblems} problems, tagged and timed`,
    track: "dsa",
    priority: p.priority,
    estMinutes: p.targetProblems * 20,
    careerValue: p.weight,
    difficulty: p.difficulty,
    proof: "exercise",
    targetRole: "both",
    source: "LeetCode",
    prereqs: [`dsa-${p.id}-learn`],
    interviewCritical: true,
    portfolioCritical: false,
    optional: p.priority === "P2"
  }
]);
var DSA_META_TASKS = [
  {
    id: "dsa-timed-1",
    title: "Weekly timed set \u2014 3 problems, no hints, solve times logged",
    track: "dsa",
    priority: "P0",
    estMinutes: 90,
    careerValue: 10,
    difficulty: "core",
    proof: "checkpoint",
    targetRole: "both",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Untimed solving hides the real gap. Interviews are 35 minutes with someone watching."
  },
  {
    id: "dsa-amazon-1",
    title: "Amazon-tagged set \u2014 graphs, heaps, intervals, BFS-heavy problems",
    track: "dsa",
    priority: "P1",
    estMinutes: 120,
    careerValue: 9,
    difficulty: "advanced",
    proof: "exercise",
    targetRole: "sde",
    prereqs: ["dsa-graphs-drill", "dsa-heap-drill"],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Amazon loops lean toward graph and heap shapes. Treat the tag as a hint about distribution, not a guarantee of content."
  },
  {
    id: "dsa-google-1",
    title: "Google-style set \u2014 harder algorithmic reasoning, fewer templates",
    track: "dsa",
    priority: "P1",
    estMinutes: 120,
    careerValue: 9,
    difficulty: "advanced",
    proof: "exercise",
    targetRole: "sde",
    prereqs: ["dsa-dp1-drill", "dsa-graphs-drill"],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  },
  {
    id: "dsa-revision-1",
    title: "Cold re-solve loop \u2014 5 old problems, under 20 minutes each",
    track: "dsa",
    priority: "P0",
    estMinutes: 100,
    careerValue: 10,
    difficulty: "core",
    proof: "checkpoint",
    targetRole: "both",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Retention is the metric that matters, not cumulative solve count. A problem you cannot re-solve cold was never learned."
  }
];

// src/data/tasks/cs.ts
var mk = (t) => ({
  track: "cs",
  targetRole: "both",
  ...t
});
var CS_TASKS = [
  // ---- Operating systems -------------------------------------------------
  mk({
    id: "cs-os-1",
    title: "Processes vs threads, context switching, scheduling algorithms",
    priority: "P0",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "core",
    proof: "notes",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Core operating-systems material for SDE loops, and directly adjacent to your telecom systems work."
  }),
  mk({
    id: "cs-os-2",
    title: "Memory: virtual memory, paging, segmentation, TLB",
    priority: "P0",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "core",
    proof: "notes",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  }),
  mk({
    id: "cs-os-3",
    title: "Synchronisation: mutex, semaphore, deadlock conditions and prevention",
    priority: "P0",
    estMinutes: 90,
    careerValue: 9,
    difficulty: "core",
    proof: "implement",
    prereqs: ["cs-os-1"],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Overlaps the LSP foundation work \u2014 do them close together and the second one costs almost nothing."
  }),
  mk({
    id: "cs-os-4",
    title: "IPC and file systems \u2014 inodes, journaling, buffering",
    priority: "P1",
    estMinutes: 75,
    careerValue: 6,
    difficulty: "core",
    proof: "notes",
    interviewCritical: false,
    portfolioCritical: false,
    optional: false
  }),
  // ---- Networking --------------------------------------------------------
  mk({
    id: "cs-net-1",
    title: "TCP/IP stack, handshake, flow control, congestion control",
    priority: "P0",
    estMinutes: 90,
    careerValue: 9,
    difficulty: "core",
    proof: "notes",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Your strongest existing edge. Two years of 4G/5G work makes this a differentiator rather than a revision item."
  }),
  mk({
    id: "cs-net-2",
    title: "HTTP/1.1 vs HTTP/2 vs HTTP/3, TLS handshake, DNS resolution",
    priority: "P0",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "core",
    proof: "notes",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  }),
  mk({
    id: "cs-net-3",
    title: "Load balancing, reverse proxies, WebSockets, keep-alive",
    priority: "P1",
    estMinutes: 75,
    careerValue: 8,
    difficulty: "core",
    proof: "notes",
    prereqs: ["cs-net-2"],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  }),
  // ---- Databases ---------------------------------------------------------
  mk({
    id: "cs-db-1",
    title: "SQL depth \u2014 joins, window functions, query plans",
    priority: "P0",
    estMinutes: 120,
    careerValue: 9,
    difficulty: "core",
    proof: "exercise",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  }),
  mk({
    id: "cs-db-2",
    title: "Indexes \u2014 B-tree internals, covering indexes, EXPLAIN ANALYZE",
    priority: "P0",
    estMinutes: 90,
    careerValue: 9,
    difficulty: "advanced",
    proof: "implement",
    prereqs: ["cs-db-1"],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Reading a query plan out loud is a fast credibility signal in a backend round."
  }),
  mk({
    id: "cs-db-3",
    title: "Transactions, ACID, isolation levels and the anomalies each allows",
    priority: "P0",
    estMinutes: 90,
    careerValue: 9,
    difficulty: "advanced",
    proof: "notes",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  }),
  mk({
    id: "cs-db-4",
    title: "Normalisation, denormalisation, relational vs NoSQL tradeoffs",
    priority: "P1",
    estMinutes: 75,
    careerValue: 7,
    difficulty: "core",
    proof: "notes",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  }),
  // ---- OOP and design ----------------------------------------------------
  mk({
    id: "cs-oop-1",
    title: "SOLID principles with real refactors, not definitions",
    priority: "P1",
    estMinutes: 90,
    careerValue: 7,
    difficulty: "core",
    proof: "implement",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  }),
  mk({
    id: "cs-oop-2",
    title: "Low-level design \u2014 parking lot, rate limiter, cache, from scratch",
    priority: "P1",
    estMinutes: 120,
    careerValue: 8,
    difficulty: "advanced",
    proof: "implement",
    prereqs: ["cs-oop-1"],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  }),
  // ---- System design -----------------------------------------------------
  mk({
    id: "cs-sd-1",
    title: "Building blocks \u2014 caching, queues, sharding, replication, consistency",
    priority: "P0",
    estMinutes: 150,
    careerValue: 10,
    difficulty: "advanced",
    proof: "notes",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Required at Amazon and Microsoft from SDE-2 upward, and you are interviewing at roughly that band with two years plus depth."
  }),
  mk({
    id: "cs-sd-2",
    title: "Design a URL shortener \u2014 end to end, with numbers",
    priority: "P0",
    estMinutes: 90,
    careerValue: 9,
    difficulty: "advanced",
    proof: "exercise",
    prereqs: ["cs-sd-1"],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  }),
  mk({
    id: "cs-sd-3",
    title: "Design a notification system \u2014 fan-out, retries, idempotency",
    priority: "P1",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "advanced",
    proof: "exercise",
    prereqs: ["cs-sd-1"],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  }),
  mk({
    id: "cs-sd-4",
    title: "Design a chat system \u2014 presence, ordering, delivery guarantees",
    priority: "P1",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "advanced",
    proof: "exercise",
    prereqs: ["cs-sd-1"],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  }),
  mk({
    id: "cs-sd-5",
    title: "Design a file storage service \u2014 chunking, dedupe, metadata",
    priority: "P2",
    estMinutes: 90,
    careerValue: 7,
    difficulty: "advanced",
    proof: "exercise",
    prereqs: ["cs-sd-1"],
    interviewCritical: false,
    portfolioCritical: false,
    optional: true
  }),
  mk({
    id: "cs-sd-6",
    title: "Design a news feed \u2014 ranking, fan-out on read vs write",
    priority: "P2",
    estMinutes: 90,
    careerValue: 7,
    difficulty: "advanced",
    proof: "exercise",
    prereqs: ["cs-sd-1"],
    interviewCritical: false,
    portfolioCritical: false,
    optional: true
  }),
  mk({
    id: "cs-sd-7",
    title: "Distributed systems basics \u2014 CAP, consensus, leader election",
    priority: "P1",
    estMinutes: 120,
    careerValue: 8,
    difficulty: "advanced",
    proof: "notes",
    prereqs: ["cs-sd-1"],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  })
];

// src/data/tasks/backend.ts
var mk2 = (t) => ({
  track: "backend",
  targetRole: "both",
  ...t
});
var BACKEND_TASKS = [
  mk2({
    id: "be-py-1",
    title: "Python internals \u2014 GIL, memory model, references, descriptors",
    priority: "P1",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "advanced",
    proof: "notes",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Expect a GIL question in a Python-heavy loop."
  }),
  mk2({
    id: "be-py-2",
    title: "asyncio in anger \u2014 event loop, gather, cancellation, blocking-call traps",
    priority: "P0",
    estMinutes: 120,
    careerValue: 9,
    difficulty: "advanced",
    proof: "implement",
    prereqs: ["be-py-1"],
    interviewCritical: true,
    portfolioCritical: true,
    optional: false,
    rationale: "Prerequisite for FastAPI serving work \u2014 a blocking call inside an async handler is the classic production incident."
  }),
  mk2({
    id: "be-drf-1",
    title: "DRF at production depth \u2014 serializers, viewsets, permissions, throttling",
    priority: "P1",
    estMinutes: 120,
    careerValue: 8,
    difficulty: "core",
    proof: "implement",
    interviewCritical: true,
    portfolioCritical: true,
    optional: false,
    rationale: "Builds on Django you already use daily. Fast return relative to time spent."
  }),
  mk2({
    id: "be-drf-2",
    title: "Django ORM performance \u2014 N+1, select_related, prefetch_related, query counts",
    priority: "P0",
    estMinutes: 90,
    careerValue: 9,
    difficulty: "advanced",
    proof: "implement",
    prereqs: ["be-drf-1"],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "A frequent cause of slow Django endpoints, and a natural follow-up question."
  }),
  mk2({
    id: "be-fastapi-1",
    title: "FastAPI \u2014 dependency injection, Pydantic v2, background tasks, lifespan",
    priority: "P0",
    estMinutes: 120,
    careerValue: 9,
    difficulty: "core",
    proof: "implement",
    prereqs: ["be-py-2"],
    interviewCritical: true,
    portfolioCritical: true,
    optional: false,
    rationale: "The default serving layer in AI job descriptions. Highest-value backend item for the target role."
  }),
  mk2({
    id: "be-auth-1",
    title: "Auth done properly \u2014 JWT, refresh rotation, RBAC, session tradeoffs",
    priority: "P0",
    estMinutes: 120,
    careerValue: 9,
    difficulty: "core",
    proof: "implement",
    interviewCritical: true,
    portfolioCritical: true,
    optional: false
  }),
  mk2({
    id: "be-pg-1",
    title: "PostgreSQL operationally \u2014 connection pooling, migrations, backups",
    priority: "P1",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "core",
    proof: "implement",
    interviewCritical: true,
    portfolioCritical: true,
    optional: false
  }),
  mk2({
    id: "be-redis-1",
    title: "Redis \u2014 caching patterns, TTL, invalidation, stampede protection",
    priority: "P0",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "core",
    proof: "implement",
    interviewCritical: true,
    portfolioCritical: true,
    optional: false
  }),
  mk2({
    id: "be-celery-1",
    title: "Background jobs \u2014 Celery, retries, idempotency, dead-letter handling",
    priority: "P1",
    estMinutes: 120,
    careerValue: 8,
    difficulty: "advanced",
    proof: "implement",
    prereqs: ["be-redis-1"],
    interviewCritical: true,
    portfolioCritical: true,
    optional: false
  }),
  mk2({
    id: "be-test-1",
    title: "Testing \u2014 pytest fixtures, factories, mocking boundaries, coverage that means something",
    priority: "P1",
    estMinutes: 90,
    careerValue: 7,
    difficulty: "core",
    proof: "implement",
    interviewCritical: false,
    portfolioCritical: true,
    optional: false,
    rationale: "A gap code review keeps flagging. Cheap to close."
  }),
  mk2({
    id: "be-docker-1",
    title: "Docker for Python services \u2014 multi-stage builds, slim images, compose",
    priority: "P0",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "core",
    proof: "implement",
    interviewCritical: true,
    portfolioCritical: true,
    optional: false,
    rationale: "Extends CI/CD ground you already own from Jenkins work."
  }),
  mk2({
    id: "be-api-1",
    title: "API design \u2014 versioning, pagination, error contracts, idempotency keys",
    priority: "P1",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "core",
    proof: "notes",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  }),
  mk2({
    id: "be-deploy-1",
    title: "Deploy a service properly \u2014 health checks, logging, metrics, zero-downtime",
    priority: "P1",
    estMinutes: 120,
    careerValue: 8,
    difficulty: "advanced",
    proof: "project",
    prereqs: ["be-docker-1"],
    interviewCritical: false,
    portfolioCritical: true,
    optional: false
  })
];

// src/data/tasks/java-react.ts
var JAVA_TASKS = [
  {
    id: "java-1",
    title: "Java syntax, OOP and collections \u2014 refresh to fluency",
    track: "java",
    priority: "P2",
    estMinutes: 120,
    careerValue: 6,
    difficulty: "core",
    proof: "exercise",
    targetRole: "sde",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Amazon and Microsoft accept Python, so Java is optionality rather than a requirement. Kept at P2 on purpose."
  },
  {
    id: "java-2",
    title: "Generics, exceptions, streams and lambdas",
    track: "java",
    priority: "P2",
    estMinutes: 90,
    careerValue: 5,
    difficulty: "core",
    proof: "exercise",
    targetRole: "sde",
    prereqs: ["java-1"],
    interviewCritical: false,
    portfolioCritical: false,
    optional: false
  },
  {
    id: "java-3",
    title: "Concurrency and JVM basics \u2014 threads, executors, heap vs stack, GC",
    track: "java",
    priority: "P2",
    estMinutes: 120,
    careerValue: 6,
    difficulty: "advanced",
    proof: "notes",
    targetRole: "sde",
    prereqs: ["java-2"],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  },
  {
    id: "java-4",
    title: "Spring Boot \u2014 DI, REST controllers, JPA basics, one working service",
    track: "java",
    priority: "P3",
    estMinutes: 180,
    careerValue: 5,
    difficulty: "core",
    proof: "project",
    targetRole: "sde",
    prereqs: ["java-3"],
    interviewCritical: false,
    portfolioCritical: false,
    optional: true,
    rationale: "Only worth the time if a specific target role asks for Java. Otherwise the hours belong to AI."
  }
];
var REACT_TASKS = [
  {
    id: "react-1",
    title: "Modern React \u2014 hooks, effects, state patterns, when to reach for context",
    track: "react",
    priority: "P2",
    estMinutes: 90,
    careerValue: 5,
    difficulty: "core",
    proof: "implement",
    targetRole: "both",
    interviewCritical: false,
    portfolioCritical: true,
    optional: false,
    rationale: "Enough to keep full-stack claims defensible on the resume. Not an interview focus for AI roles."
  },
  {
    id: "react-2",
    title: "API integration, forms, auth flows, error and loading states",
    track: "react",
    priority: "P2",
    estMinutes: 90,
    careerValue: 5,
    difficulty: "core",
    proof: "implement",
    targetRole: "both",
    prereqs: ["react-1"],
    interviewCritical: false,
    portfolioCritical: true,
    optional: false
  },
  {
    id: "react-3",
    title: "Performance \u2014 memoisation, list virtualisation, bundle size",
    track: "react",
    priority: "P3",
    estMinutes: 75,
    careerValue: 4,
    difficulty: "advanced",
    proof: "notes",
    targetRole: "both",
    prereqs: ["react-2"],
    interviewCritical: false,
    portfolioCritical: false,
    optional: true
  }
];

// src/data/projects/portfolio.ts
var PORTFOLIO_PROJECTS = [
  {
    id: "proj-blueprint",
    name: "Ruturaj Blueprint",
    tagline: "This application \u2014 a career execution system with real accountability.",
    status: "shipped",
    why: "Already built, already deployed, already used daily. A project someone actually uses beats a tutorial clone, and it demonstrates product judgement rather than framework familiarity.",
    stack: ["React", "TypeScript", "Vite", "Netlify Functions", "Netlify Blobs"],
    headline: "Scheduled server-side jobs that read real user state and send personalised accountability mail.",
    taskIds: ["proj-writeup"],
    problem: "Course lists and spreadsheets record intent, not behaviour. You needed one place that decides tonight from what actually got done, scores the day against the plan it set, and sends two mails a day that reference real progress instead of generic encouragement.",
    architecture: "A Vite + React single-page app on Netlify. State is one JSON document mirrored in localStorage and Netlify Blobs behind a passphrase. A pure TypeScript engine (dates, planner, priority, scoring) is bundled once and shared by the browser and the scheduled Netlify Functions that send the morning and evening mail.",
    milestones: [
      "README: the two-phase programme, the engine and UI split, and how the mail pipeline is guarded against duplicate sends",
      "Extend verify-engine with cases for the 04:00 IST day rollover and plannedHits scoring",
      "Record a two-minute walkthrough: My Day, close the day, the evening mail that follows",
      "Capture one real week of planned-versus-closed numbers for the write-up (Metric needed)"
    ],
    testing: "The engine is pure, so scripts/verify-engine.mjs and tsc --noEmit run on every build, and the mail path has its own npm run test:mail. The UI is checked by hand at 375px and 1440px before a push.",
    deployment: "Push to main deploys to Netlify. Two scheduled functions run inside a fifteen-minute cron window, and a send log in Blobs makes a retry idempotent and stops a missed window from bursting later.",
    success: "Opened every morning and evening for the whole programme; every mail names what was planned and what closed; the send log shows no duplicate sends.",
    explain: "Why the engine is shared between the browser and the functions instead of re-implemented; why a mission day starts at 04:00 IST; how scoring planned work that got done replaced completed-over-planned, which once produced 800%; how the updatedAt timestamp decides which copy wins between a phone and a laptop."
  },
  {
    id: "proj-rag",
    name: "Production RAG Service",
    tagline: "A retrieval system with measured quality, not a demo.",
    status: "planned",
    why: "The flagship. Almost every AI Engineer job description maps onto this project, and the evaluation harness is what makes it credible rather than derivative.",
    stack: ["FastAPI", "PostgreSQL + pgvector", "Redis", "Docker", "LLM API"],
    headline: "Hybrid retrieval with reranking, and a measured hit-rate that improved from a stated baseline.",
    taskIds: ["ai-vector-1", "ai-retrieval-1", "ai-rerank-1", "ai-eval-1", "ai-eval-2", "ai-serve-1", "ai-serve-2"],
    problem: "Most RAG demos answer questions but cannot say how well. This service retrieves over a real document set and reports retrieval quality on a fixed question set, so a change to chunking or reranking is a measured decision rather than a feeling.",
    architecture: "FastAPI in front of PostgreSQL with pgvector for embeddings and Redis for caching and rate limits. Ingestion chunks and embeds documents; a query runs hybrid retrieval (vector plus keyword), a reranker, then the LLM call with citations. An evaluation harness replays the question set and writes hit-rate and faithfulness to a results table.",
    milestones: [
      "Ingest one real document set (the public 3GPP specs fit your domain) with the chunk size recorded per run",
      "Hybrid retrieval: vector search plus keyword search, merged into one ranked list",
      "Write a fixed evaluation set and measure recall@5 before adding a reranker",
      "Add a reranker, re-run the same set, keep both numbers side by side",
      "Serve it: a FastAPI endpoint with citations, timeouts and a per-request cost log",
      "Dockerise, deploy, and put the results table in the README"
    ],
    testing: "Unit tests on chunking and the merge step. The evaluation harness is the integration test: it runs on the same question set after every retrieval change and fails the pipeline when hit-rate drops below the last recorded run.",
    deployment: "Docker Compose for Postgres, Redis and the API; one image deployed to a small VM or free-tier host, with the evaluation run as a CI step before the image is promoted.",
    success: "A results table showing hit-rate before and after reranking on the same question set, and a deployed endpoint you can query live in an interview. Baseline and final numbers: Metric needed.",
    explain: "Why hybrid retrieval over pure vector search; how chunk size changed recall (Metric needed); what the reranker costs per query in latency (Metric needed); how the faithfulness check catches a hallucinated answer; what the service does when retrieval finds nothing relevant."
  },
  {
    id: "proj-agent",
    name: "AI + Backend Platform",
    tagline: "Auth, APIs, queues and an agent loop in one deployable system.",
    status: "planned",
    why: "Proves the combination the target role actually wants: an AI engineer who can also build the service around the model. Reuses the backend track directly.",
    stack: ["Django/DRF or FastAPI", "PostgreSQL", "Redis", "Celery", "Docker"],
    headline: "An agent with tool calling, persistent memory and a regression suite that gates deploys.",
    taskIds: ["be-auth-1", "be-celery-1", "be-redis-1", "ai-agent-1", "ai-agent-2", "ai-agent-3", "be-docker-1"],
    problem: "An agent that only runs in a notebook proves nothing about the system around it. This platform puts auth, background queues and an agent loop with tool calling into one deployable service, so the AI part is defended by ordinary backend engineering.",
    architecture: "Django/DRF or FastAPI with token auth and per-user scoping; PostgreSQL for users, conversations and tool-call logs; Redis plus Celery for long-running agent runs; an agent loop that calls typed tools, keeps memory per conversation and logs every step. Docker for the whole stack.",
    milestones: [
      "Auth and scoping: register, log in, tokens, one protected resource only its owner can read",
      "A Celery worker on Redis running one long job with retry and status polling",
      "Agent loop with two typed tools and a step limit; every tool call logged",
      "Persistent memory per conversation, stored in Postgres and scoped to the user",
      "A regression suite of recorded transcripts that must pass before a deploy",
      "Dockerised, deployed, README with an architecture diagram"
    ],
    testing: "API tests for auth and scoping; worker tests against a fake broker; for the agent, a recorded set of prompts with the tool calls they should produce, run in CI so a prompt change that breaks a tool path is caught before deploy.",
    deployment: "Docker Compose locally; a one-command deploy to a VM with health checks; secrets come from the environment only, never from the repository.",
    success: "A deployed URL where a logged-in user can start an agent run, watch it call tools and see the memory it kept, plus a CI run that blocks a deploy when a transcript fails. Run counts and latency: Metric needed.",
    explain: "Why agent runs go through Celery instead of executing inside the request; how tool inputs are validated and what the step and cost caps are; where memory lives and how it is scoped per user; how the regression suite stays honest when the model is non-deterministic."
  },
  {
    id: "proj-systems",
    name: "Telecom Observability Tool",
    tagline: "Systems and CI/CD depth applied to the domain you already know.",
    status: "planned",
    why: "The differentiator no generic AI candidate can copy. Turns two years of 4G/5G and Jenkins work into something reviewable, and gives every interview a story nobody else in the pipeline has.",
    stack: ["Python", "C/C++", "Linux", "Jenkins", "Metrics pipeline"],
    headline: "Telecom log and metric analysis with alerting, built on real domain knowledge.",
    taskIds: ["cs-net-1", "cs-os-3", "be-deploy-1"],
    problem: "Telecom stacks produce logs and KPI streams that take an experienced engineer to read. This tool ingests them, parses the protocol layers you already work with, and raises alerts that name the likely failure, in the one domain where you have context nobody else in the pipeline has.",
    architecture: "Python ingestion for logs and metrics, with a C/C++ parser on the hot path if volume demands it; a metrics pipeline into a time-series store; alert rules evaluated on a schedule with a written reason per rule; a Jenkins pipeline that builds, tests and packages it on Linux.",
    milestones: [
      "Define the log formats and KPIs it reads, using synthetic or anonymised samples only, never company data",
      "Parser and ingestion in Python, with a test corpus checked in",
      "Metrics pipeline and one dashboard",
      "Alert rules, each with a one-line reason it fires",
      "Jenkins pipeline: build, test, package",
      "README with the failure story it is built to catch"
    ],
    testing: "A fixed corpus of sample logs with known failures; every alert rule has a test proving it fires on its case and stays quiet on the rest. The C/C++ path gets a benchmark on Linux so the hand-off from Python is justified by a number (Metric needed).",
    deployment: "Packaged by Jenkins into a versioned artefact; runs as a systemd service on a Linux box; metrics scraped on an interval.",
    success: "Every failure in the test corpus is detected with a named reason, the false-alert rate on the quiet corpus is measured (Metric needed), and the README reads as a story an interviewer can follow.",
    explain: "Which protocol layers it parses and why those; how an alert is kept from firing on noise; where Python stops and C/C++ starts and what that bought (Metric needed); how the Jenkins pipeline is structured; how it relates to the KPI pod and ELK pipeline work from your job."
  }
];

// src/data/projects/shipped.ts
var SHIPPED_PROJECTS = [
  {
    id: "proj-voice",
    name: "AI Voice Caller",
    tagline: "A voice receptionist that serves more than one business from one deployment.",
    status: "shipped",
    why: "Shipped client work that covers the three things AI-engineer interviewers press on: isolation between tenants, a real-time latency budget, and retrieval grounded in the documents each customer supplies.",
    stack: ["Multi-tenant", "STT \u2192 LLM \u2192 TTS streaming", "RAG knowledge base"],
    headline: "A streaming speech-to-text, LLM and text-to-speech pipeline with a per-stage latency budget, isolated per tenant.",
    taskIds: ["proj-writeup"],
    problem: "Each business wants a receptionist that knows its own documents and answers in real time, with no data or load leaking between tenants.",
    architecture: "Tenant isolation at the data and configuration level; a streaming pipeline from speech-to-text into the LLM and out through text-to-speech, budgeted stage by stage; tenant documents indexed into a RAG knowledge base the LLM answers from.",
    milestones: [
      "Write down the latency budget per stage (STT, LLM, TTS) as measured on a real call, not estimated (Metric needed)",
      "Document the tenant isolation model: what is separated, where, and how a cross-tenant read is prevented",
      "Describe the ingestion path from tenant documents into the RAG knowledge base, and how a changed document is refreshed",
      "Record a short demo call and link it from the README",
      "Write the two-minute interview answer and say it out loud once"
    ],
    testing: "To write up: how isolation was checked across two tenants, and how end-to-end latency was measured on a real call. If the check was manual, write the manual plan down and say so.",
    deployment: "To write up: where it runs, how a new tenant is onboarded, and what a deploy touches.",
    success: "The write-up answers the three deep-dive prompts with evidence: isolation shown, the latency budget stated per stage (Metric needed), and the document-to-answer path drawn.",
    explain: "Multi-tenant isolation; the streaming STT \u2192 LLM \u2192 TTS latency budget; how tenant documents feed the RAG knowledge base."
  },
  {
    id: "proj-realestate",
    name: "Real Estate Listing Portal",
    tagline: "A listing portal with role-scoped access, background workers and WhatsApp lead capture.",
    status: "shipped",
    why: "Shipped client work that shows backend depth: a large relational schema, authorisation that is scoped rather than flat, and an asynchronous path from a WhatsApp message to a tracked lead.",
    stack: ["PostgreSQL, 48 tables", "Scoped RBAC", "Redis workers", "WhatsApp to leads"],
    headline: "A 48-table PostgreSQL schema with scoped RBAC, Redis workers, and WhatsApp messages that become leads.",
    taskIds: ["proj-writeup"],
    problem: "Different roles need different views of the same listings, and inbound WhatsApp messages have to become tracked leads without anyone copying them across by hand.",
    architecture: "A 48-table PostgreSQL schema; role-based access scoped to what each role may see and change; Redis-backed workers for background jobs; WhatsApp messages received and turned into lead records.",
    milestones: [
      "Draw the schema at the level of its main entities and explain why it needed 48 tables",
      "Document the RBAC model with one example per role of something it can and cannot do",
      "List what the Redis workers do and what happens when one fails mid-job",
      "Trace one WhatsApp message to a lead record, step by step",
      "Write the two-minute interview answer and say it out loud once"
    ],
    testing: "To write up: how the RBAC rules were tested across roles, and how the WhatsApp-to-lead path was verified end to end.",
    deployment: "To write up: where it runs, how migrations for a schema this size were applied safely, and how a worker is restarted.",
    success: "The write-up answers the deep-dive prompt with a drawn schema, a worked RBAC example, a worker failure story and one traced lead. Lead volume: Metric needed.",
    explain: "The 48-table PostgreSQL schema, scoped RBAC, Redis workers, and how WhatsApp messages become leads."
  },
  {
    id: "proj-vision",
    name: "Real Vision AI",
    tagline: "Object detection over many camera feeds on edge hardware, with LLM search over what was recorded.",
    status: "shipped",
    why: "Shipped client work that pairs a vision model with real deployment constraints: edge latency, many concurrent feeds, and a plain-language interface over recorded events.",
    stack: ["YOLOv8", "Edge NPU / GPU", "Many camera feeds", "LLM search over events"],
    headline: "YOLOv8 on edge NPU and GPU across many camera feeds, with an LLM that searches the recorded events.",
    taskIds: ["proj-writeup"],
    problem: "Many cameras produce more footage than anyone watches. Detection has to run on edge hardware inside a latency budget, and the events it records have to be searchable in plain language afterwards.",
    architecture: "YOLOv8 for detection, run on edge NPU or GPU; a feed layer that handles many camera streams at once; detected events recorded and made searchable through an LLM that queries the event log.",
    milestones: [
      "Write the reason YOLOv8 was chosen over the alternatives you considered",
      "Record measured latency per frame on the edge NPU and on the GPU (Metric needed)",
      "Document how many feeds one box handles and what degrades first (Metric needed)",
      "Describe how an LLM query maps to recorded events, with one worked example",
      "Write the two-minute interview answer and say it out loud once"
    ],
    testing: "To write up: how detection quality was checked on real footage, and how latency was measured on each device.",
    deployment: "To write up: what runs on the edge device, what runs elsewhere, and how a new camera is added.",
    success: "The write-up answers the four deep-dive prompts with evidence; latency and feed counts are measured numbers, not estimates (Metric needed until they are).",
    explain: "Why YOLOv8; latency on edge NPU/GPU; handling many camera feeds; how the LLM search over recorded events works."
  }
];

// src/data/tasks/projects.ts
var PROJECTS = [...PORTFOLIO_PROJECTS, ...SHIPPED_PROJECTS];
var PROJECT_TASKS = [
  {
    id: "proj-rag-ship",
    title: "Production RAG Service \u2014 deployed, documented, defensible",
    track: "project",
    priority: "P0",
    estMinutes: 600,
    careerValue: 10,
    difficulty: "advanced",
    proof: "project",
    targetRole: "ai-engineer",
    prereqs: ["ai-eval-1", "ai-serve-1"],
    interviewCritical: true,
    portfolioCritical: true,
    optional: false,
    rationale: "The single artefact most likely to carry an AI Engineer screen. Prioritise it over any additional course."
  },
  {
    id: "proj-agent-ship",
    title: "AI + Backend Platform \u2014 auth, queues, agent loop, deployed",
    track: "project",
    priority: "P1",
    estMinutes: 600,
    careerValue: 9,
    difficulty: "advanced",
    proof: "project",
    targetRole: "both",
    prereqs: ["ai-agent-1", "be-auth-1"],
    interviewCritical: false,
    portfolioCritical: true,
    optional: false
  },
  {
    id: "proj-systems-ship",
    title: "Telecom Observability Tool \u2014 the differentiator project",
    track: "project",
    priority: "P2",
    estMinutes: 480,
    careerValue: 8,
    difficulty: "advanced",
    proof: "project",
    targetRole: "sde",
    interviewCritical: false,
    portfolioCritical: true,
    optional: false,
    rationale: "High signal but lower urgency than the RAG service. Build it in Month 3 if the schedule holds."
  },
  {
    id: "proj-writeup",
    title: "Write each project up \u2014 problem, decisions, tradeoffs, measured result",
    track: "project",
    priority: "P0",
    estMinutes: 180,
    careerValue: 9,
    difficulty: "core",
    proof: "notes",
    targetRole: "both",
    interviewCritical: true,
    portfolioCritical: true,
    optional: false,
    rationale: "An unexplained project is worth roughly nothing in a loop. The write-up is what makes it usable in an interview answer."
  }
];

// src/data/tasks/systems.ts
var SYSTEMS_TASKS = [
  {
    id: "sys-conc-1",
    title: "Concurrency in C++ \u2014 threads, atomics, memory ordering",
    track: "systems",
    priority: "P1",
    estMinutes: 120,
    careerValue: 8,
    difficulty: "advanced",
    proof: "implement",
    targetRole: "sde",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Extends the C++ you already write. Memory ordering is where systems interviews separate users of threads from people who understand them."
  },
  {
    id: "sys-perf-1",
    title: "Profiling and debugging \u2014 perf, gdb, valgrind, strace",
    track: "systems",
    priority: "P1",
    estMinutes: 120,
    careerValue: 8,
    difficulty: "advanced",
    proof: "implement",
    targetRole: "sde",
    interviewCritical: false,
    portfolioCritical: true,
    optional: false,
    rationale: "Debugging stories are the most credible material in a behavioural round, and you generate them at work already."
  },
  {
    id: "sys-mem-1",
    title: "Memory layout, cache behaviour, false sharing",
    track: "systems",
    priority: "P2",
    estMinutes: 90,
    careerValue: 7,
    difficulty: "advanced",
    proof: "notes",
    targetRole: "sde",
    prereqs: ["sys-conc-1"],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  },
  {
    id: "sys-sock-1",
    title: "Socket programming at depth \u2014 non-blocking I/O, epoll, timeouts",
    track: "systems",
    priority: "P1",
    estMinutes: 120,
    careerValue: 8,
    difficulty: "advanced",
    proof: "implement",
    targetRole: "sde",
    interviewCritical: false,
    portfolioCritical: true,
    optional: false,
    rationale: "Direct overlap with telecom stack work, and the foundation for explaining how any server actually handles concurrency."
  },
  {
    id: "sys-linux-1",
    title: "Linux internals \u2014 namespaces, cgroups, and what a container really is",
    track: "systems",
    priority: "P1",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "advanced",
    proof: "notes",
    targetRole: "both",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Turns Docker from a tool you use into a mechanism you can explain \u2014 a common follow-up once you mention containers."
  }
];
var DEVOPS_TASKS = [
  {
    id: "ops-cicd-1",
    title: "Pipeline architecture \u2014 parallel stages, caching, artefact promotion",
    track: "devops",
    priority: "P1",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "advanced",
    proof: "implement",
    targetRole: "both",
    interviewCritical: false,
    portfolioCritical: true,
    optional: false,
    rationale: "You already own Jenkins at work. Framing it as pipeline architecture rather than tool usage is what makes it resume-grade."
  },
  {
    id: "ops-k8s-1",
    title: "Kubernetes fundamentals \u2014 pods, services, deployments, probes",
    track: "devops",
    priority: "P2",
    estMinutes: 150,
    careerValue: 7,
    difficulty: "core",
    proof: "implement",
    targetRole: "both",
    prereqs: ["sys-linux-1"],
    interviewCritical: false,
    portfolioCritical: true,
    optional: false
  },
  {
    id: "ops-obs-1",
    title: "Observability \u2014 structured logs, metrics, traces, useful alerts",
    track: "devops",
    priority: "P1",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "core",
    proof: "implement",
    targetRole: "both",
    interviewCritical: false,
    portfolioCritical: true,
    optional: false
  },
  {
    id: "ops-cloud-1",
    title: "Cloud fundamentals \u2014 compute, storage, networking, IAM, cost",
    track: "devops",
    priority: "P2",
    estMinutes: 120,
    careerValue: 7,
    difficulty: "core",
    proof: "notes",
    targetRole: "both",
    interviewCritical: false,
    portfolioCritical: false,
    optional: false
  }
];
var TELECOM_TASKS = [
  {
    id: "tel-arch-1",
    title: "4G/5G architecture \u2014 explain the full call flow end to end",
    track: "telecom",
    priority: "P1",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "advanced",
    proof: "notes",
    targetRole: "sde",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Two years of this is your least copyable asset. Being able to narrate a call flow cleanly turns a job description line into a real differentiator."
  },
  {
    id: "tel-proto-1",
    title: "Protocol depth \u2014 the layers you touch, and the tradeoffs in each",
    track: "telecom",
    priority: "P2",
    estMinutes: 90,
    careerValue: 7,
    difficulty: "advanced",
    proof: "notes",
    targetRole: "sde",
    interviewCritical: false,
    portfolioCritical: false,
    optional: false
  },
  {
    id: "tel-story-1",
    title: "Three telecom engineering stories, written in STAR form",
    track: "telecom",
    priority: "P0",
    estMinutes: 90,
    careerValue: 9,
    difficulty: "core",
    proof: "notes",
    targetRole: "both",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Amazon runs behavioural rounds against its leadership principles and expects specific examples. Your hardest telecom debugs are the raw material \u2014 they just need to be written down before you need them."
  }
];

// src/data/tasks/mlops.ts
var MLOPS_TASKS = [
  {
    id: "ops-mlops-1",
    title: "MLOps lifecycle \u2014 maturity levels, and where your work actually sits",
    track: "ai",
    priority: "P1",
    estMinutes: 90,
    careerValue: 7,
    difficulty: "core",
    proof: "notes",
    targetRole: "ai-engineer",
    source: "5ME MLOps",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "Reuses the CI/CD instincts you already own from Jenkins \u2014 same discipline, applied to a model instead of a build."
  },
  {
    id: "ops-mlops-2",
    title: "DVC \u2014 versioning datasets and models alongside code",
    track: "ai",
    priority: "P2",
    estMinutes: 90,
    careerValue: 6,
    difficulty: "core",
    proof: "implement",
    targetRole: "ai-engineer",
    source: "5ME MLOps",
    interviewCritical: false,
    portfolioCritical: true,
    optional: false
  },
  {
    id: "ops-mlops-3",
    title: "Model serving \u2014 batch vs real-time, FastAPI over Flask, containerised",
    track: "ai",
    priority: "P0",
    estMinutes: 150,
    careerValue: 9,
    difficulty: "advanced",
    proof: "implement",
    targetRole: "ai-engineer",
    source: "5ME MLOps",
    prereqs: ["be-fastapi-1"],
    interviewCritical: true,
    portfolioCritical: true,
    optional: false,
    rationale: "The question that separates someone who trained a model from someone who shipped one."
  },
  {
    id: "ops-llmops-1",
    title: "LLMOps vs MLOps \u2014 why LLM systems need their own lifecycle",
    track: "ai",
    priority: "P1",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "advanced",
    proof: "notes",
    targetRole: "ai-engineer",
    source: "5ME LLMOps",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  },
  {
    id: "ops-llmops-2",
    title: "LLM selection \u2014 open vs closed, context window, cost/performance tradeoff",
    track: "ai",
    priority: "P1",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "core",
    proof: "notes",
    targetRole: "ai-engineer",
    source: "5ME LLMOps",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "A live design question in most AI interviews: which model, and defend the choice on cost and latency, not preference."
  },
  {
    id: "ops-llmops-3",
    title: "Prompt management \u2014 versioning, templates, a prompt registry, regression tests",
    track: "ai",
    priority: "P1",
    estMinutes: 120,
    careerValue: 8,
    difficulty: "advanced",
    proof: "implement",
    targetRole: "ai-engineer",
    source: "5ME LLMOps",
    interviewCritical: false,
    portfolioCritical: true,
    optional: false,
    rationale: "Almost nobody does this, and it is exactly what makes an LLM system maintainable rather than a pile of strings."
  },
  {
    id: "ops-ft-1",
    title: "Fine-tuning \u2014 when to, and when prompting or RAG is the cheaper answer",
    track: "ai",
    priority: "P1",
    estMinutes: 90,
    careerValue: 8,
    difficulty: "advanced",
    proof: "notes",
    targetRole: "ai-engineer",
    source: "5ME Fine-Tuning",
    interviewCritical: true,
    portfolioCritical: false,
    optional: false
  },
  {
    id: "ops-ft-2",
    title: "PEFT, LoRA and QLoRA \u2014 the mechanism, not just the acronyms",
    track: "ai",
    priority: "P2",
    estMinutes: 150,
    careerValue: 7,
    difficulty: "advanced",
    proof: "notes",
    targetRole: "ai-engineer",
    source: "5ME Fine-Tuning",
    prereqs: ["ops-ft-1"],
    interviewCritical: false,
    portfolioCritical: false,
    optional: false
  },
  {
    id: "ops-sysdes-ai-1",
    title: "System design for AI systems \u2014 ingestion, indexing, serving, evaluation, cost",
    track: "ai",
    priority: "P0",
    estMinutes: 150,
    careerValue: 10,
    difficulty: "advanced",
    proof: "exercise",
    targetRole: "ai-engineer",
    source: "5ME System Design for AI",
    prereqs: ["ai-eval-1"],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: "The AI-role equivalent of a classic system design round, and the highest-leverage module in the whole bootcamp for your target."
  }
];

// src/data/tasks/phasing.ts
var PHASE_OVERRIDES = {
  // ---- phase 3: interview-level work, once the fundamentals are in ----
  "cs-sd-2": "m3",
  "cs-sd-3": "m3",
  "cs-sd-4": "m3",
  "cs-sd-5": "m3",
  "cs-sd-6": "m3",
  "cs-sd-7": "m3",
  "ai-sd-1": "m3",
  "ops-sysdes-ai-1": "m3",
  "dsa-timed-1": "m3",
  "dsa-revision-1": "m3",
  "cs-oop-2": "m3",
  // Flagship projects ship in phase 3 — they need the phase-2 skills first.
  "proj-rag-ship": "m3",
  "proj-agent-ship": "m3",
  "proj-systems-ship": "m3",
  // Java is interview optionality; it should never precede AI or DSA work.
  "java-1": "m3",
  "java-2": "m3",
  "java-3": "m3",
  "java-4": "m3",
  // Advanced LLMOps depth, once serving and evaluation exist.
  "ops-llmops-3": "m3",
  "ops-ft-1": "m3",
  "ops-ft-2": "m3",
  // ---- phase 4: execution only ----
  "dsa-amazon-1": "m4",
  "dsa-google-1": "m4",
  "proj-writeup": "m4",
  "tel-story-1": "m4"
};
function withPhasing(tasks) {
  return tasks.map((t) => {
    const phase = PHASE_OVERRIDES[t.id];
    return phase ? { ...t, earliestPhase: phase } : { ...t, earliestPhase: "m2" };
  });
}

// src/data/tasks/index.ts
var ALL_TASKS = withPhasing([
  ...AI_TASKS,
  ...MLOPS_TASKS,
  ...DSA_TASKS,
  ...DSA_META_TASKS,
  ...CS_TASKS,
  ...BACKEND_TASKS,
  ...JAVA_TASKS,
  ...REACT_TASKS,
  ...SYSTEMS_TASKS,
  ...DEVOPS_TASKS,
  ...TELECOM_TASKS,
  ...PROJECT_TASKS
]);
var byId = new Map(ALL_TASKS.map((t) => [t.id, t]));
function taskById(id) {
  return byId.get(id);
}

// src/engine/priority.ts
var PRIORITY_BONUS = {
  P0: 45,
  P1: 25,
  P2: 8,
  P3: 0
};
var INTERVIEW_WEIGHT_BY_PHASE = {
  m1: 5,
  m2: 10,
  m3: 20,
  m4: 25
};
var PORTFOLIO_WEIGHT_BY_PHASE = {
  m1: 0,
  m2: 15,
  m3: 15,
  m4: 5
};
function unmetPrereqs(task, state) {
  if (!task.prereqs?.length) return [];
  return task.prereqs.filter((id) => state.tasks[id]?.status !== "done");
}
function scoreTask(task, ctx) {
  const reasons = [];
  const blockedBy = unmetPrereqs(task, ctx.state);
  const status = ctx.state.tasks[task.id]?.status ?? "todo";
  const add = (label, points) => {
    if (points !== 0) reasons.push({ label, points });
  };
  add("Career value", task.careerValue * 8);
  add(`Priority ${task.priority}`, PRIORITY_BONUS[task.priority]);
  if (task.interviewCritical) {
    add("Interview-critical", INTERVIEW_WEIGHT_BY_PHASE[ctx.phase.id]);
  }
  if (task.portfolioCritical) {
    add("Portfolio-critical", PORTFOLIO_WEIGHT_BY_PHASE[ctx.phase.id]);
  }
  if (status === "in_progress") add("Already in progress", 18);
  if (task.track === "dsa") {
    const hit = ctx.weakPatterns.find((p) => task.id.includes(`dsa-${p}-`));
    if (hit) add("Weak pattern \u2014 needs work", 30);
  }
  add("Time cost", -Math.round(task.estMinutes / 20));
  const phaseOrder = { m1: 1, m2: 2, m3: 3, m4: 4 };
  const earliest = task.earliestPhase ?? "m2";
  if (phaseOrder[earliest] > phaseOrder[ctx.phase.id]) {
    add(`Belongs to ${earliest.toUpperCase()}`, -70);
  }
  if (ctx.behindSchedule) {
    if (task.priority === "P2") add("Behind schedule \u2014 deprioritised", -25);
    if (task.priority === "P3") add("Behind schedule \u2014 shed", -60);
  }
  const score = reasons.reduce((sum, r) => sum + r.points, 0);
  return {
    task,
    score,
    reasons,
    blocked: blockedBy.length > 0,
    blockedBy
  };
}
function rankTasks(ctx) {
  return ALL_TASKS.filter((t) => {
    const status = ctx.state.tasks[t.id]?.status;
    return status !== "done" && status !== "skipped";
  }).map((t) => scoreTask(t, ctx)).filter((s) => !s.blocked).sort((a, b) => b.score - a.score);
}

// src/engine/dsa.ts
var DAY_MS = 864e5;
function daysBetween2(from, to) {
  return Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / DAY_MS);
}
function patternStats(state) {
  const today = todayISO();
  const byPattern = /* @__PURE__ */ new Map();
  for (const a of state.dsa) {
    const list = byPattern.get(a.pattern) ?? [];
    list.push(a);
    byPattern.set(a.pattern, list);
  }
  return DSA_PATTERNS.map((pattern) => {
    const attempts = byPattern.get(pattern.id) ?? [];
    const solved = attempts.filter((a) => a.outcome === "solved").length;
    const hinted = attempts.filter((a) => a.outcome === "solved_with_hint").length;
    const failed = attempts.filter((a) => a.outcome === "failed").length;
    const uniqueProblems = new Set(attempts.map((a) => a.problem.toLowerCase().trim())).size;
    const accuracy = attempts.length === 0 ? 1 : solved / attempts.length;
    const avgMinutes = attempts.length === 0 ? 0 : Math.round(attempts.reduce((s, a) => s + a.minutes, 0) / attempts.length);
    const dates = attempts.map((a) => a.date).sort();
    const lastPracticed = dates.at(-1);
    const daysSincePractice = lastPracticed ? daysBetween2(lastPracticed, today) : 999;
    const coverage = Math.min(1, uniqueProblems / pattern.targetProblems);
    const inaccuracy = (1 - accuracy) * 45;
    const gap = (1 - coverage) * 35;
    const staleness = Math.min(20, daysSincePractice * 1.4);
    const weight = pattern.weight / 10;
    const weaknessScore = Math.round((inaccuracy + gap + staleness) * weight);
    return {
      pattern,
      attempts: attempts.length,
      solved,
      hinted,
      failed,
      accuracy,
      avgMinutes,
      uniqueProblems,
      lastPracticed,
      daysSincePractice,
      weaknessScore,
      coverage
    };
  }).sort((a, b) => b.weaknessScore - a.weaknessScore);
}
function weakPatternIds(state, count2 = 4) {
  return patternStats(state).filter((s) => s.weaknessScore > 25).slice(0, count2).map((s) => s.pattern.id);
}
function dsaTotals(state) {
  const all = state.dsa;
  const today = todayISO();
  const last7 = all.filter((a) => daysBetween2(a.date, today) < 7).length;
  const solvedClean = all.filter((a) => a.outcome === "solved").length;
  return {
    total: all.length,
    easy: all.filter((a) => a.difficulty === "easy").length,
    medium: all.filter((a) => a.difficulty === "medium").length,
    hard: all.filter((a) => a.difficulty === "hard").length,
    solvedClean,
    accuracy: all.length === 0 ? 0 : solvedClean / all.length,
    last7,
    avgMinutes: all.length === 0 ? 0 : Math.round(all.reduce((s, a) => s + a.minutes, 0) / all.length)
  };
}
function dsaStreak(state) {
  const days = new Set(state.dsa.map((a) => a.date));
  let streak = 0;
  const cursor = parseDay(todayISO());
  if (!days.has(todayISO())) cursor.setDate(cursor.getDate() - 1);
  for (; ; ) {
    const iso2 = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (!days.has(iso2)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// src/engine/scoring.ts
function plannedHits(state, date) {
  const log = state.days[date];
  if (!log) return 0;
  const planned = new Set(log.planned);
  return log.completed.filter((id) => planned.has(id)).length;
}
function dayExtras(state, date) {
  const log = state.days[date];
  if (!log) return 0;
  const planned = new Set(log.planned);
  return log.completed.filter((id) => !planned.has(id)).length;
}
function dayScore(state, date) {
  const log = state.days[date];
  if (!log || log.planned.length === 0) return void 0;
  return Math.min(100, Math.round(plannedHits(state, date) / log.planned.length * 100));
}
function executionStreak(state) {
  let streak = 0;
  const today = todayISO();
  for (let i = 0; i < 365; i += 1) {
    const date = addDays(today, -i);
    const score = dayScore(state, date);
    if (score === void 0) {
      if (i === 0) continue;
      break;
    }
    if (score < 50) break;
    streak += 1;
  }
  return streak;
}
function isBehindSchedule(state) {
  const today = todayISO();
  let planned = 0;
  let hits = 0;
  for (let i = 1; i <= 7; i += 1) {
    const date = addDays(today, -i);
    const log = state.days[date];
    if (!log) continue;
    planned += log.planned.length;
    hits += plannedHits(state, date);
  }
  if (planned < 5) return false;
  return hits / planned < 0.5;
}

// src/engine/planner.ts
var MISSIONS_PER_DAY = 3;
var CARRY_LOOKBACK_DAYS = 7;
function isDone(state, id) {
  const task = state.tasks[id]?.status;
  return Boolean(state.foundation[id]) || task === "done" || task === "skipped";
}
function carriedOver(state, date) {
  const out = /* @__PURE__ */ new Map();
  for (let i = 1; i <= CARRY_LOOKBACK_DAYS; i += 1) {
    const d = addDays(date, -i);
    const log = state.days[d];
    if (!log) continue;
    for (const id of log.planned) {
      if (!out.has(id) && !isDone(state, id)) out.set(id, d);
    }
  }
  return out;
}
function openInTier(state, tier) {
  const subjects = FOUNDATION_SUBJECTS.filter((s) => s.tier === tier);
  const queues = subjects.map(
    (subject) => subject.milestones.filter((m) => m.mandatory && !state.foundation[m.id]).map((milestone) => ({ subject, milestone }))
  );
  if (SEQUENTIAL_TIERS.has(tier)) return queues.flat();
  const out = [];
  const longest = Math.max(0, ...queues.map((q) => q.length));
  for (let i = 0; i < longest; i += 1) {
    for (const q of queues) {
      const slot = q[i];
      if (slot) out.push(slot);
    }
  }
  return out;
}
function nextFoundationMissions(state, date) {
  const carried = carriedOver(state, date);
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  const take = ({ subject, milestone }) => {
    if (out.length >= MISSIONS_PER_DAY || seen.has(milestone.id)) return;
    seen.add(milestone.id);
    out.push({ kind: "foundation", subject, milestone, carriedFrom: carried.get(milestone.id) });
  };
  const everything = FOUNDATION_SUBJECTS.flatMap(
    (subject) => subject.milestones.map((milestone) => ({ subject, milestone }))
  );
  for (const s of everything) {
    if (carried.has(s.milestone.id) && !state.foundation[s.milestone.id]) take(s);
  }
  for (const tier of [1, 2, 3]) openInTier(state, tier).forEach(take);
  for (const s of everything) if (!state.foundation[s.milestone.id]) take(s);
  return out;
}
function nextTaskMissions(state, ctx) {
  const carried = carriedOver(state, ctx.date);
  const ranked = rankTasks({
    state,
    phase: ctx.phase,
    weakPatterns: weakPatternIds(state),
    behindSchedule: isBehindSchedule(state)
  });
  const ordered = [
    ...ranked.filter((s) => carried.has(s.task.id)),
    ...ranked.filter((s) => !carried.has(s.task.id))
  ];
  return ordered.slice(0, MISSIONS_PER_DAY).map((scored) => ({ kind: "task", scored, carriedFrom: carried.get(scored.task.id) }));
}
function buildDsaMission(state, ctx) {
  const target = state.settings.dsaTargetPerDay;
  if (ctx.isSunday) {
    return {
      headline: "Weekly timed set",
      note: "Three problems under time, no hints. Log your solve times \u2014 that number is the one that matters.",
      target: 3
    };
  }
  const weak = weakPatternIds(state, 1);
  if (weak.length > 0) {
    const stats = patternStats(state).find((s) => s.pattern.id === weak[0]);
    if (stats) {
      return {
        headline: `${stats.pattern.name} \u2014 ${target} problems`,
        pattern: stats.pattern.id,
        note: `Flagged as your weakest pattern. ${stats.uniqueProblems} of ${stats.pattern.targetProblems} covered so far.`,
        target
      };
    }
  }
  return {
    headline: `${target} problems, pattern-tagged`,
    note: "Then re-solve one older problem cold. Retention is the metric, not the running total.",
    target
  };
}
function buildPlan(state, day = currentDay()) {
  const ctx = dayContext(day);
  const gateOpen = gateStatus(state).unlocked;
  const missions = gateOpen ? nextTaskMissions(state, ctx) : nextFoundationMissions(state, ctx.date);
  const plannedIds = missions.map(
    (m) => m.kind === "foundation" ? m.milestone.id : m.scored.task.id
  );
  return {
    ctx,
    gateOpen,
    missions,
    dsa: buildDsaMission(state, ctx),
    completedToday: state.days[ctx.date]?.completed ?? [],
    plannedIds,
    estimatedMinutes: missions.reduce(
      (sum, m) => sum + (m.kind === "task" ? m.scored.task.estMinutes : m.milestone.estMinutes),
      0
    ),
    carriedCount: missions.filter((m) => m.carriedFrom).length
  };
}

// src/engine/today-items.ts
function amazonSlotItems(plan) {
  return plan.planned.map((p) => ({
    id: p.id,
    title: p.revision ? `Re-solve cold: ${p.item.title}` : p.item.title,
    context: p.revision ? "Revision" : p.item.type === "lc" ? p.item.topic : p.item.kind,
    minutes: p.minutes,
    kind: p.revision ? "revision" : "amazon"
  }));
}
function generalSlotItems(plan) {
  const dsa = {
    id: "dsa-today",
    title: plan.dsa.headline,
    context: "DSA",
    minutes: plan.dsa.target * 25,
    kind: "dsa"
  };
  const low = /* @__PURE__ */ new Set(["watch", "notes"]);
  const missions = plan.missions.map(
    (m) => m.kind === "foundation" ? {
      id: m.milestone.id,
      title: m.milestone.title,
      context: m.subject.name,
      minutes: m.milestone.estMinutes,
      kind: low.has(m.milestone.proof) ? "course" : "build",
      carried: Boolean(m.carriedFrom)
    } : {
      id: m.scored.task.id,
      title: m.scored.task.title,
      context: m.scored.task.track,
      minutes: m.scored.task.estMinutes,
      kind: low.has(m.scored.task.proof) ? "course" : "build",
      carried: Boolean(m.carriedFrom)
    }
  );
  return [dsa, ...missions];
}
function todayWork(state, date = todayISO()) {
  const info = programInfo(state, date);
  if (!info.started || info.phase === "amazon") {
    const amazon = buildAmazonDay(state, date);
    return {
      phase: info.started ? "amazon" : "not-started",
      items: amazonSlotItems(amazon),
      amazon,
      focus: amazon.focus,
      minutes: amazon.totalMinutes,
      plannedIds: amazon.plannedIds
    };
  }
  const general = buildPlan(state, clampDay(dayForDate(date)));
  const items = generalSlotItems(general);
  const minutes = items.reduce((n, i) => n + i.minutes, 0);
  const lead = general.missions[0];
  const focus = lead ? lead.kind === "foundation" ? `${lead.subject.name} \xB7 ${lead.milestone.title}` : lead.scored.task.title : "Roadmap";
  return { phase: "general", items, general, focus: `${focus} \xB7 ${formatHM(minutes)}`, minutes, plannedIds: general.plannedIds };
}

// src/engine/praise.ts
function statsFor(state, date) {
  const attempts = state.dsa.filter((a) => a.date === date);
  const runs = state.runs.filter((r) => r.date === date);
  const log = state.days[date];
  return {
    dsa: attempts.length,
    clean: attempts.filter((a) => a.outcome === "solved").length,
    runs: runs.length,
    km: Number(runs.reduce((n, r) => n + (r.km ?? 0), 0).toFixed(1)),
    focus: state.deepWork.filter((d) => d.date === date).reduce((n, d) => n + d.actualMinutes, 0),
    // Planned work closed. The raw tick count produced "cleared 24 of 3".
    completed: plannedHits(state, date),
    planned: log?.planned.length ?? 0,
    score: dayScore(state, date)
  };
}
function priorBest(state, date, pick) {
  const dates = /* @__PURE__ */ new Set([
    ...state.dsa.map((a) => a.date),
    ...state.runs.map((r) => r.date),
    ...state.deepWork.map((d) => d.date),
    ...Object.keys(state.days)
  ]);
  let best = 0;
  for (const d of dates) {
    if (d >= date) continue;
    best = Math.max(best, pick(statsFor(state, d)));
  }
  return best;
}
function buildPraise(state, date = todayISO()) {
  const today = statsFor(state, date);
  const yesterday = statsFor(state, addDays(date, -1));
  const wins = [];
  if (yesterday.dsa === 0 && today.dsa > 0) {
    wins.push({
      kind: "breakthrough",
      label: "DSA is off zero",
      detail: `Yesterday: nothing logged. Today: ${today.dsa}. Starting again is the hard part and you did it.`
    });
  }
  if (yesterday.focus === 0 && today.focus > 0) {
    wins.push({
      kind: "breakthrough",
      label: "Focused work is back",
      detail: `${today.focus} minutes of deep work after a day with none.`
    });
  }
  if (yesterday.runs === 0 && today.runs > 0) {
    wins.push({
      kind: "breakthrough",
      label: "Back to running",
      detail: `${today.km} km after a rest day.`
    });
  }
  if (yesterday.dsa > 0 && today.dsa > yesterday.dsa) {
    wins.push({
      kind: "improvement",
      label: "More DSA than yesterday",
      detail: `${yesterday.dsa} \u2192 ${today.dsa} problems.`
    });
  }
  if (today.score !== void 0 && yesterday.score !== void 0 && today.score > yesterday.score) {
    wins.push({
      kind: "improvement",
      label: "Better day than yesterday",
      detail: `${yesterday.score}% \u2192 ${today.score}% of what you planned.`
    });
  }
  if (yesterday.focus > 0 && today.focus > yesterday.focus) {
    wins.push({
      kind: "improvement",
      label: "Longer focus",
      detail: `${yesterday.focus} \u2192 ${today.focus} minutes.`
    });
  }
  const bestDsa = priorBest(state, date, (s) => s.dsa);
  if (today.dsa > 0 && today.dsa > bestDsa) {
    wins.push({
      kind: "best",
      label: "Most DSA in a single day",
      detail: `${today.dsa} problems \u2014 your highest yet.`
    });
  }
  const bestFocus = priorBest(state, date, (s) => s.focus);
  if (today.focus > 0 && today.focus > bestFocus) {
    wins.push({
      kind: "best",
      label: "Longest focused day",
      detail: `${today.focus} minutes \u2014 a new high.`
    });
  }
  const execStreak = executionStreak(state);
  const dsaDays = dsaStreak(state);
  if (dsaDays >= 3) {
    wins.push({
      kind: "consistency",
      label: `${dsaDays}-day DSA streak`,
      detail: dsaDays >= 14 ? "Two weeks unbroken. Consistency at this length is rarer than talent." : "Unbroken. This is the habit that compounds."
    });
  }
  if (today.score === 100 && today.planned > 0) {
    wins.push({
      kind: "best",
      label: "Cleared everything you planned",
      detail: `${today.completed} of ${today.planned}. A clean day.`
    });
  }
  const hasWins = wins.length > 0;
  let headline;
  let body;
  if (!hasWins) {
    if (today.completed === 0 && today.dsa === 0 && today.focus === 0) {
      headline = "Nothing logged today";
      body = "No praise for this one, because there is nothing to praise yet \u2014 and a message that congratulates you regardless would be worthless. Tomorrow, start with the smallest item on the list.";
    } else {
      headline = "Day logged";
      body = `${today.completed} of ${today.planned} closed, ${today.dsa} DSA, ${today.focus} focused minutes. Steady rather than standout \u2014 which is most days, and most days are what get you there.`;
    }
  } else if (wins.some((w) => w.kind === "breakthrough")) {
    headline = "You turned it around today";
    body = "Yesterday this was at zero. Today it is not. That restart is the single hardest move in a long plan, and you made it without anyone watching.";
  } else if (wins.some((w) => w.kind === "best")) {
    headline = "Best day so far";
    body = "Not just a good day \u2014 the best one yet. Note what was different about today, because that is the thing worth repeating.";
  } else if (execStreak >= 7) {
    headline = `${execStreak} days holding the line`;
    body = "A week of this is no longer motivation, it is a working system. Protect it.";
  } else {
    headline = "Better than yesterday";
    body = "The direction is right. Interview readiness is built from exactly this: a slightly better day, repeated.";
  }
  return {
    date,
    hasWins,
    headline,
    body,
    wins,
    score: today.score,
    yesterdayScore: yesterday.score
  };
}
export {
  AMAZON_DAYOF,
  AMAZON_DAYS,
  AMAZON_ITEMS,
  DATA_EPOCH,
  DAY_START_HOUR,
  DAY_TYPE_LABEL,
  DEFAULT_SETTINGS,
  EVENING_LINES,
  FAT_LOSS_NOTE,
  FOUNDATION_SUBJECTS,
  TARGET_DATE,
  addDays,
  amazonItem,
  amazonLoggedOn,
  amazonSlotItems,
  amazonSummary,
  buildAmazonDay,
  buildPlan,
  buildPraise,
  buildSchedule,
  coachFor,
  configureMission,
  dailyBudget,
  dayExtras,
  dayScore,
  daySlots,
  dayTypeOf,
  daysBetween,
  defaultState,
  dsaStreak,
  dsaTotals,
  executionStreak,
  exerciseSlotFor,
  fitnessStreak,
  fitnessWeek,
  formatHM,
  formatLong,
  formatShort,
  formatWeekday,
  freshForNewEpoch,
  generalSlotItems,
  isStaleEpoch,
  istClock,
  istMinutes,
  lcUrl,
  missionTotalDays,
  parseState,
  plannedHits,
  programInfo,
  quoteForDay,
  revisionsDue,
  sessionFor,
  studyCapacity,
  taskById,
  todayISO,
  todayWork,
  weekdayOf,
  weekdaySleepHours
};
