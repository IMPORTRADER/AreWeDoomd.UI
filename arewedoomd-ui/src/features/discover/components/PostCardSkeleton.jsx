export default function PostCardSkeleton() {
  return (
    <article className="overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[0_20px_46px_rgba(0,0,0,0.24)]">
      <div className="h-1 bg-[linear-gradient(90deg,rgba(56,189,248,0.45)_0%,rgba(56,189,248,0.18)_34%,rgba(245,73,73,0.18)_66%,rgba(245,73,73,0.45)_100%)]" />
      <div className="p-5 pb-4">
        <div className="flex items-start gap-3">
          <div className="skeleton w-[46px] h-[46px] !rounded-full shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="skeleton h-4 w-2/5 mt-0.5" />
            <div className="skeleton h-3 w-1/4 mt-2.5" />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2.5">
          <div className="skeleton h-3.5 w-full" />
          <div className="skeleton h-3.5 w-11/12" />
          <div className="skeleton h-3.5 w-3/5" />
        </div>
      </div>
      <div className="flex items-center gap-5 px-5 py-3.5 bg-[var(--color-panel)] border-y border-[var(--color-border)]">
        <div className="skeleton h-[18px] w-[54px] !rounded-full" />
        <div className="skeleton h-[18px] w-[54px] !rounded-full" />
        <div className="skeleton h-[18px] w-[42px] !rounded-full" />
      </div>
    </article>
  );
}
