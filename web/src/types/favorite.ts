import type { ItemType, PlaceUnion } from './place';

export interface Favorite {
  _id: string;
  user: string;
  itemType: ItemType;
  /** Địa điểm đã populate (kèm `city.name`) */
  itemId: PlaceUnion;
  createdAt?: string;
}

/** GET /api/favorites */
export interface FavoriteListResponse {
  total: number;
  favorites: Favorite[];
}
