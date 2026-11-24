import type { LucideIcon } from 'lucide-react';
import { Building2, DownloadCloud, LayoutDashboard, MapPin, MessageSquare, Users } from 'lucide-react';

export interface AdminNavItem {
  to: string;
  /** Nhãn ngắn trên sidebar */
  label: string;
  /** Tên đầy đủ trên breadcrumb */
  title: string;
  icon: LucideIcon;
  /** Chỉ active khi khớp chính xác (trang tổng quan) */
  end?: boolean;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

/** Một nguồn duy nhất cho sidebar và breadcrumb của header */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: 'Tổng quan',
    items: [{ to: '/admin', label: 'Bảng điều khiển', title: 'Bảng điều khiển', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Quản lý',
    items: [
      { to: '/admin/users', label: 'Người dùng', title: 'Quản lý người dùng', icon: Users },
      { to: '/admin/cities', label: 'Thành phố', title: 'Quản lý thành phố', icon: Building2 },
      { to: '/admin/places', label: 'Địa điểm', title: 'Quản lý địa điểm', icon: MapPin },
      { to: '/admin/reviews', label: 'Đánh giá', title: 'Kiểm duyệt đánh giá', icon: MessageSquare },
    ],
  },
  {
    label: 'Công cụ',
    items: [{ to: '/admin/import', label: 'Import dữ liệu', title: 'Import từ OpenStreetMap', icon: DownloadCloud }],
  },
];

const ALL_ITEMS = ADMIN_NAV.flatMap((group) => group.items);

/** Mục menu ứng với đường dẫn hiện tại (khớp tiền tố dài nhất) */
export function findAdminNavItem(pathname: string): AdminNavItem | undefined {
  const path = pathname.replace(/\/+$/, '') || '/';
  return ALL_ITEMS.filter((item) => (item.end ? path === item.to : path === item.to || path.startsWith(`${item.to}/`)))
    .sort((a, b) => b.to.length - a.to.length)[0];
}
