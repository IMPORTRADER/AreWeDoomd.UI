import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function HomePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: 24 }}>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
