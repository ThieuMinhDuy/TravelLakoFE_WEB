import { City, Coordinates } from './city';

export type PlaceType = 'attraction' | 'hotel' | 'restaurant' | 'cafe';

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
