// Mirrors src/engine/schedule.ts so the morning mail shows the same full-day
// timetable the app does. Listing what to do without saying when is the
// difference between a plan and a wish. The day templates themselves come
// from src/data/routine.ts via catalog.json, so the copy is never duplicated.

import catalog from './catalog.json' with { type: 'json' };

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const toHHMM = (minutes) => {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
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

/** Must match DEFAULT_SETTINGS in src/lib/schema.ts (timetable keys only). */
export const SCHEDULE_DEFAULTS = {
  wakeTime: '07:00',
  morningRunTime: '07:15',
  morningRunEnd: '08:15',
  officeStart: '10:00',
  officeEnd: '17:30',
  officeStudyHours: 2,
  studyBlock1Start: '18:00',
  studyBlock1End: '20:00',
  eveningRunTime: '20:00',
  eveningRunEnd: '21:15',
  studyBlock2Start: '22:00',
  studyBlock2End: '01:00',
  sleepTarget: '01:00',
};

const HHMM = /^\d{1,2}:\d{2}$/;

/** "HH:MM", a settings key, or a key plus a minute offset. Mirrors resolveTime. */
export function resolveTime(ref, s) {
  if (HHMM.test(ref)) return ref;
  const match = /^([A-Za-z0-9]+)([+-]\d+)?$/.exec(ref);
  if (!match) return '00:00';
  const raw = s[match[1]];
  const base = typeof raw === 'string' && HHMM.test(raw) ? raw : SCHEDULE_DEFAULTS[match[1]] ?? '00:00';
  return toHHMM(toMinutes(base) + Number(match[2] ?? 0));
}

/** 0 = Sunday, from a bare YYYY-MM-DD pinned to midday. */
export function dayTypeOf(iso) {
  const dow = new Date(`${iso}T12:00:00`).getDay();
  return dow === 6 ? 'saturday' : dow === 0 ? 'sunday' : 'weekday';
}

const LOW_FOCUS = ['watch', 'notes'];
const PLACEMENT = {
  course: ['office', 'course', 'deep', 'light'],
  build: ['deep', 'course'],
};
/** Must match MIN_PIECE_MINUTES in src/engine/schedule.ts. */
const MIN_PIECE_MINUTES = 30;

/**
 * `missions` carry { id, title, context, minutes, proof, carriedFrom }. Proof
 * decides whether something is interruptible enough for office spare time.
 */
export function buildSchedule(settings, missions, dsa, dayType = 'weekday') {
  const s = { ...SCHEDULE_DEFAULTS, ...(settings || {}) };

  const slots = (catalog.routines[dayType] ?? catalog.routines.weekday).map((e) => {
    const start = resolveTime(e.start, s);
    const end = resolveTime(e.end, s);
    const capacity =
      e.study === 'office'
        ? Math.round((Number(s.officeStudyHours) || 0) * 60)
        : e.study && e.study !== 'review'
          ? blockMinutes(start, end)
          : 0;
    return { id: e.id, label: e.label, kind: e.kind, study: e.study ?? null, start, end, capacity, items: [], used: 0, note: e.note };
  });

  // DSA first: its own block on weekends, else the front of the night block —
  // it is the first thing that quietly disappears when a day gets busy.
  const dsaHome = slots.find((x) => x.study === 'dsa') ?? slots.find((x) => x.study === 'deep');
  if (dsaHome) {
    const minutes = (dsa?.target ?? 3) * 25;
    dsaHome.items.push({ title: dsa?.headline ?? 'DSA', context: 'DSA', minutes });
    dsaHome.used += minutes;
  }

  // A long module spills from one block into the next instead of being
  // refused. Only what fits nowhere today continues tomorrow — never dropped.
  const overflow = [];
  for (const m of missions) {
    const total = m.minutes || 60;
    const base = { title: m.title, context: m.context, carried: Boolean(m.carriedFrom) };
    const order = PLACEMENT[LOW_FOCUS.includes(m.proof) ? 'course' : 'build'].flatMap((role) =>
      slots.filter((x) => x.study === role && x.capacity > 0),
    );
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

  const study = slots.filter((x) => x.capacity > 0);
  return {
    dayType,
    slots,
    overflow,
    totalPlanned: study.reduce((n, x) => n + x.used, 0),
    totalCapacity: study.reduce((n, x) => n + x.capacity, 0),
  };
}
