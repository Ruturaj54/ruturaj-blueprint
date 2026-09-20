import { parseState, defaultState, type AppState } from './schema';

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
const PASSPHRASE_KEY = 'ruturaj_blueprint_pass';
const SYNC_URL = '/.netlify/functions/sync';
const PUSH_DEBOUNCE_MS = 1500;

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'unauthorized';

type Listener = (state: AppState) => void;
type StatusListener = (status: SyncStatus) => void;

let state: AppState = defaultState();
let loaded = false;
let status: SyncStatus = 'idle';
let pushTimer: ReturnType<typeof setTimeout> | null = null;

const listeners = new Set<Listener>();
const statusListeners = new Set<StatusListener>();

/* ---------- passphrase ---------------------------------------------------- */

export function getPassphrase(): string | null {
  try {
    return localStorage.getItem(PASSPHRASE_KEY);
  } catch {
    return null;
  }
}

export function setPassphrase(value: string): void {
  try {
    localStorage.setItem(PASSPHRASE_KEY, value);
  } catch {
    /* private mode — the app still works, it just will not sync */
  }
}

export function clearPassphrase(): void {
  try {
    localStorage.removeItem(PASSPHRASE_KEY);
  } catch {
    /* nothing useful to do */
  }
}

/* ---------- local --------------------------------------------------------- */

function readLocal(): AppState {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return defaultState();
    return parseState(JSON.parse(raw));
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
    if (res.status === 401) {
      setStatus('unauthorized');
      return;
    }
    setStatus(res.ok ? 'synced' : 'offline');
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
    if (res.status === 401) {
      setStatus('unauthorized');
      return;
    }
    if (!res.ok) {
      setStatus('offline');
      return;
    }
    const remote = parseState(await res.json());
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
    void pullRemote();
  }
  return state;
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
  state.updatedAt = new Date().toISOString();
  writeLocal(state);
  emit();
  void pushRemote();
  return state;
}

export function exportState(): string {
  return JSON.stringify(getState(), null, 2);
}

/** Forces a push now, e.g. before the tab closes. */
export function flush(): void {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  void pushRemote();
}
