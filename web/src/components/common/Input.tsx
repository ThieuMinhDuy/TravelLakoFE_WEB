import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import './css/Input.css';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    return (
      <div className="ui-input-wrapper">
        {label && (
          <label htmlFor={inputId} className="ui-input-label">
            {label}
            {props.required && <span className="ui-input-required">*</span>}
          </label>
        )}
        <div className="ui-input-container">
          {leftIcon && (
            <div className="ui-input-icon--left">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'ui-input',
              leftIcon && 'ui-input--with-left-icon',
              rightIcon && 'ui-input--with-right-icon',
              error && 'ui-input--error',
              disabled && 'ui-input--disabled',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="ui-input-icon--right">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="ui-input-message--error">{error}</p>
        ) : helperText ? (
          <p className="ui-input-message--helper">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
