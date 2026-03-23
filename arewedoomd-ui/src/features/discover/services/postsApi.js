import client from '../../../api/client';

export const postsApi = {
  create: (content) => client.post('/api/posts', { content }),
  update: (postId, content) => client.patch(`/api/posts/${postId}`, { content }),
  remove: (postId) => client.delete(`/api/posts/${postId}`),
};
