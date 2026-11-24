import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { authService } from '@/features/auth/services/authService';
import { ApiError } from '@/services/apiError';
import { renderWithProviders } from '../../helpers/renderWithProviders';

vi.mock('@/features/auth/services/authService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/auth/services/authService')>();
  return { ...actual, authService: { register: vi.fn(), getProfile: vi.fn().mockResolvedValue({}) } };
});
// Nút Google cần Google SDK + Client ID thật — không thuộc phạm vi test này
vi.mock('@/features/auth/components/GoogleAuthButton', () => ({ GoogleAuthButton: () => null }));
vi.mock('sonner', () => ({
  Toaster: () => null,
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn(), promise: vi.fn(), dismiss: vi.fn() },
}));

const fillForm = async ({ name = 'Nguyễn Văn A', email = 'moi@gmail.com', password = 'MatKhau1', agree = true } = {}) => {
  if (name) await userEvent.type(screen.getByLabelText('Họ và tên'), name);
  if (email) await userEvent.type(screen.getByLabelText('Địa chỉ email'), email);
  if (password) await userEvent.type(screen.getByLabelText('Mật khẩu'), password);
  if (agree) await userEvent.click(screen.getByRole('checkbox'));
  await userEvent.click(screen.getByRole('button', { name: 'Đăng ký' }));
};

describe('Màn Đăng ký', () => {
  afterEach(() => vi.clearAllMocks());

  it('đăng ký thành công → chuyển sang màn nhập OTP với email vừa đăng ký', async () => {
    vi.mocked(authService.register).mockResolvedValue({ message: 'Đã gửi mã OTP', email: 'moi@gmail.com' });
    renderWithProviders(<RegisterPage />, { route: '/register' });
    await fillForm();

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/verify-otp?email=moi%40gmail.com'));
    expect(vi.mocked(authService.register).mock.calls[0][0]).toEqual({
      name: 'Nguyễn Văn A',
      email: 'moi@gmail.com',
      password: 'MatKhau1',
    });
  });

  it('lỗi: email không phải @gmail.com → chặn ngay ở form, không gọi API', async () => {
    renderWithProviders(<RegisterPage />, { route: '/register' });
    await fillForm({ email: 'abc@yahoo.com' });

    expect(await screen.findByText('Chỉ chấp nhận địa chỉ @gmail.com')).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('lỗi: mật khẩu yếu (thiếu chữ hoa) → báo dưới ô mật khẩu, không gọi API', async () => {
    renderWithProviders(<RegisterPage />, { route: '/register' });
    await fillForm({ password: 'matkhau1' });

    expect(await screen.findByText('Mật khẩu phải chứa ít nhất 1 chữ in hoa (A-Z)')).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('lỗi: bỏ trống họ tên và chưa đồng ý điều khoản → báo đủ 2 lỗi, không gọi API', async () => {
    renderWithProviders(<RegisterPage />, { route: '/register' });
    await fillForm({ name: '', agree: false });

    expect(await screen.findByText('Họ tên phải có ít nhất 2 ký tự')).toBeInTheDocument();
    expect(screen.getByText('Bạn cần đồng ý với Điều khoản và Chính sách')).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('lỗi: email đã được sử dụng (EMAIL_EXISTS) → báo ngay dưới ô email, không hiện khung lỗi chung', async () => {
    vi.mocked(authService.register).mockRejectedValue(
      new ApiError('Email này đã được sử dụng!', { status: 400, code: 'EMAIL_EXISTS' })
    );
    renderWithProviders(<RegisterPage />, { route: '/register' });
    await fillForm({ email: 'da.co@gmail.com' });

    expect(await screen.findByText('Email này đã được sử dụng!')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/register$/);
  });

  it('lỗi: mất kết nối tới máy chủ → hiện thông báo trong khung lỗi, ở lại màn đăng ký', async () => {
    vi.mocked(authService.register).mockRejectedValue(
      new ApiError('Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.', { status: null })
    );
    renderWithProviders(<RegisterPage />, { route: '/register' });
    await fillForm();

    expect(await screen.findByRole('alert')).toHaveTextContent('Không thể kết nối tới máy chủ');
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/register$/);
  });
});
