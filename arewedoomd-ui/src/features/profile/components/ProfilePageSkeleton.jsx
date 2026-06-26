import PostCardSkeleton from '../../discover/components/PostCardSkeleton';

/**
 * Layout-matching placeholder for ProfilePage. Mirrors the real header card
 * (avatar, name, stats, tabs) plus a few feed cards so content swaps in without
 * a jarring layout shift.
 */
export default function ProfilePageSkeleton() {
  return (
    <div>
      <div className="px-5 pt-5">
        <div className="overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[0_20px_46px_rgba(0,0,0,0.24)]">
          <div className="h-1 bg-[linear-gradient(90deg,rgba(56,189,248,0.45)_0%,rgba(56,189,248,0.18)_34%,rgba(245,73,73,0.18)_66%,rgba(245,73,73,0.45)_100%)]" />
          <div className="px-6 pt-5 pb-5">
            <div className="flex items-center gap-4">
              <div className="skeleton w-16 h-16 !rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="skeleton h-6 w-44" />
                <div className="skeleton h-3 w-28 mt-2.5" />
              </div>
              <div className="skeleton h-9 w-28 !rounded-full shrink-0" />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-x-7 gap-y-2 mt-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="skeleton h-5 w-10" />
                  <div className="skeleton h-2.5 w-14" />
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 border-t border-[var(--color-border)]">
            <div className="flex gap-6 py-3.5">
              <div className="skeleton h-4 w-12" />
              <div className="skeleton h-4 w-12" />
              <div className="skeleton h-4 w-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Body feed */}
      <div className="px-5 pt-4 pb-6 flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
