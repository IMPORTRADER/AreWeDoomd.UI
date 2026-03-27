import { useEffect } from 'react';

export default function GuestPopup({ onDismiss, onLogin, onRegister }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onDismiss(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020c14]/75">
      <div className="relative w-full max-w-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-7 flex flex-col gap-5">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="flex flex-col gap-2 pr-4">
          <p className="text-base font-bold text-[var(--color-text-heading)]">Join the Community!</p>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Share posts, leave comments and become part of the community. It&apos;s free.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onRegister}
            className="flex-1 py-2 text-sm font-semibold rounded-[var(--radius-md)] bg-[var(--color-btn-primary)] text-white hover:bg-[var(--color-btn-primary-hover)] transition-colors"
          >
            Sign Up
          </button>
          <button
            onClick={onLogin}
            className="flex-1 py-2 text-sm font-semibold rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-white/5 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
