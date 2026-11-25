import { apiClient } from './apiClient';
import {
  Trip,
  TripDetail,
  MyTripsResponse,
  CreateTripDTO,
  AddPlaceToScheduleDTO,
  ReorderScheduleDTO,
  UpdateTripMetadataDTO,
} from '../types/trip';

// ─── Cấu hình URL gọi Backend từ biến môi trường VITE_API_URL ──────────────
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const isAbsoluteUrl = /^https?:\/\//i.test(rawApiUrl);
const API_BASE = isAbsoluteUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`)
  : '';
const TRIPS_API = isAbsoluteUrl ? `${API_BASE}/trips` : '/trips';

/** Chuẩn hóa response trường hợp backend bọc dữ liệu trong `{ trip }` */
function unwrapTrip<T extends object>(data: T | { trip: T }): T {
  if (data && typeof data === 'object' && 'trip' in data && data.trip && typeof data.trip === 'object') {
    return data.trip;
  }
  return data as T;
}

// ─── GET /api/trips ───────────────────────────────────────────────────────────
/** Lấy danh sách trips của user (phân nhóm upcoming / ongoing / past) */
export async function getMyTrips(): Promise<MyTripsResponse> {
  const res = await apiClient.get<MyTripsResponse>(TRIPS_API);
  return res.data;
}

// ─── GET /api/trips/:id ───────────────────────────────────────────────────────
/** Lấy chi tiết trip, populate city + places */
export async function getTripById(id: string): Promise<TripDetail> {
  const res = await apiClient.get<TripDetail | { trip: TripDetail }>(`${TRIPS_API}/${id}`);
  return unwrapTrip(res.data);
}

// ─── POST /api/trips ──────────────────────────────────────────────────────────
/** Tạo trip mới (BE tự sinh schedule days) */
export async function createTrip(data: CreateTripDTO): Promise<Trip> {
  const res = await apiClient.post<Trip | { trip: Trip }>(TRIPS_API, data);
  return unwrapTrip(res.data);
}

// ─── DELETE /api/trips/:id ────────────────────────────────────────────────────
/** Xóa trip */
export async function deleteTrip(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`${TRIPS_API}/${id}`);
  return res.data;
}

// ─── PUT /api/trips/:id ───────────────────────────────────────────────────────
/** Cập nhật metadata (title, budget, startDate, endDate) */
export async function updateTripMetadata(
  id: string,
  data: UpdateTripMetadataDTO
): Promise<Trip> {
  const res = await apiClient.put<Trip | { trip: Trip }>(`${TRIPS_API}/${id}`, data);
  return unwrapTrip(res.data);
}

// ─── POST /api/trips/:id/schedule/places ──────────────────────────────────────
/** Thêm địa điểm vào ngày trong lịch trình */
export async function addPlaceToSchedule(
  tripId: string,
  data: AddPlaceToScheduleDTO
): Promise<TripDetail> {
  const res = await apiClient.post<TripDetail | { trip: TripDetail }>(
    `${TRIPS_API}/${tripId}/schedule/places`,
    data
  );
  return unwrapTrip(res.data);
}

// ─── DELETE /api/trips/:tripId/schedule/places/:subId ───────────────────────
/** Xóa địa điểm khỏi lịch trình bằng ID của subdocument */
export async function removePlaceFromSchedule(
  tripId: string,
  subId: string
): Promise<TripDetail> {
  const res = await apiClient.delete<TripDetail | { trip: TripDetail }>(
    `${TRIPS_API}/${tripId}/schedule/places/${subId}`
  );
  return unwrapTrip(res.data);
}

// ─── PUT /api/trips/:id/schedule/reorder ─────────────────────────────────────
/**
 * Gửi thứ tự mới sau khi kéo thả lên BE.
 * Body: { day: number, placesOrder: string[] }
 * Dùng trong optimistic DnD — gọi SAU khi đã update UI.
 * Nếu lỗi → caller dispatch rollbackDnd().
 */
export async function reorderSchedule(
  tripId: string,
  data: ReorderScheduleDTO
): Promise<TripDetail> {
  const res = await apiClient.put<TripDetail | { trip: TripDetail }>(
    `${TRIPS_API}/${tripId}/schedule/reorder`,
    data
  );
  return unwrapTrip(res.data);
}

// ─── PATCH /api/trips/:tripId/schedule/places/:subId/check-in ────────────────
/** Check-in vào địa điểm (đánh dấu visited = true / false) */
export async function checkInPlace(
  tripId: string,
  subId: string,
  visited: boolean
): Promise<TripDetail> {
  const res = await apiClient.patch<TripDetail | { trip: TripDetail }>(
    `${TRIPS_API}/${tripId}/schedule/places/${subId}/check-in`,
    { visited }
  );
  return unwrapTrip(res.data);
}

// ─── PUT /api/trips/:id/diary ────────────────────────────────────────────────
/** Cập nhật nhật ký chuyến đi */
export async function updateTripDiary(
  tripId: string,
  data: { notes?: string; photos?: string[] }
): Promise<Trip> {
  const res = await apiClient.put<Trip | { trip: Trip }>(`${TRIPS_API}/${tripId}/diary`, data);
  return unwrapTrip(res.data);
}
