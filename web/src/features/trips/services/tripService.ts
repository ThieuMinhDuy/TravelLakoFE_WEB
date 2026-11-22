import { apiClient } from '../../../services/apiClient';
import {
  Trip,
  TripDetail,
  MyTripsResponse,
  CreateTripDTO,
  AddPlaceToScheduleDTO,
  ReorderScheduleDTO,
  UpdateTripMetadataDTO,
} from '../types/trip';

const BASE = '/trips';

// ─── GET /api/trips ───────────────────────────────────────────────────────────
/** Lấy danh sách trips của user (phân nhóm upcoming / ongoing / past) */
export async function getMyTrips(): Promise<MyTripsResponse> {
  const res = await apiClient.get<MyTripsResponse>(BASE);
  return res.data;
}

// ─── GET /api/trips/:id ───────────────────────────────────────────────────────
/** Lấy chi tiết trip, populate city + places */
export async function getTripById(id: string): Promise<TripDetail> {
  const res = await apiClient.get<TripDetail>(`${BASE}/${id}`);
  return res.data;
}

// ─── POST /api/trips ──────────────────────────────────────────────────────────
/** Tạo trip mới (BE tự sinh schedule days) */
export async function createTrip(data: CreateTripDTO): Promise<Trip> {
  const res = await apiClient.post<Trip>(BASE, data);
  return res.data;
}

// ─── DELETE /api/trips/:id ────────────────────────────────────────────────────
/** Xóa trip */
export async function deleteTrip(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`${BASE}/${id}`);
  return res.data;
}

// ─── PUT /api/trips/:id ───────────────────────────────────────────────────────
/** Cập nhật metadata (title, budget, startDate, endDate) */
export async function updateTripMetadata(
  id: string,
  data: UpdateTripMetadataDTO
): Promise<Trip> {
  const res = await apiClient.put<Trip>(`${BASE}/${id}`, data);
  return res.data;
}

// ─── POST /api/trips/:id/schedule ────────────────────────────────────────────
/** Thêm địa điểm vào ngày trong lịch trình */
export async function addPlaceToSchedule(
  tripId: string,
  data: AddPlaceToScheduleDTO
): Promise<TripDetail> {
  const res = await apiClient.post<TripDetail>(`${BASE}/${tripId}/schedule`, data);
  return res.data;
}

// ─── DELETE /api/trips/:tripId/schedule/:dayId/places/:placeId ───────────────
/** Xóa địa điểm khỏi ngày cụ thể trong lịch trình */
export async function removePlaceFromSchedule(
  tripId: string,
  dayId: string,
  placeId: string
): Promise<TripDetail> {
  const res = await apiClient.delete<TripDetail>(
    `${BASE}/${tripId}/schedule/${dayId}/places/${placeId}`
  );
  return res.data;
}

// ─── PUT /api/trips/:id/schedule/reorder ─────────────────────────────────────
/**
 * Gửi thứ tự mới sau khi kéo thả lên BE.
 * Dùng trong optimistic DnD — gọi SAU khi đã update UI.
 * Nếu lỗi → caller dispatch rollbackDnd().
 */
export async function reorderSchedule(
  tripId: string,
  data: ReorderScheduleDTO
): Promise<TripDetail> {
  const res = await apiClient.put<TripDetail>(
    `${BASE}/${tripId}/schedule/reorder`,
    data
  );
  return res.data;
}

// ─── PUT /api/trips/:tripId/schedule/:dayId/places/:placeId/checkin ──────────
/** Check-in vào địa điểm (đánh dấu visited + ghi thời gian) */
export async function checkInPlace(
  tripId: string,
  dayId: string,
  placeId: string
): Promise<TripDetail> {
  const res = await apiClient.put<TripDetail>(
    `${BASE}/${tripId}/schedule/${dayId}/places/${placeId}/checkin`
  );
  return res.data;
}

// ─── PUT /api/trips/:id/diary ────────────────────────────────────────────────
/** Cập nhật nhật ký chuyến đi */
export async function updateTripDiary(
  tripId: string,
  data: { notes?: string; photos?: string[] }
): Promise<Trip> {
  const res = await apiClient.put<Trip>(`${BASE}/${tripId}/diary`, data);
  return res.data;
}

