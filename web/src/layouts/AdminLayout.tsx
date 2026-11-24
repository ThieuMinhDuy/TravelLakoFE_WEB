import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { AdminHeader } from '../components/layout/AdminHeader';
import { Drawer } from '../components/common/Drawer';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { LiquidBackdrop, LiquidLensFilter, useGlassPointer } from '../components/glass';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useUIStore } from '../store/useUIStore';
import '../components/glass/css/glass.css';
import './css/AdminSkin.css';
import './css/AdminLayout.css';

/** Dưới 1024px: sidebar chuyển thành drawer trượt từ trái để nhường chỗ cho nội dung */
const COMPACT_QUERY = '(max-width: 1023.98px)';

/**
 * Gắn data-surface="admin" lên <html> trong lúc ở khu quản trị: CSS Liquid Glass chỉ có hiệu lực
 * dưới thuộc tính này, nên áp được cả cho Modal / Drawer / Toast render qua portal ra <body>.
 */
function useAdminSurface() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-surface', 'admin');
    return () => root.removeAttribute('data-surface');
  }, []);
}

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const isCompact = useMediaQuery(COMPACT_QUERY);
  const toggleAdminSidebar = useUIStore((s) => s.toggleAdminSidebar);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  useAdminSurface();
  useGlassPointer();

  return (
    // reducedMotion="user": mọi hiệu ứng framer-motion tự tắt khi hệ điều hành bật giảm chuyển động
    <MotionConfig reducedMotion="user">
      <div className="admin-layout">
        <LiquidBackdrop />
        <LiquidLensFilter />

        {/* Sidebar nổi (desktop) */}
        {!isCompact && <AdminSidebar />}

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
    </MotionConfig>
  );
};
