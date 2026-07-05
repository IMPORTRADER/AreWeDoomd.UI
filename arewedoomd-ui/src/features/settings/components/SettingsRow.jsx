import { Link } from 'react-router-dom';

// Tek settings satırı. to → Link, onClick → button, disabled → pasif (rozetli).
// destructive → kırmızı (çıkış/sil). Chevron yalnızca interaktif link/aksiyonda.
export default function SettingsRow({
  icon, label, description, badge, to, onClick,
  disabled = false, destructive = false,
}) {
  const base = [
    'w-full flex items-center gap-3.5 px-4 py-3 text-left transition-colors duration-150',
    disabled
      ? 'opacity-50 cursor-not-allowed'
      : destructive
        ? 'cursor-pointer hover:bg-red-500/10'
        : 'cursor-pointer hover:bg-[var(--color-surface-hover)]',
  ].join(' ');

  const labelColor = destructive ? 'text-red-400' : 'text-[var(--color-text-primary)]';
  const iconColor = destructive ? 'text-red-400' : 'text-[var(--color-text-secondary)]';

  const inner = (
    <>
      {icon && <span className={iconColor}>{icon}</span>}
      <span className="flex-1 min-w-0">
        <span className={`block text-sm font-medium ${labelColor}`}>{label}</span>
        {description && (
          <span className="block text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">{description}</span>
        )}
      </span>
      {badge && (
        <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
          {badge}
        </span>
      )}
      {!badge && !disabled && (to || onClick) && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className="w-4 h-4 shrink-0 text-[var(--color-text-secondary)]">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </>
  );

  if (disabled) return <div className={base} aria-disabled="true">{inner}</div>;
  if (to) return <Link to={to} className={base}>{inner}</Link>;
  return <button type="button" onClick={onClick} className={base}>{inner}</button>;
}
