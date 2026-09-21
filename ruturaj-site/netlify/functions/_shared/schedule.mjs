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

  const overflow = [];
  for (const m of missions) {
    const item = { title: m.title, context: m.context, minutes: m.minutes || 60 };
    const course = LOW_FOCUS.includes(m.proof);
    const order = course ? [office, block1, block2] : [block2, block1];
    const target = order.find((slot) => slot.used + item.minutes <= slot.capacity);
    if (target) {
      target.items.push(item);
      target.used += item.minutes;
    } else {
      overflow.push(item);
    }
  }

  return { slots: [office, block1, run, block2], overflow };
}
