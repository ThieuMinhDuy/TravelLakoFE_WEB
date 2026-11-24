import React, { useId, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import './css/SegmentedControl.css';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  /** Số đếm nhỏ cạnh nhãn (vd: số địa điểm theo loại) */
  count?: number;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  disabled?: boolean;
  /** Kéo giãn đầy chiều ngang, các ô chia đều */
  fullWidth?: boolean;
  className?: string;
}

/**
 * Thanh chọn kiểu iOS: "giọt kính" trượt và co giãn sang ô được chọn (framer-motion layoutId).
 * Ngữ nghĩa radiogroup: phím mũi tên di chuyển + chọn, chỉ ô đang chọn nằm trong thứ tự Tab.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  disabled = false,
  fullWidth = false,
  className,
}: SegmentedControlProps<T>) {
  const layoutId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn('glass-segmented glass glass--thin', fullWidth && 'glass-segmented--full', className)}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn('glass-segmented__item', selected && 'glass-segmented__item--selected')}
          >
            {selected && (
              <motion.span
                layoutId={layoutId}
                className="glass-segmented__thumb glass glass--thick glass--lens"
                transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }}
                aria-hidden="true"
              />
            )}
            <span className="glass-segmented__content">
              {option.icon}
              <span>{option.label}</span>
              {option.count !== undefined && <span className="glass-segmented__count">{option.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
