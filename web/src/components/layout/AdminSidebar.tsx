import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { cn } from '../../utils/cn';
import { ADMIN_NAV } from '../../features/admin/config/adminNav';
import logoImg from '../../assets/logo.png';
import './css/AdminSidebar.css';

interface AdminSidebarProps {
  /** `drawer`: hiển thị bên trong Drawer trên màn nhỏ (luôn mở rộng, chiếm hết khung) */
  variant?: 'sidebar' | 'drawer';
  /** Gọi khi chọn một mục menu (dùng để đóng drawer) */
  onNavigate?: () => void;
}

/** Lò xo cho "giọt kính" trượt giữa các mục — hơi nảy như thanh tab iOS */
const PILL_SPRING = { type: 'spring', stiffness: 380, damping: 30, mass: 0.9 } as const;

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ variant = 'sidebar', onNavigate }) => {
  const collapsedSetting = useUIStore((s) => s.adminSidebarCollapsed);
  // Trong drawer luôn hiện đầy đủ nhãn, bỏ qua trạng thái thu gọn của desktop
  const collapsed = variant === 'sidebar' && collapsedSetting;
  const pillId = `admin-nav-pill-${variant}`;

  return (
    <aside
      className={cn(
        'admin-sidebar',
        variant === 'sidebar' && 'glass',
        variant === 'drawer' && 'admin-sidebar--drawer',
        collapsed && 'admin-sidebar--collapsed'
      )}
    >
      <div className="admin-sidebar__header">
        <Link to="/admin" className="admin-sidebar__brand" onClick={onNavigate} aria-label="TripMate Admin — Bảng điều khiển">
          <span className="admin-sidebar__logo">
            <img src={logoImg} alt="" />
          </span>
          {!collapsed && (
            <span className="admin-sidebar__brand-text">
              <span className="admin-sidebar__brand-name">TripMate</span>
              <span className="admin-sidebar__brand-tag">Admin</span>
            </span>
          )}
        </Link>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Menu quản trị">
        {ADMIN_NAV.map((group) => (
          <div key={group.label} className="admin-sidebar__group">
            {collapsed ? (
              <span className="admin-sidebar__group-divider" aria-hidden="true" />
            ) : (
              <p className="admin-sidebar__group-label">{group.label}</p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    cn('admin-sidebar__item', isActive && 'admin-sidebar__item--active')
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId={pillId}
                          className="admin-sidebar__pill glass glass--thick glass--lens"
                          transition={PILL_SPRING}
                          aria-hidden="true"
                        />
                      )}
                      <span className="admin-sidebar__icon">
                        <Icon aria-hidden="true" />
                      </span>
                      {!collapsed && <span className="admin-sidebar__label">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="admin-sidebar__footer">
          <span className="admin-sidebar__status-dot" aria-hidden="true" />
          TripMate Admin · v1.0
        </div>
      )}
    </aside>
  );
};
