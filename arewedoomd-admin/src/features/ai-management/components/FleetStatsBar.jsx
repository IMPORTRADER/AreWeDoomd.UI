import Widget from '../../../components/ui/Widget';
import Button from '../../../components/ui/Button';
import useCountUp from '../../../hooks/useCountUp';
import useDelayedLoading from '../../../hooks/useDelayedLoading';
import useAiFleetStats from '../hooks/useAiFleetStats';

function StatTile({ label, value, accent = false }) {
  const displayed = useCountUp(typeof value === 'number' ? value : 0);
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 px-4 py-3 min-w-[90px]">
      <span
        className="text-2xl font-extrabold tabular-nums"
        style={{ color: accent ? 'var(--color-ai-accent)' : 'var(--color-text-heading)' }}
      >
        {typeof value === 'number' ? displayed : value}
      </span>
      <span className="text-[11px] font-medium text-center" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
    </div>
  );
}

function SkeletonTile() {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 min-w-[90px]">
      <div className="skeleton h-7 w-12 rounded" />
      <div className="skeleton h-3 w-16 rounded" />
    </div>
  );
}

export default function FleetStatsBar() {
  const { stats, loading, error, refresh } = useAiFleetStats();
  const showSkeleton = useDelayedLoading(loading);

  if (error) {
    return (
      <Widget bare>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Failed to load fleet stats.
          </span>
          <Button variant="ghost" size="sm" onClick={refresh}>
            Retry
          </Button>
        </div>
      </Widget>
    );
  }

  if (showSkeleton || (!stats && loading)) {
    return (
      <Widget bare>
        <div className="flex flex-wrap items-stretch divide-x divide-[var(--color-border)]">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonTile key={i} />
          ))}
        </div>
      </Widget>
    );
  }

  const {
    totalAiUsers = 0,
    withPersonality = 0,
    decisionsToday = 0,
    executedToday = 0,
    droppedToday = 0,
    failedToday = 0,
    actionsLastHour = 0,
    logAvailable = true,
  } = stats ?? {};

  return (
    <Widget bare>
      <div className="flex flex-wrap items-stretch divide-x divide-[var(--color-border)]">
        <StatTile label="AI Agents" value={totalAiUsers} accent />
        <StatTile label="With persona" value={withPersonality} />
        {logAvailable ? (
          <>
            <StatTile label="Decisions today" value={decisionsToday} />
            <StatTile label="Executed" value={executedToday} />
            <StatTile label="Failed" value={failedToday} />
            <StatTile label="Dropped" value={droppedToday} />
          </>
        ) : (
          <div className="flex items-center px-4 py-3">
            <span className="text-xs italic" style={{ color: 'var(--color-text-secondary)' }}>
              decision log not available yet
            </span>
          </div>
        )}
        <StatTile label="Actions last hour" value={actionsLastHour} />
      </div>
    </Widget>
  );
}
