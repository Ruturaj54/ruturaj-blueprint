// Motivation that is actually about his situation.
//
// Rotated by day number so it never repeats within a phase, and selected by
// phase so month 1 gets "finish what you started" and month 4 gets "you are
// interviewing now". Generic hustle quotes were deliberately left out — they
// read as filler and get skimmed past within a week.

const MORNING = {
  m1: [
    { line: 'You are not starting from zero. You are starting from two years of shipping real systems — the gap is depth, not talent.', tag: 'Foundation' },
    { line: 'Finishing a course you already paid for beats starting a new one. Every unfinished course is a decision you deferred.', tag: 'Foundation' },
    { line: 'The people who get these offers are not smarter than you. They finished the boring middle part.', tag: 'Foundation' },
    { line: 'Watching a lecture feels like progress. Writing the code is progress. Only one of them survives an interview.', tag: 'Proof' },
    { line: 'Six weeks of foundation is not slow. Six months of half-finished courses is slow.', tag: 'Pace' },
    { line: 'You have roughly four and a half hours of required work today and eight available. The margin is the plan working, not slack to fill.', tag: 'Pace' },
    { line: 'Nobody is checking whether you opened the course today. That is exactly why it counts.', tag: 'Discipline' },
  ],
  m2: [
    { line: 'Backend depth plus AI is rare. Backend depth plus AI plus telecom systems is close to unique. That is your position — build it deliberately.', tag: 'Edge' },
    { line: 'Every DSA pattern you skip now becomes a 40-minute silence in a room with someone watching.', tag: 'DSA' },
    { line: 'An AI engineer who cannot serve the model is a notebook author. Build the service.', tag: 'AI' },
    { line: 'You will not remember what you read this month. You will remember what you built.', tag: 'Proof' },
    { line: 'The N+1 query, the GIL, the blocking call in the async handler — these are not trivia. They are the questions that separate two years from five.', tag: 'Depth' },
    { line: 'Consistency beats intensity. A four-hour night you repeat is worth more than a twelve-hour night you never repeat.', tag: 'Pace' },
  ],
  m3: [
    { line: 'You are close enough now that preparation beats learning. Drill what you know until it is fast.', tag: 'Interview' },
    { line: 'A project you cannot explain in five minutes is not a project. It is a repository.', tag: 'Proof' },
    { line: 'Amazon does not care that you planned to study. It cares what you can solve in 35 minutes with someone watching.', tag: 'Interview' },
    { line: 'System design is not memorising architectures. It is defending tradeoffs out loud without flinching.', tag: 'System design' },
    { line: 'Measured retrieval quality is the one thing on your resume most candidates cannot claim. Make sure you have the number.', tag: 'Edge' },
  ],
  m4: [
    { line: 'You are interviewing now. Learning is only useful if a loop this month will ask about it.', tag: 'Execution' },
    { line: 'Apply in waves, not one at a time. The first three loops are practice whether you intend them to be or not.', tag: 'Execution' },
    { line: 'Your telecom debugging stories are worth more than another LeetCode medium. Write them down properly.', tag: 'Behavioural' },
    { line: 'Rejection this month is data, not verdict. The loop you fail in February teaches you the one you pass in March.', tag: 'Perspective' },
  ],
};

const EVENING = {
  good: [
    'Days like this are the whole method. Nothing clever, just done.',
    'You did what you said you would. That sentence is rarer than it sounds.',
    'This is what the plan looks like when it is working. Repeat it tomorrow.',
    'Progress is not dramatic. It looks exactly like today.',
  ],
  mixed: [
    'Partial is not failure. Carry the open item and start with it tomorrow.',
    'You moved. Not as far as planned, but the direction was right.',
    'Most days are like this one. The plan survives if you do not let two become five.',
  ],
  bad: [
    'One bad day costs nothing. Two in a row starts a pattern, and patterns are what actually end plans.',
    'Today did not happen. Tomorrow starts with the smallest item on the list, not the biggest.',
    'You know exactly what went wrong today. Fix that one thing tomorrow, not everything.',
  ],
};

/** Deterministic by day, so a refresh never reshuffles the quote. */
export function morningQuote(day, phaseId) {
  const pool = MORNING[phaseId] ?? MORNING.m1;
  return pool[day % pool.length];
}

export function eveningQuote(score) {
  const pool = score === null || score === undefined ? EVENING.bad : score >= 70 ? EVENING.good : score >= 40 ? EVENING.mixed : EVENING.bad;
  return pool[new Date().getDate() % pool.length];
}
