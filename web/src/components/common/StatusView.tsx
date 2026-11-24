import React from 'react';
import { cn } from '../../utils/cn';
import './css/StatusView.css';

export interface StatusViewProps {
  /** Mã lớn mờ phía trên (vd: 404, 403) */
  code?: string;
  /** Icon thay cho mã */
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  /** Các nút hành động */
  actions?: React.ReactNode;
  /** Chiếm toàn màn hình (dùng khi không có layout bao quanh) */
  fullScreen?: boolean;
  className?: string;
}

/** Màn hình trạng thái dùng chung: 404, 403, lỗi ứng dụng... */
export const StatusView: React.FC<StatusViewProps> = ({
  code,
  icon,
  title,
  description,
  actions,
  fullScreen = false,
  className,
}) => (
  <section className={cn('ui-status-view', fullScreen && 'ui-status-view--full', className)}>
    {code && (
      <span className="ui-status-view__code" aria-hidden="true">
        {code}
      </span>
    )}
    {icon && <span className="ui-status-view__icon">{icon}</span>}
    <h1 className="ui-status-view__title">{title}</h1>
    {description && <p className="ui-status-view__desc">{description}</p>}
    {actions && <div className="ui-status-view__actions">{actions}</div>}
  </section>
);
