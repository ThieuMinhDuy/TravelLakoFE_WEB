import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarDays, MapPin, Map as MapIcon, PenLine, Wallet } from 'lucide-react';
import { useLocale } from '../../contexts/locale/LocaleContext';
import { cn } from '../../utils/cn';
import { getCityName, isPopulatedCity } from '../../utils/place';
import { TRIP_STATUS_LABELS, getTripDays, getTripPlaceCount, hasTripDiary } from '../../utils/trip';
import type { TripStatus, TripWithCity } from '../../types/trip';
import { CardImage } from './CardImage';
import './css/Cards.css';

export interface TripCardProps {
  trip: TripWithCity;
  status: TripStatus;
  /** Đường dẫn khi bấm thẻ (mặc định: trang chi tiết chuyến đi) */
  to?: string;
  /** Hiển thị trạng thái & nút mở nhanh Nhật ký (mặc định bật cho chuyến đã đi) */
  showDiaryAction?: boolean;
  className?: string;
}

/** Thẻ chuyến đi: ảnh thành phố, trạng thái, thời gian, số điểm đến, ngân sách */
export const TripCard: React.FC<TripCardProps> = ({
  trip,
  status,
  to = `/trips/${trip._id}`,
  showDiaryAction = status === 'past',
  className,
}) => {
  const { formatCurrency, formatDate } = useLocale();
  const cityName = getCityName(trip.city);
  const image = isPopulatedCity(trip.city) ? trip.city.image : undefined;
  const days = getTripDays(trip);
  const placeCount = getTripPlaceCount(trip);
  const hasDiary = hasTripDiary(trip);
  const photoCount = trip.diary?.photos?.length ?? 0;

  return (
    <article className={cn('card trip-card', className)}>
      <div className="card__media">
        <CardImage src={image} alt={cityName} className="card__img" fallbackIcon={<MapIcon className="w-8 h-8" />} />
        <span className={cn('card__badge', `trip-card__status--${status}`)}>{TRIP_STATUS_LABELS[status]}</span>
      </div>

      <div className="card__body">
        <h3 className="card__title">
          <Link to={to} className="card__link">
            {trip.title}
          </Link>
        </h3>
        <div className="card__meta card__meta--stack">
          {cityName && (
            <span className="card__meta-item">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              {cityName}
            </span>
          )}
          <span className="card__meta-item">
            <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
            {formatDate(trip.startDate)} – {formatDate(trip.endDate)} · {days} ngày
          </span>
        </div>
        <div className="trip-card__footer">
          <span className="card__meta-item">
            <MapIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {placeCount} điểm đến
          </span>
          {trip.budget > 0 && (
            <span className="card__meta-item trip-card__budget">
              <Wallet className="w-3.5 h-3.5" aria-hidden="true" />
              {formatCurrency(trip.budget)}
            </span>
          )}
        </div>

        {showDiaryAction && (
          <div className="trip-card__diary-row">
            <span className={cn('trip-card__diary-badge', hasDiary && 'trip-card__diary-badge--written')}>
              {hasDiary ? (photoCount > 0 ? `Đã viết · ${photoCount} ảnh` : 'Đã viết nhật ký') : 'Chưa viết nhật ký'}
            </span>
            <Link to={`/trips/${trip._id}/diary`} className="trip-card__diary-link">
              {hasDiary ? (
                <>
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  Xem nhật ký
                </>
              ) : (
                <>
                  <PenLine className="w-3.5 h-3.5" aria-hidden="true" />
                  Viết nhật ký
                </>
              )}
            </Link>
          </div>
        )}
      </div>
    </article>
  );
};
