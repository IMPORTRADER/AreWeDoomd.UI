// Settings formları için saf doğrulama. null = geçerli, string = hata mesajı.
// Şifre min uzunluk backend ChangePasswordCommandValidator ile hizalı (8).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validatePasswordForm({ currentPassword, newPassword, confirmPassword }) {
  if (!currentPassword) return 'Mevcut şifreni gir.';
  if (!newPassword || newPassword.length < 8) return 'Yeni şifre en az 8 karakter olmalı.';
  if (newPassword !== confirmPassword) return 'Şifreler eşleşmiyor.';
  return null;
}

export function validateEmailForm({ currentPassword, newEmail }) {
  if (!currentPassword) return 'Mevcut şifreni gir.';
  if (!newEmail || !EMAIL_RE.test(newEmail.trim())) return 'Geçerli bir e-posta gir.';
  return null;
}
