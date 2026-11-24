import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import './css/TagSelect.css';

export interface TagOption {
  value: string;
  label: string;
  /** Biểu tượng nhỏ trước nhãn (emoji hoặc icon) */
  icon?: React.ReactNode;
}

export interface TagSelectProps {
  options: TagOption[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Nhãn của cả nhóm (đọc bởi trình đọc màn hình) */
  label: string;
  /** Giới hạn số lựa chọn tối đa */
  max?: number;
  className?: string;
}

/**
 * Chọn nhiều giá trị dạng thẻ (chip). Mỗi thẻ là một nút bật/tắt với `aria-pressed`,
 * dùng được bằng bàn phím (Tab + Enter/Space).
 */
export const TagSelect: React.FC<TagSelectProps> = ({ options, value, onChange, label, max, className }) => {
  const reachedMax = max !== undefined && value.length >= max;

  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) onChange(value.filter((v) => v !== optionValue));
    else if (!reachedMax) onChange([...value, optionValue]);
  };

  return (
    <div role="group" aria-label={label} className={cn('ui-tag-select', className)}>
      {options.map((option) => {
        const selected = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            disabled={!selected && reachedMax}
            onClick={() => toggle(option.value)}
            className={cn('ui-tag-select__tag', selected && 'ui-tag-select__tag--selected')}
          >
            {selected ? <Check className="ui-tag-select__check" aria-hidden="true" /> : option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
