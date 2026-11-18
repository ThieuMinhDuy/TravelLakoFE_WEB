import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer } from '@/components/common/Drawer';

describe('Drawer', () => {
  it('khi đóng: không thể tương tác (inert) và không khóa cuộn trang', () => {
    render(
      <Drawer open={false} onClose={vi.fn()} title="Menu">
        <a href="/cities">Điểm đến</a>
      </Drawer>
    );
    const root = document.querySelector('.ui-drawer');
    expect(root).toHaveAttribute('inert');
    expect(document.body.style.overflow).toBe('');
  });

  it('khi mở: là dialog có tiêu đề, khóa cuộn, focus nằm trong drawer', () => {
    render(
      <Drawer open onClose={vi.fn()} title="Menu">
        <a href="/cities">Điểm đến</a>
      </Drawer>
    );
    const dialog = screen.getByRole('dialog', { name: 'Menu' });
    expect(dialog).toBeInTheDocument();
    expect(document.querySelector('.ui-drawer')).not.toHaveAttribute('inert');
    expect(document.body.style.overflow).toBe('hidden');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('đóng bằng phím Esc, nút đóng hoặc bấm ra nền', async () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="Menu">
        <p>Nội dung</p>
      </Drawer>
    );

    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    await userEvent.click(document.querySelector('.ui-drawer__backdrop')!);
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
