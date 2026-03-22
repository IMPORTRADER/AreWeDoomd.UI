import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage  from '../pages/LoginPage/LoginPage';
import HomePage   from '../pages/HomePage/HomePage';
import ComingSoon from '../pages/ComingSoon';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <Navigate to="/" replace /> : children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<ComingSoon title="Forgot Password" />} />
        <Route path="/register"        element={<ComingSoon title="Register" />} />

        {/* Home — public, guest UI handled inside */}
        <Route path="/" element={<HomePage />} />

        {/* Private */}
        <Route path="/search"        element={<PrivateRoute><ComingSoon title="Search" /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><ComingSoon title="Notifications" /></PrivateRoute>} />
        <Route path="/settings"      element={<PrivateRoute><ComingSoon title="Settings" /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
