import type { PlaceType } from '../types/place';
import type { FavoriteBudget, Gender } from '../types/user';

/** Giá trị khớp enum `gender` của model User ở backend */
export const GENDER_OPTIONS: { value: Exclude<Gender, ''>; label: string }[] = [
  { value: 'Nam', label: 'Nam' },
  { value: 'Nữ', label: 'Nữ' },
  { value: 'Khác', label: 'Khác' },
];

/** Giá trị khớp enum `favoriteBudget` của model User ở backend */
export const BUDGET_OPTIONS: { value: Exclude<FavoriteBudget, ''>; label: string; hint: string }[] = [
  { value: 'Tiết kiệm', label: 'Tiết kiệm', hint: 'Homestay, quán ăn địa phương' },
  { value: 'Trung bình', label: 'Trung bình', hint: 'Khách sạn 3–4 sao, nhà hàng phổ thông' },
  { value: 'Cao cấp', label: 'Cao cấp', hint: 'Resort, khách sạn 5 sao, fine dining' },
];

export interface TravelInterest {
  value: string;
  emoji: string;
  /** Loại địa điểm liên quan — dùng để ưu tiên khi gợi ý */
  placeTypes: PlaceType[];
}

/**
 * Sở thích du lịch (backend lưu dạng mảng chuỗi tự do `travelPreferences`).
 * `placeTypes` cho biết sở thích này hợp với loại địa điểm nào để gợi ý phù hợp.
 */
export const TRAVEL_INTERESTS: TravelInterest[] = [
  { value: 'Biển đảo', emoji: '🏖️', placeTypes: ['hotel', 'attraction'] },
  { value: 'Núi rừng', emoji: '⛰️', placeTypes: ['attraction'] },
  { value: 'Ẩm thực', emoji: '🍜', placeTypes: ['restaurant'] },
  { value: 'Cà phê', emoji: '☕', placeTypes: ['cafe'] },
  { value: 'Văn hóa - Lịch sử', emoji: '🏯', placeTypes: ['attraction'] },
  { value: 'Thiên nhiên', emoji: '🌿', placeTypes: ['attraction'] },
  { value: 'Nghỉ dưỡng', emoji: '🧖', placeTypes: ['hotel'] },
  { value: 'Phiêu lưu', emoji: '🧗', placeTypes: ['attraction'] },
  { value: 'Chụp ảnh', emoji: '📸', placeTypes: ['attraction', 'cafe'] },
  { value: 'Mua sắm', emoji: '🛍️', placeTypes: ['attraction'] },
];

/**
 * Ngưỡng giá (VNĐ) phân loại ngân sách theo từng loại địa điểm, dùng để gợi ý:
 * giá ≤ `budget` → Tiết kiệm, ≤ `mid` → Trung bình, còn lại → Cao cấp.
 */
export const BUDGET_PRICE_THRESHOLDS: Record<PlaceType, { budget: number; mid: number }> = {
  hotel: { budget: 800_000, mid: 2_500_000 },
  attraction: { budget: 100_000, mid: 400_000 },
  restaurant: { budget: 150_000, mid: 500_000 },
  cafe: { budget: 50_000, mid: 120_000 },
};
