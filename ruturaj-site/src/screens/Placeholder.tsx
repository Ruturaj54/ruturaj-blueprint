import { Construction } from 'lucide-react';
import { Card } from '@/components/ui/primitives';

/** Temporary shell for screens not yet built, so navigation is never a dead end. */
export function Placeholder({ title, blurb }: { title: string; blurb: string }) {
  return (
    <Card animate={false} className="flex flex-col items-center gap-3 py-12 text-center">
      <Construction size={22} className="text-faint" />
      <p className="font-display text-[20px] font-bold">{title}</p>
      <p className="max-w-[380px] text-[13px] text-muted">{blurb}</p>
    </Card>
  );
}
