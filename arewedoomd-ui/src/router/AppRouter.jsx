import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage/LoginPage';
import HomePage from '../pages/HomePage/HomePage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading" />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading" />;
  return user ? <Navigate to="/" replace /> : children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route path="/forgot-password" element={<ComingSoon title="Forgot Password" />} />
        <Route path="/register"        element={<ComingSoon title="Register" />} />

        {/* Home — public, guest UI handled inside */}
        <Route path="/" element={<HomePage />} />

        {/* Search */}
        <Route
          path="/search"
          element={
            <PrivateRoute>
              <ComingSoon title="Search" />
            </PrivateRoute>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <ComingSoon title="Settings" />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function ComingSoon({ title }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100svh', flexDirection: 'column', gap: 16,
      color: 'var(--color-text-primary)', background: 'var(--color-bg)',
    }}>
      <h2 style={{ color: 'var(--color-text-heading)' }}>{title}</h2>
      <p>Page coming soon.</p>
    </div>
  );
}
