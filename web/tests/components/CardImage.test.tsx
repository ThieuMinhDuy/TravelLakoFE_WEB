import { fireEvent, render, screen } from '@testing-library/react';
import { CardImage } from '@/components/cards/CardImage';

describe('CardImage', () => {
  it('link ảnh hỏng → chuyển sang nền mặc định, không hiện ảnh vỡ', () => {
    const { container } = render(
      <CardImage src="https://broken.test/x.jpg" alt="Quảng trường Lâm Viên" className="card__img" fallbackIcon={<span>icon</span>} />
    );
    fireEvent.error(screen.getByRole('img', { name: 'Quảng trường Lâm Viên' }));

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('.card__img--placeholder')).toBeInTheDocument();
  });

  it('không có ảnh → nền mặc định', () => {
    const { container } = render(<CardImage alt="x" className="card__img" fallbackIcon={<span>icon</span>} />);
    expect(container.querySelector('.card__img--placeholder')).toHaveTextContent('icon');
  });
});
