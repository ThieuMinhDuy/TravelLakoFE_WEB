import React, { useCallback, useEffect, useRef } from 'react';
import { Route, Routes, useNavigate, type Location } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthModal } from './components/AuthModal';
import { slideVariants } from './components/motion';
import { AUTH_DEPTH, type AuthModalState } from './authPaths';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyOtpPage } from './pages/VerifyOtpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

/** Hướng trượt dựa trên "chiều sâu" của màn trước và màn hiện tại */
function useSlideDirection(pathname: string) {
  const depth = AUTH_DEPTH[pathname] ?? 0;
  const prevDepth = useRef<number | null>(null);
  const direction = prevDepth.current === null ? 0 : depth >= prevDepth.current ? 1 : -1;

  useEffect(() => {
    prevDepth.current = depth;
  }, [depth]);

  return direction;
}

interface AuthModalRoutesProps {
  /** Location của màn auth — được "đóng băng" khi popup đang chạy hiệu ứng đóng */
  location: Location;
}

/** Popup xác thực: render các màn auth phủ lên trang phía sau */
export const AuthModalRoutes: React.FC<AuthModalRoutesProps> = ({ location }) => {
  const navigate = useNavigate();
  const direction = useSlideDirection(location.pathname);
  const background = (location.state as AuthModalState | null)?.backgroundLocation;

  const close = useCallback(() => {
    // Mở từ trong app (có trang nền) → lùi lịch sử về đúng trang đó.
    // Mở trực tiếp bằng URL → về trang chủ.
    if (background) navigate(-1);
    else navigate('/', { replace: true });
  }, [background, navigate]);

  return (
    <AuthModal onClose={close}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={location.pathname}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          <Routes location={location}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </AuthModal>
  );
};
