import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '@/components/compound/Tabs';

const renderTabs = (onValueChange = vi.fn()) =>
  render(
    <Tabs defaultValue="upcoming" onValueChange={onValueChange}>
      <Tabs.List aria-label="Trạng thái chuyến đi">
        <Tabs.Tab value="upcoming" badge={3}>
          Sắp đi
        </Tabs.Tab>
        <Tabs.Tab value="ongoing">Đang đi</Tabs.Tab>
        <Tabs.Tab value="past">Lịch sử</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="upcoming">Danh sách sắp đi</Tabs.Panel>
      <Tabs.Panel value="ongoing">Danh sách đang đi</Tabs.Panel>
      <Tabs.Panel value="past">Danh sách lịch sử</Tabs.Panel>
    </Tabs>
  );

describe('Tabs (Compound Component)', () => {
  it('nối đúng ARIA giữa tab và panel, chỉ render panel đang chọn', () => {
    renderTabs();

    expect(screen.getByRole('tablist', { name: 'Trạng thái chuyến đi' })).toBeInTheDocument();
    const tab = screen.getByRole('tab', { name: /Sắp đi/ });
    expect(tab).toHaveAttribute('aria-selected', 'true');

    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveTextContent('Danh sách sắp đi');
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(screen.queryByText('Danh sách đang đi')).not.toBeInTheDocument();
  });

  it('bấm tab để chuyển panel và báo onValueChange', async () => {
    const onValueChange = vi.fn();
    renderTabs(onValueChange);

    await userEvent.click(screen.getByRole('tab', { name: 'Lịch sử' }));

    expect(screen.getByRole('tabpanel')).toHaveTextContent('Danh sách lịch sử');
    expect(onValueChange).toHaveBeenCalledWith('past');
  });

  it('điều hướng bằng phím mũi tên / Home / End (roving tabindex)', async () => {
    renderTabs();
    const [upcoming, ongoing, past] = screen.getAllByRole('tab');

    // Chỉ tab đang chọn nằm trong thứ tự Tab
    expect(upcoming).toHaveAttribute('tabindex', '0');
    expect(ongoing).toHaveAttribute('tabindex', '-1');

    upcoming.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(ongoing).toHaveFocus();
    expect(ongoing).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{End}');
    expect(past).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}'); // vòng về đầu
    expect(upcoming).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Danh sách sắp đi');
  });

  it('dùng Tabs.Tab ngoài <Tabs> sẽ báo lỗi rõ ràng', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Tabs.Tab value="x">X</Tabs.Tab>)).toThrow('<Tabs.Tab> phải nằm bên trong <Tabs>');
  });
});
