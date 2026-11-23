import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import type { AdminReviewFilters } from '../../../types/admin';
import type { PlaceType } from '../../../types/place';
import { adminService } from '../services/adminService';

/** Dữ liệu admin thay đổi do chính admin thao tác (có invalidate) → không cần refetch quá dày */
const ADMIN_STALE_TIME = 60_000;

export const useAdminStats = () =>
  useQuery({ queryKey: queryKeys.admin.stats(), queryFn: adminService.getStats, staleTime: ADMIN_STALE_TIME });

export const useAdminUsers = () =>
  useQuery({ queryKey: queryKeys.admin.users(), queryFn: adminService.getUsers, staleTime: ADMIN_STALE_TIME });

export const useAdminCities = () =>
  useQuery({ queryKey: queryKeys.admin.cities(), queryFn: adminService.getCities, staleTime: ADMIN_STALE_TIME });

export const useAdminPlaces = (type: PlaceType, cityId = '') =>
  useQuery({
    queryKey: queryKeys.admin.places(type, cityId),
    queryFn: () => adminService.getPlaces(type, cityId),
    staleTime: ADMIN_STALE_TIME,
  });

export const useAdminReviews = (filters: AdminReviewFilters = {}) =>
  useQuery({
    queryKey: queryKeys.admin.reviews(filters),
    queryFn: () => adminService.getReviews(filters),
    staleTime: ADMIN_STALE_TIME,
    // Đổi bộ lọc: giữ danh sách cũ trong lúc tải, tránh nhấp nháy khung trống
    placeholderData: keepPreviousData,
  });

/** Danh sách cố định phía backend → cache vô thời hạn */
export const useVietnamCities = () =>
  useQuery({
    queryKey: queryKeys.admin.vietnamCities(),
    queryFn: adminService.getVietnamCities,
    staleTime: Infinity,
    gcTime: Infinity,
  });
