import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import tripReducer from '@/store/tripSlice';
import { TripSchedule } from '@/features/tripschedule';
import { TripDetail } from '@/types/trip';
import { mockTripDetail } from './mockTripData';

describe('Compound Component: <TripSchedule>', () => {
  let queryClient: QueryClient;

  const renderWithProviders = (
    tripData: TripDetail = mockTripDetail,
    overrideBudget?: number,
    onOpenAI?: () => void
  ) => {
    const tripToUse: TripDetail = {
      ...tripData,
      budget: overrideBudget !== undefined ? overrideBudget : tripData.budget,
    };

    const store = configureStore({
      reducer: { trip: tripReducer },
      preloadedState: {
        trip: {
          trips: { upcoming: [], ongoing: [], past: [] },
          currentTrip: tripToUse,
          dndSnapshot: null,
          loading: false,
          reorderLoading: false,
          error: null,
        },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <TripSchedule trip={tripToUse} onOpenAI={onOpenAI} />
        </Provider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  // ─── TC-07: Test Component render đầy đủ số ngày và địa điểm ──────────────
  it('TC-07: TripSchedule render đầy đủ các cột ngày và các thẻ địa điểm trong lịch trình', () => {
    renderWithProviders(mockTripDetail);

    // Kiểm tra tiêu đề chuyến đi trong Header
    expect(
      screen.getByText('Khám phá Hà Nội 2 ngày 1 đêm')
    ).toBeInTheDocument();

    // Kiểm tra đúng 2 cột ngày tương ứng với schedule.length
    const dayColumns = screen.getAllByTestId('day-column');
    expect(dayColumns).toHaveLength(2);

    // Kiểm tra tổng số 5 thẻ địa điểm hiển thị
    const placeCards = screen.getAllByTestId('place-card');
    expect(placeCards).toHaveLength(5);

    // Kiểm tra hiển thị tên của các địa điểm
    expect(screen.getByText('Hồ Hoàn Kiếm')).toBeInTheDocument();
    expect(screen.getByText('Phở Gia Truyền Bát Đàn')).toBeInTheDocument();
    expect(screen.getByText('Khách sạn Silk Path')).toBeInTheDocument();
    expect(screen.getByText('Cafe Giảng')).toBeInTheDocument();
    expect(screen.getByText('Văn Miếu Quốc Tử Giám')).toBeInTheDocument();
  });

  // ─── TC-08: Test Component Budget hiển thị % và cảnh báo vượt ngân sách ────
  it('TC-08: TripSchedule.Budget hiển thị chính xác % thanh tiến trình và cảnh báo khi vượt ngân sách', () => {
    // 1. Trường hợp bình thường (ngân sách 2.000.000đ, dự tính 1.345.000đ -> 67%)
    const { unmount } = renderWithProviders(mockTripDetail, 2000000);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '67');
    expect(screen.getByText('Trong tầm kiểm soát')).toBeInTheDocument();
    unmount();

    // 2. Trường hợp vượt ngân sách (ngân sách 1.000.000đ, dự tính 1.345.000đ)
    renderWithProviders(mockTripDetail, 1000000);

    // Phải hiển thị badge cảnh báo "Vượt ngân sách"
    expect(screen.getByText(/Vượt ngân sách/i)).toBeInTheDocument();
    // Phải hiển thị chi phí dự tính vượt ngân sách
    expect(screen.getByText(/1.345.000/i)).toBeInTheDocument();
  });

  // ─── TC-09: Test TripSchedule tách độc lập khỏi AIchat ──────────────────────
  it('TC-09: TripSchedule không tự render AIchat và chỉ hiện nút AI khi truyền onOpenAI', () => {
    const { unmount } = renderWithProviders(mockTripDetail);
    expect(screen.queryByRole('button', { name: /Mở Trợ lý Du lịch Ảo AI/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Trợ lý AI gợi ý/i })).not.toBeInTheDocument();
    unmount();

    const onOpenAI = vi.fn();
    renderWithProviders(mockTripDetail, undefined, onOpenAI);
    const openAiBtn = screen.getByRole('button', { name: /Trợ lý AI gợi ý/i });
    fireEvent.click(openAiBtn);
    expect(onOpenAI).toHaveBeenCalledTimes(1);
  });
});

