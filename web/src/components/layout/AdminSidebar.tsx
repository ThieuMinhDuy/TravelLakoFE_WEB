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
        'h-screen sticky top-0 z-40 border-r border-borderGray bg-surfaceWhite transition-all duration-300 flex flex-col',
        adminSidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-borderGray">
        <Link to="/admin" className="flex items-center gap-2.5 overflow-hidden">
          <img src={logoImg} alt="Logo" className="w-8 h-8 object-contain shrink-0" />
          {!adminSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">
                Travel<span className="text-oceanBlue">Lako</span>
              </span>
              <span className="text-[10px] font-semibold text-amber-600 tracking-wide uppercase">
                Admin Portal
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-sky-50 text-oceanBlue font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  adminSidebarCollapsed && 'justify-center px-0'
                )
              }
              title={adminSidebarCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!adminSidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer Info */}
      {!adminSidebarCollapsed && (
        <div className="p-4 border-t border-borderGray text-[11px] text-slate-400">
          <p>TravelLako v1.0.0</p>
          <p className="text-[10px] text-slate-300 mt-0.5">Admin Management System</p>
        </div>
      )}
    </aside>
  );
};
