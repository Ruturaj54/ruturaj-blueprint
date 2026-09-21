// Emits netlify/functions/_shared/catalog.json from the TypeScript data files.
//
// The scheduled email functions need task titles, priorities and foundation
// milestones, but they are bundled separately from the app and cannot import
// TypeScript. Generating the JSON keeps one source of truth instead of a
// hand-maintained copy that silently drifts.
//
// Runs as part of `npm run build`.

import { build } from 'esbuild';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const tmp = resolve(root, 'node_modules/.cache/catalog.mjs');
const out = resolve(root, 'netlify/functions/_shared/catalog.json');

await mkdir(dirname(tmp), { recursive: true });

await build({
  entryPoints: [resolve(root, 'src/data/catalog-entry.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: tmp,
  logLevel: 'silent',
  alias: { '@': resolve(root, 'src') },
});

const mod = await import(pathToFileURL(tmp).href);

const catalog = {
  generatedAt: new Date().toISOString(),
  tasks: mod.ALL_TASKS.map((t) => ({
    id: t.id,
    title: t.title,
    track: t.track,
    priority: t.priority,
    estMinutes: t.estMinutes,
    careerValue: t.careerValue,
    proof: t.proof,
    prereqs: t.prereqs ?? [],
    interviewCritical: t.interviewCritical,
    portfolioCritical: t.portfolioCritical,
  })),
  foundation: mod.FOUNDATION_SUBJECTS.map((s) => ({
    id: s.id,
    name: s.name,
    source: s.source,
    tier: s.tier,
    milestones: s.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      mandatory: m.mandatory,
      estMinutes: m.estMinutes,
    })),
  })),
  patterns: mod.DSA_PATTERNS.map((p) => ({
    id: p.id,
    name: p.name,
    weight: p.weight,
    targetProblems: p.targetProblems,
  })),
};

await mkdir(dirname(out), { recursive: true });
await writeFile(out, JSON.stringify(catalog, null, 2), 'utf-8');
await rm(tmp, { force: true });

const mandatory = catalog.foundation.reduce(
  (n, s) => n + s.milestones.filter((m) => m.mandatory).length,
  0,
);
console.log(
  `catalog.json — ${catalog.tasks.length} tasks, ${catalog.foundation.length} subjects ` +
    `(${mandatory} mandatory milestones), ${catalog.patterns.length} DSA patterns`,
);
