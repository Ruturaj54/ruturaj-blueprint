import { Component, type ErrorInfo, type ReactNode } from 'react';
import * as storage from '@/lib/storage';

interface State {
  error: Error | null;
}

/**
 * The last line of defence: a render error on one screen must never leave a
 * blank page on his phone. It offers a reload and a backup export, so nothing
 * is lost while the bug is fixed.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Blueprint render error:', error, info.componentStack);
  }

  private exportBackup = (): void => {
    const blob = new Blob([storage.exportState()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blueprint-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto max-w-[520px] px-4 py-10">
        <div className="rounded-[16px] border border-danger/30 bg-danger-soft p-5">
          <p className="font-display text-[18px] font-bold text-fg">This screen hit an error.</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
            Your progress is saved on this device and, if sync is on, on the server. Reload to continue; export a backup
            first if you want a copy.
          </p>
          <p className="mt-2 break-words font-mono text-[11.5px] text-faint">{this.state.error.message}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-[44px] rounded-[12px] bg-accent px-4 text-[14px] font-medium text-white"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={this.exportBackup}
              className="min-h-[44px] rounded-[12px] border border-line2 bg-surface px-4 text-[14px] font-medium text-fg"
            >
              Export backup
            </button>
          </div>
        </div>
      </div>
    );
  }
}
