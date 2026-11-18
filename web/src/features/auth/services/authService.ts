import { apiClient } from '../../../services/apiClient';
import type { MessageResponse } from '../../../types/api';
import type { User } from '../../../types/user';
import { ApiError, hasStatus, isApiError } from '../../../services/apiError';

/** Render free có thể "ngủ" — request đầu tiên mất 30-50s để khởi động lại */
const AUTH_TIMEOUT = 60_000;

/** Response đăng nhập: thông tin user kèm JWT */
export type AuthUserResponse = User & { token: string };

export interface RegisterResponse extends MessageResponse {
  email: string;
}

/** Đổi lỗi kỹ thuật sang câu tiếng Việt thân thiện, vẫn giữ nguyên status/code */
function toFriendlyError(error: unknown, url: string): ApiError {
  if (!isApiError(error)) {
    return new ApiError(error instanceof Error ? error.message : String(error), { cause: error });
  }

  let message = error.message;
  if (error.code === 'ECONNABORTED') {
    message = 'Máy chủ phản hồi quá lâu, vui lòng thử lại.';
  } else if (error.isNetworkError) {
    message = 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.';
  } else if (url === '/auth/login' && error.status === 401) {
    // Backend trả câu tiếng Anh "Invalid email or password"
    message = 'Email hoặc mật khẩu không chính xác!';
  }

  return message === error.message
    ? error
    : new ApiError(message, { status: error.status, code: error.code, data: error.data, cause: error });
}

async function post<T>(url: string, body?: unknown): Promise<T> {
  try {
    const res = await apiClient.post<T>(url, body, { timeout: AUTH_TIMEOUT });
    return res.data;
  } catch (error) {
    throw toFriendlyError(error, url);
  }
}

/**
 * POST /auth/login trả 400 duy nhất khi tài khoản chưa xác thực email
 * (sai mật khẩu → 401, bị khóa → 403). Chỉ dùng cho lỗi của API đăng nhập.
 */
export const isUnverifiedLoginError = (error: unknown) => hasStatus(error, 400);

/**
 * POST /auth/reset-password trả 400 khi mã OTP sai hoặc hết hạn.
 * Các lỗi 400 khác (thiếu trường, mật khẩu yếu) đã được form chặn trước khi gửi.
 */
export const isResetOtpError = (error: unknown) => hasStatus(error, 400);

export const authService = {
  login: (data: { email: string; password: string }) =>
    post<AuthUserResponse>('/auth/login', data),

  register: (data: { name: string; email: string; password: string }) =>
    post<RegisterResponse>('/auth/register', data),

  verifyOtp: (data: { email: string; otp: string }) =>
    post<AuthUserResponse>('/auth/verify-otp', data),

  resendOtp: (email: string) => post<MessageResponse>('/auth/resend-otp', { email }),

  forgotPassword: (email: string) =>
    post<MessageResponse>('/auth/forgot-password', { email }),

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    post<MessageResponse>('/auth/reset-password', data),

  /** Backend xóa cookie `jwt`; FE dùng Bearer nên chỉ mang tính báo hiệu (best-effort) */
  logout: () => post<MessageResponse>('/auth/logout'),

  googleLogin: (idToken: string) => post<AuthUserResponse>('/auth/google', { idToken }),

  getProfile: async (): Promise<User> => {
    try {
      const res = await apiClient.get<User>('/auth/profile', { timeout: AUTH_TIMEOUT });
      return res.data;
    } catch (error) {
      throw toFriendlyError(error, '/auth/profile');
    }
  },
};
