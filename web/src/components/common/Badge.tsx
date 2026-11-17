import React from 'react';
import { cn } from '../../utils/cn';
import './css/Badge.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'neutral'
    | 'primary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'danger';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}) => {
  const variantClass = `ui-badge--${variant}`;
  const sizeClass = `ui-badge--${size}`;

  return (
    <span
      className={cn(
        'ui-badge',
        variantClass,
        sizeClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
