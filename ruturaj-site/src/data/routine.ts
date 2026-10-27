/**
 * The whole day, not just the study blocks.
 *
 * Ruturaj's weekday as he described it on 25 Oct 2026: home at 17:00, study
 * 18:00–20:00, dinner and recovery to 21:00, deep study 21:00–23:00, a short
 * walk, then an optional final block. Exercise is a morning run by default and
 * can move to the evening for a day or for good.
 *
 * Weekday times reference Settings, so changing a block moves the whole day.
 * A ref is "HH:MM", a Settings key, or a key with a minute offset ("walkEnd+30").
 * `when` hides an entry unless the condition holds for that day.
 */

export type DayType = 'weekday' | 'saturday' | 'sunday';

export type EntryKind = 'wake' | 'move' | 'meal' | 'work' | 'study' | 'walk' | 'free' | 'routine' | 'sleep';

/** What a study block is for; the scheduler places work by role. */
export type StudyRole = 'office' | 'course' | 'deep' | 'dsa' | 'light' | 'review';

export type Condition = 'am-run' | 'am-norun' | 'pm-run' | 'pm-norun' | 'block3' | 'noblock3';

export interface RoutineEntry {
  id: string;
  start: string;
  end: string;
  label: string;
  kind: EntryKind;
  study?: StudyRole;
  note: string;
  when?: Condition;
}

const WEEKDAY: RoutineEntry[] = [
  { id: 'wake', start: 'wakeTime', end: 'exerciseStart', label: 'Wake · water · no phone', kind: 'wake', note: 'A glass of water, then shoes on. The first ten minutes decide whether the day is yours.' },
  { id: 'am-move', start: 'exerciseStart', end: 'exerciseEnd', label: 'Morning run + core', kind: 'move', when: 'am-run', note: 'Warm up, run easy, cool down, then the short strength set. Today’s session is on the Fitness tab.' },
  { id: 'am-easy', start: 'exerciseStart', end: 'exerciseEnd', label: 'Easy morning · 10-minute walk · stretch', kind: 'routine', when: 'am-norun', note: 'The run is in the evening today, so keep the morning light and get daylight on your face.' },
  { id: 'ready', start: 'exerciseEnd', end: 'officeStart', label: 'Shower · breakfast · get ready', kind: 'meal', note: 'Protein first: eggs, paneer, dal or curd before anything sweet.' },
  { id: 'office', start: 'officeStart', end: 'officeEnd', label: 'Office · commute both ways', kind: 'work', study: 'office', note: 'The job comes first; the resume lines come from here. Spare minutes go to reading an LP story, nothing heavier.' },
  { id: 'settle', start: 'officeEnd', end: 'studyBlock1Start', label: 'Home · freshen up · snack · your time', kind: 'free', when: 'pm-norun', note: 'Change, eat something small, and take the hour. Study starts at the block, not before.' },
  { id: 'settle-short', start: 'officeEnd', end: 'officeEnd+15', label: 'Home · change', kind: 'free', when: 'pm-run', note: 'Shoes on within fifteen minutes, before the sofa wins.' },
  { id: 'pm-move', start: 'officeEnd+15', end: 'studyBlock1Start', label: 'Evening run + core', kind: 'move', when: 'pm-run', note: 'Same session as the morning plan. Shower and a quick snack before the block.' },
  { id: 'block1', start: 'studyBlock1Start', end: 'studyBlock1End', label: 'Study block 1', kind: 'study', study: 'course', note: 'Timer on. Clarify, brute force, optimal, code, dry run, complexity. Phone in another room.' },
  { id: 'dinner', start: 'studyBlock1End', end: 'studyBlock2Start', label: 'Dinner · rest', kind: 'meal', note: 'Eat properly, then twenty minutes with no screen. The kitchen closes after this.' },
  { id: 'block2', start: 'studyBlock2Start', end: 'studyBlock2End', label: 'Study block 2 — deep', kind: 'study', study: 'deep', note: 'The hardest item of the day goes here, while you are still sharp.' },
  { id: 'walk', start: 'studyBlock2End', end: 'walkEnd', label: 'Short walk in the society', kind: 'walk', note: 'No headphones needed. Let the last two hours settle.' },
  { id: 'block3', start: 'walkEnd', end: 'studyBlock3End', label: 'Final block (optional)', kind: 'study', study: 'light', when: 'block3', note: 'Revision and lighter items only. If you are not fresh, sleep instead; tomorrow’s blocks are worth more.' },
  { id: 'sleep', start: 'studyBlock3End', end: 'wakeTime', label: 'Sleep', kind: 'sleep', when: 'block3', note: 'Screens off. Six hours is the floor on weekdays; the weekend pays it back.' },
  { id: 'sleep-early', start: 'walkEnd', end: 'wakeTime', label: 'Sleep', kind: 'sleep', when: 'noblock3', note: 'Screens off. A longer night tonight is tomorrow’s better block.' },
];

const SATURDAY: RoutineEntry[] = [
  { id: 'sat-wake', start: 'weekendWakeTime', end: 'weekendWakeTime+15', label: 'Wake slow · water', kind: 'wake', note: 'Sleep in a little; five short nights are behind you.' },
  { id: 'sat-move', start: 'weekendWakeTime+15', end: 'weekendWakeTime+75', label: 'Longer easy run', kind: 'move', note: 'Slower and longer than a weekday, at a pace where you could still talk.' },
  { id: 'sat-breakfast', start: 'weekendWakeTime+75', end: 'weekendWakeTime+120', label: 'Shower · breakfast', kind: 'meal', note: 'A proper meal before the long block.' },
  { id: 'sat-a', start: 'weekendWakeTime+120', end: 'weekendWakeTime+300', label: 'Study A — the week’s hardest set', kind: 'study', study: 'deep', note: 'Three uninterrupted hours, the longest block of your week.' },
  { id: 'sat-lunch', start: 'weekendWakeTime+300', end: 'weekendWakeTime+390', label: 'Lunch · rest', kind: 'meal', note: 'Eat, walk ten minutes, lie down for twenty if you need it.' },
  { id: 'sat-b', start: 'weekendWakeTime+390', end: 'weekendWakeTime+570', label: 'Study B', kind: 'study', study: 'course', note: 'Mock or timed set if one is due; otherwise the next items in order.' },
  { id: 'sat-free', start: 'weekendWakeTime+570', end: '20:00', label: 'Free evening — ride, friends, rest', kind: 'free', note: 'Fully earned. No laptop.' },
  { id: 'sat-dinner', start: '20:00', end: '21:00', label: 'Dinner', kind: 'meal', note: 'Eating out is fine: grilled over fried, no dessert, no cold drinks.' },
  { id: 'sat-c', start: '21:00', end: '23:00', label: 'Study C — lighter', kind: 'study', study: 'light', note: 'Revision, an LP story said out loud, the mistakes notebook.' },
  { id: 'sat-walk', start: '23:00', end: 'weekendSleepTime', label: 'Short walk · wind down', kind: 'walk', note: 'Then a full night. This is where the week’s short sleep gets paid back.' },
  { id: 'sat-sleep', start: 'weekendSleepTime', end: 'weekendWakeTime', label: 'Sleep', kind: 'sleep', note: 'A full night.' },
];

const SUNDAY: RoutineEntry[] = [
  { id: 'sun-wake', start: 'weekendWakeTime', end: 'weekendWakeTime+15', label: 'Wake slow · water', kind: 'wake', note: 'Another full night behind you.' },
  { id: 'sun-move', start: 'weekendWakeTime+15', end: 'weekendWakeTime+60', label: 'Walk or mobility — recovery', kind: 'move', note: 'Legs rest today. A brisk walk and twenty minutes of stretching keep the habit without the load.' },
  { id: 'sun-breakfast', start: 'weekendWakeTime+60', end: 'weekendWakeTime+120', label: 'Shower · breakfast', kind: 'meal', note: 'Unhurried.' },
  { id: 'sun-a', start: 'weekendWakeTime+120', end: 'weekendWakeTime+300', label: 'Study A — clear the carry-over', kind: 'study', study: 'deep', note: 'Anything still open from the week goes first, so Monday starts clean.' },
  { id: 'sun-lunch', start: 'weekendWakeTime+300', end: 'weekendWakeTime+390', label: 'Lunch · rest', kind: 'meal', note: 'Home food if you can. Cook extra for Monday.' },
  { id: 'sun-mock', start: 'weekendWakeTime+390', end: 'weekendWakeTime+510', label: 'Mock or timed set', kind: 'study', study: 'dsa', note: 'Two problems under time, out loud, no hints. Log the solve times.' },
  { id: 'sun-free', start: 'weekendWakeTime+510', end: '19:30', label: 'Free time', kind: 'free', note: 'Back by 19:30 so Sunday night resets the week.' },
  { id: 'sun-dinner', start: '19:30', end: '20:30', label: 'Dinner', kind: 'meal', note: 'Light and early.' },
  { id: 'sun-review', start: '20:30', end: '21:15', label: 'Weekly review · plan the week', kind: 'study', study: 'review', note: 'Progress tab. Name one thing that slipped and the one change that fixes it.' },
  { id: 'sun-light', start: '21:15', end: '22:30', label: 'Light block — preview Monday', kind: 'study', study: 'light', note: 'Skim tomorrow’s first items so Monday’s block starts warm.' },
  { id: 'sun-prep', start: '22:30', end: '23:00', label: 'Prep Monday — bag, clothes, office snacks', kind: 'routine', note: 'Pack nuts, fruit or chana so the 4 pm craving already has an answer.' },
  { id: 'sun-walk', start: '23:00', end: 'weekendSleepTime', label: 'Short walk · wind down', kind: 'walk', note: 'Earlier tonight so Monday morning is not a fight.' },
  { id: 'sun-sleep', start: 'weekendSleepTime', end: 'wakeTime', label: 'Sleep — Monday starts at wake-up', kind: 'sleep', note: 'Screens off.' },
];

export const ROUTINES: Record<DayType, readonly RoutineEntry[]> = {
  weekday: WEEKDAY,
  saturday: SATURDAY,
  sunday: SUNDAY,
};

export const DAY_TYPE_LABEL: Record<DayType, string> = {
  weekday: 'Weekday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};
