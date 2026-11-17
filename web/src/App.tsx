import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { AppRoutes } from './routes/AppRoutes';
import { env } from './config/env';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

/** Chỉ nạp Google Identity SDK khi đã cấu hình VITE_GOOGLE_CLIENT_ID */
const GoogleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  env.GOOGLE_CLIENT_ID ? (
    <GoogleOAuthProvider clientId={env.GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  ) : (
    <>{children}</>
  );

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleProvider>
        {/* Tôn trọng cài đặt "giảm chuyển động" của hệ điều hành */}
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <AppRoutes />
            <Toaster position="top-right" richColors closeButton />
          </BrowserRouter>
        </MotionConfig>
      </GoogleProvider>
    </QueryClientProvider>
  );
}

export default App;
