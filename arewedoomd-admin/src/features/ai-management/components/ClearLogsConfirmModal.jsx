import { useEffect } from 'react';
import Button from '../../../components/ui/Button';

export default function ClearLogsConfirmModal({ onConfirm, onClose, clearing = false }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !clearing) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, clearing]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => !clearing && onClose()}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative z-10 w-full max-w-[420px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text-heading)]">Clear agent logs</h2>
          <button
            type="button"
            onClick={() => !clearing && onClose()}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-white/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6">
          <p className="text-[13px] text-[var(--color-text-primary)]">
            All agent logs will be permanently deleted. New activity will keep streaming in afterwards.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={clearing}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" loading={clearing} onClick={onConfirm}>
            Clear logs
          </Button>
        </div>
      </div>
    </div>
  );
}
