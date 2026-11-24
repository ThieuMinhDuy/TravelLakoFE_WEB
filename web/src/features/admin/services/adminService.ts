import { apiClient } from '../../../services/apiClient';
import type { MessageResponse } from '../../../types/api';
import type { City, CityListResponse, CreateCityDTO, UpdateCityDTO } from '../../../types/city';
import type { CreatePlaceDTO, PlaceType, PlaceUnion } from '../../../types/place';
import type {
  AdminPlace,
  AdminPlaceListResponse,
  AdminReviewFilters,
  AdminReviewListResponse,
  AdminUpdateUserDTO,
  AdminUpdateUserResponse,
  AdminUser,
  AdminUserListResponse,
  DashboardStats,
  DeletePlaceResponse,
  ImportOsmDTO,
  ImportStatsResponse,
} from '../../../types/admin';

/**
 * Import OSM có thể mất tới 2–3 phút: Render khởi động (~50 giây) + tìm tọa độ (tối đa 10 giây)
 * + Overpass (tối đa 90 giây) + AI viết mô tả (tối đa 25 giây) + lưu → đặt 210 giây theo khuyến nghị của backend.
 * FE tự hủy sớm thì backend vẫn import xong nhưng admin lại thấy báo lỗi.
 */
export const IMPORT_TIMEOUT_MS = 210_000;

/**
 * Lớp bảo vệ thêm: backend đã ngừng trả `otp`, nhưng vẫn loại `otp` / `password`
 * nếu chúng xuất hiện, để dữ liệu nhạy cảm không vào cache React Query, DevTools hay log.
 */
const stripSecrets = <T extends object>(doc: T): T => {
  const copy = { ...doc } as Record<string, unknown>;
  delete copy.otp;
  delete copy.password;
  return copy as T;
};

/** Bỏ tham số rỗng để không gửi `?city=` lên server */
const cleanParams = (params: object) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));

export const adminService = {
  getStats: async () => (await apiClient.get<DashboardStats>('/admin/dashboard/stats')).data,

  /* ------------------------------- Users ------------------------------- */
  getUsers: async (): Promise<AdminUserListResponse> => {
    const { data } = await apiClient.get<AdminUserListResponse>('/admin/users');
    return { ...data, users: data.users.map(stripSecrets) };
  },
  getUser: async (id: string): Promise<AdminUser> =>
    stripSecrets((await apiClient.get<AdminUser>(`/admin/users/${id}`)).data),
  updateUser: async (id: string, body: AdminUpdateUserDTO) =>
    (await apiClient.put<AdminUpdateUserResponse>(`/admin/users/${id}`, body)).data,
  deleteUser: async (id: string) => (await apiClient.delete<MessageResponse>(`/admin/users/${id}`)).data,

  /* ------------------------------- Cities ------------------------------ */
  getCities: async () => (await apiClient.get<CityListResponse>('/admin/cities')).data,
  createCity: async (body: CreateCityDTO) => (await apiClient.post<City>('/admin/cities', body)).data,
  updateCity: async (id: string, body: UpdateCityDTO) =>
    (await apiClient.put<City>(`/admin/cities/${id}`, body)).data,
  /** cascade=false: nếu còn địa điểm → ApiError 400, `data` là DeleteCityConflict (xem isCascadeConflict) */
  deleteCity: async (id: string, cascade = false) =>
    (
      await apiClient.delete<MessageResponse>(`/admin/cities/${id}`, {
        params: cascade ? { cascade: 'true' } : undefined,
      })
    ).data,

  /* ------------------------------- Places ------------------------------ */
  getPlaces: async (type: PlaceType, cityId?: string) =>
    (
      await apiClient.get<AdminPlaceListResponse>(`/admin/places/${type}`, {
        params: cleanParams({ city: cityId }),
      })
    ).data,
  getPlace: async (type: PlaceType, id: string) =>
    (await apiClient.get<AdminPlace>(`/admin/places/${type}/${id}`)).data,
  /** Response có `city` là chuỗi ID (không populate) → invalidate danh sách thay vì nhét vào cache */
  createPlace: async (type: PlaceType, body: CreatePlaceDTO) =>
    (await apiClient.post<PlaceUnion>(`/admin/places/${type}`, body)).data,
  updatePlace: async (type: PlaceType, id: string, body: Partial<CreatePlaceDTO>) =>
    (await apiClient.put<PlaceUnion>(`/admin/places/${type}/${id}`, body)).data,
  /** Xóa luôn đánh giá, yêu thích và gỡ địa điểm khỏi lịch trình; `affectedTrips` = số chuyến đi bị ảnh hưởng */
  deletePlace: async (type: PlaceType, id: string) =>
    (await apiClient.delete<DeletePlaceResponse>(`/admin/places/${type}/${id}`)).data,

  /* ------------------------------- Reviews ----------------------------- */
  getReviews: async (filters: AdminReviewFilters = {}) =>
    (await apiClient.get<AdminReviewListResponse>('/admin/reviews', { params: cleanParams(filters) })).data,
  deleteReview: async (id: string) => (await apiClient.delete<MessageResponse>(`/admin/reviews/${id}`)).data,

  /* ------------------------------- Import ------------------------------ */
  /** Danh sách cố định 80 tỉnh thành / điểm du lịch (mảng chuỗi) */
  getVietnamCities: async () => (await apiClient.get<string[]>('/admin/import/vietnam-cities')).data,
  importOsm: async (body: ImportOsmDTO) =>
    (await apiClient.post<ImportStatsResponse>('/admin/import/osm', body, { timeout: IMPORT_TIMEOUT_MS })).data,
};
