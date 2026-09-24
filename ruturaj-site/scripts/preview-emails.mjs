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

// A realistic Day 2: yesterday he planned three Apna modules and finished one,
// so today's mail must lead with the two he missed. Today he closed two of the
// three and did a bit of DSA — the end-of-day mail must list what carries.
const fixture = {
  dataEpoch: 3,
  foundation: { 'ap-03': true, 'ap-04': true, 'ap-05': true },
  tasks: {},
  days: {
    [yesterday]: { planned: ['ap-03', 'ap-04', 'ap-05'], completed: ['ap-03'] },
    [today]: {
      planned: ['ap-04', 'ap-05', 'ap-06'],
      completed: ['ap-04', 'ap-05'],
      notes: 'Production incident ate the evening.',
      closedAt: new Date().toISOString(),
    },
  },
  dsa: [
    { id: 'a1', date: today, problem: 'Two Sum', pattern: 'arrays', difficulty: 'easy', outcome: 'solved', minutes: 12 },
    { id: 'a2', date: today, problem: 'Valid Anagram', pattern: 'arrays', difficulty: 'easy', outcome: 'solved', minutes: 15 },
  ],
  deepWork: [
    { id: 'd1', date: today, label: 'Python Fundamentals', plannedMinutes: 50, actualMinutes: 95, outcome: 'completed' },
  ],
  runs: [{ id: 'r1', date: today, slot: 'morning', km: 4.2, minutes: 26 }],
  work: [],
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
