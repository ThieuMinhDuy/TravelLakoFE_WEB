import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiImageUploader } from '@/components/compound/MultiImageUploader';
import { ToastProvider } from '@/contexts/toast/ToastProvider';
import { uploadService } from '@/services/uploadService';

vi.mock('@/services/uploadService', () => ({ uploadService: { uploadImage: vi.fn() } }));

const Harness = ({ initial = [] as string[], onValue }: { initial?: string[]; onValue?: (v: string[]) => void }) => {
  const [value, setValue] = useState(initial);
  return (
    <ToastProvider>
      <MultiImageUploader
        value={value}
        onChange={(v) => {
          setValue(v);
          onValue?.(v);
        }}
      />
    </ToastProvider>
  );
};

const fileInput = () => document.querySelector('input[type=file]') as HTMLInputElement;
const png = (name: string) => new File(['x'], name, { type: 'image/png' });

describe('MultiImageUploader', () => {
  beforeAll(() => {
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => vi.clearAllMocks());

  it('tải nhiều ảnh song song, giữ đủ mọi ảnh dù xong gần như cùng lúc', async () => {
    vi.mocked(uploadService.uploadImage).mockImplementation(async (file: File) => ({
      message: 'ok',
      url: `https://cdn/${file.name}`,
    }));
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);

    fireEvent.change(fileInput(), { target: { files: [png('a.png'), png('b.png')] } });

    await waitFor(() => expect(onValue).toHaveBeenLastCalledWith(['https://cdn/a.png', 'https://cdn/b.png']));
    expect(screen.getByText('Ảnh bìa')).toBeInTheDocument();
  });

  it('bỏ qua file sai định dạng, không gọi upload', async () => {
    render(<Harness />);
    fireEvent.change(fileInput(), { target: { files: [new File(['x'], 'a.gif', { type: 'image/gif' })] } });
    expect(uploadService.uploadImage).not.toHaveBeenCalled();
  });

  it('đặt ảnh khác làm ảnh bìa và xóa ảnh', async () => {
    const onValue = vi.fn();
    render(<Harness initial={['u1', 'u2', 'u3']} onValue={onValue} />);

    await userEvent.click(screen.getByRole('button', { name: 'Đặt ảnh 3 làm ảnh bìa' }));
    expect(onValue).toHaveBeenLastCalledWith(['u3', 'u1', 'u2']);

    await userEvent.click(screen.getByRole('button', { name: 'Xóa ảnh 2' }));
    expect(onValue).toHaveBeenLastCalledWith(['u3', 'u2']);
  });
});
