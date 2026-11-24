import type { User } from '../types/user';

/**
 * Nguồn sự thật duy nhất để kiểm tra quyền Admin (menu, route guard, điều hướng sau đăng nhập).
 * Backend hiện trả `isAdmin`; chấp nhận thêm `role === 'admin'` phòng khi API đổi sang dạng role.
 */
export const isAdminUser = (user: Pick<User, 'isAdmin' | 'role'> | null | undefined): boolean =>
  user?.isAdmin === true || user?.role === 'admin';
