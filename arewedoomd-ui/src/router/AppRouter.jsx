import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage/LoginPage';

// Lazy-loaded pages will be added here as the project grows
// import { lazy, Suspense } from 'react';
// const DashboardPage = lazy(() => import('../pages/DashboardPage/DashboardPage'));

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading" />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading" />;
  return user ? <Navigate to="/dashboard" replace /> : children;
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

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <ComingSoon title="Dashboard" />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Placeholder until pages are built
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
