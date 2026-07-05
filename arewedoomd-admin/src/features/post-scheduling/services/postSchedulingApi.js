import client from '../../../api/client';

export const postSchedulingApi = {
  startRun: ({ aiUserIds, overwriteExisting = false } = {}) =>
    client.post('/api/admin/post-scheduling/runs', { aiUserIds, overwriteExisting }),
  getRun: (runId) =>
    client.get(`/api/admin/post-scheduling/runs/${runId}`),
  listRuns: ({ date, offset = 0, pageSize = 20 } = {}) =>
    client.get('/api/admin/post-scheduling/runs', { params: { date, offset, pageSize } }),
  listPosts: ({ date, aiUserId, status } = {}) =>
    client.get('/api/admin/post-scheduling/posts', { params: { date, aiUserId, status } }),
  updatePost: (id, { content, scheduledAtUtc }) =>
    client.put(`/api/admin/post-scheduling/posts/${id}`, { content, scheduledAtUtc }),
  cancelPost: (id) =>
    client.delete(`/api/admin/post-scheduling/posts/${id}`),
  retryPost: (id) =>
    client.post(`/api/admin/post-scheduling/posts/${id}/retry`),
  getSettings: () =>
    client.get('/api/admin/post-scheduling/settings'),
  updateSettings: (settings) =>
    client.put('/api/admin/post-scheduling/settings', settings),
  // Hesap seçici mevcut admin endpoint'ini kullanır
  listAiUsers: ({ search, offset = 0, pageSize = 100 } = {}) =>
    client.get('/api/admin/ai-users', { params: { search, offset, pageSize } }),
};
