import { Navigate, Outlet } from 'react-router-dom';
import { getRole, isLoggedIn } from '../lib/auth';

export default function ProtectedDriverRoute() {
  if (!isLoggedIn()) return <Navigate to="/driver/login" replace />;
  if (getRole() !== 'driver') return <Navigate to="/login" replace />;
  return <Outlet />;
}
