import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import './css/Select.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  /** Dòng đầu tiên không chọn gì (value = "") */
  placeholder?: string;
}

/** Ô chọn dùng <select> gốc (bàn phím, mobile picker hoạt động sẵn), cùng style với Input */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, id, className, ...props }, ref) => {
    const selectId = id || props.name;
    const messageId = selectId ? `${selectId}-message` : undefined;

    return (
      <div className="ui-select-wrapper">
        {label && (
          <label htmlFor={selectId} className="ui-select-label">
            {label}
          </label>
        )}
        <div className="ui-select-container">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error || undefined}
            aria-describedby={error || helperText ? messageId : undefined}
            className={cn('ui-select', error && 'ui-select--error', className)}
            {...props}
          >
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="ui-select-icon" aria-hidden="true" />
        </div>
        {(error || helperText) && (
          <p id={messageId} className={error ? 'ui-select-message--error' : 'ui-select-message--helper'}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
