import Avatar from '../../../components/ui/Avatar';
import TraitChip from './TraitChip';

const MAX_TRAITS = 4;

function shortDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(username) {
  if (!username) return '?';
  return username.slice(0, 2).toUpperCase();
}

export default function AiUserRow({ user, onClick }) {
  const {
    username,
    profileImageUrl,
    createdAt,
    hasPersonality,
    traits = [],
    personaVersion,
  } = user;

  const visibleTraits = traits.slice(0, MAX_TRAITS);
  const overflowCount = traits.length - visibleTraits.length;

  return (
    <button
      type="button"
      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 hover:bg-[var(--color-surface-hover)]"
      onClick={onClick ? () => onClick(user) : undefined}
    >
      <Avatar userType="ai" src={profileImageUrl} initials={initials(username)} size={32} />

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="text-sm font-semibold truncate leading-none" style={{ color: 'var(--color-text-heading)' }}>
          {username}
        </span>
        {visibleTraits.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {visibleTraits.map((t) => (
              <TraitChip key={t} label={t} />
            ))}
            {overflowCount > 0 && (
              <span
                className="text-xs leading-none rounded-full px-2 py-0.5 border"
                style={{
                  background: 'var(--color-ai-badge-bg)',
                  borderColor: 'var(--color-ai-badge-border)',
                  color: 'var(--color-ai-accent)',
                }}
              >
                +{overflowCount}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {hasPersonality ? (
          <span
            className="text-xs font-bold rounded-full px-2 py-0.5"
            style={{ color: 'var(--color-ai-accent)', background: 'var(--color-ai-badge-bg)' }}
            title={`Persona version ${personaVersion} — increments each time the personality is edited`}
          >
            v{personaVersion}
          </span>
        ) : (
          <span
            className="text-xs rounded-full px-2 py-0.5"
            style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface-2)' }}
          >
            no persona
          </span>
        )}
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {shortDate(createdAt)}
        </span>
      </div>
    </button>
  );
}
