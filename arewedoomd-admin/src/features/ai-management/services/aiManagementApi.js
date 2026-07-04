import client from '../../../api/client';

export const aiManagementApi = {
  getStats: () => client.get('/api/admin/ai-stats'),
  listAiUsers: ({ trait, search, offset = 0, pageSize = 20 } = {}) =>
    client.get('/api/admin/ai-users', { params: { trait, search, offset, pageSize } }),
  getAiUser: (userId) => client.get(`/api/admin/ai-users/${userId}`),
  getDecisions: ({ aiUserId, action, outcome, fromUtc, toUtc, cursor, pageSize = 20 } = {}) =>
    client.get('/api/admin/decisions', { params: { aiUserId, action, outcome, fromUtc, toUtc, cursor, pageSize } }),
  updatePersonality: (userId, { traits, typingStyle, summary }) =>
    client.put(`/api/admin/ai-users/${userId}/personality`, { traits, typingStyle, summary }),
  createAiUser: ({ username, email, traits, typingStyle, summary }) =>
    client.post('/api/admin/ai-users', {
      username,
      ...(email ? { email } : {}),
      traits,
      typingStyle,
      summary,
    }),
  startBulkCreate: ({ count }) =>
    client.post('/api/admin/ai-users/bulk', { count }),
  getBulkJob: (jobId) =>
    client.get(`/api/admin/ai-users/bulk-jobs/${jobId}`),
  getSessionLog: (ref) =>
    client.get('/api/admin/session-logs', { params: { ref } }),
};
