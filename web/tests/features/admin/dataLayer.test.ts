import { apiClient } from '@/services/apiClient';
import { ApiError } from '@/services/apiError';
import { adminService } from '@/features/admin/services/adminService';
import { adminErrorMessage, isCascadeConflict, isCityBlockedByTrips } from '@/features/admin/utils/adminErrors';
import { cityFormSchema, placeFormSchema, toCityDTO, toPlaceDTO } from '@/features/admin/schemas';

afterEach(() => vi.restoreAllMocks());

describe('adminService', () => {
  it('loại bỏ field otp (backend trả nhầm mã OTP) khỏi danh sách và chi tiết user', async () => {
    const leaked = { _id: 'u1', name: 'A', email: 'a@gmail.com', otp: { code: '482913' } };
    vi.spyOn(apiClient, 'get')
      .mockResolvedValueOnce({ data: { total: 1, users: [leaked] } })
      .mockResolvedValueOnce({ data: leaked });

    const list = await adminService.getUsers();
    const detail = await adminService.getUser('u1');

    expect(list.users[0]).not.toHaveProperty('otp');
    expect(detail).not.toHaveProperty('otp');
    expect(list.users[0]).toMatchObject({ _id: 'u1', name: 'A' });
  });

  it('không gửi tham số lọc rỗng lên server', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { total: 0, reviews: [] } });
    await adminService.getReviews({ city: '', itemType: 'Hotel' });
    expect(get).toHaveBeenCalledWith('/admin/reviews', { params: { itemType: 'Hotel' } });
  });

  it('xóa thành phố có cascade → gửi ?cascade=true', async () => {
    const del = vi.spyOn(apiClient, 'delete').mockResolvedValue({ data: { message: 'ok' } });
    await adminService.deleteCity('c1', true);
    expect(del).toHaveBeenCalledWith('/admin/cities/c1', { params: { cascade: 'true' } });
  });
});

describe('adminErrors', () => {
  it('dịch message tiếng Anh của backend', () => {
    expect(adminErrorMessage(new ApiError('City already exists', { status: 400 }))).toBe('Thành phố này đã tồn tại');
    expect(adminErrorMessage(new ApiError('Bạn không thể tự xóa!', { status: 400 }))).toBe('Bạn không thể tự xóa!');
  });

  it('không đưa lỗi validation 500 của Mongoose ra giao diện', () => {
    const err = new ApiError('Hotel validation failed: pricePerNight: Path `pricePerNight` is required.', {
      status: 500,
    });
    expect(adminErrorMessage(err)).not.toContain('validation');
  });

  it('nhận diện lỗi xóa thành phố theo mã: còn địa điểm / còn chuyến đi', () => {
    const conflict = new ApiError('Thành phố này đang chứa 2 địa điểm...', {
      status: 400,
      code: 'CITY_HAS_PLACES',
      data: { message: '...', code: 'CITY_HAS_PLACES', requiresCascade: true, totalPlaces: 2 },
    });
    const blocked = new ApiError('Không thể xóa...', {
      status: 400,
      code: 'CITY_HAS_TRIPS',
      data: { message: '...', code: 'CITY_HAS_TRIPS', totalTrips: 2 },
    });
    expect(isCascadeConflict(conflict)).toBe(true);
    expect(isCityBlockedByTrips(conflict)).toBe(false);
    expect(isCityBlockedByTrips(blocked)).toBe(true);
    expect(isCascadeConflict(new ApiError('City not found', { status: 404, code: 'CITY_NOT_FOUND' }))).toBe(false);
  });

  it('lỗi validate có mã hiện nguyên câu tiếng Việt (có thể gồm nhiều lỗi)', () => {
    const text = 'Vui lòng nhập vĩ độ (lat) của thành phố. Vui lòng nhập kinh độ (lng) của thành phố';
    expect(adminErrorMessage(new ApiError(text, { status: 400, code: 'VALIDATION_ERROR' }))).toBe(text);
  });
});

describe('schemas', () => {
  const base = {
    name: 'Colline',
    city: 'c1',
    description: '',
    address: '',
    images: [],
    coordinates: { lat: 11.94, lng: 108.43 },
  };

  it('khách sạn bắt buộc giá mỗi đêm, số sao 1–5', () => {
    expect(placeFormSchema.safeParse({ type: 'hotel', ...base }).success).toBe(false);
    expect(placeFormSchema.safeParse({ type: 'hotel', ...base, pricePerNight: 1_600_000, stars: 6 }).success).toBe(
      false
    );
    expect(placeFormSchema.safeParse({ type: 'hotel', ...base, pricePerNight: 1_600_000, stars: 4 }).success).toBe(
      true
    );
  });

  it('thiếu tọa độ hoặc tọa độ ngoài khoảng bị chặn', () => {
    expect(placeFormSchema.safeParse({ type: 'cafe', ...base, coordinates: { lat: 91, lng: 0 } }).success).toBe(false);
    expect(
      cityFormSchema.safeParse({ name: 'Đà Lạt', description: '', image: '', coordinates: { lat: 11 } }).success
    ).toBe(false);
  });

  it('chuyển giá trị form sang body API: bỏ `type`, field trống và chuỗi rỗng của thành phố', () => {
    const parsed = placeFormSchema.parse({ type: 'attraction', ...base });
    expect(toPlaceDTO(parsed)).not.toHaveProperty('type');
    expect(toPlaceDTO(parsed)).not.toHaveProperty('admissionFee');

    const city = toCityDTO({ name: 'Huế', description: '', image: '', coordinates: { lat: 16.46, lng: 107.59 } });
    expect(city).toEqual({ name: 'Huế', coordinates: { lat: 16.46, lng: 107.59 } });
  });
});
