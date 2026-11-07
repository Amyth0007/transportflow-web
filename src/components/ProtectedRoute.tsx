import { Navigate, Outlet } from 'react-router-dom';
import { getRole, isLoggedIn } from '../lib/auth';

export default function ProtectedRoute() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  const role = getRole();
  if (role === 'super_admin') return <Navigate to="/super-admin/orgs" replace />;
  if (role === 'driver') return <Navigate to="/driver" replace />;
  return <Outlet />;
}
