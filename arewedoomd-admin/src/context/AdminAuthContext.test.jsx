import { render, screen, act, waitFor } from '@testing-library/react';
import { AdminAuthProvider, useAdminAuth } from './AdminAuthContext';
import * as authModule from '../api/auth';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('../api/auth');

// Helper: renders a component that exposes context values
function TestConsumer() {
  const { user, loading, login, logout } = useAdminAuth();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="user">{user ? user.username : 'null'}</div>
      <button onClick={() => login('admin', 'pass')} data-testid="login-btn">Login</button>
      <button onClick={() => logout()} data-testid="logout-btn">Logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AdminAuthProvider>
      <TestConsumer />
    </AdminAuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

describe('AdminAuthContext', () => {
  describe('login — admin user', () => {
    it('stores adminAccessToken and sets user on successful admin login', async () => {
      authModule.adminAuthApi.login = vi.fn().mockResolvedValue({
        data: {
          userId: '1',
          username: 'admin',
          email: 'admin@test.com',
          userType: 'Human',
          isAdmin: true,
          accessToken: 'tok-admin-123',
        },
      });

      // no token in storage → me() not called on mount
      authModule.adminAuthApi.me = vi.fn().mockResolvedValue({ data: { isAdmin: false } });

      renderWithProvider();

      // wait for bootstrap loading to finish
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      expect(localStorage.getItem('adminAccessToken')).toBe('tok-admin-123');
      expect(screen.getByTestId('user').textContent).toBe('admin');
    });
  });

  describe('login — non-admin user', () => {
    it('does NOT store token and throws with not-admin message', async () => {
      authModule.adminAuthApi.login = vi.fn().mockResolvedValue({
        data: {
          userId: '2',
          username: 'regular',
          email: 'regular@test.com',
          userType: 'Human',
          isAdmin: false,
          accessToken: 'tok-regular-456',
        },
      });
      authModule.adminAuthApi.me = vi.fn();

      let caughtError = null;

      function NonAdminConsumer() {
        const { user, loading, login } = useAdminAuth();
        async function handleLogin() {
          try {
            await login('regular', 'pass');
          } catch (err) {
            caughtError = err;
          }
        }
        return (
          <div>
            <div data-testid="loading">{String(loading)}</div>
            <div data-testid="user">{user ? user.username : 'null'}</div>
            <button onClick={handleLogin} data-testid="login-btn">Login</button>
          </div>
        );
      }

      render(
        <AdminAuthProvider>
          <NonAdminConsumer />
        </AdminAuthProvider>
      );

      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      expect(localStorage.getItem('adminAccessToken')).toBeNull();
      expect(caughtError).not.toBeNull();
      expect(caughtError.message).toBe('Bu hesap admin yetkisine sahip değil.');
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  describe('logout', () => {
    it('clears adminAccessToken and user', async () => {
      localStorage.setItem('adminAccessToken', 'tok-existing');

      authModule.adminAuthApi.me = vi.fn().mockResolvedValue({
        data: {
          userId: '1',
          username: 'admin',
          email: 'admin@test.com',
          userType: 'Human',
          isAdmin: true,
        },
      });

      renderWithProvider();

      await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('admin'));

      act(() => {
        screen.getByTestId('logout-btn').click();
      });

      expect(localStorage.getItem('adminAccessToken')).toBeNull();
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });
});
