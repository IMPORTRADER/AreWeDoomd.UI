import { useEffect, useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { IconAlert } from '../../../components/icons';
import useChangePassword from '../hooks/useChangePassword';
import { validatePasswordForm } from '../validation';

export default function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [localError, setLocalError] = useState(null);

  const { submit, saving, error, clearError } = useChangePassword({ onSuccess: onClose });

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Yeni şifre görünürken teyit alanı gizlenir; o durumda eşleşme kontrolü atlanır.
    const confirmForValidation = newPasswordVisible ? newPassword : confirmPassword;
    const v = validatePasswordForm({ currentPassword, newPassword, confirmPassword: confirmForValidation });
    if (v) { setLocalError(v); return; }
    setLocalError(null);
    clearError();
    submit(currentPassword, newPassword);
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
          <h2 className="text-lg font-bold text-[var(--color-text-heading)]">Şifre Değiştir</h2>
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
          <Input label="Mevcut şifre" type="password" name="currentPassword" value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
          <Input label="Yeni şifre" type="password" name="newPassword" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password"
            onVisibilityChange={setNewPasswordVisible} />

          {/* Yeni şifre görünür olunca teyit alanı animasyonla daralarak kaybolur:
              şifreyi görebiliyorsan tekrar teyide gerek yok. -mt-5 gizliyken
              üstteki gap-5'i de toplayarak boşluk bırakmaz. */}
          <div
            aria-hidden={newPasswordVisible}
            className={[
              'grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-out',
              newPasswordVisible
                ? 'grid-rows-[0fr] opacity-0 -mt-5 pointer-events-none'
                : 'grid-rows-[1fr] opacity-100 mt-0',
            ].join(' ')}
          >
            <div className="overflow-hidden">
              <Input label="Yeni şifre (tekrar)" type="password" name="confirmPassword" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={() => !saving && onClose()} disabled={saving}>İptal</Button>
            <Button type="submit" variant="primary" loading={saving}>Kaydet</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
