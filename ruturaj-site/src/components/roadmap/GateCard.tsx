import { useState } from 'react';
import { Lock, Unlock, Rocket, TriangleAlert } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, Button, ProgressBar } from '@/components/ui/primitives';
import { gateStatus, FOUNDATION_UNLOCK_MESSAGE } from '@/engine/foundation';

/**
 * The Foundation Gate. Advanced Mode unlocks when every mandatory milestone
 * is ticked. The override path exists, but it is recorded and shown on every
 * screen, so a forced unlock never reads as an earned one.
 */
export function GateCard() {
  const state = useAppState();
  const update = useUpdateState();
  const gate = gateStatus(state);
  const [confirmOverride, setConfirmOverride] = useState(false);
  const left = gate.mandatoryTotal - gate.mandatoryDone;

  const unlock = (override: boolean) => {
    update((draft) => {
      draft.foundationUnlockedAt = new Date().toISOString();
      draft.foundationOverride = override;
    });
    setConfirmOverride(false);
  };

  return (
    <Card tone={gate.unlocked ? 'success' : 'default'}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {gate.unlocked ? <Unlock size={16} className="text-success" /> : <Lock size={16} className="text-accent" />}
            <p className="font-display text-[17px] font-bold leading-snug">
              {gate.unlocked ? 'Advanced Mode is open' : 'Foundation Gate'}
            </p>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {gate.unlocked
              ? gate.overridden
                ? 'Unlocked by manual override. The mandatory milestones below are still the real bar; they are worth closing anyway.'
                : FOUNDATION_UNLOCK_MESSAGE
              : 'Your courses first: Apna College, then Five Minute Engineering, then PPA, LB, DSA and LSP. Advanced Mode opens when every mandatory milestone below is ticked, not when a button is pressed.'}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="tnum font-display text-[32px] font-bold leading-none text-accent">{gate.pct}%</p>
          <p className="tnum mt-1 text-[11px] text-faint">
            {gate.mandatoryDone}/{gate.mandatoryTotal}
          </p>
        </div>
      </div>

      <ProgressBar value={gate.pct} tone={gate.unlocked ? 'success' : 'accent'} className="mt-4" />

      {!gate.unlocked && (
        <div className="mt-4 space-y-3">
          <Button
            variant={gate.earned ? 'primary' : 'outline'}
            size="lg"
            disabled={!gate.earned}
            onClick={() => unlock(false)}
            className="w-full"
          >
            <Rocket size={17} />
            {gate.earned ? 'Unlock Advanced SDE + AI Engineer Mode' : `${left} mandatory module${left === 1 ? '' : 's'} to go`}
          </Button>

          {!gate.earned && (
            <>
              <p className="text-center text-[12px] text-faint">Still blocking: {gate.blockingSubjects.join(', ')}</p>
              {!confirmOverride ? (
                <button
                  type="button"
                  onClick={() => setConfirmOverride(true)}
                  className="min-h-[44px] w-full text-center text-[12px] text-faint underline underline-offset-4 hover:text-muted"
                >
                  Override and unlock anyway
                </button>
              ) : (
                <div className="rounded-[12px] border border-danger/25 bg-danger-soft p-3">
                  <div className="flex items-start gap-2">
                    <TriangleAlert size={15} className="mt-0.5 shrink-0 text-danger" />
                    <div className="min-w-0">
                      <p className="text-[13px] leading-relaxed">
                        {left} mandatory milestone{left === 1 ? ' is' : 's are'} still open. Overriding is recorded and
                        shown on every screen; it will not read as earned.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button variant="danger" onClick={() => unlock(true)}>
                          Override anyway
                        </Button>
                        <Button variant="ghost" onClick={() => setConfirmOverride(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
