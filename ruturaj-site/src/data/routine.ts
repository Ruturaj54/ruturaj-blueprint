/**
 * The whole day, not just the study blocks.
 *
 * Ruturaj described his weekday on 1 Oct 2026 and asked for a timetable that
 * says what to do at every point of it — including the run, skin and hair
 * care, meals and sleep — and for weekends that trade some study for an
 * evening ride into the hills on his Classic 350.
 *
 * Weekday times reference Settings, so changing a block in Settings moves the
 * timetable with it. A ref is "HH:MM", a Settings key, or a key with a minute
 * offset ("morningRunEnd+30"). Weekend times are fixed.
 *
 * Generic on purpose: nothing here names a condition or a medicine. The
 * repository is public, so his health specifics live in the private synced
 * store and are merged in at render time.
 */

export type DayType = 'weekday' | 'saturday' | 'sunday';

export type EntryKind = 'care' | 'move' | 'meal' | 'work' | 'study' | 'ride' | 'routine' | 'sleep';

/**
 * What a study entry is for. The scheduler places missions by role: watching
 * and reading go to office, course and light blocks; building goes to deep and
 * course blocks; DSA owns its own block, or the front of the deep block.
 */
export type StudyRole = 'office' | 'course' | 'deep' | 'dsa' | 'light' | 'review';

export interface RoutineEntry {
  id: string;
  start: string;
  end: string;
  label: string;
  kind: EntryKind;
  study?: StudyRole;
  note: string;
}

const WEEKDAY: RoutineEntry[] = [
  { id: 'wake', start: 'wakeTime', end: 'morningRunTime', label: 'Wake up · water · no phone', kind: 'care', note: 'A glass of water before anything else. The first ten minutes decide whether the day is yours or your feed’s.' },
  { id: 'am-move', start: 'morningRunTime', end: 'morningRunEnd', label: 'Run or home workout', kind: 'move', note: 'Outdoors when you can — it is also your daylight. After a short night, go easy rather than skip.' },
  { id: 'am-care', start: 'morningRunEnd', end: 'morningRunEnd+30', label: 'Shower · skin care (AM)', kind: 'care', note: 'Cleanse, moisturise, sunscreen. Tied to the shower so it never needs remembering.' },
  { id: 'breakfast', start: 'morningRunEnd+30', end: 'morningRunEnd+60', label: 'Breakfast — protein first', kind: 'meal', note: 'Eggs, paneer, dal, curd or sprouts before anything sweet. Morning items your doctor directed go here.' },
  { id: 'prep', start: 'morningRunEnd+60', end: 'officeStart', label: 'Recall yesterday’s notes · get ready', kind: 'routine', note: 'Twenty minutes: write what you remember from yesterday’s module, then check. Recall beats re-watching.' },
  { id: 'office', start: 'officeStart', end: 'officeEnd', label: 'Office · commute both ways', kind: 'work', study: 'office', note: 'The job comes first — deliver it well, the resume lines come from here. Spare time: watching and reading only.' },
  { id: 'home', start: 'officeEnd', end: 'studyBlock1Start', label: 'Home · change · light snack', kind: 'meal', note: 'Fruit, roasted chana, buttermilk or nuts — not biscuits and sweet chai. This is where the evening sugar habit starts.' },
  { id: 'block1', start: 'studyBlock1Start', end: 'studyBlock1End', label: 'Block 1 — Course', kind: 'study', study: 'course', note: 'Apna College first, Five Minute Engineering second. Code along — if you did not type it, you did not learn it.' },
  { id: 'pm-move', start: 'eveningRunTime', end: 'eveningRunEnd', label: 'Evening run', kind: 'move', note: 'Protected. Fitness and recovery, not slack to raid when the day runs late.' },
  { id: 'pm-care', start: 'eveningRunEnd', end: 'eveningRunEnd+15', label: 'Shower · skin + hair care (PM)', kind: 'care', note: 'Night skin routine, and your hair-care routine exactly as directed.' },
  { id: 'dinner', start: 'eveningRunEnd+15', end: 'studyBlock2Start', label: 'Dinner — light, then the kitchen closes', kind: 'meal', note: 'Protein and vegetables, a smaller portion of rice or roti. Nothing to eat during the night block.' },
  { id: 'block2', start: 'studyBlock2Start', end: 'studyBlock2End', label: 'Block 2 — DSA + deep work', kind: 'study', study: 'deep', note: 'DSA first while you are sharpest, then build. Phone in another room.' },
  { id: 'sleep', start: 'sleepTarget', end: 'wakeTime', label: 'Sleep', kind: 'sleep', note: 'Screens off. Six hours is the floor, not the goal — the weekend pays it back.' },
];

const SATURDAY: RoutineEntry[] = [
  { id: 'sat-wake', start: '08:30', end: '08:45', label: 'Wake slow · water', kind: 'care', note: 'Sleep in — five short nights are behind you. Still no phone for the first ten minutes.' },
  { id: 'sat-move', start: '08:45', end: '09:45', label: 'Long easy run', kind: 'move', note: 'Slower and longer than a weekday, at a pace where you could still talk. This builds the aerobic base.' },
  { id: 'sat-care', start: '09:45', end: '10:15', label: 'Shower · skin care (AM)', kind: 'care', note: 'Sunscreen matters more today — you will be on the bike later.' },
  { id: 'sat-breakfast', start: '10:15', end: '10:45', label: 'Breakfast — protein first', kind: 'meal', note: 'A proper meal before the long block. Morning items your doctor directed go here.' },
  { id: 'sat-deep', start: '10:45', end: '13:45', label: 'Deep block — the week’s hardest item', kind: 'study', study: 'deep', note: 'Three uninterrupted hours, the longest block of your week. Spend it on whatever needs the most focus.' },
  { id: 'sat-lunch', start: '13:45', end: '14:45', label: 'Lunch · rest', kind: 'meal', note: 'Eat, walk ten minutes, lie down for twenty if you need it.' },
  { id: 'sat-dsa', start: '14:45', end: '16:00', label: 'DSA — problems + one re-solve', kind: 'study', study: 'dsa', note: 'Re-solve one problem from earlier in the week, cold. Retention is the metric.' },
  { id: 'ride', start: '16:00', end: '20:30', label: 'Ride — Classic 350 to the hills', kind: 'ride', note: 'Small happiness, fully earned. Full gear, fuel before the ghat, down before it is fully dark. Stops: tender coconut, chaas, unsweetened chai.' },
  { id: 'sat-dinner', start: '20:30', end: '21:15', label: 'Dinner', kind: 'meal', note: 'Eating out is fine: tandoor or grilled over fried, no dessert, no cold drinks.' },
  { id: 'sat-pm-care', start: '21:15', end: '21:30', label: 'Shower · skin + hair care (PM)', kind: 'care', note: 'Wash off the road. Night routine, hair care exactly as directed.' },
  { id: 'sat-light', start: '21:30', end: '22:30', label: 'Light block — revise the week', kind: 'study', study: 'light', note: 'Recall-first revision of the week’s modules. Watching and reading only — you have ridden for four hours.' },
  { id: 'sat-free', start: '22:30', end: '23:30', label: 'Free time', kind: 'routine', note: 'Guilt-free. A film, family, friends — the week was hard and this hour is yours.' },
  { id: 'sat-sleep', start: '23:30', end: '08:30', label: 'Sleep', kind: 'sleep', note: 'A full night. This is where the week’s short sleep gets paid back.' },
];

const SUNDAY: RoutineEntry[] = [
  { id: 'sun-wake', start: '08:30', end: '08:45', label: 'Wake slow · water', kind: 'care', note: 'Another full night behind you. Water first, phone later.' },
  { id: 'sun-move', start: '08:45', end: '09:30', label: 'Walk or mobility — recovery', kind: 'move', note: 'Legs rest today. A brisk walk or twenty minutes of stretching keeps the habit without the load.' },
  { id: 'sun-care', start: '09:30', end: '10:00', label: 'Shower · skin care (AM)', kind: 'care', note: 'Sunscreen — another ride today.' },
  { id: 'sun-breakfast', start: '10:00', end: '10:30', label: 'Breakfast — protein first', kind: 'meal', note: 'Morning items your doctor directed go here.' },
  { id: 'sun-deep', start: '10:30', end: '13:00', label: 'Deep block — clear the carry-over', kind: 'study', study: 'deep', note: 'Anything still open from the week goes first, so Monday starts clean.' },
  { id: 'sun-lunch', start: '13:00', end: '14:00', label: 'Lunch · rest', kind: 'meal', note: 'Home food if you can. Cook extra for Monday.' },
  { id: 'sun-dsa', start: '14:00', end: '15:15', label: 'Weekly timed DSA set', kind: 'study', study: 'dsa', note: 'Three problems under time, no hints. Log the solve times — that is the number interviews measure.' },
  { id: 'sun-ride', start: '15:30', end: '19:30', label: 'Ride — short trip, back early', kind: 'ride', note: 'Back by 19:30. Sunday night resets the week; it should not be spent recovering from the ride.' },
  { id: 'sun-dinner', start: '19:30', end: '20:30', label: 'Dinner', kind: 'meal', note: 'Light and early. Kitchen closes after this.' },
  { id: 'sun-review', start: '20:30', end: '21:30', label: 'Weekly review · plan the week', kind: 'study', study: 'review', note: 'Analytics → weekly review. Name one thing that slipped and the one change that fixes it.' },
  { id: 'sun-prep', start: '21:30', end: '22:00', label: 'Prep Monday — bag, clothes, office snacks', kind: 'routine', note: 'Pack nuts, fruit or chana for the office so the 4 pm craving already has an answer.' },
  { id: 'sun-pm-care', start: '22:00', end: '22:15', label: 'Skin + hair care (PM)', kind: 'care', note: 'Night routine, hair care exactly as directed.' },
  { id: 'sun-light', start: '22:15', end: '23:15', label: 'Light block — preview Monday’s module', kind: 'study', study: 'light', note: 'Skim the first module of the week so Monday’s block starts warm.' },
  { id: 'sun-sleep', start: '23:30', end: 'wakeTime', label: 'Sleep — Monday starts at wake-up', kind: 'sleep', note: 'Earlier tonight so Monday morning is not a fight.' },
];

export const ROUTINES: Record<DayType, readonly RoutineEntry[]> = {
  weekday: WEEKDAY,
  saturday: SATURDAY,
  sunday: SUNDAY,
};

export const DAY_TYPE_LABEL: Record<DayType, string> = {
  weekday: 'Weekday — hard study',
  saturday: 'Saturday — study, then ride',
  sunday: 'Sunday — review, ride, reset',
};
