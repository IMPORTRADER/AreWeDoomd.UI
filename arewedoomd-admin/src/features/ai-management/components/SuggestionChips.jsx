/**
 * Row of click-to-fill suggestion chips (typing styles, etc.).
 * Renders nothing when there is nothing to suggest — catalog-down safe.
 */
export default function SuggestionChips({ items = [], onPick, disabled = false, label }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
      )}
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPick(item)}
            disabled={disabled}
            className="text-xs rounded-full px-2.5 py-1 border border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-ai-badge-border)] hover:text-[var(--color-ai-accent)] transition-colors text-left"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
