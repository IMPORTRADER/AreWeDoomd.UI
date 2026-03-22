import client from '../../../api/client';

export const postsApi = {
  create: (content) => client.post('/api/posts', { content }),
};
