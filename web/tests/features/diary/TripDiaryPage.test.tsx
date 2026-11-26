import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LocaleProvider } from '@/contexts/locale/LocaleProvider';
import { ToastProvider } from '@/contexts/toast/ToastProvider';
import * as tripService from '@/services/tripService';
import { uploadService } from '@/services/uploadService';
import type { TripDetail } from '@/types/trip';
import { TripDiaryPage } from '@/features/diary/pages/TripDiaryPage';
import { mockTripDetail } from '../tripschedule/mockTripData';

vi.mock('@/services/tripService');
vi.mock('@/services/uploadService', () => ({
  uploadService: {
    uploadImage: vi.fn(),
  },
}));

const pastEmptyTrip: TripDetail = {
  ...mockTripDetail,
  _id: 'trip_past_1',
  title: 'Hà Nội mùa thu 2025',
  startDate: '2025-10-10T00:00:00.000Z',
  endDate: '2025-10-12T00:00:00.000Z',
  diary: { notes: '', photos: [] },
};

function renderDiaryDetailRoute(initialEntry = '/trips/trip_past_1/diary') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
              <Route path="/trips/:id/diary" element={<TripDiaryPage />} />
              <Route path="/diary" element={<div>Trang danh sách nhật ký</div>} />
              <Route path="/trips/:id" element={<div>Trang chi tiết lịch trình</div>} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}

describe('TripDiaryPage (/trips/:id/diary)', () => {
  const origCreateObjectURL = URL.createObjectURL;
  const origRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:preview-mock');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    URL.createObjectURL = origCreateObjectURL;
    URL.revokeObjectURL = origRevokeObjectURL;
  });

  it('hiển thị thông tin chuyến đi đã kết thúc, banner nhắc viết và cột lịch trình gợi nhớ', async () => {
    vi.mocked(tripService.getTripById).mockResolvedValue(pastEmptyTrip);

    renderDiaryDetailRoute();

    expect(await screen.findByRole('heading', { name: 'Hà Nội mùa thu 2025' })).toBeInTheDocument();
    expect(screen.getByText(/Chuyến đi đã hoàn thành — hãy ghi lại cảm xúc/i)).toBeInTheDocument();
    expect(screen.getByText(/Lịch trình gợi nhớ \(5 điểm\)/i)).toBeInTheDocument();
    expect(screen.getByText('Hồ Hoàn Kiếm')).toBeInTheDocument();
    expect(screen.getAllByText('Đã ghé').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Lưu nhật ký/i })).toBeDisabled();
  });

  it('hiển thị màn hình lỗi và cho phép thử lại khi API thất bại', async () => {
    const user = userEvent.setup();
    vi.mocked(tripService.getTripById)
      .mockRejectedValueOnce(new Error('Bạn không có quyền truy cập'))
      .mockResolvedValueOnce(pastEmptyTrip);

    renderDiaryDetailRoute();

    expect(await screen.findByText('Không tải được nhật ký chuyến đi')).toBeInTheDocument();
    expect(screen.getByText('Bạn không có quyền truy cập')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Thử lại/i }));
    expect(await screen.findByRole('heading', { name: 'Hà Nội mùa thu 2025' })).toBeInTheDocument();
  });

  it('cho phép viết cảm nhận, upload ảnh (khóa nút lưu khi đang tải), xem lightbox và lưu nhật ký', async () => {
    const user = userEvent.setup();
    let currentTrip: TripDetail = pastEmptyTrip;

    vi.mocked(tripService.getTripById).mockImplementation(async () => currentTrip);
    vi.mocked(tripService.updateTripDiary).mockImplementation(async (_id, payload) => {
      currentTrip = {
        ...currentTrip,
        diary: {
          notes: payload.notes ?? '',
          photos: payload.photos ?? [],
        },
      };
      return {
        ...currentTrip,
        city: currentTrip.city._id,
        schedule: [],
      };
    });

    let resolveUpload!: (val: { message: string; url: string }) => void;
    vi.mocked(uploadService.uploadImage).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpload = resolve;
        })
    );

    const { container } = renderDiaryDetailRoute();

    const textarea = await screen.findByLabelText(/Cảm nhận & trải nghiệm chuyến đi/i);
    await user.type(textarea, 'Phở Bát Đàn sáng sớm rất ngon!');

    const saveBtn = screen.getByRole('button', { name: /Lưu nhật ký/i });
    expect(saveBtn).toBeEnabled();

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['img-bytes'], 'hanoi.jpg', { type: 'image/jpeg' });
    await user.upload(fileInput, mockFile);

    // Đang upload ảnh -> khóa nút lưu
    expect(screen.getByText('Đang tải ảnh lên...')).toBeInTheDocument();
    expect(saveBtn).toBeDisabled();

    resolveUpload({ message: 'ok', url: 'https://cdn.test/hanoi-1.jpg' });

    // Upload xong -> xem trước lightbox hoạt động và mở khóa nút lưu
    const zoomBtn = await screen.findByRole('button', { name: 'Phóng to ảnh 1' });
    await waitFor(() => expect(saveBtn).toBeEnabled());

    await user.click(zoomBtn);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByAltText('Ảnh kỷ niệm 1')).toHaveAttribute(
      'src',
      'https://cdn.test/hanoi-1.jpg'
    );
    await user.click(within(dialog).getByRole('button', { name: 'Đóng hộp thoại' }));

    await user.click(saveBtn);

    await waitFor(() => {
      expect(tripService.updateTripDiary).toHaveBeenCalledWith('trip_past_1', {
        notes: 'Phở Bát Đàn sáng sớm rất ngon!',
        photos: ['https://cdn.test/hanoi-1.jpg'],
      });
    });

    expect(await screen.findByText('Đã lưu nhật ký chuyến đi')).toBeInTheDocument();
  });

  it('cảnh báo khi rời trang có thay đổi chưa lưu và hỗ trợ xóa trắng nhật ký', async () => {
    const user = userEvent.setup();
    const writtenTrip: TripDetail = {
      ...pastEmptyTrip,
      diary: {
        notes: 'Kỷ niệm cũ',
        photos: ['https://cdn.test/1.jpg', 'https://cdn.test/2.jpg'],
      },
    };
    let currentTrip: TripDetail = writtenTrip;

    vi.mocked(tripService.getTripById).mockImplementation(async () => currentTrip);
    vi.mocked(tripService.updateTripDiary).mockImplementation(async (_id, payload) => {
      currentTrip = {
        ...currentTrip,
        diary: {
          notes: payload.notes ?? '',
          photos: payload.photos ?? [],
        },
      };
      return {
        ...currentTrip,
        city: currentTrip.city._id,
        schedule: [],
      };
    });

    renderDiaryDetailRoute();

    const textarea = await screen.findByLabelText(/Cảm nhận & trải nghiệm chuyến đi/i);
    await user.type(textarea, ' thêm mới');

    // Bấm quay lại khi chưa lưu -> hiện dialog xác nhận
    await user.click(screen.getByRole('link', { name: /Tất cả nhật ký/i }));
    expect(screen.getByText('Rời trang khi chưa lưu?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Ở lại viết tiếp/i }));
    expect(screen.queryByText('Rời trang khi chưa lưu?')).not.toBeInTheDocument();

    // Đặt ảnh 2 làm ảnh bìa rồi khôi phục bản nháp
    await user.click(screen.getByRole('button', { name: 'Đặt ảnh 2 làm ảnh bìa' }));
    await user.click(screen.getByRole('button', { name: /Khôi phục/i }));
    expect((textarea as HTMLTextAreaElement).value).toBe('Kỷ niệm cũ');

    // Xóa nhật ký qua ConfirmDialog
    await user.click(screen.getByRole('button', { name: /Xóa nhật ký/i }));
    const confirmDialog = screen.getByRole('dialog');
    await user.click(within(confirmDialog).getByRole('button', { name: /Xóa nhật ký/i }));

    await waitFor(() => {
      expect(tripService.updateTripDiary).toHaveBeenCalledWith('trip_past_1', {
        notes: '',
        photos: [],
      });
    });

    // Sau khi xóa sạch & đồng bộ xong -> rời trang không bị chặn
    await user.click(screen.getByRole('link', { name: /Tất cả nhật ký/i }));
    expect(await screen.findByText('Trang danh sách nhật ký')).toBeInTheDocument();
  });
});

