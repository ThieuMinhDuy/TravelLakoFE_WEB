import { User } from './user';

export type ReviewItemType = 'Attraction' | 'Hotel' | 'Restaurant' | 'Cafe';

export interface Review {
  _id: string;
  user: string | User;
  itemType: ReviewItemType;
  itemId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}
