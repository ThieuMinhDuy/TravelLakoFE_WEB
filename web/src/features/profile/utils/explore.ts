import { isPopulatedCity } from '../../../utils/place';
import { TRIP_STATUSES } from '../../../utils/trip';
import type { City } from '../../../types/city';
import type { TripGroups } from '../../../types/trip';

export const MAX_CITIES = 4;

/** Chọn thành phố để gợi ý: có ảnh, ưu tiên nơi người dùng chưa có chuyến đi */
export function pickCitiesToExplore(cities: City[], trips: TripGroups | undefined, limit = MAX_CITIES): City[] {
  const visited = new Set(
    trips
      ? TRIP_STATUSES.flatMap((s) => trips[s]).map((t) => (isPopulatedCity(t.city) ? t.city._id : t.city))
      : []
  );
  const withImage = cities.filter((c) => !!c.image);
  return [...withImage.filter((c) => !visited.has(c._id)), ...withImage.filter((c) => visited.has(c._id))].slice(
    0,
    limit
  );
}
