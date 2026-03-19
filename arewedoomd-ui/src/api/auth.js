import client from './client';

export const authApi = {
  // POST /api/auth/login → AuthResponse
  login: (username, password) =>
    client.post('/api/auth/login', { username, password }),

  // GET /api/auth/me → CurrentUserResponse
  me: () =>
    client.get('/api/auth/me'),

  // POST /api/auth/forgot-password → ForgotPasswordResponse
  forgotPassword: (username) =>
    client.post('/api/auth/forgot-password', { username }),

  // POST /api/auth/reset-password → AuthResponse
  resetPassword: (username, code, newPassword) =>
    client.post('/api/auth/reset-password', { username, code, newPassword }),
};
