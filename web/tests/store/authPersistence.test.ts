import { useAuthStore } from '@/store/useAuthStore';
import { authStorage, storage } from '@/utils/storage';
import type { User } from '@/types/user';

const user: User = { _id: 'u1', name: 'Minh', email: 'minh@gmail.com' };

describe('authStorage — "Ghi nhớ đăng nhập"', () => {
  it('ghi nhớ → lưu localStorage, xóa bản trong sessionStorage', () => {
    sessionStorage.setItem('k', 'cũ');
    storage.setRemembered(true);
    authStorage.setItem('k', 'mới');
    expect(localStorage.getItem('k')).toBe('mới');
    expect(sessionStorage.getItem('k')).toBeNull();
  });

  it('không ghi nhớ → chỉ lưu trong phiên (sessionStorage)', () => {
    localStorage.setItem('k', 'cũ');
    storage.setRemembered(false);
    authStorage.setItem('k', 'mới');
    expect(sessionStorage.getItem('k')).toBe('mới');
    expect(localStorage.getItem('k')).toBeNull();
  });
});

describe('useAuthStore', () => {
  afterEach(() => useAuthStore.getState().logout());

  it('setAuth(remember = false) lưu phiên vào sessionStorage', () => {
    useAuthStore.getState().setAuth(user, 'jwt-token', false);
    expect(sessionStorage.getItem('tripmate_auth')).toContain('jwt-token');
    expect(localStorage.getItem('tripmate_auth')).toBeNull();
  });

  it('setAuth(remember = true) lưu phiên vào localStorage', () => {
    useAuthStore.getState().setAuth(user, 'jwt-token', true);
    expect(localStorage.getItem('tripmate_auth')).toContain('jwt-token');
  });

  it('updateUser gộp thông tin mới, giữ token', () => {
    useAuthStore.getState().setAuth(user, 'jwt-token', true);
    useAuthStore.getState().updateUser({ phone: '0987654321' });
    const state = useAuthStore.getState();
    expect(state.user).toMatchObject({ name: 'Minh', phone: '0987654321' });
    expect(state.token).toBe('jwt-token');
  });
});
