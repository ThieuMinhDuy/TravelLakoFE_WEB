import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/shadcn_ui/button';

export const AdminHeader = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center">
        {/* Placeholder: Có thể để title trang hiện tại hoặc hamburger menu cho mobile */}
        <h1 className="text-lg font-semibold text-slate-800">Bảng điều khiển</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'A'
            )}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">
            {user?.name || 'Admin'}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          Đăng xuất
        </Button>
      </div>
    </header>
  );
};
