import { useEffect, useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { IconAlert, IconMail } from '../../../components/icons';
import useChangeEmail from '../hooks/useChangeEmail';
import { validateEmailForm } from '../validation';

export default function ChangeEmailModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [localError, setLocalError] = useState(null);

  const { submit, saving, error, clearError } = useChangeEmail({ onSuccess: onClose });

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validateEmailForm({ currentPassword, newEmail });
    if (v) { setLocalError(v); return; }
    setLocalError(null);
    clearError();
    submit(currentPassword, newEmail);
  };

  const shownError = localError ?? error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !saving && onClose()}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative z-10 w-full max-w-[440px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text-heading)]">E-posta Değiştir</h2>
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
          {shownError && (
            <div className="flex items-center gap-2.5 px-3.5 py-3 bg-red-500/[0.08] border border-red-500/25 rounded-[var(--radius-md)] text-red-400 text-[13px] leading-relaxed">
              <IconAlert /><span>{shownError}</span>
            </div>
          )}
          <Input label="Yeni e-posta" type="email" name="newEmail" value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)} icon={<IconMail />} autoComplete="email" />
          <Input label="Mevcut şifre" type="password" name="currentPassword" value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={() => !saving && onClose()} disabled={saving}>İptal</Button>
            <Button type="submit" variant="primary" loading={saving}>Kaydet</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
