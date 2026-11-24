import type { ComponentType } from 'react';
import type { ExplorePlace } from '../types';
import { CardSkeletons, PlaceCard } from './ExploreUI';

function withSkeleton<P extends object>(Content: ComponentType<P>) {
  return function LoadingView({ loading, ...props }: P & { loading: boolean }) {
    return loading ? <CardSkeletons /> : <Content {...(props as P)} />;
  };
}
export const PlaceGrid = withSkeleton(function PlaceGridContent({
  places,
}: {
  places: ExplorePlace[];
}) {
  return (
    <div className="explore-grid explore-grid--results">
      {places.map((place) => (
        <PlaceCard place={place} key={`${place.kind}-${place._id}`} />
      ))}
    </div>
  );
});
