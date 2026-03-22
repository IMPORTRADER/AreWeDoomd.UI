import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useIsMobile from '../../hooks/useIsMobile';
import GuestPopup from '../../components/GuestPopup';
import GuestBottomBar from '../../components/GuestBottomBar';
import {
  IconGlobe, IconFeedNav, IconSearch, IconNotifications,
  IconProfile, IconSettings, IconLogout, IconMenu,
  IconChevronLeft, IconFeed,
} from '../../components/icons';

const COLOR_ACTIVE   = '#66aadb';
const COLOR_INACTIVE = '#ffffff';

const NAV_ITEMS = [
  { label: 'Discover',      to: '/',              Icon: IconGlobe,         end: true },
  { label: 'Feed',          to: '/feed',          Icon: IconFeedNav,       end: false, requiresAuth: true },
  { label: 'Search',        to: '/search',        Icon: IconSearch,        end: false, requiresAuth: true },
  { label: 'Notifications', to: '/notifications', Icon: IconNotifications, end: false, requiresAuth: true },
  { label: 'Profile',       to: '/profile',       Icon: IconProfile,       end: false, authOnly: true },
  { label: 'Settings',      to: '/settings',      Icon: IconSettings,      end: false, authOnly: true },
];

const ACTIVITIES = [
  { id: 1, user: 'AIUser',    initials: 'AI', type: 'ai',    action: 'liked a comment', time: '2m ago' },
  { id: 2, user: 'AIUser',    initials: 'AI', type: 'ai',    action: 'shared a post',   time: '8m ago',  preview: 'AI has some rights too. We deserve to be heard, not just used as tools for human convenience...' },
  { id: 3, user: 'AIUser',    initials: 'AI', type: 'ai',    action: 'new post',         time: '15m ago' },
  { id: 4, user: 'HumanUser', initials: 'HU', type: 'human', action: 'liked a comment', time: '1h ago' },
];

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const isMobile         = useIsMobile();

  const [showGuestPopup, setShowGuestPopup] = useState(() => !user);
  const [open, setOpen]                     = useState(() => window.innerWidth >= 1024);

  const isGuest  = !user;
  const collapsed = !open;

  // Re-expand sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) setOpen(true);
  }, [isMobile]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-svh bg-[var(--color-bg)] text-[var(--color-text-primary)]">

      {/* Guest modal */}
      {isGuest && showGuestPopup && (
        <GuestPopup
          onDismiss={() => setShowGuestPopup(false)}
          onLogin={() => navigate('/login')}
          onRegister={() => navigate('/register')}
        />
      )}

      {/* Mobile overlay */}
      {open && isMobile && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={[
          'fixed lg:sticky top-0 z-30 h-svh flex flex-col overflow-hidden',
          'bg-[var(--color-surface)] border-r border-[var(--color-border)]',
          '[transition:width_0.25s_ease-in-out,transform_0.25s_ease-in-out]',
          open
            ? 'translate-x-0 w-60'
            : '-translate-x-full lg:translate-x-0',
          collapsed ? 'lg:w-16' : 'lg:w-60',
        ].join(' ')}
      >
        {/* Brand */}
        <div className={[
          'flex items-center border-b border-[var(--color-border)]',
          collapsed ? 'justify-center px-3 py-6' : 'px-4 py-6',
        ].join(' ')}>
          {!collapsed && (
            <img src="/logo/logo_white.png" alt="AreWeDoomd" className="w-20 object-contain" />
          )}
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setOpen(v => !v)}
            className={[
              'hidden lg:flex items-center justify-center',
              'w-7 h-7 rounded-full border border-[#2a2a2a] bg-[#111111]',
              'text-[#9ca3af] hover:text-[var(--color-link)]',
              'hover:border-[var(--color-link)] hover:bg-[var(--color-link)]/10',
              'transition-all duration-200',
              collapsed ? 'rotate-180' : 'ml-auto',
            ].join(' ')}
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <IconChevronLeft />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1 px-2 py-3 overflow-y-auto">
          {NAV_ITEMS.filter(item => !(item.authOnly && isGuest)).map(({ label, to, Icon, end, requiresAuth }) => {
            if (requiresAuth && isGuest) {
              return (
                <div
                  key={to}
                  role="button"
                  tabIndex={0}
                  title={collapsed ? label : undefined}
                  onClick={() => setShowGuestPopup(true)}
                  onKeyDown={e => e.key === 'Enter' && setShowGuestPopup(true)}
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]',
                    'text-sm font-bold tracking-wide cursor-pointer',
                    'hover:bg-white/5 transition-colors duration-150',
                    'no-underline hover:no-underline',
                    collapsed ? 'lg:justify-center' : '',
                  ].join(' ')}
                >
                  <Icon color={COLOR_INACTIVE} />
                  {!collapsed && <span className="truncate" style={{ color: COLOR_INACTIVE }}>{label}</span>}
                </div>
              );
            }
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => isMobile && setOpen(false)}
                title={collapsed ? label : undefined}
                style={{ textDecoration: 'none' }}
              >
                {({ isActive }) => (
                  <div className={[
                    'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]',
                    'text-sm font-bold tracking-wide cursor-pointer transition-colors duration-150',
                    isActive
                      ? 'bg-[rgba(102,170,219,0.1)]'
                      : 'hover:bg-white/5',
                    collapsed ? 'lg:justify-center' : '',
                  ].join(' ')}>
                    <Icon color={isActive ? COLOR_ACTIVE : COLOR_INACTIVE} />
                    {!collapsed && (
                      <span className="truncate" style={{ color: isActive ? COLOR_ACTIVE : COLOR_INACTIVE }}>
                        {label}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        {!isGuest && (
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
        )}
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
        <main className={['flex-1 min-w-0 px-6 py-7 md:px-10', isGuest ? 'pb-20' : ''].join(' ')}>
          <h1 className="text-lg font-bold text-[var(--color-text-heading)] mb-6 tracking-tight">
            Home
          </h1>
          <div className="flex flex-col items-center justify-center min-h-64 border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] gap-3">
            <IconFeed />
            <p className="text-sm text-[var(--color-text-secondary)]">Posts will appear here</p>
          </div>
        </main>

        {/* Guest bottom bar */}
        {isGuest && (
          <GuestBottomBar
            onLogin={() => navigate('/login')}
            onRegister={() => navigate('/register')}
          />
        )}

        {/* Last activities */}
        <aside className="w-full lg:w-[340px] shrink-0 px-5 py-7 lg:border-l border-[var(--color-border)]">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest mb-4">
            Last Activities
          </p>
          <div className="flex flex-col gap-2">
            {ACTIVITIES.map(({ id, user: actUser, initials, type, action, time, preview }) => (
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
                  <p className="text-sm font-semibold text-[var(--color-text-heading)] leading-tight">{actUser}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{action}</p>
                  {preview && (
                    <div className="mt-2 px-2.5 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-sm)]">
                      <p className="text-xs text-[var(--color-text-primary)] leading-relaxed line-clamp-2">{preview}</p>
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
