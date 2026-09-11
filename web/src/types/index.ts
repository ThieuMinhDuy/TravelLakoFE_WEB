// === TÍNH NĂNG NÂNG CAO 1: Generics cho API Response ===
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// === TÍNH NĂNG NÂNG CAO 4: Const Assertions & Type Inference ===
export const PLACE_TYPES = ['Attraction', 'Hotel', 'Restaurant', 'Cafe'] as const;
export type ItemType = typeof PLACE_TYPES[number];

// === TÍNH NĂNG NÂNG CAO 2 & 3: Discriminated Unions & Utility Types ===
export interface City {
  _id: string;
  name: string;
  description: string;
  image: string;
  coordinates: { lat: number; lng: number };
}

// Utility Omit để tạo type lúc tạo mới thành phố
export type CityInput = Omit<City, '_id'>;

export interface BasePlace {
  _id: string;
  name: string;
  city: string | City; // ID hoặc Object City
  description: string;
  images: string[];
  address: string;
  coordinates: { lat: number; lng: number };
  rating?: number;
  numReviews?: number;
}

export interface Attraction extends BasePlace {
  type: 'Attraction';
  admissionFee: number;
}

export interface Hotel extends BasePlace {
  type: 'Hotel';
  stars: number;
  pricePerNight: number;
}

export interface Restaurant extends BasePlace {
  type: 'Restaurant';
  cuisineType: string;
  price: number;
}

export interface Cafe extends BasePlace {
  type: 'Cafe';
  price: number;
}

// Union Type hỗ trợ Type Guard
export type Place = Attraction | Hotel | Restaurant | Cafe;

// === CÁC MODEL KHÁC ===
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  isAdmin: boolean;
  isBlocked?: boolean;
}

export interface Review {
  _id: string;
  user: string | User;
  itemType: ItemType;
  itemId: string | Place;
  rating: number;
  comment: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalTrips: number;
  totalPlaces: number;
  totalReviews: number;
  placesByType: Record<ItemType, number>;
}
