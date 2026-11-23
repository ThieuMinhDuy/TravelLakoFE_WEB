import type { AdminReview } from '../../../types/admin';
import type { ItemType } from '../../../types/place';
import { normalizeText } from './userFilters';

export type ReviewTypeFilter = 'all' | ItemType;
export type ReviewRatingFilter = 'all' | 'low' | '1' | '2' | '3' | '4' | '5';
export type ReviewSort = 'newest' | 'oldest' | 'lowest';

export interface ReviewClientFilters {
  q: string;
  type: ReviewTypeFilter;
  rating: ReviewRatingFilter;
  sort: ReviewSort;
}

/** Đánh giá thấp (≤ 2 sao) — nhóm cần ưu tiên kiểm tra spam / nội dung xấu */
export const isLowRating = (r: Pick<AdminReview, 'rating'>) => r.rating <= 2;

const matchesRating = (r: AdminReview, rating: ReviewRatingFilter) =>
  rating === 'all' ? true : rating === 'low' ? isLowRating(r) : r.rating === Number(rating);

const SORTERS: Record<ReviewSort, (a: AdminReview, b: AdminReview) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
  lowest: (a, b) => a.rating - b.rating || b.createdAt.localeCompare(a.createdAt),
};

/** Số đánh giá theo loại địa điểm (để hiện cạnh nhãn bộ lọc) */
export function countReviewTypes(reviews: AdminReview[]): Record<ReviewTypeFilter, number> {
  const counts: Record<ReviewTypeFilter, number> = { all: reviews.length, Attraction: 0, Hotel: 0, Restaurant: 0, Cafe: 0 };
  reviews.forEach((r) => {
    counts[r.itemType] += 1;
  });
  return counts;
}

/**
 * Lọc + sắp xếp phía client. Backend không sắp xếp sẵn và chỉ lọc được theo thành phố / địa điểm,
 * nên loại địa điểm, số sao, từ khóa và thứ tự đều xử lý ở đây.
 * Từ khóa tìm trong bình luận, tên / email người viết và tên địa điểm (không phân biệt dấu).
 */
export function filterReviews(reviews: AdminReview[], { q, type, rating, sort }: ReviewClientFilters): AdminReview[] {
  const keyword = normalizeText(q);
  return reviews
    .filter((r) => type === 'all' || r.itemType === type)
    .filter((r) => matchesRating(r, rating))
    .filter(
      (r) =>
        !keyword ||
        normalizeText(`${r.comment} ${r.user?.name ?? ''} ${r.user?.email ?? ''} ${r.itemId?.name ?? ''}`).includes(
          keyword
        )
    )
    .sort(SORTERS[sort]);
}
