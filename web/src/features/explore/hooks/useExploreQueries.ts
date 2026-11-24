import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import { exploreApi, readList } from '../services/exploreApi';
import { cityService } from '../../../services/cityService';
import { favoriteService } from '../../../services/favoriteService';
import { queryKeys } from '../../../lib/queryKeys';
import type { City } from '../../../types/city';
import type { Favorite } from '../types';
import type { ExploreFilters } from '../types';

export function useCities() {
  return useQuery({
    queryKey: queryKeys.cities.list(),
    queryFn: cityService.getCities,
    select: (data) => readList<City>(data, 'cities'),
  });
}
export function usePlaces(filters: ExploreFilters, enabled = true) {
  const { type, search, city, minPrice, maxPrice, stars, cuisineType } =
    filters;
  const criteria = {
    type,
    search,
    city,
    minPrice,
    maxPrice,
    stars,
    cuisineType,
  };
  return useQuery({
    queryKey: queryKeys.places.filtered(criteria),
    queryFn: ({ signal }) => exploreApi.places(filters, signal),
    staleTime: 60_000,
    enabled,
  });
}
export function useFavorites() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.favorites.mine(),
    queryFn: favoriteService.getMyFavorites,
    select: (data) => readList<Favorite>(data, 'favorites'),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}
