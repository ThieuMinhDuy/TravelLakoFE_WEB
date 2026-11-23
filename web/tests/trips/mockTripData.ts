import { TripDetail, PopulatedPlaceInSchedule } from '../../src/features/trips/types/trip';

/** Tạo mock địa điểm */
export const createMockPlace = (
  id: string,
  name: string,
  type: 'Attraction' | 'Hotel' | 'Restaurant' | 'Cafe',
  order: number,
  cost: number,
  visited = false
): PopulatedPlaceInSchedule => {
  let placeDetails: Record<string, unknown> = {
    _id: `place_raw_${id}`,
    name,
    city: 'city_hanoi_1',
    address: `${name}, Hà Nội`,
    coordinates: { lat: 21.0285, lng: 105.8542 },
    rating: 4.5,
  };

  if (type === 'Hotel') {
    placeDetails = { ...placeDetails, pricePerNight: cost, stars: 4 };
  } else if (type === 'Attraction') {
    placeDetails = { ...placeDetails, admissionFee: cost };
  } else if (type === 'Restaurant' || type === 'Cafe') {
    placeDetails = { ...placeDetails, price: cost };
  }

  return {
    _id: id,
    placeType: type,
    placeId: placeDetails as unknown as PopulatedPlaceInSchedule['placeId'],
    order,
    note: `Ghi chú cho ${name}`,
    visited,
    checkInTime: visited ? '2026-07-20T10:00:00.000Z' : undefined,
  };
};

/** Mock chuyến đi hoàn chỉnh gồm 2 ngày */
export const mockTripDetail: TripDetail = {
  _id: 'trip_123',
  user: 'user_456',
  title: 'Khám phá Hà Nội 2 ngày 1 đêm',
  city: {
    _id: 'city_hanoi_1',
    name: 'Hà Nội',
    coordinates: { lat: 21.0285, lng: 105.8542 },
  },
  startDate: '2026-07-20T00:00:00.000Z',
  endDate: '2026-07-21T00:00:00.000Z',
  budget: 2000000, // 2.000.000 VNĐ
  diary: { notes: 'Chuyến đi tuyệt vời', photos: [] },
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-01T00:00:00.000Z',
  schedule: [
    {
      _id: 'day_1',
      day: 1,
      date: '2026-07-20T00:00:00.000Z',
      places: [
        createMockPlace('p1', 'Hồ Hoàn Kiếm', 'Attraction', 0, 0, true), // visited, 0đ
        createMockPlace('p2', 'Phở Gia Truyền Bát Đàn', 'Restaurant', 1, 70000, true), // visited, 70k
        createMockPlace('p3', 'Khách sạn Silk Path', 'Hotel', 2, 600000, false), // hotel: 600k * 2 ngày = 1.200k
      ],
    },
    {
      _id: 'day_2',
      day: 2,
      date: '2026-07-21T00:00:00.000Z',
      places: [
        createMockPlace('p4', 'Cafe Giảng', 'Cafe', 0, 45000, false), // cafe: 45k
        createMockPlace('p5', 'Văn Miếu Quốc Tử Giám', 'Attraction', 1, 30000, false), // attraction: 30k
      ],
    },
  ],
};

