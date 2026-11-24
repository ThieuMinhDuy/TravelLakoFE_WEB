import { apiClient } from './apiClient';
import type { MessageResponse } from '../types/api';
import type { FavoriteListResponse } from '../types/favorite';
import type { ItemType } from '../types/place';

export const favoriteService = {
  /** GET /api/favorites — danh sách yêu thích (địa điểm đã populate kèm tên thành phố) */
  getMyFavorites: async ({ signal }: { signal?: AbortSignal } = {}): Promise<FavoriteListResponse> => {
    const res = await apiClient.get<FavoriteListResponse>('/favorites', { signal });
    return res.data;
  },

  /** POST /api/favorites — lưu một địa điểm vào yêu thích */
  addFavorite: async (data: { itemType: ItemType; itemId: string }): Promise<MessageResponse> => {
    const res = await apiClient.post<MessageResponse>('/favorites', data);
    return res.data;
  },

  /** DELETE /api/favorites/:id — `id` là _id của bản ghi yêu thích, không phải của địa điểm */
  removeFavorite: async (favoriteId: string): Promise<MessageResponse> => {
    const res = await apiClient.delete<MessageResponse>(`/favorites/${favoriteId}`);
    return res.data;
  },
};
