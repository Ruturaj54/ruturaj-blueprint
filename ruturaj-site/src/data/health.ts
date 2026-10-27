/**
 * The two daily habits ticked on Fitness, and the lab markers offered as
 * suggestions. Generic labels only: the repository is public, and anything
 * personal lives in the private synced store.
 */

export interface DailyHabit {
  id: string;
  label: string;
  /** Where it sits in the day, so the timetable and mail can point at it. */
  when: 'morning' | 'day' | 'night';
}

/** Small daily care, ticked on Today. Generic labels only. */
export const DAILY_HABITS: readonly DailyHabit[] = [
  { id: 'no-sugar', label: 'No added sugar today', when: 'day' },
  { id: 'kitchen-closed', label: 'Nothing eaten after dinner', when: 'night' },
];

/** Lab markers offered as suggestions in the Labs form. Free text still works. */
export const COMMON_MARKERS: readonly string[] = [
  'Triglycerides',
  'HDL cholesterol',
  'LDL cholesterol',
  'Total cholesterol',
  'Vitamin B12',
  'Vitamin D (25-OH)',
  'HbA1c',
  'Fasting glucose',
];
