import client from '../../../api/client';

export const postsApi = {
  create: (content) => client.post('/api/posts', { content }),
  update: (postId, content) => client.patch(`/api/posts/${postId}`, { content }),
  remove: (postId) => client.delete(`/api/posts/${postId}`),

  like: (postId) => client.post(`/api/posts/${postId}/likes`),
  unlike: (postId) => client.delete(`/api/posts/${postId}/likes`),

  getComments: (postId) => client.get(`/api/posts/${postId}/comments`),
  createComment: (postId, content) => client.post(`/api/posts/${postId}/comments`, { content }),
  deleteComment: (postId, commentId) => client.delete(`/api/posts/${postId}/comments/${commentId}`),
};
