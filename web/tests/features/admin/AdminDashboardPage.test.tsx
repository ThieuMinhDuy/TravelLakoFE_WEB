import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage';
import { adminService } from '@/features/admin/services/adminService';
import { countByMonth, ratingDistribution, topCitiesByReviews } from '@/features/admin/utils/dashboardStats';
import type { AdminReview, AdminUser } from '@/types/admin';
import { renderWithProviders } from '../../helpers/renderWithProviders';

vi.mock('@/features/admin/services/adminService', () => ({
  adminService: { getStats: vi.fn(), getUsers: vi.fn(), getReviews: vi.fn(), getCities: vi.fn() },
}));

const NOW = new Date(2026, 10, 23); // 23/11/2026
const iso = (y: number, m: number, d = 10) => new Date(y, m - 1, d).toISOString();

const review = (id: string, rating: number, createdAt: string, city = 'c1'): AdminReview => ({
  _id: id,
  user: { _id: 'u', name: 'Khách ' + id, email: 'k@gmail.com', avatar: '' },
  itemType: 'Hotel',
  itemId: { _id: 'p', name: 'Colline', address: '', images: [], city },
  rating,
  comment: 'Bình luận ' + id,
  createdAt,
  updatedAt: createdAt,
});

describe('dashboardStats', () => {
  it('đếm theo tháng, qua cả mốc năm, bỏ qua bản ghi ngoài khoảng', () => {
    const series = countByMonth([iso(2026, 11), iso(2026, 11), iso(2026, 9), iso(2026, 1), iso(2025, 6)], 12, NOW);
    expect(series).toHaveLength(12);
    expect(series[0]).toMatchObject({ key: '2025-12', label: 'T12', value: 0 });
    expect(series.at(-1)).toMatchObject({ key: '2026-11', fullLabel: 'Tháng 11/2026', value: 2 });
    expect(series.find((b) => b.key === '2026-01')?.value).toBe(1);
    expect(series.reduce((s, b) => s + b.value, 0)).toBe(4); // 2025-06 nằm ngoài 12 tháng
  });

  it('top thành phố theo số đánh giá, phân bố sao theo thứ tự 5 → 1', () => {
    const reviews = [review('1', 5, iso(2026, 11), 'c1'), review('2', 1, iso(2026, 11), 'c2'), review('3', 4, iso(2026, 11), 'c2')];
    const cities = [
      { _id: 'c1', name: 'Đà Lạt', coordinates: { lat: 0, lng: 0 } },
      { _id: 'c2', name: 'Hội An', coordinates: { lat: 0, lng: 0 } },
    ];
    expect(topCitiesByReviews(reviews, cities).map((c) => [c.label, c.value])).toEqual([
      ['Hội An', 2],
      ['Đà Lạt', 1],
    ]);
    expect(ratingDistribution(reviews).map((r) => r.value)).toEqual([1, 1, 0, 0, 1]);
  });
});

describe('Trang bảng điều khiển', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    vi.mocked(adminService.getStats).mockResolvedValue({
      users: 1284,
      trips: 37,
      reviews: 3,
      places: { total: 9, attractions: 3, hotels: 1, restaurants: 3, cafes: 2 },
    });
    vi.mocked(adminService.getUsers).mockResolvedValue({
      total: 2,
      users: [{ createdAt: iso(2026, 11, 2) }, { createdAt: iso(2026, 8) }] as AdminUser[],
    });
    vi.mocked(adminService.getReviews).mockResolvedValue({
      total: 3,
      reviews: [review('a', 5, iso(2026, 11, 20)), review('b', 1, iso(2026, 11, 21)), review('c', 4, iso(2026, 7))],
    });
    vi.mocked(adminService.getCities).mockResolvedValue({
      total: 1,
      cities: [{ _id: 'c1', name: 'Đà Lạt', coordinates: { lat: 0, lng: 0 } }],
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('thẻ số liệu, số mới trong tháng, biểu đồ có nhãn đọc được, đánh giá mới nhất', async () => {
    renderWithProviders(<AdminDashboardPage />, { route: '/admin' });

    const usersTile = (await screen.findByText('Người dùng')).closest('a') as HTMLElement;
    expect(await within(usersTile).findByText('1.284')).toBeInTheDocument();
    expect(await within(usersTile).findByText('+1 trong tháng này')).toBeInTheDocument();

    expect(await screen.findByRole('img', { name: 'Tháng 11/2026: 2 đánh giá mới' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Tháng 8/2026: 1 người dùng mới' })).toBeInTheDocument();
    expect(screen.getByText('1 đánh giá ≤ 2 sao cần xem')).toBeInTheDocument();

    // Đánh giá mới nhất xếp trước
    const latest = screen.getByRole('heading', { name: 'Đánh giá mới nhất' }).closest('article') as HTMLElement;
    expect(within(latest).getAllByText(/Bình luận/)[0]).toHaveTextContent('Bình luận b');
  });

  it('đổi khoảng 12 tháng → biểu đồ có 12 cột', async () => {
    renderWithProviders(<AdminDashboardPage />, { route: '/admin' });
    const chart = await screen.findByRole('group', { name: 'Người dùng mới, 6 tháng gần nhất' });
    expect(within(chart).getAllByRole('img')).toHaveLength(6);

    await userEvent.click(screen.getByRole('radio', { name: '12 tháng' }));
    const wide = screen.getByRole('group', { name: 'Người dùng mới, 12 tháng gần nhất' });
    expect(within(wide).getAllByRole('img')).toHaveLength(12);
  });
});

describe('niceMax', () => {
  it('đỉnh trục luôn là 4 bước nguyên tròn', async () => {
    const { niceMax } = await import('@/features/admin/utils/dashboardStats');
    expect([0, 3, 7, 18, 30, 130].map(niceMax)).toEqual([4, 4, 8, 20, 40, 200]);
  });
});
