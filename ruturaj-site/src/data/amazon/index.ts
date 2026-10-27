import planJson from './plan.json';
import bankJson from './bank.json';
import freqJson from './freq.json';
import lpJson from './lp.json';
import resumeJson from './resume.json';
import genaiJson from './genai.json';
import dayofJson from './dayof.json';
import sourcesJson from './sources.json';
import coverageJson from './coverage.json';

/**
 * The Amazon SDE-1 tracker content, imported verbatim from the HTML tracker
 * built on 21 Oct 2026 (18 interview reports describing 17 loops + LeetCode frequency data).
 * The JSON files are the data; this module only types and indexes them.
 * Tiers, minutes and the day planner live in src/engine/amazon*.ts.
 */

export type LcDifficulty = 'E' | 'M' | 'H';

export interface RawLc {
  t: 'lc';
  slug: string;
  name: string;
  d: LcDifficulty;
  key: string;
  a?: number;
  src?: string[];
  note?: string;
  n?: number;
  f3?: number;
  f30?: number;
  prem?: boolean;
}

export interface RawTask {
  t: 'task';
  /** Learn, LP, Resume, Mock, GenAI, LLD, Review, Notes, Ladder, Problem, Rest */
  k: string;
  /** May contain <b>…</b> and HTML entities; render through richText(). */
  text: string;
  key: string;
  a?: number;
  src?: string[];
}

export type RawItem = RawLc | RawTask;

export interface AmazonDay {
  n: number;
  phase: number;
  title: string;
  hours: string;
  weekend: boolean;
  coach: string;
  items: RawItem[];
  night: RawItem[];
}

export interface AmazonPhase {
  n: number;
  name: string;
  range: string;
  desc: string;
}

export interface BankRow {
  slug?: string;
  name?: string;
  n?: number;
  d?: LcDifficulty;
  a?: number;
  src: string[];
  keys: string[];
  days: number[];
  f3?: number | null;
  f30?: number | null;
  title?: string;
  sub?: string;
}

export interface BankGroup {
  g: string;
  rows: BankRow[];
}

export interface FreqRow {
  rank: number;
  slug: string;
  name: string;
  n: number;
  d: LcDifficulty;
  f3: number;
  f30: number | null;
  keys?: string[];
  days?: number[];
  xkey?: string;
  contest?: boolean;
}

export interface LpStory {
  id: string;
  q: string;
  s: string;
  p: string[];
  src: string[];
  note: string;
}

export interface ResumeItem {
  id: string;
  t: string;
  q: string;
}

export interface GenAiItem {
  id: string;
  q: string;
  s: string;
  src: string[];
}

export interface DayOfItem {
  id: string;
  q: string;
}

export interface Source {
  short: string;
  label: string;
  url: string;
}

export interface CoverageTopic {
  id: string;
  t: string;
  go: Array<number | string>;
}

export const AMAZON_PHASES = planJson.phases as AmazonPhase[];
export const AMAZON_DAYS = planJson.days as unknown as AmazonDay[];
export const AMAZON_BANK = bankJson as unknown as BankGroup[];
export const AMAZON_FREQ = freqJson as unknown as FreqRow[];
export const AMAZON_LP = lpJson as LpStory[];
export const AMAZON_RESUME = resumeJson as ResumeItem[];
export const AMAZON_GENAI = genaiJson as GenAiItem[];
export const AMAZON_DAYOF = dayofJson as DayOfItem[];
export const AMAZON_SOURCES = sourcesJson as Record<string, Source>;
export const AMAZON_COVERAGE = coverageJson as CoverageTopic[];

/** The tracker's own anchor date (22 Oct 2026). Kept for reference only; Day 1 is now dynamic. */
export const TRACKER_ORIGINAL_START = '2026-10-22';

export const lcUrl = (slug: string): string => `https://leetcode.com/problems/${slug}/`;

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };

/** Plain text from the tracker's light HTML (bold tags and entities only). */
export function plainText(html: string): string {
  return html.replace(/<\/?b>/g, '').replace(/&(amp|lt|gt|quot|#39);/g, (m) => ENTITIES[m] ?? m);
}

/** Splits "a <b>b</b> c" into segments so the UI can bold without innerHTML. */
export function richText(html: string): Array<{ text: string; bold: boolean }> {
  const out: Array<{ text: string; bold: boolean }> = [];
  const re = /<b>(.*?)<\/b>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m.index > last) out.push({ text: plainText(html.slice(last, m.index)), bold: false });
    out.push({ text: plainText(m[1] ?? ''), bold: true });
    last = m.index + m[0].length;
  }
  if (last < html.length) out.push({ text: plainText(html.slice(last)), bold: false });
  return out;
}

export function sourceFor(id: string): Source | undefined {
  return AMAZON_SOURCES[id];
}

export function dayByNumber(n: number): AmazonDay | undefined {
  return AMAZON_DAYS.find((d) => d.n === n);
}
