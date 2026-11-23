import { apiClient } from '../../../services/apiClient';
import type { MessageResponse } from '../../../types/api';
import type { User } from '../../../types/user';
import { ApiError, hasErrorCode, isApiError } from '../../../services/apiError';

/** Render free có thể "ngủ" — request đầu tiên mất 30-50s để khởi động lại */
const AUTH_TIMEOUT = 60_000;

/** Response đăng nhập: thông tin user kèm JWT */
export type AuthUserResponse = User & { token: string };

export interface RegisterResponse extends MessageResponse {
  email: string;
}

/** Đổi lỗi kỹ thuật sang câu tiếng Việt thân thiện, vẫn giữ nguyên status/code */
function toFriendlyError(error: unknown): ApiError {
  if (!isApiError(error)) {
    return new ApiError(error instanceof Error ? error.message : String(error), { cause: error });
  }

  let message = error.message;
  if (error.code === 'ECONNABORTED') {
    message = 'Máy chủ phản hồi quá lâu, vui lòng thử lại.';
  } else if (error.isNetworkError) {
    message = 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.';
  } else if (hasErrorCode(error, 'INVALID_CREDENTIALS')) {
    // Backend còn trả câu tiếng Anh "Invalid email or password" (sẽ dịch ở mục 13 của tài liệu 09).
    // Chỉ đổi đúng mã này: 401 của đăng nhập Google có mã riêng và câu tiếng Việt.
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
    throw toFriendlyError(error);
  }
}

/** Tài khoản chưa xác thực email (đăng nhập, quên mật khẩu) → gửi lại OTP và chuyển sang màn xác thực */
export const isUnverifiedLoginError = (error: unknown) => hasErrorCode(error, 'ACCOUNT_UNVERIFIED');

/**
 * Lỗi thuộc về mã OTP (sai, hết hạn, nhập sai quá số lần). Lỗi 400 khác như `WEAK_PASSWORD`
 * (mật khẩu mới yếu) không phải lỗi OTP.
 */
export const isResetOtpError = (error: unknown) =>
  hasErrorCode(error, 'OTP_INVALID', 'OTP_EXPIRED', 'OTP_ATTEMPTS_EXCEEDED');

/** Mã OTP không dùng được nữa (hết hạn / bị hủy sau 5 lần sai) → người dùng phải yêu cầu mã mới */
export const isOtpRenewRequired = (error: unknown) => hasErrorCode(error, 'OTP_EXPIRED', 'OTP_ATTEMPTS_EXCEEDED');

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

  /**
   * PUT /auth/change-password — đổi mật khẩu (cần mật khẩu hiện tại) hoặc tạo mật khẩu lần đầu
   * cho tài khoản Google. Lỗi: CURRENT_PASSWORD_INCORRECT, WEAK_PASSWORD, SAME_PASSWORD (400),
   * RATE_LIMITED (429, có retryAfter).
   */
  changePassword: async (data: { currentPassword?: string; newPassword: string }): Promise<MessageResponse> => {
    try {
      const res = await apiClient.put<MessageResponse>('/auth/change-password', data);
      return res.data;
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const res = await apiClient.get<User>('/auth/profile', { timeout: AUTH_TIMEOUT });
      return res.data;
    } catch (error) {
      throw toFriendlyError(error);
    }
  },
};
