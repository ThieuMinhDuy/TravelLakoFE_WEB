import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MainHeader } from '../components/layout/MainHeader';
import { MainFooter } from '../components/layout/MainFooter';
import { cn } from '../utils/cn';
import { Bot } from 'lucide-react';
import { toast } from 'sonner';
import './css/MainLayout.css';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="main-layout">
      {/* Navigation Header */}
      <MainHeader />

      {/* Main Content Area */}
      <main className={cn('main-layout__content', !isHome && 'main-layout__content--subpage')}>
        <Outlet />
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
