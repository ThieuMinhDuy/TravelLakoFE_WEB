import type { PlaceType } from '../../types/place';
import type { ReviewItemType } from '../../types/review';
import type { ExploreFilters, ExplorePlace } from './types';

export const PLACE_KINDS: PlaceType[] = [
  'attraction',
  'hotel',
  'restaurant',
  'cafe',
];
export const KIND_LABELS: Record<PlaceType, string> = {
  attraction: 'Điểm tham quan',
  hotel: 'Khách sạn',
  restaurant: 'Nhà hàng',
  cafe: 'Quán cà phê',
};
const ITEM_TYPES: Record<PlaceType, ReviewItemType> = {
  attraction: 'Attraction',
  hotel: 'Hotel',
  restaurant: 'Restaurant',
  cafe: 'Cafe',
};
export const toItemType = (kind: PlaceType) => ITEM_TYPES[kind];
export const isPlaceKind = (value: string): value is PlaceType =>
  PLACE_KINDS.includes(value as PlaceType);
export function fromItemType(value: string): PlaceType | null {
  const kind = value.toLowerCase();
  return isPlaceKind(kind) ? kind : null;
}
export function getPrice(place: ExplorePlace): number | undefined {
  const value =
    place.kind === 'attraction'
      ? 'admissionFee' in place
        ? place.admissionFee
        : undefined
      : place.kind === 'hotel'
        ? 'pricePerNight' in place
          ? place.pricePerNight
          : undefined
        : 'price' in place
          ? place.price
          : undefined;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
}
export function priceLabel(place: ExplorePlace): string {
  const price = getPrice(place);
  if (price === undefined) return 'Chưa có giá tham khảo';
  if (price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
}
/** Đơn vị đi kèm giá; giá 0 ("Miễn phí") không có đơn vị nên trả về chuỗi rỗng */
export const priceUnit = (kind: PlaceType, place?: ExplorePlace) =>
  place && getPrice(place) === 0
    ? ''
    : kind === 'hotel' ? '/ đêm' : kind === 'attraction' ? '/ vé' : 'tham khảo';
export function validCoordinates(
  value: unknown,
): value is { lat: number; lng: number } {
  if (!value || typeof value !== 'object') return false;
  const { lat, lng } = value as { lat?: unknown; lng?: unknown };
  return (
    typeof lat === 'number' &&
    Number.isFinite(lat) &&
    Math.abs(lat) <= 90 &&
    typeof lng === 'number' &&
    Number.isFinite(lng) &&
    Math.abs(lng) <= 180
  );
}
export function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}
const nonNegative = (value: string | null) =>
  value !== null &&
  value.trim() !== '' &&
  Number.isFinite(Number(value)) &&
  Number(value) >= 0
    ? String(Number(value))
    : '';
export function parseFilters(params: URLSearchParams): ExploreFilters {
  const type = params.get('type') ?? 'all';
  const page = Number(params.get('page'));
  return {
    type: isPlaceKind(type) ? type : 'all',
    search: params.get('search')?.trim() ?? '',
    city: params.get('city') ?? '',
    minPrice: nonNegative(params.get('minPrice')),
    maxPrice: nonNegative(params.get('maxPrice')),
    stars:
      type === 'hotel' && /^[1-5]$/.test(params.get('stars') ?? '')
        ? params.get('stars')!
        : '',
    cuisineType:
      type === 'restaurant' ? (params.get('cuisineType')?.trim() ?? '') : '',
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}
export function updateFilters(
  params: URLSearchParams,
  patch: Partial<ExploreFilters>,
) {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(patch)) {
    if (value === '' || (key === 'type' && value === 'all') || (key === 'page' && value === 1))
      next.delete(key);
    else next.set(key, String(value));
  }
  if (!('page' in patch)) next.delete('page');
  if ('type' in patch) {
    next.delete('stars');
    next.delete('cuisineType');
  }
  return next;
}
export function messageOf(error: unknown) {
  if (!(error instanceof Error))
    return 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.';
  if (error.message === 'Network Error')
    return 'Chưa kết nối được với máy chủ. Vui lòng kiểm tra kết nối và thử lại.';
  return error.message;
}
