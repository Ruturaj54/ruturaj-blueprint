// Bundles src/engine/server-entry.ts into netlify/functions/_shared/engine.mjs
// so the mail functions run the same TypeScript engine as the app (CLAUDE.md
// rule 9). The output is committed and regenerated on every build; functions
// import from it and never re-implement engine logic in .mjs.

import { build } from 'esbuild';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const entry = resolve(root, 'src/engine/server-entry.ts');
const out = resolve(root, 'netlify/functions/_shared/engine.mjs');

const HEADER = `// GENERATED, DO NOT EDIT.
// Built by scripts/gen-engine.mjs from src/engine/server-entry.ts (one engine
// for the app and the mail functions). Regenerated on every build; edit the
// TypeScript sources under src/ and run \`npm run gen:engine\`.
`;

await mkdir(dirname(out), { recursive: true });

let result;
try {
  result = await build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    outfile: out,
    logLevel: 'silent',
    legalComments: 'none',
    alias: { '@': resolve(root, 'src') },
    // The engine has no runtime dependencies; anything else is a mistake.
    external: [],
  });
} catch (err) {
  // esbuild rejects on a build error. Mid-edit, the mail scripts can still run
  // against the last good bundle; the real build fails at tsc anyway.
  const text = err?.errors?.[0]?.text ?? err?.message ?? String(err);
  const exists = await stat(out).then(() => true).catch(() => false);
  if (process.env.GEN_ENGINE_STRICT || !exists) {
    console.error(`gen-engine: build failed: ${text}`);
    process.exit(1);
  }
  console.warn(`gen-engine: build failed (${text}); keeping the existing engine.mjs`);
  process.exit(0);
}

if (result.errors.length) {
  for (const e of result.errors) console.error(e.text);
  process.exit(1);
}

const bundled = await readFile(out, 'utf-8');
await writeFile(out, HEADER + bundled, 'utf-8');

// Smoke test: the bundle must load and expose the exports the functions use.
const mod = await import(`${pathToFileURL(out).href}?t=${Date.now()}`);
const required = [
  'parseState', 'defaultState', 'DATA_EPOCH', 'isStaleEpoch', 'freshForNewEpoch', 'todayISO', 'istClock', 'istMinutes', 'addDays', 'daysBetween',
  'configureMission', 'programInfo', 'buildAmazonDay', 'amazonSummary', 'amazonLoggedOn',
  'AMAZON_ITEMS', 'amazonItem', 'revisionsDue', 'AMAZON_DAYS', 'AMAZON_DAYOF', 'lcUrl',
  'buildSchedule', 'daySlots', 'studyCapacity', 'dayTypeOf', 'formatHM', 'weekdaySleepHours',
  'sessionFor', 'exerciseSlotFor', 'fitnessWeek', 'fitnessStreak', 'FAT_LOSS_NOTE',
  'quoteForDay', 'EVENING_LINES', 'buildPlan', 'todayWork', 'amazonSlotItems', 'generalSlotItems',
  'dayScore', 'plannedHits', 'dayExtras', 'executionStreak', 'buildPraise', 'dsaTotals', 'dsaStreak',
  'taskById', 'FOUNDATION_SUBJECTS', 'coachFor', 'DAY_TYPE_LABEL', 'formatShort', 'formatLong',
  'formatWeekday', 'weekdayOf', 'DAY_START_HOUR', 'TARGET_DATE', 'DEFAULT_SETTINGS',
];
const missing = required.filter((name) => !(name in mod));
if (missing.length) {
  console.error(`engine.mjs is missing exports: ${missing.join(', ')}`);
  process.exit(1);
}

const kb = Math.round(bundled.length / 1024);
console.log(`engine.mjs — ${kb} KB, ${required.length} exports checked, ${mod.AMAZON_ITEMS.length} Amazon items`);
