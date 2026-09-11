import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

const AdminProtectedRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, đá về trang chủ (hoặc trang login)
  if (!isAuthenticated || !user) {
    // Tạm thời để '/' vì dự án chưa có route /login
    return <Navigate to="/" replace />;
  }

  // Nếu đã đăng nhập nhưng không phải admin
  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Cho phép render giao diện con (AdminLayout)
  return <Outlet />;
};

export default AdminProtectedRoute;
