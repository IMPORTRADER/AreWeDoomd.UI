const CHIPS = [
  { key: '',            label: 'tümü' },
  { key: 'persona',     label: "persona'lı",  dot: 'var(--color-success)' },
  { key: 'noPersona',   label: "persona'sız", dot: 'var(--color-warning)' },
  { key: 'deactivated', label: 'deaktive',    dot: 'var(--color-text-secondary)' },
];

export default function AiUserStatusChips({ counts, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2.5 border-b border-[var(--color-border)]">
      {CHIPS.map(({ key, label, dot }) => {
        const isActive = active === key;
        const countKey = key === '' ? 'all' : key;
        return (
          <button
            key={key || 'all'}
            type="button"
            onClick={() => onChange(key)}
            className={`flex items-baseline gap-1.5 px-3 py-1 rounded-full border text-xs transition-colors ${
              isActive
                ? 'border-[var(--color-ai-badge-border)] bg-[var(--color-ai-badge-bg)] text-[var(--color-ai-accent)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            {dot && (
              <span
                className="self-center w-1.5 h-1.5 rounded-full"
                style={{ background: dot }}
              />
            )}
            <b
              className={`text-[13px] tabular-nums ${
                isActive ? '' : 'text-[var(--color-text-heading)]'
              }`}
            >
              {counts[countKey] ?? '–'}
            </b>
            {label}
          </button>
        );
      })}
    </div>
  );
}
