import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Map as MapIcon, Wallet } from 'lucide-react';
import { useLocale } from '../../contexts/locale/LocaleContext';
import { cn } from '../../utils/cn';
import { getCityName, isPopulatedCity } from '../../utils/place';
import { TRIP_STATUS_LABELS, getTripDays, getTripPlaceCount } from '../../utils/trip';
import type { Trip, TripStatus } from '../../types/trip';
import './css/Cards.css';

export interface TripCardProps {
  trip: Trip;
  status: TripStatus;
  /** Đường dẫn khi bấm thẻ (mặc định: trang chi tiết chuyến đi) */
  to?: string;
  className?: string;
}

/** Thẻ chuyến đi: ảnh thành phố, trạng thái, thời gian, số điểm đến, ngân sách */
export const TripCard: React.FC<TripCardProps> = ({ trip, status, to = `/trips/${trip._id}`, className }) => {
  const { formatCurrency, formatDate } = useLocale();
  const cityName = getCityName(trip.city);
  const image = isPopulatedCity(trip.city) ? trip.city.image : undefined;
  const days = getTripDays(trip);
  const placeCount = getTripPlaceCount(trip);

  return (
    <article className={cn('card trip-card', className)}>
      <div className="card__media">
        {image ? (
          <img src={image} alt={cityName} loading="lazy" decoding="async" className="card__img" />
        ) : (
          <div className="card__img card__img--placeholder" aria-hidden="true">
            <MapIcon className="w-8 h-8" />
          </div>
        )}
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
      </div>
    </article>
  );
};
