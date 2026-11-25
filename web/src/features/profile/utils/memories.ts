import { TRIP_STATUSES } from '../../../utils/trip';
import type { TripGroups, TripWithCity } from '../../../types/trip';

export interface Memory {
  url: string;
  trip: TripWithCity;
}

/** Gom ảnh nhật ký của mọi chuyến đi (cả 3 nhóm), chuyến bắt đầu gần nhất xếp trước */
export function collectMemories(groups: TripGroups): Memory[] {
  return TRIP_STATUSES.flatMap((status) => groups[status])
    .filter((trip) => (trip.diary?.photos.length ?? 0) > 0)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .flatMap((trip) => (trip.diary?.photos ?? []).map((url) => ({ url, trip })));
}
