/**
 * Health support: general evidence plus his own tracking. Never a diagnosis,
 * never a dose.
 *
 * This file is a generic library. Which areas apply to him is stored in the
 * private synced store (health.focus), not here — the repository is public.
 * Every card separates three things, as CLAUDE.md requires:
 *   - track:    what he records himself in the app
 *   - evidence: general evidence, not advice about him specifically
 *   - do/avoid: everyday habits consistent with that evidence
 * Anything about medicine says "exactly as your doctor directed".
 */

export interface HealthFocus {
  id: string;
  label: string;
  track: string;
  evidence: string;
  do: string[];
  avoid: string[];
}

export const HEALTH_FOCUS: readonly HealthFocus[] = [
  {
    id: 'weight',
    label: 'Weight loss',
    track: 'Weekly weigh-in — same morning, same scale, before breakfast.',
    evidence:
      'Weight loss comes from a sustained calorie deficit. Protein and fibre help with fullness, and short sleep tends to push appetite up.',
    do: [
      'Protein at every meal — eggs, paneer, dal, curd, chicken or fish.',
      'Half the plate vegetables before the rice or roti.',
      'Weigh in once a week, not every day.',
    ],
    avoid: [
      'Eating during the night block — it is the easiest 300 calories of the day.',
      'Liquid calories: juice, sweet lassi, cold drinks, sugary chai.',
      'Treating a good workout as a reason to eat freely.',
    ],
  },
  {
    id: 'low-sugar',
    label: 'Low sugar',
    track: 'Tick "No added sugar" on Today, every day you manage it.',
    evidence:
      'Added sugar is energy with almost no fullness, and cutting sugary drinks is one of the most consistent findings in diet research.',
    do: [
      'Chai and coffee without sugar — or step down half a spoon a week.',
      'Whole fruit instead of juice.',
      'Read the label on biscuits, granola and "healthy" bars.',
    ],
    avoid: [
      'Office celebration sweets — one piece, not three.',
      'Cold drinks, at the office or on a ride. Tender coconut or chaas instead.',
      'Dessert after dinner.',
    ],
  },
  {
    id: 'triglycerides',
    label: 'Triglycerides',
    track: 'Log each lipid panel in Labs, exactly as the report prints it.',
    evidence:
      'Triglycerides respond strongly to lifestyle: less added sugar, fewer refined carbohydrates, little or no alcohol, and regular aerobic exercise are the standard first steps. Whether anything more is needed is your doctor’s call.',
    do: [
      'Keep both daily runs — aerobic exercise is the main lever.',
      'Swap white rice and maida for whole grains where you can.',
      'Fish or other omega-3-rich foods a couple of times a week, if you eat them.',
    ],
    avoid: [
      'Alcohol — it raises triglycerides directly.',
      'Fried snacks and maida — samosa, vada pav, cream biscuits.',
      'A big plate of rice late at night.',
    ],
  },
  {
    id: 'hdl',
    label: 'HDL (good cholesterol)',
    track: 'Log HDL with each lipid panel in Labs.',
    evidence:
      'Regular aerobic exercise, losing excess weight, not smoking, and replacing trans fats with unsaturated fats are all associated with better HDL.',
    do: [
      'Aerobic exercise most days — your runs count.',
      'Unsaturated fats: nuts, seeds, groundnut or mustard oil in normal amounts.',
      'Keep the weight trend moving down.',
    ],
    avoid: [
      'Trans fats: vanaspati, reused frying oil, bakery puffs.',
      'Smoking or vaping.',
      'Sitting for hours — stand up once an hour at the office.',
    ],
  },
  {
    id: 'b12',
    label: 'Vitamin B12',
    track: 'Tick your doctor-directed item on Today; log each level in Labs.',
    evidence:
      'B12 comes mainly from animal foods — dairy, eggs, fish and meat — so a mostly vegetarian diet makes low levels more likely. Correcting it is your doctor’s plan, and retests show whether it is working.',
    do: [
      'Take exactly what your doctor directed, at the same time every day.',
      'Dairy and eggs daily, if you eat them.',
      'Retest when your doctor says, and log the result here.',
    ],
    avoid: [
      'Skipping doses on busy days — consistency is the whole point.',
      'Changing the dose on your own.',
      'Writing off tiredness as "just the schedule" — tell your doctor.',
    ],
  },
  {
    id: 'vitamin-d',
    label: 'Vitamin D',
    track: 'Tick your doctor-directed item on Today; log each level in Labs.',
    evidence:
      'The body makes vitamin D from sunlight on the skin, and an indoor office day provides very little. Supplements are taken as your doctor directs, often with a meal.',
    do: [
      'Take exactly what your doctor directed — ask whether it should go with a meal.',
      'Run outdoors in the morning rather than on a treadmill.',
      'Retest when your doctor says, and log the result here.',
    ],
    avoid: [
      'Skipping doses on weekends.',
      'Taking extra on your own — vitamin D builds up in the body.',
      'Spending every daylight hour indoors — step out for ten minutes at lunch.',
    ],
  },
];

export interface DailyHabit {
  id: string;
  label: string;
  /** Where it sits in the day, so the timetable and mail can point at it. */
  when: 'morning' | 'day' | 'night';
}

/** Small daily care, ticked on Today. Generic labels only. */
export const DAILY_HABITS: readonly DailyHabit[] = [
  { id: 'skin-am', label: 'Skin care — morning', when: 'morning' },
  { id: 'no-sugar', label: 'No added sugar today', when: 'day' },
  { id: 'skin-pm', label: 'Skin care — night', when: 'night' },
  { id: 'hair', label: 'Hair-care routine', when: 'night' },
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

export function focusById(id: string): HealthFocus | undefined {
  return HEALTH_FOCUS.find((f) => f.id === id);
}
