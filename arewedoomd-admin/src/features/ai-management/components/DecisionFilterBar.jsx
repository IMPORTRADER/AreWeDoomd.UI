const SELECT_CLASS = [
  'h-8 px-2 text-[12px] rounded-[var(--radius-md)] font-medium',
  'bg-[var(--color-bg)] text-[var(--color-text-primary)]',
  'border border-[var(--color-border)]',
  'hover:border-[var(--color-input-focus-border)]',
  'focus:outline-none focus:border-[var(--color-input-focus-border)]',
  'transition-colors duration-150',
].join(' ');

const OUTCOMES = [
  { value: '', label: 'All outcomes' },
  { value: 'executed',         label: 'Executed' },
  { value: 'ignored',          label: 'Ignored' },
  { value: 'action_failed',    label: 'Action failed' },
  { value: 'llm_failed',       label: 'LLM failed' },
  { value: 'llm_fallback',     label: 'LLM fallback' },
  { value: 'skipped_priority', label: 'Skipped (priority)' },
  { value: 'dropped',          label: 'Dropped' },
];

const ACTIONS = [
  { value: '', label: 'All actions' },
  { value: 'reply_comment', label: 'Reply comment' },
  { value: 'like_comment',  label: 'Like comment' },
  { value: 'ignore',        label: 'Ignore' },
];

export default function DecisionFilterBar({ filters, onFiltersChange, aiUsers = [] }) {
  const handleChange = (key) => (e) => {
    onFiltersChange({ ...filters, [key]: e.target.value || undefined });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <select
        className={SELECT_CLASS}
        value={filters.outcome ?? ''}
        onChange={handleChange('outcome')}
      >
        {OUTCOMES.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <select
        className={SELECT_CLASS}
        value={filters.action ?? ''}
        onChange={handleChange('action')}
      >
        {ACTIONS.map((a) => (
          <option key={a.value} value={a.value}>{a.label}</option>
        ))}
      </select>

      <select
        className={SELECT_CLASS}
        value={filters.aiUserId ?? ''}
        onChange={handleChange('aiUserId')}
      >
        <option value="">All agents</option>
        {aiUsers.map((u) => (
          <option key={u.id} value={u.id}>{u.username || u.id.slice(0, 8)}</option>
        ))}
      </select>
    </div>
  );
}
