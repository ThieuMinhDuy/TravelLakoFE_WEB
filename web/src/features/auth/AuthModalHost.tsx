import React from 'react';
import type { Location } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { env } from '../../config/env';
import { AuthModalRoutes } from './AuthModalRoutes';

interface AuthModalHostProps {
  open: boolean;
  location: Location;
}

/** Chỉ nạp Google Identity SDK khi đã cấu hình VITE_GOOGLE_CLIENT_ID */
const GoogleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  env.GOOGLE_CLIENT_ID ? (
    <GoogleOAuthProvider clientId={env.GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>
  ) : (
    <>{children}</>
  );

/**
 * Điểm vào của popup xác thực — được lazy-load thành chunk riêng cùng framer-motion,
 * zod, react-hook-form và Google SDK (chỉ cần khi người dùng mở popup).
 */
export const AuthModalHost: React.FC<AuthModalHostProps> = ({ open, location }) => (
  <GoogleProvider>
    {/* Tôn trọng cài đặt "giảm chuyển động" của hệ điều hành */}
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {/* Khi đóng, AnimatePresence giữ lại phần tử cũ (với location cũ) để chạy hiệu ứng thoát */}
        {open && <AuthModalRoutes key="auth-modal" location={location} />}
      </AnimatePresence>
    </MotionConfig>
  </GoogleProvider>
);
