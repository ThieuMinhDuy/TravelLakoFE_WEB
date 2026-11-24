import { apiClient } from '../../../services/apiClient';
import type { City } from '../../../types/city';
import type { PlaceType, PlaceUnion } from '../../../types/place';
import type {
  CityPayload,
  ExploreFilters,
  ExplorePlace,
  ExploreReview,
  Favorite,
  PlacePayload,
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
  cities: async (signal?: AbortSignal) =>
    readList<City>((await apiClient.get('/cities', { signal })).data, 'cities'),
  city: async (id: string, signal?: AbortSignal): Promise<City> =>
    (await apiClient.get(`/cities/${encodeURIComponent(id)}`, { signal })).data,
  places: async (
    filters: ExploreFilters,
    signal?: AbortSignal,
  ): Promise<ExplorePlace[]> => {
    // No page/limit contract exists: fetch filtered lists, paginate the complete result locally.
    const kinds = filters.type === 'all' ? PLACE_KINDS : [filters.type];
    const lists = await Promise.all(
      kinds.map(async (kind) => {
        const { data } = await apiClient.get(`/places/${kind}`, {
          params: placeQuery(kind, filters),
          signal,
        });
        return readList<PlaceUnion>(data, 'places').map((place) => ({
          ...place,
          kind,
        }));
      }),
    );
    return lists.flat();
  },
  place: async (kind: PlaceType, id: string, signal?: AbortSignal) =>
    readPlace(
      (
        await apiClient.get(`/places/${kind}/${encodeURIComponent(id)}`, {
          signal,
        })
      ).data,
      kind,
    ),
  reviews: async (kind: PlaceType, id: string, signal?: AbortSignal) =>
    readList<ExploreReview>(
      (
        await apiClient.get(
          `/reviews/${toItemType(kind)}/${encodeURIComponent(id)}`,
          { signal },
        )
      ).data,
      'reviews',
    ),
  addReview: async (
    kind: PlaceType,
    itemId: string,
    rating: number,
    comment: string,
  ) => {
    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      !comment.trim()
    )
      throw new Error('Hãy chọn từ 1 đến 5 sao và nhập nội dung đánh giá.');
    return (
      await apiClient.post('/reviews', {
        itemType: toItemType(kind),
        itemId,
        rating,
        comment: comment.trim(),
      })
    ).data;
  },
  deleteReview: async (id: string) =>
    apiClient.delete(`/reviews/${encodeURIComponent(id)}`),
  favorites: async (signal?: AbortSignal) =>
    readList<Favorite>(
      (await apiClient.get('/favorites', { signal })).data,
      'favorites',
    ),
  addFavorite: async (kind: PlaceType, itemId: string) =>
    apiClient.post('/favorites', { itemType: toItemType(kind), itemId }),
  deleteFavorite: async (favoriteId: string) =>
    apiClient.delete(`/favorites/${encodeURIComponent(favoriteId)}`),
};

// Isolated content API; does not change Hoang's shared admin/auth implementation.
export const exploreAdminApi = {
  cities: async () =>
    readList<City>((await apiClient.get('/admin/cities')).data, 'cities'),
  saveCity: async (payload: CityPayload, id?: string) =>
    id
      ? apiClient.put(`/admin/cities/${encodeURIComponent(id)}`, payload)
      : apiClient.post('/admin/cities', payload),
  deleteCity: async (id: string) =>
    apiClient.delete(`/admin/cities/${encodeURIComponent(id)}`),
  places: async (kind: PlaceType, city?: string) =>
    readList<PlaceUnion>(
      (
        await apiClient.get(`/admin/places/${kind}`, {
          params: { city: city || undefined },
        })
      ).data,
      'places',
    ).map((place) => ({ ...place, kind })),
  savePlace: async (kind: PlaceType, payload: PlacePayload, id?: string) =>
    id
      ? apiClient.put(
          `/admin/places/${kind}/${encodeURIComponent(id)}`,
          payload,
        )
      : apiClient.post(`/admin/places/${kind}`, payload),
  deletePlace: async (kind: PlaceType, id: string) =>
    apiClient.delete(`/admin/places/${kind}/${encodeURIComponent(id)}`),
  reviews: async (city?: string, kind?: PlaceType) =>
    readList<ExploreReview>(
      (
        await apiClient.get('/admin/reviews', {
          params: {
            city: city || undefined,
            itemType: kind ? toItemType(kind) : undefined,
          },
        })
      ).data,
      'reviews',
    ),
  deleteReview: async (id: string) =>
    apiClient.delete(`/admin/reviews/${encodeURIComponent(id)}`),
};
