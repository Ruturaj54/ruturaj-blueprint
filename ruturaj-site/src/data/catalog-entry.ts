/**
 * Single entry point for scripts/gen-catalog.mjs to bundle. Keeps the generator
 * from reaching into individual data modules, so their internal layout can
 * change without breaking the build step.
 */
export { ALL_TASKS } from './tasks';
export { FOUNDATION_SUBJECTS, SEQUENTIAL_TIERS } from './foundation';
export { DSA_PATTERNS } from './tasks/dsa';
