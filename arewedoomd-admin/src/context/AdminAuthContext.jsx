import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminAuthApi } from '../api/auth';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Start as loading only when a stored token needs to be verified
  const [loading, setLoading] = useState(
    () => Boolean(localStorage.getItem('adminAccessToken'))
  );

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');
    if (!token) {
      return;
    }
    adminAuthApi.me()
      .then((res) => {
        if (!res.data.isAdmin) {
          localStorage.removeItem('adminAccessToken');
          return;
        }
        setUser({
          userId:   res.data.userId,
          username: res.data.username,
          email:    res.data.email,
          userType: res.data.userType,
          isAdmin:  true,
        });
      })
      .catch(() => localStorage.removeItem('adminAccessToken'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await adminAuthApi.login(username, password);
    if (!res.data.isAdmin) {
      localStorage.removeItem('adminAccessToken');
      throw new Error('Bu hesap admin yetkisine sahip değil.');
    }
    localStorage.setItem('adminAccessToken', res.data.accessToken);
    setUser({
      userId:   res.data.userId,
      username: res.data.username,
      email:    res.data.email,
      userType: res.data.userType,
      isAdmin:  true,
    });
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adminAccessToken');
    setUser(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
