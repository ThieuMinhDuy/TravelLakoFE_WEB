import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { apiClient } from '../../../services/apiClient';
import { useAuthStore } from '../../../store/useAuthStore';
import { useDebounce } from '../hooks/useDebounce';
import { paginate } from '../hooks/usePagination';
import { exploreApi, placeQuery, readList } from '../services/exploreApi';
import {
  parseFilters,
  priceLabel,
  updateFilters,
  validCoordinates,
} from '../utils';
import { PlacesPage } from '../pages/PlacesPage';
import { CitiesPage } from '../pages/CitiesPage';
import { FavoriteButton } from '../components/FavoriteButton';
import { ReviewSection } from '../components/ReviewSection';

vi.mock('../../../services/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn(), put: vi.fn() },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const user = {
  _id: 'user-1',
  name: 'Người kiểm thử',
  email: 'test@example.com',
};
const city = {
  _id: 'city-1',
  name: 'Hà Nội',
  coordinates: { lat: 21, lng: 105 },
};
function LocationInfo() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname}
      {location.search}
    </output>
  );
}
function Back() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(-1)}>
      Quay lại
    </button>
  );
}
function mount(children: ReactNode, entries = ['/places']) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={entries}>
        {children}
        <LocationInfo />
        <Back />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
  vi.mocked(apiClient.get).mockImplementation(async (url) => {
    if (url === '/cities') return { data: { total: 1, cities: [city] } };
    if (String(url).startsWith('/reviews/'))
      return { data: { total: 0, reviews: [] } };
    if (url === '/favorites') return { data: { total: 0, favorites: [] } };
    return { data: { total: 0, places: [] } };
  });
  vi.mocked(apiClient.post).mockResolvedValue({ data: {} });
  vi.mocked(apiClient.delete).mockResolvedValue({ data: {} });
});

describe('Explore contract and state', () => {
  it('debounces typing and cancels stale timers', () => {
    vi.useFakeTimers();
    const { result, rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, 350),
      { initialProps: { value: '' } },
    );
    rerender({ value: 'Hà' });
    act(() => vi.advanceTimersByTime(250));
    rerender({ value: 'Hà Nội' });
    act(() => vi.advanceTimersByTime(349));
    expect(result.current).toBe('');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('Hà Nội');
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('restores valid URL filters and rejects malformed numbers', () => {
    expect(
      parseFilters(
        new URLSearchParams(
          'type=hotel&city=city-1&search=Hanoi&stars=5&minPrice=0&page=3',
        ),
      ),
    ).toMatchObject({
      type: 'hotel',
      city: 'city-1',
      search: 'Hanoi',
      stars: '5',
      minPrice: '0',
      page: 3,
    });
    expect(
      parseFilters(
        new URLSearchParams(
          'type=bad&stars=5&minPrice=-2&maxPrice=NaN&page=-5',
        ),
      ),
    ).toMatchObject({
      type: 'all',
      stars: '',
      minPrice: '',
      maxPrice: '',
      page: 1,
    });
  });
  it('resets pagination and incompatible filters when the category changes', () => {
    const next = updateFilters(
      new URLSearchParams('type=hotel&stars=5&page=7&city=city-1'),
      { type: 'restaurant' },
    );
    expect(next.get('type')).toBe('restaurant');
    expect(next.has('stars')).toBe(false);
    expect(next.has('page')).toBe(false);
    expect(next.get('city')).toBe('city-1');
    expect(updateFilters(next, { search: 'all' }).get('search')).toBe('all');
  });
  it('sends admission fees separately from room prices and hotel stars', () => {
    const filters = parseFilters(
      new URLSearchParams('type=hotel&stars=4&minPrice=0&maxPrice=500000'),
    );
    expect(placeQuery('attraction', filters)).toMatchObject({
      minFee: '0',
      maxFee: '500000',
    });
    expect(placeQuery('attraction', filters)).not.toHaveProperty('stars');
    expect(placeQuery('hotel', filters)).toMatchObject({
      minPrice: '0',
      maxPrice: '500000',
      stars: '4',
    });
  });
  it('clamps pagination after results shrink and keeps price zero distinct from missing', () => {
    expect(paginate([1, 2, 3], 10, 2)).toMatchObject({
      page: 2,
      totalPages: 2,
      items: [3],
    });
    expect(
      priceLabel({
        _id: 'p',
        name: 'A',
        city,
        coordinates: city.coordinates,
        kind: 'attraction',
        admissionFee: 0,
      }),
    ).toBe('Miễn phí');
    expect(
      priceLabel({
        _id: 'p',
        name: 'A',
        city,
        coordinates: city.coordinates,
        kind: 'attraction',
      }),
    ).toBe('Chưa có giá tham khảo');
    expect(validCoordinates({ lat: 0, lng: 0 })).toBe(true);
    expect(validCoordinates({ lat: 181, lng: 0 })).toBe(false);
  });
  it('distinguishes empty responses from a broken API contract', () => {
    expect(readList({ total: 0, cities: [] }, 'cities')).toEqual([]);
    expect(() => readList({ message: 'broken' }, 'cities')).toThrow(
      'không đúng định dạng',
    );
  });
});

describe('Explore user interactions', () => {
  it('renders place names, prices and ratings from the API without inventing values', async () => {
    vi.mocked(apiClient.get).mockImplementation(async (url) => {
      if (url === '/cities') return { data: { cities: [city] } };
      return { data: { places: [
        { _id: 'hotel-1', name: 'Khách sạn kiểm thử', city, pricePerNight: 850000, stars: 4, rating: 4.6, numReviews: 12 },
        { _id: 'hotel-2', name: 'Nơi nghỉ chưa cập nhật giá', city },
      ] } };
    });
    mount(<PlacesPage />, ['/places?type=hotel']);
    expect(await screen.findByRole('heading', { name: 'Khách sạn kiểm thử' })).toBeInTheDocument();
    expect(screen.getByText('850.000 ₫')).toBeInTheDocument();
    expect(screen.getByText('4.6')).toBeInTheDocument();
    expect(screen.getByText('(12 đánh giá)')).toBeInTheDocument();
    expect(screen.getByText('Chưa có giá tham khảo')).toBeInTheDocument();
  });
  it('reads filters from URL and updates the URL while resetting page', async () => {
    mount(<PlacesPage />, ['/places?type=hotel&stars=4&page=3']);
    await screen.findByText('Chưa tìm thấy điểm dừng chân phù hợp');
    expect(
      screen.getByRole('combobox', { name: 'Hạng sao khách sạn' }),
    ).toHaveValue('4');
    fireEvent.click(screen.getByRole('radio', { name: 'Nhà hàng' }));
    expect(screen.getByTestId('location')).toHaveTextContent('type=restaurant');
    expect(screen.getByTestId('location').textContent).not.toContain('stars=');
    expect(screen.getByTestId('location').textContent).not.toContain('page=');
  });
  it('restores the city search input after browser Back', async () => {
    mount(<CitiesPage />, ['/cities?search=Hanoi', '/cities?search=HoiAn']);
    expect(
      screen.getByRole('searchbox', { name: 'Tìm thành phố' }),
    ).toHaveValue('HoiAn');
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(
      screen.getByRole('searchbox', { name: 'Tìm thành phố' }),
    ).toHaveValue('Hanoi');
  });
  it('redirects guests to login with a return path without sending a favorite mutation', () => {
    mount(<FavoriteButton kind="hotel" itemId="place-1" />, [
      '/places/hotel/place-1',
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Lưu địa điểm' }));
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/login?redirect=%2Fplaces%2Fhotel%2Fplace-1',
    );
    expect(apiClient.post).not.toHaveBeenCalled();
  });
  it('removes a favorite by the favorite record ID rather than the place ID', async () => {
    useAuthStore.setState({ user, isAuthenticated: true });
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        favorites: [
          { _id: 'favorite-7', itemType: 'Hotel', itemId: { _id: 'place-1' } },
        ],
      },
    });
    mount(<FavoriteButton kind="hotel" itemId="place-1" />);
    const button = await screen.findByRole('button', {
      name: 'Bỏ lưu địa điểm',
    });
    fireEvent.click(button);
    await waitFor(() =>
      expect(apiClient.delete).toHaveBeenCalledWith('/favorites/favorite-7'),
    );
  });
  it('requires rating and comment, then sends a trimmed review with the backend item type', async () => {
    useAuthStore.setState({ user, isAuthenticated: true });
    mount(<ReviewSection kind="hotel" itemId="place-1" />);
    const send = await screen.findByRole('button', { name: 'Gửi đánh giá' });
    await waitFor(() => expect(send).toBeEnabled());
    fireEvent.change(screen.getByLabelText('Nội dung đánh giá'), {
      target: { value: '  Trải nghiệm tốt  ' },
    });
    fireEvent.click(send);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Hãy chọn từ 1 đến 5 sao',
    );
    expect(apiClient.post).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '5 sao' }));
    fireEvent.click(send);
    await waitFor(() =>
      expect(apiClient.post).toHaveBeenCalledWith('/reviews', {
        itemType: 'Hotel',
        itemId: 'place-1',
        rating: 5,
        comment: 'Trải nghiệm tốt',
      }),
    );
  });
  it('rejects out of range ratings before making an API request', async () => {
    await expect(
      exploreApi.addReview('cafe', 'place-2', 6, 'Test'),
    ).rejects.toThrow('1 đến 5 sao');
    expect(apiClient.post).not.toHaveBeenCalled();
  });
  it('shows a failed request as an error rather than claiming there are no places', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Máy chủ đang bận'));
    mount(<PlacesPage />);
    expect(
      await screen.findByText('Chưa tải được địa điểm'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Chưa tìm thấy điểm dừng chân phù hợp'),
    ).not.toBeInTheDocument();
  });
});
