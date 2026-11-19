import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import './css/Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  /** Tên của hộp thoại cho trình đọc màn hình khi không truyền `title` */
  ariaLabel?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

/**
 * Hộp thoại dùng chung: render qua portal ra <body>, role="dialog" + aria-modal,
 * khóa cuộn nền, bẫy focus trong hộp thoại, đóng bằng Esc hoặc bấm ra ngoài.
 */
export const Modal: React.FC<ModalProps> = (props) =>
  props.isOpen ? createPortal(<ModalDialog {...props} />, document.body) : null;

const ModalDialog: React.FC<ModalProps> = ({
  onClose,
  title,
  ariaLabel,
  description,
  children,
  footer,
  maxWidth = 'md',
  className,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useBodyScrollLock();
  useFocusTrap(dialogRef);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="ui-modal">
      {/* Backdrop */}
      <div className="ui-modal__backdrop" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog Content */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn('ui-modal__dialog', `ui-modal__dialog--${maxWidth}`, className)}
      >
        {/* Header */}
        {(title || description) && (
          <div className="ui-modal__header">
            <div>
              {title && (
                <h3 id={titleId} className="ui-modal__title">
                  {title}
                </h3>
              )}
              {description && (
                <p id={descriptionId} className="ui-modal__description">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ui-modal__close-btn"
              type="button"
              aria-label="Đóng hộp thoại"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="ui-modal__body">{children}</div>

        {/* Footer */}
        {footer && <div className="ui-modal__footer">{footer}</div>}
      </div>
    </div>
  );
};
