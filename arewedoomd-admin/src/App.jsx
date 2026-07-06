import { AdminAuthProvider } from './context/AdminAuthContext';
import AppRouter from './router/AppRouter';

export default function App() {
  return (
    <AdminAuthProvider>
      <AppRouter />
    </AdminAuthProvider>
  );
}
