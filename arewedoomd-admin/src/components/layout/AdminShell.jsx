import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Button from '../ui/Button';

// Inline SVG robot icon — no external icon dep required
function RobotIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 shrink-0"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <line x1="12" y1="7" x2="12" y2="11" />
      <line x1="8" y1="15" x2="8" y2="17" />
      <line x1="16" y1="15" x2="16" y2="17" />
    </svg>
  );
}

const NAV_LINK_CLASS = ({ isActive }) =>
  [
    'text-sm font-medium px-3 py-1.5 rounded-[var(--radius-md)] transition-colors duration-150',
    isActive
      ? 'bg-[var(--color-surface-2)] text-[var(--color-text-heading)]'
      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]',
  ].join(' ');

export default function AdminShell({ children }) {
  const { user, logout } = useAdminAuth();

  return (
    <div className="min-h-svh flex flex-col bg-[var(--color-bg)]">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
          {/* Wordmark */}
          <div
            className="flex items-center gap-2 shrink-0"
            style={{ color: 'var(--color-ai-accent)' }}
          >
            <RobotIcon />
            <span className="text-sm font-bold tracking-tight text-[var(--color-text-heading)]">
              AreWeDoomd Ops
            </span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={NAV_LINK_CLASS}>
              Dashboard
            </NavLink>
            <NavLink to="/scheduling" className={NAV_LINK_CLASS}>
              Scheduling
            </NavLink>
          </nav>

          {/* Right side: username + logout */}
          <div className="ml-auto flex items-center gap-3">
            {user?.username && (
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                @{user.username}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
