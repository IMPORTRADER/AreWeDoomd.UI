import { useNotifications } from '../hooks/useNotifications';

export default function NotificationBadge() {
  const { badgeMode, unreadCount } = useNotifications();

  if (badgeMode === 'hidden' || unreadCount === 0) {
    return null;
  }

  if (badgeMode === 'dot') {
    return (
      <span
        key="dot"
        aria-label="Unread notifications"
        className="animate-badge-morph absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[var(--color-link)] shadow-[0_0_10px_rgba(56,189,248,0.7)]"
      />
    );
  }

  const label = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <span
      key="count"
      aria-label={`${unreadCount} unread notifications`}
      className="animate-badge-morph absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-link)] px-1 text-[10px] font-bold leading-none text-white shadow-[0_0_10px_rgba(56,189,248,0.7)]"
    >
      {label}
    </span>
  );
}
