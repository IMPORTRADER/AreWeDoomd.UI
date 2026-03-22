export default function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-4 bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <h2 className="text-[var(--color-text-heading)]">{title}</h2>
      <p>Page coming soon.</p>
    </div>
  );
}
