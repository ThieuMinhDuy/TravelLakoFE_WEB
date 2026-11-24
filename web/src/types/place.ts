import { City, Coordinates } from './city';

/** Loại địa điểm dùng trên URL API: GET /api/places/:type */
export type PlaceType = 'attraction' | 'hotel' | 'restaurant' | 'cafe';

/** Loại địa điểm lưu trong Review / Favorite / lịch trình (tên Model của backend) */
export type ItemType = 'Attraction' | 'Hotel' | 'Restaurant' | 'Cafe';

export interface BasePlace {
  _id: string;
  name: string;
  city: string | City;
  description?: string;
  images?: string[];
  address?: string;
  coordinates: Coordinates;
  rating?: number;
  numReviews?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Attraction extends BasePlace {
  admissionFee?: number;
}

export interface Hotel extends BasePlace {
  stars?: number;
  pricePerNight: number;
}

export interface Restaurant extends BasePlace {
  cuisineType?: string;
  price?: number;
}

export interface Cafe extends BasePlace {
  price?: number;
}

export type PlaceUnion = Attraction | Hotel | Restaurant | Cafe;

export interface PlaceListResponse<T = PlaceUnion> {
  total: number;
  places: T[];
}

/** GET /api/places/search — mỗi loại tối đa 5 (không có từ khóa) hoặc 10 kết quả */
export interface GlobalSearchResponse {
  attractions: Attraction[];
  hotels: Hotel[];
  restaurants: Restaurant[];
  cafes: Cafe[];
}

export interface CreateAttractionDTO {
  name: string;
  city: string;
  description?: string;
  images?: string[];
  address?: string;
  coordinates: Coordinates;
  admissionFee?: number;
}

export interface CreateHotelDTO {
  name: string;
  city: string;
  description?: string;
  images?: string[];
  address?: string;
  coordinates: Coordinates;
  stars?: number;
  pricePerNight: number;
}

export interface CreateRestaurantDTO {
  name: string;
  city: string;
  description?: string;
  images?: string[];
  address?: string;
  coordinates: Coordinates;
  cuisineType?: string;
  price?: number;
}

export interface CreateCafeDTO {
  name: string;
  city: string;
  description?: string;
  images?: string[];
  address?: string;
  coordinates: Coordinates;
  price?: number;
}

export type CreatePlaceDTO =
  | CreateAttractionDTO
  | CreateHotelDTO
  | CreateRestaurantDTO
  | CreateCafeDTO;
