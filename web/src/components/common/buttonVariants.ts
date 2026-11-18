import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Class của Button — dùng cho phần tử khác cần trông giống nút (vd: `<Link>`),
 * tránh lồng `<button>` trong `<a>` (HTML không hợp lệ, hại a11y).
 * Tách file riêng để Button.tsx chỉ export component (giữ Fast Refresh).
 */
export const buttonVariants = ({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) =>
  cn('ui-button', `ui-button--${variant}`, `ui-button--${size}`, className);
