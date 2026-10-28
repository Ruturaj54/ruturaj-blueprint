import { defaultState, isStaleEpoch, freshForNewEpoch, freshKeepingSettings, DATA_EPOCH, type AppState } from './schema';
import { parseState } from './parse';
import { getPassphrase } from './passphrase';
import { configureMission } from '@/engine/dates';

export { getPassphrase, setPassphrase, clearPassphrase } from './passphrase';

/**
 * The only place the app touches persistence.
 *
 * Local first: every write lands in localStorage immediately, then pushes to
 * Netlify Blobs on a debounce. The Blobs copy is what lets the scheduled
 * mails read real progress. Every time state changes, the general-roadmap
 * day anchor is reconfigured so day math follows the programme.
 */

const LOCAL_KEY = 'ruturaj_blueprint_v2_state';
const SYNC_URL = '/.netlify/functions/sync';
const PUSH_DEBOUNCE_MS = 1500;

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'unauthorized' | 'misconfigured';

function statusForFailure(status: number): SyncStatus {
  if (status === 503) return 'misconfigured';
  if (status === 401) return 'unauthorized';
  return 'offline';
}

type Listener = (state: AppState) => void;
type StatusListener = (status: SyncStatus) => void;

let state: AppState = defaultState();
let loaded = false;
let status: SyncStatus = 'idle';
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let initialPull: Promise<void> = Promise.resolve();
let resetOnLoad = false;
let pulling = false;
let lastPullAt = 0;
/** Minimum gap between pulls triggered by returning to the tab. */
const PULL_THROTTLE_MS = 15_000;

const listeners = new Set<Listener>();
const statusListeners = new Set<StatusListener>();

/* ---------- local --------------------------------------------------------- */

function readLocal(): AppState {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return defaultState();
    const parsed = parseState(JSON.parse(raw));
    if (isStaleEpoch(parsed)) {
      resetOnLoad = true;
      return freshForNewEpoch(parsed);
    }
    return parsed;
  } catch {
    return defaultState();
  }
}

function writeLocal(next: AppState): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  } catch {
    /* quota or private mode; remote sync is still attempted */
  }
}

/** Every state change goes through here so the day anchor can never drift. */
function adopt(next: AppState): void {
  state = next;
  configureMission(next.program.phase === 'general' ? next.program.generalStartedOn : null);
  writeLocal(state);
  emit();
}

/* ---------- subscription -------------------------------------------------- */

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function subscribeStatus(fn: StatusListener): () => void {
  statusListeners.add(fn);
  return () => statusListeners.delete(fn);
}

export function getSyncStatus(): SyncStatus {
  return status;
}

function emit(): void {
  for (const fn of listeners) fn(state);
}

function setStatus(next: SyncStatus): void {
  if (status === next) return;
  status = next;
  for (const fn of statusListeners) fn(next);
}

/* ---------- remote -------------------------------------------------------- */

async function pushRemote(): Promise<void> {
  const pass = getPassphrase();
  if (!pass) return;
  setStatus('syncing');
  try {
    const res = await fetch(SYNC_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-blueprint-key': pass },
      body: JSON.stringify(state),
    });
    setStatus(res.ok ? 'synced' : statusForFailure(res.status));
  } catch {
    setStatus('offline');
  }
}

function schedulePush(): void {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushRemote();
  }, PUSH_DEBOUNCE_MS);
}

/** Pulls the server copy and adopts it when strictly newer. Last write wins. */
export async function pullRemote(): Promise<void> {
  const pass = getPassphrase();
  if (!pass) return;
  pulling = true;
  lastPullAt = Date.now();
  setStatus('syncing');
  try {
    const res = await fetch(SYNC_URL, { headers: { 'x-blueprint-key': pass } });
    if (!res.ok) {
      setStatus(statusForFailure(res.status));
      return;
    }
    const remote = parseState(await res.json());
    if (isStaleEpoch(remote)) {
      if (state.updatedAt === new Date(0).toISOString()) {
        const fresh = freshForNewEpoch(remote);
        fresh.updatedAt = new Date().toISOString();
        adopt(fresh);
      }
      await pushRemote();
      return;
    }
    if (remote.updatedAt > state.updatedAt) adopt(remote);
    setStatus('synced');
  } catch {
    setStatus('offline');
  } finally {
    pulling = false;
  }
}

/**
 * Pull when he comes back to the tab, so a day started on the phone shows on
 * the PC without a reload, and a tab left open adopts the newer server copy
 * before a tick could push its old Day 1 back. Skipped while a local write is
 * waiting to push (the local copy is the newer one) and throttled.
 */
export function pullIfIdle(): void {
  if (pulling || pushTimer || status === 'syncing') return;
  if (Date.now() - lastPullAt < PULL_THROTTLE_MS) return;
  void pullRemote();
}

/* ---------- public API ---------------------------------------------------- */

export function init(): AppState {
  if (!loaded) {
    loaded = true;
    const local = readLocal();
    state = local;
    configureMission(local.program.phase === 'general' ? local.program.generalStartedOn : null);
    if (resetOnLoad) writeLocal(state);
    initialPull = pullRemote();
  }
  return state;
}

/** Resolves once the first pull from the server has settled. */
export function whenSynced(): Promise<void> {
  if (!loaded) init();
  return initialPull;
}

export function getState(): AppState {
  if (!loaded) return init();
  return state;
}

/** The single mutation entry point: produce, stamp, persist, notify, push. */
export function update(mutate: (draft: AppState) => void): AppState {
  const next: AppState = structuredClone(getState());
  mutate(next);
  next.updatedAt = new Date().toISOString();
  adopt(next);
  schedulePush();
  return state;
}

/** Replaces all state (import). Pushes immediately. */
export function replaceState(raw: unknown): AppState {
  const next = parseState(raw);
  next.dataEpoch = DATA_EPOCH;
  next.updatedAt = new Date().toISOString();
  adopt(next);
  void pushRemote();
  return state;
}

export function exportState(): string {
  return JSON.stringify(getState(), null, 2);
}

/**
 * Wipes progress back to a fresh start, here and on the server, keeping the
 * timetable settings and the passphrase. Returns once the server has been told.
 */
export async function resetAll(): Promise<{ localCleared: boolean; remoteCleared: boolean }> {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  const fresh = freshKeepingSettings(state);
  fresh.updatedAt = new Date().toISOString();
  let localCleared = true;
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch {
    localCleared = false;
  }
  adopt(fresh);

  const pass = getPassphrase();
  if (!pass) return { localCleared, remoteCleared: false };
  setStatus('syncing');
  try {
    const res = await fetch(SYNC_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-blueprint-key': pass },
      body: JSON.stringify(state),
    });
    setStatus(res.ok ? 'synced' : statusForFailure(res.status));
    return { localCleared, remoteCleared: res.ok };
  } catch {
    setStatus('offline');
    return { localCleared, remoteCleared: false };
  }
}

/** Forces a push now, e.g. before the tab closes. */
export function flush(): void {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  void pushRemote();
}
