import { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationsApi } from '../features/notifications/services/notificationsApi';
import { createNotificationsConnection, RECEIVE_NOTIFICATION } from '../features/notifications/services/notificationsHub';

const MAX_NOTIFICATIONS = 10;
const BADGE_COUNT_DURATION_MS = 7000;

export const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [badgeMode, setBadgeMode] = useState('hidden'); // 'hidden' | 'count' | 'dot'
  const [toasts, setToasts] = useState([]);

  const badgeTimerRef = useRef(null);
  const unreadCountRef = useRef(0);

  // Keep a ref in sync so timer callbacks read the latest unread count.
  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  const clearBadgeTimer = useCallback(() => {
    if (badgeTimerRef.current) {
      clearTimeout(badgeTimerRef.current);
      badgeTimerRef.current = null;
    }
  }, []);

  const handleIncoming = useCallback((dto) => {
    setNotifications((prev) => [dto, ...prev].slice(0, MAX_NOTIFICATIONS));
    setUnreadCount((prev) => prev + 1);

    // Badge enters count mode for 4s, then falls back to a dot.
    setBadgeMode('count');
    clearBadgeTimer();
    badgeTimerRef.current = setTimeout(() => {
      setBadgeMode(unreadCountRef.current > 0 ? 'dot' : 'hidden');
      badgeTimerRef.current = null;
    }, BADGE_COUNT_DURATION_MS);

    // Toast queue (newest on top).
    const toastId = dto.id ?? `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [{ ...dto, toastId }, ...prev]);
  }, [clearBadgeTimer]);

  const markAllRead = useCallback(async () => {
    // Optimistic: badge clears immediately, request runs in the background.
    clearBadgeTimer();
    setUnreadCount(0);
    setBadgeMode('hidden');
    try {
      await notificationsApi.markAllRead();
    } catch (error) {
      // Best-effort; the badge re-seeds correctly on next refresh/reconnect.
      console.error('Failed to mark notifications read', error);
    }
  }, [clearBadgeTimer]);

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((toast) => toast.toastId !== toastId));
  }, []);

  // Connect for logged-in users; tear down on logout.
  useEffect(() => {
    if (!user) {
      clearBadgeTimer();
      setNotifications([]);
      setUnreadCount(0);
      setBadgeMode('hidden');
      setToasts([]);
      return undefined;
    }

    let active = true;

    const doRefresh = async () => {
      try {
        const [listRes, countRes] = await Promise.all([
          notificationsApi.getNotifications(),
          notificationsApi.getUnreadCount(),
        ]);
        if (!active) return;
        const list = listRes.data ?? [];
        const count = countRes.data?.count ?? 0;
        setNotifications(list.slice(0, MAX_NOTIFICATIONS));
        setUnreadCount(count);
        clearBadgeTimer();
        setBadgeMode(count > 0 ? 'dot' : 'hidden');
      } catch (error) {
        console.error('Notification refresh failed', error);
      }
    };

    const connection = createNotificationsConnection();
    connection.on(RECEIVE_NOTIFICATION, (dto) => {
      if (active) {
        handleIncoming(dto);
      }
    });
    connection.onreconnected(() => {
      doRefresh();
    });

    doRefresh();
    connection.start().catch((error) => console.error('Notification hub connect failed', error));

    return () => {
      active = false;
      clearBadgeTimer();
      connection.stop().catch(() => {});
    };
  }, [user, handleIncoming, clearBadgeTimer]);

  const value = {
    notifications,
    unreadCount,
    badgeMode,
    toasts,
    markAllRead,
    dismissToast,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
