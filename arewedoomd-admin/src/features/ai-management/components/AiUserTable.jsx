import { useEffect, useState, useCallback } from 'react';
import Widget from '../../../components/ui/Widget';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import useAiUsers from '../hooks/useAiUsers';
import useAiFleetStats from '../hooks/useAiFleetStats';
import useBulkDeactivate from '../hooks/useBulkDeactivate';
import useDelayedLoading from '../../../hooks/useDelayedLoading';
import AiUserRow from './AiUserRow';
import AiUserStatusChips from './AiUserStatusChips';
import BulkActionBar from './BulkActionBar';
import BulkDeactivateConfirmModal from './BulkDeactivateConfirmModal';

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-[var(--color-border)]">
      <td className="pl-4 pr-2 py-2" style={{ width: 36 }}>
        <div className="skeleton rounded" style={{ width: 15, height: 15 }} />
      </td>
      <td className="py-2 px-2.5">
        <div className="flex items-center gap-2">
          <div className="skeleton rounded-full shrink-0" style={{ width: 28, height: 28 }} />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
      </td>
      <td className="py-2 px-2.5">
        <div className="flex gap-1.5">
          <div className="skeleton h-4 w-14 rounded-full" />
          <div className="skeleton h-4 w-14 rounded-full" />
        </div>
      </td>
      <td className="py-2 px-2.5">
        <div className="skeleton h-4 w-8 rounded-full" />
      </td>
      <td className="py-2 px-2.5">
        <div className="skeleton h-3 w-20 rounded" />
      </td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const skeletonCount = 8;

export default function AiUserTable({ onRowClick, refreshRef, onCreateClick, onBulkClick }) {
  const [search, setSearch] = useState('');
  const [trait,  setTrait]  = useState('');
  const [status, setStatus] = useState('');

  // Selection state
  const [selected, setSelected] = useState(new Set());

  // Confirm modal state
  const [confirm, setConfirm] = useState({ open: false, deactivate: true });

  // Data hooks
  const { users, totalCount, hasMore, loading, loadingMore, error, loadMore, refresh } =
    useAiUsers({ trait, search, status });
  const { stats, refresh: statsRefresh } = useAiFleetStats();
  const { deactivate: bulkDeactivate, busy, error: bulkError, reset: bulkReset } = useBulkDeactivate();

  // Expose refresh to parent via ref
  useEffect(() => {
    if (refreshRef) refreshRef.current = refresh;
  }, [refreshRef, refresh]);

  const showSkeleton = useDelayedLoading(loading);

  // Fleet stat counts for chips
  const totalAiUsers        = stats?.totalAiUsers       ?? 0;
  const withPersonality     = stats?.withPersonality    ?? 0;
  const deactivatedAiUsers  = stats?.deactivatedAiUsers ?? 0;
  const noPersonaCount      = Math.max(0, totalAiUsers - deactivatedAiUsers - withPersonality);

  const chipCounts = {
    all:         totalAiUsers,
    persona:     withPersonality,
    noPersona:   noPersonaCount,
    deactivated: deactivatedAiUsers,
  };

  // ── Selection helpers ──────────────────────────────────────────────────────
  const isAllSelected = users.length > 0 && users.every((u) => selected.has(u.id));
  const isIndeterminate = users.some((u) => selected.has(u.id)) && !isAllSelected;

  const toggleUser = useCallback((user) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(user.id)) {
        next.delete(user.id);
      } else {
        next.add(user.id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      if (users.every((u) => prev.has(u.id))) {
        // Deselect all visible
        const next = new Set(prev);
        users.forEach((u) => next.delete(u.id));
        return next;
      } else {
        // Select all visible
        const next = new Set(prev);
        users.forEach((u) => next.add(u.id));
        return next;
      }
    });
  }, [users]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  // ── Bulk confirm flow ──────────────────────────────────────────────────────
  const openConfirm = (shouldDeactivate) => {
    bulkReset();
    setConfirm({ open: true, deactivate: shouldDeactivate });
  };

  const handleConfirm = async () => {
    const userIds = Array.from(selected);
    try {
      await bulkDeactivate({ userIds, deactivate: confirm.deactivate });
      clearSelection();
      setConfirm({ open: false, deactivate: true });
      refresh();
      statsRefresh();
    } catch {
      // error is displayed inside the modal via bulkError
    }
  };

  const handleCloseConfirm = () => {
    if (!busy) {
      setConfirm({ open: false, deactivate: true });
      bulkReset();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Widget
      title="AI Users"
      subtitle={`${totalCount} agents`}
      scroll={false}
      fill
      bare
      bodyClassName="flex flex-col flex-1 min-h-0"
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
      {/* Status filter chips */}
      <AiUserStatusChips
        counts={chipCounts}
        active={status}
        onChange={(val) => { setStatus(val); setSelected(new Set()); }}
      />

      {/* Toolbar: search + trait input */}
      <div
        className="flex gap-2 px-4 py-2.5 border-b border-[var(--color-border)]"
        style={{ flexShrink: 0 }}
      >
        <Input
          name="ai-search"
          label="Kullanıcı adı ara"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Input
          name="ai-trait-filter"
          label="Trait filtrele"
          value={trait}
          onChange={(e) => setTrait(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
          Failed to load AI users.
        </p>
      )}

      {/* Table scroll area */}
      <div
        className="sidebar-scroll flex-1 min-h-0 overflow-y-auto"
        style={{ position: 'relative' }}
      >
        <table className="w-full border-collapse text-[13px]" style={{ tableLayout: 'fixed' }}>
          <thead
            className="sticky top-0 z-[2]"
            style={{ background: 'var(--color-surface-2)' }}
          >
            <tr>
              <th
                className="py-2 pl-4 pr-2 border-b border-[var(--color-border)] text-left"
                style={{ width: 36 }}
              >
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => { if (el) el.indeterminate = isIndeterminate; }}
                  onChange={toggleAll}
                  style={{ accentColor: 'var(--color-ai-accent)', width: 15, height: 15, cursor: 'pointer' }}
                  title="Görünenlerin tümünü seç"
                />
              </th>
              <th className="py-2 px-2.5 border-b border-[var(--color-border)] text-left text-[10.5px] font-bold uppercase tracking-[0.06em] whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: 'var(--color-text-secondary)', width: '32%' }}>
                Kullanıcı
              </th>
              <th className="py-2 px-2.5 border-b border-[var(--color-border)] text-left text-[10.5px] font-bold uppercase tracking-[0.06em] whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: 'var(--color-text-secondary)', width: '26%' }}>
                Trait&apos;ler
              </th>
              <th className="py-2 px-2.5 border-b border-[var(--color-border)] text-left text-[10.5px] font-bold uppercase tracking-[0.06em] whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: 'var(--color-text-secondary)', width: '16%' }}>
                Persona
              </th>
              <th className="py-2 px-2.5 border-b border-[var(--color-border)] text-left text-[10.5px] font-bold uppercase tracking-[0.06em] whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: 'var(--color-text-secondary)', width: '26%' }}>
                Oluşturulma
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Skeleton */}
            {showSkeleton && !error &&
              Array.from({ length: skeletonCount }).map((_, i) => <SkeletonRow key={i} />)
            }

            {/* Empty */}
            {!showSkeleton && !error && users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-sm text-center"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  No AI users match.
                </td>
              </tr>
            )}

            {/* Rows */}
            {!showSkeleton && !error && users.map((user) => (
              <AiUserRow
                key={user.id}
                user={user}
                selected={selected.has(user.id)}
                onSelect={toggleUser}
                onClick={onRowClick}
              />
            ))}
          </tbody>
        </table>

        {/* Load more */}
        {!showSkeleton && !error && hasMore && (
          <div className="px-4 pt-2 pb-1">
            <Button variant="ghost" size="sm" loading={loadingMore} onClick={loadMore}>
              Load more
            </Button>
          </div>
        )}

        {/* Bulk action bar — slides in from bottom */}
        <BulkActionBar
          count={selected.size}
          onDeactivate={() => openConfirm(true)}
          onReactivate={() => openConfirm(false)}
          onClear={clearSelection}
        />
      </div>

      {/* Confirm modal */}
      {confirm.open && (
        <BulkDeactivateConfirmModal
          count={selected.size}
          deactivate={confirm.deactivate}
          busy={busy}
          error={bulkError}
          onConfirm={handleConfirm}
          onClose={handleCloseConfirm}
        />
      )}
    </Widget>
  );
}
