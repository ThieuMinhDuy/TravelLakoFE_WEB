import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import './css/Drawer.css';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Cạnh màn hình trượt ra */
  side?: 'left' | 'right';
  /** Tiêu đề hiển thị ở đầu drawer (đồng thời là nhãn a11y) */
  title?: string;
  /** Nhãn a11y khi không có tiêu đề hiển thị */
  ariaLabel?: string;
  /** Class cho khung trượt (đổi độ rộng, nền...) */
  className?: string;
  children: React.ReactNode;
}

/**
 * Ngăn kéo trượt từ cạnh màn hình (menu mobile, sidebar admin trên màn nhỏ).
 * Luôn mount để chạy được hiệu ứng CSS khi đóng; lúc đóng gắn `inert` → không focus/click được.
 * Khi mở: khóa cuộn nền, bẫy focus, đóng bằng Esc hoặc bấm ra ngoài.
 */
export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  side = 'right',
  title,
  ariaLabel,
  className,
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useBodyScrollLock(open);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return createPortal(
    <div
      className={cn('ui-drawer', `ui-drawer--${side}`, open && 'ui-drawer--open')}
      inert={!open}
      aria-hidden={!open}
    >
      <div className="ui-drawer__backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        className={cn('ui-drawer__panel', className)}
      >
        {title && (
          <div className="ui-drawer__header">
            <h2 id={titleId} className="ui-drawer__title">
              {title}
            </h2>
            <button type="button" className="ui-drawer__close" onClick={onClose} aria-label="Đóng">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="ui-drawer__body">{children}</div>
      </div>
    </div>,
    document.body
  );
};
