import { toSearchKey } from '../../../utils/searchKey';
import type { AdminUser } from '../../../types/admin';

export type UserGroup = 'all' | 'admin' | 'customer' | 'blocked' | 'unverified';
export type UserAuthFilter = 'all' | 'local' | 'google';

export interface UserFilterValues {
  q: string;
  group: UserGroup;
  auth: UserAuthFilter;
}

/** Bỏ dấu tiếng Việt để tìm "hoang" ra "Hoàng" (cùng cách chuẩn hóa với backend) */
export const normalizeText = toSearchKey;

const GROUP_MATCHERS: Record<UserGroup, (u: AdminUser) => boolean> = {
  all: () => true,
  admin: (u) => u.isAdmin,
  customer: (u) => !u.isAdmin,
  blocked: (u) => u.isBlocked,
  unverified: (u) => !u.isVerified,
};

/** Số user theo từng nhóm — hiển thị cạnh nhãn bộ lọc */
export function countUserGroups(users: AdminUser[]): Record<UserGroup, number> {
  return (Object.keys(GROUP_MATCHERS) as UserGroup[]).reduce(
    (acc, group) => ({ ...acc, [group]: users.filter(GROUP_MATCHERS[group]).length }),
    {} as Record<UserGroup, number>
  );
}

/** Lọc theo nhóm, cách đăng nhập và từ khóa (tên / email, không phân biệt dấu); mới tạo lên trước */
export function filterUsers(users: AdminUser[], { q, group, auth }: UserFilterValues): AdminUser[] {
  const keyword = normalizeText(q);
  return users
    .filter(GROUP_MATCHERS[group])
    .filter((u) => auth === 'all' || u.authType === auth)
    .filter((u) => !keyword || normalizeText(`${u.name} ${u.email}`).includes(keyword))
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}
