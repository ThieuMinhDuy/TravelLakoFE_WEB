import { lazy, Suspense, useEffect } from 'react';
import { ExploreLoading } from './components/ExploreLoading';
import './explore.css';

const pages = {
  home: lazy(() =>
    import('./pages/ExploreHomePage').then((m) => ({
      default: m.ExploreHomePage,
    })),
  ),
  cities: lazy(() =>
    import('./pages/CitiesPage').then((m) => ({ default: m.CitiesPage })),
  ),
  city: lazy(() =>
    import('./pages/CityDetailPage').then((m) => ({
      default: m.CityDetailPage,
    })),
  ),
  places: lazy(() =>
    import('./pages/PlacesPage').then((m) => ({ default: m.PlacesPage })),
  ),
  place: lazy(() =>
    import('./pages/PlaceDetailPage').then((m) => ({
      default: m.PlaceDetailPage,
    })),
  ),
  favorites: lazy(() =>
    import('./pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage })),
  ),
};
const titles: Record<keyof typeof pages, string> = {
  home: 'Khám phá Việt Nam',
  cities: 'Thành phố',
  city: 'Khám phá thành phố',
  places: 'Địa điểm',
  place: 'Chi tiết địa điểm',
  favorites: 'Địa điểm yêu thích',
};
export function ExplorePage({ page }: { page: keyof typeof pages }) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${titles[page]} | TripMate`;
    return () => {
      document.title = previous;
    };
  }, [page]);
  const Page = pages[page];
  return (
    <Suspense fallback={<ExploreLoading />}>
      <Page />
    </Suspense>
  );
}
