import client from '../../../api/client';

export const notificationsApi = {
  getNotifications: () => client.get('/api/notifications'),
  getUnreadCount: () => client.get('/api/notifications/unread-count'),
  markAllRead: () => client.post('/api/notifications/mark-all-read'),
};
