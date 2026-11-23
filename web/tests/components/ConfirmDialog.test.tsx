import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '@/components/compound/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('requireText: chỉ cho xác nhận khi gõ đúng chuỗi (không phân biệt hoa thường)', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        onClose={() => undefined}
        onConfirm={onConfirm}
        title="Xóa tài khoản"
        message="Không thể hoàn tác"
        confirmText="Xóa vĩnh viễn"
        requireText="khach@gmail.com"
      />
    );
    const confirm = screen.getByRole('button', { name: 'Xóa vĩnh viễn' });
    expect(confirm).toBeDisabled();

    await userEvent.type(screen.getByLabelText('Gõ "khach@gmail.com" để xác nhận'), 'khach@gmail');
    expect(confirm).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/để xác nhận/), '.COM');
    expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('không có requireText → bấm xác nhận được ngay', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog isOpen onClose={() => undefined} onConfirm={onConfirm} title="Khóa" message="Khóa user?" />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
