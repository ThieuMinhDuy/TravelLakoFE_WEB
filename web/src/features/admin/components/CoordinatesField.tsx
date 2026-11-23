import React, { useId, useState } from 'react';
import { Input } from '../../../components/common/Input';
import { MapPicker, type LatLng } from '../../../components/map';

type PartialLatLng = Partial<LatLng> | undefined;

interface CoordinatesFieldProps {
  value: PartialLatLng;
  onChange: (value: PartialLatLng) => void;
  errors?: { lat?: string; lng?: string };
  /** Tâm bản đồ khi chưa có tọa độ */
  fallbackCenter?: LatLng;
  /** Nút phụ cạnh tiêu đề (vd: "Lấy tọa độ của thành phố") */
  action?: React.ReactNode;
}

const format = (n: number | undefined) => (n === undefined || !Number.isFinite(n) ? '' : String(n));

/** "11,94" hoặc "11.94" → 11.94; rỗng / sai → undefined (zod sẽ báo lỗi) */
const parse = (text: string): number | undefined => {
  const trimmed = text.trim().replace(',', '.');
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
};

/**
 * Tọa độ: bản đồ + 2 ô nhập, đồng bộ hai chiều.
 * Ô nhập giữ chuỗi người dùng đang gõ (vd: "11.") để không bị nhảy giá trị giữa chừng.
 */
export const CoordinatesField: React.FC<CoordinatesFieldProps> = ({
  value,
  onChange,
  errors,
  fallbackCenter,
  action,
}) => {
  const id = useId();
  const [draft, setDraft] = useState({ lat: format(value?.lat), lng: format(value?.lng) });

  // Giá trị đổi từ bên ngoài (bấm bản đồ, lấy tọa độ thành phố) → cập nhật ô nhập
  const [seen, setSeen] = useState(value);
  if (seen?.lat !== value?.lat || seen?.lng !== value?.lng) {
    setSeen(value);
    setDraft((d) => ({
      lat: parse(d.lat) === value?.lat ? d.lat : format(value?.lat),
      lng: parse(d.lng) === value?.lng ? d.lng : format(value?.lng),
    }));
  }

  const onType = (key: 'lat' | 'lng') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setDraft((d) => ({ ...d, [key]: text }));
    onChange({ ...value, [key]: parse(text) });
  };

  return (
    <fieldset className="admin-coords">
      <legend className="admin-coords__head">
        <span className="ui-input-label">
          Vị trí trên bản đồ<span className="ui-input-required">*</span>
        </span>
        {action}
      </legend>
      <MapPicker value={value} onChange={onChange} fallbackCenter={fallbackCenter} />
      <div className="admin-coords__inputs">
        <Input
          id={`${id}-lat`}
          label="Vĩ độ (lat)"
          inputMode="decimal"
          placeholder="vd: 11.9404"
          value={draft.lat}
          onChange={onType('lat')}
          error={errors?.lat}
          autoComplete="off"
        />
        <Input
          id={`${id}-lng`}
          label="Kinh độ (lng)"
          inputMode="decimal"
          placeholder="vd: 108.4583"
          value={draft.lng}
          onChange={onType('lng')}
          error={errors?.lng}
          autoComplete="off"
        />
      </div>
    </fieldset>
  );
};
