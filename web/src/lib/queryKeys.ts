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

  reviews: {
    all: ['reviews'] as const,
    mine: () => [...queryKeys.reviews.all, 'mine'] as const,
  },

  cities: {
    all: ['cities'] as const,
    list: () => [...queryKeys.cities.all, 'list'] as const,
  },

  places: {
    all: ['places'] as const,
    search: (keyword = '', cityId = '') => [...queryKeys.places.all, 'search', keyword, cityId] as const,
  },

  /** Dữ liệu trang quản trị — tách riêng với key công khai vì API và quyền khác nhau */
  admin: {
    all: ['admin'] as const,
    stats: () => [...queryKeys.admin.all, 'stats'] as const,
    users: () => [...queryKeys.admin.all, 'users'] as const,
    cities: () => [...queryKeys.admin.all, 'cities'] as const,
    placesAll: () => [...queryKeys.admin.all, 'places'] as const,
    places: (type: string, cityId = '') => [...queryKeys.admin.placesAll(), type, cityId] as const,
    reviewsAll: () => [...queryKeys.admin.all, 'reviews'] as const,
    reviews: (filters: object = {}) => [...queryKeys.admin.reviewsAll(), filters] as const,
    vietnamCities: () => [...queryKeys.admin.all, 'vietnam-cities'] as const,
  },
} as const;
