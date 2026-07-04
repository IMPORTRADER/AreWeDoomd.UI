import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import LoginPage from '../pages/LoginPage/LoginPage';
import DashboardPage from '../pages/DashboardPage/DashboardPage';

function RequireAdmin({ children }) {
  const { user, loading } = useAdminAuth();

  if (loading) return <LoadingSpinner />;
  if (user)    return children;
  return <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAdminAuth();

  if (loading) return <LoadingSpinner />;
  if (user)    return <Navigate to="/" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <RequireAdmin>
              <DashboardPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export { RequireAdmin };
