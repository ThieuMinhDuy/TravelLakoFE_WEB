import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { buttonVariants, type ButtonSize, type ButtonVariant } from './buttonVariants';
import './css/Button.css';

export type { ButtonSize, ButtonVariant };

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
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
      // Mặc định "button": nút trong <form> không vô tình submit form.
      // Nút submit phải ghi rõ type="submit".
      type = 'button',
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {isLoading ? <Loader2 className="ui-button__spinner" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
);

Button.displayName = 'Button';
