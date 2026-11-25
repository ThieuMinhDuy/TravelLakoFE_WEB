import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  AIChatProvider,
  AIAssistantFAB,
  AIAssistantPanel,
} from '../../../src/features/AIchat';
import * as aiService from '../../../src/services/aiService';
import { cityService } from '../../../src/services/cityService';
import { useAuthStore } from '../../../src/store/useAuthStore';
import type { AISuggestionResponse } from '../../../src/types';

vi.mock('../../../src/services/aiService');
vi.mock('../../../src/services/cityService', () => ({
  cityService: {
    getCities: vi.fn(),
    getCity: vi.fn(),
  },
}));

describe('Feature: AIchat (<AIAssistantFAB> & <AIAssistantPanel>)', () => {
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
    vi.mocked(cityService.getCities).mockResolvedValue({
      total: 1,
      cities: [
        {
          _id: 'city-dn',
          name: 'Đà Nẵng',
          coordinates: { lat: 16.05, lng: 108.2 },
        },
      ],
    });
  });

  const renderAIChat = (
    initialOpen = false,
    onApplySchedule?: (result: AISuggestionResponse) => void
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

  it('hoạt động độc lập ngoài Redux Provider và bật/tắt Panel qua FAB', async () => {
    const user = userEvent.setup();
    renderAIChat(false);

    expect(screen.queryByText('Trợ lý Du lịch Ảo AI')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Mở Trợ lý Du lịch Ảo AI/i }));
    expect(screen.getByText('Trợ lý Du lịch Ảo AI')).toBeInTheDocument();
    expect(aiService.getChatHistory).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Đóng Trợ lý AI/i }));
    expect(screen.queryByText('Trợ lý Du lịch Ảo AI')).not.toBeInTheDocument();
  });

  it('cho phép chuyển tab, gửi tin nhắn chat và chọn thành phố gợi ý bằng AI', async () => {
    const user = userEvent.setup();
    const onApplySchedule = vi.fn();

    vi.mocked(aiService.sendChatMessage).mockResolvedValue({
      reply: 'Bạn nên thử Phở Thìn và Bún Chả Hàng Mành!',
      timestamp: '2026-11-25T15:00:00.000Z',
    });
    vi.mocked(aiService.generateAISuggestion).mockResolvedValue({
      success: true,
      city: { _id: 'city-dn', name: 'Đà Nẵng' },
      suggestedTitle: 'Đà Nẵng 3 ngày cực chill',
      estimatedTotalCost: 2500000,
      schedule: [
        {
          _id: 'd1',
          day: 1,
          date: '2026-11-26',
          places: [
            {
              _id: 'sp1',
              placeType: 'Attraction',
              placeId: 'p1',
              order: 0,
              note: 'Bãi biển Mỹ Khê',
              visited: false,
            },
          ],
        },
      ],
    });

    renderAIChat(true, onApplySchedule);

    const input = screen.getByPlaceholderText(/Hỏi AI bất cứ điều gì/i);
    await user.type(input, 'Gợi ý món ngon Hà Nội');
    await user.click(screen.getByRole('button', { name: /Gửi tin nhắn/i }));

    await waitFor(() => {
      expect(screen.getByText('Gợi ý món ngon Hà Nội')).toBeInTheDocument();
      expect(
        screen.getByText('Bạn nên thử Phở Thìn và Bún Chả Hàng Mành!')
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Gợi ý mới/i }));
    expect(screen.getByText('Sinh lịch trình du lịch tự động')).toBeInTheDocument();

    const citySelect = await screen.findByLabelText(/Thành phố điểm đến/i);
    await user.selectOptions(citySelect, 'city-dn');
    await user.click(screen.getByRole('button', { name: /Tạo gợi ý lịch trình thông minh/i }));

    await waitFor(() => {
      expect(screen.getByText('Đà Nẵng 3 ngày cực chill')).toBeInTheDocument();
    });
    // Không tự động áp dụng trước khi user bấm nút
    expect(onApplySchedule).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Áp dụng lịch trình này/i }));
    expect(onApplySchedule).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /Tối ưu lộ trình/i }));
    expect(
      screen.getByText(/Vui lòng mở một chuyến đi cụ thể/i)
    ).toBeInTheDocument();
  });
});
