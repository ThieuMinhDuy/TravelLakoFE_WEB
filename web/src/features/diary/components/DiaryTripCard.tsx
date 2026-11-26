import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarDays, Camera, MapPin, PenLine } from 'lucide-react';
import { CardImage } from '../../../components/cards/CardImage';
import { buttonVariants } from '../../../components/common/buttonVariants';
import { useLocale } from '../../../contexts/locale/LocaleContext';
import type { TripWithCity } from '../../../types/trip';
import { getCityName, isPopulatedCity } from '../../../utils/place';
import { getTripDays } from '../../../utils/trip';
import { DIARY_MAX_PHOTOS, hasDiaryContent } from '../utils/diaryHelpers';

export interface DiaryTripCardProps {
  trip: TripWithCity;
}

const PREVIEW_THUMB_LIMIT = 4;

/** Thẻ chuyến đi đã hoàn thành trong trang danh sách Nhật ký (/diary) */
export const DiaryTripCard: React.FC<DiaryTripCardProps> = ({ trip }) => {
  const { formatDate } = useLocale();
  const cityName = getCityName(trip.city);
  const cityImage = isPopulatedCity(trip.city) ? trip.city.image : undefined;
  const photos = trip.diary?.photos ?? [];
  const notes = trip.diary?.notes?.trim() ?? '';
  const written = hasDiaryContent(trip);
  const coverImage = photos[0] || cityImage;
  const days = getTripDays(trip);
  const detailPath = `/trips/${trip._id}/diary`;

  const previewPhotos = photos.slice(0, PREVIEW_THUMB_LIMIT);
  const extraCount = Math.max(0, photos.length - PREVIEW_THUMB_LIMIT);

  return (
    <article className="card diary-card">
      <div className="card__media">
        <Link to={detailPath} className="block w-full h-full" aria-label={`Mở nhật ký ${trip.title}`}>
          <CardImage
            src={coverImage}
            alt={trip.title}
            className="card__img"
            fallbackIcon={<BookOpen className="w-8 h-8" />}
          />
        </Link>
        <span
          className={`card__badge ${written ? 'diary-card__status--written' : 'diary-card__status--empty'}`}
        >
          {written ? 'Đã viết' : 'Chưa viết'}
        </span>
        <span className="diary-card__photo-badge">
          <Camera className="w-3.5 h-3.5" aria-hidden="true" />
          {photos.length}/{DIARY_MAX_PHOTOS}
        </span>
      </div>

      <div className="card__body">
        <h3 className="card__title">
          <Link to={detailPath} className="diary-card__title-link">
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

        <p className={`diary-card__excerpt ${notes ? '' : 'diary-card__excerpt--empty'}`}>
          {notes || 'Chưa có ghi chép cảm nhận cho chuyến đi này.'}
        </p>

        {previewPhotos.length > 0 && (
          <div className="diary-card__thumbs" aria-label="Xem trước ảnh kỷ niệm">
            {previewPhotos.map((url, idx) => {
              const showMore = extraCount > 0 && idx === PREVIEW_THUMB_LIMIT - 1;
              return (
                <div key={`${url}-${idx}`} className="diary-card__thumb">
                  <img src={url} alt="" loading="lazy" />
                  {showMore && <span className="diary-card__thumb-more">+{extraCount}</span>}
                </div>
              );
            })}
          </div>
        )}

        <div className="diary-card__footer">
          <Link
            to={detailPath}
            className={buttonVariants({
              variant: written ? 'outline' : 'primary',
              size: 'sm',
            })}
          >
            <PenLine className="w-3.5 h-3.5" aria-hidden="true" />
            {written ? 'Xem & sửa' : 'Viết nhật ký'}
          </Link>
          <Link to={`/trips/${trip._id}`} className="diary-card__schedule-link">
            Xem lịch trình
          </Link>
        </div>
      </div>
    </article>
  );
};

