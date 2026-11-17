import React from 'react';
import { cn } from '../../utils/cn';
import './css/Card.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverable = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'ui-card',
        hoverable && 'ui-card--hoverable',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
