import React from 'react';
import { cn } from '../../utils/cn';
import { Inbox } from 'lucide-react';
import './css/EmptyState.css';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn('ui-empty-state', className)}>
      <div className="ui-empty-state__icon-box">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h4 className="ui-empty-state__title">{title}</h4>
      {description && (
        <p className="ui-empty-state__description">{description}</p>
      )}
      {action && <div className="ui-empty-state__action">{action}</div>}
    </div>
  );
};
