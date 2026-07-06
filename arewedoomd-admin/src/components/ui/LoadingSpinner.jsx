import Spinner from './Spinner';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-svh bg-[var(--color-bg)]">
      <Spinner size="lg" />
    </div>
  );
}
