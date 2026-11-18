import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type Column } from '@/components/compound/DataTable';

interface Row {
  _id: string;
  name: string;
}

const rows = (count: number): Row[] =>
  Array.from({ length: count }, (_, i) => ({ _id: String(i + 1), name: `Mục ${i + 1}` }));

const columns: Column<Row>[] = [{ key: 'name', header: 'Tên' }];

describe('DataTable — phân trang', () => {
  it('lùi về trang cuối còn dữ liệu khi dữ liệu ít đi (thay vì hiện "Không có dữ liệu")', async () => {
    const { rerender } = render(
      <DataTable columns={columns} data={rows(25)} pageSize={10} searchable={false} />
    );

    const next = screen.getByRole('button', { name: 'Trang sau' });
    await userEvent.click(next);
    await userEvent.click(next);
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    expect(screen.getByText('Mục 21')).toBeInTheDocument();

    // Xóa bớt bản ghi / refetch ra ít hơn → chỉ còn 2 trang
    rerender(<DataTable columns={columns} data={rows(12)} pageSize={10} searchable={false} />);

    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    expect(screen.getByText('Mục 11')).toBeInTheDocument();
    expect(screen.queryByText('Không có dữ liệu')).not.toBeInTheDocument();
  });

  it('tìm kiếm đưa về trang 1', async () => {
    render(<DataTable columns={columns} data={rows(25)} pageSize={10} searchKeys={['name']} />);

    await userEvent.click(screen.getByRole('button', { name: 'Trang sau' }));
    await userEvent.type(screen.getByPlaceholderText('Tìm kiếm...'), 'Mục 2');

    // "Mục 2", "Mục 20".."Mục 25" = 7 kết quả → 1 trang, không còn thanh phân trang
    expect(screen.getByText('Mục 2')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Trang sau' })).not.toBeInTheDocument();
  });
});
