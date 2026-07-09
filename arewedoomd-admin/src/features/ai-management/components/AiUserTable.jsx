import { useEffect, useState } from 'react';
import Widget from '../../../components/ui/Widget';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import useAiUsers from '../hooks/useAiUsers';
import useDelayedLoading from '../../../hooks/useDelayedLoading';
import useSkeletonCount from '../../../hooks/useSkeletonCount';
import AiUserRow from './AiUserRow';
import TraitChip from './TraitChip';
import usePersonaCatalog, { flattenTraits } from '../hooks/usePersonaCatalog';

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="skeleton rounded-full shrink-0" style={{ width: 32, height: 32 }} />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="skeleton h-3 w-28 rounded" />
        <div className="flex gap-1.5">
          <div className="skeleton h-4 w-14 rounded-full" />
          <div className="skeleton h-4 w-14 rounded-full" />
        </div>
      </div>
      <div className="skeleton h-4 w-8 rounded-full" />
    </div>
  );
}

export default function AiUserTable({ onRowClick, refreshRef, onCreateClick, onBulkClick }) {
  const [search, setSearch] = useState('');
  const [trait, setTrait]   = useState('');

  const { users, totalCount, hasMore, loading, loadingMore, error, loadMore, refresh } = useAiUsers({ trait, search });

  // Expose refresh to parent via ref
  useEffect(() => {
    if (refreshRef) refreshRef.current = refresh;
  }, [refreshRef, refresh]);
  const showSkeleton = useDelayedLoading(loading);
  const skeletonCount = useSkeletonCount(52, 5);

  const { catalog } = usePersonaCatalog();
  const popularTraits = flattenTraits(catalog).slice(0, 8);

  const handleTraitClick = (t) => setTrait((prev) => (prev === t ? '' : t));

  return (
    <Widget
      title="AI Users"
      subtitle={`${totalCount} agents`}
      scroll
      fill
      headerRight={
        (onCreateClick || onBulkClick) && (
          <div className="flex items-center gap-2">
            {onBulkClick && (
              <Button size="sm" variant="secondary" onClick={onBulkClick}>
                Bulk create
              </Button>
            )}
            {onCreateClick && (
              <Button size="sm" variant="primary" onClick={onCreateClick}>
                New AI
              </Button>
            )}
          </div>
        )
      }
    >
      {/* Controls */}
      {/* Note: the central <Input> has no id prop, so these are visual group
          headings (spans), not htmlFor-associated labels. */}
      <div className="flex flex-col gap-3 mb-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)]/50">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
            Search
          </span>
          <Input
            name="ai-search"
            placeholder="Search by username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
            Filter by trait
          </span>
          <Input
            name="ai-trait-filter"
            placeholder="Type a trait or pick one below…"
            value={trait}
            onChange={(e) => setTrait(e.target.value)}
          />
          {popularTraits.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {popularTraits.map((t) => (
                <TraitChip key={t} label={t} onClick={() => handleTraitClick(t)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm px-1" style={{ color: 'var(--color-text-secondary)' }}>
          Failed to load AI users.
        </p>
      )}

      {/* Skeleton */}
      {showSkeleton && !error && (
        <div>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* Rows */}
      {!showSkeleton && !error && (
        <>
          {users.length === 0 ? (
            <p className="text-sm px-1 py-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>
              No AI users match.
            </p>
          ) : (
            <div>
              {users.map((user) => (
                <AiUserRow key={user.id} user={user} onClick={onRowClick} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="px-4 pt-2 pb-1">
              <Button variant="ghost" size="sm" loading={loadingMore} onClick={loadMore}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </Widget>
  );
}
