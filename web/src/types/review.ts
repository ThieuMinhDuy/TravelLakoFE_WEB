import { User } from './user';
import type { ItemType } from './place';

/** @deprecated dùng `ItemType` trong ./place */
export type ReviewItemType = ItemType;

import type { BasePlace } from './place';

/** Một đánh giá trong GET /api/reviews/me — địa điểm đã populate (kèm tên thành phố) */
export interface MyReview {
  _id: string;
  rating: number;
  comment: string;
  itemType: ItemType;
  itemId: Pick<BasePlace, '_id' | 'name' | 'images' | 'address' | 'rating' | 'city'>;
  createdAt: string;
}

export interface MyReviewListResponse {
  total: number;
  reviews: MyReview[];
}

export interface Review {
  _id: string;
  user: string | User;
  itemType: ReviewItemType;
  itemId: string;
  rating: number;
  /** Backend bắt buộc có bình luận */
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}
