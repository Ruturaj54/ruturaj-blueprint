// Renders both daily mails against a fixture so the output can be checked
// without sending anything. Writes HTML next to the script and prints the
// plaintext, which is what most of the accountability content lives in.

import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDigest, istToday, addDays } from '../netlify/functions/_shared/digest.mjs';
import { buildMorning, buildEvening } from '../netlify/functions/_shared/templates.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const today = istToday();
const yesterday = addDays(today, -1);

// A mid-mission day that has gone partly wrong — the case the voice rules care
// about most, since an all-green fixture would hide the accountability copy.
const fixture = {
  foundation: {
    'f-python-1': true,
    'f-python-2': true,
    'f-python-3': true,
    'f-data-1': true,
    'f-data-2': true,
    'f-dsa-1': true,
    'f-dsa-2': true,
    'f-ppa-1': true,
  },
  tasks: {},
  days: {
    [yesterday]: {
      planned: ['f-python-4', 'f-data-3', 'f-math-1'],
      completed: ['f-python-4'],
    },
    // Reproduces the 800% bug: 3 planned, 24 ticked through the day.
    [today]: {
      planned: ['f-python-5', 'f-data-3', 'f-math-1'],
      completed: [
        'f-python-5', 'f-data-3',
        ...Array.from({ length: 22 }, (_, i) => `extra-${i}`),
      ],
      notes: 'Production incident ate the evening.',
      closedAt: new Date().toISOString(),
    },
  },
  dsa: [
    { id: 'a1', date: today, problem: 'Two Sum', pattern: 'arrays', difficulty: 'easy', outcome: 'solved', minutes: 12 },
    { id: 'a2', date: today, problem: 'Valid Anagram', pattern: 'arrays', difficulty: 'easy', outcome: 'solved', minutes: 15 },
    { id: 'a3', date: today, problem: 'Valid Palindrome', pattern: 'twopointers', difficulty: 'easy', outcome: 'solved', minutes: 18 },
  ],
  deepWork: [
    { id: 'd1', date: today, label: 'Python checkpoint', plannedMinutes: 50, actualMinutes: 50, outcome: 'completed' },
    { id: 'd2', date: today, label: 'ML evaluation notes', plannedMinutes: 50, actualMinutes: 35, outcome: 'partial' },
  ],
  runs: [{ id: 'r1', date: today, slot: 'morning', km: 4.2, minutes: 26 }],
  work: [{ id: 'w1', date: today, raw: 'Jenkins parallel stage work', metricNeeded: true, tags: [] }],
  applications: [],
  settings: { dsaTargetPerDay: 3, emailEnabled: true },
};

const digest = buildDigest(fixture);
const morning = buildMorning(digest);
const evening = buildEvening(digest);

await writeFile(resolve(here, 'preview-morning.html'), morning.html, 'utf-8');
await writeFile(resolve(here, 'preview-evening.html'), evening.html, 'utf-8');

console.log('=== DIGEST ===');
console.log(
  JSON.stringify(
    {
      day: digest.day,
      daysLeft: digest.daysLeft,
      phase: digest.phase.title,
      gate: digest.gate,
      missions: digest.missions.map((m) => m.title),
      dsa: digest.dsa,
      yesterday: digest.yesterday,
      todayLog: digest.todayLog,
      focusToday: digest.focusToday,
    },
    null,
    2,
  ),
);

console.log('\n=== MORNING ===');
console.log('SUBJECT:', morning.subject);
console.log(morning.text);

console.log('\n=== EVENING ===');
console.log('SUBJECT:', evening.subject);
console.log(evening.text);
