// The two daily mails. Each returns { subject, html, text } for a digest from
// digest.mjs. The renderers live in morning.mjs and evening.mjs; this is the
// one import the functions and scripts use.

export { buildMorning } from './morning.mjs';
export { buildEvening } from './evening.mjs';
