/**
 * Kiểm tra định dạng email (Bắt buộc đuôi @gmail.com theo chuẩn TripMate Backend)
 */
export function isValidGmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) && trimmed.endsWith('@gmail.com');
}

export interface PasswordRule {
  /** Nhãn ngắn hiển thị trong checklist */
  label: string;
  /** Thông báo lỗi khi không đạt */
  message: string;
  test: (password: string) => boolean;
}

/**
 * Nguồn duy nhất cho rule mật khẩu mạnh — khớp `validator.isStrongPassword` của backend
 * (minLength 6, minLowercase 1, minUppercase 1, minNumbers 1, minSymbols 0).
 * Dùng chung cho validate form, checklist trên giao diện và isStrongPassword().
 */
export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    label: 'Tối thiểu 6 ký tự',
    message: 'Mật khẩu phải có tối thiểu 6 ký tự',
    test: (v) => v.length >= 6,
  },
  {
    label: '1 chữ in hoa',
    message: 'Mật khẩu phải chứa ít nhất 1 chữ in hoa (A-Z)',
    test: (v) => /[A-Z]/.test(v),
  },
  {
    label: '1 chữ thường',
    message: 'Mật khẩu phải chứa ít nhất 1 chữ thường (a-z)',
    test: (v) => /[a-z]/.test(v),
  },
  {
    label: '1 chữ số',
    message: 'Mật khẩu phải chứa ít nhất 1 số (0-9)',
    test: (v) => /[0-9]/.test(v),
  },
];

/** Thông báo lỗi đầu tiên của mật khẩu, `null` nếu hợp lệ */
export function getPasswordError(password: string): string | null {
  if (!password) return 'Vui lòng nhập mật khẩu';
  return PASSWORD_RULES.find((rule) => !rule.test(password))?.message ?? null;
}

/** Mật khẩu đạt toàn bộ rule mạnh */
export function isStrongPassword(password: string): boolean {
  return !!password && PASSWORD_RULES.every((rule) => rule.test(password));
}
