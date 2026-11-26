import type { Trip, TripDiary, TripGroups, TripWithCity } from '../../../types/trip';
import { getCityName } from '../../../utils/place';

/** Số lượng ảnh tối đa trong nhật ký mỗi chuyến đi (theo đặc tả) */
export const DIARY_MAX_PHOTOS = 10;

export type DiaryFilter = 'all' | 'unwritten' | 'written';

export const DIARY_FILTERS: readonly DiaryFilter[] = ['all', 'unwritten', 'written'];

export const DIARY_FILTER_LABELS: Record<DiaryFilter, string> = {
  all: 'Tất cả',
  unwritten: 'Chưa viết',
  written: 'Đã viết',
};

export interface DiaryStats {
  totalPastTrips: number;
  writtenCount: number;
  unwrittenCount: number;
  totalPhotos: number;
}

/** Kiểm tra chuyến đi đã có nội dung nhật ký (ghi chú không rỗng hoặc có ít nhất 1 ảnh) */
export const hasDiaryContent = (trip: Pick<Trip, 'diary'>): boolean =>
  Boolean(trip.diary?.notes?.trim()) || (trip.diary?.photos?.length ?? 0) > 0;

/** Tổng số ảnh đã lưu trong nhật ký chuyến đi */
export const getDiaryPhotoCount = (trip: Pick<Trip, 'diary'>): number =>
  trip.diary?.photos?.length ?? 0;

/**
 * Kiểm tra chuyến đi đã kết thúc (ngày hiện tại > ngày kết thúc theo lịch UTC),
 * đồng bộ cách backend nhóm chuyến đi sang `past` trong GET /api/trips.
 */
export function isTripEnded(trip: Pick<Trip, 'endDate'>, now: Date = new Date()): boolean {
  const end = new Date(trip.endDate);
  if (Number.isNaN(end.getTime())) return false;

  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const tripEndUtc = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  return todayUtc > tripEndUtc;
}

/** Sắp xếp chuyến đi mới nhất lên trước (theo ngày kết thúc, sau đó ngày bắt đầu) */
export function sortTripsNewestFirst<T extends Pick<Trip, 'endDate' | 'startDate'>>(
  trips: readonly T[]
): T[] {
  return [...trips].sort((a, b) => {
    const endDiff = (new Date(b.endDate).getTime() || 0) - (new Date(a.endDate).getTime() || 0);
    if (endDiff !== 0) return endDiff;
    return (new Date(b.startDate).getTime() || 0) - (new Date(a.startDate).getTime() || 0);
  });
}

/** Lấy danh sách các chuyến đã đi (`past`) cho màn Nhật ký, mới nhất lên đầu */
export function getPastTripsForDiary(groups: TripGroups | undefined): TripWithCity[] {
  if (!groups?.past?.length) return [];
  return sortTripsNewestFirst(groups.past);
}

/** Các chuyến đã đi nhưng chưa viết nhật ký — dùng để hiển thị gợi ý hậu chuyến đi */
export function getPastTripsNeedingDiary(groups: TripGroups | undefined): TripWithCity[] {
  return getPastTripsForDiary(groups).filter((trip) => !hasDiaryContent(trip));
}

/** Lọc danh sách chuyến đã đi theo trạng thái viết nhật ký và từ khóa tìm kiếm */
export function filterDiaryTrips(
  trips: readonly TripWithCity[],
  { filter = 'all', search = '' }: { filter?: DiaryFilter; search?: string } = {}
): TripWithCity[] {
  const keyword = search.trim().toLowerCase();

  return trips.filter((trip) => {
    if (filter === 'written' && !hasDiaryContent(trip)) return false;
    if (filter === 'unwritten' && hasDiaryContent(trip)) return false;

    if (!keyword) return true;
    const title = trip.title.toLowerCase();
    const cityName = getCityName(trip.city).toLowerCase();
    const notes = (trip.diary?.notes ?? '').toLowerCase();
    return title.includes(keyword) || cityName.includes(keyword) || notes.includes(keyword);
  });
}

/** Tính thống kê nhanh cho danh sách chuyến đã đi ở trang Nhật ký */
export function computeDiaryStats(trips: readonly TripWithCity[]): DiaryStats {
  let writtenCount = 0;
  let totalPhotos = 0;

  for (const trip of trips) {
    if (hasDiaryContent(trip)) writtenCount += 1;
    totalPhotos += getDiaryPhotoCount(trip);
  }

  return {
    totalPastTrips: trips.length,
    writtenCount,
    unwrittenCount: trips.length - writtenCount,
    totalPhotos,
  };
}

/** Chuẩn hóa bản nháp nhật ký để form luôn nhận dữ liệu đầy đủ, tránh undefined */
export function normalizeDiaryDraft(diary?: Partial<TripDiary> | null): TripDiary {
  return {
    notes: diary?.notes ?? '',
    photos: [...(diary?.photos ?? [])],
  };
}

/** Kiểm tra bản nháp nhật ký có thay đổi so với dữ liệu đã lưu (kể cả thứ tự ảnh) */
export function isDiaryDirty(draft: TripDiary, saved?: Partial<TripDiary> | null): boolean {
  const savedNotes = saved?.notes ?? '';
  const savedPhotos = saved?.photos ?? [];

  if (draft.notes !== savedNotes) return true;
  if (draft.photos.length !== savedPhotos.length) return true;

  return draft.photos.some((url, index) => url !== savedPhotos[index]);
}

