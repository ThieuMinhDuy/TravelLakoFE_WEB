import { apiClient } from '../../../services/apiClient';
import type { MessageResponse } from '../../../types/api';
import type { User } from '../../../types/user';

/** Render free có thể "ngủ" — request đầu tiên mất 30-50s để khởi động lại */
const AUTH_TIMEOUT = 60_000;

/** Response đăng nhập: thông tin user kèm JWT */
export type AuthUserResponse = User & { token: string };

export interface RegisterResponse extends MessageResponse {
  email: string;
}

const ERROR_MESSAGES: [RegExp, string][] = [
  [/invalid email or password/i, 'Email hoặc mật khẩu không chính xác!'],
  [/timeout of \d+ms exceeded/i, 'Máy chủ phản hồi quá lâu, vui lòng thử lại.'],
  [/network error/i, 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.'],
  [/sai định dạng email/i, 'Email không hợp lệ (chỉ chấp nhận địa chỉ @gmail.com).'],
];

function toFriendlyError(error: unknown): Error {
  const raw = error instanceof Error ? error.message : String(error);
  const match = ERROR_MESSAGES.find(([pattern]) => pattern.test(raw));
  return new Error(match ? match[1] : raw);
}

async function post<T>(url: string, body?: unknown): Promise<T> {
  try {
    const res = await apiClient.post<T>(url, body, { timeout: AUTH_TIMEOUT });
    return res.data;
  } catch (error) {
    throw toFriendlyError(error);
  }
}

/** Đăng nhập bị chặn vì tài khoản chưa xác thực email (backend trả 400) */
export const isUnverifiedError = (error: unknown) =>
  error instanceof Error && /chưa được xác thực/i.test(error.message);

/** Lỗi liên quan tới mã OTP (sai hoặc hết hạn) */
export const isOtpError = (error: unknown) =>
  error instanceof Error && /otp/i.test(error.message);

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

  googleLogin: (idToken: string) => post<AuthUserResponse>('/auth/google', { idToken }),

  getProfile: async (): Promise<User> => {
    try {
      const res = await apiClient.get<User>('/auth/profile', { timeout: AUTH_TIMEOUT });
      return res.data;
    } catch (error) {
      throw toFriendlyError(error);
    }
  },
};
