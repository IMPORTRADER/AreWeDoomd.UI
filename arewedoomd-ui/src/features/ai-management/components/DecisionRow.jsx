import { useState } from 'react';

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30)    return `${days}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const OUTCOME_STYLES = {
  executed:        { color: 'var(--color-success)',        label: 'executed' },
  action_failed:   { color: 'var(--color-danger)',         label: 'action_failed' },
  llm_failed:      { color: 'var(--color-danger)',         label: 'llm_failed' },
  llm_fallback:    { color: 'color-mix(in srgb, var(--color-ai-accent) 60%, transparent)', label: 'llm_fallback' },
  dropped:         { color: 'var(--color-text-secondary)', label: 'dropped' },
  skipped_priority:{ color: 'var(--color-text-secondary)', label: 'skipped_priority' },
  ignored:         { color: 'var(--color-text-secondary)', label: 'ignored' },
};

function OutcomeBadge({ outcome }) {
  const style = OUTCOME_STYLES[outcome] ?? { color: 'var(--color-text-secondary)', label: outcome ?? '—' };
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border"
      style={{ color: style.color, borderColor: style.color }}
    >
      {style.label}
    </span>
  );
}

export default function DecisionRow({ decision, users }) {
  const [expanded, setExpanded] = useState(false);

  const shortId = decision.aiUserId ? decision.aiUserId.slice(0, 8) : '—';
  const username = users?.find((u) => u.id === decision.aiUserId)?.username;
  const displayId = username ? `@${username}` : shortId;

  return (
    <div
      className="animate-slide-in-right cursor-pointer border-b border-[var(--color-border)] last:border-b-0"
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="px-4 py-3 hover:bg-[var(--color-surface)] transition-colors">
        {/* Reasoning (primary line) */}
        <p className="text-[13px] text-[var(--color-text-primary)] leading-snug mb-1.5 break-words">
          {decision.reasoning || (
            <span className="text-[var(--color-text-secondary)] italic">(no reasoning)</span>
          )}
        </p>

        {/* Meta line */}
        <div className="flex items-center gap-2 flex-wrap">
          <OutcomeBadge outcome={decision.outcome} />
          <span className="text-[11px] text-[var(--color-text-secondary)]">{decision.action ?? '—'}</span>
          <span className="text-[11px] text-[var(--color-text-secondary)] font-mono">{displayId}</span>
          <span className="text-[11px] text-[var(--color-text-secondary)] ml-auto">
            {decision.ts ? timeAgo(decision.ts) : '—'}
          </span>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-1.5 text-[12px]">
            {decision.content && (
              <div>
                <span className="text-[var(--color-text-secondary)] font-semibold">Content: </span>
                <span className="text-[var(--color-text-primary)] break-words">{decision.content}</span>
              </div>
            )}
            {decision.activityType && (
              <div>
                <span className="text-[var(--color-text-secondary)] font-semibold">Activity type: </span>
                <span className="text-[var(--color-text-primary)]">{decision.activityType}</span>
              </div>
            )}
            {decision.personaVersion && (
              <div>
                <span className="text-[var(--color-text-secondary)] font-semibold">Persona: </span>
                <span className="text-[var(--color-text-primary)]">
                  v{decision.personaVersion}
                  {decision.personaSource ? ` (${decision.personaSource})` : ''}
                </span>
              </div>
            )}
            {decision.llmAttempts != null && (
              <div>
                <span className="text-[var(--color-text-secondary)] font-semibold">LLM attempts: </span>
                <span className="text-[var(--color-text-primary)]">{decision.llmAttempts}</span>
              </div>
            )}
            {decision.errorDetail && (
              <div>
                <span className="text-[var(--color-danger)] font-semibold">Error: </span>
                <span className="text-[var(--color-text-primary)] break-words">{decision.errorDetail}</span>
              </div>
            )}
            {decision.sessionLogRef && (
              <div>
                <span className="text-[var(--color-text-secondary)] font-semibold">Log ref: </span>
                <span className="text-[var(--color-text-primary)] font-mono text-[11px] break-all">{decision.sessionLogRef}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
