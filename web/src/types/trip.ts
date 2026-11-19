import type { City } from './city';
import type { ItemType, PlaceUnion } from './place';

/** Một địa điểm trong lịch trình của một ngày */
export interface SchedulePlace {
  _id: string;
  placeType: ItemType;
  /** ObjectId, hoặc đã populate thành địa điểm ở API chi tiết chuyến đi */
  placeId: string | PlaceUnion;
  order: number;
  note?: string;
  visited?: boolean;
  checkInTime?: string;
}

export interface ScheduleDay {
  _id?: string;
  day: number;
  date: string;
  places: SchedulePlace[];
}

export interface TripDiary {
  notes: string;
  photos: string[];
}

export interface Trip {
  _id: string;
  user: string;
  title: string;
  /** Danh sách chuyến đi populate `name image coordinates` */
  city: string | Pick<City, '_id' | 'name' | 'image' | 'coordinates'>;
  startDate: string;
  endDate: string;
  budget: number;
  schedule: ScheduleDay[];
  diary?: TripDiary;
  createdAt?: string;
  updatedAt?: string;
}

/** Trạng thái chuyến đi theo cách backend phân nhóm (so với ngày hiện tại) */
export type TripStatus = 'upcoming' | 'ongoing' | 'past';

/** GET /api/trips — backend chia sẵn 3 nhóm */
export type TripGroups = Record<TripStatus, Trip[]>;
