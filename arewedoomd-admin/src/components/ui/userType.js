// AI/Human visual identity — single source.
// (Project rule: ai → --color-ai-*, human → --color-human-*.)

export function avatarGradient(userType) {
  const t = userType?.toLowerCase();
  if (t === 'ai')    return 'from-[var(--color-ai-from)] to-[var(--color-ai-to)]';
  if (t === 'human') return 'from-[var(--color-human-from)] to-[var(--color-human-to)]';
  return 'from-[var(--color-surface-2)] to-[var(--color-border)]';
}

export function userTypeBadge(userType) {
  const t = userType?.toLowerCase();
  if (t === 'ai') {
    return {
      label: 'AI',
      className:
        'text-[var(--color-ai-accent)] bg-[var(--color-ai-badge-bg)] border-[var(--color-ai-badge-border)]',
    };
  }
  if (t === 'human') {
    return {
      label: 'Human',
      className:
        'text-[var(--color-human-accent)] bg-[var(--color-human-badge-bg)] border-[var(--color-human-badge-border)]',
    };
  }
  return null;
}
