import React from 'react';
import { Input, type InputProps } from './Input';

export interface MoneyInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type'> {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  /** Đơn vị hiển thị bên phải ô */
  suffix?: string;
}

const formatter = new Intl.NumberFormat('vi-VN');

/**
 * Ô nhập tiền: hiển thị "1.600.000", trả về số 1600000 (rỗng → undefined).
 * Chỉ nhận chữ số, nên không bao giờ gửi chuỗi có dấu chấm lên API.
 */
export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, suffix = 'đ', ...props }, ref) => (
    <Input
      ref={ref}
      {...props}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={value === undefined || Number.isNaN(value) ? '' : formatter.format(value)}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 13);
        onChange(digits ? Number(digits) : undefined);
      }}
      rightIcon={<span className="ui-money-input__suffix">{suffix}</span>}
    />
  )
);
MoneyInput.displayName = 'MoneyInput';
