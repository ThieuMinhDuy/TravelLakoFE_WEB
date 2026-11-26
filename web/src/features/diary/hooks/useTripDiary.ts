import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../contexts/toast/ToastContext';
import { invalidateRelated } from '../../../lib/invalidateRelated';
import { queryKeys } from '../../../lib/queryKeys';
import { getMyTrips, getTripById, updateTripDiary } from '../../../services/tripService';
import type { TripDiary } from '../../../types/trip';

/** Lấy danh sách chuyến đi của người dùng (gồm past / ongoing / upcoming) */
export const useDiaryTrips = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.trips.mine(),
    queryFn: getMyTrips,
    enabled,
  });

/** Lấy chi tiết chuyến đi kèm lịch trình đã populate để viết/xem nhật ký */
export const useTripDiaryDetail = (tripId: string) =>
  useQuery({
    queryKey: queryKeys.trips.detail(tripId),
    queryFn: () => getTripById(tripId),
    enabled: Boolean(tripId),
  });

/**
 * Lưu hoặc xóa trắng nhật ký chuyến đi (`PUT /api/trips/:id/diary`).
 * Tự động đồng bộ cache của chi tiết chuyến đi, danh sách chuyến đi và Hồ sơ (tab Kỷ niệm).
 */
export function useUpdateTripDiary(tripId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: Partial<TripDiary>) => {
      if (!tripId) {
        throw new Error('Không xác định được mã chuyến đi.');
      }
      return updateTripDiary(tripId, data);
    },
    onSuccess: async (_updated, variables) => {
      await invalidateRelated.afterTripDiary(queryClient, tripId);
      const isCleared = !variables.notes?.trim() && (variables.photos?.length ?? 0) === 0;
      toast.success(isCleared ? 'Đã xóa nội dung nhật ký' : 'Đã lưu nhật ký chuyến đi');
    },
    onError: (error: Error) => {
      toast.error('Không thể lưu nhật ký', { description: error.message });
    },
  });
}

