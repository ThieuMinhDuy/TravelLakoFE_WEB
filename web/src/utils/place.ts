import type { City } from '../types/city';
import type { ItemType, PlaceType, PlaceUnion } from '../types/place';

const PLACE_TO_ITEM: Record<PlaceType, ItemType> = {
  attraction: 'Attraction',
  hotel: 'Hotel',
  restaurant: 'Restaurant',
  cafe: 'Cafe',
};

const ITEM_TO_PLACE: Record<ItemType, PlaceType> = {
  Attraction: 'attraction',
  Hotel: 'hotel',
  Restaurant: 'restaurant',
  Cafe: 'cafe',
};

/** `hotel` → `Hotel` (URL API → tên Model trong Review / Favorite / lịch trình) */
export const toItemType = (type: PlaceType): ItemType => PLACE_TO_ITEM[type];

/** `Hotel` → `hotel` (tên Model → URL API / route trang chi tiết) */
export const toPlaceType = (type: ItemType): PlaceType => ITEM_TO_PLACE[type];

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  attraction: 'Điểm tham quan',
  hotel: 'Khách sạn',
  restaurant: 'Nhà hàng',
  cafe: 'Quán cafe',
};

/** Thứ tự hiển thị các loại địa điểm trên giao diện */
export const PLACE_TYPES: readonly PlaceType[] = ['hotel', 'attraction', 'restaurant', 'cafe'];

export interface PlacePrice {
  amount: number;
  /** Đơn vị đi kèm, vd "/ đêm", "/ vé", "/ người" */
  unit: string;
}

/**
 * Giá tham khảo theo từng loại (mỗi loại lưu ở một trường khác nhau):
 * khách sạn `pricePerNight`, điểm tham quan `admissionFee`, nhà hàng / cafe `price`.
 * Trả về `null` nếu chưa có giá (hiển thị "Liên hệ" hoặc ẩn).
 */
export function getPlacePrice(place: PlaceUnion, type: PlaceType): PlacePrice | null {
  const record = place as unknown as Record<string, unknown>;
  const pick = (key: string, unit: string): PlacePrice | null => {
    const value = record[key];
    return typeof value === 'number' && value > 0 ? { amount: value, unit } : null;
  };

  switch (type) {
    case 'hotel':
      return pick('pricePerNight', '/ đêm');
    case 'attraction':
      return pick('admissionFee', '/ vé');
    case 'restaurant':
      return pick('price', '/ người');
    case 'cafe':
      return pick('price', '/ ly');
  }
}

/** Type guard: `city` đã được populate thành object (thay vì chỉ là ObjectId) */
export const isPopulatedCity = <T extends Pick<City, '_id' | 'name'>>(
  city: string | T | null | undefined
): city is T => typeof city === 'object' && city !== null && 'name' in city;

/** Tên thành phố của địa điểm / chuyến đi (rỗng nếu chưa populate) */
export const getCityName = (city: string | Pick<City, '_id' | 'name'> | null | undefined): string =>
  isPopulatedCity(city) ? city.name : '';
