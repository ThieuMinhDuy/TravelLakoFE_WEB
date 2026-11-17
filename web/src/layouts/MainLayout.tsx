import React from 'react';
import { Outlet } from 'react-router-dom';
import { MainHeader } from '../components/layout/MainHeader';
import { MainFooter } from '../components/layout/MainFooter';
import { Bot } from 'lucide-react';
import './css/MainLayout.css';

export const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      {/* Navigation Header */}
      <MainHeader />

      {/* Main Content Area */}
      <main className="main-layout__content">
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
        className="main-layout__ai-bubble"
        title="Trợ lý ảo AI TravelLako"
        type="button"
      >
        <Bot className="w-6 h-6 animate-pulse" />
        <span className="sr-only">Trợ lý AI</span>
      </button>
    </div>
  );
};
