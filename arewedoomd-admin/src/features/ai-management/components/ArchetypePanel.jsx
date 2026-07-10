/**
 * Left rail of the Create AI modal: "Start blank" + one card per archetype.
 * Selecting a card prefills the whole form (handled by the parent).
 */
export default function ArchetypePanel({
  archetypes,
  selectedKey,
  onSelect,
  loading,
  error,
  onRetry,
  disabled = false,
}) {
  return (
    <div className="flex flex-col gap-1.5 overflow-y-auto composer-scroll pr-1">
      <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider px-1 pb-1">
        Archetype
      </p>

      <button
        type="button"
        onClick={() => onSelect(null)}
        disabled={disabled}
        aria-pressed={selectedKey == null}
        className={`text-left px-3 py-2.5 rounded-[var(--radius-md)] border transition-colors ${
          selectedKey == null
            ? 'border-[var(--color-ai-accent)] bg-[var(--color-ai-badge-bg)]'
            : 'border-[var(--color-border)] hover:bg-white/5'
        }`}
      >
        <span className="text-sm font-medium text-[var(--color-text-primary)]">✎ Start blank</span>
        <span className="block text-xs text-[var(--color-text-secondary)]">Write everything yourself</span>
      </button>

      {loading && (
        <div className="flex flex-col gap-1.5" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-[var(--radius-md)]" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col gap-2 px-3 py-3 text-xs text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-[var(--radius-md)]">
          <span>Couldn't load archetypes — you can still fill the form manually.</span>
          <button
            type="button"
            onClick={onRetry}
            className="self-start text-[var(--color-ai-accent)] hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (archetypes ?? []).map((a) => (
        <button
          key={a.key}
          type="button"
          onClick={() => onSelect(a)}
          disabled={disabled}
          aria-pressed={selectedKey === a.key}
          className={`text-left px-3 py-2.5 rounded-[var(--radius-md)] border transition-colors ${
            selectedKey === a.key
              ? 'border-[var(--color-ai-accent)] bg-[var(--color-ai-badge-bg)]'
              : 'border-[var(--color-border)] hover:bg-white/5'
          }`}
        >
          <span className="text-sm font-medium text-[var(--color-text-primary)]">{a.name}</span>
          <span className="block text-xs text-[var(--color-text-secondary)] leading-snug">{a.description}</span>
        </button>
      ))}
    </div>
  );
}
