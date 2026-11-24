import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, MapPin, MessageSquare, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../../../../components/compound/ConfirmDialog';
import { EmptyState } from '../../../../components/common/EmptyState';
import { Pagination } from '../../../../components/common/Pagination';
import { RatingStars } from '../../../../components/common/RatingStars';
import { Skeleton } from '../../../../components/common/Skeleton';
import { buttonVariants } from '../../../../components/common/buttonVariants';
import { useLocale } from '../../../../contexts/locale/LocaleContext';
import { usePagination } from '../../../../hooks/usePagination';
import { PLACE_TYPE_LABELS, getCityName, toPlaceType } from '../../../../utils/place';
import type { MyReview } from '../../../../types/review';
import { useDeleteReview, useMyReviews } from '../../hooks/useProfileData';
import { TabError } from './TabError';

const PAGE_SIZE = 6;

const ReviewItem: React.FC<{ review: MyReview; onDelete: () => void }> = ({ review, onDelete }) => {
  const { formatDate } = useLocale();
  const type = toPlaceType(review.itemType);
  const place = review.itemId;
  const image = place.images?.[0];
  const cityName = getCityName(place.city);

  return (
    <article className="review-item">
      <Link to={`/places/${type}/${place._id}`} className="review-item__thumb" tabIndex={-1} aria-hidden="true">
        {image ? <img src={image} alt="" loading="lazy" decoding="async" /> : <MapPin className="w-6 h-6" />}
      </Link>

      <div className="review-item__body">
        <header className="review-item__header">
          <div className="review-item__place">
            <h3 className="review-item__name">
              <Link to={`/places/${type}/${place._id}`}>{place.name}</Link>
            </h3>
            <p className="review-item__meta">
              {PLACE_TYPE_LABELS[type]}
              {cityName && ` · ${cityName}`}
            </p>
          </div>
          <button
            type="button"
            className="review-item__delete"
            onClick={onDelete}
            aria-label={`Xóa đánh giá về ${place.name}`}
            title="Xóa đánh giá"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </header>

        <div className="review-item__rating">
          <RatingStars rating={review.rating} variant="full" />
          <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
        </div>
        <p className="review-item__comment">{review.comment}</p>
      </div>
    </article>
  );
};

/** Tab "Đánh giá": các đánh giá tôi đã viết, xóa được (có xác nhận) */
export const ReviewsTab: React.FC = () => {
  const { data, isPending, isError, error, refetch } = useMyReviews();
  const deleteReview = useDeleteReview();
  const [pendingDelete, setPendingDelete] = useState<MyReview | null>(null);
  const pagination = usePagination(data?.reviews ?? [], { pageSize: PAGE_SIZE });

  if (isPending) {
    return (
      <div className="review-list" role="status" aria-label="Đang tải">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="review-item__skeleton" />
        ))}
      </div>
    );
  }
  if (isError) return <TabError message={error.message} onRetry={() => void refetch()} />;

  if (data.reviews.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="w-6 h-6" />}
        title="Bạn chưa viết đánh giá nào"
        description="Chia sẻ trải nghiệm về khách sạn, nhà hàng hay điểm tham quan để giúp những du khách khác."
        action={
          <Link to="/places" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
            <Compass className="w-4 h-4" />
            Khám phá địa điểm
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="review-list">
        {pagination.pageItems.map((review) => (
          <ReviewItem key={review._id} review={review} onDelete={() => setPendingDelete(review)} />
        ))}
      </div>
      <Pagination pagination={pagination} className="profile-tab__pagination" />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteReview.mutate(pendingDelete._id);
          setPendingDelete(null);
        }}
        title="Xóa đánh giá?"
        message={`Đánh giá của bạn về "${pendingDelete?.itemId.name ?? ''}" sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
        confirmText="Xóa đánh giá"
        variant="danger"
      />
    </>
  );
};
