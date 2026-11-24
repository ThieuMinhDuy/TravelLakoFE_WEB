import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewsTab } from '@/features/profile/components/tabs/ReviewsTab';
import { ChangePasswordCard } from '@/features/profile/components/ChangePasswordCard';
import { authService } from '@/features/auth/services/authService';
import { reviewService } from '@/services/reviewService';
import { ApiError } from '@/services/apiError';
import { useAuthStore } from '@/store/useAuthStore';
import type { MyReview } from '@/types/review';
import type { User } from '@/types/user';
import { renderWithProviders } from '../../helpers/renderWithProviders';

vi.mock('@/services/reviewService', () => ({
  reviewService: { getMyReviews: vi.fn(), deleteMyReview: vi.fn() },
}));
vi.mock('@/features/auth/services/authService', () => ({
  authService: { changePassword: vi.fn() },
}));

const review = (id: string, name: string, overrides: Partial<MyReview> = {}): MyReview => ({
  _id: id,
  rating: 4,
  comment: `Trải nghiệm ở ${name} rất tuyệt`,
  itemType: 'Restaurant',
  itemId: { _id: `place-${id}`, name, images: [], address: '', rating: 4.5, city: { _id: 'dn', name: 'Đà Nẵng', coordinates: { lat: 0, lng: 0 } } },
  createdAt: '2026-10-05T08:00:00.000Z',
  ...overrides,
});

describe('Tab Đánh giá', () => {
  beforeEach(() => {
    const reviews = [review('r1', 'Mì Quảng Bà Mua'), review('r2', 'Bún chả cá Bà Lữ')];
    vi.mocked(reviewService.getMyReviews).mockResolvedValue({ total: reviews.length, reviews });
  });

  it('hiển thị địa điểm, loại, thành phố, nội dung và ngày viết', async () => {
    renderWithProviders(<ReviewsTab />);

    expect(await screen.findByRole('link', { name: 'Mì Quảng Bà Mua' })).toHaveAttribute(
      'href',
      '/places/restaurant/place-r1'
    );
    expect(screen.getAllByText('Nhà hàng · Đà Nẵng')).toHaveLength(2);
    expect(screen.getByText('Trải nghiệm ở Mì Quảng Bà Mua rất tuyệt')).toBeInTheDocument();
    expect(screen.getAllByText('05/10/2026')).toHaveLength(2);
  });

  it('xóa phải qua hộp xác nhận; hủy thì không gọi API', async () => {
    renderWithProviders(<ReviewsTab />);

    await userEvent.click(await screen.findByRole('button', { name: 'Xóa đánh giá về Mì Quảng Bà Mua' }));
    expect(screen.getByRole('dialog', { name: 'Xóa đánh giá?' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Hủy bỏ' }));
    expect(reviewService.deleteMyReview).not.toHaveBeenCalled();
    expect(screen.getByText('Mì Quảng Bà Mua')).toBeInTheDocument();
  });

  it('xác nhận xóa → đánh giá biến mất ngay và gọi API đúng id', async () => {
    vi.mocked(reviewService.deleteMyReview).mockReturnValue(new Promise(() => undefined)); // API treo
    renderWithProviders(<ReviewsTab />);

    await userEvent.click(await screen.findByRole('button', { name: 'Xóa đánh giá về Mì Quảng Bà Mua' }));
    await userEvent.click(screen.getByRole('button', { name: 'Xóa đánh giá' }));

    expect(reviewService.deleteMyReview).toHaveBeenCalledWith('r1', expect.anything());
    await waitFor(() => expect(screen.queryByText('Mì Quảng Bà Mua')).not.toBeInTheDocument());
    expect(screen.getByText('Bún chả cá Bà Lữ')).toBeInTheDocument();
  });

  it('chưa có đánh giá → lời mời khám phá', async () => {
    vi.mocked(reviewService.getMyReviews).mockResolvedValue({ total: 0, reviews: [] });
    renderWithProviders(<ReviewsTab />);
    expect(await screen.findByText('Bạn chưa viết đánh giá nào')).toBeInTheDocument();
  });
});

describe('Đổi / tạo mật khẩu', () => {
  const base: User = { _id: 'u1', name: 'Hoàng', email: 'hoang@gmail.com' };

  beforeEach(() => {
    vi.mocked(authService.changePassword).mockResolvedValue({ message: 'Đổi mật khẩu thành công!' });
  });
  afterEach(() => useAuthStore.getState().logout());

  it('tài khoản có mật khẩu: bắt buộc mật khẩu hiện tại và gửi đủ 2 trường', async () => {
    renderWithProviders(<ChangePasswordCard user={{ ...base, hasPassword: true }} />);

    await userEvent.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));
    expect(await screen.findByText('Vui lòng nhập mật khẩu hiện tại')).toBeInTheDocument();
    expect(authService.changePassword).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText('Mật khẩu hiện tại'), 'OldPass1');
    await userEvent.type(screen.getByLabelText('Mật khẩu mới'), 'NewPass2');
    await userEvent.type(screen.getByLabelText('Nhập lại mật khẩu mới'), 'NewPass2');
    await userEvent.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));

    await waitFor(() =>
      expect(authService.changePassword).toHaveBeenCalledWith(
        { currentPassword: 'OldPass1', newPassword: 'NewPass2' },
        expect.anything()
      )
    );
    // Thành công → xóa trắng form
    await waitFor(() => expect(screen.getByLabelText('Mật khẩu hiện tại')).toHaveValue(''));
  });

  it('báo lỗi khi nhập lại không khớp hoặc mật khẩu yếu', async () => {
    renderWithProviders(<ChangePasswordCard user={{ ...base, hasPassword: true }} />);

    await userEvent.type(screen.getByLabelText('Mật khẩu hiện tại'), 'OldPass1');
    await userEvent.type(screen.getByLabelText('Mật khẩu mới'), 'abc');
    await userEvent.type(screen.getByLabelText('Nhập lại mật khẩu mới'), 'abcd');
    await userEvent.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));

    expect(await screen.findByText('Mật khẩu phải có tối thiểu 6 ký tự')).toBeInTheDocument();
    expect(screen.getByText('Mật khẩu nhập lại không khớp')).toBeInTheDocument();
    expect(authService.changePassword).not.toHaveBeenCalled();
  });

  it('tài khoản Google chưa có mật khẩu: "Tạo mật khẩu", không hỏi mật khẩu cũ', async () => {
    useAuthStore.getState().setAuth({ ...base, authType: 'google', hasPassword: false }, 't', true);
    renderWithProviders(<ChangePasswordCard user={{ ...base, authType: 'google', hasPassword: false }} />);

    expect(screen.getByRole('heading', { name: 'Tạo mật khẩu' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Mật khẩu hiện tại')).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Mật khẩu mới'), 'NewPass2');
    await userEvent.type(screen.getByLabelText('Nhập lại mật khẩu mới'), 'NewPass2');
    await userEvent.click(screen.getByRole('button', { name: 'Tạo mật khẩu' }));

    await waitFor(() =>
      expect(authService.changePassword).toHaveBeenCalledWith({ newPassword: 'NewPass2' }, expect.anything())
    );
    // Store biết tài khoản giờ đã có mật khẩu
    await waitFor(() => expect(useAuthStore.getState().user?.hasPassword).toBe(true));
  });

  it('sai mật khẩu hiện tại (400 từ backend) → hiện thông báo trong form', async () => {
    vi.mocked(authService.changePassword).mockRejectedValue(
      new ApiError('Mật khẩu hiện tại không chính xác!', { status: 400 })
    );
    renderWithProviders(<ChangePasswordCard user={{ ...base, hasPassword: true }} />);

    await userEvent.type(screen.getByLabelText('Mật khẩu hiện tại'), 'WrongPass1');
    await userEvent.type(screen.getByLabelText('Mật khẩu mới'), 'NewPass2');
    await userEvent.type(screen.getByLabelText('Nhập lại mật khẩu mới'), 'NewPass2');
    await userEvent.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Mật khẩu hiện tại không chính xác!');
  });
});
