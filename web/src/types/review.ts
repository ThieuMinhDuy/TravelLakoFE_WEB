import { User } from './user';
import type { ItemType } from './place';

/** @deprecated dùng `ItemType` trong ./place */
export type ReviewItemType = ItemType;

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
