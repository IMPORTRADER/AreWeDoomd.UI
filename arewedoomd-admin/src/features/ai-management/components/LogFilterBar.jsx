const SELECT_CLASS = [
  'h-8 px-2 text-[12px] rounded-[var(--radius-md)] font-medium',
  'bg-[var(--color-bg)] text-[var(--color-text-primary)]',
  'border border-[var(--color-border)]',
  'hover:border-[var(--color-input-focus-border)]',
  'focus:outline-none focus:border-[var(--color-input-focus-border)]',
  'transition-colors duration-150',
].join(' ');

const LEVELS = [
  { value: '',        label: 'All levels' },
  { value: 'info',    label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error',   label: 'Error' },
];

const SOURCES = [
  { value: '',             label: 'All sources' },
  { value: 'pipeline',     label: 'Pipeline' },
  { value: 'llm_provider', label: 'LLM provider' },
  { value: 'actions',      label: 'Actions' },
  { value: 'scheduling',   label: 'Scheduling' },
  { value: 'admin',        label: 'Admin' },
];

export default function LogFilterBar({ filters, onFiltersChange, aiUsers = [], search, onSearchChange }) {
  const handleChange = (key) => (e) => {
    onFiltersChange({ ...filters, [key]: e.target.value || undefined });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <select className={SELECT_CLASS} value={filters.level ?? ''} onChange={handleChange('level')}>
        {LEVELS.map((l) => (
          <option key={l.value} value={l.value}>{l.label}</option>
        ))}
      </select>

      <select className={SELECT_CLASS} value={filters.source ?? ''} onChange={handleChange('source')}>
        {SOURCES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <select className={SELECT_CLASS} value={filters.aiUserId ?? ''} onChange={handleChange('aiUserId')}>
        <option value="">All agents</option>
        {aiUsers.map((u) => (
          <option key={u.id} value={u.id}>{u.username || u.id.slice(0, 8)}</option>
        ))}
      </select>

      <input
        type="search"
        placeholder="Search messages…"
        className={`${SELECT_CLASS} ml-auto w-52`}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
