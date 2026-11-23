import React, { Suspense, lazy } from 'react';
import { Skeleton } from '../common/Skeleton';
import type { MapPickerProps } from './MapPicker';

export type { LatLng, MapPickerProps } from './MapPicker';

/** Leaflet (~150 KB) chỉ tải khi form thật sự hiển thị bản đồ */
const MapPickerImpl = lazy(() => import('./MapPicker'));

export const MapPicker: React.FC<MapPickerProps> = (props) => (
  <Suspense fallback={<Skeleton className="map-picker-skeleton h-60 w-full rounded-2xl" />}>
    <MapPickerImpl {...props} />
  </Suspense>
);
