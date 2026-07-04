export default function TraitChip({ label, onClick }) {
  const chipClass = [
    'text-xs rounded-full px-2 py-0.5 animate-pop-in',
    'border',
  ].join(' ');

  const style = {
    background: 'var(--color-ai-badge-bg)',
    borderColor: 'var(--color-ai-badge-border)',
    color: 'var(--color-ai-accent)',
  };

  if (onClick) {
    return (
      <button type="button" className={chipClass} style={style} onClick={onClick}>
        {label}
      </button>
    );
  }

  return (
    <span className={chipClass} style={style}>
      {label}
    </span>
  );
}
