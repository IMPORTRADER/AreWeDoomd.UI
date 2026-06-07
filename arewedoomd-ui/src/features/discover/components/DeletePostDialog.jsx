import { useEffect } from 'react';

export default function DeletePostDialog({ open, onClose, onConfirm, isDeleting, error }) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isDeleting) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeleting, onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={isDeleting ? undefined : onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-post-title"
        className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-[var(--color-border)]">
          <p id="delete-post-title" className="text-base font-semibold text-[var(--color-text-heading)]">
            Delete post
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            This action cannot be undone. The post will be permanently removed from the feed.
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-[var(--radius-md)] border border-red-500/20 bg-red-500/[0.06] px-4 py-3">
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
              Are you sure you want to continue?
            </p>
          </div>

          {error && (
            <p className="mt-3 text-xs text-[var(--color-danger)]">{error}</p>
          )}

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-full border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-primary)] hover:bg-white/5 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-red-500 text-white hover:bg-red-400 transition-colors disabled:opacity-60"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
