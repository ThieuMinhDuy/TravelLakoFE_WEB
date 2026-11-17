import React, { useEffect } from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';
import './css/Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = `ui-modal__dialog--${maxWidth}`;

  return (
    <div className="ui-modal">
      {/* Backdrop */}
      <div
        className="ui-modal__backdrop"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        className={cn(
          'ui-modal__dialog',
          maxWidthClass,
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="ui-modal__header">
            <div>
              {title && (
                <h3 className="ui-modal__title">{title}</h3>
              )}
              {description && (
                <p className="ui-modal__description">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ui-modal__close-btn"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="ui-modal__body">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="ui-modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
