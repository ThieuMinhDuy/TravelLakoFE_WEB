import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { apiClient } from '@/services/apiClient';
import { ApiError, hasStatus } from '@/services/apiError';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/store/useAuthStore';
import {
  authService,
  isResetOtpError,
  isUnverifiedLoginError,
} from '@/features/auth/services/authService';

/** Adapter giả: trả lỗi HTTP với status + body cho trước */
const failWith =
  (status: number, data: unknown): AxiosAdapter =>
  async (config: InternalAxiosRequestConfig) => {
    throw new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, undefined, {
      status,
      statusText: '',
      headers: {},
      config,
      data,
    });
  };

describe('apiClient — chuẩn hóa lỗi thành ApiError', () => {
  afterEach(() => useAuthStore.getState().logout());

  it('giữ lại HTTP status, code và body', async () => {
    const error = await apiClient
      .get('/places/abc', { adapter: failWith(404, { message: 'Không tìm thấy', code: 'NOT_FOUND' }) })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ message: 'Không tìm thấy', status: 404, code: 'NOT_FOUND' });
    expect(hasStatus(error, 403, 404)).toBe(true);
  });

  it('401 ở API cần đăng nhập → đăng xuất phía client và xóa cache', async () => {
    useAuthStore.getState().setAuth({ _id: '1', name: 'A', email: 'a@gmail.com' }, 'expired', true);
    queryClient.setQueryData(['profile'], { name: 'A' });

    await apiClient.get('/trips', { adapter: failWith(401, { message: 'Token hết hạn' }) }).catch(() => undefined);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(queryClient.getQueryData(['profile'])).toBeUndefined();
  });

  it('401 khi sai mật khẩu ở /auth/login KHÔNG đăng xuất phiên hiện tại', async () => {
    useAuthStore.getState().setAuth({ _id: '1', name: 'A', email: 'a@gmail.com' }, 'valid', true);

    await apiClient
      .post('/auth/login', {}, { adapter: failWith(401, { message: 'Invalid email or password' }) })
      .catch(() => undefined);

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});

describe('authService — phân loại lỗi theo status', () => {
  it('đổi lỗi 401 khi đăng nhập sang tiếng Việt, vẫn giữ status', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(
      new ApiError('Invalid email or password', { status: 401 })
    );
    await expect(authService.login({ email: 'a@gmail.com', password: 'x' })).rejects.toMatchObject({
      message: 'Email hoặc mật khẩu không chính xác!',
      status: 401,
    });
  });

  it('nhận diện tài khoản chưa xác thực (400) và OTP sai (400) bằng status', () => {
    expect(isUnverifiedLoginError(new ApiError('bất kỳ câu chữ nào', { status: 400 }))).toBe(true);
    expect(isUnverifiedLoginError(new ApiError('Tài khoản bị khóa', { status: 403 }))).toBe(false);
    expect(isResetOtpError(new ApiError('Mã OTP đã hết hạn!', { status: 400 }))).toBe(true);
    expect(isResetOtpError(new ApiError('Không tìm thấy người dùng!', { status: 404 }))).toBe(false);
  });
});
