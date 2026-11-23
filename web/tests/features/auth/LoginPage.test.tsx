import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
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
  afterEach(() => useAuthStore.getState().logout());

  it('mật khẩu toàn dấu cách bị chặn ngay ở form, không gọi API', async () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    await fillAndSubmit('a@gmail.com', '   ');

    expect(await screen.findByText('Vui lòng nhập mật khẩu')).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('sai email / mật khẩu (401) → hiện thông báo lỗi trong form', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new ApiError('Email hoặc mật khẩu không chính xác!', { status: 401 })
    );
    renderWithProviders(<LoginPage />, { route: '/login' });
    await fillAndSubmit('a@gmail.com', 'SaiMatKhau1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Email hoặc mật khẩu không chính xác!');
  });

  it('tài khoản chưa xác thực (400) → gửi lại OTP và chuyển sang màn xác thực', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new ApiError('Tài khoản chưa được xác thực.', { status: 400 })
    );
    vi.mocked(authService.resendOtp).mockResolvedValue({ message: 'ok' });
    renderWithProviders(<LoginPage />, { route: '/login' });

    await userEvent.click(screen.getByLabelText('Ghi nhớ đăng nhập')); // bỏ chọn
    await fillAndSubmit('moi@gmail.com', 'MatKhau1');

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/verify-otp?email=moi%40gmail.com&remember=0')
    );
    expect(authService.resendOtp).toHaveBeenCalledWith('moi@gmail.com');
  });

  it('mã vừa gửi chưa đủ 60 giây (429) → nhắc nhẹ, không báo lỗi', async () => {
    vi.mocked(authService.login).mockRejectedValue(new ApiError('chưa xác thực', { status: 400 }));
    vi.mocked(authService.resendOtp).mockRejectedValue(
      new ApiError('Vui lòng đợi 40 giây trước khi yêu cầu mã OTP mới!', { status: 429 })
    );
    renderWithProviders(<LoginPage />, { route: '/login' });
    await fillAndSubmit('moi@gmail.com', 'MatKhau1');

    await waitFor(() => expect(toast.info).toHaveBeenCalledWith('Mã OTP vừa được gửi gần đây', expect.anything()));
    expect(toast.error).not.toHaveBeenCalled();
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
});
