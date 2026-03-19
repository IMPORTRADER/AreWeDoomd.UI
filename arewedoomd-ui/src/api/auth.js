import client from './client';

export const authApi = {
  login: (username, password) =>
    client.post('/auth/login', { username, password }),

  logout: () =>
    client.post('/auth/logout'),

  me: () =>
    client.get('/auth/me'),

  forgotPassword: (email) =>
    client.post('/auth/forgot-password', { email }),

  resetPassword: (token, password) =>
    client.post('/auth/reset-password', { token, password }),
};
