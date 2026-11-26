import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/contexts/toast/ToastProvider';
import { queryKeys } from '@/lib/queryKeys';
import * as tripService from '@/services/tripService';
import {
  useDiaryTrips,
  useTripDiaryDetail,
  useUpdateTripDiary,
} from '@/features/diary/hooks/useTripDiary';
import { makeTrip } from '../../helpers/fixtures';

vi.mock('@/services/tripService');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );

  return { wrapper, queryClient };
}

describe('useTripDiary hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useDiaryTrips và useTripDiaryDetail gọi đúng service và tắt query khi thiếu điều kiện', async () => {
    const groups = { upcoming: [], ongoing: [], past: [makeTrip({ _id: 'trip-past' })] };
    vi.mocked(tripService.getMyTrips).mockResolvedValue(groups);
    vi.mocked(tripService.getTripById).mockResolvedValue({
      ...makeTrip({ _id: 'trip-past' }),
      schedule: [],
    });

    const { wrapper } = createWrapper();
    const listHook = renderHook(() => useDiaryTrips(true), { wrapper });
    const detailHook = renderHook(() => useTripDiaryDetail('trip-past'), { wrapper });
    const disabledHook = renderHook(() => useTripDiaryDetail(''), { wrapper });

    await waitFor(() => expect(listHook.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(detailHook.result.current.isSuccess).toBe(true));

    expect(listHook.result.current.data).toEqual(groups);
    expect(detailHook.result.current.data?._id).toBe('trip-past');
    expect(disabledHook.result.current.fetchStatus).toBe('idle');
  });

  it('useUpdateTripDiary gọi updateTripDiary và invalidate cache detail + mine + profile', async () => {
    vi.mocked(tripService.updateTripDiary).mockResolvedValue({
      ...makeTrip({ _id: 'trip-1' }),
      city: 'city-dn',
      schedule: [],
      diary: { notes: 'Quá tuyệt vời', photos: ['https://img.test/a.jpg'] },
    });

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateTripDiary('trip-1'), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        notes: 'Quá tuyệt vời',
        photos: ['https://img.test/a.jpg'],
      });
    });

    expect(tripService.updateTripDiary).toHaveBeenCalledWith('trip-1', {
      notes: 'Quá tuyệt vời',
      photos: ['https://img.test/a.jpg'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.trips.detail('trip-1') });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.trips.mine() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.profile });
  });

  it('useUpdateTripDiary từ chối khi thiếu tripId', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateTripDiary(''), { wrapper });

    await expect(result.current.mutateAsync({ notes: 'abc', photos: [] })).rejects.toThrow(
      'Không xác định được mã chuyến đi.'
    );
    expect(tripService.updateTripDiary).not.toHaveBeenCalled();
  });

  it('hiển thị thông báo phù hợp khi xóa trắng hoặc khi API lỗi', async () => {
    vi.mocked(tripService.updateTripDiary)
      .mockResolvedValueOnce({
        ...makeTrip({ _id: 'trip-1' }),
        city: 'city-dn',
        schedule: [],
        diary: { notes: '', photos: [] },
      })
      .mockRejectedValueOnce(new Error('Photos must be an array of strings'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateTripDiary('trip-1'), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ notes: '', photos: [] });
    });
    expect(await screen.findByText('Đã xóa nội dung nhật ký')).toBeInTheDocument();

    await act(async () => {
      await expect(
        result.current.mutateAsync({ notes: 'abc', photos: [] })
      ).rejects.toThrow('Photos must be an array of strings');
    });
    expect(await screen.findByText('Không thể lưu nhật ký')).toBeInTheDocument();
  });
});

