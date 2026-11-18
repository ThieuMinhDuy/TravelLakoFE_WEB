import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { isAdminUser } from '../utils/auth';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/** Báo không đủ quyền rồi về trang chủ. Toast nằm trong effect (không phải side effect lúc render);
 *  `id` cố định để StrictMode chạy effect 2 lần cũng chỉ hiện 1 thông báo. */
const AdminAccessDenied: React.FC = () => {
  useEffect(() => {
    toast.error('Bạn không có quyền truy cập vào phân hệ Quản trị viên!', { id: 'admin-forbidden' });
  }, []);
  return <Navigate to="/" replace />;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  if (requireAdmin && !isAdminUser(user)) {
    return <AdminAccessDenied />;
  }

  return <>{children}</>;
};
