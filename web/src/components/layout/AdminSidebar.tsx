import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useUIStore } from '../../store/useUIStore';
import { cn } from '../../utils/cn';
import {
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  MessageSquare,
  DownloadCloud,
} from 'lucide-react';
import logoImg from '../../assets/logo.webp';
import './css/AdminSidebar.css';

export const AdminSidebar: React.FC = () => {
  const { adminSidebarCollapsed } = useUIStore();

  const navItems = [
    {
      to: '/admin',
      label: 'Tổng quan (Dashboard)',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/admin/users',
      label: 'Quản lý Người dùng',
      icon: Users,
    },
    {
      to: '/admin/cities',
      label: 'Quản lý Thành phố',
      icon: Building2,
    },
    {
      to: '/admin/places',
      label: 'Quản lý Địa điểm',
      icon: MapPin,
    },
    {
      to: '/admin/reviews',
      label: 'Quản lý Đánh giá',
      icon: MessageSquare,
    },
    {
      to: '/admin/import',
      label: 'Cào dữ liệu (OSM)',
      icon: DownloadCloud,
    },
  ];

  return (
    <aside
      className={cn(
        'admin-sidebar',
        adminSidebarCollapsed && 'admin-sidebar--collapsed'
      )}
    >
      {/* Brand Header */}
      <div className="admin-sidebar__header">
        <Link to="/admin" className="admin-sidebar__brand-link">
          <img src={logoImg} alt="Logo" className="admin-sidebar__brand-logo" />
          {!adminSidebarCollapsed && (
            <div className="admin-sidebar__brand-text">
              <span className="admin-sidebar__brand-name">
                Travel<span className="admin-sidebar__brand-highlight">Lako</span>
              </span>
              <span className="admin-sidebar__brand-tag">
                Admin Portal
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Nav List */}
      <nav className="admin-sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={adminSidebarCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'admin-sidebar__nav-item',
                  isActive && 'admin-sidebar__nav-item--active',
                  adminSidebarCollapsed && 'admin-sidebar__nav-item--collapsed'
                )
              }
            >
              <Icon className="admin-sidebar__nav-icon" />
              {!adminSidebarCollapsed && (
                <span className="admin-sidebar__nav-label">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Meta */}
      {!adminSidebarCollapsed && (
        <div className="admin-sidebar__footer">
          <p className="admin-sidebar__footer-text">TravelLako Engine v1.0</p>
          <p className="admin-sidebar__footer-text">OpenAPI Mongoose Compatible</p>
        </div>
      )}
    </aside>
  );
};
