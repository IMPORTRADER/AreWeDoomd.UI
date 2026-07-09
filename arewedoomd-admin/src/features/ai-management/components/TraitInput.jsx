import { useMemo, useState } from 'react';

const TRAIT_MIN       = 2;
const TRAIT_MAX_CHARS = 60;
const TRAIT_MAX_COUNT = 10;
const DROPDOWN_MAX    = 6;
const CHIP_MAX        = 6;

/**
 * Trait chip editor with catalog-backed autocomplete.
 * Free text is always allowed; suggestions are an aid, not a whitelist.
 */
export default function TraitInput({ traits, onChange, disabled = false, suggestions = [] }) {
  const [input, setInput]         = useState('');
  const [error, setError]         = useState('');
  const [highlight, setHighlight] = useState(-1);

  const atLimit = traits.length >= TRAIT_MAX_COUNT;

  const matches = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return suggestions
      .filter((s) => s.toLowerCase().includes(q) && !traits.includes(s))
      .slice(0, DROPDOWN_MAX);
  }, [input, suggestions, traits]);

  const quickChips = useMemo(
    () => suggestions.filter((s) => !traits.includes(s)).slice(0, CHIP_MAX),
    [suggestions, traits],
  );

  const commit = (raw) => {
    const value = raw.replace(/,$/, '').trim();
    if (!value) {
      setInput('');
      return;
    }
    if (value.length < TRAIT_MIN || value.length > TRAIT_MAX_CHARS) {
      setError(`Traits must be ${TRAIT_MIN}–${TRAIT_MAX_CHARS} characters.`);
      return;
    }
    if (atLimit) {
      setError(`Maximum ${TRAIT_MAX_COUNT} traits allowed.`);
      return;
    }
    if (traits.includes(value)) {
      setError('That trait is already added.');
      return;
    }
    onChange([...traits, value]);
    setInput('');
    setError('');
    setHighlight(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' && matches.length > 0) {
      e.preventDefault();
      setHighlight((h) => (h + 1) % matches.length);
    } else if (e.key === 'ArrowUp' && matches.length > 0) {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? matches.length - 1 : h - 1));
    } else if (e.key === 'Escape') {
      setHighlight(-1);
      setInput('');
    } else if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (highlight >= 0 && highlight < matches.length) {
        commit(matches[highlight]);
      } else {
        commit(input);
      }
    }
  };

  const remove = (t) => onChange(traits.filter((x) => x !== t));

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[var(--color-text-primary)]">
        Traits
        <span className="ml-1 text-xs font-normal text-[var(--color-text-secondary)]">
          ({traits.length}/{TRAIT_MAX_COUNT})
        </span>
      </label>

      {traits.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {traits.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 border"
              style={{
                background: 'var(--color-ai-badge-bg)',
                borderColor: 'var(--color-ai-badge-border)',
                color: 'var(--color-ai-accent)',
              }}
            >
              {t}
              <button
                type="button"
                onClick={() => remove(t)}
                disabled={disabled}
                className="ml-0.5 hover:opacity-70 transition-opacity leading-none"
                aria-label={`Remove ${t}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError('');
            setHighlight(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Add a trait (type for suggestions, Enter to add)"
          disabled={disabled || atLimit}
          role="combobox"
          aria-expanded={matches.length > 0}
          aria-autocomplete="list"
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
        />

        {matches.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-20 mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-card)] overflow-hidden"
          >
            {matches.map((m, i) => (
              <li key={m} role="option" aria-selected={i === highlight}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commit(m)}
                  className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                    i === highlight
                      ? 'bg-white/10 text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-white/5'
                  }`}
                >
                  {m}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {quickChips.length > 0 && !atLimit && (
        <div className="flex flex-wrap gap-1.5">
          {quickChips.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => commit(s)}
              disabled={disabled}
              aria-label={`Add trait ${s}`}
              className="text-xs rounded-full px-2 py-0.5 border border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-ai-badge-border)] hover:text-[var(--color-ai-accent)] transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
