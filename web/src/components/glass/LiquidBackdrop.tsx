import React from 'react';
import './css/LiquidBackdrop.css';

/**
 * Nền phía sau các tấm kính: nền xám xanh trung tính + 2 vầng sáng rất nhạt trôi chậm.
 * Đủ để kính có chiều sâu nhưng không lấn át nội dung (màu chỉ dùng cho thông tin quan trọng).
 * Chỉ animate transform (GPU), dừng hẳn khi người dùng bật giảm chuyển động.
 */
export const LiquidBackdrop: React.FC = () => (
  <div className="liquid-backdrop" aria-hidden="true">
    <span className="liquid-backdrop__blob liquid-backdrop__blob--primary" />
    <span className="liquid-backdrop__blob liquid-backdrop__blob--neutral" />
  </div>
);
