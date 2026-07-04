import client from './client';

export const adminAuthApi = {
  // POST /api/auth/login → AuthResponse
  login: (username, password) =>
    client.post('/api/auth/login', { username, password }),

  // GET /api/auth/me → CurrentUserResponse
  me: () =>
    client.get('/api/auth/me'),
};
