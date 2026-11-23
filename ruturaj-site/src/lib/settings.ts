/**
 * His settings: the timetable the whole day is built from, mail times,
 * study preferences and appearance. Split out of schema.ts (which re-exports
 * everything here) so each file stays readable.
 */

/**
 * Timetable keys were renamed on 25 Oct 2026 (v2) and his day was rebuilt on
 * 23 Nov 2026 (v3: wake 08:00, home 17:15, freelance, lecture block, 5 km
 * walk). An older blob keeps its preferences and takes the new timetable.
 */
export const SETTINGS_VERSION = 3;

/** Light is the default; system follows the device. */
export type Theme = 'light' | 'dark' | 'system';

export interface Settings {
  settingsVersion: number;
  name: string;
  /* weekday timetable, 24h "HH:MM" IST */
  wakeTime: string;
  /** The morning run. */
  exerciseStart: string;
  exerciseEnd: string;
  /** Leaving home to getting back. */
  officeStart: string;
  officeEnd: string;
  /** Spare light study at the office; 0 by default. */
  officeStudyHours: number;
  /** Block 1: surprise prep. Starts after his own time from officeEnd. */
  studyBlock1Start: string;
  studyBlock1End: string;
  /** Startup and freelance work runs from studyBlock1End to dinnerStart; off gives that time back to block 1. */
  freelanceEnabled: boolean;
  dinnerStart: string;
  /** Block 2: the lecture block (Apna College) after dinner. */
  studyBlock2Start: string;
  studyBlock2End: string;
  /** The walk (and the call home) runs from studyBlock2End to walkEnd. */
  walkEnd: string;
  /** Revise today and plan tomorrow, from walkEnd to studyBlock3End; then sleep. */
  studyBlock3End: string;
  studyBlock3Enabled: boolean;
  /* weekend */
  weekendWakeTime: string;
  weekendSleepTime: string;
  /* exercise */
  /** The evening walk he aims for, in km. */
  walkTargetKm: number;
  /** During surprise prep, the lecture block holds the next Apna College module. */
  parallelLecture: boolean;
  /* email */
  timezone: string;
  morningEmailTime: string;
  eveningEmailTime: string;
  emailEnabled: boolean;
  /* study */
  deepWorkMinutes: number;
  dsaTargetPerDay: number;
  /* appearance */
  theme: Theme;
}

/**
 * His day as he described it on 23 Nov 2026: up at 08:00 and a run until
 * about 08:30, home from the office around 17:15, his own time until 17:30,
 * then study, freelance work, a protein dinner around 20:15, a lecture after
 * dinner, a 5 km walk in the society while he calls home, then revise the day,
 * plan tomorrow and sleep by midnight. Eight hours in bed.
 */
export const DEFAULT_SETTINGS: Settings = {
  settingsVersion: SETTINGS_VERSION,
  name: 'Ruturaj',
  wakeTime: '08:00',
  exerciseStart: '08:05',
  exerciseEnd: '08:30',
  officeStart: '09:15',
  officeEnd: '17:15',
  officeStudyHours: 0,
  studyBlock1Start: '17:30',
  studyBlock1End: '19:30',
  freelanceEnabled: true,
  dinnerStart: '20:15',
  studyBlock2Start: '21:00',
  studyBlock2End: '22:15',
  walkEnd: '23:15',
  studyBlock3End: '23:45',
  studyBlock3Enabled: true,
  weekendWakeTime: '08:00',
  weekendSleepTime: '23:45',
  walkTargetKm: 5,
  parallelLecture: true,
  timezone: 'Asia/Kolkata',
  morningEmailTime: '07:45',
  eveningEmailTime: '17:15',
  emailEnabled: true,
  deepWorkMinutes: 50,
  dsaTargetPerDay: 3,
  theme: 'light',
};

/** Preferences that survive a timetable migration or an epoch change. */
export const PREFERENCE_KEYS = ['emailEnabled', 'dsaTargetPerDay', 'deepWorkMinutes', 'name', 'theme'] as const;
