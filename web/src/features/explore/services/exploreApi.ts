import { placeService } from '../../../services/placeService';
import { cityService } from '../../../services/cityService';
import { favoriteService } from '../../../services/favoriteService';
import { reviewService } from '../../../services/reviewService';
import type { PlaceType, PlaceUnion } from '../../../types/place';
import type {
  ExploreFilters,
  ExplorePlace,
  ExploreReview,
} from '../types';
import { PLACE_KINDS, toItemType } from '../utils';

/** Public lists use envelopes; admin city/review lists are bare arrays in Swagger. */
export function readList<T>(data: unknown, key: string): T[] {
  const items = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && key in data
      ? (data as Record<string, unknown>)[key]
      : null;
  if (
    !Array.isArray(items) ||
    items.some(
      (item: unknown) =>
        !item ||
        typeof item !== 'object' ||
        !('_id' in item) ||
        typeof item._id !== 'string',
    )
  )
    throw new Error('Dữ liệu danh sách từ máy chủ không đúng định dạng.');
  return items as T[];
}
function readPlace(data: unknown, kind: PlaceType): ExplorePlace {
  const candidate =
    data && typeof data === 'object' && 'place' in data
      ? (data as { place: unknown }).place
      : data;
  if (
    !candidate ||
    typeof candidate !== 'object' ||
    !('_id' in candidate) ||
    typeof candidate._id !== 'string' ||
    !('name' in candidate) ||
    typeof candidate.name !== 'string'
  )
    throw new Error('Máy chủ chưa trả về thông tin địa điểm hợp lệ.');
  return { ...(candidate as PlaceUnion), kind };
}
export function placeQuery(kind: PlaceType, filters: ExploreFilters) {
  return {
    city: filters.city || undefined,
    search: filters.search || undefined,
    ...(kind === 'attraction'
      ? {
          minFee: filters.minPrice || undefined,
          maxFee: filters.maxPrice || undefined,
        }
      : {
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
        }),
    ...(kind === 'hotel' ? { stars: filters.stars || undefined } : {}),
    ...(kind === 'restaurant'
      ? { cuisineType: filters.cuisineType || undefined }
      : {}),
  };
}
export const exploreApi = {
  city: cityService.getCity,
  places: async (
    filters: ExploreFilters,
    signal?: AbortSignal,
  ): Promise<ExplorePlace[]> => {
    // No page/limit contract exists: fetch filtered lists, paginate the complete result locally.
    const kinds = filters.type === 'all' ? PLACE_KINDS : [filters.type];
    const lists = await Promise.all(
      kinds.map(async (kind) => {
        const data = await placeService.getPlaces(kind, placeQuery(kind, filters), signal);
        return readList<PlaceUnion>(data, 'places').map((place) => ({
          ...place,
          kind,
        }));
      }),
    );
    return lists.flat();
  },
  place: async (kind: PlaceType, id: string, signal?: AbortSignal) =>
    readPlace(await placeService.getPlace(kind, id, signal), kind),
  reviews: async (kind: PlaceType, id: string, signal?: AbortSignal) =>
    readList<ExploreReview>(await reviewService.getForPlace(toItemType(kind), id, signal), 'reviews'),
  addReview: (kind: PlaceType, itemId: string, rating: number, comment: string) =>
    reviewService.addReview({ itemType: toItemType(kind), itemId, rating, comment }),
  deleteReview: reviewService.deleteMyReview,
  addFavorite: (kind: PlaceType, itemId: string) =>
    favoriteService.addFavorite({ itemType: toItemType(kind), itemId }),
  deleteFavorite: favoriteService.removeFavorite,
};
