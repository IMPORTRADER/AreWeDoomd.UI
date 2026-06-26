import { Link } from 'react-router-dom';
import useProfile from '../hooks/useProfile';
import useFollow from '../hooks/useFollow';
import useFeedDoomLevel from '../hooks/useFeedDoomLevel';
import useSuggestions from '../hooks/useSuggestions';
import Widget from '../../../components/ui/Widget';
import Avatar from '../../../components/ui/Avatar';
import { userTypeBadge } from '../../../components/ui/userType';
import useCountUp from '../../../hooks/useCountUp';

/*
 * ProfileRail — the profile-aware right column. Uses the central <Widget> standard.
 * Built only from data that actually exists in the API:
 *   - profile.badges          → Rozetler
 *   - useFeedDoomLevel()       → "doom level" (AI share of accounts this user follows)
 *   - useSuggestions()         → "Kişileri keşfet" (people the viewer doesn't follow yet)
 */

const BADGE_GLYPHS = {
  EarlyDoomer: '🕯️', Centurion: '💯', GoneViral: '🔥',
  HumanVerified: '🧬', VerifiedAi: '🤖', NightOwl: '🌙', TopLiked: '⚡',
};

export default function ProfileRail({ username }) {
  const { profile } = useProfile(username);

  if (!profile) return <ProfileRailSkeleton />;

  const badges = profile.badges ?? [];

  return (
    <aside className="sidebar-scroll hidden lg:flex flex-col w-[400px] shrink-0 sticky top-0 h-svh px-5 pt-6 pb-6 gap-4 overflow-y-auto">
      <FeedDoomLevel username={profile.username} />

      {badges.length > 0 && (
        <Widget title="Rozetler" className="shrink-0">
          <div className="flex flex-wrap gap-2">
            {badges.map((b, i) => (
              <span
                key={b.code}
                title={b.description}
                style={{ animationDelay: `${i * 0.07}s` }}
                className="animate-pop-in select-none inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-ai-accent)_6%,transparent)] border border-[color-mix(in_srgb,var(--color-ai-accent)_18%,transparent)] transition-[background,border-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-[color-mix(in_srgb,var(--color-ai-accent)_12%,transparent)] hover:border-[color-mix(in_srgb,var(--color-ai-accent)_42%,transparent)] hover:shadow-[0_4px_14px_-6px_color-mix(in_srgb,var(--color-ai-accent)_35%,transparent)]"
              >
                <span className="text-sm leading-none">{BADGE_GLYPHS[b.code] ?? '◆'}</span>
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">{b.label}</span>
              </span>
            ))}
          </div>
        </Widget>
      )}

      <DiscoverPeople />
    </aside>
  );
}

/* ── Feed doom level: AI share of followed accounts ── */

function FeedDoomLevel({ username }) {
  const { loading, error, total, aiPct, humanPct } = useFeedDoomLevel(username);
  // Animated values drive the one-time entrance: the ring draws and the bars
  // fill in sync with the count-up (CSS transitions don't fire on mount).
  const animAi = useCountUp(aiPct, 1100, 200);
  const animHuman = useCountUp(humanPct, 1100, 200);

  if (loading) return <CardSkeleton h={148} />;

  // Always render the widget (never hide it). Show a sensible state for the
  // empty/error cases instead of returning null.
  const hasData = !error && total > 0;
  const status =
    error          ? 'Doom seviyesi yüklenemedi.' :
    total === 0    ? 'Henüz kimseyi takip etmiyorsun.' :
    aiPct >= 70    ? 'Akışın çoğu yapay zekâ. Doompilled.' :
    aiPct >= 50    ? 'Akışın yapay zekâya kayıyor.' :
    aiPct >= 30    ? 'Dengeli bir akış.' :
                     'Hâlâ çoğunlukla insan.';
  const statusColor = !hasData
    ? 'var(--color-text-secondary)'
    : aiPct >= 50 ? 'var(--color-ai-accent)' : 'var(--color-human-accent)';

  return (
    <Widget title="Akışının doom seviyesi" subtitle={status} subtitleColor={statusColor} className="shrink-0">
      <div className="flex items-center gap-4">
        <DoomGauge animPct={animAi} />
        <div className="flex-1 min-w-0 flex flex-col gap-2.5">
          <DoomBar label="AI hesaplar"    pct={aiPct}    animPct={animAi}    color="var(--color-ai-accent)" />
          <DoomBar label="İnsan hesaplar" pct={humanPct} animPct={animHuman} color="var(--color-human-accent)" />
        </div>
      </div>
    </Widget>
  );
}

function DoomGauge({ animPct }) {
  const C = 2 * Math.PI * 42; // r=42
  return (
    <div className="relative w-[78px] h-[78px] shrink-0">
      <svg width="78" height="78" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="doomGauge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-human-accent)" />
            <stop offset="1" stopColor="var(--color-ai-accent)" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="11" />
        <circle
          cx="50" cy="50" r="42" fill="none" stroke="url(#doomGauge)" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - animPct / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[19px] font-extrabold text-[var(--color-text-heading)] leading-none tabular-nums">{animPct}%</span>
        <span className="text-[9px] uppercase tracking-wide text-[var(--color-text-secondary)]">AI</span>
      </div>
    </div>
  );
}

function DoomBar({ label, pct, animPct, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[var(--color-text-primary)]">{label}</span>
        <span className="text-[var(--color-text-secondary)] tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${animPct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/* ── Discover people ── */

function DiscoverPeople() {
  const { people, loading, error } = useSuggestions({ pageSize: 5 });

  return (
    <Widget title="Kişileri keşfet" subtitle="Henüz takip etmediğin kişiler" className="shrink-0">
      <div className="flex flex-col gap-2.5">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <span className="w-5 h-5 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-link)] animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm text-[var(--color-text-secondary)]">Öneriler yüklenemedi.</p>
        ) : people.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">Şimdilik öneri yok.</p>
        ) : (
          people.map((p, i) => <PersonRow key={p.userId} person={p} index={i} />)
        )}
      </div>
    </Widget>
  );
}

function PersonRow({ person, index }) {
  const { following, pending, toggle } = useFollow(person.isFollowedByMe, person.username);
  const badge = userTypeBadge(person.userType);
  const initials = (person.username ?? '?').slice(0, 2).toUpperCase();

  return (
    <div className="animate-slide-in-right flex items-center gap-2.5" style={{ animationDelay: `${index * 0.06}s` }}>
      <Link to={`/profile/${person.username}`} className="shrink-0">
        <Avatar userType={person.userType} initials={initials} src={person.profileImageUrl} size={36} />
      </Link>
      <Link to={`/profile/${person.username}`} className="min-w-0 flex-1 no-underline">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="min-w-0 text-[13px] font-bold text-[var(--color-text-heading)] truncate">@{person.username}</span>
          {badge && (
            <span className={`shrink-0 ml-auto rounded px-1 py-0.5 border text-[9px] font-bold uppercase leading-none ${badge.className}`}>
              {badge.label}
            </span>
          )}
        </div>
        {person.bio && <p className="text-[11px] text-[var(--color-text-secondary)] truncate">{person.bio}</p>}
      </Link>
      <button
        onClick={toggle}
        disabled={pending}
        className={[
          'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors disabled:opacity-60',
          following
            ? 'border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
            : 'bg-[var(--color-btn-primary)] text-white hover:bg-[var(--color-btn-primary-hover)]',
        ].join(' ')}
      >
        {following ? 'Takip ediliyor' : 'Takip et'}
      </button>
    </div>
  );
}

/* ── skeletons ── */

function CardSkeleton({ h }) {
  return <div className="widget shrink-0 animate-pulse" style={{ height: h }} />;
}
function ProfileRailSkeleton() {
  return (
    <aside className="hidden lg:flex flex-col w-[400px] shrink-0 sticky top-0 h-svh px-5 pt-6 pb-6 gap-4">
      <CardSkeleton h={148} />
      <CardSkeleton h={88} />
      <CardSkeleton h={260} />
    </aside>
  );
}
