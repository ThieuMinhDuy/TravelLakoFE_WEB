import { apiClient } from './apiClient';
import type { MessageResponse } from '../types/api';
import type { MyReviewListResponse, Review } from '../types/review';
import type { ItemType } from '../types/place';

export const reviewService = {
  getForPlace: async (itemType: ItemType, itemId: string, signal?: AbortSignal) =>
    (await apiClient.get<Review[] | { total: number; reviews: Review[] }>(
      `/reviews/${itemType}/${encodeURIComponent(itemId)}`, { signal },
    )).data,

  addReview: async (data: { itemType: ItemType; itemId: string; rating: number; comment: string }) => {
    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5 || !data.comment.trim()) {
      throw new Error('Hãy chọn từ 1 đến 5 sao và nhập nội dung đánh giá.');
    }
    return (await apiClient.post<Review>('/reviews', { ...data, comment: data.comment.trim() })).data;
  },

  /** GET /api/reviews/me — đánh giá của tôi, mới nhất trước */
  getMyReviews: async (): Promise<MyReviewListResponse> => {
    const res = await apiClient.get<MyReviewListResponse>('/reviews/me');
    return res.data;
  },

  /** DELETE /api/reviews/:id — chỉ xóa được đánh giá của chính mình (khác chủ → 403) */
  deleteMyReview: async (reviewId: string): Promise<MessageResponse> => {
    const res = await apiClient.delete<MessageResponse>(`/reviews/${reviewId}`);
    return res.data;
  },
};
