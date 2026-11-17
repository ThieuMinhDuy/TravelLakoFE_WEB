import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Xác thực bằng Bearer token (không dùng cookie):
 * - Backend (onrender.com) khác site với Frontend nên cookie bên thứ ba dễ bị trình duyệt chặn.
 * - Cho phép Frontend tự kiểm soát "Ghi nhớ đăng nhập" và đăng xuất hoàn toàn phía client.
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

// Response Interceptor: Chuẩn hóa error message & bắt lỗi 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const statusCode = error.response?.status;
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Đã xảy ra lỗi kết nối đến máy chủ!';

    // Token hết hạn hoặc không hợp lệ (401) → đăng xuất phía client
    const url = error.config?.url ?? '';
    if (statusCode === 401 && !PUBLIC_AUTH_ENDPOINT.test(url) && useAuthStore.getState().token) {
      useAuthStore.getState().logout();
      const currentPath = window.location.pathname;
      // Chỉ chuyển hướng khi đang ở trang yêu cầu đăng nhập
      if (currentPath.startsWith('/admin') || currentPath.startsWith('/profile')) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }

    return Promise.reject(new Error(errorMessage));
  }
);
