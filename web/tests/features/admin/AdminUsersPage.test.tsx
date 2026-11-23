import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage';
import { adminService } from '@/features/admin/services/adminService';
import { useAuthStore } from '@/store/useAuthStore';
import type { AdminUser } from '@/types/admin';
import { renderWithProviders } from '../../helpers/renderWithProviders';

vi.mock('@/features/admin/services/adminService', () => ({
  adminService: { getUsers: vi.fn(), updateUser: vi.fn(), deleteUser: vi.fn() },
}));

const makeUser = (patch: Partial<AdminUser>): AdminUser => ({
  _id: 'id',
  name: 'Người dùng',
  email: 'user@gmail.com',
  avatar: '',
  coverImage: '',
  phone: '',
  gender: '',
  dateOfBirth: null,
  travelPreferences: [],
  favoriteBudget: '',
  authType: 'local',
  googleId: null,
  isVerified: true,
  isAdmin: false,
  isBlocked: false,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  ...patch,
});

const me = makeUser({ _id: 'me', name: 'Lê Hoàng', email: 'hoang@gmail.com', isAdmin: true });
const khach = makeUser({ _id: 'u2', name: 'Trần Khách', email: 'khach@gmail.com', createdAt: '2026-11-20T00:00:00.000Z' });
const biKhoa = makeUser({ _id: 'u3', name: 'Phạm Spam', email: 'spam@gmail.com', isBlocked: true });

const rowOf = (name: string) => screen.getByText(name).closest('tr') as HTMLElement;

describe('Trang quản lý người dùng', () => {
  beforeEach(() => {
    useAuthStore.getState().setAuth({ _id: 'me', name: 'Lê Hoàng', email: 'hoang@gmail.com', isAdmin: true }, 't');
    vi.mocked(adminService.getUsers).mockResolvedValue({ total: 3, users: [me, khach, biKhoa] });
  });
  afterEach(() => {
    useAuthStore.getState().logout();
    vi.clearAllMocks();
  });

  it('hiển thị danh sách, đếm theo nhóm, mới tạo lên trước', async () => {
    renderWithProviders(<AdminUsersPage />, { route: '/admin/users' });

    expect(await screen.findByText('Trần Khách')).toBeInTheDocument();
    expect(screen.getByText('3 tài khoản · 1 quản trị viên · 1 đang bị khóa')).toBeInTheDocument();
    const firstRow = screen.getAllByRole('row')[1];
    expect(within(firstRow).getByText('Trần Khách')).toBeInTheDocument();
  });

  it('dòng của chính admin đang đăng nhập bị khóa các thao tác', async () => {
    renderWithProviders(<AdminUsersPage />);
    await screen.findByText('Lê Hoàng');

    const myRow = rowOf('Lê Hoàng');
    const locked = within(myRow).getAllByRole('button', { name: /chính bạn/ });
    expect(locked).toHaveLength(3); // khóa, gỡ quyền, xóa
    locked.forEach((button) => expect(button).toBeDisabled());
    expect(within(rowOf('Trần Khách')).getByRole('button', { name: 'Khóa tài khoản' })).toBeEnabled();
  });

  it('khóa tài khoản: hỏi xác nhận rồi gửi isBlocked là boolean thật', async () => {
    vi.mocked(adminService.updateUser).mockResolvedValue({ ...khach, isBlocked: true });
    renderWithProviders(<AdminUsersPage />);
    await screen.findByText('Trần Khách');

    await userEvent.click(within(rowOf('Trần Khách')).getByRole('button', { name: 'Khóa tài khoản' }));
    expect(adminService.updateUser).not.toHaveBeenCalled();

    const dialog = screen.getByRole('dialog', { name: 'Khóa tài khoản?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Khóa tài khoản' }));

    await waitFor(() => expect(adminService.updateUser).toHaveBeenCalledWith('u2', { isBlocked: true }));
  });

  it('xóa tài khoản: phải gõ đúng email mới bấm được', async () => {
    vi.mocked(adminService.deleteUser).mockResolvedValue({ message: 'ok' });
    renderWithProviders(<AdminUsersPage />);
    await screen.findByText('Trần Khách');

    await userEvent.click(within(rowOf('Trần Khách')).getByRole('button', { name: 'Xóa tài khoản' }));
    const dialog = screen.getByRole('dialog', { name: 'Xóa vĩnh viễn tài khoản?' });
    const confirm = within(dialog).getByRole('button', { name: 'Xóa vĩnh viễn' });
    expect(confirm).toBeDisabled();

    await userEvent.type(within(dialog).getByLabelText(/để xác nhận/), 'khach@gmail.com');
    await userEvent.click(confirm);
    await waitFor(() => expect(adminService.deleteUser).toHaveBeenCalledWith('u2'));
  });

  it('lọc "Đã khóa" chỉ còn tài khoản bị khóa và lưu bộ lọc lên URL', async () => {
    renderWithProviders(<AdminUsersPage />, { route: '/admin/users' });
    await screen.findByText('Trần Khách');

    await userEvent.click(screen.getByRole('radio', { name: /Đã khóa/ }));

    expect(screen.queryByText('Trần Khách')).not.toBeInTheDocument();
    expect(screen.getByText('Phạm Spam')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/admin/users?group=blocked');
  });

  it('tìm kiếm không phân biệt dấu', async () => {
    renderWithProviders(<AdminUsersPage />);
    await screen.findByText('Trần Khách');

    await userEvent.type(screen.getByPlaceholderText(/Tìm theo tên/), 'tran');
    await waitFor(() => expect(screen.queryByText('Phạm Spam')).not.toBeInTheDocument());
    expect(screen.getByText('Trần Khách')).toBeInTheDocument();
  });

  it('sửa thông tin trong drawer chỉ gửi field đã đổi', async () => {
    vi.mocked(adminService.updateUser).mockResolvedValue({ ...khach, name: 'Trần Khách Mới' });
    renderWithProviders(<AdminUsersPage />);
    await screen.findByText('Trần Khách');

    await userEvent.click(within(rowOf('Trần Khách')).getByRole('button', { name: 'Xem chi tiết' }));
    const drawer = await screen.findByRole('dialog', { name: 'Chi tiết người dùng' });
    const nameInput = within(drawer).getByLabelText('Họ tên');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Trần Khách Mới');
    await userEvent.click(within(drawer).getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => expect(adminService.updateUser).toHaveBeenCalledWith('u2', { name: 'Trần Khách Mới' }));
  });
});
