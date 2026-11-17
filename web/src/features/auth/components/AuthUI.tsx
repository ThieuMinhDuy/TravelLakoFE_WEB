import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, type LucideIcon } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useAuthNavigation } from '../hooks/useAuthNavigation';
import { itemVariants } from './motion';

/** Một dòng trong form — xuất hiện lần lượt theo hiệu ứng stagger của màn cha */
export const AuthItem: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <motion.div variants={itemVariants} className={className}>
    {children}
  </motion.div>
);

interface AuthHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  /** Thay icon bằng phần tử tùy chỉnh (vd: dấu tick thành công) */
  badge?: React.ReactNode;
  centered?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  centered = false,
}) => (
  <AuthItem className={cn('auth-header', centered && 'auth-header--centered')}>
    {badge ??
      (Icon && (
        <span className="auth-header__badge">
          <Icon className="w-4 h-4" />
        </span>
      ))}
    <h2 className="auth-header__title">{title}</h2>
    {subtitle && <p className="auth-header__subtitle">{subtitle}</p>}
  </AuthItem>
);

export const AuthDivider: React.FC = () => (
  <AuthItem className="auth-divider">
    <span>hoặc</span>
  </AuthItem>
);

/** Thông báo lỗi từ API, co giãn mượt khi xuất hiện / biến mất */
export const FormAlert: React.FC<{ message?: string | null }> = ({ message }) => (
  <AnimatePresence initial={false}>
    {message && (
      <motion.div
        key="alert"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="auth-alert" role="alert">
          <AlertCircle className="auth-alert__icon" />
          <span>{message}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/** Gợi ý khi máy chủ Render đang "thức dậy" */
export const SlowServerHint: React.FC<{ show: boolean }> = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.p
        className="auth-slow-hint"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
      >
        Máy chủ đang khởi động, lần đầu có thể mất khoảng 30 giây…
      </motion.p>
    )}
  </AnimatePresence>
);

interface AuthLinkProps {
  to: string;
  params?: Record<string, string | undefined>;
  className?: string;
  children: React.ReactNode;
}

/** Link chuyển màn bên trong popup (giữ trang nền + tham số redirect) */
export const AuthLink: React.FC<AuthLinkProps> = ({ to, params, className, children }) => {
  const { buildHref, state } = useAuthNavigation();
  return (
    <Link to={buildHref(to, params)} state={state} replace className={cn('auth-link', className)}>
      {children}
    </Link>
  );
};

export const BackToLogin: React.FC<{ email?: string }> = ({ email }) => (
  <AuthItem className="auth-back">
    <AuthLink to="/login" params={{ email }} className="auth-back__link">
      <ArrowLeft className="w-3.5 h-3.5" />
      Quay lại đăng nhập
    </AuthLink>
  </AuthItem>
);

/** Dấu tick tự vẽ cho màn thành công */
export const SuccessCheck: React.FC = () => (
  <motion.span
    className="auth-header__badge auth-header__badge--success"
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 380, damping: 18 }}
  >
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" aria-hidden="true">
      <motion.path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
      />
    </svg>
  </motion.span>
);
