import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

export default function AdminProtectedRoute() {
  const { accessToken, user } = useAdminAuth();

  if (!accessToken || !user || user.role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
