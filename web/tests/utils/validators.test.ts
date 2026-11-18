import {
  PASSWORD_RULES,
  getPasswordError,
  isStrongPassword,
  isValidGmail,
} from '@/utils/validators';

describe('isValidGmail', () => {
  it('chỉ chấp nhận địa chỉ @gmail.com', () => {
    expect(isValidGmail('ten.ban@gmail.com')).toBe(true);
    expect(isValidGmail('  TEN@GMAIL.COM ')).toBe(true);
    expect(isValidGmail('ten@yahoo.com')).toBe(false);
    expect(isValidGmail('khong-phai-email')).toBe(false);
    expect(isValidGmail('')).toBe(false);
  });
});

describe('Rule mật khẩu (khớp backend)', () => {
  it.each([
    ['', 'Vui lòng nhập mật khẩu'],
    ['Ab1', 'Mật khẩu phải có tối thiểu 6 ký tự'],
    ['abcdef1', 'Mật khẩu phải chứa ít nhất 1 chữ in hoa (A-Z)'],
    ['ABCDEF1', 'Mật khẩu phải chứa ít nhất 1 chữ thường (a-z)'],
    ['Abcdefg', 'Mật khẩu phải chứa ít nhất 1 số (0-9)'],
    ['Abcde1', null],
  ])('getPasswordError(%j) → %j', (password, expected) => {
    expect(getPasswordError(password)).toBe(expected);
  });

  it('isStrongPassword dùng chung PASSWORD_RULES với checklist', () => {
    expect(isStrongPassword('Abcde1')).toBe(true);
    expect(isStrongPassword('abcde1')).toBe(false);
    expect(isStrongPassword('')).toBe(false);
    // Mật khẩu hợp lệ thì đạt mọi rule hiển thị trên checklist
    expect(PASSWORD_RULES.every((rule) => rule.test('Abcde1'))).toBe(true);
  });
});
