import React from 'react';
import { Outlet } from 'react-router-dom';
import { MainHeader } from '../components/layout/MainHeader';
import { MainFooter } from '../components/layout/MainFooter';
import { Bot } from 'lucide-react';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bgApp text-textMain font-sans antialiased">
      {/* Navigation Header */}
      <MainHeader />

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <MainFooter />

      {/* Floating AI Bubble (Placeholder theo đặc tả Màn 1 - Màn 8) */}
      <button
        onClick={() => {
          // Placeholder trigger chatbot AI
          alert('Tính năng Trợ lý ảo AI TravelLako sẽ sớm ra mắt!');
        }}
        className="fixed bottom-6 right-6 z-40 w-13 h-13 rounded-full bg-oceanBlue text-white shadow-xl hover:bg-oceanBlueDark hover:scale-105 active:scale-95 transition-all flex items-center justify-center group focus:outline-none focus:ring-4 focus:ring-sky-200"
        title="Trợ lý ảo AI TravelLako"
      >
        <Bot className="w-6 h-6 animate-pulse" />
        <span className="sr-only">Trợ lý AI</span>
      </button>
    </div>
  );
};
