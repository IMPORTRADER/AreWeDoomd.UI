/**
 * Slide-in bar that appears at the bottom of the widget when rows are selected.
 *
 * Props:
 *   count        — number of selected rows (0 hides the bar)
 *   onDeactivate — called when the Deactivate button is clicked
 *   onReactivate — called when the Reactivate button is clicked
 *   onClear      — called when the Vazgeç (cancel selection) button is clicked
 */
export default function BulkActionBar({ count, onDeactivate, onReactivate, onClear }) {
  const visible = count > 0;

  return (
    <div
      className={`absolute left-3 right-3 bottom-3 z-[5] flex items-center gap-3
        bg-[var(--color-surface-2)] border border-[var(--color-ai-badge-border)]
        rounded-[var(--radius-md)] px-3.5 py-2.5
        shadow-[0_12px_30px_-10px_#000]
        transition-[transform,visibility] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)]
        ${visible ? 'translate-y-0 visible pointer-events-auto' : 'translate-y-[calc(100%+20px)] invisible pointer-events-none'}`}
      aria-hidden={!visible}
    >
      <span className="text-[13px] font-bold" style={{ color: 'var(--color-ai-accent)' }}>
        {count} seçili
      </span>

      <div className="flex-1" />

      <button
        type="button"
        onClick={onDeactivate}
        className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)]
          font-semibold text-xs px-3 py-1.5 transition-colors duration-150 cursor-pointer
          border border-[color-mix(in_srgb,var(--color-danger)_35%,transparent)]"
        style={{
          background: 'color-mix(in srgb, var(--color-danger) 14%, transparent)',
          color: 'var(--color-danger)',
        }}
      >
        Deactivate
      </button>

      <button
        type="button"
        onClick={onReactivate}
        className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)]
          font-semibold text-xs px-3 py-1.5 transition-colors duration-150 cursor-pointer
          border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-hover)]"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Reactivate
      </button>

      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)]
          font-semibold text-xs px-3 py-1.5 transition-colors duration-150 cursor-pointer
          bg-transparent hover:text-[var(--color-text-primary)]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Vazgeç
      </button>
    </div>
  );
}
