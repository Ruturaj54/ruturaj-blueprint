// Renders every daily mail — weekday, Saturday and Sunday, morning and end of
// day — against a fixture, so the output can be checked without sending
// anything. Writes HTML next to this script (gitignored) and prints the
// weekday plaintext.
//
// The fixture is invented test data, not Ruturaj's: placeholder health values
// exercise the layout only.

import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDigest, addDays } from '../netlify/functions/_shared/digest.mjs';
import { buildMorning, buildEvening } from '../netlify/functions/_shared/templates.mjs';

const here = dirname(fileURLToPath(import.meta.url));

/** Day 2 of the mission (Fri 2 Oct), and the weekend that follows it. */
const DAYS = { weekday: '2026-10-02', saturday: '2026-10-03', sunday: '2026-10-04' };

function fixture(today) {
  const yesterday = addDays(today, -1);
  return {
    dataEpoch: 4,
    foundation: { 'ap-03': true, 'ap-04': true, 'ap-05': true },
    tasks: {},
    days: {
      [yesterday]: { planned: ['ap-03', 'ap-04', 'ap-05'], completed: ['ap-03', 'ap-04'] },
      [today]: { planned: ['ap-05', 'ap-06', 'ap-07'], completed: ['ap-05'], closedAt: new Date().toISOString() },
    },
    habits: { [today]: ['skin-am', 'no-sugar', 'skin-pm'], [yesterday]: ['no-sugar'] },
    dsa: [
      { id: 'a1', date: today, problem: 'Two Sum', pattern: 'arrays', difficulty: 'easy', outcome: 'solved', minutes: 12 },
      { id: 'a2', date: today, problem: 'Valid Anagram', pattern: 'arrays', difficulty: 'easy', outcome: 'solved', minutes: 15 },
    ],
    deepWork: [{ id: 'd1', date: today, label: 'Python', plannedMinutes: 50, actualMinutes: 95, outcome: 'completed' }],
    runs: [
      { id: 'r1', date: yesterday, slot: 'morning', km: 4.2, minutes: 26 },
      { id: 'r2', date: today, slot: 'evening', km: 5, minutes: 31 },
    ],
    work: [],
    applications: [],
    health: {
      focus: ['weight', 'low-sugar', 'triglycerides', 'hdl', 'b12', 'vitamin-d'],
      supplements: [
        { id: 's1', name: 'Supplement A', dose: 'as prescribed', directedBy: 'doctor', timing: 'morning', active: true },
        { id: 's2', name: 'Topical B', dose: '', directedBy: 'doctor', timing: 'night', active: true },
      ],
      adherence: { [today]: ['s1'] },
      labs: [{ id: 'l1', date: '2026-09-10', marker: 'Test marker', value: '123', unit: 'mg/dL' }],
      nextTestDate: addDays(today, 20),
      weight: { '2026-10-01': 90, [today]: 89.4 },
      sleep: {},
    },
    settings: { dsaTargetPerDay: 3, emailEnabled: true },
  };
}

const ist = (iso, hhmm) => new Date(`${iso}T${hhmm}:00+05:30`);

for (const [type, date] of Object.entries(DAYS)) {
  const state = fixture(date);
  const morning = buildMorning(buildDigest(state, ist(date, '07:00')));
  const evening = buildEvening(buildDigest(state, ist(addDays(date, 1), '02:30')));
  await writeFile(resolve(here, `preview-${type}-morning.html`), morning.html, 'utf-8');
  await writeFile(resolve(here, `preview-${type}-evening.html`), evening.html, 'utf-8');
  console.log(`${type.padEnd(8)} morning: ${morning.subject}`);
  console.log(`${type.padEnd(8)} evening: ${evening.subject}`);
  if (type === 'weekday') {
    console.log('\n=== WEEKDAY MORNING (plaintext) ===\n' + morning.text);
    console.log('=== WEEKDAY EVENING (plaintext) ===\n' + evening.text);
  }
}

// The fresh Day 1 mail, exactly as a brand-new blob produces it.
const day1 = buildMorning(buildDigest(null, ist('2026-10-01', '07:00')));
await writeFile(resolve(here, 'preview-day1-morning.html'), day1.html, 'utf-8');
console.log(`day 1    morning: ${day1.subject}`);
