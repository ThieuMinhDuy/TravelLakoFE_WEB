import { getCityName, getPlacePrice, isPopulatedCity, toItemType, toPlaceType } from '@/utils/place';
import { countTrips, getTripDays, getTripPlaceCount } from '@/utils/trip';
import { makeAttraction, makeCafe, makeHotel, makeRestaurant, makeTrip } from '../helpers/fixtures';

describe('utils/place', () => {
  it('chuyển qua lại giữa loại trên URL và tên Model của backend', () => {
    expect(toItemType('hotel')).toBe('Hotel');
    expect(toPlaceType('Restaurant')).toBe('restaurant');
    expect(toPlaceType(toItemType('cafe'))).toBe('cafe');
  });

  it('lấy giá đúng trường theo từng loại địa điểm', () => {
    expect(getPlacePrice(makeHotel(), 'hotel')).toEqual({ amount: 1_200_000, unit: '/ đêm' });
    expect(getPlacePrice(makeAttraction(), 'attraction')).toEqual({ amount: 900_000, unit: '/ vé' });
    expect(getPlacePrice(makeRestaurant(), 'restaurant')).toEqual({ amount: 60_000, unit: '/ người' });
    expect(getPlacePrice(makeCafe(), 'cafe')).toEqual({ amount: 45_000, unit: '/ ly' });
  });

  it('chưa có giá hoặc giá = 0 → null', () => {
    expect(getPlacePrice(makeAttraction({ admissionFee: 0 }), 'attraction')).toBeNull();
    expect(getPlacePrice(makeCafe({ price: undefined }), 'cafe')).toBeNull();
  });

  it('nhận biết thành phố đã populate hay chỉ là ObjectId', () => {
    expect(isPopulatedCity('city-dn')).toBe(false);
    expect(isPopulatedCity({ _id: 'c', name: 'Huế' })).toBe(true);
    expect(getCityName('city-dn')).toBe('');
    expect(getCityName({ _id: 'c', name: 'Huế' })).toBe('Huế');
  });
});

describe('utils/trip', () => {
  it('đếm số ngày tính cả ngày đi và ngày về', () => {
    expect(getTripDays(makeTrip())).toBe(3);
    expect(getTripDays(makeTrip({ endDate: '2026-12-01T00:00:00.000Z' }))).toBe(1);
  });

  it('đếm tổng số điểm đến trong lịch trình', () => {
    expect(getTripPlaceCount(makeTrip())).toBe(1);
    expect(getTripPlaceCount(makeTrip({ schedule: [] }))).toBe(0);
  });

  it('đếm tổng chuyến đi của cả 3 nhóm', () => {
    expect(countTrips({ upcoming: [makeTrip()], ongoing: [], past: [makeTrip(), makeTrip()] })).toBe(3);
    expect(countTrips(undefined)).toBe(0);
  });
});
