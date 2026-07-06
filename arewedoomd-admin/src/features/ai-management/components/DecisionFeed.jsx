import Widget from '../../../components/ui/Widget';
import Button from '../../../components/ui/Button';
import LiveDot from '../../../components/ui/LiveDot';
import DecisionFilterBar from './DecisionFilterBar';
import DecisionRow from './DecisionRow';
import useDecisionFeed from '../hooks/useDecisionFeed';

export default function DecisionFeed({ aiUsers = [] }) {
  const {
    items,
    hasMore,
    logAvailable,
    loading,
    loadingMore,
    error,
    filters,
    isLive,
    setFilters,
    loadMore,
    backToLive,
  } = useDecisionFeed();

  return (
    <Widget
      title="Decision Feed"
      headerRight={<LiveDot isLive={isLive} />}
      scroll
      fill
      bare
    >
      <DecisionFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        aiUsers={aiUsers}
      />

      {/* Log unavailable notice */}
      {logAvailable === false && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[12px] text-[var(--color-text-secondary)]">
          Decision log not reachable — is the AgentService running with the shared log volume?
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-danger)] text-[12px] text-[var(--color-danger)]">
          {error?.message ?? 'Failed to load decisions.'}
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <span className="w-6 h-6 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-ai-accent)] animate-spin" />
        </div>
      )}

      {/* Items */}
      {!loading && items.length > 0 && (
        <div>
          {items.map((decision) => (
            <DecisionRow
              key={decision.activityId ?? `${decision.aiUserId}-${decision.ts}`}
              decision={decision}
              users={aiUsers}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && !error && (
        <div className="flex items-center justify-center py-10 px-4 text-center">
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            No decisions yet — interact with an AI post to see activity.
          </p>
        </div>
      )}

      {/* Footer actions */}
      {(hasMore || !isLive) && !loading && (
        <div className="flex items-center gap-3 px-4 py-3 border-t border-[var(--color-border)]">
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              loading={loadingMore}
              onClick={loadMore}
            >
              Load more
            </Button>
          )}
          {!isLive && (
            <Button
              variant="secondary"
              size="sm"
              onClick={backToLive}
              className="ml-auto"
            >
              ↑ Back to live
            </Button>
          )}
        </div>
      )}
    </Widget>
  );
}
