import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ImageOff,
  MapPin,
  RefreshCw,
  Search,
  Star,
} from 'lucide-react';
import type { City } from '../../../types/city';
import type { ExplorePlace } from '../types';
import { env } from '../../../config/env';
import { KIND_LABELS, priceLabel, priceUnit } from '../utils';
import { FavoriteButton } from './FavoriteButton';
import '../explore.css';

export function ExploreFrame({ children }: { children: ReactNode }) {
  return <div className="explore">{children}</div>;
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="explore-page-heading">
      <div>
        {eyebrow && <p className="explore-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </header>
  );
}
export function Status({
  title,
  description,
  retry,
  children,
}: {
  title: string;
  description?: string;
  retry?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="explore-status" role={retry ? 'alert' : 'status'}>
      <span className="explore-status-icon">
        <Search size={26} aria-hidden="true" />
      </span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {retry && (
        <button
          type="button"
          className="explore-button explore-button--outline"
          onClick={retry}
        >
          <RefreshCw size={16} />
          Thử lại
        </button>
      )}
      {children}
    </div>
  );
}
export function Photo({
  src,
  alt,
  className = '',
  eager = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState<string>();
  let url: string | undefined;
  if (src) {
    try {
      const resolved = new URL(src, env.API_BASE_URL.replace(/\/api\/?$/, '/'));
      if (['http:', 'https:'].includes(resolved.protocol)) url = resolved.href;
    } catch {
      /* An invalid image becomes a neutral placeholder. */
    }
  }
  return url && failed !== url ? (
    <img
      src={url}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(url)}
    />
  ) : (
    <span
      className={`explore-photo-missing ${className}`}
      role="img"
      aria-label={`Chưa có ảnh: ${alt}`}
    >
      <ImageOff size={28} aria-hidden="true" />
      <span>Chưa có hình ảnh</span>
    </span>
  );
}
export function CityCard({ city }: { city: City }) {
  return (
    <Link
      className="explore-city-card"
      to={`/cities/${encodeURIComponent(city._id)}`}
    >
      <Photo src={city.image} alt={city.name} />
      <div>
        <span className="explore-eyebrow">Khám phá Việt Nam</span>
        <h3>{city.name}</h3>
        <p>
          {city.description ||
            'Tìm hiểu thành phố và các địa điểm trong khu vực.'}
        </p>
        <span className="explore-text-link">
          Khám phá <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}
export function PlaceCard({ place }: { place: ExplorePlace }) {
  return (
    <article className="explore-place-card">
      <div className="explore-place-media">
        <Link
          to={`/places/${place.kind}/${encodeURIComponent(place._id)}`}
          aria-label={`Xem ${place.name}`}
        >
          <Photo src={place.images?.[0]} alt={place.name} />
        </Link>
        <span className="explore-kind-badge">{KIND_LABELS[place.kind]}</span>
        <FavoriteButton kind={place.kind} itemId={place._id} />
      </div>
      <div className="explore-place-body">
        <p className="explore-place-location">
          <MapPin size={14} aria-hidden="true" />
          {typeof place.city === 'object' && place.city
            ? place.city.name
            : place.address || 'Chưa cập nhật địa chỉ'}
        </p>
        <h3>
          <Link to={`/places/${place.kind}/${encodeURIComponent(place._id)}`}>
            {place.name}
          </Link>
        </h3>
        <Rating value={place.rating} count={place.numReviews} />
        <p className="explore-clamp">
          {place.description || 'Xem thông tin chi tiết về địa điểm.'}
        </p>
        <div className="explore-place-price">
          <div>
            <strong>{priceLabel(place)}</strong>
            {priceUnit(place.kind, place) && <small>{priceUnit(place.kind, place)}</small>}
          </div>
          <Link
            to={`/places/${place.kind}/${encodeURIComponent(place._id)}`}
            aria-label={`Chi tiết ${place.name}`}
          >
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </article>
  );
}
export function Rating({ value, count }: { value?: number; count?: number }) {
  return (
    <span className="explore-rating">
      <Star size={15} aria-hidden="true" />
      {typeof value === 'number' &&
      Number.isFinite(value) &&
      (count ?? 0) > 0 ? (
        <>
          <strong>{value.toFixed(1)}</strong>
          <span>({count} đánh giá)</span>
        </>
      ) : (
        <span>Chưa có đánh giá</span>
      )}
    </span>
  );
}
export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => Math.max(1, Math.min(page - 2, totalPages - 4)) + i,
  );
  return (
    <nav className="explore-pagination" aria-label="Phân trang">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Trước
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-label={`Trang ${p}`}
          aria-current={page === p ? 'page' : undefined}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Sau
      </button>
    </nav>
  );
}
export function CardSkeletons() {
  return (
    <div className="explore-grid" role="status" aria-label="Đang tải dữ liệu">
      {Array.from({ length: 6 }, (_, i) => (
        <div className="explore-card-skeleton" key={i}>
          <div />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
