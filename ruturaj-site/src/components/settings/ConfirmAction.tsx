import { useState, type ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';

type Tone = 'warn' | 'danger' | 'accent' | 'amazon';

const TONE: Record<Tone, { box: string; icon: string }> = {
  warn: { box: 'border-warn/30 bg-warn-soft', icon: 'text-warn' },
  danger: { box: 'border-danger/30 bg-danger-soft', icon: 'text-danger' },
  accent: { box: 'border-accent/25 bg-accent-soft', icon: 'text-accent' },
  amazon: { box: 'border-amazon/30 bg-amazon-soft', icon: 'text-amazon' },
};

/**
 * A button that asks once before it acts. The first tap swaps the button for
 * an explanation plus Confirm / Cancel, so nothing irreversible happens on a
 * single touch. `onConfirm` may be async; the confirm button shows busy.
 */
export function ConfirmAction({
  label,
  icon,
  explain,
  confirmLabel = 'Yes, go ahead',
  busyLabel = 'Working',
  variant = 'outline',
  tone = 'warn',
  disabled,
  className,
  onConfirm,
}: {
  label: ReactNode;
  icon?: ReactNode;
  explain: ReactNode;
  confirmLabel?: string;
  busyLabel?: string;
  variant?: 'primary' | 'outline' | 'danger' | 'amazon' | 'success';
  tone?: Tone;
  disabled?: boolean;
  className?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  if (!open) {
    return (
      <Button variant={variant} disabled={disabled} className={className} onClick={() => setOpen(true)}>
        {icon}
        {label}
      </Button>
    );
  }

  const confirmVariant = variant === 'outline' ? 'primary' : variant;
  return (
    <div className={cn('rounded-[12px] border p-3', TONE[tone].box, className)}>
      <div className="flex items-start gap-2">
        <TriangleAlert size={15} className={cn('mt-0.5 shrink-0', TONE[tone].icon)} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] leading-relaxed text-fg">{explain}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant={confirmVariant} onClick={() => void run()} disabled={busy}>
              {busy ? `${busyLabel}...` : confirmLabel}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
