import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminPlacesPage } from '@/features/admin/pages/AdminPlacesPage';
import { adminService } from '@/features/admin/services/adminService';
import type { AdminPlace } from '@/types/admin';
import { renderWithProviders } from '../../helpers/renderWithProviders';

vi.mock('@/features/admin/services/adminService', () => ({
  adminService: {
    getPlaces: vi.fn(),
    getCities: vi.fn(),
    getStats: vi.fn(),
    createPlace: vi.fn(),
    updatePlace: vi.fn(),
    deletePlace: vi.fn(),
  },
}));

vi.mock('@/components/map', () => ({
  MapPicker: ({ onChange }: { onChange: (v: { lat: number; lng: number }) => void }) => (
    <button type="button" onClick={() => onChange({ lat: 11.95, lng: 108.44 })}>
      Bấm bản đồ
    </button>
  ),
}));

const daLat = { _id: 'c1', name: 'Đà Lạt', coordinates: { lat: 11.9404, lng: 108.4583 } };
const colline = {
  _id: 'p1',
  name: 'Colline Hotel',
  city: { _id: 'c1', name: 'Đà Lạt' },
  address: '10 Phan Bội Châu',
  description: '',
  images: ['https://img/1.jpg'],
  coordinates: { lat: 11.9427, lng: 108.4385 },
  stars: 4,
  pricePerNight: 1_600_000,
  rating: 4.5,
  numReviews: 2,
  createdAt: '2026-11-01T00:00:00.000Z',
} as AdminPlace;

const openCreate = async () => {
  await userEvent.click(await screen.findByRole('button', { name: /Thêm khách sạn/ }));
  return screen.findByRole('dialog', { name: 'Thêm địa điểm' });
};

describe('Trang quản lý địa điểm', () => {
  beforeEach(() => {
    vi.mocked(adminService.getPlaces).mockResolvedValue({ total: 1, places: [colline] });
    vi.mocked(adminService.getCities).mockResolvedValue({ total: 1, cities: [daLat] });
    vi.mocked(adminService.getStats).mockResolvedValue({
      users: 2,
      trips: 0,
      reviews: 2,
      places: { total: 9, attractions: 3, hotels: 1, restaurants: 3, cafes: 2 },
    });
  });
  afterEach(() => vi.clearAllMocks());

  it('hiển thị cột riêng của khách sạn, số đếm theo loại; đổi loại gọi API đúng type', async () => {
    renderWithProviders(<AdminPlacesPage />, { route: '/admin/places' });

    expect(await screen.findByText('Colline Hotel')).toBeInTheDocument();
    expect(screen.getByText('4 sao')).toBeInTheDocument();
    expect(screen.getByText(/1\.600\.000/)).toBeInTheDocument();
    expect(await screen.findByRole('radio', { name: /Quán cafe/ })).toHaveTextContent('2');

    await userEvent.click(screen.getByRole('radio', { name: /Quán cafe/ }));
    await waitFor(() => expect(adminService.getPlaces).toHaveBeenLastCalledWith('cafe', ''));
    expect(screen.getByTestId('location')).toHaveTextContent('type=cafe');
  });

  it('mở từ trang Thành phố (?city=) → lọc theo thành phố phía server', async () => {
    renderWithProviders(<AdminPlacesPage />, { route: '/admin/places?city=c1' });
    await screen.findByText('Colline Hotel');
    expect(adminService.getPlaces).toHaveBeenCalledWith('hotel', 'c1');
  });

  it('thêm khách sạn: bắt buộc giá mỗi đêm; gửi số thật, có hạng sao mặc định, không có rating', async () => {
    vi.mocked(adminService.createPlace).mockResolvedValue({ ...colline, _id: 'p2', city: 'c1' } as never);
    renderWithProviders(<AdminPlacesPage />, { route: '/admin/places?city=c1' });
    await screen.findByText('Colline Hotel');
    const drawer = await openCreate();

    await userEvent.type(within(drawer).getByLabelText(/Tên địa điểm/), 'Ana Mandara');
    await userEvent.click(within(drawer).getByRole('button', { name: 'Lấy tọa độ Đà Lạt' }));
    await userEvent.click(within(drawer).getByRole('button', { name: 'Thêm địa điểm' }));
    expect(await within(drawer).findByText('Vui lòng nhập giá mỗi đêm')).toBeInTheDocument();

    await userEvent.type(within(drawer).getByLabelText(/Giá mỗi đêm/), '2500000');
    expect(within(drawer).getByLabelText(/Giá mỗi đêm/)).toHaveValue('2.500.000');
    await userEvent.click(within(drawer).getByRole('button', { name: 'Thêm địa điểm' }));

    await waitFor(() => expect(adminService.createPlace).toHaveBeenCalled());
    const [type, body] = vi.mocked(adminService.createPlace).mock.calls[0];
    expect(type).toBe('hotel');
    expect(body).toMatchObject({
      name: 'Ana Mandara',
      city: 'c1',
      stars: 3,
      pricePerNight: 2_500_000,
      coordinates: daLat.coordinates,
    });
    expect(body).not.toHaveProperty('rating');
    expect(body).not.toHaveProperty('type');
  });

  it('thêm mới đổi sang loại khác → chỉ gửi field của loại đó', async () => {
    vi.mocked(adminService.createPlace).mockResolvedValue({ ...colline, _id: 'p3' } as never);
    renderWithProviders(<AdminPlacesPage />, { route: '/admin/places?city=c1' });
    await screen.findByText('Colline Hotel');
    const drawer = await openCreate();

    await userEvent.click(within(drawer).getByRole('radio', { name: 'Điểm tham quan' }));
    await userEvent.type(within(drawer).getByLabelText(/Tên địa điểm/), 'Hồ Xuân Hương');
    await userEvent.click(within(drawer).getByRole('button', { name: 'Bấm bản đồ' }));
    await userEvent.click(within(drawer).getByRole('button', { name: 'Thêm địa điểm' }));

    await waitFor(() => expect(adminService.createPlace).toHaveBeenCalled());
    const [type, body] = vi.mocked(adminService.createPlace).mock.calls[0];
    expect(type).toBe('attraction');
    expect(body).not.toHaveProperty('stars');
    expect(body).not.toHaveProperty('pricePerNight');
    expect(body).not.toHaveProperty('admissionFee');
  });

  it('sửa: chỉ gửi field đã đổi', async () => {
    vi.mocked(adminService.updatePlace).mockResolvedValue({ ...colline, city: 'c1' } as never);
    renderWithProviders(<AdminPlacesPage />, { route: '/admin/places' });
    await screen.findByText('Colline Hotel');

    await userEvent.click(screen.getByRole('button', { name: 'Sửa Colline Hotel' }));
    const drawer = await screen.findByRole('dialog', { name: 'Sửa Colline Hotel' });
    expect(within(drawer).queryByRole('radio')).not.toBeInTheDocument(); // không đổi được loại

    const price = within(drawer).getByLabelText(/Giá mỗi đêm/);
    await userEvent.clear(price);
    await userEvent.type(price, '1800000');
    await userEvent.click(within(drawer).getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() =>
      expect(adminService.updatePlace).toHaveBeenCalledWith('hotel', 'p1', { pricePerNight: 1_800_000 })
    );
  });

  it('xóa: xác nhận rồi gọi đúng loại và id', async () => {
    vi.mocked(adminService.deletePlace).mockResolvedValue({ message: 'ok' });
    renderWithProviders(<AdminPlacesPage />, { route: '/admin/places' });
    await screen.findByText('Colline Hotel');

    await userEvent.click(screen.getByRole('button', { name: 'Xóa Colline Hotel' }));
    await userEvent.click(within(screen.getByRole('dialog', { name: 'Xóa địa điểm?' })).getByRole('button', { name: 'Xóa' }));
    await waitFor(() => expect(adminService.deletePlace).toHaveBeenCalledWith('hotel', 'p1'));
  });
});
