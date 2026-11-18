import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/common/Button';

describe('Button', () => {
  it('mặc định type="button" → không vô tình submit form', async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button>Đổi ảnh đại diện</Button>
      </form>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Đổi ảnh đại diện' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('type="submit" thì submit form', async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Lưu</Button>
      </form>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('đang loading thì bị vô hiệu hóa', () => {
    render(<Button isLoading>Đang lưu</Button>);
    expect(screen.getByRole('button', { name: 'Đang lưu' })).toBeDisabled();
  });
});
