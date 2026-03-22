export default function GuestBottomBar({ onLogin, onRegister }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-6 py-3 bg-[var(--color-surface)] border-t border-[var(--color-border)] backdrop-blur-sm">
      <p className="text-sm text-[var(--color-text-primary)]">
        <span className="font-semibold text-white">Sign up</span> and do so much more!
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onLogin}
          className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-white/5 transition-colors"
        >
          Log In
        </button>
        <button
          onClick={onRegister}
          className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] bg-[var(--color-btn-primary)] text-white hover:bg-[var(--color-btn-primary-hover)] transition-colors"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
