import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Heart, Hotel, Landmark, MapPin, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { RatingStars } from '../common/RatingStars';
import { useLocale } from '../../contexts/locale/LocaleContext';
import { cn } from '../../utils/cn';
import { PLACE_TYPE_LABELS, getCityName, getPlacePrice } from '../../utils/place';
import type { PlaceType, PlaceUnion } from '../../types/place';
import './css/Cards.css';

const TYPE_ICONS: Record<PlaceType, LucideIcon> = {
  hotel: Hotel,
  attraction: Landmark,
  restaurant: UtensilsCrossed,
  cafe: Coffee,
};

export interface PlaceCardProps {
  place: PlaceUnion;
  type: PlaceType;
  /** Đường dẫn khi bấm thẻ (mặc định: trang chi tiết địa điểm) */
  to?: string;
  /** Có truyền → hiện nút trái tim */
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  /** Dòng nổi bật nhỏ, vd lý do gợi ý "Hợp sở thích Ẩm thực" */
  highlight?: string;
  className?: string;
}

/** Thẻ địa điểm: ảnh, loại, tên, thành phố, đánh giá, giá tham khảo */
export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  type,
  to = `/places/${type}/${place._id}`,
  onToggleFavorite,
  isFavorite = false,
  highlight,
  className,
}) => {
  const { formatCurrency } = useLocale();
  const Icon = TYPE_ICONS[type];
  const price = getPlacePrice(place, type);
  const cityName = getCityName(place.city);
  const image = place.images?.[0];

  return (
    <article className={cn('card place-card', className)}>
      <div className="card__media">
        {image ? (
          <img src={image} alt={place.name} loading="lazy" decoding="async" className="card__img" />
        ) : (
          <div className="card__img card__img--placeholder" aria-hidden="true">
            <Icon className="w-8 h-8" />
          </div>
        )}
        <span className="card__badge">
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          {PLACE_TYPE_LABELS[type]}
        </span>
        {onToggleFavorite && (
          <button
            type="button"
            className={cn('card__fav-btn', isFavorite && 'card__fav-btn--active')}
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Bỏ ${place.name} khỏi yêu thích` : `Thêm ${place.name} vào yêu thích`}
          >
            <Heart className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="card__body">
        {highlight && <p className="card__highlight">{highlight}</p>}
        <h3 className="card__title">
          {/* Link phủ cả thẻ (::after) để bấm vào đâu cũng mở chi tiết, nút tim vẫn bấm riêng được */}
          <Link to={to} className="card__link">
            {place.name}
          </Link>
        </h3>
        <div className="card__meta">
          <RatingStars rating={place.rating} count={place.numReviews} />
          {cityName && (
            <span className="card__meta-item">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              {cityName}
            </span>
          )}
        </div>
        <p className="card__price">
          {price ? (
            <>
              <strong>{formatCurrency(price.amount)}</strong>
              <span>{price.unit}</span>
            </>
          ) : (
            <span>Giá: đang cập nhật</span>
          )}
        </p>
      </div>
    </article>
  );
};
