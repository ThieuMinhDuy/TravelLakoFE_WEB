import { isAdminUser } from '@/utils/auth';

describe('isAdminUser', () => {
  it('nhận cả isAdmin lẫn role === "admin"', () => {
    expect(isAdminUser({ isAdmin: true })).toBe(true);
    expect(isAdminUser({ role: 'admin' })).toBe(true);
  });

  it('từ chối user thường hoặc chưa đăng nhập', () => {
    expect(isAdminUser({ isAdmin: false })).toBe(false);
    expect(isAdminUser({ role: 'user' })).toBe(false);
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser(undefined)).toBe(false);
  });
});
