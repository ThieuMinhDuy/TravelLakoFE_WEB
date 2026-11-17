import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import './css/Textarea.css';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, disabled, rows = 4, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className="ui-textarea-wrapper">
        {label && (
          <label htmlFor={textareaId} className="ui-textarea-label">
            {label}
            {props.required && <span className="ui-textarea-required">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
          className={cn(
            'ui-textarea',
            error && 'ui-textarea--error',
            disabled && 'ui-textarea--disabled',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="ui-textarea-message--error">{error}</p>
        ) : helperText ? (
          <p className="ui-textarea-message--helper">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
