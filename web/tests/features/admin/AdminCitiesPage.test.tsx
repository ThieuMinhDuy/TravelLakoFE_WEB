import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminCitiesPage } from '@/features/admin/pages/AdminCitiesPage';
import { adminService } from '@/features/admin/services/adminService';
import { ApiError } from '@/services/apiError';
import type { City } from '@/types/city';
import { renderWithProviders } from '../../helpers/renderWithProviders';

vi.mock('@/features/admin/services/adminService', () => ({
  adminService: { getCities: vi.fn(), createCity: vi.fn(), updateCity: vi.fn(), deleteCity: vi.fn() },
}));

// Leaflet không chạy được trong jsdom → thay bản đồ bằng nút đặt tọa độ cố định
vi.mock('@/components/map', () => ({
  MapPicker: ({ onChange }: { onChange: (v: { lat: number; lng: number }) => void }) => (
    <button type="button" onClick={() => onChange({ lat: 16.4637, lng: 107.5909 })}>
      Bấm bản đồ
    </button>
  ),
}));

const daLat: City = {
  _id: 'c1',
  name: 'Đà Lạt',
  description: 'Thành phố ngàn hoa',
  image: 'https://img/dalat.jpg',
  coordinates: { lat: 11.9404, lng: 108.4583 },
  createdAt: '2026-11-01T00:00:00.000Z',
};
const hoiAn: City = { _id: 'c2', name: 'Hội An', coordinates: { lat: 15.88, lng: 108.33 }, createdAt: '2026-11-10T00:00:00.000Z' };

const openCreate = async () => {
  await userEvent.click(screen.getAllByRole('button', { name: 'Thêm thành phố' })[0]);
  return screen.findByRole('dialog', { name: 'Thêm thành phố' });
};

describe('Trang quản lý thành phố', () => {
  beforeEach(() => {
    vi.mocked(adminService.getCities).mockResolvedValue({ total: 2, cities: [hoiAn, daLat] });
  });
  afterEach(() => vi.clearAllMocks());

  it('sắp xếp theo tên và tìm không phân biệt dấu', async () => {
    renderWithProviders(<AdminCitiesPage />, { route: '/admin/cities' });
    const names = (await screen.findAllByRole('heading', { level: 3 })).map((h) => h.textContent);
    expect(names).toEqual(['Đà Lạt', 'Hội An']);

    await userEvent.type(screen.getByPlaceholderText(/Tìm theo tên/), 'hoi an');
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Hội An']);
  });

  it('thêm mới: bắt buộc tọa độ, không gửi mô tả / ảnh rỗng', async () => {
    vi.mocked(adminService.createCity).mockResolvedValue({ ...hoiAn, _id: 'c3', name: 'Huế' });
    renderWithProviders(<AdminCitiesPage />);
    await screen.findByText('Đà Lạt');
    const drawer = await openCreate();

    await userEvent.type(within(drawer).getByLabelText(/Tên thành phố/), '  Huế ');
    await userEvent.click(within(drawer).getByRole('button', { name: 'Thêm thành phố' }));
    expect(await within(drawer).findByText('Vui lòng nhập vĩ độ (lat)')).toBeInTheDocument();
    expect(adminService.createCity).not.toHaveBeenCalled();

    await userEvent.click(within(drawer).getByRole('button', { name: 'Bấm bản đồ' }));
    expect(within(drawer).getByLabelText('Vĩ độ (lat)')).toHaveValue('16.4637');
    await userEvent.click(within(drawer).getByRole('button', { name: 'Thêm thành phố' }));

    await waitFor(() =>
      expect(adminService.createCity).toHaveBeenCalledWith({ name: 'Huế', coordinates: { lat: 16.4637, lng: 107.5909 } })
    );
  });

  it('tên trùng (400 City already exists) → báo lỗi ngay ở ô tên', async () => {
    vi.mocked(adminService.createCity).mockRejectedValue(
      new ApiError('City already exists', { status: 400, code: 'CITY_EXISTS' })
    );
    renderWithProviders(<AdminCitiesPage />);
    await screen.findByText('Đà Lạt');
    const drawer = await openCreate();

    await userEvent.type(within(drawer).getByLabelText(/Tên thành phố/), 'Đà Lạt');
    await userEvent.type(within(drawer).getByLabelText('Vĩ độ (lat)'), '11,94');
    await userEvent.type(within(drawer).getByLabelText('Kinh độ (lng)'), '108.45');
    await userEvent.click(within(drawer).getByRole('button', { name: 'Thêm thành phố' }));

    // Lỗi gắn vào ô tên (theo mã CITY_EXISTS), không hiện ở khung lỗi chung
    expect(await within(drawer).findByText('Thành phố này đã tồn tại')).toBeInTheDocument();
    expect(within(drawer).queryByRole('alert')).not.toBeInTheDocument();
    expect(adminService.createCity).toHaveBeenCalledWith(
      expect.objectContaining({ coordinates: { lat: 11.94, lng: 108.45 } })
    );
  });

  it('sửa: chỉ gửi field đã đổi', async () => {
    vi.mocked(adminService.updateCity).mockResolvedValue({ ...daLat, description: 'Mới' });
    renderWithProviders(<AdminCitiesPage />);
    await screen.findByText('Đà Lạt');

    await userEvent.click(screen.getAllByRole('button', { name: 'Sửa Đà Lạt' })[1]);
    const drawer = await screen.findByRole('dialog', { name: 'Sửa thành phố Đà Lạt' });
    const desc = within(drawer).getByLabelText('Mô tả');
    await userEvent.clear(desc);
    await userEvent.type(desc, 'Xứ sở sương mù');
    await userEvent.click(within(drawer).getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => expect(adminService.updateCity).toHaveBeenCalledWith('c1', { description: 'Xứ sở sương mù' }));
  });

  it('xóa thành phố còn địa điểm: hỏi lại rồi gọi với cascade=true', async () => {
    vi.mocked(adminService.deleteCity)
      .mockRejectedValueOnce(
        new ApiError('Thành phố này đang chứa 2 địa điểm...', {
          status: 400,
          code: 'CITY_HAS_PLACES',
          data: { message: '...', code: 'CITY_HAS_PLACES', requiresCascade: true, totalPlaces: 2 },
        })
      )
      .mockResolvedValueOnce({ message: 'Đã xóa' });
    renderWithProviders(<AdminCitiesPage />);
    await screen.findByText('Đà Lạt');

    await userEvent.click(screen.getByRole('button', { name: 'Xóa Đà Lạt' }));
    await userEvent.click(within(screen.getByRole('dialog', { name: 'Xóa thành phố?' })).getByRole('button', { name: 'Xóa' }));

    const cascade = await screen.findByRole('dialog', { name: 'Xóa cả 2 địa điểm?' });
    expect(adminService.deleteCity).toHaveBeenLastCalledWith('c1', false);
    await userEvent.click(within(cascade).getByRole('button', { name: 'Xóa thành phố và 2 địa điểm' }));

    await waitFor(() => expect(adminService.deleteCity).toHaveBeenLastCalledWith('c1', true));
  });

  it('xóa thành phố còn chuyến đi (CITY_HAS_TRIPS) → báo không thể xóa, không hỏi cascade', async () => {
    vi.mocked(adminService.deleteCity).mockRejectedValue(
      new ApiError('Không thể xóa thành phố này vì đang có 2 chuyến đi của người dùng.', {
        status: 400,
        code: 'CITY_HAS_TRIPS',
        data: { message: '...', code: 'CITY_HAS_TRIPS', totalTrips: 2 },
      })
    );
    renderWithProviders(<AdminCitiesPage />);
    await screen.findByText('Đà Lạt');

    await userEvent.click(screen.getByRole('button', { name: 'Xóa Đà Lạt' }));
    await userEvent.click(within(screen.getByRole('dialog', { name: 'Xóa thành phố?' })).getByRole('button', { name: 'Xóa' }));

    const blocked = await screen.findByRole('dialog', { name: 'Không thể xóa thành phố' });
    expect(within(blocked).getByText(/2 chuyến đi/)).toBeInTheDocument();
    expect(within(blocked).queryByRole('button', { name: 'Hủy bỏ' })).not.toBeInTheDocument();
    expect(adminService.deleteCity).toHaveBeenCalledTimes(1);
    await userEvent.click(within(blocked).getByRole('button', { name: 'Đã hiểu' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('có người vừa tạo chuyến đi trong lúc xác nhận cascade → cũng báo không thể xóa', async () => {
    vi.mocked(adminService.deleteCity)
      .mockRejectedValueOnce(
        new ApiError('Thành phố này đang chứa 2 địa điểm...', {
          status: 400,
          code: 'CITY_HAS_PLACES',
          data: { message: '...', code: 'CITY_HAS_PLACES', requiresCascade: true, totalPlaces: 2 },
        })
      )
      .mockRejectedValueOnce(
        new ApiError('Không thể xóa thành phố này vì đang có 1 chuyến đi của người dùng.', {
          status: 400,
          code: 'CITY_HAS_TRIPS',
          data: { message: '...', code: 'CITY_HAS_TRIPS', totalTrips: 1 },
        })
      );
    renderWithProviders(<AdminCitiesPage />);
    await screen.findByText('Đà Lạt');

    await userEvent.click(screen.getByRole('button', { name: 'Xóa Đà Lạt' }));
    await userEvent.click(within(screen.getByRole('dialog', { name: 'Xóa thành phố?' })).getByRole('button', { name: 'Xóa' }));
    const cascade = await screen.findByRole('dialog', { name: 'Xóa cả 2 địa điểm?' });
    await userEvent.click(within(cascade).getByRole('button', { name: 'Xóa thành phố và 2 địa điểm' }));

    expect(await screen.findByRole('dialog', { name: 'Không thể xóa thành phố' })).toBeInTheDocument();
  });

  it('sửa: xóa trắng mô tả → gửi chuỗi rỗng để backend xóa; có nút xóa ảnh', async () => {
    vi.mocked(adminService.updateCity).mockResolvedValue({ ...daLat, description: '' });
    renderWithProviders(<AdminCitiesPage />);
    await screen.findByText('Đà Lạt');

    await userEvent.click(screen.getAllByRole('button', { name: 'Sửa Đà Lạt' })[1]);
    const drawer = await screen.findByRole('dialog', { name: 'Sửa thành phố Đà Lạt' });
    expect(within(drawer).getByRole('button', { name: 'Xóa ảnh' })).toBeInTheDocument();
    await userEvent.clear(within(drawer).getByLabelText('Mô tả'));
    await userEvent.click(within(drawer).getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => expect(adminService.updateCity).toHaveBeenCalledWith('c1', { description: '' }));
  });
});
