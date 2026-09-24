// Mirrors src/engine/schedule.ts so the morning mail shows the same timetable
// the app does. Listing what to do without saying when is the difference
// between a plan and a wish.

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export function blockMinutes(start, end) {
  const a = toMinutes(start);
  const b = toMinutes(end);
  return b > a ? b - a : 24 * 60 - a + b;
}

export function formatHM(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const LOW_FOCUS = ['watch', 'notes'];
/** Must match MIN_PIECE_MINUTES in src/engine/schedule.ts. */
const MIN_PIECE_MINUTES = 30;
const DEFAULTS = {
  officeStart: '10:30',
  officeEnd: '18:00',
  officeStudyHours: 2,
  studyBlock1Start: '18:00',
  studyBlock1End: '20:00',
  eveningRunTime: '20:30',
  studyBlock2Start: '22:00',
  studyBlock2End: '02:00',
};

/**
 * `missions` carry { id, title, context, minutes, proof }. Proof decides
 * whether something is interruptible enough for office spare time.
 */
export function buildSchedule(settings, missions, dsa) {
  const s = { ...DEFAULTS, ...(settings || {}) };

  const office = {
    id: 'office',
    label: 'Office — spare capacity',
    start: s.officeStart,
    end: s.officeEnd,
    capacity: Math.round((s.officeStudyHours || 0) * 60),
    items: [],
    used: 0,
    note: 'Only if the actual work is covered. Watching and reading only.',
  };
  const block1 = {
    id: 'block1',
    label: 'Block 1 — course',
    start: s.studyBlock1Start,
    end: s.studyBlock1End,
    capacity: blockMinutes(s.studyBlock1Start, s.studyBlock1End),
    items: [],
    used: 0,
  };
  const run = {
    id: 'run',
    label: 'Evening run + dinner',
    start: s.eveningRunTime,
    end: s.studyBlock2Start,
    capacity: blockMinutes(s.eveningRunTime, s.studyBlock2Start),
    items: [],
    used: 0,
    note: 'Protected. Recovery, not slack to raid when the day runs late.',
  };
  const block2 = {
    id: 'block2',
    label: 'Block 2 — deep work',
    start: s.studyBlock2Start,
    end: s.studyBlock2End,
    capacity: blockMinutes(s.studyBlock2Start, s.studyBlock2End),
    items: [],
    used: 0,
  };

  // DSA first, at the front of the night block — it is the first thing that
  // quietly disappears when a day gets busy.
  const dsaMinutes = (dsa?.target ?? 3) * 25;
  block2.items.push({ title: dsa?.headline ?? 'DSA', context: 'DSA', minutes: dsaMinutes });
  block2.used += dsaMinutes;

  // A long module spills from one block into the next instead of being
  // refused. Only what fits nowhere today continues tomorrow — the old version
  // refused anything longer than a single block, and those missions silently
  // disappeared from the mail.
  const overflow = [];
  for (const m of missions) {
    const total = m.minutes || 60;
    const base = { title: m.title, context: m.context, carried: Boolean(m.carriedFrom) };
    const order = LOW_FOCUS.includes(m.proof) ? [office, block1, block2] : [block2, block1];
    let remaining = total;
    const pieces = [];
    for (const slot of order) {
      if (remaining <= 0) break;
      const take = Math.min(slot.capacity - slot.used, remaining);
      if (take <= 0 || (take < MIN_PIECE_MINUTES && take < remaining)) continue;
      pieces.push({ slot, minutes: take });
      slot.used += take;
      remaining -= take;
    }
    const partial = pieces.length > 1 || remaining > 0;
    for (const { slot, minutes } of pieces) {
      slot.items.push({ ...base, minutes, totalMinutes: total, partial });
    }
    if (remaining > 0) overflow.push({ ...base, minutes: remaining, totalMinutes: total, partial: true });
  }

  return { slots: [office, block1, run, block2], overflow };
}
