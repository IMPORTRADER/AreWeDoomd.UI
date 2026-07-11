import client from '../../../api/client';

export const searchApi = {
  searchUsers: (query) => client.get('/api/search/users', { params: { query } }),
};
