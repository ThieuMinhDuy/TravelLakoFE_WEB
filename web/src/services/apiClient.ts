import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { useAuthStore } from '../store/useAuthStore';
import { ApiError } from './apiError';
import { queryClient } from '../lib/queryClient';

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
  (response) => response,
  (error: AxiosError<ErrorBody>) => {
    const status = error.response?.status ?? null;
    const data = error.response?.data;
    const message = data?.message || error.message || 'Đã xảy ra lỗi kết nối đến máy chủ!';

    // Token hết hạn hoặc không hợp lệ → xóa phiên phía client.
    // Không cần tự chuyển trang: ProtectedRoute sẽ đưa người dùng tới popup đăng nhập
    // (giữ nguyên SPA, không reload mất state).
    const url = error.config?.url ?? '';
    if (status === 401 && !PUBLIC_AUTH_ENDPOINT.test(url) && useAuthStore.getState().token) {
      useAuthStore.getState().logout();
      queryClient.clear();
    }

    return Promise.reject(
      new ApiError(message, { status, code: data?.code ?? error.code, data, cause: error })
    );
  }
);
