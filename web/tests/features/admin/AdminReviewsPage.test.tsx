import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminReviewsPage } from '@/features/admin/pages/AdminReviewsPage';
import { adminService } from '@/features/admin/services/adminService';
import { filterReviews } from '@/features/admin/utils/reviewFilters';
import type { AdminReview } from '@/types/admin';
import { renderWithProviders } from '../../helpers/renderWithProviders';

vi.mock('@/features/admin/services/adminService', () => ({
  adminService: { getReviews: vi.fn(), getCities: vi.fn(), deleteReview: vi.fn() },
}));

const place = { _id: 'p1', name: 'Colline Hotel', address: '', images: [], city: 'c1' };
const makeReview = (patch: Partial<AdminReview>): AdminReview => ({
  _id: 'r',
  user: { _id: 'u1', name: 'Trần Khách', email: 'khach@gmail.com', avatar: '' },
  itemType: 'Hotel',
  itemId: place,
  rating: 5,
  comment: 'Phòng sạch sẽ',
  createdAt: '2026-11-10T00:00:00.000Z',
  updatedAt: '2026-11-10T00:00:00.000Z',
  ...patch,
});

const reviews = [
  makeReview({ _id: 'r1', comment: 'Đánh giá cũ', createdAt: '2026-10-01T00:00:00.000Z' }),
  makeReview({ _id: 'r2', comment: 'Spam spam spam', rating: 1, createdAt: '2026-11-20T00:00:00.000Z' }),
  makeReview({
    _id: 'r3',
    itemType: 'Cafe',
    itemId: null,
    user: null,
    comment: 'Cà phê ngon',
    createdAt: '2026-11-15T00:00:00.000Z',
  }),
];

const cards = () => screen.getAllByRole('article');

describe('Trang kiểm duyệt đánh giá', () => {
  beforeEach(() => {
    vi.mocked(adminService.getReviews).mockResolvedValue({ total: reviews.length, reviews });
    vi.mocked(adminService.getCities).mockResolvedValue({
      total: 1,
      cities: [{ _id: 'c1', name: 'Đà Lạt', coordinates: { lat: 11.9, lng: 108.4 } }],
    });
  });
  afterEach(() => vi.clearAllMocks());

  it('sắp xếp mới nhất trước, hiển thị đúng khi user / địa điểm đã bị xóa, tra tên thành phố', async () => {
    renderWithProviders(<AdminReviewsPage />, { route: '/admin/reviews' });
    await screen.findByText('Spam spam spam');

    expect(within(cards()[0]).getByText('Spam spam spam')).toBeInTheDocument();
    expect(within(cards()[2]).getByText('Đánh giá cũ')).toBeInTheDocument();
    expect(screen.getByText('Người dùng đã xóa')).toBeInTheDocument();
    expect(screen.getByText('Địa điểm đã xóa')).toBeInTheDocument();
    expect(await screen.findAllByText(/Khách sạn · Đà Lạt/)).toHaveLength(2);
  });

  it('lọc theo loại địa điểm phía client và đếm theo loại', async () => {
    renderWithProviders(<AdminReviewsPage />, { route: '/admin/reviews' });
    await screen.findByText('Spam spam spam');

    await userEvent.click(screen.getByRole('radio', { name: /Quán cafe/ }));
    expect(cards()).toHaveLength(1);
    expect(screen.getByText('Cà phê ngon')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Khách sạn/ })).toHaveTextContent('2');
    expect(adminService.getReviews).toHaveBeenCalledTimes(1);
  });

  it('lọc theo thành phố gửi tham số city lên server', async () => {
    renderWithProviders(<AdminReviewsPage />, { route: '/admin/reviews' });
    await screen.findByText('Spam spam spam');
    await screen.findByRole('option', { name: 'Đà Lạt' });

    await userEvent.selectOptions(screen.getByLabelText('Lọc theo thành phố'), 'c1');
    await waitFor(() => expect(adminService.getReviews).toHaveBeenLastCalledWith({ city: 'c1' }));
  });

  it('mở bằng ?itemId= → chỉ gửi itemId, khóa bộ lọc thành phố, hiện tên địa điểm', async () => {
    renderWithProviders(<AdminReviewsPage />, { route: '/admin/reviews?itemId=p1&city=c1' });

    expect(await screen.findByText('Colline Hotel', { selector: 'strong' })).toBeInTheDocument();
    expect(adminService.getReviews).toHaveBeenCalledWith({ itemId: 'p1' });
    expect(screen.getByLabelText('Lọc theo thành phố')).toBeDisabled();
  });

  it('chọn nhiều rồi xóa: hỏi xác nhận, gọi xóa từng đánh giá', async () => {
    vi.mocked(adminService.deleteReview).mockResolvedValue({ message: 'ok' });
    renderWithProviders(<AdminReviewsPage />, { route: '/admin/reviews' });
    await screen.findByText('Spam spam spam');

    await userEvent.click(within(cards()[0]).getByRole('checkbox'));
    await userEvent.click(within(cards()[1]).getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'Xóa 2 đánh giá' }));

    const dialog = screen.getByRole('dialog', { name: 'Xóa 2 đánh giá?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Xóa' }));

    await waitFor(() => expect(adminService.deleteReview).toHaveBeenCalledTimes(2));
    expect(adminService.deleteReview).toHaveBeenCalledWith('r2');
    expect(adminService.deleteReview).toHaveBeenCalledWith('r3');
  });
});

describe('filterReviews', () => {
  it('tìm không phân biệt dấu trong bình luận, người viết, địa điểm; lọc đánh giá thấp', () => {
    const base = { q: '', type: 'all', rating: 'all', sort: 'newest' } as const;
    expect(filterReviews(reviews, { ...base, q: 'ca phe' }).map((r) => r._id)).toEqual(['r3']);
    expect(filterReviews(reviews, { ...base, q: 'colline' })).toHaveLength(2);
    expect(filterReviews(reviews, { ...base, rating: 'low' }).map((r) => r._id)).toEqual(['r2']);
    expect(filterReviews(reviews, { ...base, sort: 'lowest' })[0]._id).toBe('r2');
  });
});
