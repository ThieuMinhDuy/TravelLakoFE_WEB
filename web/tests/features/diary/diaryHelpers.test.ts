import { describe, expect, it } from 'vitest';
import {
  DIARY_MAX_PHOTOS,
  computeDiaryStats,
  filterDiaryTrips,
  getDiaryPhotoCount,
  getPastTripsForDiary,
  getPastTripsNeedingDiary,
  hasDiaryContent,
  isDiaryDirty,
  isTripEnded,
  normalizeDiaryDraft,
  sortTripsNewestFirst,
} from '@/features/diary/utils/diaryHelpers';
import type { TripGroups } from '@/types/trip';
import { makeCity, makeTrip } from '../../helpers/fixtures';

describe('diaryHelpers', () => {
  it('xác định chính xác chuyến đi đã có hay chưa có nội dung nhật ký', () => {
    expect(hasDiaryContent(makeTrip({ diary: { notes: '', photos: [] } }))).toBe(false);
    expect(hasDiaryContent(makeTrip({ diary: { notes: '   ', photos: [] } }))).toBe(false);
    expect(hasDiaryContent(makeTrip({ diary: { notes: 'Biển rất đẹp', photos: [] } }))).toBe(true);
    expect(hasDiaryContent(makeTrip({ diary: { notes: '', photos: ['https://img.test/1.jpg'] } }))).toBe(true);
    expect(getDiaryPhotoCount(makeTrip({ diary: { notes: '', photos: ['a.jpg', 'b.jpg'] } }))).toBe(2);
    expect(DIARY_MAX_PHOTOS).toBe(10);
  });

  it('kiểm tra isTripEnded theo mốc ngày UTC giống backend', () => {
    const trip = makeTrip({ endDate: '2026-07-21T00:00:00.000Z' });
    // Cùng ngày kết thúc -> vẫn đang diễn ra (chưa kết thúc)
    expect(isTripEnded(trip, new Date(2026, 6, 21, 23, 59))).toBe(false);
    // Ngày hôm sau -> đã kết thúc
    expect(isTripEnded(trip, new Date(2026, 6, 22, 0, 1))).toBe(true);
    // Ngày không hợp lệ -> false an toàn
    expect(isTripEnded(makeTrip({ endDate: 'invalid-date' }), new Date(2026, 6, 22))).toBe(false);
  });

  it('lấy danh sách chuyến đã đi, sắp xếp mới nhất trước và lọc chuyến chưa viết', () => {
    const olderUnwritten = makeTrip({
      _id: 'past-1',
      title: 'Huế cổ kính',
      startDate: '2025-05-01T00:00:00.000Z',
      endDate: '2025-05-03T00:00:00.000Z',
      diary: { notes: '', photos: [] },
    });
    const newerWritten = makeTrip({
      _id: 'past-2',
      title: 'Đà Lạt sương mù',
      city: makeCity({ _id: 'city-dl', name: 'Đà Lạt' }),
      startDate: '2026-02-10T00:00:00.000Z',
      endDate: '2026-02-14T00:00:00.000Z',
      diary: { notes: 'Không khí se lạnh rất thích', photos: ['p1.jpg', 'p2.jpg'] },
    });
    const groups: TripGroups = {
      upcoming: [makeTrip({ _id: 'up-1', title: 'Sapa sắp tới' })],
      ongoing: [makeTrip({ _id: 'on-1', title: 'Phú Quốc đang đi' })],
      past: [olderUnwritten, newerWritten],
    };

    const sorted = sortTripsNewestFirst(groups.past);
    expect(sorted.map((t) => t._id)).toEqual(['past-2', 'past-1']);

    // Chỉ lấy nhóm past (không lẫn upcoming/ongoing)
    expect(getPastTripsForDiary(groups).map((t) => t._id)).toEqual(['past-2', 'past-1']);
    expect(getPastTripsForDiary(undefined)).toEqual([]);

    // Gợi ý chuyến đã đi nhưng chưa viết nhật ký
    expect(getPastTripsNeedingDiary(groups).map((t) => t._id)).toEqual(['past-1']);

    // Lọc theo tab và từ khóa (tên chuyến đi / tên thành phố / ghi chú)
    const pastTrips = getPastTripsForDiary(groups);
    expect(filterDiaryTrips(pastTrips, { filter: 'written' }).map((t) => t._id)).toEqual(['past-2']);
    expect(filterDiaryTrips(pastTrips, { filter: 'unwritten' }).map((t) => t._id)).toEqual(['past-1']);
    expect(filterDiaryTrips(pastTrips, { search: 'đà lạt' }).map((t) => t._id)).toEqual(['past-2']);
    expect(filterDiaryTrips(pastTrips, { search: 'se lạnh' }).map((t) => t._id)).toEqual(['past-2']);

    // Thống kê nhanh
    expect(computeDiaryStats(pastTrips)).toEqual({
      totalPastTrips: 2,
      writtenCount: 1,
      unwrittenCount: 1,
      totalPhotos: 2,
    });
  });

  it('chuẩn hóa bản nháp và phát hiện thay đổi kể cả đổi thứ tự ảnh', () => {
    expect(normalizeDiaryDraft(undefined)).toEqual({ notes: '', photos: [] });

    const saved = { notes: 'Kỷ niệm đẹp', photos: ['1.jpg', '2.jpg'] };
    expect(isDiaryDirty({ notes: 'Kỷ niệm đẹp', photos: ['1.jpg', '2.jpg'] }, saved)).toBe(false);
    expect(isDiaryDirty({ notes: 'Kỷ niệm đẹp!', photos: ['1.jpg', '2.jpg'] }, saved)).toBe(true);
    expect(isDiaryDirty({ notes: 'Kỷ niệm đẹp', photos: ['2.jpg', '1.jpg'] }, saved)).toBe(true);
    expect(isDiaryDirty({ notes: 'Kỷ niệm đẹp', photos: ['1.jpg'] }, saved)).toBe(true);
  });
});

