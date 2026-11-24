import React, { useId, useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { AlertTriangle } from 'lucide-react';
import './css/ConfirmDialog.css';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  /** Nội dung bổ sung dưới message (danh sách hậu quả, cảnh báo...) */
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'accent';
  isLoading?: boolean;
  /**
   * Bắt người dùng gõ đúng chuỗi này mới cho xác nhận — dùng cho thao tác không hoàn tác được
   * (vd: gõ email khi xóa tài khoản). So khớp không phân biệt hoa thường, bỏ khoảng trắng hai đầu.
   */
  requireText?: string;
  /** Chỉ một nút (thông báo không thể thực hiện) — nút xác nhận đóng hộp thoại */
  hideCancel?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  children,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'danger',
  isLoading = false,
  requireText,
  hideCancel = false,
}) => {
  const inputId = useId();
  const [typed, setTyped] = useState('');
  // Reset ô nhập mỗi lần mở lại / đổi đối tượng cần xác nhận
  const [resetKey, setResetKey] = useState({ isOpen, requireText });
  if (resetKey.isOpen !== isOpen || resetKey.requireText !== requireText) {
    setResetKey({ isOpen, requireText });
    setTyped('');
  }

  const matched = !requireText || typed.trim().toLowerCase() === requireText.trim().toLowerCase();

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" ariaLabel={title}>
      <div className="ui-confirm-dialog__content">
        <div
          className={`ui-confirm-dialog__icon-box ${
            variant === 'danger'
              ? 'ui-confirm-dialog__icon-box--danger'
              : 'ui-confirm-dialog__icon-box--accent'
          }`}
        >
          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="ui-confirm-dialog__body">
          <h4 className="ui-confirm-dialog__title">{title}</h4>
          <div className="ui-confirm-dialog__message">{message}</div>
          {children && <div className="ui-confirm-dialog__extra">{children}</div>}
        </div>
      </div>

      {requireText && (
        <form
          className="ui-confirm-dialog__require"
          onSubmit={(e) => {
            e.preventDefault();
            if (matched && !isLoading) onConfirm();
          }}
        >
          <Input
            id={inputId}
            label={`Gõ "${requireText}" để xác nhận`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            autoFocus
          />
        </form>
      )}

      <div className="ui-confirm-dialog__actions">
        {!hideCancel && (
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
        )}
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          size="sm"
          isLoading={isLoading}
          disabled={!matched}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
