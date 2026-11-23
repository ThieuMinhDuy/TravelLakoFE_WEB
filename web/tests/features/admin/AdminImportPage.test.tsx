import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminImportPage } from '@/features/admin/pages/AdminImportPage';
import { adminService } from '@/features/admin/services/adminService';
import { ApiError } from '@/services/apiError';
import { renderWithProviders } from '../../helpers/renderWithProviders';

vi.mock('@/features/admin/services/adminService', () => ({
  adminService: { getCities: vi.fn(), getVietnamCities: vi.fn(), importOsm: vi.fn() },
}));

const stats = (total: number) => ({
  hotelsImported: total,
  attractionsImported: 0,
  restaurantsImported: 0,
  cafesImported: 0,
  totalImported: total,
});

const select = () => screen.getByLabelText(/Thành phố/) as HTMLSelectElement;
const submit = () => userEvent.click(screen.getByRole('button', { name: 'Bắt đầu import' }));

describe('Trang import OpenStreetMap', () => {
  beforeEach(() => {
    // "Da Lat" (không dấu) đã có trong DB → "Đà Lạt" trong danh sách gợi ý phải được coi là đã có
    vi.mocked(adminService.getCities).mockResolvedValue({
      total: 1,
      cities: [{ _id: 'c1', name: 'Da Lat', coordinates: { lat: 11.9, lng: 108.4 } }],
    });
    vi.mocked(adminService.getVietnamCities).mockResolvedValue(['Đà Lạt', 'Hội An', 'Huế']);
  });
  afterEach(() => vi.clearAllMocks());

  it('chia 2 nhóm; tên đã có (không phân biệt dấu) không nằm ở nhóm "thêm mới"', async () => {
    renderWithProviders(<AdminImportPage />);
    await screen.findByRole('option', { name: 'Hội An' });

    const existing = within(select()).getByRole('group', { name: /đã có/ });
    const fresh = within(select()).getByRole('group', { name: /Thêm thành phố mới/ });
    expect(within(existing).getAllByRole('option').map((o) => o.textContent)).toEqual(['Da Lat']);
    expect(within(fresh).getAllByRole('option').map((o) => o.textContent)).toEqual(['Hội An', 'Huế']);
  });

  it('chưa chọn thành phố → báo lỗi, không gọi API', async () => {
    renderWithProviders(<AdminImportPage />);
    await screen.findByRole('option', { name: 'Hội An' });
    await submit();
    expect(await screen.findByText('Vui lòng chọn thành phố')).toBeInTheDocument();
    expect(adminService.importOsm).not.toHaveBeenCalled();
  });

  it('thành phố đã có → gửi cityId; thanh trượt đổi limit; hiện kết quả', async () => {
    vi.mocked(adminService.importOsm).mockResolvedValue({ message: 'ok', stats: stats(12) });
    renderWithProviders(<AdminImportPage />);
    await screen.findByRole('option', { name: 'Hội An' });

    await userEvent.selectOptions(select(), 'id:c1');
    fireEvent.change(screen.getByLabelText('Số địa điểm tối đa mỗi loại'), { target: { value: '50' } });
    await submit();

    await waitFor(() => expect(adminService.importOsm).toHaveBeenCalledWith({ cityId: 'c1', limit: 50 }));
    expect(await screen.findByText(/Đã thêm/)).toHaveTextContent('Đã thêm 12 địa điểm cho Da Lat');
    expect(screen.getByRole('link', { name: /Xem địa điểm vừa nhập/ })).toHaveAttribute('href', '/admin/places?city=c1');
  });

  it('thành phố mới → gửi cityName; không có địa điểm mới → báo rõ', async () => {
    vi.mocked(adminService.importOsm).mockResolvedValue({ message: 'ok', stats: stats(0) });
    renderWithProviders(<AdminImportPage />);
    await screen.findByRole('option', { name: 'Hội An' });

    await userEvent.selectOptions(select(), 'name:Hội An');
    expect(screen.getByText(/chưa có — hệ thống sẽ tự tạo/)).toBeInTheDocument();
    await submit();

    await waitFor(() => expect(adminService.importOsm).toHaveBeenCalledWith({ cityName: 'Hội An', limit: 30 }));
    expect(await screen.findByText('Không có địa điểm mới cho Hội An')).toBeInTheDocument();
  });

  it('máy chủ OSM bận (503) → thông báo tiếng Việt, có nút thử lại', async () => {
    vi.mocked(adminService.importOsm)
      .mockRejectedValueOnce(
        new ApiError('All OpenStreetMap Overpass servers are currently busy or timed out.', { status: 503 })
      )
      .mockResolvedValueOnce({ message: 'ok', stats: stats(3) });
    renderWithProviders(<AdminImportPage />);
    await screen.findByRole('option', { name: 'Hội An' });

    await userEvent.selectOptions(select(), 'id:c1');
    await submit();
    expect(await screen.findByText(/Máy chủ OpenStreetMap đang bận/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText(/Đã thêm/)).toBeInTheDocument();
    expect(adminService.importOsm).toHaveBeenCalledTimes(2);
  });

  it('hiển thị kết quả AI: số địa điểm AI viết, số dùng mẫu, loại AI chưa xử lý được', async () => {
    vi.mocked(adminService.importOsm).mockResolvedValue({
      message: 'ok',
      stats: stats(5),
      enrichment: { aiGenerated: 4, templateGenerated: 1, geminiEnabled: true, failedTypes: ['Attraction'] },
    });
    renderWithProviders(<AdminImportPage />);
    await screen.findByRole('option', { name: 'Hội An' });

    await userEvent.selectOptions(select(), 'id:c1');
    await submit();

    expect(await screen.findByText(/địa điểm có mô tả do AI viết/)).toHaveTextContent(
      '4 địa điểm có mô tả do AI viết, 1 địa điểm dùng mô tả mẫu.'
    );
    expect(screen.getByText(/AI chưa xử lý được: Điểm tham quan/)).toBeInTheDocument();
  });

  it('máy chủ chưa bật AI → báo toàn bộ dùng mô tả mẫu; thanh trượt tối đa 50', async () => {
    vi.mocked(adminService.importOsm).mockResolvedValue({
      message: 'ok',
      stats: stats(2),
      enrichment: { aiGenerated: 0, templateGenerated: 2, geminiEnabled: false, failedTypes: [] },
    });
    renderWithProviders(<AdminImportPage />);
    await screen.findByRole('option', { name: 'Hội An' });
    expect(screen.getByLabelText('Số địa điểm tối đa mỗi loại')).toHaveAttribute('max', '50');

    await userEvent.selectOptions(select(), 'id:c1');
    await submit();
    expect(await screen.findByText(/Máy chủ chưa bật AI/)).toBeInTheDocument();
  });
});
