import {
  parseState,
  defaultState,
  isStaleEpoch,
  freshKeepingSettings,
  DATA_EPOCH,
  type AppState,
} from './schema';
import { getPassphrase } from './passphrase';

export { getPassphrase, setPassphrase, clearPassphrase } from './passphrase';

/**
 * The only place the app touches persistence.
 *
 * Local first: every write lands in localStorage immediately so the UI never
 * waits on the network, then pushes to Netlify Blobs on a debounce. The Blobs
 * copy exists so the scheduled email functions can read real progress — the
 * server has no access to localStorage, which is why the old app's morning
 * email could only ever send a date-derived counter.
 */

const LOCAL_KEY = 'ruturaj_blueprint_v2_state';
const SYNC_URL = '/.netlify/functions/sync';
const PUSH_DEBOUNCE_MS = 1500;

export type SyncStatus =
  | 'idle'
  | 'syncing'
  | 'synced'
  | 'offline'
  /** Passphrase here does not match BLUEPRINT_KEY on the server. */
  | 'unauthorized'
  /** Server has no BLUEPRINT_KEY set at all — a deploy/config problem, not a typo. */
  | 'misconfigured';

/** 503 from the sync endpoint means the server was never given a key. */
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

const listeners = new Set<Listener>();
const statusListeners = new Set<StatusListener>();

/* ---------- local --------------------------------------------------------- */

/** Set when load discarded pre-epoch progress, so init can persist the reset. */
let resetOnLoad = false;

function readLocal(): AppState {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return defaultState();
    const parsed = parseState(JSON.parse(raw));
    if (isStaleEpoch(parsed)) {
      // Progress from before the current epoch is discarded, not migrated.
      // The reset keeps the "never written" timestamp so a real current-epoch
      // copy from another device still wins the next pull.
      resetOnLoad = true;
      return freshKeepingSettings(parsed);
    }
    return parsed;
  } catch {
    // Corrupt or unreadable storage must not brick the app.
    return defaultState();
  }
}

function writeLocal(next: AppState): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  } catch {
    /* quota or private mode — remote sync is still attempted */
  }
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
      headers: {
        'Content-Type': 'application/json',
        'x-blueprint-key': pass,
      },
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

/**
 * Pulls the server copy and adopts it when it is strictly newer than local.
 * Last-write-wins on `updatedAt`. Good enough for a single-user app across a
 * phone and a laptop; it is not a CRDT and does not pretend to be.
 */
export async function pullRemote(): Promise<void> {
  const pass = getPassphrase();
  if (!pass) return;
  setStatus('syncing');
  try {
    const res = await fetch(SYNC_URL, { headers: { 'x-blueprint-key': pass } });
    if (!res.ok) {
      setStatus(statusForFailure(res.status));
      return;
    }
    const remote = parseState(await res.json());
    if (isStaleEpoch(remote)) {
      // The server still holds pre-reset progress. Never adopt it — overwrite
      // it, so the scheduled mail stops reporting milestones that were never
      // actually done.
      if (!isStaleEpoch(state)) await pushRemote();
      else setStatus('synced');
      return;
    }
    if (remote.updatedAt > state.updatedAt) {
      state = remote;
      writeLocal(state);
      emit();
    }
    setStatus('synced');
  } catch {
    setStatus('offline');
  }
}

/* ---------- public API ---------------------------------------------------- */

export function init(): AppState {
  if (!loaded) {
    state = readLocal();
    loaded = true;
    if (resetOnLoad) writeLocal(state);
    initialPull = pullRemote();
  }
  return state;
}

/**
 * Resolves once the first pull from the server has settled. Anything that
 * writes automatically on load must wait for this: a write stamps "now", and
 * on a fresh device that would make an empty state look newer than real
 * progress on the server and overwrite it.
 */
export function whenSynced(): Promise<void> {
  if (!loaded) init();
  return initialPull;
}

export function getState(): AppState {
  if (!loaded) return init();
  return state;
}

/**
 * The single mutation entry point. Takes a producer so callers never hold a
 * stale reference, stamps `updatedAt`, persists, notifies, and queues a push.
 */
export function update(mutate: (draft: AppState) => void): AppState {
  const next: AppState = structuredClone(getState());
  mutate(next);
  next.updatedAt = new Date().toISOString();
  state = next;
  writeLocal(state);
  emit();
  schedulePush();
  return state;
}

/** Replaces all state — used by import. Pushes immediately, not debounced. */
export function replaceState(raw: unknown): AppState {
  state = parseState(raw);
  // An import is deliberate, so it is adopted as current rather than being
  // silently discarded by the epoch check on the next load.
  state.dataEpoch = DATA_EPOCH;
  state.updatedAt = new Date().toISOString();
  writeLocal(state);
  emit();
  void pushRemote();
  return state;
}

export function exportState(): string {
  return JSON.stringify(getState(), null, 2);
}

/**
 * Wipes everything back to a fresh Day 1.
 *
 * Must push as well as clear locally: clearing only this browser would leave
 * the old state on the server, and the next pull would quietly restore it.
 * The sync passphrase is deliberately kept — resetting progress should not
 * also sign you out of your own store.
 *
 * Returns once the server has been told, so the caller can report honestly
 * rather than claiming success while a push is still in flight.
 */
export async function resetAll(): Promise<{ localCleared: boolean; remoteCleared: boolean }> {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }

  // Keep the schedule and targets — the Settings screen promises that — and
  // stamp the reset as the newest write so no other device can sync old
  // progress back over it.
  state = freshKeepingSettings(state);
  state.updatedAt = new Date().toISOString();
  let localCleared = true;
  try {
    localStorage.removeItem(LOCAL_KEY);
    writeLocal(state);
  } catch {
    localCleared = false;
  }
  emit();

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
