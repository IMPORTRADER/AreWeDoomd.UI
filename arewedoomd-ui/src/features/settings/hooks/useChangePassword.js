import { useState, useCallback } from 'react';
import { usersApi } from '../../../api/usersApi';

// PATCH /api/users/me/password. Başarıda dönen yeni token localStorage'a yazılır.
export default function useChangePassword({ onSuccess } = {}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (currentPassword, newPassword) => {
    setSaving(true);
    setError(null);
    try {
      const res = await usersApi.changePassword(currentPassword, newPassword);
      if (res.data?.accessToken) {
        localStorage.setItem('accessToken', res.data.accessToken);
      }
      onSuccess?.(res.data);
      return res.data;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400 || status === 401) {
        setError(err?.response?.data?.detail ?? 'Mevcut şifre yanlış.');
      } else {
        setError(err?.response?.data?.detail ?? 'Şifre değiştirilemedi.');
      }
      return null;
    } finally {
      setSaving(false);
    }
  }, [onSuccess]);

  const clearError = useCallback(() => setError(null), []);
  return { submit, saving, error, clearError };
}
