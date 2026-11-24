import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, MapPin } from 'lucide-react';
import { exploreApi } from '../services/exploreApi';
import {
  CardSkeletons,
  ExploreFrame,
  Photo,
  PlaceCard,
  Status,
} from '../components/ExploreUI';
import { messageOf, parseFilters } from '../utils';
import { usePlaces } from '../hooks/useExploreQueries';

export function CityDetailPage() {
  const { id = '' } = useParams();
  const query = useQuery({
    queryKey: ['explore', 'city', id],
    queryFn: ({ signal }) => exploreApi.city(id, signal),
    enabled: !!id,
  });
  const filters = parseFilters(new URLSearchParams({ city: id }));
  const places = usePlaces(filters, query.isSuccess && !!query.data?._id);
  if (query.isPending)
    return (
      <ExploreFrame>
        <div className="explore-container">
          <CardSkeletons />
        </div>
      </ExploreFrame>
    );
  if (query.isError || !query.data?._id)
    return (
      <ExploreFrame>
        <div className="explore-container">
          <Status
            title="Chưa xem được thành phố này"
            description={messageOf(query.error)}
            retry={() => void query.refetch()}
          />
          <Link to="/cities" className="explore-text-link">
            ← Về danh sách thành phố
          </Link>
        </div>
      </ExploreFrame>
    );
  const city = query.data;
  return (
    <ExploreFrame>
      <div className="explore-city-hero">
        <Photo src={city.image} alt={city.name} eager />
        <div>
          <p className="explore-eyebrow">Khám phá Việt Nam</p>
          <h1>{city.name}</h1>
          <span>
            <MapPin size={16} /> Một điểm đến, nhiều trải nghiệm
          </span>
        </div>
      </div>
      <div className="explore-container">
        <nav className="explore-breadcrumb" aria-label="Đường dẫn">
          <Link to="/cities">Thành phố</Link>
          <span>/</span>
          <span>{city.name}</span>
        </nav>
        <section className="explore-city-intro">
          <h2>Xin chào, {city.name}!</h2>
          <p>
            {city.description ||
              'Thông tin giới thiệu thành phố đang được cập nhật.'}
          </p>
        </section>
        <section className="explore-section">
          <div className="explore-section-heading">
            <div>
              <p className="explore-eyebrow">Lưu lại những nơi muốn đến</p>
              <h2>Khám phá quanh {city.name}</h2>
            </div>
            <Link
              className="explore-text-link"
              to={`/places?city=${encodeURIComponent(id)}`}
            >
              Xem tất cả <ArrowRight size={17} />
            </Link>
          </div>
          {places.isPending ? (
            <CardSkeletons />
          ) : places.isError ? (
            <Status
              title="Chưa tải được địa điểm"
              description={messageOf(places.error)}
              retry={() => void places.refetch()}
            />
          ) : places.data.length ? (
            <div className="explore-grid">
              {places.data.slice(0, 6).map((p) => (
                <PlaceCard key={`${p.kind}-${p._id}`} place={p} />
              ))}
            </div>
          ) : (
            <Status
              title="Các địa điểm đang được cập nhật"
              description={`Hiện chưa có địa điểm để khám phá tại ${city.name}.`}
            />
          )}
        </section>
      </div>
    </ExploreFrame>
  );
}
