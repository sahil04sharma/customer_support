import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  role?: 'BUSINESS' | 'AGENT';
}

export default function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { accessToken, user } = useAuth();

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'AGENT' ? '/agent' : '/dashboard'} replace />;
  }

  return <Outlet />;
}
