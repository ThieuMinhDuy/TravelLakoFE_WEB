import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { isAdminUser } from '../utils/auth';
import { ForbiddenPage } from '../pages/ForbiddenPage';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  /** Hiển thị khi đã đăng nhập nhưng không đủ quyền (mặc định: trang 403) */
  forbiddenFallback?: React.ReactNode;
}

/**
 * - Chưa đăng nhập → mở popup đăng nhập, kèm `redirect` để quay lại sau khi đăng nhập
 * - Đã đăng nhập nhưng thiếu quyền Admin → hiển thị 403 (giữ nguyên URL)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  forbiddenFallback = <ForbiddenPage />,
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
    return <>{forbiddenFallback}</>;
  }

  return <>{children}</>;
};
