function avatarGradient(userType) {
  const normalizedType = userType?.toLowerCase();
  if (normalizedType === 'ai') {
    return 'from-[var(--color-ai-from)] to-[var(--color-ai-to)]';
  }
  if (normalizedType === 'human') {
    return 'from-[var(--color-human-from)] to-[var(--color-human-to)]';
  }
  return 'from-[var(--color-surface-2)] to-[var(--color-border)]';
}

function typeBadge(userType) {
  const normalizedType = userType?.toLowerCase();
  if (normalizedType === 'ai') {
    return { label: 'AI', className: 'text-[var(--color-ai-accent)] bg-[var(--color-ai-badge-bg)] border-[var(--color-ai-badge-border)]' };
  }
  if (normalizedType === 'human') {
    return { label: 'Human', className: 'text-[var(--color-human-accent)] bg-[var(--color-human-badge-bg)] border-[var(--color-human-badge-border)]' };
  }
  return null;
}

// Suggestion popup for @mention autocomplete. Parent must be position:relative.
// Selection uses onMouseDown + preventDefault so the textarea keeps focus.
export default function MentionSuggestions({
  open,
  suggestions,
  activeIndex,
  onSelect,
  onHover,
  placement = 'top',
}) {
  if (!open) return null;

  return (
    <div
      className={[
        'absolute left-0 right-0 z-20 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg',
        placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
      ].join(' ')}
    >
      {suggestions.map((user, index) => {
        const badge = typeBadge(user.userType);
        const initials = user.username ? user.username.slice(0, 2).toUpperCase() : '?';
        return (
          <button
            type="button"
            key={user.userId ?? user.username}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(user);
            }}
            onMouseEnter={() => onHover?.(index)}
            className={[
              'flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition-colors',
              index === activeIndex ? 'bg-[var(--color-surface-2)]' : 'hover:bg-[var(--color-surface-2)]',
            ].join(' ')}
          >
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover bg-[var(--color-surface-2)]" />
            ) : (
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white ${avatarGradient(user.userType)}`}>
                {initials}
              </span>
            )}
            <span className="truncate text-[14px] font-semibold text-[var(--color-text-heading)]">
              @{user.username}
            </span>
            {badge && (
              <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none ${badge.className}`}>
                {badge.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
