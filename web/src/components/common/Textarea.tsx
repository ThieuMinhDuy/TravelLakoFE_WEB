import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

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
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-slate-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
          className={cn(
            'w-full rounded-xl border border-borderGray bg-surfaceWhite px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors',
            'focus:border-oceanBlue focus:outline-none focus:ring-2 focus:ring-oceanBlue/20',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-100 text-red-900',
            disabled && 'bg-slate-50 opacity-60 cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
