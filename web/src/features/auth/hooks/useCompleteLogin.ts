import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '../../../store/useAuthStore';
import { authService, type AuthUserResponse } from '../services/authService';

/**
 * Lưu phiên đăng nhập sau khi Login / Verify OTP / Google thành công.
 * GuestRoute sẽ tự đóng popup và điều hướng khi store chuyển sang isAuthenticated.
 */
export function useCompleteLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const updateUser = useAuthStore((s) => s.updateUser);

  return useCallback(
    (response: AuthUserResponse, remember: boolean) => {
      const { token, ...user } = response;
      setAuth(user, token, remember);
      toast.success(`Chào mừng ${user.name} đến với TripMate!`);

      // Login chỉ trả về thông tin rút gọn → tải đầy đủ profile (kèm thống kê) ở nền
      authService
        .getProfile()
        .then(updateUser)
        .catch(() => undefined);
    },
    [setAuth, updateUser]
  );
}
