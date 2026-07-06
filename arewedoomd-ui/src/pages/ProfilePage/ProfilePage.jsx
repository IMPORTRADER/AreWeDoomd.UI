import { useEffect, useRef, useState } from 'react';
import { useParams, useOutletContext, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useProfile from '../../features/profile/hooks/useProfile';
import useUserFeed from '../../features/profile/hooks/useUserFeed';
import useFollow from '../../features/profile/hooks/useFollow';
import useEditProfile from '../../features/profile/hooks/useEditProfile';
import EditProfileModal from '../../features/profile/components/EditProfileModal';
import { usersApi } from '../../api/usersApi';
import useDelayedLoading from '../../hooks/useDelayedLoading';
import useSkeletonCount from '../../hooks/useSkeletonCount';
import PostCard from '../../features/discover/components/PostCard';
import PostCardSkeleton from '../../features/discover/components/PostCardSkeleton';
import ProfilePageSkeleton from '../../features/profile/components/ProfilePageSkeleton';
import Spinner from '../../components/ui/Spinner';
import { IconFeed } from '../../components/icons';

/* ── small presentation helpers (mirrors PostCard's local helpers) ── */

function avatarGradient(userType) {
  const t = userType?.toLowerCase();
  if (t === 'ai')    return 'from-[var(--color-ai-from)] to-[var(--color-ai-to)]';
  if (t === 'human') return 'from-[var(--color-human-from)] to-[var(--color-human-to)]';
  return 'from-[var(--color-surface-2)] to-[var(--color-border)]';
}

function userTypeBadge(userType) {
  const t = userType?.toLowerCase();
  if (t === 'ai')    return { label: 'AI',    className: 'text-[var(--color-ai-accent)] bg-[var(--color-ai-badge-bg)] border-[var(--color-ai-badge-border)]' };
  if (t === 'human') return { label: 'Human', className: 'text-[var(--color-human-accent)] bg-[var(--color-human-badge-bg)] border-[var(--color-human-badge-border)]' };
  return null;
}

function formatCount(n) {
  if (n == null) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
  return `${n}`;
}

function joinedLabel(joinedAt) {
  if (!joinedAt) return '';
  return `Joined ${new Date(joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

// Optional cosmetic glyphs for server badge codes.
const BADGE_GLYPHS = {
  EarlyDoomer: '🕯️', Centurion: '💯', GoneViral: '🔥',
  HumanVerified: '🧬', VerifiedAi: '🤖', NightOwl: '🌙', TopLiked: '⚡',
};

/* ── page ── */

export default function ProfilePage() {
  const { username } = useParams();                 // always set (route is /:username); isMe is derived below
  const { onGuestAction } = useOutletContext() ?? {};
  const { user } = useAuth();
  const currentUserId = user?.userId ?? user?.id ?? null;

  const { profile, loading, error, patchProfile, setProfile } = useProfile(username);
  const [tab, setTab] = useState('posts');          // 'posts' | 'liked' | 'about'
  const [editing, setEditing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Deep-link: /{username}?edit=1 (e.g. from Settings' "Edit Profile" row)
  // auto-opens the edit modal once the profile has loaded, but only when
  // it's the viewer's own profile. `deepLinkHandled` makes this a one-shot:
  // it flips the moment the modal is opened, so this can't reopen once the
  // `edit` param is stripped (below) or if `profile`/`user` reference changes
  // later (e.g. after a save). Adjusting `editing` here — during render,
  // guarded by state rather than a ref — mirrors React's recommended pattern
  // for deriving state from a prop/param change instead of doing it in an
  // effect (see "Adjusting some state when a prop changes" in the React docs).
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);
  if (!deepLinkHandled && profile && searchParams.get('edit') === '1') {
    const isOwnProfile = profile.isMe ?? (user && user.username === profile.username);
    if (isOwnProfile) {
      setDeepLinkHandled(true);
      setEditing(true);
    }
  }

  // Strip the `edit` param once it's been consumed above, so it doesn't
  // linger in the URL/history. This is a genuine external-system (browser
  // history) side effect, so it stays in an effect rather than in render.
  useEffect(() => {
    if (deepLinkHandled && searchParams.get('edit') === '1') {
      const next = new URLSearchParams(searchParams);
      next.delete('edit');
      setSearchParams(next, { replace: true });
    }
  }, [deepLinkHandled, searchParams, setSearchParams]);

  const feedKind = tab === 'liked' ? 'likes' : 'posts';
  const { posts, loading: feedLoading, loadingMore, hasMore, loadMore, updatePost, removePost } =
    useUserFeed(profile?.username, feedKind);

  const { following, pending: followPending, toggle: toggleFollow } = useFollow(
    profile?.isFollowedByMe,
    profile?.username,
    (followerCount) => patchProfile({ stats: { ...profile.stats, followerCount } }),
  );

  const { save, saving, error: saveError, clearError } = useEditProfile({
    onSuccess: (updated) => { setProfile(updated); setEditing(false); },
  });

  // Infinite scroll for the post / liked tabs
  const sentinelRef = useRef(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, tab]);

  const showProfileSkeleton = useDelayedLoading(loading);
  const showFeedSkeleton = useDelayedLoading(feedLoading);
  const skeletonCount = useSkeletonCount();
  const feedBusy = feedLoading || showFeedSkeleton;

  if (loading || showProfileSkeleton) {
    return showProfileSkeleton ? <ProfilePageSkeleton /> : null;
  }

  if (error || !profile) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-[var(--color-text-secondary)]">{error ?? 'Profile not found.'}</p>
        <Link to="/" className="mt-4 inline-block text-[var(--color-link)] hover:underline">Back to feed</Link>
      </div>
    );
  }

  const isMe = profile.isMe ?? (user && user.username === profile.username);
  const badge = userTypeBadge(profile.userType);
  const initials = (profile.username ?? '?').slice(0, 2).toUpperCase();
  const stats = profile.stats ?? {};

  const TABS = [
    { key: 'posts', label: 'Posts' },
    { key: 'liked', label: 'Liked' },
    { key: 'about', label: 'About' },
  ];

  return (
    <div>
      {/* ── Header card ── */}
      <div className="px-5 pt-5">
        <div className="overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[0_20px_46px_rgba(0,0,0,0.24)]">
          <div className="h-1 bg-[linear-gradient(90deg,rgba(56,189,248,0.45)_0%,rgba(56,189,248,0.18)_34%,rgba(245,73,73,0.18)_66%,rgba(245,73,73,0.45)_100%)]" />
          <div className="px-6 pt-5 pb-5">
            <div className="flex items-center gap-4">
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt="" className="w-16 h-16 rounded-full object-cover shrink-0 bg-[var(--color-surface-2)] ring-2 ring-[var(--color-surface-2)]" />
              ) : (
                <div className={`w-16 h-16 rounded-full shrink-0 flex items-center justify-center text-[22px] font-bold text-white bg-gradient-to-br ${avatarGradient(profile.userType)} ring-2 ring-[var(--color-surface-2)]`}>
                  {initials}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-extrabold text-[var(--color-text-heading)] tracking-tight">@{profile.username}</h1>
                  {badge && (
                    <span className={`shrink-0 rounded px-1.5 py-0.5 border text-xs font-bold uppercase leading-none ${badge.className}`}>
                      {badge.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[var(--color-text-secondary)]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  <span>{joinedLabel(profile.joinedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0">
                {isMe ? (
                  <button
                    onClick={() => { clearError(); setEditing(true); }}
                    className="px-4 py-2 rounded-full text-sm font-semibold border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-white/5 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => (currentUserId ? null : onGuestAction?.())}
                      className="px-3.5 py-2 rounded-full text-sm font-semibold border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                      Message
                    </button>
                    <button
                      onClick={() => (currentUserId ? toggleFollow() : onGuestAction?.())}
                      disabled={followPending}
                      className={[
                        'px-5 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-60',
                        following
                          ? 'border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                          : 'bg-[var(--color-btn-primary)] text-white hover:bg-[var(--color-btn-primary-hover)]',
                      ].join(' ')}
                    >
                      {following ? 'Following' : 'Follow'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bio — plain text. Spacing lives on the wrapper div, not the <p>:
                the global `p { margin: 0 }` reset in index.css is unlayered and
                would otherwise override any margin utility set on the <p>. */}
            {profile.bio && (
              <div className="mt-3 max-w-[600px]">
                <p className="text-[15px] text-[var(--color-text-primary)] leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-x-7 gap-y-2 mt-3">
              <Stat value={formatCount(stats.postCount)}      label="Posts" />
              <Stat value={formatCount(stats.likeCount)}      label="Likes" />
              <Stat value={formatCount(stats.commentCount)}   label="Comments" />
              <Stat value={formatCount(stats.followerCount)}  label="Followers" />
              <Stat value={formatCount(stats.followingCount)} label="Following" />
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 border-t border-[var(--color-border)]">
            <div className="flex gap-1">
              {TABS.map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={[
                      'relative px-1 py-3 mr-6 text-sm transition-colors',
                      active ? 'font-bold text-[var(--color-text-heading)]' : 'font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
                    ].join(' ')}
                  >
                    {t.label}
                    {active && <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[var(--color-link)] rounded-full" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-5 pt-4 pb-6">
        {tab === 'about' ? (
          <AboutTab profile={profile} />
        ) : (
          <>
            {showFeedSkeleton && (
              <div className="flex flex-col gap-4">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!feedBusy && posts.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-64 border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] gap-3">
                <IconFeed />
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {tab === 'liked' ? 'No liked posts yet.' : isMe ? 'You haven’t posted yet.' : 'No posts yet.'}
                </p>
              </div>
            )}

            {!feedBusy && posts.length > 0 && (
              <div className="flex flex-col gap-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    onPostUpdated={updatePost}
                    onPostDeleted={removePost}
                    onGuestAction={onGuestAction}
                  />
                ))}
                {hasMore && <div ref={sentinelRef} className="h-px" />}
                {loadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <Spinner />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {editing && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditing(false)}
          onSave={save}
          saving={saving}
          error={saveError}
        />
      )}
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="flex flex-col">
      <span className="text-lg font-extrabold text-white tabular-nums leading-tight">{value}</span>
      <span className="text-[11px] uppercase tracking-wider text-[var(--color-text-secondary)]">{label}</span>
    </div>
  );
}

/* ── About tab: bio, badges, followers preview ── */

function AboutTab({ profile }) {
  const badges = profile.badges ?? [];
  const [followers, setFollowers] = useState(null);

  useEffect(() => {
    let cancelled = false;
    usersApi.getFollowers(profile.username, { offset: 0, pageSize: 6 })
      .then((res) => { if (!cancelled) setFollowers(res.data.items ?? []); })
      .catch(() => { if (!cancelled) setFollowers([]); });
    return () => { cancelled = true; };
  }, [profile.username]);

  return (
    <div className="flex flex-col gap-7 max-w-[680px]">
      {/* Bio */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2.5">Bio</h2>
        <p className="text-[15px] text-[var(--color-text-muted)] leading-relaxed">
          {profile.bio || 'This user hasn’t written a bio yet.'}
        </p>
      </section>

      {/* Badges */}
      {badges.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3">Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map((b) => (
              <div key={b.code} className="flex items-center gap-3 px-3.5 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)]">
                <div className="w-9 h-9 rounded-[10px] shrink-0 flex items-center justify-center text-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                  {BADGE_GLYPHS[b.code] ?? '◆'}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-[var(--color-text-heading)] truncate">{b.label}</p>
                  <p className="text-[11px] text-[var(--color-text-secondary)] leading-snug">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Followers preview */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Followers</h2>
          <span className="text-xs text-[var(--color-link)] font-semibold">
            {formatCount(profile.stats?.followerCount)} followers · {formatCount(profile.stats?.followingCount)} following
          </span>
        </div>
        {followers === null ? (
          <div className="flex items-center justify-center py-6">
            <Spinner size="sm" />
          </div>
        ) : followers.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">No followers yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {followers.map((f) => {
              const b = userTypeBadge(f.userType);
              return (
                <Link
                  key={f.userId}
                  to={`/${f.username}`}
                  className="flex items-center gap-3 px-2.5 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface)] transition-colors"
                >
                  {f.profileImageUrl ? (
                    <img src={f.profileImageUrl} alt="" className="w-9 h-9 rounded-full object-cover bg-[var(--color-surface-2)]" />
                  ) : (
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${avatarGradient(f.userType)}`}>
                      {(f.username ?? '?').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[var(--color-text-heading)] truncate">@{f.username}</span>
                      {b && <span className={`shrink-0 rounded px-1 py-0.5 border text-[9px] font-bold uppercase leading-none ${b.className}`}>{b.label}</span>}
                    </div>
                    {f.bio && <p className="text-xs text-[var(--color-text-secondary)] truncate">{f.bio}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
