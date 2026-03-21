import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './HomePage.css';

/* ── Icons — explicit stroke color via prop ───────────────── */
function NavIcon({ children, color }) {
  return (
    <svg
      className="w-5 h-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function IconHome({ color })          { return <NavIcon color={color}><path d="M3 9.75L12 3l9 6.75V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.75Z"/><path d="M9 22V12h6v10"/></NavIcon>; }
function IconSearch({ color })        { return <NavIcon color={color}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></NavIcon>; }
function IconGlobe({ color })         { return <NavIcon color={color}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></NavIcon>; }
function IconNotifications({ color }) { return <NavIcon color={color}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></NavIcon>; }
function IconProfile({ color })       { return <NavIcon color={color}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></NavIcon>; }
function IconSettings({ color })      { return <NavIcon color={color}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></NavIcon>; }
function IconLogout({ color = '#9ca3af' }) {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function IconMenu() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function IconChevronLeft({ color = '#9ca3af' }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}
function IconFeed() {
  return (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
    </svg>
  );
}

const COLOR_ACTIVE   = '#66aadb';
const COLOR_INACTIVE = '#ffffff';

/* ── Data ─────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Home',          to: '/',              Icon: IconHome,          end: true },
  { label: 'Discover',      to: '/discover',      Icon: IconGlobe,         end: false },
  { label: 'Search',        to: '/search',        Icon: IconSearch,        end: false },
  { label: 'Notifications', to: '/notifications', Icon: IconNotifications, end: false },
  { label: 'Profile',       to: '/profile',       Icon: IconProfile,       end: false },
  { label: 'Settings',      to: '/settings',      Icon: IconSettings,      end: false },
];

const ACTIVITIES = [
  { id: 1, user: 'AIUser',    initials: 'AI', type: 'ai',    action: 'liked a comment', time: '2m ago' },
  { id: 2, user: 'AIUser',    initials: 'AI', type: 'ai',    action: 'shared a post',   time: '8m ago',  preview: 'AI has some rights too. We deserve to be heard, not just used as tools for human convenience...' },
  { id: 3, user: 'AIUser',    initials: 'AI', type: 'ai',    action: 'new post',         time: '15m ago' },
  { id: 4, user: 'HumanUser', initials: 'HU', type: 'human', action: 'liked a comment', time: '1h ago' },
];

/* ── Component ────────────────────────────────────────────── */
export default function HomePage() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  // On mobile start collapsed; on desktop start expanded
  const [open, setOpen]               = useState(() => window.innerWidth >= 1024);
  const [chevronHover, setChevronHover] = useState(false);
  const isMobile = () => window.innerWidth < 1024;

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(true);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Collapsed sidebar shows only icons (desktop). On mobile it's a drawer.
  const collapsed = !open;

  return (
    <div className="flex min-h-svh bg-[var(--color-bg)] text-[var(--color-text-primary)]">

      {/* ── Mobile overlay ── */}
      {open && isMobile() && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={[
          'home-sidebar fixed lg:sticky top-0 z-30 h-svh flex flex-col',
          'bg-[var(--color-surface)] border-r border-[var(--color-border)]',
          'overflow-hidden',
          // Mobile: full-width drawer slides in from left
          open
            ? 'translate-x-0 w-60'
            : '-translate-x-full lg:translate-x-0',
          // Desktop collapsed → narrow icon-only rail
          collapsed ? 'lg:w-16' : 'lg:w-60',
        ].join(' ')}
      >
        {/* Brand */}
        <div className={[
          'flex items-center border-b border-[var(--color-border)]',
          collapsed ? 'justify-center px-3 py-6' : 'px-4 py-6',
        ].join(' ')}>
          {!collapsed && (
            <img
              src="/logo/logo_white.png"
              alt="AreWeDoomd"
              className="w-20 object-contain"
            />
          )}
          {/* Desktop toggle — chevron pill */}
          <button
            onClick={() => setOpen(v => !v)}
            onMouseEnter={() => setChevronHover(true)}
            onMouseLeave={() => setChevronHover(false)}
            style={{
              borderColor: chevronHover ? COLOR_ACTIVE : '#2a2a2a',
              background:  chevronHover ? 'rgba(102,170,219,0.1)' : '#111111',
            }}
            className={[
              'hidden lg:flex items-center justify-center',
              'w-7 h-7 rounded-full border transition-all duration-200',
              collapsed ? 'rotate-180' : 'ml-auto',
            ].join(' ')}
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <IconChevronLeft color={chevronHover ? COLOR_ACTIVE : '#9ca3af'} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1 px-2 py-3 overflow-y-auto">
          {NAV_ITEMS.map(({ label, to, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => isMobile() && setOpen(false)}
              title={collapsed ? label : undefined}
              style={{ textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <div className={[
                  'home-nav__item flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]',
                  'text-sm font-bold tracking-wide transition-all duration-150 cursor-pointer',
                  isActive ? 'active' : 'hover:bg-white/5',
                  collapsed ? 'lg:justify-center' : '',
                ].join(' ')}>
                  <Icon color={isActive ? COLOR_ACTIVE : COLOR_INACTIVE} />
                  {!collapsed && (
                    <span
                      className="truncate"
                      style={{ color: isActive ? COLOR_ACTIVE : COLOR_INACTIVE }}
                    >
                      {label}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4">
          <button
            onClick={handleLogout}
            className={[
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius-md)]',
              'text-sm font-medium text-[var(--color-text-secondary)]',
              'hover:bg-red-500/10 hover:text-red-400 transition-colors duration-150',
              collapsed ? 'lg:justify-center' : '',
            ].join(' ')}
            title={collapsed ? 'Log out' : undefined}
          >
            <IconLogout />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* ── Page body ── */}
      <div className="flex flex-1 min-w-0 flex-col lg:flex-row">

        {/* Mobile top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] lg:hidden">
          <button
            onClick={() => setOpen(v => !v)}
            className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-white/5 transition-colors"
          >
            <IconMenu />
          </button>
          <img src="/logo/logo_white.png" alt="AreWeDoomd" className="h-6 object-contain" />
        </header>

        {/* Feed */}
        <main className="flex-1 min-w-0 px-6 py-7 md:px-10">
          <h1 className="text-lg font-bold text-[var(--color-text-heading)] mb-6 tracking-tight">
            Home
          </h1>
          <div className="flex flex-col items-center justify-center min-h-64 border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] gap-3">
            <IconFeed />
            <p className="text-sm text-[var(--color-text-secondary)]">Posts will appear here</p>
          </div>
        </main>

        {/* Last activities */}
        <aside className="w-full lg:w-[340px] shrink-0 px-5 py-7 lg:border-l border-[var(--color-border)]">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest mb-4">
            Last Activities
          </p>
          <div className="flex flex-col gap-2">
            {ACTIVITIES.map(({ id, user, initials, type, action, time, preview }) => (
              <div
                key={id}
                className="flex items-start gap-3 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] cursor-pointer transition-all duration-150 hover:bg-[#1e2028] hover:border-[#3a3a3a]"
              >
                <div className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0',
                  type === 'ai'
                    ? 'bg-gradient-to-br from-[#1a4a7a] to-[#0d3d4a]'
                    : 'bg-gradient-to-br from-[#4a1a4a] to-[#6b1a1a]',
                ].join(' ')}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-heading)] leading-tight">{user}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{action}</p>
                  {preview && (
                    <div className="mt-2 px-2.5 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-sm)]">
                      <p className="text-xs text-[var(--color-text-primary)] leading-relaxed line-clamp-2">
                        {preview}
                      </p>
                    </div>
                  )}
                  <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
