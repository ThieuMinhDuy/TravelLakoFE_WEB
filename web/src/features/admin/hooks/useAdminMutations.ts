import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import type { AdminUpdateUserDTO, AdminUserListResponse, ImportOsmDTO } from '../../../types/admin';
import type { CreateCityDTO, UpdateCityDTO } from '../../../types/city';
import type { CreatePlaceDTO, PlaceType } from '../../../types/place';
import { adminService } from '../services/adminService';
import { invalidateAdmin } from '../utils/invalidateAdmin';

/*
 * Các mutation chỉ lo gọi API + làm mới cache. Thông báo (toast) và xác nhận do trang tự xử lý,
 * dùng adminErrorMessage() để hiển thị lỗi bằng tiếng Việt.
 */

/* --------------------------------- Users -------------------------------- */

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AdminUpdateUserDTO }) => adminService.updateUser(id, body),
    onSuccess: (updated) => {
      // Response chỉ có vài field → MERGE vào phần tử cũ, không thay nguyên phần tử
      qc.setQueryData<AdminUserListResponse>(queryKeys.admin.users(), (old) =>
        old ? { ...old, users: old.users.map((u) => (u._id === updated._id ? { ...u, ...updated } : u)) } : old
      );
      return invalidateAdmin.afterUser(qc);
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => invalidateAdmin.afterUser(qc),
  });
}

/* -------------------------------- Cities -------------------------------- */

export function useSaveCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: CreateCityDTO | UpdateCityDTO }) =>
      id ? adminService.updateCity(id, body) : adminService.createCity(body as CreateCityDTO),
    onSuccess: () => invalidateAdmin.afterCity(qc),
  });
}

/** Lỗi 400 có requiresCascade → trang hỏi lại rồi gọi với cascade=true (xem isCascadeConflict) */
export function useDeleteCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cascade = false }: { id: string; cascade?: boolean }) => adminService.deleteCity(id, cascade),
    onSuccess: () => invalidateAdmin.afterCity(qc),
  });
}

/* -------------------------------- Places -------------------------------- */

export function useSavePlace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id, body }: { type: PlaceType; id?: string; body: CreatePlaceDTO }) =>
      id ? adminService.updatePlace(type, id, body) : adminService.createPlace(type, body),
    onSuccess: () => invalidateAdmin.afterPlace(qc),
  });
}

export function useDeletePlace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }: { type: PlaceType; id: string }) => adminService.deletePlace(type, id),
    onSuccess: () => invalidateAdmin.afterPlace(qc),
  });
}

/* -------------------------------- Reviews ------------------------------- */

/** Xóa một hoặc nhiều đánh giá; trả về số xóa thành công / thất bại */
export function useDeleteReviews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map((id) => adminService.deleteReview(id)));
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length === ids.length) throw (failed[0] as PromiseRejectedResult).reason;
      return { deleted: ids.length - failed.length, failed: failed.length };
    },
    onSettled: () => invalidateAdmin.afterReview(qc),
  });
}

/* -------------------------------- Import -------------------------------- */

export function useImportOsm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ImportOsmDTO) => adminService.importOsm(body),
    onSuccess: () => invalidateAdmin.afterImport(qc),
  });
}
