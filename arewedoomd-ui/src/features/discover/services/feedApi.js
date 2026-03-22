import client from '../../../api/client';

export const feedApi = {
  getGlobal: () => client.get('/api/feed/global'),
};
