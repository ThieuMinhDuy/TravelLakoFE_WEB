import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { AdminHeader } from '../components/layout/AdminHeader';
import { Drawer } from '../components/common/Drawer';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useUIStore } from '../store/useUIStore';
import './css/AdminLayout.css';

/** Dưới 1024px: sidebar chuyển thành drawer trượt từ trái để nhường chỗ cho nội dung */
const COMPACT_QUERY = '(max-width: 1023.98px)';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const isCompact = useMediaQuery(COMPACT_QUERY);
  const toggleAdminSidebar = useUIStore((s) => s.toggleAdminSidebar);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="admin-layout">
      {/* Sidebar cố định (desktop) */}
      {!isCompact && <AdminSidebar />}

      {/* Main Content Area */}
      <div className="admin-layout__main-wrapper">
        <AdminHeader onMenuClick={isCompact ? () => setDrawerOpen(true) : toggleAdminSidebar} />
        <main className="admin-layout__content">
          {/* Lỗi trong một trang admin không làm mất sidebar/header; chuyển trang sẽ tự xóa lỗi */}
          <ErrorBoundary resetKeys={[location.pathname]}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Sidebar dạng drawer (màn nhỏ) */}
      {isCompact && (
        <Drawer
          open={drawerOpen}
          onClose={closeDrawer}
          side="left"
          ariaLabel="Menu quản trị"
          className="admin-layout__drawer"
        >
          <AdminSidebar variant="drawer" onNavigate={closeDrawer} />
        </Drawer>
      )}
    </div>
  );
};
