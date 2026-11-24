import { apiClient } from './apiClient';
import type { MessageResponse } from '../types/api';
import type { MyReviewListResponse } from '../types/review';

export const reviewService = {
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
