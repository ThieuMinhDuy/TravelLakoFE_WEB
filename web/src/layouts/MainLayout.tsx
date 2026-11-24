import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MainHeader } from '../components/layout/MainHeader';
import { MainFooter } from '../components/layout/MainFooter';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useToast } from '../contexts/toast/ToastContext';
import { cn } from '../utils/cn';
import { Bot } from 'lucide-react';
import './css/MainLayout.css';

interface MainLayoutProps {
  /** Nội dung hiển thị thay cho <Outlet /> (vd: trang 403 bọc trong layout chính) */
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const toast = useToast();
  const isHome = location.pathname === '/';

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

      {/* Floating AI Bubble (Placeholder theo đặc tả Màn 1 - Màn 8) */}
      <button
        onClick={() => {
          // Placeholder trigger chatbot AI
          toast.info('Trợ lý ảo AI TripMate sẽ sớm ra mắt!', { id: 'ai-coming-soon' });
        }}
        className="main-layout__ai-bubble"
        title="Trợ lý ảo AI TripMate"
        type="button"
      >
        <Bot className="w-6 h-6 animate-pulse" />
        <span className="sr-only">Trợ lý AI</span>
      </button>
    </div>
  );
};
