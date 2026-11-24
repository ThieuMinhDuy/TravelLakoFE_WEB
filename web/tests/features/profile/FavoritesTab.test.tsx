import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FavoritesTab } from '@/features/profile/components/tabs/FavoritesTab';
import { favoriteService } from '@/services/favoriteService';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { makeAttraction, makeFavorite, makeHotel } from '../../helpers/fixtures';

vi.mock('@/services/favoriteService', () => ({
  favoriteService: { getMyFavorites: vi.fn(), removeFavorite: vi.fn(), addFavorite: vi.fn() },
}));

const favorites = [
  makeFavorite({ _id: 'fav-hotel', itemType: 'Hotel', itemId: makeHotel({ name: 'Khách sạn Biển Xanh' }) }),
  makeFavorite({ _id: 'fav-attr', itemType: 'Attraction', itemId: makeAttraction({ name: 'Bà Nà Hills' }) }),
];

describe('Tab Yêu thích', () => {
  beforeEach(() => {
    vi.mocked(favoriteService.getMyFavorites).mockResolvedValue({ total: favorites.length, favorites });
  });

  it('hiển thị danh sách và lọc theo loại địa điểm', async () => {
    renderWithProviders(<FavoritesTab />);

    expect(await screen.findByText('Khách sạn Biển Xanh')).toBeInTheDocument();
    expect(screen.getByText('Bà Nà Hills')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: /Điểm tham quan/ }));
    expect(screen.queryByText('Khách sạn Biển Xanh')).not.toBeInTheDocument();
    expect(screen.getByText('Bà Nà Hills')).toBeInTheDocument();
  });

  it('bỏ yêu thích: thẻ biến mất ngay (optimistic) và gọi API với id bản ghi yêu thích', async () => {
    let resolveRemove!: () => void;
    vi.mocked(favoriteService.removeFavorite).mockReturnValue(
      new Promise((resolve) => (resolveRemove = () => resolve({ message: 'ok' })))
    );
    renderWithProviders(<FavoritesTab />);

    await userEvent.click(await screen.findByRole('button', { name: 'Bỏ Khách sạn Biển Xanh khỏi yêu thích' }));

    // API chưa trả về nhưng thẻ đã biến mất
    expect(screen.queryByText('Khách sạn Biển Xanh')).not.toBeInTheDocument();
    expect(favoriteService.removeFavorite).toHaveBeenCalledWith('fav-hotel', expect.anything());
    resolveRemove();
  });

  it('API lỗi → thẻ được khôi phục', async () => {
    vi.mocked(favoriteService.removeFavorite).mockRejectedValue(new Error('Mất kết nối'));
    // Sau khi lỗi, danh sách được tải lại từ server (vẫn còn đủ 2 địa điểm)
    renderWithProviders(<FavoritesTab />);

    await userEvent.click(await screen.findByRole('button', { name: 'Bỏ Khách sạn Biển Xanh khỏi yêu thích' }));

    await waitFor(() => expect(screen.getByText('Khách sạn Biển Xanh')).toBeInTheDocument());
  });

  it('chưa có yêu thích → hiện lời mời khám phá', async () => {
    vi.mocked(favoriteService.getMyFavorites).mockResolvedValue({ total: 0, favorites: [] });
    renderWithProviders(<FavoritesTab />);

    expect(await screen.findByText('Bạn chưa lưu địa điểm nào')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Khám phá địa điểm/ })).toHaveAttribute('href', '/places');
  });

  it('thẻ dẫn tới trang chi tiết đúng loại địa điểm', async () => {
    renderWithProviders(<FavoritesTab />);
    const card = (await screen.findByText('Bà Nà Hills')).closest('article')!;
    expect(within(card).getByRole('link', { name: 'Bà Nà Hills' })).toHaveAttribute(
      'href',
      '/places/attraction/attr-1'
    );
  });
});
