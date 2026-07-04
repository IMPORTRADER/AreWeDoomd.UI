import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as AdminAuthContextModule from '../context/AdminAuthContext';
import { RequireAdmin } from './AppRouter';

vi.mock('../context/AdminAuthContext', () => ({
  useAdminAuth: vi.fn(),
  AdminAuthProvider: ({ children }) => children,
}));

vi.mock('../components/ui/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner" />,
}));

describe('RequireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login when there is no user', async () => {
    AdminAuthContextModule.useAdminAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAdmin>
                <div data-testid="protected">Protected</div>
              </RequireAdmin>
            }
          />
          <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('protected')).toBeNull();
      expect(screen.getByTestId('login-page')).toBeTruthy();
    });
  });

  it('renders children when user is present', async () => {
    AdminAuthContextModule.useAdminAuth.mockReturnValue({
      user: { username: 'admin', isAdmin: true },
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAdmin>
                <div data-testid="protected">Protected</div>
              </RequireAdmin>
            }
          />
          <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected')).toBeTruthy();
    });
  });

  it('shows loading spinner while loading', async () => {
    AdminAuthContextModule.useAdminAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAdmin>
                <div data-testid="protected">Protected</div>
              </RequireAdmin>
            }
          />
          <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
    expect(screen.queryByTestId('protected')).toBeNull();
    expect(screen.queryByTestId('login-page')).toBeNull();
  });
});
