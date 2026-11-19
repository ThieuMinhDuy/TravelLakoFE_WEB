import React, { useMemo } from 'react';
import { MapPinned } from 'lucide-react';
import { CityCard } from '../../../../components/cards/CityCard';
import { Skeleton } from '../../../../components/common/Skeleton';
import { useCities, useMyTrips } from '../../hooks/useProfileData';
import { MAX_CITIES, pickCitiesToExplore } from '../../utils/explore';

/** "Điểm đến phổ biến" — thành phố có thật trong hệ thống, lối tắt tới từng loại địa điểm */
export const PopularCitiesSection: React.FC = () => {
  const cities = useCities();
  const trips = useMyTrips();

  const picked = useMemo(
    () => (cities.data ? pickCitiesToExplore(cities.data.cities, trips.data) : []),
    [cities.data, trips.data]
  );

  if (cities.isError || (cities.isSuccess && picked.length === 0)) return null;

  return (
    <section className="profile-section" aria-labelledby="popular-cities-title">
      <header className="profile-section__header profile-section__header--center">
        <h2 id="popular-cities-title" className="profile-section__title">
          <MapPinned className="profile-section__title-icon" aria-hidden="true" />
          Điểm đến phổ biến
        </h2>
        <p className="profile-section__desc">Khám phá thêm những vùng đất bạn chưa ghé qua.</p>
      </header>

      <div className="card-grid">
        {cities.isPending
          ? Array.from({ length: MAX_CITIES }, (_, i) => <Skeleton key={i} className="city-card__skeleton" />)
          : picked.map((city) => <CityCard key={city._id} city={city} />)}
      </div>
    </section>
  );
};
