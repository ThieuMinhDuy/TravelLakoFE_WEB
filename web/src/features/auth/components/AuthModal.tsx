import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { X } from 'lucide-react';
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { AuthModalContext } from './AuthModalContext';
import { EASE_OUT, SHAKE_KEYFRAMES } from './motion';
import './css/AuthModal.css';

interface AuthModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

/** Đo chiều cao nội dung để card co giãn mượt khi chuyển màn */
function useContentHeight() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, height };
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, children }) => {
  const shakeControls = useAnimationControls();
  const { ref: contentRef, height } = useContentHeight();
  const cardRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock();
  useFocusTrap(cardRef);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const shake = useCallback(() => {
    void shakeControls.start({ ...SHAKE_KEYFRAMES, transition: { duration: 0.45 } });
  }, [shakeControls]);

  const contextValue = useMemo(() => ({ close: onClose, shake }), [onClose, shake]);

  return (
    <AuthModalContext.Provider value={contextValue}>
      <motion.div
        className="auth-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.05 } }}
        transition={{ duration: 0.25 }}
        // Chỉ đóng khi bấm thẳng vào nền (không đóng khi kéo chọn chữ từ trong card ra ngoài)
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          ref={cardRef}
          className="auth-modal__card"
          role="dialog"
          aria-modal="true"
          aria-label="Xác thực tài khoản TripMate"
          initial={{ opacity: 0, y: 40, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96, transition: { duration: 0.18 } }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          <motion.div animate={shakeControls}>
            <button
              type="button"
              className="auth-modal__close"
              onClick={onClose}
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            <motion.div
              className="auth-modal__viewport"
              animate={{ height }}
              transition={{ duration: 0.32, ease: EASE_OUT }}
            >
              <div ref={contentRef} className="auth-modal__content">
                {children}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AuthModalContext.Provider>
  );
};
