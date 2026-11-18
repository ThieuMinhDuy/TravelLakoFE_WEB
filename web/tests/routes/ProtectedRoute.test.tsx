import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

const LoginProbe = () => {
  const location = useLocation();
  return <p>login{location.search}</p>;
};

const renderAt = (path: string) =>
  render(
    <StrictMode>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<p>Trang chủ</p>} />
          <Route path="/login" element={<LoginProbe />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <p>Khu vực Admin</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </StrictMode>
  );

describe('ProtectedRoute', () => {
  afterEach(() => useAuthStore.getState().logout());

  it('chưa đăng nhập → chuyển tới /login kèm redirect', () => {
    renderAt('/admin');
    expect(screen.getByText('login?redirect=%2Fadmin')).toBeInTheDocument();
  });

  it('không phải Admin → về trang chủ, báo lỗi trong effect với id cố định (không nhân đôi)', () => {
    useAuthStore.getState().setAuth({ _id: '1', name: 'A', email: 'a@gmail.com' }, 't', true);
    renderAt('/admin');

    expect(screen.getByText('Trang chủ')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalled();
    // StrictMode chạy effect 2 lần nhưng cùng id → sonner chỉ hiển thị 1 toast
    for (const call of vi.mocked(toast.error).mock.calls) {
      expect(call[1]).toMatchObject({ id: 'admin-forbidden' });
    }
  });

  it('Admin (isAdmin hoặc role) → vào được', () => {
    useAuthStore.getState().setAuth({ _id: '1', name: 'A', email: 'a@gmail.com', role: 'admin' }, 't', true);
    renderAt('/admin');
    expect(screen.getByText('Khu vực Admin')).toBeInTheDocument();
  });
});
