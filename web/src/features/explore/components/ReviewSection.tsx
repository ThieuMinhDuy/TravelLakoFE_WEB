import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { OpenAuthLink } from '../../auth/components/OpenAuthLink';
import { Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { PlaceType } from '../../../types/place';
import { useAuthStore } from '../../../store/useAuthStore';
import { ConfirmDialog } from '../../../components/compound/ConfirmDialog';
import { exploreApi } from '../services/exploreApi';
import { queryKeys } from '../../../lib/queryKeys';
import { invalidateRelated } from '../../../lib/invalidateRelated';
import { messageOf } from '../utils';
import { Status } from './ExploreUI';

export function ReviewSection({
  kind,
  itemId,
}: {
  kind: PlaceType;
  itemId: string;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<string>();
  const client = useQueryClient();
  const location = useLocation();
  const query = useQuery({
    queryKey: queryKeys.reviews.forPlace(kind, itemId),
    queryFn: ({ signal }) => exploreApi.reviews(kind, itemId, signal),
  });
  const refresh = () => invalidateRelated.afterReview(client);
  const create = useMutation({
    mutationFn: () => exploreApi.addReview(kind, itemId, rating, comment),
    onSuccess: async () => {
      setRating(0);
      setComment('');
      setFormError('');
      await refresh();
      toast.success('Đã gửi đánh giá.');
    },
    onError: (error) => setFormError(messageOf(error)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => exploreApi.deleteReview(id),
    onSuccess: async () => {
      setDeleting(undefined);
      await refresh();
      toast.success('Đã xóa đánh giá.');
    },
    onError: (error) => toast.error(messageOf(error)),
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      !comment.trim()
    ) {
      setFormError('Hãy chọn từ 1 đến 5 sao và nhập nội dung đánh giá.');
      return;
    }
    setFormError('');
    create.mutate();
  };
  const ownReview = query.data?.some(
    (r) =>
      (typeof r.user === 'object' && r.user ? r.user._id : r.user) ===
      user?._id,
  );
  return (
    <section className="explore-section" id="reviews">
      <div className="explore-section-heading">
        <div>
          <p className="explore-eyebrow">Chia sẻ trải nghiệm</p>
          <h2>Đánh giá từ cộng đồng</h2>
        </div>
      </div>
      {query.isPending ? (
        <p role="status">Đang tải đánh giá…</p>
      ) : query.isError ? (
        <Status
          title="Chưa tải được đánh giá"
          description={messageOf(query.error)}
          retry={() => void query.refetch()}
        />
      ) : query.data.length === 0 ? (
        <p className="explore-muted">
          Chưa có đánh giá. Hãy là người đầu tiên chia sẻ trải nghiệm của bạn.
        </p>
      ) : (
        <div className="explore-review-list">
          {query.data.map((review) => (
            <article key={review._id} className="explore-review">
              <div className="explore-review-top">
                <div>
                  <strong>
                    {typeof review.user === 'object' && review.user
                      ? review.user.name || 'Người dùng'
                      : 'Người dùng'}
                  </strong>
                  <span
                    className="explore-review-stars"
                    aria-label={`${review.rating} trên 5 sao`}
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < review.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </span>
                </div>
                {user &&
                  (typeof review.user === 'object' && review.user
                    ? review.user._id
                    : review.user) === user._id && (
                    <button
                      className="explore-icon-button"
                      type="button"
                      aria-label="Xóa đánh giá của tôi"
                      onClick={() => setDeleting(review._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
              </div>
              <p>{review.comment}</p>
              {review.createdAt &&
                !Number.isNaN(Date.parse(review.createdAt)) && (
                  <small>
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </small>
                )}
            </article>
          ))}
        </div>
      )}
      {!isAuthenticated ? (
        <p className="explore-signin-note">
          <OpenAuthLink
            to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
          >
            Đăng nhập
          </OpenAuthLink>{' '}
          để viết đánh giá và chia sẻ chuyến đi của bạn.
        </p>
      ) : ownReview ? (
        <p className="explore-signin-note">
          Bạn đã đánh giá địa điểm này. Bạn có thể xóa đánh giá của mình trước
          khi viết lại.
        </p>
      ) : (
        <form className="explore-review-form" onSubmit={submit}>
          <h3>Trải nghiệm của bạn thế nào?</h3>
          <fieldset disabled={create.isPending}>
            <legend>Chấm điểm từ 1 đến 5 sao</legend>
            <div className="explore-star-picker">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`${i + 1} sao`}
                  aria-pressed={rating === i + 1}
                  onClick={() => setRating(i + 1)}
                >
                  <Star size={28} fill={i < rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </fieldset>
          <label htmlFor="explore-review-comment">Nội dung đánh giá</label>
          <textarea
            id="explore-review-comment"
            required
            maxLength={3000}
            rows={4}
            placeholder="Chia sẻ điều bạn thích và những lưu ý hữu ích…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={create.isPending}
          />
          {formError && (
            <p className="explore-error" role="alert">
              {formError}
            </p>
          )}
          <button
            className="explore-button"
            type="submit"
            disabled={create.isPending || query.isPending || query.isError}
          >
            {create.isPending ? 'Đang gửi…' : 'Gửi đánh giá'}
          </button>
        </form>
      )}
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => {
          if (!remove.isPending) setDeleting(undefined);
        }}
        onConfirm={() => deleting && remove.mutate(deleting)}
        title="Xóa đánh giá?"
        message="Đánh giá của bạn sẽ được xóa khỏi địa điểm này."
        confirmText="Xóa đánh giá"
        isLoading={remove.isPending}
      />
    </section>
  );
}
