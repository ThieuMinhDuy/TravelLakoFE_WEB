import type { AdminReview } from '../../../types/admin';
import type { City } from '../../../types/city';

/*
 * API thống kê (GET /admin/dashboard/stats) chỉ trả số đếm, không có số liệu theo thời gian.
 * Các chuỗi theo tháng dưới đây tính phía client từ `createdAt` của danh sách users / reviews.
 */

export interface MonthBucket {
  /** "2026-11" */
  key: string;
  /** Nhãn ngắn trên trục: "T11" */
  label: string;
  /** Nhãn đầy đủ cho tooltip / bảng: "Tháng 11/2026" */
  fullLabel: string;
  value: number;
}

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

/** Đếm số bản ghi tạo trong mỗi tháng của `months` tháng gần nhất (tính cả tháng hiện tại) */
export function countByMonth(dates: (string | undefined)[], months: number, now = new Date()): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: monthKey(d),
      label: `T${d.getMonth() + 1}`,
      fullLabel: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`,
      value: 0,
    });
  }
  const index = new Map(buckets.map((b, i) => [b.key, i]));
  dates.forEach((iso) => {
    if (!iso) return;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return;
    const i = index.get(monthKey(d));
    if (i !== undefined) buckets[i].value += 1;
  });
  return buckets;
}

/** Số bản ghi tạo trong tháng hiện tại */
export const countThisMonth = (dates: (string | undefined)[], now = new Date()) =>
  countByMonth(dates, 1, now)[0].value;

export interface RankedItem {
  key: string;
  label: string;
  value: number;
  href?: string;
}

/** Thành phố có nhiều đánh giá nhất (itemId.city chỉ là ID → tra tên trong danh sách thành phố) */
export function topCitiesByReviews(reviews: AdminReview[], cities: City[], limit = 5): RankedItem[] {
  const names = new Map(cities.map((c) => [c._id, c.name]));
  const counts = new Map<string, number>();
  reviews.forEach((r) => {
    const cityId = r.itemId?.city;
    if (cityId && names.has(cityId)) counts.set(cityId, (counts.get(cityId) ?? 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, value]) => ({ key: id, label: names.get(id)!, value, href: `/admin/reviews?city=${id}` }));
}

/** Số đánh giá theo số sao, thứ tự tự nhiên 5 → 1 */
export function ratingDistribution(reviews: AdminReview[]): RankedItem[] {
  return [5, 4, 3, 2, 1].map((star) => ({
    key: String(star),
    label: `${star} sao`,
    value: reviews.filter((r) => Math.round(r.rating) === star).length,
    href: `/admin/reviews?rating=${star}`,
  }));
}

/** Số khoảng chia trên trục Y của biểu đồ cột */
export const CHART_TICKS = 4;

/**
 * Đỉnh trục = 4 bước tròn (1, 2, 2.5, 5 × 10ⁿ, tối thiểu 1) → mọi vạch là số nguyên đẹp:
 * 7 → 0/2/4/6/8 · 18 → 0/5/10/15/20 · 30 → 0/10/20/30/40.
 */
export function niceMax(value: number): number {
  const rawStep = Math.max(1, value / CHART_TICKS);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((s) => s * magnitude).find((s) => s >= rawStep && Number.isInteger(s))!;
  return step * CHART_TICKS;
}
