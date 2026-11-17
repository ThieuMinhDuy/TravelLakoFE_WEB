/**
 * Kiểm tra định dạng email (Bắt buộc đuôi @gmail.com theo chuẩn TripMate Backend)
 */
export function isValidGmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) && trimmed.endsWith('@gmail.com');
}

/**
 * Kiểm tra mật khẩu mạnh theo rule TripMate Backend:
 * - Tối thiểu 6 ký tự
 * - Có ít nhất 1 chữ hoa
 * - Có ít nhất 1 chữ thường
 * - Có ít nhất 1 chữ số
 */
export function isStrongPassword(password: string): boolean {
  if (!password || password.length < 6) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUpper && hasLower && hasNumber;
}

/**
 * Gợi ý lỗi mật khẩu
 */
export function getPasswordError(password: string): string | null {
  if (!password) return 'Vui lòng nhập mật khẩu';
  if (password.length < 6) return 'Mật khẩu phải có tối thiểu 6 ký tự';
  if (!/[A-Z]/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 chữ in hoa (A-Z)';
  if (!/[a-z]/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 chữ thường (a-z)';
  if (!/[0-9]/.test(password)) return 'Mật khẩu phải chứa ít nhất 1 số (0-9)';
  return null;
}
