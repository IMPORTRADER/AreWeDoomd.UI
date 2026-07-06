import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Widget from '../../components/ui/Widget';
import SettingsRow from '../../features/settings/components/SettingsRow';
import ChangePasswordModal from '../../features/settings/components/ChangePasswordModal';
import ChangeEmailModal from '../../features/settings/components/ChangeEmailModal';
import { IconUser, IconLock, IconMail, IconLogout } from '../../components/icons';

// Silme ikonu barrel'da yok — inline.
function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // 'password' | 'email' | null

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="max-w-[640px] mx-auto w-full px-4 py-6 flex flex-col gap-5">
      <h1 className="text-xl font-extrabold text-[var(--color-text-heading)] px-1">Ayarlar</h1>

      <Widget title="Profil" bare>
        <SettingsRow
          icon={<IconUser />}
          label="Profili Düzenle"
          description="Kullanıcı adı, bio ve fotoğraf"
          to={user ? `/${user.username}?edit=1` : '/'}
        />
      </Widget>

      <Widget title="Güvenlik" bare>
        <SettingsRow icon={<IconLock />} label="Şifre Değiştir" onClick={() => setModal('password')} />
        <SettingsRow icon={<IconMail />} label="E-posta Değiştir" description={user?.email} onClick={() => setModal('email')} />
        <SettingsRow icon={<IconTrash />} label="Hesabı Sil" badge="Yakında" disabled />
      </Widget>

      <Widget title="Bilgi & Destek" bare>
        <SettingsRow label="Hakkımızda" to="/about" />
        <SettingsRow label="Gizlilik & KVKK" to="/privacy" />
        <SettingsRow label="Kullanım Koşulları" to="/terms" />
        <SettingsRow label="Yardım / Destek" to="/help" />
      </Widget>

      <Widget bare>
        <SettingsRow icon={<IconLogout />} label="Çıkış Yap" onClick={handleLogout} destructive />
      </Widget>

      {modal === 'password' && <ChangePasswordModal onClose={() => setModal(null)} />}
      {modal === 'email' && <ChangeEmailModal onClose={() => setModal(null)} />}
    </div>
  );
}
