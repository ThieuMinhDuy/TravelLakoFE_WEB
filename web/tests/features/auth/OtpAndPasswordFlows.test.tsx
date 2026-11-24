import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { VerifyOtpPage } from '@/features/auth/pages/VerifyOtpPage';
import { authService } from '@/features/auth/services/authService';
import { ChangePasswordCard } from '@/features/profile/components/ChangePasswordCard';
import { ApiError } from '@/services/apiError';
import { renderWithProviders } from '../../helpers/renderWithProviders';

vi.mock('@/features/auth/services/authService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/auth/services/authService')>();
  return {
    ...actual,
    authService: {
      verifyOtp: vi.fn(),
      resendOtp: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      changePassword: vi.fn(),
      getProfile: vi.fn().mockResolvedValue({}),
    },
  };
});
vi.mock('sonner', () => ({
  Toaster: () => null,
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn(), promise: vi.fn(), dismiss: vi.fn() },
}));

const typeOtp = (code: string) => userEvent.type(screen.getByLabelText('Mã OTP 6 số'), code);

afterEach(() => vi.clearAllMocks());

describe('Màn xác thực OTP', () => {
  it('send=1: tự gửi mã một lần, bỏ cờ khỏi URL; OTP_COOLDOWN → đếm ngược theo retryAfter', async () => {
    vi.mocked(authService.resendOtp).mockRejectedValue(
      new ApiError('Vui lòng đợi 45 giây trước khi yêu cầu mã OTP mới!', {
        status: 429,
        code: 'OTP_COOLDOWN',
        data: { retryAfter: 45 },
      })
    );
    renderWithProviders(<VerifyOtpPage />, { route: '/verify-otp?email=moi%40gmail.com&send=1' });

    expect(await screen.findByText('Gửi lại sau 45s')).toBeInTheDocument();
    expect(authService.resendOtp).toHaveBeenCalledTimes(1);
    expect(authService.resendOtp).toHaveBeenCalledWith('moi@gmail.com');
    expect(screen.getByTestId('location')).not.toHaveTextContent('send=1');
  });

  it('ACCOUNT_ALREADY_VERIFIED → chuyển sang đăng nhập, điền sẵn email', async () => {
    vi.mocked(authService.verifyOtp).mockRejectedValue(
      new ApiError('Tài khoản này đã được xác thực trước đó!', { status: 400, code: 'ACCOUNT_ALREADY_VERIFIED' })
    );
    renderWithProviders(<VerifyOtpPage />, { route: '/verify-otp?email=da%40gmail.com' });

    await typeOtp('123456');
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/login?email=da%40gmail.com'));
  });

  it('OTP_ATTEMPTS_EXCEEDED → hiện lỗi và làm nổi bật việc gửi mã mới', async () => {
    vi.mocked(authService.verifyOtp).mockRejectedValue(
      new ApiError('Bạn đã nhập sai quá 5 lần, mã đã bị hủy.', { status: 400, code: 'OTP_ATTEMPTS_EXCEEDED' })
    );
    renderWithProviders(<VerifyOtpPage />, { route: '/verify-otp?email=moi%40gmail.com' });

    await typeOtp('000000');
    expect(await screen.findByRole('alert')).toHaveTextContent('Bạn đã nhập sai quá 5 lần');
    expect(screen.getByText(/Mã cũ đã hết hiệu lực/)).toBeInTheDocument();
  });

  it('lỗi: nhập sai mã (OTP_INVALID) → hiện số lần thử còn lại, xóa trắng ô để nhập lại', async () => {
    vi.mocked(authService.verifyOtp).mockRejectedValue(
      new ApiError('Mã OTP không chính xác! Bạn còn 4 lần thử.', { status: 400, code: 'OTP_INVALID' })
    );
    renderWithProviders(<VerifyOtpPage />, { route: '/verify-otp?email=moi%40gmail.com' });

    await typeOtp('111111');
    expect(await screen.findByRole('alert')).toHaveTextContent('Bạn còn 4 lần thử');
    expect(screen.getByLabelText('Mã OTP 6 số')).toHaveValue('');
    // Mã sai nhưng vẫn còn hiệu lực → không bắt gửi mã mới
    expect(screen.queryByText(/Mã cũ đã hết hiệu lực/)).not.toBeInTheDocument();
  });

  it('lỗi: mã đã hết hạn (OTP_EXPIRED) → báo lỗi và nhắc gửi mã mới', async () => {
    vi.mocked(authService.verifyOtp).mockRejectedValue(
      new ApiError('Mã OTP đã hết hạn!', { status: 400, code: 'OTP_EXPIRED' })
    );
    renderWithProviders(<VerifyOtpPage />, { route: '/verify-otp?email=moi%40gmail.com' });

    await typeOtp('123456');
    expect(await screen.findByRole('alert')).toHaveTextContent('Mã OTP đã hết hạn!');
    expect(screen.getByText(/Mã cũ đã hết hiệu lực/)).toBeInTheDocument();
  });
});

describe('Quên / đặt lại mật khẩu', () => {
  it('quên mật khẩu với tài khoản chưa xác thực → sang màn OTP và tự gửi mã', async () => {
    vi.mocked(authService.forgotPassword).mockRejectedValue(
      new ApiError('Tài khoản chưa được xác thực.', { status: 400, code: 'ACCOUNT_UNVERIFIED' })
    );
    renderWithProviders(<ForgotPasswordPage />, { route: '/forgot-password' });

    await userEvent.type(screen.getByLabelText('Địa chỉ email'), 'moi@gmail.com');
    await userEvent.click(screen.getByRole('button', { name: /Gửi mã/ }));

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/verify-otp?email=moi%40gmail.com&send=1')
    );
  });

  it('WEAK_PASSWORD không bị coi là lỗi OTP: ở lại bước mật khẩu, báo ngay dưới ô', async () => {
    vi.mocked(authService.resetPassword).mockRejectedValue(
      new ApiError('Mật khẩu phải tối thiểu 6 ký tự...', { status: 400, code: 'WEAK_PASSWORD' })
    );
    renderWithProviders(<ResetPasswordPage />, { route: '/reset-password?email=moi%40gmail.com' });

    await typeOtp('123456');
    await userEvent.type(await screen.findByLabelText('Mật khẩu mới'), 'MatKhau1');
    await userEvent.type(screen.getByLabelText('Nhập lại mật khẩu'), 'MatKhau1');
    await userEvent.click(screen.getByRole('button', { name: 'Đặt lại mật khẩu' }));

    expect(await screen.findByText('Mật khẩu phải tối thiểu 6 ký tự...')).toBeInTheDocument();
    expect(screen.getByLabelText('Mật khẩu mới')).toBeInTheDocument();
    expect(screen.queryByLabelText('Mã OTP 6 số')).not.toBeInTheDocument();
  });

  it('lỗi: quên mật khẩu với email chưa đăng ký (USER_NOT_FOUND) → báo lỗi, ở lại trang', async () => {
    vi.mocked(authService.forgotPassword).mockRejectedValue(
      new ApiError('Không tìm thấy tài khoản với email này!', { status: 404, code: 'USER_NOT_FOUND' })
    );
    renderWithProviders(<ForgotPasswordPage />, { route: '/forgot-password' });

    await userEvent.type(screen.getByLabelText('Địa chỉ email'), 'chua.co@gmail.com');
    await userEvent.click(screen.getByRole('button', { name: /Gửi mã/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Không tìm thấy tài khoản với email này!');
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/forgot-password$/);
  });

  it('lỗi: mật khẩu nhập lại không khớp → chặn ở form, không gọi API', async () => {
    renderWithProviders(<ResetPasswordPage />, { route: '/reset-password?email=moi%40gmail.com' });

    await typeOtp('123456');
    await userEvent.type(await screen.findByLabelText('Mật khẩu mới'), 'MatKhau1');
    await userEvent.type(screen.getByLabelText('Nhập lại mật khẩu'), 'MatKhau2');
    await userEvent.click(screen.getByRole('button', { name: 'Đặt lại mật khẩu' }));

    expect(await screen.findByText('Mật khẩu nhập lại không khớp')).toBeInTheDocument();
    expect(authService.resetPassword).not.toHaveBeenCalled();
  });
});

describe('Đổi mật khẩu', () => {
  it('CURRENT_PASSWORD_INCORRECT → báo ở ô mật khẩu hiện tại, không ở khung lỗi chung', async () => {
    vi.mocked(authService.changePassword).mockRejectedValue(
      new ApiError('Mật khẩu hiện tại không chính xác!', { status: 400, code: 'CURRENT_PASSWORD_INCORRECT' })
    );
    renderWithProviders(
      <ChangePasswordCard user={{ _id: 'u', name: 'A', email: 'a@gmail.com', hasPassword: true }} />
    );

    await userEvent.type(screen.getByLabelText('Mật khẩu hiện tại'), 'SaiCu123');
    await userEvent.type(screen.getByLabelText('Mật khẩu mới'), 'MatKhau2');
    await userEvent.type(screen.getByLabelText('Nhập lại mật khẩu mới'), 'MatKhau2');
    await userEvent.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));

    expect(await screen.findByText('Mật khẩu hiện tại không chính xác!')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
