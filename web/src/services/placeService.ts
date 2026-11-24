import { apiClient } from './apiClient';
import type { GlobalSearchResponse } from '../types/place';

export const placeService = {
  /**
   * GET /api/places/search — tìm trên cả 4 loại địa điểm.
   * Không có từ khóa / thành phố: mỗi loại trả tối đa 5 kết quả.
   */
  search: async (params: { keyword?: string; cityId?: string } = {}): Promise<GlobalSearchResponse> => {
    const res = await apiClient.get<GlobalSearchResponse>('/places/search', {
      params: { q: params.keyword || undefined, city: params.cityId || undefined },
    });
    return res.data;
  },
};
