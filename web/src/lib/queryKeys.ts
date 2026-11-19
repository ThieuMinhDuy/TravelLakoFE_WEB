/**
 * Quy ước query key cho React Query — dùng chung để các feature invalidate cache khớp nhau.
 * Key có cấu trúc phân cấp: invalidate `queryKeys.trips.all` sẽ làm mới mọi query bắt đầu bằng ['trips'].
 */
export const queryKeys = {
  profile: ['profile'] as const,

  trips: {
    all: ['trips'] as const,
    mine: () => [...queryKeys.trips.all, 'mine'] as const,
    detail: (id: string) => [...queryKeys.trips.all, 'detail', id] as const,
  },

  favorites: {
    all: ['favorites'] as const,
    mine: () => [...queryKeys.favorites.all, 'mine'] as const,
  },

  cities: {
    all: ['cities'] as const,
    list: () => [...queryKeys.cities.all, 'list'] as const,
  },

  places: {
    all: ['places'] as const,
    search: (keyword = '', cityId = '') => [...queryKeys.places.all, 'search', keyword, cityId] as const,
  },
} as const;
