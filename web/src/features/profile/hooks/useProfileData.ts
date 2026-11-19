import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../contexts/toast/ToastContext';
import { queryKeys } from '../../../lib/queryKeys';
import { cityService } from '../../../services/cityService';
import { favoriteService } from '../../../services/favoriteService';
import { placeService } from '../../../services/placeService';
import { tripService } from '../../../services/tripService';
import type { FavoriteListResponse } from '../../../types/favorite';

/** Chuyến đi của tôi (backend chia sẵn upcoming / ongoing / past) */
export const useMyTrips = () =>
  useQuery({ queryKey: queryKeys.trips.mine(), queryFn: tripService.getMyTrips });

/** Danh sách yêu thích của tôi */
export const useMyFavorites = () =>
  useQuery({ queryKey: queryKeys.favorites.mine(), queryFn: favoriteService.getMyFavorites });

/** Danh sách thành phố (ít thay đổi → giữ cache lâu) */
export const useCities = () =>
  useQuery({
    queryKey: queryKeys.cities.list(),
    queryFn: cityService.getCities,
    staleTime: 30 * 60 * 1000,
  });

/** Địa điểm nổi bật trên cả 4 loại — nguồn dữ liệu cho "Gợi ý dành cho bạn" */
export const usePlaceHighlights = () =>
  useQuery({
    queryKey: queryKeys.places.search(),
    queryFn: () => placeService.search(),
    staleTime: 10 * 60 * 1000,
  });

/** Lưu địa điểm vào yêu thích (từ khối gợi ý) */
export function useAddFavorite() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: favoriteService.addFavorite,
    onSuccess: () => toast.success('Đã lưu vào danh sách yêu thích'),
    onError: (error) => toast.error('Không thể lưu địa điểm', { description: error.message }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

/**
 * Bỏ yêu thích với optimistic update:
 * thẻ biến mất ngay khi bấm; API lỗi → khôi phục danh sách cũ và báo lỗi.
 */
export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const key = queryKeys.favorites.mine();

  return useMutation({
    mutationFn: favoriteService.removeFavorite,
    onMutate: async (favoriteId: string) => {
      // Hủy request đang chạy để không ghi đè lên dữ liệu optimistic
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<FavoriteListResponse>(key);
      if (previous) {
        const favorites = previous.favorites.filter((f) => f._id !== favoriteId);
        queryClient.setQueryData<FavoriteListResponse>(key, { total: favorites.length, favorites });
      }
      return { previous };
    },
    onError: (error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error('Không thể bỏ yêu thích', { description: error.message });
    },
    onSuccess: () => toast.success('Đã bỏ khỏi danh sách yêu thích'),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
      // Số lượng yêu thích trên phần đầu trang lấy từ profile
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}
