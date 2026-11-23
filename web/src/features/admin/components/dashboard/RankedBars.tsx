import React from 'react';
import { Link } from 'react-router-dom';
import type { RankedItem } from '../../utils/dashboardStats';

interface RankedBarsProps {
  items: RankedItem[];
  /** Đơn vị đọc cho trình đọc màn hình, vd "đánh giá" */
  unit: string;
  emptyText?: string;
}

/**
 * Danh sách xếp hạng: tên · thanh ngang (một màu) · số ở cuối thanh.
 * Các thanh chung một gốc nên so sánh chính xác hơn biểu đồ tròn.
 */
export const RankedBars: React.FC<RankedBarsProps> = ({ items, unit, emptyText = 'Chưa có dữ liệu' }) => {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length || items.every((i) => i.value === 0)) {
    return <p className="admin-ranked__empty">{emptyText}</p>;
  }

  return (
    <ul className="admin-ranked">
      {items.map((item) => {
        const content = (
          <>
            <span className="admin-ranked__label">{item.label}</span>
            <span className="admin-ranked__track" aria-hidden="true">
              <span className="admin-ranked__bar" style={{ width: `${(item.value / max) * 100}%` }} />
            </span>
            <span className="admin-ranked__value">{item.value}</span>
            <span className="sr-only">{unit}</span>
          </>
        );
        return (
          <li key={item.key}>
            {item.href ? (
              <Link to={item.href} className="admin-ranked__row admin-ranked__row--link">
                {content}
              </Link>
            ) : (
              <span className="admin-ranked__row">{content}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
};
