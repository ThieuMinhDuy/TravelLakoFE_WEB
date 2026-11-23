import React, { useMemo } from 'react';
import { CHART_TICKS as TICKS, niceMax, type MonthBucket } from '../../utils/dashboardStats';

interface ColumnChartProps {
  data: MonthBucket[];
  /** Tên đại lượng cho tooltip / trình đọc màn hình, vd "người dùng mới" */
  unit: string;
  /** Mô tả biểu đồ cho trình đọc màn hình */
  ariaLabel: string;
}

/**
 * Biểu đồ cột một chuỗi (một màu nhấn), vẽ bằng HTML/CSS:
 * cột ≤ 24px, bo 4px ở đầu dữ liệu, lưới mảnh; rê chuột / focus vào cột hiện tooltip (giá trị đi trước);
 * chỉ ghi số trên cột tháng gần nhất. Mỗi cột có nhãn đầy đủ cho trình đọc màn hình.
 */
export const ColumnChart: React.FC<ColumnChartProps> = ({ data, unit, ariaLabel }) => {
  const max = useMemo(() => niceMax(Math.max(0, ...data.map((d) => d.value))), [data]);
  const ticks = Array.from({ length: TICKS + 1 }, (_, i) => Math.round((max / TICKS) * (TICKS - i)));
  const lastIndex = data.length - 1;

  return (
    <figure className="admin-chart" role="group" aria-label={ariaLabel}>
      <div className="admin-chart__plot">
        <div className="admin-chart__y" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="admin-chart__area">
          <div className="admin-chart__grid" aria-hidden="true">
            {ticks.map((t) => (
              <span key={t} />
            ))}
          </div>
          <div className="admin-chart__cols">
            {data.map((d, i) => (
              <div
                key={d.key}
                className="admin-chart__slot"
                role="img"
                aria-label={`${d.fullLabel}: ${d.value} ${unit}`}
                // Focus được bằng bàn phím (và chạm trên điện thoại) để xem tooltip như khi rê chuột
                tabIndex={0}
              >
                <span className="admin-chart__bar" style={{ height: `${(d.value / max) * 100}%` }} aria-hidden="true">
                  {i === lastIndex && d.value > 0 && <span className="admin-chart__cap">{d.value}</span>}
                </span>
                <span className="admin-chart__tooltip" aria-hidden="true">
                  <strong>{d.value}</strong> {unit}
                  <span>{d.fullLabel}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="admin-chart__x" aria-hidden="true">
        {data.map((d) => (
          <span key={d.key}>{d.label}</span>
        ))}
      </div>
    </figure>
  );
};
