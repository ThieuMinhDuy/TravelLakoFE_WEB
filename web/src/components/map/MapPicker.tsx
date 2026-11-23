import React, { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './css/MapPicker.css';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapPickerProps {
  /** Vị trí đang chọn; null/không hợp lệ → chưa chọn */
  value: Partial<LatLng> | null | undefined;
  onChange: (value: LatLng) => void;
  /** Tâm bản đồ khi chưa có vị trí (vd: tọa độ thành phố của địa điểm) */
  fallbackCenter?: LatLng;
  /** Mức zoom khi đã có vị trí */
  zoom?: number;
  className?: string;
  ariaLabel?: string;
}

/** Tâm Việt Nam — dùng khi chưa có vị trí lẫn tâm dự phòng */
const VIETNAM_CENTER: LatLng = { lat: 16.05, lng: 107.5 };
const VIETNAM_ZOOM = 5;

const isLatLng = (v: Partial<LatLng> | null | undefined): v is LatLng =>
  !!v && Number.isFinite(v.lat) && Number.isFinite(v.lng);

/** Làm tròn 6 chữ số thập phân (~0,1 m) — đủ chính xác, số gọn khi hiển thị */
const round = (n: number) => Math.round(n * 1e6) / 1e6;

/**
 * Ghim dạng divIcon (HTML + CSS) thay cho icon ảnh mặc định của Leaflet:
 * icon ảnh mặc định bị vỡ đường dẫn khi đóng gói bằng Vite.
 */
const PIN_ICON = L.divIcon({
  className: 'map-picker__pin',
  html: '<span class="map-picker__pin-head"></span><span class="map-picker__pin-shadow"></span>',
  iconSize: [28, 40],
  iconAnchor: [14, 38],
});

/** Bấm lên bản đồ → đặt ghim tại đó */
const ClickToPick: React.FC<{ onPick: (v: LatLng) => void }> = ({ onPick }) => {
  useMapEvents({
    click: (e) => onPick({ lat: round(e.latlng.lat), lng: round(e.latlng.lng) }),
  });
  return null;
};

/**
 * Đồng bộ bản đồ với giá trị từ bên ngoài (gõ tọa độ, chọn thành phố...):
 * chỉ di chuyển khi vị trí nằm ngoài khung nhìn, để không giật khi người dùng tự kéo ghim.
 * Đồng thời cập nhật kích thước khi khung chứa đổi cỡ (mở drawer, xoay màn hình).
 */
const SyncView: React.FC<{ target: LatLng | null; zoom: number }> = ({ target, zoom }) => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  const lat = target?.lat;
  const lng = target?.lng;
  useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    if (!map.getBounds().pad(-0.1).contains([lat, lng])) {
      map.setView([lat, lng], Math.max(map.getZoom(), zoom), { animate: true });
    }
  }, [map, lat, lng, zoom]);

  return null;
};

/** Khi đổi tâm dự phòng (vd: chọn thành phố khác) mà chưa có ghim → bay tới đó */
const FollowFallback: React.FC<{ center: LatLng | undefined; active: boolean }> = ({ center, active }) => {
  const map = useMap();
  const lat = center?.lat;
  const lng = center?.lng;
  useEffect(() => {
    if (active && lat !== undefined && lng !== undefined) map.setView([lat, lng], 12, { animate: true });
  }, [map, lat, lng, active]);
  return null;
};

/**
 * Chọn tọa độ trên bản đồ OpenStreetMap: bấm để đặt ghim, kéo ghim để chỉnh.
 * Dùng kèm ô nhập lat/lng để có thể gõ trực tiếp (hai chiều đồng bộ).
 */
const MapPicker: React.FC<MapPickerProps> = ({
  value,
  onChange,
  fallbackCenter,
  zoom = 13,
  className,
  ariaLabel = 'Bản đồ chọn vị trí',
}) => {
  const position = isLatLng(value) ? value : null;
  const markerRef = useRef<L.Marker>(null);

  // Tâm & zoom ban đầu chỉ dùng lúc khởi tạo (MapContainer không phản ứng khi prop đổi)
  const initial = useMemo(
    () =>
      position
        ? { center: position, zoom }
        : fallbackCenter
          ? { center: fallbackCenter, zoom: 12 }
          : { center: VIETNAM_CENTER, zoom: VIETNAM_ZOOM },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ tính một lần khi mount
    []
  );

  const markerHandlers = useMemo(
    () => ({
      dragend: () => {
        const latlng = markerRef.current?.getLatLng();
        if (latlng) onChange({ lat: round(latlng.lat), lng: round(latlng.lng) });
      },
    }),
    [onChange]
  );

  return (
    <div className={['map-picker', className].filter(Boolean).join(' ')} role="group" aria-label={ariaLabel}>
      <MapContainer center={initial.center} zoom={initial.zoom} scrollWheelZoom className="map-picker__map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickToPick onPick={onChange} />
        <SyncView target={position} zoom={zoom} />
        <FollowFallback center={fallbackCenter} active={!position} />
        {position && (
          <Marker
            ref={markerRef}
            position={[position.lat, position.lng]}
            draggable
            icon={PIN_ICON}
            eventHandlers={markerHandlers}
            keyboard={false}
          />
        )}
      </MapContainer>
      <p className="map-picker__hint">
        {position ? 'Kéo ghim hoặc bấm vị trí khác để chỉnh.' : 'Bấm lên bản đồ để đặt vị trí.'}
      </p>
    </div>
  );
};

export default MapPicker;
