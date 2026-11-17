import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';
import './css/Button.css';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'accent'
    | 'secondary'
    | 'outline'
    | 'danger'
    | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variantClass = `ui-button--${variant}`;
    const sizeClass = `ui-button--${size}`;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn('ui-button', variantClass, sizeClass, className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="ui-button__spinner" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
