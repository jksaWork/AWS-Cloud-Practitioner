import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '../user';

export default function AuthGuard() {
  if (!getCurrentUser()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
