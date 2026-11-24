import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OtpInput } from '@/features/auth/components/OtpInput';

const Harness: React.FC<{ onComplete: (v: string) => void }> = ({ onComplete }) => {
  const [value, setValue] = useState('');
  return <OtpInput value={value} onChange={setValue} onComplete={onComplete} autoFocus={false} />;
};

describe('OtpInput', () => {
  it('chỉ nhận chữ số, tối đa 6 ký tự, báo hoàn tất khi đủ 6 số', async () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    const input = screen.getByLabelText('Mã OTP 6 số');

    await userEvent.type(input, '12a3-45678');

    expect(input).toHaveValue('123456');
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('dán cả mã một lần', async () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    const input = screen.getByLabelText('Mã OTP 6 số');

    await userEvent.click(input);
    await userEvent.paste('654 321');

    expect(input).toHaveValue('654321');
    expect(onComplete).toHaveBeenCalledWith('654321');
  });
});
