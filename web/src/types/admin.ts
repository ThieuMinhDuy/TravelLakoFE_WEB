export interface PlaceCounts {
  total: number;
  attractions: number;
  hotels: number;
  restaurants: number;
  cafes: number;
}

export interface DashboardStats {
  users: number;
  trips: number;
  places: PlaceCounts;
  reviews: number;
}

export interface VietnamCityOption {
  _id: string;
  name: string;
  state?: string;
}

export interface ImportOsmDTO {
  cityId: string;
  limit?: number;
}

export interface ImportStatsResponse {
  message: string;
  stats?: {
    hotelsImported: number;
    attractionsImported: number;
    restaurantsImported: number;
    cafesImported: number;
    totalImported: number;
  };
}

export interface UserListResponse {
  total: number;
  users: import('./user').User[];
}
