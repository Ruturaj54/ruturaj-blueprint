import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { Segmented } from '@/components/ui/controls';
import { spring } from '@/lib/motion';
import type { MailPreviewResult } from '@/lib/mail-api';

type View = 'html' | 'text';

const VIEWS: ReadonlyArray<{ id: View; label: string }> = [
  { id: 'html', label: 'As sent' },
  { id: 'text', label: 'Plain text' },
];

/**
 * A modal that renders a built mail in a fully sandboxed iframe (no scripts,
 * no same-origin access), with the subject line and a plain-text view. A
 * sheet on phones, a centred card on wider screens. Escape closes it.
 */
export function MailPreview({ preview, onClose }: { preview: MailPreviewResult | null; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [view, setView] = useState<View>('html');
  const open = preview !== null;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {preview && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-fg/40 backdrop-blur-sm"
          />
          <div className="pointer-events-none fixed inset-0 z-[71] flex items-end justify-center sm:items-center sm:p-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${preview.type} mail preview`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              transition={spring}
              className="pointer-events-auto flex max-h-[92dvh] w-full max-w-[640px] flex-col overflow-hidden rounded-t-[16px] border border-line bg-surface shadow-card sm:rounded-[16px]"
            >
              <div className="flex items-start gap-3 border-b border-line px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-muted">
                    {preview.type === 'morning' ? 'Morning mail' : 'Evening mail'} · preview
                  </p>
                  <p className="mt-0.5 truncate text-[14px] font-semibold text-fg" title={preview.subject}>
                    {preview.subject || 'No subject'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close preview"
                  className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-fg"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-4 pt-3">
                <Segmented value={view} options={VIEWS} onChange={setView} layoutId="settings-mail-preview-view" />
              </div>

              <div className="min-h-0 flex-1 p-4">
                {view === 'html' ? (
                  <iframe
                    title="Mail preview"
                    srcDoc={preview.html}
                    sandbox=""
                    className="h-[60dvh] w-full rounded-[12px] border border-line bg-surface"
                  />
                ) : (
                  <pre className="h-[60dvh] overflow-auto whitespace-pre-wrap rounded-[12px] border border-line bg-raised p-3 font-mono text-[12.5px] leading-relaxed text-fg">
                    {preview.text || 'No plain-text version was returned.'}
                  </pre>
                )}
              </div>

              <p className="border-t border-line px-4 py-2 text-[11.5px] text-faint">
                Built from the synced state just now. Nothing was sent.
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
