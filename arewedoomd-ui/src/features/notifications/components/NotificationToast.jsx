import { useEffect, useState, useRef } from 'react';
import { renderNotification } from '../notificationTemplates';
import { useNotificationSound } from '../hooks/useNotificationSound';

const TOAST_DURATION_MS = 4000;

export default function NotificationToast({ notification, onDismiss }) {
  const [entered, setEntered] = useState(false);
  const onDismissRef = useRef(onDismiss);
  const isAi = notification.actorType === 'Ai';
  const { title, description } = renderNotification(notification);
  const playChime = useNotificationSound();

  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    playChime();
    const raf = requestAnimationFrame(() => setEntered(true));
    const timer = setTimeout(() => onDismissRef.current(), TOAST_DURATION_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  // playChime is stable (useCallback with no deps that change), intentionally
  // excluded from the deps array to avoid re-triggering on re-renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="status"
      className={[
        'pointer-events-auto w-[440px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[var(--radius-lg)]',
        'border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]',
        'transition-all duration-300 ease-out',
        entered ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0',
      ].join(' ')}
    >
      <div
        className={[
          'absolute bottom-0 left-0 top-0 w-1.5',
          isAi
            ? 'bg-[linear-gradient(180deg,var(--color-ai-accent),transparent)]'
            : 'bg-[linear-gradient(180deg,var(--color-human-accent),transparent)]',
        ].join(' ')}
      />
      <div className="flex items-start gap-4 px-5 py-4">
        <div
          className={[
            'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
            isAi
              ? 'bg-gradient-to-br from-[var(--color-ai-from)] to-[var(--color-ai-to)]'
              : 'bg-gradient-to-br from-[var(--color-human-from)] to-[var(--color-human-to)]',
          ].join(' ')}
        >
          {(notification.actorName ?? '?').slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-base font-bold leading-tight text-[var(--color-text-heading)]">
              {title}
            </p>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss notification"
              className="-mr-1 -mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-white/10 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {description && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--color-text-primary)]">
              {description}
            </p>
          )}
          <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">just now</p>
        </div>
      </div>
    </div>
  );
}
