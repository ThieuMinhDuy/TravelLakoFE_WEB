import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../contexts/toast/ToastContext';
import { queryClient } from '../../../lib/queryClient';
import { useAuthStore } from '../../../store/useAuthStore';
import { authService } from '../services/authService';

/** Đăng xuất: báo backend, xóa phiên + toàn bộ cache dữ liệu của user cũ, về trang chủ */
export function useLogout() {
  const navigate = useNavigate();
  const toast = useToast();

  return useCallback(() => {
    // Best-effort: không chặn người dùng nếu backend đang ngủ / lỗi mạng
    authService.logout().catch(() => undefined);

    useAuthStore.getState().logout();
    // Tránh dữ liệu cache của user cũ hiện ra cho người đăng nhập sau
    queryClient.clear();

    toast.success('Đã đăng xuất. Hẹn gặp lại bạn!');
    navigate('/');
  }, [navigate, toast]);
}
