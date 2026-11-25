import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LocaleProvider } from '@/contexts/locale/LocaleProvider';
import { ToastProvider } from '@/contexts/toast/ToastProvider';
import tripReducer from '@/store/tripSlice';
import { useAuthStore } from '@/store/useAuthStore';
import { globalAIChatStore } from '@/store/aiChatStore';
import * as tripService from '@/services/tripService';
import { cityService } from '@/services/cityService';
import { placeService } from '@/services/placeService';
import { TripsPage } from '@/features/tripschedule/pages/TripsPage';
import { TripDetailPage } from '@/features/tripschedule/pages/TripDetailPage';
import { mockTripDetail } from './mockTripData';

vi.mock('@/services/tripService');
vi.mock('@/services/cityService', () => ({
  cityService: {
    getCities: vi.fn(),
    getCity: vi.fn(),
  },
}));
vi.mock('@/services/placeService', () => ({
  placeService: {
    search: vi.fn(),
    getPlaces: vi.fn(),
    getPlace: vi.fn(),
  },
}));

describe('Pages: TripsPage (/trips) & TripDetailPage (/trips/:id)', () => {
  let queryClient: QueryClient;

  const renderRoute = (initialRoute: string) => {
    const store = configureStore({
      reducer: { trip: tripReducer },
    });

    return render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <LocaleProvider>
            <ToastProvider>
              <MemoryRouter initialEntries={[initialRoute]}>
                <Routes>
                  <Route path="/trips" element={<TripsPage />} />
                  <Route path="/trips/:id" element={<TripDetailPage />} />
                  <Route path="/login" element={<div>Trang đăng nhập</div>} />
                </Routes>
              </MemoryRouter>
            </ToastProvider>
          </LocaleProvider>
        </QueryClientProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    globalAIChatStore.getState().resetAIChat();
    useAuthStore.getState().logout();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.mocked(cityService.getCities).mockResolvedValue({
      total: 1,
      cities: [
        {
          _id: 'city_hanoi_1',
          name: 'Hà Nội',
          coordinates: { lat: 21.0285, lng: 105.8542 },
        },
      ],
    });
    vi.mocked(placeService.search).mockResolvedValue({
      attractions: [
        {
          _id: 'attr_new',
          name: 'Lăng Bác',
          city: 'city_hanoi_1',
          address: 'Ba Đình, Hà Nội',
          coordinates: { lat: 21.0368, lng: 105.8347 },
          admissionFee: 0,
          rating: 4.9,
        },
      ],
      hotels: [],
      restaurants: [],
      cafes: [],
    });
  });

  it('TripsPage hiển thị lời mời đăng nhập khi là khách', () => {
    renderRoute('/trips');
    expect(
      screen.getByText('Đăng nhập để quản lý chuyến đi của bạn')
    ).toBeInTheDocument();
  });

  it('TripsPage tải danh sách chuyến đi và cho phép tạo chuyến đi mới', async () => {
    const user = userEvent.setup();
    useAuthStore.getState().setAuth(
      { _id: 'u1', name: 'Duy', email: 'duy@gmail.com' },
      'token-123',
      true
    );

    vi.mocked(tripService.getMyTrips).mockResolvedValue({
      upcoming: [mockTripDetail as unknown as import('@/types/trip').TripWithCity],
      ongoing: [],
      past: [],
    });
    vi.mocked(tripService.createTrip).mockResolvedValue({
      ...mockTripDetail,
      _id: 'trip_new_1',
      city: 'city_hanoi_1',
    } as unknown as import('@/types/trip').Trip);
    vi.mocked(tripService.getTripById).mockResolvedValue({
      ...mockTripDetail,
      _id: 'trip_new_1',
      title: 'Hà Nội cuối tuần',
    });

    renderRoute('/trips');

    expect(
      await screen.findByText('Khám phá Hà Nội 2 ngày 1 đêm')
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Tạo chuyến đi mới/i }));
    const createBudgetInput = screen.getByLabelText(/Ngân sách dự kiến/i) as HTMLInputElement;
    expect(createBudgetInput.value).toBe('3.000.000');

    await user.type(screen.getByLabelText(/Tên chuyến đi/i), 'Hà Nội cuối tuần');
    await user.selectOptions(
      await screen.findByLabelText(/Thành phố điểm đến/i),
      'city_hanoi_1'
    );
    await user.click(screen.getByRole('button', { name: /^Tạo chuyến đi$/i }));

    await waitFor(() => {
      expect(tripService.createTrip).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Hà Nội cuối tuần',
          city: 'city_hanoi_1',
        })
      );
    });
    expect(await screen.findByText('Hà Nội cuối tuần')).toBeInTheDocument();
  });

  it('TripDetailPage tải lịch trình, mở AI tối ưu và thêm địa điểm vào ngày', async () => {
    const user = userEvent.setup();
    useAuthStore.getState().setAuth(
      { _id: 'u1', name: 'Duy', email: 'duy@gmail.com' },
      'token-123',
      true
    );

    vi.mocked(tripService.getTripById).mockResolvedValue(mockTripDetail);
    vi.mocked(tripService.addPlaceToSchedule).mockResolvedValue(mockTripDetail);
    vi.mocked(tripService.updateTripMetadata).mockResolvedValue({
      ...mockTripDetail,
      city: 'city_hanoi_1',
      budget: 30000000,
    } as unknown as import('@/types/trip').Trip);

    renderRoute('/trips/trip_123');

    expect(
      await screen.findByText('Khám phá Hà Nội 2 ngày 1 đêm')
    ).toBeInTheDocument();
    expect(screen.getByText('Hồ Hoàn Kiếm')).toBeInTheDocument();

    // Kiểm tra EditTripModal định dạng tiền tệ kiểu 2.000.000 đ / 30.000.000 đ
    await user.click(screen.getByRole('button', { name: /Chỉnh sửa/i }));
    const editBudgetInput = screen.getByLabelText(/Ngân sách dự kiến/i) as HTMLInputElement;
    expect(editBudgetInput.value).toBe('2.000.000');
    await user.clear(editBudgetInput);
    await user.type(editBudgetInput, '30000000');
    expect(editBudgetInput.value).toBe('30.000.000');
    await user.click(screen.getByRole('button', { name: /Lưu thay đổi/i }));

    await waitFor(() => {
      expect(tripService.updateTripMetadata).toHaveBeenCalledWith(
        'trip_123',
        expect.objectContaining({ budget: 30000000 })
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Trợ lý AI gợi ý/i }));
    expect(globalAIChatStore.getState().isAIPanelOpen).toBe(true);
    expect(globalAIChatStore.getState().activeAITab).toBe('optimize');

    const addButtons = screen.getAllByRole('button', { name: /Thêm điểm/i });
    await user.click(addButtons[0]);

    expect(await screen.findByText('Lăng Bác')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Thêm$/i }));

    await waitFor(() => {
      expect(tripService.addPlaceToSchedule).toHaveBeenCalledWith('trip_123', {
        day: 1,
        placeType: 'Attraction',
        placeId: 'attr_new',
        note: undefined,
      });
    });
  });
});

