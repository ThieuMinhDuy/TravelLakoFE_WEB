import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { Trip, TripGroups, TripStatus } from '../types/trip';

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  upcoming: 'Sắp đi',
  ongoing: 'Đang đi',
  past: 'Đã đi',
};

export const TRIP_STATUSES: readonly TripStatus[] = ['upcoming', 'ongoing', 'past'];

/** Số ngày của chuyến đi, tính cả ngày đi và ngày về */
export const getTripDays = (trip: Pick<Trip, 'startDate' | 'endDate'>): number =>
  Math.max(1, differenceInCalendarDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1);

/** Tổng số điểm đến trong toàn bộ lịch trình */
export const getTripPlaceCount = (
  trip: { schedule?: ReadonlyArray<{ places: readonly unknown[] }> }
): number =>
  trip.schedule?.reduce((sum, day) => sum + day.places.length, 0) ?? 0;

/** Tổng số chuyến đi ở cả 3 nhóm */
export const countTrips = (groups: TripGroups | undefined): number =>
  groups ? groups.upcoming.length + groups.ongoing.length + groups.past.length : 0;

/** Kiểm tra chuyến đi đã có nội dung nhật ký (ghi chú hoặc ảnh kỷ niệm) */
export const hasTripDiary = (trip: { diary?: Trip['diary'] | null }): boolean =>
  Boolean(trip.diary?.notes?.trim()) || (trip.diary?.photos?.length ?? 0) > 0;

/**
 * Kiểm tra chuyến đi đã kết thúc (ngày hiện tại > ngày kết thúc theo lịch UTC),
 * đồng bộ cách backend nhóm chuyến đi sang `past` trong GET /api/trips.
 */
export function isTripEnded(trip: Pick<Trip, 'endDate'>, now: Date = new Date()): boolean {
  const end = new Date(trip.endDate);
  if (Number.isNaN(end.getTime())) return false;

  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const tripEndUtc = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  return todayUtc > tripEndUtc;
}
