import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { storage } from '../utils/storage';

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  withCredentials: true, // Cho phép gửi và nhận cookie jwt qua CORS
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Tự động gán Bearer Token nếu có
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// Response Interceptor: Chuẩn hóa error message & bắt lỗi 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const statusCode = error.response?.status;
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Đã xảy ra lỗi kết nối đến máy chủ!';

    // Khi token hết hạn hoặc không hợp lệ (401)
    if (statusCode === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage =
        currentPath.includes('/login') ||
        currentPath.includes('/register') ||
        currentPath.includes('/verify-otp');

      if (!isAuthPage) {
        storage.clearAll();
        // Không redirect cưỡng bức nếu đang ở trang công khai
        if (currentPath.startsWith('/admin') || currentPath.startsWith('/profile')) {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }

    return Promise.reject(new Error(errorMessage));
  }
);
