import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MapPin, MessageSquare, Settings } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Người dùng', path: '/admin/users', icon: Users },
  { name: 'Địa điểm', path: '/admin/places', icon: MapPin },
  { name: 'Đánh giá', path: '/admin/reviews', icon: MessageSquare },
  { name: 'Cài đặt', path: '/admin/settings', icon: Settings },
];

export const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-primary-600">TravelLako</h2>
        <span className="ml-2 text-xs font-semibold bg-primary-50 text-primary-600 px-2 py-1 rounded-full">
          Admin
        </span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-medium text-sm ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
