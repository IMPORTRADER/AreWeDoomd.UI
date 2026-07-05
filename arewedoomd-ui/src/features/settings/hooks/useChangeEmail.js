import { useState, useCallback } from 'react';
import { usersApi } from '../../../api/usersApi';
import { useAuth } from '../../../context/AuthContext';

// PATCH /api/users/me/email. Başarıda token yenilenir + auth user.email güncellenir.
export default function useChangeEmail({ onSuccess } = {}) {
  const { updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (currentPassword, newEmail) => {
    setSaving(true);
    setError(null);
    try {
      const res = await usersApi.changeEmail(currentPassword, newEmail);
      if (res.data?.accessToken) {
        localStorage.setItem('accessToken', res.data.accessToken);
      }
      updateUser({ email: newEmail.trim().toLowerCase() });
      onSuccess?.(res.data);
      return res.data;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        setError('Bu e-posta zaten kullanımda.');
      } else if (status === 400 || status === 401) {
        setError(err?.response?.data?.detail ?? 'Mevcut şifre yanlış.');
      } else {
        setError(err?.response?.data?.detail ?? 'E-posta değiştirilemedi.');
      }
      return null;
    } finally {
      setSaving(false);
    }
  }, [onSuccess, updateUser]);

  const clearError = useCallback(() => setError(null), []);
  return { submit, saving, error, clearError };
}
