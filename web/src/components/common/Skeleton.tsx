import React from 'react';
import { cn } from '../../utils/cn';
import './css/Skeleton.css';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn('ui-skeleton', className)}
      {...props}
    />
  );
};
