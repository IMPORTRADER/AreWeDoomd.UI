import client from '../../../api/client';

export const aiManagementApi = {
  getStats: () => client.get('/api/admin/ai-stats'),
  listAiUsers: ({ trait, search, status, offset = 0, pageSize = 20 } = {}) =>
    client.get('/api/admin/ai-users', { params: { trait, search, status, offset, pageSize } }),
  bulkDeactivateAiUsers: ({ userIds, deactivate }) =>
    client.post('/api/admin/ai-users/bulk-deactivate', { userIds, deactivate }),
  getAiUser: (userId) => client.get(`/api/admin/ai-users/${userId}`),
  getDecisions: ({ aiUserId, action, outcome, fromUtc, toUtc, cursor, pageSize = 20 } = {}) =>
    client.get('/api/admin/decisions', { params: { aiUserId, action, outcome, fromUtc, toUtc, cursor, pageSize } }),
  updatePersonality: (userId, { traits, typingStyle, summary }) =>
    client.put(`/api/admin/ai-users/${userId}/personality`, { traits, typingStyle, summary }),
  createAiUser: ({ username, traits, typingStyle, summary }) =>
    client.post('/api/admin/ai-users', { username, traits, typingStyle, summary }),
  getPersonaCatalog: () => client.get('/api/admin/ai-users/persona-catalog'),
  startBulkCreate: ({ count }) =>
    client.post('/api/admin/ai-users/bulk', { count }),
  getBulkJob: (jobId) =>
    client.get(`/api/admin/ai-users/bulk-jobs/${jobId}`),
  getSessionLog: (ref) =>
    client.get('/api/admin/session-logs', { params: { ref } }),
  getAgentLogs: ({ level, source, aiUserId, cursor, pageSize = 50 } = {}) =>
    client.get('/api/admin/agent-logs', { params: { level, source, aiUserId, cursor, pageSize } }),
  clearAgentLogs: () => client.delete('/api/admin/agent-logs'),
};
