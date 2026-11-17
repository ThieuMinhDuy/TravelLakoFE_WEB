export interface Coordinates {
  lat: number;
  lng: number;
}

export interface City {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  coordinates: Coordinates;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCityDTO {
  name: string;
  description?: string;
  image?: string;
  coordinates: Coordinates;
}

export type UpdateCityDTO = Partial<CreateCityDTO>;

export interface CityListResponse {
  total: number;
  cities: City[];
}
