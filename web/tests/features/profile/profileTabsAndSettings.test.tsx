import { renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useProfileTab } from '@/features/profile/hooks/useProfileTab';
import { SettingsTab } from '@/features/profile/components/tabs/SettingsTab';
import { profileService } from '@/features/profile/services/profileService';
import { useAuthStore } from '@/store/useAuthStore';
import type { User } from '@/types/user';
import { renderWithProviders } from '../../helpers/renderWithProviders';

vi.mock('@/features/profile/services/profileService', () => ({
  profileService: { updateProfile: vi.fn() },
}));

describe('useProfileTab — tab đồng bộ với URL', () => {
  const renderAt = (url: string) =>
    renderHook(() => useProfileTab(), {
      wrapper: ({ children }) => <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>,
    });

  it('đọc tab từ ?tab=, giá trị lạ → tab mặc định "trips"', () => {
    expect(renderAt('/profile?tab=favorites').result.current[0]).toBe('favorites');
    expect(renderAt('/profile?tab=hack').result.current[0]).toBe('trips');
    expect(renderAt('/profile').result.current[0]).toBe('trips');
  });

  it('đổi tab cập nhật URL', async () => {
    renderWithProviders(<TabSwitcher />, { route: '/profile' });

    await userEvent.click(screen.getByRole('button', { name: 'Mở Kỷ niệm' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/profile?tab=memories');

    await userEvent.click(screen.getByRole('button', { name: 'Mở Chuyến đi' }));
    // Tab mặc định không cần ghi lên URL
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/profile$/);
  });
});

const TabSwitcher = () => {
  const [, setTab] = useProfileTab();
  return (
    <>
      <button onClick={() => setTab('memories')}>Mở Kỷ niệm</button>
      <button onClick={() => setTab('trips')}>Mở Chuyến đi</button>
    </>
  );
};

describe('Tab Cài đặt tài khoản', () => {
  const user: User = {
    _id: 'u1',
    name: 'Lê Hoàng',
    email: 'hoang@gmail.com',
    phone: '',
    gender: '',
    travelPreferences: ['Ẩm thực'],
    favoriteBudget: '',
  };

  beforeEach(() => {
    useAuthStore.getState().setAuth(user, 'token', true);
    vi.mocked(profileService.updateProfile).mockImplementation(async (dto) => ({ ...user, ...dto }) as User);
  });
  afterEach(() => useAuthStore.getState().logout());

  it('lưu giới tính, sở thích và ngân sách đúng định dạng backend', async () => {
    renderWithProviders(<SettingsTab user={user} />);

    await userEvent.selectOptions(screen.getByLabelText('Giới tính'), 'Nữ');
    await userEvent.click(screen.getByRole('button', { name: /Biển đảo/ }));
    await userEvent.click(screen.getByRole('button', { name: /Ẩm thực/ })); // bỏ chọn
    await userEvent.click(screen.getByLabelText(/Trung bình/));
    await userEvent.click(screen.getByRole('button', { name: /Lưu thay đổi/ }));

    expect(profileService.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        gender: 'Nữ',
        travelPreferences: ['Biển đảo'],
        favoriteBudget: 'Trung bình',
        dateOfBirth: null,
      }),
      expect.anything()
    );
    // Store được cập nhật để phần đầu trang hiển thị ngay
    expect(useAuthStore.getState().user?.favoriteBudget).toBe('Trung bình');
  });

  it('báo lỗi khi số điện thoại sai định dạng, không gọi API', async () => {
    renderWithProviders(<SettingsTab user={user} />);

    await userEvent.type(screen.getByLabelText('Số điện thoại'), '12345');
    await userEvent.click(screen.getByRole('button', { name: /Lưu thay đổi/ }));

    expect(await screen.findByText('Số điện thoại gồm 10 chữ số và bắt đầu bằng 0')).toBeInTheDocument();
    expect(profileService.updateProfile).not.toHaveBeenCalled();
  });

  it('nút "Lưu thay đổi" chỉ bật khi form có thay đổi', async () => {
    renderWithProviders(<SettingsTab user={user} />);
    const save = screen.getByRole('button', { name: /Lưu thay đổi/ });
    expect(save).toBeDisabled();

    await userEvent.type(screen.getByLabelText('Họ và tên'), ' Minh');
    expect(save).toBeEnabled();
  });

  it('giới hạn tối đa 6 sở thích', async () => {
    renderWithProviders(<SettingsTab user={user} />);
    const tags = ['Biển đảo', 'Núi rừng', 'Cà phê', 'Thiên nhiên', 'Nghỉ dưỡng']; // + Ẩm thực = 6
    for (const tag of tags) await userEvent.click(screen.getByRole('button', { name: new RegExp(tag) }));

    expect(screen.getByRole('button', { name: /Phiêu lưu/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Biển đảo/ })).toHaveAttribute('aria-pressed', 'true');
  });
});
