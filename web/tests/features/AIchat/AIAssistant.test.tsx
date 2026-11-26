import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  AIChatProvider,
  AIAssistantFAB,
  AIAssistantPanel,
  formatPlainChatText,
  isScheduleMessage,
} from '../../../src/features/AIchat';
import * as aiService from '../../../src/services/aiService';
import { useAuthStore } from '../../../src/store/useAuthStore';
import type { AISuggestionResponse } from '../../../src/types';

vi.mock('../../../src/services/aiService');

describe('Feature: AIchat (<AIAssistantFAB>, <AIAssistantPanel> & formatting)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.mocked(aiService.getChatHistory).mockResolvedValue({ messages: [] });
  });

  const renderAIChat = (
    initialOpen = false,
    onApplySchedule?: (result: AISuggestionResponse) => Promise<void> | void
  ) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AIChatProvider initialProps={{ isAIPanelOpen: initialOpen }}>
          <AIAssistantFAB />
          <AIAssistantPanel onApplySchedule={onApplySchedule} />
        </AIChatProvider>
      </QueryClientProvider>
    );
  };

  it('chatFormatting loại bỏ ký tự Markdown thô và nhận diện đúng tin nhắn lịch trình', () => {
    const rawSchedule = [
      '### **Ngày 1: Khám phá Hà Nội**',
      '* **Sáng:** Nghỉ ngơi tại **Somerset Grand Hanoi (2.500.000đ/đêm)**.',
      '* **Chiều:** Ăn **Bánh Tôm Hồ Tây (120.000đ)**.',
    ].join('\n');

    const cleaned = formatPlainChatText(rawSchedule);
    expect(cleaned).not.toContain('###');
    expect(cleaned).not.toContain('**');
    expect(cleaned).toContain('Ngày 1: Khám phá Hà Nội');
    expect(cleaned).toContain('• Sáng: Nghỉ ngơi tại Somerset Grand Hanoi (2.500.000đ/đêm).');

    expect(isScheduleMessage(rawSchedule)).toBe(true);
    expect(isScheduleMessage('Bạn nên thử **Phở Thìn (60.000đ)** ở Hà Nội!')).toBe(false);
  });

  it('nút FAB chỉ hiển thị logo web và hiện nhắc nhở khi đã đăng nhập nhưng chưa dùng AI chat', async () => {
    const user = userEvent.setup();
    renderAIChat(false);

    expect(screen.queryByText('Trợ lý Du lịch Ảo AI')).not.toBeInTheDocument();
    expect(screen.queryByText(/GEMINI/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Bạn chưa thử Trợ lý AI/i)).not.toBeInTheDocument();
    expect(screen.getByAltText('Logo TripMate')).toBeInTheDocument();

    // Đăng nhập với lịch sử chat trống -> hiện câu nhắc nhở
    useAuthStore.getState().setAuth(
      { _id: 'u-fresh', name: 'An', email: 'an@gmail.com' },
      'token-abc',
      true
    );
    expect(await screen.findByText(/Bạn chưa thử Trợ lý AI!/i)).toBeInTheDocument();

    // Bấm vào câu nhắc nhở -> mở Panel và ẩn nhắc nhở
    await user.click(screen.getByText(/Bạn chưa thử Trợ lý AI!/i));
    expect(screen.getByText('Trợ lý Du lịch Ảo AI')).toBeInTheDocument();
    expect(screen.queryByText(/Bạn chưa thử Trợ lý AI!/i)).not.toBeInTheDocument();
  });

  it('không hiện nhắc nhở nếu người dùng đã từng sử dụng AI chat trước đó', async () => {
    vi.mocked(aiService.getChatHistory).mockResolvedValue({
      messages: [
        { role: 'user', content: 'Gợi ý Đà Lạt' },
        { role: 'model', content: 'Bạn có thể đi Hồ Xuân Hương (0đ).' },
      ],
    });
    useAuthStore.getState().setAuth(
      { _id: 'u-used', name: 'Bình', email: 'binh@gmail.com' },
      'token-xyz',
      true
    );

    renderAIChat(false);

    await waitFor(() => {
      expect(aiService.getChatHistory).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByText(/Bạn chưa thử Trợ lý AI!/i)).not.toBeInTheDocument();
  });

  it('hoạt động độc lập ngoài Redux Provider và bật/tắt Panel qua FAB (chỉ còn 2 tab)', async () => {
    const user = userEvent.setup();
    renderAIChat(false);

    expect(screen.queryByText('Trợ lý Du lịch Ảo AI')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Mở Trợ lý Du lịch Ảo AI/i }));
    expect(screen.getByText('Trợ lý Du lịch Ảo AI')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Gợi ý mới/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Trò chuyện/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tối ưu lộ trình/i })).toBeInTheDocument();
    expect(aiService.getChatHistory).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Đóng Trợ lý AI/i }));
    expect(screen.queryByText('Trợ lý Du lịch Ảo AI')).not.toBeInTheDocument();
  });

  it('format câu trả lời sạch ký tự đặc biệt và hiện nút Lưu lịch trình khi AI trả lịch trình cụ thể', async () => {
    const user = userEvent.setup();
    const onApplySchedule = vi.fn().mockResolvedValue(undefined);

    const scheduleMarkdown = [
      '### **Ngày 1: Trải nghiệm Hà Nội**',
      '* **Sáng:** Tham quan **Nhà 48 phố Hàng Ngang (0đ)**.',
      '* **Chiều:** Thưởng thức **Bánh Tôm Hồ Tây (120.000đ)**.',
      '* **Tối:** Dạo **Chợ Đêm Hàng Đào (0đ)**.',
    ].join('\n');

    vi.mocked(aiService.sendChatMessage)
      .mockResolvedValueOnce({
        reply: 'Bạn nên thử **Phở Thìn (60.000đ)** nhé!',
        timestamp: '2026-11-26T10:00:00.000Z',
      })
      .mockResolvedValueOnce({
        reply: scheduleMarkdown,
        timestamp: '2026-11-26T10:01:00.000Z',
      });

    vi.mocked(aiService.generateAISuggestion).mockResolvedValue({
      success: true,
      city: { _id: 'city-hn', name: 'Hà Nội' },
      suggestedTitle: 'Hà Nội 1 ngày trọn vẹn',
      estimatedTotalCost: 500000,
      schedule: [
        {
          _id: 'd1',
          day: 1,
          date: '2026-11-27',
          places: [
            {
              _id: 'sp1',
              placeType: 'Attraction',
              placeId: 'p1',
              order: 0,
              note: 'Nhà 48 phố Hàng Ngang',
              visited: false,
            },
          ],
        },
      ],
    });

    renderAIChat(true, onApplySchedule);

    // 1. Câu hỏi gợi ý đơn lẻ -> format sạch **, không hiện nút Lưu lịch trình
    const input = screen.getByPlaceholderText(/Hỏi AI bất cứ điều gì/i);
    await user.type(input, 'Gợi ý món ngon Hà Nội');
    await user.click(screen.getByRole('button', { name: /Gửi tin nhắn/i }));

    await waitFor(() => {
      expect(screen.getByText('Phở Thìn (60.000đ)')).toBeInTheDocument();
    });
    expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Lưu lịch trình/i })).not.toBeInTheDocument();

    // 2. Tin nhắn chứa lịch trình theo ngày -> không còn ### / ** và hiện nút Lưu lịch trình
    await user.type(input, 'Lập lịch trình Hà Nội 1 ngày ngân sách 1 triệu');
    await user.click(screen.getByRole('button', { name: /Gửi tin nhắn/i }));

    const saveBtn = await screen.findByRole('button', { name: /Lưu lịch trình/i });
    expect(screen.getByText('Ngày 1: Trải nghiệm Hà Nội')).toBeInTheDocument();
    expect(screen.queryByText(/###|\*\*/)).not.toBeInTheDocument();

    await user.click(saveBtn);

    await waitFor(() => {
      expect(aiService.generateAISuggestion).toHaveBeenCalledWith({
        isParse: true,
        notes: scheduleMarkdown,
      });
      expect(onApplySchedule).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByRole('button', { name: /Đã lưu lịch trình/i })).toBeInTheDocument();

    // 3. Chuyển tab sang Tối ưu lộ trình vẫn hoạt động
    await user.click(screen.getByRole('button', { name: /Tối ưu lộ trình/i }));
    expect(
      screen.getByText(/Vui lòng mở một chuyến đi cụ thể/i)
    ).toBeInTheDocument();
  });
});
