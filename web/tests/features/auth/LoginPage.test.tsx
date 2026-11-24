import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { authService } from '@/features/auth/services/authService';
import { ApiError } from '@/services/apiError';
import { useAuthStore } from '@/store/useAuthStore';
import { renderWithProviders } from '../../helpers/renderWithProviders';

vi.mock('@/features/auth/services/authService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/auth/services/authService')>();
  return {
    ...actual,
    authService: { login: vi.fn(), resendOtp: vi.fn(), getProfile: vi.fn().mockResolvedValue({}) },
  };
});
// Nút Google cần Google SDK + Client ID thật — không thuộc phạm vi test này
vi.mock('@/features/auth/components/GoogleAuthButton', () => ({ GoogleAuthButton: () => null }));
vi.mock('sonner', () => ({
  Toaster: () => null,
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn(), promise: vi.fn(), dismiss: vi.fn() },
}));

const fillAndSubmit = async (email: string, password: string) => {
  await userEvent.type(screen.getByLabelText('Địa chỉ email'), email);
  await userEvent.type(screen.getByLabelText('Mật khẩu'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
};

describe('Màn Đăng nhập', () => {
  afterEach(() => {
    useAuthStore.getState().logout();
    vi.clearAllMocks();
  });

  it('mật khẩu toàn dấu cách bị chặn ngay ở form, không gọi API', async () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    await fillAndSubmit('a@gmail.com', '   ');

    expect(await screen.findByText('Vui lòng nhập mật khẩu')).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('INVALID_CREDENTIALS → hiện lỗi trong form', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new ApiError('Email hoặc mật khẩu không chính xác!', { status: 401, code: 'INVALID_CREDENTIALS' })
    );
    renderWithProviders(<LoginPage />, { route: '/login' });
    await fillAndSubmit('a@gmail.com', 'SaiMatKhau1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Email hoặc mật khẩu không chính xác!');
  });

  it('ACCOUNT_UNVERIFIED → sang màn OTP với send=1 (màn OTP tự gửi mã), giữ lựa chọn "Ghi nhớ"', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new ApiError('Tài khoản chưa được xác thực.', { status: 400, code: 'ACCOUNT_UNVERIFIED' })
    );
    renderWithProviders(<LoginPage />, { route: '/login' });

    await userEvent.click(screen.getByLabelText('Ghi nhớ đăng nhập')); // bỏ chọn
    await fillAndSubmit('moi@gmail.com', 'MatKhau1');

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/verify-otp?email=moi%40gmail.com&send=1&remember=0')
    );
    expect(authService.resendOtp).not.toHaveBeenCalled();
  });

  it('400 khác (MISSING_FIELDS) không bị coi là "chưa xác thực": hiện lỗi, ở lại màn đăng nhập', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new ApiError('Vui lòng nhập Email và Mật khẩu!', { status: 400, code: 'MISSING_FIELDS' })
    );
    renderWithProviders(<LoginPage />, { route: '/login' });
    await fillAndSubmit('moi@gmail.com', 'MatKhau1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Vui lòng nhập Email và Mật khẩu!');
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/login$/);
  });

  it('đăng nhập thành công, bỏ "Ghi nhớ" → phiên chỉ lưu trong sessionStorage', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      _id: 'u1',
      name: 'Hoàng',
      email: 'hoang@gmail.com',
      isAdmin: false,
      token: 'jwt-123',
    });
    renderWithProviders(<LoginPage />, { route: '/login' });

    await userEvent.click(screen.getByLabelText('Ghi nhớ đăng nhập'));
    await fillAndSubmit('hoang@gmail.com', 'MatKhau1');

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true));
    expect(useAuthStore.getState().token).toBe('jwt-123');
    expect(sessionStorage.getItem('tripmate_auth')).toContain('jwt-123');
    expect(localStorage.getItem('tripmate_auth')).toBeNull();
  });

  it('lỗi: tài khoản bị khóa (ACCOUNT_BLOCKED) → báo lỗi, không đăng nhập, không sang màn OTP', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new ApiError('Tài khoản của bạn đã bị khóa!', { status: 403, code: 'ACCOUNT_BLOCKED' })
    );
    renderWithProviders(<LoginPage />, { route: '/login' });
    await fillAndSubmit('bi.khoa@gmail.com', 'MatKhau1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Tài khoản của bạn đã bị khóa!');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/login$/);
  });

  it('lỗi: đăng nhập sai quá nhiều lần (RATE_LIMITED 429) → hiện thông báo của máy chủ', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new ApiError('Bạn đã thử đăng nhập quá nhiều lần, vui lòng thử lại sau 15 phút.', {
        status: 429,
        code: 'RATE_LIMITED',
        data: { retryAfter: 900 },
      })
    );
    renderWithProviders(<LoginPage />, { route: '/login' });
    await fillAndSubmit('a@gmail.com', 'MatKhau1');

    expect(await screen.findByRole('alert')).toHaveTextContent('thử đăng nhập quá nhiều lần');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('lỗi: email sai định dạng → chặn ngay ở form, không gọi API', async () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    await fillAndSubmit('khong-phai-email', 'MatKhau1');

    expect(await screen.findByText('Email không hợp lệ')).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });
});
