import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';

const invalidate = (qc: QueryClient, keys: QueryKey[]) =>
  Promise.all(keys.map((queryKey) => qc.invalidateQueries({ queryKey })));

/**
 * Dữ liệu admin liên quan chéo nhau (xóa thành phố xóa luôn địa điểm, xóa đánh giá đổi rating...).
 * Gom quy tắc invalidate (tài liệu 08, mục 3) vào một chỗ để không trang nào làm thiếu.
 */
export const invalidateAdmin = {
  /** Xóa kèm (cascade) xóa luôn địa điểm, đánh giá, yêu thích và gỡ khỏi lịch trình chuyến đi */
  afterCity: (qc: QueryClient) =>
    invalidate(qc, [
      queryKeys.admin.cities(),
      queryKeys.admin.placesAll(),
      queryKeys.admin.reviewsAll(),
      queryKeys.admin.stats(),
      queryKeys.cities.all,
      queryKeys.places.all,
      queryKeys.trips.all,
      queryKeys.favorites.all,
    ]),

  /** Xóa địa điểm xóa luôn đánh giá, yêu thích và gỡ khỏi lịch trình chuyến đi */
  afterPlace: (qc: QueryClient) =>
    invalidate(qc, [
      queryKeys.admin.placesAll(),
      queryKeys.admin.reviewsAll(),
      queryKeys.admin.stats(),
      queryKeys.places.all,
      queryKeys.trips.all,
      queryKeys.favorites.all,
    ]),

  /** Backend tính lại rating/numReviews của địa điểm → làm mới cả danh sách địa điểm */
  afterReview: (qc: QueryClient) =>
    invalidate(qc, [queryKeys.admin.reviewsAll(), queryKeys.admin.placesAll(), queryKeys.admin.stats()]),

  /** Xóa user xóa luôn trip, favorite, review của họ */
  afterUser: (qc: QueryClient) =>
    invalidate(qc, [
      queryKeys.admin.users(),
      queryKeys.admin.reviewsAll(),
      queryKeys.admin.placesAll(),
      queryKeys.admin.stats(),
    ]),

  /** Không làm mới danh sách tỉnh thành gợi ý (cố định phía backend) */
  afterImport: (qc: QueryClient) =>
    invalidate(qc, [
      queryKeys.admin.cities(),
      queryKeys.admin.placesAll(),
      queryKeys.admin.stats(),
      queryKeys.cities.all,
      queryKeys.places.all,
    ]),
};
