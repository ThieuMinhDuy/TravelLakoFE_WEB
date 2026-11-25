import React, { lazy, Suspense, useContext, useState, useSyncExternalStore } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ReactReduxContext } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MainHeader } from '../components/layout/MainHeader';
import { MainFooter } from '../components/layout/MainFooter';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { AIAssistantFAB } from '../features/AIchat/components/AIAssistantFAB';
import { queryKeys } from '../lib/queryKeys';
import { addPlaceToSchedule, createTrip } from '../services/tripService';
import { useAIChatContext, useAIChatStoreApi } from '../store/aiChatStore';
import { reduxStore, type RootState } from '../store/reduxStore';
import { useAuthStore } from '../store/useAuthStore';
import type { AISuggestionResponse } from '../types/ai';
import { cn } from '../utils/cn';
import './css/MainLayout.css';

const LazyAIAssistantPanel = lazy(() =>
  import('../features/AIchat/components/AIAssistantPanel').then((m) => ({
    default: m.AIAssistantPanel,
  }))
);

interface MainLayoutProps {
  /** Nội dung hiển thị thay cho <Outlet /> (vd: trang 403 bọc trong layout chính) */
  children?: React.ReactNode;
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isHome = location.pathname === '/';

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAIPanelOpen = useAIChatContext((s) => s.isAIPanelOpen);
  const chatStore = useAIChatStoreApi();
  const [isApplyingSchedule, setIsApplyingSchedule] = useState(false);

  // Đọc currentTrip an toàn ngay cả khi render layout không bọc Redux Provider trong unit test
  const reduxContext = useContext(ReactReduxContext);
  const activeStore = reduxContext?.store ?? reduxStore;
  const currentTrip = useSyncExternalStore(
    activeStore.subscribe,
    () => (activeStore.getState() as RootState).trip.currentTrip
  );

  const handleApplyAISchedule = async (suggested: AISuggestionResponse) => {
    if (!isAuthenticated) {
      chatStore.getState().setAIPanelOpen(false);
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`, {
        state: { backgroundLocation: location },
      });
      return;
    }

    const totalDays = Math.max(1, suggested.schedule?.length || 1);
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + totalDays - 1);

    setIsApplyingSchedule(true);
    try {
      const created = await createTrip({
        title: suggested.suggestedTitle || `Khám phá ${suggested.city?.name || 'du lịch'}`,
        city: suggested.city._id,
        startDate: formatIsoDate(start),
        endDate: formatIsoDate(end),
        budget: suggested.estimatedTotalCost || 0,
      });

      for (const day of suggested.schedule ?? []) {
        for (const place of day.places ?? []) {
          const rawId = place.placeId as unknown;
          const placeId =
            typeof rawId === 'object' && rawId !== null && '_id' in rawId
              ? String((rawId as { _id: string })._id)
              : typeof rawId === 'string'
                ? rawId
                : '';

          if (!placeId) continue;

          try {
            await addPlaceToSchedule(created._id, {
              day: day.day,
              placeType: place.placeType,
              placeId,
              note: place.note || undefined,
            });
          } catch {
            // Bỏ qua địa điểm không hợp lệ để không làm gián đoạn việc tạo chuyến đi
          }
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
      ]);

      chatStore.getState().setAIPanelOpen(false);
      toast.success('Đã tạo chuyến đi từ gợi ý của Trợ lý AI!');
      navigate(`/trips/${created._id}`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Không thể lưu lịch trình gợi ý từ AI.');
    } finally {
      setIsApplyingSchedule(false);
    }
  };

  return (
    <div className="main-layout">
      {/* Navigation Header */}
      <MainHeader />

      {/* Main Content Area — lỗi trong trang chỉ thay vùng nội dung, header/footer vẫn dùng được.
          Chuyển trang khác sẽ tự xóa lỗi. */}
      <main className={cn('main-layout__content', !isHome && 'main-layout__content--subpage')}>
        <ErrorBoundary resetKeys={[location.pathname]}>{children ?? <Outlet />}</ErrorBoundary>
      </main>

      {/* Footer */}
      <MainFooter />

      {/* Trợ lý AI du lịch (lazy-load Panel khi người dùng mở) */}
      <AIAssistantFAB />
      {isAIPanelOpen && (
        <ErrorBoundary fallback={() => null}>
          <Suspense fallback={null}>
            <LazyAIAssistantPanel
              currentTrip={currentTrip}
              onApplySchedule={(result) => void handleApplyAISchedule(result)}
              isApplying={isApplyingSchedule}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
};
