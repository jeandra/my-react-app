import { useAuthStore } from '../store/useAuthStore';
import Login from './Login';

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);

  if (!token) return <Login />;

  return children;
}

export default ProtectedRoute;
