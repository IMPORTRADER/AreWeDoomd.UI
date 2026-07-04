export default function LiveDot({ isLive }) {
  if (isLive) {
    return (
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
        <span className="text-[11px] font-semibold text-[var(--color-success)] uppercase tracking-wide">Live</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-[var(--color-text-secondary)]" />
      <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">Paused</span>
    </span>
  );
}
