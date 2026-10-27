// Renders every mail against the fixtures so the output can be checked
// without sending anything. Writes scripts/preview-*.html (gitignored) and
// prints every subject plus the weekday plaintext. Run: npm run preview:mail

import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDigest } from '../netlify/functions/_shared/digest.mjs';
import { buildMorning, buildEvening } from '../netlify/functions/_shared/templates.mjs';
import * as F from './fixtures.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const now = new Date();

const morningFri = buildDigest(F.weekday(), F.ist(F.FRI, '06:00'));

const SCENARIOS = [
  { id: 'before-start', state: F.beforeStart(), morning: F.ist(F.THU, '06:00'), evening: F.ist(F.THU, '17:00') },
  { id: 'weekday', state: F.weekday(), morning: F.ist(F.FRI, '06:00'), eveningState: F.weekdayEvening(morningFri), evening: F.ist(F.FRI, '17:00') },
  { id: 'evening-run', state: F.eveningRun(), morning: F.ist(F.THU, '06:00'), evening: F.ist(F.THU, '17:00') },
  { id: 'saturday', state: F.saturday(), morning: F.ist(F.SAT, '06:00'), evening: F.ist(F.SAT, '17:00') },
  { id: 'sunday', state: F.sunday(), morning: F.ist(F.SUN, '06:00'), evening: F.ist(F.SUN, '17:00') },
  { id: 'general', state: F.general(now), morning: now, evening: now },
  { id: 'interview-4d', state: F.interviewSoon(), morning: F.ist(F.THU, '06:00'), evening: F.ist(F.THU, '17:00') },
];

let weekdayText = '';
for (const s of SCENARIOS) {
  const morning = buildMorning(buildDigest(s.state, s.morning));
  const evening = buildEvening(buildDigest(s.eveningState ?? s.state, s.evening));
  await writeFile(resolve(here, `preview-${s.id}-morning.html`), morning.html, 'utf-8');
  await writeFile(resolve(here, `preview-${s.id}-evening.html`), evening.html, 'utf-8');
  console.log(`${s.id.padEnd(13)} morning: ${morning.subject}`);
  console.log(`${s.id.padEnd(13)} evening: ${evening.subject}`);
  if (s.id === 'weekday') weekdayText = `\n=== WEEKDAY MORNING (plaintext) ===\n${morning.text}\n=== WEEKDAY EVENING (plaintext) ===\n${evening.text}`;
}

console.log(weekdayText);
console.log(`\n${SCENARIOS.length * 2} previews written to ${here}/preview-*.html`);
