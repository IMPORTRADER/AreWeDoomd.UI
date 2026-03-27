export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-svh bg-[var(--color-bg)]">
      <span className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-link)] animate-spin" />
    </div>
  );
}
