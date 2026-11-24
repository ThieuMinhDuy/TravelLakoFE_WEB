import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import { exploreApi } from '../services/exploreApi';
import type { ExploreFilters } from '../types';

export const exploreKeys = {
  cities: ['explore', 'cities'] as const,
  favorites: (userId?: string) => ['explore', 'favorites', userId] as const,
  reviews: (kind: string, id: string) =>
    ['explore', 'reviews', kind, id] as const,
};
export function useCities() {
  return useQuery({
    queryKey: exploreKeys.cities,
    queryFn: ({ signal }) => exploreApi.cities(signal),
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
    queryKey: ['explore', 'places', criteria],
    queryFn: ({ signal }) => exploreApi.places(filters, signal),
    staleTime: 60_000,
    enabled,
  });
}
export function useFavorites() {
  const { isAuthenticated, user } = useAuthStore();
  return useQuery({
    queryKey: exploreKeys.favorites(user?._id),
    queryFn: ({ signal }) => exploreApi.favorites(signal),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}
