import Avatar from '../../../components/ui/Avatar';
import TraitChip from './TraitChip';

const MAX_TRAITS = 3;

function shortDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(username) {
  if (!username) return '?';
  return username.slice(0, 2).toUpperCase();
}

/**
 * Table row for a single AI user.
 *
 * Props:
 *   user      — AI user object (id, username, profileImageUrl, createdAt,
 *               hasPersonality, traits, personaVersion, deactivatedAt)
 *   selected  — boolean, whether the row checkbox is checked
 *   onSelect  — called with (user) when the checkbox changes
 *   onClick   — called with (user) when the row body is clicked
 */
export default function AiUserRow({ user, selected = false, onSelect, onClick }) {
  const {
    username,
    profileImageUrl,
    createdAt,
    hasPersonality,
    traits = [],
    personaVersion,
    deactivatedAt,
  } = user;

  const isDeactivated  = !!deactivatedAt;
  const visibleTraits  = traits.slice(0, MAX_TRAITS);
  const overflowCount  = traits.length - visibleTraits.length;

  return (
    <tr
      className={`cursor-pointer transition-colors duration-100 border-b border-[var(--color-border)]
        ${selected ? 'bg-[color-mix(in_srgb,var(--color-ai-accent)_7%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-ai-accent)_10%,transparent)]' : 'hover:bg-[var(--color-surface-hover)]'}
        ${isDeactivated ? 'opacity-45' : ''}`}
      onClick={onClick ? () => onClick(user) : undefined}
    >
      {/* Checkbox */}
      <td className="pl-4 pr-2 py-2" style={{ width: 36 }}>
        <input
          type="checkbox"
          checked={selected}
          style={{ accentColor: 'var(--color-ai-accent)', width: 15, height: 15, cursor: 'pointer' }}
          onChange={() => onSelect && onSelect(user)}
          onClick={(e) => e.stopPropagation()}
        />
      </td>

      {/* User: avatar + username */}
      <td className="py-1.5 px-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar userType="ai" src={profileImageUrl} initials={initials(username)} size={28} />
          <span
            className="text-sm font-semibold truncate leading-normal"
            style={{ color: 'var(--color-text-heading)', maxWidth: 150 }}
          >
            {username}
          </span>
        </div>
      </td>

      {/* Traits */}
      <td className="py-1.5 px-2.5">
        <div className="flex gap-1.5 overflow-hidden">
          {visibleTraits.length > 0 ? (
            <>
              {visibleTraits.map((t) => (
                <TraitChip key={t} label={t} />
              ))}
              {overflowCount > 0 && (
                <span
                  className="text-xs leading-none rounded-full px-2 py-0.5 border whitespace-nowrap"
                  style={{
                    background: 'transparent',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  +{overflowCount}
                </span>
              )}
            </>
          ) : (
            <span
              className="text-xs leading-none rounded-full px-2 py-0.5 border"
              style={{
                background: 'transparent',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              —
            </span>
          )}
        </div>
      </td>

      {/* Persona */}
      <td className="py-1.5 px-2.5">
        {isDeactivated ? (
          <span
            className="text-xs rounded-full px-2 py-0.5 border"
            style={{
              color: 'var(--color-text-secondary)',
              background: 'var(--color-surface-2)',
              borderColor: 'var(--color-border)',
            }}
          >
            deactivated
          </span>
        ) : hasPersonality ? (
          <span
            className="text-xs font-bold rounded-full px-2 py-0.5"
            style={{ color: 'var(--color-ai-accent)', background: 'var(--color-ai-badge-bg)' }}
            title={`Persona version ${personaVersion} — increments each time the personality is edited`}
          >
            v{personaVersion}
          </span>
        ) : (
          <span
            className="text-xs rounded-full px-2 py-0.5 border"
            style={{
              color: 'var(--color-warning)',
              background: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
              borderColor: 'color-mix(in srgb, var(--color-warning) 30%, transparent)',
            }}
          >
            no persona
          </span>
        )}
      </td>

      {/* Created date */}
      <td
        className="py-1.5 px-2.5 text-xs whitespace-nowrap tabular-nums"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {shortDate(createdAt)}
      </td>
    </tr>
  );
}
