import { useState } from 'react';
import Widget from '../../../components/ui/Widget';
import Button from '../../../components/ui/Button';
import LiveDot from '../../../components/ui/LiveDot';
import LogFilterBar from './LogFilterBar';
import LogRow from './LogRow';
import useAgentLogs from '../hooks/useAgentLogs';

export default function LogPanel({ aiUsers = [] }) {
  const {
    items,
    hasMore,
    logAvailable,
    loading,
    loadingMore,
    error,
    filters,
    isLive,
    clearing,
    setFilters,
    loadMore,
    backToLive,
    clearLogs,
  } = useAgentLogs();

  const [search, setSearch] = useState('');

  const handleClear = () => {
    if (!window.confirm('All agent logs will be permanently deleted. Continue?')) return;
    clearLogs();
  };
  const query = search.trim().toLowerCase();
  const visibleItems = query
    ? items.filter((l) =>
        l.message?.toLowerCase().includes(query) || l.detail?.toLowerCase().includes(query))
    : items;

  return (
    <Widget
      title="Agent Logs"
      headerRight={
        <span className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClear}
            disabled={clearing}
            className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-danger)] hover:opacity-75 disabled:opacity-50 transition-opacity cursor-pointer disabled:cursor-default"
          >
            {clearing ? 'Clearing…' : 'Clear'}
          </button>
          <LiveDot isLive={isLive} />
        </span>
      }
      scroll
      fill
      bare
    >
      <LogFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        aiUsers={aiUsers}
        search={search}
        onSearchChange={setSearch}
      />

      {logAvailable === false && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[12px] text-[var(--color-text-secondary)]">
          Agent log not reachable — is the AgentService running with the shared log volume?
        </div>
      )}

      {error && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-danger)] text-[12px] text-[var(--color-danger)]">
          {error?.message ?? 'Failed to load logs.'}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <span className="w-6 h-6 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-ai-accent)] animate-spin" />
        </div>
      )}

      {!loading && visibleItems.length > 0 && (
        <div>
          {visibleItems.map((log, idx) => (
            <LogRow key={`${log.ts}-${idx}`} log={log} users={aiUsers} />
          ))}
        </div>
      )}

      {!loading && visibleItems.length === 0 && !error && (
        <div className="flex items-center justify-center py-10 px-4 text-center">
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            {query ? 'No log entries match your search.' : 'No log entries yet — agent activity will appear here.'}
          </p>
        </div>
      )}

      {(hasMore || !isLive) && !loading && (
        <div className="flex items-center gap-3 px-4 py-3 border-t border-[var(--color-border)]">
          {hasMore && (
            <Button variant="ghost" size="sm" loading={loadingMore} onClick={loadMore}>
              Load more
            </Button>
          )}
          {!isLive && (
            <Button variant="secondary" size="sm" onClick={backToLive} className="ml-auto">
              ↑ Back to live
            </Button>
          )}
        </div>
      )}
    </Widget>
  );
}
