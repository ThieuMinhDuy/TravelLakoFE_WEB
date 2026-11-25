import { lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, MapPin, Star } from 'lucide-react';
import { exploreApi } from '../services/exploreApi';
import { queryKeys } from '../../../lib/queryKeys';
import {
  CardSkeletons,
  ExploreFrame,
  Rating,
  Status,
} from '../components/ExploreUI';
import { FavoriteButton } from '../components/FavoriteButton';
import { PlaceGallery } from '../components/PlaceGallery';
import { ReviewSection } from '../components/ReviewSection';
import {
  isPlaceKind,
  KIND_LABELS,
  messageOf,
  priceLabel,
  priceUnit,
  validCoordinates,
} from '../utils';

const PlaceMap = lazy(() => import('../components/PlaceMap'));
export function PlaceDetailPage() {
  const { type = '', id = '' } = useParams();
  const valid = isPlaceKind(type);
  const kind = valid ? type : 'attraction';
  const query = useQuery({
    queryKey: queryKeys.places.detail(kind, id),
    queryFn: ({ signal }) => exploreApi.place(kind, id, signal),
    enabled: valid && !!id,
  });
  if (!valid)
    return (
      <ExploreFrame>
        <div className="explore-container">
          <Status title="Loại địa điểm không hợp lệ" />
          <Link to="/places" className="explore-text-link">
            ← Về trang khám phá
          </Link>
        </div>
      </ExploreFrame>
    );
  if (query.isPending)
    return (
      <ExploreFrame>
        <div className="explore-container">
          <CardSkeletons />
        </div>
      </ExploreFrame>
    );
  if (query.isError || !query.data)
    return (
      <ExploreFrame>
        <div className="explore-container">
          <Status
            title="Chưa xem được địa điểm này"
            description={messageOf(query.error)}
            retry={() => void query.refetch()}
          />
          <Link to="/places" className="explore-text-link">
            ← Tìm một địa điểm khác
          </Link>
        </div>
      </ExploreFrame>
    );
  const place = query.data;
  const coordinates = validCoordinates(place.coordinates)
    ? place.coordinates
    : null;
  return (
    <ExploreFrame>
      <div className="explore-container">
        <nav className="explore-breadcrumb" aria-label="Đường dẫn">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to={`/places?type=${kind}`}>{KIND_LABELS[kind]}</Link>
          <span>/</span>
          <span>{place.name}</span>
        </nav>
        <div className="explore-detail-heading">
          <div>
            <p className="explore-eyebrow">{KIND_LABELS[kind]}</p>
            <h1>{place.name}</h1>
            <div className="explore-detail-meta">
              <Rating value={place.rating} count={place.numReviews} />
              {place.address && (
                <span>
                  <MapPin size={16} />
                  {place.address}
                </span>
              )}
            </div>
          </div>
          <FavoriteButton kind={kind} itemId={id} withLabel />
        </div>
        <div className="explore-detail-layout">
          <div>
            <PlaceGallery key={id} images={place.images} name={place.name} />
            <section className="explore-section explore-description">
              <p className="explore-eyebrow">Tìm hiểu trước khi đến</p>
              <h2>Về {place.name}</h2>
              <p>
                {place.description ||
                  'Thông tin giới thiệu địa điểm đang được cập nhật.'}
              </p>
              {kind === 'restaurant' &&
                'cuisineType' in place &&
                place.cuisineType && (
                  <p>
                    <strong>Loại ẩm thực:</strong> {place.cuisineType}
                  </p>
                )}
              {kind === 'hotel' && 'stars' in place && place.stars && (
                <p className="explore-rating">
                  <Star size={16} /> Khách sạn {place.stars} sao
                </p>
              )}
            </section>
            <ReviewSection key={`${kind}-${id}`} kind={kind} itemId={id} />
          </div>
          <aside className="explore-detail-sidebar">
            <div className="explore-detail-summary">
              <span className="explore-eyebrow">
                {kind === 'hotel'
                  ? 'Giá phòng tham khảo'
                  : kind === 'attraction'
                    ? 'Giá vé tham khảo'
                    : 'Chi phí tham khảo'}
              </span>
              <strong>{priceLabel(place)}</strong>
              {priceUnit(kind, place) && <small>{priceUnit(kind, place)}</small>}
              <p>
                Mức giá tham khảo do địa điểm cung cấp. Chi phí thực tế có thể
                thay đổi.
              </p>
              <FavoriteButton kind={kind} itemId={id} withLabel />
              <a href="#reviews" className="explore-text-link">
                Đọc trải nghiệm từ cộng đồng →
              </a>
            </div>
            <section className="explore-location">
              <h2>Vị trí địa điểm</h2>
              {place.address && (
                <p>
                  <MapPin size={16} />
                  {place.address}
                </p>
              )}
              {coordinates ? (
                <>
                  <Suspense
                    fallback={
                      <div className="explore-map-placeholder" role="status">
                        Đang tải bản đồ…
                      </div>
                    }
                  >
                    <PlaceMap
                      key={`${coordinates.lat},${coordinates.lng}`}
                      {...coordinates}
                      name={place.name}
                    />
                  </Suspense>
                  <a
                    className="explore-text-link"
                    href={`https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lng}#map=16/${coordinates.lat}/${coordinates.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Mở bản đồ <ExternalLink size={14} />
                  </a>
                </>
              ) : (
                <p className="explore-muted">
                  Địa điểm chưa cập nhật tọa độ bản đồ.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </ExploreFrame>
  );
}
