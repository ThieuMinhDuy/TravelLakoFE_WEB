import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { AppRoutes } from '../../../routes/AppRoutes';
import { apiClient } from '../../../services/apiClient';
import { useAuthStore } from '../../../store/useAuthStore';
import { queryKeys } from '../../../lib/queryKeys';
import { invalidateAdmin } from '../../admin/utils/invalidateAdmin';
import { useDeleteReview, useMyFavorites } from '../../profile/hooks/useProfileData';
import { useFavorites } from '../hooks/useExploreQueries';
import { FavoriteButton } from '../components/FavoriteButton';
import { ReviewSection } from '../components/ReviewSection';

vi.mock('../../../services/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));
vi.mock('../../../contexts/toast/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
// Chỉ thay giao diện nặng; vẫn dùng route, nút tim và điều hướng thật.
vi.mock('../ExplorePage', () => ({
  ExplorePage: ({ page }: { page: string }) => (
    <section aria-label={`Explore ${page}`}>
      {page === 'place' && <FavoriteButton kind="hotel" itemId="place-1" />}
    </section>
  ),
}));
vi.mock('../../../layouts/MainLayout', async () => {
  const { Outlet } = await import('react-router-dom');
  return { MainLayout: () => <Outlet /> };
});
vi.mock('../../auth/AuthModalHost', () => ({
  AuthModalHost: ({ open }: { open: boolean }) => open ? <div role="dialog">Đăng nhập</div> : null,
}));

const user = { _id: 'user-1', name: 'Kiểm thử', email: 'test@example.com' };
function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 300_000 }, mutations: { retry: false } } });
}
function BackButton() {
  const navigate = useNavigate();
  return <button onClick={() => navigate(-1)}>Quay lại trang trước</button>;
}
function wrapper(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/places/hotel/place-1']}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  useAuthStore.setState({ user: null, isAuthenticated: false });
  vi.mocked(apiClient.get).mockResolvedValue({ data: { total: 0, favorites: [], reviews: [] } });
  vi.mocked(apiClient.post).mockResolvedValue({ data: {} });
  vi.mocked(apiClient.delete).mockResolvedValue({ data: {} });
});

describe('Explore integration with main', () => {
  it('opens the real detail route and preserves it behind the login popup', async () => {
    render(<><AppRoutes /><BackButton /></>, { wrapper: wrapper(makeClient()) });
    expect(screen.getByRole('region', { name: 'Explore place' })).toBeInTheDocument();
    expect(screen.queryByText('Màn 3:', { exact: false })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lưu địa điểm' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Explore place' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Explore home' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại trang trước' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('region', { name: 'Explore place' })).toBeInTheDocument();
  });

  it('keeps the current detail page behind login opened from reviews', async () => {
    render(<><AppRoutes /><ReviewSection kind="hotel" itemId="place-1" /></>, { wrapper: wrapper(makeClient()) });
    fireEvent.click(screen.getByRole('link', { name: 'Đăng nhập' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Explore place' })).toBeInTheDocument();
  });

  it('shares one favorites response between Profile and Explore and refreshes both after saving', async () => {
    useAuthStore.setState({ user, isAuthenticated: true });
    let saved = false;
    vi.mocked(apiClient.get).mockImplementation(async () => ({ data: {
      total: saved ? 1 : 0,
      favorites: saved ? [{ _id: 'favorite-1', itemType: 'Hotel', itemId: { _id: 'place-1' } }] : [],
    } }));
    vi.mocked(apiClient.post).mockImplementation(async () => { saved = true; return { data: {} }; });
    function ProfileCount() {
      const query = useMyFavorites();
      return <output aria-label="Profile favorites">{query.data?.total ?? 'loading'}</output>;
    }
    render(<><ProfileCount /><FavoriteButton kind="hotel" itemId="place-1" /></>, { wrapper: wrapper(makeClient()) });
    const button = screen.getByRole('button', { name: 'Lưu địa điểm' });
    await waitFor(() => expect(button).toBeEnabled());
    expect(screen.getByLabelText('Profile favorites')).toHaveTextContent('0');
    expect(apiClient.get).toHaveBeenCalledTimes(1);
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByLabelText('Profile favorites')).toHaveTextContent('1'));
    expect(screen.getByRole('button', { name: 'Bỏ lưu địa điểm' })).toHaveAttribute('aria-pressed', 'true');
    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });

  it('reads an existing Profile favorites cache without another request or changing its envelope', () => {
    useAuthStore.setState({ user, isAuthenticated: true });
    const client = makeClient();
    const response = { total: 1, favorites: [{ _id: 'favorite-1', itemType: 'Hotel', itemId: { _id: 'place-1' } }] };
    client.setQueryData(queryKeys.favorites.mine(), response);
    const { result } = renderHook(() => useFavorites(), { wrapper: wrapper(client) });
    expect(result.current.data).toEqual(response.favorites);
    expect(client.getQueryData(queryKeys.favorites.mine())).toEqual(response);
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('refreshes public detail, ratings and profile counts after a review is deleted in Profile', async () => {
    const client = makeClient();
    const affected = [queryKeys.reviews.forPlace('hotel', 'place-1'), queryKeys.places.detail('hotel', 'place-1'),
      queryKeys.places.filtered({ type: 'hotel' }), queryKeys.favorites.mine(), queryKeys.profile,
      queryKeys.admin.reviewsAll(), queryKeys.admin.placesAll()];
    affected.forEach((key) => client.setQueryData(key, {}));
    const { result } = renderHook(() => useDeleteReview(), { wrapper: wrapper(client) });
    await act(async () => { await result.current.mutateAsync('review-1'); });
    expect(apiClient.delete).toHaveBeenCalledWith('/reviews/review-1');
    affected.forEach((key) => expect(client.getQueryState(key)?.isInvalidated).toBe(true));
  });

  it('invalidates public city and place data after Admin changes a city', async () => {
    const client = makeClient();
    const affected = [queryKeys.cities.list(), queryKeys.cities.detail('city-1'),
      queryKeys.places.filtered({ city: 'city-1' }), queryKeys.places.detail('hotel', 'place-1'),
      queryKeys.reviews.forPlace('hotel', 'place-1'), queryKeys.favorites.mine(), queryKeys.trips.mine()];
    affected.forEach((key) => client.setQueryData(key, {}));
    await invalidateAdmin.afterCity(client);
    affected.forEach((key) => expect(client.getQueryState(key)?.isInvalidated).toBe(true));
  });
});
