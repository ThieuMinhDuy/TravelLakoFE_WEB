import { apiClient } from './apiClient';
import type { City, CityListResponse } from '../types/city';

export const cityService = {
  /** GET /api/cities — toàn bộ thành phố (công khai) */
  getCities: async ({ signal }: { signal?: AbortSignal } = {}): Promise<CityListResponse> => {
    const res = await apiClient.get<CityListResponse>('/cities', { signal });
    return res.data;
  },
  getCity: async (id: string, signal?: AbortSignal): Promise<City> =>
    (await apiClient.get<City>(`/cities/${encodeURIComponent(id)}`, { signal })).data,
};
