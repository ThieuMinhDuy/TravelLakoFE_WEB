import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import type { AdminReviewFilters } from '../../../types/admin';
import type { PlaceType } from '../../../types/place';
import { adminService } from '../services/adminService';

/**
 * Dữ liệu admin thay đổi do chính admin thao tác (có invalidate) → không cần refetch quá dày.
 * Quay lại tab sau hơn 1 phút thì tải lại: thao tác ở tab khác (vd: import) hoặc của admin khác
 * không làm mới được cache của tab này.
 */
const ADMIN_FRESHNESS = { staleTime: 60_000, refetchOnWindowFocus: true } as const;

export const useAdminStats = () =>
  useQuery({ queryKey: queryKeys.admin.stats(), queryFn: adminService.getStats, ...ADMIN_FRESHNESS });

export const useAdminUsers = () =>
  useQuery({ queryKey: queryKeys.admin.users(), queryFn: adminService.getUsers, ...ADMIN_FRESHNESS });

export const useAdminCities = () =>
  useQuery({ queryKey: queryKeys.admin.cities(), queryFn: adminService.getCities, ...ADMIN_FRESHNESS });

export const useAdminPlaces = (type: PlaceType, cityId = '') =>
  useQuery({
    queryKey: queryKeys.admin.places(type, cityId),
    queryFn: () => adminService.getPlaces(type, cityId),
    ...ADMIN_FRESHNESS,
  });

export const useAdminReviews = (filters: AdminReviewFilters = {}) =>
  useQuery({
    queryKey: queryKeys.admin.reviews(filters),
    queryFn: () => adminService.getReviews(filters),
    ...ADMIN_FRESHNESS,
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
