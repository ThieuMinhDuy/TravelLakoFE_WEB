import React, { useState } from 'react';
import { cn } from '../../utils/cn';

interface CardImageProps {
  src?: string;
  alt: string;
  className: string;
  /** Icon hiển thị khi không có ảnh hoặc ảnh tải lỗi */
  fallbackIcon: React.ReactNode;
}

/** Ảnh của thẻ: không có ảnh hoặc link ảnh hỏng → nền mặc định kèm icon (không hiện chữ alt vỡ) */
export const CardImage: React.FC<CardImageProps> = ({ src, alt, className, fallbackIcon }) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div className={cn(className, 'card__img--placeholder')} aria-hidden="true">
        {fallbackIcon}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
};
