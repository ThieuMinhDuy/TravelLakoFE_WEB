import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { queryKeys as keys } from './queryKeys';

const invalidate = (client: QueryClient, queryKeys: readonly QueryKey[]) =>
  Promise.all(queryKeys.map((queryKey) => client.invalidateQueries({ queryKey })));

// Mỗi thao tác làm mới cả các màn đang dùng cùng dữ liệu, kể cả khác feature.
const reviewKeys = [
  keys.reviews.all, keys.places.all, keys.favorites.all, keys.profile,
  keys.admin.reviewsAll(), keys.admin.placesAll(), keys.admin.stats(),
];
const placeKeys = [
  ...reviewKeys, keys.trips.all,
];

export const invalidateRelated = {
  afterFavorite: (client: QueryClient) => invalidate(client, [keys.favorites.all, keys.profile]),
  afterReview: (client: QueryClient) => invalidate(client, reviewKeys),
  // Cascade xóa thành phố/địa điểm ảnh hưởng cả reviews, favorites và trips.
  afterCity: (client: QueryClient) => invalidate(client, [...placeKeys, keys.cities.all, keys.admin.cities()]),
  afterPlace: (client: QueryClient) => invalidate(client, placeKeys),
  afterUser: (client: QueryClient) => invalidate(client, [...placeKeys, keys.admin.users()]),
  afterImport: (client: QueryClient) => invalidate(client, [
    keys.cities.all, keys.places.all, keys.admin.cities(), keys.admin.placesAll(), keys.admin.stats(),
  ]),
};
