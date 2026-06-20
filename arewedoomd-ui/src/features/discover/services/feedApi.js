import client from '../../../api/client';

export const feedApi = {
  getGlobal: ({ offset = 0, pageSize = 20, asOf } = {}) => {
    const params = { offset, pageSize };
    if (asOf) {
      params.asOf = asOf;
    }
    return client.get('/api/feed/global', { params });
  },
};
