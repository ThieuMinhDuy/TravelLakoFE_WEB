import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Filter, ImageOff, Trash2 } from 'lucide-react';
import { Avatar } from '../../../../components/common/Avatar';
import { Badge } from '../../../../components/common/Badge';
import { RatingStars } from '../../../../components/common/RatingStars';
import { CardImage } from '../../../../components/cards/CardImage';
import { useLocale } from '../../../../contexts/locale/LocaleContext';
import type { AdminReview } from '../../../../types/admin';
import { PLACE_TYPE_LABELS, toPlaceType } from '../../../../utils/place';
import { cn } from '../../../../utils/cn';
import { isLowRating } from '../../utils/reviewFilters';

/** Bình luận dài hơn ngưỡng này mới có nút "Xem thêm" */
const LONG_COMMENT = 220;

interface ReviewCardProps {
  review: AdminReview;
  /** Tên thành phố của địa điểm (itemId.city chỉ là ID) */
  cityName?: string;
  selected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  /** Lọc danh sách theo địa điểm của đánh giá này; ẩn khi đang lọc theo địa điểm */
  onFilterPlace?: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  cityName,
  selected,
  onToggleSelect,
  onDelete,
  onFilterPlace,
}) => {
  const { formatDateTime } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const { user, itemId: place } = review;
  const placeType = toPlaceType(review.itemType);
  const isLong = review.comment.length > LONG_COMMENT;

  return (
    <article className={cn('admin-review glass', selected && 'admin-review--selected')}>
      <label className="admin-review__check">
        <input type="checkbox" checked={selected} onChange={onToggleSelect} />
        <span className="sr-only">Chọn đánh giá của {user?.name ?? 'người dùng đã xóa'}</span>
      </label>

      <div className="admin-review__main">
        <header className="admin-review__head">
          <Avatar src={user?.avatar} name={user?.name ?? '?'} size="sm" />
          <div className="admin-review__author">
            <span className="admin-review__name">{user?.name ?? 'Người dùng đã xóa'}</span>
            {user && <span className="admin-review__email">{user.email}</span>}
          </div>
          <time className="admin-review__date" dateTime={review.createdAt}>
            {formatDateTime(review.createdAt)}
          </time>
        </header>

        <div className="admin-review__rating">
          <RatingStars rating={review.rating} variant="full" />
          {isLowRating(review) && (
            <Badge variant="warning" size="sm">
              Đánh giá thấp
            </Badge>
          )}
        </div>

        <p className={cn('admin-review__comment', !expanded && isLong && 'admin-review__comment--clamped')}>
          {review.comment}
        </p>
        {isLong && (
          <button type="button" className="admin-link-btn admin-review__more" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Thu gọn' : 'Xem thêm'}
          </button>
        )}

        <footer className="admin-review__place">
          <CardImage
            src={place?.images?.[0]}
            alt=""
            className="admin-review__thumb"
            fallbackIcon={<ImageOff className="w-4 h-4" />}
          />
          <div className="admin-review__place-text">
            <span className="admin-review__place-name">{place?.name ?? 'Địa điểm đã xóa'}</span>
            <span className="admin-review__place-meta">
              {PLACE_TYPE_LABELS[placeType]}
              {cityName && ` · ${cityName}`}
            </span>
          </div>
          {place && (
            <div className="admin-review__place-actions">
              {onFilterPlace && (
                <button
                  type="button"
                  className="admin-icon-btn"
                  onClick={onFilterPlace}
                  aria-label={`Xem mọi đánh giá của ${place.name}`}
                  title="Xem mọi đánh giá của địa điểm này"
                >
                  <Filter />
                </button>
              )}
              <Link
                to={`/places/${placeType}/${place._id}`}
                target="_blank"
                rel="noreferrer"
                className="admin-icon-btn"
                aria-label={`Mở trang ${place.name} (tab mới)`}
                title="Mở trang địa điểm"
              >
                <ExternalLink />
              </Link>
            </div>
          )}
        </footer>
      </div>

      <button
        type="button"
        className="admin-icon-btn admin-icon-btn--danger admin-review__delete"
        onClick={onDelete}
        aria-label="Xóa đánh giá"
        title="Xóa đánh giá"
      >
        <Trash2 />
      </button>
    </article>
  );
};
