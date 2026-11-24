import { apiClient } from './apiClient';
import type { TripGroups } from '../types/trip';

export const tripService = {
  /** GET /api/trips — chuyến đi của người dùng, backend chia sẵn upcoming / ongoing / past */
  getMyTrips: async (): Promise<TripGroups> => {
    const res = await apiClient.get<TripGroups>('/trips');
    return res.data;
  },
};
