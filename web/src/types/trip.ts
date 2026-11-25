import { City } from './city';
import {
  Attraction,
  Hotel,
  Restaurant,
  Cafe,
  PlaceUnion,
} from './place';

// ─── Re-export PlaceType chuẩn hóa thành PascalCase (khớp BE enum) ─────────
export type SchedulePlaceType = 'Attraction' | 'Hotel' | 'Restaurant' | 'Cafe';

// ─── Place in Schedule ───────────────────────────────────────────────────────
/** Một địa điểm trong lịch trình (chưa populate) */
export interface PlaceInSchedule {
  _id: string;
  placeType: SchedulePlaceType;
  placeId: string;
  order: number;
  note: string;
  visited: boolean;
  checkInTime?: string; // ISO string
}

/** Một địa điểm đã được populate từ DB */
export interface PopulatedPlaceInSchedule extends Omit<PlaceInSchedule, 'placeId'> {
  placeId: PlaceUnion;
}

// ─── Day Schedule ─────────────────────────────────────────────────────────────
export interface DaySchedule {
  _id: string;
  day: number;   // 1, 2, 3...
  date: string;  // ISO string
  places: PlaceInSchedule[];
}

export interface PopulatedDaySchedule extends Omit<DaySchedule, 'places'> {
  places: PopulatedPlaceInSchedule[];
}

// ─── Trip Diary ───────────────────────────────────────────────────────────────
export interface TripDiary {
  notes: string;
  photos: string[];
}

// ─── Trip (raw từ API, city & places chưa populate) ──────────────────────────
export interface Trip {
  _id: string;
  user: string;
  title: string;
  city: string;
  startDate: string;
  endDate: string;
  budget: number;
  schedule: DaySchedule[];
  diary: TripDiary;
  createdAt: string;
  updatedAt: string;
}

// ─── Trip (đã populate city) ─────────────────────────────────────────────────
export interface TripWithCity extends Omit<Trip, 'city'> {
  city: City;
}

// ─── Trip (đã populate city + places) ────────────────────────────────────────
export interface TripDetail extends Omit<TripWithCity, 'schedule'> {
  schedule: PopulatedDaySchedule[];
}

// ─── My Trips Response (GET /api/trips) ───────────────────────────────────────
export interface MyTripsResponse {
  upcoming: TripWithCity[];
  ongoing: TripWithCity[];
  past: TripWithCity[];
}

// ─── DTOs (gửi lên BE) ───────────────────────────────────────────────────────
export interface CreateTripDTO {
  title: string;
  city: string;       // ObjectId
  startDate: string;  // 'YYYY-MM-DD'
  endDate: string;    // 'YYYY-MM-DD'
  budget?: number;
}

export interface AddPlaceToScheduleDTO {
  day: number;
  placeType: SchedulePlaceType;
  placeId: string;
  note?: string;
}

export interface ReorderScheduleDTO {
  day: number;
  placesOrder: string[];
}

export interface UpdateTripMetadataDTO {
  title?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
}

// ─── Helper: trích cost từ populated place ───────────────────────────────────
/**
 * Tính chi phí ước tính của 1 place trong schedule.
 * Dùng trong selectBudgetSummary (tripSelectors).
 */
export function extractPlaceCost(
  place: PopulatedPlaceInSchedule,
  tripDays: number
): number {
  const p = place.placeId as PlaceUnion;
  switch (place.placeType) {
    case 'Hotel':
      return ((p as Hotel).pricePerNight ?? 0) * tripDays;
    case 'Attraction':
      return (p as Attraction).admissionFee ?? 0;
    case 'Restaurant':
      return (p as Restaurant).price ?? 0;
    case 'Cafe':
      return (p as Cafe).price ?? 0;
    default:
      return 0;
  }
}


// ─── Nhóm chuyến đi (trang Hồ sơ, TripCard) ──────────────────────────────────
/** Trạng thái chuyến đi theo cách backend phân nhóm (so với ngày hiện tại) */
export type TripStatus = keyof MyTripsResponse;

/** GET /api/trips — backend chia sẵn 3 nhóm (tên dùng ở trang Hồ sơ) */
export type TripGroups = MyTripsResponse;
