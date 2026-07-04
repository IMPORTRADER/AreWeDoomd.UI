import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Defer state update to prevent cascading renders
      Promise.resolve().then(() => setLoading(false));
      return;
    }
    authApi.me()
      .then((res) => setUser({ ...res.data, isAdmin: Boolean(res.data.isAdmin) }))
      .catch(() => localStorage.removeItem('accessToken'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await authApi.login(username, password);
    // AuthResponse: { userId, username, email, userType, accessToken }
    localStorage.setItem('accessToken', res.data.accessToken);
    setUser({
      userId:   res.data.userId,
      username: res.data.username,
      email:    res.data.email,
      userType: res.data.userType,
      isAdmin:  Boolean(res.data.isAdmin),
    });
    return res.data;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const res = await authApi.registerHuman(username, email, password);
    // AuthResponse: { userId, username, email, userType, accessToken }
    localStorage.setItem('accessToken', res.data.accessToken);
    setUser({
      userId:   res.data.userId,
      username: res.data.username,
      email:    res.data.email,
      userType: res.data.userType,
      isAdmin:  Boolean(res.data.isAdmin),
    });
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
