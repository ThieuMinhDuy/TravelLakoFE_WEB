import { BUDGET_PRICE_THRESHOLDS, TRAVEL_INTERESTS } from '../../../config/profileOptions';
import { PLACE_TYPES, getPlacePrice } from '../../../utils/place';
import type { GlobalSearchResponse, PlaceType, PlaceUnion } from '../../../types/place';
import type { FavoriteBudget } from '../../../types/user';

type BudgetTier = Exclude<FavoriteBudget, ''>;

const TIER_ORDER: BudgetTier[] = ['Tiết kiệm', 'Trung bình', 'Cao cấp'];

/** Phân loại mức giá của một địa điểm theo ngưỡng của từng loại */
export function classifyBudget(amount: number, type: PlaceType): BudgetTier {
  const { budget, mid } = BUDGET_PRICE_THRESHOLDS[type];
  if (amount <= budget) return 'Tiết kiệm';
  if (amount <= mid) return 'Trung bình';
  return 'Cao cấp';
}

export interface Recommendation {
  place: PlaceUnion;
  type: PlaceType;
  score: number;
  /** Lý do gợi ý ngắn gọn để hiển thị trên thẻ */
  reason: string;
}

export interface RecommendOptions {
  /** Sở thích du lịch của người dùng */
  interests: string[];
  favoriteBudget?: FavoriteBudget;
  /** _id các địa điểm đã yêu thích → không gợi ý lại */
  excludeIds?: ReadonlySet<string>;
  limit?: number;
}

const SEARCH_KEYS: Record<PlaceType, keyof GlobalSearchResponse> = {
  hotel: 'hotels',
  attraction: 'attractions',
  restaurant: 'restaurants',
  cafe: 'cafes',
};

/**
 * Chấm điểm và chọn địa điểm phù hợp với người dùng (hàm thuần, không gọi API):
 * - Nền: điểm đánh giá (0–5)
 * - +1.5 nếu loại địa điểm hợp sở thích (vd "Ẩm thực" → nhà hàng)
 * - Ngân sách: đúng mức +2, lệch một mức +0.5, lệch hai mức −1
 */
export function recommendPlaces(data: GlobalSearchResponse, options: RecommendOptions): Recommendation[] {
  const { interests, favoriteBudget = '', excludeIds = new Set<string>(), limit = 4 } = options;

  const interestTypes = new Set(
    TRAVEL_INTERESTS.filter((i) => interests.includes(i.value)).flatMap((i) => i.placeTypes)
  );
  const matchedInterest = (type: PlaceType) =>
    TRAVEL_INTERESTS.find((i) => interests.includes(i.value) && i.placeTypes.includes(type))?.value;

  const results: Recommendation[] = PLACE_TYPES.flatMap((type) =>
    (data[SEARCH_KEYS[type]] as PlaceUnion[])
      .filter((place) => !excludeIds.has(place._id))
      .map((place) => {
        let score = place.rating ?? 0;
        let reason = (place.rating ?? 0) >= 4.5 ? 'Được đánh giá rất cao' : 'Nổi bật trên TripMate';

        const price = getPlacePrice(place, type);
        if (favoriteBudget && price) {
          const distance = Math.abs(
            TIER_ORDER.indexOf(classifyBudget(price.amount, type)) - TIER_ORDER.indexOf(favoriteBudget)
          );
          score += distance === 0 ? 2 : distance === 1 ? 0.5 : -1;
          if (distance === 0) reason = `Hợp ngân sách ${favoriteBudget.toLowerCase()}`;
        }

        if (interestTypes.has(type)) {
          score += 1.5;
          reason = `Hợp sở thích ${matchedInterest(type)}`;
        }

        return { place, type, score, reason };
      })
  );

  return results
    .sort((a, b) => b.score - a.score || (b.place.numReviews ?? 0) - (a.place.numReviews ?? 0))
    .slice(0, limit);
}
