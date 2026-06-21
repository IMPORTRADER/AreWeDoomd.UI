import { useEffect, useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { IconUser, IconAlert } from '../../../components/icons';

const BIO_MAX = 160;

function avatarGradient(userType) {
  const t = userType?.toLowerCase();
  if (t === 'ai')    return 'from-[var(--color-ai-from)] to-[var(--color-ai-to)]';
  if (t === 'human') return 'from-[var(--color-human-from)] to-[var(--color-human-to)]';
  return 'from-[var(--color-surface-2)] to-[var(--color-border)]';
}

// Edit-profile dialog for the authenticated user. Matches the LoginModal shell.
// onSave(payload) -> the parent calls PATCH /api/users/me and resolves.
export default function EditProfileModal({ profile, onClose, onSave, saving, error }) {
  const [username, setUsername] = useState(profile?.username ?? '');
  const [bio, setBio]           = useState(profile?.bio ?? '');

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

  const initials = (profile?.username ?? '?').slice(0, 2).toUpperCase();
  const remaining = BIO_MAX - bio.length;
  const isOverLimit = remaining < 0;

  const usernameChanged = username.trim() && username.trim() !== profile?.username;
  const bioChanged = bio.trim() !== (profile?.bio ?? '').trim();
  const canSave = !saving && !isOverLimit && (bioChanged || usernameChanged) && username.trim().length >= 3;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    const payload = { bio: bio.trim() };
    if (usernameChanged) payload.username = username.trim();
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !saving && onClose()}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative z-10 w-full max-w-[480px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text-heading)]">Edit Profile</h2>
          <button
            onClick={() => !saving && onClose()}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-white/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="px-6 py-6 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="flex items-center gap-2.5 px-3.5 py-3 bg-red-500/[0.08] border border-red-500/25 rounded-[var(--radius-md)] text-red-400 text-[13px] leading-relaxed">
              <IconAlert /><span>{error}</span>
            </div>
          )}

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {profile?.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt="" className="w-[72px] h-[72px] rounded-full object-cover bg-[var(--color-surface-2)]" />
              ) : (
                <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br ${avatarGradient(profile?.userType)}`}>
                  {initials}
                </div>
              )}
              <div className="absolute -right-1 -bottom-1 w-7 h-7 rounded-full flex items-center justify-center bg-[var(--color-btn-primary)] border-2 border-[var(--color-bg)]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-heading)]">Profile photo</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">PNG or JPG, up to 4MB</p>
            </div>
          </div>

          {/* Username */}
          <Input
            label="Username"
            name="username"
            type="text"
            placeholder="your-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<IconUser />}
            autoComplete="off"
          />

          {/* Bio */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="bio" className="text-sm font-medium text-[var(--color-text-primary)]">Bio</label>
              <span className={`text-xs ${isOverLimit ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}>{remaining}</span>
            </div>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={BIO_MAX + 40}
              placeholder="Tell the timeline who you are."
              className="composer-scroll w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-3 text-sm text-[var(--color-text-primary)] leading-relaxed outline-none resize-none focus:border-[var(--color-link)]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => !saving && onClose()}
              className="px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-white/5 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" loading={saving} disabled={!canSave}>Save changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
