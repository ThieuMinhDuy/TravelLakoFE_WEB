import type { PlaceType, PlaceUnion } from '../../types/place';
import type { ReviewItemType } from '../../types/review';

export type ExplorePlace = PlaceUnion & { kind: PlaceType };
export interface ExploreFilters {
  type: PlaceType | 'all';
  search: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  stars: string;
  cuisineType: string;
  page: number;
}
export interface Favorite {
  _id: string;
  itemType: ReviewItemType;
  itemId: PlaceUnion | string | null;
}
export interface ExploreReview {
  _id: string;
  user: string | { _id?: string; name?: string; avatar?: string } | null;
  itemType: ReviewItemType;
  itemId: string | { _id: string; name?: string } | null;
  rating: number;
  comment?: string;
  createdAt?: string;
}
