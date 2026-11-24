import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import './css/Avatar.css';

export interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/** Ảnh đại diện; không có ảnh hoặc ảnh lỗi → hiện chữ cái đầu của tên */
export const Avatar: React.FC<AvatarProps> = ({ name = '', src, size = 'md', className }) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = !!src && failedSrc !== src;
  const initial = name.trim().charAt(0).toUpperCase() || 'U';

  return (
    <span className={cn('ui-avatar', `ui-avatar--${size}`, className)}>
      {showImage ? (
        <img src={src} alt={name} className="ui-avatar__img" onError={() => setFailedSrc(src)} />
      ) : (
        <span className="ui-avatar__initial" aria-label={name || undefined}>
          {initial}
        </span>
      )}
    </span>
  );
};
