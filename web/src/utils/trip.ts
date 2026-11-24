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
export const getTripPlaceCount = (trip: Pick<Trip, 'schedule'>): number =>
  trip.schedule?.reduce((sum, day) => sum + day.places.length, 0) ?? 0;

/** Tổng số chuyến đi ở cả 3 nhóm */
export const countTrips = (groups: TripGroups | undefined): number =>
  groups ? groups.upcoming.length + groups.ongoing.length + groups.past.length : 0;
