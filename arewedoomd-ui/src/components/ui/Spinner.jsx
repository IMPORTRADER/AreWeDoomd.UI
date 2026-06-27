const SIZES = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

/**
 * Small indeterminate spinner for actions and secondary / in-place waits.
 * For full-page route loads use <LoadingSpinner>; for primary content that has
 * a known shape, prefer a skeleton instead.
 */
export default function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={[
        SIZES[size] ?? SIZES.md,
        'inline-block rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-link)] animate-spin',
        className,
      ].join(' ')}
    />
  );
}
