import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';
import './css/RatingStars.css';

export interface RatingStarsProps {
  /** Điểm 0–5 */
  rating?: number;
  /** Số lượt đánh giá, hiển thị trong ngoặc */
  count?: number;
  /** compact: chỉ 1 sao + điểm số (dùng trong thẻ); full: 5 sao */
  variant?: 'compact' | 'full';
  className?: string;
}

/** Hiển thị điểm đánh giá (chỉ đọc) */
export const RatingStars: React.FC<RatingStarsProps> = ({ rating = 0, count, variant = 'compact', className }) => {
  const value = Math.max(0, Math.min(5, rating));
  const label = `Đánh giá ${value.toFixed(1)} trên 5${count !== undefined ? `, ${count} lượt` : ''}`;

  return (
    <span className={cn('ui-rating', className)} role="img" aria-label={label}>
      {variant === 'full' ? (
        Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            aria-hidden="true"
            className={cn('ui-rating__star', i < Math.round(value) && 'ui-rating__star--filled')}
          />
        ))
      ) : (
        <Star aria-hidden="true" className="ui-rating__star ui-rating__star--filled" />
      )}
      <span className="ui-rating__value" aria-hidden="true">
        {value > 0 ? value.toFixed(1) : 'Mới'}
      </span>
      {count !== undefined && (
        <span className="ui-rating__count" aria-hidden="true">
          ({count})
        </span>
      )}
    </span>
  );
};
