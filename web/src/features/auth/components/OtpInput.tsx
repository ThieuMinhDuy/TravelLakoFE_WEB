import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Gọi khi đã nhập đủ số ký tự */
  onComplete?: (value: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Ô nhập OTP 6 số.
 * Dùng 1 input thật (trong suốt) phủ lên 6 ô hiển thị → dán mã, tự điền mã từ SMS/email
 * và bàn phím số trên điện thoại hoạt động tự nhiên.
 */
export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  onComplete,
  length = 6,
  error = false,
  disabled = false,
  autoFocus = true,
}) => {
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, length - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/\D/g, '').slice(0, length);
    onChange(next);
    if (next.length === length && next !== value) onComplete?.(next);
  };

  // Luôn giữ con trỏ ở cuối để số mới được thêm vào ô tiếp theo
  const keepCaretAtEnd = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const end = el.value.length;
    if (el.selectionStart !== end || el.selectionEnd !== end) el.setSelectionRange(end, end);
  };

  return (
    <div className={cn('auth-otp', error && 'auth-otp--error', disabled && 'auth-otp--disabled')}>
      <input
        className="auth-otp__input"
        value={value}
        onChange={handleChange}
        onSelect={keepCaretAtEnd}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        // Không đặt maxLength: trình duyệt sẽ cắt chuỗi dán vào TRƯỚC khi lọc ký tự,
        // vd dán "654 321" thành "654 32" → mất 1 số. handleChange tự lọc & cắt đủ `length` số.
        autoFocus={autoFocus}
        disabled={disabled}
        aria-label={`Mã OTP ${length} số`}
      />
      {Array.from({ length }).map((_, i) => {
        const char = value[i];
        return (
          <div
            key={i}
            className={cn(
              'auth-otp__box',
              char && 'is-filled',
              focused && i === activeIndex && 'is-active'
            )}
            aria-hidden="true"
          >
            <AnimatePresence>
              {char && (
                <motion.span
                  key={char}
                  initial={{ scale: 0.3, opacity: 0, y: 6 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.6, opacity: 0, position: 'absolute' }}
                  transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                >
                  {char}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
