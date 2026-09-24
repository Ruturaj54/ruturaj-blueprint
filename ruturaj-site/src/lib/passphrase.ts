/** The sync passphrase, stored per device. Kept apart from progress state. */

const PASSPHRASE_KEY = 'ruturaj_blueprint_pass';

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
