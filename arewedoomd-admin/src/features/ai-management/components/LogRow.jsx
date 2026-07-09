import { useState, useEffect, useRef } from 'react';

const LEVEL_COLORS = {
  info:    'var(--color-text-secondary)',
  warning: 'var(--color-warning)',
  error:   'var(--color-danger)',
};

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function LogRow({ log, users = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [highlight, setHighlight] = useState(Boolean(log.isNew));
  const rowRef = useRef(null);

  useEffect(() => {
    const el = rowRef.current;
    if (!el || !highlight) return;
    const handler = () => setHighlight(false);
    el.addEventListener('animationend', handler);
    return () => el.removeEventListener('animationend', handler);
  }, [highlight]);

  const levelColor = LEVEL_COLORS[log.level] ?? 'var(--color-text-secondary)';
  const username = log.aiUsername
    ?? users.find((u) => u.id === log.aiUserId)?.username;
  const hasDetail = Boolean(log.detail);

  return (
    <div
      ref={rowRef}
      className={`border-b border-[var(--color-border)] last:border-b-0 px-4 py-1.5 ${hasDetail ? 'cursor-pointer hover:bg-[var(--color-surface-hover)]' : ''} ${highlight ? 'row-highlight-new' : ''}`}
      onClick={hasDetail ? () => setExpanded((e) => !e) : undefined}
    >
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="text-[11px] tabular-nums text-[var(--color-text-secondary)] shrink-0">
          {formatTime(log.ts)}
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border shrink-0"
          style={{ color: levelColor, borderColor: levelColor }}
        >
          {log.level}
        </span>
        {log.statusCode === 429 && (
          <span
            className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border shrink-0"
            style={{ color: 'var(--color-warning)', borderColor: 'var(--color-warning)' }}
          >
            429 Rate limited
          </span>
        )}
        <span className="text-[10px] font-semibold text-[var(--color-ai-accent)] shrink-0">
          {log.source}
        </span>
        {username && (
          <span className="text-[11px] text-[var(--color-text-muted)] shrink-0">@{username}</span>
        )}
        <span className="text-[12px] text-[var(--color-text-primary)] truncate">
          {log.message}
        </span>
        {hasDetail && (
          <span className="ml-auto text-[10px] text-[var(--color-text-secondary)] shrink-0">
            {expanded ? '▲' : '▼'}
          </span>
        )}
      </div>
      {expanded && hasDetail && (
        <pre className="mt-1.5 mb-0.5 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] whitespace-pre-wrap break-all">
          {log.detail}
        </pre>
      )}
    </div>
  );
}
