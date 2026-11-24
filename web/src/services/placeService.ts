import { apiClient } from './apiClient';
import type { GlobalSearchResponse, PlaceType, PlaceUnion, PlaceListResponse } from '../types/place';

export interface PlaceListParams {
  city?: string;
  search?: string;
  stars?: string;
  cuisineType?: string;
  minPrice?: string;
  maxPrice?: string;
  minFee?: string;
  maxFee?: string;
}

export const placeService = {
  getPlaces: async (type: PlaceType, params: PlaceListParams = {}, signal?: AbortSignal) =>
    (await apiClient.get<PlaceListResponse | PlaceUnion[]>(`/places/${type}`, { params, signal })).data,

  getPlace: async (type: PlaceType, id: string, signal?: AbortSignal) =>
    (await apiClient.get<PlaceUnion | { place: PlaceUnion }>(`/places/${type}/${encodeURIComponent(id)}`, { signal })).data,

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
