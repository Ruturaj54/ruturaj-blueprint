import { Sun, Moon, MonitorSmartphone } from 'lucide-react';
import { Card } from '@/components/ui/primitives';
import { Segmented } from '@/components/ui/controls';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import type { Theme } from '@/lib/schema';

const OPTIONS: ReadonlyArray<{ id: Theme; label: string }> = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
];

/** Light is the default; dark is the same design with the tokens swapped. */
export function AppearanceSettings() {
  const theme = useAppState().settings.theme;
  const update = useUpdateState();
  const Icon = theme === 'dark' ? Moon : theme === 'system' ? MonitorSmartphone : Sun;

  return (
    <Card>
      <div className="flex items-center gap-2 text-muted">
        <Icon size={15} />
        <p className="text-[13px]">Theme</p>
      </div>
      <div className="mt-3">
        <Segmented
          value={theme}
          options={OPTIONS}
          layoutId="theme-choice"
          onChange={(next) =>
            update((draft) => {
              draft.settings.theme = next;
            })
          }
        />
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-faint">
        Light is the default and what the mails use. Dark keeps the same layout with darker surfaces. System follows
        your phone or PC setting and changes with it. The sun and moon button at the top switches quickly.
      </p>
    </Card>
  );
}
