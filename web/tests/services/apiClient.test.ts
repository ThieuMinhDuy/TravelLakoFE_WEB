import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { apiClient } from '@/services/apiClient';
import { sessionEvents } from '@/lib/sessionEvents';
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

describe('apiClient — 403 của middleware xác thực (theo mã lỗi)', () => {
  const admin = { _id: '1', name: 'A', email: 'a@gmail.com', isAdmin: true };
  afterEach(() => useAuthStore.getState().logout());

  it('tài khoản bị khóa khi đang dùng → đăng xuất, xóa cache, báo sự kiện "blocked"', async () => {
    useAuthStore.getState().setAuth(admin, 'tk', true);
    queryClient.setQueryData(['profile'], { name: 'A' });
    const listener = vi.fn();
    const unsubscribe = sessionEvents.subscribe(listener);

    await apiClient
      .get('/trips', { adapter: failWith(403, { message: 'Tài khoản của bạn đã bị khóa!', code: 'ACCOUNT_BLOCKED' }) })
      .catch(() => undefined);
    unsubscribe();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(queryClient.getQueryData(['profile'])).toBeUndefined();
    expect(listener).toHaveBeenCalledWith({ type: 'blocked', message: 'Tài khoản của bạn đã bị khóa!' });
  });

  it('bị gỡ quyền admin → vẫn đăng nhập nhưng isAdmin = false, bỏ cache admin', async () => {
    useAuthStore.getState().setAuth(admin, 'tk', true);
    queryClient.setQueryData(['admin', 'users'], { total: 0, users: [] });

    await apiClient
      .get('/admin/users', { adapter: failWith(403, { message: 'Not authorized as an admin', code: 'NOT_ADMIN' }) })
      .catch(() => undefined);

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.isAdmin).toBe(false);
    expect(queryClient.getQueryData(['admin', 'users'])).toBeUndefined();
  });

  it('403 khác (vd: không phải chủ chuyến đi) không đụng tới phiên đăng nhập', async () => {
    useAuthStore.getState().setAuth(admin, 'tk', true);
    await apiClient
      .delete('/trips/t1', { adapter: failWith(403, { message: 'Bạn không có quyền với chuyến đi này' }) })
      .catch(() => undefined);
    expect(useAuthStore.getState().user?.isAdmin).toBe(true);
  });

  it('đăng nhập bằng tài khoản bị khóa (endpoint công khai) không phát sự kiện', async () => {
    const listener = vi.fn();
    const unsubscribe = sessionEvents.subscribe(listener);
    await apiClient
      .post('/auth/login', {}, { adapter: failWith(403, { message: 'Tài khoản của bạn đã bị khóa!', code: 'ACCOUNT_BLOCKED' }) })
      .catch(() => undefined);
    unsubscribe();
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('apiClient — phản hồi không phải JSON', () => {
  it('nhận trang HTML (fallback của proxy / dev server, mã 200) → báo lỗi thay vì trả chuỗi HTML', async () => {
    const htmlAdapter: AxiosAdapter = async (config) => ({
      data: '<!doctype html><html></html>',
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'text/html; charset=utf-8' },
      config,
    });

    const error = await apiClient.get('/trips', { adapter: htmlAdapter }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'INVALID_RESPONSE', status: 200 });
  });
});

describe('authService — phân loại lỗi theo mã', () => {
  afterEach(() => vi.restoreAllMocks());

  it('INVALID_CREDENTIALS → câu tiếng Việt, vẫn giữ status và mã', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(
      new ApiError('Invalid email or password', { status: 401, code: 'INVALID_CREDENTIALS' })
    );
    await expect(authService.login({ email: 'a@gmail.com', password: 'x' })).rejects.toMatchObject({
      message: 'Email hoặc mật khẩu không chính xác!',
      status: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('401 của đăng nhập Google giữ nguyên câu của backend', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(
      new ApiError('Email Google của bạn chưa được xác minh!', { status: 401, code: 'GOOGLE_EMAIL_UNVERIFIED' })
    );
    await expect(authService.googleLogin('id-token')).rejects.toMatchObject({
      message: 'Email Google của bạn chưa được xác minh!',
    });
  });

  it('lỗi: mất mạng (không có phản hồi) → câu tiếng Việt dễ hiểu thay cho "Network Error"', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(new ApiError('Network Error', { status: null }));
    await expect(authService.register({ name: 'A', email: 'a@gmail.com', password: 'MatKhau1' })).rejects.toMatchObject({
      message: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.',
      status: null,
    });
  });

  it('lỗi: máy chủ phản hồi quá lâu (ECONNABORTED, vd Render đang khởi động) → câu tiếng Việt', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(
      new ApiError('timeout of 60000ms exceeded', { status: null, code: 'ECONNABORTED' })
    );
    await expect(authService.login({ email: 'a@gmail.com', password: 'MatKhau1' })).rejects.toMatchObject({
      message: 'Máy chủ phản hồi quá lâu, vui lòng thử lại.',
      code: 'ECONNABORTED',
    });
  });

  it('chỉ ACCOUNT_UNVERIFIED là "chưa xác thực"; WEAK_PASSWORD không phải lỗi OTP', () => {
    expect(isUnverifiedLoginError(new ApiError('x', { status: 400, code: 'ACCOUNT_UNVERIFIED' }))).toBe(true);
    expect(isUnverifiedLoginError(new ApiError('x', { status: 400, code: 'MISSING_FIELDS' }))).toBe(false);
    expect(isUnverifiedLoginError(new ApiError('x', { status: 400, code: 'ERR_BAD_REQUEST' }))).toBe(false);

    expect(isResetOtpError(new ApiError('x', { status: 400, code: 'OTP_EXPIRED' }))).toBe(true);
    expect(isResetOtpError(new ApiError('x', { status: 400, code: 'OTP_ATTEMPTS_EXCEEDED' }))).toBe(true);
    expect(isResetOtpError(new ApiError('x', { status: 400, code: 'WEAK_PASSWORD' }))).toBe(false);
  });
});

describe('apiError — mã lỗi backend', () => {
  it('hasErrorCode so với mã cụ thể, không nhầm với mã của axios', async () => {
    const { hasErrorCode, getRetryAfter } = await import('@/services/apiError');
    const withCode = new ApiError('Đợi 45 giây', { status: 429, code: 'OTP_COOLDOWN', data: { retryAfter: 45 } });
    const axiosOnly = new ApiError('Bad request', { status: 400, code: 'ERR_BAD_REQUEST' });

    expect(hasErrorCode(withCode, 'OTP_COOLDOWN', 'RATE_LIMITED')).toBe(true);
    expect(hasErrorCode(axiosOnly, 'ACCOUNT_UNVERIFIED')).toBe(false);
    expect(getRetryAfter(withCode)).toBe(45);
    expect(getRetryAfter(axiosOnly)).toBeNull();
  });

  it('403 không phải ACCOUNT_BLOCKED / NOT_ADMIN dù câu chữ giống cũng không đăng xuất', async () => {
    useAuthStore.getState().setAuth({ _id: '1', name: 'A', email: 'a@gmail.com', isAdmin: true }, 'tk', true);
    await apiClient
      .get('/trips', { adapter: failWith(403, { message: 'Tài khoản của bạn đã bị khóa!' }) })
      .catch(() => undefined);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    useAuthStore.getState().logout();
  });
});
