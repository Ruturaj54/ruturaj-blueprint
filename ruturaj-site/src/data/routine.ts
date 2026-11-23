/**
 * The whole day, not just the study blocks.
 *
 * Ruturaj's weekday as he described it on 23 Nov 2026: up at 08:00 and out for
 * a run until about 08:30, home from the office around 17:15, fifteen minutes
 * that are his, then surprise prep, startup and freelance work, a protein dinner, a lecture
 * after dinner, a 5 km walk in the society while he calls home, and finally
 * revise the day and plan tomorrow before sleeping by midnight. Runs are
 * morning-only; the evening belongs to the walk.
 *
 * Weekday times reference Settings, so changing a block moves the whole day.
 * A ref is "HH:MM", a Settings key, or a key with a minute offset ("walkEnd+30").
 * `when` hides an entry unless the condition holds for that day.
 */

export type DayType = 'weekday' | 'saturday' | 'sunday';

export type EntryKind = 'wake' | 'move' | 'meal' | 'work' | 'study' | 'walk' | 'free' | 'routine' | 'sleep';

/**
 * What a study block is for; the scheduler places work by role. `lecture` is
 * the after-dinner video block (Apna College during surprise prep); `review`
 * holds no items (weekly review, revise-and-plan).
 */
export type StudyRole = 'office' | 'course' | 'deep' | 'dsa' | 'light' | 'lecture' | 'review';

export type Condition = 'am-run' | 'am-rest' | 'block3' | 'noblock3' | 'freelance' | 'nofreelance';

export interface RoutineEntry {
  id: string;
  start: string;
  end: string;
  label: string;
  kind: EntryKind;
  study?: StudyRole;
  note: string;
  when?: Condition;
  /** The label once surprise prep is complete and the general roadmap runs the day. */
  general?: string;
}

const PREP_NOTE = 'Timer on, phone in another room. Restate, brute force, improve, code, dry run, complexity. Log every outcome honestly.';
const WALK_NOTE = 'An easy pace in the society, about an hour. Call home while you walk; you come back lighter and the day settles.';

const WEEKDAY: RoutineEntry[] = [
  { id: 'wake', start: 'wakeTime', end: 'exerciseStart', label: 'Wake · water · shoes on', kind: 'wake', note: 'A glass of water and straight out. The run decides itself once you are through the gate.' },
  { id: 'am-move', start: 'exerciseStart', end: 'exerciseEnd', label: 'Morning run', kind: 'move', when: 'am-run', note: 'Easy pace, the session on the Fitness tab. Log the km when you are back; it goes into today’s numbers.' },
  { id: 'am-rest', start: 'exerciseStart', end: 'exerciseEnd', label: 'Rest morning · stretch', kind: 'routine', when: 'am-rest', note: 'Planned rest. Ten minutes of stretching and daylight; the evening walk still stands.' },
  { id: 'ready', start: 'exerciseEnd', end: 'officeStart', label: 'Shower · protein breakfast · get ready', kind: 'meal', note: 'Protein first: eggs, paneer, curd or a besan chilla before anything sweet.' },
  { id: 'office', start: 'officeStart', end: 'officeEnd', label: 'Office · commute both ways', kind: 'work', study: 'office', note: 'The job comes first; the resume lines come from here. Pack fruit or chana so the 4 pm craving already has an answer.' },
  { id: 'settle', start: 'officeEnd', end: 'studyBlock1Start', label: 'Home · your own time', kind: 'free', note: 'Change, wash your face, eat something small. Fifteen minutes that are yours, then the block starts on time.' },
  { id: 'block1', start: 'studyBlock1Start', end: 'studyBlock1End', label: 'Surprise prep', general: 'Deep block — DSA and builds', kind: 'study', study: 'deep', when: 'freelance', note: PREP_NOTE },
  { id: 'block1', start: 'studyBlock1Start', end: 'dinnerStart', label: 'Surprise prep', general: 'Deep block — DSA and builds', kind: 'study', study: 'deep', when: 'nofreelance', note: PREP_NOTE },
  { id: 'freelance', start: 'studyBlock1End', end: 'dinnerStart', label: 'Startup & freelance', kind: 'work', when: 'freelance', note: 'Your startup or client work, timeboxed. Pick one thing a user or client can see, ship it, stop when the block ends.' },
  { id: 'dinner', start: 'dinnerStart', end: 'studyBlock2Start', label: 'Protein dinner', kind: 'meal', note: 'Tonight’s plate is on My Day. Protein first, vegetables next, roti or rice last. The kitchen closes after this.' },
  { id: 'block2', start: 'studyBlock2Start', end: 'studyBlock2End', label: 'Lecture block', kind: 'study', study: 'lecture', note: 'One module, notes open, code along. Pause the video and type it yourself; watching is not learning.' },
  { id: 'walk', start: 'studyBlock2End', end: 'walkEnd', label: 'Evening walk · call home', kind: 'walk', note: WALK_NOTE },
  { id: 'block3', start: 'walkEnd', end: 'studyBlock3End', label: 'Revise today · plan tomorrow', kind: 'study', study: 'review', when: 'block3', note: 'Ten minutes revising what you solved, five on the mistakes notebook, then log today’s numbers and write tomorrow’s plan in one line.' },
  { id: 'sleep', start: 'studyBlock3End', end: 'wakeTime', label: 'Sleep · lights out by 00:00', kind: 'sleep', when: 'block3', note: 'Screens off. Eight hours is what makes 17:30 sharp tomorrow.' },
  { id: 'sleep-early', start: 'walkEnd', end: 'wakeTime', label: 'Sleep', kind: 'sleep', when: 'noblock3', note: 'Screens off. A longer night tonight is tomorrow’s better block.' },
];

const SATURDAY: RoutineEntry[] = [
  { id: 'sat-wake', start: 'weekendWakeTime', end: 'weekendWakeTime+15', label: 'Wake slow · water', kind: 'wake', note: 'No alarm panic. Water, then shoes.' },
  { id: 'sat-move', start: 'weekendWakeTime+15', end: 'weekendWakeTime+75', label: 'Longer easy run', kind: 'move', note: 'Slower and longer than a weekday, at a pace where you could still talk.' },
  { id: 'sat-breakfast', start: 'weekendWakeTime+75', end: 'weekendWakeTime+120', label: 'Shower · protein breakfast', kind: 'meal', note: 'A proper meal before the long block.' },
  { id: 'sat-a', start: 'weekendWakeTime+120', end: 'weekendWakeTime+300', label: 'Surprise prep — the week’s hardest set', general: 'Study A — the week’s hardest set', kind: 'study', study: 'deep', note: 'Three uninterrupted hours, the longest block of your week. Mocks and asked problems go here.' },
  { id: 'sat-lunch', start: 'weekendWakeTime+300', end: 'weekendWakeTime+390', label: 'Lunch · rest', kind: 'meal', note: 'Eat, walk ten minutes, lie down for twenty if you need it.' },
  { id: 'sat-lecture', start: 'weekendWakeTime+390', end: 'weekendWakeTime+510', label: 'Lecture block', kind: 'study', study: 'lecture', note: 'The longer lecture of the week. Code along and finish the module’s exercise before you stop.' },
  { id: 'sat-freelance', start: 'weekendWakeTime+510', end: 'weekendWakeTime+630', label: 'Startup & freelance', kind: 'work', when: 'freelance', note: 'The week’s biggest startup block. Ship one thing a user or client can see.' },
  { id: 'sat-free', start: 'weekendWakeTime+630', end: '20:30', label: 'Free evening — family, friends, rest', kind: 'free', when: 'freelance', note: 'Fully earned. No laptop.' },
  { id: 'sat-free', start: 'weekendWakeTime+510', end: '20:30', label: 'Free evening — family, friends, rest', kind: 'free', when: 'nofreelance', note: 'Fully earned. No laptop.' },
  { id: 'sat-dinner', start: '20:30', end: '21:15', label: 'Protein dinner', kind: 'meal', note: 'Eating out is fine: paneer or egg dishes, grilled over fried, no dessert, no cold drinks.' },
  { id: 'sat-c', start: '21:15', end: '22:15', label: 'Light block — revision', kind: 'study', study: 'light', note: 'Re-solves, an LP story said out loud, the mistakes notebook.' },
  { id: 'sat-walk', start: '22:15', end: '23:15', label: 'Evening walk · call home', kind: 'walk', note: WALK_NOTE },
  { id: 'sat-plan', start: '23:15', end: 'weekendSleepTime', label: 'Log today · plan Sunday', kind: 'routine', note: 'Today’s numbers in, tomorrow in one line, screens off.' },
  { id: 'sat-sleep', start: 'weekendSleepTime', end: 'weekendWakeTime', label: 'Sleep', kind: 'sleep', note: 'A full night.' },
];

const SUNDAY: RoutineEntry[] = [
  { id: 'sun-wake', start: 'weekendWakeTime', end: 'weekendWakeTime+15', label: 'Wake slow · water', kind: 'wake', note: 'Another full night behind you.' },
  { id: 'sun-move', start: 'weekendWakeTime+15', end: 'weekendWakeTime+60', label: 'Recovery walk + stretch', kind: 'move', note: 'Legs rest today. A brisk walk and twenty minutes of stretching keep the habit without the load.' },
  { id: 'sun-breakfast', start: 'weekendWakeTime+60', end: 'weekendWakeTime+120', label: 'Shower · breakfast', kind: 'meal', note: 'Unhurried.' },
  { id: 'sun-a', start: 'weekendWakeTime+120', end: 'weekendWakeTime+300', label: 'Surprise prep — clear the carry-over', general: 'Study A — clear the carry-over', kind: 'study', study: 'deep', note: 'Anything still open from the week goes first, so Monday starts clean.' },
  { id: 'sun-lunch', start: 'weekendWakeTime+300', end: 'weekendWakeTime+390', label: 'Lunch · rest', kind: 'meal', note: 'Home food if you can. Cook extra for Monday.' },
  { id: 'sun-mock', start: 'weekendWakeTime+390', end: 'weekendWakeTime+510', label: 'Mock or timed set', kind: 'study', study: 'dsa', note: 'Two problems under time, out loud, no hints. Log the solve times.' },
  { id: 'sun-freelance', start: 'weekendWakeTime+510', end: 'weekendWakeTime+630', label: 'Startup & freelance', kind: 'work', when: 'freelance', note: 'Close the week’s startup and client loose ends so Monday evening is free for prep.' },
  { id: 'sun-free', start: 'weekendWakeTime+630', end: '19:30', label: 'Free time', kind: 'free', when: 'freelance', note: 'Back by 19:30 so Sunday night resets the week.' },
  { id: 'sun-free', start: 'weekendWakeTime+510', end: '19:30', label: 'Free time', kind: 'free', when: 'nofreelance', note: 'Back by 19:30 so Sunday night resets the week.' },
  { id: 'sun-dinner', start: '19:30', end: '20:15', label: 'Protein dinner', kind: 'meal', note: 'Light and early.' },
  { id: 'sun-review', start: '20:15', end: '21:00', label: 'Weekly review · plan the week', kind: 'study', study: 'review', note: 'Progress tab. Name one thing that slipped and the one change that fixes it.' },
  { id: 'sun-lecture', start: '21:00', end: '22:00', label: 'Lecture block', kind: 'study', study: 'lecture', note: 'A shorter lecture to end the week warm.' },
  { id: 'sun-walk', start: '22:00', end: '23:00', label: 'Evening walk · call home', kind: 'walk', note: WALK_NOTE },
  { id: 'sun-prep', start: '23:00', end: 'weekendSleepTime', label: 'Prep Monday · log today', kind: 'routine', note: 'Bag, clothes, office snacks; today’s numbers in; Monday in one line.' },
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
