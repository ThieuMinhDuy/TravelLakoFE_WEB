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
    fireEvent.change(screen.getByLabelText('Số địa điểm mới tối đa mỗi loại'), { target: { value: '50' } });
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
    expect(await screen.findByText('Không còn địa điểm mới cho Hội An')).toBeInTheDocument();
    expect(screen.getByText(/Không còn địa điểm mới trong khu vực này/)).toBeInTheDocument();
  });

  it('lỗi khác (500) → thông báo chung, thử lại được ngay', async () => {
    vi.mocked(adminService.importOsm)
      .mockRejectedValueOnce(new ApiError('Internal error', { status: 500 }))
      .mockResolvedValueOnce({ message: 'ok', stats: stats(3) });
    renderWithProviders(<AdminImportPage />);
    await screen.findByRole('option', { name: 'Hội An' });

    await userEvent.selectOptions(select(), 'id:c1');
    await submit();
    expect(await screen.findByText('Máy chủ gặp sự cố, vui lòng thử lại sau')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText(/Đã thêm/)).toBeInTheDocument();
    expect(adminService.importOsm).toHaveBeenCalledTimes(2);
  });

  it('OSM_UNAVAILABLE kèm retryAfter → báo số giây, khóa nút thử lại, đánh dấu lỗi ở bước lấy dữ liệu', async () => {
    vi.mocked(adminService.importOsm).mockRejectedValueOnce(
      new ApiError('All OpenStreetMap Overpass servers are currently busy or timed out.', {
        status: 503,
        code: 'OSM_UNAVAILABLE',
        data: { message: '...', code: 'OSM_UNAVAILABLE', retryAfter: 45 },
      })
    );
    renderWithProviders(<AdminImportPage />);
    await screen.findByRole('option', { name: 'Hội An' });

    await userEvent.selectOptions(select(), 'id:c1');
    await submit();
    expect(
      await screen.findByText('Máy chủ OpenStreetMap đang bận. Vui lòng thử lại sau 45 giây.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thử lại sau 45s/ })).toBeDisabled();
    expect(screen.getByText(/Lấy dữ liệu từ OpenStreetMap/).closest('li')).toHaveClass('is-failed');
  });

  it('OSM_UNAVAILABLE không kèm retryAfter → vẫn khóa nút 60 giây', async () => {
    vi.mocked(adminService.importOsm).mockRejectedValueOnce(
      new ApiError('All OpenStreetMap Overpass servers are currently busy or timed out.', {
        status: 503,
        code: 'OSM_UNAVAILABLE',
      })
    );
    renderWithProviders(<AdminImportPage />);
    await screen.findByRole('option', { name: 'Hội An' });

    await userEvent.selectOptions(select(), 'id:c1');
    await submit();
    expect(await screen.findByRole('button', { name: /Thử lại sau 60s/ })).toBeDisabled();
  });

  it('không tìm được tọa độ (GEOCODE_FAILED) → báo ngay ở ô thành phố, không có nút thử lại', async () => {
    vi.mocked(adminService.importOsm).mockRejectedValueOnce(
      new ApiError('Không thể tìm thấy tọa độ cho thành phố "Huế". Vui lòng kiểm tra lại chính tả!', {
        status: 400,
        code: 'GEOCODE_FAILED',
      })
    );
    renderWithProviders(<AdminImportPage />);
    await screen.findByRole('option', { name: 'Huế' });

    await userEvent.selectOptions(select(), 'name:Huế');
    await submit();
    expect(await screen.findByText(/Không thể tìm thấy tọa độ cho thành phố "Huế"/)).toHaveClass(
      'ui-select-message--error'
    );
    expect(select()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Thử lại/ })).not.toBeInTheDocument();
  });

  it('nguồn dự phòng (source = nominatim) → hiện ghi chú; nguồn chính thì không', async () => {
    vi.mocked(adminService.importOsm)
      .mockResolvedValueOnce({ message: 'ok', source: 'nominatim', stats: stats(5) })
      .mockResolvedValueOnce({ message: 'ok', source: 'overpass', stats: stats(5) });
    renderWithProviders(<AdminImportPage />);
    await screen.findByRole('option', { name: 'Hội An' });

    await userEvent.selectOptions(select(), 'id:c1');
    await submit();
    expect(await screen.findByText(/đã dùng nguồn dự phòng/)).toHaveAttribute('role', 'note');

    await submit();
    await waitFor(() => expect(adminService.importOsm).toHaveBeenCalledTimes(2));
    await screen.findByText(/Đã thêm/);
    expect(screen.queryByText(/đã dùng nguồn dự phòng/)).not.toBeInTheDocument();
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
    expect(screen.getByLabelText('Số địa điểm mới tối đa mỗi loại')).toHaveAttribute('max', '50');

    await userEvent.selectOptions(select(), 'id:c1');
    await submit();
    expect(await screen.findByText(/Máy chủ chưa bật AI/)).toBeInTheDocument();
  });

  it('lỗi: quá thời gian chờ (ECONNABORTED) → báo máy chủ phản hồi quá lâu, thử lại được ngay', async () => {
    vi.mocked(adminService.importOsm).mockRejectedValueOnce(
      new ApiError('timeout of 210000ms exceeded', { status: null, code: 'ECONNABORTED' })
    );
    renderWithProviders(<AdminImportPage />);
    await screen.findByRole('option', { name: 'Hội An' });

    await userEvent.selectOptions(select(), 'id:c1');
    await submit();
    expect(await screen.findByText('Máy chủ phản hồi quá lâu, vui lòng thử lại')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeEnabled();
  });

  it('lỗi: mất kết nối mạng → hiện thông báo, không hiện kết quả import', async () => {
    vi.mocked(adminService.importOsm).mockRejectedValueOnce(
      new ApiError('Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.', { status: null })
    );
    renderWithProviders(<AdminImportPage />);
    await screen.findByRole('option', { name: 'Hội An' });

    await userEvent.selectOptions(select(), 'name:Hội An');
    await submit();
    expect(await screen.findByText('Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.')).toBeInTheDocument();
    expect(screen.queryByText(/Đã thêm/)).not.toBeInTheDocument();
  });
});
