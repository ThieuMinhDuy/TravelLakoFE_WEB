import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { useAuthStore } from '../store/useAuthStore';
import { ApiError } from './apiError';
import { queryClient } from '../lib/queryClient';
import { queryKeys } from '../lib/queryKeys';
import { sessionEvents } from '../lib/sessionEvents';

/**
 * Xác thực bằng Bearer token (không dùng cookie):
 * - Backend (onrender.com) khác site với Frontend nên cookie bên thứ ba dễ bị trình duyệt chặn.
 * - Cho phép Frontend tự kiểm soát "Ghi nhớ đăng nhập" và đăng xuất hoàn toàn phía client.
 * Middleware `protect` của backend đọc cả cookie lẫn header `Authorization: Bearer`.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Tự động gán Bearer Token nếu có
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// Các endpoint auth công khai trả 401 khi sai thông tin đăng nhập — không phải hết phiên
const PUBLIC_AUTH_ENDPOINT = /^\/?auth\/(login|register|google|verify-otp|resend-otp|forgot-password|reset-password)/;

interface ErrorBody {
  message?: string;
  code?: string;
}

// Response Interceptor: Chuẩn hóa lỗi thành ApiError (giữ status) & xử lý 401
apiClient.interceptors.response.use(
  (response) => {
    // API luôn trả JSON. Nhận về trang HTML (dev server / proxy / CDN fallback với mã 200)
    // → coi là lỗi, tránh đưa chuỗi HTML vào code đang chờ object dữ liệu.
    const contentType = String(response.headers['content-type'] ?? '');
    if (contentType.includes('text/html')) {
      return Promise.reject(
        new ApiError('Máy chủ trả về dữ liệu không hợp lệ. Vui lòng thử lại sau.', {
          status: response.status,
          code: 'INVALID_RESPONSE',
        })
      );
    }
    return response;
  },
  (error: AxiosError<ErrorBody>) => {
    const status = error.response?.status ?? null;
    const data = error.response?.data;
    const message = data?.message || error.message || 'Đã xảy ra lỗi kết nối đến máy chủ!';

    // Token hết hạn hoặc không hợp lệ → xóa phiên phía client.
    // Không cần tự chuyển trang: ProtectedRoute sẽ đưa người dùng tới popup đăng nhập
    // (giữ nguyên SPA, không reload mất state).
    const url = error.config?.url ?? '';
    const hasSession = !PUBLIC_AUTH_ENDPOINT.test(url) && Boolean(useAuthStore.getState().token);
    if (status === 401 && hasSession) {
      useAuthStore.getState().logout();
      queryClient.clear();
    }

    // 403 của middleware `protect` / `admin`, nhận diện theo mã lỗi cố định của backend.
    // Các 403 khác (vd: không phải chủ chuyến đi) giữ nguyên cho nơi gọi tự xử lý.
    if (status === 403 && hasSession) {
      if (data?.code === 'ACCOUNT_BLOCKED') {
        // Bị khóa khi đang dùng: mọi request cần đăng nhập đều sẽ 403 → đăng xuất luôn
        useAuthStore.getState().logout();
        queryClient.clear();
        sessionEvents.emit({ type: 'blocked', message });
      } else if (data?.code === 'NOT_ADMIN' && useAuthStore.getState().user?.isAdmin) {
        // Bị admin khác gỡ quyền: cập nhật store → ProtectedRoute(requireAdmin) tự hiện trang 403
        useAuthStore.getState().updateUser({ isAdmin: false });
        queryClient.removeQueries({ queryKey: queryKeys.admin.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
        sessionEvents.emit({ type: 'admin-revoked', message });
      }
    }

    return Promise.reject(
      new ApiError(message, { status, code: data?.code ?? error.code, data, cause: error })
    );
  }
);
