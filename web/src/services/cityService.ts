import { apiClient } from './apiClient';
import type { CityListResponse } from '../types/city';

export const cityService = {
  /** GET /api/cities — toàn bộ thành phố (công khai) */
  getCities: async (): Promise<CityListResponse> => {
    const res = await apiClient.get<CityListResponse>('/cities');
    return res.data;
  },
};
