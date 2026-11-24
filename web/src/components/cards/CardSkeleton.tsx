import React from 'react';
import { Skeleton } from '../common/Skeleton';
import './css/Cards.css';

/** Khung chờ của một thẻ khi đang tải dữ liệu */
export const CardSkeleton: React.FC = () => (
  <div className="card-skeleton" aria-hidden="true">
    <Skeleton className="card-skeleton__media" />
    <div className="card-skeleton__body">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-5 w-1/3" />
    </div>
  </div>
);

/** Lưới các thẻ chờ */
export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="card-grid" role="status" aria-label="Đang tải">
    {Array.from({ length: count }, (_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);
