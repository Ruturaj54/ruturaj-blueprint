import type { Settings } from '@/lib/schema';
import { daySlots, dayTypeOf, type ExerciseSlot } from '@/engine/schedule';

export interface ExerciseWindow {
  label: string;
  start: string;
  end: string;
}

export const SLOT_LABEL: Record<ExerciseSlot, string> = {
  morning: 'Morning',
  evening: 'Evening',
  rest: 'Rest',
};

/**
 * The timetable entry that holds exercise on this date for the given slot,
 * read from the same routine the day timetable uses, so the window printed
 * here is the one he sees on My Day. Null on a rest day.
 */
export function exerciseWindow(settings: Settings, date: string, slot: ExerciseSlot): ExerciseWindow | null {
  if (slot === 'rest') return null;
  const entry = daySlots(settings, dayTypeOf(date), slot).find((s) => s.kind === 'move');
  return entry ? { label: entry.label, start: entry.start, end: entry.end } : null;
}
